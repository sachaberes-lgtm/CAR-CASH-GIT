# ESPACE — LES GÉANTS DE L'ORBITE (2026-11-13 nuit → 14) : les modèles et les shaders neufs

## La demande
La supervision des routes (à qui Sacha a délégué le design de l'orbite v6, « la désorbitation ») : Sacha a refusé les anneaux de mini-astéroïdes autour de la route ; il veut des objets **GROS au CENTRE des virages**, la route tourne autour. Un géant par temps fort, jamais deux fois le même sur une route :
- **la lune glacée** : on rase sa surface, la dalle couchée vers elle ;
- **l'épave de station** : on la traverse par le hangar, virage dedans ;
- **la comète** : sa queue lumineuse passe en travers de la route, on plonge dedans puis on en sort (« le visuel le plus fort ») ;
- **le plan des anneaux** (Saturne) : on le longe, puis on le perce ;
- un caractère par planète (Mars : poussière rouge et rochers ocre ; Terre : épaves et satellites) ;
- la planète qui grossit du départ au portail ; la lueur de l'atmosphère pour la rentrée finale.

Cette branche ne touche PAS la génération de la route (session « Orbite v6 : la désorbitation, suite », branche `espace-v5-ruban`) : elle s'accroche aux éléments `MODMARK.nu` `{t:'geant', s (le côté), R (le rayon du virage), g (le genre voulu, facultatif), gros (le géant du climax)}`.

## Où c'est
- `code/maps/orbite-geants.js` (morceau neuf, après `orbite-soleil.js`) : tout — modèles, shaders, la pose, l'image par image, la collision, le hook `dbgGeants`.
- Les accroches (une ligne chacune) : `orbite-2.js` (orbiteBuild : `geantsVide`, `geantsPose` avant `rochesModules`, `geantsRoches` après ; orbiteTick : `geantsTick`) · `orbite-roches.js` (`uOcre` : les roches ocre de Mars ; `rochesModules` ne pose que les géants tirés ASTÉROÏDE) · `continuite.js` (lvlPlanete : `× geantsPlaneteK()`) · `boucle-3-physique.js` (en vol : `geantsHeurt`) · `pouvoirs-grisants.js` (les pièces de l'épave DANS le hangar).
- Le banc : `outils/banc-maps/geants.cjs` (photos EN ROULANT, voir plus bas).

## Les géants (genre : `q.k`, tiré par `geantsPose`)
Le tirage : sans remise, au poids du CARACTÈRE de la planète (`GT_POIDS`) — Terre : épave 3, comète 2,4, lune 1,4, astéroïde 1 · Mars : astéroïde 3, comète 2,2, épave 1,2, lune ,8 · Saturne : anneaux 3, lune 2,6, comète 1,6, astéroïde 1, épave ,8. Un genre qui ne tient pas (pas la place, une autre portion de route trop près) passe au suivant ; l'astéroïde est le dernier recours. `q.g` (le genre voulu par le module) passe en premier.
Le centre : **le centre vrai du virage** (`gtCentre` : le cercle par trois points de la route autour de `q.s`, ± 0,42 R) ; l'arc `[sa, sb]` = là où la route reste à 0,82-1,2 Rc de ce centre.

| genre | ce qu'on voit | comment |
|---|---|---|
| **astéroïde** | la roche géante teintée par la planète (rochesModules) ; sur MARS : ocre, dans un nuage de poussière rouge (la route le traverse), 3-5 gros rochers ocre autour (jamais à moins de 35 m d'une route) | `uOcre` dans le shader des roches ; le nuage = le gaz (ci-dessous), une boule seule |
| **lune glacée** | une sphère de glace (plaques bleu-gris, fractures rouille fines, cratères et éjectas — l'ordinateur seulement —, reflet de la glace, liseré bleu, une lueur bleue dans son ombre : jamais un aplat noir) au centre vrai du virage, sa surface à ~24 m du bord de la dalle ; elle tue en vol | une sphère lisse (128×80, téléphone 64×40), tout le relief est au fragment (normale bossée par les dérivées du relief) |
| **épave** | une station en roue brisée : le moyeu (hublots), l'anneau d'amarrage, le rayon qui tient le HANGAR, deux autres rayons et leurs morceaux de couronne arrachés (ou des moignons), deux ailes solaires (un panneau tordu), des feux rouges qui clignotent ; le hangar (40×25 m de creux, 240-560 m de long) suit la route et tourne avec la dalle : côtes tous les 24 m, rangs de lampes, brèches au plafond, bouches rayées jaune et noir | UN maillage bâti à la pose (26 000 triangles sur l'ordinateur), UNE matière ; la lumière des lampes est cuite dans la couleur ; `geantsHeurt` : la coque tue (la section `cyVouteHeurt` du canyon, refaite) |
| **comète** | le noyau sombre SOUS le centre du virage (0,28 Rc), la tête dorée et son halo, deux queues de 4 à 7 km qui passent PAR la route puis montent dans le ciel (~16°) : la poussière (large, dorée, juste avant le milieu du virage) et les ions (fins, bleus, ~17° plus loin) ; leurs stries ; des grains qui filent ; dedans, l'image s'allume (le voile) | le GAZ : une coque (cône tronqué vue de dos), le fragment intègre la densité le long du regard (gaussienne autour de l'axe + boule — formule de l'erf, pas de marche) ; les 50 premiers mètres autour de l'œil ne comptent pas (dedans, pas de bouillie) |
| **anneaux** (Saturne) | une nappe d'anneaux (le profil des anneaux de Saturne, `SATU`) en cercles autour d'un petit berger de glace : la route longe l'anneau B ~30 m au-dessus (on l'approche à 7,5 %), le perce, puis on roule dessous (une brume dorée pailletée) ; des annelets qui défilent | un disque (3 feuilles à ±5,5 m sur l'ordinateur, 1 sur le téléphone), translucide, il s'ouvre devant l'œil (on le perce sans mur) |

Pour toute la route : **la planète grossit** du départ au portail (`geantsPlaneteK` : ×1,28, ×1,45 sous Saturne — le halo reste devant la caméra) ; **la lueur de la rentrée** (le bord de l'image s'embrase, orange, scintillant) sur la fin de la route.

## Contraintes tenues
- **Compilé au menu** : tout est dans la scène dès le chargement, invisible ; `orbiteChauffe` compile (banc : `dbgGeants('chauffe')` vrai au menu, aucun programme neuf entre le menu et la fin de course).
- **Le téléphone** (`ALLEGE`, jamais `IS_MOBILE`) : sphères 64×40, hangar en 20 facettes tous les 8 m, une nappe, 360 grains au lieu de 1 400, pas de cratères au shader. `garde-allege.sh` : OK.
- **Aucune lumière ajoutée** : les shaders prennent la clé de l'orbite (`ORB.cle`) et le reflet de la planète (`SAT_U`).
- **Les autres maps** : rien ne bouge hors de l'orbite (`geantsPlaneteK` = 1, tout invisible, `GEANTS.col` faux).
- Non-déclarés : la même liste que la branche de départ ; `garde-charte`, `garde-demarrage` : OK.

## Le banc (photos EN ROULANT)
`node outils/banc-maps/serveur.cjs 8297 <worktree>` puis
`node outils/banc-maps/geants.cjs --cas=matin:lune,midi:comete,soir:anneaux,matin:rentree [--tel=1] [--vue=1] --port=8297 --cdp=9497 --profil=geants-pc --out=<dossier>`
(matin = la Terre, midi = Mars, soir = Saturne ; `rentree` = la fin de route). Il force le genre (`?geant=`), met la fronde à chaque temps fort (`?orb=fronde`), attend la chauffe du menu, pose la caisse 520 m avant le géant (`dbgBord`), la laisse rouler au pilote auto et photographie approche / entrée / cœur / sortie (+ la percée et le dessous pour les anneaux, la queue pour la comète). Il mesure chaque image (luminance, part de noir : « NOIRE »), relève les erreurs, l'état de LIAISON de chaque programme des géants (la liaison en douce du jeu ne lit pas les erreurs de shader : un shader cassé ne se dessine jamais, sans un mot), les programmes compilés en course. `--vue=1` : une image de loin (la course en pause) ; `--diag="expr"` : une expression après la vue.

## Pièges
- **Un shader cassé est muet** : la retouche de three (LIER) ne lit pas le journal du compilateur → vérifier `programmes tous liés` au banc après chaque retouche de GLSL.
- **Le gaz vu de loin sur la Terre** se perd sur le fond clair de la planète (additif) : son effet fort est en roulant (la tête, la queue dorée, la bleue). Test au magenta (`--diag`) : il est bien dessiné.
- **Assembler** : l'outil Edit garde ici les fins de ligne, mais après un premier assemblage, `node code/assembler.cjs` refuse (« les deux côtés ont changé ») → `--depuis-morceaux` (index.html n'a que l'assemblage d'avant).
- **Planche PowerShell** : passer des chemins Windows (`pwd -W`), pas `/c/...`.
