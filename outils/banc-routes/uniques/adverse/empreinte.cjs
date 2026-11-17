/* CONTRÔLE ADVERSE — attaque 7 : `?sans=uniques` rend-il la route d'avant AU BIT PRÈS ? (et les cartes qui partagent genCtrl1 : nuages, ville, crypto)
     node empreinte.cjs [n=24] [paliers=0,10,27]
   Référence : ref=88a648892 (git show). Empreinte = FNV-1a sur les octets Float64 de chaque point de la route finale + les marques (fig, i0, i1, climax). */
const vm=require('vm'),path=require('path'),R=require('../routes.cjs'),L=require('./lib.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const n=+arg('n','24'),PAL=arg('paliers','0,10,27').split(',').map(Number),G=L.graines(n,0xE3B0);
function fnv(h,buf){for(let i=0;i<buf.length;i++){h^=buf[i];h=Math.imul(h,16777619);}return h>>>0;}
function emp(ctrl,marks){let h=2166136261;const b=Buffer.alloc(24);for(const p of ctrl){b.writeDoubleLE(p.x,0);b.writeDoubleLE(p.y,8);b.writeDoubleLE(p.z,16);h=fnv(h,b);}
  h=fnv(h,Buffer.from(JSON.stringify((marks||[]).map(m=>[m.fig||m.nom,m.i0,m.i1,!!m.climax]))));return h.toString(16);}
/* chargeur des cartes genCtrl (copie de routes.cjs/chargeEspace, toutes cartes) */
function charge(search,ref){const Lr=R.lecteur(ref),lw=R.lecteur('');const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Uint8Array,Int32Array,Int16Array,Uint16Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
  ctx.window=ctx;ctx.self=ctx;ctx.location={search:search||''};vm.runInContext(lw('VERSION PRINCIPALE/vendor/three.min.js'),ctx);
  vm.runInContext(`var PARK={on:false},started=true,SF={pret:true},engTier=0,runStats={zones:1},LVL={cur:null},zoneArch='FLOW';var ROAD_HALF=28,FALL_G=33*1.0,SPD=.48;
var FILET={on:true,kv:1.1,dh:42,dhS:12,kick:1.6,dev:.13,par:[3,2,1],vFond:.8,visite:null},FILETMARK=[],MODMARK=[];var NIVEAUX=[0,0,0,0,0];var __vw=78;function vPalier(){return __vw;}
function lvPiste(){return 1+THREE.MathUtils.clamp((__vw-70)/140*1.4,0,3.4);}function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}var RYTHME_N=1;`,ctx);
  for(const f of ['code/gameplay/route-sans-haut.js','code/gameplay/route-rythme.js','code/gameplay/route-briques.js','code/gameplay/route-uniques.js','code/maps/nuages-modules.js','code/maps/nuages-parcours.js','code/maps/orbite-modules.js','code/maps/orbite-voyages.js','code/maps/orbite-uniques.js','code/maps/ville-scenes.js','code/maps/ville-entree.js']){const s=Lr(f);if(s!=null)vm.runInContext(s,ctx,{filename:f});}
  vm.runInContext(`function __setPalier(t,vw){engTier=t;__vw=vw;}function __cible(){const k=Math.min(1,engTier/25),d=45+(20-45)*k,al=LVL.cur.id==='espace'?(typeof ESP_V3!=='undefined'&&ESP_V3?1.5:1.2):LVL.cur.__al||1.05;return d*__vw*(1.8+(1-1.8)*k)*al;}longueurCible=__cible;`,ctx);
  return function(carte,g,p){ctx.__setPalier(p,L.VW[p]);ctx.LVL.cur=carte==='espace'?{id:'espace',espace:1,carte:'espace',sansFin:1}:carte==='ville'?{id:'ville',carte:'ville',sansFin:1,__al:1}:carte==='crypto'?{id:'ville',crypto:1,carte:'crypto',sansFin:1,__al:1.15}:{id:'nuages',carte:'nuages',sansFin:1};
    ctx.window.dbgEspOff=false;ctx.MODMARK.length=0;ctx.FILETMARK.length=0;let c=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0);const tord=ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn());
    let N=null;if(tord){const h=ctx.pisteTordPropre(c,g);c=h.ctrl;N=h.N;}return emp(c.concat(N||[]),ctx.MODMARK);};}
const res=[];
function compare(nom,fA,fB,cartes){let ok=0,ko=0;const ex=[];for(const c of cartes){const A=fA(),B=fB();for(const p of PAL)for(const g of G){const a=A(c,g,p),b=B(c,g,p);if(a===b)ok++;else{ko++;if(ex.length<4)ex.push(c+' g'+g+' p'+p);}}}
  const l=nom+' : '+ok+' identiques, '+ko+' différentes'+(ex.length?' (ex. '+ex.join(', ')+')':'');res.push(l);console.log(l);}
/* l'espace et les autres : un vm par carte et par côté, mêmes graines dans le même ordre (la mémoire ORB_PIOCHE enchaîne pareil) */
compare('ESPACE ?sans=uniques vs avant',()=>charge('?sans=uniques',''),()=>charge('','88a648892'),['espace']);
compare('ESPACE ?sans=uniques&espace=voyages vs avant ?espace=voyages',()=>charge('?sans=uniques&espace=voyages',''),()=>charge('?espace=voyages','88a648892'),['espace']);
compare('NUAGES/VILLE/CRYPTO (RU allumé) vs avant',()=>charge('',''),()=>charge('','88a648892'),['nuages','ville','crypto']);
compare('NUAGES/VILLE/CRYPTO ?sans=uniques vs avant',()=>charge('?sans=uniques',''),()=>charge('','88a648892'),['nuages','ville','crypto']);
/* jade */
function jade(search,ref){const M=R.moteur('jade',search,ref);return function(c,g,p){const r=M.route(g,p);const bn=M.ctx.JADE.bankN;return emp(r.ctrl.concat(bn?bn.map(v=>({x:v.x,y:v.y,z:v.z})):[]),r.mods.map(m=>({fig:m.nom,i0:m.i0,i1:m.i1,climax:m.climax})));};}
compare('JADE ?sans=uniques vs avant',()=>jade('?sans=uniques',''),()=>jade('','88a648892'),['jade']);
compare('JADE ?sans=uniques&jade=avatar vs avant ?jade=avatar',()=>jade('?sans=uniques&jade=avatar',''),()=>jade('?jade=avatar','88a648892'),['jade']);
require('fs').writeFileSync(path.join(__dirname,'resultats-empreinte.txt'),res.join('\n')+'\n');
