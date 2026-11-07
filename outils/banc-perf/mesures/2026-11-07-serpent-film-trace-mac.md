# Serpent de chargement, Mac headless (Chrome, `?tel=1`, CPU ×4, dpr 3) : `serpent-fluide` 6595747c vs `origin/main` d7a5edb2 (v1249)

⚠ MAC SATURÉ pendant toute la série (charge 43 → 66, d'autres sessions lancent leurs bancs) : les écarts de quelques centaines de ms sont du bruit, et rien ici ne vaut le banc iPhone. Mesure du serpent WEB (`#spCharge`, animation CSS `steps(48)`), que l'app iOS ne montre plus (SerpentNatif le remplace) : ce banc dit ce que voit un navigateur.
Commandes : `node outils/banc-serpent/serpent-film.cjs "<url>?tel=1" 4 12` (×2 par version), `serpent-trace.cjs` (×1 par version).

## serpent-film (images distinctes, trous)
| passe | version | images | distinctes/s | trous > 120 ms | pire trou | premier trou |
|---|---|---|---|---|---|---|
| 1 | main | 125 | 6,4 | 14 | 1 400 ms | 110 → 210 ms |
| 1 | serpent-fluide | 45 | 3,6 | 14 | 684 ms | 99 → 447 ms |
| 2 | main | 90 | 6,3 | 10 | 1 795 ms (à 50 ms) | |
| 2 | serpent-fluide | 8 | 0,4 | 2 | 3 060 ms (à 1,1 s) | 159 → 986 ms |

## serpent-trace (instants où le compositeur présente une image, serpent visible)
| version | serpent visible | pire écart | écarts > 60 ms |
|---|---|---|---|
| main | 0,86 → 9,3 s | 1 036 ms (à 9,3 s), 361 ms (à 8,9 s) | 7 (dont 4 à 1,2-1,8 s) |
| serpent-fluide | 0,82 → 12,1 s | 185 ms (à 7,4 s) | 3 |

## Lecture (prudente)
- Trace : les gros trous de main (1 036 et 361 ms) tombent à 8,9-9,3 s, juste avant la fin du serpent, au moment des envois de textures et de la chauffe ; chez serpent-fluide le pire écart est de 185 ms : le travail est étalé (piste en tranches de 8 ms, textures montées une à une).
- Film : dans ce banc serpent-fluide fait MOINS d'images distinctes que main (3,6 et 0,4 contre 6,4 et 6,3/s), et la passe 2 contient un gel de 3 060 ms à 1,1 s. Deux passes seulement, Mac saturé : à ne pas lire comme une régression établie ni comme une preuve de gain ; à refaire machine calme.
- Le serpent web reste visible 2,8 s de plus (12,1 s contre 9,3 s) : en tranches, le chargement prend plus d'images d'écran (≥ 1 par tranche), et le CPU ×4 sur Mac chargé l'exagère. Sur iPhone 13 Pro (build 10) le guet finit à 3,7 s contre 6 s au build 9 (lu par OPTI ULTIME).

## Boule de l'intro : plafond de toile 2 (gauche) contre 1,5 (droite) — `2026-11-07-boule-S2-vs-S1.5.png`
Capture du film figé à t = 3,2 s (`dbgIntro.voir`), Chrome headless, écran à densité 4 (la page du jeu y voit 2 : sans cela le plafond n'agit pas, la page-cadre du banc donne 1,5 à `?tel=1`), recadrage sur la boule.
Écart entre les deux images entières : 0,10 / 255 en moyenne, 0,02 % des pixels de plus de 32/255, tous dans la zone de la boule (349 × 273 px). À 1,5 les chiffres sont à peine plus doux ; à taille d'écran normale rien de visible. Les positions des chiffres diffèrent un peu (le film est dessiné à la volée) : à juger sur le téléphone avec `?intros=2` (= avant) ; l'intérêt de temps de 1,5 n'est PAS mesuré (Mac saturé, charge > 400).
Commandes : `DSF=4 BOULE_PNG=<fichier> node outils/banc-serpent/serpent-sonde.cjs "http://127.0.0.1:3188/index.html?tel=1&colonne=1&intros=<S>&depart=toucher" 1 8`.
