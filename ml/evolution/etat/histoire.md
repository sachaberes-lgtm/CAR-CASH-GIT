# Le récit de la sélection naturelle des bots

*Écrit par la sélection elle-même (`ml/evolution/histoire.js`), à partir de ses journaux, à la fin de chaque génération. Rien n'y est ajouté à la main ; les identifiants entre guillemets inversés (`77ab12cd`) sont les huit premiers caractères du nom d'un pilote, comme dans l'arbre généalogique (`arbre.html`). Dernière mise à jour : 28/11/2026 à 13 h 00.*

Les mots : le **palier** dit jusqu'où un pilote va dans une course ; l'**écart aux joueurs** dit à quel point il conduit autrement que les vrais joueurs (0 = comme eux) ; la **note F** = palier − 4 × écart décide qui reste. Le **témoin** est le pilote de départ, écrit à la main, jamais modifié. Le **champion** est le meilleur pilote prouvé sur des courses neuves ; au début, c'est le témoin. Le **coffre** : 40 courses qui ne servent jamais à l'entraînement, le seul vrai juge. Le **meneur** est le mieux noté des autres ; il tente parfois un **sacre** (rejouer contre le champion sur des courses neuves). Un **immigré** est une copie très changée du champion, ajoutée pour garder de la variété. Une **nouvelle époque** commence quand le jeu ou le bot change : les notes repartent de zéro et le champion doit se **revalider** face au témoin.

## Où on en est

1. **16 générations finies** depuis le 28/11/2026 à 00 h 46 (12 h 03) ; phase A ; la génération 16 est en cours.
2. 116 pilotes sont nés (dont 20 au départ), 90 ont été renvoyés, 26 vivent.
3. Le champion est encore **le témoin** : aucun pilote n'a encore prouvé, sur des courses neuves, qu'il faisait mieux.
4. Le meneur de la dernière génération (le mieux noté après le champion) est `a8df36fb` : palier 8,04, écart aux joueurs 0,81, note F 4,8, 72 courses.
5. Le témoin, pilote-voltige jamais modifié : palier 6,90, écart aux joueurs 0,84, note F 3,5, 192 courses.
6. 3 tentatives de sacre, 0 réussie. En moyenne, l'avance du meneur fondait de 1,58 point de note sur les courses neuves : c'est la part de chance qu'il avait eue à l'entraînement.
7. Dernière mesure du coffre (génération 0) : le champion est encore le témoin ; palier moyen 6,15 sur les 40 courses du coffre.
8. **La sélection apprend-elle vraiment ?** On ne le sait pas encore : tant que le champion est le témoin, le coffre n'a rien à comparer.
9. Diversité : la distance moyenne entre les pilotes vivants est passée de 0,023 (génération 0) à 0,053 (génération 15) (0 = tous pareils).
10. La machine : 5 104 courses jouées, 0,0 % non mesurées.

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

### Génération 6 — 28/11/2026 à 06 h 11

6 naissances (1 immigré, 4 mutations, 1 croisement). 6 renvois : les notes F les plus basses. Le meneur est `92baca8c` : palier 8,09, écart aux joueurs 0,86, note F 4,7, 48 courses. 312 courses jouées en 46 min.

### Génération 7 — 28/11/2026 à 06 h 51

6 naissances (1 immigré, 2 mutations, 3 croisements). 6 renvois : les notes F les plus basses. Le meneur est `92baca8c` : palier 7,93, écart aux joueurs 0,84, note F 4,6, 60 courses. 312 courses jouées en 40 min.

### Génération 8 — 28/11/2026 à 07 h 41

6 naissances (1 immigré, 5 mutations). 6 renvois : les notes F les plus basses. Le meneur est `92baca8c` : palier 7,91, écart aux joueurs 0,84, note F 4,5, 72 courses. 312 courses jouées en 50 min.

### Génération 9 — 28/11/2026 à 08 h 26

6 naissances (1 immigré, 2 croisements, 3 mutations). 6 renvois : les notes F les plus basses. Le meneur est `61331402` : palier 7,75, écart aux joueurs 0,81, note F 4,5, 60 courses. 312 courses jouées en 45 min.

### Génération 10 — 28/11/2026 à 09 h 14

6 naissances (1 immigré, 5 mutations). 6 renvois : les notes F les plus basses. Le meneur est `61331402` : palier 7,55, écart aux joueurs 0,82, note F 4,3, 72 courses. 360 courses jouées en 48 min. Validation : le meneur `61331402` rejoue contre le champion `19e3767c` sur 24 courses neuves. Son avance de note y est de −0,54 ± 1,07 (elle était de +0,95 à l'entraînement). Il n'est pas sacré : avance de note pas assez nette (il faut plus de 2 fois l'incertitude).

### Génération 11 — 28/11/2026 à 10 h 03

6 naissances (1 immigré, 1 croisement, 4 mutations). 6 renvois : les notes F les plus basses. Le meneur est `167015a4` : palier 7,82, écart aux joueurs 0,81, note F 4,6, 48 courses. 312 courses jouées en 49 min.

### Génération 12 — 28/11/2026 à 10 h 42

6 naissances (1 immigré, 2 croisements, 3 mutations). 6 renvois : les notes F les plus basses. Le meneur est `a50c97b7` : palier 7,57, écart aux joueurs 0,79, note F 4,4, 84 courses. 312 courses jouées en 39 min.

### Génération 13 — 28/11/2026 à 11 h 23

6 naissances (1 immigré, 2 croisements, 3 mutations). 6 renvois : les notes F les plus basses. Le meneur est `c7dadd65` : palier 8,50, écart aux joueurs 0,81, note F 5,2, 48 courses. 312 courses jouées en 41 min.

### Génération 14 — 28/11/2026 à 12 h 01

6 naissances (1 immigré, 2 croisements, 3 mutations). 6 renvois : les notes F les plus basses. Le meneur est `c7dadd65` : palier 8,19, écart aux joueurs 0,82, note F 4,9, 60 courses. 312 courses jouées en 38 min.

### Génération 15 — 28/11/2026 à 12 h 49

6 naissances (1 immigré, 2 croisements, 3 mutations). 6 renvois : les notes F les plus basses. Le meneur est `a8df36fb` : palier 8,04, écart aux joueurs 0,81, note F 4,8, 72 courses. 360 courses jouées en 48 min. Validation : le meneur `a8df36fb` rejoue contre le champion `19e3767c` sur 24 courses neuves. Son avance de note y est de +0,03 ± 0,56 (elle était de +1,25 à l'entraînement). Il n'est pas sacré : avance de note pas assez nette (il faut plus de 2 fois l'incertitude).

### Génération 16 — en cours

6 naissances (1 immigré, 3 croisements, 2 mutations). Les courses sont en train de se jouer.

