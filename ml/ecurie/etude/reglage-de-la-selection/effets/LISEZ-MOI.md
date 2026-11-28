# Étude « effets » — que font vraiment les mutations ? (27/11/2026)

## En une minute

La question : quand la sélection naturelle change quelques réglages d'un pilote (une « mutation »), le pilote devient-il pire, meilleur, ou ne change-t-il rien ? Pour y répondre, on a comparé, course par course et sur les mêmes 24 routes, le pilote de départ (le témoin) à ses 19 mutants de la vraie évolution lancée le 27/11, puis les 6 premiers enfants à leurs parents. La réponse : aucun mutant n'est nettement pire, aucun n'est nettement meilleur, aucun n'est « mortel ». Les vraies différences entre mutants sont petites, au plus 1,1 palier, et le plus probablement 0,3 palier, alors que le hasard d'une seule course vaut 3,3 paliers. Le chiffre qui tranche : un mutant mesuré deux fois sur deux lots de 12 routes différents ne se classe pas pareil (corrélation −0,13). Dans le scénario le plus probable, le classement que fait la sélection est donc fait à 80 ou 90 % de hasard (à 30 à 45 % seulement si les différences vraies atteignent 1,1 palier). Ce que je recommande : donner au simulateur de la sélection les fourchettes de `parametres-pour-le-simulateur.json`, et lui faire tester deux choses avant de toucher au vrai système : des mutations plus fortes, et ne plus tirer les réglages qu'un interrupteur éteint rend inutiles. Ces réglages font aujourd'hui un quart des tirages du génome v:2. Ce que je ne sais pas : l'effet moyen d'une mutation, quelque part entre −1,5 et +0,6 palier, parce que le témoin n'a que 24 courses ; donc pas non plus la part des mutations utiles, qui va de 0 à plus de la moitié selon l'hypothèse.

## Les données

