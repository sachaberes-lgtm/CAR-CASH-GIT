# TRANSITIONS-UI — le mouvement de l'interface sur iPhone (13/11/2026)

Branche `transitions-ui` (partie d'`origin/ios-ultime` v1535), chantier `~/cash-car/transitions-ui`. Rien sur `main`, rien fusionné dans `ios-ultime`, pas de build iOS.
Demande de Sacha : « soigner les transitions dans l'interface, animation, plus de fluidité ». C'est une finition du mouvement, pas une refonte : aucun écran,
aucune position, aucun texte, aucune courbe ni durée d'animation n'a changé. Les trois correctifs déplacent du TRAVAIL et tiennent la CADENCE.

## Comment c'est mesuré
- **Le volet Browser intégré n'a pas servi aux mesures** : la session n'était affichée dans aucune fenêtre, le volet était caché, la page tournait en arrière-plan
  (aucun `requestAnimationFrame`, `document.timeline` figé à 0 : toutes les animations CSS restent à t = 0). On ne peut rien y chronométrer.
- **Banc Chrome sans fenêtre** d'`interface-opti` (`outils/banc-interface/banc.cjs --http 9891 --cdp 9892 --cmd 9893`), 390×844 ×2, agent iPhone, `?tel=1&palier=2`
  (TEL_NATIF et ALLEGE vrais), muet. Il rend de vraies images (60 i/s nettes au repos).
- **Processeur ralenti ×4** (`Emulation.setCPUThrottlingRate`, ≈ un iPhone chaud) pendant chaque mesure, par un second client CDP.
- **La sonde** (`__sonde`, posée dans la page) : intervalles entre images (rAF), tâches longues (`PerformanceObserver longtask`), temps JS du geste, et pour chaque
  animation qui DÉMARRE pendant la transition : cible, propriétés animées (images clés), durée, délai.
- **Profil** CPU (Profiler CDP, échantillon 0,2 ms) calé sur l'instant du tap par un repère (`__MARQUE`, 4 ms d'attente active) : qui travaille dans quelle fenêtre.
- **Images 3D rendues** : `gl.clear` comptés une fois par image d'écran, par tranches de 200 ms (preuve de la cadence des menus).
- ⚠ **Le Mac était chargé** (charge 4 à 23, d'autres sessions) : les durées absolues sont bruitées. Les preuves ci-dessous reposent sur des COMPTES (images
  rendues, tâches longues pendant une fenêtre, instant où un travail démarre), qui ne dépendent pas de la charge. Outils : scratchpad de la session (`sonde.js`,
  `t.cjs` ralenti ×4, `p.cjs` profil fenêtré) — à recopier dans `outils/` si on veut les garder.

## L'inventaire des transitions (avant correctif)
Les écrans du routeur et les fenêtres animent déjà **`translate`/`opacity`/`scale`** (composables) : aucune entrée/sortie n'anime `top/left/width/height`.
Durées cohérentes (charte) : sortie 150 ms (`k6SortAvant/Retour`), entrée 400 ms + décalages en escalier (`--i`), fond 150 ms, voile `k4Voile` 420 ms ;
la sortie est toujours plus courte que l'entrée.

