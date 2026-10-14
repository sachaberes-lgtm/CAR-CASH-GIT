# MISE À JOUR — 14/10, 23 h 05 : `ios-iphone-max` sur main b1ce69b (sons FINAL SPIN et SLIDE, ciel sans pommelé, clair de lune, LE GLACIER, plus de BANQUIER) — réinstallé et LANCÉ sur l'iPhone 13 Pro, branche poussée.
- main a retiré lui-même le bouton BIENTÔT du garage (1b35a2b) → coupe et témoin ôtés. Réglages UX 8 (une ligne ENTRER UN CODE = sauvegarde OU code secret) → l'app remontre RESTAURER UN CODE (fenêtre « Colle un code de sauvegarde. », traduite) et masque ENTRER UN CODE ; « cousin » → CODE INCONNU (vérifié).
- Accueil UX 8 (GARAGE · OFFRES · RÉGLAGES en 3 touches) : ma règle d'hier (GARAGE en 4e colonne) créait une colonne fantôme qui décalait la page → remplacée : 2 touches égales GARAGE · RÉGLAGES, debout et couché (vérifié au navigateur) ; 6 témoins sur la grille UX 8.

# MISE À JOUR — 14/10, 18 h 50 : `ios-iphone-max` sur main 1fce80c (la musique revient après 24 h d'absence) — www refait, réinstallé sur l'iPhone 13 Pro de Sacha et LANCÉ (Release, build 2), branche poussée.

# MISE À JOUR — 14/10, 18 h 35 : L'APP SUR LE JEU DE MAIN + PASSE « iPHONE AU MAX » (branche `ios-iphone-max`, Sacha : « prends la dernière version de main, optimise-la pour iPhone au max, mets-la sur l'iPhone »)
- Branche NEUVE `ios-iphone-max` (worktree `~/cash-car/iphone-max`), partie de `ios-capacitor` (non touchée) + `origin/main` a10d46c fusionnée
  (1 conflit, CLAUDE.md racine : les deux gardés ; garde burn-out OK). Rien de poussé. Pour la reprendre : fusionner `ios-iphone-max` dans `ios-capacitor`.
- `www/` = jeu a10d46c (sans carrière, sans mode facile, interface pixel). Essai à blanc vert, aucune coupe à réparer.
- NOUVEAU dans l'app (détail : `app-ios/LISEZ-MOI.md`, « Ce qui est réglé pour l'iPhone ») : jeu COMPACTÉ par esbuild (index.html 5,9 → 3,4 Mo,
  espaces et commentaires seuls) ; palier graphique EXACT par le modèle (`__ccAppareil`, Swift) ; Mode Jeu d'iOS (catégorie racing-games +
  GCSupportsGameMode) ; écran gardé allumé pendant qu'on joue (plugin `Eveil`, natif.js partie 8) ; accueil PIXEL sans OFFRES : GARAGE prend
  sa case, MISSIONS s'allonge (le trou avant ⚙ comblé, debout et couché ; 4 témoins de plus).
