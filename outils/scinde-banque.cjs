#!/usr/bin/env node
/* LA BANQUE DE SONS EN DEUX MOITIÉS, À LA PUBLICATION (2026-10-24, passe perf — « le 1er lancement sur une connexion lente »).
   MESURÉ (iPhone simulé, processeur ×4, réseau 1,6 Mbit/s) : sons-banque.js pèse 4,9 Mo sur les 8,4 Mo du 1er lancement, et le jeu attend sa
   fin (script `defer`) avant le menu : 57 s avec, 28 s sans. Or seules 109 fiches sur 398 (`pre:1` : l'interface, la pièce, la pose — 0,82 Mo
   sur 7,7 Mo) servent aux premiers instants ; le décodeur de sfx.js travaille déjà par morceaux et « se tait » sur un son pas encore décodé.
   Cet outil, lancé par vercel-build.sh sur la COPIE publiée seulement (le fichier du dépôt reste entier : cuire.js le relit, le banc d'écoute
   et la salle blanche le chargent tel quel), réécrit :
     sons-banque.js    = les fiches (m) + les sons `pre:1` + l'étalon, et le drapeau `partiel:1`
     sons-banque-2.js  = `window.CCSON_BANQUE_2={d:{…le reste…}}`, que sfx.js charge APRÈS l'événement load (CCSON.ajoute).
   Sans perte : l'union des deux fichiers = la banque d'origine (vérifié à chaque lancement, sinon rien n'est écrit).
   usage : node outils/scinde-banque.cjs <dossier publié>   (le dossier qui contient sons-banque.js) */
'use strict';
const fs=require('fs'),path=require('path');
const dos=process.argv[2];if(!dos){console.error('usage : scinde-banque.cjs <dossier>');process.exit(2);}
const F1=path.join(dos,'sons-banque.js'),F2=path.join(dos,'sons-banque-2.js');
const src=fs.readFileSync(F1,'utf8');
const sandbox={window:{}};new Function('window',src)(sandbox.window);
const B=sandbox.window.CCSON_BANQUE;
if(!B||!B.m||!B.d){console.error('⚠ banque illisible : rien n\'est scindé');process.exit(1);}
if(B.partiel){console.log('déjà scindée');process.exit(0);}
const d1={},d2={};let n1=0,n2=0,o1=0,o2=0;
for(const k of Object.keys(B.d)){
  const id=k.split('#')[0],m=B.m[id]||{},v=B.d[k];
  if(k==='__etalon'||m.pre){d1[k]=v;n1++;o1+=(v||'').length;}else{d2[k]=v;n2++;o2+=(v||'').length;}}
const ent={};for(const k of Object.keys(B))if(k!=='d'&&k!=='m')ent[k]=B[k];
const tete='/* CASH CAR — LA BANQUE DE SONS, 1re moitié (la copie PUBLIÉE : outils/scinde-banque.cjs). Le reste : sons-banque-2.js, chargé après load. */\n';
const js1=tete+'window.CCSON_BANQUE={'+Object.keys(ent).map(k=>JSON.stringify(k)+':'+JSON.stringify(ent[k])).join(',')+',"partiel":1,"m":'+JSON.stringify(B.m)+',\n"d":{\n'+
  Object.keys(d1).map(k=>JSON.stringify(k)+':'+JSON.stringify(d1[k])).join(',\n')+'\n}};\n';
const js2='/* CASH CAR — LA BANQUE DE SONS, 2e moitié (chargée par sfx.js après l\'événement load). */\nwindow.CCSON_BANQUE_2={"d":{\n'+
  Object.keys(d2).map(k=>JSON.stringify(k)+':'+JSON.stringify(d2[k])).join(',\n')+'\n}};\n';
// la preuve : relire les deux textes et retrouver la banque d'origine, octet pour octet
const w1={},w2={};new Function('window',js1)(w1);new Function('window',js2)(w2);
const U=Object.assign({},w1.CCSON_BANQUE.d,w2.CCSON_BANQUE_2.d);
let ok=Object.keys(U).length===Object.keys(B.d).length&&JSON.stringify(w1.CCSON_BANQUE.m)===JSON.stringify(B.m);
for(const k of Object.keys(B.d))if(U[k]!==B.d[k]){ok=false;break;}
for(const k of ['v','sr','tete'])if(w1.CCSON_BANQUE[k]!==B[k])ok=false;
if(!ok){console.error('⚠ la preuve échoue : la banque reste entière');process.exit(1);}
fs.writeFileSync(F1+'.tmp',js1);fs.renameSync(F1+'.tmp',F1);fs.writeFileSync(F2,js2);
console.log('banque scindée : '+n1+' fiches ('+(o1/1e6).toFixed(2)+' Mo) + '+n2+' fiches ('+(o2/1e6).toFixed(2)+' Mo), preuve octet pour octet OK');
