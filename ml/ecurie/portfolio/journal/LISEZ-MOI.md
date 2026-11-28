# Le journal de bord de l'écurie — à lire en premier

Ce dossier raconte comment des bots apprennent à jouer à CASH CAR, le jeu de Sacha. Il est fait pour un lecteur qui a cinq minutes et ne programme pas. Chaque chiffre renvoie à un chapitre, et chaque chapitre à ses sources (un commit git, un fichier, un journal).

Un mot vous arrête (palier, graine, génome, écart aux joueurs, témoin…) ? Il est expliqué en une ou deux phrases dans le **lexique**, [`LEXIQUE.md`](LEXIQUE.md), rangé par ordre alphabétique.

*Heures : les messages de Sacha sont donnés en heure UTC, comme dans leur relevé (`ml/ecurie/agents/tmp-voltige/paroles-sacha.md`). Les commits sont à l'heure de Paris (UTC + 1). Exception : les deux chapitres du 25/11 donnent aussi les messages de Sacha à l'heure de Paris, et le disent en tête. Les deux chapitres du 28/11 (`2026-11-28.md` et `2026-11-28_suite.md`) donnent les messages de Claude et les journaux des machines à l'heure de Paris.*

---

![Le jeu vu de derrière la voiture : une caisse orange aux ailes déployées vole au-dessus d'une route grise et étroite qui serpente dans le ciel, entre de hautes aiguilles de roche vertes, au-dessus d'une mer bleue ; deux traînées rouges partent de l'arrière de la voiture.](../images/journal-le-jeu.jpg)

*Voici CASH CAR, sur la map des Pics de Jade : la voiture a quitté la route et vole, ailes ouvertes ; ce vol dure cinq secondes avant qu'elle se repose. C'est le premier pilote du 25/11 qui conduit (image tirée du film de sa course, à 1 min 05 s), pas le pilote actuel, dont aucun film n'existe.*

## 1. Le chantier en dix lignes

1. CASH CAR est un jeu de course pour téléphone : une route suspendue dans le ciel, des vols, des figures en l'air, des pièces à ramasser.
2. Le but, fixé par Sacha le 24/11 : des bots « qu'on ne puisse pas faire la différence entre eux et des vrais joueurs », du palier 1 au palier 30 (le palier est le niveau atteint pendant une course).
3. Sacha dirige et joue les parties qui servent de barre. Il ne code pas. Le code et les mesures sont de Claude, souvent par des « agents » (d'autres sessions de Claude lancées pour une seule tâche).
4. En septembre et octobre, deux essais de sélection par générations, partis de zéro, ont appris à rouler, presque jamais à voler.
5. Le 22/11, Claude a proposé une autre méthode : écrire lui-même des cerveaux lisibles, notés par le vrai jeu.
6. Le 25/11, quatre modèles de Claude ont écrit des variantes d'un premier pilote. Aucune n'a tenu sur des courses neuves.
7. Les 26 et 27/11, Claude a réglé un pilote à la main pour qu'il vole comme un joueur. Il ressemble davantage aux joueurs (écart aux joueurs 1,67, contre 3,05 pour le premier pilote), mais il atteint des paliers plus bas.
8. Un juge automatique reconnaît toujours le bot (AUC 0,97, où 0,5 voudrait dire « pile ou face »).
9. Le 27/11, Sacha a écarté le réglage à la main. Il a demandé une sélection naturelle qui tourne seule sur son PC. Le système est construit (`ml/evolution/`). Le soir, il a tourné sur le Xeon, l'ordinateur de travail (191 courses à l'heure). Depuis le 28/11 à 0 h 29, il tourne sur le Ryzen, le second PC de Sacha (418 courses à l'heure). De 2 h à 13 h, sa connexion à Internet a coupé : il a continué de jouer, mais n'envoyait plus rien. À son envoi de 14 h (génération 17), aucun pilote n'y avait encore battu le pilote de départ, et la première « greffe » venait de naître (le meilleur pilote recopié avec un réglage forcé : ici, les raccourcis de la ville éteints).
10. La boucle payante que Sacha avait lancée sur le Ryzen annonçait deux paliers de plus. Rejoués le 28/11 sur 40 courses neuves, ses champions ne vont pas plus loin que le pilote de départ : 21,61 € dépensés sans obtenir un meilleur pilote. Au total, 58,53 € de crédit d'API ont été dépensés sur 200 (montants estimés en dollars, 1 € compté pour 1 $). La leçon : le hasard d'une course cache les petits réglages ; on essaie désormais des changements de fond, un par un, sur beaucoup de courses identiques.

Sources : chapitres `2026-11-24.md`, `2026-11-25_suite.md`, `2026-11-26.md`, `2026-11-27.md`, `2026-11-28.md`, `2026-11-28_suite.md`, `comment-on-a-travaille.md`.

---

## 2. Le fil : les changements de méthode

![Une frise du 7 septembre au 27 novembre 2026, avec l'axe du temps coupé pour sauter le mois sans travail : à gauche, deux marques espacées de six semaines (la sélection dans une copie du jeu, puis dans le vrai jeu) ; à droite, cinq marques serrées du 22 au 27 novembre ; des ronds pour les virages venus de Sacha, des losanges pour ceux venus de Claude, et à côté de chaque marque, au-dessus ou au-dessous, ce qui l'a arrêtée.](../images/journal-frise-clair.svg)

*Pendant deux mois, à l'automne, on a laissé des voitures apprendre seules par sélection : d'abord dans une copie du jeu, puis dans le vrai jeu. Ensuite, un mois sans travail, puis cinq virages en six jours (du 22 au 27 novembre) : quatre méthodes et un nouveau but. Le rond marque un virage venu de Sacha, le losange un virage venu de Claude, et l'axe du temps est coupé pour sauter le mois vide. Sources : le journal de bord (ml/ecurie/portfolio/journal, LISEZ-MOI § 2 et les chapitres de chaque jour) et les commits deacc99ad, 6f4dbdc29, d2ee1f114 et ef630b812.*

La même histoire, date par date :

- **Septembre 2026 : la sélection par générations dans une copie du jeu (`ml/train`).** Vingt-quatre voitures, chacune pilotée par un petit réseau de neurones. Les moins bonnes sont remplacées par des enfants modifiés au hasard. *Provoqué par* le souhait de Sacha : des voitures qui « apprennent à contrôler leur corps ». *Décidé par* Sacha pour la règle (« la moitié la plus nulle se fait remplacer ») et par Claude pour les réseaux et les notes. Le plan du 22/11 date l'essai de « juillet → septembre », mais git n'en garde la trace qu'à partir du 7/09. → `00_avant-le-22-novembre.md`
- **20/10 : la même sélection, mais dans le vrai jeu (`ml/reel`).** *Provoqué par* la copie du jeu, qui avait divergé du jeu publié (gravité, largeur de route, règles des figures), et par la demande de Sacha : des bots « fonctionnels sur la version actuelle du jeu ». Résultat : 3 survivants sur 6 pistes neuves, 0,2 figure par partie. → `00_avant-le-22-novembre.md`
- **22/11 : des cerveaux lisibles écrits par Claude.** « Claude écrit le cerveau du bot, le vrai jeu le note, Claude lit les échecs et réécrit. » *Provoqué par* le constat qu'après 300 générations, la sélection au hasard n'avait produit aucune figure. *Proposé par* Claude. Le plan porte la mention « proposé, pas encore validé par Sacha ». → `2026-11-22_23.md`
- **24/11 : un nouveau but, pas encore une nouvelle méthode.** Sacha remplace « des bots qui jouent vraiment » par « des bots indiscernables, à chaque palier ». → `2026-11-24.md`
- **25/11 : la boucle payante.** Des modèles de Claude, payés sur le crédit d'API, écrivent des variantes d'un premier pilote. *Résultat :* aucun gain qui tienne sur des courses neuves. → `2026-11-25.md`, `2026-11-25_suite.md`
- **26/11 : un pilote réglé à la main, un défaut à la fois.** *Provoqué par* Sacha, qui trouve les bots « trop frileux de s'envoler » et demande à 12:11 UTC une enquête sur tout ce qui distingue encore un bot d'un joueur. Claude choisit de ne pas relancer la boucle payante : elle ne notait que le palier. Il écrit une mesure de ressemblance, « l'écart aux joueurs ». → `2026-11-26.md`
- **27/11 : retour à la sélection naturelle, mais hybride et dans le vrai jeu.** *Décidé par* Sacha à 15:25 UTC : « le plan que tu as fait ne me correspond pas vraiment » ; la veille (26/11, 12:54 UTC), il demandait déjà pourquoi ne pas lancer « plein de simulations en local » sur un autre PC. *Forme choisie par* Claude : le génome part du pilote écrit à la main, avec deux petits réseaux « muets » à la naissance. Un bot est jugé sur toutes ses courses, pas sur une seule manche. *Le soir même*, le système construit tourne pour la première fois sur le Xeon ; les cinq gestes de joueurs relevés par les enquêtes du jour ne sont plus réglés à la main, mais offerts à la sélection, éteints à la naissance. → `2026-11-27.md`
- **28/11 : le mur du hasard ; on juge les idées une par une.** *Provoqué par* deux mesures de la nuit. Le coffre (40 courses jamais utilisées pour choisir un pilote) montre que les champions de la boucle payante ne vont pas plus loin que le pilote de départ. L'étude du réglage montre que le hasard d'une course (3,26 paliers) pèse environ dix fois plus que l'écart vrai entre deux enfants (0,32). *Décidé par* Claude (la session principale), Sacha n'ayant rien écrit après 23:35 UTC : ne plus chercher de petits réglages, mais des changements de structure, écrits comme des gènes éteints à la naissance et jugés un par un sur 96 courses identiques (le « banc des gènes »). La sélection reste en marche, comme juge gratuit. *L'après-midi*, quatre idées nouvelles deviennent des gènes éteints (le lot « gènes v4 »), le banc devient plus rigoureux (question écrite avant de jouer, arrêt quand c'est clair), et la sélection du Ryzen essaie elle-même les interrupteurs du banc (les greffes). La première des quatre idées, la sortie préparée, se révèle muette par construction : mesurée, écartée, remplacée par la nitro au décollage sur les maps à décor (décision de la session principale). La frise s'arrête au 27/11 : ce virage n'y est pas dessiné. → `2026-11-28.md`, `2026-11-28_suite.md`

---

## 3. Le registre des impasses

Tout ce qui a été essayé puis écarté ou remplacé, une ligne par essai. Le chiffre est celui qui a tranché.

| l'idée | date | ce qu'on a mesuré | pourquoi écarté | chapitre |
|---|---|---|---|---|
| Corriger la copie de la physique des bots | jusqu'au 08/09 | 3 passes et 2 agents critiques sans y arriver | remplacée par une seule fonction pour le joueur et les bots (écart 0 sur 3 000 pas) | 00 |
| Imiter les parties de Sacha (clonage) | 08/09 | 98,9 % des morts en vol, contre 96,0 % au hasard ; critère jugé invalide par le rapport lui-même | écarté par Sacha : « chacune se démerde » | 00 |
| Remettre à l'échelle ce que le réseau voit | 08/09 | record médian 4 995 → 3 244 m, 8 graines sur 8 en baisse | moins bien | 00 |
| Noter chaque voiture sur 3 pistes | 08/09 | 1 535 m contre 2 054 (graine 3), 658 contre 1 934 (graine 7) | moins bien ; mais remis par défaut le 09/09 sans nouvelle mesure | 00 |
| Pilote au sol écrit à la main (idée de Sacha) | 08/09 | médiane 2 898 m contre 3 047 m sans lui | plus régulier, pas meilleur | 00 |
| Sélection par vitesse | 10/09 | 2 120 m contre 2 660 m | moins bien, annulée | 00 |
| Réseau plus gros (32 neurones), décisions à 30 par seconde | 18/09 | 2 611 et 2 675 m contre 2 660 m | du bruit | 00 |
| Manche de 45 s | 19/09 | les crashs arrivaient après la fin ; le bonus d'arrivée ne servait jamais | remplacée par une manche proportionnelle à la piste | 00 |
| Récompenser les figures (0,08 / 1,2 / 3) | 20/10 | 0 figure, puis 1 bot sur 24, puis 0 | l'évolution ne trouve pas l'enchaînement | 00 |
| Entraînement noté sur les figures seules | 20/10 | 23 bots sur 24 en font ; sur courses entières, 1 % d'arrivées, 58 % de morts en vol | inutilisable en course ; la copie payait « figure puis explosion » | 00 |
| Sélection de zéro dans la copie du jeu (`ml/train`) | sept.–20/10 | 300 générations : 0 figure, record 11 746, champion seul 0 % d'arrivées | la copie avait divergé du vrai jeu | 00 |
| Sélection de zéro dans le vrai jeu (`ml/reel`) | 20/10 | 57 générations ; sur 6 pistes neuves, 3 survivent, 0,2 figure par partie | « pas fiable » ; remplacée par le plan du 22/11 | 00 |
| Jouer plusieurs courses dans le même processus | 23/11 | même graine identique 9 à 34 s, puis écart sur la nitro | une course par processus neuf | 22_23 |
| Un « bac fermé » pour le cerveau | 23/11 | le bac laissait passer l'horloge de l'ordinateur et le hasard (défaut n° 1 sur 28) | corrigé le 24/11 | 22_23, 24 |
| Courses de 60 s pour valider le simulateur | 23/11 | deux pannes (portail bloqué, grotte jamais bâtie) vues seulement au-delà de 110 s | mesures plus longues | 22_23 |
| Filmer avec l'enregistreur vidéo du navigateur | 24/11 | environ 12 images par seconde | remplacé par un encodage image par image (60 images/s) | 24 |
| Rejouer dans le navigateur sans recaler le hasard | 24/11 | course identique 56,6 s, puis une autre route | recalage du hasard : 1 879 décisions sur 1 879 | 24 |
| Noter le bot au régime maximum du jeu | 24/11 | Crypto City dans 4 courses sur 20 ; les 14 parties de joueurs sont toutes en allégé | les bots jouent la version allégée, celle des joueurs | 24 |
| 500 ms de vraie montre par décision | 24/11 | deux courses de même graine diffèrent sur un PC chargé (3 et 10 décisions coupées) | 5 s par décision | 24 |
| Courses de 180 s au plus | 24/11 | un bot ne pouvait pas dépasser le palier 15 environ | 900 s | 24 |
| Canyon sans relief dans le simulateur | 24–25/11 | meilleur palier de la référence 25 → 18 une fois les parois remises | « en partie un défaut du simulateur » | 24, 25 |
| Un gros workflow d'agents payé sur l'abonnement | 25/11 | 152 agents ; l'abonnement vidé | « à ne pas refaire » ; le travail lourd passe sur la clé d'API | 25 |
| Calibrage : variantes d'Haiku 5.5 | 25/11 | en grand, 11 et 10,5 contre 11 pour le parent | pas de progrès | 25_suite |
| Calibrage : variante c0011 de Sonnet 5.5 | 25/11 | 13,5 au tri ; sur 20 graines neuves, 10,5 contre 11 | « NE TIENT PAS » | 25_suite |
| Calibrage : variantes d'Opus 5.5 | 25/11 | meilleure à 11 au tri, moyenne 9,3 | pas de progrès | 25_suite |
| Calibrage : Fable 5.2 | 25/11 | réponse coupée à 32 000 jetons, 1,91 € pour aucune variante | inutilisable avec cette limite | 25_suite |
| Choisir le modèle « au plus de variantes par euro » | 25/11 | la règle désignait Haiku | « Le PC limite le nombre de tours, pas l'argent » : Sonnet choisi | 25_suite |
| La règle de rythme de la chaîne des deux semaines | 25–26/11 | bloquée du 25/11 au soir au 26/11 à 12 h 55 (« 14 € permis ») | corrigée le 26/11 ; la chaîne n'a payé aucune tranche | 25_suite, comment |
| Le juge comme mesure de progrès | 26/11 | il reste à 0,97 quoi qu'on corrige | remplacé par « l'écart aux joueurs » | 26 |
| L'écart aux joueurs plafonné à 4 par mesure | 26/11 | se cacher sous la route ne coûtait pas plus qu'un petit écart | plafond porté à 8 | 26 |
| Figures avec une direction en alternance, pose proche | 26/11 | 5 morts sur 23 ; avec la pose à plus de 2,2 s, 0 sur 12 | figures seulement si la pose est à plus de 2,2 s | 26 |
| Des vols plus hauts | 26/11 | 3 morts sur 10 | trop de morts | 26 |
| Plus de nitro au sol (première version) | 26/11 | 53 % du temps → palier médian 7 au lieu de 9,5 | trop cher ce jour-là ; repris et gardé le 27/11 sur le pilote corrigé | 26, 27 |
| Un slalom plus serré | 26/11 | rythme inchangé (0,99 s par aller, joueurs 0,58 s), un palier et demi perdu | sans effet | 26 |
| Rouvrir la grotte aux sorties voulues | 26/11 | deux fois plus de raccourcis, un palier à un palier et demi de moins | laissée fermée, arbitrage confié à la boucle | 26 |
| Coups de nitro en vol pour sortir de sous la route | 26/11 | palier médian 5 au lieu de 8 | trop cher | 26 |
| Sortie de sous la route en biais doux | 26/11 | une sur deux retombe dessous | ne marche pas | 26 |
| Avance de 0,15 s ou 0,35 s dans la loi de vol corrigée | 26/11 | 180 et 185 paliers contre 193 avec 0,25 s | moins bien | 26 |
| Contre la pose en travers : viser au sol avec de l'avance | 26/11 | 180, 192, 177 paliers contre 193 | moins bien | 26 |
| Contre la pose en travers : se redresser au-dessus de la dalle | 26/11 | glisse inchangée, 0,34 à 0,37 rad | sans effet | 26 |
| Contre la pose en travers : planer réacteur allumé | 26/11 | 12 à 19 morts pour 100 vols | trop de morts | 26 |
| Relancer la boucle payante notée au seul palier | 26/11 | elle aurait dépensé 12 € par jour « à polir ce que Sacha vient de refuser » | réécrite (palier et ressemblance), pas lancée | 26 |
| La nitro presque partout, gardée jusqu'au bord | 27/11 | écart 1,33 et 1,27, mais 147 paliers contre 181 et 0,2 figure par minute au lieu de 0,7 | la nitro et les figures se paient sur la même jauge | 27 |
| La loi « retour » réglée à la main | 27/11 | glisse 0,32 contre 0,38, morts dans le bruit | pas franchement meilleure ; réglages laissés à la sélection | 27 |
| Régler le pilote à la main (la méthode) | 27/11 | réglages des 26 et 27/11 : écart aux joueurs 2,00 → 1,67, palier médian 8,5 → 7,5 | écarté par Sacha : « le plan que tu as fait ne me correspond pas vraiment » | 27 |
| Renvoyer le dernier sur une seule manche de 12 courses | 27/11 | bruit du palier 3,21 par course contre 0,86 entre pilotes ; « tirer au sort à 60 % » | note cumulée sur toutes les courses | 27 |
| Un réseau parti de zéro | 27/11 | l'essai d'octobre (selon la spécification, non revérifié) | réseaux « greffés » muets sur le pilote | 27 |
| Un seuil d'alerte « population trop semblable » fixé avant toute vraie population | 27/11 | une vraie population de 20 vaut 0,028 à sa naissance, sous le seuil de 0,05 : l'alerte est levée dès la génération 0 | seuil ramené à 0,012, recalé sur la mesure | 27 |
| Croire les enquêtes d'agents sur parole | 27/11 | slalom annoncé 0,70 s, rejoué 1,16 et 0,80 s ; « sans morts nettes » démenti (7 contre 5) | chaque enquête est relue par un vérificateur qui refait les mesures | 27 |
| Un compte rendu à chaque fin de session | 24–25/11 | deux comptes rendus (25/11), aucun ensuite | laissé ; ce journal prend le relais | comment |
| L'agent payant « voltige » | 26/11 | une session Claude ne peut pas lancer une dépense (« l'app l'a refusé ») | prêt, jamais lancé | 26, comment |
| **La boucle payante sur le Ryzen** (88 versions du pilote, cinq champions sacrés) | 27–28/11 | c0064 contre le pilote de départ c0025 : +2,00 paliers [+0,75 ; +3,40] sur les 20 courses de validation, rejouées à chaque sacre ; +0,03 [−1,18 ; +1,38] sur les 40 graines du coffre, jamais utilisées pour choisir (160 courses) | la chance du gagnant : 21,61 € et plus de neuf heures de Ryzen sans meilleur pilote ; ses quatre idées restent des gènes éteints à la naissance | 28 |
| Prendre c0101 comme point de départ de la sélection | 28/11 | avis de Claude à 0 h 23 (« trop grand pour n'être que de la chance ») ; au coffre, c0101 fait +0,03 [−1,18 ; +1,23] | démenti par le coffre : le témoin reste c0025. Une erreur de Claude | 28 |
| Le verdict provisoire de l'agent de la mesure (« le témoin doit être c0064 ») | 28/11 | rendu après 4 graines ; son relecteur, sur 10 graines : −1,20 palier pour c0064 | jugé non soutenu ; mesure finie sur les 40 graines | 28 |
| Quatre interrupteurs qui ne se déclenchent presque jamais : coupOn, relacheOn, largeOn, libreOn (banc des gènes) | 28/11 | sur 96 graines, 59, 45, 93 et 83 courses exactement pareilles à celles du pilote de départ ; aucun effet sûr sur le palier ni sur l'écart E | ils changent trop peu de courses pour aider ou nuire : restent éteints, pas rejoués | 28 |
| **Chercher le progrès par petits réglages** (la sélection telle quelle, comme la boucle) | 28/11 | hasard d'une course 3,26 paliers (écart-type) ; écart vrai entre mutants 0,32 [0 ; 1,07] ; aucun des 25 mutants nettement meilleur ni pire | le classement est fait « à 80 ou 90 % de hasard dans le cas le plus probable » : on passe aux changements de structure, jugés un par un sur le banc des gènes | 28 |
| L'ancienne validation du sacre (24 courses neuves d'un coup) | 28/11 | un vrai +1 palier reconnu 15 fois sur 100 | remplacée par le sacre séquentiel (33 sur 100) | 28 |
| L'alarme « malédiction du gagnant » de la sélection | 28/11 | quand tout marche, la malédiction attendue vaut déjà 1,1 à 1,8 palier : l'alarme aurait sonné par construction | coupée ; la mesure reste écrite | 28 |
| Compter les courses d'entraînement dans le jugement du sacre | 28/11 | 53 à 62 % de faux sacres (étude du sacre) | écarté | 28 |
| Le tri précoce des enfants (couper après 3 courses) | 28/11 | environ 1 % du temps gagné par enfant coupé, aucun effet au simulateur | écarté | 28 |
| Rejouer seulement les jeunes et les 4 meilleurs | 28/11 | gain choisi et jugé sur les mêmes mondes simulés ; sur des mondes neufs, +0,05 ± 0,06 palier | le même piège que la boucle, dans le simulateur | 28 |
| **La sortie préparée par les rayons du bord** (`sortieOn` du contrat : au bord d'une map à décor, planer si c'est le seul vol que les yeux voient se poser ; n° 1 des prochaines idées) | 28/11 | 0 déclenchement en 13 vraies courses ; puis 40 courses mesurées, 180 décollages subis distincts, 24 morts : la règle aurait agi 0 fois ; aux 24 morts, aucune autre façon de voler n'annonçait de pose ; le bord n'est annoncé que 0,28 s avant le décollage (la main met 0,2 s) ; « planer » au bord finit contre le décor dans 57 vols qui s'étaient posés | muette par construction, et nuisible si on la forçait : remplacée par la nitro au décollage sur les maps à décor (même gène, éteint, effet sur le palier non mesuré) | 28_suite |

---

## 4. Les décisions de Sacha

Les citations ont leur orthographe rectifiée, jamais leur sens. Les heures sont en UTC.

- **Septembre (date exacte non retrouvée)** : la physique des bots doit être « STRICTEMENT isomorphe » à celle du joueur, une règle « répétée 4× par Sacha ». → 00
- **08/09** : « la moitié la plus nulle se fait remplacer » ; il abandonne le clonage : « chacune se démerde ». → 00
- **19/09** : il classe les champions par taux de finition (« décision propriétaire »). → 00
- **20/10** : « débrouille-toi je veux des bots qui marchent », puis des bots « fonctionnels sur la version actuelle du jeu ». → 00
- **23/11 (soir)** : il joue les cinq premières parties de l'étalon, au clavier. Aucune phrase de lui n'a été trouvée pour les 22 et 23/11. → 22_23
- **24/11** : les parties de Léo au téléphone comptent dans l'étalon. → 24
- **24/11** : le nouveau but : « des bots qui peuvent faire des matchmaking du record de palier 1 au palier 30, et qu'on ne puisse pas faire la différence entre eux et des vrais joueurs » ; « on garde bien des traces visuelles pour le portfolio ». → 24
- **24/11, 19:41** : « tous les 200 crédits API en 2 semaines », avec à chaque fin de session « un petit compte rendu esthétique et testable ». → 24, 25
- **25/11, 12:27** : « […] tu as utilisé tout mon Fable sans toucher au crédit API, reprends le travail de Fable avec les crédits API […] ». → 25
- **25/11, 12:29** : « la réinitialisation de Fable arrive dans 24 heures, organise-toi pour ne pas t'arrêter d'ici là » ; « là, il reste 7 % de mon abonnement ; je t'avais demandé d'utiliser les tokens pour ça justement ». → 25, comment
- **25/11, 13:00** : « clôturer le travail amorcé ici sans bâcler le travail débuté par Fable ». → 25
- **25/11, 19:00 et 19:07** : « des jolies photos techniques des simulations pour le portfolio ». → 25_suite
- **25/11, 22:27** : « envoie une vidéo du meilleur bot ». → 25_suite
- **26/11, 11:56** : « fais-moi une note de passation pour reprendre où tu en étais ». → comment
- **26/11, 12:00** : les bots sont « encore trop frileux de s'envoler et de faire des figures dans les airs ». → 26
- **26/11, 12:11 et 12:13** : « ça, c'est le genre de choses auxquelles tu aurais dû penser ; lance une sous-session enquête : tous les éléments à ajouter aux bots pour simuler de vrais joueurs » ; « si tu as besoin, je peux t'enregistrer d'autres parties, bien sûr ». Sacha corrige ici la méthode de Claude : tout mesurer avant de corriger. → 26, comment
- **26/11, 12:54** : « au lieu de tout faire tourner sur Claude, on ne peut pas les mettre sur un autre PC avec carte graphique pour lancer plein de simulations en local ? ». La première poussée vers un calcul local et gratuit, un jour avant le changement de cap. Réponse de Claude non retrouvée dans les sources (`PASSATION.md` écrit le même jour qu'« une carte graphique n'y change rien »). → 26
- **26/11, 15:47** : « ne me pose pas ce genre de question, travaille en autonomie ». Sacha corrige ici la méthode de Claude. → 26, comment
- **27/11, 13:40** : « je lance la boucle sur le Ryzen, continue sans t'arrêter ». → 27
- **27/11, 14:07** : « il ne faut pas que tu t'arrêtes comme ça, hein ; tu ne finis que quand tu penses avoir besoin que je prenne une vraie décision ». → 27, comment
- **27/11, 14:11** : une information collée sur la boucle du Ryzen : 12 € par lancement, arrêt à 60 € au total, à compter dans les 200 € ; ne lancer ni `chaine.js` ni `boucle.js` sur le Xeon. → 27
- **27/11, 14:25** : « gère mieux l'abonnement, tu utilises trop Fable par rapport à Opus ». → 27, comment
- **27/11, 14:31 à 14:35** : « mais je t'ai mis en ultra code, c'est pas le but justement » ; « cramer 100 % de la semaine […] et les 200 crédits API, tu gères ça comme tu veux ». Claude avait compris « économise ». → 27, comment
- **27/11, 15:25** : « laisse tomber la vidéo » ; « le plan que tu as fait ne me correspond pas vraiment » ; un système « où le bot le moins bon est viré […] juste par sélection naturelle ». → 27
- **27/11, 15:40 et 15:42** : « pourquoi on n'a pas fait ça dès le départ ? » ; « il faut que tu arrêtes de suivre les plans ». Sacha corrige de nouveau la méthode de Claude. La même minute, il demande s'il doit arrêter les essais sur le Ryzen ; Claude répond non pour l'instant, jusqu'à la livraison du système de sélection (d'après la conversation du 27/11). → 27
- **27/11, 17:14** : « il faut qu'on garde des traces de tous les process, pour un portfolio ». Ce journal en est la réponse. → 27, comment
- **27/11, 23:22** : il colle le compte rendu de l'assistant de Sacha sur le Ryzen : la boucle payante s'arrête, la sélection naturelle s'installe sur le Ryzen, et « j'accepte l'envoi horaire de l'histoire sur GitHub ». → 28
- **27/11, 23:35** : les résultats de la boucle sont poussés sur une branche à part (13 commits), la sélection tourne « depuis 00:29 » ; il signale deux défauts de l'installation (une autre version de Node passait devant ; les tâches planifiées avaient une limite de 72 heures). Le relevé, refait le 28/11 au matin, ne contient aucun message de lui ensuite. → 28
- **28/11, 12:07** : « tu peux utiliser plus de Fable si tu as besoin, c'est pas forcé, fais-le seulement s'il y a des tâches que Fable peut vraiment faire mieux ». → 28_suite
- **28/11, 12:17** : il colle le compte rendu de la mise à jour du Ryzen, faite par l'assistant de Sacha sur le Ryzen (relance à 13 h 11, heure de Paris). → 28_suite

---

## 5. Les chiffres qui résument

| mesure | valeur | source | chapitre |
|---|---|---|---|
| Sélection de zéro dans la copie du jeu, 300 générations | 0 figure | `5799d5bb1` | 00 |
| Vrai jeu joué sans écran | 6,8 fois le temps réel (de 2,4 à 11,1 selon la course) | `d304dad70`, `ml/reel/results/etape0.json` | 22_23 |
| Étalon (parties de vrais joueurs) | 14 parties sur 20 prévues : 10 de Sacha, 4 de Léo | `92fef5bd1` | 24 |
| Calibrage des quatre modèles | 4,63 €, 0 champion sacré | `8610302d2` | 25_suite |
| Premier pilote contre bot de référence, 12 graines de 600 s | palier médian 12,5 contre 6 | `09ed02872` | 25 |
| Écart aux joueurs (un vrai joueur comparé aux autres : 0,9) | 3,05 (premier pilote) → 1,67 (27/11) | `1ee936e15` | 26, 27 |
| Part du sol passée sous la route | 14 % → 2,3 % (joueurs 3 %) | `c72d25ecf` | 26 |
| Juge « humain ou bot » (AUC) | 0,97 : le bot est toujours reconnu | `63012939f`, `etude/realisme.md` | 26 |
| Courses par pilote pour voir 1 palier moyen d'écart | environ 140 | `etude/selection-naturelle/bruit/resultats.txt` | 27 |
| Crédit d'API dépensé sur ce PC | 36,92 € sur 200 (Ryzen non compté) | `ml/labo/journal/depenses.jsonl` | 25_suite, 27 |
| Première vraie sélection, génération 0 sur le Xeon | 280 courses en 81 min, 191 jouées à l'heure ; le témoin au palier moyen 6,5 ; aucun pilote meilleur que lui à 23 h 14 | `etat/generations.jsonl`, `etat.js` (copie à part du dépôt) | 27 |
| Faux sacres de champion, avant et après la correction | 18,3 % → 3,7 % | `e2ea8d2c9` | 27 |
| La boucle payante du Ryzen | 88 versions, 5 champions, 21,61 € | `ml/ecurie/etude/boucle-payante-ryzen/LISEZ-MOI.md` | 28 |
| Crédit d'API dépensé, les deux PC | 58,53 € sur 200 | `b1ff8af89` | 28 |
| Son champion c0064 contre le pilote de départ : validation (20 graines réutilisées) → coffre (40 graines neuves) | +2,00 [+0,75 ; +3,40] → +0,03 [−1,18 ; +1,38] palier | `coffre/sorties/resume.txt` | 28 |
| Hasard d'une course, écart vrai entre deux mutants | 3,26 paliers (écart-type) ; 0,32 [0 ; 1,07] | `etude/reglage-de-la-selection/LISEZ-MOI.md` | 28 |
| Sacre : un vrai +1 palier reconnu | 15 → 33 fois sur 100 (sacre séquentiel) | `3b1bf15e5`, `ml/evolution/notes/LIVRAISON-REGLAGE.md` | 28 |
| Sélection sur le Ryzen, génération 0 | 280 courses en 40 min, 418 à l'heure, 10 à la fois | `origin/evolution-ryzen`, `resume.txt` | 28 |
| Jetons des quatre équipes d'agents de la nuit | 7 192 979, 31 agents | `portfolio/orchestration/LISEZ-MOI.md` | 28 |
| Sélection sur le Ryzen, envoi du 28/11 à 14 h | génération 17 ; 495 courses à l'heure ; 0 sacre sur 3 tentatives ; champion = témoin | `origin/evolution-ryzen`, `resume.txt`, `histoire.md` | 28_suite |
| Génome v:4 | 129 gènes (8 nouveaux, éteints ou figés), 25 compteurs de déclenchements | `7f85efb38`, `ml/evolution/notes/genes-v4.md` | 28_suite |
| La sortie préparée, mesurée | 0 déclenchement ; 180 décollages subis distincts, 24 morts, aucune issue vue ; 0 décollage nitro allumée sur 253 (joueurs : 0,625) | `etude/sortie-preparee/LISEZ-MOI.md` | 28_suite |

---

## 6. Ce qu'on peut montrer

Contrôlé le 27/11 avec `ls` et `git ls-files` ; recontrôlé le 27/11 à 23 h 14, après les commits du soir, puis le 28/11 vers 7 h 40 pour les pièces de la nuit (en fin de tableau).

**Ce qui existe**

| pièce | ce que c'est | dans git ? |
|---|---|---|
| `ml/ecurie/portfolio/index.html` | la page portfolio du 25/11 : schémas de l'architecture et de la boucle, arbre du calibrage, « Ce qui n'a pas marché » | oui |
| `ml/ecurie/portfolio/images/*.svg` (sauf `journal-*`) | 5 figures de la page du 25/11 (`course-dessus`, `radar`, `main`, `paliers`, `justesse`), chacune en clair et en sombre ; refaites par `node ml/ecurie/portfolio/figures.js` à partir de `donnees/radar-c0003-g910629.json.gz` | oui |
| `ml/ecurie/portfolio/images/journal-*-clair.svg` et `-sombre.svg` | les 5 images du journal, chacune en clair et en sombre (les chapitres montrent la version claire) : la **frise** des changements de méthode (§ 2 ci-dessus et `2026-11-27.md`), les **apprentissages de zéro** de septembre et octobre (`00_avant-le-22-novembre.md`), les **dépenses** du crédit d'API (`2026-11-25_suite.md`), **ressembler ou gagner**, le chemin du pilote du 25 au 27/11 (`2026-11-26.md`), et le **bruit des notes** (`2026-11-27.md`) | oui depuis `53703c501` (27/11, 19 h 18) |
| `ml/ecurie/portfolio/figures-journal/*.js` | les 5 scripts qui fabriquent ces images, un par image, chacun avec en tête la liste des fichiers qu'il lit ; ils ne jouent aucune course. Pour refaire une image, depuis la racine du dépôt : `node ml/ecurie/portfolio/figures-journal/<nom>.js` (`frise`, `apprentissages-de-zero`, `depenses`, `ressembler-ou-gagner`, `bruit-des-notes`). Limite : `ressembler-ou-gagner.js` lit aussi `ml/labo/tampon/boucle/val-c0010.json`, hors git, et s'arrête sans lui | oui depuis `53703c501` |
| `ml/labo/arbre.html` | l'arbre des cerveaux du labo (calibrage du 25/11) | oui |
| `ml/labo/rejeux/*.json` | les touches image par image des courses gardées (cerveaux c0001 à c0004 et suivants) : de quoi refaire un film | oui |
| `ml/labo/trajectoires/*.json.gz` | les mêmes courses vues de dessus | oui |
| `ml/labo/videos/*.webm` | 4 films de courses (c0001-g910407, c0003-g910407, c0003-g910629, c0004-g910000), du 24 et 25/11 | **non** (dossier ignoré ; ils se refont à partir des rejeux) |
| `ml/ecurie/portfolio/images/journal-le-jeu.jpg` | une image du jeu, la voiture en vol au-dessus de la route (premier pilote, 25/11), en tête de ce LISEZ-MOI | oui depuis `4c1fe5c3c` (27/11, 19 h 43) |
| `ml/ecurie/portfolio/images/journal-planche-reference.jpg` | la **planche** du bot de référence : neuf instants de sa course de 39,9 s, jusqu'à sa chute sur la roche (`2026-11-24.md`) | oui depuis `4c1fe5c3c` |
| `ml/ecurie/portfolio/images/journal-planche-pilote.jpg` | la **planche** du premier pilote : neuf instants de sa meilleure course (5 min 40 s, quatre maps, des vols de 5 s) (`2026-11-25_suite.md`) | oui depuis `4c1fe5c3c` |
| `ml/ecurie/portfolio/images/journal-duel-meme-piste.jpg` | le **duel** : la référence et le premier pilote sur la même piste, aux mêmes instants, côte à côte (`2026-11-25_suite.md`) | oui depuis `4c1fe5c3c` |
| `ml/ecurie/portfolio/figures-journal/planche.js` | le script de ces quatre images : il lit un film (Chrome sans écran et muet, sans ffmpeg) et compose la planche ; il ne joue aucune course. Les commandes exactes sont dans les chapitres où les images paraissent. Limite : il lit les films, qui sont hors git | oui depuis `4c1fe5c3c` |
| `ml/labo/projection/page.html` | la salle de projection (`node ml/labo/projection.js`) | oui |
| `ml/ecurie/comptes-rendus/compte-rendu-01.html`, `-02.html` | les deux comptes rendus pour Sacha, du 25/11 | oui |
| `ml/ecurie/etude/*.md`, `etude/selection-naturelle/` | l'étude du 24/11 (neuf rapports, 28 défauts), l'enquête réalisme du 26/11, la spécification, l'étude du bruit et les quatre enquêtes du 27/11 | oui (la sélection naturelle depuis `033bfebeb`) |
| `ml/ecurie/consignes-agents/*.md` et `ml/ecurie/agents/2026-11-25T*.md` | 7 consignes données aux agents et 7 rapports, avec leur coût | oui |
| `ml/ecurie/pilote.js`, `ml/ecurie/pilote-voltige.js` | les deux pilotes, avec leur stratégie en français en tête du fichier | oui |
| `ml/bot/etalon/cashcar-parties-*.json` | les exports bruts des parties de Sacha et de Léo | oui |
| `ml/sim/apercu-31415.png` | une image de septembre : la piste vue de dessus, 7 bots, « 0 pris » sur 5 981 raccourcis | oui |
| `ml/train/results/runs/run-seed*.json`, `ml/reel/results/pop-reel-g1.json` | 21 courbes d'apprentissage de septembre et 57 valeurs d'octobre ; deux des 21 courbes (le run de 300 générations) et les 57 valeurs sont dessinées dans `journal-apprentissages-de-zero` | oui |
| `ml/train/archive-2026-09-09/rapports/RAPPORT-SESSION-2026-09-08.md`, `ml/train/CRITIC-REPORT.md` | le rapport où Claude liste ses huit erreurs ; 83 verdicts d'un agent relecteur | oui |
| `ml/evolution/` (le code, `README.md`, `notes/LIVRAISON.md`, `tests/relecture-robustesse/etat-journaux/tableau.html`) | le système de sélection naturelle, son mode d'emploi pour Sacha, l'état de la livraison au Ryzen et un tableau de bord sur des données de test | oui depuis `e2ea8d2c9` (27/11, 19 h 32, envoyé sur GitHub) ; les finitions du soir dans `7c5204afa` (23 h 12), pas encore envoyé à 23 h 14 |
| `ml/evolution/arbre.js` et `essais/integration/etat/arbre.html` | l'**arbre généalogique** des pilotes : un point à la naissance, un trait jusqu'au renvoi, un fil vers chaque parent, la lignée du champion en vert ; un clic ouvre la fiche d'un pilote, avec ce qui a changé gène par gène. La page ne demande pas Internet. Celle qui existe vient d'un essai (4 pilotes, 3 générations), pas d'une vraie sélection | le programme oui (`7c5204afa`) ; la page **non** (`essais/` est ignoré) |
| `ml/evolution/histoire.js` et `essais/integration/etat/histoire.md` | le **récit** de la sélection, écrit par elle-même à chaque génération : « Où on en est » en dix lignes, puis une entrée par génération (naissances, renvois, meneur, coffre). Même essai | le programme oui (`7c5204afa`) ; le récit **non** (ignoré) |
| `CASH-CAR-evolution-essai/ml/evolution/etat/tableau.html`, `resume.txt`, `sortie.log` | le **tableau de bord** et le journal de la première vraie sélection, sur le Xeon, refaits à chaque génération (code de 19 h 32 : ni arbre ni récit) | **non** (une copie à part du dépôt, sur aucune branche `evolution-…` ; `sortie.log` n'est jamais enregistré) |
| `ml/evolution/sauver-traces.cmd` | la mise à l'abri : chaque heure, les journaux légers, l'arbre, le récit et le tableau partent sur une branche à part, `evolution-<pc>`, jamais sur celle du jeu ; c'est elle qui gardera la trace des générations du Ryzen | le programme oui (`7c5204afa`) ; jamais essayé vers le vrai GitHub au 27/11 |
| `ml/ecurie/agents/tmp-voltige/` (dont `paroles-sacha.md`) | les messages datés de Sacha ; 525 fichiers d'outils et de sorties de lots au soir du 27/11 | **non** (dossier ignoré : fragile) |
| `ml/ecurie/portfolio/orchestration/` | les quatre travaux d'équipes d'agents du 27/11 (construction et finitions de `ml/evolution`, ce journal, ses images) : pour chacun le script qui a lancé l'équipe et le compte rendu de chaque agent, sortis par `outils/orchestration.js` ; un `LISEZ-MOI.md` dit qui écrit, qui relit, ce que les relecteurs ont trouvé, le coût en jetons et ce que la méthode ne garantit pas. Depuis le 28/11 au matin, aussi les quatre travaux de la nuit (`traces-du-soir/`, `reglage/`, `portage/`, `changements-surs/` : 31 agents) et la leçon de méthode de la nuit | les quatre du 27/11 **oui** ; ceux de la nuit et la mise à jour du `LISEZ-MOI.md` **non** au 28/11 à 7 h 40 |
| ce journal | `ml/ecurie/portfolio/journal/` | oui depuis `29bce656d` (27/11, 18 h 49), avec ses images et son lexique depuis `53703c501` et `4c1fe5c3c` ; le chapitre du 28/11 et cette mise à jour ne sont pas encore enregistrés au 28/11 à 7 h 40 |
| `ml/ecurie/portfolio/images/boucle-payante-lignee-clair.svg` et `-sombre.svg` | la **lignée de la boucle payante** : génération par génération, la note de validation et la note d'entraînement du champion ; la validation fait un seul saut, à c0064, puis reste plate (`2026-11-28.md`). Fabriquée par `ml/ecurie/etude/boucle-payante-ryzen/outils/figure.js` | oui (`7b1df608e`) |
| `ml/ecurie/etude/boucle-payante-ryzen/` | l'histoire de la boucle payante : ce que chaque champion a changé, les écarts de code entre champions (`diffs/`), et le **coffre** (`coffre/` : l'outil, les 160 courses, `sorties/resume.txt`, le tableau qui a démenti le « +2 ») | oui (`7b1df608e`, `00fb4cfad`) |
| `ml/ecurie/etude/reglage-de-la-selection/` | l'étude du réglage de la sélection : cinq études, chacune avec sa relecture, et la synthèse classée (`LISEZ-MOI.md`) | oui (`1f64c426b`) |
| `ml/ecurie/etude/banc-des-genes/` | le **banc des gènes** : l'outil (`jouer.js`, `analyser.js`), son mode d'emploi, son journal (`jouer.log`) et, depuis la fin de la mesure, le tableau des résultats (`sorties/resume.txt`) | oui depuis `46842ee77` (28/11, 11 h 02 ; `sorties/resume.txt` vu dans `git ls-files` vers 15 h) |
| `ml/ecurie/etude/sortie-preparee/` | l'**impasse de la sortie préparée** : l'étude des décollages, sa relecture adverse et la décision (`LISEZ-MOI.md`), ses tableaux (`sorties/decollages.txt`, `sorties/relecture.txt`) et les vues de chaque course (`sorties/lignes/`) ; `node analyser.js` et `node relecture.js` refont les tableaux sans jouer de course (`2026-11-28_suite.md`) | oui (`d30db9519`, fusionné dans `77083d123`) |
| `ml/evolution/notes/greffes.md`, `notes/genes-v4.md`, `notes/LIVRAISON-GENES-V4.md`, `ml/evolution/banc/README.md` | les **greffes**, le contrat du lot **gènes v4**, sa livraison, et le mode d'emploi du **banc v2** | oui (`5e7f311aa`, `7f85efb38`, `d30db9519`) |
| `ml/evolution/banc/vagues/v001-confirmation-gestes/` | la **vague 1** du banc v2 : sa question (`vague.json`) et son plan (`plan.json` : pilotes, graines, époque), enregistrés avant tout résultat ; ses résultats s'y ajouteront quand elle aura fini | les deux fichiers oui (`15c7f1cb3`) ; au 28/11 vers 15 h, aucun résultat |
| `ml/evolution/notes/LIVRAISON-REGLAGE.md` | la mise à jour du réglage de la sélection : ce qu'elle change, ce qui est vérifié, les gestes sur le Ryzen | oui (`3b1bf15e5`, `2a3bea3c1`) |
| la branche `origin/evolution-ryzen` | ce que la sélection du Ryzen envoie seule chaque heure : son banc (`machine.json`), ses dix lignes (`resume.txt`), la population (`population.json`), le récit (`histoire.md`) ; après l'envoi de 2 h (`71e7c7c2c`), plus rien n'est arrivé jusqu'à celui de 14 h (sa connexion à Internet a coupé ; les commits de chaque heure, faits sur place, sont arrivés avec lui) : l'envoi de 14 h (`9fcfbd2a0` : génération 17, la première greffe) | sur GitHub, branche à part |

**Ce que le plan prévoyait et qui n'existe pas encore** (`passation/BOTS-ML.md`, § 5.2 et 5.3)

- Le **bêtisier** : les morts les plus bêtes et les triches trouvées par les bots.
- Les **cartes** : toutes les trajectoires d'une génération superposées sur la route vue de dessus, les endroits où l'on meurt, les raccourcis découverts. Il existe une seule course vue de dessus (`course-dessus-*.svg`).
- Les **planches** : deux existent depuis le 27/11 (la référence et le premier pilote, ci-dessus). Il n'en existe aucune du pilote actuel (celui réglé les 26 et 27/11), ni d'une partie de Sacha : aucun film d'eux n'a été tourné.
- Les **duels côte à côte** : un duel bot contre bot existe (référence contre premier pilote, même graine). Le duel Sacha contre bot sur la même graine et le « même virage à travers les générations » n'existent pas.
- Les **courbes** par génération (note, figures par minute, poses, euros). Seule la meilleure distance par génération de septembre et d'octobre est dessinée (`journal-apprentissages-de-zero`), et, depuis le 28/11, la note du champion de la boucle payante génération par génération (`boucle-payante-lignee`) ; les figures, les poses et les euros par génération ne le sont pas, et la sélection du 27/11 n'a qu'une génération finie à 23 h 14 ; ses courbes seront celles de son tableau de bord, une fois qu'elle aura tourné sur le Ryzen.
- Les **jalons** : un instantané figé par étape (`ml/labo/jalons/` n'existe pas).
- Un film avec l'affichage du jeu (compteurs, argent) : les films actuels montrent l'image seule.

---

## 7. Les chapitres

| fichier | période | en une ligne |
|---|---|---|
| `00_avant-le-22-novembre.md` | sept.–oct. 2026 | deux sélections de réseaux partis de zéro, dans une copie du jeu puis dans le vrai jeu : on roule, on ne vole presque pas |
| `2026-11-22_23.md` | 22–23/11 | le plan « Claude écrit le cerveau », le vrai jeu remis en marche sans écran, le contrat du bot, les cinq premières parties de Sacha |
| `2026-11-24.md` | 24/11 | la boîte noire (le labo), deux versions du même jeu découvertes, le nouveau but de Sacha |
| `2026-11-25.md` | 25/11, jusqu'à 15 h 30 | les yeux et la main relus, l'abonnement vidé par erreur, le premier pilote payé sur la clé d'API |
| `2026-11-25_suite.md` | 25/11, soir | quatre modèles mis à l'épreuve, aucun ne fait mieux ; la page portfolio |
| `2026-11-26.md` | 26/11 | apprendre au pilote à voler, un défaut à la fois ; l'écart aux joueurs |
| `2026-11-27.md` | 27/11 | Sacha change de cap : du réglage à la main à la sélection naturelle ; le soir, la sélection tourne pour la première fois, sur le Xeon, et se prépare pour le Ryzen |
| `2026-11-28.md` | nuit du 27 au 28/11, et le matin | la sélection démarre sur le Ryzen ; le coffre montre que le « +2 paliers » de la boucle payante était de la chance ; le mur du hasard ; le banc des gènes est lancé |
| `2026-11-28_suite.md` | 28/11, de 11 h à 15 h | les greffes ; le Ryzen n'avait pas arrêté, seule sa connexion avait coupé ; le lot « gènes v4 » ; l'impasse de la sortie préparée, mesurée puis remplacée ; la vague 1 écrite avant d'être jouée |
| `LA-VOIX-DE-SACHA.md` | — | une page laissée vide exprès, à écrire par Sacha, avec les questions que le journal laisse ouvertes |
| `comment-on-a-travaille.md` | 21–27/11 | qui fait quoi, les règles de travail et le raté d'où chacune vient |
| `LEXIQUE.md` | — | les mots du chantier, par ordre alphabétique, en une ou deux phrases chacun |
| `MODELE-D-ENTREE.md` | — | le gabarit des entrées à venir |

---

## 8. Comment ce journal est tenu

- Chaque chapitre commence par « **En une minute** » : six à huit phrases simples, sans jargon, qui disent ce qu'on voulait, ce qui s'est passé, ce qui a raté et qui a décidé. Lues à la suite, d'un chapitre à l'autre, elles racontent toute l'histoire ; le reste du chapitre donne les détails et les sources.
- Les images du journal sont des fichiers SVG fabriqués par un script (`ml/ecurie/portfolio/figures-journal/`) à partir des fichiers du chantier, jamais dessinés à la main. Chacune est suivie de sa légende, qui nomme ses sources, et existe en clair et en sombre (§ 6).
- Les mots techniques sont expliqués à leur première apparition dans chaque chapitre, et tous ensemble dans `LEXIQUE.md`.
- Il est écrit par des agents Claude à partir de git (les messages de commit), des journaux du labo (`ml/labo/journal/*.jsonl`), des documents du chantier et du relevé daté des messages de Sacha. Personne n'écrit de mémoire.
- Chaque chapitre a été relu par un agent vérificateur, qui a rouvert les sources, corrigé les erreurs de lecture et noté ce qui manquait. Plusieurs corrections ont rendu à Sacha des idées d'abord attribuées à Claude.
- Le relevé des messages de Sacha se refait avec `node ml/ecurie/portfolio/outils/paroles.js <dossier des conversations> <sortie.md>`. Il reste hors git (c'est un relevé brut). Il a été complété le 27/11 au soir (49 messages au lieu de 40 : la première version oubliait les messages tapés pendant que Claude travaillait), et les chapitres ont été corrigés d'après lui.
- Ce qui n'a pas été retrouvé n'est pas écrit. Ce qui est incertain porte la mention « non vérifié ».
- Les citations de Sacha ont leur orthographe rectifiée, jamais leur sens. Seules les phrases qui concernent le chantier sont citées.
- Aucune clé, aucun jeton, aucune adresse n'apparaît dans le journal.
- À partir du 28/11 : une entrée par journée de travail, sur le modèle `MODELE-D-ENTREE.md`, et une ligne ajoutée au registre des impasses pour chaque essai écarté.
- Limite connue : les chapitres dépassent souvent la longueur visée (1 500 mots). Les vérificateurs ont préféré garder les faits sourcés.
