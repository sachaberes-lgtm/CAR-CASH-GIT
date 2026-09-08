# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-08 (31e)

⚠️ **#30 TOUJOURS OUVERT — l'« 0 bonne coupe » était un ARTEFACT, corrigé, mais le fond tient.**

- Isomorphisme : toujours **VERT** (`check-iso.js` → 0.000e+0, `check-actions.js` → PASS,
  `check-eval.js` → PASS, re-lancés ce passage). `stepCar` intouché.
- **NOUVEAU commit `17ccb1a` (23:14)** ajoute `TRAIN.airStats` (`takeoffs`/`landings`/`goodCuts`),
  un compteur GLOBAL accumulé par `botStep`, jamais remis à zéro par le cycle de vie des bots. C'est
  LA métrique de santé de la voltige, exposée par `sim-train.js` (`RESUME.air`) et agrégée par
  `multi-train.js` (l.59/66/80). ➜ **Corrige le « 0 bonne coupe » structurel** que je citais en
  confirmation au passage 30 : ce « 0 » était la lecture de `b.goodCuts` APRÈS `newGen()` (bots
  recréés), pas une absence réelle de coupes. Mesuré depuis : **11 bonnes coupes** (commit note),
  taux d'atterrissage **MLP pur ~9 % / pilote+coupe ~24 %**.
