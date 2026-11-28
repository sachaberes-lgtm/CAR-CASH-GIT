# La livraison « c0101 » : témoin au choix, Node fixe, tâches sans limite (28/11/2026, l'intégrateur)

Pour Fable (la décision du témoin), pour Sacha, ou pour l'assistant qui l'aidera sur le Ryzen.
Trois lots relus, puis intégrés ici : le **portage** (le génome sait écrire c0101), les **lanceurs** (un Node fixe par PC, des tâches sans limite de 72 h)
et la **mesure** (c0064 / c0101 contre c0025 sur des graines jamais vues).

**Rien n'est commité ni poussé.** La valeur par défaut du témoin dans `config.json` reste **`"temoin": "c0025"`** : c'est Fable qui décide.

---

## 1. Le verdict de la mesure : rien ne montre encore que c0064 ou c0101 fassent mieux que c0025

La question : les derniers champions de la boucle payante (c0064, c0101) conduisent-ils mieux que le témoin actuel (c0025, pilote-voltige) sur des
courses qui n'ont servi à choisir personne ?

**Sur la validation de la boucle** (20 graines 950000, pas 37 ; `ml/labo/journal/validations.jsonl`). Ces 20 graines ont servi à sacrer **chacun** de ces
champions : la mesure est **optimiste** (malédiction du gagnant).

| Paire | Δ palier moyen | IC 95 % | mieux / pareil / moins | test du signe |
|---|---|---|---|---|
| c0064 − c0025 (= c0101 − c0025) | **+2,00** | [+0,75 ; +3,40] | 10 / 8 / 2 | p = 0,039 |
| c0026 − c0025 | +0,90 | [−0,10 ; +2,10] | 5 / 13 / 2 | p = 0,45 |
| c0064 − c0026 | +1,10 | [−0,30 ; +2,45] | 8 / 8 / 4 | p = 0,39 |

Survie c0064 − c0025 : +38 s [+14 ; +66]. Paliers moyens : c0025 4,80, c0026 5,70, c0064 = c0072 = c0087 = c0101 6,80.
Chiffres refaits par le relecteur de la mesure avec son propre script : mêmes valeurs.

**L'observation de Fable est juste, et plus forte qu'annoncé** : c0064, c0072, c0087 et c0101 jouent les **mêmes 20 courses** de validation (les 20
empreintes de course sont identiques, pas seulement les paliers). Recontrôlé trois fois (lots mesure, lignée, portage) et par le relecteur du portage.
Le gain vu en validation est donc tout entier entre c0025 et c0064 (c0026 puis c0064).

**Sur le coffre** (graines 990000, pas 37, jamais vues par la boucle : vérifié dans `cerveaux.jsonl` et `validations.jsonl`). **La mesure n'est pas finie :
10 graines sur 40** pour c0025, c0064 et c0101 (4 par l'agent de la mesure, 6 de plus par son relecteur), 4 sur 40 pour c0026.

| graine | 990000 | 990037 | 990074 | 990111 | 990148 | 990185 | 990222 | 990259 | 990296 | 990333 | moyenne |
|---|---|---|---|---|---|---|---|---|---|---|---|
| c0025 | 6 | 3 | 6 | 5 | 11 | 2 | 12 | 9 | 3 | 5 | 6,2 |
| c0064 | 7 | 3 | 6 | 4 | 13 | 2 | 3 | 5 | 3 | 4 | 5,0 |
| c0101 | 7 | 3 | 6 | 4 | 12 | 2 | 3 | 5 | 3 | 8 | 5,3 |

| Paire (coffre, 10 graines) | Δ palier moyen | IC 95 % | mieux / pareil / moins |
|---|---|---|---|
| c0064 − c0025 | **−1,20** | [−3,20 ; +0,40] | 2 / 4 / 4 |
| c0101 − c0025 | **−0,90** | [−3,10 ; +0,80] | 3 / 4 / 3 |
| c0101 − c0064 | +0,30 | [−0,30 ; +1,20] | 1 / 8 / 1 (8 courses identiques sur 10) |

Survie c0064 − c0025 sur le coffre : −15 s [−62 ; +23].

**Ce que cela veut dire.**
- Les +2 paliers de la validation **ne se retrouvent pas** sur les 10 premières graines jamais vues : c'est plutôt un peu moins bien (deux grosses pertes,
  990222 : 12 contre 3, et 990259 : 9 contre 5). C'est ce qu'annonce la malédiction du gagnant : sur ces 20 graines, on a gardé le meilleur de dizaines de
  candidats.
