# CANYON : finition, le soir trop rouge (18-19/11/2026), tour 4

> **Tour 4 (19/11), commit `bd85ab8c7`, en fin de note.** Le soir passe de « refroidi » à « doré » (`cyT` [.94,1.06,.92], `sunC` [.97,.70,.42], `cyH` [1,.64,.36]) et la pluie au bleu canard (`rtT` [.76,1.04,1.10]). Les planches `soir-*` et `pluie-g11-*` sont celles du tour 4 ; les autres planches (nuit, orage, interrupteur) datent du tour 2-3. **Trois cibles du contrôle ne sont pas tenues** : le chroma de la roche, le R−B de g11 et la luminance en course. Le détail est dans la section « Tour 4 ».

Branche `finition-maps-canyon`. Tour 1 : commit `f9b3dfd2a`. Tour 2 : `deaeed91d`. Tour 3 (réponse au contrôle du tour 2, section « Tour 3 » plus bas) : `ac903f88b`, qui ne touche que `code/maps/canyon-relief.js` et `outils/`.
Rien n'est sur main. Aucune app n'a été touchée et aucun build n'a été fait. `index.html` et `sw.js` ne sont pas commités.

## Ce qui change : des nombres d'ambiance seulement
Tout est dans `CY_FINI_R` (canyon-relief.js). Les valeurs se posent par-dessus les retouches de la piste A, en dernier (`eqApplique`, dans lumiere-design.js, après l'équilibre et le plan de feu).
Elles ne jouent qu'avec la piste A, celle par défaut. Le lot n'ajoute ni géométrie, ni GLSL, ni texture, ni uniforme. Les routes et le gameplay ne sont pas touchés.

| ambiance | champ | avant → après (tour 3 en gras quand il a changé) |
|---|---|---|
| **soir** | soleil `sunC` | [1,.56,.30] → **[1,.68,.44]** (tour 2 : [1,.60,.36]) : un soleil or, plus orange braise |
| | rebond des parois `cyL` | [1,.48,.30] → **[.90,.63,.50]** |
| | **nouveau au tour 3** : teinte de la roche `cyT` | [1,.95,.93] → **[.94,.99,1.10]** (du rouge vers l'or et le froid : le grès doré) |
| | ciel d'ombre `hemiS` / sol `hemiG` | [.36,.42,.56] / [.45,.25,.18] brique → [.34,.40,.66] / **[.31,.24,.31]** mauve |
| | remplissage `fillC` | [.40,.44,.62] → [.36,.42,.80] (bleu-violet) |
| | brume `fog` / `fogCj` / `fogIn` | [.92,.52,.34] orange / [1,.62,.36] / [1,.84,.74] → **[.82,.52,.58]** rose corail / [1,.64,.44] or / [.94,.80,.82] |
| | fond de gorge `cyF` | [.835,.733,.727] → [.72,.62,.80] (mauve ardoise) |
| | horizon `cyH` | [1,.50,.26] → [1,.58,.32] (l'or de l'horizon est gardé) |
| | **nouveau au tour 2** : zénith `cyZ`=`jZen` / milieu du ciel `cyM`=`jMid` | [.10,.11,.39] / [.48,.30,.42] → [.10,.12,.42] / [.44,.30,.54] (violet) |
| | **nouveau** : nuages éclairés `cyC` / leur ombre `cyD` / mesas du fond `cyR` | [1,.55,.32] / [.30,.22,.34] / [.42,.27,.33] → **[1,.68,.50]** or / [.26,.22,.40] / [.36,.26,.40] mauve |
| | saturation | **retirée** (le tour 1 la multipliait par 0,92 : c'était délaver) |
| **nuit** | route `rtT`, lune `sunC`, `fogCj`, `cyF` | **rendus à l'avant** (le tour 1 les avait changés) |
| | ciel d'ombre `hemiS` / remplissage `fillC` | [.28,.32,.64] → [.30,.27,.66] ; remplissage → [.34,.28,.74] : le bleu glisse vers le bleu-violet, à luminance égale |
| **pluie** (hors tirage) | ciel `cyZ`/`jZen`, `cyM`/`jMid` | [.156,.212,.305] / [.25,.31,.40] gris bleu → [.10,.24,.36] / [.20,.36,.44] bleu canard |
| | brume, ciel d'ombre, fond, nuages `cyC`/`cyD` | gris → ardoise turquoise ; rebond `cyL` [.45,.40,.38] → [.72,.46,.36] terre cuite ; saturation × 1,12 |
| | **tour 3** : route mouillée `rtT` | [1.05,1,.86] gris chaud → **[.82,1,1.14]** bleu canard |
| **orage** (hors tirage) | ciel, horizon, nuages, mesas | bleu-noir → indigo-violet (`cyH` [.069,.093,.162] → [.16,.10,.24]) |
| | ciel d'ombre `hemiS` / remplissage | [.28,.36,.54] → [.30,.28,.60] (même luminance, le tour 1 l'assombrissait) / [.38,.32,.74] |
| **matin** | rien | Le matin était déjà équilibré d'après CANYON-FINAL.md. Le canyon ne tire pas de midi. |

Les dunes copient `canyonSoir` et `canyonOrage` au chargement, avant ces retouches : elles ne sont pas touchées.

## Mesures du tour 2 (vrai jeu, `?tel=1`, Chrome sans fenêtre, sous le verrou « finition-canyon », 05:37-05:42)
Scénario `outils/banc-routes/canyon-finition/tour2.mjs` (celui du contrôle) et statistiques `stats.cjs`. Pour chaque cas, trois chargements : avant (`finition-lots/avant`), lot, lot `?sans=canyonfini`.
Vues figées `dbgCanyonVoute('vueS',900|2600)` en paysage 844×390 et portrait 390×844, puis une image en course (paysage). L = luminance moyenne (0-255), R−B = rouge moins bleu, chroma = max−min moyen.

| cas | avant L / R−B / chroma | lot L / R−B / chroma | écart lot~avant | bruit sans~avant |
|---|---|---|---|---|
| soir g3, vue 900 paysage | 100,3 / 69,2 / 87,0 | 100,5 / 49,1 / 80,8 | 8,4 | 0,13 |
| soir g3, en course | 113,5 / 89,9 / 99,6 | 114,3 / 68,0 / 86,3 | 8,3 | 11,0 (images en course : bruit fort) |
| soir g11, vue 900 paysage | 105,4 / 76,0 / 87,5 | 105,7 / 55,7 / 80,2 | 8,1 | 0,78 |
| soir g11, en course | 96,7 / 71,9 / 101,3 | 97,4 / 55,1 / 98,6 | 6,8 | 14,9 |
| soir g11, vue 2600 portrait | 59,2 / 15,2 / 54,7 | 58,1 / −2,8 / 64,9 | 7,7 | 0,85 |
| nuit g7, vue 900 paysage | 48,6 / −26,0 / 49,0 | 47,7 / −25,4 / 52,2 | 2,6 | 0,40 |
| nuit g7, vue 2600 portrait | 44,6 / −27,3 / 57,2 | 43,8 / −26,5 / 61,2 | 2,7 | 0,29 |
| nuit g7, en course | 48,6 / −18,8 / 46,2 | 47,7 / −18,8 / 49,3 | 2,1 | 3,3 |
| pluie g7, vue 900 paysage | 85,1 / 24,1 / 39,4 | 83,7 / 16,8 / 43,4 | 3,3 | 0,61 |
| pluie g7, vue 900 portrait | 96,9 / 41,3 / 56,6 | 95,2 / 33,4 / 64,5 | 4,1 | 0,46 |
| orage g3, vue 900 paysage | 140,9 / −27,2 / 51,9 | 137,2 / −29,6 / 74,0 | 12,3 | 1,5 |
| orage g3, en course | 59,6 / −2,8 / 35,0 | 59,2 / −3,0 / 51,9 | 14,6 | 1,1 |

Lecture :
- **Soir** : le rouge (R−B) baisse de 20 à 24 % à l'arrêt **et en course** (89,9 → 68,0 ; 71,9 → 55,1). La luminance ne bouge pas. Le chroma baisse de 7 à 9 % à l'arrêt et de 3 à 13 % en course, mais il n'y a plus de clé de saturation : c'est la teinte qui quitte l'orange pur (le chroma max−min d'un orange saturé est plus grand que celui d'un corail ou d'un mauve). En portrait, le chroma monte de 5 à 19 %.
- **Nuit** : L −1,6 à −2,0 %, chroma +4 à +7 %. Le critère du contrôle (pas plus de 3 % de baisse) est tenu. La route reste bleu électrique.
- **Pluie** : l'écart lot~avant (3,3 à 4,1 à l'arrêt, 15,5 en course) est maintenant 6 à 9 fois le bruit (0,4 à 0,7). Le chroma monte de 7 à 14 %. Le changement reste doux à l'œil.
- **Orage** : l'écart (10,8 à 14,6) est 7 à 14 fois le bruit (1,0 à 1,5), donc mesurable. Le chroma monte de 22 à 48 %, L baisse de 1 à 4 %.

## Coût : les comptes de `renderer.info` (tour 2, vue figée 900, `?tel=1`)

| cas | avant | lot | lot sans=canyonfini |
|---|---|---|---|
| soir g3 | 108 appels · 519 345 tri · 154 prog · 583 géom · 124 tex | 108 · 519 777 · 154 · 579 · 124 | 108 · 519 633 · 154 · 583 · 124 |
| soir g11 | 123 · 567 289 · 154 · 594 · 126 | 123 · 567 025 · 154 · 594 · 126 | 123 · 567 169 · 154 · 594 · 126 |
| nuit g7 | 144 · 528 547 · 154 · 612 · 124 | 144 · 528 283 · 154 · 604 · 124 | 144 · 528 235 · 154 · 610 · 124 |
| pluie g7 | 138 · 507 321 · 154 · 612 · 124 | 146 · 508 049 · 154 · 610 · 124 | 138 · 507 105 · 154 · 612 · 124 |
| orage g3 | 103 · 489 647 · 154 · 583 · 124 | 101 · 489 407 · 154 · 583 · 124 | 101 · 489 311 · 154 · 583 · 124 |

