# Lexique — les mots du chantier

Une ou deux phrases par mot, par ordre alphabétique, avec un exemple tiré du chantier quand il aide. Les mots en *italique* ont leur propre entrée.

*Vérifié le 27/11 contre `ml/bot/README.md`, `ml/labo/README.md`, `ml/ecurie/PLAN.md`, `ml/ecurie/etude/selection-naturelle/SPECIFICATION.md` et les chapitres du journal. Quand un mot a changé de sens en cours de route (« génération », « champion »…), les deux sens sont donnés.*

---

**Abonnement.** Le forfait mensuel de Sacha pour Claude, distinct du *crédit d'API*. Le 25/11, un gros lot d'*agents* l'a vidé au lieu d'utiliser le crédit : depuis, le travail lourd se paie sur le crédit.

**Agent.** Une autre session de Claude, lancée pour une seule tâche, qui rend un rapport quand elle a fini. Exemple : l'agent qui a choisi le modèle de la *boucle* le 25/11 (0,71 $).

**Agent critique, vérificateur, sceptique.** Un *agent* chargé de relire le travail d'un autre et de le contester, de préférence en refaisant les mesures. Exemple : le 27/11, un vérificateur a rejoué le slalom annoncé à 0,70 s et obtenu 1,16 et 0,80 s.

**Algorithme génétique.** Une famille de méthodes qui imitent l'évolution : une population de solutions, les meilleures ont des enfants modifiés (*mutation*, *croisement*), les moins bonnes disparaissent. Le système du 27/11 en est un, « à état stationnaire » : la population n'est jamais remplacée d'un coup, seuls les moins bien notés partent à chaque *génération*.

**Assiette.** L'inclinaison avant-arrière de la voiture en vol : le nez qui monte ou qui descend.

**Au bit près.** Identique jusqu'au moindre chiffre enregistré. Exemple : rejoué avec la même *graine*, le même jeu et le même *cerveau*, une course redonne la même course au bit près, dans un *processus neuf*.

**AUC.** Voir *Juge*.

**Bac fermé.** L'espace clos où tourne le *cerveau* du bot : ni fichiers, ni réseau, ni horloge, ni hasard ; il reçoit la vue en texte et rend son ordre en texte. Le bac laissait passer l'horloge et le hasard jusqu'au 24/11, où il a été fermé.

**Boucle (payante).** Le cycle où Claude écrit des *variantes* du *pilote*, où le vrai jeu les note, et où l'on garde la meilleure avant de recommencer ; elle est payée sur le *crédit d'API*. Elle a tourné pour le *calibrage* du 25/11, puis Sacha l'a lancée sur son second PC le 27/11.

**Bot.** Un programme qui joue à CASH CAR à la place d'un joueur : des *yeux*, un *cerveau* (ou *pilote*) et une *main*.

**Bot de référence.** Le premier bot, écrit à la main sans apprentissage (`ml/bot/reference.js`) : le point de départ à battre. Le 25/11, le premier *pilote* atteint le *palier médian* 12,5 contre 6 pour lui.

**Bruit.** Les écarts que le seul hasard des courses produit d'un essai à l'autre, et qui ne prouvent donc rien. Exemple : une même variante a fait 139 paliers sur 12 courses, puis 84 (26/11).

**Calibrage.** L'essai du 25/11 qui a mis quatre modèles de Claude à la même tâche (écrire des variantes du pilote) pour savoir lequel vaut son prix : 4,63 €, aucune variante gardée.

**Cerveau.** Le fichier de code qui décide, dix fois par seconde, ce que fait le bot : il reçoit ce que voient les *yeux* et rend un ordre (braquer, nitro, voler…). Dans les essais de septembre et octobre, le cerveau était un *réseau de neurones*.

**Chaîne.** Le programme prévu pour enchaîner seul les tours de la *boucle* sur deux semaines, en dépensant le crédit par tranches sous un plafond de 200 €. Une *règle du rythme* mal réglée l'a bloquée le 25/11 au soir ; elle n'a payé aucune tranche sur ce PC.

**Champion.** Dans les essais de septembre et octobre : le meilleur cerveau d'un entraînement, gardé pour être rejoué. Dans la *boucle* et dans la *sélection naturelle* : une variante « sacrée » seulement après avoir tenu sur des *graines neuves* : dans la boucle, 20 graines contre son *parent* ; dans la sélection, 24 graines contre le champion en titre. Le champion en titre est protégé : il n'est jamais renvoyé.

