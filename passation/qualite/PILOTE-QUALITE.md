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
