# RAPPORT CRITIC — CASH CAR (neuroévolution des bots)

> Agent critique permanent. Relit le code, compare la physique bots↔joueur, surveille
> l'entraînement. Ne modifie JAMAIS le code : il propose, l'agent principal décide.

## Règle d'or
La simulation doit être **isomorphe à la course** : mêmes constantes, mêmes formules, même
ordre des opérations. Toute divergence rend l'apprentissage nul.

---

## VERDICT — passage 2026-09-08 (19e passage)

🟢 **Isomorphisme physique : 0.000e+0, re-vérifié ce passage** (`node check-iso.js 1500` →
`ECART MAX GLOBAL : 0.000e+0`, tous champs à 0). Un seul moteur `stepCar` (l.9121), une seule
`carBrainInput` (l.9186). **19e passage d'affilée sans divergence joueur↔bot.**

🟢 **#15 toujours clos** : `check-actions.js` rejoué → **PASS** (les 10 000 commandes du bot
sont toutes atteignables au clavier ; le couplage gaz/pitch y est bien respecté).

🟢 **LE CODE A BOUGÉ depuis le 18e passage** — trois vrais progrès de méthode, à saluer :
1. **Entrées re-normalisées** (carBrainInput l.9201-9232) : `arr[0]=(v−135)/110`, `arr[1]=lat/ROAD_HALF`,
   `arr[2]=psi/0.5`, `arr[3]=nitroR/2.2`, `arr[5]=courbure(120)·55`, `arr[6]=courbure(300)·110`.
   C'est la re-normalisation que la session réclamait (§3.7 « 8 entrées sur 15 saturées/mortes »).
2. **Espace d'action = « état de touches »** (l.12545-12551) : le bot choisit 4 touches
   (up/dn/lf·rt/nitro), gaz et assiette en découlent — exactement `pcarInput` (l.9369).
   Couplage gaz/assiette désormais IMPOSÉ au bot (il ne peut plus tenir le cabré en gardant le gaz).
3. **clone.js réécrit** : il ne relit plus les entrées (périmées), il **recalcule** tout depuis
   l'état brut + la **graine de piste PAR FRAME** (clone.js l.49-97). Changer une échelle ne coûte
   plus une partie — c'est la bonne direction.

🔴 **État opérationnel toujours figé** : `results/demos/` **vide**, `evolution.log` **absent**.
`sim-train.js --seed 1` ce passage → génération 0 **ALÉATOIRE** (« aucun cerveau clone trouvé »).
Diagnostic `check-live.js` : **24-26 km/h** (toi : 243 de médiane), 29-46 % sur la route à 5 s,
morts dominantes **idle + airtime**. Rien ne roule, rien ne vise, rien ne se pose.

⚠️ **Les numéros de ligne ont bougé** (le fichier est passé à ~12 897 lignes) : la physique est
maintenant `carDrive` (l.8874), `carPitch` (l.9017), `carFall` (l.9035), l'atterrissage (l.8848-8871),
le tout piloté par `stepCar` (l.9121). Les bugs ci-dessous sont re-numérotés à la volée.

---

## Isomorphisme (joueur = référence) — CONFORME

`check-iso.js` → **0.000e+0** (relancé ce passage). Un seul `stepCar` (l.9121), une seule
`carBrainInput` (l.9186). Joueur via `PCAR`+`pcarPush/Pull`, bots via `TRAIN.botStep` (l.12526)
→ `stepCar`. Constantes partagées (`SPD=.5` l.8378, `FALL_G=33` l.8372, `TURN_HS=.0035` l.8379,
`ROAD_HALF=14` l.1568). **Aucune divergence.**

---

## Bug #11 (central, toujours présent) — cerveau aveugle en vol

- `carBrainInput` calcule tout sur `rel=car.s` (l.9187). Or `car.s` **n'avance pas en vol**
  (`carFall` l.9035-9117 ne touche que `fallPos` ; `car.s` n'est recalculé qu'à l'atterrissage, l.8854).
- En vol sont **gelés** : `arr[0]` (v gelé), `arr[1]` (lat gelé), `arr[5]/arr[6]` (courbure),
  `arr[7]` (détecteur de coupe). Ne bougent que `arr[2]` (psi, via lacet), `arr[4]` (=1 constant),
  `arr[8]` (hauteur), `arr[9]/arr[10]` (vy). **5 entrées sur 11 figées, 2 triviales.**
- `arr[8]` (l.9229) se mesure sur `frameAt(car.s)` **figé au décollage** : hauteur au-dessus du
  point de décollage, pas au-dessus de la dalle visée.
- Le **viseur d'atterrissage existe déjà en physique** (`car.landI/landH/landL/landImp`, recalculé
  à chaque frame de vol) et n'est **jamais donné au cerveau**.
