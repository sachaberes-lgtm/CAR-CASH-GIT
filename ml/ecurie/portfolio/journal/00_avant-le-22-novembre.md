# Septembre – octobre 2026 — Deux tentatives de faire apprendre la conduite à des bots, et pourquoi elles ont calé

**En une phrase.** Avant le plan du 22 novembre, Claude a fait évoluer de petits réseaux de neurones par générations, d'abord dans une copie du jeu (`ml/train`, septembre puis 20 octobre), puis dans le vrai jeu (`ml/reel`, 20 octobre) : les bots ont appris à rouler, presque jamais à voler ni à faire des figures, et la copie s'était éloignée du vrai jeu sans que personne le voie à temps.

## La question du moment

CASH CAR se joue sur une route suspendue dans le ciel. On roule, on décolle, on fait des figures en l'air, on se pose. Sacha voulait des voitures qui apprennent ça seules. Sa consigne, citée dans le passage de relais du 8 septembre : « leur but est juste de franchir la ligne d'arrivée le plus vite possible et je veux qu'elles apprennent à contrôler leur corps pour y arriver » (`archive-2026-09-09/rapports/HANDOVER.md`, §1).

La méthode s'appelle la **neuroévolution** : on ne programme pas la conduite, on fait évoluer des cerveaux artificiels comme une population animale. Le cerveau est un **réseau de neurones** minuscule (un calcul qui transforme ce que la voiture « voit » en touches appuyées). Au début : 12 entrées, 16 neurones cachés, 4 sorties (volant, gaz, nitro, assiette), écrit à la main en JavaScript, sans aucune bibliothèque (`COMPTE-RENDU.md`, §1). 24 voitures courent. À la fin de la manche, on les classe. La règle est de Sacha : « la moitié la plus nulle se fait remplacer » (`HANDOVER.md`, §6). Les survivantes gardent leur cerveau intact ; les remplaçantes sont des enfants mélangés de deux survivantes et légèrement modifiés au hasard (une **mutation** ; « croisement + mutation », même source). La note d'une voiture : surtout la distance parcourue, plus un bonus d'arrivée (`79b1eed60`).

Un point à comprendre pour la suite. `ml/train/train.html` est une copie complète du jeu, prise en juillet, avec un mode entraînement en plus (`ml/train/README.md`). Le 8 septembre, Claude unifie la physique **à l'intérieur** de cette copie : joueur et bots y roulent pareil. Mais la copie entière, elle, n'a pas suivi le jeu publié.

## Ce qu'on a tenté

