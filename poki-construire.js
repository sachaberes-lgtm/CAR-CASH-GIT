/* L'ÉDITION POKI DE CASH CAR — `node poki-construire.js` depuis la racine du dépôt (2026-10-04, Sacha : « créer une version de Cash Car
   pour Poki en enlevant les missions et la carrière »).
   « VERSION PRINCIPALE » reste la SEULE qu'on modifie. Ce script en tire `POKI/` (le dossier à envoyer sur Poki) et `POKI.zip` (le même,
   compressé, `index.html` à la racine — c'est ce que la page « Upload » de Poki for Developers attend). Les deux sont ignorés par git :
   on les REFAIT, on ne les édite jamais (une copie gardée dans le dépôt vieillirait en silence derrière la version principale).
   Ce qu'il fait :
     · recopie le jeu SANS les notes et les outils (CLAUDE.md, README.md, JOUER.bat, l'atelier de son, le banc des sons, l'atelier des
       nuages), sans le service worker (Poki sert ses fichiers lui-même), sans les dix musiques de la CARRIÈRE (ciel-n1 à n5 et ville-n1
       à n5 : seuls les niveaux de la carrière les jouent — 24 Mo de moins) et sans AUCUNE VOIX (2026-10-05, Sacha : « enlève toutes les
       voix de cette version ») : ni l'annonceur, ni le « ewww » des morts, ni le « WOW » des combos — le jeu ne les demande plus en POKI ;
     · bascule la seule ligne qui diffère, `const POKI_BUILD=false;` → true (le jeu fait le reste : voir « L'ÉDITION POKI » dans le
       <head> de index.html) ; refuse de continuer si la ligne n'est pas là exactement une fois ;
     · grave le numéro de version (le commit de VERSION PRINCIPALE) : les RÉGLAGES affichent « VERSION xxxxxxx · POKI » ;
     · compresse (Windows : le tar.exe du système sait faire un .zip). `--sans-zip` : le dossier seulement.
   UNE ÉDITION PAR PORTAIL (2026-10-05) — la même édition, seul le KIT change (`const PORTAIL_SDK='poki';` du <head>) :
     · `node poki-construire.js`       → `POKI/`  + `POKI.zip`  : le kit de Poki ;
     · `node poki-construire.js crazy` → `CRAZY/` + `CRAZY.zip` : le kit de CrazyGames (SDK v3), et SANS MODE FACILE (Sacha) ;
     · `node poki-construire.js itch`  → `ITCH/`  + `ITCH.zip`  : aucun kit, aucune pub (itch.io, un site à soi…). */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ED=process.argv.includes('itch')?'itch':process.argv.includes('crazy')?'crazy':'poki';
const NOM={poki:'POKI',crazy:'CRAZY',itch:'ITCH'}[ED],SDK={poki:'poki',crazy:'crazy',itch:''}[ED];
const OU={poki:'Poki for Developers',crazy:'CrazyGames (developer.crazygames.com, type HTML5)',itch:'itch.io (Kind of project : HTML)'}[ED];
const SRC=path.join(__dirname,'VERSION PRINCIPALE'),DST=path.join(__dirname,NOM),ZIP=path.join(__dirname,NOM+'.zip');
const SAUTE=new Set(['CLAUDE.md','README.md','JOUER.bat','sw.js','sons.html','atelier-son','atelier-nuages.js']); // à la racine du jeu
const SAUTE_REL=new Set([1,2,3,4,5].map(k=>'assets/audio/music/ciel/ciel-n'+k+'.m4a') // la musique des niveaux 1 à 5 de la CARRIÈRE (nuages…
  .concat([1,2,3,4,5].map(k=>'assets/audio/music/ville/ville-n'+k+'.m4a'))                // …et ville)
  .concat(['assets/audio/announcer','assets/audio/death/eww.m4a','assets/audio/fx/wow.mp3'])); // les VOIX (dossier entier pour l'annonceur)
function copie(de,vers,rel){
  fs.mkdirSync(vers,{recursive:true});
  for(const n of fs.readdirSync(de)){
    const r=rel?rel+'/'+n:n,a=path.join(de,n),b=path.join(vers,n);
    if((!rel&&SAUTE.has(n))||SAUTE_REL.has(r))continue;
    if(fs.statSync(a).isDirectory())copie(a,b,r);else fs.copyFileSync(a,b);
  }
}
fs.rmSync(DST,{recursive:true,force:true});
copie(SRC,DST,'');
const f=path.join(DST,'index.html');let s=fs.readFileSync(f,'utf8');
const n=(s.match(/const POKI_BUILD=false;/g)||[]).length;
if(n!==1){console.error('✗ ligne POKI_BUILD introuvable ('+n+' occurrence) — rien n\'a été basculé');process.exit(1);}
s=s.replace('const POKI_BUILD=false;','const POKI_BUILD=true;');
{const k=(s.match(/const PORTAIL_SDK='poki';/g)||[]).length;
  if(k!==1){console.error('✗ ligne PORTAIL_SDK introuvable ('+k+' occurrence) — l\'édition '+NOM+' porterait le mauvais kit');process.exit(1);}
  s=s.replace("const PORTAIL_SDK='poki';","const PORTAIL_SDK='"+SDK+"';");}
let ver='';try{ver=cp.execFileSync('git',['log','-1','--format=%h','--','VERSION PRINCIPALE'],{cwd:__dirname}).toString().trim();}catch(e){}
if(ver)s=s.replace("const CC_BUILD='__CC_BUILD__';","const CC_BUILD='"+ver+"';");
fs.writeFileSync(f,s);
let o=0,nb=0;(function taille(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n),t=fs.statSync(p);if(t.isDirectory())taille(p);else{o+=t.size;nb++;}}})(DST);
console.log('✓ '+NOM+'/ régénéré depuis VERSION PRINCIPALE'+(ver?' ('+ver+')':'')+' — '+nb+' fichiers, '+(o/1048576).toFixed(1)+' Mo');
if(process.argv.includes('--sans-zip'))process.exit(0);
fs.rmSync(ZIP,{force:true});
const tar=process.platform==='win32'?path.join(process.env.SystemRoot||'C:\\Windows','System32','tar.exe'):'zip';
try{
  if(process.platform==='win32')cp.execFileSync(tar,['-a','-c','-f',ZIP].concat(fs.readdirSync(DST)),{cwd:DST,stdio:'inherit'});
  else cp.execFileSync('zip',['-r','-q',ZIP].concat(fs.readdirSync(DST)),{cwd:DST,stdio:'inherit'});
  console.log('✓ '+NOM+'.zip — '+(fs.statSync(ZIP).size/1048576).toFixed(1)+' Mo, à envoyer sur '+OU);
}catch(e){console.error('✗ compression impossible ('+e.message+') : zipper le CONTENU de '+NOM+'/ à la main (index.html à la racine du zip)');process.exit(1);}
