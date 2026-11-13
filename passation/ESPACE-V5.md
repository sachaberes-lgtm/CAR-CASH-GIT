# ESPACE v5 — LE RUBAN (2026-11-13) : la refonte de la route de l'orbite

## Ce que Sacha a demandé
> « Dans les maps espaces, il y a beaucoup trop de tout droit, c'est insupportable. Il faut qu'il y ait des grands virages, des belles courbes, il faut que ça soit fun […] pour les gens qui roulent et pour les gens qui volent. […] la génération, elle est moche. Déjà, il faut que ça descende, faut pas que ça soit plat dans l'espace, et puis il faut qu'il y ait des grands virages et que ça se torsade, mais sur une longue distance, et qu'à la fin, on parte à l'envers et on croise une route et on sait pas si on est à l'endroit et à l'envers. Joue sur l'endroit et à l'envers, sur le délire de se perdre dans l'espace, fais des modules qui poussent les gens à sauter et voler. […] Rajoute des modules, fais plus de variété. On a l'impression que c'est tout le temps la même map. Fais pas des boucles compliquées. Il faut que ça continue à avancer dans une direction. Faut pas qu'on fasse des grands demi-tours. »
>
> Puis : « fais ça de manière très optimisée en one shot, prends ton temps, pas de bug » ; puis : « pas de torsade trop serrée et pas plus de 10 secondes dans une même direction ».

Pendant le travail, la session « Supervision génération de routes » a fixé une charte commune aux six maps (`CHARTE-ROUTES.md`, règles R1-R10) ; la v5 a été mesurée contre elle (`outils/banc-routes/charte-espace.cjs`, en attendant le banc juge commun).

