#!/usr/bin/env node
// CRITIC — vérifie que nearestPts (grille spatiale) rend EXACTEMENT le même plus-proche
// que l'ancien balayage linéaire, pour les DEUX strides utilisés (2 = carTryLand, 8 = viseur).
const {loadGame}=require('./sim-env');
const g=loadGame('?train=1&sim=1&clone=0');
const ISO=g.get('window.__ISO');
if(!ISO || !ISO.grid){ console.error('grid() non exposé'); process.exit(1); }
const gr=ISO.grid();
const {nearestPts,pts,NP,holeAtI}=gr;

// référence : balayage linéaire exact (l'ancien code, reproduit fidèlement)
function brute(q,stride,capSq){
  let bestI=-1,bd=capSq;
  for(let i=0;i<NP;i+=stride){
    if(holeAtI(i)) continue;
    const p=pts[i];
    const dx=q.x-p.x,dy=q.y-p.y,dz=q.z-p.z;
    const dd=dx*dx+dy*dy+dz*dz;
    if(dd<bd){ bd=dd; bestI=i; }
  }
  return {i:bestI,d2:bd};
}

// PRNG déterministe
let seed=12345;
function rnd(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }

// bornes de la piste
let minX=1e9,minY=1e9,minZ=1e9,maxX=-1e9,maxY=-1e9,maxZ=-1e9;
for(let i=0;i<NP;i++){const p=pts[i];minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}
const spanX=maxX-minX, spanY=maxY-minY, spanZ=maxZ-minZ;
console.log('piste NP='+NP+'  bbox X['+minX.toFixed(0)+','+maxX.toFixed(0)+'] Y['+minY.toFixed(0)+','+maxY.toFixed(0)+'] Z['+minZ.toFixed(0)+','+maxZ.toFixed(0)+']');

let mismatches=0, tested=0;
for(const stride of [2,8]){
  const capSq = stride===2 ? 1e9 : 400;
  for(let n=0;n<200;n++){
    // points de requête : autour de la piste (pertinent) + un peu au-delà du plafond du viseur
    const q={
      x:minX+rnd()*spanX + (rnd()-0.5)*40,
      y:minY+rnd()*spanY + (rnd()-0.5)*40,
      z:minZ+rnd()*spanZ + (rnd()-0.5)*40,
    };
    const a=brute(q,stride,capSq);
    const b=nearestPts(q,stride,capSq);
    tested++;
    if(a.i!==b.i || Math.abs(a.d2-b.d2)>1e-6){
      mismatches++;
      if(mismatches<=10){
        console.log('MISMATCH stride='+stride+'  q=('+q.x.toFixed(2)+','+q.y.toFixed(2)+','+q.z.toFixed(2)+')  brute:{i:'+a.i+',d2:'+a.d2.toFixed(2)+'}  grid:{i:'+b.i+',d2:'+b.d2.toFixed(2)+'}');
      }
    }
  }
  console.log('stride='+stride+'  testé='+tested+'  mismatches='+mismatches);
}
console.log(mismatches===0 ? '\nPASS — nearestPts == balayage linéaire sur '+tested+' requêtes' : '\nECHEC — '+mismatches+' divergences / '+tested);
process.exit(mismatches===0?0:1);