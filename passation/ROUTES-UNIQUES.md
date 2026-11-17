# ROUTES UNIQUES — Jade et l'espace (2026-11-17)

Demande de Sacha : « c'est mieux qu'avant mais c'est toujours la même chose : les mêmes modules, la map a globalement la même direction. Jade commence toujours
par une boucle, une grande descente et une autre boucle. Il faut que la map soit unique à chaque fois, une expérience totalement différente à chaque partie.
Et optimisé. »

Branche `routes-uniques` (worktree `~/cash-car/routes-uniques`), partie d'`origin/qualite-appareil` (4324e2b91) + `origin/qa/jadeprebati` (88a648892).
**Non fusionnée, aucun build.** Interrupteur : **`?sans=uniques`** = le tirage d'avant, à l'identique (empreintes au bit près).

## 1. La cause (mesurée sur 200 graines par map, `passation/routes-uniques/DIAGNOSTIC-AVANT.md`)

Ce n'était ni la graine (tirée au hasard à chaque route) ni le « meilleur de N essais ». **Les deux générateurs écrivaient un squelette fixe ; le hasard ne
choisissait que la déclinaison de chaque rôle.** Et les modules ajoutés le 16/11 dormaient derrière deux drapeaux éteints (`?jade=avatar`, `?espace=voyages`) :
dans le jeu, personne ne les voyait.

**Jade** (`jade-alleluia.js`) : la file était toujours `[scène A] → boucle → envers → balcon (le grand piqué) → boucle → [scène B]`. Les quatre « raccourcis »
sont des boucles de 342°. La scène A n'existe qu'aux paliers 0 à 5 : dès le palier 6, la route commence par la boucle — **boucle, grande descente, boucle,
mot pour mot la plainte**. L'ouverture est écrite (200 m à plat, puis 0,8 s à −16°) ; les liaisons plongent toutes à 30-38°.

| Jade, 200 routes | palier 0 | palier 10 |
|---|---|---|
| suites de modules différentes | 16 | **4** |
| 1er module | 8 scènes, toujours à 312 m ± 0 | **une boucle, 100 %**, à 669 m ± 0 |
| modules vus | 15 | 7 |
| altitude à 1 km (écart-type) | ± 94 m | **± 1,1 m** |

**Espace** (`ville-entree.js` genCtrl1, `orbite-modules.js`) : `ouverture (droite + toujours le même demi-S) → 1 à 3 temps forts → climax → rentrée → plongée`.
La rentrée et la plongée sont dans 100 % des routes ; la pente est une constante (−32° ± 3° dès le portail) ; au palier 10, sur 1,5 km, les 200 routes ne font
qu'**une seule forme** (au miroir près) et 19 suites de modules.

Planches d'avant : `passation/routes-uniques/avant/*-faisceau.png` (200 tracés superposés, dessus + profil) et `*-12parties.png`.

## 2. Ce qui change — le principe (commun aux deux maps)

