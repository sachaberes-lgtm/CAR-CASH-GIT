/* Le virage d'une route d'orbite, en plan : degrés tournés par km (somme des |Δcap|) et amplitude du cap (déroulé : max − min), et le plus grand virage d'un seul côté.
   node virages.cjs <racine> [paliers=0,10,20] [graines=1-8] */
const path=require('path');const RAC=process.argv[2];const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),G=(arg('graines')||'1-8').split('-').map(Number);
for(const p of PAL){const R=[];for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),Q=r.ctrl,n=Q.length;let L=0,tot=0,cap=0,mn=0,mx=0,run=0,best=0,prev=null;
  for(let i=4;i<n;i+=4){const dx=Q[i].x-Q[i-4].x,dz=Q[i].z-Q[i-4].z,h=Math.hypot(dx,dz);L+=Q[i].distanceTo(Q[i-4]);if(h<1)continue;const a=Math.atan2(dx,dz);if(prev!=null){let d=a-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;tot+=Math.abs(d);cap+=d;mn=Math.min(mn,cap);mx=Math.max(mx,cap);if(Math.sign(d)===Math.sign(run)||run===0)run+=d;else run=d;best=Math.max(best,Math.abs(run));}prev=a;}
  R.push({g:g,km:tot*57.3/(L/1000),amp:(mx-mn)*57.3,cote:best*57.3});}
  const moy=function(k){return R.reduce(function(a,x){return a+x[k];},0)/R.length;};
  console.log('palier',p,'· °/km moy',moy('km').toFixed(0),'(min',Math.min.apply(null,R.map(function(x){return x.km;})).toFixed(0)+')','· amplitude moy',moy('amp').toFixed(0)+'°','(min',Math.min.apply(null,R.map(function(x){return x.amp;})).toFixed(0)+')','· plus grand virage d\'un côté moy',moy('cote').toFixed(0)+'°');}
