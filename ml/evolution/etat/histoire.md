# Le récit de la sélection naturelle des bots

*Écrit par la sélection elle-même (`ml/evolution/histoire.js`), à partir de ses journaux, à la fin de chaque génération. Rien n'y est ajouté à la main ; les identifiants entre guillemets inversés (`77ab12cd`) sont les huit premiers caractères du nom d'un pilote, comme dans l'arbre généalogique (`arbre.html`). Dernière mise à jour : 28/11/2026 à 06 h 00.*

Les mots : le **palier** dit jusqu'où un pilote va dans une course ; l'**écart aux joueurs** dit à quel point il conduit autrement que les vrais joueurs (0 = comme eux) ; la **note F** = palier − 4 × écart décide qui reste. Le **témoin** est le pilote de départ, écrit à la main, jamais modifié. Le **champion** est le meilleur pilote prouvé sur des courses neuves ; au début, c'est le témoin. Le **coffre** : 40 courses qui ne servent jamais à l'entraînement, le seul vrai juge. Le **meneur** est le mieux noté des autres ; il tente parfois un **sacre** (rejouer contre le champion sur des courses neuves). Un **immigré** est une copie très changée du champion, ajoutée pour garder de la variété. Une **nouvelle époque** commence quand le jeu ou le bot change : les notes repartent de zéro et le champion doit se **revalider** face au témoin.

## Où on en est

1. **6 générations finies** depuis le 28/11/2026 à 00 h 46 (4 h 39) ; phase A ; la génération 6 est en cours.
2. 56 pilotes sont nés (dont 20 au départ), 30 ont été renvoyés, 26 vivent.
3. Le champion est encore **le témoin** : aucun pilote n'a encore prouvé, sur des courses neuves, qu'il faisait mieux.
4. Le meneur de la dernière génération (le mieux noté après le champion) est `d52d353b` : palier 8,16, écart aux joueurs 0,83, note F 4,8, 48 courses.
5. Le témoin, pilote-voltige jamais modifié : palier 6,74, écart aux joueurs 0,85, note F 3,3, 72 courses.
6. 1 tentative de sacre, 0 réussie. En moyenne, l'avance du meneur fondait de 2,04 point de note sur les courses neuves : c'est la part de chance qu'il avait eue à l'entraînement.
7. Dernière mesure du coffre (génération 0) : le champion est encore le témoin ; palier moyen 6,15 sur les 40 courses du coffre.
8. **La sélection apprend-elle vraiment ?** On ne le sait pas encore : tant que le champion est le témoin, le coffre n'a rien à comparer.
9. Diversité : la distance moyenne entre les pilotes vivants est passée de 0,023 (génération 0) à 0,039 (génération 5) (0 = tous pareils).
10. La machine : 1 888 courses jouées, 0,0 % non mesurées.

## Génération par génération

*De la plus ancienne à la plus récente.*

### Génération 0 — 28/11/2026 à 01 h 26

La population de départ : 20 pilotes, le témoin (pilote-voltige, écrit à la main) et 19 mutants de départ, des copies du témoin aux réglages un peu changés. Aucun renvoi. 280 courses jouées en 40 min. Coffre (nouvelle époque) : le champion est encore le témoin ; palier moyen 6,15 sur les 40 courses du coffre.

- Premier lancement : la population de départ est née.
- Contrôle d'identité réussi : le pilote fabriqué à partir du génome du témoin conduit exactement comme pilote-voltige, au bit près.

### Génération 1 — 28/11/2026 à 02 h 15

6 naissances (1 immigré, 4 mutations, 1 croisement). 6 renvois : les notes F les plus basses. 312 courses jouées en 49 min.

### Génération 2 — 28/11/2026 à 03 h 04

6 naissances (1 immigré, 3 mutations, 2 croisements). 6 renvois : les notes F les plus basses. 312 courses jouées en 49 min.

### Génération 3 — 28/11/2026 à 03 h 52

6 naissances (1 immigré, 3 mutations, 2 croisements). 6 renvois : les notes F les plus basses. Le meneur est `bbd840aa` : palier 8,05, écart aux joueurs 0,82, note F 4,7, 48 courses. 312 courses jouées en 48 min.

### Génération 4 — 28/11/2026 à 04 h 30

6 naissances (1 immigré, 3 mutations, 2 croisements). 6 renvois : les notes F les plus basses. Le meneur est `bbd840aa` : palier 7,64, écart aux joueurs 0,77, note F 4,6, 60 courses. 312 courses jouées en 38 min.

### Génération 5 — 28/11/2026 à 05 h 25

6 naissances (1 immigré, 1 croisement, 4 mutations). 6 renvois : les notes F les plus basses. Le meneur est `d52d353b` : palier 8,16, écart aux joueurs 0,83, note F 4,8, 48 courses. 360 courses jouées en 55 min. Validation : le meneur `d52d353b` rejoue contre le champion `19e3767c` sur 24 courses neuves. Son avance de note y est de −0,57 ± 1,17 (elle était de +1,48 à l'entraînement). Il n'est pas sacré : avance de note pas assez nette (il faut plus de 2 fois l'incertitude).

### Génération 6 — en cours

6 naissances (1 immigré, 4 mutations, 1 croisement). Les courses sont en train de se jouer.

