# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-08 (6e passage, après refactor « physique unique »)

🟢 **Isomorphisme : GARANTI PAR CONSTRUCTION, plus seulement « mesuré ».** Le refactor du
2026-09-08 a **supprimé la copie** : il n'existe plus qu'UN moteur physique, `stepCar`
(l.9119), appelé par le joueur via `pcarPush/pcarPull` et par les bots via `TRAIN.botStep`.
Anciens bugs #7/#8/#9 (momT, nez, `v` gelé) résolus en même temps que la copie a disparu.

`node check-iso.js 4000` (rejoué à l'instant) → `ECART MAX GLOBAL : 0.000e+0`, branches
`takeoff/land/cone/pad/bump/hop` traversées. Résultat réel, pas un vœu.

🔴 **L'apprentissage est TOUJOURS bloqué, et au même endroit.** `node sim-train.js --seed 42`
(rejoué à l'instant) : record plafonne à **732**, ~92 % de morts « airtime » à chaque génération
(22-23/24), 1 seul vivant après 6 générations. Le refactor physique était **nécessaire mais pas
suffisant** : le vrai goulot (récompense) n'a pas bougé d'un cran.

---

## Isomorphisme (joueur = référence) — CONFORME, et désormais structurel

Preuve : `node check-iso.js 4000` → écart max **0.000e+0** sur `s, lat, v, vL, psi, fallPos(xyz),
fallVel(xyz), fallT, fallTR, nitroR, yawAcc`, et événements identiques. Un seul `stepCar`
(l.9119) → `carDrive` (l.8872) / `carFall` (l.9033) / `carStartFall` (l.8781) / `carTryLand`
(l.8809). Plus aucune constante ni formule dupliquée.

⚠ Angle mort inchangé : `check-iso.js` ne couvre que la piste `424242`, **sans tremplin ni trou**
(elle n'en génère pas — `ramp`/`oil` signalés « non traversés »). Ces branches ne sont toujours
pas vérifiées bit-à-bit. À couvrir avec une seed qui en produit.

---

## Bug #10 — fin de piste non bornée (TOUJOURS PRÉSENT, lignes mises à jour)

- `car.s` s'incrémente **sans plafond** : `car.s += car.v*Math.cos(car.psi)*car.driveDir*dt*SPD*spdMult`
  (l.8918). Aucun clamp sur `s` dans tout `carDrive`.
- `stepCar` émet bien `'portal'` dès `car.s > L-32` (l.8937-8938), MAIS `TRAIN.botEvents`
  **ignore `'portal'`** (l.12511, commentaire assumé) : pas de régénération de piste pour les bots.
- `b.totD = SURV.pBase + b.s` (l.12489) n'est jamais clampé.
- **Conséquence** (inchangée) : un bot qui finit la piste continue sur la tangente figée et
  **accumule `totD` (donc `fitness`) indéfiniment** jusqu'à 45 s. Dès que les bots apprennent à
  finir, `totD` explose et écrase `goodCuts` → l'objectif devient « foncer tout droit ».
- **Correction** : reboucler/tuer le bot en fin de piste (symétrique du portail joueur), ou
  normaliser `totD` par `L`.

## Bug #11 — la voltige est impossible : ~92 % de morts « airtime » (TOUJOURS PRÉSENT)

- Seuil `AIR_MAX = 6` s (l.8370) : `fallTR > AIR_MAX → carBoom('airtime')` (l.9115).
  Isomorphe joueur (pas un bug de physique).
- Bilan de génération (rejoué) : `gen 1..5 → morts airtime 22-23`, record plafonne à **732**.
- **Diagnostic AFFINÉ par le refactor** — deux causes qui se cumulent :

  1. **Récompense sparse** : `+150*goodCuts` crédité uniquement à l'atterrissage
     (`fall→drive`, `gain>20`, l.12493-12495). Pour encaisser il faut atterrir **en < 6 s de vol**.
     Si la coupe réelle exige plus, la récompense est inatteignable : décoller → survoler le vide
     → boom « airtime » sans jamais voir un `goodCut`.

  2. **NOUVEAU — le cerveau est aveugle en vol, précisément là où il faudrait guider.** En vol,
     `car.s` **n'avance pas** (`carFall` ne touche que `fallPos`, l.9068). Or toutes les entrées
     de localisation du cerveau dépendent de `rel = car.s` : courbure (l.9165), prochain trou
     (l.9176), **le meilleur croisement** (l.9179-9193) et `arr[0]=car.v/80` (l.9162, `v` gelé en
     vol, confirmé au commentaire l.9151). Résultat : en vol, les seules entrées « vivantes » sont
     `arr[8]` (mode), `arr[9]` (hauteur) et `arr[10]/arr[11]` (vitesse verticale). **Le bot doit
     engager sa trajectoire au décollage, sans aucune visée du croisement pendant la chute.** On
     lui demande un tir de précision les yeux bandés, récompensé seulement à l'impact.

- **Correction** (dans l'ordre) :
  1. **Reward shaping** : récompenser la progression aérienne vers le croisement (gain incrémental
     de position horizontale vers la dalle visée, bonus d'être au-dessus d'une route croisée,
     pénalité d'overshoot), au lieu du `+150` binaire.
  2. **Nourrir le cerveau en vol** : ajouter au vecteur d'état le cap/la distance vers le meilleur
     croisement **calculés sur `fallPos`** (pas sur `car.s` gelé), voire la position relative au
     point d'atterrissage prédit par le viseur (`car.landI`, l.9089-9112, déjà calculé !). Le
     viseur d'atterrissage existe déjà en physique — il suffit de le donner au cerveau.
  3. **Vérifier la faisabilité** : mesurer le temps de vol réel des coupes. Si > ~4-5 s, soit lever
     `AIR_MAX` pour le bot, soit ne garder que des croisements atteignables en < 6 s.

## Bug #12 (NOUVEAU) — `arr[11]` est redondant avec `arr[10]`

- `arr[10] = clamp(car.fallVel.y/30,-1,1)` en vol, sinon 0 (l.9200).
- `arr[11] = clamp(car.fallVel.y/30,-1,1)` **toujours** (l.9202).
- En vol, `arr[10]` et `arr[11]` contiennent **la même valeur** : une des 12 entrées du réseau est
  gaspillée et n'apporte aucune information nouvelle. Le commentaire du COMPTE-RENDU le notait déjà
  (« arr[10] et arr[11] restent redondants ») ; le refactor ne l'a pas purgé.
- **Correction** : réaffecter `arr[11]` à un signal utile manquant (ex. distance horizontale
  restante jusqu'au point d'atterrissage prédit `car.landI`, ou cap vers le croisement — cf. #11.2),
  ou le supprimer et réduire `BRAIN_IN`.

## Récompense déséquilibrée `150*goodCuts` (inchangé)

`fitness = totD + 150*goodCuts` (l.12644 en fin de génération, l.12661 au kill), seuil `gain>20`
(l.12495). Le `150` écrase `totD`, et la récompense est sparse (un seul événement, au seul
atterrissage réussi). Couplé à #10 et #11, c'est le goulot n°1 : normaliser `150` par la fréquence
de croisements et ajouter un terme de survie/énergie, ou passer au shaping.

## Notes méthode

- `evolution.log` **toujours absent** : `sim-train.js` (`--seed`) est le log headless reproductible.
  **Lancer un run long (20+ générations) et commiter sa sortie reste prioritaire** pour mesurer un
  vrai gain après correction de la récompense.
- `TRAIN.deaths` (bilan des morts) est toujours le bon détecteur — c'est lui qui relit #11 à chaque
  passage. Continuer de le loguer.
- Le cerveau tourne à ~10 Hz (`b.think=0.1`, l.12476) contre 60 Hz de physique : pas une divergence,
  mais le bot « tient » ses commandes 6 frames, ce qui amplifie l'aveuglement en vol (#11.2).

## Recommandations (ordre de priorité)

1. **Corriger #11** — shaping + nourrir le cerveau en vol avec `car.landI`/la visée du croisement.
   C'est LE blocage, prouvé par les logs, et le refactor rend la correction triviale (le viseur
   existe déjà en physique, l.9089).
2. **Corriger #10** — borner/reboucler `s` en fin de piste, ou normaliser `totD`.
3. **Corriger #12** — réaffecter `arr[11]` (signal utile vol).
4. **Étendre `check-iso.js`** à une piste à tremplins/trous pour couvrir `ramp`/`oil`.