- **Correction** : nourrir `arr` avec cap/distance horizontale vers `car.landI` (calculés sur
  `fallPos`, pas `car.s`) + shaping aérien. **#13 dépend de #11.**

---

## Bug #13 (LE GRAVE, non résolu) — la voltige reste un objectif fantôme

- Fitness (l.12711-12717) : `totD + W_CUT·goodCuts + W_CTRL·ctrl − W_OUT·outs + prime d'arrivée`
  (prime = `W_FIN + W_TEMPS·tempsRestant`, l.12716).
- **`W_CUT=0` (l.12705)**. `goodCuts` (l.12575) et `cutGain` ne sont **jamais lus** dans la note.
- La fitness a bien gagné le gradient de contrôle (`ctrl`, l.12561-12564) et une prime d'arrivée
  propre — progrès réels. Mais la coupe aérienne n'a toujours **aucun gradient**.
- **Correction** : réintroduire la coupe en **reward shaping** (pas en bonus binaire) :
  `+k·cutGain` (déjà mesuré l.12573-12575) OU un bonus progressif versé *pendant* le vol,
  proportionnel au gain net vers la dalle. **Couplé impérativement à #11.**

---

## Bug #16 (toujours présent) — `fallPos` non stocké : hauteur corrompue dans le clonage

- `REC.etat` (l.9275-9277) stocke `[s,lat,v,psi,side,enVol,nitroR,fvx,fvy,fvz,TRACK_SEED]` : la
  **position de chute `fallPos` (x,y,z) n'y est PAS** (alors que `fallVel` l'est).
- `clone.js` l.94-95 : en vol `car.fallPos.set(0,0,0)` « faute de mieux ».
- Or `arr[8]=cl((car.fallPos.y−biF.p.y)/40)` (l.9229). Avec `fallPos.y=0`, `arr[8]` devient une
  **constante fausse** pendant toutes les frames de vol du clone.
- **Correction** : stocker `fallPos.x/y/z` dans `REC.etat` (3 colonnes de plus), les relire dans
  `clone.js`. **À faire AVANT la prochaine session d'enregistrement** — c'est devenu TRIVIAL
  maintenant que clone.js rejoue l'état brut : on ajoute juste 3 champs.

---

## Bug #14 (toujours présent) — le clone ne peut pas apprendre la voltige

- `clone.js` imite **le joueur** ; la voltige est le geste que le joueur ne démontre pas.
- `accord` (clone.js l.178-188) ne couvre que **volant/gaz/nitro** ; la sortie `[3]` (pitch, qui
  pilote le cabré donc la voltige) n'a **aucune métrique**.
- **Correction** : (1) démos de voltige au clavier ; (2) métrique d'accord sur `[3]` en vol.

---

## Bug #12 (toujours présent) — `arr[9]` redondant avec `arr[10]`

- `arr[9]=cl(fallVel.y/300)` **en vol seulement** (l.9230) ; `arr[10]=cl(fallVel.y/300)` **toujours**
  (l.9232). En vol : même valeur ; au sol : `arr[10]` relit un `fallVel.y` périmé.
- **Correction** : réaffecter `arr[9]/arr[10]` au viseur d'atterrissage (#11). Deux entrées gagnées.

---

## Bug #17 (toujours présent, mais à moitié résolu) — clonage clavier vs tactile

- Le bot lit ses sorties en **état de touches** (l.12545-12551) : gaz/pitch COUPLÉS (up ⇒ gaz+1/piqué,
  dn ⇒ gaz−1/cabré).
- Le clone apprend 4 canaux **SÉPARÉS** (clone.js l.99) : `Y=[steer, gas, nitro, pitch]`.
- **Au clavier** le couplage « masque » le décalage : les deux paramétrisations coïncident. **Au
  tactile** (`pcarInput` l.9372-9376, pitch analogique découplé) un piqué sans gaz devient `o[1]=0,
  o[3]<0`, que le bot lit `up=false,dn=false` → **piqué perdu**.
- **Correction** : enregistrer les démos au clavier (immédiat) OU faire apprendre au clone la cible
  « état de touches » (les booléens up/dn/lf·rt/nitro) au lieu des 4 champs PIN bruts (durable).

