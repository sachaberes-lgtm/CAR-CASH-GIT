/* ===== LES ROUTES UNIQUES — LE CHARGEUR ET LA GÉOMÉTRIE (2026-11-17, banc de la ressemblance des routes d'une partie à l'autre) =====
   Charge les VRAIS générateurs dans un vm Node (aucun navigateur) et rend, pour une carte × graine × palier, la route FINALE (celle que buildTrack reçoit),
   ses modules dans l'ordre et la fiche de la route ; puis la géométrie commune (rééchantillonnage, repère du départ, cap déroulé, pente).
     const R=require('./routes.cjs'); const m=R.moteur('jade','?jade=avatar',ref); const r=m.route(graine,palier);   (ref : un commit git, ou '' = le worktree)  -> {ctrl:[{x,y,z}], mods:[{nom,i0,i1,climax,rac}], fiche:{...}}
   JADE : le chemin du jeu sans paramètre — pisteRoute → genJadeG → genJadeAG (JADE_V3 et JADE_OPT vrais), comme genJadeA(mulberry32(g), g) d'un trait (même route au bit près).
   ESPACE : outils/banc-routes/charge.cjs (genCtrl → genCtrl1 en v5/v7, meilleur-de-6, puis pisteTord : la route roulée et descendue).
   ⚠ ESPACE A UNE MÉMOIRE : ORB_PIOCHE.der (les modules de la route d'AVANT ne reviennent que si rien d'autre ne tient) et ORB_PIOCHE.voyDer (le voyage d'avant) — comme dans le jeu,
   les graines tirées à la suite dans le MÊME vm s'influencent ; `chaine:false` remet la mémoire à zéro avant chaque route (une route = une première route). */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RAC=path.resolve(__dirname,'../../..'),cp=require('child_process');
/* LA SOURCE : `ref` vide = les fichiers du worktree tels quels ; `ref=<commit>` = les fichiers de ce commit (git show) — pour mesurer l'AVANT pendant qu'on refait le code.
   lire(f) rend null si le fichier n'existe pas à cette référence. three.min.js vient toujours du disque. */
function lecteur(ref){return function(f){if(!ref){try{return fs.readFileSync(path.join(RAC,f),'utf8');}catch(e){return null;}}
  try{return cp.execSync('git show '+ref+':'+JSON.stringify(f).slice(1,-1).replace(/ /g,'\\ '),{cwd:RAC,maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}).toString();}catch(e){return null;}};}
const lire=lecteur('');
const VW={0:78,5:105,10:158,15:236,20:341,27:439}; /* vPalier mesuré (le même tableau que charge.cjs et verbes-node.cjs) */

function moteurJade(search,ref){const L=lecteur(ref);
  const FJ=['code/gameplay/route-uniques.js','code/maps/jade-alleluia.js','code/maps/jade-avatar.js','code/maps/jade-uniques.js'].map(f=>[f,L(f)]).filter(x=>x[1]!=null); /* dans l'ordre d'ORDRE.txt ; ceux qui manquent à cette référence sont sautés */
  const aJU=FJ.some(x=>/^(const|let|var) JADE_U\b/m.test(x[1]));
  const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Int16Array,Uint8Array,Int32Array,Uint16Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
  ctx.window=ctx;ctx.self=ctx;ctx.location={search:search||''};
  vm.runInContext(lire('VERSION PRINCIPALE/vendor/three.min.js'),ctx);
  /* le prélude de outils/banc-jade/verbes-node.cjs (les globales que jade-1.js et le moteur posent dans le jeu) */
  vm.runInContext(`var engTier=0,__vw=78,ROAD_HALF=26,SPD=.48,FALL_G=33,MODMARK=[],CAMPM=[],VX=1.75,ALLEGE=false,LVL={cur:{piste:'jade',carte:'jade',sansFin:1}};
    var JADE={},JADE_TPL=[[10,190,1],[14,250,0],[16,220,3],[18,300,2],[23,350,3],[26,330,1],[29,400,0],[36,440,2],[45,490,1],[56,540,3]],JADE_NTPL=JADE_TPL.length,JADE_BANK={on:true,max:16*Math.PI/180,W:150};
    var DUREE={d0:45,d1:20,t1:25},DUREE_ELAN=[1.8,1],VEQ_K={saut:21}${aJU?'':',JADE_U={uTime:{value:0}}'};
    function vPalier(){return __vw;}function rayonPalier(){return 40+.3*__vw;}
    function longueurCible(){const k=Math.min(1,engTier/25);return (45+(20-45)*k)*__vw*(1.8+(1-1.8)*k)*.85;} /* = longueurCible du jeu pour jade (DUREE_ALLURE.jade = .85) */
    function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
    function __pal(t,v){engTier=t;__vw=v;}`,ctx);
  for(const [f,src] of FJ)vm.runInContext(src,ctx,{filename:f});
  vm.runInContext(`function __route(g){MODMARK.length=0;const ctrl=genJadeA(mulberry32(g),g);const a=JADE.a3||{};
      const itin=(JADE.avR&&JADE.avR.itin!=null&&typeof JAV_ITIN!=='undefined')?JAV_ITIN[JADE.avR.itin].nom:null;
      return {ctrl:ctrl.map(function(p){return {x:p.x,y:p.y,z:p.z};}),mods:MODMARK.map(function(m){return {nom:m.nom||m.fig,fig:m.fig,i0:m.i0,i1:m.i1,climax:!!m.climax,rac:!!m.rac};}),
        fiche:{scenes:(a.scenes||[]).slice(),note:a.note,notes:a.notes,essai:a.essai,lon:a.lon,LC:a.LC,fam:(g|0)&1,rot:((g|0)>>>1)%4 /* comme genJadeAG : la parité de la graine fait la famille, (g>>>1)%4 la rotation des « autres » */,itin:itin,chute:a.chute,penteMax:a.penteMax,envers:a.envers}};}`,ctx);
  return {carte:'jade',search:search||'',ref:ref||'',fichiers:FJ.map(x=>x[0]),ctx,
    route(g,p){ctx.__pal(p|0,VW[p|0]||78);return ctx.__route(g|0);}};}

