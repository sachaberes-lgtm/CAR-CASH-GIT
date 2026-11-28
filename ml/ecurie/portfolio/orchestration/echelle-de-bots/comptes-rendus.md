# L'étude « l'échelle de bots » (des bots de chaque niveau, et des experts) : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu en texte libre ; l'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l'agent. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `echelle-de-bots` (wf_f5328ebe-c85), lancée par la session principale (Claude Fable).
- Agents : 11, 8 du modèle claude-opus-5-5, 3 du modèle claude-fable-5-2 (le modèle de chaque agent est écrit à son rôle, plus bas).
- Durée : 19 min ; jetons consommés par les agents : 1 544 657 (1,54 millions) ; appels d'outils : 193.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. lecteur « joueurs » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course (phase « Comprendre »)
2. lecteur « palier » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course (phase « Comprendre »)
3. lecteur « selection » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course (phase « Comprendre »)
4. lecteur « existant » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course (phase « Comprendre »)
5. concepteur de la voie « niches » : propose une façon de fabriquer l'échelle et les experts (phase « Concevoir »)
6. concepteur de la voie « handicap » : propose une façon de fabriquer l'échelle et les experts (phase « Concevoir »)
7. concepteur de la voie « libre » : propose une façon de fabriquer l'échelle et les experts (phase « Concevoir »)
8. relecteur « chiffres » : attaque les trois conceptions sous cet angle (phase « Attaquer »)
9. relecteur « code » : attaque les trois conceptions sous cet angle (phase « Attaquer »)
10. relecteur « but » : attaque les trois conceptions sous cet angle (phase « Attaquer »)
11. rédacteur : écrit le LISEZ-MOI de l'étude à partir de tout ce qui précède (phase « Ecrire »)

## 1. lire:joueurs

*Rôle : lecteur « joueurs » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

#### Lecteur des joueurs : ce que disent les vraies parties, niveau par niveau

Je n'ai lancé aucune course ni aucun test. Deux scripts en lecture seule sont dans `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/` :
- `parties.js` écrit `sortie.txt` et `sortie.json` ;
- `a-temps-egal.js` écrit `a-temps-egal.txt`.

Les deux comptent les parties avec `partiesJoueurs` (`ml/bot/mesures.js`), comme `etalon.js` et `ressemblance.js`. Mes chiffres recoupent `ml/ecurie/etude/humains.md`, à 2 s près sur les durées : la fin est prise à la mort, pas à l'explosion.

##### 1. Combien

| | Parties | Minutes | Paliers (triés) | Médiane | Record |
|---|---|---|---|---|---|
| Sacha (clavier) | 10 | 30,1 | 1 4 5 5 8 12 14 15 22 28 | 10 | 28 |
| Léo (doigt, navigateur du téléphone) | 4 | 10,7 | 1 11 16 21 | 13,5 | 21 |
| **Tous** | **14** | **40,8** | 1 1 4 5 5 8 11 12 14 15 16 21 22 28 | **11,5** | **28** |

- Les 4 fichiers donnent 21 morceaux. On écarte 3 doublons et 2 parties (l'auto-école et une partie quittée après 3,6 s), et on recolle 2 secondes chances (`sortie.txt`, ligne 1).
- Il y a **2 joueurs**, tous deux habitués. Aucun débutant.
- Toutes les parties sont en allégé (`ecran.tel=true`), avec la voiture **LA HONTE**, sur deux versions du jeu (60aa15e, ccdca9b) (`a-temps-egal.txt`).

##### 2. Partie par partie (`sortie.txt`)

| Joueur | Début | Durée (s) | Palier | Pièces max | Ramassées/min | Cause | Map de la mort | km/h au sol (moy.) | vmax | Nitro % | 2e chance |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S | 23/11 19:29 | 193,6 | 15 | 1529 | 474 | glace | grotte | 565 | 1536 | 56 | 0 |
| S | 19:32 | 63,4 | 5 | 275 | 260 | pic | jade | 411 | 882 | 64 | 0 |
| S | 19:33 | 545,1 | 28 | 4044 | 472 | paroi | canyon | 842 | 3624 | 53 | 1 |
| S | 19:43 | 65,1 | 5 | 289 | 266 | pic | jade | 438 | 1009 | 75 | 0 |
| S | 19:44 | 170,4 | 14 | 1390 | 490 | paroi | canyon | 539 | 1369 | 63 | 0 |
| S | 20:15 | 153,0 | 8 | 612 | 240 | air | nuages | 439 | 1635 | 65 | 0 |
| S | 20:18 | 51,8 | 4 | 198 | 230 | pic | jade | 405 | 906 | 72 | 0 |
| S | 20:19 | 156,8 | 12 | 1086 | 415 | roche | grotte | 494 | 1602 | 70 | 0 |
| L | 24/11 10:46 | 130,4 | 11 | 920 | 423 | roche | grotte | 466 | 870 | 71 | 0 |
| L | 10:48 | 237,0 | 16 | 1671 | 423 | roche | grotte | 474 | 1111 | 59 | 0 |
| L | 11:00 | 13,7 | 1 | 17 | 74 | vide | nuages | 198 | 247 | 0 | 0 |
| L | 11:00 | 261,6 | 21 | 2597 | 596 | air | espace | 539 | 1521 | 63 | 0 |
| S | 24/11 12:05 | 11,8 | 1 | 14 | 71 | air | ville | 183 | 239 | 0 | 0 |
| S | 12:06 | 396,1 | 22 | 2677 | 444 | tour | ville | 645 | 2247 | 64 | 1 |

- 13 parties sur 14 meurent en vol (`fall`). Seule la partie P28 meurt au sol (`sortie.json`, champ `en_vol`).
- **Les morts** (`a-temps-egal.txt`) : pic sur la jade 3, roche dans la grotte 3, paroi au canyon 2, puis 1 chacune pour glace, air (nuages, espace, ville), vide et tour.
- Les trois morts « pic sur la jade » sont les trois parties faibles de Sacha (P4, P5, P5).
- **Les instants des paliers** (s, `sortie.txt`, dernière colonne) :

| Palier | Instant où il tombe (s) |
|---|---|
| 5 | 39 à 95 |
| 10 | 114 à 172 |
| 15 | 182 à 246 |
| 20 | 247 à 347 |
| 25 | 409 (une seule partie) |

##### 3. D'où vient le palier : la survie, pas le style

Nombre de pièces = durée × rythme. Sur la variance de log(pièces), la **durée explique 63 %** (14 parties), et 72 % sur les parties de 60 s et plus. Le rythme explique le reste. La corrélation de Spearman entre palier et durée vaut 0,99 (`sortie.txt`).

Le rythme et la vitesse grandissent aussi avec le palier : ρ = 0,86 pour les pièces par minute, 0,96 pour les km/h au sol. Mais le jeu accélère avec le temps. **À temps égal, la différence disparaît** (`a-temps-egal.txt`, fenêtres de 60 s) :

| 1re minute | Pièces ramassées | km/h au sol | Nitro % |
|---|---|---|---|
| Parties faibles de Sacha (P5, P5, P8, P12) | 271, 272, 98, 259 | 409, 431, 374, 421 | 67, 74, 66, 82 |
| Parties fortes de Sacha (P14, P15, P22, P28) | 402, 149, 135, 198 | 415, 411, 413, 421 | 69, 67, 76, 81 |
| Léo (P11, P16, P21) | 338, 327, 324 | 421, 397, 393 | 76, 80, 78 |

Les P5 de Sacha ramassent **autant ou plus** la première minute que ses P22 et P28. La vitesse de la 1re minute est la même partout (374 à 431 km/h). Elle ne monte qu'avec la durée : 511 à 584 km/h la 2e minute, puis jusqu'à 831 km/h la 4e minute de la P28.

**Chez un même joueur, une partie faible est une partie qui meurt tôt** : sur un pic de la jade, en vol, avant 66 s. Elle n'est ni plus lente ni plus pauvre.

##### 4. Les 15 mesures de E et le niveau (`sortie.txt`, 11 parties de plus de 60 s)

ρ est la corrélation de Spearman avec le palier.

| Mesure | ρ tous | ρ Sacha | Lecture |
|---|---|---|---|
| nitro (part du temps) | **−0,75** | **−0,80** | Dépend de la durée : 72-78 % la 1re minute, moins ensuite (humains.md) |
| nitroSol | −0,61 | −0,67 | Même chose |
| dessous | 0,55 | 0,36 | Tient à Léo (P16 : 33 %) |
| ondulation | 0,39 | 0,44 | Faible |
| figures/min | −0,39 | −0,40 | Faible, très dispersé (0 à 7,4) |
| vols/min | 0,36 | 0,37 | Faible |
| vitesse (2 premières min) | 0,24 | 0,44 | Seule mesure à temps égal : 411 à 484 km/h |
| air, raccourcis | 0,20 ; 0,15 | 0,43 ; 0,49 | Faible |
| nitroDecol, volDuree, volHaut, volsCourts, poseCentre, aller | \|ρ\| ≤ 0,10 | | Aucun lien visible |

- Seules la **nitro** et la **nitroSol** suivent le niveau, et c'est surtout un effet de la durée de la partie.
- Les autres mesures sont des signatures du **joueur** (clavier ou doigt), pas du niveau. Exemple : la hauteur médiane d'un vol vaut 6 à 11 m chez Léo et 25 à 69 m chez Sacha.
- Tout cela repose sur 11 parties. Le moindre ρ porte une incertitude énorme : ce sont des indices, pas des lois.

**Conséquence.** La référence de E (`reference()` dans `ressemblance.js`) mêle des parties de 60 s et de 545 s. Un bot qui meurt tôt aura « trop » de nitro face à elle, et un bot qui dure en aura « trop peu ». **E ne dépend pas du niveau visé, mais certaines de ses mesures en dépendent.**

##### 5. Peut-on décrire « un joueur de palier 3, 10, 20 » ?

**Non.** On a des **parties** à ces paliers, pas des **joueurs** de ce niveau.

| Niveau | Ce qu'on a | Ce qu'on peut dire |
|---|---|---|
| P1 à P3 | 2 parties P1 (12-14 s, mortes sur la 1re route), aucune P2 ou P3 | Rien sur un joueur qui plafonne là : les deux P1 sont des faux pas de bons joueurs |
| P4 à P8 | 4 parties de Sacha (52-153 s) | « Sacha qui meurt vite » : 3 sur 4 sur un pic de la jade |
| P10 à P16 | 5 parties, 2 joueurs | Le niveau médian des deux joueurs |
| P20 à P22 | 2 parties, dont 1 avec seconde chance | Une partie de chaque joueur |
| P23 à P30 | 1 seule partie (P28, avec seconde chance) | Rien au-delà de 28, rien à P29-P30 |

Paliers sans aucune partie : 2-3, 6-7, 9-10, 13, 17-20, 23-27, 29-30.

Ce qu'on sait décrire, c'est **une seule courbe**, celle d'un habitué. Elle donne le rythme (≈ 150-400 pièces la 1re minute, puis 400-600 par minute), la vitesse au fil du temps et l'heure à laquelle tombe chaque palier (tableau du § 2). Un « bot de palier N » crédible, au sens de ces données, reste un habitué qui meurt à l'heure du palier N. Que les vrais joueurs faibles jouent autrement (moins de vols, moins de nitro, un autre slalom), **on ne le sait pas**.

Pour les « experts qui ne perdent jamais au palier 30 » : aucun humain observé n'y arrive. Le P30 demande 4 385 pièces, et la seule partie qui en approche est morte deux fois. **Aucune donnée de joueur ne peut étalonner ce haut de l'échelle.**

##### 6. L'enregistreur du jeu existe déjà (`code/moteur/enregistreur-jeu.js`)

- **Ce qu'il enregistre** : il est éteint par défaut. On l'allume par `?jeurec=1`, ou dans l'app par réglages, 5 touchers sur la version, boîte noire, PARTIES. Il prend 10 échantillons par seconde et note tous les événements : décollage, pose, pièce, mort et sa cause, changement de route.
- **Où il range** : seulement dans l'appareil (localStorage `ccJeuRec`). Il garde les **8 dernières parties et 1,6 Mo au plus**. Au-delà de 6 000 échantillons (10 min), il ne garde que la fin.
- **Comment Sacha récupère** : le panneau PARTAGER (un fichier `.json`) ou COPIER, puis il dépose le fichier dans `ml/bot/etalon/` et l'ajoute à `JOUEURS` dans `etalon.js` et au LISEZ-MOI.
- **Rien ne part vers un serveur.**

**Ce qui manque pour une échelle**, lu dans `jrNeuve` et absent de l'export :
- **qui joue** : aucun identifiant, l'attribution se fait à la main, fichier par fichier ;
- **le niveau du joueur au départ** : `SAVE.d.ex.eng` (son record), `SAVE.d.ex.runs` (son nombre de parties) ;
- la graine de la piste, déjà notée manquante dans `ml/bot/README.md` ;
- un événement « raccourci payé » ;
- l'appareil et le mode de contrôle exacts.

La sauvegarde compte déjà des morts par niveau (`ex.morts`, `ex.temps`, `code/sauvegarde.js:29`), jamais exportées.

**Combien de parties faudrait-il ?** C'est une estimation de ma part, pas une mesure. Les paliers de Sacha ont un écart-type d'environ 8 d'une partie à l'autre (1 à 28). Situer la moyenne d'**un** joueur à ±2 paliers près (95 %) demanderait donc environ 60 parties (1,96 × 8 / 2 ≈ 4, au carré ≈ 16 × 4). Pour étalonner une échelle, il faut ensuite plusieurs joueurs par tranche de niveau, débutants compris. Avec 3 à 5 joueurs par tranche de 5 paliers, on arrive à quelques dizaines de joueurs et à des centaines de parties. C'est hors de portée d'exports faits à la main 8 par 8.

##### Ce que cela impose à la conception de l'échelle

1. Le seul levier du niveau que les données montrent, c'est **l'instant et la manière de mourir**. Le rythme et la vitesse sont ceux d'un habitué à temps égal. Un bot de palier N doit ramasser comme eux et mourir vers l'heure du palier N (§ 2).
2. La mort doit entrer dans la note. Aujourd'hui E n'en contient aucune mesure. Les causes et les maps de mort des joueurs (pic sur la jade pour les parties courtes, grotte, canyon et ville pour les longues) sont la seule référence, et elle tient en 14 morts.
3. E doit se comparer **à durée égale** (référence par fenêtre de temps, ou parties de durée voisine). Sinon la nitro pénalise à tort les bots courts et les bots longs.
4. Les niveaux 1 à 3 et 23 à 30 ne s'étalonnent pas sur des joueurs. Les experts du palier 30 sont un objectif de jeu, pas d'imitation : il faut l'écrire comme tel.
5. Avant toute échelle « humaine » au-delà d'une courbe d'habitué, il faut ajouter à l'enregistreur un identifiant anonyme, le record et le nombre de parties du joueur, et la graine, puis faire jouer beaucoup plus de joueurs. C'est une modification du jeu, donc une décision pour Sacha.
6. Tant que ce n'est pas fait, chaque niveau doit porter la mention : « extrapolé de 2 joueurs habitués, 14 parties ».


## 2. lire:palier

*Rôle : lecteur « palier » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

#### Le palier : de quoi il est fait, et ce que demande le palier 30

Je n'ai joué aucune course. J'ai seulement lu des fichiers. Mes scripts et leurs sorties sont dans `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/palier/` :
- `lire-banc.js` : les distributions ;
- `debit-et-survie.js` : le débit selon la durée et le risque de mort par minute ;
- `vitesse-et-parfait.js` : la vitesse par palier et le pilote parfait, un calcul sur les formules.

Chaque script a sa sortie à côté, dans `sortie-*.txt`. Il n'existe aucun fichier `ml/ecurie/agents/*/note-*.json`.

##### 1. Les 30 seuils et ce que change chaque moteur

Sources : `code/gameplay/pickups-fruits.js:557`, `engLate` dans `code/gameplay/camera.js:317`, `maxSp` dans `code/moteur/boucle-1.js:183`, `SPD=0,48`.

Le palier se lit dans `coinsGot`. Une pièce vaut 1. Une figure posée vaut de 2 à 18 pièces (voir `ml/ecurie/etude/economie.md`). Aucune autre source ne compte. La vitesse de pointe vaut `push × engLate`. `engLate` ajoute 3,5 % par palier dès le palier 10, avec un plafond de +50 %. La croisière vaut environ 2,75 × maxSp, sans nitro.

| palier | seuil | push | facteur vitesse | croisière (m de piste/s ; = km/h affichés ÷ 3,6) | m parcourus en 0,45 s |
|---|---|---|---|---|---|
| 1 | 0 | 1,00 | 1,00 | 70 (251 km/h) | 31 |
| 5 | 225 | 1,26 | 1,26 | 88 | 40 |
| 7 | 400 | 1,42 | 1,42 | 99 | 45 |
| 10 | 730 | 1,68 | 1,74 | 121 (436 km/h) | 55 |
| 15 | 1 430 | 2,21 | 2,67 | 186 | 84 |
| 20 | 2 255 | 2,85 | 3,95 | 275 (990 km/h) | 124 |
| 25 | 3 240 | 3,60 | 5,40 | 376 | 169 |
| 30 | 4 385 | 4,20 | 6,30 | 439 (1 580 km/h) | 198 |

La table complète des 30 paliers est dans `sortie-vitesse-et-parfait.txt`. La liste des seuils est :

0, 40, 85, 150, 225, 305, 400, 505, 615, 730, 860, 995, 1130, 1280, 1430, 1585, 1745, 1910, 2080, 2255, 2440, 2630, 2825, 3030, 3240, 3455, 3680, 3910, 4145, 4385.

La réserve de nitro passe de 2,0 à 3,6. L'aimant moteur arrive au palier 16. Le contrôle des ordres de grandeur tient :
- la référence fait 8 108 m/min, soit 135 m/s, autour de la croisière du palier 11 ;
- les joueurs font 11 167 m/min, soit 186 m/s, la croisière du palier 15 avec 61 % de nitro (`passation/BOTS-ML.md`).

##### 2. Pièces par minute qu'il faut

| palier | en 5 min | en 10 min | en 15 min | en 30 min |
|---|---|---|---|---|
| 10 | 146 | 73 | 49 | 24 |
| 20 | 451 | 226 | 150 | 75 |
| 30 | 877 | 439 | 292 | 146 |

##### 3. c0025 dans le banc des genes

Source : `ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl`. Le bras « depart » compte 96 courses. Les 1 250 courses couvrent 13 bras plus 2 contrôles.

| mesure | c0025 (96) | les 1 250 |
|---|---|---|
| palier moyen / médian | 6,83 / 7 | 6,84 / 6 |
| palier q10 – q90 / max | 3 – 11 / 14 | 3 – 11 / 19 |
| survie médiane (moyenne) | 123 s (122,8) | 120 s (126,1) |
| survie q90 / max | 220 / 286 s | 227 / 444,5 s |
| pièces/min (somme ÷ somme) | 226,6 | 225,0 |
| coupées par les 900 s | **0** | **0** |
| courses avec seconde chance (morts > 1) | 7 | 104 |

Paliers de c0025, en nombre de courses :

| palier | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| courses | 2 | 2 | 10 | 9 | 11 | 13 | 13 | 7 | 9 | 9 | 4 | 3 | 3 | 1 |

Le débit monte avec la durée. Pour c0025, il vaut 218/min sur les courses de moins de 60 s et 256/min sur celles de 240 à 300 s. Une minute de plus rapporte environ 281 pièces : c'est la pente des moindres carrés sur les courses de plus de 60 s, avec pièces ≈ −128 + 281 × minutes. Sur les courses de plus de 180 s, toutes bras confondus, cette pente vaut 314.

Le risque de mourir dans la minute monte vite :

| minute | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| c0025 | 18 % | 35 % | 69 % | 56 % | 100 % (7 courses) |
| les 1 250 | 20 % | 38 % | 60 % | 62 % | 68 % |

**Le palier de c0025 est borné par la mort.** Le temps ne le borne pas : aucune des 1 250 courses n'atteint 900 s, et la plus longue dure 444,5 s. Le débit ne le borne pas non plus : il faudrait 151 pièces/min pour le palier 30 en 30 min, et c0025 en fait 227.

**Sans limite de temps, le palier ne change pas**, puisque la limite ne coupe rien. Si c0025 ne mourait jamais et gardait son débit marginal de 281/min, il atteindrait :
- le palier 20 vers 8,5 min ;
- le palier 30 vers 16,1 min ;
- à 226,6/min constant, le palier 30 vers 19,4 min.

Aucune course de c0025 ne dépasse 5 min. Sur les 1 250 courses, 2 seulement dépassent 7 min, soit 0,16 %. Ce que valent son débit et sa survie au-delà de 5 min : on ne sait pas.

À titre de comparaison, les joueurs ramassent 400 à 590 pièces/min une fois lancés, 416 sur l'ensemble (`ml/ecurie/etude/humains.md`). Ils franchissent le palier 20 vers 247 à 349 s et le palier 25 vers 408 s. Leur record est le palier 28, en 548,8 s, avec une seconde chance. c0025 meurt à peu près au même rythme qu'eux, mais ramasse environ deux fois moins par minute. **Sa marche vers le haut est donc limitée deux fois : il meurt aussi tôt qu'eux et ramasse moitié moins.**

##### 4. La pièce la plus rentable

Source : `economie.md`, qui renvoie au code. Je n'ai pas remesuré.

- Depuis le 15/11, aucune pièce n'est posée en l'air ni sur les raccourcis.
- En vol, on n'accroche que les pièces de la route à moins de 11 m (14 m avec l'aimant moteur, 50 m sous la pomme dorée). **Un vol ou un raccourci rapporte donc 0 pièce**, sauf sous la pomme dorée. Il rapporte seulement les 2 à 18 pièces de la figure posée.
- La densité de pièces ne dépend pas de la map. Elle dépend des portails franchis : 55, 97, 141, 188, 237, puis 240 pièces/km au plafond.
- La part ramassée par c0025 selon la ligne : on ne sait pas, ce n'est pas dans les lignes du banc. Le champ `mesures` y vaut null.

