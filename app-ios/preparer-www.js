#!/usr/bin/env node
/* CASH CAR — FABRIQUE www/ (le jeu que l'app iOS embarque) À PARTIR DE « VERSION PRINCIPALE/ ».
   On ne modifie JAMAIS www/ à la main : on retouche le jeu dans VERSION PRINCIPALE/, puis
       cd app-ios && npm run sync        (= ce script + npx cap sync ios)
   Ce qui part dans l'app : la page du jeu, ses scripts, vendor/ (Three.js r128 et son post-traitement), assets/ (sons,
   musiques, police Press Start 2P, icônes), le manifeste. Ce qui reste dehors (comme sur Vercel, vercel-build.sh) : les
   notes (CLAUDE.md, README), les outils de travail (atelier du son, maps-ciel, simulateur, salle blanche, boîtes, atelier des
   nuages), tout script Python, et sw.js (pas de service worker dans l'app).
   (2026-11-07, achats App Store) LA BOUTIQUE EN € EST DE RETOUR DANS L'APP : plus aucune coupe ne transforme le vrai argent en argent du jeu
   (caisses premium, peintures à prix, page OFFRES / ACHAT et ses portes) ; elle passe par StoreKit, via le pont window.ccAchat (natif/achats.js,
   copié et chargé juste après natif.js) que la fabrication pose à côté du jeu. Le drapeau ACHAT_EUR du jeu (icones-fenetre.js) allume la page
   dès que ce pont existe et la garde cachée sans lui. Les coupes qui RESTENT : mode TEST, ENTRER UN CODE (code cousin), plus de pub (ni texte
   ni maison), plus de « BIENTÔT », noms de marques, ancien panneau RÉGLAGES, adresses réseau.
   Trois retouches de la page, chacune vérifiée (le script REFUSE si le texte attendu n'est pas trouvé une fois exactement) :
   1. natif.js chargé en TOUT PREMIER (juste après <meta charset>) ;
   2. la version gravée (le jeton __CC_BUILD__ → le commit du jeu) : RÉGLAGES affiche « VERSION xxxxxxx » au lieu de « LOCALE » ;
   3. les adresses des kits des portails (Poki, CrazyGames, Playgama) vidées : code mort dans l'app (l'édition des portails ne
      s'allume qu'avec ?poki=1 dans l'adresse, impossible ici), et plus aucune adresse réseau dans ce qu'on embarque.
   Puis l'inventaire : aucune adresse http(s) ne doit rester dans www/ (hors espaces de noms XML du W3C, qui ne se chargent pas). */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{execSync,execFileSync}=require('child_process');
/* L'ESSAI À BLANC :  node preparer-www.js --essai "<un autre dossier VERSION PRINCIPALE>"   (npm run essai -- "<dossier>")
   Joue TOUTE la fabrication (copie, retouches, inventaire) sur le jeu d'une autre branche, dans un dossier jetable : www/ n'est pas
   touché. Sert à savoir, AVANT de fusionner, si les retouches trouvent encore leurs cibles dans un jeu qui a bougé. */
/* (2026-11-05, Opus) sans dossier après --essai (ou suivi d'une autre option), l'essai porte sur le VERSION PRINCIPALE de ce dépôt (vercel-build.sh) */
const iE=process.argv.indexOf('--essai'), aE=process.argv[iE+1], ESSAI=iE>=0?path.resolve(aE&&!/^--/.test(aE)?aE:path.join(__dirname,'..','VERSION PRINCIPALE')):null;
//   … --sortie "<dossier>" : l'essai est GARDÉ dans ce dossier (pour le regarder au navigateur) au lieu d'être effacé.
const iS=process.argv.indexOf('--sortie'), SORTIE=ESSAI&&iS>=0?path.resolve(process.argv[iS+1]||''):null;
/* LES MISES À JOUR EN DIRECT (2026-10-14) : natif.js lit latest.json à cette adresse (la branche `app-maj` du dépôt public, voir
   publier-maj.js). C'est la SEULE adresse réseau permise dans www/, et seulement dans natif.js.
   … --maj "<adresse>" : un ESSAI qui la remplace (ex. http://localhost:8765/ pour le simulateur, servi par le Mac). */
const MAJ_PROD='https://raw.githubusercontent.com/sachaberes-lgtm/CAR-CASH-GIT/app-maj/';
const iM=process.argv.indexOf('--maj'), MAJ=iM>=0?(process.argv[iM+1]||''):MAJ_PROD;
if(!/^https?:\/\/.+\/$/.test(MAJ)){console.error('✗ --maj : une adresse http(s) qui finit par /');process.exit(1);}
const ICI=__dirname, SRC=ESSAI||path.join(ICI,'..','VERSION PRINCIPALE'), WWW=SORTIE||(ESSAI?fs.mkdtempSync(path.join(os.tmpdir(),'cashcar-essai-')):path.join(ICI,'www'));
if(ESSAI&&!SORTIE)process.on('exit',()=>{try{fs.rmSync(WWW,{recursive:true,force:true});}catch(e){}});
const meurt=m=>{console.error('\n✗ preparer-www'+(ESSAI?' (essai sur '+SRC+')':'')+' : '+m+'\n');process.exit(1);};
if(!fs.existsSync(path.join(SRC,'index.html')))meurt(SRC+'/index.html introuvable');

/* (2026-11-05, Opus : jury IOS-07) creatures/ : le Worker des singes et dauphins du SOLEIL DE JADE (new Worker('creatures/atelier.js')) n'est pas un
   <script src> : il manquait à l'app (404 muet). Les autres fichiers chargés PAR PROGRAMME suivent plus bas (« LES CHARGEMENTS DYNAMIQUES »). */
