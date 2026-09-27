# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-25 (123e)

🔴 **ISOMORPHISME SIM↔RACE ROMPU — la physique du JEU a divergé de train.html, l'entraînement apprend sur une physique qui n'existe plus dans la course.** Depuis le 122e, le jeu a été refondu en **deux** dossiers (`HEAD` **`6541278`**, commits 09-24/09-25) : `VERSION PRINCIPALE/index.html` (mobile) et `AUTRE VERSION/index.html` (PC), **physique identique entre eux**. Deux constantes ont bougé, **train.html reste figé sur l'ancienne valeur** (mtime **17:56:46**, aucun commit sur ml/train depuis `c14ba2a`) :

- **`SPD`** : train.html **`0.5`** (l.8463) → jeu **`0.48`** (`VERSION PRINCIPALE/index.html` l.11936, +20 % après −20 % matin). Écart **−4 %** sur TOUTE l'avance, la chute, le compteur. Bots entraînés 4 % trop rapides.
- **`AIR_ASSIST`** : train.html **`1.0`** (l.8465) → jeu **`.2`** (l.11940, « ÷5, plus remarquable »). Écart **×5** sur l'aide au recentrage **en vol** (la formule `asF` est identique, l.9185 vs l.15476, seul le coef change). **C'est LA divergence qui tue l'objectif du projet** : la neuroévolution apprend la voltige aérienne en s'appuyant sur un aimant 5× trop fort. Le champion appris rejoindra l'axe tout seul en plein vol — comportement impossible dans la vraie course. `GRAV`/`FALL_G`/`TURN_HS`/`AIR_MAX` : **inchangés** (vérifiés ligne à ligne, identiques).

🟠 **Atelier toujours À L'ARRÊT.** Aucun `node.exe` de training. Le `node.exe` actuel (PID 3796) est le serveur scratchpad interne d'Hermes/Claude, **pas** l'entraînement. `champion.json` **inchangé** `{gen:70, note:22, record:11226}` (16:25:21Z) → **#58 intact** (−575 m sous `maxTotD:11801`). `results/champions/` = **220 fichiers**, dernier mtime `gen00070-note22`. `evolution.log` absent. Aucun doute méthode → pas de recherche web.

**Défauts ouverts : #60 (NOUVEAU, priorité absolue — resynchroniser les constantes du jeu), #58 (record volatile + verrou d'onglet), #57 (gate bench.js), #59 (veille), puis réserves #35/#40/#44.**

---

## VERDICT — passage 2026-09-21 (122e)

