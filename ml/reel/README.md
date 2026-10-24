# ml/reel — des bots qui conduisent le VRAI jeu actuel

`ml/train/train.html` est une **copie du jeu de juillet** : les bots y apprenaient une physique qui n'existe plus
(découvert le 2026-10-20). Ici on charge **`VERSION PRINCIPALE/index.html`, le jeu publié tel quel**, dans un faux
navigateur sans écran, et on le pilote avec les **touches d'un clavier** (les gestionnaires `keydown`/`keyup` du jeu).
Rien du jeu n'est modifié ; chaque mise à jour du jeu est reprise automatiquement au prochain lancement.

| Fichier | Rôle |
|---|---|
| `sim-env-reel.js` | le faux navigateur + une porte de lecture ajoutée à la fin du script (`__EV`, `__S`, `__TRK`) |
| `jeu-reel.js` | `creer()` : `lancer(graine)`, `image()` (1/60 s exactes), `touche()`, `etat()` |
| `cerveau.js` | 15 entrées → 16 neurones → 4 touches (volant, HAUT, BAS, NITRO) |
| `worker.js` | charge le jeu une fois, note des cerveaux (distance parcourue en N secondes) |
| `entrainer.js` | l'évolution, 2 ouvriers en parallèle, reprenable (`--reprendre`) |

**Ce que ça garantit** : mêmes touches, même physique, mêmes règles que le joueur — c'est le jeu lui-même qui tourne.
**Ce que ça ne garantit pas** : que les bots *ressemblent* à des humains. Pour ça il faut des parties de vrais joueurs
à comparer (fréquence des appuis, figures par minute, temps en l'air) — voir la fin de ce fichier quand elles existeront.

Le jeu tourne environ 3 à 4 fois plus vite que le temps réel (certaines maps lourdes, moins). Les scripts décoratifs
`creatures/singe.js`, `dauphin.js`, `vitrail.js` ne sont pas chargés : ils coûtaient 70 % du temps pour rien.
