# LE PILOTE DE QUALITÉ — plan d'implémentation (17/11)

Branche `qualite-appareil`, chantier `~/cash-car/qualite`. Un seul développeur, une nuit, quatre étapes livrables.
Chaque étape se livre seule : `node code/assembler.cjs --depuis-morceaux`, `sw.js` +1, commit (le crochet pousse).
Fichiers interdits : `code/maps/*`, `piste-prebati.js`, `route-sans-haut.js`. Rien ici n'y touche.

## 0. Le jugement des trois conceptions

| Critère | 1 · Budget d'image | 2 · Table des conditions | 3 · Échelle unique |
|---|---|---|---|
| Stabilité | bonne (bande morte, murs) | bonne (pas de boucle rapide) | bonne (un cran par moment calme) |
| Anticipation réelle | mémoire par condition + dette thermique | la plus forte (λ de passage) mais sur 3 séances | anticipation légère + mémoire |
| Invisibilité | [C] / [V] nets | moments invisibles nets | la plus stricte : DPR entre courses seulement |
| Risque de régression | moyen (barrière continue, minuterie à 0,75 T) | moyen (réglage BASSE/HAUTE change de sens) | faible (réglages existants d'abord) |
| Simplicité | moyenne | faible (modèle de taux, priors) | bonne |
| Prouvable sur le téléphone | oui (histogramme, tics ratés) | calibrage lent (± 50 % après 3 séances) | oui |

Décision :
- **SOCLE = la conception 3** : un seul écrivain, un curseur K, la résolution ne bouge qu'entre deux courses, les gouverneurs d'aujourd'hui deviennent des capteurs.
- **De la 1** : la mesure par les **tics ratés** (intervalles rAF bruts) et l'**histogramme en cases de 8 ms** ; les zones ROUGE / ORANGE / VERT / BLEU ; les murs doublés ; la marque [C] / [V] de chaque cran ; la cadence toujours multiple du tic.
- **De la 2** : le **départ lu sur les conditions** (branché, économie, thermique, batterie) AVANT la première image ; la table de départ ; la raison écrite au journal (« K0 refusé : branché + éco »).
- **Écarté** : le modèle de taux λ de la 2 (trop peu de séances, deux essais identiques diffèrent de ×2) ; la barrière armée une image sur 3 de la 1 (minuteries regroupées par iOS en économie, non vérifié) ; la portée, la densité et la géométrie (phase 2 : contrat avec la session maps) ; l'ombre au sol une image sur deux et le sous-rectangle (phase 2, derrière un interrupteur, preuve photo d'abord).

Ce que le code m'a appris en le lisant (à savoir avant de coder) :
1. `CAD.ecran` ne descend jamais sous 16,7 ms (`cadSaute`, cadence.js:65 : `m<15?75:60`). Un rAF à 30 Hz n'y est vu que par `CAD.eco`, qui exige `__ccEco===1`. **La mitigation thermique de WebKit (30 Hz sans économie) est donc invisible aujourd'hui.** Le pilote garde la médiane brute `m` dans un champ neuf `CAD.eM`.
2. Hors profil (iPhone 11, palier MOYEN), `MOB_GOUV` est faux (`CAD30_REC` exige `PAL.n===2`, gouverneur-thermique.js:25 et cadence.js:38) : `cc:thermique` n'y est **même pas écouté**. Le pilote hors profil est une étape à part (3b).
3. Trois choses réallouent en course aujourd'hui : `applyDPR` (qlPose, nettete-qualite.js:180), `bloomPass.setSize` (qlPose:176, au cran 3 ou quand `BLOOM_BASE` change) et une carte d'ombre d'une taille jamais vue (qlPose:175, avant que `QL.ombres` la garde).
4. Le natif (`app-ios/natif/natif.js` et GardeThermique côté Swift) fournit déjà `__ccThermique`, `__ccBranche`, `__ccBatterie`, `__ccEco` et l'événement `cc:thermique`. **Aucune modification du natif.**

## 1. ÉTAPE 1 — Le socle : conditions, niveau visé, pose aux moments invisibles, journal

### Fichier neuf
`code/moteur/pilote-qualite.js`, inscrit dans `code/ORDRE.txt` juste après `moteur/gouverneur-paliers.js` (ligne 329), avant `profil-juge.js` et `boucle-1.js`.
Il voit tout (une seule fonction englobante) : `PRF`, `MOB_S`, `mobEco`, `CAD`, `QL`, `QLR`, `imgRegle`, `qlPose`, `prfRegle`, `mobPalEcrit`, `MOB_P0`.

### L'objet
```
PIL = {on, K, Kv /*visé*/, dette, src /*'table'|'memoire'|'force'*/, cle, tic, h:Uint16Array(16), seg, mur, jr:[]}
pilOn()   : PIL_ON && MOB_PALS && PRF.on            (étape 3b élargit hors profil)
PIL_ON    = !/[?&]sans=[^&]*\bpilote\b/.test(location.search)
```

### Lecture des conditions — `pilCond()`
- `t` = `MOB_S.capteur ? MOB_S.thermo : -1` (gouverneur-thermique.js:97).
- `B` = `(window.__ccBranche|0)>=2` (même lecture que `mobBranche`, gouverneur-paliers.js:152).
- `E` = `mobEco()` (gouverneur-thermique.js:80).
- `bat` = `window.__ccBatterie` ; sous 20 % = « iOS bride ».
- `tic` = `pilTic()` : 33,3 si `CAD.eM>=24` (rAF mesuré à 30) ou `E`, sinon `CAD.ecran`.
- Clé de condition : `PRF.modele + '|B'+B+'E'+E+'T'+t`.

À ajouter dans `cadSaute` (cadence.js:65), dans la branche `MOB_ECRAN` qui calcule déjà la médiane `m` : `CAD.eM=m;`. Une affectation, rien d'autre.

### Le niveau visé au départ — `pilDepart()`
Calculé sous le serpent (au chargement) et à chaque `resetGame` (seconde-chance.js:437), avant la première image de course.
Table (étape 1 : le départ seulement ; l'échelle K vient à l'étape 3) :

| Conditions | Niveau posé | Pourquoi |
|---|---|---|
| débranché, sans éco, nominal ou fair, batterie ≥ 20 | `PRF.nMax` (ULTIME de la classe) | N2 mesuré 18-21 ms sur 33 au 13 Pro |
| branché OU éco, nominal ou fair | `PRF.nMax` | N2 à serious branché + éco : 20-21 ms, 29,4 i/s |
| serious | `PRF.nMax` (les crans [C] feront le reste) | idem |
| critical, ou batterie < 20 | `nMax − 1` (au plus bas N1) | puce bridée |

Le réglage du joueur devient un PLAFOND :
- sauvegarde qui n'a jamais choisi (`SAVE.d.qChoisi` absent) = AUTO = plafond `nMax` ;
- BASSE choisie = plafond `T.c[c].fast` ; HAUTE choisie = plafond `nMax`, consigne de budget 0,85 au lieu de 0,75.
- **À faire valider par Sacha** (le libellé du bouton ne change pas cette nuit). `?sans=pilauto` = BASSE reste le niveau, comme aujourd'hui.

### Poser un niveau sans passer par BASSE/HAUTE
Dans `code/rendu/nettete-qualite.js`, couper `prfRegle` (ligne ~278) en deux :
- `prfPoseNiv(n, sansReprise, raison)` : le corps actuel à partir de `PRF.n=…` (fps, dpr, `bb/nm/om`, `IMG_REGLE0`, `VHD`, `prfNote`, `qlReprise`), mais avec `n` donné.
- `prfRegle(q,…)` calcule `n` comme avant puis appelle `prfPoseNiv`. Au bit près sous `?sans=pilote`.

### Les moments invisibles — `pilMoment(quoi)`
Un appel d'une ligne, dans un `try`, à chaque endroit :

