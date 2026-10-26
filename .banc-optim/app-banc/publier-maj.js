#!/usr/bin/env node
/* CASH CAR — PUBLIER UNE MISE À JOUR EN DIRECT (2026-10-14, oui de Sacha).
   Les joueurs de l'app iPhone reçoivent la nouvelle version du JEU sans passer par l'App Store : au lancement, natif.js lit
   latest.json sur la branche `app-maj` du dépôt public (raw.githubusercontent.com), le module Capgo télécharge les seuls fichiers
   changés et la version s'applique au lancement suivant (voir natif/natif.js, partie 7).

   CE QUI PART, C'EST L'ÉDITION APP STORE : ce script passe par preparer-www.js (les mêmes coupes que l'app : pas de vrai argent,
   pas de mode TEST, pas de code, pas de marques…). Jamais le jeu web de main tel quel.
   CE QUI NE PEUT PAS PARTIR ainsi : tout ce qui touche l'app native (nouveau module Capacitor, icône, nom, autorisations) — il
   faut une vraie mise à jour App Store. Règle d'Apple : corriger, équilibrer, ajouter du contenu, oui ; changer la nature du
   jeu, ajouter des achats ou de la pub, non.

   node publier-maj.js                       prépare la mise à jour dans build/app-maj (la branche app-maj), commit LOCAL, rien d'envoyé
   node publier-maj.js --envoyer             pareil, puis git push origin app-maj : TOUS les iPhone la recevront.
                                             ⚠ seulement sur le OUI de Sacha, écrit dans la session, juste avant.
   node publier-maj.js --jeu "<dossier>"     le jeu d'un autre dossier VERSION PRINCIPALE (défaut : celui de cette branche)
   node publier-maj.js --natif-min 1.1.0     la version de l'app native qu'il faut au moins (défaut : celle du projet Xcode)
   node publier-maj.js --local <dossier> --maj http://localhost:8765/
                                             ESSAI : écrit latest.json et f/ dans un dossier à servir sur le Mac (simulateur),
                                             avec une app fabriquée par « node preparer-www.js --maj http://localhost:8765/ ».
   Le stockage : f/<sha256> = chaque fichier rangé par son empreinte (un fichier inchangé n'est jamais renvoyé), latest.json = la
   version, la version native minimale et la liste complète {f: chemin, h: empreinte}. */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{execFileSync}=require('child_process');
const ICI=__dirname, arg=(k,d)=>{const i=process.argv.indexOf(k);return i>=0?(process.argv[i+1]||''):d;}, a=k=>process.argv.includes(k);
const meurt=m=>{console.error('\n✗ publier-maj : '+m+'\n');process.exit(1);};
const MAJ_PROD='https://raw.githubusercontent.com/sachaberes-lgtm/CAR-CASH-GIT/app-maj/';
const SRC=path.resolve(arg('--jeu',path.join(ICI,'..','VERSION PRINCIPALE'))), LOCAL=arg('--local',null), MAJ=arg('--maj',MAJ_PROD);
const ENVOYER=a('--envoyer');
if(ENVOYER&&LOCAL)meurt('--envoyer et --local ensemble : choisir');
if(!LOCAL&&MAJ!==MAJ_PROD)meurt('--maj ne sert qu\'avec --local (un essai)');
let natifMin=arg('--natif-min',null);
if(!natifMin){const pbx=fs.readFileSync(path.join(ICI,'ios','App','App.xcodeproj','project.pbxproj'),'utf8').match(/MARKETING_VERSION = ([0-9.]+);/);
  natifMin=pbx?pbx[1]:meurt('MARKETING_VERSION introuvable dans le projet Xcode');}

// 1. l'édition App Store du jeu, fabriquée dans un dossier jetable
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'cashcar-maj-'));
process.on('exit',()=>{try{fs.rmSync(TMP,{recursive:true,force:true});}catch(e){}});
try{execFileSync(process.execPath,[path.join(ICI,'preparer-www.js'),'--essai',SRC,'--sortie',TMP,'--maj',MAJ],{stdio:['ignore','pipe','inherit']});}
catch(e){meurt('la fabrication de l\'édition App Store a échoué (voir plus haut)');}
const info=JSON.parse(fs.readFileSync(path.join(TMP,'maj.json'),'utf8'));

