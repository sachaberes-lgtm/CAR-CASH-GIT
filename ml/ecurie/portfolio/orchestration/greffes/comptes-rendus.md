# Les greffes de la sélection : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `greffes-de-la-selection` (wf_3dbb33d5-4d2), lancée par la session principale (Claude Fable).
- Agents : 2, tous du modèle claude-opus-5-5.
- Durée : 1 h 59 ; jetons consommés par les agents : 427 841 (0,43 millions) ; appels d'outils : 142.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. auteur : écrit les greffes (greffes.js, le branchement dans evoluer.js, le test, la note) (phase « Ecriture »)
2. relecteur : vérifie au bit près que rien ne change sans greffe, essaie en vraies courses, corrige sur place (phase « Relecture »)

## 1. auteur

*Rôle : auteur : écrit les greffes (greffes.js, le branchement dans evoluer.js, le test, la note). Phase : Ecriture.*

RAPPORT DE L'AUTEUR : LES GREFFES (branche bots-ecurie, HEAD 46842ee77). Rien n'est commité ni poussé.

Les greffes marchent comme prévu dans la conception, sans écart. Avec "greffes" absente, null ou [], naissances() et generation0() donnent au bit près le même résultat que le code de 46842ee77. Le nouveau test passe (68 sur 68) et les 15 suites rapides existantes aussi. Aucune vraie génération n'a encore tourné avec des greffes.

FICHIERS
- Nouveau : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\greffes.js. Des fonctions pures, aucun tirage, aucune écriture :
  - lireGreffes(cfg,{bornes?}) : rend la liste figée ; absente, null ou [] rend []. Sinon lève une erreur « evoluer : config "greffes", ensemble n° i : … » dans ces cas :
    - la valeur n'est pas une liste ;
    - un élément n'est pas un objet, ou c'est un objet vide ;
    - gène inconnu (y compris __proto__) ;
    - une tête (WV/WS) ;
    - un type autre que drapeau, choix ou entier ;
    - fige:true ;
    - une valeur non entière ou hors de [min ; max].
  - rangCycle(G,k,immigres,n) = ((G-1)*immigres+k) mod (n+1).
  - ensembleDe(greffes,G,k,immigres) : null pour l'immigré ordinaire.
  - forcer(genome,ens) : copie profonde, l'ordre des clés de A est gardé.
  - dejaPorte et texte (« bordOn=1 + slalomOn=1 »).
- Nouveau : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\greffes.test.js. 68 contrôles, environ 45 s, aucune course. Ses fichiers de travail vont dans $GREFFES_TMP (sinon le dossier temporaire du système) et sont effacés à la fin.
- Nouveau : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\greffes.md. La note pour quelqu'un qui ne code pas : quoi, pourquoi, la règle exacte, comment l'allumer, ce qui est vérifié et ce qui ne l'est pas.
- Modifié : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js (détail ci-dessous).
- Modifié : C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js. Une fonction phraseGreffes ajoute « Dont 1 né par greffe (une copie exacte du champion, avec des interrupteurs forcés) : `id` (bordOn = 1, slalomOn = 1). ». Elle sert à la génération finie et à la génération en cours. evenementClair traduit l'événement « greffe … ». Sans greffe, le texte est identique.
- Pas touchés : genome.js, modele.js, enfant.js, courses.js, INTERFACES.md, README.md, config.json, les tests interdits, code/, VERSION PRINCIPALE/, le worktree genes-v4.

