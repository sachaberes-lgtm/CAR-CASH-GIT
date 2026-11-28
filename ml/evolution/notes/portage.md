# Le portage de la boucle payante dans le génome (28/11/2026, tâche « portage »)

> La demande : « le génome doit savoir écrire c0101 comme il écrit c0025 ». La sélection naturelle doit pouvoir **partir de c0101**
> (le dernier champion de la boucle payante du Ryzen) sans perdre c0025, et pouvoir allumer, éteindre et régler chaque apport de la boucle à part.

## En mots simples (pour Sacha)

- Le pilote que la sélection fait évoluer est écrit à partir d'une liste de réglages (le « génome »). Jusqu'ici, cette liste ne savait décrire que
  c0025 (pilote-voltige). Elle sait maintenant décrire aussi les cinq champions de la boucle payante : c0026, c0064, c0072, c0087 et c0101.
- Ce que la boucle payante a ajouté se découpe en **quatre interrupteurs** (un par idée nouvelle) et quelques réglages :
  1. **c0026** — sous la route, fuir tout de suite vers une trajectoire qui retombe dessus (et deux réglages déjà connus, changés) ;
  2. **c0064** — décoller nitro allumée quand le bord arrive, sur les maps sans décor ;
  3. **c0072** — faire des figures dans les vols subis qui sont bien partis (c0101 a ensuite baissé la hauteur demandée de 9 à 4 m) ;
  4. **c0087** — garder la nitro plus longtemps dans les virages, sur les maps sans décor.
- Tout éteint = c0025 exactement. Tout allumé avec les réglages de c0101 = c0101 exactement. C'est **prouvé en vraie course, au bit près**,
  sur trois graines pour chacun des deux (et sur 552 décisions pour chacun des six champions, sans course).
- Une surprise : **en vraie course, c0101 conduit exactement comme c0064**. Les idées 3 et 4 (et le réglage de c0101) ne se sont déclenchées dans
  aucune des courses essayées. Le progrès de la boucle payante vient des deux premières idées. La sélection pourra quand même régler les deux autres.
- Par défaut rien ne change : la sélection part toujours de c0025 (`"temoin": "c0025"` dans config.json). Pour partir de c0101, il faudra une
  commande exprès : `node ml/evolution/evoluer.js --repartir-de c0101`. Elle range l'ancienne population dans `etat/archives/…` (rien n'est
  effacé) et en fait naître une neuve.
- La sélection qui tourne sur le Ryzen n'est pas touchée tant qu'on n'y fusionne pas ce travail. Quand on le fusionnera, ses pilotes gardent leur
  nom et leur conduite, mais **toutes ses courses seront rejouées** (le pilote à trous `modele.js` a changé : c'est une nouvelle époque, comme
  après les gestes).

## Ce qui a changé

| Fichier | Quoi |
|---|---|
| `genome.js` | `PORTAGE` (14 gènes en fin de `BORNES`), `BLOCS` (les extraits de code de chaque bloc), `TEMOINS`, `nomTemoin`, `sourceTemoin` ; v:3 ; `migrer` v:1 et v:2 → v:3 ; `shaGenome` ; `genomeTemoin(cfg)` lit le témoin de `cfg.temoin` ; `--temoin --nom c0101` |
| `modele.js` | les quatre blocs, chacun derrière son drapeau (`R.fuirVite`, `R.bordOn`, `R.largeOn`, `R.libreOn`) ; `poseNette` |
| `identite.js` | compare au fichier du témoin choisi (`Gn.sourceTemoin`) ; `--temoin c0101` ; rend `temoin` et `fichier` |
| `evoluer.js` | `population.json temoinNom` ; un état garde son témoin et le dit ; `--repartir-de NOM` (`repartir`, `archiverEtat`) ; l'empreinte d'identité suit le fichier du témoin ; le champion `.json` porte `temoin` |
| `config.json` | `"temoin": "c0025"` (+ une note dans `_notes`) |
| `arbre.js` | les mots simples des 14 gènes (`MOTS`) ; le témoin nommé d'après la population |
| `etat.js` | `temoinNom(pop)`, `temoinClair(pop)` ; la ligne « Temoin » dit son nom |
| `tableau.js`, `histoire.js` | le témoin nommé d'après la population (plus « pilote-voltige » en dur) |
| `inscrire-champion.js` | le parent au labo quand le précédent est le témoin : le fichier du témoin de la population, sinon son nom (c0101…) |
| `.gitignore` | `etat/archives/*/courses*.jsonl`, `pilotes/`, fragments |
| `INTERFACES.md` | § 10 (nouveau ; il l'emporte sur les § qu'il complète) |
| tests | `portage.test.js` (nouveau) ; `identite.test.js` (deux témoins) ; `genome.test.js`, `gestes.test.js`, `integration.test.js` (121 gènes, v:3) |

