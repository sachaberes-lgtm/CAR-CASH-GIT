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
- **`AUTRE VERSION/`** (l'édition PC) est GELÉE depuis le 25/09 : on n'y touche pas. **`ROBLOX/`** est un autre jeu.
- **En ligne** : chaque push sur `main` publie https://car-cash-git.vercel.app/jouer/ (`vercel-build.sh`, ~1 min). C'est là que
  Sacha et Léo jouent sur téléphone. Le numéro « VERSION xxxxxxx » des réglages = l'empreinte du jeu publié.
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
- **Versions** : `CACHE` de `sw.js` +1 (`'cashcar-vNNN'`, avec sa ligne de commentaire) dans chaque commit qui touche le jeu.
  Un fichier chargé avec `?v=N` (`sons-banque.js`, `sfx.js`, `figures.js`, `harmonie.js`) : N +1 quand il change.
  Sinon les joueurs gardent l'ancien fichier, indéfiniment, sans erreur.
- **Commit** : `git add "VERSION PRINCIPALE/<fichiers>"`. **Jamais `git add -A`** : des fichiers d'autres sessions traînent (ml/,
  données de Léo). Message en français qui cite la demande.
- **Intégrer** : `git fetch origin` puis `git rebase origin/main` (ou `git merge origin/main`). Jamais `--force`, jamais de `reset`
  ni de revert du travail de l'autre ; dans un conflit on garde les deux. Conflit habituel : la ligne `CACHE` de `sw.js` → le plus
  grand +1, les deux commentaires gardés. Revérifier après l'intégration.
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
  de Sacha (`MENU_SACHA`, celui de Léo = `?menu=leo`), JOUER = le mode classique au hasard (le Soleil de jade direct = `?play=jade`,
  la carrière au PLAY = `?play=carriere`), l'iPhone avec encoche sur l'ordi (`ENCOCHE_DEFAUT`, écran nu = `?encoche=0`).
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
  (la charte v4/v5 : tous les écrans hors course), `hudMaitrise`, `hudDA`, `garageV7`, `garageVitrine`, `hubGarage`, `carriereV2`,
  `poki`, `uxPasse`, `nitroEclair`, `auraJauge`, `passeMobile`. Un chantier d'interface = son propre bloc nommé, après ceux qu'il surcharge.
- JS : le grand script est une IIFE (`(function(){'use strict'; … requestAnimationFrame(loop);})()`). Rien n'est global, sauf les
  crochets de console `window.dbg*`.

