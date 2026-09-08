# PASSAGE DE RELAIS — mode entraînement CASH CAR
### À lire en entier avant de toucher une ligne. Écrit le 2026-09-08.

> Ce document est fait pour qu'un agent qui n'a jamais vu ce projet puisse travailler dessus sans
> refaire les erreurs qui ont coûté une journée. Il remplace toute connaissance orale.
> L'historique détaillé est dans `RAPPORT-SESSION-2026-09-08.md`. Ici : **comment travailler**.

---

## 1. Ce que c'est, en dix lignes

`ml/train/train.html` est le jeu CASH CAR (Three.js, un seul fichier) + un mode entraînement.
Avec `?train=1`, 24 voitures pilotées par un petit réseau de neurones (MLP 11→16→4, écrit à la main,
**aucune librairie**) évoluent par neuroévolution. Avec `?rec=1`, le jeu enregistre les parties du
joueur pour en cloner le pilotage.

**L'invariant fondateur : le joueur et les bots exécutent LA MÊME physique.** Une seule fonction,
`stepCar(car, input, dt, world)`. Il n'existe aucune copie. C'est vérifié mécaniquement, au bit près.

**L'objectif du jeu, dit par le propriétaire :** *« leur but est juste de franchir la ligne d'arrivée
le plus vite possible et je veux qu'elles apprennent à contrôler leur corps pour y arriver. »*

---

## 2. LA RÈGLE DE MÉTHODE (celle qui a manqué)

**Rien n'est vrai tant que ce n'est pas mesuré.** Au cours de la session du 2026-09-08, l'agent
précédent a affirmé six choses par déduction : les six étaient fausses, et c'est le propriétaire —
non-développeur, qui regardait simplement son écran — qui les a réfutées à chaque fois.

Concrètement :
- **Ne jamais décrire ce qui se passe à l'écran sans l'avoir vu.** Le panneau d'aperçu se gèle
  (`document.hidden` met la simulation en pause). Si tu ne peux pas voir : **dis que tu ne peux pas
  voir**. C'est pour ça que `check-live.js` existe.
- **Ne jamais lire une entrée normalisée comme une mesure physique.** Elles sont plafonnées.
  Utilise l'état brut (`etat` dans les démos). Une affirmation « le joueur roule à 144 km/h » lue sur
  `clamp(v/80)` était fausse d'un facteur 1,7 : il roule à 243.
- **Ne jamais sonder le réseau avec un état fabriqué à la main.** Il se comporte autrement en
  situation. Mesure en course.
- **Attention aux ratios de composition.** « % de morts en airtime » monte quand les autres causes
  de mort disparaissent : ça ressemble à une régression alors que c'est un progrès. Mesure des taux,
  pas des parts.
- **Une métrique structurellement nulle passe « au vert » sans rien signaler.** Le 2026-09-08,
  l'agent a lu `b.goodCuts` après le dernier `newGen()` : `startEval()` appelle `resetBot()` à chaque
  manche, donc ce compteur ne peut renvoyer que 0. C'est la même famille d'erreur que le ratio de
  composition. **Avant de conclure sur un chiffre, vérifier qu'il peut prendre une autre valeur.**
  Correctif : `TRAIN.airStats` (décollages/atterrissages/bonnes coupes) est un compteur GLOBAL
  accumulé par `botStep`, jamais remis à zéro par le cycle de vie des bots. Le taux d'atterrissage =
  `landings/takeoffs` est LA métrique de santé de la voltige (mesuré : MLP pur ~9 %, pilote+coupe
  ~24 %).

---

## 3. LES INVARIANTS, ET COMMENT LES VÉRIFIER

`VERIFIER.bat` (double-clic) enchaîne tout et finit par ouvrir le jeu. En détail :

| commande | ce qu'elle garantit | verdict attendu |
|---|---|---|
| `node check-syntax.js` | le gros script parse | `OK syntaxe JS` |
| `node check-iso.js` | joueur et bots = même physique | **`écart max 0.000e+0`** |
| `node check-actions.js` | le bot ne peut pas produire une commande inhumaine | **`PASS`**, 24 états |
| `node sim-train.js` | l'entraînement tourne, déterministe | `SIM TRAIN OK` |
| `node check-eval.js` | chaque voiture est notée sur N pistes distinctes, en moyenne | **`PASS`** |
| `node clone.js` | entraîne un cerveau sur `results/demos/` | passe son tour s'il n'y a rien |
| `node check-live.js` | **les trois chiffres que le propriétaire regarde** | voir §6 |

