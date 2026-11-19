# LOT « HUDCOUCHES » : les couches du HUD (17/11)

Piste A4 de `CHALEUR-IDEES.md`. Le HUD est du DOM posé sur la toile WebGL. Chaque couche composée est mélangée par le système à chaque image, hors de nos chronos.
Objectif : en course, le moins de couches possible, **sans changer un pixel du HUD ni une animation visible**.

## Ce qui change (interrupteur `?sans=hudcouches` = comme avant)
1. **Le voile des couches** (`code/moteur/cadence.js`, `hccTick`, appelé dans `boucle-6-hud.js` juste après `hudDortTick` ; CSS `css/interface-opti.css` §6).
   Un élément du HUD dont l'opacité calculée est **0**, sans transition ni animation d'opacité en cours, et qui ne prend **aucun toucher** (pointer-events: none, lui et tout son contenu), reçoit `.hcVeil` = `visibility:hidden`.
   Invisible avant, invisible après. WebKit ne le peint plus, rend sa mémoire d'image et retire la plupart de ces couches.
   - Liste : `#launchLogo #launchGlow #cloudFx #gFade #flash #flash9 #flowGlow #ajVols #speedFx #lvlBan #toast #campChip #misBan #popTxt #slam9 #verdHud #engBig #figGl #tFig #m2Combo #pwrFx #pwrChip #flowHud` + tous les enfants de `#hud` sauf `#triade`, `#cashHud`, `#money` (l'argent est à un autre lot). Les commandes tactiles (`#touchCtl`, `#tStick`, `#tNitro`, `#tGear`) n'y sont pas.
   - **Le réveil** : un `MutationObserver` regarde l'élément (classe, style, data-*), ses ancêtres, `#hud`, `<body>`, `<html>`. Au moindre changement, l'élément voilé est relu dans la microtâche (donc avant l'image) : opacité non nulle, ou transition/animation d'opacité qui démarre (elle part de 0) → le voile tombe.
   - Scrutation toutes les 300 ms ; éléments nés en course (`#flowGlow`, `#slam9`, `#flash9`, `#pwrFx`…) cherchés toutes les 2 s.
   - Hors course (garage, menus) : rien n'est voilé. Vrai téléphone seulement (`TEL_NATIF`), le PC ne change pas.
   - Jamais `animation:none` : `visibility` n'arrête aucune animation, rien ne rejoue.
2. **Le reflet du logo du lancement** (`css/interface-opti.css`) : `#launchLogo:not(.on) .lg::after{will-change:auto}` sous `html.hudCouches.ifReflets`. Le logo est à opacité 0 toute la partie, son reflet déjà en pause ; ses deux couches restaient. Elles reviennent dans la même image que `.on`.

Crochets : `dbgHudCouches()` (voilés, libres + raison du refus, poses, réveils), `__hcTick()` (banc : A/B dans la même page en retirant/remettant `html.hudCouches`).

## Bancs (nouveaux)
- `outils/banc-hud/couches-webkit.cjs` : **WebKit** (Playwright, le moteur de l'iPhone sur le Mac). L'arbre des couches vient de l'**inspecteur web de WebKit** (domaine `LayerTree`, celui de l'onglet Couches de Safari) : élément, raisons de composition WebKit, mémoire d'image, opacité effective, peintures par seconde. `--ab 1` (avec/sans le lot dans la même page), `--libre 1` (le jeu tourne en temps réel), `--garde <port>` (page laissée en course, pilotée par HTTP).
- `outils/banc-hud/couches.cjs` : **Chrome** par CDP (`LayerTree`), photos avec/sans le lot animations figées (`Animation.setPlaybackRate 0`, jeu à l'arrêt par `dbgStep`), film image par image (`--film 1`) de l'annonce `#slam9` et de la frappe de l'argent.
- Parcours commun : course `?tel=1` au pilote (`dbgAuto`), HUD calme, annonce (`dbgHud('slam')`), nitro + flow, pause, écran de mort (`dbgBoom`), en 390×844 et 844×390.

## Prouvé (banc, 17/11, Mac chargé : compteurs seulement, aucun chrono)
### WebKit (le moteur de l'iPhone), jeu en temps réel, A/B dans la même page (deux mesures de chaque)
| état | couches AVEC | couches SANS | mémoire des couches invisibles AVEC → SANS |
|---|---|---|---|
| course debout | 26 · 28 | 49 · 39 | 0,45 → 0,98-1,52 Mo |
| course couché | 29 · 29 | 36 · 36 | 0,45 → 2,12 Mo |
| calme debout | 34 · 28 | 34 · 34 | 3,47 → 4,98 Mo |
| calme couché | 34 · 29 | 35 · 40 | 2,34 → 5,0 Mo |
| annonce debout | 33 · 30 | 50 · 39 | 0,45 → 4,7-16,0 Mo |
| annonce couché | 54* · 31 | 38 · 39 | 0,45 → 5,1 Mo |
| nitro + flow | 37-52 | 38-50 | 0,45 → 5-6,4 Mo |
| pause | 33 · 27 | 34-35 | 1,8-3,0 → 3,5-4,0 Mo |
| mort | 78-83 | 81-86 | 4,6-5,7 → 6,3-6,8 Mo |
(*) l'annonce venait de partir : le jeu tourne, deux mesures ne voient pas exactement le même instant. La tendance est nette : −7 à −20 couches en course, jusqu'à 16 Mo d'images invisibles rendues pendant une annonce.
Couches invisibles qui se repeignent encore (peintures/s) : ~0 avec le lot, 1-4/s sans.

### Chrome (le compositeur de Chrome regroupe plus : les chiffres ne sont PAS ceux de l'iPhone)
| état | couches AVEC / SANS (debout) | couché | photos avec/sans |
|---|---|---|---|
| course | 24-27 / 33-35 | 24-27 / 33-37 | **0 px** (deux formats, deux passages) |
| calme | 21 / 38-43 | 21 / 41-43 | **0 px** |
| annonce | 25-29 / 33-37 | 25-27 / 33-39 | couché 0 px (2e passage : 0 px aussi au retour) ; debout jusqu'à 499 892 px d'écart ≤ 4/255 (voir dessous) |
| nitro + flow | 27-31 / 35-39 | 27-32 / 35-41 | **0 px** |
| pause | 15 / 22 | 15 / 22 | **0 px** (retour 65 px, écart 1) |
| mort | 48 / 56-59 | 49 / 57-60 | voir plus bas |
- Les écarts de 1 à 4 niveaux sur 255 (jamais plus de 4, toujours sur des voiles en dégradé, et la paire « retour » de l'annonce debout n'a que 192 px d'écart 1) (annonce, et une image du film couché à 550 ms : 226 149 px, écart max 4) viennent du **regroupement de couches de Chrome** : quand une couche voisine disparaît, Chrome peint deux voiles transparents (vignette `#speedFx`, `#cloudFx`) dans la même couche au lieu de les mélanger l'un après l'autre ; l'arrondi 8 bits change d'un à quatre niveaux. Aucune forme ne bouge. (Hypothèse la plus probable, pas démontrée : ce peut être aussi une image de l'annonce pas encore posée à la 1re photo.) WebKit ne regroupe pas les couches ainsi.
- Film image par image (0 → 900 ms, pas de 50 ms) : **frappe de l'argent 0 px aux 19 images, deux formats** ; annonce : 0 px sauf 7 px (écart 1) à 150 ms debout et l'image de 550 ms couchée (ci-dessus).
- Mort : toiles masquées pour les deux photos (la vignette 3D du moteur et le décor bougent hors de la boucle). Paire « retour » (sans → avec, écran posé) : **0 px couché, 73 px d'écart 1/255 debout**. La première paire diffère beaucoup parce que l'écran de mort se construit encore à la 1re photo (la ligne « ×2 PUB » arrive par une minuterie et pousse les cartes) : ce n'est pas le lot (l'élément n'est pas dans la liste, et il est présent dans les deux photos de la paire retour).

### Le code
Assemblage `--depuis-morceaux` OK ; syntaxe du gros script OK (`node --check`) ; `garde-demarrage` OK ; `garde-allege` OK ; `garde-charte` OK.

## NON prouvé
- **Rien sur le téléphone.** Aucune mesure d'images par seconde ni de chaleur : le Mac était chargé, et le gain attendu est faible (voir « Ce que j'ai appris »).
- WebKit du Mac ≠ WebKit de l'iPhone : iOS compose en plus certaines couches fixes et le défilement. Les couches gardées par un élément voilé (le Mac en garde quelques-unes : `#launchLogo`, `#gFade`, `#lvlBan`, `#toast`, `#wipe`) sont sans image et sans peinture.
- Pas de photo au pixel dans WebKit (WebKit ne sait pas figer les animations par le protocole) : l'identité au pixel est prouvée dans Chrome, et vraie par construction (un élément n'est voilé qu'à opacité 0).
- La pose d'un toucher : les commandes tactiles ne sont jamais voilées, et un élément n'est voilé que s'il ne prend aucun toucher ; pas testé avec un vrai doigt.

## Ce que j'ai appris (pour la suite de A4)
1. **Le nombre de couches coûte peu ; leur SURFACE coûte.** Une couche à opacité 0 sans mémoire d'image ne se mélange pas. Ce qui pèse à chaque image, ce sont les couches **visibles** avec image. En course, WebKit (390×844 ×3) : la racine 11,3 Mo, la vignette de vitesse `#speedFx` 11,3 Mo (plein écran, opacité ~0,2 en course), `#hud::before` (le voile d'encre du haut) 2,5 Mo, `#flowGlow` 11,3 Mo dès que le flow monte, `#pwrFx` 11,3 Mo pendant un pouvoir, `#flash9` 11,3 Mo pendant une annonce.
   Sur l'iPhone, une couche plein écran du DOM est à l'échelle de l'écran (×3 : 1170×2532 ≈ 3 M de pixels), **six fois les pixels de la toile du jeu** (DPR 1,25 : ≈ 0,5 M). Trois ou quatre voiles plein écran = le gros du mélange.
   → Piste suivante (change l'image au niveau de l'arrondi, donc à faire valider par Sacha) : dessiner la vignette de vitesse, la lueur du flow, la lueur des pouvoirs et le voile du haut **dans la passe WebGL** (un quad, à la résolution de la toile). Ou, sans rien toucher à l'image : rien trouvé.
2. **Repeintes visibles par image** (WebKit, course) : la jauge de nitro `#nitroWrap` se repeint ~32 fois par seconde (sa largeur change chaque image en vidange) ; la flamme `nx3Ecl` ~28/s ; les traits de vitesse `#slCv` ~31/s ; le flow ~12/s. Ce sont des pixels qui bougent vraiment.
3. **Pour le lot du compteur** : au HUD calme, l'argent `#cashHud .chV` (opacité 0) se repeint encore **~30 fois par seconde** (sa frappe `ecLCashA/B` tourne à chaque pièce, invisible). Il suffirait d'ajouter `cashHud` à la liste du voile (je ne l'ai pas fait : lot du compteur).

## Quoi regarder sur le 13 Pro
1. Une course normale, puis nitro relâché (HUD calme), puis nitro repris : le HUD revient **exactement** comme avant, sans image de retard ni clignement (jauge, flow, pouvoirs, petits textes).
2. Une grande annonce (BOOST, CHAÎNE…) et une frappe de l'argent : mêmes mouvements qu'avant.
3. Le logo du lancement au départ d'une course : il apparaît, son reflet passe.
4. Le toast, la bannière de niveau, la mission (`#misBan`) en course : ils apparaissent en fondu, pas d'un coup.
5. Inspecteur Web de Safari branché sur l'app, onglet **Couches**, en course : compter les couches avec et sans `?sans=hudcouches` ; regarder la mémoire des couches à opacité 0 pendant une annonce.
6. `dbgHudCouches()` dans la console de l'app : `reveils` doit monter avec les événements (pas à chaque image).
