/* Banc Node des routes NUAGES / ORBITE : charge les VRAIS morceaux (ville-entree.js, route-sans-haut.js) dans un vm avec le strict nécessaire.
   Usage : const B=require('./charge.cjs'); const r=B.piste('nuages'|'espace',graine,palier); r.ctrl, r.N, r.marks, r.info */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RACINE=path.resolve(__dirname,'../..');
const lire=f=>fs.readFileSync(path.join(RACINE,f),'utf8');
function creer(search){
const ctx=vm.createContext({console,Math,Float32Array,Uint8Array,Int32Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
ctx.window=ctx;ctx.self=ctx;ctx.location={search:search||''};
vm.runInContext(fs.readFileSync(path.join(RACINE,'VERSION PRINCIPALE/vendor/three.min.js'),'utf8'),ctx);
const prelude=`
var PARK={on:false},started=true,SF={pret:true},engTier=0,runStats={zones:1},LVL={cur:null},zoneArch='FLOW';
var ROAD_HALF=28,FALL_G=33*1.0,SPD=.48;
var FILET={on:true,kv:1.1,dh:42,dhS:12,kick:1.6,dev:.13,par:[3,2,1],vFond:.8,visite:null},FILETMARK=[],MODMARK=[];
var NIVEAUX=[0,0,0,0,0];
var __vw=78;
function vPalier(){return __vw;}
function lvPiste(){return 1+THREE.MathUtils.clamp((__vw-70)/140*1.4,0,3.4);}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
`;
vm.runInContext(prelude,ctx);
for(const f of ['code/maps/ville-entree.js','code/gameplay/route-sans-haut.js'])vm.runInContext(lire(f),ctx,{filename:f});
vm.runInContext(`
function __setPalier(t,vw){engTier=t;__vw=vw;}
function __cible(){ /* la longueur visée (m), comme longueurCible : 45→20 s, élan 1,8→1, allure de la map */
  const k=Math.min(1,engTier/25),d=45+(20-45)*k,al=LVL.cur.id==='espace'?1.2:.65;return d*__vw*(1.8+(1-1.8)*k)*al;}
longueurCible=__cible;
`,ctx);
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
function piste(carte,graine,palier){
  palier=palier|0;const vw=VW[palier]||78;
  ctx.__setPalier(palier,vw);
  ctx.LVL.cur=carte==='espace'?{id:'espace',espace:1,carte:'espace',sansFin:1}:{id:'nuages',carte:'nuages',sansFin:1};
  ctx.window.dbgEspOff=false;
  ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
  const rnd=ctx.mulberry32(graine),ctrl=ctx.genCtrl(rnd,new ctx.THREE.Vector3(0,0,0),0);
  const ctrlCopy=ctrl.slice(),marks0=ctx.MODMARK.map(m=>Object.assign({},m));
  let out={ctrl:ctrl,N:null,info:null};
  const tord=ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn());
  if(tord){const h=ctx.pisteTordPropre(ctrl,graine);out.ctrl=h.ctrl;out.N=h.N;out.info=vm.runInContext("TORD.info",ctx);}
  out.marks=ctx.MODMARK.map(m=>Object.assign({},m));out.ctrl0=ctrlCopy;out.marks0=marks0;out.tord=tord;out.vw=vw;
  return out;}
return {ctx,piste,VW};}
module.exports=creer('');module.exports.creer=creer;
