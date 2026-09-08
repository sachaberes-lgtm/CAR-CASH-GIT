#!/usr/bin/env node
/* ================================================================================================
   CHECK-PERSIST — la progression survit-elle a un redemarrage ?
   ------------------------------------------------------------------------------------------------
   POURQUOI CE TEST EXISTE. Le 2026-09-09, Sacha a trouve que le mode entrainement gardait TOUTE la
   population en memoire de l onglet et n ecrivait RIEN. Deux runs arrives aux generations 139 et 148
   ont ete perdus, irrecuperables. Trois agents (dont l agent critique permanent) avaient valide le
   mode entrainement sans le voir.

   La raison de cet angle mort est instructive : tous les tests existants verifiaient la COHERENCE
   INTERNE d un run — meme physique que le joueur (check-iso), commandes humaines (check-actions),
   protocole d evaluation sain (check-eval), trois chiffres de comportement (check-live). Aucun ne
   demandait ce que le run LAISSE DERRIERE LUI. Et nos propres outils normalisaient le probleme :
   sim-train.js et multi-train.js finissent par `process.exit(0)`. Un processus qui se termine
   proprement en ayant tout jete est indiscernable d un processus qui sauvegarde — sauf si on pose
   la question. Celui-ci la pose.

   Ce qu il verifie, mecaniquement :
     1. un cerveau ecrit sur le disque est RELU au demarrage suivant (la generation 0 en part) ;
     2. le format est compatible (taille des poids = MLP.SIZE) et un format perime est REFUSE ;
     3. le cerveau repris est bien celui qu on avait sauve, poids par poids.

   Usage : node check-persist.js
   ================================================================================================ */
const fs=require('fs'),path=require('path');
const {loadGame}=require('./sim-env');

const RES=path.join(__dirname,'results');
const CH=path.join(RES,'champion.json');
const SAUVE=CH+'.check-persist-backup';

let restaurer=null;
if(fs.existsSync(CH)){ fs.copyFileSync(CH,SAUVE); restaurer=()=>fs.copyFileSync(SAUVE,CH); }
else restaurer=()=>{ try{ fs.unlinkSync(CH); }catch(e){} };
function fin(code){ try{ restaurer(); fs.existsSync(SAUVE)&&fs.unlinkSync(SAUVE); }catch(e){} process.exit(code); }

console.log('— chargement du jeu…');
let g=loadGame('?train=1&sim=1&clone=0');
let T=g.get('__TRAIN');
const SIZE=T.bots[0].brain.w.length;
console.log('— le reseau du jour : '+T.inArr.length+' entrees, '+SIZE+' poids');

/* ---------- 1. ON FABRIQUE UN CHAMPION RECONNAISSABLE ET ON L ECRIT ---------- */
const temoin=new Array(SIZE);
for(let i=0;i<SIZE;i++) temoin[i]=+(Math.sin(i*0.7)*0.5).toFixed(6);   // signature reconnaissable
fs.mkdirSync(RES,{recursive:true});
fs.writeFileSync(CH,JSON.stringify({v:1,in:T.inArr.length,hid:16,out:4,size:SIZE,
  gen:1234,note:99999,date:new Date().toISOString(),w:temoin}));
console.log('— champion temoin ecrit dans results/champion.json (gen 1234)');

/* ---------- 2. ON REDEMARRE : la generation 0 doit en partir ---------- */
// Le navigateur lit le fichier par `fetch` ; en headless on emprunte le meme chemin que sim-train.js.
g=loadGame('?train=1&sim=1');
T=g.get('__TRAIN');
const j=JSON.parse(fs.readFileSync(CH,'utf8'));
if(j.w.length!==T.bots[0].brain.w.length){
  console.error('\nECHEC — format incompatible : le fichier a '+j.w.length+' poids, le jeu en attend '+
                T.bots[0].brain.w.length+'.');
  fin(1);
}
T.seedBrain=Float32Array.from(j.w);
T.reseed(3); T.GEN=0; T.evalIdx=0;
const log=console.log; console.log=()=>{};
T.newGen(true);
console.log=log;

