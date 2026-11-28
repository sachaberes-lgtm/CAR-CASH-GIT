# Note du lot « tau » (28/11/2026) : les mutations comptent-elles ? La mesure gratuite (M1 et M4 de la synthèse)

Rien n'est commité. Aucun fichier existant n'est modifié : deux fichiers neufs et cette note. Aucune course n'a été jouée. Le jeu, `ml/bot/`,
`ml/reel/`, `ml/labo/`, `modele.js`, `enfant.js`, `config.json` et le coffre de la boucle payante ne sont pas touchés. L'état du 27/11
(`CASH-CAR-evolution-essai/ml/evolution/etat`) a été lu, jamais écrit.

## Pour Sacha, en mots simples

La sélection garde les enfants qui ont eu les meilleures courses. Ça ne sert que si un enfant « bon » l'est vraiment, et pas seulement chanceux.
L'outil le vérifie sans jouer une course de plus : chaque enfant joue 12 routes à sa naissance, puis 12 autres routes à la génération suivante.
Si les mutations comptent, un enfant bon sur les premières routes est aussi bon sur les secondes.

Aujourd'hui, la réponse est : **trop tôt pour le dire (19 enfants mesurés sur 191)**. Les 19 mutants du 27/11 ne se classent pas pareil sur
leurs deux lots de routes (corrélation −0,13, la même que l'étude `effets/`), mais 19, c'est dix fois trop peu. Il faut environ 191 enfants,
soit une trentaine de générations à 6 naissances (environ 3 jours au rythme du Xeon le 27/11, 10 générations par jour ; moins sur le
Ryzen, dont le débit n'est pas encore mesuré). L'outil ne conclura pas avant, même si les chiffres ont l'air nets.

Ensuite il dira l'une de deux choses :
- « les mutations comptent : un enfant garde son rang d'une génération à l'autre » → la sélection trie de vrais écarts ; les changements C1 à C5
  de la synthèse valent la peine d'être essayés ;
- « les mutations ne semblent pas compter : la sélection trie surtout du hasard » → il faut changer quelque chose de plus profond (mutations plus
  fortes, autre témoin), les petits réglages ne serviront pas.

Il compte aussi les **courses jouées pour rien** : un enfant qui rejoue exactement la course de son parent sur la même route. Sur le 27/11 :
62 courses sur 528 (12 %), mais seulement 5 % du temps (ce sont des courses courtes) ; chez les naissances « mutation » ordinaires,
14 courses sur 36 (39 %), et 1 enfant sur 3 est une copie exacte de son parent.

## Ce qui a changé

| Fichier | Quoi |
|---|---|
| `ml/evolution/mesure-tau.js` (neuf) | Le module et la ligne de commande. Lecture seule. `mesurer()` ne lève jamais. |
| `ml/evolution/tests/mesure-tau.test.js` (neuf) | 75 contrôles (72 + 3 du relecteur), aucune course, ~10 s. Journaux fabriqués dans `essais/tau/` (ignoré par git, effacé au départ). |
| `ml/evolution/notes/tau.md` (neuf) | Cette note. |

`node ml/evolution/mesure-tau.js [--config f] [--etat dossier] [--json] [--tirages N]` : `--etat` est relatif au dossier courant, sinon à
`ml/evolution/` ; sans `--etat`, le `dossierEtat` de la config. Code 0 toujours (même dossier absent).

## La méthode, et les deux pièges trouvés en route

1. **Le niveau d'un enfant sur une moitié** = moyenne sur ses graines de (palier − b_g), b_g l'effet de graine de `note.ajuster` (le modèle
   pilote + graine de note.js, inchangé).
2. **La référence = les pilotes établis.** Les b_g sont ajustés sur les seules courses du témoin (il joue toutes les graines et n'est jamais
   renvoyé) et des pilotes dans leur 3e génération ou plus. Avec toutes les courses, même en retirant l'enfant de b_g, les niveaux des autres
   pilotes gardent 1/26 de sa chance, qui revient dans ses deux moitiés : τ² sortait trop bas d'environ 0,03 (40 mondes fabriqués à τ = 0,9 :
   0,76 contre 0,80 avec les établis, pour 0,81 vrai). Option `reference:'tous'` gardée pour mémoire. Aux générations 0 et 1, le seul établi est
   le témoin : la mesure est alors exactement la comparaison au témoin de l'étude `effets/` (d'où le même −0,13).
