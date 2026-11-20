# JADE : couleurs, ambiances, nuit, astre « Japon » (lot de finition, nuit du 18/11/2026)

> **Tour 2 (reprise après le contrôle adverse) : les valeurs FINALES sont celles du tableau ci-dessous, et la section « Tour 2 » en fin de note dit ce qui a changé et pourquoi.** Les planches de ce dossier sont celles du tour 2 (valeurs finales, sans nitro, couché ET debout).

Branche `finition-maps-jade` (dossier `/Users/sachaberes/cash-car/finition-lots/jade`), trois commits du tour 1 et un du tour 2 (`a2ec1b025`) :
- `20dbcb468` : les couleurs des six temps et l'astre (repris du premier auteur, coupé par la panne de réseau) ;
- `2ca5e417b` : le soir moins fluo, la nuit indigo (ATTENTION : le contrôle du 19/11 l'a mesurée plus SOMBRE qu'avant, luminance −8 à −11, et non « un cran plus claire » ; corrigé à la reprise du 19/11, voir la dernière section), le banc corrigé ;
- `89b978df2` : le banc seul (Chrome fermé même tué, mode « debout » pas encore essayé). Le premier commit porte la ligne « Co-Authored-By: Claude Fable 5.2 » du script (il était déjà poussé, il n'a pas été réécrit).
Seuls `code/` et `outils/` sont commités. `index.html` et `sw.js` ne sont pas commités : ils se régénèrent avec `node code/assembler.cjs --depuis-morceaux`.

**Le vrai téléphone n'a rien vu.** Tout a été jugé dans Chrome sans fenêtre, au format iPhone, en `?tel=1`.

## Ce qui change : que des nombres
Il n'y a ni géométrie, ni texture, ni passe, ni instruction GLSL en plus.

### `code/rendu/lumiere-design.js`
Une section `LA FINITION DE JADE`, posée en DERNIER (après l'étalonnage, l'équilibre des maps, le plan de feu et la nuit de Jade du 13/11), sur les six temps de Jade (`niveaux.js` : matin = `jadeMatin`, midi = `jadeMidi`, soir = `jade`, nuit = `jadeNuit`, pluie = `jadePluie`, orage = `jadeOrage`).
Les valeurs d'AVANT sont celles de la couche précédente (`etalonnage-da.js` lignes 61 et 69-77, `biomes.js:196`, `lumiere-design.js` pour la nuit du 13/11).

| temps | champ | avant | après |
|---|---|---|---|
| soir | jdZ / jdL / jdM | .50,.56,.66 / .74,.72,.74 (gris) / 1,.66,.42 | .36,.38,.64 / .90,.62,.70 (rose) / 1,.70,.48 (pêche dorée) |
| soir | jdH, jdB, jdR, jdS | 1,.78,.54 · .90,.82,.76 · .40,.38,.46 · 1,.72,.44 | 1,.76,.46 · .94,.70,.64 · .42,.30,.46 · 1,.70,.40 |
| soir | fog / fogIn / fogCj | hérités, × fogL .93 | .86,.66,.58 / .92,.74,.66 / 1,.70,.50 |
| matin | sat, jdZ / jdL / jdH | (étalonnage × équilibre) ; .22,.44,.74 / .46,.64,.80 / 1,.82,.60 | × 1,08 ; .16,.44,.90 / .40,.70,.90 / 1,.70,.60 (pêche-rose) ; + jdM .56,.90,.76 (jade-menthe), jdB .82,.90,.84 |
| matin | fog / fogIn | .80,.82,.74 / .86,.88,.82 | .90,.80,.70 / .94,.86,.76 (pêche) |
| midi | sat, jdZ / jdL / jdH | (équilibre × 0,93) ; .16,.42,.80 / .40,.64,.86 / .96,.88,.72 | × 1,07 ; .08,.38,.90 / .32,.70,.92 / 1,.84,.60 ; + jdM .48,.88,.78 |
| midi | fog / fogIn | .66,.80,.80 / .80,.90,.90 | .62,.80,.86 / .78,.90,.92 |
| nuit | jdZ / jdL / jdM | .018,.052,.098 / .030,.086,.130 / .045,.135,.150 (bleu-vert) | .062,.034,.098 / .072,.050,.150 / .060,.112,.200 (indigo-violet) |
| nuit | jdH / jdB / jdR / jdS | .065,.19,.18 / .07,.19,.195 / .03,.09,.09 / 1,.90,.68 | .060,.180,.180 (la lueur jade au ras de l'horizon, gardée) / .065,.120,.190 / .04,.06,.12 / 1,.88,.62 |
| nuit | fog / fogCj / fogIn / volSky | .047,.142,.148 / .08,.22,.21 / .06,.17,.17 / .06,.17,.18 | .050,.100,.170 / .10,.16,.26 / .07,.12,.20 / .06,.10,.20 |
| nuit | hemiS / fillC / env | .14,.36,.40 / .16,.50,.44 / dégradé bleu-vert | .16,.26,.46 / .22,.36,.60 / dégradé indigo (`#06061c`→`#243e6a`, le point jade `#3a8f80` gardé) |
| pluie | sat, jdZ / jdM / jdH | 1,06 ; .20,.30,.31 / .40,.52,.49 / .54,.64,.59 (gris-vert) | 1,16 ; .17,.28,.48 (ardoise bleue) / .32,.58,.56 / .54,.68,.62 (jade mouillé) ; jdL .26,.46,.54, jdB, jdR, fog, fogCj, fogIn et volSky suivent |
| orage | jdZ / jdL / jdM / jdH | .125,.14,.141 / .145,.165,.170 / .173,.200,.207 / .23,.27,.28 (ardoise verdie) | .10,.09,.14 (ardoise violette) / .13,.14,.19 / .16,.21,.24 / .22,.32,.34 (horizon bleu-vert) |
| orage | fog / fogCj / fogIn / hemiS / jdB | .23,.265,.275 / .26,.30,.31 / .28,.32,.33 / .36,.42,.46 / .25,.29,.30 | .17,.20,.25 / .22,.24,.30 / .21,.24,.29 / .30,.33,.42 / .22,.28,.32 |

### `code/rendu/scene-ciel.js` : l'astre « Japon »
C'est une ligne du ciel de Jade : mêmes opérations, autres nombres.
- Le disque passe d'un rayon de ~4,4° à ~4,9°. Son bord est plus net : la bande d'adoucissement passe de 0,35° à 0,16°, dans `smoothstep(.99627,.99652)` (avant `.99680,.99725`).
- Le vermillon du bord est plus profond (.90,.26,.15 → .82,.13,.10) et le cœur plus orangé (.97,.42,.22 → .98,.36,.16).
- Le halo du jour est plus sobre et doré (.50,.16,.08 × .22 → .52,.24,.06 × .13).
- La lune prend un ivoire plus franc (55 % de blanc, contre 40 %) et un halo plus serré (.26/.07 → .18/.05).

## L'interrupteur
`?sans=jadefini` rend les valeurs d'avant et l'astre d'avant (`JADE_FINI` dans `lumiere-design.js`, même forme que `VILLE_AME`). Dans `scene-ciel.js`, ce sont les lignes d'avant, au caractère près.
Preuve à l'image, graine 3, même pas de boucle : l'écart moyen par pixel entre `?sans=jadefini` et le jeu d'avant (`finition-lots/avant`) va de 0,6 à 1,2 sur 255. C'est le bruit des particules et des traînées d'une prise à l'autre. Entre « après » et le jeu d'avant, l'écart va de 11 à 26.

| prise (graine 3) | sans vs avant | après vs avant |
|---|---|---|
| nuit, en course | 0,90 | 12,62 |
| nuit, vers la lune | 0,57 | 11,43 |
| soir, en course | 1,24 | 17,85 (version intermédiaire du soir) |
| soir, vers le soleil | 0,60 | 26,40 (version intermédiaire du soir) |

## Le coût : `renderer.info` en `?tel=1`
Les comptes viennent d'une image rendue à la main, juste après 120 pas de 33 ms (`dbgStep`, rAF neutralisé), sur la même piste. Ce sont des COMPTES, pas des millisecondes.

| scénario | appels avant / après / sans | triangles avant / après / sans | programmes | géométries | textures |
|---|---|---|---|---|---|
| soir g3 (version intermédiaire du soir) | 101 / 101 / 101 | 195 221 / 196 515 / 196 503 | 154 partout | 594 / 592 / 598 | 119 partout |
| nuit g3 | 102 / 102 / 102 | 195 063 / 194 975 / 194 931 | 154 | 600 / 594 / 596 | 119 |
| matin g3 | 101 / 101 | 196 229 / 195 779 | 154 | 594 / 592 | 119 |
| midi g3 | 101 / 101 | 196 059 / 195 901 | 154 | 592 / 592 | 119 |
| pluie g3 | 99 / 99 | 189 163 / 187 427 | 154 | 596 / 592 | 119 |
| orage g3 | 94 / 94 | 183 505 / 182 065 | 154 | 592 / 596 | 119 |
| soir g11 | 155 / 155 | 446 155 / 449 831 | 154 | 610 / 612 | 121 |
| nuit g11 | 156 / 164 | 438 333 / 437 991 | 154 | 614 / 616 | 121 |
| matin g11 | 164 / 156 | 453 275 / 450 849 | 154 | 612 / 612 | 121 |
| midi g11 | 166 / 158 | 467 251 / 465 845 | 154 | 614 / 614 | 121 |
| pluie g11 | 151 / 159 | 408 269 / 406 509 | 154 | 612 / 612 | 121 |
| orage g11 | 148 / 156 | 391 497 / 392 981 | 154 | 606 / 614 | 121 |

Les programmes et les textures sont identiques partout. Les triangles et les géométries bougent de ±1 % dans les DEUX sens, et autant entre « sans » et « avant », qui ont le même code : c'est le décor qui se construit pendant le chargement (`prebati=0`), pas le lot.
À la graine 11, les appels de dessin bougent de ±8 dans les deux sens (avant 164 → après 156 au matin, avant 156 → après 164 la nuit). C'est le même bruit de chargement. Pour un compte au bit près, il faudrait un banc à scène bâtie et figée identique : **non fait**.
Il n'y a eu aucune exception ni panne (`dbgErreurs`) sur les 26 parties du banc final (14 à la graine 3, 12 à la graine 11).

## Les planches (ce dossier, tour 2, valeurs finales)
Toutes viennent du vrai jeu, en `?tel=1`, DPR 3, SANS nitro (pas de flou radial), après 120 pas de 33 ms. L'image est celle du composer (ACES, bloom), avec à gauche AVANT (`finition-lots/avant`, prises du contrôle, mêmes réglages) et à droite APRÈS.
- `jade-g3-couche-avant-apres.jpg`, `jade-g17-couche-avant-apres.jpg` : les six temps, paysage 844×390.
- `jade-g11-couche-avant-apres.jpg` : soir, nuit et matin, paysage, graine 11.
- `jade-g3-debout-avant-apres.jpg`, `jade-g11-debout-avant-apres.jpg` : les six temps, PORTRAIT 390×844 (partie lancée debout).
- `jade-g11-astre-avant-apres.jpg` : la caméra tournée vers le soleil ou la lune (soir, nuit, matin), graine 11.
- `controle/` : les planches du contrôle adverse (tour 1, valeurs d'alors), gardées pour la comparaison. Les prises brutes du tour 2 sont dans `tour2/prises/` (les « avant » sont dans `controle/prises/`).

## Ce que j'ai vu (diagnostic)
- **Soir** : le milieu du ciel était gris-beige ; il devient bleu-violet au zénith, une bande rose, puis le corail et l'or à l'horizon. Le premier jet (mauve .80,.52,.74) faisait un aplat lilas sur tout le ciel ; le second (rose .94,.58,.64) virait au fluo sous la saturation du soir (1,2). La valeur finale est un rose-corail un cran plus doux.
- **Nuit** : elle était bleu-vert assez sombre ; elle devient un bleu nuit / indigo profond (pas de gris, pas de noir bouché à l'image). La lune ivoire a son halo, la lueur jade reste au ras de l'horizon, et les rails verts et les phares ressortent.
- **Matin / midi** : un azur plus franc et un horizon pêche. Le changement reste modéré : ces deux temps étaient déjà proches de la marque.
- **Pluie** : du gris-vert on passe à l'ardoise bleue et au jade mouillé. **Orage** : de l'ardoise verdie on passe à l'ardoise violette. La route reste lisible : les bords verts et la caisse passent devant.

## Ce qui n'a PAS été vérifié
- Le **vrai iPhone**, et l'ordinateur au palier max (sans `?tel=1`).
- Les **lanternes** et accents chauds de la nuit : je n'ai touché ni leurs couleurs ni leurs fichiers (`jade-*.js`). Ce lot ne touche que le ciel, la brume, les lumières et l'astre.
- **Le format PORTRAIT** : rien n'a été vérifié debout (ni la route, ni le ciel, ni l'astre).
- **Le soir final à la graine 3** : il n'a été vu qu'à la graine 11.
- Les transitions du fondu d'une météo à l'autre (`continuite.js`), et le vol, la descente et les portails.
- Un compte d'appels au bit près (voir plus haut : bruit de chargement de ±8 appels dans les deux sens).

## Décisions pour Sacha
1. **Le soleil du soir** : un disque vermillon sur un ciel rose-corail se détache MOINS que sur l'ancien ciel pêche-gris. On peut le garder (l'estampe ton sur ton) ou rendre au milieu du ciel un ton plus pâle autour du disque.
2. **La nuit** : est-elle assez violette ? Elle est plutôt bleu nuit / indigo. Si tu la veux plus violette, il suffit de monter le rouge de jdZ et jdL (un nombre chacun).
3. **Le matin et le midi** : la passe est volontairement légère. Faut-il pousser plus fort ?

## Contrôle adverse, tour 1

Verdict : **A_CORRIGER**. Le code est propre et neutre en coût, la route ne bouge pas, l'interrupteur marche. Mais l'ORAGE est devenu presque le même ciel que la NUIT, le matin, le midi et la pluie bougent à peine, et la planche portrait manque. Tout se corrige en une passe.

### Ce que j'ai exécuté
- **Diff depuis la base `a0d9f3094`** : 5 fichiers seulement (`code/rendu/lumiere-design.js` +28, `code/rendu/scene-ciel.js` +11 −2, `outils/banc-finition-jade/*`). Ni index.html ni sw.js. Rien dans les routes, le gameplay, les nuages ou la ville. Aucune garde sur `IS_MOBILE`. J'ai relu le diff ligne à ligne : aucune texture, aucun mesh, aucune géométrie, aucun uniforme ni aucune instruction GLSL en plus. La ligne de l'astre fait les mêmes opérations avec d'autres nombres (halo : 2 `pow`, 1 `mix`, comme avant). `bioMet` fait une copie profonde (`JSON.parse(JSON.stringify)`) : les retouches du soir (`BIOMES.jade`) ne fuient pas vers les autres temps.
- **Assemblage et gardes** : `--depuis-morceaux` OK (346 morceaux). Garde du démarrage, garde de l'allègement et garde de la charte : OK. `vm.Script` sur chaque `<script>` : la seule « erreur » vient du script 5, à l'identique dans `finition-lots/avant`. C'est mon extracteur qui coupe sur un commentaire qui contient « <script ». `const JADE_FINI` n'est déclaré qu'une fois.
- **Route** (`outils/banc-jade/empreinte-route.cjs`) : graines 1-24 × paliers 0, 10 et 20, sur l'avant, sur le lot et sur le lot avec `?sans=jadefini`. Les sommes sont identiques au caractère près : p0 `5ea45726ba355c54`, p10 `97d452aaf65b4169`, p20 `5d935a522d108c36`.
- **Banc du vrai jeu** (sous le verrou, 2 passages, `?tel=1`, DPR 3, sans nitro pour voir le décor) : `outils/controle-jade/photos.cjs`, une copie du banc de l'auteur avec `--nit`, non commitée. J'ai fait le paysage 844×390 aux graines 3 et 17 et le portrait 390×844 aux graines 3 et 11, chaque fois sur les six temps, avant et après, plus `?sans=jadefini` à la graine 17 (paysage, 6 temps) et à la graine 11 (portrait, nuit et soir). Le mode « debout » `avP/apP` de l'auteur MARCHE : 26 prises, sans moitié noire. Le 3e passage (l'astre, graine 11) n'a jamais eu le verrou (file de plus de 10 sessions) : pour l'astre, je n'ai que la planche de l'auteur.
- **Interrupteur** : écart moyen par pixel `sans` / avant de 0,73 à 1,47 sur 255 (le bruit des particules), contre 6,6 à 17,9 entre après et avant. L'image d'avant est rendue.
- **Comptes** (`renderer.info`, une image rendue à la main après 120 pas) : programmes 154 et textures 119/121 partout. Géométries égales à ±2. Appels égaux avant et après sur les 24 prises couchées (graines 3 et 17) et sur 10 des 12 prises debout. À la graine 11, matin et midi debout ont 8 appels de moins APRÈS, et `sans` au soir a aussi 8 de moins que l'avant (155 contre 163, même code) : c'est le bruit du chargement, pas une hausse. Triangles à ±0,7 %. Aucune exception et aucune panne (`dbgErreurs`) sur les 56 parties.
- **Mesure du ciel** (HSV, bande 8 à 30 % de la hauteur, paysage) :

| temps | saturation du ciel avant → après | luminosité avant → après |
|---|---|---|
| soir | 65-79 → 143-148 | 207-213 → 236-246 |
| nuit | 246-254 → 239-254 | 59-69 → 91-104 |
| matin | 144-153 → 170-183 | ≈ |
| midi | 164-181 → 195-213 | ≈ |
| pluie | 135 → 162-168 | 150-155 → 175-186 |
| orage | 106-111 → **184** | 60-63 → **111-120** |

### Défauts (reproductibles)
1. **L'ORAGE se confond avec la NUIT.** C'est flagrant sur `controle/jade-g3-couche-avant-apres.jpg`, `jade-g17-couche-…` et `jade-g11-debout-…` (`?carte=jade&meteo=orage&pistegraine=3|17|11&tel=1`, dans les deux formats). Le ciel d'orage devient un indigo saturé, deux fois plus clair qu'avant, presque le même que celui de la nuit après. On ne lit plus une tempête mais une deuxième nuit : les ambiances deviennent incohérentes. Fichier `code/rendu/lumiere-design.js`, objet `BIOMES.jadeOrage` de la section LA FINITION DE JADE. Conseil : un violet-ardoise plus SOMBRE et moins saturé que la nuit, avec un horizon qui garde le bleu-vert. Par exemple jdZ `.12,.10,.20` → `.10,.09,.14`, jdL `.14,.15,.24` → `.13,.14,.19`, fog `.20,.24,.32` → `.17,.20,.25`, hemiS `.34,.38,.54` → `.30,.33,.42`. À valider au banc : la saturation du ciel doit tomber vers 120-140 et ne pas dépasser une luminosité de 80.
2. **Matin, midi et pluie : la passe ne se voit presque pas.** L'écart moyen est de 6,6 à 10 sur 255, et à l'œil seul un peu plus de saturation du ciel ressort. Ce n'est pas une régression, mais la demande « des couleurs plus fun, plus typées par ambiance » n'est tenue que pour le soir et la nuit. Soit la note le dit franchement comme un choix (elle le dit à moitié, dans la « décision 3 »), soit il faut pousser l'horizon pêche du matin et le jade mouillé de la pluie.
3. **NUIT** : c'est mieux qu'avant (le bleu-vert boueux devient un bleu nuit franc, la route et les rails verts restent lisibles), mais le haut du ciel est un bleu roi pur, à 254 de saturation, qui tire vers l'électrique en paysage (graine 17). Conseil : jdZ `.040,.030,.110` → `.050,.036,.105` (un poil de violet, un poil moins pur), ce qui répond aussi à la « décision 2 ».
4. **Le SOIR** est le vrai gain : un dégradé violet → rose → or qui remplace le gris-lilas. Le rose est fort mais pas fluo dans mes prises. Le disque vermillon sur le rose se détache moins (déjà signalé par l'auteur, je ne l'ai pas revu au banc).
5. **`?jadenuit=0` est mort quand le lot est actif.** Dans `code/rendu/scene-ciel.js`, ligne de l'astre du lot : sans `?sans=jadefini`, la branche `jadenuit=0` donne `''`. L'interrupteur de la nuit du 13/11 ne marche plus qu'avec `?sans=jadefini,…`. La note ne le dit pas. Il faut soit garder la branche, soit l'écrire dans la note.
6. **Planches de l'auteur** : il n'y en a aucune en portrait (390×844), alors que la mission l'exige, et le soir final de la graine 3 manque. La note le reconnaît honnêtement, mais ce n'est pas livré. Les miennes le complètent : `controle/jade-g3-debout-avant-apres.jpg`, `controle/jade-g11-debout-avant-apres.jpg`, `controle/jade-g3-couche-…` et `controle/jade-g17-couche-…`. Ses planches roulent en NITRO (flou radial), et on n'y juge pas le décor.
7. Le 1er commit porte « Co-Authored-By: Claude Fable 5.2 » et les deux suivants « Claude Opus 5.5 ». Il y a 3 commits au lieu d'UN commit propre, et `89b978df2` n'est pas poussé. À régulariser à la reprise, sans réécrire ce qui est déjà poussé.

### Non vérifié par moi
L'astre au banc : la planche de l'auteur montre un disque à peine plus grand, un bord net et une lune ivoire, avec un vermillon peu lisible sur le rose. Ni le vrai iPhone ni le PC au palier max n'ont été vus. Les fondus entre météos, le vol et les portails non plus.

## Tour 2 : la reprise après le contrôle (2026-11-18, matin)

Tout se fait encore avec des NOMBRES, dans les deux mêmes fichiers. Rien de neuf côté coût : ni programme, ni texture, ni appel de dessin, ni triangle, ni instruction GLSL.

| défaut du contrôle | ce que j'ai fait | mesuré au banc (ciel HSV, bande 8-30 %, avant → tour 1 → tour 2) |
|---|---|---|
| 1. L'ORAGE devenait une seconde nuit | J'ai pris les valeurs du contrôleur (jdZ .10,.09,.14, jdL .13,.14,.19, fog .17,.20,.25, hemiS .30,.33,.42), avec en plus jdM .16,.21,.24, fogCj, fogIn et jdB rabattus. L'horizon bleu-vert est gardé. | S 106-111 → 184 → **167-170** ; V 55-63 → 111-120 → **73-83**. À l'œil, c'est une ardoise bleu-violet sombre, à horizon sarcelle, qui se distingue nettement de la nuit indigo (nuit S 239-255). La saturation reste au-dessus de la cible 120-140 du contrôleur : je ne l'ai pas rabattue davantage, pour ne pas revenir au gris (règle 9). **Décision pour Sacha.** |
| 2. Matin, midi et pluie bougeaient à peine | Poussés. Matin : saturation × 1,08, zénith .16,.44,.90, horizon pêche-rose 1,.70,.60, menthe .56,.90,.76. Midi : saturation × 1,07 (ce qui défait presque tout le × 0,93 de l'équilibre), cobalt .08,.38,.90, jade .48,.88,.78, horizon or-pêche 1,.84,.60. Pluie : saturation 1,16, zénith ardoise bleue .17,.28,.48, jade mouillé .32,.58,.56. **Au premier réglage** (menthe .48,.92,.74, jade .40,.90,.76, pluie à 1,20) la bande menthe virait à l'acide et la pluie à un beau temps turquoise : j'ai redescendu ces valeurs d'un cran. | Écart moyen à l'avant : matin 12-15/255 (il était de 8-9), midi 8-11 (5-7), pluie 13-15 (9-14). Saturation du ciel : matin 144-199 → 191-244, midi 164-223 → 214-251, pluie 135-148 → 186-206. |
| 3. Le zénith de la nuit en bleu roi électrique | J'ai mis un cran de plus que le conseil : jdZ .040,.030,.110 → .062,.034,.098 et jdL .062,.056,.175 → .072,.050,.150. Le conseil (.050,.036,.105), essayé au premier réglage, ne se voyait pas. | Le haut du ciel passe à l'indigo-violet (planches g3 et g17 couchées et astre) et n'est plus du bleu roi. V 59-69 → 85-98 → **60-93**. Ce n'est pas du noir bouché : la route, les rails verts et la lune ressortent. |
| 4. `?jadenuit=0` mort avec le lot | Rebranché : avec le lot actif, `?jadenuit=0` reprend la ligne de lune d'avant le 13/11 (`scene-ciel.js`). `?sans=jadefini` rend toujours l'astre d'avant au caractère près. | Vérifié par lecture du shader assemblé. **Pas photographié.** |
| 5. Planches : pas de portrait, nitro, soir g3 absent | J'ai refait toutes les planches sans nitro, en paysage (g3, g17, g11) ET en portrait (g3, g11), le soir g3 compris. Le banc `photos.cjs` prend `--nit 0` par défaut. | 6 planches de 129 à 267 Ko. |
| 6. Le soleil du soir se perdait sur le rose | La bande du milieu passe du corail à la pêche dorée (jdM 1,.62,.50 → 1,.70,.48), et la bande rose tire vers le rose de la marque (jdL .92,.64,.64 → .90,.62,.70). | Planche astre : le disque vermillon net se lit, mais il reste dans la bande rose-corail (il est posé à ~15° au-dessus des monts, au-dessus de la pêche). Il se détache **un peu mieux**, sans plus. **Décision pour Sacha** (voir plus bas). |
| 7. Trois commits, co-auteurs mélangés | Les trois commits du tour 1 sont déjà poussés par le crochet : les réécrire demanderait un `push --force`, ce qui est interdit. J'ajoute donc **UN** commit propre du tour 2 (code/ et outils/), avec la ligne « Co-Authored-By: Claude Fable 5.2 ». À l'intégration, Sacha peut fusionner la branche en un seul commit (squash) s'il le veut. | — |

### Le coût au tour 2 (`renderer.info`, `?tel=1`, une image rendue à la main après 120 pas)
| scénario | appels avant / après | programmes | textures | géométries avant / après |
|---|---|---|---|---|
| 6 temps × g3 couché | 91,92,91,91,89,84 / identiques | 154 / 154 | 119 / 119 | 610 / 610 |
| 6 temps × g17 couché | 81,82,81,81,82,78 / identiques | 154 / 154 | 119 / 119 | 649 / 649 |
| 6 temps × g3 debout | 89,90,89,89,87,82 / identiques | 154 / 154 | 119 / 119 | 608-610 / 608-610 |
| 6 temps × g11 debout | 163,155,164,165,148,144 / 155,155,156,157,156,144 | 154 / 154 | 121 / 121 | 620-622 / 622 |
| soir, nuit, matin × g11 couché | 141,141,149 / 141,141,141 | 154 / 154 | 121 / 121 | 622 / 622 |
| sans=jadefini, orage et nuit g17 | 78, 82 (= avant) | 154 | 119 | 649 |

Les programmes, les textures et les géométries sont identiques. Les appels sont égaux sur toutes les prises de g3 et g17. À la graine 11, ils bougent de ±8 dans les DEUX sens (pluie debout +8, soir, matin et midi −8). C'est le bruit de chargement déjà vu au tour 1 et par le contrôleur : le même code « sans » donne aussi 155 contre 163. Les triangles bougent de ±0,8 %, dans les deux sens. Aucune exception ni panne (`dbgErreurs`) sur les 48 parties du tour 2.
Interrupteur : l'écart `sans=jadefini` / avant vaut 0,68 à la nuit g17 et 1,38 à l'orage g17 (sur 255), le bruit des particules et de la pluie.
Route : `outils/banc-jade/empreinte-route.cjs`, lot = avant au caractère près (p0 `66a138ad988e519e`, p10 `dd8d6772b9331a3a`, p20 `5480b388feac08d1`). Le lot ne touche aucun générateur.
Gardes : assemblage `--depuis-morceaux` et `--verifier` OK, garde de l'allègement, garde de la charte et garde du démarrage (21 scripts compilés) OK. `JADE_FINI` n'est déclaré qu'une fois.

### Toujours PAS vérifié
- **Le vrai iPhone n'a rien vu.** Le PC au palier max (sans `?tel=1`) non plus.
- Les fondus d'une météo à l'autre (`continuite.js`), le vol, la descente et les portails.
- `?jadenuit=0` avec le lot : il a seulement été relu, pas photographié.
- Le midi : l'astre y reste à peine visible (déjà le cas avant, je n'y ai pas touché).
- Les lanternes et accents chauds de la nuit (`jade-*.js`) : je n'y ai pas touché.

### Décisions pour Sacha (tour 2)
1. **L'orage** : une ardoise bleu-violet sombre à horizon sarcelle (S ≈ 168). Le contrôleur visait S 120-140. Pour plus de gris d'orage, il faut baisser jdZ/jdL d'un cran de bleu, mais ça retourne au gris.
2. **Le soleil du soir** : on le garde (tampon vermillon sur rose), ou on veut un halo pêche autour ? Ça demande soit de baisser le disque dans la bande pêche (une constante `.259` de `scene-ciel.js`, qui change aussi la place de la lune), soit de rendre la bande rose plus pâle.
3. **Le midi** : la bande menthe à l'horizon est franche. Si elle te paraît trop vive, il suffit de rabattre jdM à .52,.88,.80.

## Contrôle adverse, reprise du 19/11, tour 1

Verdict : **A_CORRIGER**. Le code est propre : la route n'a pas bougé et les gardes sont vertes. Mais contre la demande de Sacha du 19/11 (« plus de bleu, PLUS DE VERT », « des fois c'est trop rouge »), le lot fait l'inverse sur deux ambiances : la NUIT perd ses verts jade et s'assombrit, et le SOIR gagne du rouge. **Mon banc du vrai jeu n'a pas tourné** (voir plus bas) : les mesures d'image ci-dessous viennent des planches de l'auteur (JPEG, tour 2), découpées case par case.

