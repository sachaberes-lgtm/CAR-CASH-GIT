# Lexique — les mots du chantier

Une ou deux phrases par mot, par ordre alphabétique, avec un exemple tiré du chantier quand il aide. Les mots en *italique* ont leur propre entrée.

*Vérifié le 27/11 contre `ml/bot/README.md`, `ml/labo/README.md`, `ml/ecurie/PLAN.md`, `ml/ecurie/etude/selection-naturelle/SPECIFICATION.md` et les chapitres du journal ; complété le 27/11 au soir d'après `ml/evolution/INTERFACES.md` § 9, `ml/evolution/notes/` et `ml/evolution/note.js`. Quand un mot a changé de sens en cours de route (« génération », « champion »…), les deux sens sont donnés. Complété le 28/11 au matin d'après le chapitre `2026-11-28.md`, `ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md`, `ml/ecurie/etude/boucle-payante-ryzen/coffre/sorties/resume.txt`, `ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md` et `ml/evolution/notes/LIVRAISON-REGLAGE.md`.*

---

**Abonnement.** Le forfait mensuel de Sacha pour Claude, distinct du *crédit d'API*. Le 25/11, un gros lot d'*agents* l'a vidé au lieu d'utiliser le crédit : depuis, le travail lourd se paie sur le crédit.

**Agent.** Une autre session de Claude, lancée pour une seule tâche, qui rend un rapport quand elle a fini. Exemple : l'agent qui a choisi le modèle de la *boucle* le 25/11 (0,71 $).

**Agent critique, vérificateur, sceptique.** Un *agent* chargé de relire le travail d'un autre et de le contester, de préférence en refaisant les mesures. Exemple : le 27/11, un vérificateur a rejoué le slalom annoncé à 0,70 s et obtenu 1,16 et 0,80 s.

**Algorithme génétique.** Une famille de méthodes qui imitent l'évolution : une population de solutions, les meilleures ont des enfants modifiés (*mutation*, *croisement*), les moins bonnes disparaissent. Le système du 27/11 en est un, « à état stationnaire » : la population n'est jamais remplacée d'un coup, seuls les moins bien notés partent à chaque *génération*.

**Arbre généalogique.** La page que la *sélection naturelle* dessine d'elle-même à chaque *génération* (`ml/evolution/arbre.js`, depuis le 27/11 au soir) : chaque pilote est un point à sa naissance et un trait jusqu'à son renvoi, un fil le relie à son ou ses parents, et la lignée du *champion* est en vert. Un clic ouvre la fiche d'un pilote : de qui il est né, et ce qui a changé, *gène* par gène.

**Assiette.** L'inclinaison avant-arrière de la voiture en vol : le nez qui monte ou qui descend.

**Au bit près.** Identique jusqu'au moindre chiffre enregistré. Exemple : rejoué avec la même *graine*, le même jeu et le même *cerveau*, une course redonne la même course au bit près, dans un *processus neuf*.

**AUC.** Voir *Juge*.

**Bac fermé.** L'espace clos où tourne le *cerveau* du bot : ni fichiers, ni réseau, ni horloge, ni hasard ; il reçoit la vue en texte et rend son ordre en texte. Le bac laissait passer l'horloge et le hasard jusqu'au 24/11, où il a été fermé.

**Banc.** La mesure qu'une machine fait d'elle-même au premier lancement de la *sélection naturelle* : le *témoin* joue des courses avec plusieurs nombres de courses à la fois, choisis d'après le nombre de *cœurs* de la machine, et l'on garde le nombre qui joue le plus de courses à l'heure sans panne ; il est écrit dans `etat/machine.json`. Exemple : dans l'essai du 27/11 au soir, 103 courses à l'heure une par une, 172,4 à deux, deux retenues. Le Ryzen, le 28/11, en a retenu dix.