**Clé d'API, crédit d'API.** Le crédit est de l'argent prépayé (200 € ici) qui permet à un programme d'appeler les modèles de Claude, à l'usage, sans passer par l'*abonnement* ; la clé est le code d'accès qui fait facturer ce crédit. Au 27/11, 36,92 € en ont été dépensés sur ce PC.

**Clonage.** Apprendre au bot en lui faisant imiter des parties enregistrées d'un joueur. Essayé et écarté le 08/09 : Sacha préférait que chaque voiture « se démerde ».

**Cœur (de processeur).** Une unité de calcul de l'ordinateur ; plusieurs cœurs font tourner plusieurs courses en même temps. Le 25/11, l'agent du choix du modèle l'a écrit : « Le PC limite le nombre de tours, pas l'argent ».

**Coffre de graines.** 40 *graines* fixes qui ne servent jamais à décider qui reste ou qui part : le *champion* et le *témoin* y courent à chaque sacre et une fois par jour. L'écart entre les deux sur le coffre est, selon la spécification, le seul signe honnête que la sélection apprend vraiment.

**Commit.** Un enregistrement daté dans l'historique du code (git), avec un message qui dit ce qui a changé. On le désigne par un court code, comme `1ee936e15` : c'est là que le journal retrouve chaque mesure.

**Contrat du bot.** Les règles fixes que tout *cerveau* respecte : appelé dix fois par seconde, il reçoit la vue et rend un ordre, sans jamais toucher au jeu ; ses doigts appuient sur les mêmes touches qu'un joueur.

**Copie du jeu (`ml/train`).** Une version complète du jeu prise en juillet, avec un mode entraînement, qui a servi aux essais de septembre et d'octobre. Le jeu publié a changé (gravité, largeur de route, règles des figures), pas elle : ce que les bots y apprenaient ne valait plus pour le vrai jeu.

**Croisement.** Un enfant fait en mélangeant deux parents. En septembre, l'enfant mélangeait les cerveaux de deux voitures survivantes ; dans la sélection du 27/11, un enfant ordinaire a trois chances sur dix d'être croisé : il prend chacun de ses réglages chez l'un ou l'autre parent, et chaque petit réseau entier chez un seul.

**Dalle.** La route elle-même, suspendue dans le ciel. Le 26/11, le pilote roulait parfois sous la dalle, à l'abri, ce qu'un joueur ne fait presque jamais.

**Écart aux joueurs.** La note de ressemblance inventée le 26/11 : la distance moyenne entre un lot de courses du bot et les parties des joueurs au clavier, sur quinze mesures (nitro, vols, raccourcis, figures, poses, slalom, vitesse…). 0 veut dire « au milieu des joueurs » ; une seule partie de joueur comparée aux autres est à 0,9 ; le pilote est passé de 3,05 (le premier pilote) à 1,67 (27/11).

**Écart-type.** L'écart habituel autour de la moyenne. Exemple : d'une course à l'autre, le palier d'un même pilote s'écarte d'habitude de 3,2 de sa moyenne.

**Empreinte.** Un court code calculé sur tout le déroulé d'une ou plusieurs courses : le moindre écart le change. Tant que l'empreinte du contrôle `verifier.js` reste `a7b3171768ca`, le jeu rejoue exactement pareil.

**Entrée saturée ou morte.** Une information donnée à un *réseau de neurones* qui reste toujours au maximum (saturée) ou ne change jamais (morte), et ne lui apprend donc rien. Le 08/09, 8 entrées sur 15 l'étaient.

**Essai à blanc.** Un essai où tout tourne sauf l'appel payant, pour vérifier la machinerie sans rien dépenser. Exemple : la boucle réécrite le 26/11, essayée à blanc pour 0 €.

**Étalon.** Les parties enregistrées de vrais joueurs qui servent de barre de comparaison : 14 parties au 24/11, 10 de Sacha au clavier et 4 de Léo au doigt sur téléphone.

**Fable, Opus, Sonnet, Haiku.** Des modèles de Claude. Lors du *calibrage* du 25/11, ils ont coûté, dans cet ordre, 1,91 €, 1,89 €, 0,77 € et 0,06 €. Fable et Opus servent aussi sur l'*abonnement* de Sacha.

**Fois le temps réel.** Combien de secondes de jeu l'ordinateur joue pendant une seconde d'horloge. Le 23/11, le vrai jeu sans écran tournait à 6,8 fois le temps réel en moyenne.

**Génération.** Un tour de sélection. En septembre et octobre : une manche où toutes les voitures courent, après quoi la moitié la moins bonne est remplacée par des enfants. Dans la *sélection naturelle* du 27/11 : 6 enfants naissent, les 26 pilotes courent les mêmes 12 courses, puis les 6 moins bien notés sur toutes leurs courses sont renvoyés (les nouveau-nés, le *témoin* et le *champion* sont protégés).

