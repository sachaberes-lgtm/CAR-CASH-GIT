# Notes de l'agent `accord` (session GAMEPLAY, 2026-10-14) — la passe d'ACCORD des retours de ressenti

Copie : `sensations/wt/accord` (branche `travail`, base `695c17a` = sensations-integration 2369629). Cap de Sacha (6 h 10) : « ce sont les
DÉTAILS qui m'intéressent, le jeu le plus PROPRE possible ; rends chaque chose COMPATIBLE et MAGNIFIQUE les unes avec les autres ».
Règle suivie : un seul geste juste par événement ; le geste de LÉO garde sa place (on l'améliore, on ne l'annule jamais), le détail SENS
qui le double se retire ou se fond dedans ; rien de la physique, de la vitesse, de la conduite, de l'économie ; burn-out intouché.
Tout ce qui est retiré de la passe SENSATIONS revient avec `?sens=0` (gardé par `SENS` / `SENSG`).

Légende des colonnes : **qui** = L (Léo : VEQ / figures du catalogue), G (GAMEPLAY : figures libres), S (passe SENSATIONS), J (le jeu d'avant).
Lignes = celles de la copie APRÈS les correctifs (elles bougent : cherche par nom). « vib » = `hap` / `sensHap` ; Taptic d'iOS (dans `hap`) :
≤ 12 ms LÉGER · ≤ 40 MOYEN · au-delà LOURD ; un motif [a,b,c] rejoue chaque impulsion à son heure.

## 1. INVENTAIRE (avant correctifs) — tout ce qui part, événement par événement

| événement | qui | fonction (ligne) | retour | intensité / durée |
|---|---|---|---|---|
| **décollage** (crête, trou, catapulte) | J | `startFall` (39115) | poussière ×14 + flammes ×8 sous la caisse ; son `decollage` / `chute` ; crépitement moteur | — |
| | L | `veqDepart` (dans startFall) | verrou du volant, ressorts de vol, suspension qui se détend (`VEQ.ext` → .11) | — |
| | S | `startFall` (ligne « LE SOL LÂCHE ») | vib | catapulte (impU ≥ 5) `[10,26,14]` f2 · sinon `9` f1 |
| | J | catapulte (boucle, `RAMPS`) | `sfx('pad')`, 20 étincelles or, shake .55 | (pas de vib en propre) |
| **braquage (heist)** | J | `heistFire` (38019) | vib `[16,40,16]` PUIS `startFall(42)` → + vib SENS `[10,26,14]` **à la même image** | doublon |
| **sortie par le bord** | J/L | `startFall(0,1,true)` + `veqDepart` (coup de roulis `brV` 4 vers le vide) | 10 étincelles or (pas de flamme) | — |
| | S | `sensCaisse` (lèvre : roue dehors) | vib `8` f1 + cran de caisse (sensCoup lat .45, pompe −.3) | une fois par approche, ≥ 450 ms |
| | J | boucle (RASE-BORD) | vib `12` à 0,6 s, étincelles, son haché | — |
| | S | `startFall` | vib `9` f1 au décollage | — |
| **pose** (déclarée à 3 m par `tryLand`, contact par `touche9` via `POSE_F`) | J | verdict de `tryLand` — À LA DÉCLARATION | vib PARFAIT `15` · ordinaire `14` · LOURD `45` ; (braquage) +`15` à la même image | **≈ 0,1-0,4 s AVANT les roues** |
| | L | `veqPose` (déclaration) | assiette restante → `carRoll9`, `rollV`, `driftYaw`, `VEQ.sp` (nez = tangage restant) | — |
| | L | `veqContact` (contact, en tête de touche9) | suspension qui claque (`susY/susV`), **NEZ QUI PLONGE `VEQ.spV += .9+2,4k`** (k = imp/14), caméra qui s'enfonce 0,36 s (`veqCamera`), anneau de poussière (gros) | — |
| | J | `touche9` | `poseGerbe`, `thud`, `shake`, `squashT`, `pneuMord` | — |
| | S | `sensPose` (contact) | **NEZ `SCOUP.pv += .35+1,5k'`** (k' = imp/10) + DÉVERS du crabe (`rollV`, psi×3) ; vib seulement SANS verdict : `9` f1 · `16` f2 · `34` f3 | **double plongée du nez** ; 34 ms = MOYEN sur iOS alors que « lourd » |
| pose douce / nette / lourde | — | même chemin, dosé par `impact` (<4,5 PARFAIT · ≥10 LOURD) | | |
| pose en crabe | S + L | dévers SENS + roulis restant de Léo (`veqPose`) | compatibles (deux causes différentes) | gardés |
| **lèvre rattrapée** | J/L | `levreRattrape` (39544) + `veqPose` | vib `18`, thud, 8 étincelles, shake .28 | — |
| | S | `sensCaisse` (la roue remonte, plus tard) | vib `10` f1 + coup de caisse + 2-4 étincelles | moment distinct |
| **bump** (tranche) | J | `tryLand` (bloc BUMP) | vib `24`, `bumpSfx`, `thud`, shake, `dropChip`, **12 étincelles or au CENTRE** | — |
| | S | `sensBumpFlanc` (39109) | **4-10 étincelles or au FLANC** | deux gerbes d'or à la même image |
| **saut nitro** (double-tap au sol) | L | `veqSaut` (36589) | 26 flammes contre la route, 10 étincelles, shake .45, fov +8, **vib `[12,30,18]`**, `sfx('nitro.plein')` | — |
| | S | `startFall` (appelé par veqSaut AVANT sa vib) | **vib `[10,26,14]`** (impU 21 ≥ 5) | même image |
| | G | `figLibreTap` (via `veqFigure`, même image) | 10 flammes (« tuyères »), shake .22, fov 3,5, **vib `[10,22,14]`**, `sfx('fig.vrille')` | même image |
| | J | `startFall` | `sfx('decollage')`, poussière/flammes | — |
| **petit saut** (dos d'âne, replacement) | S | boucle (`SCOUP.hop`) | retombée : nez .5+.9k, poussière ×2 roues, vib `8+10k` f1 ; muet si une pose est portée (`POSE_F`) | — |
| **dos d'âne** | J | boucle (`BUMPS`) | `sfx('dosdane')`, shake .15, `vA×.97` | — |
| | S | boucle | nez levé −1,2…−2, **vib `14` f2** → sa propre retombée (f1) se taisait dans les 220 ms | grammaire : un sautillement, pas un coup net |
| **plaque BOOST** | J | boucle (`PADS`) | vib `10` (train `[10,16,10]`), `sfx('pad')`, slam, flash, fov | — |
| | S | boucle | nez levé, cul écrasé, gerbe d'or sous la poupe | pas de vib en plus : OK |
| **plot percuté / porte** | J | boucle (`CONES`) | vib `10`, son, éclats rouges | — |
| | S | boucle | coup de caisse ; PORTE : **vib `[16,24,10]` f2 à la même image que le `10`** | doublon |
| **frôlé** | J | `frole` (28911) | vib `8` / `[8,20,8]`, fov, étincelles, son | — |
| | S | `frole` | la caisse s'écarte (sensCoup) | pas de vib en plus : OK |
| **flaque** | J | boucle (`OILS`) | vib `60`, son, shake .2 | — |
| | S | boucle | gerbe d'eau / voile d'huile, caisse couchée | OK |
| **appui NITRO** (le doigt) | J | `bindHold` → `dn` (51679) | **vib `9`** au toucher | — |
| | J | boucle → `nitroAllume` (36829) à l'image suivante | **vib `[14,26,10]`** (bleu `[8,16,8]`), « à vide » `6` | deux impulsions à ~16 ms pour UN appui |
| **coup de nitro** (allumage) | J | `nitroAllume` | cabrage, onde, champ, son, vib (ci-dessus) | — |
| **coupure** (lâcher > 0,35 s) | S | `sensNitro` (36853) | nez qui plonge, vib `9` f1 | OK (rien d'autre à cet instant) |
| **panne sèche** | S | `sensNitro` | deux ratés : nez ×2, vib `[12,118,12]` f2, frémissement .1 / .07 | OK |
| **rapport** | J | boucle (son moteur) | vib `5`, son, fov +1,8 | — |
| | S | `sensNitro` | le nez salue (.45) | OK |
| **glisse** | S | `sensGlisse` (28298) | accroche : caisse jetée + vib `8` ; paliers : tassement ; relâché : assise + étincelles ; reprise : vib `7` | — |
| | J | `driftTick` (28373) | paliers vib `10` / `[14,30,14]` ; relâché vib `[12,30,20]` | moments distincts : OK |
| **figure en vol** (double-tap en l'air) | G | `figLibreTap` | 10 flammes, shake .22, fov, vib `[10,22,14]`, son | — |
| | G | `figLibreDemi` (36652) | chaque demi-tour : vib `7` ; tour complet `[8,14,10]` | en DIAGONALE deux axes finissent à la même image : deux vib |
| | L | `veqFigure` (catalogue, `?fig=script`) | vib `[10,30,10]` | — |
| **entrée dans l'eau** | L | `jadeEauVol` (16452) | couronne, colonne, gouttes ; vib `[10,14]` (contact) · `[20,30,40]` (plongeon) | — |
| | S | `sensEau` (16547) | à flot : LE BOUCHON écrit `carBody.position.y` (pilonnement) **par-dessus** `VEQ.ext` (la suspension pendante de Léo, écrite par `veqCorps` à la même image) | marche de ≈ 11 cm en touchant l'eau, et en la quittant |
| | S | `sensEau` | creux du plongeon : bulles, bloop, vib `12` f1 | moment distinct : OK |
| **sortie d'eau** | L | `jadeEauVol` | vib `[12,18,26]`, sons | — |
| | S | `sensMouille` | pose trempée : gerbes aux roues (pas de vib) | OK |
| **nuage** | S | `sensNuage` (11850) | entrée « p…ouf » `6` / `[5,24-34,7-11]` f1 ; défonce `[15,24,10]` f2 ; sortie `5` | OK (le nuage n'a rien d'autre) |
| **portail** | S | `portailPasse` (39016) | vib `[22,36,12]` f3 ; ½ s après, la caisse s'assoit | OK (le portail n'avait aucune vib) |
| **ramassages** | J | `pickupsTick` (48919) | pièce `5` (bridé 70 ms) ; fruit `11` / `[20,40,30]` ; cristal `[14,40,24]` | — |
| | S | `pickupsTick` | récolte (×5) `14` f2 / `[10,28,14]` — saute le `5` de la même pièce (`hap._pc`) ; fruit : coup de reins | OK |
| **mort** | J | `explode` (32149) | vib `[55,45,160]` | — |
| | S | `sensBoomRebond` | les 2 premiers rebonds : vib `10` f1, après 0,35 s | OK |

## 2. DÉCISIONS — ce qui reste, ce qui part

| doublon | gardé | retiré / fondu | pourquoi |
|---|---|---|---|
| le nez plonge deux fois à la pose | **`veqContact` (Léo)** | la plongée de `sensPose` (sous `VEQ.on` seulement) ; son DÉVERS du crabe reste | Léo fait déjà la plongée, dosée par le choc ; le dévers est une autre chose qu'il ne fait pas. `?vol=ancien` : la plongée SENS revient (sinon plus aucune). |
| vib du verdict ~0,1-0,4 s avant le contact | le motif du verdict (15 / 14 / 45) | — il est DÉPLACÉ au contact (`hapV9` → `SCOUP.vp`, joué par `touche9`) | tout le choc (thud, gerbe, suspension, nez, caméra de Léo) part au contact ; la main arrivait avant les roues. Posée sans descente : inchangé. Une autre vib < 70 ms avant (MIRACULÉ…) : celle-ci se tait. Bonus : sous braquage, le `14` et le `15` de la même pose n'en font plus qu'une. |
| pose lourde non jugée `34` | `45` | — | même mot que le POSÉ LOURD (34 = MOYEN sur iOS) |
| saut nitro : 3 vibrations à la même image | **`veqSaut` `[12,30,18]` (Léo)** | le tic SENS de `startFall` ; la vib ET les 10 flammes de `figLibreTap` dans ce cas précis | le saut de Léo est UN geste (booster + décollage + figure) ; son souffle de 26 flammes dit déjà le coup. Le son de la vrille reste (la caisse tourne). |
| braquage : `[16,40,16]` + tic SENS au décollage | `heistFire` | le tic SENS (par le limiteur) | — |
| toute vib SENS posée sur une vib du jeu dans les 70 ms | la vib du jeu | la vib SENS (limiteur : `hap._t`) | un détail ne parle jamais par-dessus le geste d'origine |
| porte : `10` + `[16,24,10]` | une seule : `16` (coup net) | le motif SENS | la porte est dure : coup net, pas tic + motif |
| dos d'âne `14` f2 | `12` f1 (+ la retombée, f1) | — | il sautille : deux tics légers « ta… tac » ; à f2 il faisait taire sa propre retombée |
| appui NITRO : `9` puis `[14,26,10]` 16 ms plus tard | la réponse de la nitro | le tic d'appui (en course seulement : running, pas en pause, pas en explosion) | « l'appui répond toujours » (allumage, à vide, saut, figure) ; hors course et pour les flèches, le tic reste |
| demi-tour en diagonale : 2 vib à la même image | une | la 2e (et celle qui tomberait < 70 ms après le coup du double-tap) | — |
| bump : 12 étincelles au centre + 4-10 au flanc | **le flanc** (8-14) | la boule du centre (sous SENS) | une gerbe, là où ça cogne |
| eau : le bouchon écrase la suspension de Léo | les deux, COMPOSÉS | — | `carBody.position.y = VEQ.ext + pilonnement` |

Vus et LAISSÉS (hors de cette passe, ou pas des doublons) : le PARFAIT a son gel d'image, son flash et son zoom à la DÉCLARATION (récompense,
pas le contact : à Sacha de dire s'il les veut au contact aussi) ; à la pose, les récompenses (MIRACULÉ, palier de FLOW, frénésie) vibrent
chacune à la déclaration (si deux tombent à la même image, `navigator.vibrate` garde la dernière — vieux, hors passe) ; saut nitro = trois sons
à la même image (`decollage`, `nitro.plein`, `fig.vrille`) : chacun dit une chose, gardés ; le double-tap EN L'AIR fait vibrer l'allumage du
1er appui (`[14,26,10]`) puis la figure au 2e (`[10,22,14]`) : deux appuis, deux réponses — mais l'allumage annonce un boost que la figure
rend ensuite (FLC) ; un tic d'allumage « retenu » 240 ms ferait mentir l'appui seul : laissé.

## 3. LA GRAMMAIRE DES VIBRATIONS (écrite au-dessus de `sensHap`)
- **TIC LÉGER** ≤ 12 ms (LÉGER sur iOS) : une lèvre, une crête, une pièce, une petite retombée, un dos d'âne, un frôlé, l'accroche.
- **COUP NET** 14-24 ms (MOYEN) : une pose, un bump, une porte, la lèvre rattrapée, la récolte.
- **COUP LOURD** ≥ 45 ms (LOURD) : la pose lourde (jugée ou non), la flaque, la mort.
- **MOTIF DOUBLE** [coup, 20-40 ms, coup] : les gestes à deux temps — catapulte, saut nitro, figure, train de boosts, panne sèche, portail.
- Une seule voix par événement : un détail SENS se tait dans les 70 ms qui suivent n'importe quelle vibration du jeu (`hap._t`).

## 4. MESURES — banc `sensations/banc/accord-banc.cjs` (`node accord-banc.cjs <portAvant> [portAprès]` ; un seul port = un seul passage), 08:02, UN Chrome
AVANT = base 695c17a (port 8886), APRÈS = copie au commit 808e94d (port 8887) — c.-à-d. AVANT les 5 derniers commits (raffinements ci-dessous).
`navigator.vibrate` et `CCSON.play` remplacés par des enregistreurs ; nez = `dbgVol().nez` (Léo, VEQ.sp) + `dbgSens().tangage` (SENS, SCOUP.p),
pic dans les 700 ms après le contact (= l'instant où la caméra de Léo s'enfonce, `camT` ≥ 0). Pose provoquée par `dbgDauphin(imp,40,vLat,0)`
sous pilote auto (`dbgAuto(1,0,{vol:1})`) : la partie autour est VIVANTE (pièces, fruits, dauphins, pads) — d'où des vibrations étrangères.

| scénario | AVANT | APRÈS (808e94d) |
|---|---|---|
| pose ordinaire : nez | 4,98° = Léo 3,6 + **SENS 1,6** | 3,0° = Léo 2,2 + SENS 0,86 (*) |
| pose lourde : nez | 7,55° = Léo 5,2 + **SENS 2,35** | 4,14° = Léo 4,2 + **SENS 0** |
| pose en crabe : nez | 5,55° = Léo 4 + SENS 1,6 | 2,86° = Léo 2,4 + SENS 0,86 (*) |
| pose lourde : vib du verdict | `14` à **1295 ms** (déclaration, son `verdict.1`) — contact à **1772 ms** : **477 ms d'avance** | `15` à **1005 ms**, contact à 1008 ms : AVEC les roues |
| pose ordinaire / petite retombée (sans verdict) | `9` au contact (1046 / 573 ms) | `16` au contact (460 ms) ; pose en crabe : **aucune** (voir ↓) |
| saut nitro | **3 vib à la même ms** : `[10,26,14]` (SENS) + `[10,22,14]` (figure) + `[12,30,18]` (Léo), puis `[10,24,10]` à +17 ms (dauphins) | `[12,30,18]` seul, puis `[10,24,10]` à +28 ms (dauphins) → corrigé ensuite (df3dbec), non re-mesuré |
| décollage (dbgDauphin) | `[10,26,14]` puis `[10,24,10]` à +26 ms (départ du banc de dauphins) | idem → corrigé ensuite (df3dbec), non re-mesuré |
| appui NITRO (tap plus bref qu'une image) | `9` seul (la nitro ne voit pas l'appui : ni allumage ni « à vide ») | **rien** → corrigé ensuite (4731939 : le tic part au lâcher), non re-mesuré |
| erreurs JS | aucune | aucune |
(*) 0,86° côté SENS, identique sur trois poses : pas `sensPose` (sa plongée est à 0 sous VEQ.on) — très probablement le salut du RAPPORT
(`sensNitro`, `sensCoup(0,.45,0)`) que la reprise après la pose déclenche ; pas vérifié séparément.

Ce que le banc a RÉVÉLÉ et que les 5 derniers commits corrigent (relus, `verifie.sh` OK, **non re-mesurés : le 2e passage n'a pas pu
tourner — charge machine 54 → 91 de 11 h 24 à 11 h 34, au-delà du plafond de 25 ; fumée non passée pour la même raison**) :
1. pose en crabe APRÈS : un tic `5` (pièce / rapport) 66 ms avant le contact faisait TAIRE la vibration de la pose (limiteur trop large) →
   `hap._k` (classe 1/2/3 de la dernière impulsion) : un détail SENS ne se tait que devant une vibration AU MOINS aussi forte (5d7c92d) ;
   même règle pour la vibration du verdict au contact (edceb6f) et le tour complet des figures libres (2f98ab3).
2. décollage : `dolStart` (le banc de dauphins qui part au décollage) rejouait `[10,24,10]` 26 ms après le `[10,26,14]` → il se tait si une
   vibration moyenne vient de partir (df3dbec).
3. appui NITRO plus bref qu'une image : la nitro ne le voit pas, donc plus aucun retour depuis 4731939^ → le tic d'appui part au LÂCHER si
   rien n'a vibré depuis l'appui (4731939).

Recette pour re-mesurer (une ouverture) : servir la copie comme `banc/volant-verif.sh` (liens vers `integ/VERSION PRINCIPALE/*`, port libre
8880-8899, `--bind 127.0.0.1`), puis `node banc/accord-banc.cjs <port>` : enregistreur sur
`Navigator.prototype.vibrate`, enveloppe de `window.CCSON.play`, échantillon rAF de `dbgVol().nez` + `dbgSens().tangage` ; scénarios
`dbgDauphin(9,40,0,0)`, `(16,40,0,0)`, `(9,40,12,0)`, `(3,40,0,0)`, `dbgVol('double')`, tap `#tNitro` bref et tenu 160 ms.

## 5. COMMITS (copie `wt/accord`, branche `travail`)
300d1f9 vibrations (limiteur `hap._t`) · 349eff5 pose (un seul nez, verdict au contact, lourde 45) · 1f6e5c5 décollage (saut nitro : une vib)
· 4da0687 sol (porte, dos d'âne) · 1df5066 eau (bouchon sur VEQ.ext) · db2c9c4 appui nitro · 7446e48 figures (diagonale) · 808e94d bump
(une gerbe) · 5d7c92d vibrations (classes) · edceb6f pose (classes) · df3dbec décollage (dauphins) · 2f98ab3 figures (classes) · 4731939
appui nitro (tap bref). `?sens=0` rend tout comme avant (y compris `figLibreTap`, `figLibreDemi`, `dolStart`, `bindHold` : gardés par SENS/SENSG).
