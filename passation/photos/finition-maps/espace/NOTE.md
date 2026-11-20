# ESPACE — finition graphique sobre — REPRISE du 19/11/2026 (après la fusion de main : l'espace sans géants)

Branche `finition-maps-espace`, dossier `/Users/sachaberes/cash-car/finition-lots/espace`. Rien sur main, aucun build, ni index.html ni sw.js commités.
**Le vrai téléphone n'a rien vu** : Chrome sans fenêtre, téléphone émulé (tactile, ×2), `?tel=1`. Trois passages de banc sous le verrou (17:48, 18:04, 18:17, ≤ 6 min chacun).

## Ce qui change (des NOMBRES seulement : aucun maillage, aucune texture, aucun programme, aucune instruction GLSL en plus)
| Quoi | Fichier | Avant → après |
|---|---|---|
| Face NUIT des globes de Mars et Saturne | `code/maps/orbite-embellie.js` (`ESP_NUIT`) | `c0 × (.012,.010,.012)` (trou noir) → bleu nuit FIXE ; reprise : `(.045,.054,.140)` du tour 2 → **`(.030,.036,.095)`** |
| Côté jour (tour 1, gardé) | idem | saturation Mars .62 → .80, Saturne .50 → .60 |
| Voûte d'étoiles sous Mars et Saturne (tour 2, gardé) | `code/maps/orbite-geants.js` (`geantsTick`, 1 ligne) | `uNeb` 1.7 → 1.25 (`ESP_NEB`) ; la Terre garde 1.7 |
| **Nouveau** : les amas de satellites (Terre) et de météorites (Mars, Saturne) | `orbite-embellie.js` (`ESP_AMAS_L`, 5 littéraux remplacés dans `SAT_MAT`, `SAT_MAT_E`, `ROCHE_MAT` avant leur 1re compilation) | satellites : liseré .14 → .26, Terre dessous .30 → .42, encre de l'ombre .22 → .50 ; météorites : liseré .40 → .62, planète sur la face sombre .22 → .32 |
| Commentaire faux (« .018/.036/.045 ») | `orbite-embellie.js` l. ~77 | réécrit avec les vraies valeurs et les mesures de la reprise |

## 1. Le lot tient après la fusion de main (espace sans géants)
- `geantsTick` tourne toujours (orbite-2.js l. 183) et `GEANTS.typ` est encore posé par `geantsPose` AVANT le `return` de `ESP_SANS_GEANTS` (orbite-geants.js l. 313) : `ESP_NEB` s'applique bien sous Mars/Saturne.
- Les remplacements de shader ont tous pris : `OBEAU.rate` vide dans les 40 prises du passage 3 (le banc le lit maintenant).
- Route : `outils/banc-routes/empreinte.cjs graines=1-25` identique avant/lot (espace p0 `3857e76b46d7`, p10 `1607a8009f7c`) ; empreinte `__ev` identique dans toutes les versions au banc.
- Gardes : assembleur `--verifier` d'accord (349 morceaux), démarrage OK, allègement OK, charte OK ; vm des 8 scripts : la même erreur préexistante (script 5) que l'AVANT.

## 2. Le disque nocturne (réserve du contrôle) — médianes sRGB 30×30 px, Mars g7 portrait, prise #0
| ESP_NUIT | face nuit, haut | ciel voisin, haut | disque, bas du cadre | ciel, bas du cadre |
|---|---|---|---|---|
| avant / `sans` | [1,0,0] (trou) | [10,11,28] | [0,0,0] | [4,4,12] |
| .045 (tour 2) | [10,12,30] | [10,11,28] | [9,11,28] = **2,5×** le ciel | [4,4,12] |
| **.030 (gardé)** | **[6,8,20]** = 70 % du ciel | [10,11,28] | **[6,7,19] = 1,6×** | [4,4,12] |
| .022 (essai) | [5,6,16] | [10,11,28] | [4,5,15] | [4,4,12] |
.030 : plus sombre que le ciel du haut, presque celui du bas : une nuit bleu marine, plus une lueur ; .022 retombe vers le noir. Part de pixels bouchés (< 8/255) sur l'image entière : Mars g7 portrait 13,1 % → 0,2 %, paysage 5,6 % → 0,05 %. Planche 3 (avant | .045 | .030 | .022).

