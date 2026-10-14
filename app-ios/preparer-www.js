#!/usr/bin/env node
/* CAR CASH — FABRIQUE www/ (le jeu que l'app iOS embarque) À PARTIR DE « VERSION PRINCIPALE/ ».
   On ne modifie JAMAIS www/ à la main : on retouche le jeu dans VERSION PRINCIPALE/, puis
       cd app-ios && npm run sync        (= ce script + npx cap sync ios)
   Ce qui part dans l'app : la page du jeu, ses scripts, vendor/ (Three.js r128 et son post-traitement), assets/ (sons,
   musiques, police Press Start 2P, icônes), le manifeste. Ce qui reste dehors (comme sur Vercel, vercel-build.sh) : les
   notes (CLAUDE.md, README), les outils de travail (atelier du son, maps-ciel, simulateur, salle blanche, boîtes, atelier des
   nuages), tout script Python, et sw.js (pas de service worker dans l'app).
   Trois retouches de la page, chacune vérifiée (le script REFUSE si le texte attendu n'est pas trouvé une fois exactement) :
   1. natif.js chargé en TOUT PREMIER (juste après <meta charset>) ;
   2. la version gravée (le jeton __CC_BUILD__ → le commit du jeu) : RÉGLAGES affiche « VERSION xxxxxxx » au lieu de « LOCALE » ;
   3. les adresses des kits des portails (Poki, CrazyGames, Playgama) vidées : code mort dans l'app (l'édition des portails ne
      s'allume qu'avec ?poki=1 dans l'adresse, impossible ici), et plus aucune adresse réseau dans ce qu'on embarque.
   Puis l'inventaire : aucune adresse http(s) ne doit rester dans www/ (hors espaces de noms XML du W3C, qui ne se chargent pas). */
'use strict';
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const ICI=__dirname, SRC=path.join(ICI,'..','VERSION PRINCIPALE'), WWW=path.join(ICI,'www');
const meurt=m=>{console.error('\n✗ preparer-www : '+m+'\n');process.exit(1);};
if(!fs.existsSync(path.join(SRC,'index.html')))meurt('VERSION PRINCIPALE/index.html introuvable');

const GARDE=['index.html','sfx.js','sons-banque.js','manifest.webmanifest','vendor','assets'];
const JAMAIS=/\.py$|^\.DS_Store$|^Thumbs\.db$/;
fs.rmSync(WWW,{recursive:true,force:true});fs.mkdirSync(WWW,{recursive:true});
let nFic=0,nOct=0;
const copie=(a,b)=>{const s=fs.statSync(a);
  if(s.isDirectory()){fs.mkdirSync(b,{recursive:true});for(const n of fs.readdirSync(a))if(!JAMAIS.test(n))copie(path.join(a,n),path.join(b,n));}
  else{fs.copyFileSync(a,b);nFic++;nOct+=s.size;}};
for(const n of GARDE){const a=path.join(SRC,n);if(!fs.existsSync(a))meurt('manque '+n+' dans VERSION PRINCIPALE');copie(a,path.join(WWW,n));}
// l'icône du web : le mot-symbole pixel CASH CAR (icon.svg du jeu = l'émoji 💰 d'Apple, une image protégée : refus App Store)
fs.copyFileSync(path.join(ICI,'ressources','icon.svg'),path.join(WWW,'icon.svg'));nFic++;
fs.copyFileSync(path.join(ICI,'natif','natif.js'),path.join(WWW,'natif.js'));nFic++;

// ---- les retouches de la page ----
let h=fs.readFileSync(path.join(WWW,'index.html'),'utf8');
const une=(de,vers,quoi)=>{const n=h.split(de).length-1;if(n!==1)meurt(quoi+' : « '+de+' » trouvé '+n+' fois (1 attendu)');h=h.replace(de,()=>vers);};
une('<meta charset="UTF-8">','<meta charset="UTF-8">\n<script src="natif.js"></script>','natif.js');
let ver='ios';try{ver=execSync('git log -1 --format=%h -- "VERSION PRINCIPALE"',{cwd:path.join(ICI,'..')}).toString().trim()||ver;}catch(e){}
une("const CC_BUILD='__CC_BUILD__';","const CC_BUILD='"+ver+"';",'version');
for(const u of['https://game-cdn.poki.com/scripts/v2/poki-sdk.js','https://sdk.crazygames.com/crazygames-sdk-v3.js','https://bridge.playgama.com/v2/stable/playgama-bridge.js'])
  une("src:'"+u+"'","src:''",'kit de portail');
