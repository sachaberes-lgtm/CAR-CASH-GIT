# Grotte : « un peu moins de tunnels » — diagnostic (2026-11-14)

Branche `pro/grotte-2026-11-14` (partie d'origin/main v1589). **Ce document est le diagnostic : aucun fichier du jeu n'a été modifié.** Seuls deux bancs et ce fichier ont été ajoutés.

⚠ À confirmer avant de publier : la demande relayée à cette session parlait de Jade (« variété de forme d'îlots ») ; la phrase « grotte doit avoir un peu moins de tunnels » vient de la consigne du script, pas d'un message de Sacha que j'ai vu.

## La demande
Sacha (via la consigne) : « grotte doit avoir un peu moins de tunnels ». Réduire modérément la part de passages fermés (un quart à un tiers de moins), garder la descente par étages et la variété.

## Ce qu'est un « tunnel » dans le code
Tout passe par `GROTTE.boyaux` (tableau `BOY`, rempli par `tube(…)` dans `grtTrace`, `code/maps/grottes-1.js`), lu par `grtEchantillons` (le creux se resserre : `R.RH`, `R.UP`, `R.TUF`). Quatre sources :
- **les passages exigus** du 13/11 (`GRT_LIB.exigu`, bloc « LES PASSAGES EXIGUS » à la fin de `grtTrace`) : `xTube`, `xBoyau`, `xFaille`, `xChas` ; `?sans=exigu` les retire ;
- les modules en tube : `gCouloir`, `gFaille`, `gGalerie`, `gGorge`, `gFente`, `gBoyau` (table `TUNNEL`) ;
- les descentes en tube : `pToboggan`, `pColimacon` (que l'exigu resserre : 66/58 m → 40/30 m) ;
- la mine étroite du début (≈ 1 % de la route : négligeable).

Les galeries sans issue (`grtGaleries`) ne sont pas sur la route : hors sujet.

## Mesures « avant » (déterministes, Node)
`node outils/banc-routes/grotte-tunnels.cjs <palier> 1-12 suite=1 [detail=1]` — le vrai `genGrotte` + `pisteTordPropre` + `grtEchantillons`.
- TUBE : part de la route où `R.TUF > 0,5` (dans un passage fermé déclaré, cônes d'entrée compris).
- SERRÉ : paroi à moins de 40 m du bord de la dalle ou voûte à moins de 60 m (ce que l'œil lit comme un tunnel).
- OUVERT : demi-largeur ≥ 150 m et voûte ≥ 120 m.

| graines 1-12 | palier 0 | palier 10 | palier 20 |
|---|---|---|---|
| TUBE | 24,0 % (16,6 s/grotte) | 23,9 % (12,1 s) | 29,0 % (11,5 s) |
| SERRÉ | 19,6 % (13,5 s) | 22,0 % (11,1 s) | 27,6 % (11,0 s) |
| OUVERT | 57,1 % | 57,2 % | 52,5 % |
| passages / grotte | 2,17 | 1,83 | 2,25 |
| plus long passage serré (moyenne / pire) | 8,0 s / 9,9 s | 7,1 / 9,5 s | 6,2 / 9,3 s |

Par source, palier 0 (s réelles par grotte) : exigu 6,7 s · descentes 3,1 s · modules 1,2 s.
Avec `SANS=exigu` (la grotte d'avant le 13/11) : TUBE 8,8 %, SERRÉ 6,4 %, OUVERT 65,8 %, 1,0 passage par grotte. **Les passages exigus ont presque triplé la part de tunnel.**

En jeu (Chrome headless, 12 graines, midi, palier 0, `grotte-tunnels-page.js`) : SERRÉ 21,1 %, OUVERT 57,4 % — cohérent avec Node. Passages serrés de 1 300 à 1 440 m d'un seul tenant (graines 1, 2, 3, 5, 6, 10).

## Constats
1. **(majeur, la plainte) Le `xTube` enferme un module de torsion ENTIER.** `C.push({a:m.a,b:m.b,k:'tube'})` : tout le module (jusqu'à 10 s), alors que boyau et faille sont bornés à 2,4-5 s. Résultat : 8 graines sur 12 ont un tube de 6,3 à 9,1 s. Photos : `grotte-diag/gen-matin/course-grotte-matin-g9-4-s2226.png` et `…g9-5-s2954.png` (700 m plus loin, toujours dans le tube), `gen-tel-matin/…g1-6-s2971.png`.
2. **(majeur, bug) La roche mord le bord de la dalle dans les retournements à assiette libre** (`gEnvers`, `pPlongeeEnvers`). `dbgGrotte('test')` : 6 graines sur 12 avec de la roche dans le couloir (2 à 44 points) ; `dbgGrotte('audit').roche` (au-dessus de la dalle, h 0,3 à 14 m) : graines 6 (5), 7 (17), 9 (13), 12 (42). Présent aussi avec `?sans=exigu` : ce n'est pas l'exigu. Photo : `grotte-diag/vues/v-midi-g12-env-3800.png` (le liseré du bord droit disparaît dans la paroi).
   Cause (calculée sur la sonde, graine 12, s 3 800) : dans `grtEchantillons`, bloc « L'ASSIETTE LIBRE », le décalage `dO = rad − g` ne regarde que le CENTRE de la dalle. Dalle couchée à 75-85° (`ny` 0,09-0,25), creux `rh` 173, fond `dn` 34 (la valeur `hug`) : le centre est ~19 m sous l'axe du creux, le bord bas 27 m plus bas encore, soit 46 m > 34 m de fond. Le bord est dans la roche.
3. **(mineur) Décor dans la mauvaise salle : revenu.** `dbgGrotte('decors').malPlaces` vaut 1 à 20 sur 7 graines sur 12 (baies dans la mine, les stalactites, le boyau, la lave ; 12 concrétions dans la luxuriante graine 10 ; capteurs dans le boyau). La note du 10/11 exigeait 0. Cause non cherchée.
4. **(mineur) Lumières dans la roche** : `audit.lumRoche` 2 à 12 par grotte (rayons 42, 72, 165). Cause non cherchée.
5. **(mineur, DA) Aplats orange saturés** sur la paroi collée à la dalle dans les tubes (`gen-matin/course-grotte-matin-g1-2-s1083.png`, à droite) et au pied du retournement (`vues/v-midi-g12-env-2850.png`). Hypothèse non vérifiée : une torche réglée pour une salle, à 9 m d'une paroi d'exigu.
6. **(mineur, juge)** `juge-node.cjs` (graines 1-8) : 27/30. R5 échoue aux paliers 0 et 20, R6 au palier 0 (aucun raccourci compté). La passation du 13/11 annonçait 27/27 : le juge a 3 points de plus. À ne pas dégrader.

Sans défaut : 0 erreur de page sur 12 graines (ordi) et 5 graines (`--tel=1`), 0 trou, 0 route noyée (`grotte-lacs.cjs`, 30 graines × 3 paliers), pilote auto vivant après 75 s (ordi) et 45 s (téléphone), travailleur égal au bit près (653 tronçons égaux, 0 différent).
Piège du banc : `--attente=10` avec un audit long laisse la caisse sans pilote, elle meurt vers 320 m (ordi comme téléphone). Ce n'est pas un bug du jeu.

## Plan de correction (ordonné)
1. **Borner le `xTube`** au cœur du module : `L8=min(m.b−m.a, sec(3,5))`, centré. Réglage dans `GRT_LIB.exigu` (`tube:3.5`).
2. **`n:[2,4]` → `n:[2,3]`** dans `GRT_LIB.exigu`.
   Simulé sans toucher au jeu (copies d'essai, `G1=…`) — variante F (1 + 2) :

   | | palier 0 | palier 10 | palier 20 |
   |---|---|---|---|
   | TUBE | 24,0 → 18,1 % (−25 %) | 23,9 → 16,5 % (−31 %) | 29,0 → 21,2 % (−27 %) |
   | SERRÉ | 19,6 → 14,2 % (−28 %) | 22,0 → 14,6 % (−34 %) | 27,6 → 20,0 % (−28 %) |
   | OUVERT | 57,1 → 60,5 % | 57,2 → 62,5 % | 52,5 → 59,0 % |
   | plus long serré (moyenne) | 8,0 → 5,7 s | 7,1 → 3,7 s | 6,2 → 4,0 s |

   La route est identique : `grotte-rythme.cjs 0 1-12 suite=1` sort le même texte à l'octet (l'exigu a son propre hasard). Plus fort si Sacha en veut encore moins — variante C (tube ≤ 4,5 s, `n:[1,3]`) : TUBE 15,9 / 16,5 / 19,7 % (−31 à −34 %), mais 1,67 passage par grotte au lieu de 2,0.
   Interrupteur : `?sans=moinstunnels` rend les valeurs d'aujourd'hui.
3. **Le bord de la dalle hors de la roche** (assiette libre) : avant de calculer `rad`, porter `H` (donc `R.DN` si `va<0`, `R.UP` sinon) à au moins `ROAD_HALF·√(1−ny²) + g + 12`, pondéré par `w`. Aucun tableau nouveau (DN et UP sont déjà dans `GRW_R`). Interrupteur `?sans=bordlibre`. Preuve attendue : `dbgGrotte('test').roche = 0` et `audit.roche = 0` sur les 12 graines, photo de g12 s 3 800.
4. Optionnel : le pire passage restant (7,9 s) est le colimaçon resserré par l'exigu ; lui rendre son tube d'origine (66/58) si besoin.
5. Les points 3 à 5 des constats (décor mal placé, lumières dans la roche, aplats) : à diagnostiquer séparément, non chiffrés ici.

Après chaque étape : `node code/assembler.cjs`, les bancs ci-dessous, `--tel=1`, `?grottecompare=1`, le juge (≥ 27/30), `non-declares.cjs`.

## Coût « avant » (graine 12, midi, vues figées, tirages et triangles de l'image entière)
| vue | ordi | `--tel=1` |
|---|---|---|
| colimaçon (tube) | 177 tirages, 471 752 triangles | 103, 270 144 |
| paroi | 124, 395 958 | 110, 278 428 |
| retournement, salle | 117, 392 838 | 75, 150 680 |
| bond | 63, 222 476 | 52, 105 468 |
| mur de la mort | 139, 462 048 | 116, 260 762 |
| toboggan | 76, 182 782 | 70, 111 500 |

Grotte bâtie, moyenne de 12 graines (ordi) : 279 564 triangles de roche, construction 1 279 ms dont creusement 908 ms (temps bruités, machine partagée). Tirage de la route en Node : 12 graines en 3,4 s. Image figée chronométrée : non mesurée.

## Commandes
```
node outils/banc-routes/grotte-tunnels.cjs 0 1-12 suite=1 detail=1      # part de tunnel (aussi 10 et 20) ; SANS=exigu ; G1=<copie d'essai>
node outils/banc-routes/grotte-rythme.cjs 0 1-12 suite=1                # doit rester identique à l'octet
node outils/banc-routes/grotte-lacs.cjs 0 1-30
node outils/banc-routes/juge-node.cjs . paliers=0,10,20 graines=1-8     # ~9 min
node outils/banc-maps/serveur.cjs 8330 <worktree>
node outils/banc-maps/banc.cjs gen --carte=grotte --meteo=midi --graines=1,…,12 --port=8330 --cdp=9530 --profil=pro-grotte --attente=8 --auditfile=outils/banc-routes/grotte-tunnels-page.js
node outils/banc-maps/banc.cjs gen --carte=grotte --meteo=matin [--tel=1] --graines=1,12 --roule=45 --photos=1 …      # sans --auditfile
node outils/banc-maps/banc.cjs grottevues --carte=grotte --meteo=midi --graines=12 --vuesfile=<vues.json> …           # dbgGrotte('module',{n,d,recul,haut})
node outils/banc-maps/banc.cjs jadevues --carte=nuages --prebati=1 --q=grottecompare=1 --graines=3 --vuesfile=<trav.json> …   # travailleur au bit près
```
Les fichiers de vues, les copies d'essai (`variantes.cjs`) et toutes les captures sont dans le scratchpad de la session, dossier `grotte-diag/`.
