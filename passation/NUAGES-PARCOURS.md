# Les nuages : le parcours carte postale (2026-11-13)

> Sacha : « la génération de maps dans les nuages, elle est nulle. Ça va tout droit, ça descend bêtement […] il faut des virages, qu'il se passe des trucs, qu'on aille en dessous, que ça tourne d'un coup ; exploite les nuages : un virage derrière un gros nuage, on voit pas où ça va ; et puis on descend ; une longue spirale qui va loin ; on passe au-dessus des nuages la tête en dessous, on revient à l'endroit, et on descend d'un coup, en mode parc Astérix ; effet carte postale, contemplatif, liberté comme dans Dragons ; plein de modules, de la variété, qu'on sache pas où la route va nous mener. » Puis : « fais ça de manière très optimisée, en one shot, prends ton temps, pas de bug. »

`?parcours=0` rend la route d'avant (au point près : vérifié sur 12 routes). `?tableau=spirale` (ou tout autre nom de tableau ou de module des nuages) : tous les tableaux de la route sont celui-là (banc). `dbgParcours()` : le programme, les tableaux, leurs abscisses et leurs fenêtres sans saut. `dbgSautRefus()` : le saut serait-il refusé ici, et pourquoi.

## Ce qui a changé

**La route est une suite de tableaux** (`code/maps/nuages-parcours.js`, nouveau morceau), reliés par des liaisons de 1,2-2,2 s de croisière qui tournent toujours : un virage franc, un coup de volant serré (1,55-1,8 rP), une esse ou un balayage. Jamais une droite.

Chaque tableau est **dessiné tel qu'on le verra** : son plan, son profil VRAI (l'assiette par rapport à l'horizon), ses roulis, ses dévers et ses nuages. Il est marqué `g` + `plat` : `pisteTord` le rejoue tel quel (la houle se tait 1,5 s avant lui : il entre dans sa forme exacte). Pour ça :

