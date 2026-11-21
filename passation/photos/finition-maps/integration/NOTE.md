# Finition des maps : contrôle d'intégration des cinq lots (21/11/2026)

Branche `claude/finition-maps-dee281` au commit 4318e8848 (origin/main fc1cca055 + grotte, couleurs, espace, Jade, canyon nuit/pluie/orage), contre origin/main fc1cca055.
Contrôle adverse : je n'ai modifié aucun code du jeu, rien n'est commité, rien n'est poussé. **Le vrai téléphone n'a rien vu** : tout a tourné dans Chrome sans fenêtre et muet, en `?tel=1`, avec un user-agent d'iPhone, DPR 3.

**Verdict : INTÉGRATION SAINE.** Je n'ai trouvé aucun défaut d'intégration. Il y a trois réserves de goût ou de mesure, listées plus bas.

## Mise en place
- APRÈS : worktree allégé détaché `/Users/sachaberes/cash-car/finition-lots/integ` sur 4318e8848, sparse-checkout `/code/ /outils/ /VERSION PRINCIPALE/ /CLAUDE.md /garde-*.sh /vercel-build.sh`, puis `node code/assembler.cjs --depuis-morceaux`. Son index.html est donc réassemblé et diffère de celui qui est commité : c'est normal, car la branche ne commite pas index.html.
- AVANT : un second worktree, `/Users/sachaberes/cash-car/finition-lots/avant-main`, sur fc1cca055, monté de la même façon. `finition-lots/avant` (dbc5f1d54) n'a pas été touché.
- Banc : un pilote CDP à moi, dans le scratchpad de la session, inspiré de `banc-finition-couleurs/photos.cjs`. Il tient le mutex du groupe et une place du verrou au nom `finition-integ`, utilise les ports 8660/8661/9660 et efface son profil. Cinq passages de 5 à 7 min. La boucle est figée (rAF neutralisé, 120 × `dbgStep(1,33)`), l'interface est masquée.

