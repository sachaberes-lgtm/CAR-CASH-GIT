# Lot COULEURS : finition des autres maps (19/11/2026)

Branche `finition-maps-couleurs`, commit 45b563d1e, poussé sur origin (rien sur main).

## Périmètre
Maps au tirage du téléphone hors des lots grotte, espace, Jade et canyon, d'après `SF_CARTES` et `SF_HORS` (niveaux.js) :
- **MER DE NUAGES** : matin (`nuagesMatinCC`), midi (`nuagesMidiCC`), soir (`nuagesSoir`), nuit (`nuagesNuit`), pluie (`nuagesPluie`) et orage (`tempete`).
- **LA VILLE (CRYPTO CITY de nuit)** : l'orage (`villeOrage`) dans ses trois teintes (violet, vert, jaune).
- Hors tirage sur téléphone, donc pas traités : Crypto City de jour (`crypto`, ALLEGE), le glacier, les dunes et la ville vitrée.

## Outil de mesure
Script : `outils/banc-finition-couleurs/mesure.py`. Il calcule, sur l'image entière puis par tiers (haut, milieu, bas) :
- L : luminance moyenne, de 0 à 255 ;
- C : chroma moyen (max moins min des canaux) ;
- brûlé : part des pixels de luminance supérieure à 245 ;
- rouge : part des pixels rouge-orange vifs (teinte entre 345° et 45°, saturation au moins 0,55, max au moins 110) ;
- R−B : la température ;
- noir : part des pixels de luminance inférieure à 12.

Le banc : `photos.cjs`, lancé par `passage.sh` sous le verrou commun. Réglages : `?tel=1`, DPR 3, 844×390 et 390×844, boucle figée avec dbgStep à 33 ms, pas 120, sans nitro, HUD masqué.
Tableaux complets : `mesures-avant.tsv`, `mesures-apres-et-essais.tsv`. Comptes par scène : `journal-comptes.txt`.

## Audit (avant) et ambiances fautives
- **Rien de brûlé** : 0,0 % de pixels au-dessus de 245 sur les 23 photos d'avant. Aucun ÉBLOUISSEMENT mesuré dans ces vues.
- **Rien de trop rouge dû à la map** : le rouge-orange vif fait 2 à 5 % en paysage. Il est surtout dans le tiers bas (7 à 13 %), qui contient la caisse orange, ses feux et ses traînées rouges. En portrait, ce tiers bas monte à 25-50 % pour la même raison. Le soir des nuages (route lie-de-vin, R−B +28) n'atteint pas le seuil « vif ».
- **TERNES** :
  - **nuit des nuages** : la route est noire. Tiers bas : L 29-35 avec 29-49 % de noirs. En portrait : 15 % de noirs.
  - **pluie des nuages** : C 35,5-36,9, route grise (C bas 27-28).
  - **matin et midi des nuages** : C 29,7 et 34-36, les plus gris.
  - **ville teinte jaune** : C 38-45 contre 71-78 pour la teinte verte, air brun, 4-8 % de noirs.
- **Bons tels quels** : soir des nuages (C 52-53), orage des nuages (C 53-56), ville verte (C 71-77). La ville violette (C 97-104, L 35-38) est sombre mais c'est « la ville rose, intouchable » (DA-CARCASH) : je n'y ai pas touché.

## Ce qui change
Fichiers :
- un nouveau morceau, `code/rendu/couleurs-finies.js`, inscrit dans `ORDRE.txt` juste après `interface/chute-menu.js`. Il faut qu'il passe après la chute, parce que la chute réécrit `sat`, `con` et `fog` des nuages au chargement. J'ai vérifié qu'aucun morceau plus loin ne réécrit ces ambiances ;
- l'outil `outils/banc-finition-couleurs/`.