**Banc des gènes.** La mesure lancée le 28/11 à 3 h 28 sur le Xeon (`ml/ecurie/etude/banc-des-genes/`) pour juger les *gènes éteints* un par un, sans passer par la sélection : 13 pilotes (le pilote de départ c0025, et des copies qui allument chacune un interrupteur, ou quelques mélanges) jouent les mêmes 96 *graines*, prises dans une plage que la sélection n'utilise jamais, et chaque copie est comparée au départ graine par graine (*comparaison appariée*). Il ne voit qu'un effet d'environ un palier ou plus. Rien à voir avec le *banc* d'une machine.

**Boucle (payante).** Le cycle où Claude écrit des *variantes* du *pilote*, où le vrai jeu les note, et où l'on garde la meilleure avant de recommencer ; elle est payée sur le *crédit d'API*. Elle a tourné pour le *calibrage* du 25/11, puis Sacha l'a lancée sur son second PC le 27/11 : 88 versions, cinq *champions*, 21,61 €. Arrêtée le 28/11 à 0 h 12 ; jugés sur le *coffre*, ses champions ne vont pas plus loin que le pilote de départ.

**Bot.** Un programme qui joue à CASH CAR à la place d'un joueur : des *yeux*, un *cerveau* (ou *pilote*) et une *main*.

**Bot de référence.** Le premier bot, écrit à la main sans apprentissage (`ml/bot/reference.js`) : le point de départ à battre. Le 25/11, le premier *pilote* atteint le *palier médian* 12,5 contre 6 pour lui.

**Bruit.** Les écarts que le seul hasard des courses produit d'un essai à l'autre, et qui ne prouvent donc rien. Exemple : une même variante a fait 139 paliers sur 12 courses, puis 84 (26/11).

**Cache (des courses).** La mémoire des courses déjà jouées : une course déjà jouée par le même pilote, sur la même *graine* et dans la même *époque*, est relue au lieu d'être rejouée. Le 27/11 au soir, après la mort du premier lancement, 22 courses ont été rendues par le cache.

**Calibrage.** L'essai du 25/11 qui a mis quatre modèles de Claude à la même tâche (écrire des variantes du pilote) pour savoir lequel vaut son prix : 4,63 €, aucune variante gardée.

**Cerveau.** Le fichier de code qui décide, dix fois par seconde, ce que fait le bot : il reçoit ce que voient les *yeux* et rend un ordre (braquer, nitro, voler…). Dans les essais de septembre et octobre, le cerveau était un *réseau de neurones*.

**Chaîne.** Le programme prévu pour enchaîner seul les tours de la *boucle* sur deux semaines, en dépensant le crédit par tranches sous un plafond de 200 €. Une *règle du rythme* mal réglée l'a bloquée le 25/11 au soir ; elle n'a payé aucune tranche sur ce PC.

**Champion.** Dans les essais de septembre et octobre : le meilleur cerveau d'un entraînement, gardé pour être rejoué. Dans la *boucle* et dans la *sélection naturelle* : une variante « sacrée » seulement après avoir tenu sur des *graines neuves* : dans la boucle, battre son *parent* sur 20 courses d'entraînement, puis faire au moins aussi bien que lui sur 20 courses de *validation*, toujours les mêmes ; dans la sélection, 24 graines neuves contre le champion en titre, et depuis le 28/11 jusqu'à 96 (*sacre séquentiel*). Le champion en titre est protégé : il n'est jamais renvoyé.

**Chance du gagnant (malédiction du gagnant).** Quand on choisit le meilleur de plusieurs candidats sur les mêmes courses, le gagnant est souvent celui que le hasard y a favorisé : sa note dit plus que ce qu'il vaut. Exemple : c0064, champion de la boucle payante, faisait +2,00 paliers devant le pilote de départ sur les 20 courses de validation, rejouées à chaque sacre ; sur les 40 graines du *coffre*, +0,03 (28/11). Dans la sélection, une alarme guettait cet effet ; elle a été coupée le 28/11, parce qu'elle aurait sonné même quand tout marche.

