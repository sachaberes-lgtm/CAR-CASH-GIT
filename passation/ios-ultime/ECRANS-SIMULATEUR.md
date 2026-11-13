# ECRANS-SIMULATEUR — passage iOS Simulator (agent SIMULATEUR, ios-ultime, 2026-11-12)

Build : `npm run sync` (www/ = jeu d037802dd, ÉDITION APP STORE, aucune coupe cassée, preparer-www.js non modifié) puis xcodebuild Debug iphonesimulator : BUILD SUCCEEDED.
`.app` : `/Users/sachaberes/cash-car/ios-ultime-mesures/dd-sim/Build/Products/Debug-iphonesimulator/App.app`
Journaux : `/Users/sachaberes/cash-car/ios-ultime-mesures/console.log` et `console-err.log` ; captures : `/Users/sachaberes/cash-car/ios-ultime-mesures/captures/` (NN-s.png = réduites, NN.png = pleine taille).
Modifs git : `app-ios/www/*`, `ios/.../Package.swift` régénérés par `npm run sync` (attendu). Rien de commité.

## Couvert
iPhone 17 Pro, iOS 26.5, PORTRAIT, FRANÇAIS puis ANGLAIS (basculé dans RÉGLAGES) :
lancement + ouroboros, intro 1.61 (sphère « TOUCHE »), écran-titre (GARAGE / ACHAT / RÉGLAGES / JOUER), garage (œil = masquer l'interface, engrenage, trophée = PROFIL + plaque, INVENTAIRE avec ses 5 onglets, MISSIONS (liste défilée), BOUTIQUE du garage avec ses 6 onglets, ACCUEIL), écran ACHAT (grille des légendaires, fiche d'une voiture, ANNULER, RESTAURER MES ACHATS jusqu'à la feuille de connexion Apple, annulée), RÉGLAGES (SON, MUSIQUE, VIBRATIONS, IMAGE, LANGUE, POUCE HAUT, FIGURES, MAIN, COMMANDES), course (tutoriel auto-école, HUD, pause, REPRENDRE, QUITTER → confirmation → écran de fin de leçon), HOME puis relance depuis la pause (revient à la pause, même processus, pas d'écran noir), un coup d'œil en PAYSAGE en course.
Police : sur tous les écrans vus, tout est en Press Start 2P (accents, €, flèches compris) ; aucun texte en police système repéré à l'écran. (Voir S-06 pour les textures 3D.)