Rien dans `code/`, `VERSION PRINCIPALE/`, `ml/bot/`, `ml/reel/`, `ml/labo/`, `ml/ecurie/pilote-voltige.js`, ni les `.cmd`. `config-essai.json` inchangé.

## Le découpage, sacre par sacre

Les différences entre champions successifs (`diff` des fichiers de `ml/labo/cerveaux/`, fins de ligne ignorées) sont propres : aucun remaniement
de structure, donc **aucun drapeau « bloc entier c0025 / bloc entier c0101 »** n'a été nécessaire.

| Sacre | Ce qui change dans le code | Gènes |
|---|---|---|
| c0025 → c0026 | `dessousMax` .8 → .4, `dessousPose` 25 → 40 ; la bascule en vol : `depuis>R.tenirFacon \|\| fuit \|\| …` | 2 gènes existants ; `fuirVite` |
| c0026 → c0064 | une ligne après le calcul de la nitro au sol | `bordOn` ; `bordNitro`, `bordJauge` |
| c0064 → c0072 | les figures : `parentOk`, `large`, `nMax`, `tSeuil` ; `poseNette` | `largeOn` ; `largeHaut`, `largeT1`, `largeT2`, `largeAxe`, `largeAir`, `largeMax` |
| c0072 → c0087 | le seuil de la nitro tenue (`k`) et sa marge (`mTenir`) hors décor | `libreOn` ; `nitroLibreK`, `tenirLibre` |
| c0087 → c0101 | `largeHaut` 9 → 4 | (le réel de c0072) |

Les bornes (min, max) et pourquoi : la valeur de c0025 quand elle existe (le parent : `figHaut` 15 pour `largeHaut`, 1 pour `nitroLibreK`, 0 pour
`tenirLibre`), celle de c0072 et de c0101, une marge autour qui reste dans le sens du geste, et les seuils mesurés cités dans les commentaires de
c0101 (`largeT1` : « sous 2,2 s une figure déréglait le vol » → borne basse 1,6). Le détail ligne par ligne est dans `genome.js` (`PORTAGE`).

| Gène | min | max | naissance (= c0101) | c0072 / c0087 | c0025 |
|---|---|---|---|---|---|
| bordNitro | 0,3 | 1,2 | 0,7 | 0,7 | — |
| bordJauge | 0,2 | 1 | 0,5 | 0,5 | — |
| largeHaut | 2 | 15 | 4 | 9 | (figHaut 15) |
| largeT1 | 1,6 | 3 | 2,2 | 2,2 | (figTemps 1,5) |
| largeT2 | 1,2 | 3 | 1,8 | 1,8 | — |
| largeAxe | 0,25 | 0,8 | 0,5 | 0,5 | — |
| largeAir | 0,5 | 3 | 1,5 | 1,5 | — |
| largeMax (entier) | 1 | 5 | 3 | 3 | (figMax 2) |
| nitroLibreK | 1 | 1,6 | 1,25 | 1,25 | 1 (implicite) |
| tenirLibre | 0 | 0,15 | 0,05 | 0,05 | 0 (implicite) |