**Clé d'API, crédit d'API.** Le crédit est de l'argent prépayé (200 € ici) qui permet à un programme d'appeler les modèles de Claude, à l'usage, sans passer par l'*abonnement* ; la clé est le code d'accès qui fait facturer ce crédit. Au 27/11, 36,92 € en ont été dépensés sur ce PC.

**Clonage.** Apprendre au bot en lui faisant imiter des parties enregistrées d'un joueur. Essayé et écarté le 08/09 : Sacha préférait que chaque voiture « se démerde ».

**Cœur (de processeur).** Une unité de calcul de l'ordinateur ; plusieurs cœurs font tourner plusieurs courses en même temps. Le 25/11, l'agent du choix du modèle l'a écrit : « Le PC limite le nombre de tours, pas l'argent ».

**Coffre de graines.** 40 *graines* fixes qui ne servent jamais à décider qui reste ou qui part : le *champion* et le *témoin* y courent à chaque sacre et une fois par jour. L'écart entre les deux sur le coffre est, selon la spécification, le seul signe honnête que la sélection apprend vraiment. Le 28/11, les mêmes 40 graines ont jugé les champions de la *boucle payante* : 160 courses, aucune ratée, et aucun gain sur le pilote de départ (+0,03 palier, *intervalle à 95 %* de −1,18 à +1,38).

**Comparaison appariée.** Comparer deux pilotes course par course, sur les mêmes *graines*, plutôt que comparer leurs moyennes : sur la même route, le hasard que les deux courses partagent s'annule. C'est la méthode du *coffre* et du *banc des gènes*.

**Commit.** Un enregistrement daté dans l'historique du code (git), avec un message qui dit ce qui a changé. On le désigne par un court code, comme `1ee936e15` : c'est là que le journal retrouve chaque mesure.

**Contrat du bot.** Les règles fixes que tout *cerveau* respecte : appelé dix fois par seconde, il reçoit la vue et rend un ordre, sans jamais toucher au jeu ; ses doigts appuient sur les mêmes touches qu'un joueur.

**Copie du jeu (`ml/train`).** Une version complète du jeu prise en juillet, avec un mode entraînement, qui a servi aux essais de septembre et d'octobre. Le jeu publié a changé (gravité, largeur de route, règles des figures), pas elle : ce que les bots y apprenaient ne valait plus pour le vrai jeu.

**Croisement.** Un enfant fait en mélangeant deux parents. En septembre, l'enfant mélangeait les cerveaux de deux voitures survivantes ; dans la sélection du 27/11, un enfant ordinaire a trois chances sur dix d'être croisé : il prend chacun de ses réglages chez l'un ou l'autre parent, et chaque petit réseau entier chez un seul.

**Dalle.** La route elle-même, suspendue dans le ciel. Le 26/11, le pilote roulait parfois sous la dalle, à l'abri, ce qu'un joueur ne fait presque jamais.

**Écart aux joueurs.** La note de ressemblance inventée le 26/11 : la distance moyenne entre un lot de courses du bot et les parties des joueurs au clavier, sur quinze mesures (nitro, vols, raccourcis, figures, poses, slalom, vitesse…). 0 veut dire « au milieu des joueurs » ; une seule partie de joueur comparée aux autres est à 0,9 ; le pilote est passé de 3,05 (le premier pilote) à 1,67 (27/11).

**Écart E (dans la foule).** La mesure de ressemblance de la *sélection naturelle* (`ml/evolution/note.js`) : comme l'*écart aux joueurs*, mais un écart n'y compte qu'au-delà de la dispersion des joueurs eux-mêmes. Elle ne se compare donc pas à l'écart aux joueurs des chapitres précédents (1,67 dans la nuit du 27/11, sur 20 courses de 900 s) : à la génération 0 de la première vraie sélection, le témoin vaut 0,90 en écart E, sur 12 autres courses.

**Écart-type.** L'écart habituel autour de la moyenne. Exemple : d'une course à l'autre, le palier d'un même pilote s'écarte d'habitude de 3,2 de sa moyenne.

