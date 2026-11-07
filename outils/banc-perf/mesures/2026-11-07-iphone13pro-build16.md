# iPhone 13 Pro — build 16 (perf3-main + vitesse-fluide ab55ef1e + banc-iphone-2 + P6 + P1 + P2, --banc p7, v 3935f9b) — banc automatique du 2026-11-07, session BANC-IPHONE

## Sentinelle et conditions
- Règle appliquée : app tuée depuis 20:20:45, repos jusqu'à **budget thermique ≥ 380** au syslog (atteint 20:26:27 : 390 ; 472 au départ du banc à 20:27:24).
- Lancement par `iphone-auto.sh 16` à 20:27:29. Téléphone **BRANCHÉ** tout du long (Sacha n'a pas répondu, pas de débranchement). Écran allumé, déverrouillé, personne n'a touché l'écran.
- Sentinelle = les 3 premières secondes du run (lancement sain) : origine→DCL **525 ms**, origine→prêt 519, trou initial **469 ms** → SAIN.
- Budget à la fin (20:40:37) : **245**. Minimum pendant le banc : **148 à 20:29:34** (partie 1, 80 s).

## Verdict garde-iphone.cjs : ROUGE — 4 seuils franchis
```
✔ scénario allé au bout (« banc: fini » à 679,8 s) · 0 étape en échec · 0 plantage/rechargement · palier moteur max 16 atteint
✔ plantages : 0
✘ serpent : 2 trou(s) > 120 ms hors le trou initial : 447 ms @1.4 s, 140 ms @2.2 s
✘ fluide : p50 à 8 min = 38.3/50.3 ms (seuil ≤ 20)
✘ mémoire : geo 735→813 (11 %)
✘ gels > 1 s : 6 (1.3, 1.8, 2.8, 1.2, 2.4, 2.2 s)
```
**Mais** : le téléphone s'est bridé 19 s après le lancement (budget < 300 à 20:27:54, au menu) et l'est resté tout le banc. La part du code et la part du bridage ne sont pas séparables sur ce run. Ce qui est sûr : (1) aucun gel ne tombe sur une bascule du gouverneur (`basc=3` constant à tous les gels, `pal=3` dès le menu : le gouverneur est au plancher avant même la course) ; (2) le serpent au lancement sain est MEILLEUR que sur 17/18 (pire trou 897 à 0,5 s, « étape rendu » 447 contre 718-1151).

## Les 5 seuils, en chiffres
| seuil | valeur | état |
|---|---|---|
| serpent 0 trou > 120 ms hors initial | 447 @1,4 s (fil bloqué, JS -), 140 @2,2 s (photoTour 120) ; pire 897 @0,5 s ; guet 2,4 s ; créations renderer 5 · prepare 24 · son 64 | ✘ |
| fluide p50 ≤ 20 ms à 8 min | 38,3 / 50,3 ms (lignes à 665 et 669 s, ville, palier 16, 998/939 km/h, cadence 30, cran QL 6, dose 230 « chaud », pal=3 basc=3) | ✘ |
| mémoire ±5 % | partie 1 : tex 148 géo 735 prog 216 · partie 2 : tex 152 géo 813 prog 216 (+11 %) · final : tex 151 géo 803 prog 216 | ✘ (géo) |
| 0 gel > 1 s en course | 6 (détail ci-dessous), dont 4 en course | ✘ |
| 0 plantage | 0 | ✔ |

## p50 à 2 / 5 / 8 min (étapes du banc, par partie)
| | partie 1 (départ 20:28:16, t 41,9 s) | partie 2 (départ 20:33:40, t 365,9 s) |
|---|---|---|
| 20 s | p50 53 · pire 1275 | p50 64 · pire 1235 |
| 2 min | p50 120 (t 163 s, palier 1) | p50 278 (t 508 s, palier 11) ; **p50 817 à 162 s (palier 13, 25 images en 20 s)** |
| 5 min / fin | p50 95 (fin 342 s, palier max 6, 485 km/h) | p50 65 (fin 666 s, palier 16, 888 km/h) ; 20:38:32 p50 51 |
| 8 min (470 s+) | — | 20:35:22 p50 150 · 20:35:42 p50 337 · 20:36:02 p50 278 · 20:36:22 p50 817 · 20:36:42 p50 345 · 20:37:02 p50 289 · 20:37:51 p50 88 · 20:38:11 p50 100 · 20:38:32 p50 51 |
| écran de mort | 11 002 ms (gel 2,8 s) | 8 915 ms (gel 1,85 s) |

Le menu lui-même : « titre → menu » p50 17 (11 s), puis **« menu 5 s » p50 90**, garage p50 80, inventaire p50 251, boutique pire 1728 ms, retour accueil pire 1130 ms. Le téléphone est déjà à 90 ms/image au menu, 15 s après un lancement sain.

## Les gels, datés contre le budget thermique
| heure | gel | classes du body | pal / basc | moment du banc | budget |
|---|---|---|---|---|---|
| 20:28:00 | ×5 · 1,0 s | dead inGarage garMenuH titreCiel | 3 / 3 | menu → garage → boutique (t 16-31 s) | 286 → ~200 |
| 20:28:16 | ×2 · 1,3 s | play hPwr | 3 / 3 | départ partie 1 (pire 1275 à 42,8 s) | ~200 |
| 20:29:00 | 1,8 s | play hPwr | **0 / 0** | partie 1, t 86 s, palier 0, 201 km/h (pire 1815) | 156 |
| 20:33:26 | 2,8 s | dead chOffre | 3 / 3 | écran de mort partie 1 (11 s) | 261 |
| 20:33:41 | ×7 · 1,2 s | play hPwr | 3 / 3 | départ partie 2 (pire 1235 à 367 s) | ~250 |
| 20:34:18 | 2,4 s | play hPwr | 3 / 3 | partie 2, t 404 s, palier 4 (pire 2362) | 243 |
| 20:36:10 | ×2 · 2,2 s | play hPwr ebPlonge | 3 / 3 | partie 2, t 516 s, palier 13, eau (pire 2161) | 278 ↗ |
`basc=` ne bouge pas entre deux gels : aucun gel ne tombe sur une bascule du gouverneur. La ligne `pal=0 basc=0` de 20:29:00 est isolée (remise à zéro au départ de partie ?), les autres sont toutes à `pal=3 basc=3`.

## Budget thermique pendant le banc (branché)
```
20:27:02 463 (lancement 20:27:29, 482 max) · 20:27:54 286 (menu : < 300 en 19 s) · 20:28:54 156 (partie 1, 20 s) · 20:29:34 148 (minimum) · 20:30 154-159 · 20:31 169-222
20:32:36 267 · 20:33:25 261 (mort 1) · 20:34:02 243 · 20:35:00 183 · 20:36:01 278 · 20:37:02 367 · 20:38:00 442 · 20:39:00 375 · 20:40:00 292 · 20:40:37 245 (fin, accueil)
```
Observation à ne pas sur-interpréter : le budget REMONTE (278 → 442) à 20:36-20:38, pendant les pires images de la partie 2 (p50 300-800 ms, paliers 13-16, plongeon). Il ne se lit donc pas comme « plus haut = plus fluide » pendant la course ; il discrimine au LANCEMENT (≥ 330 sain / ≤ 300 bridé), ce que ce run confirme encore (472 → serpent sain).

## Géométries entre parties
| | départ | fin |
|---|---|---|
| partie 1 | tex 137 géo 606 prog 216 | tex 148/149 géo 735 prog 216 |
| partie 2 | tex 148 géo 597 prog 216 | tex 152 géo 813 prog 216 (fin de course : géo 803 à la mort) |
Le départ revient à ~600 géométries : pas de fuite entre parties, mais la partie 2 (palier 16, 888 km/h) en monte 11 % de plus que la partie 1 (palier 6).

## Comparaison avec le build 13 (run 4 de 16:32, bridage non mesuré)
| | build 13 @16:32 | build 16 @20:27 |
|---|---|---|
| serpent | 3572 / 3006 / 833 / 9058 ms (lancement bridé) | 469 / 897 / 447 / 140 (lancement sain, budget 472) |
| gels > 1 s | 15 (jusqu'à 9,1 s) | 6 (max 2,8 s) |
| p50 à 8 min | 45-83 ms | 38-50 ms |
| mémoire | géo 687→633→835 | géo 735→813 |
| palier 16 | atteint | atteint |
| plantages | 1 | 0 |
Mieux partout, mais les deux runs sont sur téléphone bridé en cours de banc : pas une preuve de gain de code.

## Non mesuré et pourquoi
- La part du bridage dans les 4 seuils rouges : le banc 13 min ne peut pas être fait sans que le téléphone se bride (19 s après le lancement au menu, branché). La suite (OPTI ULTIME décide) : mesure « menu thermique » 18 vs 16 (5 min à l'accueil, pente du budget), puis variantes `--qs` (gouvmax, imgmax, menumax, tout-max) demandées à perfmob-integ, une à la fois, budget ≥ 380 avant chaque banc.
- Débranché : pas fait (Sacha absent). À refaire débranché quand il est là.
- Les lignes `fluide` n'existent qu'à 665 et 669 s (deux lignes), pas « toutes les 20 s » : la sonde fluide ne semble écrire qu'en fin de partie 2 ; les p50 intermédiaires viennent des étapes du banc.
- Le .md généré par iphone-auto.sh (outils/banc-perf/mesures/…build16.md) liste les étapes de TOUS les runs de la boîte noire (le grep n'applique pas --depuis) : lire les étapes à partir de 20:27:35 (run 5).

## Arrêt 20:45
Sacha a repris le téléphone à 20:45. Mesure « menu thermique » (18 vs 16) et bissection --qs (gouvmax, imgmax, menumax, tout-max) NON FAITES, à reprendre quand le téléphone sera rendu (branché, déverrouillé, écran allumé, budget ≥ 380). Courbe du budget de toute la soirée : 2026-11-07-iphone13pro-budget-thermique-soiree.txt.

## Lecture d'OPTI ULTIME (20:50)
- Le budget qui remonte en course (278 → 442 à 20:36-20:38) pendant les pires images = le gouverneur a réduit la charge (pal=3, cadence 30, QL 6) : cohérent, pas contradictoire.
- Bissection gouvmax/imgmax/menumax EN ATTENTE (le 16 se bride au menu avant la course). Plan à la reprise : menu thermique 16 puis 18 ; puis build 22 = main actuel + banc automatique seul (--banc p7), alternance MAIN / 16 / MAIN / 16, même repos (budget ≥ 380) et branché pareil, tableau côte à côte (5 seuils, p50 à 2/5/8 min, gels, budget min). Le 16 doit être ≥ main dans le même état thermique, pas battre la chaleur.
