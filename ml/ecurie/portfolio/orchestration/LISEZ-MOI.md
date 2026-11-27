# Les orchestrations du 27 novembre 2026

Ce dossier garde la trace de quatre travaux faits le 27/11/2026 par des équipes d'agents. Il montre comment le travail a été réparti, ce que les agents ont rendu, ce que leurs relecteurs ont trouvé, et ce qui a encore dû être corrigé après eux.

Pour chaque travail, un sous-dossier contient deux fichiers :

- `script.js` : le script qui a lancé l'équipe, tel qu'il a tourné. On y lit la consigne exacte donnée à chaque agent.
- `comptes-rendus.md` : le compte rendu de chaque agent, dans l'ordre où ils ont été lancés, avec son rôle. Ce sont les mots des agents, remis en texte lisible, sans réécriture.

| dossier | le travail | agents | durée | jetons | appels d'outils |
|---|---|---|---|---|---|
| `construction/` | construire `ml/evolution`, la sélection naturelle des bots | 10 | 2 h 41 | 2 399 211 | 542 |
| `journal/` | écrire le journal de bord du portfolio | 16 | 25 min | 2 444 100 | 523 |
| `images/` | tirer cinq images des données et rendre le journal lisible | 20 | 26 min | 2 463 737 | 547 |
| `finitions/` | finir `ml/evolution` avant de l'installer sur le Ryzen | 7 | 3 h 18 | 1 993 694 | 568 |
| **total** | | **53** | | **9 300 742** | **2 180** |

Les chiffres viennent du bilan que Claude Code écrit à la fin de chaque orchestration. Le journal et les images ont tourné pendant que la construction tournait encore. Deux autres orchestrations du même jour, plus tôt dans l'après-midi (la conception de la sélection naturelle et les enquêtes sur ce qui distingue le bot d'un joueur), ne sont pas rangées ici.

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

---

## Comment ce dossier est fait

Les traces des orchestrations restent hors de git, dans le dossier de Claude Code, et s'effacent au bout d'un temps. Les deux fichiers de chaque sous-dossier sont sortis de l'outil `ml/ecurie/portfolio/outils/orchestration.js` :

```
node ml/ecurie/portfolio/outils/orchestration.js <dossier de la session Claude Code>
```

L'outil nettoie tout ce qu'il écrit, parce que le dépôt est public. Le 27/11 à 23 h 18, il a fait 16 remplacements : 10 chemins vers le dossier temporaire de Claude Code raccourcis en « <dossier temporaire> », 5 détails de famille retirés, et 1 nom de PC remplacé par « le-xeon » (c'était un nom d'exemple écrit par un relecteur, pas le vrai nom du PC). Il n'a trouvé ni clé, ni jeton, ni adresse e-mail. Le résultat a été recontrôlé à la main par une recherche sur les mêmes motifs, et le vrai nom du PC n'apparaît dans aucun fichier.

Ce LISEZ-MOI a été écrit par un agent Opus le 27/11 au soir, à partir de ces comptes rendus, des bilans des orchestrations, des messages de commit et des journaux de l'évolution en cours.
