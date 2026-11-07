# CASH CAR — l'app iOS (Capacitor 8)

L'app iOS **emballe le jeu web de `VERSION PRINCIPALE/`** dans une vraie app iPhone (Capacitor = une coquille native
qui affiche le jeu dans une vue web, sans navigateur autour). Le jeu n'est **pas recopié à la main** : `www/` est
**fabriqué** à partir de `VERSION PRINCIPALE/` par `preparer-www.js`.

| Quoi | Où |
|---|---|
| Identifiant de l'app | `com.sachaberes.carcash` · nom sous l'icône : **CASH CAR** · version **1.0.0 (1)** · équipe Apple `M532TDYCH2` |
| Le jeu embarqué (généré, ne pas éditer) | `www/` |
| La colle native (chargée en premier, inerte hors de l'app) | `natif/natif.js` |
| Le projet Xcode | `ios/App/App.xcodeproj` (Swift Package Manager, pas de CocoaPods) |
| Le contrôleur plein écran + la garde des liens | `ios/App/App/JeuViewController.swift` |
| Le manifeste de confidentialité exigé par Apple | `ios/App/App/PrivacyInfo.xcprivacy` |
| Les images sources de l'icône et de l'écran de lancement | `ressources/` (→ `assets/` → `Assets.xcassets`) |
| **iOS minimum** | **16.4** (depuis le 2026-11-05, jury IOS-10) |

## Ce qui a changé le 2026-11-05 (audit du jury, branche `jury/opus`) — à vérifier le jour Mac

- **iOS 16.4 minimum** (IOS-10) : `IPHONEOS_DEPLOYMENT_TARGET = 16.4` (les 4 lignes du projet) et `CapApp-SPM/Package.swift`
  (`.iOS("16.4")`). Raison : le CSS du jeu emploie `color-mix()` (166 fois, iOS 16.2+) et `:has()` (47 fois, 15.4+) ; sous 16.2 la
  boutique, les boutons flottants et les toasts perdent leurs couleurs. Les iPhone bloqués sous 16.4 (6s, 7, SE 1) ne tiendraient pas
  le rendu de toute façon. ⚠ `Package.swift` est réécrit par `npx cap sync` (il remettra peut-être `.v15`) : sans gravité, c'est la
  cible de l'app (`project.pbxproj`) qui compte. Fiche App Store : « iOS 16.4 ou plus récent ».
- **Le son malgré l'interrupteur silencieux** (SON-04) : `AppDelegate.swift` pose `AVAudioSession` en `.playback` au lancement. Sur
  iOS 16 la page n'a pas `navigator.audioSession` (iOS 17+) et la vue web jouait en « ambient » : le bouton silencieux coupait tout le
  jeu. Sur iOS 17+ le jeu ajuste encore lui-même (`musicSession`, `code/son/musique.js`). Test Mac : iPhone en silencieux → le son joue.
- **L'indicateur d'accueil s'efface** (IOS-21) : `prefersHomeIndicatorAutoHidden` dans `JeuViewController.swift`. Le bloc `SystemBars`
  de `capacitor.config.json` n'a aucun module installé : il est inerte (gardé, sans effet).
- **L'écran de lancement attend le jeu** (IOS-20) : `launchAutoHide:false` ; c'est `natif.js` qui l'efface à `DOMContentLoaded`
  (après l'exécution du grand script), avec un filet à 30 s. Avant, il partait seul à 4 s et un iPhone lent montrait un fond violet nu.
- **L'écran de lancement est NOIR** (2026-11-07, Sacha : « enlève l'écran CASH CAR avec des néons au tout début ») : les images de
  `Splash.imageset` sont du noir uni 2732 × 2732, le même noir que la 1re image du jeu ; `generer-icones.js` le refait noir (plus
  `ressources/lancement-2732.png`). iOS garde l'ancien écran en cache : supprimer l'app du téléphone avant de réinstaller.
- **Une version native = un numéro de version** (IOS-19) : `publier-maj.js` met `natifMin` = `MARKETING_VERSION`, et l'app ne compare
  que ce numéro (`getBuiltinVersion`, pas le numéro de build). Donc **chaque envoi qui change le natif** (un module Capacitor, une
  autorisation, `Info.plist`, Swift) **monte `MARKETING_VERSION`** (1.0.0 → 1.0.1 → 1.1.0) ; monter seulement le build ne suffit pas :
  une mise à jour en direct qui a besoin du nouveau natif irait aussi sur les anciens.
- **La fabrication de `www/` = la copie publiée du site** (IOS-07, IOS-11, IOS-26, ECO-17, SON-01, SON-07) : `preparer-www.js` copie
  aussi ce que le jeu charge PAR PROGRAMME (Worker `creatures/atelier.js`, `musique-moteur.json`, `musique-paliers.js` : ils
  manquaient à l'app), puis applique les outils du site : `outils/retraits-publies.cjs` (la même liste que `vercel-build.sh`),
  `scinde-banque`, `publie-audio`, `publie-allege` (commentaires et crochets `dbg` retirés). Résultat : ~104 → ~47 Mo. Il relit la
  page avec la garde du démarrage avant et après, refuse tout texte « PUB » / « AD » et toute marque (Ferrari, Batman…) dans le livrable.
  Une page `.html` de `assets/` ne part que si la page du jeu, `pouce-bleu-jeu.js` ou `musique-bus.js` la cite (`CHARGEURS`).
- **L'essai bloque le site** (IOS-32) : `vercel-build.sh` lance `node app-ios/preparer-www.js --essai` ; une coupe qui a perdu sa cible
  arrête la publication web (`GARDE_APP=0` la coupe en urgence). `--essai` sans dossier = le `VERSION PRINCIPALE` du dépôt.
- **Pas de pub dans l'app** (IOS-04, décision D1) : sous `window.Capacitor` le jeu sert la seconde chance tout de suite (GRATUIT) et n'a
  pas de ×2 ; les textes « PUB / AD » sont retirés de `www/`. Le site garde la pub maison et le ×2. Simuler l'app au navigateur : `?app=1`.

## Mettre à jour l'app après un changement du jeu

```bash
cd app-ios
npm install          # la première fois seulement (node_modules n'est pas dans git)
npm run sync         # refait www/ depuis VERSION PRINCIPALE, puis npx cap sync ios
npm run ouvrir       # ouvre le projet dans Xcode
```

`preparer-www.js` **refuse** de continuer s'il reste une adresse réseau (http/https) dans ce qu'on embarque : l'app est
100 % hors ligne. Il grave aussi la version du jeu (le commit) : RÉGLAGES affiche « VERSION xxxxxxx ».

## Les mises à jour EN DIRECT, sans passer par l'App Store (2026-10-14, oui de Sacha ; à partir du build 2)

Le jeu embarqué (`www/`) se remplace par internet : les joueurs n'ont rien à télécharger dans l'App Store.
- **Comment** : le module `@capgo/capacitor-updater` (open source, mode manuel, AUCUNE statistique : `statsUrl` vide dans
  `capacitor.config.json`). `natif/natif.js` (partie 7), une fois le jeu démarré (`__gameReady`) : feu vert au module, puis
  lecture de `latest.json` sur la branche `app-maj` du dépôt public ; si la version diffère de `www/maj.json`, le module
  télécharge **seulement les fichiers changés** (souvent `index.html`, ~5 Mo), et la nouvelle version s'applique au prochain
  passage en arrière-plan.
- **Publier** : `node publier-maj.js` (commit local sur `app-maj`, rien d'envoyé), puis `node publier-maj.js --envoyer`
  **seulement sur le oui de Sacha** (tous les iPhone la prennent). Ce qui part est l'ÉDITION APP STORE (preparer-www.js et
  toutes ses coupes), jamais le jeu web tel quel.
- **Filet de sécurité (vérifié au simulateur le 14/10)** : une version qui ne démarre pas n'envoie pas de feu vert → au bout de
  60 s (`appReadyTimeout`) le module revient seul à la version d'avant, et `natif.js` la note dans `ccMajRefus` : elle n'est
  plus jamais retentée sur ce téléphone.
- **Ce qui exige une vraie mise à jour App Store** : tout ce qui touche l'app native (nouveau module Capacitor, icône, nom,
  autorisations, `Info.plist`). Une mise à jour en direct qui en aurait besoin se protège avec `--natif-min <version>`.
- **Règle d'Apple** : corriger, équilibrer, ajouter du contenu (caisses, cartes, musiques) : oui. Changer la nature du jeu,
  ajouter des achats ou de la pub, rallumer ce que l'édition App Store coupe : non (l'app peut être retirée).
