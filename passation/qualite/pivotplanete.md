# Lot pivotplanete — la planète entière au pivot (17/11)

Sacha (build 119, 13 Pro) : « il y a un temps où la planète est à moitié coupée quand on change l'orientation ».

## Quelle planète
La boule du film d'intro (« 1.61 », `code/moteur/intro-161.js`, toile `#fxCv`).
Au menu il n'y a pas de planète : le ciel du titre (`titreCiel`) est un shader de la toile 3D, déjà suivi au pivot par `init.js` (ROTA). `code/maps/*` non touché.

## Cause
La place de la boule (centre, rayon) était calculée une fois, dans `geoLabSphere` (ETS.boule).
Au pivot, la toile change de taille, mais la boule restait à son ancienne place jusqu'à ce que la préparation étalée refasse la géométrie (et 660 vignettes).
Et la taille n'était relue que sur `resize` / ResizeObserver, que WKWebView livre en retard.
Couché : ancien centre (195, 388) au ras du bas d'un écran haut de 390 → moitié basse coupée. Debout : l'inverse, coupée à droite.

## Correctif (`?sans=pivotplanete` = avant)
- `dBoule` replace la boule à chaque image où W/H a changé (même formule que `geoLabSphere`).
- La géométrie de la boule n'est plus refaite quand seul le cadre change (même nombre de points ; les vignettes sont 48×64 fixes : mêmes pixels).
- Le sens de l'écran (`matchMedia('(orientation: landscape)')`) est relu à chaque image : s'il change, la taille est relue tout de suite.
- Worker du film (`?plus=filmworker`) : reçoit BOULE_PLACE et la même `dBoule` ; la géométrie transmise porte W/H.

## Banc
`node outils/banc-ecrans/pivot-planete.cjs --out <dossier> [--q sans=pivotplanete] [--retard 100]`
Chrome muet 390×844 ×2, pivots par CDP, `resize` et ResizeObserver retenus --retard ms (comme WKWebView).
Relevé à chaque image : boîte des pixels lumineux, taille de la toile. Un `<pivot>.json` par pivot.
Attention : le film screencast ne montre PAS la coupure (Chrome n'envoie que l'image recomposée). La preuve = les relevés.