3. **Centrer chaque moitié sur sa génération (ce qui décide).** Piège trouvé en fabriquant des journaux à τ = 0 : le niveau des graines de
   chaque génération, tel que le modèle le fixe, dérive d'une génération à l'autre comme une marche au hasard ; les deux moitiés d'un enfant
   tombent sur deux générations voisines, donc sur presque le même cran. Sans centrage : r ≈ 0,08 à 0,26 à τ = 0 et 9 à 22 « victoires » sur
   30 mondes. Centré sur les enfants nés la même génération, avec une covariance groupée : 0 sur 30, r moyen −0,03. C'est le piège d'`effets/`
   (le bruit de la référence commune) sous une autre forme. La version sans centrage est rendue (`sansCentrage`), elle ne décide rien.
4. **Le prix du centrage** : un enfant par génération. Les 160 enfants de `synthese/taille-de-la-mesure.js` deviennent 159 degrés de liberté,
   soit **191 enfants à λ = 6** (372 à 8 graines par moitié ; 3 608 pour `config-essai.json`, 3 graines et λ = 2). λ vient de `cfg.lambda`, pas
   de la taille observée des générations (les 19 g0 feraient bouger le nombre). Le hasard d'une course vient de l'époque si elle a au moins
   200 degrés de liberté (3,26 le 27/11), sinon 3,26. *(28/11, le relecteur : il ne compte jamais sous 3,26 pour le nombre requis, voir
   « Relecture ».)*
5. **Le verdict** : « trop tôt » tant que les enfants mesurés OU les degrés de liberté sont sous le requis. Au-delà : r > tanh(1,96/√(ddl − 2))
   → « comptent », sinon « ne semblent pas compter » (le test de la synthèse : 80 % de puissance à τ = 0,5).
6. **L'intervalle** : re-échantillonnage des enfants dans chaque génération et, pour chaque génération, de ses graines (le même tirage pour tous
   les enfants qui les ont jouées), comme `loiDesEffets` d'`effets/outils.js`. Par origine et par phase : moitiés centrées sur toute leur
   génération (un immigré est seul de son origine dans la sienne), à partir de 10 enfants, indicatif.
7. **M4** : une course d'enfant de même `empreinte` qu'une course d'un de ses parents sur la même graine et la même époque ; temps = champ `ms`.

Un enfant compte s'il a au moins 2 graines mesurées dans chaque moitié, ses deux moitiés dans la même époque des courses (sinon il est compté dans
`coupesParEpoque`). Les époques closes sont lues si leurs lignes sont dans les `courses-*.jsonl`. `grainesRetirees` n'est connu que pour
l'époque en cours. Le témoin (`population.temoin` et `origine:'temoin'`) n'est jamais un enfant.

## Vérifié sur des cas dont on connaît la réponse (tests/mesure-tau.test.js)

Mondes fabriqués : μ 20, λ 6, 12 graines, hasard 3,26, effets de graine, renvoi des plus bas, niveaux des enfants N(0, τ).

| cas | ce que rend l'outil |
|---|---|
| τ = 1, 40 générations (247 enfants) | « comptent », τ 1,07 [0,78 ; 1,17], r 0,54 (attendu 0,53) |
| τ = 0, 40 générations | « ne semblent pas compter », τ 0 [0 ; 0,45] ; 0 « comptent » sur 30 mondes neufs |
| τ = 0,9, 12 mondes | τ² moyen 0,735 ± 0,042 (vrai 0,81) ; sur 40 autres mondes 0,796 ± 0,021 |
| τ = 0,5, 40 mondes (hors test) | τ² moyen 0,249 (vrai 0,25), r 0,218 (formule 0,220), reconnu 35 fois sur 40 ; à τ = 0, 2 sur 40 |
| τ = 1,5, 10 générations (67 enfants) | « trop tôt pour le dire (67 enfants mesurés sur 191) », alors que r = 0,83 est déjà net |
| clones fabriqués (40 % des courses de « mutation ») | 573 sur 573 comptés, au temps près, rangés chez « mutation » |
| dossier absent, vide, époque neuve, population.json coupé, lignes illisibles au milieu, journaux bizarres, panne simulée dans l'analyse | ne lève pas, « trop tôt » |
| `tests/etat-exemple` et les 39 états de `essais/` (écrits par le code d'avant, génomes v:1 et v:2, 3 graines) | ne lève pas, tous « trop tôt » |

## Ce qu'il rend sur les vraies données

- **27/11, `CASH-CAR-evolution-essai/ml/evolution/etat`** (générations 0 et 1, 552 courses) : « trop tôt pour le dire (19 enfants mesurés
  sur 191) » ; r = −0,13 [−0,56 ; 0,50], τ ≈ 0,00 [0,00 ; 0,94], 18 degrés de liberté ; hasard d'une course 3,26 (503 ddl). Courses pour rien :
  62 / 528 (11,7 %), 0,56 h sur 10,9 h (5,1 %) ; copie exacte : 1 enfant (`9627905cd5bb`). Les chiffres d'`effets/` (−0,13 ; 64 / 552 et
  0,58 h, en comptant aussi les copies entre deux autres pilotes ; 14 / 36 chez les « mutation ») sont retrouvés.