/* le chargeur de outils/banc-routes/charge.cjs, recopié pour lire les sources à une référence git (même prélude, mêmes fichiers, même longueur visée) */
function chargeEspace(search,ref){const L=lecteur(ref);
  const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Uint8Array,Int32Array,Int16Array,Uint16Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
  ctx.window=ctx;ctx.self=ctx;ctx.location={search:search||''};
  vm.runInContext(lire('VERSION PRINCIPALE/vendor/three.min.js'),ctx);
  vm.runInContext(`var PARK={on:false},started=true,SF={pret:true},engTier=0,runStats={zones:1},LVL={cur:null},zoneArch='FLOW';
var ROAD_HALF=28,FALL_G=33*1.0,SPD=.48;
var FILET={on:true,kv:1.1,dh:42,dhS:12,kick:1.6,dev:.13,par:[3,2,1],vFond:.8,visite:null},FILETMARK=[],MODMARK=[];
var NIVEAUX=[0,0,0,0,0];
var __vw=78;
function vPalier(){return __vw;}
function lvPiste(){return 1+THREE.MathUtils.clamp((__vw-70)/140*1.4,0,3.4);}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
var RYTHME_N=1;`,ctx);
  const FE=['code/gameplay/route-sans-haut.js','code/gameplay/route-rythme.js','code/gameplay/route-briques.js','code/gameplay/route-uniques.js','code/maps/nuages-modules.js','code/maps/nuages-parcours.js','code/maps/orbite-modules.js','code/maps/orbite-voyages.js','code/maps/orbite-uniques.js','code/maps/ville-scenes.js','code/maps/ville-entree.js'].map(f=>[f,L(f)]).filter(x=>x[1]!=null);
  for(const [f,src] of FE)vm.runInContext(src,ctx,{filename:f});
  vm.runInContext(`function __setPalier(t,vw){engTier=t;__vw=vw;}
function __cible(){const k=Math.min(1,engTier/25),d=45+(20-45)*k,al=LVL.cur.id==='espace'?(typeof ESP_V3!=='undefined'&&ESP_V3?1.5:1.2):LVL.cur.__al||1.05;return d*__vw*(1.8+(1-1.8)*k)*al;}
longueurCible=__cible;`,ctx);
  function piste(graine,palier){palier=palier|0;const vw=VW[palier]||78;ctx.__setPalier(palier,vw);ctx.LVL.cur={id:'espace',espace:1,carte:'espace',sansFin:1};ctx.window.dbgEspOff=false;
    ctx.MODMARK.length=0;ctx.FILETMARK.length=0;const ctrl=ctx.genCtrl(ctx.mulberry32(graine),new ctx.THREE.Vector3(0,0,0),0),ctrl0=ctrl.slice(),marks0=ctx.MODMARK.map(m=>Object.assign({},m));
    const out={ctrl,N:null,info:null};const tord=ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn());
    if(tord){const h=ctx.pisteTordPropre(ctrl,graine);out.ctrl=h.ctrl;out.N=h.N;}
    out.marks=ctx.MODMARK.map(m=>Object.assign({},m));out.ctrl0=ctrl0;out.marks0=marks0;out.tord=tord;return out;}
  return {ctx,piste:(c,g,p)=>piste(g,p),fichiers:FE.map(x=>x[0])};}
