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
