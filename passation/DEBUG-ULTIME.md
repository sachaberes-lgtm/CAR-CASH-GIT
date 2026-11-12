# DEBUG-ULTIME — relecture de la branche `ios-ultime` (13/11/2026, nuit)

Branche `debug-ultime` (partie d'`origin/ios-ultime` f593e64ae), chantier `~/cash-car/debug-ultime`.
Périmètre : `git diff origin/main...origin/ios-ultime -- code app-ios/natif app-ios/ios/App/App` (48 fichiers).
Méthode : relecture du diff, puis preuves au navigateur intégré (390×844, `?tel=1&palier=2`, SANS SON, volet caché :
preuves fonctionnelles seulement, aucun chrono — charge du Mac 4,4-5,7), banc des routes, une fumée à la taille bureau.

## Bug corrigé (1 commit, cache v1531)

| | |
|---|---|
| **Symptôme** | L'AUTRE MUSIQUE (jeu muet quand Spotify/Musique joue au lancement) : si la dernière visite date de plus de 24 h, la musique du jeu se rallume quand même, par-dessus celle du joueur. Même chose au retour d'arrière-plan après 24 h. |
| **Cause** | `musRetour` (`code/sauvegarde.js`) juge « musique coupée » sur `SND.music`, que `AUTRE_SON` force à faux : la musique « revient après une longue absence » alors que c'est l'autre musique qui la coupe. |
| **Correctif** | Pendant l'autre musique, `musRetour` juge le RÉGLAGE sauvé (`SAVE.d.mus`) et ne rallume que lui ; `autreSon(false)` rallume la musique à la fin de l'autre. Bonus : `?sans=autreson` ne coupait pas le son au lancement mais le laissait ensuite coupé pour toujours (`autreSon` refusait de le rendre) — la pose du lancement respecte maintenant `AUTRE_SON.ok`. |
| **Preuve** | Avant : `dbgAutreSon(1)` puis `dbgMusRetour(26)` → `music:true` avec `on:true` (le jeu joue sa musique pendant l'autre). Après (v1531) : `music:false`, `sauve.mus:true` ; `dbgAutreSon(0)` → `music:true`. |
| Commit | a37cf6bee |

## Verdict changement par changement

### 1. `moteur/cadence.js`
- **`HC_FROID` — pause à 10 i/s : SAIN.** Prouvé : en pause `HC.per=100`, la course ne bouge pas (Δs = 0 en 1 s) ; reprise par le compte 3-2-1 : `paused` faux, `HC.on` faux, la course repart (+86 m en 2,5 s), 0 erreur. Pause pendant une chute (portail « ciel ») : figée puis reprise. Rotation pendant la pause : toile retaillée (390×844), reprise sans erreur. Le compte 3-2-1 et la feuille sont du DOM : 10 i/s ne les touche pas. La 1re image après la reprise lit au plus 100 ms (dt borné à 50 ms) : sans effet visible attendu.
- **`HC_FROID` — écran de mort à la cadence des menus : SAIN.** Prouvé : 2,5 s puis 7,5 s après la mort, `HC.on`, `per` 66,7 (repos sans geste). La machine à sous et le compteur à rouleaux ont leurs propres `requestAnimationFrame` : non concernés. Mort puis REJOUER : la partie repart, aucune erreur.
- **`CAD.eco`, `CAD_E30` : SAIN à la lecture** (non exerçable hors téléphone : il faut un écran à 30 Hz et `__ccEco`).
- **`hudCalmeTick` : non touché** (réglé ailleurs, consigne).
- DOUTE : `?hc=0` ne coupe pas la pause à 10 i/s (seul `?sans=calmefroid` le fait) — voulu d'après le commentaire, à savoir.

### 2. `gouverneur-thermique.js`, `gouverneur-paliers.js`
- **Transitions : SAINES.** Prouvé en course (`dbgThermique`) : 0→1 cale sur 30 (`MOB_FAIR30`, `actif` vrai), 1→2→3 monte au palier 4 (plafond 0,85) ; descente 4→3 (plafond 1,1) puis 3→2 (plafond 1,25, cran au plancher) une minute chacune ; aucune erreur, aucun accès hors borne. Tous les lecteurs de `MOB_P.t` (boîte de vol, polyphonie `>=2`, `mobPalApplique`) tolèrent 5 paliers ; `MOB_PN[4]` existe seulement si `MOB_LONG.on`, et la cible 4 n'est rendue que dans ce cas.
- DOUTE (effet de bord, pas un plantage) : `MOB_FAIR30` passe par `mobChaud()`, qui sert aussi à GELER l'échelle de qualité (`CAD.gel`, `cadFin`) et à retenir la sortie de la cadence. Donc dès « fair », la qualité ne peut plus remonter de la course (vu : `gel:true` à thermique 1). Le commentaire ne dit que « calé sur 30 ». À trancher : voulu ou pas ?
- Piège de banc : `dbgThermique()` SANS argument remet l'état à 0 (`+undefined|0`). Lire l'état par `dbgGouv().thermo`.

### 3. Canyon (`canyon-relief.js`, `canyon-route.js`, `canyon-mine.js`)
- **`cyFS(d)` aux trois niveaux : SAIN.** Prouvé : `dbgCyDet(0|1|2)` en course de jour, de nuit et sous l'orage : aucune erreur de compilation (console), course qui continue. Capture du niveau 0 de jour : roche rendue. Le `varying float vWL` venu de main est déclaré et écrit dans les DEUX nuanciers de sommets (`CY_VS`, `CY_MVS`) : la fusion est juste.
- **`cyDetPose()` à l'entrée : SAIN.** Prouvé : `dbgThermique(2)` au menu, JOUER dans le canyon → `pose:0` et la ligne « détail de la roche au niveau 0 » dans la boîte noire.
- **`cyMonuments` étalé : SAIN.** Prouvé : en course, 3 objets posés tout de suite, la suite par tranches, terminée même si l'on meurt pendant l'étalement (`r66` = 21 442 après la mort) ; mort pendant l'étalement puis REJOUER (carte suivante) : aucune erreur. Le décor est vidé au début de chaque `cyMonuments`, la garde `CY.job`/`CY.on`/piste arrête une chaîne orpheline.
- DOUTE (mineur) : la MESA de la station-service (`CY.r66m`, `CY.r66m2`) est une COLLISION (`canyonHeurt`), posée par la 3e tranche (~100 ms après l'entrée). « Ce qu'on peut toucher reste posé tout de suite » n'est donc vrai que pour couloir, tunnel, arche. Sans effet probable (décor au bord de la route du départ).
- DOUTE : le changement de programme à l'entrée (niveau 0 sous la chaleur) n'est pas préchauffé au menu (`canyonChauffe` compile le niveau du palier) : une compilation pendant le passage du portail, sur un téléphone chaud. Le build 74 ne montre pas de gel à cet endroit.
- Non fait : deux canyons de suite par le portail (`?carte=` ne force que la 1re map).

### 4. Son (`graphe-audio.js`, `mute-cadeau.js`, `curseurs.js`, `sauvegarde.js`, `natif.js`)
- **`SON_CHAUD` : SAIN à la lecture** (cran rendu au refroidissement, `max(cran, chaud)` des deux côtés ; ne s'applique que contexte en marche).
- **L'AUTRE MUSIQUE : BUG CORRIGÉ** (voir plus haut). `autreSon(0|1)` lui-même : sain (sauvegarde intacte, prouvé).
- **Le veilleur (`natif.js` § 4 quater) : SAIN à la lecture.** Il ne relance que (a) un fondu natif resté baissé, (b) un contexte endormi SANS `suspend()` du jeu (même règle que le réveil au toucher, déjà sur main), (c) le contexte du jeu quand `acVeut` le veut (`!paused && (SND.sfx || musGraphe())`). Tous les `AC.suspend()` du jeu passent par le `suspend` patché (`__ccVeille`) ; la pub (seul autre `suspend` avec le son voulu) n'existe pas dans l'app (`PUBR.sans`). Aucun chemin trouvé où le son du joueur coupé serait réveillé, ni où il resterait coupé.
- DOUTE (téléphone seulement) : jeu lancé muet (autre musique) → le contexte du jeu, jamais suspendu par le jeu (`sndRefresh` ne suspend qu'un contexte « running »), est relancé par le veilleur toutes les 0,7 s (et par le toucher, comme avant). Il tourne alors à vide pendant que l'autre musique joue : ce qui compte est la catégorie de session audio (`musicSession` n'est pas appelé par la pose du lancement). À écouter : lancer Spotify, puis le jeu, toucher l'écran — Spotify doit continuer.
- **Purge `ccBV*` / `ccPerfRecOn` : SAINE** (seulement hors build de mesure, bornée à 300 clés).

### 5. Le reste
- **`init.js` / `palier-appareil.js` — rotation sans écran noir : SAIN.** Prouvé : bascule 390×844 → 844×390 en course, retour en pause : toile à la bonne taille, partie qui continue, 0 erreur. `retailleImage` appelle `loop()` une fois de plus dans la tâche de la retaille (un pas de physique de 16 ms en plus : invisible). Le noir lui-même ne se juge pas au banc.
- **Modèle de l'iPhone (`__ccAppareil`) : SAIN à la lecture** (passe après `?palier`, le palier appris et l'ordinateur ; 10,x → ancien, 11-12,x → moyen, 13,x+ → récent).
- **Compteur de pertes de contexte rapprochées : SAIN à la lecture.**
- **`mobile-tactile.js` (`m6Long`, inclinaison en pause, `iosPose`, rotation qui rend le volant) : SAIN.** Écran de mort vu : compteur posé (« +€ 180 », « COMPTE : € 680 »), rien de coupé.
- **`grottes-*` (`grtLacsG`)** : déjà sur main, sain.
- **`enregistreur-perf.js` (boîte de vol) : inerte hors build de mesure** (`BV.on` seulement avec `?perfrec=2` ou la clé, que natif.js efface) ; éteinte : un test faux par image.
- **Correctifs gameplay fusionnés (debug-gameplay : `tryLand`, lèvre, pose, drift en sous-pas, heurts à 60 i/s, `dalleProche` à zone écartée)** : relus pour les noms indéfinis et les signatures (sains) ; leur physique n'a pas été rejugée ici (hors périmètre de cette passe).
- Ordre des morceaux : aucun `const` lu avant sa définition (`TEL_NATIF` 71, `PAL` 72, `AUTRE_SON` 235 avant `sauvegarde.js` 236, `HC`/`CAD` 304 avant `init.js` 315 ; les autres lectures sont à l'exécution).

## Bancs
- `node outils/banc-routes/toutes.mjs` : 240 routes, 0 infraction, sortie 0.
- Gardes après le correctif : démarrage, charte, allègement, burn-out : OK.
- Ordinateur (taille bureau, sans `?tel=1`, régime MAX) : démarre, course de ~1 000 m au pilote, 0 erreur.
- Erreurs filtrées `panne|erreur|exception|boucle|promesse` : aucune sur toutes les sessions de banc.

## Pas vérifiable sans le téléphone
- Le son réel : veilleur, fondu natif, autre musique avec Spotify (voir le doute § 4), `SON_CHAUD` entendu.
- `CAD.eco` / `CAD_E30` (écran à 30 Hz), l'effet réel de `MOB_FAIR30` et du palier 4 sur la chaleur.
- Le noir de la rotation, le coût de la compilation du niveau 0 au portail.
- La chaleur, les i/s : aucune mesure de temps ici (Mac chargé, volet caché).

## Pièges de banc retrouvés
- La sauvegarde s'écrit par `localStorage[clé]=…` et au `pagehide` : pour couper le son avant une session, ouvrir `http://localhost:<port>/sw.js` (même origine, pas de jeu), y réécrire `cashcarSave`, puis revenir au jeu.
- Volet caché : les minuteurs tombent à 1 par seconde par moments (« serpent : trou 1000 ms ») et les captures sont noires ; ne juger que des états.