- **Essai au simulateur** : `node preparer-www.js --maj http://localhost:8765/`, build simulateur, puis
  `node publier-maj.js --local <dossier> --maj http://localhost:8765/ --jeu <un VERSION PRINCIPALE modifié>` et
  `python3 -m http.server 8765 --directory <dossier>`. Pour appliquer : passer sur une autre app puis revenir (un arrêt forcé
  par `simctl terminate` ne déclenche pas l'arrière-plan). Remettre ensuite `node preparer-www.js` sans `--maj`.

## L'édition App Store : ce que l'app coupe, et que le jeu web garde (2026-10-13, Sacha : « couper dans l'app seulement »)

Apple refuse une version de test et des prix en argent réel sans achats intégrés. `preparer-www.js` fait donc ces coupes
dans `www/` **seulement** — `VERSION PRINCIPALE/` (le jeu web de `main`, celui de Vercel) n'est pas touchée :

- **plus de mode TEST** : `TEST_CAISSES` et `TEST_CARRIERE` passent à `false` (les caisses et la carrière se gagnent) ;
- **plus de vrai argent** : les caisses vendues en € et L'ÉTERNELLE (100 pubs — l'app n'a pas de pubs) passent à l'argent
  du jeu, au prix que l'édition POKI leur donne déjà ;
- **plus de page OFFRES** : la tuile de l'accueil, la page `#mShop` et l'onglet OFFRES de la boutique du garage sont masqués.
- **plus de « BIENTÔT »** (Apple refuse ce qui est annoncé mais absent) : les trois caisses « DÉFI À VENIR » (REQUIN, COMÈTE,
  LA RAIE) passent à l'argent du jeu ; le bouton verrouillé du menu du garage, l'annonce de l'affiche RECORD PERSO et les
  blocs « ? » des raretés à venir disparaissent ;
- **pas de voix livrées** : l'annonceur, le « ewww » et le « WOW » ne sont jamais joués dans l'app (`SANS_VOIX`) ; leurs onze
  fichiers ne sont plus copiés (comme dans l'édition POKI) ;
- **pas de marque d'autrui dans un texte** : « on vient de doubler une Ferrari » devient « une voiture de course ».

L'audit complet (« le regard du testeur d'Apple », 14/10) est dans `~/cash-car/pilotage/notes/regard-apple.md` : ses coupes
C4, C6 à C10 sont faites ; C1, C2, C3 et C5 (CHAT POP-TART, les deux caisses « Batman », ATCHOUM, les noms de vrais modèles)
attendent une décision de Sacha et Léo.

Chaque coupe **vérifie sa cible** : si le jeu a changé et qu'une cible n'est plus trouvée, la fabrication s'arrête avec un
message (elle ne passe jamais en silence). Pour le savoir **avant** de fusionner une autre branche du jeu :

```bash
npm run essai -- "/chemin/vers/une/autre/VERSION PRINCIPALE"   # joue toute la fabrication à blanc, www/ n'est pas touché
```

## Ce qui est réglé pour l'iPhone

- **Hors ligne** : Three.js r128 (`vendor/three.min.js`, identique octet pour octet à la version officielle), la police
  Press Start 2P (`assets/fonts/`) et tous les sons sont dans l'app. Aucun service worker dans l'app.
- **Plein écran** : barre d'état cachée (Info.plist `UIStatusBarHidden` + plugins StatusBar et SystemBars), indicateur
  d'accueil qui s'efface, gestes des bords différés (les pouces jouent près des bords), ni défilement, ni rebond, ni zoom.
- **Portrait et paysage** (iPhone uniquement, `TARGETED_DEVICE_FAMILY = 1`). L'encoche et l'îlot dynamique sont respectés
  par la page elle-même (`env(safe-area-inset-*)`, `viewport-fit=cover`, `contentInset: never`).
- **Aucun lien ne sort de l'app** : garde JS (`natif.js`) + garde native (`GardeNavigation` dans `JeuViewController.swift`).
- **Son** : débloqué au premier toucher et relancé après un appel ou Siri, sans jamais rallumer un son que le jeu a coupé.
- **Sauvegarde** : le jeu recopie `cashcarSave` dans Preferences (UserDefaults iOS) à chaque écriture ; si iOS efface le
  stockage web, il la relit au lancement et recharge la page (code « P0-03 » de `VERSION PRINCIPALE/index.html`).
  Vérifié au simulateur : stockage web effacé → sauvegarde retrouvée.
- **Chiffrement** : `ITSAppUsesNonExemptEncryption = NO` (pas de question export à chaque envoi).

## La fiche App Store et les deux pages qu'Apple exige

`fiche/FICHE-APP-STORE.md` : tous les champs d'App Store Connect prêts à coller (textes FR et EN, catégories, classification
d'âge, confidentialité, notes pour le testeur). `node fiche/verifier-fiche.js` contrôle les longueurs. `fiche/confidentialite.html`
et `fiche/assistance.html` sont les pages à mettre en ligne (leur adresse va dans la fiche) ; `sh fiche/poser-adresse.sh
adresse@domaine` y écrit l'e-mail d'assistance. Rien de `fiche/` ne part dans l'app.

## Icône et écran de lancement

```bash
npm run icones       # ressources/icon.svg → assets/icon-only.png (1024, sans transparence) → @capacitor/assets
```

⚠ `VERSION PRINCIPALE/icon.svg` est l'émoji 💰 d'Apple (image protégée : refus App Store). L'icône de l'app est le
mot-symbole pixel CASH CAR (`ressources/icon.svg`, `ressources/icone-1024.png`).

## Tester sans Xcode ouvert (simulateur)

En version Debug, `natif.js` écrit dans la console de Xcode : `[natif] BILAN RÉSEAU` (doit dire « 0 adresse hors de
l'app »), `[natif] POULS` (images/s, état du son, état du jeu) et toute erreur JS. La version App Store (Release)
n'écrit rien.
