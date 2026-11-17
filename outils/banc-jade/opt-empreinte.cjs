/* L'EMPREINTE COMPLÈTE DE LA ROUTE DE JADE (2026-11-17, l'optimisation iPhone) : la route ET tout ce que jadeAApplique écrit (normales, marques des modules,
   décors de scène, pics, verbes : pierres, rivières, lianes, scènes, raccourcis, fiche du juge sans son temps), au bit près (JSON des doubles).
   node outils/banc-jade/opt-empreinte.cjs [racine] [graines=1-24] [paliers=0,10,20] [drapeau=1|0] [mode=sync|tranches|memo] [detail=1]
     sync     : genJadeA d'un trait (dbgGenRoute, la route de toujours)
     tranches : genJadeAG mené tranche par tranche ; ENTRE DEUX TRANCHES une autre vallée est générée d'un trait (JAV_LIA, JADE, MODMARK écrasés)
     memo     : deux fois la même vallée, l'empreinte de la seconde (l'essai gagnant retenu)
   [jf=-1] (lot JADEPREBATI) : JF.lim posée, l'essai rend la main à chacune de ses étapes.
   Une ligne par palier : md5 de toutes les graines. Lancer sur la référence et sur la branche : les sommes doivent être les mêmes. */
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const RAC=path.resolve(process.argv[2]&&!/=/.test(process.argv[2])?process.argv[2]:path.join(__dirname,'..','..'));
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const G=(arg('graines')||'1-24').split('-').map(Number),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),drap=arg('drapeau')!=='0',mode=arg('mode')||'sync',detail=arg('detail')==='1';
const lire=function(f){return fs.readFileSync(path.join(RAC,f),'utf8');};
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Int16Array,Uint8Array,Int32Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
ctx.window=ctx;ctx.self=ctx;ctx.location={search:drap?'?jade=avatar':'?'};
vm.runInContext(fs.readFileSync(path.join(__dirname,'../../VERSION PRINCIPALE/vendor/three.min.js'),'utf8'),ctx);
if(arg('jf')!=null)vm.runInContext('var JF={lim:'+(+arg('jf'))+',d:0};',ctx); /* (lot JADEPREBATI) jf=-1 : l'échéance de la tranche toujours passée — l'essai rend la main à CHAQUE étape (avec mode=tranches : une autre vallée entre deux) */
vm.runInContext(`var engTier=0,__vw=78,ROAD_HALF=26,SPD=.48,FALL_G=33,MODMARK=[],CAMPM=[],VX=1.75,ALLEGE=false,LVL={cur:{piste:'jade',carte:'jade'}};
  var JADE={},JADE_TPL=[[10,190,1],[14,250,0],[16,220,3],[18,300,2],[23,350,3],[26,330,1],[29,400,0],[36,440,2],[45,490,1],[56,540,3]],JADE_NTPL=JADE_TPL.length,JADE_BANK={on:true,max:16*Math.PI/180,W:150};
  var DUREE={d0:45,d1:20,t1:25},DUREE_ELAN=[1.8,1],VEQ_K={saut:21},JADE_U={uTime:{value:0}};
  function vPalier(){return __vw;}function rayonPalier(){return 40+.3*__vw;}
  function longueurCible(){const k=Math.min(1,engTier/25);return (45+(20-45)*k)*__vw*(1.8+(1-1.8)*k)*.85;}
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
  function __pal(t,v){engTier=t;__vw=v;}
  function __etat(ctrl){const a3=Object.assign({},JADE.a3);delete a3.ms;
    return JSON.stringify({ctrl:ctrl,N:JADE.bankN,bm:JADE.bankMax,mm:MODMARK,pose:JADE.pose,deco3:JADE.deco3,avR:JADE.avR,zc3:JADE.zc3,rac3:JADE.rac3,Q:JADE.Q,vri:JADE.vrille,desc:JADE.desc,mk:JADE.mk,a3:a3,lia:typeof JAV_LIA==='undefined'?null:JAV_LIA});}`,ctx);
for(const f of ['code/maps/jade-alleluia.js','code/maps/jade-avatar.js'])vm.runInContext(lire(f),ctx,{filename:f});
const aOpt=vm.runInContext('typeof genJadeAG==="function"',ctx);
if(mode!=='sync'&&!aOpt){console.log('mode '+mode+' : pas de genJadeAG dans '+RAC);process.exit(1);}
vm.runInContext(`function __sync(g){return __etat(genJadeA(mulberry32(g),g));}
  function __tranches(g){const it=genJadeAG(mulberry32(g),g);let x=it.next(),n=0;while(!x.done){n++;genJadeA(mulberry32(g+1000003),g+1000003);x=it.next();}__n=n;return __etat(x.value);}
  function __memo(g){genJadeA(mulberry32(g),g);genJadeA(mulberry32(g+77),g+77);return __etat(genJadeA(mulberry32(g),g));}var __n=0;`,ctx);
let tot=0;
for(const p of PAL){ctx.__pal(p,VW[p]||78);const h=crypto.createHash('md5'),D=[];let err=0,tr=0;const t0=Date.now();
  for(let g=G[0];g<=G[1];g++){let s;try{s=mode==='tranches'?ctx.__tranches(g):mode==='memo'?ctx.__memo(g):ctx.__sync(g);}catch(e){err++;console.log('  EXCEPTION p'+p+' g'+g+' '+String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));continue;}
    if(mode==='tranches')tr+=ctx.__n;h.update(s);D.push('g'+g+':'+crypto.createHash('md5').update(s).digest('hex').slice(0,8));}
  tot+=Date.now()-t0;
  console.log('p'+p+' drapeau '+(drap?1:0)+' '+mode+' : '+h.digest('hex')+' · '+(G[1]-G[0]+1)+' graines · exceptions '+err+(mode==='tranches'?' · tranches '+tr:'')+(detail?'\n   '+D.join(' '):''));}
if(mode==='memo')console.log('   essais gagnants rejoués : '+vm.runInContext('JADE_AMEMO.hits',ctx));