## 3. Les amas de satellites et de météorites (demande d'espace-debug)
Le banc pose maintenant la caisse 300 m puis 120 m avant le 1er amas (`--amas` : `s` réglé à la main, banc seulement ; `dbgStep` n'avance la caisse que de ~1 m en 600 images au départ).
- **Ce qu'on voit** (Terre g12345, planches 5-7) : l'amas est dans le cadre, devant la Terre, en SILHOUETTES de 10-30 px. Leur face à l'ombre (celle qu'on voit, le soleil derrière) était NOIRE : médiane [7,2,13]. → **[15,3,27]** après (l'encre violette de la charte), [25,4,44] à .85 (essai rejeté : trop violet). Le liseré et la Terre dessous ne changent presque rien de cet angle (ils éclairent les faces tournées vers le soleil et la Terre).
- **Mars et Saturne** : à ces deux distances, la caméra (posée à la main, caisse de travers) ne cadrait pas l'amas de météorites : leur réglage (liseré .62, face sombre .32) est **non photographié**.
- **Conclusion pour la session espace** : c'est surtout la DISTANCE. Les gros objets (rayon 10-20 m) à 150-360 m de la route font 10-30 px sur l'iPhone, les petits (2,5-7 m) 1-5 px ; une matière ne les fera pas « se voir nettement ». Leur place (ESP_AMAS, espAmasLieux) n'est PAS changée ici : si Sacha veut les voir, les rapprocher (ESP_AMAS.dLib, `lat=150+r()*210`) ou grossir le plus gros, dans la session espace.

## 4. Éblouissement, terne, rouge — `outils/banc-finition-espace/mesure.py` (image entière ; L, C 0-255 ; % brûlé = 3 canaux > 245)
| Scène (prise #0) | L avant → après | C avant → après | brûlé % | rouge vif % | noir % |
|---|---|---|---|---|---|
| Mars g7 paysage | 40,5 → 40,9 | 22,4 → 25,2 | 0,01 → 0,00 | 0,57 → 0,59 | 5,62 → 0,05 |
| Mars g7 portrait | 32,1 → 33,4 | 20,2 → 22,4 | 0,05 → 0,03 | 2,85 → 2,99 | 13,1 → 0,23 |
| Saturne g99 paysage | 38,8 → 38,7 | 16,9 → 16,9 | 0,00 → 0,00 | 0,42 → 0,42 | 0,06 → 0,06 |
| Saturne g99 portrait | 38,2 → 38,2 | 19,9 → 20,0 | 0,27 → 0,25 | 1,20 → 1,24 | 0,27 → 0,27 |
| Terre g12345 paysage | 64,7 → 64,7 | 30,9 → 30,9 | 0,36 → 0,37 | 0,70 → 0,73 | 0,06 → 0,05 |
| Terre g12345 portrait | 72,3 → 72,2 | 36,6 → 36,6 | 0,34 → 0,32 | 1,99 → 2,00 | 0,25 → 0,25 |
| Terre g4242 paysage | 68,7 → 67,1 | 33,4 → 31,2 | 0,43 → 0,43 | 0,57 → 0,54 | 0,05 → 0,05 |
**L'espace n'éblouit pas** : ≤ 0,43 % de pixels brûlés partout (les feux, les flammes, le liseré de la Terre), rien sur la route. Le « rouge vif » (≤ 3 %) est Mars lui-même et les feux arrière : pas trop rouge. Le terne de l'espace était le noir bouché du disque de Mars : réglé. Rien d'autre à corriger ici sans risquer le criard ; non touché.
Le haut du ciel varie de ±4 en L d'un chargement à l'autre (Saturne g99 « avant » : 23 puis 27) : le banc n'est pas déterministe sur la voûte. Un essai `ESP_NEB` 1,45 n'a donc rien prouvé : 1,25 gardé.

## L'interrupteur
`?sans=espacefini` : l'ancien shader du globe, uNeb 1.7, et les matières des satellites et des roches d'origine. Mesuré : silhouette du satellite `sans` = `avant` = [7,2,13] ; face nuit `sans` = `avant` = [1,0,0] ; mesures globales `sans` ≈ `avant` (Terre g12345 L 64,7 / 64,7 ; Mars g7 portrait : 8,3 % de noir bouché pour `sans` comme pour `avant` du passage 2 ; l'avant du passage 1 a 13,1 %, la caméra un pas plus tôt). Pour le banc : `?espnuit=r/g/b`, `?espneb=k`, `?espamas=a/b/c/d/e`.

## Preuves de coût — renderer.info, `?tel=1`, boucle figée + dbgStep (passages du 19/11)
Programmes **149** et textures **95** dans TOUTES les prises (avant, sans, après, essais ; 149 et non 154 comme le 18/11 : main n'a plus les programmes des géants).
| Scène, prise | avant (appels / triangles / géométries) | après | sans |
|---|---|---|---|
| Mars g7 paysage #0 | 92 / 248 894 / 546 | 92 / 249 570 / 558 | 93 / 252 862 / 560 |
| Mars g7 portrait #0 | 63 / 159 784 / 556 | 63 / 159 910 / 556 | 64 / 164 140 / 542 |
| Saturne g99 paysage #0 (p2) | 95 / 292 796 / 567 | 95 / 291 506 / 561 | — |
| Saturne g99 portrait #0 (p2) | 64 / 161 960 / 547 | 64 / 160 742 / 565 | — |
| Terre g12345 paysage #0 (p3) | 129 / 369 054 / 528 | 122 / 370 624 / 528 | 129 / 369 452 / 532 |
| Terre g12345 paysage amas −120 m (p3) | 128 / 374 112 / 528 | 121 / 375 736 / 528 | 128 / 374 064 / 532 |
Les écarts (jusqu'à ±8 appels, ±1,5 % de triangles, ±20 géométries) existent aussi entre `avant` et `sans` (même code) et changent de sens d'un passage à l'autre (Terre portrait p3 : après 130, avant 122) : la plaque, les flammes et la fumée tirées au hasard. 0 erreur, 0 avertissement en console, boucle `ok` partout.

## Planches (JPEG ≤ 450 Ko)
1 Mars paysage (avant | sans | après) · 2 Saturne paysage · 3 Mars portrait, les trois essais de la face nuit · 4 Saturne portrait · 5 Terre paysage, l'amas à 300 et 120 m (avant | après | essai .85) · 6 loupe sur un satellite de l'amas (avant | après | essai) · 7 Terre portrait, l'amas (avant | sans | après). Regardées : pas de masse noire nouvelle, pas de bande, pas de couleur criarde ; route, caisse et argent inchangés. Sur la 4, la caméra « après » est un peu plus loin dans la course (bruit du banc, refait identique au passage 2).

## Ce qui n'a PAS été vérifié
- Le vrai iPhone (OLED : le bleu nuit et l'encre violette peuvent sortir plus vifs). Le PC sans `?tel=1`.
- Les amas de météorites de Mars et Saturne en photo (voir 3). Les virages serrés, la sortie de l'orbite (fondu uSpace), `?plus=geants`.
- Le bord dur en bas du cadre (la route s'arrête sous la caméra) et la dalle gris-taupe : déjà là, hors lot (géométrie / matériau partagé).

## Décisions pour Sacha
- Les amas : les rapprocher ou les grossir (session espace) ? La matière seule ne suffit pas à cette distance.
- Face nuit à .030 : plus sombre (.022, presque l'ancien noir) ou plus clair (.045, lueur) ?

## Contrôle adverse, tour 1
Verdict : **A_CORRIGER**. Le lot est propre et sans coût, mais il ne se voit presque pas : sur ses trois changements, un n'a AUCUN effet (les étoiles), un est invisible (la nuit des globes) et un seul se mesure (la couleur du jour de Mars, un cran).

**Ce qui tient (exécuté)**
- Diff depuis la base `a0d9f3094` : `code/maps/orbite-embellie.js` (+15/−2) et `outils/banc-finition-espace/*`. Ni index.html ni sw.js. Rien hors de l'orbite, pas de IS_MOBILE. Aucune texture, aucun mesh, aucune instruction GLSL ajoutés : on a deux littéraux remplacés dans le GLSL du globe et un `Object.assign` sur `BIOMES`.
- `--depuis-morceaux` : 346 morceaux d'accord. Gardes de démarrage, d'allègement et de charte : OK. Compilation vm des 8 `<script>` : 1 erreur `Unexpected token ','`, et l'AVANT a la même (elle existait déjà). `const ESPACE_FINI` est déclaré une seule fois. `F9` est dans un bloc `if`, sans collision.
- Route : empreinte md5 des Float64 de `ctrl` (+ `info`) de `B.piste('espace',g,p)` (charge.cjs, Node), graines 1-25 × paliers 0/10/20. Elle est identique au bit près entre avant et lot (p0 `7da71e98…`, p10 `4e3c03c1…`, p20 `d911a7e2…`). Au banc, l'empreinte `__ev` est identique dans les 3 versions pour les 4 scènes.
- Banc (verrou pris à 08:29, rendu à 08:33, `controle/passe.log`, `controle/brut/resultats.json`) : vrai jeu `?tel=1`, téléphone émulé, 844×390 et 390×844, Mars (midi) g7 et g99, Saturne (soir) g4242 et g99, avant / sans / après. Programmes 154 et textures 95 PARTOUT. Les appels, les triangles et les géométries bougent autant entre avant et sans (même code : jusqu'à ±7 appels, ±1 % de triangles, ±12 géométries) qu'entre avant et après. Le banc n'est pas déterministe, la plaque et la fumée sont tirées au hasard, et la midi g99 paysage « après » est décalée d'un pas. Rien n'est attribuable au lot. 0 erreur, 0 avertissement en console.
- Interrupteur : sans ↔ avant, les médianes du globe et du ciel sont égales à ±1/255 sur les régions mesurées. `?sans=espacefini` rend bien l'avant.

**Défauts (reproductibles)**
1. **Les étoiles (.6→.45 et .7→.5) n'ont aucun effet.** En orbite, la voûte du ciel multiplie les étoiles par `(1.-uSpace)` (index.html ≈ l.14221, `cielSOn` exige `uSpace<.999`) : `uStars` ne compte pas quand `uSpace=1`. Mesure dans la bande du haut (pixels >160/255) : Mars g7 paysage 456 / 452 / 454 (avant / sans / après), Saturne g4242 paysage 94 / 95 / 95. La NOTE dit « moins d'étoiles-points » : **ma mesure le contredit**. → Retirer le bloc `F9` (orbite-embellie.js, section « LES NOMBRES ») ou agir sur ce qui dessine vraiment les étoiles en orbite (la voûte profonde `pous`), puis le photographier.
2. **La nuit des globes reste un trou noir.** Mars g7 portrait, face nuit : [1,0,0] → [2,1,3] en sRGB, pour un ciel autour de [15,18,42]. Le facteur multiplie `c0`, la couleur de Mars, qui n'a presque pas de bleu : la « trace bleu-violet » est perdue. Ensuite, `ct*=.52+…` assombrit encore. Ce raccord dur entre l'astre et le fond, c'est justement un des manques de la mission. → Monter `vec3(.024,.032,.090)` vers `[.06,.08,.24]`, puis photographier, avec pour but une face nuit d'environ 60-70 % de la luminance du ciel voisin, bleutée et pas grise. L'autre voie est d'additionner une teinte au lieu de multiplier par c0, mais c'est une instruction GLSL de plus, à prouver neutre.
3. **Le seul effet visible est petit.** Le jour de Mars passe de S .34 à .41 (g7 portrait, [91,59,45] → [96,57,41]) : c'est juste, rouille plutôt que chocolat, on peut le garder. Pour Saturne, .50→.60 est peu mesurable sur les prises (le disque est surtout à contre-jour). Dans l'ensemble, le lot ne rend pas l'espace « plus beau », il le rend à peine différent. Les manques que l'auteur cite lui-même ne sont pas traités : le bord dur de la route au départ (bande horizontale nette en bas de cadre, toutes les prises), les roches plates, la route gris-taupe sous Saturne.

**Planches du contrôle** (`controle/`, avant | sans | après | écart ×6) : `c1-mars-paysage.jpg`, `c2-saturne-paysage.jpg`, `c3-mars-portrait.jpg`, `c4-saturne-portrait.jpg`. Les planches de l'auteur existent dans les deux formats et sont lisibles (en portrait, une seule planche). Elles ne montrent pas de différence qu'on voie à l'œil.

**Non vérifié** : la Terre (matin) n'est pas repassée au banc. Par construction elle n'est pas touchée : la branche `uTyp>.5` et le bloc F9 sont réservés à Mars et Saturne. Pas de vue en plein virage ni des géants. Le vrai iPhone n'a rien vu. Les PNG bruts sont effacés : il reste resultats.json, passe.log et les planches.

## Contrôle adverse, tour 2
Verdict : **FUSIONNABLE**, avec deux retouches de texte facultatives (voir « Défauts mineurs »). Le lot est propre, il ne coûte rien et il se voit. La face nuit de Mars et de Saturne n'est plus un trou noir : c'est une nuit bleu marine, sobre. Les étoiles sont un cran plus bas sous les géants. La Terre n'a pas bougé.

**Exécuté**
- Le commit `6a95623fd` sur `40abed9a4`. Diff depuis la base `a0d9f3094` : `code/maps/orbite-embellie.js` (+19/−3), `code/maps/orbite-geants.js` (1 ligne, `geantsTick`) et `outils/banc-finition-espace/*`. Ni index.html ni sw.js. Rien hors de l'orbite, pas d'IS_MOBILE. Lu ligne à ligne : aucun mesh, aucune texture, aucun programme ni aucune instruction GLSL ajoutés. Dans le GLSL du globe, `c0*vec3(…)` devient un littéral `vec3(…)` (une multiplication de moins). Un uniforme (`uNeb`) prend une autre valeur. `espFiniNb` est lu une fois au chargement (paramètres de banc `?espnuit`, `?espneb`).
- `--depuis-morceaux` : 346 morceaux d'accord. Gardes de démarrage, d'allègement et de charte : OK. Compilation vm des 8 `<script>` : 1 erreur `Unexpected token ','` (script 5, un commentaire qui contient `<script`), et l'AVANT a la même au caractère près. Aucun `const` déclaré deux fois.
- Route : `outils/banc-routes/empreinte.cjs graines=1-25` (Node, paliers 0 et 10) donne des md5 identiques entre avant et lot pour toutes les cartes (espace p0 `664a6f7a3f34`, p10 `4fd565e93fcc`, idem pour nuages, ville et crypto). Au banc, l'empreinte `__ev` est identique dans les 3 versions de chaque graine.
- Banc (verrou de 09:40 à 09:47, `controle/t2/passe.log` et `resultats.json`) : vrai jeu `?tel=1`, 844×390 ET 390×844, Mars (midi) g7/g99/g31, Saturne (soir) g4242/g99/g31, versions avant / sans / après, 2 prises chacune. Terre (matin) g12345 en paysage, avant/après. **Programmes 154 et textures 95 dans les 76 prises.** Appels, triangles et géométries : les écarts avant ↔ sans (même code) vont jusqu'à ±9 appels, ±1,5 % de triangles et ±20 géométries. Ceux d'avant ↔ après sont du même ordre et vont dans les deux sens : c'est le bruit du banc (plaque, fumée, roches tirées). **0 erreur, 0 avertissement** en console, boucle `ok` partout.
- Interrupteur : sans ↔ avant, la face nuit est égale au pixel près (Mars g7 portrait [0,0,0] / [0,0,0], Saturne g99 portrait [1,1,1] / [1,1,1]). Le ciel est égal à ±2/255 (bruit de banc, et l'avant ↔ avant varie autant). `?sans=espacefini` rend bien l'avant.
- Mesures de l'après (sRGB, médianes, images ×2) : face nuit de Mars g7 / g99 portrait et de Saturne g99 portrait = [9-11, 11-14, 27-36] au lieu de [0-1, 0, 0]. Le ciel du haut est à [15,18,42]. La Terre matin : écart > 8/255 de 0,3-0,5 % de l'image, c'est la plaque et la fumée, donc rien.
- Photos regardées (`controle/t2-*.jpg`, et les planches 1 à 6 de l'auteur dans les deux formats) : pas de masse noire nouvelle, pas de couleur criarde, pas de gris. Route, caisse, argent et HUD sont inchangés. Le terminateur de Mars est plus doux (brun → marine) et celui de Saturne reste doux. C'est resté sobre et c'est plus beau qu'avant sur Mars g7 et Saturne g99, là où le coin noir se voyait.

**Défauts mineurs (non bloquants, pour un éventuel tour 3 ou pour Sacha)**
1. La face nuit est une couleur FIXE. Elle ne suit pas le ciel local. En bas du cadre, le ciel tombe à [4,4,12] (L 4,6), et là, le disque nocturne [9-11,11-14,27-35] (L 12-15) est **2,5 à 3× plus clair que l'espace autour** (Mars g7 portrait, bas droit). La NOTE dit « 45-50 % de la luminance du ciel voisin » : c'est vrai pour le haut du cadre, faux pour le bas. À ×1, on ne le voit presque pas : ça se lit comme une lueur de planète (`t2-4`). À corriger dans la NOTE. Si Sacha veut une nuit franchement plus sombre que l'espace partout : `ESP_NUIT` ≈ `(.030,.036,.095)`.
2. La loupe ×5 (`t2-5`, `t2-6`) montre des anneaux de quantification de 1/255 dans le marine du disque (le dégradé du bord, `ct*=.52+.48*smoothstep…`). On ne les voit pas à ×1 sur l'écran du Mac. Sur un OLED réel, ce n'est pas vérifié.
3. Le commentaire du code (orbite-embellie.js, l. ~77) dit « trois essais .018/.036/.045 de vert ». La NOTE dit .022/.036/.054. La valeur gardée a .054 de vert : c'est le commentaire qui se trompe.
4. Ce qui était déjà là et que le lot laisse : le bord dur en bas du cadre (la route s'arrête sous la caméra), la dalle gris-taupe et les roches plates. L'auteur le dit lui-même.

**Non vérifié** : le vrai iPhone (rien vu), le PC sans `?tel=1`, les voyages et les géants hors des graines 7/31/99/4242, le fondu de sortie de l'orbite et les virages serrés. Les PNG bruts sont effacés : il reste `t2/resultats.json`, `t2/passe.log` et les planches `t2-1` à `t2-6`.

## Contrôle adverse, reprise du 19/11, tour 1
Verdict : **FUSIONNABLE**, avec une réserve de méthode : le contrôle n'a pas pu passer au banc, parce que le disque n'avait que **1,2 Go libres** (`df -h /`), sous le seuil de 1,5 Go. Aucun Chrome n'a été lancé et aucune capture n'a été prise.
- **Diff** (`git diff origin/main...HEAD`, base dbc5f1d54 = `avant`) : il ne touche que `code/maps/orbite-embellie.js`, `code/maps/orbite-geants.js` (une ligne) et 4 outils. Il ne contient ni index.html ni sw.js, aucune garde IS_MOBILE, aucune texture, aucun maillage et aucun uniforme en plus. Le GLSL change en deux endroits. La face nuit remplace `c0*vec3(...)` par une constante `vec3(...)`, ce qui fait une multiplication de moins. Cinq littéraux changent dans SAT_MAT, SAT_MAT_E et ROCHE_MAT. Chaque chaîne cherchée apparaît exactement une fois dans le shader d'origine, et ces matières sont déclarées avant le patch dans l'index assemblé : `OBEAU.rate` reste vide.
- **Interrupteur** (lu dans le code) : avec `ESPACE_FINI` faux, les deux lignes du shader redeviennent les chaînes d'origine, uNeb revient à 1,7 et le bloc des amas est sauté. Le code d'avant est donc rendu à l'identique.
- **Gardes** : `assembler --depuis-morceaux` et `--verifier` sont d'accord (349 morceaux). burn-out, charte et allègement passent, et la garde du démarrage passe sur 21 scripts. Les noms `ESPACE_FINI`, `ESP_NUIT`, `ESP_AMAS_L` sont chacun déclarés une seule fois, et `espFiniNb` est une seule fonction. Le vm.Script de mon extracteur échoue sur le script n°5, mais l'erreur est identique dans `avant` : elle ne vient pas du lot.
- **Route** : `outils/banc-routes/empreinte.cjs graines=1-20`, paliers 0 et 10, donne une sortie identique au caractère près entre `avant` et le lot. Espace p0 : c6beb4e7f248, p10 : 23eb07a4a5db. Nuages, ville et crypto sont aussi identiques. Vitrée échoue des deux côtés (`VIT_SOL`, défaut de l'outil).
- **Images** : les planches 1, 3 et 6 de l'auteur ont été regardées. La face nuit de Mars est bleu marine et ne forme plus de trou noir, mais ne fait pas non plus de lueur. Je ne vois ni banding ni couleur criarde, et la route, la caisse et l'argent sont inchangés. Le résultat reste sobre. Sur l'amas, le gain est à peine visible à la loupe ×5, comme l'auteur le dit.
- **Non bloquant** :
  - Le commentaire de `orbite-embellie.js` (bloc « LES AMAS ») parle de « quatre LITTÉRAUX », alors que cinq sont changés.
  - L'amas n'est pas vraiment plus lisible : c'est une affaire de distance, à décider par la session espace.
- **Non vérifié par ce contrôle** : renderer.info avec et sans le lot, la console, `?sans=espacefini` au pixel près et les mesures mesure.py. Tout cela a été fait par l'auteur ; je ne l'ai pas refait, faute de disque. Le vrai iPhone n'a rien vu.

## Contrôle adverse au banc, 20/11
Verdict : **FUSIONNABLE**. C'est le premier passage au banc de la reprise. Le lot ne coûte rien et il reste sobre. Son seul gain qui se voit est Mars : le croissant nocturne n'est plus un trou noir. Saturne bouge à peine, la Terre et les amas ne bougent pas à l'œil.

**Points 1 à 3, refaits**
- `git diff origin/main...HEAD --stat` (base dbc5f1d54 = `avant`) : il ne touche que `orbite-embellie.js` (+33/−3 lignes), `orbite-geants.js` (1 ligne) et 4 outils. Il ne contient ni index.html ni sw.js, ni IS_MOBILE. Lu ligne à ligne : aucun maillage, aucune texture, aucun uniforme et aucune instruction GLSL en plus.
- Assemblage : `--depuis-morceaux` et `--verifier` d'accord (349 morceaux, 13 248 658 octets). Gardes de démarrage, d'allègement et de charte : OK. vm.Script des 8 scripts : la même erreur `Unexpected token ','` sur le script 5 dans `avant` et dans le lot, rien d'autre.
- Route : `empreinte.cjs graines=1-25` donne une sortie identique au caractère près (espace p0 `3857e76b46d7`, p10 `1607a8009f7c`, nuages idem). Au banc, l'empreinte `__ev` est identique dans les 3 versions de chaque graine.

**Banc** (mutex du groupe puis verrou, de 13:45:40 à 13:54:45). Vrai jeu, `?tel=1`, téléphone émulé ×2, 844×390 et 390×844. Scènes : Mars (midi) g7 et g31, Saturne (soir) g99 et g4242, Terre (matin) g12345, en versions avant / sans / après. Au total 30 chargements et 120 prises (#0, #1 et amas a0/a1). Le 9e minute a coupé midi:31 portrait, soir:4242 et les graines suivantes ; midi g31 et soir g4242 sont pourtant complets dans les 2 formats. Fichiers : `controle/banc-20-11/resultats.json` et `passe.log`.
- (a) Interrupteur : en PORTRAIT, `sans` ↔ `avant` diffère de 0,3 à 3,4 % des pixels au-delà de 8/255 (le bruit de la flamme et de la plaque). La face nuit est égale au pixel près : Mars g7 [0,0,0]/[0,0,0], g31 [1,0,0]/[1,0,0]. Le lot, lui, la passe à [6,8,20] et [8,9,24]. En PAYSAGE, `sans` ↔ `avant` diffère de 7 à 45 % : la caméra et la voûte varient d'un chargement à l'autre, comme le disaient les contrôles précédents. Ce format ne prouve donc rien sur l'interrupteur, ni dans un sens ni dans l'autre.
- (b) Comptes : programmes **149** et textures **95** dans les 120 prises. Les appels, triangles et géométries bougent autant entre avant et sans (même code) qu'entre avant et après, et dans les deux sens. Exemples : appels de Mars g31 paysage 102 / 110 / 102, géométries de Saturne g4242 portrait 564 / 564 / 564, de la Terre paysage 512 / 514 / 460. Aucune hausse attribuable au lot.
- (c) Console : 0 erreur, 0 avertissement, boucle `ok` et `OBEAU.rate` vide dans les 30 chargements.
- (d) Mesures (mesure.py, prise #0, avant → après) :
  - Mars g7 portrait : L 33,4 → 34,7, C 22,5 → 24,4, noir 13,1 → 0,25 %, brûlé 0,01 → 0,02 %.
  - Mars g31 portrait : L 36,5 → 38,0, C 22,4 → 24,8, noir 13,3 → 0,26 %.
  - Mars g7 paysage : C 23,2 → 27,4, noir 3,4 → 0,05 %.
  - Saturne g4242 portrait : L 41,0 → 43,2, C 20,1 → 23,5, brûlé 0,03 → 0,02 %.
  - Terre g12345 portrait : L 72,9 → 72,1, C 37,6 → 36,8 (non touchée par construction ; l'écart vient du globe qui tourne avec l'horloge).
  - Brûlé ≤ 0,45 % partout. Seule exception : l'amas a0 de Saturne g4242 portrait, à 2,6 %, identique dans les trois versions (déjà là). Rouge vif ≤ 4,3 %, identique avant/après.
- Images regardées (`controle/c20-1` à `c20-6`, avant | sans | après | écart ×6) : le croissant noir de Mars devient un bleu marine qui se fond dans le ciel, sans lueur ni bande visible à ×1. Pas de masse noire nouvelle, rien de criard, aucun éblouissement. La route, la caisse, les feux et l'argent sont inchangés. Sur les amas (Terre a0/a1, Saturne a1), l'écart ×6 ne montre presque rien sur les satellites : leur lisibilité ne change pas à l'œil.
- (e) Plus beau sur Mars (le raccord dur astre/ciel disparaît). Sur Saturne, c'est différent d'un cheveu. Sur la Terre et les amas, rien de visible.

**Non bloquant**
1. Commentaire `orbite-embellie.js` (bloc « LES AMAS », l. ~177) : il dit « quatre LITTÉRAUX », mais il y en a cinq (A9[0..4]).
2. Ciel du haut sous Saturne g4242 portrait : [8,9,23] avant et sans, [15,18,42] après. Le même saut [10,10,26] → [15,18,42] existe entre avant et sans en paysage (même code) : je le classe comme bruit de la voûte, mais je n'ai pas pu le prouver en portrait.
3. Amas : la matière ne les rend pas plus lisibles à l'œil. C'est la distance, à décider dans la session espace (comme l'a dit l'auteur).

**Non vérifié** : le vrai iPhone (OLED). Le PC sans `?tel=1`. Les amas de météorites de Mars en gros plan. Les graines au-delà de 7/31/99/4242/12345. Le fondu de sortie d'orbite, `?plus=geants`. Les anciennes planches `c1-c4` et `t2-*` de `controle/` sont supprimées (limite de 6 JPEG) ; leurs `resultats.json` restent dans `brut/` et `t2/`.
