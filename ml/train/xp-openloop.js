#!/usr/bin/env node
/* ================================================================================================
   XP — « pas besoin de cerveau » : et si les voitures tiraient juste des COMMANDES au hasard ?
   ------------------------------------------------------------------------------------------------
   Idee de Sacha (2026-09-08) : pas de reseau. Chaque voiture porte une SUITE DE COMMANDES tiree au
   sort (volant/gaz/nitro/assiette, reevaluee 10 fois par seconde). Objectif : aller le plus loin
   possible. A chaque manche, les 12 plus nulles sont supprimees et remplacees par des copies
   mutees des 12 meilleures.

   On compare, SUR LA MEME PISTE et avec le meme budget de calcul :
     A. RECETTE  — la suite de commandes, en boucle OUVERTE (elle ne regarde rien)
     B. CERVEAU  — le MLP 12->16->4 actuel, en boucle FERMEE (il regarde les 12 entrees)

   Ce que ce test peut prouver : qu'une recette apprend a aller loin SUR CETTE PISTE.
   Ce qu'il ne peut PAS prouver : qu'elle sait conduire. Une recette ne generalise pas — on le
   verifie aussi, en la rejouant sur une piste qu'elle n'a jamais vue.

   Usage : node xp-openloop.js [--gens 40] [--pop 24] [--seed 3]
   ================================================================================================ */
const {loadGame}=require('./sim-env');

const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const GENS=arg('gens',40), POP=arg('pop',24), SEED=arg('seed',3);
const DT=1/60, DUREE=45, TICK=0.1;                 // 10 Hz de decision, comme les bots actuels
const SLOTS=Math.ceil(DUREE/TICK);                 // 450 creneaux de commandes
const GARDE=POP/2;                                 // « les 12 plus nuls se font supprimer »

function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const rnd=mulberry32(SEED);

console.log('— chargement…');
const g=loadGame('?train=1&sim=1&clone=0');
const ISO=g.get('__ISO'), T=g.get('__TRAIN');
const MLPc=T.bots[0].brain.constructor;
const PISTE_A=424242, PISTE_B=987654;              // une piste pour apprendre, une pour verifier

/* ---------- les deux especes ---------- */
function recetteNeuve(){                            // A. la RECETTE : 450 x 4 nombres, au hasard
  const c=new Float32Array(SLOTS*4);
  for(let i=0;i<SLOTS;i++){
    c[i*4  ]=rnd()*2-1;                             // volant
    c[i*4+1]=rnd()<0.85?1:(rnd()<0.5?0:-1);         // gaz
    c[i*4+2]=rnd()<0.4?1:0;                         // nitro
    c[i*4+3]=rnd()*2-1;                             // assiette
  }
  return c;
}
function recetteMutee(p,taux,ampl){
  const c=Float32Array.from(p);
  for(let i=0;i<SLOTS;i++){
    if(rnd()<taux){
      c[i*4  ]=Math.max(-1,Math.min(1,c[i*4]+(rnd()*2-1)*ampl));
      if(rnd()<0.3)c[i*4+1]=rnd()<0.85?1:(rnd()<0.5?0:-1);
      if(rnd()<0.3)c[i*4+2]=rnd()<0.4?1:0;
      c[i*4+3]=Math.max(-1,Math.min(1,c[i*4+3]+(rnd()*2-1)*ampl));
    }
  }
  return c;
}

/* ---------- une manche : on rend la DISTANCE atteinte ---------- */
const inArr=new Float32Array(T.inArr.length), outArr=new Float32Array(20);
function manche(indiv,type){
  const car=ISO.makeCar();
  car.mode='drive'; car.s=0; car.lat=0; car.v=26; car.side=1; car.driveDir=1;
  car.nitroR=1.2; car.graceT=1.6;
  const inp={steer:0,gas:1,nitro:false,pitch:0};
  const w={rnd:rnd,ev:null};
  let t=0,prochain=0,loin=0;
  for(let n=0;n<DUREE/DT;n++){
    if(t>=prochain){
      prochain+=TICK;
      if(type==='recette'){
        const k=Math.min(SLOTS-1,Math.floor(t/TICK))*4;
        inp.steer=indiv[k]; inp.gas=indiv[k+1]; inp.nitro=indiv[k+2]>0.5; inp.pitch=indiv[k+3];
      }else{
        T.brainInput(car);                          // LA MEME fonction d'entrees que le jeu
        indiv.forward(T.inArr,outArr);
        inp.steer=outArr[16]; inp.gas=outArr[17]; inp.nitro=outArr[18]>0.5; inp.pitch=outArr[19];
      }
    }
    ISO.stepCar(car,inp,DT,w);
    t+=DT;
    if(car.s>loin)loin=car.s;
    if(car.mode==='boom')break;
  }
  return loin;
}

/* ---------- l'evolution, exactement comme decrite : on supprime les plus nuls ---------- */
function evolue(type,piste){
  ISO.buildTrack(piste);
  let pop=[];
  for(let i=0;i<POP;i++) pop.push(type==='recette'?recetteNeuve():MLPc.random());
  const courbe=[];
  for(let gen=1;gen<=GENS;gen++){
    const notes=pop.map(p=>({p,d:manche(p,type)}));
    notes.sort((a,b)=>b.d-a.d);
    courbe.push({gen,best:Math.round(notes[0].d),med:Math.round(notes[Math.floor(POP/2)].d)});
    const gardes=notes.slice(0,GARDE).map(x=>x.p);   // les 12 meilleures survivent
    pop=gardes.slice();
    while(pop.length<POP){                            // ...et se dupliquent en mutant
      const p=gardes[Math.floor(rnd()*gardes.length)];
      pop.push(type==='recette'?recetteMutee(p,0.12,0.5):(()=>{const c=new MLPc(Float32Array.from(p.w));c.mutate(0.12,0.18);return c;})());
    }
  }
  return {courbe,champion:pop[0]};
}

const t0=Date.now();
console.log('— piste d apprentissage '+PISTE_A+', '+POP+' voitures, '+GENS+' manches, on supprime les '+(POP-GARDE)+' plus nulles\n');
console.log('        gen 1   gen 5   gen 10  gen 20  gen 30  gen '+GENS);
const res={};
for(const type of ['recette','cerveau']){
  const r=evolue(type,PISTE_A);
  res[type]=r;
  const at=n=>{const c=r.courbe[Math.min(n,r.courbe.length)-1];return String(c?c.best:'-').padStart(7);};
  console.log(type.toUpperCase().padEnd(8)+at(1)+at(5)+at(10)+at(20)+at(30)+at(GENS));
}
console.log('\n— ET SUR UNE PISTE JAMAIS VUE ('+PISTE_B+') ?');
ISO.buildTrack(PISTE_B);
for(const type of ['recette','cerveau']){
  const d=manche(res[type].champion,type);
  const apprise=res[type].courbe[res[type].courbe.length-1].best;
  console.log('  '+type.toUpperCase().padEnd(8)+' apprise '+String(apprise).padStart(6)+
              '   ·   inconnue '+String(Math.round(d)).padStart(6)+
              '   ('+(100*d/Math.max(1,apprise)).toFixed(0)+' % de sa performance)');
}
console.log('\n('+((Date.now()-t0)/1000).toFixed(0)+' s)');
process.exit(0);
