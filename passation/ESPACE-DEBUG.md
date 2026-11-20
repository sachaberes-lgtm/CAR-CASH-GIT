# ESPACE — débogage et retrait des géants (18-19/11)

Branche `claude/espace-debug-ed5d53`, partie d'`origin/qualite-appareil` (build 121, a42e9ec50), mise à jour avec le build 122 (307364aea).
**Rien sur main ni dans qualite-appareil.** `VERSION PRINCIPALE/index.html` et `sw.js` ne sont pas commités : réassembler (`node code/assembler.cjs --depuis-morceaux`) et incrémenter le cache à la fusion.

## ⚠ EN TÊTE : MODULES RETIRÉS DU TIRAGE (décision de Sacha, 18/11)
« finalement supprime tous les modules exploitables avec la route dans l'espace, laisse juste quelques satellites et météorites à des endroits, réarrange la route en ce sens ».
Lecture prise : on retire tout objet 3D que la route traverse, contourne ou vise ; on garde les modules de FORME de la route (virages, torsades, envers, faille…).
- **Sortis du sac et du tirage** : la roue, la petite lune, l'astéroïde percé, la nébuleuse (les quatre géants des « voyages »).
- **Plus posés** : la lune glacée, l'épave et son hangar, la comète (queues, grains, voile), le plan des anneaux, la poussière et les rochers de Mars, l'astéroïde géant des virages et la grosse roche de la rentrée, l'épave / la roche au cœur du mur, les roches au bord de la route et en porte, les pièces des géants. Plus rien n'est dur dans le décor de l'espace.
- **Restent** : la route, le ciel, la planète (elle grossit toujours), la lueur de la rentrée, et **3 à 6 amas par route** — satellites et débris autour de la Terre, météorites autour de Mars et Saturne —, chacun à **62 m au moins de toute portion de route en plan** (donc jamais au-dessus ni au-dessous d'elle).
- **Interrupteur** : `?plus=geants` = la route et le décor d'avant, au bit près (prouvé ci-dessous).
- Les temps forts des routes courtes, qui étaient une fois sur deux l'astéroïde ou la nébuleuse, prennent le virage surbaissé ou le dévers inversé (couchés ×1,14 / ×1,2 au lieu de ×1,08 / ×1,14 pour garder ≥ 6 % d'envers).

## Défauts trouvés
| # | Module | Ce que voit le joueur | Cause | Correction | Preuve | Interrupteur |
|---|---|---|---|---|---|---|
| D1 | l'entrée de l'espace (toutes ouvertures, 1er module quel qu'il soit) | en arrivant par un portail, ~1 route sur 3 : une figure (mur couché, bosse, plongeon, ceinture…) 1,2-1,7 s après l'entrée, encore sous le flash, le tunnel et le flou d'entrée en orbite (1,9 s) — « j'ai rien compris » | routes uniques : `ORB5.s0U=150` et `deb=max(150,1.2·vC)+85` (orbite-uniques.js) ; la vérification d'avant roulait en départ direct, sans portail | une ENTRÉE de 2,6 s réelles (vPalier × élan), courbe douce, dalle < 20°, relief tenu ; la route s'allonge d'autant | `node outils/banc-espace/etat-entree.cjs paliers=0,5,10,15,20 graines=101-160` : avant 16-23/60 routes avant 1,9 s ; après 0. `node outils/banc-espace/entree-test.cjs` : 0/360. Contrôle adverse (200 routes × 6 paliers, ses graines) : 1er module ≥ 2,79 s, dalle > 25° ≥ 2,59 s — `passation/espace-debug/CONTROLE-ENTREE.md` (FUSIONNABLE) | `?sans=entreetenue` (build 121 au bit près) |
| D2 | les géants | (décision de Sacha, pas un bug prouvé) | — | retrait, voir en tête | voir plus bas | `?plus=geants` |
| D3 | reprises d'unicité (toutes routes) | aucun à l'écran ; une même graine ne redonne pas la même route selon la vitesse de la machine (plus de redites sur iPhone) | `ville-entree.js` : reprises bornées par 50 ms d'horloge | **non corrigé** | `passation/espace-debug/GENERATION.md` | — |
| D4 | mur, esse aux paliers 20-27 | roulis 60-65 °/s pendant ≤ 0,5 s (charte : 60) | coucher des petits modules sur route courte | **non corrigé** (faible) | GENERATION.md | — |
| D5 | 1re route d'espace de la séance | aucun ; `?routeverif=1` la voit différer de sa référence | le sac des routes uniques écrit dans localStorage par la route de référence | **non corrigé** (sans effet joueur) | `passation/espace-debug/ENJEU.md` | — |

Rien d'autre en Node sur 4 968 routes (0 recoupe, 0 trou, 0 envers au départ/à l'arrivée, 0 demi-tour de normale) ; en jeu au pilote, 3 entrées par portail : 0 mort, 0 chute, caméra jamais dans la dalle.

