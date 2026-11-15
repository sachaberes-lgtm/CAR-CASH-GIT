# LOT 2 — PROGRAMMES EN DOUBLE (diagnostic, 15/11)

Branche `qa/programmes`. **Aucun fichier du jeu modifié.** Seulement l'outil et ce rapport.

## L'outil
`outils/banc-demarrage/programmes.cjs`, sur le modèle de `lancement.cjs`. Chrome sans fenêtre et muet, format iPhone (390×844 ×2, toucher, UA iPhone), `?tel=1&classe=1&palier=2&introapres=1`.
Une sonde posée avant la 1re ligne de la page relève chaque programme WebGL lié jusqu'à 10 s après l'ouverture du menu :
- ses sources finales ;
- le matériau qui l'a demandé (crochet sur `onBuild`, un noop de three r128 hors clé de cache) ;
- le morceau de `code/` où ce matériau naît (pile du constructeur, ramenée par `ORDRE.txt`) ;
- qui a lancé la compilation ;
- sa clé three.

Il range ensuite les jumeaux :
- **EXACT** : source identique, clé différente ;
- **INERTES** : defines différents mais sans effet, car leur nom n'apparaît pas dans le corps (même image au pixel) ;
- **DEFINES** : vrais variants ;
- **SOURCE** : mêmes defines, quelques lignes d'écart. En pratique c'est surtout du bruit : de petits shaders sans rapport entre eux.

Il simule aussi un correctif de three, avec un garde-fou qui vérifie que les programmes réunis ont des sources identiques une fois les lignes neutres retirées.

Usage : `node outils/banc-demarrage/programmes.cjs --http 9861 --cdp 9862 --md x.md --json x.json --brut b.json` ; `--relire b.json` refait l'analyse sans Chrome.
Il faut d'abord assembler `index.html` depuis les morceaux, sinon les lignes des piles sont fausses.

## Résultat (5 passes identiques, 0 erreur ; tableau complet : `programmes-tableau.md`)
- **165 programmes** liés au lancement : 161 sous le serpent, 4 pendant le film. three en garde 165 vivants, `dbgChauffe().programmes` = 165. Classe 1 (`PRF.on`).
- **64 viennent de `code/maps/` : INTOUCHABLES.** Les plus gros : jade-2 11, canyon-relief 8, orbite-geants 6, ville-v3 5.
- Hors maps : triptyque-bloom 20, scene-ciel 10, garage-salle 7, fruits-auras 6, autoroute 5.
- Jumeaux : 3 groupes EXACT (3 programmes en trop), 12 groupes INERTES (13 en trop), 22 groupes DEFINES (vrais variants).

## Correctifs proposés (NON codés), hors maps, image identique, classés par gain
1 programme évité ≈ 0,10-0,15 s à froid (26 s pour ~176, build de Léo). À chaud, le gain est inconnu (plus petit).