- **la pente n'est plus une règle** : `genCtrl` dessine la descente (`NUA_PC.tan` = 0,68, 34° dans les liaisons ; `fS`/`fA` l'ajoutent aux anciens modules) et `pisteTord` ne l'ajoute plus (`D9` = 0 quand `PCON`) ;
- deux primitives dans `genCtrl1` : `aD(l, p0, p1)` (une droite en plan, l'assiette de p0 à p1) et `aC(a°, R, p0, p1)` (un arc en plan : une hélice), plus `aBoucle` (le looping) ;
- **le cap est libre** : la route tourne sur elle-même, revient, passe sous elle-même.

| rôle | tableau | ce qu'on vit |
|---|---|---|
| ACCROCHE | le rideau | on fonce sur une tour de ouate ; virage serré relevé juste devant (100-128°), la route passe derrière ; elle reparaît en plongeant d'un coup (~58°) au travers d'une nappe |
| VERTIGE | la spirale | 1,1 à 1,5 tour autour d'une colonne de nuages, à 24-29°, dalle relevée de 31° ; on passe 350-500 m sous le tour d'avant ; sortie au travers d'une nappe |
| VERTIGE | le pont | une boucle de 270° presque à plat : la route repasse SOUS elle-même (74-135 m de vide selon le palier) |
| VOLTIGE | la voltige | on se redresse à l'horizontale ; dans une longue courbe la dalle se retourne VERS L'INTÉRIEUR (coucher de 180°, `vif` : 90°/s) au ras d'une mer de nuages (sommets 46-62 m sous la dalle) ; retour à l'endroit ; la crête ; la chute de 52-58° au travers d'une nappe |
| CHUTE | le grand huit | la montée en courbe (on ne voit que le ciel), la crête, la chute de 54-60° au travers d'une nappe, la bosse (un mouton au sommet), une ligne pour se poser, le virage relevé |
| CHUTE | le toboggan | une plongée de 46-52°, trois nappes d'affilée (pouf, pouf, pouf) |
| CHUTE | le plafond | on plonge au travers d'une couche épaisse, puis on file SOUS un plafond de stratus (44-62 m au-dessus), en descente douce (18-22°) |
| DANSE | les lacets du col | deux ou trois épingles de 155-170° qui descendent, dalle relevée à 52°, une tour au cœur de chacune |
| DANSE | le looping | un looping au milieu du ciel |
| VISTA | la grande courbe | 130-165° d'un seul geste au large d'un massif, à 22-26°, dalle penchée de 29° |

Plus, du paquet de `nuages-modules.js`, les modules qui tournent : virage caché, double rideau, épingle, slalom, chicanes, mur de ouate, tour du géant, grand S, ras de la mer, balcon, canyon, tunnel, anneau, cascade. La porte des titans, le ruban et la plongée dans la couche (de longues droites) ne sont plus tirés.

**La dramaturgie** (`joue`) : un programme par durée de route, ACCROCHE → VERTIGE → VOLTIGE au cœur (l'enchaînement de Sacha), entouré de DANSE, VISTA et CHUTE ; jamais deux fois le même tableau. L'ouverture (le départ tenu de `pisteTord`, où aucune figure ne joue) prend un module qui tourne sans rouler la dalle. La fin aussi, puis **l'arrivée** : des courbes alternées entre deux haies de nuages, taillées à la place qui reste. Le surf (l'ancien climax) vient en finale s'il tient.

**Les durées** se mesurent en dessinant chaque tableau « à blanc » (l'atelier, chaque tirage à sa médiane). Un tableau qui déborderait sur l'arrivée tenue à l'endroit est **défait** (`K.sauve` / `K.rends`) : `pisteTord` ne le refuse jamais (0 refus sur 40 routes).

**Trois nuages de plus** (`cotonModules`) :
- `dessous` : la mer sous la dalle ;
- `plafond` : la couche au-dessus ;
- `nappe` : une couche qu'on traverse au milieu d'une chute. Elle échappe à la garde comme le mouton, mais ne mord sur aucun autre passage de la route.

Sur le téléphone (`nuaPoufLeger`), un nuage de mer ou de plafond sur deux.

**Le directeur de rythme** ne compte plus les chutes des tableaux comme des crêtes fautives (`cretesFig: 0`), ni l'absence de virage serré ou de droite franche. Le premier dessin est presque toujours gardé. MESURÉ : le meilleur-de-6 préférait les routes qui s'ouvraient par une longue approche droite (le double rideau en tête une fois sur deux). D'où plus de variété, et une construction jusqu'à 6 fois moins chère.

## La crête sans saut

Le haut du vol est celui de la dalle quittée : un saut parti avant (ou pendant) une crête file pendant que la route se dérobe. La dalle s'éloigne à ~v × (l'angle qu'elle perd sous le vol). À 140-250 m/s, quelques degrés suffisent pour un vol de 4-6 s.

**`nuaSautRefuse`** (route-sans-haut.js) — le saut nitro, le décollage au manche et le saut du banc :
- **regard devant**, à la vitesse réelle : sur ce que le saut survolerait (1,2 s ; 2 s nitro tenue, le réacteur faisant planer), on cumule ce que la route perd vers le bas de la caisse ; refusé au-delà de 8 m/s (6 nitro tenue) ;
- **fenêtres dessinées** (`ss`) : les épingles relevées des lacets et le looping.

Trouvés en chemin et corrigés :
- une fenêtre fixe sur la crête ne suffisait pas : un saut parti à sa FIN volait 1,8 s à 73 m/s ;
- une chute qui vrille dérobe la route de côté sous un saut : les chutes sont DROITES en plan ;
- une dalle qui se retourne dans une courbe doit rouler vers l'intérieur : vers l'extérieur, la route se dérobait (46 % de sauts refusés dans la voltige) ;
- une sortie de tableau qui replonge fort tue un vol plané : la grande courbe file à 22-26°, le plafond à 18-22°.

**Couverture** (`outils/banc-routes/vols-sim.cjs`) : un saut simulé tous les 4 m sur 8 routes, avec le coup de volant en l'air du jeu (`lacetVol`, pas de verrou pour un saut voulu). Résultat : **aucun saut mortel permis**, du palier 0 au palier 27, nitro tenue ou non ; et sans nitro, aucun vol de plus de 2 s.

**Ce que ça coûte** (`sauts-refuses.cjs`) : le saut est refusé sur 13-21 % de la route sans nitro, 27-44 % nitro tenue (surtout juste avant les chutes, dans les épingles et le looping).

## Mesures (`outils/banc-routes/parcours.cjs`, 10 graines par palier ; « quasi droit » = ni virage, ni plongée > 40°, ni crête)

| | quasi droit | plus longue tenue droite | pente moyenne | en plongée > 40° | contacts | tableaux refusés |
|---|---|---|---|---|---|---|
| avant, palier 0 | 16 % | 4,5 s (pire 8,5) | 36° partout | 40 % | 0/10 | 2 |
| **après, palier 0** | **8 %** | **2,2 s** | 26° | 7 % (les vraies chutes) | 0/10 | 0 |
| avant, palier 10 | 20 % | 5,4 s (pire 9,1) | 35° | 46 % | 0/10 | 0 |
| **après, palier 10** | **11 %** | **1,4 s** | 27° | 9 % | 0/10 | 0 |
| après, palier 20 / 27 | 22 % / 26 % | 1,4 s | 27° / 30° | 7 % / 5 % | 0/10 | 0 |

Chutes atteintes : voltige 48-54°, grand huit 48-58°, rideau 52-59°, toboggan 45-52°. Le palier 0 joue 6-7 tableaux par route.

Autres vérifications :
- les autres maps (ville, crypto, orbite : 36 routes) et la route d'avant (`?parcours=0` : 12 routes) sont identiques au point près à `origin/main` ;
- aucun identifiant non déclaré de plus (`outils/banc-course/non-declares.cjs`) ;
- `garde-allege.sh` et `garde-charte.sh` passent.

**En jeu** (`banc-maps/banc.cjs gen`, Chrome headless, son coupé) :
- course complète au pilote auto : 0 erreur, 0 croisement ;
- chaque tableau imposé sur une route entière (`?tableau=…`), un saut toutes les 2 s, pilote qui corrige en l'air : 19 routes sur 20 complètes ;
- la seule mort est « air » nitro tenue sous le plafond. Le pilote du banc ne lâche jamais la nitro, et chaque rallumage en vol pousse de +46 m/s : c'est le vol nitro du jeu (voir la note de la mémoire), pas une crête.

## Bancs

- `node outils/banc-routes/parcours.cjs paliers=0,10,20,27 graines=1-10 detail=1` : la fiche de chaque route et de chaque tableau.
- `node outils/banc-routes/vols-sim.cjs palier=0 graines=1-8 vitesse=1.8 [plane=0.4 mort=1]` : le saut partout.
- `node outils/banc-routes/sauts-refuses.cjs palier=0 vitesse=1.8 [t=2 ev=6]` : la part de route où le saut est refusé.
- `node outils/banc-routes/dessin.cjs nuages <graine> <palier> sortie.png` : vue de dessus et deux profils.
- En jeu : `node outils/banc-maps/banc.cjs gen --carte=nuages --graines=2 --q=tableau=voltige --auditfile=<sauts toutes les 2 s : dbgAuto(1,0,{saut:2,vol:true})>`.

## Pièges

- Un tableau doit COMMENCER et FINIR à l'assiette des liaisons (`pA`) et à l'endroit (rho et couchers revenus à 0) : `pisteTord` rejoue un tableau `plat` relativement au repère d'entrée.
- Un tableau `plat` ne doit pas tomber dans le départ tenu de `pisteTord` (`s0` + 60 m) ni dans l'arrivée (`fin` − 40 m) : il serait joué comme une route ordinaire (ni chute, ni retournement). `deb9` / `fin9` (genCtrl) les gardent, la remise en arrière (`K.rends`) rattrape un débordement.
- Les fenêtres `ss` sont des index de contrôle du PLAN ; `pisteTord` pose `j0/j1` (les index de la route refaite) à chaque essai — le même découpage pour tous les essais.
- Les modules des nuages qui ne marquent ni `g`, ni `f`, ni `c` (virage caché, chicanes, slalom…) ne sont pas des figures : ils peuvent jouer dans le départ tenu et l'arrivée.
- Toute crête (une assiette qui plonge) est un danger pour le saut à ces vitesses : la règle la refuse, mais une crête de plus = un peu moins de liberté. Une sortie de tableau doit replonger le moins possible.
