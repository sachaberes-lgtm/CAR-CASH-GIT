# Test B, « le tri » : la prédiction, écrite avant de jouer (28/11/2026)

Écrite **avant toute course** du test B. Aucune partie de bot n'existe encore dans ce dossier au moment où ce fichier est écrit.
Les seuls calculs déjà faits sont sans course : le choix des graines (sur le palier final seulement) et la puissance du juge humains contre humains
(`sorties/puissance-humhum-*.json`, faits avec `juger.js`, sans aucune partie de bot).

## 1. La question

Chez les deux joueurs enregistrés, une partie faible est une partie qui meurt tôt (`../LISEZ-MOI.md` § 2.3). Si c'est vrai aussi du bot, une course
de c0025 qui finit au palier k pourrait servir d'adversaire de niveau k, sans fabriquer un autre pilote (§ 6.3, « la banque »).
**Une course de c0025 qui meurt tôt (palier final 4 à 8) passe-t-elle, devant `ml/bot/discerner.js`, pour une partie de joueur ?**

## 2. L'échantillon (choisi avant de jouer, sur le seul palier final)

Source : `../../banc-des-genes/etat/courses-2026-48.jsonl`, bras `depart` (le génome du témoin c0025, `19e3767cc346`), 96 lignes, toutes mesurées,
époque des courses `66f66d2ae1c2`, jeu `cashcar-v1627 e7e1eed4718f`, régime allégé, tmax 900 s.
Règle : les lignes dont le palier final est entre 4 et 8, triées par graine croissante, les 40 premières (53 lignes passent le filtre).

Les 40 graines (palier final du banc entre parenthèses) :

3000037 (4), 3000111 (6), 3000222 (7), 3000259 (5), 3000333 (6), 3000370 (4), 3000444 (5), 3000592 (6), 3000666 (8), 3000703 (7),
3000740 (7), 3000777 (5), 3000851 (4), 3000925 (6), 3000962 (7), 3000999 (8), 3001073 (6), 3001184 (4), 3001295 (5), 3001554 (7),
3001665 (7), 3001702 (4), 3001813 (5), 3001850 (6), 3001887 (4), 3001924 (8), 3001961 (8), 3001998 (5), 3002109 (7), 3002146 (8),
3002294 (5), 3002331 (4), 3002368 (7), 3002479 (7), 3002516 (4), 3002553 (7), 3002590 (8), 3002664 (6), 3002701 (7), 3002775 (7).

Effectifs par palier : 4 → 8, 5 → 7, 6 → 7, 7 → 12, 8 → 6. Tranches : **4-5 : 15 courses ; 6-8 : 25 courses.**
(En lisant les lignes pour ce choix, la survie a été affichée en même temps : médiane 109,4 s, de 43 à 162 s. Elle n'a servi à rien dans le choix.)

## 3. La preuve d'identité, avant de juger

L'époque des courses a changé depuis le banc : `66f66d2ae1c2` alors, `ad6cc000299a` aujourd'hui (le lot « genes v4 » a touché `ml/evolution`),
le jeu est le même (`cashcar-v1627 e7e1eed4718f`). Le texte du pilote écrit aujourd'hui pour c0025 n'a plus le même sha (`6d76492d…` contre `6e05036f…`
au banc), avec le même identifiant de génome `19e3767cc346`.
Donc, avant tout : les **deux premières graines** (3000037, 3000111) sont rejouées et comparées à leur ligne du banc : **même palier final, même survie,
même cause** (et, en plus, les empreintes de course, de vues et de touches). Si l'une diffère : **arrêt**, rien n'est jugé, et c'est dit.
Deux pilotes sont possibles : le texte gardé par le banc (`etat/pilotes/6e05036f219e.js`) et le texte que la sélection écrit aujourd'hui. Le premier est
essayé d'abord (c'est la course du banc) ; le second est comparé sur les mêmes deux graines pour savoir si l'époque a changé quelque chose.

