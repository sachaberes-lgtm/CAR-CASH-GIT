# Notes de l'agent `oeil` (session GAMEPLAY, passe SENSATIONS, 2026-10-14)

Copie : `sensations/wt/oeil` (branche `travail`, tag `base` = sensations-integration acf4f16). Servie par `wt/oeil-servi` (liens vers
`integ/VERSION PRINCIPALE/*` + l'index de la copie), port 8871. Captures : `sensations/banc/shots/oeil/` (+ journaux `*.log`).
Bancs neufs : `banc/oeil-moutons.cjs` (NUAGES 4, images GELÉES à l'instant voulu : la boucle du jeu est retenue par un
requestAnimationFrame enveloppé), `banc/oeil-pose.cjs` / `oeil-pose2.cjs` (le banc de l'accord + l'heure du flash du PARFAIT contre le
contact, 2e passage `?sens=0` dans le même Chrome), `banc/oeil-course.cjs` (une course au robot, captures gelées régulières et aux
décollages / contacts, relevé des TEXTES qui se chevauchent toutes les 250 ms). Un seul Chrome à la fois, charge vérifiée avant chaque.

## 1. NUAGES 4 « SAUTE LES MOUTONS » en image
Ouvrir le niveau : `dbgCampagne(4,0)` puis `#gJouer` (c'est ce que fait `oeil-moutons.cjs`). 9 moutons (s 1468 → 7390), crête mesurée
2,54-2,65 m (MOUTON_H 2,6), lat 0 / ±11-14 (2e série décalée) / troupeaux à −15, 0, +15.

**Vu (avant)** — `couche-m1-a120m.png`, `couche-m1-a50m.png`, `couche-m1-a15m.png`, `couche-troupeau-a120m.png` :
- le mouton NE SE LIT PAS : la lumière de peintre du nuage lui donne la teinte pêche du ciel et du bitume ; à 120 m rien, à 50 m une tache
  rose de quelques pixels juste au-dessus du toit de la caisse, il n'apparaît qu'à ~15 m (0,15 s avant le choc à 350 km/h). On ne saute
  que sur la foi de la plaque « DANS 90 M ».
- saut nitro OFFERT au pied du mouton : vérifié, jauge identique avant/après chaque saut (n0 = n1 dans les relevés) ; hors fenêtre
  (> 170 m) il coûte (4,33 → 3,91). Aucun objet qui flotte : crêtes à 2,6 m, ventre dans la dalle comme prévu. 0 erreur JS (5 passages).
- `couche-m2-dessus.png` : le 2e mouton est décalé (lat +11) — le pilote auto qui roule au centre passe À CÔTÉ : ni BEEE ni point (silence).

**Corrigé** :
- e30e187 + 5e278db : laine plus claire (`MOUTON_MAT`, clone de CLOUD_MAT, même programme — aucune compilation —, émission blanche .6) et
  une TÊTE NOIRE à deux oreilles à l'avant (MeshBasic sombre ; éclairée elle virait gris lavande, vu `couche-apres-m1-a15m.png`), enfant
  du groupe du nuage (suit la dérive, l'éclatement), cachée dès qu'il éclate. Après : `couche-apres2-m1-a50m.png` (un point sombre net au
  centre à 50 m), `couche-apres2-troupeau-a120m.png` (la rangée de têtes à 130 m), `couche-tous-troupeau-dessus.png` (de près : des
  visages de mouton). `dbgMoutons()` rend aussi `lat`. `?sens=0` : moutons d'avant.
- 573823b : `moutons-tous.log` → 1739 « DANS DESSUS » = BEEE alors que la caisse a seulement EFFLEURÉ la laine en vol et que le mouton
  n'a pas bougé (il n'éclate que touché au sol). Désormais seul le contact au sol compte ; retombé dedans, le mouton éclate (nuage.defonce).
  Après (passage -final) : 1739 DESSUS.
- Bilan robot : 7 / 9 à chaque passage (le pilote auto rejoint mal la 2e série décalée, et passe une fois entre deux moutons d'un troupeau).
  **BERGER D'OR non atteint au robot** — code relu, pas vu en image.

Laissé / à trancher : passer À CÔTÉ d'un mouton, ou ENTRE deux moutons d'un troupeau (4 m de jour), est muet (rien ne compte) ; la laine
reste pêche (la lumière de peintre garde la teinte du ciel — c'est la tête qui porte la lecture) ; à 120 m le « +90 » de la RAFALE peut
couvrir le mouton (popup au-dessus de la caisse, `couche-apres-m1-a120m.png`).

## 2. Les 5 correctifs d'accord non mesurés (5d7c92d → 4731939) — `shots/oeil/pose.log`, `shots/oeil/pose2.log`
| vérification | copie oeil | `?sens=0` (avant la passe) |
|---|---|---|
| pose lourde : vib au contact | `45` à 1548 / 1905 / 2031 / 2052 / 1605 ms, contact (caméra de Léo) à 1551 / 1908 / 2034 / 2055 / 1607 : **−3 ms** | `45` 200 à 400 ms AVANT le contact (1819 / 2219, 2681 / 2949, 3495 / 3697…) |
| saut nitro | **un seul** `[12,30,18]` | 3 vib à la même ms + `[10,24,10]` 30 ms après |
| décollage + dauphins | `[10,26,14]` seul (le banc de dauphins se tait) | — |
| tic de pièce vs pose | aucune pose tue (crabe : `9` au contact, rien avant) ; pose 45 et pièce 5 À LA MÊME MS : les deux partent | — |
| appui NITRO bref | `9` au lâcher (95 ms) | `9` |
| appui NITRO tenu | `[14,26,10]` seul (plus de tic d'appui) | `9` puis `[14,26,10]` 18 ms après |
Erreurs JS : aucune (les deux passages). Les 5 correctifs sont BONS.

**Trouvé en plus** (770fdbb) : hors app, `navigator.vibrate` REMPLACE la vibration en cours — la pièce `5` partie à la même ms que le POSÉ
LOURD `45` (ou qu'un motif `[18,50,30,60,40]`) ne laissait sentir que 5 ms sur Android. Un tic léger tombé pendant la 1re impulsion d'une
vibration plus forte se tait (`hap._d`). Dans l'app (Capacitor Haptics, chaque impulsion jouée à part) : rien ne change.

## Tâche ajoutée (Sacha : « oui ») — le PARFAIT au contact (f2921e3)
`tryLand` : sous `SENS && POSE_F`, `poseParfaiteFx` (flash + zoom + couronne) et le gel `hitT` attendent (`SCOUP.fp` / `SCOUP.fh`) ; joués
par `touche9` (si la pose a < 1,2 s, comme la vibration du verdict) ; remis à zéro dans `startFall`. Pose immédiate et `?sens=0` : inchangés.
Mesure (`pose2.log`, deux PARFAIT) : flash à 992 ms, contact à 993 / 992 ms → **−1 / 0 ms** (la vibration `15` à 990 / 989).
NB : `hitT` est vidé par la boucle à chaque image depuis le 26/09 (« le temps ne ralentit JAMAIS ») — le « gel d'image » n'a plus d'effet ;
il est déplacé quand même, pour le jour où il reviendrait.

## 3. Œil neuf — courses debout (`course-debout.log`, `course-jade.log`, captures `debout-*.png`, `debout-jade-*.png`)
Vu :
1. **Le PARFAIT au contact se cumule avec la caméra de Léo qui s'enfonce** : en portrait, coup de zoom −24° + plongée + caisse en crabe →
   la caisse sort par le bord droit (`debout-contact-3.png`, « POSE PARFAITE +70 »). Avant, le zoom partait 0,1-0,4 s plus tôt et était
   déjà à moitié retombé au contact. **À trancher par Sacha** : garder (c'est « sec à l'impact », demandé), ou doser le zoom en portrait.
2. Juste après une pose qui glisse, la caméra serre la caisse et la laisse en bas à gauche, à moitié hors cadre (`debout-t-4.png`) —
   caméra de Léo, pas touchée.
3. Textes qui se recouvrent (relevé DOM) : la carte MOTEUR (« NOUVEAU SOMMET · V6 / 5 CYLINDRES ») et le compteur DAUPHIN de vol
   (`#dolHud.vol.on`, que la règle html… `visibility:visible` garde visible sous `ebOn`) — 3-4 échantillons (≈ 1 s) par course ; les
   nombres qui volent (`#ajVols`) traversent la carte moteur, le verdict et le mot DAUPHIN (`debout-jade-t-2.png`, `debout-jade-contact-2.png`) ;
   le « +20 » (dessiné en 3D, hors DOM) se pose sur le coin de la carte moteur (`debout-decollage-1.png`, `debout-t-2.png`, `debout-t-3.png`).
   Interface (charte 6) : laissé à la session interface.
4. Hors app, une pièce coupe un POSÉ LOURD (voir § 2) → **corrigé** (770fdbb).
5. Eau → route : le robot n'est pas passé dans l'eau sur `?play=jade` (aucune entrée relevée) — pas vu.
Corrigés dans cette passe : 770fdbb (vibrations), 573823b (le BEEE), et la lecture des moutons (e30e187 / 5e278db). Les autres détails
nets relèvent de la caméra de Léo ou de l'interface : listés, pas touchés.

## 4. Fumées (copie servie, port 8871)
`fumee.cjs 8871 couche,debout` : FUMÉE OK, 0 erreur JS · `fumee.cjs 8871 couche '?play=jade'` : FUMÉE OK, 0 erreur JS.
`verifie.sh oeil` : VERIF OK après chaque commit ; `ombre.cjs` : seulement `var SENS` (global) et le `SENS` local du bloc tactile.

## Commits (`wt/oeil`, branche `travail`)
e30e187 moutons (laine + tête) · f2921e3 pose (PARFAIT au contact) · 5e278db moutons (tête sans éclairage) · 770fdbb vibrations (tic
vs coup, hors app) · 573823b moutons (le BEEE se voit). Noms globaux neufs : `MOUTON_MAT`, `MOUTON_TETE` (var), `moutonTete` ; champs
`SCOUP.fp/fh`, `hap._d`, `c.tete`, `mesh.userData.mm`.
