/* preuve : les RÉCLAMES de la ville (l'atlas des panneaux holographiques, villePubAtlas) suivent la LANGUE choisie en cours de session.
   Avant : l'atlas était peint UNE fois et gardé tant que la TEINTE de la ville ne changeait pas — la clé du cache ne connaissait pas la
   langue. Joueur qui fait une ville en français, passe en anglais dans les réglages (langNext, rien ne repeint l'atlas), puis retombe sur une
   ville de la même teinte : les panneaux restent en FRANÇAIS (« LA CAISSE QUI PAIE », « PLEIN GAZ »…) — et l'inverse pour un joueur anglais.
   Extrait le VRAI code de VERSION PRINCIPALE/index.html (PUB_EN, pubLangue, villePubAtlas) et l'exécute avec des bouchons (toile qui note
   ce qu'on y écrit). */
const fs=require('fs');
const F=process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html';
const src=fs.readFileSync(F,'utf8');
function tranche(debut,fin){const i=src.indexOf(debut);if(i<0)throw new Error('introuvable : '+debut);const j=src.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return src.slice(i,j);}
let code;
try{code=tranche('const PUB_EN={','\nfunction villeMatPub(){');}catch(e){console.log('SANS OBJET — '+e.message);process.exit(0);}
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)process.exitCode=1;};
/* une toile qui note les textes écrits */
function toile(ecrits){const ctx=new Proxy({},{get:function(t,k){if(k==='fillText')return function(s){ecrits.push(String(s));};if(k==='createLinearGradient')return function(){return {addColorStop:function(){}};};
    if(k in t)return t[k];return function(){};},set:function(t,k,v){t[k]=v;return true;}});
  return {width:0,height:0,getContext:function(){return ctx;}};}
function monde(){
  const G={ecrits:[],Math:Math,JSON:JSON,Object:Object,Array:Array,Number:Number,String:String,console:console,
    LVL:{cur:{id:'ville',teinte:null}},CITY:{},LANG:'fr',
    vtCur:function(){return null;},vtHex:function(s){return s;},texLibere:function(t){return t;}};
  G.document={createElement:function(){return toile(G.ecrits);}};
  G.THREE={CanvasTexture:function(cv){this.image=cv;this.needsUpdate=false;},NearestFilter:1,LinearMipmapLinearFilter:2};
  return G;
}
const G=monde();
const f=new Function('G','with(G){'+code+'\n;return {villePubAtlas:villePubAtlas};}')(G);
/* 1. la première ville, en français */
let t1;try{t1=f.villePubAtlas();}catch(e){ok(false,'villePubAtlas a jeté : '+e.message);process.exit(1);}
ok(G.ecrits.indexOf('LA CAISSE QUI PAIE')>=0,'1re ville en français : les réclames sont peintes en français');
/* 2. le joueur passe en ANGLAIS dans les réglages, puis repart sur une ville de la même teinte */
G.LANG='en';G.ecrits.length=0;
let t2;try{t2=f.villePubAtlas();}catch(e){ok(false,'villePubAtlas a jeté : '+e.message);process.exit(1);}
ok(t2===t1,'la même texture est gardée (la matière des panneaux ne bouge pas)');
ok(G.ecrits.indexOf('THE CAR PAYS')>=0&&G.ecrits.indexOf('LA CAISSE QUI PAIE')<0,'après le passage en anglais, les réclames sont repeintes en anglais (écrit : '+(G.ecrits.slice(0,4).join(' | ')||'rien — l\'atlas français est resservi')+')');
/* 3. sans changement (même langue, même teinte) : pas de repeinte inutile */
G.ecrits.length=0;f.villePubAtlas();
ok(G.ecrits.length===0,'même langue et même teinte : l\'atlas n\'est pas repeint (rien écrit : '+G.ecrits.length+' textes)');
console.log(process.exitCode?'PREUVE KO — les réclames de la ville gardent la langue de la première ville peinte':'PREUVE OK — les réclames de la ville suivent la langue du joueur');