**Les systèmes et leurs noms**
- **Boucle et états** : `loop` (son try/catch avale les erreurs : `window.__loopErr`), `start`, `resetGame`, `endGame`,
  `explode(cause)`, `mode` = 'drive' | 'fall' | 'boom', `togglePause`, `repriseCompte`, `CHANCE` (la seconde chance : la reprise
  n'appelle ni `runxReset` ni `resetGame`, elle décale les bases de commitExploits — `chanceBase`).
- **Conduite** : `TCTL` (volant tactile et souris), `keys`, `steer`, `yawR`, `lacetMax`, `driftYaw`, `momT`, `SPD` (vitesse globale),
  `ASSIST_VIRAGE` (= 0), `bindHold`, `CAM_ROUTE`, `fovFit`.
- **Vol et pose** : `startFall`, `tryLand`, `AIR_RATE` (= 1), `FALL_G`, `fallVH0`, `FLY_U`, `VEQ`/`VEQ_K` (le vol équilibré),
  `veqDouble`/`veqSaut` (double-tap nitro), `FIG` (figures.js), `addTrick`, `trackMinY`, `dalleProche`.
- **Figures v2** (la physique) : `FIG.Corps`/`FIG.PHY` (figures.js), `FIGV2`/`FX2`, `figLance` (une explosion), `figPose` (chaque image de vol),
  `figDepart`/`figMemo` (l'élan emporté au décollage), `figBudget`, `figPaye`/`figChute`, les emplacements `SAVE.d.figEq`/`figEquipees`,
  les boutons `#tFig`/`figHud`. `?fig=ancien` = le lecteur de Léo. Depuis le 15/10 : DEUX emplacements (`FIG_NB`), choisis au joystick sur le
  double-tap NITRO (`FDIR`/`figDirSlot` : avant = 1, côté = 2 ; `?figdir=0` rend les boutons), le HUD des figures `#fh` (`fhLance`/`fhPlante`/
  `fhFin`/`fhTick`, bloc `figuresHud`) et le rappel `#fhLeg` à côté de NITRO. Depuis le 15/10 soir : DEUX FAMILLES (`FIG.cat` dans figures.js,
  `figFam`/`figSlots`/`FIG_FAM`) — l'emplacement 1 = une figure AVANT (saltos, chandelle), le 2 = une figure de CÔTÉ (tonneau, toupie… elle part
  du côté du pouce, `o.dx`) ; équiper remplace celle de SA famille ; sans figure avant, le pouce en avant ne fait RIEN (`o.strict`, sauf
  l'auto-école) ; la boutique les range en deux sections (`bqFigSec`, `.bqSec`).
  RÉGLAGE FIGURES (15/10, Léo) : `SAVE.d.figG` 'tap' (le double-tap ci-dessus, d'origine) · 'glisse' = depuis NITRO, glisser puis lâcher
  (`GLI`, `figGJoue`, `figGVoit`/`#figGl` la flèche, `figGBascule` seul écrivain ; ← → tonneau, ↑ salto arrière, ↓ salto avant, au sol `veqSaut(fo)`).
- **Piste et niveaux** : `newTrack` → `lvlChoisir` → `genCtrl` → `buildTrack` ; `frameAt`, `rnd`/`mulberry32`, `NIVEAUX`, `LVL`,
  mode classique `SF`/`SF_CARTES`/`sfTire`/`sfNiveau`, carrière `CARRIERE`/`carNiveau`/`CARR`, `NIV_JADE`/`buildJade`, `NIV_FORET`/`genForet`/`buildForet`/`FORET` (la forêt), `NIV_VOLCAN`/`genVolcan`/`buildVolcan`/`VOLCAN` (le volcan), `NIV_CRYPTO`,
  `buildVoxCity`/`CITY`, `orbiteBuild`, `PORTAL`/`portailPasse`, `spawnPickups`, `LIGNE`/`ligneTick`, `SANS_LOOPING`.
- **Ciel et décor** : `BIOMES`/`bioApply` (le SEUL écrivain des lumières), `skyDome`, `CIEL2`, `COTON`/`CLOUDS`/`buildClouds`/
  `updateClouds`, `paintEnv`.
- **Caisses** : `CARS` (les fiches), `CAR_UNLOCK` (prix et conditions, même index), `SHAPES` (les gabarits), `buildCar`, le kit
  low-poly `lpKit`/`lpMat`/`lpWheel`, tuyères `CAR_POTS`/`potMonde`, raretés `RARETES`/`carRar`/`rarListe`/`carOrdre`,
  `carUnlocked`/`carUnlockedVrai`/`carOwned`/`carRetiree`, vignettes `carPhoto`.
- **Boutique, habillages, figures** : `COSM` (peinture · aile · trainee · figure), `SHOP`, `shopBuy`, `shopOwned`, `shopEquip`, `cosm`,
  `FX_EFF`, `BQ_CATS`, `bqEphemeres` (les offres de la semaine), la salle blanche 3D `GBQ`/`garBqBatit`/`garBqPanneau`, `gShopJour`,
  `figAchat`/`figPossede`, `eurTxt`, `shopPaye` (la porte StoreKit : elle refuse tout aujourd'hui).
- **Garage et menus** : `openGarage`/`closeGarage`/`garageRender`, `garMode`/`GMODE`, `GAR`, `garLibre`/`garCadre`, `invOuvre`,
  `MENU_SACHA`, `HUB`/`hubSync`, l'accueil au ciel `chuteRender`/`CHUTE`/`TITRE_H`, la coque `#mob` (`mGo`, `mTap`, `#mHome`,
  `#mDead`), `ecranWipe`, `modale`, `toast`, `uiGarde`, carrière `#carr`/`carrVue`, missions `CARNETS`/`misTick`.
- **HUD** : `#hud`, `hudColonne`, `hautPasse` (une carte à la fois), `slam`, `trickMsg`, `flowHudMaj`, `ajTick` (jauge d'aura),
  `VOLG` (les gains qui volent vers leur jauge), `airPieDraw`, `#tNitro`, pause `#tGear`/`#tPanel`/`panSync`, `HAS_D`/`hasMaj`.
- **Économie** : `bank()` (= `SAVE.d.bank`), `DENOMS`/`ECO3`/`denom()`, rangs d'aura `AURA_RANKS`/`auraRank` (13 depuis le 14/10), moteur `ENGINE_TIERS`/`engTier`/`coinsGot`/`addCoins`,
  aura `CHA`/`chaineAura`/`CHA_VIE`, flow `FLOW`/`FLOW2`/`FREN`/`flowAdd`/`flowMult()`, pouvoirs `PWR_DEFS`.
- **Nitro** : le bloc `<<<NITRO2>>>` (la loi du réservoir), `NIT`, `nitroGain(q,src)`, `nitroTientDe`, `nitroOn`, `NFX`/`nitroAllume`,
  le grand livre `LIVRE`/`livre`/`dbgLivre`.
- **Effets** : traînées de lumière `LUMT` nées des feux arrière `CAR_FEUX` (`dbgFeux`), sillages `SILS`/`mkSillage`/`sillageStep`/`trailStep`, plumes `JETS`, `rainbow`, `WOWT`/`wowStep`, les TRAÎNÉES POP
  `TRX`/`TRX_EMET`/`trxStep`/`trxApercu`/`trxPlanche`, les AILES POP `AILES_POP`/`ailForme`/`ailAnime`, dragon `DRG`,
  dauphins `DAUPH`/`dolTick`, pluies d'argent `PLA`/`RICH`, particules `makePool`/`spawnP`, la flamme des pots `JETS` menée par le
  moteur simulé `FLM`/`flmPas`, le nitro en feu de pixels `NFEU`/`nfeuPas` (`?flamme=ancien`), hors nitro les éclats du moteur
  `ECLATS`/`eclaPas` (`?eclats=0`), le dragon en feu de pixels `DFEU`/`dfeuPas` (`?dragon=ancien`, `dbgDragon('pix',0|1)`).
- **Son** : `sfx(id,o)`, `son(id,repli)`, `SONV2`, `uiClic(rôle)`, `hap(p)`, `MASTER`, `PORTES`/`stt`, `initAudio`,
  `SON_TON`/`sonTonSuit`, `ECH`/`echSt`, `SANS_VOIX`. Fichiers : `sfx.js` (lecteur), `sons-banque.js` (banque cuite),
  `atelier-son/` (`recettes.js`, `cuire.js`), `sons.html` (banc d'écoute).
- **Musique** : `MUSIC`/`MUSIC_LOBBY`, `musicTick`, `musicJoue`, `playMusic`, `musicLieuVoulu`, `MUS_TAIT`, `DEPMUS`,
  `JMUS_NIV` (GLISSE V2 : `assets/audio/music/musique-glisse-v2.js`), `INSTRU` (coupé).
- **Sauvegarde** : `SAVE` (clé localStorage `cashcarSave`, `def()`, `san()`, `flush()`, `mark()`, `export()`/`import()`),
  le code caché `codeCousin`/`cousin()`.
- **Langue** : `LANG`, `TR`, `I18N`, `I18N_ZH`, `applyLangDOM` (`data-fr`), `majPix`, `sansAcc`.
- **Éditions et appareils** : `POKI`, `CC_PK`/`KITS`/`pkPasse`, `TEST_CAISSES`, `FACILE_OK`, `IS_MOBILE`, `TEL_NATIF`, `FORCE_TEL`,
  `SIMU_JEU`, `BALADE`.
- **Perf** : qualité auto `QL`/`QLR`/`qlSonde`, résolution `applyDPR`/`applyQ`/`curDPR`/`DPR_CAP`/`DPR_MIN`, chauffe
  `chauffeRendu`/`chauffeDivers`/`engChauffe`/`atelierChauffe`, sursis `MAT_SURSIS`/`CAR_GARDE`/`ENG_GARDE`, `SCENE_TOUJOURS`,
  `VP`, `pisteTranches`, `LFB_SANS_PL`, `atelierLampes`.

---

## 4. Les règles qui tiennent

**Code**
- Le style compact du fichier ; commentaires en FRANÇAIS, datés et signés (`(2026-10-14, Léo : « … »)`), qui disent POURQUOI.
- Un commentaire au MILIEU d'une ligne s'écrit `/* … */`, jamais `//` (voir piège n° 1).
- Perf : rien n'est alloué dans la boucle (on réutilise les vecteurs `tmp…`), particules en pools ; le DOM n'est écrit QUE si la
  valeur change ; `VP.w`/`VP.h` au lieu d'`innerWidth` ; aucune `new THREE.PointLight` en course ; toute matière neuve est chauffée
  au menu : **zéro programme compilé en course**, à mesurer ; `scene.onBeforeRender` se CHAÎNE ; objets immobiles en
  `matrixAutoUpdate=false`.
- Un seul écrivain par réglage : `bioApply` pour les lumières, `nitroGain(q,'source')` pour toute nitro, `sfx('famille.nom')`
  pour tout son (jamais un oscillateur bricolé sur place).
- Le hasard de la piste (`rnd`) est consommé en séquence : un tirage neuf dans la génération prend son PROPRE flux
  (`mulberry32(graine^…)`), sinon toute la piste en aval change.
- On MESURE avant d'affirmer : chiffres ou image, avant / après, et on les note au journal.

**Jeu (verdicts tenus — ne pas les défaire sans demande)**
- Zéro assistance de conduite (`ASSIST_VIRAGE=0`, `AIR_ASSIST=0`) : pouce lâché, la caisse garde son cap et sort dans les virages.
  Le mode FACILE (la seule exception) est COUPÉ depuis le 14/10 : `SANS_FACILE`, `?facile=1` le rend.
- `AIR_RATE=1` : le temps du vol n'est pas accéléré. Le virage en vol ne suit pas la vitesse (voulu).
- En vol, pouce HAUT = la caisse MONTE (`volSens`) ; au clavier ↑ piqué, ↓ cabré.
- La loi du réservoir : le vol dépense la nitro, la route la remplit — sauf les FIGURES PLANTÉES, qui en rendent tout de suite (Asphalt 8, 14/10).
- Les figures sont de la PHYSIQUE (14/10, Sacha) : des explosions qui s'additionnent, l'inertie, le planté ; l'aura des figures n'est gagnée qu'à la pose.
- Les figures paient en AURA ; l'argent vient des pièces, des portails et des primes.
- Plus aucun looping (`SANS_LOOPING`) ; Paris hors de la partie sans fin (carrière seulement).
- Plus de CARRIÈRE (`SANS_CARRIERE`, 14/10) : aucune porte n'y mène, Paris ne se joue plus ; `?carriere=1` la rend, la carrière d'avant
  vit sur la branche `garde/carriere`. Les missions restent.
- Plus aucune VOIX (`SANS_VOIX`) : ni annonceur, ni réplique, ni synthèse vocale. `?voix=1` les rend pour écouter.
- Plus de SNAKE LOOP, de DAUPHIN, de NITROOO ni de DRAGON (15/10, Sacha) : `SANS_SNAKE` / `SANS_DAUPHIN` / `SANS_NITROOO` / `SANS_DRAGON`,
  coupés pas arrachés — ni figure, ni gain, ni créature 3D (rien dans la scène, rien de compilé). Le nitro ordinaire reste.
  `?snake=1`, `?dauphin=1`, `?nitrooo=1`, `?dragon=1` (avec `?nitrooo=1`) les rendent pour comparer.
- Textes au centre de l'écran rayés par Sacha (VIRAGE SERRÉ, FRÔLÉ, PORTE, RASE-BORD, MINI/SUPER/ULTRA TURBO, pastilles sous
  le verdict ; le 15/10 : « +X AURA » de la chaîne, « ×5 EN FEU / ×8 / ×10 », le « ★ +N AURA » du dauphin, « FIGURE +N » sur la caisse) : on ne les rallume pas ; un nouveau texte au centre se propose d'abord.
- HUD de course allégé par Sacha (15/10, `<style id="hudAllege">`) : plus de jauge d'aura « MOY » (`?jauge=1` la rend, `JAUGE_AURA`), plus de
  liste des figures sous la chaîne, plus de « $×1 » au palier 0 du flow, plus de nom du pouvoir au centre. On ne les rallume pas sans lui.

**Interface (charte v4/v5 — pour tout écran neuf ou retouché ; de vieilles règles CSS y dérogent encore)**
- PENCHÉ (`--sk`) = je touche · DROIT à coins coupés = je lis · ROND = une jauge.
- L'OR = UN lingot par écran (l'unique action principale) et le vrai argent (€) ; l'argent du jeu en vert (`--cash`) ; cyan =
  aller voir ; magenta = boutique ; rouge = danger. La rareté se dit par sa couleur (`RARETES`).
- On LIT en haut, on TOUCHE en bas ; cibles de 44 px ; bords via les safe areas `--sT`/`--sB`/`--sL`/`--sR` ; une seule courbe
  `--ease`, deux durées `--t-fast`/`--t-slow`.
- Une police : Press Start 2P (locale, `--pix`). Elle n'a PAS de capitales accentuées : tout libellé passe par `TR()` (qui applique
  `majPix`) ou `sansAcc`.
- Ni emoji ni glyphe système dans l'interface : icônes pixel `pxi('nom')` (grilles `PXI_G`).
- Ni `backdrop-filter`, ni dégradé dans un texte (le logo excepté), ni `body:has(…)` pour le HUD (une classe dans `HAS_D`).
- Chaque appui répond : visuel + `uiClic(rôle)` + `hap(p)` (jamais `navigator.vibrate` en direct).
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

**Crochets de console utiles** : `dbgState()` · `dbgAuto(1,lat,{vol,nit,saut})` (pilote) · `dbgStep(n,ms)` (la boucle à la main)
· `dbgView(a,d,h)` (mode photo) · `dbgSaut()` (= NIVEAU suivant, pas un saut) · `dbgDauphin(…)` (s'envoler) ·
`dbgClassique(carte,meteo)` · `dbgCampagne(n,monde)` · `dbgNiveauJade()`/`dbgNiveauCrypto()` · `dbgEquipe(i)`/`dbgCar(i)`/
`dbgPhoto(i)`/`dbgBqVoir(i)` · `dbgSon(id)`/`dbgVu()` · `dbgLivre('ouvre')` · `dbgFren()` · `dbgVol()` · `dbgBurn()` · `dbgFlamme()` ·
`dbgQual()`/`dbgDPR()`/`dbgPerf()` · `dbgAppels(n)`/`dbgProgsListe()` (traquer une compilation en course) · `dbgMaj()` · `dbgPoki()`.

**Adresses utiles** : `?perf=1` (moniteur) · `?banc=1` (le banc de perf à lancer sur un VRAI téléphone) · `?poki=1`, `?crazy=1` ·
`?menu=leo` · `?carte=jade&meteo=orage` · `?niveau=jade`, `?niveau=crypto` · `?heure=nuit` · `?simu=1`.

**Les outils de Léo** (locaux, retirés du site par `vercel-build.sh` et des portails par `poki-construire.js`) : `simulateur.html`
(`python3 simulateur/serveur.py 9101`), `maps-ciel.html` (`python3 maps-ciel/serveur.py 9019`), `salle-blanche.html`,
`boite-dauphins.html`, `boite-singe.html`. `boite-figures.html` est EN LIGNE (/jouer/boite-figures.html).

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
⚠ Jamais retirer ni insérer une ligne au milieu de `CARS`/`CAR_UNLOCK` : la sauvegarde désigne les caisses par leur INDEX.
Retirer une caisse = `retire:1` dans sa fiche (`san` rembourse les acheteurs).

**Ajouter un habillage** (le 14/10 : « LES HABILLAGES POP » au journal)
- Une ligne dans `COSM.peinture` / `COSM.aile` / `COSM.trainee` : `id` (2 à 12 lettres a-z, sinon `san()` perd l'achat), `n`, `d`,
  `p` = prix sur la grille (commune < 4 k · rare < 16 k · exotique < 60 k · épique < 250 k · légendaire < 900 k) OU `mis:n` = gagné
  au carnet n (une ligne dans `CARNETS` dont `r` le donne, et `pk` = son prix sur Poki), `r` = la rareté écrite ; `n` et `d` dans `I18N`.
- Peinture : `c` (couleur) et `g:'s'|'c'|'o'|'g'` (satiné, chrome, or, laqué noir), ou `grad:[bas,milieu,haut]`.
- Aile : `ico`/`col` (pictogramme `PXI_G` et sa couleur) ; son DESSIN = un bâtisseur dans `AILES_POP` (pivot, côté, W9, L9, H9, y0),
  contours à plat par `ailForme`, tiges `ailTige`, textures cuites une fois `ailTex`, mouvement par `ailAnime` (lit `wingT`).
- Traînée : `rgb` = la couleur du ruban ; un EFFET = `pop:'nom'` + un émetteur dans `TRX_EMET` (quads instanciés, planche
  `trxPlanche`), `rubOff:1` s'il remplace le ruban. ⚠ Ce qui doit se voir en course garde ~0,86-0,9 de l'élan (`trxVit`).
- Essayer : `dbgHab(cat,id)` (porté à l'essai), `dbgTrx('nom')` (forcée en course). Banc : photos garage + course, muet.

**Ajouter une figure (un emplacement de vol, le double-tap nitro)**
- Une ligne dans `BASE` de `figures.js` : `{id, n, en, c, ce, p, D, aura, m:[{a:[x,y,z],t:n}]}` ou `{a, b:amplitude, k:battements}` — `c`/`ce` = le
  nom COURT du bouton (8 lettres). Depuis LES FIGURES v2, un mouvement `t` est une EXPLOSION qui donne `t` tours en ~`D` s autour de l'axe `a`
  (le point d'explosion se déduit de l'axe : `boums`), un battement est un ressort lancé. Le nom anglais `en` entre seul dans `I18N`. Elle apparaît
  au shop et à l'inventaire (`COSM.figure`), s'équipe dans l'emplacement de SA FAMILLE : `cat:'avant'` (tout sur l'axe des roues x — rien à
  choisir) ou `cat:'cote'` (au moins un mouvement a un côté : il part du côté du pouce) ; sans `cat`, `FIG.cat` la range par cette règle. `figures.js?v=` +1 dans index.html ET boite-figures.html,
  `sw.js` +1. On la regarde dans `boite-figures.html` (la même physique), on la règle au banc Node du corps (Journal, LES FIGURES v2).
- Une figure DÉTECTÉE en vol (vrille, dauphin…) : `addTrick(id,txt,…)` → `chaineAura(nom,base,famille)`.

**Ajouter un texte**
- Dans le code : `TR('LE TEXTE EN FRANÇAIS')` + sa clé EXACTE dans un `Object.assign(I18N,{…})` daté (et `I18N_ZH` si possible ;
  sinon le chinois retombe sur l'anglais). Un nombre en queue (« RÉCOLTE ×5 ») se traduit seul.
- En HTML : le texte français dans l'élément ; `applyLangDOM` le mémorise dans `data-fr` et le traduit. Jamais de `data-fr=""`.

**Ajouter un son**
- La recette dans `atelier-son/recettes.js` → `node atelier-son/cuire.js <filtre>` (réécrit `sons-banque.js`) →
  `sons-banque.js?v=` +1 dans index.html et `sw.js` +1. Dans le jeu : `sfx('famille.nom',{vol,st,pan})`.
- Avec repli : `if(!(typeof sfx==='function'&&sfx('x')))repli();` (`typeof sfx` est toujours vrai).
- On ne peut pas écouter : on MESURE (sonie, spectre) et Sacha ou Léo jugent dans `sons.html`. Jamais de voix.
- Une musique : le fichier dans `assets/audio/music/`, sa tonalité dans `SON_TON`, son branchement dans `musicLieuVoulu`
  (ou `MUSIC_LOBBY` pour le lobby).

**Ajouter un niveau (une map)**
- Mode classique : une entrée dans `SF_CARTES` (`base` = son niveau, `m` = ses météos `{bio, pluie, nuit, orage, niv, p}`) ; ses
  ambiances dans `BIOMES` ; son niveau de base dans `NIVEAUX` (le cycle fixe de Poki et `?classique=cycle`) ou à part, comme
  `NIV_JADE`/`NIV_CRYPTO`, branché dans `lvlChoisir`. Carrière : `CARRIERE`, fabriquée par `carNiveau`.
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
9. **`scene.onBeforeRender` est déjà pris** (piste, plots, ville, ciel) : chaîner, jamais réassigner.
10. **`body:has(…)` pour le HUD** rendait chaque écriture de style ~80× plus chère : une classe dans `HAS_D`.
11. **`innerWidth` lu dans la boucle** force une mise en page complète sur mobile : `VP.w`/`VP.h`. Et `textContent=` recrée le nœud
    même à valeur égale : écrire seulement si ça change.
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
18. **`TEST_CAISSES` et `TEST_CARRIERE` sont vrais sur main** : tout est ouvert (pastille TEST). C'est à Sacha de les couper avant
    une sortie — ne pas conclure d'un banc qu'une caisse « se débloque ».
19. **La recopie après une boucle de rebase arrêtée sur un conflit** a déjà emporté des marqueurs `<<<<<<<` chez Sacha.
20. **Les jugements de rendu** : la salle blanche grise les noirs (juger au garage du jeu) ; les mini-ailes repliées
    (`carWingL/R`) traversaient les vitres des caisses fines (visible en boutique seulement) ; en poursuite on voit surtout le
    DESSUS de la caisse.
21. **Un défaut d'image vu sur iPhone ne se juge qu'au PIXEL** : à l'échelle de l'écran, la trame du flou de vitesse (15/10) était
    invisible ; zoomer ×4 la MÊME image rendue avec et sans (`VARIANTES` du banc). Sur iPhone la 3D est agrandie ×2 (NETTE 1,5 sur ×3).

---

## 8. Index du JOURNAL (titres exacts, à chercher avec `grep -n "^## <début du titre>" JOURNAL.md`)

**Règles, éditions, publication**
- « ⚠ LE BURN-OUT EST À LÉO » (07/10) · « ⚠ LA VERSION DE RÉFÉRENCE — LIRE EN PREMIER » (01/10)
- « ⚠ DEUX ÉDITIONS, UN SEUL JEU » (25/09) — les éditions, la colonne de l'ordi, beaucoup de règles de conduite et de piste
- « L'ÉDITION POKI » (04/10) · « LA MÊME VERSION POUR TOUT LE MONDE — LA MISE À JOUR TOUTE SEULE » (01/10)
- « LE MENU = LE GARAGE + LES BOUTONS DE SACHA » (30/09) · « JOUER = LE MODE CLASSIQUE » (08/10) · « L'iPHONE PAR DÉFAUT SUR L'ORDI » (06/10)
- « PLUS AUCUNE VOIX » (07/10) · « LE CODE COUSIN » (14/10) · « PLUS DE CARRIÈRE + PLUS DE MODE FACILE » (14/10)
- « LA SECONDE CHANCE » (14/10) · « LA REVUE DES IDÉES DE LÉO — CORRECTIFS 7, 13, 14 » (14/10) · « L'AUTO-ÉCOLE v2 » (14/10)
- Le mode classique au hasard (13/10) n'a pas de section : le commentaire « LE MODE CLASSIQUE AU HASARD » au-dessus de `const SF` fait foi.

**Débogage, perf, bancs**
- « LES PIXELS QUI SE RÉPÈTENT — LE FLOU DE VITESSE SANS MOTIF » (15/10) — `FLOU_MIPS`, `flouMips`, `?flou=ancien` (compose avec `FLOU_V2`) ; le BANC WEBKIT
- « LA PASSE MOBILE — DÉBOGAGE ET FLUIDITÉ EN NETTE » (14/10) · « LA PASSE QUALITÉ AVANT SORTIE » (12/10)
- « LA CAMPAGNE DE DEBUG AVANT PUBLICATION » (07/10) · « L'AUDIT AVANT PUBLICATION, ZONE GAMEPLAY » (07/10) · « LA PASSE DE SORTIE » (29/09)
- « PASSE PERF iPHONE » (27/09) · « PASSE DÉBOGAGE / PERF » (26/09) · « PASSE DE FINITION » (26/09) · « LA SONDE QUI NE FIGE PLUS » (08/10)

**Conduite, vol, caméra**
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
- « LE GLACIER — LA FACE EN LACETS QUI SE SUPERPOSENT » (14/10 soir) — ex-banquise : spirales ovales superposées, raccourcis par le bord aval
- « LA BANQUISE — LA DESCENTE DES PICS DE GLACE » (14/10) — la route qui dévale, la poudreuse qui porte et qui avale, la glisse sur les lacs gelés et les pics, les aurores
- « LE ROYAUME DE FEU — LA MAP DU VOLCAN » (14/10) — le flanc qui descend, les lacs et les coulées de lave, les éruptions, les six temps
- « LA FORÊT NOIRE — LA MAP DES CONTES » (14/10) — la vallée en slalom qui descend, les géants, le jour fleuri, la nuit hantée, le loup-garou
- « LE NIVEAU « SOLEIL DE JADE » » (12/10) · « LES PICS DE JADE + LA BALADE `?map=jade` » (09/10) · « CRYPTOCITY » (13/10)
- « LES NIVEAUX — la page `maps-ciel.html` » (09-10/10) · « LE SIMULATEUR — `simulateur.html` » (12/10) · « PARIS SORT DU MODE INFINI » (10/10)
- « L'ORAGE — LE 4e NIVEAU, LE NIVEAU DUR » (29/09) · « LES NUAGES v8 — REFAITS À ZÉRO » (01/10) · « L'AUTOROUTE ORBITALE » (30/09)
- « LA CAMPAGNE NUAGES » et « LA CAMPAGNE VILLE » (27/09) · « LA VILLE DÈS L'ENTRÉE + GLASSY PLUCKS » (04/10)

**Caisses, boutique, habillages**
- « LES HABILLAGES POP + L'ÉQUILIBRAGE ARGENT / AURA + LES TEXTES FR / EN + LE GUIDE » (14/10) — 30 habillages, l'économie, les textes
- « LE DOGE » (14/10, deux sections) · « LES VRAIS MODÈLES, PLUS RESSEMBLANTS » (13/10) · « LA MERCURE v2 » (11/10)
- « LA SALLE BLANCHE » (09/10) · « LE SQUALE » (08/10) · « LE CHAT POP-TART EN VOXELS » (06/10) · « L'ORIGAMI — LE PICK-UP D'INOX » (02/10)
- « LA GAMME RESSERRÉE — LA FICHE DES VOITURES » (06-07/10) · « SIX COMMUNES RETIRÉES » (02/10)
- « LA VITRINE DU GARAGE » (04/10) · « LES LUEURS DE LA BOUTIQUE » (07/10) · « LA FENÊTRE D'ACHAT » (01/10)
- « LE MOTEUR EN ÉCLATS » (15/10) — `ECLATS`, `?eclats=0` · « LE MOTEUR QUI AVANCE + LE NITRO EN FEU DE PIXELS » (15/10) — `FLM`, `NFEU`, `?flamme=ancien`
- « LE DRAGON EN FEU DE PIXELS » (15/10) — `DFEU`, `?dragon=ancien`
- « LE SILLAGE DE NITRO v5 » (29/09) · « LE DRAGON DE PAPIER (v7) + LA DARK TRIAD EN NOIR » (01/10) · « LA PLUIE DE RICHESSE » (08/10)

**Garage, menus, écrans**
- « LA PASSE UX/UI — L'ACCUEIL, LE GARAGE, L'ŒIL, LES TRANSITIONS » (11/10) · « LE GARAGE, HUB DES TROIS » (06/10)
- « LA VUE DE LÉO DANS LA CONSOLE DE SACHA » (06/10) · « LE PREMIER BURN-OUT, REVENU — AVEC LES DONUTS » (08/10)
- « L'ÉCRAN TITRE v3 » (01/10) · « LE CIEL DE L'ÉCRAN TITRE v4 » (06/10) · « LES HEURES DU TITRE » (05/10)
- « LA CARRIÈRE v2 » (07/10) · « L'ÉCRAN DE FIN v5 » (29/09) · « MOINS DE TEXTES AU MILIEU DE L'ÉCRAN » (29/09)

**Interface et HUD**
- « LA CHARTE v5 — LAQUE · OR · NÉON » (28/09) · « LA CHARTE v4 — CARBONE · OR · NÉON » (26/09, sa grammaire reste la loi)
- « LA CHARTE AU COMPLET » (28/09) · « LA DA DU HUD, UNE SEULE FAMILLE » (28/09) · « LE HUD DE COURSE, MAÎTRISÉ ET EN MOUVEMENT » (28/09)
- « LE MOUVEMENT DE L'INTERFACE + MISSIONS v2 » (28/09) · « LA TAILLE DU HUD » (28/09) · « L'ORDRE DU HUD » (30/09)

**Son et musique**
- « LA CONSOLE DE SON » (28/09) · « LE SON EN COURSE REMIS D'APLOMB » (12/10) · « LE LOBBY « CHRIS » » (14/10)
- « LE DÉPART EN MUSIQUE » (04/10) · « PLUS DE COUPURES DE MUSIQUE + LE TEMPO MESURÉ » (03/10) · « LA MUSIQUE DE LÉO SUR MAIN » (29/09)
- « LA MUSIQUE DU CIEL ET DU GARAGE » (14/10) · « LA BIBLIOTHÈQUE DES SONS — `bibliotheque.html` » (14/10) — en ligne /jouer/bibliotheque.html

**Archives** : le bas du journal (« ⚠ FUSION SACHA × LÉO + NIVEAUX — 2026-09-24 », « ⚠ FUSION DU 2026-08-30 », puis « Le jeu »,
« Architecture », « Conventions »…) décrit des lignées anciennes. Une section plus récente l'emporte toujours sur une plus ancienne.

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
- **`AUTRE VERSION/`** (l'édition PC) est GELÉE depuis le 25/09 : on n'y touche pas. **`ROBLOX/`** est un autre jeu.
- **En ligne** : chaque push sur `main` publie https://car-cash-git.vercel.app/jouer/ (`vercel-build.sh`, ~1 min). C'est là que
  Sacha et Léo jouent sur téléphone. Le numéro « VERSION xxxxxxx » des réglages = l'empreinte du jeu publié.
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
  `sh garde-burnout.sh` (racine) doit répondre OK.
- **Versions** : `CACHE` de `sw.js` +1 (`'cashcar-vNNN'`, avec sa ligne de commentaire) dans chaque commit qui touche le jeu.
  Un fichier chargé avec `?v=N` (`sons-banque.js`, `sfx.js`, `figures.js`, `harmonie.js`) : N +1 quand il change.
  Sinon les joueurs gardent l'ancien fichier, indéfiniment, sans erreur.
- **Commit** : `git add "VERSION PRINCIPALE/<fichiers>"`. **Jamais `git add -A`** : des fichiers d'autres sessions traînent (ml/,
  données de Léo). Message en français qui cite la demande.
- **Intégrer** : `git fetch origin` puis `git rebase origin/main` (ou `git merge origin/main`). Jamais `--force`, jamais de `reset`
  ni de revert du travail de l'autre ; dans un conflit on garde les deux. Conflit habituel : la ligne `CACHE` de `sw.js` → le plus
  grand +1, les deux commentaires gardés. Revérifier après l'intégration.
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
  de Sacha (`MENU_SACHA`, celui de Léo = `?menu=leo`), JOUER = le mode classique au hasard (le Soleil de jade direct = `?play=jade`,
  la carrière au PLAY = `?play=carriere`), l'iPhone avec encoche sur l'ordi (`ENCOCHE_DEFAUT`, écran nu = `?encoche=0`).
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
  (la charte v4/v5 : tous les écrans hors course), `hudMaitrise`, `hudDA`, `garageV7`, `garageVitrine`, `hubGarage`, `carriereV2`,
  `poki`, `uxPasse`, `nitroEclair`, `auraJauge`, `passeMobile`. Un chantier d'interface = son propre bloc nommé, après ceux qu'il surcharge.
- JS : le grand script est une IIFE (`(function(){'use strict'; … requestAnimationFrame(loop);})()`). Rien n'est global, sauf les
  crochets de console `window.dbg*`.

**Les systèmes et leurs noms**
- **Boucle et états** : `loop` (son try/catch avale les erreurs : `window.__loopErr`), `start`, `resetGame`, `endGame`,
  `explode(cause)`, `mode` = 'drive' | 'fall' | 'boom', `togglePause`, `repriseCompte`.
- **Conduite** : `TCTL` (volant tactile et souris), `keys`, `steer`, `yawR`, `lacetMax`, `driftYaw`, `momT`, `SPD` (vitesse globale),
  `ASSIST_VIRAGE` (= 0), `bindHold`, `CAM_ROUTE`, `fovFit`.
- **Vol et pose** : `startFall`, `tryLand`, `AIR_RATE` (= 1), `FALL_G`, `fallVH0`, `FLY_U`, `VEQ`/`VEQ_K` (le vol équilibré),
  `veqDouble`/`veqSaut` (double-tap nitro), `FIG` (figures.js), `addTrick`, `trackMinY`, `dalleProche`.
- **Piste et niveaux** : `newTrack` → `lvlChoisir` → `genCtrl` → `buildTrack` ; `frameAt`, `rnd`/`mulberry32`, `NIVEAUX`, `LVL`,
  mode classique `SF`/`SF_CARTES`/`sfTire`/`sfNiveau`, carrière `CARRIERE`/`carNiveau`/`CARR`, `NIV_JADE`/`buildJade`, `NIV_CRYPTO`, `NIV_CANYON`/`genCanyon`/`buildCanyon`/`dbgCanyon`,
  `buildVoxCity`/`CITY`, `orbiteBuild`, `PORTAL`/`portailPasse`, `spawnPickups`, `LIGNE`/`ligneTick`, `SANS_LOOPING`.
- **Ciel et décor** : `BIOMES`/`bioApply` (le SEUL écrivain des lumières), `skyDome`, `CIEL2`, `COTON`/`CLOUDS`/`buildClouds`/
  `updateClouds`, `paintEnv`.
- **Caisses** : `CARS` (les fiches), `CAR_UNLOCK` (prix et conditions, même index), `SHAPES` (les gabarits), `buildCar`, le kit
  low-poly `lpKit`/`lpMat`/`lpWheel`, tuyères `CAR_POTS`/`potMonde`, raretés `RARETES`/`carRar`/`rarListe`/`carOrdre`,
  `carUnlocked`/`carUnlockedVrai`/`carOwned`/`carRetiree`, vignettes `carPhoto`.
- **Boutique, habillages, figures** : `COSM` (peinture · aile · trainee · figure), `SHOP`, `shopBuy`, `shopOwned`, `shopEquip`, `cosm`,
  `FX_EFF`, `BQ_CATS`, `bqEphemeres` (les offres de la semaine), la salle blanche 3D `GBQ`/`garBqBatit`/`garBqPanneau`, `gShopJour`,
  `figAchat`/`figPossede`, `eurTxt`, `shopPaye` (la porte StoreKit : elle refuse tout aujourd'hui).
- **Garage et menus** : `openGarage`/`closeGarage`/`garageRender`, `garMode`/`GMODE`, `GAR`, `garLibre`/`garCadre`, `invOuvre`,
  `MENU_SACHA`, `HUB`/`hubSync`, l'accueil au ciel `chuteRender`/`CHUTE`/`TITRE_H`, la coque `#mob` (`mGo`, `mTap`, `#mHome`,
  `#mDead`), `ecranWipe`, `modale`, `toast`, `uiGarde`, carrière `#carr`/`carrVue`, missions `CARNETS`/`misTick`.
- **HUD** : `#hud`, `hudColonne`, `hautPasse` (une carte à la fois), `slam`, `trickMsg`, `flowHudMaj`, `ajTick` (jauge d'aura),
  `VOLG` (les gains qui volent vers leur jauge), `airPieDraw`, `#tNitro`, pause `#tGear`/`#tPanel`/`panSync`, `HAS_D`/`hasMaj`.
- **Économie** : `bank()` (= `SAVE.d.bank`), `DENOMS`/`ECO3`/`denom()`, rangs d'aura `AURA_RANKS`/`auraRank` (13 depuis le 14/10), moteur `ENGINE_TIERS`/`engTier`/`coinsGot`/`addCoins`,
  aura `CHA`/`chaineAura`/`CHA_VIE`, flow `FLOW`/`FLOW2`/`FREN`/`flowAdd`/`flowMult()`, pouvoirs `PWR_DEFS`.
- **Nitro** : le bloc `<<<NITRO2>>>` (la loi du réservoir), `NIT`, `nitroGain(q,src)`, `nitroTientDe`, `nitroOn`, `NFX`/`nitroAllume`,
  le grand livre `LIVRE`/`livre`/`dbgLivre`.
- **Effets** : traînées de lumière `LUMT` nées des feux arrière `CAR_FEUX` (`dbgFeux`), sillages `SILS`/`mkSillage`/`sillageStep`/`trailStep`, plumes `JETS`, `rainbow`, `WOWT`/`wowStep`, les TRAÎNÉES POP
  `TRX`/`TRX_EMET`/`trxStep`/`trxApercu`/`trxPlanche`, les AILES POP `AILES_POP`/`ailForme`/`ailAnime`, dragon `DRG`,
  dauphins `DAUPH`/`dolTick`, pluies d'argent `PLA`/`RICH`, particules `makePool`/`spawnP`.
- **Son** : `sfx(id,o)`, `son(id,repli)`, `SONV2`, `uiClic(rôle)`, `hap(p)`, `MASTER`, `PORTES`/`stt`, `initAudio`,
  `SON_TON`/`sonTonSuit`, `ECH`/`echSt`, `SANS_VOIX`. Fichiers : `sfx.js` (lecteur), `sons-banque.js` (banque cuite),
  `atelier-son/` (`recettes.js`, `cuire.js`), `sons.html` (banc d'écoute).
- **Musique** : `MUSIC`/`MUSIC_LOBBY`, `musicTick`, `musicJoue`, `playMusic`, `musicLieuVoulu`, `MUS_TAIT`, `DEPMUS`,
  `JMUS_NIV` (GLISSE V2 : `assets/audio/music/musique-glisse-v2.js`), `INSTRU` (coupé).
- **Sauvegarde** : `SAVE` (clé localStorage `cashcarSave`, `def()`, `san()`, `flush()`, `mark()`, `export()`/`import()`),
  le code caché `codeCousin`/`cousin()`.
- **Langue** : `LANG`, `TR`, `I18N`, `I18N_ZH`, `applyLangDOM` (`data-fr`), `majPix`, `sansAcc`.
- **Éditions et appareils** : `POKI`, `CC_PK`/`KITS`/`pkPasse`, `TEST_CAISSES`, `FACILE_OK`, `IS_MOBILE`, `TEL_NATIF`, `FORCE_TEL`,
  `SIMU_JEU`, `BALADE`.
- **Perf** : qualité auto `QL`/`QLR`/`qlSonde`, résolution `applyDPR`/`applyQ`/`curDPR`/`DPR_CAP`/`DPR_MIN`, chauffe
  `chauffeRendu`/`chauffeDivers`/`engChauffe`/`atelierChauffe`, sursis `MAT_SURSIS`/`CAR_GARDE`/`ENG_GARDE`, `SCENE_TOUJOURS`,
  `VP`, `pisteTranches`, `LFB_SANS_PL`, `atelierLampes`.

---

## 4. Les règles qui tiennent

**Code**
- Le style compact du fichier ; commentaires en FRANÇAIS, datés et signés (`(2026-10-14, Léo : « … »)`), qui disent POURQUOI.
- Un commentaire au MILIEU d'une ligne s'écrit `/* … */`, jamais `//` (voir piège n° 1).
- Perf : rien n'est alloué dans la boucle (on réutilise les vecteurs `tmp…`), particules en pools ; le DOM n'est écrit QUE si la
  valeur change ; `VP.w`/`VP.h` au lieu d'`innerWidth` ; aucune `new THREE.PointLight` en course ; toute matière neuve est chauffée
  au menu : **zéro programme compilé en course**, à mesurer ; `scene.onBeforeRender` se CHAÎNE ; objets immobiles en
  `matrixAutoUpdate=false`.
- Un seul écrivain par réglage : `bioApply` pour les lumières, `nitroGain(q,'source')` pour toute nitro, `sfx('famille.nom')`
  pour tout son (jamais un oscillateur bricolé sur place).
- Le hasard de la piste (`rnd`) est consommé en séquence : un tirage neuf dans la génération prend son PROPRE flux
  (`mulberry32(graine^…)`), sinon toute la piste en aval change.
- On MESURE avant d'affirmer : chiffres ou image, avant / après, et on les note au journal.

**Jeu (verdicts tenus — ne pas les défaire sans demande)**
- Zéro assistance de conduite (`ASSIST_VIRAGE=0`, `AIR_ASSIST=0`) : pouce lâché, la caisse garde son cap et sort dans les virages.
  Seule exception : le mode FACILE, en option (`facOn()`).
- `AIR_RATE=1` : le temps du vol n'est pas accéléré. Le virage en vol ne suit pas la vitesse (voulu).
- En vol, pouce HAUT = la caisse MONTE (`volSens`) ; au clavier ↑ piqué, ↓ cabré.
- La loi du réservoir : le vol dépense la nitro, la route la remplit.
- Les figures paient en AURA ; l'argent vient des pièces, des portails et des primes.
- Plus aucun looping (`SANS_LOOPING`) ; Paris hors de la partie sans fin (carrière seulement).
- Plus aucune VOIX (`SANS_VOIX`) : ni annonceur, ni réplique, ni synthèse vocale. `?voix=1` les rend pour écouter.
- Plus de SNAKE LOOP, de DAUPHIN, de NITROOO ni de DRAGON (15/10, Sacha) : `SANS_SNAKE` / `SANS_DAUPHIN` / `SANS_NITROOO` / `SANS_DRAGON`,
  coupés pas arrachés — ni figure, ni gain, ni créature 3D (rien dans la scène, rien de compilé). Le nitro ordinaire reste.
  `?snake=1`, `?dauphin=1`, `?nitrooo=1`, `?dragon=1` (avec `?nitrooo=1`) les rendent pour comparer.
- Textes au centre de l'écran rayés par Sacha (VIRAGE SERRÉ, FRÔLÉ, PORTE, RASE-BORD, MINI/SUPER/ULTRA TURBO, pastilles sous
  le verdict) : on ne les rallume pas ; un nouveau texte au centre se propose d'abord.

**Interface (charte v4/v5 — pour tout écran neuf ou retouché ; de vieilles règles CSS y dérogent encore)**
- PENCHÉ (`--sk`) = je touche · DROIT à coins coupés = je lis · ROND = une jauge.
- L'OR = UN lingot par écran (l'unique action principale) et le vrai argent (€) ; l'argent du jeu en vert (`--cash`) ; cyan =
  aller voir ; magenta = boutique ; rouge = danger. La rareté se dit par sa couleur (`RARETES`).
- On LIT en haut, on TOUCHE en bas ; cibles de 44 px ; bords via les safe areas `--sT`/`--sB`/`--sL`/`--sR` ; une seule courbe
  `--ease`, deux durées `--t-fast`/`--t-slow`.
- Une police : Press Start 2P (locale, `--pix`). Elle n'a PAS de capitales accentuées : tout libellé passe par `TR()` (qui applique
  `majPix`) ou `sansAcc`.
- Ni emoji ni glyphe système dans l'interface : icônes pixel `pxi('nom')` (grilles `PXI_G`).
- Ni `backdrop-filter`, ni dégradé dans un texte (le logo excepté), ni `body:has(…)` pour le HUD (une classe dans `HAS_D`).
- Chaque appui répond : visuel + `uiClic(rôle)` + `hap(p)` (jamais `navigator.vibrate` en direct).
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

**Crochets de console utiles** : `dbgState()` · `dbgAuto(1,lat,{vol,nit,saut})` (pilote) · `dbgStep(n,ms)` (la boucle à la main)
· `dbgView(a,d,h)` (mode photo) · `dbgSaut()` (= NIVEAU suivant, pas un saut) · `dbgDauphin(…)` (s'envoler) ·
`dbgClassique(carte,meteo)` · `dbgCampagne(n,monde)` · `dbgNiveauJade()`/`dbgNiveauCrypto()` · `dbgEquipe(i)`/`dbgCar(i)`/
`dbgPhoto(i)`/`dbgBqVoir(i)` · `dbgSon(id)`/`dbgVu()` · `dbgLivre('ouvre')` · `dbgFren()` · `dbgVol()` · `dbgBurn()` ·
`dbgQual()`/`dbgDPR()`/`dbgPerf()` · `dbgAppels(n)`/`dbgProgsListe()` (traquer une compilation en course) · `dbgMaj()` · `dbgPoki()`.

**Adresses utiles** : `?perf=1` (moniteur) · `?banc=1` (le banc de perf à lancer sur un VRAI téléphone) · `?poki=1`, `?crazy=1` ·
`?menu=leo` · `?carte=jade&meteo=orage` · `?carte=canyon&meteo=soir` (`?cyw=0` : sans travailleur) · `?niveau=jade`, `?niveau=crypto` · `?heure=nuit` · `?simu=1`.

**Les outils de Léo** (locaux, retirés du site par `vercel-build.sh` et des portails par `poki-construire.js`) : `simulateur.html`
(`python3 simulateur/serveur.py 9101`), `maps-ciel.html` (`python3 maps-ciel/serveur.py 9019`), `salle-blanche.html`,
`boite-dauphins.html`, `boite-singe.html`. `boite-figures.html` est EN LIGNE (/jouer/boite-figures.html).

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
⚠ Jamais retirer ni insérer une ligne au milieu de `CARS`/`CAR_UNLOCK` : la sauvegarde désigne les caisses par leur INDEX.
Retirer une caisse = `retire:1` dans sa fiche (`san` rembourse les acheteurs).

**Ajouter un habillage** (le 14/10 : « LES HABILLAGES POP » au journal)
- Une ligne dans `COSM.peinture` / `COSM.aile` / `COSM.trainee` : `id` (2 à 12 lettres a-z, sinon `san()` perd l'achat), `n`, `d`,
  `p` = prix sur la grille (commune < 4 k · rare < 16 k · exotique < 60 k · épique < 250 k · légendaire < 900 k) OU `mis:n` = gagné
  au carnet n (une ligne dans `CARNETS` dont `r` le donne, et `pk` = son prix sur Poki), `r` = la rareté écrite ; `n` et `d` dans `I18N`.
- Peinture : `c` (couleur) et `g:'s'|'c'|'o'|'g'` (satiné, chrome, or, laqué noir), ou `grad:[bas,milieu,haut]`.
- Aile : `ico`/`col` (pictogramme `PXI_G` et sa couleur) ; son DESSIN = un bâtisseur dans `AILES_POP` (pivot, côté, W9, L9, H9, y0),
  contours à plat par `ailForme`, tiges `ailTige`, textures cuites une fois `ailTex`, mouvement par `ailAnime` (lit `wingT`).
- Traînée : `rgb` = la couleur du ruban ; un EFFET = `pop:'nom'` + un émetteur dans `TRX_EMET` (quads instanciés, planche
  `trxPlanche`), `rubOff:1` s'il remplace le ruban. ⚠ Ce qui doit se voir en course garde ~0,86-0,9 de l'élan (`trxVit`).
- Essayer : `dbgHab(cat,id)` (porté à l'essai), `dbgTrx('nom')` (forcée en course). Banc : photos garage + course, muet.

**Ajouter une figure (double-tap nitro)**
- Une ligne dans `BASE` de `figures.js` : `{id, n, en, p, D, aura, m:[{a:[x,y,z],t:n}]}` ou `{a, b:amplitude, k:battements}`.
  Chaque mouvement finit à l'identité (`valide()` refuse le reste). Le nom anglais `en` entre seul dans `I18N`. Elle apparaît au shop
  et à l'inventaire (`COSM.figure`). `figures.js?v=` +1 dans index.html, `sw.js` +1. On la regarde dans `boite-figures.html`.
- Une figure DÉTECTÉE en vol (vrille, dauphin…) : `addTrick(id,txt,…)` → `chaineAura(nom,base,famille)`.

**Ajouter un texte**
- Dans le code : `TR('LE TEXTE EN FRANÇAIS')` + sa clé EXACTE dans un `Object.assign(I18N,{…})` daté (et `I18N_ZH` si possible ;
  sinon le chinois retombe sur l'anglais). Un nombre en queue (« RÉCOLTE ×5 ») se traduit seul.
- En HTML : le texte français dans l'élément ; `applyLangDOM` le mémorise dans `data-fr` et le traduit. Jamais de `data-fr=""`.

**Ajouter un son**
- La recette dans `atelier-son/recettes.js` → `node atelier-son/cuire.js <filtre>` (réécrit `sons-banque.js`) →
  `sons-banque.js?v=` +1 dans index.html et `sw.js` +1. Dans le jeu : `sfx('famille.nom',{vol,st,pan})`.
- Avec repli : `if(!(typeof sfx==='function'&&sfx('x')))repli();` (`typeof sfx` est toujours vrai).
- On ne peut pas écouter : on MESURE (sonie, spectre) et Sacha ou Léo jugent dans `sons.html`. Jamais de voix.
- Une musique : le fichier dans `assets/audio/music/`, sa tonalité dans `SON_TON`, son branchement dans `musicLieuVoulu`
  (ou `MUSIC_LOBBY` pour le lobby).

**Ajouter un niveau (une map)**
- Mode classique : une entrée dans `SF_CARTES` (`base` = son niveau, `m` = ses météos `{bio, pluie, nuit, orage, niv, p}`) ; ses
  ambiances dans `BIOMES` ; son niveau de base dans `NIVEAUX` (le cycle fixe de Poki et `?classique=cycle`) ou à part, comme
  `NIV_JADE`/`NIV_CRYPTO`, branché dans `lvlChoisir`. Carrière : `CARRIERE`, fabriquée par `carNiveau`.
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
9. **`scene.onBeforeRender` est déjà pris** (piste, plots, ville, ciel) : chaîner, jamais réassigner.
10. **`body:has(…)` pour le HUD** rendait chaque écriture de style ~80× plus chère : une classe dans `HAS_D`.
11. **`innerWidth` lu dans la boucle** force une mise en page complète sur mobile : `VP.w`/`VP.h`. Et `textContent=` recrée le nœud
    même à valeur égale : écrire seulement si ça change.
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
18. **`TEST_CAISSES` et `TEST_CARRIERE` sont vrais sur main** : tout est ouvert (pastille TEST). C'est à Sacha de les couper avant
    une sortie — ne pas conclure d'un banc qu'une caisse « se débloque ».
19. **La recopie après une boucle de rebase arrêtée sur un conflit** a déjà emporté des marqueurs `<<<<<<<` chez Sacha.
20. **Les jugements de rendu** : la salle blanche grise les noirs (juger au garage du jeu) ; les mini-ailes repliées
    (`carWingL/R`) traversaient les vitres des caisses fines (visible en boutique seulement) ; en poursuite on voit surtout le
    DESSUS de la caisse.

---

## 8. Index du JOURNAL (titres exacts, à chercher avec `grep -n "^## <début du titre>" JOURNAL.md`)

**Règles, éditions, publication**
- « ⚠ LE BURN-OUT EST À LÉO » (07/10) · « ⚠ LA VERSION DE RÉFÉRENCE — LIRE EN PREMIER » (01/10)
- « ⚠ DEUX ÉDITIONS, UN SEUL JEU » (25/09) — les éditions, la colonne de l'ordi, beaucoup de règles de conduite et de piste
- « L'ÉDITION POKI » (04/10) · « LA MÊME VERSION POUR TOUT LE MONDE — LA MISE À JOUR TOUTE SEULE » (01/10)
- « LE MENU = LE GARAGE + LES BOUTONS DE SACHA » (30/09) · « JOUER = LE MODE CLASSIQUE » (08/10) · « L'iPHONE PAR DÉFAUT SUR L'ORDI » (06/10)
- « PLUS AUCUNE VOIX » (07/10) · « LE CODE COUSIN » (14/10)
- Le mode classique au hasard (13/10) n'a pas de section : le commentaire « LE MODE CLASSIQUE AU HASARD » au-dessus de `const SF` fait foi.

**Débogage, perf, bancs**
- « LA PASSE MOBILE — DÉBOGAGE ET FLUIDITÉ EN NETTE » (14/10) · « LA PASSE QUALITÉ AVANT SORTIE » (12/10)
- « LA CAMPAGNE DE DEBUG AVANT PUBLICATION » (07/10) · « L'AUDIT AVANT PUBLICATION, ZONE GAMEPLAY » (07/10) · « LA PASSE DE SORTIE » (29/09)
- « PASSE PERF iPHONE » (27/09) · « PASSE DÉBOGAGE / PERF » (26/09) · « PASSE DE FINITION » (26/09) · « LA SONDE QUI NE FIGE PLUS » (08/10)

**Conduite, vol, caméra**
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
- « LE NIVEAU « SOLEIL DE JADE » » (12/10) · « LES PICS DE JADE + LA BALADE `?map=jade` » (09/10) · « CRYPTOCITY » (13/10) · « LE CANYON DES GÉANTS » (14/10) · « LE CANYON v2 — RACCOURCIS, COULOIR, TUNNEL » (14/10 soir)
- « LES NIVEAUX — la page `maps-ciel.html` » (09-10/10) · « LE SIMULATEUR — `simulateur.html` » (12/10) · « PARIS SORT DU MODE INFINI » (10/10)
- « L'ORAGE — LE 4e NIVEAU, LE NIVEAU DUR » (29/09) · « LES NUAGES v8 — REFAITS À ZÉRO » (01/10) · « L'AUTOROUTE ORBITALE » (30/09)
- « LA CAMPAGNE NUAGES » et « LA CAMPAGNE VILLE » (27/09) · « LA VILLE DÈS L'ENTRÉE + GLASSY PLUCKS » (04/10)

**Caisses, boutique, habillages**
- « LES HABILLAGES POP + L'ÉQUILIBRAGE ARGENT / AURA + LES TEXTES FR / EN + LE GUIDE » (14/10) — 30 habillages, l'économie, les textes
- « LE DOGE » (14/10, deux sections) · « LES VRAIS MODÈLES, PLUS RESSEMBLANTS » (13/10) · « LA MERCURE v2 » (11/10)
- « LA SALLE BLANCHE » (09/10) · « LE SQUALE » (08/10) · « LE CHAT POP-TART EN VOXELS » (06/10) · « L'ORIGAMI — LE PICK-UP D'INOX » (02/10)
- « LA GAMME RESSERRÉE — LA FICHE DES VOITURES » (06-07/10) · « SIX COMMUNES RETIRÉES » (02/10)
- « LA VITRINE DU GARAGE » (04/10) · « LES LUEURS DE LA BOUTIQUE » (07/10) · « LA FENÊTRE D'ACHAT » (01/10)
- « LE SILLAGE DE NITRO v5 » (29/09) · « LE DRAGON DE PAPIER (v7) + LA DARK TRIAD EN NOIR » (01/10) · « LA PLUIE DE RICHESSE » (08/10)

**Garage, menus, écrans**
- « LA PASSE UX/UI — L'ACCUEIL, LE GARAGE, L'ŒIL, LES TRANSITIONS » (11/10) · « LE GARAGE, HUB DES TROIS » (06/10)
- « LA VUE DE LÉO DANS LA CONSOLE DE SACHA » (06/10) · « LE PREMIER BURN-OUT, REVENU — AVEC LES DONUTS » (08/10)
- « L'ÉCRAN TITRE v3 » (01/10) · « LE CIEL DE L'ÉCRAN TITRE v4 » (06/10) · « LES HEURES DU TITRE » (05/10)
- « LA CARRIÈRE v2 » (07/10) · « L'ÉCRAN DE FIN v5 » (29/09) · « MOINS DE TEXTES AU MILIEU DE L'ÉCRAN » (29/09)

**Interface et HUD**
- « LA CHARTE v5 — LAQUE · OR · NÉON » (28/09) · « LA CHARTE v4 — CARBONE · OR · NÉON » (26/09, sa grammaire reste la loi)
- « LA CHARTE AU COMPLET » (28/09) · « LA DA DU HUD, UNE SEULE FAMILLE » (28/09) · « LE HUD DE COURSE, MAÎTRISÉ ET EN MOUVEMENT » (28/09)
- « LE MOUVEMENT DE L'INTERFACE + MISSIONS v2 » (28/09) · « LA TAILLE DU HUD » (28/09) · « L'ORDRE DU HUD » (30/09)

**Son et musique**
- « LA CONSOLE DE SON » (28/09) · « LE SON EN COURSE REMIS D'APLOMB » (12/10) · « LE LOBBY « CHRIS » » (14/10)
- « LE DÉPART EN MUSIQUE » (04/10) · « PLUS DE COUPURES DE MUSIQUE + LE TEMPO MESURÉ » (03/10) · « LA MUSIQUE DE LÉO SUR MAIN » (29/09)
- « LA MUSIQUE DU CIEL ET DU GARAGE » (14/10) · « LA BIBLIOTHÈQUE DES SONS — `bibliotheque.html` » (14/10) — en ligne /jouer/bibliotheque.html

**Archives** : le bas du journal (« ⚠ FUSION SACHA × LÉO + NIVEAUX — 2026-09-24 », « ⚠ FUSION DU 2026-08-30 », puis « Le jeu »,
« Architecture », « Conventions »…) décrit des lignées anciennes. Une section plus récente l'emporte toujours sur une plus ancienne.