## NON couvert (et pourquoi)
- iPhone 17e et 17 Pro Max : abandonnés sur consigne du coordinateur (Mac saturé, charge 90-180).
- Paysage : seulement la course (HUD, tutoriel, pavé de flèches) ; pas les menus, garage, boutique, réglages en paysage.
- Français de la course/pause : la course a été vue en ANGLAIS seulement (langue basculée avant). Pause, tutoriel et fin de leçon jamais vus en français.
- Pass, machine à sous / roulette, révélation de récompense, écran de mort normal (seconde chance, rejouer), NITRO en situation de jeu (un tap, non observé), figures, bouton « ENTRER UN CODE », « COPIER MA SAUVEGARDE », « EFFACER MA PROGRESSION », « AUTO-ÉCOLE +€500 », fiche des caisses / achat réel (volontairement non pressés : pas d'achat).
- Retour d'arrière-plan : seulement en pause ; pas au menu ni en course ; pas de test de verrouillage.
- Boutique : la liste des produits StoreKit est VIDE dans ce lancement (`Achats produits → {"produits":[]}`, le simulateur n'a pas la config `Produits.storekit`), donc les prix vus (€1.61, €161.00) sont des valeurs de repli et le bouton BUY n'a pas été exercé.
- Mesures de fluidité : non significatives (Mac à charge 100-180 pendant la plus grande partie du passage ; 28 i/s au début, 57-60 i/s à la fin).

## Défauts

### S-01 — gênant — iPhone 17 Pro, portrait, EN (et FR probable) — fin de leçon quittée
Le titre « DRIVING SCHOOL STOPPED » (FR : « AUTO-ECOLE INTERROMPUE », 22 signes) est plus large que l'écran : il est coupé à gauche et à droite (« IVING SCHOOL STOPP »).
Reproduire : JOUER (premier lancement, tutoriel) → pause → QUIT → confirmation → QUIT.
Capture : `captures/55-s.png` (`55.png`). Cause : `code/moteur/mobile-tactile.js:748` (le titre `ot.textContent` pour `tq9`, pas de réduction de taille / retour à la ligne) ; traduction `code/interface/traductions.js:151`. Je n'ai PAS vérifié la version française à l'écran.

### S-02 — cosmétique — 17 Pro, portrait, EN — tutoriel avec COMMANDES = FLÈCHES
Avec le réglage COMMANDES = ARROWS (changé par moi, défaut = VOLANT), le tutoriel affiche « Slide your thumb left, then right » avec une main-glisser, alors que l'écran propose le pavé de 4 flèches. Le tutoriel ne progresse pas tant qu'on ne glisse pas. Capture : `captures/44-s.png`. Cause non cherchée.

### S-03 — cosmétique — 17 Pro, portrait, EN — fiche d'une voiture (écran ACHAT)
L'image de la voiture (THE FELINE) est coupée sur le bord droit de la feuille (le capot sort du cadre). Capture : `captures/40-s.png`. Cause non cherchée.

### S-04 — cosmétique — 17 Pro, portrait, EN — garage, mode « œil » (interface masquée)
Un fragment rose (bord du bouton BOUTIQUE ?) reste visible en bas à droite quand l'interface est masquée. Capture : `captures/06-oeil-s.png`. Cause non cherchée.

### S-05 — à vérifier — 17 Pro — appuis rapprochés perdus
Dans les RÉGLAGES, plusieurs touchers envoyés à la suite sans délai (SON, MUSIQUE, VIBRATIONS ; IMAGE…) : seul le dernier agissait, chacun fonctionnait envoyé seul ; idem un RETOUR envoyé juste après ANNULER dans la feuille d'achat. Cause probable : l'outil de simulation (événements trop rapprochés) ; je n'ai pas cherché de garde anti-double-appui dans le code. À confirmer sur un vrai téléphone avant d'en faire un défaut.

### S-06 — à vérifier (lecture du code, PAS vu à l'écran) — polices système dans des textures 3D
Textures dessinées au canvas avec une police système : `code/interface/garage-salle.js:52-57` (`bold … monospace`, inscriptions du mur du garage), `code/economie/boutique.js:475-536` (« Arial Black », Impact : visuels des caisses/autocollants), `code/voitures/matieres-forme.js:480` (« Arial Narrow »), `code/economie/livrees.js:31` (« Arial Black »). Règle « une seule police » : à trancher (ce sont des décors/autocollants, pas de l'interface). Les inscriptions du mur du garage étaient illisibles aux captures.

### S-07 — cosmétique/info — console, lancement
`[warn] photo {}` et `THREE.WebGLRenderer: Context Lost` suivi de `Context Restored` pendant le premier chargement (Mac saturé : chargement 10 s, « origine→DCL 10230 ms »). Aucun écran noir durable observé. Non reproduit au second lancement. Aucune erreur JS rapportée par `[natif] erreur —`.

### S-08 — info — boutique sans produits en simulateur
`Achats produits → []` : prix de repli « €1.61 » partout et « €161.00 » pour PIZZA EXPRESS (deux formats différents). À revérifier avec la vraie liste StoreKit (Produits.storekit lancé depuis Xcode). RESTAURER MES ACHATS ouvre bien la feuille de connexion Apple (annulée ; libellé en minuscule faible, bouton petit, texte « RESTORE PURCHASES » ~7 pt).

## Vu et conforme (pas de défaut)
Écran-titre, garage, inventaire (5 onglets), missions, profil/plaque (plaque en pixel), boutique du garage (6 onglets), RÉGLAGES FR/EN complets (toutes les lignes traduites, pas de FR résiduel vu), pause, reprise après HOME depuis la pause, confirmation de sortie, HUD en paysage (rien sous l'île dynamique, pavé et NITRO accessibles). Aucun reste de mode TEST / debug repéré.
