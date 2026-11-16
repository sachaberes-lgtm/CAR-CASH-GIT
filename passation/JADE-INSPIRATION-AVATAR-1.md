# JADE — INSPIRATION AVATAR 1 (2026-11-16) — passation en MODE INSPIRATION

Demande de Sacha : « fais des maquettes de proposition de nouveaux modules pour la map Jade ; je ferai refaire plus tard la génération de map sur cette map,
je veux des inspis. Le but est de travailler l'interaction entre la route et les montagnes volantes pour créer une map unique à chaque fois. Inspiration
Avatar. Tu peux créer de nouveaux modules. Route et montagnes allégées pour créer des cartes postales de ce que la map pourrait être. »
Puis, après avoir vu les onze cartes : « pont de lianes est cool, gouffre percé, fleuve qui tombe, gué du ciel, galerie, la ceinture, pierres qui passent
sont cool ; les autres enlève. »

## Ce que veut dire « mode inspiration »

Ce document et la page de maquettes sont des **images et des intentions**, pas un cahier des charges. Les maquettes ignorent la vraie physique, la vitesse
réelle, le juge et la charte. La session qui refera la génération de Jade doit **garder l'idée de chaque module** (la relation entre la route et la montagne,
l'image de carte postale, ce qui change d'une graine à l'autre) et la **traduire** dans le système de scènes du jeu, en réglant les chiffres sur le juge.
On peut fusionner deux idées, en simplifier une, changer les proportions : pas de copie au mètre près.

