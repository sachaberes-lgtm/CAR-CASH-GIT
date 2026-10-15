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
- **pas de code secret** (règle 3.1.1) : le code COUSIN ne débloque rien ; la ligne ENTRER UN CODE des réglages est masquée et
  RESTAURER UN CODE (une sauvegarde, rien d'autre) reste visible, sa fenêtre ne parle que de sauvegarde (le jeu de main, UX 8,
  a fondu les deux en une ligne ; l'app garde l'état d'avant) ;
- **l'accueil sans OFFRES** : sous MISSIONS, deux touches égales GARAGE · RÉGLAGES au lieu de trois (debout et couché) ;
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
- **Le jeu compacté** (14/10, passe « iPhone au max ») : `preparer-www.js` retire commentaires et espaces de la page et des scripts du
  jeu avec esbuild (`minifyWhitespace` seul : aucun nom raccourci, aucun code réécrit, `dbg*` intacts) — `index.html` 5,9 → 3,4 Mo :
  moins à lire au démarrage, moins de mémoire, des mises à jour en direct plus légères. `vendor/` et `natif.js` ne sont pas touchés.
  `node preparer-www.js --sans-compacter` : la page telle quelle (lire une erreur à sa vraie ligne dans Safari). Sans esbuild
  (`npm install` pas fait), la page part non compactée avec un avertissement.
- **Le palier graphique exact** : `JeuViewController.swift` pose `window.__ccAppareil = {modele, palier}` avant tout script (iPhone 6s → X :
  0 · XS/XR/11/SE 2 : 1 · iPhone 12 et après : 2), branché dans `PAL` par `preparer-www.js`. Fini le petit banc du processeur qui, couru
  téléphone chaud ou en économie d'énergie, classait un iPhone récent « ancien » pour 7 jours. La mesure en course (« appris en
  course ») prime toujours. En Debug, le bilan de 15 s dit « palier RÉCENT (modèle iPhone14,2 (app)) ».
- **Mode Jeu d'iOS** : `LSApplicationCategoryType = public.app-category.racing-games` + `GCSupportsGameMode` — iOS 18+ donne la priorité
  au processeur et à la puce graphique pendant qu'on joue, et calme le reste du téléphone.
- **Le gouverneur thermique** (15/10, mesuré sur l'iPhone 13 Pro : « ultra saccadé quand on va vite ») : à pleine vitesse la puce tourne à
  fond, l'iPhone chauffe en 1-2 min et iOS bride processeur ET puce (le même calcul passe de 2 à 15-30 ms par image) — la course
  s'effondrait de 60 à 15-30 images/s irrégulières. Le plugin natif `Eveil` suit `ProcessInfo.thermalState` ; `natif.js` (partie 10) :
  « chaud » (2) → jeu calé à 30 images/s STABLES (sa cadence CAD), « critique » (3) → en plus le cran de qualité le plus bas ; revenu à
  « normal/tiède », le jeu reprend la main. Et `preparer-www.js` autorise la cadence 30 calée au palier RÉCENT aussi (le jeu web la
  réserve aux paliers 0 et 1) : 2 s d'images en retard → 30 régulières, retour à 60 dès que la marge revient.
- **Le banc de mesure sur le vrai iPhone** (build Debug, rien ne change pour un joueur) :
  `xcrun devicectl device process launch --console --terminate-existing --device <id> com.sachaberes.carcash -- -ccBanc` → une course
  jouée toute seule (bac à sable, pilote, NITRO), 3 min d'endurance, une ligne « [banc] » toutes les 2 s (images/s, à-coups, vitesse,
  calcul par image, appels, triangles, cadence, chaleur) et un bilan par 30 s. `-ccCarte volcan` force la carte, `-ccPalier 1` le
  palier, `-ccDissection` éteint une famille d'objets à la fois (flou, transparents, additifs, particules, pixels ÷2, cran le plus bas).
  Stockage web JETABLE : la vraie sauvegarde est lue, jamais écrite. ⚠ Mesurer téléphone FROID et débranché : la charge et les bancs à la
  suite le mettent en « critique », où plus rien ne se mesure.
- **L'écran reste allumé pendant qu'on joue** (plugin natif `Eveil` + `natif.js` partie 8) : un pouce posé sans bouger sur le volant ou
  la NITRO n'éteignait plus l'écran au bout de 30 s ; rendu à iOS après 3 minutes sans toucher ou en arrière-plan.

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
