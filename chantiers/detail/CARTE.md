# CARTE DU CODE — `VERSION PRINCIPALE/index.html` (52 193 lignes, origin/main ad62cfa)

Découpage par lignes (emprunté à la session DEBUGGING : `debug/carte/tranches.json`). Les numéros de ligne valent pour `detail-integration` au départ ;
cherche toujours par NOM (grep -n) : le fichier bouge.

- l. 1-35 : `<head>` (meta, manifest, icônes) · l. 36-304 : 1er `<script>` (démarrage, cadre de l'ordi « colonne », POKI_BUILD) · l. 305-2138 : CSS
- l. 2150-2211 : le capteur d'erreurs (son propre `<script>`) · l. 2212-7712 : CSS (charte4, hudMaitrise, achatPop, hudDA…) + HTML des écrans
- l. 7713-7727 : three.js, postprocessing, `sons-banque.js?v=13`, `assets/audio/music/harmonie.js?v=16`, `sfx.js?v=5`
- l. 7728-52191 : LE JEU (une IIFE)

| tranche | lignes | repères |
|---|---|---|
| css01 | 1-1354 |  |
| css02 | 1355-2579 | LA TOUCHE · LE PANNEAU · LA COQUE (téléphone) |
| css03 | 2580-3973 | LA PAUSE (#tPanel) · LE BOUTON NITRO (course) · LA FENÊTRE ET LE TOAST · LA CARRIÈRE · LE GARAGE · L'ÉCRAN TITRE : l'invite |
| css04 | 3974-5317 | 21. LE MOUVEMENT (2026-09-28, soir) · 22. LES DÉTAILS (2026-09-28, soir) — la chasse, écran par éc · LA FENÊTRE D'ACHAT — la carte SORT de la vitrine (2026-10-01 |
| css05 | 5318-6548 | LE GARAGE v6 — LA REFONTE (2026-09-30, Sacha, capture couché |
| css06 | 6549-7727 | 1. L'ACCUEIL — v2 (2026-10-12, Sacha, sur capture : « c'est · 2. LE GARAGE — RETIRÉ (2026-10-11, Léo : « non, celui d'avan · 3. LA CARRIÈRE — la sortie à GAUCHE, comme sur tous les écra · 4. LES TRANS |
| js01 | 7729-8380 | LES ICÔNES PIXEL (2026-09-24) · pxi · feuilleOuvre · feuilleFerme · facChoix · modale |
| js02 | 8381-9055 | fovFit · fovPor · TRIPTYQUE VISUEL : ACES + BLOOM + OMBRES DE CONTACT |
| js03 | 9056-9594 | postCaisse · emprPeint · updateContactShadow · carVit · fin TRIPTYQUE · mulberry32 |
| js04 | 9595-10174 | conesListe · conesPose · conesVus · conesZero · coneVole · sceneRetire |
| js05 | 10175-10794 | cumulus8 · cotonBuf · cotonGeo · cotonOuvrier · cotonOuvrierKo · cotonTranche |
| js06 | 10795-11689 | mkPigeon · spawnPigeonFlock · pigeonsInterdits · updatePigeons · pgLibre · pgPose |
| js07 | 11690-12216 | lisserRaccords · adoucirCretes · genPark · LE BITUME v2 (2026-09-25) · asphTex · roadMat |
| js08 | 12217-12840 | buildTrack · LA VILLE v3 — LE CANYON DU VILLAGE DE LA PLUIE (2026-09-26) · villeLampes |
| js09 | 12841-13377 | impactPieces · villeTourTouchee · villeImpact · impactBouffee · villeImpactTick · villeImpactFin |
| js10 | 13378-13992 | crTri · crLoft · crPatte · crTube · crGeo · cryptoTaureauGeo |
| js11 | 13993-14543 | parisU · parisFacade · parisZinc · parisFerMat · parisSolMat · parisEauMat |
| js12 | 14544-15096 | genJade · jadeKit · LES PICS DE JADE v4 — LES CUBES DE WUKONG (2026-10-09, Léo) · rocNoise2 · voxG · voxAt |
| js13 | 15097-15562 | jadeChutes · jadeBande · jadeMatPilier · jadeVueGeo · jadeQuart · buildJade |
| js14 | 15563-16027 | jadeEauRamene · jadeEauNez · eauPIm · eauP · jadeCouronne · jadeColonne |
| js15 | 16028-16575 | finProches · finFamille · finTravail · finMat · jadeTri · jadeRayons |
| js16 | 16576-17147 | villeChauffe · villeTri · villeMet · villeTue · villeSale · villeRefait |
| js17 | 17148-17686 | ÉCONOMIE — VAGUE 3 (2026-09-27, Sacha : « on gagne de l'arge · ecoSerie · denom · langAuto · decFr · langNext |
| js18 | 17687-18289 | presqueTxt · majPix · TR · modeLbl · applyLangDOM · fmtGta |
| js19 | 18290-18828 | bioGo · bioStep · lvlChoisir · lvlBiome · lvlGo · lvlStep |
| js20 | 18829-19359 | satPassage · orbiteBuild · satHard · orbiteLumiere · orbiteTick · orbiteChauffe |
| js21 | 19360-19910 | carrLancer · carrLancerSous · carrIci · carrPlayOk · carrSelPose · carrSel |
| js22 | 19911-20633 | silPousse · silPose · sillageStep · rimify · jetMat · potMonde |
| js23 | 20634-21539 | lpMat · lpKit · lpOmbre · lpWheel · nyRallye · blingTick |
| js24 | 21540-22385 | LA GAMME DES 50 — DÉBUT (2026-09-26) |
| js25 | 22386-23330 |  |
| js26 | 23331-24247 |  |
| js27 | 24248-25124 |  |
| js28 | 25125-25685 |  |
| js29 | 25686-26227 | LA GAMME DES 50 — FIN · carGarde · LA CAISSE EN UN MINIMUM DE DESSINS (2026-09-27, passe perf i |
| js30 | 26228-26868 | fusSoudable · fusCle · fusGeo · fusMaillage · caisseSoude · fusGroupe |
| js31 | 26869-27461 | atelierChauffe · chauffeGrace · engChauffe · chauffeRendu · chauffeDivers · LE CIEL EN DEUX TEMPS — CIEL2 (2026-09-27, passe perf iPhone |
| js32 | 27462-28103 | frH · fruitGeo · LES CONDITIONS DES 50 — DÉBUT · LES CONDITIONS DES 50 — FIN · auraRank · auraRankName |
| js33 | 28104-28721 | uiGarde · countUp · driftTick · popTexte · n9Saut · LE FLOW — la signature de conduite de CASH CAR (2026-09-25) |
| js34 | 28722-29427 | fmtMul · flowPunch · flowHudMaj · feuSprites · feuChaud · feuNait |
| js35 | 29428-30082 | shopRender · shopPaye · shopDonne · spDuree · shopPopEl · shopPop |
| js36 | 30083-30882 | L'ATELIER DE MATIÈRES (2026-08-03, d'après références réelle · texCan9 · LES DEUX OUTILS DE FORME (2026-08-05) · profX · tourX · hash9 |
| js37 | 30883-31575 | mkPower · POUVOIRS v2 — LE MOTEUR (2026-09-28) · pwrT · pwrSet · pwrVu · pwrAirK |
| js38 | 31576-32340 | boomOndePart · spawnBoomArt · updateBoomArt · clearBoomArt · LE PLAN DE LA MORT (vague 3, 2026-09-27) · boomCamDir |
| js39 | 32341-32845 | dolPr · mkDolphinGeo · dolCubes · dolNoirMaj · dolShader · mkDauphin |
| js40 | 32846-33438 | vitrailMat · vitrailObjet · sgPrim · sgDebout · sgProche · sgCol |
| js41 | 33439-34301 | musicAnalyse · distPrete · distTick · musicGraph · playMusic · stopMusic |
| js42 | 34302-34975 | spawnBill · billsTick · billsClear · dropChip · trailPush · spawnP |
| js43 | 34976-35761 | initAudio · noiseBurst · clank9 · visseuse9 · engSwapSnd · engFan9 |
| js44 | 35762-36353 | fxStop · fxPreload · fxPlay · fxWow · fxArgent · fxTick |
| js45 | 36354-36925 | camTailleOn · camTailleFov · capVise · lacetMax · balEcart · lateMul |
| js46 | 36926-37576 | drawSpeedLines · nfxFiles · saveLeaders · lbEsc · lbQualifies · renderLeaders |
| js47 | 37577-38197 | ftLigne · frenTitreEl · frenTitre · avGainPop · crunchSfx · jusHors |
| js48 | 38198-38798 | checkUpgrade · orbWarp · orbFeu · orbFxTick · vitMult · nitroooPart |
| js49 | 38799-39315 | nitroooVide · portailPasse · portVoile · portVoileSort · portPasseNiveau · volR |
| js50 | 39316-40036 | traceTex · traceInit · traceVide · traceQuad · levreRattrape · traceTick |
| js51 | 40037-40788 | svClockDraw · botBoom · survTick · survRender · campN · campChasse |
| js52 | 40789-41371 | ghIdx · fantomeLigne · fantomePrepare · fantomeSaute · fantomePose · fantomeTick |
| js53 | 41372-42024 | foudreCache · foudreHum · eclVers · foudreArme · foudreFrappe · foudreTick |
| js54 | 42025-42717 | villeChauffeFin · rebuildMenuScene · accueilRetour · buildAffiches · affichesMaj · afficheVise |
| js55 | 42718-43293 | garageLaunch · garLacherSon · playViaGarage · garageGo · garageImpact |
| js56 | 43294-43744 | garageListe · garageVoisin · garageShow · gDefiEt · garageFamilles · LA CONSOLE À TROIS MODES (2026-10-09, Léo : « crée un systèm |
| js57 | 43745-44295 | photoFile · photoTour · gBankPaint · gAuraMaj · gCompteur · gDots |
| js58 | 44296-44756 | garBeaute · LA CHUTE — LE MENU DANS LE CIEL (2026-09-30, Sacha, capture · titreCiel · titreHeureDe · titreHeurePose · titreHeureTick |
| js59 | 44757-45225 | richPlat · richPepite · richLingot · richDiamant · richPiece · richRond |
| js60 | 45226-45695 | chuteVoulue · chutePlan · chuteNuageTex · chuteFormes · chuteCumulus · chuteMonte |
| js61 | 45696-46181 | garBqBatit · garBqAmbiance · bqClasses · bqEclat · garBqLueurBatit · garBqGloire |
| js62 | 46182-46674 | bqPoussiere · garBqOutilBatit · bqOutil · bqOutilDuree · bqOutilTick · garBqLumiere |
| js63 | 46675-47234 | garLibre · garCadre · garageDecale · setRefresh · openSettings · closeSettings |
| js64 | 47235-47793 | bankMaxMaj · gvJauges · gveInit · gveTaille · gveRgba · gveTube |
| js65 | 47794-48261 | burnCubesInit · burnCubes · burnCaisse · burnTick · burnBtnsVoir · burnNitroTick |
| js66 | 48262-48816 | gmHoloTick · gmRender · gmSuit · gmHoloPlace · gmRenderS · gmPlace |
| js67 | 48817-49511 | nx3Monte · nx3Dessine · nx3Tick · ajMoy · ajMonte · ajSource |
| js68 | 49512-50166 |  |
| js69 | 50167-50850 |  |
| js70 | 50851-52190 | MOBILE / TACTILE / PAUSE / PWA — ajout non intrusif (rien de · busPlein · togglePause · applyDPR · wakeAsk · goImmersive |

## Où vivent les organes de la passe DÉTAIL (repères trouvés au repérage — vérifie par grep)
- SON : `musicAnalyse · musicGraph · playMusic · stopMusic` (js41, ~l. 33439) ; `initAudio`, sons synthétisés (js43, ~l. 34976) ;
  `fxStop · fxPreload · fxPlay · fxWow · fxArgent` (js44, ~l. 35762) ; `sfx.js` (la CONSOLE DE SON, 194 l.) ; `sons-banque.js` (3,4 Mo, banque en base64) ;
  `assets/audio/music/harmonie.js` ; 45 fichiers dans `assets/audio/` ; l'atelier : `atelier-son/`, `sons.html` (outils locaux, pas publiés).
- LANGUES / TEXTES : `langAuto`, `LANG`, `LANG_CYCLE`, `langNext` (~l. 17199) ; `TR`, `applyLangDOM`, `fmtGta`, `decFr`, `denom` (js17-js18).
- SAUVEGARDE : `// ---------- SAVE : UNE clé versionnée ('cashcarSave')` (~l. 35893), miroir Capacitor Preferences.
- VIBRATIONS : « LES VIBRATIONS (2026-09-25) » (~l. 36175) — `navigator.vibrate` + Taptic sous Capacitor.
- ÉDITION POKI : `POKI_BUILD` (l. 54), `POKI` (l. 61), 69 occurrences ; `poki-construire.js` à la racine.
- MOBILE / PAUSE / PWA : js70 (~l. 50851 : `togglePause · applyDPR · wakeAsk · goImmersive`) ; `sw.js` ; `manifest.webmanifest`.
- ÉCONOMIE / MISSIONS / CARRIÈRE : « ÉCONOMIE — VAGUE 3 » (js17), `shopRender…` (js35), « LES CONDITIONS DES 50 » (js32), `carr*` (js21), `saveLeaders` (js46).
- DÉPLOIEMENT : `vercel.json`, `vercel-build.sh`, `garde-burnout.sh`, `synchro-versions.js` (racine).
