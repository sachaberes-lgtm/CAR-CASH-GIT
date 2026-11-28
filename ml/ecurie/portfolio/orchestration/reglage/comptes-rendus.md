# L'étude du réglage de la sélection naturelle : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `reglage-de-la-selection` (wf_f29df098-2f4), lancée par la session principale (Claude Fable).
- Agents : 11, tous du modèle claude-opus-5-5.
- Durée : 2 h 11 ; jetons consommés par les agents : 2 604 327 (2,60 millions) ; appels d'outils : 619.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. auteur de l'étude « effets » : ce que font vraiment les mutations, mesuré sur la vraie génération 0 (phase « Etudier »)
2. auteur de l'étude « simulateur » : une sélection simulée, sans aucune course, pour savoir si elle progresse et à quelle vitesse (phase « Etudier »)
3. auteur de l'étude « vitesse » : où part le temps d'une course et comment en jouer plus par heure (phase « Etudier »)
4. auteur de l'étude « tri précoce » : faut-il finir les courses d'un enfant visiblement raté ? (phase « Etudier »)
5. auteur de l'étude « sacre » : comment reconnaître un vrai meilleur sans sacrer un chanceux (phase « Etudier »)
6. relecteur de l'étude « effets » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI (phase « Relire »)
7. relecteur de l'étude « vitesse » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI (phase « Relire »)
8. relecteur de l'étude « tri précoce » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI (phase « Relire »)
9. relecteur de l'étude « sacre » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI (phase « Relire »)
10. relecteur de l'étude « simulateur » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI (phase « Relire »)
11. auteur de la synthèse : classe les changements (à faire, à essayer, à ne pas faire, à décider par Sacha) (phase « Synthese »)

## 1. etude:effets

*Rôle : auteur de l'étude « effets » : ce que font vraiment les mutations, mesuré sur la vraie génération 0. Phase : Etudier.*

### Résumé

Données figées le 27/11/2026 à 23:31:33 : 592 lignes de courses, avec les générations 0 et 1 finies. Le génome et les mutations des 26 pilotes viennent de population.json lu à 23:16:25. Aucune course lancée ; tout est en lecture seule.

1) Chaque mutant de la génération 0 a été comparé au témoin graine par graine, sur 24 graines appariées : 0 sur 19 nettement pire, 0 sur 19 peut-être meilleur, 0 « nul exact ». La note F a été refaite avec note.js : elle redonne celle du maître à 5e-5 près. Elle est ici quasi égale au palier, car l'écart aux joueurs E ne bouge pas (ΔE moyen +0,01).

Le test qui tranche : la différence d'un mutant sur les graines G0 ne prédit pas celle sur G1 (r = −0,13 ; on attendrait 0,56 si les effets valaient 1 palier). Côté nés de G1 :
- 9627905cd5bb (figTemps +0,08, bVersRoutePlane 2→0,16) joue 12 courses sur 12 identiques à son parent ;
- 92bcfe194dd3 fait +1,83 [−0,54 ; +4,21] contre son parent.
Comparés au seul témoin, les nés de G1 semblent tous pires : c'est la chance du témoin sur les graines G1. Aucun effet ne peut être attribué à un gène.

2) Le bruit, recontrôlé : 3,26 par course (900 s, contre 3,21 à 300 s), et une corrélation enfant/témoin de 0,12 sur une même graine.

Premier piège, trouvé grâce à un cas inventé dont on connaît la réponse : tous les mutants sont comparés au même témoin. Compter le bruit du témoin chez chacun écrase τ (0,62 trouvé pour 0,9 vrai). Le calcul a été refait en conséquence (moitié contre moitié, moments, vraisemblance, bootstrap des graines et des mutants).

La loi des effets :
- μ, l'effet moyen, vaut −0,42 palier [−1,52 ; +0,59] ;
- τ, l'écart des effets vrais entre mutants, vaut 0,32 [0 ; 1,07] ;
- létales : 0 sur 25 (part vraie au plus 14 %) ;
- mutants sans aucun effet : 0 sur 19 (au plus 18 %).

On ne voit qu'un effet d'au moins +2,2 paliers. La part des mutations utiles reste donc inconnue : de 0 à 57 % selon les tirages, et c'est la forme supposée (une loi normale) qui la donne, pas les courses. Je donne quatre scénarios plutôt qu'un chiffre. La fiabilité du classement fait par la sélection est de 19 % à 24 courses et de 10 % à 12 courses dans le scénario central : la sélection trie surtout du bruit.

3) Courses identiques (même graine, même empreinte de partie) :
- 64 sur 552, soit 12 % des courses, mais seulement 0,58 h sur 10,93 h, soit 5 % du temps, car ce sont des courses courtes (51,5 s de médiane contre 133,5 s) ;
- 48 copient une course du témoin ;
- le cache ne les reconnaît pas, car le texte du pilote change à chaque mutation, même muette.

Les réglages muets par construction (un drapeau éteint empêche le pilote de les lire) font 6 des 64 réels en v:1 (9,4 % ; 8 % des réels mutés observés). En v:2 ils sont 21 sur 79 : 25,3 % des réels tirés par muter, et 2 % des naissances n'ont que des changements muets.

Écarts aux attentes : le premier contrôle échouait parce que 10 paires de même empreinte avaient des empreinteVues différentes ; il compare désormais l'issue de la partie (0 écart), les vues et touches sont comptées à part. Vu en passant : à la génération 1, l'économie a fait passer les graines de 12 à 8 (8 682 s de courses sur le Xeon).

4) parametres-pour-le-simulateur.json est écrit et annoncé dans le LISEZ-MOI. Rien n'est commité ni poussé.

### Recommandations

- Changement : Simulateur de la sélection : prendre parametres-pour-le-simulateur.json et balayer les 4 scénarios (μ de −1,5 à +0,6 palier ; τ de 0 à 1,1). Bruit de 3,26 par course, corrélation enfant/parent de 0,12, 10 % de courses copiées du parent ; ne pas utiliser un chiffre unique de « part utile ».  
  Gain attendu : Savoir si la sélection progresse quelle que soit la valeur de μ. Au scénario central, la fiabilité du classement n'est que de 10 à 19 %.  
  Coût : Aucun sur le Ryzen ; quelques paramètres dans le simulateur.  
  Confiance : haute (mesuré) ; la forme normale est supposée
- Changement : Proposition à tester d'abord au simulateur : mutations plus fortes en phase A (config.json : sigmaMutation 0,15 → 0,30, ou poissonMutations 2 → 4).  
  Gain attendu : Un τ plus grand rend les différences visibles à la sélection (fiabilité 56 à 72 % si τ ≈ 1). Aucune mutation létale n'a été vue à 0,15 (au plus 14 %), il y a donc de la marge.  
  Coût : Plus de mutations nuisibles ; rien n'a été mesuré à σ 0,3 (un seul immigré : −0,46 [−3,3 ; +2,4] contre les 20 de G0). N'entre pas dans l'époque des courses (INTERFACES § 3.10). On saura si c'était vrai quand la corrélation moitié/moitié enfant − parent dépasse 0,3.  
  Confiance : basse
