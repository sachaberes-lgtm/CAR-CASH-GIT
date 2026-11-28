# Les changements sûrs de l'étude du réglage entrent dans la sélection : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `changements-surs-du-reglage` (wf_adf7db90-3c8), lancée par la session principale (Claude Fable).
- Agents : 7, tous du modèle claude-opus-5-5.
- Durée : 5 h 03 ; jetons consommés par les agents : 1 986 602 (1,99 millions) ; appels d'outils : 597.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. constructeur du lot « sacre » : la validation séquentielle et l'alarme « malédiction » coupée (phase « Faire »)
2. constructeur du lot « tau » : mesure-tau.js, la sélection mesure seule si les mutations comptent (phase « Faire »)
3. constructeur du lot « règles » : protection des enfants par l'âge, ordre des courses, réserve de graines, gènes muets hors de l'urne (phase « Faire »)
4. relecteur du lot « sacre » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
5. relecteur du lot « tau » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
6. relecteur du lot « règles » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
7. intégrateur : branche la mesure, relance tous les tests (lents compris), reprend un état écrit par l'ancien code, écrit la note de livraison (phase « Integrer »)

## 1. faire:sacre

*Rôle : constructeur du lot « sacre » : la validation séquentielle et l'alarme « malédiction » coupée. Phase : Faire.*

### Résumé

Les deux changements sont faits et vérifiés. Rien n'est commité ni poussé, et le jeu ne change pas.

A5 : la validation devient séquentielle (evoluer.js). Le meneur joue d'abord 24 graines neuves, puis des paquets de 12 jusqu'à 96. Il est sacré si z > 2,2 × racine(96/n) et si les critères (b) et (c) passent. On arrête sans sacre si z < 0,5, au plafond, ou s'il n'y a plus de graines. La malédiction se calcule sur les 24 premières graines. note.comparer lit seuilB et seuilC dans cfg.validation, à 1 par défaut (je ne les ai pas passés à 2). La revalidation garde ses 24 graines. Tous les nombres sont dans config.json « validation », avec une note dans _notes qui cite l'étude. Une config sans « plan » garde l'ancienne règle, et un plan mal écrit est refusé dès le chargement. validations.jsonl reçoit « plan », « regards » (un élément par regard : n, graines mesurées, borne, z, les nombres de comparer, critères, décision), « arret » et « courses ». etat.js, histoire.js, tableau.js et arbre.js disent « SACRE au 3e regard, sur 48 graines » ou « arrete au 1er regard » ; une ancienne ligne garde sa phrase (« sur 24 graines (un seul lot) »).

A1 : maledictionSeuil vaut null. La malédiction reste écrite dans validations.jsonl mais ne fait plus passer regle6 à regle6Haute. Les deux cas sont testés : null ou absent ne sonne pas, la valeur 1 redonne l'ancienne alarme.

Mesure de mon code (tests/mesure-sacre.js), sur les mêmes tirages que l'étude :
- Faux sacres : 1,8 % [1,5 ; 2,1] sur les 9 000 tirages de g-controle-nul, 37,3 graines en moyenne.
- +1 palier : 33,1 % [30,0 ; 36,5] pour 60 graines.
- +2 paliers : 79,9 % avec la config livrée (critères à 1 se). Le 86 % attendu ne vaut qu'à 2 se : j'obtiens alors 85,9 %. Avec les critères à 1 se, comme livré, c'est 80 %.
- −0,5 palier : 0,1 %.

Tous ces chiffres retombent sur ceux de l'étude.

Reprise :
- Faux ordonnanceur (test V5) : un STOP au 3e paquet n'écrit rien. La reprise rend la même ligne de validations.jsonl et ne rejoue aucune course (15 jouées avant la coupure + 5 à la reprise = les 20 sans interruption).
- Vraies courses : un kill dur au milieu du premier lot, puis la relance, donnent aussi la même ligne, sans course en double (18 lignes pour 18 clés).

Graines : la plage de validation (1 000 000 + 37k) ne touche ni l'entraînement, ni le coffre, ni le repli, et n'est jamais reprise (vérifié sur 48 000 graines). Le code ne lui donne pas de fin : la graine ne passerait 2³¹ qu'après 604 302 validations au plafond. Le repli, que le code n'active jamais seul, tiendrait 11 validations au plafond.

Compatibilité Ryzen : sept états écrits par l'ancien code se relisent sans erreur, dont deux populations en génome v:2.

La note pour l'intégrateur est dans ml/evolution/notes/sacre.md.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\note.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config-essai.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\etat.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\arbre.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\validation-sequentielle.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\mesure-sacre.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\sacre.md

### Tests

- Nom : commun  
  Réussi : oui  
  Détail : 16/16
- Nom : graines  
  Réussi : oui  
  Détail : 8 passes
- Nom : note  
  Réussi : oui  
  Détail : 16 passes
- Nom : genome  
  Réussi : oui  
  Détail : 14 passes
- Nom : tableau  
  Réussi : oui  
  Détail : 69/69
- Nom : lanceurs  
  Réussi : oui  
  Détail : 76/76
- Nom : generation  
  Réussi : oui  
  Détail : 12/12
- Nom : robustesse  
  Réussi : oui  
  Détail : 8/8
- Nom : machine  
  Réussi : oui  
  Détail : 45/45
- Nom : machine-relecture  
  Réussi : oui  
  Détail : 19/19
- Nom : traces  
  Réussi : oui  
  Détail : 87/87
- Nom : relecture-traces  
  Réussi : oui  
  Détail : 95/95
- Nom : gestes  
  Réussi : oui  
  Détail : 10 passes
- Nom : integration  
  Réussi : oui  
  Détail : 29/29
- Nom : portage  
  Réussi : oui  
  Détail : 11 passes
- Nom : node-epoque  
  Réussi : oui  
  Détail : 14/14
- Nom : validation-sequentielle (nouveau)  
  Réussi : oui  
  Détail : 25/25 en 3 s, sans course : V1 config, V2 bornes et décisions, V3 seuilB/seuilC, V4 alarme null/nombre, V5 reprise après STOP, V6 génération (malédiction sur le 1er regard, alarme coupée puis remise), V7 graines, V8 états de l'ancien code
