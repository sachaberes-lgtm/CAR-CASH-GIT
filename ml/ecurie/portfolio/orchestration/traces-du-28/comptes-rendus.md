# Les traces du 28/11 au matin (le chapitre du jour, les orchestrations de la nuit) : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `traces-du-28-novembre` (wf_e7c9c530-0ea), lancée par la session principale (Claude Fable).
- Agents : 4, tous du modèle claude-opus-5-5.
- Durée : 17 min ; jetons consommés par les agents : 761 477 (0,76 millions) ; appels d'outils : 178.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. rédacteur du chapitre du 28/11 : écrit la nuit du 27 au 28/11 et le matin du 28/11 dans le journal de bord (phase « Ecrire »)
2. rédacteur des traces des orchestrations : range les quatre travaux de la nuit avec l'outil orchestration.js (phase « Ecrire »)
3. vérificateur du chapitre du 28/11 : recontrôle chaque chiffre, date et citation, et corrige le fichier (phase « Verifier »)
4. raccordeur : met à jour le sommaire, le lexique, ETAPES.md et PASSATION.md (phase « Raccorder »)

## 1. ecrire:2026-11-28

*Rôle : rédacteur du chapitre du 28/11 : écrit la nuit du 27 au 28/11 et le matin du 28/11 dans le journal de bord. Phase : Ecrire.*

### Résumé

J'ai écrit le chapitre C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28.md. Il suit MODELE-D-ENTREE.md et fait environ 1 800 mots, en comptant les identifiants de commits et le texte de l'image. Il n'est pas commité, et je n'ai touché à aucun autre fichier.

Il couvre la nuit du 27 au 28/11 et le matin du 28 :
- **L'installation sur le Ryzen.** Les messages de Sacha de 23:22 et 23:35 UTC, dont « j'accepte l'envoi horaire de l'histoire sur GitHub ». Puis les deux défauts qu'il signale (le Node, la limite de 72 heures), le banc à 10 courses à la fois, la génération 0 à 418 courses à l'heure et le dernier envoi à 2 h.
- **Le bilan de la boucle payante.** 88 versions pour 21,61 €, cinq sacres, un seul grand saut (c0064). Le chapitre renvoie à l'image boucle-payante-lignee-clair.svg.
- **L'erreur de Claude, dite simplement.** À 0 h 23, il répond « Oui, c0101 doit devenir le point de départ ». À 0 h 39, il voit que les quatre derniers champions jouent les mêmes courses de validation et fait rejouer les pilotes sur le coffre.
- **Le verdict du coffre, sans l'adoucir.** L'agent de la mesure s'était arrêté à 10 graines sur un verdict que son relecteur a jugé non soutenu. Sur les 40 graines, l'écart est de +0,03 palier [−1,18 ; +1,38]. La « malédiction du gagnant » est expliquée en mots simples.
- **Le mur du hasard.** Une course varie de 3,26 paliers, l'écart vrai entre mutants est de 0,32. Le chapitre dit ce que cela change à la méthode : des changements de structure, écrits comme des gènes éteints à la naissance et jugés un par un. Il cite deux phrases de Claude, « les deux méthodes butent sur le même mur » (3 h 05) et « le juge gratuit qui les trie » (1 h 28).
- **Le reste de la nuit.** Les gènes v:3 (121 gènes), les changements sûrs (le sacre séquentiel), et le banc des gènes expliqué avec ses limites.

Le banc des gènes n'est pas fini : à 7 h 26, jouer.log en est à 705 courses sur 1 250, environ trois heures restantes selon le programme, et sorties/resume.txt n'existe pas. Le chapitre ne donne donc aucun résultat.

J'ai relancé l'outil paroles.js sur une copie de la conversation, dans le scratchpad, hors git. Il ne trouve aucun message de Sacha après 23:35 UTC le 27/11.

Le chapitre ne nomme ni le PC ni l'assistant (seulement « l'assistant de Sacha sur le Ryzen »), ne parle d'aucune école et ne contient aucune clé ni adresse.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28.md

### Problèmes

