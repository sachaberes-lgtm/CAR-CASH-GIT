# Tri précoce : faut-il jouer les 12 graines d'un enfant visiblement raté ? (27/11/2026)

## En une minute

La question : aujourd'hui, chaque nouveau pilote (un « enfant ») joue ses 12 courses même quand il démarre très mal, et les 20 pilotes déjà en place rejouent chacun 12 courses neuves à chaque génération. Ces rejeux font 240 des 312 courses.
Couper tôt un enfant raté ne rapporte presque rien. Sur les 25 vrais enfants de l'évolution en cours, aucun n'aurait été coupé après 3 courses, et un seul après 4 ou après 6. Et un enfant raté meurt vite en course : couper ses 9 dernières courses ne fait gagner qu'environ 1 % du temps d'une génération.
L'économie se trouve chez les anciens. S'ils ne rejouent que 4 courses au lieu de 12, une génération prend 48 % du temps d'une génération à 12 graines (temps réel des courses de la génération 1). Mais la vraie évolution est déjà passée seule à 8 graines à la fin de la génération 1 (l'« économie de graines », la génération 1 ayant duré 8 682 s). Face à ce qui tourne vraiment, le Xeon passerait d'environ 15 à environ 21 générations par jour, soit 1,4 fois plus, et non 2,1 fois (voir « Relecture »).
Dans la simulation, ce changement donne un meilleur pilote après trois jours de calcul quand les mutations comptent : 1,2 à 1,3 fois plus loin que le réglage à 8 graines qui tourne aujourd'hui (1,5 fois plus loin que le réglage à 12 graines). Quand les mutations ne changent presque rien, il fait un peu moins bien (0,48 contre 0,65).
Je recommande donc « les anciens rejouent 4 graines », plus un petit filtre qui arrête les enfants qui refont exactement les courses de leur parent. Je déconseille le tri précoce, le rejeu sélectif et le jeu de graines fixe.
Ce que je ne sais pas : la taille réelle de l'effet d'une mutation. Les données disent même qu'aujourd'hui les 20 premiers pilotes ne se distinguent pas du hasard (test-retest de −0,2). Tant que ce sera vrai, aucun réglage de la sélection ne fera de miracle.

## Ce qui est mesuré, ce qui est supposé

**Mesuré** sur une copie figée de la vraie évolution (`donnees/`, lue le 27/11 à 23:16, 566 lignes de courses : génération 0 finie, génération 1 à 286/312 ; voir `donnees/LECTURE.txt`) :
le bruit d'une course, l'effet des graines, le bruit de E, le temps réel d'une course selon son palier, les courses identiques entre un mutant et son parent, et le test-retest des 20 premiers pilotes.