LIGNES CHANGÉES DANS evoluer.js (numéros du fichier nouveau)
- l.19 : `const Gf=require('./greffes');`
- l.259 (charger) : `Gf.lireGreffes(cfg);` juste après planValidation.
- l.267 (charger) : un avertissement si des greffes sont demandées avec immigres à 0.
- l.433-488 (naissances) :
  - `const greffes=Gf.lireGreffes(cfg)` ;
  - dans la branche immigré : si un ensemble tombe à ce rang, `g=Gf.forcer(champion.genome,greffe)` sans tirage. Si dejaPorte ou si l'identifiant est dans dejaVus, alors `g=Gf.forcer(Gn.muter(g,rng,{phase,cfg}).genome,greffe)`. Sinon, la ligne d'origine de l'immigré, inchangée ;
  - dans la boucle des doublons : `if(greffe)g=Gf.forcer(g,greffe);` après chaque remutation ;
  - un abandon porte greffe et son événement le dit ;
  - `v.greffe` n'est ajouté qu'en cas de greffe, avec l'événement « greffe bordOn=1 + slalomOn=1 : <id> ne du champion <id> (aucune autre mutation | …portait deja ces valeurs…) » ;
  - naissancesGeneration porte `greffe` seulement s'il y en a une (l'ordre des clés est inchangé sinon) ;
  - la ligne du journal dit « <id> immigre greffe bordOn=1 + slalomOn=1 ».
- l.1259 (principal, dans le try de lireConfig) : `Gf.lireGreffes(cfg);`. Une config fautive est donc refusée avant le banc et avant toute course, avec le code 1, comme une config illisible.
- l.1360 (exports) : `naissances,generation0` ajoutés, pour le test.

CE QUI EST VÉRIFIÉ, ET COMMENT
- greffes.test.js : 68 sur 68.
  - V : tous les refus. Le gène figé est simulé par une copie de BORNES où bordOn porte fige:true. evoluer.js lancé en vrai sur une config fautive sort avec le code 1, le message, et sans créer de dossier d'état.
  - Y : les rangs pour G = 1..12, avec n = 0, 1, 4 et immigres = 1, 2, comparés à une table écrite à la main.
  - A : le champion n'est pas modifié ; les valeurs sont forcées ; le reste est identique ; l'identifiant change ; Gn.valider rend null.
  - N : naissances() avec une greffe.
    - L'enfant égale forcer(champion) exactement.
    - mutes contient les gènes greffés qui diffèrent du champion, avec avant et après : diffGenomes le donne bien.
    - Le champ greffe est dans les vivants, dans naissancesGeneration et dans le population.json écrit. Le journal et l'événement le disent.
    - Aucun tirage n'est consommé : les 5 autres enfants, pop.rng et les graines sont identiques à une génération avec immigres=0 et lambda=5.
    - À G=2 avec un seul ensemble, l'immigré ordinaire revient.
    - Repli quand le champion porte déjà les quatre drapeaux, sur 120 états du générateur : valeurs tenues, identifiant neuf, génome valide, mutation faite, générateur consommé, 120 fois sur 120.
    - Repli quand la copie est déjà vue : identifiant neuf, valeurs tenues.
  - R : la non-régression. La référence est `git show 46842ee77:ml/evolution/evoluer.js`, écrite dans le dossier temporaire avec ses require rendus absolus, et chargée comme module.
    - Avec greffes absente, null et [], et immigres = 1 puis 2, la génération 0 est identique.
    - Puis 6 générations de naissances enchaînées, avec des courses fabriquées et un changement de champion à G3 : même population.json à l'octet près, mêmes lignes de journal, mêmes événements, même pop.rng.
    - Contre-épreuve sur une copie du test : avec greffes [{bordOn:1}], R échoue bien. Elle confirme aussi qu'avec 2 immigrés, le second immigré est l'ancien premier, donc la greffe ne consomme aucun tirage.
- Les pages ont été essayées sur une copie de tests/etat-exemple dans le dossier temporaire, avec des naissances greffées et des événements ajoutés à la main, en passant --config sur cette copie.
  - tableau.js, arbre.js et histoire.js tournent.
  - arbre.html et resume.txt sont identiques à ceux de l'état sans greffe.
  - tableau.html ne diffère que par la ligne de l'événement.
  - histoire.md ne diffère que par les phrases de greffe, y compris pour une génération en cours.
