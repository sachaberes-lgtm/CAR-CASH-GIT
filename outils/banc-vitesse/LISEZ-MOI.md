# Bancs de la grande vitesse (ios-aide, 13/11)

Sur le 13 Pro (build 101) le script de la boucle passe de 7 ms/image sous 400 km/h à 15-17 ms au-dessus. Ces bancs disent pourquoi.

- `node outils/banc-vitesse/profil.cjs [--s 8] [--paliers 15] [--prebati 0]` : profileur JavaScript de Chrome (chemin `?tel=1`), une fenêtre
  à basse vitesse puis une à haute vitesse SUR LA MÊME PISTE (la voiture revient au début, `dbgPortail`) ; liste les fonctions dont le temps propre
  par image grossit. Avec `--prebati 0` (pré-bâti coupé) : 9,5 ms à 656 km/h, 8,2 ms à 1 658 km/h — la boucle elle-même ne grossit PAS.
- `node outils/banc-vitesse/route.cjs [--n 6] [--carte nuages]` : N routes bâties d'un trait (`dbgSaut`), temps sous `pisteRoute` par fonction.
- `node outils/banc-vitesse/prebati.cjs [--n 3] [--carte grotte]` : N pré-bâtis d'avance (en tranches, ~2 000 km/h), temps sous `prebTravaille`.

Lecture : à grande vitesse le pré-bâti de la map d'en face doit tenir en ~13 s de route ; le jeu grossit la tranche pour finir avant le portail
(« le rythme qui suit le reste », jusqu'à 14-16 ms par image). C'est donc le coût TOTAL du pré-bâti d'une map qui se paie à chaque image.
Mesuré dans WebKit (`dbgPrebati().cpuMaps`, Mac) : grotte 310-810 ms, canyon 230-370, jade 350-590, espace 155-425, ville 190, nuages 185-265.
Profil d'une grotte (Chrome) : 25 % dans les boîtes et sphères englobantes de three → LES BORNES RAPIDES (v1573, `bornes9`, `?sans=bornes9`,
témoin `?bornesverif=1` → `window.__bornesEcarts`). Sorties dans `out/` (ignoré).