**Si `check-iso.js` n'est pas à 0.000e+0, arrête tout et répare.** C'est l'invariant le plus cher du
projet : trois passes de correction et deux agents critiques avaient échoué à le tenir avant qu'on
supprime la copie de physique.

Le navigateur et le headless donnent **exactement les mêmes lignes** sur la même graine. Si ce n'est
plus le cas, quelque chose a introduit de l'aléa non semé.

---

## 4. INTERDITS

- **`demo/cash-car-demo/index.html`** — c'est la démo déployée sur Vercel. Jamais.
- **`survTick` (~l. 9900-10150 de train.html)** — la meute du mode Survivant. Elle a sa propre
  physique simplifiée, **c'est voulu**, ce n'est pas une copie à supprimer.
  ⚠ En revanche son **pilote** est une mine : son volant est
  `phiT = clamp(Δlat/(max(6,v·SPD)·0,9), ±0,62)` puis `st = clamp((phiT−psi)·4, ±1)`, et sa physique
  au sol est déjà celle du joueur. Le propriétaire a proposé de le porter comme contrôleur au sol —
  bonne idée, non faite.
- **`stepCar` et tout ce qu'il appelle** — sauf mandat explicite, et alors `check-iso.js` doit
  rester vert.
- **`ml/train/results/demos/`** — ⚠ **CE DOSSIER A DÉJÀ ÉTÉ DÉTRUIT UNE FOIS**, le 2026-09-08 à
  12h18, par un ménage de fichiers non suivis (commit `a38cb91`). Deux sessions de jeu perdues.
  Ce sont les **seules données que le projet ne sait pas régénérer** : un cerveau se ré-entraîne,
  une piste se reconstruit depuis sa graine, une partie jouée ne revient jamais. Elles sont
  désormais **versionnées dans git** exprès. Ne les remets pas dans `.gitignore`.

---

## 5. LES PIÈGES TECHNIQUES

- `rg` / `search_files` **échouent** sur ce chemin. Utiliser
  `cd ~/Documents/GitHub/CAR-CASH-GIT/ml/train && grep -n "motif" train.html`.
- `node` veut des chemins Windows natifs (`C:\Users\...`), pas `/c/Users/...`.
- **`train.html` est en CRLF.** Un script qui le réécrit doit le rendre en CRLF, sinon les ancres de
  recherche suivantes échouent.
- Le `<script>` principal est celui qui contient `survTick` **ET** `buildTrack` (pas le premier).
- `window.__TRAIN` et `window.__ISO` ne sont exposés qu'avec **`?sim=1`** dans l'URL. `__ISO` est ce
  qui rend `check-iso.js` possible : ne pas le retirer.
- Constantes : `FALL_G=33`, `SPD=0.5`, `ROAD_HALF=14`, `THICK=2.6`, `GRAV=9.8*.55`, `AIR_MAX=6`,
  `AIR_ASSIST=1.0`, `TURN_HS=.0035`.
- Commentaires **en français**, style compact, voix du projet (imagée, précise).

---

## 6. L'ÉTAT EXACT AU MOMENT DU RELAIS

**Ce qui est fait et vérifié**
- physique unique (`stepCar`), `check-iso.js` = 0.000e+0
- pas de temps fixe + tout l'aléa semé → navigateur == headless
- espace d'action du bot = celui du joueur (état de touches, gaz/assiette couplés), `check-actions.js` PASS
- entrées re-normalisées sur les percentiles mesurés : **10 sur 11 dans la cible**
- démos rejouables : graine de piste **par frame** + état brut ; `clone.js` **recalcule** les entrées
  au lieu de les relire → un futur changement d'échelle ne coûte plus une session de jeu

**Le point de départ à battre** (départ aléatoire, `node check-live.js`) :

| | graine 3 | graine 5 |
|---|---|---|
| vitesse moyenne | 26 km/h | 24 km/h |
| écart-type des positions à t=2 s | 22,1 m | 16,0 m |
| sur la route à t=5 s | 29 % | 46 % |

*Repère : le propriétaire, en jouant, roule à **243 km/h de médiane**.*

**LA RÈGLE DE SÉLECTION, telle que le propriétaire la veut** (tranché le 2026-09-08)
> *« mettre les voitures avec la même physique et les mêmes règles que le joueur, les mêmes
> contrôles, et après chacune se démerde pour faire la meilleure course, et la moitié la plus nulle
> se fait remplacer. »*