## 4. Comment le juge est employé

- `ml/bot/discerner.js`, sans rien changer : humains « clavier » (les parties de Sacha au clavier : 10 parties, 147 fenêtres), fenêtres de 10 s,
  les 40 parties du bot dans une note au format de `noter.js --parties`. Ce qu'on rend : son AUC, son témoin à étiquettes mélangées, ses mesures seules.
- `tri/juger.js` : la recopie du même juge (même code), qui peut en plus **ne garder des joueurs que les fenêtres finies avant T secondes**, avec
  T = la survie médiane des 40 courses rejouées (≈ 109 s si elles sont identiques au banc). Ainsi « meurt tôt » n'est pas jugé contre « dure
  longtemps » (les joueurs gardent alors 72 fenêtres sur 147). Contrôle : sans troncature, `juger.js` doit redonner l'AUC de `discerner.js`.
- Par tranche de palier final (4-5 : 15 courses ; 6-8 : 25), avec et sans troncature.
- En plus, sans course : les 20 parties de `../../../agents/tmp-voltige/note-voltige4-t900.json` (c0025 tout-venant, un autre jour du jeu), par le même juge.

## 5. Le témoin humains contre humains, et ce que vaut le juge (dit avant)

Mesuré sans aucune partie de bot (`juger.js --humhum 200`) : les 10 parties « clavier » partagées 200 fois au hasard en deux moitiés de 5, chaque moitié
jugée contre l'autre par le même juge.

| fenêtres des joueurs | AUC moyenne | écart-type | q05 | q95 | max | 95 % des partages à moins de… de 0,50 |
|---|---|---|---|---|---|---|
| toutes (147) | 0,457 | 0,113 | 0,219 | 0,607 | 0,677 | 0,281 |
| finies avant 109,5 s (72) | 0,452 | 0,110 | 0,287 | 0,642 | 0,716 | 0,216 |

Ce que cela dit, **avant** de jouer :
- un humain contre un autre lot du même humain ne dépasse jamais 0,72 sur 200 partages : le seuil 0,75 est juste au-dessus du bruit du juge ;
  **une AUC sous 0,75 n'est donc pas une preuve d'indiscernabilité, seulement l'absence de preuve contraire** ;
- l'incertitude d'une AUC avec 10 parties d'un seul joueur : environ ± 0,2 autour de 0,5 (q05-q95) ; près de 1, elle est plus petite (on ne l'a pas
  mesurée) ; un écart entre deux AUC de moins de 0,1 ne veut rien dire ;
- le juge apprend « Sacha au clavier », pas « un joueur » : 10 parties, 1 joueur, aucun débutant.

## 6. Le verdict, annoncé

Sur l'AUC à fenêtres de temps égales (la comparaison voulue), l'AUC entière dite à côté :
- **AUC ≤ 0,75** : le tri vaut pour le bas de l'échelle (au sens faible du § 5 : pas de preuve qu'on le distingue) ;
- **AUC ≥ 0,90** : l'idée est morte (une course qui meurt tôt se distingue toujours d'un joueur, le tri ne suffit pas) ;
- **entre les deux** : indécis.
Si les deux AUC (entière et à temps égal) tombent dans deux cases différentes, c'est l'AUC à temps égal qui décide, et le désaccord est dit.

## 7. Ce que j'attends (pari, pas critère)

**AUC ≥ 0,90, l'idée morte.** Raison : le 26/11, 20 courses ordinaires de c0025 donnaient 0,97 (`../../../agents/tmp-voltige/discerner-voltige.json`),
et ce qui trahissait (ondulation z = 4,0, nitro 30 % contre 63 %, vols bas) ne dépend pas de l'heure de la mort. Couper les joueurs à 109 s devrait
rapprocher la nitro (les joueurs en ont plus la première minute, § 2.4) : je m'attends à ce que l'écart **grandisse** sur la nitro, pas qu'il baisse.