##### 5. Le pilote parfait qui ne meurt jamais

Ce n'est pas une mesure, c'est un calcul :
- croisière du palier courant, sans nitro et sans figures ;
- densité qui suit les portails ;
- longueur d'une zone **non lue dans le code** : 7 ou 11 km, hypothèses de `economie.md`.

| part des pièces ramassée | zones de 7 km : P10 / P20 / P30 | zones de 11 km : P10 / P20 / P30 |
|---|---|---|
| 100 % | 2,0 / 3,1 / 3,6 min | 2,3 / 3,6 / 4,3 min |
| 50 % | 3,2 / 4,8 / 5,6 min | 3,8 / 5,7 / 6,6 min |
| 25 % | 5,0 / 7,5 / 9,1 min | 5,9 / 8,7 / 10,4 min |

**Le palier 30 est donc atteignable en 4 à 10 minutes par un pilote qui ne meurt pas**, bien avant 900 s. Les pièces posées ne manquent pas. Au plafond, il y a environ 6 300 pièces/min sur la route au palier 30, et environ 1 700/min au palier 10.

##### 6. La main tient-elle à la vitesse du palier 30 ?

La main clavier (`ml/bot/doigts.js:113`) a :
- une décision toutes les 100 ms ;
- une réaction du volant de 120, 200 ou 320 ms ;
- un retard du suivi de 150 ms.

Cela fait environ 0,45 s du regard à la touche pour la réaction médiane. Sur ce délai, la caisse avance 45 m au palier 7, 124 m au palier 20 et 198 m au palier 30.

- **Les virages s'agrandissent avec le palier** (`lvPiste`, ×1 à ×4,4, construits pour le palier + 2). Le temps pour traverser un virage (rayon ÷ vitesse) ne baisse que d'environ 30 % du palier 7 au palier 30 : de ×1,41/99 à ×4,4/439. Mon calcul est fait sur `camera.js:321`.
- **Ce qui ne s'agrandit pas devient ingérable** : la demi-route de 28 m, et une portée de 40 m citée dans `yeux.js:457`. Traverser 40 m prend 0,40 s au palier 7 et 0,09 s au palier 30, moins que la main. L'étude « sortie préparée » donne déjà un bord annoncé 0,28 s avant le décollage pour une main de 0,2 s, et cela aux paliers actuels.
- Si les pics, les trous et les parois grandissent avec le palier : on ne sait pas, je ne l'ai pas lu.
- **Un humain a conduit au palier 28**, soit 1 512 km/h de croisière, avec une seconde chance. Cette main n'est donc pas trop lente en soi pour un joueur. Rien ne prouve qu'un pilote à 0,45 s puisse y rouler sans jamais mourir.
- Le risque de c0025 monte de minute en minute (18 %, puis 35 %, puis 69 %). Est-ce la vitesse du palier, la map ou le portail ? Les lignes du banc ne permettent pas de le séparer : on ne sait pas.

##### Ce que cela impose à la conception de l'échelle

1. Pour l'échelle humaine, le levier est l'instant de la mort, pas la limite de temps. Les 900 s ne coupent rien. Un bot « palier N » se règle par sa survie, avec un débit humain : environ 220/min la première minute, puis 400 à 600.
2. Le débit de c0025 (227/min) est deux fois plus bas que celui des joueurs. Avec lui, un bot « palier 20 » devrait survivre 8,5 min au lieu de 4 à 6. Il serait discernable et trop long. Il faut doubler la part ramassée avant de copier la survie.
3. Il faut une mesure de la mort dans la note, comme la survie ou le risque par minute. E n'en a aucune. F = palier − 4E récompense la survie sans la caler sur un niveau humain.
4. Pour les experts, il n'y a ni barrière de temps ni barrière de pièces : un pilote qui ne meurt pas atteint le palier 30 en 4 à 10 min. Tout le problème est la survie à une caisse 4 à 6,3 fois plus rapide.
5. Les experts demandent soit une main plus rapide que 0,45 s, ce qui n'est plus « comme un joueur », soit des yeux qui anticipent en secondes et non en mètres. Il faut d'abord mesurer de quoi meurt c0025 en fonction du palier, sur des courses partant d'un palier imposé (TEST_PAL).
6. Une échelle de 1 à 30 ne peut pas sortir d'une sélection qui cherche un seul champion. Il faut une note par case de palier, ou une cible de survie par niveau.

## 3. lire:selection

*Rôle : lecteur « selection » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

#### La sélection face à une échelle et à des experts (lecteur de la sélection, 28/11)

Je n'ai lancé aucune course ni aucun test. J'ai seulement lu des fichiers. Mes scripts et leurs sorties sont dans `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/selection/` :
- `champs-des-lignes.js` (sorties `.txt` et `-banc.txt`) ;
- `palier-et-pieces.js` ;
- `bruit-par-niveau.js` ;
- `generations-ryzen.js`, qui lit `git show origin/evolution-ryzen:ml/evolution/etat/generations.jsonl` ;
- `genes-par-endroit.txt`.

Rien n'est commité.

##### 1. Où se calcule F, et peut-on la recalculer sans rejouer ?

- **Le calcul.** F est calculée dans `ml/evolution/note.js`, par `noter()` : F = â − 4·E.
  - â vient du modèle « pilote + graine », ajusté sur le palier, puis rétréci.
  - La survie est ajustée par le même modèle (`fit.survie`). Elle ne sert qu'à départager au renvoi (`evoluer.js` l. 882-883).
  - `evoluer.js` l'appelle par `noterTous()` sur `ctx.lignes`. Ce sont toutes les lignes mesurées « entraînement » de l'époque des courses, **morts compris** (`chargerLignes`, l. 242).
- **Deux époques distinctes** (`courses.js` l. 46-48) :
  - `courses` est l'empreinte du jeu, du simulateur, de node, du régime, des réseaux et des fichiers de `FICHIERS_EPOQUE` ;
  - `note` = sha(courses + étalon + `cfg.note`).
  - **`note.js` n'est pas dans `FICHIERS_EPOQUE`** (`commun.js` l. 251). On peut donc changer le code de la note sans changer aucune époque. Changer `cfg.note` ne change que l'époque des notes ; `preparer()` le dit : « les courses restent valables » (l. 571-575).
  - En revanche, `ressemblance.js`, `mesures.js`, `modele.js` et `enfant.js` sont dans l'époque. Toucher l'un d'eux fait rejouer **tout**.
