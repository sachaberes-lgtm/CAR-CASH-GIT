# Chasse aux bugs de maps (zone B : canyon, dunes, glacier, grottes, pré-bâti) — état au 2026-11-10

Lecture de code seule, rien exécuté dans le jeu. Aucun bug classé SÛR n'a été trouvé dans cette passe : les points ci-dessous sont des risques PROBABLE ou DOUTEUX à confirmer sur un banc.
Preuve scriptée : `passation/debug-gameplay/preuves/worker-globals.cjs` (ESLint no-undef sur les fonctions recopiées dans les Workers).

## 0. Contexte qui change la gravité
- Le glacier (`banquise`) et les dunes sont HORS du jeu par défaut (`SF_HORS`, `maps/niveaux.js:58`) : seul `?carte=` les remet. Canyon et grotte sont les seules maps de ma zone réellement jouées.
- Les géants de la grotte sont coupés par défaut (`GRT_GEANT.on`, `grottes-1.js:~108`, `?avec=geants`).
- Sur le glacier, plus aucun pic sur la route (`gdPic=false`, `glacier-construction.js:~165`) : `BANQ.obst` reste vide, `banqPisteHeurt` est du code dormant.
- Tout ce qui tue le décor ne tue qu'EN VOL (`boucle-3-physique.js:573-583`). Au sol, seuls `murCote` (couloirs du canyon), la congère (glacier) et le bord de route agissent.

## 1. Vérifié propre
- Workers canyon, dunes, grotte : aucune variable libre manquante (script de preuve ci-dessus) ; propriétés de `GRV/GRT/GROTTE/GT` lues dans le Worker grotte toutes initialisées (`grwInit`).
- `Math.random()` dans la zone : uniquement des effets (poudre, éclats, vautours du canyon `canyon-mine.js:232`) ; aucun placement de décor ou de collision.
- Nettoyage au changement de map : `banqVide`, `cyEteindre`, `dnEteindre`, `grotteVide` sont appelés en tête de chaque build avant le test de map ; pas d'objet de l'ancienne map testé.
- Orientation des boîtes de collision de la grotte (`grotteHeurt`) cohérente avec le dessin (`grtMailleDecor`).
- Stale Worker : dunes (`R.job!==DN.job`) et canyon (`A.pour!==CY.job`) ignorent une réponse périmée.
- `DN.gx` (gravité de tremplin) remis à 1 chaque image hors vol (`dunes-2.js:241`).

## 2. Tableau (par gravité)

