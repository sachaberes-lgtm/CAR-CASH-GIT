#!/usr/bin/env node
/* ===== L'ENTRAINEMENT SUR LE VRAI JEU (2026-10-20, Sacha : « DES BOTS FONCTIONNEL SUR LA VERSION ACTUELLE DU JEU ») =====
   Evolution simple : une population de cerveaux, chacun conduit une partie du VRAI jeu (index.html publie, voir jeu-reel.js)
   avec les seules touches d'un clavier ; la moitie qui a fait le moins de chemin est remplacee par des enfants mutes de l'autre.
   Pas de recompense inventee : la note = la distance parcourue en `--tmax` secondes de jeu (mourir = s'arreter).
   Deux ouvriers en parallele (un jeu charge chacun). Tout est ecrit au fil de l'eau : on peut tuer et reprendre (--reprendre).
   usage : node entrainer.js [--pop 16] [--gens 40] [--tmax 40] [--workers 2] [--graine 1] [--reprendre] */
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const C=require('./cerveau');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?+process.argv[i+1]:d; };
const POP=arg('pop',16), GENS=arg('gens',40), TMAX=arg('tmax',40), NW=Math.max(1,Math.min(arg('workers',2),os.cpus().length));
const GRAINE=arg('graine',1), REPRENDRE=process.argv.indexOf('--reprendre')>0;
const DIR=path.join(__dirname,'results'); fs.mkdirSync(DIR,{recursive:true});
const FPOP=path.join(DIR,'pop-reel-g'+GRAINE+'.json'), FCHAMP=path.join(DIR,'champion-reel-g'+GRAINE+'.json');

/* alea reproductible (mulberry32) */
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; }; }
const R=rng(GRAINE*7919+13);
const gauss=()=>{ let u=0,v=0; while(!u)u=R(); while(!v)v=R(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v); };

let pop=[], gen0=0, record=0, hist=[];
if(REPRENDRE&&fs.existsSync(FPOP)){ const j=JSON.parse(fs.readFileSync(FPOP,'utf8')); pop=j.pop.map(a=>Float64Array.from(a)); gen0=j.gen; record=j.record||0; hist=j.hist||[]; console.log('REPRISE a la generation',gen0); }
else for(let i=0;i<POP;i++) pop.push(Float64Array.from({length:C.SIZE},()=>(R()-.5)*1.2));

/* les ouvriers */
const ouvriers=[]; let file=[], enCours=0, resolveGen=null, resultats=null;
function lancerOuvrier(){
  const w=cp.fork(path.join(__dirname,'worker.js'),{silent:true}); const o={w:w,libre:false,tache:null};
  w.stderr.on('data',()=>{});
  w.on('message',m=>{ if(m.pret){ o.libre=true; donner(); return; }
    resultats[m.id]=m.r; o.libre=true; o.tache=null; enCours--; donner(); if(enCours===0&&file.length===0&&resolveGen){ const r=resolveGen; resolveGen=null; r(); } });
  w.on('exit',()=>{ if(o.tache!==null){ resultats[o.tache.id]={dist:0,mort:true,erreur:'ouvrier mort'}; enCours--; } o.libre=false; });
  ouvriers.push(o);
}
function donner(){ for(const o of ouvriers){ if(o.libre&&file.length){ const t=file.shift(); o.libre=false; o.tache=t; o.w.send(t); } } }
function evaluerPop(graine){
  resultats=new Array(pop.length); file=pop.map((w,i)=>({id:i,w:Array.from(w),graine:graine,tmax:TMAX})); enCours=pop.length;
  return new Promise(res=>{ resolveGen=res; donner(); });
}

(async function(){
  for(let i=0;i<NW;i++) lancerOuvrier();
  const t0=Date.now();
  for(let g=gen0; g<gen0+GENS; g++){
    const tg=Date.now();
    await evaluerPop(1000*GRAINE+g);
    const fit=resultats.map(r=>r.dist||0);
    const ordre=fit.map((f,i)=>i).sort((a,b)=>fit[b]-fit[a]);
    const best=fit[ordre[0]], med=fit[ordre[POP>>1]], mean=fit.reduce((a,b)=>a+b,0)/POP;
    const morts=resultats.filter(r=>r.mort).length, rb=resultats[ordre[0]];
    const err=resultats.find(r=>r.erreur);
    if(best>record){ record=best; fs.writeFileSync(FCHAMP,JSON.stringify({gen:g,dist:Math.round(best),tmax:TMAX,graine:1000*GRAINE+g,w:Array.from(pop[ordre[0]])})); }
    hist.push(Math.round(best));
    console.log('GEN',String(g).padStart(3),'| meilleur',Math.round(best).toString().padStart(6),'m | mediane',Math.round(med).toString().padStart(6),'| moyenne',Math.round(mean).toString().padStart(6),
      '| morts',morts+'/'+POP,'| vMax',Math.round(rb.vMax||0),'| air',(rb.air||0).toFixed(1)+'s','| record',Math.round(record),'|',((Date.now()-tg)/1000).toFixed(0)+'s'+(err?' | ERREUR '+err.erreur:''));
    /* selection : la meilleure moitie reste (les 2 premiers intacts), l'autre moitie = enfants mutes de la meilleure moitie */
    const garde=ordre.slice(0,POP>>1), nouv=[];
    for(const i of garde) nouv.push(pop[i]);
    while(nouv.length<POP){
      const p=pop[garde[Math.floor(R()*garde.length)]], e=Float64Array.from(p);
      const fort=R()<.25, sig=fort?.5:.18, proba=fort?.4:.2;
      for(let k=0;k<e.length;k++) if(R()<proba) e[k]+=gauss()*sig;
      nouv.push(e);
    }
    pop=nouv;
    fs.writeFileSync(FPOP,JSON.stringify({gen:g+1,record:record,hist:hist,pop:pop.map(a=>Array.from(a))}));
  }
  console.log('FIN :',GENS,'generations en',((Date.now()-t0)/60000).toFixed(1),'min | record',Math.round(record),'m | courbe',hist.join(' '));
  for(const o of ouvriers) o.w.send({stop:1});
  setTimeout(()=>process.exit(0),500);
})();
