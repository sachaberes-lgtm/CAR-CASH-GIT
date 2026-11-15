# LA CAISSE QUI VIBRE — angle LE TEMPS et LA CAMÉRA (15-16/11, branche `qa/vib-cadence`)

Sacha, 15/11 : « la voiture a toujours des vibrations/bugs à certains moments sur route et en l'air, ça fait plusieurs fois que je t'en parle ».
Rien n'est corrigé dans le jeu ici : des mesures, un banc, un correctif D'ESSAI servi par le banc seulement.

## Ce qui est prouvé : LE HOQUET DE LA CARROSSERIE est instable à 30 images par seconde

`code/gameplay/pouvoirs-grisants.js:365-367` (`cgorTick`, LA GORGÉE du 11/11, commit 8d64ea439, sur main depuis v1453) :

    const d=Math.min(dt,1/30);CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;
    y=clamp(CGOR.gy,-.04,.07) ; carBody.scale.set(1+y*.7,1+y,1+y*.4)

Un ressort raide (K 1600, amorti 34) lancé à chaque pièce ramassée, intégré d'UN pas par image. Ce schéma diverge dès que K·d² + 2·C·d > 4,
soit **d > 33,08 ms**. Le pas est borné à 33,33 ms : à 60 i/s tout va bien (9 images, +0,9 %), à 30 i/s on est juste au-dessus du seuil.
Valeur propre −1,039 : l'écart **change de signe à chaque image et grossit de 3,9 % par image**, jusqu'aux butées. La carrosserie alterne alors
**96 % / 107 % de sa taille une image sur deux, sans fin** (le ressort ne s'arrête jamais ; il ne se remet à zéro qu'à la mort).
Le 13 Pro de Sacha tourne à 30 i/s (profil `fps:30`, les 16 courses de `vol-1115-1546.json` sont calées à 30) ; le Mac à 60 : personne ne le voyait au bureau.
Les correctifs passés (secousses de caméra coupées, roulis borné) ne touchaient pas ce ressort. Dates : gorgée publiée le 11/11, plaintes des 12, 13 et 15/11.

### Les chiffres (banc `outils/banc-vibration/cadence.cjs`, horloge virtuelle, iPhone 13 Pro émulé, nuages, ~320-350 km/h)

Résidu = écart d'une image à la droite tirée entre ses deux voisines, au temps près. zz = images en zigzag pour 100. Toit = point de la carrosserie à 1,2 m, en px CSS (×3 sur le 13 Pro).