| id | fichier:ligne | ce que vit le joueur | cause | correctif minimal | confiance |
|---|---|---|---|---|---|
| B-01 | `canyon-route.js:34` (PAL.B.cyPlat/cyFin/cyChem), `canyon-route.js:462,490`, `canyon-relief.js:254` | Sur un vieux téléphone la roche et le sol de collision ne sont pas ceux du PC : grille fine 16 m au lieu de 12 m, plateau 96 m au lieu de 64 m, cheminées 120 au lieu de 300. La « règle d'or » (rien ne touche la dalle, `dbgCanyon('test')`) n'est mesurée qu'au palier récent : au palier 0, la roche interpolée sur 16 m peut monter au bord de la dalle (mort « canyon/paroi » ou roche qui mord la route). | `cyHauteur` lit les mêmes grilles que le rendu, dont la résolution dépend de `PAL.n` ; les marges de `cyProfil` sont calées à 12 m. | Mesurer `dbgCanyon('test')` à `?palier` 0/1/2 (clé `cyCle` contient déjà `PAL.n`) ; si `margeMin` baisse, fixer `cyFin` à 12 pour la collision (grille fine de collision séparée du rendu) | DOUTEUX (non mesuré) |
| B-02 | `glacier-construction.js:~145` `pas=ALLEGE?46:30` ; `:82` `KP=…*(TEL_NATIF?.85:1)*.3` | Glacier (hors jeu) : haies d'aiguilles du bord et dômes/séracs/aiguilles physiques 1,5 fois plus rares sur téléphone ; le flux `fr` des sections 1-4 change de longueur selon l'appareil, donc la même graine donne un autre décor physique. | constantes d'appareil dans le placement physique (`pose(L9,true)`). | Fixer `pas=30` et `KP` sans TEL_NATIF pour la physique (garder l'allègement pour le rendu seulement) | PROBABLE (constat de code, effet jeu non mesuré) |
| B-03 | `grottes-2.js:276` `MOB=mapsSobres()?.75:1` ; `grottes-embellies.js:19` `K9=…*(mapsSobres()?.75:1)` | Grotte (jouée) : sur téléphone, 25 % de décor en moins, dont des concrétions (`tige`/`pendue`, `grottes-2.js:84-85`) et grappes de cristaux (`grottes-embellies.js:25`) qui TUENT en vol (collision `'roche'`). Obstacles et trouées différents du PC pour une même graine. | les colliders suivent le décor allégé. | Garder le même tirage physique sur tous les appareils (tirer à ×1, ne retirer que le rendu), ou accepter et documenter | PROBABLE |
| B-04 | `grottes-1.js` (commit 429e3298, `grtMailleNetsG` : `dy9=…Math.abs(wy-Y9.y)<B*.4`) | Grotte, rives des lacs : les sommets touchant le lac à moins de 4,8 m de son niveau sont posés EXACTEMENT sur le niveau ; la collision (`grtDensIci`) lit encore la densité non déplacée. La roche visible près de la ligne d'eau peut donc différer de la roche qui tue jusqu'à ~4,8 m en hauteur : mort contre « de l'air » ou traversée d'un bord. | déplacement visuel sans équivalent dans la densité. | Réduire le snap à ±0,5 m (l'arrondi de densité annoncé ±0,3 m) : `Math.abs(wy-Y9.y)<.5` | DOUTEUX |
| B-05 | `glacier-verglas.js:155-175` (`bkCongere`) + `glacier-construction.js:~145` (haies à `lat0=ROAD_HALF+3`) | Glacier (hors jeu) : au sol, la caisse roule jusqu'à 16 m hors de la glace (congère) et traverse les aiguilles du bord sans mourir ; elles ne tuent qu'en vol. Peut surprendre (« on traverse la paroi »). | `banqPisteHeurt` ne teste que `BANQ.obst`, pas `PH`. | Décision de gameplay : soit assumé (« jamais de mort au bord »), soit tester `banqSurf` au sol | DOUTEUX |
| B-06 | `dunes-1.js:415,470,555` | Dunes (hors jeu) : tant que le Worker n'a pas répondu (`DN.on` faux), `dunesHeurt` renvoie '' et `dnLevre` ne lance pas : route sans sable ni tremplin (≥ 0,5 s) quand le monde n'est pas bâti d'avance (REJOUER / JOUER direct, `started` vrai). Le canyon a le même schéma (`canyon-route.js:441`). | pas d'attente avant le départ sur le chemin non pré-bâti. | Ne pas démarrer la course (ou garder le voile) tant que `DN.attente`/`CY.attente` est non nul | DOUTEUX |
| B-07 | `dunes-4.js:71,77,86` (`kill`) + `dunes-2.js:298` | Dunes (hors jeu) : les monolithes/maisons des scènes sont des cylindres de rayon constant `r+1,2`, alors que le dessin s'effile (jusqu'à 0,66 r au sommet) : hitbox plus large que l'objet en haut. À 45-55 m de la route, donc rare. | cylindre vs forme conique (les `DN.ob` ont l'effilement, pas `DN.mo`). | Appliquer la même formule `rr=r*(1.35-.69*t)` | DOUTEUX |
| B-08 | `dunes-1.js:14` (PAL.B.dnFin/dnPlat) | Dunes (hors jeu) : même risque que B-01 (sable plus haut au bord de la berme sur grille 16 m ; berme 1,6 m de marge). | idem | idem | DOUTEUX |
| B-09 | `piste-prebati.js:459` | `PREB_CPU_DEF` ne contient toujours pas `dunes` (la chasse du 07/11 annonçait `dunes:1500` ajouté en v1256). Sans effet : le défaut `\|\|1500` donne la même valeur. | note de passation périmée | rien | SÛR (sans effet) |

## 3. Non couvert faute de temps
Lecture seule et partielle : `genCanyon` (`canyon-route.js:73-330`), `cyTun2*` (tunnel de grès), ramassables posés sur les routes de ces maps, `glacier-embelli.js`, portails mal posés. Les points B-01, B-02, B-03 se tranchent par un banc simple (même graine, paliers 0/1/2, comparer `margeMin`, `BANQ.n.prims`, `GROTTE.col.n`) à lancer par une session autorisée à utiliser Chrome.
