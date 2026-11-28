#!/usr/bin/env node
/* ===== LE SIMULATEUR : LES TABLEAUX (27/11/2026, l'etude « simulateur ») =====
   node resumer.js <plan>   lit resultats/<plan>-*.json (ecrits par etudes.js), ecrit resultats/<plan>.txt et l'affiche.
   Les chiffres sont des valeurs VRAIES (cachees a la selection), en ecart au temoin : dP = palier vrai gagne, dE = ecart aux joueurs vrai
   (negatif = plus ressemblant), F4 = dP − 4·dE. Mediane [10 % ; 90 %] sur les mondes. */
'use strict';
const fs=require('fs'),path=require('path');
const plan=process.argv[2];
const dir=path.join(__dirname,'resultats');
const R=[];for(const f of fs.readdirSync(dir))if(new RegExp('^'+plan+'-\\d+\\.json$').test(f))R.push(...JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')));
if(!R.length){console.error('aucun resultat pour '+plan);process.exit(1);}
const q=(A,p)=>{const B=A.filter(x=>x!=null&&isFinite(x)).sort((a,b)=>a-b);if(!B.length)return NaN;const i=p*(B.length-1),lo=Math.floor(i),hi=Math.ceil(i);return B[lo]+(B[hi]-B[lo])*(i-lo);};
const med=A=>q(A,.5),moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const f=(x,d)=>isFinite(x)?(x>=0?' ':'')+x.toFixed(d==null?2:d):'  -';
const iq=(A,d)=>f(med(A),d)+' ['+f(q(A,.1),d).trim()+' ; '+f(q(A,.9),d).trim()+']';
const groupes=new Map();for(const r of R){if(!groupes.has(r.nom))groupes.set(r.nom,[]);groupes.get(r.nom).push(r);}
const lignes=[];const dire=t=>{lignes.push(t);};
const pt=(r,b)=>r.points.find(p=>p.budget===b);
const F4=p=>p.champion.dP-4*p.champion.dE;

if(plan==='principal'||plan==='etroit'){
  dire('Q1 : LA VRAIE CONFIGURATION (20 vivants, 6 naissances, 12 graines, seuilSacre 2, 24 graines de validation) — '+R.length+' evolutions');
  dire('valeurs vraies en ecart au temoin ; mediane [10 % ; 90 %] sur les mondes ; jours = temps reel au debit indique (les courses s\'allongent quand le palier monte)');
  for(const [nom,G] of groupes){
    dire('\n'+nom+' ('+G.length+' mondes ; plafond median '+f(med(G.map(r=>r.points[0].plafond)))+' palier)');
    dire('courses  | gen. | jours        | champion dP           | champion dE            | champion F4           | meilleur vivant dP    | meneur dP             | pop. dP | sacres (faux) | champion < temoin | champion = temoin | graines/gen');
    for(const b of [10000,50000,200000]){
      const P=G.map(r=>pt(r,b)).filter(Boolean);if(!P.length)continue;
      const sac=P.reduce((s,p)=>s+p.sacres,0),faux=P.reduce((s,p)=>s+p.fauxSacres,0);
      dire(String(b).padEnd(8)+' | '+f(med(P.map(p=>p.G)),0).padStart(4)+' | '+iq(P.map(p=>p.heures/24),1).padEnd(12)+' | '+iq(P.map(p=>p.champion.dP)).padEnd(21)+' | '+iq(P.map(p=>p.champion.dE),3).padEnd(22)+' | '+
        iq(P.map(F4)).padEnd(21)+' | '+iq(P.map(p=>p.meilleurVivantP)).padEnd(21)+' | '+iq(P.map(p=>p.meneur?p.meneur.dP:NaN)).padEnd(21)+' | '+f(med(P.map(p=>p.populationP))).padStart(7)+' | '+
        (f(sac/P.length,1)+' ('+faux+'/'+sac+')').padEnd(13)+' | '+(Math.round(100*P.filter(p=>p.championPireQueTemoin).length/P.length)+' %').padStart(17)+' | '+
        (Math.round(100*P.filter(p=>p.champion.temoin).length/P.length)+' %').padStart(17)+' | '+med(P.map(p=>p.nGraines)));
    }
  }
}else if(plan==='sensibilite'||plan==='ensemble'){
  const B=plan==='ensemble'?[50000,200000]:[10000,50000];
  dire((plan==='ensemble'?'Q2 : LES MEILLEURS REGLAGES ENSEMBLE':'Q2 : UN REGLAGE A LA FOIS')+' — '+R.length+' evolutions, debit 400/h'+(plan==='sensibilite'?', economie de graines coupee':''));
  dire('gain VRAI en F4 (dP − 4·dE) du champion et du meilleur vivant ; « ecart au defaut » = difference APPARIEE (memes mondes) ± erreur-type ; mediane [10 % ; 90 %]');
  for(const s of ['pessimiste','moyen','optimiste']){
    const noms=[...groupes.keys()].filter(n=>n.startsWith(s+' |'));
    const def=groupes.get(noms[0]);
    for(const b of B){
      dire('\n'+s+' — a '+b+' courses');
      dire('reglage                          | gen. | jours a 400/h | champion F4          | ecart au defaut (champion) | meilleur vivant F4   | ecart au defaut (meilleur) | champion dP | sacres (faux) | champion < temoin');
      for(const n of noms){
        const G=groupes.get(n),P=G.map(r=>pt(r,b)).filter(Boolean);if(!P.length)continue;
        const app=(fn)=>{const D=[];for(const r of G){const d=def.find(x=>x.k===r.k);if(!d)continue;const a=pt(r,b),c=pt(d,b);if(a&&c)D.push(fn(a)-fn(c));}
          const m=moy(D),se=Math.sqrt(D.reduce((t,x)=>t+(x-m)*(x-m),0)/Math.max(1,D.length-1)/D.length);return f(m)+' ± '+se.toFixed(2);};
        const sac=P.reduce((t,p)=>t+p.sacres,0),faux=P.reduce((t,p)=>t+p.fauxSacres,0);
        dire(n.slice(s.length+3).padEnd(32)+' | '+f(med(P.map(p=>p.G)),0).padStart(4)+' | '+f(med(P.map(p=>p.heures/24)),1).padStart(13)+' | '+iq(P.map(F4)).padEnd(20)+' | '+app(F4).padEnd(26)+' | '+
          iq(P.map(p=>p.meilleurVivantF+0)).padEnd(20)+' | '+app(p=>p.meilleurVivantF).padEnd(26)+' | '+f(med(P.map(p=>p.champion.dP))).padStart(11)+' | '+(f(sac/P.length,1)+' ('+faux+'/'+sac+')').padEnd(13)+' | '+
          (Math.round(100*P.filter(p=>p.championPireQueTemoin).length/P.length)+' %'));
      }
    }
  }
  dire('\n(meilleur vivant F4 : dans le plan « note » et ici, le F vrai du meilleur vivant est calcule avec le poids de la note du reglage, 4 sauf mention)');
}else if(plan==='note'){
  dire('Q3 : CE QUE LA NOTE F = palier − poids·E FAIT A LA SELECTION — '+R.length+' evolutions, 50 000 courses, debit 400/h');
  dire('dP = palier vrai gagne par le champion, dE = E vrai gagne (negatif = plus ressemblant) ; meilleur vivant au sens du F vrai du reglage');
  dire('scenario | loi de E     | poids | champion dP           | champion dE             | champion F4 (dP−4dE)  | meilleur vivant dP | meilleur vivant dE | sacres (faux)');
  for(const [nom,G] of groupes){
    const P=G.map(r=>pt(r,50000)).filter(Boolean);const [s,e,p]=nom.split(' | ');
    const sac=P.reduce((t,x)=>t+x.sacres,0),faux=P.reduce((t,x)=>t+x.fauxSacres,0);
    dire(s.padEnd(10)+' | '+e.slice(2).padEnd(12)+' | '+p.slice(6).padStart(5)+' | '+iq(P.map(x=>x.champion.dP)).padEnd(21)+' | '+iq(P.map(x=>x.champion.dE),3).padEnd(23)+' | '+iq(P.map(F4)).padEnd(21)+' | '+
      f(med(P.map(x=>x.meilleurVivantFdP))).padStart(18)+' | '+f(med(P.map(x=>x.meilleurVivantFdE)),3).padStart(18)+' | '+f(sac/P.length,1)+' ('+faux+'/'+sac+')');
  }
}else if(plan==='nul'){
  dire('FAUX SACRES DANS UN MONDE SANS EFFET (tous les pilotes valent le temoin) — '+R.length+' evolutions de 50 000 courses');
  dire('reglage                       | validations | sacres | faux sacres par validation');
  for(const [nom,G] of groupes){const P=G.map(r=>pt(r,50000));const v=P.reduce((t,x)=>t+x.validations,0),s=P.reduce((t,x)=>t+x.sacres,0);
    const p=v?s/v:0,se=v?Math.sqrt(p*(1-p)/v):0;
    dire(nom.slice(6).padEnd(29)+' | '+String(v).padStart(11)+' | '+String(s).padStart(6)+' | '+(100*p).toFixed(1)+' % ± '+(100*se).toFixed(1));}
}
const t=lignes.join('\n')+'\n';
/* (28/11, Fable) « nul.txt » est un nom reserve de Windows que git ne sait pas ranger : le monde nul s'ecrit monde-nul.txt */
fs.writeFileSync(path.join(dir,(plan==='nul'?'monde-nul':plan)+'.txt'),t);process.stdout.write(t);
