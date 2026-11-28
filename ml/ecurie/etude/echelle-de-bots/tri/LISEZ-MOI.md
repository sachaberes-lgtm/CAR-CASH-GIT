# Le test B, « le tri » : une course de c0025 qui meurt tôt passe-t-elle pour une partie de joueur ? (28/11/2026)

Mesure avec courses : 40 courses de c0025 rejouées, une à la fois, sur le Xeon, pendant qu'une vague du banc tournait.
Écrite pour quelqu'un qui ne lit pas le code. Branche `bots-ecurie`. Rien n'est modifié hors de ce dossier. Rien n'est committé.
Deux agents : un mesureur (la prédiction, les outils, les 40 courses), un relecteur adverse (ce texte, et ses propres calculs dans `relecteur/`).
Le mesureur n'a pas rendu de rapport (« I'm waiting for the courses to finish ») : il n'a donc rien affirmé sur les résultats.
**Tous les chiffres de résultat ci-dessous sont ceux du relecteur, refaits avec ses scripts.** Ce texte ne décide rien.

L'idée testée (`../LISEZ-MOI.md` § 6.3 et § 11.3) : chez les joueurs, une partie faible est une partie qui meurt tôt.
Alors une course de c0025 finie au palier k pourrait servir d'adversaire de niveau k, sans fabriquer un autre pilote.

## En une minute

