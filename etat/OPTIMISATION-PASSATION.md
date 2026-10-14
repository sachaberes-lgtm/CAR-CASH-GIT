# OPTIMISATION — PASSATION (14/10, 4 h 30) — de quoi reprendre dans une discussion neuve

## Où
- Chantier `~/cash-car/perf` · branche `perf-integration` (worktree `perf/integ`, servie sur :8400 par `node perf/banc/serveur.cjs 8400 "perf/integ/VERSION PRINCIPALE"`). HEAD = 1214b95, syntaxe 0 erreur, garde burn-out OK. Rien de poussé ; PILOTAGE fusionne dans `assemblage`.
- Règles des agents : `perf/BRIEF.md`. Copies : `sh perf/banc/prepare.sh <nom> <port>` → `perf/wt/<nom>` (branche `perf/<nom>`).
- Ordres : `pilotage/REGLES.md`, `BUDGET.md` (2 agents max, sonnet par défaut, 1 seul Opus ; le chef ne lit plus le code ni ne mesure : un agent sonnet lance un script prêt). État : `pilotage/etat/OPTIMISATION.md` (détail des chiffres). Journal : `debug/journal-correctifs.tsv`.

## Fait et contrôlé au navigateur (iPhone 7 émulé 667×375, compteurs)
Socle `PAL` (`PAL.n` 0/1/2, `PAL.B.<cle>=[a,m,r]`, `PAL.b()`, `?palier=N`, `dbgPalier()`) · départ au bon cran (`qlDepart`, `qlMin`, `vhdPx`, `vhdOmbre`, `vhdMort`) · écran de mort (`mortImg` 4/2/1, `engVigMs` 100/66/33, ticks de décor espacés, `dbgMortImg()`) · tampons bornés (`imEnvoi`) · jade (`jadeNuvoxPres/Quart`, `jadeVerreR1` 400/600/750, `jadeMonuLoin`, `jadePorteVerre` 150/300/450) · post (`postOmbreDouce` 0/0/1, `postBloomMips` 3/4/5) · mémoire (`memToiles` 1/1/0, `texLibere`, `toileRend`, `memTexBillets`, `dbgToiles()`) · allocations par image (petit).
Jade palier 0 : 1 108 k → 647 k triangles en course ; toiles 2D 52 → 25,9 Mo ; passes 13 → 9.

## Fermé / en attente des autres
- CADENCE 30 i/s (`CAD`, `dbgCadence`) : prête, FERMÉE (`PAL.B.cadence30=[0,0,0]`, décision de Sacha) → rouvrir `[1,1,0]` quand « choc balayé » de DEBUGGING est au journal, puis vérifier sur un parcours avec trafic.
- Nuages du jade : GRAPHISME les remplace par ceux de la MER DE NUAGES (budget écrit dans l'état : ≤ 40 k / 90 k / 180 k triangles) → mesurer après sa livraison (`node perf/banc/chef/v4.cjs`).

## Reste à faire (par rendement)
1. Jade palier 0 encore à ~650 k (cible 450 k) : ~750 k à 1 100 m de la Porte en une multitude de petits maillages ; MeshBasic de la scène 155 k / 46 appels ; 24 appels MeshLambert pour 1 k.
2. Pic du verre de la Porte (~1,25 M, 4-6 s) : seuil réglable `jadePorteVerre` ; revérifier l'endroit de la bascule avec une caisse À L'ARRÊT (les relevés en vol se contredisent).
3. Pente du tas +2-3 Mo/s mesurée dans CHROME : hypothèse = `loop` (1 769 lignes) non optimisée par V8, sans objet sous Safari → à mesurer dans Safari/sur un vrai iPhone avant de découper quoi que ce soit.
4. Démarrage : `richInit` (30 toiles + 4 programmes sous le titre), 167 programmes, `jadeCumulusTex` 8 Mo de tas ; Safari 15 non testé ; AUCUNE mesure sur un vrai iPhone 7 de toute la nuit.
5. Doute non reproduit : éclat de soleil coupé (bord vertical net) vu une fois sur EN ORBITE (`perf/shots/v5-p2-crypto/v5-p2-crypto-0.png`).

## Bancs
`perf/banc/fumee.cjs <tag> 8400` (5 cas) · `chef/v3.cjs` (cadence + mort) · `v4.cjs` (jade par palier) · `v5.cjs` (toiles/mémoire) · `v7.cjs` (EN ORBITE, crans) · `v8*.cjs`, `v9*.cjs` (Porte du ciel). Niveaux forcés : `?play=jade`, `?carte=espace&meteo=midi`. Tuer la caisse : `dbgSable(0);dbgAuto(0);dbgBoom()` + 7 s.