- Les suites rapides existantes, relancées une par une avec ce code : toutes passent avec le code 0.
  - generation 16/16, machine-relecture 19/19, machine 45/45, mesure-tau 75/75, node-epoque 14/14, portage 11/11, robustesse 8/8 ;
  - validation-sequentielle 25/25, tableau 72/72, relecture-traces 95/95, traces 87/87, integration 29/29, lanceurs 76/76, commun 16/16, graines 13/13.

INCIDENT, RÉPARÉ
- Mon premier essai `node tableau.js --etat <dossier temporaire>` a ignoré l'option : tableau.js ne lit que --config. Il a donc créé ml/evolution/etat/ dans le worktree, avec 4 pages (arbre.html, histoire.md, resume.txt, tableau.html).
- Ce dossier n'existait pas avant : git status du début ne le montrait pas. Je l'ai effacé tout de suite, avec ces 4 fichiers seulement. git status est revenu à l'état attendu.

CE QUI N'EST PAS VÉRIFIÉ
- Aucune vraie génération avec des greffes : ni course, ni Ryzen.
- evoluer.test.js (environ une heure de courses) et identite.test.js (des courses) n'ont pas été relancés.
- INTERFACES.md et README.md ne disent rien des greffes, car ils étaient interdits. À ajouter à la fusion : la clé de config, le champ greffe des naissances et des vivants, la règle du cycle.
- Limites laissées telles quelles, écrites dans la note :
  - la fiche de l'arbre dit « immigré : une copie très changée » pour un enfant greffé ;
  - morts.jsonl ne garde pas le champ greffe d'un renvoyé ;
  - mesure-tau range les greffes avec les immigrés ;
  - une greffe dont l'interrupteur ne sert pas sur une route rejoue exactement la course du champion.
- La clé "greffes" n'est pas dans config.json : c'est à mettre à la fusion.

Fichiers temporaires : <dossier temporaire>\scratchpad\greffes\ (sorties des suites, états des pages, mutant.test.js).

## 2. relecteur

*Rôle : relecteur : vérifie au bit près que rien ne change sans greffe, essaie en vraies courses, corrige sur place. Phase : Relecture.*

