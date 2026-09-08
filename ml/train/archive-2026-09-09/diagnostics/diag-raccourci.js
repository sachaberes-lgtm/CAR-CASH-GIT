#!/usr/bin/env node
/* DIAG-RACCOURCI — le detecteur de raccourci (arr[7]) se declenche-t-il ?
   Balaye toute la piste (s de 0 a L) avec une caisse fictive, et mesure le % de points ou
   arr[7] > -1 (un raccourci est detecte) + la distribution des gains. Independant du comportement
   des bots : c'est la mesure du detecteur LUI-MEME. */
const {loadGame}=require('./sim-env');
const g=loadGame('?train=1&sim=1&clone=0');
const T=g.get('__TRAIN');
T.reseed(3); T.GEN=0; T.evalIdx=0; T.newGen(true);

const b=T.makeBot(null);              // caisse fictive : on ne fait que varier s
let actifs=0, total=0, gains=[];
const ISO=g.get('__ISO');
const L=ISO.track().L;
const log0=console.log; console.log=()=>{};
for(let s=0;s<L;s+=Math.max(1,Math.round(L/300))){
  b.s=s; b.mode='drive'; b.v=60; b.lat=0; b.psi=0; b.nitroR=1.2;
  b.fallVel.set(0,0,0); b.fallPos.set(0,0,0);
  T.brainInput(b);
  const v=T.inArr[7];
  total++;
  if(v>-1){ actifs++; }
  gains.push(v);
}
console.log=log0;
const pct=100*actifs/total;
const positifs=gains.filter(x=>x>-1);
console.log('=== DETECTEUR DE RACCOURCI — balayage piste ('+total+' points, L='+Math.round(L)+' m) ===');
console.log('  points ou arr[7] > -1 : '+actifs+' / '+total+' = '+pct.toFixed(1)+' %');
if(positifs.length){
  const mx=Math.max(...positifs), mn=Math.min(...positifs);
  const m=positifs.reduce((a,b)=>a+b,0)/positifs.length;
  console.log('  gain normalise (arr[7] actif) : min '+mn.toFixed(2)+' · moy '+m.toFixed(2)+' · max '+mx.toFixed(2));
  // distribution par decile
  const hist=[0,0,0,0,0]; // 0.0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
  for(const x of positifs) hist[Math.min(4,Math.floor(x*5))]++;
  console.log('  repartition : '+hist.map((h,i)=>('['+(i*0.2).toFixed(1)+'-'+((i+1)*0.2).toFixed(1)+'] '+h)).join('  '));
}
console.log(pct<1?'  VERDICT : detecteur toujours quasi-mort':'  VERDICT : detecteur actif');
process.exit(0);