**Choix (réversible)** : les réglages d'un bloc éteint naissent à la valeur de **c0101**, pas de c0072. Allumer `largeOn` sur un génome c0025
apporte donc les figures « marge large » de c0101 (hauteur 4 m), c'est-à-dire c0072 et c0101 ensemble. Le sacre c0101 n'est pas un interrupteur :
c'est le réglage `largeHaut`, que la sélection peut ramener vers 9 si c'est mieux.

## Le témoin

- `config.json` `"temoin"` : `c0025` (défaut) ou `c0101` ; `c0026`, `c0064`, `c0072`, `c0087` marchent aussi (ce sont eux qui prouvent le découpage).
- `genomeTemoin` lit les drapeaux **dans le code** du fichier (les extraits de `BLOCS`) et les recoupe avec ses clés de REGLAGES : un fichier qui
  aurait les clés sans le code, ou un bloc à moitié, est refusé.
- Les identifiants : c0025 `19e3767cc346` (inchangé depuis avant le portage), c0026 `8cf6101b653f`, c0064 `a9ea06d6f2a8`, c0072 `5f0232a5f696`,
  c0087 `6aed3c281b39`, c0101 `f70ddcb5a565` (avec la `graineReseaux` 161 de config.json).

### Changer de témoin sur une population existante : ce qui se passe

- **Sans commande** : rien. Un état garde le témoin dont il est né (`population.json temoinNom`, absent = c0025). Si config.json en demande un autre,
  le maître écrit une ligne (« la config demande c0101, la population est née de c0025 : elle le garde (pour repartir de c0101 : … --repartir-de c0101) »)
  et continue avec l'ancien. Le contrôle d'identité, l'empreinte, les pages : tout suit le témoin de la population, jamais celui de la config.
- **`--repartir-de c0101`** (maître arrêté ; le verrou est pris comme d'habitude) :
  1. le contrôle d'identité de c0101 (6 courses de 45 s) ; raté → refus, code 1, **l'état n'a pas bougé** ;
  2. tout l'état va dans `etat/archives/<date UTC>-c0025/` (population, journaux, cache des courses, pages…), sauf ce qui est propre au PC (machine.json,
     le Node du PC, verrou, sortie.log, STOP/PAUSE/ARRETE, PAS-D-ENVOI, traces.log) ; `champions/` va dans `<archive>/champions/` ; `ARCHIVE.json` dit quoi ;
  3. la marche continue comme un premier lancement : génération 0 née de c0101, l'historique repart de zéro (l'ancien est dans l'archive).
- Avec les tâches planifiées : arrêter (`arreter.cmd`), lancer à la main `node ml\evolution\evoluer.js --repartir-de c0101 --une-generation` (avec le
  Node fixe du PC), vérifier, puis relancer les tâches. Ne pas mettre `--repartir-de` dans une tâche planifiée (elle archiverait à chaque lancement).

## Les gestes sur le code de c0101

Les cinq gestes restent, éteints à la naissance, et marchent sur c0101 (chacun allumé sur le génome c0101 : se charge, décide sans erreur, aussi vite,
`portage.test.js` p5). Aucun endroit où un geste se branche n'a été réécrit par la boucle ; deux voisinages à connaître :
- **le relâché (geste 4) et `bordOn`** : `bordOn` force `m.nitro=true` au sol juste avant le bord ; le relâché compte alors cette nitro comme demandée
  au décollage (`m.tNitroSol`) et la garde `relacheT` s de vol. Les deux vont dans le même sens (partir nitro allumée) ; le cumul n'est pas mesuré.
- **la tête SOL et `libreOn`** : le seuil de la nitro est `(…)·k·kSeuil` ; `k` vient de c0087 (`nitroLibreK` hors décor), `kSeuil` de la tête SOL (1 à la
  naissance). Les deux sont gardés.

## Les preuves (refaites le 28/11, sur le Xeon partagé)

