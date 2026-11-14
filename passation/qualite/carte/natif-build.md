# Carte : le natif iOS et la chaîne de build (lecture seule, 14/11)

Worktree lu : `/Users/sachaberes/cash-car/qualite` (branche `qualite-appareil` = 545a47222, v1596). Rien modifié dans `code/`, aucun build, aucune installation, aucune commande envoyée au téléphone.

## 0. Où vit le natif
- `app-ios/` est **sur main** (donc dans ce worktree) : `natif/natif.js`, `natif/achats.js`, `preparer-www.js`, `ios/App/App/*.swift`, `Info.plist`, `capacitor.config.json`.
- `app-ios/www/` est **suivi par git** (222 fichiers) mais généré : ne jamais l'éditer. `compiler.sh` le remet à l'état git après chaque build (`git checkout -- app-ios/www`).
- `app-ios/node_modules` **n'existe pas dans `qualite`** (il existe dans `~/cash-car/finition-build/app-ios/node_modules`). Sans lui, `npx cap sync` ne tourne pas.
- Version native : `MARKETING_VERSION = 1.0.0`, `CURRENT_PROJECT_VERSION = 2` (project.pbxproj:315-346) ; `compiler.sh` force `CURRENT_PROJECT_VERSION=<N>`. Signature : équipe `M532TDYCH2`, bundle `com.sachaberes.carcash`.

## 1. Ce que le natif pose dans la page, et quand

### a. Au tout début du document (avant la 1re ligne du jeu)
`JeuViewController.poseScriptDebut()` (JeuViewController.swift:22-35), appelé en tête de `capacitorDidLoad()` (l.37-38). C'est un `WKUserScript` `.atDocumentStart`, posé sur `bridge.webView.configuration.userContentController` (le vrai, celui que Capacitor utilise). Il pose :
- `window.__ccAppareil` = `GardeThermique.modele` (l.413-417 : `uname().machine`, filtré lettres/chiffres/virgule ; ex. `"iPhone14,2"` = 13 Pro). **Vérifié sur le téléphone** : les 16 courses du vol `~/cash-car/ios-ultime-mesures/vol/vol-1113-2339.json` portent `app:"iPhone14,2"`, `ecr:"390x844@3"`, `pal:2`, `eco:0`.
- `window.__ccEco` = 1 si mode Économie d'énergie (`ProcessInfo.isLowPowerModeEnabled`), sinon 0.
- `window.__ccAutreSon`, `window.__ccAutreSonLu` (son : autre app qui joue au lancement).
- en build **Debug** seulement, si la variable d'environnement `CC_QS` existe et passe `^[&A-Za-z0-9=._,-]+$` : `window.__ccQSsup='<CC_QS>'` + écran gardé allumé (`isIdleTimerDisabled = true`).
- ⚠ `webViewConfiguration(for:)` (l.15-17) est surchargée mais ne fait RIEN (`return super`) : le script y était jeté par Capacitor (cause du bug du build 77, PLAN-ULTIME.md:366). Le commentaire de `code/rendu/palier-appareil.js:60` dit encore « JeuViewController.webViewConfiguration » : périmé, c'est `capacitorDidLoad` qui pose.

