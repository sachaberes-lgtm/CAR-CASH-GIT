#!/usr/bin/env node
/* ================================================================================================
   CHECK-ISO — LA PREUVE CHIFFREE QUE LA PHYSIQUE EST PARTAGEE
   ------------------------------------------------------------------------------------------------
   On fabrique une sequence d'entrees (deterministe : meme graine, meme sequence a chaque run), puis
   on la REJOUE DEUX FOIS, l'une apres l'autre :
     · manche 1, chemin JOUEUR : globales du jeu -> pcarPush -> stepCar -> pcarPull -> globales
     · manche 2, chemin BOT    : un objet caisse nu -> stepCar
   Entre les deux, LE MONDE EST REMIS A NEUF (la piste est rebatie a la meme graine) : les plots se
   consomment (c9.hit), donc rejouer en parallele ferait manquer au second ce que le premier a
   renverse — ce serait le test qui mentirait, pas le jeu.

   Si stepCar est vraiment le seul moteur, les deux traces sont identiques AU BIT PRES. Le moindre
   reste de copie, ou un champ oublie dans le va-et-vient globales<->PCAR, se voit ici sous la forme
   d'un ecart qui explose.

   Ce test ne dit PAS « la physique est juste » : il dit « il n'y en a qu'une ».

   Usage : node check-iso.js [nbPas]
   ================================================================================================ */
const {loadGame}=require('./sim-env');

const STEPS=parseInt(process.argv[2]||'3000',10);
const DT=1/60;
const TOL=1e-9;
const TRACK_SEED=424242;
const RESET_EVERY=200;  // longueur d'une manche : on multiplie les departs pour couvrir la piste
const RND_SEED=20260908;

// PRNG semé (mulberry32) : entrees ET alea de la physique doivent etre REJOUABLES, sinon les deux
// chemins divergeraient pour une raison qui n'a rien a voir avec l'isomorphisme.
function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

console.log('— chargement du jeu (headless)…');
const g=loadGame('?train=1&sim=1');
const ISO=g.get('__ISO');
if(!ISO||!ISO.stepCar){ console.error('__ISO absent : le hook de train.html n\'est pas en place.'); process.exit(1); }

/* ---------- LE MONDE, REMIS A NEUF AVANT CHAQUE MANCHE ----------
   La piste est celle que genere le jeu, TELLE QUELLE : on n'y ajoute rien. Une piste de ce niveau
   n'a ni tremplin ni trou, c'est normal — le test se contente donc de ce qu'elle offre vraiment
   (roulage, bord, vol, atterrissage, tranche, pads, plots) et le DIT au lieu de fabriquer un decor
   qui n'existe pas en jeu.
   La rebatir entre les deux manches est indispensable : les plots se consomment (c9.hit), et le
   second passage ne verrait plus ce que le premier a renverse. */
function resetWorld(){ ISO.buildTrack(TRACK_SEED); return ISO.track(); }
const TR=resetWorld();
console.log('— piste '+TRACK_SEED+' : L='+Math.round(TR.L)+' NP='+TR.NP+
            ' — pads '+TR.PADS+', tremplins '+TR.RAMPS+', plots '+TR.CONES+', flaques '+TR.OILS+', trous '+TR.HOLES);

/* ---------- la sequence d'entrees : un pilote imaginaire, mais TOUJOURS LE MEME ---------- */
const INPUTS=new Array(STEPS);
{
  const r=mulberry32(987654321);
  let st=0,gas=1,nit=false,pit=0;
  for(let i=0;i<STEPS;i++){
    if(i%9===0)  st =(r()*2-1);                 // il rebraque toutes les 9 frames
    if(i%23===0) gas=r()<.82?1:(r()<.5?0:-1);   // il leve le pied, freine parfois
    if(i%17===0) nit=r()<.45;                   // il joue de la nitro
    if(i%13===0) pit=(r()*2-1);                 // et de l'assiette en vol
    INPUTS[i]={steer:st,gas:gas,nitro:nit,pitch:pit};
  }
}