| Moment | Où | Ce qui y est permis |
|---|---|---|
| `'depart'` | `resetGame()` seconde-chance.js:437 (fin de fonction) | tout : niveau, DPR, halo, ombre |
| `'mort'` | `endGame()` seconde-chance.js:579 (fin de fonction) | tout (voile de l'écran de fin) |
| `'pause'` | `pilTick` voit `paused` depuis plus d'1 s (`togglePause`, init.js:359, rien à y toucher) | tout |
| `'menu'` | `pilTick` voit `!started || garageOn` | tout ; poser aussi `VHD.k0` (vhdBascule le rend à la sortie) |
| `'portail'` | `portailPasse()` portail-passage.js:71, juste après `flashEcran(...)` | crans [C] et [P] seulement : **jamais le DPR ni le niveau** |

Jamais : pendant le 3-2-1, une réanimation (seconde chance), le final spin.
`pilAppliquer(K, moment)` : un seul `imgRegle({...})` qui redit toutes les clés (comme `mobPalApplique`, gouverneur-paliers.js:176), plus `mobPalEcrit('qlMin'|'ventK'|'emiK')` et `__ccPoly.on`.

### Prise de main (un seul décideur)
- `mobPalTick` (gouverneur-paliers.js:188) : garder les lignes 189-193 (cadence d'une seconde, `GDX_DK`, `MOB_LONG`), puis `if(pilOn()){pilTick(now,enCourse);return;}` **avant** `gdxLourdTick` (ligne 194). `mobPalCible`, `mobPalApplique`, `gdxLourdTick` ne s'exécutent plus. La ligne 191 (`__ccPoly.on`) est réécrite par `pilTick`.
- `mobThermo` (gouverneur-thermique.js:~103) : le `qlPose(QL.k+1)` du critical ajoute `&&!pilOn()`.
- `pjcTick` (profil-juge.js:204) : sous `pilOn()`, il note la course brûlante (journal + `sessionStorage.ccPjgChaud`) mais n'appelle plus `prfRegle`. Sa note devient une entrée de la mémoire (étape 4).
- `boucle-1.js` lignes 120-146 (la règle QL automatique) : la descente et la remontée sont sautées sous `pilOn()` (`if(!pilOn()){…}`). La ligne 83-84 (ombre en vol ½ quand `QL.k>=1`) reste : c'est un réglage, pas une décision.
- `vhdBascule` et le filet VHD (menu) : inchangés.

### Journal
- Boîte noire, genre `pilote` (`window.__ccNote`, page/debut-corps.html:111) :
  - au départ : `départ N2 K0 · clé iPhone14,2|B1E1T1 · source table · raison : branché+éco, fair · plafond AUTO` ;
  - à chaque changement : `K3→5 · rouge · ratés 9 % · vrai 31,2 ms / tic 33,3 · th 2 éco 1 br 1 · map jade · portail` ;
  - une ligne `retaille` à chaque `applyDPR` avec le moment (attendu : jamais « course »).
- Enregistreur : `bvSec` (enregistreur-perf.js:99), une colonne par seconde alignée sur S : `c.PL.push(K, zone, dette, ratés, appels/100, tri/1e4, tic|0)` ; `bvPrf` (:88) gagne `K`.
- **L'histogramme** : dans `cadSaute` (cadence.js:64), là où `d` (intervalle rAF brut) est déjà calculé : `if(PIL_H)PIL_H[Math.min(15,d/8|0)]++;`. Remis à zéro par course, recopié dans la course de l'enregistreur (`c.H`). Il prouve les pics 33 / 66 / 100.

### Interrupteurs
`?sans=pilote` (aujourd'hui au bit près) · `?pilote=N2` / `?pilote=K5` (forcé, rien n'est appris) · `?pilote=fige` (départ calculé, puis plus rien) · `?sans=pilauto` · `dbgPilote()` (conditions, clé, niveau, K, dette, murs, histogramme) · `dbgPiloteSim({t,B,E,bat,vrai,rates})` (simule les capteurs, sur le modèle de `dbgGouvVrai`, gouverneur-paliers.js:134).

### Preuve au banc (étape 1)
Banc neuf `outils/banc-pilote/pilote.cjs`, copié de `outils/banc-doux/doux.cjs` (UN Chrome sans fenêtre et muet, iPhone émulé 844×390 DPR 3, TEL_NATIF vrai, `&appareil=iPhone14,2`). Il vérifie :
1. `?sans=pilote` : `dbgGouvPaliers()`, `dbgNette()`, `imgRegle()` identiques clé par clé à la branche d'avant (même graine, mêmes `dbgThermique(n)`).
2. Les 4 départs : 13 Pro débranché froid → N2 ; `dbgPiloteSim({B:1,E:1,t:1})` → N2 ; `t:3` → N1 ; `&classe=2&appareil=iPhone16,1` → N3.
3. Une course avec `dbgThermique(2)` puis `dbgThermique(3)` : aucune ligne `retaille` hors `depart|mort|pause|menu`.
4. 0 exception, 0 `console.error`.

## 2. ÉTAPE 2 — Plus de retaille en course ; CAD_CRIT20 remplacé

### Verrou de la résolution — `qlPose` (nettete-qualite.js:173)
Juste après `k=qlDoux(k,b)` :
```
if(pilVerrou()){ /* en course, hors moment invisible */
  while(k>QL.k&&qlDpr(k,b)<curDPR-.001)k--;
  while(k<QL.k&&qlDpr(k,b)>curDPR+.001)k++;
  if(br9_change) …  /* voir ci-dessous */ }
```
- `pilVerrou()` = `pilOn() && started && !gameOver && !paused && !PIL.voile`. `PIL.voile` est vrai pendant `pilAppliquer` aux moments `depart|mort|pause|menu`.
- La ligne 176 (`bloomPass.setSize`) : sous `pilVerrou()`, si `br !== BLOOM_RES`, on **ne change pas** `BLOOM_RES` ; on note une dette (le cran sera posé au moment suivant).
- La ligne 180 (`applyDPR`) : sous `pilVerrou()`, jamais. Un `imgRegle({dpr})` reçu en course pose `DPR_CAP` et attend le moment suivant (dette).
- **Préchauffage des ombres** : au chargement (fin de `nettete-qualite.js`, après le `qlPose(qd9)` de départ), sous `pilOn()`, allouer une fois les tailles `512, 768, 1024, 1280` ≤ l'ombre du niveau dans `QL.ombres` (le mécanisme de la ligne 175). Coût ≈ 10 Mo de profondeur. Ensuite un cran d'ombre en course ne réalloue rien.

### La cadence — `cadPer` (cadence.js:74)
```
if(CAD_CRIT20){try{if(MOB_S.capteur&&MOB_S.thermo>=3){
  if(!pilOn())return 50;                      /* aujourd'hui */
  if(pilTic()<20)return 50;                   /* rAF à 60 : 50 ms = 3 tics, régulier */
  /* rAF à 30 : 50 ms donnerait 33/66 en alternance → on garde 33 */ }}catch(e){}}
return CAD.per;
```
- Le 15 i/s régulier (66 ms, 2 tics) reste derrière `?pilote15=1`, éteint : 66 ms dépasse le pas maximal de la physique (50 ms), il faudrait deux sous-pas. Pas cette nuit.
- `?sans=crit20` garde son sens.

### Interrupteurs
`?sans=pilverrou` (le verrou seul coupé, pour comparer les gels) · `?pilote=portaildpr` (le DPR permis au portail, essai).

### Preuve au banc (étape 2)
1. Compteur `PIL.nRet[moment]` incrémenté dans `applyDPR` (init.js:420) : après 3 courses simulées nominal → serious → critical avec `dbgGouvLent(40)` (téléphone lent dont le coût suit les pixels, cadence.js) : `nRet.course === 0`.
2. `bloomPass.setSize` compté de même : 0 en course.
3. `cadPer()` : avec `CAD.eM=33` et `dbgThermique(3)` → 33,3 ; avec `CAD.eM=16,7` → 50.
4. Le mouchard du banc (`perfAcoup`, nettete-qualite.js) : aucun « + tex » en course.

## 3. ÉTAPE 3 — L'échelle des crans, branchée sur les réglages existants

### L'échelle (téléphone profilé). K0 = le niveau posé à l'étape 1.
Chaque cran CUMULE les précédents. Les valeurs sont relatives au départ du niveau (`MOB_P0`, gouverneur-paliers.js:140), comme `mobPalVoulu`.

| K | Ce qui s'ajoute | Réglage existant | Marque |
|---|---|---|---|
| 0 | ULTIME du niveau | rien (`imgRegle('reset')`) | — |
| 1 | ombre en vol une image sur 2 | `QL.k=1` (boucle-1.js:83) via `qlMin` 1 | [C] |
| 2 | ciel lisse 1 image sur 2 | `imgRegle({ciel:2})` | [C] |
| 3 | polyphonie ×½ | `__ccPoly.on=true` (gouverneur-paliers.js:20) | [C] |
| 4 | halo : un étage de moins | `imgRegle({mips:mips-1})` | [C] |
| 5 | ombre un cran plus bas | `imgRegle({ombre:mobOmbreBas(om,1)})` (cartes préchauffées) | [C] |
| 6 | ciel 1/4 ; traits et traînées ×0,75 ; vent et émission ×0,75 | `imgRegle({ciel:4,stries:.75})`, `mobPalEcrit('ventK'/'emiK')` | [C] |
| 7 | halo d'entrée ½ | `imgRegle({halo:'demi'})` → `bloomPass.setSize` | [P] portail |
| 8 | ombre 512, halo à 2 étages, ciel 1/8, traits ×½ | = `GDX_CRI` sans `dk` (gouverneur-paliers.js:88) | [P] |
| 9 | niveau − 1 | `prfPoseNiv(n-1, …)` | [V] |
| 10 | DPR un pas sous le plafond du niveau | `imgRegle({dpr:cap-.125})` | [V] |
| 11 | DPR au plancher net | `imgRegle({dpr:qlBornes().pl})` | [V] |
| 12 | SURVIE : halo coupé | `imgRegle({halo:'off'})` (⚠ `QUAL_LOW` : les traînées n'éclairent plus la route) | [V] |

[C] = à chaud, en course. [P] = au portail ou mieux. [V] = sous voile seulement (départ, mort, pause, menu).
Ordre d'après la radio : appels et passes d'abord (ombre, ciel, halo), pixels en dernier. Les gains sont des estimations : la radio en pause par K les remplacera (preuve 3).

### Le départ par conditions (remplace la colonne « niveau » de l'étape 1)

| Conditions | Départ |
|---|---|
| débranché, sans éco, nominal | K0 |
| débranché, sans éco, fair | K1 |
| branché OU éco, nominal ou fair | K2 |
| branché ET éco, nominal ou fair | K3 |
| serious | K5 (+2 si branché) |
| critical | K8 |
| batterie < 20 % | +2 |

### La règle — `pilTick(now, enCourse)`, une fois par seconde
Fenêtre glissante de 10 s de course. Exclus : pause, menus, et 1 s après un portail ou une construction (`loop._rebuildT`, déjà lu par `perfAcoup`).
- **Tic raté** : intervalle rAF brut ≥ 1,5 × `pilTic()`.
- **Vrai coût** : `QLR.vrai` (la barrière existante, nettete-qualite.js:69). Sous `pilOn()` elle s'arme en production toutes les 10 s de course (5 images) : un `qlSondeArme()` dans `pilTick`. Mesurer le coût de l'armement au banc avant de le garder.
- Budget `b` = 0,75 (0,85 en HAUTE choisie) ; branché + éco : − 0,05.

| Zone | Condition | Action |
|---|---|---|
| ROUGE | ratés > 8 % sur 3 s, ou vrai > 1,0 × tic | +1 cran [C] tout de suite, au plus un toutes les 3 s ; [C] épuisés → dette +1 |
| ORANGE | ratés 2-8 % sur 10 s, ou vrai > (b + 0,05) × tic | dette +1, payée au prochain moment permis par le cran |
| VERT | entre les deux | rien (bande morte) |
| BLEU | ratés < 0,5 % ET vrai < 0,55 × tic, 60 s cumulées ; aucun ROUGE depuis 120 s ; thermique stable ou en baisse ; coût prédit du cran au-dessus `vrai × (DPR haut / DPR)²` < 0,70 × tic | −1 cran au prochain moment permis |

- **Anticipation** : quand `t` monte (fair → serious → critical), ou quand le téléphone est branché alors que l'éco est active, la différence avec le départ de la table pour le nouvel état est posée en **dette**, avant que les images ne ratent. Elle se paie au prochain moment permis.
- **Mur** : une montée suivie d'un ORANGE ou ROUGE dans les 30 s → on redescend au moment suivant et ce cran est un mur 2 min, puis 4, 8, 16 (par clé de condition).
- **Pas** : au plus un cran par moment invisible vers le haut ; vers le bas, autant que la dette, d'un coup.

### Interrupteurs
`?pilote=K<n>` · `?pilote=ultime` (K0) · `?pilote=survie` (K12) · `?pilote=gel` (mesure, ne change rien) · `?pilcible=0.7` · `?sans=pilanticipe`.

### Preuve au banc (étape 3)
1. `dbgPiloteSim` : ROUGE → un cran [C] en ≤ 1 s, jamais [P]/[V] en course ; ORANGE → dette payée au `portailPasse` suivant (crans ≤ 8) ou à la mort (crans 9-12) ; BLEU 60 s → −1 au moment suivant, puis mur après une montée ratée ; VERT pendant 10 min → 0 changement.
2. `?pilote=ultime` : `dbgNette()` et `imgRegle()` égaux à `?prfniv=2` HAUTE (13 Pro), photo identique au banc photo (`outils/banc-ecrans`).
3. La radio en pause (desktop-banc.js:138-161) à `?pilote=K0..K12` : appels, triangles, « appels seuls », « sans pixels ». Elle donne la vraie table ms par cran et peut réordonner 1-8.
4. Banc photo des crans [C] 1-6 (`dbgStep`, graine fixe `?pistegraine=`) : écart < 1 px de silhouette, sinon le cran passe en [P].

### 3b. Hors profil (iPhone 11, palier MOYEN) — si le temps le permet
- `pilOn()` s'élargit à `TEL_NATIF && (PRF.on || PAL.n>=1)`.
- Le pilote écoute lui-même `cc:thermique` (pas de `MOB_GOUV` ici, voir la note 2 du §0).
- Même échelle sans le cran 9 ; le DPR passe par `dprPlafond0` (palier-appareil.js:272) et `imgRegle({dpr})`.
- Banc : `&appareil=iPhone12,1`, sans `&classe=`.

## 4. ÉTAPE 4 — L'apprentissage local (retenu, version légère)

Pas de modèle de taux. Une mémoire du **cran tenu** par condition.
- Clé `localStorage.cashcarPilote` : `{v:1, m:modèle, K:{"B1E1T2":{k, n, t, mur:{k,fin,d}}}}`. Miroir dans les préférences natives comme `cashcarProfil` (`pjgPrefs`, profil-juge.js).
- **Écriture** à la fin d'une course (`pilMoment('mort')`) : pour chaque état `t` traversé pendant au moins 30 s, le K le plus haut tenu sans ROUGE. Moyenne avec l'ancien (`k = round((k*n + kTenu)/(n+1))`, `n` plafonné à 5).
- **Ignoré** : batterie < 20 %, page tuée en course (le témoin de `PRF.temoin`), course < 30 s, `?pilote=*`, `?classe=*`, `?appareil=*`.
- **Vieillissement** : plus de 7 jours → l'entrée est jetée.
- **Lecture** : au départ, `K = min(table, appris)` si l'entrée a moins de 7 jours et `n ≥ 2` ; la raison est écrite (« source mémoire »). À un changement de `t`, la dette d'anticipation vise le K appris pour le nouvel état.
- La course brûlante du juge (`pjcTick`) devient une entrée : critical vu à K → la clé `T2` apprend `K+2`.
- `dbgPilote('oubli')` vide la clé et le miroir. `?sans=pilmem` : départ sur la table.

### Preuve au banc (étape 4)
Rejouer au banc 3 courses `dbgPiloteSim` avec les conditions des vols 1115-1117 (`th`, `bat`, `eco` de chaque course de `~/cash-car/ios-ultime-mesures/vol/`) : la 4e course part du K appris ; une course à batterie 15 % ne change rien à la mémoire.

## 5. La preuve sur le téléphone (après la nuit)

13 Pro de Sacha, BRANCHÉ + MODE ÉCONOMIE, budget thermique ≥ 380 au départ (`pymobiledevice3 syslog live`, voir iphone-budget-thermique). Build avec `&perfrec=2`.
A = `?sans=pilote`, B = le pilote, A-B-A-B, 3 passes par bras, 25 min chacune.
Lu par `outils/banc-perf/analyse-vol.py`, qui gagne : la table K × état thermique (i/s, % ratés, vrai coût p90) ; l'histogramme `c.H` ; les retailles par moment.

Critères (le pilote est retenu si 1, 2, 3 et 5 passent) :
1. Retailles en course : 0 (aujourd'hui des gels de 270-300 ms).
2. Histogramme : la masse au-delà de 1,5 tic divisée par 2 ; le pic à 66 ms presque vide à fair et serious.
3. i/s : serious ≥ 28 (aujourd'hui 24). Critical ≥ 26 est ambitieux : à renégocier avec Sacha selon la mesure.
4. Minutes jusqu'à critical : pas plus courtes que A.
5. Qualité : débranché froid, K0 tenu toute la course (« ULTIME » au journal) ; branché + éco, K moyen ≤ 4 à nominal et fair.
6. Sacha joue sans savoir le bras : « où ça saccade », « où c'est moins beau ».

## 6. Ce qui reste pour la phase 2 (pas cette nuit)
- Géométrie liée au DPR, densité, fusion des appels : contrat pour la session maps (`passation/qualite/POUR-LA-SESSION-MAPS.md`).
- Portée du décor (`FOG_N/FOG_F`, `camera.far`, etalonnage-da.js:211) : change la brume, preuve photo d'abord.
- Rails en tranche moyenne en permanence (`RAIL_CHAUD`) : variable d'un fichier interdit, à demander.
- Ombre au sol une image sur deux (`renderer.shadowMap.autoUpdate` alterné au sol) : nouveau cran [C], derrière `?plus=ombresol`, preuve photo en virage serré.
- Résolution sans réallocation (sous-rectangle, triptyque-bloom.js) : `?plus=sousrect`.
- Le 15 i/s régulier avec sous-pas de physique.
- Le « cran −1 » à 60 i/s pour la classe 2, sur le modèle du 60 mérité.

## 7. Les risques à surveiller
- Double commande : un gouverneur oublié écrit encore. Parade : tout passe par `pilOn()`, et le banc 1 compare `?sans=pilote` au bit près.
- Le verrou de résolution peut laisser une image lourde jusqu'au portail suivant (1 à 3 min). C'est mieux qu'un gel de 300 ms ; le ROUGE a les crans [C] 1-6.
- `CAD.eM` est nouveau : si la médiane ne voit pas le 30 Hz de la mitigation thermique, `pilTic` retombe sur `CAD.eco`. À vérifier dans la boîte de vol (colonne R : images d'écran reçues).
- Le préchauffage des ombres : environ 10 Mo de mémoire graphique en plus.
- AUTO au lieu de BASSE par défaut : c'est un changement de sens du réglage. Sacha tranche ; `?sans=pilauto` garde l'ancien.

## 8. CE QUI EST CODÉ (nuit du 17/11, lot « pilote », branche `qa/pilote`, worktree `~/cash-car/qualite-pilote`)

Tout est dans `code/moteur/pilote-qualite.js` (inscrit après `gouverneur-paliers.js`). Les points d'accroche : `prfRegle` → `prfPoseNiv` (nettete-qualite.js), `mobPalTick` (prise de main),
`mobThermo` (cran du critique), `pjcTick` (séance brûlante notée + mémoire), `boucle-1.js` (règle QL sautée), `cadSaute` (`CAD.eM`, histogramme, images ratées), `cadPer` (critique),
`applyDPR` (toile notée), `qlPose` (verrou), `resetGame` / `start` (départ), `portailPasse` et `newTrackG` (portail / changement de carte), `loupeChaud` (la loupe retaille la toile visible),
l'enregistreur (`PL`, `H`, `RET`, `prf.K`), la boîte noire (genre `pilote`, plafond 30 lignes).

### Écarts au plan (et pourquoi)
- **Étapes 1 et 3 dans le même commit** : la table de départ par crans (étape 3) remplace celle des niveaux (étape 1) ; coder deux fois la même décision n'apportait rien.
- **Critical au départ = K9** (niveau − 1, recette critique) et non K8 : c'est le « nMax − 1 » de l'étape 1, et la fluidité d'abord. À critical le 13 Pro repart donc en N1 (DPR 1,25), halo ½ à 2 étages, ombre 512, ciel 1/8 — c'est plus que l'image d'aujourd'hui à critical (DPR 1,0).
- **K10 / K11 = plafond × 0,9 / × 0,8** (au lieu de « − 0,125 » et « plancher net ») : au N1 le plancher net vaut le plafond (1,25), le cran n'aurait rien fait.
- **La mémoire remplace la table** (au plus 4 crans au-dessus), au lieu de `min(table, appris)` : avec un min, la course brûlante (« apprend K + 2 ») et une course rouge ne pourraient jamais rien apprendre.
- **La loupe de la caisse** (rendu/loupe-caisse.js) change la taille de la toile visible quand elle s'allume ou s'éteint. Elle s'éteignait EN COURSE au passage à critical (vu au banc : une retaille 2532 → 1266 en course). Sous le pilote, elle ne s'éteint qu'aux moments sous voile, au cran ≥ 8.
- **Le changement de carte** (`newTrackG`, fin de construction) est aussi un moment « portail » (le banc passe par `dbgSaut`, qui n'appelle pas `portailPasse`).
- **Le refroidissement** : la dette se rend aussi (anticipation symétrique), un cran de mieux par moment ; le BLEU reste en plus.
- **3b (hors profil, iPhone 11)** : pas fait.

### Commits (branche `qa/pilote`, poussés)
- `f0f2f1aec` étapes 1 et 3 : le socle, l'échelle K0-K12, la table de départ, la règle par zones, le journal.
- `70ff85c45` étapes 2 et 4 : le verrou, les ombres préchauffées, la cadence au critique, la loupe, la mémoire.

### Prouvé au banc (`outils/banc-pilote/pilote.cjs`, Chrome sans fenêtre, iPhone 844×390 émulé, conditions posées à la main ; compteurs, aucune mesure de temps)
- `--mode etat` : `?sans=pilote` contre la branche d'avant (`qualite-appareil` 0db07d441), BASSE, HAUTE, AUTO × nominal, fair, serious, branché, critical : **0 écart** sur dbgGouvPaliers, dbgNette, imgRegle, dbgPrf, cadence.
- `--mode depart` (13 Pro débranché froid) : AUTO → **N2 K0** (DPR 1,5, halo plein 4 étages, ombre 1280) ; aujourd'hui N1 (1,25, halo ½, 768). BASSE choisie → N1 K0, identique à aujourd'hui. HAUTE → N2 K0, identique.
  Branché + éco fair → N2 K3 ; critical → N1 K9 ; `&classe=2&appareil=iPhone16,1` → N3.
- `--mode scenario` (branché + éco, thermique 0 → 1 → 2 → 3, 45 s par état, un changement de carte au milieu, une mort à la fin) : K3 · K3 · K3→7 (dette d'anticipation payée au changement de carte) · K7→8 (carte) puis K9 = N1 à la mort.
  Toile du jeu : **0 changement de taille en course** (16 écritures, toutes « mort » ou « départ ») ; applyDPR : menu 2, mort 1, course 0. Avant la correction de la loupe : 1 retaille en course au passage à critical.
- `--mode refroidit` (3 → 2 → 1 → 0) : K9 N1 → K8 N2 (mort) → K7 (menu) → K6 (carte) → K5 (mort) → K3 (menu) : la qualité remonte, un cran par moment, les crans 9-12 seulement sous voile.
- `--mode rouge` (15 % d'images ratées simulées) : K3→4→5→6 en course, un toutes les 3 s ; puis dette ; K6→8 au portail ; K8→10 à la mort ; marge 60 s → K10→9 à la mort suivante.
- `--mode cad` : critical, rAF à 60 → `cadPer` 50 ms (3 tics) ; rAF à 30 ou économie → 33,3 ms (plus de 33/66).
- `--mode memoire` (modèle posé comme l'app, sans `?appareil=`) : 3 courses rouges à serious + branché + éco écrivent B1E1T2 : K10 (n 1), K10 (n 2), K11 (n 3) ; au rechargement le départ dit « source mémoire (K10, n 2) » ; une course à 15 % de batterie n'écrit rien.
- `?pilote=K5`, `survie` (K12, DPR 1,0), `N1`, `gel`, `fige`, `?sans=pilauto` : chacun fait ce qu'il dit. 0 exception, 0 console.error sur tous les essais.

### NON prouvé (à voir sur le 13 Pro)
- Aucun chiffre d'images par seconde : le Mac était chargé, et l'émulation ne bride ni la puce ni le rAF. Les gains par cran restent des estimations.
- `CAD.eM` sur le vrai téléphone : voit-il le 30 Hz de la mitigation thermique sans économie ? (boîte de vol : colonne R, et `dbgPilote().eM`).
- Le coût d'armer la sonde toutes les 10 s de course (barrière sans attente sur iPhone ; `?sans=pilsonde` pour comparer).
- La mémoire graphique en plus des ombres préchauffées (~10 Mo au N2).
- AUTO = N2 par défaut sur le 13 Pro : **à faire trancher par Sacha** (`?sans=pilauto` garde l'ancien sens).
- Le hors profil (3b, iPhone 11) : pas fait.

### Ce qu'il faut regarder sur le 13 Pro (branché + économie, budget thermique ≥ 380)
1. La boîte noire, genre `pilote` : « chargement · N1 → N2 K3 … », puis une ligne par changement, avec la raison et le moment (jamais « course » pour un niveau ou une résolution).
2. Aucune ligne `retaille · course`. L'enregistreur (`&perfrec=2`) : `PL` par seconde (K, zone, dette, ratés ‰, appels, triangles, période), `H` (l'histogramme : le pic à 66 ms doit se vider), `RET`.
3. Les i/s à serious (critère : ≥ 28) et à critical (≥ 26 ambitieux) en A-B-A-B contre `?sans=pilote`.
4. Si l'image est trop chargée à fair branché + éco (K3, N2 DPR 1,5) : la règle doit monter en dette et la payer au portail ; sinon `?pilcible=0.7`.

## 9. CORRECTIONS (17/11, contrôle adverse + intégrateur) — branche `qa/pilote`

### Ce qui a changé
1. **Double portail** : `portailPasse` (portail-passage.js:87) puis la fin de `newTrackG` (traces-pneus.js:93) appelaient tous deux `pilMoment('portail')`. Un seul paiement par passage : le second, à moins de 1,5 s de `PILO.portT`, est ignoré (`dbgPilote().portails = {payes, ignores}`). Même règle pour le départ (`resetGame` puis `start`) : noté une fois (`departs`).
2. **Table de départ** (`pilTableC`, voir ci-dessous) : le niveau plein (N2) seulement débranché + sans éco + nominal + batterie ≥ 20 %. Partout ailleurs départ au niveau BASSE de la classe (`PILO.capN`, N1 sur le 13 Pro) : au mieux le rendu d'aujourd'hui. La montée vers N2 dans ces conditions ne vient que de la mémoire : 2 courses de suite à N1 K0 sans ORANGE ni ROUGE (≥ 30 s) → N2 K3 ; si N2 rate, l'apprentissage repart de N1 (la base de la mémoire change, la marge repart de 0). Mémoire passée en `v:2` (les entrées v1, apprises sur l'ancienne table, sont jetées).
3. **Urgence en course** : ROUGE tenu 8 s une fois les crans [C] dépensés (K ≥ 6), ou critical en course avec une dette de résolution (visé ≥ 9, ou niveau dû) → la résolution se paie EN COURSE, une fois par course, au moment le moins visible (en l'air, nitro ; sinon 3 s après). Journal : `urgence armée · …`, `retaille · urgence`, `K6→9 … · urgence`. `?sans=pilurgence` = sans.
4. **Gels ≠ charge** : `cadFin` donne au pilote le coût vrai de chaque image (`CAD.w` : boucle + envoi du rendu). Un tic raté ne compte comme charge (ROUGE / ORANGE) que si l'image d'avant a coûté ≥ 70 % du tic d'écran. Un trou > 80 ms derrière une boucle légère est un GEL hors boucle : `PILO.gels`, ligne `gel · n trous hors boucle (max … ms, boucle … ms) · K inchangé` au journal (10 s au plus), aucun cran ne bouge. `?sans=pilgels` = l'ancien comptage (A-B). La sonde `QLR.vrai` garde son rôle (ROUGE si > période).
5. **Mineurs** : seconde chance — à la mort, tant que la course peut reprendre (offre, réanimation automatique, pub, volet, machine à sous ouverte) rien n'est payé ; `chanceRepart` appelle `pilMoment('reprise')` : `PILO.mort` à faux, et si la mort avait déjà payé (cœur gagné après coup), le cran et le niveau d'avant la mort sont reposés sous le volet. La mort définitive suivante paie et apprend (`pilFinCourse`). Verrou de résolution aussi pendant les 2,5 premières secondes. `bvPrf` sans `K` sous `?sans=pilote`. Anti-pompage : une condition MEILLEURE ne compte (anticipation, départ, menu) qu'après 60 s stables ; la pire compte tout de suite (`?sans=pilhyst` = sans).
6. **Cadence au critique** : 33 régulier sur un écran à 30 (défaut) ; `?sans=pilcad` = les 50 ms visés d'avant, sous le pilote aussi.
7. **Vu au banc en passant** : au N1, le cran 8 (plancher QL 2) remontait l'ombre de 512 à 768 (`qlOmbN1`) : sous le pilote, l'ombre est bornée par la base (comme sous le gouverneur doux).

### Table de départ finale (13 Pro, AUTO ; niveau BASSE = N1, plein = N2)
| Condition | Départ (rien d'appris) | Mesuré au banc (`--mode depart`) |
|---|---|---|
| débranché, sans éco, nominal, bat ≥ 20 % | N2 K0 | N2 K0, DPR 1,5, halo 4 étages, ombre 1280 |
| débranché fair | N1 K1 | N1 K1, DPR 1,25 |
| branché seul / éco seule, nominal | N1 K0 (= aujourd'hui) | N1 K0, DPR 1,25, halo ½ 3 étages, ombre 768 |
| branché + éco nominal | N1 K1 | N1 K1 |
| branché + éco fair | N1 K2 | N1 K2 |
| serious (branché + éco) | N1 K5 (K6) | N1 K5 / K6, ombre 512, halo 2 étages |
| critical | N1 K10 (résolution × 0,9) | N1 K10, DPR 1,13, ombre 512 |
| batterie < 20 % | + 2 crans, N1 | N1 K2 (froid) |
| BASSE choisie | N1, même table de crans | N1 K0 froid, K1 branché + éco |
| HAUTE choisie, branché + éco | N2 K1 (HAUTE choisie garde son niveau, comme avant le pilote ; seul AUTO est borné) | N2 K1, DPR 1,5 |

### Prouvé au banc (17/11, `outils/banc-pilote/pilote.cjs`, Chrome sans fenêtre, 13 Pro émulé ; compteurs, aucune mesure de temps — Mac chargé, charge 7 à 24)
- `--mode portail` (VRAI portail : `dbgPortail(150)` + pilote auto ; K4 posé, visé K2) : passage 1 → K4→3, `portails {payes 1, ignores 1}` ; passage 2 → K3→2, `{payes 2, ignores 2}`. Un cran par passage (avant : deux).
- `--mode gels` A-B : gels hors boucle (setInterval qui tient le fil 120 ms toutes les 350 ms, 30 s) → **84 gels comptés, K0 inchangé, zone BLEU, ratés 0 %** (boucle 5,3 ms). Vraie charge (render tenu 60 ms, 30 s) → K0→6 par crans [C] puis urgence K9 (N1). Sous `&sans=pilgels` (l'ancien comptage) les mêmes gels font ROUGE à 15 % de ratés et descendent jusqu'à K9.
- `--mode urgence` : ROUGE simulé (15 %) → K0→6 en 15 s, `urgence armée · ROUGE tenu 8 s à K6 (crans [C] dépensés)`, payée au premier nitro : `retaille · urgence · DPR 1,25`, K6→9 = N1 ; une seule fois (`nUrg 1`), puis seulement des dettes. Critical en course (départ branché + éco fair, N1 K2) : anticipation K2→10, urgence payée au nitro, K10, DPR 1,25→1,13. Toile du jeu : 1 seul changement de taille en course, celui de l'urgence.
- `--mode chance` (dette posée : K2, visé K9 ; un bon de réanimation) : pendant la mort et la réanimation, K2 N2 inchangés, `mortP` faux ; reprise : `reprise · rendu inchangé · N2 K2`, `PILO.mort` faux ; la mort suivante (définitive) paie : `K2→9 · N1 · dette payée au mort`, `retaille · mort`.
- `--mode depart` : la table ci-dessus, 13 conditions, 0 exception.
- `--mode hyst` (branché + éco) : serious → visé K6 tout de suite ; fair ↔ serious toutes les 20 s pendant 80 s → `hystérésis … ×3`, visé reste K6 ; fair tenu → visé K6→1 après 60 s.
- `--mode leve` (branché seul, modèle posé comme l'app) : course 1 et 2 à N1 K0, BLEU → mémoire `B1E0T0 {N1, k0, n2, v2}` ; 3e lancement : `source mémoire · marge prouvée (2 courses N1 K0) → N2 K3`.
- `--mode cad` : critical, rAF à 30 ou économie → `cadPer` 33,3 (défaut) ; `&sans=pilcad` → 50 ; rAF à 60 → 50 dans les deux cas.

### NON prouvé
- Le seuil gels/charge sur le vrai téléphone : `CAD.w` ne contient pas le temps de la puce graphique (WebKit envoie le rendu sans attendre). Une image chargée côté puce sans contre-pression sur le script serait lue comme un gel. La sonde `QLR.vrai` (ROUGE si > période) reste le filet. À lire dans le journal : les lignes `gel · … boucle x ms` doivent montrer des boucles légères.
- Le moment de l'urgence (en l'air / nitro) sur téléphone : la retaille reste visible, c'est voulu (fluidité d'abord).
- Le cœur de la machine à sous gagné APRÈS que la mort a payé : le code repose le rendu d'avant sous le volet, non joué au banc.
- `?sans=pilote` : pas relancé en `--mode etat` (Mac saturé). Lu dans le code : tous les ajouts passent par `pilOn()` / `PIL_ON` (cadFin, qlOmbN1, bvPrf, reprise).

### Sur le 13 Pro (branché + économie, chaud, budget thermique ≥ 380) — A-B-A-B contre `?sans=pilote`
1. Quatre courses de 3 min dans l'ordre : pilote, `?sans=pilote`, pilote, `?sans=pilote`, même map de départ (`&perfrec=2`).
2. Attendu au départ : `départ N1 K1 · … · source table · départ N1 (pas N2 : …)` ; jamais plus lourd qu'aujourd'hui.
3. Journal `pilote` : les lignes `gel · …` (combien, boucle légère ?) et aucune descente de cran pendant ces gels ; au plus une `retaille · urgence` par course ; aucune `retaille · course`.
4. Mesurer i/s et histogramme `H` (le pic à 66 ms) ; critère : ≥ 28 i/s à serious, aucun trou visible à la reprise de seconde chance.
5. Au critique : une course par défaut (33 régulier) et une `&sans=pilcad` (50 visés) : comparer la régularité (`H`) et le budget thermique.
6. Après 2 courses sans orange dans une condition, le 3e lancement doit partir N2 K3 (`source mémoire · marge prouvée`) ; s'il rate, la mémoire repart de N1.

### Commits (corrections)
- `aeb804041` le code et le banc.

## 10. 3e TOUR (17/11, deux contrôles adverses : S1-S3, M1-M5) — branche `qa/pilote`

Fait nouveau mesuré sur le 13 Pro : les freezes suivent la chaleur (4-6 par minute à nominal/fair, 19-21 à serious/critical), en majorité HORS boucle. D'où S2.

### Ce qui a changé
1. **S1 — la mémoire ne pompe plus.** Avant : N1, N1, N2, N1, N1, N2… quand N2 ratait (`pilApprend` remettait l'entrée à zéro sur un changement de base, et `pilMemK` exige n ≥ 2). Désormais :
   - un changement de base (N1 ⇄ N2) garde le compte `n` ; `k` repart du cran tenu ;
   - un **échec à N2** (une course où le niveau plein a tourné avec ROUGE tenu ≥ 3 s, ou une urgence payée) pose `e.mur2` = date + 7 j, doublé à chaque nouvel échec (`e.d2`), 30 j au plus ; l'entrée revient à la base BASSE (N1, son cran d'avant), la marge repart de 0 ;
   - pendant le mur, N2 n'est ni tenté par la marge, ni gardé par la mémoire, ni posé par la table (même débranché à froid), ni rendu par l'anticipation ; une entrée sous mur n'est pas jetée à 7 jours ;
   - un N2 qui tient devient la base de l'entrée : gardé d'un lancement à l'autre.
2. **S2 — les gels ne sont pas une marge.** Chaque seconde de la fenêtre compte aussi gels + trous (`fen[i][2]`). Gels + trous > 0,5 % des images, ou ≥ 2 gels sur 10 s → `PILO.geleux` : ni BLEU, ni remontée (aucun paiement « mieux », journal `remontée refusée · gels hors boucle`), ni marge pour la mémoire (`g.gl`). Gels soutenus (10 s) ET serious ou plus → **ORANGE** (`dette · orange (gels au chaud …)`), payé au moment invisible. Aucun cran ne descend EN COURSE pour des gels.
3. **S3 — jamais plus lourd que la base au chaud.** Hors « débranché + sans éco + nominal », `pilAppliquer` borne chaque levier par `pilBase(c)` : ce que `?sans=pilote` poserait dans la même condition, CALCULÉ par le gouverneur de base (`mobPalTable` + `mobPalVoulu(t, niveau)`, gouverneur-paliers.js — le palier de la condition, critical = `gdxCrit()`, lu au niveau de base `prfNivT(…, PRF.q, …)`). Pas de seconde table : `mobPalVoulu`, `mobP0Niv`, `gdxDkDoux` prennent un niveau en argument, `mobCapNiv(n)` = `prfDprDe(n)`. Leviers : DPR et plafond, taille et étages du halo, ombre, ciel, plancher et cran QL, traits, vent et émission. À fair et plus, le **niveau** lui-même est borné par celui de la base (un niveau de plus allume des budgets statiques — `eteints` — que la borne par levier ne voit pas). À nominal branché / éco, un N2 appris par la mémoire reste N2 mais avec les leviers de la base. `?sans=pilborne` = sans (A-B). `dbgPilote().borne` = la dernière borne posée.
   **Cadence au critique** : la mesure sur téléphone n'est pas faite → le défaut redevient celui de la base (50 ms visés) ; le 33 régulier vit derrière `?plus=pilcad33`.
4. **M1 — jeton de portail.** `portailPasse` paie et pose `PILO.jeton` ; la fin de `newTrackG` (`pilMoment('piste')`) le consomme. Sans jeton, hors départ (dbgSaut, événements) = un moment à lui seul. `resetGame` appelle `pilMoment('raz')` d'abord : sa piste ne paie rien (`portails.raz`). Plus de fenêtre de 1,5 s.
5. **M2 — construction ≠ gel.** Les accrocs de 80-400 ms (et plus) dans les 1,5 s après un portail, une piste refaite ou `loop._rebuildT` sont comptés `constructions` et journalisés `construction · n accrocs … · pas un gel`.
6. **M3 — urgence au critical** : exige ORANGE (ou ROUGE) tenu 5 s (`PILO.orT0`). À 0 % de ratés, la dette attend le portail ou la mort.
7. **M4 — seconde chance + machine à sous** : à la mort, la reprise reste possible 1,5 s au moins, puis tant que `SAVE.d.spinJ > 0` et que la machine n'a pas été vue (20 s au plus si elle ne vient jamais), et tant qu'elle est ouverte.
8. **M5 — compteurs muets** : sous `?sans=pilote` et sur ordinateur, `pilImg`, `pilRaf`, `pilCout`, `pilRetaille` et les compteurs d'ombre / halo de `qlPose` passent par `pilOn()`. `dbgPilote()` ne lève plus sur ordinateur.

### Table de départ finale (13 Pro, AUTO, rien d'appris)
| Condition | Départ | Leviers posés (banc, borne comprise) |
|---|---|---|
| débranché, sans éco, nominal, bat ≥ 20 % (LIBRE, non borné) | N2 K0 | DPR 1,5, halo 1 / 4 étages, ombre 1280 |
| branché seul / éco seule, nominal | N1 K0 | = la base : DPR 1,25, halo ½ / 3 étages, ombre 768 |
| branché + éco, nominal | N1 K1 | = la base, plancher QL 1 (base 0) |
| fair (toutes) | N1 K1 (K2 branché + éco) | DPR 1,25, halo ½ / 2 étages, ombre 512 (base 768), QL 2 |
| serious | N1 K5 (K6 branché + éco) | DPR 1,25, halo ½ / 2 étages, ombre 512, ciel 4, QL 2 ; K6 : traits, vent, émission ×0,75 |
| critical | N1 K10 | **DPR 1,00** (borne : K10 seul donnait 1,13), halo ½ / 2 étages, ombre 512, ciel 8, traits ×0,5, cadence 50 visés |
| batterie < 20 % | + 2 crans, N1 | — |
| mur N2 actif (échec à N2 il y a moins de 7 / 14 / 30 j) | N1, même table | — |
| mémoire : 2 courses N1 K0 en marge (sans gels), nominal | N2 K3 | leviers bornés par la base si branché / éco |

### Tableau S3 (`--mode borne`, 16 conditions B×E×T, bat 80, leviers 3 s après le départ ; pilote / `?sans=pilote` ; gras = pilote plus lourd)
| condition | n | dpr | cap | halo | mips | ombre | stries | ventK | emiK | ciel | ql | qlMin | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B0E0T0 K0 | 2 / 1 | 1,5 / 1,25 | 1,5 / 1,25 | 1 / 0,5 | 4 / 3 | 1280 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 1 / 1 | 0 / 0 | libre (non borné) |
| B0E0T1 K1 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 2 / 2 | 2 / 2 | ok |
| B0E0T2 K5 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | · / · | 1 / 1 | 1 / 1 | 4 / 4 | 2 / 2 | 2 / 2 | ok |
| B0E0T3 K10 | 1 / 1 | 1 / 1 | 1 / 1 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | 0,5 / 0,5 | 0,5 / 0,5 | 0,5 / 0,5 | 8 / 8 | 2 / 2 | 2 / 2 | ok |
| B0E1T0 K0 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 3 / 3 | 768 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 1 / 1 | 0 / 0 | ok |
| B0E1T1 K1 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 2 / 2 | 2 / 2 | ok |
| B0E1T2 K5 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | · / · | 1 / 1 | 1 / 1 | 4 / 4 | 2 / 2 | 2 / 2 | ok |
| B0E1T3 K10 | 1 / 1 | 1 / 1 | 1 / 1 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | 0,5 / 0,5 | 0,5 / 0,5 | 0,5 / 0,5 | 8 / 8 | 2 / 2 | 2 / 2 | ok |
| B1E0T0 K0 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 3 / 3 | 768 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 1 / 1 | 0 / 0 | ok |
| B1E0T1 K1 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 2 / 2 | 2 / 2 | ok |
| B1E0T2 K5 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | · / · | 1 / 1 | 1 / 1 | 4 / 4 | 2 / 2 | 2 / 2 | ok |
| B1E0T3 K10 | 1 / 1 | 1 / 1 | 1 / 1 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | 0,5 / 0,5 | 0,5 / 0,5 | 0,5 / 0,5 | 8 / 8 | 2 / 2 | 2 / 2 | ok |
| B1E1T0 K1 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 3 / 3 | 768 / 768 | · / · | 1 / 1 | 1 / 1 | 0 / 0 | 1 / 1 | 1 / 0 | ok |
| B1E1T1 K2 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 768 | · / · | 1 / 1 | 1 / 1 | 2 / 0 | 2 / 2 | 2 / 2 | ok |
| B1E1T2 K6 | 1 / 1 | 1,25 / 1,25 | 1,25 / 1,25 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | 0,75 / · | 0,75 / 1 | 0,75 / 1 | 4 / 4 | 2 / 2 | 2 / 2 | ok |
| B1E1T3 K10 | 1 / 1 | 1 / 1 | 1 / 1 | 0,5 / 0,5 | 2 / 2 | 512 / 512 | 0,5 / 0,5 | 0,5 / 0,5 | 0,5 / 0,5 | 8 / 8 | 2 / 2 | 2 / 2 | ok |

cases jugées 180 · plus lourdes 0  (pilote / base ; halo = la taille du halo posée, 0 = coupé ; stries · = le régime des budgets)

A-B `?sans=pilborne` (branché + éco, même banc) : **7 cases plus lourdes** sans la borne — fair : étages 3 / 2, cran QL 1 / 2, plancher 1 / 2 ; serious : cran QL et plancher 1 / 2 ; critical : DPR et plafond 1,13 / 1,00. Avec la borne : 0 sur 180.

### Prouvé au banc (17/11, `outils/banc-pilote/pilote.cjs`, Chrome sans fenêtre, 13 Pro émulé, sous `verrou-banc.sh` ; compteurs, aucune mesure de temps)
- **S3** `--mode borne` (×2, `--part 0..3`) + `borne-table.cjs` : le tableau ci-dessus, **0 case plus lourde sur 180** ; critical : DPR 1,00 partout, `cadPer` 50 (pilote comme base) ; fair branché + éco : 2 étages, ombre 512.
- **S1** `--mode cycle --n2 rate` (branché seul, nominal, modèle posé comme l'app, 8 lancements de 35 s) : départs **N1, N1, N1, N2, N1, N1, N1, N1** — un seul essai N2 (K3, ROUGE simulé, urgence → N1 K9), `ÉCHEC à N2 … → mur N2 7 j · base N1 K0 (n 2)`, puis marge 1, 2, 3, 4 sans nouvel essai. `--n2 tient` : **N1, N1, N1, N2, N2, N2, N2, N2** (mémoire N2 K3, n 3 → 5). (La 1re course du banc n'écrit pas la mémoire : 3 courses N1 au lieu de 2 avant l'essai.)
- **S2** `--mode gelchaud` (branché + éco ; marge simulée — vrai 8 ms, 0 raté — et 3 gels / s) : zone VERT (jamais BLEU), `geleux` ; K4 posé, visé K2 : `dbgSaut` → `remontée refusée`, K4 tient ; serious + gels soutenus → zone **ORANGE** (vrai 8 ms, 0 raté : seuls les gels l'expliquent) ; gels coupés → BLEU revient quand la fenêtre se vide. `--mode gels` (vrais gels hors boucle, 120 ms toutes les 350 ms) : 86 gels, K1 inchangé, zone VERT (avant : BLEU) ; vraie charge : K1 → 10.
- **M1** `--mode portail` : VRAI portail ×2 → `payes` +1 et `ignores` +1 par passage (le jeton), K4 → 3 → 2 ; `dbgSaut` → `payes` +1 (un moment) ; mort puis nouvelle course → `raz` +1, `payes` inchangé.
- **M2** : dans tous les modes, les accrocs après portail / reconstruction (167-850 ms) sont `construction · … pas un gel` ; 0 compté en gel.
- **M3** `--mode urgence --crit 1` (fair → critical, vrai 8 ms, 0 raté, 25 s) : visé K10, **aucune urgence** (`nUrg 0`, BLEU) ; puis 4 % de ratés : ORANGE tenu 5 s → urgence payée au nitro, `retaille · urgence · DPR 1,00` (une fois).
- **M4** `--mode spin` (dette posée K2 → visé K9) : avec un jeton, 10 s d'écran de mort, la machine s'ouvre à 3 s : **rien n'est payé** ; sans jeton : payé à 4,5 s (`K2→9 · dette payée au mort`).
- **M5** `--mode compteurs` sous `?sans=pilote` (course, piste refaite, mort) et `--pc 1` (ordinateur) : tous les compteurs à 0 (retailles, halo, ombres, gels, trous, wDer, constructions, portails, départs, changements, histogramme, journal).
- Gardes : `garde-demarrage`, `garde-allege`, `garde-charte`, `node --check` du gros script : OK. 0 exception dans les bancs.

### NON prouvé
- Rien sur le téléphone (interdit à ce lot). Les seuils de S2 (0,5 %, 2 gels / 10 s, 10 s soutenus à serious) sont posés sur la mesure de Sacha (4-6 gels / min à froid = 0,7-1 toutes les 10 s : sous le seuil ; 19-21 / min au chaud = 3-3,5 / 10 s : au-dessus), pas vérifiés sur l'appareil.
- La borne est lue AU DÉPART et à chaque paiement ; en course, la base réagit tout de suite au thermique (palier posé à la seconde), le pilote en dette jusqu'au moment suivant : entre les deux, quelques secondes où le pilote est plus lourd que la base (voulu : pas de retaille en pleine course).
- La base de la borne ignore ce que la MESURE de la base aurait ajouté (image lourde à serious, échelle QL) : la borne est celle de la condition, pas celle d'une course mesurée.
- `mobP0Niv(n)` pour un niveau autre que le courant lit la table des profils (`eteints` « a » = halo entier) : exact sur le 13 Pro, à revoir si une classe garde le budget « a » au N2+.
- Le cœur gagné à la machine APRÈS que la mort a payé (reprise sous le volet) : toujours non joué au banc.

### Protocole 13 Pro (branché + économie, chaud, budget thermique ≥ 380) — A-B-A-B contre `?sans=pilote`
1. Quatre courses de 3 min : pilote, `?sans=pilote`, pilote, `?sans=pilote`, même map, `&perfrec=2`.
2. Départ attendu : `départ N1 K1 · source table` (nominal), K2 (fair), K6 (serious), K10 DPR 1,00 (critical) ; jamais plus lourd que la course `?sans=pilote` d'à côté (`dbgPilote().borne` / la boîte noire).
3. Journal `pilote` : lignes `gel · …` (combien ; boucle légère ?), `construction · …` après chaque portail, `remontée refusée` quand ça gèle, `dette · orange (gels au chaud …)` à serious ; jamais `retaille · course`.
4. Comparer gels par minute et i/s (`H`) pilote contre base, à serious et critical. Au critique, une course `&plus=pilcad33` contre le défaut (50 visés) : régularité de `H`, budget thermique.
5. Mémoire : 2 courses sans orange ni gels branché seul → le 3e lancement part N2 K3 ; s'il rate, la boîte noire dit `ÉCHEC à N2 … mur N2 7 j` et les lancements suivants restent N1.

### Commits (3e tour)
- `4c5287abb` le code (S1-S3, M1-M5) et le banc (modes borne, cycle, gelchaud, spin, compteurs ; `borne-table.cjs`).

## 11. 4e TOUR (17/11, intégrateur) — branche `qa/pilote`

Fait de terrain : 13 Pro branché à haute charge → critical en ~5 min. La séance réelle de Sacha s'est jouée toute à critical : 23 gels / min, surtout HORS boucle, 4-6 ms de travail par image. **Les gels sans ratés sont LE cas courant au chaud.** Au banc de puissance, baisser le DPR n'a rien fait gagner de mesurable (à confirmer).

### Ce qui a changé
1. **Les gels au chaud n'arment plus l'urgence.** `chaudGel` (gels soutenus à serious ou plus) reste une dette ORANGE payée au moment invisible, mais ne compte NI pour `orT0` NI pour la condition `cr`. L'urgence exige de VRAIS ratés (≥ 2 % sur 10 s) ou un vrai coût > (budget + 0,05) × période, tenus 5 s (`orV`).
2. **N2 seulement en condition libre.** La montée à N2 par la mémoire hors libre est RETIRÉE (`pilDepartCalc`). Partout ailleurs (AUTO) : N1, leviers bornés par la base ; la mémoire n'apprend que le cran K. Libre : N2 au cran appris pour N2 (`k2`, K0 sans mémoire). **ÉCHEC** (`pilEchecN2`) = ROUGE ≥ 3 s, urgence payée, ORANGE ≥ 50 % d'un segment ≥ 30 s, K visé ≥ K de départ + 3, ou course < 30 s qui a vu ROUGE → mur N2 (7 j, doublé, 30 j max). Le mur s'écrit DÈS le constat (chaque seconde, `pilVerifEchec`), et aux fins : mort, retour menu, `pagehide`, `visibilitychange` caché. Le retour à N1 se fait au moment sous voile suivant.
   Plafond « table + 4 » retiré : un départ prend le cran appris (séance, sinon mémoire n ≥ 2, sinon la table), jamais plus léger.
   La marge BLEU se cumule d'une course à l'autre (même séance, condition et niveau : `PILO.bleuC`) : un N1/N2 qui tient remonte vers K0 même en courses courtes. Une course quittée pour le menu sans que la mort ait payé garde son cran dans la séance.
   Mémoire au format v3 (`k, n` pour N1 ; `k2, n2` pour N2) : les entrées v2, qui portaient un niveau appris, sont jetées.
3. `traces-pneus.js` remis en CRLF : le diff contre `origin/qualite-appareil` ne montre que la ligne `pilMoment('piste')`.
4. `pilMoment('portail')` est appelé APRÈS le test `dejaPaye` (pas de jeton orphelin). Un jeton non consommé expire au bout de 5 s (`jetonExp`). Le portail seul n'ouvre plus la fenêtre « construction » : un gel > 80 ms à boucle légère dans les 1,5 s n'est « construction » que si une vraie construction a eu lieu (piste refaite, `loop._rebuildT`). Sinon c'est un gel.

### La règle finale, en dix lignes (pour Sacha)
1. Débranché, sans économie, téléphone frais, batterie ≥ 20 % : le jeu part au niveau plein (N2).
2. Dans tous les autres cas, il part au niveau d'aujourd'hui (N1), jamais plus lourd que le jeu sans pilote.
3. Plus le téléphone chauffe, plus le départ est léger : frais K0-K1, tiède K1-K2, chaud K5-K6, brûlant K10. Les gels au chaud ne poussent jamais au-delà de ce cran de table (ni halo coupé, ni résolution sous la base) — corrigé au 5e tour, §12.
4. En course, rien ne change à l'écran, sauf de petits crans quand des images ratent vraiment.
5. La résolution ne change qu'à un moment invisible : départ, mort, pause, menu.
6. Deux exceptions seulement : ROUGE tenu 8 s une fois les petits crans dépensés (K ≥ 6, `r8`), ou de vrais ratés tenus 5 s au brûlant (`cr`). Les gels seuls ne la déclenchent jamais.
7. Les gels sont notés, puis payés au prochain moment invisible. Ils ne donnent jamais de marge.
8. Si N2 rate (rouge, orange la moitié du temps, ou 3 crans perdus), N2 est interdit 7 jours dans cette condition (puis 14, puis 30). ⚠ HISTORIQUE du 4e tour : remplacé au 5e tour (24 h, puis 7 j, 14 j, 28 j, 30 j) et au 6e tour (seules les secondes à vrais ratés comptent). La règle en vigueur est au §13.
9. Le téléphone retient le cran qui tient dans chaque condition, et remonte doucement quand il y a de la marge.
10. `?sans=pilote` = le jeu d'avant, pour comparer.

### Prouvé au banc (17/11, `outils/banc-pilote/pilote.cjs`, Chrome sans fenêtre, 13 Pro émulé, sous `verrou-banc.sh` ; compteurs, aucune mesure de temps)
- **1 — gels au chaud** `--mode critgel` (branché + éco → critical par `dbgPiloteSim`, 0 raté, 3 gels / s, vrai 8 ms, 60 s) : `nUrg 0`, urgence `null`, **0 toile refaite en course** (retailles : menu 2 seulement, au chargement), DPR 1,25 tenu ; zone ORANGE (`dette · orange (gels au chaud : 45 s, th 3) · visé K11`) ; la dette K1 → K8 est payée au PORTAIL (crans [C]/[P] seulement), le reste attend la mort.
- **2a — N2 qui rate en ORANGE** `--mode cycle --n2 orange` (libre, 3,3 % de ratés à N2, 4 lancements de 35 s, stockage gardé) : départs **N2, N1, N1, N1**. Un seul essai : `ÉCHEC à N2 (K3 ≥ K départ 0 + 3) → mur N2 7 j · retour N1 K0`, écrit pendant la course. Puis N1 K0 tenu, appris (n 1 → 3), mur 7 j gardé.
- **2b — branché nominal** `--mode cycle --n2 tient` (branché seul, nominal, 4 lancements, marge simulée) : départs **N1, N1, N1, N1**, mémoire `k 0, n 1 → 3`, aucun `k2`, aucun N2.
- **2c — libre qui tient** `--mode cycle --n2 tient` (libre) : départs **N2, N2, N2, N2**, `k2 0, n2 1 → 3`, 0 échec.
- **2d — remontée en courses courtes** `--mode remonte` (libre, 8 courses de 20 s sans rechargement, K2 posé à la 1re, marge simulée) : départs N2 K0 (puis K2 posé), K2, K2, **K2 → K1** (BLEU cumulé 18 + 18 + 18 + 6 = 60 s sur 4 courses), K1, K1, **K1 → K0**, K0. Payé à la mort, un cran à la fois.
- **S3** `--mode borne` avec et sans `--q sans=pilote` + `borne-table.cjs` : **0 case plus lourde sur 180** (tableau identique au 3e tour, §10 : libre N2 K0 non borné ; partout ailleurs N1).
- 0 exception dans tous les bancs. Gardes : `garde-demarrage`, `garde-allege`, `garde-charte`, `node --check` du gros script : OK.

### NON prouvé
- Rien sur le téléphone (interdit à ce lot).
- `--mode critgel` n'a pas été rejoué sur l'ancien code (pas de copie du jeu : disque plein). Le défaut est lu dans le code : `chaudGel` mettait `orT0` à l'heure, et `cr` ne demandait que `orT0` tenu 5 s.
- Les déclencheurs `pagehide` / `visibilitychange` de l'échec N2 ne sont pas joués au banc (même fonction que la mort, `pilVerifEchec(true)`).
- Gain réel du DPR au critical, et 20 contre 30 i/s au critical : non mesurés.

### Protocole 13 Pro (branché + économie, chaud, budget thermique ≥ 380) — A-B-A-B contre `?sans=pilote`
1. Quatre courses de 3 min, même map, `&perfrec=2` : pilote, `?sans=pilote`, pilote, `?sans=pilote`. Laisser monter jusqu'au critical (≈ 5 min branché).
2. Au critical : journal `pilote` → AUCUNE ligne `urgence armée` ni `retaille · urgence` tant qu'il n'y a pas de vrais ratés ; les `gel · …` et `dette · orange (gels au chaud …)` sont attendus, payés à la mort ou au portail.
3. Départs attendus : N1 partout (K1 nominal, K2 fair, K6 serious, K10 critical) ; aucun `départ N2` branché.
4. Comparer gels / min et i/s (`H`) pilote contre base, à serious et critical.
5. Débranché, sans éco, frais : `départ N2 K0`. S'il rate : `ÉCHEC à N2 … mur N2 7 j`, puis N1 aux lancements suivants.

### Ce qui reste à mesurer
- **Gain réel du DPR** : au banc de puissance, 1,25 → 1,00 n'a rien fait gagner de mesurable. Si le 13 Pro le confirme, les crans 10-11 (résolution) coûtent de l'image pour rien : les remplacer par un levier qui paie.
- **20 contre 30 i/s au critical** : défaut 50 ms visés (la base) contre `?plus=pilcad33` (33 réguliers). Mesurer gels / min, régularité de `H` et budget thermique.

### Commits (4e tour)
- `73bb6eff5` le code (1, 2, 3, 4) et le banc (modes critgel, remonte, cycle `--n2 orange`).

## 12. 5e TOUR (17/11, contrôle adverse du 4e tour : S1, S2, M1-M3) — branche `qa/pilote`

### Ce qui a changé
1. **S1 — un accroc isolé ne pose plus de mur N2.** Avant : `g.rg` cumulait des secondes ROUGE non consécutives, ROUGE se lisait sur une fenêtre de 3 s, et la sonde `vrai` gardée 15 s tenait ROUGE ~10 s sur un seul échantillon : un seul pic d'une seconde posait le mur de 7 jours.
   - Chaque seconde de course compte ses VRAIS ratés à elle (le compteur de la seconde, pas la fenêtre glissante, pas la sonde). Plus de 8 % des images de cette seconde = une seconde ROUGE vraie. `PILO.rgSuite` = ces secondes DE SUITE ; une seconde propre, hors calme ou hors course remet à 0.
   - Échec N2 par ROUGE = `rgSuite` ≥ 3 (`g.rgMax`). La règle « course < 30 s qui a vu ROUGE » demande la même chose (elle est fondue dans la première).
   - « K ≥ K de départ + 3 » exige aussi ≥ 3 s de vrais ratés (≥ 2 % dans la seconde, `g.rS`) : les crans perdus sur un seul accroc ne comptent plus.
   - La sonde n'alourdit que CONFIRMÉE : ROUGE / ORANGE lisent le plus bas des deux derniers échantillons (moins de 25 s d'écart) ; BLEU lit le plus haut.
   - Murs progressifs : 1er échec 24 h, 2e 7 j, puis doublé jusqu'à 30 j (`PIL_MUR2_1`).
2. **S2 — les gels au chaud sont plafonnés au cran de table.** `pilCapGel(c)` = le cran de la table de la condition, au plus K11 (jamais le halo coupé), et jamais un cran de résolution (K10-11) dont le DPR tomberait sous celui de `?sans=pilote` dans cette condition. La dette `chaudGel` ne monte pas au-delà. `geleux` n'interdit plus la remontée (BLEU, et le paiement « mieux ») JUSQU'À ce cran ; sous lui, la remontée reste refusée. Critical : K10 (DPR 1,00 = la base). Serious : K5 (K6 branché + éco).
3. **M1** — `pilDepartCalc` lit `k2` dès que le niveau qui va tourner est au-dessus de BASSE (AUTO en libre, ou HAUTE choisie), le champ que `pilFinCourse` écrit pour ce niveau.
4. **M2** — `newTrackG` pose « construction en cours » du DÉBUT (`pilConstr(1)`) à la FIN (`pilConstr(0)`), puis 1,5 s ; pendant ce temps ni gels, ni ratés, ni images ne comptent, et la seconde n'est pas « calme ». 20 s au plus si la fin ne vient jamais.
5. **M3** — §11 : règle 3 (gels plafonnés à la table) et règle 6 (oubliait `r8`) corrigées.

### La règle finale, en dix lignes (pour Sacha)
1. Débranché, sans économie, téléphone frais, batterie ≥ 20 % : le jeu part au niveau plein (N2).
2. Dans tous les autres cas, il part au niveau d'aujourd'hui (N1), jamais plus lourd que le jeu sans pilote.
3. Plus le téléphone chauffe, plus le départ est léger : frais K0-K1, tiède K1-K2, chaud K5-K6, brûlant K10. Les gels au chaud ne vont jamais plus loin que ce cran.
4. En course, rien ne change à l'écran, sauf de petits crans quand des images ratent vraiment.
5. La résolution ne change qu'à un moment invisible : départ, mort, pause, menu.
6. Deux exceptions : ROUGE tenu 8 s une fois les petits crans dépensés, ou de vrais ratés tenus 5 s au brûlant. Jamais pour des gels.
7. Les gels sont notés. Ils ne donnent pas de marge, mais n'empêchent pas de revenir au cran de la table.
8. Si N2 rate vraiment (3 s de suite de vrais ratés, orange la moitié du temps, ou 3 crans perdus sur de vrais ratés), N2 est interdit 24 h dans cette condition, puis 7 j, 14 j, 28 j, 30 j.
9. Un accroc isolé (explosion, map neuve, GC, portail, arrière-plan) ne pose jamais de mur.
10. `?sans=pilote` = le jeu d'avant, pour comparer.

### Prouvé au banc (17/11, code final `7682b0748`, `outils/banc-pilote/pilote.cjs`, Chrome sans fenêtre, 13 Pro émulé, sous `verrou-banc.sh` ; compteurs, aucune mesure de temps)
- **S1 pic** `--mode pic` (libre, @modèle ; marge 40 s, 1,1 s à 30 % de ratés, marge 20 s ; rechargement) : **aucun mur**, `nEchec 0`, départs N2 K0 puis N2 K0 ; le pic coûte K0 → 1 (rouge) puis K2 payé au portail ; mémoire `k2 0, n2 1`, pas de `mur2`.
- **S1 vraipic** `--mode vraipic` (une sonde à 40 ms pendant 1,1 s) : **aucun cran**, aucun mur, `nEchec 0`, N2 K0 ×2.
- **S1 vrais ratés tenus** `--mode cycle --n2 rate --n 3` (libre, 15 % de ratés) : départs **N2, N1, N1** ; `ÉCHEC à N2 (ROUGE 3 s de suite (vrais ratés)) → mur N2 1 j` ; `murJ 1` gardé, source `mur N2 (1 j)`.
- **S2 critmort** `--mode critmort --n 5 --s 40` (branché + éco → critical, 0 raté, 3 gels / s, vrai 6 ms) : départs **K1 (avant le chaud), K10, K10, K10, K10** ; leviers K10 : DPR 1,00, halo ½, ombre 512, QL 2 (= la base au critical, tableau S3 du §10) ; `capGel 10`, visé 10 à chaque fin, `nUrg 0`, 0 toile refaite en course. Avant : SURVIE (K12) en 2-3 courses.
- **S2 serigel** `--mode serigel --n 5 --s 40` (branché + éco → serious) : départs **K1, K6, K6, K6, K6** ; DPR 1,25, halo ½, ombre 512, ciel 4, QL 2 ; `capGel 6`, `nUrg 0`.
- **critgel** `--mode critgel --s 60` : `nUrg 0`, urgence `null`, **0 toile refaite en course**, visé **K10** (4e tour : K11), K8 payé au portail.
- 0 exception dans ces bancs.

### NON prouvé (5e tour)
- **Pas rejoués sur le code final** (le verrou du banc a été tenu plus de 3 h par d'autres sessions) : cycles N2 (`--n2 orange` libre, `--n2 tient` branché, `--n2 tient` libre), S3 des 16 conditions contre `?sans=pilote` (`--mode borne` ×2 + `borne-table.cjs`), et `?sans=pilote` contre la base (`--mode etat --q sans=pilote`, puis le même avec `--jeu` sur un jeu assemblé depuis `origin/qualite-appareil`).
  Risque à lire : `--n2 orange` (3,3 % de ratés) ne passe plus par « K + 3 » (moins de 8 % par seconde : pas de seconde ROUGE vraie ; ≥ 2 % : `g.rS` compte) — l'échec attendu vient de « ORANGE majoritaire » ou de « K + 3 avec ≥ 3 s de vrais ratés ».
- M1 (HAUTE choisie, lecture de `k2`) et M2 (construction en cours sur plusieurs images) : lus dans le code, pas joués au banc.
- Rien sur le téléphone.
- serious branché + éco : le cran de table K6 est un peu PLUS LÉGER que la base (traits, vent, émission ×0,75, tableau S3 du §10) : « identique à la base » n'est exact qu'au critical.

### Commits (5e tour)
- `7682b0748` le code (S1, S2, M1, M2) et le banc (modes pic, vraipic, critmort, serigel).
- `2d9b6b8f5` cette passation (§12, règles 3 et 6 du §11).

## 13. 6e TOUR (17/11, contrôle adverse du 5e tour : 1 sérieux, 6 mineurs) — branche `qa/pilote`

### Ce qui a changé
1. **SÉRIEUX — deux accrocs isolés posaient encore un mur N2 de 24 h.** La règle « ORANGE majoritaire » comptait `g.ro`, les secondes où la ZONE (fenêtre glissante r10 / r3) était ORANGE ou ROUGE. Un pic d'une seconde tient ORANGE ~10 s : deux pics en 35 s donnaient `ro` 20 / 34 → mur.
   - L'échec ne lit plus la zone. Il lit `g.rS` : les secondes qui ont ELLES-MÊMES ≥ 2 % de vrais ratés.
   - Un ACCROC = une suite de telles secondes. `g.ep` = le nombre d'accrocs, `g.rsMax` = le plus long.
   - « Majoritaire » et « K + 3 » exigent `rS ≥ 3` ET (`rsMax ≥ 3` ou `ep ≥ 3`). Un ou deux accrocs de 2 s au plus ne posent jamais de mur.
2. **Courses courtes** (mineur 2). Une course < 30 s n'apprend rien seule. Son constat (secondes jouées, `rS`, accrocs) se cumule dans la séance, par condition et niveau (`PILO.court`, clé `B0E0T0|N2`). Dès 30 s cumulées, la règle d'échec s'applique au cumul. Le cumul repart de 0 après un verdict ou après une course longue.
3. **Banc vraipic fidèle** (mineur 3). La sonde simulée échantillonne comme la vraie : toutes les 10 s, et tout de suite quand le banc change la valeur. `dbgPiloteSim({vrai1:40})` = UN échantillon isolé. Pendant la simulation, les échantillons de la sonde de Chrome sont ignorés.
4. **Mineur 4** : au départ, `vraiT` et `vraiPT` repartent de 0. La sonde confirmée n'apparie que des échantillons de la même course.
5. **Mineur 5** : HAUTE choisie (ou libre) à K ≥ 9, le niveau descend d'un cran mais le cran appris reste sur l'échelle du plafond : `pilFinCourse` écrit `k2` (`g.N > nb` et (`g.n > nb` ou `kv ≥ 9`)), celui que le départ lit.
6. **Mineur 6** : serigel joué débranché (table K5) ET branché + éco (K6).
7. **Mineur 7** : §11, règle 8, marquée « historique ».
8. `dbgPilote()` donne `seg` (s, rS, ep, rsMax, rgMax, ro, kv, k0), `court`, `nVrai`, `vraiP`. Nouveau crochet `dbgPisteTranches(pas)` : une piste refaite en course par le générateur, une tranche toutes les `pas` ms.
9. Banc : modes `deuxpic`, `courts`, `constr`, `haute` ; `cycle --expire 1` (le mur déclaré échu une fois) ; `vraipic` à une seule sonde ; la sonde `LEV` marche sur un jeu sans pilote.

### Les règles exactes de l'échec N2 (`pilEchecN2`, libre + AUTO, segment de la condition)
- Ne s'applique que si le niveau plein a tourné (`nMax > BASSE`), en condition libre, plafond AUTO, sans `?pilote=`.
- `rgMax ≥ 3` : 3 s DE SUITE à > 8 % de vrais ratés dans la seconde → échec (course courte comprise).
- Urgence payée dans la course → échec.
- Sinon, il faut `rS ≥ 3` ET (`rsMax ≥ 3` ou `ep ≥ 3`). Puis :
  - segment ≥ 30 s et `2 × rS ≥ s` → échec « ratés majoritaires » ;
  - `kv ≥ k0 + 3` → échec « K + 3 ».
- Courses < 30 s : la même règle sur le cumul de la séance (même condition, même niveau), dès 30 s.
- Mur : 24 h au 1er échec, 7 j au 2e, puis doublé jusqu'à 30 j. Écrit dès le constat. Retour N1 au moment sous voile suivant.
- La sonde (`vrai`) et les gels ne posent jamais d'échec seuls.

### La règle finale, en dix lignes (pour Sacha)
1. Débranché, sans économie, téléphone frais, batterie ≥ 20 % : le jeu part au niveau plein (N2).
2. Dans tous les autres cas, il part au niveau d'aujourd'hui (N1), jamais plus lourd que le jeu sans pilote.
3. Plus le téléphone chauffe, plus le départ est léger : frais K0-K1, tiède K1-K2, chaud K5-K6, brûlant K10. Les gels au chaud ne vont jamais plus loin.
4. En course, rien ne change à l'écran, sauf de petits crans quand des images ratent vraiment.
5. La résolution ne change qu'à un moment invisible : départ, mort, pause, menu.
6. Deux exceptions : ROUGE tenu 8 s une fois les petits crans dépensés, ou de vrais ratés tenus 5 s au brûlant. Jamais pour des gels.
7. Les gels sont notés. Ils ne donnent pas de marge, mais n'empêchent pas de revenir au cran de la table.
8. N2 est interdit (24 h, puis 7 j… jusqu'à 30 j) seulement si les ratés sont vrais et TENUS : 3 s de suite très ratées, ou la moitié du temps ratée, ou 3 crans perdus sur plus de deux accrocs.
9. Un ou deux accrocs isolés (explosion, map neuve, GC, portail) ne posent jamais de mur. Les courses courtes comptent ensemble.
10. `?sans=pilote` = le jeu d'avant, pour comparer.

### Prouvé au banc (17/11, code final `090993556`, `outils/banc-pilote/pilote.cjs`, Chrome sans fenêtre, 13 Pro émulé, UNE prise de `verrou-banc.sh` de 20:01 à 20:52 ; compteurs, aucune mesure de temps ; 0 exception sur les 19 lancements)
- **pic** (libre, 1,1 s à 30 %) : aucun mur, `nEchec 0`. Segment : `s 63, rS 1, ep 1, ro 10`. Coût K0 → 1 (rouge) puis K2 au portail. 2e course N2 K0.
- **deuxpic** (6 s, pic, 13 s, pic, 13 s) : segment `s 34, ro 20, rS 2, ep 2, rsMax 1`. L'ancienne règle (2 × 20 ≥ 34) posait le mur ; **la nouvelle : `nEchec 0`, aucun mur**, 2e course N2 K0, mémoire `k2 0, n2 1`.
- **vraipic** (`vrai1:40`, une seule sonde) : un seul échantillon de plus (`nVrai` 4 → 5), apparié à 8 ms (`vraiP 8`), zone VERT, K0. Aucun cran, aucun mur, N2 K0 ×2.
- **vrais ratés tenus** (`cycle --n2 rate --n 4 --expire 1`, 15 %) : départs **N2, N2, N1, N1**. `ÉCHEC à N2 (ROUGE 3 s de suite) → mur N2 1 j`, mur déclaré échu, N2 retenté, `ÉCHEC … → mur N2 7 j`. Puis N1 K0, source `mur N2 (7 j)`.
- **courses courtes** (`courts`, 4 × 12 s, 5 % de ratés, sans rechargement) : départs **N2, N2, N2, N1**. Cumul 11 → 23 s sans verdict, puis `ÉCHEC à N2 (cumul de 3 courses courtes (35 s) · ratés majoritaires (30/35 s)) → mur N2 1 j`.
- **cycle orange** (libre, 3,3 %) : départs **N2, N1, N1** ; `ÉCHEC (K3 ≥ K départ 0 + 3 (23 s de vrais ratés, 1 accroc)) → mur N2 1 j`.
- **cycle tient branché** : N1, N1, N1 (`k 0, n 1 → 2`). **cycle tient libre** : N2, N2, N2 (`k2 0, n2 1 → 2`), 0 échec.
- **critmort** (critical, 3 gels/s, 0 raté, 5 × 40 s) : départs N2 K0 (libre, avant le chaud), puis **N1 K10 ×4** : DPR 1,00, halo ½, ombre 512, ciel 8, QL 2 ; `capGel 10`, `nUrg 0`, 0 toile refaite en course.
- **serigel débranché** : N2 K0, puis **N1 K5 ×4** (DPR 1,25, halo ½, ombre 512, ciel 4, QL 2), `capGel 5`, `nUrg 0`. **serigel branché + éco** : K1, puis **K6 ×4**, `capGel 6`, `nUrg 0`.
- **critgel** (60 s) : `nUrg 0`, urgence `null`, 0 toile refaite en course, visé **K10**, K8 payé au portail.
- **HAUTE choisie** (`haute`, branché) : N2 K0 tenu → `k2 0` ; course à K9 → `k2 5` ; course à N1 K9 → journal « N2 K9 tenu → appris K6 (N2, n 3) » (avant : écrit dans `k`) ; rechargement : `source mémoire (N2 K6, n 3) · plafond HAUTE`, départ N2 K6.
- **M2, construction sur plusieurs images** (`constr`) : simulée 4 s sous 30 % de ratés : `consEn` vrai, `rgSuite 0`, K0. VRAIE piste refaite par le générateur en course : **24 tranches sur 3,6 s**, sous 30 % de ratés : `consEn` vrai pendant tout le bâti, `rgSuite 0`, K0 → K0, 0 exception, 0 panne.
- **S3, 16 conditions** (`borne` pilote contre `--q sans=pilote`, `borne-table.cjs`) : **0 case plus lourde sur 180**.
- **`?sans=pilote` contre `origin/qualite-appareil`** (`9b7fd60f9`, assemblé depuis ses morceaux) : `--mode etat` aux 5 états (nominal, fair, serious, branché, critical) : toutes les valeurs du jeu identiques. Seuls diffèrent `gouv.base` (un relevé de diagnostic) et `cadPer` (lu par `dbgPilote`, absent de la base).

### NON prouvé (6e tour)
- Rien sur le téléphone.
- Au banc, la 1re course d'un lancement n'apprend pas avant le rechargement (la mort n'a pas payé dans les 11,5 s d'attente du banc) : la mémoire commence à la 2e course. En `haute` (sans rechargement), la 1re course apprend bien, plus tard. Artefact du banc probable, pas lu en détail.
- La sonde réelle (toutes les 10 s) n'est pas jouée sur téléphone : la confirmation à deux échantillons est prouvée au banc avec la sonde simulée seulement.
