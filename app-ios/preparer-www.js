#!/usr/bin/env node
/* CASH CAR — FABRIQUE www/ (le jeu que l'app iOS embarque) À PARTIR DE « VERSION PRINCIPALE/ ».
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
const fs=require('fs'),path=require('path'),os=require('os'),{execSync}=require('child_process');
/* L'ESSAI À BLANC :  node preparer-www.js --essai "<un autre dossier VERSION PRINCIPALE>"   (npm run essai -- "<dossier>")
   Joue TOUTE la fabrication (copie, retouches, inventaire) sur le jeu d'une autre branche, dans un dossier jetable : www/ n'est pas
   touché. Sert à savoir, AVANT de fusionner, si les retouches trouvent encore leurs cibles dans un jeu qui a bougé. */
const iE=process.argv.indexOf('--essai'), ESSAI=iE>=0?path.resolve(process.argv[iE+1]||''):null;
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

const GARDE=['index.html','sfx.js','sons-banque.js','manifest.webmanifest','vendor','assets'];
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
const CITE=(()=>{let s=fs.readFileSync(path.join(SRC,'index.html'),'utf8');const lis=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n);
  if(fs.statSync(p).isDirectory())lis(p);else if(/\.m?js$/i.test(n))s+=fs.readFileSync(p,'utf8');}};lis(path.join(SRC,'assets'));return s;})();
const ATELIER=r=>/^assets\/.*\.html$/i.test(r)&&CITE.indexOf(path.basename(r))<0;
const copie=(a,b)=>{const r0=path.relative(SRC,a).split(path.sep).join('/');if(SANS_LIVRER.has(r0)||ATELIER(r0))return;const s=fs.statSync(a);
  if(s.isDirectory()){fs.mkdirSync(b,{recursive:true});for(const n of fs.readdirSync(a))if(!JAMAIS.test(n))copie(path.join(a,n),path.join(b,n));}
  else{fs.copyFileSync(a,b);nFic++;nOct+=s.size;}};
