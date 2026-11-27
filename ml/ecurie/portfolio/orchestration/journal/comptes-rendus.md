# Le journal de bord du portfolio : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `journal-de-bord-portfolio` (wf_04e2d37c-894), lancée par la session principale (Claude Fable).
- Agents : 16, tous du modèle claude-opus-5-5.
- Durée : 25 min ; jetons consommés par les agents : 2 444 100 (2,44 millions) ; appels d'outils : 523.
- Message de fin du script : « chapitres verifies : 7 sur 7 ».
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. rédacteur du chapitre « avant » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
2. rédacteur du chapitre « n2223 » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
3. rédacteur du chapitre « n24 » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
4. rédacteur du chapitre « n25 » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
5. rédacteur du chapitre « n26 » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
6. rédacteur du chapitre « n27 » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
7. rédacteur du chapitre « methode » : écrit le chapitre depuis git, les documents et les journaux (phase « Ecrire »)
8. vérificateur du chapitre « n26 » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
9. vérificateur du chapitre « n2223 » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
10. vérificateur du chapitre « n24 » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
11. vérificateur du chapitre « avant » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
12. vérificateur du chapitre « n25 » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
13. vérificateur du chapitre « n27 » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
14. vérificateur du chapitre « methode » : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
15. auteur du sommaire : le fil du récit, la frise, le registre des impasses, les pièces à montrer (phase « Sommaire »)
16. critique : cherche ce qui manque encore au dossier et tire des chiffres au hasard pour les recontrôler (phase « Critique »)

## 1. ecrire:avant

*Rôle : rédacteur du chapitre « avant » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/00_avant-le-22-novembre.md

### Résumé

Chapitre 00 écrit : la préhistoire du chantier, de septembre à octobre 2026, avant le plan du 22/11. Il couvre deux tentatives de neuroévolution. D'abord ml/train : un réseau maison 12→16→4, 24 voitures, la moitié la plus nulle remplacée (règle de Sacha), dans une copie du jeu de juillet. Ensuite ml/reel, le 20/10 : un réseau 15→16→4, 20 cerveaux, une note égale à la distance, dans le vrai jeu ; 57 générations, 3 survivants sur 6 pistes neuves, 0,2 figure par partie.
Les essais sont listés avec leur verdict, GARDÉ ou ÉCARTÉ, et le commit qui le prouve : physique unique, clonage abandonné, re-normalisation réfutée, notation sur plusieurs pistes, pilote au sol, récompense des figures à 0,08, 1,2 et 3, mode figures séparé.
Les causes de l'échec sont documentées. La copie divergeait du vrai jeu (le critique le signale le 25/09, et la gravité ×1,45 est trouvée le 20/10). Le bouton NITRO servait à deux usages. Les réseaux récitaient la piste au lieu de conduire, et les totaux de population masquaient un champion à 0 % d'arrivées. Des données ont été perdues (démos effacées, entraînements des générations 139 et 148), et Claude a fait des erreurs de méthode qu'il a lui-même listées.
Le chapitre se termine sur ce qui change le 27/11 : un réseau greffé muet sur un pilote lisible, un jugement sur toutes les courses et le vrai jeu ; la phrase de Sacha du 27/11 est citée. Suivent le tableau des chiffres avec leurs sources, les pièces montrables (apercu-31415.png, les courbes dans run-seed*.json et pop-reel-g1.json, le rapport des huit erreurs) et la liste des commits lus.

### Doutes

- Le chapitre dépasse un peu la cible : environ 1 950 mots en comptant le tableau et la liste des sources, environ 1 450 pour la prose.
- Rien n'a été retrouvé de juillet : passation/BOTS-ML.md dit « juillet → septembre » pour ml/train, mais le premier commit ml date du 07/09. Le chapitre le signale.
- Il y a un écart dans BOTS-ML.md §1 : « après 300 générations : 0 figure, 9 % de poses ». Les 9 % datent du 08/09, alors que le run de 300 générations donne 39 % (commit 5799d5bb1). Le chapitre le signale dans une note sous le tableau.
- Je n'ai pas vérifié si les écarts SPD 0,5/0,48 et AIR_ASSIST 1,0/0,2, signalés par le critique le 25/09, ont été rattrapés lors de la resynchronisation du 20/10 (le commit 71bac35b6 ne cite que la gravité, la route et les figures).
- L'auteur des commits non signés du 8 au 21/09 reste inconnu : ils mentionnent « Fable » et « hermes », sans attribution claire.
- Écart entre deux sources sur ml/reel : le commit parle de 57 générations, et champion-reel-g1.json garde le record de la génération 43 (3 616 m). Ce n'est pas contradictoire, mais je n'ai pas vérifié valider.js en le relançant (interdit).
- L'effet de la pénalité de mort W_DEATH=2500 (c14ba2a3e) n'est chiffré nulle part dans les sources lues.
- Je n'ai pas lu en entier ml/train/CRITIC-REPORT.md (200 Ko, 83 verdicts), seulement l'en-tête et le 123e passage. Je n'ai pas non plus consulté les fichiers multi-*.json.

## 2. ecrire:n2223

*Rôle : rédacteur du chapitre « n2223 » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/2026-11-22_23.md

### Résumé

Le 22/11 (d2ee1f114, Fable 5.2), Claude propose un nouveau plan après l'échec de ml/train et de ml/reel d'octobre : des cerveaux de bot écrits comme des programmes lisibles, notés par le vrai jeu, sur le modèle d'Eureka et d'AlphaEvolve. Le plan compte 9 étapes, prévoit une boîte noire des traces et porte la mention « pas encore validé par Sacha ».
Le 23/11, l'étape 0 (d304dad70, Opus 5.5) remet en marche ml/reel : 411 images/s, soit 6,8 fois le temps réel. Même graine = même course au bit près dans un processus neuf, mais un écart de nitro apparaît dans un même processus.
Le même jour, l'étape 1 (3317b893a) écrit le contrat du bot : les yeux, les gestes, et des doigts limités à une main (67 ms par appui, 2 gestes/s). Elle répare deux pannes que les courses de 60 s cachaient et note le bot de référence sur 20 graines (survie 143 s, 17 383/min, 9,6 % du temps en l'air).
Le soir (4a4b2fc01), Sacha fournit l'étalon provisoire : 5 parties au clavier (172,3 s, 29 480/min, 36,2 % en l'air, 3,89 raccourcis/min). Le comptage a dû être corrigé le jour même.
Le chapitre signale aussi les défauts du code du 23/11 confirmés par la relecture du 24/11 : le bac fermé laissait passer le hasard, et le recollage après une seconde chance faussait le palier.

### Doutes

- Le chapitre fait environ 2 100 mots en tout, tableau et sources compris ; le texte seul tourne autour de 1 400 mots, mais je ne l'ai pas compté précisément.
- Le compte rendu de passation/BOTS-ML.md et ml/reel/README.md datent l'étape 0 du 22/11, alors que le commit d304dad70 et l'horodatage de etape0.json sont du 23/11 (16:42 UTC). Le chapitre suit le commit et signale l'écart.
- Le plan est daté du 21/11 dans son titre mais il a été commité le 22/11.
- Je n'ai trouvé aucune phrase exacte de Sacha pour le 22 et le 23/11 : paroles-sacha.md commence le 24/11. Sa demande n'est connue que par la reformulation de Claude dans l'en-tête du plan.
- Je cite les chiffres de ml/train (300 générations, 0 figure, 9 % de poses) et de ml/reel d'octobre d'après le plan, sans avoir relu leurs dossiers.
- ml/bot/results/note-reference.json a été réécrit depuis (dernier commit le 25/11). Les chiffres du chapitre viennent de la version du commit 3317b893a.
- Ces deux jours n'ont produit aucune image, aucun film ni aucun rejeu filmé. Je n'ai trouvé que des documents et des fichiers JSON dans git.

## 3. ecrire:n24

*Rôle : rédacteur du chapitre « n24 » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/2026-11-24.md

### Résumé

Le 24/11/2026 (12 commits, tous co-signés Claude Fable 5.2), l'étalon passe à deux joueurs : 12 parties à midi, 14 le soir. Sacha décide que les parties de Léo au téléphone comptent « dans les 20 ».
L'étape 1 bis construit la boîte noire du labo (inscrire.js, rejeux exacts 4 sur 4, arbre, film à 60 images/s sans ffmpeg ; l'essai de l'enregistreur direct, à environ 12 images/s, est écarté).
Trois découvertes : le jeu tire tout du même hasard (recalage nécessaire, 1 879 décisions sur 1 879 ensuite) ; le simulateur jouait au régime maximum avec Crypto City, alors que les joueurs jouent en allégé ; une note dépendait de la charge du PC (limite passée de 500 ms à 5 s).
Le même jour arrivent le juge humain ou bot (AUC 0,97), l'étude (9 rapports, 28 défauts dont 24 corrigés), le nouveau but de Sacha (l'écurie du palier 1 au palier 30, indiscernable, cité dans PLAN.md), la boucle payante (crédit refusé, 0 € dépensé) et le radar des yeux v2 (57 vols sur 57, 44 sur 44 au centimètre).
Le chapitre fait environ 1 800 mots au total, dont environ 1 400 de prose, et chaque chiffre renvoie à un commit ou à un fichier.

### Doutes

- Le régime allégé est marqué « Tranché » dans PLAN.md et BOTS-ML.md, mais aucune source lue ne cite une phrase de Sacha sur ce point. Le chapitre ne lui attribue donc pas cette décision et le dit.
- Contradiction entre deux sources. Le commit 71f3c7bea (20 h 47) dit que l'essai à blanc de la boucle passe en entier. ETAPES.md, mis à jour à 23 h 31 (384387572), dit encore que la boucle n'a jamais tourné, même à blanc. Le chapitre signale la contradiction sans la trancher.
- Le nombre de parties de Sacha varie selon les sources : 8 à midi dans f1719eca5, 10 sur 14 le soir dans BOTS-ML.md et humains.md. Les deux sont cités avec leur heure.
- Je n'ai pas vérifié que la vidéo hors git ml/labo/videos/c0001-g910407.webm (24/11, 19 h 48, 26,9 Mo) est bien le film d'essai de 39,9 s décrit dans BOTS-ML.md. C'est dit dans le chapitre.
- « La main mesurée contre les joueurs », citée dans la consigne, ne figure dans aucun commit du 24/11 : la figure main-*.svg date du 25/11 (ce5929035). Elle n'est donc pas attribuée au 24.
- Les chiffres du juge (AUC 0,97, nitro 19 % contre 63 %) viennent du message de b5735be4e. Le fichier JSON actuel a été réécrit le soir même (1528cecf2) et donne une nitro de 18,7 %.
- Le chapitre dépasse 1 500 mots au total (environ 1 800 avec le tableau et les sources) ; la prose seule fait environ 1 400 mots.
- Le message de Sacha de 19 h 43 UTC (« ultra code ») n'est pas cité : il porte sur un réglage de session, pas sur le chantier.

## 4. ecrire:n25

*Rôle : rédacteur du chapitre « n25 » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/2026-11-25.md
- ml/ecurie/portfolio/journal/2026-11-25_suite.md

### Résumé