**Empreinte.** Un court code calculé sur tout le déroulé d'une ou plusieurs courses : le moindre écart le change. Tant que l'empreinte du contrôle `verifier.js` reste `a7b3171768ca`, le jeu rejoue exactement pareil. Le 27/11 au soir, une empreinte du nom de l'ordinateur remplace ce nom dans ce qui part sur le dépôt public : elle le désigne sans permettre de le retrouver.

**Époque.** Une période de la *sélection naturelle* pendant laquelle le jeu, les *yeux*, la *main*, l'*étalon* et le code qui fabrique les pilotes ne changent pas. Quand l'un d'eux change, une nouvelle époque commence : les notes repartent de zéro et les courses sont rejouées, mais les pilotes restent. Exemple : le 28/11, le portage des idées de la boucle a changé `modele.js` ; le Ryzen changera donc d'époque à sa prochaine mise à jour et rejouera quelques heures de courses. Le *banc des gènes* y est soumis aussi : si `modele.js` ou `enfant.js` change pendant sa mesure, toutes ses courses sont rejouées.

**Entrée saturée ou morte.** Une information donnée à un *réseau de neurones* qui reste toujours au maximum (saturée) ou ne change jamais (morte), et ne lui apprend donc rien. Le 08/09, 8 entrées sur 15 l'étaient.

**Essai à blanc.** Un essai où tout tourne sauf l'appel payant, pour vérifier la machinerie sans rien dépenser. Exemple : la boucle réécrite le 26/11, essayée à blanc pour 0 €.

**Étalon.** Les parties enregistrées de vrais joueurs qui servent de barre de comparaison : 14 parties au 24/11, 10 de Sacha au clavier et 4 de Léo au doigt sur téléphone.

**Fable, Opus, Sonnet, Haiku.** Des modèles de Claude. Lors du *calibrage* du 25/11, ils ont coûté, dans cet ordre, 1,91 €, 1,89 €, 0,77 € et 0,06 €. Fable et Opus servent aussi sur l'*abonnement* de Sacha.

**Fois le temps réel.** Combien de secondes de jeu l'ordinateur joue pendant une seconde d'horloge. Le 23/11, le vrai jeu sans écran tournait à 6,8 fois le temps réel en moyenne.

**Gène, gène éteint.** Un gène est une des cases du *génome* : un réglage (une distance, une durée…) ou un interrupteur (allumé ou éteint). Un gène éteint à la naissance est un interrupteur à zéro : le geste qu'il commande ne s'exécute pas, et seule une *mutation* peut l'allumer. Le 27/11 au soir, cinq gestes de joueurs sont entrés dans le génome ainsi, éteints ; environ 3 enfants sur 100 allument un geste donné. Le 28/11, les quatre idées de la *boucle payante* y sont entrées de la même façon. C'est devenu la règle de la nuit du 28/11 : une idée nouvelle s'écrit comme un gène éteint, pour que le pilote de départ ne change pas, puis elle est jugée seule sur le *banc des gènes*.

**Génération.** Un tour de sélection. En septembre et octobre : une manche où toutes les voitures courent, après quoi la moitié la moins bonne est remplacée par des enfants. Dans la *sélection naturelle* du 27/11 : 6 enfants naissent, les 26 pilotes courent les mêmes 12 courses, puis les 6 moins bien notés sur toutes leurs courses sont renvoyés (les nouveau-nés, le *témoin* et le *champion* sont protégés).

**Génome.** Ce qui se transmet d'un pilote à ses enfants et peut muter. Dans la sélection du 27/11 : environ 75 réglages du pilote écrit à la main et les 312 *poids* de deux petits *réseaux de neurones* ; les *yeux*, la *main* et la forme du code restent hors du génome, figés. Construit, il compte 86 *gènes* (réglages et interrupteurs) ; les cinq gestes ajoutés le 27/11 au soir le portent à 107 ; les quatre interrupteurs et dix réglages des idées de la boucle, le 28/11, à 121 (le génome « v:3 »). Tout éteint, il redonne c0025 au bit près ; tout allumé, c0101.

