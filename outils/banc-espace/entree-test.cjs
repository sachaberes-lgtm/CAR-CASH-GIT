/* ===== L'ENTRÉE DANS L'ESPACE — LE TEST (2026-11-18, Sacha : « le module de l'espace, il est très buggé […] j'ai rien compris ce qui se passait ») =====
   node outils/banc-espace/entree-test.cjs [search='?sans=entreetenue'] [racine=<un autre arbre>] [paliers=0,5,10,15,20,27] [graines=101-160] [seuil=2.6] [detail=1] [json=sortie.json]
   Les VRAIS générateurs (genCtrl + pisteTordPropre, comme pisteRoute) dans un vm par palier, les graines DE SUITE (le sac se souvient, comme une partie).
   L'horloge du vm est un COMPTEUR (performance.now avance de 0,25 ms à chaque lecture) : les reprises d'unicité (bornées à 50 ms, ville-entree.js) ne dépendent
   plus de la charge du Mac — deux lancements rendent les mêmes routes, au bit près.
   Mesure, sur la route jouée (r.ctrl, r.N de pisteTordPropre), à la vitesse RÉELLE du palier (vPalier × élan, 1,8 au palier 0 → 1 au palier 25) :
     · t1 : le début du 1er module nommé (la 1re marque `fig`) ;
     · tB : le 1er point où la dalle est couchée de plus de 25° (le dévers, mesuré contre la verticale dans le plan normal à la route) ;
   ÉCHOUE (code 1) si une route d'espace à plan a min(t1, tB) < seuil (2,6 s : le tunnel d'entrée en orbite, ORBFX.warp, dure 1,9 s, le voile 0,5 s).
   Sert aussi d'« avant » : search='?sans=entreetenue' (la route du build 121) doit ÉCHOUER. */
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const RACINE=path.resolve(arg('racine',path.resolve(__dirname,'../..'))),search=arg('search',''),PAL=arg('paliers','0,5,10,15,20,27').split(',').map(Number);
const [G0,G1]=arg('graines','101-160').split('-').map(Number),SEUIL=+arg('seuil','2.6'),detail=arg('detail','0')==='1',BANK=25;
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
const FICHIERS=['code/gameplay/route-sans-haut.js','code/gameplay/route-rythme.js','code/gameplay/route-briques.js','code/gameplay/route-uniques.js','code/maps/nuages-modules.js','code/maps/nuages-parcours.js','code/maps/orbite-modules.js','code/maps/orbite-voyages.js','code/maps/orbite-uniques.js','code/maps/ville-scenes.js','code/maps/ville-entree.js'];
function creer(){let tic=0;const perf={now:function(){tic+=.25;return tic;}};
  const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Uint8Array,Int32Array,Int16Array,Uint16Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance:perf,JSON,Symbol,parseInt,parseFloat,isNaN,isFinite});
  ctx.window=ctx;ctx.self=ctx;ctx.location={search:search};
  vm.runInContext(fs.readFileSync(path.join(RACINE,'VERSION PRINCIPALE/vendor/three.min.js'),'utf8'),ctx);
  vm.runInContext(`var PARK={on:false},started=true,SF={pret:true},engTier=0,runStats={zones:1},LVL={cur:null},zoneArch='FLOW';
var ROAD_HALF=28,FALL_G=33*1.0,SPD=.48;
var FILET={on:true,kv:1.1,dh:42,dhS:12,kick:1.6,dev:.13,par:[3,2,1],vFond:.8,visite:null},FILETMARK=[],MODMARK=[];
var NIVEAUX=[0,0,0,0,0];var __vw=78;
function vPalier(){return __vw;}
function lvPiste(){return 1+THREE.MathUtils.clamp((__vw-70)/140*1.4,0,3.4);}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
var RYTHME_N=1;`,ctx);
  for(const f of FICHIERS)vm.runInContext(fs.readFileSync(path.join(RACINE,f),'utf8'),ctx,{filename:f});
  vm.runInContext(`function __setPalier(t,vw){engTier=t;__vw=vw;}
function __cible(){const k=Math.min(1,engTier/25),d=45+(20-45)*k,al=LVL.cur.id==='espace'?(typeof ESP_V3!=='undefined'&&ESP_V3?1.5:1.2):LVL.cur.__al||1.05;return d*__vw*(1.8+(1-1.8)*k)*al;}
longueurCible=__cible;`,ctx);
  return ctx;}
function route(ctx,g,p){const vw=VW[p];ctx.__setPalier(p,vw);ctx.LVL.cur={id:'espace',espace:1,carte:'espace',sansFin:1};ctx.window.dbgEspOff=false;ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
  let ctrl=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0),N=null;const ru=vm.runInContext("typeof OU!=='undefined'&&OU.der?OU.der.ouv:null",ctx),rel=vm.runInContext("typeof OU!=='undefined'&&OU.der?OU.der.rel:null",ctx),plan=vm.runInContext('typeof ORB_RU!=="undefined"&&ORB_RU',ctx);
  if(ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn())){const h=ctx.pisteTordPropre(ctrl,g);ctrl=h.ctrl;N=h.N;}
  return {ctrl,N,marks:ctx.MODMARK.map(m=>Object.assign({},m)),ouv:plan?ru:'(avant)',rel:plan?rel:null,vw};}