⚠ **Jade est validée et publiée** (LA DESCENTE ALLÉLUIA, v1572, « on ne touche plus »). Toute nouvelle génération se fait derrière un drapeau d'URL
(comme `?sans=jadev3` pour l'ancienne) jusqu'à ce que Sacha la joue et la valide.

## Où voir les maquettes

- **La page** : https://claude.ai/artifact/WsAUgoBciwHzQD62Y8rMEA (privée : Sacha doit la partager pour qu'un autre compte l'ouvre), et le fichier
  `C:\Users\sacha\OneDrive\Desktop\CAR CASH\passation\jade-inspiration-avatar-1.html` (pas commité : il n'existe que dans ce dossier, pas sur origin/main).
- **L'ouvrir en local** : config `maquettes-jade` de `.claude/launch.json` (`npx http-server passation -p 3130 -c-1`), puis
  `http://localhost:3130/jade-inspiration-avatar-1.html`. Une seule page three.js r128, aucun son.
- **Dedans** : une carte par module (AUTRE GRAINE = même module, autre graine), un clic ouvre la visionneuse (tourner autour, ou AU VOLANT à 180 km/h),
  lumière matin/soir/nuit, « une vallée au hasard » (5 modules enchaînés), le kit allégé.
- **Crochets** : `dbgJadeMaquette.monde('gouffre', 7)` rend `{S (échantillons de route), stats, ctx.iles…}` ; `dbgJadeMaquette.ouvrir('pont', 3)` ;
  `dbgJadeMaquette.mode('volant')` ; `window.dbgHeurts` liste les modules où la route traverse une montagne (vide pour les 7 cartes par défaut).
- Toutes les maquettes sont construites dans `MODS` (une fonction `build(R)` par module : points de route + îles + décor), c'est la meilleure description
  chiffrée de chaque idée.

## L'idée qui tient tout : un VERBE par module

Chaque module dit **ce que la route fait à la montagne**. Une vallée unique = une suite de verbes différents :

| Verbe | La route… | Modules retenus |
|---|---|---|
| POSÉE | se pose sur la roche, la montagne la porte | LE FLEUVE QUI TOMBE, LE GUÉ DU CIEL |
| SUSPENDUE | pend sous une île, tenue par des lianes | LE PONT DE LIANES |
| PERCÉE | traverse la montagne par un trou | LE GOUFFRE PERCÉ |
| TAILLÉE | est creusée dans le flanc | LA GALERIE |
| ENROULÉE | tourne autour de ce qui flotte | LA CEINTURE |
| VIVANTE | passe sous des montagnes qui bougent | LES PIERRES QUI PASSENT |

Aujourd'hui Jade sait surtout FRÔLER (les pics au bord, le rase-route) et TOURNER AUTOUR (spirale, colimaçon, puits). Ces verbes-là sont neufs.

## Les sept modules retenus

Mesures relevées sur une graine de la maquette, à 180 km/h (50 m/s, pas la vraie vitesse du palier) : durée · dénivelé · pente maximale sur 12 m.

### 1. LE PONT DE LIANES — SUSPENDUE (≈ 17 s · −219 m · 43°)
- **L'image** : la route quitte le sommet d'un pic, file vers le pic suivant en se creusant au milieu, pendue par des lianes à une grande île qui flotte
  au-dessus. On plonge dans le creux, on écrase les amortisseurs, on remonte se poser sur l'autre pic, et on repart dans le vide.
- **La maquette** : pic A (r 30) et pic B (r 34) à 210-300 m l'un de l'autre, B 30-55 m plus bas ; le pont se creuse de 16-30 m au milieu, se balance
  de côté (6-16 m) ; l'île C (r 56, étirée) 175-215 m au-dessus, des lianes tous les 15 m de chaque bord de la dalle jusqu'au dessous de C.
- **Change à chaque graine** : l'écart, le creux, le sens du balancement, la hauteur de l'île qui tient le pont.
- **Pour le jeu** : la dalle posée sur le sommet de deux pics (décor posé pour la scène) ; les lianes sont des tubes fins (sur téléphone, en garder peu, ou
  des lignes) ; le creux est une compression puis une remontée qui peut servir de tremplin. Ne pas confondre avec LE PONT DU CIEL actuel (`jadePont`,
  piliers et arche) : ici rien ne porte le pont par dessous.

### 2. LE GOUFFRE PERCÉ — PERCÉE (≈ 12 s · −226 m · 57°)
- **L'image** : un atoll de pics flotte en couronne. La route passe au-dessus du rebord, plonge dans le trou du milieu à côté d'une cascade qui tombe
  dedans, et ressort sous la couronne, entre les racines qui pendent.
- **La maquette** : 9 ou 10 pics (r 24) en cercle de 60 m de rayon, trou d'environ 30 m ; trois grands piliers dépassent de la couronne ; les pics côté
  sortie ont des pointes courtes (sinon la route les traverse en sortant), les autres pendent de 70 à 150 m ; la plongée fait 50-57°.
- **Change à chaque graine** : le nombre de pics, la longueur des racines, la place des grands piliers, le côté de sortie.
- **Pour le jeu** : c'est le moment « passer dessous » de la vallée. Le trou doit être une zone où rien ne se pose au hasard (comme `JADE.zc3`). La pente
  du grand plongeon d'Alléluia (50-56°) est déjà acceptée : on peut reprendre sa crête arrondie.

### 3. LE FLEUVE QUI TOMBE — POSÉE (≈ 17 s · −244 m · 58°)
- **L'image** : la route se pose sur un grand plateau, longe une rivière entre les pins, puis tombe du bord avec elle. On pique à côté de la cascade,
  qui se perd dans la mer de nuages.
- **La maquette** : plateau plat de 320 × 220 m (r 110, étiré), rivière de 12 m à 14 m de la route avec de petits méandres, cascade de 700 m au bord,
  la route plonge à ~55° puis s'écarte de la chute.
- **Change à chaque graine** : la longueur du plateau, la rive où roule la route, les méandres, les pics autour.
- **Pour le jeu** : un vrai moment À PLAT (la charte en veut : R13 « il faut que ça soit plat des fois »), un climax de carte postale. La rivière est un
  ruban d'eau peint (pas de physique de l'eau : la mer a été retirée de Jade exprès). Bon endroit pour un raccourci : sauter du bord au lieu de suivre
  la plongée.

### 4. LE GUÉ DU CIEL — POSÉE (≈ 15 s · −267 m · 28-36°)
- **L'image** : une file d'îlots descend comme un escalier ; la route se pose sur chacun (palier, pente, palier). Entre deux îlots elle ne tient sur rien.
- **La maquette** : 5 à 7 îlots (r 13-16, dessus plat) espacés de 58-72 m, marches de 22-34 m, la file courbée de 22-47 m ; un petit palier de 12 m
  sur chaque îlot.
- **Change à chaque graine** : le nombre d'îlots, la hauteur des marches, l'écart, la courbe.
- **Pour le jeu** : chaque palier est un appel de saut (sauter une ou deux marches = petit raccourci). Les îlots sont la sorte « petite » des îles
  actuelles, posées sous la dalle (la règle d'or doit les autoriser : ici la roche touche la route exprès).

### 5. LA GALERIE — TAILLÉE (≈ 16 s · −275 m · 30°)
- **L'image** : la route est creusée dans le flanc d'un pic géant : un toit de roche au-dessus, des colonnes côté vide. Elle fait le demi-tour du pic en
  descendant, une fenêtre sur le vide entre chaque colonne.
- **La maquette** : pic de r 112, route à 128 m de l'axe sur ~220° de tour, toit (blocs de 30 m de profondeur, 6-9 m d'épais) 9,5 m au-dessus de la
  dalle, une colonne tous les ~18 m.
- **Change à chaque graine** : le sens du tour, la hauteur du toit, l'écart des colonnes, la montagne.
- **Pour le jeu** : proche de la spirale autour d'une tour, mais la route est DANS la roche. Le toit et les colonnes sont des blocs simples (le kit), pas
  de creusement réel. Attention à la caméra sous le toit et au saut (le toit au-dessus interdit de sauter : la galerie est une zone sans saut, ou le
  toit s'ouvre par endroits).

### 6. LA CEINTURE — ENROULÉE (≈ 22 s · −241 m · 19°)
- **L'image** : un anneau d'îlots flotte, penché, autour d'un pic géant. La route fait le tour du pic en descendant et passe un îlot dehors, un îlot
  dedans : un slalom en cercle.
- **La maquette** : pic r 56 haut de 750 m, anneau de 8 îlots (r 11-14) à 150 m de l'axe, penché de 8-18° ; la route ondule de ±28 m autour de
  l'anneau sur ~250° de tour.
- **Change à chaque graine** : l'inclinaison de l'anneau, le sens du tour, le pic, les îlots renversés.
- **Pour le jeu** : trop longue et trop plate dans la maquette ; le vrai module peut faire un demi-tour seulement et descendre plus. Le slalom à 50 m
  de rayon est serré à grande vitesse : élargir l'anneau ou espacer les îlots aux paliers rapides.

### 7. LES PIERRES QUI PASSENT — VIVANTE (≈ 18 s · −234 m · 18°)
- **L'image** : une descente en S sous des rochers qui dérivent lentement en travers de la route. Ils ne la touchent jamais ; leur passage au-dessus
  de la tête donne le rythme.
- **La maquette** : 6 à 8 rochers (r 13-29, un sur trois à l'envers) à 22-50 m au-dessus de la route, qui glissent à 3-6,5 m/s en travers et tournent
  lentement (ouvrir la carte pour les voir bouger).
- **Change à chaque graine** : le nombre, la hauteur, la vitesse et le sens des rochers.
- **Pour le jeu** : le seul module où le décor bouge. Rochers SANS collision et hors de la surface de la physique, jamais sous la hauteur d'un saut à
  cet endroit (sinon un saut les traverse) ; leur ombre sur la route serait le plus beau. Peu coûteux si ce sont quelques îles déjà construites qu'on
  déplace.

## Refusés par Sacha (ne pas les reproposer)

LA LIANE-MÈRE (spirale autour d'une racine qui pend sous une île), LA FAILLE (la fente entre deux montagnes qui se frôlent), LE VENTRE (la route collée
sous une île, tête en bas), L'ÉTREINTE (trois piliers penchés qui se touchent au sommet, la route dessous).

## La vallée au hasard (proposition de règles, sur la page)

- 5 modules au palier 0, reliés par des balayages courts (3-5 s) qui tournent toujours.
- Entrée : le gué, le pont ou les pierres. LE GOUFFRE PERCÉ en 2e ou 4e. Un climax au milieu : le fleuve, la ceinture ou la galerie.
- Jamais deux verbes pareils de suite.
- Exemple tiré : GUÉ (posée) → GOUFFRE (percée) → FLEUVE (posée) → GALERIE (taillée) → PIERRES (vivante).

## Ce que les maquettes ne respectent pas (à régler dans le jeu)

- **Trop longues** : 12 à 22 s par module à 180 km/h ; la route d'Alléluia dure ~56 s pour 5 modules au palier 0. Viser ~8-12 s par module, à la
  vitesse RÉELLE (le juge mesure vPalier × élan, pas 180 km/h).
- **Trop plates (R13)** : la charte veut, à chaque palier, l'envers sur CHAQUE route (6-25 %), ≥ 15 % de la route couchée à plus de 60°, ≥ 25 % à plus
  de 45°, jamais plus de 6 s à plat d'affilée, et à plat 35-55 % du temps. Les maquettes roulent à peine (0-9°). Pistes de roulis par module :
  la galerie couchée contre la paroi (45-70°, « rider sur les murs », comme LE MUR DU MASSIF) ; la ceinture inclinée à chaque îlot (±40°) ; le pont qui
  se balance (±20-25°) ; les pierres en S couché ; le fleuve reste le moment à plat. L'envers de chaque route doit venir d'ailleurs (les deux ENVERS
  d'Alléluia) : LE VENTRE, qui en faisait un, est refusé.
- **R1 / R2** : jamais plus de 10 s dans une direction, pas plus de 5 s de tout droit (la ceinture et la galerie tournent toujours, le pont et le gué sont
  droits : leur donner une courbe).
- **R3** : pas de torsade serrée (≤ 60 °/s) ; **R11** : aucun looping ; **R6** : deux raccourcis par route (le bord du plateau, les marches du gué, le
  creux du pont sont des candidats) ; **R10** : zéro roche sur la dalle (le gouffre et la galerie sont les plus risqués).
- **Téléphone** : ce qui retire de l'image (moins de lianes, de cascades, de rochers) se garde sur `ALLEGE` / `TEL_NATIF`, jamais sur `IS_MOBILE`.
- La charte complète (R1-R13) est sur la branche `supervision-routes-2026-11-13` : `git show 26bde59d:passation/CHARTE-ROUTES.md`.

## Où ça s'accroche dans le code (à vérifier sur origin/main)

- `code/maps/jade-alleluia.js` : `genJadeA`, la tortue (cap + pente + roulis écrit), les scènes (`JA_CLES`, `JA_FAM`, `scene()`), la boussole et le
  garde-fou (R1), le meilleur de N essais notés comme le juge. Les nouveaux modules s'y ajoutent comme des scènes.
- Les décors posés pour une scène : `JADE.deco3` / `jadeDeco3Pose` (jade-3.js), les îles et massifs `voxPilierG` (sortes 4-5), les pics renversés `q.inv`,
  les zones sans pose au hasard `JADE.zc3`, les temps forts `MODMARK`.
- `?jscene=` impose les premières scènes : pratique pour juger un module seul.
- Le main local de ce dossier est très en retard : travailler dans un worktree d'`origin/main` à jour, pousser à part (voir les règles de CLAUDE.md).

## Prompt prêt à coller dans une nouvelle session

> Refais la génération de route de la map Jade (Pics de Jade) en t'inspirant des maquettes « Inspiration Avatar 1 ». Lis d'abord
> `C:\Users\sacha\OneDrive\Desktop\CAR CASH\passation\JADE-INSPIRATION-AVATAR-1.md` (ce fichier n'existe que dans ce dossier, pas sur origin/main) et
> ouvre la page `C:\Users\sacha\OneDrive\Desktop\CAR CASH\passation\jade-inspiration-avatar-1.html` (config `maquettes-jade` de .claude/launch.json).
> Mode inspiration : garde l'idée de chacun des 7 modules retenus (pont de lianes, gouffre percé, fleuve qui tombe, gué du ciel, galerie, ceinture,
> pierres qui passent), traduis-les en scènes de `code/maps/jade-alleluia.js`, règle les chiffres sur le juge et la charte R1-R13. Jade actuelle est
> validée : tout derrière un drapeau d'URL jusqu'à ce que je la joue. Pas de looping, pas de torsade serrée, l'envers sur chaque route.
