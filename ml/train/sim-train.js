#!/usr/bin/env node
// Simulateur headless du mode TRAIN de train.html.
// L'environnement (stubs DOM/WebGL/audio + chargement du script) vit dans sim-env.js : sim-train.js
// et check-iso.js chargent ainsi EXACTEMENT le meme jeu.
const {loadGame}=require('./sim-env');

const g=loadGame('?train=1&sim=1');
const vmGet=g.get;
console.log('Chargement OK. IS_TRAIN=',vmGet('typeof IS_TRAIN'));
const T=vmGet('__TRAIN');
if(typeof T!=='object'||!T.bots){
  console.error('__TRAIN non initialisé');
  process.exit(1);
}
// GRAINE : depuis que tout l'aléa du mode train passe par TRAIN.rnd, un run est REPRODUCTIBLE.
// `node sim-train.js --seed 42` (ou TRAIN_SEED=42) rejoue une autre population sur une autre piste —
// c'est ce qui permet de COMPARER deux versions du code au lieu de comparer deux coups de chance.
{
  const a=process.argv.indexOf('--seed');
  const sd=a>0?parseInt(process.argv[a+1],10):(process.env.TRAIN_SEED?parseInt(process.env.TRAIN_SEED,10):null);
  if(sd!==null&&!isNaN(sd)){
    T.reseed(sd); T.GEN=0; T.record=0; T.genSinceTrack=99;
    T.newGen(true);                       // population ET piste retirees a cette graine
    console.log('Graine TRAIN :',sd);
  }
}
console.log('Génération initiale:',T.GEN,'bots:',T.bots.length);

// Simulation : pas de temps IDENTIQUE à la boucle de rendu réelle (1/60 s), sinon la
// physique diverge (isomorphisme sim/course). On simule 3 manches de 45 s = 8100 ticks.
const DT=1/60;
const STEPS=Math.round(45/DT)*3;
let lastGen=T.GEN;
let maxTotD=0;
let bestEver=0;
for(let i=0;i<STEPS;i++){
  try{
    T.tick(DT);
  }catch(e){
    console.error('ERREUR tick',i,':',e.message);
    console.error(e.stack);
    process.exit(1);
  }
  for(const b of T.bots) if(b.alive && b.totD>maxTotD) maxTotD=b.totD;
  if(T.GEN>lastGen){
    console.log('Génération',T.GEN,'démarrée au tick',i,'(t='+Math.round(i*DT)+'s)');
    lastGen=T.GEN;
  }
}

const alive=T.bots.filter(b=>b.alive).length;
console.log('FIN SIM : génération',T.GEN,'vivants',alive,'/24','max totD',maxTotD.toFixed(1),
            'record',Math.round(T.record));
console.log('RESUME '+JSON.stringify({gen:T.GEN,record:Math.round(T.record),maxTotD:Math.round(maxTotD)}));
if(T.GEN<3){
  console.error('ECHEC : pas assez de générations enchaînées');
  process.exit(1);
}
console.log('SIM TRAIN OK');
process.exit(0);