### Ce que j'ai exécuté
- **Diff** `origin/main...HEAD` (base `dbc5f1d54`) : 6 fichiers. `code/rendu/lumiere-design.js` +34, `code/rendu/scene-ciel.js` +12 −2, et 4 fichiers dans `outils/banc-finition-jade/`. Ni index.html ni sw.js. Aucun `IS_MOBILE`. J'ai relu le diff ligne à ligne : aucune texture, aucun mesh, aucun uniforme, aucune instruction GLSL en plus. La ligne de l'astre fait les mêmes opérations (2 `pow`, des `mix`), et `?sans=jadefini` rend les deux lignes d'avant au caractère près. Les biomes dérivés (`biomes.js:301-312`) sont copiés avant la section : le soir (`BIOMES.jade`) ne fuit pas.
- **Assemblage** `--depuis-morceaux` et `--verifier` : OK (349 morceaux). `garde-allege.sh` = 0, `garde-charte.sh` = 0, `garde-demarrage.cjs` : OK (21 scripts). `vm.Script` sur les `<script>` en ligne : la seule erreur est le script 5, identique dans `finition-lots/avant` (c'est l'extracteur). `const JADE_FINI` n'est déclaré qu'une fois.
- **Route au bit près** (Float64 bruts des points de contrôle, `charge.cjs`, graines 1-24 × paliers 0, 10 et 20) : avant, lot et lot `?sans=jadefini` sont identiques. p0 `f78b4551…` (8 448 points), p10 `ac77de09…` (10 970), p20 `654e8c28…` (13 166).
- **Outil de mesure** : `outils/controle-jade/mesure.py` (non commité). Par tiers d'image (haut | milieu | bas), il donne L (luminance), C (chroma), B (% brûlé > 245), R (% rouge-orange vif) et V (% vert-jade). Sur l'étalon (nuages et ville) : B ≈ 0 partout, R du haut 0 à 2 %.

