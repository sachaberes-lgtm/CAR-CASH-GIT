/* LA SPIRALE DE L'ORBITE (derAx, v6 étape 3) EST-ELLE SUIVIE ? Le cap déroulé de la route (en plan, sur les points de genCtrl AVANT pisteTord) à 0, 25, 50, 75, 100 % de la longueur,
   et le total net (fin − début) : il devrait valoir le total tiré (180-300°, d'un seul côté).
   node outils/banc-routes/spirale-orbite.cjs <racine> [paliers=0,10,20] [graines=1-12] */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),G=(arg('graines')||'1-12').split('-').map(Number);
for(const p of PAL){let sN=0,n=0,mnN=1e9,mxN=0;for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),Q=r.ctrl0,N=Q.length;const S=[0],C=[0];let cap=0,prev=null;
    for(let i=1;i<N;i++){const dx=Q[i].x-Q[i-1].x,dz=Q[i].z-Q[i-1].z,h=Math.hypot(dx,dz);S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));if(h>.5){const a=Math.atan2(dx,dz);if(prev!=null){let d=a-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;cap+=d;}prev=a;}C.push(cap*57.2958);}
    const at=function(f){const s=f*S[N-1];let i=0;while(i<N-1&&S[i]<s)i++;return C[i];};const net=Math.abs(C[N-1]);sN+=net;n++;mnN=Math.min(mnN,net);mxN=Math.max(mxN,net);
    if(arg('detail')==='1')console.log('p'+p,'g'+g,'cap à 0/25/50/75/100 % :',[0,.25,.5,.75,1].map(function(f){return at(f).toFixed(0);}).join(' / '),'· min',Math.min.apply(null,C).toFixed(0),'max',Math.max.apply(null,C).toFixed(0));}
  console.log('PALIER',p,'· cap net |fin − début| : moy',(sN/n).toFixed(0)+'°','(min',mnN.toFixed(0)+', max',mxN.toFixed(0)+')  — la spirale tirée : 180-300°');}