- **Ce que garde une ligne** (`courses.js` CHAMPS ; lu sur 1 823 lignes d'études, plus 105 du banc) :

| Champ | Présent | Remarque |
|---|---|---|
| palier, pieces, survie_s | 100 % | palier max vu : 20 (1 823 lignes) |
| cause | 100 % | la cause de la mort **qui a fini** la course |
| morts | 100 % | ce sont les morts **en vol** (`b.morts_en_vol`), pas les morts |
| mesures (15) | 78-81 % | absentes sous 60 s |
| causesMorts, cartes, declenchements, chancePrise | lignes « gènes v4 » seulement | **absentes sur le Ryzen** |

- **Le Ryzen tourne sans les gènes v4.** Les commits 77083d123 et d30db9519 ne sont pas dans `origin/evolution-ryzen`, et son `courses.js` ne contient pas `causesMorts`. Ses lignes n'ont donc ni la carte, ni la cause de chaque mort.
- **Aucune course n'atteint tmax.** Sur les 1 823 lignes, 0 va jusqu'à 900 s. La survie maximale est de 461,7 s. Une course finit à la première mort, ou à la seconde avec la seconde chance.
- **Le cache est sur le disque du Ryzen seulement.** Les `courses-*.jsonl` ne sont pas dans git. Le recalcul se fait donc là-bas, en lecture : une ligne tronquée en fin de fichier est ignorée. Le cache ne remonte qu'à la génération 16, quand l'époque a changé en 3c3d44e8bd9b.

##### 2. Ce que coûterait une seconde note

| Note | Nouvelle époque de note ? | Courses rejouées ? | Effort |
|---|---|---|---|
| « palier seul » (poidsEcart 0) | oui si elle remplace `cfg.note` ; non si on la calcule à côté | non | simple : `note.noter` avec un autre cfg |
| « survie seule » | idem | non | simple : `ajuster().survie` existe déjà |
| un taux de mort comme les joueurs (morts / minute, cause), calculé dans `note.js` depuis `survie_s` et `cause` | oui (`cfg.note`) | non, si on ne touche pas `ressemblance.js` | moyen : il faut la référence des joueurs pour la mort (humains.md, avant-le-bord) |
| la même chose ajoutée aux 15 mesures de `ressemblance.js` | époque des **courses** | **toutes** | lourd |
| « ne perd jamais au palier 30 » | — | nouvelles courses (tmax est dans la clé) | lourd ; impossible aujourd'hui, voir plus bas |

Pourquoi la note « palier 30 » est hors de portée aujourd'hui :
- Le palier 30 demande 4 385 pièces (`mesures.SEUILS`).
- Les bots ramassent 3,7 pièces/s en médiane et 4,8 au 90e centile. En 900 s, cela fait le palier 25, et 29 au 90e centile (`palier-et-pieces.txt`).
- Les joueurs ramassent environ 420 pièces/min, soit 7/s (humains.md l. 10). Pour eux, le palier 30 arrive vers 630 s.

Une note d'expert demande donc un tmax plus long, qui crée de nouvelles clés, et un pilote qui ramasse plus vite. On ne sait pas si le simulateur peut démarrer une course au palier 30.

Pour faire **deux notes à la fois**, il faut toucher `evoluer.js` : le renvoi, le tournoi, le meneur et la validation ne lisent qu'un seul `fDe`. `evoluer.js` n'est pas dans l'époque, donc ce changement ne fait pas rejouer.

##### 3. Plusieurs îles, ou plusieurs niches

**Tout suppose un seul champion :**
- `population.json` a `champion`, `temoin`, `derniereValidation`, `sansSacre` et `phase` uniques ;
- les greffes partent du champion (`greffes.js`) ;
- le coffre compare champion et témoin (`coffre()`) ;
- la validation compare meneur et champion ;
- les pages en dépendent : `champion` apparaît 46 fois dans `tableau.js`, 42 dans `histoire.js`, 30 dans `arbre.js` et 9 dans `etat.js`.
- `etat.js` rejette tout `population.json` dont le format n'est pas `evolution-population-1`. Le résumé et les pages tombent alors.

**Le coût par île.** Il faut μ + λ = 26 pilotes × 12 graines = 312 courses par génération. Le Ryzen tient 373 à 495 courses/h selon les générations, environ 420 en général : une génération prend 38 à 55 min (`generations-ryzen.txt`). Il faut aussi, par île, une validation (24 à 96 graines × 2 pilotes) et un coffre toutes les 24 h (40 × 2). Avec 5 îles, une génération prendrait environ 3,7 h.

**Le témoin.** c0025 tourne au palier 6,8. Il ne peut ancrer qu'une île du milieu. Les autres niveaux n'ont pas de pilote écrit à la main pour la génération 0 ni pour le contrôle d'identité.

**La diversité actuelle est étroite.** À la génération 17, â va de 6,39 à 8,16 sur 26 vivants. L'échelle 1-30 est loin hors de ce que la population contient.

**Le moins lourd** est une note « de niche » dans une seule population : chaque pilote est jugé contre le niveau le plus proche. C'est surtout du code dans `evoluer.js` et `note.js`, mais le risque est qu'un niveau absorbe les autres.

**La référence des joueurs ne suffit pas pour une note par niveau.** E compare chaque bot à **une seule** référence : 14 parties de 2 joueurs, médiane au palier 11,5, sans aucune partie aux paliers 2-3, 6-7, 9-10, 13, 17-20, 23-27 et 29-30 (humains.md l. 8 et 19). Une note E par niveau n'a pas de joueurs à quoi se comparer.

##### 4. Les gènes qui règlent le niveau sans toucher au style

Il n'y en a **aucun** aujourd'hui (`genes-par-endroit.txt`) :
- 99 gènes R, 14 G, 15 de cartes, raccourcis et retours : tous règlent à la fois le style et le niveau (marge, nitroDecor, braque…).
- Le seul gène du PROFIL est `chancePalierMin` (12). Il est **figé** : `genome.js` l. 160 et 231 l'imposent.
- La main est entière à `modele:'clavier'` (MAIN_CLAVIER, `doigts.js` l. 113) : réaction, suivi, coups, erreurs. Elle n'est **pas dans le génome**.
- `doigts.js` a déjà des bornes : réaction 0-1 000 ms par canal, `erreur.manque`, `retard`, `sur` et `bruit` de 0 à 0,5, `parasite` de 0 à 20 (l. 91-98).

En faire des gènes veut dire un génome v5 et un PROFIL lu dans `modele.js`. C'est une nouvelle époque des courses : tout est rejoué, et il faut un contrôle d'identité.

Le temps de réaction des joueurs n'est **pas mesuré** (`doigts.js` l. 77). Ce réglage n'aurait donc rien pour le tenir. L'étape D d'`ETAPES.md` prévoyait déjà ceci : régler le niveau par la survie, la réaction et les erreurs, hors de la sélection.

##### 5. La puissance statistique

- Le bruit par course (sigmaRes) vaut 2,47 à 3,06, environ 3,0 (`generations.jsonl`). Le se_F médian de la population est de 0,46 à 0,85.
- **Le bruit grandit avec le niveau.** Sur 59 pilotes d'au moins 12 courses, l'écart-type entre graines vaut 2,4 au palier moyen 5, 3,3 entre 6 et 7, 3,8 entre 7 et 8 et 4,1 au-dessus de 8. Le coefficient de variation reste environ 0,5 (`bruit-par-niveau.txt`). Le modèle additif de `note.js` suppose pourtant un bruit égal partout.

| Courses par pilote | Rapport reconnaissable entre deux niveaux (cv 0,5) | Niveaux tenables de 1 à 30 | Pilotes notés par jour à 420/h |
|---|---|---|---|
| 12 | 1,50 | 9 | 840 |
| 24 | 1,33 | 12 | 420 |
| 48 | 1,23 | 17 | 210 |
| 96 | 1,16 | 24 | 105 |

Ces chiffres sont extrapolés : aucun pilote n'est mesuré au-dessus d'un palier moyen de 9. Avec un bruit de ±0,7 sur F en 12 graines, deux niveaux voisins doivent être séparés d'environ 2 paliers (2·√2·0,7). Cela fait environ 9 niveaux distincts en 12 graines, et environ 12 en 24.

##### 6. Ce qui est simple, lourd ou dangereux

**Simple** (en lecture, sans rien rejouer) : recalculer â, la survie, le palier seul ou un taux de mort depuis le cache du Ryzen avec `note.noter`. Aussi : classer les vivants et les morts (leurs génomes sont dans `morts.jsonl`) par niveau, pour voir l'échelle que la sélection a déjà produite par hasard.

**Lourd :**
- les îles (le code et les cinq pages) ;
- les gènes de la main (génome v5, nouvelle époque) ;
- une note expert avec un tmax plus long ;
- une référence des joueurs par niveau, qui demande de nouvelles parties enregistrées.

**Dangereux pour l'état du Ryzen :**
- **Changer `cfg.note` sur l'état en marche.** L'époque des notes change sans prévenir et les renvois suivants obéissent à la nouvelle note. Un renvoi ne se défait pas.
- **Toucher l'un des fichiers de `FICHIERS_EPOQUE`.** Tout est rejoué, l'identité est contrôlée, il faut une revalidation et un coffre. La génération 16 a ainsi rejoué 352 courses sur 352.
- **Changer le format de `population.json`.** `etat.js`, `resume.txt` et les pages tombent.
- **Faire tourner une seconde population dans le même dossier.** La parade est un `dossierEtat` **et** un `dossierChampions` séparés, car le verrou est par dossier et les champions sont nommés `gNNNN-sha`. Même alors, deux maîtres se partagent le débit, et `refusDePartir` ne vérifie que `boucle.js`.
- **La fusion des gènes v4, encore à faire sur le Ryzen**, ouvrira de toute façon une nouvelle époque. C'est le moment le moins cher pour y mettre aussi une nouvelle note.

##### Ce que cela impose à la conception de l'échelle

1. Le niveau ne peut pas venir de F. Il faut une note par niveau, ou une niche autour de chaque palier visé. Ce code va dans `note.js` et `evoluer.js`, hors époque, et se met en place avec la fusion des gènes v4.
2. Pour que les bots meurent comme un joueur, il faut une mesure de la mort ajoutée à la note. On peut la calculer depuis `survie_s` et `cause` sans rejouer, mais la référence des joueurs ne couvre que 14 parties.
3. Le levier qui change le niveau sans changer le style, c'est la main (réaction, erreurs). Elle n'est pas dans le génome. L'ajouter crée une nouvelle époque, et le temps de réaction des joueurs n'est pas mesuré.
4. Les experts du palier 30 demandent un tmax supérieur à 900 s et un ramassage plus rapide que celui des bots actuels (3,7 pièces/s contre 7 pour les joueurs). Aucune course mesurée n'a dépassé 462 s.
5. Il faut compter environ 9 niveaux distincts à 12 graines et environ 12 à 24, en espaçant les niveaux de façon géométrique, puisque le bruit vaut environ la moitié du palier.
6. Les îles se testent dans un état séparé (un dossierEtat et un dossierChampions propres), jamais en migrant le `population.json` du Ryzen.

## 4. lire:existant

*Rôle : lecteur « existant » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course. Phase : Comprendre. Modèle : claude-opus-5-5.*

#### L'existant : niveaux, matchmaking, experts (lecteur de l'existant, 28/11/2026)

Dossier : `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/existant/`. Il contient deux scripts en lecture seule, `paliers-du-labo.js` et `etendue-population.js`, leurs sorties `sortie-*.txt`, et deux copies des fichiers d'état du Ryzen prises sur `origin/evolution-ryzen` au commit `f8c071fa0` (28/11, 15 h). Aucune course n'a été jouée et rien n'a été commité.

##### 1. Ce que Sacha a dit (daté, et où c'est écrit)

| Date | Ses mots | Où |
|---|---|---|
| 24/11 | « des bots qui peuvent faire des matchmaking du record de palier 1 au palier 30, et qu'on ne puisse pas faire la différence entre eux et des vrais joueurs. Les joueurs qui ne sont pas forts doivent avoir des bots de leur niveau, et les très bons joueurs aussi. » | `ml/ecurie/PLAN.md` l.3-5 ; journal `2026-11-24.md` l.56 |
| 26/11 12:11 UTC | « on ne peux pas du tout faire la diff entre un bot et un vrai jouer » | `ml/ecurie/agents/tmp-voltige/paroles-sacha.md` |
| 26/11 12:00 UTC | « fait les bots les plus realisee possible » | même fichier |
| 27/11 15:25 UTC | « […] mon objectif d'avoir les meileur bots possible » (c'est la demande de la sélection naturelle) | même fichier |
| 28/11 | « bah oui il doit mourir comme un joueur mais il faut aussi des pilote expert qui ne peuvent pas perdre du tout au palier moteur 30 il faut differnt niveau de bot qui permetent un match makin adapté au niveau de chaque joueur » | `etude/avant-le-bord/LISEZ-MOI.md` § 6, l.357 (modifié, pas encore commité) |

Avant le 28/11, il n'avait jamais demandé de pilote « qui ne perd pas ». `PLAN.md` § 4 disait même l'inverse : « Garantir le palier 30 […] Le plafond atteint sera mesuré et dit, pas promis. »

##### 2. Ce qui a été promis, et ce qui existe

| Promis (ETAPES.md, PLAN.md) | État réel |
|---|---|
| D : `ml/ecurie/profils/` avec 30 profils, plus `echelle.json` et `echelle.js`. Le niveau N est le profil dont le **meilleur palier sur 20 parties** vaut N (ETAPES l.853-861) | « à faire ». Aucun de ces fichiers n'existe (vérifié avec `ls`) |
| E : chaque niveau passé devant `discerner.js` (AUC, mesure qui trahit) | « à faire » |
| F : `ml/ecurie/paquet/`, avec pour chaque palier ses pilotes, leurs chiffres et des courses toutes prêtes (rejeux, trajectoires) rejouables en fantôme (l.878-883) | « à faire ». `paquet/` n'existe pas, `ml/labo/jalons/` non plus |
| Les garages par niveau : figures de débutant au palier 5, figures chères au palier 25 (PASSATION l.405) | Pas fait. Le bot joue toujours la sauvegarde neuve SAVE0 (`etude/record.md` l.63) |
| Le budget D+E, 60 € (ETAPES l.777) | Non dépensé pour D ou E |

Ce qui existe et pourrait servir au paquet :
- **116 rejeux** (`ml/labo/rejeux/`) et **139 trajectoires** (`ml/labo/trajectoires/`). Ce sont les courses gardées du labo, presque toutes des pilotes de palier 5 à 13.
- Des films `.webm` (`ml/labo/videos/`).

##### 3. Les pilotes connus et leur palier mesuré

Tout est en régime allégé. Sources : `ml/labo/journal/cerveaux.jsonl` et `validations.jsonl`, lus par `paliers-du-labo.js`. Pour le Ryzen : `generations-ryzen-f8c071fa0.jsonl` et `resume.txt`. Pour le coffre : `etude/boucle-payante-ryzen/coffre/sorties/resume.txt`.

