# ÉTAT — session GRAPHISME (PC) · 14/10/2026, 17 h

> **18/10/2026 — la convention `?sans=<nom>` N'EXISTE PLUS.** Tous les interrupteurs de couleurs et d'images ont été retirés du jeu (`passation/ALLEGEMENT-MAPS.md`) : seules les valeurs « après » restent. Ce qui suit est l'historique du chantier.

Branche `gfx-integration` (worktree `C:/Users/sacha/Documents/GitHub/CCG-gfx-integration`). Je pousse moi-même sur main (protocole PILOTAGE : fumée → cc-push.lock → merge → syntaxe + garde → push → recopie Downloads → « POUSSÉ »).
La passation longue (règles, plafonds de la charte, outils dbg) reste `passation/GRAPHISME.md`.

## POUSSER = LE TRAIN (depuis le 14/10, 23 h) — lire C:/Users/sacha/cc-train/LISEZMOI.txt
Branche prête → merge origin/main → syntaxe + garde-burnout + garde-charte → NE PAS monter sw.js → planche → `git push origin gfx-integration`
→ `echo "GRAPHISME gfx-integration" >> /c/Users/sacha/cc-train/file.txt`. PILOTAGE fusionne, fume, monte le cache, pousse (à :05 et :35) et répond PARTI / ÉCARTÉE.
Un seul créneau de banc par session. REPORTÉ par PILOTAGE (fin de séance du 14/10) : orage de la ville en rose, lune du titre, midi du canyon.

## ⭐ MISSION PRINCIPALE : LA BIBLE CAR CASH (`passation/DA-CARCASH.md`, VALIDÉE par Sacha) — état au 14/10, 20 h 15
- Le trio NÉON ROSE / OR / LAQUE BLEU NUIT + la SIGNATURE DE ROUTE commune : `routeSig()` (bords et nappe roses, ligne centrale or, accent rose) + `SIG_V`
  (un interrupteur par map). Contre-jour rose (`kickC`) sur toutes les maps passées à la bible.
- POUSSÉ (8ce8520f) : ville au néon rose (`?sans=villerose`), villes de jour (`?sans=villejour`), CANYON DES GÉANTS sur main (fusionné avec forêt, banquise et volcan ; `?sans=canyon2`).
  Planches : `passation/graphisme-ville-rose.jpg`, `graphisme-villes-jour.jpg`, `graphisme-canyon.jpg`.
- COMMITÉ sur gfx-integration, fumée en cours puis push : nuages de jour (`?sans=nuagesjour`, copies de course nuagesMatinCC/nuagesMidiCC : le menu ne bouge pas),
  jade (`?sans=jade2`, soir et forme de Léo intacts), forêt (`?sans=foret2`), orbite (`?sans=orbite3`, expo +15 %), banquise et volcan (`?sans=banquise2` / `volcan2`).
  Planche nuages : `passation/graphisme-nuages-jour.jpg` ; jade/forêt/orbite : banc `shots/jfo/` du scratchpad (mur.cjs).
- POUSSÉ aussi 87b22350 (cache v413) : nuages de jour, jade, forêt, orbite, banquise, volcan.
- POUSSÉ ensuite (21 h 40) : e4ccd87a (v419) cumulus nuit/pluie/orage + banquise ; 98961b11 (v420) VILLE LA NUIT EN ROSE (nuit, orage, pluie : `villeRose()`),
  CIEL DU CANYON réparé (le masque du disque solaire était inversé : `?sans=cysoleil`), béton de l'orbite ; 032f2361 (v422) NUAGES DE NUIT EN CLAIR DE LUNE (`?sans=clairdelune`).
  Planches : graphisme-ville-nuit-rose.jpg, graphisme-canyon-ciel.jpg, graphisme-orbite-ab.jpg, graphisme-cumulus.jpg, graphisme-nuages-nuit-lune.jpg.
- POUSSÉ 591544f5 (v426, 22 h 12) : le CIEL DES NUAGES SANS POMMELÉ (`cielMotif` retiré des passes pleine ET basse `basN`, `?sans=ciel2`) et la mer lointaine
  fondue plus tôt (`uMerLoin` 16 000 → 8 000). Sonde en vol : `sonde-vol.cjs` du scratchpad (fige la caméra en l'air, coupe les couches une à une).
- POUSSÉ 48e8ae58 (v432, 23 h 33) : LA MÉTROPOLE DE JOUR (`?sans=metropole`, matin et midi seulement : `metroJour()`) : palette des tours par `metroH(x,z)`
  (verre bleu / acier / béton clair / sombres) dans la boucle `colT` de buildVoxCity, GRUES (genre 3 rouge, 4 jaune) dans `batir()`, enseignes jaunes (NEON 0 et 4),
  `CITY.uPied` (voile violet au pied des tours : 1 la nuit, .12 de jour), le VERRE DE JOUR qui reflète le bleu du ciel (il divisait la tour par 2 + horizon crème = beige),
  béton de jour neutre, ciel azur → pêche pâle (jSol et sunHalo bas). Planche : graphisme-metropole.jpg. Sonde utile : `sonde-ville.cjs` (couleurs d'instance réelles).
- FAIT 15/10 (train) : l'ORAGE DE LA VILLE EN ROSE (`?sans=plafrose`) : la ligne `VILLE2_V` (ardoise) écrasait l'orage rose → sautée en ville au néon ; plafond de nuages lilas + éclair violet rendus par l'uniforme `skyU.uRose` (posé dans `bordsTick`). Planche : graphisme-ville-orage-rose.jpg.
- RESTE (ancienne liste, (1) fait) : (1) l'ORAGE de la ville encore peu rose : son plafond de nuages lilas/éclair a été retiré par `NEON_V` à la COMPILATION (l. ~9364/9367,
  le plafond sous la pluie) → il faut un uniforme pour le rendre à la ville seule ; (2) le MIDI du canyon peut-être trop saturé (ciel chroma 88) : baisser `cyZ`/`cyM`
  de canyonMidi si Sacha le juge ; (3) la LUNE du titre la nuit : la direction en uniforme ne suffit pas (essai retiré) → vérifier si le ciel du titre dessine
  `cielLune` (variante du shader) et si `titreCiel` est appelé la nuit ; (4) MONTAGNE / toute nouvelle map : routeSig + contre-jour rose + plafonds de la bible. (5) Les GRUES de la métropole : à vérifier EN VOL au-dessus des toits (densité `metroH<.11`, `.07` téléphone ; taille du mât 36-76 m, flèche 46-82 m) — rarement dans le cadre du banc au sol.
- Pièges vus : `</style>` collé dans un commentaire (fusion boutique-pop) = CSS affiché en texte ; les fusions de maps se percutent toujours aux mêmes endroits
  (ctrl, build*, SF_NIV, SF_CARTES, chauffe, musique, CAUSES, accC) : garder tous les côtés (script `resout_volcan.py` du scratchpad) ; motif du cache dans sw.js.

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