RELECTURE ADVERSE DES GREFFES (branche bots-ecurie, HEAD 46842ee77). Rien n'est commité ni poussé. Aucun fichier interdit n'a été touché (git status : M evoluer.js, M histoire.js, ?? greffes.js, notes/greffes.md, tests/greffes.test.js ; ml/bot/results/note-essai-main-allege-t120-parties.json était déjà là au départ, il n'est pas à moi). Pas de dossier ml/evolution/etat. Au plus 2 courses à la fois du début à la fin.

## LES DÉFAUTS TROUVÉS ET CORRIGÉS
1. **La reprise perdait l'événement de la greffe.** Il est apparu à l'essai réel n° 3. Après un STOP au milieu d'une génération à greffe puis une relance, la ligne de la génération dans generations.jsonl n'avait plus l'événement « greffe bordOn=1 : … ». Sans arrêt, elle l'avait. La cause : les événements de naissances() ne vivent qu'en mémoire (ctx.evenements). Le défaut existait déjà pour les autres événements des naissances, mais pour les greffes la ligne du journal ne le disait plus.
   - Correctif dans evoluer.js :
     - une fonction texteGreffe(greffe, id, champ, muteEnPlus, essais) donne le texte, partagé par naissances() et la reprise ;
     - dans generation(), dans la branche « reprise (naissances deja faites…) », l'événement est redit depuis pop.naissancesGeneration. « Plus une mutation » se déduit de mutes : un gène changé hors de la greffe. Le nombre de remutations est perdu, il n'est écrit nulle part.
   - Sans greffe, la boucle ne fait rien. texteGreffe est exporté pour le test.
2. **histoire.js disait « une copie exacte du champion » même pour une greffe passée par la voie de repli.** C'était faux en G5 de l'essai. La phrase devient « (le champion du moment, recopié avec des interrupteurs forcés) ».
3. **Le test.** greffes.test.js a 2 contrôles de plus, donc 70 au lieu de 68 :
   - l'événement redit à la reprise est identique pour une greffe directe ;
   - il est identique aussi en voie de repli sans remutation (contrôlé sur les 120 tirages).
4. **La note** ml/evolution/notes/greffes.md est complétée :
   - la règle de la reprise, de la liste modifiée et de immigres 0 ;
   - la phrase du récit corrigée ;
   - une section « En vraies courses » avec les commandes et les chiffres ;
   - les suites et leurs chiffres ;
   - le « non vérifié » mis à jour.

## CE QUI EST PROUVÉ, ET LA PREUVE
Dossier : <dossier temporaire>\scratchpad\greffes\rev\

**Comment j'ai lancé le code de HEAD.** `git show 46842ee77:ml/evolution/evoluer.js` est recopié dans evoluer-head.js. Ses require('./…') et son __dirname y sont rendus absolus, il lit donc les mêmes modules. La config est cfg-sans.json, c'est-à-dire config-essai.json sans ses _notes. Chaque lancement : `--etat <dossier> --travailleurs 2`. La comparaison se fait avec comparer.js, qui retire dates et durées.

1. **Identité sans la clé, en vraies courses.** Trois générations (0, 1, 2 ; 56 courses), avec HEAD puis avec le nouveau code, sur deux états vides :
   - population.json, generations.jsonl (3 lignes), courses-*.jsonl (56 lignes), morts.jsonl (4), validations.jsonl et coffre.jsonl sont IDENTIQUES ;
   - pilotes/ : 8 fichiers identiques à l'octet ;
   - le générateur est le même (3453687662) et les identifiants aussi ;
   - le journal ne diffère que par l'ordre d'arrivée de 2 courses jouées en parallèle ;
   - les pages ne diffèrent que par les heures, les durées et le débit.
   - Résultat écrit dans comparaison-sans-greffes.txt.
   - Réserve : ce passage a tourné avant mes deux retouches. Elles ne touchent que des lignes qui ne s'exécutent qu'avec une greffe. Le test R (contre 46842ee77) a été refait après : 70/70.
2. **Avec les greffes [{bordOn:1},{slalomOn:1},{bordOn:1,slalomOn:1}], 5 générations** (état etat-greffes ; le champion est resté le témoin 19e3767cc346) :

   | Génération | Enfant | Ce qui est né |
   |---|---|---|
   | G1 | e0131036d529 | greffe bordOn=1, aucune autre mutation |
   | G2 | a886019a3ca4 | greffe slalomOn=1 |
   | G3 | 9c7a96ea7efa | greffe bordOn=1 + slalomOn=1 |
   | G4 | 009059dc0b26 | immigré ordinaire, 10 gènes |
   | G5 | b2905fe1417b | greffe bordOn=1 par la voie de repli (copie de G1 déjà vue), 4 gènes mutés en plus |

   - Le texte de chaque pilote greffé (pilotes/*.js) ne diffère de celui du témoin que par bordOn:1 et/ou slalomOn:1 et le nom du génome.
   - Chaque greffé a joué toutes ses courses, toutes mesurées : 6 pour ceux de G1 à G3, 3 pour celui de G5. Sur la graine 939822, e0131036 fait palier 1 et le témoin palier 2 : bordOn agit.
   - Le champ greffe est dans population.json et dans les naissances de generations.jsonl. mutes contient les gènes greffés, avec leur avant et leur après.
   - tableau.html, arbre.html, histoire.md et resume.txt se construisent à chaque génération. Aucune « object Object » ni « undefined » de plus que sans greffe.
   - histoire.md dit « Dont 1 né par greffe … » et traduit les 4 événements.
3. **La reprise.**
   - On part d'une copie de l'état à la fin de G0. Un STOP est posé pendant les courses de G1 (la génération à greffe), puis on relance.
   - Comparé au passage sans arrêt, c'est identique : population.json, courses (38 lignes), morts, validations, coffre et pilotes/.
   - La ligne de G1 dans generations.jsonl est identique hors dates, durées et compteurs de courses (9 jouées + 9 du cache).
   - Avant mon correctif, l'événement de la greffe manquait. Après, la ligne est identique : reprise-verdict.txt (« evenements egaux true »).
4. **Les cas tordus.**
   - **Gène « choix »** : dessousDecor forcé à 0 ou 2 donne un génome valide. À 1, la valeur du témoin, dejaPorte est vrai, donc on passe par le repli.
   - **Champion déjà porteur** : c'est le repli du test, réussi 120 fois sur 120, et G5 en réel.
   - **idDe** ignore le champ greffe : vérifié.
   - **immigres 0** : charger() écrit bien « greffes : la config en demande, mais "immigres" vaut 0 : aucune greffe ne sera faite… ».
   - **État ancien** : tests/etat-e93ff5cb5, sans aucun champ greffe, a été recopié. tableau.js, arbre.js et histoire.js tournent (code 0), et histoire.md est identique à celui de histoire.js de HEAD (hors heure).
   - **Liste modifiée entre deux lancements** : le cycle ne dépend que de G et de n, rien n'est gardé. La génération suivante prend l'essai qui tombe à son rang dans la nouvelle liste : un essai peut être sauté ou répété, rien ne casse. Une génération déjà commencée garde ses enfants. Je le juge acceptable, et c'est écrit dans la note.
5. **Le style.** Aucun // dans les lignes ajoutées. Les sections s'ouvrent par /* ===== … (28/11/2026, greffes…) ===== */. Le texte est en français.

**Les suites, relancées une par une avec le code final, toutes code 0 :**
- greffes 70/70 ;
- generation 16/16, machine-relecture 19/19, machine 45/45, mesure-tau 75/75, node-epoque 14/14 ;
- portage 11/11, robustesse 8/8, validation-sequentielle 25/25, tableau 72/72 ;
- relecture-traces 95/95, traces 87/87, integration 29/29, lanceurs 76/76, commun 16/16, graines 13/13.
- Les sorties sont dans rev\suites\.

## CE QUI RESTE NON VÉRIFIÉ
- Rien n'a tourné sur le Ryzen ni avec la vraie config (12 graines, 20 pilotes).
- Dans l'essai, le champion n'a jamais changé : une greffe sur un champion sacré n'a été vue qu'au test sans course.
- Le repli avec remutations (plusieurs doublons de suite) n'a été vu qu'au test sans course.
- evoluer.test.js (environ une heure) et identite.test.js n'ont pas été relancés.
- Le passage réel « identité sans la clé » date d'avant mes deux retouches (voir la réserve plus haut).
- INTERFACES.md et README.md ne parlent pas encore des greffes. À la fusion, il faut y ajouter :
  - la clé de config "greffes" ;
  - le champ greffe des vivants et des naissances ;
  - la règle du cycle ;
  - l'événement redit à la reprise.
- Limites laissées telles quelles (écrites dans la note) :
  - la fiche de l'arbre dit « immigré : une copie très changée » pour un enfant greffé ;
  - morts.jsonl ne garde pas le champ greffe ;
  - mesure-tau range les greffes avec les immigrés ;
  - le nombre de remutations est perdu à la reprise.
- Défaut ancien, hors greffes, non corrigé : les autres événements des naissances (enfant abandonné, alerte des graines) se perdent toujours après un STOP au milieu d'une génération.

## FICHIERS À ENREGISTRER
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\greffes.js (nouveau)
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\evoluer.js (modifié)
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\histoire.js (modifié)
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\tests\greffes.test.js (nouveau)
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\evolution\notes\greffes.md (nouveau)

Ne pas enregistrer : ml/bot/results/note-essai-main-allege-t120-parties.json (là avant le chantier) et config.json (non touché, la clé est à mettre à la fusion).
