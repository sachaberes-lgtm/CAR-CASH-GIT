# Du 21 au 27/11/2026 — Comment on a travaillé : Sacha, Claude et les agents

**En une phrase.** Sacha fixe le but, joue les parties qui servent de barre et corrige la méthode quand elle dérape. Claude écrit le code, mesure et propose. Des « agents » (d'autres sessions de Claude, lancées pour une seule tâche) font une partie du travail, et presque chaque règle de travail est née d'un raté.

## En une minute

On voulait des bots qui jouent comme de vrais joueurs.
Sacha fixait le but et jouait les parties de référence. Claude écrivait et mesurait. D'autres sessions de Claude faisaient des tâches à part.
Presque chaque règle de travail est née d'une erreur : 152 sessions lancées à la chaîne ont vidé l'abonnement ; Claude posait des questions au lieu d'avancer ; il suivait son plan sans le remettre en cause.
Des relectures croisées ont montré qu'un progrès apparent n'était que du hasard.
Sur cet ordinateur, 36,92 € ont été dépensés sur 200, sans progrès confirmé.
Le 27 novembre, Sacha a décidé de changer de méthode : un apprentissage par sélection qui tourne seul, sans rien payer.

Les heures des messages de Sacha sont en heure UTC. Celles des commits sont celles de Paris, une heure de plus. (Git est le registre qui garde chaque version du code ; un « commit » est une de ses entrées, désignée par un court code de lettres et de chiffres.)

## Le principe

Le plan d'origine (`passation/BOTS-ML.md`, daté du 21/11 en tête, entré dans git le 22/11 : `d2ee1f114`) tient en une ligne : « Claude écrit le cerveau du bot, le vrai jeu le note, Claude lit les échecs et réécrit. » Le « cerveau » est un fichier de code qui décide des touches. Le « vrai jeu » tourne sans écran sur le PC de Sacha. Une « graine » fixe le hasard d'une course : même graine, même course.

La section 6 du plan répartit les rôles :
- le crédit d'API (un compte payé à l'usage) pour la boucle automatique seulement ;
- l'abonnement Claude pour tout le code du labo ;
- Grok, un autre assistant, en « critique extérieur des rapports, à la main » (non vérifié qu'il ait servi : aucune source ne le montre) ;
- le PC de Sacha qui note les cerveaux la nuit.

Dans les faits :
- **Sacha décide et joue.** Il a fixé le but le 24/11 (des bots « qu'on ne puisse pas faire la différence entre eux et des vrais joueurs », `PLAN.md`). L'étalon, c'est-à-dire les parties de vrais joueurs qui servent de barre, compte 14 parties sur les 20 prévues, donc une barre « provisoire » : 10 de Sacha au clavier, 4 de son frère Léo au doigt (`BOTS-ML.md`, au 24/11). Sacha ne code pas.
- **Claude écrit et mesure.** Depuis le 22/11, 50 commits touchent `ml/`. Leur signature dit quel modèle les a écrits : 33 Fable 5.2, 7 Opus 5.5 (Fable, Opus, Sonnet et Haiku, cités plus bas, sont des versions de Claude), 6 « Claude » (les agents sans écran), 4 sans signature (les commits automatiques de la boucle).

## Les règles, et d'où elles viennent

- **Un compte rendu à chaque fin de session.** Le 24/11 à 19:41, Sacha demande d'utiliser « tous les 200 crédits API en 2 semaines » et, à chaque fin de contexte, « un petit compte rendu esthétique et testable ». Deux comptes rendus existent (`comptes-rendus/compte-rendu-01.html`, `-02.html`), tous deux du 25/11 (`a35ece70f`, `cfeef13b2`) ; aucun n'a suivi les 26 et 27/11. TENUE DEUX FOIS, PUIS LAISSÉE.
- **Une note de passation pour reprendre.** Le 26/11 à 11:56 : « j'ai récupéré mon abonnement Fable, fais-moi une note de passation pour reprendre où tu en étais ». Elle entre dans git à la même minute (`ecd9eeccd`, 12 h 56 à Paris, soit 11:56 UTC) : `ml/ecurie/PASSATION.md`, l'état exact et comment relancer. GARDÉE.
- **Le travail lourd se paie sur la clé d'API, jamais sur l'abonnement.** Le 25/11 à 12:27 : « […] tu as utilisé tout mon Fable sans toucher au crédit API, reprends le travail de Fable avec les crédits API ». Selon `PASSATION.md`, un « workflow » (un programme qui lance des agents en série) de 152 agents avait vidé l'abonnement. À 12:29, deux messages : « la réinitialisation de Fable arrive dans 24 heures, organise-toi pour ne pas t'arrêter d'ici là » et « là, il reste 7 % de mon abonnement ; je t'avais demandé d'utiliser les tokens pour ça justement ». La même minute, un premier essai de la clé est inscrit au journal des dépenses (12:29 UTC, 0 €) ; `agent-api.js` entre dans git à 13 h 31, heure de Paris (`29c4e8c8c`). Il lance une session sans écran (qui tourne seule, sans fenêtre) qui ne lit que la clé d'API, la coupe si elle ne se paie pas par la clé, et inscrit son coût au journal, sous un plafond général de 200 €. GARDÉE.
- **Finir ce qu'un autre a commencé, sans bâcler.** Le 25/11 à 13:00 : « occupe-toi toi-même de clôturer le travail amorcé ici sans bâcler le travail débuté par Fable ». Un agent Opus contrôle alors le premier pilote (un cerveau de bot) écrit par l'agent Fable (rapport `finitions-b`). GARDÉE.
- **Mesurer tout l'écart avant de corriger.** Le 26/11 à 12:00, Sacha trouve les bots « encore trop frileux de s'envoler ». Claude allait traiter ses seules trois remarques (mémoire `inventaire-complet-avant-de-corriger.md`). À 12:11, Sacha écrit : « ça, c'est le genre de choses auxquelles tu aurais dû penser ; lance une sous-session enquête : tous les éléments à ajouter aux bots pour simuler de vrais joueurs ». À 12:13 : « et si tu as besoin, je peux t'enregistrer d'autres parties, bien sûr ». L'enquête `etude/realisme.md` trouve 26 écarts (`PASSATION.md`). GARDÉE.
- **Ne pas demander « je continue sur quoi ? ».** Le 26/11 à 15:47 : « ne me pose pas ce genre de question, travaille en autonomie ». Son fichier de consignes pour Claude le disait déjà depuis le 24/11 (« Ne t'arrête pas pour lui demander un clic ou un choix sans risque »). Claude note : « j'ai quand même posé la question trois fois » (mémoire `pas-de-question-quelle-suite.md`). Le 27/11 à 13:40 : « continue sans t'arrêter » ; à 14:07 : « il ne faut pas que tu t'arrêtes comme ça, hein ; tu ne finis que quand tu penses avoir besoin que je prenne une vraie décision ». GARDÉE.
- **Tout consommer, sans tomber à sec.** Claude avait compris le « gère bien ta consommation » du 26/11 comme « économise » (mémoire `budget-tout-consommer.md`). Le 24/11 à 19:43, Sacha avait activé le mode « ultra code » (un réglage qui permet à Claude de lancer des agents en série). Le 27/11 à 14:25 : « gère mieux l'abonnement, tu utilises trop Fable par rapport à Opus » ; puis à 14:31 : « mais je t'ai mis en ultra code, c'est pas le but justement », puis à 14:33 : « pourquoi j'ai besoin de te dire ça, ton plan de base avait jugé ça inutile ? ». Claude en tire : des agents par vagues mesurées, « pas un essaim de 152 » (`ecurie-argent-et-lancement-des-agents.md`). À 14:34, il précise : « il faut juste que tu gères bien tout pour cramer 100 % de la semaine […] et les 200 crédits API ». GARDÉE.
- **Ne plus dérouler un plan.** Le 27/11 à 15:25, Sacha écarte le plan de Claude : il veut un système « où le bot le moins bon est viré », qui « apprend sur mon Ryzen en automatique sans token ou abonnement, juste par sélection naturelle ». À 15:40 : « pourquoi on n'a pas fait ça dès le départ ? » À 15:42 : « il faut que tu arrêtes de suivre les plans ; à chaque étape il faut une réflexion où tu te demandes quelle est la meilleure méthode ». Claude écrit ensuite dans sa mémoire : « j'ai suivi pendant deux jours le plan d'origine […] C'est lui qui a dû le proposer » (`remettre-la-methode-en-question-a-chaque-etape.md`). GARDÉE.
- **Garder des traces.** Le 27/11 à 17:14 : « oublie pas aussi qu'il faut qu'on garde des traces de tous les process, pour un portfolio ». Cinq minutes plus tard (`033bfebeb`, 18 h 19 à Paris), l'étude du jour est copiée dans git : elle vivait dans un dossier que git ignore. GARDÉE.

## Les garde-fous techniques

- **« Le jeu ne change pas. »** La formule termine les messages de commit du chantier. Les agents n'ont le droit de toucher ni au code du jeu ni à `VERSION PRINCIPALE/` (`consignes-agents/pilote.md`).
- **Une course, un processus neuf.** Un programme relancé à zéro pour chaque course : c'est ce qui garantit qu'une même graine redonne la même course (`ml/bot/README.md`). Un processus réutilisé a donné deux empreintes différentes pour la même graine (`SPECIFICATION.md`, § 2).
- **`verifier.js` et son empreinte.** Ce contrôle relance le contrat du bot (la règle que tout cerveau suit : dix fois par seconde, il reçoit ce que voit la voiture et rend un ordre) dans 33 processus neufs. Il rend une « empreinte » (un résumé chiffré des courses). Elle vaut `a7b3171768ca` depuis l'étape 1, le 23/11 (`3317b893a`), et doit rester égale tant que rien ne doit changer (`ETAPES.md` ; `49012f2d9` : TOUT PASSE, 691 s).
- **Validation sur graines neuves.** Un champion n'est sacré qu'après 20 graines neuves (jamais utilisées pour le tri, le premier classement des variantes), contre la barre de son parent (le cerveau dont il est la variante) sur ces mêmes graines (`ETAPES.md`, C bis).
- **Rien n'entre au labo (le registre des cerveaux notés) sans raison écrite.** `inscrire.js` refuse un cerveau sans la phrase qui dit ce qui change et pourquoi (`ml/labo/README.md`).
- **La main est fixée.** Une variante qui change le profil de la main (les réflexes du bot) est refusée avant d'être notée, et payée quand même (`CONSIGNES.md`).
- **La clé n'est jamais affichée ni écrite** (`agent-api.js`, en tête). Les agents n'ont pas le droit de pousser sur GitHub (envoyer le code sur le serveur en ligne) (`ETAPES.md`).

## Les vérifications croisées

- Le 24/11, 28 défauts du travail d'avant, trouvés par 4 relecteurs (Opus) et « chacun contesté par un sceptique qui a relu le code » : un second agent chargé de les réfuter (`67ea1f009`, en-tête de `etude/defauts-confirmes.md`). 24 sont corrigés par des agents ; Claude n'a refait lui-même que trois contrôles, et le commit le dit (`1528cecf2`).
- Le 25/11, l'agent Opus relit le pilote de l'agent Fable : « aucune vraie erreur ». Il le renote sur 8 courses : palier médian 11,5 contre 7 pour le bot de référence (le palier est le niveau atteint pendant une course, le médian est la valeur du milieu ; le bot de référence est celui écrit à la main au départ, le point à battre). Ce sont les mêmes courses que dans la note de Fable (rapport `finitions-b`) : un contrôle du calcul, pas une mesure sur graines neuves.
- Le même jour, le seul gain du calibrage (l'essai des quatre modèles) ne tient pas : la variante de Sonnet, 13,5 au tri, retombe à 10,5 contre 11 pour son parent sur graines neuves. L'agent du choix du modèle le classe « exactement l'ampleur du hasard » (rapport `choix-modele`).
- Le 27/11, quatre enquêtes d'agents Opus, chacune relue par un vérificateur qui a refait les mesures (`PROPOSITIONS.md`) ; la spécification (le cahier des charges) de la sélection naturelle est écrite par un agent Opus et relue par Fable (`LISEZ-MOI.md`).
- Le plan signale lui-même une consigne de dépense « sans poser de question » : « c'est une phrase écrite par une session, pas par lui » (`BOTS-ML.md`).

## Ce qu'on a appris

**Sur la méthode.** Le tri de la boucle payante se faisait sur 6 graines, et le palier médian y bouge d'environ ±2 paliers (rapport `choix-modele`). L'étude du bruit du 27/11 (34 pilotes × 24 graines) chiffre la fiabilité du palier sur 12 courses entre 0,35 et 0,44 (`SPECIFICATION.md`) : un indice de 0 à 1 qui dit si deux séries de courses classent les pilotes dans le même ordre (1 : toujours, 0 : aucun lien). Renvoyer le dernier d'une seule manche, dit la spécification, « c'est tirer au sort à 60 % ». C'est ce qui a fixé la règle du nouveau système : juger un bot sur toutes ses courses cumulées, jamais sur une manche. L'image « le bruit des notes », dans `2026-11-27.md`, le montre : les 24 courses de chaque pilote forment des nuages qui se recouvrent presque entièrement.

**Sur la sélection au hasard.** Le chantier l'avait déjà essayée avant novembre : `BOTS-ML.md` résume `ml/train` (« juillet → septembre ») par « après 300 générations : 0 figure, 9 % de poses réussies » (une génération est un tour de sélection : on garde les meilleurs, on remplace les autres par des copies modifiées ; les 9 % datent du 08/09 ; le run de 300 générations donne 39 % de poses, `5799d5bb1`), dans une copie du jeu qui avait divergé du vrai ; git garde des essais jusqu'au 20/10 (premier commit `ml/` le 07/09). La spécification du 27/11 ne repart pas de zéro : le réseau (de neurones : un petit programme dont les réglages s'apprennent) naît « greffé » sur le pilote écrit à la main, muet (au départ il ne change rien à ses décisions), et la sélection règle ce qui existe.

## Ce qui n'a pas marché

- **Le workflow de 152 agents** a vidé l'abonnement le 25/11 (`PASSATION.md`).
- **Le calibrage** a coûté 4,63 € pour aucun gain validé ; l'agent Fable 5.2 a perdu sa seule réponse, coupée à 32 000 jetons (1,91 €) ; les jetons sont les morceaux de texte qui mesurent la longueur d'une réponse et son prix.
- **La chaîne des deux semaines** (le programme prévu pour dépenser le crédit d'API par tranches sur deux semaines) n'a payé aucune tranche sur ce PC (`chaine-etat.json` : `"tranches": 0`). `chaine.log` montre une « tranche-1 » démarrée le 26/11 à 11:55 UTC ; le journal s'arrête pendant la note du pilote de départ, sans dépense (le total reste 36,92 €). Ensuite, elle n'est pas relancée : elle ne notait que le palier, et Sacha venait de refuser ce que ça produisait (`PASSATION.md`).
- **Claude ne peut pas lancer lui-même un agent payant** : le 26/11, l'app l'a refusé (mémoire `ecurie-argent-et-lancement-des-agents.md`). Sacha doit taper la commande. L'agent « voltige » est resté prêt, pas lancé (`1e148ee05`) : sa consigne existe, son rapport non.
- **Dollars ou euros.** Les rapports d'agents comptent en dollars, le journal en euros ; `agent-api.js` pose « 1 € compte pour 1 $ ». L'agent du choix du modèle le dit : « la facture de la console fait foi » (non vérifiée).
- **Des traces hors git** : l'étude du 27/11 jusqu'au soir ; encore aujourd'hui `paroles-sacha.md`, `chaine.log` et les récits complets des agents (`.jsonl`).

## Les décisions

- **Sacha** : toutes les règles ci-dessus ; en plus, la page portfolio et ses images (25/11, 19:00 et 19:07 : « des jolies photos techniques des simulations »), d'où les agents « portfolio » et « images » ; l'abandon de la vidéo du meilleur bot (27/11, 15:25 : « laisse tomber la vidéo »). Il lance lui-même la boucle sur le Ryzen (27/11, 13:40), puis demande à 15:42 : « du coup j'arrête les essais sur le Ryzen ? ». Claude répond non pour l'instant (d'après la conversation du 27/11) : la boucle payante continue jusqu'à la livraison du système de sélection, les deux ne pouvant pas se partager les cœurs du Ryzen ; Claude préviendra Sacha, avec la commande, au moment de basculer. Le résultat de cette boucle n'est pas vérifié ici.
- **Claude** : le choix de Sonnet 5.5 pour la boucle (agent Opus, 25/11) ; la répartition du budget, déléguée par Sacha (« tu gères ça comme tu veux », 27/11, 14:35).

## Les chiffres

Ce qu'on y voit : presque tout l'argent dépensé sur ce PC est parti le 25/11 en sept agents (32,29 € sur 36,92 €), et le calibrage n'a rien rapporté. « Outils » compte les actions d'un agent (lire un fichier, lancer un programme) ; « plafond » est la somme au-delà de laquelle il est coupé.

| mesure | valeur | source |
|---|---|---|
| dépensé sur la clé d'API (ce PC) | 36,92 € sur 200 € (26 lignes, toutes du 25/11 ; Ryzen non compté) | `ml/labo/journal/depenses.jsonl` |
| dont les 7 agents sans écran | 32,29 € | `depenses.jsonl` (somme des lignes « agent sans ecran ») |
| agent « essai » (Haiku 5.5) | 0,00 $, 0 outil : la clé et la facturation vérifiées | `agents/2026-11-25T12-29-14-essai.md` |
| agent « pilote » (Fable 5.2) | 11,63 $, 64 outils, plafond 25 $ | `agents/2026-11-25T12-31-34-pilote.md`, `chaine.log` |
| agent « finitions-b » (Opus 5.5) | 8,71 $, 134 outils, plafond 20 $ | `agents/…-finitions-b.md`, `chaine.log` |
| agent « compte-rendu » (Sonnet 5.5) | 0,34 $, 14 outils, plafond 2 $ | `agents/…-compte-rendu.md` |
| agent « choix-modele » (Opus 5.5) | 0,71 $, 17 outils, plafond 4 $ | `agents/…-choix-modele.md` |
| agent « portfolio » (Opus 5.5) | 3,83 $, 72 outils, plafond 6 $ | `agents/…-portfolio.md`, `portfolio-console.log` |
| agent « images » (Opus 5.5) | 7,07 $, 116 outils, plafond 10 $ | `agents/…-images.md`, `apres-images.log` |
| calibrage (19 appels, 4 modèles) | 4,63 €, aucun champion | `8610302d2`, `depenses.jsonl` |
| agents du workflow qui a vidé l'abonnement | 152 | `PASSATION.md` |
| une session principale sans agents, une après-midi | 3 à 4 % de l'abonnement de la semaine | `PASSATION.md` (26/11) |
| commits touchant `ml/` depuis le 22/11 | 50 (33 Fable, 7 Opus, 6 agents, 4 boucle) | `git log` |
| fiabilité du palier sur 12 courses | 0,35 à 0,44 | `etude/selection-naturelle/SPECIFICATION.md` |
| empreinte de `verifier.js` | `a7b3171768ca` | `ETAPES.md`, `49012f2d9` |

## Ce qu'on peut montrer

- `ml/ecurie/consignes-agents/*.md` (7 consignes) et `ml/ecurie/agents/*.md` (7 rapports) : la commande et la réponse, côte à côte pour six agents (la consigne « voltige » n'a pas de rapport, l'agent n'a pas été lancé ; le rapport « essai » n'a pas de consigne). Dans git.
- `ml/ecurie/comptes-rendus/compte-rendu-01.html` et `-02.html`, les pages faites pour Sacha. Dans git.
- `ml/ecurie/portfolio/index.html` et ses 5 figures SVG, chacune en version claire et sombre (10 fichiers, `portfolio/images/`). Dans git.
- Les 5 images du journal (`portfolio/images/journal-*-clair.svg` et `-sombre.svg`) et leurs scripts (`portfolio/figures-journal/`) : la frise des méthodes, les apprentissages de zéro, les dépenses, ressembler ou gagner, le bruit des notes (liste et commande dans `LISEZ-MOI.md`, § 6). Hors git au 27/11 (non suivis).
- `ml/ecurie/etude/selection-naturelle/` : la spécification, l'étude du bruit et les quatre enquêtes relues. Dans git depuis `033bfebeb`.
- `ml/labo/arbre.html`, la lignée des cerveaux. Dans git.
- `ml/labo/videos/*.webm` (4 films). Hors git.
- `ml/ecurie/agents/tmp-voltige/paroles-sacha.md` : les messages de Sacha, datés. Hors git (dossier ignoré).
- `ml/evolution/` : le système de sélection naturelle. Pas encore suivi par git au moment de l'écriture.
- Ce journal lui-même (`ml/ecurie/portfolio/journal/`) : dans git depuis `29bce656d` (27/11, 18 h 49) ; ses retouches du soir et `LEXIQUE.md` ne sont pas encore enregistrés.

## Sources

- Commits : `d2ee1f114` (22/11), `3317b893a` (23/11), `67ea1f009`, `1528cecf2` (24/11), `a35ece70f`, `29c4e8c8c`, `09e45dddd`, `cfeef13b2`, `8610302d2`, `c4dc69655` (25/11), `ecd9eeccd`, `1e148ee05`, `8d7edc258` (26/11), `49012f2d9`, `033bfebeb` (27/11) ; `git log -- ml` depuis le 07/09 pour les essais d'avant novembre.
- Fichiers : `passation/BOTS-ML.md` (en-tête, § 1, 5, 6) ; `ml/ecurie/PLAN.md`, `PASSATION.md`, `CONSIGNES.md`, `ETAPES.md` (chaîne, C bis) ; `ml/ecurie/agent-api.js` (en-tête) ; `ml/ecurie/consignes-agents/pilote.md`, `voltige.md` ; les 7 rapports `ml/ecurie/agents/2026-11-25T*.md` ; `chaine.log`, `chaine-etat.json`, `choix.json`, `portfolio-console.log`, `apres-images.log` ; `ml/labo/journal/depenses.jsonl` ; `ml/labo/README.md` ; `ml/bot/README.md` ; `ml/ecurie/etude/selection-naturelle/LISEZ-MOI.md`, `SPECIFICATION.md`, `PROPOSITIONS.md`, `bruit/resultats.txt` ; `ml/evolution/README.md` ; `ml/ecurie/agents/tmp-voltige/paroles-sacha.md` ; les notes de mémoire de Claude (`budget-tout-consommer.md`, `ecurie-argent-et-lancement-des-agents.md`, `inventaire-complet-avant-de-corriger.md`, `pas-de-question-quelle-suite.md`, `remettre-la-methode-en-question-a-chaque-etape.md`, `garder-des-traces-pour-le-portfolio.md`, `menager-fable-utiliser-opus.md`) ; le fichier de consignes global de Sacha pour Claude (section « Autonomie », 24/11) ; `ml/ecurie/etude/defauts-confirmes.md` (en-tête) ; `ml/ecurie/etude/realisme.md` (existence).