const GARDE=['index.html','sfx.js','sons-banque.js','manifest.webmanifest','vendor','assets','creatures'];
const JAMAIS=/\.py$|^\.DS_Store$|^Thumbs\.db$/;
/* LES VOIX NE SONT PAS LIVRÉES (2026-10-14), comme dans l'édition POKI (poki-construire.js, même liste) : sans « ?voix=1 » dans
   l'adresse — impossible dans l'app — le jeu naît SANS_VOIX : l'annonceur, le « ewww » des morts et le « WOW » des combos ne sont
   ni chargés ni joués. Les embarquer, c'était distribuer onze fichiers de voix (dont deux d'origine tierce) que personne n'entend.
   Le témoin plus bas vérifiait que la règle SANS_VOIX du jeu était toujours celle-là.
   (2026-10-24) Le jeu a retiré lui-même ces voix (fichiers et règle SANS_VOIX partis de main) : la liste est vide, la coupe et son témoin ôtés. */
const SANS_LIVRER=new Set([]);
fs.rmSync(WWW,{recursive:true,force:true});fs.mkdirSync(WWW,{recursive:true});
let nFic=0,nOct=0;
/* (2026-10-24) les pages d'ATELIER rangées dans assets/ (ex. assets/audio/music/direct/french-touch.html, avec des polices Google en ligne)
   restent dehors — MAIS PAS les pages que le jeu charge lui-même : la musique de course joue AURA · 30, RUBIS DE NÉON, ASPHALTE D'ÉMERAUDE
   dans une iframe cachée (assets/audio/pouce-bleu-jeu.js, `HTML`). Règle : une page .html de assets/ part dans l'app seulement si son nom
   est cité par la page du jeu ou par un script de assets/. */
/* (2026-11-05, Opus : jury IOS-26) la règle CITE ne lit plus TOUS les .js de assets/ : les catalogues de la bibliothèque (direct/*.js) y citent ~21 pages
   d'atelier, qui seraient toutes parties dans l'app. Seuls les VRAIS chargeurs : la page du jeu, pouce-bleu-jeu.js (les iframes de la musique en
   direct) et musique-bus.js. Un nouveau chargeur de page = l'ajouter ici. */
const CHARGEURS=['assets/audio/pouce-bleu-jeu.js','assets/audio/musique-bus.js'];
const CITE=(()=>{let s=fs.readFileSync(path.join(SRC,'index.html'),'utf8');for(const c of CHARGEURS){const p=path.join(SRC,c);if(fs.existsSync(p))s+=fs.readFileSync(p,'utf8');}return s;})();
const ATELIER=r=>/^assets\/.*\.html$/i.test(r)&&CITE.indexOf(path.basename(r))<0;
const copie=(a,b)=>{const r0=path.relative(SRC,a).split(path.sep).join('/');if(SANS_LIVRER.has(r0)||ATELIER(r0))return;const s=fs.statSync(a);
  if(s.isDirectory()){fs.mkdirSync(b,{recursive:true});for(const n of fs.readdirSync(a))if(!JAMAIS.test(n))copie(path.join(a,n),path.join(b,n));}
  else{fs.copyFileSync(a,b);nFic++;nOct+=s.size;}};
