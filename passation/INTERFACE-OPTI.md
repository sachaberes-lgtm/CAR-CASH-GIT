# INTERFACE-OPTI — le coût de l'interface sur iPhone (12/11/2026)

Branche `interface-opti` (partie d'`origin/ios-ultime` v1530), chantier `~/cash-car/interface-opti`. Rien sur `main`, rien fusionné dans `ios-ultime`, pas de build iOS.
But : faire baisser le travail du processeur et de la puce que coûte l'interface, **sans rien changer à son dessin**.

## Comment c'est mesuré
- **Banc Chrome** `outils/banc-interface/banc.cjs` (Chrome sans fenêtre, muet, 390×844 ×2, agent iPhone, `?tel=1&palier=2`) : la sonde `sonde.js` est posée avant le jeu
  (animations visibles / cachées, éléments filtrés, écritures du DOM et lectures de mise en page par image, avec la ligne d'index.html) ; `/cout?s=4` ajoute les
  métriques de Chrome (recalculs de style, mises en page, peintures, rastérisation). `/selecteurs` donne le temps par sélecteur CSS.
  `node outils/banc-interface/banc.cjs` puis `curl -s 127.0.0.1:9883/accueil` · `/course` · `/cout?s=4` · `--data-binary 'js' /ev` · `/fin`.
- **Banc WebKit** `outils/banc-interface/webkit.cjs` : le moteur de l'iPhone (WebKit de Playwright, révision 2388 déjà installée) sur le jeu servi en 9881
  (`python3 -m http.server 9881 --bind 127.0.0.1 --directory "VERSION PRINCIPALE"`). Mesure = **temps libre du fil principal** : tours d'une boucle de messages
  en 1,2-1,5 s (plus = mieux), en A/B **dans la même page** (on bascule une classe ou on gèle des animations), répété 5 à 8 fois, médiane.
- Le Mac était chargé (charge 4 à 11, d'autres sessions) : les durées sont bruitées, les comptes (animations, peintures, écritures) ne le sont pas.
  Un seul navigateur de banc à la fois. Pas de son (sauvegarde `sfx/mus/vox` à faux).
- ⚠ Rien n'a été mesuré sur le vrai téléphone. WebKit sur Mac ≠ puce de l'iPhone : les gains se lisent en relatif.

## Ce qui coûtait, par écran (Chrome, avant ; style = temps de recalcul des styles)
| Écran | Recalculs/s | Style | Peintures/s | Ce qui tourne |
|---|---|---|---|---|
| Course, HUD calme | 63 | 48,8 ms/s | 223 | 6-7 boucles infinies du HUD **invisibles** (opacité 0) : barre de nitro, pwrFx, reflet du logo de lancement |
| Course, nitro tenu (HUD visible) | 64 | 38-41 ms/s | 170 | boucles visibles de la jauge nitro (reflet, rayures, bout) + pwrPuls |
| Écran de mort | 69 | 57,1 ms/s | 162 | 5 boucles du HUD **cachées** + 6 visibles (halo, flottement, badge, lingots) |
| Pause | 62 | 21,9 ms/s | 38 | 3 boucles du HUD **cachées** + reflet de REPRENDRE |
| Boutique du garage | 70 | 41 ms/s | 138 | 15 reflets `lgShine` sur des plaques **hors écran** ; `photoChoix` lit ~2,6 rectangles par image tant que des photos attendent |
| Missions | 64 | 10,8 ms/s | 218 (raster 358) | trame de l'hologramme plein écran en `background-position`, balayage, chevrons |
| Garage | 63 | 22,5 ms/s | 169 | 14 boucles visibles ; `garAplomb` lit des positions 4 fois par seconde |
| Inventaire | 63 | 9,3 ms/s | 137 | 4 boucles visibles (chevrons, fouet) |
| Accueil | 58 | 8,2 ms/s | 240 | 7 reflets `lgShine` du logo or (CASH CAR + JOUER) — **sans eux : 0 recalcul, 0 peinture** |
| Achat (offres) | 55 | 8,4 ms/s | 37 | rayons, flottement, un reflet |
| Réglages | 0 | 0 | 0 | rien |

Dans WebKit, ce qui compte vraiment (temps libre en tours, gelé contre en marche) : le **balayage du reflet du logo or** (accueil : 30 k pendant le balayage
contre 48 k gelé, soit 40 % du fil principal), la **trame de MISSIONS** (geler gmTrame : +50 %). Le reste est faible ou dans le bruit : boucles visibles du HUD de
course (aucun écart), reflet `k4Lingot` des gros boutons (≈ 5 %), boucles de l'écran de mort (≈ 5 %), du garage (≈ 8 %), d'ACHAT et de l'inventaire (< 8 %),
reflets hors écran de la boutique (aucun écart : WebKit ne peint pas ce qui est rogné, et les phases immobiles d'un reflet ne lui coûtent presque rien).
Les sélecteurs CSS ne sont pas en cause (16 ms/s répartis sur 1 333 sélecteurs, aucun ne domine). Les écritures du DOM en course (~1,5 par image) visent
surtout des éléments en `display:none` (panneau d'aura, barre de style) : presque gratuites.

## Ce qui a été corrigé (avant → après, interrupteur)
1. **LE HUD ENDORMI** — `moteur/cadence.js` (`hudDortTick`, appelé dans `boucle-6-hud.js` après `hudCalmeTick`), `css/interface-opti.css` §1. `?sans=huddort`, `dbgHudDort()`.
   Les boucles infinies d'un élément du HUD devenu invisible (HUD calme, feuille de pause, écran de mort) sont gelées par la classe `.hudDortP`
   (`animation-play-state:paused` sur lui et ses `::before/::after` — **jamais `animation:none`**, rien ne rejoue ; et pas `Animation.pause()`, qui volerait la
   main à la feuille pour toujours : essayé, le reflet du logo de lancement tournait de nouveau caché après un réveil). Seulement si l'élément est invisible
   (display, opacité 0 sur lui ou un parent, ou sa propre visibility) ET que toutes ses animations sont des boucles (une annonce n'est jamais gelée). En HUD calme
   la course tourne : on ne gèle que sous les conteneurs que le HUD calme force à opacité 0 (liste de `hud-leger.css` §4, **sans la barre de flow**).
   Réveil : un observateur des classes du `<body>` (`hudCalme`, `hTp`, `dead`) réveille tout dans la microtâche du retrait, avant la peinture (vérifié : 0 élément
   gelé à l'instant où `hTp` puis `dead` sont ôtées ; pendant le 3-2-1 de la reprise `paused` reste vrai mais le HUD est revenu — c'était un défaut de la 1re
   version, corrigé en v1534). Vrai téléphone seulement (`TEL_NATIF`).
   **Chrome, même charge, sans → avec** : course HUD calme 40,9 → 15,7 ms/s de style (peintures 217 → 111/s), pause 20,9 → 6,1, mort 19,3 → 12,6.
   **WebKit** : HUD calme 41,6 k → 45,8 k tours (bruité) — gain plus modeste que dans Chrome.
2. **LES REFLETS SUR LEUR COUCHE** (iOS) — `css/interface-opti.css` §2, classe `html.ifReflets`. `?sans=reflets`.
   `will-change:transform` sur les pseudo-éléments qui portent un reflet animé en `background-position` : `.lg::after` (logo or : accueil, garage, intro, logo du
   lancement), `#gShopBas::after` (BOUTIQUE), `#gvMis::before/::after` (conducteurs de MISSIONS). Seul le reflet se repeint, plus la lettre et son relief (cinq
   ombres de texte dont une floue). **WebKit, accueil, pendant le balayage : 30,4 k → 45,7 k tours** (gelé ≈ 48,6 k), 6 paires. Photos figées au même instant :
   **identiques au pixel** (accueil et garage, 3 instants, scène 3D masquée). iOS seulement : dans Chrome l'antialiasing du reflet bouge (jusqu'à 46/255 sur ses bords).
3. **LA TRAME DE MISSIONS DÉPLACÉE PAR LA PUCE** (iOS) — `page/ecrans-garage.html` (`<i id="gmTr">`, premier enfant de `#gMis`), `css/interface-opti.css` §3,
   classe `html.ifTrame`. `?sans=trame`. La trame de l'hologramme (`#gMis::before`, gmTrame) défilait en `background-position` : WebKit repeignait tout l'écran
   à chaque image. Elle passe sur `#gmTr::before`, déplacée par `transform` (0 → 64 px en 6 s, même vitesse) ; vignette et voile restent dans `::before`, immobiles.
   Même ordre de peinture (après `::before`, avant les fils et les cartes). **WebKit : 46,5 k → 55,7 k tours** (médiane de 8 paires, machine chargée, 6 sur 8 en
   faveur). Photos : mêmes lignes, au plus **1 pixel d'écran (⅓ px CSS) d'écart par endroits, écart max 6/255** — pas strictement au pixel, imperceptible (une
   trame à 4 % d'opacité qui défile ; ⅓ px = 31 ms de défilement). La variante PASSE (`#gMis.pv`) et les paliers 0-1 (trame figée) ne changent pas.
   Coût : une couche de 390 × 908 px ×3 (~13 Mo de mémoire graphique) tant que MISSIONS est ouvert.

Commits : `0a3db1ae3` (1) · `372cd2a48` (2) · `b94c10e1f` (3) · `3f636c280` (réveil du HUD endormi). Cache `cashcar-v1534`. Les 4 gardes passent.

## Ce qui reste, et pourquoi
- **Boucles visibles du HUD de course** (jauge nitro : nbReflet, nbRaye, nbBout, nitroPlein, hmSec…) : chères dans Chrome, **aucun écart mesurable dans WebKit**.
  Les rendre moins chères voudrait les redessiner (pseudo-éléments glissés) : risque pour le pixel sans gain prouvé sur iPhone. Laissé.
- **`k4Lingot`** (reflet des gros boutons : REPRENDRE, boutons de l'écran de mort, JOUER du garage) : ≈ 5 % pendant le balayage dans WebKit. Il anime le fond du
  bouton lui-même : l'isoler oblige à restructurer chaque bouton. Gain trop faible pour le risque.
- **Garage** (chevrons `gChevFile` en couleur, étincelles, panier) : ≈ 8 % au total dans WebKit, chaque boucle dans le bruit.
- **Lectures de mise en page** : `garAplomb` (4 Hz, garage) et `garLibre` (cache 250 ms, accueil) forcent au plus 4 recalculs par seconde ; `photoChoix` lit des
  rectangles à chaque image seulement tant que des photos de voitures attendent (passager). Mineur.
- **Reflets hors écran de la boutique** (15 boucles) : aucun gain dans WebKit. Laissé.
- **Auto-école** : pendant le tuto, ~10 boucles infinies de `#coach` tournent à opacité 0 entre deux leçons (vu à la première course d'un joueur neuf). Pas dans
  les racines du HUD endormi (le coach réapparaît sans changement d'état du HUD) : à traiter avec un réveil lié à ses propres classes.
- **À confirmer sur le 13 Pro** : les trois correctifs n'ont été vus que dans WebKit/Chrome sur Mac. À regarder dans le prochain build : accueil (reflet du logo),
  MISSIONS (trame), et la reprise après pause (la jauge nitro doit bouger dès que le HUD revient).
