# iPhone 13 Pro — build 39 — banc automatique du 2026-11-09

Lancé à 09/11 00:05 par `outils/banc-perf/iphone-auto.sh 39` (l'app se joue seule : banc-iphone.js ; brut : `2026-11-09-iphone13pro-build39-brut.txt`).

## Le scénario
✔ scénario : allé au bout (« banc: fini »)
✔ étapes en échec : 0
✔ plantage / rechargement détecté par le banc : 0
✔ palier moteur max atteint : 20

## Les seuils P7 (garde-iphone.cjs)
```
✔ serpent : 0 trou > 120 ms hors le trou initial (0 relevé(s))
✔ plantages : 0
✘ fluide : aucune ligne à ≥ 8 min (470 s) — partie trop courte, seuil NON vérifié
✘ mémoire : moins de 2 parties relevées — seuil NON vérifié
✘ gels > 1 s : 6 (1.3, 1.2, 1.1, 1.5, 2.2, 1.8 s)
✘ GARDE IPHONE : 3 seuil(s) franchi(s) — la vague ne part pas
```

## Les étapes (pire image depuis l'étape d'avant)
```
08/11 23:32:43 tapBoule appelé · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
08/11 23:32:49 titre → menu · t 11.9 s · pire 2425 ms (à 5.2 s) · p50 18 · p90 85 ms · 201 images · >50 ms: 26 · >100 ms: 17
08/11 23:32:49 menu à 11.9 s
08/11 23:32:54 menu 5 s · t 17 s · pire 705 ms (à 16.7 s) · p50 18 · p90 32 ms · 142 images · >50 ms: 5 · >100 ms: 5
08/11 23:32:55 garage ouvert · t 18.5 s · pire 644 ms (à 17.8 s) · p50 20 · p90 30 ms · 47 images · >50 ms: 2 · >100 ms: 1 · tex 118 · géo 565 · prog 174
08/11 23:32:58 garage 2,5 s · t 21 s · pire 615 ms (à 19.3 s) · p50 17 · p90 28 ms · 80 images · >50 ms: 3 · >100 ms: 3
08/11 23:32:59 inventaire ouvert · t 21.8 s · pire 151 ms (à 21.2 s) · p50 25 · p90 66 ms · 23 images · >50 ms: 4 · >100 ms: 2
08/11 23:32:59 inventaire : rien à défiler (grille 161/161)
08/11 23:32:59 inventaire défilé · t 21.8 s · 0 image
08/11 23:33:00 boutique ouverte en 15 ms
08/11 23:33:02 boutique ouverte 2,5 s · t 25.6 s · pire 618 ms (à 23.8 s) · p50 29 · p90 57 ms · 73 images · >50 ms: 9 · >100 ms: 6
08/11 23:33:09 retour accueil · t 32.3 s · pire 335 ms (à 25.7 s) · p50 19 · p90 41 ms · 281 images · >50 ms: 12 · >100 ms: 7
08/11 23:33:18 partie 1 : départ à t 40.7 s · tex 138 · géo 953 · prog 217 · palier 0
08/11 23:33:38 partie 1 · 20 s · t 60.7 s · pire 495 ms (à 41 s) · p50 19 · p90 28 ms · 965 images · >50 ms: 12 · >100 ms: 5 · palier 0 · 172 km/h · mode drive · pouvoir a
08/11 23:33:58 partie 1 · 40 s · t 80.8 s · pire 175 ms (à 71.2 s) · p50 19 · p90 36 ms · 961 images · >50 ms: 38 · >100 ms: 5 · palier 0 · 183 km/h · mode drive · pouvoir v
08/11 23:34:18 partie 1 · 61 s · t 101.3 s · pire 391 ms (à 88.3 s) · p50 31 · p90 44 ms · 691 images · >50 ms: 40 · >100 ms: 4 · palier 1 · 202 km/h · mode drive · pouvoir m
08/11 23:34:38 partie 1 · 81 s · t 121.5 s · pire 271 ms (à 112.6 s) · p50 48 · p90 83 ms · 354 images · >50 ms: 148 · >100 ms: 18 · palier 1 · 228 km/h · mode drive · pouvoir x
08/11 23:34:59 partie 1 · 101 s · t 141.8 s · pire 1081 ms (à 135.6 s) · p50 49 · p90 104 ms · 262 images · >50 ms: 127 · >100 ms: 29 · palier 1 · 231 km/h · mode drive · pouvoir n
08/11 23:35:18 partie 1 · 121 s · t 161.5 s · pire 1119 ms (à 150.2 s) · p50 141 · p90 334 ms · 104 images · >50 ms: 104 · >100 ms: 86 · palier 2 · 202 km/h · mode drive · pouvoir a
08/11 23:35:39 partie 1 · 141 s · t 181.7 s · pire 2397 ms (à 179.7 s) · p50 146 · p90 414 ms · 83 images · >50 ms: 83 · >100 ms: 70 · palier 2 · 226 km/h · mode drive · pouvoir v
08/11 23:35:59 partie 1 · 161 s · t 201.9 s · pire 518 ms (à 182.1 s) · p50 91 · p90 173 ms · 183 images · >50 ms: 183 · >100 ms: 61 · palier 2 · 214 km/h · mode drive · pouvoir m
08/11 23:36:19 partie 1 · 181 s · t 222.3 s · pire 385 ms (à 202.2 s) · p50 83 · p90 123 ms · 224 images · >50 ms: 224 · >100 ms: 40 · palier 3 · 214 km/h · mode drive · pouvoir x
08/11 23:36:39 partie 1 · 202 s · t 242.6 s · pire 292 ms (à 222.3 s) · p50 50 · p90 74 ms · 378 images · >50 ms: 186 · >100 ms: 12 · palier 3 · 268 km/h · mode drive · pouvoir n
08/11 23:37:00 partie 1 · 222 s · t 262.8 s · pire 427 ms (à 255.4 s) · p50 38 · p90 58 ms · 462 images · >50 ms: 87 · >100 ms: 11 · palier 4 · 238 km/h · mode drive · pouvoir a
08/11 23:37:20 partie 1 · 242 s · t 283.2 s · pire 171 ms (à 265.5 s) · p50 41 · p90 64 ms · 455 images · >50 ms: 106 · >100 ms: 12 · palier 5 · 267 km/h · mode drive · pouvoir v
08/11 23:37:40 partie 1 · 263 s · t 303.6 s · pire 150 ms (à 300.7 s) · p50 32 · p90 51 ms · 625 images · >50 ms: 63 · >100 ms: 4 · palier 6 · 241 km/h · mode drive · pouvoir m
08/11 23:37:58 partie 1 · mort anticipée n°1 à 281 s · t 321.4 s · pire 193 ms (à 319.2 s) · p50 29 · p90 47 ms · 588 images · >50 ms: 46 · >100 ms: 8 · palier 7 · v max 458 km/h
08/11 23:38:18 partie 1 · fin de course · t 341 s · pire 411 ms (à 324.5 s) · p50 21 · p90 37 ms · 733 images · >50 ms: 41 · >100 ms: 10 · palier max 7 (cible —) · v max 458 km/h · 1 mort(s) anticipée(s) · tex 156 · géo 741 · prog 217
08/11 23:38:21 partie 1 · mort · t 344 s · pire 431 ms (à 343.4 s) · p50 25 · p90 44 ms · 83 images · >50 ms: 6 · >100 ms: 2 · écran de mort en 2985 ms · tex 156 · géo 772 · prog 217
08/11 23:38:21 partie 2 : départ à t 344.4 s · tex 155 · géo 629 · prog 217 · palier 0
08/11 23:38:41 partie 2 · 20 s · t 364.5 s · pire 1063 ms (à 345.5 s) · p50 23 · p90 35 ms · 779 images · >50 ms: 24 · >100 ms: 6 · palier 2 · 224 km/h · mode drive · pouvoir x
08/11 23:39:02 partie 2 · 40 s · t 384.8 s · pire 129 ms (à 373.4 s) · p50 24 · p90 45 ms · 771 images · >50 ms: 47 · >100 ms: 4 · palier 4 · 217 km/h · mode drive · pouvoir n
08/11 23:39:22 partie 2 · 61 s · t 405.2 s · pire 162 ms (à 398.5 s) · p50 30 · p90 51 ms · 652 images · >50 ms: 69 · >100 ms: 6 · palier 5 · 226 km/h · mode drive · pouvoir a
08/11 23:39:42 partie 2 · 81 s · t 425.2 s · pire 271 ms (à 413.1 s) · p50 45 · p90 81 ms · 378 images · >50 ms: 134 · >100 ms: 22 · palier 7 · 265 km/h · mode drive · pouvoir v
08/11 23:40:02 partie 2 · 101 s · t 445.6 s · pire 871 ms (à 439.3 s) · p50 57 · p90 110 ms · 281 images · >50 ms: 182 · >100 ms: 34 · palier 8 · 267 km/h · mode drive · pouvoir m
08/11 23:40:23 partie 2 · 122 s · t 466.1 s · pire 805 ms (à 450.9 s) · p50 76 · p90 234 ms · 169 images · >50 ms: 159 · >100 ms: 53 · palier 10 · 338 km/h · mode drive · pouvoir x
08/11 23:40:43 partie 2 · 142 s · t 486.5 s · pire 482 ms (à 469.8 s) · p50 95 · p90 219 ms · 171 images · >50 ms: 169 · >100 ms: 78 · palier 11 · 408 km/h · mode drive · pouvoir n
08/11 23:41:04 partie 2 · mort anticipée n°1 à 163 s · t 506.9 s · pire 521 ms (à 494.5 s) · p50 85 · p90 264 ms · 169 images · >50 ms: 139 · >100 ms: 67 · palier 13 · v max 451 km/h
08/11 23:41:39 partie 2 · 198 s · t 541.9 s · pire 737 ms (à 523 s) · p50 55 · p90 105 ms · 459 images · >50 ms: 290 · >100 ms: 52 · palier 4 · 219 km/h · mode drive · pouvoir a
08/11 23:41:59 partie 2 · 218 s · t 562.1 s · pire 587 ms (à 561.1 s) · p50 73 · p90 203 ms · 190 images · >50 ms: 166 · >100 ms: 57 · palier 7 · 243 km/h · mode drive · pouvoir v
08/11 23:42:19 partie 2 · 238 s · t 582.6 s · pire 631 ms (à 578.1 s) · p50 65 · p90 178 ms · 225 images · >50 ms: 199 · >100 ms: 55 · palier 10 · 314 km/h · mode drive · pouvoir m
08/11 23:42:40 partie 2 · 258 s · t 602.9 s · pire 564 ms (à 597.8 s) · p50 66 · p90 118 ms · 252 images · >50 ms: 218 · >100 ms: 35 · palier 14 · 448 km/h · mode drive · pouvoir x
08/11 23:43:00 partie 2 · 279 s · t 623.3 s · pire 388 ms (à 610 s) · p50 68 · p90 116 ms · 254 images · >50 ms: 226 · >100 ms: 39 · palier 16 · 494 km/h · mode boom · pouvoir n
08/11 23:43:03 partie 2 · mort anticipée n°2 à 281 s · t 625.9 s · pire 150 ms (à 623.6 s) · p50 39 · p90 129 ms · 46 images · >50 ms: 15 · >100 ms: 5 · palier 16 · v max 517 km/h
08/11 23:43:21 partie 2 · fin de course · t 644.4 s · pire 604 ms (à 640.9 s) · p50 34 · p90 53 ms · 438 images · >50 ms: 47 · >100 ms: 20 · palier max 16 (cible 16) · v max 517 km/h · 2 mort(s) anticipée(s) · tex 149 · géo 834 · prog 217
08/11 23:43:25 partie 2 · mort · t 647.8 s · pire 748 ms (à 647.3 s) · p50 48 · p90 100 ms · 47 images · >50 ms: 18 · >100 ms: 4 · écran de mort en 3317 ms · tex 149 · géo 849 · prog 217
08/11 23:43:28 retour accueil final · t 651.3 s · pire 1072 ms (à 649.3 s) · p50 704 · p90 1072 ms · 6 images · >50 ms: 6 · >100 ms: 5
08/11 23:43:28 fini 651.3 s
08/11 23:48:53 début · run 7 · scénario p7 · partie 300 s · v a40f5bf · app native · 390×844 @3 · wakeLock oui
08/11 23:48:54 wakeLock refusé : Permission was denied
08/11 23:48:58 boule prête à t 5.7 s
08/11 23:49:07 titre → menu · t 14.9 s · pire 1673 ms (à 12 s) · p50 17 · p90 32 ms · 529 images · >50 ms: 22 · >100 ms: 9
08/11 23:49:07 menu à 14.9 s
08/11 23:49:12 menu 5 s · t 19.9 s · pire 53 ms (à 16.4 s) · p50 17 · p90 25 ms · 282 images · >50 ms: 1 · >100 ms: 0
08/11 23:49:14 garage ouvert · t 21.5 s · pire 224 ms (à 20.4 s) · p50 17 · p90 33 ms · 71 images · >50 ms: 2 · >100 ms: 1 · tex 128 · géo 634 · prog 211
08/11 23:49:16 garage 2,5 s · t 24 s · pire 34 ms (à 22.9 s) · p50 17 · p90 27 ms · 151 images · >50 ms: 0 · >100 ms: 0
08/11 23:49:17 inventaire ouvert · t 24.8 s · pire 113 ms (à 24.8 s) · p50 17 · p90 36 ms · 40 images · >50 ms: 2 · >100 ms: 1
08/11 23:49:17 inventaire : rien à défiler (grille 161/161)
08/11 23:49:17 inventaire défilé · t 24.8 s · 0 image
08/11 23:49:18 boutique ouverte en 8 ms
08/11 23:49:21 boutique ouverte 2,5 s · t 28.3 s · pire 402 ms (à 26.5 s) · p50 17 · p90 27 ms · 136 images · >50 ms: 7 · >100 ms: 5
08/11 23:49:27 retour accueil · t 34.9 s · pire 160 ms (à 34.5 s) · p50 17 · p90 21 ms · 362 images · >50 ms: 5 · >100 ms: 2
08/11 23:49:29 partie 1 : départ à t 36.8 s · tex 137 · géo 890 · prog 217 · palier 0
08/11 23:49:50 partie 1 · 20 s · t 57.3 s · pire 232 ms (à 46.4 s) · p50 17 · p90 35 ms · 902 images · >50 ms: 31 · >100 ms: 7 · palier 0 · 182 km/h · mode drive · pouvoir a
08/11 23:50:10 partie 1 · 41 s · t 77.8 s · pire 100 ms (à 60 s) · p50 17 · p90 22 ms · 1157 images · >50 ms: 5 · >100 ms: 0 · palier 0 · 223 km/h · mode drive · pouvoir v
08/11 23:50:31 partie 1 · 61 s · t 98.2 s · pire 224 ms (à 84.7 s) · p50 23 · p90 41 ms · 788 images · >50 ms: 24 · >100 ms: 2 · palier 1 · 219 km/h · mode drive · pouvoir m
08/11 23:50:51 partie 1 · 82 s · t 118.7 s · pire 168 ms (à 112.8 s) · p50 37 · p90 61 ms · 499 images · >50 ms: 88 · >100 ms: 3 · palier 1 · 198 km/h · mode drive · pouvoir x
08/11 23:51:11 partie 1 · 102 s · t 138.8 s · pire 362 ms (à 126.4 s) · p50 38 · p90 62 ms · 454 images · >50 ms: 109 · >100 ms: 12 · palier 2 · 194 km/h · mode drive · pouvoir n
08/11 23:51:32 partie 1 · 122 s · t 159.2 s · pire 276 ms (à 143.3 s) · p50 53 · p90 91 ms · 336 images · >50 ms: 183 · >100 ms: 30 · palier 3 · 241 km/h · mode drive · pouvoir a
08/11 23:51:52 partie 1 · 143 s · t 179.4 s · pire 203 ms (à 159.5 s) · p50 49 · p90 78 ms · 381 images · >50 ms: 182 · >100 ms: 14 · palier 4 · 251 km/h · mode drive · pouvoir v
08/11 23:52:12 partie 1 · 163 s · t 199.5 s · pire 507 ms (à 192.8 s) · p50 66 · p90 106 ms · 263 images · >50 ms: 224 · >100 ms: 29 · palier 5 · 254 km/h · mode drive · pouvoir m
08/11 23:52:32 partie 1 · 183 s · t 219.9 s · pire 547 ms (à 205.2 s) · p50 65 · p90 96 ms · 283 images · >50 ms: 245 · >100 ms: 22 · palier 6 · 261 km/h · mode drive · pouvoir x
08/11 23:52:53 partie 1 · 203 s · t 240.3 s · pire 262 ms (à 234.1 s) · p50 61 · p90 92 ms · 302 images · >50 ms: 235 · >100 ms: 25 · palier 7 · 302 km/h · mode drive · pouvoir n
08/11 23:53:13 partie 1 · 224 s · t 260.4 s · pire 353 ms (à 252.7 s) · p50 61 · p90 105 ms · 274 images · >50 ms: 232 · >100 ms: 32 · palier 8 · 283 km/h · mode drive · pouvoir a
08/11 23:53:33 partie 1 · 244 s · t 280.9 s · pire 202 ms (à 279 s) · p50 53 · p90 76 ms · 348 images · >50 ms: 214 · >100 ms: 17 · palier 9 · 309 km/h · mode drive · pouvoir v
08/11 23:53:54 partie 1 · 264 s · t 301.1 s · pire 236 ms (à 295.3 s) · p50 48 · p90 76 ms · 389 images · >50 ms: 178 · >100 ms: 17 · palier 10 · 325 km/h · mode drive · pouvoir m
08/11 23:54:14 partie 1 · 285 s · t 321.6 s · pire 239 ms (à 316.9 s) · p50 54 · p90 77 ms · 350 images · >50 ms: 214 · >100 ms: 14 · palier 12 · 450 km/h · mode drive · pouvoir x
08/11 23:54:30 partie 1 · fin de course · t 337.1 s · pire 651 ms (à 331.7 s) · p50 46 · p90 67 ms · 292 images · >50 ms: 95 · >100 ms: 9 · palier max 13 (cible —) · v max 461 km/h · 0 mort(s) anticipée(s) · tex 150 · géo 1329 · prog 217
08/11 23:54:38 partie 1 · mort · t 345.1 s · pire 487 ms (à 339.9 s) · p50 32 · p90 103 ms · 151 images · >50 ms: 25 · >100 ms: 16 · écran de mort en 7957 ms · tex 151 · géo 1344 · prog 217
08/11 23:54:38 partie 2 : départ à t 345.5 s · tex 150 · géo 668 · prog 217 · palier 0
08/11 23:54:58 partie 2 · 20 s · t 365.8 s · pire 424 ms (à 346 s) · p50 33 · p90 45 ms · 572 images · >50 ms: 35 · >100 ms: 6 · palier 2 · 214 km/h · mode drive · pouvoir n
08/11 23:55:18 partie 2 · 40 s · t 385.9 s · pire 192 ms (à 372.6 s) · p50 42 · p90 61 ms · 441 images · >50 ms: 98 · >100 ms: 10 · palier 4 · 243 km/h · mode drive · pouvoir a
08/11 23:55:39 partie 2 · 61 s · t 406.3 s · pire 145 ms (à 393.9 s) · p50 36 · p90 53 ms · 517 images · >50 ms: 66 · >100 ms: 6 · palier 5 · 233 km/h · mode drive · pouvoir v
08/11 23:55:59 partie 2 · 81 s · t 426.8 s · pire 360 ms (à 408 s) · p50 73 · p90 177 ms · 211 images · >50 ms: 183 · >100 ms: 64 · palier 7 · 260 km/h · mode drive · pouvoir m
08/11 23:56:20 partie 2 · 102 s · t 447.3 s · pire 456 ms (à 436.3 s) · p50 112 · p90 207 ms · 161 images · >50 ms: 160 · >100 ms: 91 · palier 8 · 308 km/h · mode drive · pouvoir x
08/11 23:56:40 partie 2 · 122 s · t 467.7 s · pire 948 ms (à 465.6 s) · p50 149 · p90 403 ms · 96 images · >50 ms: 96 · >100 ms: 96 · palier 10 · 328 km/h · mode fall · figure 0 ok
08/11 23:57:00 partie 2 · 142 s · t 487.9 s · pire 772 ms (à 477.6 s) · p50 133 · p90 276 ms · 124 images · >50 ms: 124 · >100 ms: 116 · palier 11 · 376 km/h · mode drive · pouvoir a
08/11 23:57:21 partie 2 · 163 s · t 508.3 s · pire 375 ms (à 508.1 s) · p50 117 · p90 206 ms · 151 images · >50 ms: 151 · >100 ms: 125 · palier 13 · 422 km/h · mode drive · pouvoir v
08/11 23:57:41 partie 2 · 183 s · t 528.2 s · pire 766 ms (à 518.8 s) · p50 153 · p90 309 ms · 108 images · >50 ms: 108 · >100 ms: 107 · palier 14 · 467 km/h · mode drive · pouvoir m
08/11 23:58:01 partie 2 · 203 s · t 548.4 s · pire 548 ms (à 530.3 s) · p50 172 · p90 333 ms · 98 images · >50 ms: 98 · >100 ms: 98 · palier 16 · 470 km/h · mode boom · pouvoir x
08/11 23:58:06 partie 2 · mort anticipée n°1 à 208 s · t 553.4 s · pire 905 ms (à 550.8 s) · p50 134 · p90 337 ms · 27 images · >50 ms: 27 · >100 ms: 27 · palier 16 · v max 940 km/h
08/11 23:58:41 partie 2 · 243 s · t 588.5 s · pire 1444 ms (à 555.6 s) · p50 75 · p90 163 ms · 310 images · >50 ms: 290 · >100 ms: 90 · palier 6 · 245 km/h · mode drive · pouvoir n
08/11 23:59:01 partie 2 · 263 s · t 608.7 s · pire 406 ms (à 593.6 s) · p50 89 · p90 164 ms · 185 images · >50 ms: 185 · >100 ms: 71 · palier 11 · 325 km/h · mode drive · pouvoir a
08/11 23:59:21 partie 2 · 283 s · t 628.7 s · pire 461 ms (à 625.4 s) · p50 91 · p90 215 ms · 173 images · >50 ms: 171 · >100 ms: 65 · palier 16 · 473 km/h · mode fall · pouvoir v
08/11 23:59:39 partie 2 · fin de course · t 646 s · pire 1439 ms (à 632.8 s) · p50 107 · p90 163 ms · 139 images · >50 ms: 139 · >100 ms: 77 · palier max 16 (cible 16) · v max 940 km/h · 1 mort(s) anticipée(s) · tex 153 · géo 813 · prog 217
08/11 23:59:39 partie 2 · fin de course · t 646 s · pire 1439 ms (à 632.8 s) · p50 107 · p90 163 ms · 139 images · >50 ms: 139 · >100 ms: 77 · palier max 16 (cible 16) · v max 940 km/h · 1 mort(s) anticipée(s) · tex 153 · géo 813 · prog 217
08/11 23:59:49 partie 2 · mort · t 656.2 s · pire 735 ms (à 651.4 s) · p50 76 · p90 248 ms · 82 images · >50 ms: 80 · >100 ms: 25 · écran de mort en 10140 ms · tex 153 · géo 831 · prog 217
08/11 23:59:49 partie 2 · mort · t 656.2 s · pire 735 ms (à 651.4 s) · p50 76 · p90 248 ms · 82 images · >50 ms: 80 · >100 ms: 25 · écran de mort en 10140 ms · tex 153 · géo 831 · prog 217
08/11 23:59:56 retour accueil final · t 663.1 s · pire 5209 ms (à 661.5 s) · p50 5209 · p90 5209 ms · 1 images · >50 ms: 1 · >100 ms: 1
08/11 23:59:56 fini 663.1 s
08/11 23:59:56 fini 663.1 s
09/11 00:05:12 début · run 8 · scénario p7 · partie 300 s · v 5e15f25 · app native · 390×844 @3 · wakeLock oui
09/11 00:05:12 début · run 8 · scénario p7 · partie 300 s · v 5e15f25 · app native · 390×844 @3 · wakeLock oui
09/11 00:05:12 titre : vis visible · doc complete · intro joue · prêt true · lance true · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 00:05:12 wakeLock refusé : Permission was denied
09/11 00:05:15 boule prête à t 5.7 s · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 00:05:16 tapBoule appelé · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
09/11 00:05:21 menu à 11.6 s
09/11 00:05:21 titre → menu · t 11.6 s · pire 353 ms (à 6.8 s) · p50 17 · p90 33 ms · 427 images · >50 ms: 16 · >100 ms: 5
09/11 00:05:21 menu à 11.6 s
09/11 00:05:26 menu 5 s · t 16.7 s · pire 142 ms (à 11.9 s) · p50 17 · p90 26 ms · 280 images · >50 ms: 1 · >100 ms: 1
09/11 00:05:28 garage ouvert · t 18.2 s · pire 92 ms (à 17 s) · p50 17 · p90 19 ms · 84 images · >50 ms: 1 · >100 ms: 0 · tex 126 · géo 615 · prog 211
09/11 00:05:30 garage 2,5 s · t 20.7 s · pire 20 ms (à 19.2 s) · p50 17 · p90 18 ms · 151 images · >50 ms: 0 · >100 ms: 0
09/11 00:05:31 inventaire ouvert · t 21.5 s · pire 33 ms (à 20.8 s) · p50 17 · p90 24 ms · 47 images · >50 ms: 0 · >100 ms: 0
09/11 00:05:31 inventaire : rien à défiler (grille 161/161)
09/11 00:05:31 inventaire défilé · t 21.5 s · 0 image
09/11 00:05:32 boutique ouverte en 8 ms
09/11 00:05:35 boutique ouverte 2,5 s · t 25 s · pire 256 ms (à 23 s) · p50 17 · p90 19 ms · 178 images · >50 ms: 3 · >100 ms: 3
09/11 00:05:41 retour accueil · t 31.6 s · pire 77 ms (à 30.6 s) · p50 17 · p90 19 ms · 374 images · >50 ms: 3 · >100 ms: 0
09/11 00:05:43 partie 1 : départ à t 33.5 s · tex 139 · géo 601 · prog 217 · palier 0
09/11 00:05:43 partie 1 : départ à t 33.5 s · tex 139 · géo 601 · prog 217 · palier 0
09/11 00:06:03 partie 1 · 20 s · t 53.7 s · pire 371 ms (à 53 s) · p50 33 · p90 137 ms · 304 images · >50 ms: 134 · >100 ms: 66 · palier 0 · 187 km/h · mode drive · pouvoir a
09/11 00:06:24 partie 1 · 41 s · t 74.1 s · pire 570 ms (à 71.3 s) · p50 154 · p90 333 ms · 108 images · >50 ms: 108 · >100 ms: 108 · palier 0 · 168 km/h · mode drive · pouvoir v
09/11 00:06:44 partie 1 · 61 s · t 94.3 s · pire 836 ms (à 75.5 s) · p50 143 · p90 369 ms · 102 images · >50 ms: 102 · >100 ms: 101 · palier 0 · 219 km/h · mode drive · pouvoir m
09/11 00:07:05 partie 1 · 81 s · t 115.1 s · pire 1168 ms (à 114.2 s) · p50 151 · p90 558 ms · 80 images · >50 ms: 80 · >100 ms: 77 · palier 0 · 167 km/h · mode drive · pouvoir x
09/11 00:07:25 partie 1 · 101 s · t 134.9 s · pire 1129 ms (à 116.9 s) · p50 129 · p90 296 ms · 113 images · >50 ms: 113 · >100 ms: 102 · palier 1 · 180 km/h · mode drive · pouvoir n
09/11 00:07:44 partie 1 · 121 s · t 154.7 s · pire 664 ms (à 135 s) · p50 146 · p90 199 ms · 125 images · >50 ms: 125 · >100 ms: 120 · palier 1 · 217 km/h · mode drive · pouvoir a
09/11 00:08:05 partie 1 · 141 s · t 175.3 s · pire 601 ms (à 163.3 s) · p50 131 · p90 194 ms · 140 images · >50 ms: 140 · >100 ms: 122 · palier 1 · 186 km/h · mode drive · pouvoir v
09/11 00:08:25 partie 1 · 161 s · t 194.9 s · pire 643 ms (à 190 s) · p50 148 · p90 213 ms · 123 images · >50 ms: 123 · >100 ms: 121 · palier 2 · 222 km/h · mode drive · pouvoir m
09/11 00:08:45 partie 1 · 182 s · t 215.3 s · pire 1487 ms (à 210.2 s) · p50 145 · p90 249 ms · 111 images · >50 ms: 111 · >100 ms: 110 · palier 2 · 179 km/h · mode drive · pouvoir x
09/11 00:09:05 partie 1 · 202 s · t 235.4 s · pire 633 ms (à 230.7 s) · p50 136 · p90 231 ms · 126 images · >50 ms: 126 · >100 ms: 121 · palier 2 · 181 km/h · mode drive · pouvoir n
09/11 00:09:26 partie 1 · 222 s · t 255.8 s · pire 1293 ms (à 238.7 s) · p50 147 · p90 520 ms · 91 images · >50 ms: 91 · >100 ms: 90 · palier 3 · 187 km/h · mode drive · pouvoir a
09/11 00:09:46 partie 1 · 242 s · t 275.8 s · pire 362 ms (à 261.1 s) · p50 157 · p90 221 ms · 118 images · >50 ms: 118 · >100 ms: 118 · palier 3 · 244 km/h · mode drive · pouvoir v
09/11 00:10:06 partie 1 · 263 s · t 296.3 s · pire 845 ms (à 295.2 s) · p50 155 · p90 238 ms · 116 images · >50 ms: 116 · >100 ms: 116 · palier 4 · 243 km/h · mode drive · pouvoir m
09/11 00:10:26 partie 1 · 283 s · t 316.5 s · pire 585 ms (à 298 s) · p50 148 · p90 201 ms · 127 images · >50 ms: 127 · >100 ms: 125 · palier 4 · 210 km/h · mode drive · pouvoir x
09/11 00:10:43 partie 1 · fin de course · t 333.7 s · pire 1234 ms (à 321.7 s) · p50 134 · p90 213 ms · 105 images · >50 ms: 105 · >100 ms: 102 · palier max 5 (cible —) · v max 302 km/h · 0 mort(s) anticipée(s) · tex 152 · géo 571 · prog 217
09/11 00:10:43 partie 1 · fin de course · t 333.7 s · pire 1234 ms (à 321.7 s) · p50 134 · p90 213 ms · 105 images · >50 ms: 105 · >100 ms: 102 · palier max 5 (cible —) · v max 302 km/h · 0 mort(s) anticipée(s) · tex 152 · géo 571 · prog 217
09/11 00:10:54 partie 1 · mort · t 344 s · pire 1418 ms (à 341 s) · p50 95 · p90 419 ms · 58 images · >50 ms: 58 · >100 ms: 26 · écran de mort en 10367 ms · tex 153 · géo 588 · prog 217
09/11 00:10:54 partie 1 · mort · t 344 s · pire 1418 ms (à 341 s) · p50 95 · p90 419 ms · 58 images · >50 ms: 58 · >100 ms: 26 · écran de mort en 10367 ms · tex 153 · géo 588 · prog 217
09/11 00:10:55 partie 2 : départ à t 345.3 s · tex 153 · géo 466 · prog 217 · palier 0
09/11 00:10:55 partie 2 : départ à t 345.3 s · tex 153 · géo 466 · prog 217 · palier 0
09/11 00:11:15 partie 2 · 20 s · t 365.5 s · pire 834 ms (à 345.8 s) · p50 41 · p90 68 ms · 404 images · >50 ms: 98 · >100 ms: 18 · palier 2 · 199 km/h · mode drive · pouvoir n
09/11 00:11:36 partie 2 · 41 s · t 385.9 s · pire 202 ms (à 373.2 s) · p50 61 · p90 83 ms · 335 images · >50 ms: 227 · >100 ms: 8 · palier 4 · 209 km/h · mode drive · pouvoir a
09/11 00:11:56 partie 2 · 61 s · t 406.3 s · pire 454 ms (à 393.9 s) · p50 49 · p90 87 ms · 361 images · >50 ms: 170 · >100 ms: 18 · palier 5 · 250 km/h · mode drive · pouvoir v
09/11 00:12:16 partie 2 · 81 s · t 426.4 s · pire 262 ms (à 413.3 s) · p50 46 · p90 71 ms · 396 images · >50 ms: 118 · >100 ms: 14 · palier 7 · 264 km/h · mode drive · pouvoir m
09/11 00:12:37 partie 2 · 102 s · t 446.9 s · pire 454 ms (à 437.7 s) · p50 50 · p90 76 ms · 354 images · >50 ms: 163 · >100 ms: 22 · palier 8 · 309 km/h · mode drive · pouvoir x
09/11 00:12:57 partie 2 · 122 s · t 466.9 s · pire 319 ms (à 447.3 s) · p50 45 · p90 77 ms · 384 images · >50 ms: 135 · >100 ms: 20 · palier 10 · 346 km/h · mode drive · pouvoir n
09/11 00:13:17 partie 2 · 142 s · t 487.3 s · pire 147 ms (à 468.9 s) · p50 30 · p90 48 ms · 664 images · >50 ms: 48 · >100 ms: 5 · palier 11 · 373 km/h · mode drive · pouvoir a
09/11 00:13:37 partie 2 · 162 s · t 507.5 s · pire 417 ms (à 505.7 s) · p50 31 · p90 50 ms · 599 images · >50 ms: 58 · >100 ms: 11 · palier 13 · 448 km/h · mode drive · pouvoir v
09/11 00:13:57 partie 2 · 182 s · t 527.6 s · pire 496 ms (à 515.4 s) · p50 44 · p90 76 ms · 370 images · >50 ms: 114 · >100 ms: 20 · palier 14 · 413 km/h · mode drive · pouvoir m
09/11 00:14:18 partie 2 · 203 s · t 548 s · pire 193 ms (à 533.8 s) · p50 43 · p90 73 ms · 417 images · >50 ms: 94 · >100 ms: 16 · palier 16 · 501 km/h · mode drive · pouvoir x
09/11 00:14:38 partie 2 · 223 s · t 568.5 s · pire 274 ms (à 556.3 s) · p50 43 · p90 68 ms · 415 images · >50 ms: 119 · >100 ms: 16 · palier 17 · 568 km/h · mode drive · pouvoir n
09/11 00:14:59 partie 2 · 244 s · t 589 s · pire 624 ms (à 573.6 s) · p50 55 · p90 82 ms · 327 images · >50 ms: 231 · >100 ms: 17 · palier 18 · 679 km/h · mode drive · pouvoir a
09/11 00:15:19 partie 2 · 264 s · t 609.1 s · pire 283 ms (à 594 s) · p50 45 · p90 66 ms · 393 images · >50 ms: 126 · >100 ms: 11 · palier 20 · 782 km/h · mode drive · pouvoir v
09/11 00:15:27 partie 2 · mort anticipée n°1 à 272 s · t 617 s · pire 669 ms (à 612.6 s) · p50 50 · p90 462 ms · 59 images · >50 ms: 29 · >100 ms: 17 · palier 20 · v max 786 km/h
09/11 00:15:27 partie 2 · mort anticipée n°1 à 272 s · t 617 s · pire 669 ms (à 612.6 s) · p50 50 · p90 462 ms · 59 images · >50 ms: 29 · >100 ms: 17 · palier 20 · v max 786 km/h
09/11 00:15:55 partie 2 · fin de course · t 645.3 s · pire 695 ms (à 632.3 s) · p50 42 · p90 71 ms · 506 images · >50 ms: 129 · >100 ms: 31 · palier max 20 (cible 16) · v max 786 km/h · 1 mort(s) anticipée(s) · tex 160 · géo 833 · prog 217
09/11 00:15:55 partie 2 · fin de course · t 645.3 s · pire 695 ms (à 632.3 s) · p50 42 · p90 71 ms · 506 images · >50 ms: 129 · >100 ms: 31 · palier max 20 (cible 16) · v max 786 km/h · 1 mort(s) anticipée(s) · tex 160 · géo 833 · prog 217
09/11 00:15:59 partie 2 · mort · t 648.8 s · pire 249 ms (à 647.8 s) · p50 47 · p90 132 ms · 55 images · >50 ms: 19 · >100 ms: 8 · écran de mort en 3505 ms · tex 160 · géo 840 · prog 217
09/11 00:15:59 partie 2 · mort · t 648.8 s · pire 249 ms (à 647.8 s) · p50 47 · p90 132 ms · 55 images · >50 ms: 19 · >100 ms: 8 · écran de mort en 3505 ms · tex 160 · géo 840 · prog 217
09/11 00:16:04 retour accueil final · t 654.1 s · pire 2188 ms (à 651.9 s) · p50 666 · p90 2188 ms · 5 images · >50 ms: 5 · >100 ms: 4
09/11 00:16:04 fini 654.1 s
09/11 00:16:04 fini 654.1 s
```

## Les gels, erreurs et sondes de la boîte noire
```
08/11 23:59:43 x1 memoire | fin 651.1 s · post figDir bvF touch hPwr play hAirPie · tas - · textures 153 géométries 831 programmes 217 · partie n°3 |  | v a40f5bf
08/11 23:59:54 x1 gel | 5.2 s | post figDir bvF touch hPwr dead inGarage garMenuH pal=3 basc=3 | v a40f5bf
09/11 00:05:12 x2 gel | 1.3 s | post figDir bvF touch play hPwr | v 5e15f25
09/11 00:06:55 x3 gel | 1.2 s | post figDir bvF touch play hPwr ebOn | v 5e15f25
09/11 00:07:03 x1 gel | 1 s | post figDir bvF touch play hPwr | v 5e15f25
09/11 00:07:07 x1 gel | 1.1 s | post figDir bvF touch play hPwr | v 5e15f25
09/11 00:08:40 x1 gel | 1.5 s | post figDir bvF touch play hPwr | v 5e15f25
09/11 00:16:01 x1 gel | 2.2 s | post figDir bvF touch hPwr dead inGarage garMenuH | v 5e15f25
09/11 00:16:03 x1 gel | 1.8 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v 5e15f25
```