/* ---------- l'etat de depart d'une manche (identique des deux cotes) ---------- */
function freshState(n){
  const r=mulberry32(1000+n*7919);
  return {
    mode:'drive', s:40+r()*(TR.L*.5), lat:(r()*2-1)*10, v:26+r()*40, vL:0, psi:(r()*2-1)*.3,
    side:1, driveDir:1, steer:0, steerHold:0, momT:0, driftT:0,
    graceT:1.6, sideCd:0, slipT:0, boost:0, padCd:0, rampCd:0, oilCd:0,
    hopY:0, hopV:0, idleT:0, safeS:0, pureT:0, pureArmed:true, kmh:0, sPrev:0,
    nitroR:1.2, nitroX:0, nitroOn:false, nitroBlue:false,
    pwrNitroT:0, pwrSpdT:0, pwrAirT:0, introD:false, park:false,
    fallT:0, fallTR:0, dtF:0, yawAcc:0, airRate:1, nitroAirT:0, airRoll:0,
    fallUnder:false, fallStartSide:1, bounceN:0, gapArmed:0,
    lastNearY:0, lastNearS:0, lastNearH2:0,
    curNear:false, curHOff:0, curLatOff:0, rdNear:false, rdHOff:0, rdLatOff:0, landI:-1,
    prevTvalid:false,
    fx:0,fy:0,fz:0, vx:0,vy:0,vz:0, px:0,py:0,pz:0, qx:0,qy:0,qz:0,qw:1
  };
}

/* ---------- les deux chemins, meme interface ---------- */
const VEC=['fx','fy','fz','vx','vy','vz','px','py','pz','qx','qy','qz','qw'];
const bot=ISO.makeCar();
const PATHS={
  joueur:{
    set:o=>ISO.setPlayer(o),
    get:()=>ISO.getPlayer(),
    step:(inp,dt,w)=>{ ISO.PWORLD.rnd=w.rnd; ISO.PWORLD.ev=w.ev; ISO.playerStep(inp,dt); }
  },
  bot:{
    set:function(o){
      for(const k in o){ if(VEC.indexOf(k)<0) bot[k]=o[k]; }
      bot.fallPos.set(o.fx,o.fy,o.fz); bot.fallVel.set(o.vx,o.vy,o.vz); bot.prevTv.set(o.px,o.py,o.pz);
      bot.quat.set(o.qx,o.qy,o.qz,o.qw);
    },
    get:function(){
      const o={};
      for(const k in bot){ if(k.charAt(0)==='_')continue; const v=bot[k]; if(typeof v!=='object')o[k]=v; }
      o.fx=bot.fallPos.x;o.fy=bot.fallPos.y;o.fz=bot.fallPos.z;
      o.vx=bot.fallVel.x;o.vy=bot.fallVel.y;o.vz=bot.fallVel.z;
      o.px=bot.prevTv.x;o.py=bot.prevTv.y;o.pz=bot.prevTv.z;
      o.qx=bot.quat.x;o.qy=bot.quat.y;o.qz=bot.quat.z;o.qw=bot.quat.w;
      return o;
    },
    step:(inp,dt,w)=>ISO.stepCar(bot,inp,dt,w)
  }
};

/* ---------- UNE MANCHE COMPLETE ---------- */
function replay(P){
  resetWorld();                                   // monde NEUF : plots debout, piste identique
  const w={rnd:mulberry32(RND_SEED),ev:[]};
  const trace=new Array(STEPS);
  const evs=new Array(STEPS);
  const seen={};
  let nReset=0,nFall=0,nLand=0,nBoom=0;
  P.set(freshState(0));
  for(let i=0;i<STEPS;i++){
    P.step(INPUTS[i],DT,w);
    const S=P.get();
    trace[i]=S;
    evs[i]=w.ev.map(e=>e.type);
    for(const ty of evs[i]) seen[ty]=(seen[ty]||0)+1;
    if(S.mode==='fall'&&S.fallT<=DT*S.airRate+1e-12)nFall++;
    if(S.mode==='drive'&&S.fallT>0.05)nLand++;
    if(S.mode==='boom')nBoom++;
    // Remise a zero : mort, bout de piste, ou simplement fin de manche. On redemarre souvent A
    // DESSEIN — une seule trajectoire ne croise pas forcement un tremplin, un plot ET une flaque.
    if(S.mode==='boom'||S.s>TR.L-40||S.s<2||(i%RESET_EVERY===RESET_EVERY-1)){
      nReset++; P.set(freshState(nReset));
    }
  }
  return {trace:trace,evs:evs,seen:seen,nReset:nReset,nFall:nFall,nLand:nLand,nBoom:nBoom};
}

