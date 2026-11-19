/* ===== LE BANC DU DÉCOR DE L'ESPACE (2026-11-18, « l'espace sans géants » — Sacha : « supprime tous les modules exploitables avec la route dans l'espace, laisse juste
   quelques satellites et météorites à des endroits ») =====
   Rejoue dans Node la VRAIE pose du décor de l'orbite sur la VRAIE route : generation-charge.cjs (genCtrl, pisteTord, la dalle jouée), puis, dans le même vm, les vrais morceaux
   orbite-1.js (SATS), orbite-roches.js (ROCHES), orbite-geants.js (les géants), orbite-voyages-decor.js (le décor des voyages) et orbiteBuild (tiré d'orbite-2.js), frameAt (ligne-parfaite.js).
   Rien n'est rendu (pas de WebGL) : la scène, la caméra, le moteur de rendu sont des bouchons ; les maillages et les matrices des instances sont les vrais.
   Usage : const D=require('./decor-charge.cjs').creer('?plus=geants',{racine, raz:false (le sac se souvient), objets:1}); const o=D.decor(graine,palier,'terre'|'mars'|'saturne'|[…]);
   o : {L, sats:[n0,n1,n2], roches, geants, voy:{jante,roc,neb,zonesSaut,zonesPente}, durs, objets:[{k,x,y,z,ext}], dMin (m, du bord de la route, 3D), dMinH (m, en plan), ms} */