| Transition | Ce qui anime (propriétés, durée) | Ce qui travaille pendant | Ce qui clochait |
|---|---|---|---|
| Accueil ↔ réglages / modes (`mGo`) | sortie translate+opacity 150 ms ; entrée `k6Avant/Tombe/Retour` 400 ms + 70-274 ms ; `k6DuBord` (◀) | `mFill` + reflow forcé : 8-30 ms (×4) au tap, le 1er passage le plus cher | **cadence** : le monde 3D derrière (caméra qui recadre la caisse, `MENUV.cadre`) retombait à 30 i/s 0,35 s après le doigt, et à **15 i/s d'emblée** si la transition partait sans doigt |
| Accueil → BOUTIQUE (offres, `#mShop`) | idem + boîtes `shBxIn` 380 ms | **1re photo de caisse (`shopPhotoTour` → `vitrinePhoto` → buildCar, compilation, readPixels, toBlob) à 380 ms, en pleine entrée** | **à-coup** : tâche de 713 ms (×4) au milieu de l'entrée ; **9 images** dans les 700 premières ms |
| Accueil → garage (volet `ecranWipe`) | balayage pixel doré (canvas 2D, rAF) 150 ms + 280 ms ; tiroirs `hubMonte`/`gvMonte` | `openGarage` SOUS le volet (2-3 images de 33 ms, cachées) | rien de visible ; cadence à 30 i/s pendant la fin du volet qui se lève |
| Garage → INVENTAIRE / MISSIONS (`gModeVa`, `garMode`) | `atGrille` 400 ms, `k6Avant` ; missions `gmIn` (**filter + clip-path**) 400 ms + 140-860 ms | 1re ouverture : 100-146 ms (×4) au tap (construction de la grille, une fois) ; puis photos | photos possibles pendant l'entrée ; la 2e ouverture ne coûte plus que 7 ms |
| JOUER → départ (accueil-garage : volet, puis lâcher ; atelier : lâcher direct) | volet ; lâcher 3D (`GAR.go`) ; voile chaud `#gFade` (.08 s on / .18 s off) ; HUD `hmDroite/hmHaut` | piste bâtie SOUS le volet (`newTrack`, 547-940 ms ×4 — caché, bien) ; à la fin du lâcher `closeGarage`+`start`+`buildCar` (~170 ms ×4) | **à-coup** : le voile se retirait sur un minuteur de 60 ms et découvrait les premières images de la course, les plus lourdes (167 / 117 / 67 ms ×4) |
| Pause (⏸) | HUD opacity 180-420 ms ; `tpIn` translate+opacity 420 ms ; lignes `k6Monte` | 65 ms (×4) au tap | rien |
| Reprise (3-2-1) | panneau 140 ms ; `slamCompte` transform+opacity ; HUD opacity 450 ms | 1re image de course ~100 ms (×4) à la fin du compte | rien de mesurable à corriger (scène figée pendant le compte, 10 i/s voulu) |
| Mort → écran de mort | `m6File` (titre : translate, scale, **filter blur+brightness**, 850 ms) ; cartes `k6Carte` ; `k4Clac` (**filter brightness**) ; compteur | 95 ms (×4) juste avant l'entrée ; ensuite `engVigRender` (moteur en vignette) lit la puce à chaque image (`getBufferSubData`) | voir propositions |
| REJOUER, retour accueil | volet + promesse (`rejoueAttend`), voile blanc + serpent noir au-delà de 350 ms | piste bâtie sous le volet | non mesuré cette fois (même mécanique que le volet, déjà tenue) |
| Fenêtre d'achat (`shopPop`) | `k4Voile` + plaque | — | couverte par la fenêtre de transition |

## Ce qui a changé (avant → après, preuve, interrupteur)
Commit `640b8d3b8` (cache v1536). Les 4 gardes passent.

