#!/usr/bin/env node
/* ===== VITESSE : COMBIEN COUTE LA COMPILATION DU JEU, ET CE QU'UN CACHE DE CODE V8 EN GARDERAIT (2026-11-27, etude « vitesse ») =====
   AUCUNE COURSE, AUCUNE EXECUTION DU JEU : on lit VERSION PRINCIPALE/index.html comme ml/reel/sim-env-reel.js loadGame (le bloc <script> principal,
   celui qui contient survTick et buildTrack), et on le COMPILE seulement (new vm.Script), sans le lancer :
     1. compilation a froid (ce que chaque processus neuf paie aujourd'hui pour l'analyse du texte de premier niveau) ;
     2. production des donnees de cache (createCachedData) ;
     3. compilation avec ces donnees (ce qu'un processus paierait avec un cache de code sur le disque) : cachedDataRejected doit etre faux.
   Limite : V8 compile les fonctions paresseusement, a leur premier appel ; ce cache-ci, fait sans executer, ne garde que le premier niveau.
   Un cache fait APRES une course (createCachedData apres execution) garderait aussi les fonctions appelees : son gain n'est pas mesure ici.
   Aussi la lecture du fichier (13 Mo) et l'extraction des blocs (la regex), mesurees a part. Trois repetitions, la mediane.
   Usage : node compilation.js */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const RACINE=path.join(__dirname,'..','..','..','..','..');
const ms=h=>Number(process.hrtime.bigint()-h)/1e6;
const med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
const R={lecture:[],blocs:[],froid:[],production:[],chaud:[],rejete:[]};
let code=null,donnees=null;
for(let k=0;k<3;k++){
  let h=process.hrtime.bigint();const html=fs.readFileSync(path.join(RACINE,'VERSION PRINCIPALE','index.html'),'utf8');R.lecture.push(ms(h));
  h=process.hrtime.bigint();const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);code=blocks.find(b=>b.includes('survTick')&&b.includes('buildTrack'));R.blocs.push(ms(h));
  /* un nom de fichier different a chaque tour : V8 garde un cache en memoire par source ; on veut la compilation a froid */
  h=process.hrtime.bigint();const s=new vm.Script(code+'\n/*'+k+'*/',{filename:'index-'+k+'.html'});R.froid.push(ms(h));
  h=process.hrtime.bigint();donnees=s.createCachedData();R.production.push(ms(h));
}
for(let k=0;k<3;k++){
  /* le meme texte que celui du cache (k = 2), dans un nouveau contexte de compilation */
  const h=process.hrtime.bigint();const s2=new vm.Script(code+'\n/*2*/',{filename:'index-2.html',cachedData:donnees});R.chaud.push(ms(h));R.rejete.push(s2.cachedDataRejected);
}
const out={taille_code_Mo:+(code.length/1048576).toFixed(2),cache_Mo:+(donnees.length/1048576).toFixed(2),
  lecture_ms:Math.round(med(R.lecture)),extraction_blocs_ms:Math.round(med(R.blocs)),compilation_froid_ms:Math.round(med(R.froid)),
  production_cache_ms:Math.round(med(R.production)),compilation_avec_cache_ms:Math.round(med(R.chaud)),cache_rejete:R.rejete,brut:R};
fs.writeFileSync(path.join(__dirname,'profils','compilation.json'),JSON.stringify(out,null,1)+'\n');
process.stdout.write(JSON.stringify(out,null,1)+'\n');
