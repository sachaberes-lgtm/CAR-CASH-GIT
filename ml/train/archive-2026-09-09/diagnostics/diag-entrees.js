#!/usr/bin/env node
/* ================================================================================================
   DIAG-ENTREES — sante des 11 entrees du cerveau, MESUREE SUR LES BOTS EN COURSE.
   ------------------------------------------------------------------------------------------------
   Le RAPPORT-SESSION §3.7 avait mesure 8 entrees mortes/saturees sur la DEMO DU JOUEUR. Le Bug #19
   (CRITIC) dit que la normalisation est de toute facon calibree sur la mediane du joueur (135 m/s),
   pas sur ce que les bots font reellement. Ce diagnostic tranche : on fait tourner des bots
   ALEATOIRES en course, et a chaque decision du cerveau on releve la valeur NORMALISEE (ce que le
   reseau voit) ET la brute. On en tire, par entree : min/max/ecart-type et % sature (|x|>0.99).

   Une entree saine : ecart-type > ~0.2, saturation < ~20 %. Une entree morte : ecart-type ~0 ou
   saturation ~100 %. C'est LA cause racine de l'immobilisme : un reseau ne peut pas apprendre a
   conduire avec une observation majoritairement constante.

   Usage : node diag-entrees.js [--seed 3] [--t 15]
   ================================================================================================ */
const {loadGame}=require('./sim-env');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const SEED=arg('seed',3), DUREE=arg('t',15);
const DT=1/60;

console.log('— chargement…');
const g=loadGame('?train=1&sim=1&clone=0');
const T=g.get('__TRAIN'), ISO=g.get('__ISO');
T.reseed(SEED); T.GEN=0; T.evalIdx=0; T.newGen(true);
const NIN=T.inArr.length;

/* ---- wrapper : a chaque decision du cerveau, on releve normalise + brut ---- */
const samples=[];
const o0=T.brainInput;
T.brainInput=function(b){
  o0(b);                                   // remplit T.inArr
  samples.push({
    in:Float32Array.from(T.inArr),
    v:b.v, lat:b.lat, psi:b.psi, nitroR:b.nitroR,
    enVol:(b.mode==='fall')?1:0, vy:b.fallVel.y, fy:b.fallPos.y, s:b.s
  });
};

/* ---- faire tourner DUREE secondes ---- */
const log0=console.log; console.log=()=>{};
for(let i=0;i<Math.round(DUREE/DT);i++) T.tick(DT);
console.log=log0;

const n=samples.length;
if(!n){ console.error('ECHEC : aucun echantillon'); process.exit(1); }

/* ---- stats par entree ---- */
const noms=['vitesse (v-135)/110','lat /ROAD_HALF','psi /0.5','nitro /2.2','en vol (bin)',
            'courb 120 *55','courb 300 *110','raccourci (gain/300)','hauteur vol /40','vy vol /300','vy /300'];
const NOM_BRUT=['v m/s','lat m','psi rad','nitroR','enVol','courb120 rad/m','courb300 rad/m','gainRacc m','hVol m','vy m/s','vy m/s'];

function stats(xs){
  const mn=Math.min(...xs), mx=Math.max(...xs);
  const m=xs.reduce((a,b)=>a+b,0)/xs.length;
  const sd=Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/xs.length);
  const sat=100*xs.filter(x=>Math.abs(x)>0.99).length/xs.length;
  const cst=100*xs.filter(x=>x===xs[0]).length/xs.length;
  return {mn,mx,sd,sat,cst};
}

console.log('\n=== SANTE DES '+NIN+' ENTREES — bots aleatoires, '+DUREE+' s de course, '+n+' decisions ===');
console.log('  #  | entree (normalisation)      | min     max     | ecart-ty | sat.%% | const.%% | brute (min..max)');
const res=[];
for(let i=0;i<NIN;i++){
  const xs=samples.map(s=>s.in[i]);
  const st=stats(xs);
  res.push(st);
  // brute correspondante
  const key=['v','lat','psi','nitroR','enVol',null,null,null,'fy','vy','vy'][i];
  let brut='';
  if(key){ const ys=samples.map(s=>s[key]); brut=ys.reduce((a,b)=>a+b,0)/ys.length;
           brut=''+ys.reduce((a,b)=>a+b,0)/ys.length;
  }
  const verdict=(st.sd<0.05||st.sat>95)?'MORTE':(st.sat>60||st.cst>90)?'saturee':'ok';
  console.log('  '+String(i).padStart(2)+' | '+noms[i].padEnd(28)+' | '+st.mn.toFixed(2).padStart(6)+' '+st.mx.toFixed(2).padStart(6)+
              ' | '+st.sd.toFixed(3).padStart(8)+' | '+st.sat.toFixed(0).padStart(4)+' | '+st.cst.toFixed(0).padStart(6)+' | '+verdict);
}
console.log('');
const mortes=res.filter(st=>st.sd<0.05||st.sat>95).length;
const saturees=res.filter(st=>st.sat>60||st.cst>90).length;
const saines=res.filter(st=>!(st.sd<0.05||st.sat>95)&&!(st.sat>60||st.cst>90)).length;
console.log('  VERDICT : '+saines+' saines · '+saturees+' saturees · '+mortes+' mortes  (sur '+NIN+')');
console.log('  Rappel : le joueur roule a 135 m/s de mediane ; un bot aleatoire a '+samples.map(s=>s.v).reduce((a,b)=>a+b,0)/n+' m/s de moyenne.');
process.exit(0);
