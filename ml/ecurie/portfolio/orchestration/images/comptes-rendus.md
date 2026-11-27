# Les images et la lisibilité du journal : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `images-et-lisibilite-du-journal` (wf_3d7af170-d44), lancée par la session principale (Claude Fable).
- Agents : 20, tous du modèle claude-opus-5-5.
- Durée : 26 min ; jetons consommés par les agents : 2 463 737 (2,46 millions) ; appels d'outils : 547.
- Message de fin du script : « images controlees : 5 sur 5 ; chapitres raccourcis : 8 sur 8 ».
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. auteur de l'image « frise » : un script qui dessine l'image à partir des données du dépôt (phase « Images »)
2. auteur de l'image « ressembler-ou-gagner » : un script qui dessine l'image à partir des données du dépôt (phase « Images »)
3. auteur de l'image « bruit-des-notes » : un script qui dessine l'image à partir des données du dépôt (phase « Images »)
4. auteur de l'image « apprentissages-de-zero » : un script qui dessine l'image à partir des données du dépôt (phase « Images »)
5. auteur de l'image « depenses » : un script qui dessine l'image à partir des données du dépôt (phase « Images »)
6. auteur de la version courte du chapitre « 00_avant-le-22-novembre » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
7. auteur de la version courte du chapitre « 2026-11-22_23 » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
8. auteur de la version courte du chapitre « 2026-11-24 » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
9. auteur de la version courte du chapitre « 2026-11-25 » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
10. auteur de la version courte du chapitre « 2026-11-25_suite » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
11. auteur de la version courte du chapitre « 2026-11-26 » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
12. auteur de la version courte du chapitre « 2026-11-27 » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
13. auteur de la version courte du chapitre « comment-on-a-travaille » : quelques lignes sans jargon en tête du chapitre (phase « Version courte »)
14. contrôleur de l'image « bruit-des-notes » : recontrôle les données à la source, regarde le rendu, corrige (phase « Controle des images »)
15. contrôleur de l'image « depenses » : recontrôle les données à la source, regarde le rendu, corrige (phase « Controle des images »)
16. contrôleur de l'image « frise » : recontrôle les données à la source, regarde le rendu, corrige (phase « Controle des images »)
17. contrôleur de l'image « apprentissages-de-zero » : recontrôle les données à la source, regarde le rendu, corrige (phase « Controle des images »)
18. contrôleur de l'image « ressembler-ou-gagner » : recontrôle les données à la source, regarde le rendu, corrige (phase « Controle des images »)
19. metteur en page : insère les images dans les chapitres, écrit le lexique, met le sommaire à jour (phase « Mise en page »)
20. lecteur dans le rôle d'un juré non programmeur : dit ce qu'il a compris, où il se perd, et corrige en place (phase « Jury »)

## 1. image:frise

*Rôle : auteur de l'image « frise » : un script qui dessine l'image à partir des données du dépôt. Phase : Images.*

### Script

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\frise.js. Pour le lancer : node ml/ecurie/portfolio/figures-journal/frise.js. C'est du Node pur. Le script reprend THEMES de ml/ecurie/portfolio/figures.js (mêmes couleurs : joueurs = vert, machine = bleu) ainsi que la police et les tailles de texte des autres figures. Les sept étapes sont dans le tableau ETAPES en tête du script, chacune avec en commentaire le chapitre (et le commit) d'où viennent sa date et ses mots. La mise en page est calculée : une carte sur deux au-dessus de l'axe, une sur deux en dessous, et une carte qui toucherait sa voisine du même côté est repoussée vers la gauche. Avant d'écrire, le script contrôle trois choses : qu'aucun texte ne sorte du cadre, qu'aucun texte n'en chevauche un autre, et qu'aucun trait de rappel ne passe sur un texte. Sinon il s'arrête sur une erreur (ce contrôle a attrapé un « en cours » mal placé, que j'ai corrigé). Dernière sortie : 4,40 px par jour à gauche, 91,0 à droite (21 fois plus), cassure de 33 jours.

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-frise-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-frise-sombre.svg

### Légende

De septembre à octobre, deux essais d'apprentissage ont duré des semaines. Puis, entre le 22 et le 27 novembre, la méthode a changé cinq fois : quatre virages décidés par Sacha (rond plein), trois par Claude (losange creux), et l'axe du temps grossit 21 fois après la cassure, qui cache 33 jours sans changement. Source : le journal de bord (LISEZ-MOI, § 2, et les chapitres), commits deacc99ad, 6f4dbdc29, d2ee1f114 et ef630b812.

### Chapitre

ml/ecurie/portfolio/journal/LISEZ-MOI.md, section « ## 2. Le fil : les changements de méthode ». L'image y remplace le schéma en texte (le bloc ``` qui va de « sept. » à « 27 nov. »), juste avant la liste à puces. Autre place possible si le LISEZ-MOI doit rester en texte : 2026-11-27.md, après « ## La méthode, en mots simples ».

### Données

Sept points sur l'axe du temps. Chacun porte sa date, son nom, une ligne en italique, ce qui l'a arrêté et la personne qui a décidé le virage.
1) 7/09/2026, « Sélection sur copie ». La date est la première trace dans git (commit deacc99ad, 2026-09-07, qui ajoute ml/sim et ml/train ; 00_avant-le-22-novembre.md, « Ce qu'on a tenté »). Arrêt : « la copie avait divergé du jeu » (00, « Sur la copie du jeu » ; LISEZ-MOI § 3). Décidé par Sacha : son souhait et sa règle « la moitié la plus nulle se fait remplacer » (LISEZ-MOI § 2 ; 00, « Les décisions »).
2) 20/10/2026, « Sélection, vrai jeu » (commit 6f4dbdc29, 2026-10-20 ; 00). Arrêt : « 3 survivants sur 6 pistes neuves » (00 : « Sur 6 pistes jamais vues : 3 survivent »). Décidé par Sacha : bots « fonctionnels sur la version actuelle du jeu », « c'est ce qui mène à ml/reel » (00, « Les décisions »).
3) 22/11, « Cerveaux écrits lisibles » (commit d2ee1f114, 2026-11-22 ; 2026-11-22_23.md). Arrêt : « étapes 2 à 8 remplacées (24/11) » (2026-11-24.md, « Les décisions » : le nouveau PLAN.md « remplace les étapes 2 à 8 du plan d'origine »). Décidé par Claude (2026-11-22_23.md : « une proposition de Claude »).
4) 24/11, « Indiscernables des joueurs » (commit ef630b812 ; 2026-11-24.md). Ligne en italique : « un nouveau but, pas une méthode » (LISEZ-MOI § 2). Arrêt : « un but toujours en vigueur » (2026-11-27.md, « La question du moment »). Décidé par Sacha.
5) 25/11, « Boucle d'agents payés » (2026-11-25.md, 2026-11-25_suite.md). Arrêt : « aucun gain sur des courses neuves » (25_suite, « En une phrase »). Décidé par Sacha : payer sur les 200 € de crédit d'API (« Les décisions » du 25/11).
6) 26/11, « Pilote réglé manuellement » (2026-11-26.md). Arrêt : Sacha, « ne me correspond pas vraiment » (2026-11-27.md, 15 h 25 UTC). Décidé par Claude (« Claude décide de ne pas relancer la boucle payante telle quelle »).
7) 27/11, « Sélection naturelle hybride » (2026-11-27.md). Arrêt : « construite, n'a pas encore tourné » (2026-11-27.md : « La sélection elle-même n'a pas encore tourné »). Décidé par Sacha ; la forme hybride a été choisie par Claude. Marqué « en cours ».
Valeurs calculées par le script : la cassure vaut 33 jours (du 20/10 au 22/11). Une graduation vaut une semaine à gauche et un jour à droite, et un jour est 21 fois plus large à droite.

### Doutes

