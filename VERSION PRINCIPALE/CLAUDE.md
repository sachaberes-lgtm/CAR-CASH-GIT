# CASH CAR — le guide de VERSION PRINCIPALE

À lire en arrivant. Ce guide est COURT exprès : il donne les règles, la carte du code et les recettes.
Le détail de chaque chantier (pourquoi, chiffres mesurés, bancs) est dans **`JOURNAL.md`** (même dossier) :
une section datée par demande, la plus récente en haut. Pour y aller : `grep -n "^## LA LOI DU RÉSERVOIR" JOURNAL.md`.

Le `CLAUDE.md` de la RACINE du dépôt reste la loi commune, à lire aussi. En trois lignes :
le BURN-OUT du garage est à Léo (une garde bloque toute publication sans lui) ; la version de référence est le commit
`c02c75a` et tout se bâtit sur `origin/main` à jour ; on fusionne sans jamais forcer, et un choix tranché ne se rebascule pas.

---

## 1. Le jeu en dix lignes

- **CASH CAR** : runner arcade 3D (three.js r128, dans `vendor/`, aucun CDN). On conduit une caisse sur un ruban de route
  suspendu, on vole, on ramasse pièces, fruits et pouvoirs, on monte le MOTEUR pendant la partie. L'argent gagné achète des
  caisses et des habillages au garage. Une partie enchaîne des niveaux par des portails ; JOUER tire une map et une météo au hasard.
- **Tout le jeu tient dans `VERSION PRINCIPALE/index.html`** (~53 000 lignes : HTML, CSS, JS). C'est voulu, on ne le découpe pas.
  Autour : `figures.js` (les figures), `sfx.js` + `sons-banque.js` (les sons), `sw.js` (service worker), `assets/`, `vendor/`.
- **Langues** : français (la source), anglais, chinois partiel.
- **Éditions tirées de ce seul fichier** : `node poki-construire.js [crazy|itch|playgama]` (racine) fabrique `POKI/`, `CRAZY/`,
  `ITCH/`, `PLAYGAMA/` et leurs zips (ignorés par git, à refaire après chaque changement). L'app iPhone (Capacitor) vit sur la
  branche `ios-capacitor` (`app-ios/`, son `www/` est régénéré depuis ce dossier).