- VÉRIFIÉ : navigateur (jeu compacté : démarrage, accueil debout/couché, JOUER → course, 0 erreur JS) ; simulateur iPhone 17 Pro Max Debug
  (palier RÉCENT « modèle iPhone18,2 (app) », 0 adresse hors de l'app, course à 56-57 i/s, son actif, `Eveil garde` appelé).
- INSTALLÉ en Release (1.0.0 build 2, signature Apple Development) sur l'iPhone 13 Pro de Sacha (nommé « iPad » dans Xcode). Pas lancé à
  distance : téléphone verrouillé. Pas encore joué sur le vrai téléphone.
- Pas fait (à décider) : 120 Hz ProMotion (double le travail de la puce, l'échelle de qualité du jeu vise 60 i/s) ; session audio
  « ambiante » (laisser la musique du joueur) ; sons-banque.js (4,2 Mo de MP3 en base64) en vrais fichiers.

# MISE À JOUR — 14/10, 17 h 40 : LES MISES À JOUR EN DIRECT (oui de Sacha) · le jeu sera figé dans ~1 mois (Sacha)
- Sacha a accepté le nouveau contrat Apple. 18 h 15 : DÉCLARATION DSA faite (statut COMMERÇANT, choix de Sacha ; EI SIREN 104 067 996,
  adresse de l'attestation RNE, +33 6 51 96 89 02, 16180contact@gmail.com ; justificatifs chargés par Sacha) → « En cours de vérification »
  (27 pays UE). Ces coordonnées seront PUBLIQUES sur la fiche dans l'UE une fois validées.
- Module `@capgo/capacitor-updater` 8.52.1 (mode manuel, stats COUPÉES) + `natif.js` partie 7 + `publier-maj.js` (branche
  `app-maj` du dépôt public, fichiers rangés par sha256, latest.json) + `www/maj.json` (version = commit-empreinte). Manifeste de
  confidentialité : + C617.1 (FileTimestamp) et E174.1 (DiskSpace). Mode d'emploi : `app-ios/LISEZ-MOI.md`.
- ESSAI COMPLET AU SIMULATEUR (serveur local) : bonne mise à jour = 2 fichiers téléchargés sur 63, appliquée au passage en
  arrière-plan ; mise à jour CASSÉE = appliquée, écran de panne, retour seul à la bonne au bout de 60 s, puis plus jamais
  retentée (`ccMajRefus`) — après arrière-plan ET relance.
- `CURRENT_PROJECT_VERSION` = 2 (le prochain envoi). Le build 1 (sans module) n'a PAS les mises à jour en direct : ne jamais le
  soumettre. Fiche + page de confidentialité (app-ios/fiche) disent maintenant « sa seule connexion : les nouvelles versions du
  jeu » ; la page EN LIGNE (main) est à recopier avant la sortie (oui de Sacha), et les notes du testeur dans App Store Connect
  à remplacer par celles de la fiche.
- Rien n'est publié sur `app-maj` pour l'instant (la branche n'existe pas encore : 404 = « à jour » pour l'app).

# MISE À JOUR — 14/10, 14 h 15 (session « fais tout », sur le Mac)
- `assemblage` T8 `27b4199` (dernier train) fusionnée dans `ios-capacitor` (1 conflit, CLAUDE.md racine : les deux gardés). Garde burn-out OK.
- `preparer-www.js` recalé : l'accueil est en cartes 2 × 2 → sans OFFRES, GARAGE prend toute sa ligne (4 nouveaux témoins).
- Droits, dans l'app seulement (décidé par la session sur le « fais tout » de Sacha, réversible) : LA DAYTONA → LA GRANDE FLÈCHE,
  LA STRATOS → LA CALE, LA VETTE → LA RAPIÈRE, LE CHARGEUR (69) → LE FORBAN (69) (+ les noms anglais), phrase « 88 à l'heure » de
  LA DOLORÈS réécrite, MOULIN ROUGE → CABARET ROUGE. Gardés : ELDORADO, ROSSO 40, LE DÉFIEUR, ATCHOUM, le CHAT POP-TART (Sacha).
- `www/` refait + `cap sync` ; parcours VERT au simulateur iPhone 17 Pro Max en Release (démarrage, FR puis EN, auto-école, volant,
  NITRO, PASSER, course, vol, mort, garage 1/49, boutique en $, réglages sans ENTRER UN CODE, VERSION 27b4199).
- Captures 6,9 pouces FR + EN : `app-ios/fiche/captures-t8/jpg/` (JPEG, sans alpha ; hors git).
- Archive Release T8 RÉUSSIE ; export ÉCHOUÉ « No Accounts » (aucun compte dans Xcode). Adhésion payante confirmée (profil d'1 an, équipe M532TDYCH2).
- 16 h 24 : compte Apple connecté dans Xcode par Sacha → EXPORT RÉUSSI : `app-ios/build/ipa/App.ipa` (78 Mo, 1.0.0 build 1, certificat
  « Cloud Managed Apple Distribution » jusqu'au 14/10/2027). Rien d'envoyé.
- 16 h 45 : App Store Connect REMPLI par la session (Sacha connecté dans le navigateur intégré) : app « CASH CAR » créée (id 6822779484,
  SKU cashcar-ios-001, FR principal) ; version 1.0.0 ; FR + EN : promo, description, mots-clés, assistance, copyright « 2026 Sacha Beres » ;
  nom anglais = « CASH CAR - Sky Runner » (« CASH CAR » déjà pris en en-US) ; sous-titres FR/EN ; Jeux › Course + Action (Arcade n'est pas
  proposé en 2e sous-catégorie) ; droits : « Oui, contenus tiers, droits détenus » ; âge 9+ (violence cartoon peu fréquente) ; confidentialité :
  URL FR + « Données non collectées » PUBLIÉ ; gratuit, 175 pays ; Mac et Vision Pro DÉCOCHÉS.
- 16 h 57 : sur les OUI de Sacha (« oui envoie le build, main ») : BUILD 1 (1.0.0, jeu T8) ENVOYÉ à App Store Connect (« Upload succeeded ») ;
  pages corrigées poussées sur main (ea1af76) ; contact testeur rempli (Sacha Beres, téléphone, 16180contact@gmail.com) + notes, enregistré.
- ⚠ À 16 h 45-53, main a changé le jeu : PLUS DE CARRIÈRE, PLUS DE MODE FACILE, retour à l'interface PIXEL (charte 6 éteinte, ?ui=6).
  Le build 1 (T8) a encore tout ça → NE PAS le soumettre. À faire quand Sacha dit que le jeu est figé : fusionner origin/main dans
  ios-capacitor, essai (passe sur 5326836), revoir au simulateur l'accueil pixel sans OFFRES ni CARRIÈRE, refaire les captures, monter
  CURRENT_PROJECT_VERSION à 2, archiver + envoyer le build 2 ; fiche : retirer « MISSIONS ET CARRIÈRE » → « MISSIONS » (FR + EN).
- MANQUE (Sacha) : captures (APRÈS le build 2) (le navigateur intégré ne joint pas de fichier :
  Sacha les choisit, dossier « Bureau/CASH CAR captures App Store/1 - FRANCAIS » et « 2 - ANGLAIS », format 6,3" 1206×2622 OBLIGATOIRE) ;
  OUI pour l'envoi du build (refusé sans accord explicite) ; nouveau contrat Apple Developer à accepter (titulaire) ; statut de commerçant UE (DSA) ;
  OUI final pour « Ajouter pour vérification ». URL de confidentialité EN pas encore posée.
- Reste : Sacha se connecte à App Store Connect (navigateur intégré : la session ne tape jamais de mot de passe) ; création de l'app et
  de la fiche ; envoi (`xcodebuild -exportArchive` avec destination upload, ou `sh archiver.sh --envoyer`) seulement sur son OUI.
- Petit défaut du jeu vu au passage (pas une coupe d'app) : « CETTE SEMAINE » n'est pas traduit dans la boutique en anglais.

# PASSATION — session APP STORE (app iPhone CASH CAR) — Mac → PC de Sacha, 14/10 vers 13 h 15

Branche : `ios-capacitor` (dossier `app-ios/` = projet Capacitor 8, appId `com.sachaberes.carcash`, équipe Apple `M532TDYCH2`,
v1.0.0 build 1, iPhone seul, iOS 15+). L'audit « regard d'Apple » est recopié à côté : `passation/regard-apple.md`.
Protocole des sessions sur le PC : `origin/pilotage-notes:PROTOCOLE-PC.md`.

## ⚠ CE QUI EXIGE UN MAC (le PC ne pourra PAS le faire)
- `npx cap sync ios`, toute construction Xcode, le simulateur iOS, l'archive (`app-ios/archiver.sh`), l'export de l'IPA et l'envoi à
  Apple (Xcode ou Transporter). Les captures d'écran au simulateur aussi (sinon : sur un vrai iPhone 6,9 pouces).
- La connexion du compte Apple dans Xcode (Réglages › Accounts) : au 14/10 12 h 17, la liste des comptes de Xcode était VIDE → l'export
  échoue (« No Accounts », pas de certificat « iOS Distribution »). Voir « La suite » n° 4.

## CE QUI SE FAIT AILLEURS (PC, navigateur, n'importe où)
- `node app-ios/preparer-www.js` (la fabrication de `www/` et son essai à blanc) : Node seulement, marche partout.
- La fiche App Store (`app-ios/fiche/FICHE-APP-STORE.md`, `node app-ios/fiche/verifier-fiche.js`) et sa saisie dans App Store Connect
  (navigateur, compte de Sacha).
- Les pages de confidentialité et d'assistance (`app-ios/fiche/*.html`) et leur mise en ligne.
- Vérifier l'édition App Store au navigateur : servir `app-ios/www/` (ou un essai `--sortie`) avec un petit serveur HTTP, taille téléphone.

## FAIT
- **Édition App Store** = `www/` fabriqué par `app-ios/preparer-www.js` depuis `VERSION PRINCIPALE/` (jamais à la main). Coupes « dans
  l'app seulement » (le jeu web n'est pas touché) : mode TEST des caisses et de la carrière coupé ; tout le vrai argent (€, 100 pubs) et
  les 3 caisses « à venir » (REQUIN, COMÈTE, LA RAIE) passent à l'argent du jeu ; page OFFRES et ses portes masquées ; bouton
  « BIENTOT » masqué ; voix non livrées (SANS_VOIX) ; « Ferrari » retiré d'une phrase ; code COUSIN (ENTRER UN CODE) coupé (règle 3.1.1) ;
  le trou d'OFFRES dans la rangée de l'accueil comblé ; tout `<script src>` local copié d'office (figures.js manquait). Chaque coupe
  ÉCHOUE exprès si sa cible change (`une()` = exactement 1 occurrence, plus des « témoins »). Essai sans toucher `www/` :
  `node preparer-www.js --essai "<dossier VERSION PRINCIPALE>" [--sortie <dossier à garder>]`.
- `www/` actuel = jeu **assemblage T4 `4febc49`** — PARCOURS VERT au simulateur (iPhone 17 Pro Max, 14/10 8 h) : démarrage hors ligne
  (0 adresse hors de l'app), fr-FR → jeu en fr et en-US → en, accueil, auto-école (PASSER = 2 appuis en 3 s, voulu), course, mort,
  garage 1/49, boutique tout en $, réglages sans ENTRER UN CODE. `assemblage` T4 est fusionnée dans `ios-capacitor`.
- `Info.plist` : nom affiché CASH CAR, `CFBundleLocalizations` en + fr (sans ça l'app démarrait en anglais sur un iPhone français).
- **Archive Release réussie** sur T4 (Mac seulement, `app-ios/build/CASH-CAR.xcarchive`, hors git) ; **export de l'IPA échoué** (compte).
- **Fiche App Store** complète FR + EN (`app-ios/fiche/FICHE-APP-STORE.md`) : nom, sous-titre, promo, description, mots-clés, catégories,
  classification d'âge (9+ conseillé : « violence de dessin animé rare/légère »), confidentialité « aucune donnée collectée », notes
  pour le testeur d'Apple. Longueurs vérifiées par `verifier-fiche.js`.
- **Pages EN LIGNE** (oui de Sacha, commit `cc61d24` sur `main`, dossier `pages-app/` + 3 lignes de `vercel-build.sh`) :
  https://car-cash-git.vercel.app/confidentialite.html et https://car-cash-git.vercel.app/assistance.html (contact 16180contact@gmail.com).
- Captures du parcours (6 × 1320×2868) : sur le Mac seulement (`app-ios/fiche/captures/`, hors git) — à refaire de toute façon sur la base finale.

## EN COURS / PAS FINI
- **Essai sur `assemblage` T7 `d8af462` : ÉCHOUE (voulu)** — le témoin « grille de la rangée de l'accueil (debout) » a perdu sa cible :
  l'accueil a changé après T4. À faire : servir un essai au navigateur, regarder la rangée (CARRIÈRE · MISSIONS · voiture · ⚙),
  adapter ou retirer la retouche CSS « rangée de l'accueil » (bloc `<style id="appStore">` de `preparer-www.js`) et ses 2 témoins.
- Correction des pages faite dans `app-ios/fiche/` (commit `f6c061a` : plus de réglage « Voix », GRAPHICS en anglais) mais **PAS remise
  en ligne** : il faut recopier les deux fichiers dans `pages-app/` sur `main` → seulement avec le OUI de Sacha.

## LA SUITE, PAR PRIORITÉ
1. Sur la base finale (`origin/assemblage`) : essai à blanc, réparer les coupes qui ont perdu leur cible (une coupe devenue inutile parce
   que le jeu a retiré la chose lui-même → la RETIRER, pas la réparer), vérifier au navigateur, puis `node preparer-www.js` et commit.
2. Mac : `npm run sync`, une construction simulateur, le parcours (démarrage, langue FR/EN, course, mort, garage, boutique, réglages),
   le jeu ouvert seulement le temps de chaque test (une nuit, simulateur + navigateurs = charge 534 → Mac à genoux).
3. Mac : captures 6,9 pouces (1320×2868) sur la base finale : accueil, course dans les nuages, ville de nuit, NITRO, garage.
4. Mac : Sacha connecte son compte dans Xcode (⌘, › Accounts › « + » › Apple Account ; son équipe M532TDYCH2 doit apparaître ; quitter
   Xcode pour qu'il l'écrive), puis `sh app-ios/archiver.sh` (archive + export local, RIEN d'envoyé).
5. App Store Connect (navigateur, Sacha connecté) : créer l'app (fiche § 1), coller les textes, URLs des pages, questionnaires.
6. ENVOI (`sh archiver.sh --envoyer`) : **seulement sur le OUI de Sacha dans la session, juste avant** (« on sort plus tard » : pas de
   TestFlight pour l'instant).
7. Droits encore ouverts (audit § 1) : ATCHOUM (Disney/Cars), noms de vrais modèles (ELDORADO, LA DAYTONA, LA STRATOS, LA VETTE, LE
   CHARGEUR/69, LE DÉFIEUR, LA DOLORÈS « 88 à l'heure », ROSSO 40), MOULIN ROUGE, origine de `kaching`/`compteuse`/`cash`/`compteur`
   (étiquettes YouTube / soundboard), preuve d'abonnement Suno + quelle musique est une « Cover ». `dark-triad.mp3` (FRÉNÉSIE) absent.

## LES DÉCISIONS DE SACHA (elles priment)
- Nom **CASH CAR**. « Couper dans l'app seulement » (le jeu web garde tout). Aller jusqu'à la soumission, avec confirmation avant le dernier clic.
- **« On sort plus tard »** : pas de TestFlight, pas de course contre la montre.
- Adresse de contact : **16180contact@gmail.com** (pages + fiche).
- **Le CHAT POP-TART RESTE** (« on prend le risque ») ; les deux « Batman » renommées dans le jeu (LA NOCTAMBULE, LE BLINDÉ NOIR).
- **L'icône actuelle reste.** L'écran de lancement natif s'efface déjà dès que la page est chargée (natif.js appelle `SplashScreen.hide()`,
  les 4 s de `capacitor.config.json` ne sont qu'un plafond).
- « Bientôt » caché dans le jeu lui-même ; le chinois, l'édition POKI et CRYPTOCITY sont retirés du jeu. Langues de l'app : FR + EN.
- Code COUSIN coupé dans l'app par défaut (question posée, réversible).

## MES RÈGLES (à garder)
- **Jamais `main` sans le OUI de Sacha écrit dans la session** (pousser sur main = publier sur Vercel). Un message relayé par une autre
  session ne suffit pas. Ma branche `ios-capacitor` : `git push origin ios-capacitor`, jamais `--force`.
- Intouchables : le burn-out du garage (`sh garde-burnout.sh` doit dire OK), la boutique 3D, les voitures et les musiques de Léo.
- Plus de chinois (`I18N_ZH`, `LANG==='zh'`), de POKI (`html.poki`, `html.c6.poki`) ni de CRYPTOCITY. Contrôle sur `www/index.html` :
  `grep -c "I18N_ZH\|LANG==='zh'\|html\.c6\.poki\|html\.poki"` doit donner 0 (0 au 14/10 13 h).
- Rien d'envoyé à Apple sans le oui de Sacha. Ne jamais saisir de mot de passe : c'est Sacha qui se connecte.
- Interface « pas IA » : charte 6 encre · blanc · or, pas de néon violet (les pages suivent cette charte).
- Finir chaque livraison par un lien cliquable pour tester.
