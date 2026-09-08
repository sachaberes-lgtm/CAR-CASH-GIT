#!/usr/bin/env node
/* DIAG — percentiles des valeurs BRUTES que le cerveau voit, sur les bots en course.
   Sert a calibrer les normalisations sur la distribution REELLE (pas sur la mediane du joueur). */
const {loadGame}=require('./sim-env');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const SEED=arg('seed',3), DUREE=arg('t',20);
const DT=1/60;

const g=loadGame('?train=1&sim=1&clone=0');
const T=g.get('__TRAIN');
T.reseed(SEED); T.GEN=0; T.evalIdx=0; T.newGen(true);

const raw={v:[],lat:[],psi:[],nitroR:[],vy:[]};
const o0=T.brainInput;
T.brainInput=function(b){
  o0(b);
  raw.v.push(Math.abs(b.v)); raw.lat.push(Math.abs(b.lat));
  raw.psi.push(Math.abs(b.psi)); raw.nitroR.push(b.nitroR); raw.vy.push(Math.abs(b.fallVel.y));
};

const log0=console.log; console.log=()=>{};
for(let i=0;i<Math.round(DUREE/DT);i++) T.tick(DT);
console.log=log0;

function pct(a,p){ const b=a.slice().sort((x,y)=>x-y); return b[Math.floor(p*(b.length-1))]; }
const names={v:'|vitesse| m/s',lat:'|lat| m',psi:'|psi| rad',nitroR:'nitroR',vy:'|vy| m/s'};
console.log('=== PERCENTILES BRUTS (bots aleatoires, '+DUREE+' s) ===');
console.log('  champ     p5     p25    p50    p75    p95    max');
for(const k of Object.keys(raw)){
  const a=raw[k];
  console.log('  '+names[k].padEnd(12)+[0.05,0.25,0.5,0.75,0.95].map(p=>pct(a,p).toFixed(1).padStart(6)).join('')+
              Math.max(...a).toFixed(1).padStart(7));
}
process.exit(0);
