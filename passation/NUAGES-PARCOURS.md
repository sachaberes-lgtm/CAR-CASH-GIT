# Les nuages : le parcours carte postale (2026-11-13)

> Sacha : « la génération de maps dans les nuages, elle est nulle. Ça va tout droit, ça descend bêtement […] il faut des virages, qu'il se passe des trucs, qu'on aille en dessous, que ça tourne d'un coup ; exploite les nuages : un virage derrière un gros nuage, on voit pas où ça va ; et puis on descend ; une longue spirale qui va loin ; on passe au-dessus des nuages la tête en dessous, on revient à l'endroit, et on descend d'un coup, en mode parc Astérix ; effet carte postale, contemplatif, liberté comme dans Dragons ; plein de modules, de la variété, qu'on sache pas où la route va nous mener. » Puis : « fais ça de manière très optimisée, en one shot, prends ton temps, pas de bug. » Puis, par la supervision des routes : « looping dans aucune map ».

`?parcours=0` rend la route d'avant (au point près : vérifié sur 12 routes). `?tableau=spirale` (ou tout autre nom de tableau ou de module des nuages) : tous les tableaux de la route sont celui-là (banc). `dbgParcours()` : le programme, les tableaux, le climax, le journal du cap (`caps`), leurs abscisses et leurs fenêtres sans saut. `dbgSautRefus()` : le saut serait-il refusé ici, et pourquoi.

## Ce qui a changé

**La route est une suite de tableaux** (`code/maps/nuages-parcours.js`, nouveau morceau), reliés par des liaisons de 1,2-2,2 s de croisière qui tournent toujours : un virage franc, un coup de volant serré (1,55-1,8 rP), une esse ou un balayage. Jamais une droite.

Chaque tableau est **dessiné tel qu'on le verra** : son plan, son profil VRAI (l'assiette par rapport à l'horizon), ses roulis, ses dévers et ses nuages. Il est marqué `g` + `plat` : `pisteTord` le rejoue tel quel (la houle se tait 1,5 s avant lui : il entre dans sa forme exacte). Pour ça :

