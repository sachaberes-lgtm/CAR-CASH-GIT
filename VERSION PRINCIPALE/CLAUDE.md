# CASH CAR — guide projet pour Claude Code

## LA MÊME VERSION POUR TOUT LE MONDE — LA MISE À JOUR TOUTE SEULE (2026-10-01, Léo : « trouve un moyen pour qu'on joue au même jeu, juste — fais-moi ça en un coup »)
- Le problème : deux joueurs voyaient deux jeux. Une appli posée sur l'écran d'accueil de l'iPhone REPREND la page gardée en mémoire
  (aucun rechargement pendant des jours), un onglet resté ouvert garde l'ancienne version ; on ne savait même pas laquelle on avait.
- `vercel-build.sh` grave le commit publié (`VERCEL_GIT_COMMIT_SHA`) dans le jeu — il remplace le jeton de `const CC_BUILD` dans le
  `<head>` (UNE seule occurrence dans index.html : ne pas l'écrire ailleurs, même en commentaire) — et pose `jouer/version.json`
  (`{"v":"<commit>"}`, servi en no-store par vercel.json, jamais rangé par sw.js).
- LA MISE À JOUR TOUTE SEULE (bloc juste avant « fin ajout MOBILE / PWA ») : au lancement (+4 s), à chaque retour au premier plan et
  toutes les 5 min, le jeu lit version.json ; en retard → il se RECHARGE dès qu'on n'est pas en course (menu, garage, écran de mort ;
  jamais pendant le LÂCHER ni en arrière-plan), sauvegarde écrite d'abord ; sur l'ordi la page-cadre entière (`window.top`). Garde-fou :
  2 rechargements au plus par version et par session (`sessionStorage.ccMaj`). Copie locale (jeton intact), file://, Capacitor : rien.
- LE NUMÉRO : « VERSION 506f117 » en bas des RÉGLAGES (`#mvVer`) et sous le jeu sur l'ordi (`#ccVer`), avec « · MENU LEO » / « · SANS
  CIEL » si l'adresse porte `?menu=leo` / `?chute=0` — deux joueurs comparent leurs deux écrans d'un coup d'œil. `dbgMaj()` : état.
- MESURÉ (banc `maj.mjs` sur une copie construite par vercel-build.sh, servie en local) : même version → aucun rechargement ; nouvelle
  version au menu → rechargé (2 fois au plus) ; publiée en pleine course → rien pendant 30 s de course, rechargé juste après la mort.
- ⚠ Un appareil qui tourne une version d'AVANT ce mécanisme doit être rechargé une fois à la main (ou l'appli fermée/rouverte).

## L'ORDI = L'IPHONE DE SACHA, ENCOCHE COMPRISE (2026-10-01, Léo : « son emplacement des touches est différent — que sur mon ordi, tous les ordis, ça ressemble à ce que Sacha a »)
- MESURÉ : le cadre de l'ordi avait déjà la TAILLE de l'iPhone 13 Pro de Sacha (844 × 390), pas ses MARGES. Sur le vrai téléphone iOS
  rentre l'interface de 47 px de chaque côté couché (21 en bas ; debout 47 en haut, 34 en bas) : au menu la colonne de boutons tombait
  84 px plus près du bord droit sur l'ordi, le HUD de course aussi. APRÈS : mêmes rectangles au pixel près (banc `cmp.mjs` : cadre de
  l'ordi 1440 × 800 contre un iPhone émulé avec `Emulation.setSafeAreaInsetsOverride` 47/47/0/21 — menu, course, debout).
- Mécanique : les 56 `env(safe-area-inset-X,…)` du jeu sont lus via `var(--ccX,env(safe-area-inset-X,0px))` (X = T B L R). Seule la
  colonne de l'ordi pose `--ccX` (`html.telCadre`, classe posée par le script du `<head>` quand l'adresse porte `colonne=1`) ; un vrai
  téléphone ne les pose pas et garde SES marges. ⚠ Toute nouvelle marge d'encoche s'écrit `var(--ccX,env(safe-area-inset-X,0px))`
  (ou passe par --sT/--sB/--sL/--sR, --hudG/--hudD/--hudH qui en dérivent), jamais `env()` nu.
- La page-cadre dessine l'écran du 13 Pro : coins de 47 pt (`border-radius` sur l'iframe, agrandi par son zoom) et l'ENCOCHE (`#encoche`,
  154 × 31 pt, posée par `cadre()` sur le côté gauche couché, en haut debout), par-dessus l'image comme sur le vrai. `?encoche=0` = sans.
- « Tous les ordis » : un portable à ÉCRAN TACTILE dont la fenêtre fait moins de 820 px de haut passait pour un téléphone (plus de cadre,
  jeu étiré sur tout le moniteur). Le test « vrai téléphone » (colonne du `<head>` ET `TEL_NATIF`) lit désormais la taille de l'ÉCRAN :
  tactile ET (`hover:none` OU min(screen.width, screen.height) < 600).
- Pas simulé (à deviner) : les barres de Safari quand Sacha joue dans le navigateur et pas depuis l'écran d'accueil (elles mangent ~40 px
  de hauteur couché). sw.js → v48 (Sacha était déjà en v47).


## LA TOUCHE VAN GOGH + NUAGES v8.1 (2026-10-01, nuit, session GAMEPLAY) — Sacha : « inspiration Van Gogh pour le ciel » ; mesures de SON et DEBUGGING sur les v8
- PARTAGE : SON m'a confié TOUTE la touche (dôme compris, une seule main) ; le reste du dôme, les ambiances, l'étalonnage et la route restent
  à SON. `uVG` (skyU, partagé tel quel par les nuages : `N8_U.uVG = skyU.uVG`) porté par le biome : `vg:1` dans G9 (matin/midi/aprem),
  `vg:0` dans BIO_ETAL0, posé par bioApply. 0 = le ciel et les nuages d'avant.
- LE DÔME (`K.vg`, dans les passes PLEINE et LISSE — basN — : aucun programme de plus) : `cielTourbillon` — le ciel en TOUCHES (des virgules
  alignées sur un vent qui ondule, `vgTouche`), quatre TOURBILLONS fixes du ciel (le vent s'enroule en spirale, les bras s'éclairent de crème),
  la palette de LA NUIT ÉTOILÉE (une couleur par touche : outremer, bleu clair, blanc crème), le soleil cerclé d'ANNEAUX ; `vgMer` à la sortie
  de merZ : la mer de nuages en touches couchées (fondues au loin). Tout analytique (atan, sin, 4 centres) : peu de calcul.
- LES NUAGES : la lumière posée en APLATS de peintre (ombre, demi-teinte, lumière, rehaut) aux bords brisés par un bruit accroché à la matière
  (`vO`, unités du nuage) — mélangée à 38 % (à 70 % les nuages devenaient plats comme de la pâte) — et un CONTOUR sombre au bord de l'ombre.
  ⚠ Essayé et retiré : des HACHURES en touches sur la ouate (repère tangent) — au banc, des écailles de reptile et des lignes de niveau.
- v8.1 (mesures de SON / DEBUGGING) : blanc franc côté soleil (l'or n'arrive qu'en fin d'après-midi : `ch` selon la chaleur de sun.color),
  ombre BLEU-LAVANDE (le sol de l'hémisphère tirait au brun), contre-jour en liseré seulement (il teintait toute la face), RELIEF de près
  (sous ~300 m la normale ondule : plus de mur « en plastique »), finesse du tout près 48 (seuil sg > 32). Budget re-mesuré sur 3 pistes :
  112-207 k triangles au sol debout, 43-94 k en vol. ⚠ Le « sable » des blancs au jour venait de la couche DA (mesuré : DA coupée → neutre) :
  corrigé par SON (daHi).
- Bancs (scratchpad GAMEPLAY) : `n8/sable.js` + `n8/sable.py` (couleur moyenne des blancs sous plusieurs réglages), `n8/studio.js`, `ciel2.js`.
## LE GARAGE v7 + LES BLANCS DU JOUR (2026-10-01, session SON — Sacha : « retravaille le garage, je veux la perfection » ; DEBUGGING (v6), GAMEPLAY (atelier, photos) et INTERFACE (tas de billets) ont passé la main / prévenu)
- Relevé mesuré d'abord (`da/gar-audit.js`, scratchpad f6f592c0 : 4 formats, onglets, caisse rare, caisse verrouillée — boîtes, textes coupés, cibles, police mini) ; UNE couche `<style id="garageV7">` après la v6, même portée (`html body #garage:not(.menu)`).
- Le PRIX n'est dit qu'une fois : `#gCard.prixSeul` (posé par la fiche quand la condition est de l'argent) masque l'encadré « PRIX / il te manque » qui redisait le bouton « IL MANQUE $ X » et mordait sur la scène. Défis et boutique en € restent écrits.
- Lisibilité : rang « 1 / 68 » 8 → 11 px, onglets 8 → 10 px (`--f1`), comptes des puces 8 → 10 px ; zone de touche des puces 42 → 44 px (⚠ par leur `::after` : le `::before` est le LOSANGE — l'écraser l'efface).
- La bande de vignettes se FOND dans le bord de la console (masque 40 px, éteint au bout de la bande : `#gStrip.finDroite`).
- L'étiquette MISSIONS posée sur le décor (#gMisAncre) est masquée dans la boutique.
- Cadrage : la caisse centrée à 44 % de sa zone libre (garLibre, `r.shop`) au lieu de 50 % — elle se posait bas. Lumière : dans la boutique, la clé passe à 1,6 avec une portée de 22 (la caisse se détache, la pièce garde son ombre) ; au menu, rien ne change.
- LES BLANCS DU JOUR (mesure de GAMEPLAY : les nuages et la peinture de route sortaient SABLE) : le split or des hautes lumières de la couche DA est désormais dosé par ambiance, `daHi` (1 partout par BIO_ETAL0, 0 aux trois heures du jour ; protégé contre les NaN du mélange). uHi = [0,0,0] au jour ; clairs du haut de l'image (221,219,195) → (234,221,231).
- Vérifié : souris dans la colonne (`da/pc3ss.js`) 58 OK avant / après 1 et 2 parties (3 « CASSÉ » = `#gNext`, les flèches retirées en v6, banc en retard) ; tas de billets d'INTERFACE hors de la silhouette de la caisse.

## L'ARGENT DE L'ATELIER — LES TAS DE BILLETS (2026-10-01, session INTERFACE — Sacha : « plus on gagne d'argent, plus il doit y avoir des tas de billets sur le sol du garage, un peu placés partout, sur les meubles et tout »)
- `garArgent(g)` (défini juste avant `buildGarageRoom`, appelé avant `gmHoloBuild`) bâtit UNE fois un seul mesh de liasses en couleurs de
  sommets dans la matière MATE des meubles (`GAR.meubles`, famille 'm') : **zéro programme de plus** (mesuré 144 → 144), 28 ms sur PC.
  `garArgentMaj()` (une comparaison de `bank()` par image, dans `garageRender`) règle seulement combien on en dessine (`setDrawRange`).
- **Courbe** : n = 12 × (compte / 50)^0,4 objets — 1 k → 40, 20 k → 132, 300 k → 389, 2,5 M (la caisse la plus chère) → 909 ; 910 au plus.
  C'est le compte ACTUEL : dépenser fait fondre les tas (l'argent part de l'atelier).
- **Où** : 10 tas bas (3 couches, 33 cm) dans le couloir de la caméra, 7 gros tas (5 couches) au pied des murs, des piles sur les fûts, le
  distributeur, le rack, la servante et l'établi, puis 6 palettes (10 couches de 8) contre les murs quand on est riche. Places cherchées sur
  une grille (`libre`) : loin des meubles (les rectangles de `F9`) et du bazar au sol, **rien entre la caméra et la caisse** (demande de
  SON : la caisse est la vedette), rien dans l'allée de la porte (la caisse sort par là), rien de haut devant l'affiche du record. Ordre :
  ce que la caméra voit d'abord ; chaque place s'ouvre à un seuil, puis la moins remplie reçoit l'objet suivant (les tas montent ensemble).
- Liasses VERTES et sombres (tranche vert-de-gris, face vert billet, bande kraft) : une 1re version à bandes or/rose/cyan et tranche crème
  se lisait comme des confettis. Hook : `dbgArgent(compte)` force un compte (sans toucher la sauvegarde), `dbgArgent(null)` relâche.
  Banc : `garargent.js W H tag` (COMPTES=0,1000,… en variable d'env).

## LA PHYSIQUE DU BORD v2 — le « clic » du bord corrigé (2026-10-01, session GFX) — Sacha : « quand on roule au bord de la route on est comme TÉLÉPORTÉ à côté — c'est un petit CLIC bizarre, Léo l'avait corrigé »
- LA SOURCE : le correctif de Léo (`cb3e82c`, branche `version-leolei-2026`, 26/09) n'avait jamais été porté sur main. Porté et adapté
  (vitesse réelle `vitMult`, caméra de vol d'aujourd'hui avec son bras `CAMV`).
- MESURÉ AVANT (banc `bord5.js`, sortie douce par le bord) : à l'image du passage, la caisse SAUTAIT de 0,79 NDC à l'écran (×52 son
  mouvement normal — du bord de l'image au centre, la caméra de vol la visait d'un coup), restait figée une image puis rattrapait 2,7 m, et
  recevait +0,6 m et un coup de saut (+3,4). APRÈS : 0,04 NDC (×2, le mouvement ordinaire). Décollage d'un saut normal : 0,40 → 0,04.
- CE QUI A CHANGÉ :
  · la sortie par le bord = une BASCULE : `startFall(0,1,true)` — ni impulsion ni poussée, la caisse part de sa hauteur (`hopY`) ; la vrille
    tourne du côté du VIDE (`bascDir`) et démarre lentement (le pivot sur la lèvre), en partant du roulis qu'avait la carrosserie ;
  · ROUES DEHORS (au sol) : la carrosserie penche vers le vide (jusqu'à ~9°) et le plancher RACLE la lèvre (étincelles d'or) — on SENT le
    bord avant d'y tomber (`pe9`, dans le ressort du roulis) ;
  · LA LÈVRE (`levreRattrape`, dans tryLand avant le BUMP) : dans les 0,6 s d'une bascule, si la caisse revient vers la route à moins de
    `LEVRE_H` (0,7 m) sous la surface, le pneu raccroche et elle repart en conduite (−6 % de vitesse, rien de payé, rien de rendu). Banc
    `levre.js` : raccroché en 2 images à 1-7 m/s vers la route, zéro BUMP ;
  · le BUMP ne téléporte plus la caisse à 1,8 m du bord (ni ne la recale sur le point de piste) : elle est remise CONTRE la tranche ;
  · la CAMÉRA DE VOL : l'image du décollage avance caisse ET caméra d'un même pas (plus d'image figée) ; le suivi lisse l'ÉCART caisse→caméra
    et sa traîne s'installe en 0,6 s (en régime établi : l'ancien suivi au chiffre près) ; la VISÉE de conduite (`loop._vise`, ~10 m devant)
    fond vers la caisse en ~0,4 s au lieu de sauter, et la penche du virage (`camLean`) s'efface en douceur.
- ⚠ LE SURSIS (2026-10-01, le lendemain, Sacha : « à grande vitesse on MEURT sans raison, sans la chance de se RATTRAPER » + « un son de
  merde quand on sort de la route, deux petites notes ») — la v2 avait retiré le bond de sortie : c'était le clic, mais AUSSI le sursis
  (avec la vitesse d'éjection réelle × vitMult du 30/09, la caisse boostée file ×2,6 plus vite de travers). Trace (banc `rattrape.js`) :
  à 350 dans un creux, la caisse partie tout droit était 1 m SOUS le plan de la route en 0,08 s — sans gravité, c'est la route qui remonte.
  Rendu sans bond : (1) LA CAISSE PORTÉE PAR LA LÈVRE — le temps qu'elle bascule (`BASC_T` 0,45 s) et tant que ses roues intérieures
  touchent (centre < demi-largeur au-delà du bord), elle suit la hauteur de la route et ne s'affaisse que de 35 cm (dans tryLand, avant la
  lèvre) ; (2) la gravité s'installe en BASC_T (`gB9`, la portance nitro au même prorata : jamais de remontée) ; (3) la lèvre raccroche
  jusqu'à `LEVRE_H` 1,2 m sous la surface, pendant 0,8 s. Banc `rattrape.js` (5 points de piste × vA 200/350 × réaction 150/300 ms, sortie
  lente, volant vers la route 1,5 s) : AVANT la v2 (avec le bond) 2 rattrapées vite / 13 perdues sur 19 ; MAINTENANT 7 / 8 sur 20 (+5
  reposées plus loin). Passage du bord toujours sans à-coup (0,04 NDC). Le SON : impU 0 faisait jouer `chute` (le sifflet + « oh-oh »,
  fait pour les TROUS) — la sortie par le bord rejoue le `decollage` d'avant, dosé comme l'ancienne impulsion 3,4.
- ⚠ PAS RÉGLÉ : à l'ATTERRISSAGE la caisse saute encore de ~0,3 NDC vers le bas de l'image en une image (déjà là avant : 0,44-0,46 mesuré).
  Cause pas encore trouvée — piste : ce qui s'applique d'un coup à la reprise de conduite (la visée, elle, est censée glisser).
- Hook `dbgBord({lat,vL,grace,psi,vA,s,saut,rentre})` : pose la caisse au bord, force un petit saut, ou pousse la caisse vers la route en vol ;
  rend `{mode,lat,demi,vL,bumps,fallT,side,hOff,latOff,steer,basc}`. Bancs (scratchpad GFX) : `bord5.js doux|lent|retour`, `levre.js 1,4,7`, `rattrape.js <racine> <fichiers> <vA> <réactions> <points>` (VL=, TRACE=1).

## LES NUAGES v8 — REFAITS À ZÉRO (2026-10-01, nuit, session GAMEPLAY) — Sacha : « les nuages dans le premier niveau sont toujours aussi moches, il faut que tu reprennes tout à zéro et que tu me fasses une vraie génération de nuages adaptée au jeu et à la DA — pousse-toi dans tes limites, prends tout ton temps et surprends-moi »
- LE DIAGNOSTIC : v1-v7 retouchaient les formes et les couleurs d'un même principe — des SPHÈRES fusionnées, chacune avec sa lumière Phong.
  Un nuage restait une grappe (les boules se comptaient, chaque soudure faisait une ligne), les gabarits étaient des piles de bourgeons
  ÉTROITES (au banc : des « fantômes »), et la lumière était plate. Le problème était la technique, pas le réglage.
- LA SURFACE (`nuage8Calc`, pure, dans l'OUVRIER) : l'isosurface d'un CHAMP DE DENSITÉ — lobes gaussiens fondus (log-somme-exp, netteté
  `N8_OPT.K` 5,5 : des creux francs entre les lobes), base PLATE au niveau de condensation, un soupçon de bruit (`det` .3) plus fort vers le
  haut — maillée par SURFACE NETS (un sommet par cellule traversée, un quad par arête traversée : étanche, régulier, sans table). Normales =
  gradient du champ (une seule masse). MODELÉ CUIT dans la couleur des sommets : R = occlusion (le champ sondé le long de la normale), G = le
  ciel au-dessus (sondé vers le haut : les lobes du dessus portent leur ombre), B = la hauteur. Quatre finesses `N8_FIN` 12/18/26/36 cellules, choisies par la taille À L'ÉCRAN (cotonTick : ~1 cellule pour 11 px).
- LES FORMES (`cumulus8(genre,rng)`) : un vrai cumulus — base de lobes aplatis dans une empreinte elliptique, DÔME plus haut au centre, selon
  le genre une TOUR aussi large que le dôme (4 lobes par étage), cisaillée par le vent, une rangée de tourelles, un rouleau, un troupeau,
  des lambeaux, et le CUMULONIMBUS (tour massive + ENCLUME large et plate, étirée sous le vent) — le 25e gabarit (`COTON_KINDS` 25), réservé aux titans et
  au colosse de l'horizon (de près, une tête sur un cou se lit comme un ARBRE : `N8_GENRE_V` champignon → congestus) ;
  puis le CHOU-FLEUR : 2-3 enfants ronds sur la calotte de chaque lobe du haut, et les petits-enfants au sommet. 70 lobes au plus.
  `N8_GENRE6` : les 6 anciens gabarits classiques deviennent des cumulus de ces genres.
- LA MATIÈRE (`nuage8Mat`, clé `nuage8inst` ; `nuage8Solo`, clé `nuage8solo`, pour les maillages seuls) : une lumière de peintre — frontière
  d'ombre douce mais franche (`uR.x/.y` en N·L), côté ombre pris par le CIEL (l'hémisphère de l'ambiance, désaturé, bleu-lavande, clarté
  `uR.z`), côté soleil un blanc neutre (l'étalonnage réchauffe déjà), ombre portée des lobes et creux (cuits), bord qui s'ALLÈGE de face (la
  vapeur), LISIÈRE d'argent et vapeur éclairée à contre-jour. Toutes les couleurs viennent de l'ambiance (bioApply) : aucune écrite ici.
  LA OUATE BOUILLONNE : deux ondes lentes le long de la normale (1,5 % du nuage), déphasées par nuage (`uTps`, posé par cotonTick).
- PARTOUT : les instances du ciel de coton (COTON), et les BANCS DE ROUTE, COUSSINS DE VOL et TOURS (mkCloud hors campagne/mer/voiles/murs/
  titans/décor : forme et matière v8, maillage à l'échelle `mesh.scale = r`, surface fine de l'ouvrier, l'ébauche en boules en attendant ;
  dedans, le white-out `CLOUD_MAT_IN8` : la même paroi sans les couleurs de sommet, qui sont un modelé). Fondu de zone : `N8_U.uFondu`.
- `?n8=0` = les nuages d'avant (A/B). Hooks : `dbgN8({x,y,z,w,r:[…]})` (albédo, soleil, lisière, vapeur, frontière d'ombre/clarté de
  l'ombre), `dbgN8Regen({K,det,fq})` (refait toutes les surfaces), `dbgNet(1)` (coupe le flou de vitesse pour une image nette au banc).
- Bancs (scratchpad GAMEPLAY) : `n8/studio.js <racine> <préfixe> <variantes.json>` (les genres en plein ciel, de côté et à contre-jour),
  `ciel2.js` (course figée), `n8/diag.js` (matière et géométrie vivantes). Mesures de perf : banc `perf-nuages.sh` de DEBUGGING.
- MESURÉ (banc perf de DEBUGGING, puis n8/quick.js, debout 390×844, même piste) : 1er jet 449 k triangles au sol (main 153 k) → finesses
  et seuils revus : ~184 k au sol, 43 k en vol (l'ancien système, même piste : 221 k / 70 k) ; couché ~115 k. Programmes : 142 au menu = 142
  en course (+2 chauffés au menu : nuage8solo, nuageV2dedans8), 0 lié en course. Toutes les formes prêtes en ~15 s (dans l'ouvrier ; les
  ébauches sur 12 lobes tiennent la place). 0 erreur, v8 et ?n8=0.
- À TRANCHER PAR SON (menu CHUTE) : chuteRender cache COTON au menu (les anciens passaient en boules translucides de 1 500 m).
## L'ACCUEIL CONTEMPLATIF (2026-09-30, nuit, session SON) — Sacha : « prends le bouton sans fond JOUER de Léo et remplace le mien pour laisser plus d'espace au ciel ; réduis aussi la taille des boutons pour que ce soit plus contemplatif »
- `mPlayMot()` : le JOUER de l'accueil de Sacha (`#mHome .mPlay`) devient le mot de Léo (`#gPlayMain`) — des lettres d'or `.lg.gold` grillées de cubes, SANS plaque (la classe `.mMot` remplace `.pbtn/.pb-gold/.big/.wide`), la vague d'écailles part du doigt (`mPlayVague`, sur `pointerdown`) ; reconstruit à chaque bascule de langue (applyLangDOM). Le routeur `data-m="play"` est inchangé.
- UNE couche `<style id="accueilCiel">` (après toutes les autres) : MISSIONS/⚙ à 44 px, tuiles 52 px (icônes ×2), couché la colonne des boutons passe à 340 px calée à droite (le LOGO garde sa largeur), pastilles NEW/10 à cheval sur le bord haut des tuiles.
- MESURÉ (`da/menu-boites.js`, 4 formats) : les boutons couvraient 19-27 % de l'écran → 14-20 % (le mot JOUER compté comme une boîte), cibles ≥ 44 px partout. Banc souris-colonne (`da/pc3ss.js`, copie SwiftShader du pc3.js de GAMEPLAY) : JOUER / re-JOUER / REJOUER OK avant, après une et après deux parties (les 3 « CASSÉ » restants = `#gNext`, les flèches retirées par le garage v6 : le banc est en retard, pas le jeu) ; au doigt (390×844) : 5 lettres en vague, la partie part.
- (2026-10-01, DEBUGGING, avec l'accord de SON — Sacha : « les boutons du bas sont trop tassés ») : chaque plaque porte sous elle sa TRANCHE de 5 px, hors de sa boîte, donc 8 px entre deux rangées n'en laissaient que 3 de jour. La pastille « 30 », à −9 px, touchait MISSIONS. Désormais, en fin de la couche `accueilCiel` : 18 px sous MISSIONS (16 couché), 16 px avant JOUER (12 couché), 12 px entre MISSIONS et ⚙. Mesuré par `st-accueil.js` (scratchpad b76e6ad3) dans 6 formats : 0 chevauchement, la colonne couchée reste sous le logo.

## LE GARAGE v6 — LA RARETÉ EN COULEUR, UNE CONSOLE (2026-09-30, session DEBUGGING) — Sacha, capture couchée : « les raretés sont écrites deux fois alors qu'on peut juste mettre les couleurs — refonte totale du garage »
- Tout est dans `<style id="garageV6">` (la dernière feuille avant `#garage`), scopé à la BOUTIQUE de l'atelier : `html body #garage:not(.menu)`.
  Le menu, les missions et l'étal (#stall, qui réutilise des ids) n'en voient rien.
- LA RARETÉ SE DIT EN COULEUR, UNE FOIS :
  - `#gRarPill` est masquée (elle redisait « COMMUNE », ou « PEINTURE » déjà écrit sur l'onglet) ;
  - un filet de la couleur de la famille passe sous le NOM (`#gName::after`, `--rc`) ;
  - `#gLvl` ne dit plus que « 1 / 68 » (« CAISSE » était dans l'onglet VOITURES) ;
  - les puces `#gRar` (5, sur une ligne, grille à parts égales, plus de défilement) = un losange de couleur + le compte. Le nom est
    dans `<span class="gRn">` masqué, et dans aria-label/title ;
  - en habillage, les filtres `.gF` (TOUT · À MOI · À ACHETER) gardent leur mot : ce ne sont pas des raretés.
- LA CONSOLE : `#gBottom` devient UNE plaque (laque, filet, coins coupés `--coupe`, la LIVRÉE en tête).
  - Couché : en bas à droite, largeur min(48 %, 450 px), SOUS le ⚙.
  - Couché, `garLibre` reconnaît la colonne à sa PLACE (`W>H*1.2`), plus à sa hauteur.
- Vignettes : DEUX rangées couché (grille, 82 × 50) ; une rangée debout et couché bas (< 380 px de haut). Liseré de la famille en bas.
- Plus de flèches ◀ ▶ dans la boutique (elles se posaient sur la caisse) : on touche une vignette. Les flèches du clavier marchent toujours.
- Le NOM tient toujours dans sa largeur : `--nL` = nombre de lettres (gNomEntre, posé même si le nom ne change pas).
  - `font-size: min(…, 100cqw / --nL − 3px)`, avec #gCard en conteneur (la police pixel avance d'1 em par lettre).
  - Avant, « L'AMBASSADEUR » sortait de l'écran debout.
- Mesuré à 844×390, 780×360, 932×430 et 390×844 : aucune puce coupée, la console sous le ⚙. Le parcours complet passe, debout et couché, sans erreur (course → mort → MENU → GARAGE → HOME → MISSIONS → HOME → JOUER).
## LE STUDIO PHOTO v2 — LES PHOTOS DE CAISSES (2026-09-30, soir, session GAMEPLAY) — Sacha, capture de la boutique : « pourquoi ces photos sont aussi moches »
- MESURÉ sur l'ancien `carPhoto` : caisse tournée PILE face à l'objectif (rotation .72 pour une caméra à .70 d'azimut → vue de face écrasée),
  360 × 220 affiché ×2 sur Retina (flou, escaliers), ambiance 1,25 + clé 1,3 brûlées par la relève 1/1,35 (jaunes et verts fluo en aplat),
  et la tache rose `.shPhoto::before` qui se lisait comme une BARRE sous la caisse.
- v2 : trois-quarts avant nez à gauche (`PHOTO_ROT` −.12, `PHOTO_AZ` .70, `PHOTO_EL` .27), objectif 24°, cadrage CALCULÉ sur la boîte des
  maillages VISIBLES (86-93 % de large, 4 passes, la caisse un peu haute), rendu ×2 (`PHOTO_SS`) réduit en 720 × 440 (bords nets), clé chaude
  + contre-jours rose et cyan + ambiance .62 (du modelé), relève douce 1/1,22 avec ÉPAULE au-dessus de .82, saturation ×1,14, ombre de contact
  sous le CENTRE de la caisse et reflet d'un sol verni (la photo retournée, 26 % → 0 sur 18 % de la hauteur). Même cache, mêmes appels :
  boutique, vignettes du garage, récompenses des missions. `.shPhoto::before` = une lueur large et douce derrière ; le drop-shadow CSS retiré.
- Banc : `photo/photo.js <racine> <préfixe>` (scratchpad GAMEPLAY) — la boutique debout/couché + chaque photo en pleine définition.
## NIVEAU 1 v2 — LE JOUR D'ALTITUDE REVU (2026-09-30, nuit, session SON — Sacha : « refonte DA senior du niveau 1, le fer de lance » puis, sur une capture de l'ancien menu, « sérieusement recommence tout ») — partage : SON = l'IMAGE (dôme, merZ, ambiances, lumières, étalonnage, route, menu CHUTE) ; GAMEPLAY = les NUAGES 3D (COTON, bancs, leur matière)
- Mesuré sur la v1 de GAMEPLAY (banc `da/n1-audit.js` + `da/mesure-image.py`, scratchpad session f6f592c0 ; menu : `menu-shot.js`, variantes à chaud `menu-var.js` / `course-var.js`) : caisse FLOUE en course, « 1.61 » flottant dans le ciel, midi LAITEUX (L10 51), mer du menu en aquarelle étalée, caisse du menu à plat, filets de vent en rayons verticaux, cumulus translucides devant la caisse au menu.
- **LA CAISSE RESTE NETTE** (`postCaisse`, uniforms `uCtr/uSafe/uRn` du post) : le flou radial de vitesse part de la caisse à l'écran (en portrait elle est en BAS : il partait du milieu et l'étalait à la moindre plaque BOOST), à la même force qu'avant rapportée au coin le plus loin, et un disque de la taille de la caisse reste net.
- **LA MER SCULPTÉE** (`merZ`, uniforms `uMzA` = échelle des cellules 760 m, part « gonflée » .8 (1−|2n−1| → des dômes), franchise de la lumière 15, remous .25 · `uMzB` = couverture .20, fermeture au loin .16, creux .26, clarté des trouées .8) + une grande échelle (`big`) : champs denses et zones trouées. Plus de rubans d'encre rasants.
- **LES TROIS HEURES** moins laiteuses : zénith plus profond (midi jZen .03/.22/.55), hémisphère .70 (ombres), contraste 1.28-1.30, exposition .94-.96, vignette .26. Mesuré en course : L10 26 → 5-7, colorfulness 91 → 88-122. ⚠ le midi RELEVÉ par dbgBio en plein vol reste clair (L10 58) : c'est la mer vue d'en haut, pas la route.
- **LA ROUTE** : `ROUTE_JOUR` [.86,.94,.86] (était [1,1.12,.88]) — le ruban le plus sombre de l'image, la caisse orange se lit contre lui (contraste caisse/entourage 26-31 → 27-40 au départ).
- **PAS DE « 1.61 » AU JOUR** : les chiffres d'or du soleil ×(1−uJour) (les autres niveaux les gardent).
- **LE MENU CHUTE** : pose piquée (`CHUTE_P.pitch` .55, `elev` .30 : elle TOMBE au lieu de planer), COTON caché au menu (chuteRender / rendu par chuteSort), filets de vent effacés près de la caméra, bandeau du bas en azur profond (`#garage.menu.ciel::after`), son `chute.vent` (boucle : grondement, rafales, l'air qui claque sur les tôles ; +4 dB et ×1,25 au piqué de JOUER).
- **LE SON DU NIVEAU** : `nuages.ambiance` en course au niveau NUAGES (l'air d'altitude, rafales lointaines, harpe éolienne dans la tonalité ; −7 dB dans un nuage). sons-banque.js?v=11.

## LE JOUR D'ALTITUDE — LE NIVEAU NUAGES ET LE MENU REFAITS (2026-09-30, soir, session GAMEPLAY) — Sacha, capture du menu CHUTE + image de Zelda : Tears of the Kingdom : « c'est vilain, refonte totale, refonte également du niveau dans les nuages, ambiance haut de gamme GTA 6, toute l'ambiance de cet écran doit être refaite et parfaite » · « vilain garçon si tu rajoutes pas un moyen de déplacer la caméra autour de la voiture avec le doigt »
- PARTAGE (accord des sessions) : GAMEPLAY = SEUL écrivain de l'IMAGE du niveau NUAGES et du menu CHUTE (ciel, lumière, brume, étalonnage,
  mer de nuages, COTON, route, CHUTE) ; SON = l'œil de DA (critique numérotée, mesurée) et le SON (ambiance d'altitude, `chute.vent`).
  DEBUGGING (auteur de LA CHUTE) et GRAPHISME (ciel/COTON) ont passé la main.
- LE CIEL (skyDome, zéro programme de plus : tout est chauffé au menu) : `uJour` (0 = le ciel d'avant, au bit près) mélange un dégradé
  À LUI — `uJZen` azur profond au zénith, `uJMid` turquoise, `uJHor` horizon crème (le couchant de Vice City multiplié ne devient jamais
  turquoise) ; `cielJour` pose la lueur du soleil sur l'horizon (`uJSol`) ; sous l'horizon `merZ` = une MER DE NUAGES pleine (dômes crème
  au soleil, flancs bleu-lavande, rares trouées d'azur, embrasée côté soleil, noyée au loin : `uMerLoin` 16 km). Au jour d'altitude, le
  pommelé passe blanc-crème et ×0,2, l'onde de couleur musicale ×0,15 et le fond musical ×0,25 (ils faisaient tourner le ciel au VIOLET).
- LES AMBIANCES : `BIOMES.matin/midi/aprem` (le niveau libre NUAGES, les heures de la carrière qui les emploient, et le menu :
  MENU_BIO='matin') reçoivent jour/jZen/jMid/jHor/jSol (champs par défaut dans BIO_ETAL0 : 0 partout ailleurs, bioMix mélange), une brume
  repoussée (900-1000 / 5000-5600), fogCj/fogIn CRÈME et BLANC (le corail et le rose de la nuit teintaient le jour en MAGENTA), un
  étalonnage neutre (wb 1, hi qui COMPENSE le split or de la couche DA — sinon un nuage blanc, haute lumière, sortait orange), une
  vignette bleu nuit, des nuages blancs au soleil (volSun presque neutre ; l'après-midi garde l'or) et un envTex au même ciel. Bloc
  « LE JOUR D'ALTITUDE — LES TROIS HEURES » juste avant `const BIO`. `dbgAmb(nom,{…})` retouche à chaud (menu et course) ;
  `dbgCielObj()` expose fog, skyU, GFX_U, COTON, lumières.
- LA ROUTE : `ROAD_U.uTeinte` (multiplie le bitume) = `ROUTE_JOUR` [1,1.12,.88] × LVL.mer × uJour → un anthracite à peine bleuté au lieu
  de l'encre violette ; elle se DÉTACHE du ciel clair (critère n°1 de SON).
- LE MENU CHUTE : la caisse tombe à 1 500 m au-dessus de TOUT le monde du niveau (les cumulus deviennent un champ de nuages sous elle, la
  mer à perte de vue) — `CHUTE_P` : alt 1500, avant 1500, pitch .22, elev .22, brume ×2,5, expo .82, clé ×.5, plus de traînée orange
  (`trainee` 0) ni de plancher peint (`plancher` 0). ⚠ Au menu la brume et l'exposition n'étaient JAMAIS écrites (fog #5e3254 de
  départ, exposition .71) : chuteRender les écrit (FOG_BASE × P.brume, POST_EXPO × P.expo) et chuteSort(false) rend à l'atelier les
  siennes (`CHUTE.av`).
- L'ORBITE AU DOIGT : glisser tourne le regard autour de la caisse (tour complet ; de haut en bas elle monte/plonge, borne −0,45…1,25 rad
  d'élévation), la vue rejoint le doigt en ~0,1 s et garde son ÉLAN lâchée en mouvement (×e^−3t) — le « glissé fondu » de l'atelier.
  Pas de retour automatique (Léo l'avait refusé à l'atelier) : JOUER ramène la caméra derrière elle pour le piqué. `CHUTE.oA/oAc/oW/oP/oPc`,
  branchés dans les gestionnaires pointer* de l'atelier (branche « AU CIEL »). Un appui sur un bouton de l'accueil (`[data-m]`) n'est plus
  pris pour un glissé (avant : il déclenchait garageImpact).
- MESURÉ : 140 programmes au menu ET en course (main : 141), 0 nouveau programme en course, 0 erreur ; boutons à la souris dans la colonne
  (pc3.js) avant/après une/deux parties. Bancs (scratchpad GAMEPLAY) : `ciel2.js <racine> <préfixe> <variantes.json> [debout|couche]`
  (menu, orbites, JOUER, course figée — `pause:1` fige la course, `bio` change l'heure), `ciel2/prog.js` (programmes), `pc3.js`.
## LA FRONDE + LE TRAIN DE BOOSTS (2026-09-30, session SON — GAMEPLAY a passé la main) — « trouve des moyens de rendre le jeu plus fun pour le gameplay quand tu roules »
- **Mesuré d'abord** (banc `route-journal.js`, scratchpad session f6f592c0 : pilote auto, moteur 8, 90 s au sol, chaque son de la console
  horodaté en temps de jeu) : ~290 événements par minute, jamais plus de 2,5 s sans rien, dont 2/3 de pièces. La route ne manque pas
  d'ÉVÉNEMENTS ; elle manquait de gestes de PILOTAGE qui rendent de la VITESSE (le VIRAGE SERRÉ ne rendait que de l'aura muette).
- **LA FRONDE** (`FRONDE`, `frondeLache`, bloc du virage dans la conduite) : un virage serré (charge > 32 tenue 0,9 s) pris SANS GLISSER
  catapulte à la SORTIE (charge < 12) — `vA += 16·p`, boost (flamme d'or aux pots), champ qui s'ouvre, gerbe d'or, son `fronde` (l'élastique
  qui lâche, st = la force). `p` = 0,4 → 1,6 : la TENUE (0,9 → 2,7 s) et la CORDE (`virC` : temps sur la moitié INTÉRIEURE, `lat·yawR > 0`,
  au-delà de 20 % de la demi-route — l'intérieur, c'est la ligne de course). Une glisse (drift, flaque) DÉSARME le virage (`virD`) : le drift
  a son mini-turbo, l'adhérence sa fronde. Remise à zéro au décollage (`startFall`) et à la partie. Aura `FRONDE` par la chaîne MUETTE,
  zéro texte au centre. Au banc : 22 frondes en 90 s (une par virage serré), 0 mort.
- **LE TRAIN DE BOOSTS** (`PADCH`, `padTrain`) : prendre les pads À LA SUITE sans en rater un (un pad passé à côté ou survolé casse le
  train) — `+18 +5·(n−1)` d'élan (plafond au 5e), poussée plus longue, la plaque sonne un degré de pentatonique plus haut, `BOOST ×n`
  dans la MÊME annonce. Traverse le portail (`newTrack` repose `sL=0`).
- Banc : `window.dbgRoule()` (frondes, force max, corde, train). Interrupteurs : `FRONDE.on`, `PADCH.on`.

## LA CHUTE — LE MENU DANS LE CIEL (2026-09-30, session DEBUGGING) — Sacha, capture de Zelda : Tears of the Kingdom : « la voiture doit tomber du ciel en face d'une route, dans le biome nuage, de très haut, à l'infini ; garde l'affichage et les boutons ; on la voit tomber sur la gauche, et sur la droite mes boutons »
- C'est le mode MENU de l'atelier, peint ailleurs : `garageRender` passe la main à `chuteRender` tant que `chuteVoulue()`. Il faut
  CHUTE_OK (`?chute=0` = l'atelier comme avant), MENU_SACHA (le menu de Léo, `?menu=leo`, garde son atelier et l'étiquette MISSIONS
  de son socle), garageOn, et `#garage.menu` sans `.missions`. Rien d'autre ne bouge : #mHome par-dessus, garMode, les portes GARAGE
  (boutique) et MISSIONS rouvrent l'atelier sous leur volet, et `chuteSort()` lui rend biome, reflet et sons. Le retour au ciel
  (HOME) passe par un voile blanc (`#chuteVoile`).
- Le décor est le monde du niveau 1 (la piste du menu, ses nuages, la mer de nuages du dôme) sous le ciel `MENU_BIO` (le JOUR des
  NUAGES de l'ancien accueil). Plan (`chutePlan`, une fois par piste) : un tronçon DROIT du début de piste regardé en enfilade, le
  soleil de côté devant (`CHUTE_P.sol` = cos visé), aucun nuage du niveau contre la caisse. Caisse à `alt` 240 m, `avant` 720 m en
  retrait ; caméra à `elev` .15 ; la caisse est posée dans la place libre de l'interface (`menuCadre` de la vitrine : bande de GAUCHE
  couché, bande du milieu debout un peu à gauche). Réglages par `dbgChute({…})` (CHUTE_P) — choisis aux captures, debout et couché.
- L'INFINI : la caisse ne descend pas, c'est l'AIR qui monte. 16 bancs de nuage (sprites, texture `chuteNuageTex`) montent autour
  d'elle — JAMAIS devant elle : leur disque projeté est comparé à celui de la caisse. 46 filets de vent (un maillage additif) filent.
  SA traînée monte (`trailApercu(dt,true,.45)` : le 3e paramètre, nouveau, est l'intensité). Elle tangue et roule, ses roues tournent,
  la vue balance, et le vent souffle (`windG`/`whG`, les nœuds du son de course, au repos au menu). Un plancher de 30 cumulus (fog:false)
  est posé sous la route. Phares éteints et `CARPOOL.head` caché : au piqué, la tache bleue et la nappe de 15 m flottaient.
- JOUER (`chuteLance`, via garageLaunch) : `GAR.go = CHUTE.go` (tous les « pendant le lâcher » s'appliquent). En 1,75 s le nez plonge,
  elle accélère vers la route, la caméra passe en poursuite plongeante, le champ s'ouvre, l'air rugit. À u .74 le voile BLANC monte
  (`nuage.entre`) ; à 1, sous le voile, c'est la fin du lâcher de l'atelier (closeGarage, puis start()/resetGame()), et le nuage se
  déchire sur la piste.
- ⚠ `var CHUTE` : updateContactShadow et cielHorsCourse (bien plus haut) le lisent ; un const planterait le premier rendu. Au ciel :
  pas d'ombre de contact, ciel en deux temps (cielHorsCourse), ambiance et feu de l'atelier coupés (la relance à 800 ms est gardée).
- MESURÉ : 140 programmes au menu et en course (comme avant), 60 i/s au menu, 0 erreur, et ces parcours passent :
  - menu ↔ boutique ↔ missions ;
  - JOUER → course ;
  - mort → MENU → chute.
## LES MEUBLES DU GARAGE AU NIVEAU DE LA CAISSE (2026-09-30, session DEBUGGING) — « retravaille le garage, notamment les objets : il faut que tous les objets et les meubles soient du niveau de la voiture »
- Dans `buildGarageRoom`, TOUT le mobilier (de « MUR DU FOND » au couloir de la caméra) est construit avec **le kit de la caisse** :
  `lpKit` (facettes franches, couleur dans les sommets), `lpMat` (laque vernie `p`, chrome `c`, laiton `o`, satiné `s`, mat `m`, verre/huile
  `g`), `lpOmbre` (l'ombre cuite au pied, H 1,1). Palette `MK` : R B V J O N K (laques) · C · Or · F A W W2 E Wb (satinés) · P D T T2 (mats)
  · G H (verre, huile). Aides locales : `cb` (boîte CHANFREINÉE, `chanfreinGeo` neuve à chaque appel — put la déplace en place), `cl`, `lt`
  (tour), `to` (tore), `seg` (tube entre deux points), `barre` (poutre entre deux points) ; pièces : `pneu` (profil lpWheel + rainures,
  flanc lettré), `jante` (lèvre, fond, bâtons, moyeu, écrou), `carton`, `bidon`, `jerry`, `clefM`, `moteur` (un V8 : bloc, culasses,
  cache-culbuteurs laqués à nervures, filtre à air chromé, collecteurs, poulies, courroie, ventilateur, faisceau d'allumage, cloche).
- **UNE géométrie par matière** : 6 appels de dessin pour tout le mobilier (contre ~300 boîtes Lambert), + UNE géométrie pour toutes
  les ombres douces des meubles ; ~55 000 triangles (p 16 k, c 13,6 k, m 13,8 k, s 10,4 k, o 0,8 k). MESURÉ : 140 programmes au menu
  ET en course, exactement comme avant — les matières sont celles de la caisse. ⚠ Le satiné `s` et le mat `m` de lpMat n'ont pas de
  cube d'environnement : une variante que la caisse n'emploie pas (141 programmes). Ils reçoivent le cube au garage (reflet .08 / 0).
- `lpMat` expose maintenant `m.userData.uG` (son plancher lumineux) : le garage le relève par famille (`GL` en fin de bloc) — l'atelier
  est sombre et une laque sans lui y sortait noire. Ça ne touche pas au programme (uniform).
- ⚠ Les PLACES n'ont pas bougé (ancres des MISSIONS : compresseur −9,3/2,6 · établi −4,4/−12 · pont 9,9/−10,3 · rack 9,5/3,4 ·
  distributeur 9,6/8,4) ; règle des 8,3 m et couloir sous 50 cm respectés. Seules la servante (façade tournée vers la salle), le palan
  (jambes sous la charge, colonne au pied du mur) et le pont (bras vers l'axe, poteaux en U) ont été redessinés sur la même emprise.
- La surcharge Phong de la palette `M` (1re passe) est retirée : la COQUE (murs, charpente, porte, plateau) garde ses Lambert.
## LE CIEL POMMELÉ DU NIVEAU NUAGES (2026-09-30, session GRAPHISME — Sacha : « dans le niveau nuages, mets des nuages en motif dans le fond » → « dans le ciel »)
- Couche `COUCHES.motif` / `cielMotif(col,vDir,y,sd)` du dôme du ciel, dans les passes PLEINE et LISSE (basN) — aucun programme de plus
  (0 lié en course, banc coton.js). Un MOTIF de petits nuages ronds (trois bourgeons) sur un plafond à ~1,6 km, en rangées DÉCALÉES, avec
  des trous, derrière les cumulus 3D : parallaxe ×.6 de la caméra et dérive au vent, éclairés côté soleil, ourlés d'or à contre-jour,
  teintés par le biome (`uSkyMul`, `uSunTint`) ; ils naissent juste au-dessus de l'horizon et s'effacent vers le zénith. Allumé par
  `uMer` (niveau NUAGES seulement, fondu par lvlStep) — ⚠ `MER_MOTIF` reste FALSE : SOUS la route, l'abîme reste bleu uni (verdict du
  28/09, Sacha a choisi « dans le ciel » et pas « sous la route »). ⚠ Un nuage du motif doit TENIR dans sa case (±.5) : plus large, il
  sortait coupé net (la case voisine ne le dessine pas). À plafond 2,4 km la caméra de poursuite, qui regarde vers le bas, n'en voyait rien.

## LA REVUE DE TOUS LES ÉCRANS (2026-09-30, soir, session GAMEPLAY — Sacha : « vérifie tous les menus, tous les écrans d'interface, il y a plein de petits détails qui ne vont pas »)
- Banc `ui.js` (scratchpad GAMEPLAY) : chaque écran debout 390×844 ET couché 844×390 (= le PC), FR et EN, captures + mesures (débords,
  cibles < 44 px, capitales accentuées en police pixel, textes coupés). défaut = le menu de Sacha, `leo.js … "?menu=leo"` pour celui de Léo.
  0 erreur de page. Deux relectures indépendantes des captures (debout / couché).
- **Écran de mort** : `#mCash` en `word-spacing:-.55em` (l'espace de la police pixel est une case PLEINE : « $    9 » au corps du héros) ;
  badge `em.mCashRec` « RECORD ! » dans la plaque d'argent quand c'est le record d'ARGENT (`rec`) — « NOUVEAU RECORD ! » ne disait pas
  lequel ; la ligne de la mission passe à la ligne au lieu de couper la récompense (« LA … »), debout ET couché.
- **Pause** : ligne `data-a="volh"` « POUCE HAUT EN VOL » (un seul écrivain : `volhBascule()`, partagé avec les réglages) ; cachée au
  clavier (`dPanSync`) — `volSens` ne touche que le pouce. Un seul vide au milieu (`.tp.go` collé aux réglages).
- **Réglages** : l'icône de « POUCE HAUT EN VOL » rend les 4 px de son espacement serré (le libellé retombe dans l'alignement) ; COPIER MA
  SAUVEGARDE sans presse-papier = toast « COPIE IMPOSSIBLE » + la feuille revient avec le code à copier à la main.
- **Mots composés** : `insec(t)` (à côté de `fmtC`) enveloppe « X-Y » dans `i.nw` (insécable) — carrière (« FIN / D'APRES-MIDI », avec
  `i.nwB` : la tuile met son nom en FLEX, sans cet enveloppe l'espace sautait) et boutique (« CHAT / POP-TART »). Texte SANS balise seulement.
- **Garage** : flèches ◀ ▶ à 14 px du bord (la pente mangeait les 8) ; `#gOutils` 44 px ; aperçu de TRAÎNÉE fin et fondu (un pavé orange
  barrait l'écran) ; AILES : le nom a 82 px (« PROPELLERS » = 80), l'aile à vendre se range entre le cadenas et le prix.
- **Boutique** : prix barré dessiné (`s::after` au milieu des chiffres — le line-through de la police pixel tombait dessous) ; couchée,
  l'offre de gauche est `sticky` (elle partait avec le défilement, une moitié d'écran vide).
- **Carrière** : la pastille « 0 / 10 » a 44 px de zone tapable. **Menu de Sacha** : pastilles « 12 » / « NEW » à 6 px de la rangée MISSIONS.
- Relevé du HUD de course transmis à GRAPHISME (NITRO/⏸ au bord, « $×1 », consigne du volant : corrigés par lui).
- **NON TOUCHÉ, à trancher par Sacha et Léo** : l'écran MISSIONS de Léo debout (cartes qui se chevauchent, textes coupés — la remise en
  ordre f474c51 a été annulée à la demande de Léo) ; le menu de Léo (MISSIONS 34-42 px de haut, JOUER en haut de l'écran) ; « HOME » en
  français (choix de Léo) ; l'étiquette TEST ; le nom « CHAT POP-TART » (marque déposée) ; « MER DE NUAGES » (JOUER) / « AURORE » (carrière).
## LE DAUPHIN v7 — L'AURA MONTE EN VOL + LE JUS v6 + LA BANNIÈRE DE NIVEAU (2026-09-30, session INTERFACE)
- **Dauphin** (Sacha : « on ne voit plus le texte dauphin quand on se pose ; on doit voir l'aura monter pendant l'animation des dauphins,
  pendant qu'on survole la route »). Mesuré au banc (`dolpose.js`) : depuis la v6 de GAMEPLAY, un rase-dalle de 1,4 s à 3 m (dauphins à
  l'écran tout du long) ne payait rien et n'écrivait rien — la porte de la figure (1 s au ras après 0,35 s de vol) n'était pas franchie et
  la nage sans figure valait 0. Désormais : `DOL_AURA_NUE` 0 → **0,5** (la nage paie la moitié tant que la figure n'est pas née, plein tarif
  ensuite) ; EN VOL, le compteur SEUL (étoile + nombre + AURA, classe `vol`, `dolHudVol()`) monte **juste sous la caisse** (la caméra de
  vol la centre ; le couloir du haut était masqué par défis/carte moteur/annonces pendant tout le vol, mesuré) et BONDIT quand la figure naît
  (classe `fig`) ; il affiche ce qui sera VRAIMENT versé. À LA POSE : le récapitulatif « DAUPHIN » + total dans le couloir du haut, qui
  patiente 4,5 s au plus (3) et reste 2,2 s (1,5). La figure (cri, maillon d'argent, prime, flow) garde sa porte v6. CSS : section 32 de charte4.
- **Jus v6** (Sacha : « les taches de fruit éclaté ne sont pas assez grosses et dérangeantes ») : rayon ~45-90 px sur téléphone, plafond 112
  (v5 : 19-57 / 68) ; 35 % tombent EXPRÈS sur la caisse et la route, 45 % n'importe où, 20 % dans la couronne ; 10 à la fois (8) ; vie
  1,3-2 s ; pleines .93 les premiers 55 % ; passé 0,3 s elles GLISSENT vers le bas (12-34 px/s, par pas de 4 px).
- **Bannière de niveau** (Sacha : « trop de texte, laisse juste MER DE NUAGES ») : `LVL_BAN.prom:0` (plus de promesse), `LVL_BAN.num:0`
  (plus de « NIVEAU n », ni ses micro-frappes), 2,4 s à l'écran. Rallumer = remettre 1.
## LA PORTE DU GARAGE FERMÉE, OUVERTE AU JOUER (2026-09-30, session DEBUGGING, avec l'accord de GAMEPLAY) — « la porte du garage doit être fermée au début et s'ouvrir avec les flammes quand on clique sur JOUER »
- `buildGarageRoom` : les cinq panneaux empilés sous le plafond deviennent une PORTE SECTIONNELLE sur son rail (`GAR.porte`) — tôle nervurée
  (deux nervures par panneau, joints), une rangée de six HUBLOTS au 4e panneau qui laissent voir le feu (émissive qui bat avec les
  flammes). `garPortePose(e)` : e = 0 fermée (panneaux verticaux dans l'ouverture, z hd − 0,2), montée le long du rail (0 → 4,7 m), coude
  de 0,28 m, puis à plat sous le plafond — e = 1 retrouve EXACTEMENT la place des panneaux empilés d'avant. `garPorte(dt)` (en tête de
  garageRender, avant garFeu) : fermée tant qu'il n'y a pas de LÂCHER ; le JOUER (`GAR.go`, retour de vue compris) l'ouvre en 0,8 s
  (smoothstep) — mesuré : ouverte à ~0,83 s, la caisse atteint la porte à ~1,5 s.
- Porte fermée, le FEU brûle derrière mais ne se voit plus que par les joints, les hublots et sous la porte : `garBeaute` multiplie le
  reflet au sol (× .12 → 1), les nappes des murs et du plafond (× .2 → 1), `GAR.beau.fac` (× .15 → 1), pas de braises sous .3 ; `garFeu`
  : la lueur du seuil × .4 → 1 et la VOIX du feu −9 dB porte fermée (puis +8 dB × k au lâcher, comme avant) ; le contre-jour de la caisse
  ne prend la couleur braise qu'avec l'ouverture. Hook `dbgPorte()` (état) · `dbgPorte(e)` (fige à e) · `dbgPorte('libre')`.
## LES NOMS DES NIVEAUX DE LA CARRIÈRE (2026-09-30, session GRAPHISME — Sacha : « dans la carrière les niveaux sont écrits avec la mauvaise police, c'est inacceptable »)
- `<style id="carrNoms">` (juste avant hudOrdre) : le nom d'un niveau (`.carrNiv span`) était en pixel 8 px (--f0), maigre, sans contour, forcé
  sur UNE ligne sous un numéro de 16 px — il se lisait comme une note de bas de page. Désormais 9 px, le contour d'ENCRE des libellés pixel
  (1 px + l'épaisseur dessous, le numéro aussi), DEUX lignes au plus (`text-wrap:balance`), la même hauteur pour toutes les tuiles (10 px
  cassait PONT ALEXANDRE III sur trois lignes) ; la plaque DORÉE (niveau en cours) garde son texte sombre sans contour. Banc `carr.js`
  (liste des mondes + les quatre grilles, textes lus, `--pay` pour couché). ⚠ Toujours SANS accents (la police pixel n'a pas de capitales
  accentuées) : si Sacha veut les accents, il faudra une autre police pour ces noms.

## LE MENU = LE GARAGE + LES BOUTONS DE SACHA (2026-09-30, session GAMEPLAY — Sacha : « les boutons ne vont pas du tout dans la version de Léo : on garde la base de garage pour le menu mais on remet les mêmes boutons que ceux que j'avais faits pour ma version »)
- ⚠⚠ **SACHA A TRANCHÉ (30/09, plus tard encore) : « je préfère ma version de l'interface finalement »** — LE DÉFAUT EST LA VERSION DE
  SACHA : `MENU_SACHA = !?menu=leo`. Par défaut : ses boutons (#mHome sur l'atelier), SON écran MISSIONS rangé (f474c51 rétabli À CÔTÉ
  de celui de Léo : `gmRenderS`/`gmPlace`/`gmSuitS`/`gmHoloPlace` + ses ancres à `pp`, CSS sous `html.misS` ; `gmRender`/`gmSuit` de Léo
  aiguillent en tête) et SA porte fermée. **`?menu=leo`** = toute la version de Léo, intacte (sketch, ses missions à 6 ancres, porte
  relevée). `?menu=sacha` marche toujours. Les paragraphes ci-dessous décrivent l'état d'avant ce choix (défaut Léo).
  · (Sacha : « c'est buggé, les boutons ne sont pas connectés ») GARAGE et MISSIONS de #mHome étaient MORTS APRÈS UNE PARTIE : leur branche
    « started && gameOver » (écran de mort → accueilRetour) rejouait au menu, où accueilRetour ne fait plus rien (MENUV.retour). Garde
    `&&!garageOn` : l'atelier ouvert, on y va tout droit. Banc `pc3.js` (scratchpad GAMEPLAY) : l'ORDI, la SOURIS, la COLONNE — chaque
    bouton avant / après une / après deux parties. ⚠ Les bancs en émulation tactile ne voyaient pas ce chemin : tester aussi à la souris.
- ⚠ **(même soir, Léo : « remets ma version sketch, Sacha dit que c'est brouillon »)** — LES DEUX MENUS COEXISTENT, un seul booléen :
  `MENU_SACHA` (juste avant `garMode`) = `?menu=sacha` dans l'adresse. PAR DÉFAUT le menu du SKETCH de Léo (#gMenu) ; avec `?menu=sacha`
  (le cadre de l'ordi la transmet à la colonne) les boutons de Sacha décrits ci-dessous. À TRANCHER ENTRE SACHA ET LÉO : ne pas
  re-basculer le défaut sans leur accord — ils se défaisaient le travail l'un de l'autre.
  · (même soir, Léo : « enlève la porte ») la PORTE FERMÉE au menu (Sacha, b8e7ce7) suit la même règle : `PORTE_FERMEE` = `?menu=sacha`
    ou `?porte=1`. Sinon la porte reste RELEVÉE sous le plafond (`garPorte` la pose à 1 : la place des panneaux empilés d'avant) et le feu
    se voit dès le menu. Son code est intact (hublots, son et lumière étouffés), il ne joue qu'avec PORTE_FERMEE.
- Le décor du menu reste L'ATELIER (le garage en mode `menu`) ; ce qui se TOUCHE redevient l'accueil de Sacha, `#mHome` tel quel (logo CASH CAR,
  MISSIONS · ⚙, GARAGE · CARRIÈRE · BOUTIQUE, lingot JOUER — mêmes styles, même routeur `mTap`). `garMode` pose `body.garMenuH` en mode menu
  (pas en MISSIONS, pas en BOUTIQUE) ; closeGarage et le LÂCHER la retirent. CSS « LE MENU = LE GARAGE + LES BOUTONS DE SACHA » : `#overlay`
  passe au-dessus de l'atelier (z 61, sous #gFade 70, #carr 80, modale, toast, wipe), transparent ; sur l'accueil seuls ses `[data-m]` prennent
  le doigt (le glissé et le tap sur la caisse restent à l'atelier). Le menu de Léo (`#gMenu` : profil, JOUER en pixels, [verrou][NIVEAU]
  [BOUTIQUE], l'étiquette du socle) est MASQUÉ, son code reste. Couché (PC, paysage), la colonne se range à DROITE pour ne pas couvrir la caisse.
- Les boutons font ce qu'ils faisaient dans sa version, l'atelier étant déjà là : GARAGE → l'atelier en mode BOUTIQUE (caisses, peinture,
  ailes, traînées ; HOME y ramène) · CARRIÈRE → la feuille #carr par-dessus · BOUTIQUE et ⚙ → l'atelier se ferme sous le volet et
  l'observateur de l'overlay ouvre l'écran (`__mRetour`), RETOUR = le menu · MISSIONS → l'écran MISSIONS de l'atelier (HOME y ramène) ·
  JOUER → le LÂCHER (la caisse sort par la porte en feu). `window.__mHomeSur` : le garage-menu remet l'accueil à l'écran si le routeur
  était ailleurs. `garLibre` cadre la caisse entre le LOGO et la rangée MISSIONS (debout), dans la moitié gauche (couché).
- BANC `menub.js` (vrais taps, debout + couché) : chaque bouton aller-retour, JOUER → course, 0 programme lié, 0 erreur.
## LE VOL À LA VITESSE D'ÉJECTION (2026-09-30, soir, session GRAPHISME — Sacha : « l'air time est trop rapide, il faut que ce soit vraiment lié de manière réaliste à la vitesse d'expulsion »)
- **`AIR_RATE=1`** (startFall) : le vol se joue en TEMPS RÉEL — le ×1,3 du midi (« qu'elle aille plus vite et tombe plus vite », 6ac7d3c) est
  retiré. C'est la 3e fois que la demande revient (25/09 vol v6 : « la vitesse en airtime est trop importante proportionnellement à celle sur
  route » ; 26/09 : « le vol dépend de la vitesse à l'éjection ») : ⚠ NE PLUS ACCÉLÉRER LE TEMPS DU VOL pour le rendre « plus nerveux ».
- **L'ÉJECTION = la vitesse d'avance RÉELLE** : au sol, NITROOO et VITESSE ×2 multiplient l'AVANCE (`vitMult()`), pas `vA` — la caisse
  décollait sans eux (en NITROOO ×2,6 elle perdait la moitié de sa vitesse au décollage ; sans boost elle bondissait de +30 %). `fallVel`
  part à `vA × vitMult` (tangente et latérale) ; à la POSE (tryLand) et au PORTAIL traversé en vol, la vitesse de vol est ramenée au `vA`
  d'avant le multiplicateur (÷ vitMult) — sinon le boost comptait deux fois. MESURÉ (banc `vitvol.js`, vitesse de jeu image par image) :
  décollage en NITROOO 520 → 525 (et 253 → 253 m/s réels dans le monde), sans boost 137 → 143. La verticale, la gravité et le plafond
  horizontal (= la vitesse d'éjection) ne changent pas : sans boost, l'arc dans l'espace (viseur, sauts dessinés) est celui d'avant.
- ⚠ En temps réel, un vol dure 1,3 × plus longtemps qu'au midi : la jauge des 6 s (`airMax`) se remplit d'autant. À surveiller (GAMEPLAY).

## L'ATELIER v2 — LA LUMIÈRE ET LA MATIÈRE (2026-09-30, session GAMEPLAY — Sacha : « améliore le modèle 3D du garage en le rendant plus beau »)
- Le garage est le MENU : c'est la 1re image du jeu. Léo le voulait SOBRE : rien n'est ajouté en bazar, on a travaillé la MATIÈRE et la
  LUMIÈRE (bloc « L'ATELIER v2 » dans `buildGarageRoom`, état `GAR.beau`, animation `garBeaute(dt,t9)` appelée après `garFeu`).
- **Le sol** : époxy sombre en dalles de 2,2 m (`solTex` 512², joint noir + arête claire, traces de gomme), `MeshPhongMaterial` brillant :
  la lampe clé y court en reflet. **Le reflet du feu** : la VRAIE texture du rideau de flammes (`GAR.feu.tex`, même objet, zéro envoi de
  plus) sur un RUBAN au sol de 24 rangées posées selon la loi du miroir vue de la caméra du menu (le point de hauteur y se reflète à
  d·hc/(hc+y) de la caméra, d0 = 22 m, hc = 3 m) — un plan couché de 6 m, lui, s'écrasait en un filet. Fondu par couleurs de sommet.
  ⚠ Un reflet dépend du REGARD : il s'efface quand la caméra ne regarde plus la porte (`camera.getWorldDirection`, z) — vu de dos ou de
  l'écran MISSIONS c'était une mosaïque de couleurs au sol.
- **Le feu éclaire** (lumière cuite, additive, `nappe`) : façade autour de l'ouverture (`GAR.beau.fac`, trou découpé à la place du feu),
  les deux murs côté porte (`murG`/`murD`), le plafond (`plaf`) — elles battent avec les flammes et RUGISSENT au lâcher (`GAR.feu.k`).
- **Le portail** : liseré néon rose autour de l'ouverture (cœur blanc, halo rose, bloom), bandes de danger peintes, deux gyrophares ambrés
  (sprites `lampTex` qui battent). **Le plafond** : une bande LED sous chaque poutre + deux le long des gaines. **Les murs** : bardage de
  panneaux de 2,6 m (`murTexB` + `murM(rx,ry,oy)` : une matière par mur, la répétition est une propriété de la texture).
- **Le plateau** : dessus en acier brossé SATINÉ (Phong, specular bas : à .55/70 la lampe clé y faisait une tache blanche), anneau de LED
  qui court (`GAR.beau.led`, deux comètes de tirets, hors du plateau : il tourne à sa vitesse), halo sous la caisse et halo au sol.
  **Les braises** : 64 points qui sortent du feu et entrent dans l'atelier (un appel de dessin).
- **Les lampes** (`stallKey`/`stallRim`, toujours recyclées — AUCUNE lumière ajoutée) suivent la CAMÉRA (`garCamA`) et plus le plateau :
  depuis que la caméra est fixe et que le plateau tourne, elles tournaient AVEC la caisse (même côté éclairé, aucun reflet ne courait).
  Le CONTRE-JOUR face à la porte devient la BRAISE du feu (cyan → orange selon l'angle, vacille avec les flammes).
- Règles tenues : rien de haut dans l'anneau de la caméra (règle des 8,3 m), nappes additives en FrontSide, 0 programme en course
  (tour.js 7 niveaux). MESURÉ au menu (menuperf.js, téléphone ×2) : 3,6-3,77 ms → 3,75-3,88 ms par image. Bancs : `garshot3.js`
  (menu, 3D seule, trois angles, écran MISSIONS), `menuperf.js`.

## L'ORDRE DU HUD (2026-09-30, session GRAPHISME — Sacha : « retravaille le HUD pour le rendre bien organisé, bien équilibré, bien proportionné »)
- **UN SEUL ENDROIT pour les PLACES du HUD de course : `<style id="hudOrdre">`**, posé EN DERNIER (après frenX3) — les blocs d'avant (charte4,
  hudMaitrise, pouvoirsV2, hudDA, hudTaille, figTaille, frenX3) gardent le DESSIN ; une place nouvelle se règle ICI.
- MESURÉ avant (banc `hudaudit.js <racine> <préfixe> [--pay]` : 5 situations — route, vol, pouvoirs, frénésie, textes —, captures + boîtes
  de chaque élément) : quatre bords droits différents (376 · 382 · 384 · 389 sur 390 : les plaques de pouvoir touchaient le bord), la
  barre nitro à 1 px du ⏸, la colonne de droite à places FIXES (trous quand un bloc était caché, chevauchements selon les états), les
  plaques de pouvoir 1,6 × plus larges que le chrono de vol, couché elles flottaient À CÔTÉ du chrono.
- LA GRILLE : UNE marge (--hudG / --hudD : 14 px + zone sûre) des deux côtés, un pas de 8 px. EN HAUT : NITRO et FLOW (taille d'origine,
  verdict du 28/09, 10 px plus courts debout) et le ⏸ sur la marge, à 12 px des barres. À GAUCHE : l'AURA et sa chaîne. À DROITE : une
  COLONNE qui S'EMPILE toute seule — **`hudColonne(dt)`** (à côté de cashHudTick, 10 fois/s) pose le `top` (inline !important) de ce qui est
  VISIBLE, dans l'ordre ARGENT · VIES du FACILE · DARK TRIAD (debout ; couché elle garde sa place en haut au milieu) · CHRONO DE VOL ·
  POUVOIRS · CAMPAGNE, à 8 px l'un de l'autre, sous le ⏸ — ⚠ un bloc rétréci par `zoom` reçoit top ÷ son zoom (lu sur l'élément : #facVies
  aussi est zoomé) ; une nouvelle plaque de la colonne : l'ajouter à la liste de `HUDCOL.els`, JAMAIS un `top` en dur. Les POUVOIRS empilés,
  calés à droite, à la largeur de la colonne (112 px à l'écran). EN BAS : consigne du volant et NITRO sur la même marge.
- Inchangé : les pouvoirs s'effacent (opacité .08) sous une grande annonce, un verdict ou la carte moteur (règle voulue de la charte).
- **Retouches (relevé de GAMEPLAY, même soir)** : ⏸ et NITRO sont des plaques PENCHÉES dont la pente déborde de la boîte (4 et 8 px) — leur
  coin touchait presque le bord : décalées d'autant (`right: --hudD + 4 / + 8`), les barres reculent à `--hudD + 70` (12 px avant le ⏸) ;
  la consigne du volant, couchée, passe À GAUCHE de l'anneau-fantôme sur deux lignes (en bas, le pouce la couvrait ; au-dessus de
  l'anneau elle tombait sur la route, et debout sur l'arrière de la caisse) ; le « $×1 » du FLOW au palier 0 passe de .4 à .8 d'opacité ;
  la mission suivie (#misFocus) sur deux lignes debout (elle finissait en « … »). NON retenus : les centimes du compteur sous 10 $ (sans
  eux, un gain de pièce afficherait « +$ 0 ») ; le dégradé de « NIVEAU n » (Sacha, 28/09 : « les mêmes effets de dégradé pour tous les
  textes du HUD » — il passe avant l'ancienne règle 2 de la charte) ; « MER DE NUAGES » est le nom du niveau 1 du mode LIBRE, la carrière
  affiche déjà « NUAGES — AURORE ».

## LE GARAGE EST LE MENU (2026-09-30, sketch de Léo) — « le garage devient le nouveau menu »
- L'ACCUEIL n'existe plus à l'écran : le routeur (`mGo`), en arrivant sur 'home', appelle `garAccueil()` qui ouvre l'atelier en mode MENU
  (direct au 1er lancement et sous un voile déjà levé, sinon par `ecranWipe`) ; refusé si une course tourne ou si un nom se saisit. Tout ce qui
  revenait à l'accueil y revient donc : retour des RÉGLAGES, des MISSIONS, de la BOUTIQUE (vrai argent), MENU de l'écran de mort.
- DEUX MODES, UNE SCÈNE (`garMode('menu'|'boutique')`, classe `#garage.menu`) :
  · MENU (`#gMenu`) : profil en haut à gauche (`#gProfil` : avatar pixel SVG, argent + jauge vers la prochaine caisse à vendre (`objectif()`),
    aura + rang + jauge vers le rang suivant), JOUER en pixels en haut au centre (`#gPlayMain`, enfin montré — sous le profil sur écran
    étroit < 760 px), ⚙ en haut à droite (`#gReglage`), le SOCLE DES MISSIONS (3D : fût de fer cerclé de néon vert, cible qui tourne, à droite
    de la caisse hors du plateau, `GAR.misCible`/`GAR.misPos`) + son étiquette DOM qui le suit (`#gMisAncre`, `garMenuSuit`, retenue dans
    l'écran), en bas `#gMenuBas` : [🔒 BIENTÔT — verrouillé pour l'instant] [NIVEAU n · MONDE — la carrière en cours, ouvre `carrVue`]
    [BOUTIQUE]. Au menu : TA caisse (pas d'essai), un glissé fait tourner le plateau sans changer de caisse, Échap ne fait rien, la caméra
    s'approche (×.8 : plus d'onglets en bas) ; `garLibre` cadre entre JOUER et la rangée du bas.
  · BOUTIQUE : l'ancien atelier tel quel (fiche, onglets, vignettes, achat, MENU | BOUTIQUE | JOUER) — sa MAISON (et Échap) rendent le MENU.
    Les autres chemins vers l'atelier (mort → GARAGE, missions → VOIR, objectif) l'ouvrent en BOUTIQUE.
- JOUER (pixels, clic ou Entrée) passe par `garJouer` : 1er JOUER → le mode (facChoix), essai → ta caisse, auto-école.
- Pas repris du sketch (en attente de Léo) : le grand rectangle vertical à gauche (non légendé).
- **LE GARAGE QUI VIT** (même soir, Léo : « on est censé pouvoir tourner autour — soit le garage en rotation sans qu'on touche, soit avec
  le doigt on glisse et on voit légèrement ; inspire-toi de ma branche ») : LES DEUX. Au repos la VUE balance autour de la caisse (les deux
  sinus de sa branche, ±~11°, + un souffle de hauteur : `GAR.swK/swO/swP`) ; au MENU, glisser tourne le REGARD (`GAR.vA`, ±.36 rad,
  hauteur .08-.42 — ⚠ plus de retour automatique, voir LE GLISSÉ FONDU) ; le balancement est VERSÉ dans le regard au toucher
  (aucun saut). `garCamA()` = l'azimut réel (axe + regard + balancement) ; la visée reste au-delà de la caisse, côté opposé ; le LÂCHER part
  de cette visée (`GAR.go.lx0/lz0`). En BOUTIQUE glisser fait toujours tourner la caisse ; le plateau tourne toujours. L'étiquette MISSIONS
  reste COLLÉE AU BORD quand le socle sort du cadre, et ne se pose jamais sur JOUER (à côté, sinon dessous — `garLibre().pl`).
  `dbgGarage(a,p,d,v)` fige (4e argument = le regard), `dbgGarage('etat')`, `dbgGarage('libre')`. Banc `regard.mjs W H nom`.
  · **LE TOUR COMPLET** (même soir, Léo : « on doit pouvoir voir derrière ») : plus de borne au regard (0,007 rad/px : un glissé d'un
    bord à l'autre ≈ un demi-tour debout) ; (retour auto dans l'axe après 3 s : retiré le même soir, c'est JOUER qui ramène). Le recul
    maxi dépend de l'azimut (`capH` : 10,5 m dans l'axe libre côté établi, 8 m ailleurs — la règle des 8,3 m). Socle des missions DANS
    LE DOS de la caméra : l'étiquette attend au bord de son côté, sous JOUER. Le LÂCHER rejoint la place de poursuite en TOURNANT autour
    de la caisse (angle/rayon/hauteur interpolés, `G.a0`) — en ligne droite depuis le côté porte il la traversait. Banc `regard2.mjs`.
  · **LE GLISSÉ FONDU** (même soir, Léo : « une retouche game design : quand tu pivotes, que ce soit agréable, un effet de mouvement
    fondu ; enlève le retour automatique vers la porte, fais-le (mieux) quand on appuie sur PLAY ») : le doigt pose une CIBLE
    (`GAR.vAc`, `GAR.pT`) que la vue rejoint en ~80 ms ; lâchée en mouvement, elle garde son ÉLAN (`GAR.vW`, frottement e^−3t, doigt
    arrêté > 90 ms avant de lâcher = pas d'élan) ; saisie, elle s'arrête ; la caméra penche un peu dans le virage (`GAR.roll` ≤ 2,3°).
    ⚠ Le retour automatique (3 s) est RETIRÉ. **LE RETOUR AU FEU** : JOUER (`garageLaunch`) ramène d'abord la vue derrière la caisse,
    face à la porte (`GAR.go.pre`, smootherstep, 0,25 + 0,28 × l'angle s), pendant que le plateau remet la caisse face à la porte ;
    `G.p0`/`G.r0` sont relevés à la fin, puis le lâcher d'avant (son `garLacherSon` à ce moment-là). Banc `inertie.mjs`.
- **LES AFFICHES DE RECORDS REVIENNENT** (Léo : « remets les affiches record ») : le bloc de sa branche (`buildAffiches`, `affichesMaj`,
  `afficheVise`, `afficheTap`) dormait sur main, jamais appelé et sans son lanceur de rayon (`shopRay`/`shopNdc`). Branché : bâti à
  la fin de `buildGarageRoom` (chauffé au menu avec l'atelier), repeint à chaque `openGarage`, tap (sinon la caisse encaisse) et
  survol souris (curseur main), respiration dans garageRender, `dbgAffiche('perso'|'monde')`. Placées plus BAS et ×1,2 (sur main la
  caméra du menu est plus proche : à 2,78 m elles passaient derrière JOUER) : PERSO contre le pilier gauche de la porte (x 6,45),
  MONDE vers le coin droit (x −8,5 — à −6,45 le socle des missions tombait pile devant). Sans niveau choisi (GSEL absent de main) :
  records de toujours (meilleure partie, aura max, palier moteur, vitesse max). Banc `affiches.mjs`.
- **LES MISSIONS DANS L'ATELIER** (même soir, Léo : « un truc beaucoup plus ambitieux pour le bouton mission : un point de vue face au
  garage, une ambiance sci-fi, des lignes qui montrent les missions réparties à différents endroits, reliées, un bouton JOUER ; cocher une
  mission pour la suivre, elle reste affichée discrètement pendant le jeu ») — `garMode('missions')` (= `.menu` + `.missions`), bloc
  `GMIS` (juste avant `garAccueil`) :
  · LA CAMÉRA s'élève sous la porte relevée (0 ; 4,4 ; 11 — ⚠ pas plus haut : les panneaux de la porte sont empilés à 4,92-5,05 m) et
    regarde tout l'atelier (visée 0 ; 0,6 ; −3,6), fondu en S (`GMIS.mk` → `GMIS.e`, position, visée, objectif 58°/66° debout ; le
    décentrement du menu s'efface : `garCadre(1−e)`) ; balancement coupé, glissé désactivé.
  · LES ANCRES (`GMIS.ancres`, coordonnées de la pièce) : défi 1 le COMPRESSEUR, défi 2 l'ÉTABLI, défi 3 le PONT ÉLÉVATEUR, la
    RÉCOMPENSE au-dessus de la caisse, les deux carnets SUIVANTS sur le RACK et le DISTRIBUTEUR. En 3D (`gmHoloBuild`, bâti avec
    l'atelier, opacité 0 hors de l'écran) : un faisceau (sprite lampTex) + un anneau au sol, cyan / or / lilas. En DOM (`gmRender`,
    `gmSuit` chaque image) : un point-diamant à l'endroit exact, une CARTE-hologramme (crochets de viseur, trame, entrée en balayage)
    reliée par un filet, écartée des autres et gardée dans l'écran (8 passes), les points reliés par le fil de la constellation
    (défi 1 → 2 → 3 → récompense → la suite, en pointillés qui coulent). Aucune écriture DOM si rien n'a bougé.
  · SUIVRE : toucher un défi le coche (`SAVE.d.mis.f`, désinfecté dans `san`, −1 = aucun, remis à −1 par `misFin` et quand il est
    réussi) ; la carte passe en OR « SUIVI EN COURSE », l'en-tête dit « SUIVI : … ». La récompense ouvre sa fiche en boutique ; un carnet
    suivant répond « LES 3 DÉFIS D'ABORD ». En bas HOME (le menu) · JOUER (`garJouer`, partie sans fin). Échap = le menu.
  · EN COURSE : `#misFocus` (créé dans #hud, `misFocusMaj` appelée par `misTick` 4×/s) — couché en bas au centre, debout sur la marge
    gauche de la grille du HUD (`--hudG`, au-dessus de la consigne du volant, avant NITRO), discret (opacité .82, 8 px) :
    ◆ consigne · avancement · jauge fine ; VERT 3,2 s quand le défi tombe, puis s'efface.
  · Le départ depuis cet écran passe par LE RETOUR AU FEU (≥ 0,8 s : la vue d'ensemble redescend derrière la caisse, `pre.mk0`).
  · La porte MISSIONS de l'écran de mort (`mTap 'mis'`) ouvre CET écran (via `accueilRetour` + `GAR.aMis`) ; l'ancien écran `#mMis`
    n'est plus ouvert depuis le jeu (son code reste). `garMissionsOuvre()`, `dbgMissions(f)`. Bancs `missions.mjs W H nom [court]`.
  · ⚠ (même soir) Sacha l'avait RANGÉ (f474c51, « c'est pas mal mais un peu brouillon » : les trois défis en une rangée de cases égales,
    la récompense en bas avec « ENSUITE » dedans, les cartes des carnets suivants retirées). Léo : « remets le système des missions, cette
    version a beaucoup changé » → f474c51 est ANNULÉ (git revert), sauf son correctif de l'image de la récompense (`.obFig` est en position
    absolue ailleurs : elle recouvrait le nom → `position:relative` dans `.gmC.r`). À TRANCHER ENTRE SACHA ET LÉO avant d'y retoucher.
- **CHOISIR UNE MAP LANCE LA PARTIE** (Léo : « quand je choisis une map, ça ne lance pas la partie, il faut revenir en arrière ») : un
  NIVEAU de la grille lançait déjà (vérifié au banc, téléphone et cadre PC) — c'est la carte d'un MONDE qui ne faisait qu'ouvrir sa
  grille. Désormais la carte d'un monde (`data-c="monde"`) LANCE son niveau en cours (le prochain à finir) et dit « ▶ JOUER · NIVEAU n »
  sous son titre ; son compteur « 0 / 10 ▸ » (`.carrNivs`, `data-c="biome"`) ouvre la grille des dix. Banc `carr2.mjs`.
- **LE TAPOTEMENT** (Léo : « le bruit que fait la voiture quand on la tapote est un peu bizarre, change-le ») : `garage.tole` refait
  (atelier-son) — plus de « tonk » en rapports de cloche (un gong) : toc ÉTOUFFÉ de tôle épaisse, poids de la caisse, suspension qui
  s'enfonce et remonte, garniture qui cliquette ; 4 prises ±8 %. Banque ?v=9 (étalon d'origine gardé), sw v34.
- **HOME** (Léo : « dans la boutique, au lieu d'un bouton MENU (erreur), un bouton HOME, qui remplacera tous les boutons GARAGE ou
  MENU ») : `#gClose` (boutique) et la maison de l'écran de mort disent HOME ; la tuile GARAGE de l'écran de mort est RETIRÉE (HOME y
  mène). Il reste BOUTIQUE · RÉGLAGES dans la rangée. (La tuile GARAGE de `#mHome` reste dans le HTML : l'écran d'accueil n'est plus montré.)
- **GARAGE APRÈS UNE PARTIE = LE GARAGE-MENU** (Léo : « quand je finis une partie et que j'appuie sur GARAGE, ça me renvoie sur l'ancien ») :
  la tuile GARAGE de l'écran de mort prend le chemin de MENU (`accueilRetour` sous le volet, puis l'accueil = le garage en mode menu).
  ⚠ Du coup MENU (maison) et GARAGE de l'écran de mort mènent au même endroit. Restent en BOUTIQUE : missions → VOIR, objectif,
  récompense, personnalisation (ils visent un objet précis). Banc `mortgar.mjs` (course → mort → GARAGE, deux fois).
- **DEBOUT, PLUS GRAND** (Léo : « les trucs sont un peu petits en mode portrait ») : bloc `@media (orientation:portrait) and
  (max-width:760px)` — profil (avatar 58, chiffres 12 px, jauges 8 px), ⚙ 60 × 56, JOUER 46 px, MISSIONS 42 px de haut, rangée du bas
  86 × 82 ; palier ≤ 360 px resserré (vérifié 390 × 844, 375 × 667, 320 × 568). Au MENU la caméra ne recule plus pour une bande de
  vignettes qu'il n'a pas (`garageRender._v` à 0) : debout ×.82 — la caisse de PROFIL (le plateau la tourne) tient dans la largeur.
- **LE BOUTON PORTRAIT SUR L'ORDI** (Léo : « une option où je peux regarder en mode portrait ») : `#tourne` de sa branche, dans la
  page-cadre (`<head>`) — le téléphone passe COUCHÉ ⇄ DEBOUT sans recharger (le jeu ne reçoit qu'un resize), l'adresse garde
  `?colonne=portrait`. Banc `tourne.mjs`. sw.js → v31.

## LA FENÊTRE D'ACHAT — LA CARTE SORT DE LA VITRINE (2026-10-01, session UI)
Sacha, capture de la grille des LÉGENDAIRES où « BIENTÔT DISPONIBLE » s'affichait par-dessus les cartes : « il faut que la fenêtre de la
voiture sorte de la page en mode pop-up pour valider la transaction ».
- **Le geste** (`shopPop(src)`, branché sur `data-m="shopSoon"` des vignettes `.shCase` ET de l'offre à la une `#shUne`) : la vignette quitte
  la grille (`.spParti` : sa place reste VIDE), la carte `#shPop .spCarte` grandit depuis cette place jusqu'au centre sur un voile opaque —
  un FLIP : posée au centre, mesurée, puis animée depuis la vignette (`--dx/--dy/--s`, `shopPopVise`). La rareté, la phrase, le prix en
  grand (barré 9,99 € + −50 % pour l'offre), UN lingot d'or ACHETER et ANNULER (cyan) arrivent après le trajet. Fermer (ANNULER, le voile,
  Échap — écouteur en CAPTURE : Échap ferme la fenêtre, pas la boutique) = le même chemin à l'envers, vers la place ACTUELLE de la vignette.
  Déjà à toi : ÉQUIPER (l'atelier s'ouvre sur la caisse). Couché (844 × 390) : photo à gauche, décision à droite, plaques côte à côte.
- **L'achat** : `shopPaye(i)` est la SEULE porte de StoreKit — elle doit rendre une promesse tenue QUAND Apple a encaissé ; alors seulement
  `shopDonne(i)` pose la caisse dans `SAVE.d.owned` (sans toucher à la banque du jeu). Aujourd'hui elle refuse : ACHETER le DIT dans la
  fenêtre (« BIENTÔT DISPONIBLE » + « Les achats ouvriront à la sortie sur l'App Store. ») et ne donne jamais rien. `uiGarde` (320 ms)
  empêche qu'un double appui sur la vignette tombe sur ACHETER.
- CSS : `<style id="achatPop">` juste après hudMaitrise. Banc : `bancachat.js <pfx> <port> <w> <h> <dsf> <carte|-1 = la une>` ;
  QA : trois contrôles (ouverte + trou, ACHETER ne donne rien, ANNULER referme et rend la carte).

## LA BOUTIQUE EN BAS DU GARAGE (2026-09-30, session INTERFACE — demande de Sacha relayée par DEBUGGING, idée de Léo)
- `#gShopBas` (pb-mag, panier + mot) dans `#gAct` : **MENU | BOUTIQUE | lingot d'or** — même format que MENU, même chemin que l'ancienne
  icône (`#gOutils [data-go=shop]`, désormais masquée : une seule porte, dans le tiers bas, charte règles 3-4).
- En `.choix` (ACHETER / ÉQUIPER) : MENU et BOUTIQUE deviennent des carrés à pictogramme ; sous 360 px la BOUTIQUE s'efface le temps du
  choix. Le lingot ACHETER passe sur DEUX lignes (verbe petit, prix dessous) — MESURÉ : verbe + prix côte à côte faisaient ~180 px dans
  ~90, ils débordaient déjà avant (et couvraient la boutique).
- JOUER règle son mot sur sa largeur réelle (`container-type`, unités cqi) ; sous 230 px ses chevrons se taisent.
- Banc `garshop.js W H lang` (BANK=0 : la caisse équipée, sans choix) : 390 / 320 / 844×390 / 667×375, FR et EN — aucun
  chevauchement, le bouton ouvre la boutique.

## CE QUI VIENT DE LÉO, PORTÉ SUR LA VERSION DE SACHA (2026-09-30, session DEBUGGING/UHD)
- Sacha, à propos de la branche `version-leolei-2026` (83 commits de Léo jamais fusionnés, arrêtée le 28/09) : « PARIS, le HUD qui
  s'estompe, le boost de départ, le bouton BOUTIQUE — c'est pas mal, adapte ça bien à ce qu'on a déjà construit pour pas tout casser ».
- **PARIS** : repris du portage déjà fait le 28/09 (branche `paris`, 22e6395 — PARIS LA NUIT + PARIS AU SOL, jamais testé ni fusionné),
  appliqué sur main avec 10 conflits réglés en gardant TOUT l'actuel (pluie de l'orage, reflets de ville, nuit, satellites, causes de mort)
  + le strict nécessaire de Paris. Paris est le 3e niveau du cycle : NUAGES → VILLE → **PARIS** → ORBITE → ORAGE → MINUIT EN VILLE → PLUIE DE
  SATELLITES (7 niveaux) — et un MONDE de carrière (10 niveaux, de l'heure bleue à minuit), rangé entre VILLE et ESPACE : la progression
  est gardée par `id` (sauvegarde intacte). ⚠ Les cartes de la carrière se reconnaissent désormais par leur MONDE (`data-id`) : par leur
  rang, Paris prenait le bandeau de l'orbite. Bandeau de Paris : l'heure dorée, des toits, la Dame de fer. En paysage : une rangée de quatre.
- **La chauffe de Paris** (`parisChauffe`, une étape de `chauffeDivers`) : MESURÉ, 16 programmes liés au 1er portail de Paris, en pleine
  course (tous les autres niveaux : 0). Une instance de CHAQUE matière de Paris est compilée au menu (façades, zinc, fer, sol, Seine, Lambert
  simple/double face avec ou sans texture, en maillage / instances / instances colorées, le treillis de la tour, le scintillement, les halos,
  le drapeau qui ondule, l'enseigne à émissive) ; les matières de chauffe ne sont JAMAIS libérées. Les matières faites à la volée sont
  passées en fabriques (`parisScintMat`, `parisHaloMat`, `parisDrapeauMat`) pour que la chauffe compile le MÊME programme. Résultat : 0 au
  portail (131 → 131, banc `st-paris.js`). Les morts de Paris (façade, Seine, pavé) sont rattrapées par le mode FACILE.
- **Le HUD discret** (b4ad9ff de Léo) : `hudDiscretTick` (en tête de `chaineTick`) — la CHAÎNE, les POUVOIRS et l'OBJECTIF de campagne
  présents depuis plus de 3 s tombent à 45 % ; `hudReveil` les rallume (× qui monte, nouveau pouvoir, fin de pouvoir qui clignote, objectif
  qui change ou alerte). Adapté à la charte : pas de fond « verre » (règle 1), c'est l'opacité d'ensemble qui baisse (hudDA §9).
- **Le boost de départ** : déjà sur main depuis le 29/09 (`fireLaunchBoost`, 3 s de nitro offerte, pas à l'auto-école).
- **Le bouton BOUTIQUE du garage** : confié à la session INTERFACE (sa zone, la charte : le tactile en bas, une seule plaque d'or).
## LA COUCHE « DA » DE L'ÉTALONNAGE (2026-09-30, session INTERFACE, avec l'accord de GRAPHISME) — « retravaille les graphismes, la DA et l'étalonnage »
- MESURÉ (banc `etal.js` : 5 niveaux, image de course figée, variantes A/B de l'étalonnage ; `balade.js` pour l'état des lieux) : tout
  baignait dans UN violet (ciel, route, nuages, caisse), la caisse orange se lisait saumon pâle (l'ACES par canal mangeait sa chroma et
  le voile magenta la rosissait), l'Orage et Minuit étaient boueux. La direction de Sacha : saturé, contrasté, teal/orange (GTA 6).
- **`DA` + `daPose(U,c)`** (juste avant `bioApply`) : UNE couche par-dessus TOUTES les ambiances, sans toucher aux `BIOMES` —
  `vivid` 1 (chroma gardée dans les hautes lumières), `wbN` 1 (voile magenta retiré), ombres TEAL `sh` [−.026,.045,−.006], lumières
  OR-ORANGE `hi` [.02,.038,−.042], saturation ×1,2, contraste ×1,14, exposition ×1,06. Que des uniforms : 0 programme lié en course
  (tour.js). `DA.on=0` = l'image d'avant au bit près. Hook `dbgDA({…, fige:1 | degele:1})` : essayer un réglage sur l'image figée.
- **Dosage par ambiance** (champs lerpés comme les autres, défauts dans `BIO_ETAL0`) : `daCon` (part du contraste DA), `daExpo`,
  `daWbN`, `daSh` (la teinte teal colore AUSSI le noir). Tempête {0, 1,12, .5, .35}, Minuit {0, 1,16, .4, .25}, Orbite {daSh .1,
  daWbN .6} — sans ça l'orbite virait au vert-bleu et les nuits se noyaient dans le noir.

## LES NUAGES NE FONT QUE BLOQUER LA VUE + LES BANCS CACHENT LE VIRAGE SUIVANT (2026-09-30, session GRAPHISME — Sacha : « 2 oui ; sinon les nuages doivent juste bloquer la vue, rien d'autre »)
- **Plus AUCUN effet de jeu d'un nuage sur la caisse** (`updateClouds`, bloc DEDANS) : plus de regain d'airtime (le budget de 1,2 s par banc —
  à l'ORAGE un vol bas rechargeait toutes les 2-4 s), plus de coussin d'air (portance), plus de turbulence (vitesse et vrille chahutées),
  au sol plus de tangage ni de frein. Il reste ce qui se VOIT et s'ENTEND : le voile, la paroi vue de dedans, le son feutré, le banc qui
  éclate quand on le défonce, un léger tremblement de caméra. ⚠ Donc les « coussins de VOL » (les champs de 2-3 nuages, les GUÉS DE OUATE
  des niveaux 6 et 10 de la campagne) ne rendent plus rien : ce sont des nuages comme les autres. Les RÉCOMPENSES de style gardées (percée à
  l'aveugle `addStyle`, PERCE-NUAGE de la campagne) récompensent le joueur, pas le nuage — à retirer aussi si Sacha le veut.
- **Les bancs de route (hors ORAGE) CACHENT LE VIRAGE SUIVANT** (relevé par la revue de GAMEPLAY : ~la moitié tombait EN virage ; la règle du
  niveau 8 de la campagne) : `bancVirage` cherche, 150 à 1200 m plus loin, l'ENTRÉE d'un virage (rayon < 200 m) précédée d'une portion
  droite (courbure MOYENNE < 1/330 sur 200 m — ⚠ la piste des NUAGES n'a presque pas de droite pure : courbure médiane 3,4 mrad/m) ; le banc
  se pose son bord ~160 m avant l'entrée. Sans virage à cacher, il quitte au moins la courbe (portion droite à moins de 600 m). AUCUN tirage
  de plus ni de moins (`cr` inchangé) : le reste du ciel ne bouge pas. Mesuré (banc `bancs.js`, `dbgBancs()`) : sur 3 pistes, les bancs en
  virage passent de 7 à 2 sur 15. L'ORAGE garde ses bancs n'importe où (le niveau dur se roule à l'aveugle).
## LA GRANDE RELECTURE (2026-09-30, session GAMEPLAY — Sacha : « arrête-toi sur chaque détail, une idée → un sous-agent »)
8 relecteurs en lecture seule (une tranche chacun) → idées vérifiées dans le code → un sous-agent par lot (worktree `amel-<lot>`) →
intégration une par une, bancs navigateur UN à la fois (integ1/2/3.js, pistes.js, perfab.js, hvbanc.js, ligne-g.js, tour.js dans le
scratchpad GAMEPLAY). Ce qui suit est EN JEU, mesuré au banc sauf mention.
- **LE RAMASSAGE EN VOL** (`pickupsTick`) : la boucle des pièces/fruits/cristaux vivait DANS la branche du sol de `loop` — en vol, RIEN
  ne se ramassait depuis toujours (dauphin, aimant v3, grappes du ciel). Appelée des deux branches ; en vol une pièce entrée dans la sphère
  S'ACCROCHE (`p.hk`, file sur la caisse, l'écart fond chaque image, saut > 150 m = décroche) ; le jumeau de l'autre face est ignoré
  (jamais payé deux fois). Banc : aimant + vol → 17 pièces prises EN VOL ; rase-dalle → 6-9. `dbgRamasse()`.
- **MISSIONS / POUVOIRS / CARTE MOTEUR** : `RUNX.perfect` compte toute pose g≥1,5 non ratée d'un vrai vol ; « FRANCHIS N PORTAILS »
  montre la zone en cours (`misZoneFrac`, « 0 / 1 · 73 % ») ; carnets sans fin plafonnés (chaîne 8, parfaites 10, figures 30, survie 7 min,
  nitro 60 s, pièces 300, fruits 60) ; AIR MAX s'use au QUART au sol (`pwrAirK`) ; tirage vétéran v .16 · x .27 · m .19 ; TEST_CAISSES :
  ce qui DIT où l'on en est lit `carUnlockedVrai` (ACHETER visible en TEST), `carBuy` pose `carWas[i]` (un achat ne se recrie plus) ;
  `engLate(t)`/`engGain(tier,de)` : le « +N KM/H » de la carte moteur est juste (+44 et non +28 au palier 10) ; le petit titre annonce la
  capacité franchie (`ENG_CAP_NOM` : + PLUIE DE BILLETS 12 · + AIMANT A PIECES 15 · + CAISSE EN FEU 27), sur UNE ligne (`.ebTit.cap`,
  mesuré au banc : il se cassait sur la carte de 188 px).
- **LA FRÉNÉSIE SE LIT — LOI 20 DE FLOW2** : `FLOW2.decl` (base {drift:9,racc:false} · ville {drift:2,racc:true}) : en VILLE, relâcher un
  SUPER/ULTRA TURBO (driftTick) ou poser un RACCOURCI (tryLand `rc9`) fait partir la frénésie ARMÉE ; l'armement dit « DRIFT OU FIGURE ! ».
  Le geste qui arme ET déclenche se tait (`flowAddDecl` → `FREN.coup`). Quand un geste ouvre la 4e cellule ET arme, l'armement passe avant
  la règle (`flowRevele` se tait si `FREN.arme` — vu au banc). MACHIAVEL réclame « RACCOURCI ! » (plus « TRICHE ! ») ; révélations AU
  SINGULIER « FIGURE · RACCOURCI · NITRO » / « DRIFT · RACCOURCI · VITESSE » (28 signes tombaient au plancher de 10 px et sortaient de
  l'écran au rebond). Armée, `flowReste` compte jusqu'à 88 ; au désarmement : flow.perdu, hap(6), braises sur `.fZ`. simville3.js :
  attente armée→départ 15 → 2,3 s (casse-cou). Banc : SUPER relâché en ville → frénésie ✔, MINI → rien ✔.
- **LA BANNIÈRE DE NIVEAU SE LIT EN ENTIER** : avec promesse, couloir réservé 3,8 s et VERROU de 3 s que même la carte MOTEUR respecte
  (`hautCede`, option `ferme`) — mesuré avant : la carte moteur la coupait À L'INSTANT. `lvlPromesse()` ; NUAGES « LES NUAGES CACHENT
  LES VIRAGES » (plus « TE PORTENT » : les nuages ne portent plus, décision de Sacha), VILLE « LES TOURS NE PARDONNENT PAS » (EN/ZH). NIVEAU à la mort et en pause = `LVL.n`. **LES MORTS PAR NIVEAU** (invisible) :
  `SAVE.d.ex.morts[clé][cause]` + `ex.temps[clé]` (clés nuages/ville/espace/orage/ville-nuit/espace-hard/ecole/c-<id>-<n>), `dbgMorts()`
  (`parMin`). ⚠ `san` reconstruit `ex` champ par champ : tout nouveau compteur dans `ex` doit y être ajouté.
- **LA PARTIE INTERROMPUE** : iOS tue une appli en arrière-plan → `enCoursPose()` au passage à hidden pose `SAVE.d.enCours` (ce qu'un
  QUITTER verserait), `SAVE.load()` le verse UNE fois (toast « PARTIE INTERROMPUE : +$X VERSES AU COMPTE ») ; instantané, jamais un
  incrément (retiré au retour, dans commitExploits et resetGame). Banc : arrière-plan → rechargement → +16,5 $ et parties +1, 2e lancement
  rien ✔. `SAVE.natif` (miroir Capacitor suspendu tant que `Preferences.get` n'a pas répondu). Pluie de devises à 180 glyphes/s (MR.acc) ;
  un `try` par appel dans la boucle (`loopWarn`). `dbgEnCours()`. ⚠ au banc, forcer `document.hidden=false` fait passer un rechargement
  pour un RETOUR (l'instantané est retiré) : simuler le VRAI arrière-plan (hidden=true + visibilitychange).
- **LE VOLANT TACTILE** : zone morte verticale CROISÉE en vol `dz=.10+.45·|nx|` (tourner à fond ne pique/cabre plus) ; un seul doigt
  propriétaire du volant ; place au bord (`gx/gy`) ; l'anneau suit la base flottante. **LE DRIFT AU GESTE CONNAÎT L'ARC DU POUCE** (`stMove`, `DRIFT_PX`=34,9,
  `TCTL.dyS/ar/ab/tr`) : braquer à droite fait descendre le pouce (il pivote à sa base) et la descente passait pour le geste du drift. Le
  socle glisse le long de l'arc (pente .45) au-delà de la butée, la descente du bout de l'arc est retirée en proportion du braquage, et
  l'ENTRÉE en drift à droite demande 6 px sous l'arc relevé du joueur (34,9 à 42,5 ; pour y RESTER, 34,9). Simulé : 58 → 2 drifts
  involontaires / 100, voulus 85/92 inchangés ; BANC navigateur (banc-drift2.js, caisse remise en piste avant chaque geste) 19/19, drift
  voulu en 0,16-0,26 s ; banc-volant.js 10/10. ⚠ OUVERT : prise tendue à < 40 px du bas ; le drift à GAUCHE demande 41-56 px de tirage
  (5-14 à droite) — asymétrie antérieure, à trancher par Sacha.
- **CAMÉRA DE ROUTE** (`CAM_REGARD`, `CAM_TAILLE`) : sous la dalle le retard latéral n'est plus retourné deux fois ; le regard vise 0,45 s
  d'avance réelle (35-90 m, poids ×35/D) ; en portrait, genou du champ vers 125° et recul/hauteur de vitesse plafonnés : MESURÉ au banc,
  la caisse sous nitro fait 0,67× sa taille de croisière (avant 0,37×), champ 126° (avant 149°). A/B : `dbgCamRoute({regard:{on:false},
  taille:{on:false}})`.
- **LA MORT ET LE REJOUER** : la musique meurt avec la caisse (tape-stop dans `explode`, hors bac à sable/école/vie FACILE), un seul fil
  (`musicStop._iv`, `musicBandeNette`) : un REJOUER rapide n'est plus étranglé ; « EARLY DEAD » se tait à la 1re partie, sur un record
  (`partieRecord()`) et en FACILE ; satellite → `mort.foudre` ; LE LINGOT et LA CAISSE-NUAGE ont leur explosion signature (banc : 0
  programme lié à la mort du lingot) ; « Réduire les animations » : plan de mort fixe, `flashEcran` 1/s ≤ .4, `FOVP_K`=.3 (sol, vol, zoom
  PARFAIT).
- **LE SURVIVANT** : `survPTot()` / `survPortS()` = LA position du joueur (vol compris) ; `SURV.last` ne se recalcule pas en vol ; une
  minute qui tombe en l'air ATTEND LA POSE ; au téléphone la plaque « RANG n / 8 · COUPERET DANS 0:xx » ; CHAMPION = slam, nitro pleine,
  aura 500 ; le Drivatar n'apprend ni au bac à sable, ni au parc, ni à l'école. `dbgSurv()`.
- **CAMPAGNE** : `campRaccourci` ne paie plus que leg1 → leg3 d'un ovale (`campCoupeDe`) ; radars sur la vitesse d'AVANCE (`vKmh`,
  × vitMult) et plaque « DANS 240 M · 560 KM/H » ; CAISSE-NUAGE avec plaque (ELLE MENE DE X M · SILLAGE xx %, banc ✔) et « TU L'AS
  DOUBLEE » ; portes du niveau 4 comptées (`campPortesTick` — ⚠ PAS `portesTick`, c'est la fonction du SON) ; textes du milieu retirés ;
  ESPACE à graine fixe, débris `debK`, PLUTON `hard:1`, une promesse par planète ; MINUIT (VILLE 14) `nuit:1`.
- **LE DAUPHIN v6** : la figure (150, prime, flow, maillon) demande 1 s cumulée à moins de `DOL_RAS_H`=6,5 m après `fallT`>.35 — un
  saut ordinaire (pic 7,9 m) ne la donne plus (411 → 0), le rase-dalle garde ~620 ; l'aura de nage ne s'encaisse que si la figure est née.
  Au sol le banc suit le repère de la ROUTE (slerp, fini le bond à la pose — banc : rigMax ≤ 0,8) ; le ras se voit (liseré, gerbes, tempo,
  BOND ROYAL au 6e) ; le serpent reste dans le cadre en portrait (tête visible 37-45 % → 61-71 %). ⚠ à mesurer : la 1re frénésie peut
  arriver plus tard (moins de flow « gratuit » aux sauts) ; le verdict MONSTRE vient encore du RASE-DALLE d'argent (`chainVal`).
- **HAUTE VITESSE** : le lacet suit `spdMult` (rT ×m, VOL_TAU ÷m, FAC_CAP ×m ; les effets lisent `yawR/spdMult`) : même pouce = même
  trajectoire à ×2,6 — MESURÉ (hvbanc, palier 0, nitro+VITESSE) : 3,68 → 0,49 sortie/km. `balEcart` : plots, pads, dos d'âne, flaques
  testés sur le TRAJET de l'image (plus de plot fantôme au-delà de ~560 km/h à 30 i/s). NITROOO consomme ×0,5. Perf CPU par image : pas
  d'écart mesurable (perfab.js, 4-7 ms les deux).
- **LA PISTE MESURÉE** : `curve.arcLengthDivisions = 16 × points de contrôle` — les points n'étaient pas équidistants (0,4 à 1,9 ; la
  caisse filait 9 % trop vite sur les droites et freinait en secret en virage). MESURÉ en jeu : p1-p99 0,99-1,01 sur les 6 niveaux. Sas du
  portail (2,5 s sans plot ni flaque) ; `MODMARK`→`MODS` : pas de plot ni d'huile dans les modules ; un banc de route retire les plots et
  les flaques qu'il cache — **SAUF les plots de l'ORAGE** (décision GAMEPLAY : sa promesse est « la route se cache », ses bancs couvrent la
  piste, le filtre y retirait 50-92 % des plots) ; huile jugée en mètres ; pas de pigeon en ORBITE ni à l'ORAGE. `dbgPas()`.
- ⛔ **RETIRÉ le 2026-09-30** (Sacha : « je veux que la voiture reste contrôlable, mais qu elle aille plus vite et qu elle tombe plus vite ») : les commits 61ab2d2 + 7ef83e2 sont annulés, on revient au vol d avant (le volant tourne la trajectoire), avec `AIR_RATE=1.3` dans `startFall` (on avance et on tombe 30 % plus vite, même arc dans l espace). Le paragraphe ci-dessous n est plus qu une archive.
- **LE VOL v8.1 « NEWTON »** (ARCHIVE) (Sacha à SON : « rends la physique du air time plus réaliste, inspire-toi des vraies règles de l'inertie et
  de la gravité » ; plan de SON, appliqué par GAMEPLAY ; `NEWTON`, `VOLN`, `volCorps`/`volRepere`/`volNez`/`volAero`, `volViseur`,
  `volBump`, `chuteLongue`, `volBordMord`, `dbgVol()`). Le volant et le manche tournent la CAISSE (lacet ψ, assiette α, girouette
  K_W·qt·sin, amortissement) ; la portance et la traînée de travers plient la trajectoire ; aucune traînée dans l'axe : SANS LES MAINS la
  parabole est identique au millimètre (filets, catapultes intacts). La nitro pousse le long du NEZ. La vrille = lacet du corps (MESURÉ au
  banc navigateur : 180° vers 1,8 s, 360° vers 2,4 s, la chaîne compte les figures). `airRoll` tourne autour du nez. **NTR-VOL** : le vol
  part à la VRAIE vitesse (× `volMult`) et la pose la redivise (banc : VITESSE ×2 → 692 km/h en vol, vA revenu à 194 au sol). **Pose** :
  angle = le pire du nez et de la trajectoire, perte = Coulomb (0,9·impact/v) + ripage (0,6·(1−cos)) au lieu de la durée du vol, PARFAIT
  = pose propre et impact < 4,5 ; le cap au sol = le nez, l'écart devient une glisse (`slipB`). **Bump** borné (e .45, μ .3, +22 max).
  **Viseur v8** = la même intégration que le vol (nitro, volant, manche), rouge FIXE si pose ratée prédite, anneau plaqué sur la FAÇADE en
  ville (`villeFacade`) et au point de choc à PARIS (`volViseurParis`). **CHUTE-LONGUE** : 2,2 s sans pose en vue, sans nitro, et aucune
  dalle à portée balistique (généreuse) → `explode('vide')`. **v8.1 LE BORD MORD** : un vol né d'une SORTIE PAR LE BORD (`startFall(3.4,
  1.04,true)`) dont le volant RAMÈNE vers la route garde le volant d'avant (la vitesse tourne, 1,15+… rad/s) jusqu'à 0,35 s, fondu à
  0,6 s, à moins de 6 m du plan quitté — les roues mordent encore la tranche. BANC navigateur sur une MÊME piste (campagne à graine fixe,
  même s) : pouce qui ramène → posée à 0,35 s AVANT comme APRÈS ; mains libres → même chute ; volant vers le vide → vrai vol (42 m de côté
  au lieu de 109 : l'inertie). ⚠ Un A/B de bord se fait sur la MÊME piste (graine fixe) : sur deux pistes aléatoires le dévers et la
  courbure faussent tout. 0 programme en course (tour.js 7 niveaux), ramassage en vol inchangé (ram.js). ⚠ À JUGER par Sacha : moins de
  débattement latéral en vol (30 % de volant 2 s = 39 m au lieu de 105) ; manche sans nitro sans remontée ; plus de looping serré au
  réacteur ; PARFAIT plus rare quand on braque en l'air ; au clavier, tenir la flèche = vrille (on vise par appuis courts : 0,2 s = 34° de
  caisse, retour en 0,75 s). Tout se règle à chaud : `dbgVol({K_P:…,A_S:…})`.

## LA CAMÉRA HÉROS (2026-09-30, session SON — GAMEPLAY et GRAPHISME ont passé la main) — « la voiture est souvent trop petite pour l'écran,
## surtout sur mobile : trouve des trucs de caméra pour la jouabilité et la sensation de vitesse, surtout sur route »
- **⚠ PIÈGE DE BANC** : en rendu logiciel (SwiftShader, 150-300 ms l'image) CHAQUE image dépassait les 150 ms de « reprise de conduite » :
  l'écart caméra–caisse repartait de la caméra de l'image d'avant et la caméra reculait de v·dt à chaque image (35 m à 1 160 km/h, une caisse
  à 5 % de l'écran — FAUX). `window.dbgCamReprise=5000` dans un banc (défaut 150 : le jeu ne change pas). Banc : `cam-mesure2.js <préfixe>
  [paysage]` (scratchpad SON, `HEROS=0` = avant), médianes de `dbgCamRoute().caisse` + `.heros` (coup, champ demandé, punch, v/croisière).
- **MESURÉ AVANT** (image normale) : le recul n'était pas en cause (5,6-7,6 m debout) mais le CHAMP, grand ouvert en PERMANENCE avec la vitesse —
  debout 123-131° (caisse 29-44 % de la largeur), COUCHÉ 107-136° où CAM_TAILLE ne jouait pas (caisse 2 à 8 % de la largeur, 6 à 17 % de la
  hauteur, 7-11 m) ; et la nitro, tenue presque tout le temps, reculait la caméra de 1,6 m.
- **`CAM_HEROS`** (à côté de CAM_TAILLE ; A/B `dbgCamRoute({heros:{on:false}})`) : champ tenu deux fois moins ouvert par la vitesse (+16 au lieu
  de +38, nitro +7 au lieu de +15/22, FLOW ×½) ; « ÇA POUSSE » = la PRISE DE VITESSE (écart vitesse − sa moyenne sur 0,6 s, `kick` 16° à
  200 km/h d'écart ; une accélération brute restait saturée : la piste descend presque toujours) ; le VERTIGO (`dolly` : la caméra avance
  quand le champ s'ouvre, jusqu'à ×0,88 — la caisse garde sa taille, le monde s'étire) ; la nitro ne recule plus la caméra (`boost` .2) ; la
  vitesse n'éloigne plus au-delà de recMax couché aussi ; la caméra DESCEND un peu à haute vitesse (`bas`) ; couché, un GENOU du champ à
  112° (`fovMaxL`, les coups passent par-dessus) ; debout, un pas en arrière (`recP` 1,1) et la visée plus basse (`vise`) ; un voile de
  FLOU sur les bords en croisière rapide (`flou` .2, dans `sfxT` — le centre reste net). Coup de champ ×FOVP_K (« Réduire les animations »).
- **LE DÉCENTREMENT DE L'OBJECTIF** (relevé par GRAPHISME au banc du HUD : debout, l'arrière de la caisse descendait à ~750 px, sous le bouton
  NITRO 744-828 et l'anneau du volant 656-748) : la visée n'y pouvait presque rien (le regard est tiré vers la route au loin). `leveApplique` retire
  `leve`×POR (.09 NDC ≈ 38 px) au terme [9] de la matrice de projection juste après updateProjectionMatrix (route ET vol, une fois par image) :
  toute l'image monte, sans changer ni taille ni perspective ; lissé à 0 en vol (pas de saut au décollage). Le garage garde son setViewOffset.
  Mesuré : bas de caisse 616-701 px, haut 439-460 px, largeur inchangée.
- **RÉSULTAT** (palier 0 → 22, nitro, NITROOO) : debout caisse 41-57 % de la largeur (29-44), plus de rétrécissement en nitro, même hauteur à
  l'écran ; couché 10-14 % de la largeur et 18-25 % de la hauteur (2-8 / 6-17), champ 88-111° (107-136). 0 erreur.

## L'AUTOROUTE ORBITALE (2026-09-30, session SON) — « vu qu'on va très vite, adapte le terrain dans le niveau espace »
- **MESURÉ d'abord** (`dbgTerrain(kmh,mult)`, nouveau crochet : part de la piste hors d'atteinte du volant à la croisière — lacet v·κ contre
  `lacetMax` —, rayon mini, CRÊTES qu'une vraie caisse ne tiendrait pas (v²·κ > g·gK), pentes > 10°/20°, CROISEMENTS de la route avec
  elle-même ; banc `terrain-banc2.js`, 4 paliers × le cycle) : le VOLANT n'était pas en cause (0 % hors d'atteinte partout, ≤ 0,5 % à ×2 de
  NITROOO). L'espace sortait du même générateur que les nuages, avec la gravité ÷2 : 12 à 27 % de sa longueur en crêtes « volantes » (nuages
  4 à 13 %), des épingles/chicanes/vagues taillées pour 300 km/h avalées à 700-1 080 km/h (vitesse sol médiane au palier 22, pilote auto).
- **`ESP_ROUTE` + `ESPON` dans genCtrl** (tout niveau `id:'espace'` tiré par genCtrl — ORBITE, PLUIE DE SATELLITES, niveaux standard de la
  carrière ESPACE ; jamais les pistes dessinées `piste:'camp'`, jamais le parc) : piste dessinée pour 30 % de vitesse en plus (`lv` ×1,3 :
  rayons, droites, liaisons, longueur de zone) ; poids de la VILLE (`wv`) tempérés (épingles ×0,35, vagues/plongeons/chicanes ×0,5, momentum
  ×1,2) et rayons de la ville pour les grands virages et balayages ; relief en houle : `adoucirPentes` (au-delà de 8° : ×0,4) puis
  `adoucirCretes(…,.35)` (nouveau 3e paramètre `k`, 1 = la règle d'origine : les autres niveaux sont identiques au tirage près).
- **La PLUIE DE SATELLITES espacée en temps de route** (`espK=max(1,.45+.4·lvPiste())` sur les deux pas de pose d'orbiteBuild §0) :
  palier 4 → 2,7 s entre deux obstacles, 10 → 2,2 s, 16 → 1,7 s, 22 → 1,4 s (c'était 0,66 s au palier 22 : 127 m à 691 km/h).
- **Résultat au palier 22** : crêtes volantes 16-27 % → 8-12 % · pentes > 20° ~55 % → 28-45 % · rayon mini 95-141 → 148-258 m · 0 croisement ;
  pilote auto 40 s en orbite, 0 mort des deux côtés. `window.dbgEspOff=true` (avant la génération) rend l'ancien terrain pour comparer.

## LA REVUE DES NUAGES (2026-09-30, session GRAPHISME — constats de la revue de GAMEPLAY, vérifiés)
- **Les 14 NUAGES D'HORIZON en sprites sont RETIRÉS** (fin de buildTrack) : ils restaient en VILLE, perçaient la brume de l'ORAGE (650-1850 m
  contre 70/660) et la moitié tombait sous l'horizon dans l'abîme des NUAGES. Avec eux part `cloudTexs` (cinq toiles 512×256 peintes au
  pinceau gaussien à CHAQUE lancement : 0,5 à 2,7 s de calcul sur le fil principal). Aucun tirage `rnd` n'avait lieu après eux dans
  buildTrack (vérifié) : la piste ne bouge pas. Le ciel lointain, c'est COTON.
- **La brume d'un banc** visait 120/820 en dur (pensée pour les NUAGES) : à l'ORAGE (70/660) entrer dans un banc ÉCLAIRCISSAIT la brume →
  `Math.min(fogN9,120)` / `Math.min(FOG_F,820)` : jamais plus clair qu'avant d'entrer.
- **L'OUVRIER DES NUAGES** (même jour, INTERFACE m'a passé la main ; la normale de champ et le chou-fleur de la v7 sont intacts) : le
  calcul d'une forme (`cotonCalc`, PUR : aucune variable du jeu) part dans un Web Worker bâti depuis sa propre source (`cotonOuvrier`, un
  seul code). `cotonInit` ne calcule plus que la finesse la plus LÉGÈRE (7×5) et la pose dans les quatre lots ; les trois autres arrivent
  de l'ouvrier (les plus légères d'abord, `cotonFinesse` remplace l'ébauche). Les coussins et les tours (`mkCloud`) naissent en ÉBAUCHE
  (`CLOUD_SPH_LO` 10×7) et reçoivent leur forme fine de l'ouvrier (jetée si le nuage a disparu entre-temps). Repli si le navigateur
  refuse l'ouvrier : la file repart sur le fil principal PAR TRANCHES de ~8 ms. MESURÉ (banc `ouvrier.js`, tâches longues du fil principal) :
  cotonInit 2,1-2,9 s → 35 ms ; la plus longue tâche du chargement 6,8 s → 4,7 s ; les 72 finesses sont là en ~6 s, en tâche de fond ;
  au portail, plus aucune tâche longue due aux nuages ; ça marche aussi en `file://` (l'ouvrier y est accepté). `dbgCoton()` : initMs,
  toutPretMs, prets (/96), ouvrier, finsApart. ⚠ Le reste du gel au chargement (~4 s ×2 en headless) n'est PAS les nuages.
- **En attente** — À TRANCHER PAR SACHA : distinguer à l'œil les nuages UTILES (coussins/tours qui rendent de l'airtime)
  du décor COTON ; les bancs de route des NUAGES qui tombent en virage (la campagne 8 cache le virage SUIVANT) ; à l'ORAGE, un banc traversé
  EN VOL rend 1,2 s d'airtime (aucun test « sur la route »).

## LE JUS v5 — UN PEU PLUS VISIBLE, ET GÊNANT (2026-09-30, session GRAPHISME — Sacha à INTERFACE : « rends un peu plus visibles et gênantes à l'écran les taches de jus de fruit »)
- Entre la v4 (discrète, hors de la zone de conduite, 11-34 px, 6 au plus) et la v3b (46-91 px, partout, 14 — jugée trop) : rayon ~19-57 px
  sur un téléphone (plafond 68), coulure un peu plus longue ; **55 % des gouttes tombent PARTOUT** (route et caisse comprises : ça gêne), les
  autres gardent la couronne ; **8 à la fois au plus** (avec la LIGNE PARFAITE il y a un fruit toutes les ~2,4 s : le plafond reste), vie
  0,9-1,4 s, pleines .86 les premiers 40 %. Tout est dans `juiceScreen`/`juiceScreenTick` (bloc « LE JUS v5 »). Banc `jus5.js` (dbgJus).

## LES NIVEAUX RETRAVAILLÉS (2026-09-30, session DEBUGGING/UHD, zones prêtées par GRAPHISME et GAMEPLAY)
- Sacha : « retravaille le design des niveaux ; ajoute un niveau dans la VILLE après l'orage, plus tard, très sombre, avec des phares
  puissants ; dans l'orage on voit le reflet de la ville dans les flaques, pas normal, il n'y a pas de ville ; beaucoup plus de nuages
  dans l'orage, au point que ça gêne la visibilité ; des nuages plus gros au 1er niveau ; plus de satellites dans l'espace et un 6e niveau
  dans l'espace, la version hardcore, où il faut ESQUIVER les satellites ; retravaille la génération du 1er niveau (un seul module) ».
- **Le reflet de ville dans les flaques** venait de `BITUME_MOUILLE` : les « reflets étirés des enseignes » (colonnes ambre/cyan/magenta
  tirées de l'azimut du reflet) étaient calculées sur TOUTE route mouillée, ville ou pas. Elles sont multipliées par `uVil9` (=
  `LVL.ville`, au fondu du portail) : en VILLE (mode principal et carrière) rien ne change ; à l'ORAGE et au niveau 9 de la carrière
  NUAGES, plus d'enseignes. À la place, l'eau renvoie L'ÉCLAIR (`uEcl9` = `CAMP_FLASH`) : les flaques s'allument en argent froid
  avec le ciel. Deux uniformes dans `ROAD_U`, écrits par `routeTick` ; aucun programme de plus.
- **La pluie de l'orage** (relevé par la revue de GAMEPLAY) : une goutte sur sept était magenta, une sur sept cyan — des gouttes-enseignes
  sous un ciel sans ville. `PLUIE` : `uNeon` (= `LVL.ville`) mélange ces gouttes vers l'eau hors de la ville, `uEcl` (= `CAMP_FLASH`) les
  allume en argent à l'éclair, `uVent` pousse les gouttes : (1,4 ; 0,6) en ville comme avant, (14 ; 6) à l'ORAGE, avec 30 % de pluie en plus.
- **L'orage, plus de nuages** : bancs SUR la route tous les 300-600 m (560-1 180), ~1 sauté sur 16, 45 % de méga-bancs, plus gros, et
  un banc ordinaire sur deux DÉCALÉ d'un côté (il mange une moitié de route : on le frôle). Coton ×1,6 (×1,25), le PLAFOND 42 nuages
  (26) à 70-170 m (110-240), et des MURS : 30 nuages au ras de la route, de chaque côté, à hauteur de caisse — la route file dans un
  couloir de ouate. Brume de `tempete` 70/660 m (140/1 050) : on lit la route à ~600 m, l'éclair l'ouvre toujours (`CAMP_FOG`).
  MESURÉ (banc 390×844) : 67-98 k triangles de coton envoyés (67-113 k avant — la brume plus proche coupe le lointain).
- **Des nuages plus gros au 1er niveau** (`GZ` dans `buildCoton`, NUAGES seulement) : couronnes proche, milieu, haute et lointaine ×1,45
  (bornes de `cotonR`), cathédrales ×1,25, tours héroïques ×1,3. Même nombre tiré ; la garde de la route rejette ceux qui la toucheraient.
  MESURÉ : 391-415 k triangles envoyés (365-370 k avant).
  **2e passe** (« moins de nuages dans le premier niveau, mais plus gros ») : aux NUAGES, chaque couronne ×0,5 (`NZ`, et `KK` ×0,5), tailles
  ×1,9 (`GZ`), cathédrales plus rares (L/2000) et ×1,45, tours héroïques ×1,5. MESURÉ en course : 188 nuages posés (355), 185-218 k
  triangles envoyés (226-323 k) — de grandes masses et du ciel entre elles.
- **Le cycle a SIX niveaux** : NUAGES → VILLE → ORBITE → ORAGE → **MINUIT EN VILLE** → **PLUIE DE SATELLITES** (`zn % NIVEAUX.length`).
  Le compte des visites des NUAGES (filets 3/2/1) divise désormais par `NIVEAUX.length` (il divisait par 3).
- **MINUIT EN VILLE (5e)** : `{id:'ville', nuit:1, bio:['nuitNoire'], pluie:.55, route:.42}` — GARDER `id:'ville'` (toute la ville, l'entrée
  surélevée, la triade, les collisions, la musique sont branchées sur l'id ; `nuit` ne change que la lumière). `LVL.nuit` suit le fondu du
  portail comme `LVL.ville`. Le biome `nuitNoire` (jamais tiré) : clone de la PLUIE NÉON, ciel presque noir, ville peinte en braise
  (city .5), étoiles, brume noire-bleue 90/950 m, lumières d'ambiance au plancher, expo .62. `villeApres` : 3 fenêtres sur 4 éteintes
  (`CITY.uC` = 1 − 0,72·nuit, sauf pendant la panne du niveau 16 de la carrière), néons de la route ×0,4, spot des phares ×~2,5 en
  intensité, portée 72 → ~190 m, angle .5 → .62, du jaune halogène au BLANC xénon. `carVit` : la nappe des phares au sol ×2,1, les halos
  ×1,45. `PHARE_FX` : deux CÔNES additifs de 70 m devant les phares (créés à l'init, FrontSide, cachés hors de la nuit). 0 programme lié
  sur tout le cycle (99 → 99, banc `st-nuit.js`).
- **PLUIE DE SATELLITES (6e, hardcore)** : `{id:'espace', hard:1}`. `orbiteBuild` §0 pose AVANT tout le reste ~165 obstacles SUR la face du
  dessus : des STARLINK en travers (ailes de 14-20 m, penchés de 8-28°, à hauteur de caisse) et des ÉTAGES DE FUSÉE couchés (10-14 m),
  seuls ou en RIDEAU de deux avec une trouée de 11-14 m, un tous les 110-230 m dès 650 m ; plus ~30 panneaux EN L'AIR (9-20 m) pour qui
  saute. Orientation FIGÉE (`aVar.y`=0, `aRot.w`=0) et `aVar.w`=1 (le drapeau d'obstacle : liseré rouge qui pulse dans `SAT_MAT`, balise
  rapide, étoile `GLINT` qui pulse — on les voit venir). `satHard()` (boucle, à côté de `ligneTick`) : une BOÎTE par obstacle dans son
  repère (ailes W, face U, profondeur T) gonflée de la demi-caisse → `explode('sat')` (« PERCUTÉ PAR UN SATELLITE », rattrapé par le mode
  FACILE) ; passé à moins de ~3 m sans toucher → `frole()` (nitro, flow, aura, SLALOM enchaîné). La ligne parfaite ne pose rien dans un
  satellite (`ligneBloque`). `SATOB` est vidé à CHAQUE `orbiteBuild` (sinon ses obstacles survivaient au portail). Le dessous de la dalle
  reste libre. Hook `dbgPluie()` / `dbgPluie('va',i,dl,av)` (poser la caisse av m avant l'obstacle i, à dl m de son bord).
- **Les MODULES du 1er niveau** (« il n'y a qu'un seul module ») : MESURÉ au banc `plan.js` (vue de dessus) — trois nœuds de FILET
  identiques par zone. `genCtrl`, NUAGES du mode principal seulement (`MODON`) : un MODULE tous les 1,6-2,6 km, tiré dans un paquet
  MÉLANGÉ de cinq (jamais deux fois le même de suite) — FILET (au plus `filMax`), LACETS (2-3 épingles qui zigzaguent en descendant,
  jambes côte à côte), MONTAGNES RUSSES (3-4 bosses rondes en ligne), GRAND PLONGEON (~25° sur 200-280 m puis un grand virage de
  compression), DOS DE CHAMEAU (une grande bosse puis une longue descente lisible). Tout tire dans `rf` : ORAGE, VILLE, ORBITE sortent
  identiques au tirage près. Les crêtes restent soumises à `adoucirCretes` (jamais de crête aveugle, verdict du 25/09). Banc : 150 s de
  pilote auto sans saut forcé, 0 mort, 0 erreur ; 0-1 filet par zone au lieu de 3.
- **Plus de satellites en orbite** : `SAT_MAX` 204/220 → 340/300 (téléphone 120/140 → 230/190), `SAT_PASS` 26 → 44 (18 → 30), trains
  3 → 5 (2 → 3). MESURÉ (banc téléphone) : ~76 k triangles de satellites.

## LE GARAGE BRÛLE (2026-09-29, Léo) — « la porte du garage vue sur l'extérieur : une flamme plus grande, adaptée à la situation, qui fasse
## comprendre qu'on va passer dans les flammes, puis le jeu se lance avec le boost du début — c'est l'ambiance » · « replace mieux le bouton play,
## reprends les boutons du menu d'après le crash et mets-les dans le garage » · « la musique du lobby c'est NOCTURNAL GROOVE »
- **LE RIDEAU DE FLAMMES** (`buildGarageRoom`, après la route de dehors ; `GAR.feu` / `GAR.feuM` / `GAR.feuLu`, `garFeu(dt)` en tête de
  `garageRender`, `window.dbgFeu([on])`) : UN plan OPAQUE 10 × 4,9 m à z = hd+.36, juste derrière le mur de façade — ses bords passent derrière
  les piles (±4,8) et le linteau (4,7) : plus de vue dehors, la route et le ciel sont masqués au z-test. **v2 EN PIXELS** (même soir, Léo :
  « supprime ce design, recrée-en un inspiré des flammes pixelisées de la jauge — plus gros, plus joli, pixelisé ») : la 1re version (shader
  fbm, feu « peint ») est RETIRÉE. C'est le FEU DE DOOM de la 1re jauge NITRO MAX (26/09, branche de Léo ; remplacé sur main le 28/09 par des
  bouffées douces), en grand : grille 80 × 40 (`feuPixPas`, `FEU_PIX` = 36 teintes fumée rougie → braises → orange → jaune → blanc), agrandie
  en CanvasTexture `NearestFilter` (cases franches), 30 pas/s (12 si « réduire les animations »), seulement atelier ouvert ; 70 pas d'avance
  au montage (il brûle déjà). ⚠ La CHALEUR vit en 0-255 et ne tombe dans les 36 teintes qu'à la peinture : en 36 crans avec des pertes d'un
  cran au hasard, c'était une neige de télé (capture). Foyers en sinus qui glissent (les langues), étincelles, `GAR.feu.k` suit le LÂCHER
  (0 → 1 en 1,7 s) : la perte par rangée baisse, le feu monte au linteau. Lueur additive au sol côté atelier (blobTex teinté, aucune lumière).
- **LE GARAGE SOBRE** (même soir, Léo : « le point de vue est bizarre, effet loupe ; un garage plus sobre, la voiture au milieu, qui tourne
  grâce à la plateforme ») : la caméra ne fait plus le tour. FIXE (`GAR_CAM_A = π` : côté établi, elle regarde la porte en feu derrière la
  caisse) ; c'est le PLATEAU qui tourne, la caisse dessus (`garRot() = GAR_CAM_A − garageAng` → `carGroup.rotation.y` et `GAR.pod.rotation.y`).
  `garageAng` garde son sens (préréglages .42 / 3,5 aux TRAÎNÉES, glissé du doigt, `dbgGarage`). L'EFFET LOUPE venait du recul bridé à 8 m :
  l'objectif s'ouvrait jusqu'à ~87° en portrait ; dans l'axe fixe le recul monte à 10,5 m (FOV ~72°). Au LÂCHER, le plateau la remet face à
  la porte en 0,5 s (`GAR.go.r0`).
  · (2026-09-30, Léo, capture de sa branche `version-leolei-2026` : « c'est ça que je veux, avec l'interface boutique de la nouvelle
    version ») LE CADRAGE DE SA BRANCHE : on entre DERRIÈRE la caisse (`garageAng=π` à l'ouverture : l'arrière face à nous, la porte en feu
    au fond), inclinaison .2, et la visée passe AU-DELÀ de la caisse vers la porte (z +1,5, à 1 m couché ; debout la hauteur d'avant, .35 —
    l'interface du bas l'exige). Le lâcher part de cette visée (plus de saut). Pas repris : ses affiches, son socle SHOP, son PLAY en haut
    (il chevauchait le compteur) — l'interface est celle de main (MENU | BOUTIQUE | JOUER).
  · LE CADRAGE MESURÉ (2026-09-30, Léo : « la voiture est toujours pas cadrée, c'est chelou ») : les décalages d'objectif FIXES (GAR_DECY
    .075 en portrait, GAR_DECX .23 dès que l'écran était couché) sont remplacés par `garLibre()` (la place que laissent `#gTop` et `#gBottom`,
    en bas ou en colonne à droite — relue toutes les 250 ms) + `garCadre(k)` (projette le centre du plateau, décentre l'objectif pour le poser
    au milieu de cette place ; lissé ; k s'éteint au lâcher). Sur écran d'ordi le décalage .23 envoyait la caisse à gauche, à moitié sous
    les onglets centrés. ET LA COLONNE vaut aussi pour l'ordi pas très haut : `(orientation:landscape) and (min-aspect-ratio:3/2) and
    (max-height:820px)` en plus du téléphone couché (les règles du garage sorties du grand bloc « max-height:540px », les autres écrans
    inchangés) — à 1000 × 570 les commandes empilées mangeaient la moitié de l'écran. `garageDecale(0)` efface tout (closeGarage).
    Vérifié en capture : 390 × 844, 844 × 390, 1000 × 570, 1400 × 800, 1440 × 900.
  · **FEU v3 — PIXEL PREMIUM, ET DISCRET** (2026-09-30, Léo : « plus discret les flammes, ça fait cheap ; rendu pixel premium ; les flammes
    dépassent le haut de la porte » · « les reflets des flammes un peu forts ne vont pas avec l'aspect premium — surtout le sol, et le reflet
    en général ») : le feu de DOOM (chaleur qui monte case par case) est RETIRÉ, `FEU_PIX` aussi. `feuPixPas` DESSINE les flammes : une
    hauteur par colonne (deux houles + des LANGUES en sinus au cube) — ~45 % de la porte au repos, ~80 % au lâcher, JAMAIS plus de 90 %
    (la pointe reste sous le linteau) —, la colonne lue ondule avec la hauteur, l'intensité tombe dans SEPT bandes franches (`FEU_PAL`) ;
    au-dessus une FUMÉE sombre en tramage ordonné Bayer 4 × 4 (`FEU_BAY`, `FEU_FUM`) ; des BRAISES d'une case (`F.em`, ~3,5/s au repos,
    une gerbe au lâcher). Grille 96 × 48 (cases de 10 cm), un cran plus sombre au repos (`D`). LES REFLETS (atelier v2 de Sacha, dosés) :
    miroir au sol .5 → .14 et fondu éteint à 60 % de la hauteur, murs .42 → .15, plafond .16 → .06, façade .5 → .2 (désormais animée),
    lueur du seuil .42 → .16, souffle `fl` ±7 % au lieu de ±16 % — tout remonte au LÂCHER (`1+k·1,4`) ; la laque de la caisse ne prend
    plus que le BAS de la porte en feu, sombre. `dbgFeu()` rend `brule` = hauteur moyenne des flammes, `braises`.
  · FEU : les cases froides prennent un FOND de fumée qui rougeoie par rangée (rouge sombre au pied → presque noir sous le linteau) — elles
    tombaient au presque-noir et trouaient le haut du feu (« la flamme, corrige-la »).
  · `paintEnvAtelier` : la face +Z (la porte) est peinte en FEU — la laque de la caisse reflète les flammes, plus la nuit.
  · Le voile du LÂCHER part à u > .90 (était .80) : la caisse ENTRE dans le feu (nez au rideau à u ≈ .82) avant la coupure ; `#gFade` en
    blanc CHAUD `#ffe3b8` — toujours le voile d'une image (le flash plein écran a été jugé « horrible » : l'effet est DANS la scène).
  · **Le BOOST DE DÉPART revient** (`fireLaunchBoost` : `startBoostT=3`, 0 à l'auto-école — repris de la branche de Léo, 28/09) : on sort des
    flammes EN flammes.
  · **Sa voix** : `sfx('garage.feu')` (bloc GARAGEFEU de `atelier-son/recettes.js`, banque v7) — boucle de 6 s sur le bus d'ambiance, par-dessus
    `garage.ambiance` : grondement qui respire (0,33 / 0,5 Hz), souffle, ~50 crépitements, 4 claquements de bois ; `openGarage._feu`, arrêtée
    dans `closeGarage`, +8 dB × uK pendant le lâcher (`garFeu`).
- **LES BOUTONS DE L'ÉCRAN DE MORT À L'ATELIER** : BOUTIQUE · RÉGLAGES en touches carrées en haut à droite (`#gOutils [data-go]`, couché : le
  vrai coin de l'écran) ; en bas la paire MENU | JOUER, à la place exacte de MENU | REJOUER. `#gClose` est devenu la MAISON (même matière que
  celle de l'écran de mort) : venu de la mort, il range la course et rentre à l'ACCUEIL (`accueilRetour`) ; venu des MISSIONS, il y retourne.
  BOUTIQUE / RÉGLAGES passent par `__mRetour` (lu par l'observateur de l'overlay à la fermeture — un `mGo` direct est écrasé par son retour
  à la racine). GARAGE n'est pas repris (on y est).
  · **JOUER** (`#gJouer`, `garJouer`) : lingot d'or qui prend toute la barre quand il n'y a rien à décider (ÉQUIPÉE s'efface) ; quand
    ACHETER / ÉQUIPER / VERROUILLÉE s'affiche (`gActSync` → `#gAct.choix`), c'est LUI qui garde l'or et JOUER passe en laque cyan (charte : un
    seul lingot). Il lance LE LÂCHER ; une caisse ou un habillage à l'essai (pas à toi) rend la main à la tienne avant la sortie ; le 1er
    JOUER demande le mode (facChoix) comme celui de l'accueil.
- **MUSIQUE** : `MUSIC.menu` = NOCTURNAL GROOVE (accueil, garage, écran de fin) ; SWAG CASH CAR → `MUSIC_LIEU.orage` (« le ciel électrique » :
  lu comme L'ORAGE, le niveau des éclairs, qui n'avait pas de morceau — si Léo parlait de la VILLE, c'est une ligne). ⚠ NOCTURNAL GROOVE est
  AUSSI le morceau de la VILLE : la même chanson à l'accueil et au niveau 2 (à trancher par Léo : ADDICTIVE LOOP en VILLE, comme sur sa branche ?).

## LA MUSIQUE DE LÉO SUR MAIN (2026-09-29) — « Sacha doit entendre ma musique quand il pull »
- Repris de la branche `version-leolei-2026` (elle a divergé de main : 83 commits d'un côté, 71 de l'autre ; le jeu y est à la RACINE, pas
  dans `VERSION PRINCIPALE/` — un `git merge` de cette branche poserait une 2e copie du jeu). Seule la MUSIQUE est reprise ici :
  · **SWAG CASH CAR** (`assets/audio/music/swag-cash-car-2.m4a`, 2 min 37) = `MUSIC.menu` (⚠ le même soir : parti à L'ORAGE, l'accueil joue
    NOCTURNAL GROOVE — voir LE GARAGE BRÛLE) : accueil, garage, écran de fin, à .8 (avant :
    le morceau du 1er niveau à .5). Trois lignes reprises de Léo : le 1er toucher précharge `MUSIC.menu||musicPremier()`, `musicMenu` et
    `musicPlayCurrent` le jouent. `musicSession` reste celle de main (le correctif iOS 17 « ambient si MUSIQUE coupée »).
  · **ADDICTIVE LOOP** (`addictive-loop.m4a`, 2 min 58) : chez Léo il REMPLACE NOCTURNAL GROOVE en VILLE ; Léo n'a pas encore tranché pour
    main → il entre dans la RADIO (`MUSIC_TRACKS`, jouée à l'ORBITE et à L'ORAGE). Le passer en VILLE = une ligne de `MUSIC_LIEU`.
  · Les deux en AAC-LC 48 kHz (Léo les a ré-encodés depuis de l'Opus/MP4, illisible sur Safari). ⚠ Le Chromium de Playwright n'a PAS l'AAC
    (`canPlayType` vide, erreur 4 au banc) : c'est le banc, pas le fichier — Chrome et Safari les lisent.
  · `SON_TON` : SWAG −1 (do m), ADDICTIVE +1 (la m). Méthode : chroma des PARTIELS (pics du spectre, 55-2000 Hz), énergie dans chacune des
    12 gammes majeures, puis la plus petite des trois pentatoniques de la gamme gagnante. Elle retrouve NÉON (−1), NOCTURNAL (0) et NOITE
    (+2), pas VITESSE (elle dit 0, la table dit −2) : SWAG est le résultat le plus net des six, ADDICTIVE moins (marge 0,011).
  · sw.js CACHE → v28 (v26/v27 sautés : la branche de Léo est déjà à v27, même origine en local).
- ⚠ Toujours manquant (antérieur) : `assets/audio/music/dark-triad.mp3` (THE DARK TRIAD, la musique de FRÉNÉSIE, `MUSIC_FREN`) n'est dans
  AUCUN commit de main ni de la branche de Léo — 404 à chaque chargement.

## LE DRAGON DE NITROOO + LA VITESSE EXPONENTIELLE (2026-09-29, nuit — session GRAPHISME, avec l'accord d'UHD qui a fait NITROOO)
Sacha : « NITROOO devient un dragon chinois de feu, de plus en plus grand et visible à chaque palier de vitesse » · « il faut qu'il soit
vraiment beau et que ça se suive : commencé au sol, dans les airs il doit se poursuivre, pas de barrière » · « la progression de vitesse
doit être exponentielle ; à chaque palier de 10 % ça doit rajouter un compartiment au corps du dragon ».
- **LA VITESSE EXPONENTIELLE** (bloc NITROOO d'UHD) : `NTR.boost = (1+NTR_BOOST)^t − 1` — ×1,10 COMPOSÉ par seconde tenue (+10 %, +21 %,
  +33 %… +159 % à 10 s), plafond `NTR_BOOST_MAX=1.6` (×2,6, palier 10 — Sacha, 29/09 nuit : à ×5 la caisse s'envolait à chaque relief
  et mourait « TROP LONGTEMPS EN L'AIR », mesuré par GAMEPLAY, banc ntrx.js). PLAFOND COMMUN : `vitMult()` borne AUSSI VITESSE ×2 × NITROOO à ×2,6
  (sinon ×5,2 au plafond, mort presque sûre — trouvé par DEBUGGING ; lu par spdMult ET ligneTick). Le « +N % » de chaque palier suit la même loi. ⚠ Le
  plafond est un garde-fou (au-delà la piste défile plus vite que le viseur et que les collisions balayées) : on peut le lever, pas le supprimer.
- **LE DRAGON v5 — LA COMÈTE A LA FORME D'UN DRAGON** (2026-09-30, Sacha : « le dragon, c'est pas ce que je voulais : l'aura de flammes de
  NITROOO, style comète, doit ELLE-MÊME avoir la forme d'un dragon — une TÊTE DE DRAGON DE FLAMMES qui ENGLOBE la voiture ; plus tu boostes
  longtemps, plus la tête devient GROSSE, OPAQUE et ENFLAMMÉE ; à chaque palier, le CORPS apparaît petit à petit DERRIÈRE la voiture »).
  ⚠ Les v1 à v4 sont ÉCARTÉES : un dragon qui vole DEVANT (en S, puis en ronde cadrée au tiers haut de l'écran), puis enroulé AUTOUR de la
  caisse la tête posée sur le capot — Sacha ne veut pas un dragon À CÔTÉ de la caisse : la caisse EST dans la tête.
  (`DRG`, `dragonInit`, `dragonTeteInit`, `dragonTick` juste après `nitroooTick`, `dragonHisto`, `dragonEchineCalc`, `dragonEchine`, `dragonBande`)
  · **LA TÊTE** vit dans le repère de la CAISSE. Un crâne FACETTÉ (`DRG.tm`, la DA poly du jeu) : sept couronnes (`DRG_CR`) de la nuque au
    bout du museau, une MÂCHOIRE (`DRG_MC`) qui pivote sur sa charnière (grande ouverte au rugissement), quatre CROCS chauffés à blanc.
    Coordonnées « tête » (`MT`) : x ±1 = 1,32 × la demi-largeur, y −1 (le sol) → 1 (le haut du crâne), z −1 (l'arrière de la caisse) → 1 (le
    museau, devant le nez). Le FEU PEINT (`DRG_PF` : liseré sombre, rouge, orange, cœur d'or, bords mordus en langues) s'enroule autour — l'arête
    en or, les flancs plus sombres (`DRG_BR` : du CONTRASTE, sinon elle se fond dans la caisse orange), il DÉFILE vers la nuque. Par-dessus :
    deux BOIS et leurs andouillers, les SOURCILS froncés (rubans peints), la CRINIÈRE, les MOUSTACHES, la BARBE (rubans additifs), deux YEUX
    peints en cases (`DRG_OEIL` : amande bridée, iris d'or, pupille fendue — ⚠ le +x de la caisse est à GAUCHE de l'écran en poursuite).
    ⚠ LEÇON DU BANC : des rubans seuls ne dessinaient qu'un fouillis de traits — de la poursuite, une tête se lit par sa MASSE (un volume).
  · **ELLE GRANDIT AVEC LA TENUE** (`NTR.gT`, 0 → 1 en 10 s, posé par `nitroooTick`) : taille ×1 → ×1,4 (vers l'AVANT et le HAUT : la nuque
    reste à l'arrière de la caisse, le menton au ras de la route), opacité 0,5 → 1 (au bout, la caisse est DANS la tête), bois et crinière
    plus longs. La COMÈTE d'UHD (plasma, langues, halos) grossit pareil (`HS` .85 → 1,6), s'EMBRASE avec la tenue (intensité 0,6 → 1 — c'était
    l'inverse : 0,7 puis 0,5 après 6 s) et sa gerbe de flammes triple. Au rugissement, la gueule s'ouvre et crache une gerbe devant.
  · **LE CORPS** suit la TRAJECTOIRE de la caisse (`dragonHisto` : un anneau de positions, un point tous les 35 cm ; au portail il repart
    tout droit derrière) : sur la route il y serpente, en vol il suit la parabole — pas de barrière entre le sol et l'air. AUCUN compartiment
    au déclenchement (la tête seule), UN DE PLUS À CHAQUE PALIER (`DRG.nS` → `NTR.pal`), qui POUSSE à la queue : écailles peintes, anneaux
    d'or, pattes, crête, halo, flammes de queue. Son haut est le haut de l'ÉCRAN lissé (`camUp` : sur la face du dessous, le haut du monde
    est dans la dalle). ⚠ Près de l'objectif les bandes s'AMINCISSENT (une bande peinte assombrie devenait une nappe NOIRE sous la caméra).
  · **EN VOL — v5.2** (même jour, Sacha : « beaucoup plus beau, et mieux géré, notamment en AIRTIME ») : la tête n'est PLUS dans le repère de
    la caisse (en vol elle vrille, pique, se retourne : la tête tournait avec elle et le cou traversait la caisse pour rejoindre le corps).
    Son repère (`DRG.hF/hU/hR`) = la TRAJECTOIRE lissée (`DRG.vF`, les écarts de position) et le HAUT DE L'ÉCRAN lissé, au sol comme en vol —
    un seul repère, aucun saut au décollage ni à la pose ; la caisse fait ses figures DEDANS, le cou reste derrière. ⚠ Le seuil de TÉLÉPORT
    suit la vitesse (`l > 4 × le pas lissé + 10 m`) : fixe (11,7 m/image), il se déclenchait en vol au 10e palier (faux portail, cap qui
    sautait de 84°). Mesuré (banc `drgvol.js`, sondé à 60 ms) : ≤ 7° au décollage ; les seuls sauts restants sont de VRAIS téléports
    (190 m en une image : la tête se recale sur le nez, comme la caméra). La CAMÉRA DANS LA TÊTE (caméra de vol serrée) : le crâne, les
    rubans peints et les yeux s'effacent quand l'objectif entre dans l'ellipsoïde de la tête (`fC`). Plus beau : deux NAGEOIRES en éventail
    derrière les yeux, six FLAMMÈCHES qui lèchent le crâne vers la nuque (plus longues avec la tenue), la LUEUR de la gueule (`DRG.bouche`,
    elle éclate au rugissement), les yeux qui CLIGNENT, et la tête qui VIT (le museau regarde à droite, à gauche, hoche ; la nuque ne bouge pas).
  · Trois matières du programme des rubans de traînée (un maillage) + la même pour le crâne + le programme des sprites : **0 compilation en
    course** (banc drg.js). NITRO INFINIE : textures VIOLETTES repeintes au chargement (`drgViolet` : le rouge → violet, l'or → lilas).
    Fin, recommencer, quitter : `nitroooVide()` → `dragonCache()`.
- **DRAGON v6** (2026-09-30, session SON, GRAPHISME a passé la main — Sacha : « on ne doit pas voir ses yeux quand on boost, vu qu'il
  regarde vers l'avant ; travaille les effets dans les virages et dans les airs, et mieux l'animation au global ») :
  · **LES YEUX** étaient des SPRITES `depthTest:false` : face à la caméra et par-dessus tout, on les voyait de DOS, posés sur la nuque comme
    s'il regardait la caméra. Chaque œil a désormais l'axe de SON regard (`DRG.oN` : vers l'extérieur et l'AVANT) et s'efface quand la
    caméra ne voit pas sa face (`DRG.vu`, smoothstep .08-.42) — lueurs comprises (la lueur du 2e œil a sa propre matière, même programme).
    Mesuré : poursuite 0/0 sur toute la course et tout le vol ; pause photo (`drgphoto-ss.js`) : derrière 0/0, dessus 0/0, trois-quarts
    avant et profil = l'œil tourné vers la caméra. La LUEUR DE LA GUEULE ne rougeoie plus à travers le crâne vue de dos (×.18).
  · **LE VIRAGE** (`DRG.vir`, lacet de la trajectoire lissée + l'intention du volant au sol) : la tête PENCHE dedans (repère `kU/kR` de `MT`,
    jusqu'à 17°), le museau REGARDE dedans, crinière, moustaches et flammèches rejetées vers l'EXTÉRIEUR, la nageoire extérieure s'ouvre,
    le corps se TEND (ondes ×.55), des braises giclent du flanc extérieur.
  · **L'AIR** (`DRG.air`) : le corps NAGE (ondes plus longues et plus lentes, `DRG.ph` : la phase court à sa vitesse), il traîne un peu
    SOUS la trajectoire (entre la caméra et la caisse, un corps qui montait cachait la pose), les nageoires battent comme des AILES, la
    gueule s'entrouvre et SOUFFLE, crinière et moustaches s'allongent. DÉCOLLAGE : la tête se cabre (`envol`) ; POSE : elle s'ÉCRASE
    (`imp` : tassée, gueule qui claque, couronne de braises au ras de la route).
  · **L'ANIMATION** : la tête a une INERTIE (ressort amorti `nodS/nodV` : elle plonge quand la caisse accélère, se cabre quand elle ralentit,
    rebondit), elle RESPIRE (±2,2 %), le RUGISSEMENT a une attaque de 130 ms, crinière et moustaches ondulent en ONDES qui courent de la
    racine au bout (de la soie, plus un tremblement). 0 programme lié en course. Bancs (scratchpad SON) : `drg-poursuite.js <préfixe>`
    (poursuite + gros plans de la tête, état `yeux/virage/air/ressort` de `dbgDragon()`), `drgphoto-ss.js` (4 angles, SwiftShader) ;
    `dbgDragon('tick')` recalcule une image du dragon pour la caméra d'une photo en pause.
  · **v6.1 — IL SE FORME** (Sacha : « il doit se former plus lentement : au début c'est juste des flammes, et petit à petit ça devient un vrai
    dragon ») : `DRG.fo` 0 → 1 en `DRG_FORME` = 6 s de NITROOO tenue (remis à 0 quand elle s'éteint). Chaque partie naît à son heure :
    flammes seules et langues sauvages (`CH`, le chaos du début : crâne qui ondoie ×4, crinière et flammèches plus longues) ; braises
    ASPIRÉES vers la tête ; le CRÂNE apparaît et se resserre hors du feu (`fCr` .2-.58 : opacité, taille ×1,25 → 1) ; bois, sourcils,
    nageoires (`fTr` .38-.75), moustaches et barbe (`fMo` .3-.7), lueur de la gueule (`fBo`) POUSSENT ; les YEUX s'ouvrent (`fOe` .68-.86,
    paupières) et il RUGIT (`DRG.ne` : il est né) ; le CORPS sort ensuite (`fCo` .7-1). Banc `drg-forme.js` (15 photos de poursuite + un
    trois-quarts en pause) : flammes → masse de la tête → dragon complet à 0,94. `dbgDragon().forme`.
- ⚠ **LEÇON** : un `//` en milieu de ligne avale TOUT ce qui suit sur la ligne — `scene.add(DRG.tete)` écrit derrière un commentaire n'a jamais
  tourné (le sprite existait, invisible : `dbgDragon('ecran')` → `par:false`). Commentaire au milieu = `/* */`.
- Aussi dans ce lot (audit GAMEPLAY) : `eclVide()` rend l'exposition et la brume (mourir pendant un éclair laissait l'écran de fin surexposé) ;
  la bannière de L'ORAGE a sa promesse (`pr` : « LA ROUTE SE CACHE : L'ECLAIR LA MONTRE », EN/ZH).
- Bancs : `drg.js <racine> <préfixe> [--pay] [--inf]` (photos aux paliers 1/3/6/10, en vol, à la pose, au lâcher + positions écran de la tête,
  de la tête, du nez, d'un bois, du corps), `drgphoto.js <racine> <préfixe> [palier]` (EN PAUSE, 4 angles : derrière, 3/4 avant, profil, dessus), `dbgDragon()` (palier, tronçons, tenue, tête, corps), `dbgDragon('tete')` (la texture), `dbgDragon('ecran')`.

## L'ORAGE — LE 4e NIVEAU, LE NIVEAU DUR (2026-09-29, nuit — session GRAPHISME, avec l'accord de GAMEPLAY et de la Campagne)
- Sacha : « rajoute un niveau après les 3 premiers : le biome nuages mais avec un orage, beaucoup plus de nuages, de la pluie, des
  éclairs et plein de gros nuages sur la route — ce doit être le niveau dur, ambiance sombre dans le même style que le premier niveau ».
- **`NIVEAUX`** : `{id:'orage', nm:"L'ORAGE", bio:['tempete'], pluie:1, …}` en 4e — le cycle devient NUAGES → VILLE → ORBITE → ORAGE
  (`zn % NIVEAUX.length`). L'orage fait comme les nuages pour l'abîme bleu (`LVL.merA`), les nappes (`lvlNuageOk`), les virages à filet
  (mais UN seul : `filMax`), et prend l'accent violet électrique `0x8a7dff`. `pluie:1` suffit pour : le rideau de pluie (PLUIE), le
  bitume mouillé, le soleil éteint, les plots rétroréfléchissants, la lampe de caisse de nuit.
- **Le biome `tempete`** (jamais tiré au hasard) : clone de l'ORAGE VIOLET SANS la ville peinte (city 0) — ardoise au zénith, brume
  proche 140-1050 m, nuages éclairés d'un argent FROID (volSun bleuté → la lumière de peintre les fait ardoise), liseré du néon.
- **Plein de gros nuages sur la route** (`buildClouds`, `OR9`) : les bancs `onRoad` tous les 560-1180 m (1900-3300 ailleurs), 1 sur 10
  sauté (2 sur 5), 32 % de méga-bancs (10 %), plus gros — ~29 bancs par piste (≈ 4 aux nuages). Le hasard reste sur `cr`.
- **Plus de nuages** (`buildCoton`, `OR`) : ×1,25 sur les couronnes + un PLAFOND bas (26 grands rouleaux/humilis 110-240 m au-dessus de
  la route, sur elle et autour). ⚠ MESURÉ : 407k triangles envoyés — tout le lointain était dessiné, noyé dans la brume. `cotonTick`
  ne l'envoie plus à l'orage (un nuage entièrement au-delà de `fog.far`) → 60-105k, comme les nuages. `COTON.cap` 480 → 560.
- **Les éclairs** : ceux du niveau 9 de la campagne (`orageTick` : ECL, eclFrappe, tonnerre retardé selon la distance), appelés par la
  boucle quand `LVL.cur.id==='orage'` et JAMAIS en campagne (un seul écrivain d'ECL/CAMP_FLASH). L'ÉCLAIR RÉVÈLE : le flash monte
  l'exposition et OUVRE la brume (`CAMP_FOG` : 140/1050 → ~500/1800 m) — dans le noir et les bancs, c'est lui qui montre la route.
  Remis à zéro à chaque piste par `campDebut` et à la mort par `campStop`. Hook : `dbgOrage()` / `dbgOrage('eclair')`.
- 0 programme lié en arrivant à l'orage (banc `orage.js` : trois portails, route/éclair/vol ×3). Pas de morceau de musique propre
  (`MUSIC_LIEU` n'a pas d'orage : la radio joue) — à fournir par Sacha / la session SON.

## LES NUAGES v6 — PLUS DIFFÉRENTS LES UNS DES AUTRES (2026-09-29, nuit — session GRAPHISME)
- Sacha : « retravaille les nuages, ils ne sont pas assez différents les uns des autres ». Trois causes vues sur captures : une seule
  famille de silhouettes (base + tours), un seul GRAIN de bourgeons, une seule teinte.
- **18 gabarits tirés par session** (8 avant ; `COTON_KINDS` 14 → 24, `COTON_GENRES`) dans NEUF genres : humilis, mediocris, congestus,
  castellanus, fractus + STRATOCUMULUS (long rouleau bas), ALTOCUMULUS (troupeau de petits cumulus — ⚠ des flocons d'UN bourgeon se
  lisaient comme des bulles : chacun a sa base double et 2-3 bourgeons soudés), CISAILLÉ (tour couchée par le vent + traîne), CHAMPIGNON
  (tête étalée en couronne de bourgeons RONDS). Base plate et bourgeons ronds partout (verdict du 28/09).
- **Un grain par gabarit** : fin ×.76 (24 bourgeons au plus — à 28 les triangles envoyés doublaient), moyen, gros ×1,28.
- **Une teinte par nuage** : couleur PAR INSTANCE (`instanceColor` sur TOUS les lots dès `cotonInit` — un seul programme, cf. le piège
  de `villeChauffe`), posée par `cotonPose` (`COTON_ST` 10 → 13) et suivie par le tri de `cotonTick` : clair/sourd .82-1,04, chaud/froid
  ±20 %, 12 % « lourds » gris-bleu. La lumière de peintre garde 50 % de la teinte propre (sinon elle l'effaçait).
- `COTON_POIDS` est construit par genre (les 6 classiques ×.55 : on les revoyait à chaque partie) ; les tours se choisissent par GENRE
  (`cotonDe(cr,['congestus','cisaille',…])`), plus par indice en dur. Coût : ~80k triangles envoyés au banc (≈ 55k avant), 0 programme
  lié en course (tour.js, 3 niveaux).

## LE CIEL « DRAGONS » — NUAGES v5 (2026-09-29, nuit — session GRAPHISME, avec l'accord de GAMEPLAY qui avait fait la v4)
- Sacha : « travaille la génération des nuages pour avoir un truc encore plus beau et artistique, qui fasse ressentir au joueur la
  LIBERTÉ comme dans le film Dragons 1 ». Banc `dragon.js` (scratchpad GRAPHISME) : Math.random à graine fixe → même piste, même
  ciel d'une version à l'autre ; 5 endroits × (au sol, en vol) ; `BIO=matin|midi|aprem`, `LS=…` (fractions de piste), `--pay`.
- **LA LUMIÈRE DE PEINTRE** (`nuageShader`, tous les nuages : coton ET maillages) : la ouate garde sa luminance (Phong + modelé cuit)
  mais sa TEINTE suit la lumière du film — côté soleil crème-or, flancs à l'ombre bleu ciel, ventre lavande, frontière douce. Les
  couleurs viennent des `volSun/volSky/volGnd` de chaque biome (restés des anciens nuages volumétriques), normalisées en luminance
  par `bioApply` → `GFX_U.uNuSun/uNuSky/uNuGnd` ; `GFX_U.uUpV` (le haut en espace vue) posé chaque image à côté de `uSunV` ;
  `GFX_U.uDragon` = (force, ombre ×.92, soleil ×1,08) — `uDragon.x=0` rend la lumière d'avant (A/B).
- **LES CATHÉDRALES** (`buildCoton`, couche 7) : toutes les ~1,4 km, de GRANDS congestus (r 220-340, gabarits 10/11/2) qui montent de
  l'abîme (base 220-340 m sous la route) et la dominent de ~150-250 m, à 300-650 m du bord — une PORTE (les deux côtés, 45 %) ou
  une FALAISE (un côté). ⚠ Essayé puis retiré : étirer la tour ×1,5 + lui poser une couronne = bourgeons en œufs empilés (« chenille »).
  `cotonPose` accepte un étirement vertical imposé (`syF`), laissé à 1-1,15.
- **LES ARCHIPELS** (couche 1) : la couronne proche n'est plus 80 nuages semés un par un mais ~30 îlots de 2-3 (un grand + ses
  satellites au même plafond) — du CIEL OUVERT entre deux.
- Coût : ~360 nuages (cap 480), triangles envoyés du même ordre qu'avant (~49-64k au banc), **0 programme lié en course** (tour.js,
  3 niveaux). Verdicts respectés : base plate et bourgeons ronds, pas de Terre, pas de jour cobalt, hasard hors du flux `rnd` de la piste.

## LA DARK TRIAD POUR LES BONS JOUEURS — LOI 18 DE FLOW2 (2026-09-29, nuit — session GRAPHISME, avec l'accord de GAMEPLAY)
- Sacha : « dark triad trop facile à avoir, il faut que ce soit pour les bons joueurs » (après la loi 17, « l'entre-deux »).
- UN seul levier, la MONTÉE : `FLOW2.cel` .55 · .42 · .30 · .25 → **.55 · .23 · .165 · .14** (les cellules or, rose et triade
  demandent ~1,8× plus de gestes). Inchangés : tenue, fuite, répit, `gate`, triade, ville (`lieux.ville` n'a pas de cellules à elle),
  ×3 d'argent. Écartés : la fuite (elle punit aussi les maîtres) et `gate` > 1 (la triade ne prend plus qu'à la nitro : plus personne).
- MESURÉ (5 min × 60 parties) — part des parties qui atteignent la frénésie en 5 min / 1re frénésie médiane :
  NUAGES (`simtri2.js` = simtri + un virage à filet par minute) tranquille 0 % · casse-cou **13 %** (loi 17 : 100 %, ~2 min) · maître
  100 % à **~2 min** (~1 min) ; VILLE (`simville2.js` = simville AVEC `flowLieu('ville')` posé — l'ancien simville ne le posait pas,
  il ne simulait que « moins de sauts ») casse-cou **7 %** (90 %, 2 min 22) · maître à **~2 min 20** (1 min 06). En frénésie
  0 · 1 · 19 % du temps (0 · 15 · 39 %). Bancs dans le scratchpad de la session GRAPHISME (f71fd2a2…/scratchpad/gfx).

## LA ROUTE QUI TE RATTRAPE — ESSAI AU NIVEAU NUAGES (2026-09-29, session GRAPHISME)
- **La demande** : 4 vidéos de Sacha (dans `C:\Users\sacha\Videos\`, 29/09) — deux de VOLTIGEUR (60 % du temps en l'air, sortie par
  le bord, pose sur la route du dessous) et deux de ROULEUR (au sol, nitro à fond ; il ne vole que quand il RATE un virage, et se
  rattrape plus bas : MIRACULÉ, RACCOURCI). « Une génération de map qui plaise aux deux et donne des sensations inoubliables. »
  ⚠ REJETÉ d'abord : le « tourbillon » (toute la piste en spirale calée sur le vol) — « les rouleurs doivent kiffer aussi ».
  Validé : « un virage bien pris paie PLUS qu'une chute rattrapée » ; essai au niveau NUAGES seul.
- **Le motif `filet` de genCtrl** (NUAGES du mode principal seulement : ni ville, ni orbite, ni campagne, ni école, ni parc ; son
  hasard a son propre mulberry32 — un seul `rnd()` de plus, et seulement aux NUAGES) : une APPROCHE droite → un VIRAGE RAPIDE
  presque plat (55-75°, R (95-140)·RS, pente 4-7 %) → une BRETELLE (ligne qui s'éloigne dans l'axe de sortie, grand demi-tour,
  ligne du retour : un Dubins « virage · droite · virage » du même côté ; la v1 tournait en rond = escargot, écartée) → le FILET :
  la route repasse 42 à 54 m plus bas, À L'EXTÉRIEUR du virage, dans le même sens, pile sur le LIEU DES POSES d'une caisse qui sort
  du virage (sortie au bord extérieur, écartée de `dev` 0,13 rad vers le vide, à `kv`×croisière, poussée de décollage `kick`,
  gravité FALL_G×SPD, pente du virage comprise). 3 filets à la 1re visite des nuages, 2 à la 2e, 1 ensuite (`FILET.par`).
- **Les pièges MESURÉS** (banc `filet.js` : la caisse posée au bord, lâchée sans les mains) : (1) la PENTE du virage part avec la
  caisse — à 780 km/h, 12 % de pente = 26 m/s vers le bas dès la sortie, la caisse passait 44 m sous le filet → virage presque plat
  + pente dans le calcul ; (2) une caisse qui rate un virage part ÉCARTÉE de la tangente (~0,15 rad) → `dev` ; (3) viser la
  croisière laissait passer au-dessus tout ce qui va plus vite — or c'est en allant trop vite qu'on rate → `kv` 1,1.
  Résultat : 39/45 sorties rattrapées de 0,85 à 1,15× la croisière (début de partie) ; au-delà (NITROOO à fond) la caisse passe
  au-dessus et c'est au joueur de corriger en vol ; à très haute vitesse la tolérance se resserre (un filet de 56 m vu à 500 m).
  Dégagement mini entre étages ≥ 37 m (`dbgPisteCamp`).
- **Les paiements** (règle de Sacha) : `filetTick` (au sol) — traverser le virage sans quitter la route ni descendre sous `vFond`
  (0,8) × sa vitesse de calcul = **VIRAGE A FOND** (120 d'aura brute, flow de route 14, nitro +0,25) ; `filetRattrape` (à la pose,
  vol parti du virage et posé dans SON filet, `filetDe`) = **RATTRAPE** (50 d'aura, flow 6) À LA PLACE du RACCOURCI ; la pose lourde
  et la vitesse perdue font le reste. Un seul texte chacun (celui de la chaîne — « moins de textes au milieu », 661854a).
- **Banc** : `dbgFilet()` (liste), `dbgFilet('neuf',visite)` (nouvelle piste NUAGES), `dbgFilet(i,f,v,ang)` (poser la caisse au bord
  du virage i), `dbgFilet('va',s,v)`, `dbgFilet('pts')`, `dbgFilet('vol')`. Scratchpad : `filet.js` (plan vu de dessus + taux de
  rattrapage + rouleur), `filtrace.js` (un vol tracé par rapport à la route), `filvue.js` (ce que voit le joueur).
- **À juger par Sacha** : la bretelle (assez « route » ? trop longue ?), la fréquence (3 par zone), le montant des deux paiements, et
  s'il faut un repère visuel du filet (liseré, ligne de pièces sur l'arc de vol) — pas fait dans cet essai.

## LA FRÉNÉSIE SE PERD PLUS VITE — LOI 19 DE FLOW2 (2026-09-30 — session GAMEPLAY)
- Sacha (relayé par INTERFACE) : « la dark triad doit se perdre plus facilement après l'avoir obtenue, il faut continuer à jouer comme un
  malade pour ne pas la perdre ». Seule la TENUE bouge (la montée de la loi 18 est intacte) : `FLOW2.triade` mémoires 4 · 8 · 1,5 s (était
  7 · 15 · 2,2), brûlure [7 · 4,5 · 2,2 · −0,4] (était [5,5 · 3,5 · 1,7 · −0,6]) ; en VILLE 6 · 13 · 2,4 (était 11 · 24 · 3,5).
  MESURÉ (simtri2/simville2 de GRAPHISME, 5 min × 60) : tenue moyenne casse-cou 20 → 10 s, maître 25 → 12 s (ville 12 et 16 s).

## LA PASSE QUALITÉ DU 29/09 (nuit — session GAMEPLAY, Sacha : « regarde si tout fonctionne, il y a plein de petites imperfections »)
- Méthode : une partie jouée au banc sur les 4 niveaux + menus + mort (`tour.js <prefixe> [fr|en]`, diagnostics débordement / cibles /
  accents pixel / erreurs / programmes liés) et deux auditeurs en lecture seule (logique récente, textes). Zéro erreur en course, 0 programme
  lié aux changements de niveau ; l'ORAGE tourne à 48 i/s au banc (signalé à GRAPHISME).
- Corrigé ici : l'AIMANT en vol ne prend plus que la face où l'on vole (les jumeaux sous la dalle étaient aspirés À TRAVERS le bitume et
  payés deux fois : `fV9`) ; les restes de la chaîne d'ARGENT (le REPORT fabriquait une fausse figure au vol suivant, la mallette et le
  BATTEMENT DE CŒUR sonnaient encore, l'échelle criait « IL PLEUT DES BILLETS / JACKPOT ») ; le RALENTI de la frénésie s'arrête à
  l'explosion et au RECOMMENCER ; ~25 textes (virgules FR via `decFr`, astuce post-permis en FACILE, « PLUS QUE 2 VIES », accents de
  la bannière DÉFI RÉUSSI, mission « BRÛLE 20 S DE NITRO », « MULTI MAX » sur l'écran de fin, « en BAS = monte », la nitro au féminin,
  « ENCORE N PIÈCES POUR », TOUT EFFACER qui dit que l'argent part, frénésie et écran de crash dans la bonne langue, AURA ×2 = « TOUTE
  L'AURA COMPTE DOUBLE », triade de la ville dans l'ordre N·M·P et « DRIFT ! »…).
- Envoyé aux autres : LIGNE PARFAITE (INTERFACE, corrigé f0ad9c4), NITROOO jamais remis à zéro / relancé après AIR NITROOO, exposition
  et brume figées après un éclair (GRAPHISME), cashHudTick (UHD). Sons muets `nitrooo.palier` et `frenesie.cash` : absents de la banque
  (session SON). À TRANCHER PAR SACHA : l'ÉCONOMIE depuis que les figures ne paient plus (défis « ENCAISSE », prix du garage) ; deux
  niveaux nommés ORAGE (carrière Ville 5 et 4e niveau) ; « TRIPLE MONSTER » en anglais dans la version française.

## L'ENTRÉE DANS LA VILLE : DROITE SURÉLEVÉE, PUIS LA RAMPE (2026-09-29, nuit — session GAMEPLAY)
- Sacha : « quand on arrive dans la ville, la route doit commencer par être droite et surélevée le temps que le joueur s'adapte, puis la
  route descend dans la ville ». Niveau VILLE généré (`genCtrl`, pas les pistes dessinées de la campagne) : le DÉPART commun (110 m qui
  plongent de 70) est remplacé par une LIGNE DROITE quasi plate de 420×LV m, puis une GRANDE RAMPE droite de 520×LV m qui plonge de
  220×LV (adoucie par VILLE_PENTE : ~180 m de chute). Réglages `VILLE_ENTREE_R` (droite, rampe, chute, toit, etage). MESURÉ (banc
  `vil.js`/`vil2.js`, saut au niveau par `dbgSaut`) : droite finie à ~450 m, rampe à ~1 030 m, de −22 à −202 m.
- `buildVoxCity` plafonne les toits des tours qui bordent la droite SOUS la route (de 22 à 142 m, les plus hautes restant les plus hautes,
  `eEnt(i)` glisse de 1 à 0 le long de la rampe ; forêt proche aussi, l'horizon lointain garde sa hauteur) ; pas de réclame en l'air.
  La droite est NUE : ni plot, ni flaque, ni dos d'âne jusqu'à 80 m après la bascule (`sEnt` dans buildTrack). Zéro tirage `rnd` ou `vr`
  ajouté ou retiré : NUAGES et ORBITE sont identiques au tirage près. Hook `dbgVilleEntree()`.
- ⚠ En portrait, la route (56 m de large en ville) remplit le bas de l'écran : on voit surtout la ville AU LOIN sous l'horizon, puis
  les tours qui MONTENT autour de la rampe. Pour voir les toits défiler sur les côtés, il faudrait un cadrage plus large, pas des tours
  plus basses.

## LE SILLAGE DE NITRO v4 + LE BOUCLIER RETIRÉ (2026-09-29, nuit — session GAMEPLAY)
- Sacha (v3) : « retravaille la traînée de nitro : beaucoup plus belle, lisse et lumineuse, deux longues traînées derrière — il faut que
  ce soit magnifique » ; puis (v4) « plus belles et longues : de longues traînées RÉGULIÈRES jusqu'à 50 mètres derrière ; et selon les
  voitures, la nitro doit être adaptée pour SORTIR DU POT ». Les sillages DU JOUEUR (`SILS[0..3]`, `trailL`/`trailR` = les deux
  premiers) sont `mkSillage`/`sillageStep` (réglages `SIL`) ; `mkTrail`/`trailStep` restent ceux de la meute, du fantôme, du fourgon.
- UN SILLAGE PAR POT, né dans la bouche du pot (`CAR_POTS`, les mêmes points que les plumes `JETS`, 4 au plus) : un pot = une traînée
  plus large (`SIL.un`), 3-4 pots = 3-4 traînées plus fines. ⚠ La v3 tirait deux traînées de part et d'autre d'un pot central : elles
  ne sortaient d'aucun pot. AUDIT des 68 caisses (banc `pots.js`, hook `dbgJetsVoir(i,côté,dist,haut,longueur)`) : le relevé trouve les
  pots de 55 caisses, 3 les déclarent (`pots:` de la fiche), 10 retombent sur les pots CANONIQUES chromés dessinés par buildCar (la
  flamme sort bien de leur bouche) ; 12 n'ont qu'un pot.
- 50 MÈTRES RÉGULIERS : la longueur se compte en mètres de chemin (`LONG` 50), même largeur et presque même éclat de bout en bout, la
  queue s'éteint sur les 10 derniers mètres (`QUEUE`) ; lâcher la nitro éteint tout le sillage en ~0,9 s (`OFF`), là où il est.
  Un point tous les 0,6 m (45/s au plus), Catmull-Rom ; cœur fin qui blanchit à la tuyère + halo qui s'élargit, le feu refroidit
  vers le rouge-magenta au bout. Au SOL il file jusqu'au bas de l'écran (plus de coupe : `cutB` 9) ; EN VOL ce qui PEND tout droit
  sous la caisse est coupé à un tiers d'écran (`cutV` .34 — deux traits sous une caisse en l'air = « fils de marionnette ») ; ce qui
  part sur le côté (virage, vrille) se voit sur toute sa longueur (`kx`). Même matériau qu'avant : 0 programme compilé en course.
  Bancs `sil.js` `sil4.js` `sil5.js` (un pot / quatre pots / lâcher-rallumer) ; hook `dbgSillage()` (mètres, éclat par sillage).
- Sacha : « supprime le pouvoir bouclier ». Il reste CINQ pouvoirs (n a v m x) ; ses parts de tirage sont rendues aux autres
  (`pwrPoids`), le 1er cristal offert au débutant est un AIMANT. Plus de chute pardonnée par un cristal, plus de plots « DÉMOLI », plus
  d'huile neutralisée. Le seul filet qui reste est celui, en OPTION, du MODE FACILE (`facileSauve`, `facFilet`). Banc `bou.js`,
  hook `dbgPwr('cristaux')`. Les sons `pwr.bouclier*` et les traductions BOUCLIER ne sont plus appelés (laissés à la session SON).

## L'ENTRE-DEUX DE LA DARK TRIAD + NITROOO À 2 s (2026-09-29, soir — session GAMEPLAY)
- Sacha : « dark triad trop facile, trouve un entre-deux entre maintenant et avant ». LOI 17 de `FLOW2` (commentaire du bloc) : chaque réglage
  entre la v5 et la loi 16, montée resserrée d'un cran — cel .55/.42/.30/.25, gate .925, répit 2,75, fuite 2,4/2,8/3,2/2,4, pente .28,
  style 50 % dans la triade, mémoires 7/15/2,2, brûlure [5,5 · 3,5 · 1,7 · −0,6] ; VILLE 11/24/3,5, style 70 %. ×3 d'argent inchangé.
  MESURÉ (`simtri.js`) : 1re frénésie tranquille jamais (v5 jamais · loi 16 2 min 30), casse-cou ~2 min (jamais · 1 min), maître ~1 min
  (2 min 26 · 38 s) ; en frénésie 0/15/39 % du temps (v5 0/0/30 · loi 16 6/29/46) ; tenue ~16/18/25 s.
- « Le nitrooo doit se déclencher après 2 secondes de nitro » : `NTR_T` 3 → 2. MESURÉ en jeu (banc `ntr.js`) : déclenché à 2,02 s.
  ⚠ Au moteur de départ le réservoir dure ~2 s : NITROOO demande d'être déjà lancé (55 % de la vmax) ou d'avoir la réserve bleue.

## LES DAUPHINS, NOUVEAU DESIGN (2026-09-29) — « améliore le design des dauphins »
- **Avant** : le tube cyan pâle de Léo sous un halo additif laiteux (`dolGlowMat`), nageoires en plaques extrudées — délavé sur le ciel
  de jour, baveux de nuit, 8 meshes par dauphin. **Après** : LOW-POLY NÉON dans la DA des caisses à facettes (`mkDolphinGeo`, `DOL_PR`,
  `dolRobe`, `DOL_C`). UNE géométrie non indexée par dauphin (corps 22 anneaux × 16 pans, dorsale falciforme, pectorales, caudale en
  croissant, yeux — les nageoires sont des LENTILLES à facettes, `lentille()`), une couleur PAR FACETTE : dos indigo → violet, CAPE qui
  plonge en V sous la dorsale, SABLIER flanc avant ROSE / flanc arrière CYAN, ventre nacré, pointes de nageoires au néon (couleur > 1 que
  le shader allume). ⚠ `tri()` oriente chaque facette vers l'extérieur (point intérieur de référence) : garder ce garde-fou si on
  retouche la forme, sinon le tri des faces arrière troue le corps.
- **Shader `dauphin2`** (`dolShader`, onBeforeCompile sur `MeshPhongMaterial` à facettes) : ONDULATION dos-ventre du corps entier
  (`uDol` : amplitude, phase, nombre d'onde, CAMBRURE qui épouse l'arc du bond) ; SURFACE D'EAU invisible (`uSurf`, plan du banc à la
  hauteur de la gerbe) : sous elle `discard`, au ras une LIGNE D'ÉCUME lumineuse (`DOL_U.uEcume`) — le dauphin perce l'eau rostre en
  premier au lieu de gonfler dans la gerbe ; auto-éclairage × sa couleur ; LISERÉ néon rose (dessus) / cyan (dessous) sur les seules
  facettes de silhouette (`DOL_U.uRimK` ; large, il délavait le dos vu d'en haut). Un bond sur trois : une VRILLE (`u.vr`, ordre
  d'Euler `YZX` = autour du corps). Pendant la traversée de la surface, l'écume BOUILLONNE au point exact où l'axe la perce.
- **Perf** : ~790 triangles par dauphin (~4 200 avant), 1 appel de dessin (8 avant), 6 matières CLONES pour UN programme
  (`customProgramCacheKey` 'dauphin2' ; `this` dans onBeforeCompile = la matière du dauphin, ses uniforms à lui). MESURÉ au banc :
  `dbgProgs().n` identique avant et après le 1er banc, en ville, en orbite et en vol → compilé AU MENU. Gerbes et sillage passés aux
  particules v2 (programme `pt2` déjà compilé), avec garde-objectif (`pr` : fondu 3-7 m, 24-30 px). Zéro lumière, zéro allocation.
- **La PAUSE fige le banc** : `updateDolphins(dt,photo)` sort en pause (il nageait et s'usait derrière le panneau).
- **Hooks** : `dbgDolphins(sec,nb)` — `nb` = le banc complet d'entrée ; `dbgDolView(i,a,d,h,pas,ph)` = MODE PHOTO d'un dauphin (i = -1 :
  le banc), angle a dans le repère du banc (π = côté caméra de jeu), d/h en longueurs de dauphin, `pas` images de nage, `ph` = phase
  du bond visée (vrille coupée) ; téléobjectif 34° le temps de l'image, et l'image est lue DANS la même tâche (`dbgDolView.png`) —
  la boucle re-rend en pause avec le flou de boost figé, une capture d'écran classique ne montre pas la photo.
- Inchangé : la logique de la figure (`dolTick`/`dolStart`/`dolFin`/`dolKill`, aura, flow), `DOL_BANC`, `dolShow`/`dolIn`/`dolNb`,
  la taille lue sur la vraie caméra (`dolKS`/`dolW`).

## LA FRÉNÉSIE ×3 (2026-09-29, session UHD) — « en mode frénésie on doit gagner 3× l'argent, adapte ça de manière cool au gameplay ; rends la frénésie plus facile à obtenir ET à perdre »
- **L'ARGENT ×3** : `ECO3.flow[4]` 2 → **3** (les paliers d'avant inchangés : ×1 · 1,3 · 1,5 · 1,8). Toute la paie de course passe par
  `flowMult()` : pièces (déjà), butins de la ville `vPaie` (déjà), et désormais le **portail** (`denom×24×fever×flowMult`) et les trois
  **fins de monde** (NUAGES/ESPACE/VILLE, `denom×60×flowMult`). Les figures ne paient plus qu'en aura (session GAMEPLAY) ; les fruits ne
  donnent que de la nitro. Le multiplicateur moyen d'une partie (temps × palier, banc) : ×1,4 · 1,6 · 1,8 → ×1,7 · 2,1 · 2,3 (tranquille ·
  casse-cou · maître) — à surveiller côté économie.
- **LE RETOUR, « DE MANIÈRE COOL »** (le compteur d'argent est masqué sur téléphone : le ×3 se voit là où l'argent naît) — `frenCash(g,pos)`,
  juste après `frenNourrit`, appelé par la pièce, le portail et `vPaie` (ne fait rien hors frénésie) :
  · le **« $×3 »** de la bande du flow passe à l'OR (même recette en quatre bandes que le vert billet) et **bat or ⇄ rouge** (steps : deux
    repeintes par battement) ; chaque gain le fait **frapper** (`.cj1/.cj2`) et, au plus toutes les 0,4 s, en fait jaillir des pixels d'or
    (`pixCouleurs` : `.fM` → `PIX_OR`) ;
  · un petit **« ×3 » jaillit de la pièce** ramassée (`fx3Tag`, cinq `<i class="fx3">` recyclés, projetés depuis la position monde ;
    or plein cerné d'encre, braise rouge ; 0,7 s ; masqué mort/pause ; « réduire les animations » → simple fondu) ;
  · la gerbe d'or de la pièce grossit en frénésie (14 étincelles au lieu de 8) ;
  · **LE BUTIN** (`FREN.butin`, remis à zéro par `frenDebut`) : quand la frénésie tombe, « FRÉNÉSIE 0:18 · +$ 1,2 k » (le record, s'il
    tombe, garde la parole : la ligne doit tenir dans l'écran) ;
  · l'annonce d'entrée dit « CASH ×3 » (+ « · RECORD 0:42 » s'il existe) ; la 1re de la session garde « TIENS LES TROIS TRAITS ».
  CSS : `<style id="frenX3">` juste après `figTaille` (hex purs, pas de color-mix ; aucune plaque nouvelle dans les colonnes → rien dans hudTaille).
  **Son** : `sfx('frenesie.cash')` — chaque gain en frénésie, par-dessus le son de la pièce, au plus toutes les 90 ms : TROIS micro-pièces
  qui montent en 60 ms (le ×3 qui s'entend), une octave au-dessus de la pièce, + poussière d'or ; 3 variantes (bloc FRENCASH de
  `atelier-son/recettes.js`, banque v6). Mesuré au lecteur : 3 dB sous la pièce en sonie (−37 contre −34 LUFS200) — il la couronne, il ne la couvre pas.
- **PLUS FACILE À OBTENIR ET À PERDRE** — loi 16 de `FLOW2` : montée cellules .6 · .5 · .4 · .4 (v5 .5 · .35 · .22 · .14), pente .15 (.4),
  fuite ×0,6 = 1,8 · 2,1 · 2,4 · 1,8, répit 3 s (2,5), style dans la triade .7 (.35), `gate` .9 (.95, non simulé), la route toujours hors
  de la triade ; tenue : mémoires NARCISSE 6 s · MACHIAVEL 12 s · PSYCHO 2 s (9 · 25 · 3), brûlure [6 · 4 · 2 · −0,3] ([4 · 2 · ,7 · −1,5]),
  retombée 75 inchangée, zone rouge 88 inchangée. Ville (loi 15) : mémoires 9 · 16 · 3 (13 · 32 · 4), style triade .8 (.6), même brûlure.
- **MESURÉ** (`simtri.js`, le vrai bloc, 5 min × 60 parties ; copie `simx.js` = + tenue médiane, frénésies/partie, multiplicateur moyen —
  scratchpad b76e6ad3/frenx3) :

  | joueur | 1re frénésie AVANT | APRÈS | en frénésie AVANT | APRÈS | tenue moy. AVANT | APRÈS |
  |---|---|---|---|---|---|---|
  | tranquille | jamais (100 %) | **2 min 32** (5 % jamais) | 0 % | 6 % | — | **9 s** (~2 par partie) |
  | casse-cou | jamais (100 %) | **59 s** | 0 % | 29 % | — | **13 s** (~7) |
  | maître | 2 min 26 | **38 s** | 30 % | 46 % | 77 s | **18 s** (~8) |

  Avec le dauphin (`DOL=1`) : 2 min 20 · 56 s · 39 s, mêmes tenues. Banc en jeu (390×844, muet, `dbgFren('entre')` + pilote auto) : les
  pièces ramassées en frénésie font bien jaillir leurs « ×3 », `dbgFren().mult` = 3, le butin s'additionne ; traits nourris puis lâchés,
  la frénésie tombe ~7 s plus tard. Hooks : `dbgFren('cash'[, montant])` (le retour d'un gain, sans toucher au compte), `dbgFren()` rend
  `mult` et `butin`. ⚠ Si Sacha la trouve encore trop présente : durcir la TENUE (`brule[2]`, mémoires), pas la montée.

## LES NUAGES v4 — PLUS DE FORMES, DES TAILLES HIÉRARCHISÉES (2026-09-29, Sacha à la session GAMEPLAY : « des formes plus aléatoires et belles à regarder, des nuages de tailles différentes — c'est le premier niveau, il faut que ce soit magnifique »)
- MESURÉ avant (banc `ciel.js` : partie aux NUAGES, ciel `matin` forcé, captures 390 × 844 au sol et en vol) : 6 gabarits pour ~350 nuages
  (les mêmes silhouettes partout, de grosses boules qu'on comptait), tailles tirées en uniforme, en vol un tapis de pâtés identiques.
- `cotonAleat(genre,rng)` : 8 gabarits de plus, tirés à chaque session (indices 6-13) — HUMILIS ×2, MEDIOCRIS ×2, CONGESTUS ×2, CASTELLANUS,
  FRACTUS. Base PLATE + bourgeons RONDS (la forme classique voulue le 28/09), tours empilées qui s'affinent et penchent, bourgeons
  d'épaule, CHOU-FLEUR au sommet ; ≤ 22 bourgeons. `S.fin` (taille moyenne des bourgeons / .34) allège la finesse choisie par `cotonTick`.
- Chaque instance a son ÉTIREMENT (largeur ×0,82-1,45, hauteur ×0,78-1,3 ; `COTON_ST` = 10 flottants par nuage). Tailles en LOI DE
  PUISSANCE (`cotonR`) : beaucoup de petits, quelques géants. Trois TOURS HÉROÏQUES (congestus) à 520-900 m du couloir ; massifs et
  titans piochent dans les congestus. `COTON_KINDS` 14, `COTON.cap` 480, poids `COTON_POIDS` à 14 entrées.
- Coût : triangles envoyés 165-200 k (avant 171 k), 0 programme compilé en course (mesuré), un appel par lot (gabarit × finesse) non vide.

## L'IMPACT DANS LES IMMEUBLES v2 (2026-09-29, Sacha à la session GAMEPLAY : « retravaille sérieusement l'impact, sans que ce soit trop gourmand, mais plus travaillé »)
- MESURÉ avant (banc `crash.js` : partie → VILLE → `dbgImpact('crash')` lance la caisse dans la tour la plus proche → film de la mort en
  390 × 844) : un trou NOIR plat cerné d'orange en étoile (un autocollant), plus rien après la boule de la caisse.
- `VILLE_IMPACT` (shader des tours, mêmes deux uniformes, compilé au menu — linkProgram = 0 pendant l'impact, mesuré) : bord en bruit de
  valeur sur l'angle (3 octaves bouclées) ; CAVITÉ (épaisseur de béton, dalles éclairées par le brasier, fers à béton, langues de feu à
  trois ondes sans rapport) ; onze LÉZARDES de braise qui serpentent hors du trou (écart angulaire SIGNÉ — `abs()` les dédoublait en
  boucles) ; SUIE étirée vers le haut ; lèvre blanche puis rouge ; ONDE DE CHOC sur la façade ; les étages autour CLIGNOTENT (courant).
- `villeImpact` : rayon selon la vitesse du choc (3,4 → 6 m, borné par la façade) ; 32 morceaux (béton, DALLES, FERS À BÉTON rougis, verre) ;
  `impactBouffee` = deux répliques de feu (0,3 et 0,72 s) ; `villeImpactTick` : verre qui PLEUT le long de la façade 1,1 s, FLAMMES qui
  lèchent la façade et FUMÉE 8 s (le feu retombe sur les 3 dernières). Aucune lumière, pools existants seulement.
- Bancs : `crash.js <prefixe>` (scratchpad 4b30b603, `crash/`) — `dbgImpact('crash')` est le crochet de test.

## LES FIGURES NE PAIENT PLUS QU'EN AURA (2026-09-29, Sacha : « les figures ne doivent plus rapporter d'argent, seulement de l'aura »)
- `tryLand` : plus de `money+=gain` à la pose, plus de caisse enregistreuse (`fxArgent`), plus de billets volants (`flyCash`), plus de
  « +$ » dans le verdict. `gain` ne dit plus que « cette pose porte une figure » : aura (chaineAura), flow, nitro, verdicts de l'annonceur et
  PIÈCES DU MOTEUR (`addCoins`, une ressource de la partie, pas de l'argent) restent — à trancher par Sacha s'il veut aussi les retirer.
- Portail traversé en vol : la chaîne d'argent n'est plus « ENCAISSÉE » (la figure compte dans `runStats.tricks`). Explosion en vol : plus de
  mallette d'argent perdue ni d'ASSURANCE (`insUsed` ne sert plus) — la chaîne d'AURA part en fumée (`chainePerdue`).
- L'argent vient désormais des pièces ramassées, du portail et des primes de campagne (les fruits ne donnent que du nitro). Vérifié : saut de 2,3 s avec la figure
  DAUPHIN posé → argent inchangé, aura versée à l'encaissement de la chaîne (banc `argent.js`, scratchpad 4b30b603).

## LES NUAGES v7 — DES FORMES DE COTON, PLUS DES GRAPPES DE BALLONS (2026-09-29, nuit — session INTERFACE, avec l'accord de GRAPHISME)
- Sacha : « apporte plus de soin aux nuages, il faut qu'ils soient plus beaux dans leurs formes ». MESURÉ sur captures (dragon.js) et
  sur une planche STUDIO des 24 gabarits (`dbgCotonPlanche({k,c,s,w,d})`, banc `planche.js` — gros plan : `PL='{"k":[0,2,12,22],"c":2,"s":58,"w":118}'`) :
  les nuages se lisaient comme des GRAPPES DE BALLONS (un reflet par bourgeon, une ligne sombre à chaque soudure), les tours comme des
  PILES D'ŒUFS (étirement vertical ×1,3 sur des bourgeons ronds), pas de détail fin.
- **Normale de CHAMP** (`cotonGeo`, part `COTON.CH` .45) : la lumière suit un champ lisse (gaussiennes du bourgeon et de ses voisins) mêlé
  à la normale de la boule — une masse de ouate aux bosses rondes ; le creux d'une soudure .3 → .17. ⚠ À .72 le nuage devenait un galet
  lisse (essayé) : .45 garde le relief des bourgeons.
- **Chou-fleur** (`cotonChouFleur`, hasard à part `mulberry32(0xC0F1E5)`) : 2-3 petits bourgeons ronds (×.38-.56) sur le haut de chaque
  grand bourgeon rond au-dessus du tiers bas (32 au plus par gabarit) ; pas sur les fractus ; `fin` (finesse) inchangé.
- **Bourgeons qui restent ronds** : étirement vertical .85-1,15 (était .78-1,3), largeur .86-1,3 (était .82-1,45) — même nombre de tirages.
- **Tours bosselées** : montée .5-.66 r (était .62-.82), épaules .7 (était .45), castellanus 3-4 tourelles plus épaisses (.24-.3).
- Essayé puis écarté : un relief de surface par bruit (aux finesses grossières, des pointes). Verdicts tenus : base PLATE, bourgeons
  RONDS, pas de chenille. Mesuré : **0 programme lié en course** (tour.js, 3 niveaux), triangles envoyés sous le budget ~80k.

## LE SILLAGE DE NITRO v5 (2026-09-29, session INTERFACE, repris de GAMEPLAY) — « plus longue, plus large, que les flammes du pot suivent la ligne de nitro, fais un truc parfait »
- **Plus longue** : `SIL.LONG` 50 → 75 m, `QUEUE` 10 → 18 m, `N` 100 → 150 points (~90 m de réserve même au pas de 0,6 m).
- **Plus large** : cœur `wC` .075 → .15, halo `wG` .22 → .40 (et `wGa` .6 : il s'élargit encore au loin). Les plafonds près de l'objectif
  deviennent des réglages (`capC` .011 → .022, `capG` .06 → .10) : au sol la traînée file vers le BAS de l'écran, donc tout près de
  l'objectif — c'est là qu'elle était un fil. Toujours additive et sombre (`halo` .5, ×.74) : pas de faisceau aveuglant.
- **La flamme suit la ligne** : `sillageStep` calcule la direction des ~1,8 premiers mètres du sillage (`tr.dX/dY/dZ`, `tr.dOk`) ; dans la
  boucle, chaque plume (`JETS.shells[i]`, `cores[i]`) s'y couche (`JET_DIR[i]`, repère caisse via `JET_QI`, lissé, au plus 70° de la
  poupe), la rotation propre de l'enveloppe passe en quaternion (`JET_QS`). En virage, en glisse, en vrille : la flamme se plie dans son
  sillage. Sans sillage (filage, repos), elle reprend l'axe de la caisse.
- Gardés (rejets de Sacha) : pas de tapis (face caméra + fondu dans l'axe), pas de fils de marionnette en vol (`cutV`), pas d'aveuglement.
- Banc : `sil4.js` / `sil5.js` (copies de ceux de GAMEPLAY) ; mesuré 0 programme lié en course, 60 i/s.

- **v6 (même soir)** — Sacha : « en l'air les bandes s'arrêtent, je veux qu'elles continuent sur 50 m ; plus grosses, plus travaillées,
  qu'elles émettent vraiment de la lumière ». ⚠ **Il a levé lui-même la coupe des « fils de marionnette »** (verdict du 29/09 matin) :
  `cutV` = `cutB` (plus de coupe en vol). Et la vraie cause de la bande qui « s'arrête au milieu de l'écran » : un point passé DERRIÈRE
  l'objectif valait « 9 » et la coupe s'interpolait vers cette valeur factice → désormais on coupe au vrai plan de la caméra (profondeur
  `SIL.pres` .6, interpolée dans l'espace) et la bande y fond (`dC`) : elle file hors de l'écran. En vol le fondu « vu dans l'axe »
  (anti-tapis, pensé pour le sol) devient très doux (`axeV`). Plus gros : cœur .21, halo .56 (+.9 au bout), plafonds .03/.13. Lumière :
  `coeur` 1.3, `chaud` .9 (le bloom l'attrape), halo .62 ; **pouls** d'énergie qui coulent vers la queue (`pouls` .55, `poulsV` 30) ;
  **braises** crachées sur toute la longueur (`braise`, réserve à part `silBraises` à la couleur du feu, montée 2 m/s). Pas de lampe au
  sol (`trailLight` reste à 0 : la tache ronde est refusée depuis le 26/09). Mesuré : 0 programme en course, 60 i/s.
- **v6b** — « encore plus longue, 100 mètres » : `LONG` 100, `QUEUE` 24, `N` 200 (~120 m de réserve au pas de 0,6 m), `VMAX` 8 → 12 s
  (100 m dès 30 km/h). Mesuré sur une caisse à 4 pots, stabilisée : 16,7 ms par image à 100 m contre 18 à 10 m — le coût se perd dans le bruit.

## LA LIGNE PARFAITE (2026-09-29, session INTERFACE) — « alterner fruit et booster pour aller à fond tout le temps avec une trajectoire parfaite »
- Avant : pads au hasard tous les 280-560 m, fruits au hasard dans les motifs de pièces ; même en prenant tout, la nitro tenue (−1/s,
  +0,2/s) s'éteignait. Désormais **UNE file FRUIT, PAD, FRUIT, PAD…** (`LIGNE`, `ligneTick(dt)` appelée après `pwrTick`) posée **EN
  COURSE**, `LIGNE.voir` = 3,5 s devant la caisse, espacée de `LIGNE.dt` = 1,2 s à la vitesse RÉELLE d'avance de `s` (NITROOO jusqu'à
  +80 % et VITESSE ×2 compris, + l'accélération prévue). ⚠ MESURÉ : une file précalculée sur la croisière du moteur mettait un objet tous
  les 38 m (4 par seconde à 527 km/h) ; sans NITROOO dans le calcul, elle arrivait 1,5× trop serrée.
- Placée sur la **trajectoire** : centre en ligne droite, corde dans les virages (`ligneLat`, courbure latérale sur ±40 m, ×1600, borné à
  62 % de la demi-route). Saute trous, couloirs de tremplin, portes de plots (`campPadNon`) et chaînes de néon de la VILLE (`ligneBloque`) ;
  un objet sans place saute et le suivant garde son type. Deux faces (miroir). **Aucun rnd()** : la boucle des pads au hasard et les
  fruits des motifs gardent leurs tirages mais ne posent plus rien (`LIGNE.on`). Parc et auto-école : inchangés.
- **Chaque objet rend `LIGNE.don` = 1,15 s de nitro** (fruit → réserve bleue, pad → `nitroGain`) au lieu de 20 % / 0,12. Le pad de la
  file ne subit pas la recharge de 1,5 s du précédent (il ne se prend qu'une fois, `padPris`) ; fruit et pad de la file se testent aussi
  sur le TRAJET de l'image (à 600 km/h et 30 i/s, 5,6 m par image).
- Programmes : fruits et pad chauffés au menu (`chauffeDivers`) — MESURÉ 99 → 99 programmes pendant la course.
- Banc `ligne.js parfait|suit|centre ms` (hook `dbgLigne('parfait')`) : trajectoire parfaite = 100 % des objets, nitro allumée 99,7 % du
  temps sur 60 s (627 km/h de moyenne) ; le pilote auto du jeu (imprécis) = moitié des pads, nitro éteinte 13,6 %.
- ⚠ Conséquence : un pad ≈ toutes les 2,4 s → « BOOST » (en petit) et « RÉCOLTE / RAFALE » bien plus fréquents.
- **Vies du mode FACILE** re-mesurées sous le compteur d'argent ET sa ligne de gain : hudH+120 debout / +103 couché ; debout elles
  s'effacent en vol (le chrono de vol prend leur place).

## L'ÉCRAN DE FIN v5 (2026-09-29, session INTERFACE) — « pas joli ; on ne compte pas l'aura, c'est le score d'une partie ; l'argent plus en avant »
- ⚠ **Verdict qui remplace celui du 25/09** (« l'argent n'est pas important quand tu es mort — c'est l'aura et le moteur ») : l'ARGENT est
  le héros de l'écran. `.mCashL` = une plaque verte : « VERSÉS AU COMPTE », le montant au plus gros corps (`--f8`, réglé sur sa longueur
  `--n` pour tenir debout), et « COMPTE : $ 128 k » dessous (`#mCashTot`).
- **L'AURA = le score de la partie** : la carte dit le nombre SANS « + », et dessous « MEILLEUR 52 110 » (`SAVE.d.auraMax`) ou RECORD !
  Plus de total de carrière, plus de rang ni de jauge sur cet écran. (Le total `SAVE.d.aura` et les rangs existent encore ailleurs :
  en-tête du garage, POSTER 84 au rang MYTHE — question posée à Sacha.)
- **Debout** : titre → argent → cartes AURA | MOTEUR → chiffres → missions → tuiles → MENU | REJOUER (`order`).
- **Couché** (l'écran de l'ordi, 844 × 390) : grille « over obj / cash obj / hero stats / hero row / hero rej » — à gauche le titre,
  l'argent et les deux cartes étirées jusqu'en bas ; à droite les missions (même hauteur que titre + argent), les chiffres, les tuiles,
  MENU | REJOUER. Plus de trou. Petit téléphone couché (≤ 760 px) : tuiles pictogramme au-dessus du mot. Section 29 de `charte4`.
- Banc : `mortv5.js W H lang tag` (vraie partie au pilote auto, mort, capture, chevauchements, défilement).
- **Écrans courts** (section 30 de `charte4`, relevé par DEBUGGING) : iPhone SE dans Safari (375 × 553) et 320 × 568 — REJOUER tombait
  SOUS le bord. Palier ≤ 700 px : titre sur une ligne, moteur plus petit ; palier ≤ 620 px : tous les blocs resserrés (aucun retiré).
  Mesuré (titre « NOUVEAU RECORD ! », le plus long) : REJOUER finit à 526/553, 546/568, 649/667, 646/664, 802/844.
- **Les vies du mode FACILE** ont descendu d'un cran (`#facVies` à hudH+120 debout / +103 couché, voir LA LIGNE PARFAITE) : le compteur d'argent `#cashHud`
  (session UHD) a pris leur place sous la pause.

## MOINS DE TEXTES AU MILIEU DE L'ÉCRAN (2026-09-29, session INTERFACE) — « il y en a trop »
- Sacha a reçu la liste numérotée des 74 textes du centre (course) et a rayé : **1 VIRAGE SERRÉ, 2 FRÔLÉ !, 4 PORTE !, 5 RASE-BORD,
  13 MINI/SUPER/ULTRA TURBO, 29 les pastilles sous le verdict (FACE CACHÉE ×2, PILE AU CENTRE, POSÉ LOURD)**. Le geste rapporte toujours
  son aura — `chaineAuraMuette()` = `chaineAura` sans le pop au-dessus de la caisse. Le SLALOM (n° 3) reste. **Ne pas les rallumer.**
- **BOOST** (pad) en plus petit : taille 46 → 28 (17 px mesurés). **Pouvoir ramassé** : le NOM seul, 40 → 26 (16 px), plus de sous-titre,
  plus de « +6 S » à la reprise, plus de « DOUBLE / TRIPLE POUVOIR ! » (l'aura compte).
- **DAUPHIN** (récapitulatif à la pose, `#dolHud`) : plus petit (11 px) et **en eau** — une lettre = un `<i>` qui ondule sur sa phase
  (`dolVague`), dégradé écume / lagon / marine, une vague de pixels qui coule dessous (`::after`, `--dolVagueM`, `dolCoule`). Section 28
  du `<style id="charte4">`.
- Mesure (banc `textes.js`, 2 min de pilote auto, route seule) : 76 textes avant, 52 après. Le reste : RÉCOLTE/RAFALE (fruits), carte
  moteur, +N KM/H, paliers de vitesse, DÉMOLI, défis.

## LE MODE FACILE + « POUCE HAUT EN VOL » (2026-09-29, session INTERFACE) — « simplifier l'expérience mobile pour un public jeune »
- **Sacha a choisi lui-même l'EXCEPTION à « zéro assistance », mais EN OPTION** (tout public visé). Tout passe par `facOn()`
  (`SAVE.d.facile`, et jamais au parc). **En mode NORMAL, rien ne change au bit près** — ne jamais laisser une aide fuir hors de `facOn()`.
- **Les quatre aides**, chacune sur une ligne du moteur :
  · VIRAGES : la caisse suit 80 % de chaque virage (`FAC_VIRAGE` dans la ligne `psi-=dyaw*…`) et, pouce lâché (|steer|<.1, hors drift),
    le cap revient dans l'axe (`FAC_CAP`). Banc 25 s mains libres : NORMAL sort et explose à ~20 s, FACILE 0 chute (écart max 41 % de
    la demi-route).
  · VOL : `airMax()` ×10/6 (10 s au lieu de 6 ; le chrono en barre suit, il lit `airMax()`).
  · 3 VIES : `facileSauve(cause)` en tête d'`explode` (le bouclier, qui passait avant, est retiré le 29/09). Mêmes causes (vide, air,
    tour — jamais une mort de règle), même remise à zéro, `respawn()`, annonce « PLUS QUE 2 VIES / ON REPART ! » puis « DERNIÈRE VIE ! ». La chute
    perdue d'avance est rattrapée à 2,2 s comme sous bouclier (`facFilet()`). Cœurs du HUD : `#facVies` en haut à droite sous la pause
    (zoom `--hudK`, caché pendant la leçon, la pause et la mort), remis à 3 par `facDepart()` — dans `resetGame()` ET `start()`
    (la 1re partie de la session ne passe pas par `resetGame`).
  · POSE : `tryLand` accepte 5 m au-delà du bord (`facBord()`, la caisse est ramenée dans la largeur), pose ratée à +30° ; le viseur
    s'allume sur la même zone.
- **Le 1er JOUER demande le mode** (`facChoix()` : FACILE vert / NORMAL, Échap = NORMAL) tant que `SAVE.d.facile` n'a jamais été posé et
  que la leçon n'est pas faite. Interrupteur **MODE FACILE** dans RÉGLAGES › JEU.
- **POUCE HAUT EN VOL : PLONGE / MONTE** (`SAVE.d.volH`, `volSens()`) : multiplie les deux lectures de `TCTL.sv` en vol ; d'origine
  PLONGE (manche d'avion). L'ASTUCE du vol dit le bon sens. Le clavier ne change pas.
- Banc : `fac.js w h lang` (choix, cœurs, 3 chutes, mains libres NORMAL/FACILE, réglages) ; hook `dbgFacile('mort')`.

## LES 10 PREMIÈRES MINUTES — CÔTÉ INTERFACE (2026-09-29, session INTERFACE)
- **PASSER demande** (`tutoPasse`/`tutoPasseRange`) : 1er appui → le bouton devient « VRAIMENT ? » (rouge), l'en-tête dit « PERMIS +$ 500 »
  (or) ; 2e appui dans les 3 s → `tutoFin(true)`. La question reste DANS la carte (pas de modale : la caisse roule pendant la leçon).
  Permis déjà payé (REVOIR L'AUTO-ÉCOLE) → un seul appui. Réglages : « REVOIR L'AUTO-ÉCOLE » porte « +$ 500 » (`#mvTuto`) tant que la prime
  n'a pas été versée.
- **Le permis se fête** : grande annonce centrale « PERMIS OBTENU ! +$ 500 » (`slamMontre` tenu 1,6 s), puis, la 1re fois, l'ASTUCE
  « Fini l'entraînement : UNE SEULE VIE. En l'air, pose-toi avant la fin du chrono. » (la leçon ne tue pas et prête l'airtime).
- **Raté du coach sur une ligne** : « SORTI ! SUIS LA ROUTE », « RATÉ ! NITRO, VISE LE DESSUS » (la carte montait à 31 % de l'écran).
- **Écran de mort** : carte « MOTEUR ATTEINT » (il repart de zéro à chaque partie) ; « À 2 PIÈCES DU ▲ 3 CYLINDRES » (`presqueTxt`, FR/EN/ZH)
  au lieu de « PLUS QUE 2 PIÈCES » (lu « il m'en faut 2 pour l'acheter ») ; **pastille GARAGE** `#bdGar2` (même compte que l'accueil) ;
  le garage ouvert depuis une tuile se pose sur la caisse la moins chère qu'on peut s'offrir (`garPortee`, une fois par caisse et par
  session — inopérant tant que `TEST_CAISSES=true`, qui débloque tout).
- **Leçon quittée** : la modale dit « Tu reprendras la leçon au prochain départ : le PERMIS et sa prime t'attendent » ; l'écran de fin
  n'affiche aucun RECORD et le lingot dit **REPRENDRE** (le texte vit dans le `<span>` que la règle « tient dans le lingot » dimensionne).
- **Carrière avant le permis** : un niveau autre qu'AURORE lance AURORE avec le toast « PASSE D'ABORD TON PERMIS » (tant que la leçon n'a
  été ni passée ni sautée).
- **La caisse gagnée aux MISSIONS** (VA LA VOIR) : une gerbe sur ÉQUIPER à l'arrivée au garage.
- Écarté : la cause de mort pendant l'explosion (verdict de Sacha : « la caisse qui explose l'a déjà dit »). Banc : `dix.js w h lang`
  (PASSER, permis, mort, réglages, leçon quittée — son coupé) ; hook `dbgTuto('permis')`.

## LES 10 PREMIÈRES MINUTES — CORRECTIFS DE JEU (2026-09-29, audit de la session INTERFACE, corrigé par la session GAMEPLAY)
- **Après le permis, NUAGES et pas VILLE** : la piste de l'école occupait la zone 0, le portail menait à `NIVEAUX[1]`. `LVL.tutoZ` (posé par
  `lvlChoisir` au départ de chaque partie) décale le compte : après la leçon, NIVEAU 1 = NUAGES, puis VILLE. Mesuré (`ecole.js`).
- **Le 1er cristal d'après la leçon est un AIMANT** (le BOUCLIER jusqu'au 29/09 ; `pwrPremier` compare `runStats.zones` à `LVL.tutoZ`) ; **aucun cristal sur la piste
  de l'école** (`spawnPickups` saute les pouvoirs sur `piste:'tuto'`, APRÈS les tirages : le flux seedé ne bouge pas).
- **Une leçon QUITTÉE n'est pas une partie** (`commitExploits` : ni compteurs, ni aura, ni record — la banque seule) et **pas de
  « RECORD BATTU » pendant la leçon**.
- Laissé à Sacha (décisions de jeu, pas des bugs) : l'airtime prêté à POSE-TOI (le chrono des 6 s n'est jamais vu à l'école), la leçon
  quittée qui repart à 1/5, le défi « ENCAISSE $200 » (argent masqué en course), les rangs d'aura 1-5 sans récompense, la carrière
  AURORE = la piste de l'école, le logo de 1,9 s à chaque REJOUER, une prime du jour.

## LES CLASSIQUES DE LA BOUTIQUE EN FACETTES (2026-09-29) — « enlève toutes les parties arrondies des voitures du shop, ça ne colle pas avec la DA poly »
- La boutique vend 13 légendaires : les 6 de la gamme des 50 (kit low-poly, déjà taillées) et 7 CLASSIQUES du vieux kit (CHAT POP-TART,
  REQUIN, COMÈTE, FORMULE OR, LE MANS 24, EL PATRON, ACIDE : gabarits `poptart`, `requin`, `proto`, `formula`, `lemans`, `hyper`, `tuner`)
  faites de boules 16 × 12, de cylindres 12-16 côtés et d'un loft 52 × 24 en normales LISSÉES.
- `facetteCaisse()` (juste avant `buildCar`, appelée en fin de buildCar avant que la caisse rejoigne `carBody`, si `FACET_SHAPES[shape]`
  ou `spec.facette`) : boule 8 × 6, cylindre/cône ≤ 8 côtés, tore 4 × 10, cercle/tour ≤ 8, et TOUTES les pièces non plates en normales
  PLATES (non indexé + normales recalculées). Aucune matière touchée (pas de `flatShading` : un #define = un programme de plus) ; le kit
  `lp`, le sol (`sol`), les plumes de réacteur restent tels quels. Loft du requin 52 × 24 → 18 × 10. Roues des classiques : octogones.
- Vérifié : planche avant/après des 13 (banc `shop.js` + `planche.py`, scratchpad 4b30b603 `shop/`), les 13 équipées sans erreur (≤ 17 ms),
  course en CHAT POP-TART sans erreur. `dbgFacette(false)` rend les caisses d'avant.

## LA PASSE DE SORTIE (2026-09-29) — « balade-toi dans tout le jeu… fais-le en mode ultra complet, imagine que le jeu sort demain »
Session INTERFACE (worktree `CCG-transitions`). Une partie complète jouée au banc (`balade.js` : premier lancement, auto-école, vraie course,
vol, pouvoirs, frénésie, pause, mort, missions, garage, carrière — debout, couché, anglais, encoche simulée `NOTCH=1` de `tour.js`), puis
QUATRE audits en lecture seule (App Store, textes FR/EN, logique des écrans, iPhone). Commits be8f7e8 → 824b502.
- **Écran de mort** (Sacha : « le texte sous GAME OVER sert à rien, les fenêtres AURA et MOTEUR sont trop grandes ») : section 23 de charte4 —
  `#mCause` masqué ; cartes qui épousent leur contenu ; couché : on LIT à gauche (verdict, cartes, ticket aligné sur le bas de REJOUER), on
  TOUCHE à droite.
- **Le plancher du pixel** : aucune étiquette du HUD sous 8 px EFFECTIFS (`hudTaille`) ; #misBan et #coach hors de l'échelle ; en auto-école
  les pouvoirs passent sous la carte ; « RATÉ ! ON RECOMMENCE » 2,6 s puis la progression revient (`tutoAffiche._t`).
- **Le verrou du double-tap** : `uiGarde(ms)` (320 ms, clics `isTrusted` seulement — les `.click()` programmés passent), posé par `mGo`
  (hors `sansSortie`), `feuilleOuvre/Ferme`, `carrVue`. Banc `doubletap.js`. ACHETER → ÉQUIPER : `#gEquip.arme` 420 ms.
- **Garage** : un seul pointeur pilote l'orbite (`gpId`, `gPince`), rien à travers `#wipe/#carr/#modale`, Échap ignoré sous un voile.
- **Sous le voile** : `playViaGarage(tuto)` (tutoArme dans le voile), `carrLancer` → `ecranWipe(carrLancerSous, garageLaunch)`.
- **Écran de mort, données** : `RUNX.verse` figé à la mort (endGame) ; `mFill._mort` : le compte ne se rejoue qu'à la 1re apparition ;
  `window.__mRetour` : VOIR (missions) → garage → retour revient aux MISSIONS (vidé par garageLaunch).
- **Arrière-plan** : course démarrée pendant que l'appli dormait → `panOpen(true)` au retour ; parti pendant le 3-2-1 → panneau rouvert.
- **iPhone** (section 24 de charte4) : `touchmove` laisse défiler `#carr` et `#modale` (bloqués au doigt !) ; tap-highlight, user-select,
  text-size-adjust, overscroll ; `.volS` pouce 32 × 44 ; `.gNav` 54 × 70 ; `#modC` 16 px ; saisie du record couchée dans sa case ; `--tx3`
  #9a90c8 (contraste) ; `max-width:360px` (Affichage agrandi) ; `matchMedia` suit « Réduire les animations » en direct.
- **Zoom du HUD** : `zRect(el)`/`zK(el)` = rectangle À L'ÉCRAN identique Chrome ≥ 128 et ancien WebKit (pixBurst, frenEntre).
- **Robustesse** : le chien de garde vérifie qu'une erreur REVIENT (1,5 s) avant l'écran de crash, qui a une phrase au joueur et RELANCER ;
  fond `#07050f` (plus de flash blanc) ; contexte WebGL perdu au retour → relance.
- **Textes** : bloc i18n (les 50 caisses FR → EN, ponctuation, libellés courts, anglais américain) juste avant `// ⚠ nommée TR et non T` ;
  `fmtC` : « $1.5k » en anglais, « $ 1,5 k » en français ; aria-label traduits par `applyLangDOM` ; punchlines en police système avec accents.
- **LAISSÉ À SACHA (bloquant pour une vraie sortie)** : `TEST_CAISSES`/`TEST_CARRIERE` à true ; BOUTIQUE sans achats (vitrine, « -50 % »
  fictif, RESTAURER factice, prix en € en dur — StoreKit ou masquer) ; sons d'origine tierce encore joués (`wow.mp3`, `death/minecraft.m4a`,
  `eww.m4a`) ou livrés (`kaching`, `compteuse`) ; musiques Suno (dont une « Cover ») et voix ElevenLabs (preuve d'abonnement) ; « CHAT
  POP-TART » (Nyan Cat) et noms de marques (QUATTRO, STRATOS, DAYTONA, ELDORADO, VETTE, LE MANS 24) ; côté Mac : icône 1024, PrivacyInfo,
  cible iOS 16.4, `contentInset:'never'`, plugins haptics/preferences, ne pas embarquer CLAUDE.md/README/atelier-son/sons.html.

## LE RALENTI DE LA FRÉNÉSIE + L'AIMANT DE 50 m (2026-09-29, session GRAPHISME, demandes directes de Sacha)
- **« quand on débloque la frénésie, rajoute un ralenti le temps que le texte parte »** (`RALENTI`, `ralentiPose`, `ralentiDt`) :
  SEULE exception au verdict du 26/09 (« enlève tous les modes ralentis ») — `slowT`/`hitT` restent vidés à chaque image. Posé par
  `frenDeclenche` : le temps du jeu tombe à ×0,3 en 0,1 s, tient, et revient en douceur (smootherstep de 45 % à 100 %) sur 2,7 s
  RÉELLES = la vie de #frenTitre (TRIPLE MONSTER, `ftVie`). Appliqué à `dt` dans la boucle APRÈS les mesures de perf (elles gardent
  le temps réel). La pause le fige, la mort l'annule. Mesuré : 56 → 17,7 m/s pendant ~1,5 s, retour plein à 2,7 s. `dbgRalenti(d,k)`.
- **« l'aimant doit aimanter toutes les pièces, augmente grandement son rayon, genre 50 m »** (`MAG_R`) : la v2 ne prenait que
  DEVANT (55 m), laissait l'or du CIEL au sol et s'arrêtait à 34 m en vol. v3 = une SPHÈRE de 50 m autour de la caisse, sol et vol,
  devant/derrière/côtés/au-dessus, sur ta face (l'autre est le miroir : la prendre paierait deux fois) ; traction 5 + 25·(1−d/R)² /s —
  une pièce dépassée doit RATTRAPER la caisse (à 13/s elle calait à 4,3 m, hors du ramassage de 3,8 m). Mesuré sur 10 s :
  20/20 pièces de la sphère prises (11/17 sans aimant). Banc : `dbgPwr('sphere')` puis `dbgPwr('spherePris')`.

## LA PASSE « JEU PRO » DU RENDU (2026-09-29, session GRAPHISME) — « peaufine, comme si le jeu avait été fait par une équipe de 50 pros »
Méthode : 42 captures (3 mondes × sol/route/nitro/vol/après/explosion ×2, debout et couché — banc `gfx/balade.js`), critiquées par DEUX
relecteurs indépendants (directeur artistique, technical artist), triées contre les verdicts de Sacha. Corrigé :
- **EN VOL, ON VISE** : le flou de vitesse ×0,5 en vol et coupé net à l'explosion (`volK9` sur `sfxT` — « la moitié de l'image étalée »,
  « la lune en copies ») ; la caisse se DÉTACHE (`RIM_S0` × 1,9 en vol, lissé — vue de dessous elle n'était qu'une silhouette sombre) ;
  les nuages de coton s'effacent de 30 à 110 m de l'objectif en vol (10-40 au sol, `GFX_U.uNearF`) — la réception se lit.
- **L'EXPLOSION NE RETOMBE PLUS À PLAT** : une colonne de fumée (`smokePool`) monte 2,4 s du point d'impact, des braises s'en échappent.
- **LE CRATÈRE DE L'IMMEUBLE** : 7 → 5 m (la caméra de la mort, à ~14 m de la façade, ne voyait plus que le trou).
- **Écarté après essai** : nuages de coton OPAQUES (image quasi identique, mais plus de fondu quand la caméra les traverse) — gardé
  translucide (`dbgGfx({cotonOpaque:1})` pour comparer).
- **Laissé à Sacha, puis tranché (« les trois », même jour)** :
  · **LE JUS v4** (`juiceScreen`) : rayon ÷3 (plafond 40 px), plus jamais sur la ZONE DE CONDUITE (ellipse caisse + route devant,
    centrée (½ W, 0,6 H)), 6 taches au plus, vie 0,7-1,1 s, coulure courte. Mesuré `dbgJus(6)` : 15 % de l'écran repeint → ~2 %.
  · **LES RUBANS NE PENDENT PLUS** (`trailStep`, `TR_CUT`) : l'historique n'a qu'un point par IMAGE — à pleine vitesse le 2e ou 3e
    point est déjà sous l'objectif et la couleur s'étirait sur tout ce segment jusqu'au bas de l'écran (un fondu par sommet ne
    peut rien contre ça : essayé, zéro effet). Le ruban est COUPÉ géométriquement dès qu'il descend à l'écran de `TR_CUT.b` (0,26
    NDC) sous sa tuyère ; il vit toujours sur les côtés (virages, vol). Vaut aussi pour la meute et les fantômes (même fonction).
    ⚠ Les deux longues FLAMMES orange sous la caisse en nitro, ce sont les plumes `JETS` (la flamme « Asphalt » du 28/09) : gardées.
  · **LE « CARRÉ DORÉ » AU CENTRE** n'était pas l'antenne de LA HONTE : c'était l'ÉTIQUETTE d'un cristal de pouvoir (sprite de 6 m)
    vue à 200-300 m — 3 px cernés de noir pile au point de fuite. Elle s'efface de 110 à 160 m (`onBeforeCompile`, clé
    'pwrEtiquette', compilée AU MENU : 0 programme en course). Et son contour d'encre était AVALÉ par un `//` collé devant
    (`c.lineWidth/strokeStyle` en commentaire → trait noir d'1 px) : rétabli.
- **Transmis** : carte MOTEUR 3D qui bouche le point de fuite + voile vert-sarcelle sur le HUD en VILLE (UHD).

## LES TEXTES DE FIGURE, 3e CRAN (2026-09-29, session GRAPHISME) — « les textes de figure sont beaucoup trop gros et bloquent la vue »
Après le 2e cran d'INTERFACE (figK/annK, voir ci-dessous) — mesuré sur captures 390×844 et 844×390 (banc `gfx/fig.js`, `gfx/fig2.js`) :
- `annK()` .82/.72 → **.60/.52** (toutes les annonces du couloir), `figK()` .72/.62 → **.56/.48** (geste sur la caisse, verdict MONSTRE…).
- Les annonces qui naissent des FIGURES ont un corps de base plus petit : « ×5/×8/×10 » 48 → 34, « +AURA » encaissée 40 → 30, CHAÎNE PERDUE
  30 → 24 (BOOST, FRÉNÉSIE, IMPACT MÉTÉORE… gardent le leur).
- Le bandeau du DAUPHIN (`#dolHud`) : nom 20-30 px → 13-18 px, aura 12-16 → 9-11 (`<style id="figTaille">`, après hudTaille).
- **EN VOL, le geste (`popTexte`) ne se pose plus JAMAIS sous la caisse** — c'est là qu'on vise la réception : au-dessus s'il y a la place,
  sinon il s'efface (`#popTxt.cache`, posé par popSuit) ; la liste des figures à gauche le garde. Au sol, rien ne change.
- Résultat mesuré (portrait) : annonce ×8 20 px, geste 10-12 px, dauphin 14 px ; les règles `ebOn`/`ebPlonge` (carte moteur) intactes.
- (même jour) **LES VIGNETTES DU GARAGE GARDENT LEURS COULEURS** (`carPhoto`, relevé par INTERFACE) : la relève 1/1,35 se faisait canal par
  canal — LA HONTE (orange brûlé) sortait pêche pâle. Désormais relève sur la LUMINANCE, saturation ×1,26 (l'étalonnage du jeu est absent
  hors écran), plafond qui garde la teinte ; clé du studio 1,5 → 1,3. Blancs et caisses sombres inchangés. `dbgPhoto(i,ancien)` : A/B.

## LA TAILLE DU HUD (2026-09-28, nuit) — « réduis la taille des HUD, c'est compliqué de voir la route », puis « remets la barre de nitro et le flow de la même taille qu'avant, c'est surtout les textes de figure et de MONSTRE qui dérangent »
Fait par la session INTERFACE avec l'accord de UHD. MESURÉ avant (banc `hudmes.js`, scratchpad 93a1dcda `ui/`) : couché (844 × 390, l'ordi),
la colonne de gauche descendait à 63 % de la hauteur ; debout, aura + chaîne jusqu'à 250 px ; plaques de pouvoir 148 × 120.
- `<style id="hudTaille">`, juste APRÈS hudDA. Les BARRES NITRO et FLOW gardent leur taille d'origine (2e verdict). SOUS elles, `zoom:var(--hudK)`
  (.8 debout, .72 couché) sur #auraV2, #triade, #airHud, #pwrChip, #misBan, #coach, #campChip ; la liste des figures (#avList) un cran de plus (×.86).
  `zoom` (pas `scale`) réduit la boîte ET ses marges, et laisse libres les `translate`/`scale` des entrées (hudMaitrise).
- ⚠ L'échelle part de `--hudY0` (96 px, le haut de l'aura et du chrono) : dans un bloc zoomé, --hudH = (encoche + Y0·(1−K)) / K, --hudG/--hudD ÷ K
  — le zoom les remultiplie : rien ne remonte sous les barres, les positions en dur (hudH+96, +104, +184, +204, +248…) se resserrent dans leur
  ordre, encoche et bords exacts. Toute nouvelle plaque du HUD sous les barres : l'ajouter à la liste, et la placer en --hudH/--hudG/--hudD,
  jamais env() en direct.
- TEXTES DE FIGURE (JS) : `figK()` (.72 debout, .62 couché) pour le geste qui suit la caisse (`popTexte`) et le verdict de pose (MONSTRE…, `verdAffiche`) ;
  `annK()` (.82 / .72) pour les grandes annonces (`slamMontre` : corps ET plafond de largeur). NITRO, ⏸, volant et la carte MOTEUR hors échelle.
- Voile d'encre du haut : pleine hauteur jusqu'aux barres, à l'échelle en dessous.

## LA CONSOLE DE SON (2026-09-28, session SON) — « tout ce qui se passe à l'écran doit avoir un son propre et unique, parfaitement maîtrisé et mixé »
**⚠ RÈGLE POUR TOUTES LES SESSIONS : un son nouveau = `sfx('famille.nom')`, jamais un `chimeNote`/`noiseBurst` bricolé sur place.**
Appel sous garde depuis n'importe quel code : `typeof sfx==='function'&&sfx('ui.ok')`. Si le son voulu n'existe pas encore, on pose l'appel
avec un nom neuf et on le signale à la session SON (ou on écrit la recette dans `atelier-son/recettes.js`, voir plus bas).
- **Trois fichiers** : `atelier-son/recettes.js` (l'ATELIER : chaque son est une recette de synthèse, jamais chargée par le jeu) →
  `node atelier-son/cuire.js` rend, MESURE (sonie −20 LUFS sur 200 ms, crête, spectre), encode en MP3 32 kHz et écrit **`sons-banque.js`**
  (≈2,7 Mo, ~215 tampons) → **`sfx.js`** (le LECTEUR : décode la banque en tâche de fond dès le chargement, joue une source + un gain par
  événement). Le jeu charge les deux en `defer` avec `?v=N` : **incrémenter `v` à chaque nouvelle banque** (le service worker garde l'ancienne).
  `node atelier-son/cuire.js piece` ne recuit que les sons dont l'id contient « piece ».
- **Le banc d'écoute : `sons.html`** (double-clic, marche en file://) — tous les sons par famille, la tonalité de chaque morceau, des
  scénarios enchaînés (ligne de pièces, vol complet, frénésie à la pose, menus, écran de mort…). C'est là qu'on JUGE un son, pas en jouant.
- **Grammaire** : la MATIÈRE dit la famille (argent = métal, figures = synthé néon, aura = marimba, flow = piano électrique, danger = bois/tôle/
  grave, interface = petits « tock » vitrés) ; ce qui MONTE récompense, ce qui descend retire ; la TAILLE suit la rareté.
- **4 bus** (ui · rec · fx · amb) + une SALLE (réverbe à convolution calculée) → tout sort dans `MASTER` (curseur EFFETS, compresseur, pause
  inchangés). `TRIM=-10` cale la palette sur l'ancien mixage (mesuré : pièce −34 LUFS, clic −42, explosion −15).
- **Le chef d'orchestre** (`grp:'r'` + `prio`) : les récompenses qui partent dans la même fenêtre de 110 ms se rangent — la plus importante
  devant, les autres −9 dB. (Une pose qui déclenchait la frénésie empilait 15 à 20 notes en 200 ms.)
- **Une seule gamme par vol** (`ECH`, remis à zéro dans `startFall`, `echSt()`) : figures, paliers d'échelle et gestes en l'air prennent le
  degré suivant ; le verdict de la pose résout sur la tonique. Au sol l'aura garde sa gamme (`sonPd(CHA.x)`).
- **La tonalité suit la musique** (`sonTonSuit` dans musicTick, table `SON_TON`) : NÉON fa (−1), VITESSE si m (−2), NOCTURNAL sol# m (0),
  NOITE ré# m (+2), frénésie surmultipliée +1 — mesuré par chroma. Un nouveau morceau = une ligne dans `SON_TON`.
- **Repli** : `SONV2` faux (sfx.js absent) → toutes les anciennes fonctions sonnent comme avant. `son(id,repli)` fait les deux.
- `uiClic(rôle)` : `'nav'` `'retour'` `'on'` `'off'` `'onglet'` `'refus'` `'danger'` (défaut : appui principal). Un refus ne sonne plus comme un succès.
- Console : `dbgSon()` (état, décodage) · `dbgSon('fig.vrille',{st:4})` joue un son.
- ⚠ **Piège MP3** : le codec étale un pré-écho devant les attaques sèches ; chaque fichier commence par 30 ms de silence et la banque porte
  un ÉTALON (une impulsion) dont le lecteur mesure la crête pour caler l'attaque de TOUS les sons (28,5 ms mesurés dans Chrome).
- **Lot 2 (tout est branché, ~190 sons)** : chaque événement visible a son son — piste (pads, turbos de drift, nuages entrée/sortie/
  défonce, dos d'âne, huile ≠ eau, portail et son approche, replacement, chute), score (poses LOURDE/TRAVERS/CONTRESENS/AU CHEVEU,
  cratère, paliers ×5/×8/×10, encaissements d'aura, triade, frénésie armée/entrée/sortie/record, mallette chaude, REPORT, billets
  volants, MILLIONS, record en course), campagne (radar, éclair PUIS tonnerre, panne, trafic, fourgon, caisse-nuage, banquier,
  VICTOIRE ≠ DÉFAITE, fins de monde), meute (alarme du dernier qui accélère), espace (bourdon du vide, le vent SE TAIT), interface
  (rôles des clics, garage : bascule, tôle, achat + tampon, compteur, lâcher ; départ : logo, bannière lettre à lettre ; écran de
  mort calé sur l'image : enseigne 80 ms, crans 360→860 ms, pose 1 110 ms ; missions, auto-école, 3-2-1 GO). Carte MOTEUR : une
  scène d'un seul tenant (`moteur.palier`) calée sur ENG_COULOIR/ENG_PLONGE/T_SWAP — si l'animation change, recaler la recette.
- **Voix et samples en WebAudio** (`WA_BUF`, `voixWA`, `sampleWA`) quand la page est SERVIE : sur iPhone l'annonceur sortait à plein
  volume du fichier, sans doublure ni échos. En file:// l'ancien chemin <audio> joue, inchangé. Voix ramenées à −10 LUFS (`VOIX_NORM`).
- **Curseur EFFETS APRÈS le compresseur** (`MASTER._vol`) ; `MASTER` reste le point de branchement, à 1.
- **Pause** : la sortie attend 0,42 s avant de s'endormir (le clic ⏸ et la feuille sonnent jusqu'au bout) ; le jeu, lui, gèle tout de suite.
- **`SON_DUCK`** : les grands moments creusent le moteur/vent (duckT), comme le faisaient les anciennes fanfares.
- ⚠ **Garde des autres sessions** : `typeof sfx==='function'` est TOUJOURS vrai (la fonction existe même sans console). Pour garder un
  repli : `if(!(typeof sfx==='function'&&sfx('x')))repli();` (sfx rend null s'il n'a pas joué).
- ⚠ **Séries** : programmer d'un coup plus de `max` voix d'une fiche avec `{t:}` coupe les premières — les séries partent par setTimeout.
- Musique : silences morts retirés (NOCTURNAL GROOVE avait 1 s de trou à chaque boucle en VILLE) ; sw.js en `cashcar-v22`.
- **DÉBOGAGE COMPLET (2026-09-29)** — deux relectures de code + bancs muets en rendu logiciel (SwiftShader : zéro GPU de Sacha) +
  contrôle de la banque décodée (`qa_banque.py`, `qa_boucle.py` : écrêtage, DC, fins coupées, coutures). Corrigé :
  · BANQUE : passe-haut 18 Hz partout (DC jusqu'à 0,016 sur ui.erreur/refus), plafond −2 dBFS (le MP3 décodé dépassait 0 dBFS sur les
    attaques sèches), BOUCLES refaites (`O.boucle` : la queue fondue vers le début à puissance constante ; l'ancienne recopiait la fin sur
    le début + fondu de 6 ms = trou et clic à chaque tour), la boucle est encodée avec sa propre queue en tête et jouée sur `[tête, tête+lg)`.
    `cuire.js` garde `boucle/lg` des sons REPRIS lors d'une recuisson partielle (sinon les ambiances rebouclaient mal).
  · LECTEUR : OfflineAudioContext à 44,1 kHz si 32 kHz est refusé (WebKit < iOS 14.1 : l'étalon n'était jamais décodé) ; l'étalon passe
    par la file ; l'éviction de polyphonie se fait à l'instant du NOUVEAU son (elle tuait des sons programmés) ; le chef ne « ressuscite »
    plus les voix finies ; `annuleFutur(s)` et `stopJeu()` à la PAUSE (les queues d'explosion et les billets différés repartaient au 3-2-1).
  · JEU : reprise en < 0,49 s (la mise en veille tombait pendant le 3-2-1), le « 3 » attend le réveil du contexte, `SONV2` n'est vrai que si
    la banque est chargée, `var SONV2` (lu avant sa déclaration), replis des autres sessions rendus vivants (`if(SONV2)` au lieu de `typeof`),
    limiteur de sortie −1 dBFS (`MASTER._lim`, voix comprises), anciens sons qui doublaient (répliques d'explosion, landBoom, bump, fourgon,
    habillages, catapulte, crépitements de rentrée), `chaineAura(…,muet)` là où l'événement a son son (frôlé, turbos, radar, virage, pure
    speed, pouvoirs combinés, démoli, semés, caisse-nuage, ligne, fourgon, esquive), le geste qui passe ×5/×8/×10 ne double plus aura.xN,
    l'essoreuse une fois par vol, le plein de nitro d'un fruit seulement s'il y a plein, alarme du DERNIER et banquier avec hystérésis,
    boucle du vide muette en pause, pas de signature de mort à l'auto-école, ui.mission quand la bannière s'affiche, degrés plafonnés
    (SON_PENTA, echSt ≤ 9, figures à base unique cuites sur [0,12]), aucun son quand l'appli est en arrière-plan, le clic REPRENDRE sonne.
  · Mesuré après correctifs : 0 erreur, 0 son refusé, pas de fuite (sources vivantes stables sur 4 morts/relances et 30 niveaux).
- **OPTIMISATION DU SON (2026-09-29)** — mesurée au BANC ISOLÉ (`banc-graphe.js` : le bloc `// ---------- AUDIO ----------` →
  fin d'`initAudio` extrait seul dans une page vierge, rendu hors ligne 20 s, variantes alternées, 3 passes, médiane). ⚠ La sonde « jeu
  entier hors ligne » (remplacer AudioContext dans le vrai jeu) donnait 2 à 20 % selon les passes : INUTILISABLE pour comparer.
  · LES PORTES (`PORTES`, `porte(g,dest,lfo)`, `portesTick()`, console `dbgPortes()`) : chaque chaîne continue (moteur, vent, sifflement,
    crissement, 4 couches nitro, charge du drift, rase-bord, sirène) se DÉBRANCHE de MASTER quand sa consigne est nulle et sa chute finie
    (7 constantes de temps, −60 dB) et se REBRANCHE dans l'appel `setTargetAtTime` qui la rallume (zéro image de retard, zéro clic).
    WebAudio tire le calcul depuis la sortie : débranché = plus rien ne calcule en amont. ⚠ Un nouvel écrivain de ces gains DOIT passer
    par `setTargetAtTime` (`stt` le fait) — un `.value=` ou une rampe n'ouvriraient pas la porte.
  · LA SALLE AU REPOS (sfx.js) : la convolution 1,25 s ne se branche qu'au premier son et se débranche 1,4 s après la fin du dernier
    (`S.coupe` retient les voix coupées : leur queue de salle sonne encore). `CCSON.etat().salle` pour l'observer.
  · k-rate sur les paramètres pilotés à chaque image (filtres du moteur/vent/nitro, oscillateurs secondaires) : un biquad automatisé en
    a-rate recalcule ses coefficients à CHAQUE échantillon. Vérifié au spectre (même graine) : filtres = écart nul. ⚠ `osc`/`osc2` (le timbre)
    restent a-rate, skF1/skF2 aussi (LFO audio dessus), les gains aussi (paliers audibles).
  · suréchantillonnage 2x retiré des saturations moteur/nitro (filtré sous 2,8 kHz derrière / du bruit).
  · RÉSULTAT (% d'un cœur du PC, un téléphone ≈ ×3-5) : MENU 3,4 → 0,13 · COURSE (automation réelle rejouée, tout allumé) 6,0 → 4,8 ·
    course sans nitro 1,9. Banc fonctionnel `portes-banc.js` (le vrai jeu, muet) : menu silencieux portes fermées, nitro ouverte en
    < 120 ms, refermée < 2 s après, mort → tout fermé en < 1 s, relance → rouvert ; régression complète : 0 erreur, pas de fuite.
  · LA BANQUE ALLÉGÉE (`allege()` dans cuire.js, à chaque cuisson) : 48 FAUX STÉRÉO (deux canaux identiques au bit près) passés en
    mono — WebAudio remonte un mono en L = R, rendu identique — encodés en q3 (en q4 le joint-stéréo donnait plus de bits au milieu :
    mesuré contre la source non compressée, le mono q3 en est PLUS près que l'ancien stéréo, 0,34 dB contre 0,39) ; QUEUES MORTES (sous
    crête −70 dB, 40 ms de marge, fondu dans le silence) retirées : 37 s. Mémoire décodée 55,0 → 42,9 Mo, banque 3,05 → 2,86 Mo,
    décodage au lancement 133 → 96 ms (PC). Niveaux inchangés (pire écart 0,18 dB), 38 sons identiques à l'octet, boucles intactes,
    contrôle qualité propre (ni écrêtage, ni DC, ni fin coupée). `mesures.txt` note « mo←st » et « (−x s) ».
  · ⚠ CE QUI RESTE, ET POURQUOI ON N'Y TOUCHE PAS : la CHAÎNE MASTER coûte ~0,9 % d'un cœur dès qu'UN son passe (Chrome saute le calcul
    d'un nœud dont l'entrée est marquée silencieuse — dès qu'un son joue, compresseur de bus 0,44 %, tanh suréchantillonné 0,26 %,
    limiteur de sortie 0,26 %). Le tanh `lim` n'est PAS un simple filet : sa pente à zéro vaut 1,51 (tanh(1,3x)/tanh(1,3)), il COLORE
    tout le mix — sans son 2x, le 3e harmonique des sons brillants (> 8 kHz) se replierait dans l'audible. C'est le son validé : on le garde.
    Idem `osc`/`osc2` en a-rate (le timbre de la caisse). Voix/samples décodés à 48 kHz (5,8 Mo) : les passer à 32 kHz couperait l'aigu
    du WOW pour moins de 2 Mo — gardés.
- **LES FRUITS FONT SPLOTCH (2026-09-30, relayé par INTERFACE)** — Sacha : « quand tu ramasses un fruit, ça doit faire un bruit de fruit
  qu'on écrase ». Outil `ecrase(b,R,t0,o)` (recettes.js, bloc des fruits) : la peau qui cède (tk sourd + poids discret), le SPLOTCH (bruit dans
  deux formants qui GLISSENT VERS LE BAS, haché en grains irréguliers de 2-8 ms — c'est le hachage qui fait humide), la succion (bulles qui
  montent), le jus (gouttes de plus en plus rares + bruine). Chaque fruit garde sa signature par-dessus (peau de banane + pulpe molle, pépins de
  grenade, zeste d'orange qui gicle, myrtille minuscule, pastèque : écorce + énorme splotch + l'accord doré). 4 PRISES par fruit, ±6 % de
  hauteur, ±1,5 dB (un fruit toutes les ~2,4 s sur LA LIGNE PARFAITE). Mesuré : le médium domine (grave −4 à −16 dB), centroïde 1-3 kHz selon
  la taille du fruit. `nitro.plein` suit 0,14 s après, à −4 dB : le splotch passe devant. Banque ?v=8, sw v30.
## LE MOUVEMENT DE L'INTERFACE + MISSIONS v2 (2026-09-28, soir) — « travaille les animations, les emplacements, les transitions entre chaque écran : prêt à envoyer à l'App Store »
Sacha : « il y a des centaines de petites choses à améliorer dans l'interface… travaille les animations quand tu cliques sur les boutons,
leurs emplacements, les transitions quand tu changes d'écran — que ce soit parfait ; travaille vraiment les transitions entre chaque écran
avec des boutons animés » · « à la place de "tu peux te l'offrir", un bouton qui montre l'accès aux missions avec la mission où tu as le
plus avancé durant la partie » · « dans l'écran des missions, enlève toutes ces histoires de contrat ; les défis, et à côté, écrits dans les
couleurs de leur rareté, les objets que tu peux gagner ». Tout filmé AVANT puis APRÈS au ralenti ×8 (banc `film.js`, scratchpad de la session
93a1dcda, `ui/` : l'horloge de la page ET les animations CSS ralenties, chaque image étiquetée de son temps virtuel ; `scenes*.js` = les gestes).
- **SECTION 21 de charte4 — LE MOUVEMENT** (en fin de `<style id="charte4">`). Jetons `--t-in` 400 ms (arriver), `--t-out` 150 ms (partir),
  `--t-press` 70 ms (s'enfoncer), `--stag` 34 ms (cadence), `--pousse` 30 px ; une courbe (`--ease`). ⚠ On n'anime QUE `opacity` et les
  propriétés individuelles `translate`/`scale` : l'ancienne cascade animait `transform` — le lingot JOUER (penché) arrivait DROIT puis se
  penchait d'un coup à la fin. Filmé avant : l'ancien et le nouvel écran restaient superposés ~150 ms (deux titres l'un sur l'autre).
  · ÉCRAN QUI PART : 150 ms dans le sens du geste (`k6SortAvant/Retour/Racine`), `min-height:100%` (en absolu il perdait sa hauteur : ses
    blocs « tombés vers la sortie » remontaient d'un coup sous le titre). ÉCRAN QUI ARRIVE : le cadre apparaît après 40 ms, ses BLOCS
    portent la direction en cascade (`k6Monte/Avant/Retour`) ; les contenants (`.mSet`, `.misDefs`, `.misCol`) cascadent leurs enfants ;
    la touche RETOUR glisse du bord gauche (`k6DuBord`).
  · ACCUEIL : le logo DESCEND (`k6Tombe`), les trois tuiles se distribuent, JOUER SURGIT du bas en dernier (`k6Surgit`) ; un REFLET passe
    sur les tuiles l'une après l'autre toutes les 7 s (`::after`, `k6Reflet` — seule la position de fond bouge).
  · MORT : une mise en scène à délais nommés — enseigne 80 ms, cartes distribuées 250/320 ms (`k6Carte`), ticket 390 ms, porte MISSIONS
    490 ms (de la droite), tuiles 540-610 ms, MENU 640 ms, REJOUER 660 ms. `mCount` attend 360 ms (le montant s'égrène quand son ticket
    apparaît, avec les notes de `mCompteSon`) ; l'aura attend 260 ms.
  · FEUILLES : la fenêtre (`#modale`) arrive du BAS de l'écran (`k6Feuille`, `translate` depuis 100 % + 40 px) et ses boutons suivent ; la
    PAUSE se range de haut en bas, REPRENDRE surgit en dernier ; la CARRIÈRE a un SENS (`#carr[data-sens]`, posé par `carrVue` quand la
    feuille est déjà ouverte : entrer dans un monde pousse de la droite, en sortir ramène de la gauche) et ses dix niveaux se distribuent.
    Garage : changer de famille ou d'onglet distribue la bande de vignettes (`#gStrip>.gT`, elle ne se reconstruit qu'à ces moments-là).
  · « Réduire les animations » (iOS ou `data-reduced-motion`) : tout redevient un fondu ; les verrous du volet (`.revu`, `body.voletSort`)
    sont redits pour chaque nouveau sélecteur — l'écran que le VOLET découvre n'a pas d'entrée à lui.
- **L'APPUI SOUS LE DOIGT** (`APPUI_SEL`, juste après `uiPop`) : sur iPhone `:active` ne se peint pas pour un tap bref — la touche ne
  s'enfonçait jamais à l'œil. `.appui` est posée au `pointerdown` (capture) et tenue ≥ 90 ms ; les 24 règles `:active` de charte4 ont reçu
  leur jumelle `.appui` (script `appui.py` : même spécificité, NITRO exclue). Au contact : visuel + `sfx('ui.appui')` (session SON, gardé) ;
  l'action, son son et la vibration restent au relâcher (`uiClic`) — un seul coup dans le pouce. Un glissé annule (`pointercancel`).
- **LES SONS D'INTERFACE** (demandés par la session SON, tous gardés `typeof sfx==='function'`) : `ui.volet` / `ui.voletSort` (ecranWipe —
  le `noiseBurst` d'origine reste en repli), `ui.feuille` / `ui.feuilleFerme` (feuilleOuvre/Ferme — pas quand la carrière change de page,
  pas pour la fenêtre qui a le sien), `ui.modale`, `ui.ok` / `ui.erreur` (toast, selon l'icône coche/croix). ⚠ Le son est la zone de SON.
- **MISSIONS v2** (`misRender`, `misGain`, `MIS_CAT_COL`, HTML `#mMis` → `.mSec` + `#misTab`) : plus de « CONTRAT n », plus de paragraphe de
  règle ni de carnet suivant numéroté. Lu de gauche à droite : LES TROIS DÉFIS (`.misDefs` : consigne, jauge = meilleur essai en UNE partie,
  avancement, prime en vert billet) → la colonne des OBJETS (`.misCol`) : l'objet en jeu (`.misPrix` : vignette, NOM dans la couleur de sa
  famille — celle du garage : DÉFI vert pour les caisses ; peinture rose, traînée ambre, ailes cyan comme leur fiche —, jauge des trois,
  VOIR → garage) puis ENSUITE (`.misSuiv` : les trois objets suivants, chacun sa silhouette pixel et sa couleur). La règle tient dans le titre
  de section (« LES DEFIS · CHACUN EN UNE PARTIE »). Grand téléphone debout (≥ 760 px) : tout en plus généreux. Paysage : défis | objet |
  ensuite. `misProgV` : « FRANCHIS 2 PORTAILS » compte 1 / 2 (il comptait +1, reste de l'ancien « atteins le niveau »).
- **LA PORTE DES MISSIONS de l'écran de mort** (`objRender`, `.mObj.misPorte`, `data-m="mis"`) remplace « TU PEUX TE L'OFFRIR » / l'objectif
  d'achat : le défi que CETTE partie a le plus approché (celui qu'elle vient de relever passe devant : « DÉFI RÉUSSI ! » + prime), ses trois
  cases, sa jauge qui se remplit de la partie (après l'entrée de l'écran), « CETTE PARTIE · 263 / 672 » et, au bout, l'objet dans sa
  couleur. Touchée : l'écran MISSIONS (RETOUR ramène à la mort). Un carnet rempli à cette mort garde son état « DÉFIS RÉUSSIS ! » (→ garage).
  `objectif()`/`shopAPortee()` restent (pastille du garage, `buyGoal`).
- ⚠ Décision prise sans Sacha (à confirmer) : « la couleur de leur rareté » = la couleur que le GARAGE donne déjà à l'objet. Toutes les
  caisses à gagner par défi sont de la famille DÉFI (vert) ; si Sacha veut des raretés différentes par palier de mission (rare → épique…),
  c'est une décision de jeu (familles du garage), pas d'interface.
- QA : `qa.js` (62 points, copié de la session 312bec4e) 61/62 — le seul échec est le 404 attendu de `dark-triad.mp3`. Bancs : `tour.js`
  (captures portrait / paysage / 375×667, `MORT=1`), `film.js` + `scenes.js` / `scenes2.js` / `scenes3.js`, `jscheck.py`.
## LE COMPTEUR D'ARGENT + LA COLONNE DE DROITE (2026-09-29, session UHD) — « un compteur d'argent stylé, inspiré de loin de GTA, avec notre DA ; réorganise le HUD de manière pro »
- `#cashHud` (hudDA §8, JS `CASH`/`cashTxt`/`cashSnap`/`cashEcrit`/`cashHudTick`, appelé par la boucle à côté du compteur du bureau, recalé par
  `paintMoney`) : en haut à droite SOUS LE ⏸ (la place de l'argent dans GTA), le total de la partie (`money`) qui DÉFILE vers sa valeur
  (centimes sous 10 $, groupes de milliers, compact au-delà de 100 000), et sous lui le « +$ » qui s'ADDITIONNE tant que ça tombe (1,8 s après le
  dernier gain) — en OR avec « ×3 » pendant la frénésie. Typo en quatre bandes VERT billet cernée d'encre (hex purs : rien pour le repli iOS) ;
  frappe de 3 px en paliers à chaque gain (jumelles b1/b2, t1/t2). Pas zoomé par hudTaille (il vit au-dessus de --hudY0).
- LA COLONNE DE DROITE, UN SEUL RYTHME (portrait, positions écran) : ⏸ 10-58 · ARGENT 72 · DARK TRIAD 123 (`top` hudH+130) · CHRONO DE VOL 118
  (hudH+124 ; 182→198 en frénésie : hudH+224) · POUVOIRS 166 (241 en frénésie) · CAMPAGNE 166 (251 en frénésie : hudH+290 ; pouvoirs alors
  hudH+354). ⚠ Les tops de ces blocs sont en coordonnées ZOOMÉES : écran = 96 + (T − 96) × K. Paysage : argent hudH+66, plaques de pouvoir
  descendues à hudH+124 (elles se posaient sur l'argent), et l'emblème DARK TRIAD placé à `hudG + (min(50vw,440px)+18px)/--hudK` — calculé à
  l'échelle 1, le zoom le faisait tomber SOUS les barres.

## NITROOO (2026-09-29, session UHD) — « nitro tenu 3 s sur la route : la caisse s'entoure de flammes comme une météorite ; +10 % de vitesse par seconde tant qu'on tient »
- C'est la version VISIBLE de PURE SPEED (conseil de GAMEPLAY : même geste, UN paiement) : bloc « PURE SPEED → NITROOO » de la boucle ('drive') —
  seuil 55 % de la vmax du moteur (plus 400 km/h absolus), `NTR_T` 3 s, le boost de DÉPART ne compte pas ; « NITROOO ! » (verdict), ligne de
  chaîne NITROOO +120 puis NITROOO ×n toutes les 2 s (inchangé), voix « pure speed » gardée, flowAdd(5,'risque','p') UNE fois par tenue.
- LE BOOST : `NTR.boost` = +10 %/s tenue après le déclenchement, plafond +80 % (`NTR_BOOST_MAX`), multiplié dans `spdMult` (comme VITESSE ×2 :
  le sol défile, la physique ne bouge pas) ; « +N % » jaillit à chaque palier ; au lâcher il retombe en ~0,6 s.
- LA MÉTÉORITE (`nitroooTick`, appelée à côté d'orbFxTick) : cinq LANGUES de flamme vivante (`NTR_LANGUES` : coins avant, capot, bords du toit,
  couchées vers l'arrière et l'extérieur) + une enveloppe + un cœur au nez, TOUS du programme des pots (`jetMat`, zéro compilation), couleurs
  `ntrShellM` blanc → rouge-orange (la caisse orange ne s'y noie pas) ; halo du nez en `depthTest:false` (vu de dos, la tôle le cachait) +
  lueur qui enveloppe ; flammes sur la silhouette et BRAISES qui restent derrière (pools flames/flameCore/embers, comme la rentrée de l'orbite) ;
  bords d'écran orange toutes les 0,62 s. Intensité : 1 au déclenchement et à chaque palier, 0,7 ensuite, 0,5 après 6 s (le nitro dure 2× en
  frénésie). NITRO INFINIE : tout passe au VIOLET (NINF). Sons : `sfx('nitrooo.palier')` à chaque palier (bloc FRENCASH de
  `atelier-son/recettes.js`, banque v6 : bouffée de feu, braises, ton de chauffe qui monte d'une quarte se poser sur la note du palier, cloche ;
  chef d'orchestre prio 1 sous `vitesse.pure` prio 2 : aux secondes paires la salve NITROOO ×n passe devant, le palier recule de 9 dB — mesuré).
- **AIR NITROOO** (même jour, Sacha : « nitrooo avec la comète marche aussi dans les airs, mais s'appelle AIR NITROOO ») : nitro tenu `NTR_T` s
  D'AFFILÉE en vol (`NTR.airT`, temps réel) → `addTrick('airnitro','AIR NITROOO !',10,1)` une fois par vol (tier 1 = 6 de flow, demande de
  GAMEPLAY après la loi 17 ; ligne de chaîne AIR NITROOO +120) ; la comète vit en 'drive' ET en 'fall' (elle survit au décollage et à la pose) ;
  la poussée du réacteur en vol prend ×(1 + min(0,4, NTR.boost)) — plafond +40 % en vol : le viseur n'intègre que 1,7 s. Banc `st-airn.js`.
- ⚠ Avec le PREMIER moteur, le réservoir ne tient que ~2 s (+ la réserve bleue) : NITROOO demande la réserve, un moteur plus gros, la frénésie
  ou la NITRO INFINIE. Banc : `st-ntr.js` (dbgNitro(2,2) recharge pendant la tenue).

## LE DAUPHIN v5 (2026-09-29, session UHD) — « plus tu es proche de la route et plus tu vas vite, plus tu gagnes d'aura et de flow »
- Constantes et commentaire en tête du bloc DAUPHIN (`DOL_AURA_S` 20, `DOL_AURA_RAS` 160, `DOL_FLOW_K` 4, `DOL_FLOW_MAX` 6). Proximité : ×9 entre
  le large et le ras (×3,25 avant). Vitesse LUE EN CONTINU (`dolVitMul` = |fallVel| sur la vmax du moteur, ×0,6 → ×2,1, lissée) au lieu d'être
  figée au décollage. Flow : `dolQ` cumule ras² × (0,3 + 0,7 × vitesse) ; `dolFin` verse min(6, 4·dolQ) en RISQUE (NARCISSE) si la figure a
  été tenue. `dolAura` ne recule jamais (plafond × vitesse qui retombe). MESURÉ au banc : au ras et vite ≈ 380 aura/s (240 max avant) ;
  au large ≈ 40/s. Simulateur (`simtri.js` + DOL=1) : maître 146 → 123 s pour la 1re frénésie, tranquille/casse-cou inchangés.
  Hook : `dbgDauphin('etat')` (on, aura, mul, q, nb, fig, hF, flow, mode).
- **LE DAUPHIN S'ÉCRIT À LA POSE** (Sacha : « le texte dauphin ne s'affiche qu'à l'atterrissage ; avant, juste l'animation ») : en vol, plus
  d'étiquette #dolHud, plus de verdict texte (addTrick l'épargne en vol), les lignes de chaîne DAUPHIN / DAUPHIN EN VOL sont mises de côté
  (`dolAura9` → `DOL_DIFF`). `dolPose` (après tryLand, et filet dans dolHudTick si on revient sur la route autrement) les verse SANS pop
  (`CHA.sansPop`) et affiche UN récapitulatif « DAUPHIN ×n +total AURA » ; il attend que le verdict de pose libère le couloir
  (`dolHudLibre`, 3 s au plus) puis rejoue son entrée. Crash / replacement : `dolKill` vide DOL_DIFF (rien d'écrit, rien de versé).

## LA DA DU HUD, UNE SEULE FAMILLE (2026-09-28, session UHD) — « le bouton nitro, le camembert air time et la dark triad ne ressemblent pas à la barre de nitro et au compteur »
Sacha : « j'aime le résultat, unifie parfaitement la DA en restant sur cette base ; le bouton nitro, le camembert air time et la dark triad n'ont
pas l'air de ressembler à la barre de nitro et au compteur de score (qui sont bien) ; nitro infini VIOLET comme les flammes, la traînée, la barre ;
l'animation du moteur débloqué est moche, ne suit pas la voiture et bloque la vision — plus petite, au-dessus de la voiture, belles couleurs, elle
rétrécit et rentre dedans ; en frénésie, les trois barres de personnalité plus discrètes, sans texte ; pense mobile avant tout ».
Tout le CSS vit dans `<style id="hudDA">` (APRÈS hudMaitrise, avant `#splash`) — jetons en tête (`--jEncre/--jFond/--jInk/--jCurs`, nitro `--n*`,
réserve `--b*`, NITRO INFINIE `--v*`, air `--a*`, or `--o*`, rouge `--r*`, menthe `--m*`). Deux MODÈLES font la loi de ce qui se LIT en course :
LA JAUGE = la barre NITRO (fond d'encre, cadre indigo, épaisseur dessous, QUATRE BANDES, curseur blanc, icône pixel) · LE CHIFFRE = le compteur
d'AURA (police pixel en bandes, cernée d'encre). Ce qui se TOUCHE = plaque PENCHÉE de la famille du ⏸.
- **BOUTON NITRO** (section 1) : plus de disque — une touche penchée `--nbW×--nbH` (96×84) : laque, bande de couleur à gauche (`--nc`), l'ÉCLAIR
  de la barre en trois bandes, « NITRO », et `.nxJauge` redessinée en MINI-BARRE (même recette, `--nr`/`--nx` de la boucle, curseur). `.nxArt`
  masqué. États : `.plein` halo qui bat · `.on` descend de 5 px et s'embrase · `.bas` bande rouge + jauge qui bat · `.bleu` · `.inf` VIOLET qui
  file. ⚠ la boucle pose désormais `inf`/`bleu`/`bas` AUSSI sur `#tNitro` (elNB), plus seulement sur la barre.
- **NITRO INFINIE = VIOLET** (`NINF`, `Object.assign(PWR_DEFS.n,…)` juste après PWR_DEFS — la session GAMEPLAY garde l'ordre) : cristal, plaque
  NITRO MAX, bords d'écran, barre (`#nitroBar.inf`), son FEU (`FEU_RAMPE` violet), plume (`jetShellM/jetCoreM`, racine `uRac`), particules
  (`flames/flameCore/embers`), onde d'allumage (`NFX.cT`), `nitroLight`, rubans de traînée. Un SIGNAL : il passe devant la signature de la
  caisse (comme la réserve bleue) ; l'arc-en-ciel et la gerbe d'eau se taisent pendant le pouvoir.
- **CHRONO DE VOL** (section 3) : `#airHud` (aile pixel + secondes dans la typo ombrée + barre qui se vide) remplace le camembert. `#airPie`
  reste l'ÉTAT (display, `.danger`) mais n'est plus dessiné ni vu : `#airPie[style*="block"]+#airHud` le suit sans JS. `airPieDraw` n'écrit que
  `--a`, les secondes, `data-k` (ok cyan · moyen or · urgent rouge · inf menthe) et `.flash`. `airPiePx` n'est plus appelée.
- **DARK TRIAD** (section 4) : `.trDA` (icône `pxi-triade` ajoutée à `PXI_G` + « DARK / TRIAD » en bandes rouges de TRIPLE MONSTER) dans
  `.trPouls` ; `.trPiece/.trOnde/.trAura` masqués (la pièce qui tourne est finie). `--frenTh` 60. Portrait : l'emblème passe dans la COLONNE DE
  DROITE sous le ⏸ (⏸ · DARK TRIAD · chrono de vol à hudH+204 · pouvoirs) — au milieu il cassait le compteur d'aura en deux lignes. Les trois
  TRAITS : barrettes fines côte à côte (ordre N · M · P des étiquettes du flow), sans nom, opacité .78.
- **COMPTEUR D'AURA** : `data-l` posé à l'écriture (`l1` ≥ 6 caractères → 26 px, `l2` ≥ 8 → 22 px), `nowrap` : il ne passe plus à la ligne.
- **CARTE MOTEUR v5** (section 5 + `engBig`/`engBigPlace`/`engBigSuit`) : étiquette + NOM (typo ombrée, couleur `engNeon` — les gris d'acier
  deviennent cyan) + moteur 3D ; palier, cylindres et gain quittent la carte (le gain jaillit de la caisse à l'impact). Le moteur fait ~40 % de la
  largeur APPARENTE de la caisse (`engCaisseL` = boîte de `carBody` projetée), `--ebS` borné .7-1.05 ; posé sur le TOIT (plus de plancher au
  couloir des annonces), il suit la voiture au sol comme en vol ; 1 s puis 0,48 s de plongée. `engRim` (lumière posée à l'init dans
  `engVigScene`, éteinte au repos) teinte le métal au néon ; halo plus franc, disque d'encre plus petit ; l'onde `swapRing` et `swapLight` à la
  couleur du moteur, rayon 5 → 3,8 m. Hook : `dbgEngCarte()` (mesures) / `dbgEngCarte('fige')` (pas de plongée).
- **LOT 2** : le métal du moteur de la carte est TEINTÉ à la couleur néon du palier (`engCarteMat.color` = blanc → néon à 42 %, `ENG_TEINTE`) —
  il sortait blanc rosé sur tous les ciels ; `engRim` 1,5 ; nom de plus de 12 caractères un corps plus bas (`#engBig.long`) · l'ASTUCE / le DÉFI
  (`#misBan`) se range à GAUCHE tant qu'une plaque de pouvoir est affichée (portrait) : centrée, elle couvrait NITRO MAX / VITESSE ×2 (section 6).
- **LES NOMS DES TRAITS QUITTENT L'ÉCRAN** (Sacha : « enlève les mots psychopathe, narcissique et machiavéliste ») : les étiquettes
  +NARCISSE / -PSYCHO / +MACHIAVEL de la ligne du flow sont masquées (`#flowHud .fT{display:none}` dans hudDA) ; `flowTag` compte
  toujours (aucune logique retirée). Les barrettes sous l'emblème étaient déjà sans nom. Seuls des COMMENTAIRES gardent ces mots.
- **LA NOTE DE LA POSE EN FRÉNÉSIE** (2026-09-29, Sacha : « le son low honor de Red Dead, quand on perd de l'honneur — pendant la
  frénésie, à chaque atterrissage ») : le fichier de Rockstar est protégé (App Store) → un son ORIGINAL dans cet esprit, `frenesie.pose`,
  commandé à la session SON (recette + cuisson de la banque). Appel dans `tryLand`, avant `flowCasse` : frénésie en cours (lue AVANT le
  déclenchement), pas de pose ratée, vol > 0,4 s, t .15 (après le tchak). Tant que la banque n'a pas le son, l'appel ne joue rien.
- **REPLI DES VIEUX iPHONE** (hudDA §7, audit de sortie INTERFACE) : sous iOS < 16.2 (pas de `color-mix()`), un texte du HUD en
  `color:transparent` dont le dégradé contient color-mix DISPARAÎT. `@supports not (color:color-mix(…))` les passe en couleur PLEINE
  (--tc, --xc, --fc, --pc, --fren, --ec) cernée d'encre (--contourH/P). Simulé au banc (`st-repli.js` pose le contenu du bloc sans
  condition) : tout reste lisible. Tout NOUVEAU texte ombré du HUD qui utilise color-mix doit être ajouté à ces listes.
- **v5.1 (critiques DA de GRAPHISME)** : le « fantôme gris » de la carte moteur était son ENTRÉE en fondu (moteur translucide ~150 ms) →
  opaque en 40 ms, il GRANDIT depuis la caisse (`engBigSuit`), texte `daEbVie` .22 s ; moteur ~33 % de la caisse (scène 92×62, texte
  inchangé). Sa PLACE au-dessus de la caisse est gardée (verdict de Sacha, malgré la critique « hors de l'axe »). Le halo de bord des
  pouvoirs (#pwrFx) s'éteint à l'explosion (`mode==='boom'||gameOver` dans la boucle) : l'AIMANT verdissait l'écran jusqu'à la mort.
- Bancs (scratchpad session UHD) : `run.js <pfx> <étapes.js> [w] [h]` (DSF, LG), `st-eng2.js` (film de la carte), `st-fren.js`, `st-det.js`
  (états du bouton), `st-pay.js` (paysage), `attente.sh` (attend qu'aucun banc voisin ne tourne).

## PLUS BEAU SUR IPHONE, SANS COÛT EN PLUS (2026-09-28, nuit) — « trouve plein de petites techniques »
Sacha : « les graphismes sont pas mal, on peut encore les pousser — sans que ce soit plus compliqué pour l'iPhone ». Chaque technique est un
UNIFORME (zéro programme en plus, 0 compilé en course, mesuré au parcours `tour.js`), éteignable à chaud par `dbgGfx({…})` pour comparer la
MÊME image figée (bancs : scratchpad de la session f71fd2a2, `gfx/abx.js`, `gfx/nuage.js`, `gfx/ab.js`, `gfx/sbs.js` = côte à côte ×2).
- **LE PIQUÉ NATIF** (`applyDPR`, `PIQUE_NAT`) : l'iPhone affiche 3 px par point, la 3D en calcule 1,5 → le NAVIGATEUR agrandit ×2 en
  bilinéaire, un flou que l'ancien piqué (qui ne regardait que la descente sous le plafond) ne compensait pas. `uSharp` part désormais de
  l'agrandissement réel (×2 → .40), mêmes 4 lectures que le FXAA. `?piquen=.6` pour essayer une autre force, `?pique=0` pour l'éteindre.
- **LE TRAMAGE DE SORTIE** (`uTrame`, fin de l'ACES) : un demi-niveau de bruit entrelacé (animé par `uJit`) casse les marches de 1/255 des
  grands dégradés (ciel, brume, vignette) sur l'OLED. Le noir pur reste noir (l'ORBITE garde son noir complet).
- **LE CŒUR PLEIN DES NUAGES** (`GFX_U.uCoeur`, `nuageShader`) : à 82 % partout on voyait les bourgeons empilés AU TRAVERS de la ouate ;
  le cœur vu de face monte à ~95 %, la vapeur garde 82 % là où la ouate tourne, puis s'allège au liseré.
- **LE BITUME GLACÉ** (`ROAD_U.uGlace`, `GLACE`, `roadMat`) : la route sèche renvoie le ciel du biome selon l'angle (Fresnel ^5), dans la
  MÊME lecture du cube que le mélange d'origine — rien sous le nez, le dégradé du ciel vers le lointain et sur les dalles qui tournent ; le
  reflet du SOLEIL en est retiré (la traînée dure refusée le 26/09). NUAGES .45 · ORBITE .5 · VILLE 0 (elle a son eau).
- **L'IMPACT SUR UN IMMEUBLE** (Sacha : « quand on se crashe sur un immeuble, un impact d'explosion et de destruction au point
  d'impact, cool et maîtrisé ») — `IMPACT`, `villeImpact(p,vel)` (appelé dans la branche de vol, AVANT `explode('tour')` : il joue aussi
  quand le BOUCLIER sauve la caisse, accord GAMEPLAY), `villeImpactTick`, `villeImpactFin` (nouvelle ville). La tour est une instance
  d'un cube partagé : la destruction est PEINTE dans `villeMatTours` (`VILLE_IMPACT`, uniformes `uImp9`/`uImpN9`, branche coupée sans
  impact) — cratère au bord déchiqueté (dessin propre à chaque impact) qui s'ouvre en 0,14 s, cavité noire où l'on lit les dalles des
  étages, brasier au tiers bas, lèvre de braises, suie qui souffle les fenêtres sur ~2,6 rayons, éclair du choc 0,35 s ; rayon 7 m (jamais
  plus que la façade). Devant : 26 VRAIS morceaux (17 blocs de béton, 9 carreaux de verre ÉMISSIFS ambre/cyan — Phong nu, le programme des
  éclats de l'explosion : 0 compilé, mesuré), poussière `dust`, verre pilé `sparkBlue`, braises, fumée qui monte du trou 5,5 s.
  Son : `sfx('impact.immeuble')` (console de la session SON, 2,4 s : béton sourd, vitre, pluie de verre, gravats). Hook `dbgImpact(true)`
  (impact sur la tour la plus proche), `dbgImpact(null,s)` (fait vieillir en pause). Banc : `gfx/imp.js` (planche 0,05 → 4,5 s).
- **LE CIEL DE COTON — NUAGES v3** (Sacha : « refonte des nuages : plus de nuages, plus jolis, dans la forme classique qu'on imagine,
  magnifiques, un peu partout autour de la route — donc légers ») — `COTON`, `cotonBlobs`, `cotonGeo`, `buildCoton`, `cotonTick`.
  · FORME : six gabarits « de dessin » (classique, bas et large, tour/congestus, flocon, banc, double dôme) — une rangée de BASE aux
    bourgeons aplatis (le dessous plat), des bourgeons RONDS au-dessus (plus jamais de boules aplaties empilées = les « piles
    d'assiettes » d'avant), ventre lavande → sommet blanc sur la HAUTEUR du nuage, creux assombris, liseré d'argent du shader inchangé.
  · LÉGER : tout le DÉCOR devient des instances (6 gabarits × près/loin = 12 appels de dessin pour ~350 nuages). `cotonTick` (chaîné sur
    scene.onBeforeRender) : hors champ = pas envoyé, au-delà de 650 m = gabarit léger 8×6, lots triés du plus loin au plus près. MESURÉ :
    ~0,1 ms de processeur par image ; triangles de l'image 619 k → 255 k au sol, 448 k → 332 k en vol ; appels 233 → 122 ; en rendu
    logiciel (proxy du coût par pixel, même image, nuages visibles/cachés) les nuages coûtaient 75-82 ms, désormais 66 ms au sol, 21 en vol.
  · PARTOUT AUTOUR DE LA ROUTE, JAMAIS DESSUS : couronne proche (50-350 m du bord, du dessous au-dessus du ruban), au-dessus/en dessous du
    ruban, couronne du milieu (0,35-1,3 km), COUCHE HAUTE (230-650 m au-dessus de la route : le haut d'un écran portrait est du ciel),
    lointain (1,2-2,6 km), massifs et titans (ex-« ciel organisé », gabarit tour). Garde `cotonTouche` = nuageTouche sur une grille de
    120 m. Tout tiré sur `cr` (jamais la piste). VILLE/ORBITE/auto-école : aucun (lvlNuageOk), campagne : `deco` de CAMP_NIV respecté.
  · Restent des MAILLAGES À PART (rôle de jeu) : bancs sur la route, coussins de vol (recharge d'airtime) et tours géantes qu'on traverse
    (white-out) — ces deux-là prennent aussi la forme classique —, la mer, les voiles, tout ce que pose la campagne (inchangés).
  · Traversé, un nuage de coton s'efface autour de l'objectif (fondu 10-40 m, `NUAGE_INST` dans nuageShader) au lieu de claquer.
    Programme `nuageV3coton` compilé au menu (nuageChauffe → cotonInit) : 0 en course (mesuré). Hook `dbgCoton()`. Bancs `gfx/coton.js`
    (sol, vol, vues larges), `gfx/info.js` (triangles/appels A/B), `gfx/ssnu.js` (coût des nuages en rendu logiciel, A/B), `gfx/menu.js`.
  · (même nuit) FINESSE À L'ÉCRAN : 4 gabarits par forme (7×5 · 10×7 · 16×11 · 22×15), choisis par la taille d'une facette à l'écran
    (segments ≥ 73·R/d) — les titans vus de l'accueil montraient leurs facettes. Lots vides = aucun appel. `dbgCoton('max')` = le plus gros.
- **L'ABÎME BLEU** (Sacha : « le sol du niveau nuages tout bleu, sans motif de nuages dessus ») : sous l'horizon des NUAGES, la mer peinte
  (`merNuages`) devient un bleu uni du biome qui s'approfondit vers le bas ; les nappes plates `sea` ne sont plus posées aux NUAGES
  (lvlNuageOk, campagne comprise). Les cumulus du ciel de coton flottent dessus. `MER_MOTIF=true` rend l'ancienne mer.
- **Écarté après captures** : « le monde dans la laque » (le décor du niveau — mer de nuages, mur de tours éclairées — peint dans le cube
  des carrosseries) : INVISIBLE depuis la caméra de poursuite (on voit l'arrière des caisses de face, le vernis n'y renvoie que ~6 %).

## LES POUVOIRS v2 + LES PETITS TRUCS GRISANTS (2026-09-28, nuit) — « des nouveaux power-up, plus longs, des petits trucs grisants, que les débutants prennent leur pied autant que les vétérans »
Session GAMEPLAY (worktree `CCG-gameplay`, branche `gameplay`). Même lot : la FRÉNÉSIE remise aux réglages d'avant la « triade
simplifiée » (voir cette section plus bas). Banc muet `gp.js` / `sf.js` (scratchpad de la session 4b30b603 : 200×430, UN à la fois).
- **LA FICHE** `PWR_DEFS` porte tout : `t` durée · `px` pictogramme (PXI_G, + `aimant` et `bouclier`) · `plq` nom de plaque · `sp` gerbe.
  Durées : NITRO MAX 6 → **9 s**, AIR MAX 10 → **14 s**, VITESSE ×2 6 → **8 s**. ⚠ la couleur de la NITRO MAX est réécrite par la session
  UHD (violet, `Object.assign(PWR_DEFS.n,…)` entre l'objet et la boucle des matières) — garder cette ligne à sa place.
- **TROIS NOUVEAUX** (minuteurs `pwrMagT`/`pwrBouT`/`pwrAurT`, tous lus/écrits par `pwrT(k)`/`pwrSet(k,v)`, ordre fixe `PWR_ORDRE`) :
  · **m AIMANT** (vert billet, 12 s) : pièces ET fruits de toute la largeur, 55 m devant, viennent à toi (en vol : 34 m) ; les cristaux restent à viser.
    MESURÉ : l'or à portée ramassé 5/5, 3/3 avec, 1/3 · 2/3 sans.
  · **b BOUCLIER** (acier, 20 s) : `bouclierSauve(cause)` en tête d'`explode` — vide, vol trop long, tour → la caisse retombe sur sa dernière
    ligne sûre (`respawn`), la chaîne d'ARGENT du vol est perdue, l'aura, le flow et la partie continuent ; jamais pour une mort de RÈGLE
    (police, feu, arrêt). Sous bouclier, une chute « perdue d'avance » depuis 2,2 s (`MIR.t`) est rattrapée tout de suite. Tant qu'il tient :
    plots démolis sans rien coûter (`pwrDemoli` : « DÉMOLI ×n », aura, nitro), l'huile ne mord pas ; un CHAMP DE FORCE qui grésille
    (`pwrHalo` : étincelles `sparkBlue` nées sur une coque autour de la carrosserie, en tangente, deux fois plus serrées les 3 dernières
    secondes). ⚠ La bulle en sprite a été essayée : invisible derrière la caisse, et plus forte c'était une TACHE RONDE (verdict du 25/09). MESURÉ : chute sauvée, la 2e chute sans bouclier tue.
  · **x AURA ×2** (or, 12 s) : `chaineAura` et `addAura` ×2.
- **CUMUL** : le même pouvoir repris AJOUTE sa durée (plafond 2 × `t`, plaque `.cumul`) ; deux pouvoirs actifs = « DOUBLE POUVOIR ! »
  (+70 aura), trois = « TRIPLE POUVOIR ! » (+150). Trois plaques et plus se serrent (`#pwrChip.pw3`, bloc `<style id="pouvoirsV2">`).
- **LE TIRAGE LIT LE JOUEUR** (`pwrPoids`, `pwrTire`, UN tirage `rnd` comme avant : le flux seedé ne bouge pas) : < 8 parties → BOUCLIER 28 %,
  AIMANT 23 % ; 8-30 → équilibré ; 30+ → AURA ×2 21 %, VITESSE 19 %. En campagne : poids fixes. `pwrPremier` : le 1er cristal d'un débutant
  (< 5 parties, zone 0, hors campagne) est un BOUCLIER posé près de l'axe.
- **MIRACULÉ** (`MIR`, `mirTick`/`mirPose`) : chute perdue d'avance (pas de réception en vue, en train de tomber, 10 m sous la route) pendant
  ≥ 0,6 s, et pourtant posée → +160 / +240 aura, flow risque PSYCHO. **SANS FAUTE** (`SFA`, `sfaPose`) : poses propres d'affilée (vol > 0,7 s,
  ni lourde ni ratée) → ×3, 5, 8, 12 puis toutes les 5 : aura + nitro ; « SÉRIE CASSÉE » dès 3. **PALIERS DE VITESSE** (`VPAL`, `vpalTick`) :
  chaque centaine franchie se crie à partir d'une centaine sous le record de vie (`VPAL.c0`) ; « RECORD DE VITESSE » quand il tombe.
- Sons : `PWR_NOTE` a les six clés ; les nouveaux événements appellent `sfx('pwr.double'|'pwr.triple'|'pwr.bouclierCasse'|'pwr.bouclierFin'|
  'pwr.bouclierPlot'|'jeu.miracule'|'jeu.palierVitesse')` sous garde `typeof sfx==='function'` (la session SON les sonorise).
- Hook : `dbgPwr(k,n)` prend un pouvoir (n fois) ; `dbgPwr()` = minuteurs, poids, sauvetages, MIR, série, palier, dauphin (`dol`), lieu
  du flow ; `dbgPwr('plot')` (le pilote vise le prochain plot), `('mir',x)`, `('sf',bool)`, `('devant')`/`('devantPris')` (banc de l'aimant).

## LE DAUPHIN v4 · SNAKE LOOP · RACCOURCI VERS LE PORTAIL · LA VILLE SE GAGNE SUR LA ROUTE (2026-09-28, nuit — même session)
- **DAUPHIN v4** (Sacha : « dès qu'on vole près de la route, sans délai, à l'endroit, à l'envers et sur les côtés » · « plus ça dure, plus
  on voit de dauphins » · « plus d'aura ») : `dolDist()` = distance au RECTANGLE de la dalle dans son plan de coupe (dessus, dessous,
  bords) ; tout vol à moins de `DOL_HMAX` (40 m) lance le dauphin À LA 1RE IMAGE (`DOL_T`=0). Le banc GRANDIT : 1 dauphin, +1 toutes les
  `DOL_PAS` (0,6 s) jusqu'à SIX (`DOL_BANC`, 3 gabarits ajoutés ; chaque nouveau JAILLIT en rejoignant le banc, `u.pret`) ; l'étiquette dit
  « DAUPHIN ×n », l'aura monte ×(1 + 0,15 par dauphin). ⚠ LA FIGURE (chaîne d'argent, « LE DAUPHIN ! », flow) n'arrive qu'à `DOL_FIG`
  (1 s) tenue, une fois par vol (`trkDolph`) : sinon chaque saut devenait une figure et la frénésie partait à n'importe quelle pose.
  Plusieurs passages par vol possibles. Aura : figure 80 → 150, prime 40 → 80 (à la figure), 25 → 40/s, au ras 45 → 90/s, plafond 1 200.
  MESURÉ : sortie par le côté → dauphin dès l'image 1, banc 1 → 5 en 2,4 s pendant la chute sous la route (|lat| 52 m, h −43 m).
- **SNAKE LOOP** (décoller, passer SOUS la route, se reposer du même côté) : il ne versait AUCUNE aura en propre → `chaineAura('SNAKE LOOP',320)`.
- **RACCOURCI VERS LE PORTAIL** (« couper la route pour rejoindre le portail plus vite doit rapporter du machiavélisme ») : l'ovule traversé
  EN VOL compte comme une pose — piste restante jusqu'à son entrée (~L−80) moins la ligne droite volée ≥ 60 m → `flowRaccourci` (MACHIAVEL).
- **LOI 15 DE FLOW2 — LA VILLE** (« dans la ville on peut moins voler : les traits doivent s'adapter à la vitesse sur route, moins à la
  voltige ») : `FLOW2.lieux.ville` réécrit fam (route/style montent jusque dans la triade), psy (la vitesse tenue paie 5 toutes les 1,2 s),
  part (en frénésie le style et la route nourrissent NARCISSE) et les mémoires des traits (13/32/4 s). `flowLieu(nom)` est appelé par
  `newTrack` ; hors ville tout revient au barème de base. À la révélation de la triade en ville : « VITESSE · DRIFT · TRICHE ».
  MESURÉ (`simville.js` = simtri avec 2,5× moins de sauts et 2× moins de raccourcis) : barème de base → le maître ne l'atteint presque
  jamais (93 % des parties) ; loi 15 → ~3 min, 21 % du temps, tenue ~70 s (nuages : 2 min 26, 30 %).

## LA CHASSE AUX DÉTAILS (2026-09-28) — « je ne te demande pas de changer drastiquement : traque tous les détails pour que le jeu soit parfait »
Sacha : « les animations du nitro pourraient faire beaucoup plus FLAMME, façon Asphalt 9 ; en nitro infini les flammes de la barre font
trop Minecraft, fais un truc premium ; vérifie que tous les textes sont bons ; pas de débogage ni d'optimisation, cherche les détails ».
Sept audits en lecture seule (textes, écrans, son, finition visuelle, 5 premières minutes, carrière), corrections par lots, chaque lot vérifié
au banc muet (scratchpad de la session 514feb73 : `nit.js` flammes/jauge, `tour.js` partie jouée — vol, pose, pause au clavier, NITRO MAX,
explosion, écran de mort, `LG=en` pour l'anglais —, `set.js` réglages, `carr.js` fin de l'ESPACE ; `chk.js` = syntaxe de chaque `<script>`).
- **LA FLAMME VIVANTE** (`jetMat`, `JET_VS`/`JET_FS`, horloge `JET_T`) : la plume de la caisse n'est plus une texture fixe qui tourne — un
  bruit périodique COULE de la tuyère vers la pointe et ronge la matière (les langues se détachent), racine BLEUE de brûleur sous un cœur
  blanc, corps à la couleur de la poussée qui rougit vers la pointe, bord qui s'efface avec l'angle, pointe qui erre (vertex). Profil tourné
  (`jetGeo` = LatheGeometry : étroit, ventre, pointe) au lieu d'un cône. `jetShellM.color`/`jetCoreM.color` restent de vraies THREE.Color
  (la boucle, l'arc-en-ciel, dbgNitro les écrivent). Chaque pot bat à son rythme. La meute brûle avec le même programme (bleu police).
  Les textures cuites `jetTex`/`jetCoreTex` ont disparu. Programmes compilés en course : 0 (mesuré).
- **LA JAUGE EN FEU v2** (`FEU`, `feuSprites`, `feuChaud`, `feuNait`, `nitroFeu`) : fini le feu de DOOM 96×18 agrandi — 220 bouffées
  (sprites radiaux cuits par teinte, blanc → rouge sombre) au pixel de l'écran, étirées en LANGUES, qui naissent sur la barre (la barre EST
  le foyer : au téléphone il n'y a que ~18 px d'écran au-dessus), tirées vers des foyers qui glissent, + étincelles et lueur de tranche.
  S'éteint quand la caisse explose. CSS : `#nitroFeu` 60 px, `bottom:0`, plus de `image-rendering:pixelated`.
- **FINITION VISUELLE** : secousses de caméra en SINUS (sol, vitesse, vol — plus de `Math.random` par image ; le vol calmé comme le sol ;
  les chocs EN VOL se sentent par le regard) · SUSPENSION (`susY/susV`, ressort sur `carBody`, déclenchée par `squashT` — la pose en pose
  un) : les roues ne s'écrasent plus en ovale · plots percutés et pièces d'explosion REBONDISSENT sur la dalle (`FLYCONES[].p0/n0/b0`,
  `BOOM_SOL`) et se replient en fin de vie · gerbes de ramassage là où l'objet disparaît · faisceau des phares éteint hors du sol · ombre de
  vol dans le plan de la dalle et en fondu · viseur d'atterrissage en fondu (`LM`) · caméra recalée au portail (`loop._camDriveT=0` dans
  newTrack) · glisse d'huile qui fume · éclats ROUGES pour ce qui coûte (plot, pose lourde) · replacement/repêchage : la caisse RETOMBE
  (`hopY=2.2`) · meute : plus de flaques rondes, apparition dans la brume (`lodP9`) · étincelles de la montée de moteur qui suivent la caisse ·
  l'onde d'allumage nitro sans test de profondeur (la route la coupait en fer à cheval).
- **SON** : les boucles se taisent en fondu à la pause et la SORTIE (`BUSOUT`) descend en ~40 ms avant `suspend()` (`busPlein()` la remet :
  reprise, compte 3-2-1, filet dans resetGame/endGame) · le « 3 » du compte attend le réveil du contexte · grondement d'explosion pour toutes
  les caisses · crunch des fruits dans le rang · l'intro obéit au curseur EFFETS · session audio iOS `ambient` quand MUSIQUE est coupée ·
  **les 4 sons d'argent ramenés à −20 LUFS** (le compteur était à −7 : +13 dB, il couvrait l'annonceur ; sur iPhone seul le fichier compte),
  même `v` pour tous. `early_dead.mp3` (−15 LUFS, voix grave) laissé tel quel : à juger à l'oreille.
- **VIBRATIONS** : leur propre interrupteur (`SND.vib`, `SAVE.d.vib`, ligne dans #mSet) — `hap()` ne suit plus le SON.
- **TEXTES** : figures traduites (AIR MONSTRE, DAUPHIN EN VOL, POSE PARFAITE/DIVINE, IMPACT MÉTÉORE), « PERMIS OBTENU » traduit, `fmtC`
  ne dit plus « 1000 k » (×.9995), `fmtAura` au format de la langue, anglais américain, « SHORT BY », « DEFIS », guillemets anglais, le chinois
  retombe sur l'anglais (TR), `<html lang>` suit la langue, apostrophes rendues (la police pixel les a), « TROP LONGTEMPS EN L'AIR » (10,2 s
  en orbite), « GRAVITÉ RÉDUITE », « FRANCHIS n PORTAILS ». La sauvegarde s'écrit quand l'appli passe en arrière-plan.
- **ÉCRANS / CARRIÈRE** : JOUER du garage pendant une bascule, glissé pendant le lâcher (`GAR.go`), EN BOUTIQUE, P clavier = panneau ⏸ en
  coque tactile (`window.__panBascule`), Entrée gardée, RECOMMENCER en carrière (`carrIci`), notes de l'écran de mort gardées, record
  cohérent au chargement, REVOIR L'AUTO-ÉCOLE tient parole (prime une fois : `SAVE.d.permis`) · ⚠ **la remise à zéro du Survivant était
  collée DANS un commentaire** (poursuite NUAGES 5 et meute VILLE 14 cassées dès la 2e course) · **l'ESPACE a une fin** (`espaceFinale`,
  « ESPACE TERMINÉ ») · REJOUER après une fin de monde ouvre le monde suivant · bannière de carrière traduite, sans double numéro.
- **L'ACCUEIL RÉORGANISÉ** (Sacha : « c'est pas beau que les deux boutons du haut soient au-dessus du titre ») : le LOGO ouvre l'écran,
  seul (marge haute 34 px, 6 px sous 720 px de haut) ; la rangée `.mOutils` (MISSIONS étirée sur la largeur des tuiles, cases au bout ·
  ⚙ carré qui ferme la rangée) descend entre la bande de la caisse et les tuiles — charte, règle 4 : on LIT en haut, on TOUCHE en bas.
  `menuCadre()` lit aussi `.mOutils` : la caisse se cadre au-dessus d'elle. Vérifié 844×390, 390×844, 667×375, 375×667, FR/EN (`home.js`).
- **LAISSÉ À SACHA (décisions, pas des détails)** : `TEST_CARRIERE`/`TEST_CAISSES` encore à `true` (caisses payantes gratuites, pastille
  « TEST » au garage) ; la BOUTIQUE est une vitrine (« BIENTÔT », « -50 % » sur un 9,99 € jamais pratiqué — refus Apple probable) ;
  **droits des sons** : `fx/kaching.mp3` (étiquettes « Yout.com », extrait YouTube), `fx/compteuse.mp3` (« 101soundboards.com »),
  `death/minecraft.m4a` (le son de Minecraft ?) — à remplacer avant la sortie ; noms de caisses en français en anglais (marque).

## L'ACCUEIL EN HAUTE DÉFINITION — VHD (2026-09-28, nuit) — « pousse les graphismes au max, juste pour l'écran d'accueil »
- `VHD` (à côté de `qlPose`) : tant que la vitrine tourne (`vhdBascule` dans loop : ni garage, ni course, ni étal), la 3D est calculée à
  la densité PLEINE de l'écran — sur-échantillonnée ×1,5 sur l'ordi, budget 8,3 M pixels (3,2 M sur téléphone, sans sur-échantillonnage)
  —, ombre en carte 4096 (2048 téléphone), anisotropie max de la route et de sa peinture (`ASPH_TEX`, `LIGNE_TEX`), échelle QL au cran 0
  et EN VEILLE. `qlPose` lit `VHD.on` (résolution + carte d'ombre) : UN seul chemin. Filet : p75 > 22 ms (hors 30 Hz) → ×0,8 toutes les
  1,5 s, jamais sous `DPR_CAP`. À la sortie, `qlPose(VHD.k0)` rend l'échelle telle qu'elle était. `?hd=0` coupe ; `dbgVHD()` décrit.
- ⚠ MESURÉ sur l'ordi (colonne 844 × 390 zoomée ×2,27 sur 1 920 px) : sans VHD la 3D de l'accueil faisait 0,33 M pixels (DPR 1 en
  RAPIDE, étiré ×2,27) ; avec, 3,8 M (DPR 3,4). En COURSE rien ne change : DPR 1 / ombre 1024 / aniso 4, comme avant — c'est aussi
  pourquoi la course paraît floue sur PC en RAPIDE (NETTE = 1,5).

## MISSIONS · SORTIE MENU · CIEL DE JOUR À L'ACCUEIL (2026-09-28, soir)
Sacha, en rafale : « il manque un bouton pour revenir au menu » (écran de mort) · « dans le menu il faut aussi un bouton mission » ·
« l'écran de mission doit être parfait, avec une jauge de progression et un texte expliquant la récompense » · « les couleurs de
l'écran de début sont bof, je préfère le ciel en journée, il matche mieux avec les couleurs du jeu rose, bleu, jaune ».
- **SORTIE MENU** : `.mFin` = MAISON (`.mMenu`, `data-m="menu"`, icône pixel `maison` ajoutée à `PXI_G`) | REJOUER (le lingot, seul en
  or, prend le reste). ⚠ REJOUER vit désormais DANS `.mFin` : ordre, marges et `grid-area:rej` du paysage sont portés par `.mFin`.
  `accueilRetour()` (sous le volet) : la partie finie reste finie (`started && gameOver` → le départ suivant passe par `resetGame()`,
  jamais `start()`), mais `MENUV.retour` fait de l'ACCUEIL la racine (`mRoot`), rallume la VITRINE (loop, ombre de contact, Entrée) ;
  débris, meute (`survMenage()`, extrait de `survStart`), carrière en cours rangés ; piste de menu neuve. `rebuildMenuScene()` baisse
  `started` le temps de `newTrack` quand `MENUV.retour` : ciel posé d'un coup (pas le fondu « portail »), ni annonce ni porte d'orbite —
  vaut aussi pour la CARRIÈRE et l'AUTO-ÉCOLE lancées de cet accueil. `resetGame()` éteint `MENUV.retour`. `body.dead` reste posée.
- **LA PORTE MISSIONS** : `.mMisBtn` dans `#mHome .mOutils` (⚠ depuis la chasse aux détails : la rangée est descendue SOUS la bande de
  la vitrine, au-dessus des tuiles — voir « L'ACCUEIL RÉORGANISÉ ») ; trois cases `#mMisPips`, une par défi relevé (posées par `mFill`).
- **L'ÉCRAN `#mMis`** (routeur : `mScr.mis`, `PROF.mis=1`, rempli par `misRender()`) : RÉCOMPENSE (`.misUne` : catégorie, vignette
  `objFig`, nom, phrase qui dit POURQUOI elle ne s'achète pas — `misRecoInfo`, accordée par catégorie ; la JAUGE des trois défis ;
  touchable → `misVoir` ouvre la caisse/l'habillage au garage) · LES TROIS DÉFIS (`.misDef` : consigne, prime en vert billet, jauge
  cyan → verte relevée, « TON MEILLEUR ESSAI 410 / 672 ») · LA RÈGLE (une partie par défi, prime tout de suite, récompense à la fin
  de la partie) · ENSUITE (le contrat suivant, sous cadenas). Nouveau en sauvegarde : `SAVE.d.mis.best` (meilleur essai en UNE partie,
  tenu par `misTick`, remis à zéro par `misFin`, désinfecté dans `san()`). Paysage : règle à droite du titre, récompense à gauche,
  défis à droite, ENSUITE dans la rangée du RETOUR — tout tient en 844 × 390 sans défiler ; 390 × 844 aussi. FR/EN/中文.
  ⚠ `#overlay p` (vieille feuille : centré, interligne 1,9) passe devant une classe seule : `#mMis .misExpl`.
- **CIEL DE L'ACCUEIL** : `MENU_BIO='matin'` (le jour des NUAGES, validé le 27/09) au lieu de `couchant` ; voile du haut de l'accueil
  allégé (`#overlay::after` .84 → .48, sinon le zénith restait noir). Comparés en captures : couchant · matin · midi · aprem · aurore ·
  lever. Hook : `dbgMenuCiel('aprem')` pour en essayer un autre.

## LES PLANS DE L'ACCUEIL (2026-09-28) — « l'image derrière pourrait faire de meilleurs plans, mieux cadrer »
Sacha : « j'aime bien les boutons et la DA, mais ce qui est affiché à l'écran n'est pas ouf ». MESURÉ aux captures (844×390 = l'ordi,
390×844) : en PAYSAGE la caisse était filmée au CENTRE, pile derrière le logo et les tuiles — on ne la voyait JAMAIS ; une dalle de bitume
noir mangeait le bas (caméra à 4 m, regard plongeant) ; au 1er instant la caméra arrivait d'en haut (lissée depuis rebuildMenuScene).
- **`menuCadre()`** lit (1×/s) les boîtes de `.mTitle`, `.mIcons`, `.mPlay` de `#mHome` → la ZONE LIBRE : la plus large bande latérale en
  paysage, la bande entre le logo et les tuiles en portrait (menu PC `?pc=1` : au centre, comme avant). **`menuCamera()`** vise la caisse
  puis PIVOTE (lacet/tangage exacts, `atan(ndc × tan(demi-champ))`) pour la poser au centre de cette zone ; la DISTANCE sort de la sphère
  englobante de la caisse (×1,3 : en trois-quarts elle projette ~30 % plus large) pour qu'elle en remplisse la largeur.
- **TROIS PLANS, COUPES FRANCHES** (`MENU_PLANS`) : AFFICHE 8 s (trois-quarts avant bas, l'angle de `menuPlan`) · ARRIÈRE 7 s (trois-quarts
  arrière bas, la route qui file vers l'horizon) · PROFIL 7 s (plein côté, focale 30°, lent travelling). Caméra POSÉE à chaque image (le
  plan est une fonction lisse du temps ; la coupe est franche, pas de travelling de raccord). À chaque coupe, le plan choisit son CÔTÉ
  (miroir) : celui où le soleil « 1.61 » reste HORS de l'image finale, pivot compris (`menuSoleilVu` le projette). Lampe de vitrine
  dosée par plan (`lum` ; le profil a le soleil dans le dos, à 3,4 il délavait la carrosserie). Écarté après captures : un plan DRONE
  depuis le vide (plongée 35-40° : que du noir sous la caisse).
- Hook : `dbgVitrine()` rend `plan` et `cadre` ; `dbgVitrine(null,'profil')` force un plan, `dbgVitrine(null,null)` rend la main.
  Banc : scratchpad de26fdc9 `vp/menushot.js` (captures DOM + WebGL, paysage/portrait, 3e argument = plans à forcer).

## PORTÉ DE LA LIGNÉE car-crash (2026-09-28) — pièces instanciées, génération au sol, pleins de nitro
Repris du travail « progression & récompenses » de la branche `claude/practical-edison-19vbia` du dépôt `car-crash` (même ancêtre) —
seulement ce qui s'applique ICI sans toucher à l'économie ni au FLOW v2. Banc : scratchpad de la session de26fdc9, `vp/static.js`,
`vp/smoke.js`, `vp/robust.js` (harnais `harness.js`, `ROOT` = ce dossier, `?colonne=0`).
- **PIÈCES INSTANCIÉES** (`coinIM`, `COIN_CAP`=4096, `coinPose`, `coinFlush`, `pk.ci`) : une pièce = un appel de dessin ; désormais UNE
  InstancedMesh. Chaque pièce garde un FANTÔME (`pieceNeuve` rend un Object3D, recyclé par `PIECES_LIBRES`) : aimant, ramassage, LOD,
  rotation inchangés. Le LOD RANGE EN TÊTE les seules pièces du couloir à chaque image et `count` = leur nombre (même méthode que
  `conesVus`). ⚠ MESURÉ : une zone 7 porte ~9 100 pièces (2 faces) — les garder toutes dans l'instance, même écrasées à zéro, faisait
  passer 2,1 M de triangles dégénérés par le vertex shader. Au MENU (LOD à l'arrêt) `spawnPickups` pose d'emblée le couloir du départ.
  Les pièces du FOURGON restent de vrais maillages. MESURÉ zone 7 palier 22 : **257 → 137 appels de dessin**, triangles inchangés.
- **`spawnPickups`** : `dodge()` écarte pièces et fruits des plots et des flaques (MESURÉ avant : 3 à 19 pièces posées SUR un plot par zone
  et par face ; après : 0) ; le pas des motifs s'allonge en `STR`=√(poussée × `lateMul`) (1 → 2,1 ; 1 en CAMPAGNE, pistes fixes). ⚠ L'avance
  d'un motif au suivant se compte sur sa longueur d'ORIGINE (`/STR`) : le NOMBRE de pièces par zone est identique à avant (mesuré sur
  7 zones × 3 graines, écart < 0,1 %). Aucun appel `rnd()` ajouté ni retiré.
- **LE PLEIN = LE MOTEUR** (`nitroCap()`) : portail, NITRO INFINIE / boost de départ et `sandRevive` écrivaient `nitroR=2` en dur — ils
  VIDAIENT un réservoir de 3,6 (jauge à 55 % pendant la nitro infinie au palier max).
- **GRAVITÉ LUNAIRE EN ESPACE** (`gK()`, `airMax()`, `ORB_G`=.5, `ORB_AIR`=1,7) : l'orbite était un décor (mêmes sauts, même jauge qu'aux
  nuages). En ESPACE (`LVL.espaceA>=.5`, niveau EN ORBITE et carrière ESPACE, jamais au parc) la gravité est ÷2 pour TOUS les
  intégrateurs (joueur, VOL PLANÉ à la nitro — ⚠ ×gK lui aussi, sinon .6×33 battait .5×33 et la caisse montait seule —, viseur, meute,
  dos d'âne, plots qui valsent), la jauge d'airtime passe à 10,2 s, la perte à la pose (`bigness`) suit. La bannière du niveau dit
  « GRAVITE LUNAIRE : SAUTS 2X PLUS LONGS ». MESURÉ : même impulsion → 13 m de haut contre 6,4. (Nitro tenue dès le décollage : on
  grimpe, comme aux nuages — c'est le piqué qui ramène.)
- **PLUIE DE DÉBRIS EN ORBITE** (`DEB`, `debArme`, `debFrappe`, `debTick`, `debCache` ; console `dbgDebris()` / `dbgDebris(1)` arme une
  chute) : des morceaux de satellites qui rentrent en brûlant — PAS « météore », c'est déjà une FIGURE. Même grammaire que la FOUDRE de
  la ville (cercle posé là où tu SERAS dans `DEB_T`=1,5 s, sur TA ligne ±4 m, rayon `DEB_R`=7,5, sifflement qui plonge), plus un
  FAISCEAU rouge dressé sur la cible (lisible de loin) et la tête + traîne qui arrivent de trois-quarts avant (~27° de pente, ~35° de
  côté : dans le cadre tôt, traîne visible). Impact = `cratere(…, leger)` (le cratère de la figure MÉTÉORE, plus petit, SANS slam ;
  secousse et son dosés à la distance). **TOUCHÉ** : vitesse ×.6, flow −20, la gerbe soulève (`hopV` 7,5 — ça plane), « TOUCHE ! ».
  **ESQUIVÉ de près** (< 16,5 m) : « ESQUIVE ! ×n », flow + aura (famille `esquive`, celle de la foudre) + nitro .12 → .24 avec la série.
  Sous la dalle : « A L ABRI ». Cadence 3,4 s → 1,9 s vers le portail ; rien sur les 140 premiers / 150 derniers mètres ni dans le
  couloir d'un tremplin. Tous les niveaux où `gK()<1` (EN ORBITE et la carrière ESPACE), jamais au parc ni à l'auto-école ; la meute
  n'est pas visée (comme pour la foudre). Caché par `newTrack` et `campStop` (fin de partie). MESURÉ en simulation, 8 chutes : pilote
  qui tient sa ligne → 4 à 6 touchés ; pilote qui s'écarte → 0 touché, série ×7. ⚠ Vu en capture et corrigé : tête de taille FIXE
  (26 m) = un quart d'écran quand elle passe près de l'œil → taille ∝ distance, bornée ; disque, anneau et faisceau s'éteignent
  quand la caméra SURVOLE la cible (ils rougissaient la moitié de l'écran) ; PAS de braises `embers` le long de la trajectoire (ce
  pool se dessine en gros pâtés pixel dans le ciel). Banc : `vp/debris.js` (simulation), `vp/debshot.js` (captures).
- Petits : la figure rend ×2 en pose DIVINE (×1,5 en PARFAIT, inchangé) ; `engSndParams` borne `rpm` ≥ 0 (un NaN dans un AudioParam
  éteint le nœud pour la session) ; `#runStats` en `white-space:pre-line`.
- **PAS REPRIS, exprès** : décote du bump (sa recharge est une demande de Sacha), débordement vers la réserve bleue (économie des fruits),
  badge ×N / barre de palier / objectif de fin (le HUD d'ici a les siens), aimant (déjà sans `level`).

## LA CARTE MOTEUR v4 (2026-09-28, Sacha : « l'animation du déblocage des moteurs plus belle, plus soignée, plus pro, adaptée à l'iPhone,
maîtrisée — qu'on soit content de débloquer le moteur »)
Filmée d'abord (banc `moteurfilm3.js` : captures rapprochées ~85 ms au vrai format 390×844 — ⚠ le screencast CDP rend un 800×600
tronqué, inutilisable ; planche `planche.py`, scratchpad d82605e6). Le principe voulu par Sacha est GARDÉ (le moteur apparaît au-dessus de
la caisse puis rentre dans le capot) ; ce qui change :
- **Composition centrée** (`engBig`) : BANDEAU `.ebTit` à la couleur du moteur (or si « NOUVEAU SOMMET »), NOM 22 px, ligne `.ebInfo`
  (`.ebPal` PALIER n · `.ebGain` +N KM/H en `--cashV`), cylindres `.ebCyl` dessous (`.dense` au-delà de 8), puis la scène 3D. L'ancien
  badge `.ebNum` décalé à gauche a disparu. CSS : bloc « LA CARTE MOTEUR v4 » après `@keyframes eb2Ruban` (charte4).
- **Taille iPhone** (`engBigPlace`) : plancher d'échelle .86, plus de réduction d'après la caisse (à .62 le titre se taisait, nom à 13 px).
- **Le moteur se lit sur tout ciel** (`engQuadDraw`) : halo à sa couleur + DISQUE D'ENCRE (`engNoir`, même programme prémultiplié) qui ne
  laisse qu'un liseré ; ÉCLAT blanc-chaud à l'apparition (`ENG_Q.fl`, 260 ms).
- **Rythme** : 1,15 s au-dessus de la caisse (`ENG_COULOIR`, était 0,9), plongée 0,52 s ; chaque cylindre qui s'allume sonne une note qui
  MONTE ; le gain claque (`.gain`) quand le dernier s'allume.
- **La récompense à l'impact** (`engImpact`, appelée par `engPlonge`) : éclair d'or, `fovPunch`, secousse (déplacée de `engSwapArme`, où elle
  tombait pendant que le moteur flottait), le moteur RUGIT (`boost` .8 + `boostSnd`), et « +N KM/H » jaillit de la caisse (`popTexte`).
  `engGain(tier)` = vmax × `FLOW_VREF` × Δpoussée (≈ ce que le compteur gagne en croisière : +16 au bicylindre, ~+30 au V12).
- Signaux gardés : `body.ebOn` / `body.ebPlonge` (la session interface estompe les pouvoirs avec).

## CAMÉRA DE VOL v2 · POSE PARFAITE · PORTES DE L'ORBITE (2026-09-28 — idées reprises des sessions cloud, refaites ici)
- ⚠⚠ **RETIRÉE LE SOIR MÊME** (Sacha : « la caméra en air time déconne complètement, ça devient beaucoup trop dur de viser juste ») :
  filmée au banc sur un gros saut, la v2 partait sur le flanc et SOUS la caisse dès 1,3 s de vol (caisse vue de dessous en gros plan,
  route réduite à un trait en biais, gauche/droite inversés à l'écran). Retour à la caméra de POURSUITE d'avant (lissage en position
  monde : le retard aligne le regard sur la direction du vol ; champ 76° → 54° avec l'ampleur du saut). Gardés : secousses calmes,
  coup de zoom PARFAIT remis à zéro au décollage, chocs en vol en petit DÉPLACEMENT (plus dans le regard). NE PAS remettre de plan
  de côté ni d'écart tenu court en vol. Banc : `vol.js` (scratchpad 446ee745, film d'un gros saut). Ce qui suit est l'historique.
  **+ LE BRAS** (même nuit, Sacha : « sur mobile la voiture devient trop petite en air time, il faut juste pas que ça complexifie ») :
  MESURÉ en portrait, la poursuite décrochait à 17-18 m dans la 1re seconde (caisse à la MOITIÉ de sa taille au sol). La caméra garde
  la direction de la poursuite mais ne s'éloigne plus au-delà de la distance qui garde la caisse à sa taille du décollage (`CAMV.s0`,
  `volR`/`volTaille`) : 0,185-0,19 de la demi-hauteur tout le vol (0,12 avant), paysage 0,225-0,26. Le VISEUR (`landMark`) passe
  par-dessus tout (`depthTest:false`, `renderOrder` 999) : une caisse plus grande ne cache jamais l'endroit où l'on se pose.
  Mesure console : `dbgCamVol()` (distance, champ, taille, écart anneau/caisse en tailles de caisse).
- **CAMÉRA DE VOL** (bloc « CAMÉRA DE VOL v2 » du mode 'fall', état `CAMV`) : on lisse l'ÉCART caisse→caméra (`CAMV.off`), plus la
  position monde — le `lerp(cible, dt*3)` traînait de vitesse÷3 : MESURÉ 23-36 m derrière en vol, désormais 7-9 m (5-7 au sol).
  HANG TIME : réception prédite à plus de 1,3 s (`CAMV.eta`, posé par le viseur d'atterrissage) → la caméra pivote de trois-quarts
  (~57°) côté SOLEIL autour de `FLY_U` ; réception proche → retour derrière et regard tiré vers l'anneau. Champ 78° (le zoom 76→54°
  qui compensait la traîne a sauté). L'écart repart de la vraie caméra au 1er plan du vol (aucune coupe).
- **POSE PARFAITE** (`poseParfaiteFx`, appelée au verdict dès g ≥ 1,5) : COUP DE ZOOM (−24° sec, relâché en 0,5 s — `CAMV.zoom/zp`, lu
  par la caméra au sol via un champ « de base » `loop._fovB`) + COURONNE DORÉE depuis les bords (`flashEcran` or) ; DIVIN : deux battements.
- **PORTES DE L'ORBITE** (`ORBFX`, `orbWarp`/`orbFeu`/`orbFxTick`, crochet en tête de `newTrack`, portail franchi en course seulement) :
  ENTRÉE = tunnel de distorsion 1,9 s (la distorsion `uSpeed` du boost poussée à .95, `fovPunch` jusqu'à 34°, traits de lumière en anneau,
  éclair bleu à l'entrée et à la sortie) ; SORTIE = rentrée en feu 2,6 s (bouclier de plasma = 2 sprites additifs `lampTex` au nez et
  autour de la caisse, flammes sur la silhouette vue de derrière — nées au nez, la caisse les cachait —, `nitroLight` passe au nez en
  rouge-orange, bords d'écran qui battent orange, crépitements). Banc : `camorb.js` / `orbonly.js` (scratchpad d82605e6).

## PASSE DE LANCEMENT (2026-09-28) — « imagine qu'il sort sur l'App Store, vise le top 1 des jeux de course »
Bancs muets dans le scratchpad de la session d82605e6 (un à la fois) : `balade2.js` (nouveau joueur au vrai doigt), `boucle.js` (mort →
rejouer : ~2,9 s, les touchers de la 1re demi-seconde sont avalés exprès), `endurance.js` (5 min, 14 niveaux : 0 erreur silencieuse,
tas stable 50-111 Mo), `oreille2.js` (note CHAQUE texte affiché, par langue), `langtest.js`, `ecole.js`/`ecole3.js` (auto-école au clavier),
`demarrage.js` (profil CPU du lancement).
- **LANGUE** : `langAuto()` — sans choix enregistré, la langue du TÉLÉPHONE (`LANG_AUTO` = fr, en ; le chinois, incomplet, reste au
  sélecteur). Avant : tout le monde démarrait en anglais.
- **ARGENT** : `fmtC` suit la langue — anglais/chinois en échelle COURTE (`UNITS_EN` : k M B T Qa Qi…, point décimal) ; « $ 2 Bn » voulait
  dire 2×10¹² ici et se lit « deux milliards » aux USA. Le français garde `UNITS` (échelle longue, virgule). La fête des ordres de grandeur
  lit `unitsL()`.
- **TR** traduit les compteurs composés « MOT ×n » / « MOT +n » quand la phrase exacte manque (la tête passe au dictionnaire). Ajoutés :
  la liste d'aura (RÉCOLTE, VIRAGE SERRÉ, FRÔLÉ, RAFALE, MÉTÉORE…), les 3 pouvoirs, la meute (`TR('TOI')`, `TR('EN TÊTE')`), le « TOI » du
  classement. Banc `oreille2.js` en anglais : 0 texte français restant.
- **AUTO-ÉCOLE** : l'étape POSE-TOI rend le vol infini ; un débutant passé SOUS le bitume rebondissait contre le flanc de la dalle pour
  toujours (2 essais sur 2). Après 9 s de vol : `sandRevive`, retour à DÉCOLLE, « RATÉ ! GARDE LE NITRO, VISE LE DESSUS ».
- **popTexte** : largeur calibrée à 72 % de l'écran (le rebond ×1,15 d'entrée faisait déborder les textes à 84 %).
- **Mesuré, pas touché** : le lancement bloque ~9 s sur le PC du banc (compilation des shaders « chauffe » : nuages 5 s, ciel 2,4 s) — à
  mesurer sur iPhone avant toute décision ; les noms de caisses et leurs fiches restent en français (choix de marque à trancher par Sacha).

## LE FLOW v2 — « LE FLOW SE GAGNE AU BORD DU VIDE » (2026-09-28)
Demande de Sacha : « le flow invite trop à rester sur la route ; on doit parfois prendre des raccourcis pour tricher et ça ne remplit
pas le flow ; la frénésie DARK TRIAD doit pousser aux figures et aux raccourcis ; plus long à atteindre, à partir d'une certaine
vitesse ; jouissif d'y arriver et de la garder (sinon la musique s'arrête) ; vitesse et peur de la mort ». MESURÉ AVANT (pilote auto) :
collé au bord de la route, sans un saut, FRÉNÉSIE en 11 s et gardée pour toujours (rase-bord 10 pts/s qui rendait le répit).
- **LE BARÈME = le bloc `<<<FLOW2>>>`** (juste avant `const FLOW`) : PUR (ne lit que ses arguments + `FLOW2`), exécuté tel quel par le
  banc `sim.js` (scratchpad de la session d82605e6). Tous les réglages vivent dans `FLOW2`, nulle part ailleurs :
  · **3 familles** — `flowAdd(q, fam)` : `'route'` (pièces .7, pads 6, lignes, rase-bord 6/s) CHAUFFE puis s'essouffle (×1 · ×.5 · ×.12 ·
    0 dans la triade) et ne rend le répit que sous 50 ; `'style'` (drift 9/18/27, frôlé 4-8, bump 6, radar, esquive…) monte bien, faiblit
    dans la triade (×.35) ; `'risque'` (figures EN VOL en direct via `addTrick`, BIG AIR 6, AIR MONSTRE 10, pose PARFAITE 10 / DIVINE 14,
    À L'ARRACHÉE 12 / AU CHEVEU 20, GAP 12/18, SERPENT 15, RACCOURCI 12 + 0,06/m coupé plafonné 45, radar en excès, à l'aveugle…) paie partout.
    Famille par défaut : style. `FLOW2.cel` durcit chaque cellule (×1 · ×.8 · ×.65 · ×.5).
  · **La vitesse multiplie tout** : `FLOW.vit` = `flowVitN()` = km/h ÷ (`vmaxShow()` × `FLOW_VREF` 2,9) — MESURÉ : ≈1 en croisière élan
    plein, 1,25-1,4 en nitro, ~0,5 au départ ; en vol, la vitesse HORIZONTALE. ×.35 à .6 → ×1 à 1 → ×1,35 à 1,3. Sous `gate` (.95) la
    TRIADE ne prend RIEN (classe `.lent` : la 4e cellule gèle en gris ; « PLUS VITE ! » une fois par partie).
  · **Plus on monte, plus ça brûle** : `pente` permanente (rose 1/s, triade 2/s) + `fuite` passé le répit de 2 s (5·7·9·11). EN VOL RIEN
    NE FUIT (`flowTick` : le répit ne s'écoule pas en 'fall'). **La frénésie** (`FLOW2.fren`) : pente 1,2 + fuite 2 après 3 s, × la vitesse
    (×3 à .6 · ×1 à 1 · ×.3 à 1,3) — mesuré en jeu : ~4 s sans rien à la croisière, 15 s+ en nitro continue. Sa perte rend 2 s de répit.
- **LE RACCOURCI, DANS TOUS LES MODES** (`flowRaccourci`, fin de `tryLand`) : piste parcourue depuis le décollage (`FLOW.s0`, posé dans
  `startFall`) MOINS la distance volée en ligne droite (`FLOW.p0`) ≥ 60 m. Hors campagne : « RACCOURCI +340 M » (prio 3), nitro, aura.
  En campagne `campRaccourci` garde son annonce et sa nitro, le flow passe par ici (plus de `flowAdd(22)` là-bas).
- **LA TRIADE CACHÉE** : la barre démarre en 3 cellules ; la rose pleine → `flowRevele()` (classes `.revele` + `.ouvre` : la 4e pousse
  de zéro, les autres se serrent ; « RISQUE + VITESSE » la 1re fois de la session, « DARK TRIAD » ensuite). Ouverte jusqu'à la fin de
  la partie (`flowReset` la referme). CSS : section 10 (a') de charte4.
- **LA MUSIQUE DE LA FRÉNÉSIE** (`MUSIC_FREN`, `FRENM`, `frenMus(on)`, juste avant `musicPause`) : entrée → le morceau de la triade
  TOMBE sur le lecteur unique (source changée, jamais un 2e `<audio>` : iOS le refuserait) ; sortie → tape-stop 0,4 s puis la radio
  reprend À LA SECONDE où elle était (ou le morceau du nouveau lieu si `musicSuitLieu` a changé pendant). ⚠ **LE FICHIER N'EST PAS
  LIVRÉ** : Sacha le posera en `assets/audio/music/dark-triad.mp3` (ASCII, sans espace ; `drop` = secondes à sauter). Absent (sonde
  `frenMusSonde` au démarrage, ou erreur de lecture → `frenMusRate`) : REPLI « surmultiplié » — la radio monte d'un demi-ton (+6 %,
  `playbackRate` sans préservation de hauteur) et retombe à la sortie. `surm:1` l'éteint. `musicStop` remet tout à plat.
- **Hooks** : `dbgFren('risque'|'style'|'route', n)` (un geste d'une famille), `dbgFren('vit', x)` (force la vitesse, `null` = vraie),
  `dbgFren('journal')` (ouvre/lit les 80 derniers gains : [t, famille, brut, versé, v, vit] — fermé par défaut, zéro allocation en jeu),
  `dbgFren()` rend aussi `vit`, `revele`, `musique` ('radio' · 'triade' · 'surmultipliee').
- **Bancs** (scratchpad d82605e6, muets) : `flowbanc.js` (pilote auto, sources par ligne), `frenbanc.js` (révélation, gel, frénésie,
  musique ; 2e argument = un mp3 pour simuler le morceau livré), `sim.js` (joueurs types, lit le bloc dans index.html). RÉSULTAT :
  sage et colle-bord plafonnent FLOW I / II (0 % de frénésie), pilote de route 2 %, casse-cou 1re frénésie ~60 s (22 % du temps,
  ~26 s d'affilée), maître ~30 s (57 %, ~64 s d'affilée).

## LA FRÉNÉSIE v4 — « LA TRIADE » + LA POSE RATÉE + LA FIGURE QUI DÉCLENCHE (2026-09-28, fin d'après-midi)
Sacha : « l'état de frénésie doit rappeler les traits de la dark triad : tant qu'on les respecte on reste en frénésie — NARCISSISME : la
prise de risque, l'ambition, les figures inutiles pour le sport ; MACHIAVÉLISME : la triche, couper les chemins ; PSYCHOPATHIE : la vitesse
à fond, le nitro appuyé tout le temps » ; « en cas de mauvais atterrissage, de travers ou à contresens, le flow retourne à zéro » (tranché
au questionnaire : DE TRAVERS = plus de ~55° de l'axe, À CONTRESENS = sens inverse ; le bonus « À RECULONS » est SUPPRIMÉ) ; et (relayé par
la session UI) « la frénésie part après avoir POSÉ UNE FIGURE — l'atterrissage est la condition, en plus du score de flow ». Lois 8-9 de `FLOW2`.
- **LA TRIADE** (`FLOW2.triade`, `TRAITS`, `frenTrait/frenTriade/frenTraitsMaj`) : en frénésie, trois traits à mémoire — NARCISSE 9 s (tout
  geste 'risque' par défaut : figures en vol, BIG AIR, poses parfaites, arrachée, serpent… ; un frôlé en rend 30 %), MACHIAVEL 25 s
  (`flowAdd(…,'risque','m')` : raccourci ≥ 60 m, gap ; une petite coupe 25-60 m au prorata), PSYCHO 3 s (nitro enfoncé, ou `vitN` ≥ 1,3).
  Ils se vident au sol, jamais en vol. La zone rouge brûle selon les traits VIVANTS : `brule` [4, 2, .7, −1.5] /s (0 · 1 · 2 · 3 vivants —
  les trois tenus, elle se REGONFLE). Les gestes ne remplissent plus la jauge en frénésie (`fam[…][4]` = 0) ; le nitro n'y GÈLE plus rien
  (il est PSYCHO) — il ne gèle que la MONTÉE. Un trait qui meurt se crie (« UNE FIGURE ! » · « TRICHE ! » · « NITRO ! »), une fois par trait
  et par frénésie, 0,9 s entre deux appels ; un trait qui renaît sonne. Entrée : les trois PLEINS. Affichage : `#frenTraits` (trois `<i
  data-t>` : nom + barre `--f`, `.faible` < 30 %, `.mort`, `.fl1/.fl2` = nourri) sous `#frenChrono`.
- **LA JAUGE PLEINE ARME, LA FIGURE POSÉE DÉCLENCHE** (`frenArme`, `frenDeclenche`) : à 100, `FREN.arme` (classe `.arme`, « POSE UNE
  FIGURE ! ») ; la frénésie part dans `tryLand`, à la pose d'un vol qui a porté une figure (`chain>0` ou BIG AIR) et qui n'est pas ratée —
  voix TRIPLE MONSTRE, slam, musique, `#triade.on` (le titre TRIPLE MONSTER de la session UI l'observe). Désarmée sous la zone rouge (88).
  `flowAdd` plafonne le palier à 3 : on n'entre en frénésie QUE par `frenDeclenche`.
- **LA POSE RATÉE** (`poseAng`/`poseRatee` juste après `const impact` dans `tryLand`, `flowCasse`) : angle entre la trajectoire à plat dans
  la dalle (= le cap de la caisse : le volant tourne le vol lui-même) et l'axe de la route ; > `FLOW2.pose.angle` (55°, dès 4 m/s à plat) :
  grade décoté comme un POSÉ LOURD (pas de PARFAIT, pas de montée de grade au braquage), puis, la pose jugée, le flow tombe à ZÉRO (frénésie
  comprise, sa tenue compte pour le record) : « DE TRAVERS ! » / « À CONTRESENS ! » (> 90°). Mesuré : saut droit = ~10°. ⚠ à ces vitesses,
  braquer franchement en vol fait surtout RATER la dalle (la mort) : la règle mord sur les petits sauts et les vrilles de 180° posées.
- Hooks : `dbgFren('entre')` (déclenche), `dbgFren('trait','m')` nourrit / `('trait','m0')` vide, `dbgFren('pose',1)` (pose ratée),
  `dbgFren()` rend `triade {n,m,p,k}`, `arme`, `poseA` (dernier angle de pose). Bancs (scratchpad 41020878) : `sim3.js` (triade + arme ;
  profils « sans triche », « sans nitro »), `frenv5.js` (arme → vrai saut → frénésie ; PSYCHO seul → deux appels, perdue ~8 s), `poseDroit.js`.
  Mesuré (sim3, 5 min) : casse-cou 1re à ~157 s, tenue ~73 s, 85 % du temps avec les trois vivants ; maître ~75 s, tenue ~2 min 25 ;
  maître sans jamais tricher : tenue ~42 s ; sans nitro : ~60 s.

## LA FRÉNÉSIE v3 — « PLUS DURE À ATTEINDRE, MOINS FACILE À PERDRE, UN BUT EN SOI » (2026-09-28, l'après-midi)
Sacha, après le FLOW v2 : « on l'a trop dans le jeu ; en frénésie le nitro baisse 2× plus lentement ; tant que le nitro est activé
le flow ne baisse pas ; atteindre la frénésie doit être un but en soi » puis « plus dure à atteindre mais moins facile à perdre ».
MESURÉ AVANT (`sim2.js`, plots fidèles au jeu — un plot touché ne retire PAS de flow) : casse-cou en frénésie à 51 s, 47 % du temps ;
maître à 24 s, 77 %. Le réglage vit TOUJOURS dans `FLOW2` (commentaire « LE FLOW v3 », lois 5-7) :
- **LE NITRO GÈLE LE FLOW** (`flowTick` : `FLOW.nit = nitroOn && mode!=='boom'`, passé à `flowPerteDe(…, nit)`) : ni perte ni répit
  qui s'écoule tant qu'il brûle — comme en vol. La bande prend `.gele` ; pas de fuite affichée ni de tic d'alarme (`flowReste`).
- **EN FRÉNÉSIE LE NITRO DURE 2×** (`FLOW2.fren.nitro` .5) : la consommation au sol ET le coup de réacteur en vol (12 % × .5).
  Mesuré au banc : net −0,3/s en frénésie contre −0,8/s hors frénésie (recharge .2/s comprise).
- **LA MONTÉE EST LONGUE** : `cel` .5 · .35 · .22 · .14 (v2 : 1 · .8 · .65 · .5), fuite 3 · 3,5 · 4 · 3, pente 0 · 0 · .4 · .4, répit 2,5 s.
- **LA FRÉNÉSIE TIENT** : `fren` pente .7, fuite 1,5, répit 4 s — perdue en ~8,4 s à la croisière sans rien faire (4 s en v2), et le
  nitro la tient indéfiniment tant qu'il y en a. **PERDUE, LA TRIADE SE VIDE** : `retombee` 75 (+1 de filet) — plus de retour en deux figures.
- **UN BUT EN SOI** (`frenDebut/frenTient/frenFin/frenChrono/frenDuree`, juste après `flowReset`) : chrono sous l'emblème
  (`#frenChrono`, `.rec` quand le record tombe), record de tenue `SAVE.d.frenRec` (s, arrondi par défaut, borné dans `san`), l'annonce
  d'entrée dit « RECORD 0:42 » (dès 5 s de record), « RECORD DE FRÉNÉSIE ! » crié quand il tombe (une fois), « FRÉNÉSIE 0:42 [· RECORD] »
  à la perte, la plus longue de la partie sur l'écran de mort (`.mStat.mFren`, `.rec` si record — toujours affichée, 0:00 = le but reste
  sous les yeux). `RUNX.fren`/`RUNX.frenMax` ; `endGame` compte une frénésie encore en cours (QUITTER, fin de campagne).
- **LE SOUFFLEUR** : frénésie qui fuit au sol + nitro disponible non allumé → « NITRO ! », une fois par frénésie.
- Le STYLE de `#frenChrono`, `.gele`, `.mStat.mFren` : la session UI (hudMaitrise / charte4) — ici seulement un CSS minimal.
- Bancs (scratchpad session 7700ae / 41020878, muets, UN à la fois) : `sim2.js <index.html> [T] [--v2]` (joueurs types + réservoir de
  nitro ; `OV='{cel:[…]}'` surcharge FLOW2 à l'essai), `frenv3.js <racine>` (gel, ×½, tenue, retombée, record, écran de mort).
  RÉSULTAT (4 min) : sage, colle-bord, pilote de route 0 % ; casse-cou 1re à ~141 s (44 % des parties), 13 % du temps, tenue ~70 s ;
  maître 1re à ~74 s, tenue jusqu'à 2 min.

## LA CAMPAGNE NUAGES (2026-09-27) — dix heures du jour, dix idées de jeu
Brief de Sacha (inspiration rédigée avec Grok) : « les 10 niveaux racontent une journée, de l'aurore au coucher du soleil ; chaque
niveau ajoute ou détourne UNE idée de jeu ». Tout est BRANCHÉ sur l'existant, rien n'est réécrit.
- **OÙ** : `CARRIERE[0].niveaux` porte `camp:n` (piste dessinée), `pr` (la PROMESSE, dite sous le nom par `lvlAnnonce`) et le ciel ;
  `carNiveau` ajoute `piste:'camp'`, `camp`, `pr` et une **graine FIXE** (`newTrack` la prend : pièces, pads, nuages identiques à
  chaque essai). Générateur `genCampagne(n)` (juste après `genTuto`) ; systèmes dans le bloc « LA CAMPAGNE NUAGES — LES SYSTÈMES »
  (juste avant `rebuildMenuScene`). Entrée : bouton **CARRIERE** de l'accueil (`data-m="carr"` → `carrVue`). Hooks : `dbgCampagne(n)`
  (lance le niveau n), `dbgCamp()` (état : dégâts, police, fantôme, coupes, bancs), `dbgPisteCamp()` (croisements, dégagement, rayon mini, pente).
- **LES NIVEAUX** : 1 AURORE = `genTuto` intouché · 2 PREMIÈRES LUEURS = deux grands balayages de 160° qui DESCENDENT (lus d'en haut), zéro
  banc, zéro plot · 3 LEVER = UN banc (r 36) sur une droite tournée PILE vers le soleil (`SUN_DIR`), « PERCE-NUAGE ! » à la sortie ·
  4 MATIN FRAIS = 3 séquences de 3 PORTES (centrale large / décalée / décalée de l'autre côté, de plus en plus étroites), sur des droites
  plates · 5 MATIN = la POURSUITE · 6 MIDI = 4 OVALES LENTS (la coupe), ciel propre (ni déco ni coussins) · 7 APRÈS-MIDI = vagues en sinus
  + esses, zéro plot/banc · 8 FIN D'APRÈS-MIDI = un banc au BOUT de chaque droite (cache le virage SUIVANT, on en sort ~1,5 s avant) ·
  9 HEURE DORÉE = biome `orageDore` (orage SANS guirlande de ville, brume 1 350 m), pluie .5, mer refermée + bancs proches + un titan,
  éclairs · 10 COUCHER = la CAISSE-NUAGE (deux ovales, une traversée de nuages, un grand balayage final).
- **RÈGLES DES PISTES** : aucun tirage (piste identique à chaque essai), aucun trou, aucun plot/huile/banc de route tiré au hasard
  (`campNuageOk`, filtres dans buildTrack) ; les REPÈRES (`CAMPM` : bancs, portes, coupes) sont notés par INDEX de point de contrôle,
  relus après `lisserRaccords`/`adoucirCretes`, convertis en `s` par `campRepere` (appelé dans buildTrack AVANT les pads, qui s'écartent des portes).
- **LES BANCS DESSINÉS** = la forme `mur` de mkBlobs (trois rangées de boules soudées, `ry` ≈ 0,6·r), relevés de 0,2·r et TOURNÉS en travers de
  la route (`c.g.rotation.y`). MESURÉ en capture : le cumulus à base plate faisait 13 m de haut et, dans l'objectif grand-angle du portrait,
  se lisait comme une dune rose à l'horizon. Niveau 3 : la droite du banc file vers le soleil À 22° PRÈS (pile en face = contre-jour, fondu
  dans le ciel). Sortie du banc : « PERCE-NUAGE ! » (3), « HORS DE VUE » (écran du 5), « À L'INSTINCT ! » lancé au 8.
- **LA CORDE QUI BRILLE** (marques `corde` → `CAMP.cordes` → `campPieces`) : une pièce tous les ~26 m sur l'INTÉRIEUR des grands virages
  des niveaux 2, 5 et 10 — la bonne trajectoire se voit, et elle paie.
- **LA CORDE** (`cordeK`, `KAPB` = courbure latérale signée par point, `campCourbure`) : le jeu avance sur la ligne centrale (`s`) quelle
  que soit la position latérale — couper l'intérieur ne rapportait RIEN. En campagne (`CORDE_ON`), `s` avance de ×1/(1−κ·lat) : la corde
  est vraiment plus courte (≈10 % dans un R 250 à 25 m de l'axe), et il faut tourner plus serré. Joueur, police et fantôme. Hors campagne : ×1.
- **L'OVALE LENT** (la coupe, niveaux 6 et 10) : leg1 (droite S) → demi-tour R1 → retour → demi-tour R2 = R1 + d/2 → leg3, qui file À CÔTÉ
  de leg1, 12 m plus bas, 22 m de vide entre les bords (d = 2·ROAD_HALF + 22). ⚠ En vol la gravité MONDE vaut FALL_G×SPD ≈ 16 m/s²
  (la chute est intégrée ×SPD) : fenêtre de cap ≈ 8°-30° à 115 m/s, 13°-56° à 70 m/s. ⚠ Plus bas que ~12 m, la TRANCHE de leg1 cache
  leg3 à la caméra de poursuite (basse en portrait) — mesuré en capture à 16 m. Sortir par le bon bord = `startFall` + `tryLand` sur leg3 :
  ~2,9 km gagnés, zéro physique nouvelle. Un seul croisement par ovale (l'entrée passe AU-DESSUS du 2e demi-tour) : topologiquement
  obligatoire. Des pièces longent le bord qui regarde leg3 et un jackpot brille sur leg3 (`campPieces`) — aucune flèche. Et les GUÉS DE
  OUATE (`campNuages`) : 6 coussins r 10,5 au milieu du vide entre leg1 et leg3, crête ~5 m au-dessus de leg1 — ils dépassent du bord (leg3, lui, se
  devine à peine depuis la caméra basse) et, traversés en vol, portent et rendent de l'airtime (surf de nuage existant). Se poser > 300 m
  après son décollage = « RACCOURCI ! » (FLOW, nitro, aura) — détecté dans `campTick`.
- **LA POURSUITE** (niveau 5, `SURV.chasse`) : le mode Survivant réglé (survStart/survTick) — 2 bots qui naissent 200/245 m DERRIÈRE (~20 s de sirènes avant le 1er tir),
  jamais devant (clamp `pTot−9`), pas de nitro sous 86 m (juste hors de portée), 6 % de moins en pointe, ni classement ni couperet.
  `poursuiteTick` : tirs en SALVES COMMUNES aux deux voitures (1-1,35 s de feu / 1,6-2,2 s de pause — elles ne se relaient pas),
  seulement derrière, à 9-92 m, au sol, ligne de vue dégagée (`campVue` : la dalle
  protège, un nuage coupe — les bancs `ecran` du niveau 5 ne se DÉFONCENT pas). 7 s CUMULÉES sous le feu = `explode('feu')`. Aucun
  chiffre : la FUMÉE (`FUME`, Points à taille/alpha par particule, héritant 93 % de la vitesse de la caisse) — 2 s filet blanc, 4 s grise
  + moteur qui tousse, 6 s NOIRE + caisse qui broute. Traits néon magenta/cyan (`TIR`, rubans TRAIL_TEX), « piou » arcade. Halos d'écran
  `#campFx` (opacité seule) : rouge/bleu en bas quand ils sont derrière, magenta sous le feu. MESURÉ (banc `camp5.js`, pilote auto) :
  sans nitro et sur la ligne centrale, abattu vers 30 s avec la fumée qui monte par paliers ; un coup de nitro toutes les 7 s = semés.
  Historique : nitro libre = 80 m repris en 8 s et salves relayées = mort en 11 s ; seuil nitro 140 m = jamais à portée, zéro tension.
- **L'ORAGE** (niveau 9) : `orageTick` — un éclair toutes les 3,4-7,4 s (ruban brisé `ECL`, deux branches), `CAMP_FLASH` (exposition,
  lue dans updateClouds) et `CAMP_FOG` (le brouillard recule de 1 900 m) : l'éclair RÉVÈLE la route ; tonnerre retardé selon la distance ;
  le dernier tombe à côté du portail.
- **LA CAISSE-NUAGE** (niveau 10) : fiche en FIN de CARS (après le bloc généré des 50), gabarit `SHAPES.nuage` (boules `NUAGE_BLOBS`
  fusionnées par `mergeSpheres`, matière `nuageMat` = celle des nuages, opaque), condition `{k:'carrN',v:10}`. Le FANTÔME (`GH`, créé à
  l'init, compilé au menu par `campChauffe`) : ligne gravée (`fantomeLigne` : corde lissée ±60 m + approche du bord de chaque coupe),
  coupes en parabole (`fantomeSaute`, gravité MONDE FALL_G×SPD), vitesse = TES équations et TON moteur ×`GH_K` 1,10 en pointe (jamais de
  nitro ; le boost de départ vaut pour elle aussi), part 180 m devant, se PERD dans les bancs (−45 %/s dedans : la section de nuages est
  une occasion), et l'aspiration marche dans les deux sens (dépassée de près, elle revient dans ton sillage) — elle ne regarde jamais où tu
  es. Le pouvoir VITESSE ×2 est retiré du niveau 10 (+500 m d'un coup : on la dépassait loin sur le côté). Sillage : aspiration à < 46 m
  derrière elle, « ACCROCHE ! » dans sa BULLE de 18 m, 1 s tenue (la jauge retombe à ×1,5) = `fantomePris` : ta caisse DEVIENT la caisse-nuage (équipée), le portail s'ouvre. Elle passe le portail avant toi = « ELLE T'A
  SEMÉ » (`fantomeSeme`, fin sans explosion). Le portail du niveau 10 = `campFinale` → écran de fin « NUAGES TERMINES ».
- **VERSION TEST** : `TEST_CARRIERE=true` (près de `CARR`) ouvre les dix niveaux de chaque monde sans les avoir finis — ⚠ à remettre à
  false pour la version publique, comme `TEST_CAISSES`.
- **FINS DE PARTIE** : `mortCause` feu / seme / finNuages (CAUSES de mFill), gardée par `CAMP.garde` dans endGame ; REJOUER repart du
  niveau où l'on s'est arrêté (`CARR.actif.i` mis à jour dans endGame) ; la stat NIVEAU dit le vrai numéro.

## LA CAMPAGNE VILLE (2026-09-27) — du coucher du soleil à midi, dix idées de jeu
Même méthode que les NUAGES, même exigence (« parfait du premier coup »). `CARRIERE[1].niveaux` porte `camp:11…20` + `pr` ; les pistes
sont dessinées dans `genCampagne` (branche `n>10`, pas de looping, pentes douces) et **la ville se bâtit toute seule autour**
(`buildVoxCity`, qui marche sur n'importe quel ruban). Systèmes : bloc « LA CAMPAGNE VILLE — LES SYSTÈMES » (juste après celui des
NUAGES, avant `rebuildMenuScene`). Branchés sur les crochets de la campagne (`campRepere` → `VZ`, `campPlots` → `villePlots`,
`campPieces` → `villePieces`, `campDebut` → `villeDebut`, `campTick` → `villeTick`, `campStop` → `villeStop`, `campChauffe` →
`villeChauffePrep/Fin`) + QUATRE lignes ailleurs : `campPad(i9)` dans la prise de pad, `villeApres()` juste après `musicTick`, le portail
du niveau 20 dans `portailPasse`, la meute dans `survStart`/`survTick` (`SURV.camp`). ⚠ `lvlNuageOk` : la campagne ne choisit son ciel
QUE pour les NUAGES (`c.camp&&c.id==='nuages'`) — la ville garde zéro nuage (les gués des coupes n'y naissent pas).
- **LA PLAQUE** `#campChip` (`vChip(txt,sous,col,alerte)`) : ce qu'on LIT, en haut (sous la jauge de nitro au téléphone) — un cadre
  d'arcade opaque, deux lignes (l'objectif, son chiffre) ; ne se repeint que si le texte change. Radar à venir, file de pads, cellule
  d'orage, panne, fourgon, bouchon, banquier, rang de la meute.
- **1 COUCHER — FAIS-TOI FLASHER** : trois portiques RADAR (`VZ.radars`, `radarsPose`, poutre à 24 m — à 17 m elle barrait l'écran de la
  caméra portrait — rampe lumineuse dessous) au bout de trois droites ; le flash paie `denom × km/h/22` (×2 en EXCÈS DE VITESSE, jugé sur
  `vCroisiere()` ≥ 92 % : MESURÉ, sur `vmaxShow` le pilote auto SANS nitro était « en excès » à 317 km/h), slam « 412 KM/H », déclic + bip ;
  la plaque annonce « RADAR · DANS 240 M ». Parcours complet mesuré : 94,5 s, trois flashs.
  Les éclairs de flash sont des sprites HORS `trackMeshes` (leur géométrie est celle de tous les sprites) : `radarsVide`.
- **2 SOIRÉE — SUIS LA LIGNE DE NÉON** : cinq FILES de 5 à 7 pads d'or (`VZ.chaines`, `chainesPose`, `vPad`) reliées par un TRAIT de
  lumière posé sur la route (ShaderMaterial additif, 2,2 m de large : parcouru = OR, tronçon suivant = tirets CYAN qui filent, suite en
  veilleuse cyan, cassé = éteint — en orange il se confondait avec la flamme de nitro ; la 1re file est à 8 m de l'axe, pas SUR la ligne centrale). `campPad` : `padCd` ramené à 0,45 s dans une file (le pad suivant est à ~110 m), « LIGNE ×k », file complète =
  LIGNE PARFAITE (slam, `denom×6×n`, demi-nitro). Pad raté = LIGNE CASSEE. `campPadNon` écarte les pads au hasard des files.
- **3 PLUIE — LIS LES FLAQUES** : rangées d'eau en travers (`VZ.flaques`, `flaquesPose`, 2 InstancedMesh : EAU DE NÉON — fond bleu nuit,
  rides concentriques et bord cyan qui brillent, `VEAU.mat` + onBeforeCompile — et liseré cyan additif ; MESURÉ en capture : dans l'objectif
  portrait la route à 20 m est déjà tassée sous l'horizon, une flaque sombre ou réfléchissante y était invisible ; la plaque annonce
  « FLAQUES · DANS 180 M », jamais le côté sec), UNE ligne sèche de 16 → 9 m qui change de côté, puis des DAMIERS (deux rangs en quinconce). L'eau = une entrée `OILS` : le
  glissement des flaques d'huile de la boucle (aquaplaning, gerbe d'eau). Rangée passée sans glisser = « A SEC ! ».
- **4 MINUIT — NE FINIS PAS DERNIER** : le Survivant tel quel (7 voitures, couperet à chaque minute) — `campMeute()` dans `survStart`,
  HUD du Survivant et `#lastAlert` masqués en campagne (`SURV.camp`) : la PLAQUE dit « RANG 3 / 8 · COUPERET DANS 0:42 », rouge
  clignotante « DERNIER ! » ; la caisse clignote rouge comme avant.
- **5 ORAGE — ESQUIVE LA FOUDRE** : trois CELLULES (`VZ.cellules`) ; toutes les 2-3,2 s un CERCLE se pose là où tu seras dans ~1,3 s
  (2 fois sur 3 sur ta ligne, sinon une autre file), se resserre sur le rayon mortel (`VFOU_R` 7,5 m) avec un bourdon qui monte, puis
  `eclVers` fait tomber l'éclair PILE dedans (le moteur d'éclairs du niveau 9). Touché = « FOUDROYE ! » : vitesse ×0,55, nitro ×0,4,
  FLOW −25, la caisse grésille — jamais la vie. Sous la dalle = « A L ABRI ». Frôlé = « ESQUIVE ! ». Les éclairs lointains continuent.
- **6 AVANT L'AUBE — ROULE DANS LE NOIR** : trois PANNES (`VZ.pannes`). L'uniforme `CITY.uC` (dans les trois matières de la ville :
  fenêtres, liserés des toits, enseignes, réclames) vacille 170 m avant, tombe à 0 dedans, revient avec des ratés. Le néon de la route
  est baissé à 7 % dans `villeApres` (APRÈS musicTick, qui le repeint chaque image depuis `userData.base` — on ne touche QUE ce qui a une
  base, rien ne s'accumule) ; les phares portent 136 m. Les CATADIOPTRES (`catasPose`, ambre à gauche, blanc à droite, tous les 14 m,
  plots de 50 cm tous les 10 m SUR la ligne de bord, `fog:false` — des pavés de 16 cm tous les 14 m tombaient sous le pixel dès 60 m) dessinent
  les bords ; un fil de pièces trace la corde dans le noir. Sortir sans quitter la route = « A L AVEUGLE ».
- **7 AUBE — VIDE LE FOURGON** (`VFG`) : fourgon blindé ARGENT à bandes d'or (×1,25 ; en bleu nuit il disparaissait sur le bitume de l'aube), créé à l'init. Un LIÈVRE qui règle sa vitesse sur la tienne
  (MESURÉ : avec tes équations ×1,04, le FLOW, les pads et l'élan te le faisaient doubler à 24 s et il finissait 2,5 km derrière, 4 % vidé) :
  +3 % dans son semis (il se tient à 8-40 m : à 30 m il ne faisait que 25 px en portrait), +12 % collé à < 8 m, +12 à +72 % si tu l'as doublé (il revient d'autant plus vite qu'il est loin), ta vitesse loin
  devant, ×1,35 vidé. Collé derrière lui (3-45 m, dessus de la dalle ou en vol ; une étiquette « FOURGON $ » flotte au-dessus) : les portes s'OUVRENT, 6 pièces/s tombent
  sur la route — de vraies entrées `pickups` (réserve de 40 maillages recyclés), ramassées par la boucle normale. 80 pièces ; vidé =
  « FOURGON VIDE ! » (`denom×25`), puis il s'enfuit (×1,3). Le percuter par l'arrière = dix pièces d'un coup (« BRAQUAGE ! ») et un coup
  de frein. Côte à côte, il déboîte toujours de l'autre côté.
- **8 LEVER — SAUTE D'UN ÉTAGE** : trois ovales (la coupe des NUAGES 6), `RACCOURCI !` inchangé ; à la place des gués de ouate, six
  COLONNES de lumière (`colonnesPose`, deux plans croisés, un seul maillage) montent du vide entre les étages, tête 9 m au-dessus de la
  route ; deux pads d'or attendent sur l'étage du dessous.
- **9 MATIN — FAUFILE-TOI** (`VTR`) : huit files de 7 m, 2-3 voitures par rangée (4-6 dans les deux BOUCHONS), jamais les huit : 100-160
  km/h (60-90 en bouchon), plus vite à gauche. Voiture / fourgonnette / bus (échelles), tout ×1,3 (MESURÉ en capture : à l'échelle vraie, une
  voiture faisait 7 px à 100 m dans l'objectif portrait), feux arrière qui saignent dans le bloom. Clignotant 1,1 s puis changement de file 1,3 s.
  Trois InstancedMesh (caisses teintées, feux, clignotants), on ne dessine que la face où l'on roule. ACCROCHAGE = vitesse ×0,62, FLOW
  −15, la voiture part en toupie ; le FRÔLÉ (`frole`, le système des plots) paie ; foncer dans sa file = klaxon. Trafic à graine fixe.
- **10 MIDI — BATS LE BANQUIER** (`VBQ`) : une course au portail contre LE LINGOT (gabarit `SHAPES.lingot` : tronc de pyramide d'or à
  quatre pans, plaque poinçonnée 999,9, `LINGOT_MAT` partagée avec la caisse du garage — or MÉTAL : base cuivrée sombre, spéculaire doré ;
  en 0xffc33a il sortait jaune pâle). TES équations ET ton FLOW ×`VBQ_K` 1,07 (MESURÉ sans le FLOW : tu gagnais de 640 m au nitro sans sauter
  d'étage, et tu le rattrapais même sans nitro ; à flow égal, sans nitro tu perds — 275 m à 40 s et ça s'ouvre), la corde (`banquierLigne`),
  jamais de nitro, jamais d'étage sauté, aspiration dans les deux sens, coup d'épaule sans dégât. ×1,25 et une étiquette « BANQUIER »
  flotte au-dessus (`vEtiquette`, comme les pouvoirs : à 20 m il faisait une pépite). Il passe le portail avant toi = « LE
  BANQUIER A GAGNÉ » (fin 1,6 s après, cause `banquier`). Toi d'abord = `villeFinale` : `carrMarque(ville,9)`, LE LINGOT débloqué
  (`{k:'carrV',v:10}`) et ÉQUIPÉ, écran « VILLE TERMINEE ». L'orbe VITESSE est retiré du niveau.
- **HOOKS** : `dbgCampagne(n,1)` (niveau n de la VILLE), `dbgVille()` (tout l'état), `dbgFoudre()`, `dbgCourant(v)`, `dbgTrafic()`. Bancs
  Puppeteer : `scratchpad/pp/v1.js` (les dix niveaux), `vplay.js niveau [nitro] [coupe] [suit]` (parcours complet ; `suit` colle au fourgon,
  au banquier, ou vise le pad suivant de la file). ⚠ Les bancs partagent la carte graphique de Sacha : UN à la fois, viewport 200×430.
- **PIÈGES MESURÉS** : `b = n×t` (frameAt) → la base (b, t, n) est un MIROIR : un objet posé à plat sur la route se construit en (t, b, n) —
  le cercle de foudre se dressait en arche ; (b, n, t) est la base directe des caisses. Les pads de campagne (`vPad`) passent tout seuls
  dans `PAD_IM` (padsInstancier ramasse padGeo+PAD_MAT). Cercle de foudre visible à opacité 0 et UNE voiture garée sous la dalle dès
  `villeDebut` : `chauffeRendu` (120 ms après newTrack) les dessine, la puce crée leur état de pipeline avant la 1re frappe / le 1er bouchon.

## ⚠ DEUX ÉDITIONS, UN SEUL JEU (2026-09-25) — LIRE EN PREMIER
- Le dossier `version-fusion-2026-09` s'appelle désormais **`VERSION PRINCIPALE`** (la version mobile fusionnée) ;
  **`AUTRE VERSION`** = la version PC. Les deux `index.html` sont IDENTIQUES sauf `const EDITION='mobile'|'pc'`
  (près de `FORCE_TEL`). `'mobile'` : l'ordi joue la version téléphone (`FORCE_TEL` vrai hors vrai téléphone).
  `'pc'` : l'ordi garde le menu desktop. Un vrai téléphone a la version téléphone dans les deux éditions.
- **On ne modifie QUE `VERSION PRINCIPALE`**, puis `node synchro-versions.js` à la racine du dépôt régénère
  `AUTRE VERSION` (recopie tout sauf son README, bascule la ligne, vérifie). Commiter les deux ensemble.
- Forçages de test : `?tel=1` (téléphone) / `?pc=1` (menu desktop), quelle que soit l'édition.
- **LA COLONNE DE L'ORDI (2026-09-28, Sacha : « la disposition des affichages PC et mobile vertical doit être EXACTEMENT la
  même »)** — puis « je voulais la version horizontale sur PC, pardon » (une heure en option), puis, TRANCHÉ : « je veux voir sur
  mon PC la même chose que je verrais sur mon téléphone quand il sera en vertical », et enfin, LE MOT DE LA FIN : « non,
  justement, je veux voir la version HORIZONTALE DU MOBILE sur mon PC » → le cadre est LE DÉFAUT sur l'ordi, et il est COUCHÉ :
  **844 × 390** (l'iPhone de référence en paysage), zoomé à la largeur (1600×900 → 1600×739, dpr 1,90 ; dedans innerWidth 844,
  la mise en page paysage d'un vrai téléphone). `?colonne=portrait` = le téléphone DEBOUT (390 × 844). Le détail qui suit décrit
  la mécanique (identique dans les deux sens ; la taille du cadre est posée par le script, classes `couche`/`debout`). `const EDITION` a DÉMÉNAGÉ dans le `<head>` (toujours une seule occurrence : la synchro marche telle quelle), à
  côté d'un aiguillage : édition 'mobile' + page principale (`window.top===window`) + écran qui n'est PAS un téléphone (même
  test que TEL_NATIF) + ni `?pc=1` ni `?colonne=0` → la page devient un CADRE (`html.colonne`, `CC_COLONNE`, tout le document
  masqué, le grand script s'arrête à sa 1re ligne, `__gameReady` posé pour le chien de garde) et le jeu tourne dans
  `<iframe id="colonne">` de **390 × 844** (l'écran de référence de la charte) agrandi par `zoom` = min(h/844, w/390). Chrome
  propage ce zoom au document du cadre : dedans innerWidth 390, @media/vw d'un téléphone, `devicePixelRatio` = le zoom (net) —
  mesuré 1600×900 → colonne 416×900, dpr 1,066 ; 1600×1100 → 499×1080, dpr 1,28. Même en file:// (sauvegarde partagée).
  CLAVIER : focus donné au cadre au chargement et à chaque clic hors colonne ; une touche frappée pendant que la page-cadre a le
  focus est RELAYÉE (`postMessage` {cc:'touche'} → `KeyboardEvent` sur le document du cadre). Bancs muets : scratchpad 52f21eda
  `fr/col.js` (captures + mesures), `fr/cle.js` (clavier). ⚠ Un banc « plein écran » d'avant doit passer `?colonne=0` (ou piloter la frame `colonne=1`).
- ⚠ **AUTRE VERSION EST GELÉE depuis le 2026-09-25** (user : « travaille que dans la version mobile ») : elle est
  restée à l'état du commit de séparation. On ne relance `synchro-versions.js` que si Sacha le redemande.
- **LE MOUVEMENT (2026-09-25, « transitions niveau App Store »)** — dernier bloc du `<style>` : UNE courbe `--ease`
  (cubic-bezier(.32,.72,0,1), celle des feuilles iOS, sans rebond) et DEUX durées `--t-fast` 140 ms / `--t-slow` 420 ms.
  Fin des `steps()` sur les écrans. `mGo(id,sens,sansSortie)` : profondeur `PROF` → `avant` (arrive de droite) /
  `retour` (de gauche) / `racine` (fondu-zoom) ; l'écran qui part garde `.sort` 220 ms en absolu ; les enfants se
  posent en cascade via `--i`. Un `MutationObserver` sur `#overlay` pose l'écran racine AVANT la prochaine image (plus
  de flash de l'ancien écran à la mort). `ecranWipe(fn,apres)` = FONDU AU NOIR (monte 200 ms, bascule dessous, 2 images,
  se lève) — `apres` part au lever (le LÂCHER du garage), l'événement `cc:revele` fait rejouer l'entrée de l'écran
  découvert. JOUER et REJOUER passent par ce fondu. Feuilles (`#tPanel`, `#modale`, `#carr`) : `feuilleOuvre/feuilleFerme`
  (classe `.sortant` 170 ms). Clavier : Échap referme fenêtre → pause → carrière, met en pause en course, revient d'un
  sous-écran ; Entrée = le bouton or de l'écran. « Réduire les animations » : fondus seuls.
- **LA CONDUITE JOUISSIVE (2026-09-25, « plus fun, plus addictive, un sound design jouissif »)** :
  · **LE FRÔLÉ** (`FROLE`, `frole()`) : un plot qui passe DERRIÈRE la caisse entre deux images (balayage `FROLE.s0`→`s`)
    à 1,6-3,6 m de `lat`, au-dessus de 45 % de `vmaxShow()` = nitro + FLOW + aura ; chaîne de 1,4 s → « SLALOM ×n ».
  · **LA GAMME DES PIÈCES** (`blip`, `GAMME_P`) : le combo joue une pentatonique majeure qui monte (plus de chromatique).
  · **`boostSnd(k)`** = FWOOSH (souffle balayé + sous-grave + note qui décolle) ; `k` dose (pads 1 → ULTRA TURBO ~2).
  · **`driftChargeSnd()`** (chaîne `DRS`, créée une fois) : le « brrrr » de charge qui monte par niveau de drift ;
    **`raseSnd(dt)`** (`RSN`) : la bande rugueuse du RASE-BORD + un tic haptique ; **`froleSnd`**, **`flowSnd(lv)`**
    (accord majeur qui monte par palier). Passages de rapport : pétarade À CHAQUE rapport + tic + `fovPunch` 1,8.
  · Hook : `dbgConduite()` (état des chaînes), `dbgConduite('son')` (joue tout, renvoie les erreurs), `dbgConduite('frole')`.
- **LE SOIR DU 25/09 — verdicts de Sacha et ce qui a changé (tous mesurés/rendus avant commit)** :
  · **VOLANT « CAP VISÉ »** (`CAP_K/CAP_V0/CAP_V1/CAP_DRIFT/CAP_YAW/CAP_RET`, `capVise`) : le pouce DONNE LA DIRECTION ; lâcher = filer
    droit sur sa ligne. Remplace le ressort `psi*=exp(-2,6…)` (« on est toujours aimanté au centre »). Banc : scratchpad `volant/sim.js`.
    Courbe du pouce 1,15. Drift : braquage à fond TENU 0,12 s (ou pouce tiré vers le bas), paliers .45/.9/1,4 s, recharge `driftCd`.
  · **BITUME v2** (`roadMat`, `ROAD_U`, `asphTex`, `routeTick`) : grain d'asphalte cuit une fois, spéculaire froid et serré, brillance
    d'horizon, clarté par niveau (`NIVEAUX[].route/sheen`). La « tache rose » = reflet de `carLight` (désormais blanc neutre, portée 12,
    décroissance 2) + lobe du `kick`. Étincelles et gerbes près de la caisse héritent de sa vitesse (`EXV`).
  · **NIVEAUX** : NUAGES → VILLE → ORBITE ; jamais de Terre dans les nuages ; route de la VILLE plus claire.
  · **DAUPHIN v3** (`dolTick`, `DAUPH`, `#dolHud`) : **1 s** (`DOL_T`, 2 s jusqu'au 26/09) de vol continu au-dessus de la route, puis
    dauphins + étiquette DAUPHIN et aura en direct, encaissée à la pose ; le banc reste au moins `DOL_VU`=2,6 s à l'écran. Hook `dbgDauphin(...)`.
    L'ANIMATION est celle de Léo (`version-leolei-2026/dauphins.html`, portée le 26/09 — l'ancienne n'en gardait que le tube du corps) :
    BANC de 3 (`DOL_BANC`), nageoires dorsale/pectorales/caudale qui BAT, bonds en arc, gerbe d'eau à la sortie et à la plongée
    (`dolSplash`), sillage d'étincelles (`dolTrail`) — les deux pools vivent dans le repère du banc (`dolPod`), sinon la caisse les
    sème. Taille et largeur RECALCULÉES sur la vraie caméra (`dolKS` ≈ ⅓ de la plus petite dimension, `dolW` = 80 % de la
    demi-largeur) : lisible en portrait comme en paysage. `dbgCreatures()` donne `kS`/`W`.
  · **MOTEUR 3D EN GRAND** : la carte `#engBig` porte le modèle 3D (canvas `.eb3d`, recopie de `engRT`) ; sur téléphone plus aucun rendu
    moteur hors de la carte. Hook `dbgMoteur()`.
  · **CONDUITE v5** : effets de vitesse étalonnés sur `vCroisiere()` (=1,55×vmaxShow ; vmaxShow reste la référence d'économie) ; pads =
    CIBLES (`PADL`, voies ±0,45×ROAD_HALF) ; MOMENTUM v2 (manœuvrer gèle, style nourrit, la pose juge) ; PORTES DE FRÔLÉ pour tous
    (« PORTE ! », un frôlé payé par image) ; filés en sprites (zéro dégradé par image).
  · **SON v5** : `sfxOk()` (rien n'est fabriqué muet/en pause) ; tampons de bruit cuits (`NZ_CACHE/BR_CACHE`) ; `subBoom` ne s'empile
    plus ; turbo lu sur le MOTEUR ; nitro audible sur téléphone (`TEL_NATIF` : passe-haut de la flamme, `nB/gE` dans engSndParams) ;
    moteur qui s'emballe en vol, gomme qui mord (`pneuMord`), tôle du POSÉ LOURD, « tchak » du PARFAIT ; une seule tonalité (`TON`,
    `noteP`, `FLOW_ACC` — mi pentatonique) ; le FLOW prévient avant de retomber ; plot percuté (`coneSnd`).
  · **ERGONOMIE 6b** : l'événement **`cc:jeu`** (fin de `start()`, `resetGame()`, et d'`endGame()` APRÈS les retours bac à sable /
    auto-école) synchronise `body.play`/`body.dead` à l'instant — le tick de 140 ms n'est plus qu'un filet ; commandes, jauge et ⏸
    entrent/sortent en fondu (le fondu est sur `#tGear`, jamais sur `#tSet`). **`HAUT`** (`hautPasse/hautArme/hautVide`) : UNE carte
    à la fois sous l'encoche (moteur `engBigFile`, défi `misBanniere`→`misBanMontre`, permis) ; l'auto-école retient la file. Le coach
    porte ses ratés (`tutoAffiche(msg)`, classe `.rate`), plus de toast sous les pouces. Garage : `.verrou` montre la condition d'aura,
    boutons en `aria-disabled` (jamais `disabled` : un bouton désactivé n'émet aucun clic) + `gSecoue`. Plancher `--fs-min` 8 px.
    **`GRADE_ACES`** (téléphone) : l'étalonnage `saturate/contrast/brightness` vit dans l'ACES, `body.post>canvas{filter:none}` ;
    `ACES_N` 6 prises + grain animé `uJit` ; « Réduire les animations » coupe aussi le flou de vitesse.
  · **TESTS MUETS** : le pane caché joue le son chez Sacha — tout onglet de test (agents compris) démarre sfx/mus/vox à false.
- **CONDUITE v6 / PISTE v6 / LARGEUR (soir du 25/09 — « quand je ne touche à rien je reste quand même sur la route », « la voiture
  glisse », « pistes trop droites », « réduis de moitié la largeur de la route »)** — ⚠ RÈGLE N°1 : pouce lâché, la caisse garde
  son cap MONDE et SORT dans les virages. Aucune aide qui prend la courbe (`ASSIST_VIRAGE=0`, `AIR_ASSIST=0`), aucun réalignement.
  · **Le pouce fait TOURNER** : `lacetMax(v)=v/(VOL_R0+VOL_RK·v)` (40 / .3 : rayon mini 61 m à 250 km/h, 100 m à 720), inertie
    `VOL_TAU` .1 s, état `yawR`. Le cap visé (`capVise`, CAP_*) ne sert plus qu'au pilote `dbgAuto` (qui anticipe via `routeLacet`).
  · **DRIFT = un GESTE** (pouce tiré vers le bas / ↓ + braquage) : la trajectoire tourne ×1,15, le NEZ pivote en plus (`slipB` ≤ 24°,
    ajouté au nez, jamais retiré de la trajectoire) ; `glisse9` pilote fumée et crissement. Le « Tokyo drift » décoratif (crabe au
    boost) est RETIRÉ (`tdWant=0`) ; roulis de caisse vers l'EXTÉRIEUR (charge `yawR·v`).
  · **Caméra** : la penche ne s'accumule plus (`camera.up` = copie penchée de `camUp`) ; placée derrière un axe mi-route mi-caisse
    (`loop._camD`) pour qu'on VOIE la caisse bouger ; visée lissée relativement à la caisse (elle traînait de v/9).
  · **Route** : divisée par 2 (`ROAD_HALF0` 14 → 7) puis REDOUBLÉE le soir même (« double la largeur des routes ») → `ROAD_HALF0=14`,
    47,6 m en zone 0. Restent les garde-fous adaptatifs (voies des pads, slalom de plots, ombre de vol bornés par ROAD_HALF) ; anneau
    de visée, RASE-BORD (×0,8) et aimant à pièces sont revenus aux valeurs de la route large. Spec ÷2 : scratchpad v6/largeur/SPEC.md.
  · **Piste v6** (`genCtrl`) : la CAISSE ne dessine plus la piste (`level` masqué à 0) ; l'échelle suit la VITESSE du palier moteur
    +2 (`lvPiste()`, 1 → 4,4) pour que les virages restent faisables sans aide ; respirations = petits virages de liaison ; ligne de
    momentum cintrée ; arcs densifiés (≤ 12°/point). Banc : 31 → 51 % de piste en virage, plus longue droite 978 → 336 m.
  · **Vol = INERTIE** (26/09, « basé sur un principe d'inertie, dépend de la vitesse à l'éjection, PAS de la vitesse max ») : `AIR_RATE=1`,
    l'avance horizontale reste celle de l'éjection (`fallVH0`, plafond dur — un cabré ne crée pas d'élan), seule la gravité agit ; AUCUNE
    lecture de maxSp en vol ; la nitro en l'air fait PLANER (compense 60-75 % de `FALL_G`) et garde l'assiette, elle n'accélère plus.
    `speedKmh` en vol = vitesse d'AVANCE (horizontale).
  · **Zéro aide, partout** (26/09) : atterrissage au point EXACT de traversée de la dalle (`latX9`, plus de « ramené sur la route »), cap
    de pose = direction du vol ; caméra au retard latéral (`loop._camLat`, τ .22 s, plafonné à 30 % du recul) pour VOIR la caisse bouger.
    Seule exception : le haut des loopings (dalle > 60°, `rails9`) où la caisse suit le ruban — le vrillage y fabrique un faux virage.
  · **Route** : largeur CONSTANTE (`LARGEUR=[1.7]`, `CARR_LARG` tout à 1.7) — « la vitesse fait tout le travail » ; niveaux ×2 (`LEN` 14 400).
  · **Piste v7** (26/09, « la génération n'est pas adaptée à la conduite ») — mesuré par un pilote 150 ms sur les vraies pistes
    (scratchpad `v6/piste/conduite/test.js`, `attrib.js`) : le repère de dalle ne revenait JAMAIS vers la verticale → dalle penchée
    > 45° sur la moitié de la piste, chaque bosse devenait un virage, les loopings pris penchés étaient impossibles (0,41 sortie/km,
    7,8 % infaisable). Désormais `buildTrack` REDRESSE la dalle (`RAPPEL9` .05 rad/m, coupé si |T.y| > .7 ou dalle à l'envers) ; courbe
    `centripetal` (plus de coudes entre points inégaux) ; décalage des loopings progressif `(θ−sinθ)/2π` ; liaisons 60-110 m sur 4 points.
    Résultat : 0,019 sortie/km, 1,2 % infaisable (le haut des loopings, couvert par `rails9`), 43 % de piste en virage (31 % à l'origine).
  · **Power-slide** (26/09, « la voiture part vraiment sur le côté pendant les virages ») : `driftYaw` = arrière qui chasse ∝ charge latérale
    (jusqu'à ~18°), UNIQUEMENT en virage — la trajectoire reste celle du pilote ; fumée/crissement via `glisse9`.
  · **AURA v2 — LA CHAÎNE** (26/09, « on ne voit pas le compteur d'aura ni combien rapporte chaque figure ; des multiplicateurs quand on
    enchaîne ») : `CHA`, `chaineAura(nom,base,fam,brut)`, `chaineTick`, `chaineEncaisse`, `chainePerdue`, HUD `#auraV2` (à gauche sous la
    pastille FLOW, toujours visible) + `#avGain`. Chaque geste entre avec SES points (affichés), chaque geste DIFFÉRENT +×1 (max ×10),
    redite ×0,7 ; ouverte 3,5 s au sol, gelée en l'air ; encaissée = points × multiplicateur ; perdue à l'explosion. Barème en tête du
    module. Libellés SANS accent (`sansAcc`) : la police pixel n'a pas de capitales accentuées.
  · **Moteur flottant** (26/09) : `#engBig` sans carte, au MILIEU de l'écran, moteur 3D (engRT 480×321, fond transparent) qui flotte
    (`ebFlotte`), gros NUMÉRO du palier (`.ebNum`, comme le badge de Léo).
  · **La carrosserie PENCHE** (« la voiture doit vraiment pencher sur le côté ») : `buildCar` range tout sauf roues et flaques au sol
    (`userData.sol`) dans `carBody`, qui roule autour de l'axe des moyeux (`pivY`). Roulis vers l'EXTÉRIEUR ∝ charge latérale
    (`yawR·v`), jusqu'à ~15° (+4° en drift), en RESSORT (ω 14, ζ .55 : `carRoll9`/`rollV`), tangage `pitch9`. ⚠ ne jamais remettre
    `carRoll9`/`rollV` à zéro DANS buildCar : elle tourne avant leur déclaration (zone morte). L'explosion arrache les pièces de `carBody`.
  · **HUD v4 — LE TABLEAU DE BORD** (26/09, « gère tous les affichages comme un tout qui rend accro ») : carte de l'écran en tête du
    bloc CSS « HUD v4 ». EN HAUT on LIT : nitro + ⏸ · **bande du FLOW** pleine largeur (`flowHudMaj` : 4 segments aux couleurs des
    paliers, nom `FLOW_NOM`, vrai multiplicateur de CASH `$×1,5` en vert — l'ancien « FLOW ×2 » mentait et se confondait avec le × de
    chaîne ; états `.presque`/`.fuit`/`.lache`/`.monte`) · **AURA** + **RECORD à battre** (`recInit/recMaj/recBattu`, `SAVE.d.auraMax`,
    crié une fois par partie) · CHAÎNE à gauche (s'ENVOLE dans le compteur à l'encaissement `.vole`, se brise `.perdu`, barre rouge la
    dernière seconde) · colonne de droite : chrono de vol + POUVOIRS (`#pwrChip` sorti de l'écran nu, sous le chrono en vol). AU CENTRE,
    le **couloir des annonces** `--laneA` : UNE voix (`slam` pose `body.slamOn` → niveau/dauphin/contrats/logo s'effacent) ; taille
    auto pour tenir dans l'écran. SUR LA CAISSE le geste (`popSuit` : au-dessus du toit, ou dessous en vol). Contour d'arcade 4 ombres
    sur tous les chiffres (le ciel pastel les dissolvait). Hook `dbgHud(k,n)`. Captures fiables : harnais Puppeteer + Chrome système
    (scratchpad `pp/shoot.js`, GPU réel, figer les animations CSS avant la capture).
  · **VOL LIBRE** (26/09, « pas de haut/bas en mode aérien, la voiture va là où on la guide ») : repère transporté `FLY_U`/`FLY_R`
    (le haut part de la normale de la route puis suit la trajectoire, aucun (0,1,0)) ; volant autour de `FLY_U`, manche autour de
    `FLY_R` SANS plafond (looping possible), caméra `up = FLY_U`. Plafond d'inertie = vitesse d'éjection ENTIÈRE (`fallVH0`).
  · **MÉTÉORE** = cratère UNIQUEMENT si nitro allumée au contact ET plongée > 45° (`2·vN² > v²`), plus la figure en l'air.
  · **LOT 6 (26/09 soir)** : ÉCONOMIE v4 — `DENOMS` 3 → 16 $ (×1,06/palier ; c'était ×1,585 → 401 Md sur une grande partie contre
    2,5 M pour la caisse la plus chère) : ~380 $/min en pilote auto, ~1 M sur une partie record. Ville : plus de circulation volante,
    plus de looping (`sansLoop` dans genCtrl), couronne peinte assombrie et posée 900 m sous l'œil (plus de bande violette ni de ligne
    néon), forêt 3D jusqu'à 2,1 km, tours DURES (`CITY.col` grille 60 m + `villeHeurt` dans la branche 'fall' → explose ; `dbgHeurt()`),
    marges `tourLibre` élargies. Routes 56 m (`LARGEUR=[2]`). Pouvoir VITESSE ×2. Nitro en l'air : IMPULSION +46 m/s à l'allumage
    (1 par appui, 0,5 s mini, 12 % de réserve) + une poussée DOUBLE de celle du sol (60 · 96 en bleue ; 26/09 « le nitro doit
    accélérer plus ») + le champ qui s'ouvre (`fovAir`, `fovPunch` lu en vol). Fruits posés à `fruitLeve(i)` (≥ 45 cm sous le fruit,
    battement compris) et RETOURNÉS sous la route. Flammes de jauge = NITRO MAX seulement. Pouvoirs en GRANDES plaques
    (minuteur au dixième, jauge continue). Écran de mort : le moteur 3D (`ENG_MORT`, rendu par `engVigRender`) au lieu du nom.
    Objets : pièce Ø 2,6 m à jonc (`geoFusion`), fruits ×2,7 (le battement écrasait l'échelle), pouvoirs en CRISTAL + 2 anneaux +
    étiquette pixel, plots 1,4 m à 2 bandes. ⚠ `level` = index de caisse (0-65) : il ne doit plus rien agrandir (aimant, plumes).
    Bancs : `dbgEssaiObjets()`, `dbgEssaiFruit(src,pal)` (scratchpad `gamme/objets.js`, `gamme/fruits.js`).
  · **VILLE v3 — LE CANYON** (26/09, « la route plus proche des immeubles, un truc premium compatible iPhone ») : `buildVoxCity` bâtit
    en coordonnées MONDE autour du ruban — 3 rangs de tours de chaque côté, posés LE LONG de chaque tronçon (la piste de la ville
    descend en spirale sur 7-9 km : plusieurs étages de route à la verticale d'un point) + une forêt au large par cases. RÈGLE D'OR
    `tourLibre` (grille de hachage des points de piste) : aucune tour ne coupe la route, elle se raccourcit ou relève son pied. Pieds
    noyés dans la brume (shader). 3 draw calls : `villeMatTours` (fenêtres dans le shader, fondues en lueur au loin), `villeMatNeon`
    (respire/clignote/grésille, `CITY.uT`), `villeMatTrafic` (voitures volantes déplacées par le vertex shader). Programmes compilés au
    menu (`villeChauffe`). Plus de suivi d'altitude ni de plancher. `dbgCity()` = comptes + ms de construction (~30 ms).
  · **LES POTS** (26/09, « pour chaque skin, les flammes des pots et la traînée de nitro au bon endroit ») : `buildCar` relève les
    VRAIS pots de chaque caisse (`CAR_POTS`, repère caisse) dans les pièces du kit (`lpKit` note ses cylindres/tours/boîtes :
    cylindres couchés dans l'axe, r ≤ 20 cm, ≤ 60 cm de haut, bout arrière dans les 70 cm de la poupe ; boîtes chromées plus larges
    que hautes ou petits tubes — ni verre, ni feux, ni tôle, ni butoirs). Sinon la fiche les DÉCLARE (`pots:[…]` : Chevalier noir,
    Mur du son, Mastodonte), la Comète prend ses propulseurs (`spec.rocket`), les autres gabarits gardent les pots canoniques. Tuyères
    (4 max), flammes au sol/en vol, retour de flamme, gerbe, arc-en-ciel, `nitroLight` et rubans en partent via `potMonde` (suit le
    roulis de `carBody`). Rubans = moyenne des pots les plus en arrière de chaque côté ; UN seul (`CAR_POT_1`) si d'un côté ou au
    centre. Banc des 66 : `dbgPots()`, `dbgSpec(i)`, `dbgNbCaisses()` (scratchpad `pots/audit.js`, planche avant/après).
  · **CIEL DE LA VILLE** (26/09, « la skyline, le sol et le plafond sont mal gérés, ça casse l'immersion ») : la couronne peinte
    (cylindre de 5,2 km, net derrière des tours noyées de brume, BORDS visibles en vol libre) est RETIRÉE ; le fond musical géométrique
    (roue, ondes, piliers — des polygones jusque sous l'horizon) s'efface dans la ville (`uVille<.999`). Tout vit dans le dôme,
    `villeCiel(d,az,ciel)`, par DIRECTION DU MONDE (aucune couture, caméra vrillée comprise), et CONVERGE vers `uFogCol` (la brume,
    recopiée chaque image) sur l'horizon : PLAFOND de nuages bas (520 m au-dessus de l'œil, éclairé par en dessous, parallaxe avec
    `uCam`, seulement sous la PLUIE `uPluie`), ondes de néon + éclairs sur les grosses frappes (les « clignotements » du 24/09) ;
    SKYLINE à l'infini (3 rangées `vTours` + 2 tours du chef `vChef`, pied fondu `fo`) ; ABÎME à 1 600 m sous l'œil (artères = lignes de
    niveau de bruits, quartiers, lumières floutées ; anticrénelage par l'empreinte du pixel `px`). Levier `LVL.ville` (fondu comme la
    pluie, carrière comprise) ; sous la pluie ni contre-jour ni soleil « 1.61 » (éteints = `visible=false`). Hook `dbgCiel(cap,site,h,
    roulis,nu)` : photo du ciel, `nu` masque les tours. ⚠ `villeChauffe` : les pubs chauffées SANS `setColorAt` (three r128 garde le
    1er programme : chauffées avec, elles faisaient jeter le rendu à chaque image quand la ville venait après l'auto-école).
  · ⚠ **PLUS AUCUN LOOPING** (28/09, Sacha : « enlève tous les loopings du jeu ») : `SANS_LOOPING=true` (juste avant `genTuto`)
    coupe les QUATRE sources — motif 0 de genCtrl (→ GRAND VIRAGE, comme la ville), signature VOLTIGE (→ descente), genTuto
    (→ GRAND PLONGEON 240 m à 18°), module LOOP VERTICAL du Parc (retiré). NUAGES/ORBITE changent à partir du 1er motif concerné.
    Mesure : `dbgLooping()` (portions à plus de 60° de pente) — avant : ORBITE 8 portions à 84°, auto-école 82°, Parc 85° ;
    après : 0 partout (Parc : 61° max = ses rampes, aucune boucle). `false` = les loopings reviennent. Le paragraphe qui suit
    décrit donc un looping qui n'existe plus que derrière l'interrupteur.
  · **PISTE v3** (26/09, « enlève les structures bizarres, quelques loopings de temps en temps ; ça va trop tout droit ») : hélice,
    spirale, tire-bouchon, entrelacs à ZÉRO ; looping SEUL espacé de 1,6 km ; pentes bornées (~30°) ; `courbe()` = une « droite »
    qui tourne ; GRAND BALAYAGE (motif 9) ; `lisserRaccords` (pente continue entre motifs) + creux adoucis. Banc : 62 % de piste en
    virage R<400 m (39,5 % avant), plus longue droite 1,6 km → 0,9 km, sorties 0,01/km. Scripts : scratchpad `v6/piste/conduite/virages.js`.
  · **PLUS AUCUN RALENTI** : `slowT`/`hitT` vidés dans la boucle (les déclencheurs restent, inoffensifs). **NITRO EN L'AIR** = la même
    poussée qu'au sol dans l'axe du vol, l'élan gagné relève `fallVH0`.
  · **PETITES ANIMATIONS** : feu de DOOM sur la jauge (`nitroFeu`, 96×18 cases, brasier en NITRO MAX, frange au boost), jauge chauffée
    à blanc (`.inf`), pouvoirs qui fondent et clignotent, reflet sur la bande du FLOW, lettres du niveau qui tombent, chrono de vol qui
    tremble < 1,5 s, confettis (`slam(…, fete)`) sur les annonces heureuses.
  · **LES CINQ FAMILLES** (26/09) : `RARETES`, `carRar(i)` (fiche `rar`, sinon déduite de `CAR_UNLOCK`), `rarListe`, `carOrdre`. Garage
    onglet VOITURES : barre des familles `#gRar` + bande de vignettes `#gStrip` (photos `carPhoto` via la file `photoFile`, une par
    image) + pastille `#gRarPill`. LÉGENDAIRE = boutique seulement (bouton « EN BOUTIQUE » → `#mShop`). Les 50 nouvelles caisses sont
    modelées dans l'atelier du scratchpad (`gamme/`, banc `essai.js` + hook `dbgEssaiCaisse`) et versées par `gamme/integrer.js`
    (blocs balisés « LA GAMME DES 50 » / FICHES / CONDITIONS / CARNETS — regénérer, ne pas éditer à la main). Index 0-15 inchangés.
    Gamme : 15 communes (1 500 → 15 000 $) · 16 rares (20 k → 200 k) · 14 épiques (300 k → 2,5 M) · 13 légendaires (boutique, €) ·
    8 défis (carnets 6-9 : PUCE, GROUPE B, HOT ROD, MASTODONTE ; + BULLE/COMBI/DOLORÈS/POSTER). Caméra de course : les caisses
    HAUTES (h > 1,5 m) reculent/montent la caméra (`hC9`). Garage : visée abaissée à l'onglet VOITURES (la caisse passe au-dessus
    des vignettes). `dbgEquipe(i)` pour tester une caisse en course. ⚠ `exSmoke` n'est plus émise : la caméra de poursuite
    TRAVERSAIT la fumée laissée derrière → un DÔME gris-blanc derrière la caisse.
  · **PORTAIL OVULE** (`PORTAL`, sphère 55 m fresnel + noyau) : `portailPasse()` appelé au sol (bout de piste / entrée dans l'ovule)
    ET en vol (branche 'fall', avant `tryLand`) — `dbgPortail(d|'ciel')`.
  · **NUAGES** : `nuageTouche()` refuse tout nuage de décor qui mordrait le ruban (sauf bancs `onRoad`, 2× plus rares) ; tours
    jamais plantées sur la piste ; coussins décollés de 30 m ; famille ARCHIPEL (16 cumulus à 0,4-2,8 km).
  · Bancs : scratchpad `v6/conduite/diag/` (diagnostic, sim6.js), `v6/conduite/moi/sim-v6.js` (le modèle retenu + pilote 150 ms),
    `v6/piste/base/` (banc.js étendu, variantes.js, resume.js). `dbgState()` expose psi/yawR/slipB/glisse/drift/roulisDeg/vH.

## LA TRIADE v5 — « LA GRAMMAIRE DU FLOW » (2026-09-28, soir) — les trois traits deviennent les auteurs de TOUT le flow
Sacha : « pour gagner en flow on a établi trois principes : PSYCHO — la vitesse aérienne, la vitesse max, le nitro ; MACHIAVEL — la
triche, les raccourcis ; NARCISSE — les figures, les bumps, les séries de pièces entières. Rends les règles parfaites pour aller avec
ces traits ; quand on fait une figure, "+NARCISSE" en petit à côté de FLOW, "-PSYCHO" si on ralentit trop ; les trois peuvent
s'afficher ensemble, vert quand on gagne, rouge quand on perd, petits, sur la même ligne, et ils clignotent » — « tu es game designer
senior, adapte de manière pro en prenant des libertés ». Lois 10-12 de `FLOW2` (commentaire du bloc) :
- **CHAQUE POINT A UN AUTEUR** (`flowAdd(q,fam,trait)`) : sans trait désigné, style et risque = NARCISSE ; la route seule (pièce, rase-bord)
  n'en a pas. MACHIAVEL : raccourcis, gaps, le SERPENT (sous la route), la pose sur la FACE CACHÉE (`sideL<0`), le FOURGON braqué.
  PSYCHO : pads BOOST et lignes de pads, radars, À L'INSTINCT, À L'AVEUGLE, et **la vitesse TENUE** (`FLOW2.psy` : ≥ 1,12 × la croisière
  au sol ou ≥ 1,15 en vol → un geste toutes les 1,5 s, 4 style / 6 risque — le nitro y mène). NARCISSE : figures, bumps, poses, drift,
  frôlés, esquives, arrachées… et **LA SÉRIE ENTIÈRE** (`coinSerie`) : chaque motif de pièces (zigzag, arc, cercle, jackpot — pas
  l'éparpillé) porte un n° (`serieEtat()`, posé par `spawnPickups` SANS toucher au `rnd` seedé) ; la dernière pièce du motif, sur sa face,
  paie `3 + n×0,4` en style signé NARCISSE + « SÉRIE COMPLÈTE ×n ». Motifs de moins de 4 pièces : rien.
- **LA FAUTE A UN AUTEUR** (`flowFaute(t,pts,part)`) : hors frénésie le répit saute (fuite immédiate) et `pts` partent sans jamais passer
  sous le palier en cours ; en frénésie le trait perd `part` de sa mémoire. -PSYCHO : sous `lent.vit` (0,8) × la croisière, au sol, sans
  nitro, jauge entamée — **armé seulement après avoir atteint 0,95** (le départ lancé monte de 0,4 à 1 en ~6 s : ce n'est pas une lenteur) ;
  l'étiquette rouge reste tant qu'on traîne. -NARCISSE : POSÉ LOURD (6 pts / ½ mémoire), plot percuté (répit / ¼ mémoire), pose RATÉE
  (tout, loi 9). MACHIAVEL ne se fait jamais prendre : il ne meurt que d'oubli, en frénésie.
- **EN FRÉNÉSIE LE STYLE NOURRIT AUSSI** (`FLOW2.part` {risque 1, style .35, route .05}, au prorata jusqu'à q = 6) : bumps, séries, drift
  tiennent NARCISSE sans remplacer une vraie figure. Le frôlé ne verse plus sa part à part (plus de double versement).
- **L'AFFICHAGE** (`flowTag(t,±1)`, `FTAG`, `.fT` créé dans `#flowHud` après `.fL`) : trois places fixes N · M · P sur la ligne du nom du
  palier ; même signe = prolonge (un filet continu la garde allumée), signe contraire = relance ; +1,4 s / −1,8 s ; extinction comptée
  dans `flowTick` (aucun minuteur). Entrée en frénésie : les trois en vert ; un trait qui meurt / renaît en frénésie s'affiche. La ligne
  du flow a été repartagée : le ×cash monte au bout de la jauge (rangée 1), le nom + les traits en rangée 2 ; `.fT` a une largeur NULLE
  (elle déborde à droite sans élargir la grille — sinon le ×cash filait sous le ⏸). ⚠ la vieille règle `#flowHud i{width:64px;overflow:
  hidden}` du 1er `<style>` rognait les noms : neutralisée sur `.fT i`. En portrait l'emblème descend (`--frenH` 88) pour libérer la ligne.
- Hooks : `dbgFren('risque',10,'m')` (geste signé), `dbgFren('faute','n')`. Banc : `banctr.js` (scratchpad 312bec4e). ⚠ `sim.js` exécute le
  bloc FLOW2 (les nouvelles clés n'y gênent pas) mais NE simule PAS la vitesse tenue ni -PSYCHO (ils vivent dans `flowTick`).

## LA TRIADE SIMPLIFIÉE (2026-09-28, nuit) — la montée allégée, la tenue un cran plus exigeante (lois 13-14 de `FLOW2`)
⚠⚠ **RETIRÉE LE MÊME SOIR** (Sacha : « l'état de frénésie est trop facile à atteindre, remets l'ancienne version ») : `FLOW2` est
revenu aux réglages de la TRIADE v5 (cel .5/.35/.22/.14, pente .4, fuite 3/3,5/4/3, gate .95, style .35 et route 0 dans la triade,
brûlure [4 · 2 · ,7 · −1,5], pose lourde 6). Les valeurs simplifiées restent notées en commentaire sur chaque clé. S'il redemande
« un peu plus facile » : un point ENTRE les deux (mesurer avec `simtri.js`), jamais la version simplifiée telle quelle. Ce qui suit est l'historique.
Sacha : « c'est un peu trop dur d'avoir la dark triad, simplifie quand même un peu plus ». Les bancs de la session flow (sim.js…sim3.js)
avaient disparu avec son scratchpad : **`simtri.js`** (scratchpad 312bec4e, `ui/`) exécute le VRAI bloc `<<<FLOW2>>>` extrait
d'index.html sur trois joueurs types (tranquille · casse-cou · maître : gestes/s, sauts, nitro, raccourcis, fautes, PSYCHO v5),
5 min × 60 parties ; `OV='{…}'` surcharge FLOW2 à l'essai. AVANT : tranquille et casse-cou JAMAIS, maître 2 min 26.
- **Réglages** : `cel` .7/.55/.4/.34 (v3 : .5/.35/.22/.14) · `pente` rose+triade .15 (.4) · `fuite` 2,5/3/3/2,5 · `gate` .85 (.95) ·
  `fam.style[3]` .7 (.35), `fam.route` [1,.6,.3,.15] (la route touche enfin la triade, un filet) · `brule` [4,5 · 2,4 · ,9 · −1,2]
  ([4 · 2 · ,7 · −1,5]) · `faute.lourd` 4 (6).
- **APRÈS** : tranquille ~4 min (60 % l'atteignent en 5 min), casse-cou ~1 min, maître ~40 s ; en frénésie ~5 % · ~50 % · ~70 % du
  temps. ⚠ Le v3 disait « 77 % du temps pour le maître = c'était le jeu » : si Sacha trouve la frénésie trop présente, durcir la
  TENUE (`brule`, mémoires des traits), pas la montée.

## LE HUD DE COURSE, MAÎTRISÉ ET EN MOUVEMENT (2026-09-28) — le dessin d'origine, plus de rigueur et d'animation
⚠ **ÉCARTÉ LE MÊME JOUR : le « tableau de bord à LED »** (rampe unique nitro + flow en shift lights, plaques partout, main b5bfd24 /
3270d00). Verdict de Sacha : « non, je préfère la première version — remets-la dans le même style, juste avec plus de maîtrise et
d'animation ». Son CSS est gardé hors du jeu (scratchpad session 312bec4e, `ui/led/`) ; ne pas le réintroduire sans qu'il le demande.
Le HUD garde donc EXACTEMENT son dessin (sections HUD du 1er `<style>` + charte4). Un bloc `<style id="hudMaitrise">`, posé juste après
charte4, n'ajoute que du mouvement et des réparations — une retouche d'animation du HUD de course s'écrit là :
- **L'ENTRÉE EN SCÈNE** : au départ, chaque bloc arrive de SON bord (nitro et flow du haut, aura de la gauche, invitation du volant du
  bas), en cascade de 1,15 s à 1,5 s — APRÈS le flash et le logo CASH CAR du départ (lancée tout de suite, elle se jouait sous le flash).
  Le ⏸ n'attend pas (0,1 s) : un bouton invisible mais touchable est un piège (QA « ⏸ visible en course »).
- **LA JAUGE NITRO** : PLEINE, elle respire (luminosité des remplissages) et l'éclair bat ; À SEC, le cadre (un `outline`) et l'éclair
  battent rouge. ⚠ Les animations d'origine `.plein`/`.bas` animaient un `box-shadow` verrouillé en `!important` : elles ne se voyaient
  JAMAIS — d'où l'`outline` et le `filter`.
- **LE FLOW** : un palier de plus = un ÉCLAT qui balaie la bande (`.monte .fSeg::after`) et le nom + le ×cash qui frappent.
- **L'AURA** : l'encaissement grossit le compteur DEPUIS SA GAUCHE, sans ressort ; « ENCORE n » (voir plus bas) bat doucement.
- **LA CHAÎNE** : le × qui monte = un coup franc (×1,9, −6°) au lieu de la valse d'origine (×2,8, −16° → +7°) ; elle glisse de la gauche.
- **POUVOIRS / CHRONO / VOLANT** : une plaque de pouvoir glisse de la droite en s'allumant ; le chrono de vol ÉCLÔT au décollage ; le
  stick éclôt sous le pouce. Propriétés individuelles `translate`/`scale` (elles ne se battent pas avec les `transform` posés ailleurs).
- **RÉPARATIONS** : `#pwrFx` (halo des pouvoirs) passe SOUS le HUD (z 1) — il voilait la nitro et l'aura.
- **RESTÉ DU TABLEAU À LED (logique, pas style)** : (1) la jauge nitro compte la PART DU RÉSERVOIR (`nitroR/res`, réserve `nitroX/2`)
  comme le disque NITRO — elle comptait sur 4 unités (réservoir plein = jauge à moitié, disque plein) ; (2) `X_COUL` = cyan, or, rose,
  violet puis rouge feu (×3 était VERT, la couleur de l'argent) ; (3) `recMaj` : à 85 % du record la ligne dit « ENCORE n ».
- **LA TYPO OMBRÉE, PARTOUT** (Sacha : « les mêmes effets de dégradé pour tous les textes du HUD ») — DÉROGATION NOMMÉE à « pas de
  dégradé dans un texte » : grands textes en quatre bandes (lèvre blanche, clair, plein, sombre — l'ancienne lèvre `::after[data-t]` est
  masquée), petits en deux tons, calés PAR LIGNE (`background-size:100% 1lh`, déclaration séparée : repli sûr), couleur par `--tc`,
  contour d'encre en `drop-shadow` (`--contourH/--contourP`). Aura = violet clair ; annonce, verdict, niveau, dauphin, défi, auto-école,
  campagne, pouvoirs, liste de chaîne, NITRO, traits. (Section 15 de hudMaitrise ; `#engBig` n'y est pas.)
- **« TRIPLE MONSTER »** (`#frenTitre`, `FT_G`, `ftLigne`, `frenTitre`) : à l'entrée en frénésie (un observateur guette `#triade.on`),
  TRIPLE / MONSTER en lettres GOTHIQUES dessinées au pixel (cornes, pieds fendus), bandes rouges pâle → sang, cernées d'encre ; des filets
  de sang coulent des pieds par crans puis lâchent une goutte ; 2,7 s, `body.ftOn` fait taire annonce/verdict/niveau/chrono/traits. En
  paysage : plus petit, au-dessus de la caisse. La VOIX « triple_monstre.mp3 » est celle de `frenDeclenche`. Hook `dbgFrenTitre()`.
- Bancs (scratchpad 312bec4e, `ui/`) : `hud.js` (états de course), `dbg5.js` (entrée en scène + palier : noms d'animation relevés),
  `inshud2.py hudm.css` (réinsère le bloc).

## LA CHARTE v5 — LAQUE · OR · NÉON (2026-09-28) — la v4, un cran plus haut, portrait ET paysage
Sacha : « ça manque de soin — tous les affichages beaucoup plus soignés, beaucoup plus cohérents entre eux, beaucoup plus
modernes ; le futur des jeux iPhone, sur les écrans de démo de l'App Store ; reprends la structure globale mais prends des
libertés ». La GRAMMAIRE de la v4 reste la loi (penché = je touche · droit à coins coupés = je lis · rond = une jauge · l'or = UN
lingot · le néon = le sens) ; la v5 en change la MATIÈRE, la MAIN et le PAYSAGE. Méthode : 34 écrans capturés en portrait ET en
paysage, deux critiques DA indépendantes (agents), QA 62 points, tout mesuré avant commit.
- **OÙ** : toujours `<style id="charte4">` (le nom est resté, c'est la même feuille) — le cœur (jetons → carrière) a été RÉÉCRIT
  en place ; en fin de bloc : 12 PAYSAGE · 13 SIGNATURES · 14 HUD v5 · 15 vignette de l'objectif.
- **LA LAQUE** (`--laque` touches, `--laqueP` panneaux) remplace le sergé de carbone : fond lisse noir-violet, REFLET à arêtes
  franches (une bande oblique, pas un flou — c'est du pixel), LÈVRE de lumière en haut (`--levre`). Compatibilité : `--carbone`
  pointe sur `--laque`, `--tresse` n'est plus qu'un reflet vertical — toute règle ancienne qui les peignait suit.
- **LE FILET** (`--fil`, 1 px) fait le tour de chaque plaque, COINS COUPÉS COMPRIS : deux traits en dégradé posés dans les coupes
  (`linear-gradient(to bottom right|to top left, …) 0 0|100% 100%/var(--c) var(--c)`) + `inset 0 0 0 1px` pour les côtés droits.
  `--c` = la coupe de l'élément (le filet s'y ajuste). `--plaqueH`/`--filetH` (HUD) suivent la même recette.
- **LA TOUCHE** : UN anneau d'encre de 1 px (`--anneau`), l'épaisseur dessous (`--tranche`, 5 px), la bande de livrée de 3 px à
  gauche (`--nc`) dont la lueur déborde sur la face. Fini les trois contours. Le LINGOT : or poli à rebord lumineux en bas, lèvre de
  2 px, plus de double filet gravé.
- **LA MATRICE** (`--matrice`, `--fondEcran`) : le fond des écrans est une trame de points d'afficheur + deux halos (magenta en haut à
  gauche, cyan en bas à droite) — la police pixel y devient une LED. La PAUSE laisse voir la course figée derrière un voile plein.
- **LA LIVRÉE** (`--livree`, magenta · cyan · or) = la SIGNATURE : sous le logo, sous CHAQUE titre d'écran (`.mHead::after`,
  `.tpH:first-child::after`), sur le bord du volet `#wipe` ; elle se DESSINE à l'entrée (`k5Livree`, `transform` seul).
- **CORPS** : gamme courte 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 40 (`--f0…--f8`, `--f1`=`--f2`=10) ; titres d'écran 24 px, mort 20 px.
- **SOUS LE POUCE** : le contenu des sous-écrans courts (MODES, CARRIÈRE) tombe vers la sortie (`margin-top:auto` sur le 1er bloc
  après le titre) ; à la pause, les RÉGLAGES descendent vers REPRENDRE, LA PARTIE reste en haut (verdict : QUITTER jamais collé au
  lingot) ; le dock du RETOUR est quasi opaque.
- **ÉTATS LISIBLES** : interrupteur OFF = patin SOMBRE (le patin lavande se lisait « allumé ») ; icônes des réglages toutes cyan dans
  leur PUITS (`.mLigne::before`) ; badges qu'on lit (NOUVEAU RANG, −50 %, OFFRE) redressés ; prix du JEU en vert billet (`--cash`),
  prix en € en or (`.gT em.eur`, posé par garageFamilles).
- **ÉCRAN DE MORT** : titre 20 px ; le TICKET = `.mCashL` + `.mStats` fondus en UNE plaque (filets entre colonnes) ; la carte MOTEUR
  prend la couleur de son palier ÉCLAIRCIE (la rouille faisait une carte boueuse) ; « PLUS QUE n PIÈCES » en ambre ; l'objectif
  porte sa VIGNETTE (`objFig` : photo / nuancier / ruban / aile).
- **CARRIÈRE ILLUSTRÉE** : chaque monde a son bandeau de ciel en CSS (`.carrBiome[data-b]::before` : l'aube et ses nuages · la
  ville la nuit · l'espace et sa planète) ; chaque niveau son HORIZON (`--sky`, posé par `carrCiel(N)` : l'heure du jour via
  `CIEL_H`, ou l'astre) ; icônes `nuage` et `immeuble` ajoutées à `PXI_G`.
- **LE PAYSAGE** (section 12, `@media (orientation:landscape) and (max-height:540px)` — c'est ce que l'ordi montre) : ACCUEIL = logo
  en haut à gauche, ⚙ en haut à droite, trois portes en bas à gauche, JOUER sous le pouce droit · MORT = verdict + héros à gauche,
  ticket/objectif/portes/REJOUER à droite · PAUSE = deux colonnes (REPRENDRE en bas à gauche, réglages à droite) · RÉGLAGES = deux
  colonnes · MODES = trois cartes côte à côte · CARRIÈRE = mondes côte à côte, niveaux sur 5 colonnes · BOUTIQUE = vitrine en
  deux colonnes, grille de 4 · GARAGE = fiche en haut à gauche, commandes en COLONNE à droite, et l'OBJECTIF DÉCENTRÉ en largeur
  (`garageDecale(k,kx)`, `GAR_DECX` .2, fondu `garageRender._h`) pour que la caisse s'installe dans la moitié libre · FENÊTRE centrée,
  boutons côte à côte. HUD : nitro et FLOW plafonnées à `min(50vw,440px)`.
- **HUD v5** (section 14) : plaques (pouvoirs, astuce/défi, auto-école, objectif de campagne) = le panneau des menus en petit ; le
  VOLANT (invitation et stick) en cadran SEGMENTÉ, frère du disque NITRO (`repeating-conic-gradient` masqué en anneau), patin de
  laque ; pendant une grande annonce ou un verdict (`slamOn`/`verdOn`) les pouvoirs s'estompent à .22 (DOUBLE MONSTRE les traversait).
- **SECONDE CRITIQUE (section 17)** : UNE façon de dire « sélectionné » (liseré + fond teinté — la famille LÉGENDES pleine d'or
  faisait un 2e lingot) ; `.mmP` redressée ; l'argent du jeu VERT partout (prime de défi `.mbPrime`, « +$ » du verdict `.vM`), le € du
  garage en or (`.gEur`, « TEST » en pastille `.gTest` — elle part avec TEST_CAISSES) ; pastilles des héros en liseré ; patin de volume
  cyan ; caisse du garage recentrée (`GAR_DECY` .075 au lieu de .13) ; PAUSE : voile plus léger + RÉSUMÉ de la partie `.tpResume`
  (aura `#tpAu` lue sur `#avVal`, moteur, niveau — rempli par `panSync`) ; HUD : VOILE D'ENCRE en haut (`#hud::before`, z-index 0 :
  à 1 il passait DEVANT la jauge nitro), pouvoirs effacés sous slam/verdict/carte moteur, barre du record bornée, flammes NITRO MAX
  fondues par le haut ; écran titre au corps du logo de l'accueil, invite dans le tiers bas ; PAYSAGE : couloir des annonces à 40 %
  (il tombait sur la caisse), pouvoirs en haut à droite, dock d'un bord à l'autre, vitrine de boutique qui tient, mort avec le défi
  au-dessus du ticket.
- **BUG CORRIGÉ (hérité v4)** : l'écran découvert par le VOLET s'éteignait puis se rallumait (retirer `voletSort` relançait
  `k4Racine` : opacité 1 → .65 → 1) — `.revu` posée au lever du volet (ecranWipe), retirée par mGo (`SENS`).
- ⚠ **BANCS** : ne JAMAIS arracher `#splash` (`remove()`) — `hide()` tourne quand même plus tard et redispatche `cc:revele` au milieu
  du test (écrans capturés à moitié entrés). Attendre que `#splash` disparaisse seul. Bancs (scratchpad de la session 312bec4e, `ui/`) :
  `menus.js <prefixe> [port] [w] [h]` (env `ONLY`, `MORT=1`), `tour.js` (34 écrans, `?colonne=0`), `qa.js` (62 points), `dbg1.js`
  (trace d'entrée d'écran), `pc.js` (édition PC), `rep.py`/`ins.py` (édition binaire CRLF), `jscheck.py`. Serveur `srv.js <racine> 8201`.

## LA CHARTE v4 — CARBONE · OR · NÉON (2026-09-26) — TOUTE L'INTERFACE HORS COURSE (⚠ sa MATIÈRE est remplacée par la v5 ci-dessus ; sa grammaire reste la loi)
Verdicts successifs de Sacha : v1 plate (« moche et mal fait ») · v2 borne d'arcade 1985 (« pas très moderne ») · v3 bonbon violet
brillant (« trop générique, pas de direction artistique »). Demande : « top 1 de l'App Store », refonte intégrale. ⚠ Les sections plus
bas qui décrivent la CHARTE v2, la CHARTE PIXEL UNIFIÉE, la charte v3 et les règles « INTERFACE » de la PASSE DE FINITION sont
PÉRIMÉES pour ces écrans : leurs règles CSS ont été SUPPRIMÉES (purge postcss, 630 règles, 27 @keyframes mortes).
- **OÙ** : UNE feuille, `<style id="charte4">`, posée DANS LE `<body>` juste avant `<div id="splash">` — après toute la feuille
  historique (elle gagne à spécificité égale) et loin de la fin du premier `<style>` où s'ajoute le HUD de course (zéro conflit de
  fusion). Écrans couverts : coque `#mob` (accueil, mort, modes, boutique, réglages), `#tPanel` (pause), `#garage` (DOM, pas la
  scène 3D), `#modale`, `#toast`, `#carr`, `#wipe`, `#nameEntry`, l'invite `#spNote`, le ⏸ `#tGear` et le bouton NITRO `#tNitro`
  (visuel seul, validé avec la session HUD). ⚠ Ne JAMAIS remettre de règle pour ces écrans dans le premier `<style>`.
- **LES TROIS MATIÈRES** : CARBONE (`--carbone`, sergé à périodes inégales + reflet ; `--tresse` pour les panneaux) = tout ce qui
  se touche, avec un filet de NÉON de livrée sur la tranche gauche (`--nc` : cyan = aller voir, magenta `.pb-mag` = boutique) ·
  OR = le LINGOT `.pb-gold`, l'UNIQUE action primaire d'un écran (face dégradée, filet gravé `outline-offset:-8px`, texte frappé,
  reflet `k4Lingot`) · NÉON = titres d'écran (`.mHead h3`, enseigne penchée + bande magenta), états allumés, raretés.
- **LA GRAMMAIRE** : PENCHÉ (`--sk` −11°) = JE TOUCHE (touches, onglets, puces, interrupteurs) ; ce qu'on LIT est DROIT, coins
  coupés (`.mPanel`, `.hCard`, `.mStat`, compteur, pastille de famille) — seul leur TEXTE garde la pente. Exception écrite : une
  ligne de liste touchable (réglages, modes, ticket de mort) = droite + filet + chevron. L'OR = l'argent ou le lingot, rien d'autre
  (réglages en lavande/cyan, ticket en cyan, prix de boutique = chiffres d'or sur plaquette noire). Rouge PLEIN = seulement dans la
  confirmation ; EFFACER et QUITTER sont en carbone à filet rouge.
- **LA TOUCHE** `.pbtn` : face + contour 2 px + TRANCHE 6-7 px dessous (box-shadow) + ombre au sol ; `:active` descend de la
  hauteur de la tranche. Variantes `pb-gold` `pb-cyan` `pb-mag` `pb-red` `pb-green`, états `.off`, tailles `.big` `.wide`
  `.pbCarre` `.ico`. ⚠ Le lingot : la tranche AVANT le contour dans la liste d'ombres (sinon un anneau sombre sépare face et tranche).
- **JETONS** dans le `:root` de charte4 : encres `--k0…--kl2`, or `--au0…--auT`, néons `--neoM/C/V/R/A`, `--cash`, textes
  `--tx/--tx2/--tx3`, corps `--f0` (8 px, plancher) → `--f8`, safe areas `--sT/--sB/--sL/--sR` (TOUT passe par elles — pour simuler
  une encoche en test : `:root{--sT:59px!important;--sB:34px!important}`), `--gut`, `--coupe`. Une courbe `--ease`, deux durées.
- **ÉCRANS** : sous-écrans = SORTIE EN BAS (`.mDock`, collé au bas, « ◀ RETOUR ») · mort = colonne centrée, ressort `.mEsp`
  (REJOUER sous le pouce sans creuser le milieu), montant qui CLAQUE (`.clac` en fin de `mCount`), confettis si record
  (`mCompteSon`) · boutique = vitrine MAGENTA (cadre `k4Or`, rayons `k4Rayons`, badge `.shRemise` −50 %, `BIENTÔT` en simple mention) ·
  pause = RECOMMENCER + QUITTER sur une rangée (`.tpRow`), REPRENDRE lingot collé en bas, ⏸ et commandes masqués dessous ·
  fenêtre = FEUILLE DU BAS, ANNULER en dernier (Échap clique le dernier bouton), le bouton `pb-red` s'ARME après 420 ms (`.arme`) ·
  toast en HAUT (au garage : au-dessus des onglets), filet vert/rouge selon l'icône coche/croix · fondu `ecranWipe` = VOLET PENCHÉ
  (liseré or + magenta) qui balaie de droite à gauche (contrat JS inchangé : couvert en 200 ms).
- **GARAGE** : EN HAUT on lit (compteur vert, pastille de famille OU de catégorie, rang, NOM auréolé de `--rc`, condition si à
  gagner) ; EN BAS on touche (onglets, familles `#gRar`, vignettes `#gStrip`, barre `#gAct` = `#gClose` ◀ + UN lingot). ⚠ La fiche
  et les onglets ne bougent JAMAIS d'un onglet à l'autre (`#gRar` en `visibility:hidden` en habillage, la pastille dit la catégorie).
  JS : `gEtat(bt,etat,ic,txt)` (ÉQUIPER = lingot, ÉQUIPÉE = touche ENFONCÉE verte, VERROUILLÉE/À GAGNER = enfoncée grise, via
  `data-etat`), `gPrixHtml` (verbe + prix `.gPrix`), `gNomEntre` (le nom glisse s'il change), `gTampon` (« À TOI ! » frappé +
  éclair `#gEclat` de la couleur de la famille — l'achat ne se REDIT plus en toast), `gStripHabits(cat,i)` (la bande des PEINTURES/AILES/TRAÎNÉES : nuancier — chrome,
  or, mat ont leur matière —, aile, ruban ; prix / cadenas / coche ; clic = on ESSAIE). La famille active vient se centrer.
  En habillage, la rangée des familles porte les FILTRES `TOUT · À MOI · À ACHETER` (`SHOP.filtre`, `.gR.gF[data-f]`, remis à TOUT
  à chaque catégorie). ⚠ La bande des voitures se reconstruit aussi quand le nombre de caisses POSSÉDÉES change (`st._o`) — sans
  ça, une caisse achetée gardait son cadenas. Prix en euros : `eurTxt()` (« 4,99 € » / « €4.99 » selon la langue — à remplacer
  par le prix localisé de StoreKit). Carrière : sortie en bas (`.mDock` généré par `carrVue`), tuiles toutes numérotées.
  Volet : `body.voletSort` (480 ms) coupe la cascade de l'écran découvert — c'est le volet qui fait l'entrée ; `#wipe::after`
  porte la marque CASH CAR.
- **NITRO** : cadran (rond = une JAUGE, pas une plaque) à face carbone, jauge néon SEGMENTÉE (`--nr` orange / `--nx` cyan, posées par
  la boucle), s'embrase à l'appui ; `.plein` = halo sur `::before` dont seule l'OPACITÉ bouge. ⚠ Jamais d'animation de `filter` ici.
- **PIÈGES** : ⚠ un `filter:drop-shadow` sur une icône `.pxi` ne se voit PAS (le masque passe après le filtre et le rogne) — la
  lueur doit venir d'ailleurs. ⚠ La feuille historique floute `#overlay` (menu desktop) : `body.touch #overlay` remet
  `backdrop-filter:none`. ⚠ `#mob{display:none}` hors téléphone (sinon la coque s'affiche sous le menu desktop en `?pc=1`).
  ⚠ `#spNote` est en absolu centré : son `transform` garde `translateX(-50%)`. Les libellés neufs sont traduits (bloc i18n
  « charte v4 », après la ligne FRÉNÉSIE).
- **Bancs** (scratchpad de la session) : `pp/tour.js <prefixe> [port] [w] [h]` (13 écrans), `pp/extras.js`, `pp/extras2.js` (états
  rares : volet, tampon, carrière, anglais, record, défis), `pp/qa.js` (**62 vérifications** : routage, achat, équipement, onglets, filtres,
  langue, modes, pause, mort, rejouer, zéro backdrop-filter, cibles ≥ 44 px), `pp/nitro.js`, `css/purge.js` (la purge postcss),
  `pp/planche.js` (planches-contact). Serveur : `srv.js` sur le worktree.

## LA CHARTE AU COMPLET (2026-09-28) — les menus ET le HUD de course, une seule main
Sacha : « une interface parfaite et cohérente pour la version mobile verticale, du premier coup — tous les écrans, menus, affichage
en jeu ». Audit MESURÉ d'abord (captures de tous les écrans 390×844 et 375×667 — hors course, HUD, campagne, auto-école —, relevé des
styles calculés, critique DA indépendante) : les menus parlaient la charte v4, le HUD encore trois dialectes plus anciens. Tout vit
dans UN bloc en fin de `<style id="charte4">` (« LA CHARTE AU COMPLET », sections 1 à 10) + quatre retouches JS.
- **LA GRAMMAIRE, vraie partout** : PENCHÉ = je touche · DROIT à coins coupés = je lis · ROND = une jauge (cadran NITRO, chrono de vol).
  Une PLAQUE qu'on lit = carbone tressé `--k2`, deux coins coupés, FILET de sa couleur à gauche ; étiquette en pixel, PHRASE en `--sans`.
  Jetons : `--plaqueH`, `--coupeHP` (coins du HUD, `--coupeH` 10 px), `--filetH`, `--encre`. Rien d'arrondi, aucun dégradé dans un texte.
- **LES COULEURS** : OR = le lingot (UNE action primaire) + le prix en vrai argent ; en course l'or est la VOIX des annonces (niveau,
  slam, verdict, record à battre, consigne de l'auto-école), jamais un fond de plaque · `--cash` = l'argent du jeu · `--aura` = l'aura
  et ses records · CYAN = aller voir / info · MAGENTA = boutique + halo des titres · VERT NÉON = allumé / gagné · ROUGE = danger, fin ·
  une jauge prend la couleur de ce qu'elle mesure. Lavande (`--tx2`) = neutre (la tuile RÉGLAGES).
- **CE QUI A CHANGÉ** : (1) UN logo — `#spTitle` et `#launchLogo` prennent la pente, la chasse, l'ombre et la livrée de l'accueil
  (la pente est AJOUTÉE à leur transform d'animation) ; l'invite de l'écran titre en filet cyan. (2) MORT rangée comme l'accueil
  (`order` : ressort, tuiles, PUIS REJOUER tout en bas) ; titre NOUVEAU RECORD en `--aura`, fin de campagne en `--neoV` (l'or reste au
  lingot) ; pastilles des cartes à la couleur de LEUR carte ; en-têtes AURA/MOTEUR alignés ; `▶` réservé à ce qui se touche (« ENCORE
  400 · REMARQUÉ ») ; « 1 PIÈCE » s'accorde ; tient sans défiler sur 375×667 (compactage `max-height:760px` / `690px`). (3) CARRIÈRE :
  `.carrIn` en colonne pleine hauteur + `#carr{padding-bottom:0}` → RETOUR collé au bord (sticky ne colle que ce qui déborde) ;
  chevron sur les cartes de monde ; jauge vide à 0 ; numéros de niveau alignés. (4) MODES : le même interrupteur que les réglages.
  (5) Fenêtre destructrice filet ROUGE ; « restaurer mes achats » 44 px ; pause à 20 px du titre ; étiquettes de volume lavande ;
  compteur du garage « $ 48 250 ». (6) Jauges nitro/FLOW à coins francs. (7) `#avVal`/`#avX` en couleur PLEINE (ils étaient en dégradé
  découpé). (8) Pouvoirs, astuce/défi (`#misBan`), auto-école (`#coach`, c'était une carte de verre arrondie), objectif de campagne
  (`#campChip`) = la plaque du HUD. (9) Colonne de droite FIXE : case du chrono de vol réservée (hudH+96), objectif de campagne à hudH+184,
  pouvoirs à hudH+184 (+248 en campagne) — ils sautaient de 88 px à chaque décollage ; en campagne le couloir `--laneA` descend (384 px).
  `airPieDraw` : le chrono de vol est le frère du cadran NITRO (face carbone nuit, anneau segmenté 16°/4°, « AIR » 8 px affichés).
- **(10) LA FRÉNÉSIE, REFAITE** (même soir, Sacha : « retravaille l'effet frénésie / dark triad, beaucoup beaucoup ; une petite part
  rouge dans la barre de flow = une zone de tolérance pour rester en frénésie plus souvent ; la barre toute rouge qui scintille quand
  elle reçoit encore du flow ; le logo plus beau, plus gros, mieux animé, ROUGE ; parfaitement intégré, pro dès le début » — et : « le
  son, la musique, je la mettrai après » → RIEN n'a été touché côté audio).
  · **LA ZONE ROUGE** (`FREN`, `flowLvDe` = le SEUL calcul du palier) : hystérésis — on ENTRE à 100 (inchangé), on RESTE tant que
    `FLOW.v ≥ FREN.seuil` (88) ; ce qu'elle coûte à tenir vit désormais dans `FLOW2.fren` (voir LE FLOW v2 en tête : `FREN.retient`
    n'existe plus). Le tic « ça lâche » vise le bord de la zone (`flowReste`). Les coups directs sur `FLOW.v` (foudre, choc, porte) passent par `flowTick`.
    Dessin : la 4e cellule porte `.fZ` (à partir de `--fzL`, posé par le JS depuis FREN) — hachures rouges tant qu'elle est vide, cran
    clair au seuil, et son propre remplissage rouge PAR-DESSUS le violet (`FLOW.zs`, classe `.dansZ` = un seul curseur, celui de la zone).
    `FLOW_CEL` = couleurs des cellules (la 4e reste violette) ; `FLOW_COL[4]` = ROUGE (#ff2a3d, jetons `--fren*` en tête de la section 10).
  · **LA JAUGE EN FRÉNÉSIE** : `.embrase` (cellules qui flambent de gauche à droite) puis toute rouge, halo `#flowHud::after` qui bat,
    paillettes (`.fSeg::before` + `u.fG`, deux trames, deux cadences) ; **nourrie** (`frenNourrit`, ≥ 1,2 point, ≤ 1 fois/110 ms) :
    `.sc1/.sc2` (éclat + reflet qui la balaie + paillettes à fond) et braises `PIX_FREN` (≤ 1 gerbe/420 ms) ; **fuit** : la zone se
    hachure et clignote ; **lâche** : cadre qui clignote (le tic), emblème qui tremble. Plus d'arc-en-ciel (hue-rotate) nulle part.
  · **L'EMBLÈME v3 — EN PIXEL** (même soir, Sacha : « toute l'interface est faite en pixel, réinterprète la dark triad ») : un BADGE
    PIXEL de 54 × 49 cases de 2 px (108 × 98, `crispEdges`), généré case par case (scratchpad 52f21eda `fr/pix/gen.js` → chemins
    `<path style="fill:var(--…)">` par couleur, dans `<g id="trArt">`) : contour d'encre `--frenO`, biseau clair `--frenV` + lèvre
    `--frenC` à gauche, `--fren` + ombre `--frenS` à droite, base sombre, ÉPAISSEUR dessous à `--encre`, fond carbone tramé, un ŒIL au
    sommet, trois rivets ; texte « THE / DARK / TRIAD » en Press Start 2P 8 px calé au pixel. Il TOURNE COMME UNE PIÈCE (`.trPiece`
    preserve-3d + deux `.trFace` dont le revers déjà retourné, `rotateY` −720° / retour sur 5,2 s) : une rotation dans le plan
    floutait les pixels. Frappe = BOND de 6 px en paliers (`trPouls` steps(3)) + halo ; nourri = +2 px et éclat ; lâche = tremble de
    2 px ; onde de choc = le contour pixel, par paliers. Plus de fantômes. Enveloppes `.trTr`/`.trBat`/`.trPouls` inchangées ; JS :
    `frenEntre` (zone → `--ox/--oy`, `.on`), `frenSort` (`.sort` 440 ms), `.tremble`/`.froid` par `flowHudMaj`. `#flowGlow` bat en
    rouge (1,3 s) calé sur les frappes. Place (390×844) : boîte 188-296 × 72-170 — chrono de vol à 298, pouvoirs/objectif à 184 ;
    la barre du RECORD se contracte (`#avRec` max-width). « Réduire les animations » : ni tour, ni bond, revers et onde masqués.
  · **LA VOIX** (Sacha, même soir : « ça doit déclencher la voix TRIPLE MONSTRE quand la frénésie est atteinte ») : entrée
    `ANN_LIB.frenesie` (même fichier `triple_monstre.mp3`, son propre compteur — elle ne consomme pas le tirage 1/3 des vrais
    TRIPLE MONSTRE), appelée dans `flowAdd` avec `annSpeak('frenesie',5,true)` : À CHAQUE frénésie, forcée, priorité 5 (coupe
    un MONSTRE, cède au MÉGA MÉTÉORE), cd 2,5 s ; l'interrupteur VOIX reste maître. Banc muet `fr/voix.js` (compte les `new Audio`).
  · Première frénésie de la session : l'annonce dit « RESTE DANS LE ROUGE » (i18n EN/ZH) au lieu du ×. Hook **`dbgFren(k,n)`** :
    `'v'` n (100 = y entrer par le vrai chemin), `'nourrit'` n, `'idle'` s ; rend zone/emblème/classes. Banc : scratchpad de la session
    52f21eda, `fr/fren.js` (muet ; ne fige QUE les CSSAnimation — une transition en attente figée reste à 0 px).
- **(11) LE JUS v3** (même soir, Sacha : « les taches de jus de fruit doivent être plus opaques et grosses ») — `juiceScreen` /
  `juiceScreenTick` : taille sur la plus PETITE dimension de l'écran (même goutte debout ou couché), ~×1,5 (rayon ~37-73 px sur
  téléphone, plafond 90), brouillon `JUS_N` 192 cellules ; opacité PLEINE .9 la 1re moitié de la vie puis fondu (c'était ≤ .55 en
  fondu dès l'impact), corps .94 / cœur .9, coulure .95, `#juiceCv` opacité 1 ; l'ellipse du couloir s'élargit de la goutte (son
  BORD reste dehors). Banc `fr/jus.js` (dbgJus figé) : 14 taches = 13,6 % d'écran peint (6,2 % avant).
  **v3b** (même soir : « trop sur les côtés ; un peu plus grosses ; pouvoir apparaître PARTOUT sur l'écran ») : plus d'ellipse ni de
  bande du haut interdites — position uniforme sur tout l'écran (le HUD reste dessiné par-dessus) ; rayon ×1,25 (~46-91 px, plafond
  110), `JUS_N` 240. Cas extrême du banc (14 taches d'un coup) : 45,7 % d'écran peint ; un fruit en projette 1 à 5.
- **(12) NITRO ET CHRONO DE VOL EN PIXEL** (même soir, Sacha : « pas mal, fais pareil pour le camembert air time et le bouton nitro »)
  — section 11 de charte4. Les deux derniers cadrans LISSES deviennent des disques pixel de la main du badge DARK TRIAD (grille de 2 px,
  encre `--k0`, biseau d'en haut à gauche `--kl2/--kl/--k4/--k2`, face carbone tramée `--k3/--k2`, épaisseur dessous).
  · NITRO : `<svg class="nxArt">` (52 × 54 cases, `fr/pix/nitro.js`, classes `.nx-*`) + `.nxJauge` = le MÊME dégradé conique (--nr/--nx,
    280° depuis 220°, câblage de la boucle intact) vu à travers le masque de cases `--nxMasque` (14 segments). Appui : 2 cases de
    descente, épaisseur effacée, face orange tramée, jauge claire. Le halo `.plein` (::before) et l'anneau de l'auto-école (::after) restent.
  · CHRONO : `airPieDraw` + `airPiePx()` (fond cuit une fois en deux versions, normal / « regain » cyan), toile 156 → 78 px `pixelated`,
    18 segments qui s'éteignent ENTIERS (le temps se lit par crans), chiffres Press Start 24 px de toile calés sur leurs pixels ; tremble
    de 2 px entiers sous 1,5 s (plus de rotation). Banc `fr/nx.js` (repos, appui, vol à 5,6 s puis 4,1 s).
- **Écarté volontairement** (verdicts) : JOUER au garage, bouton d'action dans MODES/CARRIÈRE, ⚙ de l'accueil en bas, flèches du garage,
  rangée LA PARTIE de la pause descendue près de REPRENDRE (QUITTER ne se colle pas au lingot), l'or du HUD (voix des annonces, record en
  or demandé le 26/09 : « plus en lavande 8 px »).
- **Bancs** (scratchpad de la session 923b15ae, `ui/`) : `tour.js` (34 écrans), `tour2.js` (états + AUDIT des styles calculés →
  `audsum.js`), `tour3.js` (auto-école, moteur, record), `tour4.js` (logo du départ, astuce, défi, campagne VILLE 4 + rectangles),
  `tour5.js` (FRÉNÉSIE, emblème), `planche.js`. Serveur `srv.js <racine> 8097`. Tous muets.

## PASSE DE FINITION (2026-09-26) — quatre audits (son · interface · ergonomie · rendu iPhone), six lots
Commits `2608066` (lot 1) · `c3493a5` (lots 2-3) · `04e8d28` (4) · `bd995f4` (5) · `3f5c08e` (6). Ce qui est devenu une RÈGLE :
- **RENDU** · Les lumières ponctuelles n'éclairent QUE la caisse : `LFB_SANS_PL` (le chunk `lights_fragment_begin` sans sa boucle de
  PointLights) est branché sur `roadMat` et `CLOUD_MAT` — ⚠ une PointLight ne peindra JAMAIS la route (c'étaient les taches rondes, et
  ~20 % du GPU). ⚠ r128 remplace `NUM_POINT_LIGHTS` par sa valeur dans le texte : on ne peut pas le redéfinir, on retire la boucle.
  · **Jamais de `new THREE.PointLight` en cours de partie** (le nombre de lumières change → tout recompile : 1,5 s à l'explosion).
  `boomLight` RECYCLE `swapLight`. · Particules « proches » (`makePool(…,true)`, `ptProche`, `PT_U.uPxMax`=26 px×DPR) : taille plafonnée
  et fondu sous 3,5-8 m de la caméra — les pools de l'explosion n'y sont pas soumis. · Plus de néon sous caisse, plus de `CARPOOL.tail/jet`,
  `nitroLight` à 0 au repos, `trailLight` à 0. · `bloomPass.setSize` surchargé (l'`addPass` écrasait `bSc`). · ACES : `FXAA_ON` (anticrénelage
  là où il n'y a pas de MSAA), `roule()` = coude des hautes lumières qui garde la teinte (plus de clamp intermédiaire), flou de boost en
  8 lectures, `FLOU_OK` (coupé au palier BAS, qui passe l'ombre à 512 sans recompiler). · Caisses : `refl ≤ .45`, `shin ≤ 300`, lueur ≤ .2 —
  ⚠ l'index de caisse n'est PAS une progression. `paintEnv` peint le cube face par face (zénith, sol, point chaud vers `SUN_DIR`).
  Traînée nitro : `TRAIL_TEX` (cœur/bords), fondu 6-14 m. Caméra du garage bornée à 8 m horizontaux (cadrage rendu par le FOV).
- **SON** · `nOn9` : la flamme nitro ne vit que manette en main ; `endGame` éteint aussi `whG/skidG/jrG/jrDep/jetG/jetLowG/jetOscG`.
  · Un `play()` refusé ne condamne un sample que sur `NotSupportedError` ; la voix libère le ducking à sa `pause` + filet 7 s.
  · `deathSound(sansVoix)` (pas de « ewww » sur l'annonceur) · `poseSndT` : la visseuse du palier moteur attend 450 ms après une pose
  · `chaineAura(…,muet)` : un seul carillon par figure / pose · `pwrPrisSnd/pwrFinSnd` · `mCompteSon` (l'écran de mort sonne) ·
  encaissement à 2-3 notes · tic d'airtime sous 1,5 s · « tchk » de nitro à vide · `boostSnd` ±6 % · bourdon du drift en si/mi
  · VRAI iPhone (`TEL_NATIF`) : `lpMin` 700 Hz du moteur, `subBoom`/`heartBeat` remontés, `jetLowG` à 0, pops moins denses et plus hauts.
  · Contexte audio suspendu en arrière-plan AUSSI au menu ; `togglePause` coupe voix et samples ; `uiClic` attend le réveil du contexte.
- **ERGONOMIE** · `TCTL.mortT` : 0,6 s d'écran de mort sourd (les taps réflexes n'ouvrent plus RÉGLAGES/GARAGE) · retour d'appli en course
  → le panneau PAUSE s'ouvre · `repriseCompte` : REPRENDRE / Échap / retour en portrait = 3-2-1 jeu gelé (`#slam9.compte`, retirer `on` à la
  fin sinon le « 1 » revient) · `#tNitroZone` : tout le coin bas-droit est la NITRO (`bindHold(el,code,onDown,vis)`) · `explode(cause)` →
  `mortCause` → `#mCause` sous GAME OVER · astuces uniques `SAVE.d.ast` (bit 1 drift, bit 2 assiette) · `runStats.xMax` = CHAÎNE MAX ×n
  · le record de fin s'allume aussi pour l'AURA (`CHA.recB`) et le MOTEUR · `recInit()` dans `start()` · auto-école : TOURNE à .25,
  NITRO comptée en vol, sortie de route (> .5 s en l'air, étapes 0-1) rattrapée avec « SORTI ! TON POUCE RAMENE LA CAISSE » · intro 4,6 s
  pour qui a déjà joué.
- **INTERFACE** · Le bloc CSS « PASSE DE FINITION » est le DERNIER du `<style>` : il gagne. Pouvoirs en `pxi` (`flamme` ajoutée à `PXI_G`) ;
  sous `#tPanel.open`/`#carr.on` le HUD est `visibility:hidden` ; or = action (onglet de garage violet, prix = étiquettes) ; garage
  arrondi (l'octogone reste au HUD) ; titres en `--ttrOr` ; petits écrans (< 720 px) compactés ; curseurs 44 px ; solde au format de la langue.
- **Écarté volontairement** : caméra plus haute (réglée par Sacha), ⚙ de l'accueil en bas (accueil v3 voulu), aura recolorée, planète en
  shader (son halo bat au rythme, voulu), gros chantiers perf (route en 3 colonnes, plots/pièces instanciés, nuages LOD, piste par tranches,
  RT 8 bits) : gains réels, risque moyen à élevé — passe dédiée. MODES et CARRIÈRE restent volontairement sans bouton.
- **Vérifier** : harnais Puppeteer + Chrome système (puppeteer de `Desktop/projet-161`), `--mute-audio`, sauvegarde sfx/mus/vox à false.
  ⚠ `dbgSaut()` = passer au NIVEAU suivant (pas un saut) ; pour s'envoler : `dbgDauphin(hauteur,vA,vLat,lat)`. Un test ne mesure le son
  qu'en comptant les `createOscillator` (patch avant chargement).

## PASSE PERF iPHONE (2026-09-27) — « NETTE doit rester nette, surtout en vol » (iPhone 13 Pro, DPR 1,5)
Mesuré au départ (banc Chrome, viewport iPhone, NETTE figée) : ~750 000 triangles/image dont ~600 000 pour la piste ENTIÈRE dessinée à
chaque image ; en vol le CIEL devenait le 1er poste GPU (×5, il couvre la moitié de l'écran) ; CPU +60 % en l'air ; et la résolution
adaptative descendait EN PREMIER. Cinq lots (branches perf-ciel/-post/-cpu/-piste/-caisse fusionnées). Ce qui est devenu une RÈGLE :
- **CIEL** (`skyDome`) : chaque couche ne se calcule QUE là où elle peint (guirlande, étoiles par cellule, lune, cœurs du soleil, voile,
  `atan` à la demande), coupures posées à la borne exacte où le terme vaut 0 (écart mesuré ≤ 1/255) ; mer de nuages en UNE passe
  (`mfbm2`) ; VILLE pleine → saut direct à `villeCiel` (le ciel habituel était calculé pour être jeté), abîme/artères bornés en distance.
  ⚠ La mer de nuages est maintenant les 2/3 du dôme aux NUAGES : l'alléger changerait son dessin (4→3 octaves) — décision de Sacha.
- **CIEL EN DEUX TEMPS** (tour 2, `CIEL2` après `chauffeDivers` ; shader du dôme rangé en morceaux : une fonction par couche, un
  `main` par programme) : les couches LISSES (dégradé, mer, soleil, guirlande, voile · plafond de pluie, lueur des quartiers) sont
  peintes à ½ résolution dans une cible hors écran (format du compositeur, suit `curDPR`) ; le dôme à pleine résolution la relit au
  pixel (`gl_FragCoord`) et n'ajoute que ce qui a des BORDS (étoiles, lune · lumières fines de l'abîme, skyline) + la trame.
  Un seul point d'appel : `scene.onBeforeRender` (chaîné). Repli = programme PLEIN d'avant (fondus de la ville, fond musical hors
  ville, atelier, étal, `?ciel=plein`). ⚠ Découverte : sous le rendu logiciel et ANGLE/D3D les `if` du shader NE sautent PAS le
  travail — chaque pixel payait tout le programme (éteindre la mer ne changeait rien) : ce qui paie, ce sont des programmes à la
  taille de leur travail. ⚠ Une couche qui a des bords ne va JAMAIS dans la passe lisse ; en cible 8 bits la passe lisse se trame
  (`uBasTr`), sinon anneaux d'arrondi. Banc `dbgCiel2(on,{rendre,f,octets})`, micro-banc `scratchpad/ciel2/mb.js`.
- **ÉCHELLE DE QUALITÉ `QL`** (remplace `applyPerfTier`, `dbgQual()`) : UN curseur `QL.k`, chaque cran enlève d'abord ce qui se voit le
  moins — ombre 1 image sur 2 en vol loin des dalles · carte d'ombre 768 · bloom ¾ · ombre 512 · flou radial coupé · PUIS la résolution,
  jusqu'au PLANCHER NET (1,25 en NETTE, `DPR_MIN` en RAPIDE) ; sous le plancher puis bloom éteint seulement sur EFFONDREMENT (> 24 ms 6 s
  d'affilée). RÉVERSIBLE : on remonte dans l'ordre inverse (la netteté revient la première). Anti-yoyo, 30 Hz imposé, chargements : inchangés.
  Zéro recompilation (tailles de carte, drapeaux, uniforms). `applyQ` → `qlReprise()`.
- **BLOOM 13 → 8 passes plein écran** : composite + copie additive sommés DANS l'ACES (`bloomPass.fuse`), seuil plié dans le 1er flou,
  mips 3-4 en flou 2D d'une passe (`plie`). `?bloom=ancien` = l'ancien chemin pour comparer sur le téléphone.
- **MONITEUR `?perf=1`** : une ligne en haut (ms, pire image, i/s, DPR/plafond, cran QL, allègements). Absent sans le drapeau (charte).
  C'est ce qu'on demande à Sacha pour tout rapport de fluidité : captures `/jouer/?perf=1` au sol et en vol.
- **PISTE EN TRANCHES** (`pisteTranches`, `PISTE_CH=600` points) : bitume, flancs, rails, nappes, ligne centrale bâtis ENTIERS (normales
  calculées sur le tout) puis répartis en tranches à rangée frontière dupliquée, une sphère chacune → le frustum culling de three fait le
  reste. UNE matière par famille (NEON_RAILS/NEON_GLOW n'en ont plus qu'une chacun). `pisteLoin` : une tranche entièrement au-delà de
  `scene.fog.far` passe le bitume à 2 colonnes (même surface, déjà couleur du brouillard) et coupe la ligne. Géométrie hashée identique à
  l'ancien code. `dbgPiste(on,loin)` = témoin sans tri. En vol : −58 à −81 % de triangles.
- **PLOTS VUS** (`conesVus`, `CONE_PM`, `CONE_OMB`) : avant chaque rendu, seuls les plots dans le champ (4 instances sans ombre) et dans la
  boîte d'ombre du soleil (3 instances qui ne font QUE l'ombre) partent au GPU ; tampon renvoyé seulement si la liste change ; chauffe
  forcée 3 rendus (sinon le programme instancié compilait au 1er plot). ⚠ `scene.onBeforeRender` est pris (`pisteLoin`+`conesVus`) :
  CHAÎNER, ne jamais réassigner.
- **PLAQUES TURBO** : `padsInstancier()` (dans newTrack après conesInstancier) → UN `InstancedMesh` `PAD_IM` (82 draws → 1) ; toute
  animation d'une plaque passe par l'instance.
- **CPU** : `dalleIx`/`dalleProche` (casiers de 64 points dans une sphère) remplacent le balayage de toute la piste par `tryLand` et le
  viseur (résultat identique prouvé sur 36 000 requêtes, 3-5× plus rapide) ; ⚠ `scene.updateMatrixWorld` SAUTE les enfants directs
  INVISIBLES (l'atelier caché, pièces hors couloir…) : pour lire `matrixWorld`/`localToWorld` d'un objet caché, l'ajouter à
  `SCENE_TOUJOURS` (la caisse y est) ; `airPieDraw` dessine hors écran puis UNE copie ; `updatePool` saute les réserves vides ; sur
  téléphone plus de `fmtC` pour la mallette/le compteur masqués ; nuages `matrixAutoUpdate=false`. En vol le CPU coûte ≈ le sol.
- **TOUR 2** (même jour, verdict « ça marche pas, on repasse en mode pixel assez vite après avoir lancé ») :
  · **QL v2** : la mesure n'est plus la moyenne glissante mais la PART D'IMAGES RATÉES sur les 60 dernières (`QLR` : p50/p75/p90 —
  sur un écran 60 Hz une image qui déborde dure 33 ms, la moyenne mélangeait à-coups et lenteur) ; DEUX planchers par réglage, le net et
  le BAS jamais franchi (NETTE 1,25 / **1,0** · RAPIDE 0,85 / 0,7 — l'ancien plancher 0,5 ÉTAIT « le mode pixel ») ; « la netteté ne se
  sacrifie que si ça paie » (`QL.essai` : un cran de résolution qui ne fait pas baisser les centiles en 3,3 s est annulé et devient un
  plafond 45 s) ; départ de partie = 5 s de grâce (`loop._rebuildD`), remontée plus vite (2 crans quand p90 < 16,9).
  · **`chauffeRendu()`** : toute la scène dessinée UNE fois hors écran (cible 8×8 au format du composer) au menu (fin d'engChauffe) et
  120 ms après chaque newTrack — Safari/Metal ne crée le vrai programme de la puce (état de pipeline) qu'au 1er dessin de chaque combinaison,
  invisible au compteur linkProgram. Un objet caché dont la matière n'est pas compilée reste caché (rien d'inutile compilé). Coût mesuré :
  +2 programmes au 1er portail (matières de la carte moteur), une fois par session.
  · **Piqué** `uSharp` dans l'ACES (branche « peu de contraste » du FXAA, ses 4 lectures, borné par le voisinage) : 0 au plafond (image
  identique au bit près), dosé par `applyDPR` quand la résolution descend. `?pique=0` pour comparer.
  · **LE BANC DU TÉLÉPHONE `?banc=1`** : lance une partie seul, fige l'image au sol puis en vol (NUAGES, VILLE), chronomètre des images
  SYNCHRONISÉES (`readPixels` d'1 pixel en fin d'image = coût réel processeur+puce, sans la grille 16,7 ms) et éteint les postes un par un
  (DPR, post, bloom, ombre, ciel, nuages, piste, caisse, transparents, ville) ; mesure aussi l'affichage réel avec/sans HUD. Tableau à
  capturer. `&ech=0.25` réduit les échantillons (rendu logiciel). Hooks : `dbgDPR(d,sansPique)`, `dbgQual(k)`.
  · **POST tour 2** (écart ≤ 1/255) : FXAA et passes verticales du bloom en `texelFetch`, autres lectures en `textureLod(…,0)` ; HALO
  COMPOSÉ une fois par image (`bloomPass._cRT`) : l'ACES lit 1 texture au lieu de 5 ; `uWE` (WB×exposition) et `uKC` (contraste) posés par
  image dans `acesPass.render` ; tunnel/lueur nitro sautés quand ils valent 0 ; mips 3-4 à nouveau séparables (`?bloom=plie2d` = flou 2D du
  tour 1). Chaîne complète −33 % en rendu logiciel, −20/−25 % sur carte. ÉCARTÉ : LUT 3D (5-17 % des pixels à ≥ 7/255 : coudes du grade),
  halo 8 bits, cible R11G11B10F (mantisse trop courte pour le ciel clair), mediump (invérifiable sur PC).
  · **BITUME tour 2** : bitume en `FrontSide`, le bloc du DESSOUS de chaque tranche retourné à la construction (triangles inversés, normales
  et couleurs niées — le shader relit `abs(vColor)` et reprend le signe du `normalBias` sur `color.r`) : la face cachée n'est plus dessinée
  (−32 % sur la piste au sol en rendu logiciel). `LFB_ROUTE` (bitume) et `LFB_CAISSE` (tôles `rimify`/`lpMat`) SAUTENT les lumières nulles
  à ce pixel — lampe de couleur nulle, hors de portée, phare hors cône, directionnelle dos à la face (le soleil et ses 16 lectures d'ombre
  compris) : exact. `dbgBitume(false,false)` = l'ancien bitume. ⚠ Relevé : `stallKey`/`stallRim` (lampes de l'étal/atelier) passent
  visible → 10 lumières ponctuelles au lieu de 8 : ~30 programmes recompilés en entrant au garage puis au départ (voir la chasse aux gels).
  · **VILLE tour 2** (bloc « LA VILLE NE TRAVAILLE PLUS POUR RIEN » avant `villeMatTours`) : MESURÉ, la ville coûtait ~25 % de l'image en
  VILLE et les DEUX TIERS n'étaient pas des pixels (fenêtre de rendu d'1 pixel : encore 2/3 du coût) — 5 000 volumes × 24 sommets éclairés
  AU SOMMET par ~13 lumières, dont 75-80 % entièrement au-delà du brouillard. Désormais : QUARTIERS de 320 m (`villeTri`, chaîné sur
  `scene.onBeforeRender`) jugés à chaque rendu — hors champ = pas dessinés · entièrement au-delà de `fogFar` = matière NUE
  (`villeMatToursLoin`/`villeMatNeonLoin` : fogColor + pied noyé + pluie, zéro lumière, 4 interpolants au lieu de 24) · sinon complète ;
  tampons mis à jour par AJOUTS au bout / EFFACEMENTS repliés, ménage quand les restes dépassent 30 % (tout ranger à chaque changement
  remontait les tampons 40-115 fois/s). Au sommet `VILLE_TRI` (boîte hors champ repliée en un point, au-delà du brouillard sans lumière)
  et la PORTÉE DES LAMPES (`villeLampes` → `uLum9`, 4 sphères : les boucles ponctuelles/spots sautées là où leur apport est nul) ; au
  pixel, fenêtres/liserés/enseignes/pied/pluie seulement là où ils peignent (dérivées AVANT les branches) ; `USE_SHADOWMAP` retiré (la
  ville ne reçoit pas d'ombre). 5 appels de rendu au lieu de 3, +2 programmes au menu, 0 en course. Rendu logiciel, A/B dans la même page :
  ville −30 % au sol, −47 % en vol (sommets −57/−83 %) ; le reste est le PIXEL des tours proches (les `if` n'y sautent rien en logiciel —
  sur la puce, oui là où c'est cohérent). A/B au pixel (`dbgVilleAncien(true)` = l'ancien chemin) : 0 à quelques pixels d'ARÊTE (une arête
  rastérisée au bit près autrement). ⚠ Une matière de ville nouvelle passe par `villeChauffe`, dans l'ordre TOURS puis NÉONS (three trie
  les opaques par programme : le dessus d'une couronne est au ras du toit, à égalité c'est le néon qui gagne) ; ⚠ les quartiers se
  choisissent par TOUR (`tqC`/`tqN`) : ses pièces restent ensemble et dans leur ordre (égalités de profondeur aux croisements).
  `dbgCity()` = tri, ménages, envois ; `dbgVilleTri({lum,avAr,H,M,G,K})`. Bancs : scratchpad `ville2/` (m2 A/B+chrono, m6/m10 diff
  multi-vues, m7 GPU amplifié, churn, valide).
  · **LA MESURE DU VRAI IPHONE (28/09, banc `?banc=1` reçu par mail)** — iPhone 13 Pro, NETTE 1,5 : une image coûte **8-13 ms**
  (JS 1-2 ms), mais l'écran n'en montre que **30 i/s PILE** partout, même à DPR 1,0. Ce n'était PAS le jeu : Safari bridé à 30 i/s par
  l'iPhone (mode économie d'énergie, ou surchauffe — WebKit « ThermalMitigation »). La règle QL, qui ne voyait que 33 ms/image, baissait la
  netteté pour rien = le « mode pixel ». **LA SONDE** (`qlSonde`, `QLR.vrai`) : avant toute baisse, 5 images SYNCHRONISÉES (`readPixels` 1 px
  en fin d'image) donnent le vrai coût ; sous 14,5 ms c'est l'ÉCRAN qui bride → on ne baisse rien et ce qui aurait été baissé remonte
  (`QL.bride`, « ÉCRAN BRIDÉ » dans `?perf=1`). Sonde seulement quand des images sont ratées, au plus toutes les 8 s. Postes mesurés sur
  l'iPhone (écarts, en ms) : post −2/−4, piste −1/−5,5 (VILLE sol), ombre −3 (NUAGES sol), DPR 1,0 −1,5/−3 : plus rien de dominant.
  Le banc garde son tableau (`ccBancDernier`, rouvrir `?banc=1` le remontre, RELANCER / COPIER).
  · **Rendu logiciel = proxy du coût par pixel** : le même banc sous SwiftShader (`--use-angle=swiftshader`, ~11 min) classe les postes
  comme une puce saturée : ciel ~38 %, piste 20-50 %, post ~20 %, ville ~25 % en VILLE, ombres 3-12 %, résolution 1,25 = −23 %.
- **Écarté après mesure** : moins de mips de bloom (halo changé), RT 8 bits (banding), LOD de piste en deçà du brouillard (grain),
  décimation des rails au loin (silhouettes qui bougent), masquage de la face cachée du bitume (dalle qui vrille), regroupement des nuages.
- **Bancs** (scratchpad de la session 1a323fdd) : `banc/vol.js` (GPU par passe, `--drawgpu` GPU par draw sur image figée, `--attrib`
  triangles par objet, `--prof`), `ciel/skybench.js`, `post/echelle.js` (GPU lent simulé), `cpu/cpu.js` (bridé ×4), `piste/equiv.js`.
- **CHASSE AUX GELS** (2026-09-28, branche `perf-gels`) — les images qui figent, pas le débit. MESURÉ avant : 30-36 programmes compilés
  APRÈS le tap sur JOUER (~1,1-1,3 s de gel sur PC), 1-2 de plus à la 1re image de course, chaque portail ~150-200 ms de JS. Désormais :
  · **L'ATELIER À 8 LUMIÈRES** (`atelierLampes(on)`) : allumer stallKey/stallRim faisait passer la scène de 8 à 10 PointLights, et three
    recompile toute matière éclairée pour un nouveau compte (la caisse, l'atelier, le bitume et la ville vus derrière ses murs). Les deux
    lampes entrent quand les deux GYROPHARES (toujours à 0 hors poursuite) sortent : même compte, mêmes programmes que la course, image
    identique au bit près (même image figée rendue à 8 et à 10 lumières). ⚠ Ne jamais écrire `stallKey.visible=true` en direct.
  · **L'atelier se prépare au menu, d'abord** (`atelierChauffe`, dans engChauffe) : bâti caché dès que la police pixel est prête, compilé
    SEUL et dessiné une fois hors écran — `chauffeRendu(que)` : la scène ne garde que ses lumières (toutes enfants DIRECTS de la scène) et
    ces sous-arbres, sans passe d'ombre. Le garage du JOUER (`quiet`) ne prend plus de photos (sa bande est masquée) ; `CAR_GARDE` garde
    la 1re matière de chaque programme de caisse (le studio photo enchaînait deux constructions sans dessin et tuait les programmes).
    Résultat : **0 programme après JOUER**, même en tapant JOUER 0,3 s après le menu, même après une visite du vrai garage.
  · **La chauffe** : `chauffeRendu` ne dessine qu'UN exemplaire par couple (matière, géométrie) — les 2 000-4 000 pièces n'en valent
    qu'une (1 800-3 200 objets → 270-370 appels) ; `chauffeDivers(k)` une étape par image (c'était ~1,8 s d'un bloc) ; `chauffeGrace()` :
    chaque étape repousse la grâce de la qualité auto (`loop._rebuildT`) — une chauffe n'est pas une lenteur. `dbgChauffe()` (dev).
  · **buildTrack sans tableaux JS** : tampons typés à la taille exacte écrits en place (l'arrondi float32 à l'écriture = celui de la
    conversion), `normales9`/`sphere9` = computeVertexNormals/computeBoundingSphere recopiés opération par opération sur le brut,
    `TEINTE9` (la teinte du bitume ne dépend que de (point, colonne) : une fois par session), `sceneRetire` (retrait de la scène d'un seul
    passage — remove() un par un était quadratique sur ~5 000 enfants), `PIECES_LIBRES` (les pièces de la piste d'avant recyclées,
    `userData.pi`). Empreinte IDENTIQUE vérifiée (pts/T/Nn/B, pads, plots, huile, tremplins, trous, pièces, nuages, attributs + index +
    sphères de chaque maillage, ordre des enfants) sur 18 pistes × 3 niveaux. buildTrack ~2× plus rapide (banc, minima : 140 → 51 ms
    orbite, 165 → 82 nuages, 150 → 95 ville), pire image après un portail 26 → 16 ms.
  · Bancs (scratchpad de la session 1a323fdd, `gels/`) : `gels.js <racine> [--menu=ms] [--bride=4] [--garage] [--prof] [--time=f1,f2]`
    (le parcours réel, programmes liés avec matière/objet/lumières/appelant, images longues par phase), `bt.js <racineA> <racineB>`
    (newTrack A/B alterné dans le même navigateur, graines forcées, empreinte, chronos, minima), `garcomp.js` (l'atelier à 8 vs 10
    lumières, même image), `gelsprof.js` (qui occupe chaque image longue). ⚠ Les FRUITS se tirent au Math.random hors graine, que la
    musique consomme selon son état : ils changent d'une partie à l'autre (normal), pas la piste.

## PASSE DÉBOGAGE / PERF (2026-09-26) — lots 1 à 4, mesurée (téléphone émulé, processeur bridé ×4)
Résultat : 60 i/s partout sur PC, ZÉRO compilation de shader en course (portails, montées de moteur, rejouer, 1re ville, 1er vol de
pigeons). Pires images, bridé ×4 : moteur 169 → 65-92 ms, portail 322 → 66-111 ms, croisière 36 → 18-22 ms/image. Ce qui est devenu une RÈGLE :
- **Scène gelée** : `scene.matrixAutoUpdate=false` (sinon three recalcule ~6 000 matrices par image). Les objets IMMOBILES (plots, pièces,
  fruits, pouvoirs) sont posés puis `updateMatrix();matrixAutoUpdate=false` — un objet gelé qu'on anime doit appeler `updateMatrix()` lui-même
  (le LOD des pièces le fait). **Plots en instances** : `CONE_IM` (4 `InstancedMesh`, `conesInstancier()` après `buildTrack`) ; `CONES[i].mesh`
  est un FANTÔME hors scène ; un plot percuté passe par `coneVole(c9)` (un vrai `mkCone` prend sa place). Plaques turbo : 42 images pré-dessinées
  (`PAD_FR`, `updatePadTex` change la `map`, jamais le canvas).
- **Sons continus** : `stt(param,v,t,tc)` au lieu de `setTargetAtTime` dans la boucle (rien si le contexte dort, rien si la cible n'a pas bougé).
- **Ne jamais détruire un programme qu'on va réutiliser** : three DÉTRUIT un shader quand sa dernière matière est libérée. Donc :
  · piste : `MAT_SURSIS` — les matières de l'ancienne piste sont libérées 3 images APRÈS le 1er rendu de la neuve (`matSursisTick`) ;
  · caisse : `CAR_VIEUX` (libérées à la construction suivante) ; moteur de la vignette : `engVigVieux` (après le 1er rendu du suivant) ;
  · **préchauffe au menu** (`engChauffe`, une étape par image, `!started||gameOver`) : `chauffeDivers()` d'abord (ville, trace de gomme, un
    pigeon), puis les 30 moteurs dans `engVigScene` — la 1re matière de chaque programme reste en vie dans `ENG_GARDE`. ⚠ Tout ce qui naît EN
    COURSE pour la 1re fois avec une matière neuve doit rejoindre `chauffeDivers` (le vérifier avec un compteur de `linkProgram`).
- **Vignette moteur** (carte « NOUVEAU MOTEUR », écran de mort) : rendue seulement quand elle est recopiée (30 i/s), relue en ASYNCHRONE en
  WebGL2 (`engLit` : PBO + `fenceSync`, l'image arrive 33 ms plus tard ; repli `readRenderTargetPixels`), recopiée ligne par ligne (`engPose`).
- **DOM** : on n'écrit un style ou un texte QUE s'il change (`textContent=` recrée le nœud même à valeur égale). ⚠ Ne JAMAIS lire
  `innerWidth/innerHeight` dans la boucle : sur Chrome mobile ça force une mise en page complète → lire `VP.w/VP.h` (tenu à jour au `resize`).
  `applyDPR` ne réalloue qu'une fois et ne retaille les canvas 2D que si leur taille change (retailler un canvas l'efface).
- **Fuites fermées** : géométries de caisse/pigeons/explosion libérées ou partagées (`userData.partage`), `jeteObj` au `clearBoom`.
- **Bancs** (scratchpad de la session) : `debug/perf.js` (ressources GPU, draw calls, profil), `debug/acoups.js <racine> [brideCPU]` (pire image
  + shaders compilés par événement), `debug/boot.js` (erreurs de démarrage — À LANCER APRÈS CHAQUE LOT : `node --check` ne voit pas une
  variable avalée par un commentaire).
- **iPhone** : `f16ok` essaie un tampon demi-flottant 4×4 au démarrage — refusé par le pilote (écran NOIR sans erreur), le post-traitement
  repasse en 8 bits (testé en forçant le refus : image normale). Contexte WebGL perdu → sauvegarde, rechargement à la restauration.
- **Écarté après mesure** : grille spatiale pour la recherche de dalle en vol (~20 000 distances par image = moins de 0,1 ms, pas rentable).

## VAGUES GRAPHIQUES 2 et 3 (2026-09-26 / 27) — « L'ENCRE ET L'OR », puis les retours de jeu de Sacha
**Vague 2** (branche `fusion-gfx2`, six chantiers fusionnés) : ville/route/objets (plots rouge danger, pièces qui émettent l'or, plaques
turbo en or, liseré par niveau), voitures (laque, ombre cuite à l'encre, liseré de contre-jour, atelier), ciel (soleil « 1.61 » en or,
planète, ciel peint en DERNIER sur le plan lointain), HUD de course (FILE UNIQUE du couloir `hautPasse`, carte moteur v3 recollée dans
l'image WebGL), particules (explosion en volutes instanciées, jus pixel, réserves endormies), étalonnage PAR BIOME (`wb/sh/hi/con/bloom/
vig/rim`, `BIO_ETAL0` = les valeurs d'avant). La bible : encre `#1c0430` pour ombres et contours ; seul ce qui a de la VALEUR émet —
or `#ffd75e` argent, feu `#ff7a24` nitro, réserve `#5b7dff`, néon `#ff3ec8`/`#5ee6ff`, danger `#ff3b5c`.
**Vague 3** — les retours de Sacha après avoir joué la vague 2 :
- **NUAGES** : le « jour cobalt » (ciel bleu roi, mer d'encre, nuages encre/crème, `ETAL_JOUR`, apport de zénith) est REJETÉ — « j'aime
  pas le niveau dans les nuages, remets une version antérieure », puis « le ciel est bien maintenant, continue sur cette base ». Matin /
  midi / aprem et le modelé des nuages sont revenus à l'état d'avant la vague 2. ⚠ Ne pas re-cobaltiser le jour.
- **NITRO façon Asphalt** (bloc NFX, `nitroAllume`/`nitroEteint`) : à l'allumage onde de choc aux tuyères, recul caméra ~1 m + champ
  +7° (+8° en vol), cabrage ~3°, bords d'écran à la couleur de la poussée (une ligne dans l'ACES), traits de vitesse, « WHOOMP » ; en
  tenue flamme ×1,85 à cœur blanc, stries de vent 3D ; à l'extinction bouffée + pétarade, champ qui retombe en 1,2 s. Poussée et
  consommation INCHANGÉES. Aléatoire propre `nfxR` (ne touche pas `Math.random` du jeu). Banc `dbgNitro(r,x)`.
- **CAMÉRA** (`BOOM_CAM`, `CAM_ROUTE`) : la mort est un PLAN (recul en 0,55 s à ~14 m puis travelling lent et orbite 7°/s, objectif 70°,
  ciel toujours en haut, boule au centre de la zone libre, garde-fous tour/dalle, zéro ralenti). Sous la route : TONNEAU de ~0,2 s au
  passage dessus↔dessous (au lieu d'1,2 s de bascule) et CABRAGE ANTICIPÉ (la caméra lit la route 0,65 s devant et pivote d'une part de
  la pente). `dbgCamRoute({regle:{...}})` règle à chaud (ANTICIPE:0, ANTICIPE_DESSOUS:0, TONNEAU:0 = la caméra d'avant) ; `dbgBoomCam()`.
- **ÉCONOMIE** (bloc « ÉCONOMIE — VAGUE 3 », après `DENOMS`) : ~8× moins d'argent par partie, prix du garage inchangés. UN bouton
  global `gain` (dans `denom()`), `prime` (contrats), `defi` (seuils ENCAISSE), `flow` = ×1 · 1,3 · 1,5 · 1,8 · 2 (lu par `flowMult()` —
  jamais de multiplicateur en dur à l'écran), plafonds `recolte` ×2,5 et `serie` ×1,5. `qG` garde l'échelle des verdicts (MONSTRE…) et
  des pièces moteur. Record d'argent et Top 10 convertis UNE fois (×0,125, marqueur `eco:3`) ; la BANQUE n'est pas touchée.
- **HUD** : la barre de FLOW est de la famille de la jauge NITRO (même cadre, lèvre, reflet), juste dessous, 14 px, pictogramme
  « vague » ; les verdicts de pose (MONSTRE / DOUBLE / TRIPLE / MÉTÉORE / SNAKE LOOP + montant + pastilles de bonus) reviennent sur
  téléphone : `trickMsg` → `verdPousse` → une carte par image dans la file du couloir (famille `ver`). Banc `dbgHud('verdict',k)`.
- **ORBITE** (bloc après `pluieTick`, `orbiteBuild/orbiteLumiere/orbiteTick/orbiteChauffe`) — refait le 2026-09-27 (user : « la lune suit
  le joueur bizarrement, c'est un bug mais j'aime bien : mets-lui un visage inspiration troll face, CHOQUÉ, comme s'il le regardait ; à la
  place des astéroïdes des satellites STARLINK et des débris ; puis une lumière SPATIALE ») :
  · la LUNE garde son placement (tiers haut-droit, avec retard = elle « suit » le joueur — VOULU, ne pas corriger) ; `LUNE_R` 520 → 640 ;
    son VISAGE est dessiné dans le fragment (zéro texture) : yeux écarquillés, pupilles qui VISENT LA CAISSE (`uOeil`, direction écran
    lune → caisse, lissée + saccades), sourcils remontés, rides, plis du troll, bouche béante (dents, langue, mâchoire qui tremble) ; la face
    TOURNE ~22° vers la caisse ; `uChoc` monte en vol / nitro / explosion ; clignement rare ; yeux qui luisent sur la face de nuit ;
    hasard du regard = `orbAlea` (pas Math.random).
  · `SATS` (remplace ROCS) : 3 InstancedMesh + 1 matière `SAT_MAT` (pièces par `aPart`, variantes par `aVg`) — [0] Starlink entiers (1 ou
    2 ailes) : passants, champ, et TRAINS (files de 20-26 qui glissent, mouvement dans le vertex shader, éclat qui court le long de la file) ;
    [1] gros débris (satellite mort, étage de fusée, pan de panneau, petit satellite d'or) ; [2] éclats (matière par instance) + 2 anneaux
    de débris. `GLINT` : étoile à 4 branches sur chaque Starlink quand son panneau renvoie le soleil (tampons partagés avec [0]).
  · LA LUMIÈRE SPATIALE (`orbiteLumiere`, pondérée par `LVL.espace`) : UN soleil blanc rasant à GAUCHE de l'image, juste hors champ
    (`ORB.cle`, suit la caméra avec retard) — la fenêtre d'ombre suit `L_DIR/L_PERP/L_UP` (hors orbite = SUN_DIR au bit près, vérifié par
    `dbgOrbite('lum')`) ; hémisphère sans ciel, dessous = bleu Terre ; `fill` depuis la Terre, `kick` = clair de lune ; liseré (RIM) bleu
    depuis la Terre ; `FLARE` = voile + trait anamorphique du soleil hors cadre. Route d'orbite `route` .9 → .38 (le soleil l'éclaire).
  6 appels de dessin (+2), ~154 k sommets/image sur téléphone (les 4 variantes de gros débris EMPILÉES dans les mêmes
  sommets, `satEmpile`/`SAT_MAT_E` : 828 → 300 par instance ; ⚠ 14 attributs échouaient déjà au lien sous ANGLE, ce chemin en a 12). Zéro shader compilé au portail (mesuré). Bancs `dbgOrbite('vue'|'cout'|
  'photo'|'portrait'|'sat'|'train'|'rendu'|'force'|'lum'|'carte')`.
- **VILLE** (`VILLE_PENTE={seuil:.30,garde:.35}`, `adoucirPentes`) : la pente de la ville est comprimée au-delà de ~16,7° (pente max
  ~47° → ~30°), altitude seulement, zéro `rnd()` ajouté : NUAGES et ORBITE identiques au bit. `garde:1` = l'ancienne ville.
- **⚠ RELIEF COUPÉ PARTOUT** (même soir, user : « et en fait même pour la ville remets l'ancien terrain ») : `RELIEF_ON=false` — les trois
  niveaux ont la pente et les virages d'AVANT (banc : 36/36 pistes identiques à daf9e60 ; la ville garde VILLE_PENTE). Le programme
  ci-dessous dort derrière cet interrupteur (true = la VILLE seulement). Ne pas le rallumer sans que Sacha le redemande.
- **RELIEF — VILLE SEULEMENT** (même jour, user : « garde ce terrain pour la ville mais remets les anciens pour les deux autres niveaux ») :
  `reliefPiste`, les poids `wv` et les rayons larges ne jouent que si `sansLoop` (la ville) ; NUAGES et ORBITE retrouvent leurs pistes
  d'avant AU TIRAGE PRÈS (banc : 36/36 pistes identiques). Ce qui suit décrit donc la VILLE.
- **RELIEF** (`RELIEF`, `reliefPiste`, appelé à la fin de `genCtrl`) — « les parcours ne doivent pas toujours aller vers le bas… mets
  plus de virages larges », puis « 40 % descente, 30 % montée, 30 % plat ». Avant : 95-99 % de la piste descendait (6 à 13 km de chute
  par niveau). L'altitude ne vient PLUS des motifs (leurs `dy` ne servent qu'aux loopings) : un programme de tronçons DESCENTE −6/−15° ·
  MONTÉE +5/+11° · PLAT 0°, tenu en longueur, rampes de 120 m ; une montée débouche toujours sur un plat (pas de crête aveugle) ; 250 m
  plats avant le portail ; loopings transportés d'un bloc ; ÉTAGES : là où la route repasse sur elle-même, la suite passe DESSOUS à ≥ 85 m
  (marche douce, toujours vers le bas — ne jamais « soulever » : ça oscillait et faisait des pentes à 50°). RNG = hachage du tracé.
  Mesuré (banc `scratchpad/relief/mesure2.js`, 8 graines × 2 vitesses × 3 niveaux) : 28 % montée · 42 % descente · 30 % plat, chute
  ~0,3-1,2 km par niveau, écart mini aux croisements (hors loopings) ≥ 63 m. Virages : grand virage R 130-320 et grand balayage R 160-320
  (×RS), poids relevés partout — part de la piste en courbe LARGE (R 400-1500) ~22 % → 44 %, serrée (R < 150) ~13 % → 6 %. La caisse
  roule ~15 % moins vite en moyenne (la pente ne pousse plus en permanence). Nuages : la garde `nuageTouche` écarte ceux qui mordraient
  la route (85 nuages au lieu de 88).
Vérifié : VERIF OK, grand tour 0 shader compilé en course, 60 i/s.

## ⚠ FUSION SACHA × LÉO + NIVEAUX — 2026-09-24 (branche `fusion-2026-09`)
- `index.html` = fusion à trois points : appstore-backlog (Sacha) × `main:version-leolei-2026` (Léo),
  base `fusion-atelier-mobile`. Hors ligne : `vendor/` + police locale (aucun CDN, aucune Google Font).
- **NIVEAUX** (`NIVEAUX`, `LVL`, `lvlChoisir/lvlBiome/lvlGo/lvlStep/lvlPlanete/lvlNuageOk/lvlAnnonce`) :
  une zone = un niveau, en boucle **1 NUAGES** (jour : matin/midi/aprem, ciel SANS motif musical) →
  **2 VILLE** (biome `pluie`, ciel musical allumé, pluie `PLUIE`) → **3 ORBITE** (biome `espace` + `uSpace` :
  NOIR COMPLET, soleil éteint, planète ×1,35 sous la route). `cielMusical` coupe `uLvl` ET `uPulse` dans
  `musicTick`. Nuages filtrés dans `mkCloud` (+ une couche en NUAGES). Remplace la « nuit au 3e portail ».
  Bannière `#lvlBan` (niveau 1 : après le logo du départ). Hooks : `dbgNiveau()`, `dbgSaut()`.
- **ROUTE** : `ROAD_HALF` est un `let` posé par `lvlChoisir` : ×1,7 / 1,55 / 1,4 / 1,25 puis plancher ×1,1 de
  `ROAD_HALF0=14` (parc ×1,4). Dos d'âne, tapis et lèvre du tremplin : géométries sur `ROAD_HALF0`, mesh ×scale.x.
- **VILLE = village caché de la pluie, cyberpunk** (`buildVoxCity`, `cityRues`) : tours grises minces
  plafonnées à `CITY_MIN−50` (ne percent jamais la route), tuyaux + antennes DANS l'InstancedMesh des tours,
  étages/enseignes/feux DANS celui des néons, rues néon en texture partagée — toujours 3 draw calls.
  `CITY_BELOW` 660. Pluie : `LineSegments` 1 100 traits (600 mobile), animée en vertex shader, créée à l'init.
- **VERSION TÉLÉPHONE SUR L'ÉCRAN D'ORDI** : `index.html?tel=1` (ou `?mobile=1`, `FORCE_TEL`) — toute la
  fenêtre, chemin téléphone complet ; volant à la souris, clavier branché ; ni gel en paysage, ni plein
  écran forcé ; image 1,0 / 1,5. **PORTRAIT ET PAYSAGE (2026-09-27, user : « je veux un mode horizontal et vertical »)** : plus aucun gel
  quand le téléphone se couche (`#rotNote` et `body.couche` supprimés, manifest en `"orientation": "any"`) ; la caméra suit
  toute seule par `fovFit`/`POR`. ⚠ En paysage, l'écran d'accueil cache la caisse derrière GARAGE/SHOP.
- **CHARTE v2 — LE BOUTON D'ARCADE PIXEL** (dernier bloc CSS, il gagne sur tout) : contour 3 px par QUATRE ombres
  décalées (coins crantés, SANS clip-path — le clip-path rognait l'épaisseur), face deux tons, lèvre claire,
  tranche sombre, ombre au sol ; à l'appui −6 px. Variables par couleur (`--fc/--fc2/--hi/--lo/--ol/--tx/--txs`) :
  or (principal), bleu arcade (défaut), vert, rouge, orange (NITRO), `.off` gris. Panneaux (ce qui se lit) : même
  contour. Réglages et pause = PANNEAUX-LISTES (`.mPanel/.mLigne`, `.tpPanel/.tp.ligne`) avec interrupteur pixel
  `b.bascule` (ON à droite vert, `.off`/`.ko` à gauche gris) et valeur `b.valeur` (or + chevron) — `tpLbl` choisit.
  ⚠ ne JAMAIS remettre `position` dans le tronc commun : #tGear/#tNitro/.tbtn sont en position fixe.
- **UX MOBILE (audit 17 points, 2026-09-24)** : le téléphone ATTERRIT SUR LE MENU (JOUER · CARRIÈRE · GARAGE/MODES/
  RÉGLAGES) ; boutons de la coque et du panneau ⚙ au `click` (au relâcher : défilement possible, annulation par
  glissé) + `uiClic()` (note + vibration) ; `modale()`/`toast()` remplacent prompt/confirm ; REJOUER = `resetGame()`
  direct, placé AVANT la saisie du record ; réglages en 3 sections (`.mSec`), interrupteur SOUDÉ à son curseur
  (`.mGrp`) ; cibles ≥ 44 pt, textes ≥ 8 px ; coque traduite (textes nus enveloppés en `span[data-fr]` au boot) ;
  anneau-fantôme du volant jusqu'au 1er braquage ; fiche du garage repliée à 2 lignes (tap = déplier) ;
  transitions 180 ms (coupées sous Réduire les animations). ⚠ `closeGarage/closeStall` réappliquent le biome.
- **NIVEAU 1 CARRIÈRE** : biome `aurore`, ciel nu (`sansNuages`), piste dessinée à la main `genTuto()`.
- **CARRIÈRE (architecture, détail à faire niveau par niveau)** : `CARRIERE` = 3 biomes × 10 niveaux (NUAGES
  aurore→coucher, VILLE coucher→midi, ESPACE Mercure→Pluton). `carNiveau(b,i)` fabrique un NIVEAU standard
  (heure = biome ou `bioMix(a,b,t)`, planète = `astre` teinte/limbe/échelle via `lvlAstre`), `CARR.actif`
  branche `lvlChoisir`, `CARR_LARG` resserre la route, `SAVE.d.carr[biome]` = niveaux terminés. Bouton
  `#gCarr` (garage) → écran `#carr` (biomes → grille). Les JOUER « sans fin » remettent `CARR.actif=null`.
  Hook : `dbgCarriere()`.
- **CHARTE PIXEL UNIFIÉE** (bloc CSS « LA CHARTE PIXEL UNIFIÉE » en FIN de `<style>`, il gagne sur l'historique) :
  une police (Press Start 2P) partout ; PLAQUE d'arcade `.pbtn` pour ce qui se touche (`.pbCarre` : croix,
  flèches, retour), CADRE (même coupe `--coupe7`, même `--biseau`) pour ce qui se lit ; titres d'écran en or
  dégradé extrudé comme le logo ; ÉTAT dans une pastille `.etat` (or = actif/valeur, gris = coupé).
  **ICÔNES PIXEL** : `PXI_G` (grilles 9×9) → SVG en masque CSS, `pxi('nom')` en JS, `<i class="pxi pxi-nom">`
  en HTML, `var(--pxi-nom)` dans un `::before` ; taille ENTIÈRE via `--pxs` (1/2/3). **Aucun emoji ni glyphe
  système dans l'UI** (la police n'a ni ✕ ◀ ▶ ⚙ ⏸ ★ ✓). `TR()` retire l'accent des CAPITALES (`majPix`) ;
  les clés i18n « symbole + texte » ont un alias sans symbole ; `applyLangDOM` préserve les icônes.
  ⚠ bug corrigé : `filter` sur `.lg.gold` enterrait la face or sous l'extrusion brune (logo terne).
- **Icône app / écran de lancement** : l'emoji 💰 d'Apple (image protégée, risque de rejet) remplacé par le
  mot-symbole pixel CASH CAR (AppIcon toutes tailles sans alpha, Splash 2732, `assets/icons/` pour le web).
- **Résolution adaptative** : la remontée exige < 17,8 ms (et non 14,5 — impossible à 60 Hz, DPR coincé à
  0,42) ; paliers définitifs seulement sur lenteur SOUTENUE, hors reconstruction de zone / retour d'onglet.
  Image RAPIDE / NETTE = 1,0 / 1,5 (téléphone, `?tel=1` et ⚙ desktop). Plancher 0,5.
- **Caméra / conduite** : la caméra de conduite de SACHA en bloc (recul 4,6, suivi dt*5, roulis .035, FOV
  jusqu'à +38/+22) — les équations de conduite étaient identiques, c'est l'habillage qui faisait le « fun ».
  Swing/kick de Léo retirés ; boost de départ automatique (`startBoostT`) désarmé, le logo reste.

## ⚠ FUSION DU 2026-08-30 — LIRE AVANT DE SE FIER À CE DOCUMENT
Le projet avait DEUX `index.html` divergents : celui du dépôt (couche MOBILE : coque d'écrans,
volant analogique, écran nu, bac à sable, réglage d'image) et une copie de travail beaucoup plus
avancée dans `~/Downloads` (gamme de 15 caisses à silhouette unique, paliers de MOTEUR, garage 3D,
i18n FR/EN, fruits, parc freestyle, musique en fichiers, créatures, nouvelle boule de feu).
Les deux ont été fusionnés : le TRONC est la version avancée, la couche mobile a été PORTÉE dessus.
`index.html` du dépôt est désormais la SOURCE UNIQUE (sauvegarde de l'ancienne branche mobile dans
`index.html.bak-branche-mobile-*`).

Ce que la fusion change par rapport à ce que décrit la suite de ce document :
- **24 caisses à l'argent → 15 caisses à CONDITIONS** (`CAR_UNLOCK`, `carUnlocked()`, `carUnlockText()`),
  une SILHOUETTE unique par caisse (`SHAPES`, `spec.shape` déclaré, jamais deviné). `THRESH` n'existe plus.
- **`level` n'est plus une progression** : c'est la caisse CHOISIE au garage (`SAVE.d.equipped`). Ce qui
  monte PENDANT une partie, c'est le **palier de MOTEUR** (`ENGINE_TIERS`, `engTier`, `coinsGot`).
- **Musique** : le synthé procédural `MUS` a laissé place à une playlist de fichiers (`MUSIC`, `musicTick`).
- **Nuages** : le raymarch volumétrique (`VOL`, `mkCloudVol`) a laissé place à des nuages en MAILLAGE
  (`CLOUD_SPH`, `CLOUD_MAT`, `mergeSpheres`). `NO_CLOUDS` n'existe plus — le nouveau système est assez
  léger pour tourner sur téléphone, et les nuages y sont VISIBLES.
- **Ajouts du tronc** non documentés ci-dessous : i18n (`LANG`/`TR`/`applyLangDOM`), fruits (`FRUIT_DEFS`
  + l'étal), parc freestyle (`PARK`), planète, dauphins/serpent, voile de beat, sons de mort.
- **Sections encore à auditer** (elles décrivent l'ancienne branche et n'ont PAS été revérifiées) :
  Économie, Chaîne de figures, Pouvoirs, Announcer, Audio, Survivant, Biomes, Piste.

## Le jeu
Runner arcade 3D dans le ciel (Three.js r128). On conduit sur un ruban de route suspendu,
on saute, vrille, rebondit sur les tranches, traverse des nuages, ramasse pièces et nitro.
Une seule vie. 15 caisses à la SILHOUETTE unique, chacune avec SA condition de déblocage ; on la
CHOISIT au garage avant de partir. La progression d'une partie, c'est le MOTEUR qu'on monte.
Langue : français (bascule EN). Ton du flavour : fun, arrogant, cash, speed-addict, second degré.

## Structure
- `index.html` — TOUT le jeu (HTML + CSS + JS dans un seul fichier, ~11 700 lignes). C'est voulu : ne pas le découper sans demande explicite.
- `assets/audio/announcer/*.mp3` — 9 voix d'annonceur. Le TITRE du fichier = la condition de déclenchement.

## Lancer / tester
- Serveur local : `python -m http.server 8000` (ou `npx serve`) puis http://localhost:8000 — nécessaire pour que les mp3 chargent proprement.
- Vérif syntaxe rapide : extraire le JS entre `<script>` et `</script>` puis `node --check`.
- Déploiement : zipper `index.html` + `assets/` et glisser le zip sur Netlify Drop.
- Pas de build, pas de dépendances, pas de framework. Three.js vient du CDN cloudflare (r128 — NE PAS changer de version sans tester : l'API a bougé après r128).

## Architecture (repères dans index.html)
- **Ciel/décor — VICE CITY NUIT (rose/violet SOMBRE)** : skyDome shader (indigo profond au zénith → violet → grande bande ROSE Miami assombrie → corail → ambre au ras du couchant ; ÉTOILES scintillantes par cellules d'azimut — 64/tour, zéro couture ; LUNE pâle à l'opposé du soleil ; GUIRLANDE néon rose↔cyan sur l'horizon loin du soleil = la ville sous la mer de nuages), soleil « 1.61 » (halo contenu, échelle 940), horizonGlow rosé, RAYS, pigeons. ÉCLAIRAGE NUIT : hemi rose-mauve/indigo `0xba86b6`/`0x18162e` baissé à **.40**, soleil **BRAISE ROUGE-CORAIL `0xff6a3c`** 1.45 (« red hour » : lumière rasante rouge sombre sur le bitume, ombres longues inchangées), fill bleu néon `0x4f74e8` .24 par dessous, kick MAGENTA `0xff3d9e` .20. `POST_EXPO` **0.71** + `brightness .97` : le sol s'éteint pour que les lumières de la caisse y VIVENT. Fog `0x5e3254` (contre-jour corail, nuage rose-lavande). PISTE : bitume NUIT VIOLET `0x2b2937`, spéculaire ROSÉ `0x9a5568` shininess 58, BANDES NÉON ROSE `0xf24aa0` + NAPPE additive `fog:false` qui saigne vers l'intérieur (1 mesh/face, dans `trackMeshes`), ligne centrale sodium doré. **LUMIÈRES DE CAISSE** (toutes à l'init → zéro recompilation) : `headSpot` = SPOT phares (suit le nez via `getWorldDirection`, 1.2, éteint en 'boom') + **`nitroLight`** = PointLight du REFLET NITRO/BOOST derrière l'échappement (repère caisse via `hsF`/`hsU` — marche sous la dalle) : orange `0xff7a24` nitro / bleu `0x5b7dff` réserve bleue / or `0xffb040` pad turbo, intensité lissée + tremblement 43 Hz, pilotée par `nitroOn`/`nitroBlue`/`boost`. Halos phares élargis, NÉON SOUS CAISSE magenta (`userData.noShadow` → exclu du castShadow, sinon carré d'ombre). **ÉCHAPPEMENT v2 (refonte totale)** : (1) **PLUME DE RÉACTEUR** (`JETS`, `jetTex`/`jetGeo`/`jetShellM`/`jetCoreM`/`jetGlowM`) — cône additif par pot (coquille colorée + cœur blanc + halo tuyère), texture dégradée avec ANNEAUX DE CHOC bakés, construit dans buildCar (listes vidées à chaque rebuild), animé chaque frame (`JETS.k` lissé, flicker 57 Hz, long à la nitro) ; (2) **TRAÎNÉE RUBAN** (`mkTrail`/`trailStep`, `trailL`/`trailR`, `TRAIL_N=26`) — 2 rubans additifs à buffers FIXES accrochés aux tuyères (historique de positions, largeur orientée face caméra, fondu au carré de l'âge, couleurs franches orange/bleu/or) avec **FONDU PRÈS CAMÉRA** (<3-7 m → 0 : la caméra de poursuite roule DANS le sillage, sans ça = voile blanc plein écran) et reset d'historique au réveil (pas de trait fantôme) ; (3) **BRAISES fines** — particules d'échappement à vie COURTE (.05-.14 s) et taille plafonnée (les sprites géants qui restaient plantés dans le monde et que la caméra TRAVERSAIT, c'est fini), exSmoke discret. `nitroLight` portée 18 (une flaque, pas une rivière spéculaire) — au REPOS elle passe rouge feux arrière .55 (reflet permanent, la nuit sert à ça), nitro orange 1.6 / réserve bleue 2.1 / pad or .9 ; + **`trailLight`** (PointLight 26) : le reflet de la traînée glisse 9 m derrière, couleur du ruban. **MEUTE ÉQUIPÉE PAREIL** : halos phares/feux (`pcHeadM`/`pcTailM`), plume réacteur bleue (2 cônes `jetGeo`/caisse, `b.mesh.jets`), **7 rubans bleus `botTrails`** (larges ×1.7, sans limite de distance, reset survStart/endGame), **`botJetLight`** (1 PointLight bleue → l'échappement du boosteur le plus proche), cerveau nitro débridé (`appBoost` .45 base, gate .35, durée .7-1.9 s — la ressource régule, zéro triche). envTex indigo→rose sombre→ambre + strips rose/cyan. Nuages VOL : `uSunCol` rose-doré tamisé (1.95,.92,.62), `uSkyCol` violet, `uGroundCol` prune, `uAmb` .46. GRADE : SAT 1.40, VIVID .74, WB magenta (1.02,.985,1.03), ombres bleu-violet, hautes lumières or rosé, bloom .58/.52 seuil .92, vignette pourpre .52.
- **Nuages VOLUMÉTRIQUES — ACTIFS, LISSES & CRÉMEUX** (`VOL`, `mkCloudVol`, `mkCloud`, `buildClouds`, `updateClouds`). Historique 2026-07-16 : deux aller-retours. (1) Le raymarch DÉGRADÉ (18-24 pas + DPR bas) tramait en « boules damier » ; (2) la bascule tout-sprites a été REJETÉE encore plus fort (« retour 20 prompts en arrière ») — le user veut du PHYSIQUE traversable ET lisse. Leçon : **réparer la version dégradée, jamais changer de système**. Verdict final : la forme vient des MÉTABALLES (lisses), le bruit ne fait QU'adoucir le bord. Réglages « lisse » : `uCoverage .85, uDetail .04` (fin du carving cellulaire = fin du quadrillage), `uFreq 1/120` base ET par-nuage (grosses ondulations douces, jamais de grain fin ; `fMul=min(1,300/r)` garde les lobes proportionnels à la taille), **dither ×.18** (c'est lui, magnifié par le DPR bas, qui dessinait le quadrillage diagonal), `uEdge .34, uSigma .55, uDensity 2.9, uAbsorb 1.5, uAmb .56`, ventres `uGroundCol (.13,.08,.18)`. **Planchers de pas** LOW 32/4, MED 42/5, mobile 32, desktop 56/7 (grain ∝ 1/pas — nuages peu nombreux + pas plafonnés `slMax=|vRadius|*.05`, ça se paie). **ANTI-GRAIN (2026-07-18)** : alpha au point JITTÉ (stratifié, zéro anneau) mais ÉCLAIRAGE au point quasi stable (micro-jitter 30 % du pas) — l'alpha sature en 1 pas sur un nuage épais, donc lum plein-jitter = sable, lum figée = bandes ; grain ANIMÉ par frame (statique = saleté collée) ; bascule matB en marge ABSOLUE ~9 m (en ×1.45 un titan passait sans z-test à 1,7 km → nuage visible À TRAVERS la route). **Fondu de bord `rim=1-smoothstep(.88,1,‖impact‖)`** (.78 = boules, .93 = pointillé sur les petits). Se juge TOUJOURS au pire cas `dbgCloud(26,4)` : lisse là = lisse partout. Chaque nuage = une BOÎTE englobante (`VOL.geo` cube ±1, `r/ry/r`) avec un `ShaderMaterial` GLSL3 (`VOL.matF`/`matB`, WebGL2 requis) : rayon dans l'ELLIPSOÏDE, champ de densité 3D, MARCHE VERS LE SOLEIL (`lightMarch`, loi de Beer) → cœurs OPAQUES, ventres ombrés, coiffes dorées, on VOLE DEDANS. Densité = ellipsoïde PLEIN moins le bruit ; bruit = texture 3D 64³ Perlin-Worley bakée une fois. Blending PRÉMULTIPLIÉ (`OneFactor`/`OneMinusSrcAlpha`), `depthWrite:false` ; `matF` depthTest:true, **`matB` SANS depthTest** (caméra dans la boîte : sinon le z-test découpe le volume en TROUS polygonaux — LE bug de proximité). **RAMPE DE PAS** : pas serrés à l'entrée (×.55→1.6), longs au fond (alpha sur la longueur RÉELLE `sl`). **Bascule FRONT/BACK selon la CAMÉRA** (updateClouds) : dans la boîte → BackSide ; dehors → FrontSide. Fog dans le shader (`uFogAmt`, `noFog`→0). Repli `mkCloudSprite` si pas de WebGL2 (silhouette peinte : peu de sprites, très gros, opaques). DONNÉES nuage et physique/gameplay/son INCHANGÉES. Familles GAMEPLAY (couloir de la piste) : bancs SUR la route (murs, plus rares), nuages de VOL en **CHAMPS de 2-3** échelonnés (coussin d'air + airtime `c.refT`), TOURS GÉANTES (`giant`), MER/ouate/VOILES (`sea` dMul .7, `deco`, `veil` dMul .4). **CIEL ORGANISÉ — une MÉTÉO, pas un semis** (après ces familles → zéro décalage RNG ; espace MONDE, `roadY≈37` ; ⚠ JAMAIS `B[i]`/`Nn[i]` : binormale verticale sur piste loopée = nuages éjectés SOUS le monde) : VENT unique (`wA`) oriente rues et massifs, `pickAz` garde le COULOIR DU COUCHANT dégagé (azimut >0.62 rad du soleil). 6 couches PEU & GROS : (1) **RUES DE NUAGES** — 7 chaînes de 2-3 cumulus sous le vent, sur le MÊME plafond (`o.baseY`→`center.y=baseY+ry*0.64`, `deckY≈roadY−58`), (2) électrons libres, (3) banc haut, (4) OCÉAN d'undercast PLAT (y −245±38), (5) **MASSIFS** — 3 fronts de 2 tours épaule contre épaule (`pickAz`), (6) **TITANS** (`titan:true` r 700-1200, `dMul .8`, `stepMul .55`) : 3 par `pickAz` + **LE COLOSSE** aux 2/3 du run à l'OPPOSÉ du soleil. Tours `cross` PLAFONNÉES à r 190. `buildClouds` : UN SEUL `rr()` puis mulberry32 propre. `cloudInS` pilote voile `#cloudFx`, fog, sons feutrés, `sparkGold`. **PALIERS PERF (applyPerfTier, UN SEUL chemin)** : défauts desktop **46/6** (56/7 était un luxe), MED (<54 fps soutenus OU **détecteur d'À-COUPS** `loop._spk` : ~10 frames >26 ms sur 2-3 s — l'EMA lissait les pics des titans plein écran) → `36/4` + ombres 1024 ; LOW (<45 fps après 12 s) → `26/4` + bloom off + BasicShadowMap. ⚠ `uSteps` ÉCRASÉ à chaque draw par `onBeforeRender` (`VOL.stepBase×stepMul`) : les tiers écrivent **`VOL.stepBase`**. Budget de base allégé (2026-07-17) : DPR cap desktop **1.5** (Retina : −26 % de pixels, invisible sous bloom+grain), **MSAA réservé aux écrans 1×** (`devicePixelRatio<1.5` — le resolve coûtait cher pour rien sur Retina), ombres 1536→**1280**, bloom desktop .62→**.55**. Hooks console : `dbgCloud(steps,lightSteps)` et **`dbgPerf()`** (ms/fps/spikes/dpr/tier — à demander au joueur pour tout rapport de fluidité). DPR adaptatif : gros cran >24 ms, petit >19 ms, remontée <14,5 ms. Étalonnage : `body>canvas{filter}` + `#vig`.
- **GARAGE — L'ATELIER low-poly** (`GAR`, `buildGarageRoom`, `garageRender`, `openGarage`/`closeGarage`) :
  la vitrine n'est plus une caisse posée sur une nappe de brume à 1500 m, c'est un vrai atelier — établi
  garni, panneau perforé d'outils, servante, compresseur, palan, pont élévateur, rack, distributeur,
  piles de pneus, néon « CASH CAR » qui respire, six tubes au plafond dont UN qui grésille, poussière en
  suspension, et la PORTE RELEVÉE sur la nuit d'où **la route part directement** (liseré néon rose +
  pointillés sodium, fondu baké dans la texture — pas de barrière, pas de parvis clos : franchir le
  seuil, c'est déjà être sur la ligne de départ). La caisse tourne sur un plateau cerclé de cyan, la
  caméra fait ses 360° DEDANS. Bâti UNE FOIS à la première visite, en SIX géométries unité mises à
  l'échelle + ~15 matériaux plats ; caché à la fermeture. **⚠ TROIS RÈGLES GRAVÉES** : (1) *placement* —
  l'orbite est bornée à 7,8 m, donc **rien de haut ne se pose à moins de 8,3 m du centre** (sinon la
  caméra traverse l'objet en tournant) ; tout ce qui reste **sous 50 cm** est autorisé dans le couloir
  (la caméra vole à 1 m minimum), et c'est là que vit le bazar au sol. (2) *lumière* — **aucune
  PointLight n'est ajoutée à la scène** : on recycle `stallKey`/`stallRim` (celles de l'étal), qui
  suivent la caméra façon studio ; une lumière de plus se paierait sur TOUTES les frames du jeu, course
  comprise — et `stallRender` doit reposer leur teinte et leur portée. (3) *cônes de lumière en
  `FrontSide`, jamais `DoubleSide`* : la caméra ENTRE dedans en tournant, et en double face on se
  retrouvait derrière un voile blanc plein écran. Dosage : à 2,9 + 1,9 d'intensité tout partait en
  pastel délavé — un atelier, c'est deux lampes et beaucoup d'ombre. Cadrage portrait : `fov 52×FOV_K`,
  distance `×(1+POR·.34)`, visée abaissée de `POR·.40`.
- **BIOMES — le monde voyage** (`BIOMES`, `BIO`, `bioGo/bioStep/bioApply`, `paintEnv`) : 5 ambiances complètes par zone, LERPÉES ~4 s au portail (uniforms/couleurs UNIQUEMENT, zéro recompilation) — `braise` (l'identité Vice City, valeurs d'init copiées à l'identique), `aube` (pastel laiteux), `orage` (violet éteint), `minuit` (bleu-noir, étoiles ×1.8, lune reine, nuages ARGENT lunaire), `neon` (magenta/cyan à bloc, sat 1.62). Choix par ARCHÉTYPE de zone (`zoneArch` posé par genCtrl SANS consommer de rnd) : FLOW→braise · TECH→neon · ALPIN→aube · VOLTIGE→minuit · GRAND8→orage ; zone 0 toujours braise. Chaque biome pilote : GRADE DU CIEL (uniforms `uSkyMul/uSkyLift/uSunTint/uSunHalo/uCity/uStars/uMoon` injectés dans le shader skyDome — identité neutre par défaut = rendu d'origine au pixel), fog (`FOG_N/FOG_F` devenus `let`, RGB de `FOG_BASE` muté), les 4 lumières (hemi/sun/fill/kick — hemi désormais NOMMÉE), uniforms nuages VOL (`uSunCol/uSkyCol/uGroundCol/uAmb`), `POST_EXPO` (let, relu chaque frame par le contre-jour) + `uSat` ACES, sprites soleil « 1.61 »/horizonGlow/RAYS (opacité ×sunHalo — à minuit le soleil devient fantôme), et `envTex` REPEINT via `paintEnv` (canvases gardés dans `envCvs`). `bioStep(dt)` tourne en tête de loop (hors gate de sim : le ciel vit même au menu). Hook console : `dbgBio('minuit',durée)`. ⚠ bioApply est la SEULE écriture de sun/hemi/fill/kick/uSat — ne pas ajouter d'autre écrivain sans passer par les biomes.
- **Piste** (`genCtrl`, `buildTrack`, `frameAt`) : Catmull-Rom + repères T/N/B. Deux faces roulables (`side` ±1). **ADN DE PISTE (genCtrl v2)** : chaque zone tire un ARCHÉTYPE (`AR` : FLOW sweepers / TECH épingles-chicanes / ALPIN crêtes-plongeons / VOLTIGE loops-hélices / GRAND8 mixte) = poids des 10 motifs (dont chicane rapide et spirale géante) + LATÉRALITÉ (`hand`/`sgn()` : piste qui spirale à gauche, à droite ou équilibrée) + humeur verticale `vt` + SIGNATURE DE FIN par archétype (double loop, triple chicane, méga-plongeon…). **NIVEAU → PRATICABLE** : `LV=1+min(2.6,level*.13)` élargit TOUS les rayons (`RS=AR.rs*LV`), évase les épingles (`180/√(LV·.7)`), allonge départ/respirations/droites et la zone (`LEN=7200×(1+min(1.1,level*.07))`) ; gros motifs plafonnés en longueur d'arc (~58000/R) pour ne pas manger la zone ; loops en douceur (`LOOPS=1+(LV-1)*.35`). **ACCENT DE ZONE** : `accC` tiré parmi 6 néons (rose/cyan/ambre/menthe/violet/corail) teinte bandes + nappe — chaque portail change la couleur de la nuit. ATTENTION : `rnd` (mulberry32 seedé) est consommé séquentiellement dans buildTrack — insérer/retirer des appels `rnd()` change toute la génération en aval.
- **Voiture** (`CARS`, `buildCar`) : 24 specs, meshes procéduraux. **GABARITS v2 (silhouettes par archétype)** : `carProfile(pts,w)` extrude un PROFIL 2D (z=longueur, y=hauteur) sur la largeur — silhouette choisie par niveau (surchargable par caisse via `spec.shape`) : `boxy` (0-3, l'ancienne construction en boîtes + épave), `gt` (4,6,7,9 — coin plongeant + verrière profilée), `muscle` (5,8 — long capot, hanches, scoop), `formula` (10 — fuselage étroit roues DEHORS, aileron biplan, pontons), `proto` (11-13 — coin furtif + bulle de verre + dérive), `rocket` (14-23 — fuselage missile, ailerons en croix, canards, carénages de roues, variations par `vr=lvl-14`, anneau doré pour DIEU-VITESSE). ⚠ ANCRES à ne pas déplacer : pots/plumes JETS à `±spec.w*.22, y .43, -l/2-.14` (les TRAÎNÉES rubans et `nitroLight` y sont accrochées en dur via `hsF/hsU/hsR`) ; phares/feux/halos paramétrés par gabarit (`hlX/hlY/hlZ`/`tlX/tlY/tlZ`). Hooks console : `dbgCar(i)` (prévisualiser une caisse, visuel pur) et `dbgView(a,d,h)` (MODE PHOTO : force la pause, cadre la caisse, re-rend une frame). **LA CAISSE ÉCLAIRE LA ROUTE (`CARPOOL`)** : 3 plans additifs au sol recréés par buildCar (même recette que le néon sous caisse) — `head` flaque de phares chaude devant (l'épave n'a qu'un œil : op .14), `tail` rouge feux derrière (chauffe au frein via `keys.ArrowDown`), `jet` halo de nitro/traînée (opacité=`JETS.k*.5`, couleur copiée de `jetShellM` → suit l'état orange/bleu/or) ; tout s'éteint en 'boom'. PointLights renforcées : headSpot 1.85, nitroLight repos .8 (reflet rouge permanent), trailLight portée 34 ×1.7. **MEUTE : MÊME KIT** (`pool9` dans mkPolice : flaque phares blanc-bleu + rouge AR + `jetPool` bleu par bot, opacité pilotée par sa poussée dans survRender). **PARTICULES D'ÉCHAPPEMENT v3** : texture `sparkTex` (cœur brûlant, chute d'alpha rapide — le disque mou `puffTex` gonflé au bloom faisait des BALLONS blancs), tailles ÷2 (flames cap .62, core .34), flux serré haute vitesse (spread ~.6-.9, vitesse arrière 22-28) — un JET de feu, pas des boules. **v3.1** : `poolTex` (flaque radiale à extinction FRANCHE — lampTex saturait les nappes additives en PAVÉ visible) pour néon/flaques joueur+police ; `beamTex` = DEUX faisceaux de phares peints (bord haut du canvas = pare-chocs, blanc neutre teinté par matériau : chaud joueur / blanc-bleu police) sur les plans `head` ; fumée de gomme UNIQUEMENT en glisse (`drf9` = même zone morte |psi|>.32 que le crissement, teinte mauve-nuit .28) — la poussière permanente derrière les roues a sauté ; blob de contact face dessus .5→.30 et `shadow` .10 en drive (ils creusaient un donut dans les flaques). Hook `dbgScene()` (carGroup/scene/ombres) pour disséquer au debug. ⚠ En PAUSE photo, les particules restent FIGÉES à l'écran (la gerbe du drop d'intro dessine un faux « anneau » sous la caisse — artefact de pause, pas un bug). Chaque caisse porte `desc` (punchline de déblocage) affichée par la CARTE DE DÉBLOCAGE (`carCardShow`, `#carCard` : nom + km/h + niveau + desc, 5,2 s). Indices codés en dur alignés sur 24 : `level<23` (checkUpgrade), `min(level,23)` (denom/bestCar), `min(level,22)`/`level>=23` (jauge), `level<19` (earlyDead = mort avant le top 5).
- **Modes** : `mode` = 'drive' | 'fall' | 'boom'. Physique conduite dans la boucle, vol dans le bloc 'fall', `tryLand(dt)` gère atterrissage, BUMPS (rebond tranche) et SNAKE LOOP. **`AIR_RATE` DYNAMIQUE (let, posé par startFall)** : `clamp(.95+kmhAffichés/420*.55, 1, 2.3)` figé au décollage — vol au tempo du roulage quand on roule doucement, vol qui claque en endgame (l'ancien 1.6 fixe rendait le vol trop rapide au début et MOU à 1500 km/h). Dans le bloc 'fall' un `dtF=dt*AIR_RATE` remplace `dt` pour TOUTES les intégrations de vol (gravité `FALL_G`, position, `fallT`/`nitroAirT`, lacet/vrille, poussée nitro, compteurs dauphin/rase/limbo/mains, surf de nuage). La parabole DANS L'ESPACE est identique (viseur d'atterrissage + seuils de figures + paiements INCHANGÉS car `fallT` suit le temps-sim), mais on flotte moins longtemps. **JAUGE D'AIRTIME EN TEMPS RÉEL (`fallTR`)** : le camembert des 6 s (`#airPie`) et l'explosion comptent sur `fallTR+=dt` (secondes VÉCUES — sinon le chrono filait à ×1,6) ; `fallT` (temps-sim) reste la référence des figures/paiements ; les remboursements sont miroités (nuage `rf/AIR_RATE`, bump demi-jauge, `pwrAirT` reset les deux). ⚠ `tryLand` DOIT recevoir `dtF` (pas `dt`) sinon le balayage anti-tunnel couvre une distance trop courte → traversée de dalle à grande vitesse. Collisions BALAYÉES anti-tunnel : `prevH/prevL` (position de la frame d'avant dans le repère de la dalle) rattrapent dessus/dessous/paroi percés en une frame à grande vitesse. **PLONGEON FATAL v2 (`trackMinY`)** : la mort en vol = passer sous le point le plus BAS de toute la piste −120 m (`trackMinY`, calculé dans buildTrack) — l'ancienne référence `lastNearY-200` (route la plus proche en 3D) tuait injustement en plein plongeon légitime de crête ALPIN (elle référençait la crête au-dessus). `lastNearY` reste pour le télégraphe d'atterrissage. **`SPD=0.25`** (÷2 le 2026-07-16, « trop rapide ») : SPD scale TOUT — avance joueur/bots, position de chute, viseur ET compteur affiché ; c'est LE bouton de vitesse globale. Le viseur d'atterrissage intègre comme la vraie chute (pas de position ×SPD). Hooks debug : `dbgState()` (état interne lecture seule), `window.__loopErr` (dernière exception avalée par le try/catch de loop), capteur `addEventListener('error')` → `document.title='ERR:…'` (les erreurs d'init échappent aux consoles headless).
- **Announcer** (`ANN_LIB`, `annSpeak`, `annRoll`) : chaque condition déclenche sa voix EXACTEMENT 1 fois sur 3 (paquets de 3, place aléatoire). TOUTES les clés ont `first:1` : la voix se présente à sa 1re occurrence, ensuite elle se mérite. Couches : voix (`ANN_VOICE_VOL=.58`) + doublure démon pitchée (.26) + 2 échos dorés (161,8/323,6 ms). Ne jamais laisser un fichier manquant planter le jeu (`e.dead`).
- **Économie — REBASÉE ×2,5 (2026-07-17, « montants trop énormes »)** : `DENOMS` (valeur des pièces ×~2,5 par niveau, 24 entrées de 10 à 15e9 — fini les 1e25), `THRESH` (23 paliers cumulés ≈ `5×denom×effort` avec la MÊME courbe d'effort 8→630 équiv. pièces : la difficulté ressentie est inchangée, seuls les zéros ont dégonflé ; DIEU-VITESSE ≈ 19 billions cumulés). ⚠ tout revenu est relatif à `denom` → l'échelle suit seule ; la pluie de billets est calée dessus (`nextRainAt=4e3`, `×2.6`) ; les VIEUX records localStorage sont sur l'ancienne échelle (inatteignables — proposer un reset au user). `UNITS` monte jusqu'aux QUINTILLIONS (1e30). **Flavour pools** (`pickL` + `GO_LINES`/`ZONE_LINES`/`RAIN_LINES`/`CRASH_LINES` (fonctions montant→phrase)/`END_LINES`/`END_TOP`) : départ, portail, pluie de billets, chaîne perdue, punchline de fin de run (dans `tagline` sous GAME OVER, variante record). Revenus : pièces (combo x5 max), CHAÎNE de figures (voir ci-dessous), portail (`denom*40` + nitro pleine), tirelire (`denom*8`). Fever = tout ×2 pendant 10 s. **Unités compactes** (`fmtC`, `UNITS`) : tous les messages d'événement (verdict, mallette, tirelire, portail, « pièces de », prochaine voiture) affichent « $ 1,4 M » — échelle longue française k/M/Md/Bn/Bd/T ; le compteur GTA 8 chiffres (`fmtGta`) et les records gardent le nombre plein. Première traversée d'un ordre de grandeur = célébration « 💸 TU COMPTES EN MILLIONS » (`unitSeen`, une fois par SESSION, jamais reset).
- **Chaîne de figures** (`addTrick`, `chainVal/chainMult`, `#chainHud`) : chaque exploit aérien se NOMME à l'instant où il naît (pop `trickMsg` + carillon `trickPop` qui monte d'un demi-ton par maillon) et gonfle la chaîne — RIEN n'est payé en vol, tout se cashe à l'ATTERRISSAGE : `gain = denom*(5*fallT + chainVal)*chainMult(≤6)*grade*(face cachée ×2)*série*fever`. Grade de réception : PARFAIT ×1.5 (impact<4.5), normal, POSÉ LOURD ×0.65 (impact≥10) — pendant le BRAQUAGE tout monte d'un cran (PARFAIT→DIVIN ×2, normal→PARFAIT, lourd→normal). **BRAQUAGE** (`feverArmed`, `heistFire`) : à `styleM`≥100 la jauge S'ARME (clignote rose `.armed`, fuit à −2/s, retombée à 0 = désarmée) — DOUBLE-TAP ESPACE <280 ms (`lastSpaceT`, garde `e.repeat`) déclenche le fever ×2 de 10 s ; chaque figure pendant le braquage PROLONGE de +0,8 s (plafond 18 s, largeur de jauge clampée). **ROLLOVER** (`rollover`) : une pose PARFAIT/DIVIN reporte 10 % de `chainVal` comme mise de départ du vol suivant (pop « REPORT +X » dans `startFall`, consommé une fois) — reset avec `feverArmed` dans `resetGame`. Bonus posés : PILE AU CENTRE (|lat|<30 % demi-route), À RECULONS (vA<-3). Si on EXPLOSE : « CHAÎNE PERDUE » — tout s'envole (bank-or-bust). La redite paye 60 % de la précédente (`chainSeen`), sauf échelles `raw` (vrilles, bumps). Figures en vol : vrilles par demi-tour de lacet (180°/360/540…), BIG AIR (2,3 s), AIR MONSTRE (4,4 s), PLEIN CIEL (+26 m au-dessus du départ), MÉTÉORE (nitro 1,2 s en l'air), SANS LES MAINS (2,1 s sans volant), PERCE-NUAGE (entrer dans un banc), RASE-MOTTES (frôler le dessus de la dalle ≥0,55 s, via radar `curNear/curHOff/curLatOff` rempli par `tryLand`), LIMBO (passer sous la dalle ≥0,35 s), LE DAUPHIN (nager au ras de la dalle, bande 0,9-7 m : `chainVal` accrue en continu au CARRÉ de la proximité via `dolphT`, pop à 0,4 s, DAUPHIN ROYAL à 2,4 s cumulées, écume `sparkGold` sous la caisse quand on frôle ; pendant l'accumulation le HUD de chaîne affiche EN CONTINU « 🐬 LE DAUPHIN +X » via `dolphGain` — on sait POURQUOI ça monte), BUMPS (tranche de dalle, échelle 8+3n, demi-jauge d'airtime rendue). Détection dans le bloc 'fall' de `loop` + entrée nuage dans `updateClouds`. Reset de la chaîne dans `startFall`, verdicts announcer par seuils `gain/denom` (m2≥45, m3≥140) + overrides meteor/snakeLoop/megaMeteor inchangés. **LA MALLETTE** (`#caseHud`, `chainEst()`) : la valeur en jeu s'affiche EN DIRECT sous le HUD de chaîne (💰 + montant, police qui gonfle avec le magot) ; au-delà de `denom*20` elle passe `.hot` (or, tremblement CSS `caseTremble`) + battement de cœur (`heartBeat`, toum-toum sinus 58→38 Hz, cadence 0,86 s). À l'explosion EN VOL : « CHAÎNE PERDUE — $X ENVOLÉS ! » + gerbe `sparkGold` (garde `mode==='fall'` : une explosion au sol après encaissement ne perd rien) — SAUF la 1re fois : **L'ASSURANCE** (`insUsed`, reset dans `resetGame`) sauve 30 % de la mallette (« 🛡 ASSURANCE — $X sauvés sur $Y (une seule fois par run !) », `checkUpgrade` + `flyCash`) — le filet qui enseigne le bank-or-bust aux débutants sans coûter aux experts. Masquée à l'atterrissage/explosion/reset. **L'ÉCHELLE** (`LADDER`, `ladderI`) : chaque palier de multiplicateur franchi se crie (×2 CHAUD ! · ×3 EN FEU ! · ×4.5 MILLIONNAIRE · ×6 JACKPOT MAX) avec carillon qui monte — reset dans `startFall`. **HIT-STOP** (`hitT`) : 80 ms de gel (`dt×.04`, à côté du slow-mo dans `loop`) déclenché sur le grade PARFAIT. **BILLETS VOLANTS** (`flyCash`, CSS `.bill`) : des `$` DOM volent de la position monde (projetée caméra) vers le compteur `elMoney` — branchés sur verdict d'atterrissage, tirelire, portail. **VISEUR GRADÉ** : `landMark` se colore selon l'impact PRÉDIT (`tmp3·Nn` dans l'intégration du viseur) — or <4.5 (pulse), blanc, rouge ≥10 ; même unité que le verdict.
- **Symétrie des faces — MIROIR STRICT (zéro dessus-dessous)** : pièces/nitros, pouvoirs, flaques et groupes de plots existent SUR LES DEUX FACES aux mêmes positions (`for(const face of [1,-1])`), intervalles DOUBLÉS → densité et économie PAR FACE identiques à l'ancienne alternance. Dos d'âne : mesh jumeau dessous + physique `hopY` sur les deux faces (F.n est déjà retournée quand `side<0`, le check `side>0` a sauté). Ligne centrale sodium sur les deux faces. Les deux faces de la dalle sont à pleine lumière (`dim=1`). Chaque obstacle porte `face` — les collisions testent `face===side`.
- **Fin de partie (niveau 6+)** : OVERDRIVE `late=1+min(.5,(level-5)*.08)` sur `maxSp`/`accel` (+8 %/niveau, plafond +50 %) ; 2e vague de plots + UNE ÉPAVE entre chaque palier de pads (`WRECKS`, `mkWreck`, matériaux/géométries partagés jamais disposés) — flux aléatoire DÉRIVÉ (`seed^0xCA55E77E`) : la densité dépend du niveau sans rebrasser la génération. Percuter une épave : −50 % de vitesse, gros feedback ; au-delà de 330 km/h : `explode()`.
- **Mode SURVIVANT v3 — la POURSUITE À ARMES ÉGALES** (`SURV`, `survStart/survTick/survRender/botBoom`, `#survHud`/`#lastAlert`, bouton `#survBtn`) : 7 voitures de POLICE incarnées sur la piste (`mkPolice`, 3 livrées, géométries/matériaux partagés + roues d'épave réutilisées). Classement = DISTANCE (`SURV.pBase+s` pour le joueur ; au portail `SURV.pBase+=s` → les écarts traversent les zones, téléportation invisible). **ZÉRO TRICHE — même moteur que le joueur** : chaque bot intègre les équations EXACTES du joueur (accél/traînée/MOMENTUM `b.momT`, pente `GRAV·T[bi].y`, nitro-RESSOURCE `b.nitroR` regen .2/s + poussée 30/s, volant complet `phi/steer/sHold` avec plafond `TURN_HS` et rétroaction de courbure comme `psi`, avance `v·cos(phi)·SPD`) et subit les MÊMES obstacles : plots (qu'il fait VALSER via `FLYCONES` — visible devant toi), épaves (−50 %, MUR >330 km/h → `botBoom`, `w9.hit` reste posé pour le joueur), flaques (`b.slipT`), pads turbo (`b.padB`). Plus d'élastique, plus d'aspiration, plus de garde-fou, plus de rush artificiel, plus de bonus de vitesse. **Le CERVEAU fait la différence** (`SURV_PILOTS` : agro/err/rea/line) : tick de décision à RETARD HUMAIN (`rea` 100-300 ms — toutes les décisions tombent au tick, entre deux il roule sur les précédentes), perception BORNÉE (75 m devant, 25 m derrière, écarts estimés ±10 %, obstacles vus seulement devant), POINT DE CORDE par waypoints (3 échantillons de courbure sur la vraie distance de freinage, `vSafe` résout κ·v·SPD = plafond de braquage, marge `b.marg` bruitée à chaque tick), ligne de corde selon `line`, fautes VISIBLES (`errK` : 0 = coup de frein injustifié, 1 = embardée sinusoïdale, 2 = corde ratée → part large), DÉBOÎTEMENT (<14 m) / DÉFENSE (<9 m) au tick. SORTIE DE ROUTE = même sanction : décollage (vy 6), retombée hors piste = `botBoom` — le vide ne pardonne à personne. **VOL des bots** : état aérien complet (`air/airH/vy/spin/spinV`, gravité 26, gerbe `sparkGold` à la retombée, vrille `rotateZ`, cap réel `rotateY(b.phi)` — on VOIT les braquages) — décollage UNIQUEMENT sur les ZONES DE SAUT du joueur (`SURV.jumpZones`, gravées à chaque passage drive→fall, osées selon `appJump` à <8 m via `zoneMark`) : s'il n'y a pas de tremplin prouvé, personne ne s'envole. **NITRO VISIBLE** : sprite réacteur `jet` + braises `flameCore` (LOD <130 m) — la flamme suit la VRAIE combustion (`b.boostT`=flag), allumée au tick sur du droit dégagé selon `appBoost`. **DRIVATAR** (`AIP`) : profil persistant `SAVE.d.ai` (air/boost/caution/skill/aggr/airDur/runs, désinfecté dans `san()`) — `AIP.tick(dt)` observe CHAQUE frame (même hors Survivant), `resetRun()` dans `resetGame`, `commit()` dans `endGame` (adoption totale 1re run, EMA .35 ensuite) ; `survStart` biaise le CERVEAU seulement : `line×(.72+skill×.3)`, `marg` (caution), appJump, appBoost. LOD : sim complète permanente (~7 bots, coût négligeable), mesh+gyros seulement à |Δs|<340, halo sprites additifs qui s'éteignent au loin, POOL de 2 PointLights (les 2 plus proches <170 m éclairent vraiment route+caisse — jamais de recompilation shader, lights toujours en scène), sirène UNIQUE en WAIL doux (`sirenInit` : sine + LFO glissando ±115 Hz à 0.27 Hz + vibrato 5.3 Hz, lowpass 880, volume ≤.032 dosé sur la poursuivante la plus proche DERRIÈRE — plus jamais de deux-tons `setValueAtTime`). Rampes : matériaux on/off swappés par phase (`SURV.ph`), chaque unité bat sur SA phase. Minimap : points rouge/bleu temps réel dans `drawMinimap`. Minuteur PIXEL-ART : canvas 20×20 upscalé `image-rendering:pixelated` (`svClockDraw`, anneau qui se vide vert→orange→rouge, aiguille fluide, secondes dessous), dessiné chaque frame. DERNIER = CONDAMNÉ : `SURV.last` → `#lastAlert` clignote (« EXPLOSION DANS : 00:XX ») + `carLight` rouge 18 Hz ; au couperet → flash + gerbes + `explode()`. Bot dernier → `botBoom` (gerbe or+bleu + champignon + son si <220 m), les survivants gagnent en TÉMÉRITÉ (agro/appBoost/marg — jamais en vitesse). Tous morts = CHAMPION (jauge offerte). `endGame` coupe sirène/lumières/alerte et fige le classement. `survStart()` APRÈS `newTrack()` dans `resetGame` (sinon meute sur position périmée).
- **Pouvoirs** (`PWR_DEFS`, `mkPower`, `pwrNitroT/pwrAirT/pwrSpdT`) : orbes rares sur la piste (spawn dans `spawnPickups`, ~1 tous les 430-810 m). `n` = NITRO INFINIE 6 s (jauge pleine, zéro drain), `a` = AIRTIME INFINI 10 s (pas d'explosion à 6 s, camembert cyan, jauge neuve à l'expiration), `v` = SPEED UP +60 % 6 s (multiplie l'avance `s/lat` et le compteur, pas `vA`). Chaque orbe porte une ÉTIQUETTE flottante (sprite canvas : pictogramme 🔥/🪂/⚡ + nom, matériau partagé `d.icoM`, côté joueur même sous la route) — on sait ce qu'on vise avant de le prendre. Ramassage : `showMsg` coloré + `trickMsg` doré. Compte à rebours emoji dans `#pwrChip`, reset dans `resetGame`.
- **Sensation de vitesse — RELATIVE à la caisse (`vmaxShow()`)** : vibration caméra dès ~45 % de la vmax de LA caisse (`spdN` relatif, `CAM_SHAKE_V=.78`) MAIS **plané supersonique** : `calm9` fond les vibrations à 30 % passé 350-900 km/h affichés (l'endgame FEND l'air, il ne tremble plus) ; speed lines dès ~55 % vmax (`drawSpeedLines`) ; FOV mixte (part relative ×17° + part absolue ×.030) — même LA HONTE à fond a sa sensation. Sifflement d'air (`whF/whG`, >280 km/h), compteur qui gonfle/rougit — **compteur VERT GTA V** (dégradé menthe→vert billet, `.dz` vert éteint).
- **MUSIQUE — synthwave procédurale** (`MUS`, `musInit/musTick/musStep/musVoice/musKick/musHat`, appelée en fin d'`initAudio`) : le jeu n'avait AUCUNE musique (c'était le chantier n°1). Zéro fichier, tout est calculé — boucle mineure de 4 accords (Am · F · C · G, `MUS_CH`/`MUS_ROOT`), basse à croches **side-chainée sur un kick FANTÔME** (on ne l'entend presque pas, on entend ce qu'il ÉCRASE : c'est ce mouvement qui fait respirer le morceau), nappe tenue, arpège qui se lève avec la vitesse, charley en croisière, lead réservé à la gloire (nitro/vol/braquage). **Ordonnancement à REGARD D'AVANCE** (~280 ms, `setInterval` 60 ms) : aucune note n'est posée depuis la boucle de rendu, donc une frame qui tousse ne fait pas bégayer la mesure ; garde anti-rattrapage quand l'onglet a dormi. L'INTENSITÉ (`MUS.i`, lissée) écoute la partie : menu = nappe seule · roulage = groove · vol/nitro/fever = filtre grand ouvert. Bus dédié → `MASTER`, volume max ~.12, interrupteur MUSIQUE séparé du SON (`SAVE.d.mus`). Hook : `dbgSnd()`.
- **Audio** : tout en WebAudio procédural sauf les voix (HTMLAudio). `initAudio()` exige un geste utilisateur. Tout passe par le bus `MASTER` (compresseur + limiteur tanh) — ne JAMAIS reconnecter à `AC.destination`. `duckT=…` creuse brièvement le mix (gros événements). Boutons `#sndBtn` (SON : `AC.suspend()/resume()`) et `#voxBtn` (VOIX : gate dans `annSpeak`), persistés `rrSfx5`/`rrVox5`. **Moteur v2** (`ENGINES`) : un timbre par caisse (onde harmonique + sub + souffle → saturation → filtre), fréquence = explosion (`i`+`engRpm`×`r`), boîte virtuelle (`gr` rapports, thump au passage), RONRON au ralenti (`lope`, LFO 8-15 Hz), crépitements au lâcher (`crk`, fn `crackle`), sifflement onduleur/turbine (`whine`) pour les 3 caisses du haut. Changer une caisse de son = éditer sa ligne `ENGINES`, zéro code. Crissement = stick-slip (2 bandes + LFO `skLfo`, zone morte |psi|>.32). Nitro façon fusée RL : le CORPS = rumble de bruit BROWN (`brownBuf`, boucle sans couture) sous double lowpass (`jrF`) + flutter 5 Hz (`jrDep`) — rond et chaud, dominant EN L'AIR. Pétillement = pops BRUNS (`flamePop`, ~25/s au sol) + POK (plop+subBoom) — des pops blancs trop denses fusionnent en tapis de souffle. Zéro couche de bruit blanc continue pendant la nitro : ça chuinte. Les médiums saturés (`jetDist`/`jcFb`) sont au repos, gardés pour usage ponctuel.
- **MOBILE / TACTILE — LA VERSION TÉLÉPHONE** (bloc `if(IS_MOBILE)` en fin de fichier + CSS `body.touch`) : **PORTRAIT assumé** (le paysage est refusé : `#rotate` s'affiche et la partie se gèle), **DEUX POUCES**, gaz AUTOMATIQUE (`AUTO_GAS`), **aucun bouton de frein** (verdict user : le pouce droit ne sert qu'à la NITRO). Tout est scopé sous `body.touch`/`body.play`/`body.tpad` — **le desktop ne bouge pas d'un pixel**, et aucune physique n'est réécrite (le tactile pilote le MÊME objet `keys` et le MÊME `steer`). **VOLANT ANALOGIQUE 2 AXES** (`TCTL`, `#tSteer`/`#tStick`/`#tKnob`) : la moitié gauche est le volant, le stick NAÎT sous le pouce, **stick FLOTTANT sur les deux axes** (passé la butée la base suit le doigt → revenir au centre rend la main INSTANTANÉMENT). `TCTL.st` = braquage (X, course 54 px, zone morte 6 %, courbe `|n|^1.15`) — un seul point d'entrée : `const target=TCTL.act?TCTL.st:(lf?1:0)-(rt?1:0)`. `TCTL.sv` = **ASSIETTE EN VOL** (Y, course 44 px depuis le 28/09 « augmente la sensibilité » — 66 avant, zone morte 10 %, courbe 1,15 ; le DRIFT lit les pixels `TCTL.dy` > 34,9) : **manche d'avion** — pouce vers le HAUT = **PIQUÉ** (`piq` : rotation −1.45 rad/s + `fallVel.y−=`, le plongeon ACCÉLÈRE), pouce vers le BAS = **CABRER/DÉCOLLAGE** (`cab` : même levier que l'ancien ↓ clavier, +1.35 rad/s et portance). Les deux vivent dans le bloc `if(nitroOn)` du mode 'fall' : **sans nitro, pas d'assiette** (le clavier desktop est inchangé : ↑ portance, ↓ cabrer). Pouce DROIT : NITRO énorme (double-tap = BRAQUAGE). Deuxième schéma **PAD** (flèches) au bouton 🕹, persisté `SAVE.d.tctl`. **CIEL NU** (`NO_CLOUDS=IS_MOBILE`) : `VOL_OK` passe à false (la texture 3D 64³ n'est même pas bakée) et `buildClouds` sort **après avoir consommé son `rr()`** (sinon toute la piste en aval se décale) — plus aucun nuage, ni volume ni sprite ; le ciel, le fog et les biomes restent. **CADRAGE PORTRAIT** (`fovFit()` → `FOV_K` et `POR`, recalculés à chaque resize/rotation) : le `fov` de three est VERTICAL, donc sur un écran haut le champ horizontal s'effondre → `FOV_K` (≤1.30) rouvre l'angle, et `POR` (0 paysage → 1 portrait) recadre la caméra. Réglage final (user, deux passes : « plus proche, qu'elle occupe plus de place ») : `camBack ×0.70` (on COLLE à la caisse — elle déborde volontairement un peu en bas de cadre), `camH ×1.72` (vue plongeante — c'est elle qui fait tenir la caisse ENTIÈRE dans le cadre au lieu de la laisser sortir par le bas) et visée abaissée (`F.n 1.05−0.55`) pour la faire remonter au-dessus de la jauge. Ces trois valeurs se règlent ENSEMBLE : reculer rapetisse, monter redresse, viser bas remonte. **ÉCRAN NU** (verdict user 2026-08-24) : sur mobile TOUT le HUD est masqué — argent, minimap, compteur km/h, barre de style violette, `#msg`, `.trick`, chaîne, mallette, carte de caisse, HUD survivant, alerte dernier, billets volants, scanlines. Il ne reste que **la jauge de nitro** (remontée tout en HAUT de l'écran : en bas elle barrait la caisse en travers) et **UN bouton ⚙** en haut à droite. Rien n'est supprimé du code (les éléments sont écrits comme avant, juste `display:none` sous `body.touch`) : rallumer une ligne = retirer son sélecteur du bloc ÉCRAN NU. `drawMinimap()` est sauté sur mobile (plus de repeinte de canvas pour un élément invisible). Le camembert d'airtime `#airPie` est un rescapé : sans lui on explose en vol sans prévenir. **LE DÉBLOCAGE EST LE SEUL TEXTE QUI PARLE** (verdict user 2026-08-25 : « enlève les textes de présentation des voitures et les blagues ») : `#carCard` est ressorti de la purge mais DÉPOUILLÉ — `.ccSpd` (fiche technique) et `.ccDesc` (la punchline de la caisse) masqués, plus de fond de carte, il ne reste que le bandeau 🔑 sur une ligne et le **NOM en 34 px** qui DÉBOULE à l'écran (`@keyframes ccPunch` : entrée en scale 2.4 floutée → rebond). C'est un trophée, pas une notice. Les punchlines de fin de run (`END_LINES`/`END_TOP` dans `#tagline`) sont masquées en mode `dead` — à la mort on lit un montant, pas une vanne ; la baseline du menu, elle, reste. Les autres viviers de flavour (`GO_LINES`, `ZONE_LINES`, `RAIN_LINES` — « LA BANQUE A APPELÉ : ELLE ABANDONNE », `CRASH_LINES`, échelle) passent tous par `showMsg`/`trickMsg`, donc déjà muets sur mobile. Rien n'est retiré du DESKTOP. **LA COQUE MOBILE — écrans à la façon des jeux mobiles** (`#mob`, `.mscr`, routeur `mGo`/`mFill`/`mTap` dans le bloc IS_MOBILE) : l'ancien menu desktop est masqué EN BLOC (`body.touch #overlay>*{display:none!important}` — `endGame` repose des `display:block` en inline, d'où le `!important`) et cinq écrans le remplacent : **ACCUEIL** (titre, meilleur score, gros JOUER, rangée d'icônes), **MORT** (verdict, montant qui S'ÉGRÈNE en 750 ms via `mCount`, caisse atteinte, 3 stats, meilleur, saisie de record ré-adoptée dans l'écran, REJOUER, icônes — **le classement TOP 10 a disparu, il ne servait à rien sur téléphone**), **GARAGE** (les 24 caisses en grille, débloquées d'après `max(level, SAVE.d.bestCar)`, verrouillées en `? ? ?`, barre de progression vers la prochaine + montant restant), **MODES** (cartes SURVIVANT et BAC À SABLE, avec leur description), **RÉGLAGES** (son · musique · voix · commandes · image · copier/restaurer · effacer). Le retour d'un sous-écran revient sur l'écran RACINE du moment (`mRoot()` : mort si on vient de mourir, accueil sinon). ⚠ L'overlay lançait la partie AU MOINDRE CLIC : un bloqueur en phase de CAPTURE neutralise tout clic parasite (la saisie de record garde le sien). **BAC À SABLE** (`SANDBOX`, persisté `SAVE.d.sand`) : `endGame()` est intercepté en tête et renvoie vers `sandRevive()` — la caisse se replace, la run continue, aucun score n'est enregistré ; le QUITTER du panneau contourne l'interception le temps d'un appel. **DA PIXEL — la charte `.pbtn`** : le titre du jeu est du pixel 3D doré, tout le reste s'y est aligné. Zéro coin arrondi, zéro verre dépoli : chaque bouton est une PLAQUE D'ARCADE (biseau clair en haut-gauche, ombre dure en bas-droite, **épaisseur** en `drop-shadow` qui disparaît à l'appui — le doigt ENFONCE la touche), coins coupés en octogone par `clip-path` (le « rond » du pixel art). Quatre variantes : `pb-gold` (action principale) · `pb-cyan` · `pb-green` · `pb-red`, plus `.ico` (pictogramme + étiquette). Le bouton NITRO, le ⏸, le panneau de pause, la saisie de record et la jauge suivent tous cette charte. **UN SEUL BOUTON** (`#tSet`/`#tGear`/`#tPanel`) : ⏸ manette en main, ⚙ au menu — il remplace TOUS les boutons du jeu (son, voix, reset, survivant, sauvegarde). **Ouvrir MET EN PAUSE**, fermer reprend (on ne fouille pas les options à 1400 km/h). Panneau à SECTIONS contextuelles (`data-g="run"|"menu"`, arbitrées par `panSync()`) : *PAUSE* → REPRENDRE · *RÉGLAGES* → SON · VOIX · COMMANDES (volant⇄flèches) · **IMAGE** · SURVIVANT · *LA PARTIE* (en jeu) → REPLACER · RECOMMENCER · *SAUVEGARDE* (au menu) → COPIER/RESTAURER le code. **RÉSOLUTION D'IMAGE À LA CARTE** (`applyQ`, `SAVE.d.q`) : `setPixelRatio` ne touche QUE le canvas 3D — le HUD est du DOM, il reste net au pixel quoi qu'il arrive. On enlève donc les pixels là où ils coûtent (raymarch, bloom, ombres) sans jamais flouter une jauge. Mobile : **0.66 par défaut (« RAPIDE »)**, ~4× moins de pixels qu'un rendu Retina ; « NETTE » remonte à 1.15 ; plancher de l'adaptatif `DPR_MIN` .42 sur téléphone. **ÉCRANS COHÉRENTS** : le menu, l'écran de mort et le panneau partagent UN vocabulaire — même fond, mêmes cartes arrondies à liseré cyan, même pilule dorée pour l'action principale, titres de section en petit violet (`.tpH`). L'écran de MORT (`body.dead`, posée par le tick) réordonne tout en flex `order` : le logo s'efface, **GAME OVER** passe en tête, le **montant devient le héros** (le 🏆 RECORD se pose dessous en petit via `#finalScore .rec`), puis punchline, caisse, stats, saisie du nom, TOP 10, et **REJOUER** ferme la marche. `#saveRow`/`#ctrlRow` sont masqués (leur contenu vit dans le panneau : UN seul endroit pour les réglages). `env(safe-area-inset-*)` partout ; menu compacté sous `max-width:560px` et `max-height:560px`. **SYNCHRO PARESSEUSE 8 Hz** (`setInterval` 140 ms) : classe `play` (les commandes n'existent que manette en main), astuce de vol dite UNE fois, gel si le téléphone est couché. **IMMERSION** (`goImmersive`, sur geste uniquement) : plein écran + `screen.orientation.lock('portrait')` + Wake Lock, rejoués au retour d'appli ; manifest en `"orientation":"portrait"`. **HAPTIQUE** (`hap(p)`) : crash, PARFAIT/DIVIN, braquage, caisse débloquée — suit l'interrupteur SON. **PIÈGES iOS traités** : `volume` en lecture seule sur HTMLAudio (`VOL_LOCKED` → l'annonceur ne joue QUE la voix principale) ; `AC.resume()` rejoué à chaque `touchend` ; `orientationchange` recadre après 280 ms. Gestes parasites tués (zoom pincé, double-tap, long-appui, pull-to-refresh) SAUF le défilement de `#overlay`. **PERF** : `PCFShadowMap`, `backdrop-filter` désactivé sous `body.touch`, + DPR cap 1.25 / MSAA off / bloom .42. Hook console : **`dbgTouch()`** (on/pad/act/st/sv/play/steer).
- **MOBILE — CE QUI A CHANGÉ À LA FUSION** (le paragraphe MOBILE ci-dessus reste vrai pour tout le
  reste : portrait assumé, deux pouces, gaz auto, volant flottant deux axes, écran nu, charte `.pbtn`,
  panneau ⚙ qui met en pause, immersion, haptique, pièges iOS) :
  · **plus d'écran GARAGE en grille** — le bouton 🏎 ouvre le VRAI atelier 3D (`openGarage()`), avec ses
    commandes grossies au pouce et le **pincement** en guise de molette. ⚠ le `preventDefault` global sur
    `touchmove` ANNULE la séquence `pointer*` : il y a une sortie `if(garageOn)return`, sans elle le
    glissé qui fait tourner l'atelier était tué net (`touch-action:none` suffit à bloquer le scroll).
  · **MODES a trois cartes** : Survivant · Parc freestyle · Bac à sable.
  · **RÉGLAGES a LANGUE** (FR/EN), et les interrupteurs (son, voix, musique, Survivant, Parc) passent par
    **`.click()` sur les boutons du menu desktop** au lieu de refaire leur logique : ils ont des effets de
    bord (suspend du contexte audio, exclusion mutuelle police/parc, reconstruction de la scène de menu),
    les dupliquer ferait deux vérités qui divergent. ⚠ le bloqueur de clics en phase de CAPTURE doit donc
    laisser passer `#saveRow` (sinon ces `.click()` n'atteignent jamais leur bouton, et le mode s'affiche
    ON dans la coque en restant OFF dans le jeu).
  · **l'écran de MORT montre le MOTEUR atteint**, pas une caisse gagnée (les caisses ne se gagnent plus
    à l'argent). L'accueil affiche la caisse équipée.
  · **la police pixel n'a pas de capitales accentuées** : tout libellé en `var(--pix)` s'écrit SANS accent
    (« REGLAGES », « FLECHES ») — sinon on lit « RéGLAGES ». Les descriptions en police système gardent
    les leurs. Et **jamais de `data-fr=""` vide** : `applyLangDOM` écrit `TR(dataset.fr)`, une chaîne vide
    donne une chaîne vide — l'attribut ne se pose que s'il porte déjà le texte français.
  · **les nuages restent allumés** sur téléphone (le maillage a remplacé le raymarch).
- **Persistance** (`SAVE`) : UNE clé localStorage versionnée `cashcarSave` (`{v:2, best, leaders, bestCar, sfx, vox, tctl}`). Toute la persistance passe par `SAVE.d` + `SAVE.flush()` (écriture immédiate) ou `SAVE.mark()` (filet auto-save 30 s) — ne JAMAIS écrire localStorage en direct. `san()` désinfecte tout ce qui entre (storage rongé, code importé) : la forme est garantie. Migration douce : les anciennes clés `rrBest5`/`rrLeaders5`/`rrBestCar5`/`rrSfx5`/`rrVox5` sont lues UNE fois si `cashcarSave` absent, jamais réécrites (retour arrière possible). Export/import par code base64 (`SAVE.export()`/`SAVE.import()`) — boutons `#saveExp`/`#saveImp` sur l'overlay (copie presse-papier avec repli `prompt`, restauration + reload). Flush aux moments clés : fin de run (`endGame`), record leaderboard, meilleure caisse, mutes. Migrations futures : une marche par version dans `SAVE.load()`.

## Conventions
- Style compact existant (pas de point-virgule manquant, minification manuelle légère) : s'y conformer.
- Commentaires en FRANÇAIS, avec la voix du projet (imagés, précis).
- Perf d'abord : pools de particules réutilisés (`makePool`/`spawnP`), pas d'allocation dans la boucle (réutiliser tmp/tmp2/tmp3/cldV1…), sprites plutôt que géométrie lourde.
- Tout nouvel élément visuel doit être disposé proprement au rebuild (`trackMeshes` ou équivalent de `disposeClouds`).
- Ne jamais casser la boucle : le try/catch de `loop()` masque les erreurs (voir console).

## Pièges connus
- `tmp3` & co sont partagés : toujours `set`/`copy` avant usage.
- Les positions des sprites de nuage sont LOCALES à leur groupe (monde = `g.position + sp.position`).
- `checkUpgrade()` doit être appelé après CHAQUE gain d'argent.
- `annSpeak(key,prio,forced)` : `forced=true` uniquement pour rejouer la file d'attente (bypass du 1/3).

## Idées de suite (backlog)
- Boucliers/malus dans les nuages sur route (risque/récompense de la percée à l'aveugle).
- Mode contre-la-montre par zone + fantôme du record.
- Voix supplémentaires (bump.mp3, fever.mp3) — suivre le pattern ANN_LIB + règle du 1/3.
- Gamepad (API Gamepad), tactile mobile.
- Réglage qualité auto (compter les ms/frame, réduire nuages/particules si <50 fps).