## 1. Contrôles statiques (APRÈS)
- `assembler.cjs --verifier` : « index.html et les 350 morceaux sont d'accord » (avant-main : 349, il manque `couleurs-finies.js`).
- `garde-demarrage` (21 scripts), `garde-allege` et `garde-charte` sortent tous les trois avec le code 0.
- `vm.Script` sur les `<script>` en ligne : 21 balises, 7 compilées, 1 échec, le script 5. Il est identique dans AVANT : même erreur `Unexpected token ','` et même md5 `4e533000…`, sur 2 594 octets.
- Constantes des lots, déclarées une seule fois chacune : GRT_NAPPES, COULEURS_FINIES, ESPACE_FINI, ESP_NUIT, ESP_NEB (même `const` qu'ESP_NUIT), JADE_FINI, CY_FINI et CY_FINI_R. Comme la grande IIFE compile, aucun doublon n'existe dans une même portée.
- `git diff fc1cca055 4318e8848 --stat -- code` : 10 fichiers, tous des lots (ORDRE.txt +1, canyon-relief, grotte-travailleur, grottes-1, grottes-2, orbite-embellie, orbite-geants, couleurs-finies, lumiere-design, scene-ciel). Hors de code/, passation/ et outils/, rien ne change : ni index.html ni sw.js.

## 2. Routes au bit près
- Bancs Node, AVANT contre APRÈS, md5 des sorties identiques :
  - `empreinte.cjs graines=1-24` (ville, crypto, nuages, espace × paliers 0/10) : `2cc8ee0f…`. vitree y plante dans les deux arbres (« VIT_SOL is not defined », un défaut du banc qui existait avant) ;
  - `canyon.cjs graines=1-24 --brut`, aux paliers 0, 2 et 10 : `621452dc…`, `9b1a4d46…` et `f9b0a5bf…` ;
  - `grotte.cjs` 1-20, aux paliers 0, 10 et 20 : `d215b898…`, `56c32bc7…` et `ae71e0d5…`.
- Dans le vrai jeu, `dbgGenRoute(carte, graine, palier)` avec une empreinte FNV des octets Float64 de ctrl0, ctrl et N : 12 cartes (jade, orage, minuit, vitree, banquise, dunes, nuages, ville, espace, canyon, grotte, crypto) × graines 1-20 × paliers 0/10. Résultat : **480/480 égales, 0 erreur.**

## 3. Au banc (vrai jeu, `?tel=1`)
Variantes : A = avant-main ; B = après ; S = après + `?sans=nappes,couleursfinies,espacefini,jadefini,canyonfini` ; X = après avec un seul interrupteur d'un AUTRE lot coupé.
Empreintes au bit près, prises dans la page :
- ambH : FNV du JSON de `dbgAmb(ambiance courante)` ;
- shH : sources des ShaderMaterial de la scène ;
- prH : clés des programmes compilés.

**Démarrage et console** : 98 chargements, la course a démarré à chaque fois, 0 exception et 0 panne `dbgErreurs` (hors gel, serpent et son). La console ne contient que deux messages, présents à l'identique dans A et dans B : l'avertissement Canvas2D `willReadFrequently` et « Blocked call to navigator.vibrate » (banc sans geste). **Rien de nouveau.**

**Les cinq coupés ensemble (S = A)** : l'empreinte d'ambiance de S égale celle de A sur chaque scène (nuages nuit/pluie/matin, ville jaune g3/g11, Mars, Jade nuit/soir/pluie, canyon nuit/soir, grotte eau/lave). Les shaders et les programmes de S égalent aussi ceux de A partout, sauf Mars g7, où A avait 3 matières et 4 programmes de plus au moment de la photo, un effet passager. Sur Mars g3, shH et prH de S égalent ceux de A. Les mesures par tiers de S égalent celles de A au bruit près (tableau des mesures). Les écarts au pixel près entre deux chargements viennent de la caméra et de la file, et existent aussi entre A et S : 0,5 à 1,4 sur Jade et sur la pluie des nuages, 6 à 11 la nuit.

**Interactions (X)** :
| scène | interrupteur coupé | ambiance | shaders/programmes | image (écart moyen 0-255 vs B) |
|---|---|---|---|---|
| nuages nuit g3 | jadefini | = B | sky Jade d'avant (prH change, attendu : la chaîne du shader du ciel) | dans le bruit de la nuit (tiers égaux, voir planche 1) |
| nuages matin g11 | nappes, espacefini, jadefini, canyonfini | = B | shH = B | 1,35 couché, 1,88 sur la pluie de devises |
| ville jaune g3 | jadefini | = B (87873ddc) | shH = B | tiers égaux à B |
| Mars g7 | couleursfinies | = B | shH = B, prH = B | bruit de l'espace |
| Jade nuit g3 | couleursfinies | = B | shH = B, prH = B | **0,92** |
| canyon nuit g3 | couleursfinies | = B | shH = B, prH = B | bruit (L 54,3 contre 53,5) |
| grotte eau g1 p20 | couleursfinies | = B | shH = B, prH = B | flou de mouvement ; nappes actives (triangles 496 433 = B) |
Le lot couleurs ne touche ni Jade, ni le canyon, ni l'espace, ni la grotte. Le lot Jade ne touche ni les nuages ni la ville. Seul le texte du shader du ciel change partout (l'astre « Japon »), mais il est pondéré par `uJdK`, qui vaut 0 hors de Jade : les mêmes opérations, aucun programme de plus.

