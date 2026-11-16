# LOT CHALEUR — le juge de chaleur, l'image lourde à serious, fair aligné : rapport (14-15/11)

Branche `qa/chaleur` (partie de `qualite-appareil` 75afffba5), worktree `~/cash-car/qualite-chaleur`. `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS commités
(l'intégrateur : `node code/assembler.cjs --depuis-morceaux`).

Fichiers touchés :
- `code/moteur/profil-juge.js` : section « LE JUGE DE CHALEUR » (`PJC`, `pjcDepart`, `pjcTick`, `pjcLit`), l'appel dans `prfJuge`, `dbgJuge().chaleur`, `dbgJuge('oubli')` efface aussi la séance.
- `code/moteur/gouverneur-paliers.js` : section « FAIR N'EST PLUS MOINS BEAU QUE SERIOUS » (`GDX_FAIR`, `GDX_FQL`), section « L'IMAGE LOURDE À SERIOUS » (`GDX_L`, `gdxLourd`, `gdxLourdTick`, `dbgGouvVrai`), `dbgGouvPaliers().lourd` / `.fairQl`.
- `code/rendu/soleil-planete.js` (bloc PRF seulement) : `T.chaudK` (lu dans `sessionStorage.ccPjgChaud`), `prfNivT` et `prfFpsT` bornés par lui.
- `code/rendu/nettete-qualite.js` (hors de ma liste, trois retouches d'une ligne, nécessaires au point 2) : `prfLourd()` dans la condition de la borne HAUTE de `qlPose` ; `prfRegle(q, sansReprise, pq)` (la raison écrite au journal) ; `dbgPrf().chaudK`.
- `outils/banc-juge/juge.cjs` : pas `chaud:<départ>:<états>:<s>[:branche][:vrai=<ms>]` ; `vieillir` recule aussi les dates `br`.
- `gouverneur-thermique.js` : pas touché.

## (1) Le juge de chaleur (`?sans=jugechaud`)
Téléphone profilé, en course, capteur d'iOS présent, niveau N2 et plus :
- **Course brûlante** : l'état passe à critical pendant la course alors qu'elle a commencé à serious ou moins.
  - Une course commencée critical ne compte pas, ni une course commencée avant que le capteur ait parlé.
  - Une seule course brûlante par séance (= chargement de page ; le rechargement après une perte de contexte reste la même séance, par `sessionStorage`).
- **À chaud** : le niveau descend d'UN cran (`prfK` : N4 → N3, N3 à 60 → N3 à 30, N3 à 30 → N2, N2 → N1) pour le reste de la séance.
  - Ce cran est dans `PRF.T.chaudK`, gardé dans `sessionStorage.ccPjgChaud` ; il ne vaut que pour la classe qui l'a appris.
  - Le changement passe par `prfRegle(q, true, raison)`, puis le palier du gouverneur est posé tout de suite sur le nouveau niveau (`mobPalApplique` : le palier critical, s'il ne l'était pas encore, ou le même palier reposé). Ça coûte UNE réallocation de la toile de plus que la seule recette critical.
  - Le statique (`nMax`, filtre d'ombre, étages construits, maps) ne bouge pas.
  - La baisse joue aussi sous `?classe=` (le cas mesuré sur le 13 Pro), mais jamais sous `?prfniv=`.
- **Durable** : chaque séance brûlante est notée dans `cashcarProfil.br` sous la forme `[date, poids]` ; les séances de plus de 7 jours tombent.
  - Le poids vaut 3, ou 2 si le téléphone a été branché pendant la course (`__ccBranche ≥ 2`). Le seuil est 6 : deux séances débranchées, ou trois branchées.
  - Le seuil atteint, `pjgBaisse` met le plafond un cran sous le cran qui a brûlé, avec le mur habituel (1, 2, 4, 8 j, puis retentative d'un cran au-dessus), et vide `br`.
  - En retentative (mur fini, au-dessus de l'ancien plafond), une seule séance brûlante suffit.
  - Le témoin en vol est retiré avant toute écriture, puis le juge le repose à la seconde suivante s'il n'a rien baissé.
  - Rien n'est écrit sous `PJG.force` ni pour un modèle inconnu (`pjgEcrit`). N1 : rien.
- Journal : des lignes `profil` (« juge de chaleur : course brûlante (état 2 → critical) : N3 à 30 → N2 pour la séance », « séance brûlante notée (3/6 points en 7 j) », « plafond … au prochain lancement … »).

## (2) L'image lourde à serious (`?sans=gdxlourd`)
doux.md le confirme : en HAUTE la borne `hauteK` (2) tenait jusqu'à critical, donc la résolution restait figée. Et même en BASSE, calée sur 30, une image de 29 ms reste à l'heure : l'échelle (boucle-1.js, qui lit l'intervalle ramené à une image d'écran) ne voyait rien.

Désormais, au niveau N2 et plus, à serious, en course, BASSE comme HAUTE :
- **La mesure** : chaque mesure FRAÎCHE de `QLR.vrai` (la sonde existante, rien n'est réarmé) au-dessus de 85 % de la période (la cadence calée, sinon 1000 / PRF.fps).
- **Lourde** : au moins deux mesures sur 20 s ou plus, sans une seule en dessous. Alors :
  - la borne HAUTE tombe jusqu'à la fin du serious (`gdxLourd()` → `prfLourd()` dans `qlPose`) ;
  - le gouverneur demande à l'échelle UN cran de résolution : le premier sous le plafond, au rythme du doux (une résolution toutes les 10 s au plus), jamais sous `kNet`. Il faut ensuite 20 s lourdes de nouveau pour un cran de plus.
- **Contre le yoyo** : tant que la mesure dit que le cran au-dessus serait encore lourd (coût × (DPR au-dessus / DPR)² > 85 %), le mur de l'échelle (`QL.mur`, 45 s) est reposé à chaque mesure. Sinon, c'est la remontée normale (20 s tenues).

## (3) Fair aligné sur serious (`?sans=fairdoux`)
Le plancher QL de fair passe de 3 à 2 (`MOB_PDX`, `MOB_PPDX`).
- Au N1, fair = halo ½ à 2 étages et ombre 768 (au lieu de 3/8) ; serious = halo ½ à 2 étages, ombre 512, ciel 1/4. Fair n'est donc plus jamais sous serious.
- Au N2 BASSE, fair = halo entier, cran 2.

## VÉRIFIÉ (banc)
Conditions :
- `outils/banc-juge/juge.cjs` : UN Chrome sans fenêtre et muet, ports 9981/9982, sous `verrou-banc.sh` (4 processus Chrome au départ), verrou rendu seulement s'il était encore à moi, Chrome fermé.
- iPhone émulé 844×390 DPR 3, TEL_NATIF vrai, états posés par `dbgThermique`.
- `node code/assembler.cjs --depuis-morceaux` : 330 morceaux d'accord ; `garde-demarrage` OK ; `garde-allege` OK.
- 0 exception et 0 console.error sur tous les pas. La seule « panne » vient du pas `neuf` (dbgErreurs sur la page sw.js), sans rapport.

| scénario | résultat |
|---|---|
| iPhone15,4 HAUTE (N3), course partie serious → critical | à chaud N3 → **N2** : toile 1012×468 (80 % de 1,5), ombre 512 PCFSoft (statique gardé), halo ½/2 ; `br` = 3/6 ; témoin reposé |
| 2e séance (sessionStorage vidé), partie fair → serious → critical | « plafond N3 à 30 → N2 au prochain lancement · 2 séances brûlantes en 7 j · 1 j » ; `br` vidé ; relancé : **N2, statique N2** |
| course partie CRITICAL (puis 2 → 3 dans la même course) | « commencée déjà critical : ne compte pas » ; N3 gardé, rien écrit |
| iPhone14,2 BASSE (N1), serious → critical | « N1 : rien », N1 gardé |
| iPhone14,2 HAUTE (N2) | N2 → N1 pour la séance, 3/6 |
| iPhone17,1 HAUTE (N4) **branché**, trois séances | 2/6, 4/6, puis « plafond N4 → N3 · 3 séances brûlantes » ; à chaud N4 → N3 à 30 chaque fois ; relancé N3 à 30 |
| `?classe=2` sur iPhone14,5 (le cas de Sacha) | à chaud N3 → N2, « rien d'écrit (paramètre d'essai) » ; mémoire inchangée |
| `?classe=2&sans=jugechaud` | N3 critical à 1,6 de DPR, rien d'autre ; 1 changement de résolution (contre 2 avec le juge : la recette critical + la baisse) |
| retentative : plafond N2, mur vieilli de 2 j → N3 à 30 retenté, une séance brûlante | « au retour, une course brûlante » → plafond N2, mur 2 j (n = 2) ; vieilli de 8 j → N3 retenté |
| expiration : une séance, vieillie de 8 j, puis une séance | 3/6 (la vieille est tombée) |
| rechargement dans la même séance | « séance brûlante : N2 au plus », niveau N2, statique N3 gardé |
| lourd : iPhone15,4 HAUTE N3, serious, sonde simulée 29 ms | ~20 s plus tard : DPR **2 → 1,75** (cran 6, une réallocation) ; mesure suivante 22,2 ms → le mur tient (prévu 29 au-dessus), resté à 1,75 pendant 44 s |
| lourd : iPhone14,2 HAUTE N2, 30 ms | 1,5 → 1,44 ; 27,6 ms ensuite, le mur tient |
| lourd : N2 BASSE, 20 ms (le N2 mesuré) | rien |
| lourd `?sans=gdxlourd`, 29 ms | rien (cran 2, DPR 2) |
| fair N1 | cran 2, halo ½/2, ombre 768 ; `?sans=fairdoux` : cran 3, halo 3/8 |

Contre le témoin (`qualite-appareil` assemblé dans le scratchpad, même banc, `thermo:0,1,2,3`) :
- **Hors profil** (iPhone sans modèle) et **`?sans=profil`** : identiques au témoin champ par champ (palier, cran, plancher, plafond, toile, halo, étages, ombre, ciel, traits, période).
- **N1** : identique, sauf fair (la retouche voulue, point 3).
- **Ordinateur** (`banc-profil --pc 1`, `poste=max`) : identique champ par champ, sauf le champ ajouté `chaudK` et la ligne `fluide` (la carte tirée).

## NON vérifié
- Rien sur un vrai iPhone : le vrai capteur, `__ccBranche`, la vraie sonde.
- **La fréquence réelle de `QLR.vrai`** : dans un build de mesure (boîte de vol), la sonde parle toutes les 5 s. Dans un build normal, calé à 30 et à l'heure, l'échelle ne la réveille PAS (elle ne tire pas) : la règle lourde ne verra alors aucune mesure et ne fera rien. Ce point est à trancher (voir les questions).
- Le cran lourd passe par l'ordre de l'échelle : le cran 6 éteint aussi les crans d'effets 3-5 (halo ×¾, ombre deux crans plus bas, flou radial). Au N3 : halo 3/8, ombre 768.
- La baisse à chaud quand le juge passe AVANT le gouverneur dans la même seconde : le palier critical et le nouveau niveau sont posés ensemble (une réallocation). Lu, non distingué au banc, où les deux passent dans le même ordre.

## Questions pour le pilote
1. La règle lourde sans sonde réarmée ne voit rien dans un build normal calé à 30. Faut-il armer la sonde toutes les 5-10 s à serious, au N2 et plus ? Sur iPhone, c'est la barrière, qui ne bloque pas.
2. Le cran lourd doit-il garder les effets (baisser seulement `DPR_CAP`, comme le `dk` de critical) plutôt que de suivre l'ordre de l'échelle ?
3. Le poids branché donne 3 séances ; la lettre disait « pour moitié », ce qui ferait 4 séances à 0,5. J'ai suivi « il faut alors trois séances ».

## À juger sur le 13 Pro
1. `?classe=2`, HAUTE, branché : quand le téléphone passe critical, une ligne « juge de chaleur : … N3 à 30 → N2 pour la séance » ; le jeu tient-il mieux ensuite (moins de 18 i/s ?) ;
   au relancement de l'app : N3 de nouveau (rien d'écrit sous `?classe=`).
2. N2 (classe 1 HAUTE) à serious, build de mesure : aucune ligne « image lourde » (20-21 ms < 28,3).
3. N1 fair : le halo est-il aussi beau qu'à serious ?
