# La caisse qui vibre — angle SOL (banc du 15-16/11)

Demande de Sacha (15/11) : « la voiture a toujours des vibrations/bugs à certains moments sur route et en l'air, on dirait un bug récurrent ».
Rien n'est corrigé ici. Ce rapport donne les causes prouvées, les chiffres, et comment les rejouer.

## Ce qui avait déjà été tenté (et pourquoi ça n'a pas suffi)

- 12/11 : secousses de caméra coupées (`spdSh=0`, `CAM_SHAKE_V=0`, boucle-3-physique.js:269).
- 13/11 : roulis et chasse de la carrosserie bornés à grande vitesse (`aLatCaisse`, camera.js:271), penche de l'horizon lissée.
- Aucune des deux ne touche aux deux causes ci-dessous. La première est arrivée le 11/11 (v1453, « la gorgée ») : la veille de la première plainte.

## Cause 1 — le hoquet des pièces ne s'éteint jamais à 30 images par seconde (PROUVÉ)

`code/gameplay/pouvoirs-grisants.js:365` (cgorTick). Chaque pièce ramassée lance un ressort sur la taille de la carrosserie (`carBody.scale`) :

    const d=Math.min(dt,1/30);CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;

Ce schéma n'est stable que si `1600·d² + 68·d < 4`, soit **d < 33,08 ms**. Le téléphone tourne calé à 30 i/s : d = 33,33 ms (les images longues sont bornées à 33,33).
Facteur par image : 0,66 à 60 i/s (éteint en 9 images), **−1,039 à 30 i/s** : le signe alterne à chaque image et l'amplitude grandit de 3,9 % par image.
La hauteur affichée est bornée à −4 % / +7 % : la carrosserie passe de 0,96 à 1,07 **à chaque image**, sans fin, au sol comme en vol (cgorTick tourne dans les deux modes).
Seule la mort (mode `boom`) remet le ressort à zéro.

Mesuré dans le vrai jeu (iPhone 13 Pro émulé, pilote de mesure, moteur 10, ~620 km/h) :

| carte, motif de dt | images où la hauteur change de > 0,4 % | plage de `carBody.scale.y` | toit à l'écran |
|---|---|---|---|
| nuages, 60 i/s régulier | 356 / 1924, suites de 4 images au plus (le hoquet voulu) | 0,977 – 1,024 | 7 px |
| nuages, 30 i/s régulier | **957 / 958**, une seule suite de 31,9 s | 0,960 – 1,070 | **16 px** |
| nuages, « téléphone » (80 % 33 ms, 15 % 50, 5 % plus) | **869 / 870** | 0,960 – 1,070 | 16 px |
| nuages, 33-33-34 ms (horloge WebKit à la ms) | **974 / 975** | 0,960 – 1,041 | 12 px |
| nuages, 30 i/s, avec sauts | **1175 / 1176**, dont 87 / 87 images de VOL | 0,960 – 1,070 | 16 px |
| nuages, 30 i/s, portrait | 963 / 964 | 0,960 – 1,070 | 10 px |
| jade, 30 i/s | 1223 / 1224 | 0,960 – 1,070 | 13 px |
| ville / canyon / grotte, « téléphone » | 1162 / 1169 · 1599 / 1600 · 1599 / 1600 | 0,960 – 1,070 | 14-17 px |

(px = pixels de l'écran du 13 Pro, toit à 1,2 m, caméra à ~4,8 m.)

Les 15 premières images à 30 i/s (nuages) : 1,0385 · 0,9600 · 1,0430 · 0,9600 · 1,0482 · 0,9600 · 1,0408 · 0,9600 · 1,0454 · 0,9600 · 1,0503 · 0,9600 · 1,0443 · 0,9600 · 1,0490.
À 60 i/s, mêmes pièces : 0,9600 · 0,9765 · 0,9956 · 1,0058 · 1,0239 · 1,0211 · 1,0105 · 1,0013 · 0,9967 (une bosse douce, puis plus rien).

La boîte de vol du 13 Pro (vol-1115-1546.json) : toutes les images de toutes les courses sont calées à 30 (`c30` = `n` dans chaque case). Le téléphone est donc toujours dans le cas instable.
« À certains moments » : le ressort repart à chaque pièce, grandit tant que les images durent 33,3 ms ou plus, et ne retombe que sur une image plus courte (0,66 à 16,7 ms, 0,39 à 25 ms).

Autre risque, calculé et non observé : `CGOR.gy` grandit sans borne (1e16 à 1e19 après 50-60 s au banc). Vers 10 minutes de course sans mourir il dépasse 1e308, devient NaN, et la taille de la carrosserie avec.

Essai du correctif, dans la page du banc seulement (`--patch hoquet`, le même ressort en sous-pas de 9 ms au plus) : nuages 30 i/s 957 → 289 images (suites de pièces, 0,995 – 1,028), « téléphone » 869 → 250. C'est le hoquet voulu, comme à 60 i/s.

Rejouer : `node outils/banc-vibration/modele-hoquet.cjs` (node seul, lit la ligne du jeu) · `node outils/banc-vibration/vib.cjs --carte nuages --prog r30:1500 --out x.json` puis `node outils/banc-vibration/analyse-sol.cjs x.json --top 0 --hoquet 0`.

## Cause 2 — le cap de la caisse a un pas de retard sur la route (PROUVÉ)

- `code/moteur/boucle-2-conduite.js:16-30` : `frameAt(s,F)` à l'ANCIEN s, `dyaw` = le virage de la route depuis l'image d'avant, `psi -= dyaw`. Puis (ligne 125) `s` avance.
- `code/moteur/boucle-3-physique.js:3-7` : `frameAt(s,F)` au NOUVEAU s, `fwdW = F.t·cos(psi) + F.b·sin(psi)`.

Le cap monde de la caisse = cap de la route au nouveau s + psi, mais psi n'a retiré le virage que jusqu'à l'ancien s. Il traîne du virage de la route sur le pas de l'image : lacet de la route × dt.
Dans un virage régulier à dt constant c'est un décalage fixe. Dès que dt change (33 → 50 → 33 ms) ou que la courbure de la route ondule d'un pas à l'autre, le nez saute d'une image à l'autre. `routeLacet` (dyaw ÷ dt de l'image suivante) porte le même défaut.

