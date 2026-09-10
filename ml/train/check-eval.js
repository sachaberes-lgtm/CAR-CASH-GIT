#!/usr/bin/env node
/* ================================================================================================
   CHECK-EVAL — le correctif anti-recitation (HANDOVER §7.1) fait-il ce qu il pretend ?
   ------------------------------------------------------------------------------------------------
   Avant : `newGen` ne regenerait la piste que toutes les 5 generations, et chaque voiture etait
   notee sur UNE seule piste. Un champion memorisait le parcours (2456 sur sa piste, 38 sur une
   inconnue). Correctif : chaque generation = EVAL_TRACKS pistes DIFFERENTES, note = MOYENNE.

   Depuis 2026-09-10, la note n est PLUS la moyenne des notes brutes : c est la MOYENNE des SCORES
   DE RANG. Une piste dure creusait un trou (une note -88 dominait la moyenne) ; le rang borne
   chaque manche a [0, POP-1] (meilleur = POP-1, pire = 0, ex-aequo = moyenne des rangs).

   Ce test le verifie MECANIQUEMENT, de facon deterministe (pas de "regarde a l ecran") :
     1. dans une generation complete, les graines de piste sont toutes DISTINCTES ;
     2. a la selection, la fitness de chaque bot est EXACTEMENT la moyenne arithmetique
        (fitnessSum / evalCount) de ses manches, evalCount == EVAL_TRACKS, et fitnessSum est
        EXACTEMENT la somme des scores de rang recalcus ici INDEPENDAMMENT a partir des notes
        brutes (POP - rang, ex-aequo = moyenne des rangs) ;
     3. deux generations consecutives ne repartent pas sur la meme piste.

   Usage : node check-eval.js [--tracks 3]
   ================================================================================================ */
const {loadGame}=require('./sim-env');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const TRACKS=arg('tracks',3);
const DT=1/60;

console.log('— chargement…');
const g=loadGame('?train=1&sim=1&clone=0&tracks='+TRACKS);
const T=g.get('__TRAIN');
if(T.EVAL_TRACKS!==TRACKS){ console.error('ECHEC : EVAL_TRACKS='+T.EVAL_TRACKS+' au lieu de '+TRACKS); process.exit(1); }

/* ---- instrumentation : on note la graine de piste a chaque manche, et les notes brutes ---- */
const seeds=new Map();          // gen -> liste des graines de piste vues
const manches=[];               // notes brutes de la generation en cours : manche -> [note par bot (ordre T.bots)]
const s0=T.startEval;
T.startEval=function(){
  s0.apply(T,arguments);
  if(!seeds.has(T.GEN)) seeds.set(T.GEN,[]);
  seeds.get(T.GEN).push(T.seed);
};

/* reimplementation INDEPENDANTE du scoring par rang : POP - rang, ex-aequo = moyenne des rangs.
   On ne recopie PAS la logique de train.html : on la recalcule a partir des notes brutes et on
   exige que train.html aboutisse au MEME resultat (sinon la selection serait faussee). */
function rangs(notes, POP){
  const idx=notes.map((n,i)=>({i,n})).sort((a,b)=>b.n-a.n);
  const out=new Array(notes.length).fill(0);
  let r=0;
  while(r<idx.length){
    let r2=r+1;
    while(r2<idx.length && idx[r2].n===idx[r].n) r2++;
    const rm=(2*POP-r-r2-1)/2;                       // moyenne des rangs POP-1-r .. POP-1-(r2-1)
    for(let k=r;k<r2;k++) out[idx[k].i]=rm;
    r=r2;
  }
  return out;
}
const e0=T.endGen;
T.endGen=function(){
  manches.push(T.bots.map(b=>T.fitness(b)));         // notes brutes de CETTE manche (ordre T.bots)
  return e0.apply(T,arguments);
};

let erreurs=[];
const n0=T.newGen;
T.newGen=function(first){
  if(!first){
    // la selection arrive : chaque bot doit porter fitness = moyenne exacte des scores de rang.
    const POP=T.bots.length;
    if(manches.length!==T.EVAL_TRACKS) erreurs.push('manches observees '+manches.length+' != '+T.EVAL_TRACKS);
    const attendu=new Array(POP).fill(0);
    for(const notes of manches){
      const sc=rangs(notes,POP);
      for(let i=0;i<POP;i++) attendu[i]+=sc[i];
    }
    for(let i=0;i<POP;i++){
      const b=T.bots[i];
      if(b.evalCount!==T.EVAL_TRACKS) erreurs.push('bot '+i+' evalCount '+b.evalCount+' != '+T.EVAL_TRACKS);
      if(Math.abs(b.fitnessSum-attendu[i])>1e-9)
        erreurs.push('bot '+i+' fitnessSum '+b.fitnessSum+' != somme des rangs '+attendu[i]);
      const moyenne=b.fitnessSum/Math.max(1,b.evalCount);
      if(Math.abs(b.fitness-moyenne)>1e-9)
        erreurs.push('bot '+i+' fitness '+b.fitness+' != moyenne des rangs '+moyenne);
    }
  }
  manches.length=0;                                   // nouvelle generation : on repart a zero
  return n0.apply(T,arguments);
};

// On repart a zero APRES avoir installe les hooks (le chargement a deja lance une 1re manche).
T.reseed(1); T.record=0; T.GEN=0; T.evalIdx=0; T.newGen(true);

/* ---- on laisse tourner 2 generations completes ---- */
const log0=console.log; console.log=()=>{};
let maxTicks=Math.round(45/DT)*TRACKS*3;
for(let i=0;T.GEN<3 && i<maxTicks;i++){
  try{ T.tick(DT); }catch(e){ console.log=log0; console.error('ERREUR tick',i,e.message); process.exit(1); }
}
console.log=log0;

/* ---- verdicts : uniquement les generations TERMINEES (celles qui ont eu leur selection) ---- */
const finies=[...seeds.keys()].filter(gid=>gid<T.GEN);
for(const gid of finies){
  const list=seeds.get(gid);
  if(list.length!==TRACKS) erreurs.push('gen '+gid+' : '+list.length+' pistes au lieu de '+TRACKS);
  if(new Set(list).size!==list.length) erreurs.push('gen '+gid+' : des pistes sont reutilisees dans la meme generation');
}
const allSeeds=finies.map(gid=>seeds.get(gid)).flat();
if(new Set(allSeeds).size!==allSeeds.length) erreurs.push('des pistes sont reutilisees ENTRE les generations');

if(erreurs.length){
  console.error('\nECHEC — '+erreurs.length+' anomalie(s) :');
  for(const e of erreurs) console.error('  · '+e);
  process.exit(1);
}
console.log('\nPASS — chaque generation court '+TRACKS+' pistes distinctes, la note de selection est la');
console.log('       moyenne exacte des scores de rang (POP - rang, ex-aequo = moyenne des rangs) de ces');
console.log('       manches, et aucune piste n est vue deux fois d une generation a l autre.');
process.exit(0);