- `tests/identite.test.js` (2 courses à la fois, 21 courses de 45 s, 512 s) : **c0025 et c0101, chacun IDENTIQUE à son fichier sur 910000, 910037,
  910074** (mêmes empreintes de course, de vues, de touches) ; les deux jouent des courses différentes (910037, 910074) ; (b) et (e') inchangés.
  c0025 : `8d34b0578072, c4b906ba0a4f, 59db7c95e6f3` ; c0101 : `8d34b0578072, 700c9e35dfbb, 302b83fef550` (910000 ne vole pas en 45 s : même course).
- `tests/portage.test.js` (sans course, ~20 s) : la table ; les six témoins ; **552 décisions identiques** entre le pilote écrit et le fichier, pour
  chacun des six (les deux vues de l'inventaire et 220 suites faites pour déclencher chaque bloc) ; chaque sacre change au moins une décision du
  précédent sur ces vues ; 200 mutants v:2 du genome.js d'avant (commit 7f9543955) : même identifiant, et leur pilote décide comme celui de l'ancien
  genome.js + ancien modele.js ; drapeaux éteints, réglages aux bornes : rien ne change ; `--repartir-de` et l'archivage sur un état fabriqué.
- Tous les tests rapides de `ml/evolution/tests/` passent (commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine,
  machine-relecture, traces, relecture-traces, gestes, integration, portage).

- En plus (à la main, 2 courses à la fois) : `evoluer.js --config config-essai.json --etat essais/portage/e2e --repartir-de c0101 --une-generation
  --travailleurs 2` sur un faux état né de c0025 : contrôle d'identité de c0101 (3 × IDENTIQUE), archive, génération 0 née de c0101
  (`f70ddcb5a565`), 14 courses, code 0 ; relancé sans l'option avec `"temoin": "c0025"`, l'état garde c0101 et le dit ; le résumé, le tableau
  et l'histoire disent « c0101, le dernier champion de la boucle payante ». Et c0101 écrit par son génome = c0101-pilote.js = c0064-pilote.js sur
  910000, 910222, 910259 à 120 s (mêmes trois empreintes).

## Ce que les courses disent de c0072, c0087 et c0101 (important pour choisir le témoin)

**Dans les vraies courses, c0101 joue comme c0064.** Les blocs de c0072 et c0087 et le réglage de c0101 n'y changent presque jamais rien :
- les 20 courses de validation du labo (950000, pas 37) de c0064, c0072, c0087 et c0101 ont les **20 mêmes empreintes** (`validations.jsonl`) ;
  rejoué ici sur 950000 : c0064 et c0101 donnent `7b2c8f9e25f2`, l'empreinte du journal (le simulateur d'aujourd'hui rejoue celui du labo) ;
- 910037 et 910074 à 45 s, 910000, 910222, 910259 à 120 s : c0064 = c0101, au bit près ;
- une course tracée de c0064 (910000, 300 s demandées, 198 s jouées ; 910259, 80 s), ses 2 788 vues redonnées une à une à c0072, c0087 et c0101 :
  **zéro décision différente**. Les trois blocs ne se sont pas déclenchés une seule fois.

Donc ce que la boucle payante a gagné en validation (paliers moyens 4,80 → 6,80) vient de **c0026 et c0064** (le dessous et le décollage nitro
allumée). Ce que c0072, c0087 et c0101 ont « gagné » à l'entraînement n'est pas visible sur ces graines : peut-être du bruit des graines
d'entraînement de la boucle. Je ne l'ai pas tranché sur un grand nombre de graines. Pour la sélection, ces blocs restent des gènes réglables : la
sélection pourra les rendre utiles (par ex. `largeHaut` plus bas, `nitroLibreK` plus haut) ou les laisser dormir.

## Ce que je n'ai pas vérifié, ce qui reste

- En course, l'identité de c0101 au bit près ne prouve donc que les blocs de c0026 et c0064 : ceux de c0072, c0087 (et le réglage de c0101) ne s'y
  déclenchent pas. Ils sont prouvés **sans course** : 552 décisions identiques par témoin, dont des vues faites pour les déclencher (p3, deuxième
  test : chaque sacre y change des décisions). c0026, c0064, c0072 et c0087 écrits par leur génome n'ont été comparés que sans course.
- `tests/evoluer.test.js`, `tests/courses.test.js` et `gestes.test.js --courses` (lents) n'ont pas été relancés.
- `alarmeDistance` (0,012) n'a pas été ramenée : la distance divise maintenant par 121 gènes et non 107 (−12 %). Une population née de c0101 aura
  une autre distance de naissance : à remesurer si l'alarme sonne.
- Un enfant dont seuls des réglages d'un bloc éteint ont muté conduit comme son parent mais porte un autre identifiant et est rejoué (comme pour les
  gestes) : 9 réels de plus dans l'urne des mutations, un peu plus de ces enfants inutiles.
- `note.js` garde « l'écart classique de pilote-voltige » comme étalon de la note (c'est une mesure de la note, pas du témoin) : inchangé.
- La date du dossier d'archive est en UTC (une heure de moins que l'heure de Paris l'hiver).
- **L'observation de Fable, recontrôlée** : juste, et plus nette encore (les 20 mêmes empreintes de course, pas seulement les mêmes paliers ;
  c0025 4,80, c0026 5,70, c0064 à c0101 6,80) ; voir « Ce que les courses disent » plus haut. Ce n'est pas la validation qui a joué le mauvais
  fichier : rejoué ici, c0101 donne bien la course de c0064.
