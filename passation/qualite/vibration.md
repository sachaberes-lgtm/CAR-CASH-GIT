# LA CAISSE QUI VIBRE — les restes (16/11, branche `qa/vibration`, worktree `~/cash-car/qualite-vibration`)

Sacha : « la voiture a toujours des vibrations/bugs à certains moments sur route et en l'air ».
Les trois enquêtes (sol, vol, cadence) sont réunies ici : `passation/qualite/vibration-{sol,vol,cadence}.md`, bancs dans `outils/banc-vibration/`.
Tout est mesuré au banc (Chrome sans fenêtre, iPhone 13 Pro émulé, horloge virtuelle, dt imposé). Rien n'a été vu sur le vrai téléphone.

## Motifs de dt

- `r60` : 16,67 ms · `r30` : 33,33 ms exact (pas 33 : sous le seuil du hoquet) · `alt` : 16,67 / 33,33 alternés.
- motif téléphone : 80 % 33,33 ms, 15 % 50 ms, 5 % 66,7 / 100 ms (le jeu borne à 50). `tel` dans `vib.cjs`, `tph` dans `vol.cjs`.

## 1. Les deux correctifs déjà sur main tiennent dans le jeu assemblé

Banc `vib.cjs` (sol + sauts, moteur 10, ~470-630 km/h). Avant = `?sans=hoquetpas,capimage`. Tableau par `ab.cjs`.
Hoquet = images où la hauteur de la carrosserie change de plus de 0,4 %. Tics = images au sol où le lacet caisse/caméra a un écart haute fréquence > 0,5°.

| carte · motif | hoquet avant | hoquet après | tics avant | tics après |
|---|---|---|---|---|
| nuages · 30 i/s (600 img) | 599, plage 0,960-1,070, gy 3,8e5 | 186, plage 0,997-1,018, gy 0 | 11 (max 0,92°) | 0 (max 0,38°) |
| nuages · 60 i/s | 123 * | 121, 0,997-1,017 | 0 | 0 |
| nuages · téléphone (230-253 img) | 250, 0,960-1,070 | 48, 0,997-1,018 | 13 (max 0,86°) | 1 (0,51°) |
| jade · 30 i/s | 599, 0,960-1,070, gy 4,8e5 | 167, 0,997-1,018 | 26 (max 2,89°) | 1 (0,55°) |
| jade · 60 i/s | 29 * | 18, 0,998-1,013 | 0 | 0 |
| jade · téléphone | 593, 0,960-1,070, gy 7,5e5 | 134, 0,997-1,019 | 80 (max 1,70°) | 3 (0,84°) |