- Qui a décidé, pour trois étapes où la décision est partagée. Le 7/09 : Sacha a fixé la règle, Claude a choisi les réseaux et les notes (LISEZ-MOI § 2) ; j'ai marqué Sacha. Le 25/11 : Sacha a demandé de payer sur les crédits d'API, mais la boucle venait du plan de Claude et Claude (agent Opus) a choisi Sonnet ; j'ai marqué Sacha. Aucune source ne dit en clair qui a décidé ce virage-là. Le 27/11 : Sacha a décidé le cap, Claude a choisi la forme hybride ; j'ai marqué Sacha. Avec deux marques seulement, une décision partagée ne peut pas se voir.
- La date du 7 septembre est la première trace dans git (deacc99ad). Le plan du 22/11 parle de « juillet → septembre », et le titre du chapitre 00 dit seulement « Septembre ». La frise commence donc au 7/09, pas en juillet.
- « Arrêtée par » est parfois approximatif. La boucle payante n'a pas vraiment été arrêtée le 25/11 : Claude a décidé de ne pas la relancer le 26/11, mais Sacha l'a relancée sur le Ryzen le 27/11 (résultat non vérifié). Le nouveau but du 24/11 n'est pas une méthode et n'a pas été arrêté ; la carte le dit en italique. Pour le plan du 22/11, l'« arrêt » retenu est le remplacement de ses étapes 2 à 8 le 24/11, alors que l'idée « Claude écrit » a continué dans la boucle du 25/11.
- Les noms en trois mots sont de moi (par exemple « Cerveaux écrits lisibles », « Boucle d'agents payés »). Ils ne sont pas cités tels quels dans les chapitres.
- À 360 px de large, on lit la structure (les marques, la cassure, les noms en gras), mais les lignes de détail (10 à 12 px dans un dessin de 960) deviennent minuscules. Ce défaut est le même pour toutes les figures du dossier ; une version verticale serait plus lisible sur téléphone.
- Couleurs : j'ai repris les couleurs du dossier, vert « joueurs » pour Sacha et bleu « machine » pour Claude. Le contrôle des couleurs de la skill dataviz passe en clair. En sombre, les deux teintes sont un peu trop claires pour la plage visée par le contrôle (0,73 au lieu de 0,72 au plus) : ce sont les couleurs que le dossier utilise déjà en sombre, je les ai gardées. Les formes (rond plein, losange creux) suffisent sans la couleur, même imprimé en noir et blanc.
- frise.js charge ml/ecurie/portfolio/figures.js (qui charge ml/bot/mesures.js) pour reprendre THEMES. Il n'utilise aucune bibliothèque, mais il dépend de ces deux fichiers du dépôt.
- Pendant que je travaillais, git status montrait trois chapitres modifiés (00, 22_23, 24) et d'autres images journal-* : c'est le travail d'autres équipes, je n'y ai pas touché. Je n'ai fait aucun commit. Les PNG de contrôle sont restés dans le dossier temporaire, hors du dépôt.

## 2. image:ressembler-ou-gagner

*Rôle : auteur de l'image « ressembler-ou-gagner » : un script qui dessine l'image à partir des données du dépôt. Phase : Images.*

### Script

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\ressembler-ou-gagner.js. Il se lance avec « node ml/ecurie/portfolio/figures-journal/ressembler-ou-gagner.js », en Node pur et sans dépendance. Il ne joue aucune course. Il lit ml/labo/journal/cerveaux.jsonl (cerveau c0003), ml/ecurie/ETAPES.md (par expressions régulières sur la phrase « À 8 : `pilote.js` **3,05** … » et sur deux lignes du tableau de la nitro), ml/bot/results/etalon-sacha.json, et quatre anciennes versions de ml/bot/results/note-pilote-voltige-allege.json par « git show » (commits 63012939f, c72d25ecf, 830cdf573, 1ee936e15). Pour chaque note, il vérifie qu'on a bien 20 graines (910000, pas de 37), tmax 900, le régime allégé et 20 parties. Il vérifie aussi que l'écart de 2,02 donné par ETAPES.md est le même que celui de c72d25ecf. Si une valeur manque ou si une étiquette ne trouve pas de place libre, il s'arrête sans rien écrire. Les étiquettes sont posées par calcul : huit places possibles autour de chaque point, quatre distances, et un test de collision avec les autres textes, les points, les flèches et les pointillés. Le bloc de tête du script liste les points écartés et la raison de chaque écart. Palette, police et classes de texte sont reprises de figures.js (THEMES clair et sombre).

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-ressembler-ou-gagner-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-ressembler-ou-gagner-sombre.svg

### Légende

Chaque version du pilote est placée selon deux mesures : sa ressemblance aux joueurs (plus à gauche, plus il joue comme eux) et le niveau qu'il atteint dans la course (plus haut, plus il va loin). En deux jours, il s'est beaucoup rapproché des joueurs (écart de 3,05 à 1,67), mais il est descendu du palier 11 au palier 7,5, alors que les joueurs, eux, sont à la fois ressemblants et hauts (source : 20 courses de 900 s par version, ml/ecurie/ETAPES.md et commits du 25 au 27/11).

### Chapitre

ml/ecurie/portfolio/journal/2026-11-27.md, juste après le titre « ## Ce qu'on a appris » : l'image montre l'arbitrage entre palier et ressemblance qui a conduit, ce jour-là, à abandonner le réglage à la main. Autre place possible : 2026-11-26.md, après « ## Ce qu'on a appris », où le chapitre explique l'écart aux joueurs et le palier perdu.

### Données

Toutes les versions du chemin sont notées dans les mêmes conditions : 20 courses de 900 s, graines 910000 + 37k, régime allégé, simulateur relief-canyon. Le script le vérifie.
1. « pilote au sol » (pilote.js, 25/11) : écart 3,05, palier médian 11. Le palier vient de ml/labo/journal/cerveaux.jsonl, cerveau c0003 (note.palier_median). L'écart vient de ml/ecurie/ETAPES.md, « Le soir du 26/11 » (borne 8).
2. « apprend à voler » (pilote-voltige.js, 26/11 après-midi) : écart 2,54, palier 9,5. Le palier vient de la note de 63012939f (git show). L'écart vient de la même phrase d'ETAPES.md, car cette note n'a pas de champ ecart_joueurs.
3. « sort du dessous » (26/11 soir) : écart 2,021, affiché 2,02 ; palier 7. Source : note de c72d25ecf (ecart_joueurs, palier_median).
4. « vol mieux visé » (26/11 fin de soirée) : écart 2,005, affiché 2,00 ; palier 8,5. Source : note de 830cdf573.
5. « plus de nitro » (27/11, 0 h 58) : écart 1,666, affiché 1,67 ; palier 7,5. Source : note de 1ee936e15.
Repère « les joueurs : le but » : palier 10 et écart 0,91, carré vert avec deux traits pointillés vers les axes. Le palier 10 est la médiane des 10 parties de Sacha au clavier (ml/bot/results/etalon-sacha.json, barre.palier_median) : ce sont les joueurs auxquels ressemblance.js compare les bots. L'écart 0,91 est celui d'une partie de joueur comparée aux autres (ETAPES.md ; ml/bot/README.md dit 0,9).
Point écarté « nitro presque partout » (27/11, pas gardée) : losange creux relié par des pointillés à la version 5. Son écart, 1,30, est la moyenne des deux lots 1,33 et 1,27. Son palier médian est 6, contre 7 pour la version gardée dans le même tableau d'ETAPES.md. L'étiquette dit qu'il a été mesuré à part, sur 24 courses de 300 s.
Points non tracés, chacun parce qu'une valeur manque dans ces conditions : le premier jet de pilote-voltige (d6014a657 : 12 courses, aucun écart) ; le départ et les portails en vol (dd807f338 : 12 courses, sans grande note à part) ; la grotte rouverte (1eea0a44e) ; les écarts calculés avec l'ancienne borne 4 (2,67 et 2,33, 8d7edc258).

### Doutes

- Le titre ne reprend pas tel quel « chaque pas vers les joueurs a coûté des paliers », parce que c'est faux pour un pas : de la version 3 à la 4 (correction de la loi de vol), le pilote a regagné 1,5 palier (7 → 8,5) sans que l'écart bouge (2,02 → 2,00). Le titre dit donc le bilan, vrai : « En se rapprochant des joueurs, le pilote a perdu des paliers : 11 au départ, 7,5 à la fin ».
- Les écarts 3,05 (pilote.js) et 2,54 (après-midi) sont recopiés depuis ETAPES.md. Ils ne sont dans aucun fichier de note du dépôt, et je n'ai pas pu vérifier sur quelles parties ressemblance.js les a calculés. Les paliers de ces deux points, eux, viennent bien de notes de 20 courses de 900 s.
- Le point 3 (« sort du dessous ») contient aussi le réglage du départ et des portails en vol (dd807f338), commité entre la note de l'après-midi et celle du soir : son nom de trois mots ne raconte qu'une partie du changement.
- Les joueurs ne sont pas mesurés dans les mêmes conditions que le pilote : ce sont de vraies parties sans limite de 900 s. Leur palier 10 ne compte que les 10 parties de Sacha au clavier ; avec les 4 parties de Léo, l'étalon complet donne 11,5 (etalon.json). J'ai pris 10 parce que l'écart aux joueurs se mesure contre les joueurs au clavier.
- La variante « nitro presque partout » est placée à son palier médian de 24 courses de 300 s (6), sur un axe défini pour les courses de 900 s. L'étiquette le dit (« mesurée à part »), mais un lecteur pressé peut la comparer directement. Le commit 1ee936e15 parle de « 2 paliers » perdus ; le tableau donne 6 contre 7 en médiane (147 contre 181 paliers au total).
- À 360 px de large, le texte de 10 à 12 px devient illisible (comme dans les autres figures du dossier). On lit encore la forme : un chemin qui part vers la gauche en descendant, et le carré des joueurs en haut à gauche. Pour une page de téléphone, il faudrait une version recadrée avec moins de texte.
- Le skill dataviz a été chargé. Je n'ai pas lancé son validateur de palette : l'image a une seule série et reprend les couleurs déjà en usage dans figures.js. En noir et blanc, les trois objets se distinguent par leur forme (disques numérotés pleins, carré plein, losange creux en pointillés).
- Rendu vérifié avec Chrome sans écran, dans les deux palettes : aucun texte ne se chevauche ni ne sort du cadre. Les PNG sont restés dans le dossier temporaire, hors du dépôt. Rien n'est commité.

## 3. image:bruit-des-notes

*Rôle : auteur de l'image « bruit-des-notes » : un script qui dessine l'image à partir des données du dépôt. Phase : Images.*

### Script

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\bruit-des-notes.js. Pour le lancer : « node ml/ecurie/portfolio/figures-journal/bruit-des-notes.js ». Il n'utilise que Node, sans rien installer, et ne lance aucune course. Il lit ml/ecurie/etude/selection-naturelle/bruit/courses-0.json et regroupe les pilotes par empreinte (sha), exactement comme analyser.js. Il refait ensuite l'analyse de variance « pilote × graine » d'analyser.js, avec la même formule, et s'arrête si les chiffres ne retombent pas sur resultats.txt. Les contrôles affichés passent tous : 34 pilotes, 24 graines, écart-type résiduel 3,208 (le fichier dit 3,21), écart-type entre pilotes 0,860 (0,86), palier moyen du lot 910000 7,556 (7,56) et du lot 930000 6,757 (6,76). Il calcule les positions du texte et s'arrête si une étiquette chevauche les points, sort du cadre ou touche la source. La palette (THEMES) et le contrôle XML (verifierSvg) viennent de figures.js par require, ce qui donne au dossier la même main : mêmes couleurs, même police system-ui, mêmes tailles de texte. Il écrit les deux SVG dans ml/ecurie/portfolio/images/.

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-bruit-des-notes-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-bruit-des-notes-sombre.svg

### Légende

Trente-quatre versions du pilote ont couru les mêmes 24 courses : chaque point est une course, chaque trait épais la moyenne d'un pilote. D'une course à l'autre, le palier d'un même pilote varie de 3,2 en écart-type, alors que les pilotes ne diffèrent vraiment que de 0,86 ; il faudrait donc environ 140 courses par pilote pour voir un palier de différence (source : ml/ecurie/etude/selection-naturelle/bruit/, commit 033bfebeb).

### Chapitre

ml/ecurie/portfolio/journal/2026-11-27.md, section « ## Ce qu'on a tenté ». L'image va juste après la puce « **L'étude du bruit** », celle qui donne 3,2 contre 0,86 et les 140 courses, avant la puce « **La spécification** ». Elle peut aussi servir dans comment-on-a-travaille.md, au paragraphe « **Sur la méthode.** ». Mais sa place principale est le 27/11, parce que c'est elle qui a fixé la règle : on juge un bot sur toutes ses courses.

### Données

Toutes les données viennent de ml/ecurie/etude/selection-naturelle/bruit/courses-0.json (dans git depuis le commit 033bfebeb). Elles sont recalculées à chaque lancement du script, rien n'est recopié à la main.

1) Les nuages : 816 points, soit 34 pilotes × 24 courses. Les 34 pilotes sont ceux qui ont les deux lots de 300 s. Les 24 courses sont les 12 graines du lot 910000 suivies des 12 du lot 930000, toujours dans le même ordre, ce qui est vérifié. Chaque point est le champ « palier » d'une course. Les paliers vont de 1 à 19. Quand plusieurs courses tombent sur le même palier, leurs points sont posés côte à côte dans la colonne du pilote.

2) Les traits épais : la moyenne de chaque pilote sur ses 24 courses, qui sert aussi à les ranger. Le moins bon est pQ4 (5,04), le meilleur pZ3 (9,29). Les deux valeurs sont écrites sous leur trait : 5,0 et 9,3.

3) La ligne pointillée : la moyenne de toutes les courses, 7,16.

4) Les deux accolades à droite, centrées sur 7,16. La fine vaut ± 3,2 : c'est l'écart-type résiduel de l'analyse de variance, 3,208, égal au 3,21 de resultats.txt (section 2, ligne « palier »). L'épaisse vaut ± 0,86 : c'est l'écart-type entre pilotes, 0,860, égal au 0,86 de la même ligne.

5) Le titre : sur les 24 courses où pQ4 et pZ3 ont la même graine, donc la même piste, pQ4 fait mieux 3 fois et égalise 4 fois, d'où « 7 fois sur 24 ». C'est calculé par le script.

6) La légende cite 140 courses : c'est resultats.txt, section 4, ligne « palier_moyen delta 1 », graines communes.

Contrôle croisé : les paliers moyens des deux lots, recalculés, valent 7,556 et 6,757, contre 7,56 et 6,76 dans resultats.txt (section 1).

### Doutes

- Le rangement amplifie un peu les écarts. Les pilotes sont rangés par la moyenne de ces mêmes 24 courses, donc les moyennes vont de 5,0 à 9,3 alors que la vraie dispersion n'est que de 0,86. Une partie de cet étalement vient du bruit de la moyenne elle-même. L'accolade de 0,86 le montre, mais un lecteur pourrait croire que l'écart 5,0 / 9,3 est réel.
- Le 3,2 n'est pas tout à fait l'écart-type brut d'une course à l'autre. C'est la part résiduelle de l'analyse de variance, une fois retirés l'effet du pilote et l'effet de la graine. L'écart-type brut de toutes les courses vaut 3,59. Le sous-titre dit simplement « varie de 3,2 », comme le chapitre du 27/11.
- Le titre « 7 fois sur 24 » réunit 3 victoires et 4 égalités du moins bon pilote. Si l'équipe préfère ne compter que les victoires, il faudra écrire « 3 fois sur 24 » (le script l'affiche).
- À 360 px de large, la forme se lit : on voit des nuages qui se recouvrent et des traits presque à plat. Mais le texte tombe vers 4 px, donc il faut que la légende du journal porte aussi les deux chiffres. C'est le cas de celle que je propose.
- Je n'ai pas vérifié le noir et blanc avec un vrai rendu en gris. La distinction tient aux formes : points légers, traits épais avec un liseré de la couleur du fond, accolades fine et épaisse. Elle ne repose pas sur la couleur.
- Le validateur de palette de dataviz n'a pas été lancé. Il n'y a qu'une seule série, et ses couleurs (th.pilote, th.texte) sont celles de figures.js, déjà utilisées dans les autres images du dossier.
- Les largeurs de texte sont estimées par caractère, comme dans figures.js. Les rendus Chrome des deux palettes ont été regardés et sont propres, mais une autre police système pourrait légèrement allonger les étiquettes de droite.

## 4. image:apprentissages-de-zero

*Rôle : auteur de l'image « apprentissages-de-zero » : un script qui dessine l'image à partir des données du dépôt. Phase : Images.*

### Script

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\apprentissages-de-zero.js. On le lance avec « node ml/ecurie/portfolio/figures-journal/apprentissages-de-zero.js ». C'est du Node pur, sans dépendance. Il reprend THEMES (la palette) et verifierSvg (le contrôle du XML) de ml/ecurie/portfolio/figures.js, ce qui donne la même main que les cinq figures existantes : même police system-ui, mêmes classes de texte, mêmes couleurs ; le trait fort est la couleur « machine ». Il lit les données dans le dépôt et écrit les deux SVG. Avant d'écrire, il vérifie trois choses : les deux fichiers de ml/train correspondent bien au run de 300 générations, hist contient bien 57 valeurs, et le champion de ml/reel tombe sur la même valeur que hist. Chaque étiquette reçoit une boîte estimée. Le script refuse d'écrire (sortie 1) si une étiquette sort du cadre, en chevauche une autre ou est traversée par un trait de données ; ce contrôle a servi à replacer quatre étiquettes. L'en-tête du script donne la liste des fichiers écartés et la raison de chaque écart :
- run-seed1202, 1303, 1404, 1505 et 1606 (19/09, 50 générations) : copie du jeu d'avant le drift (f1c258f81), et une médiane calculée avec eux changerait de population à la 50e génération ;
- run-seed7, 42, 100, 200, 300, 400, 500, 1707, 1808, 1909, 2010 et 2111 (10 au 18/09) : les manches n'ont pas la même durée (c'est avant la manche proportionnelle à la piste, 15dcf1276). seed42 n'a que 2 valeurs, et seed7 a une courbe de 18 à 22 m que je n'explique pas ;
- run-seed2024 : le mode freestyle, noté sur les figures, donc une autre grandeur (7cfdb6ec9) ;
- run-seed1101-sync : il tourne après la remise à niveau de la physique (71bac35b6), donc dans un autre jeu ;
- les fichiers multi-*.json : ce sont des totaux, sans courbe par génération.

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-apprentissages-de-zero-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-apprentissages-de-zero-sombre.svg

### Légende

En septembre et octobre 2026, des voitures pilotées par de petits réseaux partis de zéro ont été sélectionnées génération après génération : dans une copie du jeu, leur meilleure distance passe d'environ 1,1 km à 8,5 km ; dans le vrai jeu, de 1,4 km à un record de 3,6 km, puis elle plafonne. Elles n'ont pas appris les figures : 0 figure pour le meilleur cerveau des 300 générations, 0,2 par partie pour le champion du vrai jeu sur des pistes neuves (sources : ml/train/results/runs, ml/reel/results, commits 5799d5bb1 et 6f4dbdc29).

### Chapitre

ml/ecurie/portfolio/journal/00_avant-le-22-novembre.md, juste après le titre « ## Ce qu'on a tenté » et sa liste. La liste se termine sur la puce « Quitter la copie : ml/reel (20 octobre) » (57 générations, 0,2 figure par partie), et l'image vient avant « ## Ce qu'on a appris ». Elle montre exactement les deux dernières puces de la liste (le run de 300 générations et ml/reel), et le premier paragraphe de « Ce qu'on a appris » explique pourquoi les figures n'apparaissent pas.

### Données