for(const n of GARDE){const a=path.join(SRC,n);if(!fs.existsSync(a))meurt('manque '+n+' dans VERSION PRINCIPALE');copie(a,path.join(WWW,n));}
// (2026-10-14) LES SCRIPTS QUE LA PAGE CHARGE ELLE-MÊME suivent tout seuls : un nouveau fichier du jeu (figures.js, Léo, cette nuit) manquait
// à l'app sans bruit (404, les FIGURES absentes). Tout <script src="…"> local de index.html est copié ; s'il n'existe pas, la fabrication s'arrête.
for(const m of fs.readFileSync(path.join(SRC,'index.html'),'utf8').matchAll(/<script[^>]*\ssrc=["']([^"'?#]+)/g)){const n=m[1];
  if(/^[a-z]+:|^\/\//i.test(n)||n==='natif.js'||n==='achats.js')continue;const a=path.join(SRC,n);if(!fs.existsSync(a))meurt('la page charge '+n+', absent de VERSION PRINCIPALE');
  if(!fs.existsSync(path.join(WWW,n))){fs.mkdirSync(path.dirname(path.join(WWW,n)),{recursive:true});copie(a,path.join(WWW,n));console.log('  + '+n+' (chargé par la page)');}}
/* LES CHARGEMENTS DYNAMIQUES (2026-11-05, Opus : jury IOS-07) : un Worker (new Worker('…')), un fetch('…') ou un script('…') à chemin local, dans la page
   ou dans un .js de assets/ (les adresses relatives se lisent depuis la page) — vu le 5/11 : musique-moteur.json et musique-paliers.js (la musique de
   course, pouce-bleu-jeu.js) et creatures/atelier.js manquaient à l'app. Le fichier existe : il est copié ; un Worker introuvable arrête tout. */
{let s=fs.readFileSync(path.join(SRC,'index.html'),'utf8');const lis=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n);
  if(fs.statSync(p).isDirectory())lis(p);else if(/\.m?js$/i.test(n))s+=fs.readFileSync(p,'utf8');}};lis(path.join(SRC,'assets'));
  for(const m of s.matchAll(/\b(new Worker|fetch|script)\(\s*['"]([^'"?#]+)/g)){const n=m[2];if(/^[a-z]+:|^\/\/|^\//i.test(n)||!/\.[a-z0-9]+$/i.test(n))continue;
    const a=path.join(SRC,n);if(!fs.existsSync(a)||!fs.statSync(a).isFile()){if(m[1]==='new Worker')meurt('le jeu lance le Worker '+n+', absent de VERSION PRINCIPALE');continue;}
    if(!fs.existsSync(path.join(WWW,n))&&!JAMAIS.test(path.basename(n))&&!ATELIER(n)){fs.mkdirSync(path.dirname(path.join(WWW,n)),{recursive:true});copie(a,path.join(WWW,n));console.log('  + '+n+' (chargé par programme)');}}}
/* (2026-11-09, Perf 3 / P4-poids) PLUS D'icon.svg DANS L'APP : seul sw.js (absent de l'app) la citait ; l'icône de l'app est dans Assets.xcassets, celles de la page
   sont les PNG de assets/icons. −0,7 Mo. (Avant : copie de ressources/icon.svg, le mot-symbole, à la racine de www/.) */
/* (idem) LA MER DE NUAGES EN WEBP SANS PERTE : assets/ciel/mer-cumulus.png (867 Ko, RGBA 512²) → ressources/mer-cumulus.webp (304 Ko, lossless, pixels et alpha identiques
   vérifiés avec PIL). Seulement si le PNG de VERSION PRINCIPALE est EXACTEMENT celui qui a été converti (sha1 ci-dessous) : sinon le PNG reste et un message le dit. */
const MC_PNG=path.join(WWW,'assets','ciel','mer-cumulus.png'),MC_SHA1='77765ea42fa2d0c2fafe6a2fc56598ad56d49c0e';
let MC_WEBP=false;
if(fs.existsSync(MC_PNG)){
  if(require('crypto').createHash('sha1').update(fs.readFileSync(MC_PNG)).digest('hex')===MC_SHA1){
    fs.copyFileSync(path.join(ICI,'ressources','mer-cumulus.webp'),path.join(WWW,'assets','ciel','mer-cumulus.webp'));fs.rmSync(MC_PNG);MC_WEBP=true;}
  else console.log('  ⚠ mer-cumulus.png a changé : le webp de ressources/ est périmé, le PNG reste (refaire la conversion : voir preparer-www.js)');}
{let n=fs.readFileSync(path.join(ICI,'natif','natif.js'),'utf8');const k=n.split("'"+MAJ_PROD+"'").length-1;
  if(k!==1){console.error('✗ preparer-www : natif.js doit citer l\'adresse des mises à jour une fois exactement ('+k+')');process.exit(1);}
  /* --banc "<scénario>" (2026-11-07) : app de BANC — natif.js pose localStorage.ccBancAuto et le jeu se joue tout seul (banc-iphone.js) ; www/banc.json en garde la trace.
     Le scénario : « p7 » (2 parties de 5 min), « court » (45 s, pour un essai), ou un JSON {"scenario":"p7","partie":300,"palier":16}. Sans --banc : rien (natif.js efface le drapeau). */
  const iB=process.argv.indexOf('--banc');
  if(iB>=0){let sc=process.argv[iB+1];if(!sc||/^--/.test(sc))sc='p7';let v;try{v=JSON.parse(sc);}catch(e){v=sc;}if(typeof v==='string')v={scenario:v};
    if(n.split('/*@BANC@*/').length!==2){console.error('✗ preparer-www : natif.js doit porter /*@BANC@*/ une fois');process.exit(1);}
    n=n.replace('var BANC=null; /*@BANC@*/','var BANC='+JSON.stringify(v)+'; /*@BANC@*/');
    fs.writeFileSync(path.join(WWW,'banc.json'),JSON.stringify(v)+'\n');nFic++;console.log('⚠ APP DE BANC : scénario '+JSON.stringify(v)+' — à ne JAMAIS soumettre à l\'App Store');}
  /* --qs "<paramètres>" (2026-11-07, passe 3) : des interrupteurs d'URL cuits dans l'app de dev (ex. --qs "&gouv=max&img=max") — natif.js les pose dans location.search avant le jeu ; www/qs.json en garde la trace. Sans --qs : rien. */
  const iQ=process.argv.indexOf('--qs');
  if(iQ>=0){const q=process.argv[iQ+1];if(!q||/^--/.test(q)){console.error('✗ preparer-www : --qs attend des paramètres (ex. "&gouv=max")');process.exit(1);}
    if(n.split('/*@QS@*/').length!==2){console.error('✗ preparer-www : natif.js doit porter /*@QS@*/ une fois');process.exit(1);}
    n=n.replace('var QS=null; /*@QS@*/','var QS='+JSON.stringify(q)+'; /*@QS@*/');
    fs.writeFileSync(path.join(WWW,'qs.json'),JSON.stringify(q)+'\n');nFic++;console.log('⚠ INTERRUPTEURS CUITS : '+q+' — app de dev seulement');}
  fs.writeFileSync(path.join(WWW,'natif.js'),n.split("'"+MAJ_PROD+"'").join("'"+MAJ+"'"));nFic++;}
/* (2026-11-06) LE PONT DES ACHATS : achats.js (window.ccAchat, inerte hors de l'app et sans le plugin natif Achats) est copié tel quel et chargé
   juste après natif.js. Il n'est pas dans VERSION PRINCIPALE : c'est le fabricant qui le pose, comme natif.js. */
if(!fs.existsSync(path.join(ICI,'natif','achats.js')))meurt('manque natif/achats.js');
fs.copyFileSync(path.join(ICI,'natif','achats.js'),path.join(WWW,'achats.js'));nFic++;

// ---- les retouches de la page ----
let h=fs.readFileSync(path.join(WWW,'index.html'),'utf8');
const une=(de,vers,quoi)=>{const n=h.split(de).length-1;if(n!==1)meurt(quoi+' : « '+de+' » trouvé '+n+' fois (1 attendu)');h=h.replace(de,()=>vers);};
// la même, pour un texte qui doit changer à n endroits À LA FOIS (un texte de caisse = sa phrase dans CARS + sa clé dans la table de traduction)
/* (2026-11-05, Sonnet : jour 0 du jury, ECO-01) `souple` : le compte est un MINIMUM — un commentaire qui cite le nom (garage-menu-inventaire.js l.195) ajoute une occurrence sans casser la coupe ; moins que le minimum = le nom a bougé, on s'arrête. */
const toutes=(de,vers,n,quoi,souple)=>{const k=h.split(de).length-1;if(souple?k<n:k!==n)meurt(quoi+' : « '+de+' » trouvé '+k+' fois ('+n+(souple?' au moins':'')+' attendu)');h=h.split(de).join(vers);};
une('<meta charset="UTF-8">','<meta charset="UTF-8">\n<script src="natif.js"></script>\n<script src="achats.js"></script>','natif.js');
let ver='ios';try{ver=execSync('git log -1 --format=%h -- "VERSION PRINCIPALE"',{cwd:path.join(SRC,'..'),stdio:['ignore','pipe','ignore']}).toString().trim()||ver;}catch(e){}
une("const CC_BUILD='__CC_BUILD__';","const CC_BUILD='"+ver+"';",'version');
for(const u of['https://game-cdn.poki.com/scripts/v2/poki-sdk.js','https://sdk.crazygames.com/crazygames-sdk-v3.js','https://bridge.playgama.com/v2/stable/playgama-bridge.js'])
  if(h.indexOf(u)>=0)une("src:'"+u+"'","src:''",'kit de portail'); // (T4 du 14/10 : l'édition des portails est retirée du jeu ; l'inventaire plus bas garde l'œil)
/* L'ÉDITION APP STORE (2026-10-13, Sacha : « couper dans l'app seulement ») — le jeu web de main n'est pas touché.
   · plus de mode TEST : les caisses et la carrière se GAGNENT (Apple refuse une version de test) ;
   · (2026-11-07) le vrai argent REVIENT (achats intégrés StoreKit, voir l'en-tête) : les coupes qui le convertissaient en argent du jeu sont ôtées ;
     L'ÉTERNELLE (100 pubs : l'app n'a pas de pubs) reste à l'argent du jeu s'il en existe encore une ;
   · plus de « BIENTÔT » (2026-10-14) : Apple refuse ce qui est annoncé mais absent. Une caisse « DÉFI À VENIR » (k:'bientot', aujourd'hui COMÈTE : son
     défi n'est pas écrit) passe à l'argent du jeu (au prix POKI de son ancien prix en €, ou 3 M) ; le bouton verrouillé « BIENTÔT » du menu du garage
     est masqué ; l'affiche RECORD PERSO touchée ne disait plus « BIENTÔT EN DÉTAIL » (le jeu lui-même l'a retiré depuis) ; les blocs « ? » des raretés à venir, au bout de SEE ALL ITEMS, ne sont plus posés ;
   · plus de marque d'autrui dans un texte (2026-10-14, audit « regard d'Apple », règle 5.2) : la phrase du MONOSPACE ne double plus
     « une Ferrari » mais « une voiture de course » (la phrase de CARS et sa clé de traduction changent ensemble, puis l'anglais) ;
   · pas de déblocage par CODE (2026-10-14, règle 3.1.1 d'Apple : on ne débloque pas de contenu par un code hors achat intégré) : la ligne
     ENTRER UN CODE des réglages (Léo, « LE CODE COUSIN ») est masquée, le code n'est plus reconnu, et un `cousin` venu d'une sauvegarde
     restaurée (code de sauvegarde du jeu web) ne débloque rien. */
/* (2026-11-05, Sonnet : jour 0 du jury, ECO-02) le jeu livre maintenant TEST_CAISSES=false (garde-demarrage.cjs refuse true) : la coupe ne
   force plus que l'ancien true, et exige l'un des deux (un drapeau disparu = la coupe ne sait plus ce qu'elle protège). (T4 du 14/10 : plus de POKI dans le jeu) */
if(h.includes("const TEST_CAISSES=true;"))une("const TEST_CAISSES=true;","const TEST_CAISSES=false; /* (app iOS) */",'mode TEST des caisses');
else if(!h.includes("const TEST_CAISSES=false;"))meurt('mode TEST des caisses : « const TEST_CAISSES= » (true ou false) introuvable');
/* (la carrière et son mode TEST : retirés du jeu lui-même le 14/10, coupe ôtée le 24/10) */
/* (2026-11-07) les caisses vendues en € ne sont PLUS converties (achats StoreKit). Restent : « DÉFI À VENIR » (k:'bientot') et L'ÉTERNELLE (k:'pubs',
   si elle revient : l'app n'a pas de pubs) qui passent à l'argent du jeu ; une caisse k:'premium' garde sa condition et sa rareté. */
une("function carUnlockedVrai(i){",
  "/* (app iOS) pas de « bientôt », pas de pubs */CAR_UNLOCK.forEach(function(u,i){if(!u||(u.k!=='pubs'&&u.k!=='bientot'))return;const c=CARS[i];"+
  "if(u.k==='bientot'){CAR_UNLOCK[i]={p:(c&&{'REQUIN':6.5e6,'COMÈTE':4.2e6,'LA RAIE':2.5e6}[c.name])||3e6};if(c&&c.rar==='defi')delete c.rar;return;}"+
  "CAR_UNLOCK[i]={p:6500000};if(c){c.rar='legendaire';}});\n"+
  "function carUnlockedVrai(i){",'caisses « bientôt » et aux pubs');
/* (l'annonce « BIENTÔT EN DÉTAIL / EN LIGNE » de l'affiche du garage : retirée du jeu lui-même au train T2 du 14/10, coupe ôtée) */
/* (les blocs « ? — BIENTÔT » de SEE ALL ITEMS : le jeu ne les pose plus sous la charte 6 depuis le train T2 du 14/10, coupe ôtée) */
/* (la phrase « on vient de doubler une Ferrari » du MONOSPACE : réécrite par le jeu lui-même, coupe ôtée le 24/10 ; « Ferrari » ne reste que
   dans deux commentaires du code, jamais affichés) */
/* (2026-10-14, audit « regard d'Apple » § 1-4 et 1-9, règle 5.2) les noms qui SONT ceux d'un vrai modèle de constructeur, en français ET en
   anglais (la table TR traduit le nom : « THE CHARGER » = la Dodge, mot pour mot), la phrase de LA DOLORÈS qui cite Retour vers le futur
   (« 88 à l'heure »), et l'enseigne MOULIN ROUGE de la carte PARIS (marque du cabaret). Dans l'app seulement. Gardés : ELDORADO (la cité
   d'or, un mot courant), ROSSO 40 (« rouge » en italien), LE DÉFIEUR, ATCHOUM (l'éternuement, la caisse éternue du feu). Chaque nom est
   remplacé PARTOUT (CARS, clés de TR, commentaires) : le compte exact protège d'un nom qui aurait bougé dans le jeu. */
toutes('LA DAYTONA','LA GRANDE FLÈCHE',10,'nom LA DAYTONA (Ferrari)');une('"THE DAYTONA"','"THE GREAT ARROW"','nom LA DAYTONA en anglais');
toutes('LA STRATOS','LA CALE',14,'nom LA STRATOS (Lancia)');une('"THE STRATOS"','"THE WEDGE"','nom LA STRATOS en anglais');
toutes('LA VETTE','LA RAPIÈRE',6,'nom LA VETTE (Corvette)');une('"THE VETTE"','"THE RAPIER"','nom LA VETTE en anglais');
toutes('LE CHARGEUR','LE FORBAN',13,'noms LE CHARGEUR et LE CHARGEUR 69 (Dodge)',true);toutes('"THE CHARGER','"THE CORSAIR',2,'noms LE CHARGEUR et LE CHARGEUR 69 en anglais');
une("À 88 à l\\'heure elle remonte le temps, paraît-il.","On la dit en avance sur son époque.",'phrase de LA DOLORÈS (CARS)');
une("À 88 à l'heure elle remonte le temps, paraît-il.","On la dit en avance sur son époque.",'phrase de LA DOLORÈS (clé de traduction)');
une('At 88 it travels back in time, apparently.','Ahead of its time, they say.','phrase de LA DOLORÈS en anglais');
/* (l'enseigne MOULIN ROUGE de la carte PARIS : retirée du jeu lui-même, coupe ôtée le 24/10) */
/* (2026-11-05, Sonnet : jour 0 du jury) Léo a remis le code COUSIN le 05/11 avec un 3e mot (« cousintout », qui ouvre aussi les caisses en €) : la coupe suit la nouvelle ligne, et cousinTout() est coupée aussi. */
une("if(k!=='cousin'&&k!=='cousin161'&&k!=='cousintout')return false;","return false; /* (app iOS) pas de déblocage par code */",'code COUSIN (saisie)');
une("function cousinTout(){try{return !!SAVE.d.cousinTout;}catch(e){return false;}}","function cousinTout(){return false;} /* (app iOS) pas de déblocage par code */",'code COUSIN (tout)');
une("function cousin(){try{return !!SAVE.d.cousin;}catch(e){return false;}}","function cousin(){return false;} /* (app iOS) pas de déblocage par code */",'code COUSIN (effet)');
/* (2026-10-27) les deux adresses OpenGameArt citées en crédit dans un commentaire des bêtes CC0 : retirées pour que l'inventaire reste à 0 adresse réseau. */
une(' https://opengameart.org/content/5-low-poly-animals · https://opengameart.org/content/animated-animales-low-poly',' (source : OpenGameArt)','crédit des bêtes CC0 (adresses en commentaire)');
/* (2026-10-24) LA RÉGIE ADSENSE du site (19/10) : déjà inerte dans l'app (elle sort sous window.Capacitor), son adresse est vidée pour que
   l'inventaire reste à 0 adresse réseau. L'emplacement AdMob de l'app (CC_ADMOB.recompense) est VIDE = éteint, et le module n'est pas installé. */
une("s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+","s.src=''+",'régie AdSense du site (adresse)');
/* (2026-11-07, LES PETITES POLITESSES) l'APERÇU DE LIEN du site (Open Graph / Twitter) cite l'icône par son adresse complète : un lien
   collé dans un message n'a pas d'autre moyen de la trouver. Dans l'app il ne sert à rien : les deux balises sont retirées pour que
   l'inventaire reste à 0 adresse réseau (la publication du 07/11 avait échoué ici). */
/* (2026-11-09, Perf 3 / P4-poids, GO d'OPTI ULTIME) LES ICÔNES ET LE MANIFESTE DU WEB (PWA) HORS DE L'APP : l'icône de l'app est dans Assets.xcassets ; l'onglet, l'écran d'accueil du navigateur
   et l'installation PWA n'existent pas sous Capacitor. Retirés de www/ (assets/icons 0,5 Mo + manifest.webmanifest), le site les garde. */
une('<link rel="icon" type="image/png" sizes="32x32" href="assets/icons/icon-32.png">\n','','icône d\'onglet (PWA)');
une('<link rel="manifest" href="manifest.webmanifest">\n','','manifeste PWA');
une('<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/icon-180.png">\n','','icône d\'écran d\'accueil (PWA)');
une('<meta property="og:image" content="https://car-cash-git.vercel.app/jouer/assets/icons/icon-512.png">','','aperçu de lien du site (og:image)');
une('<meta name="twitter:image" content="https://car-cash-git.vercel.app/jouer/assets/icons/icon-512.png">','','aperçu de lien du site (twitter:image)');
if(MC_WEBP)une("im.src='assets/ciel/mer-cumulus.png'","im.src='assets/ciel/mer-cumulus.webp'",'mer de nuages en webp');
une("var CC_ADMOB={recompense:''};","var CC_ADMOB={recompense:''}; /* (app iOS) aucune régie : ni AdMob ni AdSense */",'emplacement AdMob éteint');
/* (2026-11-07) LES PEINTURES EN EUROS reviennent aussi (PEINT_EUR, par shopPaye / StoreKit) : les deux coupes qui les passaient à l'argent du jeu
   (60 000 par euro) sont ôtées. RESTE, par prudence, l'article du pack LA PALETTE : le pack n'est plus vendu (PALETTE_PACK, aucun produit) ;
   un article « pack » encore posé dirait 0,99 € sans rien à acheter, il dit SECRÈTE (la coupe est sans effet si plus aucun article n'est un pack). */
une("d.pack?eurTxt(PALETTE_PACK.eur):","d.pack?sansAcc(TR('SECRÈTE')):",'prix du pack LA PALETTE sur ses articles');
/* (2026-10-24) la fenêtre ENTRER UN CODE ne parle plus de « code secret » (le code COUSIN est coupé plus haut) : elle restaure une sauvegarde. */
toutes('Colle un code de sauvegarde, ou un code secret.','Colle un code de sauvegarde.',2,'fenêtre ENTRER UN CODE (texte + clé de traduction)');
une('Paste a save code, or a secret code.','Paste a save code.','fenêtre ENTRER UN CODE en anglais');
/* (2026-11-05, Opus : jury IOS-04 / DIR-29, décision D1) PAS UN MOT « PUB » / « AD » DANS L'APP. Le jeu, sous EN_APP, n'ouvre déjà ni la pub maison ni le ×2
   (seconde-chance.js) et la seconde chance s'annonce GRATUITE ; ici on retire en plus les TEXTES de ces écrans jamais montrés, pour qu'aucun mot de pub
   ne reste dans le binaire (le contrôle « PUB / AD » plus bas le vérifie). */
une("Object.assign(I18N,{'PUB':'AD','EN BOUTIQUE':'IN THE SHOP','TA COURSE REPREND APRÈS LA PUB':'YOUR RUN RESUMES AFTER THE AD','TON GAIN ×2 APRÈS LA PUB':'YOUR WINNINGS ×2 AFTER THE AD'});",
  "Object.assign(I18N,{'EN BOUTIQUE':'IN THE SHOP'}); /* (app iOS) pas de pub */",'textes de la pub maison (traductions)');
une("'<i class=\"prTag\" data-fr=\"PUB\">'+TR('PUB')+'</i>","'<i class=\"prTag\"></i>",'étiquette de la pub maison');
une("<span class=\"prPied\" data-fr=\"TA COURSE REPREND APRÈS LA PUB\">'+TR('TA COURSE REPREND APRÈS LA PUB')+'</span>","<span class=\"prPied\"></span>",'pied de la pub maison');
une("el.setAttribute('aria-label',TR('PUB'));","el.setAttribute('aria-label','');",'nom de la pub maison (VoiceOver)');
une("k9=nom==='double-gain'?'TON GAIN ×2 APRÈS LA PUB':'TA COURSE REPREND APRÈS LA PUB';","k9='';",'pied de la pub maison (×2 ou reprise)');
une("pxi('lecture')+'<span>'+TR('PUB')+'</span>'","(LANG==='en'?'FREE':'GRATUIT')",'CONTINUER ▶ PUB');
une("<b class=\"dbP\">'+pxi('lecture')+'<span data-fr=\"PUB\">'+TR('PUB')+'</span></b>","<b class=\"dbP\"></b>",'×2 ▶ PUB');
une("el.setAttribute('aria-label','×2 '+s9+' '+TR('PUB'));","el.setAttribute('aria-label','×2 '+s9);",'×2 ▶ PUB (VoiceOver)');
/* (2026-11-07) la page OFFRES et ses portes ne sont plus masquées ici : c'est le jeu qui décide (ACHAT_EUR, icones-fenetre.js : allumée avec le pont ccAchat,
   cachée sans lui, par sa propre feuille #sansAchat). */
une('</head>','<style id="appStore">/* le vieux panneau RÉGLAGES de l\'écran-titre d\'ordinateur (déjà caché au doigt) : ses boutons de sauvegarde ouvrent un prompt() du système */\n'+
  '#setBtn,#settings{display:none!important}\n'+
  '</style>\n</head>','vieux panneau RÉGLAGES (feuille appStore)');
/* LES TÉMOINS — une coupe faite en CSS ne casse rien si sa cible change de nom : elle cesse juste de couper, en silence. Chaque cible
   encore coupée ou protégée doit donc encore exister dans le jeu ; sinon l'écran a été refait et la coupe est à revoir (au navigateur).
   (2026-11-07) la porte OFFRES (tuile, #mShop, #bdShop) et les caisses premium ne sont plus coupées : leurs témoins disent « cette cible doit
   exister, intacte » (la boutique en € est de retour). k:'pubs' n'existe plus dans les données du jeu : plus de témoin. */
for(const[t,quoi]of[['data-m="shop"','la tuile OFFRES de l\'accueil (laissée intacte)'],['id="mShop"','la page OFFRES (#mShop, laissée intacte)'],['id="bdShop"','le fond de la page OFFRES (#bdShop, laissé intact)'],
  ["k:'premium'",'les caisses vendues en € (laissées intactes)'],["k:'bientot'",'les caisses « DÉFI À VENIR »'],
  ['id="setBtn"','le bouton du vieux panneau RÉGLAGES (#setBtn)'],['id="settings"','le vieux panneau RÉGLAGES (#settings)']])
  if(h.indexOf(t)<0)meurt('témoin perdu — '+quoi+' : « '+t+' » n\'existe plus dans le jeu. L\'écran a changé : revoir la coupe de l\'édition App Store.');
fs.writeFileSync(path.join(WWW,'index.html'),h);
/* (2026-11-05, Opus) LA PAGE RETOUCHÉE SE RELIT : la garde du démarrage du site (outils/garde-demarrage.cjs : chaque <script> en ligne et chaque .js
   chargé se lit avec acorn, chaque <script src> existe) passe sur www/, avant ET après l'allègement. Une coupe qui casse la syntaxe arrête la
   fabrication — avant, publie-allege gardait le script cassé tel quel, sans rien dire. */
const relit=quand=>{try{execFileSync(process.execPath,[path.join(ICI,'..','outils','garde-demarrage.cjs'),WWW],{stdio:['ignore','pipe','pipe'],env:Object.assign({},process.env,{GARDE_DEMARRAGE:'1'})});}
  catch(e){meurt('la page de l\'app ne se lit plus '+quand+' :\n'+String(e.stderr||e.stdout||e.message).trim().slice(0,800));}};
relit('après les coupes');

/* ---- LA COPIE ALLÉGÉE, COMME LE SITE (2026-11-05, Opus : jury IOS-11, SON-01, SON-07, ECO-17) ----
   Les mêmes outils que vercel-build.sh, dans le même ordre, sur www/ : les fichiers d'atelier du son (outils/retraits-publies.cjs), la banque de sons
   en deux moitiés (scinde-banque : le démarrage n'attend que la 1re), seulement l'audio que le jeu peut demander (publie-audio : ~83 → ~30 Mo), puis
   les commentaires et les crochets de test window.dbgX (publie-allege : index.html ~9,7 → ~5 Mo, et plus un mot des commentaires — « Ferrari »,
   « Batman », « Nyan »… — dans le binaire). Chaque outil vérifie lui-même qu'il ne casse rien (sinon il laisse le fichier tel quel) ; s'il échoue,
   la fabrication s'arrête. */
{const OUT=path.join(ICI,'..','outils'),av=nOct;require(path.join(OUT,'retraits-publies.cjs'))(WWW);
  for(const o of ['scinde-banque.cjs','publie-audio.cjs','publie-allege.cjs']){
    try{execFileSync(process.execPath,[path.join(OUT,o),WWW],{stdio:['ignore','pipe','pipe']});}catch(e){meurt(o+' a échoué : '+String((e.stderr||e.stdout||e.message)).trim().slice(0,600));}}
  let n=0,o=0;const pese=d=>{for(const x of fs.readdirSync(d)){const p=path.join(d,x),s=fs.statSync(p);if(s.isDirectory())pese(p);else{n++;o+=s.size;}}};pese(WWW);nFic=n;nOct=o;
  console.log('  copie allégée : '+(av/1048576).toFixed(1)+' → '+(o/1048576).toFixed(1)+' Mo');}
relit('après l\'allègement');
/* (2026-11-09, Perf 3 / P4-poids, GO d'OPTI ULTIME) 1. LES RENDUS PÉRIMÉS RETIRÉS : paliers/rendus/nuit-de-velours et neon-noir (4,9 Mo) ne sont plus ceux de la page (110 bpm fa mineur ≠ 92 bpm mi♭, 4 mesures ≠ 8) et ne
   sont pas dans le lot figé du téléphone. Pouce bleu (pouce-bleu-jeu.js) ne range un morceau « paliers » que si PALIERS_RENDUS en a la fiche : sans fiche, il disparaît de la liste (pas de rendu en direct).
   Seules ces deux fiches/dossiers partent ; ce qu'une autre branche ajoute à rendus/ (musique figée) reste. Étapes volontairement sans échec si le dossier est déjà absent.
   2. LES GROS AAC EN 128 kbps PAR DÉFAUT (lobby, boucles : > 150 kbps → afconvert AAC 128 kbps cible, VBR, ~100-112 kbps réels ; mêmes trames utiles et d'amorce : les boucles gardent leur longueur).
   Un fichier n'est remplacé que s'il rétrécit. macOS seulement (afconvert) ; `--audio-188` garde les fichiers d'origine (écoute A/B : ~/cash-car/perf3/ecoute/). */
{const RT=path.join(WWW,'assets','audio','music','paliers','rendus'),RETIRE=['nuit-de-velours','neon-noir'];let go=0;
  for(const id of RETIRE){const d=path.join(RT,id);if(fs.existsSync(d)){fs.rmSync(d,{recursive:true,force:true});go++;}}
  const IX=path.join(RT,'index.js');
  if(fs.existsSync(IX)){const t=fs.readFileSync(IX,'utf8'),m=t.match(/^([\s\S]*?)window\.PALIERS_RENDUS\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if(!m)meurt('rendus/index.js : forme inattendue, les rendus périmés ne peuvent pas être retirés de la liste');
    const o=JSON.parse(m[2]);let n=0;for(const id of RETIRE)if(id in o){delete o[id];n++;}
    fs.writeFileSync(IX,m[1]+'window.PALIERS_RENDUS='+JSON.stringify(o)+';\n');
}
  console.log('  rendus périmés retirés : '+go+' dossier(s)');}
{const kbps=f=>{try{const o=execFileSync('afinfo',[f]).toString(),m=o.match(/bit rate:\s*(\d+)/);return m?+m[1]/1000:0;}catch(e){return 0;}};
  if(process.argv.includes('--audio-188'))console.log('  AAC gardés à leur débit d\'origine (--audio-188)');
  else{let n=0,av=0,ap=0;const marche=d=>{for(const x of fs.readdirSync(d)){const f=path.join(d,x);
    if(fs.statSync(f).isDirectory()){marche(f);continue;}
    if(!/\.m4a$/i.test(x)||kbps(f)<=150)continue;
    const t=f+'.tmp.m4a';
    try{execFileSync('afconvert',[f,t,'-f','m4af','-d','aac','-b','128000','-q','127','-s','3']);}catch(e){fs.rmSync(t,{force:true});continue;}
    const a=fs.statSync(f).size,b=fs.statSync(t).size;
    if(b<a){fs.renameSync(t,f);n++;av+=a;ap+=b;}else fs.rmSync(t,{force:true});}};
    marche(path.join(WWW,'assets','audio'));
    console.log('  AAC > 150 kbps réencodés en 128 kbps : '+n+' fichiers, '+(av/1048576).toFixed(1)+' → '+(ap/1048576).toFixed(1)+' Mo');}
  fs.rmSync(path.join(WWW,'assets','icons'),{recursive:true,force:true});fs.rmSync(path.join(WWW,'manifest.webmanifest'),{force:true});
  let n2=0,o2=0;const pese=d=>{for(const x of fs.readdirSync(d)){const p=path.join(d,x),st=fs.statSync(p);if(st.isDirectory())pese(p);else{n2++;o2+=st.size;}}};pese(WWW);nFic=n2;nOct=o2;}
/* (2026-11-07, Perf 3 / P4) --jeu-fichier : LE SCRIPT DU JEU EN FICHIER (jeu.<empreinte>.js) au lieu d'un <script> en ligne de ~5 Mo ré-analysé à CHAQUE
   lancement. Le même outil que le site (outils/publie-script-externe.cjs, vercel-build.sh) : ordre de chargement inchangé, __CC_BUILD__ déjà gravé plus haut,
   numéros de ligne recalés par son en-tête. Option d'ESSAI : à garder dans l'app seulement si la mesure (natif.js « [natif] CHARGEMENT ») le justifie. */
if(process.argv.includes('--jeu-fichier')){
  let r;try{r=execFileSync(process.execPath,[path.join(ICI,'..','outils','publie-script-externe.cjs'),WWW],{stdio:['ignore','pipe','pipe']}).toString().trim();}
  catch(e){meurt('publie-script-externe a échoué : '+String((e.stderr||e.stdout||e.message)).trim().slice(0,600));}
  if(!/ jeu\.[0-9a-f]{10}\.js /.test(r))meurt('--jeu-fichier demandé mais le script est resté en ligne : '+r);
  console.log('  '+r);
  relit('après la sortie du script en fichier');}
/* PAS DE « PUB » NI DE « AD » DANS UN TEXTE DE L'APP (2026-11-05, Opus : jury IOS-04) : aucune chaîne entre guillemets ne contient le MOT PUB ou AD
   (les noms de variables comme `PUB`, le tableau des enseignes des villes, ne s'affichent pas). Les fichiers de sons (base64) ne sont pas lus. */
{const re=/(['"`])(?:(?!\1)[^\n\\]|\\.){0,200}?\b(PUB|AD)\b(?:(?!\1)[^\n\\]|\\.){0,200}?\1/g,vus=[];
  const f=d=>{for(const x of fs.readdirSync(d)){const p=path.join(d,x);if(fs.statSync(p).isDirectory())f(p);else if(/\.(html|js)$/i.test(x)&&!/^sons-banque/.test(x)){const t=fs.readFileSync(p,'utf8');let m;while((m=re.exec(t)))vus.push(path.relative(WWW,p)+' : '+m[0].slice(0,90));}}};f(WWW);
  if(vus.length)meurt('le mot PUB ou AD reste dans un texte de l\'app (règle « aucune publicité ») :\n  '+vus.slice(0,20).join('\n  '));}
/* PLUS AUCUNE MARQUE D'AUTRUI DANS LE TEXTE LIVRÉ (2026-11-05, Opus : jury IOS-11 / IOS-18) : après l'allègement, ces mots ne doivent plus
   apparaître dans aucun fichier texte de www/ (ils n'existaient plus que dans des commentaires). Un mot qui revient = l'arrêt, avec le fichier. */
/* (les clés internes nyan, simpson, poptart restent : ce sont des identifiants de sauvegarde, jamais affichés ; le nom CHAT POP-TART est le choix de Sacha) */
{const MARQUES=/ferrari|batman|kellogg|mcqueen|lamborghini|cybertruck|rolls-?royce/i,vus=[];
  const f=d=>{for(const x of fs.readdirSync(d)){const p=path.join(d,x);if(fs.statSync(p).isDirectory())f(p);else if(/\.(html|js|css|json)$/i.test(x)&&!/^sons-banque/.test(x)){const t=fs.readFileSync(p,'utf8'),m=t.match(MARQUES);if(m)vus.push(path.relative(WWW,p)+' : « '+t.slice(Math.max(0,m.index-40),m.index+40).replace(/\s+/g,' ')+' »');}}};f(WWW);
  if(vus.length)meurt('marques d\'autrui dans le texte livré :\n  '+vus.join('\n  '));}

// ---- l'inventaire : plus aucune adresse réseau ----
const TEXTE=/\.(html|js|mjs|css|json|webmanifest|svg|txt)$/i, W3C=/^https?:\/\/www\.w3\.org\//;
// (une adresse dans un COMMENTAIRE de licence ne se charge pas : elle est tolérée, et listée)
const trouve=[],notes=[],permis=[];
const fouille=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n),s=fs.statSync(p);
  if(s.isDirectory()){fouille(p);continue;}if(!TEXTE.test(n))continue;
  const t=fs.readFileSync(p,'utf8'),re=/https?:\/\/[^\s"'`)<>\\]+|=\s*["']\/\/[a-z0-9-]+\.[^\s"']+/gi;let m;
  while((m=re.exec(t))){const u=m[0];if(W3C.test(u))continue;
    if(n==='natif.js'&&u===MAJ){permis.push('natif.js : '+u);continue;} // l'adresse des mises à jour en direct, et elle seule
    const ligne=t.slice(t.lastIndexOf('\n',m.index)+1,m.index);
    const inerte=/\.txt$/i.test(n)||/^\s*(\*|\/\/|\/\*|<!--)/.test(ligne)||/(^|[\s;,(){}])\/\/\s/.test(ligne); // texte de licence, ou commentaire
    (inerte?notes:trouve).push(path.relative(WWW,p)+' : '+u);}}};
fouille(WWW);
if(trouve.length)meurt('adresses réseau restantes dans www/ :\n  '+trouve.join('\n  '));
if(notes.length)console.log('  (adresses en commentaire, jamais chargées : '+notes.length+')\n    '+notes.join('\n    '));
if(permis.length!==1)meurt('l\'adresse des mises à jour en direct est citée '+permis.length+' fois dans www/ (1 attendue, dans natif.js)');
/* LA VERSION DU CONTENU (maj.json) : le commit du jeu + l'empreinte de TOUS les fichiers de www/ (chemin et contenu). Deux fabrications
   identiques donnent la même version ; un octet changé en donne une autre. natif.js la compare à latest.json. */
const crypto=require('crypto'),liste=[];
const tous=d=>{for(const n of fs.readdirSync(d).sort()){const p=path.join(d,n);if(fs.statSync(p).isDirectory())tous(p);else liste.push(p);}};tous(WWW);
const emp=crypto.createHash('sha256');for(const p of liste){emp.update(path.relative(WWW,p).split(path.sep).join('/')+'\0');emp.update(fs.readFileSync(p));}
const version=ver+'-'+emp.digest('hex').slice(0,10);
fs.writeFileSync(path.join(WWW,'maj.json'),JSON.stringify({version,jeu:ver,date:new Date().toISOString()})+'\n');nFic++;
console.log((ESSAI?'✓ ESSAI réussi (www/ non touché) : ':'✓ www/ prêt : ')+nFic+' fichiers, '+(nOct/1048576).toFixed(1)+' Mo · jeu '+ver+' · version '+version+
  ' · natif.js en tête, achats.js juste après · 0 adresse réseau hors la lecture des mises à jour ('+MAJ+')');
