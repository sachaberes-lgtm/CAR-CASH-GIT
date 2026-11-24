#!/usr/bin/env node
/* LA FORÊT HORS DE LA COPIE PUBLIÉE (2026-11-24) : la forêt a quitté main (ni carte dans SF_CARTES ni fichier de map), mais ses 19 sons (~1,2 Mo de base64)
   et ses 6 cartes postales (assets/portail/foret-*.webp) partaient encore en ligne. Même retrait que l'app (app-ios/preparer-www.js, « LA FORÊT A QUITTÉ MAIN »),
   sur la COPIE publiée seulement, AVANT scinde-banque. Les fiches (m) restent : le décodeur se tait sur un son sans données. Si la forêt est revenue dans
   SF_CARTES, rien n'est retiré. Au moindre doute, la banque reste telle quelle.
   usage : node outils/retire-foret.cjs <dossier publié> */
'use strict';
const fs=require('fs'),path=require('path');
const dos=process.argv[2];if(!dos){console.error('usage : retire-foret.cjs <dossier>');process.exit(2);}
const ix=fs.readFileSync(path.join(dos,'index.html'),'utf8'),i9=ix.indexOf('const SF_CARTES={'),j9=ix.indexOf('\n};',i9);
if(i9<0||j9<0){console.log('forêt : SF_CARTES introuvable, rien n\'est retiré');process.exit(0);}
if(/\n {2}foret\s*:\s*\{/.test(ix.slice(i9,j9))){console.log('forêt : elle est revenue dans SF_CARTES, rien n\'est retiré');process.exit(0);}
let nf=0,np=0,of=0;const FB=path.join(dos,'sons-banque.js');
if(fs.existsSync(FB)){const src=fs.readFileSync(FB,'utf8'),w={};new Function('window',src)(w);const B=w.CCSON_BANQUE,ent=src.indexOf('window.CCSON_BANQUE=');
  if(B&&B.m&&B.d&&!B.partiel&&ent>=0){const n0=Object.keys(B.d).length,m0=JSON.stringify(B.m);
    for(const k of Object.keys(B.d))if(/^foret\./.test(k)){of+=(B.d[k]||'').length;delete B.d[k];nf++;}
    if(nf){const js=src.slice(0,ent)+'window.CCSON_BANQUE='+JSON.stringify(B)+';\n',w2={};new Function('window',js)(w2);const B2=w2.CCSON_BANQUE;
      if(!B2||Object.keys(B2.d).length!==n0-nf||JSON.stringify(B2.m)!==m0||Object.keys(B2.d).some(k=>B2.d[k]!==B.d[k])){console.error('⚠ retire-forêt : la relecture échoue, la banque reste entière');process.exit(1);}
      fs.writeFileSync(FB+'.tmp',js);fs.renameSync(FB+'.tmp',FB);}}}
const PD=path.join(dos,'assets','portail');
if(fs.existsSync(PD))for(const x of fs.readdirSync(PD))if(/^foret-.*\.webp$/.test(x)){of+=fs.statSync(path.join(PD,x)).size;fs.rmSync(path.join(PD,x));np++;}
console.log('forêt retirée : '+nf+' données de sons, '+np+' cartes postales ('+(of/1048576).toFixed(2)+' Mo)');
