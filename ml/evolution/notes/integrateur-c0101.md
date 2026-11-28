# L'intégration du 28/11/2026 (portage + lanceurs + mesure), la note de l'intégrateur

Le récit complet, le verdict de la mesure et les gestes sur le Ryzen : **`notes/LIVRAISON-C0101.md`**. Ici, seulement ce que l'intégration a changé.

## Ce qui a changé

| Fichier | Changement |
|---|---|
| `evoluer.js` | `refusNode(cfg, op, o)` : refus (code 2) quand `population.json` court sous un autre Node que `process.version`, avant le verrou et le banc ; sauf `CASHCAR_NODE_FIXE`, `--nouveau-node`, `--banc`, ou `etat/CHANGER-DE-NODE` (une fois, effacé). Option `--nouveau-node` (aide, `lireOptions`). La phrase « la config demande X, la population est née de Y » conseille `lancer.cmd --repartir-de X` au lieu de `node …`. Export `refusNode`. |
| `lancer.cmd` | `set "CASHCAR_NODE_FIXE=%NODE%"` juste avant de lancer `evoluer.js` (CRLF, ASCII contrôlés). |
| `histoire.js` | `archivesAnciennes(cfg)` ; une ligne de plus dans « Où on en est » quand la population est née d'un changement de témoin. |
| `tests/node-epoque.test.js` | nouveau, sans course, 14 contrôles. |
| `INTERFACES.md` | § 9.5 (la fenêtre noire : fait), § 10.3 (le récit et les archives), § 10.4 (Node fixe, garde d'`evoluer.js`), § 10.5 (tâches), § 10.6 (où les formats sont décrits). |
| `README.md` | le témoin (nouvelle section), le Node fixe dans « METTRE À JOUR », deux refus de plus dans « Si ça s'arrête », la limite de 3 jours retirée, les fichiers nouveaux. |
| `notes/LIVRAISON-C0101.md` | nouveau. |

Rien dans `code/`, `VERSION PRINCIPALE/`, `ml/bot/`, `ml/reel/`, `ml/labo/`, `ml/ecurie/`. `config.json` : `"temoin"` reste `c0025`. Aucune tâche posée.

## Les lots tiennent-ils ensemble ?

- **Portage × lanceurs** : `archiverEtat` (`--repartir-de`) garde en place `node.txt*`, `NODE-REFUSE.txt`, `node-choix-*`, `CHANGER-DE-NODE`, `machine.json`.
  Après l'archivage, `population.json` n'existe plus un instant : `node-fixe.js` a déjà choisi, et la population neuve naît avec `process.version` (celui de
  `node.txt` sous `lancer.cmd`). Le lancement suivant attend donc le même Node. Cohérent.
- **Le trou trouvé** : `--repartir-de` se tape à la main ; sur le Ryzen, `node` tout court est v24.22.1. La population neuve serait née dans une époque
  v24.22.1, puis chaque `lancer.cmd` (`node.txt` = v24.22.3) aurait refusé. Fermé par la garde d'`evoluer.js` (l'ancienne population est en v24.22.3 :
  refus avant tout archivage) et par la consigne `lancer.cmd --repartir-de c0101` (lancer.cmd passe ses options).
- **Demande n° 1 des lanceurs** (évoluer.js refuse un autre Node) : faite, par une variable d'environnement plutôt qu'en déplaçant l'effacement du marqueur
  (moins de changements dans `node-fixe.js` et ses 76 contrôles). **Demande n° 2** (README) : faite par le relecteur des lanceurs et complétée ici.
  **Demande n° 3** (mots de l'arbre) : faite par le portage (`traces.test.js` 87/87).
- **Rien n'était demandé pour `commun.js`.**

## Ce qui reste

- Le coffre (10 / 40 graines) : `LIVRAISON-C0101.md` § 1.
- Le marqueur consommé par `lancer.cmd` avant un `evoluer.js` qui sort sans changer d'époque : non corrigé (bruyant, sans danger).
- `node-fixe.js` sous `lancer.cmd --etat X` ne regarde que `etat/` ; `evoluer.js`, lui, regarde l'état demandé (mais `CASHCAR_NODE_FIXE` le fait sauter sous lancer.cmd).
- `alarmeDistance` pour 121 gènes ; les tests lents ; le Ryzen lui-même.

## Pour Sacha, en mots simples

Rien ne change tant que la mise à jour n'est pas fusionnée sur le Ryzen. Après : passe toujours par `lancer.cmd` (il prend le bon Node) ; un `node …` tapé
avec le mauvais Node refuse maintenant de partir au lieu d'effacer les notes en silence. Le choix du pilote de départ (c0025 ou c0101) attend la fin de
la mesure et la décision de Fable.