Panneau de gauche, « Dans une copie du jeu (ml/train) » :
- 299 points en trait fin plein, tirés du champ « courbe » de ml/train/results/runs/run-seed1000.json ;
- 299 points en trait fin à tirets, tirés du champ « courbe » de run-seed1101.json.
Les deux fichiers viennent du run de 300 générations du 20/10 (fichiers datés 13:12 et 13:23 UTC ; dernière écriture au commit 5799d5bb1). « courbe » contient la meilleure distance parcourue dans chaque génération (sim-train.js, genMaxTotD) ; l'indice i correspond à la génération i+1. Les valeurs sont converties en km.
- Trait fort : la médiane glissante des deux essais sur 21 générations, calculée à partir de ces mêmes points.
- Étiquette « 1,1 km au départ » : la médiane des 5 premières générations des deux essais (1,11 km).
- Étiquette « 8,5 km à la fin » : la médiane des 100 dernières générations (8,51 km).
- Annotation « 0 figure » : commit 5799d5bb1 (« toujours 0 figure » ; le cerveau champion rejoué sur 24 bots donne une « aura totale 0 » ; dans ce run, la note payait les figures avec FIG_W_AURA=3).
Panneau de droite, « Dans le vrai jeu (ml/reel) » :
- 57 points (générations 0 à 56), tirés du champ « hist » de ml/reel/results/pop-reel-g1.json. C'est la meilleure distance de chaque génération en 40 s de jeu (entrainer.js, hist.push(best)), convertie en km.
- « 1,4 km au départ » : hist[0] = 1 391 m.
- Record cerclé : 3,6 km à la génération 43 (3 616 m). La valeur est recoupée avec ml/reel/results/champion-reel-g1.json (gen 43, dist 3616).
- Annotation « 0,2 figure par partie, le champion sur 6 pistes jamais vues » : commit 6f4dbdc29.

### Doutes

