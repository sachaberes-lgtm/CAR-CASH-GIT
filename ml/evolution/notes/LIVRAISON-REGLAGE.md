# La livraison « réglage de la sélection » (28/11/2026, l'intégrateur)

Pour la session principale (Fable), pour Sacha, ou pour l'assistant qui l'aidera sur le Ryzen. Trois lots relus (« sacre », « règles », « tau »), puis
intégrés ici, d'après `ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md` (la synthèse). Le contrat : `INTERFACES.md` § 11. Le détail :
`notes/sacre.md`, `notes/regles.md`, `notes/tau.md`, `notes/integrateur-reglage.md`.

**Rien n'est commité ni poussé.** Le jeu ne change pas. `modele.js`, `enfant.js` et `config.json « reseaux »` ne sont pas touchés : **ce lot ne change
aucune époque**. Mais le Ryzen (code e93ff5cb5) recevra aussi le portage du 28/11 (commit 7b1df608e), qui, lui, change `modele.js` : voir § 3.

---

## 1. Ce que la mise à jour change, en mots simples

1. **Le sacre est plus juste** (A5). Le meneur rejoue 24 courses neuves contre le champion ; s'il semble devant, 12 de plus, puis encore 12, jusqu'à 96 ;
   s'il est clairement derrière, on arrête. Mesuré avec ce code sur les vraies courses du 27/11 : un vrai +1 palier reconnu environ 1 fois sur 3 (avant :
   15 sur 100), un +2 environ 80 fois sur 100 (avant : 44), un peu moins de faux champions (1,8 % au lieu de 3 %), un moins bon jamais. Coût : environ
   75 courses par validation au lieu de 48 quand le meneur ne vaut pas mieux.
2. **L'alarme « malédiction du gagnant » est coupée** (A1). Elle aurait durci la barre des sacres au bout de 10 validations alors qu'elle sonnait par
   construction. La mesure reste écrite.
3. **Les enfants sont protégés par leur âge** (A4) : pas renvoyables pendant leur génération de naissance, parents deux générations après.
4. **Les courses longues partent en premier** (A6) ; la note ne dépend plus de l'ordre où les courses finissent.
5. **Les graines ne s'épuisent plus** (M6) : 27 millions de routes après les 1 081 d'avant, sans rejouer ni sauter. Sans ce changement, le Ryzen aurait
   commencé à rejouer des routes en silence vers la génération 90.
6. **Les mutations ne tombent plus dans le vide** (C2) : on ne change plus un réglage que le pilote ne lit pas (27 % des réglages changés sur le Ryzen, en v:2).
7. **« Les mutations comptent-elles ? »** (M1, M4) : la sélection mesure elle-même, sans course de plus, si un enfant « bon » l'est vraiment. Dans le
   tableau (section 1 bis), le récit et la dernière ligne de resume.txt. « Trop tôt pour le dire » pendant environ 32 générations (191 enfants).
8. **Une décision reste à Sacha** (D1) : `validation.seuilB` / `seuilC` à 1 (comme avant) ou 2 (un +2 reconnu 86 fois sur 100 au lieu de 80, mais un pilote
   qui ressemble un peu moins aux joueurs passerait plus souvent). Non prise : 1.

## 2. L'état exact

### Ce qui est prêt

- Le code des trois lots, relu chacun par un second agent (corrections faites en place, marquées « le relecteur »), et la mesure de τ branchée dans les
  pages (cette intégration).
- `INTERFACES.md` § 11 et les paragraphes que ces changements rendaient faux (§ 2.6, 2.8, 2.9, 2.10, 3.1, 3.4, 3.6, 6.1, 6.4, 9.3) ; `README.md`.
- Deux états écrits par l'ancien code gardés dans git pour les tests : `tests/etat-v2-ancien` (27/11 au soir) et **`tests/etat-e93ff5cb5`** (neuf : écrit par
  le code exact du Ryzen, voir ci-dessous).

### Ce qui a été vérifié ici (le 28/11, sur le Xeon, 2 courses à la fois au plus, une autre mesure jouant 4 courses à côté)

