/* CONTRÔLE ADVERSE — attaque 3 : la mémoire du sac
     node mem.cjs carte=jade|espace [quoi=frais,longue,fige,deux] [paliers=0,27] [nl=1000]
   frais  : 50 « premiers lancements » (sac vide) × 5 routes
   longue : une séance de nl routes de suite (cycles, redites après débordement des 400, modules qui disparaissent, taille du localStorage)
   fige   : ?pistegraine= (le sac sans mémoire) : même graine = même route, quel que soit l'historique ; graines voisines n, n+1
   deux   : la même graine générée deux fois (pré-bâti puis vrai départ / REJOUER), puis A, B, A, et A après 13 autres */
const fs=require('fs'),path=require('path'),L=require('./lib.cjs'),crypto=require('crypto');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','jade'),Q=arg('quoi','frais,longue,fige,deux').split(','),PAL=arg('paliers','0,27').split(',').map(Number),NL=+arg('nl','1000');
const OUT=[];const say=s=>{OUT.push(s);console.log(s);};
const hash=r=>crypto.createHash('sha1').update(JSON.stringify(r.ctrl)+JSON.stringify(r.mods)).digest('hex').slice(0,10);
function d3(a,b,w){const A=L.resample(a,25),B=L.resample(b,25),K=Math.min(A.n,B.n,Math.round(w/25)+1);let q=0,qm=0;for(let k=0;k<K;k++){const dy=A.Y[k]-B.Y[k],dz=A.Z[k]-B.Z[k];q+=(A.X[k]-B.X[k])**2+dy*dy+dz*dz;qm+=(A.X[k]+B.X[k])**2+dy*dy+dz*dz;}return Math.min(Math.sqrt(q/K),Math.sqrt(qm/K));}
const med=a=>{const b=a.slice().sort((x,y)=>x-y);return b[Math.floor(b.length/2)];};
const histo=a=>{const h={};for(const x of a)h[x]=(h[x]|0)+1;return Object.entries(h).sort((x,y)=>y[1]-x[1]);};
for(const p of PAL){say('\n======== '+carte.toUpperCase()+' palier '+p);
  if(Q.includes('frais')){const M=L.moteur(carte,'','');const prem=[],toutes=[],memeOuvSuite=[];let i0=0;
    for(let s=0;s<50;s++){M.raz();const G=L.graines(5,0xF4A15+s*31+p);const rs=G.map(g=>M.route(g,p));prem.push(rs[0]);for(const r of rs)toutes.push(r);
      for(let k=1;k<5;k++)if(rs[k].plan&&rs[k-1].plan&&JSON.stringify(rs[k].plan.ouv)===JSON.stringify(rs[k-1].plan.ouv))i0++;}
    const sP=prem.map(r=>r.suite.join('>')),dP=[];for(let i=0;i<prem.length;i++)for(let j=i+1;j<prem.length;j++)dP.push(d3(prem[i],prem[j],3000));
    say('[3a] 50 premiers lancements : 1res routes — suites distinctes '+new Set(sP).size+'/50 · 1er module '+histo(prem.map(r=>r.suite[0])).slice(0,5).map(x=>x[0]+' '+x[1]).join(', ')+' · distincts '+new Set(prem.map(r=>r.suite[0])).size);
    if(prem[0].plan)for(const k of Object.keys(prem[0].plan))say('     plan.'+k+' (1res routes) : '+histo(prem.map(r=>String(r.plan[k]))).map(x=>x[0]+' '+x[1]).join(', '));
    say('     RMS 3 km (miroir) entre 1res routes : méd '+Math.round(med(dP))+' m, min '+Math.round(Math.min(...dP))+' m, paires < 100 m : '+dP.filter(x=>x<100).length+'/'+dP.length);
    const sT=toutes.map(r=>r.suite.join('>'));say('     250 routes (50 × 5) : suites distinctes '+new Set(sT).size+' · même ouverture deux routes de suite : '+i0+' / 200 transitions');}
  if(Q.includes('longue')){const M=L.moteur(carte,'','');M.raz();const G=L.graines(NL,0x10A6+p);const vu=new Map(),gaps=[],blocs=[];let dup=0,dupIn400=0,t=0,tmax=0,rmax=0,nrep=0;const pres={};
    for(let i=0;i<NL;i++){const r=M.route(G[i],p);t+=r.ms;tmax=Math.max(tmax,r.ms);rmax=Math.max(rmax,r.reprises);if(r.reprises)nrep++;const k=r.suite.join('>');if(vu.has(k)){dup++;const gp=i-vu.get(k);gaps.push(gp);if(gp<=400)dupIn400++;}vu.set(k,i);
      const b=Math.floor(i/100);for(const m of new Set(r.suite)){pres[m]=pres[m]||new Array(Math.ceil(NL/100)).fill(0);pres[m][b]++;}}
    const sz=M.aRU?M.run("JSON.stringify(RU.H).length"):0,szc=M.aRU?M.run("JSON.stringify(RU.H['"+carte+"']||{}).length"):0;
    say('[3b] séance de '+NL+' routes : redites '+dup+' (dont '+dupIn400+' à moins de 400 routes d\'écart) · écarts des redites : '+(gaps.length?'min '+Math.min(...gaps)+', méd '+med(gaps):'—')+' · refaites '+nrep+' (reprises max '+rmax+') · ms moy '+Math.round(t/NL)+', pire '+Math.round(tmax));
    say('     localStorage cashcarRU : '+sz+' octets (dont '+carte+' '+szc+')');
    const mods=Object.keys(pres).sort();say('     présence par tranche de 100 routes (% des routes) :');for(const m of mods)say('       '+m.padEnd(14)+pres[m].map(x=>String(x).padStart(3)).join(' '));}
  if(Q.includes('fige')){const A=L.moteur(carte,'?pistegraine=1',''),B=L.moteur(carte,'?pistegraine=1','');const G=L.graines(12,0xF16E+p);
    const hA=G.map(g=>hash(A.route(g,p)));for(const g of L.graines(40,0xB00+p))B.route(g,p); /* B : 40 autres routes d'abord */const hB=G.map(g=>hash(B.route(g,p)));
    say('[3c] ?pistegraine : même graine dans un vm neuf et après 40 autres routes : '+hA.filter((h,i)=>h===hB[i]).length+' / 12 identiques');
    const C=L.moteur(carte,'?pistegraine=1','');const dv=[],dr=[];const G2=L.graines(16,0x7E+p);const rs=G2.map(g=>[C.route(g,p),C.route(g+1,p)]);for(const [a,b] of rs)dv.push(d3(a,b,3000));for(let i=0;i<rs.length-1;i++)dr.push(d3(rs[i][0],rs[i+1][0],3000));
    say('     graines voisines n / n+1 : RMS 3 km méd '+Math.round(med(dv))+' m (min '+Math.round(Math.min(...dv))+') · graines au hasard : méd '+Math.round(med(dr))+' m · même suite n/n+1 : '+rs.filter(([a,b])=>a.suite.join()===b.suite.join()).length+'/16');}
  if(Q.includes('deux')){const M=L.moteur(carte,'','');M.raz();for(const g of L.graines(30,0xD0+p))M.route(g,p);const G=L.graines(10,0xAB+p),B=L.graines(10,0xCD+p);let ab=0,aba=0,a13=0;const ex=[];
    for(let i=0;i<10;i++){const a1=M.route(G[i],p),a2=M.route(G[i],p);if(hash(a1)===hash(a2))ab++;else if(ex.length<3)ex.push('g'+G[i]+' : « '+a1.suite.join('>')+' » puis « '+a2.suite.join('>')+' » (reprises '+a2.reprises+')');
      M.route(B[i],p);const a3=M.route(G[i],p);if(hash(a1)===hash(a3))aba++;}
    const g0=L.graines(1,0xEE+p)[0],r0=M.route(g0,p);for(const g of L.graines(13,0xEF+p))M.route(g,p);const rL=M.route(g0,p);a13=hash(r0)===hash(rL)?1:0;
    say('[3d] même graine deux fois de suite : '+ab+' / 10 identiques · A, B, A : '+aba+' / 10 · A puis 13 autres puis A : '+(a13?'identique':'DIFFÉRENTE'));for(const e of ex)say('     ex. '+e);}}
fs.writeFileSync(path.join(__dirname,'resultats-memoire-'+carte+'.txt'),OUT.join('\n')+'\n');