### Mesures (planches de l'auteur `jade-g3-couche`, `jade-g17-couche`, `jade-g11-astre`, avant → après)
| temps | haut : L / C / R / V | milieu : L / V | lecture |
|---|---|---|---|
| nuit g3 | 43,5→32,4 / 67→82 / 0 / **16,2→0,3** | 50,0→41,6 / **29,9→6,3** | plus sombre, plus de vert |
| nuit g17 | 36,0→25,7 / 63→82 / 0 / **14,8→2,2** | 54,2→46,3 / **29,9→12,4** | idem |
| nuit astre g11 | 21→11 / — / — / — | 53→45 / **34→7,5** (bas : **41→4,8**) | la mer jade devient indigo |
| soir g3 / g17 | 178→158 / 100→143 / **37,0→41,6 · 41,8→46,5** | R 16,8→18,1 · 8,8→11,2 | plus rouge, chroma +32 à +43 |
| soir astre g11 | C 39→117 | R **46,3→53,6** | le ciel rose-magenta, le disque se perd |
| matin g3 / g17 | C +45 à +48, V +27 | R 8,6→10,3 (astre 12,5→15,4) | l'horizon tire au saumon |
| midi | C +52, V +27 à +31 | ≈ | gain net, pas de rouge |
| pluie | L +5,6, C +43 à +53, V 75→38 (plus bleu) | V +5 à +12 | gain net, moins gris |
| orage | C +30, L ≈ | ≈ | distinct de la nuit (haut L 58-61 contre 26-32) |
Le brûlé (> 245) vaut 0 % partout, avant comme après : aucun éblouissement mesuré, mais seulement sur ces JPEG réduits.