- L'usage de l'abonnement (18 % à 23 h 16, 27 % à 7 h 25) ne figure dans aucun fichier du dépôt. Sa seule source est les messages de Claude à Sacha dans la conversation, et le chapitre le dit. Les heures de ces messages diffèrent un peu de celles de la consigne (23 h 15, 7 h 20).
- Le dossier ml/ecurie/etude/prochaines-idees n'existe pas encore. Le chapitre ne dit de cette étude que ce qu'en dit le message de Claude de 7 h 25 : onze agents, en cours, rien sur le disque.
- Le banc des gènes compte 13 pilotes : le départ c0025 et 12 variantes. La consigne parlait de « 13 variantes » ; le chapitre suit le LISEZ-MOI du banc.
- Le chapitre fait environ 1 800 mots en comptant les identifiants de commits et le texte de l'image ; sans eux, il est sous la limite.
- Je n'ai pas fait ce que MODELE-D-ENTREE.md demande d'ordinaire en plus du chapitre, car la consigne était de n'écrire que ce fichier : ajouter au registre des impasses du LISEZ-MOI la ligne « boucle payante validée sur 20 graines réutilisées », ajouter le chapitre à la table des matières, et mettre au LEXIQUE les mots « malédiction du gagnant », « banc des gènes », « sacre séquentiel » et « différence appariée ».

## 2. traces:orchestrations

*Rôle : rédacteur des traces des orchestrations : range les quatre travaux de la nuit avec l'outil orchestration.js. Phase : Ecrire.*

### Résumé

Les traces des quatre équipes d'agents de la nuit sont rangées dans le dépôt. Rien n'est commité.

Dans l'outil ml/ecurie/portfolio/outils/orchestration.js, j'ai ajouté les quatre travaux à TRAVAUX :
- traces-du-soir (wf_2c24b21c-ec9) ;
- reglage (wf_f29df098-2f4) ;
- portage (wf_a57ffbdc-230) ;
- changements-surs (wf_adf7db90-3c8).

Chaque travail a son titre en mots simples et le rôle de chaque agent, tiré des étiquettes et des phases des scripts. Pour ces quatre travaux seulement (drapeau « nouveau »), l'outil fait trois retouches : « Réussi : oui / non » au lieu de « Passe : true / false », des noms de champs en français pour les études, et les accents remis dans les noms de lots (« tri précoce », « lignée », « règles »).

J'ai lancé l'outil trois fois. Les fichiers des quatre travaux déjà rangés (construction, journal, images, finitions) sortent à l'identique : git diff est vide sur leurs dossiers.

Nettoyage sur les travaux de la nuit : 6 remplacements, tous dans traces-du-soir :
- 3 noms de PC, qui sont des noms d'exemple (le-xeon, le-xeon) ;
- 2 chemins temporaires ;
- 1 détail familial.

J'ai aussi cherché à la main les clés, jetons, adresses e-mail, AppData, les noms de PC et « assistant ». Rien ne sort, et l'assistant du Ryzen n'est nommé nulle part : aucune règle de nettoyage de plus n'a été nécessaire. Les comptes rendus sont complets : 4, 11, 9 et 7 agents, chacun avec son texte.

Les jetons, recontrôlés dans les bilans workflows/<identifiant>.json :
| Travail | Agents | Jetons | Durée | Appels d'outils |
|---|---|---|---|---|
| traces-du-soir | 4 | 782 967 | 16 min | 260 |
| reglage | 11 | 2 604 327 | 2 h 11 | 619 |
| portage | 9 | 1 819 083 | 1 h 26 | 542 |
| changements-surs | 7 | 1 986 602 | 5 h 03 | 597 |
| **Total de la nuit** | **31** | **7 192 979** | | **2 018** |
| **Total des huit travaux** | **84** | **16 493 721** | | **4 198** |

Ces nombres redonnent ceux que la session principale avait en mémoire.

