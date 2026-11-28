# Les orchestrations du 27 et du 28 novembre 2026

Ce dossier garde la trace de vingt-deux travaux faits par des équipes d'agents : quatre le 27/11/2026, quatre dans la nuit du 27 au 28/11, et quatorze le 28/11 : huit entre 7 h 20 et 14 h 47, puis six entre 15 h 02 et 17 h 47. Il montre comment le travail a été réparti, ce que les agents ont rendu, ce que leurs relecteurs ont trouvé, et ce qui a encore dû être corrigé après eux.

Pour chaque travail, un sous-dossier contient deux fichiers :

- `script.js` : le script qui a lancé l'équipe, tel qu'il a tourné. On y lit la consigne exacte donnée à chaque agent.
- `comptes-rendus.md` : le compte rendu de chaque agent, dans l'ordre où ils ont été lancés, avec son rôle. Ce sont les mots des agents, remis en texte lisible, sans réécriture.

| dossier | le travail | agents | modèle des agents | durée | jetons | appels d'outils |
|---|---|---|---|---|---|---|
| `construction/` | construire `ml/evolution`, la sélection naturelle des bots | 10 | Opus | 2 h 41 | 2 399 211 | 542 |
| `journal/` | écrire le journal de bord du portfolio | 16 | Opus | 25 min | 2 444 100 | 523 |
| `images/` | tirer cinq images des données et rendre le journal lisible | 20 | Opus | 26 min | 2 463 737 | 547 |
| `finitions/` | finir `ml/evolution` avant de l'installer sur le Ryzen | 7 | Opus | 3 h 18 | 1 993 694 | 568 |
| *sous-total du 27/11* | | *53* | | | *9 300 742* | *2 180* |
| `traces-du-soir/` | ranger le soir du 27/11 dans le journal, la passation et ce dossier | 4 | Opus | 16 min | 782 967 | 260 |
| `reglage/` | étudier le réglage de la sélection, sans jouer de course | 11 | Opus | 2 h 11 | 2 604 327 | 619 |
| `portage/` | faire des idées de la boucle payante des gènes, fixer Node, mesurer le coffre | 9 | Opus | 1 h 26 | 1 819 083 | 542 |
| `changements-surs/` | faire entrer les changements sûrs de l'étude dans la sélection | 7 | Opus | 5 h 03 | 1 986 602 | 597 |
| *sous-total de la nuit* | | *31* | | | *7 192 979* | *2 018* |
| `prochaines-idees/` | relever les idées qui restent à essayer sur le banc des gènes | 11 | Opus | 32 min | 2 432 325 | 451 |
| `traces-du-28/` | ranger la nuit du 27 au 28/11 dans le journal, la passation et ce dossier | 4 | Opus | 17 min | 761 477 | 178 |
| `contrat-v4/` | écrire le contrat des gènes v4, sans coder | 5 | Opus | 42 min | 1 349 564 | 244 |
| `code-v4/` | coder les gènes v4 et le banc des gènes v2 | 8 | Opus | 3 h 38 | 2 490 163 | 681 |
| `lecture-du-banc/` | lire le banc des gènes fini | 3 | Opus | 15 min | 481 454 | 53 |
| `greffes/` | faire essayer des interrupteurs par la sélection elle-même | 2 | Opus | 1 h 59 | 427 841 | 142 |
| `sortie-mesure/` | mesurer les décollages au bord des maps à décor | 2 | Opus | 43 min | 503 584 | 101 |
| `sortie-reecrite/` | réécrire sortieOn après cette mesure | 2 | Opus | 1 h 44 | 495 749 | 165 |
| *sous-total du 28/11, matin et début d'après-midi* | | *37* | | | *8 942 157* | *2 015* |
| `traces-apres-midi/` | ranger les huit travaux du matin dans le journal, la passation et ce dossier | 3 | Opus | 20 min | 728 027 | 198 |
| `avant-le-bord/` | chercher, sans jouer de course, ce que le pilote pourrait faire au sol avant de quitter la route | 10 | 7 Opus, 3 Fable (les concepteurs) | 27 min | 1 744 957 | 213 |
| `avant-le-bord-mesures/` | mesurer en vraies courses ce que l'étude précédente laissait ouvert | 2 | Opus | 48 min | 549 424 | 121 |
| `echelle-de-bots/` | étudier, sans jouer de course, des bots de chaque niveau et des experts | 11 | 8 Opus, 3 Fable (les concepteurs) | 19 min | 1 544 657 | 193 |
| `pieces/` | dire d'où viennent les pièces des joueurs, face au pilote c0025 | 4 | 3 Opus, 1 Fable (le concepteur) | 28 min | 854 686 | 154 |
| `tri-et-debit/` | tester le tri des courses ; écrire un critère de débit pour le banc | 4 | Opus | 57 min | 762 939 | 229 |
| *sous-total du 28/11, fin d'après-midi et soir* | | *34* | | | *6 184 690* | *1 108* |
| **total** | | **155** | | | **31 620 568** | **7 321** |

