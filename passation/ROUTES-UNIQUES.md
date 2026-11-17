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

## 4. Espace

(à remplir : `passation/routes-uniques/ESPACE.md`)

## 5. En jeu, coût, contrôle adverse

(à remplir : `passation/routes-uniques/JADE-EN-JEU.md`)

## 6. Restes et pièges

- `?map=jade` / `?niveau=jade` jouent une graine fixe (`NIV_JADE.graine`) : même vallée à chaque fois, ce n'est pas le JOUER normal. Tester par JOUER.
- Sacha n'a pas encore joué cette branche.
