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
| `etape0.js` | (22/11) la mesure de l'étape 0 BOTS-ML : vitesse + même graine = même course ? → `results/etape0.json` |
| `repetable.js` | (22/11) le contrôle map par map (même processus, et deux processus neufs) → `results/repetable.json`. **À relancer après chaque mise à jour du jeu.** |

**Ce que ça garantit** : mêmes touches, même physique, mêmes règles que le joueur — c'est le jeu lui-même qui tourne.
**Ce que ça ne garantit pas** : que les bots *ressemblent* à des humains. Pour ça il faut des parties de vrais joueurs
à comparer (fréquence des appuis, figures par minute, temps en l'air) — voir la fin de ce fichier quand elles existeront.

Le jeu tourne environ 3 à 4 fois plus vite que le temps réel (certaines maps lourdes, moins). Les scripts décoratifs
`creatures/singe.js`, `dauphin.js`, `vitrail.js` ne sont pas chargés : ils coûtaient 70 % du temps pour rien.

## État au 22/11/2026 — étape 0 du plan BOTS-ML (`passation/BOTS-ML.md`)

**Vitesse** (`node etape0.js`, 3 graines × 60 s, PC de Sacha, Node 24) : **411 images/s = 6,8 × le temps réel** en course
(83 à 666 selon la map et la course), chargement 5 s. Hors course : bâtir une map coûte de 2 à 25 s (la grotte est la plus lourde).

**Même graine = même course ?**
- **Processus neuf : OUI, au bit près.** Deux processus neufs, même graine, même map → même trace. C'est la garantie des **rejeux**
  (un rejeu = commit + graine + map + touches, rejoué dans un processus neuf).
- **Même processus, après d'autres courses : presque.** Identique au bit près sur la ville, la jade et le canyon (30 s) ; ailleurs,
  identique 9 à 34 s puis un écart sur la NITRO (0,24 de jauge d'un côté, pas de l'autre), qui grossit ensuite. Assez pour comparer des
  cerveaux sur 20 graines ; pas assez pour un rejeu. Piste non suivie : un état de la machine NITRO / double appui qui n'est ni une
  variable de haut niveau ni une propriété d'une fonction (une variable locale d'une fonction auto-appelée, sans doute).

**Ce qui a été changé dans le simulateur** (jamais dans le jeu) pour en arriver là :
- `sim-env-reel.js` : three.js pris dans `VERSION PRINCIPALE/vendor` si `ml/sim` n'a pas le sien ; **pas d'écran titre** (sinon la 1re
  touche du bot lançait l'intro du studio, qui figeait `loop()`) ; **horloge virtuelle** (Date suit l'horloge du jeu, les minuteries
  partent à l'heure du jeu, une par image au plus pour une chaîne `setTimeout(f,0)`) ; **le jeu a son propre `Math`** (three.js ne pioche
  plus dans la suite de la graine) ; le hasard du chargement est semé ; un **Worker qui ne répond jamais** (le modèle des nuages, pur décor,
  coûtait 82 s d'un bloc sans lui).
- `jeu-reel.js` : `?intro=ancien&prebati=0` ; toutes les courses passent par `resetGame()` (un seul `start()`, de chauffe) ; la piste est
  attendue (elle se bâtit dans les 1res images de `loop()`) ; `lancer(graine, {carte, meteo})` impose la map, sinon la graine la tire ;
  avant chaque course : le tirage des maps et ses mémoires (`SF_HIST`, `GRT_VUS`) repartent de zéro, la sauvegarde en mémoire revient à
  son état de départ, l'horloge revient à l'heure de la chauffe, et **~2 700 variables du jeu** (données pures, champs de données des
  objets, réserves de particules, propriétés des fonctions comme `loop._ms`, pose de la caisse et de la caméra) sont remises comme à la
  chauffe. Ce qui tient un maillage, une matière, le DOM n'est jamais touché : `resetGame()` / `newTrack()` le rebâtissent.