---

## Bug #18 (NOUVEAU, méthode) — le protocole d'évaluation apprend la RÉCITATION

- `TRAIN.newGen` régénère la piste **toutes les 5 générations** (l.12761-12764 :
  `if(genSinceTrack>=5||first){ buildTrack(TRAIN.seed) }`). Chaque voiture est notée sur **une seule
  piste**, réutilisée 5 manches de suite.
- Résultat mesuré (session §3.2) : sur une piste **jamais vue**, le cerveau ne garde que **2 %** de sa
  performance (réseau → 38, boucle ouverte → 111 sur 2456/729 appris). **Le réseau ne conduit pas, il
  récite la piste.** Et la régénération tous les 5 générations jette la mémorisation avant qu'elle
  ne serve — pur gaspillage de budget.
- **Correction** : noter chaque voiture sur **plusieurs pistes** (moyenne ou pire cas sur N graines)
  AVANT de sélectionner. C'est LE correctif qui rendra l'évolution généralisante, sinon on optimise
  un comportement jetable.

---

## Bug #19 (NOUVEAU, méthode) — normalisation calibrée sur le joueur, pas sur le bot

- `arr[0]=cl((v−135)/110)` est centré sur **ta médiane de joueur** (135 m/s = 243 km/h, l.9201).
- Mais les bots en entraînement naissent à `v=26` (l.12662) et **crawlent à 24-26 km/h** (check-live).
  `arr[0]` vaut donc ≈ **−0.99 pendant quasi tout l'entraînement** : l'entrée « vitesse » est morte
  pour eux, même si elle est saine pour toi.
- **Conséquence** : la re-normalisation (#progrès ci-dessus) est juste POUR LE JOUEUR mais inadaptée
  au régime réel des bots en début d'apprentissage.
- **Correction** : recaler `arr[0]` sur la distribution OBSERVÉE des bots (ou un plafond physique type
  `maxSp`), pas sur ta médiane d'expert. Idem vérifier `arr[3]` (nitroR/2.2) et `arr[5]/arr[6]`.

---

## Cosmétique (commentaires périmés — pas de bug fonctionnel, mais trompeur)

- `clone.js` l.9 « 12 poids », l.14/l.220 « 12->16->4 » / « [biais,12 poids] », l.22 `let IN=12` —
  la vérité est **11** (relu dynamiquement l.60, donc aucun bug ; seul le texte ment). Le commentaire
  l.50 « 12 -> 15 -> 11 » est, lui, exact.
- `train.html` l.9250 « les 12 entrees », l.9251/l.9261 « 12 entrees + 4 commandes » — il y en a **11**.

---

## Notes méthode

- `evolution.log` **toujours absent** ; `sim-train.js --seed` reste le log headless reproductible
  (ce passage : gen 3, record 1985, morts idle/airtime).
- Sentinelles vertes ce passage : `check-iso.js` (0.000e+0), `check-actions.js` (PASS),
  `check-live.js` (24-26 km/h, 29-46 % sur route).
- Cerveau à ~10 Hz (`b.think=0.1`, l.12530) contre 60 Hz de physique → 6 frames par décision ;
  aggrave la cécité en vol (#11).
- Budget : 1 génération ≈ 65 000 pas sur 1 cœur, contre 1-5 M de pas (CarRacing de référence).
  Secondaire tant que #13 et #11 restent — on optimiserait un objectif vide.

---

## Recommandations (ordre de priorité)

1. **Enregistrer des démos neuves, AU CLAVIER** (bloquant opérationnel : `results/demos/` vide,
   génération 0 au hasard à 26 km/h). Le clavier est impératif tant que #17 n'est pas réglé.
2. **Corriger #16 AVANT d'enregistrer** — stocker `fallPos` (3 colonnes) ; c'est trivial maintenant
   que clone.js rejoue l'état brut. Sinon on re-pollue le clone dès la première session.
3. **Corriger #18** — noter sur plusieurs pistes. Sinon on entraîne de la récitation jetable.
4. **Corriger #11** — exposer `car.landI` au cerveau + shaping aérien. **Bloquant absolu** pour viser.
5. **Corriger #13** — réintroduire la coupe en shaping (gain aérien progressif), pas en bonus binaire.
6. **Corriger #19** — recaler les échelles sur le régime réel des bots.
7. **Corriger #14 / #12 / #17** — démos de voltige + métrique pitch, réaffecter arr[9]/arr[10],
   cible « état de touches » pour le clone.