Les chiffres viennent du bilan que Claude Code écrit à la fin de chaque orchestration (`workflows/<identifiant>.json` : `agentCount`, `durationMs`, `totalTokens`, `totalToolCalls`), relus le 28/11 au matin. Ils redonnent les nombres que la session principale avait en mémoire pour la nuit : 0,78, 2,60, 1,82 et 1,99 million de jetons. Le journal et les images ont tourné pendant que la construction tournait encore ; la nuit, les traces du soir et l'étude du réglage ont démarré à moins de trois minutes d'écart, et l'étude tournait encore quand le portage a commencé. Deux autres orchestrations du 27/11, plus tôt dans l'après-midi (la conception de la sélection naturelle et les enquêtes sur ce qui distingue le bot d'un joueur), ne sont pas rangées ici. Deux autres encore ont démarré le 28/11 au matin et n'étaient pas finies quand ce dossier a été complété (les « prochaines idées », et celle qui a rangé les quatre travaux de la nuit) : elles sont rangées depuis, avec les six travaux suivants du 28/11 (`prochaines-idees/` et `traces-du-28/`). Les huit bilans du 28/11 ont été relus le 28/11 après-midi. Ces huit équipes se chevauchent : les prochaines idées et les traces du 28/11 ont démarré à 4 minutes d'écart ; le code des gènes v4 a tourné de 8 h 39 à 12 h 17, pendant que la lecture du banc, les greffes et la mesure de la sortie démarraient ; les greffes et la mesure de la sortie finissaient quand la réécriture de sortieOn a commencé. L'orchestration qui a rangé ces huit travaux est rangée depuis : c'est `traces-apres-midi/`. Les six bilans de la fin d'après-midi et du soir ont été relus le 28/11 vers 17 h 50. Ces six équipes se chevauchent aussi : les mesures A et C (15 h 53 – 16 h 41) ont tourné pendant toute l'étude de l'échelle de bots (16 h 00 – 16 h 18) et une partie de celle des pièces (16 h 20 – 16 h 47) ; le tri et le débit ont démarré à 16 h 51. Le modèle de chaque agent est écrit dans le bilan (champ `model` de chaque agent) : pour ces six travaux, 7 agents sur 34 ont tourné sur Claude Fable, tous des concepteurs ; ils ont consommé 1 378 487 jetons sur 6 184 690 (22 %). L'orchestration qui range ces six travaux n'a pas encore de bilan : elle n'est pas rangée ici.

---

## Ce qu'est une orchestration

Sur ce chantier, Sacha dirige et ne code pas. Le code et les textes sont écrits par Claude, un modèle de langage d'Anthropic, dans l'outil Claude Code. Le 27/11, le travail est réparti sur deux niveaux.

**La session principale.** C'est la conversation que Sacha a ouverte. Elle tourne avec le modèle Claude Fable. Elle lit l'état du chantier, conçoit le travail, écrit les consignes, décide de l'ordre, puis relit ce qui revient avant de l'enregistrer dans git (git est l'outil qui garde chaque version des fichiers, avec la date et l'auteur de chaque changement). C'est aussi elle qui parle à Sacha.

**Les agents.** Un agent est une autre instance de Claude, ici le modèle Claude Opus. Il est lancé avec une consigne écrite, il travaille seul dans le dépôt : il lit les fichiers, lance des commandes, écrit du code ou du texte. Quand il a fini, il rend un compte rendu sous une forme fixée d'avance : un résumé, la liste des fichiers touchés, les tests passés, les problèmes restants. Il ne voit pas la conversation avec Sacha, seulement sa consigne.

**L'orchestration.** C'est le petit programme (le `script.js` de chaque sous-dossier) que la session principale écrit pour lancer une équipe d'agents. Il dit qui travaille en même temps, qui attend qui, et ce que chacun reçoit des autres. Les quatre scripts du 27/11 suivent tous la même idée : un agent écrit, un autre agent relit. Le relecteur reçoit le compte rendu de celui qu'il relit, avec une consigne du genre « ne le crois pas » : il doit rouvrir les fichiers, refaire les mesures, chercher ce qui casse. Selon les travaux, le relecteur corrige lui-même, ou il relève les défauts et un troisième agent les corrige. Un dernier agent, l'intégrateur, assemble souvent le tout et relance tous les tests.

**Pourquoi travailler ainsi.** Le 27/11, Sacha écrit à la session principale : « gère mieux l'abonnement, tu utilises trop Fable par rapport à Opus » (à 14 h 25, heure universelle, dans le relevé daté de ses messages, tenu hors git). D'après les notes de travail de Claude, l'abonnement a un quota par semaine, plus serré pour Fable que pour les autres modèles. Depuis, la session principale garde pour elle la conception et les décisions, et confie les longues tâches à des agents Opus. Le 28/11 à 13 h 07 (heure de Paris), Sacha écrit qu'elle peut utiliser plus de Fable, seulement là où Fable fait vraiment mieux (sa phrase est citée plus bas, dans « Le 28/11 : ce qui se passe autour des huit équipes »). À partir de l'étude « avant le bord » (15 h 24), les agents **concepteurs**, ceux qui inventent une règle ou une façon de faire, tournent sur Fable ; les lecteurs, les compteurs, les mesureurs, les relecteurs et les rédacteurs restent sur Opus. Les bilans le montrent agent par agent (sections 18, 20 et 21). Une équipe permet aussi de travailler en parallèle : quatre modules écrits en même temps, sept chapitres en même temps. Et la relecture par un agent qui n'a pas écrit le travail trouve des erreurs que l'auteur ne voit plus.

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

## Le 28/11 : ce qui se passe autour des huit équipes

Les huit travaux du 28/11 suivent un fil : relever les idées qui restent, les écrire en gènes éteints à la naissance (les « gènes v4 »), lire le banc des gènes, faire essayer les meilleures pistes par la sélection elle-même. Les faits, d'après git et les fichiers cités :

- **Le banc des gènes est fini et lu.** Il a fini ses 1 250 courses vers 10 h 45 (dernière ligne de son journal, d'après le rédacteur de la section 13). Le résultat est enregistré à 11 h 02 (commit `46842ee77`) : aucun interrupteur ne change le palier ni la note F au seuil corrigé, mais trois rapprochent sûrement le pilote des joueurs (l'écart E passe de 0,882 à 0,707 avec slalomOn, 0,728 avec bordOn, 0,665 avec les cinq gestes ensemble).
- **Le Ryzen n'a pas arrêté.** Ses commits d'une heure à l'autre se suivent sur la branche `evolution-ryzen`, de la génération 0 (1 h et 2 h) à la génération 16 (14 h). D'après la session principale, seul l'envoi horaire vers GitHub a échoué de 2 h à 13 h : sa connexion à Internet a coupé. À 13 h 11, l'assistant de Sacha sur le Ryzen a fait la première mise à jour : la fusion de `bots-ecurie` avec les greffes (commit `98db666ae`, « lance le 28/11 13:11 » dans `resume.txt`). Le `resume.txt` envoyé à 14 h dit : génération 17, nouvelle époque `3c3d44e8bd9b` depuis la génération 16, 495 courses à l'heure, champion = le témoin c0025, aucun sacre. La première greffe est née à la génération 17, comme prévu : l'enfant `2e9b5cc4c924`, le champion recopié avec `raccCartes_ville = 0` (`population.json` et `histoire.md` de la branche). « Mutations comptent-elles ? » : trop tôt pour le dire (109 enfants mesurés sur 191 ; tau 0,45, intervalle de 0,00 à 0,77).
- **Une consigne de Sacha.** À 12 h 07, heure universelle (13 h 07 à Paris), il écrit, tel quel : « tu utilise plus de opus de sonnet haiku que fable on est a 34% contre 22, tu peux utiliser plus de fable si tu as besoin, c'est pas forcer fait le seulement si y'a des tache que fable peut vraiment faire mieu » (conversation de la session principale, tenue hors git ; ce que mesurent les 34 % et les 22 % n'y est pas dit). Les bilans des huit travaux le montrent : leurs 37 agents ont tous tourné sur Claude Opus. Aucun n'a tourné sur Fable. Les huit avaient tous démarré avant ce message (le dernier, la réécriture de sortieOn, à 13 h 03, heure de Paris).
- **Après les huit équipes**, la session principale a fusionné le lot « gènes v4 » dans `bots-ecurie` à 14 h 59 (commit `77083d123`), puis écrit la vague 1 du banc v2 avant de la jouer (commit `15c7f1cb3`, 15 h 01). Ces deux pas ne sont pas des orchestrations : ils sont racontés à la fin de la section 16.

Les décisions de cap restent celles de Sacha (la sélection naturelle sur le Ryzen). Le choix des idées, des lots, des consignes et des règles de gène est celui de Claude.

---

## 9. Les prochaines idées pour le banc (28/11, 7 h 20 – 7 h 53)

**Le but.** Avant d'écrire de nouveaux gènes, relever dans ce qui est déjà écrit (études, journaux de la boucle payante, code) les changements de structure qui restent à essayer, et dire lesquels le banc peut mesurer. Aucune course. Le résultat est dans `ml/ecurie/etude/prochaines-idees/LISEZ-MOI.md`.

**L'équipe : 11 agents.** Six **lecteurs** en même temps, un par famille de sources (les morts, la ressemblance aux joueurs, le vol et les yeux, les défauts confirmés, la boucle payante, le génome et les réseaux de neurones). Le script dit qu'ils ont rendu 31 candidats. Un **classeur** les fusionne en 12 idées pour la liste courte et 14 pour la liste longue. Trois **relecteurs** les attaquent en même temps : les chiffres à la source, la faisabilité dans le code, la mesure sur le banc. Un **correcteur** reprend le dossier.

**Ce que les relecteurs ont trouvé : 36 défauts** (4 bloquants, 22 sérieux, 10 mineurs). Le plus net : l'idée classée première, freiner au canyon, reposait sur des chiffres mesurés sur l'ancien pilote, et la source la plus récente sur le pilote actuel dit de ne pas chercher le gain au canyon. Le relecteur du code a vu que ce frein ne partirait presque jamais (le jeu change le frein en dérapage dès que le volant dépasse 0,35), et qu'une idée, la loi fidèle, existait déjà dans le code. Le relecteur de la mesure a recalculé le hasard : même quand une idée change toutes les courses, le banc ne voit un effet qu'à partir d'environ 1 palier, à 96 graines. Le correcteur a fait descendre le frein du n° 1 au n° 4, retiré la seconde chance (elle gagne au banc par construction : c'est une décision pour Sacha) et refait toutes les lignes citées d'`ETAPES.md`, décalées de 68.

**Ce que la session principale a fait après.** Elle a enregistré le dossier à 7 h 53 (commit `ddca156d8`), une minute après la fin. Son message ne signale aucune correction de sa part. Les idées retenues sont devenues le contrat de la section 11.

---

## 10. Les traces du 28/11 au matin (7 h 24 – 7 h 42)

**Le but.** Ranger la nuit du 27 au 28/11 : un chapitre du journal de bord, les traces des quatre équipes de la nuit (les sections 5 à 8 ci-dessus), le sommaire, le lexique et la passation.

**L'équipe : 4 agents.** Deux **rédacteurs** en même temps (le chapitre, les traces), un **vérificateur** du chapitre, puis un **raccordeur** pour le sommaire, le lexique, `ETAPES.md` et `PASSATION.md`.

**Ce que le vérificateur a trouvé.** Il a corrigé le chapitre en place. L'erreur de fait la plus nette : le chapitre disait que l'agent de la mesure du coffre s'était arrêté à 10 graines ; il s'est arrêté après 4, et c'est son relecteur qui a joué les 6 de plus. Il a aussi remplacé « son assistant sur le Ryzen » par « l'assistant de Sacha sur le Ryzen », ajouté au résumé du chapitre une phrase d'impasse sans l'adoucir (les 21,61 EUR de la boucle payante n'ont pas acheté un meilleur pilote), et remplacé une comparaison qui n'avait pas de source exacte. Le rédacteur des traces signale un point qu'il n'avait pas le droit de corriger : un fichier déjà rangé nomme une école.

**Ce que la session principale a fait après.** Elle a enregistré le tout à 7 h 42 (commit `44d048fc4`, qui annonce « onze corrections » du vérificateur). Aucune correction de sa part n'est signalée.

---

## 11. Le contrat des gènes v4 (7 h 55 – 8 h 37)

**Le but.** Écrire, avant tout code, le contrat d'un seul lot : quatre idées de la section 9 en gènes éteints à la naissance, des compteurs qui disent combien de fois chaque gène a agi, des courses où la carte est imposée, et un banc des gènes v2 qui s'arrête dès que le résultat est net. Le contrat est `ml/evolution/notes/genes-v4.md`. La consigne donne la décision de la session principale : un seul lot, une seule nouvelle époque.

**L'équipe : 5 agents.** Un **architecte** écrit le contrat sans coder. Trois **relecteurs** l'attaquent en même temps : le pilote « éteint » doit rejouer l'ancien au bit près ; chaque gène doit faire ce qu'il dit dans le code ; le banc et la sélection. Puis l'architecte **reprend** son contrat.

**Ce que les relecteurs ont trouvé : 37 défauts** (1 bloquant, 14 sérieux, 22 mineurs). Le bloquant : le contrat proposait de juger un bras du banc sur son compteur de déclenchements. Or le témoin n'a jamais le gène allumé, son compteur vaut toujours zéro : la différence ne peut pencher que d'un côté, par construction. C'est le même piège qui avait sorti la seconde chance du banc à la section 9. L'architecte dit avoir corrigé les 37, dont un en partie seulement (les noms courts des compteurs).

**Ce que la session principale a fait après.** Le contrat n'a pas été enregistré à part : il est entré dans le commit du lot (section 12). Aucun compte rendu de cette équipe ne dit que la règle de « la sortie préparée » ne se déclencherait jamais : ce sont des courses qui l'ont montré (sections 12 et 15).

---

## 12. Le code des gènes v4 (8 h 39 – 12 h 17)

**Le but.** Coder le contrat dans une copie à part du dépôt, sur la branche `genes-v4`, pendant que le banc des gènes finissait ses courses sur le Xeon. Le détail est dans `ml/evolution/notes/LIVRAISON-GENES-V4.md`.

**L'équipe : 8 agents.** Trois lots en même temps : le lot (a) en deux temps (le génome v:4 et les règles des gènes, puis les compteurs), le lot (b) (les compteurs et la carte imposée du côté des courses), le lot (c) (le banc v2). Puis trois **relecteurs** qui corrigent eux-mêmes, et un **intégrateur**.

**Ce que les relecteurs ont trouvé.**

- **Au bit près : rien.** Le relecteur a rejoué 4 050 vues de quatre vraies courses à l'ancien et au nouveau pilote : toutes les décisions sont égales, et les identifiants des pilotes ne changent pas (c0025, c0101, les 26 génomes du Ryzen).
- **Un gène qui ne tenait pas sa promesse.** Pour le relecteur « sémantique », la règle « rien » devait voir la même chose deux vues de suite ; dans un cas, une seule suffisait. Corrigé.
- **Un gène qui ne part jamais.** Le même relecteur a joué des courses gène par gène : la sortie préparée (sortieOn) ne s'est déclenchée dans aucune des cinq. Ce n'est pas une faute de code : c'est la règle du contrat. Il écrit que la décision revient à la session principale.
- **Le banc.** Avec une seule graine mesurable, un bras pouvait s'arrêter « net » sur une seule course. Corrigé. Le relecteur a vérifié le taux de faux résultats nets sur 1 500 vagues tirées des vraies courses : 4,67 %, pour 4,9 % attendus.

L'intégrateur a retiré un nom de PC du contrat, corrigé un test qui échouait à cause des fins de ligne de Windows (défaut plus ancien que le lot), et relancé tous les tests, lents compris : 24 suites rapides, identité 9/9, `evoluer.test` (78 contrôles, 2 720 secondes), `courses.test` 9/9. Il a fait le commit `7f85efb38` à 12 h 16, sur `genes-v4` seulement. Trois des huit comptes rendus sont en anglais, au moins en partie.

**Ce que la session principale a fait après.** Elle n'a pas fusionné tout de suite. Elle a d'abord fait mesurer pourquoi sortieOn ne partait jamais (section 15).

---

## 13. La lecture du banc des gènes (10 h 47 – 11 h 02)

**Le but.** Le banc venait de finir. Lire ce qu'il dit, sans rejouer de course : bras par bras, le palier, et de quels morceaux est fait l'écart aux joueurs E.

**L'équipe : 3 agents.** Un **analyste** écrit l'outil `composantes.js`, un **relecteur** refait les calculs avec ses propres scripts, un **rédacteur** écrit le résultat dans le LISEZ-MOI de l'étude, le journal et la passation.

**Ce que le relecteur a trouvé.** Aucune erreur de calcul : il retrouve les mêmes paliers et les mêmes E. Il a vérifié que le gain de E ne vient ni de la survie ni du choix des courses. Mais il a refusé ou affaibli des chiffres et des conclusions, et le rédacteur les a laissés de côté : un seuil de comparaisons, « ne font pas mourir plus tôt » (devenu « aucun effet visible sur la survie »), et l'effet d'un interrupteur sur E (devenu « aucun effet sûr »). Le rédacteur a aussi relevé une phrase fausse de l'analyste : avec slalomOn, l'aller du slalom n'est plus le premier morceau de E.

**Ce que la session principale a fait après.** Elle a enregistré le tout à 11 h 02 (commit `46842ee77`). D'après son message, le relecteur a affaibli six phrases. Sa décision : rien n'est allumé à la naissance ; cinq bras passent en vague de confirmation sur des graines neuves.

---

## 14. Les greffes de la sélection (11 h 04 – 13 h 03)

**Le but.** Que la sélection essaie elle-même les interrupteurs que le banc a fait ressortir. À la place de l'immigré (le pilote né au hasard de chaque génération), selon un cycle, elle fait naître une « greffe » : le champion du moment recopié, avec seulement quelques interrupteurs forcés. La note est `ml/evolution/notes/greffes.md`.

**L'équipe : 2 agents.** Un **auteur**, puis un **relecteur** qui doit prouver qu'au bit près rien ne change sans greffe, essayer en vraies courses et corriger sur place.

**Ce que le relecteur a trouvé.** L'auteur disait que les greffes marchaient comme prévu, mais aucune vraie génération n'avait tourné avec des greffes. Le relecteur en a fait tourner. Au troisième essai, après un arrêt en pleine génération puis une relance, le journal avait perdu la ligne qui dit qu'une greffe est née. Corrigé, avec deux contrôles de plus au test (70 au lieu de 68). Il a aussi corrigé une phrase du récit, fausse dans un cas. Sa preuve : sans greffe, trois générations et 56 vraies courses donnent les mêmes populations, les mêmes journaux et les mêmes pilotes qu'avec l'ancien code.

**Ce que la session principale a fait après.** Elle a écrit le cycle des greffes dans `config.json` (cinq ensembles, dont `raccCartes_ville = 0`, parce que les raccourcis voulus tuent en ville) et enregistré le tout à 13 h 05 (commit `5e7f311aa`). C'est ce commit que l'assistant de Sacha sur le Ryzen a installé à 13 h 11, et la première greffe y est née à la génération 17.

---

## 15. La mesure de la sortie préparée (12 h 19 – 13 h 02)

**Le but.** Comprendre pourquoi sortieOn ne part jamais (section 12) : mesurer, sur les maps à décor, ce que le pilote voit et fait aux décollages par le bord. Dans la copie `genes-v4`. L'étude est `ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md`.

**L'équipe : 2 agents.** Un **mesureur** (un pilote de diagnostic, 40 courses à carte imposée), puis un **relecteur** qui refait les calculs par un autre chemin et propose une règle chiffrée.

**Ce que le relecteur a trouvé.** Trois courses étaient comptées deux fois : il reste 180 décollages subis distincts et 24 morts, et non 185 et 27. Une mort était attribuée aux rayons du mauvais décollage, une médiane était fausse (0,26 s et non 0,55 s), et un chiffre du mesureur comptait des vues au lieu de déclenchements. Le fond tient : sur les 24 décollages mortels, les yeux ne voient aucune issue ; le bord est annoncé 0,28 s avant le décollage, pour une main qui met 0,2 s à obéir ; partir en « plane » au bord se serait écrasé dans 57 vols qui se sont posés. Sa recommandation : écrire l'impasse et laisser sortieOn éteint. Le levier est au sol, avant le bord.

**Ce que la session principale a fait après.** **C'est l'impasse du jour.** La sortie préparée par les rayons du bord ne peut rien sauver. La session principale ne suit pourtant pas la recommandation à la lettre : elle fait réécrire sortieOn en « la nitro au décollage sur les maps à décor », le pendant de bordOn. L'étude en donne la raison : sur ces maps, le pilote ne décolle jamais nitro allumée (0 sur 253), quand les joueurs le font environ 63 fois sur 100. Ce que cela fait au palier n'est pas mesuré : seul le banc le dira.

---

## 16. sortieOn réécrit (13 h 03 – 14 h 47)

**Le but.** Appliquer cette décision dans la copie `genes-v4` : la règle, le contrat, les tests, les notes et l'étude, puis un commit.

**L'équipe : 2 agents.** Un **auteur**, puis un agent qui est à la fois **relecteur et intégrateur** : il vérifie l'identité, joue de vraies courses, relance les tests lents et fait le commit.

**Ce que le relecteur a trouvé.** Aucun défaut dans le code, tous dans les textes. Le contrat décrivait encore « la sortie préparée » dans ses mots simples. L'étude ne disait pas que la décision s'écarte de la proposition de son relecteur : il a ajouté pourquoi, et d'où vient le « 0 sur 253 ». La note de livraison disait « un seul commit » et donnait une époque périmée. D'après le message du commit `d30db9519` (14 h 46), éteint, le pilote décide comme avant sur 4 050 vues de vraies courses, et allumé, il a joué 8 vraies courses de 120 secondes sans erreur ; `courses.test` n'a pas été relancé.

**Ce que la session principale a fait après** (commits `77083d123` à 14 h 59 et `15c7f1cb3` à 15 h 01). Elle a fusionné le lot dans `bots-ecurie`, sans conflit avec les greffes. Elle a porté le cycle des greffes à 10 ensembles, dont cinq qui allument des gènes v4, soit un cycle de 11 générations. Elle a corrigé un contrôle périmé du test des greffes (71/71). 24 suites rapides et le test du banc passent sur l'arbre fusionné ; `identite.test`, `evoluer.test` et `courses.test` étaient encore en cours quand cette section a été écrite. Puis elle a écrit la vague 1 du banc v2 et l'a enregistrée **avant** de la jouer : cinq bras (bord, slalom, bord + slalom, suit, fuir vite) contre le témoin c0025, sur des graines neuves. Ainsi, le critère ne peut plus être choisi après avoir vu les résultats. La vague tourne sur le Xeon ; elle n'a encore aucun résultat.

**Ce qui attend, le 28/11 à 15 h** (d'après la session principale) : la deuxième mise à jour du Ryzen, avec le lot v4, n'est pas faite. Elle fait passer les génomes en v:4, sans retour possible : il faudra d'abord copier `etat\` et `champions\`. Trois questions restent à Sacha : le seuil de la seconde chance (`chancePalierMin`, 12 aujourd'hui), la décision D1 (`seuilB` / `seuilC`), et l'emploi des crédits d'API qui restent.

---

## La fin d'après-midi et le soir du 28/11 : ce qui se passe autour des six équipes

Les six travaux suivants ne codent rien dans le pilote. Quatre sont des études : on lit d'abord ce qui est déjà enregistré, on propose, on attaque, et on ne joue des courses que pour trancher une question écrite avant. Les faits, d'après git et les fichiers cités :

- **Les tests longs et l'envoi.** D'après la session principale, les trois tests longs sont passés sur l'arbre fusionné (`identite.test` 9/9, `evoluer.test` en entier, `courses.test` 11/11). Leur sortie n'est gardée dans aucun fichier du dépôt ; la passation du soir les donne passés, sur la même parole. Ce qui se vérifie : la branche `bots-ecurie` est sur GitHub au même commit que la copie de travail (`9cc87f48e`, 17 h 48), lot v4 compris.
- **Le Ryzen n'a pas reçu le lot v4.** La mise à jour n° 2 a été donnée à Sacha ; elle n'est pas faite. Le `resume.txt` envoyé à 17 h 00 (commit `6fa83427d` de la branche `evolution-ryzen`, lu à 17 h 50) dit : génération 21, toujours l'époque `3c3d44e8bd9b` depuis la génération 16, « lance le 28/11 13:11 », 413 courses à l'heure, champion = le témoin, aucun sacre.
- **La vague 1 du banc tourne sur le Xeon.** Son `resume.txt` (écrit à 17 h 53, relu vers 18 h) dit : point 3 sur 8 fait, 72 graines jouées ; trois bras se sont arrêtés, « rien de net » (bord + slalom et fuir vite au 2e point, suit au 3e) ; deux jouent encore (bord, slalom). Il ne donne volontairement aucun chiffre tant qu'un bras joue, et ce dossier n'en donne pas non plus.
- **Le moment important de la journée : Sacha redit le but.** L'étude « avant le bord » lui laisse une question : sur les maps à décor, un bot doit-il mourir comme un joueur, ou moins ? Il répond, tel quel : « bah oui il doit mourir comme un joueur mais il faut aussi des pilote expert qui ne peuvent pas perdre du tout au palier moteur 30 il faut differnt niveau de bot qui permetent un match makin adapté au niveau de chaque joueur » (`ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md` § 9.6 ; le script de l'échelle de bots, lancé à 16 h 00, la cite déjà). Il n'y a donc pas un champion à trouver, mais deux familles : une échelle de bots de chaque niveau, qui conduisent et meurent comme des joueurs, pour un matchmaking ; et des experts qui ne perdent pas au palier moteur 30. Les sections 19 à 22 partent de là.
- **Les questions laissées à Sacha le soir.** Trois nouvelles, posées par l'étude de l'échelle (§ 9) et le test du tri : ce que veut dire « ne pas perdre du tout » ; des fantômes (des courses enregistrées, rejouées) ou des bots qui conduisent en direct ; faire enregistrer des parties à d'autres joueurs, débutants compris, avec l'enregistreur qui existe déjà dans le jeu. Les trois d'avant restent : la seconde chance, la décision D1, les crédits d'API.

---

## 17. Les traces de l'après-midi du 28/11 (15 h 02 – 15 h 22)

**Le but.** Ranger les huit travaux du matin : les sections 9 à 16 de ce dossier, un chapitre de plus au journal de bord (`2026-11-28_suite.md`) et la passation.

**L'équipe : 3 agents, tous sur Opus.** Deux **rédacteurs** en même temps (ce dossier ; le journal et la passation), puis un **relecteur** qui cherche les erreurs et les détails privés, corrige et fait le commit.

**Ce que le relecteur a trouvé.** Sept défauts. Le plus grave touche la vie privée : l'outil gardait l'empreinte SHA-256 du nom de l'assistant de Sacha sur le Ryzen, et un prénom se retrouve en quelques secondes à partir de son empreinte. Il l'a retirée ; l'outil lit maintenant ce nom dans un fichier local que git ignore (voir « Comment ce dossier est fait »). Il a aussi corrigé une interprétation : le texte lisait « 34 % contre 22 » comme l'usage de l'abonnement par modèle, ce que Sacha ne dit pas ; la phrase est maintenant citée entière. Et une erreur de fond dans le journal : une greffe n'allume pas toujours un seul interrupteur (la première éteint les raccourcis de la ville).

**Ce que la session principale a fait après.** Le relecteur a fait lui-même le commit `332a12a67` (15 h 22). Aucune correction de la session principale n'est signalée.

---

## 18. L'étude « avant le bord » (15 h 24 – 15 h 51)

**Le but.** La mesure de la section 15 avait montré qu'au bord, il est trop tard. Chercher, dans les 40 courses déjà enregistrées, ce que le pilote pourrait faire **au sol, avant le bord**, sans jouer de course. Le résultat est `ml/ecurie/etude/avant-le-bord/LISEZ-MOI.md`.

**L'équipe : 10 agents, dont 3 sur Fable.** Trois **lecteurs** sur Opus (les traces, le code, les joueurs et la ville) ; trois **concepteurs** sur Fable, chacun propose une règle (vitesse, ligne, libre) ; trois **relecteurs** sur Opus (les chiffres, le code, le banc) ; un **rédacteur** sur Opus.

**Ce que disent les lectures.** Toutes les sorties de route se font par le côté, aucune par un trou. Environ 17 morts sur 22 étaient évitables au sens des yeux : la route tenait encore entre 0,6 et 3 s avant. Les joueurs vont plus vite que le pilote, partent nitro allumée environ 5 fois plus souvent, et ne meurent pas plus par minute sur décor (§ 4 de l'étude ; 12 morts de joueurs seulement).

**Les trois règles proposées.** `plafOn` : couper la nitro au-dessus d'une vitesse. `gardeOn` : une garde au bord. `ouvertOn` : en ville, ne sortir exprès de la route que du côté ouvert.

**Ce que les relecteurs ont fait tomber** (§ 6 de l'étude). « Le palier ne compte pas » est faux. Aucun signe trouvé en fouillant ne bat le hasard ; seule la vitesse, nommée d'avance, tient, et on ne sait pas la séparer du palier (p = 0,07). Le p = 0,018 de `ouvertOn` vaut plutôt 0,2, parce qu'au moins six découpages avaient été regardés. La condition de `gardeOn` s'allume presque aussi souvent avant un décollage qui se pose qu'avant une mort. Les trois relecteurs disent la même chose : aucun code avant d'avoir mesuré.

**Ce que la session principale a fait après** (§ 9 de l'étude, commit `6a95e0693` à 15 h 52). Aucun gène écrit. `gardeOn` est abandonné. Deux mesures sont lancées tout de suite (section 19). La question de la mort sur décor est posée à Sacha : c'est elle qui a amené sa réponse.

---

## 19. Les mesures A et C (15 h 53 – 16 h 41)

**Le but.** Trancher en vraies courses ce que l'étude laissait ouvert. Mesure A : rejouer les 40 courses en gardant cette fois le volant, le virage et la vitesse du jeu. Mesure C : 16 courses de ville sur des graines neuves, avec la prédiction écrite **avant** de jouer : « au moins trois fois plus de morts du côté bordé ». Le résultat est le § 11 de la même étude.

**L'équipe : 2 agents, sur Opus.** Un **mesureur** joue 60 courses (les 40 rejouées, 4 courses de preuve sans diagnostic, 16 neuves). Un **relecteur** refait tous les comptes avec son propre code, sans celui du mesureur, puis écrit.

**Ce que le relecteur a trouvé.** La preuve tient, plus fort que le mesureur ne le disait : les 40 courses rejouées sont identiques à celles d'avant, 40 014 vues une par une. Mais une phrase du mesureur tombe : « le signal de vitesse vient du palier » n'est pas montré ; à temps de course égal, c'est le palier qui ne sépare plus. Une formule d'accélération était fausse (sans effet sur la conclusion), et une vitesse citée pour une course aussi. Deux pistes trouvées en fouillant (le pouvoir VITESSE, le balancement de la caisse) ne sont pas prouvées : le hasard en fait autant 4 à 6 fois sur 100.

**Le résultat.** La prédiction de la ville est **réfutée** : 8 morts sur 34 sorties bordées, 5 sur 23 ouvertes. La caisse ne dépasse presque jamais la vitesse sûre du virage (39 vues sur 24 952 ; 1 mort sur 23). Ni le volant, ni le frein possible ne séparent les morts des décollages posés. Le palier monte avec les pièces ramassées, pas avec le temps (lu dans le code du jeu).

**Ce que la session principale a fait après** (§ 9.7, commit `4c266e0f6` à 16 h 42). `ouvertOn` et `plafOn` sont abandonnés à leur tour. **Les trois règles de l'étude sont mortes avant d'avoir été codées**, pour environ une heure de calcul. C'est l'inverse de la sortie préparée (sections 11 à 15), écrite, relue, codée, puis trouvée muette : mesurer d'abord a coûté moins cher.

---

## 20. L'échelle de bots (16 h 00 – 16 h 18)

**Le but.** Répondre au but redit par Sacha : comment fabriquer des bots de chaque niveau, et des experts ? Sans jouer de course. Le résultat est `ml/ecurie/etude/echelle-de-bots/LISEZ-MOI.md`.

**L'équipe : 11 agents, dont 3 sur Fable.** Quatre **lecteurs** sur Opus (les parties des joueurs, le palier, la sélection, ce qui existe déjà) ; trois **concepteurs** sur Fable, un par voie : des niches (une étagère de cases de niveau), un handicap (un bon pilote, ralenti par une molette), une banque de courses triées par palier d'arrivée ; trois **relecteurs** sur Opus (les chiffres, le code, le but) ; un **rédacteur** sur Opus.

**Ce que disent les lectures.** On n'a que 14 parties de 2 joueurs habitués, aucun débutant. Chez eux, une partie faible est une partie qui meurt tôt : à la même minute, tout le monde roule pareil. Le palier du pilote c0025 est borné par la mort, pas par le temps de course. Et il ramasse moitié moins de pièces par minute que les joueurs (227 contre 416).

**Ce que les relecteurs ont fait tomber** (§ 7 de l'étude). Tout niveau au-dessus du palier 21 repose sur deux parties rattrapées par une seconde chance. Un réglage du jeu que le concepteur des niches disait « figé » ne l'est pas. La voie des niches « se réfute elle-même » : elle ne livre rien avant qu'un bouton « niveau » existe, et ce bouton, c'est le handicap. La prédiction du handicap était fausse et a été corrigée avant de jouer (41 à 62 s de survie, au lieu de 60 à 72). Surtout : **aucune des trois voies ne fabrique l'expert du palier 30**, et les trois le disent. Il faudrait 50 à 200 fois moins de morts par minute qu'aujourd'hui, et on ne sait pas si le jeu le permet.

**Ce que la session principale a fait après** (§ 11, commit `fb7c0da18` à 16 h 19). Ne pas toucher à la sélection du Ryzen. Mesurer d'abord d'où viennent les pièces des joueurs (section 21). Faire le bas de l'échelle par le tri des courses (section 22), essayer le handicap ensuite, ne pas construire les niches. Pour les experts, rien n'est promis. Trois questions sont posées à Sacha.

---

## 21. D'où viennent les pièces des joueurs (16 h 20 – 16 h 47)

**Le but.** Le pilote meurt à peu près aussi tôt que les joueurs, mais ramasse moitié moins. Or le palier, ce sont les pièces. Dire d'où vient l'écart, sans jouer de course. Le résultat est `ml/ecurie/etude/echelle-de-bots/pieces/LISEZ-MOI.md`.

**L'équipe : 4 agents, dont 1 sur Fable.** Deux **compteurs** sur Opus (les 14 parties des joueurs ; 20 parties du pilote c0025), découpés par la même fonction ; un **concepteur des leviers** sur Fable ; un **relecteur** sur Opus, qui refait les comptes et écrit.

**Le résultat.** 437 contre 248 pièces par minute, soit 1,76 fois plus chez les joueurs (intervalle de 1,46 à 2,06). L'écart tient à durée égale et à palier égal, et il grandit sans les secondes chances. La recette est la même (environ 80 % de pièces sur la route, 10 % en l'air, 10 % de figures) : le manque est dans le volume.

**Ce que le relecteur a fait tomber.** « Le pilote ramasse comme un joueur par kilomètre » : faux, les kilomètres en vol étaient comptés, et rien ne se ramasse au sol en vol. Par kilomètre roulé au sol, les joueurs prennent 56 pièces, le pilote 41. Le concepteur donnait environ 30 % de l'écart aux raccourcis ; le relecteur le ramène à environ 15 %.

**Ce que la session principale a fait après** (commit `cae540270` à 16 h 49). Aucune règle nouvelle : les gènes qui servent existent déjà. Le banc des gènes recevra un critère de débit (les pièces par minute de survie). La vague 2, après la vague 1, mesurera cinq réglages. Le cycle des greffes reçoit quatre ensembles de plus : 14 ensembles, un cycle de 15 générations, `greffes.test` 71/71.

---

## 22. Le tri des courses et le critère de débit (16 h 51 – 17 h 47)

**Le but.** Deux travaux en parallèle, sur Opus tous les quatre. **Le tri** : une course du pilote qui meurt tôt passe-t-elle pour une partie de joueur ? Si oui, des courses déjà jouées, rangées par palier d'arrivée, feraient le bas de l'échelle sans fabriquer d'autre pilote. La règle est écrite avant de jouer : si le juge (un programme qui apprend à distinguer joueurs et bot) les distingue à 0,75 ou moins, le tri vaut ; à 0,90 ou plus, l'idée est morte. Le résultat est `ml/ecurie/etude/echelle-de-bots/tri/LISEZ-MOI.md`. **Le débit** : écrire dans le banc des gènes le critère demandé par la section 21.

**L'équipe : 4 agents.** Pour le tri, un **mesureur** puis un **relecteur**. Pour le débit, un **auteur** puis un **relecteur**.

**Un agent n'a rien rendu.** Le mesureur du tri a écrit la prédiction, les outils et joué les 40 courses, mais son compte rendu tient en une phrase : « I'm waiting for the courses to finish ». Il n'a donc rien affirmé sur les résultats. **Tous les chiffres du tri sont ceux du relecteur**, refaits avec ses propres scripts.

**Ce que le relecteur du tri a trouvé.** La prédiction a bien été écrite avant (seule la date du disque le montre : le fichier n'a été commité qu'après les résultats, avec l'étude). Les 40 courses rejouées sont identiques à celles du banc, 40 sur 40. Le juge rend 0,904 à temps égal : à la lettre, « l'idée est morte ». Mais **le même juge sépare les deux joueurs entre eux à 0,93** (Sacha au clavier contre Léo au doigt). Selon la règle, un vrai joueur serait « mort » lui aussi. Et le verdict change de case quand on change un peu la fenêtre ou la tranche de paliers. Deux affirmations du mesureur tombent aussi : un fichier de vérification qu'il citait n'existe pas, et deux lots qu'il disait joués sur deux versions du jeu le sont sur la même.

**C'est une impasse de méthode, dite telle quelle.** La session principale déclare le test **nul** : l'instrument ne passe pas son témoin. L'erreur est dans la prédiction, pas dans les courses : son seuil n'avait pas été calibré sur un humain contre un autre humain. C'est à faire désormais avant tout test de ce genre. Ce qui reste établi : le tri ne change pas le pilote (courses mortes tôt contre courses ordinaires : 0,513, le hasard). La ressemblance se gagne donc sur le pilote. Ce qui le trahit à temps égal : il ondule plus, vole moins haut et moins souvent, tient moins la nitro. Pour un vrai juge, il faut d'autres joueurs : c'est demandé à Sacha.

**Ce que le relecteur du débit a trouvé.** Aucun défaut de code, trois dans la notice : la garde de survie à 15 s laissait passer un bras qui ramasse moins en tout (il propose 10 s, chiffré) ; une deuxième empreinte, celle de la note, change aussi ; un écart-type de survie arrondi (« 80 à 95 s » au lieu de 79 à 95). Il a mesuré ce que le critère voit sur les 1 250 courses du banc d'étude : le slalom, qui rapprochait des joueurs sur la note E, coûte environ 28 pièces par minute (z −4,5, 92 graines lues sur 96).

**Ce que la session principale a fait après** (commit `9cc87f48e` à 17 h 48, pour le tri). Le critère de débit est écrit sur une branche à part, `banc-debit`, dans une autre copie du dépôt (commits `b0fed8858` à 17 h 05, puis `b1326cf98` à 17 h 13). Il est **prêt, à fusionner après la vague 1**, comme la décision de la section 21 le prévoyait (« écrit sur une branche à part pendant que la vague 1 tourne, et fusionné après elle »). À l'heure où ces lignes sont écrites, il n'est pas fusionné.

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

Ajouté le 28/11 après-midi, avec les huit travaux du 28/11 :

- **Une règle relue par plusieurs agents peut ne jamais servir.** La sortie préparée a été écrite par un architecte, attaquée par trois relecteurs (37 défauts corrigés), codée, puis relue par trois autres. Ce sont de vraies courses qui ont montré qu'elle ne partait jamais, et la mesure qui a suivi en a fait une impasse.
- **Un classement peut reposer sur le mauvais pilote.** L'idée classée première à la section 9 venait de chiffres mesurés sur l'ancien pilote. C'est le relecteur des chiffres qui l'a vu, en rouvrant les sources.
- **Un relecteur trouve ce que l'auteur n'a pas essayé.** Le défaut des greffes n'apparaît qu'après un arrêt en pleine génération, en vraies courses : l'auteur n'en avait fait tourner aucune.
- **Une décision peut s'écarter de la recommandation.** Le relecteur de la mesure proposait de laisser sortieOn éteint ; la session principale l'a réécrit en autre chose. L'étude le dit, avec sa raison, et ce que cela vaut n'est pas mesuré.
- **La langue n'est toujours pas fixée.** Trois des 37 comptes rendus du 28/11 sont en anglais, au moins en partie, tous dans l'équipe du code des gènes v4.
- **Des tests tournaient encore.** Sur l'arbre fusionné, `identite.test`, `evoluer.test` et `courses.test` n'avaient pas fini quand ce dossier a été complété, et le lot v4 n'a pas encore tourné sur le Ryzen.

Ajouté le 28/11 au soir, avec les six travaux de la fin d'après-midi et du soir :

- **Un agent peut ne rien rendre.** Le mesureur du tri a fait son travail (la prédiction, les outils, les 40 courses), mais son compte rendu se réduit à « I'm waiting for the courses to finish ». Rien ne l'a relancé. Ce qu'il pensait de ses résultats n'est écrit nulle part ; seul le relecteur, venu après, les a lus et chiffrés. Sans relecteur, ce travail n'aurait laissé aucun résultat contrôlé. C'est le même défaut que l'agent de la mesure du coffre, la nuit : un agent ne sait pas attendre une longue mesure.
- **Une règle écrite avant de jouer peut être fausse elle-même.** Écrire la prédiction avant les courses empêche de choisir le critère après avoir vu les résultats. Cela ne garantit pas que le seuil a un sens. Celui du tri (0,90) n'avait pas été essayé sur deux humains ; quand le relecteur l'a fait, un vrai joueur tombait du mauvais côté. Le test est déclaré nul.
- **Mesurer avant de coder a ses limites aussi.** Trois règles sont mortes avant d'être codées (section 19), pour environ une heure de calcul. Mais elles ont été jugées sur 16 à 40 courses, et deux pistes trouvées en fouillant (le pouvoir VITESSE, le balancement) ne sont pas prouvées, et ne sont pas poursuivies : on ne sait pas si elles comptent.
- **Un modèle plus fort ne remplace pas le relecteur.** Les concepteurs des trois études tournaient sur Fable. Leurs relecteurs, sur Opus, ont quand même fait tomber des chiffres : la fourchette de `plafOn` ne valait pas carte par carte, le p de `ouvertOn` était environ dix fois trop beau, un réglage dit « figé » ne l'était pas, la part des raccourcis était deux fois trop grande. Le bilan ne permet pas de dire si Fable s'est trompé moins souvent qu'Opus ne l'aurait fait : personne n'a fait la même conception sur les deux.
- **Le but du chantier ne vient pas des agents.** Aucune des trois conceptions de l'échelle de bots ne fabrique l'expert du palier 30 que Sacha demande. Les agents le disent, et la session principale ne promet rien ; mais la question reste entière.

---

## Comment ce dossier est fait

Les traces des orchestrations restent hors de git, dans le dossier de Claude Code, et s'effacent au bout d'un temps. Les deux fichiers de chaque sous-dossier sont sortis de l'outil `ml/ecurie/portfolio/outils/orchestration.js` :

```
node ml/ecurie/portfolio/outils/orchestration.js <dossier de la session Claude Code>
```

L'outil nettoie tout ce qu'il écrit, parce que le dépôt est public. Le 27/11 à 23 h 18, il a fait 16 remplacements : 10 chemins vers le dossier temporaire de Claude Code raccourcis en « <dossier temporaire> », 5 détails de famille retirés, et 1 nom de PC remplacé par « le-xeon » (c'était un nom d'exemple écrit par un relecteur, pas le vrai nom du PC). Il n'a trouvé ni clé, ni jeton, ni adresse e-mail. Le résultat a été recontrôlé à la main par une recherche sur les mêmes motifs, et le vrai nom du PC n'apparaît dans aucun fichier.

Le 28/11 au matin, l'outil a reçu les quatre travaux de la nuit et il a été relancé sur les huit. Les fichiers des quatre travaux du 27/11 sortent à l'identique (`git diff` vide sur leurs dossiers). Pour les nouveaux seulement, l'outil écrit « Réussi : oui / non » au lieu de « Passe : true / false » pour un test, et remet les accents dans les noms de lots. Sur les quatre travaux de la nuit, il a fait 6 remplacements, tous dans `traces-du-soir/` : 3 noms de PC (des noms d'exemple écrits dans les consignes et les comptes rendus, pas le vrai nom), 2 chemins temporaires et 1 détail familial. Rien dans les trois autres. Une recherche à la main sur les mêmes motifs ne trouve ni clé, ni jeton, ni adresse e-mail, ni nom de PC réel ; l'assistant de Sacha sur le Ryzen n'est nommé dans aucun des nouveaux fichiers.

Le 28/11 après-midi, l'outil a reçu les huit travaux du 28/11 et il a été relancé sur les seize. Les fichiers des huit travaux déjà rangés sortent à l'identique (`git diff` vide sur leurs dossiers). Sur les huit nouveaux, il a fait 14 remplacements : 8 chemins vers le dossier temporaire de Claude Code (dans `prochaines-idees/`, `traces-du-28/`, `lecture-du-banc/` et `greffes/`) ; 2 noms de PC dans `traces-du-28/`, qui sont des noms d'exemple cités par un compte rendu, pas le vrai nom ; 3 adresses e-mail, dans `code-v4/` et `sortie-reecrite/`, qui sont l'adresse générique « noreply » d'Anthropic des lignes de signature des commits ; et 1 nom propre, celui de l'assistant de Sacha sur le Ryzen, écrit par le vérificateur des traces du 28/11 dans la liste de ce qu'il avait cherché. Pour ce dernier, l'outil a reçu une règle de plus. Le nom n'est écrit nulle part dans le dépôt : l'outil le lit dans un petit fichier local que git ignore, et refuse d'écrire si ce fichier manque. (La première version gardait dans l'outil l'empreinte SHA-256 du nom ; la relecture l'a retirée, parce qu'un prénom se retrouve en quelques secondes à partir de son empreinte, en essayant une liste de prénoms. Relancé ainsi, l'outil redonne les seize dossiers à l'identique.) Une recherche à la main sur les nouveaux dossiers ne trouve ni clé, ni jeton, ni nom de PC réel, ni le nom de l'assistant.

Le 28/11 au soir, l'outil a reçu les six travaux de la fin d'après-midi et du soir, et il a été relancé sur les vingt-deux. Les fichiers des seize travaux déjà rangés sortent à l'identique (`git diff` vide sur leurs dossiers). Deux changements de l'outil ne valent que là où ils servent. Les agents de ces six travaux ont rendu un texte libre, avec ses propres titres : l'outil descend ces titres sous celui de l'agent, et l'en-tête du fichier le dit. Quand une équipe mêle deux modèles, l'en-tête donne le nombre d'agents de chacun, et chaque agent a son modèle écrit à côté de son rôle. Sur les six nouveaux dossiers, l'outil a fait 14 remplacements : 5 chemins vers le dossier temporaire de Claude Code (tous dans `tri-et-debit/`) ; 3 adresses e-mail (2 dans `traces-apres-midi/`, 1 dans `tri-et-debit/`), l'adresse générique « noreply » d'Anthropic des lignes de signature des commits ; 2 noms de PC dans `traces-apres-midi/`, les deux noms d'exemple déjà masqués à la section précédente, recités par un compte rendu ; et 2 fois le nom de l'assistant de Sacha sur le Ryzen, dans `traces-apres-midi/` (la consigne du relecteur lui demandait de chercher ce nom, et son compte rendu dit qu'il ne l'a pas trouvé). Rien dans les quatre études. Une recherche à la main sur les six dossiers ne trouve ni le vrai nom du PC, ni le nom de l'assistant, ni clé, ni jeton. Un joueur y est nommé par son prénom, Léo, comme ailleurs dans le portfolio.

Ce LISEZ-MOI a été écrit par un agent Opus le 27/11 au soir, à partir de ces comptes rendus, des bilans des orchestrations, des messages de commit et des journaux de l'évolution en cours. Les sections sur la nuit du 27 au 28/11 (de « La nuit du 27 au 28/11 » à « La leçon de méthode de la nuit ») ont été ajoutées par un autre agent Opus le 28/11 au matin, à partir des mêmes sources : les huit bilans, les quatre scripts et les 31 comptes rendus de la nuit, les messages des commits `b1ff8af89` à `2a3bea3c1`, le `resume.txt` de la branche `evolution-ryzen`, et les LISEZ-MOI des études citées. Les sections sur le 28/11 (de « Le 28/11 : ce qui se passe autour des huit équipes » à la section 16) ont été ajoutées par un troisième agent Opus le 28/11 après-midi : à partir des huit bilans, des huit scripts et des 37 comptes rendus, des messages des commits `44d048fc4` à `15c7f1cb3`, du `resume.txt`, de `population.json` et de `histoire.md` envoyés par le Ryzen à 14 h, des notes `greffes.md` et `LIVRAISON-GENES-V4.md` et de l'étude de la sortie préparée. Ce que la session principale lui a donné sans source dans le dépôt est marqué « d'après la session principale ». Les sections sur la fin d'après-midi et le soir du 28/11 (de « La fin d'après-midi et le soir du 28/11 » à la section 22) ont été ajoutées par un quatrième agent Opus le 28/11 vers 18 h : à partir des six bilans, des six scripts et des 34 comptes rendus, des messages des commits `332a12a67` à `9cc87f48e` (et `b0fed8858`, `b1326cf98` de la branche `banc-debit`), du `resume.txt` envoyé par le Ryzen à 17 h 00, du `resume.txt` de la vague 1, et des LISEZ-MOI des quatre études. Les trois tests longs passés sur l'arbre fusionné sont marqués « d'après la session principale » : aucun fichier du dépôt ne le dit encore.
