#!/usr/bin/env node
/* ================================================================================================
   XP-PILOTE — le pilote au sol (porté du Survivant, §7.4) fait-il mieux que le MLP pur ?
   ------------------------------------------------------------------------------------------------
   Idée du propriétaire : le cerveau ne devrait pas gaspiller de l'évolution à apprendre « rouler
   droit sur la route » — c'est un sous-problème que le pilote du mode Survivant résout déjà. On le
   porte comme contrôleur AU SOL (TRAIN.groundPilot, actif via ?auto=1), et le MLP ne garde que le
   VOL.

   Ce test mesure, sur les MÊMES pistes fraîches et le MÊME cerveau aléatoire :
     A. MLP pur            (auto=0)  : le cerveau conduit tout (sol + vol)
     B. pilote au sol      (auto=1)  : le pilote conduit au sol, le cerveau ne garde que le vol
   Métriques par piste : distance max, vitesse moyenne AU SOL, % du temps sur la route, morts.

   Usage : node xp-pilote.js [--pistes 12] [--seed 3]
   ================================================================================================ */
const {loadGame}=require('./sim-env');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const PISTES=arg('pistes',12);
const SEED=arg('seed',3);
const DT=1/60, DUREE=45;

console.log('— chargement…');

/* ---------- rejouer un cerveau aléatoire sur UNE piste, retourner les métriques ---------- */
function rejouer(g,grainePiste,auto){
  const T=g.get('__TRAIN');
  const ISO=g.get('__ISO');
  T.reseed(424242);                 // même départ pour les deux camps
  ISO.buildTrack(grainePiste);
  const b=T.makeBot(null);          // cerveau aléatoire (même graine -> même cerveau)
  T.resetBot(b);
  b.s=0; b.lat=0; b.psi=0; b.v=26; b.mode='drive'; b.side=1; b.driveDir=1; b.nitroR=1.2;
  let loin=0, sumV=0, nV=0, sumRoute=0, nSol=0, mort='fin';
  for(let n=0;n<Math.round(DUREE/DT);n++){
    T.botStep(b,DT);
    if(b.s>loin) loin=b.s;
    if(b.mode==='drive'){ nSol++; sumV+=Math.abs(b.v); if(Math.abs(b.lat)<14) sumRoute++; }
    if(!b.alive){ mort=b.deathWhy||'?'; break; }
  }
  return {
    dist:Math.round(loin),
    kmh:Math.round((sumV/Math.max(1,nV=nSol))*1.8),   // SPD=0.5 -> km/h = v*3.6*0.5 = v*1.8
    route:nSol?Math.round(100*sumRoute/nSol):0,
    landings:b.landings||0, goodCuts:b.goodCuts||0, mort
  };
}

const gMLP=loadGame('?train=1&sim=1&clone=0&auto=0');
const gAUTO=loadGame('?train=1&sim=1&clone=0&auto=1');
// garde-fou : les flags sont bien lus
if(gMLP.get('__TRAIN').AUTO_GROUND!==0){ console.error('ECHEC : auto=0 mais AUTO_GROUND='+gMLP.get('__TRAIN').AUTO_GROUND); process.exit(1); }
if(gAUTO.get('__TRAIN').AUTO_GROUND!==1){ console.error('ECHEC : auto=1 mais AUTO_GROUND='+gAUTO.get('__TRAIN').AUTO_GROUND); process.exit(1); }

const graines=Array.from({length:PISTES},(_,k)=>700000+k*13);
const t0=Date.now();
const a=graines.map(g=>rejouer(gMLP,g,false));
const b=graines.map(g=>rejouer(gAUTO,g,true));
const moy=(arr,f)=>Math.round(arr.reduce((x,y)=>x+f(y),0)/arr.length);

console.log('');
console.log('=== PILOTE AU SOL vs MLP PUR (seed '+SEED+', '+PISTES+' pistes fraîches, cerveau aléatoire) ===');
console.log('  mode            | dist. moyenne | dist. max | km/h au sol | % sur la route');
console.log('  MLP pur         | '+String(moy(a,r=>r.dist)).padStart(10)+' m   | '+String(Math.max(...a.map(r=>r.dist))).padStart(8)+' | '+String(moy(a,r=>r.kmh)).padStart(8)+'  | '+moy(a,r=>r.route)+' %');
console.log('  pilote au sol   | '+String(moy(b,r=>r.dist)).padStart(10)+' m   | '+String(Math.max(...b.map(r=>r.dist))).padStart(8)+' | '+String(moy(b,r=>r.kmh)).padStart(8)+'  | '+moy(b,r=>r.route)+' %');
console.log('');
console.log('  detail MLP pur       : '+a.map(r=>r.dist).join(' · '));
console.log('  detail pilote au sol : '+b.map(r=>r.dist).join(' · '));
console.log('');
const dM=moy(a,r=>r.dist), dA=moy(b,r=>r.dist);
console.log('  VERDICT : '+(dA>1.2*dM?('pilote au sol GAGNE (+'+Math.round(100*(dA-dM)/Math.max(1,dM))+' % de distance)')
  : dM>1.2*dA?('MLP pur GAGNE (pilote au sol -'+Math.round(100*(dM-dA)/Math.max(1,dM))+' %)')
  : 'pas de difference nette'));
console.log('  morts pilote au sol : '+b.map(r=>r.mort).join(' · ')+'  ·  cuts réussis cumulés : '+b.reduce((x,r)=>x+r.goodCuts,0));
console.log('\n('+((Date.now()-t0)/1000).toFixed(0)+' s)');
process.exit(0);
