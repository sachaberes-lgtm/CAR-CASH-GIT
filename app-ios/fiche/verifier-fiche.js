#!/usr/bin/env node
/* CASH CAR — vérifie les longueurs des textes de FICHE-APP-STORE.md contre les limites d'App Store Connect.
   Chaque texte est entre  <!-- clé -->  et  <!-- /clé -->  ; la clé commence par le nom du champ (nom, sous-titre, promo…). */
'use strict';
const fs=require('fs'),path=require('path');
const LIM={'nom':30,'sous-titre':30,'promo':170,'description':4000,'mots-cles':100,'nouveautes':4000,'notes-revue':4000};
const t=fs.readFileSync(path.join(__dirname,'FICHE-APP-STORE.md'),'utf8');
let faute=0,n=0;const re=/<!-- ([a-z-]+) -->\n([\s\S]*?)\n<!-- \/\1 -->/g;let m;
while((m=re.exec(t))){const cle=m[1],champ=Object.keys(LIM).filter(k=>cle===k||cle.indexOf(k+'-')===0).sort((a,b)=>b.length-a.length)[0];
  if(!champ){console.log('  ? '+cle+' : champ inconnu');faute++;continue;}
  const L=[...m[2]].length,ok=L<=LIM[champ];n++;if(!ok)faute++;
  console.log((ok?'  ✓ ':'  ✗ ')+cle.padEnd(16)+String(L).padStart(5)+' / '+LIM[champ]+(ok?'':'   TROP LONG de '+(L-LIM[champ])));}
if(!n){console.error('✗ aucun texte trouvé');process.exit(1);}
console.log(faute?'✗ '+faute+' texte(s) à raccourcir':'✓ '+n+' textes dans les limites d\'Apple');process.exit(faute?1:0);
