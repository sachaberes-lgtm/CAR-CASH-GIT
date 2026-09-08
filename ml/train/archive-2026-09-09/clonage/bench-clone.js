#!/usr/bin/env node
/* ================================================================================================
   BENCH-CLONE — l'amorcage sert-il a quelque chose ?
   ------------------------------------------------------------------------------------------------
   Meme protocole des deux cotes : memes graines, meme nombre de generations, meme code. Seule
   difference : la generation 0 est tiree au sort, ou faite du cerveau clone + 23 variantes.

   Le chiffre qui tranche n'est PAS le record (il varie d'un facteur 5 d'un tirage a l'autre) :
   c'est le **pourcentage de morts en airtime**. Si l'amorcage marche, les bots arretent de quitter
   la route et de flotter jusqu'a l'explosion — et ca, ca se voit tout de suite.

   Usage : node bench-clone.js [--gens 30] [--seeds 1,2,3,4,5,6,7,8] [--mode both|random|clone]
   ================================================================================================ */
const fs=require('fs'),path=require('path');
const {loadGame}=require('./sim-env');

const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?process.argv[i+1]:d; };
const GENS=parseInt(arg('gens','30'),10);
const SEEDS=arg('seeds','1,2,3,4,5,6,7,8').split(',').map(s=>parseInt(s,10));
const MODE=arg('mode','both');
const DT=1/60, TICKS_MAX=GENS*60*60;      // garde-fou : 60 s de sim par generation, jamais plus

const BRAINF=path.join(__dirname,'results','cloned-brain.json');
let CLONE=null;
if(fs.existsSync(BRAINF)){
  try{ const j=JSON.parse(fs.readFileSync(BRAINF,'utf8')); if(j.w)CLONE=j; }catch(e){}
}
if((MODE==='both'||MODE==='clone')&&!CLONE){
  console.error('Pas de results/cloned-brain.json : rien a comparer.');
  console.error('Enchaine ENREGISTRER.bat (jouer) puis `node clone.js`, et relance.');
  process.exit(CLONE===null&&MODE==='clone'?1:0);
}

const median=a=>{ const b=a.slice().sort((x,y)=>x-y); const n=b.length;
  return n?(n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2):0; };

function run(mode,seed){
  const g=loadGame('?train=1&sim=1'+(mode==='random'?'&clone=0':''));
  const T=g.get('__TRAIN');
  if(mode==='clone'){
    if(CLONE.w.length!==T.bots[0].brain.w.length) throw new Error('cloned-brain.json au mauvais format');
    T.seedBrain=Float32Array.from(CLONE.w);
  }
  T.reseed(seed); T.record=0; T.GEN=0; T.evalIdx=0;
  T.newGen(true);

  const deaths={}; const k0=T.kill;
  T.kill=function(b,why){ deaths[why]=(deaths[why]||0)+1; return k0.apply(T,arguments); };
  const bests=[]; const e0=T.endGen;
  T.endGen=function(){
    for(const b of T.bots) if(b.alive) b.fitness=b.totD+150*b.goodCuts; // meme calcul que endGen
    let best=0; for(const b of T.bots) if(b.fitness>best) best=b.fitness;
    bests.push(Math.round(best));
    return e0.apply(T,arguments);
  };
  const log0=console.log; console.log=()=>{};                 // le jeu bavarde une ligne par generation
  try{
    let n=0;
    while(bests.length<GENS && n<TICKS_MAX){ T.tick(DT); n++; }
  } finally { console.log=log0; }

  const tot=Object.values(deaths).reduce((a,b)=>a+b,0);
  return {
    bests, best:Math.max(0,...bests), mediane:Math.round(median(bests)),
    morts:tot, airtime:deaths.airtime||0, idle:deaths.idle||0, vide:deaths.void||0,
    pctAir: tot?100*(deaths.airtime||0)/tot:0
  };
}

function bloc(mode){
  console.log('\n=== '+(mode==='clone'?'GENERATION 0 AMORCEE (cerveau clone)':'GENERATION 0 ALEATOIRE')+
              '  —  '+GENS+' generations, graines '+SEEDS.join(',')+' ===');
  console.log('graine |  best  mediane |  morts   airtime      idle    vide');
  const R=[];
  for(const sd of SEEDS){
    const r=run(mode,sd); R.push(r);
    console.log(String(sd).padStart(6)+' | '+String(r.best).padStart(5)+'  '+String(r.mediane).padStart(7)+
      ' | '+String(r.morts).padStart(6)+'  '+String(r.airtime).padStart(4)+' ('+r.pctAir.toFixed(0).padStart(3)+'%)'+
      '  '+String(r.idle).padStart(6)+'  '+String(r.vide).padStart(6));
  }
  const allBest=R.map(r=>r.best), allMed=R.map(r=>r.mediane);
  const tot=R.reduce((a,r)=>a+r.morts,0), air=R.reduce((a,r)=>a+r.airtime,0);
  const res={ best:Math.max(...allBest), medianeDesBest:Math.round(median(allBest)),
              medianeDesMedianes:Math.round(median(allMed)), morts:tot, airtime:air,
              pctAir:tot?100*air/tot:0 };
  console.log('       |  meilleur '+res.best+'   ·  mediane des best '+res.medianeDesBest+
              '   ·  mediane par generation '+res.medianeDesMedianes);
  console.log('       |  MORTS EN AIRTIME : '+res.pctAir.toFixed(1)+'%  ('+air+' / '+tot+')');
  return res;
}

console.log('bench-clone — '+GENS+' generations par graine, '+SEEDS.length+' graines');
if(CLONE)console.log('cerveau clone : '+CLONE.pas+' pas de demo, '+(100*CLONE.partEnVol).toFixed(0)+'% en vol, validation '+CLONE.erreurValidation);
const t0=Date.now();
const A=(MODE==='both'||MODE==='random')?bloc('random'):null;
const B=(MODE==='both'||MODE==='clone')?bloc('clone'):null;
if(A&&B){
  console.log('\n=== VERDICT ===');
  console.log('                        aleatoire     clone');
  console.log('meilleur                '+String(A.best).padStart(9)+' '+String(B.best).padStart(9));
  console.log('mediane des best        '+String(A.medianeDesBest).padStart(9)+' '+String(B.medianeDesBest).padStart(9));
  console.log('mediane par generation  '+String(A.medianeDesMedianes).padStart(9)+' '+String(B.medianeDesMedianes).padStart(9));
  console.log('MORTS EN AIRTIME        '+(A.pctAir.toFixed(1)+'%').padStart(9)+' '+(B.pctAir.toFixed(1)+'%').padStart(9));
  const d=A.pctAir-B.pctAir;
  console.log('\n'+(d>3?'→ L\'amorcage REDUIT les morts en airtime de '+d.toFixed(1)+' points.'
             :d<-3?'→ L\'amorcage AUGMENTE les morts en airtime de '+(-d).toFixed(1)+' points : il n\'aide pas.'
             :'→ Pas d\'effet net sur les morts en airtime ('+d.toFixed(1)+' point).'));
}
console.log('\n('+((Date.now()-t0)/1000).toFixed(0)+' s)');
process.exit(0);
