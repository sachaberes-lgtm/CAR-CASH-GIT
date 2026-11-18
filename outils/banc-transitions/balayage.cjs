#!/usr/bin/env node
/* LE BANC DU BALAYAGE, SANS NAVIGATEUR (2026-11-18, lot transitions).
   node outils/banc-transitions/balayage.cjs [--json]
   Prend le VRAI code du balayage pixel doré (wipePxDraw/wipePxLoop/wipePxStart/wipePxEnd, lu dans code/economie/aura-banque-contrats.js) et le VRAI
   lever d'ecranWipe, sur une fausse page (toile qui compte ses cases, rAF et minuteurs simulés). Pour chaque scénario d'images (intervalles en ms à partir
   de la fin de `fn`), avant (`?sans=transitions`) et après :
   · quand le volet se lève (ms après `fn`) et combien d'images lourdes (> 50 ms) tombent PENDANT qu'il se retire ;
   · le plus grand SAUT du balayage d'une image à la suivante (part de l'écran découverte d'un coup, en %) ; le nombre d'images du retrait ;
   · s'il est COUPÉ (la classe du volet vidée avant la fin du balayage : la mosaïque disparaît d'un coup).
   Les scénarios « relance » viennent des mesures (premières images après resetGame / openGarage, processeur ×4). Sortie 1 si l'après saute plus que l'avant. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=fs.readFileSync(path.join(__dirname,'../../code/economie/aura-banque-contrats.js'),'utf8');
const pr=(a,b)=>{const i=SRC.indexOf(a),j=SRC.indexOf(b,i);if(i<0||j<0)throw new Error('introuvable : '+a);return SRC.slice(i,j);};
const BAL=pr('const WIPEPX=','/* LE FONDU AU NOIR');
const WIPE=pr('function ecranWipe(fn,apres){','function uiPop(el)');
function simule(sans,dts,opt){
  opt=opt||{};
  let now=0;const T=[],R=[];let rid=0;
  const setTimeout=(f,ms)=>{T.push({t:now+(ms||0),f});return T.length;},clearTimeout=()=>{};
  const requestAnimationFrame=f=>{R.push({id:++rid,f});return rid;},cancelAnimationFrame=id=>{const k=R.findIndex(r=>r.id===id);if(k>=0)R.splice(k,1);};
  /* la toile : chaque fillRect est noté (cases peintes), on lit l'état des cases à chaque image */
  let peint=new Set();const cases=[];
  const ctx={clearRect(){peint=new Set();},fillRect(x,y,w,h){peint.add(Math.round(x+w/2)+','+Math.round(y+h/2)+':'+(w>20?'p':'m'));},set fillStyle(v){}};
  const el=()=>({style:{},classList:{_s:new Set(),add(c){this._s.add(c);},remove(c){this._s.delete(c);},contains(c){return this._s.has(c);}},appendChild(){},getContext:()=>ctx,parentNode:null,setAttribute(){}});
  const wipe=el();let cls='';Object.defineProperty(wipe,'className',{get:()=>cls,set:v=>{cls=v;wipe.classList._s=new Set(String(v).split(' ').filter(Boolean));R9.cls.push([Math.round(now),v]);}});
  const cv=el();
  const R9={cls:[],imgs:[]};
  const document={getElementById:id=>id==='wipe'?wipe:null,createElement:t=>t==='canvas'?cv:el(),body:{appendChild(){},classList:{add(){},remove(){}}},documentElement:{getAttribute:()=>null},querySelectorAll:()=>[],dispatchEvent(){}};
  const ctxv={performance:{now:()=>now},setTimeout,clearTimeout,requestAnimationFrame,cancelAnimationFrame,document,innerWidth:844,innerHeight:390,location:{search:sans?'?sans=transitions':''},
    REDUCED_MOTION:false,window:{},Event:function(){},console,Math,Uint8Array,Set,transUI(){},uiGarde(){},voileSerpent(){},SONV2:false,sfx(){},noiseBurst(){}};
  vm.createContext(ctxv);
  vm.runInContext(BAL+'\n'+WIPE+'\nthis.ecranWipe=ecranWipe;this.WIPEPX=WIPEPX;',ctxv);
  /* le scénario : la page tourne à 60 i/s régulières (16,7 ms) jusqu'à la fin de fn, puis les intervalles `dts`, puis 16,7 ms */
  let fini=-1;
  const fn=()=>{fini=now;return undefined;};
  ctxv.ecranWipe(fn);
  let k=0,fin9=null;const regul=opt.regul||16.7;
  const ptsOut=[];let precOut=null;
  for(let pas=0;pas<400;pas++){
    let dt=regul;if(fini>=0){dt=k<dts.length?dts[k]:regul;k++;}
    const t1=now+dt;
    /* les minuteurs qui tombent avant l'image */
    for(;;){T.sort((a,b)=>a.t-b.t);if(!T.length||T[0].t>t1)break;const x=T.shift();now=Math.max(now,x.t);x.f();}
    now=t1;const L=R.splice(0);L.forEach(r=>r.f(now));
    /* l'image affichée : l'état des cases */
    const P=ctxv.WIPEPX;const vis=P.ph!=='';
    const cov=vis?peint.size:0;
    if(cls.split(' ').includes('out')){if(precOut!=null)ptsOut.push({t:now-fini,dt,saut:Math.max(0,precOut-cov),cov});precOut=cov;}
    else if(precOut!=null&&fin9==null){fin9={t:now-fini,coupe:precOut};ptsOut.push({t:now-fini,dt,saut:precOut,cov:0,fin:1});precOut=null;}
    if(fin9&&now-fini>2500)break;
  }
  const lev=R9.cls.find(c=>c[1].indexOf('out')>=0);
  const N=ctxv.WIPEPX.nc*ctxv.WIPEPX.nr;
  const out=ptsOut.filter(p=>!p.fin);
  return {leve_ms:lev?Math.round(lev[0]-fini):null,images_retrait:out.length,lourdes_pendant:out.filter(p=>p.dt>50).length,
    saut_max_pct:Math.round(100*Math.max(0,...ptsOut.map(p=>p.saut))/N),coupe_pct:fin9?Math.round(100*fin9.coupe/N):null,retrait_fini_ms:fin9?Math.round(fin9.t):null};
}
const SC=[
  ['60 i/s régulières',[]],
  ['20 i/s régulières (téléphone critique)',[],{regul:50}],
  ['relance ×4 : 167·117·67 ms (premières images, banc TRANSITIONS-UI)',[167,117,67]],
  ['relance ×4 : 33·167·117·67 ms',[33,167,117,67]],
  ['une image de 300 ms au 3e coup',[17,17,300]],
  ['deux images de 120 ms à 60 ms d\'écart',[17,17,120,17,17,120]],
  ['lourd sans fin : 80 ms pendant 1 s',Array(13).fill(80)],
];
const res=[];let pire=0;
for(const [nom,dts,o] of SC){const a=simule(true,dts,o),b=simule(false,dts,o);res.push({scenario:nom,avant:a,apres:b});if(b.saut_max_pct>a.saut_max_pct)pire=1;}
if(process.argv.includes('--json'))console.log(JSON.stringify(res,null,1));
else{
  console.log('scénario | levé (ms après fn) | images du retrait | lourdes pendant le retrait | plus grand saut (% de l\'écran) | coupé (% encore couvert) | retrait fini (ms)');
  for(const r of res){const f=x=>[x.leve_ms,x.images_retrait,x.lourdes_pendant,x.saut_max_pct,x.coupe_pct,x.retrait_fini_ms].join(' · ');console.log(r.scenario+'\n   avant : '+f(r.avant)+'\n   après : '+f(r.apres));}
}
process.exit(pire);