- **10 graines ne tranchent pas** : l'intervalle va d'environ −3 à +0,5 palier (une largeur d'environ 3,5 paliers). Un vrai gain d'un palier n'est pas exclu,
  un vrai gain de deux paliers l'est presque.
- **c0101 n'est pas une copie de c0064 hors de la validation** : 2 courses différentes sur 10 (990148 : 12 contre 13 ; 990333 : 8 contre 4). Le portage le
  confirme sans course : les blocs de c0072 et c0087 et le réglage de c0101 sont rares, pas inertes.
- Le verdict provisoire de l'agent de la mesure (« le témoin devrait être c0064 ») a été **réfuté par son relecteur** : il reposait sur la validation seule.
- E et F (l'écart aux joueurs et la note de la sélection) **ne sont pas mesurés** sur le coffre : il faut au moins 5 parties de plus de 60 s par pilote.

**Le verdict, avec les données d'aujourd'hui** : garder **c0025** comme témoin par défaut ; rien ne montre que c0064 ou c0101 fassent mieux sur des
graines jamais vues. Si le coffre complet montre un gain net, il faudra départager c0064 et c0101 **sur le coffre**, pas sur la validation. Les 6 graines
du relecteur font partie du coffre : elles n'ont servi à choisir personne, et personne ne doit choisir un pilote sur elles.

**Pour finir la mesure** (25 à 45 minutes à 4 courses à la fois ; à lancer **après** le commit du portage, car `modele.js` est dans l'époque des courses de
l'étude : les 20 courses déjà faites seront rejouées) :

    node ml/ecurie/etude/boucle-payante-ryzen/coffre/jouer.js --travailleurs 4
    node ml/ecurie/etude/boucle-payante-ryzen/coffre/analyser.js

Le détail : `ml/ecurie/etude/boucle-payante-ryzen/coffre/LISEZ-MOI.md` (et sa section « Relecture »), `sorties/resume.txt`.

**Une option à côté, pour Fable** : partir de c0101 ne coûte rien en conduite (tout éteint = c0025 ; le génome peut rallumer ou éteindre chaque apport
séparément), mais une population née de c0101 commence avec les quatre interrupteurs **allumés**. Partir de c0025 laisse la sélection les allumer un à un si
elle les trouve utiles (ce sont des gènes comme les autres depuis le portage). Ce second chemin ne demande aucune commande sur le Ryzen.

---

## 2. L'état exact

### Ce qui est prêt

- **Le génome v:3** (121 gènes : les 107 d'avant, puis 14 gènes du portage) écrit c0025 **et** c0101 au bit près, et aussi c0026, c0064, c0072, c0087.
  Quatre interrupteurs (`fuirVite` c0026, `bordOn` c0064, `largeOn` c0072, `libreOn` c0087) et leurs réglages. Un pilote né avant le portage garde son
  identifiant et sa conduite (c0025 : `19e3767cc346`). `INTERFACES.md` § 10.1-10.3, `notes/portage.md`.
- **Le témoin au choix** : `config.json` `"temoin"` (défaut `c0025`). Un état garde le témoin dont il est né et le dit. **`--repartir-de NOM`** : contrôle
  d'identité du nouveau témoin d'abord, puis l'ancien état rangé dans `etat/archives/<date UTC>-<ancien témoin>/` (rien n'est effacé, le Node du PC et
  `machine.json` restent en place), puis une population neuve. Un STOP pendant le contrôle refuse avant d'archiver ; après l'archivage, la génération 0 naît
  avant tout test d'arrêt (correction du relecteur).
- **Le Node fixe par PC** : `lancer.cmd` lance toujours le Node de `etat/node.txt` (trouvé seul la première fois : celui de la version de l'époque en cours).
  Un Node d'une autre version : rien n'est lancé (code 2), le texte dit pourquoi et comment corriger (`etat/NODE-REFUSE.txt`). `INTERFACES.md` § 10.4.
- **Nouveau, de l'intégration** : `evoluer.js` se garde lui-même (la demande n° 1 du lot lanceurs). Tapé à la main avec un Node d'une autre version que
  l'époque de la population, il refuse (code 2) au lieu d'ouvrir une époque neuve en silence. Sauf sous `lancer.cmd` (qui passe `CASHCAR_NODE_FIXE`), avec
  `--nouveau-node`, ou avec le marqueur `etat/CHANGER-DE-NODE` (une fois). Cela protège aussi `--repartir-de` tapé à la main sur le Ryzen.
  Test : `tests/node-epoque.test.js` (14 / 14).
- **Les tâches sans limite de durée** : `installer-tache.cmd` les pose en XML (`PT0S`, une seule à la fois, sur batterie, rattrapage d'une heure manquée,
  sans fenêtre noire par `cache.vbs`) et remplace celles posées à la main. Les trois XML ont été acceptés par le Planificateur en validation seule (rien de
  posé). `installer-tache.cmd essai DOSSIER` écrit tout sans rien poser. `INTERFACES.md` § 10.5.
- **Les pages** : le résumé (`etat.js`), le tableau, l'arbre et le récit nomment le témoin de la population (c0025 ou c0101) ; l'arbre a un mot simple pour
  chacun des 14 gènes nouveaux ; le récit dit, en tête, quand la population est née d'un changement de témoin (nouveau, de l'intégration).
- **Le mode d'emploi** : `README.md` (le témoin, le Node fixe, les tâches sans limite, les nouveaux refus dans « Si ça s'arrête »).

### Ce qui a été vérifié ici (le 28/11, sur le Xeon, 2 courses à la fois au plus)

- Tous les tests rapides de `ml/evolution/tests/`, après toutes les modifications : commun 16/16, graines 8/8, note 16/16, genome 14/14, tableau 69/69,
  lanceurs 76/76, generation 12/12, robustesse 8/8, machine 45/45, machine-relecture 19/19, traces 87/87, relecture-traces 95/95, gestes 10/10,
  integration 29/29, portage 11/11, node-epoque 14/14 (nouveau).
- `tests/identite.test.js --travailleurs 2` (c0025 et c0101) : voir § 4.
- Une évolution d'essai neuve née de c0101, et le changement de témoin sur un état né de c0025 : voir § 4.

### Ce qui n'est pas vérifié

- **Le coffre** (§ 1) : 10 graines sur 40. Le choix du témoin attend la fin de la mesure.
- **Sur le Ryzen** : rien de ce code n'y a tourné. En particulier : que `node-fixe.js` trouve seul le dossier `node-v24.22.3` (s'il n'est ni dans le PATH
  d'un double-clic ni dans un des lieux connus, il refuse et il faut écrire `etat/node.txt` à la main, geste 3 ci-dessous) ; que le compte de Sacha puisse
  poser la tâche d'ouverture de session sans droits d'administrateur ; qu'aucune stratégie ne coupe `wscript`.
- `tests/evoluer.test.js`, `tests/courses.test.js`, `gestes.test.js --courses` (lents) : pas relancés.
- c0026, c0064, c0072 et c0087 écrits par leur génome : comparés sans course seulement (552 décisions identiques chacun). En course, seuls c0025 et c0101.
- `alarmeDistance` (0,012) n'a pas été remesurée pour 121 gènes (la distance moyenne baisse d'environ 12 % à population égale).
- Les « 2 788 vues » tracées (c0064 rejoué dans c0072, c0087, c0101 : zéro décision différente) n'ont pas de source dans le dépôt : les traces n'ont pas été
  gardées. Le coffre montre d'ailleurs que ces blocs se déclenchent parfois (2 courses sur 10).
- La priorité des tâches (7, sous la normale, le défaut de `schtasks`) : le banc mesuré sous une tâche et sous un double-clic peut différer. Pas mesuré.
- Un `lancer.cmd` qui consomme `CHANGER-DE-NODE`, suivi d'un `evoluer.js` qui sort sans changer d'époque (verrou tenu) : le lancement suivant refuse, il faut
  recréer le marqueur. Bruyant, sans danger pour les notes.

---

## 3. Sur le Ryzen : les gestes de la mise à jour, dans l'ordre

Pour quelqu'un qui ne code pas. **Avant de commencer** : ce travail doit être commité et poussé sur `bots-ecurie` par la session principale (avec l'accord
de Sacha). Tant que ce n'est pas fait, `git merge` ne trouve rien de nouveau.