Programmes et textures identiques partout. Les appels, triangles et géométries bougent dans les deux sens d'un chargement à l'autre (au tour 1, la pluie avait donné avant 146 / lot 138 ; ici avant 138 / lot 146) : c'est le bruit des objets vivants et des pièces, à ±0,2 % de triangles.
Le lot ne change que des valeurs lues à chaque image. Aucun objet, programme ni texture ne peut naître de ces nombres. Console : zéro exception, zéro warn, zéro error dans les 15 chargements.

## L'interrupteur
`?sans=canyonfini` : `CY_FINI_R` n'est pas appliqué. Écart moyen sans~avant à l'arrêt : 0,00 à 0,85 au soir, 0,29 à 0,40 la nuit, 0,39 à 0,61 sous la pluie, 1,0 à 1,5 à l'orage (pluie et éclairs qui tombent). `dbgAmb` redonne exactement l'ambiance d'avant (hemiS, fog, sunC, sat). Planche : `interrupteur-sans-canyonfini.jpg`.

## Planches (vrai jeu, `?tel=1`, 844×390 et 390×844 en ×2)
Tour 3 (valeurs du commit, banc du 18/11 07:29-07:34) :
- `soir-g3-g7-paysage-avant-apres.jpg` (vue figée et en course, g3 et g7), `soir-g11-paysage-avant-apres.jpg`, `soir-portrait-avant-apres.jpg` (g3 et g11, vue et course) ;
- `pluie-g11-g7-avant-apres.jpg`, `pluie-portrait-avant-apres.jpg` ;
- `interrupteur-sans-canyonfini.jpg` (soir g3 et pluie g11 : avant | sans | tour 3).
Tour 2, toujours valables (nuit et orage n'ont pas bougé depuis) : `nuit-g7-paysage-avant-apres.jpg`, `orage-g3-paysage-avant-apres.jpg`, `nuit-pluie-orage-portrait-avant-apres.jpg` (sa colonne pluie montre la route grise du tour 2).

## Mon avis à l'image (regardé)
- **Soir** : l'ombre, la route et la brume quittent la braise pour le mauve et le bleu-violet. Le ciel du fond, en course, tire au violet. La route bleu-violet et l'argent restent lisibles.
  **Les faces des parois au soleil restent orange vif**, en course surtout : c'est le soleil sur le grès, pas l'ambiance. Pour aller plus loin, j'ai préparé un soleil or au lieu d'orange (`sunC` [1,.66,.42], `cyL` [.90,.62,.50], brume [.82,.52,.58]). Je ne l'ai pas gardé : le banc avait 19 sessions en file d'attente et je n'ai pas pu le mesurer. C'est la décision 1.
- **Nuit** : presque comme avant (route bleu électrique, bords turquoise), avec un bleu un peu plus violet dans l'ombre. L'assombrissement de 20 % du tour 1 a disparu.
- **Orage** : roche rose-mauve, route lilas, ciel indigo-violet en course. Plus typé, route claire et lisible.
- **Pluie** : ciel et brume bleu canard, roche un peu plus terre cuite. La route mouillée reste grise : c'est voulu pour la lisibilité, mais c'est encore sage.

## Pas vérifié
- **Le vrai téléphone n'a rien vu.** Tout vient de Chrome sans fenêtre en `?tel=1`.
- Une graine pour la nuit, la pluie et l'orage ; deux (3 et 11) pour le soir. Le matin (non touché), le portail d'entrée et de sortie, et une vidéo en roulant (scintillement) ne sont pas vérifiés.
- La boucle n'était pas figée par `dbgStep` : les comptes de triangles et de géométries gardent ±0,2 % de bruit ; les images en course varient beaucoup d'un chargement à l'autre (bruit 11 à 15 au soir).
- La variante « soleil or » du soir (décision 1) n'est pas mesurée.
- Les routes : le lot ne touche que `CY_FINI_R`, aucun fichier lu par `outils/banc-routes/canyon.cjs` (le contrôle du tour 1 avait trouvé le JSON identique au bit près, graines 1-24 × paliers 0 et 10) ; je ne l'ai pas relancé.
- Gardes vertes dans le dossier du lot après `--depuis-morceaux` : `garde-demarrage` (21 scripts), `garde-allege`, `garde-charte`, sans avertissement « index.html ≠ code/ ». Compilation vm des `<script>` d'index.html : 8 scripts, 1 erreur (n° 5), la même dans `finition-lots/avant`.

## À décider par Sacha
1. Le soir : assez rééquilibré ainsi ? Ou faut-il le soleil or (`sunC` [1,.66,.42]) pour que les parois au soleil soient du grès doré et plus de la braise, au prix d'un coucher un peu moins rouge ?
2. La pluie et l'orage sont hors tirage : leur réglage ne compte que si tu les remets.
3. La pluie : veux-tu une route mouillée teintée (bleu canard) ? Elle est restée grise pour la lisibilité.

## Contrôle adverse, tour 1

**Verdict : A_CORRIGER.** Le lot est propre (diff, coûts, interrupteur, routes), mais il assombrit et ternit la nuit sans qu'on l'ait demandé, et il ne règle pas la plainte principale : en course, le soir reste rouge-orange.

### Ce qui tient (exécuté)
- Diff `a0d9f3094..f9b3dfd2a` : 15 lignes dans `code/maps/canyon-relief.js` (des nombres d'ambiance seulement, posés par `eqApplique` dans `lumiere-design.js:65`) et des outils de banc. Pas de `index.html`, pas de `sw.js`, pas de garde `IS_MOBILE`, aucune texture, aucun mesh, aucune ligne GLSL. Chaque clé (`sunC`, `cyL`, `hemiS/G`, `fillC`, `fog/fogCj/fogIn`, `cyF`, `cyH`, `rtT`, `sat`) a bien un lecteur. Les dunes, qui dérivent de `canyonOrage`, en prennent une copie au chargement : elles ne sont pas touchées.
- `--depuis-morceaux` : 346 morceaux d'accord. `garde-demarrage`, `garde-allege` et `garde-charte` sont OK. Les `<script>` d'index.html compilés par vm : 8 scripts, une seule erreur (n° 5), la même dans `finition-lots/avant`, donc déjà là avant le lot. `index.html` lot moins avant = exactement le bloc `CY_FINI`.
- Routes : `outils/banc-routes/canyon.cjs`, graines 1-24 × paliers 0 et 10, sortie JSON identique au bit près entre avant et le lot (md5 97cc6084… / 587de2d6…).
- Banc (verrou « finition-canyon », 05:15-05:21, `outils/banc-routes/canyon-finition/ctl-tour1.mjs`, non commité) : vrai jeu en `?tel=1`, 844×390 et 390×844, soir g3/g7/g11, nuit g7, pluie g7, orage g3. Trois chargements par cas : avant, lot, lot `?sans=canyonfini`.
  - Comptes : programmes 154 et textures 124/126, identiques partout. Les appels sont égaux dans 5 cas sur 6 (pluie : avant 146, lot 138, sans 138, donc du bruit). Les triangles et géométries bougent de ±0,2 % dans les deux sens, `sans` compris.
  - Console : aucune exception, aucun `console.warn` ni `console.error`, dans les trois jeux.
  - Interrupteur, en écart moyen par canal entre `sans` et avant à vue figée : 0,17-0,5 sur le soir, la pluie et la nuit à s2600, 1,2-1,4 sur certains s900, et 5,1 en nuit s900 portrait (objets vivants). L'ambiance relue par `dbgAmb` est exactement celle d'avant. ✔
  - L'orage est mesuré à part : la pluie et les éclairs font un bruit de 6,2 à 8,4 entre `sans` et avant, contre 6,3 à 7,4 pour le lot. **Le changement de l'orage ne se distingue pas du bruit.**

### Défauts (reproductibles)
1. **La nuit est plus sombre et plus terne : régression non demandée.** Nuit g7, 4 vues (s900 et s2600, paysage et portrait) : luminance moyenne 42,8-48,9 → 35,0-39,5 (−18 à −22 %), chroma 48,9-57,1 → 39,8-45,8 (−16 à −23 %). En course, le fond se bouche en violet-brun et la route bleu électrique devient une encre terne. C'est l'inverse de la règle « nuit bleue/violette jamais grise », et l'équilibre des maps avait justement corrigé une « canyon nuit L* 12 » trop bouchée. La cause est `canyon-relief.js:135`, qui divise la lumière du ciel par deux : `hemiS` [.28,.32,.64] → [.14,.13,.34]. Le NOTE parle de « bleu-gris → indigo », alors que la valeur d'avant n'est pas grise, et ne dit pas que la nuit s'assombrit.
   → Conseil : garder la luminance d'avant en tournant seulement la teinte, `hemiS` ≈ [.30,.27,.66] et `fillC` ≈ [.34,.28,.74]. Garder `rtT` d'avant ([.86,.93,1.14]), ou au plus [.90,.92,1.10]. Revérifier que L et le chroma de la nuit ne baissent pas de plus de 3 %.
2. **Le soir n'est réglé qu'à vue figée.** À l'arrêt, on mesure moins de rouge (R−B moyen −20 à −24) et la paroi tire au rose. En course (soir g11 et g3), le ciel et les parois du fond restent du même orange saturé : les teintes du ciel du soir (`cyZ`/`cyM`/`jZen`/`jMid`) ne sont pas touchées. En plus, `sat` ×0,92 fait baisser le chroma de 10 à 14 %, ce qui retire de la couleur au lieu de déplacer la teinte, contre la règle « ne pas désaturer ».
   → Conseil : remettre `sat` à 1 (pas de clé). Pousser le zénith et le haut du ciel du soir vers le violet-bleu, par exemple `cyZ`/`jZen` ≈ [.10,.12,.42] et `cyM`/`jMid` ≈ [.46,.30,.52], en gardant l'horizon or (`cyH`). Juger sur la photo « en course », pas seulement sur les vues figées.
3. **La pluie et l'orage ne se voient presque pas.** Pluie g7 : écart moyen lot/avant de 3,4 à 4,5 seulement, et la route reste grise et délavée (la mission demandait « plus fun »). L'orage est sous le bruit (point ci-dessus). Les deux sont hors tirage, donc ce n'est pas bloquant, mais la NOTE ne doit pas présenter l'orage comme « plus typé » sans une mesure qui le distingue du bruit.

### Pas vérifié par moi
Le vrai téléphone. Le matin (non touché par le lot). Le portail d'entrée et de sortie. Une seule graine pour la nuit, la pluie et l'orage. La boucle n'était pas figée par `dbgStep` : les comptes de triangles et de géométries gardent ±0,2 % de bruit.
Planches du contrôle : `controle/ctl-soir-g11-paysage.jpg`, `controle/ctl-nuit-g7-paysage.jpg`, `controle/ctl-portrait.jpg`. Captures brutes et `comptes.json` dans `controle/brut/`.

## Tour 2 : réponse aux défauts du contrôle
1. **Nuit plus sombre et plus terne** : corrigé. `rtT`, `sunC`, `fogCj` et `cyF` rendus à l'avant ; `hemiS` [.30,.27,.66] et `fillC` [.34,.28,.74], les valeurs conseillées. Mesuré : L −1,6 à −2,0 %, chroma +4 à +7 % (critère : pas plus de 3 % de baisse).
2. **Soir réglé seulement à vue figée, sat ×0,92** : corrigé. Clé `sat` retirée ; ciel du soir (`cyZ`/`jZen`, `cyM`/`jMid`), nuages (`cyC`, `cyD`) et mesas (`cyR`) passés au violet et à l'or, horizon or `cyH` gardé. Mesuré en course : R−B 89,9 → 68,0 (g3) et 71,9 → 55,1 (g11). Les faces au soleil restent orange (décision 1 de Sacha).
3. **Pluie et orage presque invisibles** : pluie, écart 3,3-4,1 contre un bruit de 0,4-0,7 (15,5 en course) ; orage, écart 10,8-14,6 contre un bruit de 1,0-1,5. Les deux sont maintenant séparés du bruit.
4. **NOTE inexacte** : la table dit maintenant les valeurs d'avant telles quelles, et la nuit n'est plus assombrie.

## Contrôle adverse, tour 2

**Verdict : A_CORRIGER.** Le lot est propre : diff, gardes, coûts, interrupteur, routes et console sont bons, et la nuit est réparée. Mais le défaut que Sacha a nommé n'est toujours pas réglé. **Le soir reste rouge-orange braise sur la roche**, et c'est surtout la route qui change. En course, l'avant et le lot se distinguent à peine.

### Ce qui tient (exécuté)
- Diff `a0d9f3094..deaeed91d` : `code/maps/canyon-relief.js` (+22 lignes, le bloc `CY_FINI` / `CY_FINI_R`, des nombres seulement), plus des outils de banc. Il n'y a ni `index.html` ni `sw.js`, ni garde `IS_MOBILE`, ni texture, ni mesh, ni GLSL. Les clés passent par `eqApplique` (`lumiere-design.js:65`), qui pose tout champ tel quel. Le matin n'est pas touché. Le canyon ne tire que matin, soir et nuit (`niveaux.js:98`) : la pluie et l'orage sont bien hors tirage.
- `node code/assembler.cjs --depuis-morceaux` : 346 morceaux d'accord. `garde-demarrage` (21 scripts), `garde-allege` et `garde-charte` sont OK. `const CY_FINI=` n'est déclaré qu'une fois. La compilation vm des `<script>` donne 1 erreur (n° 5), la même dans `avant` : c'est un faux positif de l'expression régulière (une balise dans un commentaire).
- Routes, banc Node `outils/banc-routes/canyon.cjs`, graines 1-24 × paliers 0 et 2, `--brut` : md5 identiques entre avant et le lot (`621452dc…` / `9b1a4d46…`). Dans le vrai jeu, `dbgTrace` + FNV de `dbgRoute` sur 20 graines × paliers 0/2 donne 40/40 égaux. Attention : `dbgTrace({graine})` ne change pas la piste du canyon, qui suit `?pistegraine`. Cette mesure ne vaut donc que pour la piste g3, à deux paliers.
- Banc sous verrou « finition-canyon » (06:43-06:48, `ctl-tour2.mjs`, non commité), `?tel=1`, 844×390 et 390×844. Cas : soir g3 et g11, nuit g7, pluie g11, orage g7. Pour chacun, trois jeux : avant, lot, lot `?sans=canyonfini`.
  - Comptes : programmes 154 et textures 124/126 identiques partout. Les appels sautent de ±8 dans les deux sens, `sans` compris : `sans` nuit 152 contre 144 pour avant, `sans` orage 147 contre 139. C'est du bruit, aucune hausse n'est due au lot.
  - Console : zéro exception, zéro warn, zéro error dans les 15 chargements.
  - Interrupteur, écart moyen `sans`~avant à vue figée : soir 0,00-0,72, nuit 0,24-0,32, pluie 0,94-1,27, orage 1,68-2,06 (pluie et éclairs). `dbgAmb` redonne l'ambiance d'avant exactement. ✔
  - Ambiances : la nuit fait L −1,7 % et chroma +4 à +7 %, à peine visible : rendue comme demandé ✔. L'orage fait chroma +6 à +24 %, un ciel et une route indigo-magenta en course : typé et lisible ✔. La pluie fait R−B −7 à −10 et chroma +4 à +23 %, mais la route reste grise et l'effet reste discret (hors tirage, non bloquant).
- Les mesures de la NOTE du tour 2 (vues figées, bruit) sont reproduites à ±0,5 près.

### Défaut (reproductible)
1. **Soir : la roche reste de la braise.** On mesure le haut de l'image (12-50 %), donc les parois et le ciel, en comptant la part de pixels « orange vif » (R > 200 et B < 90) :
   - soir g3 en course : avant 56 % → lot 40 % (R−B 132 → 109) ;
   - soir g11 en course : avant 78 % → lot 68 % (R−B 164 → 144) ;
   - soir g3, vue 2600 portrait : avant 77 % → lot 67 %.
   La luminance ne bouge pas. Le gros de l'écart lot~avant (6,6-7,7 en moyenne) vient de la route, grise devenue lavande. À l'œil (`controle/ctl2-soir-paysage.jpg`, lignes « en course »), les deux images sont presque les mêmes : parois orange saturé et ciel braise. La mission demandait « une roche qui reste du grès et pas de la braise ». L'auteur le reconnaît (« décision 1 ») et laisse à Sacha une variante qu'il n'a pas mesurée.
   → **Conseil (une passe)** : mettre et mesurer le soleil or déjà préparé, dans `canyon-relief.js:136` :
   - `sunC` [1,.60,.36] → [1,.66,.42] ;
   - `cyL` [.92,.58,.44] → [.90,.62,.50] ;
   - `fog` [.84,.50,.50] → [.82,.52,.58].
   Si ça ne suffit pas, ajouter `hemiG` [.36,.24,.26] → [.32,.24,.30]. Viser en course, sur le haut de l'image, moins de 35 % de pixels orange vif pour g3, moins de 50 % pour g11, et R−B ≤ 100, à luminance égale (±3 %). Il faut aussi que la photo en course soit nettement différente de l'avant, avec l'horizon or (`cyH`) gardé. Ne pas toucher à `sat`.

### Pas vérifié par moi
Le vrai téléphone. Le matin, qui n'est pas touché. Le portail. Une graine par météo, sauf pour le soir (g3, g11). La boucle n'était pas figée par `dbgStep`, d'où le bruit de ±8 appels et ±0,2 % de triangles.
Planches du contrôle : `controle/ctl2-soir-paysage.jpg`, `controle/ctl2-nuit-pluie-orage-roule.jpg`, `controle/ctl2-portrait.jpg`. Captures brutes, `comptes`, empreintes et `journal.txt` dans `controle/brut2/`.

## Tour 3 : réponse au contrôle du tour 2

**Défaut 1, le soir braise : corrigé et mesuré.** J'ai pris le soleil or conseillé et je l'ai mesuré. Seul, il ne suffisait pas : g11 en course descendait à 64 % de pixels orange vif, pour une cible sous 50 %. J'ai donc ajouté la clé qui manquait, la **teinte de la roche** `cyT`. C'est un uniforme `uRkT` qui existe déjà, multiplié une fois dans le fragment, et chaque ambiance du canyon a déjà le sien (`biomes.js`, l'équilibre du soir pose [1,.95,.93]). Aucune instruction n'est ajoutée. Valeurs du commit : `sunC` [1,.68,.44], `cyL` [.90,.63,.50], `fog` [.82,.52,.58], `hemiG` [.31,.24,.31], `cyC` [1,.68,.50], `cyT` [.94,.99,1.10]. L'horizon or `cyH` est gardé et `sat` n'est pas touché.

Mesure du contrôle (`stats3.cjs`) sur le haut de l'image (lignes 12-50 %) : part de pixels orange vif (R>200 et B<90), R−B moyen, luminance L. Les trois jeux sont chargés dans le même passage. Cibles du contrôle : moins de 35 % pour g3, moins de 50 % pour g11, R−B ≤ 100, L à ±3 %.

| soir, haut de l'image | avant : orange vif / R−B / L | tour 3 : orange vif / R−B / L | sans=canyonfini |
|---|---|---|---|
| g3 en course, paysage | 53 % / 127 / 119,3 | **15 %** / 81 / 123,1 | 52 % / 127 |
| g11 en course, paysage | 74 % / 156 / 125,0 | **43 %** / 119 / 131,8 | 78 % / 163 |
| g7 en course, paysage | 56 % / 132 / 119,2 | **24 %** / 87 / 121,4 | 57 % / 132 |
| g3 en course, portrait | 45 % / 122 / 118,7 | 19 % / 74 / 121,3 | 45 % / 122 |
| g11 en course, portrait | 69 % / 135 / 124,7 | 53 % / 93 / 129,6 | 67 % / 131 |
| g3 vue 900, paysage (figée) | 27 % / 104 / 105,4 | 0 % / 57 / 106,8 | identique à avant |
| g11 vue 900, paysage (figée) | 26 % / 106 / 106,1 | 1 % / 62 / 106,8 | identique |
| g7 vue 900, paysage (figée) | 32 % / 112 / 101,8 | 5 % / 73 / 104,3 | identique |
| g3 vue 2600, portrait (figée) | 77 % / 153 / 113,9 | 36 % / 102 / 115,9 | identique |
| g7 vue 2600, portrait (figée) | 69 % / 159 / 114,1 | 45 % / 110 / 119,6 | identique |

- Tenu : g3 sous 35 %, g11 sous 50 %, R−B ≤ 100 sur g3 et g7.
- **Pas tenu : R−B de g11 en course, 119 pour une cible ≤ 100** (avant : 156). Il y a aussi g11 en portrait en course, à 53 %. Avec une variante plus forte (V3 : `sunC` [1,.70,.50], `cyT` [.90,.96,1.16]), g11 descend à 26 % et R−B à 106, toujours au-dessus de 100. Sur les vues figées, la roche tournait alors au saumon beige : c'est le « délavé » que Sacha refuse. Je ne l'ai pas gardée (`brut3/stats-variantes.txt`).
- Luminance : sur les vues figées, +0,7 à +2,5 % ; +4,9 % sur g7 vue 2600 portrait (114,1 → 119,6), hors des ±3 %. En course, +1,3 à +5,4 %, mais le bruit d'un chargement à l'autre y est de 2 à 4 points (sans contre avant). J'avais préparé un soleil un cran plus bas (`sunC` [.97,.66,.43]) pour le compenser. Le banc avait 15 sessions en attente et il n'a pas tourné en plus d'une heure : **il n'est pas mesuré et pas commité.**
- À l'œil, regardé : en vue figée, les parois au soleil sont maintenant du grès doré rosé, plus la braise. En course, la paroi reste chaude mais orangée-dorée, et le ciel violet et l'or de l'horizon restent là. La route lavande et l'argent restent lisibles, sans masse noire ni banding. En gros plan portrait de g3 (vue 2600), la paroi à contre-jour reste rouge-orangé : c'est la limite de ce réglage.

**Défaut 2, la pluie sage (non bloquant) : corrigé.** La route mouillée passe au bleu canard (`rtT` [1.05,1,.86] → [.82,1,1.14]). Le jaune des pièces ressort mieux sur ce bleu que sur le gris. Les bords turquoise restent lisibles, avec un peu moins de contraste. Mesure sur le bas de l'image (la route) : g11 en course, R−B 4 → −61 et chroma 20 → 80 (`brut3/stats-variantes.txt`, P1 = la valeur commitée). Sur tout le cadre, L −2 à −3 %. Variante P2, non retenue : plus vive, mais elle éclaircissait le haut de l'image (la roche mouillée) de 7 à 8 %.

**Coûts (tour 3, vue figée 900, `?tel=1`, `brut3/comptes.json`)** : 154 programmes partout, 124 textures (g3, g7) et 126 (g11), les mêmes que l'avant. Les appels sont égaux à l'avant sur soir g3 (108), g11 (123 ; un chargement avant a donné 131) et pluie g11 (116). Sur soir g7 et pluie g7, ils bougent de ±8 dans les deux sens entre avant, lot et sans : soir g7 lot 159 contre 151, pluie g7 sans 138 contre 146. C'est le même bruit que celui relevé par le contrôle. Les triangles restent à ±0,15 %. La clé `cyT` ne fait que remplir un uniforme déjà lu à chaque image. Console : 0 exception, 0 warn, 0 error sur les 18 chargements.

**Interrupteur** : `?sans=canyonfini` redonne l'ambiance d'avant, `dbgAmb` compris (`sunC` [1,.56,.30], `cyT` [1,.95,.93], pluie `rtT` [1.05,1,.86]). Écart moyen sans~avant en vue figée : 0,20 à 1,47 au soir, 0,35 à 0,98 sous la pluie (gouttes).

**Routes** : `outils/banc-routes/canyon.cjs graines=1-24 --brut`, aux paliers 0 et 2, donne les mêmes md5 dans `avant` et dans le lot (`621452dc…`, `9b1a4d46…`). Gardes : `--depuis-morceaux` met d'accord les 346 morceaux ; `garde-demarrage` (21 scripts), `garde-allege` et `garde-charte` sont OK. Le crochet d'essai `?cyessai=` qui a servi aux variantes est retiré du code commité.

**Pas vérifié au tour 3** : le vrai téléphone (rien vu). Je n'ai pas relancé la nuit ni l'orage, qui n'ont pas changé depuis le tour 2. Il n'y a qu'une seule mesure par cas (pas de répétition), et la boucle n'est pas figée par `dbgStep`. Le soleil un cran plus bas n'est pas mesuré.

**À décider par Sacha (tour 3)** :
1. Le soir en course sur g11 reste chaud (R−B 119). Il faut le juger sur la planche `soir-g11-paysage-avant-apres.jpg`. Pour aller plus loin, il faudrait V3, et la roche devient saumon.
2. La route bleu canard sous la pluie te va-t-elle ? La pluie est hors tirage.

## Contrôle adverse, tour 3

**Verdict : A_CORRIGER.** Le lot est propre et sans coût : diff, gardes, routes, interrupteur et console sont bons, et la pluie est typée sans perdre ses bords. Mais au soir, le remède retire la braise **en désaturant la roche**. Sur la paroi au soleil, le chroma baisse de 30 à 40 % : la roche n'est plus orange, elle tourne au vieux rose brun. C'est le « délavé » que Sacha refuse, et ce n'est pas le « grès doré » demandé. En plus, g11 en course reste au-dessus des cibles.

### Ce qui tient (exécuté)
- **Diff** `HEAD~1` = `ac903f88b` : `code/maps/canyon-relief.js` (5 lignes du bloc `CY_FINI_R`, des nombres seulement) et deux outils de banc. Le lot depuis `a0d9f3094` = le même fichier de la map et des outils. Ni `index.html` ni `sw.js`, aucune garde `IS_MOBILE`, aucune texture, aucun mesh, aucun GLSL. `cyT` remplit `uRkT`, qui existe déjà (`canyon-relief.js:382`).
- **Assemblage** `--depuis-morceaux` : 346 morceaux d'accord. `garde-demarrage` (21 scripts), `garde-allege` et `garde-charte` sont OK. Compilation vm : 1 erreur au script n° 5, la même dans `avant` (faux positif connu). `const CY_FINI=` et `const CY_FINI_R=` ne sont déclarés qu'une fois.
- **Routes** : `canyon.cjs graines=1-24 --brut`, paliers 0 et 2, md5 identiques entre avant et le lot (`621452dc…`, `9b1a4d46…`). Dans le vrai jeu, `dbgTrace` + FNV : 40/40 égaux (`controle/brut3/empreinte-*.json`, fichiers identiques au `cmp`).
- **Banc** sous verrou « finition-canyon » (10:08-10:14, `outils/banc-routes/canyon-finition/ctl-tour3.mjs`, non commité), `?tel=1`, 844×390 et 390×844. Cas : soir g3, g7, g11 ; pluie g7, g11 ; nuit g7. Trois jeux à chaque fois (avant, lot, `sans`), 108 photos.
  - Comptes (vue 900) : 154 programmes partout ; textures 124/126, égales à l'avant. Les appels bougent de ±8 dans les deux sens, `sans` compris (soir g7 : sans 159 contre 151 pour avant ; nuit : lot 152 contre 144, sans 144). Triangles à ±0,2 %. Rien n'est imputable au lot.
  - Console : 0 exception, 0 warn, 0 error sur les 18 chargements.
  - Interrupteur, écart moyen `sans`~avant à vue figée : 0,29-1,09 (soir), 0,38-0,59 (pluie), 0,30-0,39 (nuit). `dbgAmb` redonne l'ambiance d'avant. ✔
  - Les chiffres « orange vif » de la NOTE du tour 3 sont reproduits à ±1 point près (g3 53→16 %, g7 56→24 %, g11 78→43 %, g11 portrait 68→53 %).
  - Pluie : route bleu canard. Le contraste entre les bords turquoise et la route est mesuré en Lab (rail moyen contre route) : dL inchangé (22→22, 27→28, 41→38), ΔE 41→34 sur g11 en vue, 67→76 sur g7 en course. Les bords restent lisibles, les pièces aussi. Typé, accepté (et hors tirage).

### Défauts (reproductibles)
1. **Soir : la roche se délave au lieu de dorer.** `canyon-relief.js:139`, la clé `cyT:[.94,.99,1.10]` ajoute du BLEU à une roche orange, ce qui la rapproche du gris. Mesures sur le haut de l'image (les parois), en vue figée 900 paysage :
   - g3 : chroma 113 → 68 (−40 %) ;
   - g7 : chroma 123 → 86 (−30 %) ;
   - sur l'image entière en course, g3 100 → 70 et g7 91 → 73.
   À l'œil (`controle/ctl3-soir-g7vue-g11course-zoom.jpg`, en haut), la paroi gauche de g7 passe d'un orange vif à un brun rosé terne : ni braise ni or. La baisse du taux d'« orange vif » vient surtout de pixels qui passent juste sous le seuil B<90, pas d'un vrai virage vers l'or.
   → **Conseil (une passe)** : faire virer la roche vers l'OR (plus de vert, bleu bas) au lieu de la refroidir. `cyT` [.94,.99,1.10] → environ [.96,1.05,.95]. Garder `sunC` [1,.68,.44] et le reste. Le froid doit rester dans l'ombre (`hemiS`, `fillC`) et dans le ciel, déjà violets. Cibles : chroma des parois en vue figée à ≥ 90 % de l'avant ; orange vif < 35 % pour g3 et < 50 % pour g11 en course, paysage ET portrait.
2. **Soir g11 en course : encore hors cible.** R−B du haut de l'image 119 (cible ≤ 100) ; en portrait, orange vif à 53 % (cible < 50 %). Sur la planche, la paroi de g11 reste orange saumon.
3. **Luminance au-delà de ±3 %** (haut de l'image, en portrait) : g11 en course 122,8 → 129,6 (+5,5 %), g7 en course 130,7 → 135,7 (+3,8 %), g7 vue 2600 109,9 → 114,4 (+4,1 %, image entière). Le soleil « un cran plus bas » préparé par l'auteur (`sunC` [.97,.66,.43]) n'a toujours pas été mesuré.

### À l'œil (regardé : `controle/ctl3-soir-course-paysage.jpg`, `ctl3-portrait.jpg`, `ctl3-pluie-paysage.jpg`, `ctl3-soir-g7vue-g11course-zoom.jpg`)
- Soir en course, paysage : g3 et g7 sont moins braise, avec un ciel violet et une route lavande lisible. C'est mieux qu'avant, mais pâle (pêche, rose poudré) plutôt que doré.
- Soir en portrait : g3 et g11 en course restent presque identiques à l'avant. Le lot ne se voit guère dans ce format.
- Pas de masse noire, pas de banding, et le HUD reste lisible partout. La nuit est inchangée depuis le tour 2 (L −1 à −4 %, chroma +3 à +8 %).
- Les planches de l'auteur (9 JPEG, 133-375 Ko, paysage et portrait) sont lisibles et conformes à mes captures. La NOTE ne contredit pas mes mesures sur les nombres, mais elle tait la perte de chroma de la roche (−30 à −40 %).

### Pas vérifié par moi
Le vrai téléphone, le matin (non touché), l'orage (inchangé depuis le tour 2) et le portail. La boucle n'était pas figée par `dbgStep` (d'où les ±8 appels). Une seule mesure par cas.
Captures brutes, `comptes.json`, empreintes et `journal.txt` : `controle/brut3/`.

## Tour 4 (19/11) : réponse au contrôle du tour 3

Le passage de banc a eu lieu le 19/11 de 17:57 à 18:03, sous le verrou « finition-canyon », en `?tel=1`, 844×390 et 390×844 ×2. Les six jeux ont été chargés dans le même passage : avant, `sans=canyonfini`, W1 (le conseil du contrôle : `cyT` [.96,1.05,.95]), W2 (W1 avec un soleil plus bas, [.97,.66,.43]), **W3 (retenu)** et Q1 (la pluie, retenue). Les valeurs commitées sont exactement celles de W3 et de Q1, posées par le même `Object.assign`. Les variantes passaient par un crochet `?cyessai=` provisoire, **retiré du code commité**. Au total : 18 chargements, 0 échec, 0 erreur, 0 warn.

Après ce passage, **le disque est tombé à 0,9 Go libre**, à cause d'autres sessions (mes captures faisaient 76 Mo). Comme le prévoit la règle, j'ai arrêté les bancs et effacé les PNG bruts. Je n'ai donc fait aucun second passage pour affiner. Il ne reste que les mesures (`brut4/mesures-tour4.txt`, `brut4/comptes.json`, `brut4/journal.txt`) et les planches JPEG.

**Nouvel outil : `outils/banc-routes/canyon-finition/mesure-couleurs.cjs`.** Il mesure par tiers d'image (haut, milieu, bas) et sur le cadre entier :
- L : la luminance ;
- C : le chroma Lab C*ab, qui sert à repérer le terne et le délavé ;
- R−B ;
- ov : la mesure des contrôles, R>200 et B<90 ;
- **rouge** : la braise, des pixels vifs de teinte 0-30° ;
- **or** : des pixels vifs de teinte 30-55° ;
- **brûlé** : les trois canaux au-dessus de 245, l'éblouissement.

Ce qui compte : la mesure « ov » met l'or et la braise dans le même compte. Une roche qui DORE reste donc « orange vif » pour ov. C'est la mesure « rouge » qui sépare les deux.

### Ce qui change au tour 4
| clé | tour 3 → tour 4 | avant le lot |
|---|---|---|
| `canyonSoir.cyT` (teinte de la roche) | [.94,.99,1.10] → **[.94,1.06,.92]** (de l'or, plus de froid ajouté) | [1,.95,.93] |
| `canyonSoir.sunC` (soleil) | [1,.68,.44] → **[.97,.70,.42]** (un cran plus bas, plus or) | [1,.56,.30] |
| `canyonSoir.cyH` (horizon) | [1,.58,.32] → **[1,.64,.36]** | [1,.50,.26] |
| `canyonPluie.rtT` (route mouillée) | [.82,1,1.14] → **[.76,1.04,1.10]** (du bleu vers le canard) | [1.05,1,.86] |

Le reste du lot n'a pas changé : les ombres, le remplissage et le ciel bleu-violet, la brume corail, la nuit et l'orage.

### Soir : avant → tour 4, sur le tiers HAUT de l'image (parois et ciel)
| cas | L | C (chroma Lab) | R−B | ov | rouge | or |
|---|---|---|---|---|---|---|
| g3 en course, paysage | 111,3 → 114,5 (+2,9 %) | 58,2 → 40,4 (−31 %) | 124 → 83 | 45 → 11 % | 81 → 58 % | 0 → 12 % |
| g7 en course, paysage | 122,5 → 127,1 (+3,8 %) | 67,9 → 47,2 (−30 %) | 166 → 119 | 75 → 25 % | 96 → 66 % | 0 → 26 % |
| g11 en course, paysage | 129,8 → 138,1 (**+6,4 %**) | 67,3 → 50,2 (−25 %) | 162 → **121** | 76 → 46 % | 91 → 63 % | 0 → 26 % |
| g3 en course, portrait | 110,5 → 114,6 (+3,7 %) | 66,5 → 45,8 (−31 %) | 159 → 114 | 68 → 23 % | 88 → 79 % | 0 → 1 % |
| g7 en course, portrait | 132,7 → 139,7 (+5,3 %) | 59,2 → 40,7 (−31 %) | 148 → 99 | 72 → 22 % | 87 → 39 % | 0 → 37 % |
| g11 en course, portrait | 133,2 → 145,3 (**+9,1 %**) | 70,1 → 58,8 (−16 %) | 153 → 117 | 78 → **63 %** | 80 → 46 % | 0 → 32 % |
| g3 vue 900, paysage (figée) | 92,2 → 95,1 (+3,1 %) | 41,9 → 26,6 (−37 %) | 88 → 56 | 5 → 2 % | 58 → 6 % | 0 → 14 % |
| g7 vue 900, paysage | 87,8 → 92,3 (+5,1 %) | 46,6 → 33,6 (−28 %) | 96 → 70 | 9 → 2 % | 59 → 31 % | 0 → 8 % |
| g11 vue 900, paysage | 92,3 → 95,0 (+2,9 %) | 44,1 → 29,4 (−33 %) | 93 → 62 | 6 → 2 % | 62 → 14 % | 0 → 9 % |
| g7 vue 2600, portrait | 98,9 → 106,1 (+7 %) | 59,5 → 43,4 (−27 %) | 136 → 100 | 44 → 25 % | 74 → 65 % | 0 % |

Sur le cadre entier, le chroma Lab baisse aussi : g11 en course 42,5 → 37,3 et g7 en course 38,2 → 31,7. Aucun pixel brûlé nulle part (0 %, avant comme après).

### Les défauts du contrôle, un par un
1. **« La roche se délave au lieu de dorer » : la teinte est corrigée, le chroma ne l'est pas.** La roche n'a plus de bleu ajouté. Elle vire à l'or : des pixels or (30-55°) apparaissent (0 → 12-37 %) là où il n'y avait que de la braise. Sur les planches, les parois sont ambre-ocre doré, plus du rose brun. Mais le chroma Lab des parois reste **−25 à −37 %** sous l'avant (cible du contrôle : −10 % au plus). Le banc montre que `cyT` n'en est **pas** la cause. W1, le conseil exact du contrôle, perd autant : g3 vue 41,9 → 27,4, g7 en course 67,9 → 49,1. W2 et W3 perdent aussi autant. La perte vient de l'ensemble du lot : un soleil moins orange, une brume corail et un remplissage bleu. Le « trop rouge » de l'avant ÉTAIT son chroma : la braise est la couleur la plus saturée de l'image. Retirer la braise sans perdre de chroma demanderait un or plus saturé (soleil à bleu plus bas, brume or au lieu de corail). Je l'avais préparé (X1 : `sunC` [.95,.64,.32], `cyT` [.93,1.03,.86], brume [.86,.58,.46]), **mais je ne l'ai pas mesuré** parce que le disque était plein.
2. **Soir g11 en course : toujours hors cible.** R−B du haut de l'image : 121 en paysage, pour une cible ≤ 100 (le tour 3 donnait 119 sur une autre bande). En portrait, ov est à 63 % (le tour 3 donnait 53 %, cible < 50 %). La cible R−B ≤ 100 et la cible « chroma à −10 % au plus » se contredisent sur une paroi chaude : sur un pixel orange ou or, R−B est presque égal à son chroma. Ce qui baisse vraiment sur g11, c'est la braise : rouge 91 → 63 % en paysage et 80 → 46 % en portrait. Elle laisse la place à l'or.
3. **Luminance : pas tenue en course.** Elle monte de +2,9 à +6,4 % en paysage, et jusqu'à **+9,1 %** sur g11 en portrait. Sur les vues figées : +2,9 à +7 %. Le soleil un cran plus bas a été mesuré : W2, avec `sunC` [.97,.66,.43], ne retire que 1 à 3 points de L. La cause est l'or lui-même : à chroma égal, l'or est plus clair que la braise, parce que le vert pèse 0,59 dans L. Pour revenir à ±3 %, il faudrait un soleil vers 0,92. Ce n'est pas mesuré.
4. **NOTE muette sur la perte de chroma : corrigé.** Elle est chiffrée ci-dessus, tour 3 compris (le contrôle avait mesuré −30 à −40 %).
5. **Pluie, route grise : corrigé et mesuré.** Chroma Lab de la route (tiers bas) : 7,8 → **24,5** en course paysage, 22,2 → 27,9 en portrait, 10,9 → 29,3 en vue 900, 11,1 → 21,5 en vue 2600. R−B passe de 8 à −57 : un bleu canard. L baisse de −1 à −4 %. Les bords turquoise et les pièces restent lisibles (planches `pluie-g11-*`).

### Coûts (vue 900, `?tel=1`, `brut4/comptes.json`)
| cas | avant | sans | tour 4 |
|---|---|---|---|
| soir g3 : appels / triangles | 108 / 519 585 | 108 / 519 633 | 108 / 519 321 |
| soir g7 | 159 / 553 359 | 159 / 551 799 | 159 / 551 287 |
| soir g11 | 123 / 567 241 | 123 / 567 749 | 123 / 567 241 |
| pluie g11 | 116 / 529 943 | 116 / 529 771 | 116 / 529 459 |

On compte 149 programmes partout, et 124 textures (g3, g7) ou 126 (g11), avant comme après. Les triangles bougent de ±0,3 %, sans comme lot, en boucle non figée. Le tour 4 ne change que quatre nombres déjà lus chaque image.

### Interrupteur et gardes
- `sans=canyonfini` contre avant : les mêmes nombres à 0-1,5 près sur tous les cas (`mesures-tour4.txt`), et `dbgAmb` redonne `sunC` [1,.56,.30] et `cyT` [1,.95,.93].
- Routes : `canyon.cjs graines=1-24 --brut` donne le même md5 dans le lot et dans avant (`621452dc…`).
- `--depuis-morceaux` : 349 morceaux d'accord.
- `garde-demarrage` (21 scripts), `garde-texte-nu`, `garde-allege`, `garde-charte` et `garde-burnout` : OK.

### À l'œil (regardé : `soir-course-paysage-avant-apres.jpg`, `soir-vue-paysage-avant-apres.jpg`, `soir-portrait-avant-apres.jpg`, `pluie-g11-paysage-avant-apres.jpg`, `pluie-g11-portrait-avant-apres.jpg`)
- **Soir en course** : les parois passent de la braise rouge à l'ambre doré, avec le ciel violet et la route lavande. Lisible.
- **Soir en vue figée** : la roche est ocre doré, un peu terne et kaki au fond de g3, moins vive que l'avant.
- **Soir en portrait** : g3 reste presque comme avant. g7 et g11 dorent.
- **Pluie** : la route est bleu canard nette, plus du tout grise.
- Partout : pas de masse noire, pas de banding, pas d'aplat brûlé.

### Pas vérifié au tour 4
- Le vrai téléphone (rien vu).
- La nuit, l'orage et le matin : pas relancés, inchangés depuis le tour 3.
- Une seule mesure par cas, et une boucle non figée par `dbgStep`.
- La variante d'or saturé X1 et le soleil vers 0,92 : pas mesurés, faute de disque.

### À décider par Sacha
1. La paroi du soir : ambre doré moins saturé (tour 4) ou braise vive (avant) ? On ne peut pas avoir à la fois « moins rouge » et « autant de couleur » sans passer par un or plus saturé (X1, à mesurer).
2. La route bleu canard sous la pluie, à juger sur la planche.

## Contrôle adverse, reprise du 19/11, tour 1

**Verdict : A_CORRIGER.** Le lot reste propre et ne coûte rien : le diff ne touche que des nombres, les gardes passent, les routes sont identiques au bit près et l'interrupteur est fidèle. La nuit est neutre, la pluie et l'orage sont réussis. Mais **le soir, ambiance du tirage, est abîmé**. La braise a disparu, mais la roche n'est pas devenue un « grès doré » : elle tourne au **kaki-olive délavé**. Son chroma baisse de 25 à 40 %, sa luminance monte de 3 à 10 %, et g11 en course reste au-dessus de R−B 100. Trois cibles sur quatre ne sont pas tenues. L'auteur le reconnaît, et je le reproduis.

### Exécuté
- **Diff** `origin/main...HEAD` : `code/maps/canyon-relief.js` (+30 lignes : le bloc `CY_FINI_R`, des nombres seulement, posés par `eqApplique` avec les clés déjà lues) et `outils/banc-routes/canyon-finition/*`. On n'y trouve ni `index.html`, ni `sw.js`, ni `IS_MOBILE`, ni texture, ni mesh, ni GLSL. `canyon-route.js` et `canyon-murs.js` sont identiques à origin/main (dbc5f1d54).
- **Assemblage** `--depuis-morceaux` : 349 morceaux d'accord. `garde-demarrage` (21 scripts), `garde-texte-nu`, `garde-allege`, `garde-charte` et `garde-burnout` sont OK. Compilation vm : 1 erreur au script n° 5, la même dans `avant`. `const CY_FINI=` et `CY_FINI_R=` ne sont déclarés qu'une fois.
- **Routes** : `canyon.cjs graines=1-24 --brut`, md5 identiques entre avant et le lot, au palier 0 (`621452dc…`) comme au palier 2 (`9b1a4d46…`).
- **Banc** sous le verrou « finition-canyon », à 20:53 (`ctl-tour4.mjs`, non commité), `?tel=1`, 844×390 et 390×844. Cas : soir g3, g7 et g11, nuit g7, pluie g11, orage g3, avec trois jeux (avant, lot, `sans`). Le Mac était lent, le passage a dépassé 15 min et le verrou a été repris par `ville-cyber-j`. J'ai alors arrêté mon Chrome et effacé le profil. Le chargement « lot orage » a échoué (`__gameReady jamais levé`). Les images lot et `sans` de l'orage viennent d'un passage antérieur (20:44) du même scénario : je compare donc l'orage au **lot contre `sans`**, l'éclair rendant l'image d'avant non comparable.
  - **Comptes** (vue 900) : 149 programmes partout ; 124 textures (g3, g7) ou 126 (g11), égales. Les appels bougent dans les deux sens, `sans` compris (soir g7 : avant 151, lot 151, sans 159 ; nuit : avant 144, lot 152, sans 152). Triangles à ±0,3 %, géométries 541-592 en bruit. Rien n'est imputable au lot.
  - **Console** : 0 exception, 0 warn, 0 error sur 16 chargements.
  - **Interrupteur**, écart moyen `sans`~avant à vue figée : 0,6-1,1 (soir), 0,4-0,5 (pluie), 1,0-3,7 (nuit). Les mesures de `sans` égalent celles de l'avant au dixième. ✔
- **Mesures** (`outils/ctl-r1.cjs` sur `mesure-couleurs.cjs`, non commité). Elles reproduisent celles de l'auteur à ±1.

| soir, tiers HAUT | L avant → lot | C avant → lot | R−B | rouge | or |
|---|---|---|---|---|---|
| g3 vue 900 paysage | 92,4 → 95,4 (+3 %) | 42,0 → 26,6 (**−37 %**) | 89 → 56 | 58 → 6 % | 0 → 14 % |
| g3 vue 900 portrait | 91,4 → 92,6 | 39,4 → 23,8 (**−40 %**) | 87 → 52 | 54 → 4 % | 0 → 5 % |
| g7 course paysage | 122,8 → 127,3 (+4 %) | 68,3 → 47,6 (−30 %) | 167 → 120 | 96 → 66 % | 0 → 27 % |
| g7 course portrait | 133,5 → 140,8 (+5 %) | 59,8 → 41,1 (−31 %) | 151 → 102 | 88 → 41 % | 0 → 40 % |
| g7 vue 900 portrait | 102,7 → 112,1 (**+9 %**) | 58,5 → 43,6 (−25 %) | 132 → 104 | 79 → 67 % | 0 → 2 % |
| g11 course paysage | 129,8 → 136,4 (+5 %) | 67,4 → 49,3 (−27 %) | 162 → **111** | 92 → 58 % | 0 → 24 % |
| g11 course portrait | 133,3 → 144,7 (**+9 %**) | 69,9 → 57,9 (−17 %) | 152 → **112** | 80 → 45 % | 0 → 30 % |

Nuit g7 : L −1 à −2 %, chroma +7 à +25 % (haut +14 → +18 à +21 %), R−B identique. Pluie g11, route (tiers bas) : C 7,3 → 22,7 en course paysage, 10,5 → 29,4 en vue, L −3 à −4 %. Orage g3, lot contre `sans` : C 25,4 → 40,6 (vue 900, cadre entier), L −2,5 %. Aucun pixel brûlé (> 245) nulle part, avant comme après.

### Défauts (reproductibles)
1. **Soir : la roche tourne au kaki-olive au lieu de dorer** (`canyon-relief.js:139`). Je l'ai regardé sur `controle/ctlR1-soir-paysage.jpg` (g3 vue 900) et sur `controle/ctlR1-portrait.jpg` (g3 vue, portrait) : les parois de g3 prennent des plaques beige-vert sales, et l'image est plus terne que l'avant. Le vert de `cyT:[.94,1.06,.92]` (G > R), mêlé à la brume corail-mauve `fog:[.82,.52,.58]` et au remplissage bleu `fillC:[.36,.42,.80]`, verdit la pierre. Le chroma recule de 25 à 40 %, pour une cible de −10 %. Ce n'est pas le niveau des étalons nuages et ville : c'est moins beau qu'avant, pas seulement différent.
   → **Conseil (non mesuré)** : ne plus monter le vert, baisser le bleu : `cyT` ≈ [1.0,.98,.80]. Rendre la brume chaude et saturée au lieu de corail-mauve : `fog` ≈ [.88,.58,.40], `fogIn` ≈ [.96,.80,.66]. Mesurer aussi la variante X1 préparée par l'auteur (`sunC` [.95,.64,.32]). Cible : chroma des parois en vue 900 ≥ 90 % de l'avant, sans pixel vert (teinte 55-90°).
2. **Soir g11 en course : R−B 111-112** (paysage et portrait), pour une cible ≤ 100. ov est à 41,6 % en paysage et 58,4 % en portrait (cible < 50 %).
3. **Luminance** : +3 à +9 % sur le soir (g11 en course portrait 133,3 → 144,7 ; g7 vue 900 portrait 102,7 → 112,1). Cible ±3 %. Essayer `sunI` ×0,93 dans `canyonSoir`, un nombre seulement.
4. *(non bloquant)* Le chargement « lot orage g3 » a échoué une fois sur un Mac saturé (`__gameReady` absent au bout de 180 s). Il avait chargé dans le passage de 20:44 : je le classe comme un délai, mais une seule fois.
5. *(non bloquant)* `controle/` contient 13 JPEG pour une limite de 6. Les 10 anciens viennent des tours 1 à 3 ; j'en ajoute 3.

### À l'œil
- **Soir** : la braise rouge est bien partie et le ciel violet est joli, mais la roche est plus pâle, entre pêche, ocre et kaki. Il faut juger g3 en vue figée.
- **Nuit** : presque identique, un rien plus bleu-violet. Ni plus sombre ni plus terne.
- **Pluie** : la route bleu canard est nette, les bords turquoise et la voiture restent lisibles. C'est mieux.
- **Orage** : les parois et la route passent au lilas-rose, plus colorées que l'avant gris-lavande, sans brûlé. Accepté.
- Nulle part : ni masse noire, ni banding, ni éblouissement, et le HUD reste lisible.

### Pas vérifié par moi
- Le vrai téléphone.
- Le matin (non touché).
- L'orage contre l'avant au même instant (l'éclair rend l'image aléatoire).
- Une seule mesure par cas, et des comptes à boucle non figée par `dbgStep`.
- Mes conseils de nombres ne sont pas mesurés.

Les PNG bruts sont effacés. Seuls restent les 3 JPEG `controle/ctlR1-*`.

## Correction 5, 20/11 : le soir doré et saturé (réponse au contrôle de la reprise)

**Ce qui change** : des nombres seulement, dans `CY_FINI_R.canyonSoir` (`code/maps/canyon-relief.js`). Nuit, pluie et orage : pas touchés.

| clé | tour 4 → correction 5 | avant le lot |
|---|---|---|
| `cyT` (teinte de la roche) | [.94,1.06,.92] → **[.92,1.08,.66]** : le vert qui dore est gardé, le BLEU (le gris) est coupé | [1,.95,.93] |
| `sunC` / `sunI` | [.97,.70,.42] / 1,782 → **[.97,.72,.34] / 1,604** (×0,90) | [1,.56,.30] / 1,782 |
| `sat` (saturation de l'image) | ,81 → **,972** (clé `sat:1.2`, multiplicatrice dans `eqApplique`) | ,81 |
| `fog` / `fogIn` (brume) | [.82,.52,.58] / [.94,.80,.82] → **[.88,.58,.40] / [.96,.80,.66]** (chaude au lieu de corail-mauve) | [.92,.52,.34] / — |
| `cyL` (rebond) | [.90,.63,.50] → **[.95,.58,.36]** | [1,.48,.30] |
| `hemiG` / `hemiS` | [.31,.24,.31] / [.34,.40,.66] → **[.38,.27,.24] / [.38,.36,.66]** | [.45,.25,.18] / — |
| `fillC` (remplissage) | [.36,.42,.80] → **[.46,.40,.78]** | — |
| `cyF` (fond de gorge) | [.72,.62,.80] → **[.82,.66,.66]** | — |
| `cyH` + `jHor` (horizon) | [1,.64,.36] → **[.98,.62,.46]** | [1,.50,.26] |
| `cyM` + `jMid` (milieu du ciel) | [.44,.30,.54] → **[.38,.28,.60]** | [.48,.30,.42] |

`dbgAmb('canyonSoir')` lu dans le jeu chargé : `sat` 0,972, `sunI` 1,604, `sunC` [.97,.72,.34], `cyT` [.92,1.08,.66] (graines 3, 7, 11).

### Méthode (quatre passages de banc, 20/11 de 14:04 à 15:19, chacun < 4 min, sous le mutex du groupe puis le verrou « finition-canyon »)
- `outils/banc-routes/canyon-finition/tour6.mjs` : l'avant chargé, le lot chargé, puis des variantes posées à chaud par `dbgAmb` (aucun crochet `?canyonessai=` dans le code). **AV** (l'ambiance d'avant posée à chaud sur le lot) redonne l'avant à ±1 % en vue figée : la pose à chaud vaut le chargement.
- 11 jeux mesurés : Y1 (le conseil du contrôle), X1, Y4, Y7, Z1-Z4, W1-W3. Ce qu'ils ont montré :
  - Y1 (`cyT` [1,.98,.80] + brume chaude, le conseil) : la braise REVIENT (or 0 %), chroma −8 à −31 %. Baisser le vert de `cyT` rend la roche rouge, pas dorée.
  - Y7 (sat ×1,16, soleil ×0,90, ciel et remplissage) : chroma +2 à +13 %, mais autant de braise que l'avant.
  - Z2-Z4 (le vert gardé, bleu coupé, sat ×1,12-1,18) : braise très basse, mais chroma −13 à −29 %.
  - **W2 retenu** (Y7 + `cyT` [.92,1.08,.66] + soleil [.97,.72,.34] + sat ×1,20) : le meilleur compromis entre chroma tenu et braise baissée.
- Puis un passage final avec les valeurs ÉCRITES dans le code (lot chargé), contre l'avant et `sans=canyonfini`. Les nombres ci-dessous viennent de ce passage (`brut5/mesures-t9.txt`).

### Soir, tiers HAUT de l'image : avant → tour 4 → correction 5
| cas | L | C (chroma Lab) | braise 0-30° | or 30-55° | R−B |
|---|---|---|---|---|---|
| g3 vue 900 paysage | 92,4 → 95,4 → **92,2** (0 %) | 42,0 → 26,6 → **38,1 (91 %)** | 58 → 6 → **22 %** | 0 → 14 → **19 %** | 89 → 56 → **84** |
| g3 vue 900 portrait | 91,4 → 92,6 → **89,4** (−2 %) | 39,4 → 23,8 → **34,1 (87 %)** | 54 → 4 → **18 %** | 0 → 5 → **18 %** | 87 → 52 → **77** |
| g7 vue 900 paysage | 87,9 → 92,4 → **89,1** (+1 %) | 46,6 → 33,6 → **43,6 (94 %)** | 59 → 31 → **41 %** | 0 → 8 → **7 %** | 96 → 70 → **93** |
| g7 vue 900 portrait | 102,7 → 112,1 → **106,1** (+3,3 %) | 58,5 → 43,6 → **55,3 (95 %)** | 79 → 67 → **73 %** | 0 → 2 → **3 %** | 132 → 104 → **132** |
| g11 vue 900 paysage | 92,4 → 95,2 → **92,4** (0 %) | 44,1 → 29,5 → **40,4 (92 %)** | 62 → 14 → **38 %** | 0 → 9 → **10 %** | 93 → 62 → **88** |
| g11 vue 900 portrait | 95,6 → 97,6 → **95,0** (−1 %) | 48,2 → 33,1 → **44,0 (91 %)** | 70 → 39 → **60 %** | 0 → 0 → **0 %** | 103 → 71 → **96** |
| g3 course paysage | 111,6 → — → **110,1** (−1 %) | 58,3 → — → **55,6 (95 %)** | 82 → — → **62 %** | 0 → **11 %** | 125 → **104** |
| g3 course portrait | 110,7 → — → **108,7** (−2 %) | 66,6 → — → **60,4 (91 %)** | 88 → — → **85 %** | 0 → **1 %** | 160 → **151** |
| g7 course paysage | 122,6 → — → **122,2** (0 %) | 68,1 → — → **62,9 (92 %)** | 96 → — → **66 %** | 0 → **27 %** | 167 → **160** |
| g7 course portrait | 132,6 → — → **117,7** (−11 %) | 59,1 → — → **62,9 (106 %)** | 86 → — → **74 %** | 0 → **11 %** | 148 → **150** |
| g11 course paysage | 129,8 → 136,4 → **132,1** (+2 %) | 67,3 → 49,3 → **64,7 (96 %)** | 91 → 58 → **66 %** | 0 → **24 %** | 162 → 111 → **154** |
| g11 course portrait | 133,2 → 144,7 → **136,6** (+3 %) | 70,1 → 57,9 → **72,8 (104 %)** | 80 → 45 → **49 %** | 0 → **30 %** | 153 → 112 → **142** |

(Les cases « — » du tour 4 en course : le tour 4 n'a pas été rechargé en course à ce passage ; ses chiffres en course sont dans la section du contrôle. En course, l'image dépend de l'instant : entre l'avant chargé et la même ambiance posée à chaud (AV), L variait jusqu'à ±6 % et C jusqu'à ±11 % ; la vue figée est la mesure fiable.)

Aucun pixel brûlé (> 245) nulle part, avant comme après. Aucun pixel vert-kaki (55-90°) au-dessus de 1 %.

### Les cibles
1. **Chroma des parois ≥ 90 % de l'avant : TENUE sur 11 cas sur 12.** Vue figée 87-95 % (tour 4 : 60-75 %), en course 91-106 %. Seul cas en dessous : g3 vue 900 portrait, 87 %.
   **Teinte ambre/or, pas kaki : TENUE en mesure** (vert 0-0,8 %, or 0 → 3-30 %). **À l'œil**, un reste de brun-olive en haut de la paroi de g3 en portrait, nettement moins que le tour 4 (planche `soir-vue-portrait-avant-apres.jpg`).
2. **g11 en course, R−B ≤ 100 : NON TENUE** (154 en paysage, 142 en portrait ; tour 4 : 111-112). R−B remonte parce que le chroma revient : sur une paroi chaude, R−B suit le chroma. **La braise, elle, baisse nettement : TENUE** (g11 course 91 → 66 % en paysage et 80 → 49 % en portrait, donc < 50 % ; vue figée 62 → 38 %). ov : 76 → 59 % en paysage, 78 → 72 % en portrait (ov compte l'or). Le tour 4 baissait davantage la braise (58 % / 45 %) mais au prix de 25-40 % de chroma : ce compromis a été refusé.
   Ailleurs, la braise baisse peu sur g3 en course portrait (88 → 85 %) et sur g7 vue portrait (79 → 73 %).
3. **Luminance ±3 % : TENUE en vue figée** (−2 à +3 % ; g7 portrait +3,3 %, à la limite), et en course sur 5 cas sur 6. g7 course portrait sort à −11 % : **non expliqué**. Le même jeu (W2) posé à chaud donnait +4 % sur ce cas au passage précédent, et AV y donnait −5 % : je soupçonne l'instant de course, sans pouvoir le prouver.

**Aucun jeu mesuré ne tient à la fois « braise très basse » et « chroma ≥ 90 % ».** Les jeux qui coupent le plus la braise (Z3, Z4) perdent 13 à 29 % de chroma. W2 tient le chroma et réduit la braise de 10 à 40 points selon le cas.

### Coût (`?tel=1`, vue figée 900, chargements neufs, `brut5/journal-t9.txt`)
| graine | avant | lot (correction 5) | sans |
|---|---|---|---|
| g3 : appels / triangles | 108 / 519 561 | 108 / 519 681 | 108 / 519 609 |
| g7 | 151 / 550 143 | 151 / 550 759 | 159 / 551 015 |
| g11 | 123 / 567 989 | 123 / 568 301 | 123 / 567 217 |

149 programmes partout ; 124 textures (g3, g7) ou 126 (g11), partout ; géométries 508-596, bruit de la boucle non figée (le `sans` en a autant). Zéro erreur ou avertissement de console sur les 9 chargements. Des nombres d'ambiance seulement : zéro shader, texture, appel ou triangle.

### Interrupteur, routes, gardes
- `sans=canyonfini` contre l'avant (vue figée paysage, g3, g7, g11) : L, C, R−B, braise identiques à 0,1 près.
- Routes : `canyon.cjs graines=1-24 --brut` donne le même md5 dans le lot et dans avant (`621452dc…`).
- `--depuis-morceaux` : 349 morceaux d'accord ; `garde-demarrage` (21 scripts), `garde-texte-nu`, `garde-allege`, `garde-charte`, `garde-burnout` : OK.
- Le banc (`banc.sh`, `pilote.mjs`) prend maintenant le mutex du groupe et rend SA place du verrou à deux places (plus `verrou-banc.sh rendre`).

### À l'œil (regardé : `soir-vue-paysage-avant-apres.jpg`, `soir-vue-portrait-avant-apres.jpg`, `soir-course-paysage-avant-apres.jpg`, `soir-course-portrait-avant-apres.jpg`)
- **Vue figée** : la paroi passe du rose-brique (avant) et du beige délavé (tour 4) à un ocre ambre doré, saturé. La route, plus saturée (sat ×1,2), tire au lavande-violet ; elle reste lisible, avec ses bords turquoise et les pièces.
- **En course** : les parois restent vives, d'un orange-or plutôt que rouge-rose ; le ciel violet de g11 est conservé.
- Pas de masse noire, pas de banding, pas d'aplat brûlé. Un reste de brun-olive en haut de g3 en portrait.

### Pas vérifié
- Le vrai téléphone (rien vu).
- La nuit, la pluie, l'orage et le matin : non relancés (leurs nombres n'ont pas changé ; `sat` n'est touché que sur `canyonSoir`).
- Une seule image par cas ; en course, l'instant de la photo varie (écarts AV/avant jusqu'à ±6 % de L).
- Le tour 4 n'a été re-photographié qu'en vue figée.

### À décider par Sacha
- La paroi du soir en ocre doré saturé (correction 5) : mieux que l'avant ? Elle reste chaude-orangée en course, moins rouge.
- La route plus violette au soir (effet de la saturation ×1,2) : à juger sur les planches.

## Contrôle adverse au banc, 20/11

**Verdict : A_CORRIGER.** Lot contrôlé : la correction 5 (`aee197455`). Un seul passage de banc, de 15:54 à 16:00, sous le mutex du groupe puis le verrou « finition-canyon ». Script : `outils/banc-routes/canyon-finition/ctl-tour5.mjs` (non suivi), lancé par `banc.sh`. Vrai jeu en `?tel=1`, formats 844×390 et 390×844 en ×2. Jeux comparés : avant, lot et `sans`. Graines du soir : g5, g17 et g23 (choisies par le contrôle), plus g7 (une graine de l'auteur). Vues figées s900 et s2600, puis deux prises en course (s = 2200). Pour la non-régression : nuit g17, pluie g17, orage g23 et matin g17. Mesures : `mesure-couleurs.cjs` par tiers. Sorties : `controle/brut6/` (comptes.json, stats.txt, journal).

### Ce qui tient
- **Diff** : il ne touche que des nombres de `CY_FINI_R.canyonSoir` (canyon-relief.js:149-150), plus des commentaires. Aucune texture, aucun maillage, aucune ligne de GLSL. Ni index.html ni sw.js.
- **Assemblage et gardes** : `--depuis-morceaux` donne 349 morceaux d'accord. garde-demarrage (21 scripts), garde-allege et garde-charte : OK. L'échec de compilation vm du « script 5 » est un faux positif de l'extracteur : un commentaire contient le texte `<script`. Le même échec se produit dans avant.
- **Routes** : `canyon.cjs graines=1-24 --brut`, paliers 0 et 2, donnent les mêmes md5 dans avant et dans le lot (`621452dc…` et `9b1a4d46…`).
- **Coût** (vue figée 900) : 149 programmes partout, et les mêmes textures (124 ou 125). Appels identiques pour g5 (118), g7 (151) et g23 (139). Pour g17, avant 145 contre lot 137. Au passage coupé de 15:28, c'était l'inverse (137 contre 145) : c'est du bruit de la boucle. Console : 0 erreur et 0 avertissement sur les 15 chargements.
- **Interrupteur** : `sans=canyonfini` contre avant (g17, soir) donne L, C, R−B, braise et or identiques à 0,0 près sur les trois tiers, en vue figée paysage et portrait. Les pixels diffèrent par endroits (particules, HUD), mais pas les moyennes.
- **Le −11 % de g7 en course portrait** : rejoué deux fois, il donne L du haut 133,3 → 136,3 (+2 %) puis 134,6 → 138,5 (+3 %). Ce n'est pas un assombrissement réel : c'était l'instant de course.
- **Nuit, pluie, orage** : sans régression. Nuit g17 en vue figée : L −1 à −2 %, C +6 à +15 %. La route reste bleu électrique. Pluie : route bleu canard (C du bas 10 → 27-33), L −3 %. Orage : violet, L −1 à −6 %. 0 % brûlé partout.
- **Distinction des ambiances** : le soir (route bleu-violet, parois ocre) reste bien distinct du matin (route beige, parois orange) et de l'orage (violet sombre).
- **Route du soir** : bleu-violet plus saturé, bords turquoise et pièces nets. Elle est lisible et pas criarde. Sur g5 en vue figée, elle tire au lavande uni (non bloquant).

### Défauts
1. **BLOQUANT. Ombres de la paroi vert mousse, kaki sale (g17, soir, les deux formats).** Les faces à l'ombre, brun-ardoise avant, deviennent vert-olive foncé.
   - Part de pixels verdâtres dans la moitié haute (teinte 65-170°, s > ,15, v > ,12), avant → lot : g17 s900 portrait 0,5 → **25,7 %**, g17 s2600 paysage 0,3 → **28,0 %**, g17 s900 paysage 0,2 → 10,2 %, g7 s2600 portrait 0,2 → 9,7 %.
   - La mesure `vert` de mesure-couleurs.cjs ne voit pas ce défaut : elle ne compte que les pixels clairs (max > 76 et v > ,3). C'est pourquoi la NOTE annonce « kaki 0-0,8 % ».
   - Planche : `controle/ctl6-ombre-verte.jpg` (et `ctl6-portrait-vue.jpg`, première paire).
   - Cause probable : `cyT [.92,1.08,.66]` avec `sat` ×1,2 (canyon-relief.js:149) teinte le gris-ardoise de l'ombre (`ard`) en vert.
   - Piste **non mesurée** : remonter le bleu et baisser le vert de cyT, vers [.95,1.02,.80], ou bien laisser cyT et compenser l'ombre. Il faut vérifier sur g17 avec un compteur qui inclut les pixels sombres.
2. **BLOQUANT pour la demande. En course, sur les graines que l'auteur n'a pas choisies, le soir n'est pas moins rouge.** Braise (0-30°) du haut, avant → lot :
   - g17 : 81,6 → 83,5 % puis 83,8 → 81,2 % en paysage ; 62,7 → 57,7 % en portrait.
   - g23 : 90,8 → 86,5 %, 85,3 → 76,5 %, puis 91,2 → 88,1 % et 91,0 → 90,1 % en portrait.
   - À l'œil, les images de course de g17 et g23 sont presque les mêmes qu'avant (`ctl6-course-paysage.jpg`).
   - Seule g7, la graine de l'auteur, baisse nettement : 96 → 58 et 68 % en paysage, 88 → 39 et 41 % en portrait. Sur g7, la paroi passe à l'or-jaune.
   - En vue figée, la braise baisse partout (g17 51 → 32 %, g23 57 → 29 %, g5 57 → 40 %).
   - Le gain n'est donc pas général là où le joueur regarde.
3. Non bloquant. Le chroma du haut en vue figée descend sous 90 % de l'avant sur g17 paysage (−11 %), g23 paysage (−12 %), g23 portrait (−11 %) et g5 portrait (−13 %). Ce n'est pas délavé à l'œil : les parois passent d'un rouge-orange à un ocre plus jaune.
4. Non bloquant. R−B du haut en course : 141-173 (cible ≤ 100 non tenue). À l'image, ce chiffre n'est pas un défaut en soi : sur g7 la paroi est dorée avec R−B à 157-173. Le vrai défaut est le point 2.

### Pas vérifié
Le vrai téléphone. Le midi. La pluie et l'orage en portrait sur une seconde graine. L'avant de la nuit en course n'a été pris qu'une fois : le −12 % de L du haut en course nuit paysage (vue figée −1 %) n'a pas été rejoué, et il est très probablement dû à l'instant de course, ce lot n'ayant pas touché la nuit. Les comptes ne sont pris qu'en vue figée 900.