**Génome.** Ce qui se transmet d'un pilote à ses enfants et peut muter. Dans la sélection du 27/11 : environ 75 réglages du pilote écrit à la main et les 312 *poids* de deux petits *réseaux de neurones* ; les *yeux*, la *main* et la forme du code restent hors du génome, figés.

**Graine.** Le nombre qui fixe le hasard d'une course : même graine, même piste, mêmes tirages. On peut ainsi faire courir plusieurs bots sur exactement les mêmes courses.

**Graines neuves (validation sur).** Refaire courir une variante sur des courses qu'elle n'a jamais vues, pour vérifier que son gain n'était pas de la chance. Exemple : la meilleure variante du 25/11, 13 contre 11 en note en grand, tombe à 10,5 contre 11 sur 20 graines neuves.

**Greffé, muet.** Un *réseau de neurones* ajouté à un *pilote* déjà écrit, réglé pour ne rien changer à la conduite à la naissance, puis libre d'évoluer. C'est la forme choisie le 27/11, parce qu'un réseau parti de zéro n'avait pas appris à voler.

**Jeton.** L'unité de texte, un morceau de mot, qui mesure la longueur d'une réponse d'un modèle de Claude et son prix. Le 25/11, la seule réponse de Fable a été coupée à 32 000 jetons.

**Juge « humain ou bot » (AUC).** Un programme (`discerner.js`) entraîné à reconnaître si une partie a été jouée par une personne ou par un bot. Sa note, l'AUC, vaut 0,5 s'il répond au hasard et 1 s'il ne se trompe jamais : il est resté entre 0,97 et 0,99 selon les jours : le bot est presque toujours reconnu.

**Labo (la boîte noire).** Le registre où chaque *cerveau* entre avec son code, la raison de son changement, sa note, chacune de ses courses et son coût (`ml/labo`). Rien n'y entre sans raison écrite.

**Lot, grande note.** Un lot est une série de courses jouées par le même bot (souvent 12 ou 24 courses de 5 minutes) ; une grande note, 20 courses de 15 minutes au plus.

**Main (profil).** La partie du bot qui imite les doigts d'un joueur : temps de réaction, coups de volant de durée variable, erreurs, hasard à graine. Elle est fixée : une variante qui la change est refusée, pour que le bot ne gagne pas en trichant sur les réflexes.

**Map, portail.** Une map est un des décors de route du jeu (canyon, grotte, ville, jade…) ; le portail est le passage qui fait changer de map au cours d'une course.

**Médiane, palier médian.** La médiane est la valeur du milieu quand on range les résultats du plus petit au plus grand ; le palier médian, celui de la course du milieu. Elle bouge moins qu'une moyenne à cause d'une course exceptionnelle.

**Modèle de langage.** Un programme comme Claude, qui écrit du texte et du code.

**Mutation.** Une petite modification au hasard. En septembre, elle touchait le cerveau d'un enfant ; dans la sélection du 27/11, elle déplace d'un petit pas tiré au hasard quelques réglages du *génome* (trois en moyenne).

