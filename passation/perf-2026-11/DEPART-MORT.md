# DÉPART ET MORT — profil des 3 s qui suivent JOUER, la mort, l'écran de mort et REJOUER (P6, dernière salve, 2026-11-08)

Banc : `python3 outils/banc-perf/depart-mort.py [--carte nuages:midi|canyon:midi] [--parties 3] [--sans-profil] [--qs "&x=0"]` — Chrome sans fenêtre iPhone 390×844 ×3, `?garde=1&palier=2&tel=1&pistegraine=777` (`TEL_NATIF` vrai), son et voix ouverts, processeur ×4 posé après le menu ET sa chauffe (le banc passe l'intro en touchant tant que `window.__intro`, déclare `COMPLETION_STATUS_KHR` vrai 300 ms après `linkProgram` — sans ça le Chrome sans fenêtre ne finit jamais la chauffe — et attend `dbgChauffe().rendu`). Quatre fenêtres de 3 s par partie : JOUER / REJOUER, MORT (`dbgBoom`), écran de mort (8 s après). `--sans-profil` : pas de profileur CDP (voir « pièges »).
Résultats bruts : `passation/perf-2026-11/depart-mort/*.{txt,json,md}`.

## 1. Le tableau des postes (profil CDP, ms inclusifs par fenêtre de 3 s, ×4, charge machine 3-45)
| fenêtre | nuages | canyon |
|---|---|---|
| **JOUER** | rendu three 850-1150 (dont `garageRender` 270-400 + `chuteRender` 250-350 : la chute depuis l'atelier), `newTrack` 57-75 (départ d'avance prêt), chauffe 32, HUD 3, son 4-9, natif 530-840 | **`newTrack` 374 (`buildTrackG` 371 d'un bloc dans `CHUTE.sous` : le pré-bâti du canyon n'était pas prêt)**, chauffe 313, rendu 853, `chuteRender` 550 |
| **MORT** | **départ d'avance 660-840 (`pisteRoute` 480-690 en tranches de 3-8 ms, une étape peut dépasser 100 ms sous ×4)**, rendu 720-970, **`engVigRender` 250-340**, explosion 12-25, son 1-2 | départ d'avance 370-780 (`pisteRoute` 310-660), rendu 590-650, `engVigRender` 190-340 |
| **ÉCRAN DE MORT** (8 s après) | **`engVigRender` 500-990 (17-33 % du fil) : `engLit` 330-650 dont `getBufferSubData` bloquant 275-455, `fenceSync` 160, `engPose` 100-150** ; rendu three 420-730 | `engVigRender` 675-970 (`engLit` 430-650) |
| **REJOUER** | `resetGame` 130-200 (dont `newTrack` 176), `wipePxDraw` 258 (volet pixel, canvas 2D), `chauffeRendu` 120-190, `cySelect` 376 (relief du canyon sur le départ suivant), son 1-6 | `resetGame` 112, `newTrack` 73, chauffe 78, `engVigRender` 207 |
Le poste « son (décodage, bus) » ne dépasse jamais 9 ms : **sur Chrome le décodage du paquet de course n'est pas un coût du fil principal** (le décodage est hors fil ; `resetGame` ne fait que mettre en file `sonsChauffe(SONS_COURSE)`). Pas vérifié sur WebKit.

## 2. Ce que le critère donne (sans profileur, ×4, nuages, 3 parties, deux passes — pire image de la fenêtre)
JOUER 67-267 ms · MORT 117-250 (AVANT) puis 83-200 (APRÈS) · écran de mort 0-117 · REJOUER 1 : 200-500, REJOUER 2 : 100-317. **Le critère « aucune image > 100 ms dans les 3 s » n'est pas tenu sur ce Mac ×4** (1 à 2 images de 100-250 ms par fenêtre à la mort et au REJOUER, charge machine 34-45) ; il ne l'est surtout pas pour une raison unique : le temps est réparti (rendu, natif GPU, départ d'avance par tranches, vignette moteur).

## 3. Les leviers
**Retenu — la carte MOTEUR de l'écran de mort à 15 i/s sur téléphone** (`MORT_ENG_MS = 66` si `TEL_NATIF`, lu par `rendu/ciel2.js` aux deux endroits de la cadence de la carte de MORT ; la carte de COURSE garde son rythme ; `?mortcarte=max` = 33 ms comme avant). Effet mesuré : `engVigRender` sur les fenêtres « écran de mort » AVANT 717 / 999 / 603 ms → APRÈS 302 / 431 / 893 ms (profil, machine bruitée) ; le fil principal rend le moteur, le relit (`getBufferSubData`) et le recopie (`putImageData`) deux fois moins souvent. L'image change d'un point : la rotation lente du moteur est recopiée à 15 i/s au lieu de 30 (le palier 1 le faisait déjà). Aucun effet visible sur les pires images du Mac (déjà ≤ 117 ms), gain attendu sur la dose thermique du téléphone.

**Essayé, NON retenu — la chauffe du niveau neuf en tranches** (`chauffeRendu()` d'un bloc après chaque `newTrack` : découpée en tranches de ~60 maillages, une par image). Mesuré par un compteur dans le jeu : appel entier 123-149 ms (4 appels, 291-321 ms au total) contre 56 tranches dont **la plus longue fait 156-164 ms** (448-468 ms au total) : le coût est concentré dans quelques gros objets (piste, nuages) qu'on ne peut pas couper — `chauffeRendu(que)` n'accepte que des enfants directs de la scène. Plus de travail pour le même pic : abandonné. La vraie réponse serait de monter les tampons de ces gros objets AVANT le swap (pré-bâti), ce qui touche `moteur/depart-avance.js`/`piste-prebati.js`.

## 4. Pistes mesurées, non faites (par ordre de valeur)
1. **Canyon, 1er JOUER : `buildTrackG` 371 ms d'un bloc** (le départ d'avance du canyon n'est pas prêt au 1er JOUER d'une session) — le pré-bâti doit commencer plus tôt au menu pour cette map, ou `CHUTE.sous` doit tranche (`piste-prebati.js`).
2. **Le départ d'avance à la mort** : 660-840 ms/3 s, des étapes de `pisteRoute` > 100 ms ×4 : un budget par étape plus fin (`prebTravaille(lim)` ne peut pas couper un `g.next()`), ou ne commencer qu'à la fin de l'explosion.
3. **Le volet pixel** (`wipePxDraw` 258 ms sur ~280 ms d'animation au DPR 3) : une grille plus grosse sur téléphone, ou un canvas à DPR 2.
4. **`getBufferSubData` bloquant de la carte de mort** (275-455 ms/3 s) : la lire une image plus tard (le `fenceSync` est déjà posé) ou n'en relire que la moitié des lignes.
5. Écran de mort construit pendant la course, paquet de sons décodé d'avance : non faits, le profil ne les montre pas comme coûteux sur Chrome.

## 5. Pièges du banc
- **Le profileur CDP gèle la première image de chaque fenêtre** (jusqu'à 1,6 s, avec un script de 8,7 Mo) : le critère se lit avec `--sans-profil`, le diagnostic avec le profil.
- Le Chrome sans fenêtre ne finit jamais la liaison douce des programmes (`COMPLETION_STATUS_KHR`) : sans la simulation du banc, la chauffe du menu reste bloquée (`dbgChauffe().divers = 0`).
- Un toucher de trop sur l'accueil ouvre l'atelier ; l'intro et la boule veulent chacune un toucher (`window.__intro`).
- Charge machine 34-45 pendant les mesures : un blocage de ~5 s est apparu deux fois dans les passes APRÈS puis plus jamais sur quatre passes (bruit machine, non reproduit).
- Le bouton REJOUER est `#mDead [data-m="replay"]` (le banc mémoire.py cherche encore `data-a`).

## 6. Régression « écran de mort 8-12 s sur le train » (09/11) — NON reproduite sur Mac ×4
Mode `--latence` du banc (`python3 outils/banc-perf/depart-mort.py --latence --parties 8 --vp <worktree>/"VERSION PRINCIPALE"`), mesuré DANS la page (rAF), sans profileur, `TEL_NATIF`, ×4, charge 23-24, 8 parties enchaînées par cible :
| | main pur (db609056) | train (`perf3-sur-main-5`, 8a10c5e9) |
|---|---|---|
| mort → game over = écran de mort affiché = REJOUER cliquable | 2 046 à 3 271 ms (médiane ≈ 2,3 s) | 1 974 à 2 418 ms (médiane ≈ 2,25 s) |
| mort → pré-bâti de la partie suivante prêt | médiane **4,7 s** (1,9 à 9,4 s ; **32 s** sur la grotte « mine ») | médiane **4,7 s** (2,1 à 10 s ; 10 s sur la grotte « glace-mine ») |
| REJOUER tapé → partie lancée | 0,94 à 1,76 s | 0,67 à 1,93 s |
| géométries en fin de partie | ~520-590 (985 sur la grotte) | ~500-600 (972 sur la grotte) |
Conclusion : **aucune différence mesurable entre main et le train à cette étape sur ordinateur** ; l'écart de 8-12 s contre 3-3,5 s vu sur le 13 Pro est propre au téléphone (GPU Metal, bridage thermique, rendu audio/PCM de fin, gouverneur mobile) ou à une définition différente de « REJOUER disponible ». Les géométries ~1 300 à la mort vues sur iPhone ne sont pas reproduites non plus (le seul cas haut ici est la grotte, ~980, identique sur main). Les seuls cas lents du pré-bâti sont les grottes (10-32 s) : à surveiller, ils coûtent aussi sur main. Pour trancher, il faut le banc iPhone avec la bissecte par interrupteurs (`?memoire=ancien`, `?premfois=0`, `?menu=max&repos=0`, `?gouv=max&mob_gouv=0`, `?mob_poly=0`, `?grotteworker=0`) : `?premfois=0` (P6) ne touche de toute façon ni l'écran de mort ni le pré-bâti — il ne fait que dessiner d'avance des billets, panneaux, pigeon, quads et moteurs gardés au menu.