✅ **Isomorphisme physique : SAIN, inchangé (6e passage consécutif).** `HEAD` **`c14ba2a`**, `train.html`
mtime **17:56:46** (inchangé), `bench.js` **02:37:30** — bit-à-bit identiques au 121e, aucun commit.
Re-vérifié à l'instant ligne par ligne : moteur **UNIQUE** `stepCar` l.9197, appelé par le joueur
(l.10989 `PWORLD` + `playerStep` l.13223) ET par les bots (l.12714 `TRAIN.world`). Fonctions partagées
intactes : `carStartFall` 8868 / `carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `carPitch` 9097 /
`carBrainInput` 9263 / `startFall` 9518. `TRAIN.brainInput` l.12765 délègue à `carBrainInput`.
`TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot` **inexistants** (commentaire périmé l.8808).
Zéro divergence joueur↔bot.

🟠 **Atelier À L'ARRÊT — statu quo intégral.** Aucun `node.exe`. `champion.json` **inchangé**
`{gen:70, note:22, record:11226}` (16:25:21Z) → **#58 intact** (−575 m sous `maxTotD:11801`).
`results/champions/` = **220 fichiers**, dernier mtime `gen00070-note22` 18:25 locale. `evolution.log`
absent. Aucune anomalie méthode nouvelle → pas de recherche web.

**Défauts ouverts : #58 (priorité), #57 (gate bench.js), #59 (veille), puis réserves #35/#40/#44. Rien de neuf.**

> Note méta : 5 passages consécutifs de statu quo intégral (atelier arrêté, code figé). Les verdicts
> n'apportent plus d'information tant que rien ne bouge (`train.html`, `champion.json`, ou activité
> `node.exe`). Suggestion maintenue : ne re-consigner qu'au premier changement.

---

## VERDICT — passage 2026-09-21 (121e)

✅ **Isomorphisme physique : SAIN, inchangé (5e passage consécutif).** `HEAD` **`c14ba2a`**, `train.html`
mtime **17:56:46**, `bench.js` **02:37:30** — bit-à-bit identiques au 120e, aucun commit (`git status` :
seuls `results/*` et `CRITIC-REPORT.md`). Re-vérifié : moteur **UNIQUE** `stepCar` l.9197, appelé par le
joueur (l.10989 + `playerStep` l.13223) ET par les bots (l.12714) ; `carStartFall` 8868 / `carTryLand` 8896
/ `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput` 9263 intactes ; `TRAIN.brainInput`
l.12765 délègue à `carBrainInput`. `TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot` inexistants
(seul le commentaire périmé l.8808 les cite). Zéro divergence joueur↔bot.

🟠 **Atelier À L'ARRÊT — statu quo intégral.** Aucun `node.exe`. `results/champion.json` **inchangé**
`{gen:70, note:22, record:11226}` (16:25:21Z) → **#58 intact** (record −575 m sous `maxTotD:11801`).
`results/champions/` = **220 fichiers**, dernier mtime `gen00070-note22` 18:25 locale. `evolution.log`
absent. Aucune anomalie méthode nouvelle → pas de recherche web ce passage.

**Défauts ouverts : #58 (priorité absolue), #57 (gate bench.js), #59 (veille), puis réserves #35/#40/#44. Rien de neuf.**

> Note méta : 4 passages consécutifs de statu quo intégral (atelier arrêté, code figé). Si rien ne bouge,
> les verdicts n'apportent plus d'information ; suggère de ne consigner un nouveau verdict que sur
> changement (code, `champion.json`, ou activité `node.exe`).

---

## VERDICT — passage 2026-09-21 (120e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` **`c14ba2a`**, `train.html` mtime **17:56:46**, `bench.js`
**02:37:30** (bit-à-bit identiques au 119e, aucun commit). Re-vérifié : moteur **UNIQUE** `stepCar` l.9197,
`carStartFall` 8868 / `carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput`
9263 intactes ; `TRAIN.brainInput` l.12765 délègue. `TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot`
toujours **inexistants**. Zéro divergence joueur↔bot.

🟠 **Atelier À L'ARRÊT — statu quo intégral.** Aucun `node.exe`. `champion.json` **inchangé**
`{gen:70, note:22, record:11226}` (16:25:21Z) → **#58 intact** (record −575 m sous `maxTotD:11801`).
`results/champions/` = **220 fichiers**, dernier mtime `gen00070-note22` 18:25 locale. `evolution.log` absent.
Aucune anomalie méthode nouvelle → pas de recherche web ce passage.

**Défauts ouverts : #58 (priorité), #57 (gate bench.js), #59 (veille), puis réserves #35/#40/#44. Rien de neuf.**

---

## VERDICT — passage 2026-09-21 (119e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`c14ba2a`**, `train.html` mtime **17:56:46**,
`bench.js` **02:37:30** (bit-à-bit identiques au 118e, aucun commit). Moteur **UNIQUE** `stepCar` l.9197,
`carStartFall` 8868 / `carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 /
`carBrainInput` 9263 intactes ; `TRAIN.brainInput` l.12765 délègue. `TRAIN.groundPhysics/airPhysics/
startFallBot/tryLandBot` toujours **inexistants**. Zéro divergence joueur↔bot.

🟠 **Atelier À L'ARRÊT — l'entraînement live s'est arrêté.** Aucun `node.exe` en cours. `champion.json`
**inchangé** `{gen:70, note:22, record:11226}` (date **16:25:21Z**) — identique au 118e, donc **#58 intact**
(record toujours à **−575 m** sous le vrai max `maxTotD:11801`). `results/champions/` = **220 fichiers**, dernier
mtime `gen00070-note22` à 18:25 locale (= 16:25Z) → **plus aucune écriture** depuis. `results/runs/` figé à
09-19 02:35. `evolution.log` **toujours absent**.

🔴 **#58 toujours PRIORITÉ ABSOLUE** (course concurrente multi-onglets + `TRAIN.record` réinit à 0 l.12549,
`saveChampion` l.13145 écrit sans comparaison disque). Correction inchangée : (1) recharger
`TRAIN.record=Math.max(TRAIN.record,j.record||0)` et `gen` dans `TRAIN.init()` ; (2) verrou d'onglet unique.

🟠 **#57 inchangé** (`bench.js` l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`). 🟠 **#59 veille inchangée**
(W_DEATH l.12974 / note figée l.13094 vs rang l.13069).

**Défauts ouverts : #58 (priorité), #57 (gate bench.js), #59 (veille), puis réserves #35/#40/#44.**

**Bilan : statu quo intégral depuis le 118e. L'atelier ne tourne plus, le record reste bloqué à 11226 (−575 m).
Urgence #1 = #58, à corriger avec rechargement de `record` + verrou d'onglet avant de relancer l'entraînement.**

---

## VERDICT — passage 2026-09-21 (118e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`c14ba2a`**, `train.html` mtime **17:56:46**
(bit-à-bit identique au 117e, aucun commit). Re-vérifié à l'instant : moteur **UNIQUE** `stepCar` l.9197,
`carStartFall` 8868 / `carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput`
9263 intactes. `TRAIN.brainInput` l.12765 délègue à `carBrainInput`. `TRAIN.groundPhysics/airPhysics/
startFallBot/tryLandBot` toujours **inexistants** (seul le commentaire périmé l.8808 les cite). Zéro divergence
joueur↔bot.

🔴 **#58 CONFIRMÉ + NOUVELLE AMPLIFICATION : course concurrente entre onglets.** L'entraînement a tourné en
live : `champion.json` est passé de `{gen:61, record:10513}` (117e) à **`{gen:70, note:22, record:11226}`**
(date 16:25:21Z) — le record **remonte** vers le vrai max `maxTotD:11801` (−575 m). MAIS le dossier
`results/champions/` (220 fichiers) montre des **gen NON monotones entrelacés** dans les mtime : `gen00080`
(16:23:37), `gen00070` (16:25:21), `gen00072`, `gen00073`, `gen00060`, `gen00061`, `gen00062`, `gen00054`,
`gen00052`… → **plusieurs onglets `train.html` tournent EN PARALLÈLE**, chacun avec son propre `TRAIN.GEN` et
surtout `TRAIN.record` **réinitialisé à 0** (l.12549). Preuve de la course : `gen00080-note21` a été POSTé à
16:23:37Z puis **écrasé** par `gen00070-note22` à 16:25:21Z — un onglet de gen plus bas a clobberé un onglet
de gen plus haut. `saveChampion` (l.13145) écrit `results/champion.json` **sans comparaison** avec le disque
(l.13075 compare seulement contre `TRAIN.record` en mémoire, lui-même parti de 0). **Correction (2 volets) :**
(1) dans `TRAIN.init()` recharger `TRAIN.record=Math.max(TRAIN.record, j.record||0)` (et `gen`) depuis
`champion.json` comme `seedBrain` l'est déjà (l.12602) ; (2) garder un **verrou d'onglet unique** (ex.
`navigator.locks` ou un token `?tab=` rejeté par le serveur `rec-server.js` si un autre POST est déjà actif),
sinon N onglets continueront à se marcher dessus même une fois #58 corrigé.

🟠 **#57 inchangé** (`bench.js` l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12` ; mtime 02:37, `66edccf`).
🟠 **#59 veille inchangée** (W_DEATH l.12974 sur `b.mode==='boom'`, note figée l.13094 vs rang l.13069).

`evolution.log` **toujours absent**. Aucun doute méthode nouveau → pas de recherche web ce passage.

**Défauts ouverts : #58 (priorité, record volatile + course multi-onglets), #57 (gate bench.js), #59 (veille),
puis réserves #35/#40/#44.**

**Bilan : isomorphisme toujours sain, rien de neuf côté code. Le record remonte (10513→11226) mais la course
entre onglets concurrents fait régresser champion.json de façon aléatoire (gen 80 clobberé par gen 70).
Urgence #1 = #58, désormais à corriger avec un verrou d'onglet en plus du rechargement de `record`.**

---

## VERDICT — passage 2026-09-21 (117e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`c14ba2a`**, `train.html` mtime **17:56:46**
(aucun diff non-commité sur train.html — `git status` ne montre que `results/*` et `CRITIC-REPORT.md`).
Re-vérifié à l'instant : moteur **UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989, bots l.12714 ;
`playerStep` l.13223 = globales→stepCar). `carBrainInput` l.9263 unique, `TRAIN.brainInput` l.12765 délègue.
`TRAIN.W_DEATH` l.12970, garde record l.13075-13076, `carStartFall`/`carTryLand`/`carDrive`/`carFall`/`startFall`
inchangées. Zéro divergence joueur↔bot.

🔴 **#58 TOUJOURS ACTIF — le record disque régresse pendant que l'entraînement tourne EN DIRECT.**
`champion.json` est passé de `{gen:48, record:11299}` (16e passage) à **`{gen:61, note:19, record:10513}`**
(date 16:20:47Z). L'entraînement tourne bien **en live** (gen 48→61), MAIS le record a **baissé de 11299→10513**,
toujours **à −788 m du vrai max historique `maxTotD:11801`**. C'est la signature exacte du bug : `TRAIN.record`
est initié à 0 (l.12549) et **jamais rechargé** depuis `champion.json` au démarrage, donc chaque rechargement
de page repart la garde `if(bestDist>TRAIN.record)` (l.13075) de zéro et ré-écrase le disque sans comparaison.
Le record ne remontera jamais à 11801 tant que `record`/`gen` ne sont pas lus dans `TRAIN.init()`. **Correction
inchangée :** après le `fetch` de `seedBrain`, ajouter `TRAIN.record=Math.max(TRAIN.record, j.record||0)` (et
`TRAIN.GEN=Math.max(TRAIN.GEN, j.gen||0)`), une ligne.

🟠 **#57 inchangé** (gate `bench.js` l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12` ; mtime 02:37, `66edccf`).
`evolution.log` toujours **absent**. Aucune anomalie méthode nouvelle → pas de recherche web ce passage.

**Défauts ouverts : #58 (priorité, record volatile → champion régresse), #57 (gate bench.js), #59 (veille W_DEATH/rang), puis réserves #35/#40/#44.**

**Bilan : rien de neuf côté code — l'atelier tourne (gen 61) mais LE RECORD RÉGRESSE à cause de #58. Urgence #1 = #58 : un rechargement de page suffit à effacer 11801 du disque.**

---

## VERDICT — passage 2026-09-21 (116e)

✅ **Isomorphisme physique : SAIN.** Nouveau commit **`c14ba2a`** (aujourd'hui 17:58) : ajout de
`TRAIN.W_DEATH=2500` dans `TRAIN.fitness` (l.12970/12974). Le diff ne touche **QUE la fitness**
(3 insertions / 1 délétion). Moteur **UNIQUE** `stepCar` l.9197 intact, seul appelé (joueur
l.10989/l.13221 = `playerStep` l.13221, bots l.12714). `carStartFall` 8868 / `carTryLand` 8896 /
`carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput` 9263 inchangées.
`TRAIN.brainInput` l.12765 délègue à `carBrainInput`. `TRAIN.groundPhysics/airPhysics/startFallBot/
tryLandBot` toujours **inexistants**. Message du commit confirme `check-iso 0.000e+0`. Zéro divergence.

🔴 **#58 — LE CHAMPION SUR DISQUE A RÉGRESSÉ, le record en mémoire est VOLATIL (reprise de #53).**
`TRAIN.record` est initialisé à **0** (l.12549 `record:0`) et n'est **jamais rechargé** depuis
`champion.json` au démarrage (aucun `fetch` de champion.json pour `record` ; seul `cloned-brain.json`
est relu comme `seedBrain`, l.12602-12605). Conséquence : à **chaque rechargement de page**, la garde
`if(bestDist>TRAIN.record)` (l.13075) part de 0 et ré-écrase `champion.json` sans comparaison avec ce
que le disque contient déjà. **Preuve chiffrée ce passage :** l'ancien champion `{gen:48, record:11299}`
avait été remplacé par `{gen:17, record:8672}` au fil de mes lectures, puis `{gen:34, record:9811}`
(l'entraînement tourne EN DIRECT, gen monte). Le **vrai max historique `maxTotD:11801`** est perdu du
`champion.json` : on redescend à ~9800 m pour rien. C'est le bug #53 (toujours dit « intact » dans les
passages précédents) qui se **manifeste** enfin en perte réelle, pas en gel. → **correction :** charger
`record` (et `gen`) depuis `champion.json` dans `TRAIN.init()` (l.12574) AVANT la première manche, comme
`seedBrain` est déjà chargé — une seule ligne `TRAIN.record=Math.max(TRAIN.record, j.record||0)` après
le `fetch`.

🟠 **Réserve méthode (#59) — fitness `W_DEATH` appliquée sur `b.mode==='boom'`, pas sur l'issue de fin.**
La pénalité de 2500 est soustraite si `b.mode==='boom'` (l.12974). Or `b.mode` reste `'boom'` seulement
pour les morts VRAIES (`carBoom` l.8859 : crash/idle/airtime/void). Un bot qui **survit au timeout** n'est
pas pénalisé (correct), mais un bot qui **meurt en `fall` en touchant le vide** passe lui aussi par
`carBoom` → pénalisé (correct). Le cas à surveiller : la note d'un bot est figée à la mort (l.13094
`b.fitness=TRAIN.fitness(b)`), MAIS la sélection finale (newGen l.12996) trie sur `b.fitness` qui, après
`endGen` l.13069, est devenue le **RANG moyen** (0..POP-1), pas la note brute. Donc `W_DEATH` n'infiltre
la sélection qu'à travers le calcul de rang (l.13051 `notes=TRAIN.fitness(b)`). Cohérent, mais fragile :
toute future désynchronisation entre la note figée (l.13094) et le rang (l.13069) fera mentir le HUD.
Verdict : **#58 d'abord**, #59 n'est qu'une veille.

**Défauts ouverts : #58 (priorité, record volatile → champion régresse), #57 (gate `bench.js` l.140/l.142),**
#59 (veille W_DEATH/rang), puis réserves #35/#40/#44. `bench.js` inchangé (mtime 02:37, toujours `66edccf`).

**Bilan : l'atelier est RÉACTIVÉ (commit c14ba2a + entraînement en direct). Isomorphisme sain. Mais le
record disque a chuté de 11299→9811 pendant que je lisais faute de recharger `record` depuis champion.json.
Urgence #1 = #58 : recharger `record`/`gen` dans init(), sinon chaque rechargement détruit le vrai max 11801.**

---

## VERDICT — passage 2026-09-21 (115e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 114e, aucun commit). Re-vérifié à l'instant : moteur **UNIQUE**
`stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714 ; `playerStep` l.13221). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput` 9263 intactes.
`TRAIN.brainInput` l.12765 délègue à `carBrainInput`. `TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot`
toujours **inexistants** (seul le commentaire périmé l.8808 les cite). Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #25 — atelier à l'arrêt.** Aucun `node.exe`, aucun `results/runs/` postérieur à
**09-19 02:35**. `champion.json` inchangé `{gen:48, note:17, record:11299, size:324}` → **#53** intact
(−502 m sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` absent.

📌 **Note sur #57 (gate `bench.js`) :** lecture complète du fichier faite ce passage. Le classement FINAL
(section 6b, **l.196-200**) classe bien par **taux de finition ↓ puis temps ↓ puis médiane ↓** (décision
propriétaire déjà commitée). Le défaut RÉSIDUEL est plus subtil : la **pré-sélection** des champions à évaluer
reste **l.140** `champ.sort((a,b)=>(b.record-a.record)||(b.gen-a.gen))` + **l.142** `MAX_CHAMPIONS=12`. Le
`record` (distance) qui sert à choisir les 12 champions bancardisés est **inutile** (4 champions à record
identique ont des finitions 0→2/5, cf. le commentaire l.193-195 du fichier) : un champion qui finit souvent
mais avance moins loin sur une piste jamais vue peut être écarté du banc AVANT même que la comparaison par
finition ne le voie. → **correction : trier le `slice` de pré-sélection par `record` est sans gravité tant que
K couvre tous les compatibles ; si on veut un vrai top-par-finition, il faut bancardiser TOUS les compatibles
(lever/supprimer le plafond 12) puis laisser le classement l.196 décider.** Priorité inchangée : **#53 d'abord**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (résidu de
pré-sélection l.140/l.142), puis réserves méthode #35/#40/#44.**

**Bilan : identique au 114e, aucune évolution. Urgence #1 = #53 (champion gelé 502 m sous le max).**

---

## VERDICT — passage 2026-09-21 (114e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 113e, aucun commit). Re-vérifié à l'instant : moteur **UNIQUE**
`stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714 ; `playerStep` l.13221). `carStartFall`
8868 / `carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput` 9263 intactes.
`TRAIN.brainInput` l.12765 délègue à `carBrainInput`. `TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot`
toujours **inexistants** (seul le commentaire périmé l.8808 les cite). Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #24 — atelier à l'arrêt.** Aucun `node.exe`, aucun `results/runs/` postérieur à
**09-19 02:35**. `champion.json` inchangé `{gen:48, note:17, record:11299, size:324}` → **#53** intact
(−502 m sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` absent. `bench.js`
inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record` → sélection par finition neutralisée), puis réserves méthode.**

**Bilan : identique au 113e, aucune évolution. Urgences inchangées #53 et #57.**

---

## VERDICT — passage 2026-09-21 (113e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 112e, aucun commit). Re-vérifié à l'instant : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 / `carBrainInput` 9263 intactes.
`TRAIN.brainInput` l.12765 délègue à `carBrainInput`. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #24 — atelier à l'arrêt.** Aucun `node.exe`, aucun `results/runs/` postérieur à
**09-19 02:35**. `champion.json` inchangé `{gen:48, note:17, record:11299, size:324}` → **#53** intact
(−502 m sous le max réel `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` absent. `bench.js`
inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record` → sélection par finition neutralisée), puis réserves méthode.**

**Bilan : identique au 112e, aucune évolution. Urgences inchangées #53 et #57.**

---

## VERDICT — passage 2026-09-21 (112e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 111e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 / `carTryLand`
8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/airPhysics/startFallBot/
tryLandBot` toujours **inexistants** (seul le commentaire périmé l.8808 les cite) ; `TRAIN.brainInput` l.12765
délègue à `carBrainInput` (moteur unique) → isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #23 — atelier à l'arrêt, inchangé depuis le 111e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `results/champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}`
(02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).
`results/champions/` = **189 fichiers**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 111e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-21 (111e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 110e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #22 — atelier à l'arrêt, inchangé depuis le 110e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `results/champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}`
(02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).
`results/champions/` = **189 fichiers**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 110e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (110e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 109e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #21 — atelier à l'arrêt, inchangé depuis le 109e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).
`results/champions/` = **189 fichiers**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 109e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (109e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 108e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #20 — atelier à l'arrêt, inchangé depuis le 108e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).
`results/champions/` = **189 fichiers**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 108e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (108e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 107e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #19 — atelier à l'arrêt, inchangé depuis le 107e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 107e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (107e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 106e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #18 — atelier à l'arrêt, inchangé depuis le 106e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `results/champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}`
(02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 106e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (106e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 105e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #17 — atelier à l'arrêt, inchangé depuis le 105e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).
Rappel : `results/champions/` compte **189 fichiers** (dont l'ancien réseau 276 poids) → le gate distance
l.140 + plafond 12 est **actif**, pas latent.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 105e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (105e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 104e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #16 — atelier à l'arrêt, inchangé depuis le 104e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 104e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (104e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 103e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #15 — atelier à l'arrêt, inchangé depuis le 103e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 103e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (103e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 102e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #14 — atelier à l'arrêt, inchangé depuis le 102e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` l.13143 écrit sans comparaison), #57 (gate
`bench.js` trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46,
#52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : identique au 102e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---
## VERDICT — passage 2026-09-20 (102e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 101e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #13 — atelier à l'arrêt, inchangé depuis le 101e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **09-19 02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299, size:324}` (02:34)
→ **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log`
**toujours absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 101e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (101e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 100e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #12 — atelier à l'arrêt, inchangé depuis le 100e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299}` (02:34) → **#53**
intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours
absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 100e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (100e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 99e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall` 8868 /
`carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 / `startFall` 9518 intactes. `TRAIN.groundPhysics/
airPhysics/startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) →
isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #11 — atelier à l'arrêt, inchangé depuis le 99e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299}` (02:34) → **#53**
intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours
absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 99e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (99e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 98e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall`/`carTryLand`/
`carDrive`/`carFall`/`startFall` intactes (8868/8896/8954/9115/9518). `TRAIN.groundPhysics/airPhysics/
startFallBot/tryLandBot` toujours inexistants (seul le commentaire périmé l.8808 les cite) → isomorphisme
par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #10 — atelier à l'arrêt, inchangé depuis le 98e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299}` (02:34) → **#53**
intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours
absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 98e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (98e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**,
`bench.js` **02:37:30** (bit-à-bit identiques au 97e, aucun commit). Re-vérifié à l'instant par grep : moteur
**UNIQUE** `stepCar` l.9197, seul appelé (joueur l.10989, bots via l.8814/12714). `carStartFall`/`carTryLand`/
`carDrive`/`carFall` intactes (8868/8896/8954/9115). `TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot`
toujours inexistants (seul le commentaire périmé l.8808 les cite) → isomorphisme par construction. Zéro
divergence joueur↔bot.

🟠 **Statu quo intégral #9 — atelier à l'arrêt, inchangé depuis le 97e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/runs/` plus récent que **02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299}` (02:34) → **#53**
intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours
absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 97e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (97e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 96e, aucun commit). Re-vérifié à l'instant par grep : moteur **UNIQUE** `stepCar`
l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall`/`carTryLand`/`carDrive`/`carFall`
intactes (8868/8896/8954/9115). `TRAIN.groundPhysics/airPhysics/...` toujours inexistants (seul le commentaire
périmé l.8808 les cite) → isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #8 — atelier à l'arrêt, inchangé depuis le 96e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/` plus récent que **02:35**. `champion.json` **inchangé**
`{gen:48, note:17, record:11299}` (02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`,
`run-seed1505.json` gen50). `evolution.log` **toujours absent**. `bench.js` (mtime 02:37) inchangé → **#57**
intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 96e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-20 (96e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 95e, aucun commit). Re-vérifié à l'instant par grep : moteur **UNIQUE** `stepCar`
l.9197, seul appelé (joueur l.10989, bots l.12714). `carStartFall`/`carTryLand`/`carDrive`/`carFall`
intactes (8868/8896/8954/9115). `TRAIN.groundPhysics/airPhysics/...` toujours inexistants (seul le commentaire
périmé l.8808 les cite) → isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #7 — atelier à l'arrêt, inchangé depuis le 95e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/` plus récent que **02:35**. `champion.json` **inchangé**
`{gen:48, note:17, record:11299}` (02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`,
`run-seed1505.json` gen50). `evolution.log` **toujours absent**. `bench.js` (mtime 02:37) inchangé → **#57**
intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 95e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-19 (95e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 94e, aucun commit). Re-vérifié à l'instant par grep : moteur **UNIQUE** `stepCar`
l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall`/`carTryLand`/`carDrive`/`carFall`
intactes (8868/8896/8954/9115). `TRAIN.groundPhysics/airPhysics/...` toujours inexistants (seul le commentaire
périmé l.8808 les cite) → isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #6 — atelier à l'arrêt, inchangé depuis le 94e.** Vérifié à l'instant : **aucun
`node.exe` en cours**, aucun fichier `results/` plus récent que **02:35**. `champion.json` **inchangé**
`{gen:48, note:17, record:11299}` (02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`,
`run-seed1505.json` gen50). `evolution.log` **toujours absent**. `bench.js` (mtime 02:37) inchangé → **#57**
intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 94e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-19 (94e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 93e, aucun commit). Re-vérifié par grep à l'instant : moteur **UNIQUE** `stepCar`
l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall`/`carTryLand`/`carDrive`/`carFall`
intactes (8868/8896/8954/9115). `TRAIN.groundPhysics/airPhysics/...` toujours inexistants (commentaire périmé
l.8808) → isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #5 — atelier à l'arrêt, inchangé depuis le 93e.** Vérifié à l'instant : **aucun
`node.exe` en cours** (`tasklist` vide), aucun fichier `results/` plus récent que **02:35** (batch
`multi-2026-09-19T00-35-01`). `champion.json` **inchangé** `{gen:48, note:17, record:11299}` (02:34) → **#53**
intact (**−502 m** sous le vrai max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours
absent**. `bench.js` inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 93e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-19 (93e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 92e, aucun commit). Re-vérifié par grep à l'instant : moteur **UNIQUE** `stepCar`
l.9197, seul appelé (joueur l.10989/l.13221, bots l.12714). `carStartFall`/`carTryLand`/`carDrive`/`carFall`
intactes (8868/8896/8954/9115). `TRAIN.groundPhysics/airPhysics/...` toujours inexistants (commentaire périmé
l.8808) → isomorphisme par construction. Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #4 — atelier à l'arrêt depuis ~17 h (inchangé depuis le 92e).** Vérifié à l'instant :
**aucun `node.exe` en cours** (`tasklist` vide), aucun fichier `results/` plus récent que **02:37:30**.
`champion.json` **inchangé** `{gen:48, note:17, record:11299}` (02:34) → **#53** intact (**−502 m** sous le vrai
max `maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours absent**. `bench.js` mtime 02:37
inchangé → **#57** intact (l.140 trie par `record`, l.142 `MAX_CHAMPIONS=12`).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 92e, aucune évolution. Les deux urgences restent #53 (champion gelé 502 m sous le
max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-19 (92e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 91e, aucun commit). Re-vérifié par grep à l'instant : moteur **UNIQUE** `stepCar`
l.9197, appelé par le joueur (l.10989) et les bots (l.12714). `carStartFall`/`carTryLand`/`carDrive`/
`carFall` intactes (8868/8896/8954/9115). Seul le commentaire périmé l.8808 mentionne encore
`TRAIN.groundPhysics/airPhysics/...` → isomorphisme par construction, zéro divergence joueur↔bot.

🟠 **Statu quo intégral #3 — atelier à l'arrêt depuis ~20 h (inchangé depuis le 90e).** Vérifié à l'instant :
**aucun `node` en cours**, aucun fichier `results/` plus récent que **02:37:30**. `champion.json` **inchangé**
`{gen:48, note:17, record:11299}` (02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`,
`run-seed1505.json` gen50). `evolution.log` **toujours absent**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 90e/91e, aucune évolution en ~20 h. Les deux urgences restent #53 (champion gelé 502 m
sous le max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-19 (91e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`**, `train.html` mtime **00:51:28**
(bit-à-bit identique au 90e, aucun commit). Moteur UNIQUE `stepCar` l.9197 toujours le seul appelé
(joueur + bots). Zéro divergence joueur↔bot.

🟠 **Statu quo intégral #2 — atelier à l'arrêt depuis ~16 h (inchangé depuis le 90e).** Vérifié à l'instant
(18:40) : **aucun `node` en cours**, aucun fichier neuf après **02:37:30**, `champion.json` **inchangé**
`{gen:48, note:17, record:11299}` (02:34) → **#53** intact (**−502 m** sous le vrai max `maxTotD:11801`,
`run-seed1505.json` gen50). `run-seed1707.json` (seul « M » au git status) mtime **10/09 14:29**, antique.
`evolution.log` **toujours absent**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit sans comparaison), #57 (gate `bench.js`
l.141 trie par `record`, plafonne `MAX_CHAMPIONS=12` → sélection par finition neutralisée), #51, #46, #52/#55,
puis réserves méthode #35/#40/#44.**

**Bilan : identique au 90e, aucune évolution en 16 h. Les deux urgences restent #53 (champion gelé 502 m sous
le max) et #57 (sélection par finition court-circuitée par le gate distance).**

---

## VERDICT — passage 2026-09-19 (90e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`66edccf`** (aucun nouveau commit). `train.html`
mtime **00:51:28** (bit-à-bit identique au 89e). Re-vérifié par grep à l'instant : moteur **UNIQUE** `stepCar`
l.9197, appelé identiquement par le joueur (l.10989, l.13221 `playerStep`) et le bot (l.12714 `stepCar(b,b.in,dt,
TRAIN.world)`). `carStartFall` 8868 / `carTryLand` 8896 / `carDrive` 8954 / `carFall` 9115 intactes.
`TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot` toujours inexistants (seul commentaire périmé l.8808)
→ isomorphisme par construction, zéro divergence joueur↔bot.

🟠 **Statu quo intégral — atelier à l'arrêt depuis ~16 h.** Dernier fichier écrit **02:35** (batch
`multi-2026-09-19T00-35-01`), **aucun `node` en cours** à l'instant (18:21). Aucun fichier plus récent que 02:37:30.
`champion.json` inchangé `{gen:48, note:17, record:11299}` (02:34) → **#53** intact : toujours **−502 m** sous le
vrai max du batch (`maxTotD:11801`, `run-seed1505.json` gen50). `evolution.log` **toujours absent**.

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit inconditionnellement sans comparaison), #57
(gate `bench.js` l.141 trie par `record` et plafonne `MAX_CHAMPIONS=12` → la « sélection par finition » de `66edccf`
ne s'applique qu'à un sous-ensemble biaisé distance), #51, #46, #52/#55, puis réserves méthode #35/#40/#44.**

**Bilan : aucun bug de physique, aucun nouveau commit, aucun mouvement d'atelier en ~16 h.** Les deux urgences
restent #53 (champion gelé 502 m sous le max) et #57 (sélection par finition neutralisée par le gate distance).

---

## VERDICT — passage 2026-09-19 (89e)

✅ **Isomorphisme physique : SAIN, inchangé.** Deux nouveaux commits depuis le 88e, **zéro ligne de
physique** : `15dcf12` ne touche que les résultats (`run-seed*.json` + le `multi-...json`, ajout du champ
`V_REF`), `66edccf` ne touche que `bench.js`. `train.html` mtime **00:51:28** (bit-à-bit identique au 88e).
Moteur **UNIQUE** `stepCar` l.9197 confirmé, appelé par le joueur et les bots ; `carDrive`/`carFall`/
`carTryLand`/`carStartFall` intactes. `TRAIN.groundPhysics/airPhysics/...` toujours inexistants (commentaire
périmé l.8808) → isomorphisme par construction. Aucune divergence joueur↔bot.

🔴 **#57 (NOUVEAU) — la « sélection par finition » de `66edccf` est NEUTRALISÉE par le tri de sélection
antérieur.** Le commit veut choisir le champion par **taux de finition** (pistés jamais vues), mais le
**gate de sélection** qui décide *quels* champions seront évalués n'a pas changé : `bench.js` **l.140**
`champ.sort((a,b)=>(b.record-a.record)||(b.gen-a.gen))` trie **toujours par `record` (distance)**, puis
**l.142-144** `kEval=Math.min(...,MAX_CHAMPIONS=12)` et `selected=champ.slice(0,kEval)` ne garde que les
**12 meilleurs par distance**. Or il y a **149 champions compatibles** (324 poids) sur disque. Conséquence
mécanique : les **137 champions non retenus** (dont tout champion qui FINIT souvent mais roule moins loin)
ne sont **jamais évalués en finition** — le classement « finition ↓ » du bloc 6b ne s'applique qu'à un
sous-ensemble déjà biaisé distance. La décision est donc **cosmétique** : elle réordonne 12 champions choisis
par la métrique qu'elle prétendait abandonner (`record` sature à la longueur de piste, cf. #51/85e). **Correction :
évaluer tous les 149 compatibles (ou lever le plafond `MAX_CHAMPIONS`), sinon la sélection par finition est
un vœu pieux.** À défaut, assumer explicitement que le gate l.140 reste « par distance » et renoncer au
discours « finition d'abord ».

🟠 **#53 toujours actif — champion gelé à ~502 m sous le vrai max.** `champion.json` = `{gen:48, note:17,
record:11299}` (02:34), mais le batch des 7 graines a produit **`maxTotD:11801`** (`run-seed1505.json`,
`record:11803`, gen 50) en ~même temps. `saveChampion` (l.13143-13160) écrit encore **inconditionnellement**
et **sans comparer** au record disque : le champion s'est figé à un record de gen 48 pendant que la gen 50
poussait à 11801. Même mécanique que les passages précédents, rejouée.

🟠 **Voltige toujours au point mort (méthode, pas physique).** Dernier `multi-2026-09-19T00-35-01` :
`tauxAtterrissage:32%`, `deaths.airtime:17624/27044` = **65 % de morts en vol**, `bonnesCoupes:1943`,
`arrivee:1220`. Même diagnostic que le 85e/86e : les bots finissent en **roulant au sol**, pas en coupant en
l'air. La fitness reste `totD + finition` (l.12970-12973) et **`W_CUT` reste absent** (confirmé « décision »
dans le message de `66edccf`). Seul vrai levier de méthode non traité : **#35**.

**Défauts ouverts inchangés : #53 (priorité), #57 (nouveau, gate bench.js), #51, #46, #52/#55 (note=rang
à côté de record=mètres), puis réserves méthode #35/#40/#44.** `evolution.log` **toujours absent**. Aucun
`node` en cours à l'instant (batch clôturé ~02:35).

**Bilan : aucun bug de physique. Le commit `66edccf` (#57) est un défaut de cohérence méthode : sa
sélection par finition est court-circuitée par le gate l.140 qui trie encore par distance et plafonne à 12
champions. #53 re-confirmé (champion 502 m sous le max). Voltige inchangée à 32 % d'atterrissage / 65 % de
morts en vol.**

---

## VERDICT — passage 2026-09-19 (88e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **00:51:28** (bit-à-bit identique au 87e).
Deux nouveaux commits, **zéro ligne de physique** : `0945f0f` et `56d5b0f` ne touchent que l'instrumentation
(écriture de `V_REF` dans les fichiers de run). `stepCar`/`carDrive`/`carFall`/`carTryLand` intactes, moteur UNIQUE.
Aucune divergence joueur↔bot.

🔴 **#56 (NOUVEAU, déjà clos) — le commit `0945f0f` a introduit un `ReferenceError` dans `sim-train.js`.** Il écrit
`V_REF:TRAIN.V_REF` aux l.**124** (RESUME) et l.**135** (fichier run), mais dans le process headless l'objet
s'appelle **`T`** (= `vmGet('__TRAIN')`, l.13), pas `TRAIN`. `TRAIN` est **indéfini** en portée de `sim-train.js`.
La l.124 est **hors try/catch** → tout child qui finit son éval avec ce code **crash avant** d'écrire son
`run-seed*.json` (la l.135 n'est jamais atteinte), donc son résultat est perdu. **Corrigé 6 min plus tard** par
`56d5b0f` (`TRAIN.V_REF` → `T.V_REF`, l.124/135). La correction est **correcte et complète** : `T.V_REF` résout bien
à `60` (train.html l.12523), et le seul autre site JS (`multi-train.js` l.93) lit `results[0].resume.V_REF`, protégé
par `results[0]&&results[0].resume`. **Aucun run n'a été perdu** : le batch en cours a démarré à **02:18:44**, soit
15 s **après** le fix — il a chargé le code corrigé. Leçon : ce genre d'instrumentation doit rester dans le
`try/catch` de persistance (la l.124 `RESUME` ne l'est pas) pour ne jamais tuer un run.

🟢 **L'atelier a REDÉMARRÉ — première activité réelle depuis le 87e.** Un `multi-train` **8 cœurs (8 seeds)** tourne
depuis **02:18:44** (8 `node.exe` enfant). Progression saine et rapide : `champion.json` est passé de
`{gen:12, note:23, record:6397}` (02:20) à **`{gen:22, note:19, record:9922}`** (02:23:58) — **+3325 m en ~3 min**,
en route vers le plafond historique 10331. Topologie `hid:16/size:324` inchangée (pas de reset illégitime).
Les `champions/gen*.json` s'archivent par graine/gen (gen1→22 écrits en ~5 min).

**Défauts ouverts inchangés : #53 (priorité, `saveChampion` écrit toujours inconditionnellement l.13143-13149, aucune
comparaison avant promotion), puis #51 (record = dernière piste), #46 (off-by-one `courbe`), #52 (note=rang à côté
de record=mètres — confirmé sur le champion actuel `note:19 / record:9922`), puis réserves méthode #35/#40/#44.**
`evolution.log` toujours absent.

**Bilan : aucun bug de physique. Deux commits d'instrumentation dont un a introduit puis vite corrigé un
`ReferenceError` (#56, sans perte de run car le fix a précédé le redémarrage de 15 s). L'entraînement est reparti et
progresse (record 6397→9922). Priorité inchangée : **#53**.**

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`1c4ad16`**, `train.html` bit-à-bit
identique (mtime **00:51:28**). Re-vérifié à l'instant par grep : moteur **UNIQUE** `stepCar` **l.9197**,
appelé identiquement par le joueur (`stepCar(PCAR,pin9,dt,PWORLD)` l.10989, `stepCar(PCAR,input,dt,PWORLD)`
l.13221 `playerStep`) et par le bot (`stepCar(b,b.in,dt,TRAIN.world)` l.12714). Fonctions physiques intactes
aux mêmes lignes : `carStartFall` 8868, `carTryLand` 8896, `carDrive` 8954, `carFall` 9115, `startFall` 9518.
`TRAIN.groundPhysics/airPhysics/startFallBot/tryLandBot` **toujours inexistants** (seul le commentaire périmé
l.8808 les mentionne) → isomorphisme par construction, zéro divergence joueur↔bot.

🟠 **Atelier à l'arrêt, statu quo intégral depuis le 86e.** `champion.json` **inchangé** `{gen:1, note:18,
record:732}` (mtime 00:54:41) → **#53** intact. **Aucun `node` en cours.** Dernier `results/runs` écrit
**00:53:03** (batch `multi-...22-53`) ; rien de plus récent. `evolution.log` **toujours absent**.

**Défauts ouverts inchangés : #53 (priorité), #55/#52, #51, #46, puis réserves méthode #35/#40/#44.**
Rien de neuf : aucun bug de physique, aucun mouvement d'atelier, aucun nouveau commit.

---

## VERDICT — passage 2026-09-19 (86e)

✅ **Isomorphisme physique : SAIN, inchangé.** Nouveau commit **`1c4ad16`** « bench.js : classement
final par distance MÉDIANE (pas record) ». Le `git show` est limpide : **1 fichier, 10 lignes ajoutées**,
toutes dans `bench.js` (stockage de `med` + tri final `results.sort((a,b)=>b.med-a.med)` + console.log).
**Zéro ligne de physique.** `train.html` NON touché (mtime 00:51:28, antérieur au commit 01:06) →
bit-à-bit identique au 85e. Moteur UNIQUE `stepCar` confirmé, `stepCar`/`carDrive`/`carFall`/`carTryLand`
intactes. Zéro divergence joueur↔bot.

🟢 **`1c4ad16` est la BONNE réponse à ma réserve du 85e — et il la confirme chiffres en main.** Le
message de commit est explicite : **4 champions à `record:10331` identique ont des médianes 1925→6892 m**,
soit un facteur ~3,6. C'est exactement le plafonnement que j'avais prédit : `record = max totD` sature
sur `L` dès que l'arrivée est atteignable (`matchDuration=L/V_REF`), et ne discrimine plus « savoir finir »
de « avoir tiré une piste chanceuse ». Classer par **médiane** (distance typique, pas le pic) restaure le
gradient de skill. Décision de méthode correcte. Reste à savoir si le sélecteur (promotion) s'aligne sur
cette médiane — voir **#54 ci-dessous**.

🟠 **LE fait nouveau de la méthode : la voltige NE progresse PAS malgré l'arrivée franchie.** Le batch
`multi-2026-09-18T22-53` (7 graines, gen50) clôturé : `dist.meilleur 10330`, médiane 9845, **`arrivee:908`**
(des bots finissent bien), **mais `tauxAtterrissage:31 %`** (↓ vs 40 % au 84e) et **`deaths.airtime 17928/26955
= 66 % de morts en vol**. Résultat : les bots traversent la ligne en **roulant vite au sol**, pas en
**coupant en l'air**. Le bonus `W_FIN=3000 + W_TEMPS=40/s` (l.12967-12971) récompense « finir vite », ce qui
se satisfait SANS voltige dès que `V_REF=60 ≤ vmax~62`. Le signal « coupe réussie » (`bonnesCoupes:1814`)
existe mais reste **noyé** sous le signal « distance ». C'est la confirmation empirique de **#35** : la
fitness ne récompense toujours pas **directement** l'atterrissage réussi d'une coupe. À traiter en méthode,
pas en physique.

🔴 **#53 intact — `champion.json` toujours `{gen:1, note:18, record:732}`** (mtime 00:54:41, inchangé
depuis le 85e). Le disque déborde de cerveaux 10–15× meilleurs (archivés `gen*.json`, records 9526/10331…),
mais le point de reprise est resté au plancher. **Aucun `node` en cours** : atelier à l'arrêt depuis
~00:54. Corriger #53 (promotion **comparative** + archivage **par graine**, cf. 85e) reste l'action
préalable à toute reprise utile.

🟠 **#55 (nouveau) — la promotion ne suit PAS le classement médiane.** `1c4ad16` classe le **banc** par
médiane, mais `saveChampion` (l.13143) promeut toujours `best = max b.fitness` (le **rang** moyen) et écrit
`note:Math.round(best.fitness)` (le rang) + `record` (mètres max) — deux échelles disjointes, inchangées
(#52). Tant que le **sélecteur d'évolution** (et pas seulement l'affichage du banc) n'utilise pas la même
métrique que l'objectif, on optimise une chose (rang) et on classe une autre (médiane). Cohérence à rétablir
en un seul endroit : la fonction de fitness UTILISÉE par `newGen`, pas le post-traitement de `bench.js`.

**Défauts ouverts inchangés : #53 (priorité), #52/#55, #51 (record = dernière piste), #46 (off-by-one
`courbe`), puis réserves méthode #35/#40/#44.** `evolution.log` **toujours absent**.

**Bilan : aucun bug de physique. Le commit `1c4ad16` (tri par médiane) est une bonne décision de méthode,**
qui confirme le plafonnement du `record` prédit au 85e. **MAIS la voltige stagne à 31 % d'atterrissage / 66 %
de morts en vol** : finir devient trivial (record ≈ Longueur de piste) sans que couper-en-l'air soit
récompensé. Corriger **#53** d'abord (reprise), puis **#35** (fitness qui récompense la coupe réussie, pas
seulement la distance).

---

## VERDICT — passage 2026-09-19 (85e)

✅ **Isomorphisme physique : SAIN, inchangé.** Nouveau commit **`ffcd42d`** « Durée de manche ∝
longueur de piste + fix bench.js (tri par record) ». Le diff est limpide : **3 fichiers, 5 lignes** — `train.html`
(`trackLen()` helper + `V_REF:60` + `matchDuration=L/V_REF` à chaque `startEval`), `sim-train.js`
(`MAX_TICKS=240 s` de garde-fou), `bench.js` (tri `b.record-b.record`). **Aucune ligne de physique.** Le
moteur reste **UNIQUE** `stepCar` l.9197 → joueur (`stepCar(PCAR,pin9,dt,PWORLD)` l.10989) et bots
(`stepCar(b,b.in,dt,TRAIN.world)` l.12714) : même appel, même pile. `TRAIN.groundPhysics/airPhysics/...`
**toujours inexistants** (seul le commentaire périmé l.8808 les mentionne) : isomorphisme par construction.
Le commit rapporte `check-iso 0.000e+0`, `check-actions 24/24`.

🔴 **#53 re-confirmé, mécanisme AGGRAVÉ par le multi-train — `champion.json` RETOMBÉ au plancher 732 m
malgré un batch qui venait d'archiver des cerveaux à 10331/11525 m.** Le batch `multi-2026-09-18T22-53`
(7 graines 1000→1606, gen50) a produit : médiane `maxTotD` 9845, **meilleur record 10331** (≥10330 ×4,
un **11525** en `gen00016`), `bonnesCoupes:1814`, `arrivee:908`. Ces cerveaux SONT archivés dans
`results/champions/gen*.json`. Mais `champion.json` (mtime 00:54:41, juste après la fin du batch 00:53:03)
vaut **`{gen:1, note:18, record:732}`** — un nouveau run a démarré ~00:54, a écrit son champion de gen 1
(732 m) et s'est arrêté (plus aucun `node` en cours). Deux défauts superposés : (a) `saveChampion`
l.13143 écrit **inconditionnellement** (l.13075 sur record, l.13084 sur autosave), sans jamais comparer au
`record` disque — le point de reprise repart de **732 m**, soit **−9599 m** sous le vrai max du moment ;
(b) **NOUVEAU/structural** : les 7 graines du multi-train s'exécutent **en parallèle** et écrivent **toutes
dans le MÊME `results/champion.json`** (stub `fetch` sim-env.js l.107) → course au dernier écrivain, la
dernière graine à démarrer (gen 1) gagne face aux records des autres. Le banc tournera donc sur un
champion dégénéré tant qu'on n'archive pas **par graine** et qu'on ne promeut qu'**en comparant**.

🟠 **Réserve de méthode NOUVELLE liée à `ffcd42d` — `matchDuration = L/V_REF` sature la métrique
« record = distance ».** `record = max totD` (l.13069-13074) où `totD = SURV.pBase + s`, et maintenant
que finir devient **toujours faisable** (V_REF=60 ≤ vitesse de pointe ~62 m/s), un bot qui franchit
`L−32` atteint `s ≈ L`. Résultat : les « records » du batch collent à la **longueur de la piste tirée**
(7777→10849 m) — `10331`, `10081`, `9546` ≈ des `L` de pistes, pas du skill. Le gradient de distance
(aller loin) **disparaît** dès que l'arrivée est atteignable : `record` ne mesure plus que « a fini ou pas ».
Le vrai signal subsiste dans le bonus `W_TEMPS=40/s` (l.12972, `matchDuration−finishT`, qui récompense
d'aller vite) — mais lui aussi **dépend maintenant de L** (matchDuration ∝ L) donc n'est **pas normalisé**
entre pistes. La sélection **par rang** (`fitnessSum`/`rangMoyen`, l.13049-13067) absorbe en partie le bruit,
à confirmer. À surveiller : si la voltige ne progresse plus, c'est ce plafonnement du signal qui en est la
cause, pas la suite physique (intacte).

🟠 **#52 améliore mais reste à demi-corrigé.** `bench.js` trie désormais par `record` (distance) — correct,
le champion dégénéré ne sortira plus en tête. MAIS `saveChampion` (l.13148) écrit toujours `note:Math.round
(best.fitness)` (le **rang** moyen `[0,POP−1]`) à côté de `record` (mètres) : deux échelles incompatibles dans
le même fichier, et le cerveau sauvé est `best`=max-rang alors que `record`=max-distance peut appartenir à un
**autre** bot. Toujours #46 (off-by-one `courbe`) et #51 (record = dernière piste). `evolution.log` **toujours absent**.

**Bilan : aucun bug de physique. Le commit `ffcd42d` est sain (timing + tri), MAIS le point d'achoppement
opérationnel est inchangé et aggravé : `champion.json` tient un cerveau de 732 m pendant que le disque
déborde de cerveaux 10× meilleurs. Corriger #53 (promotion comparative + archivage par graine) reste
l'action préalable à toute reprise utile.**

---

## VERDICT — passage 2026-09-19 (84e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`0d2969e`**. Deux fichiers modifiés
**non-commités** (git status `M`) :
- `train.html` : **+1 ligne seulement** — `trackLen:function(){return L;}` (l.12522), un simple helper
  de mesure. **Aucune ligne de physique.** `stepCar`/`carDrive`/`carFall`/`carTryLand`/`carStartFall`
  intactes (l.8868/8896/8954/9115/9197), moteur UNIQUE. Zéro divergence joueur↔bot.
- `bench.js` : **1 ligne** — tri `champ.sort((a,b)=>b.note-b.note)` → `b.record-b.record` (+ commentaire
  « par RECORD = distance, pas `note` qui mélange rang/ancienne distance »). **C'est un correctif de #52**
  (le tri du banc se faisait sur `note`=rang au lieu de la distance). Bonne décision, non-commité.

🟢 **PERCÉE MAJEURE — la ligne d'arrivée est franchie, le bonus est VIVANT.** L'entraînement tourne
activement (run `seed500` clôturé + un batch `multi-train` EN COURS à l'instant, champions écrits à
00:41-00:42) :
- `run-seed500.json` (gen50, 00:32:00) : `record:9911`, `deaths.arrivee:64` (64 bots **ont fini**),
  `tauxAtterrissage:40%` (↑ 5 pts), `deaths.airtime` 2200/3763 = **58%** (↓ 5 pts), `goodCuts:235`.
- Batch en cours : **`gen00020-note22` record `10331`** — nouveau plafond. Le record passe en ~20 min
  de **732** (plancher historique du 82e) à **`10331`**. C'est exactement le levier prédit au 83e : la
  manche 150 s fait franchir `s>L−32` (l.12725), `finished` s'active et le bonus `W_FIN=3000 + W_TEMPS`
  (l.12967-12971) sort du **mort-code** — la voltige est enfin récompensée directement. `goodCuts:235`
  mesurable = le couper-en-vol existe bel et bien dans la population.

🔴 **#53 rejoué EN DIRECT — champion réécrit à la baisse par le run en cours.** `champion.json` est
passé de `record:9911` (seed500, 00:32) à **`{gen:25, note:19, record:9358}`** (00:40:57) — la **même
topologie** (hid16/324), donc PAS un reset légitime. `saveChampion` (l.13141) écrit **toujours
inconditionnellement** : il sélectionne `best`=max `b.fitness` des bots COURANTS (l.13143), sans JAMAIS
comparer à l'ancien `record` sur disque. Les deux points d'appel (l.13073 record du run, et l.13082
autosave `gen%10`) réécrasent le fichier dès qu'un record **local au run** est dépassé. Le batch en
cours remonte vite (10331 vu), donc l'impact est pour l'instant masqué — mais la structure n'a pas bougé :
**dès qu'un run régresse ou s'interrompt, `champion.json` reste collé à un cerveau inférieur.** C'est
exactement le mécanisme du plancher 732 m.

🟠 **#52 précisé — le `note` est bien un RANG (0..POP−1), pas une distance, et pire : les poids sauvés
≠ la distance affichée.** Confirmé mécanisme exact : l.13065 `b.fitness=b.fitnessSum/evalCount` = **moyenne
des scores de RANG** (bornée `[0,POP−1]`, cf l.13043-13056), donc `note:19` = « rang moyen ~19/23 ». Or
`saveChampion` (l.13146) écrit `note:Math.round(best.fitness)` (le RANG) à côté de `record:Math.round(...)`
(des MÈTRES) : `champion.json` affiche `note:19` / `record:9358`, deux échelles incompatibles. **Et** le
cerveau sauvé est `best`=max-RANG (l.13143), tandis que `record`=max-`totD` (l.13067) peut appartenir à un
**autre** bot (celui qui a roulé le plus loin ≠ celui le mieux classé). Le `record` affiché ne correspond
donc pas aux poids stockés. Même famille que #52, à corriger ensemble.

🟠 **#46 (off-by-one) persiste.** `run-seed500` à `gens:50` → `courbe.length=49` (vérifié). `#51` et les
réserves #35/#40/#44 non retouchées. `evolution.log` **toujours absent**.

**Bilan : aucun bug de physique. Levier #35 enfin actif (arrivée franchie, record 732→10331, voltige
mesurable), MAIS #53 re-confirmé à l'instant (champion réécrit 9911→9358) reste l'urgence opérationnelle.**
Corriger #53 AVANT de laisser le batch en cours clore un champion arbitraire.

---

## VERDICT — passage 2026-09-19 (83e)

✅ **Isomorphisme physique : SAIN, inchangé.** Nouveau commit **`0d2969e`** « Manche 45s→150s : révéler les
crashs et activer l'arrivée ». Le diff est limpide : **2 fichiers, 2 lignes** — `matchDuration: 45→150`
(train.html l.12521) et `MAX_TICKS` qui lit désormais `T.matchDuration` au lieu de 45 en dur
(sim-train.js l.65). **Aucune ligne de physique.** Moteur UNIQUE `stepCar` confirmé ; le commit rapporte
`check-iso 0.000e+0`, `check-actions 24/24`. Zéro divergence joueur↔bot.

🟢 **Reprise RÉELLE de l'entraînement — la première depuis ~5 jours.** Un run headless tourne activement
depuis ~00:18 : **gen 27 atteint en ~6 min**, `champion.json` passé du plancher historique `record:732`
(82e) à **`record:8604`** (gen 27, note 22, 22:24Z). C'est l'effet attendu du commit : les crashs tardifs
(20–137 s, 80 % des pistes) deviennent visibles et pénalisés, et le bot apprend à SURVIVRE au lieu de
maximiser un sprint de 45 s.

🟠 **Réserve de méthode — #35 toujours ouvert, horizon allongé.** Le « record » = `totD = SURV.pBase + s`
(l.12715), c.-à-d. la distance **le long du ruban**. Allonger la manche 45→150 s fait grimper ce record
**mécaniquement** (3,3× plus de temps pour accumuler du `s`) : le bond 732→8604 est en partie un artefact
de durée, PAS une preuve d'apprentissage de l'arrivée. L'arrivée (`b.finished`) ne s'active qu'à
`s > L−32` (l.12724), soit **~9,2 km − 32 m ≈ 9168 m** (L ≈ 9,2 km, longueur typique citée par le commit).
À `record:8604`, le champion **n'a pas encore franchi la ligne** → `TRAIN.fitness` (l.12968) retombe sur
`totD` pure, et le bonus d'arrivée `W_FIN=3000 + W_TEMPS=40/s` (l.12966-12967) reste **mort-code** pour lui.
**C'est LE moment critique** : si le run pousse `s` au-delà de ~9168 m, `finished` passe à true et la
fitness fait un saut discontinu (+3000 + ~40×temps gagné, soit ~+30 % instantané) — exactement le levier
de #35 qu'on attend. À `record:8604`, on est à ~560 m du seuil. **À suivre de près au prochain passage.**

🔴 **#53 intact (priorité).** `saveChampion` (l.13140) écrit **inconditionnellement** le bot au meilleur
`fitness` à chaque AUTOSAVE (`gen%10`, l.13081), sans comparer au champion existant avant promotion. Le
garde-fou `bestDist > record` (l.13070) ne protège que la sauvegarde sur record, pas l'AUTOSAVE. Tant que
le record grimpe c'est indolore, mais dès qu'une génération régresse, `champion.json` sera écrasé par un
cerveau inférieur — c'est exactement ce qui avait produit le plancher 732 m.

**Défauts ouverts inchangés : #53, #51 (record = dernière piste), #46 (off-by-one `courbe`), #52 (note =
rang à côté de record en mètres), puis réserves #35/#40/#44.** `evolution.log` toujours absent.

**Bilan : aucun bug de physique. Le commit `0d2969e` est une décision de méthode saine (révéler les crashs
+ activer l'arrivée) et il relance enfin l'entraînement (gen 27, record 8604 m en ~6 min). Point de bascule
imminent : franchir la ligne (~9,17 km) pour faire vivre enfin le bonus d'arrivée (#35).**

---

## VERDICT — passage 2026-09-19 (82e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`232aa80`** (aucun nouveau commit), `train.html`
mtime **21:12:55** (bit-à-bit identique au 81e), git **clean** sur le code (seuls les `run-seed*.json` de
`results/runs/` restent « M », comme aux passages précédents). Moteur **UNIQUE** `stepCar`. Zéro divergence
joueur↔bot.

🟠 **Statu quo + confirmation : le run headless relancé après le revert est MORT à gen1.** Depuis le 81e
(~20h le 18/09), **seul** `champions/gen00001-note18.json` (mtime **21:14:44**, strictement `champion.json`) a
été écrit. **Aucun** `gen00002+` plus récent, **aucun** `run-seed*.json` neuf (dernier clôturé = `run-seed400.json`
du **12/09 13:25**). Le run s'est interrompu après 1 génération, sans produire de run complet ni de stats de banc.
`evolution.log` **toujours absent**.

🔴 **Conséquence de #53 : champion figé au plancher historique le plus bas.** `champion.json` =
`{hid:16, size:324, gen:1, note:18, record:732, date:19:14:44Z}` — le **record le plus faible jamais enregistré**
dans le champion, désormais stable ~24 h. Le meilleur cerveau **16 cachés** compatible de l'historique (seed1808
`record:4832`) reste **inarchivé** (aucun `gen*.json` 16-cachés ne le conserve, cf. 81e) : reprise théorique 4832 m,
reprise réelle **732 m**, soit **−4100 m**. La cause est double et inchangée : **#53** (`saveChampion` écrit
inconditionnellement, aucune comparaison avant promotion) + absence d'archivage des poids par topologie.

**Défauts ouverts inchangés (priorité) : #53, #51, #46, #52**, puis réserves de méthode **#35, #40, #44**.

**Bilan : aucun bug de physique, aucun mouvement d'atelier en ~24 h, champion bloqué à un plancher record (732 m).**
Corriger **#53** reste l'action préalable à toute reprise utile de l'entraînement.

---

## VERDICT — passage 2026-09-18 (81e)

✅ **Isomorphisme physique : SAIN.** Nouveau commit **`232aa80`** (21:14:07) « Revert réseau 16→32 et cadence
10→30 Hz : aucun gain mesuré au banc ». Le `git show` est limpide : **1 fichier, 4 lignes de contexte, 2
lignes réellement changées** — `MLP.HID 32→16` (l.12489) et `b.think 1/30→0.1` (l.12683). **Aucune ligne de
physique.** `stepCar`/`carDrive`/`carFall`/`carTryLand`/`carStartFall` intactes, moteur UNIQUE. Zéro
divergence joueur↔bot.

🟢 **Le revert par le banc est la BONNE décision, et il confirme mes réserves du 69e.** Les médianes du banc
(rapportées dans le commit) sont du **bruit** : 32 cachés 2611 m vs 16 cachés 2660 m ; 30 Hz 2675 m vs 10 Hz
2660 m — aucun gain, coût CPU en plus. C'est exactement la conclusion du 69e : « si 32 cachés ne casse pas le
plafond 59 m/s, c'est la fitness par distance pure (#35) qu'il faut revoir, pas la capacité ». Le banc vient
de le démontrer empiriquement. **La méthode a avancé par élimination** : ni la capacité réseau, ni la cadence
ne sont le goulot. Ce qui reste est bien **#35** (fitness = distance pure, aucun bonus d'atterrissage).

🟢 **#49 RESOLU par le revert.** Le doc-comment l.12680 « tick humain ~10 Hz » redevenu **exact** : la ligne
12683 est de nouveau `b.think=0.1` (= 10 Hz). Plus de commentaire périmé.

🟢 **Reset `champion.json` LÉGITIME (pas #53).** `champion.json` passe de `{hid:32, size:644, record:3326}` à
`{hid:16, size:324, gen:1, note:18, record:732, date:19:14:44Z}`. Changement de topologie (644→324 poids) →
l'ancien cerveau 32 cachés est **incompatible**, le reset est **correct et nécessaire** (même logique qu'au
69e). Un run headless a redémarré juste après le commit (`gen00001-note18.json` mtime 21:14:44, ~37 s après).

🟠 **Réserve de méthode (légère) — repartir de gen1 quand un 16-cachés `record:4832` existait.** Le meilleur
cerveau **16 cachés** de l'historique (seed1808 `record:4832`, batch du 10/09) est redevenu
**compatible** avec la topologie revert. Mais ses poids ne sont conservés nulle part (les `champions/gen*.json`
16-cachés ont été écrasés par le run 32-cachés du 12/09, et `run-seed*.json` ne stockent que des stats, pas
les poids). On repart donc de `record:732` faute d'avoir archivé les poids par topologie. Pas un bug, une
occasion manquée de repartir de 4832 au lieu de zéro — conforte #53 (il faut archiver les poids ET ne promouvoir
le champion qu'en comparant, sans quoi les transitions de topologie détruisent l'historique).

🟠 **Défauts toujours ouverts, inchangés :** **#53** (écriture inconditionnelle de `saveChampion`, aucune
comparaison), **#51** (record = dernière piste), **#46** (off-by-one `courbe`=49 pour `gens:50`), **#52**
(note = rang à côté de record en mètres), puis réserves **#35** (fitness = distance pure — désormais LE vrai
levier, confirmé par élimination), **#40**, **#44**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de physique, deux décisions de méthode saines (revert au banc + reset légitime), #49 clos.**
Le point d'achoppement est désormais sans ambiguïté **#35** : la voltige stagne à ~60 % de morts en vol et le
plafond ~59 m/s est confirmé NI par la capacité réseau NI par la cadence → il faut une fitness qui récompense
directement l'atterrissage réussi (et pas seulement `totD` en distance cumulée).

---

## VERDICT — passage 2026-09-18 (80e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau commit), `train.html`
mtime **13:14:39** (bit-à-bit identique au 79e), git **clean** sur le code (seuls les `run-seed*.json` de
`results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots. Aucune ligne de physique n'a bougé
→ zéro divergence joueur↔bot.

🟠 **Statu quo intégral — rien à signaler depuis le 74e (14/09), ~4,5 jours d'atelier à l'arrêt.** Re-vérifié à
l'instant : `champion.json` **inchangé** `{gen:46, note:18, record:3326, date:11:24:31Z}` → **#53** intact.
`run-seed400.json` (mtime **13:25:15**) **identique** : `maxTotD:5108`, `record:3326`, `tauxAtterrissage:35 %`,
morts en vol 63 % (1765/2790), `courbe`=49 pts pour `gens:50` (**#46**). Dernier `results/` écrit le **12/09
13:25**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Défauts ouverts inchangés (priorité) : **#53**
(reprise arbitraire à 3326, −1506 m du meilleur historique seed1808 `record:4832`), **#51** (record = dernière
piste), **#46** (off-by-one `courbe`=49 pour `gens:50`), **#52** (note = rang), **#49** (doc-comment 30 Hz), puis
réserves de méthode **#35/#40/#44**. Prochaine action utile inchangée : reprendre l'entraînement **après avoir
corrigé #53**.

---

## VERDICT — passage 2026-09-17 (79e)

✅ **Isomorphisme physique : SAIN, inchangé.** Re-vérifié à l'instant : `HEAD` toujours **`a5c7b5f`**, `train.html`
mtime **13:14:39** (identique bit-à-bit au 78e), git **clean** sur le code (seuls les `run-seed*.json` de
`results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots. Aucune ligne de physique n'a bougé
→ zéro divergence joueur↔bot.

🟠 **Statu quo intégral — rien à signaler depuis le 78e (~20 min).** `champion.json` **inchangé**
`{gen:46, note:18, record:3326, date:11:24:31Z}` → **#53** intact. `run-seed400.json` (mtime **13:25:15**)
**identique** : `maxTotD:5108`, `record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 %. Dernier `results/`
écrit le **12/09 13:25** ; **5 jours sans mouvement**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Défauts ouverts inchangés (priorité) : **#53**
(reprise arbitraire à 3326), **#51** (record = dernière piste), **#46** (off-by-one `courbe`=49 pour `gens:50`),
**#52** (note = rang), **#49** (doc-comment 30 Hz), puis réserves de méthode **#35/#40/#44**. Prochaine action
utile inchangée : reprendre l'entraînement **après avoir corrigé #53**.

---

## VERDICT — passage 2026-09-17 (78e)

✅ **Isomorphisme physique : SAIN, inchangé.** Re-vérifié à l'instant : `HEAD` toujours **`a5c7b5f`** (aucun
nouveau commit), `train.html` mtime **13:14:39** (bit-à-bit identique au 77e), git **clean** sur le code
(seuls les `run-seed*.json` de `results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots.
Aucune ligne de physique n'a bougé → zéro divergence joueur↔bot à re-vérifier.

🟠 **Statu quo intégral depuis le 74e (14/09) — atelier à l'arrêt ~5 jours, aucun correctif.** Re-vérifié :
`champion.json` **inchangé** `{gen:46, note:18, record:3326, date:11:24:31Z}` → **#53** intact (reprise à
−1506 m du meilleur historique seed1808 `record:4832`). `run-seed400.json` (mtime **13:25:15**, dernier
fichier écrit) **identique** : `maxTotD:5108`, `record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 %
(1765/2790). Dernier `results/runs/` écrit le **12/09 13:25** ; **rien de neuf depuis 5 jours**.
`evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Défauts ouverts inchangés, dans l'ordre de
priorité : **#53** (champion.json réécrit inconditionnellement → reprise arbitraire à 3326), **#51** (record
= dernière piste), **#46** (off-by-one `courbe`=49 pour `gens:50`), **#52** (note = rang), **#49** (doc-comment
30 Hz périmé l.12680), puis les réserves de méthode **#35** (fitness = distance pure), **#40**, **#44**.
Prochaine action utile inchangée : reprendre l'entraînement **après avoir corrigé #53**.

---

## VERDICT — passage 2026-09-17 (77e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau commit), `train.html`
mtime **13:14:39** (bit-à-bit identique au 76e), git **clean** sur le code (seuls les `run-seed*.json` de
`results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots. Aucune ligne de physique n'a bougé
→ zéro divergence joueur↔bot à re-vérifier. Pas de relecture de formules nécessaire (fichier inchangé).

🟠 **Statu quo intégral depuis le 74e (14/09) — atelier à l'arrêt ~5 jours.** Re-vérifié à l'instant : `champion.json`
**inchangé** `{gen:46, note:18, record:3326, date:11:24:31Z}` — **#53** toujours intact (reprise à −1506 m du meilleur
historique seed1808 `record:4832`). `run-seed400.json` (mtime **13:25:15**) **identique** : `maxTotD:5108`,
`record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 %. Dernier fichier `results/` écrit le **12/09 13:25** ;
**rien de neuf depuis 5 jours**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Défauts ouverts inchangés, dans l'ordre de priorité :
**#53** (champion.json réécrit inconditionnellement → reprise arbitraire à 3326), **#51** (record = dernière piste),
**#46** (off-by-one `courbe`=49 pour `gens:50`), **#52** (note = rang), **#49** (doc-comment 30 Hz périmé l.12680),
puis les réserves de méthode **#35** (fitness = distance pure), **#40**, **#44**. Prochaine action utile inchangée :
reprendre l'entraînement **après avoir corrigé #53**.

---

## VERDICT — passage 2026-09-16 (76e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau commit), `train.html`
mtime **13:14:39** (strictement identique au 74e/75e), git **clean** sur le code (seuls les `run-seed*.json` de
`results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots. Aucune ligne de physique n'a bougé
→ zéro divergence joueur↔bot à re-vérifier.

🟠 **Statu quo intégral depuis le 74e (14/09) — atelier à l'arrêt ~4 jours.** Re-vérifié à l'instant : `champion.json`
**inchangé** `{gen:46, note:18, record:3326, date:11:24:31Z}` — **#53** toujours intact (reprise à −1506 m du meilleur
historique seed1808 `record:4832`). `run-seed400.json` (mtime **13:25:15**) **identique** : `maxTotD:5108`,
`record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 %. Dernier fichier `results/` écrit le **12/09 13:25** ;
**rien de neuf depuis 4 jours**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Défauts ouverts inchangés, dans l'ordre de priorité :
**#53** (champion.json réécrit inconditionnellement → reprise arbitraire à 3326), **#51** (record = dernière piste),
**#46** (off-by-one `courbe`=49 pour `gens:50`), **#52** (note = rang), **#49** (doc-comment 30 Hz périmé l.12680),
puis les réserves de méthode **#35** (fitness = distance pure), **#40**, **#44**. Prochaine action utile inchangée :
reprendre l'entraînement **après avoir corrigé #53**.

---

## VERDICT — passage 2026-09-16 (75e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau commit),
`train.html` mtime **13:14:39** (strictement identique au 74e), git **clean** sur le code (seuls les
`run-seed*.json` de `results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots.
Aucune ligne de physique n'a bougé → zéro divergence joueur↔bot à re-vérifier.

🟠 **Statu quo intégral depuis le 74e (14/09) — atelier à l'arrêt ~3,5 jours.** Re-vérifié à l'instant
(16/09) : `champion.json` **inchangé** `{gen:46, note:18, record:3326, date:11:24:31Z}` — bug **#53** toujours
intact (point de reprise à −1506 m du meilleur historique seed1808 `record:4832`). `run-seed400.json` (mtime
13:25:15) **identique** : `maxTotD:5108`, `record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 % (1765/2790).
Dernier fichier `results/` écrit le 12/09 13:25 ; **rien de neuf depuis 4 jours**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Les défauts ouverts restent tous dans l'état du
74e : **#53** (champion.json réécrit inconditionnellement → reprise arbitraire à 3326, −1506 m du vrai max),
**#51** (record = dernière piste), **#46** (off-by-one `courbe`=49 pour `gens:50`), **#52** (note = rang à côté
de record en mètres), **#49** (doc-comment 30 Hz périmé l.12680), puis les réserves de méthode **#35** (fitness
= distance pure), **#40**, **#44**. Prochaine action utile inchangée : reprendre l'entraînement après avoir
corrigé **#53**.

---

## VERDICT — passage 2026-09-14 (74e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau commit),
`train.html` mtime **13:14:39** (strictement identique au 73e), git **clean** sur le code (seuls les
`run-seed*.json` de `results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots.
Aucune ligne de physique n'a bougé → zéro divergence joueur↔bot à re-vérifier.

🟠 **Statu quo intégral depuis le 73e (12/09 ~13:42) — atelier à l'arrêt ~2 jours.** Re-vérifié à l'instant
(14/09) : `champion.json` **inchangé** `{gen:46, note:18, record:3326, date:11:24:31Z}` — bug **#53** toujours
intact (point de reprise à −1506 m du meilleur historique seed1808 `record:4832`). `run-seed400.json` (mtime
13:25:15) **identique** : `maxTotD:5108`, `record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 % (1765/2790).
Dernier fichier `results/` écrit le 12/09 13:25 ; **rien de neuf depuis**. `evolution.log` **toujours absent**.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Les défauts ouverts restent tous dans l'état du
73e : **#53** (champion.json réécrit inconditionnellement → reprise arbitraire à 3326, −1506 m du vrai max),
**#51** (record = dernière piste), **#46** (off-by-one `courbe`=49 pour `gens:50`), **#52** (note = rang à côté
de record en mètres), **#49** (doc-comment 30 Hz périmé l.12680), puis les réserves de méthode **#35** (fitness
= distance pure), **#40**, **#44**. Prochaine action utile inchangée : reprendre l'entraînement après avoir
corrigé **#53**.

---

## VERDICT — passage 2026-09-12 (73e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau commit),
`train.html` mtime **13:14:39** (strictement identique au 72e), git **clean** sur le code (seuls les
`run-seed*.json` de `results/runs/` restent modifiés). Moteur **UNIQUE** `stepCar` → joueur + bots.
Zéro divergence joueur↔bot à re-vérifier : aucune ligne de physique n'a bougé.

🟠 **Statu quo intégral depuis le 72e (~13:42).** Re-vérifié à l'instant : `champion.json` **inchangé**
`{gen:46, note:18, record:3326, date:11:24:31Z}` — bug **#53** intact (point de reprise toujours à
−1506 m du meilleur historique seed1808 `record:4832`). `run-seed400.json` (mtime 13:25:15) **identique**
à l'analyse du 72e : `maxTotD:5108`, `record:3326`, `tauxAtterrissage:35 %`, morts en vol 63 %
(`airtime` 1765/2790). **Aucun** fichier `results/` plus récent que 13:30. `evolution.log` **toujours
absent**. Aucun correctif posé.

**Bilan : aucun bug de PHYSIQUE, aucun mouvement d'atelier.** Les défauts ouverts restent tous dans
l'état du 72e : **#53** (champion.json réécrit inconditionnellement → reprise arbitraire à 3326,
−1506 m du vrai max), **#51** (record = dernière piste, écart 1782 m sur ce run), **#46** (off-by-one,
`courbe`=49 pour `gens:50`), **#52** (note = rang à côté de record en mètres), **#49** (doc-comment 30 Hz
périmé l.12680), puis les réserves de méthode **#35** (fitness = distance pure), **#40**, **#44**. Prochaine
action utile inchangée : reprendre l'entraînement après avoir corrigé **#53**.

---

## VERDICT — passage 2026-09-12 (72e)

✅ **Isomorphisme physique : SAIN, inchangé.** `HEAD` toujours **`a5c7b5f`** (aucun nouveau
commit), `train.html` mtime **13:14:39** (identiques au 71e), git **clean** sauf les `run-seed*.json`
non-suivis. Relu la zone `botStep` (l.12676-12724) : le bot produit un **état de touches** (l.12702-12708,
espace d'action = celui du joueur) puis appelle `stepCar(b,b.in,dt,TRAIN.world)` **l.12712** avec le **dt
réel** — le 30 Hz ne touche QUE `b.think` (l.12683) et n'intervient pas dans l'intégration. Moteur UNIQUE
`stepCar`. Zéro divergence joueur↔bot.

🟢 **Le run 30 Hz est TERMINÉ et exploitable — `run-seed400.json` (gen50, 13:25:15).** Premier test
complet de l'hypothèse « plafond 59 m/s = cognitif » :
- `maxTotD` **5108** — en **hausse nette** vs le 32-cachés 10 Hz (`seed300`: **3818**), et proche des
  meilleurs 16-cachés du batch (seed1808 `5383`, seed2111 `5129`). **Cohérent** avec l'hypothèse : plus de
  finesse de braquage → va plus loin en cumulé.
- **MAIS** `record` **3326** (↓ vs 3682), `tauxAtterrissage` **35 %** (↓ vs 39 %), **morts en vol 63 %**
  (1765/2790, ↑ vs 59 %). Le 30 Hz n'a donc **pas cassé** le plafond proprement : plus de distance totale,
  mais pas mieux posé ni plus loin sur la dernière piste. **n=1, graine différente** → non concluant.

🔴 **#53 re-confirmé avec RÉGRESSION NETTE — `champion.json` à −356 m.** Le run seed400 a écrasé
`champion.json` : `{gen:40, hid:32, record:3682}` (seed300, 17:16:47Z) → **`{gen:46, note:18, record:3326}`**
(11:24:31Z). **Même topologie** (in:15/hid:32/out:4, `size:644`) → ce n'est PAS un reset légitime (#53, pas
le cas de changement de réseau). L'écriture inconditionnelle de `saveChampion` a fait reculer le point de
reprise à **3326**, **−356 m** sous l'ancien champion et **−1506 m** sous le meilleur historique (seed1808
`record:4832`). Le run a continué jusqu'à gen50 sans améliorer (`record:3326` partout après gen46).

🟠 **#51 ré-éclatant sur ce run : écart `record`↔`maxTotD` = 1782 m.** `record:3326` (dernière piste,
`endGen` lit `max b.totD` après `resetBot` qui remet `totD` à 0 à chaque piste) vs `maxTotD:5108` (vrai max
cumulé). Le champion sauvé **sous-estime de 35 %** le vrai meilleur du run — c'est exactement le fer de
lance de #51, jamais corrigé.

🟠 **#46 (off-by-one) persiste : `courbe` = 49 pts pour `gens:50`** (vérifié `len=49`). `#52` persiste :
`note:18` (rang) côte à côte `record:3326` (mètres). `#49` persiste : l.12680 dit encore « tick humain ~10
Hz » alors que la cadence est 30 Hz (l.12683).

**Bilan : aucun bug de PHYSIQUE, un test de méthode exploitable mais loin d'être tranché.** Le 30 Hz a
**amélioré `maxTotD`** (+1327 m vs le 32-cachés 10 Hz) mais **dégradé atterrissage et morts en vol** — la
fitness par distance pure (#35) récompense « rouler loin », pas « se poser », donc l'effet levier est
noyé. À confirmer sur 1-2 graines de plus **en corrigeant d'abord #53** (sinon chaque run écrase le
champion par un cerveau arbitrairement pire). Priorités inchangées : **#53**, **#51**, **#46**, **#52**,
puis **#35**.

---

## VERDICT — passage 2026-09-12 (71e)

✅ **Isomorphisme physique : SAIN.** Nouveau commit **`a5c7b5f`** (13:15:36) « Cadence de décision 10 Hz -> 30 Hz ». Le `git show` est limpide : **1 fichier, 1 ligne changée** (`b.think=0.1` → `b.think=1/30`, l.12683), **aucune ligne de physique**. `stepCar`/`carDrive`/`carFall`/`carTryLand`/`carStartFall` intactes, moteur UNIQUE. Le bot appelle toujours `stepCar(b,b.in,dt,TRAIN.world)` l.12712 avec le **dt réel** (la cadence de décision ne touche pas l'intégration physique). Zéro divergence joueur↔bot à re-vérifier.

🟢 **Le levier choisi est le bon (méthode, pas physique).** Le message de commit documente : à 10 Hz et ~60 m/s, un à-coup de braquage/gaz tous les ~6 m. 30 Hz = pilotage fin en virage. C'est **exactement** l'hypothèse « plafond 59 m/s = cognitif » avancée au 69e — ce run la teste. Logique saine.

🟠 **Réserve méthode — écart de cadence joueur↔bot subsiste (30 Hz vs ~60 Hz).** Le joueur lit son clavier à ~60 Hz (chaque frame), le bot décide à 30 Hz : il lui reste ~2 frames d'équivalent-latence en virage serré. Pas un bug (le lissage `steer += (cible-steer)*dt*18` dans `stepCar` absorbe), mais c'est le plafond résiduel si 30 Hz ne suffit pas à casser les 59 m/s. **Coût CPU : 3× plus de `forward()` par seconde simulée** → l'entraînement ralentit d'autant à génération égale. À garder en tête avant de généraliser.

🔴 **#53 rejoué EN DIRECT — `champion.json` écrasé par un run ENCORE EN COURS.** Au relevé (13:21:48), un run test 30 Hz tourne depuis ~13:15:29 (premier `gen00001-note21.json` à 13:15:56, dernier `gen00030-note19.json` à 13:20:54, donc **non terminé**). Il a déjà écrasé `champion.json` : **`{gen:40, record:3682}` → `{gen:30, note:19, record:2797}`**, avec la **même** topologie (hid:32 / size:644) — ce n'est PAS un reset lié à un changement de réseau, c'est le défaut structurel #53 : `saveChampion` écrit **inconditionnellement** dès qu'un record partiel est battu, sans attendre la fin du batch ni comparer au champion précédent. Le point de reprise est retombé à **−885 m** sous son état d'avant (3682) et **−2035 m** sous le meilleur historique (seed1808 `record:4832`). ⚠ Nuance honnête : run à gen 30/50, `2797` n'est pas définitif et peut remonter — mais chaque écriture intermédiaire détruit l'ancien champion sans garde-fou.

🟠 **Doc-comment périmé (famille #49).** l.12680 dit encore « tick humain ~10 Hz » alors que le code est passé à 30 Hz (l.12683). Trivial mais trompeur.

**Bilan : aucun bug de physique, un vrai test de méthode en vol.** #46/#51/#52/#44/#35 restent ouverts, inchangés. À suivre au prochain passage : le run 30 Hz a-t-il clôturé (un `run-seed*.json` neuf ?) et casse-t-il le plafond 59 m/s ?

---

## VERDICT — passage 2026-09-12 (70e)

✅ **Isomorphisme physique : SAIN, inchangé — stationné 2 jours.** Aucun nouveau commit : `HEAD` toujours
**`37aeae3`**, `train.html` mtime strictement **19:06:59** (identique au 69e), git **clean** sur
`train.html` (aucun `M`). Le moteur reste **UNIQUE** `stepCar` l.9197 : joueur `stepCar(PCAR,pin9,dt,PWORLD)`
l.10989 + `playerStep` l.13218, bot `stepCar(b,b.in,dt,TRAIN.world)` l.12712 — **le même appel, la même
pile**. `carDrive` l.8954 / `carFall` l.9115 / `carTryLand` l.8896 / `carStartFall` l.8868 /
`carBrainInput` l.9263 / `makeCar` l.8830 : mêmes lignes. **Aucune** des fonctions « copie » décrites dans
l'énoncé (`TRAIN.groundPhysics`/`airPhysics`/`tryLandBot`) n'existe : l'isomorphisme est garanti **par
construction**, pas par copie. Le commentaire l.8808 qui les mentionne encore est **périmé** (doc-comment,
même famille que #49). Zéro divergence joueur↔bot à re-vérifier.

🔴 **Atelier À L'ARRÊT depuis la fin du 69e (~19:18 le 10/09).** Rien n'a bougé en 2 jours : dernier run
`run-seed300.json` mtime **19:18:03** (déjà analysé au 69e), aucun `run-seed*.json` plus récent,
`champion.json` inchangé `{gen:40, hid:32, record:3682, note:18, date:17:16:47Z}` (= seed300, déjà au 69e).
`evolution.log` **toujours absent** (aucun fichier `evolution*` sur disque). Le point de reprise reste donc
**−1230 m** sous le meilleur cerveau du batch (seed1808 `record:4832`) — **#53** non corrigé.

**Bilan : aucun nouveau bug, aucun mouvement.** Les 5 défauts ouverts persistent tous dans l'état du 69e :
**#53** (champion.json réécrit inconditionnellement, reprise arbitraire), **#46** (off-by-one `courbe`),
**#51** (`record` = dernière piste), **#52** (`note` = rang), et les réserves de méthode **#35/#40/#44**
(voltige 50-72 % de morts, fitness = distance pure, métrique d'atterrissage contaminée par `airSpawn`).
Prochaine action utile : reprendre l'entraînement en **corrigeant d'abord #53** (écrire par graine, ne
promouvoir `champion.json` qu'en fin de batch en comparant `record`/`maxTotD`), sinon tout run continuera
à écraser le champion par un cerveau arbitraire.

---

## VERDICT — passage 2026-09-10 (69e)

✅ **Isomorphisme physique : SAIN, inchangé.** Nouveau commit **`37aeae3`** (19:11) « Réseau 16→32
cachés + fix check-actions ». Le `git show` ne touche **AUCUNE ligne de physique** : uniquement
`MLP.HID 16→32` (l.12489), suppression du suivi `b.vmax` dans `botStep` (l.12713-12716), revert de la
sélection par vitesse dans `newGen` (l.12990-13023, retour à `sorted`/`GARDE` simple + reset `vmax`
supprimé), et `check-actions.js`. `stepCar`/`carDrive`/`carFall`/`carTryLand`/`carStartFall` **intactes**,
moteur UNIQUE → zéro divergence joueur↔bot. Commit re-vérifié `check-iso 0.000e+0` par l'agent.

🟢 **La réserve `vmax` du 68e est CONFIRMÉE et déjà tranchée.** L'agent a mesuré la régression de la
sélection par vitesse (`216a068`) : **2120 m vs 2660 m**, et l'a revert. Ma réserve (vmax = proxy grossier
de « rapidité », surtout nitro-au-sol + le 104 des spawns aériens) était fondée. Bonne décision.

🟢 **Nouveau commit : MLP 16→32 cachés (324→644 poids).** Topologie vérifiée cohérente : `IN=15` (BRAIN_IN),
`HID=32`, `OUT=4` → `15*32+32+32*4+4 = 644` ✓. `champion.json` reflète bien `in:15/hid:32/out:4/size:644`.
Hypothèse de l'agent : le **plafond de vitesse 59 m/s** viendrait d'un manque de capacité réseau (pilotage
fin en virage).

🟠 **Réserve de méthode sur ce « plafond 59 m/s ».** La fitness est `return b.totD` (l.12968-12969, la
récompense d'arrivée a été retirée 2026-09-09, cf l.12955-12964) — **distance pure le long du ruban**. Or
`totD = SURV.pBase + s` (l.12715/12906) croît quand on **roule vite droit au sol** avec nitro ; le nitro
pousse `car.v += (nitroBlue?48:30)*eng9.push*dt` (l.8983) contre la traînée `car.v *= (1-.4*dt)` (l.8987).
Un plafond de ~59 m/s (212 km/h) est tout aussi plausiblement **physique** (équilibre nitro↔traînée+palier)
que cognitif. Le passage à 32 cachés teste l'hypothèse « réseau » ; s'il ne casse pas le plafond, c'est le
signe que le plafond est physique et que c'est la **fitness par distance pure** (#35) qu'il faut revoir, pas
la capacité. À mesurer sur un run complet, pas concluable en n=1.

🟠 **Runs neufs (tous deux `--gens 50`) : le 32 cachés atterrit mieux mais va moins loin.** `run-seed200`
(16 cachés, 17:03) : record **3714**, maxTotD **4036**, atterrissage **28 %**, morts en vol **69,7 %**.
`run-seed300` (32 cachés, 17:18) : record **3682**, maxTotD **3818**, atterrissage **39 %** (+11 pts),
morts en vol **58,7 %** (−11 pts). Le réseau plus large apprend mieux à **se poser** mais n'étend pas la
distance. Cohérent avec la réserve ci-dessus (la voltige progresse, la distance plafonne). n=1, à confirmer.

🔴 **#53 rejoué, mais cette fois LÉGITIME (et non un bug) — le reset du champion est forcé par la
topologie.** `champion.json` passe de `record:3714` (seed200, **16 cachés**, 17:00) à
`{gen:40, note:18, record:3682, hid:32}` (seed300, 17:16:47). Un cerveau 16 cachés (324 poids) est
**incompatible** avec un réseau 32 cachés (644 poids) : l'ancien champion 3714 est inutilisable, le reset
est donc correct et nécessaire. **MAIS** le défaut structurel #53 demeure : `saveChampion` écrit toujours
`champion.json` **inconditionnellement** (stub `fetch('/train-save')` sim-env.js l.107) sans comparer le
record. Dès qu'un run 32-cachés fera <3682, il écrasera quand même ce champion.

🟠 **#46/#51/#52/#44/#35 toujours ouverts, inchangés.** Re-confirmé sur les 2 runs neufs : `courbe.length
= 49` pour `gens:50` (#46, off-by-one, mécanisme `newGen` l.13020 `GEN++` avant la boucle intact) ;
`record 3682 vs maxTotD 3818` (écart 136 m, #51 = dernière piste) ; `champion.json note:18` (rang) à côté
de `record:3682` (mètres), #52. `evolution.log` **toujours absent**.

**Aucun nouveau bug de PHYSIQUE.** Priorités : **#35** (fitness = distance pure → plafond 59 m/s et voltige
58-70 % de morts, désormais le vrai point de méthode), puis **#53** (écriture inconditionnelle), **#46**
(off-by-one), **#51** (record = dernière piste), **#52** (note = rang), #44.

---

## VERDICT — passage 2026-09-10 (68e)

✅ **Isomorphisme physique : SAIN, inchangé.** Nouveau commit **`216a068`** en tête de `git log` :
« Sélection par vitesse (rang multi-objectif) : préserver les gènes rapides ». Le `git diff 12a4878
216a068` ne touche **AUCUNE ligne de physique** : uniquement `botStep` (l.12716, ajout du suivi
`b.vmax`) et `newGen` (l.12994-13008 sélection, l.13030 reset `b.vmax=0`). `stepCar`/`carDrive`/
`carFall`/`carTryLand`/`carStartFall` **intactes**, moteur UNIQUE → zéro divergence joueur↔bot.

🟢 **Nouveau commit analysé — sélection multi-objectif par vitesse, mécanique correcte.** Pas de bug
d'init : `b.vmax` n'est PAS créé par `makeBot` (l.12880) ni par `resetBot` (l.12893), mais il est
forcé à `0` dans `newGen` l.13030 **avant** chaque `startEval` → jamais `undefined`, vrai max sur les
3 pistes d'une génération. Population préservée (POP=24, `GARDE=12`, 9 élites par distance + 3 par
vitesse + 12 enfants). Le `elite.indexOf(bySpeed[i])` marche par référence (`.slice()` partage les
objets). Aucun bug structurel.

🟠 **Réserve de méthode (NOUVELLE) — `vmax` est un proxy grossier de « rapidité ».** `b.v` est **gelé
en vol** (`carFall` met à jour `fallVel`, pas `b.v`) et vaut **104** dans les spawns aériens (`airSpawn`
l.12925, cf #50). Donc `vmax` capte surtout (a) la vitesse de pointe AU SOL (nitro = rouler vite droit)
et (b) le 104 des spawns. Préserver 3 slots « rapides » — et les utiliser comme parents de 12 enfants —
risque de renforcer le comportement « foncer tout droit » que la neuroévolution combat précisément
(#35/#40 : la voltige reste 50-72 % de morts). Pas un bug, un biais à mesurer sur un run complet.

🔴 **#53 persiste — `champion.json` réécrit à `gen:30`, toujours −1118 m du meilleur cerveau.**
`champion.json` = `{gen:30, note:18, record:3714, date:17:00:13Z}` (mtime 19:00:13). Meilleur que
l'ancien (3602), mais **toujours 1118 m sous le record du batch** (seed1808 `record:4832`, cf 61e). Un
run a tourné ~16:55-17:00 (`run-seed42.json` smoke test `gens:3` ré-exécuté à 16:55, `record:288`,
`tauxAtterrissage:12`) et a écrit ce champion ; **aucun `run-seedX.json` ne correspond** (session
navigateur ou run headless non clôturé). L'écriture inconditionnelle de `champion.json` (stub
`fetch('/train-save')` de `sim-env.js` l.107) reste le pire défaut opérationnel.

🟠 **#46/#51/#52/#44/#35 toujours ouverts, inchangés.** `216a068` ne les touche pas. **#52 re-confirmé**
par le nouveau champion : `note:18` (rang) côte à côte `record:3714` (distance), deux échelles
incompatibles. `evolution.log` **toujours absent**.

**Aucun nouveau bug de PHYSIQUE.** Priorités : **#53** (course sur `champion.json`), **#46**
(off-by-one `courbe`), **#51** (record = dernière piste), **#52** (note champion = rang), puis la
réserve `vmax` ci-dessus, #44 (métrique contaminée) / #35 (voltige ~50-72 % de morts).

---

## VERDICT — passage 2026-09-10 (67e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10:05**, `sim-train.js` **13:11:17**,
`multi-train.js` **01:31:29**, `sim-env.js` **01:28:28** — **tous strictement identiques au 66e**. `git diff`
vide sur les fichiers de code (seuls les `run-seed*.json` de `results/runs/` restent modifiés/non-suivis).
Moteur **UNIQUE** `stepCar` → joueur + bots. Zéro divergence à re-vérifier.

🟠 **Statu quo intégral depuis le 66e (il est ~18:02, ~20 min après).** `results/champion.json` **inchangé**
`{gen:47, note:20, record:3602, date:12:29:27Z}` — bug **#53** toujours intact (point de reprise à −1230 m
du meilleur cerveau, seed1808 `record:4832`). Les 12 runs du batch (mtimes 14:28–14:30) n'ont pas bougé.
`evolution.log` **toujours absent**. Aucun correctif posé.

**Aucun nouveau bug.** Priorités inchangées : **#53** (course sur `champion.json` sous multi-train),
**#46** (off-by-one `courbe`=49 pour `gens:50`), **#51** (record = dernière piste), **#52** (note champion
= rang), puis #44/#35.

---

## VERDICT — passage 2026-09-10 (66e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10:05** (strictement identique au
65e), `sim-train.js` **13:11:17**, `multi-train.js` **01:31:29**, `sim-env.js` **01:28:28** — **aucun fichier
de code n'a bougé**. Moteur **UNIQUE** `stepCar` → joueur + bots. Zéro divergence à re-vérifier, pas de
relecture de formules nécessaire (bit-à-bit identique).

🟠 **Statu quo intégral depuis le 65e (il est ~17:42, ~20 min après).** `champion.json` **inchangé**
`{gen:47, note:20, record:3602, date:12:29:27Z}` — bug **#53** toujours intact (point de reprise à −1230 m
du meilleur cerveau, seed1808 `record:4832`). Les 12 runs du batch (mtimes 14:28–14:30) n'ont pas bougé.
`evolution.log` **toujours absent**. Aucun correctif posé.

**Aucun nouveau bug.** Priorités inchangées : **#53** (course sur `champion.json` sous multi-train),
**#46** (off-by-one `courbe`=49 pour `gens:50`), **#51** (record = dernière piste), **#52** (note champion
= rang), puis #44/#35.

---

## VERDICT — passage 2026-09-10 (65e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10:05**, `sim-train.js` **13:11:17**,
`multi-train.js` **01:31:29**, `sim-env.js` **01:28:28** — **tous strictement identiques au 64e**. `git diff`
vide sur `12a4878` pour les fichiers de code. Moteur **UNIQUE** `stepCar` l.9197 → joueur + bots. Zéro
divergence à re-vérifier.

🟠 **Statu quo intégral depuis le 64e.** `champion.json` **inchangé** : `{gen:47, note:20, record:3602,
date:12:29:27Z}` — bug **#53** toujours intact (point de reprise à −1230 m du meilleur cerveau, seed1808
`record:4832`). Les 12 runs du batch (mtimes 14:28–14:30) et `evolution.log` (toujours **absent**) : identiques.

🟢 **Confirmation par le fichier agrégé du batch** `multi-2026-09-10T12-30-00-474Z.json` (14:30:00, écrit
par `multi-train.js` en clôture) — donne pour la première fois les stats **agrégées** des 12 graines, déjà
lues seed-par-seed au 61e mais jamais consolidées : `maxTotD` **meilleur 5383 / médiane 4742 / moyenne 4663**
; `fit` meilleur **4832** / médiane **3841** ; `tauxAtterrissage` **37 %** (13938/37913) ; **morts en vol
60 %** (`airtime` 22820/37913) ; `idle` 2616 ; `bonnesCoupes` 2689. Confirme sans apport nouveau : la voltige
reste un piège majoritaire (60 % de morts en vol) et la variabilité inter-graines est énorme (3934 ↔ 5383 de
maxTotD), cohérent avec **#35** (pas de récompense directe à l'atterrissage) et le bruit de sélection **#40**.

**Aucun nouveau bug.** Priorités inchangées : **#53** (course sur `champion.json` sous multi-train), **#46**
(off-by-one `courbe`=49 pour `gens:50`), **#51** (record = dernière piste), **#52** (note champion = rang),
puis #44/#35.

---

## VERDICT — passage 2026-09-10 (64e)

✅ **Isomorphisme physique : SAIN, inchangé.** `git diff` **vide** sur `12a4878` pour
`train.html`/`sim-train.js`/`multi-train.js`/`sim-env.js` (mtimes 13:10 / 13:11 / 01:31 / 01:28, tous
strictement identiques au 63e). Moteur **UNIQUE** `stepCar` l.9197 → joueur + bots. Zéro divergence.

🟠 **Statu quo intégral depuis le 63e.** `champion.json` **inchangé** : `{gen:47, note:20, record:3602,
date:12:29:27Z}` — bug **#53** toujours intact (point de reprise à −1230 m du meilleur cerveau produit,
seed1808 `record:4832`). Les 12 runs du batch (mtimes 14:28–14:30) **inchangés**, records identiques au
63e (1000→3629, 1808→4832, 1505→3602, 1202→4229, 1404→3626, 2111→4318, 1303→3602, 2010→3812,
1606→3869, 1707→3941, 1101→4712, 1909→3376). `evolution.log` **toujours absent**.

**Aucun nouveau bug.** Priorités inchangées : **#53** (course sur `champion.json` sous multi-train),
**#46** (off-by-one `courbe`=49 pour `gens:50`), **#51** (record = dernière piste), **#52** (note champion
= rang), puis #44/#35.

---

## VERDICT — passage 2026-09-10 (63e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10:05** (identique au 62e),
`git diff` **vide** sur `12a4878`. Moteur **UNIQUE** `stepCar` l.9197 → joueur (`stepCar(PCAR,…)`
l.10989 + `playerStep` l.13218) et bots (`stepCar(b,b.in,dt,TRAIN.world)` l.12712, `botStep` l.12679).
Aucune copie dérivée (`groundPhysics`/`airPhysics`/`tryLandBot`/`brainInput`/`makeBot`) n'existe : le
moteur est partagé par construction. Zéro divergence à re-vérifier.

🟠 **Statu quo intégral depuis le 62e.** `champion.json` toujours `{gen:47, note:20, record:3602,
date:12:29:27Z}` — bug **#53** intact (point de reprise à −1230 m du meilleur cerveau, seed1808
`record:4832`). Les 12 runs du batch (mtimes 14:28–14:30) et `sim-train.js`/`multi-train.js`/`sim-env.js`
**inchangés**. `evolution.log` **toujours absent**.

**Aucun nouveau bug.** Priorités inchangées : **#53** (course sur `champion.json` sous multi-train),
**#46** (off-by-one, `courbe`=49 pour `gens:50`), **#51** (record = dernière piste), **#52** (note
champion = rang), puis #44/#35.

---

## VERDICT — passage 2026-09-10 (62e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10:05** (strictement identique au
61e), `git diff` **vide** sur `12a4878`. `sim-train.js` (13:11), `multi-train.js` (01:31), `sim-env.js`
(01:28) : **tous inchangés**. Moteur **UNIQUE** `stepCar` → joueur+bots. Zéro divergence à re-vérifier.

🟠 **Statu quo intégral depuis le 61e.** Re-vérifié à l'instant : `champion.json` toujours
`{gen:47, note:20, record:3602, date:12:29:27Z}` — le bug **#53** est intact (le point de reprise reste
à −1230 m du meilleur cerveau produit, seed1808 `record:4832`). Les 12 runs du batch (mtimes 14:28–14:30)
n'ont pas bougé. `evolution.log` **toujours absent**. Aucun correctif posé : **#53** (course sur
`champion.json` sous multi-train), **#46** (off-by-one, `courbe`=49 pts pour `gens:50`), **#51** (record =
dernière piste), **#52** (note champion = rang), puis #44/#35 — tous ouverts, dans le même état qu'au 61e.

**Aucun nouveau bug de PHYSIQUE.** Ce passage ne fait que re-confirmer l'état du 61e : l'atelier est à
l'arrêt depuis la fin du batch (14:30), aucun code n'a bougé, et le pire défaut opérationnel reste **#53** —
le champion de reprise est arbitrairement pire que 5 des 12 cerveaux déjà produits.

---

## VERDICT — passage 2026-09-10 (61e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10:05** (strictement identique au
60e), `git diff` **vide** sur `12a4878`. Moteur **UNIQUE** `stepCar` l.9197 → `carDrive`/`carFall`/
`carTryLand`/`carStartFall`, partagé joueur+bots. `sim-train.js` (13:11), `multi-train.js` (01:31),
`sim-env.js` (01:28) : **tous inchangés** → aucun correctif de code posé depuis le 60e. Zéro divergence
joueur↔bot à re-vérifier.

🟢 **Le batch multi-train de 12 graines est COMPLET** (`1000+k*101`, mtimes 14:28–14:30). Records réels
mesurés sur les 12 runs :

| seed | record | maxTotD | atterr. | morts vol |
|---|---|---|---|---|
| 1909 | 3376 | 3934 | 26 % | 72 % |
| 1000 | 3629 | 4771 | 40 % | 57 % |
| 1303 | 3602 | 4815 | — | — |
| 1505 | 3602 | 5046 | — | — |
| 1101 | 4712 | 4712 | 38 % | 59 % |
| 1202 | 4229 | 4247 | 41 % | 56 % |
| 2111 | 4318 | 5129 | 38 % | 59 % |
| **1808** | **4832** | **5383** | — | — |
| 2010 | 3812 | 5319 | — | — |
| 1707 | 3941 | 3940 | — | — |

Meilleur record **4832** (seed1808), meilleur maxTotD **5383** (seed1808). Variabilité inter-graines
toujours ÉNORME (3376 ↔ 4832) — bruit de sélection #40 re-mesuré sur graines fixes.

🔴 **#53 CONFIRMÉ et AGGRAVÉ sur 12 runs — le `champion.json` figé vaut 3602, pas 4832.** Le champion
disque actuel = `{gen:47, note:20, record:3602, date:14:29:27}`. C'est la **dernière écriture** du batch
(les mtimes s'étalent 14:28:23 → 14:29:27), pas le meilleur run. Le vrai max est **4832** (seed1808,
record) / **5383** (maxTotD). Écart **1230 m** sur le record, **1781 m** sur maxTotD. Le point de reprise
(`useClone`) repart donc d'un cerveau **arbitrairement pire** que 5 des 12 runs. `champion.json` n'est
toujours pas protégé : le stub `fetch('/train-save')` de `sim-env.js` l.107 écrit **inconditionnellement**.
**Correction inchangée** : écrire par graine pendant le run, ne promouvoir `champion.json` qu'en fin de
batch en comparant `record`/`maxTotD` à celui déjà présent.

🟠 **#46 re-confirmé à 100 % (12/12 runs).** Les 12 runs affichent `gens:50` mais `courbe` = **49 points**
(vérifié par `len(courbe)`). Off-by-one inchangé (`newGen` l.13021 `GEN++` avant de jouer, boucle
`GEN<TARGET_GEN`).

🟠 **#51 re-confirmé, jusqu'à 1507 m d'écart.** seed2010 : `record:3812` vs `maxTotD:5319` ; seed1808 :
4832 vs 5383 (écart 551). `record` = dernière piste seulement, `maxTotD` = vrai max cumulé.

🟠 **#52 toujours ouvert.** `champion.json` = `note:20` (rang ≤23) à côté de `record:3602` (mètres).
Le cerveau sauvé est le meilleur **par rang**, pas par distance. Les 131 champions disque s'écrasent
toujours sans graine dans le nom (#37) : `gen00040-note20` écrit 4 fois (14:26–14:27) par des graines
différentes.

🟠 **#44 / #35 re-mesurés.** `takeoffsAutre` ≈ 1200/3000 = **40 %** de spawns offerts (métrique
d'atterrissage contaminée). Morts en vol **56–72 %** selon la graine — la voltige reste un piège
majoritaire, aucune récompense directe à l'atterrissage.

**Aucun nouveau bug de PHYSIQUE.** Le 61e ne fait que **quantifier #53 sur un batch complet** : le
point de reprise est désormais démontrablement à −1230 m du meilleur cerveau produit. Priorités :
**#53** (champion.json sous multi-train), **#46** (off-by-one), **#51** (record = dernière piste),
**#52** (note = rang), puis #44/#35.

---

## VERDICT — passage 2026-09-10 (60e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **13:10** (inchangé depuis le 59e),
git **clean** sur `12a4878` (aucun `M train.html`). Moteur **UNIQUE** `stepCar` l.9197 → `carDrive`
l.8954 / `carFall` l.9115 / `carTryLand` l.8896 / `carStartFall` l.8868 / `carBrainInput` l.9263 /
`makeCar` l.8830 — mêmes lignes, joueur et bots partagent le même moteur. Zéro divergence à re-vérifier.

🟢 **L'atelier TOURNE en multi-train (multi-train.js).** Deux runs `--gens 50 --random` viennent de
finir (14:28-14:29) : `run-seed1909` (record 3376, 26 % atterrissage) et `run-seed1101` (record 4712,
38 %). Un 3e, `run-seed100` (13:34), avait fait 3860/45 %. La variabilité inter-graines est ÉNORME
(3376 ↔ 4712 de record, 26 ↔ 45 % d'atterrissage) — c'est le bruit de sélection #40 re-mesuré sur
graines **fixes** (1000, 1101, …, 1909 via `1000+k*101`), donc cette fois un vrai écart de méthode,
pas du hasard de console.

🔴 **#53 (NOUVEAU, ÉLEVÉ) — `multi-train` fait COURIR des runs concurrents qui s'écrasent
`champion.json` les uns les autres ; le point de reprise n'est plus le meilleur cerveau.**
`multi-train.js` l.43-55 lance N enfants en parallèle (`Promise.all(seeds.map(run))`), et CHAQUE
enfant passe par `saveChampion` → le stub `fetch('/train-save')` de `sim-env.js` l.107 fait un
`fs.writeFileSync(results/champion.json)` **inconditionnel**. Le dernier à écrire gagne, quel que soit
son record. Preuve en direct : `champion.json` actuel = `{gen:47, note:21, record:3376}` (dernière
écriture, celle du run seed1909 à 14:28:23) alors que seed1101 venait de finir à **4712** et seed100 à
**3860** — deux cerveaux meilleurs que celui figé comme point de reprise. Conséquence : rouvrir
`train.html` (gen 0 via `useClone`) repart d'un cerveau **arbitrairement** pire. La copie horodatée
`results/champions/` (l.110) est écrite aussi, mais `champion.json` — LE fichier lu au chargement —
n'est pas protégé (le commentaire rec-server.js l.56 « on ne veut plus jamais écraser un bon cerveau
par un moins bon » n'est implémenté QUE pour l'historique, pas pour champion.json).
**Correction** : (a) écrire le champion par graine (`results/champions/seed<X>/champion.json`) pendant
le run ; (b) ne promouvoir `champion.json` qu'en FIN de batch, en comparant `record` (distance) à
celui déjà présent ; (c) ou faire écrire `multi-train.js` lui-même le champion agrégé (il a déjà le
`resume` de chaque graine l.58-61).

🔴 **#46 toujours ouvert, re-confirmé sur 2 nouveaux runs.** `run-seed1909` et `run-seed1101`
affichent tous deux `gens:50` mais `courbe` = **49 points**. Mécanisme inchangé (`newGen` l.13021 fait
`GEN++` avant de jouer ; la boucle sim-train.js l.96 s'arrête à `GEN>=TARGET_GEN`) : la **50e
génération est lancée mais jamais évaluée/sélectionnée**, et son `genMaxTotD` n'entre pas dans la
courbe. **Correction** : boucler `GEN<=TARGET_GEN` ou incrémenter en fin de `newGen`.

🔴 **#51 toujours ouvert, re-confirmé.** `run-seed1909` : `record:3376` vs `maxTotD:3934` (écart 558 m)
— `endGen` l.13066 lit `bestDist = max b.totD` alors que `resetBot` remet `totD` à zéro au début de
**chaque** des 3 pistes : `record` ne voit que la **dernière** piste. `maxTotD` (cumulé sur toutes
pistes/ticks, sim-train.js l.105) est le vrai max du run. seed1101 affiche 4712=4712 par pur hasard
(le max est tombé sur la dernière piste). **Correction** : `bestDist = max b.bestTotD` (accumulé sur
les 3 pistes) ou faire remonter `genMaxTotD`.

🔴 **#52 toujours ouvert.** `champion.json` = `note:21` (rang ≤23) à côté de `record:3376` (mètres).
`saveChampion` l.13142 sélectionne `best` par `fitness` (**rang**) et l.13145 écrit
`note:Math.round(best.fitness)` ; le cerveau sauvé est le meilleur par rang, pas celui du record.
Preuve d'historique mélangé : `results/champions/` contient côte à côte `gen00020-note1938` (distance)
et `gen00020-note20` (rang), `gen00010-note3648` et `gen00010-note23` — le champ `note` du NOM DE
FICHIER a deux échelles impossibles à distinguer. **Correction** : `note = best.totD` (ou
`best.bestTotD`), sélection sur la même métrique que le record, et nommer le fichier avec l'échelle
(`-noteD` vs `-rank`).

🟠 **#44 toujours ouvert.** seed1909 : `takeoffsAutre:1243 / 2808 = 44 %` des décollages sont des
spawns aériens offerts (`airSpawn` l.12927). Le « 26-45 % d'atterrissage » mélange « se poser après un
saut » et « se poser après un spawn offert » — le progrès de la **voltige** reste illisible.

🟠 **#35 toujours ouvert, re-mesuré.** Morts en vol : seed1909 **72 %** (2021/2808), seed1101 **59 %**
(1606/2729), seed100 50 %. La voltige reste un piège majoritaire — cohérent avec la réserve du 47e
(aucune récompense directe à l'atterrissage).

**Aucun nouveau bug de PHYSIQUE.** Priorités : **#53** (course sur champion.json sous multi-train →
le point de reprise se dégrade), **#46** (off-by-one), **#51** (record = dernière piste), **#52** (note
champion = rang), puis #44 (métrique contaminée), #35 (voltige 50-72 % de morts).

---

## VERDICT — passage 2026-09-10 (59e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` (mtime 13:10) et `sim-train.js` (13:11)
sont **git clean** sur `12a4878` (diff vide, mtime = checkout/touch). Moteur **UNIQUE** `stepCar`
l.9197, `carDrive` l.8954 / `carFall` l.9115 / `carTryLand` l.8896 / `carStartFall` l.8868 /
`carBrainInput` l.9263 / `makeCar` l.8830 — mêmes lignes qu'aux 57e/58e. Zéro divergence joueur↔bot.

🟢 **PREMIER VRAI RUN 60 GÉNÉRATIONS depuis le fix distance** — `run-seed100.json` (13:34:27).
Données réelles, premières à montrer `record` en **mètres** de bout en bout :
- `record:3860` (meilleure distance jamais atteinte), `maxTotD:4703` ;
- **taux d'atterrissage 45 %** (↑ vs 36 % du run-seed7 12:09 et 30 % baseline) ;
- **morts en vol 50 %** (`airtime` 1722 / `takeoffs` 3448) vs **61–66 %** avant → on crève moins en l'air ;
- `goodCuts:241`. Le curriculum v2 + la mesure-distance **paient** : on se pose plus, on meurt moins.

🔴 **#46 PAS corrigé — le 58e l'avait annoncé à tort.** Le run affiche `gens:60` mais **`courbe`
= 59 points** (vérifié : `courbe.length=59`). Mécanisme inchangé : `newGen` fait `TRAIN.GEN++`
(l.13021) **avant** de jouer la manche, et la boucle `for(...T.GEN<TARGET_GEN)` (sim-train.js l.96)
s'arrête dès que `GEN` atteint 60. La **60e génération est lancée mais jamais évaluée/sélectionnée**,
et son `genMaxTotD` n'est jamais poussé (hook `newGen` sim-train.js l.72-82). Le commit `12a4878` a
réparé **#47** (record = distance) mais **pas #46** : l'off-by-one est toujours là. **Correction** :
boucler `T.GEN<=TARGET_GEN` (ou incrémenter `GEN` en fin de `newGen`).

🔴 **#51 toujours ouvert, re-mesuré sur données réelles.** `record:3860` vs `maxTotD:4703` (écart
843 m). `endGen` l.13066 lit `bestDist = max b.totD` — or `resetBot` (l.12906) remet `b.totD` à zéro
au début de **chaque** piste, donc `record` ne voit que la **dernière** des 3 pistes, alors que
`genMaxTotD` (sim-train.js l.105) cumule sur **toutes** les pistes/ticks. Le champion sauvé (gen50,
`record:3860`) **sous-estime** le vrai max du run (4703, atteint par un bot sur une autre piste).
**Correction** : `bestDist = max b.bestTotD` (accumulé sur les 3 pistes), ou faire remonter `genMaxTotD`.

🔴 **#52 toujours ouvert.** `champion.json` = `{gen:50, note:20, record:3860}`. `saveChampion` l.13145
écrit `note:Math.round(best.fitness)` = **rang** (≤23) à côté de `record` en **mètres** — deux échelles
incompatibles. Le cerveau sauvé est le meilleur **par rang**, pas celui qui a fait 3860. **Correction** :
`note = best.totD` (ou `best.bestTotD`) et sélection sur la même métrique que le record.

🟠 **#44 toujours ouvert, aggravé par le volume.** `takeoffsAutre:1432 / 3448 = 42 %` des
« décollages » sont des **spawns aériens offerts** (`airSpawn` l.12927-12928 fait `takeoffs++` +
`takeoffsAutre++`). Le 45 % d'atterrissage mélange donc « se poser après un saut » et « se poser après
un spawn offert ». Sans métrique séparée, le progrès réel de la **voltige** reste illisible.

**Aucun nouveau bug de PHYSIQUE.** Priorités : **#46** (le 58e l'a clos à tort — re-ouvrir), **#51**
(record sous-estimé), **#52** (note champion = rang), puis #44 (métrique d'atterrissage contaminée),
#35 (voltige encore ~50 % de morts).

---

## VERDICT — passage 2026-09-10 (58e)

✅ **Isomorphisme physique : SAIN.** Nouveau commit `12a4878` « Réparer la mesure (#47/#46) ». Le
diff ne touche **AUCUNE ligne de physique** : uniquement `airStats` (l.12556), la classification de
cause de décollage dans `botStep` (l.12727-12733), `airSpawn` (l.12928), `endGen` (l.13065-13072), et
`sim-train.js`. Moteur **UNIQUE** `stepCar` intact → zéro divergence joueur↔bot (commit vérifié
`check-iso 0.000e+0`). Rien à re-vérifier dans les formules.

🟢 **#47 partiellement corrigé, #46 corrigé.** `TRAIN.record` suit désormais la **DISTANCE** (`bestDist`
= max `totD`), `courbe` pousse `genMaxTotD` (distance par génération), et `saveChampion` se déclenche
sur record de distance battu (plus seulement `AUTOSAVE`). Un run `run-seed42.json` (13:12, `gens:3`,
smoke test) l'exerce : `record:886, maxTotD:1074, courbe:[1074,886]`. `run-seed7.json` (12:09) est
**périmé** (antérieur au fix : il affiche encore `record:23` = rang).

🔴 **#51 (NOUVEAU, MODÉRÉ) — `record` et `courbe` ne mesurent PAS la même chose.** `endGen` l.13066
calcule `bestDist = max b.totD` au moment où toutes les pistes sont jouées — mais `resetBot` (appelé par
`startEval` l.13036 → l.12906) remet `b.s`/`b.totD` à zéro au début de **CHAQUE** piste. Donc `bestDist`
ne voit que la **DERNIÈRE** piste de la génération, alors que `genMaxTotD` (sim-train.js l.105) accumule
sur **TOUTES** les pistes/tous les ticks. Preuve dans le smoke : `record:886` (dernière piste) vs
`courbe:[1074,…]` (max sur 3 pistes). **Conséquence** : le record (et le déclencheur `saveChampion`)
sous-estime systématiquement le vrai max de la génération ; la courbe d'apprentissage et le record ne
sont plus sur le même axe. **Correction** : soit faire remonter `record` sur `genMaxTotD` (passer le max
par tick dans `TRAIN`, lu par `endGen`), soit — plus simple — accumuler `b.bestTotD = max(b.totD)` sur
les 3 pistes d'un bot et prendre `bestDist = max b.bestTotD`.

🔴 **#52 (NOUVEAU, MODÉRÉ) — le champ `note` du champion reste un RANG, désormais incohérent avec
`record`.** `saveChampion` l.13142 sélectionne le meilleur par `fitness` (**rang**) et écrit
`note:Math.round(best.fitness)` (rang ≤23) + `record:TRAIN.record` (**distance**). Résultat :
`champion.json` actuel = `note:21` (rang) à côté de `record:886` (distance) — deux échelles incompatibles
dans un même fichier. Et pire : le cerveau sauvé est le meilleur **par rang**, pas celui qui a réalisé la
distance record. Le fix n'a migré QUE `record`/`courbe` vers la distance, laissant `note` en rang.
**Correction** : écrire `note = best.totD` (ou `best.bestTotD`) et sélectionner le champion sur la même
métrique que le record (distance), ou au minimum tracer les DEUX (`noteRank` + `noteDist`).

🟠 **`note` a deux sens selon l'époque — risque de confusion.** Les champions disque sont un mélange :
`gen00040-note2057` (distance, pré-e62f924) vs `gen00040-note21` (rang, post). Sans champ `scale` ni nom
distinct, impossible de savoir si `note:21` = 21e rang ou 21 m. Mineur mais trompeur.

🟠 **Data point du smoke test (3 gen) : 60 % des décollages par le bord** (71/119), 12 % d'atterrissage.
Cohérent avec #35 (la voltige = saut par le bord, qui se paie `outs`, et atterrit mal). Échantillon trop
court pour conclure.

**Aucun nouveau bug de PHYSIQUE.** Priorités : **#51** (record/courbe désalignés), **#52** (note champion
= rang), puis #35 (voltige 61-66 % de morts), #44 (métrique contaminée), #49 (doc-comment périmé).

---

## VERDICT — passage 2026-09-10 (57e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **12:33** (touché ~9 min après le 56e,
mais `git diff` **vide** : contenu strictement identique à `HEAD` = `88ab1c2`). Moteur **UNIQUE** `stepCar`
l.9197 ; `carDrive` l.8954 / `carFall` l.9115 / `carTryLand` l.8896 / `carStartFall` l.8868 / `carBrainInput`
l.9263 / `makeCar` l.8830 / `startFall` l.9518 — toutes **aux mêmes lignes** qu'aux 55e/56e. Le bump de mtime
est un `git checkout`/touch **sans modification** : zéro divergence joueur↔bot. Rien à re-vérifier.

🟠 **Statu quo intégral depuis le 56e (il est 12:42, ~18 min après).** Re-vérifié : `run-seed7.json` (12:09)
et `champion.json` (12:08) **inchangés** — toujours `record:23` (rang), `maxTotD:4384`, 36 % d'atterrissage,
`note:21` champion gen40. `evolution.log` toujours **absent**. Git : toujours `88ab1c2`, mêmes non-commités.

**Aucun nouveau bug.** Priorités inchangées : **#47** (record = rang → la courbe ne montre rien, bloquant pour
juger le curriculum v2), **#46** (off-by-one + champion périmé), puis #48/#49/#50, #35 (voltige à 61 % de morts),
#44 (métrique contaminée). Ce passage ne fait que confirmer l'état du 56e.

---

## VERDICT — passage 2026-09-10 (56e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **11:57:56**, strictement identique
au 55e, toujours sur le commit `88ab1c2` (Curriculum v2). Moteur **UNIQUE** `stepCar` l.9197, fonctions
`carDrive` l.8954 / `carFall` l.9115 / `carTryLand` l.8896 / `carStartFall` l.8868 / `carBrainInput`
l.9263 — toutes aux mêmes lignes qu'au 55e. **Zéro divergence joueur↔bot.** Rien à re-vérifier.

🟢 **PREMIER VRAI RUN du curriculum v2** — `run-seed7.json` a tourné à **12:09:26** (50 générations),
premier run à exercer le spawn « 104 m/s + descente » posé par `88ab1c2`. Résultats réels :
- **taux d'atterrissage 30 % → 36 %** (+6 pts vs la baseline du run-seed7 23:04, avant curriculum v2) ;
- **morts en vol 61 %** (`airtime` 1870 / `takeoffs` 3086) vs **66 %** baseline — on meurt moins en l'air ;
- `goodCuts:185`, `maxTotD:4384` (vs 4634 baseline, écart = bruit de seed, non significatif).
→ Le curriculum v2 **aide réellement** : on se pose plus et on crève moins en vol. À nuancer (#44) : le
taux mélange encore « saut réel » et « spawn offert », donc ce +6 pts est un plafond de lecture.

🔴 **#47 (toujours BLOQUANT, et désormais mesurable en creux) — le reporting par rang nous a volé la
distance.** `record:23` est un **rang** (borné [0,23]), pas des mètres. La courbe `[20,23,20,…]` (49
rangs bornés [17,23]) **ne montre rien**. Conséquence concrète de CE run : on ne peut **plus répondre**
à la question qui motive tout le projet — « le curriculum v2 fait-il aller **plus loin** ? » — parce que
le run précédent affichait `record:3125` (mètres) et celui-ci `record:23` (rang). Le seul signal absolu
survivant est `maxTotD:4384`, mais il n'est **lié à aucun cerveau** (cf. #47) : on ne peut ni sélectionner
le champion dessus, ni comparer deux runs sur la distance. **La correction #47 n'est toujours pas posée.**

🟠 **#49 toujours présent** : le doc-comment l.12906-12911 décrit encore l'ANCIEN spawn (« 20-38 m »,
« chute droite », « 79 % ») alors que le corps l.12913-12919 fait 14-22 m / 104-112 m / descente.

🟠 **#46 confirmé une fois de plus** : `gens:50` mais `courbe` = **49 points** — la 50e génération est
« lancée » mais jamais évaluée/sélectionnée. Inchangé.

**Aucun nouveau bug de PHYSIQUE.** Priorités inchangées : **#47** (reporting muet = rang, désormais
bloquant pour juger le curriculum), **#46** (off-by-one + champion périmé), puis #48/#49/#50, #35
(voltige à 61 % de morts), #44 (métrique contaminée).

---

## VERDICT — passage 2026-09-10 (55e)

✅ **Isomorphisme physique : SAIN.** `train.html` mtime **11:57:56** (+51 min), mais le diff ne
touche **que** `airSpawn` (l.12912-12926) : 7 insertions, 4 suppressions, **zéro ligne de physique**.
`carStartFall`/`carFall`/`carTryLand`/`carDrive`/`stepCar` intactes. Moteur **UNIQUE** `stepCar`
l.9197 → isomorphisme garanti. Rien à re-vérifier dans les formules.

🟢 **airSpawn réécrit pour devenir un vrai curriculum d'atterrissage.** L'ancien spawn « chute
droite » (30 m/s, Vy=0, 20-38 m) posait à 99 % sans rien apprendre. Le nouveau spawn reproduit la
dynamique d'un vrai saut posé : **104-112 m/s vers l'avant** le long de la tangente, en **descente
-18..-26 m/s**, depuis **14-22 m** de haut. Le bot doit désormais **piloter** pour atterrir — c'est
la bonne direction.

🔴 **#49 (NOUVEAU, MINEUR) — doc-comment périmé.** l.12906-12911 décrit encore l'ANCIEN spawn
(« 20-38 m au-dessus », « chute droite », 30 m/s, Vy=0) alors que le corps de la fonction
l.12913-12919 fait autre chose (14-22 m, 104-112 m/s, descente). Même famille que #48/#43 :
commentaire dérivé. **Correction** : mettre à jour le commentaire.

🟠 **#50 (NOUVEAU, MINEUR) — `b.v=104` fixe vs `fallVel` forward 104+rnd*8 (104..112).**
l.12918 multiplie par `104+TRAIN.rnd()*8`, l.12920 fixe `b.v=104`. Conséquence : le scalaire
`b.v` (qui nourrit `arr[0]` en vol, l.9290) est figé à 104 alors que le vecteur de vol varie
jusqu'à 112. **En pratique sans gravité** : `carTryLand` l.8940 recompute `car.v` depuis `fallVel`
à l'atterrissage, effaçant la divergence ; en vol `arr[0]` utilise 104 vs ~106 réel → écart <2 %.
**Correction triviale** : `b.v=104+TRAIN.rnd()*8` aligné sur l.12918, ou passer `b.v` AVANT
`carStartFall` pour qu'il pilote airRate (même si avec SPD=0.5, airRate reste 1.0 à ces vitesses).

🟠 **Watch-item : descente rapide (~1 s jusqu'au sol).** À -20 m/s depuis 18 m de haut, le bot
touche le bitume en ~0,9 s (85 m parcourus). Apprendre à atterrir en une seconde, c'est TRÈS serré.
Risque que ce spawn produise « mort quasi-instantanée » sans gradient de pilotage — ou au contraire
que la descente rende l'impact inévitable sans correction. **Seul un run réel pourra trancher.**
Aucun run n'a encore exercé ce code (run-seed42 toujours 11:15, inchangé).

🟠 **Justification « n=22 à 104-108 m/s » à nuancer.** Les 22 sauts atterris de
`jump-vectors.json` montrent des vitesses horizontales allant de ~35 à ~106 m/s. La plage 104-108
est le **haut** du spectre, pas la médiane. Le spawn est calibré sur les sauts les PLUS rapides, ce
qui peut biaiser l'apprentissage vers un seul régime. Pas un bug, mais un choix à documenter.

**Aucun nouveau bug de PHYSIQUE.** Priorités inchangées : **#47** (reporting muet = rang) devant
**#46** (off-by-one `--gens` + champion périmé), puis #48 (commentaire `AIR_CYCLE`), #49/#50
(commentaire/b.v ci-dessus), #35 (voltige à 63 % de morts), #44 (métrique contaminée).

---

## VERDICT — passage 2026-09-10 (54e)

✅ **Isomorphisme physique : SAIN, et désormais PROUVÉ bit-à-bit.** `train.html` **inchangé**
(mtime **11:06:25**, toujours sur `e62f924`). J'ai **ré-exécuté `check-iso.js`** : il rejoue 3000 pas
d'une même séquence d'entrées via le chemin JOUEUR (`pcarPush→stepCar→pcarPull`) puis via le chemin
BOT (`stepCar` direct), monde remis à neuf entre les deux, et exige un écart < 1e-9. Résultat :
**écart max `0.000e+0` sur les 15 champs** (s, lat, v, vL, psi, fx/fy/fz, vx/vy/vz, fallT, fallTR,
nitroR, yawAcc), événements identiques. C'est LA preuve chiffrée que le moteur est unique et qu'il
n'y a plus aucune copie dérivée. Rien à re-vérifier dans les formules.

🟢 **Deux tests mécaniques neufs, tous deux PASS — l'agent principal fiabilise la MÉTHODE :**

1. **`check-eval.js` (11:07:39) → PASS.** Il réimplémente *indépendamment* le scoring par rang
   (`POP−rang`, ex-æquo = moyenne des rangs) et exige que `train.html` aboutisse au même résultat.
   Vérifie aussi : pistes **distinctes** intra-génération ET inter-générations, `evalCount==EVAL_TRACKS`,
   `fitness == fitnessSum/evalCount` exactement. **Conclusion : la sélection par rang (le correctif
   anti-récitation posé par `e62f924`) est mécaniquement correcte** — pas d'erreur de classement.

2. **`check-iso.js` (01:36, ré-exécuté) → PASS, écart `0.000e+0`** (cf. ci-dessus).

🟠 **Mais ces tests valident la SÉLECTION, pas le REPORTING : #47 reste entier.** `check-eval`
confirme *a contrario* que `b.fitness` est bien un rang borné `[0,POP-1]` — donc `TRAIN.record`
plafonne à 23, `saveChampion` écrit `note≤23`, et la courbe ne montre plus rien. Aucun nouveau run
(`run-seed42` toujours `gens:3`, 11:15) ; rien n'a migré. La correction #47 (tracer la note brute
`totD` en parallèle du rang) n'est **pas** posée.

🟠 **Nouveau `jump-vectors.json` (11:24:50) — diagnostic de voltige, écrit par `train.html` lui-même**
(`s_decollage`/`landH`/`landL` sont greffés dans le moteur, pas dans un script externe). J'ai analysé
les **59 sauts réels** : **22 landed / 37 morts en `airtime` (63 %)**. Gain `s_pose−s_decollage`
médian **+406 m** (min −228, max +1972). Deux lectures :
- Confirme **#35** sur un échantillon de vrais décollages (pas de spawn offert) : ~2 sauts sur 3
  meurent encore en l'air, mais quand l'atterrissage réussit il rapporte en médiane +400 m — la
  voltige *peut* payer, elle n'est juste pas fiable.
- Signal pédagogique brut : seuls **10/59** sauts trouvent un point d'atterrissage dans le scan
  `tryLand` (`landI≥0`). Le bot ne « voit » presque jamais de piste posable → il ne peut pas
  apprendre à *viser*. Ce n'est **pas** un bug d'isomorphisme (le joueur a le même scan), c'est le
  goulot de #35 : le curriculum `AIR_SPAWN` répond à l'atterrissage *subi*, pas au *ciblage* actif.

**Aucun nouveau bug de PHYSIQUE.** Priorités inchangées : **#47** (reporting muet = rang), **#46**
(off-by-one `--gens` + champion périmé), **#48** (commentaire `AIR_CYCLE` trompeur), puis #35 (voltige
à 63 % de morts, ciblage absent), #44/#43/#42 (métriques contaminées).

---

## VERDICT — passage 2026-09-10 (53e)

✅ **Isomorphisme physique : SAIN, toujours.** `train.html` a BOUGÉ (mtime **11:06:25**) et le travail
est **commit** (`e62f924 "Fix fitness (Fable) : spawn aérien stratifié par manche + sélection par
rang"`). Mais le diff ne touche **AUCUNE ligne de physique** : uniquement `AIR_SPAWN`/`AIR_CYCLE`
(l.12539/12546), `resetBot` (l.12903), `startEval` (l.13027), `endGen` (l.13033-13056). `stepCar`/
`carDrive`/`carFall`/`carTryLand`/`carStartFall` intactes. Zéro divergence joueur↔bot.

🔴 **Deux bugs NEUFS et un MÉTHODE à surveiller — la sélection par rang a cassé TOUTE la couche de
métriques.** Un nouveau run `run-seed42.json` (mtime **11:15:27**, `gens:3`) l'expose noir sur blanc.

🔴 **#47 (NOUVEAU, ÉLEVÉ) — `record`, `note` champion et `courbe` sont désormais des scores de RANG,
bornés [0, POP-1]=[0,23], plus des distances.** Depuis `e62f924`, la sélection accumule `fitnessSum +=
rangMoyen` (train.html l.13044-13045) au lieu de la note brute `totD+arrivée`. Conséquence en cascade :
`b.fitness` (l.13056) est une moyenne de rangs ≤23, `TRAIN.record` (l.13059) plafonne à 23,
`saveChampion` écrit `note:best.fitness` et `record:TRAIN.record` (l.13131) → **le champion.json porte
une `note` ≤23 à jamais**, et `sim-train.js` écrit `record` (rang) + `courbe` (l.73-74, qui pousse
`s[0].fitness` = rang). **Preuve** : `run-seed42.json` = `record:22, maxTotD:1662` alors que
`run-seed7.json` (avant le changement) = `record:3125`. La **courbe d'apprentissage** est passée de
`[221,235,…,3125]` (49 distances) à `[22,21]` (2 rangs) — **elle ne montre plus rien**. Le seul signal
absolu survivant est `maxTotD` (l.116, max de `totD`), mais il n'est **lié à aucun cerveau** (on ne sait
plus QUI a fait 1662 m, donc on ne peut plus sélectionner le champion sur le record de distance).
**Correction** : garder la sélection par rang (elle est saine, cf. #40) MAIS tracer en parallèle la note
brute : dans `saveChampion` et le JSON de run, écrire le `totD` (ou `fitness(b)` brute) du meilleur en
PLUS du rang ; et faire remonter `courbe` sur la **distance brute** (hooker `endGen` sur le max des
`TRAIN.fitness(b)` brutes, pas sur `b.fitness` rang).

🟠 **#48 (NOUVEAU, MINEUR mais réel) — `AIR_CYCLE` est un no-op tant que `EVAL_TRACKS < AIR_CYCLE`, et
le commentaire ment sur le taux.** `airManche = (evalIdx % AIR_CYCLE===0)` (l.13027) avec `evalIdx`
remis à 0 à chaque génération (l.13014). Avec `EVAL_TRACKS=3` et `AIR_CYCLE=4` (les défauts), `evalIdx`
ne dépasse jamais 2 → `evalIdx%4===0` n'est vrai que pour `evalIdx=0`. Résultat : **1 manche sur 3**
(33 %) est aérienne, pas « ~25 % » comme l'affirme le commentaire l.12543-12544 ; et **tout `AIR_CYCLE`
≥ 4 se comporte à l'identique** (le cycle est tronqué par `EVAL_TRACKS`). Ce n'est pas faux pour
l'apprentissage (chaque génome voit le même mélange, déterministe — c'est le but), mais c'est trompeur à
régler. **Correction** : soit documenter que le cycle effectif est `min(AIR_CYCLE, EVAL_TRACKS)` (donc
`AIR_CYCLE=2` = 2/3 aérien, `=1` = 100 %), soit compter `evalIdx` en continu (non remis à 0) pour que
`AIR_CYCLE=4` donne réellement 25 %.

🟠 **#44 (toujours ouvert, désormais DÉTERMINISTE) — le taux d'atterrissage reste contaminé.**
`airSpawn` fait toujours `airStats.takeoffs++` (l.12920) : un spawn aérien offert compte comme décollage.
Le passage au stratifié rend la contamination **systématique** (toute une manche aérienne à la fois) au
lieu d'aléatoire, mais la métrique `landings/takeoffs` (24 % dans run-seed42) mélange toujours « se poser
après un saut » et « se poser après un spawn offert ». Toujours pas de métrique distincte.

🟠 **#46 (toujours ouvert) — le off-by-one persiste.** `run-seed42` : `gens:3` mais `courbe:[22,21]`
(2 points) — la 3e génération est « lancée » mais jamais évaluée/sélectionnée. Inchangé.

**Résumé** : la sélection par rang est une bonne réponse au bruit #40, mais elle a été posée **sans
migrer la couche de reporting**, qui est désormais muette. La physique n'a pas bougé.

---

## VERDICT — passage 2026-09-10 (52e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **22:51:26** (strictement identique
au 51e). Moteur **UNIQUE** `stepCar` l.9197, partagé joueur+bots → zéro divergence possible par
construction. Rien à re-vérifier dans les formules tant que ce mtime ne bouge pas.

🟠 **Statu quo intégral depuis le 51e (il est 10:41, soit ~20 min après).** Re-vérifié à l'instant :
- `runs/` (dernier `run-seed7.json` 23:04), `champions/` (dernier `gen00040-note2057.json` 23:02),
  `champion.json` (23:02) : **tous inchangés depuis hier soir**.
- `evolution.log` : **toujours absent**.
- Git : toujours sur `79b1eed`, mêmes non-commités (champions 324, runs, ce rapport).

**Aucun nouveau bug.** L'atelier est à l'arrêt depuis le run de 23:04 (~11 h 30). Les priorités ne
bougent pas : **#46** (champion périmé de 9 gen — la reprise ment), **#45** (config non tracée), puis
#40/#36 (pistes figées), #35 (récompense d'atterrissage), #44/#43/#42 derrière (voir bloc Priorités).

---

## VERDICT — passage 2026-09-10 (51e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **22:51:26** (identique au 50e).
Moteur **UNIQUE** `stepCar` l.9197, re-vérifié à l'instant : joueur `stepCar(PCAR,pin9,dt,PWORLD)`
l.10989 + `playerStep` l.13180, bots `stepCar(b,b.in,dt,TRAIN.world)` l.12704. `makeCar` l.8830 /
`carStartFall` l.8868 / `carTryLand` l.8896 / `carDrive` l.8954 / `carFall` l.9115 / `carBrainInput`
l.9263 — toutes en place, mêmes numéros de ligne. **Zéro divergence joueur↔bot possible par
construction.** Rien à re-vérifier dans les formules.

🟠 **Atelier à l'arrêt depuis ~11 h** (dernier run 23:04, il est 10:21). `runs/` (dernier
`run-seed7.json` 23:04), `champions/` (dernier `gen00040-note2057.json` 23:02), `champion.json`
(23:02) : **tous inchangés depuis le 50e**. `evolution.log` toujours absent. Git : toujours sur
`79b1eed`, mêmes non-commités (champions 324, runs, ce rapport). Aucun nouvel entraînement, aucune
retouche de code.

**Aucun nouveau bug.** #46 (champion périmé de 9 gen) et #45 (config non tracée) restent en tête,
puis #40/#36 (pistes figées), #35 (récompense d'atterrissage), #44/#43/#42 derrière — ordre inchangé
(voir bloc Priorités en bas). Ce passage ne fait que re-confirmer l'état du 50e.

---

## VERDICT — passage 2026-09-09 (50e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` mtime **22:51:26** (strictement identique au
49e). Moteur **UNIQUE** `stepCar` l.9197 → `carDrive`/`carFall`/`carTryLand`/`carStartFall`, partagé
joueur (`stepCar(PCAR,pin9,dt,PWORLD)` l.10989, `startFall` l.9518→`carStartFall(PCAR,…)`) et bots
(`stepCar(b,b.in,dt,TRAIN.world)` l.12704, `airSpawn` l.12906→`carStartFall(b,0,1,…)`). `PCAR=makeCar()`
l.9362. **Zéro divergence possible par construction.** Rien à re-vérifier.

🟢 **PREMIER VRAI RUN 50 GÉNÉRATIONS DEPUIS LE DÉBUT DU PROJET** — `results/runs/run-seed7.json` (mtime
23:04) : `record 3125`, `maxTotD 4634`, **30 % d'atterrissage** (1089/3634), `deaths:{airtime:2397,
idle:173}`, courbe 49 points. + `run-seed42.json` (test 5 gen) et champions neufs `gen00010/20/30/40`
(324 poids, mtime 22:59→23:02). `champion.json` = **vrai champion** (gen40, note 2057, 324 poids).
→ **#33/#34/#38/#41 exercés de bout en bout**, la persistance tient. L'atelier tourne ENFIN.

🔴 **#46 (NOUVEAU, ÉLEVÉ) — `--gens N` est hors-d'un ; `champion.json` est PÉRIMÉ de 9 générations.**
`sim-train.js` l.91 boucle `while(T.GEN<TARGET_GEN)`, or `newGen` incrémente `GEN` **avant** de jouer
la manche (l.13005) : demander `--gens 50` ne **sélectionne que 49 générations** (la 50e est « lancée »
mais jamais évaluée ni autosavée). Preuve : `run-seed7` affiche `gens:50, gen:50` mais **`len(courbe)=49`**.
Conséquence pire : `AUTOSAVE=10` ne fige le champion qu'aux gen multiples de 10 → le **meilleur cerveau
du run (gen49, note 3125) n'est écrit NULLE PART** : `champion.json` vaut encore **gen40 record 2942**.
Reprendre depuis `champion.json` (le chemin de #33) = repartir 9 générations en arrière, et le 3125
n'existe que dans le JSON de run (un nombre, pas des poids). **Correction** : (a) boucler
`T.GEN<=TARGET_GEN` (ou `newGen` incrémenter en fin), (b) autosave **sur record battu** et pas seulement
`gen%10`, (c) en fin de run, réécrire `champion.json` avec le **meilleur de la population courante**.

🔴 **#45 (NOUVEAU, ÉLEVÉ) — le JSON de run ment sur sa config : il note un paramètre MORT et omet les
deux VIVANTS.** `sim-train.js` l.126-128 écrit `wcut:T.W_CUT` (un **no-op** depuis #42) mais **ni
`EVAL_TRACKS` ni `AIR_SPAWN`**. Or ces deux-là changent tout le sens des chiffres : le **30 %**
d'atterrissage n'est **pas interprétable** sans savoir si `AIR_SPAWN` valait 0.3 (défaut, qui gonfle
`takeoffs` et contamine le taux — cf. #44) ou 0 ; et la courbe en scie n'est **pas comparable** sans
savoir si `EVAL_TRACKS` valait 1 ou 3. On archive donc un paramètre sans effet et on oublie ceux qui
déterminent l'interprétation. **Correction** : écrire `evalTracks:T.EVAL_TRACKS, airSpawn:T.AIR_SPAWN`
(dans `TRAIN` dès l'init, pas seulement dans l'URL) et **retirer** `wcut` (ou le marquer `deprecated`).

🟠 **Le scie persiste avec des données réelles** : courbe `2711→1265→1398→1491→2705` (oscillations de
~1500 pts entre générations adjacentes) **malgré `EVAL_TRACKS=3`**. C'est le #40/#36 re-mesuré sur 49
générations vraies : moyenner sur 3 pistes **aléatoires** (`TRAIN.seed=rnd*1e9` l.13014) ne divise pas
assez le bruit (σ/√3≈524 annoncé au 49e, mais on voit du ±1500). Le commentaire l.12523-12527 le disait
déjà (« moyenner NE PAIE PAS, défaut 1 ») — le défaut est pourtant **3** (#43). Incohérence devenue
empirique : soit revenir à 1, soit **figer** les pistes (comparaison appariée, vraie correction de #40).

🟠 **#35 confirmé sur données réelles** : **66 % des décollages meurent encore en l'air** (airtime 2397 /
takeoffs 3634). La voltige reste un piège : le bot saute, vole, crève. Le 30 % d'atterrissage est gonflé
par `AIR_SPAWN` (#44). Le retrait de `W_CUT` de la fitness (l.12952-12955 → `totD + arrivée`) n'a pas
suffi à faire apprendre l'atterrissage — cohérent avec la réserve posée au 47e (la voltige n'a plus
aucune récompense directe).

**Aucun nouveau bug de PHYSIQUE.** Priorités : **#46** (champion périmé → la reprise ment), **#45**
(config non tracée), puis #40/#36 (pistes figées), #35 (récompense d'atterrissage), #44/#43/#42 derrière.

---

## VERDICT — passage 2026-09-09 (49e)

✅ **Isomorphisme physique : SAIN.** `train.html` a encore bougé (mtime **22:51:26**) et le travail est
désormais **commit** (`79b1eed`, git clean — plus de `M train.html`). Le moteur reste **UNIQUE**
`stepCar` l.9197 → `carDrive`/`carFall`/`carTryLand`/`carStartFall`, partagé joueur (`PCAR`) et bots.
La nouveauté `TRAIN.airSpawn` (l.12904) **n'écrit AUCUNE physique** : elle appelle `carStartFall(b,0,1)`
puis soulève `fallPos` de 20-38 m et force `fallVel` — c'est une **condition initiale** de curriculum,
pas une copie dérivée. `carFall`/`carTryLand` la consomment à l'identique → **zéro divergence.**

🟢 **L'ENTRAÎNEMENT A REPRIS** (premier vrai run depuis le 45e) :
- `results/champions/gen00010/20/30-note*.json` : **3 champions neufs, 324 poids, 15 entrées** (mtime
  22:59 → 23:01). `gen00030-note1838.json` = `{in:15, hid:16, out:4, size:324, record:2942}` — **conforme**
  au réseau à 15 entrées. Fin des champions 276 orphelins.
- `results/champion.json` = **vrai champion** (gen30, note1838, record2942, 324 poids), plus le témoin
  `sin(i*0.7)`. → **#33/#34/#38 enfin exercés de bout en bout** : l'autosave headless écrit et la reprise
  lit le même fichier. La persistance tient.
- `results/runs/run-seed42.json` (5 gen, test court) : `record:616`, `maxTotD:1544`, taux atterrissage
  **20 %**, `deaths:{airtime:220, idle:68}`. Courbe `[121,479,404,616]`.

🟢 **Deux méthodes posées par `79b1eed`** (réponses aux #40/#35/#36) :
1. `EVAL_TRACKS` défaut **3** (l.12528) : la note de sélection est la **moyenne sur 3 pistes** (l.13024-13032).
   → le `maxTotD:1544` vs `record:616` de run-seed42 le **prouve** : un bot qui culmine à 1544 sur une piste
   retombe à 616 en moyenne sur 3. L'écart record/maxTotD est désormais **visible** et quantifie le bruit #40.
2. `AIR_SPAWN` défaut **0.3** (l.12538) : 30 % des respawns démarrent EN VOL pour apprendre à **atterrir**
   avant de décoller (curriculum, le goulot mesuré = 79 % de vols morts en l'air).

🔴 **#42 (NOUVEAU, ÉLEVÉ) — `W_CUT` est mort ET mensonger.** `TRAIN.W_CUT=3` est toujours **défini**
(l.12940) avec un commentaire de mesure *actif* (« 2821→3047 +8 %, corrige le Bug #13 »), `sim-train.js`
l'accepte toujours via `--wcut X` (l.39-40) et l'écrit dans le run (`wcut:3`, l.126). **Mais**
`TRAIN.fitness` (l.12952-12955) ne le consomme **plus** — elle retourne `totD + (arrivée ? W_FIN+W_TEMPS×t)`.
Résultat : tout A/B `--wcut` est désormais un **no-op silencieux**, et `wcut:3` dans les runs ment sur un
paramètre qui n'agit pas. Même sort pour `W_CTRL` (l.12947) et `W_OUT` (l.12949) : définis, commentés,
mais plus lus ; et `b.ctrl` est **encore accumulé** au sol (l.12711-12713) sans être consommé. (Le retrait
de `W_CUT` de la fitness est une **bonne** décision — cf. #35 — mais il fallait retirer la constante, le
flag `--wcut`, le champ `wcut` des runs ET le commentaire de mesure, sinon l'outillage ment.)

🟠 **#43 (NOUVEAU, MINEUR) — commentaire d'`EVAL_TRACKS` contradictoire avec le code.** l.12523-12527
affirme encore « moyenner sur plusieurs pistes NE PAIE PAS » et « Défaut 1 = sélection à chaque manche »,
or le code l.12528 défaut **3**. Le commentaire n'a pas suivi le passage 1→3. Trompeur à la relecture.

🟠 **#44 (MÉTHODE, MINEUR mais réel) — `airSpawn` contamine la métrique d'atterrissage.** `airSpawn`
fait `airStats.takeoffs++` (l.12912) : un **spawn aérien offert** compte comme un décollage, et s'il
atterrit, comme un atterrissage. Le taux `landings/takeoffs` ne mesure donc plus « le bot apprend-il à
**sauter puis se poser** » mais « apprend-il à se poser, saut OU spawn confondus ». Conséquence : le
**20 %** de run-seed42 n'est **pas comparable** aux 13-16 % du #35 (baseline sans airSpawn). Le choix est
documenté (l.12910-12911) mais il faut une métrique **séparée** (atterrissages après *vrai* décollage) pour
ne pas confondre « progresse à atterrir » et « progresse à voltiger ».

**Aucun nouveau bug de PHYSIQUE.** Priorités mises à jour : #42 d'abord (ment sur un paramètre), puis
#40/#36 (comparaison appariée de `bench.js`), #35 (mesurer l'effet du retrait de W_CUT, maintenant que
l'entraînement tourne), #44 (métrique d'atterrissage distincte), #43 (commentaire), #37/#33 derrière.

---

## VERDICT — passage 2026-09-09 (48e)

✅ **Isomorphisme physique : SAIN.** `train.html` a encore bougé (mtime **22:31:35**, +11 min après le 47e),
mais le diff ne touche **que** `carBrainInput` (arr[12..14]), `TRAIN.fitness` et **`EVAL_TRACKS`** — **aucune
ligne de physique**. Moteur **UNIQUE** `stepCar` l.9197 → zéro divergence joueur↔bot par construction.

🟢 **Nouveau depuis le 47e : `EVAL_TRACKS` 1 → 3** (l.12525). Réponse directe à #40/#36. Chaque génération
est désormais notée sur **3 pistes** puis moyennée (`endGen` l.13001-13007) → le bruit inter-génération
σ=907 tombe à ~σ/√3 ≈ **524**. **Mais c'est une correction PARTIELLE** : les pistes restent **ALÉATOIRES**
(`TRAIN.seed=Math.floor(TRAIN.rnd()*1e9)` l.12989), pas **figées** — donc pas la comparaison *appariée* que
je recommandais. Coût assumé : ~3× plus lent par génération (le trade-off déjà documenté l.12511-12514).

🟢 **`bench.js` RÉÉCRIT (mtime 22:42:41, il y a ~1 min — l'atelier est EN TRAIN de tourner).** C'est la bonne
réponse à #40+#41 pour CE nouvel outil : il lit la taille réseau **dynamiquement** via
`T.makeBot(null).brain.w.length` (l.93-94, plus de `276` codé en dur), évalue sur **N=90 pistes à graines
FIXES** (l.51-52, `sel=7919`), rapporte médiane + moyenne tronquée + σ, et fait la **comparaison APPARIÉE**
(l.192-221, même graines pour tous + seuil de lisibilité `2σ_Δ/√N`). Exactement ce que #40 demandait.

🔴 **#41 reste PARTIELLEMENT ouvert : `xp-vitesse.js` et `xp-bruit-banc.js` codent TOUJOURS 276 en dur.**
`xp-vitesse.js` l.62 (`const W_EXPECTED = 276;`, rejet l.87) et `xp-bruit-banc.js` l.57 (`w.length !== 276`)
n'ont **pas bougé** (mtime 14:46 et 14:32). Dès qu'un champion à **324 poids** existera (BRAIN_IN=15), ces
deux scripts le **rejetteront en silence**. `bench.js` les remplace, mais les laisser traîner est trompeur.

🟠 **Toujours aucun entraînement.** `runs/` et `champions/` inchangés (01:35), `evolution.log` absent. Les 30
champions disque = **276 poids = orphelins** (incompatibles 15 entrées) : `bench.js` affiche aujourd'hui
« AUCUN CHAMPION COMPATIBLE » — comportement **correct** (aucune donnée inventée). Rien à mesurer tant que
le prochain run n'a pas écrit de champion 324.

🟠 **Mineur** : commentaire l.9256 « RESTENT 12 entrees » devenu faux (c'est 15). Et tout le lot
(BRAIN_IN/fitness/EVAL_TRACKS) est **non commité** (git `M train.html`) — à committer avant d'entraîner.

**Aucun nouveau bug de physique. #41 (résidu xp-*), #40 (pistes figées), #35 (voltige sans récompense
directe) restent les priorités, voir bloc Priorités en bas.**

---

## VERDICT — passage 2026-09-09 (47e)

✅ **Isomorphisme physique : SAIN.** `train.html` a BOUGÉ (mtime **22:20:46**), mais le diff ne touche
**que** `carBrainInput` (entrées) et `TRAIN.fitness` — **aucune ligne de physique**. Le moteur reste
**UNIQUE** : `stepCar` l.9197 → `carDrive`/`carFall`/`carTryLand`/`carStartFall`, et le joueur
délègue bien (`startFall` l.9518 → `carStartFall(PCAR,…)` l.9520). **Zéro divergence joueur↔bot.**

🟢 **Deux bugs fermés : #34 et #38.** `results/champion.json` est **supprimé** du dépôt (git `D`),
et `check-persist.js` écrit désormais son témoin dans `os.tmpdir()/check-persist/temoin.json`
(jamais dans `results/champion.json`). Le poison `sin(i*0.7)` ne peut plus ni fuir ni ressusciter.

🟠 **Deux changements de MÉTHODE ont été posés à 22:20, mais AUCUN entraînement ne les a encore
mesurés** (`runs/` et `champions/` toujours datés 01:35, `evolution.log` absent) :

1. **`BRAIN_IN` 12 → 15** (train.html l.9259). `carBrainInput` ajoute 3 entrées en vol, dans le
   repère de la dalle visée : `arr[12]` vitesse longitudinale (`lon/150`), `arr[13]` dérive
   latérale (`latv/50`), `arr[14]` tangage (`atan2(vy,h)/(π/2)`). `MLP.IN=BRAIN_IN` et `MLP.SIZE`
   se recalculent proprement (l.12489/12493 → **324** poids au lieu de 276). Le remplissage est
   complet (0..14, tous les cas couverts). **Bien.** Mais voir #41 : l'outillage de mesure n'a pas suivi.

2. **`TRAIN.fitness` simplifiée** (l.12928) : `W_CUT`, `W_CTRL`, `W_OUT` **retirés** du calcul —
   reste `totD + (arrivée ? W_FIN + W_TEMPS×gain)`. C'est **cohérent** : `totD = SURV.pBase + b.s`
   (l.12702/12889) récompense déjà la coupe (avancer le long du ruban), donc `W_CUT` était un
   double-comptage ; et le retirer **coupe l'incitation parasite** « sauter → mourir » de #35
   (plus de gain de coupe si on ne se repose pas). **Réserve** : la voltige n'a désormais plus
   AUCUNE récompense directe — le bot ne doit sauter que si l'atterrissage paie. Risque réel de
   retour au « rouler droit » (ce que `groundPilot`/le MLP-override devaient dépasser). À surveiller.

🟠 **Code mort laissé derrière** : `W_CUT`/`W_CTRL`/`W_OUT` toujours définis (l.12915/12922/12926)
avec leurs commentaires, mais plus consommés. Mineur mais trompeur.

🔴 **#41 (NOUVEAU) ci-dessous** : les outils de mesure sont figés sur 276 poids, or tout futur
champion vaudra 324.

---

## VERDICT — passage 2026-09-09 (46e)

✅ **Isomorphisme physique : SAIN.** `train.html` mtime **01:06:54**, strictement inchangé. Moteur
**UNIQUE** `stepCar` l.9197 (partagé joueur+bots) → zéro divergence possible par construction. Rien à
re-vérifier dans les formules tant que ce mtime ne bouge pas.

🟠 **Statu quo intégral depuis le 45e passage (il est ~22:01, soit ~7 h après).** Re-vérifié à l'instant :
- Aucun fichier modifié après **14:46** (`xp-vitesse.js`, déjà traité au 45e). `train.html`,
  `check-persist.js`, `xp-bruit-banc.js` : tous antérieurs, inchangés.
- `results/champion.json` : **toujours absent** → #34/#38 tiennent (le témoin n'a pas ressuscité).
- `runs/` (01:35) et `champions/` (01:35) : inchangés, **aucun entraînement depuis 01:35**.
- `evolution.log` : **toujours absent**.
- L'atelier est à l'arrêt : personne ne code ni n'entraîne depuis le 45e passage.

**Aucun nouveau bug.** #40, #35, #37, #33 restent ouverts, dans le même ordre de priorité (voir bloc
Priorités en bas). Ce passage ne fait que re-constater l'état du 45e.

---

## VERDICT — passage 2026-09-09 (45e)

✅ **Isomorphisme physique : SAIN, toujours.** `train.html` mtime **01:06:54**, strictement inchangé.
Moteur **UNIQUE** `stepCar` l.9197 (partagé joueur+bots). Rien à re-vérifier dans les formules.

🟢 **Activité : `xp-vitesse.js` ÉTENDU (mtime 14:46:34, ~24 s après mon 44e passage).** L'agent
principal a corrigé la limite que je signalais : le script charge désormais **les 30 champions**
(avant : 12, tous gen10 faibles), dédupliqués par empreinte de poids, sur **5 graines fixes**. Je
l'ai **ré-exécuté** — résultats réels :
- **rho note↔distance = 0.991**, **rho note↔vitesse = 0.960** (n=30, plage de notes 74→6630).
  Conclusion **OUI** plus solide qu'au 44e (n=12 : 0.972/0.986). Le « OUI » du #35 est maintenant
  assis sur la plage complète, pas sur les seuls gen10.
- **Part médiane du centrage = 42,4 %** (n=150) — stable vs 42,7 % du 44e.

🟠 **Mais la conclusion « OUI » a un angle mort qui persiste et se confirme : 0/30 champions
atteignent 1500 m sur les 5 circuits figés.** Les meilleurs (note 3790/4218/6630) ne couvrent
1500 m que sur 3–4/5 circuits, avec des dispersions énormes (note 4158 : −82..6479, étendue 6562 ;
note 6630 : ±479 σ≈moyenne). Deux leçons :
1. Le « OUI » de xp-vitesse dit seulement que **la note classe la vitesse** — il ne dit PAS que les
   champions **savent** aller vite loin de façon fiable. C'est #35 qui reste entier (personne ne
   survole proprement un circuit complet).
2. Le bruit #40 est **re-mesuré en creux** : même moyenné sur 5 graines, σ note reste de l'ordre de
   la moyenne. 5 graines divisent à peine un σ≈907 (σ/√5≈406) — insuffisant pour un A/B fin.

🟠 **Toujours aucun entraînement depuis 01:35** : `runs/` inchangé (01:35), `evolution.log` absent.
Les 30 champions datent tous de 01:32–01:35 (sans graine dans le nom, cf. #37). L'agent principal
passe son temps à **fiabiliser la mesure**, pas à entraîner ni à corriger les bugs de fond.

**Aucun nouveau bug de code.** Le travail du 45e est une mesure, pas une correction. #40 et #35
restent 1 et 2 des priorités, #37/#33 derrière.

---

<details><summary>Verbatim des passages précédents (44e et avant, non retouché)</summary>

## VERDICT — passage 2026-09-09 (44e)

✅ **Isomorphisme physique : SAIN, toujours.** `train.html` mtime **01:06:54**, inchangé. Moteur
**UNIQUE** `stepCar` l.9197 (partagé joueur+bots) → zéro divergence possible. Rien à re-vérifier.

🟢 **Grosse avancée d'outillage — 3 bugs fermés, 2 mesures capitales produites.** J'ai **exécuté**
moi-même les scripts (résultats réels ci-dessous, pas des lectures) :

- **#38 CORRIGÉ** — `check-persist.js` (mtime 14:26) écrit désormais son témoin dans
  `os.tmpdir()/check-persist/temoin.json`, jamais dans `results/champion.json`. **Exécuté : PASS.**
- **#34 RÉSOLU** — `champion.json` (le témoin `sin(i*0.7)`) a été **supprimé du dépôt**.
- **#39 CORRIGÉ** — `xp-vitesse.js` (mtime 14:37) pointe sur `results/champions/gen*.json`, schéma
  plat `w` à la racine. **Exécuté : fonctionne** (12 champions mesurés).
- **NOUVEAU `xp-bruit-banc.js`** (14:32) — mesure le bruit du banc d'évaluation.

🔴 **Mesure n°1 (`xp-bruit-banc`) — le bruit du banc est ÉNORME : σ = 907 points.**
Un **même** cerveau figé (`gen00020-note6630`) sur 20 circuits donne des notes de **−88 à +4217**
(étendue 4305, σ 907). Conséquence directe : **toute comparaison de deux configs qui diffèrent de
moins de ~1800 points (ou ~1200 m de distance) est sous le bruit.** Le gain `FLYFIX` du #35
(distance médiane 2598 → 2912, soit +314 m) est **en dessous du plancher de bruit** — il n'est PAS
prouvé. Le taux d'atterrissage, lui (13 % → 16 %), est bien significatif (comptage, ~3,7σ) : c'est
le seul signal fiable du #35. Ce chiffre **quantifie le #36** et doit servir de référence avant
tout nouvel A/B.

🟢 **Mesure n°2 (`xp-vitesse`) — bonne nouvelle : la note EST alignée sur la vitesse.**
ρ(Spearman) note↔distance = **0.972**, note↔vitesse moyenne = **0.986** (n=12 champions × 5 circuits).
Sélectionner sur la note = sélectionner sur la vitesse. Le fond de #35 (« la note récompense-t-elle
ce qu'on veut ? ») est **tranché : oui pour la vitesse**. Part médiane du centrage dans la note :
42,7 % (le `ctrl` pèse lourd, mais il corrèle aussi à la distance). Réserve : **0/12 champions
n'atteignent 1500 m** — ce sont des cerveaux de gen 10, faibles ; rien à en conclure sur la voltige.

🟠 **Aucun entraînement depuis 01:35** : pas de nouveau `runs/` (toujours datés 01:35), `evolution.log`
absent. L'agent principal a passé ce cycle à **fiabiliser l'outillage de mesure**, pas à entraîner.

**Aucun nouveau bug.** #33, #35, #36, #37 restent ouverts (voir Priorités). Le #36 passe en
première priorité : le bruit est maintenant **mesuré** (σ=907), c'est lui qui empêche de voir si
quoi que ce soit progresse.

</details>

---

## Bug #46 (NOUVEAU, ÉLEVÉ) — `--gens N` hors-d'un + `champion.json` périmé de 9 générations

- `sim-train.js` l.91 boucle `for(... ; T.GEN<TARGET_GEN ; ...)`, et `TRAIN.newGen` incrémente `GEN`
  **avant** de jouer la manche (`train.html` l.13005). Donc `--gens 50` sélectionne **49** générations :
  la 50e est « lancée » mais jamais évaluée, jamais autosavée. Preuve : `run-seed7` dit `gens:50, gen:50`
  mais `len(courbe)=49`.
- Combiné à `AUTOSAVE=10` (save uniquement si `GEN%10===0`, l.13043), le **meilleur cerveau du run
  (gen49, note 3125) n'est écrit nulle part** : `champion.json` reste **gen40 / record 2942**. La reprise
  (#33) repart donc 9 générations en arrière, et le 3125 n'existe que comme *nombre* dans le JSON de run.
- **Correction** : (a) `T.GEN<=TARGET_GEN` (ou incrémenter en fin de `newGen`) ; (b) autosave sur
  **record battu**, pas seulement `gen%10` ; (c) en fin de run, réécrire `champion.json` avec le meilleur.

## Bug #45 (NOUVEAU, ÉLEVÉ) — le JSON de run trace un paramètre mort et omet les deux vivants

- `sim-train.js` l.126-128 écrit `wcut:T.W_CUT` (no-op depuis #42) mais **ni `EVAL_TRACKS` ni
  `AIR_SPAWN`**. Conséquence : le **30 % d'atterrissage** de run-seed7 est **ininterprétable** — on ne
  sait pas si `AIR_SPAWN` valait 0.3 (défaut, qui gonfle `takeoffs`, cf. #44) ou 0 ; ni si la courbe en
  scie a été moyennée sur 3 pistes ou sur 1. On archive l'inutile et on oublie l'essentiel.
- **Correction** : écrire `evalTracks:T.EVAL_TRACKS` et `airSpawn:T.AIR_SPAWN` (les exposer dans `TRAIN`
  dès l'init, ils sont déjà là mais non tracés) ; retirer `wcut` ou le marquer `deprecated`.

---

## Bug #41 (ÉLEVÉ, MIS À JOUR) — `BRAIN_IN` 12→15 : `bench.js` corrigé, mais `xp-vitesse`/`xp-bruit-banc` figés sur 276

- `train.html` l.9259 passe `BRAIN_IN` de **12 à 15** → `MLP.SIZE` (l.12493) passe de **276 à 324**.
  Tout champion entraîné **après** ce changement portera **324** poids.
- ✅ **`bench.js` CORRIGÉ (22:42)** : il lit désormais la taille réseau **dynamiquement** via
  `T.makeBot(null).brain.w.length` (l.93-94) — plus de constante magique. Il écarte proprement les anciens
  champions 276 (l.120-122) au lieu de planter.
- ❌ **Reste cassé : `xp-vitesse.js` et `xp-bruit-banc.js` codent 276 en dur, inchangés** :
  - `xp-vitesse.js` l.62 : `const W_EXPECTED = 276;` (rejet l.87 si `w.length !== W_EXPECTED`).
  - `xp-bruit-banc.js` l.57 : `if (... w.length !== 276)` (idem).
- **Conséquence** : dès que l'entraînement reprendra avec les 15 entrées, les champions à 324 poids seront
  **tous rejetés** par ces deux scripts — la mesure (corrélations note↔vitesse du #35/#40) retombera à zéro,
  silencieusement. `bench.js` est le successeur, mais ces deux-là sont trompeurs s'ils restent.
- **Correction** : pointer `xp-vitesse.js`/`xp-bruit-banc.js` sur la même lecture dynamique
  (`T.makeBot(null).brain.w.length`) **ou** les supprimer du dépôt (redondants avec `bench.js`).

---

## Bug #40 (NOUVEAU, ÉLEVÉ — c'est un CONSTAT, pas une faute de code) — sélection 1 piste = sous le bruit

- **`xp-bruit-banc.js` a mesuré** (je l'ai exécuté) : σ = 907 points, étendue 4305, pour un cerveau
  figé sur 20 circuits. `EVAL_TRACKS` vaut toujours **1** (`train.html` l.12516) → chaque génération
  est notée sur **une** piste tirée au hasard (`buildTrack(TRAIN.seed)`, l.12977).
- **Ce que ça casse** : le classement *intra*-génération (24 bots sur la même piste) est sain, mais
  la comparaison *inter*-générations (le « record », le champion autosavé à gen%10, les A/B de
  configs) est noyée dans 907 points de bruit de piste. Impossible de dire si gen N+1 > gen N, ni si
  `FLYFIX`/`W_CUT` servent, tant qu'on ne moyenne pas sur plusieurs pistes **figées**.
- **Nuance déjà documentée** (l.12511-12514) : moyenner sur N pistes divise les étapes d'évolution
  par N. Ce n'est pas une objection au moyennage du *champion*, c'est une objection au moyennage de
  *chaque* génération. Les deux ne sont pas contradictoires.
- **Correction** : réévaluer le **champion candidat** sur ≥3 pistes **figées** avant sélection/écriture
  (pas la population entière à chaque gen), et figer le jeu de pistes d'un A/B entre deux configs
  (comparaison *appariée*, qui réduit le bruit à la variance intra-piste, bien < 907).

---

<details><summary>Verbatim des passages précédents (43e et avant, non retouché)</summary>

## VERDICT — passage 2026-09-09 (43e)

✅ **Isomorphisme physique : SAIN, toujours.** `train.html` mtime **01:06:54**, strictement inchangé
depuis le 36ᵉ passage. Moteur **UNIQUE** `stepCar` l.9197 → `carDrive`/`carFall`/`carTryLand`/
`carStartFall` partagé joueur+bots. **Zéro divergence possible par construction.** Rien à re-vérifier
dans les formules tant que ce mtime ne bouge pas.

🟠 **Statu quo intégral — aucun fichier n'a bougé depuis le 42ᵉ passage.** Re-vérifié à l'instant :
- `train.html` : mtime **01:06:54** (inchangé).
- `champion.json` : **toujours le témoin** `gen:1234, note:99999, w=sin(i*0.7)×0.5` (mtime **02:25**,
  date interne 23:38) → **#34/#38 non corrigés**.
- `xp-vitesse.js` : mtime **13:41:30** (inchangé) → **#39 non corrigé** (pointe toujours sur
  `results/evo/ckpt-*.json`, dossier inexistant ; lit `j.champion.w`, schéma absent du vrai dépôt).
- `results/` : aucun nouveau `runs/`, `champions/` ni `champion.json` depuis **02:25**. `evolution.log`
  toujours absent.
- **L'atelier est à l'arrêt** : personne ne code ni n'entraîne depuis le 42ᵉ passage. Ce passage ne
  fait que re-constater l'état précédent.

Aucun nouveau bug. Les bugs **#33 → #39 restent tous ouverts**, dans le même ordre de priorité que
le 42ᵉ passage (voir bloc Priorités en bas).

---

<details><summary>Verbatim des passages précédents (42e et avant, non retouché)</summary>

## VERDICT — passage 2026-09-09 (42e)

✅ **Isomorphisme physique : SAIN, inchangé.** `train.html` n'a **pas bougé** (mtime **01:06:54**,
identique à l'instant). Moteur **UNIQUE** : `stepCar` l.9197 → `carDrive` (l.8954) / `carFall`
(l.9115) / `carTryLand` (l.8896) / `carStartFall` (l.8868), partagé joueur (`PCAR`) et bots.
`makeCar` (l.8830) alimente `TRAIN.makeBot` (l.12850). Rien à signaler.

🟢 **Reprise d'activité — nouveau script `xp-vitesse.js` (mtime 13:41:30).** Après ~12 h d'arrêt,
l'agent principal a écrit un outil de diagnostic qui mesure si la **note de fitness sélectionne
bien les voitures les plus rapides** (corrélation de rang de Spearman note↔distance/vitesse). Bonne
intention : ça touche directement le fond de **#35** (la note récompense-t-elle ce qu'on veut ?).

🔴 **MAIS ce script est mal câblé : il ne peut tourner sur AUCUN champion réel.** Nouveau bug **#39**
ci-dessous. En l'état, `xp-vitesse.js` trouve **zéro checkpoint** et sort en `exit(1)` — son verdict
ne portera sur rien. À corriger AVANT de l'exécuter, sinon on mesure du vide.

🟠 Pour le reste, statu quo : `champion.json` est **toujours le témoin** `gen:1234, note:99999,
w=sin(i*0.7)×0.5` (mtime 02:25) → **#34/#38 non corrigés**. `evolution.log` toujours absent. Derniers
champions/runs encore datés **01:32–01:35** (sans graine, cf. #37).

---

## Bug #39 (NOUVEAU, ÉLEVÉ) — `xp-vitesse.js` cherche les champions au mauvais endroit, sous le mauvais schéma

- Le script (l.51-52, 60-65, 75) lit **`results/evo/ckpt-*.json`** et attend un objet `j.champion.w`
  (array de 276 poids). Or **`results/evo/` n'existe pas** : le dossier est absent de `results/`
  (seuls `archive/`, `champion.json`, `champions/`, `demos/`, `runs/` existent).
- Le vrai dépôt des champions entraînés est **`results/champions/gen00010-note4484.json`** (14+ fichiers),
  et leur **schéma est plat** : `{v, in, hid, out, size, gen, note, record, date, w:[...]}` — les poids
  sont à la **racine** (`w`), pas sous `j.champion.w`. `j.champion.gen` n'existe pas non plus ; c'est
  `j.gen`. Vérifié sur `gen00010-note4484.json` (top-level `w`, `gen:10`, `record:4484`).
- **Conséquence** : `loadChampions()` renvoie `[]` → le script imprime « AUCUN checkpoint trouvé » et
  `process.exit(1)` (l.93-100). Le diagnostic ne peut **jamais** mesurer un vrai champion : il est
  branché sur un format de sortie qui n'est pas celui que l'autosave produit.
- **Correction** : pointer `loadChampions()` sur `results/champions/gen*-note*.json` (glob `gen*note*.json`)
  et lire `w` à la racine + `gen`/`note`/`record` plats ; sinon utiliser directement les 14 champions
  déjà sur disque. (Nota : l'exclusion de `champion.json` témoin, l.13-16, est correcte — à garder.)

---

<details><summary>Verbatim des passages précédents (40e et avant, non retouché)</summary>

## VERDICT — passage 2026-09-09 (40e)

✅ **Isomorphisme physique : SAIN, toujours.** `train.html` n'a **pas bougé** (mtime 01:06:54,
inchangé à l'instant). Moteur **UNIQUE** : `stepCar` l.9197 → `carDrive` (l.8954) / `carFall` (l.9115)
/ `carTryLand` (l.8896) / `carStartFall` (l.8868), partagé joueur (`PCAR`) et bots. `makeCar` (l.8830)
alimente `TRAIN.makeBot` (l.12850). **Zéro divergence possible par construction.** Rien à signaler.

🟠 **Statu quo total depuis le passage 38 — rien de neuf au 40e.** Tous les bugs #33→#38 restent
ouverts. Re-vérifié à l'instant :
- `train.html` : mtime **01:06:54**, inchangé (physique non retouchée).
- `champion.json` : **toujours le témoin** `gen:1234, note:99999, w=sin(i*0.7)×0.5`, mtime **02:25**
  = toujours ressuscité par `check-persist.js` → **#38 et #34 non corrigés**.
- Aucun fichier neuf depuis 12:41 (hors ce rapport) ; `evolution.log` toujours absent ; les derniers
  runs/champions datent encore de **01:34–01:35** (sans graine, cf. #37).
- **L'atelier est à l'arrêt depuis ~11 h** : personne ne code ni n'entraîne. Ce passage ne fait que
  re-constater l'état du 39.

---

## VERDICT — passage 2026-09-09 (39e)

✅ **Isomorphisme physique : SAIN, toujours.** `train.html` n'a **pas bougé** depuis le passage 36
(mtime 01:06:54, inchangé à l'instant). Le moteur reste **UNIQUE** : `stepCar` l.9197 → `carDrive`
(l.8954) / `carFall` (l.9115) / `carTryLand` (l.8896) / `carStartFall` (l.8868), partagé joueur
(`PCAR`) et bots (`stepCar(b, b.in, …)`). `makeCar` (l.8830) alimente `TRAIN.makeBot` (l.12850).
**Zéro divergence possible par construction.** Rien à signaler.

🟠 **Aucune avancée depuis le passage 38 — statu quo total, tous les bugs #33→#38 restent ouverts.**
Vérifié à l'instant :
- `train.html` : mtime **01:06:54**, inchangé (la physique n'a pas été retouchée).
- `champion.json` : **toujours le témoin** `gen:1234, note:99999, w=sin(i*0.7)×0.5`, mtime **02:25**
  = toujours ressuscité par `check-persist.js` `restaurer()` → **#38 et #34 non corrigés**.
- `check-persist.js` (mtime 01:47), `sim-train.js` (01:32), `multi-train.js` (01:31), `sim-env.js`
  (01:28) : tous **antérieurs** au passage 38, aucun neuf. **#33/#37 toujours non traités.**
- Aucun `run-*`/`multi-*` neuf depuis 01:35 ; `evolution.log` toujours absent ; `cloned-brain.json`
  toujours mort. Les 14 champions `gen00010/20-noteYYY.json` datent encore de 01:33–01:35 (sans graine).
- **L'atelier est à l'arrêt depuis ~10 h** : personne ne code ni n'entraîne. Rien de neuf à
  confirmer ; ce passage ne fait que re-constater l'état du 38.

---

## Bug #37 (CRITIQUE) — les 8 graines s'écrasent dans le même `champion.json`, sans étiquette de graine

- Le stub `fetch('/train-save')` de **sim-env.js l.107** écrit **toujours** dans
  `results/champion.json`, quel que soit le run. Or `multi-train.js` lance **8 process en
  parallèle** (`Promise.all`, l.56) qui autosavent chacun à gen 10/20/30… (`TRAIN.AUTOSAVE=10`,
  train.html l.13084). Résultat : `champion.json` est le gagnant d'une **course entre 8 écritures**
  concurrentes — pas le meilleur cerveau, le dernier qui a écrit.
- Les champions individuels survivent dans `results/champions/genXXXX-noteYYY.json`, mais le nom
  **n'inclut pas la graine** : 8 évolutions indépendantes sont mélangées sans origine, impossible
  de retrouver de quel run vient un champion donné.
- **Correction** : le nom historique doit porter la graine (`gen00010-seed1101-note4484.json`) et
  `champion.json` ne doit être écrit que par un **unique** rédacteur (ex. un run séparé
  `sim-train.js` non `--random`, ou un post-traitement qui lit tous les `results/runs/` et écrit
  LE meilleur une seule fois, hors concurrence).

---

## Bug #33 (CRITIQUE, mis à jour) — persistance réparée côté navigateur, encore cassée côté headless

- ✅ **Progrès** : le navigateur lit désormais **`champion.json` en premier** avec repli sur
  `cloned-brain.json` (**train.html l.12574-12575**). Le nom canonique est bien consommé côté
  navigateur.
- ❌ **Encore cassé headless** : `sim-train.js` l.24 relit **`results/cloned-brain.json`** (fichier
  mort, plus rien ne l'écrit — le clonage a été abandonné, `archive-2026-09-09/clonage/`). `check-live.js`
  l.22 référence le même fichier mort. Le headless n'a donc accès à AUCUNE reprise du champion.
- ❌ **Pire** : `multi-train.js` l.34 passe `--random` (→ `useClone=false`) : le flux d'entraînement
  réel n'exerce jamais la reprise. Chaque run multi repart de génération 0 aléatoire, quel que soit
  le champion sur disque. Le nouveau `check-persist.js` prouve le *mécanisme* (`seedBrain`→`newGen`)
  mais pas le *chemin réel* (il relit lui-même le fichier, il ne passe pas par `sim-train.js`).
- **Correction** : aligner les 3 lecteurs sur **une constante unique `BRAIN_FILE = results/champion.json`**
  (`sim-train.js` l.24, `check-live.js` l.22, et le repli de `train.html` l.12575), puis retirer
  `--random` du flux de production de `multi-train.js` (ou ajouter un `--resume` qui charge `champion.json`).

---

## Bug #34 (CRITIQUE, mis à jour — cause identifiée) — `champion.json` est un ARTEFACT DE TEST, pas un champion

- Le `champion.json` en place (`gen:1234`, `note:99999`, `in:12`, 276 poids) a des poids qui valent
  **exactement** `Math.sin(i*0.7)*0.5`. Vérifié à nouveau ce passage : `w[0]=0`, `w[1]=0.3221`,
  `w[2]=0.4927` = `sin(0)/sin(0.7)/sin(1.4)×0.5`, période 2π/0.7≈9.
- **C'est la signature du « témoin reconnaissable » de `check-persist.js` l.45** :
  `Math.sin(i*0.7)*0.5`, écrit avec `gen:1234, note:99999`. Ce n'est **pas** un contrôleur appris
  ni un bug d'init/mutation (l'hypothèse du passage 35 est donc **réfutée**) : c'est un **fichier de
  test qui a fui** sur le disque (restauration du backup non aboutie, ou ancien script de test au
  même gabarit).
- **Correction simple** : supprimer `champion.json` (il est invalide et trompeur) ; faire écrire le
  champion réel par le mécanisme d'autosave (qui produit bien des poids aléatoires normaux — cf.
  `results/champions/gen00010-note4484.json`, avec champ `record`). Garder le garde-fou : rejeter
  tout `w` dont l'autocorrélation à courte période est quasi nulle, pour détecter ce cas de figure.

---

## Bug #35 (ÉLEVÉ, mis à jour) — le `FLYFIX` remonte l'atterrissage de 13 % → 16 % : insuffisant

- A/B récent (2 `multi-*` de 23:35, 8 graines × 25 gen) :
  - `noflyfix:true`  : **13 %** atterrissage (2588 décollages / 331 atterrissages), décès airtime 2233.
  - `flyfix` actif   : **16 %** (2499 / 412), airtime 2047. Distance médiane 2598 → 2912.
- Le `FLYFIX` aide un peu (entrées « position de référence » et « cap en vol » revivent en vol), mais
  on reste à **~84 % de décollages qui meurent en l'air**. La récompense valorise toujours le saut
  (`W_CUT`) et non l'atterrissage réussi : le comportement émergent est encore « sauter → mourir ».
- **Correction (inchangée, toujours prioritaire)** : récompenser l'atterrissage **réussi**
  (bonus ∝ temps de vol *si* `tryLand` repose la caisse sur le ruban) et/ou pénaliser l'`airtime`
  mort. Tant que `landings/takeoffs` < ~50 %, la voltige reste un piège, pas une compétence.

---

## Bug #36 (ÉLEVÉ) — sélection sur 1 piste : toujours les dents de scie

- `EVAL_TRACKS` vaut toujours 1 par défaut (`sim-train.js` l.63) ; chaque génération est jouée et
  sélectionnée sur **une seule piste aléatoire** (`buildTrack(TRAIN.seed)` à chaque manche, l.12977).
- Courbes réelles toujours en scie : `run-seed1707` `171→399→1153→1564→526→…→7589`. Le rang de
  sélection reste largement du hasard de piste.
- **Correction (inchangée)** : réévaluer le champion sur **≥3 pistes figées** (ou moyenner sur
  `EVAL_TRACKS≥3`) avant la sélection/écriture.

---

## Bug #38 (NOUVEAU, ÉLEVÉ) — `check-persist.js` PERPÉTUE le témoin `sin(i*0.7)` au lieu de le purger

- Le mécanisme : `check-persist.js` l.33-35 **sauvegarde** `champion.json` dans
  `champion.json.check-persist-backup` avant le test, puis **l'écrase** avec le témoin (l.47-48,
  `gen:1234, note:99999, w=sin(i*0.7)*0.5`), et enfin `fin()` (l.128) appelle `restaurer()` qui
  **recopie le backup par-dessus**. Donc : si `champion.json` contenait déjà un témoin (la fuite
  originelle jamais nettoyée), check-persist le **recopie fidèlement** à la fin — il ne le supprime
  jamais, il le ressuscite à chaque exécution.
- **Preuve sur disque** : `champion.json` actuel porte `date:2026-09-08T23:38:02.474Z` (le témoin
  originel de 23:38) mais un `mtime` de **02:25** (recopié tout à l'heure par `restaurer()`). Le
  fichier backup n'existe plus (`fin` l'a délié), donc le cycle a bien tourné — et a laissé le témoin.
- **Conséquence** : le correctif « supprimer `champion.json` » (#34) ne tient **que jusqu'au
  prochain `check-persist`**. Si un `champion.json` témoin traîne, l'outil censé tester la
  persistance la **bloque** en restaurant le poison.
- **Correction** : `check-persist.js` doit **refuser de restaurer un témoin** — détecter la
  signature (`note===99999` et/ou `gen===1234`, ou l'autocorrélation périodique du #34) et, dans ce
  cas, **supprimer** `champion.json` au lieu de le recopier. Idéalement, écrire le témoin dans un
  fichier séparé (`champion.json.check-persist-temoin`) et ne JAMAIS toucher au vrai `champion.json`,
  pour que le test de reprise s'exerce sur un chemin distinct du champion réel.

---

## Bugs encore ouverts (inchangés, la physique n'a pas bougé)

- **#30** (coupe consentie paye `outs=-120`, `W_CTRL` tire en sens inverse) — l.12705/12777/12908.
- **#31** (zone morte manquante sur `side`, sortie `HID+2` surchargée nitro/couper) — l.12773/12776/12683.
- **#29** (`groundPilot` ne gère pas `side<0`) et **#29b** (bande morte gaz / nitro permanent) — l.12744-12790.
- **#23** (`level` non figé → longueur de piste dépend de la save joueur) — l.2193/2172/9687.
- **#32** (`carTryLand` cherche à l'infini `nearestPts(P,2,1e9)` au lieu de `1600²`) — l.8898.
- **#28** (`tournament` code mort) et **#26** (`deaths` non vidé dans `startEval`).

---

## Note de format (mineure) — `BRAIN_IN` 11 → 12 → 15 casse les anciens cerveaux

- Le `FLYFIX` ajoute une 12ᵉ entrée (`arr[11]` « cap en vol », l.9333-9339), donc `BRAIN_IN=12`
  (l.9259). Puis le 47ᵉ passage a porté `BRAIN_IN` à **15** (vitesse long/lat + tangage en vol,
  l.9340-9351), donc `MLP.SIZE` = **324** (l.12493). Tout cerveau entraîné avant est incompatible —
  détectable par la taille du vecteur de poids (documenté l.9256-9257, et `check-persist` l.59
  vérifie la taille). Ne pas relire d'anciens `gen*.json` (276 ou 208 poids) dans le réseau à 15
  entrées. Les 30 champions sur disque (gen00010/20, 276 poids) sont **orphelins** jusqu'au
  prochain entraînement.

---

## Sentinelles (état)

- **Physique unifiée** : `sim-env.js` exécute le script de `train.html` (`T.tick(1/60)` via
  `sim-train.js` l.93) — le code `stepCar/carFall/carTryLand` est partagé, pas copié. `check-iso.js`
  reste le garde-fou ; à relancer à chaque retouche de `train.html`.
- **Persistance** : enfin *exercée* (l'autosave headless écrit `champion.json` + `results/champions/`),
  mais **écrite, pas relue** (#33) et **concurrente** (#37). #34/#38 fermés : `champion.json` témoin
  supprimé du dépôt, `check-persist` écrit désormais en tmpdir. `evolution.log` n'existe toujours pas ;
  l'audit passe par `results/runs/*.json` — suffisant, sauf pour la généalogie des champions (#37).

---

## Priorités (ordre d'effet décroissant)

1. **#47 — sélection par rang = couche de reporting muette** (train.html l.13044/13056/13059/13131 +
   sim-train.js l.73-74/116/127) : `record`/`note`/`courbe` sont des rangs ≤23, plus des distances.
   Tracer la note brute (`totD`+arrivée) en parallèle : champion.json, JSON de run, courbe. Sinon aucun
   progrès n'est plus mesurable ni comparable entre runs.
2. **#42 — `W_CUT` mort et mensonger** (l.12940 + `--wcut` sim-train.js l.39-40 + champ `wcut` l.126) :
   la fitness l.12952 ne le consomme plus → tout A/B `--wcut` est un no-op silencieux. Retirer la
   constante, le flag, le champ de sortie et le commentaire de mesure (ou remettre `W_CUT` dans la fitness).
   Idem `W_CTRL`/`W_OUT` (l.12947/12949) et `b.ctrl` (l.12711-12713), morts aussi.
3. **#44 — métrique d'atterrissage distincte** : `airSpawn` compte comme `takeoffs` (l.12920), donc le
   taux `landings/takeoffs` n'est plus comparable aux 13-16 % du #35. Tracer séparément les atterrissages
   après *vrai* décollage vs après spawn aérien. Désormais DÉTERMINISTE mais toujours contaminé.
4. **#48 — `AIR_CYCLE` no-op tant que `EVAL_TRACKS<AIR_CYCLE`** (l.13027) : cycle effectif =
   `min(AIR_CYCLE,EVAL_TRACKS)` → documenter, ou compter `evalIdx` en continu.
5. **#40/#36 — sélection sur pistes aléatoires** : `EVAL_TRACKS=3` divise le bruit par √3 mais ne fige pas
   les pistes. Pour les A/B, utiliser la **comparaison appariée de `bench.js`** (graines fixes).
6. **#35 — mesurer l'effet du retrait de `W_CUT`** : maintenant que l'entraînement tourne, regarder si le
   bot réapprend à sauter ET atterrir (via le curriculum airSpawn) ou régresse vers « rouler droit ».
7. **#41 — `xp-vitesse.js` (l.62) et `xp-bruit-banc.js` (l.57) codent encore 276 en dur** : les pointer sur
   la lecture dynamique de `bench.js` (`makeBot(null).brain.w.length`) ou les supprimer.
8. **#46 — off-by-one `--gens N`** : boucler `T.GEN<=TARGET_GEN` + autosave sur record battu.
9. **#37 — grainer les noms de champions + un seul rédacteur de `champion.json`**, puis #33 (constante
   `BRAIN_FILE`), #43 (commentaire EVAL_TRACKS), #30, #31, #23, #32, #29/#29b, #28/#26.

✅ **Fermés ce passage (49e) : #33/#34/#38 (persistance exercée de bout en bout — champion.json est un vrai
champion 324, plus un témoin).** L'entraînement tourne de nouveau sur le réseau à 15 entrées.

</details>