1. **La prédiction a été écrite avant les courses.** `prediction.md` date de 16 h 54 min 25 s ; la première course commence 34 s plus tard. Elle n'a pas été modifiée depuis (date du disque ; le fichier n'est pas dans git, on ne peut pas le prouver mieux).
2. **Les 40 graines sont bien celles que dit la règle** : les 40 premières, par graine croissante, des 53 courses du banc finies aux paliers 4 à 8.
3. **Les 40 courses rejouées sont exactement celles du banc** : même palier, même survie, même cause, mêmes pièces, mêmes trois empreintes, **40 sur 40** (`relecteur/identite.txt`). Survie médiane : 109,45 s.
4. **Le verdict, selon la règle écrite d'avance : AUC à temps égal = 0,904. C'est ≥ 0,90 : « l'idée est morte ».** L'AUC entière vaut 0,953 (même case). Effectif : 10 parties de joueur (72 fenêtres) contre 40 courses (372 fenêtres).
5. **Mais ce verdict est sur le fil.** 0,904 est à 0,004 du seuil. Avec T = 103 s au lieu de 109,45 s : 0,899 (« indécis »). Avec des fenêtres de 5 s : 0,874 (« indécis ») ; de 20 s : 0,963 (« morte »). La tranche 6-8 seule : 0,898 ; la tranche 4-5 : 0,919.
6. **Le tri ne change pas le pilote.** Les 40 courses mortes tôt ne se distinguent pas de 20 courses ordinaires de c0025 : AUC 0,513 (les deux coupées à 109,45 s). Une course qui meurt tôt, c'est c0025 ordinaire, qui est mort plus tôt.
7. **Le résultat qui pèse le plus : le juge sépare aussi deux humains.** Sacha (10 parties au clavier) contre Léo (4 parties au doigt) : **AUC 0,93 ; 0,947 à temps égal.** Selon la règle, Léo serait « mort » lui aussi. Le seuil 0,90 ne sépare donc pas « un humain » de « un bot » : il sépare « Sacha au clavier » du reste.
8. **Le témoin humains contre humains du mesureur ne mesure pas cela.** Il coupe Sacha en deux moitiés de 5 parties : il dit le bruit du juge, pas sa puissance. Le bon témoin du bruit, à la taille du test (10 contre 40, étiquettes mélangées, 30 fois) : moyenne 0,497, au plus 0,627.
9. **Ce qui trahit le bot à temps égal** : l'ondulation (z = 2,37 ; 0,211 contre 0,165), puis les vols (hauteur max 11 m contre 33 m, décollages, temps en l'air). On ne sait pas si l'ondulation vient du pilote ou du simulateur : aucune course de bot dans le vrai jeu, aucune partie de joueur dans le simulateur.
10. **On ne sait pas ce que la version du jeu fait au juge.** Les joueurs ont joué sur deux versions de novembre (`60aa15e`, `ccdca9b`), le bot sur `cashcar-v1627` dans le simulateur. Le seul essai possible (Sacha sur une version contre l'autre, 8 contre 2 parties) donne 0,033 : un chiffre sans valeur, il ne mesure que la petitesse du groupe.

## 1. Les vérifications avant de juger

### 1.1 La prédiction était-elle écrite avant ?

Dates du disque (heure du Xeon, 28/11) :

| fichier | écrit à |
|---|---|
| `sorties/puissance-humhum-entier.json`, `-109s.json` (sans aucune course) | 16:53:42, 16:53:50 |
| `prediction.md` | **16:54:25** (créé et jamais réécrit : même date de création et de modification) |
| `course-tri.js` (l'outil qui joue une course) | 16:54:52 |
| `sorties/err-3000037.txt` (la première course) | 16:54:59 |
| `parties-banc/3000037.json.gz` | 16:56:05 |
| `sorties/discerner-voltige4.json` | 17:00:13 |
| la dernière course (`3002775`) | 17:39:20 |

- La prédiction précède toute course. Elle cite la survie médiane du banc (109,4 s), lue en choisissant les graines : c'est dit dans le texte (§ 2).
- **Réserve** : le fichier n'est pas committé. « Pas retouché » repose sur la date du disque, rien de plus.

### 1.2 Les 40 graines

Refait par le relecteur sur `../../banc-des-genes/etat/courses-2026-48.jsonl`, bras `depart` :
- 96 lignes, 96 graines différentes, une seule époque (`66f66d2ae1c2`), un seul jeu (`cashcar-v1627 e7e1eed4718f`), tmax 900 s.
- 53 lignes aux paliers 4 à 8. Les 40 premières par graine croissante sont **exactement** la liste de `prediction.md`.
- Effectifs : palier 4 → 8, 5 → 7, 6 → 7, 7 → 12, 8 → 6. **Retrouvés.**
- Les 13 écartées (3002849 à 3003515) le sont par l'ordre des graines seulement.
- **Ce que l'échantillon ne couvre pas** : les 14 courses du banc finies aux paliers 1 à 3, le vrai bas de l'échelle.

### 1.3 Les courses rejouées sont-elles celles du banc ?

Source : `relecteur/identite.js` → `relecteur/identite.txt`.
- **40 courses sur 40 identiques** à leur ligne du banc sur 7 champs : palier, survie, cause, pièces, empreinte de course, de vues, de touches.
- Toutes jouées avec le texte gardé par le banc (`6e05036f219e`). Aucun échec (`sorties/courses-banc.jsonl`, 40 lignes).
- Le pilote « actuel » (`6d76492d…`, l'époque d'aujourd'hui) donne les mêmes trois empreintes sur 3000037 et 3000111 (`sorties/identite-*-actuel.json`). Sur ces deux graines, l'époque n'a rien changé.
- Une course à la fois : vérifié dans la liste des processus pendant le test (un seul `course-tri.js` à côté des 4 courses de la vague).

## 2. Le verdict selon la règle écrite d'avance

La règle (`prediction.md` § 6) : AUC à temps égal ≤ 0,75 → le tri vaut pour le bas ; ≥ 0,90 → l'idée est morte ; entre les deux → indécis.
L'AUC à temps égal décide. T = la survie médiane des 40 courses rejouées = **109,45 s**.

| juge | joueurs (parties / fenêtres) | bot (parties / fenêtres) | AUC | case | fichier |
|---|---|---|---|---|---|
| `ml/bot/discerner.js`, sans rien changer | 10 / 147 | 40 / 372 | **0,953** | morte | `relecteur/discerner-test-b-40.json` |
| `juger.js`, joueurs entiers (contrôle) | 10 / 147 | 40 / 372 | 0,953 | morte | `relecteur/juger-test-b-40-entier.json` |
| **`juger.js`, joueurs coupés à 109,45 s** | **10 / 72** | **40 / 372** | **0,904** | **morte** | `relecteur/juger-test-b-40-t109.json` |
| tranche 4-5, à temps égal | 10 / 72 | 15 | 0,919 | morte | `relecteur/juger-4-5-t109.json` |
| tranche 6-8, à temps égal | 10 / 72 | 25 | 0,898 | indécis | `relecteur/juger-6-8-t109.json` |

- **Le contrôle tient** : sans troncature, `juger.js` redonne l'AUC de `discerner.js` au millième (0,953 et 0,953 ; sur les 20 courses de `note-voltige4`, 0,924 et 0,924).
- Le mesureur annonçait que ce contrôle était « vérifié dans resultats.md » (en-tête de `juger.js`). **Ce fichier n'existe pas.** Le relecteur l'a vérifié lui-même.
- **Le verdict, à la lettre : ≥ 0,90, l'idée est morte.** Le désaccord entre les tranches (4-5 morte, 6-8 indécise) est dit ; la règle ne porte que sur les 40.
- **Le pari du mesureur** (`prediction.md` § 7 : « AUC ≥ 0,90 ») est tenu de 0,004. Son second pari (l'écart sur la nitro grandit à temps égal) tient : AUC de la nitro seule 0,595 entière, 0,727 à temps égal.
- **Ce que la prédiction dit d'elle-même** (§ 5) : « un écart entre deux AUC de moins de 0,1 ne veut rien dire ». 0,904 et le seuil 0,90 sont donc indiscernables, par sa propre règle.

## 3. L'attaque du juge

Source de toute cette partie : `relecteur/attaque.js` → `relecteur/attaque-test-b-40.txt` et `.json` (les 40 courses),
`relecteur/attaque-voltige4.txt` (20 courses ordinaires de c0025, `../../../agents/tmp-voltige/note-voltige4-t900.json`). Aucune course jouée.

### 3.1 La durée des fenêtres et le choix des joueurs

| fenêtres | joueurs | entiers | coupés à 109,45 s |
|---|---|---|---|
| 5 s | clavier (10) | 0,924 | **0,874** (indécis) |
| 5 s | tous (14) | 0,936 | 0,903 |
| **10 s** | **clavier (10)** | 0,953 | **0,904** (la règle) |
| 10 s | tous (14) | 0,953 | 0,914 |
| 20 s | clavier (9) | 0,984 | 0,963 |
| 20 s | tous (12) | 0,986 | 0,970 |

- **Plus la fenêtre est longue, plus le juge voit le bot** : environ +0,03 à +0,06 de 5 à 10 s, et autant de 10 à 20 s. Une longue fenêtre moyenne le bruit : le juge voit mieux ce qui est constant.
- **Selon la fenêtre, le verdict change de case.** 10 s avait été fixé d'avance : c'est la règle qui compte, mais elle n'est pas robuste.
- Ajouter Léo (« tous ») ne fait pas baisser l'AUC : elle monte un peu.
- **L'AUC par partie** (une note par partie, pas par fenêtre : l'effectif vrai) vaut 0,90 au clavier, 0,857 avec tous, 1,00 à 20 s, à toutes les troncatures.
  0,90 sur 10 × 40 paires, c'est 40 paires sur 400 mal rangées : le juge range presque toutes les parties de joueur au-dessus de presque toutes les courses.

### 3.2 Le nombre de parties du bot

Fenêtres de 10 s, joueurs au clavier coupés à 109,45 s, 20 tirages au hasard par taille :

| parties du bot | AUC moyenne | 5 % – 95 % des tirages |
|---|---|---|
| 5 | 0,878 | 0,830 – 0,943 |
| 10 | 0,896 | 0,873 – 0,932 |
| 20 | 0,902 | 0,889 – 0,924 |
| 40 | 0,904 | (une seule valeur) |

- **L'AUC monte avec le nombre de parties du bot**, puis se stabilise vers 20. Avec 5 courses, on aurait conclu « indécis » le plus souvent.
- Le côté joueurs, lui, ne peut pas grossir : 10 parties. C'est lui qui borne la précision. **On ne sait pas** de combien l'AUC bougerait avec 10 autres parties de Sacha.

### 3.3 Les témoins : que vaut 0,5 et que vaut 0,9 ?

| témoin | effectif | AUC | ce qu'il dit | fichier |
|---|---|---|---|---|
| humains contre humains du mesureur (Sacha coupé en deux moitiés) | 5 contre 5, 200 partages | moyenne 0,457, max 0,677 (entiers) ; 0,452, max 0,716 (coupés) | le bruit du juge à 5 contre 5 | `sorties/puissance-humhum-*.json` |
| étiquettes mélangées, à la taille du test | 10 contre 40, 30 fois | moyenne 0,497, 5-95 % 0,380 – 0,625, max 0,627 | le bruit du juge **à la taille du test** | `relecteur/attaque-test-b-40.json` |
| **Sacha contre Léo** | **10 contre 4** | **0,930 entiers ; 0,947 coupés** | **un autre humain** | même fichier |
| le bot contre lui-même (les 40 contre 20 courses ordinaires de c0025) | 40 contre 20 | 0,513 | le tri ne change pas le pilote | même fichier |
| Sacha sur `60aa15e` contre Sacha sur `ccdca9b` | 8 contre 2 | 0,033 | rien : un groupe de 2 parties, dont une de 12 s (1 fenêtre) | même fichier |

Ce que cela dit :
- **Le témoin humains contre humains ne vaut que pour le bruit.** Il compare Sacha à Sacha. Il ne dit pas ce que le juge ferait d'un autre humain. Sa moyenne sous 0,5 (0,457) est le biais connu du « une partie de côté » quand les groupes sont petits.
- **Le témoin qui manquait, c'est Sacha contre Léo.** Il répond à la question « un vrai joueur qui n'est pas Sacha passe-t-il ? ». Réponse : **non, AUC 0,93**. Il dépasse le seuil de mort de la règle.
- **Réserve sur ce témoin** : Léo diffère de Sacha par le joueur, l'appareil (doigt, téléphone) **et** la version du jeu (ses 4 parties sont sur `ccdca9b`). On ne sait pas lequel des trois le juge voit. Et 4 parties, c'est peu.
- **Conséquence** : « AUC ≥ 0,90 » ne veut pas dire « pas humain », seulement « pas Sacha au clavier ». Le juge apprend ces 10 parties-là, comme le disait déjà `prediction.md` § 5. La règle n'a pas de témoin qui la calibre.
- Sacha contre lui-même sur deux versions ne dit rien : avec 2 parties de côté, le juge « une partie de côté » se trompe exprès (0,033). Un groupe de moins de 4 ou 5 parties ne se juge pas.

### 3.4 Ce qui trahit : le pilote, le simulateur ou la version ?

Les mesures seules, à temps égal (`relecteur/juger-test-b-40-t109.json`) :

| mesure | joueurs | bot | z | origine possible |
|---|---|---|---|---|
| ondulation (vitesse latérale / vitesse au sol) | 0,165 | 0,211 | 2,37 | pilote ; ou simulateur (pas de temps) |
| hauteur max d'un vol (m) | 33,4 | 11,0 | −1,42 | pilote ; ou version (les tremplins) |
| décollages par 10 s | 0,84 | 0,62 | −1,35 | pilote ; ou version |
| part du temps en l'air | 0,20 | 0,14 | −1,05 | pilote ; ou version |
| part du temps nitro | 0,71 | 0,57 | −0,35 (AUC 0,727) | pilote |

- **Ce que le relecteur a trouvé qui diffère entre les deux sources, hors pilote** :
  - le simulateur enregistre un échantillon toutes les 0,1066 s (médiane des 40 ; de 0,1050 à 0,1103) ; les joueurs, toutes les 0,109 à 0,111 s. Une fenêtre de 100 échantillons dure donc environ 10,7 s chez le bot, 11 s chez les joueurs ;
  - la version : les joueurs sur `60aa15e` (8 parties de Sacha, le 23/11) et `ccdca9b` (2 de Sacha, 4 de Léo, le 24/11) ; le bot sur `cashcar-v1627`, dans le simulateur `relief-canyon` (champ `ver` de la partie : « LOCALE »).
- **On ne sait pas** si l'ondulation ou les vols tiennent au simulateur ou à la version. Il faudrait l'une de deux choses, qu'aucun fichier du dépôt n'a : des courses du même bot dans le vrai jeu, ou des parties de joueur rejouées dans le simulateur.
- Une correction au mesureur : `prediction.md` § 4 dit que `note-voltige4` vient d'« un autre jour du jeu ». **Même jeu** (`cashcar-v1627 e7e1eed4718f`, même simulateur, régime allégé), un autre texte de pilote (`c3e8b819…`). Le test « bot contre bot » (0,513) compare donc deux lots de c0025 sur le même jeu.

## 4. Ce qui tient, ce qui tombe

**Tient :**
- la prédiction écrite avant, les 40 graines, l'identité 40 sur 40 ;
- l'AUC de `discerner.js` (0,953) et du juge à temps égal (0,904) ; le contrôle de `juger.js` ;
- l'effet de la troncature : couper les joueurs à 109 s fait baisser l'AUC d'environ 0,05 (de 0,953 à 0,904) ;
- le pari « l'écart grandit sur la nitro ».

**Tombe ou ne s'établit pas :**
- « vérifié dans resultats.md » : le fichier n'existe pas ;
- « un autre jour du jeu » pour `note-voltige4` : c'est le même jeu ;
- « le seuil 0,75 est juste au-dessus du bruit du juge » est vrai, mais **le seuil 0,90 n'a pas de témoin** : un autre humain le dépasse (0,93) ;
- la robustesse du verdict : selon T (103 ou 109,45 s), la fenêtre (5 ou 10 s) ou la tranche, il change de case.

## 5. Les fichiers

Tous dans ce dossier. Refaire : `node <script>` depuis la racine du dépôt (chemins relatifs, jamais `/c/…` sous Git Bash).

| fichier | qui | rôle |
|---|---|---|
| `prediction.md` | mesureur | la question, l'échantillon, la règle, écrits avant |
| `course-tri.js`, `jouer-tri.sh` | mesureur | une course avec sa partie ; les 40, une à la fois |
| `juger.js` | mesureur | le juge recopié de `ml/bot/discerner.js`, avec la troncature `--thum` et le témoin `--humhum` |
| `rassembler.js` | mesureur | vérifie et range les 40 (pas lancé ; le relecteur a fait la même chose avec `relecteur/identite.js`) |
| `parties-banc/`, `parties-actuel/` | mesureur | les 40 courses, et 2 courses du pilote d'aujourd'hui |
| `sorties/` | mesureur | les résultats compacts, le bavardage du jeu, les témoins humains contre humains, `note-voltige4` jugé |
| `relecteur/identite.js` → `identite.txt`, `note-test-b-40.json` | relecteur | la preuve d'identité 40 sur 40 ; la note lue par `discerner.js` |
| `relecteur/attaque.js` → `attaque-test-b-40.*`, `attaque-voltige4.*`, `attaque-apercu17.*` | relecteur | la grille, la taille, les témoins (l'aperçu à 17 courses n'est qu'un essai intermédiaire) |
| `relecteur/discerner-test-b-40.json`, `juger-*.json`, `note-test-b-4-5.json`, `note-test-b-6-8.json` | relecteur | les jugements du § 2 |

## Ce que la session principale doit trancher

1. Appliquer la règle à la lettre (0,904 : l'idée est morte), ou la dire indécise parce que 0,904 touche le seuil et que le verdict change avec T, la fenêtre ou la tranche.
2. Que faire d'un juge qui sépare Sacha de Léo (0,93) aussi bien que Sacha du bot : le garder comme arbitre de « ressemble à un joueur », ou d'abord lui trouver un témoin qui le calibre.
3. Comme le tri ne change pas le pilote (0,513), son sort est celui de c0025 : la ressemblance se gagne sur le pilote (ondulation, vols, nitro), pas sur le choix des courses.
4. Faut-il mesurer ce qui vient du simulateur et de la version (des courses du bot dans le vrai jeu, ou des parties de joueur rejouées), avant de croire l'ondulation ?
5. Les paliers 1 à 3 (14 courses du banc) n'ont pas été jugés.

## Ce que l'on en fait

*Décision de la session principale, le 28/11/2026 au soir.*

**1. Le test est déclaré nul, pas gagné.** La règle écrite avant donnait « l'idée est morte » à 0,90, et le juge rend 0,904. Mais le même juge sépare
Sacha de Léo à 0,93 : selon cette règle, un vrai joueur serait « mort » lui aussi. L'instrument ne passe pas son témoin. On ne garde donc ni « le tri
vaut », ni « le tri est mort » : on garde que **ce juge, appris sur 2 joueurs, reconnaît « Sacha au clavier », pas « un humain »**. L'erreur est dans la
prédiction : son seuil n'avait pas été calibré sur un témoin humain contre un autre humain. À faire désormais avant tout test de ce genre.

**2. Ce que le test établit quand même.** Le tri ne change pas le pilote : les courses mortes tôt et les courses ordinaires de c0025 ne se distinguent pas
(0,513). Une banque de courses rangées par palier d'arrivée ressemble donc à un joueur exactement autant que c0025 lui-même. **Le tri reste le moyen le
moins cher d'avoir des niveaux ; la ressemblance se gagne sur le pilote.**

**3. Ce qui trahit le pilote, à temps égal** : il ondule plus (0,211 contre 0,165), vole moins haut et moins souvent, tient moins la nitro. Les trois
derniers sont aussi ce qui lui manque en pièces (`../pieces/`) : les mêmes réglages servent les deux. L'ondulation est à surveiller : le slalom, qui
rapprochait des joueurs sur la note E, coûte environ 28 pièces par minute sur les 96 graines du banc d'étude (relecture du critère de débit).

**4. Ce qu'il faut pour un vrai juge : d'autres joueurs.** Avec 2 joueurs, aucune mesure ne sépare « humain » de « ce joueur-là ». Quelques parties de
trois à cinq autres personnes, débutants compris, enregistrées avec l'enregistreur qui existe déjà (aucun changement du jeu), donneraient un témoin
« un humain contre un autre ». C'est demandé à Sacha.

**5. On ne poursuit pas** la question « simulateur ou version » par des courses du bot dans le vrai jeu : c'est un chantier à part (brancher un bot dans
le jeu), qui viendra avec le matchmaking lui-même.
