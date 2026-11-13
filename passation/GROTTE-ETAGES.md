# La grotte en étages, libre et variée (2026-11-13)

## La demande (Sacha, en trois messages)
1. « Jouer sur l'endroit et l'envers : la grotte a un endroit et un envers dans la vraie vie, mais la route n'en tient pas compte. On ride n'importe où : parfois sur une paroi, puis une torsade en longeant le mur, puis un module (un slalom entre des stalagmites). Beaucoup plus de variations, des trucs atypiques, une exploration à chaque fois, une descente chelou et différente à chaque fois. Qu'on s'amuse : des droites parfois, des slaloms parfois, des virages parfois, des torsades parfois, mais jamais trop d'une seule chose. »
2. « Une ambiance Minecraft quand on rentre dans une grotte : la map descend, on arrive à chaque fois dans des nouveaux segments, on a vraiment l'impression de descendre explorer une grotte. Là, elle est trop linéaire. »
3. « Pas de torsade trop serrée, et pas plus de 10 secondes dans une même direction. »

## Ce qui a été fait (code/maps/grottes-1.js, grottes-2.js, grotte-travailleur.js)
Tout est derrière `GRT_LIB` (réglages à un seul endroit, juste avant `grtProfond`). `?sans=libre` rend la grotte d'avant, au tirage près. Un levier seul : `?sans=etages`, `?sans=assiette`, `?sans=stalag`.

- **Les étages** (`planEtages`) : chaque salle est un étage presque à plat (pente `GRT_LIB.pente`, 3,5 à 7 %). Entre deux salles, une **descente** fait tomber la route d'un étage, chaque fois autrement :
  - le colimaçon (un tube qui tourne) ;
  - le mur de la mort (hélice couchée à 74-81° sur la paroi d'un puits ouvert) ;
  - la plongée à l'envers (dans un virage de 110-150°) ;
  - la spirale, le nœud, le toboggan, la cascade (quatre marches dans une courbe), le saut, le rebord (le seuil de LA DESCENTE SE VOIT), le gouffre.

  Il y a 4 descentes au palier 0, moins aux paliers rapides. Au pied de chacune, la salle **s'ouvre** en grand : `GROTTE.ouvertures`, la salle × 1,6 en largeur, × 1,45 en hauteur et × 2 en profondeur.
- **La grotte se replie.** Les formes sont lacets, escargot, zigzag, crochet et esse, avec des coudes de 55° et plus aux frontières. Un **coude** (60-90°, pris depuis le cap, qui s'éloigne de la direction d'avant) arrive avant presque chaque module : la grotte change de direction environ toutes les 10 s. Un étage passe sous un autre : depuis la route, on voit la route d'avant au-dessus de soi.
- **L'assiette libre** (`GROTTE.libres`, `grtEchantillons` : `R.CAX…`, `R.OFX…`, lus par `grtCreuse1`). Dans les modules de torsion forte, le creux garde l'axe du HAUT DU MONDE : les lacs, les strates et les stalactites restent à leur place. Son centre s'écarte du côté de la normale de la dalle jusqu'à ce que la paroi soit à `g` = 26 m sous la dalle. La route se pose contre le sol, un mur ou la voûte d'une salle qui, elle, ne tourne pas. Ailleurs, rien ne change : l'axe est la normale de la dalle, le décalage est `LAT`.
- **Le directeur** (`corpsLibre`, `modLibre`, `choisit`). Une **personnalité** est tirée par grotte, jamais la même deux fois de suite (`GRT_LIB.persos`) : acrobate, slalom, aérienne, coulée, labyrinthe, vertige. Elle pèse les familles : S slalom, V virage, A air, T torsion, D droite.
  - Jamais deux fois la même famille de suite, jamais deux torsions fortes de suite.
  - Ce qu'on a vu dans les deux grottes d'avant passe derrière.
  - Entre deux modules, une **liaison** courte (un virage, ou moins d'une seconde de droite).
  - Plus de torsion dans les 1 300 derniers mètres : pisteTord tient la dalle à l'endroit avant le portail, la torsion y serait perdue.
- **Les modules neufs** :
  - la paroi (82-88° dans un long virage) ;
  - la torsade (quart de tour, puis tour complet, lent) ;
  - le tonneau (dans un grand virage) ;
  - le plafond éclair (un tonneau en deux temps) ;
  - la vague (half-pipe) ;
  - le grand virage ;
  - **le slalom des stalagmites** (un stalagmite au creux de chaque virage, une stalactite en face, collision en cône) ;
  - **la colonnade** (des colonnes en quinconce).

  Ils s'ajoutent aux 24 modules de la grotte du 12/11, sans les lacets ni l'épingle.
- **Aucune vrille serrée** : le tour complet prend 5 à 6 s, un quart de tour 1,7 à 2 s, la bascule de la vague 2,2 s.

## Mesuré (outils/banc-routes/grotte-rythme.cjs, palier 0, 12 graines ; avant = `?sans=libre`)
| | avant | après |
|---|---|---|
| route en droite | 33 % (la plus longue 2,7 s) | 22 % (2,2 s) |
| droites de plus de 3 s / grotte | 0,42 | 0 |
| même direction (le plus long, s réelles) | 19,9 (pire 35,7) | 10,7 (pire 17,7 : un module qui ondule autour de son axe, puis une plongée) |
| couchée à plus de 60° / à l'envers | 1 % / 0 % | 10 % / 5 % |
| moments de torsion / grotte | 4,6 (dévers surtout) | 5,7 (paroi, torsade, envers…) |
| modules différents (12 grottes) | 30 | 40 |
| rectitude (corde / longueur) | 0,62 | 0,29 |
| pente moyenne | 9,3 % (régulière) | 9,8 % (étages + chutes) |
| conflits, contacts | 0 | 0 |

En jeu (outils/banc-maps) :
- 0 erreur, 0 nouvel identifiant non déclaré (`outils/banc-course/non-declares.cjs`).
- Construction et triangles comme avant.
- Le travailleur creuse la grotte au bit près : `?grottecompare=1`, 968 tronçons égaux, 0 différent.
- Le pilote automatique traverse torsade, mur de la mort, plongée, plafond éclair et tonneau.

## Les crochets de banc
- `?grtmod=gTorsade,gParoi,…` tire ces modules d'abord. `?grtdesc=pMurMort,pColimacon,…` impose les descentes, dans l'ordre des frontières.
- `dbgGrotte('stalag')` : chaque stalagmite et chaque colonne, posé ou la raison (roche, sol, hauteur, route).
- `dbgGrotte().hasard` : perso, forme, descente.
- `node outils/banc-routes/grotte-rythme.cjs 0 1-12 suite=1 [detail=1] [droites=1] [dir=1]` donne le rythme, les droites et la même direction, avec le module qui les porte.
- Photos d'un module : scratchpad `vues-modules.cjs` (un fichier de vues `{nom, expr}` qui pose la caméra à une fraction du module), puis `banc.cjs grottevues --q=grtmod=…`.

## Pistes pour la suite
- **Pas encore joué à la main** : le ressenti au pouce des torsions (vitesse, lisibilité) et du coude avant chaque module reste à juger sur un vrai téléphone.
- **Ambiance « Minecraft »** non faite : galeries latérales qui partent dans le noir avec une torche à l'entrée, grandes chambres hors de la route. La place est prête : un creusement de plus dans `grtCreuse1` avec `O`.
- Aux paliers rapides (grotte de ~30 s), 2-3 modules seulement : la grotte est courte en secondes.
