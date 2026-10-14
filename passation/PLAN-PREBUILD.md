# PLAN — PRÉ-CONSTRUIRE le niveau suivant pendant la course d'avant (session PERF, 14/10 soir ; code : semaine prochaine)

But : supprimer le gel du portail (ville ~200 ms, forêt ~260 ms, JADE ~700 ms sur PC ; ×3-5 sur iPhone). Interrupteur `?prebuild=0`.
Juge : le banc d'égalité sur graines fixes (`egal2.cjs`, empreinte des tampons de trackMeshes) — sur main SEULEMENT s'il est égal au bit.
Numéros de ligne : HEAD 89e6bdb, ±10.

## Ce que newTrack écrit (inventaire)
- PISTE (buildTrack l.13886) : pts, T, Nn, B, L, NP, trackMinY (let l.11243) · THICK, JADE_LEVE (13895) · ROAD_HALF (lvlChoisir) ·
  trackMeshes, PISTE_LOD, NEON_RAILS/GLOW, PAD_MATS, PADS/PADL, BUMPS, CONES, OILS, FLYCONES, RAMPS, HOLES, FILETS, MODS, GAPMARK/
  FILETMARK/MODMARK, VILLE_ENTREE, zoneArch · PORTAL (singleton, 14318-14328) · CONE_IM… et PAD_IM réécrits EN PLACE (conesInstancier,
  padsInstancier). Tout est ajouté à la scène au fil de l'eau.
- PAR CARTE — chaque build commence par VIDER l'état courant : buildClouds (disposeClouds 12434), buildVoxCity (CITY), buildForet
  (foretVide), buildParis, buildJade (jadeRange/jadeEtatVide — JADE_GARDE est le seul précédent de « carte gardée »), orbiteBuild (SATS).
- Uniformes partagés écrits AU BUILD : ROAD_U.uAcc (14080), ACCENTS, trancheMat, jadeRouteStyle → ROAD_U.uJStyle, coinSymbole.
- GAMEPLAY/CIEL : lvlChoisir (LVL.cur, SF.tirage/SF.der/SF.prochain — Math.random), lvlBiome (Math.random), bioGo (repeint envTex), lvlGo,
  flowLieu, ORBFX, musicSuitLieu, spawnPickups (pickups, PIECES_LIBRES, coinIM unique), computeMinimap (mmBg), cratCache, debCache,
  campDebut, traceVide, remise à zéro de s/lat/psi/mode.

## Les points durs
1. État de COURSE lu pendant la construction : engTier (lvPiste → largeur des virages dans genCtrl, STR dans spawnPickups),
   runStats.zones (FILET, nuit au 3e portail, `rich`), started/gameOver/mode, PARK/TUTO/CARR. Pré-construire FIGE engTier : décider
   (réserver le palier attendu, ou accepter un cran d'écart — ce qui casse l'égalité au bit avec l'ancien chemin).
2. Math.random hors graine : la graine `sd`, lvlBiome, sfTire, fruitPick (fruit choisi hors graine), fbBoite (bruit visuel), fbTube
   `rg||Math.random` (appelants à vérifier). Les builds de décor, eux, sont en mulberry32 (déterministes pour une même graine).
3. Singletons qui s'écrasent : PORTAL, CONE_IM, PAD_IM, coinIM, CITY/FORET/PARIS/JADE/CLOUDS, SATS, mmBg — deux instances
   impossibles sans rendre les objets de carte instanciables.
4. Ménage : buildTrack dispose les géométries et met les matières en MAT_SURSIS, sceneRetire(trackMeshes) réécrit scene.children —
   rien de ça ne doit partir avant la bascule.
5. Lecteurs en course : frameAt (90 appels), tryLand/dalleIx (cache par identité de `pts` : se refait seul), boucle de conduite
   (PORTAL, PADS, RAMPS, HOLES, BUMPS, CONES, OILS, ramassage), bots du Survivant, pisteLoin, conesVus, coinPose.

## La bascule, en six étapes
- E1 (faible) — au début de chaque zone, TIRER la zone n+1 sans rien construire : une version PURE de lvlChoisir (sans SF.der,
  carrMarque, ROAD_HALF, lvlAstre), graine et engTier figés.
- E2 (faible-moyen) — extraire de buildTrack le calcul PUR (genCtrl → courbe → pts/T/Nn/B, HOLES/FILETS/MODS) dans un objet
  `PISTE_NEUVE`, sans toucher aux globales ; rendre paramétrables les aides qui lisent L/NP/pts (frameAt, bancCourbe, campCourbure).
- E3 (moyen) — construire les maillages de piste HORS scène (groupe à part), en tranches de ~4 ms par image ; ne scene.add qu'à la bascule.
- E4 (élevé) — les décors de carte : instanciables (état par tampon, modèle JADE_GARDE) ou construits au swap seulement (les plus lourds).
- E5 (moyen) — la BASCULE atomique en une image : globales de piste, PORTAL, pickups, CONE_*/PAD_IM, mmBg, puis LVL.cur, bioGo, lvlGo,
  campDebut, remise à zéro ; ménage différé (MAT_SURSIS).
- E6 (faible) — chauffeRendu(que) de la piste neuve pendant la course d'avant (attention : compilation en course = pic).
Hors pré-construction (garder le chemin synchrone) : parc, auto-école, campagne, resetGame, démarrage.
Non vérifié par l'inventaire : le corps de genCtrl, gen* des cartes, l'intérieur des build* au-delà de leur en-tête, survStart.
