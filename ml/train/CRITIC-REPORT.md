# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-08 (22e passage)

🟢 **Isomorphisme : toujours RÉGLÉ, confirmé au bit près ce passage.** Une seule fonction `stepCar`
(l.9121) sert le joueur (`PCAR`) et les bots (`TRAIN.botStep` l.12526). `check-iso.js` rejoué →
**`ECART MAX GLOBAL : 0.000e+0`**, tous champs à 0. `check-actions.js` → **PASS** (les 10000 commandes
du bot sont atteignables au clavier). `sim-train.js` → **SIM TRAIN OK**. Rien à signaler sur la
physique : elle est partagée *par construction*.

🟢 **Bug #18 RÉSOLU.** Le multpiste `EVAL_TRACKS=3` (l.12407) est en place : chaque voiture est
notée sur **3 pistes différentes** (`startEval` l.12779, moyenne `fitnessSum/evalCount` l.12792-12800).
C'est exactement la correction que je recommandais contre la récitation. La note de sélection est la
moyenne, plus le max sur une piste unique. Bonne direction.

🔴 **Mais l'entraînement reste mort, mesuré ce passage (`sim-train.js --seed 424242`) :**
- `gen 1 best 60 · gen 2 best 217 · record 217` — **100 % de morts à chaque manche**
  (`idle` + `airtime`). Aucune finisher.
- Les manches s'arrêtent à **15 s / 19 s / 23 s** (mort de tous), jamais aux 45 s imparties.
- `max totD 303 m` au bout de 3 générations sur une piste de **~9000 m**. Personne ne s'approche
  de la ligne → la prime d'arrivée reste du **code mort** (#21 renforcé).

---

## Bug #21 (toujours présent, aggravé par EVAL_TRACKS) — la prime d'arrivée est du code mort

- `TRAIN.W_FIN=3000` (l.12715) + `TRAIN.W_TEMPS=40` (l.12716) ne se déclenchent **jamais** :
  l'arrivée exige `b.s > L-32` (l.12571), or la piste fait ~9000 m et les bots meurent en <20 s
  à ~300 m. La fitness se réduit en pratique à
  `totD + 1·ctrl − 120·outs` (l.12717-12723).
- Le multpiste n'y change rien : c'est **la durée de manche vs la longueur de piste** qui rend
  l'arrivée inatteignable. En 45 s à ~90 km/h on couvre ~1,1 km ; il en faudrait ~8.
- `totD` reste **non-borné et monotone dans la durée** → le comportement parasite « survivre en
  rampant » domine toujours le gradient. C'est ce que la prime était censée tuer.
- **Correction** : soit raccourcir la piste / rallonger la manche pour que la ligne soit atteignable,
  soit verser la récompense **par mètre** (progression par point de contrôle), soit récompenser la
  **vitesse moyenne** dans `totD`. Tant que personne ne finit, `W_FIN` et `W_TEMPS` sont du poids
  mort en plus de deux constantes à maintenir.

---

## Bug #20 (toujours présent) — détecteur de raccourci calibré hors échelle

- `arr[7]` (le « raccourci ») calculé l.9209-9223. Fenêtre `d3∈[8,60]` (l.9217) et `dy∈[10,60]`
  (l.9219) appliquées **avant** le filtre de gain. Mesuré au passage précédent : la distance 3D
  réelle entre deux bouts de piste a une médiane de **159,6 m** → la fenêtre coupe au **p10**.
  `arr[7]` vaut -1 quasiment tout le temps.
- **Correction** : plafond `d3` → ~300 m, fenêtre `dy` → `[5,190]`, garder le filtre `gain>=25`,
  et exposer le viseur d'atterrissage (`car.landI/landH/landL`, l.9091-9114) au réseau.

---

## Bug #13 (toujours présent) — la coupe n'a aucune récompense

- `TRAIN.W_CUT=0` (l.12711). `goodCuts`/`cutGain` accumulés l.12575 mais **jamais lus** dans la
  fitness. La voltige n'a aucun gradient.
- **Correction** : reward shaping aérien `+k·cutGain` pendant le vol, **couplé à #20**
  (sinon pas de signal d'entrée).

---

## Bug #11 (toujours présent) — cerveau aveugle en vol

- `carBrainInput` calcule tout sur `rel=car.s` (l.9187-9188), or `car.s` **n'avance pas en vol**.
  En vol sont gelés `arr[0]` (vitesse), `arr[1]` (lat), `arr[5]/arr[6]` (courbures), `arr[7]` (#20).
  Le viseur d'atterrissage existe en physique et n'est **jamais donné au cerveau**.
- **Correction** : nourrir `arr` avec le cap/distance horizontale vers `car.landI`.

---

## Bug #19 (toujours présent) — normalisation vitesse calibrée sur le joueur

- `arr[0]=cl((car.v−135)/110)` (l.9201), centré sur la médiane d'expert (135 m/s). Les bots naissent
  à `v=26` et rampent → `arr[0]≈−0.99` presque tout l'entraînement. Entrée quasi morte.
- **Correction** : recentrer sur la distribution observée des bots (ou un plafond physique).

---

## Bug #22 (NOUVEAU, ce passage) — le bilan des morts est un cumul trompeur

- `TRAIN.deaths={}` est réinitialisé **seulement dans la branche finale** d'`endGen` (l.12808),
  pas dans `startEval` (l.12779-12788). Résultat mesuré : entre les 3 manches d'une même génération,
  le log affiche `idle 11→22→33`, `airtime 13→26→39` — des morts **cumulés sur les 3 pistes**,
  pas les morts de la manche courante.
- La note (`fitnessSum`) n'est pas fausse (elle cumule par manche, c'est voulu), mais le bilan
  « morts : idle N airtime M » du log est gonflé d'un facteur `EVAL_TRACKS`. On croit lire que 72
  voitures sont mortes alors qu'il y en a 24.
- **Correction** : `TRAIN.deaths={}` dans `startEval` aussi (ou logger par manche), pour que le
  diagnostic « pourquoi ça meurt » reste lisible. Mineur en priorité, mais nécessaire pour piloter.

---

## Cosmétique (toujours présent)

- `BRAIN_IN=11` (l.9183) mais les commentaires disent « **12 entrées** » (l.9148 « LES 12 ENTREES »,
  l.9180 « RESTENT 12 entrees »). La vérité est **11** (`arr[0..10]`). Sans bug fonctionnel, mais
  trompe pour le prochain qui touche.

---

## Sentinelles

- `check-iso.js` → 0.000e+0 ✅ · `check-actions.js` → PASS ✅ · `sim-train.js` → OK (0 finisher).
- `evolution.log` absent · `results/demos/` vide → entraînement figé. Le blocage est
  **méthodologique** (#21), pas opérationnel.

---

## Priorités

1. **#21 — rendre l'arrivée atteignable** : sinon toute la fitness est du bruit parasitaire.
   Le multpiste (#18) est réglé, mais il ne sert à rien tant qu'aucune voiture ne survit assez
   pour qu'on sélectionne « finir » plutôt que « ramper ».
2. **#20 + #13 ensemble** — redonner à la voltige UN signal d'entrée ET UNE récompense.
3. **#22** — réparer le bilan des morts pour pouvoir diagnostiquer le reste.
4. **#11 / #19** — ensuite.