- `README.md` n'est pas touché (un autre agent y travaillait) : il faudra y dire `"temoin"` et `--repartir-de` (le § 10 d'INTERFACES.md le dit déjà).
  `lancer.cmd` / `installer-tache.cmd` ne passent jamais `--repartir-de` : c'est voulu (à la main seulement).
- Les fichiers d'essai : `ml/evolution/essais/portage/` (hors git : `essais/` est ignoré) ; on peut l'effacer.

## Relecture (28/11/2026, le relecteur)

Le but était de réfuter. Ce qui tient, ce qui était faux, ce qui reste.

**Ce qui était faux (corrigé)** — `--repartir-de` pouvait perdre le témoin demandé :
- un STOP, une PAUSE ou un Ctrl+C pendant le contrôle d'identité (6 courses, plusieurs minutes) n'empêchait pas l'archivage ; puis la boucle voyait
  l'arrêt **avant** la génération 0 : l'état restait **vide**. Un STOP posé juste après l'archivage faisait pareil. Le lancement suivant sans l'option
  (la tâche planifiée de relance, par exemple) faisait alors naître la population du témoin de `config.json`, c'est-à-dire **c0025**, sans rien dire.
- Corrigé dans `evoluer.js` (marqué « le relecteur ») : `repartir` reçoit `doitArreter` et refuse **avant** d'archiver si un arrêt est demandé pendant
  le contrôle (refus, code 1, rien ne bouge) ; et `principal` fait naître la population neuve (`preparer`, donc `population.json` avec `temoinNom`)
  **tout de suite** après l'archivage, avant tout test d'arrêt. `principal` est exporté pour le test.
- Le test : `tests/portage.test.js` **(p7)**, dans un processus à part, le contrôle d'identité remplacé par un faux qui réussit (aucune course) :
  STOP pendant le contrôle → code 1, aucune archive, la population c0025 intacte ; STOP juste après l'archivage → population c0101, génération 0,
  code 0. **Les deux cas échouent si l'on retire la correction** (vérifié en la retirant à la main, puis remise). portage.test.js : 11/11.