Mesuré dans le vrai jeu : l'écart haute fréquence du lacet de la caisse dans le repère de la caméra, comparé au « virage de la route sur le pas de l'image » :

| carte, motif | corrélation | tics de lacet > 0,5° (images au sol) | dont prévus par le retard | eff mesuré | eff une fois le retard retiré |
|---|---|---|---|---|---|
| nuages 60 i/s | 0,90 | 0 / 1918 | – | 0,059° | 0,026° |
| nuages 30 i/s | 0,90 | 38 / 952 | 36 | 0,188° | 0,081° |
| nuages « téléphone » | 0,86 | 151 / 864 | 147 | 0,358° | 0,180° |
| jade 30 i/s | 0,92 | 58 / 1218 | 56 | 0,262° | 0,105° |
| jade « téléphone » | 0,81 | 215 / 1098 | 203 | 0,459° | 0,270° |
| jade « téléphone », volant lisse | 0,80 | 173 / 1081 | 168 | 0,382° | 0,231° |
| ville « téléphone » | 0,75 | 143 / 997 | 137 | 0,361° | 0,240° |
| canyon « téléphone » | 0,68 | 186 / 1582 | 170 | 0,360° | 0,265° |
| grotte « téléphone » | 0,81 | 290 / 1530 | 274 | 0,451° | 0,263° |

Pires tics : 3,0° (jade), 3,9° (grotte), 2,8° (canyon). Avec un volant lisse (`+l`, anticipation par la géométrie) les chiffres bougent peu : ce n'est pas le pilote du banc.

Un moment (jade, « téléphone », volant lisse, 676 km/h, virage à ~78 °/s) — ms · psi (rad) · lacet caisse/caméra · écart :

    33 · −0,008 · −170,09° · −0,28
    33 · −0,008 · −168,38° ·  0,31
    33 · −0,015 · −167,30° ·  0,45
    50 ·  0,003 · −166,82° · −0,99
    33 ·  0,022 · −164,85° ·  2,72   ← le nez saute
    33 ·  0,017 · −168,32° · −1,95   ← et revient

Modèle node (vrai three.js, vraie `frameAt`, mêmes lignes) : 540 km/h, virage de 120 m de rayon, motif « téléphone » : tics de 1,52° puis −1,50° sur chaque image de 50 ms ; avec le virage retiré APRÈS l'avance (`--corrige 1`) : 0,39° au plus.
Rejouer : `node outils/banc-vibration/modele-cap.cjs --motif tel` puis `--corrige 1`.

Ce défaut ne touche que le sol. Il est plus petit à l'écran que la cause 1 (le nez, à 2 m, bouge de 1 à 4 px CSS).

## Pas une cause (vérifié)

- Les autres ressorts de la caisse (roulis 196/15,4 · suspension 230/16 · coups 169/13 · cabrage 120/9,5 · ailes 170/13) : critère `k·d² + 2c·d` entre 0,8 et 1,3 à 1/30 (limite 4). Stables.
- La distance caméra-caisse : 1 à 2 images au-dessus de 5 cm par course. La caméra ne « pompe » pas.
- L'interpolation de la route (`frameAt`, pas de 1 à 1,6 m) : à 60 i/s réguliers, 0 à 3 images sur ~2000 où le centre de la caisse bouge de plus de 1 px CSS. Rien de lié aux points.

## Non fait

- Rien n'a été vu sur le vrai téléphone : tout vient du banc (Chrome sans fenêtre, horloge virtuelle) et des modèles node.
- Le pouce réel (bruit du capteur) n'a pas été mesuré seul.
- Les transitions sol ↔ vol (bascule au bord, reprise de caméra) relèvent de l'angle VOL.
- Le passage du portail n'est pas couvert (le banc s'arrête 320 m avant).

## Le banc

`outils/banc-vibration/` : `vib.cjs` (le relevé, sous le verrou du Mac), `analyse-sol.cjs`, `passe-sol.sh` + `plan-exemple.txt` (une passe = plusieurs pages), `modele-hoquet.cjs` et `modele-cap.cjs` (node seul).
L'horloge du jeu est virtuelle (`performance.now` remplacé, `loop(t)` appelé à la main) : le dt est exactement celui du motif, la charge du Mac ne compte pas.
Le jeu vit dans une fonction fermée : le serveur du banc ajoute une ligne de sonde (`window.__vibEval`) à la page servie ; le fichier du jeu n'est pas modifié.
