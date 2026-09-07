# CAR CRASH — Phase 0 : cartographie (lecture seule)

**Fichier analysé** : `index.html` — 10 806 lignes, 773 469 octets, `md5 936d3675e86b47cce1e8869870fa7982`
**Modifications effectuées** : aucune.
**Numéros de ligne** : ceux de ce fichier exact.

> ⚠ Le dossier du repo n'est pas connecté à cette session (aucun dossier partagé côté machine). J'ai travaillé sur le `index.html` que tu as joint. La branche `feature/survivant-vol` n'a donc **pas** été créée — voir « Ce qu'il me faut » en fin de rapport.

---

## 1. Vérification des 5 points du diagnostic

### Point 1 — « Voler ne rapporte aucun mètre au bot » → **CONFIRMÉ, mais pire que ça**

| Ligne | Code |
|---|---|
| 8782 | `if(!b.air){` — ouvre le bloc |
| 8791 | `}` — **ferme le bloc**. Il ne contient QUE la longitudinale |
| 8818 | `b.totD+=b.v*Math.cos(b.phi)*dt*SPD;` — **hors du garde**, s'exécute en vol |

Confirmé : `totD` avance le long de la route pendant le vol, exactement comme au sol. Aucun gain lié à la trajectoire.

**Ce que le diagnostic ne dit pas** : le garde `!b.air` (8782-8791) englobe l'accélération, la pente (`-GRAV*T[bi].y`), la **traînée** (`b.v*|b.v|*...`), le frottement `*(1-.03*dt)` et le frein moteur. En vol, tout ça est **suspendu** : `b.v` est gelé. Et la nitro, elle, n'est PAS gardée :

- 8792-8795 : `b.nT-=dt` … `if(nOn){b.v+=30*dt; …}` … `b.nitroR=Math.min(2,b.nitroR+.2*dt)`

Donc en l'air un bot : ne subit plus la traînée, ne subit plus la pente, **et peut continuer à prendre +30 m/s² de nitro**. Voler n'est pas neutre en distance, c'est un **micro-gain** (annulation de la traînée) — invisible à l'œil, mais c'est un chiffre que le harnais de la phase 1 doit sortir avant qu'on touche à quoi que ce soit. La conclusion stratégique du diagnostic (« du risque pur, décoratif ») reste juste : il n'y a **aucun** couplage entre la trajectoire et la distance.

### Point 2 — « Le bot ne prédit jamais son atterrissage » → **CONFIRMÉ**

- Décision de sauter : 8838-8851 (zone) / 8830-8833 (trou) / 8834-8835 (bord)
- Verdict : 8823-8828, uniquement quand `b.airH<=0`
  - 8825 : `if(Math.abs(b.lat)>ROAD_HALF){botBoom(b);continue;}`
  - 8826 : `if(rel>0&&rel<L&&holeAtS(rel)){botBoom(b);continue;}`

Aucun rollout, aucun test avant de commettre. Le bot découvre le verdict à la retombée. Confirmé sans réserve.

### Point 3 — « La décision de sauter est un tirage au sort » → **CONFIRMÉ, avec une condition amont importante**

Ligne 8843 : `if(Math.random()<.25+b.appJump*.6){`

Mais ce tirage est **conditionné** par trois gardes en amont :

- 8837 : `b.jumpCD-=dt; if(b.jumpCD<=0){` — cooldown de 1 à 2,6 s
- 8839-8841 : il faut une `jumpZone` enregistrée à moins de 8 unités de `b.totD`, et `zi!==b.zoneMark`

Donc ce n'est pas « un dé lancé n'importe où » : c'est **un dé lancé au-dessus d'un spot que TU as créé**. La conséquence pratique est plus dure que le diagnostic : s'il n'y a pas de zone, il n'y a **jamais** de saut volontaire. Les deux autres décollages (trou 8830, bord 8834) sont **subis**, pas décidés.

### Point 4 — « `SURV.jumpZones=[]` vidé à chaque `survStart` » → **CONFIRMÉ, et le problème est plus profond**

- 8637 : `SURV.jumpZones=[];` dans `survStart()`
- `survStart()` appelé depuis `resetGame()` (8390) et `start()` (8463)
- Enregistrement : 8712-8716, avec `dur>.4` et plafond `length<48`

**Trois trouvailles qui aggravent le tableau :**

