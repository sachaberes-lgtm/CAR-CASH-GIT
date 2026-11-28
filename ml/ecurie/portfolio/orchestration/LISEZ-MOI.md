# Les orchestrations du 27 et du 28 novembre 2026

Ce dossier garde la trace de huit travaux faits par des équipes d'agents : quatre le 27/11/2026, quatre dans la nuit du 27 au 28/11. Il montre comment le travail a été réparti, ce que les agents ont rendu, ce que leurs relecteurs ont trouvé, et ce qui a encore dû être corrigé après eux.

Pour chaque travail, un sous-dossier contient deux fichiers :

- `script.js` : le script qui a lancé l'équipe, tel qu'il a tourné. On y lit la consigne exacte donnée à chaque agent.
- `comptes-rendus.md` : le compte rendu de chaque agent, dans l'ordre où ils ont été lancés, avec son rôle. Ce sont les mots des agents, remis en texte lisible, sans réécriture.

| dossier | le travail | agents | durée | jetons | appels d'outils |
|---|---|---|---|---|---|
| `construction/` | construire `ml/evolution`, la sélection naturelle des bots | 10 | 2 h 41 | 2 399 211 | 542 |
| `journal/` | écrire le journal de bord du portfolio | 16 | 25 min | 2 444 100 | 523 |
| `images/` | tirer cinq images des données et rendre le journal lisible | 20 | 26 min | 2 463 737 | 547 |
| `finitions/` | finir `ml/evolution` avant de l'installer sur le Ryzen | 7 | 3 h 18 | 1 993 694 | 568 |
| *sous-total du 27/11* | | *53* | | *9 300 742* | *2 180* |
| `traces-du-soir/` | ranger le soir du 27/11 dans le journal, la passation et ce dossier | 4 | 16 min | 782 967 | 260 |
| `reglage/` | étudier le réglage de la sélection, sans jouer de course | 11 | 2 h 11 | 2 604 327 | 619 |
| `portage/` | faire des idées de la boucle payante des gènes, fixer Node, mesurer le coffre | 9 | 1 h 26 | 1 819 083 | 542 |
| `changements-surs/` | faire entrer les changements sûrs de l'étude dans la sélection | 7 | 5 h 03 | 1 986 602 | 597 |
| *sous-total de la nuit* | | *31* | | *7 192 979* | *2 018* |
| **total** | | **84** | | **16 493 721** | **4 198** |

