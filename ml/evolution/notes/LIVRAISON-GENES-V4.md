# La livraison « gènes v4 » (28/11/2026, l'intégrateur)

Pour la session principale (Fable), pour Sacha, ou pour l'assistant qui l'aidera sur le Ryzen. Le contrat : `notes/genes-v4.md` (il fait foi). Trois lots
(a : génome et pilote ; b : enfant et ordonnanceur ; c : le banc v2), trois relecteurs (« bit près », « sémantique », « banc-courses »), puis cette
intégration. Le détail : `notes/genes-v4-lot-a.md`, `notes/genes-v4-lot-b.md`, `notes/genes-v4-lot-c.md`, `INTERFACES.md` § 12, `banc/README.md`.

**Commité sur la branche `genes-v4` (deux commits : le lot `7f85efb38`, puis l'amendement de `sortieOn` du § 2 quater), pas poussé, pas fusionné dans
`bots-ecurie`.** Le jeu ne change pas (rien dans `code/` ni
`VERSION PRINCIPALE/`) ; `ml/bot/` et `ml/reel/` ne changent pas (les yeux et la main sont ceux d'avant). **Ce lot change UNE époque** : `modele.js` et
`enfant.js` (époque des courses `c8999deeb421` sur ce PC au commit du lot, **`bb3e37855092` après l'amendement**).

---

## 1. Ce que la mise à jour change, en mots simples

1. Quatre idées nouvelles derrière des interrupteurs **éteints à la naissance** : la nitro au décollage sur les maps à décor (`sortieOn`, ex-« sortie
   préparée », réécrite le 28/11 : § 2 quater), lâcher le volant pour mieux se poser
   (`rienOn`), la loi fidèle (`loiFidele` 1 juger, 2 juger et suivre), les secours en vol (`secoursOn`). Éteintes, le pilote conduit **au bit près** comme
   avant et **chaque pilote garde son nom** (c0025 `19e3767cc346`, c0101 `f70ddcb5a565`, les 26 vivants du Ryzen).
2. La seconde chance devient le réglage `chancePalierMin`, **figé à 12** (la sélection n'y touche pas ; le changer est une décision de Sacha).
3. Chaque course dit combien de fois chaque interrupteur né éteint a vraiment agi (`declenchements`), la cause de chaque mort (`causesMorts`), les maps
   traversées (`cartes`) et si la seconde chance a été prise (`chancePrise`).
4. On peut jouer une course sur une map choisie (la première map seulement ; ou toute la course avec la « carte tenue », un ajout du lot b).
5. Le banc des gènes v2 (`ml/evolution/banc/`) compare 1 à 5 idées au pilote de départ, avec un critère annoncé d'avance et un arrêt séquentiel.
6. **Une nouvelle époque** : toutes les courses sont rejouées une fois ; la migration des génomes est **à sens unique** (§ 4, geste 1 bis).

## 2. L'état exact

### Ce qui est prêt

- Le code des trois lots, relu (corrections faites en place, marquées « le relecteur ») ; cette intégration y ajoute les mots simples des 8 gènes dans
  `arbre.js` (`MOTS` : c'était le seul échec de `traces.test.js`), la comparaison du pilote de référence de `tests/courses.test.js` b (fins de ligne), `INTERFACES.md` § 12 (et les renvois en § 2.1, 2.3, 3.2, 3.3, 4.1, 5.1), `README.md`
  (la section « Les idées v4 et le banc des gènes », la mise à jour, les fichiers), cette note, et une retouche du contrat (un nom de PC retiré).
- Les états d'avant gardés pour les tests : `tests/etat-v2-ancien`, `tests/etat-e93ff5cb5` (le code du Ryzen) et **`tests/etat-v3-ddca156d8`** (neuf,
  écrit par le code de `ddca156d8`, lot a).

### Ce qui a été vérifié ici (le 28/11, de 10 h 50 à 12 h 30, la grande mesure de `bots-ecurie` finie : 1 250/1 250 à 10 h 44)

- **Les 24 suites rapides, une par une** (rien d'autre de rapide en même temps) : commun 16/16, graines 13/13, note 16/16, genome 14/14, tableau 72/72,
  lanceurs 76/76, generation 16/16 (les trois états sources), robustesse 8/8, machine 45/45, machine-relecture 19/19, **traces 87/87** (après les `MOTS`),
  relecture-traces 95/95, gestes 10/10 (g2 épinglé à `e2ea8d2c9`, ne saute plus), integration 29/29, portage 11/11, genes-muets 6/6 (140 s), node-epoque
  14/14, validation-sequentielle 25/25, mesure-tau 75/75 ; les nouveaux : **genes-v4 18/18** (70 s), **compteurs 5/5** (291 s), **carte-et-declic 33/33**,
  **banc 49/49** ; `genome.js --essai-reparer 10000` : 0 génome hors bornes. Aucun test n'a sauté (les mots « saute » des journaux sont du texte de test).
- **`tests/identite.test.js --travailleurs 2`** : **9/9** (424 s). c0025 IDENTIQUE sur 910000, 910037, 910074 (`8d34b0578072`, `c4b906ba0a4f`,
  `59db7c95e6f3`) ; c0101 IDENTIQUE (`8d34b0578072`, `700c9e35dfbb`, `302b83fef550`) : les empreintes de `notes/portage.md` ; c0101 émet des `declic`
  (bordOn, fuirVite…) et reste identique : l'enveloppe ne change rien de ce que voit piloter.js. W2 RAYON, W2 SOL et retourOn changent toujours la course.
- **`tests/evoluer.test.js --travailleurs 2`** (a, bd, c, e, f, g, t) : **TOUT PASSE**, 78 contrôles, 2 720 s ; « premier lancement : epoque c8999deeb421,
  temoin c0025 », identité vérifiée, refaite à l'époque neuve (g) ; le témoin de l'état d'essai garde `19e3767cc346`, ses vivants sont en v:4.
- **`tests/courses.test.js`** (jamais relancé depuis le portage ; joué en trois fois pour rester sous 4 courses à la fois : `i` et `a` pendant
  `evoluer.test.js`, puis `b` à `h` seuls) : **9/9**. Le nouveau `i` (lot b) : grotte 20 s, mêmes trois empreintes avec et sans `declic`
  (`e2304c441f6d 5976023aaa41 5f46d81d87a1`), `{autre:200, essai:200}` comptés, 120 s imposée `[grotte, jade]`, tenue `[grotte, grotte]`.
  **Corrigé en route** : `b` échouait alors que ses 6 courses étaient identiques à la référence (paliers, durées, empreintes) : il comparait le sha des
  OCTETS de `pilote-voltige.js` à celui de la référence, et cette copie de travail Windows a le fichier en fins de ligne Windows (`3fabdc8bfbd0`, contre
  `c3e8b81953b3` en fins de ligne Unix). Le test compare maintenant aussi le texte ramené à `\n` ; il passe. Défaut d'avant ce lot, sans rapport avec lui.
- **Un état écrit par le code exact du Ryzen, repris par ce code en vraies courses** : `tests/etat-e93ff5cb5` copié dans un dossier d'essai,
  `config-essai.json`, `--travailleurs 2 --arret-apres 2` : « nouvelle epoque : modele.js, enfant.js (29ae5fffc2b9 -> c8999deeb421) » (seuls ces deux
  fichiers), identité IDENTIQUE ×3 (`8d34b0578072`, `c4b906ba0a4f`, `59db7c95e6f3`), générations 2 et 3 jouées (20 et 18 courses, 0 du cache), les
  pilotes d'avant joués et renvoyés **sous leurs noms d'avant** (`374cae70caf0`, `2e3c72871bec`, `b7e6fc67c7b6`), coffre « époque » joué, **code 0**.
  Après : 4 vivants en v:4 (129 gènes), chaque `id` = `idDe(genome)`, `temoin` `19e3767cc346`, `dejaVus` gardé (10).
- **Le dernier état envoyé par le Ryzen** (`origin/evolution-ryzen`, commit `71e7c7c2c`, 28/11 2 h 00 ; lu par `git show`, copié dans un dossier d'essai) :
  `etat.js` rend ses 10 lignes (code 0), `tableau.js` refait ses pages (code 0, « Mutations comptent-elles ? trop tot pour le dire (0 enfant mesure sur
  191) »), **ses 26 génomes v:2 migrent en v:4 avec les mêmes identifiants** (26/26, `valider` sans défaut), témoin `19e3767cc346`.
- **Les 6 cartes imposées** (témoin v4, graine 3963000, 20 s, par `K.creer` et `ord.demander`) : `cartes[0]` = la carte demandée pour nuages, ville, jade,
  espace, grotte **et canyon** (le canyon existe dans le simulateur : rien à retirer des cartes du banc). 0 erreur, 0 panne.
- **Chaque gène allumé en vraie course** (c0025 + le gène, 120 s, 2 à la fois, 0 course non mesurée ; outil hors git
  `essais/genes-v4/integ/genes-en-course.js`) — voir le tableau du § 2 bis.
- **La vague d'essai du banc v2** (numéro 0, hors git) — voir le § 2 ter.

### 2 bis. Les compteurs obtenus en vraie course (c0025 + le gène ; « tenue » = la grotte à chaque portail)

| bras (identifiant) | graine / carte | maps | palier | survie | erreurs | pannes | YEUX CHANGES | `declenchements` |
|---|---|---|---|---|---|---|---|---|
| sortieOn (`117f2cd8619a`) | 910037 | grotte > jade | 7 | 120 | 0 | 0 | non | `{}` |
| sortieOn | 910148 | grotte | 6 | 110,9 | 0 | 0 | non | `{}` |
| sortieOn | 910037, grotte tenue | grotte > grotte | 6 | 112,8 | 0 | 0 | non | `{}` |
| sortieOn | 3963037, grotte tenue | grotte > grotte | 6 | 120 | 0 | 0 | non | `{}` |
| rienOn (`bb508a14856f`) | 910037 | grotte > jade | 7 | 120 | 0 | 0 | non | `{}` |
| rienOn | 910148 | grotte | 5 | 84,1 | 0 | 0 | non | `{rienOn:2}` |
| rienOn | 910037, grotte tenue | grotte > grotte | 6 | 112,8 | 0 | 0 | non | `{}` |
| rienOn | 3963037, grotte tenue | grotte > grotte | 6 | 120 | 0 | 0 | non | `{}` |
| loiFidele 1 (`c6600e09f01a`) | 910037 | grotte > jade | 6 | 120 | 0 | 0 | non | `{loiFidele.desaccord:7}` |
| loiFidele 1 | 910148 | grotte | 6 | 115,8 | 0 | 0 | non | `{loiFidele.desaccord:19}` |
| loiFidele 2 (`a49312c41d64`) | 910037 | grotte > jade | 4 | 108,4 | 0 | 0 | non | `{loiFidele.desaccord:3, loiFidele.suit:46}` |
| loiFidele 2 | 910148 | grotte > jade | 7 | 120 | 0 | 0 | non | `{loiFidele.desaccord:26, loiFidele.suit:44}` |
| secoursOn (`915d66a37c87`) | 910037 | grotte > jade | 7 | 120 | 0 | 0 | non | `{}` |
| secoursOn | 910148 | grotte | 6 | 110,9 | 0 | 0 | non | `{}` |
| les cinq ensemble (`18fc4a3c0717`) | 910037 | grotte > jade | 7 | 120 | 0 | 0 | non | `{loiFidele.desaccord:4, loiFidele.suit:39, secoursOn:2}` |
| les cinq ensemble | 910148 | grotte | 6 | 120 | 0 | 0 | non | `{loiFidele.desaccord:7, loiFidele.suit:58, rienOn:2, secoursOn:1}` |
| les cinq ensemble | 910037, grotte tenue | grotte | 4 | 81,9 | 0 | 0 | non | `{loiFidele.desaccord:2, loiFidele.suit:9, secoursOn:1}` |
| les cinq ensemble | 3963037, grotte tenue | grotte > grotte | 6 | 106,8 | 0 | 0 | non | `{loiFidele.desaccord:31, loiFidele.suit:40, secoursOn:1}` |

« Les cinq ensemble » = `sortieOn` 1, `rienOn` 1, `loiFidele` 2, `secoursOn` 1. 18 courses, 0 erreur du cerveau, 0 panne, 0 YEUX CHANGES, toutes mesurées.
`sortieOn` 1 et `secoursOn` 1 seuls : identiques au témoin sur ces graines (mêmes paliers, mêmes causes ; `sortieOn` et `secoursOn` à 0 déclenchement).

**Ce qu'il faut en retenir** (aucune conclusion sur l'effet des gènes : ce sont des contrôles de fonctionnement) :
- **`sortieOn` ne s'est déclenché dans AUCUNE course** : 6 ici (dont 2 à la grotte tenue), 5 chez le relecteur « sémantique » (grotte, jade, canyon), 2 chez le
  relecteur « bit près ». Le relecteur « sémantique » en a trouvé la raison : sur 117 vues au bord d'une map à décor, la combinaison exigée par la règle
  (« rien » au choc, « vers la route » au choc, « plane » qui se pose) n'est **jamais** apparue : quand « vers la route » meurt, « plane » meurt aussi. Le
  code suit le contrat (§ 3.1) ; c'est la règle qui est presque muette. **Le point 3 du § 8.5 (« le compteur du gène > 0 sur au moins une ») échoue pour
  `sortieOn`.** Un bras « sortie » du banc finira « rare » (0 % de courses changées dans la vague d'essai). Décision de Fable (§ 5, n° 1).
- `rienOn` est rare (2 déclenchements sur 4 courses seul, 2 dans « les cinq ») : attendu, `rienEcart` 0,2 n'est presque jamais atteint (le relecteur : 2 vues
  sur 58 où « rien » se pose propre).
- `secoursOn` seul ne s'est pas déclenché sur ces 4 courses, mais 1 à 2 fois dans chacune des 4 courses « les cinq » (et 3 fois chez le relecteur).
- `loiFidele.suit` part presque à chaque vue en « vers la route » (39 à 58 par course) : les yeux arrondissent leur commande à 0,01, pas la loi du pilote.
  C'est la définition du contrat ; le compteur dit peu (le vrai effet se lira par la part de courses changées).

### 2 ter. La vague d'essai du banc v2 (numéro 0, `banc/vagues/v000-essai/`, hors git ; RIEN n'en est conclu sur les gènes)

- La vague : témoin c0025 et 3 bras (`sortie` = `sortieOn` 1, `rien` = `rienOn` 1, `fidele-juge` = `loiFidele` 1), carte grotte, tmax 60 s, plan 2 / 2 / 6
  (3 regards), futilité et `fMin` à 0 pour que l'essai aille au plafond ; graines 3963000 à 3963185. `--verifier` d'abord : code 0, `plan.json` écrit,
  constante 2,428 (k = 3).
- Premier lancement (`--travailleurs 2`, à côté de `evoluer.test.js` qui jouait 2 courses) : regards 1 et 2 écrits, puis **STOP posé au milieu du 3e paquet**
  (après 18 lignes) : les courses en cours finissent (20 lignes), « interrompue : rien n'est ecrit pour le regard en cours (2 regard(s) gardes) », **code 3**,
  STOP effacé, `resume.txt` « EN COURS : point 2 sur 3 fait » sans aucun chiffre.
- Relance de la même commande : **4 courses jouées** (les 4 qui manquaient), le 3e regard, **code 0**. Au total **24 lignes pour 24 clés : aucune course
  jouée deux fois** ; 0 non mesurée, 0 erreur, 0 panne ; `cartes[0]` = grotte partout (4 courses passent ensuite à la jade).
- Les six fichiers écrits : `plan.json`, `regards.json`, `resultat.json` (verdicts « plafond », `dPremier`, `biaiseParLArret`, `candidat`,
  `secondaires.nonCorrigees`), `resume.txt` (lisible ; lignes de 118 caractères au plus), `journal.md`, et pas d'`INDEX.md` (le numéro 0 n'y est jamais inscrit).
- Courses changées par rapport au témoin : `sortie` 0 sur 6, `rien` 1 sur 6, `fidele-juge` 5 sur 6 ; compteurs : `rienOn` 1, `loiFidele.desaccord` 35.
- **Le débit mesuré** : 24 courses de 60 s au plus en 15 min d'horloge (11 h 12 à 11 h 27, reprise comprise), à 2 à la fois, soit **environ 96 courses à
  l'heure** à tmax 60 (ce PC partagé avec `evoluer.test.js`, 2 courses de plus). Le temps de course cumulé : 0,2 h (30 s par course en moyenne, la grotte
  tue vite). Une vraie vague (tmax 900, courses de 2 à 4 min) ira bien plus lentement : compter environ `(1 + k) × graines × (durée moyenne + 30 s) / 2` ;
  par exemple 5 bras au plafond (1 152 courses de 150 s en moyenne) ≈ 29 h à 2 à la fois. À mesurer sur la première vraie vague.

### 2 quater. L'amendement du 28/11 : `sortieOn` réécrit après la mesure des décollages (le second commit de la branche)

**L'impasse.** L'étude `ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md` (40 courses à carte tenue, 180 décollages subis distincts, 24 morts ; relue)
montre que la règle du contrat ne se déclenche jamais (0 fois), que les yeux ne voient **aucune** issue aux 24 décollages mortels, que le bord n'est
annoncé que 0,28 s avant le décollage (la main met 0,2 s) et que « plane » au bord se serait crashé dans 57 vols posés. Partir en « plane » est une
impasse, voire nuisible. Mais aucun décollage sur 253 ne part nitro allumée sur ces maps (les joueurs : 63 %), et `bordOn`, la même chose sans décor,
rapproche sûrement des joueurs (banc des gènes, `bots-ecurie`).

**Ce qui change** (contrat § 3.1 bis, qui remplace le § 3.1) : `sortieOn` = **la nitro au décollage sur les maps à décor**, le pendant de `bordOn` :
au sol, la même garde, **sans lire les rayons du bord** ; au décollage, **plus de changement de façon** (le vol part en « vers la route »). Mêmes noms,
bornes, naissances : **aucun identifiant ne change** (c0025 `19e3767cc346`, c0101 `f70ddcb5a565`, le bras `sortieOn` `117f2cd8619a`). Les compteurs gardent
leurs noms : `sortieOn` = la nitro allumée au sol par la règle (à chaque vue où elle agit), `sortieOn.vol` = un vol subi décollé moins de 0,35 s après
l'annonce, `sortieOn.pose` = la première vue au sol ensuite ; `loiFidele.suit` ne compte plus qu'au-delà de 0,01 de volant (ou un manche autre).
`rienOn` et `rienEcart` ne changent pas. Fichiers : `modele.js`, `genome.js` (un commentaire), `arbre.js` (MOTS), `banc/bras.json` (les « dit »),
`tests/genes-v4.test.js`, `tests/vues-genes-v4.js`, `tests/compteurs.test.js` (c7), `tests/genes-muets.test.js` (un commentaire), `INTERFACES.md` § 12,
`README.md`, `notes/genes-v4.md`, `notes/genes-v4-lot-a.md`, l'étude (partie 9). `modele.js` change encore : à faire **avant la fusion** (le Ryzen ne
verra toujours qu'un seul changement d'époque).

**Vérifié** (une suite à la fois) : genes-v4 **19/19**, compteurs **6/6** (dont le nouveau c7), genes-muets 6/6 (`sortieT` et `sortieJauge` lus gène
allumé, muets éteint), portage 11/11, gestes 10/10, genome 14/14, traces 87/87, carte-et-declic 33/33, banc 49/49, `genome.js --essai-reparer 10000` :
0 hors bornes. **Éteint = `7f85efb38`** (`essais/sortie-reecrite/preuve-eteint.js`, hors git : le pilote écrit par ce code et par le `modele.js` de
`7f85efb38`, relu par `git show`) : 104 pilotes à `sortieOn` 0 (c0025, c0101, « tout allumé sauf sortieOn », c0101 + tout, 100 mutants), 326 suites,
**85 176 décisions identiques** (ordres sans `declic`, erreurs). Le **texte** du pilote c0025 change (`87695d9b9cc7` → `74b588baf052`) : l'époque des
courses change de toute façon avec ce lot (sur ce PC : `c8999deeb421` → `bb3e37855092`). Pas relancés après l'amendement par l'auteur : identite.test, evoluer.test, courses.test (lents) ; les deux premiers l'ont été à
l'intégration (ci-dessous).

**Quatre vraies courses** (c0025 + `sortieOn`, 120 s, carte tenue, `enfant.js --essai`, graines 3 963 000 + 37 i, i = 300 à 303 ; 2 à la fois ;
le témoin rejoué sur les mêmes graines pour comparer ; 0 erreur, 0 panne, 0 YEUX CHANGES, aucune seconde chance) :

| map (graine) | `sortieOn` | `.vol` | `.pose` | palier / survie (le gène) | palier / survie (témoin) | nitro au décollage (gène / témoin) |
|---|---|---|---|---|---|---|
| grotte (3974100) | 5 | 1 | 0 | 4 / 94,6 s, roche | 4 / 94,7 s, roche | – / – (1 vol) |
| ville (3974137) | 20 | 5 | 5 | 7 / 120 s | 8 / 120 s | 0,45 / 0,27 |
| jade (3974174) | 14 | 3 | 3 | 7 / 120 s | 4 / 55,4 s, air | 0,57 / – |
| canyon (3974211) | 14 | 5 | 5 | 6 / 120 s | 3 / 32 s, paroi | 0,50 / – |

Le gène agit dans les quatre (53 vues au sol, 14 vols partis nitro allumée, 13 posés ; le seul qui finit mal est le vol de la grotte, mort contre la
roche, comme chez le témoin). **Ce sont des contrôles de fonctionnement, pas une mesure** : quatre graines ne disent rien du palier (le banc le dira).
Traces : `ml/evolution/essais/sortie-reecrite/` (journaux des tests, `preuve-eteint.js`, les huit courses).

**La relecture adverse et l'intégration de l'amendement** (un second agent, par d'autres chemins ; traces hors git dans
`ml/evolution/essais/sortie-reecrite/relecteur/`) :

- **Le code relu ligne à ligne** (`git diff`) : la règle au sol est celle de la décision, caractère pour caractère ; plus aucune lecture de
  `v.sorties` par `sortieOn` ; plus de `m.facon='plane'` ni de `m.choix=true` ; au décollage, le compteur seul puis `m.planeBord=null`. `m.planeBord` n'est
  lu que par ce compteur, remis à `null` à chaque vue au sol où la règle est fausse et à chaque décollage ; la seule vue au sol qui l'ignore est le départ
  de course (le `return` anticipé de `auSol`), sans effet : le compteur exige moins de 0,35 s. Éteint, rien n'est lu ni écrit (tout est sous
  `R.sortieOn>0`, ou sous `COMPTE` pour `m.cSortie`).
- **Éteint = `7f85efb38`, sur des vues de vraies courses** (`relecteur/preuve-vues.js`, `preuve-vues.txt`) : les **4 050 vues** gardées par le relecteur
  « bit près » (`essais/relecture-v4-bit/vues/`, quatre courses : c0025, c0025 tout allumé, c0101, c0101 tout allumé en grotte), jouées dans l'ordre
  par **126 pilotes à `sortieOn` 0** (c0025, c0101, « tout allumé sauf sortieOn » sur chacun, c0101 + `loiFidele` 2, c0025 + `loiFidele` 2 + `rienOn` +
  `secoursOn`, et **120 mutants v:4** tirés par le `muter` d'aujourd'hui, un sur deux à peu près avec `loiFidele` 2), chacun écrit avec le `modele.js`
  de `7f85efb38` (relu par `git show`) et avec celui d'aujourd'hui : **510 300 décisions, 0 écart** d'ordre (texte JSON du bac, NaN et −0 compris) ni
  d'erreur (18 850 erreurs, les mêmes : « YEUX CHANGES » des pilotes qui ne demandent pas les rayons `retour` de ces vues). Le champ `declic` diffère
  **126 fois**, toujours par le seul retrait de `loiFidele.suit` (2 528 → 2 402), et une troisième copie du modèle, instrumentée, montre que **ces
  126 fois sont exactement les vues où les deux volants diffèrent d'au plus 0,01 avec le même manche** (aucune autre vue de ce genre, aucun autre écart).
  Les identifiants : c0025 `19e3767cc346`, c0101 `f70ddcb5a565`, le bras `sortieOn` `117f2cd8619a` (inchangés).
- **Allumé : quatre vraies courses de plus** (c0025 + `sortieOn`, 120 s, carte tenue, graines 3 963 000 + 37 i, **i = 310 à 313**, une course à la fois ;
  le témoin sur les mêmes graines) : 0 erreur, 0 panne, aucun « YEUX CHANGES », aucune seconde chance, dans les huit.

| map (graine) | `sortieOn` | `.vol` | `.pose` | palier / survie (le gène) | palier / survie (témoin) | nitro au décollage (gène / témoin) |
|---|---|---|---|---|---|---|
| grotte (3974470) | 13 | 2 | 2 | 4 / 66,5 s, roche | 7 / 120 s | 0,50 / 0,00 |
| ville (3974507) | 0 | 0 | 0 | 3 / 27,3 s, tour | 3 / 27,3 s, tour (la même course) | – / – (moins de 60 s) |
| jade (3974544) | 31 | 6 | 6 | 6 / 120 s | 7 / 113,5 s, pic | 0,625 / 0,17 |
| canyon (3974581) | 9 | 1 | 0 | 6 / 57,1 s, paroi | 3 / 43,7 s, paroi | – / – (moins de 60 s) |

  La part de vols partis nitro allumée (la mesure `nitroDecol`, écrite seulement pour une course d'au moins 60 s) monte là où elle est mesurée
  (grotte 0 → 0,50, jade 0,17 → 0,625 ; avec les courses de l'auteur : ville 0,27 → 0,45). Sur ces quatre graines, le gène fait mieux sur une course, moins bien sur deux :
  **huit courses ne disent rien du palier**. Sur les 8 courses, `sortieOn.vol` 23 et `sortieOn.pose` 21 : les
  2 vols partis nitro allumée qui finissent mal (grotte 3974100 de l'auteur, canyon 3974581 ici) précèdent chacun la seule mort de la course, contre le
  décor (roche, paroi) : la question de « la nitro qui tue plus vite » reste entière, pour le banc.
- **Les tests, un par un** : genes-v4 19/19, compteurs 6/6, genes-muets 6/6, portage 11/11, gestes 10/10, genome 14/14, generation 16/16, traces 87/87,
  relecture-traces 95/95, carte-et-declic 33/33, integration 29/29, commun 16/16, graines 13/13, note 16/16, tableau 72/72, lanceurs 76/76,
  robustesse 8/8, machine 45/45, machine-relecture 19/19, node-epoque (passe), validation-sequentielle 25/25, mesure-tau 75/75, banc 49/49 ;
  `genome.js --essai-reparer 10000` : 0 hors bornes ; **identite.test `--travailleurs 2` : 9/9** (c0025 et c0101 IDENTIQUES sur les 3 graines,
  326 s) ; **evoluer.test `--travailleurs 2` : 78 contrôles, TOUT PASSE (2 262 s)**. Pas relancé : courses.test. L'époque des courses sur ce PC est maintenant `bb3e37855092` (`courses.epoque`).
- **Corrigé par le relecteur** : le § 1 du contrat disait encore « la sortie préparée » (marqué remplacé) ; l'étude dit maintenant pourquoi la décision
  n'est pas la proposition de son relecteur (§ 8.5 : la règle R5, 115 décollages distincts, 17 des 24 mortels) ; cette livraison (l'en-tête, l'époque,
  « ce qui n'est pas vérifié »).

### Ce qui n'est pas vérifié

- **Rien de ce code n'a tourné sur le Ryzen.** Le rejeu d'une génération est prouvé sur l'état d'essai d'e93ff5cb5 (3 graines), pas sur le vrai état (ses
  courses ne sont pas dans la branche).
- L'**effet** des gènes v4 : aucune vague réelle n'a été jouée (numéro 1 ou plus) ; c'est à la session principale de la décider.
- `sortieOn` : l'ancienne règle ne s'est jamais déclenchée en vraie course (§ 2 bis) ; la règle réécrite (§ 2 quater) agit dans 7 des 8 courses
  d'essai (la huitième, ville, meurt contre une tour à 27 s après un seul vol, la règle n'ayant pas agi : course identique au témoin), mais **son effet** (palier, morts contre le décor) n'est pas mesuré : seul le banc le dira.
- Les compteurs nés à 0 des **anciens** drapeaux (§ 8.5 point 3 du contrat : « chaque ancien drapeau né à 0 ») n'ont pas été rejoués un par un ici ; ils
  sont prouvés sans course (compteurs 5/5 : chacun des 25 noms se déclenche sur des suites de vues) et c0101 en émet en course (lot a2 : lacheOn 10,
  slalomOn 274, suitOn 48… sur une course de 90 s).
- La « carte tenue » n'est pas encore utilisée par le banc (une vague n'a pas de champ pour elle).
- Le banc d'étude (`ml/ecurie/etude/banc-des-genes/`, `bots-ecurie`) : son `analyser.js` compte « identique » sur la seule `empreinte` ; le v2 exige aussi
  `empreinteTouches` (plus strict, voulu). Rien d'autre n'est repris de lui.

## 3. Ce que la mise à jour fera sur le Ryzen

Le Ryzen tourne avec **e93ff5cb5** (génome v:2). En fusionnant, il recevra **d'un coup** trois mises à jour : le portage (`7b1df608e`, génome v:3,
`notes/LIVRAISON-C0101.md`), le réglage de la sélection (`3b1bf15e5`, `notes/LIVRAISON-REGLAGE.md`) et ce lot. Au premier lancement :

