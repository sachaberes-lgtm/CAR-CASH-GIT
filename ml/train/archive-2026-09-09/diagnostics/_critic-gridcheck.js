#!/usr/bin/env node
// CRITIC — nearestPts (grille) == balayage linéaire exact ? pour les 2 strides réels (2 et 8).
// Points de requête REPRÉSENTATIFS : proches du ruban (comme une caisse en vol), pas uniformes
// dans la bbox (qui est un volume 4 km de haut quasi vide -> cas pathologique non réaliste).
const {loadGame}=require('./sim-env');
const g=loadGame('?train=1&sim=1&clone=0');
const gr=g.get('window.__ISO').grid();
const {nearestPts,pts,NP,holeAtI}=gr;

function brute(q,stride,capSq){
  let bestI=-1,bd=capSq;
  for(let i=0;i<NP;i+=stride){
    if(holeAtI(i)) continue;
    const dx=q.x-pts[i].x,dy=q.y-pts[i].y,dz=q.z-pts[i].z;
    const dd=dx*dx+dy*dy+dz*dz;
    if(dd<bd){ bd=dd; bestI=i; }
  }
  return {i:bestI,d2:bd};
}
let seed=987654321;
function rnd(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }

let mismatches=0, tested=0;
for(const stride of [2,8]){
  const capSq = stride===2 ? 1e9 : 400;
  const N = stride===2 ? 5000 : 5000;
  for(let n=0;n<N;n++){
    // requête REALISTE : un point du ruban + décalage 3D de quelques unités à quelques dizaines
    const bi=Math.floor(rnd()*NP);
    const p=pts[bi];
    const off = stride===2 ? 30 : 40;   // carTryLand sonde loin, le viseur plus local
    const q={ x:p.x+(rnd()-.5)*2*off, y:p.y+(rnd()-.5)*2*off, z:p.z+(rnd()-.5)*2*off };
    const a=brute(q,stride,capSq);
    const b=nearestPts(q,stride,capSq);
    tested++;
    if(a.i!==b.i || Math.abs(a.d2-b.d2)>1e-6){
      mismatches++;
      if(mismatches<=15) console.log('MISMATCH stride='+stride+' q=('+q.x.toFixed(1)+','+q.y.toFixed(1)+','+q.z.toFixed(1)+') brute{i:'+a.i+',d2:'+a.d2.toFixed(1)+'} grid{i:'+b.i+',d2:'+b.d2.toFixed(1)+'}');
    }
  }
  console.log('stride='+stride+' testé='+N+' mismatches='+mismatches);
}
console.log(mismatches===0 ? '\nPASS — nearestPts == balayage linéaire ('+tested+' requêtes réalistes)' : '\nECHEC — '+mismatches+' divergences');
process.exit(mismatches===0?0:1);