## Preuves du retrait des géants
- `node outils/banc-espace/sans-geants-bit.cjs . "?plus=geants" espace` = la base (HEAD) : `a6e9abf8ee7f1f26` des deux côtés ; `?sans=uniques&plus=geants` = base `?sans=uniques` : `7ae37c439f62126e` ; nuages, ville, crypto identiques. Jade, grotte, canyon : fichiers non touchés.
- `node outils/banc-routes/uniques/test.cjs` : vert (200/200 suites uniques aux paliers 0 et 10 ; modules vus 26/25, seuil abaissé de 27 à 23 = les 4 géants retirés ; la faille à l'envers ne sort jamais au palier 10, comme sur la base).
- `node outils/banc-espace/entree-test.cjs` : vert.
- Gardes : `node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh` vertes ; le grand script compile (vm.Script ; le seul « échec » est un commentaire contenant `<script`, identique sur la base).
- Coût : rien de plus — sans géants, leurs maillages ne sont pas créés (sphères, épave, gaz, grains, nappes, jante, roche percée), donc ni compilés au menu ni en mémoire ; `voyIco` n'est plus précalculé au chargement.
- En jeu (Chrome, portrait, tel=1) : voir la section « Course » ci-dessous.

## Fichiers et fonctions touchés
- `code/maps/orbite-uniques.js` : `orbUEntree`, `orbUJoue` (entrée, D1), `orbUForme` ; `OU_GRANDS`, `OU_CX`, choix du temps fort court.
- `code/gameplay/route-sans-haut.js` : `pisteTordG` (ORB5.cE, relief tenu dans l'entrée).
- `code/maps/ville-entree.js` : `genCtrl` (une ligne, ORB5.cE remis à zéro).
- `code/maps/orbite-modules.js` : `ESP_SANS_GEANTS`, `ESP_KE`, `kE`, `M.stengel`.
- `code/maps/orbite-voyages.js` : `orbVoyEtat` (plus de géant), modules roue/lune/asteroide/nebuleuse non déclarés.
- `code/maps/orbite-voyages-decor.js` : `VOY_MESH`, `voyDecorPose` (seulement les pentes des tracés), `voyIco`.
- `code/maps/orbite-geants.js` : création des maillages, `geantsPose`, `dbgGeants`. **`geantsTick` garde le fond de l'espace (`skyU.uVid`/`uNeb`) et la lueur de la rentrée** (finition-maps y règle `uNeb`).
- `code/maps/orbite-2.js` : `orbiteBuild` (`libreH`, les amas de satellites, l'ancienne population sous `?plus=geants`).
- `code/maps/orbite-roches.js` : `rochesPose` (amas de météorites), heurts, `espAmasLieux`, `espAmasPoint`, `ESP_AMAS`.
- `code/gameplay/pouvoirs-grisants.js` : `espAstPieces` (plus de pièces des géants).
- Bancs : `outils/banc-espace/*`, `outils/banc-routes/uniques/{test,mesure}.cjs`.

## Pour finition-maps (apparence)
Plus aucun géant à embellir. Les matières/couleurs de la route, du ciel, des satellites et des roches n'ont pas été touchées. Les amas sont petits (un gros Starlink ou une grosse roche, quelques débris) : à juger à l'œil s'ils se lisent assez de loin.

## Pas vérifié
- Rien sur le téléphone.
- Mort / seconde chance au milieu d'un module à l'envers dans l'espace ; sauts volontaires ; paysage.
- D3, D4, D5 laissés tels quels.

## Course dans Chrome (19/11, sans géants)
`sh outils/banc-espace/enjeu-passe.sh passation/espace-debug/sans-geants/p1 --suite nuages,espace,jade,espace --monte 0,3 --mortel 1 --max 600` (portrait 390×844, tel=1, 30 i/s, sous le verrou).
Deux entrées dans l'espace par portail (430 puis 656 km/h, paliers 0→3 et 7→13) : **0 exception, 0 erreur console, 0 mort, 0 chute, caméra jamais dans ni sous la dalle, caisse toujours dans le champ, sortie par le portail les deux fois**, 0 pièce hors de la route.
Une alerte « caméra > 240 °/s » à s = 8 m de la 2e entrée : c'est la coupure du portail (l'image pixelisée de la transition), pas un module.
Images : `passation/espace-debug/sans-geants-planche-v0.jpg`, `sans-geants-planche-v1.jpg`, `sans-geants-entree-v1.jpg` — plus aucun géant, la route se lit. **Les amas de satellites et de météorites ne se voient pas nettement sur ces images** (posés à 150-360 m de la route) : à juger sur le téléphone ; si on ne les voit pas, les rapprocher (ESP_AMAS / espAmasLieux, orbite-roches.js).