### Défauts
1. **NUIT : les verts jade meurent, et l'image s'assombrit** (`lumiere-design.js:84-88`, `BIOMES.jadeNuit`). La part de vert-jade passe de 30 à 6-12 % au milieu de l'image, et de 41 à 5 % au bas de la prise vers la lune. La luminance baisse de 8 à 11 partout, alors que la note annonce « un cran plus claire ». C'est l'inverse de la demande du 19/11 (« plus de vert »), et la cible du lot dit « des VERTS jade qui vivent ». Conseil : garder le zénith indigo-violet (jdZ et jdL), mais rendre le vert au bas : jdM `.060,.112,.200` → `.050,.135,.180` ; fog `.050,.100,.170` → `.045,.130,.160` ; fogIn `.07,.12,.20` → `.06,.15,.18` ; volSky `.06,.10,.20` → `.06,.14,.18` ; hemiS `.16,.26,.46` → `.14,.32,.44` ; env `.48:'#243e6a'` → `'#1e5262'`. Cibles mesurées : V du milieu ≥ 20 %, L du milieu ≥ celle d'avant (50-54).
2. **SOIR : plus rouge et presque fluo en haut** (`lumiere-design.js:73`, `BIOMES.jade`). R du haut monte de 4,6 points (g3 et g17), et le milieu de la prise vers l'astre passe de 46 à 54 %. Le chroma du haut passe de 100-115 à 143-147, avec un rose-magenta franc sur les planches. Conseil : jdL `.90,.62,.70` → `.84,.64,.76`, jdZ `.36,.38,.64` → `.34,.40,.68` (un violet plus bleu en haut), jdH `1,.76,.46` → `1,.80,.52`. Cible : R du haut ≤ celui d'avant (37-42 %), chroma du haut ≤ 125.
3. **MATIN : l'horizon tire au saumon** (`lumiere-design.js:77-78`, jdH `1,.70,.60`). R du milieu monte de 1,7 point (g3) et de 2,9 points vers l'astre. Conseil : jdH → `1,.76,.62`. Ce défaut est mineur.
4. **non bloquant** : la note (tour 2, défaut 3) dit « V 60-93, pas de noir bouché ». Les planches le confirment pour le noir bouché, mais la nuit est plus SOMBRE qu'avant, pas plus claire. Il faut corriger la phrase du haut de la note.

### Ce qui n'a PAS été vérifié par moi
- **Le banc du vrai jeu n'a pas tourné.** Mon passage groupé (31 scénarios : g5 couché 6 temps, g29 nuit/pluie/orage, g23 debout et astre, `?sans=jadefini`) a attendu le verrou près d'une heure derrière 7 sessions. Puis le disque est tombé à **1,2-1,3 Go libres**, sous le seuil de 1,5 Go : j'ai arrêté le banc, comme la règle le demande, et effacé mes prises. Je n'ai donc pas mesuré moi-même `renderer.info` avec et sans le lot, l'interrupteur à l'image, la console, ni le portrait au tour 2. Pour ces points, il n'y a que les chiffres de l'auteur et du contrôle du tour 1.
- Mes mesures viennent de JPEG réduits (environ 520 px de large), étiquettes coupées : elles ne valent que comme tendances. Le pourcentage brûlé en particulier n'y est pas fiable.
- Le vrai iPhone, le PC au palier max, les fondus de météo et `?jadenuit=0` à l'image : non vus.

## Reprise du 19/11, correction 1 (les défauts du contrôle adverse)

Que des nombres, dans `code/rendu/lumiere-design.js`, à l'intérieur du bloc `JADE_FINI` (donc `?sans=jadefini` rend toujours l'image d'avant, au caractère près). Ni route, ni gameplay, ni scene-ciel.js (l'astre « Japon » n'a pas bougé).

| temps | champ | tour 2 | correction 1 |
|---|---|---|---|
| nuit | jdM (milieu du ciel) | .060,.112,.200 | .050,.135,.180 |
| nuit | jdB (abîme) | .065,.120,.190 | .060,.160,.185 |
| nuit | fog / fogIn / volSky | .050,.100,.170 / .07,.12,.20 / .06,.10,.20 | .045,.130,.160 / .06,.15,.18 / .06,.14,.18 |
| nuit | hemiS / fillC | .16,.26,.46 / .22,.36,.60 | .14,.32,.44 / .20,.40,.56 |
| nuit | env, arrêt .48 | '#243e6a' | '#1e5262' |
| soir | jdZ / jdL / jdH | .36,.38,.64 / .90,.62,.70 / 1,.76,.46 | .34,.40,.68 / .84,.64,.76 / 1,.80,.52 |
| matin | jdH | 1,.70,.60 | 1,.76,.62 |

Intention : la nuit garde son zénith indigo-violet (jdZ, jdL inchangés) mais le bas du ciel, la brume et l'éclairage d'ambiance redeviennent bleu-JADE (visé : un peu plus clairs que la nuit d'avant ; MESURÉ au contrôle tour 2 : en fait −3 à −9 de luminance, plus sombre qu'avant, voir la correction 2) (jdM .045,.135,.150 avant → .050,.135,.180) ; le soir perd le rose-magenta du haut ; le matin perd le saumon. Ce sont les valeurs conseillées par le contrôleur, plus jdB et fillC poussés dans le même sens.

Coût : aucune texture, aucun programme, aucun appel de dessin, aucun triangle de plus (des nombres dans des tables existantes) ; pas de nouvelle mesure renderer.info faite à ce tour, le code exécuté est le même que celui que le contrôleur a relu.

Gardes : assemblage `--depuis-morceaux` et `--verifier` OK (349 morceaux), garde-allege.sh = 0, garde-charte.sh = 0, garde-demarrage.cjs OK (21 scripts), aucun IS_MOBILE.

**NON VÉRIFIÉ À CE TOUR : AUCUNE PHOTO.** Le disque du Mac n'avait plus que 1,2 Go libres (`df -h /`), sous le seuil de 1,5 Go : la consigne est d'arrêter les bancs. Les planches de ce dossier sont donc encore celles du TOUR 2 (avant cette correction) ; les cibles du contrôle (vert du milieu ≥ 20 % la nuit, luminance du milieu ≥ 50-54, rouge du haut du soir ≤ avant, chroma du haut ≤ 125) ne sont PAS mesurées. Le contrôle suivant doit refaire les planches (g3, g17 couché, g3/g11 debout, astre g11 ; nuit, soir, matin) avec `outils/controle-jade/mesure.py`. Le vrai téléphone n'a rien vu.

## Contrôle adverse, reprise du 19/11, tour 2

Verdict : **A_CORRIGER**. La correction 1 (43763c0af) ne tient pas ses cibles la NUIT : le vert jade est toujours éteint et l'image toujours plus sombre qu'avant. Le reste est propre : code, route, comptes, interrupteur, console.

### Ce que j'ai exécuté
- **Diff** `origin/main...HEAD` : 6 fichiers (`code/rendu/lumiere-design.js` +38, `code/rendu/scene-ciel.js` +12 −2, 4 dans `outils/banc-finition-jade/`). Ni index.html ni sw.js, aucun `IS_MOBILE`. Relu ligne à ligne : seulement des nombres dans `BIOMES.*`, plus la ligne de l'astre, qui garde les mêmes opérations GLSL.
- **Assemblage** `--depuis-morceaux` et `--verifier` : OK (349 morceaux). `garde-allege.sh`, `garde-charte.sh` et `garde-burnout.sh` rendent 0. `garde-demarrage.cjs` : OK (21 scripts). `vm.Script` : la seule erreur est le script 5, que l'extracteur coupe dans un commentaire ; elle est identique dans `avant`. `const JADE_FINI` n'est déclaré qu'une fois.
- **Route** (`outils/banc-jade/empreinte-route.cjs`, graines 1-24 × paliers 0, 10 et 20) : avant, lot et lot `?sans=jadefini` donnent les mêmes sommes. p0 `5ea45726ba355c54`, p10 `97d452aaf65b4169`, p20 `5d935a522d108c36`.
- **Banc du vrai jeu**, en UN passage sous le verrou (19:22-19:29). Format `?tel=1`, DPR 3, boucle figée, 120 pas. 25 scénarios, aucun échec :
  - g3 couché, les 6 temps, avant et après, avec la prise vers l'astre ;
  - g3 nuit et soir avec `?sans=jadefini` ;
  - g11 debout (390×844), nuit, soir et matin, avant et après, plus la nuit avec `sans` ;
  - g17 couché, nuit et soir.
  
  Pannes : aucune. Exceptions et erreurs console : aucune.
