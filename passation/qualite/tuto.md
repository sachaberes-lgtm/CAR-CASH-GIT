# L'auto-école v3, plein écran (22/11, branche qa/tuto-finitions)

> **POUR ARCHIVER DANS XCODE** : cet arbre n'a ni `app-ios/node_modules` ni les fichiers générés, et son `app-ios/www/` date du 12/11 (sans ce tuto). « Packable en Xcode direct » = **une commande puis Archive** : committer et fusionner ce lot (code/ + index.html + `cashcar-vNNN` de sw.js), puis dans le dossier de build habituel (`~/cash-car/finition-build`, qui a node_modules) : `cd app-ios && npm ci && npm run sync`, ou `sh app-ios/archiver.sh`. Rien de cela n'a été fait ici (ni commit, ni sync, ni Xcode).

Demande de Sacha : « refonte ultra poussée du tuto […] plus de petite fenêtre, on ne doit pas pouvoir le skip, de grands trucs plein écran en transparent avec un pouce en pixels ».

## Ce qui change
- **Plus de carte `#coach` ni de bouton PASSER.** Un calque plein écran transparent `#ecole` (pointer-events:none partout : il ne prend jamais un doigt), par-dessus la course.
- **Le déroulé** : accueil une fois (« AUTO-ÉCOLE », les 6 gestes en tuiles, « ici, impossible de perdre », 3,3 s), puis pour chaque geste :
  1. **carte-titre** 2 s (« 1/6 », la tuile du geste qui pivote en 3D, le mot géant en relief, la phrase) : rien n'est exigé ni reproché. **Pas en plein vol** : VOLE et POSE-TOI, atteintes en l'air, demandent le geste tout de suite (le mot arrive en grand dans le rappel) ;
  2. **le geste** : un grand pouce en pixels (SVG crispEdges, 24 × 28, peau en relief, incliné en CSS 3D, ombre d'encre en pixels, traînée fantôme) fait le geste à l'endroit réel de la commande : glisse sur une grande piste ◄ ► (TOURNE), se pose et reste sur NITRO avec des ondes et une jauge « TIENS ! » qui se remplit (NITRO, VOLE), pousse vers le bord avec de grands chevrons dorés (DÉCOLLE), chevrons vers le haut (VOLE) ou vers la route (POSE-TOI), deux tapes « ×2 » (FIGURE) ou le glissé depuis NITRO (FIGURES › GLISSER). Le rappel (mot + phrase) reste en haut, dans le ciel. Le pouce s'estompe dès que le joueur agit, revient après 0,8 s sans rien faire, se relance en grand toutes les 7 s sans réussite. TOURNE coche chaque côté réussi ;
  3. **le bravo** en grand (coche qui pivote, rayons, gerbe de pixels, son `tuto.bravo`, vibration) ; un **raté** se dit en grand et gentiment (cœur orange, « OUPS ! / PRESQUE ! / PAS GRAVE ! » + la manière de réussir).
- Progression : 6 tuiles (le dessin de chaque geste) en haut au milieu (couché : à droite, la jauge NITRO du HUD occupe la gauche).
- **Le permis** en plein écran : la carte de permis (plaque du joueur, les 6 gestes) arrive en tournant, tampon VALIDÉ, prime +500 (versée une fois, comme avant). Couché, la carte à gauche et la prime à droite : le milieu (la route devant) reste libre.
- **Ordinateur** (`PC_CLAVIER`) : de grandes touches en pixels (◄ ►, ESPACE) inclinées, qui s'enfoncent au rythme du geste, à la place du pouce ; textes agrandis (zoom 1,3 / 1,7) sur les grandes fenêtres.
- Tout est en transform/opacity ; chaque animation n'est déclarée que dans la phase qui la montre ; à la fin de la leçon le calque est **retiré du document** (vérifié : 0 animation restante). `REDUCED_MOTION` / iOS « réduire les animations » : tout posé, rien ne bouge.

## Les chemins de « skip » retirés
- Le bouton PASSER LE TUTO et `tutoPasse` / `tutoPasseRange` (le seul abandon définitif) : supprimés.
- QUITTER (pause, ordinateur, banc jade) passait déjà par `tutoQuitte` : la leçon reste à faire (`SAVE.d.tuto=0`) et reprend au prochain JOUER. Inchangé.
- RECOMMENCER pendant la leçon : `tutoDebut`, la leçon repart de l'accueil. Inchangé.
- La question de bienvenue (« J'AI DÉJÀ JOUÉ ») est déjà éteinte (`bienvVeut` rend faux). `?lecon=non` n'existe qu'en dev. Une sauvegarde avec `tuto=1` n'est pas concernée.

## Corrections du 22/11 au soir (après les cinq contrôles)
- **La leçon a toujours une sortie.** Avant : bravo 1,15 s + carte-titre 2 s en chute libre, la caisse à −100 m quand VOLE était demandé, explosion 1,5 s après, retour à DÉCOLLE, sans fin (et plus de PASSER). Maintenant : en vol, bravo de 0,95 s puis le geste tout de suite (mesuré : geste demandé à −3 / −8 m sous la route, 3,6 s avant l'explosion si on ne fait rien) ; une mort à VOLE ou POSE-TOI compte comme un raté (`tutoMort`, appelé par `endGame`) et dit quoi faire (« En l'air, garde NITRO appuyé ») ; **au 2e raté l'étape est accordée** (« ON CONTINUE ! ») et la leçon passe à la FIGURE.
- **Le plein de nitro est redonné à l'entrée du geste** (NITRO tenu pendant la carte-titre vidait la réserve : 1,97 au lieu de 0,45 mesuré).
- **TOURNE** : la coche s'allume du côté du pouce (`steer > 0` = gauche).
- **Le pouce est un pouce** : un doigt épais, ongle rose, deux plis, la base qui s'évase vers la paume ; il penche vers l'intérieur et se retourne selon le côté d'où vient la main (`#ecole.mG`). Plus de main-curseur.
- **La piste du volant** : 22 % de la largeur couché, 35 % debout (à 80 % de la hauteur), miroir en main gauche ; elle n'est plus sur la caisse ni sur NITRO.
- **Chevrons** : cachés sur la carte-titre de VOLE / POSE-TOI ; couché, à côté de la caisse ; à POSE-TOI ils pointent le point de route le plus proche (pas de 15°), vers le bas quand on est au-dessus du bitume.
- **Explosion pendant la leçon** : le calque du geste se retire (`.boom`), « CHAÎNE PERDUE » ne s'affiche plus.
- **Main gauche + FIGURES › GLISSER** : le glissé part vers la droite, le chevron est dans l'écran. **Réduire les animations** : le « ×2 » et l'anneau de tape sont posés (aussi avec le réglage du jeu). **Permis** : ses 3,6 s ne s'écoulent plus sous la pause.
- Restes de l'ancienne carte : la branche `#coach` de `hudColMesure` et `coNitro` sont retirés du JS. Les ~25 règles CSS `#coach` / `.coSkip` / `coNitro` des autres feuilles sont mortes et **laissées** (aucun effet ; dix feuilles partagées la veille d'une sortie).

## Finitions du 22/11, nuit (un seul auteur ; code/interface/auto-ecole.js + code/css/ecole.css)
- **Le pouce est redessiné** (`EC_MAIN`, 24 × 28, `EC_PAL`) : peau pêche en 5 tons (contour d'encre, ombre profonde, ombre, moyen, lumière, reflet), grand ongle nacré à éclat blanc, deux plis de phalange, doigt trapu un peu cambré, base qui s'élargit côté paume et se **fond** sur 4 lignes (`ecSvg(..., fondu)` : opacité fixe par rectangle, pas de bord coupé). Dix essais comparés sur planche agrandie ; photo `15-pouce-agrandi.png`. Le bout du doigt est au même point d'ancrage ; aucune animation changée ; ni filter ni backdrop-filter.
- **La piste du volant tient entière dans l'écran**, flèches et battement de 8 px compris (`ecPlace` : place libre = 8 px des bords, moins NITRO s'il est à sa hauteur ; c'est le rail qui raccourcit). Mesuré sur une boucle : 390 × 844 droitier 13 → 266 (NITRO à 277), gaucher 126 → 379 (NITRO jusqu'à 113) ; 844 × 390 droitier 33 → 339 (caisse à 350 ; rail couché 104 au lieu de 120), gaucher 489 → 827 (caisse jusqu'à 484) ; 320 × 568 : 13 → 196, NITRO à 207 (la piste ne le recouvre plus).
- **L'accueil** : tuiles et phrase toutes arrivées à 1,1 s (mesuré), fermeture à 3,33 s : 2,2 s de lecture complète.
- **Bravo et consigne jamais l'un sur l'autre** : celui qui part s'efface en 0,12 s, celui qui arrive attend 0,12 s (mesuré en vol toutes les 37 ms : jamais les deux au-dessus de 0). Le geste est demandé au même instant qu'avant. Couché, la coche et le mot du bravo sont **côte à côte** (y 27-109, la caisse en vol à 176) ; les rayons partent de la coche (`ecRayons`).
- **Ordinateur** : à VOLE / POSE-TOI les chevrons passent à côté de la caisse (un cinquième de la fenêtre) ; 1280 × 720 : chevrons x 353-416, caisse à 599, 9 px sous la consigne.
- Rejoué après ces changements : `lecon.cjs` 390 × 844, 844 × 390, `--rm 1`, `--pc 1` ; `doigts.cjs` naïf (vraie pose cette fois), `--scen mort`, obéissant gaucher + GLISSER : permis, 0 exception partout. Gardes démarrage / allège / charte : OK. Photos refaites : 01, 02, 03, 05, 06, 08, 11, 12, 13, 14 ; ajoutée : 15.
- **Pas vérifié / restes** : pas de vrai iPhone ; anglais et COMMANDES = FLÈCHES non rejoués ; le rectangle du SVG du pouce (paume transparente et fondue) dépasse le bord de l'écran de 20 à 40 px, c'est la main qui arrive du bord, le bout du doigt reste sur la piste ; quand la caisse se rapproche de la caméra (nitro, DÉCOLLE) sa boîte descend sur la piste (inchangé) ; 320 × 568 : le rail ne fait plus que 85 px et les flèches touchent le bas de la caisse de 8 px (hors cible) ; bravo couché sur un écran plus étroit que ~620 px : le mot repasse sous la coche ; la carte-titre qui suit un bravo SUR LA ROUTE arrive encore pendant que le bravo finit de s'effacer (0,12 s, non demandé) ; `ecRayons` n'a pas été vu avec le zoom PC (il ne s'applique que couché sur téléphone).

## Les quatre réglages (même lot)
- HUD calme à 3 s (`HUD_CALME_MS`) : la flamme du pouce suit ce délai (`HUD_CALME_MS+500`, elle se figeait au début du fondu). Les bancs qui attendaient 0,9 s (`banc-hud/calme-rien`, `calme-garde`, `leger`, `couches`, `banc-pause/pause`) attendent plus de 3 s — **modifiés, pas relancés**.
- Série et révélation : ne se ferment que par leur bouton… **sauf si le bouton n'est pas entier à l'écran** (320 × 568 : CONTINUER est à y 593-649, plus rien ne fermait) : là n'importe quel toucher ferme, après le délai. Avec « réduire les animations », 2,5 s au moins depuis l'ouverture (**écrit, pas chronométré**).
- Titre des maps retiré (`?titremap=1` le remet).
- App : la note pour le testeur d'Apple (FICHE-APP-STORE.md §6) ne dit plus « it can be skipped » — **à recoller dans App Store Connect par Sacha** ; `preparer-www.js` : la référence `mer-cumulus.webp` suit le fichier aussi en `COMPLET=1` (essai à blanc des deux éditions réussi).

## Vérifié le 22/11 au soir (son coupé, Chrome sans fenêtre, verrou pris et rendu)
- `node code/assembler.cjs --depuis-morceaux`, `garde-demarrage`, `garde-allege`, `garde-charte` : OK.
- `lecon.cjs` jusqu'au permis, **0 exception**, calque retiré : 390 × 844 `?tel=1`, 844 × 390, anglais, ordinateur 1280 × 720, réduire les animations.
- `doigts.cjs` (au doigt, sans raccourci) `--pilote naif` et `--pilote obeissant` : les deux finissent au permis (avant : six tours sans fin). Joueur qui ne fait rien en l'air : 2 morts, étape accordée, FIGURE.
- Main gauche : coche du bon côté, piste à droite, chevron du glissé à x 136-168 sur 390. Série : 320 × 568 se ferme d'un toucher, 390 × 844 seulement par CONTINUER.
- Photos (14) : `passation/qualite/photos/tuto/` — 01-05 debout (accueil, titre, geste TOURNE, bravo, NITRO), 06 raté gentil après une mort, 07 permis EN, 08 couché DÉCOLLE, 09 couché permis, 10 ordinateur, 11 VOLE demandé en vol, 12 main gauche FIGURES › GLISSER, 13 réduire les animations (« ×2 » posé), 14 couché POSE-TOI.
- Bancs : `node outils/banc-tuto/lecon.cjs [--w 844 --h 390] [--pc 1] [--en 1] [--rm 1] [--glisse 1] [--var 1]` · `node outils/banc-tuto/doigts.cjs --scen main --pilote naif|obeissant|expert [--gaucher 1]` (prendre / rendre `~/cash-car/verrou-banc.sh` autour).
- Non fait : `cashcar-vNNN` de `VERSION PRINCIPALE/sw.js` (consigne : ne pas y toucher) — à monter avant de pousser.

## Pas vérifié / fragile
- **Une vraie pose à POSE-TOI n'est pas prouvée** : les pilotes du banc arrivent à la FIGURE par la pose accordée (9 s de vol ou 2e raté), pas par un atterrissage sûr.
- L'orientation des chevrons de POSE-TOI vers la route : vue sur deux photos (route en haut à droite, chevrons vers elle), pas mesurée sur toutes les positions ; sans radar elle retombe sur « vers le bas ».
- Pas de vrai iPhone (chaleur, Taptic, encoche) ; rien n'a été installé ni compilé.
- COMMANDES = FLÈCHES (`TCTL.pad`) : la mise en scène `fleches` est écrite, jamais vue.
- L'écran de série sur petit écran se ferme, mais son bouton reste hors de l'écran (la grille n'a pas été resserrée).
- Décisions laissées à Sacha : le CHAT POP-TART retiré de `owned` sans message dans l'édition App Store (montant ou message) ; la VERSION gravée (`df41561f2`) qui ne distingue pas les builds.
