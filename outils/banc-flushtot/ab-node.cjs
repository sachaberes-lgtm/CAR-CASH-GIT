#!/usr/bin/env node
/* LE BANC NODE DU LOT FLUSHTOT (2026-11-18). Le vrai morceau code/moteur/flushtot.js, exécuté tel quel dans un faux décor (ALLEGE, BV, renderer, location),
   puis 12 courses simulées de 300 images chacune, avec des images de menu entre deux (BV.c = null). On vérifie, pour chaque interrupteur :
     défaut (ALLEGE)        : 1 flush par image dessinée, chaque course notée flt = 1 ;
     ?sans=flushtot         : 0 flush, aucune course notée (le comportement d'avant, au champ près) ;
     ordinateur (ALLEGE faux): 0 flush, rien de noté ;
     ?flushtot=ab           : flt alterne 0,1,0,1… ; flush seulement dans les courses flt = 1 (et dans le menu qui suit) ;
     un flush qui lève      : le lot s'éteint, l'image continue.
   node outils/banc-flushtot/ab-node.cjs   (sortie 0 = tout bon) */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=fs.readFileSync(path.join(__dirname,'..','..','code','moteur','flushtot.js'),'utf8');
function decor(qs,allege,flushLeve){
  const ctx={location:{search:qs},ALLEGE:allege,BV:{on:true,c:null},BANC_FIGE:false,window:{},nFlush:0};
  ctx.renderer={getContext:()=>({flush:()=>{if(flushLeve)throw new Error('perdu');ctx.nFlush++;}})};
  vm.createContext(ctx);vm.runInContext(SRC+'\n;this.flushTot=flushTot;this.FLUSHT=FLUSHT;',ctx);return ctx;}
function joue(ctx,nc){const C=[],parCourse=[];
  for(let k=0;k<nc;k++){
    for(let i=0;i<20;i++){ctx.BV.c=null;ctx.flushTot();} /* menu */
    const c={};const f0=ctx.nFlush;
    for(let i=0;i<300;i++){ctx.flushTot();if(i===0)ctx.BV.c=c;} /* bvImage crée la course APRÈS le rendu de sa 1re image */
    C.push(c.flt);parCourse.push(ctx.nFlush-f0);}
  return {flt:C,flush:parCourse};}
let ok=true;const dit=(nom,v,attendu)=>{const b=JSON.stringify(v)===JSON.stringify(attendu);ok=ok&&b;console.log((b?'✔ ':'✘ ')+nom+' : '+JSON.stringify(v)+(b?'':'  (attendu '+JSON.stringify(attendu)+')'));};
{const r=joue(decor('?tel=1',true),4);dit('défaut, flt',r.flt,[1,1,1,1]);dit('défaut, flush par course (300 images)',r.flush,[300,300,300,300]);}
{const r=joue(decor('?tel=1&sans=flushtot',true),4);dit('?sans=flushtot, flt',r.flt,[undefined,undefined,undefined,undefined]);dit('?sans=flushtot, flush',r.flush,[0,0,0,0]);}
{const r=joue(decor('?sans=lourd,flushtot',true),2);dit('?sans=lourd,flushtot (liste), flush',r.flush,[0,0]);}
{const r=joue(decor('',false),4);dit('ordinateur, flt',r.flt,[undefined,undefined,undefined,undefined]);dit('ordinateur, flush',r.flush,[0,0,0,0]);}
{const r=joue(decor('?tel=1&flushtot=ab',true),6);dit('?flushtot=ab, flt',r.flt,[0,1,0,1,0,1]);
  /* la 1re image d'une course garde l'état de la course d'avant (la course n'existe pas encore au rendu) : 299 + 1 */
  dit('?flushtot=ab, flush par course',r.flush,[1,299,1,299,1,299]);}
{const x=decor('?tel=1',true,true);const r=joue(x,2);dit('flush qui lève (dès le menu) : flt',r.flt,[0,0]);dit('flush qui lève : aucun flush compté',r.flush,[0,0]);dit('flush qui lève : FLUSHT.on',x.FLUSHT.on,false);}
{const x=decor('?tel=1',true);vm.runInContext('window.dbgFlushtot({fige:1});',x);dit('dbgFlushtot({fige:1}) fige',x.BANC_FIGE,true);
  const s=decor('?tel=1&sans=flushtot',true);const e=vm.runInContext('window.dbgFlushtot({on:1})',s);dit('dbgFlushtot({on:1}) sous ?sans : reste coupé',e.on,false);}
console.log(ok?'TOUT BON':'ÉCHEC');process.exit(ok?0:1);
