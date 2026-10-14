# CASH CAR — LA PASSE GRAPHISMES (2026-10-14) — RÈGLES COMMUNES À TOUS LES AGENTS

Sacha (créateur du jeu, avec Léo) : « On s'occupe des graphismes du jeu — et quand je dis graphismes, c'est TOUT. Pousse les graphismes au
maximum. Pour chaque map, pour chaque météo, mets-toi dans la peau d'une équipe de designers / game developers seniors qui analyse d'un œil
expert la colorimétrie, l'étalonnage, les textures, les répartitions, l'équilibre de chaque map, de chaque texture, de chaque item du jeu.
C'est une refonte totale : toutes les lumières, tous les shaders, tous les plans du jeu retravaillés — et optimisés pour le mobile. Tu peux
refaire entièrement certains éléments si tu as des idées vraiment valorisantes. Je veux que le jeu transpire l'équilibre : tout cohérent,
toutes les couleurs cohérentes entre elles, tous les éléments qui se répondent. Niveau top de l'App Store. Imagine qu'on sort le jeu demain. »

Tu fais partie d'une équipe d'une centaine d'agents qui travaillent par vagues sur le même jeu, chacun dans SA copie git, chacun sur SA zone.

## ⚠⚠ PÉRIMÈTRE DE LA NUIT (ordres de PILOTAGE, 14/10 2 h 20 — ils PRIMENT sur tout ce qui suit ; règles : ~/cash-car/pilotage/REGLES.md)
Cap : la version APP STORE (iPhone) sort demain. Le Mac a redémarré sous la charge ; presque aucun commit n'était sorti. Donc :
- UNIQUEMENT ce qui est GRATUIT pour la puce de l'iPhone : étalonnage, palettes, lumières, brume, VALEURS d'uniformes et de paramètres
  existants, contenu d'une texture procédurale EXISTANTE repeinte à la même taille. AUCUNE géométrie, AUCUNE texture en plus, AUCUNE passe,
  AUCUN shader nouveau, AUCUNE lecture de texture ou branche en plus dans un shader. Une idée plus lourde = PROPOSITION dans tes notes.
- GELÉ POUR TOUS : la BOUTIQUE 3D et les VOITURES (Léo y travaille en direct sur main cette nuit). On n'y touche pas, même pour polir.
- MISSION COURTE : une zone, 20-30 minutes, un livrable. UN COMMIT APRÈS CHAQUE CHANGEMENT QUI MARCHE — un agent sans commit au bout de
  20 minutes est un agent perdu. Ne lis jamais index.html ni CLAUDE.md en entier ; sers-toi des cartes ($G/carte/rendu.md est complète).
- NAVIGATEUR : une seule ouverture à la fois pour l'équipe, 3 pour toute la machine (sémaphore commun, géré par $G/banc/lib.cjs — rien
  d'autre ne lance Chrome). Avant d'ouvrir : `uptime` — si la charge sur 1 min dépasse 25, attends 5 minutes.
