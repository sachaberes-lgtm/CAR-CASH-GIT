# Allègement, lot D « coupées » (18/10/2026, branche `al-coupees`, base 024675ba)

`VERSION PRINCIPALE/index.html` : 7 660 148 → 7 492 449 octets (**−167 699**, −2,2 %). Le jeu par défaut ne change pas : on a retiré des
branches mortes ou coupées (interrupteur `SANS_X` à `true`, `X_ON=false`, `?x=1`), jamais une branche vivante. Contrôles : `verif.cjs` OK
(aucun nom nouveau non résolu), pas de banc (fumée à passer sur l'ensemble). Aucun `rnd()` d'une boucle vivante n'a été retiré (voir plus bas).

## Ce qui est parti (numéros de l'audit 359f9fb8)
- **43 loopings** (−3 Ko) : `SANS_LOOPING`, les 3 helpers `loop`, `LOOPI`/`lastLoop`/`LOOPS`. `lisserRaccords(P)` / `adoucirCretes(P,k)` perdent leur
  paramètre `skip` (il ne servait qu'aux loopings). Aucun `rnd` consommé par les branches retirées.
- **29 plots, portes de plots, tremplins, trous, dos d'âne, boule** (−46 Ko + 2 Ko) : `PLOTS_ON`, `GAP_ON`, `BUMP_ON`, `RUG_BOULE`, `CONES`/`FLYCONES`/`BUMPS`/
  `RAMPS`/`HOLES`/`GAPMARK`, tout le moteur d'instances des plots (`conesInstancier`, `conesVus`…), `mkCone`, `coneVole`, `coneSnd`, `campPlots`,
  `campPortesTick`, le balisage des tremplins et les bords du vide dans `pisteRoute`, `holeAtS`/`holeAtI`, la plomberie `trou` de
  `pisteTranches`/`pisteMaigre`, la boucle `RAMPS` et la boucle `BUMPS` de la physique, `gapArmed`/verdict « GAP FRANCHI », `gapRun`
  (remplacé par `droiteM`, la droite de momentum qu'il rendait déjà), la boule de feu du nitro (`rugBoule`, `RUG.boules`).
  **Tirages gardés** : la boucle des dos d'âne (en-tête), les 2 `rnd()` par tour de la boucle des plots, le tirage de variante du motif `mo===10`.
  Gardés : `CAMP.portes` (les pads s'en écartent, les moutons s'y posent), `villePlots()` (appelé directement), `rampCd` (becs de glace).
- **16 snake loop / 27 NITROOO, PURE SPEED, AIR NITROOO / 28 météore, cratère, pluie de débris** (−40 Ko, ensemble) : `SANS_SNAKE`/`SANS_NITROOO`/
  `SANS_METEORE`/`DEB_ON`, bloc `NTR` (comète, langues, paliers, `nitroooTick/Part/Vide`), `fallUnder`, `nitroAirT`, `trkMeteor`, `pureT`…,
  `CRAT`/`cratere`/`cratTick`, `DEB` (5 maillages + 3 textures au menu), `NITRO2.ntr` (le réservoir ne distingue plus NITROOO), verdicts MÉTÉORE/MEGA/
  SNAKE (tableaux `VERD_*`, `rewardSfx`, dbg). **Gardés** : `vitMult()` = `Math.min(2.6,1+pwrSpdK)` (même valeur, `NTR.boost` valait 0),
  verdicts MONSTRE/DOUBLE/TRIPLE, sons `cratere` et `nitrooo.palier` (encore appelés).
- **30 voix** (−14 Ko) : `SANS_VOIX`, l'annonceur WebAudio/HTMLAudio (`voixWA`, `annPlayLayers`, `ANN_*`, `annRoll`, `annPreload`, `annStop`), le WOW,
  le « ewww » des morts (`DEATH_LIB` : 3 sons), le recul de la musique (`mDuck`), l'interface VOIX (bouton, ligne, curseur, note iPhone, CSS, handlers).
  `annSpeak(key)` ne rend plus que son texte (`ANN_TXT`). **Gardés** : `SAVE.d.vox`, `SAVE.d.vol.vox` (migrations), `VOL_LOCKED`, `sampleWA`.
- **33 mode facile** (−10 Ko) : `SANS_FACILE`, `facOn/facBord/facFilet`, `FAC*`, `facileSauve`, cœurs `#facVies`, ligne MODE FACILE, `facChoix`, aides de
  virage / vol / pose dans la physique. **Gardés** : lecture `SAVE.d.facile` (migration), style `.facC6` (cartes de modale), et la micro-attente du
  1er JOUER (`Promise.resolve().then(…)` à la place de `facChoix().then(…)`, 6 sites) pour ne pas changer le déroulé.
- **32 figures libres / ancien lecteur** (−15 Ko) : `FLK`/`FL`/`figLibre*`/`dbgFigL`, `veqFigurePose`, `veqFigFinie`, queue de `veqFigure`, lecteur
  `VEQ.lect`. `FIGV2` reste (`{on:true}`) : ses ~30 tests sont à dérouler plus tard. `FLC` reste (sert `figLance`).
- **45 parc freestyle** (−9,6 Ko) : `genPark`, `buildParkGround` (prairie, herbe longue), boutons/carte du mode. **Gardés** : `const PARK={on:false}`, les ~141 tests
  `PARK.on`, `PARK_VCAP`, `parkRespawn` (appelés par ces tests).
- **50 impact d'immeuble v2** (−17 Ko) : `IMPACT`, `villeImpact`, `impactPieces`, `villeTourTouchee`, `impactBouffee`, `villeImpactTick/Fin`, le cratère dans les 3 shaders
  des tours (`VILLE_IMPACT`, uniformes `uImp9/uImpN9`). Remplacé depuis le 15/10 par L'IMPACT unique (`IMP`).
- **53 feu de jauge + `if(false)`/`if(0)`** (−7 Ko) : `FEU`/`feuNait`/`feuSprites`/`nitroFeu` (retournait tout de suite), néon sous caisse, `CARPOOL.tail/jet`,
  `exSmoke` (3 sites), boucle `if(0)` des lianes (`LI` reste vide).
- Divers : `boomMini` + `BOOM_MAT.plot` + branche `dbgExplo('plot')`, `rugBqSet`, loi 4 du réservoir (commentaire).

## Pour l'intégrateur (zones communes, non touchées)
- **Sons de la banque sans appelant** : `fig.snake`, `verdict.mega`, `verdict.meteor`, `fig.meteore`, `fig.gap`, `dosdane`, `debris.esquive`, `plot`, `porte`
  (déjà orphelins avant : `vitesse.pure`, `mallette.chaude`). Entrées de `SON_DUCK` à retirer : `verdict.mega`, `verdict.meteor`, `fig.snake` ; `SON_PENTA` : rien.
- **Fichiers devenus inutiles** : `assets/audio/announcer/*`, `assets/audio/fx/wow.mp3`, `assets/audio/death/eww.m4a` (et leur entrée dans `sw.js` si présente).
- **I18N** : `MÉTÉORE`, `METEORE`, `IMPACT METEORE`, `NITROOO !`, `AIR NITROOO !`, `PURE SPEED`, `SNAKE LOOP`, `MODE FACILE`, `CHOISIS TON MODE`, `Virages aidés, 3 vies`,
  `Sans aide, une seule vie`, `VOIX`, `Voix`, `Voix de l'annonceur`, `Volume des voix`, `Sur iPhone, le volume de la voix…`, `PARC FREESTYLE…`, `Freestyle`, `TOUCHE !`, `PORTES`.
- **CSS** (lot interface) : règles `#nitroFeu` (l.1718-1720, 1753, 3877, 7351) sans élément ; `.facC6` gardé.
- **CARS / CAR_UNLOCK** : rien. `atelier-son/recettes.js` garde les recettes des sons ci-dessus (à cuire/retirer avec la banque).
- Outils adaptés : `outils/eco-debut-modele.cjs` (ne relit plus `GAP_ON`), `passation/preuves/preuve-balayage.cjs`, `preuve-ramasse.cjs`,
  `passation/banc-perf/preuve-cadence30.cjs` (lisent le plafond ×2,6 dans `vitMult`, plus `NTR_BOOST_MAX`). Les deux premières ont un chemin codé en dur
  (`C:\Users\sachaberes\…`), cassées avant moi ; `preuve-cadence30` échoue sur `impSat` avec ou sans mon lot.
- Champs de sauvegarde gardés : `runStats.gaps`/`ex.gaps` (lus par les défis), missions `'gaps'` (affichage), `vox`, `vol.vox`, `facile`.
