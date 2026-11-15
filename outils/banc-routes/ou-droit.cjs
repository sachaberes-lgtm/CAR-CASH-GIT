/* OÙ LA ROUTE DE L'ORBITE TOURNE PEU (2026-11-14 nuit, v7.4 : « 200 °/km au palier 0 ») — la route finale (après pisteTord), découpée par module (MODMARK, fig) et liaisons :
   pour chaque morceau, sa longueur, ses degrés en plan, son °/km ; la part de la route et des degrés. Dit où se gagnent les degrés qui manquent.
   node outils/banc-routes/ou-droit.cjs <racine> [paliers=0] [graines=1-16]      (SEARCH='?orbsret=0' pour une variante) */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0').split(',').map(Number),G=(arg('graines')||'1-16').split('-').map(Number),D=57.2958;
for(const p of PAL){const Z={};let Ltot=0,Dtot=0,n=0;
  for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),Q=r.ctrl,m=r.marks.filter(function(x){return x.fig;});n++;
    const S=[0];for(let i=1;i<Q.length;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
    const cap=[];let prev=null,cD=0;for(let i=0;i<Q.length;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(Q.length-1,i+1)];const tx=b.x-a.x,tz=b.z-a.z;if(Math.hypot(tx,tz)<1e-6){cap.push(cD);continue;}const an=Math.atan2(tx,tz);if(prev==null)cD=an;else{let d=an-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;cD+=d;}prev=an;cap.push(cD);}
    const nomAt=function(i){let k='liaison';for(const x of m)if(i>=x.i0&&i<x.i1)k=(x.climax?'*':'')+x.fig;if(m.length&&i<m[0].i0)k='départ';if(m.length&&i>=m[m.length-1].i1)k='arrivée';return k;};
    for(let i=1;i<Q.length;i++){const k=nomAt(i),z=Z[k]||(Z[k]={L:0,d:0});const ds=S[i]-S[i-1],dd=Math.abs(cap[i]-cap[i-1])*D;z.L+=ds;z.d+=dd;Ltot+=ds;Dtot+=dd;}}
  console.log('PALIER',p,n+' routes · '+(Ltot/n/1000).toFixed(2)+' km · '+(Dtot/(Ltot/1000)).toFixed(0)+' °/km · '+(Dtot/n).toFixed(0)+'° par route (200 °/km = '+(200*Ltot/n/1000).toFixed(0)+'°)');
  for(const k of Object.keys(Z).sort(function(a,b){return Z[b].L-Z[a].L;})){const z=Z[k];console.log('  '+k.padEnd(18)+' '+(z.L/n).toFixed(0).padStart(5)+' m/route ('+(z.L/Ltot*100).toFixed(0).padStart(2)+' %) · '+(z.d/n).toFixed(0).padStart(4)+'°/route · '+(z.d/(z.L/1000)).toFixed(0).padStart(4)+' °/km · manque à 200 : '+Math.max(0,(200*z.L/1000-z.d)/n).toFixed(0)+'°');}}
