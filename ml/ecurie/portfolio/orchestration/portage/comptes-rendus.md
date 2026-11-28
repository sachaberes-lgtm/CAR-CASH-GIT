# Les idées de la boucle payante deviennent des gènes, le Node fixe, la mesure du coffre : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `c0101-dans-la-selection` (wf_a57ffbdc-230), lancée par la session principale (Claude Fable).
- Agents : 9, tous du modèle claude-opus-5-5.
- Durée : 1 h 26 ; jetons consommés par les agents : 1 819 083 (1,82 millions) ; appels d'outils : 542.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. constructeur du lot « mesure » : joue quatre champions sur les 40 graines du coffre et compare chacun au pilote de départ (phase « Faire »)
2. constructeur du lot « lignée » : raconte la boucle payante du Ryzen génération par génération, avec sa courbe (phase « Faire »)
3. constructeur du lot « portage » : le génome apprend à écrire c0101 comme il écrit c0025 (génome v:3) (phase « Faire »)
4. constructeur du lot « lanceurs » : un Node fixe par PC et des tâches planifiées sans limite de 72 heures (phase « Faire »)
5. relecteur du lot « mesure » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
6. relecteur du lot « lignée » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
7. relecteur du lot « lanceurs » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
8. relecteur du lot « portage » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve (phase « Relire »)
9. intégrateur : vérifie que les lots tiennent ensemble, relance tous les tests, écrit la note de livraison (phase « Integrer »)

## 1. faire:mesure

*Rôle : constructeur du lot « mesure » : joue quatre champions sur les 40 graines du coffre et compare chacun au pilote de départ. Phase : Faire.*

### Résumé

MESURE INCOMPLETE. Le harnais a demande la reponse finale avant la fin des courses, donc la course de fond s'arrete avec elle. Seules 4 graines du coffre sur 40 ont ete jouees par les quatre pilotes (20 courses sur 164), et sur 4 graines on ne peut rien conclure. Sacha (ou l'agent suivant) relance `node ml/ecurie/etude/boucle-payante-ryzen/coffre/jouer.js --travailleurs 4` : les courses deja faites viennent du cache. Il reste environ 25 minutes de courses, puis on lance `analyser.js`. Faits deja etablis : (1) le Xeon rejoue au bit pres les courses du Ryzen (4 controles c0025/c0101 sur 950000 et 950037, memes empreintes que validations.jsonl). (2) L'observation de Fable est confirmee et va plus loin : c0064 et c0101 jouent EXACTEMENT les memes 20 courses de validation (memes empreintes, 20 sur 20). Ils jouent aussi les memes courses sur les 4 premieres graines du coffre. Leurs differences (nitro tenue plus longtemps et figures « marge large », seulement sur nuages et espace) ne changent presque jamais une course. (3) Sur la validation de la boucle (20 graines 950000, optimiste parce qu'elle a servi a chaque sacre), c0064 et c0101 font +2,0 paliers par rapport a c0025, IC 95 % [+0,8 ; +3,4], 10 graines mieux, 8 pareil, 2 moins bien, test du signe p = 0,039. La survie gagne +38 s [+14 ; +66]. Pour c0026 contre c0025 : +0,9 [-0,1 ; +2,1], ce n'est pas net. Pour c0064 contre c0026 : +1,1 [-0,3 ; +2,5], ce n'est pas net non plus. Verdict provisoire, a confirmer sur le coffre : le temoin de la selection devrait etre c0064. Il fait au moins aussi bien que c0101, qui ne s'en distingue sur aucune course mesuree, et il est plus simple (moins de code inactif). Le gain sur c0025 (environ +2 paliers sur la validation) reste a confirmer sur les 40 graines jamais vues, et l'incertitude est encore large (environ ±1,3 palier). Je n'ai verifie ni E ni F sur le coffre : il faut au moins 5 parties par pilote, sinon E vaut 4 par convention.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\jouer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\analyser.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\jouer.log
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\etat\
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\sorties\resultats.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\sorties\resume.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\sorties\courses-coffre.jsonl

### Tests

- Nom : reproductibilite Xeon / Ryzen  
  Réussi : oui  
  Détail : c0025 et c0101 sur 950000 et 950037 : 4 empreintes sur 4 identiques a validations.jsonl
- Nom : c0064 et c0101 identiques sur la validation de la boucle  
  Réussi : oui  
  Détail : 20/20 empreintes identiques, pas seulement les paliers
- Nom : c0064 et c0101 identiques sur le debut du coffre  
  Réussi : oui  
  Détail : 4/4 graines jouees, memes empreintes (partiel)
- Nom : courses du coffre completes (164)  
  Réussi : non  
  Détail : 20/164 avant l'arret impose ; aucune course non mesuree ; reprise par le cache
- Nom : E et F de la selection sur le coffre  
  Réussi : non  
  Détail : non significatif : 4 parties par pilote < partiesMin 5, E = 4 par convention
- Nom : analyser.js tourne sur des donnees partielles  
  Réussi : oui  
  Détail : sorties/resultats.json et resume.txt ecrits

### Problèmes

- Mesure du coffre interrompue a 4/40 graines : la question principale (c0064/c0101 contre c0025 sur des graines jamais vues) reste sans reponse ; il faut relancer jouer.js puis analyser.js (environ 25 min a 4 courses a la fois).
- La validation de la boucle (950000) a servi a sacrer chaque champion : ses +2,0 paliers sont optimistes (malediction du gagnant).
- Note pour l'integrateur non ecrite dans ml/evolution/notes/ : c'est une etude, son LISEZ-MOI.md tient lieu de note (il est court et dit que la mesure est incomplete).
- Le dossier etat/ contient aussi une copie des pilotes (etat/pilotes/) ecrite par l'ordonnanceur ; rien n'est commite.

## 2. faire:lignee

*Rôle : constructeur du lot « lignée » : raconte la boucle payante du Ryzen génération par génération, avec sa courbe. Phase : Faire.*

### Résumé

Étude « lignée » terminée dans ml/ecurie/etude/boucle-payante-ryzen/. Rien n'a été commité, aucune course jouée, rien de payé, le jeu ne change pas.

