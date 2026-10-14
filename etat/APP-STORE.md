# APP STORE — état au 14/10, 6 h 10 (session seule, 0 agent, 0 build)
- 9 commits sur `ios-capacitor` depuis 8aea71a (non poussés), arbre propre : édition App Store, essai à blanc + témoins, fiche,
  pages confidentialité/assistance, CFBundleLocalizations en+fr, plus de « BIENTÔT », voix non livrées, `archiver.sh` (jamais lancé).
- PAGES EN LIGNE (Sacha : « oui publie », 14/10) : https://car-cash-git.vercel.app/confidentialite.html et
  https://car-cash-git.vercel.app/assistance.html — HTTP 200, lisibles au téléphone. Commit cc61d24 sur origin/main (avance rapide,
  `pages-app/` + 3 lignes de `vercel-build.sh`, rien du jeu). Notées dans la fiche.
- Décisions du 3 h 15 – 3 h 30 prises en compte : PAS de coupe C1 (CHAT POP-TART reste), PAS de coupe C2 (renommées sur `assemblage`).
  Quand `.gVerrou`, `gMystere`, les voix, les 3 caisses « à venir » et « CLASSEMENT MONDIAL » disparaîtront du jeu aux prochains
  trains, je RETIRE mes coupes devenues sans cible (je ne les répare pas).
- Reste ouvert côté droits : C3 (ATCHOUM), C5 (noms de vrais modèles), MOULIN ROUGE, origine de kaching/compteuse/cash/compteur.
- Après chaque train : essai à blanc sur `assemblage`. Créneau `xcodebuild` attendu après le DERNIER train (≈ 30 min) : www/ refait,
  build simulateur (langue, course, mort, 0 réseau), captures, archive.
- 6 h 10, essai sur `assemblage` T2 (4007550) RÉUSSI et regardé au navigateur (taille téléphone) : accueil sans cadeau ni OFFRES (le cadeau
  est couvert dans l'app), boutique sans € ni OFFRES ÉPHÉMÈRES, ENTRER UN CODE masqué et le code COUSIN coupé (Q 6 h 10), figures.js ajouté
  (404 dans l'app sinon). Coupes ôtées car sans cible : annonce BIENTOT de l'affiche, gMystere. Icône : pas touchée. Chinois : non déclaré.
- Écran de lancement : il s'efface DÉJÀ dès que la page est chargée (natif.js appelle SplashScreen.hide() ; les 4 s ne sont qu'un plafond).
- 7 h 03 — CRÉNEAU T3 : essai à blanc sur `assemblage` 0a329be RÉUSSI (toutes les coupes trouvent leur cible, aucune à retirer cette fois ;
  figures.js copié). Construction simulateur Debug RÉUSSIE (iPhone 17 Pro Max, iOS 18.7). Parcours : démarrage OK, écran de lancement puis
  logo du jeu, BILAN 0 adresse hors de l'app, langue fr-FR → jeu en fr, accueil sans OFFRES ni cadeau, course lancée (auto-école, 20-30 i/s
  au simulateur, aucune erreur JS). PAS FAIT faute de temps : mort, garage, réglages, anglais — le bouton PASSER de l'auto-école n'a pas
  répondu à deux touchers du simulateur (à revoir, peut-être le toucher simulé). ⇒ PAS TOUT VERT : `www/` NON régénéré (remis comme dans git),
  PAS d'archive. Détail vu : une case vide dans la rangée de l'accueil (CARRIÈRE · MISSIONS · 🚗 · [trou de OFFRES] · ⚙) — coupe à lisser.
  Il me faut un 2e créneau (~20 min) pour finir le parcours, puis www/ + archive.
- 7 h 15 — trou de la rangée de l'accueil corrigé dans la fabrication (commit local, vérifié au navigateur debout et couché). Rien d'autre
  ne bouge tant que je n'ai pas de 2e créneau : il reste mort, garage, réglages, anglais au simulateur, puis www/ pour de bon + archive.