| Pilote | Lot | Palier médian | Record | E | Courses | Époque / jeu |
|---|---|---|---|---|---|---|
| c0002 référence | régime max, 300 s | 10 | 20 (plafonné par le temps) | — | 20 | cashcar-v1627 |
| c0003 = pilote.js | 900 s, graines 910000 | 11 | 20 | — | 20 | id. |
| c0011 (Sonnet) | 900 s | 13 | 19 | — | 20 | id. |
| c0011 | validation, graines 950000 | 10,5 | 18 | — | 20 | id. |
| c0023 | tri 600 s | 7,5 | **21** (le plus haut d'un bot) | — | 6 | id. |
| c0025 (témoin) | 900 s | 7,5 | 14 | 1,666* | 20 | id. |
| c0025 | validation | 4 | 9 | — | 20 | id. |
| c0025 | coffre | 5 (moyenne 6,15) | 14 | 0,910 | 40 | 66f66d2ae1c2 |
| c0025 | Ryzen, gén. 17 | moyenne 6,77 (pas de médiane) | — | 0,78 | 24 | 3c3d44e8bd9b |
| c0026 | 900 s / validation / coffre | 8 / 4 / 5 | 17 / 14 / 13 | 1,581* / — / 0,947 | 20 / 20 / 40 | — |
| c0064 | id. | 8 / 6 / 5 | 14 / 16 / 18 | 1,577* / — / 0,836 | id. | — |
| c0072, c0087 | 900 s / validation | 8 / 6 | 19 et 14 / 16 | 1,57* et 1,531* | 20 / 20 | — |
| c0101 | 900 s / validation / coffre | 8 / 6 / 5 | 14 / 16 / 13 | 1,525* / — / 0,847 | 20 / 20 / 40 | — |
| c0093 (le plus faible noté) | tri 600 s | 5 | 7 | — | 6 | — |
| Joueurs (étalon) | 14 parties | 11,5 | 28 | 0 par définition | 14 | — |

\* Les E marqués d'une étoile sont l'ancien « écart aux joueurs » du labo (`note.ecart_joueurs`). Ce n'est pas le même calcul que l'E de la sélection : pour c0025, le coffre donne E 0,910 et un « écart classique » de 1,797. On ne peut pas comparer les deux colonnes.

Paliers des joueurs (`etude/humains.md` l.8) : 1, 1, 4, 5, 5, 8, 11, 12, 14, 15, 16, 21, 22, 28. Aucun débutant. Aucune partie aux paliers 2-3, 6-7, 9-10, 13, 17-20, 23-27 ni 29-30.

**L'échelle est-elle déjà en partie couverte ? Non.**
- La population du Ryzen est très serrée. À la génération 17, le palier moyen des 20 vivants notés va de **6,39 à 8,16**. Il reste entre 5,8 et 9,0 sur les 18 générations (`sortie-etendue-population.txt`).
- La génération zéro n'est pas une population faible : ce sont des mutants du témoin, entre 6,57 et 8,19.
- Chaque pilote couvre une large plage selon la graine (c0025 : de 2 à 14 en une note). Mais tous ont le même centre, entre 5 et 8.
- Le plus haut palier jamais atteint par un bot est 21 (c0023, une course). Aucun bot n'a atteint 22 ni plus, et le palier 30 n'a jamais été atteint.
- Les pilotes de la boucle payante (c0003 à c0024) sont un peu plus hauts, avec une médiane de 11 sur 900 s. C'étaient des pilotes plus prudents, sans le critère de ressemblance : CONSIGNES.md l.64 dit qu'un tel pilote est « un mauvais pilote ici ».
- Il n'existe aucun bot faible voulu (paliers 1 à 4), et aucun profil « réaction lente, erreurs » réglé. La main a ces boutons (`profil`), mais ils ne sont pas réglés par niveau : CONSIGNES l.136 les renvoie « plus tard ».

##### 4. Comment un bot servirait dans le jeu aujourd'hui

**Rien n'est branché, aucun bot de `ml/` n'entre dans le jeu.** Le matchmaking ne peut se faire que sur l'appareil :
- Il n'y a aucun serveur. Le classement mondial a été retiré le 30/09 (`code/gameplay/evenements-rares.js` l.207, « enlève le truc de classement mondial »).
- Le Top 10 (`SAVE.d.leaders`) reste dans l'appareil.
- Le niveau du joueur se lit dans `SAVE.d.ex.eng` : c'est son record, un index de 0 à 29 (`etude/record.md` l.7, 18, 25).
- `record.md` l.18 prévient : il faut ranger un joueur sur son palier typique, pas sur son record. Or le jeu ne garde pas l'historique de ses parties.

Il existe déjà un mode à plusieurs, avec des adversaires scriptés : le **MODE SURVIVANT v2** (`code/interface/menu-logo.js` l.164-189 ; `code/rendu/kit-lumiere.js` l.74, 161, 408).
- Sept voitures de police roulent sur une simulation 1D le long de la piste.
- Chacune a une personnalité réglée par quatre valeurs (`SURV_PILOTS` : agressivité, fréquence des fautes, temps de réaction, propreté de la ligne).
- Le **classement se fait à la distance** : « Le classement = la DISTANCE parcourue ».
- Toutes les 60 s, un couperet fait exploser le dernier, jusqu'à « CHAMPION ! » ou « LA MEUTE EST AU TAPIS » (`zones-caisses.js` l.480, 490).
- Une condition de déblocage de voiture en dépend : « GAGNER UNE PARTIE EN MODE SURVIVANT » (`achat-carte-moteur.js` l.45).
- Un profil appris du joueur, `AIP`, est encore écrit à chaque fin de partie (`SAVE.d.ai`).
- Les études du 24/11 disent ce mode « retiré de l'interface » (`record.md` l.65 ; `conduite.md` l.74). Pourtant le bouton `#survBtn` et les entrées « surv » des menus sont encore dans le code. Je n'ai pas vérifié s'il est visible, et `record.md` l.84 ne l'a pas vérifié non plus.
- Ses voitures roulent avec l'ancienne loi de direction, sans ramassage (`conduite.md` l.74).

Pour qu'un fantôme roule sur la même route que le joueur (`record.md` l.23-24), il faut :
- une graine commune (`?pistegraine`) ;
- la mémoire du sac coupée ;
- le même régime que le joueur ;
- un enregistreur qui note aussi la graine, le palier et les figures (aujourd'hui il ne note ni la graine, ni les figures, ni le palier).

**Ce que « ne peut pas perdre » peut vouloir dire.** Le jeu n'a pas de course gagnée contre un autre joueur, hors du Survivant. La partie finit à la mort, et le palier se gagne en pièces ramassées, plafonné au palier 30 (TROU NOIR, 4 385 pièces, environ 10 min et demie à 420 pièces par minute : `PLAN.md` l.23, 34). Trois lectures sont possibles, et aucune n'est écrite par Sacha :
- (a) atteindre le palier 30 sans jamais mourir, jusqu'à la fin de la course (« survie ») ;
- (b) ne jamais être le dernier au couperet du Survivant (« distance ») ;
- (c) finir devant le joueur à la distance ou à l'argent.

Dans les mesures, une course arrêtée par `tmax` est « coupée » : sa survie est un plancher, pas une mesure (`ml/bot/mesures.js` l.152-155). Avec `--tmax 900`, la note ne peut pas distinguer « ne perd jamais » de « a tenu 15 min ».

##### Ce que cela impose à la conception de l'échelle

1. Il faut créer de la variété de niveau. Elle n'existe pas : tous les bots connus ont un centre entre 5 et 8. Rien ne couvre les paliers 1 à 4 de façon voulue, ni les paliers au-dessus de 21.
2. Il faut une note par niveau visé, et non F = palier − 4 E vers un seul champion. Et il faut une définition écrite du niveau : record sur 20 parties (ETAPES D) ou palier typique (`record.md` l.18).
3. E doit aussi mesurer la mort (le taux de mort par minute et sa cause par map), sinon « mourir comme un joueur » n'est jugé nulle part. Pour les paliers bas, l'étalon n'a aucun débutant : c'est une extrapolation, à dire à chaque fois.
4. Les experts sont une autre famille, avec un autre critère. Il faut d'abord faire trancher par Sacha ce que veut dire « ne pas perdre » (survie, Survivant, distance). Il faut aussi des courses plus longues que 900 s : à 900 s une course est coupée, donc on ne sait pas si l'expert aurait continué à survivre.
5. Le paquet (étape F) doit noter, pour chaque course, la graine, le régime, le palier et les figures, pour pouvoir être rejoué en fantôme. Le brancher (fantôme ou Survivant réutilisé) est un changement du jeu, à décider par Sacha.
6. Les leviers de niveau déjà dans le code sont `profil` (la main) et `SURV_PILOTS` (réaction, fautes, ligne). Il faut les régler par la mesure, pas par des réflexes surhumains (CONSIGNES l.136).

## 5. concevoir:niches

*Rôle : concepteur de la voie « niches » : propose une façon de fabriquer l'échelle et les experts. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### LA VOIE DES NICHES — conception (concepteur, 28/11/2026)

Aucune course jouée, rien commité. Mon script (lecture seule) et sa sortie : `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/niches/cases-deja-remplies.js` et `sortie-cases.txt` (2 139 vraies courses de 900 s déjà en cache, quatre sources).

Verdict d'avance : **les niches sont un bon rangement, pas un moteur.** Aujourd'hui, elles n'auraient presque rien à ranger.

##### 1. L'idée en cinq phrases (pour Sacha)

Au lieu de garder un seul champion, la sélection garde une étagère de 8 cases, des débutants (palier 1-2) aux très forts (palier 20-30), plus une case « experts ». Dans chaque case, on garde les 3 pilotes qui ressemblent le plus aux joueurs, mort comprise. Les enfants naissent de toutes les cases, et chacun va dans la case de son niveau mesuré. Les experts sont jugés autrement : ne pas mourir, pas ressembler. Mais aujourd'hui tous nos pilotes tombent dans les deux mêmes cases, et les mutations ne changent pas le niveau : il faut d'abord trouver un bouton « niveau ».

##### 2. Les règles exactes

- **Cases** (palier moyen, bornes géométriques car le bruit vaut la moitié du palier) : [1;2[, [2;3[, [3;4,5[, [4,5;6,5[, [6,5;9,5[, [9,5;14[, [14;20[, [20;30], plus EXPERT. 3 places par case : 24 titulaires au plus, 6 enfants par génération, 12 graines pour tous. Soit 360 courses par génération, environ 51 min à 420 courses/h.
- **Position** : palier moyen du modèle pilote + graine, rétréci vers la note **du parent**. Aujourd'hui `note.js` l. 87 rétrécit vers la moyenne des vivants, ce qui ramènerait tout le monde au milieu.
- **Entrée** : un enfant est « provisoire » après 12 graines. Il devient titulaire à 24 courses, dans la case où sa moyenne tombe alors. Sans cela, une case vide se remplit de chanceux.
- **Note dans la case** : Q = −(E à durée égale + mesures de mort, § 3). Le palier ne compte plus dans la note, il ne sert qu'à choisir la case.
- **Renvoi** : dans une case de plus de 3 titulaires, le pire Q part. Le dernier occupant d'une case ne part que remplacé. La protection d'une génération reste.
- **Naissances (6)** :
  - 3 d'une case occupée tirée au sort, parent tiré au sort dans la case ;
  - 2 d'une case voisine d'une case vide, avec un sigma doublé ;
  - 1 croisement entre deux cases voisines.
  - La greffe garde sa place.
- **Plus de champion ni de sacre.** Chaque case a son n° 1, re-mesuré à chaque génération.

##### 3. « Niveau k » et « meurt comme un joueur »

**Niveau k** : un pilote dont le palier moyen sur au moins 36 courses de graines neuves tombe dans la case k.
- Pourquoi 36 : il faut une erreur relative de 0,5/√n ≤ 9 % pour tenir dans une case de rapport 1,45.
- Sa fiche donne la moyenne, la médiane, les quantiles 10 et 90 et le record sur 20.
- Un pilote s'étale beaucoup : c0025 a une moyenne de 6,8, un q10-q90 de 3 à 11 et un record de 14.
- Trente niveaux de pilotes séparés n'ont donc pas de sens. Le matchmaking du palier p tire dans la case qui contient p.

**Mesures de mort**, toutes calculables depuis `survie_s`, `cause`, `pieces` et `morts` des lignes, donc sans rejouer :

| Mesure | Bots | Joueurs |
|---|---|---|
| Pièces/min à durée égale (parties de 120-180 s) | 224 | 394 (4 parties) |
| Pièces/min à durée égale (parties de 240-400 s) | 263 | 504 (2 parties) |
| Parties de moins de 66 s | 24 % | 5/14 |
| Parties de plus de 240 s | 7,9 % | 3/14 |
| Morts « air + vide » | 36 % | 4/14 |

- **L'heure de la mort** se compare à l'heure où les joueurs passent le palier de la case : palier 5 entre 39 et 95 s (11 parties), 10 entre 114 et 172 s (8), 15 entre 182 et 246 s (5), 20 entre 247 et 347 s (3).
- **La part de morts en vol** : 13/14 chez les joueurs. Les causes ont un poids de 0,5, car 14 morts donnent ±12 points.
- **E à durée égale** : deux références au lieu d'une, les parties de 60-180 s (6 parties de joueurs) et celles de plus de 180 s (5).

**Sans joueur à ce niveau** : on prend la courbe unique d'habitué, avec la mention « extrapolé de 2 joueurs habitués, 14 parties ».

**Trou dur** : sous le palier 5, les parties durent moins de 60 s. E n'a alors aucune mesure (`MIN_S=60`, et E vaut 4 sous 5 parties). Les trois cases du bas ne seraient jugées que sur la mort, avec deux parties P1 de joueurs pour toute référence. Mesurer des parties courtes oblige à toucher `ressemblance.js`, donc à ouvrir une nouvelle époque des courses.

##### 4. Les experts

**Définition** : sur 60 graines neuves, avec un tmax d'au moins 1 800 s, le palier 30 est atteint et il n'y a aucune mort, 60 fois sur 60. Cela borne le risque à moins de 5 % par course (règle de trois). « Jamais » ne se prouve pas, on donne la borne.

**Note graduée, pour avoir une pente** : le palier atteint, puis la survie plafonnée, sur des courses longues. Il n'y a pas de départ au palier 30 : `TEST_PAL` (`code/economie/aura-banque-contrats.js:85`) est figé à 15, et `ml/reel` ne le lit pas. C'est un changement à demander.

**Le chemin** :
- Tenir 15 min dans 95 % des courses demande un risque de 0,34 % par minute.
- c0025 est à 18 %, 35 % puis 69 % par minute : **50 à 200 fois trop**, et à une vitesse 4 à 6 fois plus basse que celle du palier 30.
- À son débit de 227 à 281 pièces/min, le palier 30 tombe vers 16-19 min ; au débit des joueurs, vers 10 min.

**Ce n'est ni du réglage ni du temps de calcul** : l'écart vrai de niveau entre pilotes mesurés est de 0 à 0,16 palier (§ 7). Il faut des capacités neuves : des yeux qui anticipent en secondes, un ramassage doublé. Une limite du jeu est possible : aucun humain n'a fait le palier 30 sans mourir, et le record est le palier 28 avec une seconde chance. **On ne sait pas.** Les niches n'y apportent rien, elles gardent seulement la case prête.

##### 5. Ce que ça change dans `ml/evolution`

| Fichier | Changement | Époque |
|---|---|---|
| `note.js` | `noterNiches()` : position rétrécie vers le parent, modèle sur le log du palier, Q, deux références par durée (lues par `partiesJoueurs`, sans toucher `ressemblance.js`) | aucune (hors `FICHIERS_EPOQUE`) |
| `evoluer.js` | l'étagère, le renvoi par case, les naissances, l'état provisoire ; plus de meneur ni de validation | aucune |
| `config.json` | un bloc `niches` | celle des notes seulement |
| `etat.js`, `population.json` | un champ `niches` ajouté, même format ; `champion` reste le n° 1 de la case du témoin, pour ne pas faire tomber les pages (`tableau.js`, `histoire.js`, `arbre.js`) | — |
| Les pages | une vue par case, plus tard | — |
| `genome.js`, `modele.js`, `doigts.js` | seulement si le bouton « niveau » est la main : génome v5, nouvelle époque des courses, tout rejoué (312 courses, environ 45 min) | à faire avec la fusion des gènes v4 sur le Ryzen, qui ouvre déjà une époque |

**État** : un `dossierEtat` et un `dossierChampions` neufs, jamais de migration de la population du Ryzen. Deux maîtres se partagent le débit, donc il faut arrêter ou alterner la sélection actuelle. Son coût d'opportunité est faible : 18 générations sans sacre.

##### 6. Budget (420 courses/h)

**Cinq niveaux crédibles**, les cinq cases du bas (1 à 9,5), si le bouton « niveau » existe :
- test du § 7 : environ 550 courses ;
- confirmation : 5 cases × 3 pilotes × 36 = 540 courses ;
- environ 20 générations pour trier la ressemblance dans chaque case : 7 200 courses. L'erreur sur E est d'environ 0,07 à 24 courses, pour des écarts réels de 0,66 à 0,90 entre bras du banc.
- Total : **environ 8 300 courses, soit 20 h de Ryzen.** C'est une estimation.

**Trente niveaux** :
- Les certifier demanderait environ 156 courses par pilote (rapport 1,12), soit 4 700 courses.
- C'est inutile : les pilotes s'étalent plus que l'écart entre deux niveaux.
- Les cases au-dessus de 9,5 **ne s'achètent pas en courses** : aucun candidat n'existe.

**Expert** : la preuve coûte 60 courses de 30 min, environ 1 h 30 (estimation au prorata du temps de jeu). Trouver le pilote : pas chiffrable.

##### 7. La première étape (une journée) et son critère

**Déjà fait aujourd'hui, sans course** (`sortie-cases.txt`) :
- Les 13 bras du banc des gènes, à 96 courses chacun, ont une moyenne de 6,08 à 7,43. L'**écart-type vrai entre pilotes est de 0,16 palier**.
- Les 26 pilotes de la sélection du 27/11 : **0,00**, soit pas plus que le bruit.
- Tous les pilotes connus tombent dans deux cases voisines ([4,5;6,5[ et [6,5;9,5[). Six cases sur huit sont vides.
- E, lui, varie vraiment : de 0,66 à 0,90, à ±0,03 près. L'axe « ressemblance » est donc sélectionnable, l'axe « niveau » ne l'est pas.

**L'étape, quand le PC est libre** (zéro code) :
- un état séparé, avec un `config-essai` où `generation0` passe à `{genesMin:20, genesMax:40, sigma:0.5}` ;
- deux générations, sans renvoi utile : 20 pilotes × 24 graines, plus les enfants, soit environ 550 courses et 1 h 20 ;
- puis `mesure-tau.js` et mon script.

**Critère écrit d'avance. L'idée vit si les trois sont vrais :**
- l'écart-type vrai entre pilotes est d'au moins 1,5 palier ;
- la corrélation entre le lot 1 et le lot 2 est d'au moins 0,5 ;
- au moins 3 cases sur 8 ont un pilote dont les deux lots tombent dans la même case ou une case voisine.

**Elle meurt** pour le génome actuel si l'écart-type vrai est sous 0,75. Le second essai porterait alors sur la main (réaction, erreurs), mesurée hors génome avant tout génome v5.

Je m'attends à ce que de grosses mutations ne donnent que des pilotes **plus faibles**. Cela remplirait le bas, jamais le haut.

##### 8. Ce qui me ferait abandonner

1. Ni les grosses mutations ni la main ne donnent un axe de niveau héritable (écart-type vrai sous 0,75). Sans variété, une étagère ne range que du hasard.
2. **Le concurrent gratuit** : course par course, les 2 139 courses déjà jouées finissent dans toutes les cases de 1 à 20.

   | Case | [1;2[ | [2;3[ | [3;4,5[ | [4,5;6,5[ | [6,5;9,5[ | [9,5;14[ | [14;20[ | [20;30] |
   |---|---|---|---|---|---|---|---|---|
   | Courses | 53 | 72 | 471 | 517 | 580 | 366 | 79 | 1 |

   Les joueurs disent la même chose : une partie faible est une partie d'habitué qui meurt tôt. Si Sacha veut des fantômes (étape F, courses enregistrées), une **étagère de courses**, triées par ressemblance dans chaque palier, donne l'échelle 1-14 sans sélection ni époque. Mes niches de pilotes ne servent alors qu'à des bots vivants. À trancher par Sacha.
3. Après deux semaines, rien de titulaire au-dessus de 9,5. Le haut de l'échelle et les experts relèvent d'une voie « capacités » (yeux, ramassage), pas des niches.
4. Les cases du bas restent injugeables : E est muet sous 60 s, et il n'y a aucun débutant enregistré. On y fabriquerait des « habitués qui meurent vite » sans pouvoir dire s'ils ressemblent à un vrai débutant.

**Une question pour Sacha** : le matchmaking se fera-t-il avec des fantômes (courses enregistrées) ou avec des bots qui conduisent en direct ? Dans le premier cas, l'étagère de courses suffit jusqu'au palier 14.

## 6. concevoir:handicap

*Rôle : concepteur de la voie « handicap » : propose une façon de fabriquer l'échelle et les experts. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### La voie du handicap : conception (concepteur, 28/11/2026)

Aucune course jouée, rien de commité. Mon script (lecture seule) et sa sortie :
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/handicap/courbe-du-handicap.js`
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/handicap/sortie-courbe-du-handicap.txt` (parties A à G, citées « § A »… ci-dessous)

Le but, mot pour mot : « bah oui il doit mourir comme un joueur mais il faut aussi des pilote expert qui ne peuvent pas perdre du tout au palier moteur 30 il faut differnt niveau de bot qui permetent un match makin adapté au niveau de chaque joueur ».

Verdict court : la voie tient pour le bas de l'échelle humaine (records 1 à 13 aujourd'hui) et ne coûte presque rien à la sélection. Elle ne fabrique pas l'expert, et son haut dépend d'un pilote de base qui n'existe pas.

##### 1. L'idée en cinq phrases

1. On n'élève qu'un pilote, le meilleur possible dans le style des joueurs : c'est la sélection d'aujourd'hui, avec une note corrigée.
2. Un niveau n'est pas un autre pilote : c'est le même, avec une « molette de handicap » (main plus lente, fautes, nitro mal placée) réglée par la mesure jusqu'à ce que ses paliers tombent où l'on veut.
3. Les 14 parties le soutiennent : une partie faible d'un habitué est la même conduite, qui meurt plus tôt (lecteur joueurs § 3).
4. Les 30 niveaux sont 30 crans lus sur une seule courbe étalonnée ; quand le pilote progresse, on réétalonne.
5. La molette ne fait que descendre : elle ne fabrique pas l'expert du palier 30, et rien ne dit que le pilote de base puisse y monter.

##### 2. La sélection : règles exactes

- **Inchangé** : 20 vivants, 6 enfants, 12 graines, tournoi à 3, validation séquentielle, coffre, format de `population.json`. Est viré le F′ le plus bas hors protégés ; se reproduit qui gagne le tournoi.
- **La note devient F′ = â − 4·E′.** â ne change pas. E′ corrige E sur deux points :
  - **À durée égale** : une course de durée d est comparée aux parties des joueurs coupées à d. Cela donne plus de référence, pas moins : 11 parties vivantes à 60 s, 9 à 120 s, 5 à 180 s, 3 à 240 s (§ A).
  - **Une mesure de plus, le débit de pièces à temps égal.** Les 15 mesures de E n'en ont aucune (clés `E` de `lecteur-joueurs/sortie.json`). c0025 atteint chaque palier 1,5 à 1,8 fois plus tard que les joueurs : palier 10 vers 183 s contre 120 s (§ C).
- **Aucune mesure de la mort dans la note du pilote de base.** Il doit mourir le moins possible ; « mourir comme un joueur » se juge à l'étalonnage.
- **Les gènes du handicap sont figés**, comme `chancePalierMin` : jamais mutés, croisés ni greffés. Leur valeur de naissance est la main d'aujourd'hui.
- **Les niveaux vivent hors de la population**, dans `ml/ecurie/echelle/niveaux.json` : pour chaque cran, le sha du champion, les réglages, les paliers mesurés et la mention d'extrapolation.
- **Chaque sacre périme toute l'échelle** : il faut réétalonner.

L'étalonnage se fait en quatre temps :
1. Trier les boutons un par un (48 graines, appariées au témoin).
2. Garder ceux qui baissent le palier sans monter E′.
3. Ajuster une courbe monotone « cran → pièces » sur toutes les courses.
4. Vérifier les crans retenus sur des graines neuves.

##### 3. « Niveau k » et « meurt comme un joueur »

**Niveau k = record sur 20 parties.** Sacha dit « du record de palier 1 au palier 30 » et le jeu ne connaît que le record du joueur (`SAVE.d.ex.eng`). Concrètement : le quantile 96,6 % des paliers vaut k, sur 96 graines neuves en allégé, publié avec la médiane et q10-q90.

| | Médiane | Record |
|---|---|---|
| c0025 sans handicap (96 courses) | 7 | 13 sur 20 parties tirées (11 à 14) |
| Joueur au clavier (10 parties) | 10 | 28 |

Source : § B.

- **c0025 est déjà un « niveau 13 ».**
- **Le haut de l'échelle humaine n'exige pas un invincible** : un record de 28 à 30 demande un pilote de médiane 11 à 15 environ. C'est une extrapolation depuis un seul joueur.
- **Les 30 crans sont une interpolation.** À 96 courses, une médiane de 7 est connue à ±0,9 (§ G). Deux crans voisins ne se séparent pas un par un ; on tient 9 à 12 niveaux vraiment distincts (lecteur sélection § 5). Le matchmaking n'a pas besoin de plus fin : les paliers du joueur au clavier ont un écart-type de 8,6 (§ B).
- **Défaut mesuré : le bot est trop régulier.** Son record vaut 1,86 fois sa médiane, contre 2,8 pour le joueur. Un handicap fait de morts ajoutées resserre encore : médiane 3, record 8 (§ F, calcul). Parade à construire plus tard : tirer le cran à chaque partie (« la forme du jour »).

**Meurt comme un joueur** : trois mesures, calculées à l'étalonnage depuis `survie_s`, `cause` et `causesMorts`. Elles restent hors de `ressemblance.js`, donc sans nouvelle époque.

| Mesure | Joueurs | c0025 |
|---|---|---|
| M1 : risque de mourir, minutes 1 à 4 (§ A) | 21, 18, 44, 40 % | 18, 35, 69, 56 % |
| M2 : part des morts finales en vol | 13 sur 14 | à mesurer |
| M3 : classe de cause à durée égale | avant 70 s : 3 morts sur 5 sur un pic de la jade ; ensuite grotte, canyon, ville | à mesurer |

- **Sans joueur à ce niveau**, la référence est la partie d'habitué coupée à la durée du niveau, avec la mention « extrapolé de 2 joueurs habitués, 14 parties ».
- Les records 1 à 3 et au-delà de 22 n'ont aucune référence : il faut l'écrire.
- Le vrai remède est un enregistreur qui note un identifiant anonyme, le record, le nombre de parties et la graine. Cela change le jeu : décision de Sacha.

##### 4. L'expert

**Définition mesurable.** Seconde chance refusée, tmax 1 800 s, graines neuves : le pilote atteint 4 385 pièces sans une mort, puis tient 5 minutes au palier 30.
- « Jamais » ne se mesure pas ; on affirme une borne. 59 courses sans mort donnent au moins 95 % de réussite, 299 en donnent au moins 99 % (§ E).
- À la cadence actuelle, 59 courses de 20 min prennent environ 1,3 h de Ryzen (mon calcul, en supposant qu'une seconde de jeu coûte autant au palier 30 ; on ne le sait pas).

**Le chemin depuis le palier 7.** Il faut un risque de mort de 0,3 à 0,5 % par minute au plus (§ E). On compte 18 à 69 % chez c0025 et 18 à 44 % chez les deux joueurs : 40 à 200 fois moins de morts que tout ce qui a été observé, à une vitesse 4 à 6,3 fois plus haute.

| Est-ce une affaire de… | Réponse | Source |
|---|---|---|
| réglage | non | les 12 bras déjà joués déplacent le palier moyen de 0,75 au plus (§ D) ; 18 générations restent entre 6,4 et 8,2 |
| temps de calcul | non | sans mort, le palier 30 tombe en 4 à 10 min (lecteur palier § 5) |
| nouveaux gènes ou yeux, ou limite du jeu | on ne sait pas | — |

**Ce que ma voie apporte ici : rien, sauf un test.** Le « handicap négatif », c0025 avec la main machine, dit si la main de 0,45 s est le verrou.

**Un conflit à dire.** Un pilote de base au style humain porte la nitro des joueurs, qui a déjà coûté 1,5 à 2,5 paliers (`ETAPES.md` l. 225). L'invincible ne peut pas la porter. Une seule lignée ne sert pas les deux familles.

##### 5. Ce qui change, fichier par fichier

| Fichier | Changement | Coût au Ryzen |
|---|---|---|
| `genome.js` | v5 : 6 gènes figés `ou:'profil'` (réaction ×1, `erreur.manque` 0, `erreur.retard` 0, `erreur.bruit` 0, `erreur.parasite` 0, `suivi.retard` 150 ms) ; les bornes existent dans `doigts.js` (REGLES) | nouvelle époque des courses |
| `modele.js` | `PROFIL` lit ces gènes ; aux valeurs de naissance, même main au bit près | même époque : tout rejoué (352 courses sur 352 à la génération 16, selon le lecteur sélection), contrôle d'identité, revalidation, coffre |
| `note.js`, `config.json` (`note`) | E′ | époque des notes seulement, aucune course rejouée |
| `banc/bras.js` | `fixes` accepte tous les gènes figés | rien |
| `evoluer.js`, `etat.js`, pages, `population.json` | **rien** | rien |
| `ml/ecurie/echelle/` (neuf) | `etalonner.js`, `niveaux.json`, `echelle.js` (l'étape D d'ETAPES) | les courses du § 6 |

- Tout faire **avec la fusion des gènes v4** sur le Ryzen, qui ouvre déjà une époque.
- Les boutons de choix (`nitroDecor`, `marge`, `bandeDecor`) sont déjà des gènes : aucune époque.

##### 6. Budget

À 420-495 courses par heure ; les courses handicapées sont plus courtes.

| Échelle | Détail | Courses | Ryzen |
|---|---|---|---|
| 5 niveaux | tri 7 × 48 = 336 ; courbe 6 crans × 96 = 576 ; vérification 5 × 96 = 480 ; 100 parties enregistrées pour le juge | ≈ 1 500 | ≈ 3,5 h |
| 30 crans | courbe densifiée 12 × 96 = 1 152 ; vérification de 10 crans = 960 ; parties pour le juge | ≈ 2 500 | ≈ 6 h |

- Les 30 crans ne vont que jusqu'au record du pilote de base : 13 aujourd'hui.
- Chaque sacre coûte environ 1 500 courses de plus.
- Le coût inconnu est la montée du pilote de base vers une médiane de 12 à 15 au débit des joueurs : non chiffrable, 0 sacre en 18 générations.

##### 7. Première étape (une journée, sans toucher `ml/evolution`)

Quand le PC est libre : cinq copies de `ml/ecurie/pilote-voltige.js` dans `handicap/`, qui ne diffèrent que par `PROFIL` ou un réglage.

| Copie | Ce qui change |
|---|---|
| T | rien (témoin) |
| R | réaction ×1,5 |
| E | `manque` 0,10 et `retard` 0,15 |
| N | `nitroDecor` 1,5 |
| M | main machine |

Chacune passe par `ml/bot/noter.js --regime allege --tmax 900 --graines 48 --parties` sur les mêmes graines neuves : 240 courses. Puis le meilleur bouton à 3 crans × 48 sur d'autres graines.

**Prédiction écrite d'avance** (§ F, calcul) : descendre la médiane de 7 à 4-5 demande 0,35 à 0,5 faute mortelle de plus par minute, pour une survie médiane de 60 à 72 s.

**Prouvée si**, tout à la fois :
- (a) un bouton baisse la médiane d'au moins 2 paliers (apparié par graine, z ≥ 2) ;
- (b) trois crans sortent dans l'ordre et un quatrième est prédit à ±1 palier sur graines neuves ;
- (c) E′ ne monte pas de plus de 0,1 et l'AUC de `discerner.js` ne dépasse pas celle du témoin ;
- (d) la part de morts en vol ne baisse pas, et les causes restent dans les classes des parties de joueurs de moins de 120 s.

**Tuée si** aucun bouton ne tient (a) et (c), ou si (b) échoue deux fois.

**À part** : si M n'allonge pas la survie médiane d'au moins 30 %, la main n'est pas le verrou de l'expert. Réserve : ce cerveau a été écrit pour la main clavier.

##### 8. Ce qui me ferait abandonner

1. **Le handicap trahit.** Indice déjà contraire, sur 8 courses d'un autre cerveau : des erreurs ajoutées ont donné 3 morts de plus, mais les changements de sens sont passés de 0,89 à 0,81 quand les joueurs sont à 1,24 (`ml/bot/README.md` § 3.8). La faute de main éloigne peut-être du joueur.
2. **La courbe ne se répète pas** à ±1 palier.
3. **Le pilote de base ne monte pas.** Si, après la fusion v4 et 40 générations, la médiane reste sous 10 ou le débit sous 300 pièces par minute, l'échelle s'arrête au record 13 avec des parties 1,5 à 1,8 fois trop longues. Toute autre voie bute sur ce même pilote : le handicap n'est moins cher que pour le bas.
4. **De vrais débutants conduisent autrement** qu'un habitué qui meurt tôt. On ne le sait pas : aucun débutant enregistré.
5. **Sacha veut l'invincible et l'humain tirés du même pilote.**

Trois décisions reviennent à Sacha : classer sur le record ou sur le palier typique, le sens exact de « ne pas perdre », et l'enregistreur enrichi.

## 7. concevoir:libre

*Rôle : concepteur de la voie « libre » : propose une façon de fabriquer l'échelle et les experts. Phase : Concevoir. Modèle : claude-fable-5-2.*

#### Voie libre : « une courbe, deux notes, une banque de courses » (concepteur libre, 28/11/2026)

Aucune course jouée, rien de commité, rien touché hors de mon dossier.
- Script : `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/concepteur-libre/courbe-de-survie.js`
- Sortie : `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/concepteur-libre/sortie-courbe-de-survie.txt`
- Il lit les 14 parties (`lecteur-joueurs/sortie.json`) et les 1 250 courses du banc (`banc-des-genes/etat/courses-2026-48.jsonl`). Les § cités sont ceux de la sortie.

##### Ce que j'ai mesuré (et qui fonde la voie)

Part des parties qui atteignent un palier, intervalle à 95 % entre crochets (§ 1 et 2) :

| | Joueurs (14) | c0025 (96) | Les 1 250 |
|---|---|---|---|
| Atteint le palier 5 | 79 % [52–92] | 76 % [67–83] | 73 % |
| Du palier 5 au 10 | 73 % [43–90] | **27 % [18–39]** | 28 % |
| Du 10 au 15 | 63 % [31–86] | 0 sur 20 | 12 % [8–16] |
| Du 15 au 20 | 60 % [23–88] | — | 0 sur 29 |

- **c0025 est déjà « un habitué » jusqu'au palier 5, puis il décroche.** Son risque de finir dans la 1re minute vaut 18 %, celui des joueurs 21 % (§ 3).
- **Il ramasse moitié moins à durée égale** : 527 pièces en médiane sur les parties de 120 à 180 s, contre 1 003 chez les joueurs (§ 4).
- **Il n'arrive donc pas aux paliers à l'heure humaine au-delà de 8** (§ 5 et 6) : une course finie au palier 8 dure 145 s (joueur : 153 s), mais au palier 12 elle dure 236 s (joueur : 157 s).
- **Il ne meurt pas des mêmes choses** (§ 7). Aux paliers 4 à 8, 3 parties de joueurs sur 4 finissent sur un pic, contre 7 % des courses du banc (p = 0,0014). La réserve est forte : ces 3 parties sont du même joueur, sur la jade.

##### 1. L'idée, pour Sacha

1. Chez tes joueurs, une partie faible n'est pas mal conduite : elle meurt tôt, et à la même minute tout le monde roule et ramasse pareil.
2. Je ne fabrique donc pas trente pilotes : la sélection élève **un seul pilote « habitué »**, et ses courses sont rangées par palier d'arrivée dans une **banque**.
3. La course morte au palier 4 sert d'adversaire au joueur de niveau 4, celle du palier 20 au joueur de niveau 20.
4. Les **experts** sont élevés à part, sur une autre épreuve : on les lâche directement au moteur 10, puis 15, 20, 25, 30, et on ne garde que ceux qui ne meurent pas.
5. Le bas de l'échelle (1 à 8) est faisable tout de suite ; le milieu demande un pilote qui ramasse deux fois plus ; le haut et les experts ne sont pas promis.

##### 2. Les règles exactes

**Famille H (l'habitué).** La sélection d'aujourd'hui ne change pas de structure : 20 vivants, 6 enfants, 12 graines, tournoi de 3, renvoi du moins bon non protégé, validation séquentielle, coffre. Seule la note change :

**F_H = min(â ; 11,6) − 4·E − 2·M**

- **Le plafond 11,6** est le palier moyen des 14 parties (§ 7). Au-delà, survivre ne rapporte plus rien : « mourir comme un joueur » n'est plus puni par la note.
- **E** est celui d'aujourd'hui, avec `nitro` et `nitroSol` à poids 0 (`cfg.note.poidsMesures`). Ces deux mesures suivent la durée de la partie (ρ = −0,75, lecteur des joueurs), pas le style.
- **M, la mort**, est calculée dans `note.js` depuis `palier`, `survie_s`, `pieces` et `morts`, donc sans rejouer. C'est la moyenne des écarts aux joueurs, au-delà d'une zone morte de 1 écart-type, sur quatre mesures :
  - la part des courses au palier 5 ;
  - la marche 5 → 10 ;
  - la marche 10 → 15 ;
  - les pièces à durée égale.
- L'écart-type compte l'incertitude des 14 parties. M ne punit donc que ce que 14 parties peuvent prouver.
- Renvoi et reproduction : comme aujourd'hui.

**Famille X (les experts).** C'est un second état, séparé (`dossierEtat` et `dossierChampions` propres), né du champion H.
- L'épreuve : départ au palier imposé P, `tmax` 300 s.
- La note : **F_X = moyenne de min(survie ; 300) / 300**. E est écrit mais ne compte pas.
- Le moins bon est viré.
- Passage de classe (P + 5) : le champion tient 300 s sur au moins 90 % de 48 graines neuves.
- Population plus petite : 12 vivants, 4 enfants, 8 graines.

**La banque** (`ml/ecurie/paquet/banque.js`, hors de `ml/evolution`). Elle rejoue avec trace des couples (pilote, graine) sur une liste fixe de pistes et range chaque course sous son palier final. Le simulateur est répétable : on connaît l'issue avant de servir la course.

##### 3. Les définitions mesurables

**« Bot de niveau k »** : un **lot d'au moins 40 courses** finies au palier k (k ± 1 au-dessus de 10), toutes d'un pilote qui passe le test ci-dessous. Le niveau est une propriété du lot, pas du pilote.

**« Meurt comme un joueur »** (test de l'habitué, sur au moins 96 courses) :
- (a) les marches 1 → 5, 5 → 10, 10 → 15 et 15 → 20 tombent dans l'intervalle des joueurs (tableau) ;
- (b) le risque par minute, minutes 1 à 4, aussi (21, 18, 44 et 40 % chez les joueurs, § 3) ;
- (c) les pièces à durée égale sont entre le minimum et le maximum des joueurs (§ 4) ;
- (d) aucune cause de fin ne dépasse la borne haute des joueurs (« tour » : 1 sur 14 chez eux, 43 % des courses de c0025 aux paliers 1 à 3) ;
- (e) seconde chance prise : 14 % [4–40] chez les joueurs, 7 % chez c0025.

**Sans joueur à ce niveau** : chaque marche se compare à toutes les parties de joueurs qui l'ont franchie. Un lot de niveau 3 est jugé sur leur première minute. Sous le palier 4 et au-dessus de 22, il n'y a rien : le lot porte « extrapolé de 2 habitués, 14 parties ».

**c0025 aujourd'hui** : il passe (a) jusqu'au palier 5. Il échoue à 5 → 10, à 10 → 15, à (c) et à (d).

##### 4. L'expert

**Définition.** Départ normal, `tmax` 1 200 s, 300 graines neuves : les 300 atteignent le palier 30 et aucune ne finit par une mort. Zéro sur 300 borne le risque à 1 % par course (§ 8). Je compte une seconde chance prise comme une défaite : « pas du tout ».

**Le chemin depuis le palier 7.**
- Tenir 20 min 99 fois sur 100 demande **0,05 % de risque par minute**. c0025 est à 0,52 mort par minute, les joueurs à 0,39 (§ 8). Il faut diviser par environ 1 000, avec une caisse 4,4 fois plus rapide (99 → 439 m/s, lecteur du palier).
- **Ce n'est pas du réglage** : 18 générations n'ont pas déplacé le champion d'un palier.
- **Ce n'est pas du temps de calcul ni des pièces** : sans mourir, le palier 30 tombe en 4 à 10 min (lecteur du palier).
- **C'est la perception, ou le jeu lui-même.** Une portée de 40 m se traverse en 0,09 s au palier 30, pour une main de 0,45 s. Et 1 mort sur 22 était imposée même à une conduite idéale (`avant-le-bord` § 2.1). C'est un seul cas : on ne sait pas si le jeu permet zéro mort.
- Aucun humain observé n'y arrive : le record est 28, avec deux morts. **L'expert ne peut pas être jugé sur E.** C'est à dire à Sacha.

##### 5. Ce que cela change, et le coût pour le Ryzen

| Fichier | Changement | Époque |
|---|---|---|
| `note.js`, `config.json` (`note`) | plafond, M, poids de la nitro ; mode « épreuve » | notes seulement, **rien rejoué** |
| `piloter.js` | option `palierDepart` | **époque des courses** |
| `courses.js` | `palierDepart` dans la clé | — |
| `evoluer.js` | passage de classe ; refuser deux maîtres sur un même dossier | hors époque |
| `config-experts.json` | nouveau, fusionné par-dessus | — |
| `etat.js`, pages | rien : un champion par état | — |
| le jeu | **rien** | — |

- **Le palier imposé ne demande pas de toucher au jeu.** Le simulateur sait évaluer du code dans le jeu (`J.ev`, `ml/reel/jeu-reel.js` l. 146) et le jeu a déjà `TEST_PAL` (`code/economie/aura-banque-contrats.js` l. 85). Je ne l'ai pas essayé.
- **Tout se pose avec la fusion des gènes v4**, qui ouvre déjà une époque : on ne la paie qu'une fois. La cause et la carte de chaque mort, utiles au test (d), n'existent que dans les lignes v4.
- **Changer `cfg.note` change les renvois, et un renvoi ne se défait pas.** Il faut archiver l'état avant.
- Coût : une revalidation et un coffre, soit moins d'une heure. Ensuite X prend sa part du débit (environ 420 courses à l'heure en tout).

##### 6. Le budget

Le Ryzen joue environ 14,7 heures de jeu par heure (§ 7, proportionnalité supposée).

| Objet | Courses | Temps du Ryzen |
|---|---|---|
| 5 niveaux (1-2, 3-4, 5-6, 7-9, 10-14), 40 courses chacun, pilotes d'aujourd'hui | 782 (la tranche 1-2 ne sort que 5,1 % du temps, § 9) | environ 2 h |
| 30 niveaux avec un pilote réparti comme les joueurs | 600 à 2 000 | 1,5 à 5 h |
| Le diplôme d'un expert | 300 × 1 200 s | environ 7 h |

- Sur les 5 niveaux, seuls 1 à 8 sont crédibles à l'heure humaine. La tranche 10-14 dure 190 à 274 s contre 130 à 170 s chez les joueurs.
- Les 1 250 lignes du banc couvrent déjà ces tranches, mais sans trace.
- **Le coût des 30 niveaux n'est pas les courses, c'est le pilote.** Combien de générations pour doubler le ramassage : on ne sait pas. Les paliers 29 et 30 « humains » n'existent dans aucune donnée.

##### 7. La première étape (une journée, PC libre)

**A. L'épreuve du palier imposé sur c0025.** Six classes (7, 10, 15, 20, 25, 30) × 24 graines × 300 s, soit 144 courses et moins d'une heure, dans un dossier d'étude sans toucher `ml/evolution`. Critère écrit d'avance :
- survie médiane au palier 30 **sous 10 s** : les experts sont hors de portée de la sélection avec ces yeux, et on n'ouvre pas X ;
- **60 s ou plus** : on ouvre X ;
- survie égale d'une classe à l'autre : ce n'est pas la vitesse qui tue, c'est la map.

**B. Le tri à l'aveugle.** Rejouer avec trace 40 courses du banc finies aux paliers 4 à 8, puis les passer à `ml/bot/discerner.js` contre les mêmes fenêtres de temps des parties de joueurs. Critère :
- AUC de 0,75 ou moins : la banque vaut pour le bas de l'échelle ;
- AUC de 0,90 ou plus : l'idée est morte, trier ne suffit pas.

##### 8. Ce qui me ferait abandonner

- **B donne 0,90 ou plus**, ou l'écart des causes de mort tient sur d'autres joueurs (pic contre tour et roche).
- **Sacha veut des adversaires qui réagissent au joueur.** La banque ne sert que des courses déjà jouées sur une piste commune, donc une liste finie de pistes et un changement du jeu.
- **De vrais débutants enregistrés conduisent autrement à temps égal.** Toute la voie repose sur 2 habitués ; la preuve est interne à un joueur.
- **Trente générations (environ un jour) sans que les pièces à durée égale montent.** Le milieu de l'échelle ne viendra alors pas de la sélection.
- **M trop bruité.** À 12 graines, une marche se mesure à ±0,14 : la note deviendrait un tirage au sort.
- **A donne moins de 10 s au palier 30.**

**Les faiblesses que je ne sais pas lever.**
- Le plafond 11,6 éteint la pression vers le haut : les niveaux 15 à 28 ne viennent que de la queue chanceuse de l'habitué.
- Les intervalles des joueurs sont si larges que le test ne refuse que les écarts grossiers.
- Un niveau fait par tri reste « un habitué qui meurt tôt ». Rien ne dit que c'est un débutant.

## 8. attaquer:chiffres

*Rôle : relecteur « chiffres » : attaque les trois conceptions sous cet angle. Phase : Attaquer. Modèle : claude-opus-5-5.*

#### Relecture adverse des chiffres : les trois conceptions (niches, handicap, libre)

Je n'ai lancé aucune course ni aucun test, et je n'ai rien committé. J'ai écrit un seul script, en lecture seule : `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/relecteur-chiffres/recompter.js`. Sa sortie est `sortie-recompter.txt`, dans le même dossier. Il lit `lecteur-joueurs/sortie.json` (14 parties) et `banc-des-genes/etat/courses-2026-48.jsonl` (1 250 lignes, dont c0025, le bras « depart », 96 courses).

##### Ce qui se retrouve à l'identique
- **Paliers des joueurs.** Moyenne 11,64, médiane 11,5, record 28. L'écart-type de Sacha vaut 8,59.
- **Fins de partie des joueurs, minute par minute.** 3/14, 2/11, 4/9, 2/5, soit 21, 18, 44 et 40 %.
- **c0025.** Moyenne 6,83, médiane 7, maximum 14. Ses marches valent 73/96 du palier 1 au 5, 20/73 du 5 au 10 (27 %) et 0/20 du 10 au 15.
- **Pics du banc.** 48 des 676 courses finies aux paliers 4 à 8 meurent sur un pic (7 %).
- **Causes de c0025.** 6 de ses 14 courses finies aux paliers 1 à 3 meurent sur « tour » (43 %).
- **Courses finies au palier 1 ou 2.** 5,1 % du banc.
- **Écart réel entre les 13 bras.** 0,16 palier.
- **Puissance statistique.** Les rapports reconnaissables entre deux niveaux (1,50, 1,33, 1,23, 1,16) se retrouvent. On tient 9 niveaux distincts à 12 graines et 12 à 24 graines.
- **Seuils de risque par minute.** 0,34 % pour tenir 15 min à 95 %, 0,05 % pour tenir 20 min à 99 %.
- **Bornes de la règle de trois.** 0 échec sur 59 courses borne le risque à 4,95 % ; 0 sur 300 le borne à 0,99 %.
- **Temps de jeu.** Le Ryzen joue 14,7 h de jeu par heure.

##### Ce que les 14 parties ne portent pas (vaut pour les trois conceptions)
1. **La seconde chance.**
   - Les parties à 28 et à 22 sont les deux seules parties à seconde chance.
   - Sans elles, les joueurs ont une médiane de 9,5 et un record de 21.
   - Sans elles, Sacha a une médiane de 6,5 et un record de 15. C'est la zone de c0025.
   - Tout « haut de l'échelle humaine » au-dessus de 21 repose donc sur deux parties rattrapées.
2. **Les intervalles du risque par minute sont énormes.** Les 95 % sont à peu près [5–48] pour 2/11, [19–73] pour 4/9 et [12–77] pour 2/5.
   - Morts par minute (16 morts, secondes chances comprises, en 40,8 min de jeu) : 0,39 par minute, à 95 % [0,22–0,64]. c0025 est à 0,49 fin et 0,52 mort par minute.
   - Ni « c0025 meurt comme eux » ni « il meurt plus » ne se démontre.
3. **Les morts sur un pic.** Les 3 morts sur un pic aux paliers 4 à 8 sont du même joueur, sur la même map (la jade). Le p de 0,0014 de la conception libre traite donc trois tirages liés comme indépendants.
4. **Au-delà de 240 s, il n'y a que 2 ou 3 parties.**
   - « 504 pièces/min sur les parties de 240 à 400 s » (niches) ne se retrouve pas. Je trouve 481 (somme des pièces sur somme des durées), 501 (moyenne des rythmes) ou 520 (champ `pieces_min`), et le résultat dépend de la méthode.
   - Sur 2 parties, ce chiffre ne peut servir de cible.
5. **Aucun débutant, aucune partie entre les paliers 23 et 30 sans seconde chance.** Les deux parties au palier 1 sont des faux pas d'habitués.
6. **Le niveau d'un même pilote bouge d'un lot à l'autre.** c0025 a une médiane de 7,5 sur le lot de 900 s, 4 en validation, 5 au coffre et 7 au banc (lecteur existant). Une échelle étalonnée se périme donc à chaque changement du jeu, pas seulement à chaque sacre.

##### Conception « niches »
**Ce qui tient**
- Les calculs de budget (8 300 courses, environ 20 h), la borne de 0,34 % par minute et le « 50 à 200 fois trop » (18/0,34 = 53 ; 69/0,34 = 203).
- Le diagnostic : 6 cases vides sur 8, et un écart réel de 0,16 entre les bras.
- Le constat qu'E est muet sous 60 s (`MIN_S=60`).

**Ce qui tombe**
- **« L'axe niveau n'est pas sélectionnable » va trop loin.** L'écart de 0,16 est mesuré sur des bras qui sont c0025 avec un ou deux gènes changés. Sur le lot de 900 s, des cerveaux différents tiennent pourtant des médianes de 11 à 13 (c0003, c0011), contre 7,5 pour c0025.
- **La preuve de l'expert coûte plus que dit.** 60 courses de 1 800 s demandent environ 2,0 h de Ryzen, pas 1 h 30 (même hypothèse : une seconde de jeu coûte partout pareil).
- **Ce qu'elle prétend savoir des joueurs et que les données ne portent pas.**
  - Une heure de passage pour chaque case : le palier 20 repose sur 3 parties, le palier 15 sur 5.
  - Deux références d'E « à durée égale » : 6 et 5 parties.
  - Pour les cases du bas, aucune référence.

**Verdict : à mesurer d'abord.** Il faut l'essai des grosses mutations, avec son critère écrit d'avance. Sans lui, l'étagère n'a rien à ranger.

##### Conception « handicap »
**Ce qui tient**
- Les crans d'E′ à durée égale : 11, 9, 5 et 3 parties encore vivantes à 60, 120, 180 et 240 s.
- Le record pris comme quantile 0,966 de 20 parties (c'est la médiane du maximum de 20 tirages).
- Le rapport record/médiane de c0025 : 13/7 = 1,86.
- Le coût de la preuve de l'expert : 59 courses × 1 200 s, environ 1,3 h.
- La première étape : cinq copies du pilote sur 48 graines, sans toucher `ml/evolution`. C'est le meilleur rapport entre information et coût.

**Ce qui tombe**
- **Le rapport de 2,8 entre record et médiane d'un joueur, et « un record de 28 à 30 demande une médiane de 11 à 15 ».** Ce rapport vient d'un seul joueur, sur 10 parties. Il tient entièrement à la partie à 28, rattrapée par une seconde chance : sans elle, Sacha a un rapport de 15/6,5 = 2,3.
- **« Palier 10 vers 183 s contre 120 s ».** Les 120 s sont la médiane des 8 joueurs qui ont atteint ce palier. Les 183 s de c0025 sortent d'une droite ajustée (pièces ≈ −128 + 281 × minutes) : aucune ligne du banc ne note l'instant où tombe un palier. L'ordre de grandeur est cohérent avec un débit de 224 contre 394 pièces/min, mais ce n'est pas une mesure.
- **La prédiction « survie médiane de 60 à 72 s ».** Au débit de c0025 sur les courses de moins de 60 s (218 pièces/min), une médiane au palier 4 ou 5 correspond à environ 41 à 62 s de survie. La prédiction est à corriger avant de jouer.
- **Le budget de 5 niveaux (environ 1 500 courses).** Il compte « 100 parties enregistrées pour le juge ». Si ce sont des parties de joueurs, le Ryzen ne peut pas les produire.
- **Ce qu'elle prétend savoir des joueurs.**
  - « Une partie faible est la même conduite » n'est montré que sur la 1re minute de 2 habitués, avec 4 parties faibles de Sacha.
  - La cible de risque M1 a des intervalles de ±25 points.

**Verdict : à mesurer d'abord**, et en premier pour le bas de l'échelle. Le génome v5 attend le résultat de l'essai.

##### Conception « libre »
**Ce qui tient**
- Les marches des joueurs : 11/14, 8/11, 5/8 et 3/5, soit 79, 73, 63 et 60 %.
- Le plafond 11,6, qui est bien la moyenne des 14 parties.
- La médiane de 1 003 pièces des joueurs entre 120 et 180 s.
- La seconde chance prise 2 fois sur 14.
- Les 782 courses pour 5 niveaux (40/0,051).
- Les 6,8 h pour le diplôme d'un expert.
- Les 0,05 % de risque par minute.
- **L'épreuve A** (c0025 lâché au palier 7, 10, 15, 20, 25 ou 30 ; 144 courses) est la mesure la moins chère qui dise si l'expert est à portée.

**Ce qui tombe**
- **Le plafond 11,6** compte les deux parties à seconde chance (sans elles, la moyenne tombe à 9,4). Il ne joue aujourd'hui aucun rôle, puisque â vaut 6,8.
- **La note M** met des cibles à ±30 points dans la note. L'auteur le reconnaît (« M trop bruité »).
- **Le test (d) sur « tour »** compare 6/14 courses de c0025 aux paliers 1 à 3 à une borne des joueurs prise tous paliers confondus. Les joueurs n'ont aucune partie aux paliers 2 et 3.
- **« 30 niveaux en 600 à 2 000 courses »** suppose un pilote qui n'existe pas. Sur le banc, 46 courses finissent entre les paliers 14 et 19, et 0 au palier 20 ou plus.
- **« Le palier imposé ne touche pas au jeu » n'est pas prouvé.**
  - `TEST_PAL` est un `const {on:false,n:15}` (`code/economie/aura-banque-contrats.js:85`). Ce sont ses propriétés qui sont modifiables.
  - `dbgBancPal` ne fait qu'allumer le mode.
  - `testPalierPose` donne d'un coup `E.coins - coinsGot` pièces.
  - On ne sait pas si la piste est alors construite pour ce palier.
  - Le niches dit le contraire (« figé, à demander ») ; rien n'a été essayé dans un sens ni dans l'autre.

**Verdicts**
- L'épreuve A : à mesurer d'abord. Elle se joue dans un dossier d'étude, sans toucher `ml/evolution`.
- La banque et la mesure B (passer 40 courses du banc des paliers 4 à 8 à `discerner.js` contre les mêmes fenêtres de temps des joueurs) : à mesurer d'abord. Elle ne vaut que si Sacha choisit des fantômes (des courses enregistrées).
- La note F_H avec le plafond et M : à ne pas faire avec 14 parties.

##### Un champ ambigu
D'après le lecteur de la sélection, le champ `morts` des lignes compte les morts en vol. « morts > 1 = seconde chance » (7 courses de c0025, 104 sur le banc) n'est donc pas établi. Le « 7 % de secondes chances » de c0025 en dépend.

##### Classement
1. **Le handicap, première étape (cinq copies du pilote)** et **la libre, épreuve A (palier imposé)**, faites le même jour. Elles ne touchent pas `ml/evolution`, coûtent environ 400 courses et tranchent l'une le bas de l'échelle, l'autre les experts. Il faut d'abord corriger la prédiction de survie du handicap, à 41–62 s.
2. **La libre, mesure B (la banque)**, si Sacha choisit les fantômes.
3. **Les niches**, seulement si l'essai des grosses mutations donne un écart réel d'au moins 1,5 palier.

Aucune des trois ne peut étalonner quoi que ce soit au-dessus du palier 21 sur des joueurs.

## 9. attaquer:code

*Rôle : relecteur « code » : attaque les trois conceptions sous cet angle. Phase : Attaquer. Modèle : claude-opus-5-5.*

#### Relecteur adverse : le code et le Ryzen (28/11)

Je n'ai lancé aucune course ni aucun test, et je n'ai rien écrit ni commité. J'ai seulement lu le code et `git show origin/evolution-ryzen` (commit df26b9546, 16 h).

##### Les faits vérifiés, communs aux trois conceptions

- **Le Ryzen** (`etat/resume.txt`) est à la génération 19, époque 3c3d44e8bd9b, 438 courses par heure. Le champion est toujours le témoin c0025 : F 3,5 ± 0,5, palier 6,5, E 0,77. La ligne « Mutations comptent-elles ? » donne r 0,17 et tau 0,43 [0,00 ; 0,72]. Cela confirme, sans le prouver, que le niveau se transmet peu des parents aux enfants.
- **Les époques.** `FICHIERS_EPOQUE` (`commun.js` l. 251) contient yeux, doigts, piloter, ressemblance, mesures, voltige, jeu-reel, sim-env-reel, modele et enfant. `note.js`, `evoluer.js` et `genome.js` n'y sont pas.
  - La clé d'une course (`courses.js` `cle()` l. 63) contient le shaPilote, la graine et le tmax. Changer le tmax, c'est donc rejouer.
  - `cfg.note` existe déjà avec `poidsMesures`, `minS` et `retrecir`. Le changer ne crée qu'une nouvelle époque des notes.
- **Le rétrécissement.** `ajuster()` (`note.js` l. 76-82) rétrécit chaque pilote vers la moyenne des vivants (`o.ids`). L'objection des niches sur ce point est juste.
- **La main.** `PROFIL` est écrit en dur dans `modele.js` l. 55 : `modele:'clavier'`, et seule `chance.palierMin` vient d'un gène, `REGLAGES.chancePalierMin`, qui est figé.
  - Les boutons existent bien dans `doigts.js` : `REGLES` l. 90-98, appliqués l. 337, 419-435 et 465.
  - **Le réglage de niveau par la main existe donc dans `doigts.js`, mais ni dans le PROFIL ni dans le génome.**
  - Le mettre dans le génome oblige à modifier `modele.js`, qui est un fichier d'époque : tout est rejoué, et il faut repasser l'identité, la validation et le coffre.
  - Il n'existe pas de « réaction ×1,5 » : on écrit des durées `[p10, p50, p90]`, que `regle()` arrondit en images de 1/60 s.
- **Le départ à un palier imposé.**
  - `TEST_PAL` (`aura-banque-contrats.js` l. 85-89) n'impose pas un moteur : il appelle `addCoins(E.coins - coinsGot)` une fois que la partie roule. Le palier et les pièces de la course seraient faussés dès le départ.
  - Son `n` vaut 15. C'est l'indice dans `ENGINE_TIERS` : il faut vérifier si cela donne le palier 15 ou le palier 16.
  - `J.ev` évalue bien dans la fonction fermée du jeu (`jeu-reel.js` l. 145-147, `ev('loop')`). On peut donc régler `TEST_PAL.n` sans toucher au jeu. Je ne l'ai pas essayé.
  - La densité des pièces suit les portails franchis (lecteur du palier). Une caisse au moteur 30 sur le premier tronçon ne roule donc pas sur la piste d'un vrai palier 30.
- **Ce qui casse si on change la forme de l'état.** `etat.js` l. 72 refuse tout format autre que `evolution-population-1`. Que `etat.js` tolère un champ ajouté, je ne l'ai pas vérifié.
  - `dossierEtat` et `dossierChampions` se règlent dans `config.json` (`evoluer.js` l. 56-59). Un état séparé est donc constructible sans toucher au Ryzen.

##### Conception « niches »

**Ce qui tient**
- Le constat est solide : toutes les populations sont serrées, et le tau du Ryzen va dans le même sens.
- L'étape 1 se fait sans code. `config.generation0` vaut `{genesMin:3, genesMax:6, sigma:0.15}`, et la passer à 20 / 40 / 0,5 dans un `config-essai` avec un état séparé ne touche à rien d'autre.
- Le critère de réussite est écrit d'avance.

**Ce qui tombe**
- **L'étagère réécrit `evoluer.js` en profondeur.** La validation, le meneur, le sacre et le coffre disparaissent, alors que le coffre est le seul garde-fou contre une dérive (`coffre()` compare champion et témoin).
  - Les pages (`tableau.js`, `histoire.js`, `arbre.js`) ne garderaient qu'un faux « champion ».
  - Ce n'est pas une affaire d'époque, mais c'est la plus grosse surface de code des trois conceptions.
- **Les trois cases du bas ne sont pas jugeables** : `minS` vaut 60, et `ressemblance.js` rend `null` sous 60 s (l. 38). La conception l'admet.
- Q ne contient pas le palier. Dans une case, rien n'empêche alors de dériver vers le bord de la case.

**Verdict : à mesurer d'abord** (l'étape `generation0`, environ 550 courses). **À ne pas construire** tant que l'écart-type vrai entre pilotes est sous 0,75 palier.

##### Conception « handicap »

**Ce qui tient**
- L'étape 1 est entièrement hors de `ml/evolution` : des copies de `pilote-voltige.js` avec un `PROFIL` écrit, passées par `noter.js`. Les boutons et leurs bornes existent.
- Aucune époque ne change pour `evoluer.js`, l'état ou les pages. L'état du Ryzen survit intact.
- `poidsMesures` et `minS` sont déjà dans `cfg.note` : E′ (la nitro à poids 0, des références par durée) relève de l'époque des notes.

**Ce qui tombe ou reste à prouver**
- **« Main machine » ne mesure pas une main de 0.** `machine` met la réaction à 0, mais la décision reste cadencée à 100 ms (`HUMAIN.decision`, `doigts.js` l. 148).
  - Le test borne donc seulement l'apport de la main clavier. Il ne dit pas si une main plus rapide encore suffirait.
  - Et ce cerveau a été réglé pour la main clavier : le test risque de conclure à tort que la main n'est pas le verrou.
- **La prédiction « 0,35 à 0,5 faute mortelle de plus par minute » n'a pas de traduction en boutons.** `erreur.manque`, `retard`, `sur` et `bruit` sont des probabilités par appui, pas des morts. Leur effet sur la mort se mesure, il ne se calcule pas.
- **« Gènes v5, même main au bit près »** : c'est plausible, puisque `regle()` est déterministe, mais il faudrait un contrôle d'identité neuf, et il n'est pas écrit.
- **« Le haut de l'échelle par un pilote de base plus fort »** : aucun mécanisme ne le donne, 0 sacre en 19 générations.

**Débutant ou expert saboté ?** Aujourd'hui, ce serait un **expert saboté**.
- Le cerveau reste le même : même ligne, même nitro, mêmes vols. Seule l'exécution se dégrade.
- Le seul indice mesuré va contre l'idée d'un débutant. Avec des erreurs ajoutées (`README` § 3.8, 8 courses d'un autre cerveau), le bot fait 3 morts de plus, mais ses changements de sens passent de 0,89 à 0,81 par seconde, contre 1,24 chez les joueurs. Le style ne bouge pas, ou s'éloigne des joueurs.
- **Ce qui permettrait de le savoir :**
  - (1) des parties de vrais débutants, avec un identifiant anonyme et le record du joueur. Il faut changer l'enregistreur, donc c'est une décision de Sacha ;
  - (2) `discerner.js`, niveau par niveau, contre ces parties, à temps égal ;
  - (3) les temps de réaction des joueurs. À 10 échantillons par seconde, l'enregistreur ne les mesure pas (`doigts.js` l. 77) : il faudrait les touches horodatées ;
  - (4) en attendant : les 15 mesures, les causes de mort et la part de morts en vol du bot handicapé, comparées aux parties courtes des habitués. Cela distingue « saboté » de « habitué qui meurt tôt », pas d'un débutant.

**Verdict : à mesurer d'abord** (étape 1). C'est la mesure la moins chère et la plus informative, et elle ne fait courir aucun risque à l'état du Ryzen.

##### Conception « libre » (une courbe, deux notes, une banque)

**Ce qui tient**
- F_H se construit dans `note.js` et `cfg.note` : `poidsMesures` existe, et M se calcule depuis `palier`, `survie_s`, `pieces` et `morts`.
- La famille X dans un `dossierEtat` séparé est faisable.
- L'étape B (40 courses rejouées puis passées à `discerner.js`) se fait hors de `ml/evolution`.

**Ce qui tombe**
- **L'épreuve du palier imposé n'est pas ce qu'elle dit.** Avec `TEST_PAL`, ce sont des pièces données à la caisse, sur la piste et la densité du premier portail. La survie mesurée au « palier 30 » est celle d'un moteur 30 sur une piste de début de partie. Le critère « moins de 10 s, on n'ouvre pas X » jugerait donc la mauvaise chose.
- `palierDepart` dans `piloter.js` touche un fichier d'époque : c'est une nouvelle époque des courses. La conception le dit, mais le présente comme gratuit avec la fusion v4. Il ne l'est que si les deux tombent le même jour.
- **La banque :**
  - toute course gardée dépend de `jeu_sha`, qui est dans la clé : une modification du jeu la périme ;
  - le jeu n'enregistre pas la graine de la piste ;
  - elle ne fait qu'un tri des courses du seul pilote c0025, dont les courses aux paliers 10 à 14 durent 1,5 fois trop longtemps (la conception l'écrit elle-même).
- **min(â ; 11,6)** est sans effet tant que le champion est à 6,5. M à 12 graines vaut ± 0,14 : c'est du bruit dans les renvois, et un renvoi ne se défait pas.

**Verdict.**
- Étape B : à faire.
- Étape A : à refaire. Il faut mesurer d'abord ce que `TEST_PAL` pose réellement sur la piste, avec un script d'étude et `J.ev`.
- F_H sur l'état en marche : à ne pas faire. Seulement dans un état neuf, avec la fusion v4.

##### L'état du Ryzen

Il survit aux trois conceptions si et seulement si :
- tout essai passe par un `dossierEtat` et un `dossierChampions` neufs ;
- `cfg.note` ne change pas sur l'état en marche ;
- les fichiers d'époque ne bougent qu'avec la fusion v4. Elle ouvre de toute façon une époque, mais ses lignes n'ont pas encore `causesMorts`.

Deux maîtres sur un même PC se partagent le débit. Aucune conception ne chiffre ce que perd la sélection en marche.

##### Les experts

Aucune conception ne construit l'expert du palier 30, et les trois le disent. Leurs deux sondes n'en sont pas :
- « main machine » ne mesure pas une main sans délai ;
- l'épreuve `TEST_PAL` ne met pas la caisse sur la piste d'un vrai palier 30.

Le sens de « ne pas perdre » reste à faire trancher par Sacha.

##### Classement

1. **Handicap, étape 1** : à mesurer d'abord. Hors de `ml/evolution`, aucun risque pour le Ryzen, et c'est la seule qui teste la main.
2. **Libre, étape B** (le tri à l'aveugle) : à faire. L'étape A est à corriger avant d'être jouée.
3. **Niches, étape `generation0`** : à mesurer d'abord. L'étagère elle-même : à ne pas faire tant que le niveau ne se transmet pas.

Aucune des trois ne justifie aujourd'hui de toucher à `evoluer.js`, au génome ou au `cfg.note` du Ryzen.


## 10. attaquer:but

*Rôle : relecteur « but » : attaque les trois conceptions sous cet angle. Phase : Attaquer. Modèle : claude-opus-5-5.*

#### Relecture adverse : niches, handicap, voie libre (28/11)

Je n'ai lancé aucune course ni aucun test, et je n'ai rien écrit. J'ai contrôlé dans le code les affirmations qui décident du classement.

##### Ce que Sacha demande, et ce qu'aucune voie ne livre

Ses mots : « bah oui il doit mourir comme un joueur mais il faut aussi des pilote expert qui ne peuvent pas perdre du tout au palier moteur 30 il faut differnt niveau de bot qui permetent un match makin adapté au niveau de chaque joueur ».

- **(a) Indiscernable à chaque niveau.** Aucune voie ne peut le promettre aux paliers 1-3 et 23-30. Les joueurs n'ont aucune partie aux paliers 2-3, 6-7, 9-10, 13, 17-20, 23-27 et 29-30 (lecteur joueurs § 5). Les trois voies le disent.
- **(b) Des experts qui ne perdent jamais au palier 30.** Aucune voie ne les fabrique. Toutes répondent « on ne sait pas » et proposent un test. Aucun humain observé n'y arrive : le record est le palier 28, avec une seconde chance.
- **(c) Le matchmaking.** Aucune voie ne traite le côté jeu. Il n'y a pas de serveur, aucun bot n'est branché, et l'enregistreur ne note ni la graine ni le palier (lecteur existant § 4). Faire servir un bot ou une course est un changement du jeu.

##### La voie des niches

**Ce qui tient.**
- Ses propres mesures sur 2 139 courses (`niches/sortie-cases.txt`) : l'écart vrai de niveau entre pilotes vaut 0,16 palier dans le banc, et 0,00 dans la sélection.
- E varie vraiment (0,66 à 0,90). La ressemblance se sélectionne, le niveau ne se sélectionne pas.
- Elle ne fait pas migrer l'état du Ryzen.

**Ce qui tombe.**
- **Elle se réfute elle-même.** Six cases sur huit sont vides, et rien ne remplit le haut. Elle ne livre rien avant que quelqu'un trouve un bouton « niveau », et ce bouton, c'est la voie du handicap.
- **« TEST_PAL figé à 15, un changement à demander » est faux.** `TEST_PAL={on:false,n:15}` est un objet modifiable (`code/economie/aura-banque-contrats.js:85`). `window.dbgBancPal` existe (l. 91). `window.dbgTremble({tier})` impose déjà `engTier` et `coinsGot` (`code/moteur/banc-tremble.js:14`). `J.ev` évalue du code dans le jeu (`ml/reel/jeu-reel.js:145`).
- **Son « concurrent gratuit », l'étagère de courses, est la voie libre.**

**Verdict : à ne pas faire maintenant.** Elle redevient un rangement utile si un bouton de niveau dépasse 0,75 palier d'écart vrai.

##### La voie du handicap

**Ce qui tient.**
- La prémisse est retrouvée : une partie faible est une partie d'habitué qui meurt tôt, avec la même vitesse et le même ramassage à la première minute (lecteur joueurs § 3, `a-temps-egal.txt`).
- Les chiffres sont retrouvés dans `handicap/sortie-courbe-du-handicap.txt` :
  - risque par minute des joueurs : 21, 18, 44 et 40 % ;
  - c0025 : médiane 7, record sur 20 parties 13 (q10 11, q90 14) ;
  - rapport record/médiane : 1,86 pour c0025 contre 2,80 pour le joueur au clavier.
- Sa première étape se fait sans toucher `ml/evolution` (cinq copies, 240 courses), et sa prédiction est écrite d'avance.
- Le test « M » (main machine) est le moins cher qu'on ait pour savoir si la main de 0,45 s bloque l'expert.

**Ce qui tombe ou reste fragile.**
- **Le classement sur le record contredit son propre défaut mesuré.** Le bot a un record de 1,86 fois sa médiane, le joueur 2,8 fois. Un bot calé sur le record d'un joueur aura donc une médiane trop haute. Calé sur sa médiane, il aura un record trop bas. Et le handicap resserre encore l'écart (médiane 3, record 8, § F). La parade, « la forme du jour », n'est pas construite.
- **Un indice contraire existe déjà.** Des erreurs ajoutées font passer les changements de sens de 0,89 à 0,81, alors que les joueurs sont à 1,24 (`ml/bot/README.md` § 3.8). La faute de main peut trahir le bot.
- **Le génome v5 aux gènes de main figés n'est pas utile tant que l'étape 7 n'a pas parlé.** C'est une époque de courses payée d'avance.
- **Son haut dépend d'un pilote de base qui ne monte pas** : aucun sacre en 18 générations.

**Verdict : à mesurer d'abord** (son étape 7, telle quelle).

##### La voie libre (banque de courses et experts par palier imposé)

**Ce qui tient.**
- Les marches retrouvées (§ 1-2) : c0025 suit les joueurs jusqu'au palier 5 (76 % contre 79 %), puis décroche du palier 5 au palier 10 (27 % contre 73 %).
- C'est la seule voie qui livre quelque chose **sans nouvelle époque ni nouveau pilote**. Les 1 250 courses du banc couvrent déjà les paliers 1 à 14, et le simulateur est répétable.
- Son test B (`discerner.js` sur 40 courses aux paliers 4 à 8, critère d'AUC écrit d'avance) répond directement à (a) pour le bas de l'échelle.
- **Son test A est réalisable sans toucher au jeu.** Je l'ai contrôlé : `dbgTremble({tier})` et `TEST_PAL.n` existent. Indice : `ENGINE_TIERS[TEST_PAL.n]`, donc le palier 30 s'écrit `n:29`.

**Ce qui tombe ou reste fragile.**
- **Le test A ne mesure pas l'expert de Sacha.** Partir au moteur 30 sur une piste du début ne reproduit pas l'arrivée au palier 30 : les virages sont construits pour le palier + 2 (lecteur palier § 6), et la densité suit les portails franchis. En plus, l'imposition ajoute des pièces (`addCoins`), ce qui fausse le palier mesuré. Je n'ai pas vérifié si la piste se recalcule. Un « moins de 10 s » condamne ; un « 60 s ou plus » ne prouve rien.
- **La seconde chance coûte déjà un palier moteur** (`CHANCE.moteurPerte`, `code/gameplay/seconde-chance.js:188`). La compter comme une défaite se justifie, mais c'est à Sacha de le trancher.
- **F_H plafonnée à 11,6 éteint la pression vers le haut**, alors que Sacha veut une échelle jusqu'au palier 30. La voie l'admet. M est bruitée (±0,14 par marche à 12 graines).
- **Les causes diffèrent** : un pic dans 3 parties sur 4 chez le joueur, contre 7 % chez le bot (p = 0,0014). Les trois parties viennent d'un seul joueur, sur la jade. Je n'ai pas retrouvé le chiffre « tour 43 % aux paliers 1-3 » : par défaut, il est faux.
- **La banque ne sert qu'en fantôme sur une piste commune.** Il faut une graine dans le jeu, et cela le change.

**Verdict.**
- Test B : à faire.
- Test A : à faire, mais il ne sert que de filtre négatif.
- F_H : à mesurer d'abord (recalculer la note sur le cache, sans renvoi).

##### Les données qu'on n'a pas

- **Des débutants et d'autres joueurs** : il n'y en a aucun, et toutes les voies en dépendent pour le bas et le haut de l'échelle.
- **Le temps de réaction des joueurs** : il n'est pas mesuré (`doigts.js` l. 77). Le handicap n'a donc rien pour se caler.
- **Le comportement d'un bot au-delà de 5 min** : aucune course de c0025 ne dépasse 5 min, et le maximum du banc est 444,5 s. Les budgets des experts (1,3 h, 7 h) supposent que le coût d'une seconde de jeu ne change pas au palier 30. On ne le sait pas.

##### Classement

1. **La voie libre**, en ne gardant que la banque et le test B. Elle livre le plus tôt (paliers 1 à 8, environ 2 h) et rien ne s'y défait.
2. **Le handicap**, son étape 7 seulement, pour des bots qui conduisent en direct, et le test M pour les experts.
3. **Les niches** : un rangement à garder pour plus tard.

**La meilleure voie est un mélange, sur une journée de PC libre.** On n'y touche pas à la note ni à l'état du Ryzen :
- **Le bas de l'échelle** : le test B de la voie libre (une banque de courses de c0025 aux paliers 1 à 8, avec la mention « extrapolé de 2 joueurs habitués, 14 parties »).
- **La note** : E à durée égale, avec une mesure de la mort, recalculée sur le cache pour voir ce qu'elle classerait. On ne l'installe qu'avec la fusion des gènes v4.
- **Les experts** : deux filtres négatifs, le test A au palier imposé (le palier 30 s'écrit `n:29`) et le test M (main machine).
- **Les bots en direct** : l'étape 7 du handicap, seulement si Sacha veut des adversaires qui conduisent en direct.

Le nombre de niveaux ne se demande pas à Sacha : il se mesure. On tient environ 9 niveaux distincts à 12 graines et environ 12 à 24, espacés de façon géométrique (lecteur sélection § 5).

##### Trois questions fermées pour Sacha

1. « Ne pas perdre du tout », est-ce atteindre le palier 30 sans aucune mort, une seconde chance prise comptant comme une défaite ? Oui ou non.
2. Le matchmaking se fait-il avec des **fantômes** (des courses enregistrées, rejouées sur la même piste que le joueur) ou avec des **bots qui conduisent en direct** ? Fantômes ou direct.
3. Peut-on ajouter à l'enregistreur du jeu (il reste dans l'appareil, rien n'est envoyé) un identifiant anonyme, le record, le nombre de parties et la graine, puis faire enregistrer des parties à d'autres joueurs, débutants compris ? Oui ou non.

Fichiers contrôlés :
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/code/economie/aura-banque-contrats.js` (l. 85-104)
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/code/moteur/banc-tremble.js` (l. 14)
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/code/gameplay/seconde-chance.js` (l. 188)
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/reel/jeu-reel.js` (l. 145)
- `C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/handicap/sortie-courbe-du-handicap.txt`

## 11. rediger

*Rôle : rédacteur : écrit le LISEZ-MOI de l'étude à partir de tout ce qui précède. Phase : Ecrire. Modèle : claude-opus-5-5.*

J'ai écrit le fichier : C:/Users/sacha/code/CASH-CAR-bots-ecurie/ml/ecurie/etude/echelle-de-bots/LISEZ-MOI.md (rien commité, aucune course ni aucun test, rien touché hors de ce dossier).

Il suit la forme de « avant le bord ». « En une minute » ouvre le texte (10 points), puis viennent les sections du plan : § 1 le but, avec les mots de Sacha cités tels quels et datés (24/11, 26/11, 27/11, 28/11) ; § 2 les joueurs ; § 3 le palier et ce qui borne c0025 ; § 4 la sélection ; § 5 ce qui existait déjà ; § 6 une fiche par conception (niches, handicap, voie libre) ; § 7 ce que les relecteurs ont fait tomber ; § 8 leur classement ; § 9 les questions pour Sacha ; § 10 les mesures qui restent et leur coût ; § 11 « Ce que l'on en fait », qui dit seulement « à écrire par la session principale » ; § 12 les fichiers.

Quand une attaque contredit un texte, c'est la version du relecteur qui est écrite, et le texte le dit. Les cas principaux :
- TEST_PAL n'est pas figé, ce qui contredit les niches. Mais il donne d'un coup les pièces et laisse la piste d'un début de partie, ce qui contredit l'épreuve A de la voie libre.
- La prédiction de survie du handicap passe de 60-72 s à 41-62 s.
- La preuve de l'expert des niches coûte 2,0 h et non 1 h 30.
- Le rapport record/médiane de 2,8 et le « 504 pièces par minute » tombent.
- Le champ `morts` ne compte que les morts en vol.
- Sur le « tour 43 % », les deux relecteurs se contredisent : l'un retrouve 6 sur 14, l'autre ne le retrouve pas. Le texte donne les deux versions.

Fichiers gardés, tous dans ml/ecurie/etude/echelle-de-bots/, sans aucune suppression :
- lecteur-joueurs/ : parties.js, a-temps-egal.js, sortie.txt, sortie.json, a-temps-egal.txt
- palier/ : lire-banc.js, debit-et-survie.js, vitesse-et-parfait.js et leurs trois sortie-*.txt
- selection/ : champs-des-lignes.js, palier-et-pieces.js, bruit-par-niveau.js, generations-ryzen.js et leurs .txt, plus genes-par-endroit.txt
- existant/ : paliers-du-labo.js, etendue-population.js, leurs sortie-*.txt et les deux copies d'état du Ryzen au commit f8c071fa0
- niches/ : cases-deja-remplies.js et sortie-cases.txt
- handicap/ : courbe-du-handicap.js et sortie-courbe-du-handicap.txt
- concepteur-libre/ : courbe-de-survie.js et sortie-courbe-de-survie.txt
- relecteur-chiffres/ : recompter.js et sortie-recompter.txt

Ce que la session principale doit trancher :
1. Lancer ou non la première étape du handicap : 5 copies du pilote × 48 graines, hors de ml/evolution, avec la prédiction corrigée à 41-62 s. Les trois relecteurs la placent en tête ou juste derrière.
2. Lancer ou non le test B de la voie libre : 40 courses du banc aux paliers 4 à 8 passées au discerneur, avec un critère d'AUC écrit d'avance.
3. Mesurer d'abord ce que TEST_PAL pose réellement, avec un script et J.ev, avant toute épreuve A. Celle-ci ne servirait que de filtre négatif.
4. Faire ou repousser l'essai des grosses mutations (génération 0 des niches, environ 550 courses). L'étagère elle-même reste à ne pas construire tant que l'écart vrai entre pilotes est sous 0,75 palier.
5. Recalculer sur le cache du Ryzen une note « à durée égale + mort », sans renvoi. L'installer seulement avec la fusion des gènes v4, dans un état neuf.
6. Ne toucher ni au cfg.note, ni au génome, ni à evoluer.js du Ryzen pour l'instant, comme le demandent les trois relecteurs.
7. Poser à Sacha le sens de « ne pas perdre du tout » : le palier 30 sans aucune mort, une seconde chance comptant comme une défaite ?
8. Lui demander fantômes ou bots en direct : c'est ce qui choisit entre la banque de courses et le handicap.
9. Lui demander l'accord pour enrichir l'enregistreur (identifiant anonyme, record, nombre de parties, graine) et faire enregistrer d'autres joueurs, débutants compris. C'est un changement du jeu.
10. Écrire partout que l'expert du palier 30 n'est promis par aucune voie, et que tout niveau au-dessus du palier 21 ou sous le palier 4 est « extrapolé de 2 joueurs habitués, 14 parties ».