Les chiffres viennent du bilan que Claude Code écrit à la fin de chaque orchestration (`workflows/<identifiant>.json` : `agentCount`, `durationMs`, `totalTokens`, `totalToolCalls`), relus le 28/11 au matin. Ils redonnent les nombres que la session principale avait en mémoire pour la nuit : 0,78, 2,60, 1,82 et 1,99 million de jetons. Le journal et les images ont tourné pendant que la construction tournait encore ; la nuit, les traces du soir et l'étude du réglage ont démarré à moins de trois minutes d'écart, et l'étude tournait encore quand le portage a commencé. Deux autres orchestrations du 27/11, plus tôt dans l'après-midi (la conception de la sélection naturelle et les enquêtes sur ce qui distingue le bot d'un joueur), ne sont pas rangées ici. Deux autres encore ont démarré le 28/11 au matin et n'étaient pas finies quand ce dossier a été complété (les « prochaines idées », et celle qui a rangé les quatre travaux de la nuit) : elles n'ont pas encore de bilan et ne sont pas rangées ici.

---

## Ce qu'est une orchestration

Sur ce chantier, Sacha dirige et ne code pas. Le code et les textes sont écrits par Claude, un modèle de langage d'Anthropic, dans l'outil Claude Code. Le 27/11, le travail est réparti sur deux niveaux.

**La session principale.** C'est la conversation que Sacha a ouverte. Elle tourne avec le modèle Claude Fable. Elle lit l'état du chantier, conçoit le travail, écrit les consignes, décide de l'ordre, puis relit ce qui revient avant de l'enregistrer dans git (git est l'outil qui garde chaque version des fichiers, avec la date et l'auteur de chaque changement). C'est aussi elle qui parle à Sacha.

**Les agents.** Un agent est une autre instance de Claude, ici le modèle Claude Opus. Il est lancé avec une consigne écrite, il travaille seul dans le dépôt : il lit les fichiers, lance des commandes, écrit du code ou du texte. Quand il a fini, il rend un compte rendu sous une forme fixée d'avance : un résumé, la liste des fichiers touchés, les tests passés, les problèmes restants. Il ne voit pas la conversation avec Sacha, seulement sa consigne.

**L'orchestration.** C'est le petit programme (le `script.js` de chaque sous-dossier) que la session principale écrit pour lancer une équipe d'agents. Il dit qui travaille en même temps, qui attend qui, et ce que chacun reçoit des autres. Les quatre scripts du 27/11 suivent tous la même idée : un agent écrit, un autre agent relit. Le relecteur reçoit le compte rendu de celui qu'il relit, avec une consigne du genre « ne le crois pas » : il doit rouvrir les fichiers, refaire les mesures, chercher ce qui casse. Selon les travaux, le relecteur corrige lui-même, ou il relève les défauts et un troisième agent les corrige. Un dernier agent, l'intégrateur, assemble souvent le tout et relance tous les tests.

**Pourquoi travailler ainsi.** Le 27/11, Sacha écrit à la session principale : « gère mieux l'abonnement, tu utilises trop Fable par rapport à Opus » (à 14 h 25, heure universelle, dans le relevé daté de ses messages, tenu hors git). D'après les notes de travail de Claude, l'abonnement a un quota par semaine, plus serré pour Fable que pour les autres modèles. Depuis, la session principale garde pour elle la conception et les décisions, et confie les longues tâches à des agents Opus. Une équipe permet aussi de travailler en parallèle : quatre modules écrits en même temps, sept chapitres en même temps. Et la relecture par un agent qui n'a pas écrit le travail trouve des erreurs que l'auteur ne voit plus.

**Le coût.** Il se compte en jetons. Un jeton est un petit morceau de texte, souvent une partie de mot : un modèle lit et écrit en jetons. Le compteur additionne tout ce que les agents ont lu et écrit, y compris les fichiers qu'ils relisent à chaque étape. Ces jetons sont pris sur le quota de l'abonnement de Sacha. Le compteur ne dit pas ce que la session principale a consommé de son côté.

**Ce que fait la session principale après.** Elle lit les comptes rendus, regarde les fichiers, relance ce qui peut l'être, corrige ce qui reste, et écrit le message du commit. Chaque section ci-dessous dit ce qu'elle a encore dû corriger.

---

## 1. La construction de `ml/evolution` (16 h 49 – 19 h 30)

**Le but.** Construire le système de sélection naturelle demandé par Sacha le matin même : une population de pilotes (des programmes qui conduisent la voiture du jeu) court sur un PC, sans jetons ni Internet ; à chaque génération, les moins bons sont renvoyés et de nouveaux pilotes naissent par mutation ou par croisement. La spécification avait été écrite avant, dans `ml/ecurie/etude/selection-naturelle/SPECIFICATION.md`.

**L'équipe : 10 agents, en cinq temps.**

1. Un **architecte** écrit le contrat entre les morceaux du programme (`ml/evolution/INTERFACES.md`) : ce que chaque morceau reçoit et rend. Il ne code rien.
2. Quatre **constructeurs** écrivent chacun un morceau, en même temps, avec ses tests : le pilote fabriqué à partir d'un génome (la liste des réglages qui peuvent muter), les courses, la note, et l'exploitation (le tableau de bord, les fichiers à double-cliquer).
3. Un **intégrateur** écrit le programme maître `evoluer.js`, qui fait tourner les générations, et l'essaie de bout en bout sur une petite configuration.
4. Trois **relecteurs** relisent en même temps, chacun sous un angle : la statistique (la sélection choisit-elle vraiment les meilleurs, ou au hasard ?), la robustesse (que se passe-t-il si le PC s'arrête, si un fichier est tenu ouvert ?), le déterminisme (la même course rejouée donne-t-elle exactement le même résultat ?). Ils relèvent les défauts sans les corriger.
5. Un **correcteur** corrige tout ce que les relecteurs ont relevé et relance tous les tests.

**Ce que les relecteurs ont trouvé : 20 défauts**, dont 11 jugés importants et 9 mineurs, aucun bloquant (8 en statistique, 9 en robustesse, 3 en déterminisme). Le correcteur dit les avoir tous corrigés, sauf un en partie : les anciens fichiers de courses ne sont pas archivés. Trois exemples :

- **Le sacre trop facile.** Un pilote est « sacré » champion quand il prouve, sur 24 courses neuves, qu'il fait mieux que le champion en place. Le relecteur statistique a simulé 300 validations où le candidat ne vaut en réalité pas mieux : 18,3 % des fois, il était sacré quand même. Le code suivait la spécification à la lettre ; c'est la règle qui était trop lâche. Après correction (un seuil deux fois plus exigeant), les faux sacres tombent à 3,7 %. Le prix est dit dans le compte rendu : un candidat vraiment meilleur d'un palier n'est plus reconnu que 12 % du temps, contre 37,7 % avant.
- **Le verrou qui ne protégeait pas.** Le verrou empêche deux programmes maîtres de tourner en même temps sur le même état. Le relecteur robustesse a montré que deux maîtres lancés ensemble pouvaient le prendre tous les deux. Après correction, le correcteur dit l'avoir rejoué 12 fois sans que les deux le tiennent ensemble.
- **Les fins de ligne.** Les fichiers des pilotes sont identifiés par une empreinte de leur contenu. Le relecteur déterminisme a vu que git, sur Windows, peut changer leurs fins de ligne à l'extraction : l'empreinte change et le pilote n'est plus reconnu. Corrigé par un réglage de git.

**Ce que la session principale a encore corrigé.** D'après le message du commit `e2ea8d2c9` (19 h 32) : des tests qui dépendaient d'un dossier ignoré par git, donc absent sur un autre PC. Le système n'avait encore jamais tourné pour de vrai.

---

## Entre les deux : le premier vrai lancement, et une erreur

À 19 h 32, `ml/evolution` est enregistré dans git (commit `e2ea8d2c9`), puis envoyé sur GitHub. À 19 h 33 (l'heure de départ écrite dans le verrou de ce premier lancement, `etat/verrou.json.mort-14580`), la session principale le lance pour la première fois avec la vraie configuration (20 pilotes, 12 courses par pilote et par génération, 4 courses à la fois sur le Xeon, le PC de développement), dans une copie à part du dépôt.

Pour lire l'aide du programme, elle tape `node ml/evolution/evoluer.js --aide 2>&1 | head -30` (la commande est dans la conversation de la session principale). L'option `--aide` n'existait pas, et le programme ignorait en silence les options qu'il ne connaissait pas : la vraie évolution a démarré. Puis `head`, qui ne garde que les 30 premières lignes, a fermé le tuyau par lequel le programme écrivait, et le programme est mort (une erreur nommée EPIPE). L'erreur est celle de la session principale, donc de Claude. Aucun des dix agents de la construction, relecteurs compris, n'avait relevé ces deux défauts.

Les garde-fous écrits par l'équipe ont tenu. Le journal de la relance (`ml/evolution/etat/sortie.log` de cette copie) le montre : le verrou laissé par le programme mort est reconnu comme abandonné et repris, et « le cache rend les courses déjà jouées ». Les 22 courses jouées avant la mort n'ont pas été rejouées. Les deux défauts sont devenus les deux premiers points de la consigne des finitions (voir `finitions/script.js`).

**L'état de cette évolution, lu le 27/11 à 23 h 19** (avec `node ml/evolution/etat.js`, qui ne fait que lire) : elle tourne toujours.

- La génération 0 est finie : 280 courses (240 d'entraînement et 40 du « coffre », des courses qui ne servent jamais à l'entraînement), dont 258 jouées et 22 rendues par le cache, en 81 minutes, soit 191 courses à l'heure. Aucune course non mesurée.
- Le témoin, le pilote écrit à la main qui ne mute jamais (`pilote-voltige`), atteint en moyenne le palier 6,5 sur ses 12 courses ; sa note F vaut 2,8 à 0,9 près, et son écart aux joueurs E vaut 0,90 (plus E est petit, plus le pilote ressemble à un joueur humain).
- La génération 1 a fait naître 6 pilotes (1 immigré, 3 mutations, 2 croisements) et doit jouer 312 courses (26 pilotes et 12 courses chacun) ; à 23 h 19, son journal en compte 295 de terminées, et 307 à 23 h 24 (relecture du vérificateur, dans `etat/sortie.log`).
- Le résumé affiche l'alerte « population trop semblable (distance 0.028) » dès la génération 0. C'est l'un des défauts corrigés le soir même (section 4) ; cette copie tourne avec le code de 19 h 32, qui ne contient pas la correction.

---

## 2. Le journal de bord (18 h 19 – 18 h 43)

**Le but.** Écrire le journal de bord du chantier pour le portfolio (`ml/ecurie/portfolio/journal/`), à partir de git, des documents et des journaux, sans rien écrire de mémoire.

**L'équipe : 16 agents.**

- Sept **rédacteurs**, en même temps, un par période (avant le 22/11, les 22 et 23/11, le 24/11, le 25/11, le 26/11, le 27/11) et un pour le chapitre « comment on a travaillé ».
- Sept **vérificateurs**, un par chapitre : chacun recontrôle chaque chiffre, date et citation dans les sources et corrige le fichier en place.
- Un agent écrit le **sommaire** (le fil du récit, la frise, le registre des impasses, les pièces à montrer).
- Un **critique** lit le tout, tire des chiffres au hasard pour les recontrôler et dit ce qui manque.

**Ce que les relecteurs ont trouvé.** Les sept vérificateurs disent avoir contrôlé 560 affirmations en tout ; ils ont fait 94 corrections et retiré 7 passages. Le critique, passé après eux, a recontrôlé 25 chiffres tirés au hasard : 21 justes, 3 faux, 1 introuvable. Les erreurs qu'il donne : une heure fausse d'une heure (l'heure universelle lue comme l'heure de Paris), un chiffre du plan d'origine repris sans sa correction, une phrase de journal simplifiée jusqu'à devenir fausse, un nombre de fichiers périmé. Il a aussi retiré un détail privé que les rédacteurs et les vérificateurs avaient laissé passer, et relevé cinq commits oubliés par le récit (quatre de septembre, un de novembre), plus douze commits secondaires non cités. Son jugement : le dossier est honnête, mais il reste « trop un rapport d'ingénieur » pour un jury : pas d'images, des chapitres longs, du jargon.

**Ce que la session principale a encore corrigé.** D'après le commit `29bce656d` (18 h 49) : le relevé daté des messages de Sacha a été refait (49 messages au lieu de 40 : la première version oubliait ceux tapés pendant que Claude travaillait), et l'étude a été corrigée, « quatre gestes à essayer et non six ». Ce « six » venait de la consigne de la session principale elle-même (`journal/script.js`) : les agents l'avaient repris.

---

## 3. Les images et la lisibilité du journal (18 h 51 – 19 h 17)

**Le but.** Répondre au critique : tirer cinq images des données du dépôt, mettre en tête de chaque chapitre une version courte sans jargon, écrire un lexique, puis faire lire le tout par un lecteur qui ne programme pas.

**L'équipe : 20 agents.**

- Cinq **auteurs d'images**, chacun écrit un script qui dessine son image à partir des fichiers du dépôt (jamais à la main) : la frise des changements de méthode, « ressembler ou gagner », le bruit des notes, les apprentissages partis de zéro de septembre et octobre, les dépenses.
- Cinq **contrôleurs**, un par image : ils recontrôlent les données à la source, regardent le rendu et corrigent.
- Huit agents écrivent la **version courte** d'un chapitre (« En une minute »).
- Un **metteur en page** insère les images et écrit le lexique.
- Un agent joue un **membre du jury** (il enseigne le design, il ne programme pas, il a vingt minutes) : il dit ce qu'il a compris, où il se perd, et corrige en place.

**Ce que les relecteurs ont trouvé.** Les cinq contrôleurs ont corrigé 30 erreurs de données et 17 défauts de rendu. Le plus net : l'image « ressembler ou gagner » comparait au départ un écart mesuré sur 12 courses de 600 secondes à un palier mesuré sur 20 courses de 900 secondes, et plaçait les joueurs à 0,91 alors que, par définition, ils valent 0. Le contrôleur le dit : deux erreurs de fond « faussaient l'image ». Le metteur en page a inséré 6 images et écrit 75 entrées de lexique. Le lecteur-jury a fait 11 corrections.

**Ce que la session principale a fait après.** Aucune correction de sa part sur ce travail lui-même n'a été retrouvée : le commit `53703c501` (19 h 18) reprend ce que les agents ont rendu. Le travail suivant, fait sans orchestration (commit `4c1fe5c3c`, 19 h 43), répond à un manque que le critique avait relevé : aucune image du jeu lui-même.

---

## 4. Les finitions de `ml/evolution` (19 h 46 – 23 h 05)

**Le but.** Préparer l'installation sur le Ryzen, le second PC de Sacha, qui fera tourner la sélection jour et nuit. Trois lots :

1. **Un réglage par PC.** Chaque machine mesure seule, au premier lancement, combien de courses elle peut jouer à la fois (« le banc », écrit dans `etat/machine.json`). Les deux défauts du premier lancement y sont corrigés : une option inconnue arrête le programme au lieu d'être ignorée, et le programme ne meurt plus quand sa console se ferme.
2. **Les traces pour le portfolio.** `arbre.js` dessine l'arbre généalogique des pilotes (qui naît de qui, quels gènes ont changé, qui est renvoyé, qui est sacré) ; `histoire.js` écrit le récit génération par génération ; `sauver-traces.cmd` met les journaux à l'abri dans git chaque heure, sur une branche à part.
3. **Les gestes.** Les cinq gestes repérés le jour même chez les joueurs (par exemple lâcher les touches juste avant de toucher la route) deviennent des gènes éteints à la naissance : un pilote peut les allumer par mutation, et la sélection dira s'ils servent. Le génome passe de 86 à 107 gènes.

**L'équipe : 7 agents.** Deux **constructeurs** en même temps (machine, traces), chacun suivi de son **relecteur** ; puis le **constructeur des gestes** et son **relecteur** ; enfin un **intégrateur**. Cette fois, les relecteurs reçoivent la consigne de casser le travail, puis de corriger eux-mêmes ce qu'ils trouvent.

**Ce que les relecteurs ont trouvé : 28 défauts** (7 pour la machine, 17 pour les traces, 4 pour les gestes), dont 1 bloquant, 8 importants et 19 mineurs ; 23 corrigés par les relecteurs, 5 laissés à l'intégrateur. Exemples :

- **Bloquant** : `lancer.cmd` refusait de démarrer si le chemin du dossier contenait une parenthèse, comme « CASH CAR (2) », le nom que Windows donne à une copie. Le défaut existait avant ce lot.
- **Important** : sans protection, `sauver-traces.cmd` aurait fait un commit d'environ 1,2 mégaoctet chaque heure même quand la sélection était arrêtée, parce que les pages portent l'heure.
- **Important** : deux gestes allumés ensemble se gênaient ; le coup de nitro partait pendant que l'autre geste tenait déjà la nitro, et ne servait à rien.
- Le relecteur des gestes a simulé 10 000 naissances : chaque geste s'allume dans 3,3 % à 3,9 % d'entre elles.

L'intégrateur a corrigé 7 points de plus et fait un essai de 3 générations sur une petite population de 4 pilotes : le pilote fabriqué rejoue le pilote écrit à la main, course pour course, sur 3 courses (« IDENTIQUE »), un arrêt demandé en pleine génération finit proprement, et un enfant a déjà allumé un geste (garder la nitro un instant après le décollage). Cela ne dit rien de la valeur de ce geste.

**Ce que la session principale a encore corrigé** (commit `7c5204afa`, 23 h 12, et `ml/evolution/notes/integration.md`) :

- **Le nom du PC.** `machine.json`, fait pour être enregistré dans git, contenait le nom Windows du PC, et le message de chaque commit de `sauver-traces.cmd` aussi. Le dépôt GitHub est public : ce nom serait parti en ligne. Il est remplacé par une empreinte et par la fin du nom de la branche. L'erreur venait de la consigne de la session principale (`finitions/script.js` demande d'y écrire `os.hostname()`, le nom du PC) ; aucun des agents ne l'a relevée.
- **L'alerte « population trop semblable ».** L'intégrateur avait recalculé son seuil par une règle de trois (0,05 multiplié par 86 sur 107, soit 0,04) sans mesurer une vraie population. Une vraie population de 20 à la naissance vaut 0,028 sur 86 gènes, soit 0,0225 sur 107 (`ml/evolution/config.json`) : l'alerte aurait sonné dès la génération 0 et n'aurait plus rien dit. Le seuil est ramené à 0,012, environ la moitié de la distance mesurée à la naissance. La vraie évolution du Xeon, qui tourne avec l'ancien code, affiche en effet cette alerte.
- **L'installateur** dit désormais que ce qui part sur un dépôt public est lisible par tous.

**Ce qui n'est pas fait le 27/11 au soir** (`ml/evolution/notes/LIVRAISON.md`) : la sélection n'a jamais tourné sur le Ryzen ; `sauver-traces.cmd` n'a jamais rien envoyé vers le vrai GitHub, seulement vers une copie locale ; les tâches planifiées n'ont jamais été posées (elles changent des réglages de Windows, c'est à Sacha de le faire) ; certains tests lents n'ont pas été relancés avec le code final ; on ne sait pas si un seul des cinq gestes est bon.

---

## La nuit du 27 au 28/11 : ce qui se passe autour des quatre équipes

Les quatre travaux de la nuit répondent à ce qui arrive du Ryzen. Les faits, dans l'ordre, d'après git :

- À 0 h 12, un commit signé Sacha sur le Ryzen arrête la boucle payante (`b1ff8af89` : « arret pour la selection naturelle », génération 15 interrompue, champion c0101, journal total 58,53 EUR sur 200). La boucle payante, c'est l'ancienne méthode : un modèle de langage réécrit le pilote, le vrai jeu le note, et chaque version coûte de l'argent d'API.
- À 0 h 29, la sélection naturelle démarre sur le Ryzen (« lance le 28/11 00:29 », dans le `resume.txt` que le Ryzen a envoyé sur la branche `evolution-ryzen`). Elle y tient 10 courses à la fois et joue 418 courses à l'heure ; sa génération 0, 280 courses, a pris 40 minutes. Le Xeon, à 4 courses à la fois, en faisait 191 à l'heure.
- À 0 h 36, les résultats de la boucle payante rejoignent `bots-ecurie` (commit `7f9543955`) : cinq champions sacrés à la suite (c0026, c0064, c0072, c0087, c0101), 21,61 EUR dépensés sur le Ryzen.
- L'installation a révélé deux défauts. Le rapport d'installation que Sacha a transmis est recopié dans la consigne du lot « lanceurs » (`portage/script.js`) : un mauvais Node passait devant dans le PATH, et les tâches planifiées avaient la limite de 72 heures que Windows met par défaut.

Les quatre équipes ont été lancées par la session principale. Les décisions de cap restent celles de Sacha : arrêter la boucle payante, installer la sélection sur le Ryzen. Le choix des études, des lots, des consignes et de l'ordre est celui de Claude.

---

## 5. Les traces du soir du 27/11 (27/11, 23 h 13 – 23 h 29)

**Le but.** Ranger la soirée du 27/11 avant qu'elle s'oublie : la compléter dans le journal de bord, mettre à jour les deux documents de passation (`ml/ecurie/ETAPES.md`, `ml/ecurie/PASSATION.md`, qui servent à une session qui reprendrait le chantier sans rien savoir), et créer ce dossier.

**L'équipe : 4 agents.** Trois **rédacteurs** en même temps (le journal, la passation, les traces des orchestrations), puis un **vérificateur** qui reçoit leurs trois comptes rendus. C'est le rédacteur des traces qui a écrit l'outil `orchestration.js` et les sections 1 à 4 ci-dessus.

**Ce que le vérificateur a trouvé.** Il dit avoir recontrôlé plus de 40 chiffres, dates et citations dans les sources. Ses corrections les plus nettes viennent de la consigne elle-même, donc de la session principale :

- La consigne donnait le premier vrai lancement « vers 19 h 40 ». L'heure écrite dans le verrou de ce lancement est 19 h 33. Corrigé dans trois fichiers.
- La consigne donnait « le journal de bord (7 agents, 2,44 millions) ». L'équipe du journal comptait 16 agents. Corrigé dans la passation.
- L'outil de nettoyage révélait lui-même un détail familial, parce que sa règle cherchait une tournure trop précise. Le vérificateur l'a remplacée par une règle générale ; le résultat du nettoyage est le même.

Il a laissé un doute ouvert : il n'a trouvé dans aucun fichier le contrôle d'identité « IDENTIQUE sur 3 graines » de la vraie évolution du Xeon ; le journal et la passation l'écrivent donc « d'après Fable ».

**Ce que la session principale a fait après.** Elle a enregistré le tout une minute après la fin de l'équipe (commit `e93ff5cb5`, 23 h 30). C'est ce commit que le Ryzen a installé une heure plus tard. Aucune correction de sa part n'est signalée dans le message du commit.

---

## 6. L'étude du réglage de la sélection (27/11, 23 h 16 – 28/11, 1 h 26)

**Le but.** Avant de laisser le Ryzen tourner des jours, savoir si la sélection telle qu'elle est réglée peut progresser, et ce qui la freine. Sans jouer de course : sur les deux vraies générations jouées par le Xeon le 27/11. Le résultat est dans `ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md`.

**L'équipe : 11 agents.** Cinq **auteurs d'études**, en même temps : ce que font vraiment les mutations (« effets ») ; un **simulateur** de la sélection, qui ne joue aucune course ; où part le temps d'une course (« vitesse ») ; faut-il finir les courses d'un enfant visiblement raté (« tri précoce ») ; comment reconnaître un vrai meilleur sans sacrer un chanceux (« sacre »). Chaque étude, dès qu'elle est finie, passe à son **relecteur**, qui doit chercher à la réfuter, refaire au moins un résultat par un autre chemin et corriger le texte en place. Enfin un agent écrit la **synthèse** classée.

**Ce que les relecteurs ont trouvé.** Ils ont jugé 26 recommandations : 6 « tiennent », 18 « tiennent avec réserve », 2 « ne tiennent pas ». Ils ont corrigé 33 erreurs en tout. Quelques exemples, tirés de leurs comptes rendus :

- **Un gain mesuré sur les données qui ont servi à le choisir.** Le simulateur proposait de ne rejouer qu'une partie des anciens pilotes, pour +0,31 palier. Ce réglage avait été choisi parmi 15 sur les mêmes mondes simulés. Le relecteur l'a rejoué sur 40 mondes neufs : +0,05. C'est le même piège que celui de la boucle payante, raconté à la section 7.
- **Des gains surestimés de deux à trois fois.** L'étude « vitesse » rapportait les secondes gagnées à une course courte (42,7 s), puis appliquait le pourcentage à une course moyenne (110,6 s). Une accélération annoncée à 12,4 % vaut 4,7 à 6,1 %.
- **La mauvaise base de comparaison.** L'étude « tri précoce » comparait tout à une génération de 12 graines. Le relecteur a vu dans les journaux que la vraie évolution était déjà passée à 8 graines par génération. Le gain annoncé (2,1 fois plus de générations par jour) devient 1,4 fois.
- **Un bruit compté deux fois.** Les paramètres que l'étude « effets » donnait au simulateur doublaient le hasard d'une course d'enfant.

Le résultat qui compte, dans la synthèse : le hasard d'une course vaut 3,26 paliers ; l'écart vrai entre deux mutants vaut 0,32 palier, avec un intervalle de 0 à 1,07. Dans le cas le plus probable, le classement de la sélection est fait à 80 ou 90 % de hasard. D'après le message du commit `1f64c426b`, la synthèse classe quatre changements sûrs, deux à grouper avec une époque, cinq à essayer après une mesure, cinq décisions pour Sacha et neuf idées écartées.

**Ce que la session principale a fait après.** Elle a enregistré l'étude à 1 h 28 (commit `1f64c426b`). Son message ne signale aucune correction de sa part. Les quatre changements sûrs sont devenus la consigne de la section 8.

---

## 7. Les idées de la boucle payante deviennent des gènes, le Node fixe, la mesure du coffre (28/11, 0 h 38 – 2 h 04)

**Le but.** Le Ryzen venait de rendre cinq champions de la boucle payante. Quatre questions : c0101, le dernier, est-il vraiment meilleur que le pilote de départ c0025 sur des courses neuves ? Que raconte la boucle, génération par génération ? La sélection peut-elle reprendre ses idées sous forme de gènes ? Et les deux défauts de l'installation sur le Ryzen.

**L'équipe : 9 agents.** Quatre **constructeurs**, chacun suivi de son **relecteur** dès qu'il a fini, puis un **intégrateur** :

1. « **mesure** » : jouer c0025, c0026, c0064 et c0101 sur les 40 graines du « coffre ». Une graine fixe une course (les cartes tirées, la route) ; les graines du coffre n'ont jamais servi à choisir un pilote.
2. « **lignée** » : l'histoire de la boucle payante, pour le portfolio (`ml/ecurie/etude/boucle-payante-ryzen/LISEZ-MOI.md`) : 88 versions écrites en 15 générations pour 21,61 EUR, et la règle du sacre de la boucle (à égalité en validation, on sacre).
3. « **portage** » : le génome passe à la version 3, avec 121 gènes. Les quatre idées de la boucle deviennent quatre interrupteurs, éteints à la naissance. Tout éteint, le pilote écrit joue comme c0025 au bit près ; tout allumé, comme c0101.
4. « **lanceurs** » : un Node fixe par PC (`etat/node.txt`), et des tâches planifiées sans limite de durée.

**Ce que les relecteurs ont trouvé.**

- **Le verdict provisoire de la mesure ne tenait pas.** L'agent de la mesure a été arrêté avant la fin de ses courses : il dit lui-même avoir rendu son compte rendu après 20 courses sur 164. Sur les 20 graines de validation de la boucle, il trouvait c0064 meilleur que c0025 de 2 paliers, et proposait c0064 comme pilote de départ. Son relecteur a joué 6 graines de plus du coffre : sur 10 graines, c0064 fait −1,20 palier par rapport à c0025 (intervalle à 95 % de −3,20 à +0,40). Il a écrit que le verdict n'était pas soutenu.
- **Deux lots qui se gênaient.** Le même relecteur a trouvé que le lot « portage », qui tournait en même temps, avait modifié `ml/evolution/modele.js`. Ce fichier entre dans l'« époque » des courses : quand il change, les courses déjà jouées ne comptent plus. L'outil d'analyse de la mesure ne gardait plus aucune course. Le relecteur l'a corrigé. La cause est dans la consigne de la session principale : elle lançait en même temps une mesure et un lot qui touchait un fichier de l'époque. La consigne suivante (section 8, `changements-surs/script.js`) interdit de toucher `modele.js` et `enfant.js` pendant qu'une mesure tourne.
- **Un état vide après un arrêt.** Le relecteur du portage a trouvé que la commande qui fait repartir la population d'un autre pilote (`--repartir-de c0101`) pouvait laisser l'état vide si on l'arrêtait au mauvais moment. La relance horaire aurait alors fait renaître la population de c0025 sans le dire. Corrigé, avec un test.
- **Des tâches vérifiées par Windows sans être posées.** Le relecteur des lanceurs a fait contrôler les trois fichiers de tâches par le Planificateur de tâches de Windows, dans un mode qui vérifie sans rien enregistrer : ils sont acceptés. Il a corrigé deux défauts, dont un qui aurait fait refuser au lanceur le Node que l'installateur venait de fixer.
- **Deux phrases fausses dans l'histoire de la boucle**, corrigées par le relecteur de la lignée.

L'intégrateur a fermé un dernier trou entre le portage et les lanceurs : sur le Ryzen, la commande de changement de pilote se tape à la main, avec le mauvais Node du PATH ; `evoluer.js` refuse désormais de partir sous un autre Node que celui de la population. Il dit que tous les tests rapides passent ; la commande de changement de pilote n'a pas été essayée de bout en bout par le lanceur `lancer.cmd`. Il a laissé le pilote de départ à c0025 : la décision revenait à la session principale.

**Ce que la session principale a fait après.** Elle a enregistré le travail à 2 h 08 (commit `7b1df608e`), puis fini elle-même la mesure du coffre : 40 graines sur 40, 160 courses (`ml/ecurie/etude/boucle-payante-ryzen/coffre/LISEZ-MOI.md`, commit `00fb4cfad`, 3 h 04). **Le résultat est une impasse.** Sur ces 40 courses neuves, c0064 fait +0,03 palier par rapport à c0025 (intervalle à 95 % de −1,18 à +1,38), c0101 aussi (de −1,18 à +1,23). Le « +2 paliers » vu en validation venait de 20 graines rejouées à chaque sacre : le champion était celui que le hasard y favorisait. La boucle payante a coûté 21,61 EUR et une nuit de Ryzen pour l'apprendre. La décision de la session principale : le pilote de départ reste c0025, et les quatre idées de la boucle restent des gènes éteints à la naissance, que la sélection essaiera une par une.

---

## 8. Les changements sûrs de l'étude entrent dans la sélection (28/11, 2 h 10 – 7 h 13)

**Le but.** Appliquer à `ml/evolution` les changements que l'étude du réglage (section 6) jugeait sûrs, avant la mise à jour du Ryzen. Le détail est dans `ml/evolution/notes/LIVRAISON-REGLAGE.md`.

**L'équipe : 7 agents.** Deux **constructeurs** en même temps, « sacre » et « tau », puis un troisième, « règles », qui attend le premier parce qu'ils touchent le même fichier. Puis trois **relecteurs** en même temps, et un **intégrateur**.

1. « **sacre** » : la validation devient séquentielle. Le meilleur pilote du moment affronte le champion sur 24 graines neuves, puis par paquets de 12, jusqu'à 96. Et l'alarme « malédiction du gagnant » est coupée : l'étude avait montré qu'elle sonnait par construction.
2. « **tau** » : un outil neuf, `mesure-tau.js`. Il dit, sans jouer une course de plus, si les mutations comptent : un enfant bon sur ses premières graines l'est-il aussi sur les suivantes ?
3. « **règles** » : les enfants sont protégés par leur âge et non par un nombre de courses ; les courses longues sont demandées d'abord ; la réserve de graines d'entraînement ne s'épuise plus ; les mutations ne tombent plus sur un réglage que le pilote ne lit pas.

**Ce que les relecteurs et les constructeurs ont trouvé.**

- **Une règle que personne n'avait relue.** La synthèse le disait d'un des changements (la protection des enfants). Le constructeur des règles a vérifié le code avant de le changer : la règle en place ne faisait pas ce que la synthèse décrivait dans trois cas, dont un où aucun pilote n'était renvoyé pendant toute la première génération d'une nouvelle époque.
- **Une note qui dépendait de l'ordre d'arrivée des courses.** En changeant l'ordre des courses, le même constructeur a découvert que la note d'un pilote changeait selon l'ordre où les courses finissaient. Il a trié les lignes avant le calcul. Son relecteur l'a vérifié : sur 10 mélanges des mêmes 48 courses, la note changeait 10 fois avant la correction, 0 fois après.
- **Une conclusion trop rapide.** L'outil « tau » ne doit jamais conclure avant d'avoir mesuré assez d'enfants (191). Son relecteur a trouvé deux états d'essai, laissés par un autre test, où le hasard mesuré valait zéro : l'outil n'exigeait plus que 4 enfants et concluait « les mutations comptent » sur 7. Corrigé par un plancher.
- **Un prix assumé.** Avec les garde-fous du sacre laissés à leur valeur par défaut, un vrai +2 paliers est reconnu environ 80 fois sur 100, et non 86 comme l'étude l'annonçait avec des garde-fous plus sévères. Ce choix est laissé à Sacha.

Cette équipe a duré 5 h 03, la plus longue des huit : l'intégrateur a relancé les tests lents. D'après le message du commit `3b1bf15e5`, le test de bout en bout a pris 3 602 secondes, et un état écrit par le code exact du Ryzen a été repris par le nouveau code en vraies courses. L'intégrateur n'a pas lancé `tests/courses.test.js` : ce test joue 4 courses à la fois, et le PC en jouait déjà 4 pour le banc des gènes.

**Ce que la session principale a fait après** (commits `3b1bf15e5` et `2a3bea3c1`, 7 h 20 et 7 h 22 ; `LIVRAISON-REGLAGE.md` § 5). Elle a relancé une par une les 19 suites de tests rapides. Puis elle a fait lire par le nouveau code le dernier état envoyé par le Ryzen : ses 26 génomes se relisent en version 3 avec les mêmes identifiants, et la fusion avec la branche du Ryzen ne fait aucun conflit. Elle a relevé un point à regarder d'abord sur place : le dernier envoi du Ryzen datait de 2 h 00. À 418 courses à l'heure, il aurait dû envoyer cinq fois depuis.

---

## La leçon de méthode de la nuit

C'est une décision de la session principale. La sélection naturelle et la boucle payante butent sur le même mur : le hasard d'une course. Il vaut environ 3 paliers ; l'écart vrai entre deux mutants, environ 0,3. Les petits réglages ne se voient donc pas, ni sur 20 graines de validation, ni dans le classement d'une génération. Il faut des changements de structure (une nouvelle façon de conduire, pas un réglage de plus), écrits comme des gènes éteints à la naissance, et jugés un par un sur beaucoup de graines identiques.

C'est ce que fait le « banc des gènes » (`ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md`) : 13 variantes du pilote de départ, chacune avec un seul interrupteur allumé ou quelques mélanges, sur les mêmes 96 graines. Il n'est pas une orchestration : c'est un programme qui joue des courses sur le Xeon. Son journal commence à 3 h 28. À 7 h 26 (dernière ligne lue), il en était à 708 courses sur 1 250. Son résultat n'existe pas encore.

---

## Ce que cette méthode ne garantit pas

Un compte rendu d'agent n'est pas une preuve. C'est ce que l'agent dit avoir fait. Les exemples de ce dossier :

- **Des agents ont validé des chiffres faux.** Après sept vérificateurs qui disent avoir contrôlé 560 affirmations, le critique trouve encore 3 chiffres faux et 1 introuvable sur 25 tirés au hasard. Après eux, les contrôleurs d'images corrigent 30 erreurs de données faites par les auteurs d'images.
- **Les relecteurs ne voient que ce qu'on leur demande de regarder.** Aucun des 10 agents de la construction, relecteurs compris, n'a relevé qu'une option inconnue lançait la vraie évolution ; c'est une erreur de la session principale, au premier lancement réel, qui l'a révélé.
- **Une erreur dans la consigne passe à travers toute l'équipe.** Le nom du PC destiné à un dépôt public, et les « six gestes » au lieu de quatre, venaient des consignes de la session principale. Les agents les ont appliqués fidèlement, et leurs relecteurs aussi.
- **Un chiffre peut être calculé au lieu d'être mesuré.** Le seuil de 0,04 de l'intégrateur était juste en arithmétique et faux sur une vraie population.
- **Une correction a un prix.** Le sacre plus exigeant fait moins de faux champions, mais reconnaît beaucoup moins souvent un vrai progrès d'un palier (12 % au lieu de 37,7 %). C'est un choix, pas une victoire.
- **Ce que la consigne ne dit pas, l'agent le choisit.** Les consignes des finitions demandaient du code commenté en français, mais ne disaient pas dans quelle langue rendre le compte rendu : quatre des sept sont en anglais, au moins en partie.
- **Des tests n'ont pas été relancés.** Le PC était occupé par la vraie évolution : certains tests lents n'ont pas tourné avec le code final, et `LIVRAISON.md` le dit.
- **Rien de cela ne dit si les bots jouent mieux.** Ces travaux construisent l'outil et racontent le chantier. La seule mesure qui comptera, des pilotes nés de la sélection qui battent le pilote écrit à la main sur des courses neuves, n'existe pas encore.

Ajouté le 28/11, avec les quatre travaux de la nuit :

- **Un agent ne sait pas attendre une longue mesure.** L'agent de la mesure du coffre a rendu son compte rendu après 20 courses sur 164, avec un verdict provisoire. Il a fallu que la session principale finisse elle-même la mesure.
- **Deux agents lancés en même temps peuvent se gêner.** Le lot « portage » a changé un fichier de l'époque pendant que la mesure jouait ses courses : elles ne comptaient plus. L'erreur est dans la consigne de la session principale ; c'est un relecteur qui l'a vue.
- **Le même piège peut revenir sous une autre forme.** Choisir et juger sur les mêmes données a trompé la boucle payante (20 graines de validation rejouées à chaque sacre) et le simulateur de l'étude (un réglage choisi et jugé sur les mêmes mondes). Le relecteur du simulateur l'a vu en rejouant sur des mondes neufs. Pour la boucle payante, il a fallu 160 courses neuves.
- **Un relecteur peut renverser un verdict, mais pas le trancher.** Le relecteur de la mesure a montré sur 10 graines que le verdict « c0064 » n'était pas soutenu. Seules les 40 graines du coffre ont dit qu'il n'y avait pas de gain.
- **Ce que personne ne relit reste faux.** Un changement que la synthèse donnait comme non relu décrivait mal la règle en place ; c'est le constructeur suivant, en vérifiant le code avant de le changer, qui l'a vu.
- **La langue n'est toujours pas fixée.** Sept des 31 comptes rendus de la nuit sont en anglais, au moins en partie.
- **Des tests ne sont toujours pas tous relancés.** `tests/courses.test.js` n'a pas tourné avec le code des changements sûrs, et rien de ce code n'a encore tourné sur le Ryzen.

---

## Comment ce dossier est fait

Les traces des orchestrations restent hors de git, dans le dossier de Claude Code, et s'effacent au bout d'un temps. Les deux fichiers de chaque sous-dossier sont sortis de l'outil `ml/ecurie/portfolio/outils/orchestration.js` :

```
node ml/ecurie/portfolio/outils/orchestration.js <dossier de la session Claude Code>
```

L'outil nettoie tout ce qu'il écrit, parce que le dépôt est public. Le 27/11 à 23 h 18, il a fait 16 remplacements : 10 chemins vers le dossier temporaire de Claude Code raccourcis en « <dossier temporaire> », 5 détails de famille retirés, et 1 nom de PC remplacé par « le-xeon » (c'était un nom d'exemple écrit par un relecteur, pas le vrai nom du PC). Il n'a trouvé ni clé, ni jeton, ni adresse e-mail. Le résultat a été recontrôlé à la main par une recherche sur les mêmes motifs, et le vrai nom du PC n'apparaît dans aucun fichier.

Le 28/11 au matin, l'outil a reçu les quatre travaux de la nuit et il a été relancé sur les huit. Les fichiers des quatre travaux du 27/11 sortent à l'identique (`git diff` vide sur leurs dossiers). Pour les nouveaux seulement, l'outil écrit « Réussi : oui / non » au lieu de « Passe : true / false » pour un test, et remet les accents dans les noms de lots. Sur les quatre travaux de la nuit, il a fait 6 remplacements, tous dans `traces-du-soir/` : 3 noms de PC (des noms d'exemple écrits dans les consignes et les comptes rendus, pas le vrai nom), 2 chemins temporaires et 1 détail familial. Rien dans les trois autres. Une recherche à la main sur les mêmes motifs ne trouve ni clé, ni jeton, ni adresse e-mail, ni nom de PC réel ; l'assistant de Sacha sur le Ryzen n'est nommé dans aucun des nouveaux fichiers.

Ce LISEZ-MOI a été écrit par un agent Opus le 27/11 au soir, à partir de ces comptes rendus, des bilans des orchestrations, des messages de commit et des journaux de l'évolution en cours. Les sections sur la nuit du 27 au 28/11 (de « La nuit du 27 au 28/11 » à « La leçon de méthode de la nuit ») ont été ajoutées par un autre agent Opus le 28/11 au matin, à partir des mêmes sources : les huit bilans, les quatre scripts et les 31 comptes rendus de la nuit, les messages des commits `b1ff8af89` à `2a3bea3c1`, le `resume.txt` de la branche `evolution-ryzen`, et les LISEZ-MOI des études citées.