- **`essais/`** : tous « trop tôt » (0 à 14 enfants sur 3 608). Leurs r (de −1 à 1) ne veulent rien dire à 3 graines et 2 enfants par génération.

## Le format rendu (`--json`, ou `mesurer()`), exemple réel (27/11, abrégé)

```json
{"format":"evolution-mesure-tau-1","verdict":"trop-tot","phrase":"trop tôt pour le dire (19 enfants mesurés sur 191)",
 "enfants":{"mesures":19,"requis":191,"ddl":18,"ddlRequis":159,"parGeneration":6,"tauVise":0.5,"grainesParMoitie":[12,12],
   "sigma":3.2599,"sourceSigma":"epoque 6fa41a143ead (503 degres de liberte)","coupesParEpoque":0,"sansGeneration":0},
 "r":-0.1287,"seuilR":0.4542,"icR":[-0.5628,0.4992],"tau":0,"tau2":-0.1563,"icTau":[0,0.9443],"tirages":1000,"significatif":false,
 "sansCentrage":{"enfants":19,"r":-0.1287,"cov":-0.1563,"tau":0},
 "parOrigine":{"g0":{"enfants":19,"assez":true,"ddl":18,"r":-0.1287,"tau":0,"icTau":[0,0.4732]}},
 "parPhase":{"A":{"enfants":19,"assez":true,"ddl":18,"r":-0.1287,"tau":0,"icTau":[0,0.4976]}},
 "requisPour":{"0.3":1104,"0.5":191,"0.7":71,"1":30},
 "epoques":[{"courses":"6fa41a143ead","lignes":552,"pilotes":26,"enfants":19,"sigmaRes":3.2599,"ddl":503,"lignesReference":24}],
 "clones":{"coursesEntrainement":552,"heuresEntrainement":10.93,"tempsConnu":1,"enfantsCompares":25,"comparees":528,"identiques":62,
   "heuresIdentiques":0.559,"heuresComparees":10.42,"nulsExacts":["9627905cd5bb"],"part":0.1174,"partTempsEntrainement":0.0511,
   "parOrigine":{"g0":{"enfants":19,"comparees":456,"identiques":48,"nulsExacts":0},"mutation":{"enfants":3,"comparees":36,"identiques":14,"nulsExacts":1}}},
 "defauts":[]}
```

`verdict` ∈ `trop-tot | comptent | ne-comptent-pas`. `defauts` : ce qui a été sauté à la lecture (lignes illisibles, fichier coupé), ou
`mesure impossible : …` si l'analyse a levé (alors `verdict:'trop-tot'`, `clones:null`).

## Pour l'intégrateur : quoi appeler, quoi afficher

```js
const MT=require('./mesure-tau');
const x=MT.mesurer(C.chemin(cfg,cfg.dossierEtat), MT.optionsDe(cfg,{tirages:400}));  /* ne leve jamais ; ~1,5 s a 50 000 lignes */
MT.ligneCourte(x)   /* une ligne : « mutations : trop tôt pour le dire (19 enfants mesurés sur 191) ; r −0,13, τ ≈ 0,00 [0,00 ; 0,94] ; courses pour rien 12 % » */
MT.lignes(x)        /* le detail, une ligne par element (ce qu'imprime la ligne de commande) */
x.phrase, x.verdict /* la phrase en clair, le verdict */
```

- **`tableau.js`**, section 1 (« Est-ce que ça apprend ») ou 5 (« La chance du meneur ») : la phrase en gras (`x.phrase`), puis `MT.lignes(x)`
  en petit. Pas de courbe nécessaire ; une barre « enfants mesurés / requis » (`x.enfants.mesures` / `x.enfants.requis`) dirait l'avancée.
- **`resume.txt` / `etat.js`** : `MT.ligneCourte(x)` si une ligne est libre (etat.js tient en 10 lignes).
- **`histoire.js`**, « Où on en est » : `x.phrase` ; au moment où le verdict quitte `trop-tot` (comparer au verdict de la génération d'avant, ou
  le recalculer sur la population lue), une phrase dans le récit : c'est l'événement qui décide des essais C1 à C5.