C'est implémenté : on classe, **la moitié haute garde son cerveau INTACT**, la moitié basse est
remplacée par des enfants des survivantes (croisement + mutation 0,12 / 0,18).

**LA RÉCITATION, mesurée et tranchée le 2026-09-08**

Le protocole qui notait chaque voiture sur UNE piste réutilisée 5 générations fabriquait de la
récitation (champion 2456 sur sa piste, 38 sur une inconnue). Deux correctifs ont été testés :

1. **Piste neuve à chaque génération** (suppression du `genSinceTrack>=5`) — une piste n'est jamais
   vue deux fois, donc personne ne peut la mémoriser. **C'est LE correctif, il est en place.**
2. **Noter sur plusieurs pistes et moyenner** (`EVAL_TRACKS`) — testé (`xp-generalisation.js`),
   **mesuré NÉGATIF** : moyennant 3 pistes, la sélection ne se fait plus qu'une fois toutes les 3
   manches (= 3× moins d'étapes d'évolution), et sur pistes fraîches le multi-piste est SOUS le
   mono-piste (seed 3 : 1535 vs 2054 m ; seed 7 : 658 vs 1934 m). **Défaut ramené à 1**
   (= sélection à chaque manche). L'option `?tracks=N` reste, pour reproduire l'A/B.

`check-eval.js` (voir §3) vérifie que l'option multi-piste, si activée, est correcte (pistes
distinctes + moyenne exacte). Le « point de départ à battre » de `check-live.js` ne change PAS :
il mesure la génération 0 aléatoire, en amont de la sélection.

⚠ **LE CLONAGE COMPORTEMENTAL EST ABANDONNÉ.** Le propriétaire ne veut pas de démonstrations : il
veut que chacune se débrouille. `results/demos/`, `clone.js`, `ENREGISTRER.bat` et `rec-server.js`
restent dans le dépôt et fonctionnent, mais **ne sont plus sur le chemin principal**. Ne pas
redemander de session de jeu sans son accord explicite.

**ÇA MARCHE : l'évolution pure apprend.** 25 générations, départ aléatoire, distance du meilleur :

| | gén. 1 | gén. 5 | gén. 10 | gén. 15 | gén. 20 | gén. 25 |
|---|---|---|---|---|---|---|
| graine 3 | 1733 | 1726 | **220** | 1587 | 2744 | 2815 |
| graine 5 | 364 | 235 | 653 | 672 | 641 | 620 |
| graine 7 | 64 | 493 | 1694 | 2669 | 3531 | **3711** |

⚠ **L'effondrement de la graine 3 à la génération 10 est le problème n°1.** `newTrack` régénère la
piste toutes les 5 générations : la population avait mémorisé ce parcours, on le lui retire, tout est
à refaire. C'est la preuve directe, dans les chiffres de l'entraînement lui-même, du problème décrit
au §7.1. **C'est là qu'il faut travailler en priorité.**

---

## 7. CE QU'IL RESTE À FAIRE, PAR EFFET DÉCROISSANT

1. ~~**Le protocole d'évaluation fabrique de la récitation.**~~ **RÉSOLU le 2026-09-08** : la piste
   est régénérée à CHAQUE génération (plus de `genSinceTrack>=5`), aucun parcours n'est vu deux
   fois. Le multi-piste « moyenner sur N pistes » a été TESTÉ et mesuré NÉGATIF (§6) : la sélection
   à chaque manche l'emporte, `EVAL_TRACKS` est ramené à 1.
2. ~~**12 cœurs, un seul utilisé.**~~ **FAIT le 2026-09-08** : `multi-train.js` répartit N graines
   sur N cœurs (`node multi-train.js --seeds 8 --gens 25`), chacune = une évolution indépendante.
   `sim-train.js` accepte `--gens N` et expose une courbe d'apprentissage. **Mesuré** : 8 graines
   × 25 générations = 102 s de mur, contre ~54 s pour une graine seule en série (8× = 432 s).
   Gain réel **~4×**, plafonné par la contention mémoire (8 process flottants lourds sur 12 cœurs
   logiques), pas par le code.
