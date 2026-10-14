# ÉTAT — session GRAPHISME (PC) · 14/10/2026, 17 h

Branche `gfx-integration` (worktree `C:/Users/sacha/Documents/GitHub/CCG-gfx-integration`). Je pousse moi-même sur main (protocole PILOTAGE : fumée → cc-push.lock → merge → syntaxe + garde → push → recopie Downloads → « POUSSÉ »).
La passation longue (règles, plafonds de la charte, outils dbg) reste `passation/GRAPHISME.md`.

## ⭐ MISSION PRINCIPALE (Sacha, 17 h 30) : L'IDENTITÉ CAR CASH — « une vraie connexion entre chaque map »
- (0) FAIT, commité (126d4b7), PAS poussé : la VILLE AU NÉON (ambiance `pluie`) retrouve son rose d'avant (`villeRose()`, `?sans=villerose` : ambiance, bords roses, enseignes magenta/cyan). Avant/après : `passation/graphisme-ville-rose.jpg`. Attend le feu vert de PILOTAGE, puis push (fumée).
- (1) FAIT : le mur des maps, `passation/graphisme-mur-des-maps.jpg` (5 maps × heure signature + midi, debout, mesures L*/chroma du ciel et de la route). Banc : `mur.cjs` du scratchpad (PAIRS, FMT, QX, NOM).
- (2) FAIT : la bible `passation/DA-CARCASH.md` (trio NÉON ROSE / OR / LAQUE BLEU NUIT + un accent par map, règles de lumière, invariants, interdits, ordre d'application). PROPOSITION envoyée à PILOTAGE : attendre la validation de Sacha.
- (4) À FAIRE après validation : application map par map, planche avant/après chacune → villes de jour, nuages de jour, jade, forêt, orbite.
- Chiffres de toutes les ambiances (valeurs effectives, node) : scratchpad `amb/ambiances.md` (scripts amb.js / tab.js). Diagnostic de la ville rose : causes = étalonnage pluie (l. « ÉTALONNAGE · LA VILLE »), NEONVILLE_V5, BORDS_V2, couche DA.

## Poussé sur main (18d585e, cache v384)
- AURORE sobre = 1re image de l'auto-école (`?sans=aurore2`) : route L* 63 sable → 41-43 gris, ciel bleu pâle, horizon b* +22 → +12.
- ORBITE2 (`?sans=orbite2`) : rebond par planète (Terre bleu-gris, Mars rouille, Jupiter ambre, Saturne or pâle), `BIOMES.espaceSat` pour les satellites. ⚠ Pas encore d'A/B au même instant (captures prises en vol) : à juger avec dbgAmb.
- Mer de nuages au SOIR (`?sans=soir2`) : étagement sommets pêche / creux prune, béton plus sombre, zénith bleu de crépuscule (plus de violet).
- Pots d'échappement recalés sur les poupes de Léo : BAVAROISE, ELDORADO, DAYTONA (y relevé), AIGLE DE FEU (mesure node `pots.js` de GENERAL, rien vu à l'écran).
- LA PALETTE, couche données (`?palette=0`) : 40 peintures dans COSM.peinture APRÈS les 17. 30 en grille (pastels / francs / métallisés × 10 teintes) + 10 secrètes (sec:id, masquées « ? ? ? » + indice tant qu'elles ne sont pas gagnées). PACK à 0,99 € qui donne les 40 (`PALETTE_PACK`, produit `cashcar.palette40`, via shopPaye seulement → palDonne). `secDonne(id)` = « DÉFI RÉUSSI · COULEUR … » (appelée par GAMEPLAY, commit 0d7cb23 de sa branche). Finitions neuves sans programme de plus : `k` MÉTALLISÉ, `n` NACRE (LP_MAT).

## Poussé ensuite (bdcaea8, cache v391, 17 h 20)
- MÉTALLISÉS recalés à la mesure (entrées ÷1,8 : la tôle métallisée rend ~2× plus clair que la laque) + VERT BILLET / LAGON / CITRON sans fluo.
- Planches pour le quiz de Sacha : `passation/graphisme-palette-villeMidi.jpg` et `…-villeSoir.jpg` (SA MAJESTÉ, LA BULLE ; ville jour / soir).

## En suspens
- Cumulus de NUIT / PLUIE / ORAGE (`?sans=cumnuit`) : 4 lignes écrites, NON committées, dans le worktree `CCG-gfx-cumulus` (branche `gfx/cumulus-nuit`, ancrées juste avant `window.dbgMer=`). Captures avant/après déjà faites : scratchpad GRAPHISME `…/scratchpad/cumulus/shots2/` → juger, committer si c'est mieux, fusionner.
- ORBITE2 : A/B au même instant (pause photo + dbgAmb avec les anciennes valeurs) avant de le dire « mieux ».
- Lune du titre la nuit : hors cadre (direction fixe `mdir` du shader) → ce n'est pas une affaire de `moon` ; à proposer, pas à faire seul.
- CANYON (6 ambiances canyon*, `?carte=canyon`) et FORÊT (foret*, `?carte=foret`, FOR_MET à part) : les étalonner à leur push (section « ÉTALONNAGE · CANYON/FORÊT », `?sans=canyon2` / `?sans=foret2`). La charte leur a été envoyée.
- Pour INTERFACE : la tuile d'accueil dit « MISSIONS · 0 / 3 DÉFIS » alors que « défi » = secret (mot de Sacha).

## ⚠ Alerte de DA (PILOTAGE, 17 h)
Sacha a rejeté violemment le « noir et blanc » de l'interface. Ne plus DÉSATURER quoi que ce soit (néon résiduel, or pâle, blanc chaud…) sans captures validées par Sacha.

## Outils (PC)
- Banc unique : `require('C:/Users/sacha/cc-banc/lib.cjs')` (file équitable, passe-droit `cc-banc.prio` = 1er mot = ton CC_QUI). Mes scripts dans le scratchpad GRAPHISME : `planche-palette.cjs` (dbgEquipe au menu → JOUER → caisse au sol → dbgHab + dbgView, interface masquée), `couples2.cjs` (couples map:météo par REJOUER, avant/après), `aurore.cjs`, `lstar.py` (L*/b* par boîtes), `planche_palette.py`.
- Serveur : `node C:/Users/sacha/cc-banc/srv.cjs "<VERSION PRINCIPALE>" <port>` (8793 était le mien ; 8761 est pris par une autre session).
- Pièges : un script tué garde le verrou (rendre `cc-banc.lock` à la main si owner = soi) ; `dbgEquipe` refuse en course ; les noms FR des entrées palette sont en `\u` dans le fichier (chercher par id).
