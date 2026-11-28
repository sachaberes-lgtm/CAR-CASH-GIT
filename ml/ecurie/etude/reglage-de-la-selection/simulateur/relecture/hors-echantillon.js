#!/usr/bin/env node
/* ===== RELECTURE DE L'ETUDE « SIMULATEUR » : REPRODUIRE ET REJOUER HORS ECHANTILLON (28/11/2026, le relecteur) =====
   node relecture/hors-echantillon.js reproduire
     rejoue la vraie configuration, scenario moyen, 400/h, sur les MEMES mondes que resultats/principal.txt (graines 1000 a 1009) et compare
     les medianes a 10 000 et 50 000 courses (attendu : champion dP 0,30 et 0,99 ; F4 0,41 et 1,22).
   node relecture/hors-echantillon.js r3 <scenario> <premier> <nombre>
     la proposition R3 (rejouer seulement les jeunes, le temoin, le champion et les 4 meilleurs) contre le defaut, economie coupee, 400/h,
     50 000 courses, sur des mondes NEUFS (graines 7000 + k) : ni l'auteur ni la selection des reglages ne les ont vus. Le plan « ensemble »
     de l'auteur reprend les mondes 1000 a 1007 deja vus par le plan « sensibilite » qui a servi a CHOISIR les reglages : c'est la fuite que
     ce script contourne. Ecrit relecture/r3-<scenario>-<premier>.json. Un seul processus, < 5 min par appel. */