1. **La monotonie de `totD` rend chaque zone à usage unique et à sens unique.** `z.d` est `pTot = SURV.pBase+s` (distance cumulée absolue) et `b.totD` est la même unité. Comme les deux croissent de façon monotone, un bot ne peut consommer une zone que s'il est **derrière** ton point de décollage au moment où tu l'enregistres. **Les bots en tête de toi ne verront JAMAIS aucune de tes zones.** Le mode ne peut donc pas apprendre à voler à ceux qui gagnent.
2. **La zone la plus utile arrive trop tard.** Elle n'est écrite qu'à la **retombée** (`mode!=='fall'&&SURV.pMode==='fall'`, 8713), donc au plus tôt après ton premier vol complet de la run.
3. **`SURV.pBase+=s` au portail (≈9385)** garde bien la cohérence entre `z.d` et `b.totD` — ce point-là est correct, rien à corriger.

Le harnais de la phase 1 doit sortir : nombre de zones, seconde d'apparition de la première, **et combien sont effectivement consommées** (probablement très peu, pour les raisons 1 et 2).

### Point 5 — « Le bloc direction n'est pas gardé par `if(!b.air)` » → **CONFIRMÉ**

Tout ce qui suit la ligne 8791 s'exécute en vol :

| Lignes | Ce qui tourne quand même en l'air |
|---|---|
| 8800-8806 | cible latérale, volant, inertie de volant |
| 8807 | `b.phi+=…*tc9*…*(1/(1+|b.v|*TURN_HS))*dt` — **braquage à l'adhérence sol** |
| 8808 | flaque d'huile : le bot chasse en plein vol |
| 8809-8813 | rétroaction de courbure de piste sur `b.phi` |
| 8817 | `b.lat+=b.v*Math.sin(b.phi)*dt*SPD` — **il se déplace latéralement en l'air** |

Conséquence concrète et testable : un bot éjecté par le **bord** (8834, déclenché par `|b.lat|>ROAD_HALF`) peut **rentrer latéralement sur la route pendant son vol** et se poser sain — alors que sa sortie de piste aurait dû le tuer. Et symétriquement, un bot correctement lancé peut se braquer hors piste en l'air. C'est un des deux gros mensonges physiques du bloc.

---

## 2. Écart de modèle joueur / bot, chiffré

C'est le second gros mensonge, et il n'est pas dans ton diagnostic — il faut le connaître **avant** la phase 3.

| | Joueur | Bot |
|---|---|---|
| Gravité | `fallVel.y-=FALL_G*dtF`, `FALL_G=33` (7823) | `b.vy-=26*dt` (8821) |
| Intégration position | `fallPos.addScaledVector(fallVel,dtF*SPD)` (9768) — **×SPD=0.5** | `b.airH+=b.vy*dt` (8821) — **pas de SPD** |
| Base de temps | `dtF = dt*AIR_RATE` (9660), `AIR_RATE∈[1,1.35]` (8166) | `dt` brut (temps réel ralenti par `slowT`) |

**Gravité effective en unités-monde** : joueur `33×0.5 = 16.5 u/s²`, bot `26 u/s²`. **La meute tombe 1,58× plus vite que toi.**

Exemple chiffré, un vol de 2 s :
- Joueur : `fallVel.y=33` → apex `33²/(2·33)·0.5 = 8,25 u`
- Bot : `vy=13·2=26` (formule 8845) → apex `26²/(2·26) = 13 u`

Le bot monte **1,6× plus haut** pour la même durée. C'est exactement ce que dit ta note « `vy` doit reproduire ma **trajectoire**, pas la durée de mon vol » — et voilà le facteur.

**Complication supplémentaire** : `z.dur` est mesuré en `SURV.t`, donc en **temps réel** (8714), tandis que `fallT` est du temps-sim. À `AIR_RATE=1.35`, un vol de 2 s-sim n'enregistre que `dur≈1,48`. Il y a donc **deux** facteurs d'échelle à démêler avant de recopier quoi que ce soit.

---

## 3. Dépendances de l'intégration du vol joueur (`loop()`, 9659-9919)

### Globales LUES

