# Première fois — course scénarisée (banc `outils/banc-perf/premiere-fois.py`)

| étape | programmes liés | CanvasTexture | canvas | pire image (ms) | images > 100 ms | appels GL > 20 ms | Δ programmes / textures / géométries | style+page (ms) |
|---|---|---|---|---|---|---|---|---|
| calme | 0 | 0 | 2 | 117 | 2 | envoi-tampon 0 ms 142Ko, envoi-tampon 0 ms 142Ko, envoi-tampon 0 ms 142Ko, envoi-tampon 0 ms 142Ko | +0 / +0 / +2 | 185 |
| mise en vol | 0 | 0 | 1 | 217 | 10 | envoi-tampon 0 ms 122Ko, envoi-tampon 0 ms 122Ko, envoi-tampon 0 ms 152Ko, envoi-tampon 0 ms 152Ko | +0 / +0 / +14 | 544 |
| figure tailwhip | 0 | 0 | 0 | 150 | 8 | prem-programme 0 ms MeshLambertMaterial [USE_FOG USE_COLOR DOUBLE_SIDED USE_SHADOWMAP] état 0||1|1|0|1 ¶ objet /Mesh ‹ /Group ‹ /Group ‹ /Scene | mat MeshLambertMaterial  #ffffff vc | géo BufferGeometry 12v 0t | créé par mkPigeon (index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi&premfois=0:15077) < spawnPigeonFlock (index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi&premfois=0:15091) < updatePigeons (index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi&premfois=0:15107) < loop (index.html?garde=1&palier=2&tel=1&pistegraine=777&carte=nuages&meteo=midi&premfois=0:79342), envoi-tampon 0 ms 152Ko, envoi-tampon 0 ms 152Ko, envoi-tampon 0 ms 152Ko | +0 / +0 / +0 | 650 |
| figure tonneau | 0 | 0 | 0 | 567 | 12 | envoi-tampon 0 ms 271Ko, envoi-tampon 0 ms 271Ko, envoi-tampon 0 ms 271Ko, envoi-tampon 0 ms 271Ko | +0 / +0 / +3 | 610 |
| figure toupie | 0 | 0 | 0 | 450 | 7 | — | +0 / +0 / +10 | 197 |
| figure shimmy | 0 | 0 | 0 | 233 | 15 | envoi-tampon 0 ms 323Ko, envoi-tampon 0 ms 323Ko, envoi-tampon 0 ms 323Ko, envoi-tampon 0 ms 323Ko | +0 / +0 / +1 | 353 |
| figure chandelle | 0 | 0 | 0 | 300 | 39 | envoi-tampon 0 ms 357Ko, envoi-tampon 0 ms 357Ko, envoi-tampon 0 ms 357Ko, envoi-tampon 0 ms 357Ko | +0 / +0 / -7 | 328 |
| figure saltoa | 0 | 0 | 0 | 383 | 30 | — | +0 / +0 / -8 | 430 |
| figure saltov | 0 | 0 | 0 | 300 | 17 | — | +0 / +0 / -8 | 614 |
| figure double | 0 | 0 | 0 | 333 | 24 | — | +0 / +0 / +0 | 542 |
| figure tirebouchon | 0 | 0 | 0 | 317 | 11 | — | +0 / +0 / +0 | 342 |
| figure helico | 0 | 0 | 0 | 217 | 16 | — | +0 / +0 / +0 | 191 |
| figure penche | 0 | 0 | 0 | 133 | 3 | — | +0 / +0 / -8 | 237 |
| figure rodeo | 0 | 0 | 0 | 400 | 187 | — | +0 / +0 / +8 | 3491 |
| figure cosmique | 0 | 0 | 0 | 333 | 25 | — | +0 / +0 / +0 | 261 |
| figure derive | 0 | 0 | 0 | 267 | 38 | — | +0 / +0 / +0 | 500 |
| figure g | 0 | 0 | 0 | 367 | 21 | — | +0 / +0 / +0 | 357 |
| cristal n posé devant | 0 | 0 | 0 | 333 | 22 | — | +0 / +0 / +0 | 210 |
| cristal a posé devant | 0 | 0 | 0 | 350 | 125 | — | +0 / +0 / +0 | 638 |
| cristal v posé devant | 0 | 0 | 0 | 283 | 98 | — | +0 / +0 / +1 | 77140 |
| cristal m posé devant | 0 | 0 | 0 | 233 | 9 | — | +0 / +0 / +2 | 796 |
| cristal x posé devant | 0 | 0 | 0 | 167 | 4 | — | +0 / +0 / +8 | 627 |
| pouvoir n pris | 0 | 0 | 0 | 117 | 1 | — | +0 / +0 / +0 | 326 |
| pouvoir a pris | 0 | 0 | 0 | 100 | 0 | — | +0 / +0 / +0 | 935 |
| pouvoir v pris | 0 | 0 | 0 | 100 | 0 | — | +0 / +0 / +0 | 915 |
| pouvoir m pris | 0 | 0 | 0 | 383 | 9 | — | +0 / +0 / +0 | 988 |
| pouvoir x pris | 0 | 0 | 0 | 150 | 5 | — | +0 / +0 / +0 | 848 |
| pouvoir + figure en l'air (hPwr figVol hAirPie) | 0 | 0 | 0 | 167 | 2 | — | +0 / +0 / +0 | 1661 |
| éclair coup | 0 | 0 | 0 | 100 | 0 | — | +0 / +0 / +8 | 1301 |
| éclair nuage | 0 | 0 | 0 | 67 | 0 | — | +0 / +0 / -7 | 361 |
| événement rare : armer | 0 | 0 | 0 | 83 | 0 | — | +0 / +0 / -1 | 540 |
| événement rare : caisse | 0 | 0 | 0 | 83 | 0 | — | +0 / +0 / +8 | 1291 |
| frénésie : jauge pleine | 0 | 0 | 0 | 100 | 0 | — | +0 / +0 / +0 | 731 |
| frénésie : entre | 0 | 0 | 0 | 150 | 1 | — | +0 / +0 / +8 | 1040 |
| seconde chance : mort | 0 | 0 | 0 | 233 | 1 | getImageData 13 ms 160x210, envoi-texture 0 ms 864x578, envoi-texture 0 ms 192x192, envoi-texture 0 ms 192x192 | +0 / +5 / +24 | 878 |
| seconde chance : joue | 0 | 0 | 0 | 100 | 0 | — | +0 / +0 / +0 | 765 |