`code/gameplay/route-uniques.js` : **LE SAC**. Chaque map a un sac de tous ses modules ; une route y pioche au hasard pesé ; un module joué dans la route
d'avant ne revient presque jamais dans la suivante (poids × 0,03, puis × 0,2, × 0,5, × 0,8), un module pas vu depuis longtemps pèse plus lourd. Le sac se
souvient d'une partie à l'autre (`localStorage.cashcarRU`, quelques centaines d'octets), ainsi que de la dernière ouverture et des derniers tempéraments :
deux routes de suite ne partent jamais pareil. Le **plan** d'une route est tiré une fois par graine et gardé (essais, pré-bâti, REJOUER : même route).
Avec `?pistegraine=`, le sac n'a pas de mémoire : la route ne dépend que de la graine (une partie se rejoue). Crochet : `dbgRoutesU()` (`dbgRoutesU(1)` vide le sac).

## 3. Jade (`code/maps/jade-uniques.js`, branchements dans `jade-alleluia.js`, `jade-avatar.js`)

- **Plus de squelette** : aucun rôle n'a de place. La route peut commencer par un saut, un envers, le temps fort, un pont, une porte.
- **41 modules dans le sac** : les 15 scènes d'avant (les 2 familles fondues), les 17 des « verbes » (sortis de leur drapeau), et **9 petits modules neufs**
  de 1,5 à 3,5 s — porte, arche, gorge (le couloir de pierre), passerelles (les ponts), bosse, toboggan, épingle, île (on passe DANS l'île), remontée.
  Ils ne posent que des pics, tours et îles que la vallée sait déjà bâtir (mêmes gabarits, mêmes matières). Le plan les tresse avec les grandes scènes.
- **Sept ouvertures** tirées : calme, virage, plonge, balcon, bosse, esse, direct.
- **Cinq tempéraments de cap** : libre, dérive (une grande hélice), zigzag, serpent (un axe tenu jusqu'à ±100° du cap de départ), crochet.
- **Cinq reliefs** : falaise, plateaux, vagues (ça remonte), gradins, mixte. Les liaisons sont des petits gestes tirés (virage 30-110°, droite courte,
  marche, remontée, épingle, S), jamais deux fois le même de suite.
- Les boucles restent, rares (les quatre pèsent comme deux modules, une au plus par route).
- Gardé : le garde-fou « jamais 10 s dans la même direction », les crêtes arrondies à la vitesse, le tir des sauts à chaque essai, la note du juge, le
  meilleur de 10 essais, les essais en tranches (jadeprebati), le mémo de l'essai gagnant (sa clé porte le plan).
- Une route ne doit plus avoir deux sauts et un envers à chaque fois : la note ne punit que ceux qu'elle a et qui ne tiennent pas.
- La longueur : l'ancien paquet dépassait sa visée de 49 à 68 % ; le plan s'arrête à sa visée × 1,5 : la vallée dure autant qu'avant.

| Jade, 200 routes de suite | avant p0 | après p0 | avant p10 | après p10 |
|---|---|---|---|---|
| suites de modules différentes | 16 | **200** | 4 | **200** |
| 1ers modules différents (le plus fréquent) | 8 (13 %) | **40 (7 %)** | 4 boucles (28 %) | **40 (9 %)** |
| modules par route | 5 | **6,7** | 4 | **5,2** |
| modules vus sur l'ensemble | 15 | **41** | 7 | **41** |
| formes de dessus (≠ de plus de 200 m sur 1,5 km) | 17 | **59** | 4 | **34** |
| altitude à 1 km (écart-type) | ± 94 m | ± 106 m | ± 1,1 m | **± 107 m** |
| altitude à 3 km (p5 → p95) | — | −1202 → −437 m | — | −1161 → −104 m |
| temps de génération (Node, ms/route) | 119 | **94** | 168 | **124** |
| essais par route | 10 | 5,6 | 10 | 5,0 |

Planches d'après : `passation/routes-uniques/apres/jade-uniques-*.png`.
Bancs : `node outils/banc-jade/uniques-stat.cjs n=200 palier=0 [sans=1]`, `node outils/banc-routes/uniques/mesure.cjs carte=jade etiquette=apres out=passation/routes-uniques/apres nom=uniques`.

## 4. Espace (`code/maps/orbite-uniques.js`, branchements dans `orbite-modules.js`, `orbite-voyages.js`, `ville-entree.js`, `route-sans-haut.js`)

Détail et tableaux des quatre tours : `passation/routes-uniques/ESPACE.md`.

- **30 modules dans le sac** : les 13 de l'orbite, les 10 des voyages (sortis de leur drapeau, avec leurs géants et leur décor déjà optimisé par espaceopt),
  et **7 petits modules neufs** sans décor ni matière : mur, esse, marche, bosse, quart, chicane, plongeon.
- **7 ouvertures**, **7 silhouettes d'axe** (dont dérive et libre), **5 reliefs** (rampe, douce, raide, paliers, vagues), **4 fins** : la désorbitation
  (rentrée + plongée) n'est plus que dans ~1 route sur 5 ; le temps fort se place n'importe où.
- Chaque route est refaite si sa suite de modules, sa signature des 10 premières secondes ou sa forme sur 3 km a déjà été vue (reprises d'un seul essai, ~1 ms).
- Gardé : arrivée au portail à l'endroit, budget d'envers, pas de demi-tour sur place, rayons tenables, 0 contact de la route avec elle-même.

| Espace, 200 routes de suite | avant p0 | après p0 | avant p10 | après p10 |
|---|---|---|---|---|
| suites de modules différentes | 71 | **200** | 19 | **200** |
| 1ers modules différents (le plus fréquent) | 9 (23 %) | **27 (8 %)** | 6 (33 %) | **27 (9 %)** |
| début du 1er module | 751 m | ~430 m | 1398 m | ~650 m |
| formes de dessus (≠ > 200 m sur 1,5 km) | 6 | **33** | 2 | **18** |
| écart-type de l'altitude à 3 km | 99 m | **394 m** | 105 m | **392 m** |
| écart-type de la pente à 300 m | 2,9° | 12,8° | 3,1° | 9,4° |
| routes qui finissent par rentrée + plongée | 100 % | ~22 % | 100 % | ~22 % |
| modules vus | 13 | **30** | 9 | **29** |
| temps de génération (médiane, ms) | 46 | **27** | 50 | **35** |

Aux quatre paliers (0/10/20/27), 300 routes de suite × 2 séries de graines : **0 redite de suite de modules, 0 redite de signature**
(`node outils/banc-routes/uniques/unicite.cjs carte=espace n=300 palier=27`). Direction de fin vue du départ : médiane 80-119°, écart-type 93-120°.
Roulis max 52-59 °/s (avant 44-66). Routes avec ≥ 6 % d'envers : 199 / 200 / 175 / 192 sur 200.

## 5. Le contrôle adverse (`passation/routes-uniques/ADVERSE.md`, outils `outils/banc-routes/uniques/adverse/`)

Un agent indépendant a cherché à prouver que les routes se ressemblent encore, avec ses propres graines (32 bits au hasard) et sa propre mesure.
Ce qu'il a trouvé a été corrigé : l'envers disparu de 71-91 % des routes de Jade (rétabli : 65-82 % des routes), des creux sous le rayon tenable
(espace : 69-96 routes sur 200 → 0 ; Jade : 0 aux paliers 0 et 10), l'espace qui filait droit devant (fin à 39-43° du cap de départ → 80-119°),
des routes d'espace jumelles aux paliers rapides, la même graine qui ne redonnait plus la même route (corrigé : 10/10), la vallée de Jade 30-47 % plus
courte aux paliers rapides (alignée : la longueur visée × 1,5 → × 2,9).

Paires de tracés (sur 19 900) à moins de 50 m / 100 m l'une de l'autre sur les 3 premiers km, miroir compris, mesure de l'adverse :

| | palier 0 | palier 10 | palier 20 | palier 27 |
|---|---|---|---|---|
| Jade avant | 12 / 92 | 882 / 4958 | 2002 / 5311 | 1828 / 5432 |
| **Jade après** | **0 / 0** | **0 / 4** | **0 / 13** | **0 / 40** |
| Espace avant | 68 / 523 | 78 / 1088 | 2211 / 9364 | 1211 / 4542 |
| **Espace après** | **0 / 2** | **0 / 4** | **2 / 74** | **37 / ~360** |

`?sans=uniques` rend la route d'avant au bit près : 72/72 (Jade, avec et sans `jade=avatar`), 72/72 (espace, avec et sans `espace=voyages`),
216/216 (nuages, ville, crypto, qui partagent genCtrl1).

## 6. En jeu et coût

Jade, banc Chrome sous verrou, 390×844 (et 844×390), `tel=1`, `appareil=iPhone14,2`, 22 courses entières au pilote (`passation/routes-uniques/JADE-EN-JEU.md`,
`outils/banc-routes/uniques/jade-jeu.cjs`) : **0 exception, 0 `__jadeErr`, 0 heurt de décor (règle d'or), 0 mort, 0 recoupe, 0 caméra dans la roche,
0 programme lié en course** (149 au départ, 149 à l'arrivée), les 9 petits modules et les 7 ouvertures forcés un par un.
Un bug trouvé et corrigé en jeu : `JADE_RU.uTime` (un renommage de trop) qui cassait l'horloge des pierres.

| Jade, mêmes graines (102, 103) | appels de dessin moy / p95 | triangles moy / p95 (k) |
|---|---|---|
| avant (`?sans=uniques`) | 133-135 / 171-173 | 384-439 / 532-681 |
| avant + verbes (`?sans=uniques&jade=avatar`) | 123-133 / 159-164 | 315-404 / 465-602 |
| après | 128-141 / 161-244 | 340-402 / 465-612 |

Temps de génération (Node) : Jade 72-119 ms par route contre 100-284 (moins d'essais) ; espace 27-36 ms contre 46-52. Le pré-bâti reste en tranches
(les essais de Jade rendent la main à l'échéance, lot jadeprebati ; empreintes identiques d'un trait, en tranches et en mémo).

Espace en jeu (`passation/routes-uniques/ESPACE-EN-JEU.md`) : 14 routes neuves (graines 301-314, une en paysage, six à tirage forcé) + 2 d'avant :
**0 exception, 0 mort, 0 chute** (ni au départ, ni dans les petits modules, ni sur les remontées), arrivée au portail à l'endroit sur toutes, les 7 petits
modules, les 5 reliefs et 3 des 4 fins joués, les géants (roue, lune, astéroïde, nébuleuse) bâtis en cours de route sans erreur, 0 programme lié en course.

| Espace, mêmes graines (301, 302), 59 i/s | appels de dessin moy / p95 | triangles moy / p95 (k) |
|---|---|---|
| avant (`?sans=uniques`) | 43-46 / 110-118 | 118-124 / 353-360 |
| après | 47-50 / 123-132 | 120-135 / 345-425 |

**Le coût de l'espace monte de ~7 % en appels et ~5 % en triangles** (deux graines : un ordre de grandeur) : ce sont les géants des « voyages », jusque-là
éteints, qui sont maintenant dans le sac. L'espace reste la map la plus légère (≈ 48 appels moyens contre ≈ 134 à Jade).
Captures : `passation/routes-uniques/captures/{jade,espace}/` (JPEG, 2, 5 et 9 s après le départ de chaque route, petits modules de Jade de près et de loin).

## 7. Tests

- `node outils/banc-routes/uniques/test.cjs` (lancé aussi à la fin de `toutes.mjs`) : 200 routes de suite × paliers 0 et 10 × deux maps ; échoue si une suite de
  modules est jouée deux fois, si l'ouverture redevient écrite (écart-type de la pente à 300 m), si le faisceau se resserre (formes, altitude à 3 km),
  si le 1er module se concentre, si un module ne sort plus. **Vert.**
- `node outils/banc-jade/uniques-stat.cjs n=300 palier=27` et `node outils/banc-routes/uniques/unicite.cjs carte=espace n=300 palier=27` : 0 redite.
- Gardes : garde-demarrage, garde-allege, garde-charte, `assembler --verifier`.

## 8. Restes, honnêtement

- **Espace, palier 27** : 37 paires sur 19 900 restent à moins de 50 m sur 3 km (une route y dure ~25 s pour ~3 modules, et 3 km = 7 s dont la droite du portail).
- **Jade, palier 20** : des creux (compressions, pas des décollages) sous le rayon tenable sur ~90 routes sur 200, surtout dans les liaisons (2 avant) ;
  au palier 27 c'était déjà le cas de toutes les routes avant.
- **Jade** : l'envers n'est plus sur CHAQUE route (65-82 %) ni les deux sauts (0,5 tenu par route en moyenne) : c'était le squelette. À trancher par Sacha.
- **Roulis de l'espace** : pointes à 52-59 °/s aux paliers 0 et 10 (44 avant), sous la limite de 60.
- **Coût de l'espace** : +7 % d'appels de dessin (géants des voyages dans le sac). Pas une régression de code, du contenu en plus ; à mesurer sur le 13 Pro.
- **Non mesuré** : la plus longue tranche du pré-bâti sous CPU bridé (`prebati-bride.cjs`, 13 min par cas, banc occupé), la lueur de rentrée de l'espace sur
  une fin sans plongée, les sauts volontaires au-dessus d'un géant de l'espace, le sac non figé (sans `pistegraine`) joué dans le jeu (prouvé en Node seulement).
- **Jade, graine 203** : les six piliers fins du module `mur` sont refusés par le décor (aucun gabarit aussi fin dans la palette de cette vallée) : la scène
  se roule, le décor manque. L'ancien tirage perd le même mur.
- Le juge de la charte (`juge-node.cjs`) n'a pas tourné : son `juge-page.js` n'est que sur le PC.
- Le sac vieillit à la GÉNÉRATION d'une route (pré-bâti compris), pas à l'entrée réelle dans la map : une route pré-bâtie jamais jouée « use » ses modules.
- `?map=jade` / `?niveau=jade` jouent une graine fixe : même vallée. Tester par JOUER.
- L'historique de la branche porte 71 Mo de captures PNG parties par erreur dans le commit cd42765fc (remplacées depuis par des JPEG).
- `VERSION PRINCIPALE/index.html` et `sw.js` ne sont pas commités : réassembler (`node code/assembler.cjs --depuis-morceaux`) et incrémenter le cache à la fusion.
- Sacha n'a pas encore joué cette branche ; rien n'a été vu sur un vrai iPhone.
