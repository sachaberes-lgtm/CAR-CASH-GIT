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

## v4 (15/10, session VOLCAN4, branche `volcan4`) — LA DESCENTE EMMÊLÉE
Sacha : « la route ne doit pas être toute plate mais doit pouvoir s'emmêler, nous faire visiter la map, s'amuser et prendre des raccourcis ».
- `vlcTrace` v4 : la v3 (balade) gardée en tableaux mais en DESCENDANT (~5 % en houle, courtes remontées ~5 % de la longueur) : départ + boucle B0,
  CORNICHE qui descend autour du grand volcan + B1, arche, fumerons (2 groupes, B2 entre eux dans la fenêtre), B3 qui plonge sur le LAC, arrivée.
- 4 boucles à raccourci = la mécanique v2 (`VOLCAN.sauts`, couloirs sans décor déjà gérés par buildVolcan). Cône K calé sur la hauteur de la corniche.
- `volcanSol` : L'ARÊTE — sous la route haute (> 90 m au-dessus de la lave), une échine de basalte qui plonge à la lave avant 340 m.
- Banc RACCOURCIS hors ligne (scratchpad d9665cfc : `vtrace.cjs <index.html> <graine> <palier> <out.json>` puis `raccourcis.cjs volcan 1 --depuis=`) :
  30 pistes (paliers 0/5/10/20/27 × 6 graines) : raccourcis rentables 0,7-4,9/km, 0 croisement dangereux, 0 infranchissable, pente ~5 %.
  Restent sous la cible : virages/km (~2,1) et enchaînements (~0,8) — la balade (lac, corniche) assumée. L ≈ 10 km au palier 0 (v3 : 6,9).

## v5 (18/10, session VOLCAN5) — LA GROSSE REFONTE VISUELLE
Sacha : « la map volcan est la plus moche, lance une grosse refonte ». Route, boucles, collisions, gameplay inchangés ; tout le visuel refait
derrière `VLC5` (`?volcan=v4` = avant) : lave en plaques (`VLC_LAVE_FS5`, `VLC_VOR`), roche en facettes (`VLC_SOL_FS5`, `VOLCAN.sol.cf`),
aiguilles/arche (`VLC_ROC_FS` define V5), ciels (bloc `if(VLC5)` après la continuité), fumée/brume/panache/braises (`VLC_MET`), bug du mur de lave
au cratère, cartes postales retirées APRÈS la construction. Détail et mesures : JOURNAL « LE ROYAUME DE FEU v5 ».