/* L'ÉDITION APP STORE (2026-10-13, Sacha : « couper dans l'app seulement ») — le jeu web de main n'est pas touché.
   · plus de mode TEST : les caisses et la carrière se GAGNENT (Apple refuse une version de test) ;
   · plus de vrai argent (pas d'achats intégrés pour l'instant) : les caisses vendues en € et L'ÉTERNELLE (100 pubs : l'app n'a pas
     de pubs) passent À L'ARGENT DU JEU, au prix que l'édition POKI leur donne déjà ; la page OFFRES (en €) et ses portes disparaissent. */
une("const TEST_CAISSES=!POKI;","const TEST_CAISSES=false; /* (app iOS) */",'mode TEST des caisses');
une("const TEST_CARRIERE=true;","const TEST_CARRIERE=false; /* (app iOS) */",'mode TEST de la carrière');
une("if(POKI){const PRIX_CARNET=",
  "/* (app iOS) le vrai argent passe à l'argent du jeu */CAR_UNLOCK.forEach(function(u,i){if(!u||(u.k!=='premium'&&u.k!=='pubs'))return;const c=CARS[i];"+
  "const e=u.k==='pubs'?9.99:(parseFloat(String(u.eur).replace(',','.'))||5);CAR_UNLOCK[i]={p:Math.round((2e6+e*450e3)/1e5)*1e5};if(c){c.rar='legendaire';}});\n"+
  "if(POKI){const PRIX_CARNET=",'caisses en €');
une('</head>','<style id="appStore">/* (app iOS) pas de page OFFRES en € : ni l\'écran, ni ses portes (mêmes sélecteurs que l\'édition POKI ; les deux :not(#…) passent devant\n'+
  '   la règle de l\'accueil v2 qui réaffiche la tuile OFFRES) */\n'+
  'html:not(#ccA):not(#ccB) :is([data-m="shop"],[data-go="shop"],.gBoutique,#mShop,#bdShop){display:none!important}\n'+
  '/* la BOUTIQUE du garage : plus aucune caisse en €, son onglet OFFRES resterait vide (« OFFRES 0 ») */\n'+
  '#gBqPan .bqOng button[data-o="off"]{display:none!important}</style>\n</head>','page OFFRES');
fs.writeFileSync(path.join(WWW,'index.html'),h);

// ---- l'inventaire : plus aucune adresse réseau ----
const TEXTE=/\.(html|js|mjs|css|json|webmanifest|svg|txt)$/i, W3C=/^https?:\/\/www\.w3\.org\//;
// (une adresse dans un COMMENTAIRE de licence ne se charge pas : elle est tolérée, et listée)
const trouve=[],notes=[];
const fouille=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n),s=fs.statSync(p);
  if(s.isDirectory()){fouille(p);continue;}if(!TEXTE.test(n))continue;
  const t=fs.readFileSync(p,'utf8'),re=/https?:\/\/[^\s"'`)<>\\]+|=\s*["']\/\/[a-z0-9-]+\.[^\s"']+/gi;let m;
  while((m=re.exec(t))){const u=m[0];if(W3C.test(u))continue;
    const ligne=t.slice(t.lastIndexOf('\n',m.index)+1,m.index);
    const inerte=/\.txt$/i.test(n)||/^\s*(\*|\/\/|\/\*|<!--)/.test(ligne)||/(^|[\s;,(){}])\/\/\s/.test(ligne); // texte de licence, ou commentaire
    (inerte?notes:trouve).push(path.relative(WWW,p)+' : '+u);}}};
fouille(WWW);
if(trouve.length)meurt('adresses réseau restantes dans www/ :\n  '+trouve.join('\n  '));
if(notes.length)console.log('  (adresses en commentaire, jamais chargées : '+notes.length+')\n    '+notes.join('\n    '));
console.log('✓ www/ prêt : '+nFic+' fichiers, '+(nOct/1048576).toFixed(1)+' Mo · jeu '+ver+' · natif.js en tête · 0 adresse réseau');
