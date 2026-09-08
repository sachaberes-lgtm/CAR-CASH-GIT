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
// LE CERVEAU CLONE : le navigateur va le chercher avec fetch, le headless n'a que le disque.
// `--random` force le demarrage aleatoire : c'est comme ca qu'on compare amorce contre hasard.
const FORCE_RANDOM=process.argv.indexOf('--random')>0;
if(FORCE_RANDOM) T.useClone=false;
else{
  const fs=require('fs'),path=require('path');
  const f=path.join(__dirname,'results','cloned-brain.json');
  if(fs.existsSync(f)){
    try{
      const j=JSON.parse(fs.readFileSync(f,'utf8'));
      if(j.w&&j.w.length===T.bots[0].brain.w.length){
        T.seedBrain=Float32Array.from(j.w);
        console.log('Cerveau clone charge ('+j.pas+' pas de demo, validation '+j.erreurValidation+')');
      }else console.error('cloned-brain.json au mauvais format, ignore');
    }catch(e){ console.error('cloned-brain.json illisible : '+e.message); }
  }
}
// GRAINE : depuis que tout l'aléa du mode train passe par TRAIN.rnd, un run est REPRODUCTIBLE.
// `node sim-train.js --seed 42` (ou TRAIN_SEED=42) rejoue une autre population sur une autre piste —
// c'est ce qui permet de COMPARER deux versions du code au lieu de comparer deux coups de chance.
{
  const a=process.argv.indexOf('--seed');
  const sd=a>0?parseInt(process.argv[a+1],10):(process.env.TRAIN_SEED?parseInt(process.env.TRAIN_SEED,10):null);
  const graine=(sd!==null&&!isNaN(sd));
  // On ne repeuple QUE s'il y a une raison : une graine imposee, ou un cerveau clone arrive apres
  // que TRAIN.init a deja peuple sans lui. Repeupler pour rien consommerait de l'alea en plus et le
  // headless ne sortirait plus les memes chiffres que le navigateur.
  if(graine||T.seedBrain){
    if(graine){ T.reseed(sd); T.record=0; }
    T.GEN=0; T.evalIdx=0;
    T.newGen(true);
    if(graine) console.log('Graine TRAIN :',sd);
  }
}
console.log('Génération initiale:',T.GEN,'bots:',T.bots.length);

// Simulation : pas de temps IDENTIQUE à la boucle de rendu réelle (1/60 s), sinon la
// physique diverge (isomorphisme sim/course). `--gens N` = generations a enchainer (defaut 4,
// rapide pour VERIFIER ; multi-train.js en demande plus).
const GENS=(()=>{ const i=process.argv.indexOf('--gens'); return i>0?parseInt(process.argv[i+1],10):4; })();
const DT=1/60;
const EVALS=T.EVAL_TRACKS||1;
const TARGET_GEN=GENS;
const MAX_TICKS=Math.round(45/DT)*EVALS*TARGET_GEN;

// COURBE D'APPRENTISSAGE : meilleure fitness a chaque SELECTION. On hooke newGen (une fois par
// generation), pas endGen (qui tourne a chaque manche quand EVAL_TRACKS>1).
const courbe=[];
const n0=T.newGen;
T.newGen=function(first){
  if(!first){
    const s=T.bots.slice().sort((a,b)=>b.fitness-a.fitness);
    if(s.length) courbe.push(Math.round(s[0].fitness));
  }
  return n0.apply(T,arguments);
};

let lastGen=T.GEN;
let maxTotD=0;
for(let i=0;i<MAX_TICKS && T.GEN<TARGET_GEN;i++){
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
console.log('RESUME '+JSON.stringify({gen:T.GEN,record:Math.round(T.record),maxTotD:Math.round(maxTotD),courbe:courbe}));
if(T.GEN<TARGET_GEN){
  console.error('ECHEC : '+T.GEN+' generations sur '+TARGET_GEN+' demandees');
  process.exit(1);
}
console.log('SIM TRAIN OK');
process.exit(0);