- **MAIS le cœur de #30 reste VRAI** (code inchangé) : au décollage, `if(Math.abs(b.lat)>=ROAD_HALF-1.5)
  b.outs++` (désormais **l.12605**, était 12598). Le mode coupe vise `lT=side*(ROAD_HALF-1.0)` = ±13,
  `carDrive` bascule en `fall` quand `|lat|>14`, donc **|lat|≈14 > 12.5 → `outs++` tiré à chaque
  coupe consentie**. Chaque coupe paye −120 (`W_OUT`) avant de toucher `3×gainNet`. Le seuil
  d'équilibre reste **gain net > 40 m** ; la coupe type (30–80 m) est donc **neutralisée ou punie**.
  Le taux d'atterrissage 9 % (MLP pur) l'amplifie : ~91 % des décollages crashent avec `outs++`
  déjà facturé, sans jamais toucher `cutGain`.
- ⚠ **DÉRIVE DES NUMÉROS DE LIGNE** : `17ccb1a` ajoute +8 lignes (6 pour le champ `airStats` à
  l.12434, 2 dans `botStep`). Tous les ancres citées dans les bugs ci-dessous ont glissé : `outs++`
  12598→**12605**, `groundPilot` 12636→**12644**, décision de coupe 12665→**12673**, `side` 12668→
  **12676**, `W_CUT` 12782→**12802**, `W_OUT` 12801→**12809**, `fitness` 12792→**12812**,
  `tournament` 12800→**12820**, `newGen` 12810→**12830**. Le contenu, lui, n'a pas changé.
- Aucun des bugs ouverts (#31, #29, #23, #28, #27, #26, cosmétique 12→11) n'a été corrigé.

---

## Bug #30 (NOUVEAU, CRITIQUE) — le mode coupe déclenche la pénalité `outs` qu'il est censé libérer

- Le mode coupe (l.12665-12669) vise **délibérément le bord** : `lT = side*(ROAD_HALF-1.0)`, soit
  *au-delà* du clamp de conduite normal, pour faire décoller la caisse (carDrive → `mode='fall'`).
- Or au décollage, `botStep` compte une **sortie de route** : `if(Math.abs(b.lat)>=ROAD_HALF-1.5)
  b.outs++` (l.12598). `|lat|≈ROAD_HALF-1.0` au décollage → le seuil `ROAD_HALF-1.5` est **toujours
  franchi** : **chaque coupe = +1 out = −120** dans la fitness (`W_OUT=120`, l.12801).
- Face à ça, la récompense de coupe vaut `W_CUT=3` × gain net (l.12794/12605), et un gain n'est
  compté que si `gainNet>20`. **Seuil d'équilibre : gain net > 40 m** (3×40 = 120) pour seulement
  annuler la pénalité. Un raccourci réel fait 30–80 m : il est **absorbé par la pénalité**.
- C'est la cause directe du « 0 bonne coupe rentable » du HANDOVER : le bot coupe, économise
  ~40 m, et la fitness le PUNIT comme une sortie de route. La fitness combat l'action qu'elle veut
  apprendre.
- **Correction** : ne pas compter `outs` quand le décollage est **consenti par le mode coupe**
  (ex. `if(!WAS_CUT && |lat|>=ROAD_HALF-1.5) outs++`), ou réduire `W_OUT`, ou récompenser la coupe
  par-dessus le bord et réserver `outs` aux sorties non-suivies d'une voltige rentable.
- ✅ **REVISÉ (31e passage)** : le « 0 bonne coupe » qui « confirmait » #30 au passage 30 était un
  **artefact de mesure** (lecture de `b.goodCuts` après `newGen()`, bots recréés → toujours 0). Le
  commit `17ccb1a` le corrige avec `TRAIN.airStats` (compteur global) : **11 bonnes coupes**
  mesurées. Mais le FOND de #30 (le `outs++` à chaque coupe consentie) est inchangé et toujours vrai,
  cf. VERDICT. La coupe médiane reste neutralisée, seule la queue paie.

---

## Bug #31 (NOUVEAU) — le côté de coupe n'a ni zone morte ni cohérence `side<0`, sorties surchargées

- `side = outArr[MLP.HID+0]>0 ? 1 : -1` (l.12668) : seuil **0**, **aucune zone morte**. En vol, la
  même sortie steer n'agit qu'au-delà de **±0,33** (l.12573). Un tanh à +0,02 = « pas de braquage »
  en vol, mais = « coupe à droite » au sol. La décision de coupe est branchée sur du **bruit**.
- `lT = side*(ROAD_HALF-1.0)` ignore `b.side` : comme bug #29, sur la face du dessous `b.lat`/`b.psi`
  sont de signe opposé (déposés ×`sideL`, l.8855/8860), donc `lT−b.lat` vise le **mauvais** bord.
- Surcharge des sorties : steer(→côté) et nitro(→« couper maintenant », seuil 0.5) cumulent deux
  sens. En vol, « couper » (tanh≈+1) s'interprète comme **nitro enclenché** (`>0`, l.12577) : un bot
  qui « voulait couper » se retrouve à brûler du nitro en l'air sans l'avoir choisi.
- **Correction** : zone morte sur `side` (|sortie|<.33 → pas de coupe), multiplier `lT` par `b.side`,
  et/ou donner à la décision de coupe une sortie dédiée au lieu d'en réutiliser deux.

---

## Bug #29 (toujours OUVERT, désormais COMMITÉ) — `groundPilot` ne gère pas la face du dessous (`side<0`)

- `TRAIN.groundPilot` (l.12636-12672) calcule la ligne de corde `lT`, la courbure `crv` et la
  fonction `courbure()` dans le **repère de la face du DESSUS** (`T[bi]`, `Nn[bi]` jamais
  retournés), puis fait `phiT=clamp((lT-b.lat)/(...))` et `st=(phiT-b.psi)*4`.
- Or `car.lat` et `car.psi` sont **dépendants du côté** : à l'atterrissage sur le dessous,
  `carTryLand` pose `car.lat=...*sideL` (l.8855) et `car.psi` dérive de `vB*sideL` (l.8858), puis
  `carDrive` retourne `F.n/F.b` quand `side<0` (l.8887). Sur le dessous, `b.lat`/`b.psi` sont de
  signe **OPPOSÉ** à ce que `groundPilot` suppose.
- Conséquence inchangée : un bot qui réussit un **snake-loop** (passer sous la route et se poser
  sur l'envers — la voltige que le projet veut apprendre) est pris en main par un pilote qui
  braque à **contresens** et le jette dehors. La §7.4 sabote précisément le cas qu'elle doit
  libérer. **Toujours aucune référence à `b.side` dans `groundPilot`** (grep confirmé).
- **Correction** : multiplier `crv`, `lT` et le retour de `courbure()` par `b.side`, ou retourner
  `Nn/T` selon `b.side` comme le fait `carDrive`. À défaut, désactiver le pilote auto tant que
  `b.side<0`.

---

## Bug #29b (toujours ouvert, même bloc) — réglages `groundPilot` fragiles

- `b.in.gas = brk?-1:1` (l.12668) : **jamais de point mort**. Autour de `vSafe`, oscillation
  frein à fond ↔ gaz à fond. Ajouter une bande morte (`|v/vSafe-1|<0.05 → gas=0`).
- `vSafe` sentinelle `1e9` quand aucune courbure devant (l.12652) : alors `b.v<vSafe*1.12` est
  toujours vrai → **nitro enclenché en permanence** en ligne droite (l.12670). Sans gravité (le
  nitro se recharge) mais c'est du bruit dans les stats et ça masque la vraie vitesse de passage.
- `brain.forward` reste appelé à chaque tick même quand `AUTO_GROUND && mode==='drive'`
  (l.12554, puis `if/else` l.12555-12578) : trois sorties sur quatre sont jetées. Calcul gaspillé,
  et cela rend muets les poids « sol » d'un cerveau clone/seed — la compétence sol apprise est
  abandonnée (but assumé de la §7.4, mais à savoir avant de comparer `?auto=1` vs `?auto=0`).

---

## Bug #23 (toujours ouvert, blocage n°1) — l'arrivée reste hors d'atteinte, piste liée au garage

- `LEN = 7200*(1+Math.min(1.1,level*.07))` (l.2124) sert de cible au générateur ; `level` =
  `equippedCar()` (index de caisse 0..14, l.9590). La longueur de piste dépend donc de la **save du
  joueur** : caisse 0 → ~7200 u, caisse 14 → ~14200 u. Deux runs sur la même graine mais un garage
  différent ne comparent pas la même course.
- Fin exigée `b.s>L-32` (l.12593), manche **45 s**. À ~135 u/s, 9000 u est infranchissable :
  `record ~1301` ≈ 15 % de la piste. `W_FIN=3000` / `W_TEMPS=40` (l.12790-12791) restent **du code
  mort**, et `totD` (monotone) domine le gradient.
- ⚠ `TRAIN.init` (l.12444-12485) ne fige **toujours pas** `level=0`. La §7.4 atténue le symptôme
  « rampant » (le pilote tient la route mieux que le MLP), mais **ne règle pas** le fond : `LEN`
  varie encore avec la save, l'arrivée reste hors de portée en 45 s.
- **Correction** : `level=0` en tête de `TRAIN.init` (ou `buildTrack(seed, level0)` dédié), et/ou
  raccourcir la piste d'entraînement, et/ou récompenser la **vitesse moyenne** (`totD/temps`).

---

## Bug #28 (toujours ouvert) — `TRAIN.tournament` est du code mort

- `TRAIN.tournament` (l.12800-12808) n'est **plus appelé nulle part**. La sélection réelle est dans
  `newGen` (l.12810-12825) : moitié haute **intacte**, enfants tirés par croisement **dans le haut
  du panier seulement** (`p1`,`p2` ∈ `[0,GARDE)`).
- La fonction morte **ment à l'audit** : on croit qu'il y a une pression de tournoi, il n'y en a
  pas ; la diversité ne vient que de `mutate`. Choix assumé, mais à supprimer ou documenter.
- **Correction** : supprimer `TRAIN.tournament`, ou tirer au moins un parent hors du haut du panier
  pour une pression douce sans casser la règle « moitié conservée ».

---

## Bug #27 (toujours ouvert) — la fitness est affichée comme des « mètres »

- `TRAIN.fitness` (l.12792-12798) = `totD + W_CUT*cutGain + W_CTRL*ctrl − W_OUT*outs + bonus`, avec
  `W_CUT=3` (l.12782), `W_CTRL=1` (l.12788) et `ctrl` qui re-accumule jusqu'à **+1× la distance**
  au centre. La note n'est **pas une distance**.
- Le HUD affiche `best <N> m` / `record <N> m` alimentés par `b.fitness` / `TRAIN.record`
  (l.12900-12902). Le proprio lit « record 1301 m » et croit que les voitures ont roulé 1301 m ;
  le `totD` réel (~729 u) est gonflé et non-linéaire.
- Avec la §7.4, `ctrl` devient **déterministe** (pilote partagé) : la fitness ≈ `totD + cutGain +
  cte`, ce qui est *mieux* pour sélectionner la voltige, mais renforce le besoin d'afficher le vrai
  `totD`.
- **Correction** : afficher `b.totD` (ou `b.s`) en « m » réel dans le HUD, logguer la fitness à part.

---

## Bug #26 (résiduel) — `TRAIN.deaths` non vidé entre les pistes d'une génération

- `TRAIN.deaths={}` n'est remis à zéro que dans `endGen` (l.12883), pas dans `startEval` (l.12854).
  Avec `EVAL_TRACKS>1`, les morts s'additionnent sur les N pistes. Défaut = 1, donc sans effet, mais
  ré-apparaît à l'A/B multi-piste. **Correction** : `TRAIN.deaths={}` en tête de `startEval`.

---

## Cosmétique (toujours présent, AMPLIFIÉ) — « 12 entrées » mais `BRAIN_IN=11`

- `const BRAIN_IN=11` (l.9183), `carBrainInput` écrit `arr[0..10]` = **11** entrées.
- **Nouveau depuis la re-normalisation** : le commentaire l.9160-9182 fait une arithmétique
  explicite « 15 entrées précédentes − 3 supprimées = **RESTENT 12** », or le code n'en écrit que
  **11** (v, lat, psi, nitro, en-vol, courb 120, courb 300, raccourci, landH, landL, vy).
- Les bandeaux et commentaires disent encore « 12 » : l.9148, l.9158, l.9180, l.9260, l.9271,
  l.12377 (`MLP 12 → 16 → 4`). Le réseau est en fait **11 → 16 → 4**.
- ⚠ À trancher : soit le commentaire est faux (écrire « 11 »), soit **une 12e entrée a été
  perdue** lors de la re-normalisation (le « 15 − 3 » ne retombe pas sur le compte réel). Le réseau
  est cohérent en 11 (`MLP.IN=BRAIN_IN`), donc pas de crash — mais le doute mérite une vérification
  par l'agent principal : compter les `arr[i]=` de tête de `carBrainInput` et aligner le texte.
- **Correction** : aligner commentaires + bandeau sur le vrai `BRAIN_IN`, ou restaurer l'entrée
  manquante si le « 15 » était exact.

---

## Sentinelles (re-lancées ce passage)

- `check-iso.js` → 0.000e+0 ✅ (couvre le chemin bot : `ISO.playerStep` vs `TRAIN.botStep`).
- `check-actions.js` → PASS ✅ (y compris les commandes de `groundPilot`).
- `check-eval.js` → PASS ✅.
- `evolution.log` **toujours ABSENT** : aucun run long navigateur n'est tracé. Les bilans de
  génération (`TRAIN gen … best … alive … record … morts :`) ne partent que sur la console du
  navigateur, jamais dans un fichier. À noter : `sim-train.js`/`multi-train.js` (headless) exportent
  bien `RESUME` (distance, fitness, courbe, `air`, `deaths`) vers stdout — mais ce n'est jamais
  redirigé vers `evolution.log`, c'est au lanceur de le faire. Pour auditer l'entraînement sans
  écran, il faut ce log.

---

## Priorités (ordre d'effet décroissant)

1. **#30 — lever la pénalité `outs` sur la coupe consentie** (sinon la voltige est punie par le
   bord même qui la déclenche). La métrique est corrigée (11 coupes réelles), mais chaque coupe
   paye encore −120 avant de toucher `3×gainNet` : C'est LE blocage du moment.
2. **#31 — zone morte + `b.side` sur le côté de coupe, sortie dédiée pour « couper »** (sans quoi
   le mode coupe est du bruit, même une fois #30 réglé).
3. **#29 — corriger le signe `side<0` de `groundPilot`** (sinon la §7.4 sabote la voltige snake).
4. **#23 — figer `level` + rendre l'arrivée atteignable** (sinon `W_FIN`/`W_TEMPS` morts et on
   sélectionne sur `totD` seul).
5. **#27 — ne plus afficher la fitness comme des « mètres »**.
6. **Cosmétique 12→11 — trancher le « 15 − 3 = 12 » vs les 11 écritures réelles** (risque d'entrée
   perdue). #28 (tournoi mort) et #26 (deaths non vidés), à l'occasion.
