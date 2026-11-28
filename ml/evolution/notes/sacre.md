# Le lot « sacre » : la validation séquentielle (A5) et l'alarme « malédiction » coupée (A1) — 28/11/2026

Pour l'intégrateur, puis pour Sacha. Source : `ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md` § 2 (A1, A5) et § 4 (M5), l'étude
`sacre/` **et sa relecture** (malédiction sur le 1er regard ; « le séquentiel est le moins cher, pas le plus puissant »).
Rien n'est commité. Le jeu ne change pas. Aucun fichier d'époque touché (`cfg.validation` n'entre dans aucune époque : `courses.js` ne hashe que `cfg.note`, `reseaux`…).

## En mots simples (pour Sacha)

- Avant : le meilleur pilote du moment rejouait **24 courses neuves** contre le champion ; il n'était sacré que s'il gagnait nettement.
  Un pilote vraiment meilleur d'un palier n'était reconnu qu'**une fois sur 7**.
- Maintenant : il rejoue d'abord 24 courses ; **s'il semble devant**, on lui en donne 12 de plus, puis encore 12…, jusqu'à 96. Au début il faut
  gagner très nettement pour être sacré, à la fin un peu moins. S'il est clairement à la traîne, on arrête tout de suite (on n'achète pas de courses
  pour rien).
- Ce que ça donne (mesuré avec ce code, sur les vraies courses du 27/11 rejouées en simulation, voir plus bas) : un vrai +1 palier reconnu environ
  **une fois sur 3**, un +2 **8 fois sur 10**, et **moins** de faux champions qu'avant (environ 1,8 sur 100 validations au lieu de 3). Un pilote moins
  bon n'est jamais sacré. Coût : environ 38 graines (76 courses) par validation quand le meneur ne vaut pas mieux, 60 quand il vaut +1, au lieu de 24.
