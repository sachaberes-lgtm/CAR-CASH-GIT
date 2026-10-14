# ÉTAT — LE ROYAUME DE FEU (session VOLCAN, 2026-10-14 ~22 h)

Demandes de Sacha (14/10) : la map volcan (Mustafar / royaume des flammes) ; puis, par PILOTAGE : RACCOURCIS + DESCENTE + COURSE (règle commune
de GAMEPLAY, `passation/RACCOURCIS.md`), virages à l'échelle du palier, construction en tranches, et la FUMÉE comme défi (« difficulté à voir »).

## Où
- Worktree `C:/Users/sacha/Documents/GitHub/CCG-volcan`, branche `volcan`. Sur main : v1 b9f5cd9, retouches GPU 8a0fdd3d (cache v408).
- Code : bloc `<<<VOLCAN>>>`…`<<<FIN VOLCAN>>>` de `VERSION PRINCIPALE/index.html` ; `BIOMES.volcan*` ; `SF_CARTES.volcan` ; `FUMEE_K` (près de
  FOG_BASE) et son crochet dans `updateClouds` ; sons : bloc `<<<VOLCAN>>>` de `atelier-son/recettes.js`.
- Sources de travail (scratchpad de la session e853f501) : `v1.js`…`v4.js`, `biomes.js`, `carte.js`, `branche2.py <index.html>` (idempotent) ;
  `trace.cjs <graine> <LV> <sortie.json>` exporte une piste pour `node C:/Users/sacha/cc-banc/raccourcis.cjs volcan <g> --depuis=<json>` (banc
  RACCOURCIS SANS Chrome) ; `carte.cjs` vue de dessus ; `vbanc*.cjs` captures GPU ; `fumee-patiente.cjs` = la fumée commune, 100 min de file.

## Fait (branche volcan, à pousser)
- Route v2 (cratère → mer de lave, 5 boucles de raccourci, virages au palier) : palier 0 = 10/10 cibles sur 5 graines.
- Mer de lave plate jusqu'à l'horizon, couloirs de saut sans décor, tranches (44-46 ms tout de suite), bancs de fumée (60 i/s dedans).

## Reste
1. Fumée commune puis poussée (verrou cc-push.lock, sw.js +1), planche fenêtre/nappe à PILOTAGE (`shots3/` du scratchpad).
2. Paliers ≥ 10 : 2,1-2,4 virages/km sur certaines graines (cible 2,5) — les sorties de boucle s'allongent avec la portée du saut.
3. À trancher par Sacha : le nom, la cadence des éruptions, la densité des bancs (`VLC_MET.fu/fuF`) ; musique = Léo.