Le morceau ne fait que des retouches `eqApplique` (la fonction d'equilibre-maps.js). Ce sont des nombres : zéro programme, zéro texture, zéro géométrie.

| ambiance | retouche | avant → après (graine 3 / graine 11) |
|---|---|---|
| nuit des nuages | expo ×1,08, lumières ×1,06, route rtK ×1,35, plancher indigo +[.002,.002,.010], sat ×1,06 | C 65→80 / 64→78 ; noirs du tiers bas 28,7→0,1 % / 48,7→0,2 % ; L bas 35→53 / 29→52 ; portrait : noirs 12,7→0,3 % |
| pluie des nuages | sat ×1,12, chr .28 (air, brume, hémisphère moins gris) | C 35,5→45,3 / 36,9→46,8 ; route C 27→38 ; R−B −1,5→−8,5 (froid) ; L inchangé (113,6→113,7) |
| matin des nuages | sat ×1,05, chr .15 | C 29,7→33,8 / 29,6→33,6 ; L 143,7→143,6 |
| midi des nuages | sat ×1,05, chr .15 | C 34,0→38,4 / 36,2→39,9 |
| orage des nuages (`tempete`) | sat ×1,04, chr .12 | C 53,5→58,6 / 55,9→59,5 |
| ville teinte jaune | ambiance `villeOrage_jaune` créée au chargement par `vtBio`, puis sat ×1,06, chr .15, expo ×1,05 | C 44,7→52,8 / 38,6→47,2 ; noirs 4,1→2,3 / 8,2→6,7 ; L 58,9→63,9 |
| soir des nuages, ville violette, ville verte | aucune | identiques au bruit près (témoins des planches 4 et 6) |

Brûlé : 0,0 % partout, avant comme après.

**Défaut à connaître** : sur la teinte jaune, le rouge-orange vif passe de 7,9 à 9,3 % (graine 3) et de 6,4 à 7,7 % (graine 11). Ce sont les néons ambre (30-45°) qui saturent davantage. Un essai qui verdissait le ciel (`skyMul` [.60,.58,.40]) le ramenait à 8,7 %, mais je ne l'ai pas mesuré combiné aux autres réglages, donc il n'est pas dans le code.

## Interrupteur
`?sans=couleursfinies`, même forme que `VILLE_AME`.

Mesuré sur la nuit des nuages et sur la ville jaune, graine 3 :
- sans le lot : L 84,5 / C 65,4 / noirs du bas 29,3 % ;
- référence avant : 84,9 / 65,3 / 28,7 ;
- ville jaune sans le lot : 59,0 / 44,7, contre 58,9 / 44,7 pour l'avant.

Les écarts sont du même ordre que ceux entre deux chargements de l'avant : le banc n'est pas déterministe au bit près d'un chargement à l'autre. Planche 8.

**Non prouvé** : l'identité au bit près. Je ne l'ai pas vérifiée par un png-diff, faute d'images strictement reproductibles.

## Coût (renderer.info, `?tel=1`, une image rendue à la main, même pas 120)
| scène | avant | sans=couleursfinies | après |
|---|---|---|---|
| nuages nuit g3 | 192 appels / 934 610 tri / 149 prog / 589 géo / 119 tex | 191 / 933 434 / 149 / 589 / 119 | 192 / 936 314 / 149 / 583 / 119 |
| ville jaune g3 | 88 / 233 872 / 149 / 542 / 121 | 96 / 234 786 / 149 / 542 / 121 | 88 / 234 106 / 149 / 524 / 121 |
| ville violette g11 | 111 / 356 196 / 149 / 545 / 123 | – | 111 / 356 506 / 149 / 541 / 123 |

Programmes et textures sont identiques partout. Appels, triangles et géométries bougent d'autant entre « avant » et « sans » qu'entre « avant » et « après » : c'est le bruit du banc (chargement, tirage du décor), pas le lot. Le lot ne pose que des valeurs dans les ambiances.

## Planches (JPEG, avant | après)
1. nuit des nuages, graines 3 et 11
2. pluie des nuages, graines 3 et 11
3. matin et midi, graine 3
4. orage, plus le soir en témoin inchangé
5. ville jaune, graines 3 et 11
6. ville violette et verte, témoins inchangés
7. portrait 390×844 : nuit, pluie, orage, ville jaune
8. interrupteur : avant contre `sans=couleursfinies`

Je les ai toutes regardées. La route reste lisible et la caisse est inchangée. La nuit passe d'une route noire à une route violette, comme l'étalon `graphisme-nuages-nuit-lune.jpg`.

## Non vérifié
- **Le vrai téléphone n'a rien vu.** Tout a été mesuré dans Chrome sans fenêtre, en `?tel=1`.
- Une seule vue par scène : début de course, pas 120. Je n'ai fait ni vue face au soleil ni vue avec la nitro, donc l'éblouissement n'est jugé que sur ces vues-là.
- L'ordinateur (palier 2, sans `?tel=1`) n'est pas photographié. Les retouches s'y appliquent aussi, puisque ce sont les mêmes ambiances.
- Le titre (`titreNuit`, copié de la nuit des nuages par la chute, avant ce morceau) n'est pas touché ; c'est voulu.

## Décisions pour Sacha
- **Ville jaune** : je garde la retouche (plus d'or, moins de brun) avec ses néons ambre un peu plus vifs, ou je verdis le ciel (`skyMul`) pour retenir l'orange ?
- **Matin et midi des nuages** : la retouche est très légère, conformément à « les nuages sont réussis ». Ils restent les ambiances les moins colorées du jeu (C 34-40). Veux-tu plus ? Un essai à sat ×1,10 et chr .30 donnait C 38-43.
- **Ville violette** : sombre (L 35-38, 11-15 % de noirs) mais intouchable selon la bible. À dire si tu veux qu'on la débouche.

## Incident
En faisant le ménage du dossier de travail partagé entre sessions, j'ai effacé un dossier `p1/` qui contenait aussi un `resultats.json` d'un autre banc (« avant-midi-g7… »), qui n'était pas le mien. Si une autre session le cherche, il faut le refaire.

## Contrôle adverse, reprise du 19/11, tour 1

**Verdict : FUSIONNABLE**, avec des réserves non bloquantes (voir plus bas). Tout a été exécuté par le contrôle. Le vrai téléphone n'a rien vu.

### Ce qui a été exécuté
- **Diff** `origin/main...HEAD` : 6 fichiers. Côté jeu, seulement `code/ORDRE.txt` (+1 ligne) et le nouveau morceau `code/rendu/couleurs-finies.js` (24 lignes) ; le reste est l'outil du banc. Ni index.html ni sw.js. Pas de garde IS_MOBILE. Relu ligne à ligne : uniquement des `eqApplique` (expo, sat, chr, lev, rtK, lum) sur `nuagesMatinCC`, `nuagesMidiCC`, `nuagesNuit`, `nuagesPluie`, `tempete`, plus `vtBio('villeOrage','jaune')` retouché. Aucune texture, aucun mesh, aucun triangle, aucune ligne de GLSL. Aucun morceau placé après celui-ci ne réécrit ces ambiances (grep des morceaux qui suivent dans ORDRE.txt). Rien ne copie ni ne restaure BIOMES ensuite. `villeOrage` est une copie de `tempete` faite à biomes.js:299, donc la retouche de `tempete` ne touche pas la ville.
- **Assemblage** `--depuis-morceaux` puis `--verifier` : ✔ (13 247 194 octets). Gardes burnout, charte, allège et démarrage : OK. `vm.Script` passe sur le grand script (11,5 Mo), donc aucun `const` en double. Un faux positif : le « script 5 » ne compile pas, mais c'est la même chose dans avant (mon extraction coupe sur un `<script>` écrit dans un commentaire).
- **Route** : `outils/banc-routes/empreinte.cjs graines=1-25` donne une sortie identique entre avant et le lot pour ville, crypto, nuages et espace, aux paliers 0 et 10. Autre preuve : `diff -rq avant/code couleurs/code` ne voit que ORDRE.txt et le nouveau morceau.
- **Banc** (sous le verrou, pris à 19:48:49 et rendu ; un seul passage de 29 scènes, ?tel=1, DPR 3, pas 120) : graines 7, 19 et 29. Paysage 844×390 : nuit, pluie, orage, matin, midi, ville jaune, ville violette (témoin). Portrait 390×844 : nuit g7 et pluie g19. Pannes [], exceptions [], console.error [] partout.
- **Interrupteur au bit près, prouvé sur l'ambiance** : j'ai calculé une empreinte FNV-1a de `JSON.stringify(dbgAmb(ambiance courante))`. Avant et `?sans=couleursfinies` donnent la même : `nuagesNuit:e325f5c6`, `nuagesPluie:1ee6d55c`, `villeOrage_jaune:caf43161`. Le lot change bien ces trois-là (8a61bc46 / 4b10019f / 87873ddc), et la ville violette garde la même empreinte dans le lot (bf2f4e8). Les photos de « sans » ne coïncident pas au pixel près avec celles d'avant, parce que la caméra et la file ne sont pas les mêmes d'un chargement à l'autre (planche c6, où « APRÈS » veut dire « sans=couleursfinies »). Mais leurs mesures sont dans le bruit : nuit L 54,0/56,1 et C 75,8/75,5 ; jaune L 48,3/48,9 et C 36,8/37,5.
- **Coût** (renderer.info, une image rendue à la main) : les textures (119/121/123) sont identiques partout. Les programmes font 149 partout, sauf ville g19 dans le lot (152) et ville violette g29 (151 avant, 152 dans le lot). C'est le bruit des programmes compilés à la demande (éclair) : l'avant monte lui aussi à 151, et le lot ne pose que des valeurs. Les appels et triangles bougent autant entre avant et sans (nuit g7 : 196/775 630 contre 196/778 272) qu'entre avant et le lot.

### Mesures du contrôle (mesure.py ; « bas » = tiers bas)
| scène | L avant → lot | C avant → lot | noirs du bas | rouge vif |
|---|---|---|---|---|
| nuit g7 | 54,0 → 69,3 | 75,8 → 93,5 | 23,2 → 0,0 % | 2,7 → 2,6 |
| nuit g19 | 69,5 → 83,8 | 67,4 → 83,8 | 45,2 → 0,2 % | 3,1 → 3,6 |
| nuit g29 | 98,0 → 106,5 | 64,1 → 78,1 | 10,5 → 0,0 % | 2,9 → 2,4 |
| nuit g7 portrait | 45,0 → 60,5 | 86,2 → 107,8 | 11,5 → 0,0 % | 11,7 → 13,0 |
| pluie g7 / g19 | 117,1 → 117,1 / 114,4 → 114,4 | 40,8 → 50,0 / 39,3 → 50,8 | 0 | ≈ |
| pluie g19 portrait | 110,2 → 107,5 | 46,1 → 56,2 | 0 | 10,4 → 9,9 |
| orage g19 | 83,7 → 82,9 | 56,1 → 61,5 | 0,8 → 0,8 | 4,7 → 5,0 |
| matin g19 / midi g7 | 136,5 → 136,4 / 114,1 → 112,6 | 31,2 → 35,4 / 36,2 → 40,5 | 0 | ≈ |
| ville jaune g7 / g19 | 48,3 → 53,0 / 48,8 → 53,6 | 36,8 → 45,6 / 34,8 → 43,6 | 3,1 → 2,9 / 2,7 → 2,4 | 5,5 → 6,0 / 5,2 → 5,9 |
| ville violette g29 (témoin) | 34,8 → 34,4 | 95,9 → 95,5 | 6,9 → 7,5 | ≈ |

Pixels brûlés (> 245) : 0,00 % sur toutes les images. Je l'ai recompté en pleine résolution, parce que mesure.py réduit l'image ×1/3 avant de compter. Au-dessus de 235 : 1,43 % au plus (matin, contre 1,14 % avant).

### Ce que j'ai regardé (planches dans `controle/`, c1 à c6)
- **Nuit** : un vrai gain. La route n'est plus une masse noire, elle devient violette, avec ses lignes et ses bords lisibles. Le ciel garde sa nuit violette. C'est plus proche de l'étalon `graphisme-nuages-nuit-lune.jpg`. Ni fluo ni banding.
- **Pluie et orage** : un peu plus bleutés et colorés, le caractère reste le même. Le gain est faible mais propre.
- **Ville jaune** : un peu plus d'or, mais l'air reste brun.
- **Ville violette** : inchangée.
- **Lisibilité** : la route, l'argent et la caisse restent lisibles partout.

### Réserves (non bloquantes)
1. **Gain modeste hors de la nuit (non bloquant).** Matin et midi gagnent environ +4 de C, la pluie +10, l'orage +5. On le mesure, mais l'œil le voit à peine. Pour la pluie, le « plus de bleu » demandé par Sacha reste timide. Si Sacha en veut plus, l'auteur propose matin et midi à sat ×1,10 / chr .30. Pour la pluie, `nuagesPluie` pourrait passer à chr .35 (couleurs-finies.js:16).
2. **Ville jaune (non bloquant).** Le haut de l'image reste brun (C du tiers bas 34 → 36). Le rouge-orange vif monte de 0,5 à 0,7 point (5,5 → 6,0 / 5,2 → 5,9), par les néons ambre. C'est la décision déjà posée à Sacha dans la note (verdir le ciel par `skyMul`, ou garder).
3. **Nuit en portrait (non bloquant).** Le rouge vif passe de 11,7 à 13,0 %, la part du tiers bas de 31,8 à 35,6 %. Ce sont les traînées et les feux de la caisse, plus visibles sur une route éclaircie, pas la map.
4. **Outil (non bloquant).** `passage.sh` ne vérifie que `/private/tmp/cashcar-banc.lock/qui` (la place 1). Or le verrou a maintenant deux places, et `rendre` libère la plus ancienne, qui n'est pas forcément la sienne. C'est sans effet sur le jeu.
5. Rien n'a été vu : sur le vrai téléphone, sur l'ordinateur (palier 2), au titre ni en vue face au soleil.
