# Le test du tri des courses, et le critère de débit du banc : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu en texte libre ; l'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l'agent. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `tri-des-courses-et-critere-de-debit` (wf_8298801f-de5), lancée par la session principale (Claude Fable).
- Agents : 4, tous du modèle claude-opus-5-5.
- Durée : 57 min ; jetons consommés par les agents : 762 939 (0,76 millions) ; appels d'outils : 229.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. mesureur du test du tri : rejoue 40 courses du banc et demande à un juge s'il les distingue de parties de joueurs (phase « Test B »)
2. auteur du critère de débit : les pièces par minute de survie, comme nouveau critère du banc des gènes (phase « Critere de debit »)
3. relecteur du test du tri : refait la mesure par un autre chemin et attaque le verdict (phase « Test B »)
4. relecteur du critère de débit : cherche à le réfuter et corrige ce qu'il trouve (phase « Critere de debit »)

## 1. testB:mesurer

*Rôle : mesureur du test du tri : rejoue 40 courses du banc et demande à un juge s'il les distingue de parties de joueurs. Phase : Test B.*

I'm waiting for the courses to finish.

## 2. debit:ecrire

*Rôle : auteur du critère de débit : les pièces par minute de survie, comme nouveau critère du banc des gènes. Phase : Critere de debit.*

