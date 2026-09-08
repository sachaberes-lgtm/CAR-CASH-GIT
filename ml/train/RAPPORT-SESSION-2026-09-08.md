# RAPPORT DE SESSION — 2026-09-08
### CASH CAR · mode entraînement · destiné à une relecture critique

> Écrit par Claude Code à la demande de Sacha, pour audit par une autre IA.
> **Consigne au relecteur :** tout ce qui est présenté comme un fait ici a été mesuré, et la commande
> pour le reproduire est donnée. Tout ce qui est une hypothèse est marqué comme telle. Les erreurs
> commises pendant la session sont listées en §6 — elles font partie du rapport, pas d'une annexe.

---

## 1. Point de départ

Le mode entraînement (`ml/train/train.html?train=1`) fait évoluer 24 voitures par neuroévolution
(MLP maison, pas de librairie). Au début de la session :

- la physique des bots était une **copie** de celle du joueur (`TRAIN.groundPhysics`, `airPhysics`,
  `startFallBot`, `tryLandBot`, `obstacles`). 3 passes de correction et 2 agents critiques n'avaient
  pas réussi à faire tenir les deux versions ensemble ;
- ~90 % des bots mouraient en « airtime » en 2 s ; le fitness était plat ;
- les runs n'étaient pas reproductibles (pas de temps variable + `Math.random` partout).

---

## 2. Ce qui a été fait, dans l'ordre

### 2.1 Physique unique (mandat 1) — **terminé et vérifié**

`stepCar(car, input, dt, world)` devient l'unique moteur physique. Les cinq fonctions de copie du
mode entraînement sont **supprimées**. Le joueur l'appelle via `PCAR` + `pcarPush`/`pcarPull` ; les
bots via `TRAIN.botStep`. La physique n'a plus d'effets de bord : elle émet des **événements**
(`land`, `bump`, `ramp`, `cone`, `boom`, `portal`…) que l'appelant transforme en son/argent/affichage.

Chaque caisse porte ses temporaires privés (`_F`, `_a.._d`, `_m4`, `_q`) : plus un seul `tmp2`/`tmp3`
global dans la physique — c'était la source de la moitié des divergences.

**Preuve :** `node check-iso.js` → **écart max 0.000e+0** sur position, vitesse, cap, vol ET la
séquence d'événements, sur 3000 pas rejoués par les deux chemins.

Corrigé au passage (divergences que les agents critiques traquaient) : `momT` au décollage, le nez de
l'anti-blocage aérien, `v` gelé en vol, l'assistance d'atterrissage et l'anti-idle que les bots
n'avaient jamais subis.

### 2.2 Déterminisme (mandat 1) — **terminé et vérifié**

Pas de temps **fixe** (accumulateur, sous-pas 1/60 s) + tout l'aléa du mode train semé
(`TRAIN.rnd` mulberry32, `MLP.rnd` comme robinet remplaçable — architecture et taux inchangés).

**Preuve :** deux exécutions de `node sim-train.js` donnent une sortie identique au caractère près, et
le **navigateur sort exactement les mêmes lignes que le headless** :

```
TRAIN gen 1 best 49  record 49  | morts : idle 3, airtime 21
TRAIN gen 2 best 53  record 53  | morts : airtime 24
TRAIN gen 3 best 307 record 307 | morts : airtime 22, idle 2
TRAIN gen 4 best 315 record 315 | morts : airtime 24
```

### 2.3 Clonage comportemental (mandat 2) — **outillage terminé, résultat mitigé**

- `?rec=1` : à chaque pas de physique, on note les entrées du cerveau + les 4 commandes réelles du
  joueur. Hors `?rec=1`, rien ne s'exécute.
- `rec-server.js` + `ENREGISTRER.bat` : la démo atterrit toute seule dans `results/demos/`.
- `clone.js` : rétropropagation en JS pur (tanh, erreur quadratique, mini-lots + momentum), coupe
  80/20. **Validé sur une règle synthétique connue** : erreur de validation 0,0089, décisions
  identiques à 100 % (volant, gaz) et 99 % (nitro).
- `TRAIN.newGen` : la génération 0 devient le cerveau cloné + 23 variantes mutées. `?clone=0` /
  `--random` reviennent au hasard.
