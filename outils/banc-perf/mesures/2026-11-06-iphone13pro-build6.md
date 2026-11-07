# iPhone 13 Pro (app, palier 2), build 6 — boîte noire lue par câble le 7/11 (brut : `2026-11-06-iphone13pro-build6-brut.txt`)
Lignes de la séance du build 6 : 6/11 16:17 → 16:32 (version b97e681). Les lignes de 15:03-15:05 sont de la séance précédente (build 5) ; celles de 16:48-16:56 portent la version 027c1b7 (un build installé ensuite).

## (a) Le serpent — 4 trous > 120 ms au chargement (fin du guet à 4 s)
| t | trou | cause JS | cause GL | fil |
|---|---|---|---|---|
| 0,2 s | 867 ms | — | — | libre |
| 1,1 s | **1 261 ms** | `image loop` 660 + `étape piste` 650 | **`texImage2D` ×10** (three.min.js:6:303533 < Z < V) | bloqué |
| 2,4 s | 169 ms | minuteur chauffe 69 | — | libre |
| 2,5 s | **1 038 ms** | `image boucle` 463 | — | bloqué |
Les deux gros trous (1,26 s et 1,04 s) = la construction de la piste (`étape piste`) et 10 envois de textures (`texImage2D`) dans la boucle de rendu ; le 867 ms initial n'a pas de cause relevée (fil libre : travail natif/hors page).

## (b) Fluidité — lignes `fluide` du build 6
| heure | t de partie | map | palier moteur | km/h | p50 / p90 / pire (ms) | cadence | QL | dose |
|---|---|---|---|---|---|---|---|---|
| 16:18:58 | 110 s | ville | 0 | 246 | 33 / 35 / 100 | 60 | 0 | 32 froid |
| 16:19:02 | 114 s | ville | 0 | 292 | 33 / 38 / 97 | 60 | 0 | 36 froid |
| 16:20:19 | 190,8 s | jade | 0 | 236 | 16,3 / 25,3 / 100 | **30** | 0 | 47 chaud |
| 16:20:31 | 202,8 s | jade | 0 | 399 | 38,3 / 52,3 / 68 | 30 | 4 | 53 chaud |
| 16:25:32 | 503,8 s | espace | 2 | 397 | 53,3 / 83,3 / 83 | 30 | 9 | 148 chaud |
| 16:25:36 | 507,9 s | espace | 2 | 405 | 54,3 / 83,3 / 83 | 30 | 9 | 150 chaud |
| 16:25:40 | 511,9 s | espace | 2 | 426 | 59,3 / 83,3 / 83 | 30 | 9 | 152 chaud |
| 16:25:44 | 516 s | espace | 2 | 445 | **83,3** / 83,3 / 83 | 30 | 11 | 154 chaud |
| 16:25:48 | 520,1 s | espace | 2 | 445 | 83,3 / 83,3 / 83 | 30 | 9 | 156 chaud |
Lecture : le p50 suit le TEMPS (la dose de chaleur 32 → 156), pas la vitesse ni le palier : à 33 ms (30 i/s en réalité, « cadence 60 » étant la consigne) dès la minute 2 ; calage à 30 à 190 s (dose 47) ; l'échelle de qualité monte (QL 4 puis 9-11) et l'image finit à 83 ms (12 i/s) à 8-9 minutes, dose 154. Le gouverneur a bien calé à 30 à 190 s, mais n'empêche pas l'effondrement ensuite (thermique).

## (c) Mémoire — lignes `memoire` (fin de partie)
| partie | durée | textures | géométries | programmes | tas |
|---|---|---|---|---|---|
| n°1 | 183,5 s | 102 | 311 | 195 | — |
| n°2 | 909,5 s | 121 | 632 | 195 | — |
Les géométries doublent (311 → 632) entre la partie 1 et 2 ; les programmes restent à 195. Pas de ligne `contexte` : AUCUNE perte du contexte 3D pendant la séance ; le tas n'est pas fourni (`tas -`, performance.memory absent sous WebKit).

## (d) Plantages iOS
Aucun rapport de plantage/jetsam de CASH CAR pendant la séance du build 6 (16:17-16:32). Seul jetsam lié : 6/11 01:33:05 (WebKit.GPU tué « highwater » 307 Mo, WebContent 1 322 Mo, séance du build 3). Un JetsamEvent du 7/11 05:44 ne concerne pas l'app. Deux gels en COURSE plus tard (version 027c1b7) : 5,8 s à 16:48:31 et 1,6 s à 16:56:30 (écran `play`, ce dernier avec `hPwr figVol hAirPie`).