J'ai écrit deux chapitres, parce que les 22 commits ne tenaient pas en 1500 mots. Le premier, 2026-11-25.md, couvre la nuit et le matin : la relecture de l'étape B (58 trouvailles), le canyon remis avec ses parois (la référence passe de 9/25 à 8,5/18), puis l'incident de 13 h 27, quand Sacha voit que son abonnement Fable a été vidé.
Après l'incident, la chaîne payée par la clé d'API est en place 4 minutes plus tard (29c4e8c8c), et le premier pilote de Fable arrive pour 11,63 $ : 12,5/20 contre 6/17 pour la référence. Opus le contrôle ensuite pour 8,71 $.
Le second, 2026-11-25_suite.md, couvre le calibrage : 4,63 € au total, aucun champion, et c0011 passe de 13,5 au tri à 10,5 contre 11 sur graines neuves. Il raconte le choix de Sonnet pour une raison de PC et non d'argent, Fable coupé à 32 000 jetons, la salle de projection, le compte rendu n° 2, la page portfolio et ses 10 SVG.
La journée finit à 36,92 € sur 200. Il y a aussi une impasse retrouvée dans chaine.log : la boucle de l'étape C attend toute la nuit, parce que la règle des 14 € par jour comptait aussi les agents.
Chaque chiffre a sa source (commit court ou fichier). Les heures sont celles de Paris, et les messages de Sacha, notés en UTC dans leur source, sont convertis.

### Doutes

