# Le récit de la sélection naturelle des bots

*Écrit par la sélection elle-même (`ml/evolution/histoire.js`), à partir de ses journaux, à la fin de chaque génération. Rien n'y est ajouté à la main ; les identifiants entre guillemets inversés (`77ab12cd`) sont les huit premiers caractères du nom d'un pilote, comme dans l'arbre généalogique (`arbre.html`). Dernière mise à jour : 28/11/2026 à 17 h 00.*

Les mots : le **palier** dit jusqu'où un pilote va dans une course ; l'**écart aux joueurs** dit à quel point il conduit autrement que les vrais joueurs (0 = comme eux) ; la **note F** = palier − 4 × écart décide qui reste. Le **témoin** est le pilote de départ, écrit à la main, jamais modifié. Le **champion** est le meilleur pilote prouvé sur des courses neuves ; au début, c'est le témoin. Le **coffre** : 40 courses qui ne servent jamais à l'entraînement, le seul vrai juge. Le **meneur** est le mieux noté des autres ; il tente parfois un **sacre** (rejouer contre le champion sur des courses neuves). Un **immigré** est une copie très changée du champion, ajoutée pour garder de la variété. Une **nouvelle époque** commence quand le jeu ou le bot change : les notes repartent de zéro et le champion doit se **revalider** face au témoin.

## Où on en est

1. **21 générations finies** depuis le 28/11/2026 à 00 h 46 (16 h 02) ; phase B, 2e époque ; la génération 21 est en cours.
2. 146 pilotes sont nés (dont 20 au départ), 120 ont été renvoyés, 26 vivent.
3. Le champion est encore **le témoin** : aucun pilote n'a encore prouvé, sur des courses neuves, qu'il faisait mieux.
4. Le meneur de la dernière génération (le mieux noté après le champion) est `3ee64f88` : palier 7,50, écart aux joueurs 0,79, note F 4,3, 60 courses.
5. Le témoin, pilote-voltige (c0025), jamais modifié : palier 6,72, écart aux joueurs 0,80, note F 3,5, 60 courses.
6. 3 tentatives de sacre, 0 réussie. En moyenne, l'avance du meneur fondait de 1,58 point de note sur les courses neuves : c'est la part de chance qu'il avait eue à l'entraînement.
7. Dernière mesure du coffre (génération 16) : le champion est encore le témoin ; palier moyen 6,15 sur les 40 courses du coffre.
8. **La sélection apprend-elle vraiment ?** On ne le sait pas encore : tant que le champion est le témoin, le coffre n'a rien à comparer.
9. Diversité : la distance moyenne entre les pilotes vivants est passée de 0,023 (génération 0) à 0,057 (génération 20) (0 = tous pareils).
10. La machine : 6 704 courses jouées, 0,0 % non mesurées.

## Les mutations comptent-elles ?

La sélection garde les enfants qui ont eu les meilleures courses ; ça ne sert que si un enfant « bon » l'est vraiment, et pas seulement chanceux. La mesure le vérifie sans jouer une course de plus : chaque enfant joue les routes de sa génération de naissance, puis celles de la suivante ; si les mutations comptent, un enfant bon sur les premières l'est aussi sur les secondes. **Aujourd'hui : trop tôt pour le dire (133 enfants mesurés sur 191).** La mesure ne conclut pas avant 191 enfants mesurés, même si les chiffres ont l'air nets. Corrélation entre les deux moitiés : 0,18 [entre −0,10 et 0,31] ; écart vrai entre enfants τ ≈ 0,44 palier [entre 0,00 et 0,69]. Courses jouées pour rien (un enfant qui rejoue exactement la course de son parent sur la même route) : 1320 sur 5718 (23 %), 14,6 % du temps d'entraînement.

## Génération par génération

*De la plus ancienne à la plus récente.*

### Génération 0 — 28/11/2026 à 01 h 26

La population de départ : 20 pilotes, le témoin (pilote-voltige (c0025)) et 19 mutants de départ, des copies du témoin aux réglages un peu changés. Aucun renvoi. 280 courses jouées en 40 min. Coffre (nouvelle époque) : le champion est encore le témoin ; palier moyen 6,15 sur les 40 courses du coffre.

- Premier lancement : la population de départ est née.
- Contrôle d'identité réussi : le pilote fabriqué à partir du génome du témoin conduit exactement comme le fichier écrit du témoin, au bit près.

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

### Génération 16 — 28/11/2026 à 13 h 54

6 naissances (1 immigré, 3 croisements, 2 mutations). 6 renvois : les notes F les plus basses. 352 courses jouées en 43 min. Coffre (nouvelle époque) : le champion est encore le témoin ; palier moyen 6,15 sur les 40 courses du coffre.

- Nouvelle époque : modele.js a changé (le jeu, les yeux ou la main du bot). Les notes repartent de zéro ; les pilotes restent.
- Contrôle d'identité réussi : le pilote fabriqué à partir du génome du témoin conduit exactement comme le fichier écrit du témoin, au bit près.

### Génération 17 — 28/11/2026 à 14 h 38

6 naissances (1 immigré, 3 croisements, 2 mutations). Dont 1 né par greffe (le champion du moment, recopié avec des interrupteurs forcés) : `2e9b5cc4` (raccCartes_ville = 0). 6 renvois : les notes F les plus basses. 312 courses jouées en 44 min.

- Greffe : `2e9b5cc4` est né du champion `19e3767c`, copié tel quel, avec raccCartes_ville = 0 (rien d'autre ne change).

### Génération 18 — 28/11/2026 à 15 h 21

6 naissances (1 immigré, 4 mutations, 1 croisement). 6 renvois : les notes F les plus basses. 312 courses jouées en 43 min.

### Génération 19 — 28/11/2026 à 16 h 02

6 naissances (1 immigré, 2 croisements, 3 mutations). Dont 1 né par greffe (le champion du moment, recopié avec des interrupteurs forcés) : `e0131036` (bordOn = 1). 6 renvois : les notes F les plus basses. Le meneur est `22b93a03` : palier 7,73, écart aux joueurs 0,80, note F 4,5, 48 courses. 312 courses jouées en 41 min.

- Greffe : `e0131036` est né du champion `19e3767c`, copié tel quel, avec bordOn = 1 (rien d'autre ne change).
- Changement de phase : A → B (20 générations sans sacre, 19 générations dans la phase A). Les petits réseaux de neurones peuvent maintenant changer un peu à chaque naissance.

### Génération 20 — 28/11/2026 à 16 h 47

6 naissances (1 immigré, 4 mutations, 1 croisement). Dont 1 né par greffe (le champion du moment, recopié avec des interrupteurs forcés) : `a886019a` (slalomOn = 1). 6 renvois : les notes F les plus basses. Le meneur est `3ee64f88` : palier 7,50, écart aux joueurs 0,79, note F 4,3, 60 courses. 312 courses jouées en 45 min.

- Greffe : `a886019a` est né du champion `19e3767c`, copié tel quel, avec slalomOn = 1 (rien d'autre ne change).

### Génération 21 — en cours

6 naissances (1 immigré, 5 mutations). Dont 1 né par greffe (le champion du moment, recopié avec des interrupteurs forcés) : `9c7a96ea` (bordOn = 1, slalomOn = 1). Les courses sont en train de se jouer.