function mesure(r,p){const Q=r.ctrl,n=Q.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
  const el=1.8+(1-1.8)*Math.min(1,p/25),v=r.vw*el,mk=r.marks.filter(m=>m.fig).sort((a,b)=>a.i0-b.i0),m1=mk[0],s1=m1?S[Math.min(n-1,m1.i0)]:S[n-1];
  let sB=S[n-1],bMax=0,nyMin=1,pMin=0,dpMax=0,pPrev=null;const lim=SEUIL*v;
  for(let i=1;i<n-1;i++){const T=Q[i+1].clone().sub(Q[i-1]).normalize(),Nn=r.N?r.N[i]:null;const pente=Math.asin(Math.max(-1,Math.min(1,T.y)))*57.2958;
    let bank=0;if(Nn&&Math.abs(T.y)<.97){const up=new Q[0].constructor(-T.x*T.y,1-T.y*T.y,-T.z*T.y).normalize();bank=Math.acos(Math.max(-1,Math.min(1,Nn.dot(up))))*57.2958;}
    if(bank>BANK&&sB===S[n-1])sB=S[i];
    if(S[i]<lim){bMax=Math.max(bMax,bank);if(Nn)nyMin=Math.min(nyMin,Nn.y);pMin=Math.min(pMin,pente);if(pPrev!=null&&S[i]>S[i-1])dpMax=Math.max(dpMax,Math.abs(pente-pPrev)/((S[i]-S[i-1])/v));}pPrev=pente;}
  return {fig:m1?m1.fig:null,s1:Math.round(s1),t1:+(s1/v).toFixed(2),tB:+(sB/v).toFixed(2),t:+(Math.min(s1,sB)/v).toFixed(2),bMax:Math.round(bMax),nyMin:+nyMin.toFixed(2),pMin:Math.round(pMin),dpMax:Math.round(dpMax),L:Math.round(S[n-1]),dur:+(S[n-1]/v).toFixed(1),nMod:new Set(mk.map(m=>m.fig)).size};}
let rate=0;const res={},emp=crypto.createHash('md5');
for(const p of PAL){const ctx=creer(),L=[];
  for(let g=G0;g<=G1;g++){const r=route(ctx,g,p);for(const q of r.ctrl)emp.update(q.x+','+q.y+','+q.z+';');if(r.N)for(const q of r.N)emp.update(q.x+','+q.y+','+q.z+';');for(const m of r.marks)emp.update(JSON.stringify(m));
    const o=Object.assign({g,ouv:r.ouv,rel:r.rel},mesure(r,p));L.push(o);}
  const T=L.map(x=>x.t).sort((a,b)=>a-b),pc=k=>T[Math.floor(k*(T.length-1))],sous=L.filter(x=>x.t<SEUIL),ouvs={};for(const x of sous)ouvs[x.ouv]=(ouvs[x.ouv]|0)+1;
  const moy=k=>+(L.reduce((a,x)=>a+x[k],0)/L.length).toFixed(2);
  rate+=sous.length;res['p'+p]={sous:sous.length,n:L.length,min:pc(0),p10:pc(.1),med:pc(.5),ouvs,modules:moy('nMod'),duree:moy('dur'),bMax2s:Math.max(...L.map(x=>x.bMax)),nyMin2s:Math.min(...L.map(x=>x.nyMin)),pMin2s:Math.min(...L.map(x=>x.pMin)),dpMax2s:Math.max(...L.map(x=>x.dpMax)),pires:L.slice().sort((a,b)=>a.t-b.t).slice(0,3)};
  console.log(('p'+p).padEnd(4),'avant '+SEUIL+' s :',(sous.length+'/'+L.length).padEnd(6),JSON.stringify(ouvs).padEnd(46),'1er module ou dévers > 25° : min',pc(0),'p10',pc(.1),'méd',pc(.5),
    '| modules/route',moy('nMod'),'durée',moy('dur')+' s','| dans les '+SEUIL+' s : dévers max',Math.max(...L.map(x=>x.bMax))+'°','Nn.y min',Math.min(...L.map(x=>x.nyMin)),'pente min',Math.min(...L.map(x=>x.pMin))+'°','Δpente max',Math.max(...L.map(x=>x.dpMax))+'°/s');
  if(detail){for(const x of L.slice().sort((a,b)=>a.t-b.t).slice(0,3))console.log('     (le plus tôt)',JSON.stringify(x));for(const x of L.slice().sort((a,b)=>b.dpMax-a.dpMax).slice(0,3))console.log('     (pente qui bascule)',JSON.stringify(x));}}
console.log('empreinte',emp.digest('hex').slice(0,16),search||'(neuf)',RACINE===path.resolve(__dirname,'../..')?'':RACINE);
const out=arg('json',null);if(out)fs.writeFileSync(out,JSON.stringify(res,null,1));
if(rate){console.log('ÉCHEC :',rate,'route(s) d\'espace où le 1er module ou un virage couché vient avant',SEUIL,'s réelles');process.exitCode=1;}else console.log('OK : aucune route d\'espace ne commence un module ni ne couche la dalle avant',SEUIL,'s réelles');