- **`AUTRE VERSION/`** (l'édition PC, gelée depuis le 25/09) n'est plus dans le dépôt depuis le 2026-10-18 (étiquette git
  `avant-allegement-2026-10-18`) ; `node synchro-versions.js` la refabrique en local, sans la committer. **`ROBLOX/`** est un autre jeu.
- **En ligne** : chaque push sur `main` publie https://car-cash-git.vercel.app/jouer/ (`vercel-build.sh`, ~1 min). C'est là que
  Sacha et Léo jouent sur téléphone. Le numéro « VERSION xxxxxxx » des réglages = l'empreinte du jeu publié.
  ⚠ LA COPIE EN LIGNE EST ALLÉGÉE (2026-10-18, `outils/publie-allege.cjs`) : sans commentaires (même nombre de lignes : les numéros
  d'erreur sont ceux du source) et sans les crochets `window.dbgX` que rien de publié n'appelle. Les bancs travaillent sur le source
  local : pour un crochet sur /jouer/, il faut qu'un code publié le nomme. Un nouveau commentaire ou un nouveau dbg ne coûte donc rien
  aux joueurs.
  ⚠ ELLE NE PORTE QUE LES SONS QUE LE JEU PEUT DEMANDER (2026-10-18, Sacha ; `vercel-build.sh` + `outils/publie-audio.cjs`) : ni la bibliothèque
  des sons (`bibliotheque.html`, outil local) ni ses boucles/catalogues ; pour Pouce bleu, seulement les dossiers de `paliers/rendus/` des morceaux
  rangés « bleu », les générateurs `direct/musique-trente-<v>.js` que les 👍 rejouent et les échantillons `direct/vrais/` du REJEU de ces musiques
  (`outils/vrais-jeu.json`). ⚠ Quand Léo range un nouveau morceau dans Pouce bleu (`musique-moteur.json`) : `node outils/preuve-vrais/rejoue.mjs`
  refait la liste des échantillons (sinon le build ne retire plus rien de `vrais/` et le dit). Un nouveau fichier de musique lu par le jeu
  hors Pouce bleu (ciel, auto-école, frénésie…) ne doit PAS être dans les `rm` de `vercel-build.sh`.
- **Sur son PC, Sacha joue une COPIE** : `C:\Users\sacha\Downloads\CAR-CASH-GIT-main\CAR-CASH-GIT-main\VERSION PRINCIPALE\`
  (JOUER.bat → localhost:8000), à la souris, dans le cadre d'un iPhone couché (844 × 390).

**Qui est qui.** Sacha : le propriétaire, pas développeur ; il écrit en français, en vrac, souvent avec une capture ; il tranche.
Léo : co-créateur ; il pousse très souvent sur `main` (auteur `leolei940`, depuis son Mac, ou via des sessions Claude en ligne).
Les sessions Claude de Sacha portent un nom (GRAPHISME, GAMEPLAY, SON, INTERFACE, DEBUGGING…) : on signe ses sections avec.

---

## 2. La méthode de travail

**Avant de toucher quoi que ce soit**
1. `git -C C:/Users/sacha/Documents/GitHub/CAR-CASH-GIT fetch origin`, puis `git log --oneline -15 origin/main` : le dépôt bouge
   toutes les heures (Léo, les autres sessions).
2. Un worktree à soi : `git -C C:/Users/sacha/Documents/GitHub/CAR-CASH-GIT worktree add ../CCG-<nom> -b <nom> origin/main`.
   Jamais d'édition dans le dossier `CAR-CASH-GIT/` lui-même : une autre session y travaille peut-être. Serveur de test sur un port à soi.
3. Lire la section du JOURNAL qui parle du sujet (index au §8).

**Une demande = un cycle complet livré, sans qu'on le redemande** : faire → vérifier → commit → push → recopie. Une demande à la
fois, livrée au fil de l'eau, pas en lot.
- **Vérifier** : la syntaxe (§5), puis menu → JOUER → course SANS ERREUR, couché ET debout ET dans le cadre de l'ordi.
  `sh garde-burnout.sh` ET `sh garde-charte.sh` (racine) doivent répondre OK.
- **Versions** : `CACHE` de `sw.js` +1 (`'cashcar-vNNN'`) dans chaque commit qui touche le jeu. Depuis le 2026-10-18 on REMPLACE la
  ligne `const CACHE` (une note courte), sans garder l'ancienne en commentaire : l'historique v2 → v624 est à la fin de JOURNAL.md.
  Un fichier chargé avec `?v=N` (`sons-banque.js`, `sfx.js`, `figures.js`, `musique-bus.js`) : N +1 quand il change.
  Sinon les joueurs gardent l'ancien fichier, indéfiniment, sans erreur.
- **Commit** : `git add "VERSION PRINCIPALE/<fichiers>"`. **Jamais `git add -A`** : des fichiers d'autres sessions traînent (ml/,
  données de Léo). Message en français qui cite la demande.
- **Intégrer** : `git fetch origin` puis `git rebase origin/main` (ou `git merge origin/main`). Jamais `--force`, jamais de `reset`
  ni de revert du travail de l'autre ; dans un conflit on garde les deux. Conflit habituel : la ligne `CACHE` de `sw.js` → le plus
  grand +1, une seule ligne (les notes vont au journal). Revérifier après l'intégration.
- **Pousser** : `git push origin <nom>:main`. Refusé (quelqu'un a poussé entre-temps) : refetch, rebase, revérifier, repousser.
- **Recopier** (sinon Sacha ne voit rien) : seulement si le push est passé et qu'aucun conflit n'est ouvert
  (`git diff --diff-filter=U` vide, aucun marqueur `<<<<<<<` dans les fichiers copiés). Copier TOUS les fichiers suivis de
  `VERSION PRINCIPALE/` (`git ls-files`), pas seulement `index.html` : `figures.js`, `sw.js`, sons, assets neufs.
- **Contrôler la mise en ligne** : https://car-cash-git.vercel.app/jouer/version.json (champ « commit »).
- **Fins de ligne** : le dépôt est en LF ; sur le PC de Sacha `core.autocrlf=true` sort du CRLF. Un script d'édition lit et écrit
  en BINAIRE, via un fichier temporaire + `os.replace` (un agent a déjà vidé `index.html` à 0 octet). `sed -i` de Git Bash repasse en LF.
  Du texte français dans un heredoc ou un `node -e` casse (apostrophes, accents graves) : écrire le script avec l'outil Write.

**Ce qui appartient à qui — on ne contre-bascule jamais**
- Le **BURN-OUT** du garage est à Léo (`BURN`, `DON`, `burnPart`, `burnGeste`, `burnDerape`, `burnCubes`, `BURN_TENU`,
  `BURN_FS_FUM`) : ni supprimé, ni remplacé, ni écrasé par une vieille copie. Le changer = demander à Léo.
- Les choix de Sacha et de Léo coexistent derrière UN booléen ou un paramètre d'adresse ; rien n'est détruit. Par défaut : le menu
  de Sacha (celui de Léo, `?menu=leo`, est retiré le 18/10), JOUER = le mode classique au hasard (le Soleil de jade direct = `?play=jade`),
  l'iPhone avec encoche sur l'ordi (`ENCOCHE_DEFAUT`, écran nu = `?encoche=0`).
- Une session (ou Léo) a rebasculé un choix de l'autre ? On le SIGNALE à Sacha, on ne rebascule pas. Le rangement du garage du
  11/10 a été annulé par Léo : ne pas le remettre sans lui.
- Données de Léo à ne pas écraser en test : `simulateur/choix-musiques.json`, `simulateur/play.json`, `maps-ciel/sauvegarde.json`.
- **Rien d'ajouté sans demande** : « améliore » = lumière, couleurs, matières de ce qui existe. Un objet, un décor, une mécanique
  neuve se PROPOSE en une ligne avant d'être construit.

**Consigner son travail**
- Chaque demande livrée → une section EN HAUT de `JOURNAL.md`, titre sur UNE ligne :
  `## TITRE EN CAPITALES (AAAA-MM-JJ, qui : « la demande, citée »)`. Dedans : ce qui a changé (noms de fonctions et de constantes,
  jamais de numéros de ligne), ce qui a été MESURÉ (avant / après), les bancs, les crochets `dbg*` et paramètres d'adresse, ce qui
  reste à trancher par Sacha ou Léo.
- Ce guide ne change que si une RÈGLE, une ARCHITECTURE ou une RECETTE change : une ligne ici, le récit au journal.

---

## 3. La carte du code (`index.html`)

On cherche par NOM : `grep -n "function buildCar" index.html`. Les numéros de ligne bougent à chaque commit.

**L'ossature**
- `<head>` : un premier `<script>` pose les aiguillages globaux — `EDITION`, `POKI_BUILD`/`POKI`, `PORTAIL_SDK`, `CC_PK` (kits
  des portails), `CC_BUILD` (jeton de version), `ENCOCHE_DEFAUT`, le cadre de l'ordi (`CC_COLONNE`).
- CSS : la feuille historique, puis des blocs nommés `<style id="…">` dans le `<body>`, qui gagnent dans l'ordre : `charte4`
  (la charte v4/v5 : tous les écrans hors course), `hudMaitrise`, `hudDA`, `garageV7`, `garageVitrine`, `hubGarage`,
  `poki`, `uxPasse`, `nitroEclair`, `auraJauge`, `passeMobile`. Un chantier d'interface = son propre bloc nommé, après ceux qu'il surcharge.
- JS : le grand script est une IIFE (`(function(){'use strict'; … requestAnimationFrame(loop);})()`). Rien n'est global, sauf les
  crochets de console `window.dbg*`.

**Les systèmes et leurs noms**
- **Boucle et états** : `loop` (son try/catch avale les erreurs : `window.__loopErr`), `start`, `resetGame`, `endGame`,
  `explode(cause)`, `mode` = 'drive' | 'fall' | 'boom', `togglePause`, `repriseCompte`, `CHANCE` (la seconde chance : la reprise
  n'appelle ni `runxReset` ni `resetGame`, elle décale les bases de commitExploits — `chanceBase`). Depuis le 15/10 soir elle se gagne par une
  PUB, plus avec de l'argent : `pubRecompense(nom,fin)`/`PUBR` ; une régie se branche par `window.CC_PUB_RECOMPENSE`, sinon la pub maison `#pubR`.
  Sur le SITE, la régie est AdSense (`CC_ADSENSE` dans le `<head>`, vide = éteinte ; `ADS`, `CC_PUB_PREPARE` ; `?pubtest=1` = le mode test de Google).
- **La mort** : `explode` (comptes, musique) → `boomDetone` (la boule DESSINÉE de l'airtime : `spawnBoomArt`, `VOLU`/`DARD`, `BOOM_ONDES`,
  pièces de la caisse) → `BOOM_CAM` (le plan de la mort) → `endGame`. Contre une PAROI, L'IMPACT passe avant : `impPrep(test,cause,marge)`
  trouve le contact et la normale, `IMP`/`impCoupTick` (0,11 s : la caisse s'écrase, étoile, négatif), puis le cratère `IMP_CRAT`, les
  éclats `IMP_ECL`, les répliques (`impTick`). La même animation pour TOUS les obstacles (Sacha, 15/10). Ce qu'on percute SANS mourir
  (le coup d'épaule contre une paroi, `parisMur` : couloirs du canyon, Paris) = L'IMPACT EN MINIATURE, `impMini`/`IMPM` (étoile + éclats +
  étincelles au PREMIER contact, sa propre réserve, ni cratère ni coup ni boule) ; plots, portes et satellites ne sont plus en jeu.
- **Conduite** : `TCTL` (volant tactile et souris), `keys`, `steer`, `yawR`, `lacetMax`, `driftYaw`, `momT`, `SPD` (vitesse globale),
  `ASSIST_VIRAGE` (= 0), `bindHold`, `CAM_ROUTE`, `CAM_REPRISE`, `fovFit`, le frein étalé `vFrein`/`FREIN_L` (17/10).
- **Vol et pose** : `startFall`, `tryLand`, `AIR_RATE` (= 1), `FALL_G` (= 33 × `GRAV_K` 1,45 depuis le 17/10 — 1,3 le 15/10 : LE bouton de la gravité, `?grav=1` = avant ; le saut nitro à figure n'est plus rallongé qu'au vol minimum, `sautBesoin`), `fallVH0`, `FLY_U`, `VEQ`/`VEQ_K` (le vol équilibré),
  `veqDouble`/`veqSaut` (double-tap nitro), `FIG` (figures.js), `addTrick`, `trackMinY`, `dalleProche`.
- **Figures v2** (la physique) : `FIG.Corps`/`FIG.PHY` (figures.js), `FIGV2`/`FX2`, `figLance` (une explosion), `figPose` (chaque image de vol),
  `figDepart`/`figMemo` (l'élan emporté au décollage), `figBudget`, `figPaye`/`figChute`, les emplacements `SAVE.d.figEq`/`figEquipees`,
  les boutons `#tFig`/`figHud`. Le lecteur de Léo (`?fig=ancien`) et les figures libres (`?fig=libre`) sont retirés (18/10). Depuis le 15/10 : DEUX emplacements (`FIG_NB`), choisis au joystick sur le
  double-tap NITRO (`FDIR`/`figDirSlot` : avant = 1, côté = 2 ; `?figdir=0` rend les boutons), le HUD des figures `#fh` (`fhLance`/`fhPlante`/
  `fhFin`/`fhTick`, bloc `figuresHud`) et le rappel `#fhLeg` à côté de NITRO. Depuis le 15/10 soir : TROIS DIRECTIONS, TROIS EMPLACEMENTS
  (`FIG_NB`=3 ; `FIG.dirs`/`FIG.oriente` dans figures.js ; `FIG_DIR`/`FIG_FAM`/`figPeut`/`figSlots`/`figRange`, `SAVE.d.figEq3`) — ↑ pouce en
  AVANT, ↓ en ARRIÈRE, ◄► sur un CÔTÉ (la figure part du côté du pouce, `o.dx`) ; une figure à deux sens (rodéo…) peut tenir l'avant ET
  l'arrière, le geste oriente son salto ; équiper remplace celle de CET emplacement ; un emplacement vide : son geste ne fait RIEN
  (`o.strict`, sauf l'auto-école) ; la boutique les range en trois sections, une carte par direction (`bqFigRail`, `bqFigSec`, `data-dir`, `bqFigDir`).
  LE COUP NET (15/10 soir, `FIG.PHY.elan`, `?elan=0` = la prise d'avant) : une figure = un COUP à 2 × la vitesse moyenne puis un FREIN RÉGULIER
  (`m.acc`) qui l'arrête pile après ses tours (+`eps`, planté) ; durée dosée sur le vol (`figDose`) ; deux rotations = un axe penché en tours
  entiers ; une contraire annule, deux qui se contrarient : la dernière mène ; la fin d'un mélange CONTINUE et ralentit jusqu'à l'endroit
  (`finVise`, `aF` figé) ; la prise forte = filet. Le SAUT NITRO prend la figure de la direction tenue. **Depuis le 17/10 soir, AU SOL la figure
  se fait SUR LA ROUTE, sans décoller** (`FR`/`FR_K`, `frLance`/`frTick`/`frPose`/`frEncaisse`, `frDecolle`/`frVersVol` au décollage ;
  `?froute=0` = le saut d'avant ; `dbgFRoute`) — rien dans la direction tenue : le saut nitro, sans figure. **Depuis le 19/10 (Léo), LE DÉCOLLAGE AU MANCHE** : pendant ce bond, le manche du vol
  poussé « nez en haut » (un geste NEUF : le pouce qui a choisi la figure ne compte pas) fait décoller pour de bon (`FDC`, `frNez`, `frEnvol`,
  `?fdecolle=0`, `dbgFDecolle`) ; la figure finit en l'air. HUD des figures v4 : `figNom` (DOUBLE…,
  TOUPIE 720), flèche du geste (`r.flD`), pastilles + COMBO + RECORD (`SAVE.d.figRec`), extinction sur place, rappel `.arme` (`fhArme`).
  **HUD v5 (18/10)** : le nom dans la couleur et la police de sa RARETÉ (`figRarH`, `FIG_RP`, `data-rp`) ; la ligne du combo = les NOMS des
  figures plantées (`fhMaillon`/`fhCsCale`, dès 2 figures ; seule, elle s'écrit une fois en grand : `fhSeule`) ; combo à trois nommé `fhTrio` ;
  le BUMP compte au combo du vol comme une figure (`figBumpNote`/`BUMP_FIG`/`fhBump`, BUMP → DOUBLE → TRIPLE → MEGA, `?bumpfig=0` = avant).
  RÉGLAGE FIGURES (15/10, Léo) : `SAVE.d.figG` 'tap' (le double-tap ci-dessus, d'origine) · 'glisse' = depuis NITRO, glisser puis lâcher
  (`GLI`, `figGJoue`, `figGVoit`/`#figGl` la flèche, `figGBascule` seul écrivain). En l'air ← → TAIL WHIP (15/10 soir, `FIG.par.tailwhip`, `piv` : le nez fixe ; offert, le tonneau à 1 500, `SAVE.d.figT0`), ↑ salto arrière, ↓ salto avant ; AU SOL
  `GSOL` (`gsolLance`/`gsolTick`/`gsolPose`) : ← → SLIDE 360, ↑ WHEELIE, ↓ STOPPIE, joystick avant pendant l'amorce = `veqSaut(fo)` + salto.
- **Piste et niveaux** : `newTrack` → `lvlChoisir` → `genCtrl` → `buildTrack` ; `frameAt`, `rnd`/`mulberry32`, `NIVEAUX`, `LVL`,
  mode classique `SF`/`SF_CARTES`/`sfTire`/`sfNiveau`, `NIV_PARIS`/`genParis`/`buildParis`/`PARIS` (PARIS au sol : hors du classique depuis le 18/10 au soir, code gardé), `NIV_JADE`/`genJade`/`JADE_HUMEURS`/`buildJade` (la vallée de jade tirée au hasard : axe, ordre des monuments, caractère des tronçons, relief), `NIV_FORET`/`genForet`/`buildForet`/`FORET` (la forêt), `NIV_VOLCAN`/`genVolcan`/`buildVolcan`/`VOLCAN` (le volcan), `NIV_CRYPTO`, `NIV_VITRE`/`VIT`/`vitreMatTours`/`vitreGeo`/`vitreGeoR`/`vitreForme`/`vitreCiel`/`vitreDirigeable`/`vitreAplanir`/`vitreSolMat`/`vitreSolPose` (LA VILLE VITRÉE = CLEAN CITY AU SOL : la route à plat à 26 m du sol, des ponts sur piliers où elle se recroise, des géantes de verre posées sur le sol, logos minimalistes, un dirigeable ; toucher le sol = la mort ; `?vitre=spirale` la ville d'avant ; le plafond-miroir derrière `?plafond=1` ; ⚠ dans la ville la profondeur est en 16 bits — rien de caché DANS une tour, voir le journal), `NIV_CANYON`/`genCanyon`/`buildCanyon`/`dbgCanyon`, `NIV_DUNES`/`genDunes`/`buildDunes`/`DN`/`dnHauteur`/`dbgDunes` (LES DUNES D'OR, 18/10 : le moteur de terrain du canyon sur une mer de dunes — le ciel et le soleil de l'heure du canyon, `LVL.canyonA` y vaut 1 ; l'horizon de dunes et les pyramides `uCyDn`), `NIV_GROTTE`/`genGrotte`/`grtTrace`/`buildGrotte`/`GROTTE`/`grtCreuse1`/`grtMailleNets`/`dbgGrotte` (LES PROFONDEURS, 18/10 : les biomes de grotte de Minecraft dans la DA du jeu — un champ de densité creusé autour de la route, une roche low-poly à facettes tirée par « surface nets », une matière `GRT_FS`, lumière cuite en deux canaux, une ambiance par salle — voir le journal),
  `buildVoxCity`/`CITY`, `orbiteBuild`, `PORTAL`/`portailPasse`, `spawnPickups`, `LIGNE`/`ligneTick`.
  LE PORTAIL DE CUBES (17/10, Léo) : `PCUBE` (l'anneau, `pcubePose`/`pcubeDest`/`pcubeTick`), `portDest` (la map d'en face TIRÉE D'AVANCE dans
  `SF.tirage[zone+1]`), la fenêtre sur `assets/portail/*.webp` (`PCUBE_CP`, `dbgCartePostale`), le passage `pcVoile`/`pcVoileSort` (`#portC`),
  `pcubeFranchi` ; `?portail=vite`. L'ancien ovule rose ne reste que dans le PARC (Freestyle). ⚠ Une map nouvelle ou refaite → refaire ses cartes postales.
  LE PRÉ-BÂTI (18/10, Léo) : la map d'en face se BÂTIT pendant qu'on roule vers le portail — `PREB`, `prebTick`/`prebTravaille`, la route de
  buildTrack en générateur `pisteRoute` sur un état fantôme (`prebEchange`, `pisteTravail`), installée au passage (`pisteInstalle`) ; les décors
  d'avance (`prebJade`, `prebDecorG`/`prebDecor` : forêt, volcan, glacier) ; `?prebati=0`, `dbgPrebati()`. ⚠ Dans `pisteRoute` : jamais de
  `scene.add`, jamais d'écriture d'un état vivant hors de la liste échangée ; une génération ou un décor NEUF → `prebChampsDe` / `PREB_PISTES` / `prebDecorG`.
  LES MODULES DE CHAQUE MAP (18/10, Sacha : « au moins 3 par map, sélectionnés automatiquement ») : chaque générateur a SON paquet (≥ 3), mélangé, jamais
  deux fois de suite, dans un hasard à part né de la graine — genCtrl `MCJ`/`mcTire` (ville `mAngles`/`mBretelle`, crypto `mBougie`/`mDents`, vitrée
  `mTour`, orbite `mFronde`/`mHoule`, plus `tSlalom`/`tEpingle`/`tCorde`/`tEsses` des nuages), genBanq `bkSlalom`/`bkEsse`/`bkDouble`, vlcTrace
  `vSlalom`/`vCorde`/`vChicane`/`vHoule`, forPelote `fSlalom`/`fLacets`/`fCorde`/`fRacines`, genCanyon `lien()` → `cSlalom`/`cCorde`/`cWhoops`/`cChicane`,
  genJade `tronc()` → `jLacets`/`jEpingle`/`jSommet` ; leurs tronçons dans MODMARK. `MODC_ON` (`?sans=modcartes` = les pistes d'avant à l'identique),
  `dbgModCartes(0|1)`, `dbgTrace().mods`. Un module NEUF : le garder dans les bornes de cap de son générateur et passer par SON hasard (`rf`, `rm`, `rv`,
  `rf9`, `rj`) — jamais un tirage de plus dans `rnd` quand MODC_ON est éteint. 2e tour (18/10, « trop de tout droit ») : avec les modules, genCtrl serre
  tout (`RS` ×0,9, `rPlancher` = 1,35 × le rayon tenable dans arc(), `VILLE_WM`, `ESP_ROUTE.wm`, entrée des villes 260 + 320 m en virage), le glacier
  et Jade aussi ; LE ROYAUME DE FEU est refait : `vlcTrace3` (la balade des flammes puis la spirale qui monte autour du cône, `vlc3Cone` le cône
  taillé pour elle, portail en haut ; `VLC_BALADE`, `?volcan=v4` = avant, `dbgVolcan('test')` = la règle d'or) ; la forêt allégée (3-4 pointes).
  LA DURÉE DES MAPS (18/10, Léo, v644) : au JOUER une map se compte en SECONDES — 45 s au palier 0, 20 s au palier 25 et au-delà (`DUREE`,
  `dureeCible`, `longueurCible` = durée × `vPalier` × `DUREE_ELAN` × `DUREE_ALLURE[carte]`, le glacier par `DUREE_V`). Chaque générateur lit
  `longueurCible()` (0 hors du JOUER : tout reste à l'identique) et ne raccourcit que le remplissage — genCtrl LEN, glacier LEN à plat, jade
  `jmN`/`FX9`, forêt `nN`, volcan `bal()` (vlcTrace3) / `tient()` (vlcTrace), canyon `tient()` ; PARIS (tracé dessiné) n'y est pas.
  `?duree=ancien`, `?duree=40-18`, `dbgDuree()`. ⚠ Une map NEUVE du JOUER : lui faire lire `longueurCible()` et caler son allure au banc.
  LA FORÊT (17/10, Léo) : les arbres en VITRAIL dans `FOR_ARB_FS` (`dbgVitrail`) ; le slalom des troncs (`forZigzag`), ses ponts et la mousse ont été retirés le 18/10 (voir le journal).
  LA VILLE (16/10) : toujours la nuit, quatre temps (pluie, nuit, brouillard `villeBrume`/`LVL.brume`, orage) × quatre TEINTES tirées au hasard
  (`VTEINTES`, `vtRgb`/`vtBio`/`vtGo`/`vtPose`, uniforms `skyU.uFd`/`uVc`, `CITY.uPiedC`, `ROAD_U.uBmM` ; `?teinte=`, `dbgTeinte()`).
  LA VILLE, NÉON ET VERRE (18/10, Sacha) : les GÉANTES DE VERRE de la ville vitrée poussent dans la ville au néon (le skyline) — `VILLE_VERRE_V`,
  `villeVerreTour` (tiré de la position, aucun `vr`), `VIt` dans batir, `vitreMatFab(true)`/`vitreMatToursNeon`/`vitreMatToursNeonLoin`, `VV`/`villeVerreTick`,
  `vitreVerre(CB)` (le verre de la vitrée = `VIT_VERRE`, inchangé), `VV_VERRE` ; la vitrée quitte le JOUER (`SF_HORS`, `?vitree=1`) ; `dbgVilleVerre()`.
- **Ciel et décor** : `BIOMES`/`bioApply` (le SEUL écrivain des lumières), `skyDome`, `CIEL2`, `COTON`/`CLOUDS`/`buildClouds`/
  `updateClouds`, `paintEnv`.
- **Caisses** : `CARS` (les fiches), `CAR_UNLOCK` (prix et conditions, même index), `SHAPES` (les gabarits), `buildCar`, le kit
  low-poly `lpKit`/`lpMat`/`lpWheel`, tuyères `CAR_POTS`/`potMonde`, raretés `RARETES`/`carRar`/`rarListe`/`carOrdre`,
  `carUnlocked`/`carUnlockedVrai`/`carOwned`/`carRetiree`, vignettes `carPhoto` (et `aileFile` : la photo d'une aile, sur la caisse équipée).
- **Plaque d'immatriculation et profil** (17/10) : `PLQ`, les neuf modèles `PLQ_MOD` peints par `plqPeint`, la pose sur TOUTES les caisses
  `plqPose`/`plqCherche` (des rayons, dans buildCar ; `PLQ.pos` par caisse), l'atelier `#plq`/`plqOuvre` (au premier accueil : `plqGuette`),
  le profil `#prof`/`profOuvre`/`profChiffres` (le trophée du garage `#gProf`, `plqGarage`), la sauvegarde `SAVE.d.plq` et `SAVE.d.prof` (`plqHorloge`).
  Le CLAVIER du téléphone (18/10) : tant qu'on écrit, l'atelier se pose sur la partie visible (`plqClavier`, `#plq.clavier`, `visualViewport`) —
  la plaque, le champ et son dé, RETOUR · VALIDER ; le dé garde le clavier ouvert ; la page revient en haut quand il se range. `?plqclavier=0`
  = comme avant ; `dbgPlaque('clavier',h)` simule un clavier qui laisse h px visibles (le banc n'a pas de clavier virtuel).
- **Boutique, habillages, figures** : `COSM` (peinture · aile · trainee · figure), `SHOP`, `shopBuy`, `shopOwned`, `shopEquip`, `cosm`,
  `FX_EFF`, `BQ_CATS` (les RAYONS de la colonne de gauche : VOITURES · ACHAT · PEINTURES · AILES · TRAÎNÉES · FIGURES ; `bqRayons`), `bqAchat`
  (toutes les caisses payantes), `bqEphemeres` (les quatre de la semaine, plus montrées en boutique), la salle blanche 3D `GBQ`/`garBqBatit`/`garBqPanneau`, `gShopJour`,
  `figAchat`/`figPossede`, le FILM AU RALENTI d'une carte FIGURES `figFile`/`figFilm` → `filmPose`/`filmJoue` (studio commun `photoStudio`, pellicule `photoDevPrep`), `eurTxt`, `shopPaye` (la porte StoreKit : elle refuse tout aujourd'hui).
- **Garage et menus** : `openGarage`/`closeGarage`/`garageRender`, `garMode`/`GMODE`, `GAR`, `garLibre`/`garCadre`, `invOuvre`,
  `hubSync`, l'accueil au ciel `chuteRender`/`CHUTE`/`TITRE_H`, la coque `#mob` (`mGo`, `mTap`, `#mHome`,
  `#mDead`), `ecranWipe`, `modale`, `toast`, `uiGarde`, MISSIONS v2 `M2`/`m2Etat`/`m2Val`/`m2Tick`/`m2Prend` (sauvegarde `SAVE.d.m2` ;
  l'ancien système des carnets est retiré le 18/10 : `SAVE.d.mis` reste lu par `carStat('carnet')`, `m2MigreV2` et le cadeau `popCarnets`/`misPop`).
- **HUD** : `#hud`, `hudColonne` (sa mesure `hudColMesure` passe par `apresMiseEnPage`), `hautPasse` (une carte à la fois), `slam`, `trickMsg`, `flowHudMaj`, `ajTick` (la couche `#ajVols` des éclairs de nitro),
  `VOLG` (les gains qui volent vers leur jauge), `airPieDraw`, `#tNitro`, pause `#tGear`/`#tPanel`/`panSync`, `HAS_D`/`hasMaj`.
- **Économie** : `bank()` (= `SAVE.d.bank`), `DENOMS`/`ECO3`/`denom()`, rangs d'aura `AURA_RANKS`/`auraRank` (13 depuis le 14/10), moteur `ENGINE_TIERS`/`engTier`/`coinsGot`/`addCoins`,
  aura `CHA`/`chaineAura`/`CHA_VIE`, flow `FLOW`/`FLOW2`/`FREN`/`flowAdd`/`flowMult()`, pouvoirs `PWR_DEFS`.
- **Nitro** : le bloc `<<<NITRO2>>>` (la loi du réservoir), `NIT`, `nitroGain(q,src)`, `nitroTientDe`, `nitroOn`, `NFX`/`nitroAllume`,
  le grand livre `LIVRE`/`livre`/`dbgLivre`. LA FIGURE SE PAIE (17/10, loi 6, `NITRO2.figN`) : 20 % au lancement, 40 % par figure
  LANCÉE à la pose réussie (30 % jusqu'au 18/10), cumulable, le trop-plein dans la réserve bleue (17/10 soir) — `figNitCout`/`figNitPaye`/`figNitRend`, `FX2.nitL`
  (lancements) / `FX2.nitF` (plantées), `dbgFigNit()`.
- **Bords de la route** (18/10, Léo) : une couleur de BASE par map (`BMAP_PAL`, `bmapCle`, `bmapPeint` dans `bordsTick` : rails, nappe, liseré `ROAD_U.uAcc` ;
  la ville garde ses teintes) et au boost le SCINTILLEMENT RGB (`bmapBoost`, `BMAP_U`, peint par `traitMat` sur l'abscisse `aS`). `?bordsboost=0`, `dbgBordsMap()`.
- **Lumières de la caisse** (17/10) : phares, feux arrière, feu du nitro, flamme du moteur et traînées ÉCLAIRENT LE BITUME dans son shader (`LUM_GLSL`/`lmRoute`,
  uniformes `LUM_U`, `LM_N` lampes-segments + deux phares ; `lumTick` les pose en monde, `lumVue` — chaîné sur `scene.onBeforeRender` — les passe en vue ; réglages
  `LUMK`) et la lueur des feux allume la CAISSE et sa lunette (`FEU_U`/`FEU_GLSL`, bloc VOITURES) — aucune lumière three.
- **Effets** : traînées de lumière `LUMT` nées des feux arrière `CAR_FEUX` (`dbgFeux`), sillages `SILS`/`mkSillage`/`sillageStep`/`trailStep`, plumes `JETS`, `rainbow`, `WOWT`/`wowStep`, les TRAÎNÉES POP
  `TRX`/`TRX_EMET`/`trxStep`/`trxApercu`/`trxPlanche` (17/10 : chacune son ALLUMAGE `debut`, son ruban à tempérament `sil` → `SIL_STY`), l'aperçu des rubans en vraie lumière depuis les feux `silApercu`/`silRuban`, la salle blanche en ENCRE `SIL_ENCRE`/`silBlanc`, la vitrine qui vrombit `SILPV.cy`, les AILES `AILES_POP`/`ailForme`/`ailAnime` et LES AILES VIVANTES (16/10 : l'état commun `AILV`/`ailvTick` — boost, virage, montée, vitrine du garage —, `ailB` = ce qui bouge, que la soudure laisse en place, `ailBat`, `ailCoupe`, `ailEtincelles`, la pose de photo `ailvPose` ; leurs SONS `ailSon` → `ailes.*`, en vol seulement),
  pluies d'argent `PLA`/`RICH`, particules `makePool`/`spawnP`, la flamme des pots `JETS` menée par le
  moteur simulé `FLM`/`flmPas`, le nitro en feu de pixels `NFEU`/`nfeuPas` (`?flamme=ancien`) et son jet propulsé (`NFEU_JET`), hors nitro le
  même feu en minuscule pour le MOTEUR (`NFEU_MINI`, `?moteur=goutte` ; une gerbe de petits cubes qui crépite dans tous les sens — il remplace
  les éclats `ECLATS`).
- **Son** : `sfx(id,o)`, `son(id,repli)`, `SONV2`, `uiClic(rôle)`, `hap(p)`, `MASTER`, `PORTES`/`stt`, `initAudio`,
  `SON_TON`/`sonTonSuit`, `ECH`/`echSt`. Fichiers : `sfx.js` (lecteur), `sons-banque.js` (banque cuite),
  `atelier-son/` (`recettes.js`, `cuire.js`), `sons.html` (banc d'écoute).
  Le son de la NITRO : LE FEU QUI RUGIT (16/10) — `RUG`/`rugTampons`/`rugPas`/`rugAllume`/`rugPetarade`, `RUG_NIV`, `dbgRug()` ; `?nitroson=ancien` = avant.
  Le CRISSEMENT de la course : LA GOMME DOUCE (16/10) — `GOM`/`gomBatit`/`gomPas`, `GOM_NIV`, `dbgGomme()` ; `?crisse=ancien` = avant (l'ancien `skidG` reste au burn-out).
- **Musique** : en course, POUCE BLEU joue seul (`pbjRegne`, `assets/audio/pouce-bleu-jeu.js`) ; `MENU_MUS` (le ciel et le garage du menu),
  `ECOLE_MUS` (PREMIER MATIN, l'auto-école), `MUSIC_TRACKS` (le pool de la radio : UN morceau, ne pas le vider — l'auto-école ne partirait pas),
  `musicTick`, `musicJoue`, `playMusic`, `musicLieuVoulu`, `MUS_TAIT`, `DEPMUS`, `INSTRU` (coupé). La radio des niveaux, GLISSE V2 (JMUS),
  `?musique=niveaux` et `?ecole=` sont partis (allègement du 18/10).
- **Sauvegarde** : `SAVE` (clé localStorage `cashcarSave`, `def()`, `san()`, `flush()`, `mark()`, `export()`/`import()`),
  le code caché `codeCousin`/`cousin()`.
- **Langue** : `LANG`, `TR`, `I18N`, `I18N_ZH`, `applyLangDOM` (`data-fr`), `majPix`, `sansAcc`.
- **Éditions et appareils** : `POKI`, `CC_PK`/`KITS`/`pkPasse`, `TEST_CAISSES`, `FACILE_OK`, `IS_MOBILE`, `TEL_NATIF`, `FORCE_TEL`,
  `SIMU_JEU`, `BALADE`.
- **Perf** : qualité auto `QL`/`QLR`/`qlSonde`, résolution `applyDPR`/`applyQ`/`curDPR`/`DPR_CAP`/`DPR_MIN`, chauffe
  `chauffeRendu`/`chauffeDivers`/`engChauffe`/`atelierChauffe`, sursis `MAT_SURSIS`/`CAR_GARDE`/`ENG_GARDE`/`PISTE_GARDE`, `SCENE_TOUJOURS`,
  `VP`, `pisteTranches`, `LFB_SANS_PL`, `LFB_ROUTE_LUM`, `atelierLampes`.

---

## 4. Les règles qui tiennent

**Code**
- Le style compact du fichier ; commentaires en FRANÇAIS, datés et signés (`(2026-10-14, Léo : « … »)`), qui disent POURQUOI.
- Un commentaire au MILIEU d'une ligne s'écrit `/* … */`, jamais `//` (voir piège n° 1).
- Perf : rien n'est alloué dans la boucle (on réutilise les vecteurs `tmp…`), particules en pools ; le DOM n'est écrit QUE si la
  valeur change ; `VP.w`/`VP.h` au lieu d'`innerWidth` ; aucune `new THREE.PointLight` en course (une lumière de la caisse sur la route = une lampe de
  `LUM`, voir `lumLampe`) ; toute matière neuve est chauffée
  au menu : **zéro programme compilé en course**, à mesurer ; `scene.onBeforeRender` se CHAÎNE ; objets immobiles en
  `matrixAutoUpdate=false`.
- Un seul écrivain par réglage : `bioApply` pour les lumières, `nitroGain(q,'source')` pour toute nitro, `sfx('famille.nom')`
  pour tout son (jamais un oscillateur bricolé sur place), `vFrein(k)` pour toute vitesse perdue d'un coup (choc, pose : jamais `vA*=k`
  en conduite, ça saute d'une image à l'autre — « LA DERNIÈRE PASSE DE FLUIDITÉ » au journal).
- Le hasard de la piste (`rnd`) est consommé en séquence : un tirage neuf dans la génération prend son PROPRE flux
  (`mulberry32(graine^…)`), sinon toute la piste en aval change.
- On MESURE avant d'affirmer : chiffres ou image, avant / après, et on les note au journal.

**Jeu (verdicts tenus — ne pas les défaire sans demande)**
- Zéro assistance de conduite (`ASSIST_VIRAGE=0`, `AIR_ASSIST=0`) : pouce lâché, la caisse garde son cap et sort dans les virages.
  Le mode FACILE (la seule exception) est retiré (coupé le 14/10, code arraché le 18/10) ; `SAVE.d.facile` reste seulement lu à la sauvegarde.
- `AIR_RATE=1` : le temps du vol n'est pas accéléré. Le virage en vol ne suit pas la vitesse (voulu).
  Son autorité, elle, a monté (18/10, Sacha : « des virages serrés ») : UNE formule, `lacetVol` (`VIRVOL` : lacet ×1,5, plafond plus haut,
  verrou du volant au décollage 0,35 s) ; `?virvol=0` = avant, `dbgVirVol(k,cap,latch)` pour régler en direct.
- En vol, pouce HAUT = la caisse MONTE (`volSens`) ; au clavier ↑ piqué, ↓ cabré.
- La loi du réservoir : le vol dépense la nitro, la route la remplit — sauf les FIGURES PLANTÉES, qui en rendent tout de suite (Asphalt 8, 14/10).
- Les figures sont de la PHYSIQUE (14/10, Sacha) : des explosions qui s'additionnent, l'inertie, le planté ; l'aura des figures n'est gagnée qu'à la pose.
- Les figures paient en AURA ; l'argent vient des pièces, des portails et des primes.
- Plus aucun looping (code retiré le 18/10) ; PARIS n'est PLUS une map du mode classique (18/10 au soir, Sacha : « enfait enlève paris du mode classique ») :
  pas d'entrée dans `SF_CARTES`, pas de chauffe au menu ; son code reste (voir NIV_PARIS pour le remettre).
- LES MAPS COMME UN TOUT (17/10, Sacha) : nuages, canyon, forêt, glacier, volcan et orbite suivent UNE recette par temps (`CONTI` : saturation, vignette,
  contre-jour rose, bitume commun `rtT`/`rtA`, ciel continu `uCiel2`, la nuit à deux températures) ; la VILLE et le JADE n'y sont jamais (`contiMap()`).
  Une retouche de couleur d'une de ces six maps se fait DANS `CONTI` (temps, nuits, cielJ, jours), pas dans une passe à part.
- LA MAP NUAGES EST UNE COURSE (18/10, Sacha : « trop peu de virages… ça reste un jeu de course ») : sur la route sans haut ni bas, zoom `TORD_AMP` 1,1, poids `TORD_W`,
  modules de COURSE (`MODT` : slalom, épingle, double corde, esses, montagnes russes, rayons VRAIS ≥ 1,7 × le rayon du palier), dévers `TORD_DEVERS`, et
  `pisteTordPropre` qui rejoue les vrilles si la route se touche. Une retouche passe par le banc des virages (journal).
  EN L'AIR AUSSI, PAS DE HAUT NI DE BAS (18/10, Sacha : « la voiture a du mal à voler, comme si le jeu n'arrivait pas à savoir de quel côté de la route on va ») :
  `VOLR` — en vol, gravité, plané du nitro, équilibre de la caisse et de l'écran, viseur, BUMP et prédictions des figures suivent la normale de la dalle
  survolée (face quittée) ; on retombe sur sa route qu'elle soit à plat, sur la tranche ou à l'envers. Ailleurs, le bas du monde au chiffre près.
  `?sans=volroute` = avant, `dbgVolRoute(false)` en direct. Banc apparié : `cc-banc/volcote.cjs` (journal).
- LE GLACIER EST UNE PISTE DE GLACE (17/10, Sacha : « plus de route ») : (196 m, pics sur la piste, tremplins pour s'envoler ; plus de lacs gelés ni de stalactites depuis le 18/10). Les satellites de l'orbite FLOTTENT au bord de la route, décor pur (17/10 soir, Sacha : « je voulais juste qu'ils flottent proche de la route » —
  `orbiteBuild` §0 bis) ; les obstacles SUR la route de l'après-midi sont retirés (18/10).
  (18/10, 3e tour) le bord n'est PLUS un mur : LA CONGÈRE (`bkCongere`, `BK_CG`) — 16 m de neige profonde où l'on s'enfonce et ralentit fort,
  jamais de mort (Sacha : « on doit pas mourir ») ; pente 40-50° pour de vrai (`BK_PENTE4` est une TANGENTE : 43° de moyenne) ; TREMPLINS
  de 36 m × 7 m à chevrons orange et balises (`BK_BEC`, `bkBecMesh`) ; ~4 × moins de pics ; (19/10) caméra plus haute (`camGlacierM`, monte 2) ;
- LA VILLE EST TOUJOURS LA NUIT (16/10, Sacha : « la ville-jour, ça marche pas : on abandonne toutes les maps ville-jour ») : ni matin, ni midi, ni soir au
  JOUER ; ses variations sont des TEINTES (violet = la base, vert, jaune, bleu) et des temps de nuit.
  LA VILLE VITRÉE N'EST PLUS UNE MAP DU JOUER (18/10, Sacha : « fusionne les maps ville et ville vitrée ») : ses géantes de verre vivent dans LA VILLE,
  le néon au pied, le verre dans le ciel ; `?carte=vitree` la joue encore, `?vitree=1` la remet au tirage. Une map hors du tirage → `SF_HORS`.
- LES MISSIONS v2 (16/10, Sacha : « des MISSIONS libres à la place des carnets ») : toutes ouvertes, une seule liste, des SECRÈTES qui donnent des
  caisses (silhouettes noires en boutique, jamais en 3D avant d'être gagnées) ; un objet de mission ne s'achète plus. (Les carnets, `?missions=v1`, sont retirés le 18/10.)
- Plus de CARRIÈRE : coupée le 14/10, retirée du code le 18/10 (niveaux, écrans, campagnes NUAGES et VILLE, SAUTE-MOUTON) ; la carrière
  d'avant vit sur la branche `garde/carriere`. Les missions restent ; LA CAISSE-NUAGE et LE LINGOT s'achètent (1,8 M / 2,2 M), gagnées en
  carrière = à toi (`exK`/`exV`, `SAVE.d.carr` reste lisible).
- Plus aucune VOIX : ni annonceur, ni réplique, ni synthèse vocale (code retiré le 18/10 : `annSpeak` ne rend plus que le texte, `SAVE.d.vox` reste lu).
- Plus de SNAKE LOOP, de NITROOO / PURE SPEED / AIR NITROOO, de MÉTÉORE (ni cratère ni pluie de débris) : coupés le 15/10, arrachés le 18/10 (`vitMult` garde le plafond ×2,6).
- PLUS D'ANIMAUX (15/10, Léo : « avec les figures ça n'a plus sa place, ça prend trop de place ») : dauphins (créatures + figure LE DAUPHIN + #dolHud),
  serpent néon, dragon de feu de NITROOO (`DRG`/`DFEU`), singes de la course : ARRACHÉS du jeu (index.html −215 Ko). Le modèle du dauphin, la
  recette VITRAIL et le singe vivent dans `creatures/dauphin.js`, `creatures/vitrail.js`, `creatures/singe.js` (lus par les boîtes, et
  chargés par le jeu depuis le retour PAR MAP). Le reste : git (85470fb4 et avant).
- LES ANIMAUX PAR MAP (15/10, Léo : « soleil jade singe va sur main et dauphins aussi ») : au SOLEIL DE JADE seulement — les SINGES (décor :
  coucou sur une montagne, mangue, course, assis au bord ; `jsgTick`) et les DAUPHINS DE LA MER (v2 : dès qu'elle TOMBE vers la mer ils bondissent
  au-devant d'elle, puis jouent devant elle dans l'eau, l'un fait coucou à la portière, et une fois sur deux ils SAUTENT AVEC ELLE ; `jdmTick`). Les formes
  des singes se calculent dans un Worker (`creatures/atelier.js`). Détail : JOURNAL.md. Pas de figure LE DAUPHIN.
  17/10 (Léo : « plus petits, un peu trop grands ; imprévisibles : soit te suivre, soit sauter, soit… ») : `JSG_TAILLE` .45 (11-14 m de
  haut → 5-6 m ; `?singetaille=` pour essayer) ; chaque rencontre TIRE sa réaction (`JSG_ACT`) : SUIT (galope à côté de la caisse, un peu
  devant), SAUTE (bond par-dessus la caisse, d'un bord à l'autre), PLONGE (dans le vide), RESTE ; celui de la montagne saute jusque sur la
  route puis suit. Balistique dans le repère de la route (`jsgBouge`, `jsgReveil`). `dbgJadeSinges('mangue','saute')`.
- Textes au centre de l'écran rayés par Sacha (VIRAGE SERRÉ, FRÔLÉ, PORTE, RASE-BORD, MINI/SUPER/ULTRA TURBO, pastilles sous
  le verdict ; le 15/10 : « +X AURA » de la chaîne, « ×5 EN FEU / ×8 / ×10 », le « ★ +N AURA » du dauphin, « FIGURE +N » sur la caisse) : on ne les rallume pas ; un nouveau texte au centre se propose d'abord.
- HUD de course allégé par Sacha (15/10, `<style id="hudAllege">`) : plus de jauge d'aura « MOY » (retirée le 18/10 avec `?jauge=1`), plus de
  liste des figures sous la chaîne, plus de « $×1 » au palier 0 du flow, plus de nom du pouvoir au centre. On ne les rallume pas sans lui.

**Interface (charte v4/v5 — pour tout écran neuf ou retouché ; de vieilles règles CSS y dérogent encore)**
- PENCHÉ (`--sk`) = je touche · DROIT à coins coupés = je lis · ROND = une jauge.
- L'OR = UN lingot par écran (l'unique action principale) et le vrai argent (€) ; l'argent du jeu en vert (`--cash`) ; cyan =
  aller voir ; magenta = boutique ; rouge = danger. La rareté se dit par sa couleur (`RARETES`).
- On LIT en haut, on TOUCHE en bas ; cibles de 44 px ; bords via les safe areas `--sT`/`--sB`/`--sL`/`--sR` ; une seule courbe
  `--ease`, deux durées `--t-fast`/`--t-slow`.
- UNE SEULE POLICE, PARTOUT : Press Start 2P (locale, `--pix`) — aucun texte du jeu dans une autre police, écran, bannière, champ de saisie
  ou texture (Sacha, 15/10 : « il faut pas que je te le répète »). Deux FILETS la garantissent : `<style id="policeUnique">` (tout élément,
  tout champ, en `var(--pix)!important`) et `UNE_POLICE` (tout `ctx.font` de canvas réécrit en pixel, à 62 % du corps, sans gras) ;
  SEULE EXCEPTION VOULUE (18/10, Sacha, au quiz : « une police par rareté ») : le NOM des figures en course (`#fh`, `#fhLeg`, porteurs de
  `data-rp`) prend une police PIXEL selon sa rareté — Silkscreen, Jersey 10, Sixtyfour, Jacquard 12 (`assets/fonts/`) ; ne pas l'étendre ailleurs sans lui.
  `apresPolice(f)` redessine une texture peinte avant que la police soit chargée ; `garde-charte.sh` refuse une version sans eux. Un texte
  long : `--f1` (10 px), interligne 1,6-1,7, graisse 400 ; une note : `--f0`. Seule exception, nommée : le φ de `#spPhi` (logo).
  Elle n'a PAS de capitales accentuées : tout libellé passe par `TR()` (qui applique
  `majPix`) ou `sansAcc`.
- Ni emoji ni glyphe système dans l'interface : icônes pixel `pxi('nom')` (grilles `PXI_G`).
- Ni `backdrop-filter`, ni dégradé dans un texte (le logo excepté), ni `body:has(…)` pour le HUD (une classe dans `HAS_D`).
- Chaque appui répond : visuel + `uiClic(rôle)` + `hap(p)` (jamais `navigator.vibrate` en direct).
  Un bouton oublié est rattrapé par le FILET (`uiFiletRole` : il sonne si rien n'a sonné) ; `data-muet` s'en passe. Dans la pause aussi (`pauseSon`).
  Le VISUEL a son filet aussi (17/10) : L'APPUI POUR TOUS — toute chose touchable hors `APPUI_SEL` se tasse au contact (`scale` ×0,94 par
  l'API d'animation, sans toucher à ses transitions) ; `?appui=0` l'enlève.
- Le VOLET pixel (`ecranWipe`) = un changement de DÉCOR (atelier ↔ course, fin → accueil, garage ↔ accueil). Une PAGE posée sur l'accueil
  (réglages, achat, modes) passe en direct par-dessus l'atelier-menu (`surAccueilCiel`, 17/10) ; `?menupasse=0` = sous le volet.
- Tout texte affiché passe par `TR('TEXTE FR')` avec son entrée `I18N` (§6).
- Couché ET debout : l'ordi montre le téléphone couché ; chaque écran se vérifie dans les deux sens.

---

## 5. Tester

**La syntaxe** (`node --check` ne lit pas du HTML ; un `<script>` cité dans un commentaire HTML avale le bloc suivant). Écrire
ce `chk.js` dans son scratchpad, puis `node chk.js "VERSION PRINCIPALE/index.html"` :
```js
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
let s=fs.readFileSync(process.argv[2],'utf8').replace(/<!--[\s\S]*?-->/g,m=>m.replace(/[^\n]/g,' '));
const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0,ko=0;
while((m=re.exec(s))){const f=path.join(os.tmpdir(),'cc-chk-'+(i++)+'.js');fs.writeFileSync(f,m[1]);
  try{cp.execFileSync(process.execPath,['--check',f],{stdio:'pipe'});}catch(e){ko++;console.log('bloc '+i+' :\n'+e.stderr);}}
console.log(i+' blocs, '+ko+' en erreur');process.exit(ko?1:0);
```
La syntaxe ne suffit pas : un code avalé par un commentaire passe le contrôle. Il faut lancer le jeu.

**Servir** : `cd "VERSION PRINCIPALE" && python -m http.server <port>` (8000 est le port de JOUER.bat, celui de Sacha : en prendre
un autre). En `file://` les voix et le décodage WebAudio meurent sans bruit.

**Les bancs** : Puppeteer (celui de `C:/Users/sacha/Desktop/projet-161/node_modules`) + le Chrome du système
(`C:/Program Files/Google/Chrome/Application/chrome.exe`), sans fenêtre.
- **Son coupé, toujours** : `--mute-audio` ET une sauvegarde muette posée avant le chargement (`localStorage.cashcarSave` avec
  `sfx:false, mus:false, vox:false`). Le panneau navigateur intégré joue le son chez Sacha et ne rend pas WebGL : pas pour le jeu.
- **Un banc à la fois**, court, tué dès qu'il a mesuré : la carte graphique (RX 6600) et le processeur sont ceux de Sacha, qui joue
  pendant ce temps — ses « gels » viennent souvent de nos bancs. Au moindre agacement, tout arrêter. Ne jamais tuer le banc d'une
  autre session : le signaler.
- Roblox Studio tient la carte → Chrome D3D11 cale : `--use-angle=swiftshader` (rendu logiciel, plus lent).
- **Le cadre de l'ordi** : le jeu tourne dans une iframe zoomée ; un clic = rectangle de l'iframe + rectangle interne × zoom.
  `?colonne=0` = plein écran sans cadre, `?colonne=portrait` = debout, `?tel=1` force le téléphone.
- **Le parcours de Sacha** : à la SOURIS, dans le cadre, chaque bouton avant / après une / après deux parties (certains boutons ne
  mouraient qu'après une mort). Les bancs en tactile émulé ne voyaient pas ces bugs.
- **Pièges de banc** : ne jamais `remove()` `#splash` (attendre qu'il parte) ; un `visibilitychange` simulé porte `bubbles:true` ;
  le jeu se met en PAUSE quand l'onglet est caché ; `dbgStep` dans un appel séparé du clic de départ ; le profil Chrome garde le
  service worker → `Network.setBypassServiceWorker`, sinon on photographie une vieille copie ; les `const` du jeu ne se lisent pas
  depuis la page (IIFE) : passer par `dbg*` ou le DOM.
- **Faux positifs connus** : le 404 de `assets/audio/music/dark-triad.mp3` (repli prévu) ; les avertissements WebGL « READ-usage
  buffer » à l'écran de fin ; `#auraV2` à −4 px (son animation d'entrée) ; les chevauchements voulus `#engBig`×`#slam9` et
  `#dolHud`×`#lvlBan` ; +8 nœuds DOM par partie (le TOP 10).

**PASSE PERF 18/10 — le banc de perf et ce qu'il a trouvé** (le récit et les chiffres : « LA PASSE PERF DU 18/10 » au journal)
- Banc : Chrome sans fenêtre en iPhone (390 × 844 ×3, tactile, UA iPhone), NETTE, `?palier=2`, processeur ×4 posé APRÈS le menu, `dbgSable(1)`,
  `dbgQual(0)`, pilote auto sol puis vol. Compter les COMPILATIONS en accrochant `linkProgram` avant le chargement ; nommer un programme neuf en
  comparant sa clé (`renderer.info.programs`) à la plus proche, champ par champ. Chronométrer SANS le profileur (il déforme les images longues),
  et seulement au calme (`uptime` < 8) : les compteurs (appels, triangles, compilations) ne dépendent pas de la charge.
- Corrigé : plus aucun programme compilé en course au CANYON (`canyonChauffe` + les matières double face `cyMonuMats().b/.g`) ni APRÈS LE GLACIER
  (`PISTE_GARDE` : la 1re matière de route de chaque programme n'est jamais libérée). ⚠ Une map dont la route ou le décor ne reprend pas les
  matières de la précédente tue leurs programmes : vérifier la map SUIVANTE, pas seulement la sienne.
- Le reste du coût est le LOOK (appels de dessin) ou la PUCE : il se mesure sur un vrai téléphone, `…/jouer/?banc=1&refaire=1`.

**Crochets de console utiles** : `dbgState()` · `dbgAuto(1,lat,{vol,nit,saut})` (pilote) · `dbgStep(n,ms)` (la boucle à la main)
· `dbgView(a,d,h)` (mode photo) · `dbgSaut()` (= NIVEAU suivant, pas un saut) · `dbgDauphin(…)` (s'envoler) ·
`dbgClassique(carte,meteo)` · `dbgNiveauJade()`/`dbgNiveauCrypto()` · `dbgEquipe(i)`/`dbgCar(i)`/
`dbgPhoto(i)`/`dbgBqVoir(i)` · `dbgSon(id)`/`dbgVu()` · `dbgLivre('ouvre')` · `dbgFren()` · `dbgVol()` · `dbgBurn()` · `dbgFlamme()` ·
`dbgQual()`/`dbgDPR()`/`dbgPerf()` · `dbgAppels(n)`/`dbgProgsListe()` (traquer une compilation en course) · `dbgMaj()` · `dbgPoki()` ·
`dbgLum({…})` (les lumières de la caisse : état, réglages `LUMK` à chaud, `off`/`frein`/`nitF` pour les bancs) · `dbgLumVue(d,h,az)` (photo de poursuite dans le
repère de la caisse) · `dbgLumReprise()`.

**Adresses utiles** : `?perf=1` (moniteur) · `?banc=1` (le banc de perf à lancer sur un VRAI téléphone) · `?poki=1`, `?crazy=1` ·
`?carte=jade&meteo=orage` · `?carte=canyon&meteo=soir` (`?cyw=0` : sans travailleur) · `?niveau=jade`, `?niveau=crypto` · `?heure=nuit` · `?simu=1`.

**Les outils de Léo** (locaux, retirés du site par `vercel-build.sh` et des portails par `poki-construire.js`) : `simulateur.html`
(`python3 simulateur/serveur.py 9101`), `maps-ciel.html` (`python3 maps-ciel/serveur.py 9019`), `salle-blanche.html`,
`boite-dauphins.html`, `boite-singe.html` (elles lisent `creatures/*.js`), `bibliotheque.html` (la bibliothèque des sons, avec son serveur
`atelier-son/serveur-moteur.py` ; plus publiée depuis le 18/10). `boite-figures.html` est EN LIGNE (/jouer/boite-figures.html).
**Les MAPS DU JEU** (15-16/10, Léo : « une liste des maps qu'on a sur le jeu, pour appuyer dessus, aller voir dedans et te donner des
changements ») : `repertoire-maps/index.html` = la liste (photo + nom) des maps que JOUER tire au hasard (`SF_CARTES`) ; un toucher →
`voir.html?carte=<id>&meteo=<m>` = le vrai jeu dans un cadre 844 × 390, JOUER touché pour lui, la map gardée armée (`dbgClassique`) aux
portails et aux relances, météos dans la barre. Liste : `repertoire-maps/maps.js`. Une MAP NOUVELLE dans SF_CARTES → une ligne dans
maps.js + `python3 repertoire-maps/banc/photos.py <id>` (photos dans le vrai jeu, muet). Servir VERSION PRINCIPALE en http.
**Les NOTES DES MAPS** (17/10, Léo : « une page locale sur laquelle je pourrai retoucher chaque map » → « notes seulement ») : dans
`voir.html`, le panneau NOTES (à droite, ou en bas sur un petit écran) — il écrit ce qu'il veut changer ; chaque note garde la météo et
l'IMAGE du jeu à cet instant. Servir par `python3 repertoire-maps/serveur.py 9244` (il écrit les notes) ; elles vivent HORS du dépôt dans
`~/Downloads/CAR-notes-maps/` : `notes-maps.txt` = ce qu'on lit (map par map, [ ] à faire, id, chemin de l'image) ; une note faite dans le
jeu → `python3 repertoire-maps/serveur.py fait <id>` (coche verte, vue par la page en 5 s). Le compte « n notes » s'affiche sur la liste.

---

## 6. Recettes

**Ajouter une caisse** (4 endroits, tout le reste s'en déduit)
1. La fiche à la FIN de `CARS` : `{name, shape, color, accent, maxKmh, accel, turn, h, w, l, spoiler, rar, fx:{jet,core,trail,light},
   desc}` (+ `pots:[…]` si ses tuyères ne se trouvent pas seules ; une caisse de plus de 1,5 m de haut recule la caméra).
2. La condition à la FIN de `CAR_UNLOCK`, même index : `{p:prix}`, `{k:'carnet',v:n}`, `{k:'premium',eur:'x €',rar:'leg'}`…
3. Le gabarit `SHAPES.<shape>` : dans le bloc « LA GAMME DES 50 » (`nom:function(K){…}`) ou juste après sa balise FIN
   (`SHAPES.nom=function(K){…}`), avant le premier `buildCar`. Un détail de flanc se pose sur la fonction de largeur du gabarit,
   jamais à un x constant. Aucun nom ni logo de marque.
4. La traduction : `Object.assign(I18N,{"LE NOM":"THE NAME","desc française":"english desc"})`.
Puis `sw.js` +1 et une section au journal. Vérifier : `dbgCar(i)`/`dbgPhoto(i)`, la boutique (`dbgBqVoir(i)` : les mini-ailes ne
se voient que là), la course (`dbgEquipe(i)`), le garage du jeu (la salle blanche grise les noirs).
**Retoucher une caisse** (le redesign voiture par voiture, 17/10) : budget, pièges et méthode → « L'ELDORADO v3 » au journal ; le banc
`outils/banc-caisses/` (le gabarit au studio, la caisse dans le vrai jeu, la planche AVANT | APRÈS, SANS TOUT CASSER).
**D'après un plan coté** (une vraie voiture) : la tôle CONSTRUITE sur les courbes du plan et les vitres DÉCOUPÉES le long de ses contours
(`peintPlan`), contrôlées au banc des écarts → « LA PERLE AU PLAN » au journal.
⚠ Jamais retirer ni insérer une ligne au milieu de `CARS`/`CAR_UNLOCK` : la sauvegarde désigne les caisses par leur INDEX.
Retirer une caisse = `retire:1` dans sa fiche (`san` rembourse les acheteurs), puis réduire la fiche à `{retire:1,name:'…'}` : le nom suffit
(index des sauvegardes, mission qui la donne, message de remboursement) ; en la remettant dans le jeu, retaper sa fiche (git) et son prix dans `CAR_UNLOCK`.

**Ajouter un obstacle qui tue** (« L'IMPACT » au journal) : son test `xxxHeurt(p)` PUR (vrai dans l'obstacle), puis dans la chaîne de vol
`impPrep(xxxHeurt,cause,marge);explode(cause);` — `marge` = de combien le test déborde de la vraie paroi. Rien d'autre : la même animation
partout. Un mur EN CONDUITE : `impMur(out)` avant `explode`. Vérifier : `dbgImpact()` puis `dbgImpactEtat()`.

**Ajouter un habillage** (le 14/10 : « LES HABILLAGES POP » au journal)
- Une ligne dans `COSM.peinture` / `COSM.aile` / `COSM.trainee` : `id` (2 à 12 lettres a-z, sinon `san()` perd l'achat), `n`, `d`,
  `p` = prix sur la grille (commune < 4 k · rare < 16 k · exotique < 60 k · épique < 250 k · légendaire < 900 k) OU gagné par
  une MISSION v2 : une ligne dans `M2` dont `r:{cat,id}` le donne (le patch pose `mis2` et retire le prix ; l'ancien `mis:n` = un carnet, v1),
  `r` = la rareté écrite ; `n` et `d` dans `I18N`.
- Peinture : `c` (couleur) et `g:'s'|'c'|'o'|'g'|'k'|'n'` (satiné, chrome, or, laqué noir, métallisé, nacre), ou `grad:[bas,milieu,haut]`,
  ou `mot:'<id>'` (un MOTIF : sa toile dans `MOTIFS`). Depuis le 16/10, ni `p` ni `r` : la rareté et le prix EN EUROS se déduisent
  (`peintRegle`, `PEINT_EUR`) — couleur pleine = commune 1 € · dégradé ou or = rare 3 € · motif = épique 5 € (achat : `habPaye`).
- Aile : `ico`/`col` (pictogramme `PXI_G` et sa couleur) ; son DESSIN = un bâtisseur dans `AILES_POP` (pivot, côté, W9, L9, H9, y0),
  contours à plat par `ailForme`, tiges `ailTige`, textures cuites une fois `ailTex`, mouvement par `ailAnime` (lit `wingT` et `AILV` :
  `n` le boost, `vir`, `mon`, `photo` la pose de la carte). ⚠ Tout groupe ou pièce qui BOUGE passe par `ailB(o)`, sinon `caisseSoude` le vide
  (« LES AILES VIVANTES » au journal) ; un effet hors cadrage photo porte `userData.fx`. Vérifier : `dbgAiles(id)` (0 groupe vidé),
  `dbgAilesForce({ouvre:1,n:1})` + `dbgAilesVue(az,d,h)` (en course, au boost), `dbgAile(id)` (la photo) ; `dbgAilesVue('reprend')` relance la course entre deux photos.
  ⚠ Une aile qui ne doit PAS s'étirer avec le pivot (SANS AILES : des buses posées sur la tôle) pose `piv.userData.recale` : la boucle
  le rappelle juste après avoir posé l'étirement et le dièdre du pivot (voir AILES_POP.air).
- Traînée : `rgb` = la couleur du ruban ; un EFFET = `pop:'nom'` + un émetteur dans `TRX_EMET` (quads instanciés, planche
  `trxPlanche`), `rubOff:1` s'il remplace le ruban. ⚠ Ce qui doit se voir en course garde ~0,86-0,9 de l'élan (`trxVit`).
  Commun à toutes (18/10, passe globale) : de JOUR un voile d'encre sous la lumière (`TRJ` : rubans `tr.mi`, TRX `uInk` — `?sans=encrejour`),
  le halo du feu arrière prend la couleur de la traînée au nitro (`VIT9.trC`/`trK`), la bascule rouge des feux → couleur est rapide (`cw9`) :
  jamais de mélange RGB entre deux teintes éloignées (MENTHE + rouge = jaune). Juger une traînée de jour ET de nuit.
- Essayer : `dbgHab(cat,id)` (porté à l'essai), `dbgTrx('nom')` (forcée en course). Banc : photos garage + course, muet.

**Ajouter une figure (un emplacement de vol, le double-tap nitro)**
- Une ligne dans `BASE` de `figures.js` : `{id, n, en, c, ce, p, D, aura, m:[{a:[x,y,z],t:n}]}` ou `{a, b:amplitude, k:battements}` — `c`/`ce` = le
  nom COURT du bouton (8 lettres). Depuis LES FIGURES v2, un mouvement `t` est une EXPLOSION qui donne `t` tours en ~`D` s autour de l'axe `a`
  (le point d'explosion se déduit de l'axe : `boums`), un battement est un ressort lancé. Le nom anglais `en` entre seul dans `I18N`. Elle apparaît
  au shop et à l'inventaire (`COSM.figure`) — son DESSIN dans les vignettes et le sélecteur des trois figures : une ligne dans `ILLU_FIG`
  (index.html : anneau, sens, vue de la caisse, geste joué ; sans elle, l'anneau du salto) ; en BOUTIQUE, son FILM AU RALENTI se calcule seul de son mouvement (`figFile` → `figFilm`, `dbgFigFilm`) —, s'équipe dans un emplacement de SES DIRECTIONS : `dir:['avant']`, `['arriere']`, `['cote']` ou
  `['avant','arriere']` (un salto + autre chose : le geste choisit le sens du salto) ; sans `dir`, `FIG.dirs` la range par la règle de
  figures.js (que l'axe des roues → son sens ; aucun mouvement sur x → côté ; les deux → avant et arrière). `figures.js?v=` +1 dans index.html ET boite-figures.html,
  `sw.js` +1. On la regarde dans `boite-figures.html` (la même physique), on la règle au banc Node du corps (Journal, LES FIGURES v2).
- Une figure DÉTECTÉE en vol (vrille, dauphin…) : `addTrick(id,txt,…)` → `chaineAura(nom,base,famille)`.

**Ajouter un texte**
- Dans le code : `TR('LE TEXTE EN FRANÇAIS')` + sa clé EXACTE dans un `Object.assign(I18N,{…})` daté (et `I18N_ZH` si possible ;
  sinon le chinois retombe sur l'anglais). Un nombre en queue (« RÉCOLTE ×5 ») se traduit seul.
- En HTML : le texte français dans l'élément ; `applyLangDOM` le mémorise dans `data-fr` et le traduit. Jamais de `data-fr=""`.

**Ajouter un son**
- La recette dans `atelier-son/recettes.js` → `node atelier-son/cuire.js <filtre>` (réécrit `sons-banque.js`) →
  `sons-banque.js?v=` +1 dans index.html et `sw.js` +1. Dans le jeu : `sfx('famille.nom',{vol,st,pan})`.
- Sans ffmpeg (le Mac de Sacha) : `PCM=1 node atelier-son/cuire.js <son>` — rangé en WAV 24 kHz (`pcm:1`), pour un son ou deux seulement.
- Avec repli : `if(!(typeof sfx==='function'&&sfx('x')))repli();` (`typeof sfx` est toujours vrai).
- On ne peut pas écouter : on MESURE (sonie, spectre) et Sacha ou Léo jugent dans `sons.html`. Jamais de voix.
- Un son GRAVE (le DOUM des figures, 15/10) : les outils `doum`/`basse`/`wouom` de `recettes.js` (`G.CCSON_GRAVE`) ; il lui faut de l'énergie
  entre 150 et 500 Hz, sinon il n'existe pas au haut-parleur d'un téléphone (mesurer la sonie après un passe-haut 200 Hz : perte ≤ 5 dB).
  Les sons FRÉQUENTS de la route restent bas et brefs (la pièce : −35, « LES SONS GRAVES ET DISCRETS » au journal) ; les figures passent au-dessus.
- Une musique : le fichier dans `assets/audio/music/`, sa tonalité dans `SON_TON`, son branchement dans `MENU_MUS` (le menu) ou
  `musicLieuVoulu` (un lieu précis) ; en course, c'est Pouce bleu (`musique-moteur.json`, la bibliothèque).

**Ajouter un niveau (une map)**
- Mode classique : une entrée dans `SF_CARTES` (`base` = son niveau, `m` = ses météos `{bio, pluie, nuit, orage, niv, p}`) ; ses
  ambiances dans `BIOMES` ; son niveau de base dans `NIVEAUX` (le cycle fixe de Poki et `?classique=cycle`) ou à part, comme
  `NIV_JADE`/`NIV_CRYPTO`/`NIV_PARIS`, branché dans `lvlChoisir`.
- Son décor se bâtit depuis `newTrack` ; ses matières se chauffent au menu (`chauffeDivers`, sur le modèle de `cryptoChauffe`,
  `parisChauffe`) ; `dbgProgsListe()` doit montrer 0 programme neuf en course.
- Ses tirages ont leur propre flux de hasard. Sa musique : `musicLieuVoulu`. Côté Léo : `simulateur/maps.js` et la page maps-ciel.

---

## 7. Pièges connus (ceux qui cassent EN SILENCE)

1. **Un `//` au milieu d'une ligne avale la suite** : le dragon jamais ajouté à la scène, le titre TRIPLE MONSTER éteint, la
   relecture GPU du ciel du menu à chaque image. Commentaire au milieu = `/* */`. Relire chaque ligne modifiée qui contient `//`.
2. **Une directive `#ifdef` collée derrière du code dans un shader** : le shader est refusé sans erreur (la pluie d'argent
   n'apparaissait pas). `dbgProgsListe()` et `dbgCrypto('progs')` listent ce qui n'a pas compilé.
3. **Une règle CSS sur plusieurs lignes à moitié remplacée** : l'accolade orpheline avale la règle suivante. Compter les accolades
   de chaque `<style>` (jamais de profondeur négative).
4. **L'index d'une caisse est une donnée de sauvegarde** : insérer ou ôter une ligne de `CARS` donne à chacun la caisse d'un autre.
   Et l'index n'est pas une progression : aucun effet ne se câble sur un numéro de caisse, on lit la fiche.
5. **Un tirage `rnd()` ajouté dans la génération** décale toute la piste en aval, et les autres niveaux avec. Son propre flux.
6. **Une lumière de plus dans la scène** recompile toutes les matières éclairées (1,5 s de gel à l'explosion, ~30 programmes au
   garage). Recycler une lumière ; l'atelier passe par `atelierLampes` (jamais `stallKey.visible=true` en direct).
7. **Une matière qui naît en course** compile un shader en pleine partie : 0,1-0,3 s figé sur iPhone. La chauffer au menu.
8. **Libérer la dernière matière d'un programme** : three détruit le shader, il faudra le recompiler. D'où `MAT_SURSIS`,
   `CAR_GARDE`, `ENG_GARDE`.
9. **`scene.onBeforeRender` est déjà pris** (piste, ville, ciel) : chaîner, jamais réassigner.
10. **`body:has(…)` pour le HUD** rendait chaque écriture de style ~80× plus chère : une classe dans `HAS_D`.
11. **`innerWidth` lu dans la boucle** force une mise en page complète sur mobile : `VP.w`/`VP.h`. Et `textContent=` recrée le nœud
    même à valeur égale : écrire seulement si ça change. Un rectangle ou un style CALCULÉ du HUD lu dans la boucle
    (`getBoundingClientRect`, `getComputedStyle`, `zRect`) force aussi styles + mise en page : le lire dans `apresMiseEnPage(fn)`
    (rappelé juste après la mise en page de l'image, où lire ne coûte rien ; `apresMiseEnPage(fn,true)` si fn écrit ensuite).
12. **La scène est gelée** (`matrixAutoUpdate=false`) : un objet immobile qu'on anime appelle `updateMatrix()` ; un objet caché
    n'est pas mis à jour (pour lire sa position, `SCENE_TOUJOURS`).
13. **Un fichier changé sans `CACHE` de `sw.js` incrémenté** (ou sans `?v=`) : les joueurs gardent l'ancien, pour toujours.
14. **Le jeton `__CC_BUILD__`** n'existe qu'UNE fois dans `index.html` : ne jamais le réécrire ailleurs, même en commentaire.
15. **Un fichier neuf dans `VERSION PRINCIPALE/`** part en ligne, change l'empreinte (tous les joueurs rechargent) et entre dans les
    portails. Un outil local s'ajoute aux exclusions de `vercel-build.sh` ET de `poki-construire.js` (deux fichiers du même nom
    cassent l'édition À PLAT de CrazyGames).
16. **`san()` reconstruit la sauvegarde champ par champ** : un champ neuf de `SAVE.d` (ou de `SAVE.d.ex`) qui n'y est pas ajouté
    disparaît au chargement suivant.
17. **Les gains d'une chaîne audio continue** s'écrivent par `stt`/`setTargetAtTime` : un `.value=` n'ouvre pas sa porte (`PORTES`).
18. **`TEST_CAISSES` est vrai sur main** : tout est ouvert (pastille TEST). C'est à Sacha de le couper avant
    une sortie — ne pas conclure d'un banc qu'une caisse « se débloque ».
19. **La recopie après une boucle de rebase arrêtée sur un conflit** a déjà emporté des marqueurs `<<<<<<<` chez Sacha.
20. **Les jugements de rendu** : la salle blanche grise les noirs (juger au garage du jeu) ; les mini-ailes repliées
    (`carWingL/R`) traversaient les vitres des caisses fines (visible en boutique seulement) ; en poursuite on voit surtout le
    DESSUS de la caisse.
21. **Un défaut d'image vu sur iPhone ne se juge qu'au PIXEL** : à l'échelle de l'écran, la trame du flou de vitesse (15/10) était
    invisible ; zoomer ×4 la MÊME image rendue avec et sans (`VARIANTES` du banc). Sur iPhone la 3D est agrandie ×2 (NETTE 1,5 sur ×3).

22. **Un `const` / `let` lu par du code qui tourne AVANT sa ligne est en zone morte** (`ReferenceError`), et un `try/catch` autour de l'appel l'avale :
    la migration des missions v2 n'a pas tourné du 16 au 18/10 (`M2_COLK`, `M2_RECO` déclarées 1 700 lignes plus bas que le `m2Etat()` du démarrage).
    Tout ce que le code de démarrage atteint se déclare AVANT lui ; après avoir touché ce bloc, charger le jeu et chercher le `console.warn` du `catch`.
---

## 8. Index du JOURNAL (titres exacts, à chercher avec `grep -n "^## <début du titre>" JOURNAL.md`)

**Règles, éditions, publication**
- « ⚠ LE BURN-OUT EST À LÉO » (07/10) · « ⚠ LA VERSION DE RÉFÉRENCE — LIRE EN PREMIER » (01/10)
- « ⚠ DEUX ÉDITIONS, UN SEUL JEU » (25/09) — les éditions, la colonne de l'ordi, beaucoup de règles de conduite et de piste
- « L'ÉDITION POKI » (04/10) · « LA MÊME VERSION POUR TOUT LE MONDE — LA MISE À JOUR TOUTE SEULE » (01/10)
- « LE MENU = LE GARAGE + LES BOUTONS DE SACHA » (30/09) · « JOUER = LE MODE CLASSIQUE » (08/10) · « L'iPHONE PAR DÉFAUT SUR L'ORDI » (06/10)
- « PLUS AUCUNE VOIX » (07/10) · « LE CODE COUSIN » (14/10) · « PLUS DE CARRIÈRE + PLUS DE MODE FACILE » (14/10)
- « LA SECONDE CHANCE » (14/10) · « LA PUB QUI RESSUSCITE » (15/10 soir, la seconde chance contre une pub) · « LA RÉGIE ADSENSE — LES VRAIES PUBS DU SITE » (15/10 soir) · « LA REVUE DES IDÉES DE LÉO — CORRECTIFS 7, 13, 14 » (14/10) · « L'AUTO-ÉCOLE v2 » (14/10)
- Le mode classique au hasard (13/10) n'a pas de section : le commentaire « LE MODE CLASSIQUE AU HASARD » au-dessus de `const SF` fait foi.

- « LE PORTAIL DE CUBES — LA FENÊTRE SUR LA MAP D'EN FACE, LE PASSAGE QUI SE DÉFAIT EN CUBES » (17/10, Léo)
- « LES BORDS DE LA MAP — UNE COULEUR PAR MAP, LE SCINTILLEMENT RGB AU BOOST » (18/10, Léo) — `BMAP_PAL`, `bmapPeint`, `bmapBoost`, `BMAP_U`, `dbgBordsMap`
- « LA DURÉE DES MAPS — UNE MAP SE COMPTE EN SECONDES » (18/10, Léo) — `DUREE`, `longueurCible`, `DUREE_ALLURE`, `?duree=ancien`, `dbgDuree`
- « LE PRÉ-BÂTI — LA MAP D'EN FACE SE BÂTIT PENDANT QU'ON ROULE » (18/10, Léo) — `PREB`, `pisteRoute`, `prebEchange`, `prebDecorG`, `?prebati=0`, `dbgPrebati`
- « LES NUAGES EN VITRAIL » (18/10, Léo) — `nuage8Calc` opt.vit, `nuVitMats`, `NUVIT`/`NV_DOSES`, `dbgNuVit`
- « LES NUAGES FANTÔMES + LE FOND PEINT DE LA MER DE NUAGES » (18/10, Léo) — `opt.fant`, `nuFantGeo`, `NUFOND_V`/`NU_FOND`, `dbgNuFond`
- « LE FONDU DES NUAGES — PLUS DE BASCULE ENTRE LA OUATE ET LES CUBES » (18/10, Sacha) — `NUVIT.fondu`, `nuvPoids`, `COTON.LV`, attribut `aR`, `?sans=nuvitfondu`
- « LES NUAGES FANTÔMES EN TEXTURE — LE MÊME RENDU, 5× MOINS DE MÉMOIRE » (18/10, Léo) — `NUF_TEX`, `nufIdx`, `nuLibre`, `dbgRamNuages`, `?pistegraine=`
- « LA FORÊT NOIRE EN VITRAIL — PONTS, MOUSSE, PLEUREURS (+ LA VILLE AUX FAÇADES GTA) » (17/10, Léo) — `PLEUR`, `FOR_ARB_FS` (le slalom `forZigzag` et la mousse ont été retirés le 18/10)

**Débogage, perf, bancs**
- « LA PASSE PERF DU 18/10 — PLUS AUCUN PROGRAMME COMPILÉ EN COURSE (CANYON, APRÈS LE GLACIER) + LE CLASSEMENT DES POSTES » (18/10) — `PISTE_GARDE`, `canyonChauffe`, le banc ×4, ce qui reste (JOUER, portails, puce)
- « LES PIXELS QUI SE RÉPÈTENT — LE FLOU DE VITESSE SANS MOTIF » (15/10) — `FLOU_MIPS`, `flouMips`, `?flou=ancien` (compose avec `FLOU_V2`) ; le BANC WEBKIT
- « LA PASSE MOBILE — DÉBOGAGE ET FLUIDITÉ EN NETTE » (14/10) · « LA PASSE QUALITÉ AVANT SORTIE » (12/10)
- « LA CAMPAGNE DE DEBUG AVANT PUBLICATION » (07/10) · « L'AUDIT AVANT PUBLICATION, ZONE GAMEPLAY » (07/10) · « LA PASSE DE SORTIE » (29/09)
- « PASSE PERF iPHONE » (27/09) · « PASSE DÉBOGAGE / PERF » (26/09) · « PASSE DE FINITION » (26/09) · « LA SONDE QUI NE FIGE PLUS » (08/10)

**Conduite, vol, caméra**
- « LE DÉCOLLAGE AU MANCHE — LA FIGURE SUR LA ROUTE PEUT S'ENVOLER » (19/10, Léo) — `FDC`, `frEnvol`, le geste neuf pendant le bond
- « LA DERNIÈRE PASSE DE FLUIDITÉ AVANT LE GEL » (17/10) — décollage, pose, réacteur, caméra : ce qui sautait d'une image à l'autre
- « L'IMPACT — UNE SEULE ANIMATION POUR TOUT CE QU'ON PERCUTE » (15/10) — la mort contre une paroi, toutes les maps
- « LE HUD DES FIGURES v5 — LA RARETÉ ÉCRITE, LE COMBO QUI SE LIT, LE BUMP FIGURE DU COMBO » (18/10) — polices par rareté, ligne des noms, `figBumpNote`
- « LE VOL ÉQUILIBRÉ + LES FIGURES AU DOUBLE-TAP » (14/10) · « LE DERNIER TOUR DES COMMANDES AVANT LE VERROU » (09/10)
- « EN VOL, POUCE EN HAUT = LA CAISSE MONTE » (10/10) · « LA POSE DÉBOGUÉE » (01/10) · « LA PHYSIQUE DU BORD v2 » (01/10)
- « LE VOL À LA VITESSE D'ÉJECTION » (30/09) · « LA CAMÉRA HÉROS » (30/09) · « LA VITESSE QU'ON SENT » (07/10)
- « LE MODE FACILE + « POUCE HAUT EN VOL » » (29/09) · « LA GRANDE RELECTURE » (30/09)

**Économie, aura, nitro, flow**
- « LA LOI DU RÉSERVOIR + LA CHAÎNE SE FERME » (01/10) · « LES FIGURES NE PAIENT PLUS QU'EN AURA » (29/09)
- « LES GAINS QUI FLOTTENT PUIS TOMBENT DANS LEUR JAUGE » (12/10) · « LA JAUGE D'AURA (le format de la barre flow d'origine)… » (12/10)
- « LA LIGNE PARFAITE » (29/09) · « LES POUVOIRS v2 + LES PETITS TRUCS GRISANTS » (28/09) · « NITROOO » (29/09)
- « LE FLOW v2 » (28/09) · « LA TRIADE v5 » et « LA TRIADE SIMPLIFIÉE » (28/09) · « LA FRÉNÉSIE ×3 » (29/09)

**Niveaux et maps**
- « LA VILLE TOUJOURS LA NUIT — QUATRE TEINTES, QUATRE TEMPS » (16/10) — plus de ville de jour ; violet/vert/jaune/bleu, le brouillard, le remappage sélectif
- « LE GLACIER — LA FACE EN LACETS QUI SE SUPERPOSENT » (14/10 soir) — ex-banquise : spirales ovales superposées, raccourcis par le bord aval
- « LA BANQUISE — LA DESCENTE DES PICS DE GLACE » (14/10) — la route qui dévale, la poudreuse qui porte et qui avale, la glisse sur les pics (les lacs gelés ont été retirés le 18/10), les aurores
- « LE ROYAUME DE FEU — LA MAP DU VOLCAN » (14/10) — le flanc qui descend, les lacs et les coulées de lave, les éruptions, les six temps
- « LA FORÊT NOIRE — LA MAP DES CONTES » (14/10) — la vallée en slalom qui descend, les géants, le jour fleuri, la nuit hantée, le loup-garou
- « LE NIVEAU « SOLEIL DE JADE » » (12/10) · « LES PICS DE JADE + LA BALADE `?map=jade` » (09/10) · « CRYPTOCITY » (13/10) · « CRYPTO CITY — LA VILLE DU BULL RUN ENTRE DANS LE TIRAGE » (15/10) · « LE CANYON DES GÉANTS » (14/10) · « LE CANYON v2 — RACCOURCIS, COULOIR DE PRÉCISION… » (14/10 soir)
- « LES NIVEAUX — la page `maps-ciel.html` » (09-10/10) · « LE SIMULATEUR — `simulateur.html` » (12/10) · « PARIS SORT DU MODE INFINI » (10/10)
- « LA MAP NUAGES, DES VIRAGES DE COURSE — CINQ MODULES À RIDER, LE DÉVERS, LA ROUTE QUI NE SE TOUCHE PLUS » (18/10) — `TORD_AMP`, `TORD_W`, `MODT`, `TORD_DEVERS`, `pisteTordPropre`
- « LES PROFONDEURS — LES BIOMES DE GROTTE DE MINECRAFT, DANS LA DA DU JEU » (18/10) — `genGrotte`, `grtCreuse1`, `grtMailleNets`, `GRT_FS`, `grtBiomes`, `grtConti`, `grotteHeurt`, `dbgGrotte('test')`, bancs Node
- « LES MODULES DE CHAQUE MAP — AU MOINS TROIS PAR MAP, TIRÉS AU HASARD » (18/10) — `MODC_ON`, `?sans=modcartes`, `dbgModCartes`, un paquet par générateur
- « LES MAPS, 2e TOUR — MOINS DE TOUT DROIT, LE VOLCAN REFAIT EN BALADE QUI MONTE, LA FORÊT ALLÉGÉE » (18/10) — `vlcTrace3`, `vlc3Cone`, `rPlancher`, `VILLE_WM`
- « LA ROUTE DES NUAGES MOINS TORDUE — LES VRILLES REVIENNENT À L'ENDROIT » (18/10) — `NV_CALME`, `?nuages=tordu`, tenues calmes rappelées vers le ciel
- « L'ORAGE — LE 4e NIVEAU, LE NIVEAU DUR » (29/09) · « LES NUAGES v8 — REFAITS À ZÉRO » (01/10) · « L'AUTOROUTE ORBITALE » (30/09)
- « LA CAMPAGNE NUAGES » et « LA CAMPAGNE VILLE » (27/09) · « LA VILLE DÈS L'ENTRÉE + GLASSY PLUCKS » (04/10)

**Lumière**
- « LES LUMIÈRES DE LA CAISSE v2 — PHARES, FEUX, NITRO ET TRAÎNÉES ÉCLAIRENT LA ROUTE » (17/10) — `LUM_GLSL`, `lumTick`/`lumVue`, `FEU_U`, `LUMK`

**Caisses, boutique, habillages**
- « LES AILES VIVANTES — QUATORZE AILES, CHACUNE SON GESTE » (16/10) — les ailes en X au boost, battements, la soudure qui les figeait
- « LES GESTES DES AILES ONT LEUR SON — … » (16/10) — `ailSon`, `ailes.xwing`/`xwingFerme`/`dragon`/`pigeon`, rangés en PCM
- « LE FILM D'UNE FIGURE — UNE MINI ANIMATION AU RALENTI PAR CARTE » (18/10) — remplace la photo-séquence du 15/10 (`figFilm`, `filmPose`/`filmJoue`, `FILM_FIG`)
- « LA PHOTO D'UNE FIGURE — UNE ILLUSTRATION PAR CARTE DANS LA BOUTIQUE » (15/10 soir) — la photo-séquence de chaque figure (remplacée le 18/10 par le film)
- « LES HABILLAGES POP + L'ÉQUILIBRAGE ARGENT / AURA + LES TEXTES FR / EN + LE GUIDE » (14/10) — 30 habillages, l'économie, les textes
- « L'ELDORADO v3 — LES DÉTAILS DE LA BIARRITZ 59, ET LA MÉTHODE POUR REFAIRE CHAQUE VOITURE » (17/10) — le redesign voiture par voiture : budget, pièges, banc `outils/banc-caisses/`
- « LA PERLE AU PLAN — LA SERRE CONSTRUITE SUR LES TRAITS, LES VITRES DÉCOUPÉES AU PLAN » (18/10) — refaire une vraie voiture d'après son plan coté : banc des écarts, `peintPlan`
- « LA PERLE — LES TRAITS DANS LA TÔLE, EN FACETTES, LE RIDEAU D'AIR CREUSÉ, LE PHARE REFAIT » (18/10) — `peintPlan`, `PLAN.zf`, `creux`, `PERLE_LISSE`, `perleTraits`
- « LES NOUVELLES VOITURES — HUIT PLACES RÉSERVÉES, LA BULLE ET LE COMBI EN COMMUNES » (18/10) — index 79-86 réservés (la suivante = 87), qui fait quoi
- « LE BLINDÉ NOIR EN PORC-ÉPIC GOTHIQUE » (16/10) — piquants sur le dos, clous chromés devant (`pique`, `clou`, `mue`, ailes en ogive)
- « LE DOGE » (14/10, deux sections) · « LES VRAIS MODÈLES, PLUS RESSEMBLANTS » (13/10) · « LA MERCURE v2 » (11/10)
- « LA SALLE BLANCHE » (09/10) · « LE SQUALE » (08/10) · « LE CHAT POP-TART EN VOXELS » (06/10) · « L'ORIGAMI — LE PICK-UP D'INOX » (02/10)
- « LA GAMME RESSERRÉE — LA FICHE DES VOITURES » (06-07/10) · « SIX COMMUNES RETIRÉES » (02/10)
- « LA VITRINE DU GARAGE » (04/10) · « LES LUEURS DE LA BOUTIQUE » (07/10) · « LA FENÊTRE D'ACHAT » (01/10)
- « LE JET PROPULSÉ, LE MOTEUR QUI CRÉPITE DANS TOUS LES SENS, LE VRAI POT DE LA HONTE » (15/10 soir) — `NFEU_JET`, `NFEU_MINI` (`va`, `r`, `crq`), `ECHP.reel`, `ECH_PAL.h`
- « LE FEU AFFINÉ — 10 NUANCES, PIXELS PLUS FINS, FLUIDE AU VENT… » (15/10 soir) — `NFEU_P10`, `NFEU_FIN`, `NFEU_SOL`
- « LE MOTEUR EN MINI FEU DE PIXELS » (15/10) — `NFEU_MINI`, `?moteur=goutte` (remplace « LE MOTEUR EN ÉCLATS », `ECLATS` retiré) · « LE MOTEUR QUI AVANCE + LE NITRO EN FEU DE PIXELS » (15/10) — `FLM`, `NFEU`, `?flamme=ancien`
- « LE DRAGON EN FEU DE PIXELS » (15/10) — RETIRÉ du jeu le même jour (Léo)
- « LE SILLAGE DE NITRO v5 » (29/09) · « LE DRAGON DE PAPIER (v7) + LA DARK TRIAD EN NOIR » (01/10) · « LA PLUIE DE RICHESSE » (08/10)

**Garage, menus, écrans**
- « LES MISSIONS v2 — DES MISSIONS LIBRES À LA PLACE DES CARNETS » (16/10) — `M2`, `SAVE.d.m2`, la migration, les secrètes, les mesures des seuils
- « LA MIGRATION DES MISSIONS v2 NE TOURNAIT PAS — M2_COLK ET M2_RECO EN ZONE MORTE » (18/10) — pourquoi, mesuré sur des sauvegardes d'avant (banc `cc-banc/m2colk/`), ce que le correctif change (rien de dangereux)
- « LA REPRISE DE LA MIGRATION DES MISSIONS v2 » (18/10) — le drapeau `vr`, les sauvegardes marquées par la passe avortée rejugées une fois, sans confisquer (banc `m2rep.cjs`)
- « LA PASSE UX/UI — L'ACCUEIL, LE GARAGE, L'ŒIL, LES TRANSITIONS » (11/10) · « LE GARAGE, HUB DES TROIS » (06/10)
- « LA VUE DE LÉO DANS LA CONSOLE DE SACHA » (06/10) · « LE PREMIER BURN-OUT, REVENU — AVEC LES DONUTS » (08/10)
- « L'ÉCRAN TITRE v3 » (01/10) · « LE CIEL DE L'ÉCRAN TITRE v4 » (06/10) · « LES HEURES DU TITRE » (05/10)
- « LA CARRIÈRE v2 » (07/10) · « L'ÉCRAN DE FIN v5 » (29/09) · « MOINS DE TEXTES AU MILIEU DE L'ÉCRAN » (29/09)

**Interface et HUD**
- « LA CHARTE v5 — LAQUE · OR · NÉON » (28/09) · « LA CHARTE v4 — CARBONE · OR · NÉON » (26/09, sa grammaire reste la loi)
- « LA CHARTE AU COMPLET » (28/09) · « LA DA DU HUD, UNE SEULE FAMILLE » (28/09) · « LE HUD DE COURSE, MAÎTRISÉ ET EN MOUVEMENT » (28/09)
- « LE MOUVEMENT DE L'INTERFACE + MISSIONS v2 » (28/09) · « LA TAILLE DU HUD » (28/09) · « L'ORDRE DU HUD » (30/09)
- « LA REVUE DE L'INTERFACE — CHAQUE BOUTON MESURÉ, L'APPUI POUR TOUS, LE PASSAGE DIRECT » (17/10) — bancs audit/film/chrono
- « LE JOUER PARTOUT DANS LE GARAGE — INVENTAIRE ET BOUTIQUE » (18/10) — `?garjouer=0`
- « JOUER RESTE QUAND LA CAISSE EST À VENDRE » (18/10) — la barre du garage ne change plus de forme

**Son et musique**
- « LA GOMME DOUCE — LE CRISSEMENT QUI CHUCHOTE » (16/10) — le crissement des pneus refait, doux, sous la musique · « LE FEU QUI RUGIT » (16/10) — le son du nitro
- « LES SONS GRAVES ET DISCRETS + LE DOUM DES FIGURES » (15/10 soir) — la pièce « tchic » grave, la gamme dans l'octave, les figures en doum
- « LA CONSOLE DE SON » (28/09) · « LE SON EN COURSE REMIS D'APLOMB » (12/10) · « LE LOBBY « CHRIS » » (14/10)
- « LE DÉPART EN MUSIQUE » (04/10) · « PLUS DE COUPURES DE MUSIQUE + LE TEMPO MESURÉ » (03/10) · « LA MUSIQUE DE LÉO SUR MAIN » (29/09)
- « LA MUSIQUE DU CIEL ET DU GARAGE » (14/10) · « LA BIBLIOTHÈQUE DES SONS — `bibliotheque.html` » (14/10) — outil LOCAL depuis le 18/10 (plus publiée : `python3 atelier-son/serveur-moteur.py 9141`)

**Archives** : le bas du journal (« ⚠ FUSION SACHA × LÉO + NIVEAUX — 2026-09-24 », « ⚠ FUSION DU 2026-08-30 », puis « Le jeu »,
« Architecture », « Conventions »…) décrit des lignées anciennes. Une section plus récente l'emporte toujours sur une plus ancienne.
