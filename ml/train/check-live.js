#!/usr/bin/env node
/* ================================================================================================
   CHECK-LIVE — les trois chiffres que Sacha regarde
   ------------------------------------------------------------------------------------------------
   Aucun rapport ne peut dire « ca marche » sans ces trois-la. Ils repondent exactement aux trois
   choses qu il a vues a l ecran et que j avais ratees :
       · « elles roulent beaucoup trop lentement »        -> VITESSE MOYENNE
       · « elles font toutes les memes mouvements »       -> ECART-TYPE DES POSITIONS a t=2 s
       · « elles se jettent dans le vide »                -> % ENCORE SUR LA ROUTE a t=5 s
   Dix secondes de simulation, le meme code que le navigateur, deterministe.

   Usage : node check-live.js [--seed 3] [--random]
   ================================================================================================ */
const fs=require('fs'),path=require('path');
const {loadGame}=require('./sim-env');

const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const RANDOM=process.argv.indexOf('--random')>0;
const SEEDS=[arg('seed',3),5];
const DT=1/60;

const BR=path.join(__dirname,'results','cloned-brain.json');
let brain=null;
if(!RANDOM&&fs.existsSync(BR)){ try{ brain=JSON.parse(fs.readFileSync(BR,'utf8')); }catch(e){} }

function manche(seed){
  const g=loadGame('?train=1&sim=1'+(brain?'':'&clone=0'));
  const T=g.get('__TRAIN');
  if(brain){
    if(brain.w.length!==T.bots[0].brain.w.length)
      return {err:'cloned-brain.json a '+brain.w.length+' poids, le jeu en attend '+T.bots[0].brain.w.length};
    T.seedBrain=Float32Array.from(brain.w);
  }
  T.reseed(seed); T.GEN=0; T.evalIdx=0; T.newGen(true);
  const log=console.log; console.log=()=>{};
  let sv=0,sn=0, ecart2=null, surRoute5=null;
  for(let i=0;i<Math.round(10/DT);i++){
    T.tick(DT);
    for(const b of T.bots) if(b.alive&&b.mode==='drive'){ sv+=b.v; sn++; }
    const t=(i+1)*DT;
    if(ecart2===null&&t>=2){                       // DIVERSITE : font-elles la meme chose ?
      const p=T.bots.filter(b=>b.alive).map(b=>b.s);
      const m=p.reduce((a,b)=>a+b,0)/Math.max(1,p.length);
      ecart2=Math.sqrt(p.reduce((a,b)=>a+(b-m)*(b-m),0)/Math.max(1,p.length));
    }
    if(surRoute5===null&&t>=5)                     // TIENNENT-ELLES LA ROUTE ?
      surRoute5=100*T.bots.filter(b=>b.alive&&b.mode==='drive').length/T.bots.length;
  }
  console.log=log;
  return { v:sv/Math.max(1,sn)*3.6*0.5, ecart:ecart2||0, route:surRoute5||0 };
}

console.log('');
console.log('=============== CE QUE FONT LES VOITURES, SUR 10 SECONDES ===============');
console.log(brain?('  depart AMORCE par results/cloned-brain.json ('+brain.pas+' pas de demo)')
                 :'  depart ALEATOIRE (aucun cerveau clone, ou --random)');
console.log('');
console.log('  graine |  vitesse moyenne  |  ecart-type des positions  |  sur la route');
console.log('         |                   |          a t=2 s           |    a t=5 s');
let ok=true;
for(const sd of SEEDS){
  const r=manche(sd);
  if(r.err){ console.error('  ECHEC : '+r.err); process.exit(1); }
  console.log('  '+String(sd).padStart(6)+' | '+(r.v.toFixed(0)+' km/h').padStart(17)+
              ' | '+(r.ecart.toFixed(1)+' m').padStart(26)+' | '+(r.route.toFixed(0)+' %').padStart(13));
  if(r.v<40) ok=false;
}
console.log('');
console.log('  Reperes : toi, en jouant, tu roules a 243 km/h de mediane.');
console.log('            un ecart-type proche de 0 = elles font toutes la meme chose.');
console.log('            0 % sur la route a 5 s = elles sont deja toutes en l air ou mortes.');
if(!ok) console.log('\n  ⚠ vitesse moyenne sous 40 km/h : elles sont en roue libre ou a l arret.');
console.log('========================================================================');
process.exit(0);