| Catégorie | Symboles |
|---|---|
| État de vol | `fallPos`, `fallVel`, `fallT`, `fallTR`, `yawAcc`, `airRoll`, `nitroAirT`, `flightId`, `bounceN`, `fallUnder`, `fallStartSide`, `gapArmed`, `spinHalf`, `airFlash` |
| Constantes | `FALL_G`, `SPD`, `AIR_MAX`, `AIR_ASSIST`, `AXIS_Y`, `PARK_VCAP`, `ROAD_HALF`, `THICK`, `L`, `NP` |
| Tempo | `AIR_RATE` (module-level `let`, 7826, écrit par `startFall` 8166), `dt` (**déjà mis à l'échelle par `slowT`/`hitT`, 9195-9196**) |
| Entrées | `steer`, `keys.KeyW/KeyZ/ArrowUp`, `dn` (local à `loop`, 9260), `nitroOn`, `nitroBlue` |
| Monde | `pts[]`, `T[]`, `Nn[]`, `B[]`, `holeAtI`, `holeAtS`, `trackMinY` |
| Mode | `PARK.on`, `pwrAirT`, `mode` |
| **Rendu lu par la physique** | **`carGroup.quaternion`** (9676, 9708, 9754) — voir couplage (A) |
| Temps partagés | `tmp`, `tmp2`, `tmp3`, `qTmp`, `qTmp2`, `mat4`, `dTmp` (9199-9200, 8200) |

### Globales ÉCRITES

`fallPos`, `fallVel`, `fallT`, `fallTR`, `nitroAirT`, `yawAcc`, `airRoll`, `speedKmh`, `carGroup.position`, `carGroup.quaternion`, `carGroup.scale`, `shadow.position`, `camera.*`, `camUp`, `landMark.*`, `chainVal`, `chainMult`, `dolphT`, `dolphGain`, `trkDolph`, `trkMeteor`, `dolShow`, `spinHalf`, `curNear`, `caseHot`, `heartT`, `airFlash`, `shake`, `slowT`, `mode`, `s`, `lat`, `side`, `psi`, `vA`, `vL`, `driftT`, `driveDir`, `money`, `levelCash`, `streak`, `rollover`, `runStats.*`, `sideCd`, `prevTvalid`, `lastNearY`, `lastNearH2`, `lastNearS`, `curHOff`, `curLatOff`, `boost`, `gapArmed`.

### Effets de bord

- **HUD** : `airPie` + `pieCtx` (9900-9917), `chainHud` (9798-9800), `caseHud` (9810-9818), `elTurn`, `landMark` (viseur)
- **Son** : `whoosh` (startFall), `bumpSfx`/`thud`/`noiseBurst` (tryLand), `rewardSfx`, `chimeNote`, `heartBeat`, `annSpeak`
- **Figures / chaîne** : `addTrick` (vrille 9775, météore 9776, dauphin 9797), `chainVal`/`chainMult`, `dolShow`, `serpShow`
- **Particules** : `spawnP` (flames, flameCore, embers, exSmoke, sparkBlue, sparkGold), `spawnStreak`, `trailPush`
- **`PARK`** : plafond de vitesse en vol (9767) et `parkRespawn()` au lieu de `explode()` (9919)
- **`AIR_RATE`** : multiplie le temps de vol partout où `dtF` apparaît (y compris dans `updateClouds`, 1576)
- **Nitro** : `nitroOn`/`nitroBlue` pilotent la poussée (9693) et l'autorité de tangage (1.7 vs 0.62 rad/s)
- **Caméra** : 9853-9869, entièrement dans le bloc

---

## 4. La frontière physique / habillage

**C'est ici que se joue la faisabilité de la phase 2.**

### Physique pure — extractible tel quel

| Lignes | Rôle |
|---|---|
| 9660 | `dtF = dt*AIR_RATE` |
| 9663 | gravité `fallVel.y -= FALL_G*dtF` |
| 9673-9682 | anti-blocage du lacet (rétablissement d'horizontale, vitesse totale conservée) |
| 9687-9688 | lacet `fallVel.applyAxisAngle(AXIS_Y, yawIn)` |
| 9691-9693 | poussée réacteur (`70` bleu / `52` normal) |
| 9699-9719 | tangage sous nitro (1.7 rad/s, clamp ±1.13) |
| 9748-9765 | tangage sans nitro (0.62 rad/s, même clamp) |
| 9767 | plafond `PARK_VCAP` |
| 9768 | intégration `fallPos += fallVel*dtF*SPD` |

### Habillage — reste sur place

Caméra (9853-9869), traits d'air (9819-9828), particules de réacteur (9720-9746), orientation visuelle + vrille `airRoll` (9829-9851), camembert d'airtime (9900-9917), HUD mallette/chaîne, figures et paiements (9771-9807), viseur `landMark` (9871-9899 **sauf 9894-9895**).

### Zone grise — à trancher

| Élément | Pourquoi c'est ambigu |
|---|---|
| `fallT` / `fallTR` | Ce sont des compteurs, mais ils **gouvernent des seuils physiques** dans `tryLand` (8252-8255 : `fallT>.35`, `fallT>.1`) et la mort par plafond d'airtime (9919). Ils doivent sortir de `flightStep`. |
| `yawAcc` | Purement compteur de figure, mais alimenté par la même intégration (`yawIn`). Sortie de `flightStep`, consommée par l'habillage. |
| **`AIR_ASSIST` (9894-9895)** | **De la physique cachée dans le code du viseur.** Voir couplage (B). |
| `airRoll` | Purement visuel (comment daté 9841-9847, tranché par toi). Ne touche pas à `fallVel`. **Reste dehors.** |

---

## 5. Les couplages qui rendent l'extraction risquée

### (A) `carGroup.quaternion` : le rendu nourrit la physique — **boucle fermée**

Trois fois (9676, 9708, 9754), l'anti-blocage lit l'orientation **rendue** de la caisse pour se rabattre sur « le nez de la caisse ». Or cette orientation est calculée en 9829-9851 **à partir de `fallVel`**, puis passée dans un `slerp(qTmp, dt*8)` (9851) — avec `dt`, pas `dtF`.

Conséquence : `carGroup.quaternion` est une **version retardée et lissée de `fallVel`**, et cette version retardée est réinjectée dans le calcul de `fallVel` à la frame suivante. Une `flightStep` réellement pure doit donc porter l'orientation du nez **dans son état**, et la faire évoluer avec le même slerp — sinon la preuve de non-régression échouera précisément dans les cas qui comptent (départs verticaux, plongeons de crête), c'est-à-dire là où le code a été réparé deux fois.

C'est le point le plus délicat de la phase 2, et il faudra le mesurer avant d'écrire une ligne.

### (B) `AIR_ASSIST` : de la physique dans le bloc d'affichage

```js
// 9894-9895, à l'intérieur de la boucle de prédiction du viseur landMark
const asF=AIR_ASSIST*THREE.MathUtils.clamp(fallVel.length()/60,.2,1.4);
fallVel.addScaledVector(B[bi],-l2*asF*dt*.5);
```

Cette ligne **modifie la vitesse de vol** et se trouve dans le code du viseur. Trois pièges :
- elle utilise `dt`, **pas** `dtF` — incohérent avec tout le reste du vol ;
- elle n'est atteinte que si la boucle de prédiction (14 pas de 0,12 s) trouve une dalle → **exécution conditionnelle et dépendante de la géométrie de la piste** ;
- elle est suivie d'un `break`, donc elle s'applique **au plus une fois par frame**.

**Décision requise (blocante pour la phase 2)** : est-ce que `flightStep` inclut l'assistance ? Si oui, elle doit recevoir le résultat de la prédiction en entrée (couplage lourd). Si non, `flightStep` n'est pas le modèle complet du joueur et les bots hériteront d'une physique légèrement différente de la tienne — ce qui contredit « même physique que moi, sans exception ». **Je m'arrête ici et je te demande.**

### (C) Trois autres écrivains de `fallVel` / `fallPos`, hors du bloc de vol

| Lieu | Ligne | Effet |
|---|---|---|
| `updateClouds` — surf de nuage | 1577-1582 | `fallVel.y+=7*k*dtF`, bruit sur x/z, `airRoll`, et **rend de l'airtime** (`fallT`, `fallTR`) |
| `tryLand` — BUMP | 8233-8236 | réflexion `-vB*1.65`, amortissement `×.78`, `+2.4` en y, **repositionnement de `fallPos`** |
| `heistFire` — relance | 8018 | `fallVel.y=Math.min(70, fallVel.y+34)` en plein vol |

**Ordre dans la frame** : vol (9659) → `tryLand` (9918) → `updateClouds` (10029) → `survTick` (10340). Le surf de nuage s'applique donc **après** le verdict d'atterrissage de la même frame. Toute rejouabilité déterministe devra fixer cet ordre.

### (D) `dt` n'est pas le temps réel

9195-9196 : `if(slowT>0){slowT-=dt;dt*=.45;}` puis `if(hitT>0){hitT-=dt;dt*=.04;}`. Le `dt` que voient le vol **et `survTick`** est déjà mis à l'échelle. Le harnais de la phase 1 devra distinguer temps-sim, temps ralenti et temps mur, sinon les chiffres de la ligne de base seront ininterprétables.

### (E) Temps partagés

`tmp`/`tmp2`/`tmp3`/`qTmp`/`qTmp2`/`mat4` (9199-9200) sont réutilisés par le vol, la caméra, les particules et le viseur, dans cet ordre. `flightStep` devra avoir **ses propres** temporaires au niveau module (budget : zéro alloc, 7 bots + le joueur).

---

## 6. Sondes de debug existantes (format à suivre)

| Sonde | Ligne | Ce qu'elle rend |
|---|---|---|
| `window.dbgState()` | 4058-4062 | dump d'état interne, dont `fallT`, `fvy`, `fspd`, `gapArmed`, `hOff`, `latOff`, `dolphT`, `chainVal` |
| `window.dbgStep(n,ms)` | 4086 | avance `n` frames de `ms`, renvoie `dbgState()` — **la brique du rejeu déterministe de la phase 2** |
| `window.dbgTakeoff()` | 6656 | appelle `heistFire()` → décollage vertical `+42/min 36`, renvoie `{avant,apres,vy,slowT,fever}` |
| `window.dbgGap(go)` | 4065 | scénario de gap |
| `window.dbgPin(on)` | 4110 | fige résolution et paliers perf |

`dbgTakeoff` + `dbgStep` donnent déjà le squelette du rejeu déterministe. **Mais** : `heistFire` ne fixe pas de graine, et `startFall` lit `vA`, `lat`, `side`, `s`, `driveDir` — un rejeu vraiment reproductible demandera de figer ces cinq valeurs. À prévoir en phase 1.

---

## 7. Verdict de faisabilité pour la phase 2

**Faisable**, avec une réserve nette :

- Le cœur (gravité, lacet, tangage, poussée, plafond parc, intégration) est **franchement séparable** : ~50 lignes contiguës, entrées identifiables, aucune écriture DOM.
- Le diff hors bloc SURVIVANT sera concentré sur **9659-9768** (remplacement par un appel) + l'ajout de la fonction. C'est une surface de conflit réduite et annonçable à l'équipe.
- **Les deux vraies difficultés sont (A) et (B)** — la boucle rendu→physique via `carGroup.quaternion`, et l'assistance d'atterrissage cachée dans le viseur. Ni l'une ni l'autre n'est insurmontable, mais toutes les deux changent la **signature** de `flightStep`. Il faut les trancher avant d'écrire quoi que ce soit.

---

## 8. Ce qui reste incertain

1. **Fréquence réelle d'usage des `jumpZones`** — la lecture du code suggère « quasi jamais » (§1 point 4), mais c'est une hypothèse. À mesurer en phase 1, pas à croire.
2. **Impact chiffré de l'absence de traînée en vol** sur `totD` — probablement petit, à quantifier.
3. **Coût du rollout balistique** (phase 3) : 7 bots × N pas de simulation. Non estimé faute de mesure de la frame actuelle. `dbgPerf()` (4093) donne le budget disponible.
4. **`dur>.4` (8714)** filtre-t-il beaucoup de tes vols courts ? Inconnu.
5. Je n'ai **pas** audité `frameAt` (2267), `holeAtS`/`holeAtI` (1170/1174) au-delà de leur signature — ils sont lus, jamais écrits par le vol.

---

## 9. Ce qu'il me faut pour passer en phase 1

1. **Ta validation** de ce rapport.
2. **Une décision sur (B)** : `AIR_ASSIST` dans ou hors de `flightStep` ?
3. **Le dossier du repo connecté** à la session (bouton « Ajouter un dossier » de l'app), pour que je puisse créer `feature/survivant-vol` et committer par phase. Sans ça je ne peux te rendre que des fichiers isolés.
