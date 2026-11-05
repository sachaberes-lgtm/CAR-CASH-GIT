# LE DIRECTEUR DE RYTHME — la règle commune des routes (05/11/2026, game design)
Sacha : « retravaille toutes les générations de maps : fun à rider, spectaculaire, aventure, figures, kiff, vitesse — des fois trop de tout droit,
des fois trop de courbes, des fois des spirales trop serrées, des fois la route fait des trucs chelous ; pousse le délire, surtout dans la finition ».

## Ce qui a été mesuré AVANT (banc `outils/banc-routes/toutes.mjs`, 8 graines × paliers 0/10/20)
La même plainte, chiffrée : au palier 0 la plus longue « droite » (sans virage qui demande le volant) durait **17 s aux nuages, 23 s aux dunes, 24 s au
canyon, 20 s à la jade, 16 s en orbite** (cible : ≤ 5 s) ; **1 à 2,5 virages/km** ; la jade n'avait **aucun** virage sous 4 × le rayon tenable (ses rayons
étaient en mètres fixes, 260-560 m, quand le rayon tenable du palier 0 est 63 m) ; la forêt vaste passait à **0,3 virage/km au palier 20** (l'échelle G ×2,4
s'appliquait AUSSI aux rayons, déjà à l'échelle du palier) ; les villes avaient des spirales de 400-460° à 1,8 rP (le parking) ; les hauts paliers avaient
des mètres infranchissables (rayon < rayon tenable). Les coudes (cassures du dessin) : zéro — les « trucs chelous » ne viennent pas du dessin à plat.

## La règle (code/gameplay/route-rythme.js)
Tout se compte en **secondes de croisière du palier** (`vPalier`) et en **rayons tenables** (`rP = rayonPalier() = 40 + 0,3 × vPalier`) :
- **virage** = le cap tourne d'un même côté de ≥ 20° à un rayon < 4 rP (au-delà, ça passe au pouce : une droite qui penche) ; **serré** = rP à 1,5 rP ;
  **infranchissable** = < rP (interdit) ;
- **droite** = ce qu'il y a entre deux temps forts ; jamais plus de **5 s** ;
- **spirale** = un même côté sans contrer au-delà de 300° (330 aux nuages, 420 dans la pelote de la forêt) — sauf dans une **figure déclarée**
  (`MODMARK.fig` : looping, puits, parking, tremplin des dunes, raccourci du canyon, Porte et Pont de la jade) ;
- **coude** = deux segments de contrôle à plus de 14°, ou un segment minuscule entre deux longs (le spline y fait un coup de volant que personne n'a dessiné) ;
- **crête aveugle** = cassure de pente vers le bas sur le dessin.
`rythmeMesure(ctrl, {vP, rP, marks})` rend la fiche, `rythmeNote(fiche, rythmeCible(carte))` la note (0 = parfait), `RYTHME_CIBLES` les cibles par map.

## Le meilleur-de-N
Chaque générateur dessine N = 6 routes sur des flux dérivés d'UN seul tirage de la graine et garde la mieux notée (`rythmeMeilleur` pour genCtrl, genJade,
genBanq ; la note est intégrée dans les boucles d'essais existantes de genCanyon (écarts), genForet (croisements, ×0,4), genGrotte (conflits), et dnTrace
pour les dunes). `?rythme=0` = un seul essai. `dbgRythme()` = le dernier choix (la note de chaque essai, la fiche de la route gardée).

## Ce qui a changé dans chaque générateur
- **genCtrl (nuages, orbite, ville, crypto)** : tous les motifs de remplissage en rP (grand virage 1,8-3,1, balayage 2,2-3,4, esses 1,8-2,8, chicane 1,7-2,6,
  épingle 1,7-2,1, plongeon 1,9-3) ; la **respiration** entre deux motifs = 1,2-2,8 s à 8-20° ; le départ jusqu'au 1er module = des esses douces (20-32° à
  2,6-3,4 rP) au lieu d'une droite ; `rPlancher` 1,45-1,6 rP ; `rPlafond` 3,3 rP sur toute `courbe()` d'au moins 8° (à haut palier les mètres × LV
  grandissaient plus vite que rP) ; le **puits** 2,5 rP et UN tour (350-400°) au lieu de 1,25, il ne compte plus double ; le **parking** 2,4-2,8 rP × 330-390°
  (déclaré) ; la **fronde** 2,2-2,7 rP × 180-230° ; la rampe d'entrée de la ville tourne de 72-92° ; krach et escalier tournent (45-70°) ; l'épingle des nuages
  1,45-1,85 rP (une fois sur deux serrée).
