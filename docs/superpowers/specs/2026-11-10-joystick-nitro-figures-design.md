# Figures : le bouton NITRO devient un joystick (2026-11-10)

Demande de Sacha : « retravaille le système de figure. Le bouton nitro doit être un joystick qui permet de faire les figures de la direction où tu le pousses, et le double-tap donne une figure aléatoire dans la liste de celles que tu as débloquées, tant que c'est adapté à la direction de la voiture. Fais ça bien, sans bug. » Puis : « retravaille un peu le design du pouce pendant que tu y es ».
Réponses au questionnaire : la figure part quand le pouce atteint une certaine distance, avec une vibration (pas au lâcher) ; « adapté à la direction » = au braquage et à la rotation.

## Existant (relevé)
- 3 emplacements équipés, un par direction : avant (0), arrière (1), côté (2). `figSlots()`, `figDirSlot()`, `FIG_DIR` dans `code/gameplay/figures-physique.js`.
- Double-tap NITRO : `veqDoigt` / `veqDouble` / `veqFigure` (`code/gameplay/vol-equilibre.js`). La figure dépend aujourd'hui du joystick GAUCHE au moment du tap.
- Mode « GLISSER » (Léo, `GLI`, `figGJoue`, `figGOpts`, `figGFig`) : glisser depuis NITRO puis lâcher. Il lance des figures FIXES (tail whip, salto), pas les figures équipées. Écouteurs dans `code/moteur/mobile-tactile.js` (`gliDn`, `gliMv`, `gliUp`). Réglage `SAVE.d.figG` ('tap' | 'glisse').
- HUD : `fhLegMaj` / `fhArme` (`code/interface/hud-figures.js`), rappel `#fhLeg`, flèche flottante `#figGl`.
- Au sol : figures de la route (`frLance`, `GSOL`).

## Comportement voulu

### 1. NITRO = joystick, toujours actif
- Pouce posé sur NITRO : boost, comme aujourd'hui.
- Zone morte ~12 px. Au seuil `GLI.seuil` (~38 px, à régler au banc) dans un des quatre secteurs, la figure de l'emplacement de cette direction part immédiatement, avec une vibration (`hap`) et le son de lancement. Pas d'attente du lâcher.
  - haut → emplacement avant (0) ; bas → emplacement arrière (1) ; gauche / droite → emplacement côté (2), figure partant du côté poussé.
- Une figure par poussée. Réarmement quand le pouce revient dans ~40 % du seuil. Re-poussée dans la même direction pendant que la figure tourne : empilement (`empile`, `IMPU.max`).
- Emplacement vide : refus (`figRefus`), jamais de figure au hasard.
- Le réglage 2 TAPS / GLISSER disparaît de l'interface. `SAVE.d.figG` n'est plus lu ; la sauvegarde n'est pas modifiée.
- Le glissé « n'importe où sur la moitié droite » (`GLI.part`) est retiré.
- Clavier / souris : 1·2·3 lancent les emplacements (inchangé) ; double-tap Espace = figure au hasard. La souris du cadre de l'ordi peut glisser depuis NITRO comme un doigt.
- Au sol : le joystick garde les figures de la route existantes (wheelie, tail whip au sol, salto, `GSOL` / `frLance`). Seules les figures en l'air passent par les emplacements équipés.

### 2. Double-tap = figure au hasard adaptée
- Candidates : figures possédées (`veqFigsAMoi`), plus `FIG.liste` en mode cousin.
- Filtres, dans l'ordre :
  1. temps de vol : on retire celles que `figLance` refuserait (`figDMin` / `figDose` contre `figBudget()` ; pour le saut au sol, `sautBesoin`). Le tirage ne produit donc jamais de refus ;
  2. braquage : |steer| > 0,3 → figures acceptant le côté (`FIG.dirs` contient 'cote'), sens du côté braqué ; joystick gauche vers l'avant / l'arrière → figures acceptant cette direction, orientées (`FIG.oriente`) ;
  3. rotation : si la caisse tourne déjà (`FX2.corps`, une figure en cours), on continue dans son sens ; sinon, selon l'assiette (avant / arrière).
- Pouce au neutre et rien ne tourne : toute figure compatible avec le temps de vol.
- On évite de retirer la même figure deux fois de suite quand une autre est possible.
- Coût en nitro, paie, combos, trios, chute : inchangés (tout passe par `figLance`).
- Au sol : le double-tap reste le saut nitro (`veqSaut`), avec une figure tirée par les mêmes filtres.
- Le redressement au tap simple (`figRedP`) reste.

### 3. Design du pouce (visuel)
- Le bouton NITRO devient un socle rond avec un pion qui suit le pouce, retenu au socle.
- Quatre repères ▲ ▼ ◄ ► autour du socle : nom court de la figure équipée (`figCourt`), couleur de sa rareté (`figRarH`) ; emplacement vide grisé.
- La direction visée s'allume ; au seuil, le pion claque (flash, secousse courte) en même temps que la vibration.
- Remplace la flèche flottante `#figGl` et le rappel `#fhLeg` en vol.
- Allégé sur téléphone via `ALLEGE` / `PAL.b`, jamais `IS_MOBILE`. Réduction des animations respectée (`REDUCED_MOTION`).

## Robustesse
- Le pouce du joystick est suivi par son identifiant de touche ; volant gauche et NITRO restent indépendants (multitouch).
- Remise à zéro à la pause, à la mort, à la seconde chance, au changement de mode (comme `GLI.req`, `gliCoupe`, `figGVoit(null)` aujourd'hui), et quand la visibilité de la page change.
- Auto-école : l'étape FIGURE accepte le glissé comme le double-tap ; consigne et main fantôme mis à jour (`auto-ecole.js`, `figTutoOk` inchangé).
- `?figjoy=0` rend l'ancien comportement pour comparer.
- Requête de lancement lue aux événements, jouée par la boucle, avec la garde `DTAP.garde` (250 ms) contre les images gelées, comme `VEQ.dReq`.

## Tests (banc headless tactile, `outils/banc-jouabilite-tactile`)
1. Chaque direction lance le bon emplacement ; côté gauche / droite donne le bon sens.
2. Emplacement vide : refus, aucune figure.
3. Vibration au seuil, une seule fois par poussée ; réarmement au retour vers le centre ; empilement.
4. Double-tap en vol : 200 tirages sur plusieurs durées de vol, zéro refus, respect du braquage et de la rotation, pas de répétition inutile.
5. Multitouch volant + NITRO ; pause / mort / seconde chance en plein geste.
6. Auto-école : étape FIGURE réussie par glissé et par double-tap.
7. Aucune exception dans la console ; au sol, les figures de la route restent intactes.

## Livraison
Branche `joystick-nitro-figures-2026-11-10` (worktree `CASH-CAR-joystick-figures`, base `origin/main`). `cashcar-vNNN` +1 dans `sw.js`, `node code/assembler.cjs`, commit de `code/` et `index.html` ensemble. Le push est séparé et décidé par Sacha.

## Hors périmètre
Rééquilibrage des prix, des raretés ou des durées de figures ; nouvelles figures ; refonte de l'inventaire / sélecteur de figures.