- L'alarme « malédiction du gagnant » est **coupée** : elle aurait rendu les sacres plus rares au bout de 10 validations, alors qu'elle sonnait
  par construction (le meneur est choisi parce qu'il a eu de la chance ; c'est normal, et les courses neuves s'en protègent déjà). La mesure reste
  écrite dans le journal.
- **Une décision reste à toi** (D1 de la synthèse) : les deux garde-fous (« il ne va pas moins loin », « il ne ressemble pas moins aux joueurs »)
  restent à **1** erreur-type, comme avant. À 2, un +2 paliers serait reconnu 86 fois sur 100 au lieu de 80, mais un pilote qui gagne du palier
  en ressemblant un peu moins aux joueurs passerait plus souvent. C'est `validation.seuilB` / `seuilC` dans `config.json`.

## Ce qui a changé

| fichier | changement |
|---|---|
| `evoluer.js` | `validation()` : boucle de regards (`jouerLot`, `regarder`, `decisionRegard`, `borneRegard`, `planValidation`, `zDe`) ; malédiction sur le **1er** regard ; `alarmeMalediction` (null/absent = pas d'alarme) ; `charger` refuse un plan mal écrit ; la ligne de `generations.jsonl` porte en plus `validation.graines`, `validation.regards`, `validation.arret` (validation séquentielle seulement). Tout est exporté pour les tests. La revalidation est inchangée (24 graines, `revalidationPerte`). |
| `note.js` | `comparer` : critères (b) `dPalier > −seuilB·se`, (c) `dE < seuilC·se`, lus dans `o.seuilB`/`o.seuilC` puis `cfg.validation.seuilB`/`seuilC`, **1 par défaut** (au bit près l'ancien comportement : test V3). Le `<` de (c) n'est **pas** passé à `<=` (proposition de l'étude, cas d'école ; non demandé). |
| `config.json` | `validation` : `maledictionSeuil: null` ; `plan: "sequentiel"`, `pas: 12`, `plafond: 96`, `borneOBF: 2.2`, `futilite: 0.5`, `seuilB: 1`, `seuilC: 1` ; une note dans `_notes` qui cite l'étude. `graines: 24` = le premier lot. |
| `config-essai.json` | `validation.pas: 3`, `plafond: 9` (regards à 3, 6, 9) ; une note. |
| `etat.js` | `regardsClair(v, {accents})` (exportée) ; ligne 8 du résumé : `Validation (gen. 12) : 6c66b73c contre 19e3767c : SACRE au 3e regard, sur 48 graines (dF +1.80 +- 0.80)` ; une ancienne ligne garde l'ancienne phrase. |
| `histoire.js` | la phrase d'une validation séquentielle : « … sur des courses neuves, 24 d'abord, puis 12 de plus tant qu'il semble devant, jusqu'à 96. Son avance de note à la fin est de … (sur les 24 premières : …) … **Il est sacré au 3e regard, sur 48 graines.** » / « Il n'est pas sacré : arrêté au 1er regard, sur 24 graines (z 0,31 sous 0,5). » |
| `tableau.js` | section 5 : explique le séquentiel ; la courbe verte est le dF des **24 premières** graines (celui de la malédiction) ; la dernière validation dite en clair. |
| `arbre.js` | la fiche d'un sacré dit comment : « (génération 12 : sacré au 3e regard, sur 48 graines) » (`sacresClair` dans les données de la page). |
| `tests/validation-sequentielle.test.js` | neuf, rapide (3 s, aucune course) : V1 à V8 (voir son en-tête). |
| `tests/mesure-sacre.js` | neuf, la mesure (pas un test rapide : 45 min sur un cœur). |

## Le format nouveau d'une ligne de `validations.jsonl` (exemple réel, essai `config-essai.json`, faux ordonnanceur du test V5)

```json
{"generation":0,"date":"2026-11-28T01:21:39.831Z","usage":"validation","forcee":true,"meneur":"6c66b73cb5e2","champion":"19e3767cc346",
 "graines":[1000000,1000037,1000074,1000111,1000148,1000185,1000222,1000259,1000296],"entrainement":{"dF":-0.2,"se_dF":0},
 "validation":{"graines":9,"dF":1.8,"se_dF":0.8041,"dPalier":0.2,"se_dPalier":0.8041,"dE":-0.4,"se_dE":0},"criteres":{"a":true,"b":true,"c":true},
 "sacre":true,"malediction":-1,"maledictionMoyenne":null,"fichier":"essais/sacre/A/champions/g0000-d936e49f.js",
 "plan":{"nom":"sequentiel","premier":3,"pas":3,"plafond":9,"borneOBF":2.2,"futilite":0.5,"seuilB":1,"seuilC":1},
 "regards":[{"n":3,"mesurees":3,"borne":3.8105,"z":0.5917,"dF":0.8,"se_dF":1.352,"dPalier":-0.8,"se_dPalier":1.352,"dE":-0.4,"se_dE":0,"criteres":{"a":false,"b":true,"c":true},"decision":"continuer"},
            {"n":6,"mesurees":6,"borne":2.6944,"z":0.9318,"…":"…","decision":"continuer"},
            {"n":9,"mesurees":9,"borne":2.2,"z":2.2384,"…":"…","decision":"sacre"}],
 "arret":"sacre","courses":18}
```
- `graines` : **toutes** les graines jouées ; `validation` et `criteres` : ceux du **dernier** regard (tableau.js et histoire.js lisent toujours `validation.dF`) ;
  la clé de reprise (`generation|usage|meneur|champion|première graine`) ne change pas.
- `regards[k]` : `n` graines jouées jusque-là, `mesurees` (communes aux deux), `borne` du critère (a), `z = dF/se_dF` (`"+inf"` / `"-inf"` si `se_dF` = 0,
  `null` sans graine commune), les six nombres de `comparer`, ses critères, `decision` ∈ `sacre | continuer | futilite | plafond | epuisees`.
- `arret` = la décision du dernier regard ; `courses` = 2 × graines ; `plan` = les réglages utilisés.
- `malediction` = dF d'entraînement − dF du **premier** regard (24 graines, taille fixe ; la relecture a montré que le dernier regard est biaisé de −0,28 palier).
- Plan `"fixe"` : un seul regard, `plan:{nom:'fixe',premier,seuilSacre,seuilB,seuilC}`. Revalidation : ligne **inchangée** (ni plan ni regards).
- Une ancienne ligne (sans `regards`) se lit partout comme un seul lot : « pas sacre sur 24 graines (un seul lot) ».

Règles fines (choix prudents, à reporter dans INTERFACES.md § 6.4 et § 3.6 par l'intégrateur — je n'y ai pas touché) :
- la borne utilise les graines **mesurées chez les deux** (au plus n) : une course ratée n'est pas de l'information (borne un peu plus haute, plus prudent) ;
  quand tout est mesuré, c'est exactement la règle de l'étude ;
- au regard où l'on sacre, (b) et (c) doivent passer ; si (a) passe mais pas (b) ou (c), on continue (comme `plans.js` de l'étude) ;
- plus de graines de validation au milieu : arrêt sans sacre (`epuisees`) sur ce qui est joué ; dès le premier lot : `null`, comme avant.

## La reprise

Une validation interrompue (STOP, Ctrl+C, kill, coupure) rend `{interrompue:true}` sans rien écrire : `population.json` (et `graines.validationK`) n'est
réécrit qu'à la fin de la génération. La reprise retire les **mêmes** graines, le cache rend les courses déjà jouées, `comparer` a son propre générateur
(`rngDe('comparer|'+n)`) : mêmes décisions. **Prouvé** (V5, faux ordonnanceur, vrai code ailleurs) : STOP pendant le 3e paquet → rien d'écrit ; reprise →
la même ligne de validations.jsonl au champ près (date à part), 15 + 5 courses jouées = les 20 sans interruption, aucune clé en double.
Limite connue (d'avant ce lot) : une course **non mesurée pour une raison d'environnement** au premier lancement est rejouée à la reprise (règle 1 du cache) ;
si elle devient mesurée, le verdict peut différer — exactement comme pour une génération.

## Les graines de validation

- Plage : 1 000 000 + 37·k, `k` = compteur global sauvé dans `population.json` ; elle ne sert **jamais** à l'entraînement (910 000 à 949 960), ni au coffre
  (990 000 à 991 443), ni au repli (950 000 à 989 960). Une graine n'est jamais reprise : V7 tire 500 validations au plafond (48 000 graines) sans doublon.
- **La plage principale n'a pas de fin** dans le code (aucune borne sur `k`) : 96 graines par validation ne l'épuisent pas. La graine passerait 2³¹ après
  **604 302 validations au plafond** ; au plus une validation toutes les 5 générations (`intervalle`), soit plus de 3 millions de générations.
- Le **repli** (950 000 + 37·k, 1 081 graines) n'est activé par aucun code (`validationRepli` reste `false`) ; s'il l'était à la main, il tiendrait
  **11 validations au plafond** (45 au premier lot seulement), puis `validationFinie` (V7).
- Un arrêt au 1er regard ne consomme que 24 graines : `k` n'avance que de ce qui est joué.

## La mesure de CE code (`tests/mesure-sacre.js`)

Chaque regard est le vrai `evoluer.regarder` → le vrai `note.comparer` (400 tirages, config.json) à la borne du vrai `planValidation(config.json)` →
le vrai `decisionRegard`. Les courses : la réserve de l'étude (533 vraies courses du 27/11, résidu de palier + mesures d'une même course), **les mêmes tirages**
que l'étude : `g-controle-nul.js` (graine 99, 9 000 essais) pour les faux sacres, `d-regards.js evolution` (graine 170, cas dans le même ordre) pour la puissance.

| vrai écart du meneur | essais | (b)(c) à **1 se** (config.json) | (b)(c) à 2 se | graines jouées (1 se) | l'étude (1 se ; 2 se) |
|---|---|---|---|---|---|
| 0 (faux sacres, tirages g-controle-nul) | 9 000 | **1,8 %** [1,5 ; 2,1] | 1,8 % [1,5 ; 2,1] | 37,3 (2,10 regards) | 1,8 % [1,5 ; 2,1] (les deux) ; 37 |
| 0 (tirages d-regards) | 800 | 1,4 % [0,8 ; 2,4] | 1,4 % | 37,4 | 1,6 % (bootstrap 200) ; 38 |
| −0,5 | 800 | 0,1 % [0,0 ; 0,7] | 0,1 % | 29,7 | 0,0 % |
| **+1** | 800 | **33,1 %** [30,0 ; 36,5] | 33,9 % [30,7 ; 37,2] | 60,0 (4,0 regards) | 32,4 % ; 33,4 % ; 60 |
| **+2** | 800 | **79,9 %** [77,0 ; 82,5] | **85,9 %** [83,3 ; 88,1] | 58,6 | 80,3 % ; 86,3 % |

Les chiffres attendus (1,8 % ; 33 % ; 86 %) sont retrouvés. **Attention** : 86 % à +2 est le chiffre à **2 se** ; avec la config livrée (1 se, décision D1
non prise), c'est **80 %**. Les faux sacres ne dépendent pas de seuilB/seuilC. La règle d'avant faisait 3,0 % / 15 % / 44 % (étude, confirmé par sa relecture).
Refaire : `node ml/evolution/tests/mesure-sacre.js 9000 0 1,2` (45 min) et `node ml/evolution/tests/mesure-sacre.js 0 800 1,2` (25 min), un processus chacun.

## Compatibilité avec le Ryzen (code e93ff5cb5, génome v:2)

- Tous les champs nouveaux sont lus avec un défaut : une config sans `plan` = l'ancienne règle (V1) ; `seuilB`/`seuilC` absents = 1 (V3) ;
  `maledictionSeuil` absent = pas d'alarme ; une ligne de validations.jsonl sans `regards` se relit partout (V8).
- V8 recharge par `evoluer.charger`, `etat.resume`, `histoire.texte`, `arbre.page`, `tableau.page` des copies de sept états écrits par l'ancien code
  (`tests/etat-exemple`, `essais/tests-evoluer/etat`, `essais/relecture-traces/complet`, `essais/test-tableau/complet`, l'archive c0025 de `essais/c0101`,
  et deux populations **v:2** : `essais/integration/etat`, `essais/relecture-gestes/etat`) : aucune erreur.
- **Hors de ce lot, à savoir** : `tests/etat-exemple` et `essais/test-tableau/complet` ont des génomes v:1 que `genome.js` d'aujourd'hui refuse
  (« genome incompatible … version 1 ») ; ce refus existe déjà au commit de départ (genome.js n'est pas à moi). V8 relit alors leurs journaux sans population.json.
- **Quand le Ryzen recevra ce code**, sa config sera la nouvelle `config.json` : sa prochaine validation sera séquentielle, et son alarme coupée. Si sa
  `regle6` est **déjà passée à 3** (population.json `regle6`), elle y reste : couper l'alarme ne la redescend pas. À regarder dans son population.json.

## Les tests

Rapides (tous relancés à la fin, voir le compte rendu) : commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine,
machine-relecture, traces, relecture-traces, gestes, integration, portage, node-epoque, et le nouveau validation-sequentielle.

Avec de **vraies courses** (le jeu, `config-essai.json`, état à moi `essais/sacre/vrai`, `--travailleurs 2`, tmax 60) — les étapes a et f de
`evoluer.test.js` refaites dans mon dossier (evoluer.test.js écrit dans `essais/tests-evoluer`, commun à tous : je ne l'ai pas lancé) :
- `--une-generation` : identité IDENTIQUE sur les 3 graines, génération 0 finie (959 s, 26 courses), puis une vraie validation séquentielle :
  regard 1 sur 3 graines z 1,85 (borne 3,81) → continuer ; regard 2 sur 6 graines z 0,06 → arrêt (futilité), pas sacré.
- **la reprise après un kill dur** (`taskkill /F /T` du maître et de ses enfants pendant le premier lot, 4 courses sur 6 jouées) : deux copies de cet état,
  X sans interruption, Y tuée puis relancée (`--valider-maintenant`) : **la même ligne de validations.jsonl** (date à part), 18 lignes de validation
  dans le cache de Y pour 18 clés (aucune course jouée deux fois), autant que X.

## Ce qui reste, ce que je n'ai pas vérifié

- INTERFACES.md § 3.6, § 3.5 (les champs de `generations.jsonl`), § 6.4 (« 24 graines, 48 courses ») et la table § 3.1 sont à mettre à jour par l'intégrateur.
- D1 (`seuilB`, `seuilC` à 2) : décision de Sacha, non faite.
- C3 (`regle6` à 1) : non fait, à décider après les premières vraies validations.
- L'effet de la validation séquentielle sur le **progrès du champion** (et non sur le taux de sacre) n'est mesuré nulle part (synthèse C8).
- La supposition de l'étude (un meilleur pilote décale ses paliers sans changer leur forme) reste invérifiée : les `regards` des premières vraies validations
  du Ryzen permettront de la regarder (M5).
- Le `<=` du critère (c) n'est pas fait.

## Relecture (28/11/2026, le relecteur, chargé de chercher à réfuter)

**Relu ligne à ligne** : `git diff 7b1df608e` d'`evoluer.js` (la validation, l'alarme, `charger`), `note.js`, `config.json` / `config-essai.json`
(`validation`), `etat.js`, `histoire.js`, `tableau.js`, `arbre.js`, le test V1 à V8 et `mesure-sacre.js`. Le bootstrap de `comparer` est bien
apparié par graine et `se_dF` est l'écart-type des tirages, donc une **erreur-type** de dF. La graine du bootstrap (`comparer|n`) ne dépend que du
nombre de graines communes, donc le 2e appel de `regarder`, celui de la borne corrigée, rend les mêmes nombres. Les graines de validation
(1 000 000 + 37 k) ont un autre reste modulo 37 que la suite d'entraînement du lot « règles » (1 000 021 + 37 i), donc les deux plages ne se touchent pas.
La reprise retire les mêmes graines, parce que `population.json` n'est réécrit qu'à la fin. Après une coupure d'époque, `charger` relit tout depuis le disque.

**Refait par un autre chemin** (`ml/evolution/essais/relecture-sacre/`, hors git) :
1. `par-la-vraie-boucle.js` : `mesure-sacre.js` refait lui-même la boucle des regards (`valider()`) et n'appelle que `regarder`. Mon script, lui, ne
   recopie rien. Chaque essai est un vrai `E.validerMaintenant` : `charger`, `validation()`, `jouerLot`, `graines.js`, `ecrireValidation`, le sacre et le coffre.
   Les courses passent par un faux ordonnanceur et viennent de la réserve de l'étude, avec **d'autres tirages** (hachage pilote/graine). Une règle
   écrite à la main redécide ensuite chaque ligne de `validations.jsonl` à partir de ses `regards`.

   | vrai écart | essais | sacres (config livrée, 1 se) | graines | l'auteur |
   |---|---|---|---|---|
   | 0 | 4 000 | **1,9 %** [1,5 ; 2,4] | 37,5 | 1,8 % [1,5 ; 2,1] ; 37,3 |
   | +1 | 1 000 | **31,1 %** [28,3 ; 34,0] | 61,0 | 33,1 % [30,0 ; 36,5] ; 60,0 |
   | +2 | 1 000 | **83,7 %** [81,3 ; 85,9] | 59,1 | 79,9 % [77,0 ; 82,5] |

   Aucune incohérence entre les regards écrits et la décision prise (0 sur 6 000). Les chiffres de l'auteur **tiennent** aux erreurs de tirage près.
   Le +2 tombe entre son 80 % et son 86 % : à 1 se, dire « environ 80 à 84 % ». Refaire : `node par-la-vraie-boucle.js 4000 1000 1000` (35 min, un cœur).
2. `etat-v2.js` : les deux états v:2 de V8 n'ont **aucune** ligne de validation, donc V8 ne prouvait pas la relecture d'une ancienne validation sur une
   population v:2. `tests/etat-v2-ancien`, écrit par l'ancien code avec une validation, se recharge sans erreur. Une validation séquentielle s'écrit
   par-dessus et reprend les graines là où l'ancien code s'était arrêté (`validationK` 3 → 1 000 111). Le résumé, l'histoire, l'arbre et le tableau
   se lisent avec les deux sortes de lignes.

**Corrigé en place** (marqué « le relecteur ») :
- `etat.js` : la ligne 8 du résumé dans le cas le plus fréquent (arrêt au 1er regard) faisait 124 caractères, et 130 à 141 avec de grands nombres
  ou des graines épuisées. `couper()` la tronquait en « (dF +0.25 +... ». Le dF n'est plus ajouté que s'il tient dans les 118 colonnes, et « graines de
  validation epuisees » devient « plus de graines ». Le test V5 ne le voyait pas : son cas (sacré) faisait 107 caractères.
- `config.json` `_notes` : la note disait « un +2 86 au lieu de 44 ». 86 % ne vaut qu'avec seuilB = seuilC = 2, une décision qui n'est pas prise.
  Avec la config livrée, c'est 80 %.

**Pas corrigé, à savoir** :
- Lancés ensemble, quatre tests rapides ont échoué une fois (`commun` : ecrireAtomique, `integration` 3/29, `portage` 1, `relecture-traces` 90/95).
  Relancés seuls, ils passent tous (16/16, 29/29, 11/11, 95/95). Je pense que c'est le partage de dossiers ou de fichiers avec les autres agents qui
  tournent en même temps, pas ce lot. À relancer par l'intégrateur sur un PC calme.
- La décision `futilite` l'emporte sur `plafond` au dernier regard quand z < 0,5 : c'est le nom de l'arrêt qui change, pas le verdict. Pour `epuisees`, la
  décision « continuer » du dernier regard est écrasée dans `regards` : on perd l'information, pas le verdict.
- Le bootstrap de toutes les validations de même taille tire les mêmes indices (`comparer|n`). Ce n'est pas un biais, mais leurs erreurs-types sont
  corrélées d'une validation à l'autre. C'était déjà le cas avant ce lot.
- Ce qui était déjà là avant le lot : à la reprise d'une génération dont la validation était déjà écrite, `maledictionMoyenne` compte cette validation
  deux fois en mémoire. La ligne n'est pas réécrite (clé de reprise) et l'alarme ne lit pas ce nombre, donc rien n'en sort.
- Je n'ai pas vérifié l'effet sur le progrès du champion (C8), ni la forme des paliers d'un meilleur pilote (M5), comme l'auteur.