- **Tous les tests rapides** (relancés un par un à la fin, PC sans autre test en cours) : commun 16/16, graines 13/13, note 16/16, genome 14/14,
  tableau 72/72, lanceurs 76/76, generation 16/16, robustesse 8/8, machine 45/45, machine-relecture 19/19, traces 87/87, relecture-traces 95/95,
  gestes 10/10, integration 29/29, portage 11/11, node-epoque 14/14 ; et les nouveaux : mesure-tau 75/75, validation-sequentielle 25/25, genes-muets 6/6.
  Corrigé en route : `validation-sequentielle` V8 échouait après `evoluer.test.js` (il prenait la nouvelle validation de `essais/tests-evoluer` pour une
  ligne d'avant) : il ne juge plus que les lignes sans `regards`, et lit en plus les deux états d'avant gardés dans git.
- **`tests/evoluer.test.js --travailleurs 2`** (tout : a, bd, c, e, f, g, t) : **TOUT PASSE**, 78 contrôles, 3 602 s. L'étape f fait une vraie validation
  séquentielle (« arrete au 2e regard, sur 6 graines (z -0.49 sous 0.50) », 12 courses de validation) ; le kill dur (bd) et PAUSE/STOP (c) passent avec
  l'ordre des courses par durée et la protection par l'âge.
- **`tests/identite.test.js --travailleurs 2`** (c0025 et c0101) : **9 / 9**, 465 s.
- **`tests/courses.test.js`** : pas lancé (4 et 3 courses à la fois ; voir plus bas).
- **Un état écrit par le code exact du Ryzen, repris par ce code** (vraies courses, 2 à la fois) :
  1. `git worktree add --detach` d'**e93ff5cb5** dans un dossier temporaire hors du dépôt ; avec ce code, `config-essai.json`, `--travailleurs 2
     --arret-apres 2` : premier lancement (époque `29ae5fffc2b9`), identité IDENTIQUE ×3, générations 0 et 1 (32 courses, 2 renvois), puis
     `--valider-maintenant` : une ligne de validation **d'avant** (3 graines, sans `regards`). Génomes v:2, graines sans `blocs`, `validationK` 3.
     Le worktree est retiré (`git worktree remove`, `prune`) ; l'état est gardé dans `tests/etat-e93ff5cb5` (sans pilotes générés ni pages).
  2. Le même état repris par **ce code** (`--arret-apres 2`) : « nouvelle epoque : yeux.js, doigts.js, piloter.js, ressemblance.js, voltige.js, modele.js
     (29ae5fffc2b9 -> 66f66d2ae1c2) », identité IDENTIQUE ×3, coffre « époque », générations 2 et 3 (38 courses), **code 0**. Génomes v:2 → v:3, mêmes
     identifiants ; `blocs` absent → 0 ; graines continuées sans en rejouer une (939156 949072 937380, puis 923764 915661 937417) ; renvois par l'âge
     dès la 1re génération de l'époque (un mutant g0 et un enfant né en 1). Puis `--valider-maintenant` : validation **séquentielle** sur 1000111…
     (les graines continuent là où l'ancien code s'était arrêté : `validationK` 3 → 6), « arrete au 1er regard, sur 3 graines (z -1.16 sous 0.50) ».
  3. Les pages de cet état (`node tableau.js`) : le résumé (« Validation (gen. 3) : afb012d9 contre 19e3767c : arrete au 1er regard … »), la 11e ligne de
     resume.txt, le récit (l'ancienne validation dite « sur 3 courses neuves » à l'ancienne, la nouvelle « 3 d'abord, puis 3 de plus … ») : justes.
  4. Gardé comme test : `tests/generation.test.js` « compatibilité » rejoue une génération sur `tests/etat-e93ff5cb5` (tel quel, et réserve d'avant vidée :
     graines 1029177 1039093 1027401 de la suite) ; `validation-sequentielle` V8 relit ses pages et sa ligne de τ.
- **Une évolution d'essai neuve de 4 générations** (`config-essai.json`, état `essais/reglage/etat`, 2 à la fois, tmax 60) avec **un STOP au milieu d'une
  validation** : la génération 0 a validé son meneur ; STOP posé après 3 des 6 courses de validation → « generation 0 interrompue », STOP effacé, code 0.
  Relance : « reprise (naissances deja faites) », 15 courses du cache et 5 jouées (les 3 de validation qui manquaient et le coffre), la même première graine
  (1000000), « arrete au 1er regard, sur 3 graines (z 0.20 sous 0.50) » ; puis les générations 1 à 3 ; code 0. **74 lignes de courses pour 74 clés** : aucune
  course jouée deux fois. Renvois : les deux mutants g0 en génération 1, les enfants nés en 1 en génération 2, ceux nés en 2 en génération 3 ; aucun
  nouveau-né renvoyé à sa naissance.
  **Les pages produites** (lues comme quelqu'un qui ne code pas) : `resume.txt` juste et lisible (la validation en clair, la 11e ligne
  « Mutations comptent-elles ? trop tot pour le dire (7 enfants mesures sur 3608) ; r -0.35, tau 0.00 [0.00 ; 0.46] ») ; `histoire.md` juste (chaque
  phrase vérifiée contre les journaux) et lisible ; `tableau.html` : la section 1 bis dit « Trop tôt pour le dire », la barre est presque vide, la section 5
  explique le séquentiel. Trois petites gaucheries, d'avant ce lot, laissées : après une reprise, le récit date la génération 0 de la reprise (« 5 courses
  jouées en 1 min », « depuis 06 h 41 » au lieu de 06 h 33) ; « fondait de 7,42 point de note » (singulier) ; « le témoin (pilote-voltige (c0025)) »
  (parenthèses doublées). Le requis de 3 608 enfants est celui de l'essai (λ 2, 3 graines) : sur le Ryzen, 191.
- **La mesure de τ sur la copie de l'état réel du 27/11** (lue, jamais écrite ; pages refaites sur une copie) : « trop tôt pour le dire (19 enfants mesurés
  sur 191) », r −0,13, τ ≈ 0,00 [0 ; 0,94], 62 courses pour rien sur 528 : les chiffres de `notes/tau.md`. 59 ms pour la mesure, 0,4 s pour tout le tableau.

### Ce qui n'est pas vérifié

- **Rien de ce code n'a tourné sur le Ryzen.** Son vrai état n'a pas été lu (pas sous la main) : la compatibilité est prouvée sur un état écrit par le même
  code (e93ff5cb5) ici, à 3 graines, pas sur 12 graines et des dizaines de générations.
- La valeur de `regle6` dans le population.json du Ryzen : si elle est déjà à 3 (l'ancienne alarme a sonné), elle y reste (§ 4, geste 6).
- L'effet de la validation séquentielle sur le **progrès** du champion (et non sur le taux de sacre) : mesuré nulle part (synthèse C8).
- Qu'un meilleur pilote décale ses paliers sans en changer la forme (M5) : les `regards` des premières vraies validations le permettront.
- Le gain de A6 (0,2 % mesuré sur le Xeon par l'étude) ; l'effet de C2 sur la sélection (et pas seulement sur les tirages).
- Le risque « mulberry32 » des graines de la suite (deux graines qui jouent le même ruban de hasard décalé de quelques milliers de tirages, relecture du lot
  « règles ») : aucune course jouée pour le mesurer.
- `tests/courses.test.js` : **pas lancé** (il joue 4 et 3 courses à la fois, au-dessus des 2 permises ici, à côté de la mesure en cours ; ce lot ne touche
  ni `courses.js` ni `enfant.js`).
- Le premier verdict de τ sorti de « trop tôt » n'est écrit nulle part (les pages disent le verdict du jour) : `notes/integrateur-reglage.md`.

## 3. Ce que la mise à jour fera sur le Ryzen

Le Ryzen tourne avec le code du commit **e93ff5cb5** (génome v:2). En fusionnant `origin/bots-ecurie`, il reçoit **deux** mises à jour d'un coup : celle du
portage (`notes/LIVRAISON-C0101.md` : génome v:3, témoin au choix, Node fixe, tâches sans limite) et celle-ci. Au premier lancement :

1. **Une nouvelle époque** (à cause du portage : `modele.js` a changé le 28/11 ; c'est le SEUL fichier de l'époque qui a changé dans git depuis
   e93ff5cb5 — `git diff --stat e93ff5cb5 HEAD` sur les dix fichiers, relu par Fable le 28/11. Les yeux, la main et le simulateur n'ont pas bougé.
   L'essai du § 2 nomme aussi `yeux.js`, `doigts.js`, `piloter.js`, `ressemblance.js` et `voltige.js` : c'est un effet de l'essai, pas du code. Le dossier
   temporaire d'e93ff5cb5 a été extrait par Git avec des fins de ligne Windows, celui-ci les a en fins de ligne Unix ; l'époque se calcule sur les
   octets, donc les mêmes fichiers y ont deux empreintes. Sur le Ryzen, la fusion ne réécrit que les fichiers changés : seul `modele.js` y changera
   d'empreinte). Les notes repartent de zéro ; **toutes les courses sont rejouées** (le cache ne sert plus) ; **les pilotes
   restent** (leurs identifiants aussi : un génome v:2 est relu en v:3, ses 14 gènes nouveaux éteints) ; le contrôle d'identité est refait (3 courses du
   témoin, quelques minutes) ; le coffre « époque » est joué ; si le champion n'est pas le témoin, il se revalide (24 graines, règle inchangée).
   Les courses déjà jouées restent dans `courses-*.jsonl` (la mesure de τ lit aussi les époques closes).
2. Les graines d'entraînement continuent **là où elles en étaient** (la réserve d'avant reste en tête, `blocs` vaut 0), puis passent seules à la suite.
3. La prochaine validation est **séquentielle** ; l'alarme de la malédiction ne sonne plus. Une ancienne ligne de `validations.jsonl` se lit « sur 24
   graines (un seul lot) ».
4. Les renvois suivent l'âge : **dès la première génération de l'époque**, les pilotes d'au moins une génération sont renvoyables (l'ancienne règle des
   24 courses n'en renvoyait aucun à une époque neuve, puisque personne n'avait de course dans l'époque).
5. Les `se_F` peuvent bouger un peu une fois (la note range maintenant ses lignes) : sans effet visible, puisque l'époque repart de zéro de toute façon.
6. Les pages : la ligne 8 du résumé dit le regard d'une validation ; resume.txt a une 11e ligne « Mutations comptent-elles ? » ; le tableau a la section 1 bis ;
   le récit a son paragraphe.

## 4. Sur le Ryzen : les gestes de la mise à jour, dans l'ordre

Ce sont les gestes de `notes/LIVRAISON-C0101.md` § 3 ; **ce qui change est en gras**. Avant tout : ce travail doit être commité et poussé sur
`bots-ecurie` par la session principale, avec l'accord de Sacha.

1. **Arrêter** : double-clic sur `arreter.cmd` dans `CASH-CAR-evolution\ml\evolution` ; attendre « C'est arrêté ». Inchangé.
2. **Fusionner** : fenêtre de commande dans `CASH-CAR-evolution`, puis `git fetch origin` et `git merge --no-edit origin/bots-ecurie` ; `Merge made by …`
   attendu ; `CONFLICT` → `git merge --abort` et demander à Claude. Inchangé.
3. **Le Node fixe** (une fois) : écrire dans `ml\evolution\etat\node.txt` le chemin du `node.exe` de `node-v24.22.3`. Inchangé (LIVRAISON-C0101 § 3, geste 3).
4. **Relancer** : double-clic sur `lancer.cmd` (le témoin reste c0025). Le cas `--repartir-de c0101` de LIVRAISON-C0101 reste possible, mais **le coffre
   complet (commit 00fb4cfad) a montré que c0064 et c0101 ne font pas mieux que c0025 : rien ne pousse à changer de témoin.**
5. Les tâches déjà posées : rien à faire (LIVRAISON-C0101 § 3, geste 5).
6. **Vérifier** : `node ml\evolution\etat.js` → ligne 2 EN MARCHE, ligne « Temoin » `(c0025)` ; la fin de `ml\evolution\etat\sortie.log` dit `node v24.22.3`,
   puis « nouvelle epoque : … modele.js … », « identite : … IDENTIQUE » (trois fois) et « identite verifiee ». **En plus : ouvrir `ml\evolution\etat\population.json`
   avec le Bloc-notes et chercher `"regle6"`. S'il vaut 2 : rien à faire. S'il vaut 3, l'ancienne alarme avait sonné : le dire à Claude** (la remettre à 2 est
   une petite modification à faire sélection arrêtée ; ce n'est pas urgent). **Et `ml\evolution\etat\resume.txt` doit finir par
   « Mutations comptent-elles ? trop tot pour le dire (… sur 191) »** (au moins une génération finie après la mise à jour).
7. **Mettre à l'abri** : double-clic sur `sauver-traces.cmd` une fois. Inchangé (la nouvelle ligne et la nouvelle section partent avec les pages).

**Ce qui ne doit pas surprendre** : quelques heures de courses rejouées (la nouvelle époque) ; des renvois dès la première génération ; une validation qui
dure plus longtemps qu'avant quand le meneur semble devant (jusqu'à 192 courses) ; « trop tôt pour le dire » pendant une trentaine de générations.
**Si `sortie.log` dit un jour « les graines d'entrainement sont epuisees »** : la sélection s'est arrêtée proprement, rien n'est perdu ; donner la fin de
`sortie.log` à Claude (`README.md`, « Si ça s'arrête »). À 12 graines, cela n'arrive qu'après 2 millions de générations.

---

## 5. La relecture de la session principale (Fable, 28/11/2026, 7 h 30)

Relu avant d'enregistrer (commit `3b1bf15e5`, poussé sur `bots-ecurie`) : le code des trois lots (`evoluer.js`, `graines.js`, `genome.js`, `note.js`),
les 19 suites rapides relancées une par une (toutes passent), et trois vérifications de plus.

1. **Le vrai état du Ryzen, lu ici.** Le Ryzen envoie ses journaux sur la branche `evolution-ryzen`. J'ai pris son dernier état envoyé (28/11, 2 h 00 :
   génération 1 en cours, 26 vivants, génomes v:2, `regle6` 2, réserve de 1 057 graines, pas de champ `blocs`) et je l'ai fait lire par ce code, dans un
   dossier à part : `etat.js` rend ses 10 lignes, `tableau.js` refait les quatre pages, la ligne « Mutations comptent-elles ? trop tot pour le dire
   (0 enfant mesure sur 191) » s'écrit, et les 26 génomes se relisent en v:3 avec les mêmes identifiants. Les courses ne sont pas dans la branche
   (elles restent sur le Ryzen) : le rejeu d'une génération n'est donc prouvé que sur l'état d'essai du § 2.
2. **La fusion.** `git merge-tree origin/evolution-ryzen origin/bots-ecurie` : aucun conflit (au commit `71e7c7c2c` du Ryzen).
3. **Les fins de ligne.** L'époque du Ryzen est `29ae5fffc2b9`, la même que celle du dossier temporaire du § 2 : ses fichiers sont en fins de ligne
   Windows. C'est sans effet sur les courses ; cela explique seulement la liste de fichiers du § 2 (voir le § 3, point 1).

**Un point à regarder d'abord sur le Ryzen** : son dernier envoi date de 2 h 00 le 28/11. À 418 courses à l'heure, une génération dure 45 minutes : il
aurait dû envoyer cinq fois depuis. Soit la sélection s'est arrêtée, soit le PC s'est éteint ou mis en veille, soit l'envoi ne passe plus (réseau coupé
la nuit ?). **Avant le geste 1** : dans une fenêtre de commande ouverte dans `CASH-CAR-evolution`, taper `node ml\evolution\etat.js` (il ne fait que lire :
n'importe quel Node convient) et donner les 10 lignes à Claude, avec les 30 dernières lignes de `ml\evolution\etat\sortie.log` et de
`ml\evolution\etat\traces.log`. Si la ligne 2 dit EN MARCHE et que la génération a avancé, c'est seulement
l'envoi : continuer la mise à jour. Sinon, donner ces lignes à Claude avant de relancer : la cause de l'arrêt compte.