- La consigne demandait « plusieurs graines, la médiane en trait fort ». Le seul run qui compte les figures après 300 générations (5799d5bb1) n'a que deux graines, et je n'ai pas voulu y ajouter les cinq graines du 19/09 : elles tournent dans une autre version de la copie et ne vont que jusqu'à 50 générations. Le trait fort est donc une médiane glissante (21 générations, deux essais), et c'est écrit dans le sous-titre du panneau.
- Le titre dit « presque jamais à voler », comme le chapitre 00, et pas « jamais à voler » comme le proposait la consigne. Les sources montrent des vols, et même 39 % de poses dans ce run : ce sont les figures qui manquent, pas le vol. L'image ne trace aucune donnée de vol.
- Les deux panneaux mesurent la même chose (la meilleure distance d'une génération, en km), mais dans des conditions très différentes : manche proportionnelle à la piste dans la copie, 40 s dans le vrai jeu. J'ai donc mis deux échelles séparées, et la source précise qu'il ne faut pas comparer un panneau à l'autre. Un lecteur pressé pourrait quand même croire que le vrai jeu « fait moins bien ».
- Dans la copie, la meilleure distance par génération saute beaucoup (de 2,2 à 11,7 km après la génération 40). Le chapitre dit que la piste change à chaque génération, mais je ne l'ai pas revérifié pour le run du 20/10. Je ne l'ai donc pas écrit sur l'image.
- La phrase « la note les récompensait un peu » s'appuie sur FIG_W_AURA=3 (titre de 5799d5bb1) et sur l'explication de d140582c5 : une figure pèse peu face à la distance. Je n'ai pas relu le code de la note du 20/10.
- Je n'explique pas la courbe de run-seed7 (18 à 22 m alors que maxTotD vaut 4 384) ; ce fichier est écarté, mais l'anomalie reste.
- Lisibilité à 360 px de large : les courbes, le titre et les chiffres en gras restent lisibles, y compris en gris. Les petits textes (10 à 10,5 px dans le SVG) deviennent minuscules, comme dans les autres figures du dossier, qui utilisent la même échelle de texte.
- Le validateur du skill dataviz met deux contrôles en échec sur la palette de la maison, que j'ai gardée telle quelle pour rester cohérent avec les autres figures. Le gris des traits fins échoue au contrôle de saturation (c'est voulu : c'est un trait de contexte). Le bleu de la palette sombre (#6ea8fe) sort de la bande de clarté conseillée. Le contraste reste correct à l'œil (rendu vérifié).
- Pendant mon travail, git status montrait aussi des chapitres du journal modifiés, et d'autres images journal-*.svg ajoutées. Ce n'est pas moi : je n'ai écrit que mes trois fichiers. Les PNG de contrôle sont dans le dossier temporaire (<dossier temporaire>\scratchpad\adz\clair.png, sombre.png, gris360.png), pas dans le dépôt.

## 5. image:depenses

*Rôle : auteur de l'image « depenses » : un script qui dessine l'image à partir des données du dépôt. Phase : Images.*

### Script

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\depenses.js. On le lance avec « node ml/ecurie/portfolio/figures-journal/depenses.js ». C'est du Node pur, sans dépendance. Il lit ml/labo/journal/depenses.jsonl et regroupe les lignes par poste. Les 19 lignes dont l'étape commence par « K- » forment le calibrage. Pour les autres, le nom de l'agent est pris dans le champ « pour ». Une ligne inconnue arrête le script. Il écrit ensuite les deux SVG, avec la palette, la police, les classes de texte et les marges de 16 px de figures.js. Avant d'écrire, il range chaque texte dans une boîte et refuse d'écrire si deux textes se chevauchent ou si l'un sort du cadre. Ce contrôle a attrapé deux débordements pendant la mise au point. À la fin, il affiche le total et le détail par poste. Les deux seules constantes qui ne viennent pas du fichier lu sont 200 € (le crédit) et 60 € (le plafond du Ryzen). Leur source est notée en commentaire et sous l'image.

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-depenses-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-depenses-sombre.svg

### Légende

Sur les 200 € de crédit d'API, 36,92 € ont été dépensés sur ce PC, tous le 25/11. Presque tout a payé les agents qui ont écrit le premier pilote, l'ont contrôlé et ont fait le portfolio. Seuls 4,63 € ont payé des variantes du pilote écrites par quatre modèles, et aucune n'a tenu sur des courses neuves ; ce qu'a dépensé la boucle du second PC (plafonnée à 60 €) n'est pas vérifié ici. Source : ml/labo/journal/depenses.jsonl ; journal du 25/11 (suite) et du 27/11.

### Chapitre

ml/ecurie/portfolio/journal/2026-11-25_suite.md, section « ## Les chiffres », juste avant la phrase « Un point de méthode sur l'argent… ». Cette phrase explique la mention « 1 € compté pour 1 $ » de l'axe. Une autre place possible : LISEZ-MOI.md, près du point 10 du « chantier en dix lignes » (36,92 € sur 200, le Ryzen non vérifié).

### Données

Toutes les barres viennent de ml/labo/journal/depenses.jsonl : 26 lignes, toutes datées du 25/11/2026, total recalculé 36,92. Les postes, du plus cher au moins cher :
- Écrire le premier pilote : 11,63 €, agent Fable 5.2, ligne « pilote », rapport agents/2026-11-25T12-31-34-pilote.md.
- Finir les yeux et la main, contrôler le pilote : 8,71 €, Opus 5.5, ligne « finitions-b », rapport 2026-11-25T13-39-09-finitions-b.md.
- Dessiner les images du portfolio : 7,07 €, Opus, ligne « images ».
- Mettre quatre modèles à l'épreuve : 4,63 €. Ce sont 19 lignes « K- » : 18 « candidat » et 1 « variante perdue ». Par modèle : Haiku 0,06, Sonnet 0,77, Opus 1,89, Fable 1,91 €. Ces chiffres sont identiques au tableau de 2026-11-25_suite.md.
- Écrire la page du portfolio : 3,83 €, Opus, ligne « portfolio ».
- Choisir le modèle de la boucle : 0,71 €, Opus, ligne « choix-modele ».
- Écrire le compte rendu n° 2 : 0,34 €, Sonnet, ligne « compte-rendu ».
- Essayer la facturation : 0,00 €, Haiku, ligne « essai ».

La barre du crédit :
- 200 € : journal/2026-11-25.md (« plafond général de 200 € »).
- 60 € de plafond pour le Ryzen, hachurés, sans aucun chiffre de dépense : journal/2026-11-27.md, lignes 17 et 42, et LISEZ-MOI.md, ligne 130.
- « Au moins 103,08 € encore libres » = 200 − 36,92 − 60, à condition que la boucle s'arrête à son plafond.

L'annotation :
- « Aucune variante n'a gagné un palier qui tienne sur des courses neuves » reprend la phrase de 2026-11-25_suite.md, ligne 3 (« aucune n'a gagné un palier qui tienne sur des courses neuves »). Le titre reprend LISEZ-MOI.md, ligne 16 (« Aucune n'a tenu sur des courses neuves »).
- « 13 contre 11, puis 10,5 contre 11 sur 20 courses neuves » vient de 2026-11-25_suite.md, lignes 15 et 46 (c0011, commit 8610302d2).
- L'axe porte « 1 € compté pour 1 $ » : en-tête de ml/ecurie/agent-api.js et 2026-11-25_suite.md, ligne 59.

### Doutes

- Lisibilité à 360 px non respectée : le viewBox fait 960 de large, comme les autres figures du dossier, donc à 360 px le petit texte (10,5 px) tombe vers 4 px. Mon essai de rendu à 360 px a échoué (Chrome refuse de charger un fichier local depuis une page data:). Il faudrait une version étroite séparée si c'est vraiment exigé.
- Je n'ai pas lancé le validateur de palette du skill dataviz. Il n'y a qu'une couleur de série (le bleu « machine » de figures.js) ; la zone hachurée et la zone libre se distinguent par leur forme (hachures, pointillés, contour seul). Le rendu en niveaux de gris n'a pas été contrôlé, seulement raisonné.
- La barre jaune prévue pour « Essayer la facturation » (0,00 €) ne se dessine pas, puisqu'elle mesure zéro : seule la valeur « 0,00 € » apparaît. C'est sans effet visible.
- « Aucune variante n'a gagné un palier qui tienne sur des courses neuves » : à proprement parler, seule c0011 (Sonnet) est allée jusqu'à la validation sur 20 graines neuves. Les autres ont été écartées plus tôt, au tri ou en note « en grand ». La phrase est celle du journal, mais elle résume les deux cas.
- Les montants sont des estimations en dollars, inscrites telles quelles comme des euros (« la facture fait foi »). C'est dit sous l'axe et dans la source.
- « Au moins 103,08 € encore libres » suppose que le Ryzen respecte son plafond de 60 € et que rien d'autre n'a été payé hors de ce journal. Ce n'est vérifié nulle part ici.
- Les noms des postes sont des reformulations à moi. Exemple : « Finir les yeux et la main, contrôler le pilote » pour l'agent finitions-b, d'après son rapport et le journal du 25/11.

## 6. court:00_avant-le-22-novembre

*Rôle : auteur de la version courte du chapitre « 00_avant-le-22-novembre » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\00_avant-le-22-novembre.md

### En une minute

## En une minute

- On voulait des voitures qui apprennent seules à conduire, voler et faire des figures, sans qu'on leur écrive la conduite.
- En septembre, Claude a fait naître des générations de petits cerveaux artificiels dans une copie du jeu. La règle venait de Sacha : à chaque manche, la moitié la plus nulle est remplacée.
- Les voitures ont appris à rouler loin. Mais même après 300 générations, aucune ne faisait de figure.
- Pendant ce temps, le vrai jeu changeait et la copie ne suivait pas : ce que les bots apprenaient ne valait plus pour le vrai jeu.
- En octobre, à la demande de Sacha, Claude a refait l'essai dans le vrai jeu. Sur des pistes neuves, le meilleur bot mourait en vol une fois sur deux.
- Ensuite, un mois entier sans travail sur les bots.
- Fin novembre, Sacha reviendra à cette sélection, mais en partant d'un pilote qui sait déjà conduire.

(Notes de travail : ce chapitre ne contient aucun angle en radians, donc aucun degré n'a été ajouté ; les seuls degrés présents, « moins de 20° », y étaient déjà. Ajouts sourcés : un point « Des outils qui trompaient, réparés » avec f04968496 et 71008e4a5 (09/09) et 12a487868 (10/09, qui cite e62f924f4) ; un point « Un mois sans travail sur les bots » avec a29e839d2 (11/11), le seul commit de ml entre le 21/10 et le 21/11 d'après git log. Les quatre commits sont ajoutés à la liste des sources. Pour 71008e4a5, je cite le message tel quel, « recul vol ~x16 », sans l'interpréter, parce que son sens n'est pas certain. J'ai ajouté deux phrases « ce qu'on voit » : l'une après les trois récompenses de figures, l'autre après le tableau des chiffres. J'ai ajouté des demi-phrases d'explication pour nitro, assiette, commit, sans écran, agents critiques, pas, graine, saturées/mortes, re-normalisation, médian, bruit, drift et muet. Aucun chiffre, aucune source, aucune citation ni aucune impasse n'a été retiré ou modifié.)

### Mots à définir

- Neuroévolution : faire évoluer des cerveaux artificiels par générations, comme une population animale, au lieu d'écrire la conduite à la main.
- Réseau de neurones : un petit calcul qui transforme ce que la voiture « voit » en touches appuyées.
- Génération : une manche où toutes les voitures courent, après quoi les moins bonnes sont remplacées.
- Mutation : une petite modification au hasard du cerveau d'un enfant.
- Croisement : un cerveau d'enfant fait en mélangeant ceux de deux parents survivants.
- Graine : le numéro qui fixe le hasard d'un essai ; avec la même graine, on obtient les mêmes tirages et la même piste.
- Note (fitness) : le score qui sert à classer les voitures, ici surtout la distance parcourue.
- Copie du jeu (ml/train) : une version du jeu prise en juillet pour l'entraînement, qui n'a pas suivi le jeu publié.
- Sans écran : faire tourner le jeu en calcul seul, sans image, pour aller beaucoup plus vite.
- Pas : un instant de calcul de la simulation ; le jeu avance pas à pas.
- Entrée saturée ou morte : une information donnée au cerveau qui reste toujours au maximum, ou ne change jamais, et ne lui apprend donc rien.
- Normalisation : remettre les informations données au cerveau à une échelle comparable.
- Médiane : la valeur du milieu quand on range les essais du pire au meilleur.
- Bruit : des écarts que le hasard produit seul d'un essai à l'autre, et qui ne prouvent rien.
- Récitation (surapprentissage) : un cerveau qui a appris une piste par cœur et ne sait plus conduire sur une autre.
- Clonage : apprendre au bot en lui faisant imiter des parties enregistrées d'un joueur.
- Taux de pose : la part des décollages qui finissent par un atterrissage réussi sur la route.
- Agent critique : une autre session de Claude chargée de relire le travail et de le contester.
- Commit : un enregistrement daté dans l'historique du code (git), avec un message qui dit ce qui a changé.
- Champion : le meilleur cerveau d'un entraînement, gardé pour être rejoué.
- Nitro : le turbo du jeu ; le même bouton, tenu, sert à accélérer et, tapé deux fois, à lancer une figure.
- Assiette : l'inclinaison avant-arrière de la voiture en vol, le nez qui monte ou qui descend.
- Greffé, muet : un réseau ajouté à un pilote déjà écrit, réglé pour ne rien changer à la conduite au départ, puis libre d'évoluer.

### Retouches

22

## 7. court:2026-11-22_23

*Rôle : auteur de la version courte du chapitre « 2026-11-22_23 » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-22_23.md

### En une minute

## En une minute

On voulait des bots qui jouent vraiment : rouler, voler, faire des figures.
Les deux essais d'avant avaient appris à rouler, presque jamais à voler.
Claude a proposé une autre voie : écrire lui-même le cerveau du bot, et laisser le vrai jeu le noter.
Il a remis le vrai jeu en marche sans écran, puis il a fixé ce que le bot voit et ce qu'il a le droit de toucher.
Sacha a joué ses cinq premières parties pour servir de barre : il passe environ un tiers du temps en l'air, le premier bot moins d'un dixième.
Ce qui a raté, on ne l'a vu que le lendemain : une relecture a trouvé de nombreux défauts, dont plusieurs dans le travail de ces deux jours.
La nouvelle voie est une idée de Claude ; Sacha ne l'avait pas encore validée.

(Autres retouches : le chapitre ne contient aucun angle en radians, donc aucun degré ajouté. Demi-phrases d'explication ajoutées pour commit, modèle de langage, processus neuf, « au bit près », cœurs, version allégée, seconde chance et agents Opus. Une phrase « Ce qu'on y voit » ajoutée avant le tableau des chiffres : face à Sacha, la référence survit moins longtemps, gagne moins, vole près de quatre fois moins (9,6 % contre 36,2 %), ne prend presque aucun raccourci, mais pose un peu plus de figures (5,9 contre 5,49). Aucun chiffre, aucune source, aucune impasse, aucune citation retirés ni changés.)

### Mots à définir

- Crédit d'API : l'argent prépayé qui permet à un programme d'appeler les modèles de Claude, sans passer par l'abonnement.
- Réseau de neurones : un calcul qui transforme ce que la voiture « voit » en touches à presser, réglé par essais plutôt qu'écrit à la main.
- Génération : un tour de sélection où les moins bons bots sont remplacés par des copies modifiées des meilleurs.
- Simulateur (sans écran) : le vrai jeu exécuté par l'ordinateur sans rien afficher, pour jouer des courses bien plus vite qu'un humain.
- Node : un logiciel qui fait tourner le code JavaScript du jeu en dehors d'un navigateur.
- Graine : le nombre qui fixe le tirage de la piste ; même graine, même piste.
- Processus neuf : un programme relancé de zéro, qui ne garde rien des courses précédentes.
- Au bit près : identique jusqu'au moindre chiffre enregistré.
- Fois le temps réel : combien de secondes de jeu l'ordinateur joue pendant une seconde d'horloge.
- Cœur (de processeur) : une unité de calcul de l'ordinateur ; plusieurs cœurs travaillent en parallèle.
- Contrat du bot : les règles fixes de ce que tout cerveau de bot peut voir et faire.
- Bac fermé : la zone où tourne le cerveau du bot, censée le priver de fichiers, de réseau, d'horloge et de hasard.
- Bot de référence : un bot écrit à la main, sans apprentissage, qui sert de point de départ à battre.
- Étalon : la barre de mesure faite des parties de vrais joueurs, à laquelle on compare les bots.
- Version allégée : le réglage du jeu qui retire des détails de l'image pour les téléphones et les machines lentes.
- Seconde chance : l'option du jeu qui permet de repartir après une mort.
- Nitro : la jauge d'accélération du jeu, qui sert aussi à voler et à faire des figures.
- Raccourci : un tronçon de route en contrebas qu'on atteint en volant, et qui fait gagner du chemin.
- Agent : une autre session de Claude lancée pour une seule tâche.
- Sceptique : un agent chargé de contredire un relecteur en relisant le code lui-même.
- Commit : un enregistrement daté dans l'historique du projet, avec un message qui dit ce qui a changé.
- Modèle de langage : un programme comme Claude, qui écrit du texte et du code.

### Retouches

11

## 8. court:2026-11-24

*Rôle : auteur de la version courte du chapitre « 2026-11-24 » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-24.md

### En une minute

Avant de fabriquer des centaines de bots, il fallait savoir garder une trace exacte de chacun.
Claude a construit cet enregistreur : il rejoue une course à l'identique et sait la filmer.
En route, une surprise : l'ordinateur qui notait les bots faisait tourner une version plus riche du jeu que celle des joueurs.
Les bots étaient donc jugés sur un jeu que personne ne jouait ; désormais, ils jouent la version des joueurs.
Un juge automatique reconnaît encore le bot presque à tous les coups, mais sur trop peu de courses pour conclure.
Sacha a fixé un nouveau but : des bots qu'on ne distingue pas de vrais joueurs, du plus faible au plus fort.
Il a aussi demandé que les 200 € de crédit soient dépensés en deux semaines.

### Mots à définir

- Simulateur : le vrai jeu que l'ordinateur fait tourner sans écran, plus vite que le temps réel, pour noter les bots.
- Commit : un enregistrement daté du code dans git, avec un message qui dit ce qui a changé.
- Étalon : les parties enregistrées de vrais joueurs (Sacha au clavier, Léo au téléphone) qui servent de barre de comparaison.
- Cerveau : le fichier de code qui décide, image après image, des touches que presse le bot.
- Graine : un nombre qui fixe le hasard d'une course, pour pouvoir rejouer exactement la même.
- Empreinte : un court code calculé sur tout le déroulé d'une course ; le moindre écart le change, ce qui prouve qu'une course est rejouée au bit près.
- Rejeu : une course refaite à partir des seules touches enregistrées, qui doit redonner exactement la même course.
- Map : un des décors de route du jeu (canyon, grotte, ville, jade…), tiré au sort à chaque portail.
- Portail : le passage qui fait changer de map au cours d'une course.
- Palier : le niveau de moteur gagné en ramassant des pièces pendant une course, de 1 à 30.
- Palier médian : celui du milieu quand on range les courses de la plus faible à la meilleure.
- Nitro : le turbo de la voiture, qui puise dans une jauge.
- AUC : un score qui dit à quel point un juge sépare deux groupes ; 0,5 veut dire pile ou face, 1 veut dire toujours reconnu.
- Juge « humain ou bot » : un programme entraîné à reconnaître si une partie a été jouée par une personne ou par un bot.
- Agent : une autre instance de Claude lancée pour une seule tâche, souvent plusieurs en parallèle.
- Bac fermé : l'espace clos où tourne le cerveau, qui ne doit voir que ce que le jeu lui montre (ni horloge, ni hasard extérieur).
- Clé d'API : le code d'accès, payé au crédit, qui permet de faire travailler les modèles de Claude par programme.
- Essai à blanc : un essai où tout tourne sauf l'appel payant, pour vérifier la machinerie sans rien dépenser.
- Yeux : ce que le bot voit du jeu, sous forme de mesures et non d'images.
- Radar : la partie des yeux qui, en vol, rejoue d'avance la suite du vol avec les lois du jeu et annonce comment il finira.
- Régime allégé : la version du jeu prévue pour les téléphones et les petites machines, avec moins d'effets ; c'est celle des joueurs de l'étalon.
- Régime maximum : la version la plus riche du jeu, pour les ordinateurs puissants, où la map Crypto City peut être tirée.
- Travailleur : un petit programme qui calcule à côté du jeu ; celui du relief du canyon ne répondait jamais dans le simulateur.

### Retouches

10

## 9. court:2026-11-25

*Rôle : auteur de la version courte du chapitre « 2026-11-25 » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-25.md

### En une minute

## En une minute

On voulait savoir si les sens et les gestes des bots étaient assez justes pour bâtir dessus.
Pendant la nuit, Claude les a fait relire et corriger, et il a rendu au canyon ses parois, qui manquaient dans le jeu tel que les bots le jouent sans écran.
Sans ces parois, le meilleur résultat du bot de référence était gonflé : il retombe de 25 à 18.
Le raté : ce gros travail a vidé l'abonnement de Sacha au lieu du crédit prévu pour ça, et c'est Sacha qui l'a vu.
Sacha a décidé que le travail lourd se paierait désormais sur ce crédit ; Claude a changé l'organisation dans l'heure.
Le premier pilote écrit de cette façon monte environ deux fois plus haut dans les niveaux que le bot de référence.
Sacha a demandé de finir le travail sans bâcler : un second Claude a relu ce pilote et confirmé le résultat.

(Note : ce chapitre ne contient aucun angle en radians, donc aucun degré ajouté. Retouches dans le corps : explication de « commit », de la clé d'API et de l'abonnement, de « l'étape B » et d'« agent », de « palier médian », de la « version allégée », de « workflow », de « nitro », de « seconde chance », plus trois phrases qui disent ce que montrent les chiffres : la main touche le volant aussi souvent qu'un joueur mais change moins souvent de côté ; le pilote monte environ deux fois plus haut que la référence ; le raccourci rend le contrôle du radar presque gratuit sans perte de justesse. Aucun chiffre, aucune source, aucune citation, aucune impasse retirés ni changés.)

### Mots à définir

- agent : une autre session de Claude lancée pour une seule tâche, qui rend un rapport quand elle a fini.
- workflow : un lot d'agents lancés ensemble par un programme, ici 152 d'un coup.
- clé d'API : le code d'accès qui fait payer le travail d'un programme sur un crédit à l'usage, séparé de l'abonnement mensuel.
- abonnement (Fable) : le forfait mensuel de Sacha pour Claude ; Fable est le modèle de Claude qu'il inclut.
- commit : un enregistrement daté du code dans git, l'historique du projet.
- yeux : ce que le bot sait de la route et de son vol à chaque instant.
- main (profil) : la partie du bot qui imite les doigts d'un joueur, avec son temps de réaction, ses coups de volant de durée variable et ses erreurs.
- radar : la partie des yeux qui rejoue à l'avance plusieurs façons de piloter un vol pour savoir où la voiture retombera.
- simulateur : le vrai jeu joué sans écran, plus vite que le temps réel, pour faire courir les bots.
- version allégée : le jeu en version moins chargée en images, celle que jouent les joueurs, et donc celle où l'on fait courir les bots.
- palier : le niveau atteint pendant une course ; le palier médian est celui de la course du milieu quand on les range de la pire à la meilleure.
- graine : le nombre qui fixe le tirage d'une course ; même graine, même route.
- bot de référence : le bot de départ, contre qui chaque nouveau pilote se mesure.
- pilote : un cerveau de bot écrit en clair, qui décide quand braquer, voler ou mettre la nitro.
- juge (AUC) : un programme qui essaie de distinguer un bot d'un humain ; son score vaut 0,5 s'il répond au hasard et 1 s'il reconnaît le bot à tous les coups.
- empreinte : un court résumé chiffré d'une course témoin ; s'il change, le comportement du jeu ou du bot a changé.
- champion : la variante de pilote retenue par la boucle, seulement après une validation sur 20 courses neuves.
- chaîne : le programme qui enchaîne seul les étapes du travail payées sur la clé d'API, avec un plafond de 200 €.
- nitro : le turbo de la voiture, qui se recharge sur une jauge.
- seconde chance : la reprise que le jeu offre pour effacer une mort et continuer la course.

### Retouches

11

## 10. court:2026-11-25_suite

*Rôle : auteur de la version courte du chapitre « 2026-11-25_suite » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-25_suite.md

### En une minute

## En une minute

On voulait savoir quelle version de Claude invente les meilleures améliorations du pilote.
Quatre versions ont proposé chacune quelques copies retouchées du pilote, et le vrai jeu les a fait courir.
Une copie a semblé meilleure, puis a perdu sur des courses nouvelles : c'était de la chance.
Aucune n'a donc battu le pilote de départ, et l'une des versions de Claude n'a rien rendu du tout.
Un agent de Claude a choisi la version moyenne pour la suite, parce que c'est l'ordinateur qui ralentit, pas l'argent.
Le soir, à la demande de Sacha, deux agents ont fait la première page du portfolio et ses images.
La journée finit à environ 37 € dépensés sur 200, et la suite reste bloquée par une règle de dépense mal réglée.

(Notes : le chapitre ne contient aucun angle en radians, donc aucun degré n'a été ajouté. Seuls ajouts dans le reste du texte : de courtes explications entre parenthèses, à la première apparition de palier, chaîne, commit, tri, parent, champion sacré, agent, SVG, rayons du radar, empreinte, médiane, bruit et juge, plus deux phrases qui disent ce que montrent les chiffres, l'une sous le bilan du calibrage, l'autre avant le tableau « Les chiffres ». Aucun chiffre, aucune source, aucune citation ni aucune impasse n'a été retiré ou changé. J'ai vérifié les deux phrases ajoutées : les agents du soir ont coûté 11,95 contre 4,63 pour le calibrage, et aucune variante n'a tenu, de Haiku (0,06 €) à Fable (1,91 €).)

### Mots à définir

- palier : le niveau atteint pendant une course ; plus il est haut, plus le bot est allé loin.
- graine : un nombre qui fixe le tirage au hasard d'une course, pour qu'on puisse rejouer exactement la même.
- variante : une copie du cerveau du pilote, modifiée par Claude, qu'on fait courir pour voir si elle fait mieux.
- parent : le pilote dont une variante est la copie modifiée, et contre lequel on la compare.
- calibrage : l'essai qui compare les modèles de Claude sur la même tâche pour savoir lequel vaut son prix.
- tri : un premier filtre rapide où chaque variante court sur 6 graines.
- note en grand : une note plus sûre, sur 20 courses plus longues, donnée à la meilleure variante du tri.
- validation sur graines neuves : on refait courir la variante sur des courses qu'elle n'a jamais vues, pour vérifier que son gain n'était pas de la chance.
- champion sacré : une variante retenue pour remplacer le pilote parce qu'elle a passé toutes les épreuves.
- médiane : la valeur du milieu quand on range les résultats du plus petit au plus grand.
- bruit : un écart que le seul hasard des courses suffit à produire, et qui ne prouve donc rien.
- jeton : l'unité de texte, un morceau de mot, que l'on paie quand on utilise un modèle de Claude.
- agent : une autre session de Claude lancée pour une seule tâche, avec son propre coût.
- chaîne : le programme qui enchaîne seul les tours de la boucle et décide quand il peut dépenser.
- boucle : le cycle où Claude écrit des variantes, le jeu les note, on garde la meilleure et on recommence.
- règle du rythme : la limite de dépense par jour qui dit à la chaîne quand elle peut payer un nouveau tour.
- empreinte : un court code calculé sur tout le déroulé d'une course ; deux courses qui ont la même sont identiques.
- radar et rayons : les lignes de vue que le bot lance autour de lui pour repérer la route, comme des yeux.
- juge : un programme qui essaie de deviner si une course a été jouée par un humain ou par un bot ; 1 veut dire qu'il ne se trompe jamais.
- salle de projection : une page qui rejoue les courses des bots avec l'image du jeu.
- SVG : un format d'image dessinée par le code, nette à n'importe quelle taille.
- commit : un enregistrement daté d'un état du code dans git, l'historique du projet.
- nitro : le coup d'accélération du jeu, qu'on tient plus ou moins longtemps.

### Retouches

16

## 11. court:2026-11-26

*Rôle : auteur de la version courte du chapitre « 2026-11-26 » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-26.md

### En une minute

## En une minute

Sacha trouve que les bots n'osent pas s'envoler ni faire de figures.
Claude passe la journée à corriger à la main, un défaut après l'autre, un nouveau pilote qui vole.
Il invente une note qui dit à quel point le bot ressemble aux joueurs : elle passe de 3,05 à 2,00 (plus c'est bas, plus il ressemble).
Mais plus le pilote vole comme un joueur, moins il va loin dans la course, et le juge le reconnaît toujours.
Le soir, Claude découvre une erreur dans sa propre règle de vol ; la corriger fait nettement baisser les morts en vol.
Sacha exige qu'on mesure tout ce qui distingue un bot d'un joueur, demande à Claude de travailler seul, et pense déjà à faire tourner les essais sur son autre ordinateur.

(Retouches faites dans le reste du chapitre, sans retirer ni changer aucun chiffre, aucune source, aucune citation : les degrés à côté des radians, soit 1,6 rad ≈ 92° (deux fois), 0,34 à 0,37 rad ≈ 19° à 21°, et 0,33 · 0,13 rad ≈ 19° · 7° dans le tableau, avec 1 rad = 57,3° ; une demi-phrase d'explication à la première apparition de : palier médian, commit, rayon et radar, AUC, nitro, boucle, dalle, écart-type, API, agent, GitHub, empreinte, allégé ; trois phrases « ce qu'on voit », après les comptes de vols, après la loi corrigée et en tête du tableau des chiffres. La définition du radar vient de ml/ecurie/portfolio/figures.js, celle d'« allégé » du LISEZ-MOI.)

### Mots à définir

- Palier : le niveau atteint pendant une course ; plus il est haut, plus le bot est allé loin.
- Palier médian : le palier de la course du milieu quand on range toutes les courses de la moins bonne à la meilleure.
- Pilote : le petit programme écrit par Claude qui conduit la voiture à la place d'un joueur.
- Main : la partie du bot qui imite les délais et les coups de volant d'un humain ; elle obéit avec un peu de retard (0,25 s).
- Yeux : la partie du bot qui regarde la piste et prévoit, avant d'agir, où un vol va finir.
- Rayon : un vol joué d'avance, en pensée, par les yeux du bot, pour savoir où il se poserait.
- Radar : l'ensemble des rayons que les yeux lancent au même moment, dix façons de finir un vol calculées avant qu'il arrive.
- Vue (ou regard) : chaque instant où le bot regarde la piste et prend une décision.
- Juge : un programme qui essaie de deviner si une partie a été jouée par un bot ou par un humain.
- AUC : la note du juge ; 0,5 veut dire qu'il devine au hasard, 1 qu'il ne se trompe jamais.
- Écart aux joueurs : la note inventée ce jour-là qui mesure à quel point le bot joue différemment des vrais joueurs ; plus elle est basse, plus il leur ressemble.
- Écart-type : l'écart habituel d'une partie de joueur à l'autre, qui sert d'unité pour dire si une différence est grande ou petite.
- Plafond (de l'écart) : la valeur maximale qu'une mesure peut compter dans la note, pour qu'un seul défaut n'écrase pas tout.
- Critère mixte : une note qui mélange le niveau atteint et la ressemblance aux joueurs (palier médian moins 6 fois l'écart).
- Graine : le numéro qui fixe le tirage d'une piste ; la même graine redonne la même piste.
- Lot : un paquet de 12 ou 24 courses de 5 minutes jouées pour mesurer un réglage.
- Grande note : un paquet de 20 courses de 15 minutes, la mesure la plus solide de la journée.
- Étalon : les parties enregistrées par de vrais joueurs (Sacha au clavier, Léo au doigt) qui servent de modèle.
- Nitro : le coup d'accélération de la voiture, qui se paie sur une jauge.
- Dalle : la route elle-même, suspendue dans le ciel, sous laquelle le pilote avait pris l'habitude de rouler.
- Pose : le moment où la voiture retombe sur la route après un vol.
- Glisse après la pose : l'angle dont la voiture dérape juste après s'être posée, de travers par rapport à la route.
- Radian : une autre façon de mesurer un angle ; 1 radian vaut environ 57°.
- Loi de vol : la règle écrite par Claude qui dit au pilote comment braquer en l'air pour revenir vers la route.
- Boucle : le programme automatique qui essaie des variantes du pilote et garde les meilleures.
- Agent : une autre session de Claude lancée pour une seule tâche.
- API (crédit d'API) : le crédit qui paie les modèles de Claude à l'usage, ici 200 € au total.
- Commit : un enregistrement daté dans git, l'historique du code, désigné par un numéro comme d6014a657.
- Empreinte : un code calculé sur les courses rejouées ; s'il ne change pas, le jeu a rejoué exactement pareil.
- Allégé : la version légère du jeu, celle dans laquelle jouent les vrais joueurs et donc les bots.
- Hors git : un fichier qui n'est pas enregistré dans l'historique du code et qui peut donc se perdre.

### Retouches

22

## 12. court:2026-11-27

*Rôle : auteur de la version courte du chapitre « 2026-11-27 » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-27.md

### En une minute

## En une minute

Le matin, Claude améliorait encore le bot à la main, un petit réglage après l'autre.
Le bot ressemblait un peu plus aux vrais joueurs, mais il allait moins loin dans la course.
L'après-midi, Sacha a dit stop : ce n'était pas ce qu'il voulait.
Il a demandé autre chose : une sélection naturelle, où le moins bon bot est renvoyé, qui tourne toute seule et gratuitement sur son second ordinateur.
Avant de la construire, on a vérifié si une course suffit à juger un bot : non, le hasard pèse près de quatre fois plus que le talent, il faut environ 140 courses.
Claude a donc choisi de juger chaque bot sur toutes ses courses, et de partir du pilote déjà écrit plutôt que de zéro.
Le soir, le système était construit, mais il n'avait pas encore tourné.

### Mots à définir

- palier : le niveau atteint pendant une course ; plus il est haut, plus le bot est allé loin.
- palier médian : le palier du milieu quand on range les courses de la plus basse à la plus haute.
- écart aux joueurs : une distance calculée sur 15 mesures entre les courses du bot et celles de vrais joueurs ; 0 veut dire « au milieu des joueurs », un vrai joueur est à 0,9.
- graine : un nombre qui fixe la piste ; même graine, même course.
- écart-type : l'écart habituel des résultats autour de leur moyenne ; plus il est grand, plus le hasard pèse.
- bruit : la part d'une note qui vient du hasard de la course et non du talent du pilote.
- corrélation : un nombre entre -1 et 1 qui dit si deux séries de notes classent les pilotes pareil (1) ou sans aucun lien (0).
- corrélation en rangs : la même chose, mais en ne regardant que l'ordre du classement.
- empreinte : un code calculé sur toutes les courses d'un contrôle ; s'il ne change pas, le jeu rejoue exactement pareil.
- au bit près : exactement à l'identique, jusqu'au dernier chiffre.
- déterminisme : la propriété qu'une même graine redonne toujours la même course.
- simulateur : le vrai jeu joué sans écran, plus vite que le temps réel, pour faire courir les bots.
- radar : l'ensemble des vols que les yeux du bot jouent d'avance, en pensée, pour voir où chacun finirait.
- rayon : un de ces vols joués d'avance par les yeux du bot.
- glisse : l'angle de travers de la voiture juste après qu'elle se pose sur la route.
- radian (rad) : une unité d'angle ; 1 rad vaut environ 57,3 degrés.
- commit : un enregistrement daté du code dans git, l'historique du projet.
- agent : une autre session de Claude lancée pour une seule tâche.
- crédit d'API : du crédit prépayé, dépensé à chaque appel d'une IA, à la différence de l'abonnement.
- Fable, Opus, Sonnet : des modèles de Claude, plus ou moins puissants et coûteux.
- boucle payante : un programme qui fait écrire des variantes du pilote par une IA payée sur le crédit d'API.
- neuroévolution : faire évoluer des programmes, dont de petits réseaux de neurones, par mutation et sélection, sans leur montrer la bonne réponse.
- algorithme génétique : une méthode qui imite l'évolution : des enfants modifiés naissent, les moins bons sont renvoyés.
- état stationnaire (μ+λ) : la population n'est pas remplacée d'un coup ; parents (μ) et enfants (λ) sont jugés ensemble et seuls les moins bons partent.
- génome : l'ensemble des réglages qui se transmet d'un pilote à ses enfants et qui mute.
- mutation : une petite modification au hasard des réglages d'un enfant.
- croisement : un enfant qui prend une partie de ses réglages à chacun de ses deux parents.
- réseau de neurones : un calcul aux nombreux réglages, appelés poids, qu'on peut ajuster.
- poids : un des réglages d'un réseau de neurones.
- réseaux muets : des réseaux ajoutés au pilote qui, à la naissance, ne changent rien à la conduite.
- pilote témoin : un pilote jamais modifié qui sert de repère pour juger les progrès.
- coffre : 40 graines jamais utilisées pour l'entraînement, gardées pour vérifier qu'un champion progresse vraiment.
- hybride : une sélection qui part du pilote écrit à la main au lieu de partir de zéro.
- SVG : un format d'image qui reste net à toute taille.

### Retouches

31

## 13. court:comment-on-a-travaille

*Rôle : auteur de la version courte du chapitre « comment-on-a-travaille » : quelques lignes sans jargon en tête du chapitre. Phase : Version courte.*

### Fichier

C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\comment-on-a-travaille.md

### En une minute

## En une minute

On voulait des bots qui jouent comme de vrais joueurs.
Sacha fixait le but et jouait les parties de référence. Claude écrivait et mesurait. D'autres sessions de Claude faisaient des tâches à part.
Presque chaque règle de travail est née d'une erreur : 152 sessions lancées à la chaîne ont vidé l'abonnement ; Claude posait des questions au lieu d'avancer ; il suivait son plan sans le remettre en cause.
Des relectures croisées ont montré qu'un progrès apparent n'était que du hasard.
Sur cet ordinateur, 36,92 € ont été dépensés sur 200, sans progrès confirmé.
Le 27 novembre, Sacha a décidé de changer de méthode : un apprentissage par sélection qui tourne seul, sans rien payer.

(Remarques : ce chapitre ne contient aucun angle en radians, donc je n'ai ajouté aucun degré. Seize retouches au total : la section ci-dessus, quatorze explications de mots techniques placées entre parenthèses ou en fin de phrase, et une phrase de lecture au-dessus du tableau « Les chiffres ». Aucun chiffre, aucune source, aucune impasse ni aucune citation n'a été retiré ou changé. Une explication que j'avais d'abord glissée dans une citation a été sortie des guillemets. « Lancées d'un coup… en un jour » est devenu « lancées à la chaîne », parce que la source dit « en série » et ne donne pas de durée.)

### Mots à définir

- graine : le nombre qui fixe le hasard d'une course ; avec la même graine, on obtient exactement la même course.
- graines neuves : des courses jamais utilisées pour choisir un bot, qui servent à vérifier que son progrès n'est pas de la chance.
- palier : le niveau atteint pendant une course ; le palier médian est la valeur du milieu sur une série de courses.
- étalon : les parties de vrais joueurs (Sacha et Léo) qui servent de barre de comparaison.
- cerveau / pilote : le fichier de code qui décide des touches du bot, dix fois par seconde.
- bot de référence : le premier bot écrit à la main, celui qu'il faut battre.
- agent : une autre session de Claude, lancée pour une seule tâche, qui travaille seule et rend un rapport.
- workflow : un programme qui lance des agents les uns après les autres.
- session sans écran : un agent qui tourne seul en arrière-plan, sans fenêtre ni personne pour lui répondre.
- crédit d'API / clé d'API : un compte payé à l'usage, à part de l'abonnement ; la clé est le mot de passe qui permet de le dépenser.
- abonnement : la formule mensuelle de Sacha pour utiliser Claude, avec un quota par semaine.
- jetons : les morceaux de texte qui mesurent la longueur d'une réponse d'un modèle et son prix.
- Fable, Opus, Sonnet, Haiku : des versions de Claude, plus ou moins puissantes et plus ou moins chères.
- commit : une entrée dans git, le registre qui garde chaque version du code, désignée par un code comme d2ee1f114.
- processus neuf : le programme relancé à zéro pour chaque course, pour qu'une même graine redonne toujours la même course.
- empreinte : un résumé chiffré de toutes les courses de contrôle ; si elle ne bouge pas, rien n'a changé dans le comportement du jeu.
- contrat du bot : la règle que tout cerveau suit ; il reçoit ce que voit la voiture et rend un ordre.
- variante / parent : une copie modifiée d'un cerveau, et le cerveau dont elle vient.
- tri : le premier classement des variantes, sur quelques courses seulement.
- champion : la variante gardée parce qu'elle bat son parent sur des graines neuves.
- calibrage : l'essai du 25/11 où quatre versions de Claude ont écrit des variantes, pour voir laquelle faisait le mieux.
- fiabilité (de la note) : un indice de 0 à 1 qui dit si deux séries de courses classent les pilotes dans le même ordre.
- génération : un tour de sélection où l'on garde les meilleurs et remplace les autres par des copies modifiées.
- réseau de neurones : un petit programme dont les réglages s'apprennent au lieu d'être écrits à la main.
- greffe muette : un réseau ajouté au pilote écrit à la main, qui ne change rien à ses décisions au départ.
- sélection naturelle : un système qui élimine les bots les moins bons et fait naître des variantes des meilleurs, tout seul et sans payer.
- profil de la main : les réflexes du bot (délais, gestes), fixés pour que les bots restent comparables.
- labo : le registre où les cerveaux sont inscrits, notés et rangés en lignée.
- ultra code : un réglage qui permet à Claude de lancer des agents à la chaîne.
- plafond : la somme au-delà de laquelle un agent payant est coupé.
- outils (d'un agent) : le nombre d'actions qu'il a faites, comme lire un fichier ou lancer un programme.

### Retouches

16

## 14. controle:bruit-des-notes

*Rôle : contrôleur de l'image « bruit-des-notes » : recontrôle les données à la source, regarde le rendu, corrige. Phase : Controle des images.*

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-bruit-des-notes-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-bruit-des-notes-sombre.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\bruit-des-notes.js

### Légende

Trente-quatre versions du pilote ont couru les mêmes 24 courses de 5 minutes : chaque point est une course, chaque trait épais la moyenne d'un pilote, et les nuages se recouvrent presque entièrement. D'une course à l'autre, le palier d'un même pilote s'écarte d'habitude de ± 3,2 de sa moyenne, alors que les pilotes ne diffèrent vraiment que de ± 0,86 : il faudrait environ 140 courses par pilote pour voir un palier de différence, d'où la règle de juger un bot sur toutes ses courses (source : ml/ecurie/etude/selection-naturelle/bruit/, commit 033bfebeb).

### Chapitre

ml/ecurie/portfolio/journal/2026-11-27.md, section « ## Ce qu'on a tenté », juste après la puce « **L'étude du bruit** » (3,2 contre 0,86, 140 courses) et avant la puce « **La spécification** ». Elle pourrait aussi servir dans comment-on-a-travaille.md (« **Sur la méthode.** »), mais sa place principale est le 27/11.

### Points contrôlés

822

### Erreurs corrigées

- Aucune donnée fausse. J'ai tout recalculé moi-même dans courses-0.json, avec un script indépendant, sans passer par le script de l'image. Le fichier contient 86 fiches : 44 du lot 910000 et 38 du lot 930000 de 300 s, plus 4 de 900 s, que le script écarte bien. 34 pilotes ont les deux lots, aucun n'a un lot en double et aucune course n'est tronquée. Les 34 × 24 = 816 paliers vont de 1 à 19, et la moyenne générale est 7,157.
- Les moyennes recalculées redonnent resultats.txt. Analyse de variance : écart résiduel 3,208 (le fichier dit 3,21) et écart entre pilotes 0,860 (il dit 0,86). Paliers moyens des deux lots : 7,556 et 6,757 (il dit 7,56 et 6,76). Le moins bon pilote est pQ4, à 5,042 ; le meilleur est pZ3, à 9,292. Sur les mêmes graines, pQ4 bat pZ3 3 fois et fait jeu égal 4 fois, soit 7 sur 24 : c'est exact. Le chiffre de 140 courses est bien celui de resultats.txt, section 4, ligne « palier_moyen delta 1 », graines communes.
- Une seule condition de mesure : uniquement des courses de 300 s, sur des graines identiques pour tous les pilotes. 49 courses sur 816 sont arrêtées par la limite de temps, mais elles sont soumises à la même règle chez tous les pilotes. Rien n'est mélangé.
- Le sous-titre contenait du jargon : « varie de 3,2 (écart-type) ». Il dit maintenant, en mots simples : « s'écarte d'habitude de ± 3,2 de sa moyenne ».
- Le défaut d'honnêteté signalé par l'auteur lui-même est corrigé. Les traits vont de 5,0 à 9,3, mais les pilotes sont rangés d'après ces mêmes 24 courses. L'écart-type des 34 moyennes vaut 1,08, contre 0,86 de vraie différence entre pilotes. Le sous-titre précise donc maintenant : « Même l'étalement des traits, de 5,0 à 9,3, est en partie dû au hasard. »
- L'étiquette de l'accolade épaisse disait seulement « d'un pilote à l'autre ». Elle dit maintenant « ± 0,86 : la vraie différence d'un pilote à l'autre », pour que le lecteur ne la confonde pas avec l'étalement des traits.

### Défauts de rendu corrigés

- Le vide entre le sous-titre et le tracé a été réduit de 10 px (yH).
- Après la nouvelle coupure, l'étiquette de l'accolade épaisse tient sur deux lignes, sans toucher celle de la fine : les contrôles du script passent. J'ai regardé les rendus Chrome à 1000 px dans les deux palettes : aucun chevauchement, rien ne sort du cadre, et en sombre les points restent visibles et les traits blancs se détachent.
- À 360 px de large, j'ai regardé le PNG à travers une page qui affiche l'image à cette largeur. La forme se lit : des nuages qui se recouvrent et des traits presque à plat. Le texte, lui, n'est plus lisible à cette taille. C'est pourquoi la légende du journal porte les chiffres. Rien d'autre ne pouvait se corriger sans changer la mise en page commune du dossier.

### Verdict

Je valide l'image, après corrections. Chaque point vient du fichier source et rien n'est inventé : 816 paliers, 34 moyennes, et les chiffres 3,2, 0,86, 7 sur 24 et 140 ont tous été recontrôlés. J'ai corrigé deux points : le jargon (« écart-type ») et le risque de faire croire que l'écart entre 5,0 et 9,3 est entièrement réel. Il reste une petite nuance, que j'accepte : le ± 3,2 est la variation qui reste une fois retirés l'effet du pilote et celui de la piste. L'écart brut serait encore plus grand (3,59 sur toutes les courses), donc l'image sous-estime plutôt le bruit qu'elle ne l'exagère. Le titre « égale ou bat 7 fois sur 24 » compte 3 victoires et 4 égalités, et il le dit en toutes lettres. Fichiers modifiés : ml/ecurie/portfolio/figures-journal/bruit-des-notes.js et les deux SVG. Les PNG de contrôle sont dans <dossier temporaire>\scratchpad\ctl\.

## 15. controle:depenses

*Rôle : contrôleur de l'image « depenses » : recontrôle les données à la source, regarde le rendu, corrige. Phase : Controle des images.*

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-depenses-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-depenses-sombre.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\depenses.js

### Légende

Sur les 200 € de crédit d'API, 36,92 € ont été dépensés sur ce PC, tous le 25/11. Presque tout a payé des agents chargés d'une seule tâche : écrire le pilote, le contrôler, faire le portfolio. Seuls 4,63 € ont servi à faire écrire des variantes du pilote par quatre modèles de Claude, et aucune n'a tenu sur des courses neuves. Ce qu'a dépensé la boucle du second PC (plafonnée à 60 €, comptés dans les 200) n'est pas vérifié ici. Source : ml/labo/journal/depenses.jsonl ; journal du 25/11 (suite) et du 27/11.

### Chapitre

ml/ecurie/portfolio/journal/2026-11-25_suite.md, section « ## Les chiffres », juste avant la phrase « Un point de méthode sur l'argent… », qui explique la mention « 1 € compté pour 1 $ » de l'axe. Je garde la place proposée par l'auteur.

### Points contrôlés

31

### Erreurs corrigées

- Aucun chiffre faux. J'ai recalculé toutes les lignes de depenses.jsonl. Les 8 postes donnent 11,63 + 8,71 + 7,07 + 4,63 + 3,83 + 0,71 + 0,34 + 0 = 36,92. Il y a 19 lignes « K- » (18 « candidat » et 1 « variante perdue »). Par modèle : Haiku 0,06, Sonnet 0,77, Opus 1,89 et Fable 1,91 €. Les 26 lignes sont toutes datées du 25/11, et les 14 rapports d'agents existent bien.
- Les chiffres de l'annotation correspondent à la source. sortie-calibrage-sonnet.log donne le parent c0010 au palier médian 11. c0011 obtient 13 au palier médian (« inscrit… palier_median 13 »), puis 10,5 contre 11 sur 20 graines neuves (« NE TIENT PAS »). C'est aussi ce que dit le commit 8610302d2 (« +2 en grand, -0,5 sur graines neuves »). Le plafond de 60 € est « à compter dans les 200 € » d'après journal/2026-11-27.md, ligne 17. Le hachuré posé dans la barre des 200 € est donc juste.
- Titre trop fort. « 4,63 € ont payé des variantes » était faux pour Fable : 1,91 € pour aucune variante. Il devient « 4,63 € ont servi à essayer des variantes du pilote : aucune n'a tenu sur des courses neuves ».
- « 13 contre 11 » ne disait pas ce que mesurent ces nombres. Je l'ai remplacé par « palier médian 13 contre 11 pour le pilote, puis 10,5 contre 11 sur 20 courses neuves ».
- « … Fable 1,91 €, réponse coupée » était ambigu, sans dire à qui se rapportait la réponse coupée. La ligne devient « par modèle, en € : … » et une ligne à part dit « (Fable : une seule réponse, coupée, sans variante) ».
- « Au moins 103,08 € encore libres » ne posait qu'une condition. Elle en pose maintenant deux : « si la boucle s'arrête à son plafond et que rien d'autre n'est payé ».
- Le sous-titre reste vague. Il chiffre maintenant le reste (32,29 €) et cite aussi le choix du modèle parmi les tâches payées.

### Défauts de rendu corrigés

- Le détail de l'annotation est mieux coupé : la phrase n'est plus cassée au milieu de « pilote / de départ ». J'ai raccourci la ligne, parce que le contrôle de chevauchement du script la déclarait hors cadre.
- J'ai rendu l'image en PNG avec Chrome sans écran, en clair et en sombre, à 1000 px et à 380 px (dans une page enveloppe qui fixe l'image à 380 px). À 1000 px, il n'y a aucun chevauchement ni débordement. Les hachures grises et la barre bleue se distinguent dans les deux palettes et aussi sans couleur, par la forme (plein, hachuré, contour seul). Les deux axes partent de 0, sans coupure, et portent leur unité.
- Chemins de la source rendus complets (ml/ecurie/portfolio/journal/…) et ajout de sortie-calibrage-sonnet.log comme source des paliers.
- Reste non corrigé : à 380 px de large, le titre, les barres et la barre des 200 € se lisent, mais le petit texte (noms des postes, annotation, source) tombe vers 4 px et devient illisible. La figure a la même largeur (960) que les autres figures du dossier. Pour la rendre lisible sur téléphone, il faudrait une mise en page étroite séparée.

### Verdict

ACCEPTÉE APRÈS CORRECTIONS. Toutes les valeurs tracées sont justes. J'ai recontrôlé chaque montant, le total et le décompte par modèle dans depenses.jsonl, et l'annotation sur c0011 dans sortie-calibrage-sonnet.log et le commit 8610302d2. Le plafond du second PC est bien compris dans les 200 € (journal 2026-11-27.md). La boucle du Ryzen n'est montrée qu'en hachuré, sans chiffre de dépense inventé. J'ai corrigé dans le script un titre qui en disait trop (Fable n'a produit aucune variante), une comparaison sans unité, une annotation ambiguë et une condition manquante sur ce qui reste libre. J'ai relancé le script et contrôlé le rendu en clair et en sombre à 1000 px : il est propre. Une limite reste : à 380 px, seuls le titre et les barres se lisent ; le petit texte est trop petit. Je n'ai pas lancé le validateur de palette, puisqu'il n'y a qu'une seule couleur de série et un gris hachuré. Aucun commit, aucune course du jeu.

## 16. controle:frise

*Rôle : contrôleur de l'image « frise » : recontrôle les données à la source, regarde le rendu, corrige. Phase : Controle des images.*

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-frise-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-frise-sombre.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\frise.js

### Légende

Pendant deux mois, à l'automne, on a laissé des voitures apprendre seules par sélection : d'abord dans une copie du jeu, puis dans le vrai jeu. Ensuite, un mois sans travail, puis cinq virages en six jours (du 22 au 27 novembre) : quatre méthodes et un nouveau but. Le rond marque un virage venu de Sacha, le losange un virage venu de Claude, et l'axe du temps est coupé pour sauter le mois vide. Sources : le journal de bord (ml/ecurie/portfolio/journal, LISEZ-MOI § 2 et les chapitres de chaque jour) et les commits deacc99ad, 6f4dbdc29, d2ee1f114 et ef630b812.

### Chapitre

LISEZ-MOI.md § 2 (le fil : les changements de méthode) ; s'applique aussi à 00_avant-le-22-novembre.md et à 2026-11-27.md

### Points contrôlés

7

### Erreurs corrigées

- La cassure de l'axe annonçait « 33 jours sans changement ». En réalité, 33 jours séparent les deux étapes (du 20/10 au 22/11), mais la cassure n'en retire que 27 (du 26/10 au 22/11) : le reste du mois reste visible à gauche. L'étiquette dit maintenant « axe coupé : 27 jours retirés », et le sous-titre donne les deux chiffres. J'ai ajouté une constante CACHE calculée par le script.
- Le titre disait « cinq virages de méthode », alors que l'un des cinq, le 24/11, est un nouveau but et non une méthode : la carte elle-même le disait. Il dit maintenant « cinq virages en six jours : quatre méthodes et un nouveau but ». L'aria-label est corrigé dans le même sens.
- Le 22/11, la carte disait « virage décidé par Claude ». Or le chapitre 2026-11-22_23.md précise que le plan porte encore la mention « pas encore validé par Sacha ». La carte dit maintenant « virage proposé par Claude ».
- Trois décisions sont partagées, mais une seule marque les montre. La forme reste celle de la personne qui a décidé le plus, et la ligne de la carte dit maintenant qui a fait quoi. Le 7/09 : « Sacha (la règle), Claude (les réseaux) », d'après LISEZ-MOI § 2. Le 25/11 : « Sacha (payer sur l'API), boucle prévue par Claude », d'après le plan d2ee1f114 qui contient la « boucle API » et les décisions du 25/11. Le 27/11 : « décidé par Sacha ; forme hybride : Claude », d'après 2026-11-27.md, « Les décisions ». La légende des marques passe de « décidé par » à « venu de ».
- Le 22/11, l'arrêt « étapes 2 à 8 remplacées (24/11) » était du jargon. Il devient « plan en partie remplacé le 24/11 », d'après 2026-11-24.md : « remplace les étapes 2 à 8 du plan d'origine ».
- Le 24/11, l'arrêt « un but toujours en vigueur » disait le contraire d'un arrêt. Il devient « aucun : le but tient toujours ».

### Défauts de rendu corrigés

- Avec le nouveau sous-titre, le texte passait sur trois lignes et chevauchait la légende des marques. Le contrôle de chevauchement du script a arrêté le dessin, et j'ai raccourci le sous-titre pour le ramener à deux lignes.
- Le rendu est vérifié dans Chrome sans écran, à 1000 px et à 380 px, en clair et en sombre. Aucun texte ne se chevauche ni ne sort du cadre, et les deux marques se distinguent par leur forme (rond plein, losange creux) comme par leur couleur.
- Il reste une limite que je n'ai pas corrigée. À 380 px, on lit la structure (marques, cassure, dates), mais les noms font environ 5 px et les détails environ 4 px : c'est illisible. Une frise horizontale de sept cartes dans 960 px ne peut pas mieux faire. Pour le téléphone, il faudrait une version verticale. Les autres figures du dossier ont la même limite.

### Verdict

Toutes les dates sont exactes, vérifiées sur les commits. deacc99ad (7/09) ajoute ml/sim et ml/train, 6f4dbdc29 (20/10) lance ml/reel, d2ee1f114 date du 22/11 et ef630b812 du 24/11. Le chapitre 00 confirme aussi qu'il n'y a eu aucun travail sur les bots entre le 21/10 et le 21/11 (un seul commit, a29e839d2, sans rapport). Toutes les citations d'arrêt figurent bien dans les chapitres indiqués. Les vrais défauts étaient de l'ordre de la survente : une cassure qui prétendait cacher 33 jours, un titre qui comptait un but comme une méthode, une proposition présentée comme une décision et des décisions partagées attribuées à une seule personne. Tout est corrigé dans frise.js, et les deux SVG sont régénérés. Seule la lisibilité sur téléphone reste insuffisante (voir les défauts de rendu). Les PNG de contrôle sont dans <dossier temporaire>\scratchpad\ctlfrise-{clair,sombre}-{1000,380}.png. Je n'ai fait aucun commit.

## 17. controle:apprentissages-de-zero

*Rôle : contrôleur de l'image « apprentissages-de-zero » : recontrôle les données à la source, regarde le rendu, corrige. Phase : Controle des images.*

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-apprentissages-de-zero-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-apprentissages-de-zero-sombre.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\apprentissages-de-zero.js

### Légende

En septembre et octobre 2026, des voitures pilotées par de petits réseaux partis de zéro ont été sélectionnées génération après génération. Leur meilleure distance monte, puis plafonne : d'environ 1,1 à 8,5 km dans une copie du jeu, de 1,4 km à un record de 3,6 km dans le vrai jeu. Les figures, elles, ne viennent presque jamais : 0 pour le meilleur cerveau après 300 générations (1 voiture sur 24 dans un essai voisin), 0,2 par partie pour le champion du vrai jeu sur des pistes neuves (sources : ml/train/results/runs, ml/reel/results, commits 5799d5bb1, 03b5da4a6 et 6f4dbdc29).

### Chapitre

ml/ecurie/portfolio/journal/00_avant-le-22-novembre.md

### Points contrôlés

655

### Erreurs corrigées

- Le titre disait « presque jamais à voler ». L'image ne trace aucune donnée de vol, et le run de 300 générations compte 55 013 décollages et 39 % de poses (multi-2026-10-20T13-23-01-740Z.json, commit 5799d5bb1). Nouveau titre : « Partie de zéro, la sélection apprend à rouler plus loin, mais presque jamais à faire des figures ».
- Le sous-titre disait « Les figures n'apparaissent pas ». C'est trop fort : le run de 200 générations du même jour (poids 1,2, commit 03b5da4a6) avait 1 voiture sur 24 qui réussissait une figure, et ml/reel en fait 0,2 par partie. Il dit maintenant « presque jamais ». L'annotation « 0 figure » ajoute l'essai voisin, et la source cite 03b5da4a6.
- La note de source parlait de « deux grandeurs mesurées dans deux jeux différents ». Or c'est la même mesure (la meilleure distance d'une génération), prise dans deux conditions de manche : longueur de la piste dans la copie, 40 s dans le vrai jeu. Elle le dit maintenant.
- En-tête du script : j'ai ajouté le bloc CONTRÔLE (ce qui a été recompté et ce qui a été corrigé), et le texte « ce que l'image dit » est aligné sur le nouveau titre. L'aria-label est corrigé de la même façon.

### Défauts de rendu corrigés

- Avec la ligne de l'essai voisin, le trait de données traversait la dernière ligne de l'annotation « 0 figure ». Le contrôle du script refusait d'écrire : j'ai remonté l'annotation (sy(15.2) → sy(15.9)). Rendu à 1000 px et à 380 px, en clair et en sombre : aucun chevauchement, rien ne sort du cadre, la source tient sur 3 lignes à 1000 px et sur 4 à 380 px.
- Non corrigé, signalé : à 380 px, les petits textes (10 à 10,5 px dans un viewBox de 960) font environ 4 px et deviennent illisibles. On lit encore les courbes, le titre et les chiffres en gras. C'est la même échelle de texte que paliers-clair.svg, journal-frise et journal-bruit-des-notes. Je l'ai gardée pour que tout le dossier ait la même main.

### Verdict

Les données sont justes, recomptées dans leur source. Gauche : run-seed1000.json et run-seed1101.json, 299 valeurs chacun du champ « courbe ». Ce champ vaut genMaxTotD, la meilleure distance d'une génération (sim-train.js, lignes 70-106). Les deux fichiers sont identiques à leur version du commit 5799d5bb1. Médiane des 5 premières générations : 1 110,5 m ; des 100 dernières : 8 513,5 m. La médiane glissante est recalculée : environ 8,1 à 8,8 km à partir de la génération 50. Droite : les 57 valeurs de « hist » dans pop-reel-g1.json (entrainer.js, hist.push(best)) ; hist[0] = 1 391 m ; record 3 616 m à la génération 43, égal à champion-reel-g1.json. 20 cerveaux, 40 s par partie et 0,2 figure par partie sont confirmés par 6f4dbdc29. « 0 figure », « 24 voitures » et FIG_W_AURA=3 sont confirmés par 5799d5bb1. Les axes partent de zéro, avec leur unité (km) ; aucun point n'est choisi à la main ; les fichiers écartés sont listés dans le script avec leur raison. J'ai corrigé trois affirmations trop fortes : le vol dans le titre, « les figures n'apparaissent pas », « deux grandeurs ». Le script tourne sans erreur et son contrôle des étiquettes passe. Les rendus sont propres à 1000 px dans les deux palettes ; seule limite, à 380 px les petits textes sont illisibles, comme dans les autres figures du dossier. PNG de contrôle hors dépôt : <dossier temporaire>\scratchpad\ctl\clair-1000.png, sombre-1000.png, clair-380.png, sombre-380.png. Aucun commit. Image acceptable pour le journal.

## 18. controle:ressembler-ou-gagner

*Rôle : contrôleur de l'image « ressembler-ou-gagner » : recontrôle les données à la source, regarde le rendu, corrige. Phase : Controle des images.*

### Images

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-ressembler-ou-gagner-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\journal-ressembler-ou-gagner-sombre.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\figures-journal\ressembler-ou-gagner.js

### Légende

Chaque cercle est une version du pilote, placée selon sa ressemblance aux joueurs (plus à gauche, plus il joue comme eux) et selon le palier qu'il atteint dans la course (plus haut, plus il va loin). En deux jours, il s'est nettement rapproché des joueurs (écart de 3,07 à 1,67), mais il est descendu du palier 11 au palier 7,5, sous les joueurs, qui sont au palier 10 ; chaque version est notée sur 20 courses de 15 minutes au plus, la première sur d'autres courses que les suivantes (sources : ml/ecurie/ETAPES.md, commits du 25 au 27/11, ml/labo/tampon/boucle/val-c0010.json).

### Chapitre

2026-11-26.md et 2026-11-27.md (le pilote qui vole, puis la nitro au sol)

### Points contrôlés

9

### Erreurs corrigées

- Point 1 (pilote.js) : il mélangeait deux conditions de mesure. L'écart 3,05 d'ETAPES.md a été calculé sur ml/ecurie/agents/tmp-voltige/note-pilote-v1.json, soit 12 courses de 600 s (palier médian 12,5). Je l'ai recalculé : 3,049. Le palier 11 venait, lui, de c0003 (20 courses de 900 s), dont les parties n'ont pas été gardées. Le point est remplacé par un couple venu d'un seul lot : ml/labo/tampon/boucle/val-c0010.json, même cerveau (sha ce942cc3364b), 20 courses de 900 s en allégé, graines 950000. Écart recalculé par ressemblance.js sur ses 20 parties : 3,07 ; palier médian 11 (c0003 donne aussi 11). Le point est tracé creux, avec une flèche en pointillés, et l'étiquette dit « autres courses ». Le script vérifie le sha et les conditions, et s'arrête si le fichier manque (il est hors git).
- Repère des joueurs : il était placé à l'écart 0,91. Or 0,91 est l'écart d'UNE seule partie de joueur comparée aux autres (médiane de 8 parties de plus de 60 s, recalculée : de 0,39 à 1,15), alors que chaque point du pilote est la moyenne d'un lot de parties. ressemblance.js le dit lui-même : un lot de joueurs vaut 0 par définition. Le carré est donc posé à 0. Le 0,91 devient un trait vertical à part, avec son explication (« une seule partie de joueur, comparée aux autres »).
- Axes coupés sans le dire : le palier allait de 4 à 12, ce qui grossissait la chute de 11 à 7,5 ; l'écart allait de 0,5 à 3,5, ce qui empêchait de poser les joueurs à 0. Les deux axes partent maintenant de 0.
- Variante « nitro presque partout » : elle est mesurée sur 24 courses de 300 s et ne se compare pas directement à la version 5, notée sur 900 s. L'étiquette donne maintenant la version 5 dans ce même essai : écart 1,69 (moyenne de 1,66 et 1,71), palier 7. On compare ainsi ce qui se compare.
- Point 2 recontrôlé : ml/ecurie/agents/tmp-voltige/note-voltige-t900.json a les mêmes 20 paliers que la note de 63012939f, et ses parties donnent 2,535, ce qui confirme le 2,54 d'ETAPES.md. Le script refait ce calcul quand le fichier est présent et s'arrête en cas d'écart. Points 3 à 5 (2,021 / 7 ; 2,005 / 8,5 ; 1,666 / 7,5) : je les ai recalculés sur les parties et les médianes, et ils sont justes. Palier des joueurs : 10 vérifié (les 10 parties au clavier sont celles de Sacha ; les 4 de Léo sont au doigt).
- Sous-titre corrigé : il disait « les mêmes 20 courses » pour les cinq versions, ce qui était faux pour la version 1. Il dit maintenant que les versions 2 à 5 sont notées sur les mêmes courses et la 1 (cercle creux) sur 20 autres. « 0 = comme eux » devient « 0 = en moyenne comme eux ».
- Source en bas de l'image mise à jour : val-c0010 et le recalcul par ressemblance.js ; ETAPES.md ne sert plus que pour l'écart de la version 2, le bruit d'une partie de joueur et la variante.

### Défauts de rendu corrigés

- Étiquettes loin de leur point et ambiguës : « 1. pilote au sol » était posée sous le point 2, « 2. apprend à voler » en haut à gauche, « 5. plus de nitro » sous la variante. J'ai limité les distances de placement, donné un ordre de places par point et décalé le bord droit du tracé (D = 900) pour faire de la place à droite du point 1. Chaque étiquette touche maintenant son point.
- Le texte « palier médian des joueurs : 10 » au bout du pointillé vert gênait les étiquettes : il est retiré, puisque l'étiquette des joueurs donne déjà le palier 10 et que le pointillé part du carré vert. Les étiquettes peuvent croiser ce pointillé : elles sont détourées et restent lisibles.
- Titre de l'axe horizontal sans jargon : « en écarts-types… » devient « 1 = la différence habituelle entre deux parties de joueur, geste par geste ».
- Graduations du palier de 2 en 2, de 0 à 12. Le tracé est agrandi (BAS = 530) pour que les points ne se tassent pas.
- Vérifié avec Chrome sans écran, à 1000 px et à 380 px, dans les deux palettes : aucun chevauchement, rien ne sort du cadre, et en sombre les couleurs se distinguent (or, vert, gris). Les PNG sont restés dans le dossier temporaire.

### Verdict

Corrigé, et maintenant honnête. Deux erreurs de fond faussaient l'image. Le point de départ associait un écart mesuré sur 12 courses de 600 s à un palier mesuré sur 20 courses de 900 s. Les joueurs étaient placés à 0,91, alors que ce chiffre est le bruit d'une seule partie et que leur lot vaut 0 par définition. Les deux sont corrigés. J'ai aussi retiré les axes coupés et posé la variante à côté de la version de référence de son propre essai. Je garde le titre de l'autre agent (« En se rapprochant des joueurs, le pilote a perdu des paliers : 11 au départ, 7,5 à la fin ») : il est plus juste que « chaque pas a coûté des paliers », puisque le pas 3 → 4 a regagné 1,5 palier sans changer l'écart. Limites qui restent : (1) le point 1 vient de ml/labo/tampon/, un dossier hors git ; le script s'arrête sans ce fichier, et la même chose vaut pour le contrôle du point 2, qui est simplement sauté si son fichier manque. (2) À 380 px, le texte de 10 à 12 px est illisible ; on ne lit plus que la forme du chemin. Il faudrait une version recadrée pour le téléphone. (3) Les joueurs sont de vraies parties, pas des courses du simulateur ; la plus longue dure 545 s, donc la limite de 900 s n'aurait rien coupé. Aucune course jouée, aucun commit ; seuls le script et les deux SVG ont été modifiés.

## 19. mise-en-page

*Rôle : metteur en page : insère les images dans les chapitres, écrit le lexique, met le sommaire à jour. Phase : Mise en page.*

### Images insérées

6

### Entrées du lexique

75

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LEXIQUE.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\00_avant-le-22-novembre.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-24.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-25.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-25_suite.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-26.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-27.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\comment-on-a-travaille.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\MODELE-D-ENTREE.md

### Résumé

J'ai fait la mise en page du journal. Les cinq images existent, et j'ai vérifié chaque chemin avec ls. Je n'ai fait aucun commit, lancé aucune course, fait aucun appel payant, et je n'ai touché à rien hors de journal/.

**Les images**
Elles sont au format « ![description en une phrase](../images/journal-<nom>-clair.svg) », suivi de la légende en italique : 6 insertions pour 5 images.
- **Apprentissages de zéro** : dans 00_avant-le-22-novembre, sous le tableau des chiffres.
- **Dépenses** : dans 2026-11-25_suite, sous le tableau. La tâche ne donnait pas sa légende, car le texte était coupé. Je l'ai écrite à partir des seuls chiffres du SVG et de depenses.jsonl : 36,92 €, 26 lignes, 4,63 € pour le calibrage, 32,29 € pour les agents, et le plafond de 60 € du Ryzen, non compté.
- **Ressembler ou gagner** : dans 2026-11-26, en tête de « Les chiffres ». J'ai ajouté une note sur un écart de chiffres. L'image donne 3,07 au premier pilote, alors que le journal dit ailleurs 3,05 : le 3,05 vient de 12 courses de 10 minutes, l'image prend 20 courses de 15 minutes au plus pour toutes les versions. 2026-11-27 y renvoie depuis la nitro au sol.
- **Bruit des notes** : dans 2026-11-27, juste après la puce « L'étude du bruit ». comment-on-a-travaille y renvoie dans « Sur la méthode ».
- **Frise** : dans LISEZ-MOI § 2, à la place du schéma en texte ; la liste datée reste dessous. Elle figure aussi dans 2026-11-27, au paragraphe « Ce n'est pas la première sélection ».

**« Ce qu'on peut montrer » et le § 6 de LISEZ-MOI**
- J'ai mis cette section à jour dans les chapitres 00, 25_suite, 26 et 27, et dans comment-on-a-travaille. Chaque fois, les versions claire et sombre sont citées, avec le script et la mention « hors git ».
- Le § 6 a deux nouvelles lignes : les images journal-* et les scripts figures-journal/*.js, avec la commande « node ml/ecurie/portfolio/figures-journal/<nom>.js ». Une limite y est notée : ressembler-ou-gagner.js lit ml/labo/tampon/boucle/val-c0010.json, qui est hors git, et s'arrête sans ce fichier.
- J'ai corrigé « jamais dessinées » et « aucune courbe n'est dessinée ».
- J'ai aussi corrigé une erreur trouvée en route. LISEZ-MOI § 6 et comment-on-a-travaille disaient le journal « non suivi par git ». En fait il y est depuis 29bce656d (27/11, 18 h 49) ; seules les retouches de ce soir ne sont pas enregistrées.

**Le lexique**
LEXIQUE.md compte 75 entrées, par ordre alphabétique. J'ai fusionné les doublons des relecteurs et ajouté les mots de la sélection naturelle : neuroévolution, algorithme génétique, génération, génome, mutation, croisement, témoin, champion, coffre de graines. Quand un mot a changé de sens en cours de route (génération, champion, croisement, mutation, note), les deux sens sont donnés.

J'ai vérifié les définitions contre bot/README, labo/README, PLAN et SPECIFICATION. Cela m'a fait corriger plusieurs propositions trop larges :
- **Champion** : il est validé contre son parent dans la boucle, mais contre le champion en titre dans la sélection.
- **Croisement** : 0,3 pour un enfant ordinaire, et chaque réseau est pris en entier chez un seul parent.
- **Renvoi** : les nouveau-nés, le témoin et le champion sont protégés.
- **Juge** : entre 0,97 et 0,99 selon les jours.
- **Pas** : j'ai retiré « soixante par seconde », que rien ne prouvait.
- **Modèles de Claude** : leurs coûts réels sont donnés au lieu de « du plus cher au moins cher ».

**Le sommaire (LISEZ-MOI)**
- Le lexique est annoncé dès l'introduction, et LEXIQUE.md est ajouté à la table du § 7.
- Le § 8 dit maintenant que chaque chapitre commence par « En une minute », que les images sont fabriquées par script et que les mots sont rassemblés dans le lexique.
- Le § 1 est toujours exact ; je ne l'ai pas modifié.
- J'ai mis MODELE-D-ENTREE à jour pour qu'il suive ces règles : il a maintenant une section « En une minute », la consigne pour insérer une image et le rappel du lexique.

**Les « En une minute » relus à la suite**
- **2026-11-24** : le maillon manquait ; on apprend maintenant que les centaines de versions du bot venaient du plan du 22/11.
- **2026-11-25** : « de cette façon » était ambigu (c'est le pilote payé sur le crédit). Le « 25 à 18 » est désormais exprimé en paliers.
- **2026-11-25_suite** : « la version moyenne » devient « la version de prix moyen (Sonnet) ».
- **2026-11-26** : une ligne dit maintenant pourquoi la boucle payante n'est pas relancée (elle ne regardait que le niveau).
- **2026-11-27** : une ligne dit que Sacha a lancé lui-même la boucle payante sur le Ryzen, son résultat n'est pas vérifié. Cela comble le fil laissé ouvert le 26/11 (« pas lancée »).

## 20. jury

*Rôle : lecteur dans le rôle d'un juré non programmeur : dit ce qu'il a compris, où il se perd, et corrige en place. Phase : Jury.*

### Ce que le lecteur a compris

1) Sacha veut des bots qui jouent à CASH CAR, son jeu de course dans le ciel, sans qu'on puisse les distinguer de vrais joueurs, du palier 1 au palier 30. Lui dirige et joue les parties de référence ; Claude code et mesure. 2) En septembre et octobre, des voitures à petits cerveaux artificiels, sélectionnées génération après génération à partir de zéro, ont appris à rouler loin mais presque jamais à voler ni à faire des figures, d'abord dans une copie du jeu qui s'est éloignée du vrai jeu, puis dans le vrai jeu. 3) Fin novembre, Claude a changé de méthode : il a écrit lui-même un pilote lisible, noté par le vrai jeu. Des variantes écrites par quatre modèles payés n'ont rien gagné qui tienne sur des courses neuves (environ 37 € dépensés sur 200). 4) Les 26 et 27/11, en réglant ce pilote à la main, Claude l'a rendu nettement plus ressemblant aux joueurs (écart de 3,05 à 1,67), mais il monte moins haut (du palier 11 à 7,5) et un juge automatique le reconnaît toujours. 5) Le 27/11, Sacha a écarté le réglage à la main et demandé une sélection naturelle gratuite sur son second PC, partie du pilote existant et jugée sur beaucoup de courses, car une seule course est surtout du hasard. Le système est construit mais n'a pas encore tourné : aucun progrès n'est encore acquis.

### Ce qui accroche

- La frise est la meilleure pièce du dossier : axe du temps coupé, ronds pour Sacha et losanges pour Claude, « ce qui l'a arrêtée » sous chaque marque. En trente secondes on comprend que c'est une histoire de changements de cap et de décisions partagées entre un humain et une machine, pas un exposé technique.
- L'image « ressembler ou gagner » donne un vrai dilemme de designer : plus le bot imite le joueur, moins il joue bien. Un chemin numéroté qui s'éloigne du but (le carré vert des joueurs) se lit sans légende.
- Le nuage du « bruit des notes » : 34 colonnes de points qui se chevauchent montrent, sans chiffre, qu'une seule course ne veut rien dire. C'est une leçon de méthode rendue visible.
- L'honnêteté : le registre des 50 impasses, chacune avec le chiffre qui l'a fait écarter, les « non vérifié », et Sacha qui corrige la méthode de Claude (« pourquoi on n'a pas fait ça dès le départ ? »). Le récit d'une collaboration où le directeur artistique reprend la main est rare et fort.
- Les « En une minute » lus à la suite forment vraiment une histoire, avec un bon suspense final (« construit, mais n'a pas encore tourné »).

### Où le lecteur se perd

- Le LISEZ-MOI fait 225 lignes et passe des « dix lignes » à un registre de 50 lignes et à un inventaire de fichiers (chemins, « dans git ? ») : pour un jury, les § 3, 5 et 6 sont des annexes d'ingénieur placées au milieu du récit.
- Dans le corps des chapitres, chaque phrase porte un code de commit, un nom de fichier ou une unité (rad, AUC, écart-type, « mixte −3,5 ») : les explications entre parenthèses sont justes, mais elles hachent la lecture. Le chapitre du 26/11 est une liste de 14 essais de même poids, sans hiérarchie.
- Les nombres se ressemblent sans être les mêmes (3,05 et 3,07 ; 13 et 13,5 ; « un demi-palier » qui devient un palier entier dans le même paragraphe) : chaque écart est justifié, mais le lecteur non technicien doute.
- On ne voit jamais le jeu ni un bot en train de jouer : aucune capture, aucun film intégré. Je juge une histoire sur une voiture que je n'ai pas vue.
- La légende de « dépenses » et ses sources occupent autant de place que le dessin ; les mentions « 1 € compté pour 1 $ », « Ryzen non compté » et « plafond 60 € » demandent un effort comptable sans intérêt pour le jury.
- « Fable, Opus, Sonnet, Haiku », Ryzen, Xeon, « boucle », « chaîne », « étape C bis » : trop de noms propres internes pour une lecture de vingt minutes.

### Manques

- 1. Des images du jeu et des bots : une capture du jeu en ouverture, puis au moins un instant de course (une planche de neuf images, ou un bot à côté de Sacha sur la même piste). Les rejeux et les films existent déjà (ml/labo/rejeux, ml/labo/videos), mais rien n'en paraît dans le journal. Sans eux, le jury juge un dossier de chiffres sur un objet visuel qu'il ne voit jamais.
- 2. Une voix et un point de vue de designer : ce que Sacha a appris et ce qu'il en pense, son rôle de directeur (fixer le but, jouer la barre, refuser un plan). Le texte est écrit par Claude sur Claude. Il faudrait une courte page à la première personne de Sacha, avec les trois ou quatre décisions qui ont tout changé, et ce que « ressembler à un humain » veut dire pour lui comme designer.
- 3. Une forme éditoriale de portfolio, et non un dossier technique : un parcours court (dix doubles pages, ou une page web) qui ne garde que la frise, les quatre images et cinq citations, et qui renvoie tout le reste (registre, chiffres, sources, inventaire) en annexe. Il faudrait aussi une fin visuelle : la première courbe de la sélection naturelle quand elle aura tourné, ou, honnêtement, la case vide qui l'attend.

### Corrections

- Point 1 : les 6 liens d'image des chapitres pointent tous vers des fichiers qui existent (frise dans LISEZ-MOI et 2026-11-27, apprentissages-de-zero, depenses, ressembler-ou-gagner, bruit-des-notes). Seul MODELE-D-ENTREE.md garde le gabarit journal-<nom>-clair.svg, et c'est voulu. Rien à corriger.
- Point 2, 2026-11-26.md : le texte de l'image « ressembler ou gagner » et sa légende ne parlaient pas du losange visible sur l'image (« nitro presque partout », écart 1,30, palier 6, non gardé). Je l'ai ajouté, avec la raison de l'abandon (0,2 figure par minute au lieu de 0,7, d'après ETAPES.md), et j'ai écrit « dans l'ensemble » pour le glissement, puisque la version 3 remonte vers la version 4.
- Point 2, LISEZ-MOI.md et 2026-11-27.md : le texte de la frise disait « sous chaque marque ce qui l'a arrêtée », alors que les étiquettes alternent au-dessus et au-dessous de l'axe. Corrigé en « à côté de chaque marque, au-dessus ou au-dessous ».
- Point 3, comment-on-a-travaille.md : la note qui suit « En une minute » citait `paroles-sacha.md` et le commit `d2ee1f114`. J'ai retiré les deux et gardé l'explication de « commit » en mots simples.
- Point 3, 2026-11-25_suite.md : la note de tête « Suite de `2026-11-25.md` » devient « Suite du chapitre du 25/11 (jusqu'à 15 h 30) ».
- Point 4, 2026-11-27.md : « Le prix : un demi-palier » contredisait la phrase suivante (palier médian 8,5 → 7,5, soit un palier entier). La phrase dit maintenant : un demi-palier par course en moyenne sur les 24 courses courtes (181 contre 193, ETAPES.md), un palier entier sur la grande note.
- Point 4, 00_avant-le-22-novembre.md : « le meilleur bot mourait en vol une fois sur deux » devient « sur la moitié des pistes (3 sur 6) », la mesure exacte du commit 6f4dbdc29.
- Point 4, LISEZ-MOI.md § 1 : les 36,92 € portent maintenant la mention « montants estimés par les agents en dollars, 1 € compté pour 1 $ », comme ailleurs dans le dossier.
- Cohérence, LISEZ-MOI.md : la règle « messages de Sacha en UTC » signale maintenant que les deux chapitres du 25/11 donnent ces messages à l'heure de Paris (ils le disent en tête).
- Point 5, 2026-11-27.md : « ce PC (le Xeon) », un détail familial privé, devient « l'autre PC (le Xeon) ». Je n'ai trouvé aucune clé, aucun jeton, aucune adresse e-mail ni aucun chemin personnel dans ml/ecurie/portfolio/journal/.
- Rien n'a été modifié hors de ml/ecurie/portfolio/journal/ et aucun commit n'a été fait. Les images n'ont pas été touchées (les rendus PNG de contrôle sont dans <dossier temporaire>\scratchpad\frise.png, apprentissages-de-zero.png, depenses.png, ressembler-ou-gagner.png, bruit-des-notes.png). Contrôlés contre leurs sources et justes : 13 contre 11 « en grand » pour c0011 (sortie-calibrage-sonnet.log), « nettement moins de morts en vol » (830cdf573 : 14 → 8 pour 100 vols), 3,07 contre 3,05 (justifié dans la légende).