**Graine.** Le nombre qui fixe le hasard d'une course : même graine, même piste, mêmes tirages. On peut ainsi faire courir plusieurs bots sur exactement les mêmes courses.

**Graines neuves (validation sur).** Refaire courir une variante sur des courses qu'elle n'a jamais vues, pour vérifier que son gain n'était pas de la chance. Exemple : la meilleure variante du 25/11, 13 contre 11 en note en grand, tombe à 10,5 contre 11 sur 20 graines neuves.

**Greffé, muet.** Un *réseau de neurones* ajouté à un *pilote* déjà écrit, réglé pour ne rien changer à la conduite à la naissance, puis libre d'évoluer. C'est la forme choisie le 27/11, parce qu'un réseau parti de zéro n'avait pas appris à voler.

**Immigré.** Dans la *sélection naturelle*, un enfant qui n'est pas une petite *mutation* mais une copie très changée du *champion*, ajoutée de temps en temps pour garder de la variété dans la population. Le 27/11, la génération 1 de la première vraie sélection en compte un sur six naissances.

**Intégrateur.** L'*agent* qui reçoit les morceaux écrits par les autres, les assemble et vérifie qu'ils marchent ensemble.

**Intervalle à 95 %.** La fourchette où se trouve probablement le vrai écart entre deux pilotes, compte tenu du hasard des courses. Si elle contient zéro, on ne peut pas dire lequel est meilleur. Exemple : au *coffre*, c0064 contre c0025, de −1,18 à +1,38 palier.

**Jeton.** L'unité de texte, un morceau de mot, qui mesure la longueur d'une réponse d'un modèle de Claude et son prix. Le 25/11, la seule réponse de Fable a été coupée à 32 000 jetons.

**Juge « humain ou bot » (AUC).** Un programme (`discerner.js`) entraîné à reconnaître si une partie a été jouée par une personne ou par un bot. Sa note, l'AUC, vaut 0,5 s'il répond au hasard et 1 s'il ne se trompe jamais : il est resté entre 0,97 et 0,99 selon les jours : le bot est presque toujours reconnu.

**Labo (la boîte noire).** Le registre où chaque *cerveau* entre avec son code, la raison de son changement, sa note, chacune de ses courses et son coût (`ml/labo`). Rien n'y entre sans raison écrite.

**Lot, grande note.** Un lot est une série de courses jouées par le même bot (souvent 12 ou 24 courses de 5 minutes) ; une grande note, 20 courses de 15 minutes au plus.

**Main (profil).** La partie du bot qui imite les doigts d'un joueur : temps de réaction, coups de volant de durée variable, erreurs, hasard à graine. Elle est fixée : une variante qui la change est refusée, pour que le bot ne gagne pas en trichant sur les réflexes.

**Map, portail.** Une map est un des décors de route du jeu (canyon, grotte, ville, jade…) ; le portail est le passage qui fait changer de map au cours d'une course.

**Médiane, palier médian.** La médiane est la valeur du milieu quand on range les résultats du plus petit au plus grand ; le palier médian, celui de la course du milieu. Elle bouge moins qu'une moyenne à cause d'une course exceptionnelle.

**Modèle de langage.** Un programme comme Claude, qui écrit du texte et du code.

**Mutation.** Une petite modification au hasard. En septembre, elle touchait le cerveau d'un enfant ; dans la sélection du 27/11, elle déplace d'un petit pas tiré au hasard quelques réglages du *génome* (trois en moyenne). Depuis le 28/11, elle ne touche plus un réglage que le pilote ne lit pas (en v:2, 27 % des réglages changés sur le Ryzen tombaient dans le vide).