- Nom : mesure-sacre (vrai code, tirages de l'étude)  
  Réussi : oui  
  Détail : faux sacres 1,8 % [1,5 ; 2,1] (9 000 essais) ; +1 : 33,1 % à 1 se, 33,9 % à 2 se ; +2 : 79,9 % à 1 se, 85,9 % à 2 se ; −0,5 : 0,1 % ; 37 graines (pilote égal), 60 (+1)
- Nom : vraies courses : génération 0 + validation séquentielle (config-essai, 2 à la fois, tmax 60, essais/sacre/vrai)  
  Réussi : oui  
  Détail : identité identique ; regard 1 : z 1,85 → continuer ; regard 2 : z 0,06 → arrêt
- Nom : vraies courses : kill dur pendant la validation puis reprise  
  Réussi : oui  
  Détail : même ligne de validations.jsonl que sans interruption ; 18 lignes de validation pour 18 clés, aucune course rejouée

### Problèmes

- Avec la config livrée (seuilB = seuilC = 1), un +2 paliers est reconnu 80 % du temps, pas 86 %. Les 86 % attendus valent à 2 se, ce qui est la décision D1 de Sacha : je ne l'ai pas prise.
- tests/etat-exemple et essais/test-tableau/complet ont des génomes v:1 que genome.js refuse déjà au commit de départ (« genome incompatible »). Ce n'est pas lié à ce lot : le test V8 relit alors leurs journaux sans population.json.
- Si regle6 est déjà passée à 3 dans le population.json du Ryzen, elle y reste : couper l'alarme ne la fait pas redescendre. Il faut le regarder sur place.
- INTERFACES.md n'est pas mis à jour (ce n'est pas un de mes fichiers) : § 3.1, § 3.5, § 3.6 et § 6.4 sont à reprendre par l'intégrateur, le texte est dans notes/sacre.md.
- Je n'ai pas lancé evoluer.test.js lui-même, parce qu'il écrit dans essais/tests-evoluer, un dossier commun. J'ai refait ses étapes a et f avec de vraies courses dans mon propre dossier essais/sacre/, à 2 courses à la fois.
- Choix prudents pris sans demander : la borne compte les graines mesurées chez les deux pilotes (une course ratée n'apporte pas d'information) ; z s'écrit "+inf" ou "-inf" quand se_dF vaut 0 ; le critère (c) garde « < » au lieu du « <= » proposé par l'étude.
- Je n'ai pas vérifié l'effet du séquentiel sur le progrès du champion (point C8 de la synthèse), ni l'hypothèse qu'un meilleur pilote décale ses paliers sans en changer la forme (M5) : les « regards » des premières vraies validations le permettront.

## 2. faire:tau

*Rôle : constructeur du lot « tau » : mesure-tau.js, la sélection mesure seule si les mutations comptent. Phase : Faire.*

### Résumé

Lot « tau » fait, sans commit. ml/evolution/mesure-tau.js (module et ligne de commande, lecture seule, mesurer() ne lève jamais) mesure gratuitement M1 et M4 à partir des journaux d'un état : courses-*.jsonl de toutes les époques, generations.jsonl, morts.jsonl et population.json.

M1, la corrélation « moitié contre moitié ». Pour chaque enfant, on compare son niveau sur les graines de sa génération de naissance à son niveau sur celles de la génération suivante.
- Le niveau d'une moitié est la moyenne de (palier − b_g), avec b_g tiré de note.ajuster.
- On en tire τ (√ de la covariance), son intervalle (re-échantillonnage des enfants et des graines de chaque génération, le même tirage pour tous), le détail par origine et par phase, le nombre d'enfants mesurés et le nombre requis.

J'ai trouvé deux pièges en vérifiant sur des journaux fabriqués :
1. **La dérive du modèle.** Le niveau des graines que fixe le modèle dérive d'une génération à l'autre comme une marche au hasard. Sans précaution, on trouve r ≈ 0,08 à 0,26 à τ = 0, et 9 à 22 fausses « victoires » sur 30 mondes. La correction : chaque moitié est centrée sur les enfants nés la même génération. On tombe à 0 sur 30.
2. **Une référence qui contient l'enfant.** Si b_g est ajusté sur tous les pilotes, τ² sort trop bas d'environ 0,03. La correction : b_g est ajusté sur les seuls pilotes établis (le témoin, qui joue toutes les graines, et les pilotes à partir de leur 3e génération). C'est alors sans biais : à τ = 0,5 on trouve τ² 0,249 pour 0,25, et r 0,218 pour 0,220 prévu par la formule de la synthèse.

Le centrage coûte un enfant par génération : il faut 191 enfants à λ = 6, au lieu des 160 de la synthèse. Avant ce nombre, l'outil ne conclut jamais.

M4, les courses pour rien : même empreinte qu'une course d'un parent sur la même graine, comptées en nombre et en temps.