Ce que disent les journaux :
(1) L'étape C2 compte 15 générations, dont la 15e est interrompue. Le modèle a écrit 88 variantes : 1 perdue (coupure réseau, 0 €), 87 triées, 25 notées sur 20 graines, 7 validées, 5 sacrées et 2 refusées (c0098, c0103). Le coût est recontrôlé : 21,61 € sur 88 lignes, avec un seul modèle (claude-sonnet-5-5), et la somme génération par génération retombe sur ce total. Le journal entier fait 58,53 €. Le témoin c0025 est bien identique à pilote-voltige.js (fins de ligne ignorées).
(2) L'observation de Fable est confirmée, et elle est plus forte qu'annoncé. c0064, c0072, c0087 et c0101 ont les 20 mêmes empreintes de course en validation, donc des courses identiques image par image. L'empreinte hache, à chaque image, la position, la vitesse, la nitro et l'argent (ml/bot/piloter.js). Pourtant 13 de ces 20 courses passent par les cartes sans décor, les seules où leur code agit.
(3) La règle du sacre, dans boucle.js (lignes 92-94 et 289-303) : une variante doit battre strictement son parent à l'entraînement, puis faire au moins aussi bien que lui en validation (auMoins = !mieux). À égalité, on sacre donc.
(4) À l'entraînement, chaque sacre tardif ne change que 1 ou 2 courses sur 20 :
- c0072 : 910444, palier 14→19 ;
- c0087 : 910444, 19→6, et 910629, 6→8. Sa note monte uniquement par l'écart aux joueurs, alors que son palier moyen baisse ;
- c0101 : 910703, 8→9.
De c0064 à c0101, le palier médian reste à 8 et le palier moyen baisse (7,75→7,50).
(5) Palier comparé course par course sur les mêmes graines, c0101 contre le témoin c0025 : −0,25 ±1,02 à l'entraînement, +2,00 ±0,68 en validation (biaisé, car ces graines ont servi à trier), et +0,88 ±0,63 sur les 40 courses. Ce n'est pas décisif. Le seul grand saut en validation est c0026→c0064 (note −6,06→−2,35). Il est lui-même fragile : c0025 était malchanceux sur les graines de validation (4,80 contre 7,75 à l'entraînement), ce qui donne un effet de retour à la moyenne. Le coffre (graines 990000 et suivantes) tranchera.

Ce que j'ai écrit :
- la lignée, avec un tableau technique de portage (fonction, constante, valeur avant/après, gène correspondant de genome.js) ;
- les diffs de chaque sacre ;
- l'image en version claire et sombre. Je l'ai rendue dans Chrome sans écran, regardée, et j'ai corrigé un marqueur caché par une étiquette. Ses couleurs passent le contrôle de daltonisme et de contraste ;
- trois leçons pour la sélection naturelle.

Incident réparé : une commande PowerShell ratée de ma part avait créé un fichier vide extraire.js à la racine du dépôt ; je l'ai supprimé.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\NOTE-INTEGRATEUR.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\outils\extraire.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\outils\figure.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\donnees\lignee.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\donnees\tableaux.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\diffs\c0025-c0026.diff
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\diffs\c0026-c0064.diff
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\diffs\c0064-c0072.diff
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\diffs\c0072-c0087.diff
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\diffs\c0087-c0101.diff
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\boucle-payante-lignee-clair.svg
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\images\boucle-payante-lignee-sombre.svg

### Tests

- Nom : sacres du journal = c0026, c0064, c0072, c0087, c0101  
  Réussi : oui  
  Détail : validations.jsonl, role candidat, tient=true
- Nom : depenses C2 = 21,61 EUR  
  Réussi : oui  
  Détail : 88 lignes, somme exacte ; somme par generation identique ; journal entier 58,53 EUR
- Nom : c0025 = pilote-voltige.js  
  Réussi : oui  
  Détail : sha1 identique apres retrait des CR
- Nom : c0072, c0087, c0101 : 0 course changee sur 20 en validation  
  Réussi : oui  
  Détail : empreintes identiques a celles du parent, graine par graine
- Nom : chiffres de Fable (c0064/c0101 -2,35 ecart 1,392 ; paliers moyens c0025 4,80, c0026 5,70)  
  Réussi : oui  
  Détail : controle automatique dans extraire.js
- Nom : figure sans chevauchement de textes  
  Réussi : oui  
  Détail : controle des boites dans figure.js, theme clair et sombre
- Nom : rendu regarde dans Chrome sans ecran (--headless=new --mute-audio)  
  Réussi : oui  
  Détail : un marqueur c0103 cache par le fond d'une etiquette, corrige puis re-rendu
- Nom : palette validee (daltonisme, contraste)  
  Réussi : oui  
  Détail : validate_palette : clair #2f6db5/#9a6a00 ; sombre #5592e6/#b98a28 (les couleurs du depot etaient trop claires pour la bande sombre)
- Nom : rien de prive dans les fichiers ecrits  
  Réussi : oui  
  Détail : aucune cle, aucun e-mail, aucun nom de PC ; les '@' trouves sont des en-tetes de diff

### Problèmes

- Non vérifié : pourquoi les règles de c0072, c0087 et c0101 ne changent aucune image en validation alors que 13 des 20 courses passent par les cartes sans décor (condition rare ou condition impossible). Pas de course rejouée. Si la condition est impossible, les gènes largeOn et libreOn sont inertes.
- Les noms de gènes du tableau de portage viennent de ml/evolution/genome.js, modifié mais pas encore commité dans l'arbre de travail par un autre travail : à recouper.
- La comparaison au bruit cite une autre étude faite dans d'autres conditions (12 courses de 300 s) : c'est un ordre de grandeur. Le « t » du palier apparié est approximatif.
- Les euros sont les estimations de la boucle (jetons, 1 € compté pour 1 $), pas la facture.
- Les heures sont l'heure UTC du journal plus 1 h. Le journal n'explique pas la pause de 19 h 23 à 21 h 34.
- Ma propre erreur : une commande PowerShell ratée a créé un fichier vide extraire.js à la racine du dépôt (00:42). Je l'ai supprimé.
- Je n'ai pas ajouté l'image à ml/ecurie/portfolio/index.html.

## 3. faire:portage

*Rôle : constructeur du lot « portage » : le génome apprend à écrire c0101 comme il écrit c0025 (génome v:3). Phase : Faire.*

### Résumé

The genome can now write c0101 the same way it writes c0025, to the bit. Genome v:3 has 121 genes: the 107 from v:2, then 14 portage genes at the end of BORNES. The c0025->c0101 differences split cleanly by sacre, with no structural rework, so no 'whole c0025 block / whole c0101 block' flag was needed:
- c0026: dessousMax .8->.4 and dessousPose 25->40, two genes that already existed, plus a new fuirVite flag;
- c0064: bordOn flag, with bordNitro and bordJauge;
- c0072: largeOn flag, with largeHaut, largeT1, largeT2, largeAxe, largeAir and largeMax (integer);
- c0087: libreOn flag, with nitroLibreK and tenirLibre;
- c0101: largeHaut 9->4, just a setting of a c0072 gene.

At birth the flags are 0 (c0025 to the bit) and the settings take c0101's value. They have no effect while their flag is off. modele.js carries the four blocks, each behind its flag. migrer turns v:1 and v:2 into v:3. A pilot born before the portage keeps its identifier and its driving (the c0025 témoin is still 19e3767cc346).

Choosing the témoin: config.json has "temoin": "c0025" by default (c0026, c0064, c0072, c0087 and c0101 are accepted). genomeTemoin reads REGLAGES from the témoin's file and reads the flags from its code (code extracts in BLOCS), cross-checked against its keys. identite.js, evoluer.js (identity fingerprint, identity check, the witness's file), the champion files, inscrire-champion.js, the summary, the dashboard, the tree and the history all follow the population's témoin.

