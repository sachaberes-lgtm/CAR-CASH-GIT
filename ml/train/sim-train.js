#!/usr/bin/env node
// Simulateur headless du mode TRAIN de train.html.
// L'environnement (stubs DOM/WebGL/audio + chargement du script) vit dans sim-env.js : sim-train.js
// et check-iso.js chargent ainsi EXACTEMENT le meme jeu.
const {loadGame}=require('./sim-env');

// --auto : porter le pilote du Survivant comme contrôleur au sol (TRAIN.AUTO_GROUND, §7.4).
const AUTO=process.argv.indexOf('--auto')>0;
const NOFLYFIX=process.argv.indexOf('--noflyfix')>0;
const g=loadGame('?train=1&sim=1'+(AUTO?'&auto=1':'')+(NOFLYFIX?'&flyfix=0':''));
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
// `--wcut X` force le poids de la recompense de coupe (pour l A/B xp-coupe, defaut = celui du code).
const WCUT=(()=>{ const i=process.argv.indexOf('--wcut'); return i>0?parseFloat(process.argv[i+1]):null; })();
if(WCUT!==null && isFinite(WCUT)) T.W_CUT=WCUT;
let RUN_SEED=null;   // la graine, remontee en portee de fonction pour nommer le fichier de resultat
{
  const a=process.argv.indexOf('--seed');
  const sd=a>0?parseInt(process.argv[a+1],10):(process.env.TRAIN_SEED?parseInt(process.env.TRAIN_SEED,10):null);
  const graine=(sd!==null&&!isNaN(sd));
  // On ne repeuple QUE s'il y a une raison : une graine imposee, ou un cerveau clone arrive apres
  // que TRAIN.init a deja peuple sans lui. Repeupler pour rien consommerait de l'alea en plus et le
  // headless ne sortirait plus les memes chiffres que le navigateur.
  if(graine||T.seedBrain){
    if(graine){ T.reseed(sd); T.record=0; RUN_SEED=sd; }
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

// BILAN DES MORTS : hooke T.kill pour compter les causes sur TOUTE la sim (idle / airtime / void /
// arrivee...). C'est le signal qui dit si une recompense pousse a sauter (airtime) ou a finir.
const deaths={};
const k0=T.kill;
T.kill=function(b,why){ deaths[why]=(deaths[why]||0)+1; return k0.apply(T,arguments); };

// BILAN DU VOL : on remet le compteur global à zéro POUR CE RUN (loadGame partage le même objet
// entre les runs headless), puis on le lit à la fin. Il est accumulé par botStep sur TOUTES les
// manches et générations — contrairement à b.goodCuts qui ne vit qu'une manche (resetBot).
T.airStats={takeoffs:0, landings:0, goodCuts:0};
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
// BILAN DU VOL (compteur GLOBAL, jamais remis à zéro par le cycle de vie des bots) : c'est LA
// métrique de la voltige. Taux d'atterrissage = landings/takeoffs — si les bots sautent sans jamais
// se poser, ce ratio s'effondre et on le VOIT (leçon : une métrique structurellement nulle passe
// « au vert » sans rien signaler).
const as=T.airStats||{takeoffs:0,landings:0,goodCuts:0};
const tauxAt=as.takeoffs>0?Math.round(100*as.landings/as.takeoffs):0;
console.log('FIN SIM : génération',T.GEN,'vivants',alive,'/24','max totD',maxTotD.toFixed(1),
            'record',Math.round(T.record),
            'décol',as.takeoffs,'atter',as.landings,'('+tauxAt+'%)','bonnes coupes',as.goodCuts);
console.log('RESUME '+JSON.stringify({gen:T.GEN,record:Math.round(T.record),maxTotD:Math.round(maxTotD),
            air:as, tauxAtterrissage:tauxAt, courbe:courbe, deaths:deaths}));
// PERSISTANCE DES RESULTATS : le RESUME partait en stdout et etait perdu des que le process se
// terminait (trouve par Sacha le 2026-09-09). On l'ecrit aussi dans results/runs/run-<graine>.json :
// un run reproductible laisse une trace, comparer deux versions du code ne depend plus de la console.
try{
  const fs=require('fs'),path=require('path');
  const runsDir=path.join(__dirname,'results','runs');
  fs.mkdirSync(runsDir,{recursive:true});
  const nom='run-'+(RUN_SEED!=null?('seed'+RUN_SEED):'auto')+(NOFLYFIX?'-noflyfix':'')+'.json';
  const out=JSON.stringify({seed:RUN_SEED,gens:TARGET_GEN,wcut:T.W_CUT,auto:!!T.AUTO_GROUND,
    noflyfix:NOFLYFIX, date:new Date().toISOString(), gen:T.GEN, record:Math.round(T.record),
    maxTotD:Math.round(maxTotD), air:as, tauxAtterrissage:tauxAt, courbe:courbe, deaths:deaths});
  fs.writeFileSync(path.join(runsDir,nom),out);
  console.log('  → resultat ecrit : results/runs/'+nom);
}catch(e){ console.error('  persistance RESUME echouee : '+e.message); }
if(T.GEN<TARGET_GEN){
  console.error('ECHEC : '+T.GEN+' generations sur '+TARGET_GEN+' demandees');
  process.exit(1);
}
console.log('SIM TRAIN OK');
process.exit(0);