Ce qu'il rend :
- **Vraies données du 27/11** (lecture seule) : « trop tôt pour le dire (19 enfants mesurés sur 191) ». r = −0,13 [−0,56 ; 0,50], le chiffre exact d'effets/ ; τ ≈ 0,00 [0 ; 0,94]. Courses pour rien : 62 sur 528 (11,7 %), soit 5,1 % du temps ; 14 sur 36 chez les naissances « mutation » ; une copie exacte (9627905cd5bb).
- **Les 39 états de essais/** (3 graines, génomes v:1 et v:2) : tous « trop tôt », sans erreur.

Note pour l'intégrateur dans ml/evolution/notes/tau.md : quoi appeler (MT.mesurer(dossier, MT.optionsDe(cfg, {tirages:400})), MT.ligneCourte, MT.lignes, x.phrase), où l'afficher (tableau, resume/etat, histoire), le format evolution-mesure-tau-1 avec un exemple réel, le texte pour Sacha, ce qui reste.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\mesure-tau.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\mesure-tau.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\tau.md

### Tests

- Nom : mesure-tau.test.js  
  Réussi : oui  
  Détail : 72/72, ~10 s, aucune course. τ = 1 reconnu (τ 1,07 [0,78 ; 1,17]). τ = 0 : jamais « comptent » (0/30 mondes). τ = 0,9 retrouvé. « Trop tôt » à 67 enfants même à τ = 1,5. Clones comptés exactement (573/573, au temps près). Robustesse : absent, vide, époque neuve, fichiers tronqués, journaux bizarres, panne simulée. Anciens états (etat-exemple et 39 états de essais/). Ligne de commande.
- Nom : commun  
  Réussi : oui  
  Détail : 16/16
- Nom : graines  
  Réussi : oui  
  Détail : 8/8
- Nom : note  
  Réussi : oui  
  Détail : 16/16
- Nom : genome  
  Réussi : oui  
  Détail : 14/14
- Nom : tableau  
  Réussi : oui  
  Détail : 69/69
- Nom : lanceurs  
  Réussi : oui  
  Détail : 76/76
- Nom : generation  
  Réussi : oui  
  Détail : 12/12
- Nom : robustesse  
  Réussi : oui  
  Détail : 8/8
- Nom : machine  
  Réussi : oui  
  Détail : 45/45
- Nom : machine-relecture  
  Réussi : oui  
  Détail : 19/19
- Nom : traces  
  Réussi : oui  
  Détail : 87/87
- Nom : relecture-traces  
  Réussi : oui  
  Détail : 95/95
- Nom : gestes  
  Réussi : oui  
  Détail : 10/10
- Nom : integration  
  Réussi : oui  
  Détail : 29/29
- Nom : portage  
  Réussi : oui  
  Détail : 11/11
- Nom : node-epoque  
  Réussi : oui  
  Détail : 14/14
- Nom : tests lents (evoluer, courses, identite)  
  Réussi : oui  
  Détail : Non lancés : ce lot ne joue aucune course et ne touche à aucun fichier qu'ils testent.

### Problèmes

- Le nombre requis passe de 160 (synthèse) à 191 enfants à λ = 6 (372 à 8 graines) : centrer sur la génération coûte un enfant par génération. Cela fait environ 32 générations au lieu de 27. Sans centrage, la mesure crie victoire à tort (voir résumé).
- Le nombre requis suit le hasard d'une course mesuré dans l'époque quand elle a au moins 200 degrés de liberté (sinon 3,26) : il peut bouger de quelques unités d'un état à l'autre.
- La référence des pilotes établis suppose que le témoin joue toutes les graines d'entraînement (vrai aujourd'hui, INTERFACES § 6.1-3). Une graine sans aucun établi mesuré sort de la mesure.
- Aucun vrai état du Ryzen n'a été lu. La compatibilité est prouvée sur tests/etat-exemple et les 39 états de essais/ ; le module ne fait que lire des champs présents depuis le premier code.
- Les estimations par origine et par phase n'ont qu'un intervalle sur les enfants (pas sur les graines) : indicatives.
- Le branchement dans tableau.js, histoire.js et etat.js reste à faire par l'intégrateur (notes/tau.md dit quoi appeler et où). Je n'ai modifié aucun fichier existant.
- Pendant mon travail, d'autres agents modifiaient arbre.js, config.json, config-essai.json, etat.js, evoluer.js, histoire.js, note.js et tableau.js, et ont créé tests/mesure-sacre.js et tests/validation-sequentielle.test.js. Les tests rapides passent avec ces retouches. note.ajuster, la seule fonction de note.js que j'utilise, est inchangée.

## 3. faire:regles

*Rôle : constructeur du lot « règles » : protection des enfants par l'âge, ordre des courses, réserve de graines, gènes muets hors de l'urne. Phase : Faire.*

### Résumé

The four rule changes and the two checks are done. Nothing is committed or pushed, the game does not change, and no epoch changes (modele.js, enfant.js and reseaux were not touched). The "sacre" agent's sequential validation is kept as is.

A4. Before changing anything, I checked the current rule (n >= 24 measured courses in the epoch). At 12 seeds it does match the synthesis. But it is not the same in three cases the synthesis does not mention:
- at 8 seeds (16 courses), as described;
- after a withdrawn seed or one unmeasured course (23 courses), the child was protected one generation longer;
- after a new epoch, nobody has 24 courses, so there was no dismissal at all.
Now the rule uses age (v.ne, protectionGenerations 1). A child born in G can be dismissed from G+1, and is a parent if born in G-2 or earlier. The champion and the reference pilot are still excluded. It is tested at 12 and at 8 seeds.

A6. The courses of a generation are requested from the longest expected to the shortest (the pilot's average survival, otherwise its parent's). The results go back to their original place. Along the way I found that note.noter depends on the order of its lines (the E bootstrap draws positions). That order was the order in which courses finished, and a restart already changed it. noterTous now sorts them (generation, seed, pilot, key). The test plays the same generation in both orders: the request order differs, and everything else is identical (generation line, population.json, morts, validations, course keys).

M6. Today, generation 90 draws 11 seeds that were already played, without any warning: 359 replays over 120 generations, shown with the e93ff5cb5 code. Now the same progression 910000 + 37·i continues after the reserved ranges: 1000021 to 999999984, step 37, so 27,000,000 seeds. It never meets the validation range (remainder 22 vs 1 modulo 37). The old range stays first: the first 90 batches are bit-identical to the old code. The reserve is refilled in blocks of 1081 (eg.blocs, 0 when absent). It lasts 2,250,090 generations at 12 seeds. At the very end, the run stops before any birth with a clear message, code 1, nothing written. Checked with 600 validations of 24 to 96 seeds mixed with 3,000 generations: no shared seed, nothing in the vault range or the fallback range.

C2. genome.GARDES is the only table: 10 flags guarding 30 reals, read from modele.js and bloc(). muter now draws only from the reals the parent's pilot reads (reelsLus). Proof:
- with the flag off, each real pushed to its bounds changes no decision (261 sequences: the inventory, portage.test.js and one per block);
- with the flag on, each of the 30 reals changes at least one decision;
- the number of reals drawn, the flags, the integers and the heads stay identical to the old draw pool at the same seed.
Share of silent mutations over 20,000 births of the reference pilot c0025: 26.7% before in v:2 (the Ryzen), 34.1% before in v:3, 0% after.

C7. genome.js does not enter the course epoch: FICHIERS_EPOQUE does not include it, and the pilot text is bit-identical to the one from the starting commit. INTERFACES § 9.3 was wrong and I corrected it. genome.js only enters the identity fingerprint, so the Ryzen will redo its identity check once.

alarmeDistance. The birth distance remeasured on 121 genes is 0.0221, so the threshold is 0.011, with its note. A threshold independent of the number of genes is not wired in: etat.js, histoire.js and tableau.js are not mine.

Ryzen compatibility. tests/etat-v2-ancien is a real v:2 state with no "blocs" field. It reloads and runs a full generation with this code. With the old reserve emptied, it takes its seeds from the new range.

Real courses (config-essai, my own state folder, 2 at a time, tmax 60): code 0, 3 generations in 35 min. Requests come by expected duration, and the children born in 1 are dismissed in 2.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\genome.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\graines.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config-essai.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\regles.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\genes-muets.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\generation.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\graines.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\integration.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\mesure-muettes.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\mesure-distance.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-v2-ancien\population.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-v2-ancien\generations.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-v2-ancien\validations.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-v2-ancien\morts.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-v2-ancien\coffre.jsonl

### Tests

- Nom : commun  
  Réussi : oui  
  Détail : 16/16
- Nom : graines  
  Réussi : oui  
  Détail : 13 passes, including 5 new M6 tests (the old code replays from generation 90; same leading range bit for bit; old-code state with full or empty reserve; GRAINES_EPUISEES stop; validation up to 96 seeds over 3,000 generations)
- Nom : note  
  Réussi : oui  
  Détail : 16 passes
- Nom : genome  
  Réussi : oui  
  Détail : 14 passes
- Nom : tableau  
  Réussi : oui  
  Détail : 69/69
- Nom : lanceurs  
  Réussi : oui  
  Détail : 76/76
- Nom : generation  
  Réussi : oui  
  Détail : 16/16, including A4 at 12 seeds (8 children dismissed at ne+1, 24 courses), A4 at 8 seeds (8 children at ne+1, 16 courses: the old rule would have protected them), A6 (72 courses, different order, everything else identical), compatibility with the v:2 state
- Nom : robustesse  
  Réussi : oui  
  Détail : 8/8
- Nom : machine  
  Réussi : oui  
  Détail : 45/45
- Nom : machine-relecture  
  Réussi : oui  
  Détail : 19/19
- Nom : traces  
  Réussi : oui  
  Détail : 87/87
- Nom : relecture-traces  
  Réussi : oui  
  Détail : 95/95
- Nom : gestes  
  Réussi : oui  
  Détail : 10 passes
- Nom : integration  
  Réussi : oui  
  Détail : 29/29 (alarmeDistance 0.011)
- Nom : portage  
  Réussi : oui  
  Détail : 11 passes
- Nom : node-epoque  
  Réussi : oui  
  Détail : 14/14
- Nom : validation-sequentielle (sacre lot)  
  Réussi : oui  
  Détail : 25/25
- Nom : genes-muets (new)  
  Réussi : oui  
  Détail : 6/6 in about 1.5 min on this loaded PC: m1 the table (10 flags, 30 reals, c0025 reads 58/88); m2 flag off, no decision changes (261 sequences, c0025 one real at a time, and all on except one with the flag's reals together); m3 flag on, each of the 30 reals changes a decision; m4 draws identical to the old pool except the pool itself; m5 34.11% to 0%; m6 genome.js outside the epoch, same pilot text as 7b1df608e
- Nom : mesure-muettes (20,000 births)  
  Réussi : oui  
  Détail : v:2 (e93ff5cb5): 26.74% silent (25.82% from the child's side), 2.27% silent births; v:3 before: 34.13%, 3.05%; after: 0%, 0 silent births
- Nom : mesure-distance  
  Réussi : oui  
  Détail : birth distance on 121 genes: 0.0221 (graineMaitre), mean 0.0223 over 200 seeds [0.013; 0.033], c0101 0.0218; threshold 0.011
- Nom : real courses: evoluer.js --config essais/regles/config-vrai.json --travailleurs 2 --arret-apres 3 (config-essai, tmax 60)  
  Réussi : oui  
  Détail : code 0, 3 generations in 35 min; identity IDENTICAL x3; generations 1-2 requested from longest to shortest (reference pilot 60 s first, a1996dd2 27.9 s last); g0 mutants dismissed in G1, children born in 1 dismissed in 2, no newborn dismissed; all mutated reals are read reals

### Problèmes

- A4: the current rule (24 measured courses) is the one the synthesis describes at 12 seeds, but not in three cases it does not mention: a withdrawn seed or an unmeasured course (23 courses means one more generation of protection), and a new epoch (nobody has 24 courses, so no dismissal in the first generation of the epoch). The age rule removes these cases. protectionCourses is no longer read.
- A6 led to a change I did not foresee: noterTous now sorts the lines (generation, seed, pilot, key) before note.noter. The note depended on the order in which courses finished (the E bootstrap draws positions), and a restart already changed it. On the Ryzen, se_F (and therefore rule 6) may shift slightly once, at the first generation with this code.
- genome.js changes the identity fingerprint: on its first launch with this code, the Ryzen will redo its identity check (3 courses of 45 s), without changing epoch.
- tableau.js:256 still says 'protégé tant qu'il n'a pas 24 courses' (cfg.protectionCourses||24): to be reworded by the integrator, it is not my file. INTERFACES § 2.5, § 3.1, § 3.4, § 6.1 and § 6.2 also need updating (text in notes/regles.md); I only corrected the wrong sentence in § 9.3.
- An alarmeDistance threshold independent of the number of genes is not wired in: it is read by etat.js, histoire.js and tableau.js, which are not mine. The recipe (alarmeDistanceSomme 1.34 / BORNES.length) is in the note.
- The synthesis expected 25.3% silent mutations in v:2. I measure 26.7% from the parent's side and 25.8% from the child's side; I could not find its exact calculation.
- The gain from A6 and the effect of C2 on selection progress (rather than on the draws) are not measured.
- Not run: evoluer.test.js, courses.test.js, identite.test.js (they write to shared folders). They were replaced by a real 3-generation run in essais/regles/vrai, and by m6, which shows the pilot text and identity do not change.
- Not checked: whether two seeds whose difference is a multiple of mulberry32's step give similar courses (this was already true of the old range).
- tests/etat-v2-ancien is a copy of essais/tests-evoluer/etat (ignored by git), written on 27/11 around 23:20 in genome v:2: I do not know the exact commit.

## 4. relire:sacre

*Rôle : relecteur du lot « sacre » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

J'ai relu le lot « sacre » en cherchant à le prendre en défaut. Les deux changements tiennent : A5, la validation séquentielle, et A1, l'alarme de la malédiction coupée. Je n'ai rien commité et le jeu ne change pas.

Ce qui tient à la relecture :
- Le bootstrap de comparer est bien apparié par graine, et se_dF est bien une erreur-type.
- Le second appel de regarder, celui qui corrige la borne, rend les mêmes nombres que le premier.
- Les graines de validation (1 000 000 + 37k) ne touchent jamais la suite d'entraînement du lot « regles » (1 000 021 + 37i) : le reste modulo 37 n'est pas le même.
- La reprise retire les mêmes graines, parce que population.json n'est réécrit qu'à la fin. Après une coupure d'époque, charger relit tout depuis le disque.

Preuve refaite par un autre chemin (essais/relecture-sacre/par-la-vraie-boucle.js) :
- mesure-sacre.js de l'auteur refait lui-même la boucle des regards. Mon script, lui, lance de vrais E.validerMaintenant de bout en bout (charger, validation(), jouerLot, graines.js, ecrireValidation, sacre et coffre).
- Les courses viennent de la réserve de l'étude, avec d'autres tirages. Une règle écrite à la main redécide ensuite chaque ligne de validations.jsonl à partir de ses regards.
- Résultats à 1 se, la config livrée :
  - pilote égal : 1,9 % de faux sacres [1,5 ; 2,4] sur 4 000 essais, 37,5 graines en moyenne ;
  - +1 palier : 31,1 % [28,3 ; 34,0], 61 graines ;
  - +2 paliers : 83,7 % [81,3 ; 85,9].
- Je ne trouve aucune incohérence entre les regards écrits et la décision prise (0 sur 6 000). Les chiffres de l'auteur (1,8 / 33,1 / 79,9) tiennent, aux erreurs de tirage près.

Ancien état : V8 ne relisait aucune validation sur une population v:2. J'ai donc rechargé tests/etat-v2-ancien (ancien code, une validation). Une validation séquentielle s'écrit par-dessus et reprend les graines là où l'ancien code s'était arrêté (validationK 3, puis 1000111). Le résumé, l'histoire, l'arbre et le tableau se lisent avec les deux sortes de lignes.

Corrigé en place (marqué « le relecteur ») :
1. etat.js : la ligne 8 du résumé pour un arrêt au 1er regard (le cas le plus fréquent) faisait 124 caractères, et jusqu'à 141 avec de grands nombres ou des graines épuisées. couper() la tronquait en « (dF +0.25 +... ». Le dF n'est plus ajouté que s'il tient dans les 118 colonnes, et « graines de validation epuisees » devient « plus de graines ».
2. config.json, dans _notes : la note annonçait « un +2 86 au lieu de 44 ». 86 % ne vaut qu'à seuilB = seuilC = 2, une décision qui n'est pas prise ; avec la config livrée, c'est 80 %.

J'ai ajouté une section « Relecture » à notes/sacre.md. Les 16 tests rapides et validation-sequentielle passent, relancés un par un.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\etat.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\sacre.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-sacre\par-la-vraie-boucle.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-sacre\etat-v2.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-sacre\sortie-boucle.txt

### Tests

- Nom : tests rapides (commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture, traces, relecture-traces, gestes, integration, portage, node-epoque)  
  Réussi : oui  
  Détail : tous à 100 %, relancés un par un à la fin. Au premier passage lancé en lot, commun, integration (3/29), portage (1) et relecture-traces (90/95) avaient échoué une fois ; ils passent seuls. Je pense que c'est le partage de fichiers avec les agents qui tournent en même temps.
- Nom : validation-sequentielle.test.js  
  Réussi : oui  
  Détail : 25/25, avant et après mes corrections
- Nom : par-la-vraie-boucle.js (vrai validerMaintenant, autres tirages de la réserve de l'étude)  
  Réussi : oui  
  Détail : pilote égal : 1,9 % [1,5 ; 2,4] sur 4 000 essais ; +1 : 31,1 % [28,3 ; 34,0] sur 1 000 ; +2 : 83,7 % [81,3 ; 85,9] sur 1 000 ; 0 incohérence regards/décision sur 6 000
- Nom : etat-v2.js (ancien état v:2 avec une validation, puis une validation séquentielle par-dessus)  
  Réussi : oui  
  Détail : se relit sans erreur, graines continuées (validationK 3 → 1000111), pages lisibles

### Problèmes

- Le +2 paliers à 1 se vaut environ 80 à 84 % selon les tirages, et 86 % seulement à seuilB = seuilC = 2 (D1, une décision de Sacha qui n'est pas prise).
- INTERFACES.md (§ 3.1, 3.5, 3.6, 6.4) reste à mettre à jour par l'intégrateur.
- Au dernier regard, si z < 0,5, l'arrêt s'appelle « futilite » et non « plafond ». Pour « epuisees », la décision « continuer » du dernier regard est écrasée dans regards. Le nom ou l'information changent, pas le verdict.
- Toutes les validations de même taille tirent les mêmes indices de bootstrap (comparer|n) : ce n'est pas un biais, mais leurs erreurs-types sont corrélées d'une validation à l'autre. C'était déjà le cas avant ce lot.
- Déjà là avant ce lot : à la reprise d'une génération dont la validation est déjà écrite, maledictionMoyenne compte cette validation deux fois en mémoire. La ligne n'est pas réécrite et l'alarme ne lit pas ce nombre, donc rien n'en sort.
- Si regle6 est déjà à 3 dans le population.json du Ryzen, elle y reste : il faut le vérifier sur place.
- Ni l'auteur ni moi n'avons vérifié l'effet sur le progrès du champion (C8) ni la forme des paliers d'un meilleur pilote (M5).
- Les tests rapides lancés pendant que d'autres agents tournent peuvent échouer une fois sans rapport avec le code : l'intégrateur doit les relancer sur un PC calme.

## 5. relire:tau

*Rôle : relecteur du lot « tau » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

Relecture du lot « tau » faite, sans commit. J'ai trouvé deux défauts et je les ai corrigés en place. Les deux corrections sont marquées « le relecteur » dans le code. La méthode elle-même tient : je l'ai vérifiée par un chemin indépendant.

**1. La règle « jamais de conclusion avant le nombre requis » pouvait céder (corrigé).**
- Le nombre requis se calculait avec le hasard mesuré dans l'époque, sans plancher.
- Le cas qui l'a montré : deux états laissés cette nuit dans essais/ par generation.test.js (essais/tests-generation/a6-longues et a6-origine). Le faux pilote de ces tests joue sans hasard, et le hasard mesuré y vaut 0,00.
- Résultat : il fallait 4 enfants au lieu de 191, et l'outil concluait « les mutations comptent » sur 7 enfants.
- C'est aussi le seul test de l'auteur qui échouait à ma relance (71/72) : « tous les états d'essai rendent trop tôt ».
- La correction : le nombre requis se compte avec max(hasard mesuré ; 3,26). Nouveau champ `enfants.sigmaRequis`.

**2. Un enfant renvoyé dès sa génération de naissance passait sans avertissement (corrigé).**
- `protectionGenerations` accepte la valeur 0. Dans ce cas, seuls les enfants bons sur leur première moitié restent pour la seconde, et τ sort trop bas.
- La correction : un nouveau champ `enfants.renvoyesAvantSecondeMoitie` (0 par défaut) et un avertissement dans `defauts`. Avec la règle actuelle (1), ce nombre vaut 0.

J'ai ajouté 3 tests : un monde sans hasard, un enfant renvoyé à sa naissance, et la vérification qu'`analyser` ne modifie pas les journaux qu'on lui passe.

**Preuve indépendante** (essais/relecture-tau/contre-verifier.js, hors git). Un autre monde fabriqué, plus proche du vrai que celui du test :
- les niveaux sont hérités du parent et les parents sont choisis par tournoi ;
- le bruit est dissymétrique, sur un palier entier qui ne descend pas sous 0 ;
- 3 % des courses ne sont pas mesurées, une génération est reprise, et on passe de 12 à 8 graines.

J'y ai aussi écrit un second estimateur, sans note.js. Sur 40 mondes par cas, à 50 générations de 12 graines :

| τ des mutations | τ² vrai | l'outil | mon estimateur | « comptent » |
|---|---|---|---|---|
| 0 | 0 | 0,014 | 0,012 | 6 sur 200 mondes (3 %, 2,5 % attendus) |
| 0,5 | 0,651 | 0,661 | 0,668 | 40 sur 40 |
| 0,9 | 2,188 | 2,182 | 2,167 | 40 sur 40 |

L'estimation est donc sans biais et le taux de fausses victoires est le bon.

Les chiffres du 27/11 se retrouvent exactement : r −0,13 [−0,56 ; 0,50], τ ≈ 0,00 [0 ; 0,94], 62 courses pour rien sur 528, soit 5,1 % du temps.

**Un défaut reste, non corrigé : les regards répétés** (essais/relecture-tau/regards-repetes.js). Le verdict est recalculé à chaque génération. À τ = 0, sur 120 mondes :
- au premier regard, l'outil crie « comptent » à tort 2 fois sur 120 (1,7 %) ;
- regardé toutes les 5 générations jusqu'à la 100e, il le fait au moins une fois dans 7 mondes sur 120 (5,8 %).

J'ai ajouté une section « Relecture » à notes/tau.md, avec le conseil pour l'intégrateur. La note mentionne aussi, sans le corriger, le cas de la réserve de graines épuisée (M6 de la synthèse) : une course de première moitié peut alors disparaître. Rien ne se pose avant la génération 80 environ.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\mesure-tau.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\mesure-tau.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\tau.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-tau\contre-verifier.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-tau\regards-repetes.js

### Tests

- Nom : mesure-tau.test.js (relance de l'auteur, avant correction)  
  Réussi : non  
  Détail : 71/72 : « tous les états d'essai rendent trop tôt » échouait sur essais/tests-generation/a6-longues et a6-origine (hasard mesuré 0,00, 4 enfants requis, verdict « comptent » sur 7 enfants).
- Nom : mesure-tau.test.js (après correction)  
  Réussi : oui  
  Détail : 75/75, environ 8 s, dont 3 tests ajoutés par le relecteur.
- Nom : contre-vérification indépendante (essais/relecture-tau/contre-verifier.js)  
  Réussi : oui  
  Détail : Monde hérité, bruit dissymétrique, 40 mondes par cas. τ² de l'outil : 0,014 / 0,661 / 2,182 pour 0 / 0,651 / 2,188 vrais. Fausses victoires à τ = 0 : 6 sur 200.
- Nom : regards répétés (essais/relecture-tau/regards-repetes.js)  
  Réussi : oui  
  Détail : Mesure, pas un test : à τ = 0, « comptent » 2 fois sur 120 au premier regard, au moins une fois dans 7 mondes sur 120 jusqu'à la génération 100.
- Nom : état réel du 27/11  
  Réussi : oui  
  Détail : Mêmes chiffres que l'auteur : 19 enfants mesurés sur 191, r −0,13, τ 0,00 [0 ; 0,94], 62 courses pour rien sur 528 (5,1 % du temps).
- Nom : 16 suites rapides  
  Réussi : oui  
  Détail : commun 16/16, graines 13/13, note 16/16, genome 14/14, tableau 69/69, lanceurs 76/76, generation 16/16, robustesse 8/8, machine 45/45, machine-relecture 19/19, traces 87/87, relecture-traces 95/95, gestes 10/10, integration 29/29, portage 11/11, node-epoque 14/14 : toutes à code 0.
- Nom : tests lents  
  Réussi : oui  
  Détail : Non lancés : aucune course n'est concernée par ce lot.

### Problèmes

- Regards répétés : le verdict est recalculé à chaque génération. À τ = 0, environ 6 % de fausses victoires sur la durée (au premier regard : 1,7 %). Conseil à l'intégrateur : dans histoire.js, retenir le PREMIER verdict sorti de « trop tôt ». Figer le verdict dans l'outil serait un changement de méthode, donc une décision à prendre.
- Le test « tous les états d'essai rendent trop tôt » dépend des états que les autres tests laissent dans essais/. Il pourra échouer à tort le jour où un état fabriqué dépassera 191 enfants.
- Le nombre requis ne descend plus sous celui qui correspond à un hasard de 3,26. Si une future époque est vraiment moins hasardeuse, la mesure attendra un peu plus longtemps que nécessaire : c'est le choix prudent.
- Un enfant renvoyé à sa naissance (protectionGenerations 0) est signalé, mais le biais vers le bas de τ n'est pas corrigé.
- Si la réserve de graines s'épuise (M6 de la synthèse), une course de première moitié peut disparaître : une seule course est gardée par (époque, pilote, graine).
- Les constantes de méthode restent dans le code, pas dans config.json : SIGMA_ETUDE 3,26, TAU_VISE 0,5, MIN_PAR_MOITIE 2, MIN_GROUPE 10.
- Aucun vrai état du Ryzen n'a été lu, comme pour l'auteur.
- Le branchement dans tableau.js, histoire.js et etat.js reste à faire par l'intégrateur.

## 6. relire:regles

*Rôle : relecteur du lot « règles » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

Review of the "regles" batch. I tried to refute it, and the substance holds. I rechecked three key proofs with my own scripts (in ml/evolution/essais/relecture-regles/, outside git, no courses played).

(1) M6 seed reserve. I compared against the graines.js from 7b1df608e:
- The first 90 generations at 12 seeds are bit-identical to the old code.
- Generation 91 keeps its first seed, then takes new seeds (1003203…) where the old code replayed (913256…).
- 3,000 generations mixed with validations of 24 to 96 seeds, with the state written and reread as JSON each time: 32,000 seeds, 0 duplicates, 0 out of range, 0 on the validation range, 0 crossings with the 10,296 validation seeds.
- At the end of a short suite, there are exactly 1,081 + 2,501 distinct seeds, then GRAINES_EPUISEES.

(2) A6. On the 48 real courses in essais/regles/vrai, the note without sorting changes in 10 out of 10 shuffles (se_F off by up to 1.06). With ordreLignes it changes in 0 out of 10. The sort the author added was needed, and it is enough.

(3) C2. I reread in modele.js where each of the 30 guarded reals is read: the GARDES table is correct. But the "0% after" in mesure-muettes and in m5 is measured with the table itself, so it is true by construction. The real proof is m2/m3 on the views plus this reading of the code. I say so in the note.

Also verified:
- genome.js does enter the identity fingerprint (OCTETS_GENOME) and is not in FICHIERS_EPOQUE, so the corrected § 9.3 is right.
- pop.graines.blocs survives population.json: no normalisation anywhere.
- The old v2 state does have v.ne.
- Seeds up to 999999984 go through graine|0 without overflow.

Corrected in place (marked "28/11, le relecteur du lot « regles »"):
- tableau.js:256 said "protected until 24 courses". It now states the age rule from cfg.protectionGenerations; I checked the rendered text.
- INTERFACES.md: § 2.5 (grainesEntrainement: the blocks of the suite and GRAINES_EPUISEES), the table row protectionCourses -> protectionGenerations, § 6.1 step 6 (dismissal by age), § 6.2 (tournament by age, and muter's draw pool reelsLus).
- A "Relecture" section added to notes/regles.md.

New point found: mulberry32 runs every seed through one single cycle, adding 0x6D2B79F5 per draw. So two seeds whose gap is k·0x6D2B79F5 play the same stream of numbers shifted by k draws.
- In the old range, the smallest such shift between two training seeds was 2.3 million draws.
- In the new range, among the seeds actually reached: 14,173 draws after 1,000 generations, 265 after 100,000.
- Training against validation: 2,284 draws around 10,000 generations.
- This does not mean the same course (the game uses its numbers according to its state). I did not measure it with courses; it is listed in the note as a remaining risk.

Tests: all 16 fast tests, genes-muets and validation-sequentielle pass. On the first run, traces, relecture-traces, integration and portage failed on shared folders while other reviewers were running the same tests (EPERM on %TEMP%\cashcar-traces-test, "archives manque dans l'archive"). Rerun alone, they pass. Nothing committed, nothing pushed, and modele.js, enfant.js, config "reseaux" and the coffre were not touched.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\regles.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-regles\verif-graines.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-regles\verif-ordre-note.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-regles\verif-mulberry.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\relecture-regles\maj-interfaces.js

### Tests

- Nom : commun  
  Réussi : oui  
  Détail : 16/16
- Nom : graines  
  Réussi : oui  
  Détail : 13 passes
- Nom : note  
  Réussi : oui  
  Détail : 16 passes
- Nom : genome  
  Réussi : oui  
  Détail : 14 passes
- Nom : tableau  
  Réussi : oui  
  Détail : 69/69, rerun after my edit to line 256
- Nom : lanceurs  
  Réussi : oui  
  Détail : 76/76
- Nom : generation  
  Réussi : oui  
  Détail : 16/16
- Nom : robustesse  
  Réussi : oui  
  Détail : 8/8
- Nom : machine  
  Réussi : oui  
  Détail : 45/45
- Nom : machine-relecture  
  Réussi : oui  
  Détail : 19/19
- Nom : traces  
  Réussi : oui  
  Détail : 87/87 when run alone; failed the first time on EPERM in the shared %TEMP%\cashcar-traces-test folder while other reviewers were running it
- Nom : relecture-traces  
  Réussi : oui  
  Détail : 95/95 when run alone (same EPERM the first time)
- Nom : gestes  
  Réussi : oui  
  Détail : 10 passes
- Nom : integration  
  Réussi : oui  
  Détail : 29/29 when run alone (1 failure the first time on the installer preview check, run concurrently)
- Nom : portage  
  Réussi : oui  
  Détail : 11/11 when run alone (p6 'archives manque dans l'archive' the first time, shared folder)
- Nom : node-epoque  
  Réussi : oui  
  Détail : 14/14
- Nom : genes-muets  
  Réussi : oui  
  Détail : 6/6 in 141 s
- Nom : validation-sequentielle  
  Réussi : oui  
  Détail : 25/25
- Nom : independent check: M6 seed reserve (verif-graines.js)  
  Réussi : oui  
  Détail : 90 generations identical to the old graines.js; 3,000 generations plus validations of 24 to 96 seeds: 0 duplicates, 0 out of range, 0 on validation; at the end, exactly 1,081+2,501 seeds, then GRAINES_EPUISEES
- Nom : independent check: A6 note order (verif-ordre-note.js)  
  Réussi : oui  
  Détail : 48 real courses: without sorting, 10/10 shuffles change the note (se_F up to 1.06); with ordreLignes, 0/10
- Nom : independent check: mulberry32 streams (verif-mulberry.js)  
  Réussi : non  
  Détail : Not a code failure but a risk: in the new range, two seeds can play the same stream shifted by a few thousand draws (14,173 at G=1000; training vs validation 2,284 at G=10000), against 2.3 million in the old range; course similarity not measured

### Problèmes

- mulberry32 runs every seed through one single cycle: two seeds whose gap is k·0x6D2B79F5 (mod 2^32) play the same stream of Math.random shifted by k draws. Old range: smallest such shift between training seeds 2.3 million draws. New range, among the seeds reached: 14,173 at G=1000, 265 at G=100,000; training against validation: 2,284 draws around G=10,000. Not measured with courses (probably not the same course, since the game uses its numbers according to its state). To rule it out completely: a different step, or a hash of the seed in enfant.js, which would be a new epoch and Sacha's decision.
- The '0% silent mutations after' (mesure-muettes.js, m5) is computed with the GARDES table itself, so it is true by construction. The real proof is m2/m3 on finite views plus my reading of modele.js (all 30 reals checked).
- INTERFACES.md is still missing ordreCourses, graines.entrainement.suite and graines.auBout in the § 3.1 table, and graines.blocs in § 3.4: left to the integrator. Line 401 (§ 9.1, protectionCourses 6 of the essai) is history and was kept.
- A4: in the first generation of a new epoch, pilots with only nGraines courses in the epoch can now be dismissed (the old rule dismissed none). This follows from the age rule, but the synthesis does not mention it.
- evoluer.js naissances: the 'fewer than 20 generations' warning has 20 hard-coded (not in the config); no consequence.
- The fast tests share folders (%TEMP%\cashcar-traces-test, essais/portage…): run at the same time by several agents, traces, relecture-traces, integration and portage fail; alone they pass.
- Not rerun: evoluer.test.js, courses.test.js, identite.test.js, and the author's real 3-generation run.

## 7. integrer

*Rôle : intégrateur : branche la mesure, relance tous les tests (lents compris), reprend un état écrit par l'ancien code, écrit la note de livraison. Phase : Integrer.*

### Résumé

Les trois lots (« sacre », « règles », « tau ») sont intégrés et ils tiennent ensemble. Rien n'est commité ni poussé, et le jeu ne change pas. Je n'ai touché ni à modele.js, ni à enfant.js, ni à « reseaux », ni au coffre de l'étude.

1. **La mesure de τ est branchée dans les pages.**
- etat.js reçoit trois fonctions :
  - mesureTau : elle ne lève jamais et rend « trop tôt » par défaut. Elle ne lit rien au-delà de 100 Mo de courses-*.jsonl, parce que le tableau est refait dans le processus de la sélection.
  - tauLigne : la ligne ASCII de resume.txt, 118 colonnes au plus.
  - resumeComplet : les 10 lignes, une ligne vide, puis « Mutations comptent-elles ? … ».
- Les 10 lignes ne pouvaient pas accueillir une ligne de plus : la mesure va donc dans resume.txt, à part. `node etat.js` imprime toujours ses 10 lignes.
- tableau.html : une section « 1 bis. Les mutations comptent-elles ? » après le coffre. Elle donne le verdict, une barre « enfants mesurés / requis », r et τ avec leurs intervalles, et les courses jouées pour rien.
- histoire.md : un paragraphe « ## Les mutations comptent-elles ? » après « Où on en est ». Il dit que c'est le premier verdict sorti de « trop tôt » qui compte.
- Les trois sorties sont dans un try. tableau.ecrire fait la mesure une seule fois et la passe aux trois.
- sauver-traces.cmd n'a rien à changer : il refait déjà les quatre fichiers par tableau.js et les envoie.

2. **Compatibilité avec le Ryzen, prouvée en vraies courses.**
- J'ai fait tourner le code d'e93ff5cb5 dans un `git worktree` hors du dépôt, avec config-essai et 2 courses à la fois : deux générations (époque 29ae5fffc2b9, génome v:2), puis une validation forcée au format d'avant. Le worktree est retiré.
- J'ai repris cet état avec le code d'aujourd'hui (code 0) :
  - une nouvelle époque, à cause du portage (yeux.js, doigts.js, piloter.js, ressemblance.js, voltige.js, modele.js) ;
  - le contrôle d'identité IDENTIQUE trois fois ;
  - les génomes passent de v:2 à v:3 en gardant leurs identifiants ;
  - les graines continuent sans en rejouer une, et « blocs » absent devient 0 ;
  - les renvois se font par l'âge ;
  - une validation séquentielle reprend les graines de validation là où l'ancien code s'était arrêté (validationK 3 → 6) ;
  - les pages sont justes.
- Cet état est gardé dans tests/etat-e93ff5cb5. generation.test (« compatibilité ») et validation-sequentielle (V8) le relisent maintenant à chaque passage.

3. **Tests.**
- Les 16 suites rapides, plus mesure-tau, validation-sequentielle et genes-muets, passent toutes.
- tableau.test est passé de 69 à 72 contrôles. J'y ai ajouté la ligne de τ, la section 1 bis, le paragraphe du récit, et le cas d'une mesure qui lève.
- J'ai corrigé validation-sequentielle V8 : il échouait dès qu'evoluer.test avait écrit une validation séquentielle dans essais/tests-evoluer. Il ne juge plus que les lignes d'avant.
- evoluer.test.js --travailleurs 2 : TOUT PASSE (78 contrôles, 3 602 s).
- identite.test.js --travailleurs 2 : 9/9.
- Essai de 4 générations dans essais/reglage/etat, avec un STOP posé au milieu de la validation de la génération 0 :
  - la reprise a donné 15 courses du cache et 5 jouées, la même première graine, « arrêté au 1er regard » ;
  - au total, 74 lignes de courses pour 74 clés : aucune course rejouée ;
  - aucun nouveau-né n'a été renvoyé à sa naissance.
- J'ai lu histoire.md, tableau.html et resume.txt de cet essai : ils sont justes et lisibles par quelqu'un qui ne code pas. Trois petites maladresses datent d'avant ce lot et sont listées dans les problèmes.

4. **Documentation.**
- INTERFACES.md : un nouveau § 11 (11.1 à 11.8) avec les formats et des exemples réels. J'ai corrigé les § 2.6, 2.8, 2.9, 2.10, 3.1, 3.4, 3.6, 6.1, 6.4 et 9.3, dont la phrase fausse « population.json n'est pas réécrite en fin de génération ». C7 était déjà corrigé au § 9.3, le § 11.6 le redit.
- README.md : une section « Le réglage de la sélection » en mots simples, la 11e ligne de resume.txt, la section 1 bis, et une ligne « graines épuisées » dans « Si ça s'arrête ».

5. **notes/LIVRAISON-REGLAGE.md** : l'état exact (ce qui est prêt, vérifié, non vérifié), ce que fera la mise à jour sur le Ryzen, et les gestes dans l'ordre.
- Sur le Ryzen : une nouvelle époque à cause du portage. Toutes les courses sont rejouées, les pilotes restent, l'identité est refaite.
- Les gestes sont ceux de LIVRAISON-C0101. Ce qui change : vérifier `regle6` dans population.json, vérifier la 11e ligne de resume.txt, et aucune raison de repartir de c0101 (le coffre complet de 00fb4cfad ne montre pas de gain).

Choix prudents pris sans demander :
- La section du tableau s'appelle « 1 bis », pour ne pas renuméroter les 7 sections que les tests vérifient.
- Le premier verdict de τ n'est écrit nulle part : je n'ai pas touché aux lignes de generations.jsonl.
- Plafond de 100 Mo pour la mesure dans les pages.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\etat.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\README.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\LIVRAISON-REGLAGE.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\integrateur-reglage.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\tableau.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\generation.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\validation-sequentielle.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-e93ff5cb5\population.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-e93ff5cb5\generations.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-e93ff5cb5\validations.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-e93ff5cb5\morts.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-e93ff5cb5\coffre.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\etat-e93ff5cb5\courses-2026-48.jsonl
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\reglage\etat\histoire.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\reglage\etat\tableau.html
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\reglage\etat\resume.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\reglage\marche.log
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\integrateur\ryzen\ancien.log
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\integrateur\ryzen\nouveau.log
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\integrateur\evoluer-test.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\integrateur\identite-test.txt

### Tests

- Nom : commun  
  Réussi : oui  
  Détail : 16/16
- Nom : graines  
  Réussi : oui  
  Détail : 13/13
- Nom : note  
  Réussi : oui  
  Détail : 16/16
- Nom : genome  
  Réussi : oui  
  Détail : 14/14
- Nom : tableau  
  Réussi : oui  
  Détail : 72/72 (69 avant ; ajoutés : la ligne de tau de resume.txt, la section 1 bis, le paragraphe du récit, une mesure qui lève sans rien casser)
- Nom : lanceurs  
  Réussi : oui  
  Détail : 76/76
- Nom : generation  
  Réussi : oui  
  Détail : 16/16, la compatibilité est passée aussi sur tests/etat-e93ff5cb5
- Nom : robustesse  
  Réussi : oui  
  Détail : 8/8
- Nom : machine  
  Réussi : oui  
  Détail : 45/45
- Nom : machine-relecture  
  Réussi : oui  
  Détail : 19/19
- Nom : traces  
  Réussi : oui  
  Détail : 87/87
- Nom : relecture-traces  
  Réussi : oui  
  Détail : 95/95
- Nom : gestes  
  Réussi : oui  
  Détail : 10/10
- Nom : integration  
  Réussi : oui  
  Détail : 29/29
- Nom : portage  
  Réussi : oui  
  Détail : 11/11
- Nom : node-epoque  
  Réussi : oui  
  Détail : 14/14
- Nom : mesure-tau  
  Réussi : oui  
  Détail : 75/75
- Nom : validation-sequentielle  
  Réussi : oui  
  Détail : 25/25 après correction. V8 échouait à la relance finale : il prenait pour une ligne d'avant la validation séquentielle qu'evoluer.test venait d'écrire dans essais/tests-evoluer. Il ne juge plus que les lignes sans regards, et relit aussi les deux états d'avant gardés dans git.
- Nom : genes-muets  
  Réussi : oui  
  Détail : 6/6
- Nom : evoluer.test.js --travailleurs 2 (tout)  
  Réussi : oui  
  Détail : TOUT PASSE, 78 contrôles, 3 602 s ; l'étape f fait une vraie validation séquentielle (arrêtée au 2e regard, sur 6 graines)
- Nom : identite.test.js --travailleurs 2  
  Réussi : oui  
  Détail : 9/9, 465 s (c0025 et c0101)
- Nom : courses.test.js  
  Réussi : non  
  Détail : NON LANCÉ : il joue 4 puis 3 courses à la fois, au-dessus des 2 permises pendant que la mesure banc-des-genes jouait 4 courses. Ce lot ne touche ni courses.js ni enfant.js.
- Nom : état écrit par e93ff5cb5 (git worktree hors du dépôt), repris par le code d'aujourd'hui  
  Réussi : oui  
  Détail : Ancien code : 2 générations et une validation d'avant. Nouveau code : nouvelle époque, identité IDENTIQUE ×3, génomes v:2 → v:3 avec les mêmes identifiants, graines continuées sans rejeu, renvois par l'âge, validation séquentielle (validationK 3 → 6), pages justes, code 0. Worktree retiré.
- Nom : essai neuf de 4 générations, STOP au milieu d'une validation puis reprise  
  Réussi : oui  
  Détail : STOP après 3 des 6 courses de validation. Reprise : 15 courses du cache et 5 jouées, même première graine, « arrêté au 1er regard ». Puis les générations 1 à 3, code 0. 74 lignes de courses pour 74 clés. Pages relues : justes et lisibles.

### Problèmes

- tests/courses.test.js n'a pas été lancé : il joue 4 courses à la fois, plus que les 2 permises pendant la mesure en cours sur ce PC.
- Le premier verdict de τ sorti de « trop tôt » n'est écrit nulle part : les pages disent le verdict du jour et rappellent que le premier compte. Il faudrait une clé tau dans generations.jsonl, écrite par evoluer.js. Je ne l'ai pas fait, parce que c'est une décision de méthode et que les tests de reprise comparent ces lignes.
- Au-delà de 100 Mo de courses-*.jsonl (quelques mois sur le Ryzen), les pages ne mesurent plus τ et disent de lancer node ml/evolution/mesure-tau.js à part. La mesure aura répondu bien avant : 191 enfants font environ 11 Mo.
- Rien n'a tourné sur le Ryzen. Son vrai état n'a pas été lu : la compatibilité est prouvée sur un état écrit par e93ff5cb5 ici, à 3 graines et sur 2 générations. Sa valeur de regle6 est à regarder sur place : si elle vaut 3, couper l'alarme ne la fait pas redescendre.
- Trois maladresses d'avant ce lot, vues dans le récit de l'essai et laissées : après une reprise, la génération 0 est datée de la reprise ; « fondait de 7,42 point » au singulier ; « le témoin (pilote-voltige (c0025)) » avec des parenthèses doublées.
- Toujours pas vérifiés : l'effet de la validation séquentielle sur le progrès du champion (C8), la forme des paliers d'un meilleur pilote (M5), le gain de A6, l'effet de C2 sur la sélection, et le risque mulberry32 des graines de la suite (aucune course jouée).
- D1 n'est pas tranchée (seuilB et seuilC restent à 1) : c'est la décision de Sacha.
- L'alarmeDistance indépendante du nombre de gènes n'est pas branchée (elle reste à 0,011).
- J'ai ajouté tests/etat-e93ff5cb5 (environ 75 Ko, dont 37 Ko de courses) comme état de test gardé dans git. Je l'ai relu : il ne contient ni chemin, ni nom de PC, ni adresse.