- `bench-clone.js`, `VERIFIER.bat` (il n'existait pas), `xp-openloop.js`.

### 2.4 Changements de représentation et de récompense — **faits, effet non démontré**

- **Entrées 12 → 15** : ajout de `psi` (cap relatif à la route) et de deux courbures plus lointaines
  (120 m, 300 m). Motif : sur la 1re démo, aucune des 12 entrées ne corrélait avec le volant
  (meilleure = 0,123 ; position latérale = **0,005**).
- **Fitness réécrite** : progression + contrôle (mètres pondérés par le centrage) − pénalité de
  sortie de route + bonus d'arrivée. L'ancienne (`totD + 150·goodCuts`) reste rejouable via
  `W_CTRL=0, W_OUT=0, W_CUT=150` — c'est ce qui a permis l'A/B.

---

## 3. Mesures principales (toutes reproductibles)

### 3.1 L'amorçage par clonage — bilan honnête

Référence, graines 1-8, 30 générations (`node bench-clone.js --gens 30`) :

| | aléatoire | cloné (1re démo) |
|---|---|---|
| meilleur | 2857 | 3663 |
| médiane des best | 1917 | 2300 |
| médiane par génération | 554 | 593 |
| **% morts en airtime** | 96,0 % | **98,9 %** |

⚠ **Le « % de morts en airtime » est une métrique invalide** et c'est moi qui l'avais proposée comme
critère décisif. C'est un **ratio de composition** : le clone a supprimé les morts par immobilité
(232 → 64), donc la part de l'airtime **monte mécaniquement**. Dans les deux cas, 720 morts sur 720
bots : aucune génération n'atteint la fin des 45 s.

### 3.2 L'idée « pas besoin de cerveau » (proposée par Sacha) — testée

`node xp-openloop.js --gens 40` — recette de commandes en boucle ouverte contre le MLP, même piste,
même budget, sélection par élimination des 12 plus nulles :

```
        gen 1   gen 5   gen 10  gen 20  gen 40
RECETTE     550    550    550    678     729
CERVEAU      49   1035   1452   2305    2456
```

Puis, **sur une piste jamais vue** :

```
RECETTE  : apprise  729 -> inconnue 111   (15 % de sa performance)
CERVEAU  : apprise 2456 -> inconnue  38   ( 2 % !)
```

**Conclusion : la boucle fermée gagne 3,4×, MAIS le réseau ne conduit pas — il récite la piste.**
Et `newTrack` régénère la piste toutes les 5 générations : la mémorisation est jetée avant de servir.
**C'est un défaut du protocole d'évaluation, pas du cerveau ni de la récompense.**
→ Correctif recommandé, non appliqué : **noter chaque voiture sur plusieurs pistes**.

### 3.3 « Les voitures volent sans nitro » (observation de Sacha) — vérifiée

Chute libre, une frame, commandes neutres : **bot −0,550000 m/s · joueur −0,550000 m/s · écart 0**.
La gravité est identique. Le mécanisme réel est `carPitch`, qui **fait tourner le vecteur vitesse** en
conservant sa norme :

```
3 s à 120 m/s, assiette CABRÉE : +70 m d'altitude, vitesse 120 -> 73 m/s
3 s à 120 m/s, assiette neutre :   0 m,            vitesse 120 -> 156 m/s
```

**Déséquilibre réel trouvé, non corrigé :** le clavier du joueur **couple gaz et assiette**
(`pitch = (ArrowUp?-1:0) + (ArrowDown?1:0)`) — tenir le gaz en vol = piqué permanent. Le bot a
**4 canaux indépendants** et peut tenir le cabré à fond sans rien sacrifier. Même physique, commande
que le joueur n'a pas. **Décision en attente de Sacha.**

### 3.4 « Elles se jettent dans le vide sur une ligne droite » (observation de Sacha) — vérifiée

**100 % des décollages se font PAR LE BORD** (aucun tremplin, aucun trou), dans les deux modes.

Et le cerveau cloné sur la 1re démo commandait le volant **vers l'extérieur** à presque toutes les
positions (lat +8 → volant +0,684). Cause mesurée dans la démo elle-même : corrélation
position latérale ↔ volant = **0,005**, et à lat ≈ +11 le volant moyen de Sacha était **+0,282**
(il sortait volontairement pour sauter — **parce que je le lui avais demandé**, voir §6).

### 3.5 Deuxième démo (conduite propre) — nette amélioration

| | 1re démo | 2e démo |
|---|---|---|
| format | 12 entrées | 15 |
| pas | 8316 (139 s) | 6500 (108 s) |
| en vol | 46,5 % | 24 % |
| **lat → volant** | **0,005** | **−0,162** |
| **psi → volant** | — | **−0,137** |
| courbure 120 → volant | — | 0,269 |

Cerveau entraîné dessus (`node clone.js --epochs 2000`) : validation 0,186 ; décisions identiques à
Sacha : **volant 93,0 %, gaz 94,0 %, nitro 86,5 %**.

Réponse **isolée** du contrôleur (moyennée sur 60 points de piste pour retirer la courbure locale) :

```
lat  +4 -> -0,230 | +8 -> -0,546 | +12 -> -0,820      (ramène au centre, proportionnel)
lat  -4 -> +0,084 | -8 -> -0,020 | -12 -> -0,051      (faible, côté gauche mal appris)
psi -0,8 -> +0,372 | -0,4 -> +0,203 | +0,4 -> -0,244 | +0,8 -> -0,633   (contre-braquage correct 4/4)
```

### 3.6 « Elles roulent trop lentement » (observation de Sacha) — vérifiée

Sortie moyenne du canal gaz en course : **+0,374**. Or la physique lit `up = input.gas > 0.5`.
**Sous le seuil → roue libre → frein moteur** (`v *= 1-0.4·dt`).

Même cerveau, on ne change que le seuil :

| seuil | vitesse moyenne | distance max |
|---|---|---|
| `gas > 0.5` (actuel) | 83 / 112 km/h | 1746 / 1900 |
| `gas > -0.5` | **105 / 134 km/h** | 1633 / 1887 |

**La vitesse monte, la distance NON.** La lenteur est un symptôme réel mais ce n'est pas le mur.

### 3.7 LA CAUSE RACINE — santé des entrées

`node -e` sur la 2e démo, 6500 pas. Un relecteur devrait commencer par ici.

| # | entrée | saturée \|x\|>0,99 | écart-type | verdict |
|---|---|---|---|---|
| 0 | vitesse | **93 %** | 0,143 | **aveugle** |
| 1 | lat | 26 % | 0,584 | ok |
| 2 | courbure 40 m | 72 % | 0,845 | saturée |
| 3 | trou devant | **100 %** | **0,000** | **constante morte** |
| 4 | croisement dist. | 99 % | 0,135 | saturée |
| 5 | croisement dy | 99 % à zéro | 0,035 | **morte** |
| 6 | croisement gain | 99 % | 0,216 | saturée |
| 7 | nitroR | 14 % | 0,360 | ok |
| 8 | en vol | — | 0,427 | ok |
| 9 | hauteur | 15 % | 0,377 | ok (vol seulement) |
| 10 | vy (vol) | 22 % | 0,446 | ok (vol seulement) |
| 11 | vy | 74 % | 0,648 | saturée |
| 12 | **CAP psi** | **0 %** | 0,228 | **la plus saine** |
| 13 | courbure 120 m | 77 % | 0,902 | saturée |
| 14 | courbure 300 m | 63 % | 0,839 | saturée |

**8 entrées sur 15 sont saturées ou mortes. Seules 4 portent réellement de l'information.**

Échelles fautives identifiées : `v/80` alors que la médiane de Sacha est **243 km/h** (soit 135 m/s,
donc 1,7× le plafond) ; `courbure × 300` qui sature aux trois quarts ; `1 − trouD/200` qui vaut −4 en
l'absence de trou et se fait écraser à −1 en permanence.

**Hypothèse (non encore démontrée) :** c'est ce qui explique en cascade les corrélations à ~0,1, la
saturation des sorties, le plafond du clonage et l'immobilisme de l'évolution. Aucune récompense ni
architecture ne compense une observation majoritairement constante. **À vérifier en re-normalisant.**

---

## 4. État des fichiers

| fichier | état |
|---|---|
| `train.html` | modifié (physique unique, `?rec=1`, 15 entrées, fitness, amorçage) — **syntaxe OK, check-iso vert** |
| `check-iso.js` | **neuf** — harnais d'isomorphisme, 0.000e+0 |
| `sim-env.js` | **neuf** — environnement headless partagé |
| `sim-train.js` | modifié — `--seed`, `--random`, charge le cerveau cloné |
| `clone.js` | **neuf** — rétropropagation JS pur |
| `bench-clone.js` | **neuf** — comparaison aléatoire vs cloné |
| `xp-openloop.js` | **neuf** — test de l'idée « pas de cerveau » |
| `rec-server.js`, `ENREGISTRER.bat`, `VERIFIER.bat` | **neufs** |
| `results/demos/` | 2e démo (15 entrées, avec état brut) |
| `results/archive-12-entrees/` | 1re démo archivée |
| `demo/cash-car-demo/`, `survTick` | **jamais touchés** (interdits) |

Commits poussés sur `main` : `c7d7884` (physique unique), `99c3e92` (clonage), `4915467` (clone.js).
Les changements des §2.4 et suivants **ne sont pas encore commités**.

---

## 5. Ce qui n'a PAS été fait

- Le correctif du **protocole d'évaluation** (noter sur plusieurs pistes) — identifié §3.2, non appliqué.
- La **re-normalisation des entrées** — identifiée §3.7, non appliquée. **C'est la priorité.**
- Le **portage du pilote de la démo** (`survTick`) comme contrôleur au sol — proposé par Sacha,
  vérifié comme réutilisable (sa physique au sol est déjà celle du joueur, son volant est
  `phiT = clamp(Δlat/(max(6,v·SPD)·0,9), ±0,62)` puis `st = clamp((phiT−psi)·4, ±1)`), non fait.
- Le **gymnase aérien** (spawn en l'air, dalle à atteindre, épisodes de 3 s) — conçu avec Sacha, non fait.
- L'**exécution multi-cœurs** (12 cœurs, 1 utilisé) — identifiée, non faite.
- Les **profils multiples** (24 parties jouées différemment) — proposés par Sacha, non faits.

---

## 6. MES ERREURS (à charge)

1. **J'ai décrit un écran que je ne voyais pas.** Mon panneau d'aperçu était gelé (`document.hidden`
   met la simulation en pause) et j'ai quand même affirmé à Sacha ce qu'il allait voir
   (« elles tiennent la route »). C'est la faute la plus grave de la session.
2. **J'ai sur-interprété une capture d'écran.** J'ai conclu « elles sont toutes identiques » et
   « elles ne conduisent pas, elles planent » ; la mesure a réfuté les deux (écart-type/moyenne des
   distances = 0,98 ; 76 % de la distance est roulée au sol).
3. **Mauvais brief d'enregistrement.** J'ai demandé à Sacha de sortir de la route exprès pour sauter.
   Résultat : 46 % de vol, volant moyen **+0,282** à lat ≈ +11, et un clone qui poussait vers le fossé
   partout. J'ai fabriqué le défaut que j'ai ensuite diagnostiqué.
4. **J'ai lu une entrée plafonnée comme une mesure physique.** J'ai annoncé « Sacha roule à 140 km/h,
   pointe 144 » en lisant `arr[0] = clamp(v/80)`. Sa vitesse réelle est **243 km/h de médiane, 459 de
   pointe**. C'est Sacha qui a repéré l'erreur.
5. **J'ai proposé une métrique décisive invalide** (« % de morts en airtime ») sans voir que c'était un
   ratio de composition qui ne peut que monter quand les autres causes disparaissent.
6. **J'ai deviné avant de mesurer, au moins trois fois** (la gravité, la diversité, la vitesse de
   naissance comme cause de la lenteur — les trois réfutées par la mesure suivante).
7. **J'avais la preuve de la cause racine dès le début et j'ai retenu la moitié.** J'ai mesuré que les
   12 entrées corrélaient toutes à ~0 avec le volant, et j'en ai conclu « il manque `psi` ». La bonne
   conclusion était « ces entrées sont plates ». `psi` était nécessaire, mais très insuffisant.
8. **Sacha a trouvé plusieurs problèmes avant moi** : le vol sans nitro, la sortie de route sur ligne
   droite, la lenteur, l'absence de diversité, la vitesse mal mesurée. Dans chaque cas la mesure lui a
   donné raison.

---

## 7. Ce que je recommande, dans cet ordre

1. **Re-normaliser les 15 entrées** d'après les distributions réelles, supprimer les 3 entrées mortes,
   et **stocker les valeurs brutes non plafonnées** dans les démos pour qu'un futur changement
   d'échelle ne coûte plus de partie. *(1 session de jeu supplémentaire nécessaire — la courbure est
   déjà écrasée dans la démo actuelle.)*
2. **Vérifier immédiatement l'effet** : refaire §3.5 et §3.6 après re-normalisation. Si les
   corrélations et la vitesse ne montent pas, l'hypothèse §3.7 est fausse et il faut chercher ailleurs.
3. **Noter chaque voiture sur plusieurs pistes** (§3.2) — sinon on continue d'entraîner de la récitation.
4. **Porter le pilote de la démo** comme contrôleur au sol (§5), et réduire l'apprentissage au vol.
5. **Multi-cœurs** (×8 d'expérience à temps égal).
6. Ensuite seulement : les profils multiples, le gymnase aérien, PPO/CMA-ES.

### Questions ouvertes pour le relecteur

- Le **couplage gaz/assiette** (§3.3) : faut-il le reproduire côté bot, ou découpler le clavier du
  joueur ? Aujourd'hui les bots ont une commande que le joueur n'a pas.
- Le **canal gaz** est une décision oui/non apprise par régression (§3.6). Faut-il l'apprendre comme
  une classification, ou changer le seuil côté physique ?
- Ordre de grandeur : les agents CarRacing de référence sont entraînés sur **1 à 5 millions de pas**.
  Ici une génération = 65 000 pas, sur 1 cœur. Le budget est-il seulement suffisant, même tout réparé ?