- Changement : Proposition : dans ml/evolution/genome.js, fonction muter, ne tirer les m réels que parmi ceux que le pilote lit. Retirer de l'urne ceux dont le drapeau de garde vaut 0 chez le parent : volRetour (volRetourOn), retMarge/retCap/retGain/retAvance/retourPrime (retourOn), et les 15 réels des gestes (lacheOn, slalomOn, coupOn, relacheOn, suitOn). Le tirage des drapeaux ne change pas.  
  Gain attendu : En v:2, +34 % de réels qui agissent à chaque naissance (25,3 % des tirages sont perdus aujourd'hui). Les 2 % de naissances entièrement muettes disparaissent : elles coûtent 12 courses et une des 6 places. On vérifiera en relançant muets.js, qui doit alors trouver 0 % de réels muets tirés.  
  Coût : Une dizaine de lignes. genome.js fait partie de l'époque (§ 9.3) : à faire à la prochaine époque voulue. On perd la dérive cachée des réglages des gestes éteints.  
  Confiance : haute sur le compte, moyenne sur l'utilité
- Changement : Ne rien faire pour l'instant contre les courses identiques (pas de cache « au comportement », pas de rejeu des vues). Relancer analyser.js dans quelques générations.  
  Gain attendu : Le gain possible plafonne à 5 % du calcul (12 % des courses, mais des courses courtes).  
  Coût : Aucun ; un rejeu des vues serait lourd à écrire. En reparler si la part dépasse 15 % du temps.  
  Confiance : moyenne
- Changement : Sur le Ryzen, mesurer d'abord le débit, puis relever config.json seuilEconomie_s (5 400 s) si 12 graines n'y tiennent pas. La génération 1 sur le Xeon a pris 8 682 s et l'économie est passée à 8 graines.  
  Gain attendu : Garder 12 courses par génération ; à 8, la fiabilité du classement tombe sous 10 % au scénario central.  
  Coût : Des générations plus longues.  
  Confiance : moyenne

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\parametres-pour-le-simulateur.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\resultats.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\resultats.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\analyser.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\outils.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\verifier.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\verifier.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\muets.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\muets.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\extraire.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\donnees\LECTURE.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\effets\donnees\population-g1-debut.json

### Doutes

- μ (l'effet moyen d'une mutation) est mal connu, [−1,52 ; +0,59] : il est limité par les 24 seules courses du témoin, qui seul sert de référence. Les parts nuisible / utile dépendent donc surtout du scénario choisi.
- La loi normale des effets est supposée : 19 mutants ne montrent pas sa forme (par exemple une longue queue d'utiles ou de létales rares).
- Les gènes muets par construction sont lus dans le code (genome.js e2ea8d2c9 et HEAD, INTERFACES § 9.3), pas vérifiés par des courses dans cette étude. muets.js utilise le génome v:2 du dépôt, alors que l'évolution étudiée tourne en v:1.
- La taille des mutations de la génération 0 (3 à 6 réels) ressemble à une naissance « mutation » ordinaire, mais pas à un immigré (8 réels, σ 0,3) ni à un croisement : la loi ne vaut peut-être pas pour eux.
- « Identique » veut dire même empreinte de la partie ; 10 paires sur 64 ont pourtant des empreinteVues différentes. L'empreinte des vues n'est pas utilisée.
- Les intervalles de τ par bootstrap couvrent un peu trop peu sur des cas inventés à 14 mutants (vu dans un premier essai). La borne haute retenue est la plus haute des trois méthodes.
- Le tableau des gènes de resultats.txt § 5 mélange deux références (le témoin pour les mutants g0, le parent pour les nés de G1) et n'attribue d'effet à aucun gène.
- Les données s'arrêtent à la fin de la génération 1 ; la génération 2, à 8 graines, n'est pas lue.
- donnees/ (environ 860 Ko : courses, génomes, configuration) se trouve dans le dossier d'étude d'un dépôt public. Il n'y a rien de privé dedans (vérifié : ni nom de PC ni chemin), mais le committer ou non est à décider.

## 2. etude:simulateur

*Rôle : auteur de l'étude « simulateur » : une sélection simulée, sans aucune course, pour savoir si elle progresse et à quelle vitesse. Phase : Etudier.*

### Résumé

Je livre un simulateur de la boucle de sélection, qui ne joue aucune course du jeu : simuler.js, avec verifier.js, analyser-reel.js, etudes.js et resumer.js. Il reprend graines.js tel quel et recopie note.js et evoluer.js (tournoi, naissances, renvoi, règle 6, validation par bootstrap apparié, malédiction du gagnant, phases, économie de graines, coût du coffre). Il est calé sur une copie figée des vraies courses du 27/11, lue à 23:16:50 (567 lignes de courses-2026-48.jsonl) : le palier est re-tiré dans les résidus réels, avec un bruit qui grandit avec le niveau ; deux pilotes au même comportement sur une graine font la même course.

Preuves de fidélité (verifier.js, TOUT PASSE) :
- le modèle pilote + graine est identique au vrai note.ajuster, à 0 près, sur les 527 vraies courses et sur des courses simulées où les graines reviennent ;
- le F de la génération 0 redonne le journal à 5e-5 près, avec le même classement ;
- avec le vrai genome.muter du commit e2ea8d2c9, les 20 identifiants de la génération 0, les 6 naissances de la génération 1, leurs graines et l'état du générateur (3114583574) sont identiques à population.json ;
- le simulateur rend les statistiques de la génération 0 réelle (σ des résidus 2,85 contre 2,92, se_E 0,101 contre 0,104, 11 % contre 10 % de graines identiques au témoin) ;
- cas connus : un monde sans effet donne un gain de 0 exactement ; un monde sans bruit fait monter le champion sans jamais reculer.

Q1 (vraie configuration, valeurs vraies en écart au témoin, médiane sur 10 mondes) :
- scénario moyen : le champion gagne +0,30, +0,99 puis +1,28 palier à 10 000, 50 000 et 200 000 courses ;
- scénario optimiste : +0,85, +2,86 puis +4,25 ;
- scénarios pessimiste et étroit (ce dernier proche du central de l'étude « effets ») : 0. Il y a là une petite dérive : 10 à 40 % des évolutions ont un champion pire que le témoin, d'au plus 0,1 à 0,3 palier.
- Jours (scénario moyen) : 10 000 courses font 1,9, 1,0 ou 0,5 jour à 200, 400 ou 800 courses par heure ; 50 000 font 10,8, 5,3 ou 2,6 jours ; 200 000 font 47, 23 ou 11 jours.
- La moitié du progrès est faite vers 50 000 courses. À 200 courses par heure, l'économie passe à 8 graines par génération.

Q2 (réglages) :
- très mauvais : 6 graines (−1,2 à −2,5 de F4 à 50 000 courses) ;
- mauvais : 40 pilotes (−0,4 à −0,6), seuilSacre 3, 24 graines ;
- 12 graines, 20 pilotes et seuilSacre 2 sont bons ;
- le meilleur ensemble (D) : rejouer seulement les jeunes, le témoin, le champion et les 4 meilleurs, poissonMutations 4, intervalle 2. Il gagne +0,1 à +0,6 de F4, un gain petit devant l'incertitude du scénario (0 à 4 paliers).

Q3 (la note F = palier − 4·E) : elle pousse surtout vers le palier. Le poids 4 sert de garde-fou : sans lui, E se dégrade de +0,02 à +0,11. Un poids de 16 trie le bruit de E et coûte 1 à 2 paliers. Dans les mondes pessimistes, elle ne pousse vers rien.

Faux sacres dans un monde sans effet : 5,9 % ± 2,2 par validation avec seuilSacre 2 et 24 graines, contre 17 % avec seuilSacre 1.

Rien n'a été commité, et aucun fichier hors du dossier d'étude n'a été modifié.

### Recommandations

- Changement : R1 : garder grainesParGeneration 12, mu 20, seuilSacre 2 et 24 graines de validation ; ne jamais passer à 6 graines ni à 40 pilotes.  
  Gain attendu : Évite −0,6 à −2,5 de F4 vrai à 50 000 courses (scénarios moyen et optimiste), selon des écarts appariés de plus de 4 erreurs-types.  
  Coût : aucun  
  Confiance : haute
- Changement : R2 : mesurer le débit du Ryzen dès la première nuit (debit_h et nGraines dans generations.jsonl) et laisser l'économie de graines telle quelle (12 → 8 graines à ~200 courses par heure, sans dommage visible au simulateur).  
  Gain attendu : Savoir si 50 000 courses prennent 2,6 jours (800/h) ou 10,8 jours (200/h).  
  Coût : une nuit de mesure  
  Confiance : haute
- Changement : R3 (proposition) : dans ml/evolution/evoluer.js, fonction generation, étape 3 « LES COURSES », ne mettre dans les tâches que les vivants de moins de 48 courses, le témoin, le champion et les 4 meilleurs F de la note d'avant les naissances (option de config 'rejouer', valant « tous » par défaut).  
  Gain attendu : +0,15 ± 0,05 (moyen, 200 000 courses) à +0,31 ± 0,09 (moyen, 50 000) de F4 vrai, et 40 % de générations en plus pour le même nombre de courses ; −0,17 ± 0,12 dans l'optimiste à 200 000.  
  Coût : une vingtaine de lignes ; la note d'un ancien ne s'affine plus au-delà de ses courses  
  Confiance : moyenne
- Changement : R4 (proposition) : dans config.json, poissonMutations 2 → 4 et validation.intervalle 5 → 2, avec R3 (l'ensemble D).  
  Gain attendu : D contre le défaut : +0,60 ± 0,15 (optimiste, 50 000 courses), +0,21 ± 0,09 (moyen, 200 000), +0,13 ± 0,05 (pessimiste, 50 000). On saura si c'était vrai en comparant nSacres et le coffre après 100 générations à ceux du simulateur.  
  Coût : plus de validations (48 courses chacune) ; vérifier que ces clés n'entrent pas dans l'époque  
  Confiance : moyenne-basse (dépend de la loi supposée)
- Changement : R5 : ne pas baisser seuilSacre à 1, et ne pas monter le poids de E au-dessus de 4.  
  Gain attendu : Évite 13 à 17 % de faux sacres par validation (38 % de champions pires que le témoin dans le pessimiste) ; un poids de 16 coûterait 1 à 2 paliers.  
  Coût : aucun  
  Confiance : moyenne
- Changement : R6 : après 30 à 50 générations réelles, recaler la loi des mutations du simulateur sur la vraie évolution (coffre champion − témoin, enfants contre parents), puis refaire les plans principal et ensemble (node etudes.js …).  
  Gain attendu : Savoir lequel des 4 scénarios est vrai, alors que le gain à 200 000 courses va de 0 à 4,3 paliers selon le scénario ; si le coffre ne montre rien à 50 000 courses, changer de méthode plutôt que de réglage.  
  Coût : environ 5 minutes de calcul sur des courses déjà jouées  
  Confiance : haute

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\simuler.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\verifier.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\analyser-reel.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\etudes.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resumer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\sorties-verifier.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\sorties-analyser-reel.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\sorties-calibrer.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\principal.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\etroit.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\sensibilite.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\ensemble.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\ensemble-reglages.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\note.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\resultats\nul.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\simulateur\donnees\calibrage.json

### Doutes

- La loi des effets des mutations est SUPPOSÉE : 4 scénarios, tous calés sur la seule dispersion de la génération 0, estimée à ~0,6 palier par mes moments, alors que l'étude « effets » donne 0,32 [0 ; 1,07]. C'est le scénario qui décide de tout : de 0 à 4,3 paliers à 200 000 courses.
- Le paysage simulé est additif : 64 gènes indépendants, chacun avec son optimum. Les drapeaux, les têtes (phases B et C) et les gestes du génome v:2 (107 gènes, dont 21 réels muets) ne sont pas simulés, alors que le Ryzen tournera en v:2.
- E est simplifié en une moyenne de valeurs par partie, alors que le vrai E est non linéaire sur 15 mesures. La taille des effets sur E (plafond 0,07 à 0,36) est supposée ; les conclusions de Q3 en dépendent.
- Le bruit du palier est pris proportionnel au niveau : ce n'est mesuré qu'entre 6,5 et 7,6 de palier moyen. Le temps par course vient du Xeon, mis à l'échelle du débit.
- Le taux de faux sacres à seuilSacre 2 sort à 5,9 % ± 2,2 par validation, contre 3,7 % dans la relecture statistique : sans doute le bootstrap à 24 graines, qui sous-estime un peu l'erreur-type ; non tranché.
- « 8 graines ne nuisent pas » (l'économie à 200 courses par heure) n'est qu'une indication tirée du plan principal, pas un test apparié de 8 contre 12 graines.
- 8 à 14 mondes par réglage : les écarts de moins de 2 erreurs-types (la plupart des effets de R3 et R4) restent fragiles.
- donnees/ contient une copie de courses-2026-48.jsonl (environ 600 Ko) dans un dépôt public. Le sortie.log copié avait un chemin local avec le nom de session Windows : je l'ai supprimé de ma copie. À vérifier avant tout commit : rien d'autre de privé, d'après un grep sur « Users », « sacha » et « @ ».

## 3. etude:vitesse

*Rôle : auteur de l'étude « vitesse » : où part le temps d'une course et comment en jouer plus par heure. Phase : Etudier.*

### Résumé

Où part le temps d'une course : environ un quart du temps passe avant que la voiture roule. C'est 24 à 28 %, mesuré de deux façons qui concordent. Dans les 567 courses réelles, on le déduit des fenêtres où les 4 travailleurs sont occupés : 25,4 à 26,9 s par course en génération 1. Sur une course jouée seule, il se décompose ainsi : 6,7 s pour ouvrir le jeu, 5,0 s pour bâtir la première piste (J.lancer), et 0,1 s pour node et le require.

Le reste est la boucle du jeu (68 à 75 % en temps inclus). Le cerveau du pilote ne prend que 1,7 à 2,4 % du temps (2,4 % sur les 567 courses), les yeux 5 à 6 % et le ramasse-miettes 0,4 à 1,3 %.

Le point chaud inattendu est envCielCalc, la fonction qui peint le ciel reflété sur la carrosserie. Elle prend 11 % de la course 1, environ 1,7 s par appel, trois appels par course. Elle ne tire pas au hasard et ses octets ne vont qu'à un faux canevas. Je l'ai remplacée par des faces noires sur 2 courses : les trois empreintes sont identiques à la vraie évolution et la course 990000 passe de 42,7 s à 39,0 s.

Les quatre courses jouées, une à la fois, tmax 120, toutes du témoin 19e3767cc346 sur les graines du coffre 990000 et 990740, redonnent toutes les empreintes de la vraie évolution. Cela valide la méthode.

Au rythme de la génération 1, une génération de 312 courses prend 143,8 min, soit 130 courses/h. Les accélérations qui ne changent aucun résultat font gagner −13,4 % : 124 min, 150 courses/h. Si l'on rend exact « plusieurs courses par processus », on arrive à −24 % : 109 min, 172 courses/h. Jouer deux fois plus par heure n'est donc pas atteignable sans changer les courses ; ce facteur viendra du Ryzen.

Les courses jouées pour rien :
- Aucune clé jouée deux fois : le cache fait son travail.
- 50 courses sur 567 (8,8 %) sont identiques au bit près à celle d'un autre pilote sur la même graine. Ce sont surtout des courses courtes (médiane 47 s), qui pèsent 3,8 % du temps de boucle et qu'on ne peut pas prévoir avant de les jouer.
- 1 naissance sur 6 de la génération 1, 9627905cd5bb, conduit comme son parent 3032bf8184f5 sur 11 graines sur 11. Cela fait 12 courses sur 312 (3,8 %).

Rien n'a été écrit hors de ml/ecurie/etude/reglage-de-la-selection/vitesse/. La copie des données a été figée le 27/11 à 23:16:43, avec 567 lignes de courses. Rien n'est commité.

### Recommandations

- Changement : A1 — Dans ml/reel/jeu-reel.js, fonction creer : juste après le chargement du jeu et avant ev('(start(),1)'), seulement si !opts.charge (le vrai navigateur garde son ciel), remplacer envCielCalc par une fonction qui rend 6 faces noires (Uint8ClampedArray(S*S*4)). Faire ce changement en même temps que le changement d'époque déjà prévu par le génome v:2, après la preuve : 24 courses sur 24 identiques avec preuve-identite.js --options "--sans-ciel", puis ml/bot/verifier.js.  
  Gain attendu : 9,3 % d'une course en moyenne (fourchette 5,8 à 12,8 %), soit environ 13 min sur une génération de 143,8 min au Xeon. La mesure directe sur la graine 990000 donne −3,7 s sur 42,7 s avec 2 appels remplacés.  
  Coût : Une nouvelle époque des courses, parce que jeu-reel.js fait partie des fichiers de l'époque : les notes repartent de zéro, les pilotes restent. Il faut prévenir Sacha, et un autre PC qui note un champion doit avoir le même fichier. La preuve coûte 30 min à 1 h de calcul. Il reste à vérifier qu'aucun appel n'a lieu pendant loadGame lui-même.  
  Confiance : Haute sur l'exactitude du principe : fonction pure, sans hasard, et 2 courses sur 2 identiques au bit près. Moyenne sur le chiffre du gain, mesuré sur 2 courses du seul témoin.
- Changement : A5 — Dans ml/evolution/evoluer.js, fonction courir : appeler ord.demander dans l'ordre des durées attendues décroissantes (la survie moyenne du pilote, ou celle du parent pour un nouveau-né), en rangeant les promesses à leur index d'origine pour que L garde l'ordre des tâches.  
  Gain attendu : 0,2 % mesuré sur le Xeon à 4 travailleurs : au plus 30 s de travailleurs inoccupés à la fin de la génération 0. Jusqu'à environ 3 % supposé sur le Ryzen avec 12 à 16 travailleurs.  
  Coût : Quelques lignes, aucune époque (evoluer.js n'en fait pas partie), aucun résultat changé.  
  Confiance : Haute sur l'exactitude, faible sur le chiffre du Ryzen (supposé).
- Changement : A3 — Dans ml/evolution/modele.js, ecrirePilote : écrire un gène à sa valeur de naissance quand son drapeau gardien est éteint. Deux génomes qui conduisent forcément pareil donnent alors le même texte, donc le même shaPilote et un passage par le cache. Il faut d'abord la liste des gènes gardés, gène par gène, et vérifier comment note.js rattache une ligne du cache à un pilote (la ligne porte l'id du pilote qui l'a jouée).  
  Gain attendu : Jusqu'à 3,8 % (1 naissance sur 6 observée en génération 1, environ 4 % selon INTERFACES.md § 9.5), soit environ 5 min par génération.  
  Coût : Une nouvelle époque (modele.js), une preuve par lecture du code et un test d'identité de texte. Il y a un piège dans l'attribution des lignes.  
  Confiance : Moyenne : le clone observé avait aussi une mutation de figTemps, dont l'inertie n'est pas prouvée.
- Changement : A2 — Un processus qui joue plusieurs courses à la suite (ouvrir payé une fois). Ne pas le faire avant d'avoir trouvé l'état qui fait diverger l'espace et la grotte dans un même processus (ml/reel/README.md, 25/11). Ensuite, garder un contrôle permanent : une course sur 20 rejouée dans un processus neuf, avec les mêmes empreintes.  
  Gain attendu : 12,4 % (9,0 à 15,8 %), soit environ 18 min par génération : le plus gros gain exact possible.  
  Coût : Un chantier sur le simulateur, une nouvelle époque, et le risque d'un résultat faux silencieux tant que ce n'est pas prouvé sur les 7 maps.  
  Confiance : Faible aujourd'hui : c'est mesuré faux sur 2 maps sur 7.
- Changement : A4 — Dans ml/reel/sim-env-reel.js, loadGame : un vm.Script avec cachedData gardé sur le disque (refait si jeu_sha change). À ne faire que si l'on touche ce fichier pour autre chose, par exemple avec A1.  
  Gain attendu : 0,6 % mesuré (compilation du premier niveau 264 ms → 9 ms) ; au plus environ 1,8 % supposé avec les fonctions compilées à la demande.  
  Coût : Une nouvelle époque et 2,7 Mo de cache par version du jeu.  
  Confiance : Haute sur l'exactitude, faible intérêt.
- Changement : À ne PAS faire (catégorie b, ces changements modifient les courses, Sacha doit être prévenu avant) : moins de rayons ou moins d'images par rayon (les yeux entiers ne font que 5 à 6 %), décider moins souvent (8 % au plus), un pas de temps de 30 images/s (jusqu'à environ 35 %, mais une autre physique que celle des joueurs), couper les effets visuels qui tirent au hasard (environ 15 à 19 %, mais toutes les routes changent), une tmax plus courte, moins de graines. Les options de mémoire de node (ramasse-miettes 0,4 à 1,3 %) et le préchauffage d'un processus (aucun gain sur un PC plein) ne valent rien.  
  Gain attendu : Aucun gain recommandé : cette ligne évite une fausse piste, en particulier « moins de rayons », qui gagnerait 5 % au plus.  
  Coût : Sans objet.  
  Confiance : Haute sur les parts mesurées (2 profils).

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\analyser-donnees.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\resultats-donnees.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\resultats-donnees.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\chronometrer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\analyser-profil.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\fonctions-cheres.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\fonctions-cheres.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\compilation.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\estimer-gains.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\gains.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\gains.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\preuve-identite.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course1-990000-profil.cpuprofile
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course1-profil.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course1-lecture.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course2-reference.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course3-sans-ciel.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course4-990740-sans-ciel-profil.cpuprofile
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course4-sans-ciel-profil.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\course4-lecture.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\profils\compilation.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\donnees\courses-2026-48.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\vitesse\donnees\pilotes\9830f1c4e6fd.js

### Doutes

- Le PC était plein pendant les 4 courses (la vraie évolution à 4 courses à la fois plus un test, 99 % de charge processeur) : les temps absolus mesurés seuls sont plus lents que d'habitude. La boucle de 990000 prend 30,9 s seule contre 26,7 s dans la vraie évolution à 19h52. Seules les parts en % sont fiables ; elles concordent pour la part fixe (28 % seule, 24 à 26 % dans les données).
- Le gain de A1 (le ciel) n'est mesuré que sur 2 courses du seul témoin, chacune avec 3 ciels peints. Une course longue en peint sans doute davantage : la part réelle sur une génération n'est pas mesurée (fourchette 5,8 à 12,8 %).
- La preuve d'exactitude de A1 a été faite en remplaçant la fonction APRÈS la chauffe (par chronometrer.js), alors que la proposition la remplace AVANT. Il faut la refaire avec le code réel ; je n'ai pas vérifié si envCielCalc est appelée pendant loadGame lui-même.
- On suppose qu'une part mesurée sur une course seule reste la même à 4 courses à la fois. Ce n'est vérifié que pour la part fixe.
- J.image prend 4,4 % en temps propre et ce n'est pas expliqué : les minuteries sont chronométrées à 62 ms seulement. C'est peut-être le passage dans le contexte vm ou un morceau de loop inliné ; ce n'est pas étudié.
- Le coût fixe tiré des données suppose les travailleurs occupés sans arrêt dans la fenêtre. La génération 1 tourne plus lentement que la 0 (110,6 s contre 75,6 s par course) parce que le PC était plus chargé le soir : la base de 143,8 min par génération est donc pessimiste.
- A2 (plusieurs courses par processus) n'a pas été testé ici : --deux est écrit mais pas lancé, car il coûtait deux courses sur les quatre permises. Son inexactitude vient de ml/reel/README.md (25/11), pas d'une mesure de cette étude.
- L'outil preuve-identite.js n'a tourné qu'à sec. Seul le pilote du témoin a été copié dans donnees/pilotes : pour une preuve sur des pilotes variés, il faut copier etat/pilotes en entier.
- donnees/ contient une copie de population.json et du journal (environ 770 Ko) et les deux profils CPU font environ 1,2 Mo chacun : à exclure ou à garder au moment du commit, que je n'ai pas fait.

## 4. etude:tri-precoce

*Rôle : auteur de l'étude « tri précoce » : faut-il finir les courses d'un enfant visiblement raté ?. Phase : Etudier.*

### Résumé

I studied this without running any game race, from a frozen copy of the live evolution: read on 27/11 at 23:16, 566 race lines (gen. 0 finished, gen. 1 at 286 of 312), nothing touched in the trial folder.

**Question 1, early sorting: not worth it.**
- On the 25 real children (19 gen-0 mutants, 6 gen-1 children), no rule at k = 2, 3, 4 or 6 with c = 2 would have dropped anyone. The smallest margin is 0.34 palier above the threshold.
- A failed child dies fast in its races. Cutting its last 9 races saves only 0.9 to 1.4 % of a generation's time.
- In the simulation, the generation time does not change (7.81 h against 7.72 h) and neither does the progress.
- Trap: on k ≤ 4 races, note.js gives every pilot E = 4 (fewer than 5 parties). An F-based rule would therefore drop every child.

Table of the k = 3, c = 2 rule, by the child's true value compared with the threshold:

| Δ | −5 | −3 | −1 | 0 | +1 | +2 |
|---|---|---|---|---|---|---|
| drop probability | 77 % | 37 % | 7 % | 1.7 % | 0.3 % | 0 % |

**Question 2, the old pilots' replays: that is where the saving is.**
- If the old pilots replay only the first 4 of the generation's 12 seeds (B4), a generation takes 47.8 % of today's time, measured on the real gen-1 race times. The Xeon would go from 14.7 to 30.8 generations a day.
- At equal compute budget (3 Xeon days, 40 repeats), the leader's true level is:

| scenario | today (A) | B4 |
|---|---|---|
| faible | 1.84 | 2.77 |
| moyen | 4.46 | 6.73 |
| casse | 4.27 | 5.83 |
| très faible | 0.60 | 0.48 (±0.06) |

- At equal number of generations, A stays better than B4. B4 wins only through the 1.8 times more generations, so it is not a bias in the score.
- The pilot + seed model does correct scores built on different seeds: the controls are exact, apart from the 10 passes not fully converging (0.03 palier).
- C (only pilots near the threshold or the top replay) saves nothing: almost every pilot is "near the threshold".
- D (old pilots never replay, a fixed seed set) overfits its seed set. The data show identical parent/child races: 10 % on average, and a real clone, `9627905cd5bb`, which reran 11 of its parent's 11 races identically. Clones then inherit their parent's luck exactly. D0 falls well below A (moyen: 2.92 against 4.46), and its pilots never reach the 48 races validation requires.

**Question 3, the proposal:** B4 (`grainesAnciens: 4`), with protection by age instead of 24 races, plus an optional clone filter (4 identical races → stop the child, `raison: 'clone'`).

**Main doubt:** the test-retest of the first 20 pilots is negative (−0.21 on a, −0.23 on F). Their differences cannot be told apart from chance; while that holds, no selection setting will change much.

### Recommandations

- Changement : B4 — the old pilots replay only the first 4 of the generation's 12 seeds. config.json: "grainesAnciens": 4. evoluer.js, generation(), step « 3. LES COURSES »: in the loop over pop.grainesGeneration × pop.vivants, skip the task when v.ne < G and the seed index is ≥ grainesAnciens (the seed-by-seed order stays, so the first 4 seeds are common to everyone). In tournoi() (the pool) and step « 6. LE RENVOI » (elig), replace nDe(notes,v.id) >= cfg.protectionCourses with age: a pilot can be removed if v.ne < G, and enters the tournament if v.ne <= G-2. note.passes 10 → 30. generations.jsonl: add grainesAnciens. Review pleine_s (the seed-saving rule). Add a case to tests/generation.test.js.  
  Gain attendu : Measured on the real gen-1 race times: 47.8 % of today's time per generation, so 14.7 → 30.8 generations a day on the Xeon (before validation and coffre overhead, estimated 5 to 10 %). Simulated, true level of the leader after 3 Xeon days: ×1.5 in the faible and moyen scenarios (2.77 vs 1.84; 6.73 vs 4.46), ×1.37 in casse; in très faible 0.48 vs 0.60 (slightly worse, at 1.5 standard errors).  
  Coût : An old pilot's score is less precise (se_F 0.48 instead of 0.30 at gen. 10). A pilot needs 9 generations instead of 3 to reach the 48 races validation requires (about 7 h on the Xeon). Three places in evoluer.js plus the config change. How to check it worked: compare, per day of compute (not per generation), the slope of champion minus témoin in coffre.jsonl (40 seeds never used for training) and the number of sacres, before and after; and see whether the old pilots' test-retest on their 4 common seeds becomes positive.  
  Confiance : medium: the time gain is measured, the progress gain depends on the size of mutation effects, which is assumed
- Changement : Clone filter (K). After the first 4 seeds (which the parent also plays, under A and B4), a child whose 4 races have the same empreinte as its parent's stops there: morts.jsonl gets raison 'clone' with n:4 and the parent; generations.jsonl gets morts:[{id, raison:'clone', apres:4}]; add the 'clone' label to RAISONS in histoire.js (arbre.js already reads any reason). Wire it without a barrier: in courir(), the child's tasks 5 to 12 are requested only once its first 4 results and its parent's have come back (a chained promise).  
  Gain attendu : 2.2 % of a generation's time on the real gen. 1 (1 clone out of 6 children). It also stops clones piling up (2.5 to 3.5 of the 20 living pilots at gen. 10 in simulation, scheme A). Simulated progress is unchanged beyond the noise.  
  Coût : A small change. On the real data, 1 child in 25 was flagged and it was the real clone; in simulation 0.05 to 0.16 % false clones. A clone's silent genes might matter later.  
  Confiance : medium on the detection, low on the gain
- Changement : Do not implement the early sorting of children (racing). If it is done anyway: k = 3, c = 2, drop if a_k (the unshrunk a from the pilot + seed model) − 4·Ē + 2·σ/√3 < S. Never use note.js's F (below 5 parties E = 4, so every child would be dropped). S = the lowest F among surviving removable pilots at the end of the previous generation, stored in population.json. raison 'renvoi-precoce' with n, a_k, borne and seuil. Same wiring as the clone filter.  
  Gain attendu : Close to zero: 0 of 25 real children dropped; about 1 % of a generation's time per child dropped (short races); in simulation 7.81 h vs 7.72 h per generation and the leader's level unchanged within the noise.  
  Coût : Falsely drops 1.7 % of children exactly at the threshold, 0.3 % at +1 palier; adds code and a new death reason.  
  Confiance : high
- Changement : Do not adopt C (only pilots near the threshold or the top replay) or D0/D1 (a fixed seed set, or one rotating slowly, with old pilots never replaying).  
  Gain attendu : Avoids D's trap: overfitting to the seed set through identical parent/child races (true leader after 3 days, moyen scenario: 2.92 vs 4.46 for A, and 6 clones among the 20 living pilots). C saves nothing (307 to 311 races per generation instead of 312).  
  Coût : None.  
  Confiance : high for D (the identical races are measured), high for C

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\mesurer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\mesures.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\residus.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\outils.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\verifier.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\verifier.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\regles.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\regles.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\population.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\population.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\par-generation.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\gain-reel.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\gain-reel.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\convergence.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\convergence.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\donnees\LECTURE.txt

### Doutes

- The real size of a mutation's effect is unknown. The test-retest of the first 20 pilots (gen. 0 against gen. 1) is negative: −0.21 on a, −0.23 on F, over 20 pilots (uncertainty about ±0.45). The real regime is probably at or below the simulation's « très faible » scenario, where B4 does about as well as A (0.48 vs 0.60), not better.
- The share of silent mutations (clones), 1 in 4, comes from a single observed case (9627905cd5bb, 11 of 11 races identical to its parent).
- Identical races depend on the seed: 3 seeds where everyone dies early carry most of them. The simulator draws them independently, so it may misjudge the clone filter's false-positive rate and the overfitting of D.
- The simulator has no ceiling, no validation, no sacre and no phases. Its absolute levels (+4 to +8 paliers in 3 days) are not realistic; only the comparison between schemes counts. E is simulated as an average of per-party noise, not as the distance to the crowd that note.js computes.
- Generation 1 was not finished when I read the data: 10 complete seeds out of 12, scaled up to 12 for the time gains. Validation and coffre overhead and the idle time at the end of each generation are estimated (5 to 10 %), not measured. The Ryzen's throughput is not measured.
- donnees/ holds about 730 KB of copied races and genomes (sortie.log was removed because it contained the path to the user's folder). Whether to commit it is Sacha's call; nothing has been committed.

## 5. etude:sacre

*Rôle : auteur de l'étude « sacre » : comment reconnaître un vrai meilleur sans sacrer un chanceux. Phase : Etudier.*

### Résumé

J'ai refait les deux chiffres sans jouer aucune course. J'ai rééchantillonné de vraies courses : la copie figée de courses-2026-48.jsonl, lue le 27/11 à 23:18:26 (573 lignes), et courses-0.json. Le comparer et l'écart E ont été recodés en rapide ; b-verifier.js montre qu'ils rendent les mêmes nombres que note.js (écart au plus 4e-15, mêmes critères 40 fois sur 40).

Règle d'aujourd'hui (24 graines, z > 2, bootstrap à 400) : 3,0 % de faux sacres [2,6 ; 3,6], et une puissance de 7,8 % à +0,5 palier, 15,4 % à +1, 44 % à +2 et 72 % à +3. Les modèles bruit, gabarit et celui du relecteur donnent 2,5 % et 13 à 16 % à +1. Les 3,7 % et 12 % du relecteur (300 essais) sont donc dans le bruit. Sur 100 validations de pilotes égaux, on attend 3 faux champions, avec 95 % de chances d'en avoir au moins un. Les faux champions sont égaux au champion, pas moins bons : un pilote à −0,5 palier n'est sacré que 1,0 % du temps.

Défaut trouvé : le critère (c), dE < 1·se_dE, rejette au hasard 16 % des pilotes qui ressemblent autant aux joueurs que le champion. C'est pourquoi même un +3 paliers plafonne à 72 %.

Biais du vainqueur (population de 20 simulée) : la note d'entraînement du meneur le flatte de 1,7 palier (meneur jeune, 48 courses) à 1,1 (120 courses) quand tous sont égaux. La validation sur graines neuves n'en souffre pas : 2,4 à 3,0 % de faux sacres. En revanche :
- le plan (c), qui compte les courses d'entraînement dans le jugement, sacre un pilote égal 53 à 62 % du temps ;
- l'alarme « malédiction » (seuil 1) se déclenchera par construction, la malédiction attendue étant de 1,1 à 1,8 pour des meneurs jeunes. La règle 6 passerait alors à 3, ce qui diviserait les vrais sacres par 5.

Plans comparés sur les mêmes tirages, modèle evolution. Le meilleur est un séquentiel apparié à borne O'Brien-Fleming : borne 2,2·√(96/n), paquets de 12 graines de 24 à 96, arrêt dès que z < 0,5, critères (b) et (c) à 2 se.
- Faux sacres : 1,8 % [1,5 ; 2,1], refait à 400 tirages.
- Puissance : 12 % à +0,5, 33 % à +1, 86 % à +2, 98,5 % à +3.
- Coût : 38 graines en moyenne pour un pilote égal (76 courses), 60 pour un +1 (120 courses), contre 48 aujourd'hui.
- Repli plus simple, les deux étages (24, puis 96 si z > 0,5, sacre si z > 2,33, sacre direct si z > 3 dès 24) : 1,2 % de faux sacres, 29,5 % à +1, 84,5 % à +2, 47 à 69 graines.
- Le modèle courses-0.json donne le même tableau.
- Dans un monde où les mutants diffèrent d'environ 0,5 palier (l'ordre de grandeur mesuré sur la génération 0), les vrais sacres par fenêtre doublent (3,7 → 7,1 % pour un meneur jeune, 8,4 → 17,9 % pour un vieux), et aucun pilote moins bon n'est jamais sacré.

Ressemblance (F = palier − 4E) :
- +1 palier avec E +0,25 : jamais sacré (0,3 %).
- E −0,25 sans palier : sacré aussi souvent qu'un +1 palier (35 %).
- +2 paliers avec E +0,25 : bloqué par (c) (0,8 % à 1 se, 2,8 % à 2 se, 32 % sans (c)).
- Le taux de change (1 palier = 0,25 de E) est un choix de Sacha ; c'est à lui de décider si (c) reste à 1 se.

La proposition détaillée (boucle dans validation(), seuils lus par note.comparer, config, format de validations.jsonl) est dans LISEZ-MOI.md. Je n'ai rien modifié hors de mon dossier, rien commité ni poussé, et je n'ai rien lancé dans le dossier de l'évolution.

### Recommandations

- Changement : evoluer.js, validation() : pour usage 'validation' et --valider-maintenant, remplacer le lot unique de 24 graines par une boucle séquentielle. Premier paquet cfg.validation.graines (24), puis cfg.validation.pas (12), jusqu'à cfg.validation.plafond (96). À chaque regard, N.comparer avec seuilSacre = borneOBF·√(plafond/n), borneOBF = 2,2. Fin si sacre, si dF/se_dF < futilite (0,5) ou au plafond. R.validation = le dernier regard. La revalidation garde ses 24 graines. config.json validation : plan 'sequentiel', pas 12, plafond 96, borneOBF 2.2, futilite 0.5. validations.jsonl : + plan, regards[] (graines, borne, dF, se_dF, z, dPalier, dE, se, suite), arret, courses ; graines = toutes les graines jouées.  
  Gain attendu : Simulé sur les vraies courses : puissance à +1 palier 15 → 33 %, à +2 44 → 86 % ; faux sacres 3,0 → 1,8 % par validation ; moins bons sacrés 0,0 % à −0,5. Vrais sacres par fenêtre ×2 dans le monde où les mutants diffèrent d'environ 0,5 palier.  
  Coût : 76 courses en moyenne pour un pilote égal, 120 pour un +1, contre 48 : 8 à 23 min de plus par validation sur le Xeon, moins de 5 % du temps puisqu'il y a au plus une validation toutes les 5 générations. 1,6 à 2,5 fois plus de graines de validation consommées. Une boucle à écrire dans validation(), avec une reprise déterministe par le cache.  
  Confiance : moyenne-haute : les écarts entre plans sont mesurés sur les mêmes tirages et trois modèles de courses concordent ; les niveaux absolus supposent qu'un meilleur pilote décale ses paliers sans changer leur forme.
- Changement : note.js comparer : lire les multiples des critères (b) et (c) dans cfg.validation.seuilB et seuilC (défaut 1), et les mettre à 2. Mettre <= au lieu de < dans (c) : aujourd'hui dE = 0 avec se_dE = 0 n'est jamais sacré, un cas d'école.  
  Gain attendu : À 1 se, (c) rejette au hasard 16 % des pilotes qui ressemblent autant que le champion. À 2 se : +2 paliers 80 → 86 %, +3 93 → 98,5 %, faux sacres inchangés (1,6 %).  
  Coût : Un pilote +2 paliers / E +0,1 passe 56 % du temps au lieu de 30 % ; un +2 paliers / E +0,25 passe 2,8 % au lieu de 0,8 %. Ce taux de change est un choix de Sacha.  
  Confiance : haute sur les chiffres ; la décision relève du goût de Sacha
- Changement : config.json validation.maledictionSeuil : null, pour ne plus faire passer regle6 à regle6Haute. Garder la malédiction dans le journal.  
  Gain attendu : Évite que regle6 passe à 3 au bout de 10 validations. Cela diviserait les vrais sacres par 5 (meneurs jeunes : 7,1 → 1,4 % des fenêtres avec le plan proposé, 3,7 → 0,3 % avec la règle actuelle). La malédiction attendue quand tout marche vaut 1,1 à 1,8 palier pour un meneur de 48 courses : c'est le biais du vainqueur, pas un défaut.  
  Coût : Aucun : la validation sur graines neuves n'est pas biaisée (2,4 à 3,0 % de faux sacres malgré le choix du meneur).  
  Confiance : moyenne (dans la simulation tous les vivants ont le même âge ; en vrai, la malédiction attendue se situe entre 0,3 et 1,8)
- Changement : (Option, après avoir vu les premières vraies validations) config.json validation.regle6 : 2 → 1.  
  Gain attendu : Vrais sacres par fenêtre 7,1 → 15,0 % (meneurs de 48 courses) et 17,9 → 22,4 % (120 courses) avec le plan proposé ; aucun moins bon sacré.  
  Coût : On valide 60 à 90 % des fenêtres au lieu de 14 à 62 %, soit environ 6 % du temps en courses. Faux champions (égaux) par fenêtre sous l'hypothèse nulle : 0,8 → 2,3 % (g = 4), 0,3 → 1,4 % (g = 10).  
  Confiance : moyenne (dépend du monde simulé)
- Changement : Ne pas compter les courses d'entraînement dans le jugement du sacre (le plan (c) de la question) : elles ne servent qu'à choisir qui valider, ce que fait déjà la règle 6.  
  Gain attendu : Évite 53 à 62 % de faux sacres. Comme premier étage, elles ne filtrent rien : le test apparié sur l'entraînement passe dans 92 à 98 % des validations que la règle 6 a déjà déclenchées.  
  Coût : Aucun  
  Confiance : haute

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\commun.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\plans.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\a-donnees-reelles.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\b-verifier.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\c-sacre-actuel.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\d-regards.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\e-plans.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\f-population.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\g-controle-nul.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\a-donnees-reelles.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\b-verifier.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\c-sacre-actuel.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\e-plans-evolution.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\e-plans-bruit.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\f-population.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\sorties\g-controle-nul.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\donnees\courses-2026-48.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\.gitignore

### Doutes

- Aucune course n'a été jouée. Je suppose qu'un pilote meilleur de d paliers décale chaque course de d avec la même forme de bruit, et qu'un écart de ressemblance décale E de e. Un vrai meilleur pilote peut avoir une autre queue de distribution, ce qui changerait la puissance.
- L'écart vrai entre mutants (0,5 palier) est estimé sur 20 pilotes × 12 graines et 7 pilotes × 24 graines. La corrélation génération 0 / génération 1 ne vaut que 0,16 sur 7 pilotes. Le monde DISPERSE est une hypothèse.
- Les regards des plans utilisent un bootstrap de 200 tirages au lieu des 400 de la config : à 24 graines, 3,4 % de faux sacres contre 3,0 %. Seul le taux de faux sacres des plans retenus est refait à 400 tirages (1,8 %) ; leur puissance vient du calcul à 200.
- Dans f-population, le séquentiel donnait 3,0 % de faux sacres sur 1 136 validations, contre 1,6 % dans e-plans. Le contrôle dédié (9 000 essais, autre graine, 400 tirages) donne 1,8 % [1,5 ; 2,1] : j'en conclus que c'était du hasard d'échantillonnage, sans l'avoir prouvé.
- La population simulée met tous les vivants au même âge, champion compris, avec un E vrai identique, sans naissances ni renvois. L'effet de la malédiction et de la règle 6 dans la vraie population mélangée reste à vérifier sur les premières vraies validations : validations.jsonl est encore vide.
- La copie figée (donnees/courses-2026-48.jsonl, environ 600 Ko) est dans le dossier d'étude du dépôt public : elle contient les identifiants des pilotes et des empreintes, rien de privé. Il faut décider si on la commite ; sorties/regards-*.json (2,5 Mo) sont exclus par un .gitignore local.

## 6. relire:effets

*Rôle : relecteur de l'étude « effets » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI. Phase : Relire.*

### Résumé

J'ai relancé les trois scripts de l'auteur (analyser.js, muets.js, verifier.js) sur donnees/, un à la fois et en moins de 10 s chacun. Ils redonnent tous ses chiffres au chiffre près ; seules l'heure et la durée changent.

Un chemin indépendant, ml/ecurie/etude/reglage-de-la-selection/effets/relecture/contre-verifier.js → contre-verifier.txt, n'utilise ni outils.js ni note.js. Il confirme les points clés :
- Données propres : une seule course par (pilote, graine), aucune graine commune à G0 et G1. Il n'y a pas de fuite, puisque les parents des nés de G1 ont été choisis sur G0 et sont jugés sur G1. Il n'y a pas non plus de biais du vainqueur, car les 19 mutants ont tous couru G1 avant le premier renvoi.
- μ vaut −0,42.
- τ, refait sans le témoin par une analyse de variance pilote + graine sur les 19 mutants seuls, vaut 0,35, avec un bootstrap à [0 ; 1,20] ; l'auteur trouvait 0,32 [0 ; 1,07].
- La répétabilité r = −0,13 se retrouve, à 4 erreurs-types du 0,56 attendu si τ ≈ 1.
- Les courses identiques sont 64 sur 552, pour 0,58 h sur 10,93 h (5,3 %).

Erreurs trouvées et corrigées :
1. La consigne au simulateur (aSimuler) doublait le bruit : elle faisait « course du parent + s + bruit indépendant de 4,33 », alors que ces 4,33 contiennent déjà le bruit des deux pilotes. L'enfant aurait eu un bruit de 5,4 par course au lieu de 3,26.
2. Le LISEZ-MOI disait que les mutants g0 « ressemblent à une naissance ordinaire ». C'est faux : ils changent 4,8 réels en moyenne (5,8 gènes avec les drapeaux), contre 3 réels pour une naissance ordinaire, dont 41 % n'en changent qu'un ou deux. Sur les 3 vraies naissances « mutation » de G1, il y a 1 nul exact et 39 % de courses identiques au parent. Les chiffres « 0 sans effet » et « 10 % de copies » ne valent donc pas pour la suite de l'évolution.
3. L'intervalle de μ par bootstrap est un peu étroit : Student sur les 24 graines donne [−1,57 ; +0,73].
4. La phrase « 80 à 90 % de hasard » ne vaut qu'au scénario central : si τ = 1,07, c'est 28 à 44 %.
5. figTemps a changé de +0,05 de l'étendue, pas de +0,03.
6. La génération 1 était lente parce que le Xeon était chargé (129 courses/h contre 191 à la génération 0, qui tenait en 4 535 s).

Corrigé en place : le LISEZ-MOI, avec une section « Relecture » à la fin ; la chaîne aSimuler dans analyser.js ; parametres-pour-le-simulateur.json, régénéré par analyser.js. L'étude n'est pas réécrite. Rien n'est commité, rien n'est touché dans ml/evolution ni dans le dossier de l'évolution qui tourne.

### Verdicts du relecteur

- Recommandation : R1 — donner parametres-pour-le-simulateur.json au simulateur et balayer les 4 scénarios (bruit 3,26, corrélation 0,12, 10 % de courses copiées)  
  Verdict : tient avec reserve  
  Pourquoi : Le bruit (3,26 ; le maître écrit aussi 3,2599), μ et τ se retrouvent par un chemin indépendant (ANOVA sans le témoin : τ 0,35 [0 ; 1,20]). Trois réserves. (a) La consigne aSimuler doublait le bruit de l'enfant (5,4 au lieu de 3,26) ; elle est corrigée. (b) La part de mutants sans effet (0 [0 ; 18 %]) et les 10 % de courses copiées sont mesurés sur les mutants g0, qui changent 4,8 réels. Sur les 3 naissances ordinaires de G1 : 1 nul exact sur 3 et 14 courses identiques sur 36 (39 %). Il faut balayer ces deux parts de 0 à 0,4. (c) La borne haute de μ va jusqu'à +0,73 (Student), pas +0,59.
- Recommandation : R2 — des mutations plus fortes (sigmaMutation 0,15 → 0,30 ou poissonMutations 2 → 4), à tester d'abord au simulateur  
  Verdict : tient avec reserve  
  Pourquoi : Le simulateur ne peut pas dire si τ grandit avec σ : il ne montre que « si τ ≈ 1, la fiabilité passe à 56-72 % ». Ce qui manque est une mesure réelle, et le seul point à σ 0,3 (l'immigré, −0,46 [−3,3 ; +2,4]) ne tranche rien. Le critère « la corrélation moitié/moitié dépasse 0,3 » ne suffit pas non plus : à 19 mutants, l'erreur-type de r vaut environ 0,25, donc 0,3 est encore compatible avec τ = 0. Il faudrait au moins 40 mutants à σ 0,3 sur les mêmes graines. « Pas de létale à 0,15 » ne dit rien de 0,3. L'auteur la classe lui-même en confiance basse : c'est honnête.
- Recommandation : R3 — dans genome.js, muter : ne tirer les réels que parmi ceux que le pilote lit (retirer de l'urne ceux dont le drapeau de garde vaut 0 chez le parent)  
  Verdict : tient avec reserve  
  Pourquoi : Le compte se retrouve en relançant muets.js : 21 des 79 réels v:2 sont muets au témoin, ce qui fait 25,3 % des tirages perdus et +34 % de réels actifs (1/0,747), avec 2,0 % de naissances entièrement muettes. L'époque est bien concernée, ce que l'auteur dit. Mais le seul nul exact observé (9627905cd5bb : figTemps et bVersRoutePlane, ce dernier changé de 0,18 de l'étendue) ne porte AUCUN gène muet par construction. Les naissances perdues viennent donc surtout de gènes muets en pratique, que R3 ne retire pas : les 2 % sont un plancher, et le gain réel sur la sélection n'est pas montré.
- Recommandation : R4 — ne rien faire pour l'instant contre les courses identiques ; relancer analyser.js dans quelques générations  
  Verdict : tient  
  Pourquoi : Le contre-calcul redonne 64 courses sur 552, mais 0,58 h sur 10,93 h, soit 5,3 % du temps (des courses courtes : 51,5 s de médiane contre 133,5 s). Le seuil de 15 % du temps pour en reparler est raisonnable. À surveiller : les naissances ordinaires copient davantage leur parent (39 % sur 3 naissances).
- Recommandation : R5 — sur le Ryzen, mesurer d'abord le débit, puis relever seuilEconomie_s si 12 graines n'y tiennent pas  
  Verdict : tient avec reserve  
  Pourquoi : L'économie s'est bien déclenchée : pleine_s 8 682 > 5 400, graines 12 → 8. Mais la génération 1 a couru sur un Xeon chargé, à 129 courses/h contre 191 à la génération 0, qui tenait en 4 535 s, sous le seuil. À 2 à 4 fois 191 courses/h, 312 courses prennent environ 1 500 à 2 900 s sur le Ryzen, bien sous 5 400 s. Mesurer d'abord est donc juste, mais relever le seuil ne sera probablement pas nécessaire. À 8 graines, la fiabilité centrale vaut environ 7 %.

### Erreurs corrigées

- parametres-pour-le-simulateur.json, aSimuler (écrit par analyser.js) : « course d'enfant = course du parent + s + bruit apparié de 4,33 » doublait le bruit de l'enfant (√(3,26²+4,33²) ≈ 5,4). La chaîne est corrigée dans analyser.js et le json régénéré : bruit propre de 3,26, corrélé à 0,12 avec le parent, plus l'avertissement sur les parts mesurées chez les g0.
- LISEZ-MOI, limites : « la taille des mutations de G0 ressemble à une naissance mutation ordinaire » est faux (4,8 réels contre 3 en moyenne ; 41 % des naissances ordinaires changent 1 ou 2 réels). Ajouté : sur les 3 naissances ordinaires de G1, 1 nul exact et 39 % de courses identiques au parent.
- LISEZ-MOI, R1 : les 10 % de courses copiées valent pour les mutants g0 ; à balayer jusqu'à environ 40 % pour les naissances ordinaires.
- LISEZ-MOI, tableau de la loi : l'intervalle de μ par bootstrap [−1,52 ; +0,59] est un peu étroit ; Student sur les 24 moyennes de graine donne [−1,57 ; +0,73] (ajouté à côté, scénarios non refaits).
- LISEZ-MOI, « En une minute » : « 80 ou 90 % de hasard » ne vaut qu'au scénario central ; précisé (28 à 44 % si τ = 1,07).
- LISEZ-MOI, tableau des nés de G1 : figTemps a changé de +0,05 de l'étendue (1,5 → 1,58), pas de +0,03 ; bVersRoutePlane de 0,18 de l'étendue.
- LISEZ-MOI, R5 : ajouté que la génération 1 a couru sur un Xeon chargé (129 courses/h contre 191 ; la génération 0 tenait en 4 535 s).

### Doutes

- Le seuil qui déclare un mutant « nul exact » (toutes ses courses identiques au parent) repose sur 3 naissances ordinaires seulement : 1 sur 3, Clopper-Pearson [0,8 % ; 90,6 %]. La vraie part pour les naissances ordinaires reste inconnue.
- Le bruit du simulateur est supposé normal, alors que le palier est un entier borné en bas et dissymétrique (témoin : 7,54 ± 3,75). Ni l'auteur ni moi ne l'avons vérifié.
- verifier.js ne contrôle la couverture de μ que sur 12 générations inventées : 12/12 ne détecterait pas une couverture de 85 %. Son en-tête cite encore une corrélation mutant/témoin de 0,06 (0,12 mesuré).
- Je n'ai pas relu ecrirePilote ni modele.js pour confirmer que les 15 réels des gestes éteints ne sont vraiment pas lus en v:2 ; je me fie à INTERFACES § 9.3, cité par l'auteur.
- La fiabilité du classement τ²/(τ²+σ²/n) ignore le rétrécissement (retrecir 12) de note.js et la note cumulée des vieux pilotes : c'est un ordre de grandeur, pas la fiabilité exacte de la sélection réelle.
- Relancer analyser.js a réécrit resultats.txt, resultats.json et parametres-pour-le-simulateur.json : les chiffres sont identiques, seules la date et la chaîne aSimuler corrigée changent.

## 7. relire:vitesse

*Rôle : relecteur de l'étude « vitesse » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI. Phase : Relire.*

### Résumé

L'étude tient sur la structure, mais trois de ses gains sont surestimés de deux à trois fois. J'ai relancé ses scripts : analyser-donnees.js et estimer-gains.js redonnent leurs fichiers au bit près, fonctions-cheres.js redonne son texte, et preuve-identite.js --a-sec redonne 24 courses, 8 causes et 3 827 s de jeu. Les empreintes de 990000 et 990740 sont bien celles du journal.

Chemin indépendant (relecture/cout-fixe-par-course.js). La file de courses.js est FIFO à 4 places et les tâches partent dans l'ordre graine × vivant. On peut donc dater le départ de chacune des 287 courses de la génération 1, sans aucune valeur négative. Le hors-boucle moyen redonne 26,2 s, comme l'étude, avec une médiane de 16,2 s et 10 % des courses sous 9,5 s.

L'erreur principale est dans estimer-gains.js. Il divise les secondes gagnées par la durée d'une course courte (42,7 s ou 58,3 s), puis applique ce pourcentage à une génération dont la course moyenne occupe 110,6 s de travailleur. Or ouvrir (A2) et la compilation (A4) se paient une fois par course, et le ciel (A1) environ 3 fois plus un appel par nouveau ciel. Rapportés à la course moyenne (relecture/gains-rapportes.js), les gains deviennent :
- A1 : 3,3 à 5,8 % au lieu de 9,3 %.
- A2 : 4,7 à 6,1 % au lieu de 12,4 %.
- A4 : 0,2 % au lieu de 0,6 %.
- Cumul : −8,6 % (131 min, 142 courses/h) au lieu de −13,4 %, et −13,5 % avec A2 au lieu de −24,2 %.

A3 ne tient pas. Le clone observé a muté bVersRoutePlane, un gène lu sans drapeau gardien (modele.js, prime, lignes 321 et 400). Et INTERFACES § 9.5 dit « ~4 % des enfants », pas 4 % des courses, soit environ 0,1 %.

Un doute de l'auteur est levé (relecture/appelants-ciel.js) : aucun appel du ciel n'a lieu dans loadGame. L'appel de la chauffe passe par creer → attendPiste → loop → bioGo, donc l'endroit proposé pour A1 l'atteint.

LISEZ-MOI.md est corrigé en place (anciennes valeurs barrées) et se termine par une section « Relecture ». Je n'ai joué aucune course, rien n'est commité, et je n'ai rien écrit hors de vitesse/ et vitesse/relecture/.

### Verdicts du relecteur

- Recommandation : A1 — remplacer envCielCalc par des faces noires dans jeu-reel.js creer (si !opts.charge), groupé avec l'époque du génome v:2, après la preuve 24/24  
  Verdict : tient avec reserve  
  Pourquoi : Le principe tient : la fonction est pure, sans hasard, 2 courses sur 2 sont identiques, et l'endroit proposé atteint aussi l'appel de la chauffe, qui a lieu après loadGame dans les deux profils. Le gain est faux : rapporté à la course moyenne de 110,6 s, il vaut 3,3 à 5,8 % (5 à 8 min par génération), pas 9,3 % ni 13,3 min. Le recommander reste juste parce que l'époque est payée de toute façon par le génome v:2. La preuve doit être refaite avec le vrai code et sur des pilotes variés, car seul le témoin a été copié.
- Recommandation : A5 — lancer les courses les plus longues d'abord dans evoluer.js courir, sans changer l'ordre de L  
  Verdict : tient avec reserve  
  Pourquoi : L'exactitude tient : un processus neuf par course, et evoluer.js n'est pas dans FICHIERS_EPOQUE (commun.js:251). Le 0,2 % repose sur une seule fin de génération. Une course de 300 s de jeu lancée en dernier coûterait jusqu'à environ 1,7 % sur le Xeon aussi. La durée d'une course se prédit mal par pilote : le bruit d'une course à l'autre (±3,2) dépasse l'écart entre pilotes (±0,86). Gain incertain dans les deux sens.
- Recommandation : A3 — dans modele.js ecrirePilote, écrire à leur valeur de naissance les gènes dont le drapeau gardien est éteint  
  Verdict : ne tient pas  
  Pourquoi : Le chiffre de 3,8 % vient d'un clone (9627905cd5bb) dont la mutation de bVersRoutePlane porte sur un gène lu sans drapeau (prime, modele.js lignes 321 et 400) : A3 ne l'aurait pas rendu identique au texte de son parent. INTERFACES § 9.5 dit « ~4 % des enfants », soit environ 0,24 enfant par génération : environ 0,1 % des courses. Ce gain ne vaut pas une époque et le piège d'attribution des lignes.
- Recommandation : A2 — plusieurs courses par processus, seulement après avoir trouvé l'état qui fait diverger l'espace et la grotte  
  Verdict : tient avec reserve  
  Pourquoi : La prudence est juste : c'est mesuré faux sur 2 maps sur 7. Le gain est faux : ouvrir coûte 5,2 à 6,7 s, rapporté à 110,6 s cela fait 4,7 à 6,1 %, pas 12,4 % (9,0 à 15,8). La part du hors-boucle que la mesure directe n'explique pas (26,2 s en moyenne contre 11,8 s mesurées seules) pourrait en ajouter, mais ce n'est pas mesuré.
- Recommandation : A4 — cache de code V8 (vm.Script cachedData) dans sim-env-reel.js loadGame, seulement si l'on touche ce fichier  
  Verdict : tient avec reserve  
  Pourquoi : Le gain mesuré est 264 → 9 ms, soit 0,26 s par course : 0,2 % d'une génération et non 0,6 %. La conclusion « faible intérêt » en sort renforcée.
- Recommandation : Liste (b) à ne pas faire : moins de rayons, décider moins souvent, 30 images/s, couper les effets qui tirent au hasard, tmax plus courte, moins de graines ; options mémoire et préchauffage sans valeur  
  Verdict : tient  
  Pourquoi : Ces parts sont mesurées sur deux profils : yeux 5,9 % et 5,0 %, cerveau 2,2 % et 1,7 %, refait à 2,4 % sur les 567 courses, ramasse-miettes 0,4 % et 1,3 %. La classification (b) est juste : les effets visuels tirent dans le même générateur que la route (fonctions-cheres.txt redonné à l'identique).

### Erreurs corrigées

- Gains de A1, A2 et A4 rapportés à la durée d'une course courte (42,7 s ou 58,3 s) puis appliqués à une génération de 110,6 s par course. Corrigé dans LISEZ-MOI : A1 3,3 à 5,8 % (5 à 8 min), A2 4,7 à 6,1 % (7 à 9 min), A4 0,2 %. Cumul sans A2 −8,6 % (131,4 min, 142 courses/h) au lieu de −13,4 % ; avec A2 −13,5 % (124,3 min, 151 courses/h) au lieu de −24,2 %. Source : relecture/gains-rapportes.txt.
- « La part fixe mesurée de deux façons concorde (28 % contre 24 à 26 %) » : faux, ces deux parts portent sur des courses différentes. En secondes, la mesure directe (11,8 s) explique moins de la moitié du hors-boucle moyen (26,2 s ; médiane 16,2 s, refaite course par course dans relecture/cout-fixe-par-course.txt).
- A3 : le clone observé n'est pas un enfant à gènes inertes (bVersRoutePlane est lu sans drapeau gardien), et INTERFACES § 9.5 dit ~4 % des enfants, pas 4 % des courses. Gain corrigé de 3,8 % à environ 0,1 %. La phrase « comme l'estimait INTERFACES § 9.5 » est barrée.
- Le doute « un appel à envCielCalc pendant loadGame ? » est levé : aucun dans les deux profils. L'appel de la chauffe passe par creer → attendPiste → loop → bioGo → paintEnv (relecture/appelants-ciel.js).
- En une minute : « 6 à 13 % du temps d'une course » devient « 11 % d'une course courte, 3 à 6 % d'une génération » ; « environ 13 % (24 %) » devient « environ 9 % (14 %) ».
- Une section « Relecture » est ajoutée à la fin du LISEZ-MOI, avec les commandes pour refaire.

### Doutes

- Aucune course n'a été jouée à la relecture. Les parts par course viennent toujours des 2 profils du seul témoin.
- Le nombre d'appels au ciel par course longue n'est pas mesuré. La borne haute de A1 (5,8 %) suppose un appel en route par 85 s de jeu, la borne basse aucun.
- La moitié du hors-boucle moyen (environ 14 s sur 26,2 s) n'est pas expliquée : charge du PC à 4 courses plus les autres travaux, fin de course ou envoi du résultat. Le hors-boucle grandit pour les courses de plus de 240 s (37,5 s). S'il vient du chargement, A2 vaut plus que les 6 % mesurés.
- La reconstruction course par course suppose que l'ordre des tâches est celui de population.json (vivants × grainesGeneration) au moment de la copie. Le contrôle (aucune valeur négative, moyenne identique au bilan global) le soutient, sans le prouver.
- A5 : son gain sur le Xeon (0,2 % mesuré sur une seule fin de génération, jusqu'à environ 1,7 % estimé) et sur le Ryzen ne sont pas mesurés.
- Les fichiers de relecture créés, rien n'est commité : ml/ecurie/etude/reglage-de-la-selection/vitesse/relecture/cout-fixe-par-course.js (.txt), gains-rapportes.js (.txt), appelants-ciel.js.

## 8. relire:tri-precoce

*Rôle : relecteur de l'étude « tri précoce » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI. Phase : Relire.*

### Résumé

I reviewed the « tri-precoce » study, trying to refute it. I reran all 7 commands one at a time. Every output matched exactly: residus.json is identical to the bit, and population.txt differs only in run time (127 s against 116 s). The real blind spot is the baseline. The real evolution switched itself to 8 seeds at the end of generation 1: it lasted 8 682 s, above seuilEconomie_s (5 400 s). I read the trial folder's generations.jsonl and population.json at 23:45, read-only, and nGraines is now 8. So what runs today is A8 (208 races), not A (312).

**Measured against A8:**
- B4 gives 1.4 times more generations a day, not 2.1.
- At the real generation-1 pace, the Xeon goes from about 14.9 to about 20.8 generations a day, not from 14.7 to 30.8.
- I added A8 and B4/8 to a copy of the simulator (relecture/population-economie.js). In those runs, after the simulator's « 3 days », B4's leader is 1.27 times A8's in « faible » (2.77 against 2.18) and 1.18 times in « moyen » (6.73 against 5.68).
- In « très faible » it is worse: 0.48 ± 0.06 against 0.65 ± 0.06. The negative test-retest points to that regime.

**Independent checks:**
- relecture/gain-independant.js recomputes B4's time from mean race times per group over all generation-1 races. It finds B4 at 48.4 % of A, against 47.8 % in the study, so the time gain holds.
- relecture/tri-reel-apparie.js refutes regles.js § 3. That script compared the child's bound and the threshold in two different references, from two separate fits. Judged in one reference, the 25 real children give 0 drops at k = 2 and 3, 1 at k = 4 (780adaceba8f) and 1 at k = 6 (9e65b289560d). The smallest margin is −0.59, not +0.34.

The conclusion not to sort early still holds: it rests on the time saved, about 1 % of a generation per child dropped.

**Other corrections:**
- The study's generations per day assumed generation-0 race lengths (53 s). Generation-1 races take 84 s.
- The simulator's « Xeon day » is about 1.25 to 1.3 real days. This changes the labels, not the comparison at equal budget.
- With 8 seeds, the 24-race protection already shields a child for two generations instead of one, so switching to protection by age is worth doing even without B4.

I corrected the LISEZ-MOI.md in place and added a « Relecture » section at the end, plus a limit on the 1 081-seed pool, which B4 uses up twice as fast. I only wrote in tri-precoce/ (LISEZ-MOI.md and the relecture/ subfolder). I committed nothing and launched no game race.

Files: C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\tri-precoce\LISEZ-MOI.md, and in its relecture\ subfolder: gain-independant.js/.txt, tri-reel-apparie.js/.txt, population-economie.js/.txt, and the reruns *-relance.txt.

### Verdicts du relecteur

- Recommandation : B4: the old pilots replay only the first 4 of the generation's 12 seeds (grainesAnciens 4), with protection by age and note.passes set to 30  
  Verdict : tient avec reserve  
  Pourquoi : The time gain is confirmed by an independent path (48.4 % against 47.8 % of A). But the study measures it against A (12 seeds), while the live evolution has been on 8 seeds since the end of generation 1 (pleine_s 8 682 s > 5 400). Against A8 the gain is 1.4 times more generations (about 14.9 → 20.8 a day on the Xeon), not 2.1 times (14.7 → 30.8). The leader is 1.17 to 1.27 times A8's level (faible 2.77 against 2.18, moyen 6.73 against 5.68, casse 5.83 against 4.99), not 1.37 to 1.5 times. In « très faible », the regime the negative test-retest points to, B4 does worse: 0.48 against 0.65 (about 2 standard errors). Protection by age and 30 passes hold, and protection by age is worth doing even without B4.
- Recommandation : Clone filter K: a child whose first 4 races have its parent's empreinte stops there (raison 'clone')  
  Verdict : tient avec reserve  
  Pourquoi : Detection is checked: 1 child in 25 was flagged on the real data, and it was the real clone, 9627905cd5bb (11 of 11 races identical to its parent). In simulation 0.05 to 0.16 % false clones. The gain is small and within the noise: 2.2 % of a generation's time, and A+K against A is 4.58 ± 0.18 against 4.46 ± 0.15 in moyen. It still works under the 8-seed economy (4 seeds out of 8). The only clear benefit is that clones stop taking slots (2.5 to 3.5 of the 20 living pilots under A).
- Recommandation : Do not implement the early sorting of children (if it is done anyway: k = 3, c = 2, on a minus 4·Ē, never on note.js's F)  
  Verdict : tient  
  Pourquoi : The decision holds even though the real-data number was wrong. Judged in one reference, k = 3 still drops 0 of 25 (smallest margin +0.54), and k = 4 and k = 6 drop 1 each. The study had said 0 everywhere with a margin of +0.34 (regles.js § 3 used two different fits). The deciding number has not changed: 0.9 to 1.4 % of a generation saved per child dropped, and in simulation 7.81 h against 7.72 h per generation with the leader unchanged within the noise. The trap is real: below 5 parties note.js sets E = 4, so an F-based rule would drop every child.
- Recommandation : Do not adopt C (selective replay) or D0/D1 (fixed seed set)  
  Verdict : tient  
  Pourquoi : C plays 307 to 311 races per generation instead of 312, so it saves nothing. D0 falls below A in every scenario with identical races (moyen 2.92 ± 0.36 against 4.46 ± 0.15), and the identical parent/child races behind it are measured (44 of 437, 10 %). D's pilots stay at 12 races, so they never reach the validation's 48. Reserve: the same trap partly comes back for every scheme once the 1 081-seed pool is used up, which happens twice as fast under B4 (about 4.3 days on the Xeon, 1 to 2 days on the Ryzen).

### Erreurs corrigées

- Wrong « today » baseline: the live evolution switched to 8 seeds at the end of generation 1 (generations.jsonl of the trial: pleine_s 8 682 s; population.json: nGraines 8, read at 23:45). The study compares everything to A at 12 seeds. Corrected in « En une minute », the time table (A8 row) and the progress table (A8 and B4/8 rows, from relecture/population-economie.txt), and in recommendation 1: about 1.4 times more generations, not 2.1, and a leader 1.17 to 1.27 times better, not 1.37 to 1.5.
- regles.js § 3 (the early-sorting rule on the 25 real children) compared a bound from a fit on the first k seeds only, which carries those seeds' mean difficulty (+0.54 palier at k = 3, +0.88 at k = 4), with a threshold from another fit. Judged in one reference: 0 drops at k = 2 and 3, 1 at k = 4, 1 at k = 6, smallest margin −0.59, not 0 everywhere and +0.34. Corrected in the text of question 1, in « En une minute » and in recommendation 3.
- Generations per day were computed at generation-0 race lengths (53 s). Generation-1 races average 84 s, and the real generation 1 made 9.95 generations a day at 12 seeds, not 14.7. Corrected: B4 is about 20.8 a day, not 30.8; validation takes about 10 h, not 7 h; a B4 generation takes about 4 150 s, not « half an hour ».
- The simulator's « Xeon day » (JOUR = 24 × 191 × 69.85 s) multiplies a throughput measured on 53 s races by a 69.85 s mean race, so it is 1.25 to 1.3 real days. This is noted in the LISEZ-MOI. The comparison at equal budget is unaffected.
- Under the 8-seed economy already running, the 24-race protection already keeps a child protected for two generations. This is added to recommendation 1: protection by age is worth doing even without B4.
- The proposed check « test-retest of the old pilots on their 4 common seeds » cannot show anything from one generation to the next, because the error of a over 4 races is about 1.6 palier. It is replaced by comparing halves over several generations.

### Doutes

- Which mutation scenario is real decides B4's sign. Against A8 its gain ranges from −26 % (très faible: 0.48 against 0.65) to +27 % (faible), and the test-retest of −0.21 points to the weak regime.
- The B4 against A8 comparison comes from my copy of the simulator with protection by age. The real A8 keeps the 24-race protection, which is a little worse for A8, so the real gap is slightly overstated in B4's favour.
- The 1 081-seed pool runs out after 90 generations at 12 seeds. After that, an old pilot that draws a seed it has already played gets a cached race and learns nothing, and children replay seeds their parents already know, which partly brings back D's trap. B4 reaches that point twice as fast. This is not simulated, and the training seed range cannot simply be widened: 950 000 and above is already used by the validation fallback and the coffre.
- regles.txt and the author's other outputs were not regenerated: I did not modify the author's scripts. The corrections live in the LISEZ-MOI.md and in relecture/.
- In the simulator, a child's races on a seed its parent did not play are drawn around its raw value, not around its theta (a mix with the parent's value), so B4 is very slightly penalised. This is negligible with a mean share of identical races of 0.1 and a mean mutation effect of −0.2.
- The sentence count in « En une minute » was already above eight before my corrections. I did not rewrite the summary.

## 9. relire:sacre

*Rôle : relecteur de l'étude « sacre » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI. Phase : Relire.*

### Résumé

J'ai relancé tous les scripts, un à la fois. a, b, c (2 000 essais), e, f (900) et g (9 000, graine 99) rendent des sorties identiques à celles de l'auteur. d-regards.js evolution redonne un regards-evolution.json de même empreinte SHA-256. Les sorties relancées sont dans relecture/re-*.txt.

J'ai refait le résultat clé par un chemin indépendant : relecture/r1-permutation.js. Il n'utilise ni commun.js ni le code rapide de l'auteur. Il appelle le vrai note.comparer (400 tirages) sur de vraies paires de courses jouées sur les mêmes graines, ce qui garde l'appariement réel, y compris l'effet de graine sur les mesures. Le cas nul est fabriqué par permutation : à chaque graine, pile ou face pour échanger les deux pilotes.
- courses-0.json : 2,4 % de faux sacres et 15,7 % de puissance à +1. L'auteur trouve 2,5 % et 14,3 %.
- Évolution du 27/11 (7 pilotes à 24 graines) : 3,5 % et 16,9 %. L'auteur trouve 3,0 % et 15,4 %.
Les deux chiffres de la question 1 sont confirmés.

Le désaccord f-population / e-plans (3,0 % contre 1,6 %) est bien du hasard : relecture/r3-population-nul.js, avec une autre graine et 6 000 fenêtres, donne 1,6 % sur tous les essais et 1,7 % sur les 3 767 meneurs choisis.

Pas d'erreur d'appariement, pas de fuite, pas de graine comptée deux fois, et l'écart-type n'est pas confondu avec l'erreur-type. Le décalage additif du palier et le tirage des mesures sans lien entre A et B sont des suppositions, et elles sont dites. Le second n'a pas d'effet visible d'après r1.

Quatre erreurs, corrigées en place dans LISEZ-MOI.md et résumées dans une section « Relecture » ajoutée à la fin :
1. Le critère (c) n'est pas la cause du plafond d'un +3 paliers : le critère (a) seul n'est atteint que 80 % du temps.
2. Le plan à deux étages n'est pas moins puissant. À risque égal (relecture/r2-plans-a-risque-egal.js), il a la même puissance que le séquentiel. Le séquentiel est seulement moins cher.
3. La malédiction prise sur le dernier regard est biaisée d'environ 0,28 palier. Il faut la prendre sur les 24 premières graines.
4. La règle 6 est réessayée à chaque génération après les 5 générations d'attente. Les taux « par fenêtre » sont donc des taux par essai, et les gains des recommandations 3 et 4 sont surestimés.

Je n'ai rien modifié hors du dossier d'étude. Je n'ai rien commité ni poussé, rien lancé dans le dossier de l'évolution, et aucune course n'a été jouée.

Fichiers :
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\relecture\r1-permutation.js, avec r1-bruit.txt et r1-evolution.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\relecture\r2-plans-a-risque-egal.js et r2-plans-a-risque-egal.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\sacre\relecture\r3-population-nul.js et r3-population-nul.txt

### Verdicts du relecteur

- Recommandation : 1. Séquentiel OBF 2,2 (paquets de 12 graines, de 24 à 96, arrêt si z < 0,5) dans evoluer.js validation()  
  Verdict : tient avec reserve  
  Pourquoi : Le risque se reproduit à l'identique : 1,8 % [1,5 ; 2,1] de faux sacres à 400 tirages. Le gain sur la règle actuelle est réel : 33 % contre 15 % de sacres à +1 sur les mêmes tirages. Mais « le meilleur plan » est trop fort. Au même risque (1,56 %), le deux étages 0,5 → 96 avec un seuil de 2,17 a exactement la même puissance (écart de 0,0 ± 1,5 point à +1). Un lot fixe de 96 graines au seuil 2,125 est même plus puissant : 39,4 % à +1, soit +6,0 ± 2,2. Le vrai avantage du séquentiel est son coût : 38 et 60 graines contre 47 et 69 pour le deux étages, et 96 pour le lot fixe. Autre défaut : la malédiction calculée sur le dernier regard est biaisée de +0,28 palier. Il faut la prendre sur les 24 premières graines.
- Recommandation : 2. Critères (b) et (c) à 2 se (seuilB, seuilC) ; <= dans (c)  
  Verdict : tient avec reserve  
  Pourquoi : Les chiffres sont exacts : à +2 paliers, 80,3 → 86,3 % ; à +3, 93,3 → 98,5 % ; les faux sacres restent à 1,6 %. Mais le « (c) rejette 16 % au hasard » se lit mal. C'est son taux pris seul. Parmi les pilotes qui passent déjà (a), (c) n'en retire que 1 à 10 % : avec la règle actuelle, à +3 on passe de 80,0 % avec (a) seul à 72,3 % de sacres. Le prix en ressemblance reste un choix de Sacha : à +2 paliers et E +0,1, on passe 56 % du temps au lieu de 30 %.
- Recommandation : 3. maledictionSeuil : null (couper l'escalade de la règle 6 vers 3)  
  Verdict : tient avec reserve  
  Pourquoi : Le principe tient : la validation sur graines neuves n'est pas biaisée. Mon contrôle r3 donne 1,7 % de faux sacres sur des meneurs choisis contre 1,6 % sur des pilotes non choisis. L'escalade ne protège donc de rien. Mais le « vrais sacres divisés par 5 » est un taux par essai de la règle 6. Dans evoluer.js, la règle 6 est réessayée à chaque génération : la perte réelle serait surtout un retard, plus petit que ×5.
- Recommandation : 4. (Option) regle6 : 2 → 1  
  Verdict : tient avec reserve  
  Pourquoi : Le modèle traite une « fenêtre » comme un seul essai de la règle 6. Dans le vrai code, l'essai se répète à chaque génération une fois les 5 générations passées. Comparer « 60 à 90 % des fenêtres validées au lieu de 14 à 62 % » surestime donc l'effet : avec la règle à 2, la validation vient souvent quelques générations plus tard. Il est juste de garder cette option pour après les premières vraies validations.
- Recommandation : 5. Ne pas compter les courses d'entraînement dans le jugement du sacre (le plan (c))  
  Verdict : tient  
  Pourquoi : Le résultat se reproduit à l'identique : 52,8 % de faux sacres avec un meneur de 48 courses, 61,6 % avec 120. Le mécanisme est évident : les courses d'entraînement du meneur sont justement celles qui l'ont fait choisir. Comme premier étage, elles ne filtrent rien : elles passent dans 91,5 à 97,6 % des validations déjà déclenchées.

### Erreurs corrigées

- § 1 : « C'est pourquoi même un +3 paliers n'est sacré qu'à 72 % » attribuait le plafond au critère (c). Le critère (a) seul n'est atteint que 80 % du temps, et (c) ne retire que 1 à 10 % des pilotes qui passent (a). Corrigé.
- La proposition disait le deux étages « un peu moins puissant (29,5 % à +1) ». C'était un effet de son risque plus bas (1,2 à 1,3 % contre 1,8 %). Au même risque, la puissance est identique sur les mêmes tirages : 33,4 % contre 33,4 % à +1, et 86,1 % contre 86,3 % à +2. Corrigé : le séquentiel est moins cher, pas plus puissant.
- La proposition calculait la malédiction sur le dernier regard. Sous un arrêt selon ce qu'on voit, ce dF est biaisé : en moyenne −0,28 palier pour un pilote égal et −0,27 pour un +1. Corrigé : la prendre sur les 24 premières graines.
- « Une fenêtre de validation tous les 5 générations » était inexact. evoluer.js réessaie la règle 6 à chaque génération tant que les 5 générations d'attente sont passées et qu'aucune validation n'a eu lieu. Corrigé, avec une réserve ajoutée aux recommandations 3 et 4, dont l'ampleur est surestimée.
- Ajout d'une section « Relecture » à la fin de LISEZ-MOI.md : ce qui a été refait, le contrôle indépendant, les corrections, et les commandes pour refaire la relecture.

### Doutes

- Ni l'auteur ni moi n'avons pu vérifier la supposition centrale : un meilleur pilote décalerait chaque course de d paliers sans changer leur forme. Les paliers sont des entiers de 1 à 20, très asymétriques, et aucune course n'atteint 900 s. Un vrai progrès qui allonge plutôt la queue des longues courses changerait la puissance de tous les plans, sans doute pas leur classement.
- Mon contrôle « évolution » par permutation ne repose que sur 7 pilotes, soit 21 paires. Il varie bien les graines échangées, mais il reste plus fragile que celui sur courses-0.json (34 pilotes).
- Les seuils de r2 (à risque égal) ont été réglés sur les mêmes 1 600 essais nuls qui servent à les juger, ce qui donne un léger optimisme commun à tous les plans. La puissance des plans retenus n'a pas été refaite sur des tirages neufs ; seul leur taux de faux sacres l'a été (g-controle).
- Je n'ai pas simulé la règle 6 réessayée à chaque génération. Je sais que les gains des recommandations 3 et 4 sont surestimés, pas de combien.
- Il reste à décider si la copie figée donnees/courses-2026-48.jsonl (environ 600 Ko, des identifiants de pilotes et des empreintes, rien de privé) va dans le dépôt public. Mes fichiers relecture/re-*.txt font doublon avec sorties/ et peuvent ne pas être commités.

## 10. relire:simulateur

*Rôle : relecteur de l'étude « simulateur » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI. Phase : Relire.*

### Résumé

J'ai relu l'étude « simulateur » ligne à ligne, puis je l'ai relancée et contre-vérifiée. Je n'ai rien commité, et je n'ai rien écrit hors de ml/ecurie/etude/reglage-de-la-selection/simulateur/ : mes scripts et leurs sorties sont dans relecture/, et le LISEZ-MOI.md est corrigé en place, avec une section « Relecture » à la fin.

Ce qui tient :
- verifier.js redonne exactement sorties-verifier.txt.
- Les médianes du scénario moyen à 400/h se retrouvent exactement : champion dP 0,30 / 0,99 et F4 0,41 / 1,22 à 10 000 / 50 000 courses.
- Les règles recopiées suivent evoluer.js et note.comparer : tournoi, naissances, renvoi, règle 6, critères a/b/c, malédiction, économie, coffre mis en cache.
- La fidélité, les tableaux de Q1 (progrès, jours) et la plupart des chiffres de Q2 et Q3 correspondent à leurs fichiers.

Le résultat clé refait par un chemin indépendant (relecture/faux-sacres-reel.js) : le vrai note.comparer, appliqué aux vraies courses du 27/11 sous l'hypothèse nulle, donne 3,2 % ± 0,6 de faux sacres par validation à seuilSacre 2 et 24 graines. Le simulateur donne 5,9 % ± 2,2, ce qui reste compatible. À seuilSacre 1, on trouve 9 / 18 / 17 % pour 12 / 24 / 48 graines, comme le simulateur. En revanche, le bootstrap ne sous-estime pas l'erreur-type (rapport 1,02) : l'explication de l'auteur est fausse.

Le défaut majeur est une fuite. Le plan « ensemble » juge les réglages sur les mondes 1000 à 1007, ceux-là mêmes du plan « sensibilité » qui a servi à les choisir. Sur des mondes neufs (graines 7000+k) :
- R3 passe de +0,31 ± 0,09 à +0,05 ± 0,06 dans le moyen, et de +0,50 à +0,20 ± 0,10 dans l'optimiste (40 mondes) ;
- D passe de +0,60 à +0,37 ± 0,12 (optimiste, 50 000), de +0,21 à +0,04 ± 0,07 (moyen, 200 000) et de +0,13 à 0,00 (pessimiste).

Autre défaut : le critère de R6 (« coffre muet à 50 000 courses, donc pessimiste ») ne marche pas. Dans le scénario moyen, le coffre de 40 graines ne voit le gain que dans 8 mondes sur 23.

Le reste corrigé dans le LISEZ-MOI :
- « 12 graines de validation » était classé mauvais par erreur ;
- « deux tiers du plafond » se lit en fait « la moitié » ;
- les médianes « 1,54 contre 1,22 » faisaient croire à un gain des 8 graines : l'écart apparié vaut +0,06 ± 0,15 ;
- le coût du poids 16 est de 0,49 à 1,11 palier en écart apparié, pas de 1 à 1,6 ;
- à poids 0, le critère (c) continue de bloquer les sacres ;
- resultats/nul.txt manquait : je l'ai refait.

### Verdicts du relecteur

- Recommandation : R1 : garder 12 graines par génération, 20 vivants, seuilSacre 2 et 24 graines de validation ; ne jamais passer à 6 graines ni à 40 pilotes  
  Verdict : tient avec reserve  
  Pourquoi : 6 graines est très solide : −1,16 ± 0,23 (moyen) et −2,46 ± 0,38 (optimiste), à plus de 4 erreurs-types. « 40 pilotes » ne vaut qu'avec 6 naissances : la pression tombe de 6/26 à 6/46. L'écart est de −0,57 ± 0,12 dans le moyen, mais seulement −0,43 ± 0,18 (2,4 erreurs-types) dans l'optimiste et −0,09 ± 0,06 dans le pessimiste. Garder 24 graines de validation et seuilSacre 2 est un choix de prudence, pas un optimum mesuré : 48 graines fait +0,09 à +0,30 (n.s.) et seuilSacre 1 fait +0,56 ± 0,16 dans l'optimiste. Enfin, « 12 graines de validation » était classé mauvais par erreur (neutre : −0,05 à +0,16).
- Recommandation : R2 : mesurer le débit du Ryzen dès la première nuit et laisser l'économie de graines telle quelle  
  Verdict : tient  
  Pourquoi : Les jours se recalculent : 50 000 courses font 10,8 / 5,3 / 2,6 jours. Le test apparié 200/h contre 400/h sur les mêmes mondes ne montre aucun dommage : F4 +0,06 ± 0,15 (moyen, 50 000), −0,04 ± 0,07 (moyen, 200 000), aucun écart au-delà de 2 erreurs-types. Le gain que suggéraient les médianes 1,54 contre 1,22 n'existe pas. L'époque ne bouge pas, puisque l'économie n'entre pas dans courses.js epoque.
- Recommandation : R3 : ne rejouer que les jeunes de moins de 48 courses, le témoin, le champion et les 4 meilleurs (option 'rejouer')  
  Verdict : ne tient pas  
  Pourquoi : Le gain annoncé (+0,31 ± 0,09 dans le moyen à 50 000 courses) vient des mondes qui ont servi à le choisir parmi 15 réglages. Sur 40 mondes neufs : +0,05 ± 0,06 (moyen), +0,20 ± 0,10 (optimiste), 0,00 ± 0,03 (pessimiste). Il ne nuit pas et donne bien 40 % de générations en plus (163 → 230), mais son gain vrai n'est pas démontré hors de l'optimiste. Il ne justifie pas une modification de evoluer.js.
- Recommandation : R4 : poissonMutations 2 → 4 et validation.intervalle 5 → 2, avec R3 (l'ensemble D)  
  Verdict : tient avec reserve  
  Pourquoi : Sur 30 mondes neufs, D ne gagne que dans l'optimiste : +0,37 ± 0,12, contre +0,60 annoncé. Ailleurs : 0,00 ± 0,03 (pessimiste), +0,08 ± 0,08 (moyen, 50 000), +0,04 ± 0,07 (moyen, 200 000 courses, 10 mondes), contre +0,21 ± 0,09 annoncé. poissonMutations 4 seul fait +0,20 ± 0,11 (optimiste) et 0,00 ± 0,07 (moyen). C'est sans danger, et l'époque ne change pas (elle ne lit que cfg.note et les fichiers du bot), mais le gain attendu est d'environ 0 à 0,4, seulement si le scénario est optimiste.
- Recommandation : R5 : ne pas baisser seuilSacre à 1 ni monter le poids de E au-dessus de 4  
  Verdict : tient avec reserve  
  Pourquoi : Les faux sacres à seuilSacre 1 se retrouvent indépendamment, avec le vrai note.comparer sur les vraies courses : 18,2 % ± 1,3 à 24 graines (9,4 % à 12, 16,6 % à 48). Le poids 16 coûte, en écart apparié, 0,49 ± 0,20 à 1,86 ± 0,44 palier, selon la taille SUPPOSÉE des effets sur E. Mais seuilSacre 1 fait gagner le champion (+0,56 ± 0,16, optimiste) : c'est un choix de sûreté contre vitesse, pas une perte nette dans tous les scénarios.
- Recommandation : R6 : recaler la loi des mutations sur la vraie évolution après 30 à 50 générations, puis refaire les plans  
  Verdict : tient avec reserve  
  Pourquoi : Le recalage est la bonne suite, puisque le scénario fait de 0 à 4,3 paliers. Mais la règle de décision proposée est fausse : à 50 000 courses dans le scénario moyen, le coffre de 40 graines ne voit le gain à plus de 2 erreurs-types que dans 8 mondes sur 23 (15 sur 24 dans l'optimiste, relecture/coffre-puissance.txt). Un coffre muet ne prouve donc pas qu'on est dans le pessimiste. Il faut juger sur les enfants contre leurs parents (des centaines de naissances), ou agrandir le coffre.

### Erreurs corrigées

- « En une minute » rangeait « 12 graines de validation » parmi les mauvais réglages, alors que le tableau de sensibilité le donne neutre (−0,05 à +0,16) ; le mauvais réglage est 24 graines PAR GÉNÉRATION. Corrigé, avec la précision « 40 pilotes (avec 6 naissances) ».
- « Le champion arrive aux deux tiers du plafond (1,3 sur 2,4) » : 1,28 sur un plafond médian de 2,53, c'est la moitié. Corrigé.
- « 8 graines ne nuisent pas (F4 1,54 contre 1,22) » : ces médianes suggéraient un gain. L'écart apparié 200/h − 400/h vaut +0,06 ± 0,15 (moyen, 50 000) et −0,04 ± 0,07 (200 000). Remplacé (relecture/economie-apparie.txt).
- Fuite dans le plan « ensemble » : il juge sur les mondes 1000 à 1007, qui ont servi à choisir les réglages. J'ai ajouté en § 2 bis un tableau hors échantillon (mondes 7000+k) et abaissé les confiances de R3 et R4 dans le tableau des recommandations. « En une minute » dit maintenant 0 à 0,4 sur des mondes neufs.
- § 4 : l'explication « le bootstrap à 24 graines sous-estime l'erreur-type » est réfutée. Sur les vraies courses, l'écart-type réel de dF divisé par le se_dF moyen vaut 1,02, et le taux est de 3,2 % ± 0,6 ; l'écart avec 5,9 % ± 2,2 est du hasard (relecture/faux-sacres-reel.txt). Corrigé.
- Q3 : « le poids 16 coûte 1 à 1,6 palier » en monde inerte devient 0,49 ± 0,20 à 1,11 ± 0,24 en écart apparié. « +0,09 à +0,5 chez le meilleur vivant » devient +0,12 à +0,53 (note.txt). J'ai ajouté que « poids 0 » n'est pas « le palier seul » pour le sacre : le critère (c) dE < se_dE bloque les sacres, d'où un champion à −1,13 ± 0,46 palier dans l'optimiste en conflit (relecture/note-apparie.txt).
- R6 : la règle « si le coffre ne montre rien à 50 000 courses, on est dans le pessimiste ou l'étroit » est remplacée. Le coffre de 40 graines ne voit le gain du moyen que dans 8 mondes sur 23 (relecture/coffre-puissance.txt).
- resultats/nul.txt manquait alors que le rendu le citait : je l'ai refait avec node resumer.js nul, et ses chiffres sont identiques à ceux du LISEZ-MOI.
- J'ai ajouté une section « Relecture » à la fin du LISEZ-MOI. Elle dit ce qui était faux, ce qui est corrigé, ce qui tient avec réserve et comment refaire.

### Doutes

- Mes contrôles hors échantillon passent encore par simuler.js. Ils corrigent la fuite, pas les hypothèses du simulateur : paysage additif de 64 gènes, loi des mutations supposée, têtes et phases B/C absentes alors que la vraie évolution sera en phase C au plus tard à la génération 120.
- Mon test indépendant des faux sacres tire A et B parmi les vrais pilotes des générations 0 et 1. Leur dispersion vraie (~0,3 à 0,6 palier) rend ce nul un peu plus bruité qu'un nul strict. Son ordre de grandeur (3,2 %) reste celui de la relecture statistique (3,7 %).
- D à 200 000 courses n'a été rejoué que sur 10 mondes neufs (+0,04 ± 0,07), faute de temps (environ 20 s par évolution). Le pessimiste et l'optimiste à 200 000 courses ne sont pas refaits.
- La preuve 4 de verifier.js (le simulateur rend la génération 0) est en partie circulaire : les résidus, se_E et la dispersion des mutants sont calés sur ces mêmes 527 courses. Et le cas « monde sans effet, gain exactement 0 » est vrai par construction (w = 0). Je l'ai écrit dans la Relecture sans réécrire ces tests.
- Je n'ai pas relu analyser-reel.js ligne à ligne ; j'en ai seulement contrôlé la source des résidus (générations 0 et 1, regonflés de racine(N/ddl)). Je n'ai pas non plus relancé les plans complets de l'auteur (principal, sensibilite, ensemble, note) : je n'en ai retrouvé qu'une case et relu leurs JSON.
- donnees/ contient une copie d'environ 600 Ko des vraies courses, dans un dépôt public. Un grep sur « Users », « sacha » et « @ » ne trouve rien dans relecture/. Il faudra le refaire sur tout le dossier avant un commit.

## 11. synthese

*Rôle : auteur de la synthèse : classe les changements (à faire, à essayer, à ne pas faire, à décider par Sacha). Phase : Synthese.*

### Résumé

J'ai écrit la synthèse dans ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md. J'ai lu les cinq LISEZ-MOI en entier, relectures comprises, et je ne reprends aucun chiffre réfuté.

**Réponse en une minute.** La sélection progressera peut-être, lentement, et on ne le saura qu'en la regardant tourner.
- **Le frein principal n'est pas un réglage.** Le hasard d'une course vaut 3,26 paliers. L'écart vrai entre deux mutants vaut 0,32 [0 ; 1,07]. Un mutant ne se classe pas pareil sur deux lots de graines (r = −0,13 et −0,21). Dans le cas le plus probable, le classement est donc fait à 80 ou 90 % de hasard.
- **Vitesse, si les mutations comptent un peu** (scénario « moyen ») : environ +1 palier en 50 000 courses, soit 2,6 à 5,3 jours à 400-800 courses/h. C'est le Ryzen s'il fait 2 à 4 fois le Xeon ; son débit n'est pas mesuré.
- **Si elles comptent aussi peu que mesuré**, la sélection stagne.
- **Les réglages actuels sont déjà bons.** Sur des mondes neufs, aucun changement ne rapporte plus de 0 à 0,4 palier, alors que le scénario fait varier le résultat de 0 à 4 paliers.

**Deux calculs neufs, dans synthese/** (aucune course jouée, rien modifié ailleurs, rien commité) :

1. **b4-au-simulateur.js** rejoue la proposition B4 du tri précoce, à l'identique, dans le simulateur calé. Il patche simuler.js en mémoire ; au neutre, le patch redonne l'évolution d'origine au bit près (TOUT PASSE).

   | Écart de F4 du champion (mondes neufs) | moyen | optimiste | pessimiste |
   |---|---|---|---|
   | B4 à 400/h | +0,08 ± 0,10 | +0,26 ± 0,13 | +0,03 ± 0,04 |
   | B4 à 200/h (économie de graines active) | +0,25 ± 0,07 | +0,40 ± 0,16 | – |
   | Protection par l'âge seule, à 200/h | +0,17 ± 0,10 | +0,32 ± 0,12 | – |

   La protection par l'âge seule explique donc la plus grande part du gain de B4. Le désaccord entre les deux études vient surtout de ce que le simulateur du tri précoce n'a pas de plafond.

2. **taille-de-la-mesure.js** calcule combien d'enfants il faut pour voir si les mutations comptent. La mesure est gratuite dans la vraie évolution : 160 enfants (environ 27 générations à 12 graines) pour distinguer τ = 0,5 de zéro.

**Contradictions tranchées :**
- **Faux sacres :** environ 3 %.
- **8 graines par génération ne nuisent pas.** Leur seul défaut est la protection de 24 courses, réparée par la protection par l'âge, sans relever le seuil d'économie.
- **La méthode d'« effets » pour mesurer τ est la seule qui retire le bruit du témoin commun.** Les scénarios du simulateur penchent donc vers l'optimisme.
- **Poisson 4 :** sans danger, gain non démontré.

**Un écart de documentation à confirmer.** INTERFACES § 9.3 dit que genome.js fait partie de l'époque. Le code dit le contraire : FICHIERS_EPOQUE, ligne 251 de commun.js, ne le contient pas.

**Ce qu'on ne sait toujours pas :**
- la valeur de τ ;
- le débit du Ryzen ;
- si des mutations plus fortes agrandissent τ ;
- la forme du progrès d'un meilleur pilote ;
- les phases B et C et le génome v:2, qui ne sont pas simulés.

À cela s'ajoute l'épuisement de la réserve de 1 081 graines d'entraînement vers la génération 90 : 2,3 à 4,5 jours sur le Ryzen, calculé et non simulé. Il faut prévoir une seconde plage de graines.

### Recommandations

- Changement : A FAIRE TOUT DE SUITE (1) — config.json : validation.maledictionSeuil 1 -> null. La malédiction reste mesurée dans le journal, mais regle6 ne passe plus à 3. Ne change pas l'époque.  
  Gain attendu : Évite une alarme qui sonnera par construction (biais du vainqueur attendu de 1,1 à 1,8 palier) et qui ferait passer la règle 6 à 3. Le « divisé par 5 » des vrais sacres est un taux par essai : la perte réelle serait surtout un retard.  
  Coût : Une valeur de config. La validation sur graines neuves n'est pas biaisée (1,7 % contre 1,6 % de faux sacres). Relecteur : tient avec réserve (ampleur surestimée).  
  Confiance : haute
- Changement : A FAIRE TOUT DE SUITE (2) — Ne rien dégrader : garder 12 graines par génération, mu 20, lambda 6, seuilSacre 2. Ne jamais passer à 6 ou 24 graines par génération, ni à 40 vivants avec 6 naissances, ni à seuilSacre 3. Mesurer le débit du Ryzen dès la première nuit (debit_h et nGraines dans generations.jsonl).  
  Gain attendu : Évite de −0,6 à −2,5 de F4 à 50 000 courses. Dira si 50 000 courses font 2,6 ou 10,8 jours.  
  Coût : Aucun, une nuit de mesure. Relecteur : tient (avec réserve sur « 40 pilotes », qui ne vaut qu'à 6 naissances).  
  Confiance : haute
- Changement : A FAIRE TOUT DE SUITE (3) — Protéger les enfants par leur âge. Dans evoluer.js, tournoi() (ligne 354) : le pool = les vivants nés en G−2 ou avant. Au renvoi (ligne 680) : elig = les vivants nés avant G, témoin et champion toujours exclus. Plus un cas dans tests/generation.test.js. Ne change pas l'époque.  
  Gain attendu : Calculé par la synthèse (simulateur calé, 24 mondes neufs, économie à 8 graines active) : +0,17 ± 0,10 (moyen) et +0,32 ± 0,12 (optimiste) de F4 à 50 000 courses. Aucun effet à 12 graines, comme attendu.  
  Coût : Deux lignes. Pas relu par un second agent (proposé par la relecture du tri précoce, chiffré ici, 1,7 et 2,7 erreurs-types).  
  Confiance : moyenne
- Changement : A FAIRE TOUT DE SUITE (4) — Validation séquentielle (étude sacre). Dans evoluer.js, validation() : 24 graines, puis des paquets de 12 jusqu'à 96 ; sacre si z > 2,2·√(96/n), arrêt si z < 0,5. La malédiction se calcule sur les 24 PREMIÈRES graines. note.comparer lit seuilB et seuilC dans la config (1 par défaut). validations.jsonl reçoit regards[]. La revalidation reste à 24 graines. Ne change pas l'époque.  
  Gain attendu : Un vrai +1 palier reconnu 33 fois sur 100 au lieu de 15, un +2 86 fois au lieu de 44. Faux sacres 3,0 -> 1,8 %. Aucun pilote moins bon sacré.  
  Coût : 76 courses par validation pour un pilote égal, 120 pour un +1 (contre 48), et une boucle à écrire avec la reprise par le cache. Relecteur : tient avec réserve (il est le moins cher, pas le plus puissant : un lot fixe de 96 graines fait +6 ± 2 points). Son effet sur le progrès du champion n'est pas simulé.  
  Confiance : moyenne-haute
- Changement : A FAIRE TOUT DE SUITE (5) — evoluer.js, courir : demander les courses les plus longues d'abord, en gardant l'ordre de L. Ne change pas l'époque.  
  Gain attendu : 0,2 % mesuré sur le Xeon, jusqu'à environ 1,7 % estimé, peut-être plus sur le Ryzen.  
  Coût : Quelques lignes. Relecteur : tient avec réserve (gain incertain dans les deux sens).  
  Confiance : moyenne
- Changement : AVEC LA PROCHAINE ÉPOQUE (idéalement avant le lancement de la population du Ryzen) — Dans ml/reel/jeu-reel.js, creer : envCielCalc remplacée par 6 faces noires (si !opts.charge). Et config note.passes 10 -> 30.  
  Gain attendu : Le ciel : 3,3 à 5,8 % du temps d'une génération, aucune course changée (fonction pure, 2 courses sur 2 identiques au bit près). Les 30 passes : un modèle mieux convergé quand les pilotes ne jouent pas les mêmes graines.  
  Coût : Change l'époque (le ciel : celle des courses ; les passes : celle des notes). Il faut d'abord une preuve sur 24 courses connues, avec le vrai code et des pilotes variés (30 min à 1 h). Relecteur : tient avec réserve (gain corrigé de 9,3 % à 3,3-5,8 %).  
  Confiance : haute sur l'exactitude, moyenne sur le gain
- Changement : A ESSAYER, après la mesure de τ — poissonMutations 2 -> 4 (ou sigmaMutation 0,30) ; dans genome.js, muter qui ne tire que les réels lus (génome v:2) ; regle6 1 ; filtre des clones ; B4 (les anciens sur 4 graines).  
  Gain attendu : Chacun de 0 à environ +0,4 palier, seulement dans les scénarios favorables. Poisson 4 : 0,00 ± 0,07 (moyen), +0,20 ± 0,11 (optimiste). Le gain propre de B4, au-delà de la protection par l'âge, est d'environ +0,1.  
  Coût : B4 casse la mesure gratuite de τ, épuise la réserve de graines deux fois plus vite et retarde la validation. Le tri des gènes muets (genome.js) ne change pas les courses d'après le code. Relecteurs : tient avec réserve.  
  Confiance : basse
- Changement : A DÉCIDER PAR SACHA — Les critères (b) et (c) du sacre à 2 erreurs-types : c'est le taux de change entre palier et ressemblance. Le poids de E (garder 4). seuilSacre 1 (sûreté contre vitesse). Tout ce qui change les yeux ou la physique. Committer ou non les copies de données dans le dépôt public.  
  Gain attendu : Critères à 2 erreurs-types : +2 paliers reconnu 86 fois sur 100 au lieu de 80 ; mais un pilote +2 paliers qui s'éloigne des joueurs (E +0,1) passe 56 fois sur 100 au lieu de 30. Un poids de E à 16 coûterait 0,49 à 1,11 palier.  
  Coût : Ce sont des choix de but, pas de statistique.  
  Confiance : haute sur les chiffres
- Changement : A NE PAS FAIRE — Rejouer seulement les jeunes et les 4 meilleurs (la recommandation 3 du simulateur, réfutée hors échantillon : +0,05 ± 0,06). Écrire les gènes éteints à leur valeur de naissance (environ 0,1 %). Le tri précoce des enfants. Les rejeux C et D (graines fixes). Compter les courses d'entraînement dans le jugement du sacre (53 à 62 % de faux sacres). Plusieurs courses par processus avant d'avoir réparé l'état qui reste. Un cache « au comportement ». Relever seuilEconomie_s.  
  Gain attendu : Évite du code pour un gain nul ou négatif.  
  Coût : Aucun  
  Confiance : haute

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\synthese\b4-au-simulateur.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\synthese\taille-de-la-mesure.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\synthese\sorties\b4-controle.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\synthese\sorties\b4-bilan.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\reglage-de-la-selection\synthese\sorties\taille-de-la-mesure.txt

### Doutes

- Mon calcul B4 hérite de toutes les suppositions du simulateur calé : paysage additif de 64 gènes, loi des mutations par scénario, ni têtes ni drapeaux, génome v:1. Le rejeu à 200 000 courses a été arrêté parce qu'il dépassait 5 minutes : seul le point à 50 000 courses est mesuré.
- Le bras B4 comprend aussi note.passes 30. La protection par l'âge (A4) n'est qu'à 1,7 et 2,7 erreurs-types, et aucun second agent ne l'a relue.
- Le classement de genome.js hors de l'époque vient de ma seule lecture de commun.js (ligne 251, FICHIERS_EPOQUE) et d'un grep de courses.js. INTERFACES § 9.3 dit le contraire : Fable doit confirmer.
- taille-de-la-mesure.js suppose un bruit normal et les deux moitiés d'un enfant jouées dans la même époque. À 8 graines, ou si un changement d'époque tombe au milieu, la mesure gratuite de τ ralentit ou se coupe.
- Le débit du Ryzen et sa date de lancement sont inconnus : si sa population tourne déjà, le changement du ciel et note.passes 30 attendront la prochaine époque.
- L'épuisement de la réserve de graines (2,3 à 4,5 jours sur le Ryzen) est un calcul de la synthèse à partir des chiffres du tri précoce, non simulé. Je n'ai pas relu le comportement de graines.js à l'épuisement.
- Le dossier ml/evolution a des modifications non commitées d'une autre session (portage). Je ne les ai pas lues : les numéros de ligne cités (evoluer.js l. 354 et 680) sont ceux de la copie de travail actuelle.