for(const n of GARDE){const a=path.join(SRC,n);if(!fs.existsSync(a))meurt('manque '+n+' dans VERSION PRINCIPALE');copie(a,path.join(WWW,n));}
// (2026-10-14) LES SCRIPTS QUE LA PAGE CHARGE ELLE-MÊME suivent tout seuls : un nouveau fichier du jeu (figures.js, Léo, cette nuit) manquait
// à l'app sans bruit (404, les FIGURES absentes). Tout <script src="…"> local de index.html est copié ; s'il n'existe pas, la fabrication s'arrête.
for(const m of fs.readFileSync(path.join(SRC,'index.html'),'utf8').matchAll(/<script[^>]*\ssrc=["']([^"'?#]+)/g)){const n=m[1];
  if(/^[a-z]+:|^\/\//i.test(n)||n==='natif.js')continue;const a=path.join(SRC,n);if(!fs.existsSync(a))meurt('la page charge '+n+', absent de VERSION PRINCIPALE');
  if(!fs.existsSync(path.join(WWW,n))){fs.mkdirSync(path.dirname(path.join(WWW,n)),{recursive:true});copie(a,path.join(WWW,n));console.log('  + '+n+' (chargé par la page)');}}
// l'icône du web : le mot-symbole pixel CASH CAR (icon.svg du jeu = l'émoji 💰 d'Apple, une image protégée : refus App Store)
fs.copyFileSync(path.join(ICI,'ressources','icon.svg'),path.join(WWW,'icon.svg'));nFic++;
{let n=fs.readFileSync(path.join(ICI,'natif','natif.js'),'utf8');const k=n.split("'"+MAJ_PROD+"'").length-1;
  if(k!==1){console.error('✗ preparer-www : natif.js doit citer l\'adresse des mises à jour une fois exactement ('+k+')');process.exit(1);}
  fs.writeFileSync(path.join(WWW,'natif.js'),n.split("'"+MAJ_PROD+"'").join("'"+MAJ+"'"));nFic++;}

// ---- les retouches de la page ----
let h=fs.readFileSync(path.join(WWW,'index.html'),'utf8');
const une=(de,vers,quoi)=>{const n=h.split(de).length-1;if(n!==1)meurt(quoi+' : « '+de+' » trouvé '+n+' fois (1 attendu)');h=h.replace(de,()=>vers);};
// la même, pour un texte qui doit changer à n endroits À LA FOIS (un texte de caisse = sa phrase dans CARS + sa clé dans la table de traduction)
const toutes=(de,vers,n,quoi)=>{const k=h.split(de).length-1;if(k!==n)meurt(quoi+' : « '+de+' » trouvé '+k+' fois ('+n+' attendu)');h=h.split(de).join(vers);};
une('<meta charset="UTF-8">','<meta charset="UTF-8">\n<script src="natif.js"></script>','natif.js');
let ver='ios';try{ver=execSync('git log -1 --format=%h -- "VERSION PRINCIPALE"',{cwd:path.join(SRC,'..'),stdio:['ignore','pipe','ignore']}).toString().trim()||ver;}catch(e){}
une("const CC_BUILD='__CC_BUILD__';","const CC_BUILD='"+ver+"';",'version');
for(const u of['https://game-cdn.poki.com/scripts/v2/poki-sdk.js','https://sdk.crazygames.com/crazygames-sdk-v3.js','https://bridge.playgama.com/v2/stable/playgama-bridge.js'])
  if(h.indexOf(u)>=0)une("src:'"+u+"'","src:''",'kit de portail'); // (T4 du 14/10 : l'édition des portails est retirée du jeu ; l'inventaire plus bas garde l'œil)
/* L'ÉDITION APP STORE (2026-10-13, Sacha : « couper dans l'app seulement ») — le jeu web de main n'est pas touché.
   · plus de mode TEST : les caisses et la carrière se GAGNENT (Apple refuse une version de test) ;
   · plus de vrai argent (pas d'achats intégrés pour l'instant) : les caisses vendues en € et L'ÉTERNELLE (100 pubs : l'app n'a pas
     de pubs) passent À L'ARGENT DU JEU, au prix que l'édition POKI leur donne déjà ; la page OFFRES (en €) et ses portes disparaissent ;
   · plus de « BIENTÔT » (2026-10-14) : Apple refuse ce qui est annoncé mais absent. Les trois caisses « DÉFI À VENIR » (REQUIN, COMÈTE,
     LA RAIE : leur défi n'est pas écrit) passent aussi à l'argent du jeu — REQUIN et COMÈTE au prix POKI de leur ancien prix en €
     (9,99 et 4,99), LA RAIE à ses 2,5 M d'avant ; le bouton verrouillé « BIENTÔT » du menu du garage est masqué ; l'affiche RECORD
     PERSO touchée ne disait plus « BIENTÔT EN DÉTAIL » (le jeu lui-même l'a retiré depuis) ; les blocs « ? » des raretés à venir, au bout de SEE ALL ITEMS, ne sont plus posés ;
   · plus de marque d'autrui dans un texte (2026-10-14, audit « regard d'Apple », règle 5.2) : la phrase du MONOSPACE ne double plus
     « une Ferrari » mais « une voiture de course » (la phrase de CARS et sa clé de traduction changent ensemble, puis l'anglais) ;
   · pas de déblocage par CODE (2026-10-14, règle 3.1.1 d'Apple : on ne débloque pas de contenu par un code hors achat intégré) : la ligne
     ENTRER UN CODE des réglages (Léo, « LE CODE COUSIN ») est masquée, le code n'est plus reconnu, et un `cousin` venu d'une sauvegarde
     restaurée (code de sauvegarde du jeu web) ne débloque rien. */
une("const TEST_CAISSES=true;","const TEST_CAISSES=false; /* (app iOS) */",'mode TEST des caisses'); // (T4 du 14/10 : plus de POKI dans le jeu)
/* (la carrière et son mode TEST : retirés du jeu lui-même le 14/10, coupe ôtée le 24/10) */
une("function carUnlockedVrai(i){",
  "/* (app iOS) le vrai argent passe à l'argent du jeu */CAR_UNLOCK.forEach(function(u,i){if(!u||(u.k!=='premium'&&u.k!=='pubs'&&u.k!=='bientot'))return;const c=CARS[i];"+
  "if(u.k==='bientot'){CAR_UNLOCK[i]={p:(c&&{'REQUIN':6.5e6,'COMÈTE':4.2e6,'LA RAIE':2.5e6}[c.name])||3e6};if(c&&c.rar==='defi')delete c.rar;return;}"+
  "const e=u.k==='pubs'?9.99:(parseFloat(String(u.eur).replace(',','.'))||5);CAR_UNLOCK[i]={p:Math.round((2e6+e*450e3)/1e5)*1e5};if(c){c.rar='legendaire';}});\n"+
  "function carUnlockedVrai(i){",'caisses en €'); // (T4 du 14/10 : l'ancrage d'avant, le bloc des prix de l'édition POKI, est parti avec elle)
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
toutes('LE CHARGEUR','LE FORBAN',13,'noms LE CHARGEUR et LE CHARGEUR 69 (Dodge)');toutes('"THE CHARGER','"THE CORSAIR',2,'noms LE CHARGEUR et LE CHARGEUR 69 en anglais');
une("À 88 à l\\'heure elle remonte le temps, paraît-il.","On la dit en avance sur son époque.",'phrase de LA DOLORÈS (CARS)');
une("À 88 à l'heure elle remonte le temps, paraît-il.","On la dit en avance sur son époque.",'phrase de LA DOLORÈS (clé de traduction)');
une('At 88 it travels back in time, apparently.','Ahead of its time, they say.','phrase de LA DOLORÈS en anglais');
/* (l'enseigne MOULIN ROUGE de la carte PARIS : retirée du jeu lui-même, coupe ôtée le 24/10) */
une("if(k!=='cousin'&&k!=='cousin161')return false;","return false; /* (app iOS) pas de déblocage par code */",'code COUSIN (saisie)');
une("function cousin(){try{return !!SAVE.d.cousin;}catch(e){return false;}}","function cousin(){return false;} /* (app iOS) pas de déblocage par code */",'code COUSIN (effet)');
/* (2026-10-27) les deux adresses OpenGameArt citées en crédit dans un commentaire des bêtes CC0 : retirées pour que l'inventaire reste à 0 adresse réseau. */
une(' https://opengameart.org/content/5-low-poly-animals · https://opengameart.org/content/animated-animales-low-poly',' (source : OpenGameArt)','crédit des bêtes CC0 (adresses en commentaire)');
/* (2026-10-24) LA RÉGIE ADSENSE du site (19/10) : déjà inerte dans l'app (elle sort sous window.Capacitor), son adresse est vidée pour que
   l'inventaire reste à 0 adresse réseau. L'emplacement AdMob de l'app (CC_ADMOB.recompense) est VIDE = éteint, et le module n'est pas installé. */
une("s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+","s.src=''+",'régie AdSense du site (adresse)');
une("var CC_ADMOB={recompense:''};","var CC_ADMOB={recompense:''}; /* (app iOS) aucune régie : ni AdMob ni AdSense */",'emplacement AdMob éteint');
/* (2026-10-24, session APP STORE « directement sortable », règle 3.1.1) LES PEINTURES EN EUROS : depuis le 16/10 le jeu vend chaque peinture en
   vrai argent (PEINT_EUR / PEINT_EUR_ID : 0,50 € à 5 €, par shopPaye, la porte de StoreKit jamais branchée : « L'achat est indisponible pour le
   moment ») et LA PALETTE en pack (0,99 €). Dans l'app, comme les caisses : chaque prix en € devient un prix en argent du jeu (60 000 par euro,
   0,50 € → 30 000, 5 € → 300 000), et l'article du pack sans prix (une secrète) dit SECRÈTE au lieu du prix du pack. */
une("{d.eur=PEINT_EUR_ID[d.id]||PEINT_EUR[r];delete d.p;}",
  "{d.p=Math.round((parseFloat(String(PEINT_EUR_ID[d.id]||PEINT_EUR[r]).replace(',','.'))||1)*60)*1000;delete d.eur;} /* (app iOS) les peintures en € passent à l'argent du jeu */",
  'peintures vendues en €');
une("d.pack?eurTxt(PALETTE_PACK.eur):","d.pack?sansAcc(TR('SECRÈTE')):",'prix du pack LA PALETTE sur ses articles');
/* (2026-10-24) la fenêtre ENTRER UN CODE ne parle plus de « code secret » (le code COUSIN est coupé plus haut) : elle restaure une sauvegarde. */
toutes('Colle un code de sauvegarde, ou un code secret.','Colle un code de sauvegarde.',2,'fenêtre ENTRER UN CODE (texte + clé de traduction)');
une('Paste a save code, or a secret code.','Paste a save code.','fenêtre ENTRER UN CODE en anglais');
une('</head>','<style id="appStore">/* (app iOS) pas de page OFFRES en € : ni l\'écran, ni ses portes (mêmes sélecteurs que l\'édition POKI ; les deux :not(#…) passent devant\n'+
  '   la règle de l\'accueil v2 qui réaffiche la tuile OFFRES) */\n'+
  'html:not(#ccA):not(#ccB) :is([data-m="shop"],[data-go="shop"],.gBoutique,#mShop,#bdShop){display:none!important}\n'+
  '/* le vieux panneau RÉGLAGES de l\'écran-titre d\'ordinateur (déjà caché au doigt) : ses boutons de sauvegarde ouvrent un prompt() du système */\n'+
  '#setBtn,#settings{display:none!important}\n'+
  '</style>\n</head>','page OFFRES');
/* LES TÉMOINS — une coupe faite en CSS ne casse rien si sa cible change de nom : elle cesse juste de couper, en silence. Chaque porte
   masquée ci-dessus doit donc encore exister dans le jeu ; sinon l'écran a été refait et la coupe est à revoir (au navigateur). */
for(const[t,quoi]of[['data-m="shop"','la tuile OFFRES de l\'accueil'],['id="mShop"','la page OFFRES (#mShop)'],['id="bdShop"','le fond de la page OFFRES (#bdShop)'],
  ["k:'premium'",'les caisses vendues en €'],["k:'pubs'",'la caisse aux 100 pubs'],["k:'bientot'",'les caisses « DÉFI À VENIR »'],
  ['id="setBtn"','le bouton du vieux panneau RÉGLAGES (#setBtn)'],['id="settings"','le vieux panneau RÉGLAGES (#settings)']])
  if(h.indexOf(t)<0)meurt('témoin perdu — '+quoi+' : « '+t+' » n\'existe plus dans le jeu. L\'écran a changé : revoir la coupe de l\'édition App Store.');
fs.writeFileSync(path.join(WWW,'index.html'),h);

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
  ' · natif.js en tête · 0 adresse réseau hors la lecture des mises à jour ('+MAJ+')');
