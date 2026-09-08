#!/usr/bin/env node
// CRITIC — nearestPts : le cas "loin du ruban" (capSq=1e9), où la borne d'arrêt précoce
// est la plus risquée. Peu de points (perf), mais on vérifie l'EXACTITUDE.
const {loadGame}=require('./sim-env');
const gr=g=loadGame('?train=1&sim=1&clone=0');(g.get('window.__ISO').grid());
const grr=g.get('window.__ISO').grid();
const {nearestPts,pts,NP,holeAtI}=grr;
function brute(q,stride,capSq){
  let bestI=-1,bd=capSq;
  for(let i=0;i<NP;i+=stride){ if(holeAtI(i))continue; const dx=q.x-pts[i].x,dy=q.y-pts[i].y,dz=q.z-pts[i].z,dd=dx*dx+dy*dy+dz*dz; if(dd<bd){bd=dd;bestI=i;} }
  return {i:bestI,d2:bd};
}
let seed=555;
function rnd(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }
let mm=0;
for(let n=0;n<40;n++){
  const bi=Math.floor(rnd()*NP); const p=pts[bi];
  // jusqu'à ~1200 unités de décalage sur chaque axe : la caisse éjectée loin
  const q={x:p.x+(rnd()-.5)*2400, y:p.y+(rnd()-.5)*2400, z:p.z+(rnd()-.5)*2400};
  const a=brute(q,2,1e9), b=nearestPts(q,2,1e9);
  if(a.i!==b.i||Math.abs(a.d2-b.d2)>1e-6){mm++; if(mm<=12)console.log('MISMATCH q=('+q.x.toFixed(0)+','+q.y.toFixed(0)+','+q.z.toFixed(0)+') brute{i:'+a.i+',d2:'+a.d2.toFixed(0)+'} grid{i:'+b.i+',d2:'+b.d2.toFixed(0)+'}');}
}
console.log(mm===0?'PASS — 40 cas loin du ruban, 0 divergence (borne d\'arrêt OK)':'ECHEC — '+mm+' divergences sur 40 cas loin du ruban');
process.exit(mm===0?0:1);