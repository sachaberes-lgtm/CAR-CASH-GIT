# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-08 (11e passage, soir)

🟢 **Isomorphisme : 0.000e+0, RE-vérifié à l'instant** (j'ai relancé `node check-iso.js 3000`).
`ecart max global 0.000e+0` sur s/lat/v/vL/psi/fallT/fallTR/nitroR/yawAcc + fx..vz. Un seul
moteur `stepCar` (l.9119), une seule `carBrainInput` (l.9158). Rien à signaler côté physique.

🟢 **Le refactor de l'espace d'action est un vrai progrès.** `TRAIN.botStep` (l.12509-12527) ne
produit plus 4 canaux libres : il choisit un **état de touches** (haut/bas/gauche/droite/nitro),
et gaz/assiette en découlent — exactement `pcarInput` (l.9345-9353). Ça corrige deux mesures
documentées : l'assiette figée à +0,88 (chandelle) et le gaz moyen 0,374 sous le seuil 0,5
(roue libre à 83 km/h). Bien vu.

🔴 **L'objectif du projet reste TOUJOURS orphelin.** `TRAIN.W_CUT=0` (l.12681) : la voltige
aérienne n'est récompensée **nulle part**. `goodCuts`/`cutGain` sont *comptés* (l.12549-12551)
mais pèsent zéro (l.12689 multiplié par 0). #13 non résolu. C'est LE bug de fond.

🟡 **Le clonage comportemental (clone.js → cloned-brain.json) ne peut pas non plus produire la
voltige** : il imite un joueur qui (prémisse du projet) ne coupe pas. Et sa sortie critique
reste non validée. #14 non résolu.

---

## Isomorphisme (joueur = référence) — CONFORME

`check-iso.js` → **0.000e+0** (relancé ce passage, pas de confiance aveugle au rapport précédent).
Un seul moteur `stepCar`, une seule `carBrainInput`, zéro constante dupliquée. Les constantes
(`SPD`, `FALL_G`, `GRAV`, `TURN_HS=.0035` l.8377, `ROAD_HALF=14`) sont partagées par construction.
**Aucune divergence joueur/bot.**

---

## Bug #13 (LE GRAVE, non résolu) — la voltige reste un objectif fantôme

- Fitness (l.12687-12693) : `totD + W_CUT·goodCuts + W_CTRL·ctrl − W_OUT·outs + prime d'arrivée`.
- **`W_CUT=0` (l.12681).** `goodCuts` est *lu* (l.12689) mais multiplié par 0 ; `cutGain` est
  **orphelin** (aucune lecture ailleurs). La coupe aérienne n'a **aucun gradient**.
- Conséquence : l'évolution (et le clone) apprennent « avancer au centre, ne pas tomber », soit
  l'exact opposé de la voltige. On fabrique un bon conducteur, pas un voltigeur.
- Le commentaire l.12662-12668 explique le retrait (la prime payait le saut sans savoir se
  poser). Le diagnostic était juste, mais il fallait **remodeler**, pas supprimer.
- **Correction** : réintroduire un terme de coupe **façonné** (reward shaping), pas binaire :
  `+k·cutGain` (le gain net de `s`, déjà mesuré l.12549) OU un bonus progressif « distance
  aérienne utile vers la dalle visée » versé **pendant** le vol (couplé à #11).

---

## Bug #14 (non résolu) — le clone ne peut pas apprendre la voltige, et sa sortie « bas » n'est pas validée

- `clone.js` apprend à **imiter le joueur**. Or la voltige est précisément le geste que le joueur
  ne démontre pas. Le clonage est borné par la politique du démonstrateur : si le démo ne coupe
  jamais, le clone ne coupera jamais.
- `results/cloned-brain.json` → `accordValidation` ne couvre que **volant/gaz/nitro**
  (93/94/86,5 %). La sortie `[3]` (qui pilote le frein+**cabré** en vol, donc la voltige) n'a
  **AUCUNE métrique**, alors que `partEnVol=0.24` (24 % des pas en vol).
- **Correction** : (1) produire des démos **de voltige** (le développeur joue une coupe parfaite
  et on clone ça), (2) ajouter une métrique de validation de la sortie `[3]` (accord signe en vol).

---

## Bug #15 (NOUVEAU, sévérité moyenne) — clone et botStep ne parlent PAS la même langue pour les sorties 1 et 3

- Le commentaire l.12343-12344 dit : sorties = `[0] volant, [1] gaz, [2] nitro, [3] pitch aérien`.
- `clone.js` entraîne effectivement `[1]` sur **gaz** (l.68 : `Y[1]=cl(r[IN+1])`) et `[3]` sur
  **pitch** (l.68 : `Y[3]=cl(r[IN+3])`).
- Mais `botStep` (l.12521-12527) lit `[1]` comme **« touche HAUT »** (`up9=out[HID+1]>0`) et
  `[3]` comme **« touche BAS »** (`dn9=out[HID+3]>0`).
- **Ça marche aujourd'hui PAR COÏNCIDENCE** : au clavier, `pitch = −gaz` (pcarInput l.9350/9352 :
  haut→gaz=1/pitch=−1, bas→gaz=−1/pitch=+1). Donc `[3]≈−[1]`, et `[3]>0 ⟺ bas` se lit bien.