Le dépôt garde la trace de ce travail à partir du 7 septembre (commit `deacc99ad`, qui ajoute d'un coup `ml/sim` et `ml/train`). Le bilan du 21 novembre parle de « juillet → septembre » ; je n'ai pas retrouvé de trace de juillet, sinon que `train.html` est une copie du jeu de juillet.

- **Un premier simulateur, `ml/sim`** (7 septembre). Il fait tourner sans écran la meute de 7 pilotes du mode Survivant. Son aperçu dit : 5 981 raccourcis disponibles, 0 pris, 0 s en l'air pour les 7 bots en 60 s. C'est un point de départ, pas un essai d'apprentissage.
- **Corriger la copie de la physique des bots** (jusqu'au 8 septembre). Trois passes et deux agents « critiques » n'y arrivent pas. ÉCARTÉ : on supprime la copie. Joueur et bots appellent désormais la même fonction ; l'écart mesuré est 0.000e+0 sur 3 000 pas (`c7d78845a`). GARDÉ.
- **Le clonage** : enregistrer des parties de Sacha et faire imiter son pilotage (`99c3e9272`). Avec l'amorce clonée, 98,9 % des morts surviennent en vol, contre 96,0 % au hasard (`RAPPORT-SESSION-2026-09-08.md`, §3.1) ; le rapport juge lui-même ce critère invalide. ÉCARTÉ par Sacha (voir Les décisions).
- **Sélection « la moitié la plus nulle remplacée »** (8 septembre). L'évolution apprend : graine 7, de 64 m à 3 711 m en 25 générations (`f31fd3094`). GARDÉ.
- **Remettre les entrées à l'échelle** (ce que le cerveau voit). 8 entrées sur 15 étaient saturées ou mortes (§3.7). Mais une re-normalisation testée fait tomber le record médian de 4 995 à 3 244 m, 8 graines sur 8 en baisse (`ede76bfe3`). ÉCARTÉ.
- **Noter chaque voiture sur 3 pistes et faire la moyenne.** Sur pistes neuves : 1 535 m contre 2 054 m (graine 3), 658 contre 1 934 m (graine 7) (`e0f191460`). ÉCARTÉ le 8 septembre ; la piste change à chaque génération à la place. Mais le lendemain, la sélection sur 3 pistes revient par défaut (`79b1eed60`), sans nouvelle mesure citée dans ce commit.
- **Un pilote au sol écrit à la main**, le réseau ne gardant que le vol (idée de Sacha, « Idée §7.4 du propriétaire »). Seul, il roule 2 366 m à 210 km/h ; en évolution, médiane 2 898 m contre 3 047 m sans lui (`7edd02361`). Plus régulier, pas meilleur.
- **Sélection par vitesse, réseau plus gros (32 neurones), décisions plus fréquentes (30 fois par seconde).** Banc : 2 120 m pour la sélection par vitesse (`37aeae373`) ; 2 611 et 2 675 m pour les deux autres, contre 2 660 m : du bruit (`232aa8071`). ÉCARTÉ.
- **Manches plus longues** (19 septembre). La manche de 45 s cachait les crashs, qui arrivaient après ; et le bonus d'arrivée ne servait jamais (`0d2969e94`). Elle passe à 150 s, puis à une durée proportionnelle à la piste : meilleure distance 10 330 → 11 801 m, arrivées 908 → 1 220 (`15dcf1276`). GARDÉ.
- **Pénalité de mort** : l'évolution préférait « couper fort et mourir » à finir (48 % de chutes, 34 % d'arrivées) (`c14ba2a3e`). Ajoutée ; son effet n'est chiffré dans aucune source lue.
- **Apprendre les figures** (20 octobre). Une figure se déclenche par un double appui sur NITRO. Récompense à 0,08 : 0 figure en 200 générations (`d140582c5`). À 1,2 : 1 bot sur 24 (`03b5da4a6`). À 3 : 0 (`5799d5bb1`). Un mode d'entraînement séparé, noté sur les figures seules, donne 23 bots sur 24 qui en font (`7cfdb6ec9`). Mais rejoué sur des courses entières, ce champion finit 1 % des courses, avec 58 % de morts en vol (`6cd575e0b`). Et la copie payait les figures même quand la voiture explosait : « ça récompensait “figure puis explosion” — c'est ce que faisait le champion freestyle » (`71bac35b6`). ÉCARTÉ pour la course.
- **Un champion réentraîné après la remise à niveau de la copie** (20 octobre, graine 1101, 150 générations) : 63 % des courses finies, mais 0 figure en l'air (`7029ca1ed`).
- **Quitter la copie : `ml/reel`** (20 octobre). Le vrai jeu publié tourne sans écran, piloté par les touches du clavier. Cerveau 15 → 16 → 4, 20 cerveaux, 40 s par partie, note = distance parcourue ; la moitié la moins loin est remplacée par des enfants mutés, sans mélange (`ml/reel/entrainer.js`). 57 générations : de 1 391 m à environ 3,4 km. Sur 6 pistes jamais vues : 3 survivent, les 3 autres meurent en vol, 0,2 figure par partie (`6f4dbdc29`). Premier champion du vrai jeu, pas fiable.

## Ce qu'on a appris

**Sur le jeu.** Une figure demande une suite précise : être en l'air avec assez de temps, avoir 35 % de nitro, un double appui « dans une fenêtre de 300/420 ms », la bonne direction, puis se poser à moins de 20° de la fin (`passation/BOTS-ML.md`, §1). Le même bouton NITRO sert à aller vite (tenu) et à lancer une figure (tapé deux fois) : noter la distance pousse à le tenir (`4685d2286`). Des mutations au hasard ne tombent pas sur cet enchaînement.

**Sur les bots.** Un réseau peut **réciter** une piste au lieu de conduire : 2 456 m sur sa piste, 38 sur une inconnue (`RAPPORT-SESSION`, §3.2, dans un test proposé par Sacha). Et les totaux d'un entraînement ne décrivent pas le champion : « record 11 746, 1 256 arrivées » était l'œuvre de toute la population ; le champion seul finissait 0 % des courses (`6cd575e0b`).

**Sur la copie du jeu.** Le jeu changeait ; la copie non (route élargie le 26/09, gravité ×1,45 le 15/10, figures sur la route le 17/10 : `71bac35b6` ; drift du 19/10 : `ecbb531a5`). Le 25 septembre, l'agent critique écrit que la physique du jeu a divergé de `train.html` (vitesse 0,5 dans la copie contre 0,48 dans le jeu, aide en vol 1,0 contre 0,2 ; `ml/train/CRITIC-REPORT.md`, 123ᵉ passage). Le 20 octobre, à la demande de Sacha, Claude rattrape la gravité, la largeur de route et des règles de figures manquantes (`71bac35b6`). Les champions entraînés avant étaient à refaire. Les deux écarts du 25 septembre, eux, n'ont pas été rattrapés : la dernière version de `train.html` (`6cd575e0b`, 20/10) garde `SPD=0.5` et `AIR_ASSIST=1.0`, et le README du 20/10 ne les cite pas parmi les écarts connus.

**Sur la méthode.** Les erreurs les plus coûteuses n'étaient pas du calcul. Le 8 septembre, deux agents écrivaient dans `train.html` en même temps ; un commit de rangement a effacé un dossier de résultats et deux sessions de jeu enregistrées par Sacha (`ml/train/README.md`, §1 ; `078d382b2`). Deux entraînements arrivés aux générations 139 et 148 ont disparu, car rien n'était écrit sur le disque (`a1ff192cf`). Claude a listé ses propres erreurs : il a décrit un écran qu'il ne voyait pas, a lu une vitesse plafonnée (140 km/h annoncés, 243 réels, erreur repérée par Sacha), a proposé un critère invalide ; huitième point de la liste : « Sacha a trouvé plusieurs problèmes avant moi » (`RAPPORT-SESSION`, §6). De là viennent les quatre règles du `ml/train/README.md`, toujours citées comme valables en novembre (`BOTS-ML.md`, §1) : notamment, rien n'est annoncé sans être vu ou mesuré ; ce qui n'est pas dans git n'existe pas. La leçon a servi : le 20 octobre, un entraînement coupé à la génération 280 par un redémarrage garde sa progression, sauvée toutes les 10 générations (`9dba1584c`).

## Les décisions

- **Sacha** fixe la règle de départ : la physique des bots doit être « STRICTEMENT isomorphe » (identique) à celle du joueur, « répétée 4× par Sacha » (`COMPTE-RENDU.md`, §1).
- **Sacha** fixe la sélection (8 septembre) : « mettre les voitures avec la même physique et les mêmes règles que le joueur, les mêmes contrôles, et après chacune se démerde pour faire la meilleure course, et la moitié la plus nulle se fait remplacer » (`HANDOVER.md`, §6).
- **Sacha** abandonne le clonage : « je veux juste mettre les voitures avec la même physique et les mêmes règles que le joueur, et après chacune se démerde » (`ml/train/README.md`, §5).
- **Sacha** propose le pilote au sol (`7edd02361`) et le test « pas besoin de cerveau » qui révèle la récitation (`RAPPORT-SESSION`, §3.2).
- **Sacha** trouve les entraînements perdus : « c'est Sacha qui a posé la question » (`ml/train/README.md`, §1).
- **Sacha** choisit de classer les champions par taux de finition (`66edccf84`, « décision propriétaire »).
- **Sacha** demande pour les bots « exactement les mêmes contrôles et habiletés que le joueur » (`5cffd892e`), puis de vérifier « que les simulations ne sont pas hallucinées » (`71bac35b6`), puis « débrouille-toi je veux des bots qui marchent » (`639b798ca`), puis des bots « fonctionnels sur la version actuelle du jeu » (en-tête de `ml/reel/entrainer.js`). C'est ce qui mène à `ml/reel`.
- **Claude** a choisi les réseaux, les notes, la plupart des essais, et rédigé les bilans. Les commits de septembre sont enregistrés au nom du compte git de Sacha, ceux d'octobre au nom « Claude ». Une partie de ceux de septembre porte la mention Claude Opus 5 (et Opus 5.5 le 27/09) ; beaucoup d'autres, du 7 au 21 septembre, ne portent aucune mention. L'un d'eux cite « Fable » dans son titre (`e62f924f4`), un autre une sonde « hermes-verify » (`56d5b0fea`) ; qui a écrit ces commits non signés n'est pas vérifié. Ceux d'octobre portent Claude Sonnet 5, Sonnet 5.5 et Opus 5.5.

**Ce qui diffère le 27 novembre.** Ce jour-là, Sacha revient à la sélection : « un système d'apprentissage neuronal par itération où le bot le moins bon est viré […] juste par sélection naturelle » (`paroles-sacha.md`, 27/11, 15:25 UTC). La spécification du jour s'appuie sur l'essai d'octobre : « un réseau neuronal parti de zéro n'apprendra pas à voler » (`SPECIFICATION.md`, §0). Le réseau naît donc greffé, muet, sur un pilote déjà écrit et lisible. Le moins bon est viré sur sa note cumulée de toutes ses courses, pas sur une manche. Et la course se joue dans le vrai jeu, comme `ml/reel`, plus dans une copie comme `ml/train`.

## Les chiffres

| mesure | valeur | source |
|---|---|---|
| Écart joueur / bots après la physique unique | 0.000e+0 sur 3 000 pas | `c7d78845a`, `RAPPORT-SESSION` §2.1 |
| Évolution pure, graine 7, 25 générations | 64 m → 3 711 m | `f31fd3094` |
| Entrées saturées ou mortes | 8 sur 15 | `RAPPORT-SESSION` §3.7 |
| Récitation : piste apprise / piste inconnue | 2 456 m / 38 m | `RAPPORT-SESSION` §3.2 |
| Taux de pose (atterrissages / décollages), 08/09 | 9 % (19 / 217) | `b926d1a7b` |
| Re-normalisation des entrées | 4 995 → 3 244 m | `ede76bfe3` |
| Manche proportionnelle (contre 150 s fixe) : meilleure distance | 10 330 → 11 801 m | `15dcf1276` |
| Run 300 générations, record | 11 746 ; poses 39 % ; 0 figure | `5799d5bb1` |
| Champion de ce run sur courses entières | 0 % d'arrivées | `6cd575e0b` |
| Champion « figures » | 23 bots / 24 en font ; 1 % d'arrivées | `7cfdb6ec9`, `6cd575e0b` |
| Champion de course resynchronisé (graine 1101, 150 gén.) | 63 % d'arrivées ; 0 figure en l'air | `7029ca1ed` |
| `ml/reel` : 57 générations | 1 391 m → record 3 616 m en 40 s (génération 43) | `6f4dbdc29`, `ml/reel/results/pop-reel-g1.json`, `champion-reel-g1.json` |
| `ml/reel` sur 6 pistes neuves | 3 survivent ; 0,2 figure par partie | `6f4dbdc29` |

Note : le bilan du 21 novembre (`BOTS-ML.md`, §1) écrit « après 300 générations : 0 figure, 9 % de poses réussies ». Les 9 % datent du 8 septembre ; le run de 300 générations donne 39 % de poses.

## Ce qu'on peut montrer

- `ml/sim/apercu-31415.png` — une image : la piste vue de dessus et son profil d'altitude, 7 bots qui suivent le ruban, « 5981 raccourcis disponibles · 0 pris ». Dans git.
- `ml/train/results/runs/run-seed*.json` — 21 fichiers, chacun avec une liste `courbe` (la meilleure distance de chaque génération) : de quoi tracer une courbe d'apprentissage. Dans git ; aucune courbe dessinée n'existe.
- `ml/reel/results/pop-reel-g1.json` — 57 valeurs de l'entraînement sur le vrai jeu (champ `hist`). Dans git.
- `ml/train/archive-2026-09-09/rapports/RAPPORT-SESSION-2026-09-08.md` — le rapport où Claude liste ses huit erreurs. Dans git.
- `ml/train/CRITIC-REPORT.md` — 83 verdicts d'un agent relecteur, du 9 au 25 septembre. Dans git.
- Pas de film ni de rejeu de cette période.

## Sources

Commits (date) : `deacc99ad` 07/09 ; `c7d78845a`, `99c3e9272`, `a38cb9118`, `b3fde665f`, `078d382b2`, `f31fd3094`, `e0f191460`, `ede76bfe3`, `7b0d76c9c`, `7edd02361`, `1e90ef99d`, `b926d1a7b`, `17ccb1a91` 08/09 ; `a1ff192cf`, `c8e69beb0`, `79b1eed60` 09/09 ; `e62f924f4`, `88ab1c2b8`, `216a068b8`, `37aeae373` 10/09 ; `232aa8071` 18/09 ; `0d2969e94`, `56d5b0fea`, `ffcd42ddf`, `15dcf1276`, `66edccf84` 19/09 ; `c14ba2a3e` 21/09 ; `5c88ca73b` 27/09 ; `ecbb531a5`, `7fed399f7`, `5cffd892e`, `9dba1584c`, `d140582c5`, `9c67885a7`, `03b5da4a6`, `639b798ca`, `4685d2286`, `5799d5bb1`, `7cfdb6ec9`, `71bac35b6`, `6cd575e0b`, `7029ca1ed`, `6f77d2678`, `6f4dbdc29` 20/10.

Fichiers lus : `passation/BOTS-ML.md` (§1-2, §5.6) ; `ml/train/README.md` ; `ml/train/train.html` (constantes `SPD`, `AIR_ASSIST`) ; `ml/train/CRITIC-REPORT.md` (en-tête, 123ᵉ passage, liste des passages) ; `ml/train/archive-2026-09-09/rapports/` (`COMPTE-RENDU.md`, `HANDOVER.md`, `RAPPORT-SESSION-2026-09-08.md`, `CRITIC-REPORT.md`) ; `ml/train/results/runs/run-seed1101.json`, `run-seed2024.json`, `run-seed1707.json`, `run-seed1000.json`, `champion.json` ; `ml/train/sim-train.js` (champ `courbe`) ; `ml/reel/README.md`, `cerveau.js`, `entrainer.js`, `results/pop-reel-g1.json`, `results/champion-reel-g1.json` ; `ml/sim/sim.js`, `render.py`, `apercu-31415.png` ; `ml/ecurie/agents/tmp-voltige/paroles-sacha.md` (27/11 ; fichier hors git) ; `ml/ecurie/etude/selection-naturelle/SPECIFICATION.md` (§0) ; `ml/evolution/README.md`, `genome.js` (en-tête ; dossier hors git au 27/11).
