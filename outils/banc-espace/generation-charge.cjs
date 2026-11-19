/* ===== LE CRIBLE DE LA GÉNÉRATION DE L'ESPACE — le chargeur (2026-11-18, rôle « generation ») =====
   Copie de outils/banc-routes/charge.cjs (mêmes fichiers, même prélude, même longueur visée) avec deux ajouts :
   · `lent` : l'horloge vue par le générateur va `lent` fois plus vite (performance.now × lent) — le budget de 50 ms des reprises d'unicité
     (ville-entree.js:704) se vide alors comme sur un téléphone `lent` fois plus lent que ce Mac ;
   · `dalle()` : la dalle JOUÉE, refaite comme pisteRoute (code/moteur/depart-avance.js:108-209) : courbeCR, arcLengthDivisions, pts équidistants
     (N = 3000-9000), T, Nn interpolée de TORD.N par getUtoTmapping, puis LA DALLE LISSE (σ = clamp(0,3·vC9, 20, 80) m), et MODS (sDe des marques, comme le jeu).
   Usage : const C=require('./generation-charge.cjs'); const M=C.creer('?sans=uniques',{lent:1}); const r=M.route(graine,palier); const d=M.dalle(r); */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RACINE=path.resolve(__dirname,'../..');
const lire=f=>fs.readFileSync(path.join(RACINE,f),'utf8');
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
const FICHIERS=['code/gameplay/route-sans-haut.js','code/gameplay/route-rythme.js','code/gameplay/route-briques.js','code/gameplay/route-uniques.js','code/maps/nuages-modules.js','code/maps/nuages-parcours.js','code/maps/orbite-modules.js','code/maps/orbite-voyages.js','code/maps/orbite-uniques.js','code/maps/ville-scenes.js','code/maps/ville-entree.js'];
function creer(search,opt){opt=opt||{};const lent=opt.lent!=null?opt.lent:1;
const perf={now:function(){return performance.now()*lent;}};
const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Uint8Array,Int32Array,Int16Array,Uint16Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance:perf,JSON,Symbol,parseInt,parseFloat,isNaN,isFinite});
ctx.window=ctx;ctx.self=ctx;ctx.location={search:search||''};
vm.runInContext(lire('VERSION PRINCIPALE/vendor/three.min.js'),ctx);
vm.runInContext(`
var PARK={on:false},started=true,SF={pret:true},engTier=0,runStats={zones:1},LVL={cur:null},zoneArch='FLOW';
var ROAD_HALF=28,FALL_G=33*1.0,SPD=.48;
var FILET={on:true,kv:1.1,dh:42,dhS:12,kick:1.6,dev:.13,par:[3,2,1],vFond:.8,visite:null},FILETMARK=[],MODMARK=[];
var NIVEAUX=[0,0,0,0,0];
var __vw=78;
function vPalier(){return __vw;}
function lvPiste(){return 1+THREE.MathUtils.clamp((__vw-70)/140*1.4,0,3.4);}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
var RYTHME_N=1;`,ctx);
for(const f of FICHIERS)vm.runInContext(lire(f),ctx,{filename:f});
vm.runInContext(`
function __setPalier(t,vw){engTier=t;__vw=vw;}
function __cible(){const k=Math.min(1,engTier/25),d=45+(20-45)*k,al=LVL.cur.id==='espace'?(typeof ESP_V3!=='undefined'&&ESP_V3?1.5:1.2):LVL.cur.__al||1.05;return d*__vw*(1.8+(1-1.8)*k)*al;}
longueurCible=__cible;
/* LA DALLE JOUÉE : pisteRoute (depart-avance.js) pour la route rendue — mêmes appels, sans les maillages */
function __dalle(ctrl,HN){
  const curve=courbeCR(ctrl);curve.arcLengthDivisions=Math.max(200,ctrl.length*16);const L=curve.getLength();
  const N=Math.min(9000,Math.max(3000,Math.round(L)));const pts=[];for(let d9=0;d9<=N;d9++)pts.push(curve.getPointAt(d9/N));const NP=pts.length;
  const T=[];for(let i=0;i<NP;i++){const j=Math.min(i+1,NP-1),k=Math.max(i-1,0);T.push(new THREE.Vector3().subVectors(pts[j],pts[k]).normalize());}
  const Nn=[];const n=new THREE.Vector3();
  if(HN){const nc=HN.length-1;for(let i=0;i<NP;i++){const f=curve.getUtoTmapping(i/(NP-1))*nc,k=Math.min(nc-1,Math.floor(f)),w=f-k;
      n.copy(HN[k]).multiplyScalar(1-w).addScaledVector(HN[k+1],w);n.addScaledVector(T[i],-n.dot(T[i]));if(n.lengthSq()<1e-10)n.copy(Nn[i-1]||HN[0]);n.normalize();Nn.push(n.clone());}}
  else return null;
  const vC9=70+(lvPiste()-1)*100,ds9=L/(NP-1),sg9=(GEN_V2?THREE.MathUtils.clamp(.3*vC9,20,80):THREE.MathUtils.clamp(.12*vC9,12,30))/ds9,R9=Math.ceil(sg9*3),nr9=new Float64Array(3*NP),psi9=new Float64Array(NP),lis9=new Float64Array(NP),gw9=new Float64Array(R9+1);
  const m9=new THREE.Vector3(),c9=new THREE.Vector3(),TWO9=2*Math.PI,q=new THREE.Quaternion();let sw9=0;m9.copy(Nn[0]);
  for(let i=0;i<NP;i++){nr9[3*i]=m9.x;nr9[3*i+1]=m9.y;nr9[3*i+2]=m9.z;let a9=Math.atan2(c9.crossVectors(m9,Nn[i]).dot(T[i]),m9.dot(Nn[i]));if(i>0)a9+=TWO9*Math.round((psi9[i-1]-a9)/TWO9);psi9[i]=a9;
    if(i<NP-1){q.setFromUnitVectors(T[i],T[i+1]);m9.applyQuaternion(q);m9.addScaledVector(T[i+1],-m9.dot(T[i+1])).normalize();}}
  for(let k=0;k<=R9;k++)gw9[k]=Math.exp(-k*k/(2*sg9*sg9));
  const psiAt9=j=>j<0?2*psi9[0]-psi9[-j]:j>=NP?2*psi9[NP-1]-psi9[Math.max(0,2*(NP-1)-j)]:psi9[j];for(let k=-R9;k<=R9;k++)sw9+=gw9[Math.abs(k)];
  for(let i=0;i<NP;i++){let s9=0;if(i>=R9&&i+R9<NP){for(let k=-R9;k<=R9;k++)s9+=gw9[Math.abs(k)]*psi9[i+k];}else for(let k=-R9;k<=R9;k++)s9+=gw9[Math.abs(k)]*psiAt9(i+k);lis9[i]=s9/sw9;
    const c=Math.cos(lis9[i]),s=Math.sin(lis9[i]),ax=nr9[3*i],ay=nr9[3*i+1],az=nr9[3*i+2],t9=T[i];const n9=Nn[i];
    n9.set(ax*c+(t9.y*az-t9.z*ay)*s,ay*c+(t9.z*ax-t9.x*az)*s,az*c+(t9.x*ay-t9.y*ax)*s);n9.addScaledVector(t9,-n9.dot(t9)).normalize();}
  const lg9=curve.getLengths(),n9=Math.max(1,ctrl.length-1),sDe=i=>{const f=i/n9*(lg9.length-1),k=Math.max(0,Math.min(lg9.length-2,Math.floor(f)));return lg9[k]+(lg9[k+1]-lg9[k])*(f-k);};
  const mods=MODMARK.map(function(m){return {fig:m.fig||null,climax:!!m.climax,g:!!m.g,i0:m.i0,i1:m.i1,a:sDe(m.i0),b:sDe(m.i1),ia:m.ia,i2:m.i2,
     nu:m.nu?m.nu.map(function(q){return {t:q.t,k:q.k,i:q.i,j:q.j,s:sDe(q.j!=null?q.j:q.i)};}):null};});
  return {L,NP,ds:ds9,sigma:sg9*ds9,vC9,pts,T,Nn,mods,psiBrut:psi9,psiLisse:lis9};}
`,ctx);
function route(graine,palier,o){o=o||{};palier=palier|0;const vw=VW[palier]||78;ctx.__setPalier(palier,vw);
  ctx.LVL.cur={id:'espace',espace:1,carte:'espace',sansFin:1};ctx.window.dbgEspOff=false;ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
  const vSum=()=>vm.runInContext("(function(){if(typeof RU==='undefined')return 0;let s=0;for(const k in RU.V)s+=RU.V[k];return s;})()",ctx);const v0=vSum();
  const t0=process.hrtime.bigint();let err=null,ctrl,ctrl0,marks0,N=null,info=null,tord=false;
  try{ctrl=ctx.genCtrl(ctx.mulberry32(graine),new ctx.THREE.Vector3(0,0,0),0);ctrl0=ctrl.slice();marks0=ctx.MODMARK.map(m=>Object.assign({},m,{nu:m.nu?m.nu.map(q=>Object.assign({},q)):null}));
    const tGen=process.hrtime.bigint();
    tord=ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn());
    if(tord){const h=ctx.pisteTordPropre(ctrl,graine);ctrl=h.ctrl;N=h.N;info=vm.runInContext('TORD.info',ctx);}
    var msGen=Number(tGen-t0)/1e6;}catch(e){err=String(e&&e.stack||e).slice(0,600);}
  const ms=Number(process.hrtime.bigint()-t0)/1e6,v1=vSum();
  let plan=null;try{plan=vm.runInContext("typeof OU!=='undefined'&&OU.der?JSON.stringify({ouv:OU.der.ouv,fin:OU.der.fin,rel:OU.der.rel,sil:OU.der.sil,cx:OU.der.cx}):null",ctx);plan=plan&&JSON.parse(plan);}catch(e){}
  return {graine,palier,vw,ctrl,ctrl0,N,info,marks0,tord,err,ms,msGen,reprises:v1>=v0?v1-v0:v1,plan};}
function dalle(r){if(!r.ctrl||!r.N)return null;return ctx.__dalle(r.ctrl,r.N);}
function raz(){vm.runInContext("if(typeof RU!=='undefined'){RU.H={};RU.P.clear();RU.V={};}ORB_PIOCHE.der={};ORB_PIOCHE.voyDer=undefined;ORB_PIOCHE.vo=null;ORB_PIOCHE.hum=null;if(typeof OU_FORMES!=='undefined')OU_FORMES.length=0;if(typeof OU!=='undefined'){OU.der=null;OU.rejet=[];}",ctx);}
return {ctx,route,dalle,raz,VW,run:s=>vm.runInContext(s,ctx)};}
module.exports={creer,VW};