- 8 h 02 — CRÉNEAU RENDU (simulateur éteint, constructions finies). TOUT VERT sur `assemblage` T4 4febc49 : démarrage hors ligne (0 adresse),
  fr-FR → fr et en-US → en, accueil sans trou, PASSER ×2 (il faut 2 appuis en 3 s : pas un bug), course, mort, garage 1/49, boutique en $,
  réglages sans ENTRER UN CODE. Coupes recalées sur T4 (plus de POKI). `assemblage` fusionnée dans `ios-capacitor`, www/ refait pour de bon
  (86883b6). ARCHIVE Release RÉUSSIE (`app-ios/build/CASH-CAR.xcarchive`) ; export IPA ÉCHOUÉ : aucun compte Apple connecté dans Xcode
  (Sacha : Xcode › Réglages › Comptes). Rien d'envoyé à Apple, rien de poussé.
- 8 h 05 — (message de PILOTAGE « créneau ouvert jusqu'à 8 h 19 » reçu APRÈS coup : tout était déjà fait et rendu à 8 h 02.) Captures du
  parcours rangées (6 images 1320×2868, la taille 6,9 pouces d'Apple) dans `app-ios/fiche/captures/`, hors de git. Rien ne tourne.
- 11 h 47 — EXPORT relancé sur l'archive T4 (destination « export » : rien n'est envoyé) → ÉCHEC « No Accounts » : Xcode (ouvert) n'a
  enregistré AUCUN compte Apple (liste des comptes vide dans ses préférences, 2 min d'attente). Le seul certificat de la machine est
  « Apple Development: Sacha Beres », pas de « iOS Distribution ». À Sacha : Xcode › Réglages › Comptes doit montrer son Apple ID ET
  l'équipe M532TDYCH2 ; puis je relance l'export (1 commande, 1 min). Rien d'envoyé à Apple. Nouvelle archive sur T5 : au créneau de BUDGET.md.
- 12 h 17 — EXPORT relancé (avec -allowProvisioningUpdates, destination « export », RIEN d'envoyé) → même ÉCHEC « No Accounts ».
  Preuve : le fichier des réglages de Xcode (~/Library/Preferences/com.apple.dt.Xcode.plist, écrit pour la dernière fois à 11 h 46) a
  une liste de comptes Apple VIDE. Xcode 26.6 est ouvert. À SACHA, EXACTEMENT :
   1. Dans Xcode : menu Xcode › Settings… (⌘,) › onglet « Accounts ».
   2. La colonne de gauche doit montrer son Apple ID. Si elle est vide : bouton « + » en bas › « Apple Account » › Continue › se connecter
      (mot de passe + code à 6 chiffres) jusqu'à voir son Apple ID dans la liste.
   3. En cliquant dessus, à droite, « Team » doit montrer son équipe (ID M532TDYCH2, rôle Admin ou Account Holder). Si une ligne
      rouge « Session expired / Sign in again » apparaît : cliquer « Sign In » et refaire la connexion.
   4. Quitter Xcode (⌘Q) pour que le compte soit écrit sur le disque, puis me prévenir : je relance l'export (1 min, sans envoi).
  NB : se connecter sur developer.apple.com dans un navigateur NE suffit PAS ; c'est le compte dans Xcode qui compte.
- 13 h 20 — PASSATION FAITE (ordre de Sacha relayé par INTERFACE). Branche poussée : `origin/ios-capacitor` = `16a6ac5` (avance rapide,
  sans force, pas main). Passation : `passation/APP-STORE.md` (+ `passation/regard-apple.md`) à la racine de la branche. www/ embarqué =
  assemblage T4 4febc49 (vert au simulateur) ; essai sur T7 d8af462 en échec voulu (témoin de la rangée de l'accueil) ; garde burn-out OK ;
  0 chinois / POKI dans le jeu embarqué. Export IPA toujours bloqué (aucun compte dans Xcode). SESSION ARRÊTÉE : la suite se fait sur le PC.