**Supposé** : l'effet des mutations sur la vraie valeur d'un pilote (quatre scénarios), la part des mutations muettes (1 sur 4, d'après un seul cas vu), l'indépendance des courses identiques d'une graine à l'autre (fausse : elles se concentrent sur les graines où tout le monde meurt tôt), et l'absence de plafond (un pilote peut progresser sans fin). Le simulateur ne fait ni validation, ni sacre, ni phases.

## La méthode

1. `mesurer.js` → `mesures.txt` et `residus.json` : on note la génération 0 avec `note.js` tel quel, puis on compare la note de chaque pilote sur la génération 0 et sur la génération 1 (le test-retest). On extrait les 526 résidus du modèle pilote + graine, on mesure les courses identiques mutant/parent, le temps des courses et E sur k courses.
2. `verifier.js` → `verifier.txt` : l'outil rapide `ajusterRapide` rend exactement les nombres de `note.js` (écart 2·10⁻¹⁵), la loi normale est juste, et on obtient le tableau du temps par palier.
3. `regles.js` → `regles.txt` : la règle de tri précoce seule. On calcule la probabilité de renvoi selon la vraie valeur, avec un contrôle contre la formule exacte (écart 0,46 point), le gain en secondes, puis la règle appliquée aux 25 vrais enfants et la détection des clones sur ces 25.
4. `population.js` → `population.txt` et `par-generation.txt` : toute la sélection de `evoluer.js` simulée à vérité connue (μ 20, λ 6, tournoi de 3, renvoi, protection, note de `note.js`). Elle est rejouée 40 fois par case, pour 11 schémas et 5 scénarios, et les schémas sont comparés à budget de calcul égal (1 et 3 jours du Xeon).
   Contrôles à réponse connue : sans bruit, le meneur est le meilleur vrai à toutes les générations dans les 5 schémas. Avec les seuls effets de graine, le modèle pilote + graine les retire (51/53 à 91/93 générations : `convergence.txt` explique les ratés).
5. `gain-reel.js` → `gain-reel.txt` : le temps que chaque schéma aurait pris sur les vraies courses de la génération 1, et la précision théorique de la note d'un ancien au bout de 10 générations.
6. `convergence.js` → `convergence.txt` : les 10 passes de `note.js` suffisent-elles quand les pilotes n'ont pas joué les mêmes graines ?

## Résultats

### Ce que disent les vraies courses (`mesures.txt`, `verifier.txt`)

| mesure | valeur |
|---|---|
| bruit d'une course autour du modèle pilote + graine (gen. 0 + 1) | ET 3,19 paliers, aplatissement 3,2 |
| effet des graines | ET 1,98 palier |
| test-retest des 20 premiers pilotes, gen. 0 contre gen. 1 | a : −0,21 ; F : −0,23 (Spearman −0,34) ; les 6 plus bas : 1 en commun sur 6 (1,8 au hasard) |
| écart vrai entre les mutants de la gen. 0 | a : au plus ~0,54 palier (le test-retest dit plutôt ~0) ; E : 0 |
| E sur les 2, 3 ou 4 premières courses | 20 pilotes sur 20 sous 5 parties → `note.js` leur donne E = 4, le pire |
| temps d'une course | de 7 s (palier 1) à 146 s (palier 12) ; −24,5 + 13,25 × palier, corrélation 0,86 |
| courses identiques à l'empreinte près, mutant de la gen. 0 / témoin | 10 % (0 à 8 sur 23 selon le mutant), concentrées sur 3 graines où tout le monde meurt tôt |
| corrélation des résidus mutant / témoin sur une même graine | −0,01 (aucun « bruit » hérité, hors courses identiques) |
| un clone : `9627905cd5bb` (2 gènes mutés : `figTemps`, `bVersRoutePlane`) | 11 courses sur 11 identiques à son parent `3032bf8184f5` |

### Question 1 : le tri précoce des enfants

La règle étudiée : après k graines, un enfant est renvoyé si a_k + c·σ/√k < S. Ici a_k est la moyenne de ses k paliers corrigés de la graine, moins 4 fois le E moyen ; σ = 3,19 ; S est le F du moins bon vivant.
On ne peut **pas** se servir de la note F de `note.js` à k ≤ 4. Sous 5 parties elle met E = 4, et la règle renverrait tous les enfants.

Probabilité de renvoi précoce selon la vraie valeur de l'enfant par rapport au seuil (seuil exact ; `regles.txt` § 1 donne aussi un seuil bruité, presque identique) :

| k | c | Δ −5 | Δ −3 | Δ −1 | Δ 0 | Δ +1 | Δ +2 |
|---|---|---|---|---|---|---|---|
| 2 | 2,0 | 59,7 % | 26,6 % | 5,2 % | 1,7 % | 0,4 % | 0,0 % |
| 3 | 2,0 | 76,7 % | 37,2 % | 7,0 % | 1,7 % | 0,3 % | 0,0 % |
| 4 | 2,0 | 85,9 % | 46,8 % | 8,4 % | 2,0 % | 0,3 % | 0,0 % |
| 6 | 2,0 | 96,0 % | 62,1 % | 11,1 % | 1,9 % | 0,2 % | 0,0 % |
| 3 | 1,5 | 88,0 % | 56,5 % | 17,5 % | 6,4 % | 1,7 % | 0,3 % |
| 3 | 2,5 | 59,9 % | 20,2 % | 2,0 % | 0,4 % | 0,1 % | 0,0 % |

**Ce que la règle économise :**
- (12 − k) courses par enfant renvoyé, mais des courses courtes. Un enfant à Δ −3 fait des courses de 34 s en moyenne : ses 9 courses coupées valent 1,41 % d'une génération, et 0,90 % à Δ −5 (`regles.txt` § 2).
- Sur les 25 vrais enfants (19 mutants de la gen. 0, 6 enfants de la gen. 1), avec c = 2 : **0 renvoi** à k = 2 et 3, **1 renvoi** à k = 4 (`780adaceba8f`, dont le F final sur 23 courses est le 3e ou 4e plus bas) et **1 renvoi** à k = 6 (`9e65b289560d`). La plus petite marge vaut −0,59 palier ; à k = 3, elle vaut +0,54 (`relecture/tri-reel-apparie.txt`). *Corrigé à la relecture* : `regles.txt` § 3 disait 0 renvoi partout et une marge de 0,34, parce que la borne de l'enfant et le seuil venaient de deux ajustements différents (voir « Relecture »).
- Dans la simulation (`population.txt`, A+T contre A), le tri renvoie 2 % (très faible) à 14 % (casse) des enfants. Le temps par génération ne change pas (7,81 h contre 7,72 h en « moyen », 7,26 h contre 7,29 h en « casse »). Le vrai niveau du meneur après 3 jours reste dans le bruit : 4,70 ± 0,16 contre 4,46 ± 0,15 en moyen, 3,91 ± 0,11 contre 4,27 ± 0,14 en casse.

**Les faux renvois :**
- Si l'enfant vaut le seuil (Δ 0), il est renvoyé 1,7 % du temps à c = 2 ; s'il vaut un palier de plus (Δ +1), 0,3 %.
- Dans la simulation, parmi les enfants renvoyés tôt, la part qui valait plus que la médiane des vivants va de 1,8 % (casse) à 22,6 % (très faible) en A+T. Quand les enfants se ressemblent tous, ceux qu'on renvoie tôt sont surtout des malchanceux.

### Question 2 : les anciens doivent-ils rejouer 12 graines à chaque génération ?

**Le coût sur les vraies courses** (`gain-reel.txt` ; la gen. 1 ramenée à 12 graines) :

| schéma | courses / gen | temps / A | gen. par jour sur le Xeon (au rythme de la gen. 0 : courses de 53 s en moyenne) |
|---|---|---|---|
| A (12 graines, le réglage d'avant l'économie) | 312 | 100 % | 14,7 |
| A8 (8 graines pour tous : **ce qui tourne depuis la fin de la gen. 1**, ajouté à la relecture) | 208 | 66,7 % | 22,0 |
| B8 : les anciens sur 8 graines | 232 | 76,3 % | 19,2 |
| **B4 : les anciens sur 4 graines** | 152 | **47,8 %** | **30,8** |
| B2 : les anciens sur 2 graines | 112 | 35,3 % | 41,6 |
| B4 + tri des clones | ~145 | 45,5 % | 32,3 |
| D : les anciens ne rejouent jamais | 72 | 20,7 % | 71,0 |

*Corrigé à la relecture* : la colonne « gen. par jour » suppose des courses aussi courtes qu'à la gen. 0 (53 s). Les courses de la gen. 1 durent 84 s en moyenne, et la vraie gen. 1 a pris 8 683 s à 12 graines, soit 9,95 générations par jour. À ce rythme : A8 environ 14,9, B4 environ 20,8 générations par jour. Le rapport B4 / A vaut 2,1, mais le rapport B4 / A8, celui qui compte aujourd'hui, ne vaut que 1,4.
Ces chiffres ne comptent ni la validation (48 courses tous les 5 générations au plus), ni le coffre (40 courses par jour), ni les fins de génération où des travailleurs attendent. Comptez 5 à 10 % de moins (estimation, non mesurée). Le Ryzen (× 2 à × 4) n'est pas mesuré.

**Le progrès à budget égal**, en vrai niveau θ (en paliers de F) du meneur, après 3 jours du Xeon (`population.txt`, 40 répétitions, ± l'erreur-type) :

| schéma | très faible | faible | moyen | moyen sans clones | casse |
|---|---|---|---|---|---|
| A | 0,60 ± 0,05 | 1,84 ± 0,10 | 4,46 ± 0,15 | 5,46 ± 0,12 | 4,27 ± 0,14 |
| **A8 (l'économie, ce qui tourne ; relecture)** | **0,65 ± 0,06** | **2,18 ± 0,10** | **5,68 ± 0,15** | — | **4,99 ± 0,16** |
| B4/8 (B4 sous l'économie : enfants 8, anciens 4 ; relecture) | 0,54 ± 0,07 | 2,72 ± 0,12 | 6,89 ± 0,21 | — | 6,46 ± 0,17 |
| A+T (tri précoce) | 0,64 ± 0,06 | 1,78 ± 0,10 | 4,70 ± 0,16 | 5,38 ± 0,17 | 3,91 ± 0,11 |
| A+K (tri des clones) | 0,48 ± 0,05 | 1,75 ± 0,09 | 4,58 ± 0,18 | 5,46 ± 0,12 | 4,41 ± 0,11 |
| B2 | 0,56 ± 0,06 | 2,48 ± 0,15 | 7,58 ± 0,14 | 8,45 ± 0,24 | 6,80 ± 0,19 |
| **B4** | 0,48 ± 0,06 | **2,77 ± 0,12** | **6,73 ± 0,21** | 7,53 ± 0,23 | 5,83 ± 0,20 |
| B4+K | 0,71 ± 0,06 | 2,52 ± 0,11 | 6,61 ± 0,16 | 7,53 ± 0,23 | 6,34 ± 0,18 |
| B8 | 0,54 ± 0,05 | 2,11 ± 0,10 | 5,16 ± 0,13 | 6,39 ± 0,18 | 4,93 ± 0,17 |
| C (près du seuil ou du sommet) | 0,58 ± 0,06 | 1,83 ± 0,10 | 4,46 ± 0,15 | 5,53 ± 0,14 | 4,31 ± 0,16 |
| D0 (jeu fixe) | −0,02 ± 0,04 | 0,42 ± 0,09 | 2,92 ± 0,36 | 7,80 ± 0,37 | 2,55 ± 0,25 |
| D1 (jeu qui tourne) | 0,05 ± 0,04 | 0,64 ± 0,09 | 4,98 ± 0,32 | 7,81 ± 0,41 | 4,31 ± 0,32 |

Les lignes A8 et B4/8 viennent de `relecture/population-economie.txt` (la copie du simulateur avec les mêmes graines de tirage ; les lignes A et B4 y retombent exactement sur celles-ci). *Corrigé à la relecture* : le « jour du Xeon » du simulateur (320 000 s de courses) multiplie 191 courses/h, mesuré à la gen. 0 avec des courses de 53 s, par la course moyenne des gen. 0 et 1 (69,85 s). Le vrai Xeon fait environ 10 200 à 10 800 s de courses par heure (gen. 0 et gen. 1), pas 13 340. « 3 jours » du simulateur valent donc environ 3,7 à 3,9 jours réels. Cela ne change pas la comparaison à budget égal, seulement l'étiquette.
Les scénarios (supposés) : très faible, δ ~ N(−0,05 ; 0,15) ; faible, N(−0,1 ; 0,3) ; moyen, N(−0,2 ; 0,6) ; casse, moyen plus 20 % d'enfants cassés (δ de −4 à −6). Dans tous, un quart des mutations simples sont muettes, sauf « moyen sans clones » où aucune course n'est identique.

**La précision de la note cumulée.** Pour un pilote né en gen. 0 et encore vivant à la gen. 10 (formule, `gain-reel.txt`) : A 132 courses, se_F 0,30 palier ; B8 92, 0,36 ; B4 52, 0,48 ; B2 32, 0,62 ; D 12, 1,01. Dans la simulation, à la gen. 10, la corrélation de rang entre la note et la vraie valeur des anciens (scénario moyen) vaut : A 0,52, B4 0,41, B2 0,38, C 0,50, D0 0,26.

**Pourquoi B4 gagne quand même.** À nombre de générations égal, A fait mieux que B4, et B4 mieux que B2 (`par-generation.txt` ; moyen, génération 30 : A 3,96, B4 3,32, B2 3,21). B4 gagne parce qu'il fait 1,8 fois plus de générations, et non à cause d'un biais de la note. Rejouer un ancien qui a déjà 60 courses n'apprend presque plus rien. Faire naître un enfant de plus apprend davantage.

**Les pièges :**
- **Des graines différentes d'un pilote à l'autre.** Le modèle pilote + graine de `note.js` les corrige. Avec les seuls effets de graine, le meneur est le vrai meilleur à 51 générations sur 53 en B4 et 91 sur 93 en D1. Les ratés viennent des 10 passes, pas tout à fait convergées dans un plan déséquilibré : erreur max de a de 0,034 palier en B4 et 0,044 en C, contre 0,0005 à 30 passes (`convergence.txt`). Ce n'est pas gênant devant le bruit, mais 30 passes ne coûtent rien.
  En B4, le niveau d'un enfant face aux anciens ne se lit que sur les 4 graines communes. Les 8 autres ne départagent que les enfants entre eux. La simulation l'inclut, puisqu'elle utilise le même modèle.
- **Le jeu de graines fixe (D).** Il sur-apprend dès qu'il existe des courses identiques entre un parent et son enfant, ce que les données mesurent. Un clone d'un pilote chanceux hérite exactement de sa chance sur le jeu fixe. En simulation, la population se remplit de clones (6 sur 20 à la gen. 10) et D0 progresse nettement moins que A dans tous les scénarios avec clones (très faible : −0,02 contre 0,60 ; faible : 0,42 contre 1,84 ; moyen : 2,92 contre 4,46). Sans aucune course identique, D0 serait le meilleur (7,80 contre 5,46) : la seule différence est ce piège.
  En D, un ancien ne dépasse jamais 12 courses : il n'atteint jamais les 48 que la validation exige (`validation.nMin`).
- **Le rejeu sélectif (C)** n'économise rien : avec se_F ≈ 0,9, presque tous les anciens sont « près du seuil ». Il fait 307 à 311 courses par génération, contre 312.
- **La protection de 24 courses** (`protectionCourses`) ne marche plus en B4 : un enfant n'aurait que 16 courses à la génération suivante et resterait protégé deux générations de plus.

## Recommandations

1. **Les anciens rejouent 4 graines (B4).**
   - **Le changement** (une proposition, rien n'est modifié dans le code) :
     - `ml/evolution/config.json` : `"grainesAnciens": 4` (absent ou `null` = comme aujourd'hui).
     - `ml/evolution/evoluer.js`, `generation()`, au « 3. LES COURSES » : dans la double boucle `for(const g of pop.grainesGeneration)for(const v of pop.vivants)`, ne pas créer la tâche quand `v.ne < G` et que l'indice de la graine est ≥ `grainesAnciens`. L'ordre graine par graine reste le même : les 4 premières graines sont communes à tous.
     - Même fichier, `tournoi()` (le `pool` de 24 courses) et « 6. LE RENVOI » (`elig`) : remplacer `nDe(notes,v.id) >= cfg.protectionCourses` par l'âge. Un pilote est renvoyable s'il est né avant G (`v.ne < G`), et il entre au tournoi s'il est né en G−2 ou avant. C'est exactement ce que fait le code actuel avec 12 graines.
     - `note.passes` : 30 au lieu de 10.
     - `generations.jsonl` : ajouter `"grainesAnciens":4`. `courses.demandees` passera seul à 152. `morts.jsonl`, `arbre.js` et `histoire.js` ne changent pas.
     - L'économie de graines (`pleine_s`) suppose que toutes les tâches suivent `nGraines` : à revoir. *Corrigé à la relecture* : une génération B4 ne dure pas une demi-heure. Au rythme réel de la gen. 1, elle dure environ 4 150 s (47,8 % de 8 682 s), sous `seuilEconomie_s` (5 400 s) mais pas loin. Des courses 30 % plus longues la feraient passer en B4/8 (enfants 8 graines, anciens 4).
     - Un cas à ajouter dans `tests/generation.test.js`.
   - **Le gain attendu** (*corrigé à la relecture*) : face à ce qui tourne vraiment (A8, l'économie à 8 graines, en place depuis la fin de la gen. 1), environ 1,4 fois plus de générations par jour sur le Xeon : de ~14,9 à ~20,8 au rythme réel de la gen. 1 (14,7 → 30,8 n'était vrai que contre A à 12 graines, au rythme de la gen. 0). Après « 3 jours » du simulateur, le vrai niveau du meneur est 1,27 fois celui d'A8 en faible (2,77 contre 2,18), 1,18 fois en moyen (6,73 contre 5,68) et 1,17 fois en casse (5,83 contre 4,99). En très faible, c'est 0,48 contre 0,65 : moins bien, à environ 2 erreurs-types. Contre A à 12 graines : 1,5 fois en faible et moyen, 1,37 fois en casse, 0,48 contre 0,60 en très faible.
   - **Ce qu'il coûte** : la note d'un ancien est moins précise (se_F 0,48 au lieu de 0,30 à la gen. 10), et un ancien met 9 générations au lieu de 3 pour atteindre les 48 courses de la validation. Au rythme réel de la gen. 1, cela fait environ 10 h sur le Xeon, contre environ 8 h aujourd'hui (A8 : 5 générations à ~14,9 par jour). Il faut aussi modifier 3 endroits de `evoluer.js` et la config.
   - **La protection par l'âge vaut aussi sans B4** (relecture) : avec l'économie à 8 graines qui tourne, un enfant n'a que 8 courses à sa naissance et 16 à la génération suivante. Les 24 courses de `protectionCourses` le protègent donc déjà du renvoi deux générations au lieu d'une, et l'écartent du tournoi deux naissances au lieu d'une.
   - **Comment on saura** : comparer, par jour de calcul et non par génération, la pente du champion moins le témoin dans `coffre.jsonl` (les 40 graines jamais entraînées) et le nombre de sacres, avant et après le changement. Le test-retest des anciens doit aussi devenir positif. Tant qu'il reste nul, aucune règle ne départage les pilotes. (Relecture : sur 4 courses par génération, l'erreur d'un a vaut σ/√4 ≈ 1,6 palier, trois fois l'écart vrai le plus large vu à la gen. 0. Il faut donc comparer des moitiés de plusieurs générations, par exemple les générations paires contre les impaires, et non une génération contre la suivante.)
   - **Confiance** : moyenne. Le gain en temps est mesuré. Le gain en progrès dépend de l'effet des mutations, qui est supposé.
2. **Le tri des clones (K).**
   - **Le changement** : après les 4 premières graines, un enfant dont les 4 courses ont la même `empreinte` que celles de son parent (qui les a jouées, puisque les anciens jouent les 4 premières) s'arrête là. Il entre dans `morts.jsonl` avec `raison:'clone'`, `n:4` et `parent`, et dans `generations.jsonl` avec `morts:[{id, raison:'clone', apres:4}]`. Il faut ajouter le libellé `clone` dans `RAISONS` de `histoire.js`. `arbre.js` lit déjà toute raison.
   - **Où le brancher** : dans `generation()`, ne demander à l'ordonnanceur les tâches 5 à 12 d'un enfant qu'une fois rendues ses 4 premières courses et celles de son parent (une promesse chaînée dans `courir`). Il n'y a pas de barrière, donc aucun travailleur n'attend.
   - **Le gain attendu** : 2,2 % du temps d'une génération dans la gen. 1 réelle (1 clone sur 6 enfants). Cela empêche aussi les clones de s'accumuler (2,5 à 3,5 sur 20 vivants à la gen. 10 en simulation, schéma A). Le progrès simulé ne change pas au-delà du bruit.
   - **Ce qu'il coûte** : une petite modification. Sur les vraies données, 1 enfant sur 25 a été désigné, et c'était le vrai clone. En simulation, 0,05 à 0,16 % de faux clones. Un clone n'est pas forcément inutile, car ses gènes muets peuvent compter plus tard.
   - **Confiance** : moyenne sur la détection, faible sur le gain.
3. **Ne pas faire le tri précoce.** Gain mesuré nul (0 enfant sur 25 à k = 3 ; 1 sur 25 à k = 4 ou 6, d'après la relecture), environ 1 % du temps par enfant renvoyé, aucun effet en simulation.
   Si on le fait quand même :
   - la règle : k = 3, c = 2, sur le a non rétréci moins 4 fois le E moyen, jamais sur le F de `note.js` ;
   - le seuil S : à ranger dans `population.json` à la fin du renvoi ;
   - les journaux : `raison:'renvoi-precoce'` avec `n`, `a_k`, `borne` et `seuil` ;
   - le branchement : comme le tri des clones.
4. **Ne pas faire C ni D.** C n'économise rien. D sur-apprend son jeu de graines à cause des courses identiques, et ses pilotes n'atteignent jamais la validation.

## Limites

- **L'effet d'une mutation est inconnu.** Le test-retest des 20 premiers pilotes est négatif (−0,21 sur 20 pilotes, donc une incertitude d'environ ±0,45). Les scénarios couvrent de 0,15 à 0,6 palier, et le vrai monde est peut-être sous le plus faible.
- **Un seul clone a été vu.** La part de 1 sur 4 vient de 1 cas sur 4 mutations simples.
- **Les courses identiques dépendent de la graine** (3 graines « où tout le monde meurt » portent la plupart), alors que le simulateur les tire indépendamment.
- **La simulation n'a ni plafond, ni validation, ni sacre, ni phases.** Ses niveaux absolus (+4 à +8 paliers en 3 jours) ne sont pas réalistes. Seule la comparaison des schémas compte.
- **E est simulé** comme une moyenne de bruits par partie (ET 0,31 par partie, mesuré). Le vrai E de `note.js` est une distance à la foule.
- **La génération 1 n'était pas finie** à la lecture (10 graines complètes sur 12, ramenées à 12).
- **La réserve de graines d'entraînement** (relecture, non simulé) : 1 081 graines tirées sans remise (`graines.js`), puis avec remise hors des 5 derniers lots. À 12 graines par génération, la réserve tient 90 générations : environ 9 jours en A, 4,3 jours en B4 au rythme réel de la gen. 1 sur le Xeon, et 1 à 2 jours sur le Ryzen. Ensuite, un ancien qui retombe sur une graine déjà jouée sort du cache, sans rien apprendre. Un enfant, lui, rejoue des graines que son parent connaît déjà, ce qui ramène en partie le piège de D. B4 y arrive deux fois plus vite. Il faudra agrandir la réserve, mais la plage 950 000 et au-delà sert déjà au repli de la validation et au coffre.

## Comment refaire

Les commandes, dans ce dossier, une à la fois, chacune en moins de 2 minutes, sans aucune course du jeu :

```
node mesurer.js > mesures.txt          (écrit aussi residus.json)
node verifier.js > verifier.txt        (code 1 si un contrôle rate)
node regles.js > regles.txt
node gain-reel.js > gain-reel.txt
node convergence.js > convergence.txt
node population.js 40 > population.txt
node population.js 40 par-generation > par-generation.txt
```

Pour relire une évolution plus avancée : recopier `courses-AAAA-SS.jsonl`, `generations.jsonl` et `population.json` de son dossier `etat\` dans `donnees\`, puis relancer les commandes. Ne jamais lancer les scripts dans le dossier `etat\` lui-même.

Les scripts de la relecture (même dossier, un à la fois) :

```
node relecture/gain-independant.js > relecture/gain-independant.txt
node relecture/tri-reel-apparie.js > relecture/tri-reel-apparie.txt
node relecture/population-economie.js 40 > relecture/population-economie.txt   (25 s)
```

## Relecture (27/11/2026, un second agent, chargé de réfuter)

**Ce qui a été refait.** Les sept commandes ont été relancées une à une. Les sorties retombent à l'identique (`relecture/*-relance.txt` ; seule la durée de calcul de `population.txt` change, 127 s contre 116 s), et `residus.json` est inchangé au bit près. Les scripts ont été relus ligne à ligne contre `evoluer.js` (`tournoi`, « 3. LES COURSES », « 6. LE RENVOI », l'économie de graines), `note.js` et `graines.js`.

**Refait par un autre chemin.**
- Le gain de temps de B4 (`relecture/gain-independant.js`). L'ordre des graines est pris à leur première apparition, et le temps moyen d'une course par groupe est calculé sur toutes les lignes de la gen. 1 au lieu des seules graines complètes. B4 vaut 48,4 % de A (l'étude : 47,8 %), et B4 / A vaut 2,07 fois plus de générations (l'étude : 2,09). **Le gain de temps tient.**
- Le tri précoce sur les vrais enfants (`relecture/tri-reel-apparie.js`) : voir l'erreur 2.

**Ce qui était faux, et ce qui est corrigé dans ce fichier :**
1. **La référence « aujourd'hui » n'est plus celle qui tourne.** L'étude compare tout à A (12 graines, 312 courses). Or la vraie évolution est passée seule à 8 graines à la fin de la gen. 1 : la gen. 1 a duré 8 682 s, au-dessus de `seuilEconomie_s` (5 400 s). C'est écrit dans `generations.jsonl` et `population.json` de l'essai, lus en lecture seule à 23:45 (`nGraines` vaut 8). Face à A8 (208 courses), B4 ne donne que 1,4 fois plus de générations, au lieu de 2,1. Dans le simulateur, B4 fait 1,17 à 1,27 fois mieux qu'A8 (faible, moyen, casse), au lieu de 1,37 à 1,5 fois. En très faible, le régime que le test-retest désigne, il fait moins bien (0,48 ± 0,06 contre 0,65 ± 0,06). *Corrigé* : « En une minute », le tableau du coût, celui du progrès (lignes A8 et B4/8) et la recommandation 1.
2. **Le tri précoce sur les vrais enfants comparait deux zéros différents** (`regles.js` § 3). La borne de l'enfant venait d'un ajustement sur les seules k premières graines. Elle contient donc la difficulté moyenne de ces graines : +0,54 palier à k = 3, +0,88 à k = 4. Le seuil, lui, venait de l'ajustement des 12 graines de la gen. 0, et pour la gen. 1 de graines toutes différentes. Jugés dans une même référence (comme `evoluer.js` le ferait), les enfants donnent : 0 renvoi à k = 2 et 3, 1 à k = 4, 1 à k = 6, et une plus petite marge de −0,59 au lieu de +0,34. *Corrigé* dans le texte de la question 1. La conclusion (« ne pas faire le tri précoce ») ne change pas : elle repose sur le temps gagné, environ 1 % d'une génération par enfant renvoyé.
3. **Le nombre de générations par jour était celui de la gen. 0.** 191 courses à l'heure ont été mesurées sur des courses de 53 s. Celles de la gen. 1 durent 84 s : la vraie gen. 1 a fait 9,95 générations par jour, pas 14,7. Le simulateur, lui, multiplie ces 191 courses à l'heure par 69,85 s : son « jour du Xeon » vaut environ 1,25 à 1,3 jour réel. *Corrigé* : les tableaux, la recommandation 1 (B4 ≈ 20,8 générations par jour au lieu de 30,8, la validation à ~10 h au lieu de ~7 h, une génération B4 de ~4 150 s au lieu d'une demi-heure).
4. **La protection de 24 courses déborde déjà aujourd'hui** : avec 8 graines, un enfant reste protégé deux générations. Le passage à la protection par l'âge vaut donc même sans B4. *Ajouté* à la recommandation 1.
5. **Le contrôle « test-retest des anciens sur leurs 4 graines communes »** ne peut rien montrer d'une génération à l'autre, car l'erreur d'un a sur 4 courses vaut ~1,6 palier. *Corrigé* : comparer des moitiés sur plusieurs générations.

**Ce qui tient après vérification :**
- l'outil rapide rend `note.js` à 2·10⁻¹⁵ près ;
- la table des renvois selon Δ (contrôle contre la formule exacte) ;
- le piège de E = 4 sous 5 parties ;
- le clone `9627905cd5bb` (11 courses sur 11) ;
- le mécanisme de B4 (plus d'enfants essayés, pas un biais de la note : `par-generation.txt`) ;
- le piège de D et l'inutilité de C ;
- le réglage `note.passes` 30 (`convergence.txt`).
Le simulateur suit les vraies règles pour μ, λ, l'immigré, le tournoi de 3, le croisement 3 fois sur 10, le renvoi et le centre du rétrécissement. Il diffère sur trois points : il n'a pas de champion protégé, il protège par l'âge (ce qui équivaut au code actuel à 12 graines, pas à 8) et il n'a pas d'économie de graines (ajoutée dans la copie de relecture).

**Ce que la relecture n'a pas pu trancher :**
- l'effet vrai d'une mutation, donc lequel des scénarios est le bon. Le gain de B4 face à A8 va de −26 % (très faible) à +27 % (faible) ;
- l'épuisement de la réserve de graines, qui arrive deux fois plus vite en B4 (voir les limites) ; il n'est pas simulé.