1. **LA FENÊTRE DE TRANSITION — 60 i/s jusqu'au bout** — `code/moteur/cadence.js` (`transUI`, `transCad`, `hcGeste`). `?sans=transcad`, `dbgTransUI()`.
   `transUI(ms)` est ouverte par `mGo` (800 ms ; 1 600 pour l'écran de mort), le volet (400 ms à la pose, 750 ms au lever), `garMode`/`gModeVa` (700 ms),
   la fermeture des réglages de pause (400 ms), la fenêtre d'achat (600 ms) et le retrait du voile du départ (500 ms). Tant qu'elle court, la cadence des
   menus rend 60 i/s (hcGeste), comme sous le doigt.
   **Preuve (images 3D rendues par 200 ms après `mGo('set')` sans doigt)** : avant `3 3 3 3 3 3 3` (15 i/s tout du long) → après `13 12 12 12 3 3 3`
   (60 i/s pendant l'entrée, puis le repos revient). Ne change que la cadence de la scène 3D derrière le menu ; l'ordinateur n'a pas de repos à 15 i/s.
2. **LES PHOTOS DE CAISSES APRÈS L'ENTRÉE** — `code/economie/boutique.js` (`shopPhotoTour`), `code/interface/atelier-ferme.js` (`photoCalme` : photoTour du garage,
   de l'inventaire et la prise d'avance du menu). Téléphone seulement (`ALLEGE`). `?sans=transphoto`.
   **Preuve (banc ×4, accueil → BOUTIQUE)** : avant, 1re photo à 418 ms (tâche de 713 ms en pleine entrée), **9 images** dans les 700 premières ms, 829 ms de
   tâches longues dans l'entrée → après, 1re photo à 821 ms (entrée finie), **22 images**, 110 ms de tâches longues (le tap lui-même). Les boîtes arrivent
   ~0,4 s plus tard qu'avant (elles pulsent en attendant, comme avant). La rafale sous le volet (`photoRafale`) n'est pas touchée.
3. **LE VOILE DU DÉPART TIENT JUSQU'À UNE COURSE FLUIDE** — `code/interface/garage-rendu.js` (`departVoileLeve`). Téléphone seulement (`ALLEGE`), `?sans=departvoile`,
   `dbgDepartVoile()`. Le voile chaud se retire quand deux images d'affilée sont arrivées en moins de 40 ms (au moins 60 ms après la pose comme avant, au plus
   450 ms ; filet 700 ms si l'onglet est caché). Même couleur, même opacité, même fondu de 0,18 s : il dure seulement le temps que la course soit prête.
   **Preuve (banc ×4, Mac très chargé)** : avant, la 1re image après le retrait durait 33 ms (une image sautée pendant le fondu), 2 essais sur 2 ;
   après, retrait à 234 ms, 24 images de 17 ms dans les 400 ms qui suivent. Le gain réel se lira sur le téléphone chaud, où ces premières images sont 3 à 5 fois plus longues.

## Propositions NON codées (elles changeraient l'allure ou demandent le téléphone)
- **Titre de l'écran de mort (`m6File`) et chiffre qui claque (`k4Clac`)** : animent `filter` (flou 12 px + luminosité ×2,4 sur un texte à ombres multiples,
  850 ms). WebKit peut le jouer sur la puce si le calque est composé, sinon il repeint le titre à chaque image. À regarder sur le 13 Pro (Instruments / filmer) ;
  si ça saccade, remplacer le flou par un fondu + étirement (`scale`) — c'est un changement d'allure : à montrer à Sacha d'abord.
- **Lignes de MISSIONS (`gmIn`)** : `filter` + `clip-path` (non composables) 400 ms avec des décalages jusqu'à 860 ms. Même remarque : un dévoilement par
  `transform` d'un masque donnerait le même effet sans repeinte, mais c'est un autre dessin du mouvement.
- **Moteur en vignette de l'écran de mort (`engVigRender`)** : lit la puce à chaque image (`getBufferSubData` / `fenceSync`), ce qui synchronise le processeur
  et la puce pendant toute l'entrée de l'écran de mort. Hors du « mouvement de l'interface » au sens strict ; à mesurer sur le téléphone avant d'y toucher.
- **Premier passage de l'inventaire / des missions / des réglages** : 100-146 ms (×4) de construction au tap (une fois par session). Pourrait se préparer au
  menu au repos (comme la prise d'avance des photos) ; non fait, gain d'une seule fois.

## Ce qui ne se juge que sur le vrai téléphone
- Le ressenti des trois correctifs (aucun n'a été vu sur l'iPhone ; le banc est Chrome sur Mac, processeur ralenti, sans la puce de l'iPhone ni sa chaleur).
- Le départ de course : combien de temps le voile chaud tient réellement sur un 13 Pro chaud (borne 450 ms) — `dbgDepartVoile().dt` ; s'il touche souvent la
  borne, c'est le départ lui-même (start/buildCar) qu'il faut étaler.
- Les animations `filter` de l'écran de mort et des missions (voir propositions).
- La chaleur : la fenêtre de transition rend 60 i/s pendant 0,4 à 1,6 s par changement d'écran au lieu de 30/15 — négligeable en moyenne, mais à garder en tête
  si la boîte de vol montre un menu qui chauffe.