**Neuroévolution.** Faire évoluer des programmes, dont de petits *réseaux de neurones*, par *mutation* et sélection, comme une population animale, au lieu d'écrire la conduite à la main et sans leur montrer la bonne réponse. C'était la méthode de septembre et d'octobre (partie de zéro) ; c'est celle du 27/11 (partie d'un pilote déjà écrit).

**Nitro.** Le turbo de la voiture, qui puise dans une jauge. Le même bouton, tenu, fait accélérer et, tapé deux fois en l'air, lance une figure : la nitro et les figures se paient sur la même jauge.

**Node.** Un logiciel qui fait tourner le code JavaScript du jeu en dehors d'un navigateur ; c'est lui qui joue les courses *sans écran*.

**Normalisation.** Remettre les informations données à un réseau de neurones à une échelle comparable. Essayée le 08/09 : moins bien (record médian de 4 995 à 3 244 m).

**Note (fitness).** Le score qui sert à classer les bots. En septembre, surtout la distance parcourue ; dans la *boucle*, le palier, puis le critère « mixte » (palier et ressemblance) ; dans la sélection du 27/11, une note qui mêle palier et ressemblance, cumulée sur toutes les courses du pilote depuis sa naissance.

**Palier.** Le niveau atteint pendant une course : un moteur gagné en ramassant des pièces, de 1 à 30 ; chaque course repart du palier 1. Le but de Sacha : des bots à chaque palier, du 1 au 30.

**Parent, variante.** Une variante est une copie modifiée du *pilote* ; son parent est le pilote dont elle vient, et contre qui on la compare.

**Pas.** Un instant de calcul de la simulation : le jeu avance pas à pas. Exemple : le 08/09, l'écart entre la physique du joueur et celle des bots était exactement zéro sur 3 000 pas.

**Pilote.** Un *cerveau* de bot écrit en clair par Claude, qui décide quand braquer, voler ou mettre la nitro. Le premier, `pilote.js`, date du 25/11 ; celui qui vole, `pilote-voltige.js`, du 26/11 ; c'est de lui que part la sélection du 27/11.

**Processus neuf.** Un programme relancé de zéro, qui ne garde rien des courses précédentes. Une course par processus neuf : c'est ce qui garantit qu'une même graine redonne la même course.

**Raccourci.** Un morceau de route plus bas et plus loin qu'on rejoint en volant, et qui fait gagner du chemin. Chez les joueurs au clavier, 43 % des poses sont des raccourcis.

**Radar, rayon.** Le radar est la partie des *yeux* qui, en vol, rejoue d'avance la suite du vol avec les lois du jeu, pour plusieurs façons de piloter ; chacune de ces façons est un rayon, qui annonce comment le vol finirait (pose, choc, jauge vide…).

**Récitation (surapprentissage).** Un cerveau qui a appris une piste par cœur et ne sait plus conduire ailleurs. Exemple : 2 456 m sur sa piste, 38 m sur une inconnue (septembre).

**Régime allégé, régime maximum.** Le régime allégé est la version du jeu prévue pour les téléphones et les machines lentes, avec moins de détails à l'image : c'est celle des joueurs de l'*étalon*, donc celle où courent les bots depuis le 24/11. Le régime maximum est la version la plus riche, pour les ordinateurs puissants ; la map Crypto City n'y est tirée qu'à ce régime.

**Règle du rythme.** La limite de dépense par jour qui disait à la *chaîne* quand elle pouvait payer un nouveau tour (14 € par jour). Elle comptait aussi les agents déjà payés, et a bloqué la chaîne du 25/11 au soir au 26/11 midi.

**Rejeu.** Une course refaite à partir des seules touches enregistrées, qui doit redonner exactement la même course. De quoi refaire un film plus tard.

**Réseau de neurones, poids.** Un petit calcul qui transforme ce que la voiture « voit » en touches à presser ; ses nombreux réglages, les poids, s'ajustent par essais au lieu d'être écrits à la main.

**Salle de projection.** Une page qui rejoue les courses gardées des bots avec l'image du jeu, et sait les filmer (`node ml/labo/projection.js`).

**Sans écran, simulateur.** Le vrai jeu exécuté par l'ordinateur sans rien afficher, en calcul seul, pour jouer des courses bien plus vite qu'un humain et noter les bots.

**Seconde chance.** L'option du jeu qui permet de repartir après une mort : une par partie, après 20 s, au prix d'un palier.

**Sélection naturelle.** Le mot de Sacha, le 27/11, pour un système « où le bot le moins bon est viré », qui tourne seul sur son PC sans rien payer. Techniquement, c'est un *algorithme génétique* de la famille de la *neuroévolution* (`ml/evolution/`, construit, pas encore lancé au 27/11).

**SVG.** Un format d'image dessinée par le code, nette à n'importe quelle taille. Toutes les images du journal sont des SVG, en clair et en sombre.

**Taux de pose.** La part des décollages qui finissent par un atterrissage réussi sur la route. Le 08/09 : 9 % (19 sur 217).

**Témoin.** Un pilote gardé tel quel, jamais modifié ni renvoyé (dans la sélection du 27/11, le génome de `pilote-voltige.js`), qui sert de repère. Le *champion* se compare à lui sur le *coffre de graines* ; et si la note du témoin bouge seule, c'est le simulateur qui dérive.

**Travailleur.** Un petit programme qui calcule à côté du jeu. Celui du relief du canyon ne répondait jamais dans le simulateur : jusqu'à la nuit du 25/11, les bots couraient un canyon sans parois.

**Tri, note en grand.** Les deux premiers filtres de la *boucle* : le tri fait courir chaque variante sur 6 graines de 10 minutes ; la meilleure passe ensuite la note en grand, sur 20 graines de 15 minutes, avant la validation sur *graines neuves*.

**Workflow.** Un lot d'*agents* lancés ensemble par un programme. Exemple : celui de 152 agents qui a vidé l'*abonnement* le 25/11.

**Yeux.** Ce que le bot sait du jeu à chaque instant, sous forme de nombres et non d'images : la route devant, les pièces, les jauges, son vol, et le *radar*.
