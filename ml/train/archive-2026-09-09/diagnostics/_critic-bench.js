#!/usr/bin/env node
// CRITIC — micro-bench : coût de nearestPts proche vs LOIN du ruban, vs balayage linéaire.
const {loadGame}=require('./sim-env');
const g=loadGame('?train=1&sim=1&clone=0');
const {nearestPts,pts,NP,holeAtI}=g.get('window.__ISO').grid();
function brute(q,stride,capSq){
  let bestI=-1,bd=capSq;
  for(let i=0;i<NP;i+=stride){ if(holeAtI(i))continue; const dx=q.x-pts[i].x,dy=q.y-pts[i].y,dz=q.z-pts[i].z,dd=dx*dx+dy*dy+dz*dz; if(dd<bd){bd=dd;bestI=i;} }
  return {i:bestI,d2:bd};
}
const p0=pts[1000];
const cases={
  'proche (3 u)':   {x:p0.x+2,y:p0.y+1,z:p0.z+2},
  'moyen (400 u)':  {x:p0.x+280,y:p0.y+280,z:p0.z+280},
  'loin (1500 u)':  {x:p0.x+1060,y:p0.y+1060,z:p0.z+1060},
  'tres loin (3000u)':{x:p0.x+2100,y:p0.y+2100,z:p0.z+2100},
};
for(const [nom,q] of Object.entries(cases)){
  const t1=process.hrtime.bigint();
  const ng=nearestPts(q,2,1e9);
  const t2=process.hrtime.bigint();
  const nb=brute(q,2,1e9);
  const t3=process.hrtime.bigint();
  console.log(nom.padEnd(18)+'  grille='+(Number(t2-t1)/1e6).toFixed(2)+' ms (i='+ng.i+')   linéaire='+(Number(t3-t2)/1e6).toFixed(2)+' ms (i='+nb.i+')   même='+(ng.i===nb.i));
}