console.log('— manche 1 : le chemin JOUEUR…');
const A=replay(PATHS.joueur);
console.log('— manche 2 : le chemin BOT…');
const B=replay(PATHS.bot);

/* ---------- LA COMPARAISON ---------- */
const WATCH=['s','lat','v','vL','psi','fx','fy','fz','vx','vy','vz','fallT','fallTR','nitroR','yawAcc'];
const DISCRET=['mode','side','driveDir','nitroOn','nitroBlue','prevTvalid','fallUnder','bounceN','gapArmed'];
const worst={}; for(const k of WATCH) worst[k]=0;
let worstAny=0,worstKey='',worstStep=-1,mismatch=null;
for(let i=0;i<STEPS&&!mismatch;i++){
  const a=A.trace[i],b=B.trace[i];
  if(A.evs[i].join(',')!==B.evs[i].join(',')){
    mismatch={step:i,key:'evenements',a:'['+A.evs[i]+']',b:'['+B.evs[i]+']'};break;
  }
  for(const k of DISCRET) if(a[k]!==b[k]){ mismatch={step:i,key:k,a:a[k],b:b[k]};break; }
  if(mismatch)break;
  for(const k of WATCH){
    const d=Math.abs(a[k]-b[k]);
    if(d>worst[k])worst[k]=d;
    if(d>worstAny){worstAny=d;worstKey=k;worstStep=i;}
    if(d>TOL&&!mismatch)mismatch={step:i,key:k,a:a[k],b:b[k]};
  }
}

/* ---------- VERDICT ---------- */
console.log('— '+STEPS+' pas par manche  (decollages '+A.nFall+', atterrissages '+A.nLand+
            ', morts '+A.nBoom+', departs '+(A.nReset+1)+')');
console.log('— branches traversees : '+Object.keys(A.seen).sort().map(k=>k+'×'+A.seen[k]).join(' · '));
if(mismatch){
  console.error('\nECHEC — les deux chemins ont diverge au pas '+mismatch.step+' :');
  console.error('   '+mismatch.key+' : joueur='+mismatch.a+'   bot='+mismatch.b);
  console.error('   => il reste une copie de physique, ou pcarPush/pcarPull perd ce champ.');
  process.exit(1);
}
{ // On n'exige QUE ce que cette piste contient reellement. Ce qu'elle n'a pas (tremplins, trous...)
  // est signale, pas reproche : on ne fabrique pas de decor pour faire monter un chiffre.
  const must=['takeoff','land','pad','cone'];   // toujours presents sur une piste de course
  const opt={ramp:TR.RAMPS,oil:TR.OILS,hop:0};  // presents seulement si la piste en a
  const miss=must.filter(k=>!A.seen[k]);
  if(miss.length){
    console.error('\nECHEC — branches jamais atteintes : '+miss.join(', ')+
                  ' (le test ne couvre pas assez de physique pour conclure).');
    process.exit(1);
  }
  const absent=Object.keys(opt).filter(k=>!A.seen[k]);
  if(absent.length) console.log('— non traversees sur cette piste (elle n\'en contient pas) : '+absent.join(', '));
}
console.log('— ecart maximum, champ par champ :');
for(const k of WATCH) console.log('     '+k.padEnd(7)+worst[k].toExponential(3));
console.log('— ECART MAX GLOBAL : '+worstAny.toExponential(3)+
            (worstStep>=0?('  ('+worstKey+', pas '+worstStep+')'):''));
if(worstAny<TOL){
  console.log('\nOK — ecart max '+worstAny.toExponential(3)+' < '+TOL.toExponential(0)+
              ' : joueur et bots executent LA MEME physique.');
  process.exit(0);
}
console.error('\nECHEC — ecart max '+worstAny.toExponential(3)+' >= '+TOL.toExponential(0)+
              ' : la physique n\'est pas (entierement) partagee.');
process.exit(1);
