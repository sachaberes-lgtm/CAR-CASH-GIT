# FINITION DE L'INTERFACE (2026-11-05, session « finition-interface ») — le livrable d'audit

Demande de Sacha : « vérifie chaque bouton, chaque son, ce qu'ils font, chaque animation, chaque espacement au millimètre près ».
Branche `finition-interface` (partie d'origin/main v1147). Relevé fait dans la fenêtre intégrée du navigateur de l'app (le Mac était à
une charge de 55 à 137 : le banc Chrome sans fenêtre n'a pas été lancé), `index.html?colonne=0&simu=1&garde=1`, sans `tel=1`, animations
figées pour les mesures (feuille `*{animation-duration:0s!important}` injectée), clics programmatiques `.click()` (l'interface agit au
`click`, voir `mHit` dans `moteur/mobile-tactile.js`). Audit auto = `outils/banc-ecrans/audit.js` (cibles < 44 px, chevauchements,
textes coupés, hors écran, polices, corps).

## ⚠ À LIRE D'ABORD : la charte n'est pas celle du brief de lancement
Le message de lancement parlait d'une charte « encre · blanc · or, sans néon » (`passation/BRIEF-INTERFACE.md`, charte 6). **Elle n'est pas
dans le jeu livré** : Sacha l'a REJETÉE le 14/10 (`ETAT-INTERFACE.md` : « Charte 6 noir et blanc REJETÉE ; police pixel ; LOGO
intouchable »), `garde-charte.sh` (c) l'a retirée le 18/10, `html.c6` n'est posée nulle part. L'identité livrée = **laque bleu nuit · or ·
néon rose/cyan, plaques penchées, une seule police (Press Start)** (`DA-CARCASH.md`). Cette finition a donc été faite DANS cette identité :
on n'a rien re-peint, on n'a pas supprimé les plaques penchées, la livrée tricolore sous le logo ni le « escalier » de l'accueil (décision
de Sacha du 25/10, `boutons-flottants.css` #accueilDiagonale, `translate:±30px` voulu). Si Sacha veut vraiment la charte 6, c'est un
chantier à part, pas une finition.
Autres faits : l'écran ACHAT (offres en €) est masqué dans cette version (v1146, `?achat=ancien` le rend) : non audité ; ses règles restent.

## Corrigé (un commit chacun)
| # | Écran | Mesure | Correction | Commit |
|---|---|---|---|---|
| 1 | Garage, haut à droite (œil · ⚙ · trophée) | couché : œil 632-690 / ⚙ 698-756 / trophée 764-822 mais, avant, 8 px puis **16 px** d'écart ; debout, l'œil mordait de 5 px la plaque d'argent | `ghPlace` (garage-cadrage.js) ajoutait un « +8 » en plus des 8 px de la feuille : retiré → 8 px partout, 3 formats | 816f8773 |
| 2 | Profil | la carte RANG écrivait **ANONYME** (nom de rang d'aura) alors que la règle de Sacha du 14/10 est « le chiffre d'aura seul » (`auraSansNom()`) ; 16 cartes = SERIE seule sur une 6e rangée, sous l'écran | carte RANG retirée (`plaque.js`, conditionnée par `auraSansNom()`) : 15 cartes = 5 rangées de 3 pleines | 816f8773 |
| 3 | Inventaire › FIGURES, couché | 667×375 : SALTO AVANT (88 px), SALTO ARRIERE (104 px), VRILLE PENCHEE (112 px) dans une case de 69 px : « SALTO A… » pour deux figures différentes | le nom passe sur deux lignes (`finition-ecrans.css` §7) | 0a63b3d0 |
| 4 | Toutes les touches à `translate` | `translate` absent de la transition de `.pbtn`/`.gT` : tuiles d'accueil, INVENTAIRE · MISSIONS · BOUTIQUE, bande du garage, ⏏ s'enfonçaient d'un coup | `translate` ajouté à la transition (même durée/courbe que `transform`) — §8 | 3530178c |
| 5 | « Réduire les animations » | l'écran de mort (cartes, touches), l'ouverture de la boutique, `#gvMis`, `#gName` glissaient encore ; le rideau `#wipe` était une COUPE noire (sans opacité de départ, sa transition ne jouait jamais) | coupés sous `prefers-reduced-motion` / `data-reduced-motion`, rideau en fondu de 100 ms — §9 | 3530178c |

## Mesuré et trouvé juste (rien à corriger)
- Noms des caisses (92 noms FR + EN) : aucun ne déborde du compteur du garage ni de l'œil, couché 844 (largeur du texte mesurée par Range ; le `--nL` auto-ajuste le corps).
- Anglais (couché 844) : accueil, réglages, garage, inventaire, peintures, boutique, missions, profil, plaque : 0 texte coupé.
- Zones de touche des onglets d'inventaire (34 px dessinés, 44 px tactiles par `::after{top:-5px;bottom:-5px}`) et de la jauge `#gTourne` : l'audit de rectangles les signale « PETIT » mais la zone tactile est étendue exprès (garage-hub-boutique.css:250). Laissé.
- Les « chevauchements » INVENTAIRE/MISSIONS/BOUTIQUE/JOUER du garage : boîtes englobantes de plaques penchées et de la touche en L (la BOUTIQUE est une touche ENTRÉE, voulue par Sacha le 22/10). Laissé.
- Pause couché : marges 23 / 23, RECOMMENCER / QUITTER alignés. Fin de course couché : marges 13 / 13, hauteurs 54 px, ligne GARAGE · RÉGLAGES · REJOUER au même bas.
- Réglages couché : colonnes 36 / 36 de marge ; le contenu défile (792 px dans 390) et le dock RETOUR n'en cache rien en bas (marge de défilement présente).

## Laissé, avec la raison
- **RETOUR n'a pas une seule forme** : réglages 159×56 (à gauche), profil 67×56 (flèche seule, pour laisser la place à CHANGER MA PLAQUE), plaque 137×66, inventaire/boutique 128×52 dans la colonne de droite, missions 87×56 (icône au-dessus du mot), ACCUEIL du garage 69×56. Ce sont des familles (page à gauche / colonne de droite) voulues à des dates différentes ; les harmoniser touche ≥ 6 feuilles et la cascade (`!important` en chaîne) sans pouvoir tout re-photographier ce soir : à décider avec Sacha.
- **ACCUEIL (touche maison du garage) à 6 px** en français sur les iPhone étroits (ecrans-iphone.css:29) : sous les 8 px de la règle de lisibilité ; la colonne de la grille est fixe (55 px à 667×375), 8 px y déborde (56 px de texte). Il faudrait élargir la colonne et rogner JOUER de 6 px. Laissé.
- INVENTAIRE / MISSIONS à 667×375 : « INVENTAIRE » (10 lettres × 9 px = 90 px) dans une touche de 91 px : le texte touche les bords. Même cause (corps 9 px, colonnes fixes).
- Mouvement : voir l'audit complet `passation/FINITION-animations.md` (copie du rapport de l'agent). Le tableau montre des durées d'entrée de 400-776 ms (+16/30 px) alors que la charte 6 visait 200 ms/8 px : c'est le réglage « charte 4 + section 21 » validé par Sacha et utilisé par le HUD de course (`--t-fast`, `--ease`) ; le changer = retoucher le mouvement de tout le jeu sans accord. Non fait (D1, D2, D4, D9, D10). À arbitrer : profondeur d'enfoncement unique (6 profondeurs de 1 à 7 px), REJOUER qui n'apparaît qu'à 1,08 s sur l'écran de mort.
- Changement de langue EN pendant la session : le compteur d'argent du garage garde le format français (« $ 378 513 ») jusqu'à son prochain changement (après rechargement : « $378,513 »). Rare, non corrigé.

## Sons
Audit de CODE (rien n'a été écouté : la machine est muette en essai) : `passation/FINITION-sons.md` (carte du branchement, tableau action | son | double ? , 13 défauts). Trouvé juste : tous les `ui.*` passent par `MASTER` puis le curseur EFFETS, silence respecté ; pas de double touchstart+click ; 384 clés de la banque présentes, HEAD http 200 sur `sfx.js` / `sons-banque.js`.
Corrigé (commit « Finition sons ») : (a) **les sons de bouton étaient MUETS au premier lancement de la version publiée** : seul `ui.appui` était dans la 1re moitié de la banque, les autres (tap, nav, retour, onglet, jouer…) dans `sons-banque-2.js` (6,4 Mo, chargé après `load` + idle puis décodé) ; `outils/scinde-banque.cjs` met désormais tous les `ui.*` dans la 1re moitié (+314 Ko sur 0,82 Mo) — joue à la prochaine publication ; (b) ×2 du gain : un tap PUIS un refus dans la même image quand l'action échoue → un seul son.
Laissé (mineurs du rapport, n° 2-5, 7-13) : `ui.appui` sur un bouton `aria-disabled` ; témoin EFFETS muet en pause ; `gau`/`volinv`/`incl` sonnent `nav` au lieu de `onglet` ; `gClose`/`ivFerme` sans garde ; `#garageBtn` du PC sans `ui.nav` ; palier moteur et aura qui montent à la mort muets ; CONTINUER (tap puis refus si la pub n'est pas lancée) ; `sw.js` ne précache ni la banque ni les sons : 1er lancement hors ligne muet. Ce sont des choix de mise en scène sonore à valider à l'oreille de Sacha.

## Pas fait ce soir (à reprendre)
Debout (390×844) : accueil, réglages, garage, inventaire, boutique, missions, profil, plaque relevés (0 texte coupé, 0 chevauchement non voulu) ; pause et mort debout NON relevés (la course ne s'est pas arrêtée à temps au banc). i7couche : accueil, réglages, garage, inventaire relevés ; boutique, missions, profil, plaque, pause, mort non relevés. Chargement/ouroboros, révélation, final spin, auto-école : non relevés.