## Ce qui a été mesuré AVANT (la v4 du matin, palier 0, graines 1-8)
~4 modules par route, presque tous dessinés en ligne droite vue de dessus (toboggan, vagues, tonneau, faille, cascade, retournement), pente 10 %, R1 (même direction) jusqu'à 46 s, R2 (tout droit) jusqu'à 14,5 s, roulis au 95e centile 50°/s, sauts qui se reposent depuis 85-89 % de la route. Deux pièges de saut trouvés en relisant le vol : la lèvre du toboggan et la crête des vagues (la route plonge plus vite que la caisse ne retombe en gravité d'orbite).

## La v5 (par défaut ; `?espace=v4` = la route du matin au bit près, `?espace=v3`, `?espace=ancien`)
- **Plus de droite de liaison** : entre deux modules, UN grand virage qui traverse l'axe et finit 40-56° de l'autre côté, puis un court balayage ; l'ouverture est un balayage.
- **Ça descend partout** : la grande descente des nuages généralisée dans `pisteTord` (`D2` = `NUA2` aux nuages — au bit près —, `ORB5` en orbite) : pente visée hors du départ et de l'arrivée (~42 % mesurés, × l'humeur), gardée autour des figures, cap du plan tenu sur le plan incliné, départ en pente, crête lente (`tangBas` 26 s par quart de tour).
- **Jamais de demi-tour** : cap < `ORB5.capMax` (72°) de l'axe — mais il BALAIE : les virages vont d'un côté de l'axe à l'autre (R1 : la direction change de plus de 30° en moins de 10 s).
- **Jamais plus de ~9 s du même côté** (`SENS`, genCtrl1) ; à toute vitesse les rayons grandissent (`rPv` ≥ 0,62 × la croisière : les sauts s'y reposent encore au palier 20).
- **Des tours de dalle jamais serrés** : des couchers à VITESSE RÉGULIÈRE (`MODMARK.c` avec une 4e valeur `k` — `cvTrap`, route-sans-haut.js : pointe = 1,28 × la moyenne au lieu de 1,5), ~26°/s en moyenne, 35°/s au 95e centile ; jamais plus d'un demi-tour d'affilée dans le même sens ; ~9 s au plus la tête en bas (sauf la faille à l'envers, ~12,9 s).
- **Les humeurs** (une par route) : RUBAN · CHUTE (plus raide) · VERTIGE (la seule avec la faille à l'envers) · VOL — les poids des modules et la pente.
- **La fin de route** joue encore des modules s'ils tiennent avant l'arrivée ; si plus aucun module ne tient avant le climax, il vient tout de suite (`PH.cx`, route-briques.js — sans effet sur les autres maps).

## Les modules (`code/maps/orbite-modules.js`, chaque marque porte `nom`)
| module | `fig` | pour qui roule | pour qui vole |
|---|---|---|---|
| LA TORSADE | `torsade` | 3 grands virages : couché dans le 1er jusqu'à l'envers, le 2e la tête en bas, retour par la paroi du 3e | sauts courts sur les parois |
| LE VIRAGE SURBAISSÉ | `surbaisse` | un virage de 86-104° où la dalle passe la verticale (108-124°) | — |
| LE BOBSLEIGH | `bobsleigh` | 3 grands virages qui traversent l'axe, couchés à ~44° | — |
| LE PLONGEANT | `plongeant` | un virage de 100-118° couché à ~67° qui plonge (+11° de pente) | — |
| LA FAILLE / LA CASCADE | `faille`, `cascade` | une gorge en grand huit (la cascade : deux) | le saut à la lèvre, les fils d'or |
| LA FAILLE À L'ENVERS | `envers-entree`, `faille-envers`, `envers-sortie` | couché jusqu'à l'envers dans un virage, la faille la tête en bas, fin du tour dans le virage suivant | le saut la tête en bas (fils d'or) — humeur VERTIGE, routes ≥ 90 s |
| LE CROISEMENT | `boucle` | le looping : à l'envers en haut, au-dessus de sa propre route (sortie de 1,6 s) | — (son raccourci au pied ne marche plus : la route d'en bas descend à ~24° et file plus vite que la caisse ne tombe — mesuré en jeu) |
| LE CLIMAX | `grande-torsade` (+ `boucle` sur une route ≥ 66 s) | la grande torsade, puis le croisement | |

Chaque route a son module de vol (faille, cascade, faille à l'envers). Un seul grand tour de dalle par route en plus du climax ; sur une route de 44 à 90 s, aucun avant le climax ; jamais plus de 2 fois le même module.

## Les bancs
- `node outils/banc-routes/orbite-v5.cjs paliers=0,5,10,15,20 graines=1-24 [orb=…] [detail=1]` : modules, zones refusées, contacts, pente, droites, cap, même côté, roulis d'affilée, roulis le plus vif, envers d'affilée.
- `node outils/banc-routes/charte-espace.cjs paliers=0,10,20 graines=1-8 [espace=v4]` : R1, R2, R3, R4, R5, R7 (le saut nitro simulé avec la physique du jeu), R8, R10.
- `outils/banc-routes/empreinte.cjs` : ville, crypto, nuages identiques au bit près ; `SEARCH='?espace=v4'` redonne la v4 au bit près.
- En jeu : `roule-page.js` (`--q="orb=<module>&pmot=0&dur=110"`), `saut-page.js` (faille à l'envers ajoutée), `roule-diag.js` (la trace d'une chute au roulage).

## v5.3 — à la vitesse réelle (2026-11-13 soir, le banc juge commun de la supervision)
Le juge commun (`juge-page.js` de la session « Supervision génération de routes ») mesure les routes à la VITESSE RÉELLE : la croisière × l'élan (`DUREE_ELAN` : 1,8 au palier 0 → 1 au palier 25 — la nitro, le FLOW, l'élan). La v5.2, calée sur la croisière, notait 17/27 : tours de dalle jusqu'à 78°/s réels (p95 72), fin de route vide 17-21 s aux paliers 10-20, 25,6 % à l'envers au palier 0.
- **Les modules qui couchent la dalle se dessinent à la vitesse réelle** (`K.Tr` = croisière × élan, `EL5` dans genCtrl1 ; dans orbite-modules.js `Tt` = cette seconde-là, `Td` = la seconde de croisière des failles et du looping, réglés pour le saut et laissés tels quels). Le looping grandit avec l'élan (`fBoucle(sK, eK)` : sans eK, comme avant au bit près).
- **La torsade** reste 1,2-1,5 s la tête en bas dans son 2e virage (~8 s à plus de 90° en tout).
- **La faille à l'envers devient le CLIMAX de l'humeur VERTIGE** (routes d'au moins 100 s de croisière : plus vite, sa faille dure plus longtemps en vrai) ; entrée en 6,4 s (son virage ajoute du roulis), sortie en 5 s (le sien en retire). Avant un climax, aucun grand tour de dalle (R8) ; une torsade reste permise sur une route sans climax.
- **Les places des modules sont mesurées** (`ORB_DR` en s réelles, `ORB_DD` en s de croisière, `duree(k)`, banc `durees2.cjs` du scratchpad : le plus long de chacun + ~0,5 s) ; `ORB.reserve(longO)` : la place du climax.
- **Le climax vient à sa place** : options du phraser `margeMontee`, `fortPlace` (route-briques.js, sans effet ailleurs), marges 4,5 s, plus de climax avancé quand rien ne tient (les secondes de trop vont aux liaisons avant lui, plus à une fin vide).
- **Le module de vol est garanti par anticipation** : un module sans saut n'est tiré que si une faille tient encore derrière lui (0 route sans vol sur 150, c'étaient 12-16 sur 30 aux paliers 10-20) ; pas de cascade sur une route sans climax.
- Résultat (juge commun rejoué en Node, 8 graines × paliers 0/10/20) : **23/27** — R1 R2 R3 (max 57°/s, p95 43) R4 (≤ 13,1 s, fin de route comprise) R7 R8 (≤ 24,2 %, 9,3 s) R10 partout ; R6 aux paliers 10-20. Restent R6 au palier 0 (4 graines sur 8 avec un seul raccourci) et R5 (noms différents, graines voisines).
- Autres maps et `?espace=v4` : empreinte identique (empreinte.cjs, 12 graines × 2 paliers) ; non-déclarés : la même liste que main.
- Photos : planche ouverture / temps fort / climax / raccourci, graines 2 (Terre) et 4 (Saturne), palier 0 (banc des maps, scénario `vue`).

## v5.4 — les astéroïdes et la pioche (2026-11-13 soir)
Sacha : « fais aussi des modules où ça interagit avec l'environnement, les astéroïdes, les débris ; faut que ce soit l'exploration et fun ».
- **LES ANNEAUX** (`anneaux`) : une grande courbe qui traverse l'axe à travers cinq couronnes de 24 roches (centre à `ANN_H` = 14 m au-dessus de la dalle, rien à moins de ~13 m de la chaussée) ; au cœur de chaque anneau, une pièce EN L'AIR (à la hauteur d'un saut). Compte comme module de vol.
- **LA CEINTURE D'ASTÉROÏDES** (`ceinture`) : trois virages qui traversent l'axe, chacun autour d'un GÉANT (36-58 m) au cœur du virage, que la route frôle, dans un champ de roches (au-dessus de la route, sur les côtés, en dessous) ; entre la route et chaque géant, trois pièces en l'air pour qui vole de ce côté.
- **LE TOUR DE L'ASTÉROÏDE** (`tour`) : le looping (fBoucle) autour d'une grosse roche posée au centre de la boucle (son rayon lu sur la route : trois points au sommet). Un seul looping en temps fort ; jamais sur une route au climax faille à l'envers (R8).
- Le décor : `MODMARK.nu` (le mécanisme des nuages des modules, remappé par pisteTord et buildTrack), posé par `rochesModules` (orbite-roches.js) AVANT tout le reste, sur toutes les planètes (Mars comprise) ; le téléphone en pose moins (ROCHE_N). Les pièces : `espAstPieces` (pouvoirs-grisants.js).
- **LA PIOCHE** (`ORB_PIOCHE`, `orbPioche` appelée par genCtrl sur l'orbite) : un module de la route d'avant ne revient que si rien d'autre ne tient — les graines du jeu sont tirées au hasard, deux routes de suite tiraient souvent les mêmes. `?pioche=0` = sans (une graine redonne alors toujours la même route ; avec la pioche, la route d'une graine dépend de la route d'avant).
- Le climax part sans souffle quand sa place est juste (`climaxDirect`, phraser) : un souffle de 2,3 s privait le croisement de sa place.
- Juge commun (Node, 8 graines × 0/10/20) : **26/27** — tout passe sauf R6 au palier 0 (un seul raccourci, celui du croisement, sur 6 routes sur 8). Le tour de l'astéroïde en ajoute un, mais l'imposer faisait mal noter ces routes par le directeur de rythme (il gardait alors 6 routes sur 8 en faille à l'envers) et une route passait 30 % à l'envers : il reste au tirage.
- **À FAIRE (signalé par la supervision)** : LE NOIR — la face du dessous de la dalle ne reçoit presque rien en orbite (la clé `ORB.cle` est tenue au-dessus de la face du DESSUS, orbite-2.js ; l'hémisphère est fixé au haut du monde, `hemiS` presque noir, biomes.js ; il ne reste que `uLift` ≈ 0,03-0,05) : quand la planète sort du cadre, l'image est noire avec un liseré.

## v6 — après le refus de Sacha (2026-11-13 nuit) : « la désorbitation »
Sacha a refusé la v5.4 : « looping dans aucune map », « les anneaux autour de la route avec des mini astéroïdes, n'importe quoi, c'est horrible », « la route est globalement droite ». La supervision des routes, à qui il a délégué le design, a posé « la désorbitation » : une descente en grande spirale ouverte vers la planète, des grands S continus, un GÉANT au centre de chaque virage, deux raccourcis (la corde, le balcon), un climax sans looping (la rentrée).
- Étape 1 (c6bb0590) : plus de croisement ni de tour ni d'anneaux ; LA FRONDE (arc de 120-170° autour d'un astéroïde géant, la dalle couchée vers lui) et LA CEINTURE DES GÉANTS (deux grands virages, chacun autour d'un géant) ; le géant est au CENTRE du virage (`nu` {t:'geant', s, R}, `rochesModules`), rayon (R − 73)/1,24, 300 m au plus.
- Étape 2 (3cb28955) : la route toujours en courbe — montées vers ±55-65° à 3,2-4,2 rP, plus de souffle ; les virages des modules vont d'un bord à l'autre. 152°/km au palier 0 (133 avant).
- Étape 3 (ce018241) : LA SPIRALE — `derAx` (genCtrl1) : l'axe tourne de 180-300° (tiré par graine), toujours du même côté ; 0 hors de l'orbite v5 (autres maps et `?espace=v4` identiques à l'empreinte). Amplitude du cap 278° au palier 0.
- Étape 4 (1cd47289) : la grande torsade ≤ 9,3 s à l'envers ; les bancs versés au dépôt (`juge-node.cjs`, `virages-orbite.cjs`, `virages-parties.cjs`, `durees-orbite.cjs`, `phrase-orbite.cjs`, `premiere-route.cjs`, `banc-maps/planche.ps1`).
- Juge commun : 22/27. Restent R4/R5/R6 au palier 0 (3 marques, 8 noms, 0 raccourci), R4 au palier 20 (22 s), 200°/km (150), la rentrée, le balcon, la corde, un envers par route au palier 20. Les failles et la cascade (~37°/km, 14 % de la route) gardent leur géométrie de saut prouvée.
- La suite : deux sessions proposées (« Orbite v6 : la désorbitation, suite » ; « Orbite : les géants en 3D »), leurs briefs reprennent tout ce qui précède.