\* à 60 i/s « avant », la plage 0,960-1,070 est le reste du segment 30 i/s qui précède (le ressort sature, puis s'éteint).
Les images « après » au-dessus de 0,4 % sont le hoquet VOULU de chaque pièce (bosse de 1,8 % au plus, éteinte en quelques images, comme à 60 i/s).
Lacet efficace au sol : nuages 30 i/s 0,166° → 0,070°, téléphone 0,222° → 0,091° ; jade 30 i/s 0,297° → 0,099°, téléphone 0,357° → 0,127°.
`dbgState().cgorGy` (nouveau) donne le ressort sur le téléphone : 0 au repos, jamais au-delà de 0,07.

## 2. Corrigé dans ce lot

### a. La caméra de vol au temps près — `CAM_VOL_PAS`, `?sans=camvolpas` = avant

Ma mesure d'abord (l'enquête « cadence » la disait invisible, l'enquête « vol » à ±1°) : les deux ont raison. À 265 km/h c'est sous le seuil.
En vol nitro long (740-980 km/h) au motif téléphone, la caméra tangue nettement :

| relevé (vol.cjs) | caméra (monde) tangage : images en zigzag / pire | caisse dans la caméra, tangage | taille de la caisse à l'écran |
|---|---|---|---|
| nuages, vol nitro long, téléphone, avant | 124 / 4,51° | 128 / 4,21° | 76 images / 12,4 % |
| idem, après | 5 / 0,15° | 11 / 0,61° | 13 / 8,0 % |
| jade debout, nitro, téléphone, avant | 74 / 2,52° | 77 / 2,48° | 30 / 10,7 % |
| idem, après | 16 / 0,85° (9 / 0,23° à une 2e passe) | 15 / 0,88° | 6 / 7,0 % |
| nuages, vol nitro long, alternés, avant | 13 / 0,38° | 3 / 0,12° | 71 / 3,1 % |
| idem, après | 0 | 0 | 94 / 3,75 % (voir non prouvé) |
| sauts courts 265 km/h, téléphone | avant 0 · après 0 | 3 / 0,67° → 0 | 3 / 2,1 % → 3 / 2,4 % |
| 60 et 30 i/s réguliers | 0 avant, 0 après | 0 | 0 |

(sur 329-374 images de vol par relevé ; zigzag = résidu qui change de signe ≥ 3 images de suite, > 0,1° ou > 0,5 px ; le temps de l'analyse est borné à 50 ms comme celui du jeu.)

Ce qui change : `boucle-3-physique.js`, le suivi de vol. L'écart d'avant est ramené à la caisse d'avant, puis composé vers sa cible par `lisse60(k,dt)`,
la cible reculée de la traîne de régime de 60 i/s (`v·r·(1−a)/(a·60)`). Le haut de l'écran (`camUp`), le champ et le vertigo passent aussi par `lisse60`.
À 60 i/s c'est le même calcul, réarrangé : `preuve-camvol.cjs` (les lignes recopiées, l'ancienne contre la nouvelle) : **4,3e-13 m** d'écart sur 1200 images.
Au même modèle : motif téléphone, résidu de l'écart caisse→caméra 0,88 m → 0,05 m ; alternés 0,42 → 0,02 m.
Effet de bord voulu : à 30 i/s réguliers l'ancienne caméra se tenait plus près en régime (modèle : 53,2 m contre 57,3 à 60 i/s) ; la nouvelle tient la place du 60 i/s.
Le bras (`brasVol`) borne de toute façon la distance en vol : à vérifier à l'œil sur le téléphone.

### b. La pose se prépare sans marche — `POSE_MONTEE`, `?sans=posemontee` = avant, `?posemontee=N`

`vol-equilibre.js` : quand la préparation de pose saute de < 0,05 à > 0,5 en une image (petit saut, sous 2,8 m), elle monte désormais d'au plus 6 /s jusqu'à
rejoindre la valeur calculée. Une montée continue n'est pas touchée : sur les grands sauts mesurés, la plus grosse première marche continue est 0,36 (seuil 0,5).
Saut de rotation de la caisse à l'image de la marche (rotation de cette image moins celle de l'image d'avant, ramenée au dt) :

| sauts courts, nuages | avant : médiane / pire | après |
|---|---|---|
| 60 i/s (6 marches) | 2,02° / 3,43° | 0,18° / 0,31° |
| 30 i/s (14 marches) | 2,30° / 3,61° | 0,41° / 0,58° |
| téléphone (12 marches) | 1,20° / 3,87° | 0,44° / 0,75° |

Images de vol où la caisse saute de plus de 2° d'une image : 30 i/s 12 → 0, 60 i/s 3 → 0.
Un premier réglage (plafond sur toute montée) touchait aussi les grands sauts (montée continue jusqu'à 44 /s à dt alternés) : il ne vise plus que la marche.
Dans les relevés de vols longs, le plafond ne joue qu'après une vraie marche (3 à 8 images par relevé). Les poses elles-mêmes ne changent pas de forme
(30 i/s, tangage de la pose médiane / pire : 3,16° / 8,44° avant, 2,95° / 9,09° après — d'autres vols, même scénario).
Ceci change aussi le 60 i/s, sur les petits sauts seulement (la marche y existait aussi : 2 à 3,4°).

### c. Le champ de conduite au temps près — `CHAMP_PAS`, `?sans=champpas` = avant

Le coup de champ du pad turbo et de la nitro (`loop._fovB`) par `lisse60`. Même calcul à 60 i/s. Petit (marche de 2,9 px relevée par l'enquête cadence), pas mesuré à part.

## 3. Proposé, éteint : `?plus=posedouce` (à juger par Sacha)

Le coup de nez de la pose (`VEQ.spV += 0,9 + k·2,4`) versé sur 50 ms au lieu d'une image. Même impulsion totale.
Sauts courts, nuages, transitions (`transitions.cjs`), saut d'une image à la pose :

| | tangage médiane / pire | nez à l'écran (y) médiane / pire |
|---|---|---|
| 30 i/s, normal | 3,16° / 8,44° | 12,2 / 18,7 px |
| 30 i/s, posedouce | 2,08° / 7,05° | 11,3 / 16,2 px |
| téléphone, normal | 2,24° / 9,64° | 11,6 / 23,0 px |
| téléphone, posedouce | 1,69° / 7,81° | 9,1 / 21,5 px |

Gain modeste : le reste de l'à-coup vient de la caméra qui change de régime en une image (décollage et pose). Je n'y ai pas touché : c'est la sensation de la pose.

## 4. Les autres intégrations de la même famille (tout `code/` hors `code/maps`)

Critère d'un ressort `v += (−K·x − C·v)·d ; x += v·d` : stable si K·d² + 2·C·d < 4 (et C·d < 2). Marge à 33,3 ms et à 50 ms (le dt du jeu, borné à 50) :

| ressort | K, C | pas | 33,3 ms | 50 ms |
|---|---|---|---|---|
| hoquet des pièces (`pouvoirs-grisants.js`) | 1600, 34 | sous-pas 1/60 depuis main | 1,3 (était 4,04 : instable) | idem |
| roulis caisse (`boucle-3-physique.js:43`) | 196, 15,4 | min(dt,1/30) | 1,24 | 1,24 |
| suspension (`:54`) | 230, 16 | min(dt,1/30) | 1,32 | 1,32 |
| coups de tangage SCOUP (`:46`) | 169, 13 | min(dt,1/30) | 1,05 | 1,05 |
| nez après la pose (`vol-equilibre.js` veqConduite) | 169, 8,3 | min(dt,1/30) | 0,74 | 0,74 |
| balance du vol (veqCorps) | 90, 8,0 · 64, 5,8 | min(dt,1/30) | 0,63 · 0,46 | idem |
| cabrage du demi-tour (`demi-tour.js:129`) | 120, 9,5 | min(dt,1/30) | 0,77 | 0,77 |
| roulis caméra (`camera.js:60`) | ω, ζ variables | sous-pas 8,5 ms | stable | stable |
| tonneau caméra (`camera.js:103`) | 16, 8 | dt | 0,55 | 0,84 |
| jauges du bouton nitro (`bouton-nitro-gains.js:177`) | 289, 17 | min(dt,0,05) | 1,45 | 2,42 |
| ailes X-wing (`voitures/ailes.js:178`) | 170, 13 | dt | 1,06 | 1,73 |
| levier de la machine (`final-spin.js:276`) | 170, 13 | min(dt,0,033) | 1,04 | 1,04 |

Aucun autre ne diverge ni n'oscille d'une image à l'autre. Le plus serré : les jauges du bouton nitro à 50 ms (2,42 sur 4).
Lissages `x += (c − x)·dt·N` sans borne avec dt·N ≥ 1 : aucun sur la caisse, la caméra ou le HUD (les `dt·N` trouvés sont des compteurs d'émission de particules).
Restent des lissages `Math.min(1, dt·k)` (bornés, donc sans oscillation) dont la vitesse dépend un peu de la cadence ; la caméra de route au sol en fait partie :
l'enquête cadence l'a mesurée sous 0,5 px. Non touchés.
À noter sans correction : plusieurs ressorts prennent `min(dt, 1/30)` ; sur une image de 50 ms ils perdent 17 ms de leur temps (plus lents, pas instables).

## 5. Non prouvé

- Rien sur le vrai 13 Pro. Le motif téléphone imite les durées d'image de la boîte de vol, il ne les rejoue pas.
- Le 60 i/s inchangé est prouvé AU MODÈLE (4,3e-13 m) et par construction (`lisse60(k,1/60)` = `k/60`). Au banc, deux pages ne repartent pas du même point
  (l'élan dépend du temps réel avant la pose de l'horloge virtuelle, 11 m d'écart dès la 1re image) : pas de comparaison image par image dans le jeu.
- Les courses avant / après divergent : les chiffres comparent des vols du même scénario, pas les mêmes vols. Deux cas montent un peu après : la taille de la caisse
  en vol nitro à dt alternés (71 → 94 images, pire 3,1 → 3,7 %) et, en vol nitro long au motif téléphone, le lacet de la caméra reste à 20 images (0,52°, 30 avant). Non expliqués.
  Le téléphone ne tourne pas en 60/30 alternés.
- L'à-coup de la caméra au décollage et à la pose (12 px, 2-3° à 30 i/s) n'est pas traité.

## Bancs (tous sous `~/cash-car/verrou-banc.sh`)

    QUI=qa-vibration SANS_FUMEE=1 bash outils/banc-vibration/passe-sol.sh <dossier> outils/banc-vibration/plans/preuve-ab.txt
    node outils/banc-vibration/ab.cjs <dossier>/*.json
    bash outils/banc-vibration/passe-vol.sh qa-vibration <dossier> outils/banc-vibration/plans/vol-ab2.txt
    node outils/banc-vibration/ab-vol.cjs <avant.json> <après.json>
    node outils/banc-vibration/transitions.cjs <relevé.json>
    node outils/banc-vibration/preuve-camvol.cjs

## Quoi regarder sur le 13 Pro

1. Un long vol au nitro (gros saut, 800 km/h et plus) : la caméra ne doit plus pomper ni tanguer image par image. Comparer avec `?sans=camvolpas`.
2. De petits sauts au nitro en ligne droite : la caisse ne doit plus pivoter d'un coup juste avant de retomber. Comparer avec `?sans=posemontee`.
3. Ramasser une série de pièces au sol puis en vol : la carrosserie fait une petite bosse puis s'arrête (`dbgState().cgorGy` revient à 0).
4. La distance de la caméra en vol : la même qu'avant à l'œil (la caméra de 30 i/s se tenait un peu plus près en régime).
5. Essayer `?plus=posedouce` sur quelques poses : Sacha dit si le coup de nez lui plaît mieux.
