/* preuve : une partie qui finit PENDANT une figure sur la route (FR, ~0,6-1 s après un double-tap au sol) ou PENDANT la descente d'une
   pose déclarée en l'air (POSE_F, 0,1-0,5 s) — pause puis RECOMMENCER / QUITTER, appel entrant, mort au sol — ne laisse rien à la suivante.
   Avant : resetGame → respawn rangeait le demi-tour (dmtCoupe) et le geste du GLISSER (gsolCoupe), mais ni FR ni POSE_F :
   · la partie suivante FINISSAIT la figure de l'ancienne (la caisse tournait et bondissait au départ) et la PAYAIT (figPaye : aura, HUD) ;
   · POSE_F resté posé refusait le saut nitro (veqSaut), le décollage au manche (frEnvol) et toute figure au sol du GLISSER (gsolLance)
     jusqu'au vol suivant — et au premier dos d'âne il rejouait le contact de l'ancienne pose (perte de vitesse jusqu'à 30 %).
   Extrait le VRAI code de VERSION PRINCIPALE/index.html (respawn, gsolLance, frCoupe/frFin/frTick) et l'exécute avec des bouchons. */
const fs=require('fs');
const F=process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html';
const src=fs.readFileSync(F,'utf8');
function tranche(debut,fin){const i=src.indexOf(debut);if(i<0)throw new Error('introuvable : '+debut);const j=src.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return src.slice(i,j);}
const code=tranche('function respawn(){','\n// FREESTYLE : on ne MEURT jamais')+'\n'+tranche('function gsolLance(d){','\nfunction gsolCoupe(')+'\n'+tranche('function frCoupe(){','\nfunction frPose(F,dt){');
/* un bouchon « tout-terrain » : n'importe quelle propriété, n'importe quel appel, rend lui-même */
const it=function(){return {next:function(){return {done:true};}};};
const bouchon=new Proxy(function(){},{get:function(t,k){if(k===Symbol.toPrimitive)return function(){return 0;};if(k===Symbol.iterator)return it;if(k==='then')return undefined;return bouchon;},
  apply:function(){return bouchon;},construct:function(){return bouchon;},set:function(){return true;}});
function monde(){
  const G={Math:Math,JSON:JSON,Object:Object,Array:Array,Number:Number,String:String,Infinity:Infinity,NaN:NaN,undefined:undefined,isFinite:isFinite,console:console};
  return new Proxy(G,{has:function(t,k){return k!==Symbol.unscopables;},get:function(t,k){if(k===Symbol.unscopables)return undefined;return k in t?t[k]:bouchon;},set:function(t,k,v){t[k]=v;return true;}});
}
function charge(G){return new Function('G','with(G){'+code+'\n;return {respawn:respawn,gsolLance:gsolLance,frTick:frTick};}')(G);}
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)process.exitCode=1;};

/* 1. LA POSE EN SUSPENS : déclarée à 2 m du bitume, la partie s'arrête avant le contact (pause → RECOMMENCER) */
{const G=monde(),f=charge(G);let contacts=0;
  G.hopY=2;G.hopV=-9;G.POSE_F=function(){contacts++;};
  try{f.respawn();}catch(e){ok(false,'respawn a jeté : '+e.message);}
  ok(G.hopY===0&&G.mode==='drive','respawn est allé au bout (hopY 0, mode drive)');
  ok(G.POSE_F===null,'la partie neuve n\'hérite pas du contact de l\'ancienne pose (POSE_F : '+(G.POSE_F===null?'null':typeof G.POSE_F)+')');
  G.mode='drive';G.side=1;G.GSOL={k:null,t:0,D:0,s:1,saute:false,k0:false};
  let r;try{r=f.gsolLance('l');}catch(e){r='jette : '+e.message;}
  ok(r===true,'au départ de la partie neuve, le SLIDE 360 du GLISSER part (rendu : '+r+')');
  ok(contacts===0,'le contact de l\'ancienne pose n\'a pas été rejoué');}

/* 2. LA FIGURE SUR LA ROUTE EN COURS : un tonneau lancé au sol, la partie s'arrête à mi-figure (pause → RECOMMENCER, ou mort au sol) */
{const G=monde(),f=charge(G);const payees=[];let encaisse=0;
  const fig={paye:false,mv:[],f:{id:'tonneau'}};
  G.FR={on:true,t:.5,T:1,D:.7,H:.7,lift:.6,liftMax:.6,pivK:0,fini:0,vel:{x:0,y:0,z:0},
    C:{budget:0,poseK:0,evts:[],figs:[fig],vide:function(){this.figs.length=0;},tick:function(){return [];},ecart:function(){return 0;},pose:function(){return {payees:this.figs.filter(function(r){return !r.paye;})};}}};
  G.FX2={nitL:1,v:bouchon};G.frPaye=function(r){payees.push(r.f.id);};G.frEncaisse=function(){encaisse++;};G.frEnvol=function(){return false;};
  try{f.respawn();}catch(e){ok(false,'respawn a jeté : '+e.message);}
  ok(G.FR.on===false,'respawn range la figure sur la route (FR.on : '+G.FR.on+')');
  G.started=true;G.gameOver=false;G.paused=false;G.mode='drive';
  try{f.frTick(.6);}catch(e){ok(false,'frTick a jeté : '+e.message);}
  ok(payees.length===0,'la partie neuve ne paie pas la figure de l\'ancienne (payées : '+(payees.join(',')||'aucune')+')');
  ok(encaisse===0&&G.FR.lift===0,'ni encaissement ni bond hérités au départ (encaissements '+encaisse+', bond '+G.FR.lift+')');}
console.log(process.exitCode?'PREUVE KO — une partie arrêtée en pleine figure / en pleine descente de pose déborde sur la suivante':'PREUVE OK — ni figure sur la route ni contact de pose hérités par la partie suivante');