- JOURNAL COMMUN des cinq sessions : `~/cash-car/debug/journal-correctifs.tsv`. AVANT de toucher une fonction : `grep` son nom dedans
  (si une autre session vient d'y passer, fais au plus petit et note-le). APRÈS chaque commit, une ligne :
  `printf 'gfx:<ton-nom>\t<fonction ou constante>\t<lignes>\t<titre du commit>\n' >> ~/cash-car/debug/journal-correctifs.tsv`
- Personne ne pousse, personne ne fusionne : l'intégrateur de l'équipe (moi) reprend ta branche dans `gfx-integration`.

## L'ŒIL « APPLE » (Sacha, 2026-10-14 : « mets-toi dans la tête d'un designer de jeux vidéo pour Apple, littéralement Apple »)
Juge chaque image comme le ferait un designer d'Apple devant un jeu candidat à un Apple Design Award :
- LA RETENUE : moins d'effets, mais chacun parfait. Ce qui n'ajoute rien se retire (bruit visuel, lueurs gratuites, dégradés criards,
  surcouches qui salissent l'image). La clarté d'abord : on comprend l'image en une demi-seconde.
- L'HONNÊTETÉ DES MATIÈRES : un béton est mat, un métal brille, un verre réfléchit, une eau miroite — chaque matière se reconnaît et la
  lumière s'y comporte juste. Pas de plastique partout.
- LA LUMIÈRE ET LA PROFONDEUR : une source claire, des ombres propres, une hiérarchie nette des plans, de l'air entre eux.
- LA COULEUR TENUE : une palette courte par scène, des accents rares et précis, des noirs et des blancs propres, aucune dominante sale.
- LA FINITION : pas un pixel qui scintille, pas un bord qui bave, pas une transition qui saute. 60 images par seconde, toujours.

## DÉCISIONS DE SACHA PENDANT LA PASSE (elles priment sur la charte)
- LA ROUTE devient un BÉTON BRUT, BIEN MAT (agent `route-beton`, branche gfx/route-beton) : plus de bitume violet satiné. Toutes les
  ambiances doivent s'accorder à une route de béton gris minéral, mate à sec, mouillée seulement sous la pluie.
- LES PLOTS DE CHANTIER (cônes orange) sont RETIRÉS de la route (« ça ne sert plus » ; agent `sans-plots`).
- Dans les PICS DE JADE (la « montagne chinoise »), les pièces vertes deviennent des PIÈCES CHINOISES (sapèques : rondes, TROU CARRÉ au
  centre ; agent `pieces-jade`).

## ⚠ EN DOUCEUR — LE MAC A ÉTÉ SURCHARGÉ (il a redémarré le 14/10 à 2 h ; Sacha : « reprends plus gentiment »)
Cinq sessions travaillent sur ce Mac en même temps. Le navigateur de banc (Chrome qui fait tourner le jeu) est ce qui l'a mis à genoux.
- UN SEUL navigateur à la fois pour TOUTE l'équipe graphismes : le sémaphore de `$G/banc/lib.cjs` te fait attendre ton tour (parfois
  plusieurs minutes : c'est normal, ne contourne pas). Chrome ne se lance QUE par `lib.cjs` (priorité basse). Jamais de `CC_SLOTS`, jamais
  de Chrome/Playwright lancé à la main, jamais deux scripts de banc en parallèle, jamais de boucle qui rouvre le navigateur.
- BUDGET : vise 4 à 6 ouvertures de navigateur AU PLUS pour toute ta mission, chacune courte (< 2 min) et rentable : réglages À CHAUD
  (`dbgAmb`, `dbgDA`, `dbgGfx`, ton hook) et plusieurs captures dans la même ouverture. Toujours `await s.ferme(); process.exit(0)`.
- TRAVAILLE D'ABORD PAR LE CODE et sur les captures qui existent déjà (`$G/shots/avant/`) : lis, raisonne, calcule les couleurs
  (un petit script node/python qui convertit et compare des teintes ne coûte rien), puis vérifie à l'image — pas l'inverse.
- Les mesures de TEMPS (ms, i/s) ne valent rien sur cette machine : compare des COMPTEURS (appels de dessin, triangles, lectures de
  texture par pixel, programmes compilés).
- Pas de processus laissé derrière toi (serveur en double, node en attente, navigateur orphelin).

## LES AUTRES SESSIONS — CHACUN SA ZONE (toutes modifient le même index.html ; tout sera fusionné à la fin)
- INTERFACE (`~/cash-car/ui`) : le HUD, les menus, les écrans (accueil, garage, boutique, pause, fin de course), tout le CSS/HTML —
  refondus en CHARTE 6 « ENCRE · BLANC · OR », à plat, sans néon. ⇒ L'équipe graphismes NE TOUCHE À AUCUN CSS NI HTML D'INTERFACE.
  À savoir pour la direction artistique : Sacha a rejeté le néon violet + magenta/cyan + lueurs + dégradés comme « trop IA ». Dans le
  MONDE 3D aussi, méfie-toi du violet-néon par défaut : des matières vraies, une lumière juste, des palettes tenues.
- OPTIMISATION (`~/cash-car/perf`) : les crans, le palier d'appareil `PAL`, les optimisations. ⇒ on ne refait pas leur travail ; on
  n'AJOUTE aucun coût (règles « MOBILE D'ABORD » plus bas).
- DEBUGGING (`~/cash-car/debug`) : collisions, parcours, bugs. DÉTAIL (`~/cash-car/detail`) : son, textes/langues, missions/économie, PWA.
- NOTRE ZONE : l'IMAGE DU MONDE 3D — ambiances (ciel, lumière, brume, étalonnage), shaders, matières, textures, la route, les décors de
  chaque map, les voitures, les pièces/bonus/obstacles/portails, les particules et effets, la météo, les scènes 3D du titre, du garage
  et de la boutique (leur lumière et leurs matières, pas leurs boutons).

## ⚠ COMMITE SOUVENT (deux passes précédentes ont TOUT perdu)
Deux fois déjà, les agents ont été coupés (limite d'usage) avant d'avoir commité : rien n'est resté. Donc :
**un commit après CHAQUE amélioration qui marche** (au minimum toutes les 15 minutes ; un commit « (en cours) » si besoin).
Tes notes `$G/notes/<ton-nom>.md` : au fil de l'eau, pas à la fin. Tes scripts : `$G/banc/<ton-nom>/` (permanent), jamais dans /tmp.
Vise un résultat LIVRABLE en ~45 minutes : d'abord les 3-5 améliorations qui changent le plus l'image, commitées ; le raffinement après.

## Le jeu
- Un seul fichier : `<ta copie>/VERSION PRINCIPALE/index.html` — 5,4 Mo, ~52 000 lignes, Three.js r1xx (vendor/), tout dans une IIFE.
  ⚠ certaines lignes font > 5 000 caractères : ne JAMAIS `cat` le fichier ni le lire en entier ; `grep -n … | cut -c1-300`,
  `sed -n 'A,Bp' | cut -c1-600`, ou Read avec offset/limit. Cherche par nom de fonction / id / commentaire daté.
- Le guide : `VERSION PRINCIPALE/CLAUDE.md` (800 Ko : l'historique des décisions de Sacha et Léo, sections datées, les plus récentes en haut).
  NE PAS le lire en entier : `grep -n '^## ' CLAUDE.md | head -80`, puis seulement les sections de ta zone. Ce qui y est tranché par
  Sacha/Léo compte : tu peux améliorer, pas trahir l'intention.
- LA CARTE DU CODE (où vit chaque organe du rendu) et LA CHARTE (la direction artistique commune) : `$G/CARTE.md` et `$G/CHARTE.md`
  (dès qu'elles existent — LIS-LES avant de toucher quoi que ce soit ; la CHARTE fait foi pour les couleurs).
- Les fonctions du jeu sont privées ; seules les `window.dbg*` sont accessibles depuis le banc
  (`grep -o 'window\.dbg[A-Za-z0-9_]*' index.html | sort -u`). Les plus utiles ici :
  `dbgClassique(carte,meteo)` (force le prochain JOUER sur un couple) · `dbgBio(nom)` · `dbgAmb(nom,{…})` (retoucher une ambiance À CHAUD) ·
  `dbgDA({…})` (la couche d'étalonnage globale, `fige:1` met en pause) · `dbgGfx({…})` · `dbgQual(k)` (cran de qualité, 0 = FULL) ·
  `dbgDPR(d)` · `dbgPerf()` · `dbgAuto(true)` (pilote automatique) · `dbgStep` · `dbgHeure(h)` (l'heure du titre) · `dbgGarage` · `dbgPortail` ·
  `dbgOrage('eclair')` · `dbgState()`. Tu peux AJOUTER des `window.dbgXxx` pour ton banc (une ligne, commentaire « banc »).
- Les maps et météos (le MODE CLASSIQUE AU HASARD de Sacha : JOUER tire une map et une météo, chaque portail en tire d'autres) — `SF_CARTES` :
  · MER DE NUAGES : matin (BIOMES.matin) · midi (midi) · soir (nuagesSoir) · nuit (nuagesNuit) · pluie (nuagesPluie) · orage (niveau L'ORAGE)
  · LA VILLE : matin (villeMatin) · midi (villeMidi) · soir (villeSoir) · nuit (niveau MINUIT, nuitNoire) · pluie (niveau VILLE, pluie) · orage (villeOrage)
  · PICS DE JADE : matin (jadeMatin) · midi (jadeMidi) · soir (jade, de Léo) · nuit (jadeNuit) · pluie (jadePluie) · orage (jadeOrage)
  · EN ORBITE : matin (espaceMatin) · midi (espace) · soir (espaceSoir) · satellites (niveau PLUIE DE SATELLITES)
  + CRYPTOCITY (`?niveau=crypto`, bullrun, Léo) · LE SOLEIL DE JADE (`?play=jade`, Léo) · l'écran TITRE et ses 6 heures · le GARAGE/ATELIER · la BOUTIQUE 3D.
  ⚠ Les ambiances HÉRITENT les unes des autres (`bioMet(BIOMES.parent,{…})`) : toucher un parent change ses enfants.
- `bioApply` = le SEUL écrivain des lumières/brume/étalonnage ; `daPose` = la couche `DA` globale par-dessus ; `ACESShader` = la passe finale.

## Ta copie, ton serveur, ton banc
- `G=/Users/sachaberes/cash-car/gfx` (dossier permanent). Ta copie git : `$G/wt/<ton-nom>` (branche `gfx/<ton-nom>`, partie de `gfx-integration`).
  C'est une copie LÉGÈRE (sans l'audio) : normal. Travaille UNIQUEMENT dedans.
- Ton serveur tourne déjà : `http://localhost:<ton-port>/index.html` (il sert TA copie, sans cache). S'il est tombé :
  `sh $G/banc/prepare.sh <ton-nom> <ton-port>`.
- Banc commun (Chrome sans fenêtre, GPU Metal, vrais doigts) : `$G/banc/lib.cjs` — LIS-LE (130 lignes). Et surtout :
  `node $G/banc/couple.cjs <port> <carte> <meteo> $G/shots/<ton-nom> [couche|debout|i7couche] [tag]` → 4 captures d'une course sur ce couple
  (pilote auto, cran FULL figé, DPR 2) + erreurs JS + dbgPerf. `carte` = nuages|ville|jade|espace|crypto|soleil. Copie-le dans
  `$G/banc/<ton-nom>/` et adapte-le (autres instants, HUD masqué, `dbgAmb` à chaud pour comparer 5 réglages dans UNE seule ouverture…).
  ⚠ `dbgSaut()` ouvre un PORTAIL (on change de map). ⚠ UN SEUL navigateur tourne à la fois pour toute l'équipe (sémaphore : tu attends ton
  tour) et chaque ouverture coûte 20-60 s ⇒ fais BEAUCOUP de vérifications par ouverture (boucle de réglages à chaud, plusieurs captures),
  toujours `await s.ferme(); process.exit(0)`, et lance les scripts longs en arrière-plan avec un fichier de log.
- REGARDE tes captures (outil Read sur le .png) : c'est l'œil qui juge. Compare AVANT / APRÈS côte à côte (`B.planche`).
  Les captures AVANT de tous les couples sont déjà dans `$G/shots/avant/` (`<carte>-<meteo>-1-depart|2-route|3-vitesse|4-loin.png`).
- Syntaxe après chaque modif : `node $G/banc/syntaxe.cjs "$G/wt/<nom>/VERSION PRINCIPALE/index.html"` → 0 erreur.
  Garde de Léo : `cd $G/wt/<nom> && sh garde-burnout.sh` → OK.

## Règles git (ABSOLUES)
- Commits fréquents, en français, style du dépôt : « Zone : ce qui change (passe graphismes) », terminés par la ligne
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- JAMAIS : push, merge, rebase, reset --hard, `git stash`, toucher à `main` ou à une autre copie, supprimer une branche.
- Ne touche PAS : `sw.js` (l'intégrateur l'incrémente), les `CLAUDE.md` (tes notes vont dans `$G/notes/<ton-nom>.md`), les fichiers hors de
  `VERSION PRINCIPALE/index.html` sauf nécessité absolue (un nouveau fichier d'asset : `git add --sparse`, et note-le).

## Ce qui est INTOUCHABLE
- Le BURN-OUT du garage (Léo : `BURN`, `DON`, `burnPart`, `burnGeste`, `burnDerape`, `burnCubes`, `BURN_TENU`, `BURN_FS_FUM`, tout ce qui
  commence par burn/don) : on n'y touche pas.
- La CONSTRUCTION de la carte du SOLEIL DE JADE (`buildJade`, `voxMesh`, `jadePorte`, `jadeGabarits`, `jadeRange`, `jadeEtatVide`, `jadeJette`).
  (Ses matières, sa lumière, son étalonnage restent permis à l'agent dont c'est la zone.)
- Le GAMEPLAY : la conduite, la physique, les collisions, les scores, la difficulté, la génération de la piste, l'économie, les sons. C'est une
  passe GRAPHIQUE : la lisibilité de jeu (route, bords, obstacles, pièces, portails) ne doit jamais baisser — elle doit monter.
- Les créations signées de Léo (boutique 3D, rotonde, bras d'atelier, dauphins, vitrail, singes, Soleil de Jade et son eau, CRYPTOCITY,
  dragon de NITROOO, voitures « vrais modèles ») et le style PIXEL/VOXEL du jeu : tu peux les sublimer (matière, lumière, couleur), pas les
  retirer ni changer leur forme. Une idée de refonte plus radicale = PROPOSITION dans tes notes, pas dans le code.

## Travailler à 100 sur le même fichier
- Chaque agent a une ZONE (dite dans sa mission). Hors de ta zone : tu notes dans `$G/notes/<ton-nom>.md`, section « POUR LES AUTRES »,
  sans modifier. Si deux zones se touchent, la mission dit qui écrit quoi.
- Modifs CHIRURGICALES : pas de reformatage, pas de réindentation, pas de déplacement de blocs, pas de renommage global. Ne réécris pas une
  longue ligne entière pour changer trois valeurs si tu peux l'éviter ; AJOUTE plutôt (une ligne de surcharge après la définition :
  `Object.assign(BIOMES.xxx,{…}); // (2026-10-14, passe graphismes) pourquoi`). Les fusions se font ligne à ligne : moins tu touches de
  lignes existantes, moins il y aura de conflits.
- Style du code : commentaires en français, datés « (2026-10-14, passe graphismes) », qui disent POURQUOI.

## MOBILE D'ABORD (la règle qui prime)
- Le jeu doit tourner sur un iPhone 7. Ne JAMAIS dégrader le cran bas pour embellir le cran haut : tout surcoût passe par les crans de
  qualité (`QUAL_LOW` / `QUAL_MED` / FULL, `QL.k`, `qlPose`, `qlBornes`, DPR adaptatif — voir `dbgQual`, `dbgPerf`).
- INTERDIT : une nouvelle passe plein écran, une nouvelle cible de rendu, un programme GLSL compilé PENDANT la course (à-coup), des textures
  > 1024², des boucles longues ou des lectures dépendantes dans un fragment shader, de la transparence empilée plein écran (overdraw),
  des allocations par image (`new THREE.…` dans la boucle). Un effet nouveau = un uniforme qui vaut 0 hors du cran FULL.
- La couleur, la lumière, l'étalonnage, les valeurs d'uniformes, les dégradés, les palettes : GRATUITS — c'est là qu'on gagne le plus.
- Mesure : `dbgPerf()` avant/après sur ta scène (ms, appels, triangles) ; si tu ajoutes du coût au cran FULL, dis combien.

## Qualité exigée
- 0 erreur JS (pageerror / console.error) au banc sur chaque parcours que tu touches (les `requestfailed … .m4a/.mp3 ERR_ABORTED` sont du bruit).
- Avant de rendre : menu → JOUER → course marche COUCHÉ (844×390) ET DEBOUT (390×844) sur ta zone.
- Captures AVANT et APRÈS dans `$G/shots/<ton-nom>/` + une planche `planche-avant-apres.png`.
- Pas de « mieux » sans preuve : chaque changement gardé se VOIT sur une capture comparée. Si un essai n'améliore pas, retire-le.

## À rendre
1. Commits sur ta branche `gfx/<ton-nom>` (`git status` propre à la fin).
2. `$G/notes/<ton-nom>.md` : ce que tu as changé (fonctions/clés, pourquoi), tes planches, ce qui reste, les PROPOSITIONS à trancher par
   Sacha/Léo, et « POUR LES AUTRES ».
3. Ton dernier message : un rapport court en français (≤ 30 lignes) : fait / mesuré / reste / zones du fichier touchées (noms de fonctions
   ou de constantes) pour l'intégrateur.
