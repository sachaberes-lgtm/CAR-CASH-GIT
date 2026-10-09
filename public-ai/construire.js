/* CASH CAR — ÉDITION DÉMO PUBLIC AI : `node public-ai/construire.js [dossier] [--zip]` depuis la racine du dépôt.
   (2026-10-09, Sacha : « une version allégée sans boutique, avec juste marqué "édition démo Public AI", avec le code de la dernière version »)
   C'est l'ÉDITION DES PORTAILS sans kit (celle d'itch.io : ni boutique, ni missions, ni carrière, ni voix, ni pub) tirée de
   VERSION PRINCIPALE par `poki-construire.js itch`, plus quelques retouches :
     · la mention « EDITION DEMO PUBLIC AI » sous le logo (écran titre et accueil ; la police pixel n'a pas de capitales accentuées),
     · le titre de l'onglet et le numéro de version (« VERSION xxxxxxx · DEMO PUBLIC AI » dans les réglages),
     · le mode SURVIVANT armé : chaque JOUER est une course Survivant (sauf l'auto-école de la toute première partie),
     · tant que le morceau de la FRÉNÉSIE n'est pas livré, le jeu ne le demande plus (plus de 404 en console),
     · /public-ai sans barre finale redirigé vers /public-ai/ (sinon vendor/ et assets/ se chargeraient depuis la racine du site).
   Rien de tout ça n'est gardé dans git (une copie vieillirait derrière la version principale) : Vercel la refait à chaque mise en
   ligne (vercel-build.sh), et en local elle sort dans public-ai/jeu/ (+ public-ai/CASH-CAR-demo-public-ai.zip avec --zip), avec les
   deux lanceurs de public-ai/lanceurs/. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const RACINE=path.join(__dirname,'..');
const DST=path.resolve(RACINE,process.argv.slice(2).find(a=>!a.startsWith('--'))||path.join('public-ai','jeu'));
const ZIP=path.join(__dirname,'CASH-CAR-demo-public-ai.zip');
const meurt=m=>{console.error('✗ '+m);process.exit(1);};

// 1) l'édition des portails sans kit, refaite depuis VERSION PRINCIPALE
cp.execFileSync(process.execPath,[path.join(RACINE,'poki-construire.js'),'itch','--sans-zip'],{cwd:RACINE,stdio:'inherit'});
const SRC=path.join(RACINE,'ITCH');
if(!fs.existsSync(path.join(SRC,'index.html')))meurt('ITCH/index.html introuvable après poki-construire.js');

// 2) recopie vers la destination
fs.rmSync(DST,{recursive:true,force:true});
(function copie(de,vers){fs.mkdirSync(vers,{recursive:true});
  for(const n of fs.readdirSync(de)){const a=path.join(de,n),b=path.join(vers,n);
    if(fs.statSync(a).isDirectory())copie(a,b);else fs.copyFileSync(a,b);}})(SRC,DST);
for(const n of fs.readdirSync(path.join(__dirname,'lanceurs')).filter(n=>/^LANCER\./.test(n)))fs.copyFileSync(path.join(__dirname,'lanceurs',n),path.join(DST,n));

// 3) les retouches de l'édition démo (chacune doit trouver son ancre exactement une fois, sinon on s'arrête)
const f=path.join(DST,'index.html');let s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'); // fins de ligne LF : les ancres ci-dessous en dépendent
const une=(ancre,par,nom)=>{const k=s.split(ancre).length-1;if(k!==1)meurt(nom+' : ancre trouvée '+k+' fois');s=s.replace(ancre,par);};
const RUBAN='<div class="paiEd" aria-label="Édition démo Public AI">EDITION DEMO PUBLIC AI</div>';
une('<title>CASH CAR</title>','<title>CASH CAR — Édition démo Public AI</title>','titre');
une('<head>\n<meta charset="UTF-8">\n','<head>\n<meta charset="UTF-8">\n<script>/* (édition démo Public AI) /public-ai sans barre finale : on la rajoute */if(/^https?:/.test(location.protocol)&&!/(\\/|\\.html?)$/.test(location.pathname))location.replace(location.pathname+"/"+location.search+location.hash);</script>\n','redirection');
une('<div id="spTitle" class="tease"><span class="lg gold" data-t="CASH">CASH</span><span class="lg grad" data-t="CAR">CAR</span></div>',
    '<div id="spTitle" class="tease"><span class="lg gold" data-t="CASH">CASH</span><span class="lg grad" data-t="CAR">CAR</span></div>'+RUBAN,'écran titre');
