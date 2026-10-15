# ÉTAT — LE ROYAUME DE FEU (session VOLCAN, 2026-10-14 ~23 h 10)

Demandes de Sacha (14/10) : la map volcan (Mustafar / royaume des flammes) ; puis, par PILOTAGE : RACCOURCIS + DESCENTE + COURSE (règle commune
de GAMEPLAY, `passation/RACCOURCIS.md`), virages à l'échelle du palier, construction en tranches, et la FUMÉE comme défi (« difficulté à voir »).

## Où
- Worktree `C:/Users/sacha/Documents/GitHub/CCG-volcan`, branche `volcan`. Sur main : v1 b9f5cd9, retouches GPU 8a0fdd3d (v408), v2 843dab1e (v429, train n°1).
- Code : bloc `<<<VOLCAN>>>`…`<<<FIN VOLCAN>>>` de `VERSION PRINCIPALE/index.html` ; `BIOMES.volcan*` ; `SF_CARTES.volcan` ; `FUMEE_K` (près de
  FOG_BASE) et son crochet dans `updateClouds` ; sons : bloc `<<<VOLCAN>>>` de `atelier-son/recettes.js`.
- Sources de travail (scratchpad de la session e853f501) : `v1.js`…`v4.js`, `biomes.js`, `carte.js`, `branche2.py <index.html>` (idempotent) ;
  `trace.cjs <graine> <LV> <sortie.json>` exporte une piste pour `node C:/Users/sacha/cc-banc/raccourcis.cjs volcan <g> --depuis=<json>` (banc
  RACCOURCIS SANS Chrome) ; `carte.cjs` vue de dessus ; `vbanc*.cjs` captures GPU ; `fumee-patiente.cjs` = la fumée commune, 100 min de file.

## Fait (sur main, 843dab1e)
- Route v2 (cratère → mer de lave, 5 boucles de raccourci, virages au palier) : banc RACCOURCIS hors ligne 10/10 cibles aux paliers 0, 10, 18, 20, 27 (5 graines).
- Mer de lave plate jusqu'à l'horizon, couloirs de saut sans décor, tranches (44-46 ms tout de suite), bancs de fumée (60 i/s dedans).

## Reste
1. Planche fumée (fenêtre dégagée / nappe dense, nuit et soir) : `shots3/` du scratchpad e853f501 (vbanc3.cjs) → à PILOTAGE.
2. Le banc GPU a vu la v2 AVANT les deux dernières retouches (bancs plus denses, virages en plus aux hauts paliers) : un passage `vbanc*.cjs` pour confirmer.
3. À trancher par Sacha : le nom, la cadence des éruptions (15-29 s ÷ VLC_MET.eru), la densité des bancs (`VLC_MET.fu/fuF`, rythme dans buildVolcan) ; musique = Léo.
4. Pour publier : LE TRAIN (merge, syntaxe, gardes, pas de sw.js, push de la branche, `echo "VOLCAN volcan" >> C:/Users/sacha/cc-train/file.txt`).