### b. Toutes les 5 s, et à chaque changement (GardeThermique.envoie, l.451-461)
Par `evaluateJavaScript` (donc APRÈS le chargement ; la page doit être vivante) :
`window.__ccBatterie` (0-100, −1 inconnu) · `window.__ccBranche` (0 inconnu, 1 débranché, 2 en charge, 3 pleine) · `window.__ccAppareil` (redit) · `window.__ccEco` · `window.__ccThermique` (0 nominal, 1 fair, 2 serious, 3 critical) · événement `cc:thermique` `{detail:{etat}}`.
Déclencheurs : `thermalStateDidChangeNotification`, `NSProcessInfoPowerStateDidChange` (mode éco), `batteryLevelDidChange`, `batteryStateDidChange`, minuteur 5 s (tolérance 1 s) (l.394-409).
Lecteurs dans le jeu : `code/moteur/gouverneur-thermique.js:85` `mobThermo(n)` et l.113 (rattrapage de `__ccThermique` posé avant l'écoute) ; `WATT`/`wattTick` l.95-111 (wattmètre par la batterie, `dbgWatt()`), `code/moteur/gouverneur-paliers.js:47-49` `mobBranche()` (`MOB_CHARGE`), `code/moteur/enregistreur-perf.js:87,96` (boîte de vol).

### c. Autres messages natifs → page
`ccActif`, `ccInactif` (SceneDelegate.swift:26), `ccSortieSon` (GardeHautParleur), `cc:autreson`, `__ccNote('pivot'|'son', …)` vers la boîte noire. Plugins JS : `GardeNavigation.veille({on})`, `SerpentNatif.montre/fondu/retire`, `Achats`.

### d. Ce qui N'EST PAS posé aujourd'hui (aucune trace dans le Swift ni dans code/ : grep `physicalMemory|processorCount|maximumFramesPerSecond|preferredFrameRate` = 0)
Tout est facile à ajouter dans la chaîne `source` de `poseScriptDebut()` (une ligne chacun, API publiques, sans autorisation) :
- RAM physique : `ProcessInfo.processInfo.physicalMemory` (octets). Mémoire restante : `os_proc_available_memory()` (import os).
- Cœurs : `ProcessInfo.processInfo.processorCount` / `activeProcessorCount` (le web a déjà `navigator.hardwareConcurrency`, lu par `POSTE` soleil-planete.js:453).
- Fréquence max de l'écran : `UIScreen.main.maximumFramesPerSecond` (120 sur ProMotion, 60 sinon).
- Mode éco : déjà posé (`__ccEco`).
⚠ MAIS une ligne Swift en plus = **nouveau binaire natif** : build Xcode, et pour l'App Store `MARKETING_VERSION` à monter + `--natif-min` dans `publier-maj.js` (LISEZ-MOI.md:33-36, 71-73). Une mise à jour en direct (Capgo) ne change que `www/`. → Un système de profils fondé sur `__ccAppareil` seul (déjà posé, vérifié) part en direct à TOUS les iPhone sans nouveau binaire.
⚠ (de mémoire, non vérifié dans le dépôt) RAM et Hz discriminent mal : 13 Pro = 6 Go/120 Hz, iPhone 15 = 6 Go/**60 Hz**, 15 Pro = 8 Go/120, 16 = 8 Go/60, 17 Pro = 12 Go. Un iPhone 15 aurait MOINS de Hz qu'un 13 Pro : la fréquence ne doit pas servir de note de puissance. Le modèle (puce) est le seul bon critère.

## 2. La vue web est-elle limitée à 60 Hz ?
- `CADisableMinimumFrameDurationOnPhone` est **absente** : ni dans `Info.plist` (lu en entier, 74 lignes), ni en `INFOPLIST_KEY_*` dans `project.pbxproj` (grep vide). Déjà noté par l'audit du 13/11 (PLAN-ULTIME.md:396 : « la piste retirer la clé 120 Hz tombe. Aucun réglage public ne plafonne la cadence d'une WKWebView »).
- MESURÉ dans l'app (PASSATION-FABLE.md:15, PLAN-ULTIME.md:330) : le 13 Pro reçoit 75 à 120 rappels rAF/s (ProMotion) ; d'autres vols lisent 60 rappels/s. Donc la vue web n'est pas bridée à 60 par le natif ; c'est **le jeu** qui se plafonne : `FPS_CAP`/`fpsSaute` (code/moteur/cadence.js:41-50 : 120 Hz → 60 i/s, `?fps=0` coupe), puis la cadence téléphone 30 i/s (`cadPer()` cadence.js:74, 20 i/s à critical `CAD_CRIT20`, `?cadfps=20|24`, `?sans=crit20`), menus 30/15 (HC, l.160-190), mesure de la période d'écran `CAD.ecran` (l.65).
- Mode Économie d'énergie : iOS bride la vue web à 30 i/s (commentaire GardeThermique l.395) → `__ccEco`.
- Non vérifié : l'effet réel de la clé si on l'ajoutait (WebKit rend dans son propre processus).

## 3. Compiler un build de dev et l'installer sur le 13 Pro (procédure exacte, à faire SEULEMENT avec l'accord de Sacha)

Identifiants du 13 Pro : devicectl `FE6F8B40-DCFF-5E04-B578-871A79EDCF17` ; UDID (pymobiledevice3) `00008110-000621041468401E`.
Dernier build compilé : **114** (`~/cash-car/ios-ultime-mesures/builds/build114.app`, 13/11 23 h 37, `xcb-114.log` = BUILD SUCCEEDED). Builds présents : 100-102, 104-114. Lequel est INSTALLÉ : **non vérifié** (la clôture ios-ultime dit 110 ; 111-114 = nuit de finition). Pour le savoir : `xcrun devicectl device info apps --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17` (champ version de build). Prochain numéro libre : **115**.

### Le script `~/cash-car/ios-ultime-mesures/compiler.sh <N> [qs]` (lu en entier)
```
cd /Users/sachaberes/cash-car/finition-build/app-ios          # ⚠ chemin EN DUR
COMPLET=1 node preparer-www.js --maj http://127.0.0.1:1/ --qs "$QS"   # QS défaut "&perfrec=2"
npx cap sync ios
cd ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Debug -destination generic/platform=iOS \
  -derivedDataPath ~/cash-car/ios-ultime-mesures/dd-tel -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=M532TDYCH2 CURRENT_PROJECT_VERSION="$N" build > ~/cash-car/ios-ultime-mesures/xcb-$N.log
cp -Rc …/dd-tel/Build/Products/Debug-iphoneos/App.app ~/cash-car/ios-ultime-mesures/builds/build$N.app
git checkout -- app-ios/www        # dans finition-build
```
- **Quelle branche est compilée** : celle sur laquelle est l'arbre `~/cash-car/finition-build`, aujourd'hui **HEAD détachée 9c0b976f6 (v1591)**, PAS main v1596 ni `qualite-appareil`. Il porte une modif locale (`app-ios/ios/App/CapApp-SPM/Package.swift`, réécrit par `cap sync`) et des fichiers www non suivis. Avant de compiler la qualité : `git -C ~/cash-car/finition-build checkout --detach qualite-appareil` (détaché : la branche est déjà prise par le worktree `qualite`) — vérifier que Package.swift ne bloque pas le checkout. Alternative : une copie de compiler.sh pointant sur `qualite`, mais il faut alors `npm install` dans `qualite/app-ios` (réseau) ou un lien vers le node_modules de finition-build.
- `www/` est fabriqué par `preparer-www.js` depuis `VERSION PRINCIPALE/` (donc depuis l'**index.html assemblé** : penser à `node code/assembler.cjs` avant). `COMPLET=1` = jeu complet de main, AUCUNE coupe App Store (preparer-www.js:130-246), les erreurs de cible deviennent des avertissements (l.37), maj.json marqué `complet:true` (l.366-367 : publier-maj/archiver refusent de le livrer). `--maj http://127.0.0.1:1/` = mises à jour en direct neutralisées (sinon Capgo pourrait remplacer le jeu de dev).
- ⚠ Même en COMPLET, la copie allégée tourne (preparer-www.js:268-277) : `outils/publie-allege.cjs` **retire les crochets `window.dbgX` que rien d'autre ne nomme** (publie-allege.cjs:9-10, 92 ; `natif.js` et les autres fichiers de www comptent comme « ailleurs »). Donc `dbgImg`, `dbgPalier`… peuvent être ABSENTS dans l'app de dev → pour un crochet à lire sur le téléphone, le nommer dans natif.js / un fichier de www, ou passer par la boîte noire / la boîte de vol. (Le retrait exact de chaque crochet : non vérifié.)
- Autres options de preparer-www.js : `--qs "<paramètres>"` (cuits, natif.js:28 / preparer-www.js:98-102, `www/qs.json`), `--banc p7|court|{json}` (natif.js:25, banc-iphone.js), `--jeu-fichier` (script du jeu en fichier, l.321-327), `--essai [dossier]`.

### Installer et lancer
1. AVANT d'installer (règle PLAN-ULTIME.md:582) : `sh outils/banc-perf/lire-vol.sh` puis `sh outils/banc-perf/lire-banc.sh` (sauver les mesures ; une app construite sans `perfrec` dans `--qs` EFFACE la boîte de vol au lancement, natif.js:62).
2. Installer (iPhone branché, déverrouillé) : `xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 ~/cash-car/ios-ultime-mesures/builds/build<N>.app` (PLAN-ULTIME.md:113).
3. Lancer AVEC des paramètres sans recompiler (Debug seulement) :
   `xcrun devicectl device process launch --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 --terminate-existing -e '{"CC_QS":"&appareil=iPhone16,1&perfrec=2"}' com.sachaberes.carcash`
   → `window.__ccQSsup`, ajouté par natif.js:33-34 au `--qs` cuit, puis `history.replaceState` met le tout dans `location.search` avant le jeu (la page de l'app n'a pas de query sinon). Caractères permis : `& A-Z a-z 0-9 = . _ , -` (pas de `|`, `%`, espace). Lancée depuis l'écran d'accueil, l'app n'a PAS `CC_QS` (seulement le `--qs` cuit). Avec `CC_QS`, l'écran ne se verrouille plus et `veille()` est ignorée.
4. Page inspectable en Debug (`isInspectable`, JeuViewController.swift:83-86) : Safari du Mac › Développement › iPhone, ou `pymobiledevice3 webinspector`.
- Le 15 d'un ami : un build de dev ne s'installe que sur un appareil enregistré dans l'équipe (provisionnement de dev) — sinon TestFlight ou mise à jour en direct. L'iPhone 15 de Léo est cité comme appareil de mesure (PLAN-ULTIME.md:117) ; son enregistrement : non vérifié.

## 4. Relire les mesures du téléphone
Les deux lisent le `localstorage.sqlite3` de l'app par câble (`devicectl device info files` + `copy from`, domaine `appDataContainer`), iPhone branché ET déverrouillé, LECTURE SEULE.
- **Boîte de vol (BV)** : `sh outils/banc-perf/lire-vol.sh [sortie] [bundle] [device]` → `~/cash-car/ios-ultime-mesures/vol/vol-MMJJ-HHMM.json` (clés `ccBV<n>`) puis `python3 outils/banc-perf/analyse-vol.py <json> [--depuis AAAA-MM-JJTHH:MM] [--v version]` : par phase sol/vol/figure et tranche de vitesse, i/s, images en retard (>21/34,5/51 ms), travail JS, état thermique, maps, leviers. Enregistreur : `code/moteur/enregistreur-perf.js` (`BV`, l.70-96 ; 16 courses gardées ; champs `app`, `ecr`, `eco`, `pal`, `th`, `bat`…). Allumage : `?perfrec=2` (cuit par `--qs "&perfrec=2"`, défaut de compiler.sh), `?perfrec=1` = enregistreur simple, `?perfrec=0` éteint, `dbgPerfRec(1)`.
- **Boîte noire** : `sh outils/banc-perf/lire-banc.sh [bundle] [device]` → `cashcarErr` (gels, erreurs, sondes, `__ccNote(genre, message)` : `chargement`, `contexte`, `son`, `pivot`, `panne`, `grotte`…) + `cashcarBanc`, triés par heure ; `node outils/banc-perf/garde-iphone.cjs brut.txt` juge les seuils. Copies datées dans `~/cash-car/ios-ultime-mesures/boite-noire-*.txt`.
- Chaleur : `~/Library/Python/3.9/bin/pymobiledevice3 syslog live --udid 00008110-000621041468401E | grep 'thermal budget'` (budget audiomxd en W : 2,5 = pas de pression, 0,7 plancher) ; `outils/banc-chaleur/essai.sh <nom> "<CC_QS>" [durée]` (repos `chaleur=vide` puis essai, résultats `~/cash-car/ios-ultime-mesures/chaleur/`), `serie*.sh`. Interrupteurs natif.js:35-60 : `chaleur=vide|accueil|course|pause`, `chalpal=1`, `challent=1`, `chaldpr=0.5`, `chalrendu=0`, `chalson=1` (sauvegarde du joueur ni lue ni écrite).
- Banc automatique : `sh outils/banc-perf/iphone-auto.sh <N>` (app construite avec `--banc`, verrouillage auto = JAMAIS).
- Règles de mesure (PLAN-ULTIME.md §5 et clôture) : app tuée depuis 3 min ; budget thermique ≥ 380 (sentinelle) ; comparer à état thermique égal ; **jamais mesurer en charge sans le dire** (la charge de la batterie fait passer serious/critical : l.559-566). Débranché, build 110 : 29,8 i/s, serious tout du long, jamais critical.

## 5. Identifiants de modèle connus du code
- Le code ne contient **aucune table par identifiant** : seulement une règle sur le premier nombre, `code/rendu/palier-appareil.js:64-65` (`modele`) : `iPhone≤10,x` → palier 0 (ANCIEN) ; `11,x` et `12,x` → palier 1 (MOYEN) ; `≥13,x` → palier 2 (RÉCENT). Donc **13 Pro (14,2), 15 (15,4), 16 Pro (17,1), 17 Pro… = même palier 2, mêmes réglages** : c'est exactement la plainte de Sacha.
- Identifiants cités : `iPhone14,2` (13 Pro de Sacha : JeuViewController.swift:12,412, palier-appareil.js:60, vols), `iPhone12,8` (SE 2, essai `?appareil=`), `iPhone10,4` (iPhone 8) et `iPhone17,1` (16 Pro) (vérifiés au volet, PLAN-ULTIME.md:226).
- Le plan prévoyait des classes (PLAN-ULTIME.md:89) : 13,x-14,x (A14-A15) classe a = réglages actuels ; 15,x-16,x (14 Pro, 15, 15 Pro · A16-A17) classe b = palier de remontée −1 (résolution pleine) ; ≥17,x classe c = −2 (halo plein, ombre 1024). **Jamais fait** : la décision Q5 (l.134) l'a remplacé par une remontée automatique `MOB_R`, restée ÉTEINTE (l.227 : coupée le 07/11 pour 15 gels > 1 s aux bascules).
- Correspondance (de mémoire, NON présente dans le dépôt, à vérifier) : 14,4 13 mini · 14,5 13 · 14,2 13 Pro · 14,3 13 Pro Max · 14,6 SE 3 · 14,7 14 · 14,8 14 Plus · 15,2 14 Pro · 15,3 14 Pro Max · 15,4 15 · 15,5 15 Plus · 16,1 15 Pro · 16,2 15 Pro Max · 17,3 16 · 17,4 16 Plus · 17,1 16 Pro · 17,2 16 Pro Max · 17,5 16e · 18,x = gamme 17 (Pro, Pro Max, 17, Air — numéros exacts à vérifier).
- Ordre des sources du palier (palier-appareil.js:66-76) : `?palier=` > palier appris en course (`cashcarPalier`, src `mesure`) > ordinateur (`POSTE`) > **modèle** > iOS ≤15 > taille d'écran (`ecran`, l.51-58, `?palecran=0`) > banc. Essai au navigateur : `?appareil=iPhone16,1` (+ `?tel=1` pour TEL_NATIF/ALLEGE côté rendu). Leviers d'image du palier 2 téléphone : `PAL.imgOn`, `PAL.bT`, `?img=max|a,c|13`, `?imgsans=`, `?imgplus=g,i,j`, `dbgImg()` (l.84-104).

## Pour un système de profils par appareil : où brancher, pièges

**Où brancher**
1. La table des profils : `code/rendu/palier-appareil.js`, fonction `modele` (l.64-65) et l'ordre des sources (l.66-76). Remplacer la règle « ≥13 → 2 » par une table identifiant → profil (et un repli « inconnu plus récent que la table = profil max »). `window.__ccAppareil` est disponible avant ce script dans l'app (vérifié), et `?appareil=` permet de simuler chaque modèle au navigateur ET sur le téléphone via `CC_QS`.
2. Le choix HAUTE / BASSE des réglages se combine au profil (le profil dit « le maximum de cet appareil », BASSE en dérive) ; prévoir sa ligne dans la boîte de vol (`enregistreur-perf.js:87` porte déjà `app` et `pal` : y ajouter le profil et le choix).
3. Si on veut des données natives en plus (RAM, Hz, cœurs) : une ligne dans `poseScriptDebut()` (JeuViewController.swift:33). Pas nécessaire pour le profil : le modèle suffit.

**Pièges**
- Le palier **appris en course** (`cashcarPalier`, src `mesure`) passe AVANT le modèle (l.67) : un téléphone qui a déjà appris un palier ignorera la nouvelle table → prévoir une version de la clé ou l'effacer à la mise à jour.
- `ALLEGE`/`TEL_NATIF` (soleil-planete.js:418) coupent l'image sur TOUT téléphone, indépendamment du palier (ex. `mapsSobres()` palier-appareil.js:111 = sobres sur tout téléphone ; maps hors périmètre). La « version Vercel » sur iPhone 17 exige de lever aussi ces gardes-là, pas seulement le palier. `garde-allege.sh` refuse toute coupe d'image sous `IS_MOBILE`.
- Les leviers `img*` ne jouent qu'au palier 2 sur `TEL_NATIF` : les colonnes ancien/moyen des clés `img*` ne sont pas lues (l.83).
- La cadence téléphone est 30 i/s par construction (cadence.js) ; une fréquence d'écran 120 Hz ne dit rien de la puce (iPhone 15 = 60 Hz).
- Le 13 Pro de Sacha est « serious » dès la 1re seconde sur batterie (batterie 1 314 cycles) : le gouverneur thermique y rabat déjà l'image ; un profil HAUTE mesuré sur ce téléphone en charge sera faux.
- Mises à jour en direct : un profil purement JS part à tous par Capgo ; tout ajout Swift = binaire + `MARKETING_VERSION` + `--natif-min`.
- Build de dev : compiler.sh compile `~/cash-car/finition-build` (HEAD détachée v1591 aujourd'hui), pas `qualite` ; `publie-allege` retire les crochets `dbg*` non nommés ailleurs ; `CC_QS` n'existe qu'en Debug et seulement lancé par devicectl ; lire vol + boîte noire avant chaque installation ; accord de Sacha avant toute installation et avant main.
- Le commentaire de palier-appareil.js:60 (webViewConfiguration) est périmé : l'injection est dans `capacitorDidLoad` → `poseScriptDebut`.
