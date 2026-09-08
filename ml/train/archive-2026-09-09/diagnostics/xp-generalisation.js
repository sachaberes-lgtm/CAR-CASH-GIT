#!/usr/bin/env node
/* ================================================================================================
   XP-GENERALISATION — le multi-piste (EVAL_TRACKS=3) generalise-t-il MIEUX que le mono-piste ?
   ------------------------------------------------------------------------------------------------
   check-eval.js prouve le PROTOCOLE (pistes distinctes + moyenne). Ce test prouve le BENEFICE :
   est-ce qu un cerveau selectionne sur 3 pistes moyennees conduit mieux sur des pistes JAMAIS vues
   qu un cerveau selectionne sur 1 piste, a budget de calcul EGAL ?

   Protocole :
     A. EVAL_TRACKS=3  ->  GENS generations (chacune = 3 manches = 3 pistes)
     B. EVAL_TRACKS=1  ->  GENS*3 generations (chacune = 1 manche = 1 piste)
     Meme nombre TOTAL de manches = meme budget.
     Le champion de chaque camp (meilleure fitness MOYENNE jamais selectionnee) est capture en
     hookant TRAIN.newGen (les VRAIES generations — endGen, lui, se declenche a chaque manche).
     Puis les deux champions sont rejoues sur les MEMES pistes fraiches (graines fixees, jamais
     vues a l entrainement), depart standard, et on compare la DISTANCE MOYENNE.

   Usage : node xp-generalisation.js [--gens 8] [--pistes 8] [--seed 3]

   RESULTAT MESURE (2026-09-08, gens=15, pistes=8, budget egal) :
     seed 3 : EVAL_TRACKS=3 -> 1535 m sur pistes fraiches   ·   EVAL_TRACKS=1 -> 2054 m
     seed 7 : EVAL_TRACKS=3 ->  658 m                        ·   EVAL_TRACKS=1 -> 1934 m
     -> le multi-piste GENERALISE MOINS BIEN.
     CAVEAT : ici multi-piste retarde la selection a une fois toutes les 3 manches = 3x moins
     d etapes d evolution. Ce test mesure donc « moyenne + selection retardee » vs « selection a
     chaque manche », pas l effet PUR de la moyenne. Conclusion operationnelle : garder la
     selection A CHAQUE MANCHE (defaut EVAL_TRACKS=1) ; la piste neuve a chaque generation est le
     vrai correctif anti-recitation.
   ================================================================================================ */
const {loadGame}=require('./sim-env');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const GENS=arg('gens',8);        // generations pour le mode tracks=3 (le mode tracks=1 en fera 3x)
const PISTES=arg('pistes',8);    // pistes fraiches de rejeu
const SEED=arg('seed',3);        // graine d evolution (cerveaux initiaux + pistes + mutations)
const DT=1/60, DUREE=45;

console.log('— chargement…');

/* ---------- entraîner UNE config, rendre son champion (weights) ---------- */
function entrainer(tracks,nGen){
  const g=loadGame('?train=1&sim=1&clone=0&tracks='+tracks);
  const T=g.get('__TRAIN');
  T.reseed(SEED); T.record=0; T.GEN=0; T.evalIdx=0; T.newGen(true);
  if(T.EVAL_TRACKS!==tracks){ console.error('ECHEC : EVAL_TRACKS='+T.EVAL_TRACKS+' attendu '+tracks); process.exit(1); }

  let champW=null, champFit=-1e9;
  const courbe=[];
  const n0=T.newGen;
  T.newGen=function(first){
    if(!first){
      // la selection a lieu ICI (une fois par GENERATION). endGen ne fait qu accumuler les manches.
      const sorted=T.bots.slice().sort((a,b)=>b.fitness-a.fitness);
      courbe.push({gen:T.GEN, best:Math.round(sorted[0].fitness)});
      if(sorted[0].fitness>champFit){ champFit=sorted[0].fitness; champW=Float32Array.from(sorted[0].brain.w); }
    }
    return n0.apply(T,arguments);
  };

  const log0=console.log; console.log=()=>{};
  const maxTicks=Math.round(DUREE/DT)*tracks*(nGen+2);   // garde-fou : on s'arrete avant de toute facon via T.GEN
  for(let i=0;T.GEN<=nGen && i<maxTicks;i++) T.tick(DT);
  console.log=log0;

  return {champW, champFit, courbe};
}