function moteurEspace(search,ref){
  const B=chargeEspace(search||'',ref),ctx=B.ctx;
  const piocheRaz=function(){vm.runInContext('ORB_PIOCHE.der={};ORB_PIOCHE.voyDer=undefined;ORB_PIOCHE.vo=null;ORB_PIOCHE.hum=null;',ctx);};
  return {carte:'espace',search:search||'',ref:ref||'',fichiers:B.fichiers,ctx,
    route(g,p,o){o=o||{};if(o.chaine===false)piocheRaz();const r=B.piste('espace',g|0,p|0);
      const pioche=vm.runInContext('({der:Object.keys(ORB_PIOCHE.der||{}),vo:ORB_PIOCHE.vo?ORB_PIOCHE.vo.cle:null})',ctx);
      const orbe=ctx.window.__orbe||{},R=ctx.window.dbgRythme?ctx.window.dbgRythme():null;
      /* les marques : r.marks est indexé sur r.ctrl (la route roulée) si pisteTord les a recalées, sinon sur ctrl0 — on prend celles qui vont avec la route rendue */
      const memeN=r.ctrl.length===r.ctrl0.length,mk=memeN?r.marks:(r.tord?r.marks:r.marks0);
      return {ctrl:r.ctrl.map(function(p){return {x:p.x,y:p.y,z:p.z};}),
        mods:mk.filter(function(m){return m.fig;}).map(function(m){return {nom:m.fig,fig:m.fig,i0:m.i0,i1:m.i1,climax:!!m.climax,rac:!!m.rac};}),
        fiche:{humeur:orbe.humeur||null,desc:orbe.desc,voyage:pioche.vo,piocheDer:pioche.der,essai:R&&R.essai,notes:R&&R.notes,note:R&&R.note,tord:r.tord,n0:r.ctrl0.length,n:r.ctrl.length}};}};}

function moteur(carte,search,ref){return carte==='jade'?moteurJade(search,ref):moteurEspace(search,ref);}

/* ---------- LA GÉOMÉTRIE ---------- */
const DEG=180/Math.PI;
function abscisses(P){const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y,P[i].z-P[i-1].z));return S;}
function aAbs(P,S,s){ /* le point de la polyligne à l'abscisse s (interpolation linéaire entre points de contrôle) */
  if(s<=0)return Object.assign({},P[0]);if(s>=S[S.length-1])return Object.assign({},P[P.length-1]);
  let lo=0,hi=S.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(S[m]<=s)lo=m;else hi=m;}const t=(s-S[lo])/((S[hi]-S[lo])||1),a=P[lo],b=P[hi];
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};}
/* la route dans le repère du départ : origine au 1er point, z = le cap initial (moyen sur les 60 premiers mètres), x = le côté où le cap CROÎT (phi+ : sin/cos du jeu), y = l'altitude.
   Rééchantillonnée tous les `pas` m ; cap = cap en plan DÉROULÉ (degrés, + vers x), pente (degrés, − = descend) sur ±10 m. */
function repere(P,pas){pas=pas||10;const S=abscisses(P),L=S[S.length-1],p6=aAbs(P,S,Math.min(60,L)),h0=Math.atan2(p6.x-P[0].x,p6.z-P[0].z),c=Math.cos(h0),s=Math.sin(h0);
  const n=Math.floor(L/pas)+1,X=new Float64Array(n),Y=new Float64Array(n),Z=new Float64Array(n),CAP=new Float64Array(n),PEN=new Float64Array(n);
  for(let k=0;k<n;k++){const q=aAbs(P,S,k*pas),dx=q.x-P[0].x,dz=q.z-P[0].z;X[k]=dx*c-dz*s;Z[k]=dx*s+dz*c;Y[k]=q.y-P[0].y;}
  let cap=0,prev=null;for(let k=0;k<n;k++){const a=Math.max(0,k-1),b=Math.min(n-1,k+1),dx=X[b]-X[a],dz=Z[b]-Z[a],dpl=Math.hypot(dx,dz),dy=Y[b]-Y[a];
    PEN[k]=Math.atan2(dy,dpl)*DEG;if(dpl>.15*pas*(b-a)){const h=Math.atan2(dx,dz);if(prev==null)cap=h*DEG;else{let d=h-prev;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;cap+=d*DEG;}prev=h;}CAP[k]=cap;}
  return {L,pas,n,X,Y,Z,CAP,PEN,S};}
function absMarque(S,i){return S[Math.max(0,Math.min(S.length-1,i|0))];}
module.exports={moteur,VW,repere,abscisses,aAbs,absMarque,RAC,lecteur};