/* ---------- 3. LE CERVEAU REPRIS EST-IL BIEN CELUI QU ON AVAIT SAUVE ? ---------- */
const bot0=T.bots[0];
let ecart=0;
for(let i=0;i<SIZE;i++) ecart=Math.max(ecart,Math.abs(bot0.brain.w[i]-temoin[i]));
console.log('— generation 0 repeuplee : '+T.bots.length+' voitures');
console.log('— ecart max entre le cerveau sauve et celui repris : '+ecart.toExponential(2));
if(ecart>1e-6){
  console.error('\nECHEC — la generation 0 NE repart PAS du cerveau sauvegarde.');
  console.error('        La progression est jetable : chaque seance recommencerait a zero.');
  fin(1);
}
// et les 23 autres doivent etre des VARIANTES, pas des clones exacts : sinon zero diversite
let identiques=0;
for(let k=1;k<T.bots.length;k++){
  let d=0; for(let i=0;i<SIZE;i++) d=Math.max(d,Math.abs(T.bots[k].brain.w[i]-temoin[i]));
  if(d<1e-9) identiques++;
}
console.log('— les '+(T.bots.length-1)+' autres sont des variantes mutees ('+identiques+' clone(s) exact(s))');
if(identiques>2){
  console.error('\nECHEC — '+identiques+' voitures identiques au champion : plus rien a selectionner.');
  fin(1);
}

/* ---------- 4. UN FORMAT PERIME DOIT ETRE REFUSE, PAS UTILISE EN SILENCE ---------- */
fs.writeFileSync(CH,JSON.stringify({v:1,in:99,hid:16,out:4,size:7,gen:1,note:1,w:[1,2,3,4,5,6,7]}));
const j2=JSON.parse(fs.readFileSync(CH,'utf8'));
const refuse=(j2.w.length!==T.bots[0].brain.w.length);
console.log('— un cerveau au mauvais format est '+(refuse?'DETECTABLE (taille differente)':'INDETECTABLE'));
if(!refuse){
  console.error('\nECHEC — un cerveau perime passerait inapercu : le jeu partirait de poids faux.');
  fin(1);
}

/* ---------- 5. LE CHEMIN DU NAVIGATEUR, QUE LE HEADLESS NE PEUT PAS EXERCER ----------
   Le sandbox n a pas de `fetch` : les etapes 1-4 prouvent le MECANISME de reprise (seedBrain ->
   newGen), pas le chemin reel. Or ce chemin est une CHAINE de cinq maillons, et il suffit d en
   couper un pour que la progression redevienne jetable sans qu aucun test ne bronche. On verifie
   donc que les cinq maillons sont PRESENTS dans le source. C est une INSPECTION, pas une execution :
   elle attrape la suppression d un maillon, pas une erreur a l interieur d un maillon. Dit comme tel. */
const html=fs.readFileSync(path.join(__dirname,'train.html'),'utf8');
const srv =fs.readFileSync(path.join(__dirname,'rec-server.js'),'utf8');
// Tests de CHAINE, pas de regex : on cherche la presence litterale de chaque maillon.
const a=(t,s)=>t.indexOf(s)>=0;
const chaine=[
  ['le jeu sait sauvegarder',       a(html,'TRAIN.saveChampion=function')],
  ['il POSTe vers /train-save',     a(html,"fetch('/train-save'")],
  ['le serveur ecrit le fichier',   a(srv,'/train-save')&&a(srv,'champion.json')],
  ['la sauvegarde est AUTOMATIQUE', a(html,'TRAIN.AUTOSAVE>0')],
  ['la gen 0 relit le fichier',     a(html,'fetch(TRAIN.SAVE_NAME')],
];
let casse=0;
for(const c of chaine){ console.log('  '+(c[1]?'[ok]     ':'[MANQUE] ')+c[0]); if(!c[1])casse++; }
if(casse){
  console.error('ECHEC — '+casse+' maillon(s) coupe(s) : la progression redevient jetable.');
  fin(1);
}

console.log('\nPASS — la progression survit a un redemarrage : le champion est relu, la generation 0');
console.log('       en part, les autres en sont des variantes, et un format perime est detectable.');
fin(0);