- **genJade** : les humeurs en rP (`k` : vallée 2,4-3,8, serpent 1,9-2,7, courbes 2,8-4, dérive 2,6-3,8, balcon 2,6-3,8, chicanes 1,9-2,5), les six modules
  en rP (2-3,8), `jRm` = 1,8 rP ; la Porte 550 m de droite (740), le Pont 440 (550), la fin 3 s (260-420 m) ; la longueur visée tenue (FX9 2000, MD9 ≈ 9 rP).
- **genCanyon** : liaisons et recentrages en RMIN (gorge 2,1-3,3, serpent 1,25-1,6, dérive 2-3,4, méandres 1,5-3,6, étroits 1,6-2,2) ; l'essai gardé =
  écarts tenus ET meilleure note ; le raccourci déclaré.
- **genDunes** : `dnTrace` (un erg) + meilleur-de-N ; l'arc de montée 1,5-2,7 rP (plus ×kb : avec ARRAKIS il montait à 6,8 rP), le S de montée 1,6-2,4 rP,
  la descente carve (28-48° puis 22-38° à 1,9-2,8 rP), l'épaule droite sur 60 % puis ondule, les houles `ond` 22-36° à 2,6-3,7 rP ; crête + épaule
  déclarées `tremplin`, le lieu `rythme` déclaré.
- **genForet** : les rayons ne prennent que 30 % de l'échelle G (les longueurs la prennent entière) ; allée et toboggan ≤ 3,2 s ; la dérive de l'allée à 5 rM ;
  la note de rythme × 0,4 dans la note de la pelote.
- **genGrotte** : l'essai gardé = sans conflit ET le mieux noté. **genBanq** : meilleur-de-N (le glacier reste hors du JOUER).

## APRÈS (mêmes graines)
| map | palier 0 : virages/km · droite max (s) · note | palier 10 | palier 20 |
|---|---|---|---|
| nuages | 2,7 · 5,2 · 4,9 (était 1,6 · 17 · 30) | 1,7 · 4,4 · 4,1 | 0,9 · 3,7 · 4,9 |
| orbite | 2,7 · 5,2 · 3,1 (était 2,4 · 13 · 15) | 1,8 · 4,6 · 1,8 | 1,1 · 4,2 · 2,7 |
| ville | 3,5 · 4,1 · 1,0 (était 3,7 · 9,8 · 11) | 2,5 · 3,7 · 1,8 | 1,4 · 3,3 · 4,2 |
| crypto | 4,0 · 4,2 · 0,9 (était 3,9 · 12 · 15) | 3,0 · 3,8 · 1,2 | 1,6 · 3,3 · 3,6 |
| jade | 3,1 · 5,4 · 2,2 (était 1,6 · 20 · 28) | 2,7 · 3,8 · 0,6 | 2,2 · 1,8 · 1,0 |
| forêt | 2,5 · 6,1 · 2,4 (était 2,2 · 7,5 · 5) | 1,6 · 4,0 · 1,7 | 0,9 · 3,4 · 4,4 (était 0,3 · 15 · 21) |
| canyon | 3,0 · 6,0 · 2,9 (était 1,5 · 24 · 35) | 2,2 · 3,9 · 0,8 | 1,3 · 3,5 · 4,6 |
| dunes | 3,1 · 4,5 · 0,3 (était 1,5 · 23 · 34) | 2,2 · 3,4 · 0,3 | 1,6 · 2,2 · 1,0 |
| grotte | 4,0 · 6,0 · 2,4 (était 3,8 · 7,2 · 4,6) | 2,9 · 4,1 · 0,0 | 1,8 · 3,0 · 1,4 |
Zéro coude, zéro mètre infranchissable (sauf 3-6 m au canyon palier 20), spirales subies sous 320° partout.

## Mesurer
- `verrou-banc.sh prendre x ; OUT=dossier node outils/banc-routes/toutes.mjs [cartes=…] [paliers=0,10,20] [graines=1-8] ; verrou-banc.sh rendre`
  (le VRAI jeu en Chrome sans fenêtre, `dbgGenRoute(carte, graine, palier)` : la génération seule) puis `node outils/banc-routes/fiche.cjs dossier --png`
  (le tableau par map × palier, un plan PNG par route : vert = virage, orange = serré, rouge = infranchissable, bleu = droite > 5 s, violet = figure, croix = coude).
- Dans le jeu : `dbgGenRoute('dunes', 3, 10).fiche`, `dbgRythme()`, `dbgGenBilan(n, graine, carte)` (l'ancien bilan en plan).
- Les sorties du 05/11 : `outils/banc-routes/sorties/avant/` et `sorties/apres/` (FICHE.txt + PNG).

## Ce qui reste à l'œil (pas mesuré)
Le roulis de pisteTord (nuages, orbite, grotte), les murs du canyon, les collines des dunes autour des arcs de montée plus serrés, et le rendu des
monuments de la jade sur leurs droites raccourcies : à vérifier en course.
