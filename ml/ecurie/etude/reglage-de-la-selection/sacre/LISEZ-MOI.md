# Le sacre : reconnaître un vrai meilleur sans sacrer un chanceux

Étude du 27/11/2026 (l'étude « sacre », dossier `ml/ecurie/etude/reglage-de-la-selection/sacre/`). Rien n'a été changé dans `ml/evolution/` :
ce qui suit est une **proposition**.

## En une minute

La sélection naturelle des bots nomme un nouveau champion (le « sacre ») quand le meilleur pilote du moment bat l'ancien champion sur
24 courses neuves. La question : cette épreuve reconnaît-elle un pilote vraiment meilleur, sans couronner un pilote qui a seulement eu de la chance ?
La réponse : elle est prudente mais presque aveugle. Un pilote qui ne vaut pas mieux que le champion est sacré 3 fois sur 100, et un pilote
qui vaut vraiment un palier de plus n'est reconnu que 15 fois sur 100 (2 paliers de plus : 44 fois sur 100).
Le chiffre qui tranche : en ajoutant des courses **seulement quand le meneur semble devant** (un test « séquentiel », par paquets de
12 graines, jusqu'à 96), on reconnaît un vrai +1 palier 33 fois sur 100 et un +2 paliers 86 fois sur 100, avec moins de faux champions
(1,8 sur 100 au lieu de 3,0), pour environ 37 à 60 graines par validation au lieu de 24 (soit 26 à 72 courses de plus, ce qui fait 8 à 23 minutes sur le Xeon).
Dans un monde simulé où les mutants diffèrent un peu (de l'ordre de 0,5 palier), cela double les vrais sacres, et aucun pilote moins bon
que le champion n'a été sacré.
Je recommande ce test séquentiel, des critères de garde (palier et ressemblance) qui ne rejettent que les reculs nets, et de couper
l'alarme « malédiction du gagnant », qui se déclenchera par construction.
Ce que je ne sais pas : tout est simulé à partir de vraies courses (pas de nouvelle course jouée), en supposant qu'un meilleur pilote
décale ses paliers sans changer leur forme ; et la vraie différence entre mutants (0,5 palier) est mesurée sur trop peu de courses pour être sûre.

## La question, et ce qui existe

- La règle d'aujourd'hui (`ml/evolution/INTERFACES.md` § 6.4 et § 8, `note.comparer`) : au moins 5 générations après la dernière validation, la règle 6
  est **essayée à chaque génération** jusqu'à ce qu'une validation ait lieu (`evoluer.js` : `G − derniereValidation ≥ intervalle`, `derniereValidation`
  ne change qu'après une validation). Une « fenêtre » de `f-population.js` est **un seul essai** de la règle 6 : ses taux « par fenêtre » sont des taux
  par génération essayée, pas par période de 5 générations *(précisé à la relecture)* ; le meneur (le plus haut F hors champion, n ≥ 48) n'est validé que si la **règle 6** est passée : `F_meneur − F_champion > 2·√(se² + se²)`
  sur les notes d'entraînement. Puis 24 graines neuves, jouées par les deux ; sacre si (a) `dF > 2·se_dF`, (b) `dPalier > −1·se_dPalier`,
  (c) `dE < +1·se_dE`. F = palier − 4 × E.
- Le relecteur statistique (`ml/evolution/tests/relecture-statistique/d-sacre-nul.js`, 300 essais) : 3,7 % de faux sacres, 12 % de sacres
  pour un vrai +1 palier.

## La méthode

1. **Les vraies courses de l'évolution** (`a-donnees-reelles.js`) : copie figée de `courses-2026-48.jsonl` de l'évolution lancée le 27/11 sur le Xeon
   (lue le 27/11 à 23:18:26, 573 lignes : 240 courses d'entraînement de la génération 0, 40 du coffre, 293 de la génération 1 en cours), dans
   `donnees/`. Rien n'a été touché ni lancé dans le dossier de l'évolution.
2. **Le code rapide** (`commun.js`) : `note.comparer` et l'écart E recodés pour aller environ 100 fois plus vite. `b-verifier.js` vérifie qu'ils rendent
   **les mêmes nombres** que `note.js` (écart maximal 4·10⁻¹⁵ sur 40 paires de vrais pilotes, mêmes critères 40 fois sur 40), et deux cas dont on connaît
   la réponse (deux pilotes identiques : dF = 0, jamais sacré ; un pilote décalé de 5 paliers : dPalier = 5 exactement).
3. **Les courses simulées** : une course simulée = le résidu de palier **et** les mesures d'une même vraie course (le lien « une course longue donne
   plus de mesures » est gardé), plus le vrai niveau du pilote. Trois réserves : `evolution` (les vraies courses de 900 s du 27/11, la vraie config,
   le modèle principal), `bruit` (les 34 pilotes × 24 graines de `courses-0.json`, mélangés), `gabarit` (un seul pilote réel par essai), plus le modèle
   du relecteur pour retrouver ses chiffres. Les résidus du modèle pilote + graine sont rendus à leur vraie taille (√(N/ddl)). L'effet de graine
   s'annule dans une comparaison appariée : il n'est pas tiré.
   Contrôle (`b-verifier.js` § 4) : écart-type de dPalier sur 24 graines entre deux pilotes égaux = 0,94 (l'étude du bruit : ≈ 0,97) ; de dF : 1,08 à 1,13.
4. **Les regards** (`d-regards.js`) : pour chaque essai, 96 graines neuves, et `comparer` sur les 24, 36, … 96 premières ; tous les plans sont lus
   sur **les mêmes tirages** (`plans.js`, `e-plans.js`). Bootstrap de 200 tirages (la config en a 400) ; `g-controle-nul.js` refait le taux de faux
   sacres des plans retenus avec 400 tirages et une autre graine du hasard.
5. **La population** (`f-population.js`) : 20 vivants qui ont joué les mêmes g générations (g = 4 : 48 courses chacun ; g = 10 : 120), la note
   d'entraînement comme `note.noter` (rétrécissement k = 12, se de E par bootstrap), le meneur, la règle 6, puis la validation. Trois mondes :
   NUL (tous égaux), UN+1 (un seul vaut +1), DISPERSE (les 19 autres tirés à N(0 ; 0,5) autour du champion : 0,5 est l'ordre de grandeur mesuré
   entre les mutants de la génération 0, voir plus bas).

## Les résultats

### 0. Ce que disent les vraies courses du 27/11 (`sorties/a-donnees-reelles.txt`)

| mesure (génération 0 : 20 pilotes × 12 graines, 900 s) | valeur |
|---|---|
| bruit d'une course (résidu du modèle pilote + graine) | 2,92 paliers |
| effet de graine (écart-type) | 2,16 paliers |
| écart vrai entre mutants, estimé (observé² − bruit²) | 0,54 palier (0,45 sur les 7 pilotes qui ont déjà 24 graines) |
| E moyen des mutants ; écart vrai de E entre eux | 0,914 ; ≈ 0 (le bruit l'explique entièrement) |
| corrélation des a, génération 0 contre génération 1 (7 pilotes) | 0,16 |
| courses sans mesures (moins de 60 s) | 22,1 % |
| temps réel d'une course (médiane) | 61 s |

Les mutants de la génération 0 diffèrent donc **peu** : autour d'un demi-palier. Les vrais progrès à reconnaître sont de l'ordre de +0,5 à +1 palier.

### 1. La règle d'aujourd'hui, refaite (`c-sacre-actuel.js`, bootstrap de 400 tirages, comme la config)

Part des validations qui sacrent, selon le vrai écart du meneur (même ressemblance que le champion). 4 000 essais pour 0, 2 000 sinon.

| modèle | −1 | −0,5 | **0 (faux sacres)** | +0,5 | **+1** | +2 | +3 |
|---|---|---|---|---|---|---|---|
| evolution (vraies courses du 27/11) | 0,1 % | 1,0 % | **3,0 %** [2,6 ; 3,6] | 7,8 % | **15,4 %** | 44,0 % | 72,3 % |
| bruit (courses-0.json, mélangés) | 0,1 % | 0,8 % | 2,5 % | 6,5 % | 14,3 % | 37,8 % | 67,2 % |
| gabarit (un pilote réel) | 0,3 % | 0,6 % | 2,5 % | 7,2 % | 16,2 % | 44,6 % | 67,8 % |
| modèle du relecteur | 0,6 % | 1,4 % | 2,5 % | 6,4 % | 13,4 % | 35,8 % | 60,1 % |

Les 3,7 % et 12 % du relecteur (300 essais) sont dans le bruit de ces mesures (300 essais donnent ± 2 points). Les deux chiffres sont confirmés :
**environ 3 % de faux sacres, environ 15 % de puissance à +1 palier.**

Un défaut que cette table montre : le critère (c) `dE < 1·se_dE`, pris seul, rejette **16 % des pilotes au hasard**, même quand leur ressemblance est exactement
celle du champion (il ne passe que 82 à 85 % du temps à toutes les valeurs de d). Mais (a) et (c) vont dans le même sens (un dE bas aide (a)) : parmi les pilotes
qui passent (a), (c) n'en retire que 1 à 10 % (+1 : 15,8 → 15,4 % ; +2 : 47,5 → 44,0 % ; +3 : 80,0 → 72,3 %). Le plafond d'un +3 paliers vient surtout de (a)
lui-même (80 % à 24 graines), (c) n'en retire que 8 points. *(Corrigé à la relecture : la version d'avant disait que (c) était la cause du plafond.)*

**La multiplicité** : sur 100 validations de pilotes égaux au champion, 3,0 faux champions attendus, et 95 % de chances d'en avoir au moins un.
Ce n'est pas réparable à bon prix (même 1 % par validation donne 63 % de chances d'au moins un sur 100) ; mais un faux champion **égal** ne coûte
rien au niveau : le vrai danger est de sacrer un **moins bon**, et celui-là est rare (−0,5 palier : 1,0 % ; −1 : 0,1 %).

### 2. Le meneur est choisi parce qu'il mène (`f-population.js`, 900 fenêtres par cas)

| monde, ancienneté | la règle 6 déclenche | biais du vainqueur (dF d'entraînement − vrai écart) | « malédiction » attendue (dF entraînement − dF neuf) | vrai écart moyen du meneur validé |
|---|---|---|---|---|
| NUL, g = 4 (48 courses) | 14,1 % des fenêtres | +1,68 palier | 1,76 | 0 |
| NUL, g = 10 (120 courses) | 18,2 % | +1,08 | 1,07 | 0 |
| DISPERSE, g = 4 | 29,2 % | +1,03 | 1,12 | +0,74 |
| DISPERSE, g = 10 | 62,1 % | +0,44 | 0,37 | +0,85 |
| UN+1, g = 4 (le vrai +1 est le meneur 47 % du temps) | 21,9 % | +1,12 | 1,24 | +0,63 |
| UN+1, g = 10 (le vrai +1 est le meneur 82 % du temps) | 50,8 % | +0,37 | 0,32 | +0,89 |

Ce que cela veut dire :
- La validation sur graines **neuves** n'est pas touchée par le biais du vainqueur : sous NUL, les sacres restent à ~3 % des validations
  (2,4 % et 3,0 %), comme sur des pilotes non choisis.
- **Le plan (c) « réutiliser les courses d'entraînement » est un piège** : compter les courses d'entraînement du meneur et du champion (mêmes graines,
  appariées) dans la validation, avec 24 neuves, sacre un pilote égal **53 % (g = 4) à 62 % (g = 10)** du temps. Comme « premier étage gratuit »
  il ne filtre rien : il passe dans 92 à 98 % des validations que la règle 6 a déjà déclenchées (c'est la même information). Les courses
  d'entraînement servent à **choisir** qui valider (la règle 6 le fait déjà), jamais à **juger**.
- **L'alarme « malédiction du gagnant » va sonner par construction** : la malédiction attendue quand tout marche est de 1,1 à 1,8 palier pour un
  meneur jeune (g = 4), au-dessus de `maledictionSeuil = 1`. Après 10 validations, `regle6` passera à 3, ce qui divise les vrais sacres par 5
  (DISPERSE, g = 4 : de 7,1 % à 1,4 % des fenêtres avec le plan proposé ; de 3,7 % à 0,3 % avec la règle d'aujourd'hui).
- La règle 6 elle-même (tableau détaillé dans `sorties/f-population.txt`) : à 1 au lieu de 2, on valide 60 à 90 % des fenêtres au lieu de 14 à 62 %,
  les vrais sacres augmentent (DISPERSE, plan proposé : 7,1 → 15,0 % des fenêtres à g = 4 ; 17,9 → 22,4 % à g = 10), les faux (égaux) aussi
  (NUL : 0,8 → 2,3 % des fenêtres à g = 4 ; 0,3 → 1,4 % à g = 10). Aucun pilote moins bon que le champion n'a été sacré par le plan proposé, à aucun réglage.

### 3. Les plans (`e-plans.js`, modèle evolution, 1 600 essais pour 0, 800 sinon, mêmes tirages pour tous)

Part des validations qui sacrent. « graines » = graines neuves jouées en moyenne (les courses = 2 × graines). Critères (b) et (c) à 2 se
(recommandé, voir § 4) ; le fichier `sorties/e-plans-evolution.txt` donne aussi les tables à 1 se (aujourd'hui) et sans (b) ni (c).

| plan | −0,5 | 0 | +0,5 | +1 | +2 | +3 | graines (0 / +1) | faux champions sur 100 validations égales (attendus ; au moins un) |
|---|---|---|---|---|---|---|---|---|
| actuel : 24 graines, z > 2 (critères à 1 se) | 1,6 | 3,4 | 8,5 | 18,1 | 42,6 | 71,3 | 24 / 24 | 3,4 ; 97 % |
| fixe 24, z > 2,33 | 0,5 | 1,7 | 5,4 | 11,1 | 34,1 | 69,5 | 24 / 24 | 1,7 ; 82 % |
| fixe 96, z > 2,33 | 0,0 | 1,1 | 10,8 | 31,6 | 90,4 | 97,3 | 96 / 96 | 1,1 ; 66 % |
| (a) deux étages : 24, si z > 1 → 96 en tout, z > 2 | 0,1 | 1,4 | 10,3 | 29,5 | 77,6 | 93,0 | 37 / 59 | 1,4 ; 75 % |
| (a) deux étages : 24, si z > 0,5 → 96, z > 2,33 ; z > 3 à 24 sacre tout de suite | 0,1 | 1,3 | 9,6 | 29,5 | 84,5 | 97,5 | 47 / 69 | 1,3 ; 73 % |
| (b) séquentiel, borne fixe 2,4, arrêt si z < 0,5, plafond 96 | 1,3 | 3,4 | 16,0 | 36,6 | 86,1 | 99,0 | 36 / 51 | 3,4 ; 97 % |
| **(b) séquentiel OBF 2,2 : borne 2,2·√(96/n), arrêt si z < 0,5, plafond 96** | **0,0** | **1,6** | **12,1** | **33,4** | **86,3** | **98,5** | **38 / 60** | **1,6 ; 79 %** |

Contrôle avec le bootstrap de la vraie config (400 tirages, autre graine, 9 000 essais, `g-controle-nul.js`) : faux sacres de l'actuel 3,0 %
[2,7 ; 3,4], du séquentiel OBF 2,2 **1,8 %** [1,5 ; 2,1], des deux étages (0,5 → 96, 2,33, direct) 1,2 % [1,0 ; 1,5]. Avec les courses de
`courses-0.json` (modèle bruit, `sorties/e-plans-bruit.txt`), le séquentiel OBF 2,2 donne 1,6 % / 8,7 / 29,9 / 84,1 / 98,3 % : même tableau.

Le séquentiel OBF (« O'Brien-Fleming ») exige beaucoup au début (z > 4,4 à 24 graines, 3,1 à 48, 2,5 à 72) et 2,2 à 96 : on n'achète
des graines que quand le meneur semble devant, et on s'arrête dès que z < 0,5 (un pilote égal au champion coûte en moyenne 38 graines, un +1 en coûte 60).

### 4. La ressemblance : que sacre F = palier − 4 × E ? (même fichier, cas où E bouge)

e = vrai écart de E du meneur (e > 0 : il s'éloigne des joueurs). 4 × e est ce qu'il perd en F. Séquentiel OBF 2,2.

| cas | dF vrai | règle actuelle | séquentiel, (b)(c) à 1 se | séquentiel, (b)(c) à 2 se | séquentiel sans (b) ni (c) |
|---|---|---|---|---|---|
| +1 palier, E +0,25 | 0 | 1,0 % | 0,3 % | 0,3 % | 1,3 % |
| +2 paliers, E +0,25 | +1 | 1,8 % | 0,8 % | 2,8 % | 32,3 % |
| +2 paliers, E +0,1 | +1,6 | 22,8 % | 29,5 % | 56,0 % | 72,8 % |
| 0 palier, E −0,25 (plus proche des joueurs) | +1 | 17,3 % | 35,3 % | 35,3 % | 35,3 % |
| 0 palier, E −0,125 | +0,5 | 7,8 % | 11,3 % | 11,3 % | 11,3 % |
| −0,5 palier, E −0,25 | +0,5 | 7,3 % | 8,5 % | 8,5 % | 8,5 % |

- Un pilote qui gagne 1 palier mais s'éloigne des joueurs de 0,25 n'est **jamais** sacré (comme un pilote égal) : F dit qu'il ne vaut pas mieux.
- Un pilote qui ressemble plus aux joueurs sans gagner de palier (E −0,25) est sacré **aussi souvent qu'un +1 palier** : F l'échange à 1 palier = 0,25 de E.
- Le critère (c) est le seul garde-fou contre « acheter du palier avec de la ressemblance » : il bloque +2 paliers / E +0,25 (sans lui : 32 %).
  À 1 se il bloque aussi, au hasard, 16 % des bons pilotes qui ressemblent autant que le champion ; à 2 se il ne bloque plus que les reculs nets.
- Est-ce ce que veut Sacha (« les meilleurs bots, qu'on ne distingue pas d'un joueur ») ? Le taux de change est un **choix de Sacha**, pas une
  question de statistique : aujourd'hui E des mutants vaut 0,91, donc ramener un pilote au milieu des joueurs (E = 0) « vaut » 3,6 paliers.
  Si Sacha veut qu'un pilote ne puisse **jamais** perdre en ressemblance pour gagner en palier, il faut garder (c) à 1 se (ou une marge fixe sur dE) et accepter
  les 16 % de bons pilotes refusés ; s'il accepte l'échange de F, (c) à 2 se suffit.

## La proposition

**Le plan retenu : séquentiel apparié, borne O'Brien-Fleming 2,2, arrêt si z < 0,5, paquets de 12 graines de 24 à 96, critères (b) et (c) à 2 se.**
Mesuré (modèle evolution) : faux sacres 1,8 % par validation [1,5 ; 2,1] (bootstrap à 400), soit 1,8 faux champions **égaux** pour 100 validations ;
moins bons sacrés : 0,0 % à −0,5 palier ; puissance 12 % à +0,5, 33 % à +1, 86 % à +2 ; 38 graines (76 courses) en moyenne pour un pilote égal, 60 (120 courses)
pour un +1. Le plan à deux étages (24 → 96 si z > 0,5, sacre si z > 2,33 ; direct si z > 3) est un repli plus simple à écrire et un peu plus cher (47 / 69 graines).
*(Corrigé à la relecture : il était dit « un peu moins puissant (29,5 % à +1) » ; c'est un effet de son taux de faux sacres plus bas, 1,2 à 1,3 % contre 1,6 à 1,8 %.
Ramené au même risque que le séquentiel, seuil 2,17 au lieu de 2,33, il a la même puissance sur les mêmes tirages : 33,4 % à +1 et 86,1 % à +2, contre 33,4 et 86,3 %
(`relecture/r2-plans-a-risque-egal.txt`). Le séquentiel n'est donc pas plus puissant, il est moins cher : 38 / 60 graines contre 47 / 69.)*

### Ce qui change dans `evoluer.js` (proposition, rien n'est modifié)

- **`validation(ctx, G, A, B, usage, notes, forcee)`** : pour `usage:'validation'` (et `--valider-maintenant`), au lieu d'un seul lot de
  `cfg.validation.graines` graines, une boucle :
  1. `n = 0`, `paquet = cfg.validation.graines` (24) au premier tour, puis `cfg.validation.pas` (12) ;
  2. `Gr.grainesValidation(pop.graines, paquet, cfg)` (les graines restent consécutives et ne servent qu'une fois), `courir` les 2 × paquet tâches,
     ajouter les lignes à `LA`, `LB` ;
  3. `cmp = N.comparer(LA, LB, {REF, cfg, seuilSacre: borne})` avec `borne = cfg.validation.borneOBF × √(cfg.validation.plafond / n)` ;
  4. noter le regard ; si `cmp.sacre` → fin (`arret:'sacre'`) ; sinon si `cmp.dF / cmp.se_dF < cfg.validation.futilite` → fin (`'futilite'`) ;
     sinon si `n ≥ cfg.validation.plafond` → fin (`'plafond'`) ; sinon retour en 2.
  Une interruption au milieu rend `{interrompue:true}` comme aujourd'hui : la reprise refait la génération, retire les mêmes graines (l'état des graines
  de population.json n'a pas été réécrit), retrouve les courses dans le cache et reprend les **mêmes décisions** (le plan est une fonction des seules courses).
  La revalidation d'après une nouvelle époque (`usage:'revalidation'`) garde son lot fixe de 24 et sa règle (`revalidationPerte`).
- **`R.validation`** (ce qu'écrivent `validations.jsonl`, `sacrer` et le fichier du champion) = le **dernier** regard, pour que `tableau.js` et `histoire.js`
  continuent de lire `validation.dF`. `malediction` = dF d'entraînement − dF **des 24 premières graines** (le premier regard), pas du dernier.
  *(Corrigé à la relecture : la version d'avant prenait le dernier regard. Sous un plan qui s'arrête selon ce qu'il voit, ce dF est biaisé : en moyenne −0,28 palier
  pour un pilote égal ou un +1, `relecture/r2-plans-a-risque-egal.txt` § 2. La malédiction aurait été gonflée d'autant. Le premier regard, de taille fixe, n'est pas biaisé.)*
- **La malédiction** : ne plus faire passer `regle6` à `regle6Haute` (garder la mesure dans le journal pour le portfolio). Elle mesure le biais du
  vainqueur, qui est attendu (1,1 à 1,8 palier pour un meneur jeune) ; la validation sur graines neuves s'en protège déjà.
- **`note.comparer`** (`note.js`) : lire les multiples des critères (b) et (c) dans `cfg.validation.seuilB` et `cfg.validation.seuilC` (1 par défaut,
  le comportement d'aujourd'hui), et `<=` au lieu de `<` dans (c) (aujourd'hui un pilote dont la ressemblance est exactement celle du champion,
  `dE = 0` et `se_dE = 0`, n'est jamais sacré : `b-verifier.js` § 3 ; cas d'école, sans effet pratique).

### Ce qui change dans `config.json` (`validation.*`)

```json
"validation": {
  "intervalle": 5, "nMin": 48, "regle6": 2, "regle6Haute": 3, "graines": 24, "bootstrap": 400,
  "maledictionFenetre": 10, "maledictionSeuil": null, "revalidationPerte": 1, "seuilSacre": 2,
  "plan": "sequentiel", "pas": 12, "plafond": 96, "borneOBF": 2.2, "futilite": 0.5,
  "seuilB": 2, "seuilC": 2
}
```
`plan: "fixe"` garde la règle d'aujourd'hui (24 graines, `seuilSacre`) ; `maledictionSeuil: null` coupe l'escalade de la règle 6. `regle6` : voir la
recommandation 4 (à 1 si Sacha veut plus de sacres, au prix de validations plus fréquentes).

### Le format proposé d'une ligne de `validations.jsonl`

Les champs d'aujourd'hui restent (même clé `generation|usage|meneur|champion|première graine` pour la reprise), `graines` porte **toutes** les graines
jouées, `validation` et `criteres` sont ceux du dernier regard. En plus :
```json
{"generation":20,"date":"…","usage":"validation","meneur":"77ab…","champion":"3f9a…","graines":[1000000,"… 48 …"],
 "plan":{"nom":"sequentiel","premier":24,"pas":12,"plafond":96,"borneOBF":2.2,"futilite":0.5,"seuilB":2,"seuilC":2},
 "regards":[{"graines":24,"borne":4.4,"dF":1.9,"se_dF":1.05,"z":1.81,"dPalier":1.4,"se_dPalier":0.9,"dE":-0.12,"se_dE":0.1,"suite":"continuer"},
            {"graines":36,"borne":3.59,"dF":1.6,"se_dF":0.85,"z":1.88,"…":"…","suite":"continuer"},
            {"graines":48,"borne":3.11,"dF":1.7,"se_dF":0.71,"z":2.39,"…":"…","suite":"continuer"}],
 "arret":"plafond|futilite|sacre","courses":96,
 "entrainement":{"dF":1.4,"se_dF":0.6},"validation":{"graines":48,"dF":1.7,"se_dF":0.71,"dPalier":1.5,"se_dPalier":0.66,"dE":-0.05,"se_dE":0.07},
 "criteres":{"a":false,"b":true,"c":true},"sacre":false,"malediction":-0.3,"maledictionMoyenne":0.7,"fichier":null}
```
(les nombres sont un exemple de forme, pas une mesure). `regards` permet de refaire après coup la décision et d'essayer d'autres bornes sur les vraies validations.

## Les recommandations

1. **Remplacer la validation à 24 graines par le séquentiel OBF 2,2 (paquets de 12, arrêt si z < 0,5, plafond 96).**
   Gain mesuré (simulé) : puissance à +1 palier 15 → 33 %, à +2 paliers 44 → 86 % ; faux sacres 3,0 → 1,8 % par validation ; dans le monde DISPERSE,
   vrais sacres par fenêtre 3,7 → 7,1 % (g = 4) et 8,4 → 17,9 % (g = 10), aucun moins bon sacré.
   Coût : 76 courses par validation d'un pilote égal, 120 pour un +1, au lieu de 48 : +26 à +72 courses, 8 à 23 minutes sur le Xeon (191 courses/h),
   au plus une fois toutes les 5 générations (1 560 courses) : moins de 5 % du temps. 1,6 à 2,5 fois plus de graines de validation consommées (la réserve
   principale n'a pas de fin). Du code dans `validation()` (une boucle) et `note.comparer` (deux seuils lus dans la config).
   Comment savoir : `regards` dans validations.jsonl ; la part des sacres qui confirment au coffre (40 graines) doit monter ; les faux sacres, eux, se voient
   comme des champions qui ne battent pas le témoin au coffre.
   Confiance : moyenne-haute (les rapports entre plans sont mesurés sur les mêmes tirages ; les niveaux absolus dépendent du modèle de courses, trois modèles concordent).
2. **Critères (b) et (c) à 2 se au lieu de 1** (`seuilB`, `seuilC`). Gain : (c) à 1 se refuse au hasard 16 % des pilotes qui ressemblent autant que
   le champion ; à 2 se, +2 paliers 80 → 86 %, +3 93 → 98,5 % ; faux sacres inchangés (1,6 %). Coût : un pilote +2 paliers / E +0,1 passe 56 % au lieu
   de 30 % ; +2 paliers / E +0,25 passe 2,8 % au lieu de 0,8 %. **C'est à Sacha de choisir** (§ 4). Comment savoir : le z de ressemblance du champion au
   coffre ne doit pas monter d'un champion à l'autre. Confiance : haute sur les chiffres, la décision est un goût.
3. **Couper l'escalade de la malédiction** (`maledictionSeuil: null`, garder la mesure). Gain : éviter que `regle6` passe à 3 après 10 validations,
   ce qui diviserait les vrais sacres par 5 (DISPERSE g = 4 : 7,1 → 1,4 % des fenêtres). Coût : aucun ; la validation sur graines neuves reste
   non biaisée (vérifié : faux sacres ~3 % sous NUL malgré le choix du meneur). Comment savoir : la malédiction moyenne des 10 premières vraies validations ;
   si elle est autour de 1 à 1,8 c'est le biais attendu, pas un défaut. Confiance : moyenne (mes pilotes ont tous le même âge ; dans la vraie population
   les âges se mêlent et la malédiction attendue est entre 0,3 et 1,8).
4. **(Option) `regle6` à 1 au lieu de 2.** Gain : vrais sacres par fenêtre 7,1 → 15,0 % (g = 4), 17,9 → 22,4 % (g = 10). Coût : on valide 60 à 90 %
   des fenêtres au lieu de 14 à 62 % (environ 100 courses chacune, ~6 % du temps), et 2,3 % de faux champions (égaux) par fenêtre sous NUL au lieu
   de 0,8 %. Confiance : moyenne (dépend du monde simulé). À faire après la 1, quand on aura vu les premières vraies validations.
   *(Réserve de la relecture : une « fenêtre » est ici un seul essai de la règle 6. Dans `evoluer.js`, la règle 6 est réessayée à chaque génération
   tant qu'aucune validation n'a eu lieu : à 2, la validation arrive souvent quelques générations plus tard, au lieu de ne pas arriver du tout. Le gain réel
   de la règle 6 à 1 est surtout de valider plus tôt, et il est plus petit que ces chiffres. De même, le « ÷ 5 » de la recommandation 3 est un taux par essai.)*
5. **Ne pas réutiliser les courses d'entraînement dans le jugement** (le plan (c) de la question) : 53 à 62 % de faux sacres. Elles restent
   le filtre (règle 6). Confiance : haute.

## Les limites, et ce qui est supposé

- **Aucune course n'a été jouée** : tout est rééchantillonné dans de vraies courses. Supposé : un pilote meilleur de d paliers décale chaque course de d
  (même forme de bruit) ; un pilote dont E diffère de e décale E de e (même bruit de E). Un vrai meilleur pilote peut avoir une queue de distribution
  différente (des courses très longues), ce qui changerait un peu la puissance.
- Supposé : pas d'interaction pilote × graine au-delà du résidu (l'étude du bruit la trouve faible), donc l'effet de graine s'annule dans la paire.
- L'écart vrai entre mutants (0,5 palier) vient de 20 pilotes × 12 graines et de 7 pilotes × 24 : très incertain ; la corrélation génération 0 /
  génération 1 n'est que de 0,16 sur 7 pilotes. Le monde DISPERSE est une hypothèse, pas une mesure.
- Les regards utilisent un bootstrap de 200 tirages (la config 400) : à 24 graines, 3,4 % de faux sacres contre 3,0 % à 400. Le taux du plan retenu
  est refait à 400 tirages (1,8 %).
- La population simulée : tous les vivants ont le même âge, le champion aussi ; E vrai identique pour tous ; pas de renvois ni de naissances.
- Les seuils du séquentiel ont été choisis sur une grille, puis vérifiés sur des tirages neufs (`g-controle-nul.js`) ; la grille ne contient pas
  tous les plans possibles.
- Le modèle de courses `evolution` vient de la génération 0 et du début de la génération 1 (mutants très proches du témoin) ; quand les pilotes
  auront beaucoup changé, le bruit pourra changer : refaire `c-sacre-actuel.js` sur les courses du moment.

## Comment refaire

Un seul processus node à la fois ; chaque commande dure moins de 3 minutes sur le Xeon.
```
cd ml/ecurie/etude/reglage-de-la-selection/sacre
node a-donnees-reelles.js        > sorties/a-donnees-reelles.txt     (< 1 s)
node b-verifier.js               > sorties/b-verifier.txt            (9 s)
node c-sacre-actuel.js 2000      > sorties/c-sacre-actuel.txt        (157 s)
node d-regards.js evolution 1600 800 > sorties/d-regards-evolution.txt   (140 s ; écrit sorties/regards-evolution.json, ignoré par git)
node e-plans.js evolution        > sorties/e-plans-evolution.txt     (< 1 s)
node d-regards.js bruit 1400 700 > sorties/d-regards-bruit.txt      (120 s)
node e-plans.js bruit            > sorties/e-plans-bruit.txt
node f-population.js 900         > sorties/f-population.txt          (162 s)
node g-controle-nul.js 9000 99   > sorties/g-controle-nul.txt        (71 s)
```
Pour d'autres vraies courses : remplacer `donnees/courses-2026-48.jsonl` par une copie plus récente (jamais l'original pendant que l'évolution tourne).

## Les fichiers

- `commun.js` : E et `comparer` rapides, les réserves de courses ; `plans.js` : les plans ; `donnees/courses-2026-48.jsonl` : la copie figée.
- `a-donnees-reelles.js` … `g-controle-nul.js` : une étape chacun (voir l'en-tête de chaque script) ; `sorties/` : leurs sorties.
- `relecture/` : les contrôles du relecteur (voir la section suivante).

## Relecture (28/11/2026, un second agent, chargé de chercher à réfuter)

**Ce qui a été refait.** Tous les scripts ont été relancés, un à la fois. `a`, `b`, `c` (2 000), `e`, `f` (900) et `g` (9 000, graine 99) rendent des sorties
**identiques** à celles du dossier. `d-regards.js evolution 1600 800` rend un `regards-evolution.json` de même empreinte SHA-256. Les sorties relancées sont dans
`relecture/re-*.txt`.

**Le résultat clé, par un chemin indépendant** (`relecture/r1-permutation.js`) : sans `commun.js` ni le code rapide, avec le **vrai** `note.comparer` (400 tirages)
sur de **vraies paires** de courses jouées sur les mêmes graines. L'appariement réel est donc gardé, y compris l'effet de graine sur les mesures qui font E.
L'hypothèse nulle est fabriquée par permutation (à chaque graine, pile ou face pour échanger la course des deux pilotes).

| source | faux sacres (2 000 essais) | +1 palier (1 000 essais) | auteur (même modèle) |
|---|---|---|---|
| courses-0.json, 34 pilotes × 24 graines, 300 s | 2,4 % ± 0,7 | 15,7 % ± 2,3 | 2,5 % ; 14,3 % |
| évolution du 27/11, 7 pilotes × 24 graines, 900 s | 3,5 % ± 0,8 | 16,9 % ± 2,3 | 3,0 % ; 15,4 % |

Les deux chiffres de la question 1 sont **confirmés** : environ 3 % de faux sacres, environ 15 % de puissance à +1. Le fait que l'auteur tire les mesures
de A et de B indépendamment, sans l'effet de graine commun, ne change rien de visible.

**Le désaccord f-population / e-plans** (3,0 % contre 1,6 % pour le séquentiel). Dans la simulation, les graines de validation sont tirées sans lien avec
l'entraînement : le choix du meneur ne peut pas changer ce taux. `relecture/r3-population-nul.js` refait le monde NUL avec une autre graine et 6 000 fenêtres.
Sur tous les essais : 1,6 % [1,3 ; 2,0]. Sur les 3 767 meneurs passés par la règle 6 à 1 : 1,7 % [1,3 ; 2,1]. La conclusion de l'auteur (le hasard) est **confirmée**.

**Ce qui était faux ou trop fort, et qui est corrigé plus haut** (chaque correction est marquée en italique à sa place) :
1. « C'est pourquoi même un +3 paliers n'est sacré qu'à 72 % » (§ 1). Le critère (a) seul ne passe que 80 % du temps. (c) ne retire que 1 à 10 % des pilotes
   qui passent (a), pas 16 % : 16 % est son taux pris seul.
2. « Le deux étages est un peu moins puissant » (la proposition). C'était un effet de son risque plus bas. À risque égal (1,56 % sur les mêmes 1 600 essais nuls),
   la puissance est la même : écart de 0,0 ± 1,5 point à +1 et de −0,1 ± 1,0 à +2 (`relecture/r2-plans-a-risque-egal.txt`). L'avantage du séquentiel est le
   **coût** : 38 / 60 graines contre 47 / 69. À risque égal, un lot fixe de 96 graines (seuil 2,125) est **plus** puissant que le séquentiel : 39,4 % à +1 (+6,0 ± 2,2)
   et 92,8 % à +2, mais il coûte toujours 96 graines.
3. La malédiction calculée sur le **dernier** regard (la proposition). Elle est biaisée de +0,28 palier (le dF du dernier regard vaut en moyenne −0,28 pour
   un pilote égal, −0,27 sous la vraie valeur pour un +1). Il faut la prendre sur les 24 premières graines.
4. « Une fenêtre de validation tous les 5 générations » (§ La question). Après 5 générations, la règle 6 est réessayée à **chaque** génération. Les taux
   « par fenêtre » de `f-population.js` sont des taux par essai. Les gains des recommandations 3 (« ÷ 5 ») et 4 sont donc surestimés en ampleur ; leur sens tient.

**Ce qui tient** : le recodage rapide (vérifié à 4·10⁻¹⁵ près), le taux de faux sacres du séquentiel (1,8 % [1,5 ; 2,1] à 400 tirages, refait à l'identique),
le piège du plan (c) (53 à 62 % de faux sacres, mécanisme évident : les courses d'entraînement du meneur sont celles qui l'ont fait choisir), la non-nécessité
de l'escalade de la malédiction (la validation sur graines neuves n'est pas biaisée, `r3`), et la question du taux de change palier / E, qui revient à Sacha.

**Ce que la relecture n'a pas pu vérifier** : la supposition « un meilleur pilote décale chaque course de d paliers ». Les paliers sont des entiers de 1 à 20,
sans plafond atteint (aucune course ne dure 900 s) et très asymétriques. Un vrai meilleur pilote pourrait plutôt allonger la queue des longues courses, ce qui
changerait la puissance de tous les plans à la fois, sans doute pas leur classement. Seules les premières vraies validations (`regards` dans `validations.jsonl`)
le diront.

Refaire la relecture (un processus à la fois) :
```
node relecture/r1-permutation.js 1000 bruit     > relecture/r1-bruit.txt          (115 s)
node relecture/r1-permutation.js 1000 evolution > relecture/r1-evolution.txt      (115 s)
node relecture/r2-plans-a-risque-egal.js        > relecture/r2-plans-a-risque-egal.txt   (lit sorties/regards-evolution.json, < 30 s)
node relecture/r3-population-nul.js 3000        > relecture/r3-population-nul.txt (147 s)
```