- L'enquête sur le réalisme (ml/ecurie/etude/realisme.md) n'est pas du 25/11. Elle date du 26/11 (commit d6014a657, fichier de 13 h 26 le 26/11), et les autres rapports de etude/ datent du 24/11 (67ea1f009). Je ne l'ai donc pas mise dans le chapitre du 25/11.
- PASSATION.md dit qu'un « workflow de 152 agents » a vidé l'abonnement le 25/11, sans dire lequel. Que ce soit la relecture de la nuit (commits signés Claude Fable 5.2) est probable mais non vérifié. Le chapitre le dit.
- Dans paroles-sacha.md, les messages de 12:31, 13:39, 17:45, 17:47, 19:01 et 19:12 UTC viennent d'autres sessions. Ce sont visiblement les consignes que Claude a données aux agents (mêmes heures que les rapports agents/2026-11-25T*), pas des paroles de Sacha. Je ne les ai pas citées comme venant de lui.
- Les deux citations de Sacha dans l'en-tête de chaine.js (« organise toi pour pas d'arreter », « utiliser les token [d'API] pour ca ») n'apparaissent pas dans paroles-sacha.md. Je ne les ai pas utilisées.
- La salle de projection a été corrigée à 18 h 24 (4729c99ae), et Sacha écrit « tout est noir » à 18 h 29. Je n'ai pas retrouvé ce qui a suivi.
- Je ne sais pas qui a fait les films ml/labo/videos/*.webm du 25/11 (hors git), ni si c0003-g910407.webm (23 h 33) répond à la demande de vidéo de 23 h 27.
- Les montants en « € » du journal des dépenses sont des dollars comptés 1 pour 1 (agent-api.js), et ce sont des estimations : « la facture fait foi ». Je n'ai pas pu les comparer à la facture réelle.
- Le chapitre ne donne pas le quota de l'abonnement consommé le 25/11 : aucune source ne le chiffre.
- Je n'ai pas lu compte-rendu-01.html ni index.html en entier, seulement leurs titres et sections, avec une recherche sur les dépenses. Je n'ai pas non plus relancé labo.js.
- Sur 1500 mots par chapitre : wc -w compte 1737 et 1554 mots, tableaux et chemins compris. La prose seule est sous la limite, mais je ne l'ai pas comptée à part.

## 5. ecrire:n26

*Rôle : rédacteur du chapitre « n26 » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/2026-11-26.md

### Résumé

Chapitre du 26/11/2026 : Sacha trouve les bots « trop frileux » en l'air et demande vols, figures, raccourcis et une enquête sur le réalisme.
Claude (Fable 5.2) règle à la main pilote-voltige.js, un défaut à la fois : voltige.js, rayon viser, garage, plongeons bornés, portails en vol, sortie du dessous de la dalle (14 % → 2,3 %), loi « vers la route » corrigée (163 → 193 paliers sur 24 courses).
L'écart aux joueurs (ressemblance.js) est créé parce que le juge reste à 0,97, puis corrigé le soir (plafond 4 → 8) parce qu'il aurait récompensé la cachette sous la route.
Les échecs sont listés avec leurs chiffres : plus de nitro, slalom, vols hauts, grotte rouverte, coups de nitro en vol, trois remèdes à la pose en travers.
La boucle payante est réécrite (critère mixte) et essayée à blanc pour 0 €, mais pas lancée : c'est à Sacha de déclencher la dépense. Sacha corrige la méthode à 15 h 47 UTC (« travaille en autonomie »).

### Doutes

- Le chapitre fait environ 1 850 mots en comptant le tableau et les sources ; la prose seule est proche de la limite haute de 1 500.
- Les heures des citations de Sacha sont en UTC (paroles-sacha.md), celles des commits à l'heure de Paris (+0100) : le chapitre le précise, mais un lecteur peut les confondre.
- Je n'ai pas cité le « Oui, pousse » de Sacha à 13 h 51 UTC : il pourrait viser la poussée de la branche pour le second PC, mais je ne l'ai pas vérifié.
- La phrase de Sacha sur l'enquête (« tous les éléments à ajouter... ») vient de la reformulation dans PASSATION.md et dans le contexte d'une sous-session. Son message direct de 12 h 00 ne la contient pas mot pour mot.
- paroles-sacha.md et tout ml/ecurie/agents/tmp-voltige/ sont hors git (ignorés par .gitignore) : ces sources peuvent disparaître.
- Je n'ai pas relu CONSIGNES.md en entier : la définition du critère mixte vient d'ETAPES.md et de PASSATION.md.
- Je n'ai trouvé aucune image, film ou rejeu produit le 26/11 pour le pilote qui vole.

## 6. ecrire:n27

*Rôle : rédacteur du chapitre « n27 » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/2026-11-27.md

### Résumé

Le chapitre du 27/11/2026 suit la journée heure par heure, à partir des sources. Vers 1 h, la nitro au sol est refaite (1ee936e15 : 53 % du temps, écart aux joueurs 1,67, palier médian 7,5). Le réglage le plus ressemblant est écarté parce qu'il coûte les figures. Sacha lance ensuite la boucle payante sur le Ryzen (son résultat n'est pas vérifié ici). Puis vient la loi « retour » des yeux (49012f2d9) : réglée à la main, elle ne bat pas le pilote. Entre 14 h 31 et 15 h 42 UTC, Sacha change de cap, et le chapitre cite ses phrases : budget à utiliser en entier, plan qui ne lui correspond pas, sélection naturelle sur le Ryzen sans jetons, « pourquoi pas dès le départ », remettre la méthode en question à chaque étape. Le chapitre dit aussi que c'est lui qui a dû le proposer. Suivent l'étude du bruit (palier : 3,21 de bruit par course contre 0,86 de vraie différence ; 140 courses pour voir +1 palier ; l'écart est fiable à 0,88), la spécification et les quatre enquêtes relues (la surprise de la grotte). La construction de ml/evolution est décrite sans que le système ait tourné. La méthode est expliquée simplement (neuroévolution, algorithme génétique à état stationnaire, hybride à partir du pilote écrit à la main) et comparée à ml/train et ml/reel. Le chapitre finit par un tableau des chiffres avec leurs sources, ce qu'on peut montrer et les sources. Aucun autre fichier n'a été modifié, aucun commit, aucune course lancée.

### Doutes

- Le résultat de la boucle payante lancée sur le Ryzen (13 h 40 UTC) est introuvable sur ce PC : ses journaux et ses dépenses sont séparés. Seuls les 36,92 € du Xeon sont comptés.
- La phrase « gère mieux l'abonnement, tu utilises trop Fable par rapport à Opus » ne figure pas dans paroles-sacha.md. Elle ne vient que de la note de mémoire menager-fable-utiliser-opus.md, et le chapitre le dit.
- « Six gestes à essayer » : je n'en trouve que quatre avec le verdict « a essayer » écrit en toutes lettres dans PROPOSITIONS.md. Les autres sont classés sans verdict, ou jugés douteux ou à écarter. Le chapitre dit quatre.
- « Dix agents » pour ml/evolution n'est pas vérifiable dans les fichiers. INTERFACES.md cite « dév. 2 » à « dév. 5 », et tests/ contient trois relectures (déterminisme, robustesse, statistique). Le chapitre parle d'une équipe d'agents sans donner de nombre.
- La réponse donnée à Sacha sur « faut-il arrêter les essais sur le Ryzen ? » (15 h 42 UTC) n'apparaît dans aucune source lue. Le chapitre la marque « non tranché ».
- La réponse de Claude à « ça s'appelle comment, genetic algorithm ? » (17 h 11 UTC) n'apparaît dans aucune source. Les termes neuroévolution / état stationnaire viennent de la consigne et de SPECIFICATION.md (« μ+λ à l'état stable »).
- Pendant l'écriture, ml/ecurie/etude/selection-naturelle/ a été committé par une autre session (033bfebeb, 18 h 19). Le chapitre est corrigé en conséquence. ml/evolution/ et le dossier journal/ restent hors git.
- La phrase sur l'essai d'octobre (« un réseau parti de zéro n'apprendra pas à voler ») est reprise de SPECIFICATION.md. Je n'ai pas relu les résultats de ml/reel/entrainer.js.

## 7. ecrire:methode

*Rôle : rédacteur du chapitre « methode » : écrit le chapitre depuis git, les documents et les journaux. Phase : Ecrire.*

### Fichiers

- ml/ecurie/portfolio/journal/comment-on-a-travaille.md

### Résumé

C'est un chapitre transversal sur le processus du 21 au 27/11. Il dit qui fait quoi : Sacha fixe le but, joue l'étalon (14 parties, avec Léo) et corrige la méthode ; Claude écrit et mesure (50 commits dans ml/ depuis le 22/11 : 33 Fable, 7 Opus, 6 agents, 4 de la boucle).
Il décrit les deux bourses. Le journal de la clé d'API compte 36,92 € sur 200 €, tout le 25/11. Il y a 7 sessions d'agents sans écran, avec modèle, plafond et coût. Le calibrage a coûté 4,63 € sans aucun gain validé, et la chaîne n'a payé aucune tranche.
Il montre comment chaque règle de travail est née d'un raté, avec la phrase datée de Sacha : le quota vidé par 152 agents, « ne me pose pas ce genre de question », « cramer 100 % », « arrête de suivre les plans », « garde des traces ».
Il liste les garde-fous techniques (processus neuf, empreinte a7b3171768ca, graines neuves, raison obligatoire, main fixée, clé jamais affichée) et les vérifications croisées entre agents.
Il dit enfin ce qui n'a pas marché : le tri sur 6 graines n'était que du bruit (fiabilité 0,35 à 0,44 sur 12 courses), la réponse de Fable a été coupée à 32 000 jetons, les dollars et les euros se confondent, et des traces restent hors git.

### Doutes

- La phrase « ça c'est le genre de choses auxquelles tu aurais dû penser » et celle sur l'usage de Fable contre Opus ne viennent que des notes de mémoire de Claude, pas de paroles-sacha.md ; le chapitre le dit.
- Le journal des dépenses du Ryzen est séparé et je ne l'ai pas lu : le total de 36,92 € ne vaut que pour ce PC. Je n'ai pas non plus retrouvé le résultat de la boucle lancée par Sacha sur le Ryzen le 27/11.
- Unité de l'argent : les rapports d'agents comptent en dollars et le journal en euros (agent-api.js pose 1 € = 1 $). La facture réelle n'est pas vérifiée.
- Le nombre de 152 agents vient seulement de PASSATION.md : je n'ai lu aucun journal de ce workflow.
- Grok, prévu comme critique extérieur dans le plan (BOTS-ML.md § 6) : aucune source ne montre qu'il ait servi.
- L'agent « choix-modele » a demandé s'il fallait arrêter l'étape C à 90 € : je n'ai pas trouvé de réponse de Sacha avant celle du 27/11 (« tu gères ça comme tu veux »).
- La longueur est à la limite haute : environ 1 500 mots de texte, plus le tableau et les sources.
- Les autres chapitres du journal (dont 2026-11-27.md) ont été écrits en même temps : je n'ai lu en détail que 2026-11-24.md, et vérifié par recherche que 2026-11-25.md cite le même incident du quota.

## 8. verifier:n26

*Rôle : vérificateur du chapitre « n26 » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-26.md

### Affirmations contrôlées

84

### Corrections

- Avant : Écart aux joueurs 3,05 · 2,54 · 2,02 · 2,00 — source : c72d25ecf, 830cdf573  
  Apres : source : ETAPES.md, c72d25ecf, 830cdf573  
  Source : 3,05 (pilote.js) et 2,54 avec la borne 8 n'apparaissent que dans ETAPES.md l. 85 et 125 ; c72d25ecf ne donne que 2,02 et « avant 2,54 »
- Avant : La pose en travers (224363ea3, fin de nuit)  
  Apres : (224363ea3, 23 h 35)  
  Source : git log --date=iso : 2026-11-26 23:35:16 +0100
- Avant : En lisant les morts image par image  
  Apres : En relisant les morts vue par vue (chaque « regard » du bot)  
  Source : ETAPES.md l. 152 : « lus vue par vue (vol-mort.js) »
- Avant : découvre que presque chaque correction de réalisme coûte d'abord des paliers  
  Apres : constate que plusieurs corrections coûtent des paliers, jusqu'à ce que la loi corrigée en rende une partie  
  Source : dd807f338 (portails : sans perte de palier), 830cdf573 (193 paliers au lieu de 163)
- Avant : Plus de nitro au sol ... ÉCARTÉ  
  Apres : ÉCARTÉ ce jour-là ; refait après minuit sur le pilote corrigé, 53 % pour un demi-palier, gardé (1ee936e15, 27/11 0 h 58)  
  Source : 1ee936e15, ETAPES.md l. 210-236
- Avant : Les commits de la journée sont signés par Claude Fable 5.2  
  Apres : faits sous le compte git de Sacha et portent la mention Co-Authored-By: Claude Fable 5.2 (ecd9eeccd : Opus 5.5)  
  Source : git log -1 --format='%an | %B' sur les 10 commits
- Avant : la phrase d'enquête présentée comme citation de Sacha (citée dans PASSATION.md)  
  Apres : rapportée entre guillemets par ETAPES.md et PASSATION.md, absente mot pour mot de ses messages relevés (non vérifié)  
  Source : paroles-sacha.md 26/11 : 12 h 00 ne la contient pas ; elle n'apparaît qu'à 12 h 12 dans un contexte de sous-session écrit par Claude
- Avant : images : course vue de dessus, radar, main, paliers  
  Apres : course vue de dessus, radar, main, paliers, justesse ; clair et sombre ; dans git (ce5929035)  
  Source : ls et git ls-files ml/ecurie/portfolio/images/ (10 fichiers svg, dont justesse-*.svg)
- Avant : note-pilote-voltige-allege.json réécrite à chaque étape de la journée  
  Apres : versions du 26/11 aux commits 63012939f, c72d25ecf, 830cdf573 ; la version sur le disque est celle du 27/11 (1ee936e15)  
  Source : git log -- ml/bot/results/note-pilote-voltige-allege.json
- Avant : Dépensé ... (0 € ce jour-là) — ecd9eeccd, PASSATION.md  
  Apres : aucune dépense datée du 26/11 — ajout de depenses.jsonl en source  
  Source : ml/labo/journal/depenses.jsonl : 26 lignes, total 36,92, aucune du 26/11
- Avant : Ancien pilote 11 · 20 (20 × 900 s) — ETAPES.md  
  Apres : source complétée : cerveaux.jsonl (c0003, 20 graines, tmax 900)  
  Source : ml/labo/journal/cerveaux.jsonl
- Avant : radian, graine non expliqués  
  Apres : 1,6 rad = un peu plus d'un angle droit ; 0,33 rad ≈ 19°, 0,13 ≈ 7° ; graine = numéro qui fixe le tirage d'une piste  
  Source : conversion directe ; lisibilité pour un jury non programmeur

### Retiré

- « Il conduisait bien » présenté comme un fait : remplacé par la seule citation de Sacha (« les bots conduisent bien »)

### Manques

- Le premier jet de pilote-voltige.js (d6014a657, 14 h 23) : palier médian 8,5 contre 12,5 pour pilote.js sur 12 courses de 300 s (ajouté)
- Le message de Sacha de 12 h 00 UTC demande aussi de gérer l'abonnement et les crédits « pour que ça dure toute la semaine » et propose d'enregistrer des parties « spécialement pour le airtime » (ajouté)
- Les 28 parties à enregistrer et les 8 lignes à ajouter à l'enregistreur du jeu, laissées à la décision de Sacha (PASSATION.md, realisme.md § 5) (ajouté)
- Le second PC (Ryzen 5 3600, 13 h 43 UTC), le « Oui, pousse » de 13 h 51 et la branche poussée pour ce PC selon PASSATION.md, le lien étant marqué non vérifié (ajouté)
- 36 % des poses ressortent de la route en moins de 0,8 s (224363ea3) (ajouté)
- Après la loi corrigée, 10 des 20 morts arrivent dans la seconde qui suit une sortie de route (830cdf573) (ajouté)
- Les plongeons voulus : 67 engagés, 4 morts (6 %) (ajouté au tableau)
- La nitro au sol refaite et gardée après minuit (1ee936e15) : signalée comme la suite (ajouté)
- La règle corrigée ne vaut que pour le pilote ; les yeux gardent l'ancienne, d'où la conclusion « changer les yeux » (ajouté)

### Verdict

Chapitre solide sur le fond : presque tous les chiffres sont retrouvés dans les commits, dans ETAPES.md et dans PASSATION.md (version 224363ea3). Les deux citations directes de Sacha (12 h 00 et 15 h 47 UTC) sont fidèles. J'ai corrigé des sources incomplètes (écart 3,05 et 2,54), une heure mal qualifiée (« fin de nuit » pour 23 h 35), une attribution (des commits faits sous le compte git de Sacha et co-signés Claude, pas « signés par Claude »), et une citation d'enquête présentée comme une parole directe de Sacha alors qu'elle n'est que rapportée. J'ai complété la liste des images (justesse) et les versions de la note. J'ai ajouté ce qui manquait : le premier jet, les décisions laissées à Sacha, le second PC, des chiffres de mort et de pose. Aucun secret ni adresse e-mail. Les fichiers montrables existent : trois sont dans git, tmp-voltige est hors git. Reste un défaut : avec les ajouts, la prose dépasse la limite de 1 500 mots, d'environ 1 700 à 1 800 mots estimés hors tableau et sources (wc compte 2 325 pour tout le fichier). Il faudra peut-être resserrer. Aucun commit n'a été fait.

## 9. verifier:n2223

*Rôle : vérificateur du chapitre « n2223 » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-22_23.md

### Affirmations contrôlées

74

### Corrections

- Avant : note-reference.json a été réécrit depuis (dernier commit le 25/11) ; la version du 23/11 se lit avec git show 3317b893a:…  
  Apres : note-reference.json est inchangé depuis 3317b893a ; c'est etalon.json qui a été réécrit le 24/11 (version du 23/11 : git show 4a4b2fc01:ml/bot/results/etalon.json). Ajout aussi : BOTS-ML.md modifié le 25/11, README le 26/11, repetable.json le 25/11, avec la commande pour lire la version d'origine  
  Source : git log -1 sur chaque fichier ; git diff 3317b893a HEAD -- note-reference.json (vide)
- Avant : Le 24/11, quatre relecteurs ont confirmé deux défauts du code écrit le 23/11 […] le recollage classait la partie un palier trop bas  
  Apres : 28 défauts confirmés dans ml/bot, ml/labo, ml/reel et les documents ; au moins cinq touchent le code du 23/11 (bac : horloge réelle, hasard par détour accepté ; pièces lues après la reprise ; noter.js à 180 s qui écrase la note à 300 s ; ~2 s d'explosion comptées chez l'humain ; raccourcis comptés autrement que le jeu). Le palier n'existait pas dans mesures.js le 23/11 : cette partie du défaut 2 vise du code du 24/11  
  Source : ml/ecurie/etude/defauts-confirmes.md (titres 1 à 28) ; git show 4a4b2fc01:ml/bot/mesures.js (aucun « palier ») ; git show 3317b893a:ml/bot/noter.js (TMAX défaut 180)
- Avant : Il découpe le travail en 9 étapes (0 à 8), chacune avec son budget  
  Apres : étapes 0 à 8 plus une étape « 1 bis » (la boîte noire) ; 180 € sur les étapes 2 à 8 et 20 € de réserve  
  Source : git show d2ee1f114:passation/BOTS-ML.md §3
- Avant : Le README de ml/reel dit 2 à 4 fois par cœur  
  Apres : citation exacte : « 2 à 4 × le temps réel sur une course de plusieurs minutes, contre 6,8 × sur la première piste seule » (le README ne dit pas « par cœur »)  
  Source : git show 3317b893a -- ml/reel/README.md
- Avant : un double appui dans une fenêtre de 300 à 420 ms  
  Apres : une fenêtre notée « 300/420 ms » dans le plan (le plan ne dit pas « de 300 à 420 »)  
  Source : passation/BOTS-ML.md §1 (d2ee1f114)
- Avant : bac fermé (une zone où il n'a ni fichiers, ni réseau, ni hasard)  
  Apres : zone « censée » le priver de fichiers, réseau, horloge et hasard, avec la réserve du README : « un garde-fou, pas un coffre-fort »  
  Source : git show 3317b893a:ml/bot/README.md §1
- Avant : Ils donnent 5 parties une fois recollées  
  Apres : Le calcul en retient 5 ; le commit ne détaille pas le passage de 7 à 5, les deux corrections l'expliquent vraisemblablement (non vérifié)  
  Source : git log -1 4a4b2fc01 ; etalon.json (5 parties, une avec chances=1)
- Avant : 411 images par seconde, soit 6,8 fois (3 graines × 60 s)  
  Apres : ajout : de 2,42 à 11,1 × selon la course dans le même fichier, deux des trois courses meurent avant 60 s  
  Source : git show d304dad70:ml/reel/results/etape0.json
- Avant : contrôle des doigts : source passation/BOTS-ML.md  
  Apres : source ajoutée ml/bot/results/verifier.json (appuis 545, tmax 150)  
  Source : git show 3317b893a:ml/bot/results/verifier.json

### Retiré

- « le README de ml/reel dit 2 à 4 fois par cœur » (le « par cœur » n'est pas dans la source)
- « classait la partie un palier trop bas » attribué au code du 23/11 (le palier n'est mesuré qu'à partir du 24/11)

### Manques

- AJOUTÉ : l'argent par minute de l'étalon est dominé par une seule partie de 548,8 s (reprise après seconde chance) : 451 871 sur 515 515, soit 88 % ; sans elle, environ 7 600/min, moins que la référence (17 383) ; le « 59 % » était donc fragile (calcul sur etalon.json de 4a4b2fc01)
- AJOUTÉ : la référence pose un peu plus de figures par minute que Sacha (5,9 contre 5,49)
- AJOUTÉ : nitro tenue de la référence 17,6 % (contre 56,4 % pour Sacha)
- AJOUTÉ : Sacha a joué avec la première voiture, LA HONTE, la même que le bot ; débuts de parties 19:29-19:44 UTC
- AJOUTÉ : l'ancien README de ml/reel annonçait 3 à 4 × « pas remesuré depuis »
- AJOUTÉ : les autres sources du plan (Linesight, GT Sophy, Rocket League)
- AJOUTÉ dans Ce qu'on peut montrer : l'export brut ml/bot/etalon/cashcar-parties-2026-11-23-1950.json (suivi par git)
- AJOUTÉ : paroles-sacha.md n'est pas suivi par git
- NON AJOUTÉ : aucune phrase datée de Sacha pour le 22-23/11 n'existe dans les sources lues

### Verdict

Le chapitre est solide sur l'essentiel : tous les chiffres des quatre commits (411 img/s, 6,84 ×, ~2 700 variables, 82 s, 67 ms / 7,5 / 2, 545 appuis, 143 s, 17 383, 5,9, 9,6 %, 0,04, vide 12 / roche 5 / air 2 / pic 1, 7 enregistrements, 17,5 min, 172,3 s, 29 480, 36,2 %, 3,89, 56,4 %, 59 %), les heures de commit, les attributions (Fable 5.2 / Opus 5.5 en co-auteur) et les citations du plan ont été retrouvés. Trois erreurs ont été corrigées dans le fichier : note-reference.json n'a jamais été réécrit (c'est etalon.json) ; la relecture du 24/11 a confirmé 28 défauts, dont au moins cinq dans le code du 23/11, et non deux ; et la partie « palier » de l'un d'eux vise du code du 24/11. Le plan a 10 lignes d'étapes (avec « 1 bis »), pas 9. J'ai ajouté une limite de méthode qui manquait : 88 % de l'argent de l'étalon vient d'une seule partie, ce qui rend le « 59 % » fragile. Tous les fichiers de « Ce qu'on peut montrer » existent et sont suivis par git. Il n'y a ni secret ni adresse e-mail, et aucune phrase de Sacha n'est inventée. Reste un problème : le texte avant le tableau fait environ 2 000 mots (2 838 en tout), au-dessus des 1 500 demandés. Je ne l'ai pas raccourci, pour ne pas perdre de faits sourcés.

## 10. verifier:n24

*Rôle : vérificateur du chapitre « n24 » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-24.md

### Affirmations contrôlées

68

### Corrections

- Avant : Le soir, l'étalon compte 14 parties.  
  Apres : À 18 h 31 (92fef5bd1, export de 12 h 13), l'étalon compte 14 parties : 10 de Sacha, 4 de Léo ; une cinquième partie de Léo (auto-école) avait été écartée  
  Source : git log -1 92fef5bd1, f1719eca5 ; passation/BOTS-ML.md l.121-122
- Avant : le bot de référence est reconnu presque à coup sûr, AUC 0,97  
  Apres : verdict « discernable à coup sûr », AUC 0,97, avec la réserve : 11 parties au clavier contre 4 courses du bot, et ce sont les 4 courses extrêmes gardées au labo, « pas celui du bot ordinaire »  
  Source : git show b5735be4e:ml/bot/results/discerner-reference-4-courses.json (humains clavier 11, bot 4, verdict) ; ml/bot/README.md l.663-664
- Avant : Neuf rapports écrits par des agents (… le rapport humains.md est signé Opus)  
  Apres : Neuf rapports, chacun signé « Rapport d'un agent (Opus) » ; les 28 défauts trouvés par quatre relecteurs, chacun contesté par un sceptique  
  Source : git show 67ea1f009:ml/ecurie/etude/*.md (ligne 3 de chaque rapport) et defauts-confirmes.md l.3
- Avant : annonce l'issue : pose, choc contre le décor, jauge d'air vide, chute  
  Apres : pose, lèvre, choc contre le décor, jauge vide, fond, portail ; mesuré avec le « voltigeur » (bot d'essai) ; il ne touche pas le jeu (110 contrôles)  
  Source : git log -1 384387572 ; git show 384387572:ml/ecurie/ETAPES.md l.39
- Avant : Sur un téléphone ou une petite carte graphique  
  Apres : Sur un téléphone ou une puce graphique intégrée  
  Source : passation/BOTS-ML.md l.207
- Avant : Contradiction entre deux sources : non tranchée ici.  
  Apres : La phrase « jamais tourné » a été écrite à 20 h 20 (1528cecf2), avant l'essai de 20 h 47, et 384387572 n'y a pas touché (ligne de contexte inchangée dans le diff) ; aucune trace de l'essai à blanc dans ml/labo/journal ; toujours non tranché  
  Source : git diff 1528cecf2 384387572 -- ml/ecurie/ETAPES.md ; grep 2026-11-24 ml/labo/journal/*.jsonl
- Avant : Premier essai de la clé d'API : « credit balance is too low »  
  Apres : ajout : les deux premières clés répondaient ainsi ; Sacha a posé une clé et dit que l'essai passe  
  Source : git show 1528cecf2:ml/ecurie/ETAPES.md l.40-41
- Avant : Claude a choisi la répartition des 200 €  
  Apres : Claude a écrit la répartition dans ETAPES.md ; aucune source lue ne dit que Sacha l'a validée  
  Source : git show 8620bac4b:ml/ecurie/ETAPES.md l.98-106
- Avant : La note de départ refaite en allégé : palier médian 9, meilleur 25  
  Apres : idem, précisé « courses de 900 s au plus »  
  Source : git show 8620bac4b:ml/bot/results/note-reference-allege.json (tmax 900, regime allege)
- Avant : ml/labo/arbre.html (dans git ; ce jour-là, un seul nœud)  
  Apres : le fichier actuel date du 25/11 ; la version du 24/11 se retrouve par git show 92fef5bd1:ml/labo/arbre.html  
  Source : ls -la ml/labo/arbre.html (25/11 20:00) ; git show 92fef5bd1 --stat
- Avant : Que ce soit le film d'essai de 39,9 s n'est pas vérifié.  
  Apres : Le rejeu de même graine (910407) dure 39,9 s, sur jade, mort à l'image 2 394 : c'est la course du film d'essai ; fichier non ouvert ; dossier ignoré par git (.gitignore l.76)  
  Source : ml/labo/rejeux/c0001-g910407.json ; passation/BOTS-ML.md l.194-195 ; git check-ignore
- Avant : radar-sombre.svg : une figure du radar  
  Apres : précisé « dans git »  
  Source : git ls-files ; git log ce5929035
- Avant : tableau : nitro 19 % / 63 %  
  Apres : ajout de la valeur exacte du fichier du 24/11 à 18 h 48 : 18,7 / 63,1 (le doute de l'auteur sur une réécriture n'avait pas lieu d'être : le fichier d'origine donne déjà 18,7)  
  Source : git show b5735be4e:ml/bot/results/discerner-reference-4-courses.json l.64-70

### Retiré

(rien)

### Manques

- Ajouté : la demande de Sacha du 24/11 « il faut que tu utilises les 200 euros dans ton plan » (passation/BOTS-ML.md, en-tête)
- Ajouté : le défaut n° 1, le « bac fermé » du cerveau qui laissait passer l'horloge et le hasard de Node, corrigé dans 1528cecf2 (defauts-confirmes.md, ml/bot/README.md l.66)
- Ajouté : les défauts restés ouverts le 24 au soir (les 4 des documents et le n° 7) (ETAPES.md à 1528cecf2)
- Ajouté : le canyon sans relief dans le simulateur, trouvé en route et laissé « à décider » (384387572)
- Ajouté : l'échec partiel du radar le 24/11, issue à l'image près 38 sur 41, roches de grotte et de jade manquées entre deux sondages (ml/bot/README.md, section 2 ter)
- Ajouté : --tmax porté à 900 s par défaut (180 avant), sinon un bot plafonnait vers le palier 15 (1528cecf2, ml/bot/README.md l.613)
- Ajouté : la réserve du juge (4 courses extrêmes, 11 parties au clavier seulement)
- Non ajouté : avec la main « clavier », le radar était juste 36 fois sur 50 à la première vue selon ml/bot/README.md (« le 24/11 »), mais la main à profil n'est entrée dans git que le 25/11 à 00 h 30 (1ca66a1bf) : date incertaine, laissée au chapitre du 25

### Verdict

Le chapitre était solide : tous les chiffres, heures, numéros de commit et citations relevés se retrouvent dans les sources (commits, passation/BOTS-ML.md, PLAN.md, ETAPES.md, discerner-reference-4-courses.json, note-reference-allege.json, paroles-sacha.md). Aucune invention, aucun secret ni adresse e-mail, et les attributions à Sacha sont prudentes et justes. J'ai corrigé des imprécisions : l'étalon à 14 parties daté de 18 h 31 et non du « soir », la puce graphique intégrée et non une « petite carte », la liste des issues du radar, la signature Opus des neuf rapports, et la répartition des 200 €, écrite par Claude et non « choisie ». J'ai surtout ajouté les réserves qui manquaient et qui rendent le dossier crédible. Le juge ne repose que sur 4 courses extrêmes. Le bac fermé ne l'était pas. Le radar ratait 3 issues sur 41, et le canyon du simulateur n'avait pas de relief. J'ai ajouté aussi la seconde phrase de Sacha sur les 200 €, et j'explique la contradiction sur l'essai à blanc sans la trancher. Tous les fichiers de « Ce qu'on peut montrer » existent. Ils sont dans git, sauf la vidéo, que .gitignore exclut. Reste un écart à la forme : le fichier fait environ 2 280 mots en tout, tableau et sources compris, au-delà des 1 500 demandés. La prose seule tourne autour de 1 700 mots, chiffre estimé et non compté. Je n'ai pas raccourci, pour ne pas perdre de réserves sourcées.

## 11. verifier:avant

*Rôle : vérificateur du chapitre « avant » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\00_avant-le-22-novembre.md

### Affirmations contrôlées

74

### Corrections

- Avant : ce champion finit 1 % des courses et meurt en vol 58 % du temps  
  Apres : ce champion finit 1 % des courses, avec 58 % de morts en vol  
  Source : 6cd575e0b (« 1 % d'arrivees, 58 % de morts en vol, 39 % du temps en l'air »)
- Avant : 98,9 % des morts restent des chutes contre 96,0 % au hasard  
  Apres : 98,9 % des morts surviennent en vol, contre 96,0 % au hasard  
  Source : RAPPORT-SESSION-2026-09-08.md §3.1 (« % morts en airtime »)
- Avant : Manches plus longues, durée proportionnelle à la piste : 10 330 → 11 801 m (présenté comme gain des manches plus longues)  
  Apres : La manche de 45 s cachait les crashs (0d2969e94), passe à 150 s puis à une durée proportionnelle ; le gain 10 330 → 11 801 m est mesuré contre la manche fixe de 150 s  
  Source : 0d2969e94, 15dcf1276
- Avant : Je n'ai pas vérifié si les deux écarts du 25 septembre ont été rattrapés  
  Apres : Ils ne l'ont pas été : la dernière version de train.html (6cd575e0b, 20/10) garde SPD=0.5 et AIR_ASSIST=1.0, et le README du 20/10 ne les cite pas parmi les écarts connus  
  Source : ml/train/train.html lignes 8464 et 8466 ; git log -- ml/train/train.html ; ml/train/README.md
- Avant : L'un cite « Fable », un autre une sonde « hermes-verify », un troisième un agent « hermes » : qui a écrit ces commits-là n'est pas vérifié  
  Apres : Le commit qui cite « hermes » (a1ff192cf) porte la mention Claude Opus 5 ; restent non signés e62f924f4 (« Fable ») et 56d5b0fea (« hermes-verify »). Précisé aussi : commits de septembre enregistrés au nom du compte git de Sacha, ceux d'octobre au nom « Claude » ; 5c88ca73b (27/09) porte Opus 5.5  
  Source : git log --format='%an' et lignes Co-Authored-By
- Avant : Noter sur 3 pistes : ÉCARTÉ ; la piste change à chaque génération à la place  
  Apres : ÉCARTÉ le 8/09, mais réactivé par défaut le lendemain (EVAL_TRACKS 1->3) sans nouvelle mesure citée  
  Source : e0f191460, 79b1eed60
- Avant : Un pilote au sol écrit à la main (présenté comme un choix de Claude)  
  Apres : idée de Sacha (« Idée §7.4 du propriétaire »)  
  Source : 7edd02361
- Avant : Claude a choisi les réseaux, les notes, les essais  
  Apres : la plupart des essais (le pilote au sol et le test « pas besoin de cerveau » viennent de Sacha)  
  Source : 7edd02361 ; RAPPORT-SESSION §3.2
- Avant : un ménage a effacé deux sessions de jeu (source 078d382b2 seule ; « deux agents écrivaient dans le même fichier » sans source)  
  Apres : deux agents écrivaient dans train.html en même temps ; un commit de rangement a effacé un dossier de résultats et deux sessions de Sacha  
  Source : ml/train/README.md §1 ; c8e69beb0 ; 078d382b2
- Avant : double appui dans une fenêtre de 300 à 420 ms ; se poser à moins de 20°  
  Apres : « dans une fenêtre de 300/420 ms » (citation exacte) ; à moins de 20° de la fin  
  Source : passation/BOTS-ML.md §1
- Avant : Le jeu changeait chaque semaine  
  Apres : Le jeu changeait (route élargie le 26/09, gravité x1,45 le 15/10, figures sur la route le 17/10, drift du 19/10)  
  Source : 71bac35b6, ecbb531a5
- Avant : a lu une vitesse plafonnée (140 km/h annoncés, 243 réels)  
  Apres : idem, « erreur repérée par Sacha » + 8e point « Sacha a trouvé plusieurs problèmes avant moi »  
  Source : RAPPORT-SESSION §6, points 4 et 8
- Avant : CRITIC-REPORT : 83 verdicts jusqu'au 25 septembre  
  Apres : 83 verdicts, du 9 au 25 septembre (compté : 83 titres « ## VERDICT », du 39e passage le 09/09 au 123e le 25/09)  
  Source : ml/train/CRITIC-REPORT.md
- Avant : record 3 616 m (sans précision)  
  Apres : record 3 616 m en 40 s (génération 43) ; le commit dit « ~3,4 km (gen 40+) » pour la courbe  
  Source : champion-reel-g1.json {gen:43, dist:3616} ; pop-reel-g1.json hist (57 valeurs)
- Avant : la course se joue dans le vrai jeu, plus dans une copie  
  Apres : dans le vrai jeu, comme ml/reel, plus dans une copie comme ml/train ; le moins bon viré sur sa note cumulée  
  Source : SPECIFICATION.md §0 ; 6f77d2678
- Avant : (absent) ce que train.html est  
  Apres : paragraphe ajouté : train.html est une copie complète du jeu de juillet ; la physique a été unifiée À L'INTÉRIEUR de cette copie le 8/09, mais la copie entière n'a pas suivi le jeu publié (sinon le lecteur voit une contradiction entre « copie supprimée » et « la copie a divergé »)  
  Source : ml/train/README.md ; c7d78845a ; 6f77d2678
- Avant : (absent) la note de ml/train ; forme de sélection de ml/reel  
  Apres : note = distance + bonus d'arrivée ; ml/reel : moitié la moins loin remplacée par des enfants mutés, sans croisement  
  Source : 79b1eed60 ; ml/reel/entrainer.js lignes 56-64 ; HANDOVER §6 (croisement + mutation pour ml/train)

### Retiré

- « son effet n'est pas chiffré dans le commit » reformulé en « n'est chiffré dans aucune source lue » (pas d'affirmation retirée faute de source : toutes les autres ont été retrouvées)

### Manques

- AJOUTÉ : la sélection « moitié la plus nulle » apprend : graine 7, 64 m -> 3 711 m en 25 générations (f31fd3094), la seule réussite nette de septembre
- AJOUTÉ : la règle de Sacha « physique STRICTEMENT isomorphe », « répétée 4× par Sacha » (COMPTE-RENDU.md §1)
- AJOUTÉ : la demande de Sacha « exactement les mêmes contrôles et habiletés que le joueur » (5cffd892e)
- AJOUTÉ : la copie payait les figures même au crash, d'où un champion freestyle qui faisait « figure puis explosion » (71bac35b6)
- AJOUTÉ : la manche de 45 s cachait les crashs et rendait le bonus d'arrivée inutile (0d2969e94)
- AJOUTÉ : la sélection par vitesse essayée puis annulée (2 120 m contre 2 660, 37aeae373)
- AJOUTÉ : le champion de course réentraîné du 20/10 (63 % d'arrivées, 0 figure en l'air) dans la liste des essais, pas seulement dans le tableau
- AJOUTÉ : ml/reel, les 3 morts sur 6 pistes sont des morts en vol
- AJOUTÉ : la leçon de persistance appliquée le 20/10 (run coupé à la génération 280 par un redémarrage, progression sauvée, 9dba1584c)
- NON AJOUTÉ : le détecteur de raccourci réglé pour une géométrie que le générateur ne produit pas (0,6 % de candidats retenus, 0 % en course réelle, 078d382b2) ; pertinent mais hors longueur
- NON AJOUTÉ : le record pré-drift de septembre (11 226) et les runs drift du 20/10 (7fed399f7 : poses 36 %)
- NON AJOUTÉ : le « 0 bonne coupe » qui était un bug de mesure (17ccb1a91, leçon : vérifier qu'un chiffre peut prendre une autre valeur)

### Verdict

Chapitre solide sur le fond : la quasi-totalité des chiffres, dates et numéros de commit se retrouvent dans les sources, et les 5 fichiers de « Ce qu'on peut montrer » existent et sont suivis par git (21 fichiers run-seed avec un champ courbe, vérifiés ; paroles-sacha.md et ml/evolution sont hors git, ce que le chapitre dit maintenant). J'ai trouvé deux erreurs de lecture : « meurt en vol 58 % du temps » (en réalité 58 % des morts surviennent en vol) et le gain des manches proportionnelles, mesuré contre 150 s et non contre 45 s. J'ai aussi trouvé des attributions incomplètes : deux idées de Sacha (le pilote au sol, le test « pas besoin de cerveau ») étaient mises au compte de Claude, et le commit qui cite « hermes » était présenté à tort comme non signé. J'ai levé un doute déclaré : les écarts SPD et AIR_ASSIST du 25/09 n'ont jamais été rattrapés dans train.html. J'ai ajouté un paragraphe qui explique ce qu'est train.html : sans lui, « copie supprimée » et « la copie a divergé » se contredisent pour un lecteur qui ne programme pas. Aucun secret, aucune adresse e-mail, aucun ton publicitaire. Il reste un défaut : la prose fait environ 1 860 mots (environ 2 470 avec le tableau et les sources), au-dessus de la cible de 1 500, à cause des ajouts. Je n'ai fait aucun commit.

## 12. verifier:n25

*Rôle : vérificateur du chapitre « n25 » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-25.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-25_suite.md

### Affirmations contrôlées

118

### Corrections

- Avant : à 13 h 27, Sacha a découvert que ce travail [la relecture de la nuit] avait vidé son abonnement  
  Apres : à 13 h 27, Sacha a découvert que le travail de Claude avait vidé son abonnement (la phrase d'ouverture contredisait le « probable, non vérifié » du corps du chapitre)  
  Source : ml/ecurie/PASSATION.md l.82 (ne nomme pas le workflow) ; paroles-sacha.md 25/11 12:27 UTC
- Avant : un coup de volant sur quatre partait du mauvais côté  
  Apres : un appui sur quatre partait du mauvais côté  
  Source : ml/ecurie/ETAPES.md l.467
- Avant : (absent) la mesure de 0 h 30 et l'origine de l'erreur de compte  
  Apres : À 0 h 30 la main mesurait 84,7 coups/min contre 111,3 ; ce compte des joueurs était faux (0,1 s par échantillon au lieu de 0,11) : 101,6  
  Source : commit 1ca66a1bf ; ETAPES.md l.467-470
- Avant : la chaîne retire de son environnement tout ce qui vient de la session ouverte et n'y remet que la clé d'API  
  Apres : agent-api.js retire de l'environnement de l'agent les variables propres à Claude et Anthropic, n'y remet que la clé d'API, et coupe la session si elle annonce une autre source de paiement  
  Source : ml/ecurie/agent-api.js en-tête et l.55-56, l.68
- Avant : « Fable » est le modèle de Claude de son abonnement. (sans source)  
  Apres : même phrase, sourcée par « j'ai récupéré mon abonnement Fable »  
  Source : paroles-sacha.md 26/11 11:56 UTC
- Avant : contrôle final : verifier.js passe, 5 rejeux  
  Apres : ajout : il passe aussi pour la première fois en version allégée (388 s)  
  Source : commit a732824c7
- Avant : contrôle d'Opus : 11,5 et 18 contre 7 et 16  
  Apres : ajout : mieux sur 7 parties sur 8  
  Source : agents/2026-11-25T13-39-09-finitions-b.md
- Avant : (absent) changement de signature des commits  
  Apres : À partir de 13 h 31, les commits hors agents sont signés Claude Opus 5.5 et non plus Fable 5.2 ; raison non écrite  
  Source : git log -1 --format=%B 29c4e8c8c, 09e45dddd, 4729c99ae, c4dc69655
- Avant : La chaîne a fait écrire six variantes du premier pilote à chacun des quatre modèles  
  Apres : La chaîne a demandé six variantes à chacun des quatre modèles (Fable n'en a rendu aucune)  
  Source : ml/ecurie/agents/sortie-calibrage-fable.log ; depenses.jsonl
- Avant : La salle de projection ... corrigée (sans dire à quoi elle répondait ni qui l'a corrigée)  
  Apres : ajout de la question de Sacha à 18 h 18 « y a un moyen pour moi de tester les bots ? » ; correction faite par la session principale, pas par un agent payé  
  Source : paroles-sacha.md 25/11 17:18 UTC ; commit 4729c99ae (signé Claude Opus 5.5, aucun rapport d'agent à cette heure)
- Avant : La règle du rythme comptait toutes les dépenses du jour, agents compris ... jusqu'au 26/11  
  Apres : La règle comparait toutes les dépenses depuis le 25/11, agents compris, à 14 € par jour écoulé ; le pilote et les finitions avaient déjà pris 20,34 € ; attente jusqu'au 26/11 à 12 h 55 (heure de Paris), où la chaîne repart  
  Source : git show 29c4e8c8c:ml/ecurie/chaine.js l.70-71 ; agents/chaine.log (heures UTC)
- Avant : coût des agents du soir : 0,34 + 0,71 + 3,83 + 7,07 (sans unité)  
  Apres : 0,34 + 0,71 + 3,83 + 7,07 = 11,95 $ (inscrits en €)  
  Source : ml/labo/journal/depenses.jsonl
- Avant : (absent) l'outil apres.js  
  Apres : l'agent des images a été démarré par apres.js dès que l'agent de la page a fini  
  Source : commit c4dc69655 ; agents/apres-images.log

### Retiré

(rien)

### Manques

- La question de Sacha à 18 h 18 (« y a un moyen pour moi de tester les bots ? »), qui précède la réparation de la salle de projection : AJOUTÉE.
- La mesure de 0 h 30 (84,7 coups/min contre 111,3) et la cause de l'erreur sur le compte des joueurs (0,1 s par échantillon au lieu de 0,11) : AJOUTÉES.
- Le passage des signatures de commit de Fable 5.2 à Opus 5.5 après l'incident : AJOUTÉ, sans en donner de cause puisque aucune source n'en donne.
- verifier.js passé pour la première fois en version allégée (388 s) : AJOUTÉ.
- apres.js, l'outil qui enchaîne les agents : AJOUTÉ.
- Non ajouté : la justesse du radar avec la main clavier (50/55 à la première vue, 55/55 façon tenue, 41/43 une seconde avant la fin, 59cdc22d2), pour ne pas allonger.
- Non ajouté : le défaut du vrai jeu trouvé par la relecture (cyNiveauEau manque au travailleur du canyon, « à transmettre au chantier du jeu », ETAPES.md). Il mériterait une ligne.
- Rien ne dit si la question de l'agent du choix (arrêter l'étape C à 90 € ?) a reçu une réponse. Le chapitre la laisse ouverte, ce qui est exact.

### Verdict

J'ai recontrôlé chaque chiffre, heure, citation, commit et fichier des deux chapitres dans leur source. J'ai ouvert les 22 commits du 25/11 (heure +0100), ainsi que paroles-sacha.md (UTC), chaine.log (UTC), depenses.jsonl, les sept rapports d'agents, ETAPES.md, PASSATION.md, l'en-tête de pilote.js, agent-api.js, chaine.js au commit 29c4e8c8c, boucle.js (max_tokens 32000) et les titres des comptes rendus et de index.html. Je n'ai trouvé aucun chiffre faux. Les coûts se recomptent exactement : 20,34, puis 24,97, puis 36,92 ; le calibrage fait 4,63 ; les moyennes de tri valent 10,75, 11,0 et 9,3. Toutes les citations de Sacha sont fidèles, avec la bonne conversion UTC+1. Les doutes de l'auteur sont fondés et bien traités. Sur l'abonnement, je n'ai trouvé aucune source qui nomme le workflow de 152 agents. Les messages de 12:31, 13:39, 17:45, 17:47, 19:01 et 19:12 UTC sont bien des consignes de Claude, pas des paroles de Sacha. Mes corrections portent sur des imprécisions. La phrase d'ouverture affirmait la cause du quota vidé que le corps dit « non vérifiée ». On lisait « coup de volant » au lieu d'« appui ». L'effacement des variables était attribué à « la chaîne » au lieu d'agent-api.js. La règle du rythme était décrite « du jour » alors qu'elle est cumulative. Une somme n'avait pas d'unité. J'ai aussi ajouté quelques faits manquants. Les fichiers de « Ce qu'on peut montrer » existent tous. Dans git : pilote.js, les rapports .md, les deux comptes rendus, index.html, les 10 SVG, figures.js, radar-course.js, donnees/*.json.gz, arbre.html et depenses.jsonl. Hors git : chaine.log, les .jsonl des agents, les sorties-calibrage, et les films webm (exclus par .gitignore l.76 ; 25 Mo pour c0003-g910629). Le chapitre ne contient ni secret ni adresse e-mail. Il reste un défaut que je n'ai pas réglé : la longueur. Selon wc -w, tableaux compris, le premier fichier compte environ 1840 mots et la suite environ 1650, au-dessus des 1500 demandés. Il faudrait raccourcir la prose ou les tableaux si la limite est stricte. Je n'ai fait aucun commit et je n'ai rien lancé.

## 13. verifier:n27

*Rôle : vérificateur du chapitre « n27 » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-27.md

### Affirmations contrôlées

68

### Corrections

- Avant : Le matin, la méthode était celle du plan du 22/11 (`passation/BOTS-ML.md`) : Claude modifie le pilote…  
  Apres : plan du 21/11 (titre « BOTS ML — le plan (2026-11-21) », étape 0 faite le 22/11) : Claude écrit le pilote, le vrai jeu le note, Claude lit les échecs et réécrit ; ce plan écartait exprès les mutations au hasard  
  Source : passation/BOTS-ML.md, en-tête et §1-2
- Avant : 0 voudrait dire « identique »  
  Apres : 0 veut dire « au milieu des joueurs », et un vrai joueur comparé aux autres est à 0,9  
  Source : ml/bot/README.md, ligne ressemblance.js
- Avant : Nitro au sol : GARDÉ, palier médian 7,5 (sans le prix payé)  
  Apres : ajout du prix : un demi-palier ; palier médian 7,5 et record 14 contre 8,5 et 19 la veille au soir  
  Source : commit 1ee936e15 (« pour un demi-palier ») ; ml/ecurie/ETAPES.md, grande note du réglage gardé
- Avant : « je lance la boucle sur le Ryzen »  
  Apres : « je lance la boucle sur le Ryzen, continue sans t'arrêter » (citation complète) et nom de la boucle (ml/ecurie/boucle.js)  
  Source : paroles-sacha.md 27/11 13:40 ; passation/BOTS-ML.md
- Avant : La méthode de 15 h 25 citée sans la question finale  
  Apres : ajout de « laisse tomber la vidéo » en tête et de la question « Tu penses que c'est adapté à mon objectif d'avoir les meilleurs bots possible ? », à laquelle répond la spécification  
  Source : paroles-sacha.md 27/11 15:25 ; SPECIFICATION.md §0
- Avant : Pourquoi c'est différent de septembre-octobre : dans ml/train, 24 voitures… apprenaient de zéro  
  Apres : Ce n'est pas la première sélection du chantier : de juillet à septembre, ml/train remplaçait déjà la moitié la moins bonne à chaque manche ; le 20 octobre, ml/reel faisait évoluer (entrainer.js = « l'évolution ») un réseau de 16 neurones. La différence : départ du pilote qui vole, note palier + ressemblance, bruit mesuré  
  Source : ml/train/README.md (début) ; ml/reel/README.md (tableau des fichiers) ; passation/BOTS-ML.md §1 (« juillet → septembre », « 20 octobre »)
- Avant : L'écart… 0,88 de corrélation d'un lot à l'autre ; 140 courses pour un palier  
  Apres : 0,88 (0,71 en rangs, Spearman) ; 140 courses pour un palier moyen, 216 pour le palier médian  
  Source : bruit/resultats.txt §1, §3, §4
- Avant : Virer le dernier sur une seule manche de 12 courses reviendrait à tirer au sort  
  Apres : c'est « tirer au sort à 60 % » ; spécification relue par Fable ; l'essai d'octobre « non revérifié ici »  
  Source : SPECIFICATION.md §0 ; LISEZ-MOI.md
- Avant : Quatre gestes y portent en toutes lettres le verdict « à essayer »  
  Apres : Le LISEZ-MOI annonce « six gestes à essayer » ; on n'en trouve que quatre avec ce verdict écrit (le désaccord est dit)  
  Source : PROPOSITIONS.md (lignes VERDICT : a essayer ×4) ; LISEZ-MOI.md
- Avant : des développeurs (« dév. 2 » à « dév. 5 »)  
  Apres : du « développeur 1 » au « dév. 5 »  
  Source : ml/evolution/INTERFACES.md §2.2 (« Précisions du développeur 1 ») et §2.3-2.10
- Avant : six enfants naissent, copies modifiées des meilleurs  
  Apres : copies modifiées de parents choisis parmi les mieux notés (tournoi de 3)  
  Source : SPECIFICATION.md §7
- Avant : pose à 0,46 rad (environ 26°) de l'axe de la route  
  Apres : se pose à 0,46 rad de l'axe que le radar annonce (le commit dit « d'axe annoncé »)  
  Source : commit 49012f2d9
- Avant : crédits API : rien le 27/11 ici  
  Apres : dernière dépense le 25/11 (26 lignes, total 36,92 €)  
  Source : ml/labo/journal/depenses.jsonl (recalculé)
- Avant : « Journée encore en cours… (fin d'après-midi) »  
  Apres : (soirée) : le commit 033bfebeb est de 18 h 19 et les fichiers de ml/evolution datent jusqu'à 18 h 25  
  Source : git log ; ls -la ml/evolution

### Retiré

(rien)

### Manques

- Le prix de la nitro gardée : record 19 → 14, palier médian 8,5 → 7,5 (ajouté)
- Le message de Sacha à 14 h 31 sur l'ultracode (« mais je t'ai mis en ultracode, c'est pas le but justement ») : il précise que l'ultracode sert à déléguer aux agents (ajouté, source paroles-sacha.md + menager-fable-utiliser-opus.md)
- La question de Sacha à 17 h 11 sur le nom de la méthode (« genetic algorithm ? ») : ajoutée en tête de « La méthode », avec la mention que la réponse n'est pas dans les sources
- ml/train et ml/reel étaient DÉJÀ des sélections / évolutions : l'ancien texte laissait croire que la sélection était nouvelle (ajouté)
- Le plan d'origine rejetait exprès les mutations au hasard sur des touches brutes (ajouté, passation/BOTS-ML.md)
- Les attentes honnêtes de la spécification (une nuit : écart 1,67 → ~1,5 sans gain de palier démontrable ; une semaine : 1,2-1,4 et +1 à +2 paliers au mieux, puis un plateau), demandées par la commande : ajoutées au tableau
- Le démenti du slalom par le vérificateur de l'enquête 3 (1,16 et 0,80 s par aller sur deux graines neuves, au lieu de 0,70) : ajouté comme impasse
- La décision de remplacer entièrement la boucle payante par la sélection (SPECIFICATION.md §0) : ajoutée aux décisions
- Non ajouté : le message de 12 h 58 (une question sur quoi lancer sur le Ryzen, qui dit que le Ryzen redonne l'empreinte a7b3171768ca) ; c'est une consigne envoyée à un agent, qui n'est pas forcément écrite par Sacha

### Verdict

Le chapitre était solide : la plupart des chiffres, heures et citations se retrouvent mot pour mot dans les commits 1ee936e15, 49012f2d9 et 033bfebeb, dans paroles-sacha.md, bruit/resultats.txt, SPECIFICATION.md, PROPOSITIONS.md, ETAPES.md et les notes de mémoire. Les doutes déclarés par l'auteur sont tous fondés et sont traités honnêtement dans le texte : le résultat du Ryzen n'est pas vérifié ; la phrase sur Fable et Opus ne vient que d'une note ; il y a quatre gestes « à essayer » et non six ; le nombre d'agents n'est pas donné ; la réponse de 15 h 42 est non tranchée.

Deux erreurs de fond sont corrigées. D'abord, le plan d'origine est du 21/11, pas du 22/11. Ensuite, et c'est plus important, le texte laissait croire que la sélection était nouvelle, alors que ml/train (de juillet à septembre) et ml/reel (le 20/10) étaient déjà des évolutions. La vraie différence est le départ hybride, la note qui mêle palier et ressemblance, et le bruit mesuré avant de lancer.

Ajouts : le prix de la nitro gardée, la phrase de Sacha sur l'ultracode, sa question de 17 h 11, les attentes honnêtes de la spécification, le démenti du slalom par son vérificateur, et le remplacement de la boucle payante par la sélection.

Les fichiers à montrer existent. Tout ml/evolution/ est hors git, et essais/ est ignoré par son .gitignore. bruit/resultats.txt et la page portfolio (avec ses SVG) sont suivis par git. Aucun secret ni adresse e-mail dans le chapitre.

Le chapitre dépasse la longueur prévue : environ 2 000 mots en comptant le tableau et les sources, pour 1 500 au plus demandés. Je n'ai pas raccourci, pour ne pas perdre de faits sourcés : à resserrer si la limite compte.

Aucun commit, aucune course lancée. Seul le fichier ml/ecurie/portfolio/journal/2026-11-27.md a été modifié.

## 14. verifier:methode

*Rôle : vérificateur du chapitre « methode » : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\comment-on-a-travaille.md

### Affirmations contrôlées

74

### Corrections

- Avant : L'empreinte de verifier.js vaut a7b3171768ca « depuis le 25/11 »  
  Apres : depuis l'étape 1, le 23/11 (3317b893a)  
  Source : git log -S a7b3171768ca -- ml (premier commit 3317b893a, 23/11 20:06)
- Avant : Compte rendu à chaque fin de session : GARDÉE  
  Apres : Deux comptes rendus, tous deux du 25/11 (a35ece70f, cfeef13b2), aucun les 26 et 27/11 : TENUE DEUX FOIS, PUIS LAISSÉE  
  Source : git log -- ml/ecurie/comptes-rendus ; ls comptes-rendus/
- Avant : ml/ecurie/portfolio/index.html et ses 10 figures SVG  
  Apres : 5 figures SVG, chacune en version claire et sombre (10 fichiers)  
  Source : ls ml/ecurie/portfolio/images ; git ls-files
- Avant : 7 consignes et 7 rapports : la commande et la réponse, côte à côte  
  Apres : côte à côte pour six agents ; la consigne « voltige » n'a pas de rapport, le rapport « essai » n'a pas de consigne  
  Source : ls ml/ecurie/consignes-agents ml/ecurie/agents
- Avant : l'agent du choix du modèle refuse de couronner le seul gain du calibrage  
  Apres : le gain ne tient pas sur graines neuves (validation automatique) ; l'agent le classe « exactement l'ampleur du hasard »  
  Source : agents/2026-11-25T17-47-10-choix-modele.md, l. 16 et 22
- Avant : Opus renote sur 8 courses... les mêmes courses que dans la note de Fable  
  Apres : ajout : un contrôle du calcul, pas une mesure sur graines neuves  
  Source : agents/2026-11-25T13-39-09-finitions-b.md, l. 53-62
- Avant : Sélection au hasard déjà essayée « en septembre et octobre » (ml/train)  
  Apres : BOTS-ML.md dit « juillet → septembre » (300 générations, 0 figure, 9 % de poses, copie du jeu divergée) ; git garde des essais du 07/09 au 20/10  
  Source : passation/BOTS-ML.md l. 26 ; git log -- ml
- Avant : Un champion n'est sacré qu'après 20 graines qu'aucun cerveau n'a vues  
  Apres : 20 graines neuves (jamais utilisées pour le tri), contre la barre du parent sur ces mêmes graines  
  Source : ml/ecurie/ETAPES.md l. 478
- Avant : La chaîne n'a payé aucune tranche (sans plus)  
  Apres : ajout : chaine.log montre une tranche-1 démarrée le 26/11 à 11:55 UTC, journal arrêté pendant la note du pilote de départ, sans dépense  
  Source : ml/ecurie/agents/chaine.log l. 162-167 ; chaine-etat.json
- Avant : La boucle payante classait donc des pilotes surtout au hasard (inférence)  
  Apres : citation de la spécification : renvoyer le dernier d'une manche « c'est tirer au sort à 60 % »  
  Source : etude/selection-naturelle/SPECIFICATION.md l. 16-17
- Avant : plan « daté du 21/11 »  
  Apres : daté du 21/11 en tête, entré dans git le 22/11 (d2ee1f114)  
  Source : passation/BOTS-ML.md l. 1 ; git show --stat d2ee1f114
- Avant : l'étalon compte 14 parties  
  Apres : 14 sur les 20 prévues, barre provisoire, au 24/11  
  Source : passation/BOTS-ML.md l. 6
- Avant : Claude s'en tient à ses trois remarques  
  Apres : Claude allait traiter ses seules trois remarques (formulation de la note de mémoire)  
  Source : memory/inventaire-complet-avant-de-corriger.md
- Avant : 28 défauts « chacun contesté par un sceptique »  
  Apres : trouvés par 4 relecteurs (Opus), « chacun contesté par un sceptique qui a relu le code »  
  Source : ml/ecurie/etude/defauts-confirmes.md, en-tête
- Avant : le refus de l'app (26/11) sourcé par 1e148ee05 seul  
  Apres : source ajoutée : mémoire ecurie-argent-et-lancement-des-agents.md (le commit ne parle pas du refus)  
  Source : git log -1 1e148ee05 ; memory
- Avant : Son fichier de consignes le disait déjà  
  Apres : depuis le 24/11, avec la phrase « Ne t'arrête pas pour lui demander un clic ou un choix sans risque »  
  Source : CLAUDE.md global de Sacha, section Autonomie (24/11/2026)

### Retiré

- « qu'aucun cerveau n'a vues » (embellissement de « graines neuves »)
- « refuse de couronner » (le refus est la règle automatique de validation, pas une décision de l'agent)
- La liste redondante des décisions de Sacha (déjà datées et citées dans « Les règles »), remplacée par un renvoi plus les décisions manquantes

### Manques

- Ajouté : la règle de la note de passation (26/11 11:56, « fais-moi une note de passation » -> ecd9eeccd, PASSATION.md)
- Ajouté : le mode « ultra code » activé par Sacha le 24/11 à 19:43, et ses messages du 27/11 à 14:31 et 14:33 (« mais je t'ai mis en ultra code, c'est pas le but justement », « ton plan de base avait jugé ça inutile ? ») ; la conclusion de Claude : des vagues d'agents mesurées, « pas un essaim de 152 »
- Ajouté : la demande de Sacha du 25/11 (19:00, 19:07) qui a produit les agents « portfolio » et « images »
- Ajouté : l'abandon de la vidéo du meilleur bot (27/11 15:25) et la question de Sacha à 15:42 « du coup j'arrête les essais sur le Ryzen ? »
- Ajouté au tableau : l'agent « essai » (0 $), le total des 7 agents (32,29 €), le coût d'une session principale sans agents (3 à 4 % de la semaine, PASSATION.md)
- Ajouté dans « Ce qu'on peut montrer » : ml/ecurie/etude/selection-naturelle/ (dans git depuis 033bfebeb) et le journal lui-même (hors git pour l'instant)
- Non ajouté (signalé) : la phrase « il faut que tu utilises les 200 euros dans ton plan » (24/11, citée par BOTS-ML.md et PLAN.md, absente de paroles-sacha.md)
- Non ajouté : le 20/10, un mode à part de ml/train a sorti un champion « freestyle » (23 bots sur 24 font des figures, 7cfdb6ec9), ce qui nuance le « 0 figure » de BOTS-ML.md ; à traiter dans le chapitre d'avant novembre
- Non vérifié : le journal des dépenses du Ryzen, le résultat de la boucle lancée le 27/11, la facture réelle en euros

### Verdict

J'ai corrigé le chapitre en place. Le fond tient : toutes les citations de Sacha se retrouvent dans paroles-sacha.md, avec les bonnes heures UTC. Les phrases tirées des notes de mémoire sont bien signalées comme telles. Les coûts et plafonds des agents (11,63 $ / 25, 8,71 $ / 20, 0,34 $ / 2, 0,71 $ / 4, 3,83 $ / 6, 7,07 $ / 10) correspondent aux rapports et à chaine.log. Le total de 36,92 € (26 lignes, toutes du 25/11) et le calibrage (4,63 €, 19 appels) correspondent au journal des dépenses. Le décompte des commits (50, dont 33 Fable, 7 Opus, 6 Claude et 4 sans signature) est exact. Les heures 12:29, 13:31 et 18:19 sont exactes.

Les erreurs trouvées : la date de l'empreinte (23/11, pas 25/11) ; « 10 figures » au lieu de 5 figures en deux versions ; la règle du compte rendu présentée comme tenue alors qu'il n'y en a eu que deux, tous deux du 25/11 ; une attribution forcée à l'agent du choix du modèle ; des dates approximatives pour ml/train ; une phrase sur les graines neuves embellie. J'ai aussi ajouté les manques : la note de passation, l'épisode « ultra code », la commande du portfolio par Sacha, l'abandon de la vidéo, la question restée ouverte sur le Ryzen, et la tranche-1 démarrée le 26/11 sans dépense.

Fichiers à montrer : tous existent. Sont dans git : les consignes, les rapports .md, choix.json, les comptes rendus, la page portfolio, ses SVG et arbre.html. Sont hors git : les vidéos .webm, paroles-sacha.md, les .log, les .jsonl, ml/evolution/ et le journal lui-même. Aucune clé, aucune adresse e-mail, aucun chemin vers un fichier de secrets.

Reste à dire : le texte fait environ 2000 mots avant le tableau, au-dessus des 1500 demandés. Les noms de fichiers cités comptent dans ce total, et les ajouts demandés par la vérification l'ont allongé.

## 15. sommaire

*Rôle : auteur du sommaire : le fil du récit, la frise, le registre des impasses, les pièces à montrer. Phase : Sommaire.*

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\MODELE-D-ENTREE.md

### Impasses recensées

50

### Résumé

J'ai écrit deux fichiers dans ml/ecurie/portfolio/journal/, rien d'autre. Aucun commit, aucune course lancée, aucun appel réseau.

(A) LISEZ-MOI.md, la porte d'entrée du journal, en huit parties :
1. Le chantier en dix lignes, état au 27/11 : écart aux joueurs 1,67, juge à 0,97, sélection naturelle construite mais jamais lancée, 36,92 € sur 200.
2. Le fil daté des changements de méthode, avec un schéma en texte : ml/train en septembre, ml/reel le 20/10, le plan du 22/11, le nouveau but du 24/11, la boucle payante du 25/11, le réglage à la main du 26/11, la sélection hybride du 27/11. Pour chacun : ce qui l'a provoqué et qui l'a décidé.
3. Le registre des impasses : 50 lignes, tous chapitres confondus, chacune avec la date, la mesure qui tranche et le chapitre.
4. Les décisions de Sacha, datées de septembre au 27/11 17:14 UTC, avec ses phrases, orthographe rectifiée.
5. Dix chiffres qui résument, chacun avec sa source et son chapitre.
6. L'inventaire de ce qu'on peut montrer, vérifié avec ls et git ls-files. Hors git : les 4 films .webm, ml/evolution/, tmp-voltige/paroles-sacha.md et le journal lui-même. N'existent pas encore (plan, sections 5.2 et 5.3) : bêtisier, cartes de génération, planches, duels côte à côte, courbes par génération, jalons (ml/labo/jalons/ absent), film avec l'affichage du jeu.
7. La table des 9 fichiers du journal.
8. Comment le journal est tenu.

(B) MODELE-D-ENTREE.md : les règles, le gabarit Markdown, une ligne d'explication et un exemple court par rubrique (les exemples inventés sont marqués « fictif »), puis huit choses à ranger au fil de l'eau (chiffres sourcés, essais écartés, phrase de Sacha, pièces montrables, coût, qui a fait quoi, questions ouvertes, erreurs de Claude).

Choix et réserves :
- Toutes les heures des messages de Sacha sont données en UTC, alors que le chapitre du 25/11 les donne à l'heure de Paris.
- Je n'ai mis dans le sommaire que des chiffres présents dans les chapitres. Exception : l'inventaire, où l'existence des fichiers a été contrôlée par moi.
- Je signale dans le LISEZ-MOI que la plupart des chapitres dépassent les 1 500 mots.
- Le résultat de la boucle lancée sur le Ryzen et la réponse à « j'arrête les essais sur le Ryzen ? » restent non vérifiés.

## 16. critique

*Rôle : critique : cherche ce qui manque encore au dossier et tire des chiffres au hasard pour les recontrôler. Phase : Critique.*

### Contrôle

Justes : 21
Fausses : 3
Introuvables : 1

### Corrections

- comment-on-a-travaille.md : « Elle entre dans git une heure plus tard (ecd9eeccd, 12 h 56 à Paris) » était faux. Le message de Sacha est à 11:56 UTC et le commit à 12:56 +0100, c'est-à-dire la même minute. Corrigé en « à la même minute (… soit 11:56 UTC) ».
- 2026-11-27.md : le chapitre présentait comme un fait « de juillet à septembre, ml/train… après 300 générations, 0 figure et 9 % de poses réussies ». Le chapitre 00 et 5799d5bb1 le contredisent : git ne garde la trace qu'à partir du 07/09, les 9 % datent du 08/09 et le run de 300 générations donne 39 % de poses. Réécrit avec la source.
- 2026-11-25_suite.md : la chaîne n'écrivait pas « 26.02 € dépensés, 14 € permis » jusqu'au 26/11. chaine.log passe à 36.92 € contre 14 € dès 19:49 UTC, puis à 36.92 € contre 28 € le 26/11. Le log est en UTC. Phrase corrigée.
- LISEZ-MOI.md § 6 et 2026-11-26.md : le chiffre de « 358 fichiers » pour tmp-voltige ne se retrouve pas. Le dossier en compte 525 au soir du 27/11. Remplacé par 525, avec la mention que le dossier grossit encore.
- comment-on-a-travaille.md : la citation de BOTS-ML (« 9 % de poses réussies ») est maintenant suivie de la précision 08/09 contre 39 % (5799d5bb1), comme dans le chapitre 00.
- 2026-11-27.md, cohérence : « plan du 21/11 » devient « plan du 22/11 (daté du 21/11 dans son titre) », comme dans le sommaire. « ultracode » devient « ultra code », comme dans LISEZ-MOI et comment-on-a-travaille.
- comment-on-a-travaille.md : le détail privé « ([détail privé retiré]) » est retiré du tableau des chiffres et remplacé par « (ce PC) ».

### Commits oubliés

- 12a487868 (10/09) « Réparer la mesure » : après e62f924f4, le record et la courbe suivaient le rang (0 à 23) et plus la distance. C'est une erreur de mesure de Claude, du même ordre que celles listées dans le chapitre 00, et elle n'est pas racontée.
- f04968496 (09/09) : la sauvegarde sans écran plantait à la génération 10, donc « tous les runs multi-train échouaient ». Le chapitre 00 cite a1ff192cf (entraînements perdus) mais pas ce plantage, qui est la cause technique.
- 71008e4a5 (09/09) : la grille spatiale corrigée (« recul vol ~x16 ») et le drapeau FLYFIX pour mesurer le correctif de vol. Une erreur de physique dans la copie, absente du récit sur la divergence de train.html.
- a29e839d2 (11/11) : retrait des contenus d'autres services dans ml (voix d'annonceur, musiques « made with suno »). C'est utile au portfolio, pour montrer ce qui appartient à Sacha et ce qui ne lui appartient pas. Aucun chapitre ne couvre la période du 21/10 au 21/11.
- 56a6c267f (08/09) : l'évaluation multi-pistes, où apparaît la « récitation » 2 456 m / 38 m. Le chapitre 00 cite seulement e0f191460 et le rapport ; l'idée est couverte, mais le commit d'origine n'est pas cité.
- Commits secondaires non cités (checkpoints et réglages) : b733d8d04, 335e6a001, 726d93b2a, f1c258f81, 0945f0f9d, 1c4ad16b6, a5c7b5fd0 (30 Hz, cité seulement à travers son annulation 232aa8071), bfd0e9739, f6d8d7b7b, 97d4a5ccc, c38b7e277, 491546769. Tous les commits de novembre sont cités au moins une fois.

### Manques

- Les images. Le journal est fait de texte et de tableaux. Les 10 SVG du 25/11 ne montrent ni le pilote qui vole (26-27/11), ni l'écart aux joueurs, ni le bruit des notes. Il n'y a aucune courbe d'apprentissage, alors que les données existent (21 run-seed*.json de septembre, pop-reel-g1.json d'octobre, les tableaux de bruit). Il faudrait au minimum : la courbe de l'écart aux joueurs (3,05 → 2,54 → 2,02 → 2,00 → 1,67) face au palier médian (11 → 9,5 → 7 → 8,5 → 7,5), la frise des méthodes en vraie image, et une image du nuage du bruit (34 pilotes × 24 graines).
- Aucun film n'est utilisable hors de ce PC. Les 4 .webm sont hors git, ne montrent pas l'affichage du jeu et ne montrent que les pilotes du 24 et du 25/11. Aucun film du pilote qui vole n'existe, et Sacha a abandonné la vidéo le 27/11. Pour un jury, un rejeu côte à côte joueur/bot sur la même graine serait la pièce la plus parlante. Les rejeux existent (34 dans git) ; le film reste à fabriquer.
- Des passages trop techniques pour un non-programmeur : les radians (« 0,46 rad », « glisse 0,33 rad »), l'AUC, « écart-type », « μ+λ à l'état stable », « fiabilité 0,88 (rangs 0,71) », « empreinte a7b3171768ca », « bac fermé », « processus neuf ». La plupart sont expliqués une fois, mais un lexique d'une page dans LISEZ-MOI aiderait. Les chapitres 26 et 27 enchaînent des listes de chiffres sans phrase qui dise ce qu'on voit.
- Les chapitres dépassent la longueur visée (00, 22_23 et 26 font environ 2 000 à 2 500 mots contre 1 500). Il faudrait pour chaque chapitre une version courte, lisible en une minute, en plus de la version sourcée.
- Des trous dans le récit : rien entre le 21/10 et le 22/11 (un mois). Rien sur ce qu'a donné la boucle lancée par Sacha sur le Ryzen le 27/11 : ses journaux ne sont pas sur ce PC, il faut les rapatrier. La question de Sacha « j'arrête les essais sur le Ryzen ? » est restée sans réponse retrouvée. La sélection naturelle n'a pas encore tourné : le dernier chapitre finit en suspens.
- Des pièces fragiles hors git : le journal lui-même, ml/evolution/, paroles-sacha.md (la seule source datée des phrases de Sacha), chaine.log, les récits .jsonl des agents, les films. Un dossier ignoré a déjà été effacé en septembre. Il faut les committer, ou en garder une copie, avant toute autre chose : c'est une décision à prendre, pas faite ici.
- Les pièces promises par le plan (passation/BOTS-ML.md § 5) qui n'existent pas : le bêtisier, les cartes de trajectoires superposées, les planches de neuf instants, les duels côte à côte, les jalons (ml/labo/jalons/ absent), un film avec l'affichage. LISEZ-MOI le dit honnêtement, mais aucune n'est en cours.
- Une partie de la provenance des citations est indirecte : plusieurs phrases de Sacha (« ça c'est le genre de choses auxquelles tu aurais dû penser », la remarque sur Fable contre Opus) ne viennent que des notes de mémoire de Claude, pas du relevé daté. Les chapitres le signalent, mais un jury pourrait le lire comme une reconstruction.
- Détail à faire trancher par Sacha : le chapitre 22_23 nomme l'école visée (« RCA… Royal College of Art, à confirmer »), d'après le plan. Je l'ai laissé, puisque la source est dans git, mais un dossier envoyé à une école n'a peut-être pas à le dire.

### Jugement

Le dossier est sérieux et honnête, ce qui est rare. J'ai recontrôlé 25 affirmations chiffrées dans leur source : 21 sont justes, 3 fausses, 1 introuvable. Les points contrôlés : les dépenses de depenses.jsonl (36,92 € sur 26 lignes, les coûts par modèle, 32,29 € pour les agents), etape0.json, note-reference.json, etalon.json de 4a4b2fc01 (les 88 % d'une seule partie se recalculent : 451 871 sur 515 515), le juge (AUC 0,971), les messages de commit des 08/09 au 27/11, ETAPES.md, bruit/resultats.txt, SPECIFICATION.md, PROPOSITIONS.md, chaine.log et les heures de paroles-sacha.md. Les erreurs trouvées sont des erreurs de détail : une heure de décalage UTC/Paris mal lue, un chiffre du plan d'origine repris sans sa correction, une phrase de log simplifiée, un compte de fichiers périmé. Elles sont corrigées en place, avec le détail privé « [détail privé retiré] » et deux incohérences de forme entre chapitres. Aucune clé, aucun jeton, aucune adresse e-mail. Le sommaire et les chapitres concordent sur les chiffres clés (3,05 → 1,67 ; 36,92 € ; AUC 0,97 / 0,993 selon le contexte ; 12,5 contre 6), et les heures s'enchaînent.

Le dossier a deux qualités. Le registre des impasses (50 lignes, chacune avec le chiffre qui l'a fait écarter) est la meilleure pièce. Il est aussi exact sur qui a fait quoi : les corrections de méthode faites par Sacha le 25/11, le 26/11 et le 27/11 sont dites sans détour.

Comme dossier de portfolio pour un jury d'art et de design, il reste trop un rapport d'ingénieur. Presque aucune image ne raconte les 26 et 27/11, et aucune courbe n'est tracée alors que les données sont là. Aucun film n'est montrable hors de ce PC. Les chapitres sont longs, avec des unités (radians, AUC, écart-type) qu'un jury ne lira pas, et le récit finit en suspens, puisque la sélection n'a pas tourné.

La priorité : mettre à l'abri ce qui est hors git, c'est-à-dire le journal, ml/evolution, paroles-sacha.md et chaine.log. Cela demande l'accord de Sacha, je ne l'ai pas fait. Viennent ensuite trois ou quatre images faites à partir des données existantes et un rejeu côte à côte joueur/bot.

Fichiers modifiés, tous dans C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\ : comment-on-a-travaille.md, 2026-11-27.md, 2026-11-25_suite.md, 2026-11-26.md, LISEZ-MOI.md. Rien n'est commité.