Ce qui va se passer : la sélection qui tourne garde ses pilotes et leur conduite, mais `modele.js` a changé : c'est une **nouvelle époque**. Toutes ses
courses seront rejouées (quelques heures de calcul perdues) et le contrôle d'identité refait (quelques minutes). C'est normal.

**1. Arrêter.** Dans `CASH-CAR-evolution\ml\evolution` : double-clic sur **`arreter.cmd`**. Attendre « C'est arrêté » (quelques minutes : il laisse finir
les courses en cours). Les tâches de chaque heure ne relanceront rien tant que tu n'auras pas relancé à la main.

**2. Fusionner.** Ouvrir une fenêtre de commande dans le dossier `CASH-CAR-evolution` (barre d'adresse de l'Explorateur, taper `cmd`, Entrée), puis :

    git fetch origin
    git merge --no-edit origin/bots-ecurie

Tu dois voir `Merge made by …`. Si git dit `CONFLICT` : `git merge --abort`, et demander à Claude.

**3. Le Node fixe (une fois).** Le bon Node est `v24.22.3`, dans le dossier `node-v24.22.3` que l'assistant du Ryzen a mis en tête du PATH des tâches. Pour ne
rien laisser au hasard, écris son chemin dans un fichier :
- ouvre le Bloc-notes, tape **sur une seule ligne** le chemin complet de `node.exe` dans ce dossier (par exemple `C:\…\node-v24.22.3\node.exe`) ;
- enregistre sous `CASH-CAR-evolution\ml\evolution\etat\node.txt` (type « Tous les fichiers », pour ne pas avoir `node.txt.txt`).
- Pour vérifier, dans la fenêtre de commande : `type ml\evolution\etat\node.txt`, puis la même ligne entre guillemets suivie de ` --version` : il doit
  afficher `v24.22.3`.