An existing state keeps its témoin (population.json temoinNom, missing = c0025). If config.json asks for another one, it says so in one line and keeps the old one. The command 'node ml/evolution/evoluer.js --repartir-de c0101' does three things in order:
1. it runs the new témoin's identity check first (if it fails: refused, code 1, nothing moves);
2. it moves the whole state into etat/archives/<UTC date>-<old témoin>/ with an ARCHIVE.json, deleting nothing; what belongs to the PC stays in place (machine.json, the PC's Node, lock, sortie.log, STOP/PAUSE…);
3. a new population is born from c0101.

The five gestes are still there, off at birth, and work on c0101's code. The boucle payante did not rewrite any spot where a geste plugs in. Two neighbourhoods are documented: the relâché with bordOn, and the SOL head with libreOn.

Fable's observation re-checked: it is right, and even sharper. The 20 validation races of c0064, c0072, c0087 and c0101 have the same 20 race fingerprints. Replayed here, c0064 and c0101 give the journal's fingerprint on 950000. c0064 = c0101 to the bit on 6 other seeds. A traced c0064 race on two seeds gave 2,788 views; replayed through c0072, c0087 and c0101, they gave zero different decisions. So in real races c0101 drives like c0064. What the loop gained in validation comes from c0026 and c0064. As a result, the race-level identity of c0101 does not exercise the c0072/c0087 blocks; those are proven without races (552 identical decisions per témoin, on views built to trigger each block).

Integrator note: ml/evolution/notes/portage.md. INTERFACES.md has a new section 10. Nothing committed or pushed. Not touched: code/, VERSION PRINCIPALE/, ml/bot, ml/reel, ml/labo, pilote-voltige.js, the .cmd files, config-essai.json.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\genome.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\modele.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\identite.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\config.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\arbre.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\etat.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tableau.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\inscrire-champion.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\portage.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\portage.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\identite.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\genome.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\gestes.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\integration.test.js

### Tests

- Nom : identite.test.js (c0025 et c0101, 3 graines x 45 s, 2 a la fois, 21 courses)  
  Réussi : oui  
  Détail : 9/9 in 512 s. c0025 IDENTIQUE to pilote-voltige.js on 910000/910037/910074 (8d34b0578072, c4b906ba0a4f, 59db7c95e6f3). c0101 IDENTIQUE to c0101-pilote.js (8d34b0578072, 700c9e35dfbb, 302b83fef550): same race, view and key fingerprints. The two témoins play different races. (b) W2 rayon, W2 sol and retourOn, plus (e'), unchanged and passing.
- Nom : portage.test.js (nouveau, sans course)  
  Réussi : oui  
  Détail : 10/10 in about 20 s. Covers: the gene table; the six témoins; 552 identical decisions between the written pilot and the hand file for each of the six témoins (inventory views + 220 sequences built to trigger each block); each sacre changes at least one decision of the previous one; 200 v:2 mutants from the genome.js of commit 7f9543955 keep their id and decide as the old genome.js + old modele.js did; portage settings at their bounds with flags off change nothing; gestes on c0101; --repartir-de options; archiverEtat on a fabricated state (nothing deleted; machine.json and node.txt kept).
- Nom : genome.test.js  
  Réussi : oui  
  Détail : 14/14 (121 genes, 88 reals; the c0025 REGLAGES line now includes the portage genes)
- Nom : gestes.test.js  
  Réussi : oui  
  Détail : 10/10 (v:3; the v:1 migration also receives the portage genes at their birth value). (g2) '200 mutants of the previous genome.js (git HEAD)' is skipped internally because HEAD already has the gestes; the equivalent v:2->v:3 check is p4 of portage.test.js.
- Nom : integration.test.js  
  Réussi : oui  
  Détail : 29/29 after adapting the check 'parent mort v:1 migre' to the current version (Gn.VERSION instead of 2)
- Nom : commun, graines, note, tableau, lanceurs  
  Réussi : oui  
  Détail : exit code 0 for each
- Nom : generation, robustesse, machine, machine-relecture  
  Réussi : oui  
  Détail : 12/12, 8/8, 45/45, 19/19
- Nom : traces, relecture-traces  
  Réussi : oui  
  Détail : 87/87, 95/95 (MOTS covers the 14 new genes)
- Nom : bout en bout --repartir-de c0101 (config-essai, essais/portage/e2e, 2 a la fois)  
  Réussi : oui  
  Détail : Started from a fake c0025-born state: c0101 identity check (3 x IDENTIQUE), archive written, generation 0 born from c0101 (f70ddcb5a565), 14 races, code 0. Relaunched without the option and with temoin c0025: the state keeps c0101 and says so. Summary, dashboard and history name c0101.
- Nom : verification de l'observation de Fable  
  Réussi : oui  
  Détail : Run by hand. validations.jsonl: c0064/c0072/c0087/c0101 have the same 20 race fingerprints. c0064 = c0101 to the bit on 950000 (= journal fingerprint 7b2c8f9e25f2), 910037, 910074 (45 s), and 910000, 910222, 910259 (120 s). Traced c0064 races: 2,788 views replayed through c0072/c0087/c0101 give 0 different decisions.

### Problèmes

- In real races, c0101 = c0064: the c0072 and c0087 blocks and the c0101 setting never triggered in any race tried (9 races, 7 seeds, plus 2,788 replayed views). So c0101's race-level identity proves only the c0026 and c0064 blocks; the last three are proven only without races (portage.test.js p3). Worth knowing before choosing c0101 as the témoin.
- modele.js changed, so it is a new epoch: when this work is merged into evolution-ryzen, the running population keeps its ids and its driving (migration proven), but all its races are replayed and its identity check is redone.
- Reversible choice: the settings of a block that is off are born at c0101's value (largeHaut 4, not c0072's 9); switching on largeOn on a c0025 genome therefore brings c0072 and c0101 together.
- Not rerun: tests/evoluer.test.js, tests/courses.test.js, gestes.test.js --courses (slow). c0026, c0064, c0072 and c0087 written from their genome were only compared without races.
- alarmeDistance (0.012) was not adjusted: the distance now divides by 121 genes instead of 107 (-12%). It will need re-measuring for a population born from c0101.
- README.md was not touched (another agent was modifying it): it should mention "temoin" and --repartir-de. During my work other agents also changed .gitattributes, README.md, the .cmd files, lanceurs.test.js and machine-relecture.test.js; I appended my lines to .gitignore after theirs.
- The archive folder date is in UTC. archiverEtat keeps the lanceurs' node.txt* / NODE-REFUSE.txt / node-choix-* / CHANGER-DE-NODE files in place; if the lanceurs add other PC-specific files to etat/, add them to GARDES_ETAT (evoluer.js).
- Test files left in ml/evolution/essais/portage/ (gitignored, safe to delete).

## 4. faire:lanceurs

*Rôle : constructeur du lot « lanceurs » : un Node fixe par PC et des tâches planifiées sans limite de 72 heures. Phase : Faire.*

### Résumé

Les deux défauts trouvés sur le Ryzen sont corrigés et testés (74 / 74 dans tests/lanceurs.test.js). Je n'ai posé aucune vraie tâche et je n'ai rien commité. Deux choses restent à confirmer par un vrai essai chez Sacha : que schtasks accepte les fichiers XML, et que la tâche d'ouverture de session se pose sans droits d'administrateur.

1. Un Node fixe par PC. lancer.cmd prend son Node dans etat\node.txt. Si ce fichier n'existe pas, le nouveau node-fixe.js cherche le Node qui a la version de l'époque en cours (population.json, epoque.composants.node) et l'écrit dans node.txt. Il cherche dans l'ordre : le PATH, puis les dossiers habituels (Program Files, nvm-windows, fnm, Volta, Scoop, un dossier node-v* à côté du dépôt ou dans le profil). Si le Node n'a pas la bonne version, ou si node.txt pointe sur un fichier absent, rien n'est lancé (code 2). Le texte dit alors quelle version il attend, laquelle il a trouvée et comment corriger ; il va à l'écran, dans sortie.log et dans etat\NODE-REFUSE.txt. Pour changer de Node exprès, un fichier vide etat\CHANGER-DE-NODE l'autorise une seule fois. arreter.cmd et sauver-traces.cmd prennent aussi le Node de node.txt, mais ne refusent jamais sur la version, puisqu'ils ne jouent aucune course. J'ai choisi de ne pas committer node.txt, contrairement à machine.json : le chemin contient le nom du compte Windows et le dépôt est public. Il est ajouté au .gitignore.

2. Les tâches sans limite de 72 h. installer-tache.cmd écrit les trois tâches en XML et les pose avec « schtasks /create /tn NOM /xml FICHIER /f ». Elles n'ont aucune limite de durée (PT0S), tournent aussi sur batterie, rattrapent une heure manquée et ne tournent jamais deux fois à la fois. Elles passent par wscript et un nouveau petit lanceur, cache.vbs : plus de fenêtre noire toutes les heures, sans droits d'administrateur. Le « /f » remplace les tâches posées à la main sur le Ryzen, et le texte d'avant le O / N le dit ; si Sacha ne le relance jamais, rien ne casse, ses tâches appellent le nouveau lancer.cmd. Ce texte reste complet : les tâches, la mise en veille, ce qui part sur Internet, l'adresse, la branche, le dépôt public, plus le Node utilisé et sa version. « installer-tache.cmd essai DOSSIER » écrit les fichiers et les commandes dans DOSSIER sans rien poser. « enlever » est inchangé.

Pour Sacha, en clair : rien à faire. Au prochain lancer.cmd après la mise à jour, il trouve et retient le bon Node. S'il refuse de partir, il faut écrire le chemin complet du bon node.exe dans ml\evolution\etat\node.txt, sur une seule ligne. Relancer installer-tache.cmd une fois remplace proprement les tâches posées à la main.

Deux autres tests vérifiaient l'ancien comportement et je les ai ajustés au minimum : tests/integration.test.js (qui cherchait les anciennes lignes /sc onlogon et /sc hourly) et tests/machine-relecture.test.js (qui doit aussi recopier node-fixe.js).

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\node-fixe.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\cache.vbs
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\lancer.cmd
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\arreter.cmd
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\sauver-traces.cmd
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\installer-tache.cmd
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitignore
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\.gitattributes
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\lanceurs.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\integration.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\machine-relecture.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\lanceurs.md

### Tests

- Nom : tests/lanceurs.test.js  
  Réussi : oui  
  Détail : 74 / 74, aucune course, environ une minute. Couvre : CRLF et ASCII des quatre .cmd et de cache.vbs ; les 18 contrôles du 27/11 ; node-fixe.js seul avec un faux PATH et des versions simulées (ordre, version de l'époque, refus, node.txt absent / faux / d'une autre version / bon, CHANGER-DE-NODE, population.json abîmé, PATH vide) ; le contenu des XML (PT0S, IgnoreNew, batterie, wscript et cache.vbs, chemins avec espaces et parenthèses, relus par System.Xml) ; deux vrais faux node.exe compilés par Add-Type (A v24.22.1 devant B v99.0.1 : B est choisi et lance evoluer.js, refus code 2 dans chaque cas) ; installer-tache.cmd en essai et en pose (O, N, mauvais Node) avec schtasks, powercfg et choice remplacés par des pièges ; cache.vbs sous wscript (arguments et code 3). schtasks /query ne montre ensuite aucune tâche CashCar sur le Xeon.
- Nom : tests/machine-relecture.test.js  
  Réussi : oui  
  Détail : 19 / 19, après l'ajout de la copie de node-fixe.js à côté de lancer.cmd.
- Nom : tests/integration.test.js  
  Réussi : non  
  Détail : 28 / 29. Les contrôles d'installer-tache.cmd passent, aperçu compris (adresse sans jeton, branche, avertissement). Le seul raté, « arbre : le parent mort v:1 est lu migre (v:2, 107 genes) », vient des changements de genome.js en cours chez l'autre agent, pas des lanceurs.
- Nom : tests/traces.test.js  
  Réussi : non  
  Détail : 86 / 87 au premier passage. Tous les contrôles de sauver-traces.cmd passent (refus sur main et bots-ecurie, commit, envoi vers une origin locale, PAS-D-ENVOI, envoi raté, sortie.log tenu). Le raté, « chaque gene du genome a un mot simple », vient de nouveaux gènes de genome.js sans mot dans arbre.js. Au second passage, le test plante dès le début (EPERM) sur le dossier temporaire cashcar-traces-test, sans doute encore tenu par un processus du premier passage ; je ne l'ai pas forcé.

### Problèmes

- Je n'ai pas vérifié qu'un vrai « schtasks /create /xml » accepte ces fichiers : aucune tâche n'a été posée, c'est interdit sur ce PC. Le premier vrai essai sera le Ryzen.
- Je n'ai pas vérifié que la tâche d'ouverture de session (LogonTrigger) se pose sans droits d'administrateur. C'est le même doute qu'avant pour /sc onlogon, et le texte le dit toujours. La tâche horaire suffit à relancer.
- Une stratégie Windows peut couper wscript (Windows Script Host). Dans ce cas, les tâches échouent sans fenêtre et le Planificateur affiche le code d'erreur.
- La tâche des traces est elle aussi sans limite (PT0S), comme demandé. Avec IgnoreNew, un git push bloqué pour de bon empêcherait les envois suivants. Un PT1H pour cette seule tâche ne demanderait qu'une ligne dans tacheXml.
- Les tâches tournent en priorité 7 (sous la normale), le défaut de schtasks. Je ne connais pas la priorité des tâches posées à la main sur le Ryzen.
- evoluer.js ne contrôle toujours pas la version de Node : « node ml\evolution\evoluer.js » tapé à la main avec un autre Node change d'époque sans rien dire. La demande précise est dans la note : refus en code 2 sauf marqueur ou option --nouveau-node, avec l'ordre d'effacement du marqueur entre node-fixe.js et evoluer.js à régler.
- README.md n'est pas à jour, car il n'était pas dans mon lot : la phrase sur la petite fenêtre noire toutes les heures est devenue fausse, et il manque node.txt et le remplacement des tâches du Ryzen.
- node-fixe.js ne regarde que l'époque de l'etat\ par défaut : avec lancer.cmd --etat ou --config, un état d'essai à part n'est pas protégé. Un chemin avec des lettres accentuées peut être mal lu par cmd ; node-fixe.js prévient mais ne corrige pas.
- Je n'ai pas recontrôlé l'observation de Fable sur validations.jsonl (les mêmes 20 paliers pour les quatre derniers champions) : elle n'est pas dans ce lot.

## 5. relire:mesure

*Rôle : relecteur du lot « mesure » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

I tried to refute the "mesure" batch. The validation figures and the reproducibility hold. The provisional verdict does not hold.

What holds:
- I redid the validation statistics with my own script (no function from the author): c0064 - c0025 gives +2.00 [+0.75 ; +3.40], 10/8/2, p = 0.039. c0026 - c0025 gives +0.90, and c0064 - c0026 gives +1.10. Same values as the author's.
- Fable's observation is confirmed, and it goes further than the author said: c0064, c0072, c0087 and c0101 all play the same 20 validation races (20/20 fingerprints, all four).
- I took a second, independent path: I replayed 12 of the author's races through ml/bot/noter.js, without the ml/evolution scheduler, after modele.js had been changed. All 12 fingerprints are identical.
- The coffre seeds never appear in the loop's logs.

What is false:
- I played 6 more coffre seeds (990148 to 990333), 3 pilots, 2 races at a time. On the first 10 coffre seeds, c0064 does WORSE than c0025: -1.20 levels, 95 % CI [-3.20 ; +0.40], 2 better / 4 same / 4 worse. c0101 - c0025 gives -0.90 [-3.10 ; +0.80].
- c0101 is not a copy of c0064 on the coffre: their races differ on 2 seeds out of 10 (990148: 12 vs 13; 990333: 8 vs 4).
- So the +2 levels in validation do not show up on unseen seeds, which is the winner's curse the author himself flagged. The verdict "the selection's témoin should be c0064" is not supported. With the data available, the témoin stays c0025. 10 seeds settle nothing, though: the full coffre run is still needed.

Bug fixed:
- The race epoch includes ml/evolution/modele.js and enfant.js. The "portage" batch changed modele.js (uncommitted), so the epoch moved from fd590bd3db3d to 66f66d2ae1c2.
- As a result, analyser.js kept no races at all. It rewrote sorties/resultats.json and courses-coffre.jsonl EMPTY, then crashed.
- Fix: it now picks the epoch itself (today's if it has races, otherwise the one with the most), accepts --epoque, and writes nothing when no seed has been played by all four pilots. Rerun on the author's data: resume.txt and courses-coffre.jsonl are identical apart from the header line.
- jouer.js now says at launch that races from another epoch will be replayed. The author promised that a restart would pick them up from the cache: false in this case.

The LISEZ-MOI is corrected inline (dated, marked "le relecteur") and gets a "Relecture" section. Nothing is committed or pushed. No game file and no file under ml/bot, ml/labo or ml/evolution was touched.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\analyser.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\jouer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\verifier.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\noter-c0025-990000-4.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\noter-c0064-990000-4.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\noter-c0101-990000-4.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\noter-c0025-990148-6.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\noter-c0064-990148-6.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\relecture\noter-c0101-990148-6.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\sorties\resultats.json
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\sorties\resume.txt
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\coffre\sorties\courses-coffre.jsonl

### Tests

- Nom : chiffres de la validation refaits par un script independant  
  Réussi : oui  
  Détail : c0064-c0025 +2,00 [+0,75;+3,40] 10/8/2 p 0,039 ; c0026-c0025 +0,90 ; c0064-c0026 +1,10 : memes valeurs que l'auteur
- Nom : observation de Fable (validation)  
  Réussi : oui  
  Détail : c0064, c0072, c0087, c0101 : 20/20 empreintes identiques
- Nom : reproductibilite par un second chemin (ml/bot/noter.js)  
  Réussi : oui  
  Détail : 12/12 courses de l'auteur (c0025, c0064, c0101 sur 990000-990111) : memes empreintes, jouees apres la retouche de modele.js
- Nom : coffre jamais vu par la boucle  
  Réussi : oui  
  Détail : aucune graine 990000+37j dans cerveaux.jsonl (910000-910703) ni validations.jsonl (950000-950703)
- Nom : c0064 meilleur que c0025 sur des graines jamais vues  
  Réussi : non  
  Détail : 10 graines du coffre : -1,20 palier IC 95 % [-3,20 ; +0,40], 2/4/4 ; c0101 -0,90 [-3,10 ; +0,80]
- Nom : c0101 identique a c0064 hors de la validation  
  Réussi : non  
  Détail : 8/10 courses identiques sur le coffre ; 990148 (12 contre 13) et 990333 (8 contre 4) different
- Nom : analyser.js apres un changement d'epoque  
  Réussi : non  
  Détail : avant correction : 0 course gardee, sorties videes puis plantage ; corrige : choisit l'epoque fd590bd3db3d, sorties identiques a avant ; --epoque inexistante : code 1, rien n'est ecrit
- Nom : jouer.js et analyser.js se chargent sans erreur  
  Réussi : oui  
  Détail : node --check sur les deux ; jouer.js n'a pas ete relance en vrai (il aurait rejoue les 164 courses)

### Problèmes

- The coffre is still incomplete: 4/40 seeds for all 4 pilots, 10/40 for c0025, c0064 and c0101 counting my 6. jouer.js --travailleurs 4 then analyser.js have to be run again (25 to 45 minutes). The 20 races already done will be replayed because the epoch has changed.
- The author's verdict (témoin = c0064) should not be applied. On 10 coffre seeds, c0064 and c0101 do no better than c0025; if anything they do worse. Wait for the full coffre run.
- Making c0064 or c0101 the témoin would also require the genome to write it bit-exact (the 'portage' batch: genome.js and modele.js, uncommitted) and an identity check redone for that pilot. Not done.
- E and F of the selection were not checked by the reviewer: at least 5 races over 60 s per pilot are needed, and noter.js does not return the resemblance measurements.
- If the portage batch changes modele.js again while jouer.js is running, races may come out not measured ('played with other bot files'): run the coffre once the portage is committed.
- My 6 extra seeds (990148-990333) belong to the coffre: they were used to choose no one, and no one should select a pilot on them.
- Nothing is committed: the coffre/ folder is still untracked.

## 6. relire:lignee

*Rôle : relecteur du lot « lignée » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

J'ai relu le lot « lignée ». La lignée, l'argent, la règle du sacre, le tableau de portage et l'image tiennent. J'ai corrigé deux phrases fausses et une imprécision, et tranché un point qu'il avait laissé ouvert. Rien n'est commité, aucune course n'a été jouée et le jeu ne change pas.

**Recontrôles :**
- Mon propre script, dans le dossier temporaire, relit les journaux bruts de ml/labo/journal sans passer par extraire.js. Il retrouve tous les chiffres :
  - 88 inscriptions et 88 dépenses, pour 21,61 € en C2 et 58,53 € en tout ; le coût de chaque génération ;
  - 25 promues, dont 9 jumelles du parent ;
  - les sacres, et les empreintes de validation identiques pour c0064, c0072, c0087 et c0101 ;
  - toutes les notes du grand tableau et les courses changées graine par graine ;
  - le palier apparié de c0101 contre c0025 : −0,25 ±1,02, +2,00 ±0,68, +0,88 ±0,63 ;
  - tmax 900 s (600 s et 6 graines au tri), graines de 37 en 37, 7,30 et 1,78 millions de jetons, 0,20 à 0,42 € par variante.
- extraire.js rend toujours le même fichier au bit près, et figure.js les mêmes SVG.
- J'ai rendu les deux SVG dans Chrome sans écran et les ai regardés : ils sont lisibles.
- La règle du sacre, relue dans boucle.js (valeur, mieux, auMoins, barreDe, le bloc de validation), est juste : à égalité en validation, on sacre.
- Les cinq diffs correspondent au tableau de portage. Les gènes cités existent dans genome.js, et dessousMax et dessousPose existaient déjà dans la version commitée.
- Les citations du modèle et les chiffres des angles (63/17 %, 3,3 figures par minute, 78 %, 2 %) sont bien dans echanges/ et cerveaux.jsonl. Le « bruit ≈ 2 » est bien dans bruit/resultats.txt.

**Corrigé dans le LISEZ-MOI (marqué « le relecteur, 28/11 ») :**
1. « 13 courses de validation, 40 minutes de jeu en tout » était faux. 40 minutes, c'est la durée des 20 courses ; les 13 qui passent par les cartes sans décor durent 35 minutes, et pas entièrement sur ces cartes.
2. « c0101 a la meilleure note sur les 40 courses » était faux. La note mixte ne se calcule pas sur 40 courses réunies, et deux refusés, c0098 et c0103, avaient une meilleure note d'entraînement. c0101 a la meilleure note des cinq champions.
3. La « pause » de 19 h 23 à 21 h 34 contient aussi le travail de la génération 11, qui n'écrit ses lignes qu'à la fin. La vraie pause dure plutôt 1 h 10 à 1 h 50.

**Point ouvert tranché :** les règles de c0072, c0087 et c0101 ne sont pas impossibles. Chacune change au moins une course d'entraînement : 910444 pour c0072 (figures payées 21 → 39), 910444 et 910629 pour c0087, 910703 pour c0101. Les gènes largeOn et libreOn ne sont donc pas inertes, seulement rares (1 ou 2 courses sur 40).

J'ai ajouté une section « Relecture » au LISEZ-MOI et mis à jour la note de l'intégrateur. Ce qui reste ouvert est listé dans les problèmes.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\etude\boucle-payante-ryzen\NOTE-INTEGRATEUR.md

### Tests

- Nom : extraire.js relancé : tous les contrôles tiennent  
  Réussi : oui  
  Détail : 9 contrôles ok ; lignee.json identique d'un lancement à l'autre
- Nom : figure.js relancé : SVG identiques, rendu Chrome sans écran (clair et sombre) regardé  
  Réussi : oui  
  Détail : image lisible, pas de chevauchement visible
- Nom : recontrôle indépendant des chiffres depuis les journaux bruts  
  Réussi : oui  
  Détail : script du relecteur dans le dossier temporaire : dépenses, euros par génération, promues et jumelles, sacres, empreintes, notes, palier apparié, tmax, graines
- Nom : règle du sacre relue dans boucle.js  
  Réussi : oui  
  Détail : tient = auMoins(validation, barre) et bat le parent à l'entraînement ; égalité => sacre ; barre relue au journal
- Nom : diffs contre le tableau de portage, noms de gènes  
  Réussi : oui  
  Détail : 5 diffs conformes ; gènes présents dans genome.js
- Nom : « 13 courses, 40 minutes »  
  Réussi : non  
  Détail : faux : 35 min pour les 13, 40 min pour les 20. Corrigé
- Nom : « c0101 meilleure note sur 40 courses »  
  Réussi : non  
  Détail : faux : c0098 et c0103 ont une meilleure note d'entraînement. Corrigé
- Nom : règles c0072/c0087/c0101 possibles ou impossibles  
  Réussi : oui  
  Détail : chacune change au moins 1 course d'entraînement : ni largeOn ni libreOn n'est inerte
- Nom : rien de privé dans les fichiers écrits  
  Réussi : oui  
  Détail : aucune clé, aucun nom de PC ; seul « Sacha » apparaît, dans le titre demandé de la note

### Problèmes

- Le « t » du palier apparié pour c0072, c0087 et c0101 repose sur 1 ou 2 différences non nulles sur 20 : il n'a pas de sens. C'est signalé dans la Relecture, mais pas retiré du tableau.
- « c0025 malchanceux en validation » est une lecture, pas une mesure. Toutes les variantes font moins bien en validation qu'à l'entraînement, donc ces graines sont peut-être simplement plus dures. C'est signalé, pas tranché.
- Le coffre n'est pas fini : à 0 h 43, 4 graines sur 40 étaient jouées. Ni la lignée ni la relecture ne concluent sur un vrai progrès.
- Je n'ai pas cherché pourquoi les règles de c0072, c0087 et c0101 sont si rares (quelle condition bloque). Aucune course rejouée.
- Je n'ai pas refait le contrôle de daltonisme et de contraste de la palette.
- Le tableau de portage s'appuie sur genome.js, encore non commité : à recouper après son commit.
- Les euros sont les estimations de la boucle, pas la facture.
- L'image n'est pas ajoutée à ml/ecurie/portfolio/index.html.

## 7. relire:lanceurs

*Rôle : relecteur du lot « lanceurs » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

J'ai relu tout le lot « lanceurs ». Deux défauts réels sont corrigés en place, le README est mis à jour et une section « Relecture » est ajoutée à notes/lanceurs.md. Je n'ai rien commité, rien poussé et posé aucune tâche.

Preuve refaite par un autre chemin. Le premier doute de l'auteur était : « schtasks acceptera-t-il ces XML ? ». J'ai produit les trois fichiers avec installer-tache.cmd essai, dans un dossier dont le nom porte un espace et des parenthèses. Je les ai ensuite donnés au vrai Planificateur de tâches par son interface COM : XmlText, puis RegisterTaskDefinition avec le drapeau 1 (TASK_VALIDATE_ONLY), qui fait contrôler le fichier par Windows sans rien enregistrer. Les trois sont acceptés. Windows y relit bien : aucune limite de durée (PT0S), une seule instance à la fois (IgnoreNew), départ permis sur batterie, le compte de la session (InteractiveToken), wscript avec cache.vbs et le bon .cmd, une répétition toutes les heures. schtasks /query ne montre ensuite aucune tâche.

Corrigé :
1. L'installateur effaçait le marqueur CHANGER-DE-NODE au moment où il écrivait le nouveau Node dans node.txt. Or il ne lance aucune course, donc l'époque ne changeait pas. Le lancer.cmd suivant refusait alors (code 2) le Node que l'installateur venait de fixer. J'ai ajouté une option --garder-marqueur dans node-fixe.js, que l'installateur passe : seul lancer.cmd efface désormais le marqueur. Un test le couvre.
2. Un node.txt enregistré en « Unicode » (UTF-16) par le Bloc-notes n'était pas lu. node-fixe.js le lit maintenant. Un test le couvre.
3. README.md : la phrase fausse sur la fenêtre noire de chaque heure est remplacée. Le README dit aussi qu'il n'y a plus de limite de 72 h, que les tâches posées à la main sur le Ryzen sont remplacées, et ce qu'est etat/node.txt.

Le reste des affirmations de l'auteur est confirmé : 74 / 74 avant mes changements, 76 / 76 après, et le même seul raté dans integration.test.js, qui vient de genome.js et pas des lanceurs.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\node-fixe.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\installer-tache.cmd
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\lanceurs.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\README.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\lanceurs.md

### Tests

- Nom : tests/lanceurs.test.js  
  Réussi : oui  
  Détail : 74 / 74 avant mes changements, 76 / 76 après : deux contrôles ajoutés, le marqueur gardé par --garder-marqueur et un node.txt en UTF-16. Environ 18 s, aucune course.
- Nom : Planificateur de tâches en validation seule (COM, TASK_VALIDATE_ONLY)  
  Réussi : oui  
  Détail : Les trois XML sortis de installer-tache.cmd essai sont acceptés par Windows. PT0S, IgnoreNew, batterie, InteractiveToken, wscript avec cache.vbs, PT1H relus par Windows. schtasks /query ne montre ensuite aucune tâche CashCar ni de test.
- Nom : tests/machine-relecture.test.js  
  Réussi : oui  
  Détail : 19 / 19
- Nom : tests/integration.test.js  
  Réussi : non  
  Détail : 28 / 29. Tous les contrôles de l'installateur et du README passent. Le seul raté, « arbre : le parent mort v:1 est lu migre », vient de genome.js, qui est modifié par un autre agent.
- Nom : CRLF et ASCII de installer-tache.cmd après la modification  
  Réussi : oui  
  Détail : 206 CRLF pour 206 LF, aucun octet non ASCII.

### Problèmes

- Le marqueur CHANGER-DE-NODE est effacé par lancer.cmd avant qu'evoluer.js ait écrit la nouvelle époque. Si evoluer.js sort sans changer d'époque (verrou tenu, option de travers), le lancement suivant refuse et il faut recréer le marqueur. Le refus est bruyant, sans danger pour les notes. La vraie correction est qu'evoluer.js efface lui-même le marqueur (demande n° 1 de la note), mais ce fichier n'est pas à ce lot.
- Je n'ai pas vérifié que le compte de Sacha a le droit de poser la tâche d'ouverture de session (LogonTrigger) sans droits d'administrateur : la validation COM contrôle le format, pas les droits. Le premier vrai essai sera le Ryzen.
- Priorité 7 : les tâches font tourner la sélection sous la normale, avec des entrées-sorties basses. C'était déjà le défaut de schtasks. Mais le banc (machine.json) mesuré sous une tâche et sous un double-clic peut différer : je ne l'ai pas mesuré.
- Doutes de l'auteur non levés : une stratégie Windows peut couper wscript ; un état d'essai lancé par lancer.cmd --etat ou --config n'est pas protégé ; un chemin avec des lettres accentuées peut être mal lu par cmd ; la tâche des traces est elle aussi sans limite, donc un git push bloqué pour de bon empêcherait les envois suivants.
- arreter.cmd et sauver-traces.cmd lisent node.txt eux-mêmes. Si le fichier est en UTF-16 ou commence par un BOM, ils retombent sur le node du PATH, sans effet sur les notes.
- Le test traces.test.js et l'observation de Fable sur validations.jsonl ne sont pas recontrôlés ici : ils ne sont pas dans ce lot.

## 8. relire:portage

*Rôle : relecteur du lot « portage » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu'il trouve. Phase : Relire.*

### Résumé

I reviewed the portage lot, re-ran its tests and checked the key proofs by separate routes. The genome work holds up: c0025 and c0101 are written to the bit. I found one real bug in `--repartir-de`, which I fixed and covered with a test. Nothing committed or pushed, no branch change.

The bug, now fixed in evoluer.js (marked « le relecteur »): a STOP, PAUSE or Ctrl+C during the identity check (6 races, several minutes) did not stop the archiving. Then the loop saw the stop before generation 0, so the state was left EMPTY. A STOP right after archiving did the same. The next launch without the option (the hourly relaunch task, for example) would then birth the population from config.json's témoin, c0025, without saying so. Fix:
- `repartir` gets `doitArreter` and refuses BEFORE archiving;
- `principal` births generation 0 (population.json with temoinNom) right after archiving, before any stop check;
- `principal` is exported for the test.

New test p7 in portage.test.js runs in a separate process, with a fake identity check that passes and plays no race. Both cases fail when the fix is removed (checked by hand, then put back). portage.test.js: 11/11.

Proofs re-checked by separate routes:
1. My own script fed views drawn at random (3,000 sequences, seed 777): 62,352 decisions, 0 differences between the written pilot and its file, for all six témoins. The c0025 written by HEAD's genome.js + modele.js also matches today's.
2. A second pass biased towards flights over clean landings (2,500 sequences): 53,478 decisions, 0 differences. There the largeOn block and c0101's setting are really exercised (331 and 286 sequences change). libreOn (c0087) is only weakly exercised by random views (2 to 4 sequences).
3. A c0101 race identity check on 3 new seeds (910111, 910148, 910185 at 45 s, 2 at a time): IDENTICAL.
4. The c0025 id is still 19e3767cc346 with HEAD's genome.js, run from a separate copy.
5. Reading the diffs between successive champions by hand: nothing missed, and each flag-guarded form is equivalent to the original.
6. Fable's observation, recomputed from validations.jsonl: c0064, c0072, c0087 and c0101 have the same 20 race fingerprints; mean levels 4.80 / 5.70 / 6.80. It is right.
7. All fast tests re-run and passing. The author's end-to-end run is confirmed by the essais/portage/e2e folder.

I added a « Relecture » section to notes/portage.md and two lines to section 10.3 of INTERFACES.md.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\portage.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\portage.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md

### Tests

- Nom : portage.test.js (with the new p7)  
  Réussi : oui  
  Détail : 11/11. p7 fails in both of its cases when the fix is removed (checked by hand, then put back).
- Nom : decisions on random views (my script, separate from p3)  
  Réussi : oui  
  Détail : 3,000 sequences, seed 777: 62,352 decisions, 0 differences across the six témoins, and the HEAD c0025 matches today's. Biased pass (2,500 sequences, seed 4242): 53,478 decisions, 0 differences; c0064->c0072 changes 331 sequences and c0087->c0101 286.
- Nom : identite.js --temoin c0101 on new seeds 910111/910148/910185, 45 s, 2 at a time  
  Réussi : oui  
  Détail : 3 x IDENTICAL (d784306b857f, 9731e9860755, 8eef09b8afd1), 129 s
- Nom : c0025 id with HEAD's genome.js (git archive, separate copy)  
  Réussi : oui  
  Détail : 19e3767cc346, the same as after the portage
- Nom : Fable's observation recomputed from validations.jsonl  
  Réussi : oui  
  Détail : c0064 = c0072 = c0087 = c0101 on all 20 race fingerprints; mean levels 4.80 / 5.70 / 6.80
- Nom : fast tests (commun, graines, note, genome, tableau, lanceurs, generation, robustesse, machine, machine-relecture, traces, relecture-traces, gestes, integration)  
  Réussi : oui  
  Détail : all exit with code 0. The ones that use evoluer.js were re-run after the fix and still pass.

### Problèmes

- The '2,788 views' claim (c0064 traced races replayed through c0072/c0087/c0101) has no source in the repo, because the traces were not kept. My random pass points the same way but does not prove it on real races.
- The fingerprint 7b2c8f9e25f2 on 950000 'replayed here' was not re-run by me (a 900 s race). It does match the journal's first c0064 race.
- An exception inside preparer right after archiving would still leave an empty state. The window is very short and plays no race. To recover: relaunch with --repartir-de c0101, or set "temoin": "c0101" in config.json.
- README.md still mentions neither "temoin" nor --repartir-de (another agent was editing it).
- alarmeDistance has not been re-measured for 121 genes.
- Not re-run (slow): tests/evoluer.test.js, tests/courses.test.js, gestes.test.js --courses. c0026/c0064/c0072/c0087 written from their genome were compared without races only. libreOn is exercised mostly by the author's p3 views.
- identite.test.js (a) 'the témoins play different races' would fail if --temoins is set to two témoins that drive the same in races (c0064 and c0101, for example).
- Merging into evolution-ryzen opens a new epoch (modele.js changed): all races replayed and the identity check redone, though ids and driving are kept.

## 9. integrer

*Rôle : intégrateur : vérifie que les lots tiennent ensemble, relance tous les tests, écrit la note de livraison. Phase : Integrer.*

### Résumé

INTEGRATION FAITE. Tous les tests passent. Rien n'est commité ni poussé, la branche n'a pas changé, config.json garde "temoin": "c0025", et le jeu ne change pas.

1. Les lots tiennent ensemble. Un trou réel était resté entre le portage et les lanceurs, je l'ai fermé : sur le Ryzen, --repartir-de se tape à la main, et un « node » tout court y lance v24.22.1. La population neuve serait donc née dans une époque v24.22.1, puis chaque lancer.cmd (node.txt = v24.22.3) aurait refusé de partir.
J'ai fait la demande n° 1 des lanceurs, qui était sûre :
- evoluer.js refuse maintenant (code 2, avant le verrou et le banc) quand population.json court sous un autre Node que process.version. Il passe quand même sous lancer.cmd (qui donne CASHCAR_NODE_FIXE), avec --nouveau-node (option nouvelle), avec --banc, ou avec etat/CHANGER-DE-NODE (une fois, puis le marqueur est effacé).
- lancer.cmd pose la variable CASHCAR_NODE_FIXE (le fichier reste en CRLF et ASCII).
- Le message « la config demande X » conseille maintenant « lancer.cmd --repartir-de X ».
- Nouveau test tests/node-epoque.test.js : 14/14.
Les demandes n° 2 (README) et n° 3 (mots de l'arbre) étaient déjà faites ; rien n'était demandé pour commun.js. Le résumé, le tableau, l'arbre et le récit nomment le témoin de la population, et l'arbre a un mot simple pour les 14 gènes nouveaux. J'ai ajouté une ligne dans le récit : « Cette population est née d'un changement de témoin… archives/… née de c0025 ».

2. Les tests :
- Tests rapides : commun 16, graines 8, note 16, genome 14, tableau 69, lanceurs 76, generation 12, robustesse 8, machine 45, machine-relecture 19, traces 87, relecture-traces 95, gestes 10, integration 29, portage 11, node-epoque 14. Tous passent, et ceux touchés par les dernières modifications ont été relancés une seconde fois.
- identite.test.js --travailleurs 2 : 9/9. c0025 et c0101 sont chacun IDENTIQUES à leur fichier, au bit près.
- Évolution d'essai neuve née de c0101 (essais/c0101/etat) : 2 générations, code 0. Le contrôle d'identité passe (3 × IDENTIQUE), population.json dit temoinNom c0101, et les pages disent c0101.
- Changement de témoin : un état né de c0025 (génération 0), puis --repartir-de c0101. Contrôle d'identité d'abord, puis l'ancien état est rangé dans archives/…-c0025 avec ARCHIVE.json (11 éléments, rien d'effacé), et la population neuve naît de c0101. Code 0, et le résumé, l'arbre et le récit le disent.

3. ml/evolution/notes/LIVRAISON-C0101.md, en tête, le verdict de la mesure :
- Sur la validation (optimiste, malédiction du gagnant) : c0064 = c0101, +2,00 paliers par rapport à c0025, IC 95 % [+0,75 ; +3,40], p = 0,039.
- Sur le coffre, 10 graines sur 40 seulement : c0064 −1,20 [−3,20 ; +0,40], c0101 −0,90 [−3,10 ; +0,80].
- Verdict : rien ne montre un gain sur des graines jamais vues. Le témoin reste c0025 tant que le coffre n'est pas fini, et la décision revient à Fable.
- L'observation de Fable est confirmée : c0064, c0072, c0087 et c0101 jouent les mêmes 20 courses de validation, empreintes comprises. Mais c0101 diffère de c0064 sur 2 graines du coffre sur 10.
La note dit aussi l'état exact (ce qui est prêt, ce qui n'est pas vérifié) et les 7 gestes sur le Ryzen :
- arrêter, puis fusionner ;
- écrire etat\node.txt (le chemin de node-v24.22.3) ;
- relancer par lancer.cmd, ou par « lancer.cmd --repartir-de c0101 » si Fable retient c0101, et jamais par « node … » ;
- les tâches posées à la main : rien à faire, installer-tache.cmd seulement si on veut les remplacer ;
- vérifier, puis lancer sauver-traces.

4. INTERFACES.md :
- § 9.5 : la fenêtre noire est marquée faite.
- § 10.3 : le récit et les archives.
- § 10.4 : le Node fixe et la garde d'evoluer.js.
- § 10.5 : les tâches XML sans limite de durée.
- § 10.6 : un tableau qui dit où chaque format est décrit.
README.md : une section « Le témoin », le Node fixe dans « METTRE À JOUR », deux refus de plus dans « Si ça s'arrête », la phrase sur la limite de 3 jours remplacée, les fichiers nouveaux.
Ma note d'intégrateur : notes/integrateur-c0101.md.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\lancer.cmd
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\node-epoque.test.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\INTERFACES.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\README.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\LIVRAISON-C0101.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\integrateur-c0101.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\essais\c0101\config-c0101.json

### Tests

- Nom : tests rapides (16 fichiers)  
  Réussi : oui  
  Détail : commun 16/16, graines 8, note 16, genome 14, tableau 69, lanceurs 76, generation 12, robustesse 8, machine 45, machine-relecture 19, traces 87, relecture-traces 95, gestes 10, integration 29, portage 11, node-epoque 14 ; ceux touchés par les dernières modifications relancés une seconde fois
- Nom : tests/node-epoque.test.js (nouveau)  
  Réussi : oui  
  Détail : 14/14 : refusNode (pas d'époque, même version, autre version, --nouveau-node, --banc, CASHCAR_NODE_FIXE, marqueur une fois) ; evoluer.js en vrai sur un état en v1.2.3 : code 2 en moins de 20 s, rien d'écrit ; lancer.cmd passe la variable
- Nom : identite.test.js --travailleurs 2 (c0025 et c0101)  
  Réussi : oui  
  Détail : 9/9 en 307 s ; c0101 : 8d34b0578072, 700c9e35dfbb, 302b83fef550
- Nom : évolution d'essai neuve née de c0101, 2 générations, 2 à la fois  
  Réussi : oui  
  Détail : code 0, 626 s ; identité 3 x IDENTIQUE ; témoin f70ddcb5a565 (c0101) ; 14 puis 18 courses ; pages et population.json disent c0101
- Nom : changement de témoin c0025 -> c0101 sur un état existant  
  Réussi : oui  
  Détail : archives/2026-11-28T00-59-01-c0025 avec ARCHIVE.json, 11 éléments rangés, rien d'effacé ; population neuve c0101 ; le récit le dit (ligne 6), le résumé et l'arbre nomment c0101
- Nom : lancer.cmd --repartir-de c0101 de bout en bout  
  Réussi : non  
  Détail : non essayé : seule la transmission des options par lancer.cmd est testée (avec un faux evoluer.js)

### Problèmes

- Le coffre n'est toujours pas fini : 10 graines sur 40 pour c0025, c0064 et c0101, et 4 sur 40 pour c0026. Le choix du témoin attend la fin de jouer.js --travailleurs 4 puis d'analyser.js (25 à 45 min), à lancer après le commit du portage puisque modele.js est dans l'époque.
- Le verdict n'a pas fait changer config.json : il reste à c0025, la décision revient à Fable.
- Rien de ce code n'a tourné sur le Ryzen. Points ouverts : node-fixe.js doit trouver node-v24.22.3 tout seul, sinon il refuse et il faut écrire etat\node.txt (geste 3) ; le droit de poser la tâche d'ouverture de session sans administrateur ; wscript peut être coupé ; je n'ai pas pu vérifier que les tâches posées à la main appellent bien lancer.cmd auto.
- Pour la demande n° 1, j'ai choisi une variable d'environnement (CASHCAR_NODE_FIXE) plutôt que de déplacer l'effacement du marqueur dans node-fixe.js. Le cas « marqueur consommé par lancer.cmd, puis evoluer.js qui sort sans changer d'époque » reste non corrigé : le refus est bruyant mais sans danger.
- Non relancés (lents) : tests/evoluer.test.js, tests/courses.test.js, gestes.test.js --courses. alarmeDistance n'a pas été remesurée pour 121 gènes. c0026, c0064, c0072 et c0087 n'ont été comparés que sans course.
- Je n'ai pas vérifié moi-même E et F sur le coffre, ni les « 2 788 vues » du portage, dont les traces n'ont pas été gardées.
- Une commande PowerShell ratée de ma part a créé un fichier vide evoluer.js à la racine du dépôt ; je l'ai retiré tout de suite.
- Les états d'essai sont dans ml/evolution/essais/c0101/ (hors git) : on peut les effacer.
