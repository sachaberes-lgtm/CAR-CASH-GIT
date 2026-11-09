# PASSE 3 — P5 « les menus fluides et froids » (2026-11-07/08, session P5, branche `perf3/P5`)

Tout est sur `TEL_NATIF` (vrai téléphone) ; l'ordinateur ne change pas. Chaque levier a un budget `PAL.B.<clé>` et un interrupteur d'URL ; `?menu=max` rend vitrine, 30 i/s, photos d'avant en bloc.
Bancs (Mac, Chrome sans fenêtre, iPhone émulé, `?tel=1&palier=2`) : `outils/banc-perf/menus.py` (écrans), `menus-chaleur.py` (travail par seconde : images, appels, triangles, JS), `ouvre-profil.py` (profil CPU ×4 de l'ouverture boutique/garage), `trace-ouvre.py` (trace Chrome rendering/painting). ⚠ le banc doit d'abord passer l'intro (`__introCouvre`), sinon on mesure la sphère.

| Levier | Commit | Interrupteur | Résultat mesuré (Mac) |
|---|---|---|---|
| Vitrine plafonnée : densité 2, ombre 1024 (`vhdDprTel`, `vhdOmbreTel`) | 227155b0 | `?menu=max` | boutique gpu p50 6,19 → 4,4-4,7 ms (≈ −25 %), toile 804×1740 → 780×1688 |
| HC GESTE : 30 i/s au repos, 60 au toucher / défilement / transition / changement de caisse | 5f7b8756, ab7823fa | `?menu=max`, `?hc=0` | (le 30 i/s hors course existait déjà par `PFR_ON`) |
| Photos jamais pendant un défilement, `shopPhotoTour` une par image, ≥ 150 ms | 11abb669 | `?menu=max` | images > 50 ms à l'ouverture boutique 12 → 4 (banc bruité) |
| `homeCielPrise` : plus de `getImageData` en course | 48354385 | `?cielprise=ancien`, `PAL.B.cielPrise` | lecture supprimée en course ; la PBO de l'écran de mort est déjà un tampon gardé, lue toutes les 33-50 ms pendant la carte moteur (non touchée) |
| HC REPOS : 15 i/s sans geste depuis 3 s (plancher : la caisse tourne) | 600c3aaf, c58086db | `?repos=0`, `PAL.B.reposMs` | accueil 28,5 → 15 i/s |
| MENU CULL : au menu, les 94-98 maillages `frustumCulled=false` hors champ ne partent plus au GPU | c58086db | `?menucull=0`, `PAL.B.menuCull`, `dbgMenuCull()` | accueil 782 k → 180 k triangles/image, 144 → 68 appels ; à 15 i/s : 2,7 M tris/s (23 M au départ), ~1 k appels/s (4,1 k) |
| Photos des caisses de la boutique prises d'avance au repos (`SHPRE`) | 5517ba15 | `?shoppre=0`, `PAL.B.shopPre` | images > 50 ms sur 8 s à l'ouverture : 18 (≤ 700 ms) → 5 (≤ 200 ms) ; trace : plus d'image > 67 ms si les photos sont en cache |
| Flammes du garage : un pas par image rendue, durée = temps écoulé | (ce commit) | `?feu=ancien`, `PAL.B.feuDt` | au repos 15 pas/s (le même nombre qu'avant) mais à la vitesse visuelle de Léo (avant : demi-vitesse à 15 i/s) |

## Constats
- Ouverture de la boutique, profil ×4 : 3,3 s sur 4 = `carPhoto` (buildCar 2,6 s dont poptart/échappement/raycast ≈ 0,5 s ; liaison des programmes + `getProgramInfoLog` ≈ 0,6 s ; toBlob/createObjectURL). La trace Chrome ne montre AUCUN effet de rendu coûteux (layout 189 ms, paint 55 ms, 0 tâche > 70 ms) : rien à aplatir en CSS.
- Garage ouvert : `garFeu` 0,43 s par 1,5 s (feuPixPas + garFeuCubes) ; la caisse y tourne toujours (0,24 rad/s) donc pas de 10 i/s.
- La vitrine HD ne s'allume pas à l'accueil dans le banc (dpr 1,5, vhd faux) mais s'allume dans la boutique : l'accueil se mesure avec dpr 1,5.

## Ce qui reste
- `carPhoto` d'un bloc (≈ 1 s ×4 par photo manquante) au 1er lancement à froid : le trancher = réécrire les SHAPES en générateurs ; `echEncastre` (≈ 0,5 s par lot) non mémoïsé faute de contrôle pixel.
- Inventaire non profilé : geste réel = tap `[data-m=garage]` puis `#gvCof.click` ; `dbgInv('ouvre')` échoue au menu (`garAtelierLibre`).
- `gStripHabits` lit le layout (`getBoundingClientRect` 125 ms ×4) à l'ouverture du garage.
- Bloom demi-résolution et dpr 1,5 au menu : non faits (changent l'image) ; critère thermique à mesurer sur l'iPhone.
- Aucun gain prouvé sur téléphone : tout est mesuré au banc Mac (temps indicatifs, charge variable).
