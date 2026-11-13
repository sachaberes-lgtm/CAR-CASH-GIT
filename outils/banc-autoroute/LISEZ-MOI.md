# L'autoroute vivante — banc et notice (2026-11-13)

Le code : `code/rendu/autoroute.js` (inscrit dans `code/ORDRE.txt` juste après `rendu/bitume-beton.js`). Il est branché à trois endroits :

- `moteur/depart-avance.js`, après la ligne centrale : `yield* arPeint(seed,idA9,sEnt)`. La ligne centrale reste construite mais elle est cachée.
- `moteur/boucle-2-conduite.js`, après `LIGNE_U.uFile` : `arTick()` (le filé, la nuit, les poteaux qui plient, les poteaux proches seulement).
- `interface/vignette-moteur.js`, dans `chauffeDivers` : `arChauffe()` (les 5 programmes compilés au menu).

## Les réglages par l'URL

- `?autoroute=0` : la route d'avant (la ligne centrale).
- `?autoroute=fige` : la C seule, sans variation.
- `?argraine=n` : un autre scénario sur la même piste (avec `?pistegraine=n`, la piste est fixée).

## Les bancs (prendre `~/cash-car/verrou-banc.sh prendre <qui>` avant, `rendre` après)

- `TEL=portrait|paysage python3 outils/banc-autoroute/route.py carte:meteo [n]` : une vraie course en pilote automatique. Le banc fige l'image au passage de chaque événement du scénario. Il écrit `scenario.json`, `profil.json`, les prises `NN-<s>-<événement>.jpg` et `avant.jpg`, et affiche le coût du dessin (appels et triangles, sans puis avec l'autoroute, sur la même image).
- `python3 outils/banc-autoroute/partition.py <dossier>` : la partition, c'est-à-dire la piste vue d'avion, redressée.
- `python3 outils/banc-autoroute/page-vivante.py <dossiers…>` : la page `VERSION PRINCIPALE/maquettes-autoroute/index.html`.
- Les quatre maquettes du départ sont dans `maquettes.html`, avec leur banc `maquettes.py` (il ne marche plus : les pistes A à D n'existent plus dans le code).

Pour simuler les scénarios hors navigateur : évaluer `autoroute.js` dans node avec des bouchons. Il faut `THREE.Vector3`, `location`, `MODS=[]`, `lvPiste`, et le `mulberry32` EXACT du jeu, qui fait un décalage `>>>15` (pas `>>>1`).

## Mesures (13/11, banc Chrome, image figée)

- Téléphone (palier 2, sans le dessous) : +6,5 % de triangles. Le plus long morceau de construction dure 1,9 ms. Environ 3,3 Mo de traits par piste de 6 km.
- Ordinateur 1280 × 720 (avec le dessous) : +7 appels de dessin et +17 000 triangles (+2,9 %).

## Publier sur main

- Ne PAS emporter `VERSION PRINCIPALE/maquettes-autoroute/` (environ 7 Mo d'images de banc) : le retirer de la fusion.
- `sw.js` = numéro d'origin + 1.
- Assembler avec `node code/assembler.cjs --depuis-morceaux` (voir la mémoire « publier sur main qui bouge »).