- **la pente n'est plus une règle** : `genCtrl` dessine la descente (`NUA_PC.tan` = 0,68, 34° dans les liaisons ; `fS`/`fA` l'ajoutent aux anciens modules) et `pisteTord` ne l'ajoute plus (`D9` = 0 quand `PCON`) ;
- deux primitives dans `genCtrl1` : `aD(l, p0, p1)` (une droite en plan, l'assiette de p0 à p1) et `aC(a°, R, p0, p1)` (un arc en plan : une hélice). `aBoucle` (le looping) existe encore dans `genCtrl1` mais le parcours ne s'en sert plus ;
- **le cap est libre** : la route tourne sur elle-même, revient, passe sous elle-même.

| rôle | tableau | ce qu'on vit |
|---|---|---|
| ACCROCHE | le rideau | on fonce sur une tour de ouate ; virage serré relevé juste devant (100-128°), la route passe derrière ; elle reparaît en plongeant d'un coup (~58°) au travers d'une nappe |
| VERTIGE | la spirale | 1,1 à 1,5 tour autour d'une colonne de nuages, à 24-29°, dalle relevée ; on passe 350-500 m sous le tour d'avant ; sortie au travers d'une nappe |
| VERTIGE | le pont | une boucle de 270° presque à plat : la route repasse SOUS elle-même (74-135 m de vide selon le palier) |
| VOLTIGE | la voltige | on se redresse à l'horizontale ; dans une longue courbe la dalle se retourne VERS L'INTÉRIEUR, un demi-tour en 4,3 s réelles (un anneau de nuage, ou une porte, à mi-tour) ; ~5 s la tête en bas au ras d'une mer de nuages (sommets 46-62 m sous la dalle) ; retour à l'endroit ; la crête ; la chute de 52-58° au travers d'une nappe. ~13 s réelles au palier 0 |
| CHUTE | le grand huit | la montée en courbe (on ne voit que le ciel), la crête, la chute de 54-60° au travers d'une nappe, la bosse (un mouton au sommet), une ligne pour se poser, le virage relevé |
| CHUTE | le toboggan | une plongée de 46-52°, trois nappes d'affilée (pouf, pouf, pouf) |
| CHUTE | le plafond | on plonge au travers d'une couche épaisse, puis on file SOUS un plafond de stratus (44-62 m au-dessus), en descente douce (18-22°) |
| DANSE | les lacets du col | deux ou trois épingles de 155-170° qui descendent, dalle relevée, une tour au cœur de chacune |
| VISTA | la grande courbe | 130-165° d'un seul geste au large d'un massif, à 22-26°, dalle penchée ; une couche à traverser au milieu |
| RACCOURCI | la boucle, le stade | la route fait le tour d'un gros nuage (un cercle, ou deux épingles et une ligne droite) en descendant de 70-90 m et repasse SOUS la lèvre : qui va tout droit (le bord ou le saut) se pose sur la piste d'en dessous et gagne tout le tour |

Plus, du paquet de `nuages-modules.js`, les modules qui tournent : virage caché, double rideau, épingle, slalom, chicanes, mur de ouate, tour du géant, grand S, ras de la mer, balcon, canyon, tunnel, anneau, cascade. La porte des titans, le ruban et la plongée dans la couche (de longues droites) ne sont plus tirés. **Le looping n'existe plus** (Sacha, 13/11).

**La dramaturgie** (`joue`) : des rôles mélangés par graine (ACCROCHE, VERTIGE, CHUTE, DANSE, VISTA). La VOLTIGE est tirée six routes longues sur dix, quatre moyennes sur dix, et jamais quand elle prendrait plus de la moitié de la route (donc pas au-delà du palier ~15). Toute route longue (palier 0-5) a un RACCOURCI (boucle, stade) et un PLI (lacets, pont, spirale). Ces rôles obligés ont leur place GARDÉE : les rôles joués avant eux ne la mangent pas. Une fois sur trois, l'enchaînement de Sacha d'un seul tenant : sur une route longue, le raccourci autour d'un gros nuage, puis la spirale ou le pont, puis la voltige. Jamais deux fois le même tableau. L'ouverture (le départ tenu de `pisteTord`) prend un module qui tourne sans rouler la dalle (mur, canyon, tunnel, ras de la mer, balcon, anneau). La fin aussi (jamais un de ceux de l'ouverture), puis **l'arrivée** : des courbes alternées entre deux haies de nuages. Le surf (l'ancien climax) vient en finale s'il tient. **Un seul climax par route** (`climax:1` sur sa marque) : la voltige, sinon le surf, sinon la montagne russe, sinon le vertige, sinon le plus long.

**Les durées** se mesurent en dessinant chaque tableau « à blanc » (l'atelier, chaque tirage à sa médiane). Un tableau qui déborderait sur l'arrivée tenue à l'endroit est **défait** (`K.sauve` / `K.rends`) : `pisteTord` ne le refuse jamais (0 refus sur 40 routes).

**Trois nuages de plus** (`cotonModules`) :
- `dessous` : la mer sous la dalle ;
- `plafond` : la couche au-dessus ;
- `nappe` : une couche qu'on traverse au milieu d'une chute. Elle échappe à la garde comme le mouton, mais ne mord sur aucun autre passage de la route.

Sur le téléphone (`nuaPoufLeger`), un nuage de mer ou de plafond sur deux.

**Le directeur de rythme** ne compte plus les chutes des tableaux comme des crêtes fautives (`cretesFig: 0`), ni l'absence de virage serré ou de droite franche. Le premier dessin est presque toujours gardé. MESURÉ : le meilleur-de-6 préférait les routes qui s'ouvraient par une longue approche droite. D'où plus de variété, et une construction jusqu'à 6 fois moins chère.

## La charte des routes (le banc juge commun aux six maps)

La supervision des routes (`passation/CHARTE-ROUTES.md` sur sa branche, `outils/banc-juge/`) mesure les six maps pareil, **à la vitesse réelle** (vPalier × élan : 1,8 au palier 0 → 1 au palier 25). Le parcours la passe **27/27** (graines 1-8, paliers 0, 10 et 20). Ce qu'il a fallu :

- **R3, l'horizon ne penche jamais à plus de 60 °/s** (Sacha : « pas de torsade trop serrée »). Les plafonds de `TORD_DEVERS` sont des °/s de CROISIÈRE : × 1,8 au palier 0, la voltige se retournait à 162 °/s. `pisteTord` (en parcours seulement) re-borne le coucher après coup, pas à pas (« LES ROULIS À LA VITESSE RÉELLE », `NUA_R3` = 44 °/s réels, `elanReel()`). Il mesure exactement ce que mesure le juge : l'angle de la normale avec la verticale projetée ⊥ route, là où la pente est sous 60°, et le roulis transporté ailleurs. Le coucher cède (et absorbe un à-coup du repère) ; le tracé ne bouge pas : l'orbite, la ville, crypto et `?parcours=0` restent identiques à main.
- **R1, jamais plus de 10 s dans la même direction** : le compositeur suit l'ÉVENTAIL des caps (« LE CAP QUI CHANGE »). Après 4 s réelles sans 60° d'écart, la liaison s'ouvre par un virage franc qui SORT de l'éventail. Un slalom de ±25° tenait le cap 10-12 s.
- **R6, deux raccourcis par route au palier 0, dont un qui marche à toutes les vitesses** : le raccourci et le pli obligés. MESURÉ au juge (son tir sans volant) : la boucle et le stade marchent aux quatre vitesses 13 fois sur 13. Les lacets et la spirale donnent une zone 6 fois sur 6, le pont 5 sur 12.
- **R5, des routes voisines différentes** : sur 40 graines, deux routes partagent 22 % de leurs modules en moyenne, 5 % des paires dépassent la moitié. En jeu, chaque route suivante a une graine AU HASARD (`PREB.sd`) : les « graines voisines » du juge sont deux routes quelconques.
- **R4/R10** : chaque marque porte `nom` ; un raccourci est une marque à part `{rac:1, i0 : la lèvre, i1 : la pose}`.

## La crête sans saut

Le haut du vol est celui de la dalle quittée : un saut parti avant (ou pendant) une crête file pendant que la route se dérobe. La dalle s'éloigne à ~v × (l'angle qu'elle perd sous le vol). À 140-250 m/s, quelques degrés suffisent pour un vol de 4-6 s.

**`nuaSautRefuse`** (route-sans-haut.js) agit sur le saut nitro, le décollage au manche et le saut du banc :
- **regard devant**, à la vitesse réelle : sur ce que le saut survolerait (1,2 s ; 2 s nitro tenue, le réacteur faisant planer), on cumule ce que la route perd vers le bas de la caisse ; refusé au-delà de 8 m/s (6 nitro tenue) ;
- **fenêtres dessinées** (`ss`) : plus aucun tableau n'en pose depuis le retrait du looping.

Trouvés en chemin et corrigés :
- une fenêtre fixe sur la crête ne suffisait pas : un saut parti à sa FIN volait 1,8 s à 73 m/s ;
- une chute qui vrille dérobe la route de côté sous un saut : les chutes sont DROITES en plan ;
- une dalle qui se retourne dans une courbe doit rouler vers l'intérieur : vers l'extérieur, la route se dérobait ;
- une sortie de tableau qui replonge fort tue un vol plané : la grande courbe file à 22-26°, le plafond à 18-22°.

**Couverture** (`outils/banc-routes/vols-sim.cjs`, un saut simulé tous les 4 m sur 8 routes, coup de volant en l'air du jeu) :
- **sans nitro** : aucun saut mortel permis (paliers 0, 10, 20) ;
- **nitro TENUE TOUT LE VOL** : 13 sur ~12 000 aux paliers 0 et 10, aucun au 20. Tous sont des vols planés de plus de 6 s au-dessus de la boucle ou du stade (le pilote du banc ne lâche jamais la nitro ; lâcher la nitro pose la caisse). Ce ne sont pas des crêtes : la règle n'y peut rien sans retirer le raccourci. C'est la physique du vol nitro, commune aux six maps (la charte : on ne règle pas la gravité pour une map).

**Ce que ça coûte** (`sauts-refuses.cjs`) : le saut est refusé sur ~14 % de la route au palier 0 sans nitro (surtout juste avant les chutes).

## Mesures

| | quasi droit | plus longue tenue droite | pente moyenne | contacts | tableaux refusés |
|---|---|---|---|---|---|
| avant, palier 0 | 16 % | 4,5 s (pire 8,5) | 36° partout | 0/10 | 2 |
| **après, palier 0** | **10 %** | **3,1 s** (pire 3,9) | 20° | 0/10 | 0 |
| avant, palier 10 | 20 % | 5,4 s (pire 9,1) | 35° | 0/10 | 0 |
| **après, palier 10** | **14 %** | **2,3 s** | 23° | 0/10 | 0 |
| après, palier 20 / 27 | 22 % / 27 % | 1,4 s | 31° / 33° | 0/10 | 0 |

(`outils/banc-routes/parcours.cjs`, 10 graines par palier ; « quasi droit » = ni virage, ni plongée > 40°, ni crête.)

Au juge (graines 1-48, palier 0) : R6 48/48, R1 ≤ 9,0 s, R3 ≤ 49 °/s.

Autres vérifications :
- les autres maps (ville, crypto, orbite : 36 routes) et la route d'avant (`?parcours=0` : 12 routes) sont identiques au point près à `origin/main` (v1566) ;
- les routes du jeu (Chrome) et du banc Node sont les mêmes (module par module, graines 1-8) ;
- aucun identifiant non déclaré de plus (`outils/banc-course/non-declares.cjs`) ;
- `garde-allege.sh` et `garde-charte.sh` passent.

**En jeu** (Chrome headless, son coupé) :
- `outils/banc-course/course.cjs --map nuages` : deux courses, pause, mort, CONTINUER, REJOUER : 0 exception, 0 requête en échec ;
- `banc-maps/banc.cjs gen … --audit` : `window.__nuModErr` vide, tous les nuages des tableaux posés.

## Bancs

- `node outils/banc-routes/parcours.cjs paliers=0,10,20,27 graines=1-10 detail=1` : la fiche de chaque route et de chaque tableau.
- `node outils/banc-routes/vols-sim.cjs palier=0 graines=1-8 vitesse=1.8 [plane=0.4 mort=1]` : le saut partout.
- `node outils/banc-routes/sauts-refuses.cjs palier=0 vitesse=1.8 [t=2 ev=6]` : la part de route où le saut est refusé.
- Le juge (branche de la supervision) : `node outils/banc-juge/juge.cjs --racine=<worktree> --cartes=nuages`.
- En jeu : `node outils/banc-maps/banc.cjs vue --carte=nuages --graines=2 --s=250,760,2500,3850,4250`. Sur la graine 2 au palier 0, ces abscisses donnent : l'ouverture, la lèvre de la boucle, la spirale, la voltige à mi-tour, la tête en bas.

## Pièges

- Un tableau doit COMMENCER et FINIR à l'assiette des liaisons (`pA`) et à l'endroit (rho et couchers revenus à 0) : `pisteTord` rejoue un tableau `plat` relativement au repère d'entrée.
- Un tableau `plat` ne doit pas tomber dans le départ tenu de `pisteTord` (`s0` + 60 m) ni dans l'arrivée (`fin` − 40 m) : il serait joué comme une route ordinaire. `deb9` / `fin9` (genCtrl) les gardent, `K.rends` rattrape un débordement.
- **Les °/s de `TORD_DEVERS` sont des °/s de croisière**, jamais ceux du joueur : le juge (et le joueur) roulent 1,8 fois plus vite au palier 0. Un tableau qui retourne la dalle se dessine en secondes RÉELLES (`K.sR`).
- **`cotonModules` avale ses erreurs** (`buildCoton` : `try … catch`, l'erreur dans `window.__nuModErr`) : une seule pose qui lève (un nuage sans famille `g`) et TOUT le reste de la route perd ses nuages, sans un mot. Lire `window.__nuModErr` dans les bancs.
- Le budget d'une route longue avec la voltige est serré. Au palier 0 : voltige 25,5 + raccourci ~18,5 + pli 12,8 + ouverture ~7, sur 71 unités. Allonger un de ces tableaux fait sauter le raccourci (R6).
- Les modules des nuages qui ne marquent ni `g`, ni `f`, ni `c` (virage caché, chicanes, slalom…) ne sont pas des figures : ils peuvent jouer dans le départ tenu et l'arrivée.
- Toute crête (une assiette qui plonge) est un danger pour le saut à ces vitesses : la règle la refuse, mais une crête de plus = un peu moins de liberté.