1. **Une seule nouvelle époque** de son point de vue : `modele.js` (portage et v4) et `enfant.js` (v4) ont changé depuis e93ff5cb5 (sur l'essai ici :
   « nouvelle epoque : modele.js, enfant.js »). Les notes repartent de zéro, **toutes les courses sont rejouées** ; les pilotes restent, **leurs noms aussi**
   (26/26 vérifiés sur son dernier état envoyé) ; le contrôle d'identité est refait (3 courses du témoin) ; le coffre « époque » est joué ; si le champion
   n'est pas le témoin, il se revalide (séquentiel, `LIVRAISON-REGLAGE.md`).
2. **Les génomes deviennent v:4, en place** : `evoluer.js` valide (et migre) chaque vivant, puis réécrit `population.json`, `morts.jsonl` et les champions en
   v:4. **Le code d'avant ne relit plus un génome v:4** (« version 4 (attendu 2 … »). C'est pourquoi le geste 1 bis.
3. Aucun gène v4 n'est allumé chez lui : la sélection les allumera à 3 % par drapeau et par enfant ; `chancePalierMin` ne bouge jamais.
4. Les lignes de courses grossissent d'environ 12 % (`declenchements`, `cartes`, `causesMorts`, `chancePrise`, `carte`) : la mesure de τ des pages passera un
   peu plus tôt à « pas mesuré ici » (au-delà de 100 Mo de journaux) ; `mesure-tau.js` en ligne de commande n'a pas cette limite.