**Recontrôlé par un autre chemin, et qui tient** :
- **Décisions sur des vues tirées au hasard** (un script à moi, pas les vues faites à la main de p3) : 3 000 suites de 1 à 6 vues (sol et vol mêlés,
  8 maps, jauges, tenue, virages, rayons aux issues tirées, cible ou non), graine 777 : **62 352 décisions, 0 différence** entre le pilote écrit et
  le fichier, pour les six témoins ; et le c0025 écrit par le `genome.js` + `modele.js` **de HEAD** (avant le portage) = le c0025 écrit aujourd'hui,
  0 différence. Mais sur ces vues les blocs c0072 et c0087 ne se déclenchent presque jamais (1 et 4 suites sur 3 000). Une seconde passe **biaisée
  vers les vols subis à marge large** (maps sans décor, poses propres, hauteur 2 à 16 m ; 2 500 suites, graine 4242) : **53 478 décisions, 0
  différence** ; là, c0064 → c0072 change 331 suites et c0087 → c0101 286 : le bloc `largeOn` et le réglage de c0101 y sont bien exercés.
  `libreOn` (c0087) n'est exercé que par 2 à 4 suites au hasard : sa preuve reste surtout p3 (66 suites faites pour lui).
- **Course, graines neuves** : `identite.js --temoin c0101 --graines 910111,910148,910185 --tmax 45 --travailleurs 2` : **IDENTIQUE** sur les trois
  (`d784306b857f`, `9731e9860755`, `8eef09b8afd1`), 129 s.
- **Identifiant de c0025** : le `genome.js` de HEAD, relu dans git et lancé dans une copie à part, donne `19e3767cc346`, comme aujourd'hui.
- **Le découpage** : `diff` des fichiers successifs de `ml/labo/cerveaux/` relu à la main : rien d'oublié (c0026 : 2 constantes et une condition ;
  c0064 : 2 clés et une ligne ; c0072 : 6 clés, `poseNette`, la condition des figures ; c0087 : 2 clés et deux lignes ; c0101 : `largeHaut`). Les
  formes gardées par drapeau sont équivalentes à l'original (même expression flottante, `kSeuil` = 1 à la naissance). pilote-voltige.js = c0025-pilote.js.
- **L'observation de Fable**, refaite par mon script sur `ml/labo/journal/validations.jsonl` : c0064, c0072, c0087, c0101 ont la même suite de 20
  empreintes ; paliers moyens 4,80 (c0025), 5,70 (c0026), 6,80 (c0064 à c0101). Juste.
- **Tous les tests rapides** relancés : commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture, traces,
  relecture-traces, gestes, integration, portage : tous passent. Le bout en bout de l'auteur est corroboré par son dossier `essais/portage/e2e`
  (population c0101 `f70ddcb5a565`, génération 0, 14 courses jouées, une archive `…-c0025`).

**Ce qui reste (non vérifié ou non corrigé)** :
- Les « 2 788 vues » tracées de c0064 rejouées dans c0072/c0087/c0101 : les traces n'ont pas été gardées, ce chiffre n'a pas de source dans le dépôt.
  Ma passe au hasard va dans le même sens (ces blocs se déclenchent rarement) sans le prouver sur de vraies courses.
- L'empreinte `7b2c8f9e25f2` sur 950000 rejouée « ici » : non refaite (une course de 900 s) ; elle est bien celle du journal pour la 1re course de c0064.
- Un échec **pendant** `preparer` (une exception juste après l'archivage) laisserait encore un état vide ; la fenêtre est très courte (aucune course).
  Pour s'en remettre : relancer avec `--repartir-de c0101` (l'état vide n'archive rien) ou mettre `"temoin": "c0101"` dans config.json.
- `README.md` ne dit toujours ni `"temoin"` ni `--repartir-de` (un autre agent y travaillait) ; `alarmeDistance` non remesurée ; `tests/evoluer.test.js`,
  `tests/courses.test.js`, `gestes.test.js --courses` non relancés (lents) ; c0026, c0064, c0072, c0087 écrits par leur génome : comparés sans course seulement.
- `identite.test.js` (a) « les témoins jouent des courses différentes » échouerait si l'on y met deux témoins qui conduisent pareil en course (c0064 et
  c0101, par exemple) : c'est voulu pour la paire par défaut c0025/c0101, à savoir si l'on change `--temoins`.