| passe (dt) | échelle Y : saut p95 | échelle zz/100 | toit à l'écran : résidu p95 | toit zz/100 (> 1 px) | centre de la caisse (carGroup) zz |
|---|---|---|---|---|---|
| 33,33 ms régulier, sol, couché | 11 % | 99,7 | 5,4 px | 99,7 | 0 |
| 33,33 ms régulier, sol, debout | 11 % | 99,7 | 7,5 px | 99,7 | 1 |
| 33,33 ms régulier, EN VOL | 11 % | 80 | 4,4 px | 80 | 0 |
| grille 120 Hz (82 % 33,33 · 14 % 41,67 · 2 % 25 · 2 % 66,67) | 11 % | 91 | 4,8 px | 61 | 0 |
| 33,00 ms régulier (le `dbgStep(1,33)` des autres bancs) | 1,4 % | 37 (en décroissance) | 0,7 px | 0 | 0 |
| 16,67 ms régulier | 1,1 % | 6 (reste du 30 d'avant) | 0,4 px | 2 | 0 |
| **33,33 ms + correctif d'essai** | 0,9 % | 3 | 0,4 px | **0** | 0 |
| **grille 120 Hz + correctif d'essai** | 1,2 % | 8 | 0,5 px | **0** | 0 |

Vingt images autour d'un décollage (33,33 ms régulier, s = 1410 → 1460, nuages, ~270 km/h) :

    image mode  s        échelle  toit Y   centre Y  toit − centre
    111   sol   1410,4    96,0 %  235,2    258,2     −22,9
    112   sol   1413,0   107,0 %  229,4    257,7     −28,4
    113   sol   1415,6    96,0 %  234,5    257,4     −22,9
    114   sol   1418,2   107,0 %  228,8    257,1     −28,3
    115   sol   1420,8    96,0 %  234,1    257,0     −22,9
    116   sol   1423,4   107,0 %  228,7    257,1     −28,4
    117   vol             96,0 %  227,9    250,2     −22,2
    118   vol            107,0 %  216,4    242,0     −25,5
    119   vol             96,0 %  214,5    234,0     −19,5
    120   vol            107,0 %  204,6    226,5     −21,9
    121   vol             96,0 %  201,9    220,2     −18,2
    122   vol            107,0 %  192,2    214,4     −22,2
    123   vol             96,0 %  190,8    209,3     −18,4
    124   vol            107,0 %  182,5    204,8     −22,3
    125   vol             96,0 %  182,4    200,9     −18,5
    126   vol            107,0 %  175,5    197,7     −22,3
    127   sol   1451,8    96,0 %  176,6    195,0     −18,4
    128   sol   1454,4   107,0 %  181,6    200,8     −19,2
    129   sol   1457,0    96,0 %  190,5    206,0     −15,6
    130   sol   1459,6   107,0 %  191,5    211,0     −19,5

Hors navigateur (`node outils/banc-vibration/ressort-hoquet.cjs`, l'intégrateur recopié) : dt 16,67 → arrêt en 9 images ; dt ≥ 33,33 → jamais d'arrêt,
butée atteinte 36 à 56 images (1,2 à 1,9 s) après UNE pièce, saut de 11 % à chaque image ; `gy` déborde à l'image 18 299 (10,2 min) et l'échelle devient NaN
(la carrosserie ne se dessinerait plus jusqu'à la mort) — calculé, pas vu en jeu.

### Ce qui n'est PAS prouvé : la part exacte sur le vrai téléphone

Sous 33,08 ms le ressort s'amortit (dt 33,0 : ×0,988 ; 32 : ×0,83 ; 30 : ×0,5 ; 26 : ×0,34). Tout dépend donc de la répartition fine des dt du 13 Pro, que la boîte
de vol n'enregistre pas image par image. Ce qu'elle dit : hors économie d'énergie (courses 4 et 5) 91 % des images entre 26 et 34,5 ms, 7 % plus longues (qui
font grossir), 2 % plus courtes ; 13 à 15 % des secondes sans aucune image de plus de 34 ms. En économie d'énergie : 80 % / 15 % / 3 %.
Avec mon tirage « tel » (82 % tirées entre 30 et 37 ms) une pièce seule s'éteint en ~40 images ; avec la grille 120 Hz (33,33 pile) ça sature. Le téléphone est entre les deux :
la vibration apparaît dans les passages où il tient un 30 i/s propre — « à certains moments ». À vérifier d'une lecture sur l'appareil (voir plus bas).

### Le correctif (à faire, une ligne)

Intégrer le ressort par pas d'au plus 1/60 s (`outils/banc-vibration/essai-hoquet.cjs`, appliqué par `--patch` à la copie servie) :

    const n9=Math.max(1,Math.ceil(dt*60-1e-6)),d=dt/n9;for(let i9=0;i9<n9;i9++){CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;}

Mesuré : à 33,33 ms le hoquet redevient celui du 60 i/s (101,1 → 100,1 → 99,8 → 100 %, fini en 4 images), 0 zigzag du toit. Rien d'autre ne change.
Vérification sur le téléphone avant/après : lire `dbgScene().car.children` (la carrosserie) `.scale.y` par le pont de l'inspecteur pendant une course, ou ajouter `CGOR.gy` à `dbgState()`.

## Ce qui est écarté (mesuré)

- **Le suivi de la caméra à dt irrégulier** (écart lissé `dt×7`, visée `dt×9`, `_camLat`, haut `dt×4`, caméra de vol). Mesuré dans le jeu : le centre de la caisse à l'écran,
  son cap, son tangage, son roulis et sa distance à la caméra n'ont AUCUN zigzag au-dessus de 1 px / 0,2° (0 à 5 pour 100 images sur le cap, max 0,6°), et le résidu à
  dt « téléphone » vaut celui du 33,33 régulier (centre : 0,46 / 0,19 px efficaces contre 0,45 / 0,15). Modèle hors navigateur (`modele-suivi.cjs`) : ≤ 0,3 px en virage R 150 m ou crête R 80 m à 450-900 km/h.
- **Un pas de physique fixe non interpolé** : il n'y en a pas. Un seul dt par image (`boucle-1.js:22`, plafonné à 50 ms), le même pour la caisse et la caméra, la caméra posée après la caisse dans la même tranche.
- **La cadence 30 qui sauterait la simulation mais pas la caméra** : `cadSaute` rend la main avant tout (`boucle-1.js:7`), rien n'est calculé ni dessiné.
- **Les secousses en sinus de l'horloge** (`Math.sin(t*38.7)`…) : toutes derrière `dbgNoShake`, posé d'office (`palier-appareil.js:151`).
- **Les autres ressorts** (roulis 196/15,4 · suspension 230/16 · coups de tangage 169/13 · vol équilibré ω 9,5 · cabré 120/9,5 · ailes 170/13) : critère ≤ 1,3 à 1/30 s (seuil 4), stables.

## Vu en passant (pas des vibrations)

- Un pad turbo ouvre le champ de +2,7° en une image à 30 i/s : le centre de la caisse descend de 2,9 px d'un coup puis 2,0 · 1,4 · 1,0 (une marche, pas un zigzag). Voulu (coup de champ).
- À dt alterné 16,67 / 33,33 (bascule 60 ↔ 30), le cap relatif caisse/caméra zigzague de 0,2 à 0,57° sur 29 % des images. Le téléphone ne tourne pas ainsi (calé à 30).
- Piège de banc : `dbgStep(1,33)` (33,00 ms) est SOUS le seuil de 33,08 ms : les bancs à 33 ms ne voient qu'un reste qui s'éteint. Il faut 33,34 ms ou plus.

## Le banc (`outils/banc-vibration/`)

- `cadence.cjs` : Chrome sans fenêtre, `performance.now()` remplacé par une horloge que le banc avance (dt au centième de ms, rien ne dépend de la charge du Mac), rAF coupé, rendu remplacé par rien.
  À chaque image : carGroup, la carrosserie, la caméra, la caisse dans le repère de la caméra (px CSS, angles, distance), l'échelle de la carrosserie. Suites de dt : r60, r30, r33, alt, tel, tel8, bascule, pointe.
- `analyse.cjs fichier.json [--pires 5 --signal ty --autour 10]` : la table et les 20 images autour des pires moments.
- `passes.sh` : plusieurs passes sous UN verrou (`~/cash-car/verrou-banc.sh`). `essai-hoquet.cjs` : le correctif d'essai. `ressort-hoquet.cjs`, `modele-suivi.cjs` : Node seul.

    printf '%s\n' "--out /tmp/vib --passes tel,r33,tel8,r30,r60 --n 300 --zig 1 --tag b" \
      "--out /tmp/vib --passes tel8,r30,r60 --n 300 --zig 1 --tag essai --patch outils/banc-vibration/essai-hoquet.cjs" \
      "--out /tmp/vib --passes r30,r60 --n 450 --saut 3 --imp 30 --tag vol" | sh outils/banc-vibration/passes.sh
    node outils/banc-vibration/analyse.cjs /tmp/vib/b-couche-nuages-zig.json --signaux cx,cy,ech,ty,cap,tang,roul,dist

## Non fait

- Aucune mesure sur le vrai 13 Pro (pas de dt image par image dans la boîte de vol, pas de lecture de l'échelle sur l'appareil).
- Une seule map (nuages), 270 à 420 km/h, moteurs 0 à 3 ; ni nitro tenue, ni figures, ni grande vitesse (> 600 km/h).
- La mise en vitesse du banc tourne à 33,33 ms : la passe « tel » part d'un ressort déjà saturé (elle montre la décroissance, pas la naissance).