5. Tout ce que disent `LIVRAISON-REGLAGE.md` § 3 (graines, validation séquentielle, renvois par l'âge, pages) arrive en même temps.
6. La bascule d'époque coupe les enfants de la génération en cours (environ λ enfants « coupés » pour la mesure de τ) ; le verdict n'est pas remis à zéro.

## 4. Sur le Ryzen : les gestes de la mise à jour, dans l'ordre

Les gestes de `LIVRAISON-REGLAGE.md` § 4 (eux-mêmes ceux de `LIVRAISON-C0101.md` § 3) ; **ce qui change est en gras**. Avant tout : ce travail doit être
fusionné dans `bots-ecurie` et poussé par la session principale, avec l'accord de Sacha — et **après** le point d'avance de `LIVRAISON-REGLAGE.md` § 5 (le
Ryzen n'avait plus rien envoyé depuis 2 h 00 : lire d'abord `node ml\evolution\etat.js` et les 30 dernières lignes de `sortie.log` et `traces.log`).

1. **Arrêter** : double-clic sur `arreter.cmd` dans `CASH-CAR-evolution\ml\evolution` ; attendre « C'est arrêté ».
1 bis. **NOUVEAU : copier l'état à part, avant toute autre chose.** Dans l'Explorateur, ouvrir `CASH-CAR-evolution\ml\evolution`, copier le dossier `etat`
   et le dossier `champions`, et les coller **hors du dépôt**, par exemple dans un dossier `C:\sauvegarde-evolution-28-11\`. Vérifier que la copie a la même
   taille (clic droit, Propriétés). C'est le seul moyen de revenir en arrière : la mise à jour réécrit les pilotes dans une forme que l'ancien code ne lit plus.
   Revenir en arrière = arrêter, remettre l'ancien code (`git merge --abort` n'y suffit plus après le geste 2 : demander à Claude), recoller ces deux dossiers.
2. **Fusionner** : `git fetch origin` puis `git merge --no-edit origin/bots-ecurie` dans `CASH-CAR-evolution` ; `CONFLICT` → `git merge --abort` et demander
   à Claude.
3. **Le Node fixe** (une fois) : `ml\evolution\etat\node.txt` (inchangé, LIVRAISON-C0101 § 3, geste 3).
4. **Relancer** : double-clic sur `lancer.cmd` (le témoin reste c0025).
5. Les tâches déjà posées : rien à faire.
6. **Vérifier** : `node ml\evolution\etat.js` → EN MARCHE, témoin `(c0025)` ; la fin de `ml\evolution\etat\sortie.log` dit `node v24.22.3`, puis
   **« nouvelle epoque : modele.js, enfant.js … »** (sur le Ryzen la liste peut aussi nommer d'autres fichiers si leurs fins de ligne ont été réécrites ; c'est
   sans effet), « identite : … IDENTIQUE » (trois fois) et « identite verifiee ». `regle6` dans `population.json` : comme LIVRAISON-REGLAGE (2 : rien à faire).
   **En plus : ouvrir `ml\evolution\etat\population.json` avec le Bloc-notes et chercher `"v":4`** (il doit y être : les pilotes sont migrés) ; et, après la
   première génération, ouvrir le dernier `ml\evolution\etat\courses-*.jsonl` et chercher `"declenchements"` (chaque ligne neuve le porte, le plus souvent `{}`).
7. **Mettre à l'abri** : `sauver-traces.cmd` une fois.
8. **NOUVEAU : ne pas lancer le banc des gènes sur le Ryzen** pendant que la sélection y tourne.

**Ce qui ne doit pas surprendre** : quelques heures de courses rejouées ; les pilotes portent les mêmes noms ; `chancePalierMin:12` et 7 clés v4 à 0 dans le
texte de chaque pilote ; les pages ne montrent rien de neuf tant qu'aucun gène v4 n'est allumé ; dans l'arbre, les fiches nomment les 8 gènes en mots simples.

## 5. Les décisions qui restent

**À la session principale (Fable)** :
1. **Tranché le 28/11 (§ 2 quater) : réécrit avant la fusion.** Le texte d'avant : **`sortieOn` est presque muet** (0 déclenchement en 13 vraies courses, dont la grotte tenue). Le garder tel quel (il ne fait rien, ne coûte rien, mais ne
   sera jamais sélectionné), ou **réécrire sa règle avant la fusion** (par exemple : « plane » se pose et « vers la route » ne se pose pas proprement, sans
   exiger le choc de « rien » ; proposition du relecteur « sémantique »). Réécrire = toucher `modele.js` = une autre époque, donc **à faire avant que le
   Ryzen reçoive ce lot**, puis refaire identite, genes-v4, compteurs, genes-muets et ces courses.
2. Les choix de l'architecte acceptés tels quels par Fable (liste de la tâche) : rien à refaire ; mais deux sont à surveiller au premier banc : `rienEcart` né
   à 0,2 (très rare) et `loiFidele.suit` qui compte presque chaque vue.
3. La première **vraie vague** du banc (numéro 1) : quels bras, quel critère, quelle carte, et quand (pas sur le Ryzen pendant la sélection ; ce PC : environ
   une journée pour 5 bras au plafond à tmax 900). La famille « décor » (`roche`, `paroi`, `pic`, `glace`) est à relire contre `code/gameplay/mort.js`
   avant de la figer (contrat § 10.15) ; les causes vues ici à la grotte : `roche`, `air`, `vide`.
4. Faut-il que le banc sache utiliser la **carte tenue** (un champ `carteTenue` dans `vague.json`) : f monterait vers 1 pour un gène de la grotte.
5. La fusion de `genes-v4` dans `bots-ecurie`, puis le push : elle **coupe l'époque du banc d'étude** (`ml/ecurie/etude/banc-des-genes/`, fini à 10 h 44 :
   rien n'y est perdu, son cache ne servirait plus).

**À Sacha** :
1. **La seconde chance** (`chancePalierMin`, figée à 12) : la garder à 12, ou la changer. La changer renomme tous les pilotes (témoin compris) et demande un
   outil qui n'existe pas encore (contrat § 10.11) ; la sélection n'y touchera jamais seule.
2. Les deux garde-fous du sacre (`validation.seuilB` / `seuilC` à 1 ou 2) : toujours en attente (`LIVRAISON-REGLAGE.md`).
3. L'accord pour fusionner et pousser sur `bots-ecurie`, puis faire les gestes du § 4 sur le Ryzen (le geste 1 bis d'abord).

## 6. Où sont les traces de cette intégration (hors git)

`ml/evolution/essais/genes-v4/integ/` : `rapides/` (les 24 journaux), `identite.log`, `evoluer.log`, `courses-a.log`, `courses-b.log`, `courses-i.log`, `courses-reste.log`, `compat-e93/` (l'état e93ff5cb5 repris),
`ryzen/` (le dernier état du Ryzen relu), `genes-en-course.js` et ses deux `.json` (les courses du § 2 bis), `etat-genes/` (leurs lignes), `vague0-*.log`.
La vague d'essai : `ml/evolution/banc/vagues/v000-essai/` et `ml/evolution/banc/etat/` (hors git, `.gitignore` du banc).
Un dossier parasite créé par un relecteur hors du dépôt, `C:\c\Users\…\relecture-v4-banc\etat-avant\` (quatre pages d'essai, rien d'autre), reste à effacer à
la main : je ne l'ai pas effacé (suppression hors du dépôt).