- **C'est fragile** : si quelqu'un change le mapping clavier, ou entraîne `[3]` sur autre chose,
  ça casse en silence. Le commentaire est **trompeur** pour qui relit.
- **Trou réel dans « l'espace clavier exact »** : la combinaison `(up9=1, dn9=1)` est **illégale**
  (aucune touche ne la produit) mais possible pour un cerveau muté — elle donne `gaz=−1, pitch=0`
  (freiner sans cabrer). Le cerveau garde donc 1 degré de liberté de plus que le clavier.
- **Correction** : (1) aligner la sémantique — entraîner `[1]` sur « haut » (gaz>0) et `[3]` sur
  « bas » (pitch>0) dans clone.js, en cohérence avec botStep ; (2) interdire `(up9 && dn9)` dans
  botStep (priorité au bas, comme le clavier) ; (3) corriger le commentaire l.12344.

---

## Bug #11 (toujours présent) — cerveau aveugle en vol

- `carBrainInput` calcule tout sur `rel=car.s` (l.9159), or `car.s` n'avance pas en vol
  (`carFall` ne touche que `fallPos`). En vol, `bi` est figé → `arr[0..7]` et `arr[13..14]`
  (courbure) sont **gelés** pendant la chute.
- Seules bougent en vol : `arr[8]` (mode), `arr[10]/[11]` (vitesse de chute), `arr[12]` (psi, via
  le lacet). `arr[9]` (hauteur) se mesure sur `frameAt(rel)` **figé** (l.9198).
- Le viseur d'atterrissage **existe déjà en physique** (`car.landI/landH/landL`, l.9089-9105) et
  n'est **jamais donné au cerveau** (lu seulement par le rendu joueur et le hook ISO). Gratuit de
  l'exposer.
- **Correction** : nourrir `arr` avec cap/distance horizontale vers `car.landI`, calculés sur
  `fallPos` (pas `car.s`), + shaping aérien pendant le vol. Sans ça, aucune entrée ne permet de
  *viser* une dalle → impossible d'apprendre la voltige (#13 dépend de #11).

---

## Bug #12 (toujours présent) — `arr[11]` redondant avec `arr[10]`

- `arr[10]=clamp(fallVel.y/30)` en vol sinon 0 (l.9200) ; `arr[11]=clamp(fallVel.y/30)` **toujours**
  (l.9202). En vol les deux portent la **même valeur** : 1 des 15 entrées gaspillée.
- **Correction** : réaffecter `arr[11]` au signal manquant (distance/cap vers `car.landI`, cf. #11).

---

## Notes méthode

- `evolution.log` **toujours absent** ; `sim-train.js --seed 42` reste le log headless reproductible.
- `check-iso.js` est la sentinelle : **relancé ce passage → 0.000e+0**.
- `TRAIN.deaths` reste le détecteur clé : « airtime » massif à chaque génération = vol ni appris
  ni récompensé (#13 + #11).
- Cerveau à ~10 Hz (`b.think=0.1`, l.12506) contre 60 Hz de physique → 6 frames par décision, ce
  qui aggrave la cécité en vol (#11).
- **Commentaires périmés** (cosmétique) : l.12343 « MLP 12 → 16 → 4 » (IN=15 désormais),
  l.12344 « [3] pitch aérien » (c'est « bas » côté botStep), l.9242 « les 12 entrées »,
  clone.js l.7/l.14/l.22 « 12 poids » et le champ `ordre` du JSON (« 12 poids »/« 16 poids »).
  `MLP.IN=BRAIN_IN` (l.12346) reste correct, donc pas de bug fonctionnel — mais trompeur.

---

## Recommandations (ordre de priorité)

1. **Corriger #13** — réintroduire la coupe dans la fitness en **shaping** (gain aérien
   progressif vers la dalle visée), pas en bonus binaire à l'impact.
2. **Corriger #11** — exposer `car.landI` au cerveau + shaping aérien pendant le vol. Sans cela,
   #13 est impossible : on ne récompense pas un geste qu'aucune entrée ne permet de viser.
3. **Corriger #14** — fournir des démos de voltige au clone ET valider la sortie `[3]`
   (aujourd'hui non métriquée), sinon le clonage ne fera jamais le geste signature.
4. **Corriger #15** — aligner la sémantique des sorties 1/3 entre clone.js et botStep, et
   interdire `(up9 && dn9)`.
5. **Corriger #12** — réaffecter `arr[11]`.