**1. Halo : ne plus préparer les matières de passe jamais dessinées. 9 programmes.**
- `interface/vignette-moteur.js:350` (`lierPasses`) prend TOUTES les matières des passes du composer.
- Sur le chemin par défaut (`fuse` + `plie`, `rendu/triptyque-bloom.js:366-399`), ces neuf matières ne sont jamais dessinées :
  - `materialHighPassFilter` (#76) ;
  - `separableBlurMaterials[0]` (#77, remplacé par `_p0`) ;
  - `compositeMaterial` (#82, remplacé par `_cMat`) ;
  - `materialCopy` (#83) ;
  - `basic` (#84, qui est aussi le jumeau EXACT de #155 coccinelle) ;
  - `_p2[3]`, `_p2[4]` (#87, #88 : seulement avec `?bloom=plie2d`, triptyque-bloom.js:450) ;
  - en classe 1, `separableBlurMaterials[4]` et `_pv[4]` (#81, #93) : le niveau HAUTE N2 s'arrête à 4 étages.
- Correctif : un filtre commun `passeUtile(p,m)` dans `lierPasses` (l.350) ET dans `lierPassesPretes` (l.375). Il faut les deux, sinon `neuf` reste vrai à chaque image et `lierPasses` repart en boucle.
- Le filtre écarte :
  - les 5 matières d'origine et `_p2` quand `p.fuse&&p.plie!==false&&!p.plie2d` ;
  - les étages ≥ au maximum que la classe peut atteindre (`PRF.on` : mips du niveau `PRF.nMax`), sur téléphone seulement. L'ordinateur garde ses 5 étages.
- Garder les étages du niveau HAUTE (#80, #92), car le réglage change à chaud.
- Une matière écartée qui serait quand même dessinée (`?bloom=ancien`, banc) se compile à son 1er dessin, comme avant la liaison douce.
- Ce gain n'existe que si `KHR_parallel_shader_compile` est présent : sans l'extension, `lierPasses` ne tourne pas. À lire sur le 13 Pro : `dbgLier().ext`.

**2. three : ignorer le contexte de la scène pour les matières qui n'en dépendent pas. 9 programmes (8 hors maps, 1 paire maps réunie sans toucher maps/).**
- `VERSION PRINCIPALE/vendor/three.min.js`, `getParameters` (repère : `fog:!!_,useFog:r.fog,` puis `doubleSided:2===r.side,flipSided:1===r.side,` et `numDirLights:a.directional.length,…shadowMapEnabled:`). Après l'objet des paramètres, et seulement si le matériau n'a ni `onBeforeCompile` ni `customProgramCacheKey` propres :
  - (a) `useFog` faux → `fog=fogExp2=false`. Le prefixe n'écrit `USE_FOG` que si `useFog&&fog`.
  - (b) MeshBasic, LineBasic, Sprite, Points, ou ShaderMaterial `lights:false` → nombres de lumières et d'ombres à 0, `shadowMapEnabled=false`.
  - (c) Matériaux de base seulement → `doubleSided=false` (le basique ne lit jamais `DOUBLE_SIDED` ; le culling reste réglé par `material.side`). Garder `flipSided`, qui est lu dans les blocs `USE_ENVMAP`.
- Simulé sur le relevé : 165 → 156, garde-fou 0. Paires réunies :
  - ciel `plein` scène du menu / scène nue du `ciel2` (#1/#100) ;
  - buildcar:399 / impact:317 ;
  - ailes:127 / orbite-2 (maps) ;
  - musique-frenesie:555 / ligne-parfaite:283 ;
  - garage-salle:9 ×2 ;
  - bloom `basic` / moteurs-originaux:29 / moteurs-themes:19 ;
  - vignette-moteur:93 / :179 ;
  - nuages-embellie ×2 (maps).
- Il y a déjà eu des retouches de three (liaison douce, VAO). Pour que l'ordinateur ne change pas d'un octet de comportement, garder ce correctif derrière un drapeau posé par le jeu sur `TEL_NATIF`.

**3. three : `vertexAlphas` vaut tantôt `false`, tantôt `undefined`. 1 programme.**
- Même vendor, `vertexAlphas:!0===r.vertexColors&&x.geometry&&…` → `vertexAlphas:!!(…)`.
- Les deux valeurs sont fausses, donc la source est identique : c'est le jumeau EXACT `lpMat` #52/#55 (`voitures/echappements.js:346`, une tôle sans attribut couleur).

**4. La caisse-nuage partage le programme des nuages. 1 programme.**
- `gameplay/zones-caisses.js:197` : `'nuageCaisse'` → `'nuageV2'`.
- Même `nuageShader`, même type, sources identiques au caractère (jumeau EXACT #46/#69 de `maps/nuages-coton.js:76`, qu'on ne touche pas).
- Risque : si les maps changent un jour le shader de `CLOUD_MAT`, la clé partagée deviendrait fausse. Mettre une ligne de commentaire de chaque côté.

**Écartés** (image ou coût changés) :
- jumeaux SOURCE `scene-ciel` #96/#101 : `uBasTr` est partagé, il ne vaut pas toujours 1 ;
- `vignette-moteur:93/107` (`discard` ajouté sur tout le quad) ;
- `lpMat` studio `fstuHdr` ;
- `autoroute:183` (deux motifs réels) ;
- `final-spin` (`code/economie/`, interdit) ;
- MeshBasic / LineBasic #17/#38 (1 programme, `combine`/`skinning` non définis : à faire avec le 2 si on veut).

**Total : 20 programmes (165 → ~145), soit ~2-3 s à froid estimés. Rien de mesuré sur téléphone.**

## Vérifié / non vérifié
- Vérifié :
  - l'outil tourne (5 passes identiques, 0 erreur, Chrome fermé, verrou rendu) ;
  - toutes les origines sont attribuées (0 programme sans matériau) ;
  - les jumeaux EXACT et la simulation ont été contrôlés sur les sources finales ;
  - le chemin du halo a été lu dans le code.
- Non vérifié :
  - aucun correctif n'a été codé ni photographié ;
  - Chrome n'est pas WebKit : la liste des programmes peut différer sur iPhone (extensions, `LIER.X`) ;
  - la classe 1 n'a été vue qu'en BASSE.

## À mesurer sur le 13 Pro
- `dbgLier().ext` : si l'extension manque, le gain du 1 tombe.
- `dbgChauffe().programmes` avant et après.
- Durée de `chauffe` dans la ligne `chargement` du lot 1, 3 lancements à froid (après installation d'un build) et 3 à chaud.