**« Les mutations comptent-elles ? » (τ).** La mesure que la *sélection naturelle* fait d'elle-même depuis le 28/11, sans jouer une course de plus : un enfant bien classé sur ses premières courses l'est-il encore sur les suivantes ? τ (la lettre grecque tau) est l'écart vrai entre deux enfants voisins. Estimé sur les courses du 27/11 : 0,32 palier (entre 0 et 1,07), contre 3,26 de hasard par course. La sélection répond « trop tôt pour le dire » tant qu'elle n'a pas mesuré 191 enfants.

**Neuroévolution.** Faire évoluer des programmes, dont de petits *réseaux de neurones*, par *mutation* et sélection, comme une population animale, au lieu d'écrire la conduite à la main et sans leur montrer la bonne réponse. C'était la méthode de septembre et d'octobre (partie de zéro) ; c'est celle du 27/11 (partie d'un pilote déjà écrit).

**Nitro.** Le turbo de la voiture, qui puise dans une jauge. Le même bouton, tenu, fait accélérer et, tapé deux fois en l'air, lance une figure : la nitro et les figures se paient sur la même jauge.

**Node.** Un logiciel qui fait tourner le code JavaScript du jeu en dehors d'un navigateur ; c'est lui qui joue les courses *sans écran*. Depuis le 28/11, chaque PC écrit le chemin de son Node dans `etat/node.txt` (le « Node fixe ») : sur le Ryzen, une autre version passait devant, et une version différente aurait ouvert une nouvelle *époque* sans rien dire ; la sélection refuse maintenant de partir avec un autre Node.

**Normalisation.** Remettre les informations données à un réseau de neurones à une échelle comparable. Essayée le 08/09 : moins bien (record médian de 4 995 à 3 244 m).

**Note (fitness).** Le score qui sert à classer les bots. En septembre, surtout la distance parcourue ; dans la *boucle*, le palier, puis le critère « mixte » (palier et ressemblance) ; dans la sélection du 27/11, une note qui mêle palier et ressemblance, cumulée sur toutes les courses du pilote depuis sa naissance : la note F, le palier moins quatre fois l'*écart E*. Exemple : le témoin, à la génération 0, F 2,8 ± 0,9.

**Récit (de la sélection).** Le texte que la *sélection naturelle* écrit d'elle-même à chaque *génération* (`ml/evolution/histoire.js`, `etat/histoire.md`) : dix lignes « Où on en est », puis une entrée par génération (naissances, renvois, meneur, *coffre*). Rien n'y est ajouté à la main.

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

**Sacre, faux sacre.** Le sacre est le moment où un pilote devient *champion* dans la *sélection naturelle*, après avoir battu le champion en titre sur 24 *graines neuves*. Un faux sacre couronne un pilote qui n'est pas vraiment meilleur, par chance : la règle d'abord écrite en aurait fait 18,3 % ; corrigée avant le premier lancement, 3,7 % (commit `e2ea8d2c9`).

**Sacre séquentiel.** La règle du *sacre* depuis le 28/11 (`3b1bf15e5`) : le meneur joue 24 courses neuves contre le champion ; s'il semble devant, 12 de plus, puis encore 12, jusqu'à 96 ; s'il est clairement derrière, on arrête. Mesuré sur les courses du 27/11 : un vrai progrès d'un palier est reconnu 33 fois sur 100 au lieu de 15, et les faux sacres passent de 3 % à 1,8 %. La sévérité de deux garde-fous de cette règle reste à décider par Sacha.

**Salle de projection.** Une page qui rejoue les courses gardées des bots avec l'image du jeu, et sait les filmer (`node ml/labo/projection.js`).

**Sans écran, simulateur.** Le vrai jeu exécuté par l'ordinateur sans rien afficher, en calcul seul, pour jouer des courses bien plus vite qu'un humain et noter les bots.

**Seconde chance.** L'option du jeu qui permet de repartir après une mort : une par partie, après 20 s, au prix d'un palier.

**Sélection naturelle.** Le mot de Sacha, le 27/11, pour un système « où le bot le moins bon est viré », qui tourne seul sur son PC sans rien payer. Techniquement, c'est un *algorithme génétique* de la famille de la *neuroévolution* (`ml/evolution/`). Construit le 27/11, lancé pour la première fois le soir même sur le Xeon, puis sur le Ryzen le 28/11 à 0 h 29.

**Session principale.** La conversation que Sacha a ouverte avec Claude (le modèle Fable). Elle conçoit le travail, écrit les consignes des *agents* Opus, relit ce qui revient, décide de la méthode et parle à Sacha. Exemple : c'est elle qui a fait finir la mesure du *coffre* sur 40 graines, quand l'agent s'était arrêté à 4.

**SVG.** Un format d'image dessinée par le code, nette à n'importe quelle taille. Toutes les images du journal sont des SVG, en clair et en sombre.

**Tableau de bord.** La page que la *sélection naturelle* refait à chaque *génération* (`etat/tableau.html`) : ses graphiques, le champion, le témoin, le *coffre*, les alertes. Elle s'ouvre sans Internet ; ses dix lignes essentielles se lisent aussi par `node ml/evolution/etat.js`.

**Tâche planifiée.** Un programme que Windows relance seul, à une heure fixée ou au démarrage du PC. Sur le Ryzen, trois tâches posées à la main lancent la sélection, la relancent et envoient ses traces chaque heure. Le 27/11 au soir, Sacha a signalé que les tâches avaient une limite de 72 heures. Depuis le 28/11 (`7b1df608e`), `installer-tache.cmd` les pose sans limite ; celles du Ryzen sont « déjà sans limite de durée » d'après `ml/evolution/notes/LIVRAISON-C0101.md`.

**Taux de pose.** La part des décollages qui finissent par un atterrissage réussi sur la route. Le 08/09 : 9 % (19 sur 217).

**Témoin.** Un pilote gardé tel quel, jamais modifié ni renvoyé (dans la sélection du 27/11, le génome de `pilote-voltige.js`), qui sert de repère. Le *champion* se compare à lui sur le *coffre de graines* ; et si la note du témoin bouge seule, c'est le simulateur qui dérive. Ce pilote porte aussi le nom c0025, celui que la *boucle payante* lui avait donné. Depuis le 28/11, le témoin se choisit dans `config.json` (c0025 par défaut) ; après le verdict du coffre, il reste c0025.

**Validation (courses de).** Des courses gardées à part pour vérifier qu'un gain n'était pas de la chance. Elles ne valent que si elles sont neuves : dans la *boucle payante*, les mêmes 20 courses de validation ont servi à chaque sacre, et ont fini par favoriser les gagnants chanceux (*chance du gagnant*).

**Travailleur.** Un petit programme qui calcule à côté du jeu. Celui du relief du canyon ne répondait jamais dans le simulateur : jusqu'à la nuit du 25/11, les bots couraient un canyon sans parois.

**Tri, note en grand.** Les deux premiers filtres de la *boucle* : le tri fait courir chaque variante sur 6 graines de 10 minutes ; la meilleure passe ensuite la note en grand, sur 20 graines de 15 minutes, avant la validation sur *graines neuves*.

**Verrou.** Le fichier qui dit qu'une *sélection naturelle* tourne déjà dans un dossier, avec un signe de vie régulier, pour qu'une seconde ne parte pas en même temps. Si le programme meurt, le verrou cesse de battre et la relance suivante le reprend (27/11 au soir).

**Workflow.** Un lot d'*agents* lancés ensemble par un programme. Exemple : celui de 152 agents qui a vidé l'*abonnement* le 25/11.

**Worktree.** Un second dossier de travail tiré du même historique git, sur sa propre branche : on peut y faire tourner la sélection sans la mêler au reste du chantier. La première vraie sélection a tourné dans l'un d'eux, le 27/11 au soir ; sur le Ryzen, elle doit tourner dans un autre, sur la branche `evolution-ryzen`.

**Yeux.** Ce que le bot sait du jeu à chaque instant, sous forme de nombres et non d'images : la route devant, les pièces, les jauges, son vol, et le *radar*.