**Comptes** (`renderer.info` d'une image rendue à la main : appels / triangles / programmes / géométries / textures) :
| scène | A | B | S |
|---|---|---|---|
| nuages nuit g3 | 200/935572/149/589/119 | 191/932152/149/575/119 | 192/971104/149/589/119 |
| nuages nuit g11 | 189/862932/149/572/121 | 196/862312/149/574/121 | 190/863464/149/596/121 |
| nuages pluie g3 | 188/953948/149/588/119 | 196/919034/149/588/119 | 187/951832/149/588/119 |
| nuages matin g11 | 197/862624/149/597/121 | 198/864722/149/597/121 | 198/865028/149/597/121 |
| ville jaune g3 | 89/237960/149/542/121 | 88/234174/149/542/121 | 88/234362/149/516/121 |
| ville jaune g11 | 111/356530/149/545/123 | 112/357012/149/545/123 | 112/356442/149/541/123 |
| Mars g7 | 106/295424/152/561/119 | 107/297626/148/555/119 | 107/297832/148/581/119 |
| Mars g3 | 75/202551/149/564/119 | 76/206441/149/564/119 | 75/203257/149/564/119 |
| Jade nuit g3 | 92/178943/149/604/119 | 92/179083/149/604/119 | 92/179087/149/604/119 |
| Jade soir g17 | 81/151892/149/643/119 | 81/152880/149/643/119 | 81/151958/149/643/119 |
| Jade pluie g11 | 137/368303/149/616/121 | 137/369593/149/616/121 | 137/368527/149/616/121 |
| canyon nuit g3 | 139/465928/149/553/124 | 139/466298/149/569/124 | 147/468640/149/577/124 |
| canyon nuit g17 | 192/651121/149/648/124 | 200/652631/149/620/124 | 200/651897/149/648/124 |
| canyon soir g3 | 143/489098/152/581/124 | 143/487890/149/577/124 | 143/487608/149/577/124 |
| canyon soir g11 | 158/506795/149/588/126 | 158/507727/149/588/126 | 158/506805/149/588/126 |
| canyon pluie g3 | 143/447396/149/575/124 | 143/447806/149/577/124 | – |
| canyon orage g3 | 135/444580/149/577/124 | 135/438034/149/577/124 | – |
| grotte eau g1 p20 | 110/371634/149/626/119 | 107/365856/149/624/119 | 108/368334/149/630/119 |
| grotte lave g56 p20 | 86/227374/149/619/119 | 85/224790/149/616/119 | 85/224782/149/616/119 |
Les portraits (12 scènes A/B) donnent la même lecture : programmes égaux (149 ou 148), textures égales.
- **Programmes** : B n'en a jamais plus que A. Les 152 viennent des A au moment de la photo, et les 148 de l'espace se voient aussi en S.
- **Textures** : égales partout.
- **Appels et triangles** : aucune hausse nette et répétée, et des écarts de même ordre entre A et S, qui sont le même code.
- **Grotte entière** (`dbgGrotte().n.triangles`) : g1 p20 496 335 → 496 433 (+0,02 %) ; g56 p20 533 783 → 531 961 (−0,3 %). Ce sont les nombres du lot.

**Canyon** :
- Le SOIR d'APRÈS est celui d'AVANT, au bit près : ambiance `c71ca002` dans A, B et S, g3 et g11.
- Mesures du soir, A → B :
  - g3 couché L 106,5 / C 36,8 / rouge 21,9 → 106,6 / 36,9 / 21,9 ;
  - g11 couché 111,6 / 37,2 / 21,4 → 112,5 / 37,1 / 21,4 ;
  - g3 debout 106,9 / 40,3 / 16,1 → 107,2 / 40,4 / 16,4.
- La NUIT d'APRÈS a l'ambiance `3b53e3be` (celle du lot), et S retrouve `bc62f915`. Mesures :
  - g3 couché L 54,9 → 53,5 (−2,6 %), chroma 67,6 → 70,7 ;
  - g17 couché L 54,2 → 52,8 (−2,6 %), chroma 67,3 → 70,1 ;
  - g3 debout L 58,9 → 58,2 (−1,2 %), chroma 70,6 → 72,6.
- À l'œil, les ombres sont plus violettes et la route bleu électrique est gardée.

**Pluie de devises** (main, `billets-devises.js`) : lancée par `dbgPluie()` sur nuages matin g11 dans A, B et S. 142 billets vivants dans les trois. Le dessin est le même ; l'image vs B, une fois les quatre autres lots coupés, s'écarte de 1,88. Planche 1, dernière ligne.

**Éblouissement** : 0 % de pixels brûlés (> 245) sur toutes les photos, A et B, paysage et portrait.

## Planches (avant | après | sans5)
1. nuages paysage : nuit g3 et g11, pluie g3, matin g11, pluie de devises.
2. ville jaune d'orage, g3 et g11.
3. Mars, g7 et g3.
4. Jade : nuit g3, nuit g11 (avec `?sans=couleursfinies`), soir g17, pluie g11.
5. **Canyon nuit g3/g17, pluie g3, orage g3, avant | après, dans la branche intégrée** (la planche qui manquait).
6. Canyon soir g3/g11 : avant = après = sans5.
7. Grotte : eau g1 p20 nuit, lave g56 p20 matin, paysage et portrait.
8. Portrait 390×844, avant | après : 12 scènes.

## Réserves (pas des défauts d'intégration)
1. Nuit du canyon : en paysage, la luminance baisse de −2,6 % sur les deux graines, un peu au-delà du « −1 à −2 % » annoncé (−1,2 % en portrait). Ce sont les nombres du lot, inchangés par l'intégration.
2. Orage du canyon (hors tirage) : les mesas passent au rose-saumon vif sous un ciel violet (planche 5). C'est un choix du lot, mais c'est la vue la plus saturée de la série. À juger par Sacha.
3. Jade pluie g11 en portrait : le haut de l'image est plus sombre (L 122 → 111) et le chroma du bas baisse (27,8 → 24,5). Le lot l'avait déjà dit : « plus sombre que le midi, la route perd 5-6 points de chroma ».

## Non vérifié
- Le vrai iPhone : ni l'OLED, ni la chauffe, ni le temps de `grtNappesG` sur l'appareil. En jeu sur le Mac chargé : 155 et 166 ms (première mesure), 55 ms une autre fois.
- Le PC sans `?tel=1`.
- Les fondus entre météos, les portails, la nitro.
- Saturne et la Terre.
- Jade matin, midi et orage.
- Les nuages au midi et à l'orage, la ville violette et la verte : leurs ambiances ne bougent pas par construction, mais je ne les ai pas photographiées.
- L'identité au pixel près entre deux chargements : le banc n'est pas déterministe d'un chargement à l'autre. L'identité est prouvée par les empreintes d'ambiance, de shaders et de programmes, et les images sont jugées par tiers.
- Les vues de la grotte : ce sont celles des lacs (`dbgGrotte('lac')`), en boucle non figée. Elles ne montrent pas une rive comblée de près, et le flou de mouvement change d'un chargement à l'autre.
- `?plus=geants`.

## Contrôle de démarrage « SANS TOUT CASSER » (21/11, 17 h) : DÉMARRAGE OK
Contrôle fait dans `finition-lots/integ` (HEAD 4318e8848, `--verifier` d'accord), comparé à `avant-main` (fc1cca055). Chaque essai suit le vrai chemin du menu, sans `?colonne=0` :
- page → intro (Entrée) → splash (vrais taps) → menu → JOUER, par un vrai clic souris sur l'ordi ou un vrai toucher sur le téléphone, envoyé par `Input.dispatch*` ;
- ensuite la course roule 10 s au pilote automatique. Le son est coupé (`sfx`/`mus`/`vox` à false lus dans `cashcarSave` avant tout clic) et Chrome est muet.

Le JOUER de l'écran titre a un rectangle de 0×0 dans le DOM. J'ai donc touché sa place à l'écran, relevée sur les captures : (1090, 580) sur l'ordi en 1440×900, (667, 273) en couché, (193, 790) en debout.

| essai | AVANT | APRÈS |
|---|---|---|
| ordi 1440×900, cadre `#colonne`, nuages nuit | course OK, 643 m en 10 s, 194 programmes, 133 textures, MAX | course OK, 695 m, 194 programmes, 133 textures, MAX |
| ordi, Jade nuit (2e passage) | course OK, 676 m, 195 / 130, MAX | course OK, 667 m, 195 / 130, MAX |
| couché 844×390 `?tel=1`, nuages nuit | course OK, 669 m, 152 / 119 | course OK, 642 m, 152 / 119 |
| debout 390×844 `?tel=1`, Jade soir | course OK, 614 m, 152 / 120 | course OK, 617 m, 152 / 121 |
| debout `?tel=1`, map du tirage (sans carte imposée) | ÉCHEC du banc : la course ne part pas au tap fixe (la page d'AVANT, pas le code livré) | course OK, ville d'orage, 669 m, 152 / 121 |

- Exceptions : 0 partout.
- Console : rien de nouveau. AVANT comme APRÈS ont l'avertissement Canvas2D `willReadFrequently` et, sur l'ordi, « three.min.js preloaded but not used » (la page cadre).
- `dbgPoste()` vaut MAX (r 3) pour les deux versions. Au premier passage, l'AVANT de Jade était passé en ALLÉGÉ (banc 7,4 ms sur un Mac chargé) et comptait 172 programmes contre 195. Refait au second passage : 195 = 195 en MAX tous les deux.
- La debout de Jade compte 121 textures contre 120 : un écart de chargement (le banc figé donnait 119 = 119).
- Capture de la course sur l'ordi : `9-ordinateur-course.jpg`.
- Non fait : le vrai iPhone ; une première visite sans sauvegarde (auto-école, plaque) ; d'autres tailles de fenêtre d'ordi.