const fs=require('fs'),vm=require('vm'),path=require('path');
const PLANETES={terre:{typ:0,peuple:'satellites',atmo:0x8fd4ff},mars:{typ:1,peuple:'vide',atmo:0xd09064},saturne:{typ:2,peuple:'roches',atmo:0xe8d8a4}};
function creer(search,opt){opt=opt||{};const RACINE=opt.racine||path.resolve(__dirname,'../..');
  const GC=require(path.join(RACINE,'outils/banc-espace/generation-charge.cjs'));const M=GC.creer(search,{lent:1});const ctx=M.ctx;
  const lire=f=>fs.readFileSync(path.join(RACINE,f),'utf8');
  /* les bouchons : ce que les morceaux du décor lisent au chargement et à la pose */
  vm.runInContext(`
var THICK_ROUTE=5.2,THICK=5.2;var ALLEGE=${opt.allege?'true':'false'},TEL_NATIF=false,IS_MOBILE=false,PRF={on:false};
function mapsSobres(){return ${opt.sobre?'true':'false'};}
var __scene=[];var scene={add:function(o){__scene.push(o);},remove:function(){}};
var camera=new THREE.PerspectiveCamera(60,2,1,9000),renderer={properties:{get:function(){return {};}},compile:function(){},domElement:{height:780},info:{render:{}}};
var skyU={uVid:{value:1},uNeb:{value:1},uTime:{value:0}},I18N={},driveDir=1,s=0,started=false,gameOver=false,paused=false;
var pts=[],T=[],Nn=[],NP=0,L=0,MODS=[];
function planeteCap(){return 0;}function soleilPose(){}function nuagesTerre(){}
`,ctx);
  /* frameAt et F : la vraie fonction (ligne-parfaite.js) */
  {const t=lire('code/gameplay/ligne-parfaite.js'),a=t.indexOf('function frameAt('),b=t.indexOf('const padGeo');vm.runInContext(t.slice(a,b),ctx,{filename:'frameAt'});}
  /* les morceaux du décor dans UNE fonction (comme l'IIFE du jeu : leurs const ne se voient que là), orbiteBuild compris ; ce qui manque au chargement devient un bouchon global */
  let src='';for(const f of ['code/maps/orbite-1.js','code/maps/orbite-roches.js','code/maps/orbite-geants.js','code/maps/orbite-voyages-decor.js'])src+=lire(f)+'\n';
  {const t=lire('code/maps/orbite-2.js'),a=t.indexOf('function orbiteBuild(');let i=t.indexOf('{',a),p=0;for(;i<t.length;i++){if(t[i]==='{')p++;else if(t[i]==='}'){p--;if(!p)break;}}src+=t.slice(t.indexOf('function satPassage('),a)+t.slice(a,i+1)+'\n';}
  src='__D=(function(){'+src+'return {orbiteBuild:orbiteBuild,get SATS(){return SATS;},get ROCHES(){return ROCHES;},get GEANTS(){return GEANTS;},get GT_LUNES(){return GT_LUNES;},get GT_VOLS(){return GT_VOLS;},get VOY_D(){return VOY_D;},get ORB(){return ORB;},'
    +'get sansGeants(){return typeof ESP_SANS_GEANTS!=="undefined"?ESP_SANS_GEANTS:null;}};})();';
  const manque=[];
  for(let k=0;k<60;k++){try{vm.runInContext(src,ctx,{filename:'decor'});break;}catch(e){const m=/^(\w+) is not defined/.exec(e&&e.message);if(!m)throw e;manque.push(m[1]);vm.runInContext('var '+m[1]+'=undefined;',ctx);}}
  vm.runInContext(`
function __mods(ctrl,vC9){const curve=courbeCR(ctrl);curve.arcLengthDivisions=Math.max(200,ctrl.length*16);const lg9=curve.getLengths(),n9=Math.max(1,ctrl.length-1),sDe=i=>{const f=i/n9*(lg9.length-1),k=Math.max(0,Math.min(lg9.length-2,Math.floor(f)));return lg9[k]+(lg9[k+1]-lg9[k])*(f-k);};
  const o=[];for(const m of MODMARK)o.push({s0:sDe(m.ia!=null?m.ia:m.i0)-60,s1:sDe(m.i2!=null?m.i2:m.i1)+vC9,fig:m.fig||null,climax:!!m.climax,nu:m.nu?m.nu.map(function(q){return Object.assign({},q,{s9:q.s,s:sDe(q.j!=null?q.j:q.i)});}):null});return o;}
`,ctx);
  function decor(graine,palier,planete){
    if(opt.raz!==false)M.raz();const r=M.route(graine,palier);if(r.err)return {err:r.err};const d=M.dalle(r);if(!d)return {err:'pas de dalle'};
    if(Array.isArray(planete))return planete.map(function(pl){return pose(graine,r,d,pl);});return pose(graine,r,d,planete);}
  function pose(graine,r,d,planete){
    ctx.pts=d.pts;ctx.T=d.T;ctx.Nn=d.Nn;ctx.NP=d.NP;ctx.L=d.L;ctx.MODS=ctx.__mods(r.ctrl,d.vC9);
    const P=PLANETES[planete||'terre'];ctx.LVL.cur={id:'espace',espace:1,carte:'espace',sansFin:1,astre:{typ:P.typ,peuple:P.peuple,atmo:P.atmo}};ctx.PARK={on:false};
    const t0=process.hrtime.bigint();let err=null;try{ctx.__D.orbiteBuild(graine);}catch(e){err=String(e&&e.stack||e).slice(0,500);}const ms=Number(process.hrtime.bigint()-t0)/1e6;
    const o=vm.runInContext(`(function(){const SATS=__D.SATS,ROCHES=__D.ROCHES,GEANTS=__D.GEANTS,GT_LUNES=__D.GT_LUNES,GT_VOLS=__D.GT_VOLS,VOY_D=__D.VOY_D,ORB=__D.ORB;
      const ob=[],M4=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),S=new THREE.Vector3();
      for(let k=0;k<SATS.length;k++)for(let i=0;i<SATS[k].count;i++){SATS[k].getMatrixAt(i,M4);M4.decompose(P,Q,S);const A=SATS[k].geometry.attributes.aMov,tr=SATS[k].geometry.attributes.aTr;
        const v=A?A.getW(i):0;ob.push({k:'sat'+k,x:P.x,y:P.y,z:P.z,ext:Math.max(S.x,S.y,S.z)*1.3,train:v>0?[A.getX(i),A.getY(i),A.getZ(i),tr.getX(i),tr.getY(i)]:null});}
      for(let i=0;i<ROCHES.count;i++){ROCHES.getMatrixAt(i,M4);M4.decompose(P,Q,S);ob.push({k:'roche',x:P.x,y:P.y,z:P.z,ext:Math.max(S.x,S.y,S.z)*1.24});}
      const vd=VOY_D;return {sats:SATS.map(function(m){return m.count;}),roches:ROCHES.count,geants:GEANTS.liste.map(function(g){return g.k;}),
        ep:!!GEANTS.ep,lunes:GT_LUNES.filter(function(m){return m.userData&&m.userData.on;}).length,gaz:GT_VOLS.filter(function(m){return m.userData&&m.userData.on;}).length,nap:!!GEANTS.nap,com:!!GEANTS.com,
        voy:{jante:!!vd.jante,roc:!!vd.roc,neb:!!vd.neb,zonesSaut:vd.zonesSaut.length,zonesPente:vd.zonesPente.length,err:vd.err},durs:ORB.durs?ORB.durs.length/4:0,objets:ob,
        nuGeant:MODS.reduce(function(a,m){return a+(m.nu?m.nu.filter(function(q){return q.t==='geant'||q.t==='voy';}).length:0);},0),gerr:window.__geantsErr?String(window.__geantsErr):null};})()`,ctx);
    /* le dégagement : la distance de chaque objet (son enveloppe ext) au BORD de la route (l'axe − ROAD_HALF), sur TOUS les points de la dalle ; un train Starlink : sa file entière */
    const pts=d.pts,NP=d.NP,HB=60,G=new Map(),cle=(x,z)=>(x+100000)*200000+z+100000;for(let i=0;i<NP;i+=2){const p=pts[i],k=cle(Math.floor(p.x/HB),Math.floor(p.z/HB));let a=G.get(k);if(!a)G.set(k,a=[]);a.push(p);}
    const dist=function(x,y,z,hor){let best=1e18;for(let rr=0;rr<200;rr++){const bx=Math.floor(x/HB),bz=Math.floor(z/HB);let vu=false;
        for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==rr)continue;const a=G.get(cle(bx+dx,bz+dz));if(!a)continue;vu=true;
          for(const p of a){const ex=p.x-x,ey=hor?0:p.y-y,ez=p.z-z,e=ex*ex+ey*ey+ez*ez;if(e<best)best=e;}}
        if(best<1e17&&Math.sqrt(best)<(rr-1)*HB)break;}return Math.sqrt(best);};
    let dMin=1e9,dMinH=1e9,dQui=null,n60=0;
    for(const b of o.objets){const P9=[];if(b.train){const [dx,dy,dz,s9,Lt]=b.train;for(let u=-s9;u<=Lt-s9;u+=40)P9.push([b.x+dx*u,b.y+dy*u,b.z+dz*u]);}else P9.push([b.x,b.y,b.z]);
      for(const q of P9){const e=dist(q[0],q[1],q[2],false)-28-b.ext,eh=dist(q[0],q[1],q[2],true)-28-b.ext;if(e<dMin){dMin=e;dQui=b.k;}if(eh<dMinH)dMinH=eh;if(e<60){n60++;break;}}}
    o.dMin=o.objets.length?Math.round(dMin*10)/10:null;o.dMinH=o.objets.length?Math.round(dMinH*10)/10:null;o.dQui=dQui;o.sous60=n60;o.L=Math.round(d.L);o.ms=Math.round(ms*10)/10;o.err=err;o.nObjets=o.objets.length;
    o.amas=vm.runInContext("__D.ORB.amas?JSON.parse(JSON.stringify(__D.ORB.amas)):null",ctx);
    if(!opt.objets)delete o.objets;return o;}
  return {ctx,M,decor,manque,scene:()=>ctx.__scene};}
module.exports={creer,PLANETES};