- **`evoluer.js`** : rien à faire (la mesure se recalcule depuis les journaux). Si l'on veut une trace par génération, une clé `tau` dans la
  ligne de generations.jsonl (`{verdict, mesures, requis, r, tau, icTau, clonesPart}`) : absente = non mesurée, aucun lecteur ne la suppose.
- Passer `optionsDe(cfg, …)` : il lit `cfg.grainesParGeneration`, `cfg.lambda`, `cfg.note.passes`. `tirages` 400 suffit au tableau (1 000 en
  ligne de commande par défaut).
- Ne pas faire C5 (`grainesAnciens: 4`) : la seconde moitié d'un enfant tomberait à 4 graines et la mesure ralentirait (synthèse § 2, C5).

## Compatibilité

Le module ne fait que lire. Les champs lus existent depuis le premier code (INTERFACES § 3.3 à 3.7) : lignes `id, usage, mesuree, palier,
graine, epoque, generation, empreinte, ms` ; `population.json` `vivants[].{id, ne, origine, parents}`, `temoin`, `epoque.courses`,
`grainesRetirees` ; `morts.jsonl` `{id, ne, origine, parents}` ; `generations.jsonl` `{generation, phase, naissances[]}`. Tout manque a un défaut
(né = première génération de courses, origine `inconnue`, phase `null`). Un état du Ryzen (code e93ff5cb5, génome v:2) se relit donc sans
erreur ; prouvé sur `tests/etat-exemple` et les 39 états de `essais/`, pas sur un vrai état du Ryzen (je n'en ai pas).

## Tests

- `tests/mesure-tau.test.js` : 72 / 72 (75 / 75 après la relecture).
- Les rapides de ml/evolution/tests/ (commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture,
  traces, relecture-traces, gestes, integration, portage, node-epoque) : tous passent (code 0), le 28/11 vers 02:30, avec les retouches en
  cours des autres agents dans l'arbre (evoluer.js, tableau.js, histoire.js, note.js…).
- Les lents (evoluer, courses, identite) : non lancés, aucune course ne concerne ce lot.

## Ce qui reste, ce que je n'ai pas vérifié

- Le branchement dans le tableau, le récit, etat.js (ci-dessus).
- Un vrai état du Ryzen n'a pas été lu (pas sous la main).
- Le monde fabriqué suppose des niveaux d'enfants indépendants N(0, τ) et un bruit normal arrondi ; le vrai palier est un entier borné en bas,
  dissymétrique. Des frères (même parent) aux niveaux proches ne biaisent pas la covariance mais réduisent l'écart dans la génération ; si
  les mutations sont petites, le τ mesuré est « l'écart entre enfants d'une même génération », un peu plus petit que l'écart entre tous.
- La référence des établis suppose que le témoin joue toutes les graines d'entraînement : vrai aujourd'hui (§ 6.1-3), il faut le garder.
  Une graine sans aucun établi mesuré sort de la mesure (elle est de toute façon retirée si le témoin la rate, § 6.1-4).
- Les estimations par origine et par phase n'ont pas d'intervalle sur les graines (enfants seulement) : indicatives.
- Le temps (M4) vient du champ `ms` ; si une ligne ne l'a pas, elle compte pour 0 (`clones.tempsConnu` dit la part des lignes qui l'ont).
- Lecture d'un très gros état (100 Mo de courses) : non mesurée ; à 15 Mo, 47 000 lignes, 0,6 s sans tirages, 2,4 s à 1 000.

## Relecture (28/11/2026, un second agent chargé de réfuter)

**Refait.** `tests/mesure-tau.test.js` relancé : **1 échec sur 72** à ma première exécution (« tous les états d'essai rendent trop tôt ») ;
après correction, 75 / 75. Les 16 suites rapides passent (code 0). Sur l'état du 27/11 : mêmes chiffres au centième (r −0,13 [−0,56 ; 0,50],
τ 0,00 [0,00 ; 0,94], 62 / 528 courses pour rien, 5,1 % du temps).

**Un chemin indépendant** (`essais/relecture-tau/contre-verifier.js`, hors git) : un autre monde fabriqué, plus proche du vrai que celui du
test : niveaux **hérités** (enfant = parent + N(0, τm), croisement = moyenne des parents, immigré = champion + N(0, 1,5 τm)), choix des parents par
tournoi, bruit **dissymétrique** autour d'un palier entier borné à 0, 3 % de courses non mesurées, une génération écrite deux fois (reprise,
`essai:2`), passage de 12 à 8 graines à la génération 20. Le τ vrai y est l'écart-type des niveaux vrais **dans la génération de naissance**,
connu exactement. Et un second estimateur, sans `note.js` : la moyenne brute des paliers sur les graines que toute la génération a mesurées,
centrée dans la génération. 40 mondes par cas, 50 générations à 12 graines :