ml/ecurie/portfolio/orchestration/LISEZ-MOI.md est mis à jour :
- le titre, l'introduction et le tableau avec sous-totaux et total ;
- un paragraphe de contexte daté sur la nuit (commit de Sacha à 0 h 12, démarrage du Ryzen à 0 h 29, 418 courses à l'heure, fusion 7f9543955) ;
- les sections 5 à 8, avec le but, l'équipe, ce que les relecteurs ont trouvé et ce que la session principale a fait après ;
- la leçon de méthode, et le banc des gènes, qui tourne encore (708 courses sur 1 250 à 7 h 26, la dernière ligne lue) ;
- sept nouveaux points dans « Ce que cette méthode ne garantit pas » ;
- la façon dont le dossier est fait.

Les impasses et les erreurs de Claude y sont dites :
- **Le verdict du coffre** : +0,03 palier [−1,18 ; +1,38] sur 40 graines neuves, pour 21,61 EUR.
- **L'agent de la mesure** a été arrêté après 20 courses sur 164, avec un verdict « c0064 » que son relecteur a réfuté.
- **Deux lots lancés en même temps** par la consigne de la session principale : le portage a changé modele.js, qui entre dans l'époque, pendant que la mesure jouait ses courses. La consigne suivante l'interdit.
- **Deux faits inexacts dans la consigne des traces du soir** : « vers 19 h 40 » au lieu de 19 h 33, et « 7 agents » au journal au lieu de 16.
- **Le même piège dans le simulateur** : un gain de +0,31 choisi et jugé sur les mêmes mondes, qui tombe à +0,05 sur des mondes neufs.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\outils\orchestration.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\traces-du-soir\script.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\traces-du-soir\comptes-rendus.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\reglage\script.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\reglage\comptes-rendus.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\portage\script.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\portage\comptes-rendus.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\changements-surs\script.js
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\orchestration\changements-surs\comptes-rendus.md

### Problèmes

- Le nom d'une école existait déjà dans un fichier déjà rangé que je n'avais pas le droit de modifier, ml/ecurie/portfolio/orchestration/journal/comptes-rendus.md (le compte rendu du critique ; le vérificateur des traces du soir l'avait déjà relevé et laissé). Les nouveaux fichiers disent seulement qu'une école y est nommée, sans la nommer. À retirer par la session principale si Sacha le veut.
- La part de l'abonnement (27 % à 7 h 20) n'est pas écrite : je n'en ai pas retrouvé la source sur le disque.
- Le banc des gènes n'est pas fini : 708 courses sur 1 250 à 7 h 26, la dernière ligne lue (723 à 7 h 31). Je n'ai donné aucun résultat. Le LISEZ-MOI date son journal de 3 h 28 (sa première ligne), et non de 3 h 35.
- Les deux orchestrations du 28/11 au matin (prochaines-idees wf_b84c1055-e3c, traces-du-28-novembre wf_e7c9c530-0ea) n'ont pas encore de bilan : elles ne sont pas rangées. Le LISEZ-MOI le dit.
- Le texte « C--Users-sacha-AppData-… » reste tel quel dans traces-du-soir/comptes-rendus.md : c'est un nom tronqué, ce n'est pas un vrai chemin. La règle de l'outil ne l'attrape pas parce qu'il est suivi de « … ».

## 3. verifier:2026-11-28

*Rôle : vérificateur du chapitre du 28/11 : recontrôle chaque chiffre, date et citation, et corrige le fichier. Phase : Verifier.*

### Résumé

J'ai vérifié le chapitre C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28.md et corrigé le fichier directement. Rien n'est commité et aucun autre fichier n'a été modifié.

**Ce qui est confirmé à la source :**
- **Heures des commits** : 7f9543955 à 0 h 36, 1f64c426b à 1 h 28, 7b1df608e à 2 h 08, 00fb4cfad à 3 h 04, 3b1bf15e5 à 7 h 20, 2a3bea3c1 à 7 h 22, b1ff8af89 à 0 h 12. Dernier envoi du Ryzen : 71e7c7c2c à 2 h 00.
- **Branche evolution-ryzen** (machine.json et resume.txt) : 10 courses à la fois, 418 courses à l'heure, 280 courses en 40 minutes.
- **Le coffre** (coffre/sorties/resume.txt) :
  - c0064 contre c0025 : +0,03 [−1,18 ; +1,38] ; c0101 contre c0025 : +0,03 [−1,18 ; +1,23].
  - Sur la validation : +2,00 [+0,75 ; +3,40].
  - c0101 et c0064 jouent 34 courses sur 40 à l'identique.
  - Quatre contrôles Xeon/Ryzen identiques.
- **Boucle payante** (boucle-payante-ryzen/LISEZ-MOI.md) :
  - 88 versions, 21,61 €, 58,53 € au total.
  - Validation de c0025 à 4,80, de c0064 à 6,80.
  - Notes −6,23, −6,06, −2,35 et −1,15, confirmées aussi par le texte de l'image SVG.
- **Étude du réglage** : 3,26 paliers, qui est bien un écart-type (effets/LISEZ-MOI.md) ; 0,32 [0 ; 1,07] ; « 80 ou 90 % de hasard » ; 0 mutant sur 25 nettement meilleur ou pire.
- **LIVRAISON-REGLAGE.md** : sacre séquentiel de 24 à 96 courses ; 15 → 33 sur 100 ; génération 90 ; § 5.
- **Banc des gènes** : lancé à 3 h 28 (jouer.log) ; 13 pilotes ; 1 248 + 2 courses ; « une chance sur deux ».
- **Messages de Sacha** : j'ai relancé paroles.js sur une copie de la conversation, dans le scratchpad, hors git. La citation de 23:22 UTC, « 13 commits », « depuis 00:29 » et les deux défauts sont confirmés. Aucun message de Sacha après 23:35 UTC.
- **Messages de Claude**, retrouvés dans la conversation :
  - « Oui, c0101 doit devenir le point de départ » et « trop grand pour n'être que de la chance » (0 h 23).
  - Les quatre champions identiques en validation (0 h 39).
  - « juge gratuit » (1 h 28).
  - « butent sur le même mur » et « telle quelle » (3 h 05).
  - 18 % (23 h 16), 27 % et 141 € (7 h 25).
- **Fichiers « à montrer »** : ils existent. Le SVG et coffre/sorties/resume.txt sont dans git ; banc-des-genes/ est hors git.
- **Données privées** : aucune trouvée (ni l'assistant de Sacha sur le Ryzen, ni identifiant de PC, ni clé, ni adresse, ni école).

**Corrections faites :**
1. « Vers minuit et demi » devient « Peu après minuit » : la boucle s'arrête à 0 h 12 et la sélection tourne depuis 0 h 29.
2. Une phrase d'impasse ajoutée dans « En une minute », sans l'adoucir. La boucle a coûté 21,61 € et plus de neuf heures de Ryzen (14 h 52 → 0 h 12), pour des champions qui ne vont pas plus loin que le pilote de départ. La vérification était trop petite et resservait à chaque fois. J'ai écrit « neuf heures » plutôt que « une nuit », comme le disait la consigne, parce que le journal de la boucle donne ces heures-là.
3. Une phrase ajoutée au même endroit à la fin du paragraphe du coffre : les 21,61 € n'ont pas acheté un meilleur pilote.
4. « son assistant sur le Ryzen » devient « l'assistant de Sacha sur le Ryzen ». « Un message rédigé avec cet assistant », qui n'avait pas de source, devient « un compte rendu de ce que fait l'assistant ». J'ai ajouté l'heure de Paris (0 h 22).
5. « Plus de deux fois le Xeon » n'avait pas de source exacte. La phrase devient « Le Xeon en jouait près de deux cents la veille (chapitre du 27/11) ».
6. **Erreur de fait** : « l'agent de la mesure s'est arrêté à 10 graines » était faux.
   - L'agent s'est arrêté après 4 graines, avec un verdict provisoire.
   - Son relecteur a joué 6 graines de plus et trouvé −1,20 palier sur ces 10 graines. C'est lui qui a jugé le verdict non soutenu.
   - « Claude a relancé la mesure en entier » devient « la session principale a fait finir la mesure sur les 40 graines ».
7. **Règle du sacre** : il fallait aussi battre le parent sur les 20 courses d'entraînement, pas seulement tenir en validation. J'ai aussi ajouté les dates de la boucle, et précisé « 15 générations (la dernière interrompue) ».
8. « fuir vite sous la route » était obscur. La phrase devient « sortir vite de sous la route ».
9. Le banc des gènes est mis à jour au dernier état : à 7 h 33, 725 courses sur 1 250, environ 177 minutes restantes. C'est corrigé dans le texte et dans le tableau.
10. Le § 5 de LIVRAISON-REGLAGE cite aussi la veille : « PC éteint ou en veille, ou envoi bloqué ».
11. Le mot « palier » est expliqué à sa première apparition.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28.md
- <dossier temporaire>\scratchpad\paroles-verif.md

### Problèmes

- Le banc des gènes n'est pas fini : sorties/resume.txt n'existe pas et jouer.log en est à 725 courses sur 1 250 à 7 h 33. Le chapitre ne donne donc aucun résultat.
- Le dossier ml/ecurie/etude/prochaines-idees n'existe pas encore. Le chapitre n'en dit que ce que dit le message de Claude de 7 h 25.
- Le pourcentage d'abonnement n'a pour seule source que les messages de Claude dans la conversation (18 % à 23 h 16, 27 % à 7 h 25), pas un fichier du dépôt.
- Il manque encore ce que MODELE-D-ENTREE.md demande en plus du chapitre : la ligne d'impasse dans le registre du LISEZ-MOI, l'entrée dans la table des matières et les nouveaux mots du LEXIQUE. Je ne l'ai pas fait, ce n'était pas dans ma consigne.

## 4. raccorder

*Rôle : raccordeur : met à jour le sommaire, le lexique, ETAPES.md et PASSATION.md. Phase : Raccorder.*

### Résumé

J'ai raccordé les quatre fichiers demandés au chapitre du 28/11 (C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\2026-11-28.md) et aux traces des équipes (portfolio/orchestration/LISEZ-MOI.md). Rien n'est commité, aucune course n'a été jouée et aucun autre fichier n'a été touché. Chaque chiffre vient d'une source que j'ai ouverte : coffre/sorties/resume.txt, les LISEZ-MOI du banc, de la boucle et du réglage, LIVRAISON-REGLAGE.md et LIVRAISON-C0101.md, les messages de commit, `git show origin/evolution-ryzen:...resume.txt` et machine.json, et jouer.log.

1. **journal/LISEZ-MOI.md**
   - « Le chantier en dix lignes » : les lignes 9 et 10 parlent maintenant de la sélection sur le Ryzen depuis 0 h 29 (champion = témoin à 2 h, plus rien ensuite), de la boucle payante jugée par le coffre et de la leçon de méthode.
   - La frise : une puce datée du 28/11 sur le mur du hasard, décidé par la session principale. Je précise que l'image s'arrête au 27/11 ; je n'ai pas le droit de la refaire.
   - Le registre des impasses : 9 lignes. La boucle payante (+2,00 sur la validation, +0,03 au coffre), c0101 comme point de départ (erreur de Claude), le verdict provisoire de l'agent, les petits réglages (3,26 contre 0,32), l'ancienne validation du sacre (15 sur 100), l'alarme de la malédiction, l'entraînement compté dans le sacre (53 à 62 %), le tri précoce, et « rejouer les jeunes et les 4 meilleurs » (+0,05 sur des mondes neufs).
   - Les décisions de Sacha à 23:22 et 23:35 UTC, et 7 lignes de chiffres.
   - Les pièces à montrer, recontrôlées avec `git ls-files` : la lignée SVG, boucle-payante-ryzen/ avec le coffre, reglage-de-la-selection/, banc-des-genes/ (hors git), LIVRAISON-REGLAGE.md et la branche evolution-ryzen. J'ai mis à jour la ligne de l'orchestration et celle du journal.
   - La table des chapitres : 2026-11-28.md et LA-VOIX-DE-SACHA.md.
2. **journal/LEXIQUE.md**
   - Nouveaux mots : banc des gènes, chance du gagnant (malédiction du gagnant), comparaison appariée, intervalle à 95 %, « les mutations comptent-elles ? » (τ), sacre séquentiel, session principale, tâche planifiée, validation.
   - Mots complétés : banc, boucle, champion (la vraie règle de la boucle), coffre, époque, gène éteint, génome (v:3, 121 gènes), mutation, Node (le Node fixe), sélection naturelle, témoin (c0025).
3. **ml/ecurie/ETAPES.md** : une section « La nuit du 27 au 28/11/2026 » en tête de « OÙ ON EN EST ». C'est l'endroit où le fichier met le plus récent. Elle dit ce qui a été fait, donne un tableau de chiffres sourcés, ce qui est écarté, la leçon de méthode et ce qui n'est pas fait. Les lignes C bis et S du tableau d'état sont mises à jour.
4. **ml/ecurie/PASSATION.md** : un nouveau titre daté et la section « L'état au 28/11/2026 au matin ».
   - Ce qui tourne : le banc à 744 courses sur 1 250 à 7 h 40, et le Ryzen muet depuis 2 h 00.
   - Ce qui est poussé : origin/bots-ecurie = 2a3bea3c1. La liste de ce qui n'est pas commité.
   - La mise à jour du Ryzen (§ 5 puis § 4), les décisions prises, les décisions qui attendent Sacha et l'ordre des tâches.
   - Les règles qui tiennent toujours, reprises et complétées : une seule mesure lourde à la fois, des graines neuves et une comparaison appariée.
   - Le worktree CASH-CAR-evolution-essai à retirer un jour, et le texte à coller.
   - La partie du 27/11 est gardée sous un titre « gardé pour l'histoire », avec une mention « périmé en partie » qui dit précisément ce qui ne tient plus.

**Choix que j'ai faits.** Je ne nomme l'école nulle part ; je dis seulement dans quels deux fichiers elle apparaît. Sur les prochaines idées, je n'écris que l'heure de leurs deux fichiers et l'absence de bilan, rien de leur contenu. Le pourcentage d'abonnement est donné avec sa seule source : les messages de la session principale.

### Fichiers

- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LISEZ-MOI.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\portfolio\journal\LEXIQUE.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\ETAPES.md
- C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie\PASSATION.md

### Problèmes

- Le chapitre 2026-11-28.md dit que les tâches de 72 heures ne sont « pas encore » corrigées sur le Ryzen. Or ml/evolution/notes/LIVRAISON-C0101.md § 3, geste 5, dit que les trois tâches posées à la main sur le Ryzen sont « déjà sans limite de durée ». Le LEXIQUE suit LIVRAISON-C0101. Le chapitre est à corriger par la session principale : je n'avais pas le droit d'y toucher.
- Le banc des gènes n'est pas fini : 744 courses sur 1 250 à 7 h 40, environ 172 minutes restantes d'après jouer.log, et sorties/resume.txt n'existe pas. Aucun résultat n'est écrit nulle part.
- ml/ecurie/etude/prochaines-idees/ s'est rempli pendant que j'écrivais : LISEZ-MOI.md à 7 h 35, candidats.json à 7 h 37. L'équipe n'a pas de bilan, et j'ignore si sa relecture est faite. Je n'en cite pas le contenu. Le chapitre du 28/11 dit encore « rien n'est encore sur le disque » : c'est devenu faux.
- L'image de la frise (journal-frise-*.svg) s'arrête au 27/11. Le virage du 28/11 n'est que dans le texte du § 2. Il faudrait refaire l'image avec figures-journal/frise.js, ce qui n'était pas dans ma part.
- Le pourcentage d'abonnement (18 % puis 27 %) et les 141 € n'ont pour source que les messages de la session principale (pour les 141 € : 200 − 58,53 du commit b1ff8af89). Ce n'est écrit dans aucun fichier du dépôt.
- Il existe un autre worktree ancien, C:\Users\sacha\code\CASH-CAR-bots-banc (détaché à 442c9aa38, du 24/11). Il n'est pas dans la consigne, je ne l'ai pas mentionné : le banc des gènes tourne bien dans CASH-CAR-bots-ecurie.
- Rien n'est commité : le chapitre du 28/11, ces quatre fichiers, portfolio/orchestration (les nouveaux dossiers, LISEZ-MOI.md et outils/orchestration.js) et etude/banc-des-genes/ attendent un commit de la session principale.