une('<div class="mTitle"><span class="lg gold" data-t="CASH">CASH</span><span class="lg grad" data-t="CAR">CAR</span></div>',
    '<div class="mTitle"><span class="lg gold" data-t="CASH">CASH</span><span class="lg grad" data-t="CAR">CAR</span></div>'+RUBAN,'accueil');
une("[PORTAIL]||'WEB')","[PORTAIL]||'DEMO PUBLIC AI')",'numéro de version');
// LE SURVIVANT (Sacha : « je veux le mode survivant ») : il existe dans la dernière version mais plus aucun bouton n'y mène — l'édition
// démo l'ARME dès le départ : chaque JOUER est une course Survivant (les 7 policiers, le dernier de chaque minute explose).
une('const SURV={armed:false,','const SURV={armed:true,','Survivant armé');
// …mais pas pendant l'AUTO-ÉCOLE de la toute première partie : c'est une leçon où l'on ne peut pas mourir, le couperet de la minute n'y a pas sa place
une('SURV.on=(ch9||campMeute()||(SURV.armed&&!campN()))&&!PARK.on;','SURV.on=(ch9||campMeute()||(SURV.armed&&!campN()&&!TUTO.on))&&!PARK.on;','Survivant hors auto-école');
// le morceau de la FRÉNÉSIE n'est pas encore livré dans VERSION PRINCIPALE : le jeu le DEMANDAIT quand même (une 404 rouge en console).
// Chemin vide = le jeu ne le cherche pas et prend son repli prévu (la radio s'emballe). Dès que le fichier existe, il est gardé tel quel.
{const fren="f:'assets/audio/music/dark-triad.mp3'";
 if(s.includes(fren)&&!fs.existsSync(path.join(DST,'assets','audio','music','dark-triad.mp3')))une(fren,"f:''",'musique de la frénésie');}
une('</head>','<style id="paiEdCss">/* (édition démo Public AI) la mention, plaque à coins coupés comme le reste de l\'interface */\n'+
  '.paiEd{display:block;width:max-content;margin:12px auto 0;padding:9px 14px;font-family:var(--pix);font-size:9px;line-height:1;letter-spacing:3px;'+
  'color:#ffd75e;background:#14100a;clip-path:polygon(6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px),0 6px);'+
  'box-shadow:inset 0 0 0 1px rgba(255,215,94,.5);text-shadow:none;pointer-events:none}\n'+
  '#spStage .paiEd{position:relative;z-index:2}\n</style>\n</head>','style');
fs.writeFileSync(f,s);

let o=0,nb=0;(function taille(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n),t=fs.statSync(p);if(t.isDirectory())taille(p);else{o+=t.size;nb++;}}})(DST);
console.log('✓ édition démo Public AI dans '+path.relative(RACINE,DST)+' — '+nb+' fichiers, '+(o/1048576).toFixed(1)+' Mo');
if(!process.argv.includes('--zip'))process.exit(0);
fs.rmSync(ZIP,{force:true});
if(process.platform==='win32')cp.execFileSync(path.join(process.env.SystemRoot||'C:\\Windows','System32','tar.exe'),['-a','-c','-f',ZIP].concat(fs.readdirSync(DST)),{cwd:DST,stdio:'inherit'});
else cp.execFileSync('zip',['-r','-q',ZIP].concat(fs.readdirSync(DST)),{cwd:DST,stdio:'inherit'});
console.log('✓ '+path.relative(RACINE,ZIP)+' — '+(fs.statSync(ZIP).size/1048576).toFixed(1)+' Mo');
