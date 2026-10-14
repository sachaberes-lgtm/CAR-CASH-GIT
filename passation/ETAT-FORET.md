# ÉTAT — LA FORÊT NOIRE (session FORÊT, 2026-10-14 ~17 h)

Demande de Sacha : une map forêt allemande fantaisie/hantée, la route en slalom entre les arbres, toujours en descente ; le jour ensoleillé
(fleurs, papillons), la nuit les mêmes arbres hantés (effets, loup-garou) ; toutes les heures et météos. « Magnifique du premier coup ».

## Où
- Worktree `C:/Users/sacha/Documents/GitHub/CCG-foret`, branche `foret` (poussée sur origin/foret), mergée sur origin/main 8c01287.
- PAS ENCORE POUSSÉE SUR MAIN. Code : bloc `<<<FORET>>>`…`<<<FIN FORET>>>` de `VERSION PRINCIPALE/index.html` (avant « LA VILLE SOUS LES NUAGES ») ;
  sons : bloc `<<<FORET>>>` de `atelier-son/recettes.js` (cuits, `sons-banque.js?v=15`) ; journal : section du haut de `JOURNAL.md` ; index du guide.
- Sources de travail (scratchpad de la session 8cf33aef) : `foret-1..6.js` concaténés → `foret-bloc.js` → `node splice.js <index.html> foret-bloc.js`
  (remplace entre les balises). Si le scratchpad est perdu : éditer directement le bloc dans index.html.

## Fait (vérifié au banc, 0 erreur JS, six météos)
- `SF_CARTES.foret` (matin, midi, soir, nuit hantée, pluie, orage), `NIV_FORET`, `BIOMES.foret*` (charte : jour:1, couleurs linéaires, sat/con plafonnés).
- Route `genForet` (slalom, pente 3,5-12 %, 2-3 plongeons), vallée `foretSol`, torrent, 6 essences × 2 détails + loin en 2 familles,
  ~60 géants à la corde des virages (collisions justes), arche, rochers du loup, chaumière, amanites, fleurs des bords, lierre, rayons,
  papillons/chauves-souris, pollen/lucioles, feux follets, yeux, lune, loup-garou + hurlement, voix de la forêt, place du morceau de Léo (MUSIC_LIEU).
- Paliers PAL `foret*` ; chauffe au menu `foretChauffe` ; tri par quartiers `foretTri` ; terrain coupé à la brume.
- MESURÉ : palier ANCIEN construction 108-183 ms, image 422 k tri / 149 appels (dont route ~280 k / 70 appels) ; palier RÉCENT 817 k / 164 (midi),
  653 k / 179 (nuit), construction 271-333 ms.

## Reste
1. Fumée commune (`CC_QUI=FORET node C:\Users\sacha\cc-banc\fumee.cjs "<CCG-foret>\VERSION PRINCIPALE"`) — ou `fumee-foret.cjs` du scratchpad
   (forêt couché nuit, debout midi, hasard : mort + REJOUER).
2. Poussée au verrou `C:\Users\sacha\cc-push.lock` : fetch + merge origin/main, syntaxe, `sh garde-burnout.sh`, `sw.js` CACHE +1 (avec commentaire),
   `git push origin foret:main`, recopie `git archive HEAD | tar -x -C "/c/Users/sacha/Downloads/CAR-CASH-GIT-main/CAR-CASH-GIT-main"`,
   rendre le verrou, « POUSSÉ <sha> » à PILOTAGE, prévenir GRAPHISME (SHA) pour sa section « ÉTALONNAGE · FORÊT ».
3. Ensuite (si demandé) : palier ancien encore au-dessus du budget à cause de la ROUTE (système route-beton) ; le midi récent à 817 k.

## Réglages clés
`FOR_MET` (lumière de la forêt par météo : el, ray, mist/mC, pap, luc, pol, hante, phare, leaf, ros, vent, lune, sons) · `FC` (albédos) ·
`PAL.B.foret*` · `FOR_SONS` (cadence des cris) · `foretLoupTick` (loup toutes les 26-48 s la nuit/l'orage).
Console : `dbgForet()`, `dbgForet('geant'|'rocher'|'arche',{d,h})`, `dbgForet('loup')`, `dbgForet('reprend')`, `?carte=foret&meteo=nuit`.

## Planche pour Sacha
`C:\Users\sacha\AppData\Local\Temp\claude\C--Users-sacha-Desktop-CAR-CRASH\8cf33aef-745a-4aa5-bff4-d86b7c9087b7\scratchpad\shots\planche-jour.jpg`
et `planche-nuit.jpg` (avant les derniers correctifs : arche verte corrigée depuis).
