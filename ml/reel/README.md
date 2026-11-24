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

## Depuis le 23/11/2026 — étape 1 : les bots vivent dans `ml/bot`

Le contrat du bot (ses yeux, ses gestes, ses doigts, sa note) est dans **`ml/bot/README.md`**. `cerveau.js`, `worker.js` et `entrainer.js`
(le petit réseau d'octobre) restent pour mémoire et pour `etape0.js` / `repetable.js`.

Deux réparations du simulateur ce jour-là, trouvées dès que les courses ont dépassé 110 s (celles de l'étape 0 faisaient 60 s) :
- **Le portail de fin de piste ne passait pas.** Le jeu attend deux images d'écran (`requestAnimationFrame`) avant de bâtir la piste suivante ;
  ici elles ne battaient jamais, la caisse restait tenue à la bouche du portail. `sim-env-reel.js` laisse maintenant passer ces demandes
  pendant l'attente du portail (`PORTV.att`), et seulement là — `loop()` exclue, c'est `jeu-reel` qui l'appelle.
- **La grotte bâtie à un portail n'arrivait jamais** : elle se creuse dans un Worker, et celui du simulateur ne répond pas. `jeu-reel.js`
  passe `grotteworker=0`, l'interrupteur du jeu qui la creuse sur place.

Une course enchaîne donc les maps comme une vraie partie. La vitesse baisse sur les maps lourdes bâties en route (jade, grotte) :
compter 2 à 4 × le temps réel sur une course de plusieurs minutes, contre 6,8 × sur la première piste seule.

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

## État au 24/11/2026 — étape 1 bis (`ml/labo/README.md`)

Trois ouvertures, sans effet tant qu'on ne s'en sert pas (contrôle : les 20 courses du bot de référence redonnent leurs 20 empreintes
du 23/11, et les 4 rejeux gardés sont exacts) :
- `jeu-reel.js` : `creer({charge, noms})` accepte un autre chargeur que le faux navigateur. La salle de projection y met le jeu chargé
  dans un **vrai** navigateur ; la chauffe, la photo, la remise et la graine restent ce même code.
- `sim-env-reel.js` : les portes de lecture (`__EV`, `__TRK`, `__S`) sont sorties dans `PORTES`, pour que le navigateur pose les mêmes ;
  le générateur de hasard rend son état (`Math.random.__etat()`, et `__etat(v)` pour le poser).

**Ce que cette étape a montré du simulateur.**
- Sa fausse page ne fait pas tourner la couche d'effets du vrai jeu comme un navigateur : `classList.contains` y répond toujours non (la
  flamme du bouton NITRO ne s'anime jamais), et presque chaque image tire un nombre de valeurs au hasard différent de celui d'un vrai
  navigateur. Pour la conduite, les routes et l'argent, ça ne change rien **une fois le hasard recalé** (`HASARD_CODE`, `ml/bot/piloter.js`).
- **Il tourne au régime MAXIMUM du jeu, quel que soit le PC** (`POSTE.r = 3`, `ALLEGE = false`) : sans carte graphique à juger, le jeu le
  prend pour un poste récent. Crypto City est donc à son tirage. Sur un PC à puce intégrée ou un téléphone, le vrai jeu est en version
  allégée, sans Crypto City : c'est le cas des 14 parties de l'étalon. Voir `passation/BOTS-ML.md`, étape 1 bis, et le point 6 de la section 7.
- Course de quatre maps rejouée dans un vrai navigateur, au même régime, hasard recalé : **la même course, à chaque décision** : 1 879 décisions sur 1 879, 11 268 images, trois portails, même fin (roche) et même argent (52 545,35) ; aucune image n'a eu besoin d'être rattrapée.