// 2. la destination : un dossier d'essai, ou la branche app-maj (worktree build/app-maj)
let DEST=LOCAL?path.resolve(LOCAL):path.join(ICI,'build','app-maj');
const git=(args,cwd)=>execFileSync('git',args,{cwd:cwd||ICI,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
if(!LOCAL&&!fs.existsSync(path.join(DEST,'.git'))){
  fs.mkdirSync(path.dirname(DEST),{recursive:true});
  let distante=false;try{git(['fetch','-q','origin','app-maj']);distante=true;}catch(e){}
  let locale=false;try{git(['rev-parse','--verify','-q','refs/heads/app-maj']);locale=true;}catch(e){}
  if(locale)git(['worktree','add','-q',DEST,'app-maj']);
  else if(distante)git(['worktree','add','-q','-b','app-maj',DEST,'origin/app-maj']);
  else git(['worktree','add','-q','--orphan','-b','app-maj',DEST]); // la toute première publication
}
if(!LOCAL){try{git(['pull','-q','--ff-only','origin','app-maj'],DEST);}catch(e){}}
fs.mkdirSync(path.join(DEST,'f'),{recursive:true});
const ancien=(()=>{try{return JSON.parse(fs.readFileSync(path.join(DEST,'latest.json'),'utf8'));}catch(e){return null;}})();
if(ancien&&ancien.version===info.version){
  if(ENVOYER&&!LOCAL){git(['push','-q','origin','app-maj'],DEST);console.log('✓ ENVOYÉE (déjà préparée) : '+info.version);process.exit(0);}
  meurt('rien à publier : la version '+info.version+' est déjà la dernière');}

// 3. chaque fichier rangé par son empreinte ; seuls les nouveaux s'ajoutent
const manifeste=[];let nNeufs=0,oNeufs=0,oTotal=0;
const tous=d=>{for(const n of fs.readdirSync(d).sort()){const p=path.join(d,n);if(fs.statSync(p).isDirectory()){tous(p);continue;}
  const b=fs.readFileSync(p),h=crypto.createHash('sha256').update(b).digest('hex'),rel=path.relative(TMP,p).split(path.sep).join('/');
  manifeste.push({f:rel,h});oTotal+=b.length;
  const cible=path.join(DEST,'f',h);if(!fs.existsSync(cible)){fs.writeFileSync(cible,b);nNeufs++;oNeufs+=b.length;}}};
tous(TMP);
if(!manifeste.some(e=>e.f==='index.html'))meurt('pas d\'index.html dans l\'édition fabriquée');
const der={version:info.version,jeu:info.jeu,natifMin,date:new Date().toISOString(),fichiers:manifeste.length,octets:oTotal,manifest:manifeste};
fs.writeFileSync(path.join(DEST,'latest.json'),JSON.stringify(der)+'\n');
const Mo=o=>(o/1048576).toFixed(1)+' Mo';
console.log('✓ mise à jour '+info.version+' (jeu '+info.jeu+', app native ≥ '+natifMin+') : '+manifeste.length+' fichiers, '+Mo(oTotal)+
  ' — à télécharger par un joueur à jour de la précédente : '+nNeufs+' fichier(s), '+Mo(oNeufs)+(ancien?' (avant : '+ancien.version+')':' (première publication)'));
if(LOCAL){console.log('  essai écrit dans '+DEST+' — à servir : python3 -m http.server 8765 --directory "'+DEST+'"');process.exit(0);}

// 4. le commit sur app-maj, et l'envoi seulement sur demande
git(['add','-A'],DEST);
try{git(['commit','-q','-m','Mise à jour en direct '+info.version+' (jeu '+info.jeu+', app native ≥ '+natifMin+')'],DEST);}catch(e){meurt('commit impossible : '+(e.stderr||e.message));}
if(!ENVOYER){console.log('  commit local sur app-maj ('+DEST+'). RIEN n\'est envoyé : node publier-maj.js --envoyer, sur le oui de Sacha.');process.exit(0);}
git(['push','-q','origin','app-maj'],DEST);
console.log('✓ ENVOYÉE : les iPhone la prendront à leur prochain lancement (lecture de '+MAJ_PROD+'latest.json, cache de GitHub : ~5 min).');
