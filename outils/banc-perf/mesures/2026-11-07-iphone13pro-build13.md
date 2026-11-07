# iPhone 13 Pro — build 13 — banc automatique du 2026-11-07

Lancé à 07/11 16:32 par `outils/banc-perf/iphone-auto.sh 13` (l'app se joue seule : banc-iphone.js ; brut : `2026-11-07-iphone13pro-build13-brut.txt`).

## Le scénario
✔ scénario : allé au bout (« banc: fini »)
✔ étapes en échec : 0
✔ plantage / rechargement détecté par le banc : 0
✔ palier moteur max atteint : 16

## Les seuils P7 (garde-iphone.cjs)
```
✘ serpent : 4 trou(s) > 120 ms hors le trou initial : 3572 ms @0.7 s, 3006 ms @4.2 s, 833 ms @7.2 s, 9058 ms @8.1 s
✘ fluide : p50 à 8 min = 61.3/73.3/70.3/72.3/56.3/76.3/51.3/73.3/83.3/64.3/62.3/64.3/45.3/49.3/54.3/65.3/51.3/50.3/83.3/63.3/74.3/83.3/83.3/83.3/83.3/64.3/53.3/75.3/72.3/76.3/77.3/79.3/83.3/74.3/83.3/83.3/83.3/83.3/83.3/83.3 ms (seuil ≤ 20)
✘ mémoire : geo 687→633 (8 %) ; geo 633→835 (32 %)
✘ gels > 1 s : 15 (2.1, 3, 9.1, 8.8, 3.8, 2, 2.4, 1.7, 1.4, 1.3, 2.2, 4.1, 2.9, 2.5, 1.2 s)
✘ plantages : 1
✘ GARDE IPHONE : 5 seuil(s) franchi(s) — la vague ne part pas
```

## Les étapes (pire image depuis l'étape d'avant)
```
07/11 14:08:08 début · run 1 · scénario p7 · partie 300 s · v d57b7fc · app native · 390×844 @3 · wakeLock oui
07/11 14:08:08 wakeLock refusé : Permission was denied
07/11 15:57:38 visibilité hidden à t 0 s · étape « ? »
07/11 15:57:39 début · run 2 · scénario p7 · partie 300 s · v e2b46be · app native · 390×844 @3 · wakeLock oui
07/11 15:57:39 titre : vis hidden · doc complete · intro attente · prêt true · lance false · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 15:57:39 wakeLock refusé : Document is hidden
07/11 16:20:38 ⚠ PLANTAGE OU RECHARGEMENT : la session d'avant (run 2, v e2b46be) s'est arrêtée à « ? » à t 0.7 s (1379 s avant ce lancement)
07/11 16:20:38 début · run 3 · scénario p7 · partie 300 s · v e2b46be · app native · 390×844 @3 · wakeLock oui
07/11 16:20:38 titre : vis visible · doc complete · intro joue · prêt true · lance true · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:20:39 wakeLock refusé : Permission was denied
07/11 16:20:43 boule prête à t 5.5 s · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:20:43 tapBoule appelé · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:20:51 titre → menu · t 13.7 s · pire 3599 ms (à 10.4 s) · p50 17 · p90 26 ms · 388 images · >50 ms: 20 · >100 ms: 9
07/11 16:20:51 menu à 13.7 s
07/11 16:20:56 menu 5 s · t 18.7 s · pire 352 ms (à 16 s) · p50 17 · p90 22 ms · 221 images · >50 ms: 7 · >100 ms: 4
07/11 16:20:58 garage ouvert · t 20.2 s · pire 485 ms (à 19.4 s) · p50 18 · p90 26 ms · 54 images · >50 ms: 2 · >100 ms: 1 · tex 124 · géo 602 · prog 207
07/11 16:21:00 garage 2,5 s · t 22.7 s · pire 118 ms (à 22.5 s) · p50 17 · p90 30 ms · 133 images · >50 ms: 2 · >100 ms: 1
07/11 16:21:01 inventaire ouvert · t 23.6 s · pire 66 ms (à 22.8 s) · p50 25 · p90 40 ms · 31 images · >50 ms: 2 · >100 ms: 0
07/11 16:21:01 inventaire : rien à défiler (grille 140/129)
07/11 16:21:01 inventaire défilé · t 23.6 s · 0 image
07/11 16:21:02 boutique ouverte en 12 ms
07/11 16:21:04 boutique ouverte 2,5 s · t 27 s · pire 595 ms (à 26 s) · p50 17 · p90 35 ms · 94 images · >50 ms: 4 · >100 ms: 4
07/11 16:21:07 vivant · t 30 s · étape « boutique ouverte 2,5 s » · vis visible
07/11 16:21:11 retour accueil · t 33.6 s · pire 113 ms (à 32.2 s) · p50 17 · p90 17 ms · 385 images · >50 ms: 1 · >100 ms: 1
07/11 16:21:13 partie 1 : départ à t 35.4 s · tex 139 · géo 583 · prog 216 · palier 0
07/11 16:21:33 partie 1 · 20 s · t 55.6 s · pire 106 ms (à 35.5 s) · p50 17 · p90 20 ms · 1179 images · >50 ms: 3 · >100 ms: 1 · palier 0 · 173 km/h · mode drive · pouvoir a
07/11 16:21:37 vivant · t 60 s · étape « partie 1 · 20 s » · vis visible
07/11 16:21:53 partie 1 · 40 s · t 75.7 s · pire 151 ms (à 70.4 s) · p50 17 · p90 20 ms · 1200 images · >50 ms: 1 · >100 ms: 1 · palier 1 · 210 km/h · mode drive · pouvoir v
07/11 16:22:07 vivant · t 90 s · étape « partie 1 · 40 s » · vis visible
07/11 16:22:13 partie 1 · 61 s · t 95.9 s · pire 39 ms (à 76.4 s) · p50 17 · p90 20 ms · 1201 images · >50 ms: 0 · >100 ms: 0 · palier 1 · 221 km/h · mode drive · pouvoir m
07/11 16:22:34 partie 1 · 81 s · t 116.2 s · pire 123 ms (à 113.6 s) · p50 19 · p90 41 ms · 860 images · >50 ms: 64 · >100 ms: 3 · palier 2 · 189 km/h · mode drive · pouvoir x
07/11 16:22:37 vivant · t 120 s · étape « partie 1 · 81 s » · vis visible
07/11 16:22:51 visibilité hidden à t 133.6 s · étape « partie 1 · 81 s »
07/11 16:23:07 vivant · t 150 s · étape « partie 1 · 81 s » · vis hidden
07/11 16:23:35 visibilité visible à t 177.9 s · étape « partie 1 · 81 s »
07/11 16:23:36 partie 1 · 143 s · t 178.4 s · pire 1128 ms (à 130.6 s) · p50 18 · p90 31 ms · 631 images · >50 ms: 22 · >100 ms: 11 · en fond: 1 · palier 2 · 214 km/h · mode drive · pouvoir n
07/11 16:23:37 vivant · t 180 s · étape « partie 1 · 143 s » · vis visible
07/11 16:23:56 partie 1 · 163 s · t 198.5 s · pire 1392 ms (à 187.9 s) · p50 18 · p90 59 ms · 611 images · >50 ms: 76 · >100 ms: 12 · palier 2 · 203 km/h · mode drive · pouvoir a
07/11 16:24:07 vivant · t 210 s · étape « partie 1 · 163 s » · vis visible
07/11 16:24:11 partie 1 · mort anticipée n°1 à 179 s · t 214 s · pire 198 ms (à 212 s) · p50 39 · p90 60 ms · 345 images · >50 ms: 72 · >100 ms: 9 · palier 2 · v max 401 km/h
07/11 16:24:37 vivant · t 240 s · étape « partie 1 · mort anticipée n°1 à 179 s » · vis visible
07/11 16:24:47 partie 1 · 215 s · t 250.1 s · pire 1313 ms (à 229.8 s) · p50 34 · p90 54 ms · 901 images · >50 ms: 110 · >100 ms: 16 · palier 0 · 151 km/h · mode drive · pouvoir v
07/11 16:25:07 vivant · t 270 s · étape « partie 1 · 215 s » · vis visible
07/11 16:25:08 partie 1 · 235 s · t 270.6 s · pire 177 ms (à 262.6 s) · p50 43 · p90 60 ms · 446 images · >50 ms: 116 · >100 ms: 5 · palier 0 · 155 km/h · mode drive · pouvoir m
07/11 16:25:19 visibilité hidden à t 281.3 s · étape « partie 1 · 235 s »
07/11 16:25:29 partie 1 · 257 s · t 292 s · pire 1303 ms (à 276.6 s) · p50 57 · p90 161 ms · 72 images · >50 ms: 45 · >100 ms: 14 · palier 0 · 177 km/h · mode drive · pouvoir x
07/11 16:25:30 visibilité visible à t 292.7 s · étape « partie 1 · 257 s »
07/11 16:25:37 vivant · t 300.1 s · étape « partie 1 · 257 s » · vis visible
07/11 16:25:50 partie 1 · 277 s · t 312.3 s · pire 14011 ms (à 292.1 s) · p50 92 · p90 175 ms · 177 images · >50 ms: 151 · >100 ms: 64 · palier 0 · 167 km/h · mode drive · pouvoir n
07/11 16:26:07 vivant · t 330.1 s · étape « partie 1 · 277 s » · vis visible
07/11 16:26:10 partie 1 · 297 s · t 332.5 s · pire 503 ms (à 312.8 s) · p50 124 · p90 245 ms · 139 images · >50 ms: 139 · >100 ms: 102 · palier 1 · 217 km/h · mode drive · pouvoir a
07/11 16:26:13 partie 1 · fin de course · t 335.5 s · pire 385 ms (à 332.7 s) · p50 105 · p90 198 ms · 26 images · >50 ms: 26 · >100 ms: 15 · palier max 2 (cible —) · v max 401 km/h · 1 mort(s) anticipée(s) · tex 154 · géo 638 · prog 216
07/11 16:26:23 partie 1 · mort · t 345.6 s · pire 770 ms (à 342 s) · p50 97 · p90 230 ms · 74 images · >50 ms: 74 · >100 ms: 30 · écran de mort en 10119 ms · tex 154 · géo 655 · prog 216
07/11 16:26:25 partie 2 : départ à t 348.1 s · tex 154 · géo 561 · prog 216 · palier 0
07/11 16:26:37 vivant · t 360.1 s · étape « partie 1 · mort » · vis visible
07/11 16:26:46 partie 2 · 20 s · t 368.4 s · pire 1501 ms (à 348.8 s) · p50 82 · p90 136 ms · 212 images · >50 ms: 212 · >100 ms: 50 · palier 2 · 175 km/h · mode drive · pouvoir v
07/11 16:27:06 partie 2 · 41 s · t 388.8 s · pire 358 ms (à 370.8 s) · p50 109 · p90 189 ms · 164 images · >50 ms: 164 · >100 ms: 107 · palier 4 · 228 km/h · mode drive · pouvoir m
07/11 16:27:07 vivant · t 390.1 s · étape « partie 2 · 41 s » · vis visible
07/11 16:27:26 partie 2 · 61 s · t 408.9 s · pire 707 ms (à 400.8 s) · p50 104 · p90 178 ms · 163 images · >50 ms: 163 · >100 ms: 91 · palier 5 · 215 km/h · mode drive · pouvoir x
07/11 16:27:37 vivant · t 420.1 s · étape « partie 2 · 61 s » · vis visible
07/11 16:27:47 partie 2 · 81 s · t 429.1 s · pire 473 ms (à 428.8 s) · p50 112 · p90 192 ms · 157 images · >50 ms: 157 · >100 ms: 110 · palier 7 · 274 km/h · mode drive · pouvoir n
07/11 16:28:07 partie 2 · 101 s · t 449.4 s · pire 610 ms (à 441.2 s) · p50 158 · p90 300 ms · 105 images · >50 ms: 105 · >100 ms: 102 · palier 8 · 288 km/h · mode drive · pouvoir a
07/11 16:28:07 vivant · t 450.1 s · étape « partie 2 · 101 s » · vis visible
07/11 16:28:27 partie 2 · 122 s · t 469.6 s · pire 521 ms (à 452.6 s) · p50 71 · p90 166 ms · 210 images · >50 ms: 203 · >100 ms: 51 · palier 10 · 318 km/h · mode drive · pouvoir v
07/11 16:28:38 vivant · t 480.3 s · étape « partie 2 · 122 s » · vis visible
07/11 16:28:47 partie 2 · 142 s · t 490.1 s · pire 4205 ms (à 480.7 s) · p50 103 · p90 259 ms · 119 images · >50 ms: 119 · >100 ms: 63 · palier 11 · 378 km/h · mode drive · pouvoir m
07/11 16:29:04 partie 2 · mort anticipée n°1 à 158 s · t 506.2 s · pire 461 ms (à 499.3 s) · p50 124 · p90 290 ms · 103 images · >50 ms: 103 · >100 ms: 67 · palier 12 · v max 783 km/h
07/11 16:29:08 vivant · t 510.3 s · étape « partie 2 · mort anticipée n°1 à 158 s » · vis visible
07/11 16:29:38 vivant · t 540.3 s · étape « partie 2 · mort anticipée n°1 à 158 s » · vis visible
07/11 16:29:42 partie 2 · 196 s · t 544.6 s · pire 1253 ms (à 525.9 s) · p50 84 · p90 150 ms · 360 images · >50 ms: 360 · >100 ms: 108 · palier 4 · 229 km/h · mode drive · pouvoir x
07/11 16:30:02 partie 2 · 217 s · t 564.8 s · pire 291 ms (à 544.9 s) · p50 96 · p90 126 ms · 201 images · >50 ms: 201 · >100 ms: 70 · palier 7 · 235 km/h · mode drive · pouvoir n
07/11 16:30:08 vivant · t 570.3 s · étape « partie 2 · 217 s » · vis visible
07/11 16:30:22 partie 2 · 237 s · t 585 s · pire 371 ms (à 569.5 s) · p50 99 · p90 134 ms · 187 images · >50 ms: 187 · >100 ms: 86 · palier 10 · 314 km/h · mode drive · pouvoir a
07/11 16:30:38 vivant · t 600.3 s · étape « partie 2 · 237 s » · vis visible
07/11 16:30:43 partie 2 · 257 s · t 605.1 s · pire 219 ms (à 595.7 s) · p50 87 · p90 121 ms · 217 images · >50 ms: 216 · >100 ms: 68 · palier 14 · 434 km/h · mode drive · pouvoir v
07/11 16:30:53 partie 2 · mort anticipée n°2 à 268 s · t 615.6 s · pire 372 ms (à 612.1 s) · p50 105 · p90 214 ms · 85 images · >50 ms: 77 · >100 ms: 47 · palier 15 · v max 884 km/h
07/11 16:31:08 vivant · t 630.4 s · étape « partie 2 · mort anticipée n°2 à 268 s » · vis visible
07/11 16:31:37 partie 2 · fin de course · t 659.5 s · pire 16496 ms (à 659.2 s) · p50 93 · p90 150 ms · 236 images · >50 ms: 236 · >100 ms: 97 · palier max 15 (cible 16) · v max 884 km/h · 2 mort(s) anticipée(s) · tex 148 · géo 869 · prog 216
07/11 16:31:38 vivant · t 660.4 s · étape « partie 2 · fin de course » · vis visible
07/11 16:31:42 partie 2 · mort · t 664.8 s · pire 1131 ms (à 660.2 s) · p50 66 · p90 539 ms · 40 images · >50 ms: 31 · >100 ms: 10 · écran de mort en 5295 ms · tex 149 · géo 910 · prog 216
07/11 16:31:42 ⚠ palier 16 non atteint (max 15)
07/11 16:31:49 retour accueil final · t 671.6 s · pire 3604 ms (à 669.2 s) · p50 111 · p90 3604 ms · 3 images · >50 ms: 3 · >100 ms: 2
07/11 16:31:49 fini 671.6 s
07/11 16:31:49 fini 671.6 s
07/11 16:32:28 début · run 4 · scénario p7 · partie 300 s · v e2b46be · app native · 390×844 @3 · wakeLock oui
07/11 16:32:28 début · run 4 · scénario p7 · partie 300 s · v e2b46be · app native · 390×844 @3 · wakeLock oui
07/11 16:32:28 titre : vis visible · doc complete · intro attente · prêt true · lance false · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:32:50 wakeLock refusé : Permission was denied
07/11 16:32:50 attend « boule prête » depuis 16 s (max 90 s) · vis visible · doc complete · intro joue · prêt true · lance true · boule false · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:32:50 boule prête à t 26 s · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:32:52 tapBoule appelé · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:32:54 vivant · t 30 s · étape « ? » · vis visible
07/11 16:33:07 attend « menu affiché » depuis 15 s (max 120 s) · vis visible · doc complete · intro joue · prêt true · lance true · boule true · fini false · mHome on · splash flex · started false · running false · over false · mode drive · garage true
07/11 16:33:19 titre → menu · t 54.6 s · pire 9058 ms (à 21.3 s) · p50 89 · p90 238 ms · 225 images · >50 ms: 149 · >100 ms: 86
07/11 16:33:19 menu à 54.6 s
07/11 16:33:19 menu à 54.6 s
07/11 16:33:24 menu 5 s · t 59.7 s · pire 324 ms (à 57 s) · p50 94 · p90 197 ms · 42 images · >50 ms: 42 · >100 ms: 18
07/11 16:33:25 vivant · t 60.5 s · étape « menu 5 s » · vis visible
07/11 16:33:26 garage ouvert · t 61.2 s · pire 789 ms (à 60.9 s) · p50 213 · p90 789 ms · 3 images · >50 ms: 3 · >100 ms: 3 · tex 129 · géo 574 · prog 267
07/11 16:33:28 garage 2,5 s · t 63.7 s · pire 512 ms (à 61.4 s) · p50 104 · p90 126 ms · 23 images · >50 ms: 23 · >100 ms: 14
07/11 16:33:29 inventaire ouvert · t 64.6 s · pire 478 ms (à 64.4 s) · p50 478 · p90 478 ms · 2 images · >50 ms: 2 · >100 ms: 2
07/11 16:33:29 inventaire : rien à défiler (grille 140/129)
07/11 16:33:29 inventaire défilé · t 64.6 s · 0 image
07/11 16:33:30 boutique ouverte en 67 ms
07/11 16:33:33 boutique ouverte 2,5 s · t 68.1 s · pire 385 ms (à 65.1 s) · p50 104 · p90 323 ms · 12 images · >50 ms: 12 · >100 ms: 7
07/11 16:33:39 retour accueil · t 74.8 s · pire 2372 ms (à 68.9 s) · p50 159 · p90 633 ms · 24 images · >50 ms: 24 · >100 ms: 24
07/11 16:33:55 partie 1 : départ à t 90.4 s · tex 129 · géo 564 · prog 273 · palier 0
07/11 16:33:55 partie 1 : départ à t 90.4 s · tex 129 · géo 564 · prog 273 · palier 0
07/11 16:33:55 vivant · t 90.5 s · étape « retour accueil » · vis visible
07/11 16:34:15 partie 1 · 20 s · t 110.6 s · pire 2311 ms (à 91.1 s) · p50 70 · p90 91 ms · 250 images · >50 ms: 246 · >100 ms: 17 · palier 0 · 150 km/h · mode drive · pouvoir a
07/11 16:34:25 vivant · t 120.5 s · étape « partie 1 · 20 s » · vis visible
07/11 16:34:36 partie 1 · 41 s · t 131.1 s · pire 240 ms (à 117.4 s) · p50 82 · p90 117 ms · 234 images · >50 ms: 234 · >100 ms: 45 · palier 0 · 200 km/h · mode drive · pouvoir v
07/11 16:34:55 vivant · t 150.5 s · étape « partie 1 · 41 s » · vis visible
07/11 16:34:56 partie 1 · 61 s · t 151.3 s · pire 386 ms (à 142.5 s) · p50 95 · p90 154 ms · 188 images · >50 ms: 188 · >100 ms: 81 · palier 0 · 221 km/h · mode drive · pouvoir m
07/11 16:35:16 partie 1 · 81 s · t 171.7 s · pire 377 ms (à 159.9 s) · p50 85 · p90 119 ms · 218 images · >50 ms: 218 · >100 ms: 57 · palier 1 · 162 km/h · mode drive · pouvoir x
07/11 16:35:25 vivant · t 180.5 s · étape « partie 1 · 81 s » · vis visible
07/11 16:35:37 partie 1 · 102 s · t 192.1 s · pire 293 ms (à 172 s) · p50 90 · p90 123 ms · 208 images · >50 ms: 208 · >100 ms: 52 · palier 1 · 169 km/h · mode drive · pouvoir n
07/11 16:35:55 vivant · t 210.6 s · étape « partie 1 · 102 s » · vis visible
07/11 16:35:57 partie 1 · 122 s · t 212.2 s · pire 367 ms (à 205.4 s) · p50 84 · p90 137 ms · 210 images · >50 ms: 206 · >100 ms: 63 · palier 1 · 221 km/h · mode drive · pouvoir a
07/11 16:36:17 partie 1 · 142 s · t 232.5 s · pire 282 ms (à 229.1 s) · p50 95 · p90 140 ms · 201 images · >50 ms: 199 · >100 ms: 74 · palier 1 · 168 km/h · mode drive · pouvoir v
07/11 16:36:25 vivant · t 240.7 s · étape « partie 1 · 142 s » · vis visible
07/11 16:36:37 partie 1 · 162 s · t 252.7 s · pire 847 ms (à 240.6 s) · p50 83 · p90 141 ms · 199 images · >50 ms: 199 · >100 ms: 51 · palier 2 · 277 km/h · mode fall · figure 0 refusée
07/11 16:36:55 vivant · t 270.7 s · étape « partie 1 · 162 s » · vis visible
07/11 16:36:58 partie 1 · 183 s · t 273.3 s · pire 325 ms (à 253 s) · p50 81 · p90 123 ms · 233 images · >50 ms: 229 · >100 ms: 38 · palier 2 · 213 km/h · mode drive · pouvoir x
07/11 16:37:18 partie 1 · 203 s · t 293.4 s · pire 273 ms (à 293.1 s) · p50 86 · p90 135 ms · 203 images · >50 ms: 203 · >100 ms: 57 · palier 2 · 212 km/h · mode drive · pouvoir n
07/11 16:37:25 vivant · t 300.7 s · étape « partie 1 · 203 s » · vis visible
07/11 16:37:38 partie 1 · 223 s · t 313.3 s · pire 389 ms (à 293.8 s) · p50 91 · p90 179 ms · 183 images · >50 ms: 180 · >100 ms: 72 · palier 2 · 208 km/h · mode fall · pouvoir a
07/11 16:37:55 vivant · t 330.8 s · étape « partie 1 · 223 s » · vis visible
07/11 16:37:58 partie 1 · 243 s · t 333.8 s · pire 292 ms (à 320.4 s) · p50 83 · p90 138 ms · 218 images · >50 ms: 217 · >100 ms: 46 · palier 3 · 252 km/h · mode drive · pouvoir v
07/11 16:38:18 partie 1 · 263 s · t 353.7 s · pire 360 ms (à 335.4 s) · p50 103 · p90 199 ms · 163 images · >50 ms: 163 · >100 ms: 88 · palier 4 · 175 km/h · mode drive · pouvoir m
07/11 16:38:25 vivant · t 360.8 s · étape « partie 1 · 263 s » · vis visible
07/11 16:38:34 visibilité hidden à t 369.5 s · étape « partie 1 · 263 s »
07/11 16:38:34 visibilité hidden à t 369.5 s · étape « partie 1 · 263 s »
07/11 16:39:20 partie 1 · fin de course · t 415.8 s · pire 240 ms (à 356.2 s) · p50 80 · p90 162 ms · 98 images · >50 ms: 98 · >100 ms: 21 · palier max 4 (cible —) · v max 384 km/h · 0 mort(s) anticipée(s) · tex 147 · géo 668 · prog 273
07/11 16:39:20 partie 1 · fin de course · t 415.8 s · pire 240 ms (à 356.2 s) · p50 80 · p90 162 ms · 98 images · >50 ms: 98 · >100 ms: 21 · palier max 4 (cible —) · v max 384 km/h · 0 mort(s) anticipée(s) · tex 147 · géo 668 · prog 273
07/11 16:39:21 vivant · t 416.4 s · étape « partie 1 · fin de course » · vis visible
07/11 16:39:21 visibilité visible à t 416.4 s · étape « partie 1 · fin de course »
07/11 16:39:21 visibilité visible à t 416.4 s · étape « partie 1 · fin de course »
07/11 16:39:40 partie 1 · mort · t 436 s · pire 2974 ms (à 421.6 s) · p50 80 · p90 315 ms · 105 images · >50 ms: 94 · >100 ms: 42 · en fond: 1 · écran de mort en 20047 ms · tex 149 · géo 687 · prog 274
07/11 16:39:40 partie 1 · mort · t 436 s · pire 2974 ms (à 421.6 s) · p50 80 · p90 315 ms · 105 images · >50 ms: 94 · >100 ms: 42 · en fond: 1 · écran de mort en 20047 ms · tex 149 · géo 687 · prog 274
07/11 16:39:44 partie 2 : départ à t 439.1 s · tex 146 · géo 572 · prog 274 · palier 0
07/11 16:39:44 partie 2 : départ à t 439.1 s · tex 146 · géo 572 · prog 274 · palier 0
07/11 16:39:51 vivant · t 446.4 s · étape « partie 1 · mort » · vis visible
07/11 16:40:04 partie 2 · 20 s · t 459.3 s · pire 1659 ms (à 440 s) · p50 73 · p90 156 ms · 198 images · >50 ms: 198 · >100 ms: 39 · palier 2 · 254 km/h · mode drive · pouvoir x
07/11 16:40:21 vivant · t 476.5 s · étape « partie 2 · 20 s » · vis visible
07/11 16:40:24 partie 2 · 40 s · t 479.4 s · pire 735 ms (à 470.5 s) · p50 99 · p90 209 ms · 165 images · >50 ms: 165 · >100 ms: 76 · palier 4 · 196 km/h · mode drive · pouvoir n
07/11 16:40:44 partie 2 · 60 s · t 499.3 s · pire 288 ms (à 480.7 s) · p50 85 · p90 126 ms · 212 images · >50 ms: 212 · >100 ms: 51 · palier 5 · 250 km/h · mode drive · pouvoir a
07/11 16:40:51 vivant · t 506.5 s · étape « partie 2 · 60 s » · vis visible
07/11 16:41:04 partie 2 · 81 s · t 519.8 s · pire 264 ms (à 505.4 s) · p50 84 · p90 134 ms · 218 images · >50 ms: 213 · >100 ms: 55 · palier 7 · 302 km/h · mode drive · pouvoir v
07/11 16:41:21 vivant · t 536.5 s · étape « partie 2 · 81 s » · vis visible
07/11 16:41:25 partie 2 · 101 s · t 540.3 s · pire 782 ms (à 523.9 s) · p50 101 · p90 215 ms · 159 images · >50 ms: 159 · >100 ms: 80 · palier 8 · 308 km/h · mode drive · pouvoir m
07/11 16:41:45 partie 2 · 122 s · t 560.7 s · pire 1390 ms (à 541.8 s) · p50 84 · p90 176 ms · 184 images · >50 ms: 183 · >100 ms: 51 · palier 10 · 290 km/h · mode drive · pouvoir x
07/11 16:41:51 vivant · t 566.6 s · étape « partie 2 · 122 s » · vis visible
07/11 16:42:05 partie 2 · 142 s · t 580.9 s · pire 314 ms (à 572.8 s) · p50 79 · p90 142 ms · 220 images · >50 ms: 216 · >100 ms: 48 · palier 11 · 429 km/h · mode drive · pouvoir n
07/11 16:42:21 vivant · t 596.6 s · étape « partie 2 · 142 s » · vis visible
07/11 16:42:26 partie 2 · 162 s · t 601.3 s · pire 505 ms (à 581.4 s) · p50 80 · p90 150 ms · 199 images · >50 ms: 189 · >100 ms: 66 · palier 13 · 456 km/h · mode drive · pouvoir a
07/11 16:42:46 partie 2 · 183 s · t 621.6 s · pire 220 ms (à 610.1 s) · p50 71 · p90 118 ms · 258 images · >50 ms: 239 · >100 ms: 35 · palier 14 · 429 km/h · mode drive · pouvoir v
07/11 16:42:51 vivant · t 626.6 s · étape « partie 2 · 183 s » · vis visible
07/11 16:43:07 partie 2 · 203 s · t 642.1 s · pire 448 ms (à 624 s) · p50 101 · p90 176 ms · 170 images · >50 ms: 170 · >100 ms: 85 · palier 16 · 703 km/h · mode fall · pouvoir m
07/11 16:43:19 partie 2 · mort anticipée n°1 à 216 s · t 654.7 s · pire 625 ms (à 650.6 s) · p50 98 · p90 160 ms · 110 images · >50 ms: 110 · >100 ms: 51 · palier 16 · v max 827 km/h
07/11 16:43:19 partie 2 · mort anticipée n°1 à 216 s · t 654.7 s · pire 625 ms (à 650.6 s) · p50 98 · p90 160 ms · 110 images · >50 ms: 110 · >100 ms: 51 · palier 16 · v max 827 km/h
07/11 16:43:21 vivant · t 656.8 s · étape « partie 2 · mort anticipée n°1 à 216 s » · vis visible
07/11 16:43:51 vivant · t 686.8 s · étape « partie 2 · mort anticipée n°1 à 216 s » · vis visible
07/11 16:44:02 partie 2 · 259 s · t 697.9 s · pire 1325 ms (à 678.9 s) · p50 100 · p90 249 ms · 304 images · >50 ms: 304 · >100 ms: 150 · palier 7 · 240 km/h · mode drive · pouvoir x
07/11 16:44:21 vivant · t 716.8 s · étape « partie 2 · 259 s » · vis visible
07/11 16:44:23 partie 2 · 279 s · t 718.2 s · pire 429 ms (à 710.7 s) · p50 96 · p90 200 ms · 174 images · >50 ms: 174 · >100 ms: 71 · palier 14 · 401 km/h · mode drive · pouvoir n
07/11 16:44:43 partie 2 · 299 s · t 738.5 s · pire 440 ms (à 718.7 s) · p50 106 · p90 272 ms · 144 images · >50 ms: 144 · >100 ms: 90 · palier 16 · 549 km/h · mode fall · figure 1 ok
07/11 16:44:44 partie 2 · fin de course · t 739.2 s · pire 226 ms (à 738.8 s) · p50 124 · p90 226 ms · 4 images · >50 ms: 4 · >100 ms: 3 · palier max 16 (cible 16) · v max 827 km/h · 1 mort(s) anticipée(s) · tex 147 · géo 818 · prog 274
07/11 16:44:44 partie 2 · fin de course · t 739.2 s · pire 226 ms (à 738.8 s) · p50 124 · p90 226 ms · 4 images · >50 ms: 4 · >100 ms: 3 · palier max 16 (cible 16) · v max 827 km/h · 1 mort(s) anticipée(s) · tex 147 · géo 818 · prog 274
07/11 16:44:51 vivant · t 746.9 s · étape « partie 2 · fin de course » · vis visible
07/11 16:44:52 partie 2 · mort · t 747.7 s · pire 2181 ms (à 745.8 s) · p50 74 · p90 175 ms · 64 images · >50 ms: 61 · >100 ms: 23 · écran de mort en 8535 ms · tex 147 · géo 835 · prog 274
07/11 16:44:52 partie 2 · mort · t 747.7 s · pire 2181 ms (à 745.8 s) · p50 74 · p90 175 ms · 64 images · >50 ms: 61 · >100 ms: 23 · écran de mort en 8535 ms · tex 147 · géo 835 · prog 274
07/11 16:44:57 retour accueil final · t 752.9 s · pire 2972 ms (à 751.5 s) · p50 2972 · p90 2972 ms · 2 images · >50 ms: 2 · >100 ms: 2
07/11 16:44:57 fini 752.9 s
07/11 16:44:57 fini 752.9 s
```

## Les gels, erreurs et sondes de la boîte noire
```
07/11 16:31:53 x1 gel | 2.6 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v e2b46be
07/11 16:31:59 x2 gel | 2.3 s | post figDir bvF touch play | v e2b46be
07/11 16:32:01 x2 gel | 2.1 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v e2b46be
07/11 16:32:28 x3 gel | 3 s | post figDir bvF touch hPwr dead inGarage garMenuH | v e2b46be
07/11 16:32:37 x1 gel | 9.1 s | post figDir bvF touch inGarage garMenuH | v e2b46be
07/11 16:32:46 x1 gel | 8.8 s | post figDir bvF touch inGarage garMenuH | v e2b46be
07/11 16:32:50 x1 gel | 3.8 s | post figDir bvF touch inGarage garMenuH | v e2b46be
07/11 16:32:52 x2 gel | 2 s | post figDir bvF touch inGarage | v e2b46be
07/11 16:33:00 x2 gel | 2.4 s | post figDir bvF touch inGarage | v e2b46be
07/11 16:39:35 x1 memoire | fin 434.5 s · post figDir bvF touch play hPwr · tas - · textures 148 géométries 687 programmes 273 · partie n°1 |  | v e2b46be
07/11 16:39:44 x1 gel | 1.7 s | post figDir bvF touch hPwr play voletSort | v e2b46be
07/11 16:39:45 x1 gel | 1 s | post figDir bvF touch hPwr play ebOn | v e2b46be
07/11 16:41:26 x1 gel | 1.4 s | post figDir bvF touch play hPwr | v e2b46be
07/11 16:43:19 x1 memoire | fin 658.5 s · post figDir bvF touch play hPwr · tas - · textures 147 géométries 633 programmes 274 · partie n°2 |  | v e2b46be
07/11 16:43:43 x1 gel | 1.3 s | post figDir bvF touch hPwr play ebOn | v e2b46be
07/11 16:44:47 x1 memoire | fin 746.3 s · post figDir bvF touch hPwr play · tas - · textures 147 géométries 835 programmes 274 · partie n°3 |  | v e2b46be
07/11 16:44:50 x1 gel | 2.2 s | post figDir bvF touch hPwr dead chOffre | v e2b46be
07/11 16:44:59 x1 gel | 4.1 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v e2b46be
07/11 16:45:02 x1 gel | 2.9 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v e2b46be
07/11 16:45:05 x1 gel | 2.5 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v e2b46be
07/11 16:45:28 x1 gel | 1.2 s | post figDir bvF touch hPwr dead inGarage garMenuH titreCiel | v e2b46be
```