'use strict';
const fs=require('fs'),path=require('path');
const S=require(path.join(__dirname,'..','simuler.js'));
const A=process.argv.slice(2);
const med=X=>{const B=X.slice().sort((a,b)=>a-b),i=(B.length-1)/2;return (B[Math.floor(i)]+B[Math.ceil(i)])/2;};
const F4=p=>p.champion.dP-4*p.champion.dE;
const t0=Date.now();
if(A[0]==='reproduire'){
  const P10=[],P50=[];
  for(let k=0;k<10;k++){const r=S.evoluer({scenario:'moyen',graine:1000+k,debit:400,cfg:{},budgets:[10000,50000]});P10.push(r.points[0]);P50.push(r.points[1]);}
  console.log('moyen 400/h, mondes 1000-1009 : champion dP '+med(P10.map(p=>p.champion.dP)).toFixed(2)+' / '+med(P50.map(p=>p.champion.dP)).toFixed(2)+
    ' ; F4 '+med(P10.map(F4)).toFixed(2)+' / '+med(P50.map(F4)).toFixed(2)+' ; generations '+med(P50.map(p=>p.G))+' ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
}else if(A[0]==='r3'){
  const sc=A[1],d=+A[2],n=+A[3],out=[];
  for(let k=d;k<d+n;k++){
    const a=S.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:{economie:false},budgets:[50000]}).points[0];
    const b=S.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:{economie:false,rejouer:4},budgets:[50000]}).points[0];
    out.push({k,defaut:{F4:F4(a),mv:a.meilleurVivantF,G:a.G},r3:{F4:F4(b),mv:b.meilleurVivantF,G:b.G}});
  }
  fs.writeFileSync(path.join(__dirname,'r3-'+sc+'-'+d+'.json'),JSON.stringify(out)+'\n');
  console.log(sc+' mondes '+(7000+d)+'..'+(7000+d+n-1)+' : '+out.length+' paires ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
}else if(A[0]==='d'){
  /* node relecture/hors-echantillon.js d <scenario> <premier> <nombre> [budget] : l'ensemble D (rejouer 4, poissonMutations 4, intervalle 2) et
     poissonMutations 4 seul, contre le defaut, avec l'economie de graines (comme le plan « ensemble »), 400/h, mondes neufs 7000+k */
  const sc=A[1],d=+A[2],n=+A[3],B=+(A[4]||50000),out=[];
  const D={rejouer:4,poissonMutations:4,validation:{intervalle:2}};
  for(let k=d;k<d+n;k++){
    const a=S.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:{},budgets:[B]}).points[0];
    const b=S.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:D,budgets:[B]}).points[0];
    const c=B<=50000?S.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:{poissonMutations:4},budgets:[B]}).points[0]:null;
    out.push({k,defaut:{F4:F4(a),mv:a.meilleurVivantF,G:a.G},D:{F4:F4(b),mv:b.meilleurVivantF,G:b.G},p4:c?{F4:F4(c),mv:c.meilleurVivantF}:null});
  }
  fs.writeFileSync(path.join(__dirname,'d-'+sc+'-'+B+'-'+d+'.json'),JSON.stringify(out)+'\n');
  console.log('D '+sc+' '+B+' mondes '+(7000+d)+'..'+(7000+d+n-1)+' ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
}else if(A[0]==='bilan-d'){
  const st=X=>{const m=X.reduce((s,x)=>s+x,0)/X.length,se=Math.sqrt(X.reduce((s,x)=>s+(x-m)*(x-m),0)/(X.length-1)/X.length);return m.toFixed(2)+' ± '+se.toFixed(2);};
  const lignes=[];
  for(const f of fs.readdirSync(__dirname).filter(f=>/^d-.*\.json$/.test(f)).sort()){
    const D=JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8'));
    lignes.push(f.replace(/\.json$/,'').padEnd(26)+' | '+String(D.length).padStart(6)+' | D : '+st(D.map(x=>x.D.F4-x.defaut.F4)).padEnd(13)+' (meilleur vivant '+st(D.map(x=>x.D.mv-x.defaut.mv))+')'+
      (D[0].p4?' | poissonMutations 4 seul : '+st(D.map(x=>x.p4.F4-x.defaut.F4)):''));
  }
  const t='ENSEMBLE D ET poissonMutations 4 CONTRE LE DEFAUT, ECART APPARIE DU F4 VRAI DU CHAMPION, MONDES NEUFS (graines 7000+k), 400/h, economie active\n'+
    'fichier (d-scenario-budget-premier) | mondes | ecarts\n'+lignes.join('\n')+'\n';
  fs.writeFileSync(path.join(__dirname,'d-hors-echantillon.txt'),t);process.stdout.write(t);
}else if(A[0]==='bilan'){
  const lignes=[];
  for(const sc of ['pessimiste','moyen','optimiste']){
    const D=[];for(const f of fs.readdirSync(__dirname))if(f.startsWith('r3-'+sc+'-')&&f.endsWith('.json'))D.push(...JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')));
    if(!D.length)continue;
    const st=X=>{const m=X.reduce((s,x)=>s+x,0)/X.length,se=Math.sqrt(X.reduce((s,x)=>s+(x-m)*(x-m),0)/(X.length-1)/X.length);return m.toFixed(2)+' ± '+se.toFixed(2);};
    lignes.push(sc.padEnd(10)+' | '+String(D.length).padStart(6)+' | '+st(D.map(x=>x.r3.F4-x.defaut.F4)).padEnd(14)+' | '+st(D.map(x=>x.r3.mv-x.defaut.mv)).padEnd(14)+' | '+
      med(D.map(x=>x.defaut.G))+' -> '+med(D.map(x=>x.r3.G))+' | defaut F4 median '+med(D.map(x=>x.defaut.F4)).toFixed(2)+', R3 '+med(D.map(x=>x.r3.F4)).toFixed(2));
  }
  const t='R3 (rejouer jeunes + 4) CONTRE LE DEFAUT, 50 000 COURSES, 400/h, ECONOMIE COUPEE, MONDES NEUFS (graines 7000+k)\n'+
    'scenario   | mondes | ecart champion F4 | ecart meilleur vivant F | generations\n'+lignes.join('\n')+'\n';
  fs.writeFileSync(path.join(__dirname,'r3-hors-echantillon.txt'),t);process.stdout.write(t);
}