Si tu sautes ce geste, `lancer.cmd` cherche seul (le PATH, Program Files, les dossiers `node-v*` à côté du dépôt et dans ton profil…). S'il trouve
`v24.22.3`, il l'écrit lui-même dans `node.txt`. Sinon, **il ne lance rien** et dit pourquoi : fais alors ce geste 3, puis relance.
Ce fichier est propre au Ryzen : il ne part jamais sur GitHub.

**4. Relancer.** Deux cas, selon la décision de Fable :
- **Le témoin reste c0025** (le cas par défaut) : double-clic sur **`lancer.cmd`**. C'est tout.
- **Fable choisit de repartir de c0101** : dans la fenêtre de commande (dossier `CASH-CAR-evolution`), tape

      ml\evolution\lancer.cmd --repartir-de c0101

  Il vérifie d'abord que c0101 est recopié au bit près (6 courses de 45 s, quelques minutes). Puis il **range** toute la population actuelle dans
  `ml\evolution\etat\archives\<date>-c0025\` (rien n'est effacé), et une population neuve naît de c0101. Laisse la fenêtre ouverte : la sélection continue
  ensuite toute seule, comme un double-clic.
  - **Ne tape pas** `node ml\evolution\evoluer.js --repartir-de c0101` : le `node` tout court du Ryzen est v24.22.1. Depuis cette mise à jour, il refuserait
    de toute façon (« REFUS DE PARTIR : la population … court sous Node v24.22.3 … »), sans rien toucher.
  - **Ne mets jamais `--repartir-de` dans une tâche planifiée** : elle rangerait la population à chaque lancement.
  - Une seule fois : si tu relances la commande, elle rangerait la population c0101 toute neuve à son tour (rien ne serait perdu, mais c'est inutile).

**5. Les tâches déjà posées à la main.** Rien à faire. Les trois tâches (`CashCarEvolution`, `CashCarEvolution-relance`, `CashCarEvolution-traces`) appellent
`lancer.cmd auto` (c'est ce qu'aurait posé `installer-tache.cmd` ; je n'ai pas pu le vérifier d'ici), qui prend maintenant le Node de `etat\node.txt` : le
PATH de la tâche ne compte plus. Elles sont déjà sans limite de durée. Si l'une d'elles lance `node … evoluer.js` directement au lieu de `lancer.cmd`, elle
marche encore tant que son PATH donne v24.22.3 (sinon `evoluer.js` refuse désormais, code 2) : la remplacer par `installer-tache.cmd` est alors conseillé.
*Facultatif* : un double-clic sur `installer-tache.cmd` (puis O) les remplace par les versions sans fenêtre noire. Lis le texte avant de répondre : il dit
qu'il remplace les tâches de mêmes noms et quel Node il utilise. S'il dit qu'un remplacement a échoué (tâche posée en administrateur), relance-le en
administrateur, ou laisse les tâches comme elles sont. La veille sur secteur est déjà coupée : il la recoupe, sans effet.

**6. Vérifier** (dans la fenêtre de commande, dossier `CASH-CAR-evolution`) :

    node ml\evolution\etat.js

- ligne 2 : **EN MARCHE** ;
- la ligne « Temoin » donne le nom du témoin entre parenthèses (`c0025` ou `c0101`) ;
- la fin de `ml\evolution\etat\sortie.log` dit `node v24.22.3`, puis « nouvelle epoque » (cas c0025) ou « repartir : … est archive dans … » et « premier
  lancement » (cas c0101) ;
- `ml\evolution\etat\NODE-REFUSE.txt` n'existe pas.

(`etat.js` ne joue aucune course : le `node` tout court suffit pour lui.)

**7. Mettre à l'abri** : double-clic sur `sauver-traces.cmd` une fois (la tâche de chaque heure le refera ensuite seule).

---

## 4. Les essais de l'intégration (le 28/11, sur le Xeon)

Tous lancés avec 2 courses à la fois au plus. Les états d'essai sont dans `ml/evolution/essais/c0101/` (hors git, on peut l'effacer).

- **`tests/identite.test.js --travailleurs 2`** : **9 / 9**, 307 s. c0025 IDENTIQUE à `pilote-voltige.js` (`8d34b0578072`, `c4b906ba0a4f`, `59db7c95e6f3`),
  c0101 IDENTIQUE à `c0101-pilote.js` (`8d34b0578072`, `700c9e35dfbb`, `302b83fef550`) sur 910000, 910037, 910074 à 45 s ; les deux témoins jouent des courses
  différentes ; (b) et (e') inchangés.
- **Une évolution neuve née de c0101** : `evoluer.js --config essais/c0101/config-c0101.json --arret-apres 2 --travailleurs 2`. Ce fichier est
  `config-essai.json` plus `"temoin": "c0101"` et un état à part (`essais/c0101/etat`) : `--config` ne prend qu'un fichier, et `config-essai.json` n'a pas de
  témoin. Résultat : code 0, 626 s. « premier lancement : epoque 66f66d2ae1c2, temoin c0101 », contrôle d'identité 3 × IDENTIQUE, génération 0 = le témoin
  `f70ddcb5a565` (c0101) et 3 mutants (14 courses), génération 1 (18 courses, 2 renvois). `population.json` `temoinNom: c0101`. Le résumé dit « Temoin
  f70ddcb5a565 (c0101) », le récit et l'arbre disent « c0101, le dernier champion de la boucle payante ».
- **Le changement de témoin sur un état existant** (`essais/c0101/changement`, `--config config-essai.json`) :
  1. `--une-generation --travailleurs 2` : une population naît de c0025 (`19e3767cc346`), génération 0, 20 courses, code 0 ;
  2. `--repartir-de c0101 --une-generation --travailleurs 2` : contrôle d'identité de c0101 d'abord (3 × IDENTIQUE), puis l'état est rangé dans
     `archives/2026-11-28T00-59-01-c0025/` (11 fichiers ou dossiers, `ARCHIVE.json` : `temoinAncien c0025`, `temoinNeuf c0101`, génération 0) ; **rien
     n'est effacé** (l'ancienne population, ses journaux, ses courses et ses pages sont dans l'archive) ; une population neuve naît de c0101 (`f70ddcb5a565`),
     génération 0, 14 courses, code 0 (615 s pour les deux lancements).
  3. Le résumé dit « Temoin f70ddcb5a565 (c0101) » ; l'arbre nomme c0101 ; le récit dit, ligne 6 de « Où on en est » : « Cette population est née d'un
     changement de témoin : l'ancienne population est rangée dans `archives/` (rien n'est effacé) ; la dernière, née de c0025, s'était arrêtée à la
     génération 0. »
- Non essayé ici : `--repartir-de` passé **par `lancer.cmd`** (c'est la consigne du geste 4). `lancer.cmd` transmet ses options (contrôlé par
  `tests/lanceurs.test.js` et `machine-relecture.test.js` avec un faux `evoluer.js`), mais la combinaison complète n'a pas tourné.
- Les tests rapides ont été relancés une seconde fois après les dernières modifications (tableau, traces, relecture-traces, integration, machine, portage,
  node-epoque, lanceurs) : tous passent.