AUTEUR du critère de débit : fait et committé dans la copie C:\Users\sacha\code\CASH-CAR-genes-v4, branche banc-debit, commit b0fed8858. Rien n'est poussé ni fusionné. Je n'ai rien touché dans CASH-CAR-bots-ecurie : lectures seulement (vague.json de v001, git log, calcul d'époque). Aucune course n'a été jouée.

CE QUI A CHANGÉ, FICHIER PAR FICHIER (tout est dans ml/evolution/banc/)
- criteres.js
  - Le type `debit` : pieces / survie_s × 60, null sous 20 s de survie (DEBIT_SURVIE_MIN = 20), avec `dire` en français (« les pieces par minute de survie (plus = mieux) »).
  - `lireGarde` / `lireGardes` : au plus 3 gardes. Types permis : palier, survie, vols, causes, mesure, debit (pas F ni E). pasPire ≥ 0. Un compteur est refusé.
  - `garde(paires, g)` rend m, d (écart moyen apparié bras − témoin), se, tenue, borne95, sure.
  - `direGarde` et `uniteCourte` disent la garde et son unité en français.
- bras.js : la clé `gardes` est acceptée par bras. Elle n'est ajoutée à l'objet que si la vague la donne, donc une vague sans garde a le même plan.
- banc.js
  - `derouler` : les gardes sont lues seulement au regard d'arrêt, sur les mêmes paires que le critère. La `decision` n'est pas modifiée.
  - `secondaires` : une clé `debit` en fin de liste dans toutes les vagues : moyennes bras et témoin, d, se, m, et le même écart sans les courses à seconde chance (`sansChance`).
  - `resultat` : le verdict passe par `verdictDe`. Pour un bras avec gardes seulement, il ajoute `decisionArret`, `gardes` et `gardeTenue`.
  - planJ porte les gardes. `--verifier` affiche le critère et la garde.
- rapport.js
  - Nouveau verdict « net-garde » = « net sur le critere, garde non tenue », jamais candidat.
  - `verdictDe` et `direGardeLue` ; unité du débit.
  - resume.txt et journal.md affichent le critère et ses gardes, la garde lue (TENUE / NON TENUE, « de peu » si borne95 dépasse la limite), et « (garde non tenue) » dans la table des regards.
- bras.json : 5 bras de plus, 18 en tout. Les cinq gènes sont dans leurs bornes (genome.js BORNES).
  - nitro-sol {capMax 0.6, jaugeAllume 0.25, jaugeCoupe 0.1} : témoin 0.35 / 0.45 / 0.25 ; bornes 0,1–0,8 / 0,2–1,2 / 0–0,8 ; jaugeCoupe ≤ jaugeAllume est respecté.
  - vise-large {marge 5} : témoin 10, borne 3–20. Le texte dit que marge règle aussi la ligne dans les virages.
  - racc-fermes {raccCartes_grotte, raccJumeau_grotte, raccCartes_canyon, raccJumeau_canyon, raccCartes_jade, tous à 1} : drapeaux à 0 chez c0025. Ce bras OUVRE les raccourcis fermés ; raccJumeau_jade vaut déjà 1.
  - fig3 {figMax 3} : témoin 2, borne 0–5.
  - nitro-decor {nitroDecor 1.5} : témoin 1, borne 0–1,5.
- tests/banc.test.js
  - b4 : fabrique tous les bras du catalogue par vagues de 5. Avant, il exigeait exactement 7 bras et échouait déjà avant mon changement (48/49).
  - Nouveaux b10 (le débit), b11 (les gardes), b12 (la non-régression), b13 (les faux « net »).
- README.md : le critère débit (pourquoi, quel champ, sa limite, le seuil, le lien avec la survie), la garde (définition, règle d'arrêt inchangée, ce qu'elle vaut), un exemple de vague « v002-debit » (marqué « pas une vague écrite »), le verdict net-garde, et le piège CRLF sur l'époque.

LE CHAMP DE PIÈCES CHOISI : `pieces`, et sa limite
- La ligne compacte (enfant.js resultatCompact) ne garde que `pieces: b.pieces`. C'est fin.pieces de la partie recollée (mesures.js), donc les pièces de la fin.
- `pieces_max` et `pieces_ramassees` existent dans le bilan mais ne sont pas copiés dans la ligne. Je n'ai rien ajouté aux lignes, puisque cela changerait l'époque.
- Limite : après une seconde chance, la fin compte environ un palier de moins que ce qui a été ramassé (de 40 à 240 pièces selon le palier, d'après les SEUILS de mesures.js). Le débit de ces courses est donc sous-estimé.
  - C'est rare : 3 courses sur 105 (l'état du banc v2 du 28/11, échelle-de-bots/selection/champs-des-lignes-banc.txt).
  - La seconde chance est réglée pareil chez le témoin et chez les bras.
  - Les secondaires redonnent l'écart sans ces courses (`sansChance`).
- On ne peut pas reconstruire le compte exact depuis la ligne.

LE SEUIL DE 20 s
Mesuré sur les 1 250 courses de 900 s du banc d'étude (ml/ecurie/etude/banc-des-genes/etat, dans la copie) :
- la plus courte vit 12,3 s, donc la division n'explose jamais ;
- 35 courses sur 1 250 (2,8 %) vivent moins de 20 s ;
- leur débit est de 163 pièces/min, écart-type 68, contre 192 à 266 et écarts-types 48 à 56 au-delà ;
- un seuil à 60 s en écarterait 247 sur 1 250 (20 %).

Je garde 20 s : sous ce seuil, le débit dit le départ de la route, pas la conduite. Attention, le débit n'est pas indépendant de la survie : la corrélation entre log(survie) et débit vaut 0,28 (1 215 courses), parce que la route est plus riche après chaque portail. C'est écrit dans le README.

LA GARDE : MON JUGEMENT
- Règle gardée telle que demandée : l'écart moyen apparié ne doit pas être pire que pasPire. Elle est déterministe et ne peut que retirer des « net-aide », donc aucun risque de faux « net-aide » en plus.
- Elle est lue au regard d'arrêt, sur les mêmes graines que le critère.
- Ce que je n'ai pas aimé : sans marge statistique, elle est bruitée. L'écart de survie apparié a un écart-type de 80 à 95 s par graine pour un bras qui change presque toutes les courses (banc d'étude, 96 graines par bras). Résultat : à 24 graines, un bras qui ne coûte rien rate une garde de 15 s environ 1 fois sur 5 ; à 96 graines, environ 1 fois sur 20.
- Ce que j'ai ajouté plutôt qu'une règle plus stricte : la borne unilatérale à 95 % (`borne95`) et la mention « tenue de peu », sans qu'elles décident. C'est écrit dans le README.
- v001 porte une garde pour slalom (pas plus de 0,75 palier perdu) écrite seulement dans sa question, pas dans vague.json. Le banc ne la lit pas : elle se juge à la main, et c'est dit dans le README.

LES TESTS
- node ml/evolution/banc/tests/banc.test.js : TOUT PASSE, 66 contrôles en 19,4 s (avant : 48 sur 49, b4 échouait).
- b6 inchangé : faux « net » 4,20 % sur 2 000 vagues ; puissance 74,1 %.
- b12, la non-régression sur v001 :
  - setup : le code d'avant est lu dans git au commit cae5402709ca, le même code que dans l'autre arbre, et joué sur le faux ordonnanceur avec le vrai vague.json de v001 ; verdicts lus : bord et suit au plafond, les trois autres en futilité au 2e regard ;
  - ancien et nouveau code rendent les mêmes plan.json (date à part), regards.json, resume.txt et journal.md, octet pour octet ;
  - resultat.json est identique hors la date et la seule clé ajoutée (secondaires.debit) ;
  - une vague lancée par l'ancien code reprend avec le nouveau : code 0, pas 4, même regards.json ;
  - je n'ajoute rien à regards.json ni à plan.json d'une vague sans garde, donc aucun risque de code 4. La seule nouveauté dans les fichiers de v001 sera secondaires.debit dans son resultat.json final.
- b13 : 1 000 vagues de 5 bras jugées sur le débit sans effet donnent 4,60 % de faux « net » [3,30 ; 5,90]. Avec une garde sur chaque bras, les 1 000 vagues prennent les mêmes décisions aux mêmes regards ; les « net-aide » passent de 22 à 0 après la garde (la garde de test était faite pour être souvent violée).
- b11, par la ligne de commande : un bras avec débit +80 et survie −60 rend « net-garde » (garde lue −48,5 s), pas candidat ; un bras avec débit +80 sans perte rend net-aide candidat, garde tenue (+12,1 s) ; INDEX le compte « candidat » ; lignes ≤ 118 colonnes.
- `--verifier` sur une vague d'essai numéro 0 avec les 5 nouveaux bras jugés sur le débit et gardés (dossier <dossier temporaire>\scratchpad\essai-debit\v000-essai, pas dans vagues/) : code 0, les 5 pilotes sont fabriqués.

L'ÉPOQUE DES COURSES (ad6cc000299a), À LIRE AVANT DE FUSIONNER
- Aucun fichier du banc n'entre dans l'époque : FICHIERS_EPOQUE compte 10 fichiers de ml/bot, ml/reel, modele.js et enfant.js, et mon diff ne touche que ml/evolution/banc/.
- Mais dans la copie, `--verifier` écrit l'époque bb3e37855092, pas ad6cc000299a. La cause est une différence de fins de ligne au checkout entre les deux arbres. Dans la copie, yeux.js, doigts.js, piloter.js, ressemblance.js et voltige.js (ml/bot) sont en CRLF, et l'autre arbre a lui aussi un mélange (mesures.js, jeu-reel.js, sim-env-reel.js en CRLF). Git voit tous ces fichiers comme inchangés.
- Preuve : <dossier temporaire>\scratchpad\epoque-autre.js. Il dit que les 10 fichiers sont identiques hors fins de ligne et rend ad6cc000299a quand on les lit avec les octets de l'autre arbre.
- Conséquence : il ne faut PAS reprendre v001 depuis la copie, elle serait refusée en code 4. Il faut fusionner banc-debit dans bots-ecurie et lancer depuis cet arbre.

CE QUE JE N'AI PAS VÉRIFIÉ
- Aucune vraie course : le débit et la garde ne sont testés que sur des lignes fabriquées.
- Que `pieces` vaut bien fin.pieces dans une vraie ligne avec une seconde chance prise : lu dans le code, pas mesuré.
- Le taux de garde ratée par hasard (1 sur 5 à 24 graines) est calculé depuis les écarts-types du banc d'étude, pas simulé.
- Je n'ai lancé ni evoluer.test, ni identite.test, ni courses.test (consigne).
- b12 relit l'ancien code dans git au commit cae5402709ca : sans cet historique, ce test échoue.
- Le travail en cours dans l'autre arbre n'est pas touché : les fichiers non suivis (note-essai, vagues/INDEX.md, journal de v001…) n'ont pas été lus.

## 3. testB:relire

*Rôle : relecteur du test du tri : refait la mesure par un autre chemin et attaque le verdict. Phase : Test B.*

RELECTEUR ADVERSE DU TEST B : RAPPORT

Rien n'est committé. Tout ce que j'ai écrit est dans ml/ecurie/etude/echelle-de-bots/tri/ :
- le rapport : tri/LISEZ-MOI.md ;
- mes outils et leurs sorties : tri/relecteur/ (identite.js, attaque.js, identite.txt, note-test-b-40.json, discerner-test-b-40.json, juger-*.json, attaque-*.txt/json).

Je n'ai joué aucune course. Les 40 courses ont été jouées par jouer-tri.sh, une seule à la fois, ce que j'ai vérifié dans la liste des processus.

Le mesureur n'a rendu aucun rapport (« I'm waiting for the courses to finish »). Il n'avait donc rien affirmé sur les résultats. Tous les chiffres de résultat ci-dessous sont les miens.

CE QUI TIENT
- La prédiction a été écrite avant les courses. prediction.md date de 16:54:25 et n'a jamais été réécrit (même date de création et de modification). La première course commence à 16:54:59. Réserve : le fichier n'est pas dans git, donc on ne peut pas le prouver mieux que par la date du disque.
- Les 40 graines sont celles que dit la règle. Je les ai retrouvées à l'identique dans banc-des-genes/etat/courses-2026-48.jsonl, bras depart : 96 lignes, 53 aux paliers 4 à 8, les 40 premières par graine croissante. Par palier : 4→8, 5→7, 6→7, 7→12, 8→6.
- Les courses rejouées sont celles du banc : 40 sur 40 identiques sur 7 champs (palier, survie, cause, pièces, et les 3 empreintes). Aucun échec. Survie médiane : 109,45 s. Source : relecteur/identite.txt.
- Le pilote d'aujourd'hui (6d76492d) donne les mêmes empreintes que celui du banc sur les graines 3000037 et 3000111.
- Le juge recopié (juger.js) sans troncature donne la même AUC que discerner.js : 0,953 et 0,953 sur les 40 courses, 0,924 et 0,924 sur voltige4.
- Le pari sur la nitro tient : l'AUC de la nitro seule passe de 0,595 sur les parties entières à 0,727 à temps égal.

CE QUI TOMBE
- juger.js dit que le contrôle est « vérifié dans resultats.md ». Ce fichier n'existe pas. J'ai fait le contrôle moi-même.
- prediction.md § 4 dit que note-voltige4 vient d'« un autre jour du jeu ». C'est faux : même jeu (cashcar-v1627 e7e1eed4718f), même simulateur. Seul le texte du pilote diffère (c3e8b819).
- Le seuil 0,90 n'est calibré par aucun témoin. Le témoin humains contre humains compare Sacha à lui-même (5 parties contre 5) : il mesure le bruit du juge, pas sa puissance.
  - Le témoin qui manquait : Sacha (10 parties) contre Léo (4 parties). AUC 0,93 sur les parties entières, 0,947 à temps égal.
  - Un autre humain serait donc « mort » selon la règle. Le juge apprend « Sacha au clavier », pas « un humain ».
  - Réserve : Léo diffère de Sacha par le joueur, l'appareil et la version du jeu, et 4 parties c'est peu.
- Le verdict n'est pas robuste. Avec la règle (fenêtres de 10 s, joueurs au clavier), il change de case avec T ou la tranche ; d'autres fenêtres ou les 14 joueurs changent aussi l'AUC.

| réglage | AUC à temps égal | AUC entière |
|---|---|---|
| T = 109,45 s (la règle) | 0,904 | 0,953 |
| T = 103 s | 0,899 | – |
| fenêtres de 5 s | 0,874 | 0,924 |
| fenêtres de 20 s | 0,963 | 0,984 |
| tous les joueurs (14) | 0,914 | 0,953 |
| tranche 4-5 | 0,919 | 0,963 |
| tranche 6-8 | 0,898 | 0,951 |

- L'AUC dépend du nombre de courses du bot (20 tirages à chaque taille) : 0,878 avec 5 courses, 0,896 avec 10, 0,902 avec 20, 0,904 avec 40.
- Le bon témoin du bruit, à la taille du test (10 contre 40, étiquettes mélangées, 30 fois) : moyenne 0,497, au plus 0,627.
- Sacha sur la version 60aa15e contre Sacha sur ccdca9b (8 parties contre 2) donne 0,033. Ce chiffre ne vaut rien : il montre seulement qu'un groupe de 2 parties ne se juge pas. L'effet de la version reste donc inconnu.
- On ne sait pas si l'ondulation (z 2,37 ; 0,211 contre 0,165) et les vols bas (hauteur max 11 m contre 33 m) viennent du pilote, du simulateur ou de la version.
  - Le simulateur enregistre un point toutes les 0,1066 s (médiane), les joueurs toutes les 0,110 s.
  - Le bot joue sur v1627, les joueurs sur deux versions du 23-24/11.
  - Aucune course du bot dans le vrai jeu, et aucune partie de joueur dans le simulateur, ne permet de trancher.
- Le tri ne change pas le pilote : les 40 courses mortes tôt contre 20 courses ordinaires de c0025 (toutes coupées à 109,45 s) donnent AUC 0,513.

LE VERDICT SELON LA RÈGLE ÉCRITE D'AVANCE
L'AUC à temps égal (joueurs au clavier coupés à 109,45 s, 10 parties et 72 fenêtres, contre 40 courses et 372 fenêtres) vaut 0,904. C'est ≥ 0,90 : « l'idée est morte ». L'AUC entière (0,953, discerner.js sans rien changer) tombe dans la même case. Mais 0,904 n'est qu'à 0,004 du seuil, et prediction.md § 5 dit lui-même qu'un écart de moins de 0,1 « ne veut rien dire ».

CE QUE LA SESSION PRINCIPALE DOIT TRANCHER (les cinq lignes de la fin du LISEZ-MOI)
1. Appliquer la règle à la lettre (0,904 : l'idée est morte), ou la dire indécise parce que 0,904 touche le seuil et que le verdict change avec T, la fenêtre ou la tranche.
2. Que faire d'un juge qui sépare Sacha de Léo (0,93) aussi bien que Sacha du bot : le garder comme arbitre de « ressemble à un joueur », ou d'abord lui trouver un témoin qui le calibre.
3. Comme le tri ne change pas le pilote (0,513), son sort est celui de c0025 : la ressemblance se gagne sur le pilote (ondulation, vols, nitro), pas sur le choix des courses.
4. Faut-il mesurer ce qui vient du simulateur et de la version (des courses du bot dans le vrai jeu, ou des parties de joueur rejouées), avant de croire l'ondulation ?
5. Les paliers 1 à 3 (14 courses du banc) n'ont pas été jugés.

## 4. debit:relire

*Rôle : relecteur du critère de débit : cherche à le réfuter et corrige ce qu'il trouve. Phase : Critere de debit.*

RELECTEUR ADVERSE du critère « débit » : fini. Copie C:\Users\sacha\code\CASH-CAR-genes-v4, branche banc-debit, HASH FINAL b1326cf98 (par-dessus b0fed8858 de l'auteur). Rien n'est poussé ni fusionné. Aucune course jouée. Rien n'a été écrit dans CASH-CAR-bots-ecurie : j'y ai seulement lu des fichiers et calculé l'époque.

DÉFAUTS TROUVÉS ET CORRIGÉS (dans README.md seulement, aucun code ne change)
1. La garde de survie à 15 s est trop large pour un bras jugé sur le débit. Pièces ≈ débit × survie (témoin : 123 s, 212 pièces/min). Un bras qui gagne 7 % de débit (+15/min, l'effet que le banc voit environ 4 fois sur 5 à 192 graines) et perd 15 s (12 %) finit avec environ 6 % de pièces EN MOINS, et sa garde est quand même tenue : un bras nuisible peut passer. J'ai ajouté un paragraphe « Le seuil » chiffré au README et passé l'exemple v002 à pasPire 10 s (123 × 15/212 ≈ 9).
2. L'auteur omettait que l'époque de la NOTE change aussi dans la copie (639a09244a3b → e59658f0b642), parce qu'elle hache l'époque des courses. C'est ajouté, avec la vérification de reprise ci-dessous.
3. Une petite correction de chiffre : l'écart-type de survie va de 79 à 95 s, pas de 80 à 95.
Je n'ai trouvé aucun défaut de code. verdictDe, INDEX (net-aide seulement), resume (confirmation ratée), plan.json (gardes ajoutées seulement si elles sont données) et lireGarde (refus des compteurs et de F/E, pasPire ≥ 0) sont justes. Les 5 bras sont de vrais écarts au témoin (lus dans les ecarts de plan.json) et se fabriquent : --verifier rend le code 0.

(1) L'ÉPOQUE : git diff bots-ecurie..HEAD ne touche que ml/evolution/banc/ (7 fichiers). Calcul fait dans les deux arbres :
- dans bots-ecurie, ad6cc000299a / 639a09244a3b ;
- dans la copie, bb3e37855092 / e59658f0b642.
La différence vient des fins de ligne. yeux, doigts, piloter, ressemblance et voltige sont en CRLF dans la copie et en LF dans l'autre arbre. Les 10 fichiers ont un texte identique une fois les fins de ligne ramenées. L'affirmation de l'auteur est confirmée : il faut fusionner dans bots-ecurie et lancer depuis cet arbre.

(2) LA REPRISE : j'ai copié v001 (vague.json, plan.json, regards.json…), INDEX.md et le cache (lecture seule) dans un dossier d'essai de la copie.
- Avec --verifier tel quel, la copie rend le code 4 (les deux époques).
- Avec l'époque d'origine passée au banc et un faux ordonnanceur qui ne sert que le cache (<dossier temporaire>\scratchpad\reprise-v001.js) : plan.json est identique (cmp) et le regard 1 est identique à l'original. Les 5 bras « continuent ». La commande s'arrête au 2e regard faute de courses (code 2, 241 courses servies depuis le cache, aucune jouée). Le dossier d'essai est effacé.

(3) LE DÉBIT, sur les 1 250 courses (96 graines par bras)
- Le champ est le bon : pieces = fin.pieces (mesures.js → piloter.bilan → enfant.resultatCompact). Il est sous-estimé après une seconde chance, comme l'auteur le dit.
- Distribution : moyenne 212,7, écart-type 55,3 ; quantiles 5/25/50/75/95 % = 118/177/214/249/299. La plus courte course vit 12,3 s ; 35 courses sur 1 250 vivent moins de 20 s, 247 moins de 60 s.
- Débit par tranche de survie :

| survie | courses | débit moyen | écart-type |
|---|---|---|---|
| sous 20 s | 35 | 163 | 68 |
| 20–60 s | 212 | 206 | 53 |
| 60–120 s | 378 | 192 | 52 |
| 120–300 s | 594 | 228 | 49 |
| 300 s et plus | 31 | 272 | 60 |

- Corrélation log(survie)–débit : 0,283 (1 215 courses).
- Le seuil de 20 s ne crée presque pas de biais. Selon le bras, 0 à 3 graines sur 96 sont perdues d'un seul côté ; les mêmes 3 graines sont sous 20 s chez le témoin et presque tous les bras. L'écart avec et sans seuil diffère d'au plus 1,8/min (slalomOn −28,5 contre −30,3 ; gestes5 −37,2 contre −35,5).
- Écart-type apparié du débit par graine (8 bras qui changent plus de la moitié des courses) : médiane 60,8, de 44,1 à 70,9.
- Effet détectable à 80 % (5 bras, c = 2,645 au plafond 192 et 2,602 au plafond 96) : à 192 graines, 15,3/min (11,1 à 17,8) ; à 96 graines, 21,3 (15,5 à 24,9).
- Le débit voit de vrais effets : slalomOn −28,5 (z −4,5) et gestes5 −37,2 (z −5,3), à survie presque égale.

(4) LA GARDE : risque qu'une garde de survie soit ratée par hasard alors que le bras ne coûte rien (loi normale de l'écart moyen, écart-type 61, 79 ou 95 s) :

| graines | garde 15 s | garde 10 s |
|---|---|---|
| 24 | 11,5 / 17,5 / 22 % | environ 27 % (écart-type médian) |
| 48 | 4,5 / 9,3 / 13,7 % | non calculé |
| 96 | 0,8 / 3,1 / 6,1 % | 5,4 / 10,6 / 15,1 % |
| 192 | 0 / 0,4 / 1,4 % | 1,2 / 4,0 / 7,4 % |

Symétriquement, un bras qui coûte vraiment 30 s passe une garde de 15 s avec les mêmes probabilités.
- Sous l'hypothèse nulle, aucun faux « net » ne s'arrête avant 96 graines.
- Un « net » à 24 graines demande environ +90 pièces/min (+40 %). La garde y est surtout du bruit, mais elle ne change rien au total des pièces.
- Seuil proposé : 10 s en survie pour une vague jugée sur le débit, ou une garde en palier. Pour le palier (écart-type 3,77), une garde de 0,75 palier ratée par hasard : 2,6 % à 96 graines, 0,3 % à 192.

(5) LES FAUX « NET »
- b6 est inchangé : 4,20 % [3,32 ; 5,08], puissance 74,1 %.
- b13 (débit, lignes fabriquées) : 4,60 % [3,30 ; 5,90].
- Mon contrôle sur les vrais écarts recentrés, retirés graine par graine avec remise, 4 000 vagues de 5 bras jugées par plan.decision : 3,90 % [3,30 ; 4,50]. 157 bras « net » sur 20 000, arrêtés à 96, 120, 144, 168 et 192 graines (5, 9, 30, 51, 62). Script : <dossier temporaire>\scratchpad\faux-net-reel.js.
- Les gardes ne changent aucune décision (b13 : 1 000 vagues sur 1 000).

LES TESTS : node ml/evolution/banc/tests/banc.test.js → TOUT PASSE, 66 contrôles (19,1 s), lancé avant et après ma correction. Je n'ai lancé ni evoluer.test, ni identite.test, ni courses.test.

CE QUI RESTE NON VÉRIFIÉ
- Aucune vraie course avec le débit ni avec une garde.
- La valeur de pieces dans une vraie course où une seconde chance est prise : les lignes du banc d'étude n'ont pas chancePrise.
- Les taux de garde ratée sont calculés avec la loi normale, pas simulés course par course.
- Le seuil de 10 s repose sur pièces ≈ débit × survie, pas sur une mesure du palier.
- Les nouveaux bras (racc-fermes surtout) risquent un verdict « trop rare » sur les cartes libres : non mesuré.
- b12 dépend de l'historique git (commit cae5402709ca).
- Le seuil (10 ou 15 s) et le numéro de v002 restent à décider par la session principale avant d'écrire la vague.

Analyses : <dossier temporaire>\scratchpad\analyse-debit.js
