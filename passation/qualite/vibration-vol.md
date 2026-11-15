# Vibrations de la caisse EN VOL — relevé image par image (15-16/11/2026)

Demande de Sacha (15/11) : « la voiture a toujours des vibrations/bugs à certains moments sur route et en l'air ».
Cet angle : le mode `fall`. Rien n'est corrigé ici. Branche `qa/vib-vol`, banc `outils/banc-vibration/`.

## Méthode

- Chrome sans fenêtre, iPhone 13 Pro émulé (`?appareil=iPhone14,2`), `dbgNoShake` = vrai (toutes les secousses voulues déjà coupées).
- Horloge VIRTUELLE (`performance.now` remplacé), rAF coupé, `dbgCadence(60)` (aucune image sautée), `dbgStep(1, ms)` à dt imposé. Aucune milliseconde réelle.
- Suites de dt : `r60` (16,7), `r30` (33,3), `alt` (16,7 / 33,3 alternés), `tel` (33 ms + 22 / 50 / 67 / 100 ms au hasard fixe, comme le 13 Pro), dt plafonné à 50 ms par le jeu.
- À chaque image : carGroup, la carrosserie, la caméra, **la carrosserie dans le repère de la caméra** (rotation relative, pixels projetés du centre, du nez, du toit), distance et champ (taille à l'écran), `dbgVol()`.
- Vibration = résidu `x[i] − interpolation(x[i−1], x[i+1])` qui change de signe ≥ 3 images de suite, au-dessus de 0,5 px ou 0,1°.
- Le 13 Pro réel (`ios-ultime-mesures/vol/vol-1115-1546.json`, cadence 30) : sur 741 images d'une phase, 520 dans la case 33 ms, 142 dans la case au-dessus, 39 au-delà, 40 en dessous. Une image sur quatre n'a pas la durée de sa voisine.

Commandes (verrou d'abord : `outils/banc-vibration/passe.sh <qui> <dossier> <scénarios.txt>`) :

    node outils/banc-vibration/vol.cjs --carte nuages --dt r60,r30,alt,tel --n 480                       # sauts courts, 265 km/h
    node outils/banc-vibration/vol.cjs --carte nuages --v 480 --imp 45 --saut 1.5 --nit 1 --dt alt,tel,r30 --n 480 --tag long   # longs vols au nitro
    node outils/banc-vibration/vol.cjs --carte jade --fmt debout --dt tel,r60 --n 480 --nit 2
    node outils/banc-vibration/vol.cjs --carte nuages --dt tel,alt --n 480 --fig 12 --lat 14 --tag figlat  # figures + braquage
    node outils/banc-vibration/vol.cjs --chute 1 --dt r60,r30 --n 360 --fmt debout                       # chute libre de l'accueil
    node outils/banc-vibration/analyse.cjs <relevé.json> --mode vol --detail 3
    node outils/banc-vibration/transitions.cjs <relevé.json>
    node outils/banc-vibration/replique-camera-vol.cjs 740 12

## 1. PROUVÉ — la caméra de vol dépend de la durée de l'image

`code/moteur/boucle-3-physique.js:473-477` : l'écart caisse→caméra est repris de l'image d'avant, diminué de l'avance de la caisse (`v·dt`), puis `lerp(cible, min(1, dt·k))`. En régime établi le retard vaut `v·(1/k − dt)` : il change avec dt. `:484` (le bras) raccourcit ensuite le tout d'un facteur qui dépend lui aussi de `v·dt`. Même forme non compensée pour `camUp.lerp(…, dt·3)` (`:488`) et le champ (`:511`).
À dt régulier rien ne bouge. Dès que dt varie, la caméra avance et recule, monte et descend autour de la caisse, à chaque image. Proportionnel à la vitesse.

| Relevé | dt | Vitesse | Ce qui vibre | Chiffres |
|---|---|---|---|---|
| nuages, sauts courts | r60, r30 | 265 km/h | rien | 0 suite en vol |
| nuages, sauts courts | alt | 265 km/h | taille de la caisse | 127 des 218 images de vol, résidu ±1,3 à ±2,0 % (distance : +0,21 m en 17 ms, +0,12 m en 33 ms) |
| nuages, long vol nitro | alt | 740-980 km/h | tangage caisse/caméra | 305 des 368 images de vol, résidu ±0,95° ; élévation de la caméra 18,1° / 19,0° / 18,1° / 19,2° une image sur deux (hauteur 3,8 / 4,0 m à 12,2 m) |
| idem | alt | idem | caméra dans le monde (toute l'image) | tangage 304 images ±0,97° ; lacet 224 images ±0,6° ; nez de la caisse ±1,2 px sur 235 images |
| nuages, long vol nitro | tel | 985 km/h | caméra dans le monde | 5,27° → 1,61° → 4,24° → 1,44° → 3,79° → 1,48° → 4,36° (images de 100, 22, 50, 33, 100, 22 ms) : ±2,6° par image |
| jade, long vol nitro | tel | 836-945 km/h | taille de la caisse | −11,5 % sur une image de 67 ms (21,5 → 19,4 m), −4,9 % (100 ms), −6,1 % (50 ms) ; tangage relatif −1,6° |

Réplique Node (`replique-camera-vol.cjs`) : même zigzag avec la formule du jeu, 0,000° avec un suivi intégré.

Correctif proposé : intégrer exactement. `E = exp(−k·dt)` ; `écart = T∞ + (écart − T∞)·E` avec `T∞ = cible − v·(1/k − 1/60)·part de traîne` (le régime de 60 i/s, à toute cadence), puis le bras. `lisse60` pour `camUp` et le champ. À valider au banc avec `--dt alt,tel` : 0 suite attendue.

## 2. PROUVÉ — la préparation de pose part en marche d'escalier sur les petits sauts

`code/gameplay/vol-equilibre.js:93-98` : `a = 1 − smoothstep(max(0, hs − 2,8) / vN, 0,05, 0,45)`, seulement si `vN > 0,4`. Un saut nitro culmine à ~1 m (< 2,8 m) : le temps calculé vaut 0, donc `a` passe de 0 à 1 en UNE image, à l'instant où la caisse commence à redescendre. La caisse est alors tirée vers l'assiette de la route à 37 % par image (60 % à 30 i/s).

- 55 débuts de préparation relevés, 55 en échelon : `VEQ.pose` (lissé) passe de 0 à 0,17 à 60 i/s et de 0 à 0,31 à 30 i/s, soit exactement `lisse60(10)` d'un échelon 0 → 1.
- Vitesse de rotation de la caisse à cette image : 55 → 167 °/s (r60), 47 → 114 °/s (r30).
- Saut d'une image : 2,0° médian, 3,4° au pire (r60) ; avec braquage et figures 3,5° médian, 6,1° au pire. Exemple : roulis −7,15° en 33 ms (image 84 de `figlat…tel`), contre −1,6° l'image d'avant.

Correctif proposé : rendre `a` continu (le temps avant contact sans le seuil dur de 2,8 m, ou une montée bornée de `a` à ~4 /s), sans toucher à la pose des grands sauts.

## 3. PROUVÉ (en partie voulu) — un à-coup d'une image à chaque décollage et à chaque pose, doublé à 30 i/s

`transitions.cjs`, saut d'une image de la caisse à l'écran (pas de l'image de transition moins pas de l'image d'avant) :

| dt | Décollages (médiane / pire) | Poses (médiane / pire) |
|---|---|---|
| r60 | centre 4,2 / 7,8 px · tangage 2,0 / 4,0° | centre 6,5 / 7,6 px · tangage 1,0 / 4,5° |
| r30 | centre 12,1 / 14,5 px · tangage 1,9 / 4,5° · roulis 1,6 / 2,9° | centre 12,8 / 15,1 px · tangage 3,0 / 8,2° · roulis 2,6 / 3,9° |
| tel | centre 12,3 / 18,6 px · tangage 2,2 / 9,0° | centre 10,7 / 18,6 px · tangage 1,1 / 11,0° |

Causes lues : la caméra change de régime en une image (`boucle-3-physique.js:466-497` en vol, `:201-230` au sol) ; le nez plonge par une impulsion de vitesse à la pose (`vol-equilibre.js:128`, `spV += 0,9 + k·2,4` rad/s) puis rebondit à 2 Hz (`:137-141`). Le plongeon du nez est voulu (14/10). Ce qui ne l'est pas : il fait 2 à 3 fois plus de chemin par image à 30 i/s, la cadence du téléphone.

Correctif proposé : étaler l'impulsion du nez sur ~50 ms et fondre la place de la caméra sur 2-3 images à la transition. À juger par Sacha (c'est une sensation de pose).

## 4. NON PROUVÉ — le radar de pose ou le viseur qui clignote

`CAMV.eta` (99 ↔ valeur), `LM.vu`, `VEQ.si` qui change de portion de route : lus dans le code (`boucle-3-physique.js:526-557`, `camera.js:63-68`), jamais vus osciller. 0 suite sur le roulis de la caméra à dt régulier dans tous les relevés. Un seul saut de `si` (1840 → 898, Jade, à 500 m de la route) : c'est le pilote du banc qui a inversé son volant, pas le jeu.

## 5. ÉCARTÉ — tremblement de la chute libre de l'accueil, rebonds sol/vol

- `code/interface/chute-libre.js:118-135` garde un tremblement voulu hors `dbgNoShake`. Mesuré : 0 suite à 60 et à 30 i/s, résidu maximal 0,36° (roulis).
- Allers-retours sol/vol : 0 transition à moins de 200 ms de la précédente sur ~250 transitions.
- Régulier 60 ou 30 i/s, en vol : 0 suite. La vibration en vol n'existe que quand dt varie.

## Pour l'angle « sol »

Vu en passant, dt alterné, AU SOL en virage (nuages, 200-270 km/h) : lacet caisse/caméra en zigzag sur 162 images, ±0,3° (pire 0,93°). À dt régulier : rien.

## Pas fait

- Aucune mesure sur le téléphone lui-même. Les suites `alt` et `tel` imitent ses durées d'image, elles ne les rejouent pas.
- Grotte, orbite, ville, canyon non passés. Murs, plafond (`murRoule`), bord tordu (`TBORD`), dalle couchée à plus de 25° non provoqués.
- Les correctifs sont proposés, pas essayés dans le jeu (seule la réplique Node du n° 1 a tourné).
