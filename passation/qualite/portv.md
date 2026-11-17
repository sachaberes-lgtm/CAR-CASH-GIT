# Lot PORTV — le portail étalé (2026-11-17)

Constat (vol du 13 Pro, build 120 « v 1dfe4a3 », `~/cash-car/ios-ultime-mesures/vol/vol-1117-1137.json`, état thermique CRITICAL, 20 i/s) :
le rappel `R:function(){r1(function(){ if(PORTV.att!==tok)…` (le passage du portail) coûte jusqu'à 1 463 ms d'un bloc (pire 1 266 ms nuages → jade ;
321 ms à l'entrée de la grotte). Au banc ×10 l'installation (newTrack) vers la jade prenait 150-240 ms d'un bloc (lot jadeprebati).

Branche `qa/portv` (worktree clairsemé `~/cash-car/qualite-portv`, base `origin/qualite-appareil` 9b7fd60f9 : jadeprebati + hudobs dedans).
**Interrupteur : `?sans=portv`** rend l'avant (tout ce qui change le déroulé est derrière `PORTV_ON`). `?sans=portvchauffe` : l'étalement sans la chauffe sous le voile.

## 1. Où partait le temps (mesuré au banc ×10, avant : `?sans=portv`)

(voir § 4 pour les chiffres) Le passage avait TROIS blocs, pas un :
1. la construction (newTrack) d'un trait dans le rappel du portail : 150-270 ms ×10 — ses étapes (dbgPortv) : les pièces (spawnPickups) 60-85 ms,
   la ville bâtie au passage (buildVoxCity) 150-215 ms, les nuages (buildClouds) 62-64 ms, la jade 42-49 ms (jadeCle recalculée d'un bloc 33 ms ;
   en partant de la jade : jadeRange + jadeOublie, la carte rangée puis jetée aussitôt), le ciel (bioGo) ~10 ms ;
2. la 1re image du monde neuf, ~120 ms plus tard : la CHAUFFE (chauffeRendu de toute la scène hors écran, CHAUFFE_R.t) 140-200 ms ×10, dont la montée
   des géométries au GPU (bufferData) et jadeChauffeNiveau ;
3. la 1re vraie image : encore des bufferData (ce que la chauffe n'avait pas vu) ; et, posée par l'arrivée asynchrone de la carte postale du portail
   suivant (rendu/portails.js, `im.onload` → renderer.initTexture), une montée de texture de ~55 ms ×10 au milieu du passage.
Sans compter le pré-bâti pendant l'approche : des tranches d'un seul pas de 70-394 ms ×10 (la ville : genCtrl d'un bloc 394 ms ; la grotte : un essai
grtTrace + mesure 130 ms, pisteTordPropre 110 ms, grtEchantillons 101 ms, grtPiliers 122 ms ; la jade : jadeCle 72 ms).

## 2. Ce qui est fait

### A. Le passage étalé (moteur/piste-prebati.js « LE PORTAIL ÉTALÉ », gameplay/portail-passage.js, moteur/boucle-1.js, rendu/traces-pneus.js)
- Au passage (au sol, en vol, après l'attente du pré-bâti), `prebPorte(newTrack)` d'un bloc devient `portvPorte(tok, so)` : le voile est posé, la caisse tenue
  (`PORTV.att` reste posé), **la boucle est gelée** (`pveTick` en tête de `loop()` : ni physique, ni dessin, ni HUD, comme le chargement sous la boule) et
  `newTrackG` (déjà un générateur) avance par tranches de `PVE.tr` = 22 ms, une par image d'écran. Puis le voile s'ouvre comme avant (`so` = pcVoileSort / portVoileSort).
- Phases sous le voile : (0) le reste d'un pré-bâti pas fini (attente coupée, passage en vol) en tranches — plus jamais `prebTravaille(Infinity)` d'un trait dans prebGraine
  (au-delà de 60 s : d'un trait, comme avant) ; (1) la construction ; (2) **la chauffe sous le voile** : jadeChauffeNiveau (sa propre image), puis chauffeRendu par MORCEAUX
  (un enfant de la scène, ou 6 enfants d'un groupe lourd à la fois, sur deux niveaux : la chaîne des parents est réduite au morceau le temps du dessin, les tableaux d'enfants
  rendus tels quels) — géométries et textures montent au GPU, programmes liés ; la passe entière de la 1re image (`CHAUFFE_R.t`) est alors sautée (`ccConstr('chauffe')` part quand même) ;
  (3) les tâches remises pendant la construction (`pveApres` : la carte postale du portail suivant, la jade ou la grotte qu'on quitte) et les géométries de l'ancienne route.
- Une attente qui dure (0,4 s) montre le voile du serpent, comme l'attente du pré-bâti (et le garde sans clignement si l'attente l'avait déjà).
- Un `newTrack` venu d'ailleurs pendant l'étalement (REJOUER, banc) finit d'abord celui en cours d'un trait (`pveFinit`, en tête de newTrackG).
- `loop._rebuildT` est reposé à la fin (la qualité auto ne lit pas les images d'après comme une faiblesse).
- Boîte de vol : les tranches > 8 ms sous le voile s'inscrivent dans Q sous le nom **`PV:etale`** (nombre, total, pire) — format inchangé, analyse-vol.py les liste
  avec les autres rappels. Boîte noire (téléphone) : `portail | construction étalée N ms sous le voile`.

### B. Ce que la construction fait en tranches (même code mené d'un trait ailleurs : `f(){return rythmeMene(fG())}`)
Chaque générateur rend la main à l'échéance de la tranche (`JF.lim`), entre deux étapes : mêmes appels, mêmes tirages, même ordre.
- `buildCloudsG` (maps/nuages-vitrail.js) : entre deux nuages et avant le ciel de coton ;
- `buildVoxCityG` (maps/jade-balade.js) : la ville bâtie au passage, entre ses grandes étapes et dans ses boucles ; `vsBatirG` (maps/ville-scenes.js) : une scène à la fois ;
- `spawnPickupsG` (gameplay/pouvoirs-grisants.js) : le plan, puis toutes les 32 pièces, puis les pouvoirs ;
- la jade : `jadeClePre` calcule la clé de la vallée en tranches (`jadeCleG`, le même hachage) juste avant buildJade, qui la prend (`JADE_CLEP`) au lieu de la recalculer ;
  en QUITTANT la jade, la carte sort de la scène tout de suite mais est jetée après (`jadeJetteG` en tranches) ; la grotte qu'on quitte pareil (`grotteJetteG`) ;
- la route d'avant : ses géométries sont rendues au GPU après (`PVE.lib`), la carte postale du portail suivant monte au GPU sous le voile ou après (rendu/portails.js).
- La fin de newTrack0G (plaques, ciel, mini-carte, pièces) a ses pauses (`yield`).

### C. Le pré-bâti (piste-prebati.js, depart-avance.js, route-rythme.js, route-sans-haut.js, ville-entree.js, grottes-1/2.js, jade-2.js)
- `prebJade` : `yield* jadeCleG(seed)` au lieu de jadeCle d'un bloc.
- **Le départ sans la map d'en face** (`pvAttendDepart`) : ni liaison des programmes (prebLie) ni pré-bâti avant 7 s de COURSE (pause exclue), sauf si le budget ne
  suffirait plus (voir § 3).
- À 20 i/s ou moins (`pvLent`, cadence mesurée PREB.ips), la route de la grotte suit la tranche plafonnée (4 ms) au lieu de monter à 10 ms (elle grandit d'elle-même si le reste l'exige).
- Sous le voile d'attente (prebRetient), des tranches de 22 ms au lieu de 26 / 45.
- La ville : `genCtrlG` / `rythmeMeilleurG` (le meilleur-de-N rend la main entre deux essais, et dans un essai entre le dessin, la mesure et le malus) ; le malus de la ville
  terme par terme (`malusG` : mêmes appels, même ordre, même somme `a+(b+c+d+e+f)`).
- La grotte : `grtTraceG` (entre le plan, les conflits, les boyaux, les passages exigus), l'essai coupé entre le tracé et sa mesure, `pisteTordPropreG` (entre deux essais et
  entre la torsion et le compte des contacts), `pisteTordG` (entre ses étapes et toutes les 512 rangées de repères), `grtEchantillonsG`, `grtPiliersG` (entre deux piliers).
- nuages et orbite profitent de pisteTordPropreG / pisteTordG / genCtrlG aussi.

## 3. Le budget du pré-bâti à grande vitesse (le calcul)

Règle (pvAttendDepart) : au départ d'une course, on n'attend les 7 s que si `T − attente − 1,5 s ≥ W / (4 ms × i/s)`, avec T le temps avant le portail
(`(L − s) / v`), W le reste estimé du travail de la map d'en face (`PREB_CPU` de cette map ×1,15, sinon les valeurs larges : jade 2 500 ms, grotte 8 000 ms
— 4 500 avec son travailleur —, les autres 1 500 ms). Sinon on n'attend pas : le travail part tout de suite, comme avant.
Ensuite (inchangé, prebTranche) la tranche reste à 4 ms tant que `besoin = W / ((T − 1,5) × i/s)` ≤ 4 ms, et suit le besoin ×1,15 au-delà (16 ms au plus).
Au pire, le reste se fait sous le voile, en tranches de 22 ms (prebRetient, puis la phase 0 du passage étalé), jamais d'un bloc.

Chiffres au 13 Pro critical (20 i/s), 900 km/h (250 m/s) :
- à 4 ms par image, le pré-bâti avance de 4 × 20 = **80 ms de calcul par seconde de course** ;
- la jade (W ≈ 2 500 × 1,15 = 2 875 ms) demande 36 s de course à ce rythme ; une map à 900 km/h dure ~30-40 s (longueurCible : 45 → 20 s de croisière ×
  l'élan 1,8 → 1, palier ~15) : **4 ms ne suffisent pas toujours**. La tranche suit alors le besoin : pour T = 33 s, 2 875 / (31,5 × 20) = 4,6 ms → 5,3 ms
  par image (×1,15). Pour la grotte (4 500 ms de calcul sur le fil, le creusement chez le travailleur) : 5 175 / (31,5 × 20) = 8,2 ms → 9,4 ms.
- au DÉPART (vitesse 60 m/s), une map de ~4 km : T ≈ 66 s ; la jade demande 36 s : 66 − 7 − 1,5 = 57,5 ≥ 36 → on attend les 7 s sans risque.
  Un départ très rapide (moteur haut, T court) : la condition tombe, rien n'est attendu.
- l'attente de 7 s ne vaut qu'au départ de la COURSE (PVD.tC, pause exclue) ; après un portail rien ne change (le monde neuf s'installe 0,7 s, comme avant).

## 4. PROUVÉ (banc ×10, Chrome sans fenêtre, téléphone émulé tel=1 + profil iPhone14,2, perfrec=2, 17/11 après-midi)

Banc : `node outils/banc-portv/portv.cjs --page index.html --tours 3 --prof 1 [--q sans=portv] --out <x.json>` (sous ~/cash-car/verrou-banc.sh), lecture
`node outils/banc-portv/lire.cjs <x.json> [--prof]`. Une course (nuages au départ, immortelle, pistegraine=7), processeur ×10, suite jade → grotte → ville → nuages
répétée 3 fois (12 portails), la map d'en face imposée, la caisse posée à 1 400 m puis à ~6 s du portail. Image = intervalle entre deux rAF, de 2,5 s avant le voile
à 6 s après (les 400 ms qui suivent un saut de banc sont écartées). Tranche de pré-bâti = la plus longue durée de prebTick d'une image pendant l'approche.
Même page, mêmes conditions ; avant = `?sans=portv`.

| vers | pire image (3 passages) avant → après | images > 100 ms avant → après | plus long bloc de construction avant → après | pire tranche de pré-bâti avant → après |
|---|---|---|---|---|
| jade   | 217 / 233 / 183 → **67 / 83 / 67** | 2 / 2 / 3 → **0 / 0 / 0** | 137 / 145 / 142 ms d'un bloc → tranches de 22 ms | 66 / 126 / 46 → 62 / 39 / 33 |
| grotte | 250 / 183 / **683** → **83 / 83 / 83** | 13 / 2 / 2 → **0 / 0 / 0** | 189 / 137 / 651 → tranches | 131 / 109 / 132 → 55 / 101 / 69 |
| ville  | 300 / 267 / 250 → **100 / 67 / 67** | 3 / 2 / 2 → **0 / 0 / 0** | 281 / 241 / 222 → tranches | **372** / 170 / 176 → 47 / 25 / 28 |
| nuages | 150 / 250 / 217 → **83 / 83 / 83** | 1 / 3 / 2 → **0 / 0 / 0** | 137 / 150 / 167 → tranches | 99 / 87 / 88 → 28 / 31 / 31 |

- 0 exception, 0 erreur console (24 portails : 12 avant, 12 après).
- Ce qui reste > 50 ms autour d'un portail (profil, lire.cjs --prof) : l'image du CONTACT (`pcCopie` : drawImage de la toile WebGL vers la fenêtre des cubes, 34 éch.
  ≈ 50 ms ×10 — existait, inchangé) ; les images ordinaires de la map neuve (au banc ×10 la jade et la grotte font 50-67 ms par image sans aucun portail : médiane
  avant le voile 16,7-33 ms aux nuages, 33-50 en jade) ; aux nuages, l'arrivée des nuages du travailleur (`w.onmessage` → nuCompacte / computeBoundingSphere,
  système des nuages à la demande, hors de ce lot) ; quelques tranches d'un pas atomique (vsBatir avant son découpage, buildClouds ~50 ms au total en pas de ≤ 20).
- **Empreintes de route** (Node, outils/banc-routes) :
  - `empreinte.cjs graines=1-12` (genCtrl : ville, crypto, nuages, espace × paliers 0/10) : **identique** à la référence (origin/qualite-appareil) ;
  - genCtrlG + pisteTordPropreG menés une pause à CHAQUE occasion (JF.lim = −1) contre d'un trait, contextes neufs, ville/crypto/nuages/espace × paliers 0/10/20
    × graines 1-6 : **72/72 identiques** (48 pauses par ville) ;
  - grotte (genGrotte + pisteTordPropre, grtTraceG…) : en tranches contre d'un trait **18/18**, et d'un trait contre la référence **18/18** ;
  - `toutes.mjs` (dbgGenRoute dans Chrome, nuages/espace/ville/crypto/jade/grotte/canyon × 0/10/20 × 3 graines) : 63 routes, 0 erreur, **63/63 identiques** à la
    référence (fichiers JSON hors durées).
- Gardes : garde-demarrage OK, garde-allege ✔, garde-charte OK, `node --check` du gros script OK, assemblage `--depuis-morceaux` OK.

## 5. NON PROUVÉ
- **Rien sur le téléphone.** Les ms sont celles du Mac ×10 (swiftshader, la puce n'est pas bridée), pas du 13 Pro critical. Sur le téléphone le passage durera
  plus longtemps SOUS LE VOILE (la même somme de travail, étalée : ~1,2-1,6 s au lieu d'une image figée de 1,4 s, avec le serpent au-delà de 0,4 s) : à juger à l'œil.
- **Photos identiques avant / après : non obtenues.** Les photos à l'arrivée (`--photos`, dbgView à s = 200 m) sont prises en course vivante : 93-96 % de pixels
  différents dans les 12 paires (position de la caisse, palier, heure du ciel, nuages) — pas une preuve, ni dans un sens ni dans l'autre. La preuve d'égalité du monde
  est l'empreinte A/B (§ 4 et `empreinte-ab.cjs` : la route ET la scène bâtie d'un trait, référence contre branche ; la route bâtie d'avance en tranches contre d'un trait).
- **L'empreinte du MONDE bâti A/B dans Chrome (`empreinte-ab.cjs`) n'a pas tourné jusqu'au bout** : la page de référence (index-ref.html) n'a pas exposé ses
  crochets dbg* dans le temps du banc (deux essais), puis le verrou des bancs est resté pris par d'autres sessions (> 1 h). Le banc est prêt (commité) ; il contient
  aussi `dbgPortvRouteAB` (la route bâtie d'avance EN TRANCHES, échange avec la piste vivante à chaque tranche, contre la même d'un trait). À lancer :
  `node outils/banc-portv/empreinte-ab.cjs --pa index.html --qa "&sans=portv" --pb index.html` (sous le verrou). Les preuves d'égalité de ROUTE (§ 4) sont en Node et dans
  Chrome (toutes.mjs) ; celles du DÉCOR (ville, nuages, pièces, grotte, jade) reposent sur la construction (mêmes générateurs menés d'un trait par rythmeMene, mêmes
  tirages) et non sur une mesure.
- Les empreintes de scène relevées EN COURSE par portv.cjs (dbgPortvScene) diffèrent entre avant et après : les objets mouvants (caisse, pièces prises, nuages) et
  le palier du moteur (la route se met à l'échelle du palier : 6 routes sur 12 égales, et égales chaque fois que le palier l'était… sauf la grotte, dont la mémoire
  GRT_VUS dépend des grottes tirées avant — un pré-bâti d'une map au hasard annulé par dbgClassique au début du banc n'existe pas avec l'attente de 7 s du départ).
- **« Aucune tranche de pré-bâti > 30 ms » : pas atteint partout.** Après : ville 25-47, nuages 28-31, jade 33-62, grotte 55-101 ms ×10 (avant : 46-372).
  Restent d'un seul pas : un essai de route de la jade (jadeAGenG, le TIRAGE de la session routes-uniques : pas touché), la torsion d'un essai de la grotte (pisteTord
  pour la grotte n'a qu'un essai), des décors de grotte (grtD, grtExiCoupe, buildGrotteG), rythmeMesure (12-18 éch.).
- « Plus aucune image > 50 ms autour d'un portail » : pas atteint au banc ×10 — les images ORDINAIRES de la jade et de la grotte y font déjà 50-67 ms. Plus aucune > 100.
- Le passage étalé fige aussi les minuteries qui lisent la boucle (son moteur au dernier régime, HUD) pendant la construction — comme l'ancienne image figée.
- La liaison des programmes d'avance (prebLie, jadeChauffeProgs) n'est pas plafonnée à 4 ms : elle ne part qu'une fois toutes les 120 ms, jamais dans une image lourde.

## 6. À regarder sur le 13 Pro
1. Passer des portails (jade, grotte, ville, nuages) téléphone chaud : plus de gel au passage ; le voile (ou le serpent) reste un peu plus longtemps.
2. Boîte de vol : le rappel `R:function(){r1(function(){ if(PORTV.att!==tok)…` ne doit plus figurer dans « rappels > 8 ms » au-delà de ~25 ms ; la nouvelle ligne
   `PV:etale` (nombre, total, pire) donne les tranches sous le voile ; boîte noire `portail | construction étalée N ms sous le voile`.
3. Le départ d'une course : le pré-bâti (P de la boîte de vol) ne doit pas commencer avant ~7 s.
4. Console : `dbgPortv()` (étapes de chaque construction : actif, sousVoile, pas, pasMx, chauffe), `dbgPortvEtale()`.
5. `?sans=portv` (via CC_QS) : l'avant, pour comparer.

## Commandes
```
node outils/banc-portv/portv.cjs --page index.html --tours 3 --prof 1 [--photos <dossier>] [--q sans=portv] --out <x.json>
node outils/banc-portv/lire.cjs <x.json> [--prof] [--long 60]
node outils/banc-portv/empreinte-ab.cjs --pa index-ref.html --pb index.html [--cartes …] [--graines 1-2] [--paliers 0,10] [--routes jade:midi,grotte:midi,…]
node outils/banc-routes/empreinte.cjs graines=1-12            (Node, sans Chrome)
```
(`index-ref.html` : une copie assemblée de la référence, posée à côté d'index.html, jamais commitée.)
