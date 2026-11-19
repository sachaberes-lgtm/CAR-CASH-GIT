# LOT « PROGRAMMES2 » — LES PROGRAMMES EN DOUBLE (15/11)

Branche `qa/programmes2`. Suite du diagnostic `programmes.md`. But : moins de programmes de shader liés sous le serpent, sans changer un pixel.

## Ce qui est fait
Tout est derrière un seul drapeau : `PROG_DOUBLE = TEL_NATIF && !?sans=progdouble` (`code/rendu/soleil-planete.js`, à côté de `__ccVao`).
L'ordinateur ne passe par aucune ligne nouvelle. `?sans=progdouble` rend le comportement d'avant.

1. **three : la clé de cache ne compte plus ce que la source ne lit pas.** `VERSION PRINCIPALE/vendor/three.min.js`, fonctions `ccPD` / `ccPDi`, appelées à la fin de `getParameters` seulement si `self.__ccProgDouble===true`.
   - brouillard de la scène ignoré d'une matière `fog:false` ; `fogExp2`, `skinning` ramenés à vrai/faux ; `combine` ignoré sans envMap ;
   - matière SANS `onBeforeCompile` : la source complète (#include résolus, vertex + fragment) est lue une fois (gardée dans une Map). Si elle ne contient aucun `NUM_…_LIGHT`, les nombres de lumières et d'ombres passent à 0. Aucun `SHADOWMAP` : pas de `USE_SHADOWMAP`. Aucun `DOUBLE_SIDED` : pas de `#define DOUBLE_SIDED`.
   - `vertexAlphas` : `false` et `undefined` donnent la même case dans la clé (`getProgramCacheKey`).
   - Pourquoi three en fabriquait deux : sa clé est faite de TOUS les paramètres (lumières de la scène, ombres, `side`, brouillard), même pour un MeshBasic qui n'en lit aucun. Une même matière vue dans deux scènes (menu à 4 lumières, scène nue du ciel) donnait deux programmes.
   - Le culling ne change pas : il est réglé par `material.side`, pas par le `#define`.
2. **Halo : les matières de passe jamais dessinées ne sont plus préparées.** `code/interface/vignette-moteur.js`, `lierPassesInutiles()` (lignes du halo seulement), lue par `lierPasses` ET `lierPassesPretes`.
   - écartés sur le chemin fusionné et plié : seuil, composite, copie et `basic` d'origine ; le 1er flou d'origine (remplacé par `_p0` + `_pv[0]`) ; les `_p2` hors `?bloom=plie2d` ; sous profil, les étages au-delà du maximum de la classe.
   - une matière écartée qui serait quand même dessinée se compile à son 1er dessin, comme avant la liaison douce.
3. **La caisse-nuage prend la clé des nuages du ciel.** `code/gameplay/zones-caisses.js` : `customProgramCacheKey` rend `'nuageV2'` sous `PROG_DOUBLE`. Même `nuageShader`, même source. `maps/` n'est pas touché.

Fichiers : `code/rendu/soleil-planete.js`, `code/interface/vignette-moteur.js`, `code/gameplay/zones-caisses.js`, `VERSION PRINCIPALE/vendor/three.min.js`, `outils/banc-demarrage/progdouble.cjs` (nouveau banc), ce rapport.

## Prouvé au banc (Chrome sans fenêtre du Mac, iPhone émulé, 15/11 23 h 46-23 h 53, sous le verrou)

### Nombre de programmes au lancement (`programmes.cjs`, `?tel=1&classe=1&palier=2&introapres=1`)
| | liés | sous le serpent | film |
|---|---|---|---|
| `?sans=progdouble` (avant) | **165** | 161 | 4 |
| par défaut (après) | **144** | 140 | 4 |

- 21 de moins : 13 réunis par la clé (12 groupes ; dans 3 d'entre eux un programme né dans `maps/` est partagé, sans toucher `maps/`), 8 du halo jamais préparés (le 9e, `basic`, est aussi réuni).
- Jumeaux EXACT restants : 0. INERTES restants : 1 groupe, tout `maps/` (`orbite-2.js` 484/485, `vertexColors` vrai/faux : `USE_COLOR` est lu par le préfixe, pas touché).
- Avec `lancement.cjs` (sans `classe=1`) : `dbgLier().lances` 163 → 144, `dbgChauffe().programmes` 165 → 146.
- Tableau d'après : `programmes2/tableau-apres.md`.

### Preuve par les sources (les deux relevés bruts, comparés programme par programme)
- Chaque source finale des 144 programmes d'après existe à l'identique dans les 165 d'avant, une fois retirées les lignes `#define DOUBLE_SIDED / USE_SHADOWMAP / SHADOWMAP_TYPE_*` dont le jeton n'est lu nulle part dans la source (et le nom `SHADER_NAME`).
- 0 source nouvelle. 0 doublon restant parmi les 144.
- 8 sources d'avant absentes d'après : les 8 matières du halo qui ne sont jamais dessinées.

### Preuve au pixel (`outils/banc-demarrage/progdouble.cjs`, `?appareil=iPhone14,2`, classe 1 BASSE N1)
Méthode : même page, même image figée (rAF coupé, horloge figée, hasard semé). On lit le tampon de l'écran (readPixels) 4 fois dans chaque état :
A = interrupteur allumé, B = éteint (toutes les matières marquées `needsUpdate` : les programmes d'avant renaissent), C = rallumé.
« A/B » = le plus petit écart entre un dessin de A et un dessin de B. « bruit » = écart entre deux dessins de même phase dans A.

| scène | programmes A / B | A/B | A/C | bruit dans A |
|---|---|---|---|---|
| menu (debout) | 149 / 178 | **0 pixel** | 0 | 0 |
| garage (debout) | 179 / 205 | **0 pixel** | 0 | 0 |
| boutique (debout) | 220 / 226 | **0 pixel** | 0 | 0 |
| course nuages, pas 60 (debout) | 148 / 197 | **0 pixel** | 0 | 0 |
| course nuages, pas 150 | 197 / 197 | **0 pixel** | 0 | 0 |
| course nuages, pas 300 | 197 / 197 | **0 pixel** | 0 | 2 px (±1) |
| course canyon, pas 90 (couché) | 148 / 195 | **0 pixel** | 0 | 76 px (±10) |
| course canyon, pas 240 | 195 / 199 | **0 pixel** | 0 | 35 px (±9) |
| course jade, pas 90 (couché) | 148 / 200 | **0 pixel** | 0 | 0 |
| course jade, pas 240 | 200 / 201 | **0 pixel** | 0 | 0 |

- 10 scènes sur 10 : au moins un dessin de A est égal au bit près à un dessin de B. 0 exception JS, 0 panne hors profil.
- Les PNG `…-partage.png` et `…-avant.png` sont identiques à l'octet (`cmp`) sur les 6 scènes contrôlées.
- Toile 780×1688 (debout) et 1688×780 (couché), 1,3 Mpx, aucun pixel noir.
- Détail : `programmes2/progdouble-*.json`.

À lire avec ces réserves :
- En course le même dessin refait n'est pas toujours identique à lui-même (nuages : deux images alternées ; canyon : jusqu'à 76 pixels qui bougent dans le MÊME état). C'est pourquoi le banc prend 4 dessins par état et garde le plus petit écart. Le 0 dit « les deux états produisent la même image », pas « chaque dessin est identique ».
- Jade : la pose avant mesure n'a pas convergé (« PAS STABLE ») ; les 4 dessins de chaque état sont pourtant égaux entre eux (bruit 0) et A = B = C.
- Un passage antérieur (19 h 22, ancienne version du banc à 1 dessin par état) donnait 9 px ±1 sur jade-90 et 6 px ±1 sur nuages-60 : au niveau du bruit de la méthode d'alors. Le passage à 4 dessins donne 0.
- C'est une bascule dans une même page, pas deux lancements à froid : deux lancements ne donnent jamais la même image (voir `banc-pcmain/det.cjs`).

### Temps de lancement, processeur ×4, profil Chrome neuf (`lancement.cjs --froid 1 --cpu 4`), 3 passes alternées
| | lier | chauffe | prêt | programmes liés |
|---|---|---|---|---|
| avant (`sans=progdouble`) | 347 · 272 · 273 ms | 76 · 48 · 49 ms | 13,4 · 10,8 · 11,0 s | 163 |
| après | 200 · 154 · 216 ms | 51 · 53 · 59 ms | 10,8 · 11,2 · 11,8 s | 144 |

- « lier » : médiane 273 → 200 ms (−73 ms, −27 %).
- « chauffe » : pas de différence mesurable.
- « prêt » : pas de différence mesurable (médianes 11,0 s et 11,2 s ; l'écart entre passes est plus grand que le gain).
- Donc sur le Chrome du Mac le gain est petit. Le gain attendu est sur le téléphone à froid (cache de shaders vide), où un programme coûte bien plus cher. Il n'est PAS mesuré.

### Gardes
Assemblage d'accord (331 morceaux), `garde-demarrage` OK, `garde-allege` OK, `garde-charte` OK, `node --check` OK sur le gros script et sur `three.min.js`.

## NON prouvé
- Rien n'a tourné sur un iPhone. WebKit peut lier une autre liste de programmes que Chrome.
- L'ordinateur n'a pas été photographié. Argument : `PROG_DOUBLE` y est faux, donc `ccPD` n'est pas appelé, la clé est faite par la boucle d'origine, `lierPassesInutiles` rend `null`, la clé de la caisse-nuage reste `nuageCaisse`. Coût ajouté sur ordinateur : un test de booléen par `getParameters` et par `getProgramCacheKey`.
- Réglage HAUTE, classes 2-4, `?bloom=ancien`, `?bloom=plie2d` : pas photographiés. Si une matière de halo écartée est quand même dessinée, elle se compile à son 1er dessin (un à-coup possible, pas une image fausse).
- Le filtre du halo ne joue que si `KHR_parallel_shader_compile` existe (`dbgLier().ext`), comme `lierPasses`.
- Les autres maps (ville, grottes, orbite, volcan…) n'ont pas été photographiées en course. La preuve par les sources couvre les programmes du lancement, pas ceux nés plus tard en course.
- Le gain en secondes sous le serpent du téléphone.

## À mesurer sur le 13 Pro (A/B : avec et sans `?sans=progdouble`)
1. `dbgLier().ext` : vrai ? Sinon le gain du halo tombe (il reste les 13 de la clé).
2. `dbgChauffe().programmes` : attendu ~165 sans, ~144-146 avec.
3. Ligne `chargement` de la boîte noire (« lier … ms », « libérés : lier … », « prêt en … s ») : 3 lancements à froid (juste après installation du build) et 3 à chaud, de chaque côté.
4. À l'œil, en A/B : menu, garage, boutique, une course nuages (la caisse-nuage si possédée), le halo des phares et du nitro.

## Pour l'intégration
- `sw.js` n'est pas incrémenté et `index.html` n'est pas commité (règle du lot). `vendor/three.min.js` change : le cache doit monter d'un cran à l'intégration.
- `vignette-moteur.js` : seules les lignes du halo sont touchées (bloc `lierPassesInutiles` avant `lierPasses`, une ligne dans `lierPasses`, une dans `lierPassesPretes`). Le lot `lancement2` touche le même fichier plus bas.
- Si `maps/nuages-coton.js` change un jour le shader de `CLOUD_MAT`, rendre `'nuageCaisse'` dans `zones-caisses.js` (commentaire posé sur place).
- Incident de banc : à 20 h 59, en arrêtant une file d'attente, un `programmes.cjs` de ce lot est parti ~40 s sans le verrou, pendant le rendu de `musique3`. Aucun dégât vu ; ses chiffres ne sont pas utilisés pour les temps.