- **Comptes** (`renderer.info`, une image rendue à la main) : programmes 149 = 149, textures 119/121 = 119/121, géométries 604/616/643 identiques, appels identiques sur toutes les paires couchées. Les triangles varient de ±0,4 % dans les deux sens, et l'écart est le même entre avant et `sans` (179451 contre 179395) : c'est le bruit de la scène animée. En debout, les appels sautent entre 155, 163 et 164 dans les deux sens, et `sans` est lui aussi à 155 : même bruit. **Le lot ne coûte rien.**
- **Interrupteur** (`sans` comparé à avant, au pixel) : prises vers l'astre, écart moyen 0,31-0,33/255 et 0,01 % de pixels au-delà de 8. Images couchées et debout : écart moyen 1,1-1,3, 1,3-2,1 % de pixels au-delà de 8. Ce sont les flammes et les particules (vu sur la planche). Le rendu est celui d'avant.
- **Mesures** (`outils/controle-jade/mesure.py`, sur les PNG d'origine) et planches regardées : `controle/ctl3-*.jpg` (4 planches).

### Mesures avant → après (haut | milieu ; L luminance, C chroma, R % rouge-orange vif, V % vert-jade, B % brûlé)
| temps | haut | milieu | lecture |
|---|---|---|---|
| nuit g3 couché | L 28,0→18,6 | L 53,1→49,1, **V 33,9→9,6** | toujours plus sombre, vert éteint |
| nuit g17 couché | L 21,3→13,0 | L 54,4→51,4, **V 34,2→14,5** | idem |
| nuit g11 debout | L 17,4→10,2 | L 58,6→55,5, **V 37,8→6,5** | idem |
| nuit astre g3/g17 | L 10→5 | L 45→39, V 14-18→6-7 ; bas V 8-10→1-2 | la mer jade passe au marine |
| soir g3/g17/g11 | R 13,8→13,1 · 18,1→18,0 · 13,0→12,3 ; **C 57-66→114-121** | R +1,6 à +2,0 | moins rouge en haut, mais rose-magenta vif |
| soir astre g3/g17 | L 171→135, C 52-57→130-132 | R ≈ (27,5→28,7 · 35,7→35,4) | le disque vermillon se lit |
| matin g3/g11 | C +50 | R +2,0 / +2,5, V +13 | azur plus franc, l'horizon un rien plus rouge |
| midi g3 | C +44 | V +16, R +4,5 | gain net |
| pluie g3 | L +5, C +78 (gris → cyan-bleu) | V +14 | **gain net**, plus du tout gris |
| orage g3 | C 25→53 | ≈ | plus du tout gris, mais bleu marine (voir défaut 3) |
Le brûlé (> 245) vaut **0 %** sur toutes les images, avant comme après : aucun éblouissement.

### Défauts
1. **NUIT, bloquant** (`lumiere-design.js:84-90`, `BIOMES.jadeNuit`). Les cibles de la correction 1 ne sont pas atteintes. Vert du milieu : 6,5-14,5 %, pour une cible ≥ 20 % (avant : 34-38 %). Luminance du milieu : 49-55, contre 53-59 avant. Sur les planches, la route et le sol perdent leur lueur turquoise et deviennent bleu marine : c'est l'inverse de « plus de bleu, PLUS DE VERT ». Corriger jdM, la brume et hemiS ne suffit pas. Le vert du sol vient de l'éclairage d'appoint et de l'env, que le lot a passés au bleu. Conseil : garder le lot pour le CIEL du haut (jdZ `.062,.034,.098`, jdL `.072,.050,.150`, jdS) et rendre la valeur de la nuit d'avant (`JADE_NUIT2`, l. 59-62) à tout ce qui éclaire le sol et l'horizon :
   - fillC `.20,.40,.56` → `.16,.50,.44` ;
   - fogCj `.10,.16,.26` → `.08,.22,.21` ;
   - fog → `.047,.142,.148` ;
   - hemiS → `.14,.36,.40` ;
   - jdB → `.07,.19,.195` ;
   - env aux arrêts .3, .48 et .66 → `'#0a2630'`, `'#1c5a58'`, `'#0e2a2c'`.
   
   Cible : V du milieu ≥ 25 % et L du milieu ≥ celle d'avant − 1, sur g3 et g17 couché et sur g11 debout.
2. **SOIR, à corriger avec le défaut 1** (`lumiere-design.js:74`). Le rouge du haut ne monte plus (cible tenue) et le chroma du haut, 114-121, reste sous 125. Mais sur toutes les planches, le haut est un dégradé violet → rose vif → orange de style « synthwave ». Il saute aux yeux à côté du ciel pâle d'avant, et l'astre vu de face perd 36 de luminance. C'est à la limite du fluo que Sacha refuse. Conseil : jdL `.84,.64,.76` → `.86,.70,.76`, jdZ `.34,.40,.68` → `.40,.46,.70`, pour viser un chroma du haut ≤ 100.
3. **non bloquant, à faire juger par Sacha** : l'ORAGE (g3) n'est plus gris (C 25 → 53), mais il est devenu bleu marine-indigo, proche de la nouvelle nuit sur les planches. Luminance du haut : orage 42, nuit 19. On les distingue par la clarté et la pluie, pas par la teinte. Si la nuit reprend son vert (défaut 1), l'écart grandit de lui-même.
4. **non bloquant** : au MATIN, le rouge du milieu monte de 2,0 à 2,5 points (horizon orange). Ce n'est pas criard sur les planches.
5. **NOTE** : la section « correction 1 » annonce une nuit « un peu plus claire que la nuit d'avant ». La mesure dit le contraire : −3 à −9 de luminance partout. Il faut corriger la phrase.

### Ce qui va
Pluie, midi et matin (couché et debout) : plus francs, plus bleus, plus du tout gris, sans rouge ni brûlé. Ce sont des gains nets. L'astre « Japon » est net et bien découpé au soir et au matin, et la lune ivoire n'éblouit pas (B = 0). La route, la caisse et les rails restent lisibles sur toutes les prises.

### Non vérifié
- Le midi, la pluie et l'orage debout ; une 3e graine pour pluie, orage et matin (seulement g3).
- Les fondus de météo, le PC au palier max, `?jadenuit=0` à l'image.
- Le vrai iPhone n'a rien vu.
- Les PNG bruts sont effacés, le profil Chrome aussi. Le disque avait 2,0-3,7 Go libres pendant le contrôle.

## Reprise du 19/11, correction 2 (les défauts du contrôle adverse, tour 2)

Que des nombres, dans `code/rendu/lumiere-design.js`, bloc `JADE_FINI` (`?sans=jadefini` = l'image d'avant). Ni scene-ciel.js (l'astre « Japon » inchangé), ni route, ni gameplay.

| temps | champ | correction 1 | correction 2 |
|---|---|---|---|
| nuit | jdZ / jdL / jdS (le ciel du haut, la lune) | indigo-violet | inchangés |
| nuit | jdM, jdH, jdB, jdR, fog, fogCj, fogIn, volSky, hemiS, fillC, env | bleu marine du lot | RETIRÉS du lot : reprennent la nuit jade `JADE_NUIT2` (jdB .07,.19,.195 ; fog .047,.142,.148 ; fogCj .08,.22,.21 ; hemiS .14,.36,.40 ; fillC .16,.50,.44 ; env '#0a2630' / '#1c5a58' / '#0e2a2c'…) |
| soir | jdZ / jdL | .34,.40,.68 / .84,.64,.76 | .40,.46,.70 / .86,.70,.76 |

Donc la nuit du lot = la nuit jade d'avant pour tout ce qui est sol, route, brume et horizon, avec un ZÉNITH indigo-violet à la place du bleu-vert (le seul changement de la nuit).

### Banc (un passage sous le verrou, 19:33-19:39, `?tel=1`, DPR 3, 120 pas, boucle figée ; 21 scènes, 0 panne, 0 exception)
Mesures `outils/controle-jade/mesure.py` (haut | milieu ; L luminance, C chroma, R % rouge-orange vif, V % vert-jade), AVANT → APRÈS :

| prise | haut | milieu |
|---|---|---|
| nuit g3 couché | L 28,0→18,7, C 62→69 | L 53,1→52,0, **V 34,1→30,7** |
| nuit g17 couché | L 21,3→13,2 | L 54,4→54,2, **V 34,1→34,4** |
| nuit g11 debout | L 17,4→10,1 | L 58,4→58,5, **V 37,9→37,9** |
| nuit g17 vers la lune | L 10,5→5,1 | L 45,5→39,4, V 17,7→16,1 ; bas V 10,0→10,3 |
| soir g3 couché | L 179→170, **C 57→98,5**, R 13,8→14,1 | R 30,3→32,3 |
| soir g17 couché | L 173→166, **C 66→101**, R 18,2→18,9 | |
| soir g11 debout | L 175→165, **C 59→101**, R 13,1→13,0 | |
| soir g17 vers l'astre | L 171→150 (était 135 en correction 1), C 57→109 | |
| orage g3 / g17 couché | L 52→42 / 50→43, C 25→53 / 25→51 | |
| pluie g11 debout | C 81→167 (bleu franc) | V 3,4→20,7 |

B (brûlé > 245) : 0 % partout. Le vert-jade du milieu de la nuit tient la cible (≥ 25 %) : 30,7-37,9 % (6,5-14,5 % en correction 1). La luminance du milieu de nuit = celle d'avant (−1,1 à +0,1) ; seul le zénith est plus sombre (indigo, voulu) et la vue vers la lune (−6 au milieu, le ciel indigo derrière). Le soir : chroma du haut 98-101 en jeu (cible ≤ 100 tenue de justesse), 105-109 vers l'astre (au-dessus) ; c'est encore un dégradé bleu → rose → orange, plus doux qu'en correction 1.
Orage ≠ nuit maintenant par la teinte aussi : la nuit a retrouvé son sol/horizon jade, l'orage reste ardoise bleue (haut L 42 contre 13-19 la nuit).

### Coût (`renderer.info`, image rendue à la main après 120 pas), AVANT / APRÈS / SANS
- couché g3 nuit : appels 92/92/92, programmes 149, géométries 604, textures 119, triangles 178 877 / 179 203 / 178 733 (±0,2 %, même bruit que sans).
- couché g3 soir : 91/91/91 ; orage 84/84 ; g17 : 81/81, 82/82, 78/78 (géométries 643, textures 119).
- debout g11 nuit : appels 163 / 155 / 155 (SANS = 155 aussi : bruit du banc debout, déjà vu au contrôle), programmes 149, textures 121.
Coût nul : aucun programme, texture ni appel de plus.

### Interrupteur
`sa-*` (sans=jadefini) contre `av-*` : mesures identiques à 0,1 près (nuit g3 couché, nuit g11 debout, soir g3 couché et vers l'astre).

### Planches (`correction2/`)
`c2-g3-couche-soir-nuit-orage-av-ap.jpg`, `c2-g17-couche-soir-nuit-orage-av-ap.jpg`, `c2-g17-astre-soir-nuit-orage-av-ap.jpg` (paysage 844×390), `c2-g11-debout-soir-nuit-pluie-av-ap.jpg` (portrait 390×844). Regardées : la nuit a son sol et ses rails jade sous un zénith indigo, la lune ivoire nette ; route et voiture lisibles ; pas d'aplat ni de brûlé.

### Non vérifié
Matin, midi : non repris (inchangés depuis la correction 1 ; le rouge du milieu du matin +0,5 point, non bloquant, laissé). Pluie en paysage non reprise à ce tour. Route : empreinte g1-24 × p0/10/20 identique (5ea45726ba355c54, 97d452aaf65b4169, 5d935a522d108c36). **Le vrai téléphone n'a rien vu.**

### Décisions pour Sacha
- Le soir : dégradé bleu → rose → or, un cran plus doux. S'il le veut encore plus calme, baisser la bande rose (jdL) vers le pêche.
- La nuit : zénith indigo-violet sur la nuit jade d'avant ; si le haut paraît trop sombre sur l'iPhone, éclaircir jdZ/jdL.

## Contrôle adverse, reprise du 19/11, tour 2

(Contrôle de la correction 2, e24873b10.) Verdict : **A_CORRIGER**. Le code, la route, l'interrupteur et les comptes sont propres. Mais le SOIR est encore plus rouge qu'avant sur toutes les graines mesurées, alors que Sacha dit « trop rouge ». La NUIT n'a gagné qu'un ciel plus sombre, sans gagner en clarté.

### Ce que j'ai exécuté
- **Diff** `origin/main...HEAD` (base dbc5f1d54, ancêtre de HEAD) : 6 fichiers (`code/rendu/lumiere-design.js` +39, `code/rendu/scene-ciel.js` +12 −2, 4 dans `outils/banc-finition-jade/`). Ni index.html ni sw.js, aucun `IS_MOBILE`, rien dans les routes ni le gameplay.
  - Relu ligne à ligne : `Object.assign` de NOMBRES sur les six `BIOMES.jade*` existants.
  - L'astre : la même chaîne GLSL (smoothstep, mix, pow ×2), les mêmes uniformes, seules les constantes changent.
  - Avec `sans`, les 3 morceaux de chaîne recomposent exactement les 2 lignes d'avant, `?jadenuit=0` compris.
- **Assemblage** `--depuis-morceaux` et `--verifier` : OK (349 morceaux, 13 251 838 octets). `garde-allege`, `garde-charte` et `garde-burnout` rendent 0. `garde-demarrage` : OK (21 scripts).
- **`vm.Script`** sur les 8 `<script>` : seule erreur, le script 5, que l'extracteur coupe ; elle est identique dans `avant`. Le gros script compile, donc aucune `const` n'est déclarée deux fois (`JADE_FINI` : 1 fois).
- **Route** : `ctrl` de `charge.cjs`, en **float64 bruts** et pas en `toFixed(2)`, graines 1-24 × paliers 0, 10 et 20, avec et sans `?sans=jadefini`. Les sommes de avant et du lot sont identiques au bit près : p0 `f78b455156e0c8d4` (8448 points), p10 `ac77de09987689cb`, p20 `654e8c28bc2f2ed6`.
- **Banc du vrai jeu** : UN passage sous le verrou, 21:24-21:32, `?tel=1`, DPR 3, 120 pas, boucle figée. 24 scènes, 0 panne, 0 exception, console propre.
  - **g5**, graine neuve, couché 844×390 : les 6 temps, avant et après, avec la prise vers l'astre, plus `sans` la nuit et le soir.
  - **g11** debout 390×844 : nuit, soir, pluie, orage et midi, avant et après.
  - `saP` nuit g11 n'a pas été pris : le passage a été coupé à 9 min.
- **Interrupteur** (`sans` comparé à avant, g5) : mesures identiques à 0,1 près. Écart au pixel : moyenne 1,0 et 1,0-1,2 % de pixels au-delà de 8 en couché ; 0,46 et 0,3-0,4 % vers l'astre. Ce sont les flammes et les particules.
- **Comptes** (`renderer.info`, avant / après) :
  - géométries et textures (120 ; 121 debout) identiques ;
  - appels identiques sur 8 paires sur 11 ; les sauts (139↔149, 148↔156) vont dans les deux sens, et `vH` diffère sur ap-matin (scène décalée) : c'est le bruit du banc ;
  - programmes 149 = 149 partout, **sauf ap-orage-g11-debout : 152**. Très probablement un matériau d'éclair compilé à la première apparition, car le lot n'a aucun moyen de créer un programme. Mais ce n'est pas prouvé : à rejouer deux fois au prochain passage (non bloquant).

### Mesures avant → après (`mesure.py` ; haut | milieu ; L luminance, C chroma, R % rouge-orange vif, V % vert-jade ; B brûlé = 0 % partout)
| prise | haut | milieu | lecture |
|---|---|---|---|
| soir g5 couché | L 167→161, **C 85→113, R 27,3→29,7** | **R 31,7→35,3**, C 90→96 | plus rouge, chroma du haut > 100 |
| soir g11 debout | L 175→167, C 60→99, **R 13,9→15,0** | **R 27,9→34,7** | plus rouge au milieu (+6,8) |
| soir g5 vers l'astre | L 170→150, C 53→105 | R 33,0→35,5 | |
| nuit g5 couché | L 45→39, V 16→12 | L 59,5→59,3, V 47 = 47 | sol inchangé, ciel plus sombre |
| nuit g11 debout | **L 17,3→10,1** | L 58,3 = 58,3, V 38 = 38 | 40 % de l'écran debout en bleu nuit presque noir |
| nuit g5 vers la lune | **L 9,8→4,7** | L 47,7→40,9, V 16→14 | ciel quasi noir |
| pluie g5 couché | C 74→129, **V 84→30** | V 9,5→33,7 | le haut passe de jade à azur |
| pluie g11 debout | **L 129,5→134,1**, C 81→167, V 99→11 | V 3→21 | haut plus clair que celui du MIDI debout (126) |
| orage g5 / g11 | C 29→54 / 24→51, L −6 / −11 | ≈ | plus du tout gris ; distinct de la nuit (L 48 contre 39) |
| matin g5 | C +40, V +25 | R +3,5 | azur, menthe ; horizon un peu plus orange |
| midi g5 / g11 | C +47 / +36, V +23 / +10 | R +3,6 / +4,9 | gain net |

### Défauts
1. **SOIR, bloquant** (`lumiere-design.js`, bloc `BIOMES.jade`). Le rouge-orange vif MONTE sur les 4 graines mesurées par les deux contrôles (haut +0,3 à +2,4 ; milieu +2 à +6,8 points). La demande de Sacha (« des fois c'est trop rouge ») et la cible du tour précédent (rouge ≤ avant) ne sont donc pas tenues. La note dit chroma du haut 98-101 : sur g5 couché, je mesure 113.
   - Le rouge en plus vient de la brume et de l'abîme poussés au saumon : fogCj `1,.70,.50` (avant `1,.76,.56`), fogIn `.92,.74,.66` (avant `.94,.86,.78`), jdB `.94,.70,.64` (avant `.90,.82,.76`), jdR `.42,.30,.46`.
   - Conseil : fogCj → `1,.76,.56`, fogIn → `.94,.82,.76`, fog → `.88,.72,.64`, jdB → `.92,.78,.72`, jdR → `.42,.36,.48` ; la bande jdL un cran plus pâle, `.86,.74,.80`.
   - Cible : R haut et milieu ≤ avant sur g3, g5, g17 et g11 debout, et C du haut ≤ 100 sur g5.
2. **NUIT, à corriger** (`BIOMES.jadeNuit`, jdZ et jdL). Le sol, la route et la brume sont revenus à l'image d'avant à 0,2 près : le « terne la nuit » de Sacha n'est donc traité que par le ciel. Or ce ciel est plus SOMBRE : haut −5 à −7 de L ; vers la lune 9,8 → 4,7 et milieu −6,8. En portrait, le tiers haut est un aplat bleu nuit presque noir (L 10). C'est le « noir bouché » à éviter.
   - Conseil : garder la teinte indigo-violet et l'éclaircir : jdZ `.062,.034,.098` → `.080,.055,.140`, jdL `.072,.050,.150` → `.090,.085,.180`.
   - Cible : L du haut ≥ celle d'avant (g11 debout ≥ 17, vers la lune ≥ 9,8).
3. **PLUIE, à faire trancher par Sacha** (non bloquant tout seul). Le ciel n'est plus du tout gris, mais il a perdu son vert : V du haut 84-99 % → 11-30 %. En portrait, il est plus clair que le midi (134 contre 126) : la pluie se lit comme un beau temps azur avec des traits de pluie. Sacha demandait « plus de bleu, PLUS DE VERT ».
   - Conseil : jdZ `.17,.28,.48` → `.16,.30,.42`, jdL `.26,.46,.54` → `.26,.48,.50`, pour un bleu-vert franc un peu plus sourd que le midi.
4. **non bloquant** : programmes 152 contre 149 sur ap-orage-g11-debout, sans doute un éclair (voir les comptes). À rejouer.
5. **non bloquant** : au matin et au midi, le rouge du milieu monte encore de 3,5 à 4,9 points (horizon orange-pêche). Les planches ne le montrent pas criard.

### Ce qui va
- Midi et matin : plus francs et plus typés.
- Orage : sorti du gris et distinct de la nuit.
- L'astre « Japon » : net, le disque vermillon bien découpé ; la lune ivoire n'éblouit pas.
- Rien de brûlé.
- Route, argent et caisse lisibles partout.
- La nuit garde son sol jade (V 38-47 %).

### Planches
`controle/ctl4-g5-couche-nuit-soir-pluie-av-ap-sans.jpg` (paysage) et `controle/ctl4-g11-debout-av-ap-sans.jpg` (portrait). Journal : `controle/journal-ctl4.txt`. Je les ai regardées. Les PNG bruts et le profil Chrome sont effacés. Disque : 1,9 Go libres à la fin.

### Non vérifié
- `sans` en portrait à ce tour : le passage a été coupé.
- Le matin debout.
- Les fondus de météo.
- Le PC au palier max.
- **Le vrai téléphone n'a rien vu.**

## Correction 3, 20/11 (les défauts du contrôle adverse, reprise du 19/11, tour 2) — commit 1b9662118

Que des nombres, dans `code/rendu/lumiere-design.js`, bloc `JADE_FINI` (`?sans=jadefini` = l'image d'avant, inchangé). Ni scene-ciel.js (l'astre « Japon »), ni route, ni gameplay, ni orage (inchangé depuis la correction 2).

### Méthode : 3 jeux de nombres mesurés en UN passage, puis le passage final
- **Essais** (`outils/banc-finition-jade/essais.cjs` + `essais-c3.json`, lancés par `passage-essais.sh`) : une page chargée par vue ; après 120 pas, la prise du lot, puis chaque jeu posé À CHAUD par `dbgLumiere(<ambiance>,{…})` (champs posés tels quels, puis bioLerp + bioApply), deux pas de 1 ms, une prise. Il n'y a donc pas de `?jadeessai=` dans le code. Preuve que le chaud vaut le code : sur chaque page d'avant, le lot e24873b10 posé à chaud (`lv`) contre le lot chargé (`ap`), écart ≤ 1,5 sur L, C, R et V, sauf le haut du midi debout (119,7 contre 125,8) : là, les essais se comparent à `lv`. Passage 14:24-14:33, 30 scènes, 0 panne, 0 exception. Mesures : `correction3/mesures-essais.txt`.
- **Final** : le code assemblé, `avant` / `après` / `sans`. Passage 14:41-14:51, 33 scènes, 0 panne, 0 exception (`correction3/journal-final.txt`, `mesures-final.txt`). Même outil de mesure que le contrôle (`mesure.py` : L luminance, C chroma, R % rouge-orange vif, V % vert-jade, B % brûlé ; haut | milieu).
- Le conseil du contrôle pour la pluie (jdZ .16,.30,.42) n'a pas été essayé : sa teinte (208°) est un azur, hors de la plage du vert-jade (90-185°). La valeur d'avant réelle du soir (lue au banc par `dbgEtatLum`) : fogCj .957,.700,.486, fog .827,.742,.656 et fogIn .883,.798,.712, après l'équilibre (chr .15, fogL .93). Ce ne sont pas les 1,.76,.56 de biomes.js.

### Les nombres, avant → lot e24873b10 → retenus
| temps | champ | avant (sans) | lot e24873b10 | correction 3 |
|---|---|---|---|---|
| soir | jdZ | .50,.56,.66 | .40,.46,.70 | **.44,.52,.72** |
| soir | jdL | .74,.72,.74 | .86,.70,.76 | **.74,.74,.84** (lilas, plus de rose) |
| soir | jdM / jdH | 1,.66,.42 / 1,.78,.54 | 1,.70,.48 / 1,.80,.52 | **1,.72,.54 / 1,.84,.62** |
| soir | jdB / jdR / jdS | .90,.82,.76 / .40,.38,.46 / 1,.72,.44 | .94,.70,.64 / .42,.30,.46 / 1,.70,.40 | **.86,.82,.80 / .38,.38,.50 / 1,.72,.44** |
| soir | fog / fogIn / fogCj | .827,.742,.656 / .883,.798,.712 / .957,.700,.486 | .86,.66,.58 / .92,.74,.66 / 1,.70,.50 | **.80,.76,.72 / .86,.82,.78 / .94,.74,.58** |
| nuit | jdZ / jdL | .018,.052,.098 / .030,.086,.130 | .062,.034,.098 / .072,.050,.150 | **.040,.070,.150 / .040,.120,.170** (bleu-jade) |
| pluie | jdZ / jdL | .20,.30,.31 / .30,.42,.41 | .17,.28,.48 / .26,.46,.54 | **.14,.28,.27 / .20,.40,.38** |
| matin | jdH / fog / fogIn | 1,.82,.60 / .80,.82,.74 / .86,.88,.82 | 1,.76,.62 / .90,.80,.70 / .94,.86,.76 | **1,.80,.64 / .86,.82,.74 / .92,.88,.80** |
| midi | jdH | .96,.88,.72 | 1,.84,.60 | **.98,.86,.66** |
Le reste du lot (nuit : sol, brume et horizon d'avant ; pluie : jdM, jdH, brumes, sat 1,16 ; orage ; zénith et menthe du matin ; cobalt du midi) est inchangé. ⚠ Vu au banc : la saturation de la pluie d'avant vaut 1,351 ; le lot la pose à 1,16, donc la BAISSE (le commentaire « un cran de saturation » est faux). Je l'ai laissée telle quelle : la chroma du haut reste au-dessus d'avant.

Jeux essayés et rejetés (même passage) :
- **Soir.** k1 (conseil du contrôle) : rouge du milieu g5 33,4 et g11 28,9, au-dessus d'avant. k2 (brumes d'avant) : milieu g11 27,9 > 26,9.
- **Nuit.** k1 (indigo éclairci, conseil) : haut plus clair qu'avant, mais le vert du milieu g3 tombe (31,6 contre 34,2). k3 (bleu roi) : correct, moins vert que k2.
- **Pluie.** k1 et k3 : plus clairs que k2, et k3 est au-dessus du midi debout (130 contre 126).
- **Matin.** k3 : un cran plus pâle.
- **Midi.** k1 et k3 : à 0,2 près de k2.

### Cibles : mesures AVANT → APRÈS (passage final)
1. **SOIR, TENUE.** Rouge-orange vif (haut | milieu) :
   - g3 couché : 13,8→7,4 | 30,3→26,0 ;
   - g5 couché : 27,3→17,3 | 31,7→23,9 ;
   - g17 couché : 18,1→12,2 | 27,2→21,5 ;
   - g11 debout : 13,0→9,1 | 26,9→22,1.

   La chroma du haut de g5 couché vaut 83,2 (cible ≤ 100 ; lot : 112,6). Ailleurs, haut 78-92 (avant 57-66). Le milieu du soir est plus clair (g3 115→131, g17 108→117) et un peu moins chroma (89→76-79) : c'est un pêche-or plus clair, pas un gris (planches). Brûlé : 0 %.
   Réserve : vers l'astre (g5), la chroma du haut vaut 107 (avant 54) : le ciel bleu-lilas derrière le disque vermillon. Le rouge du milieu y est de 34,2→22,1.
2. **NUIT, TENUE** (ciel plus clair et plus coloré).
   - L du haut : g5 couché 45,0→55,8 ; g3 28,0→42,1 ; g17 21,3→35,7 ; g11 debout 17,3→33,4 ; vers la lune (g5) 9,9→25,6.
   - C du haut : 56-63 → 77-92.
   - V-jade du milieu : g5 47,1→47,5 ; g3 34,2→34,5 ; g17 34,1→35,5 ; lune 17,4→18,2 ; **g11 debout 38,4→38,1 (−0,3)**. Cet écart est sous le bruit du banc : sans contre avant donne 0,8 d'écart sur g5.
   - Le sol, la route et la brume restent ceux d'avant : L du milieu ±1,3.
3. **PLUIE, TENUE.**
   - V du haut (≥ 50 %) : g5 84,0→91,3 ; g3 94,7→98,1 ; g11 98,6→99,1. Le lot en était à 11-30 %.
   - Plus sombre que le midi : en portrait, haut 121,5 contre 125,8 pour le midi (après) et 135,4 (avant). En paysage, 125 contre 157. Plus sombre aussi que la pluie d'avant (−3 à −8).
   - C du haut : 74-81 → 107-118, au-dessus d'avant.
   - V du milieu : 3-23 → 21-42.
   - Réserve : la chroma du MILIEU baisse un peu (g11 55,8→52,2 ; g5 57,6→55,9).
4. **Non bloquants.**
   - Programmes : l'orage debout g11, rejoué deux fois (lot e24873b10) → 149 et 149. Le 152 du contrôle ne revient pas ; il ne vient pas du lot, qui ne crée aucun programme.
   - Rouge du milieu, MATIN g5 : 10,3→8,8, sous avant (lot : 12,4). TENU.
   - Rouge du milieu, MIDI : g5 1,0→1,9 (lot 4,6) ; g11 debout 5,0→7,0 (lot 9,9). **Ramené de moitié, PAS au niveau d'avant** : un horizon plus pâle (.96,.88,.72, k1) ne gagnait que 0,2 point.
   - Orage g5 : inchangé depuis la correction 2 (haut L 53→48, C 29→54).

### Interrupteur
`sans` contre `avant`, à 0,1 près (haut et milieu) : soir g5 couché, nuit g5 couché et pluie g11 debout. Dans le bas de l'image, ±0,6 : ce sont les flammes et les particules.

### Coût (`renderer.info`, image rendue à la main après 120 pas, `?tel=1`) : avant / après / sans
| scène | appels | programmes | textures | triangles |
|---|---|---|---|---|
| soir g5 couché (après la prise vers l'astre) | 84 / 84 / — | 149 / 149 | 120 / 120 | 267 952 / 267 634 |
| soir g5 couché (sans prise vers l'astre) | — / — / 139 | 149 | 120 | sans 432 770 |
| soir g17 / g3 couché | 81/81 ; 91/91 | 149 | 119 | 151 964/151 408 ; 179 747/163 807 (vH 129,3 contre 133,3 : scène décalée, bruit du banc) |
| soir g11 debout | 163 / 163 | 149 | 121 | 448 133 / 449 677 |
| nuit g5 couché | 84 / 84 / 140 (sans, sans astre) | 149 | 120 | 265 972 / 265 444 |
| nuit g3, g17 couché ; g11 debout | 92/92 ; 82/82 ; 155/155 | 149 | 119-121 | ±0,2 % |
| pluie g11 debout | 156 / 148 / 148 | 149 | 121 | 410 383 / 408 619 / 410 235 |
| pluie g5, g3 couché | 141/141 ; 89/89 | 149 | 120 ; 119 | ±0,4 % |
| midi g11 debout / g5 ; matin g5 ; orage g5 | 165/157 ; 139/147 ; 139/147 ; 140/140 | 149 | 120-121 | ±0,2 % |

- Programmes : 149 partout. Textures identiques.
- Les écarts d'appels (±8) vont dans les deux sens et changent d'un passage à l'autre, sur avant aussi : la pluie g11 d'avant fait 148 au passage des essais et 156 au final. C'est le bruit du banc, déjà relevé par le contrôle.
- Les géométries vont de 594 à 643 et bougent aussi sur avant : 608 et 616 pour la même scène d'avant.
- Le lot ne change que des nombres d'ambiance : aucun programme, aucune texture et aucun appel de plus.

### Planches (`correction3/`, regardées)
- `c3-g5-couche-soir-nuit-pluie-av-ap-sans.jpg`
- `c3-g3-couche-soir-nuit-pluie-av-ap.jpg`
- `c3-g17-couche-soir-nuit-av-ap.jpg`
- `c3-g5-astre-soleil-lune-av-ap.jpg`
- `c3-g5-couche-matin-midi-orage-av-ap.jpg`, en paysage
- `c3-g11-debout-soir-nuit-pluie-midi-av-ap-sans.jpg`, en portrait
- `c3-essais-g5-couche-soir-nuit-pluie.jpg` : avant, le lot et les 3 essais

Ce qu'on y voit :
- le soir : zénith bleu, bande lilas, horizon pêche-or ;
- la nuit : zénith bleu nuit, puis une bande bleu-sarcelle, au-dessus de l'horizon et du sol jade d'avant, avec la lune ivoire nette ;
- la pluie : un ciel jade-sarcelle plus sombre que le midi ;
- route, caisse et argent lisibles ; aucun aplat noir, aucun brûlé.

Les anciennes planches ont été supprimées (`jade-*.jpg` de la première version, `correction2/*.jpg`).

### Non vérifié
- Le matin debout, l'orage debout APRÈS cette correction (rien n'a changé pour l'orage), les fondus de météo et le PC au palier max.
- La route : non rejouée, puisque seuls des nombres d'ambiance changent (le contrôle avait prouvé l'empreinte g1-24 au bit près pour e24873b10).
- **Le vrai téléphone n'a rien vu.**

### Décisions pour Sacha
- Le soir est plus calme et moins rouge qu'avant : bleu, lilas, or. S'il le veut plus chaud, remonter jdL vers le rose (.80,.74,.80, l'essai 2).
- La nuit est bleu-jade et plus claire qu'avant. S'il la veut plus « nuit », l'essai 1 (indigo, .080,.055,.140 / .090,.085,.180) est un cran plus sombre.

## Contrôle adverse au banc, 20/11

(Contrôle de la correction 3, 1b9662118, sur des graines que l'auteur n'avait pas prises : g23, g29 couché, g7 debout.) Verdict : **FUSIONNABLE**, avec des réserves de goût pour Sacha (non bloquantes).

### Ce que j'ai exécuté
- **Diff** `origin/main...HEAD` : `code/rendu/lumiere-design.js` (+49, bloc `JADE_FINI` : des `Object.assign` de NOMBRES sur les six `BIOMES.jade*`), `code/rendu/scene-ciel.js` (+12 −2, l'astre : mêmes opérations GLSL, d'autres constantes ; avec `sans`, les morceaux recomposent la ligne d'avant, `?jadenuit=0` compris), le reste dans `outils/banc-finition-jade/`. Ni index.html ni sw.js, aucun `IS_MOBILE`, ni route ni gameplay. Aucune autre section n'écrit `BIOMES.jade*` après ce bloc (`couleurs-finies.js` ne touche pas Jade).
- **Assemblage** `--depuis-morceaux` puis `--verifier` : OK (349 morceaux, 13 253 369 octets). `garde-demarrage` OK (21 scripts), `garde-allege`, `garde-charte`, `garde-burnout` : 0. `vm.Script` sur les 8 `<script>` : seule erreur le script 5, identique dans `avant` (l'extracteur le coupe) ; `const JADE_FINI` : une seule fois.
- **Route** (`outils/banc-routes/charge.cjs`, ctrl en float64, sha256) : graines 1-24 × paliers 0, 10, 20, avant / lot / lot `?sans=jadefini` / avant `?sans` : identiques au bit près (p0 86f3c8d29339469c, 8448 points ; p10 1feb6769763d646a ; p20 ab9305934bbe9544).
- **Banc du vrai jeu** : UN passage, 15:05-15:12 (mutex du groupe puis verrou), `?tel=1`, DPR 3, boucle figée, 120 pas. 28 scènes sur 28 : g23 couché 844×390, les SIX temps avant/après + la prise vers l'astre (soir, nuit) + `sans` soir et nuit ; g29 couché soir/nuit/pluie avant/après ; g7 debout 390×844 soir/nuit/pluie avant/après + `sans` nuit et pluie. 0 panne, 0 exception sur les 20 scènes couchées (les scènes debout ne relèvent pas la console dans l'outil). Journal `controle/journal-ctl5.txt`, mesures `controle/mesures-ctl5.txt`.
- **Interrupteur** : `sans` = avant à 0,1 près sur haut et milieu (soir g23, nuit g23, nuit g7, pluie g7) ; bas ±1,7 (flammes, particules).
- **Comptes** (avant / après) : programmes 149 partout, textures égales (119 ; 121 g29), appels égaux sur 13 paires sur 14 (nuit g7 debout 147 / 139, et `sans` 139 : c'est l'avant qui saute, bruit du banc) ; triangles à ±0,4 %. Géométries 607 sur la toute première scène puis 635 / 616 / 645 constants : chargement.

### Mesures avant → après (`mesure.py` ; haut | milieu ; B brûlé = 0 % partout)
| prise | haut | milieu | lecture |
|---|---|---|---|
| soir g23 couché | R 25,1→18,8, C 82→84, L 164→167 | R 21,5→19,8, **C 75→66, L 100→111** | moins rouge ; milieu plus clair, moins chroma |
| soir g29 couché | R 23,4→17,2, C 75→88 | R 27,0→19,0, **C 87→74**, L 102→112 | idem |
| soir g7 debout | R 15,7→12,6, C 66→85 | R 21,0→17,9, C 72→67 | idem |
| soir g23 vers l'astre | **C 53→102**, L 163→149 | R 26,5→19,5 | ciel pervenche derrière le disque |
| nuit g23 / g29 couché | L 53→65 / 43→57 ; C 56→74 / 62→84 | V 46,0→46,5 / 27,8→27,7 ; L ±2 | ciel plus clair et plus bleu, sol inchangé |
| nuit g7 debout | L 20,6→31,7, C 49→71 | V 34,0→33,4 (−0,6) | |
| nuit g23 vers la lune | L 11→25, C 45→83 | L 42→50 | |
| pluie g23 / g29 / g7 debout | V 81→86 / 90→96 / 80→81 ; C +26 à +36 ; L −4 à −5,5 | V +14 à +15 ; C −2 / +4 / −5 | plus jade ; haut 103-129 contre midi 150 |
| orage g23 | L 53,5→46,9, C 29→54 | C 43→52 | ardoise bleue, distinct de la nuit (haut 47 contre 65) |
| matin / midi g23 | C +47 ; V +17 | R 12,1→10,9 / **1,08→1,56** | plus francs |

### Ce que j'ai vu (planches regardées)
- Soir : zénith pervenche-lilas, horizon pêche-orange, disque vermillon net. Moins de « braise » qu'avant, pas gris. Il est plus doux, un peu pastel vers l'astre (le ciel bleu lavande y est uniforme et assez saturé).
- Nuit : zénith bleu nuit profond, bande sarcelle, sol jade intact, lune ivoire nette, aucun aplat noir. Toujours une nuit, pas un crépuscule.
- Pluie : ciel jade-sarcelle franc, nettement plus vert qu'avant, distinct du midi (plus sombre) et de l'orage (ardoise).
- Orage, matin, midi : distincts ; matin/midi plus azur.
- Route, argent, caisse lisibles partout ; rien de brûlé ; pas de banding visible.

### Réserves (non bloquantes, goût de Sacha)
1. Soir : milieu de l'image plus clair (+5 à +11 de L) et moins chroma (−5 à −13, g29 87→74). C'est un pêche plus pâle. Si Sacha le trouve trop doux : jdM `1,.72,.54` → `1,.70,.50` (lumiere-design.js:79), à mesurer.
2. Soir vers l'astre : ciel lavande saturé (C du haut 53→102) derrière le soleil.
3. Midi : rouge du milieu g23 1,08→1,56 (+0,5) ; la cible « ≤ avant » n'est pas tenue, mais l'écart est infime.
4. Pluie : la chroma du bas (la route) baisse de 5 à 6 points (g23 46→40, g7 66→59) ; la route n'est pas moins lisible sur les planches.

### Planches (`controle/`, 5 JPEG ; les ctl3/ctl4 anciens supprimés)
`ctl5-g23-couche-soir-nuit-pluie-av-ap-sans.jpg`, `ctl5-g23-couche-orage-matin-midi-av-ap.jpg`, `ctl5-g23-astre-soleil-lune-av-ap.jpg`, `ctl5-g29-couche-soir-nuit-pluie-av-ap.jpg` (paysage), `ctl5-g7-debout-soir-nuit-pluie-av-ap-sans.jpg` (portrait). PNG bruts et profil Chrome effacés. Disque : 5,6 Go libres.

### Non vérifié
- La console des scènes DEBOUT (l'outil ne la relève qu'en couché).
- Le matin, le midi et l'orage debout ; l'astre debout ; les fondus de météo ; le PC au palier max.
- **Le vrai téléphone n'a rien vu.**
