# COMPTE RENDU — Neuroévolution CASH CAR

> Dernière mise à jour : 2026-09-08, après **la suppression de la copie de physique**.
> LANGUE : français. Propriétaire : **Sacha**.

---

## 1. Objectif

Apprendre à 24 bots (voitures) à faire de la **voltige aérienne** et à **couper entre routes
qui se croisent** (le « raccourci » gagnant), avec nitro, dans le jeu CASH CAR (Three.js r128).

Méthode : **neuroévolution** (MLP pur JS 12→16→4, crossover + mutation). PAS de librairie ML,
PAS de modèle Hugging Face.

**RÈGLE D'OR (répétée 4× par Sacha) :**
> La physique des bots doit être STRICTEMENT isomorphe à celle du JOUEUR.

**→ Cette règle n'est plus une consigne à respecter : elle est GARANTIE PAR CONSTRUCTION.**
Il n'existe plus qu'un seul corps de physique dans le fichier. Voir §3.

---

## 2. Fichiers

Racine : `C:\Users\sacha\Documents\GitHub\CAR-CASH-GIT\`

| Fichier | Rôle |
|---|---|
| `ml/train/train.html` | **LE fichier de travail** (~12 660 lignes). Copie de la démo + mode entraînement. |
| `ml/train/sim-env.js` | environnement headless PARTAGÉ (stubs DOM/WebGL/audio + chargement du script) |
| `ml/train/sim-train.js` | simulateur headless — 3 manches de 45 s, `--seed N` pour rejouer un run |
| `ml/train/check-iso.js` | **le harnais d'isomorphisme** : rejoue la même séquence par les 2 chemins |
| `ml/train/check-syntax.js` | vérif syntaxe JS |
| `ml/train/LANCER-TRAIN.bat` | serveur 8765 + ouvre train.html?train=1 |
| `ml/train/train.backup-*.html` | sauvegardes horodatées |
| `demo/cash-car-demo/index.html` | **démo DÉPLOYÉE Vercel — NE JAMAIS y toucher** |

---

## 3. LA PHYSIQUE UNIQUE (le gros changement du 2026-09-08)

**Avant** : la physique du joueur vivait dans `loop`, et le mode entraînement en gardait une COPIE
(`TRAIN.groundPhysics` / `airPhysics` / `startFallBot` / `tryLandBot` / `obstacles`). Trois passes de
correction et deux agents critiques n'ont pas suffi à faire tenir les deux versions ensemble.

**Maintenant** : on a arrêté de corriger la copie, **on a supprimé la copie**.

```
stepCar(car, input, dt, world)          ← l'UNIQUE moteur physique (~l. 8720-9210)
  car    tout l'état de la caisse + SES temporaires privés (_F, _a.._d, _m4, _q)
         (plus un seul tmp2/tmp3/F global dans la physique : c'était la moitié des divergences)
  input  {steer:-1..1 · gas:-1..1 (>.5 accélère, <-.5 freine) · nitro:bool · pitch:-1..1}
  world  {rnd:fn · ev:tableau|null}
  → remplit world.ev : la physique ne fait AUCUN bruit, ne verse AUCUN dollar, n'affiche RIEN.
    Elle CRIE ce qui vient d'arriver ('land', 'bump', 'ramp', 'cone', 'boom', 'portal'…),
    l'appelant en fait ce qu'il veut.
```

Découpage : `carDrive` (sol) · `carFall` (vol) · `carStartFall` (décollage) · `carTryLand`
(atterrissage + bump) · `carPitch` (tangage) · `carNose` (le nez, pour l'anti-blocage).

**Les deux appelants** :
- **JOUEUR** — `PCAR` + `pcarPush()` / `pcarPull()` recopient les globales historiques
  (`s`, `lat`, `vA`, `psi`, `mode`, `fallT`…) autour du pas, pour que TOUT le reste du fichier
  (rendu, HUD, nuages, moteur, caméra) continue de les lire. `pcarInput()` est **le seul endroit
  qui lit le clavier**. `pcarEvents()` encaisse : sons, argent, chaîne de figures, messages.
- **BOTS** — `TRAIN.botStep` : le cerveau produit les 4 commandes, `stepCar` fait le reste. Point.

**Ce que ça a corrigé au passage** (les divergences que les critics traquaient) : `momT` remis à
zéro au décollage (bug #7), le nez de l'anti-blocage aérien qui suit désormais la MÊME orientation
des deux côtés (bug #8), `v` gelé en vol comme chez le joueur (bug #9), l'**assistance
d'atterrissage** (`AIR_ASSIST`, une vraie force sur `fallVel`) que les bots n'avaient jamais eue,
l'**anti-idle** (« ROULE OU CRÈVE ») qu'ils ne subissaient pas, et la cascade de consommation
nitro `nitroR → nitroX`.

### Ce qui a changé de comportement, en connaissance de cause
1. **Gaz + frein appuyés ENSEMBLE** : le frein l'emporte (`gas=-1`), donc le momentum ne monte plus
   dans ce cas. Avant, il montait. Invisible en jeu, mais c'est une différence assumée.
2. **Assiette en vol au doigt (mobile)** : le stick incline aussi un peu SANS nitro (0,62 rad/s).
   Avant, l'analogique ne servait qu'au réacteur. Un seul `input.pitch`, un seul comportement.
3. **`driftYaw` (Tokyo Drift)** reste une rotation d'IMAGE, posée par le rendu : elle n'entre plus
   dans le quaternion physique, donc plus dans le nez de l'anti-blocage.

---

## 4. Pas de temps FIXE + graine

`TRAIN.loop` n'avance plus de `min((now-last)/1000,.05)` : **accumulateur + sous-pas fixes de
1/60 s** (`TRAIN_DT`, jusqu'à `TRAIN_SUB_MAX=16` par frame). L'affichage peut ramer, la simulation
ne bouge pas.

Tout l'aléa du mode train passe par **`TRAIN.rnd`** (mulberry32, `TRAIN.rngSeed`, `TRAIN.reseed(n)`) :
positions de départ, tournoi de sélection, embardée sur flaque **et** l'initialisation/mutation du
réseau (`MLP.rnd`, un simple robinet remplaçable — l'architecture, les taux et les maths du MLP
n'ont pas bougé d'une virgule).

**Résultat mesuré** : `node sim-train.js` donne deux fois de suite la même sortie au caractère près,
et le NAVIGATEUR sort exactement les mêmes lignes que le headless :

```
TRAIN gen 1 best 49  alive 0 record 49  | morts : idle 3, airtime 21
TRAIN gen 2 best 53  alive 0 record 53  | morts : airtime 24
TRAIN gen 3 best 307 alive 0 record 307 | morts : airtime 22, idle 2
TRAIN gen 4 best 315 alive 0 record 315 | morts : airtime 24
```

`node sim-train.js --seed 42` rejoue une autre population sur une autre piste — c'est ce qui permet
de COMPARER deux versions du code au lieu de comparer deux coups de chance.

---

## 5. Commandes de test

```bash
cd ~/Documents/GitHub/CAR-CASH-GIT/ml/train
node check-syntax.js          # syntaxe JS
node check-iso.js             # LE test d'isomorphisme (doit finir a 0.000e+0)
node sim-train.js             # sim headless, graine par defaut
node sim-train.js --seed 42   # une autre graine
python -m http.server 8765    # puis http://localhost:8765/train.html?train=1
```

`check-iso.js` fabrique une séquence d'entrées déterministe et la rejoue **deux fois de suite** :
manche 1 par le chemin JOUEUR (globales → `pcarPush` → `stepCar` → `pcarPull` → globales), manche 2
par le chemin BOT (`stepCar` sur une caisse nue). Entre les deux, **le monde est rebâti** : les
plots se consomment (`c9.hit`), rejouer en parallèle ferait manquer au second ce que le premier a
renversé. Il compare les événements, l'état discret (mode, face, sens…) et l'état continu, et
**échoue au PREMIER écart**. Verdict attendu : `ecart max 0.000e+0`.

⚠ Le test tourne sur la piste TELLE QU'ELLE EST GÉNÉRÉE. Une piste de ce niveau n'a ni tremplin ni
trou : c'est normal, on ne fabrique pas de décor pour faire monter un chiffre. Le test le DIT
(`non traversees sur cette piste`) au lieu de faire semblant.

---

## 6. Où en est l'apprentissage (état honnête)

Le mode ne stagne pas, mais **il n'apprend pas vite**, et la raison est mesurée :

- **~90 % des morts sont `airtime`** : le bot quitte la route, passe 6 s en l'air, explose. Le
  bilan par génération le dit maintenant (`morts : airtime 22, idle 2`).
- En génération 1, les 24 bots quittent la route en ~2 s. **C'est ça, « c'est n'importe quoi à
  l'écran »** : la caméra suit un bot qui plonge dans le vide, donc on voit le ciel et la planète.
  Ce n'est PAS un bug de rendu.
- Le `record` d'un run tient dans un intervalle très large (mesuré sur 12 runs de l'ancienne version :
  276 → 1792). Un chiffre isolé comme « best 1321 » ne veut rien dire : c'était un tirage chanceux.
  Sur graines 1-8, la version actuelle sort 427 → 1292 (médiane ~674) contre une médiane ~700 pour
  l'ancienne — **statistiquement indiscernable**, sur des échantillons qui varient d'un facteur 5.
  Ce qui a changé n'est pas le score, c'est que le score est maintenant **reproductible et valide**.

### Chantiers suivants (hors mandat « physique unique »)
1. **La récompense** : `fitness = totD + 150*goodCuts`. Le `150` domine `totD` — risque de
   sur-optimiser « couper sans arrêt ». C'est le goulot n°1 maintenant que la physique est propre.
2. **Les entrées** : `arr[0]` lit `b.v`, désormais GELÉ pendant le vol (comme chez le joueur). Le
   cerveau n'a donc plus la vitesse horizontale en l'air. `arr[10]` et `arr[11]` restent redondants.
3. **La survie** : tant que 90 % des bots meurent en tombant, l'évolution passe son temps sur la
   première seconde de piste. Un terme de survie, ou un départ plus indulgent, changerait tout.
4. `evolution.log` toujours absent : lancer un run long et commiter le log.

---

## 7. Pièges connus (à lire AVANT de modifier)

- **`search_files`/`rg` ÉCHOUE** sur ce chemin. Utiliser
  `cd ~/Documents/GitHub/CAR-CASH-GIT/ml/train && grep -n "pattern" train.html`.
- **`node` + chemin MSYS** : donner des chemins Windows natifs `C:\Users\...`, ou `cd` d'abord.
- **`train.html` est en CRLF** : un script qui le réécrit doit le rendre en CRLF (sinon le fichier
  finit en fins de ligne mixtes et les ancres de recherche ratent).
- **Le `<script>` principal** = celui qui contient `survTick` ET `buildTrack` (pas le premier = splash).
- **`survTick` (~l. 9700-9950) = la meute du mode Survivant de la démo. NE PAS Y TOUCHER** : elle a
  sa propre physique simplifiée (`b.air`, `b.phi`, `vy-=26`), c'est voulu, ce n'est pas une copie à
  supprimer.
- **Ne jamais modifier `demo/cash-car-demo/index.html`**.
- **Constantes** : `FALL_G=33`, `SPD=0.5`, `ROAD_HALF=14`, `THICK=2.6`, `GRAV=9.8*.55`, `AIR_MAX=6`,
  `AIR_ASSIST=1.0`, `TURN_HS=.0035`.
- **Avant test navigateur : COUPER LE SON** (🔊→🔇, 🎙→🤐) — demande de Sacha.
- **Commentaires en FRANÇAIS**, style compact.
- **Hooks `sim=1`** : `window.__TRAIN` et `window.__ISO` ne sont exposés qu'avec `?sim=1` dans l'URL.
  `__ISO` est ce qui rend `check-iso.js` possible ; ne pas le retirer.
