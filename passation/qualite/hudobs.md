# LOT « HUDOBS » : l'observateur du voile sans lecture, une retaille par pivot (17/11)

Donnée de départ : la boîte de vol de la séance de Sacha, build 120 (`~/cash-car/ios-ultime-mesures/vol/vol-1117-1137.json`, analyse `python3 outils/banc-perf/analyse-vol.py <vol> --v 1dfe4a3`).
Toute la séance à l'état thermique CRITICAL (20 i/s, QL 6). Sacha : « quelques freezes sur la map jade, sinon c'est bien ».

## A. L'observateur du voile des couches (`code/moteur/cadence.js`, section « L'OBSERVATEUR SANS LECTURE ») — `?sans=hudobs` = l'observateur d'avant
Vu dans le vol : le rappel `O:hccObs` > 8 ms **23 fois en 449 s** (278 ms, pire 26 ms) et **20 fois en 110 s** (232 ms, pire 27 ms).
Cause : à chaque changement de `<html>`, `<body>` ou `#hud` (plusieurs fois par seconde), il relisait `getComputedStyle` + `getAnimations` + `getKeyframes` de chaque élément voilé, en levant les voiles entre deux lectures (recalcul de style forcé à répétition).

Ce qui change :
1. **Le rappel ne lit aucun style.** Une table « nœud observé → éléments voilables sous lui » est faite à l'ajout (`hcoLie`). Une mutation qui peut changer une opacité lève le voile des éléments concernés, sans vérifier : lever un voile sur un élément à opacité 0 ne change aucun pixel, et il tombe dans la microtâche, avant l'image.
2. **Filtre des mutations** (sans lecture de style) :
   - `class` : seules comptent les classes qui apparaissent dans une règle CSS posant opacité, animation, transition, display, visibility ou une variable `--x` (table `HCO.tok`, faite une fois par tranches de 2 ms aux passages de la pose, refaite si une feuille s'ajoute). Notre propre `hcVeil` est ignoré.
   - `style` : la géométrie seule (largeur de la jauge, position, transform, marges) est ignorée ; une opacité posée à 0 aussi. Sur un ancêtre, seules les variables `--x` comptent (l'opacité d'un parent ne change pas l'opacité calculée de l'enfant).
   - `data-*` : réveille (sélecteurs `html[data-hud]`…). Le reste : ignoré.
3. **La pose étalée** (`hcoTick`, toutes les 300 ms ; 100 ms quand un réveil vient de lever des voiles) : d'abord les éléments qu'un réveil vient de libérer (jusqu'à 24, 1,5 ms au plus au-delà de 6), puis 6 au tour par tour. Toutes les lectures d'abord, puis les écritures : un seul recalcul. Sauté si l'image en cours a déjà pris 10 ms ou si la précédente a duré plus de 70 ms (au plus 4 fois de suite).

Crochet : `dbgHudObs()` (rappels, enregistrements, ignorés, levés, lectures, passages, sautés, classes qui comptent) ; `dbgHudObs(1)` remet l'histogramme des mutations, `dbgHudObs(2)` le rend.

## B. Une seule retaille par pivot (`code/rendu/palier-appareil.js`, « UNE SEULE RETAILLE PAR PIVOT » ; `code/moteur/mobile-tactile.js`, `reflow`) — `?sans=retaille1` = comme avant
Vu dans le vol (course 10:33, pivot en course) : `R:()=>{retailleRaf=0;…` 3 fois > 8 ms (125 ms, pire 59) et `T:function(){ if(innerWidth<1…` (le `reflow` de 280 ms) 67 ms.
Cause : un pivot envoie plusieurs `resize` (WKWebView en retard, plus celui que renvoie la vue relue `vpFrais` du lot compteur) ; chacun faisait `renderer.setSize` + `composer.setSize` (three.js réalloue MÊME à taille égale) puis rejouait une image entière (`retailleImage`).
Ce qui change (vrai téléphone) : `resize`, `reflow` et la vue relue passent par le même rAF (`retailleDemande` → `retailleFait`), qui ne réalloue que si la taille ou le ratio appliqués changent (par `applyDPR`, qui ne touche qu'à ce qui change), et ne rejoue l'image qu'alors. Taille égale : la caméra seule.
Crochet : `dbgRetaille()` (faites, sautées, demandes, images) ; `dbgRetaille(1)` (banc) compte les vraies réallocations (`renderer.setSize/setPixelRatio`, `composer.setSize/setPixelRatio`), `dbgRetaille(2)` remet à zéro.

## Banc
`outils/banc-hud/hudobs.cjs` (Chrome, édition téléphone, jeu en temps réel ; compteurs, aucun chrono) : 4 états de 6 s (course nitro, annonces répétées, HUD calme, nitro repris), par seconde : rappels, éléments relus, recalculs de style FORCÉS par le code du voile (trace Chrome : `UpdateLayoutTree` portant une pile hcc*/hco*), dont dans l'observateur ; l'invariant « voilé ⇒ opacité 0 » relu à CHAQUE image juste avant la peinture (rappel d'un ResizeObserver, après tous les rAF et leurs microtâches). Puis 4 pivots en course, `resize` retenu 100 ms comme WKWebView.
`node outils/banc-hud/hudobs.cjs --q "sans=hudobs,retaille1"` (avant) / sans `--q` (après).

## Prouvé (banc Chrome, 17/11, Mac chargé : compteurs seulement, aucun chrono)
### A. L'observateur — `hudobs.cjs`, 3 courses AVANT (`sans=hudobs,retaille1`) et 4 APRÈS, 6 s par état (moyenne [min-max])
| état | rappels/s avant → après | éléments relus/s | recalculs forcés DANS l'observateur (par 6 s) | recalculs forcés par le voile /s | voiles en moyenne (par image) |
|---|---|---|---|---|---|
| course nitro | 7,5 → 6,3-10,8 | **125 → 22** | **4 [3-6] → 0** | 4,0 → 3,3 | 8,7 → 8,6 |
| annonces (une / 1,5 s) | 12,4 → 10,9 | **144 → 32** | **14 [13-15] → 0** | 5,8 → 3,2 | 8,8 → 6,6 (7,3 avec la relecture à 100 ms) |
| HUD calme | 7,5 → 7,2 | **103 → 23** | **27 [14-36] → 0** | 6,5 → 2,8 | 18,0 → 16,6 |
| nitro repris | 9,2 → 6,7 | **132 → 20** | **4,7 → 0** | 4,6 → 3,2 | 9,6 → 9,2 |
- Le rappel de l'observateur ne force plus AUCUN recalcul de style (0 dans 16 états mesurés), et ne lit plus aucun style (par construction). Le reste des recalculs forcés est la pose étalée : un par passage (3,3/s), au lieu d'un par élément relu.
- **Invariant « voilé ⇒ opacité 0 »** relu à CHAQUE image juste avant la peinture : **0 violation** sur ~2 400 images par course, 8 courses (≈ 19 000 images, ≈ 170 000 éléments voilés relus).
- Le prix : pendant les annonces, `<body>` change de classe (classes qui comptent) et tous les voiles sous lui tombent ; ils reviennent au passage suivant (100 ms). En moyenne 7,3 voiles au lieu de 8,8 pendant une annonce toutes les 1,5 s.
- Ce qui réveille le plus en course (histogramme, `dbgHudObs(2)`) : `#speedFx` style (opacité de la vignette), `#cloudFx` style, `<body>` class, `#flowHud` class, `#flash9` class. La largeur de la jauge et les compteurs sont ignorés (filtre géométrie).
### Le voile ne change pas l'image (bancs du lot hudcouches, rejoués avec le nouveau code)
- `couches.cjs --ab 1 --film 1` (Chrome, 390×844) : photos avec/sans voile **0 px** en course, calme, annonce, nitro + flow, pause ; retour de l'annonce 192 px d'écart 1/255. Film : annonce 0 px sauf 5 px (écart 1) à 150 ms et une image à 500 ms (497 626 px, écart **3/255**) ; argent 0 px sauf une image à 250 ms (497 093 px, écart **3/255**). Même nature que ce que hudcouches a relevé (regroupement des couches de Chrome, ≤ 4/255, aucune forme ne bouge). Mort : 1re paire différente (l'écran se construit), retour 73 px écart 1 — comme avant.
- `couches-webkit.cjs --ab 1` (WebKit) : couches avec/sans le voile : course 34/37, calme 28/34, annonce 30/38, nitro + flow 44/44, pause 28/35 ; mémoire des couches invisibles 0,45-3,5 Mo avec / 1,5-5,9 Mo sans. Le lot hudcouches garde son effet. Même banc avec l'ANCIEN observateur (`sans=hudobs`), couches avec le voile : course 35, calme 34, annonce 56 (l'annonce venait de partir), nitro + flow 43, pause 38, mort 73 (nouveau : 34 · 28 · 30 · 44 · 28 · 67). La mort à 67-73 avec / 47 sans vient de l'écran qui se construit entre les deux mesures, pareil avec l'ancien observateur.
### B. La retaille — `hudobs.cjs`, 4 pivots en course par course, `resize` retenu 100 ms
| | renderer.setSize | composer.setSize | images rejouées |
|---|---|---|---|
| avant vpFrais (`sans=retaille1,vpfrais`, 4 pivots) | 1 | 1 | 1 |
| build 120 (`sans=retaille1`, 12 pivots) | **2-3** (moy. 2,75) | 2-3 | 2-3 |
| après (défaut, 16 pivots) | **1** | **1** | **1** |
- Par pivot : 5 demandes (resize, vue relue, reflow…), 1 retaille faite, 2-3 sautées (taille déjà appliquée : la caméra seule). La toile finit à la bonne taille (844×390 / 390×844) à chaque pivot.
- `compteur.cjs` (défaut et `sans=retaille1`) : mêmes tailles de l'argent au pivot, au retour, à la vue périmée, à la reprise (identiques ligne à ligne).
- `pivot-planete.cjs` : 0 image coupée pendant l'écriture et la boule prête (×4), au noir, au menu ; à l'explosion 14 images (12 avec `sans=retaille1`) : la boule qui éclate déborde de l'écran par nature, pareil avant/après.
- `pivot.cjs --encoche 200` (menuCadre) : la caisse en place (écart ≤ 0,05) 183-200 ms après chaque pivot, 0 erreur.
### Le code
Assemblage `--depuis-morceaux` OK ; `node --check` du gros script OK ; `garde-demarrage` OK ; `garde-allege` OK ; `garde-charte` OK.

## NON prouvé
- **Rien sur le téléphone.** Les chiffres sont des compteurs dans Chrome ; le coût en ms du rappel sur le 13 Pro à l'état critique reste à lire dans la prochaine boîte de vol (le rappel `O:hcoObs` ne devrait plus apparaître dans « rappels > 8 ms »).
- Les autres causes des gels de la séance ne sont pas de ce lot : dans la course 10:25 (449 s), `R:function(){r1(function(){ if(PORTV.att!==tok)…` coûte plus (7 fois, 689 ms, pire 321 ms) que `hccObs` (278 ms), et 181 gels « hors boucle, non attribués » (18,9 s). `T:function(){if(!gameOver)engSwapArme();}` 69 ms une fois.
- La table des classes qui comptent est faite par tranches au début de la course : pendant les ~premières secondes, tout changement de classe réveille (sûr, juste moins économe).
- WebKit du Mac ≠ WebKit de l'iPhone (voir hudcouches.md).
- Le chemin `?sans=rotation` (ROT_DOUX éteint) n'a pas été rejoué avec retaille1.

## Quoi regarder sur le 13 Pro
1. La map JADE (et toutes) en course longue : moins de petits accrocs ? La boîte de vol : `O:hccObs` / `O:hcoObs` ne doit plus figurer dans « rappels > 8 ms ».
2. Pivoter en pleine course (debout ↔ couché) : une seule saccade courte, l'image jamais noire ni étirée, le compteur d'argent à la bonne taille.
3. Les annonces (BOOST, CHAÎNE…), le toast, la bannière de niveau, la mission : ils apparaissent comme avant, en fondu, sans clignement.
4. La planète de l'intro pendant un pivot ; l'accueil (la caisse en place après le pivot).
5. Console de l'app : `dbgHudObs()` (rappels, ignorés, levés), `dbgRetaille()` (faites 1 par pivot, sautées 2-3).
