# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-08 (20e passage)

🟢 **Isomorphisme : RÉGLÉ PAR CONSTRUCTION, plus rien à comparer.** La physique est désormais
**une seule fonction `stepCar`** (l.9121) appelée par le joueur (`PCAR`+`pcarPush/Pull`) ET par les
bots (`TRAIN.botStep` l.12526 → `stepCar`). Il n'existe plus aucune copie `TRAIN.*Physics`.
`check-iso.js 1500` rejoué ce passage → **`ECART MAX GLOBAL : 0.000e+0`**, tous champs à 0.
`check-actions.js` → **PASS** (les 10 000 commandes du bot atteignables au clavier, couplage
gaz/assiette respecté). La divergence joueur↔bot est **impossible** désormais.

🔴 **Mais l'objectif du jeu reste invisible pour le cerveau.** Ce qui reste n'est plus de
l'isomorphisme, c'est de la **méthode** : la voltige (couper entre routes croisées) n'a ni
**signal d'entrée** ni **récompense**. C'est la même double cécité qu'au 19e passage, et je l'ai
re-mesurée ce passage (voir #20 et #13).

⚠️ Numéros de ligne re-vérifiés sur la version actuelle (~12 918 lignes).

---

## Bug #20 (LE PIRE, re-mesuré ce passage) — le détecteur de raccourci est calibré hors échelle

- `carBrainInput` calcule `arr[7]` (le "raccourci", l.9209-9223), l'entrée qui devrait dire au
  cerveau « ici, coupes-tu entre deux routes croisées ? ».
- Fenêtre de distance 3D : `if(d3<8 || d3>60) continue;` (l.9217). Fenêtre de dénivelé :
  `if(dy<10 || dy>60) continue;` (l.9219).
- **Mesure personnelle ce passage** (`diag-critic.js`, `ISO.diagCroisement`, 30 graines,
  3,66 M candidats) :
  - distance 3D entre deux bouts de piste : **médiane 167,4 m** (p10 44,9 · p90 314,3)
  - dénivelé : **médiane 83,1 m**.
- Donc la fenêtre `d3 ∈ [8,60]` **coupe au p10** de la vraie distribution : elle est taillée pour
  une géométrie que le générateur ne produit pas. Le détecteur ne garde que ~0,66 % des candidats
  (24 357 / 3,66 M), et ces rares coupes exploitables sont **dispersées sur toute la piste** — à la
  position exacte du bot en course, `arr[7]` vaut **-1 la quasi-totalité du temps**.
- **Conséquence** : le cerveau n'a littéralement pas l'information « un raccourci existe ici ». Il ne
  peut pas apprendre la voltige, seulement la réciter au sol.
- **Correction** : recalibrer la fenêtre sur la distribution RÉELLE (d3 plafond ~p10≈45 m, ou mieux :
  déplacer le filtre sur le **gain net** `(j-bi)*segL - d3` et non sur une distance absolue), et
  exposer le **viseur d'atterrissage** déjà calculé par la physique (`car.landI/landH/landL/landImp`,
  l.9091-9114) au lieu de faire deviner la dalle au réseau.

---

## Bug #13 (toujours présent) — la coupe n'a aucune récompense

- `TRAIN.W_CUT=0` (l.12705). `goodCuts` (accumulé l.12575) et `cutGain` ne sont **jamais lus** dans
  `TRAIN.fitness` (l.12711-12717), qui vaut `totD + W_CTRL·ctrl − W_OUT·outs + prime_arrivée`.
- Le gradient de contrôle (l.12561-12564), la pénalité de sortie, la prime d'arrivée : progrès réels.
  Mais **la voltige elle-même n'a toujours aucun gradient**.
- **Correction** : reward shaping aérien progressif — `+k·cutGain` pendant le vol, versé au fur et à
  mesure que le bot gagne vers la dalle visée, pas un bonus binaire à l'atterrissage. **À coupler
  impérativement à #20** : sans message d'entrée ET sans récompense, la voltige est un fantôme.

---

## Bug #11 (toujours présent) — cerveau aveugle en vol