| τm | τ² vrai | outil | le mien | « comptent » |
|---|---|---|---|---|
| 0 | 0 | 0,014 ± 0,009 | 0,012 ± 0,011 | 3 / 40 ; **6 / 200** (3 %, 2,5 % attendu) |
| 0,5 | 0,651 | 0,661 ± 0,023 | 0,668 ± 0,025 | 40 / 40 |
| 0,9 | 2,188 | 2,182 ± 0,081 | 2,167 ± 0,080 | 40 / 40 |

L'estimateur est sans biais, le taux de fausses victoires est le bon. Avec le passage à 8 graines (45 générations), l'outil reste « trop tôt »
(277 enfants sur environ 390 requis : le nombre requis suit la médiane des graines par moitié, comme prévu).

**Ce qui était faux, et ce qui est corrigé** (marqué « le relecteur » dans le code).
1. **« Jamais de conclusion avant le nombre requis » ne tenait pas.** Le nombre requis suivait le hasard mesuré dans l'époque, sans plancher.
   Sur les états fabriqués par le faux pilote de `generation.test.js` (`essais/tests-generation/a6-longues` et `a6-origine`, paliers sans
   hasard), le hasard mesuré valait 0,00, le nombre requis tombait à **4**, et l'outil concluait « les mutations comptent » sur **7 enfants**.
   Corrigé : le nombre requis se compte avec max(hasard mesuré, 3,26) (`enfants.sigmaRequis`, nouveau champ) ; un hasard plus grand demande
   plus d'enfants, un plus petit n'en demande jamais moins que la synthèse. Test ajouté (monde sans hasard, 43 enfants : « trop tôt sur 191 »).
2. **Un enfant renvoyé dès sa génération de naissance passait sans bruit.** `protectionGenerations` accepte 0 (`evoluer.js`, `protectionAge`) ;
   alors les enfants faibles sur leur première moitié disparaissent avant la seconde, les restants sont choisis sur x et la covariance
   rétrécit (τ trop bas). Rien ne le disait. Corrigé : `enfants.renvoyesAvantSecondeMoitie` (nouveau champ, 0 par défaut) et une ligne dans
   `defauts`. Pas de correction du biais : avec la règle actuelle (1), ce nombre vaut 0. Test ajouté.

**Ce qui tient.**
- Le centrage dans la génération est juste et nécessaire ; la référence des pilotes établis ne fuit pas dans les moitiés de l'enfant.
- Pas de biais du vainqueur avec la règle actuelle : un enfant né en G n'est renvoyable qu'à la fin de G+1, après ses deux moitiés.
- Le seuil (z de Fisher, ddl − 2) et la formule du nombre requis redonnent la table de la synthèse (160, 60, 921 ; 311 à 8 graines).
- Robustesse : 61 états de `essais/` (dont ceux créés par les autres lots cette nuit) se lisent sans lever.

**Reste à dire (pas corrigé).**
- **Les regards répétés.** Le verdict est recalculé à chaque génération. À τ = 0, dans le monde du test (`essais/relecture-tau/regards-repetes.js`,
  120 mondes, un regard toutes les 5 générations de 30 à 100) : « comptent » au **premier** regard 2 / 120 (1,7 %), **au moins une fois** 7 / 120
  (5,8 %). Le test fait 2,5 % pour UN regard ; regardé tous les jours, il crie à tort environ deux fois plus. Conseil à l'intégrateur : dans
  `histoire.js`, retenir le **premier** verdict sorti de « trop tôt » comme la réponse ; les suivants affinent l'estimation, ils ne la
  renversent que si l'intervalle de τ le fait franchement. (Un verdict figé au premier regard serait un changement de méthode : décision à prendre.)
- Les constantes de méthode (`SIGMA_ETUDE` 3,26, `TAU_VISE` 0,5, `MIN_PAR_MOITIE` 2, `MIN_GROUPE` 10) sont dans le code, pas dans `config.json` :
  elles ne règlent pas la sélection, elles disent comment la juger ; je les laisse.
- Si la réserve de graines s'épuise (M6 de la synthèse) et qu'un pilote rejoue une graine déjà jouée, une seule course par (époque, pilote,
  graine) est gardée (la dernière) : une course de première moitié peut alors disparaître. Pas un problème avant la génération 80 environ.
- Le test « tous les états d'essai rendent trop tôt » dépend des états que les autres tests laissent dans `essais/` : un futur état fabriqué
  à plus de 191 enfants le ferait échouer sans que l'outil ait tort.
- Pas vérifié : un vrai état du Ryzen (non disponible ici), comme l'auteur.
