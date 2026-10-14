# ÉTAT — LE GLACIER (ex-LA BANQUISE, session MONTAGNE, 2026-10-14 ~21 h 30)

Demandes de Sacha : (1) « une map en mode banquise : la route dévale une montagne au-dessus du sol, d'immenses pics de glace partout ;
des traces dans la poudreuse en frôlant le sol, la mort si on va trop profond ; glisser ultra stylé sur les lacs gelés et les pics pas trop
abrupts » ; (2) à 20 h 40 : « ça devrait s'appeler GLACIER et être une MONTAGNE, comme dans STEEP » + la règle commune des raccourcis
(GAMEPLAY : `CCG-raccourcis/passation/RACCOURCIS.md`).

## Où
- Worktree `C:/Users/sacha/Documents/GitHub/CCG-banquise`, branche `banquise`. Code : bloc `<<<BANQUISE>>>`…`<<<FIN BANQUISE>>>` de
  `VERSION PRINCIPALE/index.html` ; sons : bloc `<<<BANQUISE>>>` de `atelier-son/recettes.js` (`banq.*`) ; journal : « LE GLACIER » puis
  « LA BANQUISE » en haut de `JOURNAL.md`. L'id reste `banquise` (`?carte=banquise&meteo=nuit`).
- Sources de travail (scratchpad de la session 13496b7c) : `banq-1..4.js` → `python banq-pose.py <index.html>` ; bancs `banq-node.cjs`
  (physique), `raccourcis-node.cjs` (raccourcis simulés), `banq-temps.cjs` (construction), `banq-banc.cjs <meteo> <actions>` (navigateur).

## Fait (vérifié)
- LE GLACIER : spirales ovales superposées (deux épingles dans le MÊME sens par tour, tour suivant 46-56 m plus bas décalé de 36 m vers
  l'aval) → raccourci par le bord aval dans le même sens. Navigateur : `dbgBanq('raccourci')` → posé un tour plus bas, gain 1 411 / 1 417 m,
  0 erreur. Node : 13-15 zones/piste (~1,3/km), 85 % même sens, gain moyen 1,2 km, chute ~60 m. Piste 10-11 km, ~8 % de pente moyenne.
- Gardé de la banquise : poudreuse (porte, trace, gerbe, mort > 2,4 m), glisse (lacs, pics, dérive), aurores, six temps, six sons, tranches.

## Reste
1. CONSTRUCTION : navigateur 130 ms (neige 81, cristaux 29) avant l'allègement de la grille (34 m, marge 1,7 km) — cible 60 ms. Pistes :
   la neige lointaine en grille grossière À PART (la grille fine seulement < 1,1 km), la pose des cristaux en tâches (la grille de physique
   remplie au fil de l'eau), `vPalier`/`rayonPalier` de GAMEPLAY quand ils sont dans le jeu (les rayons suivent aujourd'hui `lvPiste`).
2. Passer le banc de GAMEPLAY (`cc-banc/raccourcis.cjs banquise <graine> --palier N`) et s'y aligner (virages/km, serrés, droites ≤ 5 s).
3. Revoir en image la gerbe de poudreuse (deux rideaux) ; le blizzard ressemble à la neige ; la montagne elle-même (la face, la vue
   immense façon Steep) peut monter d'un cran (flancs plus hauts côté amont, vallée qui s'ouvre côté aval).
4. À trancher par Sacha : la musique (Léo), le dosage de la poudreuse (`BK_PH`).

## Réglages clés
`BK_LAC_D` (décalage des tours), `genBanq` (spirale : R1, Lg, chu ; couloir), `BK_PH`, `BK_MET`, `PAL.B.banq*`, `BK_TOUT`, `BK_DF`.
Console : `dbgBanq()`, `dbgBanq('raccourci',{n,f,v})`, `dbgBanq('spirale',{n})`, `dbgBanq('etat')`, `dbgBanq('poudre'|'glace'|'pic9')`, `dbgBanq('fini')`.