/* ---------- rejouer un cerveau sur UNE piste, depart standard, distance max ---------- */
function rejouer(T,ISO,weights,grainePiste,seedDepart){
  T.reseed(seedDepart);
  ISO.buildTrack(grainePiste);
  const b=T.makeBot(weights);
  T.resetBot(b);
  b.s=0; b.lat=0; b.v=26; b.mode='drive'; b.side=1; b.driveDir=1; b.nitroR=1.2;
  let loin=0;
  for(let n=0;n<Math.round(DUREE/DT);n++){
    T.botStep(b,DT);
    if(b.s>loin) loin=b.s;
    if(!b.alive) break;
  }
  return loin;
}

/* ---------- le test ---------- */
const t0=Date.now();
const A=entrainer(3,GENS);                       // multi-piste
const B=entrainer(1,GENS*3);                     // mono-piste, meme budget

if(!A.champW || !B.champW){ console.error('ECHEC : champion non capture'); process.exit(1); }

// environnement FRAIS pour le rejeu : les deux champions, les MEMES pistes, le MEME depart.
const gF=loadGame('?train=1&sim=1&clone=0');
const TF=gF.get('__TRAIN');
const ISOF=gF.get('__ISO');
const graines=Array.from({length:PISTES},(_,k)=>700000+k*13);   // jamais vues a l entrainement
const SEED_DEPART=424242;

const da=graines.map(g=>rejouer(TF,ISOF,A.champW,g,SEED_DEPART));
const db=graines.map(g=>rejouer(TF,ISOF,B.champW,g,SEED_DEPART));
const moy=a=>a.reduce((x,y)=>x+y,0)/a.length;
const ma=moy(da), mb=moy(db);

console.log('');
console.log('=== GENERALISATION (seed '+SEED+', '+PISTES+' pistes fraiches, depart standard) ===');
console.log('  mode              | generations | fitness champion | dist. moyenne sur pistes fraiches');
console.log('  EVAL_TRACKS=3     | '+String(GENS).padStart(10)+' | '+String(Math.round(A.champFit)).padStart(16)+' | '+Math.round(ma)+' m');
console.log('  EVAL_TRACKS=1     | '+String(GENS*3).padStart(10)+' | '+String(Math.round(B.champFit)).padStart(16)+' | '+Math.round(mb)+' m');
console.log('');
console.log('  detail multi-piste : '+da.map(d=>Math.round(d)).join(' · ')+'  (moyenne '+Math.round(ma)+')');
console.log('  detail mono-piste  : '+db.map(d=>Math.round(d)).join(' · ')+'  (moyenne '+Math.round(mb)+')');
console.log('');
const gap=ma-mb;
console.log('  VERDICT : '+(gap>0.05*Math.max(ma,mb)
  ? 'multi-piste GENERALISE MIEUX (+'+Math.round(gap)+' m, +'+(100*gap/Math.max(1,mb)).toFixed(0)+' %)'
  : gap<-0.05*Math.max(ma,mb)
    ? 'mono-piste GENERALISE MIEUX ('+Math.round(gap)+' m)'
    : 'pas de difference nette ('+Math.round(gap)+' m)'));
console.log('  (fitness = note MOYENNE de selection ; distance fraiche = ce qui compte vraiment)');
console.log('\n('+((Date.now()-t0)/1000).toFixed(0)+' s)');
process.exit(0);