3. ~~**Le détecteur de raccourci ne se déclenche jamais** (0 % en course).~~ **FAIT le 2026-09-08**
   (commit `7b0d76c`) : le filtre est passé sur le GAIN NET (distance le long de la piste − distance
   3D) au lieu d'une fenêtre absolue obsolète → mesuré **0 % → 67 % actif**. Viseur d'atterrissage
   exposé (arr[8]=dalle visée, arr[9]=décalage latéral) et récompense de coupe PROPORTIONNELLE au
   gain net (W_CUT=3, +8 % de distance médiane mesuré).
4. **Porter le pilote de `survTick` comme contrôleur au sol** (idée du propriétaire).
   ✅ PILOTE AU SOL FAIT le 2026-09-08 : `TRAIN.groundPilot` (point de corde + volant du Survivant,
   `phiT=clamp(Δlat/(max(6,v·SPD)·0,9),±0,62)` puis `st=clamp((phiT−psi)·4,±1)`) produit les 4
   commandes discrètes AU SOL ; `?auto=1` / `--auto` l'active, le MLP ne garde que le VOL.
   **Mesuré (xp-pilote.js)** : seul, avec un cerveau aléatoire, le pilote roule **2366 m à 210 km/h,
   100 % sur la route** (vs 14 m / 69 km/h / 72 % pour le MLP aléatoire). MAIS en évolution complète
   (8 graines × 25 gen), le pilote au sol NE BAT PAS le MLP pur en distance (médiane 2898 vs 3047 m) :
   il ne COUPE pas, donc il plafonne à la piste sans voltige. Il apporte la ROBUSTESSE : écart entre
   graines ~700 m (vs ~2200), morts idle 1915→0, airtime 1799→36.
   → (a) DÉCISION DE COUPER FAITE le 2026-09-08 : au sol, les sorties steer (HID+0) et nitro (HID+2)
   du MLP sont LIBRES (le pilote les ignore) — on les lit comme « de quel côté » et « couper
   maintenant ». Quand un raccourci est visible (arr[7]>0) ET que le MLP signale couper, le pilote
   vise le BORD choisi par steer -> la caisse décolle, et le MLP reprend la main en vol (viseur).
   **Mesuré (8 graines × 25 gen)** : moyenne 3140 m (vs 2936 sans coupe), aucune graine sous 2958
   (vs 1179 en MLP pur), morts airtime 36→370 (les bots sautent).
   **Métrique de santé de la voltige = taux d'atterrissage** (`TRAIN.airStats.landings/takeoffs`,
   compteur global, jamais remis à zéro). Mesuré : **MLP pur ~9 % · pilote+coupe ~24 %** — les bots
   sautent (217 décollages) mais ~91 % des vols ne reviennent jamais. C'est ÇA le goulot : la
   réception, pas la décision de sauter. → (b) le gymnase aérien est la bonne suite.
5. **La fitness** : `totD + contrôle − sorties + arrivée`. L'ancienne est rejouable via
   `W_CTRL=0, W_OUT=0, W_CUT=150`. Un A/B a montré **aucun effet** — le problème était en amont.
6. **Algorithme** : la sélection actuelle (élitisme + tournoi) est le maillon faible. CMA-ES sur 260
   paramètres est ~150 lignes de JS pur. PPO demanderait de la dérivation automatique (TF.js ou un
   pont Python), donc de lever la règle « pas de librairie ».

**Ordre de grandeur à garder en tête :** les agents CarRacing de référence sur Hugging Face sont
entraînés sur **1 à 5 millions de pas**. Ici une génération = 65 000 pas, sur un cœur. Le budget
n'est atteignable qu'en réglant (1) et (2).

---

## 8. COMMENT AMORCER UN AGENT SUR CE PROJET

Prompt de départ suggéré :

> Tu reprends le mode entraînement de CASH CAR, dans `ml/train/` du dépôt CAR-CASH-GIT.
> Lis `ml/train/HANDOVER.md` en entier avant de toucher quoi que ce soit, puis
> `RAPPORT-SESSION-2026-09-08.md` pour l'historique.
> Règle absolue : rien n'est vrai tant que ce n'est pas mesuré, et tu donnes la commande qui le
> reproduit. Si tu ne peux pas voir l'écran, tu dis que tu ne peux pas voir.
> Avant de rendre la main : `VERIFIER.bat` doit être vert de bout en bout.

Et lui rappeler que **le propriétaire n'est pas développeur** : il juge sur ce qu'il voit à l'écran
et sur trois chiffres (§6). Un rapport qui ne les donne pas ne vaut rien.
