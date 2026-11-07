# Première fois — course scénarisée (banc `outils/banc-perf/premiere-fois.py`)

| étape | programmes liés | CanvasTexture | canvas | pire image (ms) | images > 100 ms | appels GL > 20 ms | Δ programmes / textures / géométries | style+page (ms) |
|---|---|---|---|---|---|---|---|---|
| calme | 0 | 0 | 1 | 250 | 6 | envoi-tampon 0 ms 167Ko, envoi-tampon 0 ms 167Ko, envoi-tampon 0 ms 167Ko, envoi-tampon 0 ms 167Ko | +0 / +0 / +4 | 323 |
| mise en vol | 0 | 0 | 0 | 750 | 26 | envoi-tampon 0 ms 152Ko, envoi-tampon 0 ms 152Ko, envoi-tampon 0 ms 170Ko, envoi-tampon 0 ms 170Ko | +0 / +0 / +14 | 720 |
| figure tailwhip | 0 | 0 | 0 | 300 | 11 | envoi-tampon 0 ms 122Ko, envoi-tampon 0 ms 122Ko, envoi-tampon 0 ms 122Ko, envoi-tampon 0 ms 152Ko | +0 / +0 / +2 | 234 |
| figure tonneau | 0 | 0 | 0 | 133 | 6 | envoi-tampon 0 ms 347Ko, envoi-tampon 0 ms 347Ko, envoi-tampon 0 ms 113Ko, envoi-tampon 0 ms 113Ko | +0 / +0 / -5 | 400 |
| figure toupie | 0 | 0 | 0 | 200 | 6 | envoi-tampon 0 ms 323Ko, envoi-tampon 0 ms 323Ko, envoi-tampon 0 ms 323Ko, envoi-tampon 0 ms 323Ko | +0 / +0 / +9 | 680 |
| figure shimmy | 0 | 0 | 0 | 100 | 0 | envoi-tampon 0 ms 357Ko, envoi-tampon 0 ms 357Ko, envoi-tampon 0 ms 357Ko, envoi-tampon 0 ms 357Ko | +0 / +0 / -6 | 767 |
| figure chandelle | 0 | 0 | 0 | 167 | 1 | — | +0 / +0 / +10 | 1048 |
| figure saltoa | 0 | 0 | 0 | 150 | 3 | — | +0 / +0 / +1 | 1206 |
| figure saltov | 0 | 0 | 0 | 300 | 11 | — | +0 / +0 / +0 | 401 |
| figure double | 0 | 0 | 0 | 200 | 21 | — | +0 / +0 / -8 | 499 |
| figure tirebouchon | 0 | 0 | 0 | 183 | 7 | — | +0 / +0 / +8 | 686 |
| figure helico | 0 | 0 | 0 | 117 | 3 | — | +0 / +0 / +0 | 774 |
| figure penche | 0 | 0 | 0 | 117 | 3 | — | +0 / +0 / +0 | 808 |
| figure rodeo | 0 | 0 | 0 | 167 | 1 | — | +0 / +0 / +0 | 725 |
| figure cosmique | 0 | 0 | 0 | 117 | 2 | — | +0 / +0 / +0 | 916 |
| figure derive | 0 | 0 | 0 | 167 | 4 | — | +0 / +0 / +0 | 681 |
| figure g | 0 | 0 | 0 | 183 | 7 | — | +0 / +0 / +0 | 844 |
| cristal n posé devant | 0 | 0 | 0 | 133 | 5 | — | +0 / +0 / +8 | 1441 |
| cristal a posé devant | 0 | 0 | 0 | 167 | 10 | — | +0 / +0 / +0 | 914 |
| cristal v posé devant | 0 | 0 | 0 | 200 | 12 | — | +0 / +0 / +0 | 1355 |
| cristal m posé devant | 0 | 0 | 0 | 150 | 2 | — | +0 / +0 / +0 | 847 |
| cristal x posé devant | 0 | 0 | 0 | 117 | 1 | — | +0 / +0 / +8 | 668 |
| pouvoir n pris | 0 | 0 | 0 | 183 | 5 | — | +0 / +0 / +9 | 798 |
| pouvoir a pris | 0 | 0 | 0 | 133 | 1 | — | +0 / +0 / +0 | 1687 |
| pouvoir v pris | 0 | 0 | 0 | 133 | 6 | — | +0 / +0 / -8 | 738 |
| pouvoir m pris | 0 | 0 | 0 | 200 | 3 | — | +0 / +0 / -8 | 1470 |
| pouvoir x pris | 0 | 0 | 0 | 133 | 5 | — | +0 / +0 / +0 | 633 |
| pouvoir + figure en l'air (hPwr figVol hAirPie) | 0 | 0 | 0 | 183 | 14 | — | +0 / +0 / +0 | 1268 |
| éclair coup | 0 | 0 | 0 | 117 | 1 | — | +0 / +0 / +0 | 886 |
| éclair nuage | 0 | 0 | 0 | 167 | 3 | — | +0 / +0 / -8 | 522 |
| événement rare : armer | 0 | 0 | 0 | 167 | 4 | — | +0 / +0 / +0 | 383 |
| événement rare : caisse | 0 | 0 | 0 | 117 | 1 | — | +0 / +0 / -8 | 814 |
| frénésie : jauge pleine | 0 | 0 | 0 | 117 | 1 | — | +0 / +0 / +0 | 750 |
| frénésie : entre | 0 | 0 | 0 | 183 | 7 | — | +0 / +0 / +0 | 738 |
| seconde chance : mort | 0 | 0 | 0 | 517 | 4 | getImageData 14 ms 160x210, envoi-tampon 0 ms 1951Ko | +0 / +0 / +0 | 330 |
| seconde chance : joue | 0 | 0 | 0 | 83 | 0 | — | +0 / +0 / +0 | 538 |
