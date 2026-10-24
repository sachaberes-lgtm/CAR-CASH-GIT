/* preuve : aux PICS DE JADE, une montagne qui s'effondre (jadeChuteTick : elle tremble 0,9 s puis bascule et tombe vers la mer) reprend sa chute
   LÀ OÙ ELLE EN ÉTAIT après une PAUSE (bouton pause, appel entrant → PAUSE).
   Avant : l'horloge de la chute était JADE_U.uTime, que jadeTick avance à chaque image, pause comprise (le temps réel), alors que jadeChuteTick
   ne tourne pas en pause : au retour, la montagne avait pris toute la durée de la pause d'un coup — elle sautait de plusieurs centaines de
   mètres en une image (l'écume jaillissait, elle disparaissait sous la mer, sa hitbox suivait).
   Extrait le VRAI code de VERSION PRINCIPALE/index.html (JCH_M…, jadeChuteTick) et l'exécute avec des bouchons, l'horloge menée comme la boucle
   (dt réel à chaque image ; jadeTick avance uTime même en pause ; jadeChuteTick seulement hors pause). */
const fs=require('fs');
const F=process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html';
const src=fs.readFileSync(F,'utf8');
function tranche(debut,fin){const i=src.indexOf(debut);if(i<0)throw new Error('introuvable : '+debut);const j=src.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return src.slice(i,j);}
let code;
try{code=tranche('const JCH_M=new THREE.Matrix4()','\nfunction jadeChuteOrig(c){');}catch(e){console.log('SANS OBJET — '+e.message);process.exit(0);}
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)process.exitCode=1;};
const it=function(){return {next:function(){return {done:true};}};};
const bouchon=new Proxy(function(){},{get:function(t,k){if(k===Symbol.toPrimitive)return function(){return 0;};if(k===Symbol.iterator)return it;if(k==='then')return undefined;return bouchon;},
  apply:function(){return bouchon;},construct:function(){return bouchon;},set:function(){return true;}});
function monde(){
  const G={Math:Math,JSON:JSON,Object:Object,Array:Array,Number:Number,String:String,Float32Array:Float32Array,Infinity:Infinity,NaN:NaN,undefined:undefined,isFinite:isFinite,console:console};
  return new Proxy(G,{has:function(t,k){return k!==Symbol.unscopables;},get:function(t,k){if(k===Symbol.unscopables)return undefined;return k in t?t[k]:bouchon;},set:function(t,k,v){t[k]=v;return true;}});
}
const G=monde();
const f=new Function('G','with(G){'+code+'\n;return {jadeChuteTick:jadeChuteTick};}')(G);
/* la vallée : l'eau à 0, une montagne de 140 m (pied à 40 m au-dessus de l'eau), qui tombe à 8 m/s² ; la caisse vient d'arriver à sa hauteur */
const c={pi:0,q:[0,0,30,40,180,0,0,0,500],sN:1000,dl:0,ax:bouchon,dx:1,dz:0,g:8,w:.2,t0:0,fin:false,spl:false,orig:null,fo:null,inv:null};
let ecumes=0;
Object.assign(G,{JCH:{L:[c],fixe:new Set(),splash:null,sp:[],t:0},JADE:{root:{},col:{mort:new Set()},eauY:0},JADE_U:{uTime:{value:100}},
  started:true,gameOver:false,paused:false,mode:'drive',s:400,shake:0,FIN:{mats:new Map()},carGroup:{position:{distanceTo:function(){return 1e9;},y:0}},
  jadeChuteOrig:function(c9){c9.orig=[];c9.fo=null;},jadeEcume:function(){ecumes++;},imEnvoi:function(){}});
const dt=.05;
function image(pause){G.paused=pause;G.JADE_U.uTime.value+=dt; /* jadeTick : l'horloge des matières avance, pause comprise */
  if(!pause){try{f.jadeChuteTick(dt);}catch(e){ok(false,'jadeChuteTick a jeté : '+e.message);process.exit(1);}}}
/* 1. la chute commence (tremblement 0,9 s), puis tombe 0,3 s : à peine 0,4 m de descente — ni écume ni disparition */
for(let i=0;i<24;i++)image(false);
ok(c.t0>0&&!c.spl&&!c.fin,'1,2 s après le départ : la montagne tremble puis commence à basculer (écume : '+c.spl+', partie : '+c.fin+')');
/* 2. PAUSE de 8 s (bouton pause, ou un appel entrant) */
for(let i=0;i<160;i++)image(true);
/* 3. reprise : une image */
image(false);
ok(!c.spl&&ecumes===0,'au retour de pause, la montagne n\'a pas plongé dans la mer d\'un coup (écume : '+(c.spl?'oui':'non')+')');
ok(!c.fin,'au retour de pause, la montagne est toujours là, en pleine chute (partie sous la mer : '+(c.fin?'oui':'non')+')');
/* 4. la chute va bien à son terme en temps de jeu (≈ 6,5 s de chute pour 200 m) */
for(let i=0;i<200&&!c.fin;i++)image(false);
ok(c.spl&&c.fin&&ecumes===1,'la chute finit normalement en temps de jeu : écume une fois, puis la montagne sombre');
console.log(process.exitCode?'PREUVE KO — une pause fait sauter les montagnes de Jade en pleine chute':'PREUVE OK — l\'effondrement de Jade s\'arrête avec la pause et reprend où il en était');
