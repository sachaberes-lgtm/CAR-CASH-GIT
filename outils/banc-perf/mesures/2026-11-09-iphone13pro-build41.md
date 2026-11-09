# iPhone 13 Pro — build 41 — banc automatique du 2026-11-09

Lancé à 09/11 04:01 par `outils/banc-perf/iphone-auto.sh 41` (l'app se joue seule : banc-iphone.js ; brut : `2026-11-09-iphone13pro-build41-brut.txt`).

## Le scénario
✔ scénario : allé au bout (« banc: fini »)
✔ étapes en échec : 0
✔ plantage / rechargement détecté par le banc : 0
✔ palier moteur max atteint : 16

## Les seuils P7 (garde-iphone.cjs)
```
✔ serpent : 0 trou > 120 ms hors le trou initial (0 relevé(s))
✔ plantages : 0
✘ fluide : aucune ligne à ≥ 8 min (470 s) — partie trop courte, seuil NON vérifié
✘ mémoire : geo 857→901 (5 %)
✘ gels > 1 s : 3 (1.7, 1.5, 2 s)
✘ GARDE IPHONE : 3 seuil(s) franchi(s) — la vague ne part pas
```

## Les étapes (pire image depuis l'étape d'avant)
```
09/11 02:51:58 partie 2 · mort · t 655.7 s · pire 269 ms (à 654.6 s) · p50 43 · p90 150 ms · 63 images · >50 ms: 25 · >100 ms: 12 · écran de mort en 3987 ms · tex 157 · géo 816 · prog 228
09/11 02:52:02 fini 659.1 s
09/11 02:57:15 début · run 12 · scénario p7 · partie 300 s · v 8a10c5e · app native · 390×844 @3 · wakeLock oui
09/11 02:57:34 menu à 19.5 s
09/11 02:57:56 partie 1 : départ à t 41.5 s · tex 140 · géo 674 · prog 232 · palier 0
09/11 03:02:08 partie 1 · mort anticipée n°1 à 252 s · t 293.8 s · pire 429 ms (à 288.1 s) · p50 44 · p90 76 ms · 140 images · >50 ms: 42 · >100 ms: 9 · palier 7 · v max 551 km/h
09/11 03:02:56 partie 1 · fin de course · t 341.6 s · pire 149 ms (à 336.5 s) · p50 27 · p90 38 ms · 297 images · >50 ms: 10 · >100 ms: 3 · palier max 7 (cible —) · v max 551 km/h · 1 mort(s) anticipée(s) · tex 157 · géo 695 · prog 232
09/11 03:03:04 partie 1 · mort · t 350.2 s · pire 488 ms (à 344.7 s) · p50 39 · p90 169 ms · 125 images · >50 ms: 37 · >100 ms: 22 · écran de mort en 8595 ms · tex 157 · géo 690 · prog 232
09/11 03:03:17 partie 2 : départ à t 362.7 s · tex 157 · géo 1196 · prog 232 · palier 0
09/11 03:04:46 partie 2 · mort anticipée n°1 à 90 s · t 452.2 s · pire 324 ms (à 452 s) · p50 32 · p90 89 ms · 197 images · >50 ms: 41 · >100 ms: 14 · palier 7 · v max 542 km/h
09/11 03:08:06 partie 2 · mort anticipée n°2 à 289 s · t 651.5 s · pire 410 ms (à 634.9 s) · p50 60 · p90 134 ms · 240 images · >50 ms: 165 · >100 ms: 36 · palier 17 · v max 737 km/h
09/11 03:08:24 partie 2 · fin de course · t 670.2 s · pire 345 ms (à 657.5 s) · p50 28 · p90 57 ms · 458 images · >50 ms: 70 · >100 ms: 26 · palier max 17 (cible 16) · v max 737 km/h · 2 mort(s) anticipée(s) · tex 158 · géo 780 · prog 232
09/11 03:08:30 partie 2 · mort · t 676 s · pire 783 ms (à 671.1 s) · p50 47 · p90 222 ms · 61 images · >50 ms: 27 · >100 ms: 14 · écran de mort en 5792 ms · tex 161 · géo 853 · prog 233
09/11 03:08:34 fini 679.7 s
09/11 03:13:27 début · run 13 · scénario p7 · partie 300 s · v c82b540 · app native · 390×844 @3 · wakeLock oui
09/11 03:13:41 menu à 14.8 s
09/11 03:14:03 partie 1 : départ à t 36.7 s · tex 140 · géo 581 · prog 228 · palier 0
09/11 03:19:03 partie 1 · fin de course · t 337.1 s · pire 388 ms (à 335.1 s) · p50 50 · p90 94 ms · 262 images · >50 ms: 120 · >100 ms: 24 · palier max 11 (cible —) · v max 676 km/h · 0 mort(s) anticipée(s) · tex 157 · géo 740 · prog 228
09/11 03:19:12 partie 1 · mort · t 345.8 s · pire 265 ms (à 340.4 s) · p50 36 · p90 80 ms · 180 images · >50 ms: 52 · >100 ms: 12 · écran de mort en 8716 ms · tex 159 · géo 758 · prog 228
09/11 03:19:12 partie 2 : départ à t 346.2 s · tex 154 · géo 647 · prog 228 · palier 0
09/11 03:22:15 partie 2 · mort anticipée n°1 à 183 s · t 529.3 s · pire 178 ms (à 529 s) · p50 27 · p90 49 ms · 45 images · >50 ms: 4 · >100 ms: 3 · palier 14 · v max 908 km/h
09/11 03:24:01 partie 2 · mort anticipée n°2 à 289 s · t 635.1 s · pire 259 ms (à 632.4 s) · p50 33 · p90 74 ms · 143 images · >50 ms: 30 · >100 ms: 4 · palier 16 · v max 1164 km/h
09/11 03:24:20 partie 2 · fin de course · t 653.6 s · pire 373 ms (à 637.2 s) · p50 26 · p90 40 ms · 571 images · >50 ms: 44 · >100 ms: 13 · palier max 16 (cible 16) · v max 1164 km/h · 2 mort(s) anticipée(s) · tex 154 · géo 519 · prog 228
09/11 03:24:25 partie 2 · mort · t 658.9 s · pire 864 ms (à 654.8 s) · p50 33 · p90 196 ms · 80 images · >50 ms: 15 · >100 ms: 10 · écran de mort en 5359 ms · tex 156 · géo 857 · prog 229
09/11 03:24:29 fini 662.6 s
09/11 03:29:37 début · run 14 · scénario p7 · partie 300 s · v 8a10c5e · app native · 390×844 @3 · wakeLock oui
09/11 03:29:56 x2 banc | banc: menu à 19.6 s
09/11 03:30:18 partie 1 : départ à t 41.5 s · tex 140 · géo 628 · prog 232 · palier 0
09/11 03:34:33 partie 1 · mort anticipée n°1 à 256 s · t 297.2 s · pire 249 ms (à 294.1 s) · p50 44 · p90 71 ms · 234 images · >50 ms: 74 · >100 ms: 12 · palier 10 · v max 390 km/h
09/11 03:35:18 partie 1 · fin de course · t 341.9 s · pire 123 ms (à 339.4 s) · p50 27 · p90 41 ms · 206 images · >50 ms: 6 · >100 ms: 1 · palier max 10 (cible —) · v max 390 km/h · 1 mort(s) anticipée(s) · tex 156 · géo 805 · prog 233
09/11 03:35:26 partie 1 · mort · t 350.1 s · pire 360 ms (à 344.9 s) · p50 31 · p90 160 ms · 158 images · >50 ms: 26 · >100 ms: 19 · écran de mort en 8217 ms · tex 157 · géo 836 · prog 233
09/11 03:35:27 partie 2 : départ à t 350.6 s · tex 156 · géo 686 · prog 233 · palier 0
09/11 03:36:07 partie 2 · 41 s · t 391.4 s · pire 114 ms (à 386.4 s) · p50 17 · p90 27 ms · 1087 images · >50 ms: 12 · >100 ms: 1 · palier 4 · 185 km/h · mode drive · pouvoir n
09/11 03:36:28 partie 2 · 61 s · t 411.6 s · pire 101 ms (à 404.5 s) · p50 17 · p90 33 ms · 946 images · >50 ms: 18 · >100 ms: 1 · palier 5 · 295 km/h · mode drive · pouvoir a
09/11 03:36:48 partie 2 · 81 s · t 431.8 s · pire 231 ms (à 418.7 s) · p50 30 · p90 45 ms · 648 images · >50 ms: 49 · >100 ms: 10 · palier 7 · 271 km/h · mode drive · pouvoir v
09/11 03:37:08 partie 2 · 101 s · t 452 s · pire 208 ms (à 443 s) · p50 36 · p90 64 ms · 485 images · >50 ms: 107 · >100 ms: 22 · palier 8 · 277 km/h · mode drive · pouvoir m
09/11 03:37:28 partie 2 · 122 s · t 472.4 s · pire 298 ms (à 466.5 s) · p50 36 · p90 91 ms · 430 images · >50 ms: 109 · >100 ms: 36 · palier 10 · 334 km/h · mode drive · pouvoir x
09/11 03:37:49 partie 2 · 142 s · t 492.9 s · pire 170 ms (à 484.1 s) · p50 30 · p90 61 ms · 575 images · >50 ms: 82 · >100 ms: 20 · palier 11 · 401 km/h · mode drive · pouvoir n
09/11 03:38:04 partie 2 · mort anticipée n°1 à 157 s · t 507.5 s · pire 183 ms (à 501.3 s) · p50 34 · p90 66 ms · 348 images · >50 ms: 62 · >100 ms: 10 · palier 12 · v max 430 km/h
09/11 03:38:04 partie 2 · mort anticipée n°1 à 157 s · t 507.5 s · pire 183 ms (à 501.3 s) · p50 34 · p90 66 ms · 348 images · >50 ms: 62 · >100 ms: 10 · palier 12 · v max 430 km/h
09/11 03:38:07 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:38:22 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:38:22 REJOUER : course lancée en 15.5 s, voile levé
09/11 03:38:42 partie 2 · 196 s · t 546.4 s · pire 560 ms (à 514.3 s) · p50 24 · p90 69 ms · 1056 images · >50 ms: 151 · >100 ms: 67 · palier 4 · 190 km/h · mode drive · pouvoir a
09/11 03:39:02 partie 2 · 216 s · t 566.4 s · pire 190 ms (à 552.4 s) · p50 37 · p90 58 ms · 460 images · >50 ms: 79 · >100 ms: 17 · palier 7 · 242 km/h · mode drive · pouvoir v
09/11 03:39:23 partie 2 · 236 s · t 586.9 s · pire 228 ms (à 570.3 s) · p50 31 · p90 49 ms · 573 images · >50 ms: 54 · >100 ms: 12 · palier 10 · 350 km/h · mode drive · pouvoir m
09/11 03:39:43 partie 2 · 257 s · t 607.3 s · pire 302 ms (à 597.4 s) · p50 32 · p90 62 ms · 511 images · >50 ms: 90 · >100 ms: 28 · palier 14 · 401 km/h · mode drive · pouvoir x
09/11 03:39:55 partie 2 · mort anticipée n°2 à 268 s · t 619 s · pire 263 ms (à 616.7 s) · p50 44 · p90 90 ms · 211 images · >50 ms: 72 · >100 ms: 18 · palier 15 · v max 457 km/h
09/11 03:39:55 partie 2 · mort anticipée n°2 à 268 s · t 619 s · pire 263 ms (à 616.7 s) · p50 44 · p90 90 ms · 211 images · >50 ms: 72 · >100 ms: 18 · palier 15 · v max 457 km/h
09/11 03:39:58 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:40:15 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:40:16 REJOUER : course lancée en 17.9 s, voile levé
09/11 03:40:27 partie 2 · fin de course · t 650.7 s · pire 1407 ms (à 632.7 s) · p50 37 · p90 129 ms · 437 images · >50 ms: 138 · >100 ms: 55 · palier max 15 (cible 16) · v max 457 km/h · 2 mort(s) anticipée(s) · tex 157 · géo 767 · prog 233
09/11 03:40:27 partie 2 · fin de course · t 650.7 s · pire 1407 ms (à 632.7 s) · p50 37 · p90 129 ms · 437 images · >50 ms: 138 · >100 ms: 55 · palier max 15 (cible 16) · v max 457 km/h · 2 mort(s) anticipée(s) · tex 157 · géo 767 · prog 233
09/11 03:40:30 partie 2 · mort · t 654.2 s · pire 473 ms (à 653.5 s) · p50 31 · p90 117 ms · 65 images · >50 ms: 18 · >100 ms: 9 · écran de mort en 3499 ms · tex 157 · géo 769 · prog 233
09/11 03:40:30 partie 2 · mort · t 654.2 s · pire 473 ms (à 653.5 s) · p50 31 · p90 117 ms · 65 images · >50 ms: 18 · >100 ms: 9 · écran de mort en 3499 ms · tex 157 · géo 769 · prog 233
09/11 03:40:30 ⚠ palier 16 non atteint (max 15)
09/11 03:40:30 ⚠ palier 16 non atteint (max 15)
09/11 03:40:33 retour accueil final · t 657.3 s · pire 899 ms (à 656.8 s) · p50 613 · p90 899 ms · 5 images · >50 ms: 5 · >100 ms: 4
09/11 03:40:33 fini 657.3 s
09/11 03:40:33 fini 657.3 s
09/11 03:45:47 début · run 15 · scénario p7 · partie 300 s · v c82b540 · app native · 390×844 @3 · wakeLock oui
09/11 03:45:47 début · run 15 · scénario p7 · partie 300 s · v c82b540 · app native · 390×844 @3 · wakeLock oui
09/11 03:45:47 titre : vis visible · doc complete · intro attente · prêt true · lance false · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 03:45:48 wakeLock refusé : Permission was denied
09/11 03:45:55 boule prête à t 9.2 s · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 03:45:55 tapBoule appelé · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 03:46:01 titre → menu · t 15.1 s · pire 870 ms (à 1.8 s) · p50 17 · p90 26 ms · 653 images · >50 ms: 20 · >100 ms: 7
09/11 03:46:01 menu à 15.1 s
09/11 03:46:01 menu à 15.1 s
09/11 03:46:06 menu 5 s · t 20.2 s · pire 30 ms (à 16.7 s) · p50 17 · p90 18 ms · 300 images · >50 ms: 0 · >100 ms: 0
09/11 03:46:08 garage ouvert · t 21.7 s · pire 122 ms (à 20.5 s) · p50 17 · p90 20 ms · 85 images · >50 ms: 1 · >100 ms: 1 · tex 126 · géo 616 · prog 211
09/11 03:46:10 garage 2,5 s · t 24.2 s · pire 20 ms (à 21.8 s) · p50 17 · p90 19 ms · 151 images · >50 ms: 0 · >100 ms: 0
09/11 03:46:11 inventaire ouvert · t 25 s · pire 42 ms (à 24.3 s) · p50 17 · p90 22 ms · 48 images · >50 ms: 0 · >100 ms: 0
09/11 03:46:11 inventaire : rien à défiler (grille 161/161)
09/11 03:46:11 inventaire défilé · t 25 s · 0 image
09/11 03:46:12 boutique ouverte en 6 ms
09/11 03:46:15 boutique ouverte 2,5 s · t 28.5 s · pire 303 ms (à 26.6 s) · p50 17 · p90 19 ms · 177 images · >50 ms: 3 · >100 ms: 3
09/11 03:46:21 retour accueil · t 35.2 s · pire 116 ms (à 33.8 s) · p50 17 · p90 17 ms · 386 images · >50 ms: 2 · >100 ms: 1
09/11 03:46:21 JOUER cliqué (essai 1, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome on · splash - · started false · running false · over false · mode drive · garage true
09/11 03:46:23 JOUER : course lancée en 1.9 s, voile levé
09/11 03:46:23 partie 1 : départ à t 37.1 s · tex 140 · géo 583 · prog 228 · palier 0
09/11 03:46:23 partie 1 : départ à t 37.1 s · tex 140 · géo 583 · prog 228 · palier 0
09/11 03:46:44 partie 1 · 20 s · t 57.5 s · pire 61 ms (à 37.1 s) · p50 17 · p90 23 ms · 1161 images · >50 ms: 1 · >100 ms: 0 · palier 0 · 171 km/h · mode drive · pouvoir a
09/11 03:47:04 partie 1 · 41 s · t 77.9 s · pire 30 ms (à 70.6 s) · p50 17 · p90 18 ms · 1223 images · >50 ms: 0 · >100 ms: 0 · palier 0 · 181 km/h · mode drive · pouvoir v
09/11 03:47:24 partie 1 · 61 s · t 97.9 s · pire 84 ms (à 79.1 s) · p50 17 · p90 26 ms · 1050 images · >50 ms: 8 · >100 ms: 0 · palier 1 · 192 km/h · mode drive · pouvoir m
09/11 03:47:44 partie 1 · 81 s · t 118 s · pire 138 ms (à 103.6 s) · p50 17 · p90 31 ms · 1021 images · >50 ms: 18 · >100 ms: 2 · palier 2 · 229 km/h · mode drive · pouvoir x
09/11 03:48:04 partie 1 · 101 s · t 138 s · pire 63 ms (à 131.2 s) · p50 18 · p90 29 ms · 1071 images · >50 ms: 2 · >100 ms: 0 · palier 2 · 198 km/h · mode drive · pouvoir n
09/11 03:48:25 partie 1 · 121 s · t 158.3 s · pire 136 ms (à 142.6 s) · p50 29 · p90 47 ms · 704 images · >50 ms: 52 · >100 ms: 5 · palier 3 · 210 km/h · mode drive · pouvoir a
09/11 03:48:45 partie 1 · 142 s · t 178.6 s · pire 139 ms (à 162.8 s) · p50 33 · p90 46 ms · 626 images · >50 ms: 45 · >100 ms: 4 · palier 4 · 204 km/h · mode drive · pouvoir v
09/11 03:49:05 partie 1 · 162 s · t 198.7 s · pire 228 ms (à 181 s) · p50 31 · p90 51 ms · 633 images · >50 ms: 65 · >100 ms: 7 · palier 4 · 245 km/h · mode drive · pouvoir m
09/11 03:49:25 partie 1 · 182 s · t 218.7 s · pire 279 ms (à 207.6 s) · p50 35 · p90 59 ms · 505 images · >50 ms: 91 · >100 ms: 13 · palier 5 · 268 km/h · mode drive · pouvoir x
09/11 03:49:45 partie 1 · 202 s · t 239.1 s · pire 158 ms (à 219 s) · p50 37 · p90 55 ms · 541 images · >50 ms: 76 · >100 ms: 6 · palier 6 · 263 km/h · mode drive · pouvoir n
09/11 03:50:06 partie 1 · 222 s · t 259.5 s · pire 168 ms (à 239.3 s) · p50 45 · p90 66 ms · 415 images · >50 ms: 152 · >100 ms: 12 · palier 7 · 287 km/h · mode drive · pouvoir a
09/11 03:50:26 partie 1 · 243 s · t 279.9 s · pire 198 ms (à 264.1 s) · p50 35 · p90 51 ms · 563 images · >50 ms: 65 · >100 ms: 7 · palier 8 · 352 km/h · mode drive · pouvoir v
09/11 03:50:46 partie 1 · 263 s · t 300 s · pire 679 ms (à 287.6 s) · p50 45 · p90 66 ms · 396 images · >50 ms: 124 · >100 ms: 10 · palier 9 · 296 km/h · mode drive · pouvoir m
09/11 03:51:07 partie 1 · 283 s · t 320.4 s · pire 138 ms (à 300.2 s) · p50 40 · p90 58 ms · 488 images · >50 ms: 97 · >100 ms: 6 · palier 10 · 386 km/h · mode drive · pouvoir x
09/11 03:51:24 partie 1 · fin de course · t 337.2 s · pire 258 ms (à 322 s) · p50 56 · p90 90 ms · 262 images · >50 ms: 192 · >100 ms: 22 · palier max 11 (cible —) · v max 414 km/h · 0 mort(s) anticipée(s) · tex 144 · géo 664 · prog 228
09/11 03:51:24 partie 1 · fin de course · t 337.2 s · pire 258 ms (à 322 s) · p50 56 · p90 90 ms · 262 images · >50 ms: 192 · >100 ms: 22 · palier max 11 (cible —) · v max 414 km/h · 0 mort(s) anticipée(s) · tex 144 · géo 664 · prog 228
09/11 03:51:32 partie 1 · mort · t 345.8 s · pire 288 ms (à 345.7 s) · p50 38 · p90 75 ms · 164 images · >50 ms: 53 · >100 ms: 11 · écran de mort en 8537 ms · tex 146 · géo 592 · prog 228
09/11 03:51:32 partie 1 · mort · t 345.8 s · pire 288 ms (à 345.7 s) · p50 38 · p90 75 ms · 164 images · >50 ms: 53 · >100 ms: 11 · écran de mort en 8537 ms · tex 146 · géo 592 · prog 228
09/11 03:51:32 REJOUER cliqué (essai 1, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:51:39 REJOUER : course lancée en 7.4 s, voile levé
09/11 03:51:39 partie 2 : départ à t 353.1 s · tex 146 · géo 1215 · prog 228 · palier 0
09/11 03:51:39 partie 2 : départ à t 353.1 s · tex 146 · géo 1215 · prog 228 · palier 0
09/11 03:52:00 partie 2 · 20 s · t 373.2 s · pire 588 ms (à 353.3 s) · p50 17 · p90 30 ms · 992 images · >50 ms: 20 · >100 ms: 2 · palier 2 · 208 km/h · mode drive · pouvoir n
09/11 03:52:20 partie 2 · 40 s · t 393.2 s · pire 108 ms (à 379.6 s) · p50 17 · p90 32 ms · 1006 images · >50 ms: 13 · >100 ms: 1 · palier 4 · 220 km/h · mode drive · pouvoir a
09/11 03:52:40 partie 2 · 60 s · t 413.6 s · pire 60 ms (à 399.6 s) · p50 17 · p90 20 ms · 1206 images · >50 ms: 1 · >100 ms: 0 · palier 5 · 241 km/h · mode drive · pouvoir v
09/11 03:53:00 partie 2 · mort anticipée n°1 à 80 s · t 433.4 s · pire 243 ms (à 433.3 s) · p50 17 · p90 33 ms · 904 images · >50 ms: 32 · >100 ms: 11 · palier 7 · v max 518 km/h
09/11 03:53:00 partie 2 · mort anticipée n°1 à 80 s · t 433.4 s · pire 243 ms (à 433.3 s) · p50 17 · p90 33 ms · 904 images · >50 ms: 32 · >100 ms: 11 · palier 7 · v max 518 km/h
09/11 03:53:03 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:53:18 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:53:18 REJOUER : course lancée en 15.7 s, voile levé
09/11 03:53:39 partie 2 · 119 s · t 472.3 s · pire 443 ms (à 452.6 s) · p50 22 · p90 36 ms · 1482 images · >50 ms: 66 · >100 ms: 26 · palier 3 · 189 km/h · mode drive · pouvoir m
09/11 03:53:59 partie 2 · 139 s · t 492.4 s · pire 127 ms (à 472.5 s) · p50 17 · p90 30 ms · 1036 images · >50 ms: 16 · >100 ms: 2 · palier 5 · 223 km/h · mode drive · pouvoir x
09/11 03:54:19 partie 2 · 159 s · t 512.5 s · pire 140 ms (à 505.7 s) · p50 18 · p90 32 ms · 962 images · >50 ms: 13 · >100 ms: 4 · palier 7 · 256 km/h · mode drive · pouvoir n
09/11 03:54:39 partie 2 · 180 s · t 532.6 s · pire 144 ms (à 515 s) · p50 27 · p90 41 ms · 761 images · >50 ms: 35 · >100 ms: 6 · palier 9 · 243 km/h · mode drive · pouvoir a
09/11 03:54:59 partie 2 · 200 s · t 552.9 s · pire 207 ms (à 549.2 s) · p50 30 · p90 49 ms · 656 images · >50 ms: 60 · >100 ms: 7 · palier 11 · 368 km/h · mode drive · pouvoir v
09/11 03:55:20 partie 2 · 220 s · t 573.3 s · pire 343 ms (à 559.8 s) · p50 35 · p90 58 ms · 547 images · >50 ms: 87 · >100 ms: 13 · palier 13 · 451 km/h · mode drive · pouvoir m
09/11 03:55:25 partie 2 · mort anticipée n°2 à 226 s · t 579 s · pire 178 ms (à 576.7 s) · p50 39 · p90 65 ms · 128 images · >50 ms: 31 · >100 ms: 7 · palier 13 · v max 518 km/h
09/11 03:55:25 partie 2 · mort anticipée n°2 à 226 s · t 579 s · pire 178 ms (à 576.7 s) · p50 39 · p90 65 ms · 128 images · >50 ms: 31 · >100 ms: 7 · palier 13 · v max 518 km/h
09/11 03:55:28 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:55:44 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:55:44 REJOUER : course lancée en 15.9 s, voile levé
09/11 03:56:05 partie 2 · 265 s · t 618.3 s · pire 961 ms (à 598.7 s) · p50 31 · p90 51 ms · 1088 images · >50 ms: 119 · >100 ms: 31 · palier 8 · 272 km/h · mode drive · pouvoir x
09/11 03:56:25 partie 2 · 285 s · t 638.4 s · pire 236 ms (à 619.4 s) · p50 40 · p90 77 ms · 427 images · >50 ms: 109 · >100 ms: 28 · palier 15 · 485 km/h · mode drive · pouvoir n
09/11 03:56:36 partie 2 · mort anticipée n°3 à 296 s · t 649.3 s · pire 289 ms (à 648.7 s) · p50 43 · p90 79 ms · 202 images · >50 ms: 54 · >100 ms: 12 · palier 16 · v max 518 km/h
09/11 03:56:36 partie 2 · mort anticipée n°3 à 296 s · t 649.3 s · pire 289 ms (à 648.7 s) · p50 43 · p90 79 ms · 202 images · >50 ms: 54 · >100 ms: 12 · palier 16 · v max 518 km/h
09/11 03:56:39 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:56:54 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 03:56:54 REJOUER : course lancée en 15.9 s, voile levé
09/11 03:56:55 partie 2 · fin de course · t 668.3 s · pire 204 ms (à 655.4 s) · p50 32 · p90 58 ms · 501 images · >50 ms: 63 · >100 ms: 10 · palier max 16 (cible 16) · v max 518 km/h · 3 mort(s) anticipée(s) · tex 154 · géo 596 · prog 228
09/11 03:56:55 partie 2 · fin de course · t 668.3 s · pire 204 ms (à 655.4 s) · p50 32 · p90 58 ms · 501 images · >50 ms: 63 · >100 ms: 10 · palier max 16 (cible 16) · v max 518 km/h · 3 mort(s) anticipée(s) · tex 154 · géo 596 · prog 228
09/11 03:57:00 partie 2 · mort · t 673.8 s · pire 910 ms (à 668.9 s) · p50 44 · p90 139 ms · 62 images · >50 ms: 26 · >100 ms: 11 · écran de mort en 5569 ms · tex 158 · géo 735 · prog 229
09/11 03:57:00 partie 2 · mort · t 673.8 s · pire 910 ms (à 668.9 s) · p50 44 · p90 139 ms · 62 images · >50 ms: 26 · >100 ms: 11 · écran de mort en 5569 ms · tex 158 · géo 735 · prog 229
09/11 03:57:04 retour accueil final · t 677.7 s · pire 1253 ms (à 675.6 s) · p50 143 · p90 754 ms · 11 images · >50 ms: 8 · >100 ms: 6
09/11 03:57:04 fini 677.7 s
09/11 03:57:04 fini 677.7 s
09/11 04:01:59 début · run 16 · scénario p7 · partie 300 s · v 8a10c5e · app native · 390×844 @3 · wakeLock oui
09/11 04:01:59 début · run 16 · scénario p7 · partie 300 s · v 8a10c5e · app native · 390×844 @3 · wakeLock oui
09/11 04:01:59 titre : vis visible · doc complete · intro attente · prêt true · lance false · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 04:01:59 wakeLock refusé : Permission was denied
09/11 04:02:07 film pas lancé : lancer(true) · vis visible · doc complete · intro attente · prêt true · lance false · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 04:02:12 boule prête à t 13.6 s · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 04:02:12 tapBoule appelé · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 04:02:18 titre → menu · t 19.6 s · pire 537 ms (à 1.8 s) · p50 17 · p90 20 ms · 956 images · >50 ms: 17 · >100 ms: 8
09/11 04:02:18 menu à 19.6 s
09/11 04:02:23 menu 5 s · t 24.6 s · pire 167 ms (à 21.8 s) · p50 17 · p90 27 ms · 270 images · >50 ms: 3 · >100 ms: 2
09/11 04:02:25 garage ouvert · t 26.1 s · pire 84 ms (à 24.9 s) · p50 17 · p90 20 ms · 84 images · >50 ms: 1 · >100 ms: 0 · tex 128 · géo 613 · prog 215
09/11 04:02:27 garage 2,5 s · t 28.6 s · pire 64 ms (à 27.8 s) · p50 17 · p90 19 ms · 147 images · >50 ms: 2 · >100 ms: 0
09/11 04:02:28 inventaire ouvert · t 29.5 s · pire 56 ms (à 29.3 s) · p50 17 · p90 23 ms · 47 images · >50 ms: 1 · >100 ms: 0
09/11 04:02:28 inventaire : rien à défiler (grille 161/161)
09/11 04:02:28 inventaire défilé · t 29.5 s · 0 image
09/11 04:02:29 boutique ouverte en 10 ms
09/11 04:02:31 boutique ouverte 2,5 s · t 32.9 s · pire 303 ms (à 31.1 s) · p50 17 · p90 17 ms · 176 images · >50 ms: 3 · >100 ms: 3
09/11 04:02:38 retour accueil · t 39.6 s · pire 107 ms (à 38.2 s) · p50 17 · p90 17 ms · 390 images · >50 ms: 2 · >100 ms: 1
09/11 04:02:38 JOUER cliqué (essai 1, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome on · splash - · started false · running false · over false · mode drive · garage true
09/11 04:02:40 partie 1 : départ à t 41.5 s · tex 141 · géo 614 · prog 232 · palier 0
09/11 04:02:40 JOUER : course lancée en 1.9 s, voile levé
09/11 04:02:40 partie 1 : départ à t 41.5 s · tex 141 · géo 614 · prog 232 · palier 0
09/11 04:03:00 partie 1 · 20 s · t 61.9 s · pire 66 ms (à 41.5 s) · p50 17 · p90 18 ms · 1181 images · >50 ms: 2 · >100 ms: 0 · palier 0 · 199 km/h · mode drive · pouvoir a
09/11 04:03:21 partie 1 · 41 s · t 82.3 s · pire 45 ms (à 66.6 s) · p50 17 · p90 18 ms · 1220 images · >50 ms: 0 · >100 ms: 0 · palier 0 · 166 km/h · mode drive · pouvoir v
09/11 04:03:41 partie 1 · 61 s · t 102.7 s · pire 137 ms (à 83.9 s) · p50 17 · p90 22 ms · 1098 images · >50 ms: 18 · >100 ms: 2 · palier 1 · 173 km/h · mode drive · pouvoir m
09/11 04:04:02 partie 1 · 82 s · t 123.2 s · pire 140 ms (à 111.9 s) · p50 17 · p90 22 ms · 1160 images · >50 ms: 8 · >100 ms: 2 · palier 1 · 214 km/h · mode fall · figure 0 refusée
09/11 04:04:22 partie 1 · 102 s · t 143.3 s · pire 195 ms (à 142.4 s) · p50 17 · p90 33 ms · 944 images · >50 ms: 17 · >100 ms: 3 · palier 2 · 208 km/h · mode drive · pouvoir n
09/11 04:04:42 partie 1 · 122 s · t 163.4 s · pire 132 ms (à 159.9 s) · p50 23 · p90 38 ms · 829 images · >50 ms: 17 · >100 ms: 1 · palier 3 · 250 km/h · mode drive · pouvoir a
09/11 04:05:02 partie 1 · 142 s · t 183.6 s · pire 139 ms (à 176.3 s) · p50 33 · p90 51 ms · 570 images · >50 ms: 60 · >100 ms: 5 · palier 4 · 228 km/h · mode drive · pouvoir v
09/11 04:05:23 partie 1 · 162 s · t 204 s · pire 184 ms (à 200.2 s) · p50 44 · p90 70 ms · 422 images · >50 ms: 139 · >100 ms: 10 · palier 5 · 234 km/h · mode drive · pouvoir m
09/11 04:05:43 partie 1 · 183 s · t 224.2 s · pire 184 ms (à 212.5 s) · p50 45 · p90 70 ms · 406 images · >50 ms: 136 · >100 ms: 9 · palier 6 · 266 km/h · mode drive · pouvoir x
09/11 04:06:03 partie 1 · 203 s · t 244.5 s · pire 150 ms (à 234.6 s) · p50 41 · p90 59 ms · 449 images · >50 ms: 93 · >100 ms: 8 · palier 7 · 311 km/h · mode drive · pouvoir n
09/11 04:06:23 partie 1 · 223 s · t 264.9 s · pire 217 ms (à 253 s) · p50 34 · p90 56 ms · 563 images · >50 ms: 84 · >100 ms: 8 · palier 8 · 283 km/h · mode drive · pouvoir a
09/11 04:06:44 partie 1 · 244 s · t 285.2 s · pire 379 ms (à 279.9 s) · p50 43 · p90 74 ms · 423 images · >50 ms: 153 · >100 ms: 21 · palier 10 · 350 km/h · mode drive · pouvoir v
09/11 04:07:04 partie 1 · 264 s · t 305.7 s · pire 209 ms (à 300.4 s) · p50 39 · p90 66 ms · 473 images · >50 ms: 99 · >100 ms: 15 · palier 11 · 376 km/h · mode drive · pouvoir m
09/11 04:07:25 partie 1 · 285 s · t 326.1 s · pire 298 ms (à 313.6 s) · p50 71 · p90 143 ms · 240 images · >50 ms: 206 · >100 ms: 50 · palier 13 · 372 km/h · mode drive · pouvoir x
09/11 04:07:40 partie 1 · fin de course · t 341.8 s · pire 298 ms (à 327.9 s) · p50 66 · p90 118 ms · 205 images · >50 ms: 188 · >100 ms: 33 · palier max 13 (cible —) · v max 869 km/h · 0 mort(s) anticipée(s) · tex 158 · géo 798 · prog 232
09/11 04:07:40 partie 1 · fin de course · t 341.8 s · pire 298 ms (à 327.9 s) · p50 66 · p90 118 ms · 205 images · >50 ms: 188 · >100 ms: 33 · palier max 13 (cible —) · v max 869 km/h · 0 mort(s) anticipée(s) · tex 158 · géo 798 · prog 232
09/11 04:07:49 partie 1 · mort · t 351 s · pire 350 ms (à 345.6 s) · p50 30 · p90 119 ms · 170 images · >50 ms: 49 · >100 ms: 18 · écran de mort en 9212 ms · tex 160 · géo 758 · prog 232
09/11 04:07:49 partie 1 · mort · t 351 s · pire 350 ms (à 345.6 s) · p50 30 · p90 119 ms · 170 images · >50 ms: 49 · >100 ms: 18 · écran de mort en 9212 ms · tex 160 · géo 758 · prog 232
09/11 04:07:49 REJOUER cliqué (essai 1, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 04:07:50 REJOUER : course lancée en 1 s, voile levé
09/11 04:07:50 partie 2 : départ à t 352 s · tex 156 · géo 704 · prog 233 · palier 0
09/11 04:07:50 partie 2 : départ à t 352 s · tex 156 · géo 704 · prog 233 · palier 0
09/11 04:08:11 partie 2 · 20 s · t 372.5 s · pire 948 ms (à 352.3 s) · p50 27 · p90 34 ms · 739 images · >50 ms: 23 · >100 ms: 6 · palier 2 · 219 km/h · mode drive · pouvoir n
09/11 04:08:31 partie 2 · 41 s · t 392.8 s · pire 111 ms (à 375 s) · p50 35 · p90 53 ms · 526 images · >50 ms: 65 · >100 ms: 3 · palier 4 · 247 km/h · mode drive · pouvoir a
09/11 04:08:51 partie 2 · 61 s · t 413 s · pire 108 ms (à 394.8 s) · p50 27 · p90 37 ms · 783 images · >50 ms: 17 · >100 ms: 1 · palier 5 · 258 km/h · mode drive · pouvoir v
09/11 04:09:12 partie 2 · 81 s · t 433.4 s · pire 281 ms (à 414.4 s) · p50 33 · p90 54 ms · 525 images · >50 ms: 65 · >100 ms: 10 · palier 7 · 263 km/h · mode drive · pouvoir m
09/11 04:09:27 partie 2 · mort anticipée n°1 à 96 s · t 448.2 s · pire 204 ms (à 445.6 s) · p50 39 · p90 63 ms · 319 images · >50 ms: 65 · >100 ms: 12 · palier 8 · v max 300 km/h
09/11 04:09:27 partie 2 · mort anticipée n°1 à 96 s · t 448.2 s · pire 204 ms (à 445.6 s) · p50 39 · p90 63 ms · 319 images · >50 ms: 65 · >100 ms: 12 · palier 8 · v max 300 km/h
09/11 04:09:30 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 04:09:45 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 04:09:45 REJOUER : course lancée en 15.6 s, voile levé
09/11 04:10:05 partie 2 · 135 s · t 486.8 s · pire 680 ms (à 467.7 s) · p50 17 · p90 61 ms · 1291 images · >50 ms: 167 · >100 ms: 38 · palier 3 · 184 km/h · mode drive · pouvoir x
09/11 04:10:25 partie 2 · 155 s · t 506.9 s · pire 123 ms (à 487 s) · p50 20 · p90 34 ms · 858 images · >50 ms: 21 · >100 ms: 2 · palier 5 · 225 km/h · mode drive · pouvoir n
09/11 04:10:46 partie 2 · 175 s · t 527.2 s · pire 153 ms (à 514.3 s) · p50 24 · p90 38 ms · 811 images · >50 ms: 29 · >100 ms: 1 · palier 7 · 256 km/h · mode drive · pouvoir a
09/11 04:11:06 partie 2 · 195 s · t 547.5 s · pire 301 ms (à 546.1 s) · p50 28 · p90 37 ms · 726 images · >50 ms: 25 · >100 ms: 3 · palier 9 · 278 km/h · mode drive · pouvoir v
09/11 04:11:26 partie 2 · 216 s · t 567.9 s · pire 241 ms (à 549.3 s) · p50 37 · p90 69 ms · 458 images · >50 ms: 125 · >100 ms: 16 · palier 11 · 371 km/h · mode drive · pouvoir m
09/11 04:11:42 partie 2 · mort anticipée n°2 à 232 s · t 583.9 s · pire 326 ms (à 572 s) · p50 53 · p90 99 ms · 244 images · >50 ms: 138 · >100 ms: 21 · palier 13 · v max 415 km/h
09/11 04:11:42 partie 2 · mort anticipée n°2 à 232 s · t 583.9 s · pire 326 ms (à 572 s) · p50 53 · p90 99 ms · 244 images · >50 ms: 138 · >100 ms: 21 · palier 13 · v max 415 km/h
09/11 04:11:45 REJOUER cliqué (essai 1, bouton introuvable) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 04:12:01 REJOUER cliqué (essai 2, bouton trouvé) · vis visible · doc complete · intro null · prêt true · lance true · boule true · fini true · mHome off · splash - · started true · running true · over true · mode boom · garage false
09/11 04:12:01 REJOUER : course lancée en 16.1 s, voile levé
09/11 04:12:22 partie 2 · 271 s · t 623.2 s · pire 943 ms (à 596.7 s) · p50 38 · p90 102 ms · 667 images · >50 ms: 220 · >100 ms: 71 · palier 8 · 218 km/h · mode drive · pouvoir x
09/11 04:12:42 partie 2 · 291 s · t 643.3 s · pire 295 ms (à 637 s) · p50 48 · p90 85 ms · 353 images · >50 ms: 158 · >100 ms: 27 · palier 16 · 468 km/h · mode drive · pouvoir n
09/11 04:12:51 partie 2 · fin de course · t 652.1 s · pire 182 ms (à 650.1 s) · p50 44 · p90 73 ms · 181 images · >50 ms: 60 · >100 ms: 8 · palier max 16 (cible 16) · v max 487 km/h · 2 mort(s) anticipée(s) · tex 160 · géo 914 · prog 233
09/11 04:12:51 partie 2 · fin de course · t 652.1 s · pire 182 ms (à 650.1 s) · p50 44 · p90 73 ms · 181 images · >50 ms: 60 · >100 ms: 8 · palier max 16 (cible 16) · v max 487 km/h · 2 mort(s) anticipée(s) · tex 160 · géo 914 · prog 233
09/11 04:12:59 partie 2 · mort · t 660.6 s · pire 426 ms (à 656.4 s) · p50 39 · p90 105 ms · 136 images · >50 ms: 40 · >100 ms: 15 · écran de mort en 8500 ms · tex 160 · géo 931 · prog 233
09/11 04:12:59 partie 2 · mort · t 660.6 s · pire 426 ms (à 656.4 s) · p50 39 · p90 105 ms · 136 images · >50 ms: 40 · >100 ms: 15 · écran de mort en 8500 ms · tex 160 · géo 931 · prog 233
09/11 04:13:03 retour accueil final · t 664.6 s · pire 1743 ms (à 662.8 s) · p50 168 · p90 1743 ms · 5 images · >50 ms: 4 · >100 ms: 3
09/11 04:13:03 fini 664.6 s
09/11 04:13:03 fini 664.6 s
```

## Les gels, erreurs et sondes de la boîte noire
```
09/11 02:52:00 x2 gel | 1.2 s | post figDir bvF touch hPwr dead inGarage garMenuH | v c82b540
09/11 03:02:08 x1 memoire | fin 294.2 s · post figDir bvF touch play hPwr · tas - · textures 156 géométries 1273 programmes 232 · partie n°1 |  | v 8a10c5e
09/11 03:02:58 x1 memoire | fin 344.8 s · post figDir bvF touch hPwr play · tas - · textures 157 géométries 712 programmes 232 · partie n°2 |  | v 8a10c5e
09/11 03:04:46 x1 memoire | fin 452.6 s · post figDir bvF touch play hPwr · tas - · textures 157 géométries 1233 programmes 232 · partie n°3 |  | v 8a10c5e
09/11 03:08:05 x1 memoire | fin 651.7 s · post figDir bvF touch play hPwr · tas - · textures 162 géométries 906 programmes 232 · partie n°4 |  | v 8a10c5e
09/11 03:08:29 x1 memoire | fin 675.2 s · post figDir bvF touch hPwr play · tas - · textures 161 géométries 853 programmes 232 · partie n°5 |  | v 8a10c5e
09/11 03:34:33 x1 memoire | fin 297.5 s · post figDir bvF touch play hPwr · tas - · textures 159 géométries 773 programmes 232 · partie n°1 |  | v 8a10c5e
09/11 03:35:21 x1 memoire | fin 345 s · post figDir bvF touch hPwr play · tas - · textures 157 géométries 821 programmes 233 · partie n°2 |  | v 8a10c5e
09/11 03:38:03 x1 memoire | fin 507.9 s · post figDir bvF touch play hPwr · tas - · textures 161 géométries 843 programmes 233 · partie n°3 |  | v 8a10c5e
09/11 03:39:55 x1 memoire | fin 619.5 s · post figDir bvF touch hPwr play · tas - · textures 157 géométries 1392 programmes 233 · partie n°4 |  | v 8a10c5e
09/11 03:40:09 x1 gel | 1.4 s | post figDir bvF touch hPwr dead pal=0 basc=0 | v 8a10c5e
09/11 03:40:29 x1 memoire | fin 653.5 s · post figDir bvF touch hPwr play · tas - · textures 157 géométries 775 programmes 233 · partie n°5 |  | v 8a10c5e
09/11 03:57:02 x2 gel | 1.3 s | post figDir bvF touch dead inGarage garMenuH titreCiel pal=0 basc=0 | v 8a10c5e
09/11 04:07:44 x1 memoire | fin 345.7 s · post figDir bvF touch play hPwr · tas - · textures 159 géométries 817 programmes 232 · partie n°1 |  | v 8a10c5e
09/11 04:09:26 x1 memoire | fin 448.6 s · post figDir bvF touch play hPwr · tas - · textures 161 géométries 857 programmes 233 · partie n°2 |  | v 8a10c5e
09/11 04:11:42 x1 memoire | fin 583.8 s · post figDir bvF touch play hPwr · tas - · textures 161 géométries 901 programmes 233 · partie n°3 |  | v 8a10c5e
09/11 04:12:53 x1 memoire | fin 655.4 s · post figDir bvF touch play · tas - · textures 160 géométries 931 programmes 233 · partie n°4 |  | v 8a10c5e
09/11 04:13:01 x1 gel | 1.7 s | post figDir bvF touch dead inGarage garMenuH pal=0 basc=0 | v 8a10c5e
09/11 04:13:03 x1 gel | 1.5 s | post figDir bvF touch dead inGarage garMenuH titreCiel pal=0 basc=0 | v 8a10c5e
09/11 04:13:09 x1 gel | 2 s | post figDir bvF touch dead inGarage garMenuH titreCiel pal=0 basc=0 | v 8a10c5e
```
