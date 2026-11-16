/* Où la route d'orbite est droite : le virage (°/km, en plan) et la longueur, par partie (départ, chaque module, liaisons, fin). node virparts.cjs <racine> [palier] [graines] */
const path=require('path');const RAC=process.argv[2];const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const p=+process.argv[3]||0,[g0,g1]=(process.argv[4]||'1-8').split('-').map(Number);const Z={};
for(let g=g0;g<=g1;g++){const r=B.piste('espace',g,p),Q=r.ctrl,n=Q.length;const lab=new Array(n).fill('liaison');
  const mk=(r.marks||[]).filter(function(m){return m.fig;});for(const m of mk)for(let i=Math.max(0,m.i0);i<=Math.min(n-1,m.i1);i++)lab[i]=(m.climax?'*':'')+m.fig;
  const first=mk.length?Math.min.apply(null,mk.map(function(m){return m.i0;})):n,last=mk.length?Math.max.apply(null,mk.map(function(m){return m.i1;})):0;
  for(let i=0;i<first;i++)lab[i]='départ';for(let i=last+1;i<n;i++)lab[i]='fin';
  let prev=null;for(let i=4;i<n;i+=4){const dx=Q[i].x-Q[i-4].x,dz=Q[i].z-Q[i-4].z,h=Math.hypot(dx,dz),l=Q[i].distanceTo(Q[i-4]);const z=Z[lab[i]]||(Z[lab[i]]={L:0,deg:0});z.L+=l;if(h<1){prev=null;continue;}const a=Math.atan2(dx,dz);if(prev!=null){let d=a-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;z.deg+=Math.abs(d)*57.3;}prev=a;}}
let LT=0;for(const k in Z)LT+=Z[k].L;
for(const k of Object.keys(Z).sort(function(a,b){return Z[b].L-Z[a].L;}))console.log(k.padEnd(18),'part',(Z[k].L/LT*100).toFixed(0).padStart(3)+'%','· °/km',(Z[k].deg/(Z[k].L/1000)).toFixed(0).padStart(4));
