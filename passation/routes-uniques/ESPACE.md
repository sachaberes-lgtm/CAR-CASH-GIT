# L'ESPACE (orbite) — LA ROUTE UNIQUE (2026-11-17)

Demande de Sacha : « c'est toujours la même chose… les mêmes modules, la map a globalement la même direction. Je veux des virages vraiment aléatoires : on roule 100 m, un virage pendant 50 m, ça descend, ça remonte… Les modules on les voit pas assez. Une expérience totalement différente à chaque partie. Optimisé. »

Interrupteur : `ORB_RU` (= `ROUTES_U && ORB_KM && !?orb=`). **`?sans=uniques` rend la route d'avant au bit près** (prouvé, voir « Preuves »), avec et sans `?espace=voyages`. Nuages, ville, crypto inchangées (même empreinte, RU allumé ou non).

## Ce qui a changé, fichier par fichier

- **`code/maps/orbite-uniques.js`** (morceau neuf, inscrit dans `ORDRE.txt` juste après `orbite-voyages.js`) :
  - `orbUPlan(g)` : LE PLAN d'une graine, tiré une fois et gardé par `ruPlan('espace',g)` (les essais du directeur de rythme, le pré-bâti puis le vrai départ rendent la même route). Il tire au sac commun (`ruChoix`, `ruOrdre`, jamais le choix de la route d'avant) : l'humeur, le voyage (ils ne font plus que PENCHER les poids, 0,7 à ~1,4), l'ouverture, la silhouette (+ miroir, ampleur, phases), le relief, la fin, l'ordre des 20 grands modules et des 8 petits (tressés : jamais 3 grands ni plus de 2 petits de suite), le temps fort (`cx`, le 1er grand tour du sac) et sa place (`cxU`, uniforme 4-92 % de la route), le style des liaisons.
  - `orbUProfil` / `orbUProf` : LE RELIEF (nœuds part-de-route → multiple de la pente) : rampe (l'ancienne) · douce (×0,42-0,58) · raide (×1,3-1,45) · paliers (marches ×1,45-1,75 / replats ×0-0,15, 1-4 s) · vagues (forts ×1,35-1,6, creux ×0,35-0,65, et une fois sur deux une REMONTÉE ×−0,18 à −0,42 = +4 à +12°). Une fois sur deux paliers/vagues commencent par le creux.
  - `orbUModules` : 7 PETITS MODULES (primitives d'`orbModules`, aucun décor ni matière) — `mur` (60-95° couché 62-72°, calme), `esse` (deux virages opposés couchés ~38°, calme), `marche` (marche raide puis palier en S, figure), `bosse` (une bosse dans un S, figure), `quart` (couché 77-86° sur une courbe douce, calme, jamais l'envers), `chicane` (30-38° / 60-76° / 30-38°, calme), `plongeon` (~2 s de piqué +15-20°, ressource en S, figure) ; + `lacet` (l'existant, à 2,5 rP). Places dans `ORB_DR`, noms dans `ORB_NOM`.
  - `orbUJoue(X)` : LE PILOTE qui remplace la phrase de rythme pour une route à plan : ouverture → modules dans l'ordre du plan (ce qui tient, avec les règles d'`orbModules`) → le temps fort à sa place → la fin → de grands virages doux jusqu'à la droite d'arrivée (longueur visée tenue : 8936 m p0 / 11512 m p10, comme avant).
  - `orbUMarque(g)` : la route gardée vieillit le sac (`ruMarque`, une fois par graine) ; `dbgOrbU()` ; `?orbouv= ?orbsil= ?orbrel= ?orbfin= ?orbcx=` imposent un choix (banc, essais en jeu).
- **`code/maps/orbite-modules.js`** : `ORB_RU` ; les petits modules ajoutés à `M` sous `K.ru` ; `orbModules` rend `ru:{…}` (ses outils, `ok(k)` = les règles de `tire` : une fois par route, une faille OU une cascade, faille à l'envers seulement ≥ 100 s, jamais deux grands tours de dalle d'affilée ; `joue(k,pose,cx)` = `note` + la pose + la marque climax sur le seul temps fort) ; `M.lacet(aa,kk)` accepte un rayon (sans `kk` : identique).
- **`code/maps/orbite-voyages.js`** : `ORB_VOY = ORB_RU || ?espace=voyages` (les 10 modules, géants et décor des voyages dans le sac de toutes les routes) ; `orbVoyAxe` sait `derive` (l'axe part d'un côté et y reste) et `libre` (deux houles d'axe).
- **`code/maps/ville-entree.js`** : `genCtrl` tire `ORB_UG` (la graine du plan, un `rnd()` de plus SEULEMENT sous RU en orbite), essaie **3** géométries au lieu de 6 pour une route à plan (`ORB_UN`, `?orbun=`), marque le sac après le choix ; `genCtrl1` pose humeur/voyage/silhouette du plan avant `orbModules` (`ORB_PIOCHE.hum/vo`), remet `ORB5.prof/s0U` à zéro, et appelle `orbUJoue` à la place de la phrase.
- **`code/gameplay/route-sans-haut.js`** (pisteTord, tout gardé par `ORB5.prof`, nul hors RU) : (1) le départ tenu `s0` = max(150, 1,2·vC) au lieu de max(450, 1,8·vC) → le 1er module peut commencer vers 230-300 m ; (2) la pente visée suit `ORB5.prof` (bornée à tan 35° : au-delà le lacet d'un virage tourne l'horizon à > 60°/s) ; (3) `RAPU` : le rappel vers le ciel deux fois plus lent (demi-tour en 8 s de croisière, 5 dans l'arrivée) — MESURÉ : à la sortie d'un petit module à repère libre la dalle revenait de ~30° en 0,4 s (80-120°/s vus de l'horizon). Plus lent encore (12-16) casse les failles (dalle pas à l'endroit au bord) : testé, rejeté.
- Bancs : `charge.cjs` et `uniques/routes.cjs` chargent `route-uniques.js` et `orbite-uniques.js` **et `route-sans-haut.js` en premier (l'ordre du jeu, ORDRE 87 < 91 : `ORB_RU` lit `ORB_KM`)** — empreintes `?sans=uniques` inchangées ; `uniques/mesure.cjs` : catalogue « uniques » (ruban + voyages + petits, sans le croisement) ; `orbite-v5.cjs` : `sans=uniques`.
- **Je n'ai touché ni aux `jade-*` ni à `route-uniques.js`.** `VERSION PRINCIPALE/index.html` réassemblé (`--depuis-morceaux`). `sw.js` NON incrémenté (à faire au commit).

## Ce qui dépendait du squelette, et comment c'est gardé
- **La lueur de la rentrée** (`geantsTick`) suit la marque `plongee` ; sans plongée (fins « lacet » et « module », ~49 % des routes) elle prend les ~1,5 derniers km avant le portail (repli existant). **La planète qui grossit** ne dépend que de s/L : intacte.
- **Le plus gros géant** (`nu.gros`, `orbite-roches`/`geants`) n'existe que sur une rentrée : ailleurs les géants prennent d'autres genres (code existant).
- **L'arrivée tenue à l'endroit** : `finO` est toujours réservé ; aucun module n'est posé dedans ; la plongée y finit comme avant ; les autres fins y mettent de grands virages doux (≥ 30°, ≥ 3 rP). Zones refusées par pisteTord : **seulement la plongée** (comme avant, par construction : 32/32 avant, 17/32 après car une route sur deux n'a plus de plongée).
- **La marque `climax`** : un seul module par route (le temps fort), retirée de la rentrée et de la plongée. Lecteurs : banc juge, enregistreur, `dbgMods` (aucun effet de jeu trouvé).
- **Le budget d'envers** : `envS` d'`orbModules` + la réserve du temps fort ; temps fort choisi seulement s'il tient (place ET envers ≤ 0,92 × budget) ; sur une route courte sans grand tour possible (paliers ~15+), le temps fort est un virage au plafond (surbaisse, fronde, dévers inversé, plongeant) et la rentrée se prend au plafond (comme avant). Un manque d'envers (< 11 % prévu) fait préférer un module qui passe l'envers quand il reste < ~22 s.
- **« jamais plus de ~9-10 s du même côté »**, `capMax`, sens : `cote()` d'orbModules pour chaque geste ; l'axe (`derAx`) avance à chaque geste et module.

## Tableaux avant / après (banc Node, 200 graines de suite, mémoire enchaînée comme une séance)
Sources : `passation/routes-uniques/avant/espace-defaut-*` et `passation/routes-uniques/apres/espace-defaut-*` (résumé + PNG faisceau / 12 parties).

| | p0 avant | p0 après | p10 avant | p10 après |
|---|---|---|---|---|
| cap à 300 m : ± et [p5;p95] | 39,2 [−46;44] | 30,5 [−45;44] | 3,7 [−4;4] | 4,8 [−7;7] (*) |
| cap à 500 m | 16,2 [−27;23] | 47,6 [−86;83] | 30,5 [−35;35] | 32,9 [−47;47] |
| cap à 1 / 2 / 3 km | 59 / 53 / 129 | 52 / 57 / 61 | 9 / 72 / 64 | 57 / 63 / 62 |
| x (faisceau p5-p95) 500 m / 1 km / 3 km | 335 / 377 / 2555 m | 402 / 1158 / 3575 m | 121 / 669 / 2276 m | 175 / 956 / 3689 m |
| y : ± et à 300 m / 1 km / 3 km | 13 / 38 / **98** | 36 / 136 / **366 (×3,7)** | 14 / 40 / **105** | 21 / 152 / **369 (×3,5)** |
| pente dans l'ouverture (± et, 300-600 m) | ±2,6-2,9° | ±13-15° | ±2,9-3,1° | ±10-16° |
| formes distinctes 1,5 km < 100 / **200** / 300 m | 18 / **6** / 3 | 122 / **35 (×5,8)** / 11 | 6 / **2** / 2 | 73 / **19 (×9,5)** / 9 |
| paires de routes à < 200 m (RMS 3D, 1,5 km) | 38 % | 8 % | 50 % | 13 % |
| 1er module : distincts / le plus fréquent | 9 / surbaisse 23 % | **28 / plongeon 11 %** | 6 / cascade 33 % | **27 / plongeon, mur 14 %** |
| début du 1er module | 751 ± 62 m | 431 ± 156 m (dès ~230 m) | 1398 ± 144 m | 654 ± 296 m (dès 270 m) |
| suites complètes distinctes | 71 / 200 | **200 / 200** | 19 / 200 | **200 / 200** |
| modules par route (distincts) | 5,9 | 5,7 [4-8] | 4 | 4,5 [2-6] |
| catalogue vu | 13 / 14 | 30 / 30 | 9 / 14 | 29 / 30 |
| fin rentrée + plongée | 100 % | **22 %** | 100 % | **22 %** |
| amplitude du cap (méd.) / fin vue du départ ± et | 459° / 118° | 231° / 57° | 389° / 110° | 215° / 55° |
| ms par route (mesure, séance de 200) | 57 | 30 | 61 | 35 |

(*) à p10, les 268 premiers m sont la droite du portail de genCtrl1 (110 × LV), inchangée.

Présence de chaque module (part des routes), après — **p0 : tous ≥ 8 %** (spirale 8, marches 10, bosses 10, plongeant 11, bobsleigh 11, balancier 12… chicane 34, plongée 51). **p10 : sous 8 % les plus longs** (pique 6, bosses 5, spirale 5, balancier 4, cascade 4, marches 3, ceinture 3, bobsleigh 2) et la faille à l'envers 0 (elle exige ≥ 100 s de croisière, règle gardée). À p10 une route ne tient que ~2 grands modules dont le temps fort (7 candidats) ; un module de 13-16 s ne tient qu'en 2e place, après réservation du temps fort.

### Sécurité (orbite-v5.cjs, 32 graines, p0/p10/p20, avant → après)
| | avant | après |
|---|---|---|
| contacts | 0 / 0 / 0 | 0 / 0 / 0 |
| zones refusées hors plongée | 0 | 0 |
| même côté max (s) | 13,6 / 12,9 / 20,6 | 11,2 / 9,9 / 9,1 |
| envers méd. (max) | 12 (18) / 7 (13) / 6 (6) % | 10 (17) / 10 (16) / 9 (15) % |
| envers de suite max | 5,9 / 3,5 / 0 s | 6,9 / 6,2 / 4,3 s |
| droite max (pire) | 1,2 / 2,2 / 1,1 s | 2,9 / 2,2 / 3,0 s |
| **roulis vu de l'horizon, max** | **44 / 43 / 66 °/s** | **68 / 64 / 52 °/s** (méd. 43 / 42 / 40) |

Roulis par zone (diagnostic `roul.cjs`, 96 routes) : liaisons > 45°/s 0,1 % du temps, pointe 68 ; les bosses (voyages) 66 — **la variante voyages d'avant faisait déjà 76 dans ses bosses** ; lacet 60. Les modules calmes (mur, esse, quart, chicane, géants, S retourné…) restent ≤ 45.

### Temps de génération (tirage-ms.cjs, genCtrl + pisteTord, 16 graines, alternés)
avant 50 / 52 / 53 ms (méd., p0/10/20 ; pire 60 / 60 / 57) → **après 33 / 42 / 47 ms** (pire 41 / 48 / 49) : 3 essais du directeur au lieu de 6 (la variété vient du plan ; contacts toujours 0). Machine chargée : refaire en alternance.

## Preuves `?sans=uniques` (empreinte.cjs, graines 1-12, p0 et p10)
Référence = l'arbre avant mes changements (même worktree, mesuré d'abord) :
- `?sans=uniques` : ville, crypto, nuages, espace **identiques au bit près** ;
- `?sans=uniques&espace=voyages` : identiques au bit près ;
- RU allumé : seules les lignes `espace` changent (ville, crypto, nuages identiques) ; `?espace=voyages` sous RU = sans (ORB_VOY déjà vrai).
(vitree : `VIT_SOL is not defined` au banc, avant comme après.)

## Juge de la charte (juge-node.cjs) — NON lancé
`juge-node.cjs` lit `juge-page.js` à un chemin Windows (`C:/Users/sacha/…/wt-juge/outils/banc-juge/juge-page.js`) : **ce fichier n'existe pas sur ce Mac** (ni dans le dépôt, ni dans l'historique). À lancer sur le PC (`JUGE=<chemin> node outils/banc-routes/juge-node.cjs . paliers=0,10,20 graines=1-8`). Ce que je prévois : R3 (roulis max ≤ 60) **risque d'échouer** à p0/p10 (pointes 64-68 °/s, voir plus haut) — la variante voyages publiée (29/30) avait la même faiblesse ; R13 (envers ≥ 6 % sur chaque route) peut échouer sur ~5 routes sur 96 (mesure orbite-v5 : 3-4 %, routes dont le seul envers est la petite lune ou un dévers inversé) ; R5 (variété) devrait passer largement ; R6 (raccourcis p0) : le lacet n'est plus imposé (fin « lacet » ~1 route sur 4, petit module ~1 sur 3) — à vérifier.

## Ce qui reste à voir DANS LE JEU (banc Chrome, format iPhone)
1. **Le départ** : le 1er module dès ~230-300 m (départ tenu de pisteTord ramené à 150 m) — la caisse est-elle lancée ? le lâcher, le portail, le décor du départ (`?orbouv=direct`, `?orbouv=plongeon`).
2. **Les géants des voyages ajustés à la route bâtie** (roue, petite lune, astéroïde percé, nébuleuse) placés n'importe où dans la route (avant : seulement en climax/temps fort tardif) : décor, jante, tunnel, saut refusé, coût (`?orbcx=roue|lune|asteroide|nebuleuse`), `dbgVoyage()`.
3. **La lueur de la rentrée** sur les fins sans plongée (`?orbfin=lacet|module`) : repli sur les 1,5 derniers km — à regarder ; et la fin « virage + plongée seule » (`?orbfin=virage`).
4. **La caméra** sur les reliefs neufs : remontées de +4 à +12° (`?orbrel=vagues`), replats (`?orbrel=paliers`), pente raide 35° (`?orbrel=raide`) ; la caisse tient-elle sur la crête d'une remontée (courbure bornée par tangBas comme avant, mais la caisse arrive plus vite sur une pente plus douce) ; le saut au sommet d'une remontée.
5. **Les petits modules** (mur, esse, marche, bosse, quart, chicane, plongeon) : lisibles ? roulis ressenti ; pièces posées dessus.
6. **Le rappel vers le ciel ralenti** (RAPU) : la dalle reste un peu plus longtemps penchée après une figure — ressenti ?
7. `toutes.mjs` : pas besoin de l'adapter (générique) ; le lancer sur `cartes=espace` pour les exceptions.

## Doutes
- Le roulis (R3) : 64-68 °/s en pointe à la sortie des figures des voyages (piqué, bosses, marches) — j'ai corrigé l'essentiel (88-126 → 68) mais pas tout ; si le juge refuse, piste : borner la pente du profil autour de ces figures, ou retirer le piqué des 1ers modules.
- `ORB_ENVS` surestime l'envers réel de certains modules (petite lune 3,4 s prévus ≈ 4 % de la route) : le plancher d'envers par route n'est pas garanti à 100 %.
- À p10 les modules de 13-16 s restent rares (< 8 %) ; la faille à l'envers absente (règle ≥ 100 s gardée).
- La note du directeur de rythme monte (2,6-3,7 contre 1,9-2,0) : ses cibles (droites, douilles) ont été réglées pour la phrase d'avant ; elle ne sert qu'à choisir parmi 3 géométries du même plan.
- Le plan ne dépend pas du palier : au palier élevé, l'ordre est le même mais la route s'arrête plus tôt.


## TOUR 2 (2026-11-17 après-midi) — UNICITÉ STRICTE et ROULIS ≤ 60 °/s

### 1. Chaque route est unique (Sacha : « il faut que vraiment chaque route soit unique »)
- `genCtrl` (ville-entree.js) : après le choix du meilleur essai et AVANT `ruMarque`, si la suite jouée (`orbUNoms()` : les modules dans l'ordre, un géant = un nom) a déjà été jouée (`ruDeja`, 400 dernières), la route est refaite sur une variante de son plan (`orbURefait` → `ruRefait`), **cinq fois au plus, d'un seul essai chacune** (~10-15 ms). `orbUPlan` hache sa variante `v` ; dans une variante, les modules de la suite rejetée pèsent ×0,15. `?sans=uniques` : rien ne change (empreintes identiques, voir plus bas).
- Aux paliers rapides (route de moins de 40 s réelles, `court`), une route ne tenait que 2 modules → des redites (palier 27 : 100 suites sur 300). Élargi HONNÊTEMENT (plus de modules qui tiennent, aucun faux nom) :
  - la fin : la désorbitation (~12 s) ne reste que sur le plan d'origine (v = 0) ; dans une variante, la plongée seule ; le lacet de fin (~6 s à 400 m/s) devient « dernier module » ; une variante refaite 2 fois finit sur son dernier module ;
  - l'ouverture en ~1 s (arcs plus courts) ; les liaisons plus courtes (1 s au plus, 35 % de modules collés) ;
  - les petits modules calmes en 72 % de leur temps (`OU_KC`), les grands qui ne passent pas l'envers en 74 % (`kRU`, posé par `ru.joue`) — **ceux qui passent l'envers gardent leur temps** (raccourcis, ils n'atteignaient plus le plafond : envers à 2 % au palier 20) ;
  - le temps fort d'une route courte est d'abord un virage au plafond (surbaisse, fronde, dévers inversé, plongeant) ; une variante refaite 3 fois ne réserve plus de temps fort (la marque va au plus grand module) ; pas de lacet dans une variante.
- Preuve (`outils/banc-routes/uniques/unicite.cjs carte=espace n=300 palier=…`, code de sortie 1 s'il y a une redite), 300 routes DE SUITE, deux séries de graines (1-300 et 1001-1300) :

| palier | suites différentes | redites | modules par route | ms/route (moy.) |
|---|---|---|---|---|
| 0 | 300 / 300 | 0 | 5,7 [4-8] | 30 |
| 10 | 300 / 300 | 0 | 4,5 [2-6] | 36 |
| 20 | 300 / 300 | 0 | 4,1 [2-6] | 41 |
| 27 | 300 / 300 | 0 | 3,3 [1-5] | 37-47 |

  Avant (`sans=1`) : palier 0 → 83 / 300 ; palier 27 → **1 / 300** (« la même route » à chaque partie).
  Limite honnête : au palier 27 sur **600** routes de suite il reste ~6 % de redites (la mémoire en garde 400, et une route de ~25 s n'a que ~3 modules : quelques centaines de suites possibles). Séance par séance (300 routes) : 0.
- Temps (séance de 300, avec les reprises) : palier 0 méd. 29 / p95 33 / pire 62 ms ; palier 27 méd. 36 / p95 43 / pire 69 ms. `tirage-ms.cjs` (graines 1-24, alternés) : avant 45-46 / 50 / 52-55 / 46 ms → après 31 / 36-37 / 40-41 / 37 ms (paliers 0/10/20/27).

### 2. Le roulis vu de l'horizon ≤ 60 °/s
Causes trouvées (diagnostic par zone, 80 graines par palier) et remèdes, tous sous `ORB_RU` ou `K.ru` :
- le **piqué** sortait la dalle couchée de ~50° (vue de l'horizon) et revenait à 73°/s : sortie plus longue (0,7 s de droite + un arc de 2,6 s au lieu de 1,6) ;
- les **marches** : marche à 14° (au lieu de 17), palier à 21° (au lieu de 27), arc plus long (3,2 s) ; les **bosses** : 14-18° (au lieu de 19-24) ;
- après une figure à relief (piqué, marches, bosses, marche, bosse, plongeon, lacet) : **le rappel vers le ciel encore plus lent pendant 2,5 s** (un demi-tour en 14 s de croisière au lieu de 8), **sauf** à moins de 3 s d'une faille ou d'une cascade (la dalle doit y être à l'endroit : plus lent partout, les failles passaient à 108-200°/s — essayé, rejeté) ; puis ~1 s de droite et un grand arc doux (5-6 rP) ;
- les **liaisons** jamais sous 2,7 rP (2,4 sur une route courte) : deux arcs opposés plus serrés sur une pente de 35° faisaient 77°/s à leur jonction ; la **chicane** à 2,8-3,2 rP ; le **lacet** à 3,2 rP ; la pente du relief bornée à 32° (au lieu de 35).
- Essayés et rejetés (pires) : coupler le rappel au dévers partout (les failles cassaient), couper le dévers après une figure (le dévers revenait d'un coup).

orbite-v5.cjs, 32 graines, avant (`sans=uniques`) → après :

| | p0 avant | p0 après | p10 avant | p10 après | p20 avant | p20 après |
|---|---|---|---|---|---|---|
| **roulis max** (méd.) | 44 (42) | **54 (42)** | 43 (41) | **58 (41)** | 66 (41) | **54 (43)** |
| contacts | 0 | 0 | 0 | 0 | 0 | 0 |
| zones refusées hors plongée | 0 | 0 | 0 | 0 | 0 | 0 |
| modules / route méd. (min) | 6 (5) | 7 (5) | 4 (4) | 6 (4) | 3 (3) | 4 (3) |
| envers méd. (max) | 12 (18) % | 10 (16) % | 7 (13) % | 10 (16) % | 6 (6) % | 6 (10) % |
| routes sous 6 % d'envers | 0 / 32 | 1 / 32 | 3 / 32 | 0 / 32 | 12 / 32 | 14 / 32 (une à 0 %) |
| envers de suite max | 5,9 s | 6,8 s | 3,5 s | 5,6 s | 0 | 0 |
| droite max (pire) | 1,2 s | 2,9 s | 2,2 s | 2,8 s | 1,1 s | 2,9 s |
| même côté max | 13,6 s | 9,5 s | 12,9 s | 11,5 s | 20,6 s | 15,0 s |

Diagnostic de zone (80 graines) : pointes 57 (p0, dans les marches) / 59 (p10, chicane ou piqué selon le tirage) / 54 (p20) ; le dépassement de 45°/s n'occupe jamais plus de 0,4 % du temps d'une zone.

### Doutes du tour 2
- Le roulis reste tenu par des marges, pas par une garantie : sur 80 graines par palier le pire est 57-59 ; un tirage malheureux peut s'approcher de 60.
- L'envers au palier 20 : la moitié des routes sous 6 % (comme avant : 12 sur 32), une à 0 % — sur une route courte, choisir entre un 2e module qui passe l'envers et la variété.
- Les reprises : 5 au plus, une seule géométrie chacune ; la pire route d'une séance passe de ~55 à ~69 ms au palier 27.