- `carBrainInput` calcule tout sur `rel=car.s` (l.9187-9188). Or `car.s` **n'avance pas en vol**
  (`carFall` l.9035-9117 ne touche que `fallPos` ; `car.s` n'est recalculé qu'à l'atterrissage l.8854).
- En vol sont gelés : `arr[0]` (vitesse), `arr[1]` (lat), `arr[5]/arr[6]` (courbures), et `arr[7]`
  (#20). `arr[8]` (l.9229) se mesure sur `frameAt(rel)` **figé au décollage** : hauteur au-dessus du
  point de départ, pas au-dessus de la dalle visée.
- Le **viseur d'atterrissage existe en physique** (`car.landI/landH/landL/landImp`, recalculé à
  chaque frame de vol, l.9091-9114) et n'est **jamais donné au cerveau**.
- **Correction** : nourrir `arr` avec cap/distance horizontale vers `car.landI` (sur `fallPos`, pas
  `car.s`) + shaping aérien. **#13 dépend de #11.**

---

## Bug #16 (toujours présent) — `fallPos` non stocké, hauteur corrompue au clonage

- `REC.etat` (l.9275-9277) stocke `[s,lat,v,psi,side,enVol,nitroR,fvx,fvy,fvz,TRACK_SEED]` : la
  **position `fallPos` (x,y,z) n'y est PAS** (alors que `fallVel` l'est).
- `clone.js` l.94-95 : en vol `car.fallPos.set(0,0,0)` « faute de mieux ».
- Or `arr[8]=cl((car.fallPos.y−biF.p.y)/40)` (l.9229). Avec `fallPos.y=0`, `arr[8]` devient une
  **constante fausse** pendant toutes les frames de vol du clone.
- **Correction** : stocker `fallPos.x/y/z` dans `REC.etat` (3 colonnes), les relire dans `clone.js`.
  Trivial maintenant que clone.js rejoue l'état brut. **À faire AVANT la prochaine session
  d'enregistrement.**

---

## Bug #12 (toujours présent) — `arr[9]` redondant avec `arr[10]`

- `arr[9]=cl(fallVel.y/300)` **en vol seulement** (l.9230) ; `arr[10]=cl(fallVel.y/300)` **toujours**
  (l.9232). En vol : même valeur ; au sol : `arr[10]` relit un `fallVel.y` périmé.
- **Correction** : réaffecter `arr[9]/arr[10]` au viseur d'atterrissage (#11). Deux entrées regagnées.

---

## Bug #18 (toujours présent) — le protocole apprend la récitation

- `TRAIN.newGen` régénère la piste **toutes les 5 générations** (l.12761-12764). Chaque voiture est
  notée sur **une seule piste**, réutilisée 5 manches de suite.
- Mesuré (session) : champion 2456 sur sa piste, **38 sur une inconnue**. Le réseau récite, il ne
  conduit pas.
- **Correction** : noter chaque voiture sur **plusieurs pistes** (moyenne ou pire cas sur N graines)
  avant sélection.

---

## Bug #19 (toujours présent) — normalisation calibrée sur le joueur, pas sur le bot

- `arr[0]=cl((v−135)/110)` centré sur ta médiane de joueur (135 m/s, l.9201). Les bots naissent à
  `v=26` (l.12662) et rampent à 24-26 km/h : `arr[0]` ≈ **-0,99** presque tout l'entraînement.
  L'entrée vitesse est morte pour eux.
- **Correction** : recaler sur la distribution OBSERVÉE des bots (ou un plafond physique `maxSp`),
  pas sur ta médiane d'expert.

---

## Cosmétique (commentaire périmé, toujours trompeur)

- `BRAIN_IN=11` (l.9183) mais les commentaires disent « **12 entrées** » (l.9148 « LES 12 ENTREES »,
  l.9180 « RESTENT 12 entrees », l.9261 « 12 entrees + 4 commandes »). La vérité est **11**
  (`arr[0..10]`). `clone.js` l.9/14/22/220 persiste aussi sur « 12 poids ». Aucun bug fonctionnel
  (tout est relu dynamiquement), mais ça trompe le prochain qui touchera.

---

## Sentinelles (toutes rejouées ce passage)

- `check-iso.js` → 0.000e+0 ✅ · `check-actions.js` → PASS ✅ · `check-syntax.js` → OK.
- `results/demos/` **vide** · `evolution.log` **absent** → entraînement encore figé sur de
  l'aléatoire (aucun cerveau clone à semer). Le blocage n'est plus dans le code, il est opérationnel :
  **il faut des démos au clavier** (2-3 min de conduite propre) pour amorcer.

---

## Priorités

1. **#20 + #13 ensemble** — redonner à la voltige UN signal d'entrée et UNE récompense. C'est
   l'objectif même du jeu, il est actuellement invisible des deux côtés.
2. **#16 avant d'enregistrer** — stocker `fallPos`, sinon on re-pollue le clone dès la première démo.
3. **#18** — noter sur plusieurs pistes.
4. **#11 / #12 / #19 / #14 (démos de voltige)** — ensuite.