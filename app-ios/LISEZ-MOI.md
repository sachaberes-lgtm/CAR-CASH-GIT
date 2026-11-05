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

## Les mises à jour en direct, suite (2026-11-05, jury final — Fable : IOS-06, IOS-28, IOS-08, IOS-09)

Quatre corrections dans `natif/natif.js` (partie 7), `capacitor.config.json` et `.gitattributes` (à la racine du dépôt) :

- **Le feu vert part à `DOMContentLoaded`** (IOS-06), plus seulement à `__gameReady` (la fin du script de 9,6 Mo). Si le script a été
  lu et exécuté sans erreur non rattrapée, `notifyAppReady` est envoyé ~0,3 s après `DOMContentLoaded` ; `__gameReady` le redonne
  (sans effet) et lance la vérification des mises à jour. Une app tuée pendant son chargement ne bannit plus la version.
  `appReadyTimeout` passe de 60 à **120 s** (un SE 2020 à froid, 100 Mo copiés par Capgo au premier passage).
- **Deux échecs avant le bannissement** (IOS-06) : `ccMajEssaiN_<version>` compte ; au premier échec la version est retéléchargée et
  retentée au lancement suivant ; au second elle part dans `ccMajRefus` pour de bon. (`ccMajRefus` reste la liste des versions à ne
  plus jamais retenter ; pour la vider sur un téléphone : effacer les données de l'app, ou publier une nouvelle version.)
- **Une mise à jour ne s'applique JAMAIS en pleine course** (IOS-28) : `U.next()` (appliqué par Capgo au passage en arrière-plan,
  donc au milieu d'une course si un appel arrive) n'est plus utilisé. Une version téléchargée est seulement notée (`ccMajPrete` :
  id + version) ; **au lancement suivant**, avant que le jeu ne se charge, `natif.js` la pose avec `U.set()` (qui recharge sur-le-champ).
  Conséquence à connaître : une mise à jour publiée se voit au **deuxième** lancement de l'app (le premier la télécharge, le second la
  pose), jamais pendant une session.
- **Fins de ligne** (IOS-08) : `.gitattributes` impose `* text=auto eol=lf` (binaires en `-text`). Le PC avait `core.autocrlf=true` :
  `index.html` sortait en CRLF dans la copie de travail, et `preparer-www.js` / `publier-maj.js` hachaient les fichiers tels qu'ils
  sont sur le disque — des empreintes différentes PC/Mac pour un même contenu, donc des « nouvelles versions » fantômes et 17 Mo
  retéléchargés par tous les iPhone pour rien. Après un `git pull` sur une copie qui avait des CRLF : `git add --renormalize .`
  (le dépôt n'a changé que 4 fichiers de passation) puis `git checkout -- .` ne doit rien montrer. Contrôle avant de publier :
  `git ls-files --eol | grep -v "w/lf\|w/-text\|w/none"` doit être vide dans `app-ios/www/`.

### Signer les mises à jour (IOS-09) — procédure, à faire par Sacha (rien n'est fait dans le dépôt)

Aujourd'hui rien ne signe les fichiers que l'app télécharge : Capgo vérifie l'empreinte sha256 de chaque fichier du manifeste (contre
une corruption de téléchargement), pas l'origine du manifeste. La sécurité repose sur le compte GitHub de Sacha et sur la branche
`app-maj` du dépôt public. Dans l'ordre :

1. **Compte GitHub** : activer l'authentification à deux facteurs avec une clé matérielle ou une application (pas le SMS) ; révoquer les
   jetons d'accès inutilisés (Settings › Developer settings › Personal access tokens).
2. **Protéger la branche `app-maj`** (Settings › Branches › Add rule, pattern `app-maj`) : « Restrict who can push » (Sacha seul),
   « Do not allow force pushes », « Do not allow deletions ». `publier-maj.js --envoyer` pousse en avance rapide : il continue de marcher.
3. **Chiffrement Capgo (le vrai verrou)** : sur le Mac, dans `app-ios/`, `npx @capgo/cli key create` crée une paire de clés
   (`.capgo_key` privée — à garder HORS du dépôt, dans le trousseau — et `.capgo_key.pub`). Mettre la clé publique dans
   `capacitor.config.json` › `CapacitorUpdater.publicKey`, puis reconstruire l'app (c'est une mise à jour **App Store**, le build 3).
   À partir de là, chaque `publier-maj.js` doit chiffrer la session de chaque fichier avec la clé privée (`npx @capgo/cli bundle
   encrypt` sur l'archive, ou l'option `--key` du module) et publier `sessionKey`/`checksum` dans `latest.json` : à faire dans
   `publier-maj.js` le jour où le build 3 est soumis, avec un essai complet au simulateur (une version non chiffrée est alors REFUSÉE
   par l'app : c'est le but). Tant que le build 2 est en ligne, ne pas poser `publicKey` : les mises à jour cesseraient.
4. **Revenir en arrière** = republier l'ancien jeu : une version republiée a la même empreinte, l'app l'accepte.