- Lues **en lecture seule** dans le dossier `etat\` de l'évolution qui tourne (code du commit e2ea8d2c9, génome v:1 de 86 gènes), recopiées par `extraire.js` dans `donnees/` le **27/11/2026 à 23:31:33**. On y trouve `courses-2026-48.jsonl` (592 lignes), `generations.jsonl` (2 lignes, générations 0 et 1 finies), `population.json` (fin de la génération 1), `coffre.jsonl` (1 ligne) et `config.json`. L'heure et les comptes sont dans `donnees/LECTURE.json`.
- `donnees/population-g1-debut.json` : `population.json` lu à **23:16:25**, au début de la génération 1, quand les 26 pilotes vivaient encore. C'est le seul fichier qui garde les gènes mutés (avant / après) des 6 renvoyés.
- Ce que contiennent ces données : le témoin `19e3767cc346` et 19 mutants (« g0 », de 3 à 6 réels mutés, σ = 0,15 × l'étendue, plus les drapeaux tirés à 3 %). Ils ont couru sur 12 graines G0 puis sur 12 graines G1. S'y ajoutent les 6 nés de la génération 1 (1 immigré, 3 mutations, 2 croisements) sur les 12 graines G1, soit 552 courses d'entraînement mesurées, et les 40 courses de coffre du témoin.
- Aucune course n'a été lancée. Les cinq scripts ont tourné chacun dans un seul processus node, en 6 à 31 s.

## La méthode

1. **Les différences appariées** (`analyser.js` § 1 et 2) : pour chaque mutant, on calcule mutant − témoin graine par graine sur le palier et sur la survie. On en tire la moyenne, l'intervalle de confiance (IC) de Student à 95 % et un p de permutation. La note F vient de `ml/evolution/note.js` (`comparer`, un bootstrap apparié de 400 tirages), en lecture seule : on a pu la refaire. Les nés de G1 sont comparés à leur parent, ou à la moyenne de leurs deux parents pour un croisement. Ils sont aussi comparés au témoin et à la moyenne des 20 pilotes de G0 sur chaque graine, qui est la référence la moins bruitée.
2. **La loi des effets** (`outils.loiDesEffets`) : on suppose les effets vrais s_i ~ N(μ, τ). Les 19 mutants sont tous comparés au **même** témoin sur les **mêmes** graines. La malchance du témoin entre donc dans la différence de tous : elle déplace μ, sans élargir l'écart τ entre mutants. On a d'abord compté ce bruit séparément chez chaque mutant, ce qui écrasait τ vers 0. `verifier.js` l'a montré : 0,62 trouvé pour 0,9 vrai. Il fallait donc :
   - μ : un bootstrap qui tire les graines (le même tirage pour tous) **et** les mutants ;
   - τ : trois estimations. (A) Moitié contre moitié : la covariance entre mutants de leur différence sur G0 et sur G1, où le bruit de chaque lot est indépendant. (B) Les moments : Var(d) moins le bruit propre de chaque mutant. (C) La vraisemblance sur une grille.
3. **Les courses identiques** (§ 6) : même graine et même `empreinte`, l'empreinte du bilan de la partie, donc la route jouée. Le contrôle vérifie qu'elles ont bien le même palier, la même survie, la même cause, les mêmes pièces et les mêmes vols.
4. **Les gènes muets par construction** (`muets.js`) : un gène est muet tant qu'un drapeau éteint empêche le pilote de le lire. C'est **lu dans le code**, pas mesuré par des courses : `genome.js` écrit `volRetour:0` et `retours:[]`, et INTERFACES.md § 9.3 dit que les gestes éteints ne sont « pas lus ». `muets.js` tire 4 000 naissances avec `genome.muter` (code du dépôt, v:2) pour compter combien en sont touchées.

**Contrôles sur un cas dont on connaît la réponse** :
- `note.js` refait sur la génération 0 redonne les F et â écrits par le maître, à 5·10⁻⁵ près, avec le même σ des résidus (2,915).
- Le témoin comparé à lui-même donne 24/24 courses identiques et la classe « nul exact ».
- Les 64 paires à la même empreinte ont toutes le même palier, la même survie, la même cause, les mêmes pièces et les mêmes vols. 10 ont d'autres vues et 1 d'autres touches, sans effet sur la partie.
- `verifier.js` part de générations inventées dont on connaît la réponse. Il retrouve les mutants « nuls exacts » 40 fois sur 40, et l'IC de Student couvre l'effet vrai 95,5 % des fois. μ est retrouvé à 0,1 près (IC 12/12), τ = 0 et τ = 0,9 à 0,1 près par A, B et C. Clopper-Pearson retombe juste sur des valeurs de table.

## Les résultats

### 1. Chaque mutant contre le témoin (24 graines appariées ; `resultats.txt` § 1)

| | nombre |
|---|---|
| nettement pires (IC du palier sous 0) | **0 / 19** |
| peut-être meilleurs (IC au-dessus de 0) | **0 / 19** |
| indiscernables | 19 / 19 |
| « nul exact » (toutes les courses identiques au témoin) | 0 / 19 |
| \|dF\| > 2 erreurs-types sur la note F | 1 / 19 (`f6e4be64ff88`, −1,82 ± 0,83 ; 1 attendu par le hasard) |

Les différences de palier vont de −1,67 [−3,43 ; +0,09] (`780adaceba8f`) à +0,83 [−0,86 ; +2,53] (`af68f7e8f019`), et la survie de −30 s à +22 s, sans IC qui exclue 0. L'écart aux joueurs ne bouge presque pas : ΔE moyen +0,01, avec un écart-type de 0,08 entre mutants. La note F suit donc le palier.

**Le test qui tranche** : la différence d'un mutant sur les graines G0 ne prédit pas sa différence sur les graines G1 (r = −0,13 sur 19 mutants, p = 0,70). Si les effets vrais étaient de τ ≈ 1 palier, on attendrait r ≈ 0,56.

Les renvoyés de la génération 1 (`f6e4be64ff88`, `25ef7a22a9b2`, `75f072ea9346`, `780adaceba8f`, `189e2ce7fa40`, `6fc0d3c07790`) sont bien ceux dont la différence est la plus basse, de −0,75 à −1,67, mais aucun n'est nettement pire que le témoin.

### 2. Les nés de la génération 1 (12 graines ; § 2)

| id | origine | contre le parent | identiques au parent | contre les 20 de G0 |
|---|---|---|---|---|
| d361ff1483f5 | immigré (8 réels, σ 0,3) | −1,33 [−4,97 ; +2,30] | 0/12 | −0,46 [−3,33 ; +2,41] |
| 9627905cd5bb | mutation `figTemps` (1,5 → 1,58, +0,05 de l'étendue), `bVersRoutePlane` (2 → 0,16, 0,18 de l'étendue) | **0,00** | **12/12** | −0,96 |
| 9ae0f54f48ae | mutation `volAvance` | +0,17 [−1,52 ; +1,85] | 2/12 | +0,13 |
| 92bcfe194dd3 | mutation `glisse`, `jaugeCoupe`, `raccCartes_jade` | +1,83 [−0,54 ; +4,21] | 0/12 | +0,88 |
| 5a2962dde73d | croisement | −0,29 [−3,60 ; +3,02] (moyenne des parents) | 0/12 | −1,54 |
| 9e65b289560d | croisement | −0,42 [−3,42 ; +2,58] | 0/12 | −1,88 [−4,21 ; +0,46] |

Comparés au **seul** témoin, les nés de G1 semblent tous pires, de −0,75 à −2,75. C'est la chance du témoin sur les graines G1, qui touche aussi les mutants g0 : leur différence moyenne sur G1 est −0,9. Il faut les comparer à leur parent ou aux 20 de G0.

### 3. Le bruit, recontrôlé (§ 3)

| | mesuré ici (900 s) | étude du bruit (300 s) |
|---|---|---|
| écart-type résiduel du palier par course (modèle pilote + graine) | **3,26** (sur les 488 courses distinctes comme sur les 552) | 3,21 |
| écart-type de la différence appariée enfant − témoin, par graine | 4,33 | √2 × 3,21 = 4,54 |
| corrélation enfant / témoin sur une même graine (hors courses identiques) | 0,12 | 0,16 entre pilotes sans parenté |
| erreur-type médiane du Δpalier d'un mutant à 24 graines | 0,79 | |
| plus petit effet vu 8 fois sur 10 à 24 graines | **2,2 paliers** | |
| graines appariées pour voir +0,5 / +1 palier 8 fois sur 10 | 590 / 148 | |

Un enfant n'est donc presque pas corrélé à son parent sur une même route : dès que les deux pilotes divergent, la course part ailleurs. Le témoin fait en moyenne 7,54 sur ses 24 graines d'entraînement et 6,15 sur ses 40 graines de coffre (990 000 et plus). Les lots de graines diffèrent comme dans l'étude du bruit ; on ne compare donc jamais deux pilotes sur des graines différentes.

### 4. La loi des effets (§ 4 ; `parametres-pour-le-simulateur.json`)

| | estimation | fourchette à 95 % |
|---|---|---|
| mutants sans **aucun** effet (toutes les courses identiques) | 0 / 19 | [0 % ; 18 %] |
| part des courses d'un mutant identiques à celles du parent | 10,5 % en moyenne (médiane 4 %) | |
| μ, l'effet moyen d'un mutant g0 (palier) | **−0,42** | **[−1,52 ; +0,59]** (bootstrap ; Student sur les 24 graines : [−1,57 ; +0,73], relecture) |
| τ, l'écart des effets vrais entre mutants : (A) moitié/moitié | 0,00 | [0 ; 0,98] |
| τ : (B) moments | 0,37 | [0 ; 1,07] |
| τ : (C) vraisemblance | **0,32** | [0 ; 0,78] (vraisemblance), [0 ; 1,05] (bootstrap) |
| létales (IC entièrement sous −3,77, la moitié du palier du témoin) | 0 / 25 | [0 % ; 14 %] |
| fiabilité du classement (part vraie de la variance des notes), τ 0,32 | 19 % à 24 courses, 10 % à 12 | |
| idem, τ 1,07 | 72 % à 24 courses, 56 % à 12 | |

Comme μ est mal connu, les parts dépendent surtout du scénario : seuils à −0,5 et +0,5 palier, létale sous −3,77.

| scénario (μ, τ) | létale | nuisible | quasi neutre | utile | meilleure que le parent |
|---|---|---|---|---|---|
| prudent (−1,52 ; 1,07) | 2 % | 83 % | 14 % | 3 % | 8 % |
| central (−0,42 ; 0,32) | 0 % | 40 % | 60 % | 0 % | 9 % |
| optimiste (+0,59 ; 1,07) | 0 % | 15 % | 31 % | 54 % | 71 % |
| neutre étroit (0 ; 0,3) | 0 % | 5 % | 90 % | 5 % | 50 % |

**Ce qu'on peut dire.**
- Aucune mutation de cette taille n'est létale (au plus 14 %).
- Les effets vrais tiennent dans ±2 paliers autour de leur moyenne (2τ ≤ 2,1).
- Le hasard d'une course, 3,3 paliers, est 3 à 10 fois plus grand que τ.

**Ce qu'on ne peut pas dire.**
- Avec 24 graines, on ne voit qu'un effet d'au moins +2,2 paliers. Aucun n'est vu, donc la part des mutations utiles de +2,2 ou plus est au plus d'environ 22 %.
- Sous ce seuil, les courses ne disent rien. La part des mutations « utiles » (> +0,5) va de 0 % à 57 % selon les tirages du bootstrap : c'est la forme supposée de la loi, une loi normale, qui la donne, pas les courses.
- Aucun chiffre unique de « part utile » n'est donc défendable. Le simulateur doit balayer les scénarios.

### 5. Les gènes (§ 5)

Avec 3 à 8 gènes par mutant et aucun mutant nettement différent, **on ne peut attribuer d'effet à aucun gène** : le tableau de `resultats.txt` § 5 donne, pour chaque gène, la moyenne des mutants qui le portent, et n'en tranche aucun. Il mélange aussi les références (témoin pour les g0, parent pour les nés de G1). On peut seulement dire :

- **ne font rien, mesuré** : `figTemps` +0,0845 et `bVersRoutePlane` 2 → 0,16 ensemble (`9627905cd5bb`, 12/12 courses identiques à son parent) ;
- **ne font rien, par construction (lu dans le code)** : dans le génome v:1, `volRetour` tant que `volRetourOn` vaut 0, et `retMarge`, `retCap`, `retGain`, `retAvance`, `retourPrime` tant que `retourOn` vaut 0. Cela fait 6 des 64 réels (9,4 %) ; on l'observe ici : 10 des 119 réels mutés (8 %). Dans le génome v:2 du dépôt, il faut y ajouter les 15 réels des gestes éteints : **21 des 79 réels (26,6 %)**, et 25,3 % des réels tirés par `muter`. 2,0 % des naissances « mutation » n'ont que des changements muets (`muets.txt`) ;
- **cassent le pilote** : aucun gène, à la taille de mutation de la génération 0.

### 6. Les courses identiques (§ 6)

- **64 courses sur 552 (12 %)** rejouent exactement une course déjà jouée : même graine, même empreinte. 48 sont des copies d'une course du témoin, 16 se partagent entre deux autres pilotes, dont 12 entre `9627905cd5bb` et son parent.
- Elles coûtent **0,58 h sur 10,93 h de calcul, soit 5 %**, et 5 % du temps à chaque génération. Ce sont surtout des courses courtes : 51,5 s de médiane contre 133,5 s pour les autres. Elles se terminent avant que les gènes changés servent.
- Le cache ne peut pas les reconnaître. Sa clé est le sha du pilote **écrit**, qui change à chaque mutation, même muette, puisque tout le génome et son identifiant sont recopiés dans le texte (`muets.js` : 0 enfant sur 4 000 garde le texte de son parent). Et l'empreinte n'est connue qu'à la fin de la course.

## Les recommandations

| changement | gain attendu | coût | confiance | comment on saura |
|---|---|---|---|---|
| **R1. Le simulateur de la sélection** reçoit `parametres-pour-le-simulateur.json` et balaie les quatre scénarios (μ de −1,5 à +0,6 ; τ de 0 à 1,1) : 3,26 paliers par course, une corrélation enfant/parent de 0,12, 10 % de courses copiées (mesuré sur les mutants g0 ; à balayer jusqu'à 40 % pour les naissances ordinaires, voir la relecture). | On sait si la sélection progresse **quelle que soit** la valeur de μ. Avec une fiabilité de 10 à 19 % (scénario central), elle trie surtout du bruit. | Aucun sur le Ryzen ; un paramètre du simulateur. | haute (mesuré) | Le simulateur rend des progrès par génération dans chaque scénario. On compare à la vraie évolution, génération 10. |
| **R2. Proposition, à tester d'abord au simulateur** : des mutations plus fortes en phase A (`config.json` : `sigmaMutation` 0,15 → 0,30, ou `poissonMutations` 2 → 4). | τ plus grand : la sélection voit alors de vraies différences (fiabilité 56 à 72 % si τ ≈ 1). Aucune létale à 0,15 (≤ 14 %), donc de la marge. | Plus de mutations nuisibles. Le seul immigré (σ 0,3, 8 gènes) fait −0,46 contre les 20 de G0 [−3,3 ; +2,4], ce qui ne tranche pas. Change le hasard du maître, pas l'époque des courses (`sigmaMutation` n'entre pas dans l'époque, INTERFACES.md § 3.10). | basse : rien de mesuré à σ 0,3 | La corrélation moitié/moitié enfant − parent (§ 1) monte au-dessus de 0,3. |
| **R3. Proposition** : `ml/evolution/genome.js`, `muter` : tirer les `m` réels dans les réels **lus**. Retirer de l'urne ceux dont le drapeau de garde vaut 0 chez le parent : `volRetour` ← `volRetourOn` ; `retMarge`, `retCap`, `retGain`, `retAvance`, `retourPrime` ← `retourOn` ; les réels de chaque geste ← `lacheOn`, `slalomOn`, `coupOn`, `relacheOn`, `suitOn`. Garder le tirage des drapeaux tel quel. | En v:2, +34 % de réels qui agissent à chaque naissance (25,3 % des tirages perdus aujourd'hui). 2 % des naissances ne sont plus des copies sans effet (12 courses chacune et une des 6 places). | Une dizaine de lignes. `genome.js` fait partie de l'époque (INTERFACES.md § 9.3) : à faire à la prochaine époque voulue. On perd la dérive cachée des réglages d'un geste éteint : quand le geste s'allume, il part de ses réglages de naissance, comme l'a voulu le lot « gestes ». | haute sur le compte, moyenne sur l'utilité | `muets.js` relancé après le changement doit donner 0 % de réels muets tirés. |
| **R4. Ne rien faire contre les courses identiques pour l'instant** (pas de cache « au comportement »). | Au plus 5 % du calcul. | Un rejeu des vues serait lourd à écrire. | moyenne | Refaire `analyser.js` après quelques générations : la part devrait baisser quand la population s'éloigne du témoin. Si elle dépasse 15 % du **temps**, en reparler. |
| **R5. À noter (vu dans les données, hors de la question)** : la génération 1 a pris 8 682 s de courses d'entraînement sur le Xeon, alors occupé par d'autres travaux (129 courses/h, contre 191 à la génération 0, qui avait tenu en 4 535 s). L'économie est passée de 12 à 8 graines (`seuilEconomie_s` 5 400). À 8 courses, la fiabilité du classement tombe encore, sous 10 % au scénario central. Proposition : sur le Ryzen, mesurer d'abord le débit, et relever `seuilEconomie_s` si 12 graines n'y tiennent pas sous les 5 400 s actuels. | Garder 12 courses par génération. | Des générations plus longues. | moyenne | Le premier `generations.jsonl` du Ryzen dit `graines 12` et `debit_h`. |

## Les limites (mesuré / supposé)

- **Mesuré** :
  - les 25 différences appariées, le bruit (3,26), la corrélation enfant/témoin (0,12) ;
  - la répétabilité (−0,13) ;
  - les 64 courses identiques et leur coût ;
  - la note F refaite (identique au maître).
- **Supposé** :
  - **la loi normale des effets** : 19 mutants ne permettent pas de voir sa forme, une longue queue d'utiles ou de létales rares par exemple ;
  - **la taille des mutations** : celle de la génération 0 (3 à 6 réels, 4,8 en moyenne, plus les drapeaux : 5,8 gènes) est **plus grosse** qu'une naissance « mutation » ordinaire (1 + Poisson(2) réels, en moyenne 3 ; 41 % n'en changent qu'un ou deux), et ne ressemble ni à un immigré (8 réels, σ 0,3) ni à un croisement. Sur les 3 naissances « mutation » ordinaires de G1 : 1 nul exact et 14 courses sur 36 identiques au parent (39 %, contre 10,5 % chez les mutants g0) (relecture) ;
  - **les gènes muets par construction** : lus dans `genome.js` (e2ea8d2c9 et v:2) et dans INTERFACES.md § 9.3, non vérifiés par des courses dans cette étude.
- **Le témoin n'a que 24 courses appariées.** C'est lui qui limite μ : l'IC de ±1 palier vient surtout de son bruit, 3,26/√24 ≈ 0,67. Chaque génération ajoute 12 graines pour tous : μ se resserrera, mais seulement tant que le témoin vit (il est protégé).
- **Les données s'arrêtent à la fin de la génération 1** (23:31:33). La génération 2, à 8 graines, n'est pas lue.
- **Ce qui est « identique »** : même empreinte de la partie. 10 de ces paires ont des vues différentes : les yeux ont vu autre chose, sans que la partie change.

## Comment refaire

```
cd ml/ecurie/etude/reglage-de-la-selection/effets
node extraire.js            :: recopie l'etat de l'evolution dans donnees/ (lecture seule la-bas ; ecrit LECTURE.json)
node verifier.js            :: les calculs sur des courses inventees (TOUT PASSE attendu, ~30 s) -> verifier.txt
node analyser.js            :: les tableaux -> resultats.txt, resultats.json, parametres-pour-le-simulateur.json (~6 s)
node muets.js               :: les mutations muettes du genome v:2 du depot -> muets.txt (~6 s)
```
`analyser.js` lit les gènes mutés dans `donnees/population-g1-debut.json`. Pour une génération plus tardive, il faut une `population.json` lue **au début** de la génération, avant les renvois. Les nés de cette génération-là s'ajoutent alors comme ceux de G1.

## Les fichiers

`extraire.js`, `outils.js` (les calculs), `analyser.js`, `verifier.js`, `muets.js` ; `resultats.txt`, `resultats.json`, `verifier.txt`, `muets.txt` ; **`parametres-pour-le-simulateur.json`** (la loi des effets, ses fourchettes et ses scénarios) ; `donnees/` (la copie figée) ; `relecture/` (le contre-calcul du relecteur).

## Relecture (27/11/2026, un second agent chargé de réfuter)

**Refait.** `analyser.js`, `muets.js` et `verifier.js` relancés sur `donnees/` : mêmes sorties au chiffre près (seules l'heure et la durée changent). Puis un chemin indépendant, `relecture/contre-verifier.js` (sans `outils.js` ni `note.js`) → `relecture/contre-verifier.txt` :
- les données sont propres : une seule course par (pilote, graine), aucune graine commune à G0 et G1 ;
- μ = −0,42 retrouvé ;
- τ refait **sans le témoin**, par une analyse de variance pilote + graine sur les 19 mutants seuls : 0,35, bootstrap [0 ; 1,20]. C'est l'estimation de l'auteur (0,32 [0 ; 1,07]) par un autre chemin ;
- la répétabilité r = −0,13 se retrouve. Elle est à 4 erreurs-types de 0,56 : τ ≈ 1 est bien peu probable ;
- les courses identiques se retrouvent : 64 sur 552, 0,58 h sur 10,93 h (5,3 %).

**Ce qui était faux, et ce qui est corrigé.**
1. **La consigne `aSimuler` de `parametres-pour-le-simulateur.json`.** Elle disait : « course d'enfant = course du parent + s + bruit d'écart-type 4,33 ». Or ces 4,33 contiennent déjà le bruit des deux pilotes. Un simulateur qui la suivait aurait donné à chaque enfant un bruit de √(3,26² + 4,33²) ≈ 5,4 par course au lieu de 3,26. Il aurait donc jugé la sélection encore plus aveugle qu'elle ne l'est. Corrigé dans `analyser.js`, et le json est réécrit : bruit propre de 3,26, corrélé à 0,12 avec celui du parent.
2. **« La taille des mutations de G0 ressemble à une naissance ordinaire. »** C'est faux. Les mutants g0 changent 4,8 réels en moyenne, plus les drapeaux (5,8 gènes). Une naissance ordinaire change 3 réels en moyenne, et 41 % n'en changent qu'un ou deux. Sur les 3 vraies naissances « mutation » de G1 : 1 nul exact (`9627905cd5bb`) et 14 courses sur 36 identiques au parent (39 %). Les chiffres « 0 mutant sans effet [0 ; 18 %] » et « 10 % de courses copiées » valent donc pour les mutants g0, pas pour les naissances de la suite. Corrigé dans les limites et dans R1 : le simulateur doit balayer ces deux parts, jusqu'à environ 40 %.
3. **L'intervalle de μ** : [−1,52 ; +0,59] est un bootstrap, un peu étroit à 24 graines. Student sur les 24 moyennes de graine donne [−1,57 ; +0,73]. Le scénario « optimiste » peut donc aller jusqu'à μ ≈ +0,7. C'est noté dans le tableau ; les scénarios n'ont pas été refaits.
4. **« Le classement est fait à 80 ou 90 % de hasard »** ne vaut qu'au scénario central. Si τ = 1,07, la part de hasard tombe à 28 à 44 %. Précisé dans « En une minute ».
5. **`figTemps`** a changé de +0,05 de l'étendue (1,5 → 1,58), pas de +0,03. Corrigé.
6. **R5** : la génération 1 a été lente parce que le Xeon était occupé (129 courses/h contre 191 à la génération 0, qui tenait en 4 535 s, sous le seuil). Ce qui a déclenché l'économie ne dit donc rien du Ryzen. Précisé.

**Ce qui tient.**
- Aucun mutant n'est nettement pire ni meilleur.
- On ne voit aucune létale.
- τ est petit et le bruit domine.
- Les courses identiques ne coûtent que 5 % du temps.
- La note F refaite est celle du maître.
- Il n'y a pas de fuite : les parents des nés de G1 ont été choisis sur G0 et sont jugés sur G1.
- Il n'y a pas de biais du vainqueur : les 19 mutants g0 ont tous couru G1 avant le premier renvoi.

**Reste à dire.**
- `verifier.js` ne contrôle la couverture de μ que sur 12 générations inventées : 12/12 n'aurait pas repéré une couverture de 85 %.
- Son commentaire d'en-tête cite une corrélation mesurée de 0,06 ; c'est 0,12 aujourd'hui.
- Le bruit du simulateur est supposé normal, alors que le palier est un entier borné en bas et dissymétrique (témoin : 7,5 ± 3,75). Ce n'est pas vérifié ici.

Refaire : `node relecture/contre-verifier.js` (quelques secondes).
