#!/usr/bin/env node
/* ================================================================================================
   MULTI-TRAIN — lanceur multi-cœurs du mode entraînement (HANDOVER §7.2)
   ------------------------------------------------------------------------------------------------
   « 12 cœurs, un seul utilisé. » Ce lanceur répartit N graines sur N cœurs : chaque graine = une
   évolution indépendante (cerveaux initiaux + pistes + mutations distincts), dans son propre
   process child. Résultat : N× d'expérience d'évolution à temps de mur quasi-égal.

   Chaque child = `node sim-train.js --seed X --gens G --random`. On capture la ligne `RESUME {json}`
   (record + courbe d'apprentissage) et on agrège.

   Usage : node multi-train.js [--seeds 8] [--gens 25]
   ================================================================================================ */
const {spawn}=require('child_process');
const os=require('os');
const path=require('path');

const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?parseInt(process.argv[i+1],10):d; };
const NSEEDS=Math.min(arg('seeds',8), Math.max(1,os.cpus().length));
const GENS=arg('gens',25);
const SIM=path.join(__dirname,'sim-train.js');
// --wcut X : poids de la recompense de coupe (A/B xp-coupe). Absent = celui du code.
const wcutIdx=process.argv.indexOf('--wcut');
const WCUT=wcutIdx>0?process.argv[wcutIdx+1]:null;
// --auto : pilote du Survivant comme contrôleur au sol (TRAIN.AUTO_GROUND, §7.4).
const AUTO=process.argv.indexOf('--auto')>0;

function median(a){ const b=a.slice().sort((x,y)=>x-y); const n=b.length;
  return n?Math.round(n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2):0; }

function run(seed){
  return new Promise((res)=>{
    const args=[SIM,'--seed',String(seed),'--gens',String(GENS),'--random'];
    if(WCUT!==null) args.push('--wcut',WCUT);
    if(AUTO) args.push('--auto');
    const p=spawn('node',args,{cwd:__dirname});
    let out='',err='';
    p.stdout.on('data',d=>out+=d);
    p.stderr.on('data',d=>err+=d);
    p.on('close',code=>{
      const m=out.match(/RESUME (\{.*\})/);
      let resume=null;
      if(m){ try{ resume=JSON.parse(m[1]); }catch(e){} }
      res({seed,code,resume,err:err.trim()});
    });
  });
}

(async()=>{
  const t0=Date.now();
  const seeds=Array.from({length:NSEEDS},(_,k)=>1000+k*101);  // graines bien distinctes
  console.log('multi-train — '+NSEEDS+' cœurs, '+NSEEDS+' graines, '+GENS+' générations chacune'+
              (WCUT!==null?' · W_CUT='+WCUT:'')+(AUTO?' · PILOTE AU SOL':'')+'\n');
  const results=await Promise.all(seeds.map(run));
  results.sort((a,b)=>a.seed-b.seed);

  console.log(' graine | distance | fitness | générations | OK');
  let ok=0; const dists=[]; const fits=[]; const cuts=[]; const gains=[]; const deaths={};
  for(const r of results){
    const dist=r.resume?r.resume.maxTotD:null;    // la DISTANCE (ce qui compte : aller loin)
    const fit=r.resume?r.resume.record:null;      // la FITNESS (gonflee par W_CUT*cutGain)
    const gen=r.resume?r.resume.gen:null;
    const fin=(r.code===0);
    if(fin) ok++; if(dist!=null) dists.push(dist); if(fit!=null) fits.push(fit);
    if(r.resume&&r.resume.cuts!=null) cuts.push(r.resume.cuts);
    if(r.resume&&r.resume.cutGain!=null) gains.push(r.resume.cutGain);
    if(r.resume&&r.resume.deaths) for(const k in r.resume.deaths) deaths[k]=(deaths[k]||0)+r.resume.deaths[k];
    console.log(String(r.seed).padStart(7)+' | '+(dist!=null?String(dist).padStart(8):'   —   ')+
                ' | '+(fit!=null?String(fit).padStart(7):'   —  ')+
                ' | '+(gen!=null?String(gen).padStart(11):'   —  ')+' | '+(fin?'OK':'ECHEC'));
  }
  const dt=((Date.now()-t0)/1000);
  console.log('\n DISTANCE (totD)  : meilleur '+(dists.length?Math.max(...dists):'—')+
              ' · médiane '+(dists.length?median(dists):'—')+
              ' · moyenne '+(dists.length?Math.round(dists.reduce((a,b)=>a+b,0)/dists.length):'—'));
  console.log(' fitness  (note)  : meilleur '+(fits.length?Math.max(...fits):'—')+
              ' · médiane '+(fits.length?median(fits):'—'));
  if(Object.keys(deaths).length) console.log(' morts cumulés : '+Object.keys(deaths).map(k=>k+' '+deaths[k]).join(' · '));
  console.log(' coupes du champion : '+cuts.join(' · ')+'  (bonnes coupes)  ·  gain net cumulé : '+gains.reduce((a,b)=>a+b,0)+' m');
  console.log(' '+ok+'/'+NSEEDS+' graines terminées en '+dt.toFixed(0)+' s de mur ('+NSEEDS+' évolutions indépendantes)');
  process.exit(ok===NSEEDS?0:1);
})();
