# Première fois — course scénarisée (banc `outils/banc-perf/premiere-fois.py`)

| étape | programmes liés | CanvasTexture | canvas | pire image (ms) | images > 100 ms | appels GL > 20 ms | Δ programmes / textures / géométries | style+page (ms) |
|---|---|---|---|---|---|---|---|---|
| portail → ville:pluie | 0 | 0 | 8 | 100 | 0 | envoi-texture 0 ms 640x640, envoi-tampon 0 ms 106Ko, envoi-tampon 0 ms 106Ko, envoi-tampon 0 ms 106Ko | +0 / +4 / -181 | 4304 |
| portail → jade:midi | 0 | 0 | 0 | 200 | 1 | envoi-texture 0 ms 640x640, envoi-tampon 0 ms 310Ko, envoi-tampon 0 ms 310Ko, envoi-tampon 0 ms 310Ko | +0 / +0 / +184 | 3797 |
| portail → grotte:matin | 0 | 0 | 0 | 133 | 2 | envoi-texture 0 ms 640x640, envoi-tampon 0 ms 310Ko, envoi-tampon 0 ms 310Ko, envoi-tampon 0 ms 310Ko | +0 / +0 / +476 | 3718 |
| portail → dunes:midi | 0 | 0 | 0 | 100 | 0 | envoi-texture 0 ms 640x640, envoi-texture 0 ms 128x128, envoi-texture 0 ms 128x128, envoi-texture 0 ms 128x128 | +0 / +4 / -474 | 5588 |
| portail → canyon:midi | 0 | 0 | 0 | 250 | 2 | envoi-texture 0 ms 640x640, envoi-tampon 0 ms 106Ko, envoi-tampon 0 ms 106Ko, envoi-tampon 0 ms 106Ko | +0 / +2 / +11 | 4909 |
| portail → nuages:orage | 0 | 0 | 0 | 733 | 9 | envoi-texture 0 ms 640x640, envoi-tampon 0 ms 165Ko, envoi-tampon 0 ms 165Ko, envoi-tampon 0 ms 110Ko | +0 / -3 / +56 | 4328 |
