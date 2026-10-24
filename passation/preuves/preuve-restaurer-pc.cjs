/* preuve : le bouton RESTAURER UN CODE du menu ordinateur (?pc=1, #saveImp, interface/menu-logo.js).
   Avant : (1) sur le SITE (SAVE.neuf : rien n'est gardé), un code valide affichait « RESTAURE — RECHARGE… » et rechargeait la page :
   le compte revenait VIDE (le code n'avait été écrit nulle part) et la session en cours partait avec ; (2) dans l'app, entre l'import et
   le rechargement (900 ms), le passage en arrière-plan de la page (visibilitychange → enCoursPose + SAVE.flush) versait la partie en
   cours dans la sauvegarde restaurée. Les deux trous étaient déjà bouchés pour l'ENTRER UN CODE du téléphone (moteur/mobile-tactile.js).
   Extrait le VRAI code de VERSION PRINCIPALE/index.html (le bouton, SAVE.flush, SAVE.import, enCoursPose, l'écouteur visibilitychange)
   et l'exécute avec des bouchons. */
const fs=require('fs');
const F=process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html';
const src=fs.readFileSync(F,'utf8');
function tranche(debut,fin){const i=src.indexOf(debut);if(i<0)throw new Error('introuvable : '+debut);const j=src.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return src.slice(i,j);}
let bouton,flush,imp,pose,visi;
try{
  bouton=tranche("impBtn.addEventListener('click',e=>{",'\n// ---------- MODE SURVIVANT');
  flush=tranche('flush(){if(this.natif===2','\n  export(){');
  imp=tranche('import(code){','\n};');
  pose=tranche('function enCoursPose(){','\nfunction enCoursRetire(){');
  visi=tranche("addEventListener('visibilitychange',function(){ if(document.hidden&&started",'\n// IMMERSION');
}catch(e){console.log('SANS OBJET — '+e.message);process.exit(0);}
const it=function(){return {next:function(){return {done:true};}};};
const bouchon=new Proxy(function(){},{get:function(t,k){if(k===Symbol.toPrimitive)return function(){return 0;};if(k===Symbol.iterator)return it;if(k==='then')return undefined;return bouchon;},
  apply:function(){return bouchon;},construct:function(){return bouchon;},set:function(){return true;}});
function monde(neuf){
  const G={Math:Math,JSON:JSON,Object:Object,Array:Array,Number:Number,String:String,Infinity:Infinity,NaN:NaN,undefined:undefined,isFinite:isFinite,console:console,
    atob:s=>Buffer.from(s,'base64').toString('latin1'),escape:escape,unescape:unescape,decodeURIComponent:decodeURIComponent,encodeURIComponent:encodeURIComponent,
    performance:{now:()=>0},window:{},localStorage:{},document:{hidden:false},
    TR:s=>s,pxi:()=>'',messages:[],minuteurs:[],rechargements:0,ecouteurs:[]};
  G.btnFlash=function(b,t){G.messages.push(t);};G.setTimeout=function(f){G.minuteurs.push(f);};G.location={reload:function(){G.rechargements++;}};
  G.addEventListener=function(t,f){G.ecouteurs.push([t,f]);};
  G.impBtn={addEventListener:function(t,f){G.clic=f;}};
  /* une partie EN COURS, en pause (le menu des réglages est par-dessus) */
  G.started=true;G.gameOver=false;G.paused=true;G.mode='drive';G.running=false;G.SANDBOX=false;G.TUTO={on:false};G.PARK={on:false};
  G.CHA={n:0,pts:0,x:1};G.CHANCE={used:false};G.money=5000;G.auraRun=120;G.runStats={tricks:0,gaps:0,bumps:0,surv:0,zones:0,chainMax:0,vmax:0};
  G.FLOW={lv:0};G.FREN={t:0};G.engTier=3;G.jourCommit=function(){};G.chanceBase=function(){return 0;};G.enCoursRetire=function(){};
  return new Proxy(G,{has:function(t,k){return k!==Symbol.unscopables;},get:function(t,k){if(k===Symbol.unscopables)return undefined;return k in t?t[k]:bouchon;},set:function(t,k,v){t[k]=v;return true;}});
}
function charge(G,neuf){
  const code='SAVE={K:"cashcarSave",V:9,natif:0,neuf:'+(!!neuf)+',dirty:false,d:{bank:42,v:9},san:function(d){return d;},'+flush+imp+'};\n'
    +bouton+'\n'+pose+'\n'+visi;
  new Function('G','with(G){'+code+'\n}')(G);
}
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)process.exitCode=1;};
const CODE=Buffer.from(JSON.stringify({v:9,bank:777000}),'latin1').toString('base64');
/* 1. LE SITE (SAVE.neuf) : un code valide collé dans RESTAURER UN CODE */
{const G=monde(true);charge(G,true);G.prompt=function(){return CODE;};
  try{G.clic({stopPropagation:function(){}});}catch(e){ok(false,'le bouton a jeté : '+e.message);}
  for(const f of G.minuteurs.splice(0))try{f();}catch(e){}
  ok(G.rechargements===0,'le site ne recharge pas la page sur un code qu\'il ne saura pas garder (rechargements : '+G.rechargements+')');
  ok(!G.messages.some(t=>/RECHARGE/.test(t)),'il n\'annonce pas « RESTAURE — RECHARGE… » (dit : '+(G.messages.join(' | ')||'rien')+')');
  ok(G.SAVE.d.bank===42,'la session en cours est intacte (compte '+G.SAVE.d.bank+')');}
/* 2. L'APP : le code est restauré, puis la page part en arrière-plan avant le rechargement (900 ms) */
{const G=monde(false);charge(G,false);G.prompt=function(){return CODE;};
  try{G.clic({stopPropagation:function(){}});}catch(e){ok(false,'le bouton a jeté : '+e.message);}
  const enreg0=G.localStorage.cashcarSave;
  ok(!!enreg0&&JSON.parse(enreg0).bank===777000,'le code est écrit dans la sauvegarde (compte '+(enreg0?JSON.parse(enreg0).bank:'—')+')');
  G.document.hidden=true;for(const [t,f] of G.ecouteurs)if(t==='visibilitychange')try{f();}catch(e){ok(false,'visibilitychange a jeté : '+e.message);}
  const enreg=JSON.parse(G.localStorage.cashcarSave||'{}');
  ok(!enreg.enCours,'la partie en cours n\'est PAS versée dans la sauvegarde restaurée (enCours : '+(enreg.enCours?JSON.stringify(enreg.enCours):'aucun')+')');
  ok(G.minuteurs.length===1,'le rechargement est bien programmé');}
console.log(process.exitCode?'PREUVE KO — RESTAURER UN CODE (menu ordinateur) rend un compte vide sur le site, ou verse la partie en cours dans la sauvegarde restaurée':'PREUVE OK — RESTAURER UN CODE (menu ordinateur) refuse sur le site et n\'écrit plus rien après la restauration');
