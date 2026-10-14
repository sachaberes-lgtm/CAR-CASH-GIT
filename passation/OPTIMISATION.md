# PASSATION — OPTIMISATION (passe perf mobile, nuit et matinée du 14/10/2026)

Branche : `perf-integration` (= train T6 `242da07` + toute la passe perf). Cible : l'app iPhone (WKWebView), « fluide même sur un iPhone 7 ».
Sacha : « on sort plus tard » (gains mesurés et propres, pas de course contre la montre) ; « les détails, le jeu le plus propre possible ».

## Règles (à garder)
- Le BURN-OUT du garage (tout ce qui commence par burn/don/BURN/DON) et la scène 3D de Léo (boutique, voitures) : INTOUCHABLES. `sh garde-burnout.sh` doit dire OK.
- Plus de chinois, de POKI ni de CRYPTOCITY (`grep -c "I18N_ZH\|LANG==='zh'\|html\.c6\.poki\|html\.poki"` = 0).
- Gameplay verrouillé : une optimisation rend les MÊMES résultats de simulation ; on espace l'affichage, jamais la simulation.
- Le palier 2 (iPhone récents, ordinateurs) ne change pas d'image, sauf décision (NETTE ci-dessous).
- MESURER AUX COMPTEURS (appels de dessin, triangles, pixels, programmes compilés, Mo), pas aux millisecondes : les temps d'un Mac chargé ou d'une émulation ne valent rien pour un iPhone. Jamais de push sur `main`.

## Le socle : `PAL`, le palier de l'appareil (cherche « LE PALIER DE L'APPAREIL » dans index.html)
`PAL.n` : 0 ANCIEN (iPhone 6s/7/8/X) · 1 MOYEN (XR/XS/11/SE 2) · 2 RÉCENT (iPhone 12+, ordinateurs). Connu avant la création du rendu.
Budgets : `PAL.B.<cle>=[ancien, moyen, récent]` lus par `PAL.b('cle', défaut)` ; la 3e valeur = le comportement d'avant. Forcer : `?palier=0|1|2`. Décrire : `dbgPalier()`.

## Fait, mesuré (iPhone 7 émulé 667×375, compteurs)
| Où | Avant | Après (palier 0 = vieux iPhone) |
|---|---|---|
| Niveau jade, triangles/image | 1 108 000 | ~508 000 (T2, avec le ciel de coton de GRAPHISME) ; palier 2 ~750 000 |
| Jade à 1 100 m de la Porte du ciel | 1 198 000 | 753 000 (verre seulement à 150 m de la façade) |
| Écran de fin | ~286 appels, 1 M triangles | 74 appels, ~130 000 triangles (niveau redessiné 1 image sur 4/2/1) |
| Tampons renvoyés à la puce | ~160 Ko/image | ~45-55 Ko/image (`imEnvoi`, `updateRange`) |
| Toiles 2D en mémoire | 184 = 52 Mo | 155 = 26 Mo (`texLibere`) |
| Passes par image | 13 | 9 (halo 3 étages, ombre PCF simple) |
| Accueil | 1067×600, ombre 2048 | 894×502, ombre 1024 |

Budgets posés (tous `PAL.B.*`) : `qlDepart [5,2,0]`, `qlMin [4,0,0]` (cran de départ — et le BUG qui empêchait de l'appliquer au chargement est corrigé, `qlNet`) ; `vhdPx`, `vhdOmbre`, `vhdMort` (accueil haute définition) ; `mortImg [4,2,1]`, `engVigMs [100,66,33]` (écran de fin) ; `jadeNuvoxPres/Quart`, `jadeVerreR1 [400,600,750]`, `jadeMonuLoin [1,1,0]`, `jadePorteVerre [150,300,450]`, `jadeMonuLoinMs [4,3,3]` (jade) ; `postOmbreDouce [0,0,1]`, `postBloomMips [3,4,5]` (post) ; `memToiles [1,1,0]`, `memTexBillets [.5,1,1]` (mémoire) ; `cadence30`, `qNetDefaut`, `dprNet*` (ci-dessous).
À-coups bouchés : traînée WOW + dragon de NITROOO préparés au menu ; Porte du ciel allégée bâtie en tranches de 3-4 ms ; les 21 programmes du jade compilés au menu (`jadeChauffeProgs`, 4 étapes) → plus AUCUNE compilation au portail vers le jade (mesuré : 180 → 180 liens).

## Décisions de Sacha qui me concernent
- CADENCE 30 i/s des vieux iPhone (`CAD`, `dbgCadence`) : fermée à 3 h 30 (la caisse traversait le trafic à 30 i/s), ROUVERTE à 7 h 50 : `PAL.B.cadence30=[1,1,0]`. Preuve : `passation/banc-perf/preuve-cadence30.cjs` (rejoue le vrai `traficTick`/`satHard` à 1/60 et 1/30 : 20/20 chocs, 0 faux positif, jusqu'à 8 010 km/h, de biais compris). Si un choc manqué est revu : `[0,0,0]` et relancer la preuve.
- IMAGE NETTE : NETTE par défaut au palier RÉCENT seulement (`PAL.B.qNetDefaut=[0,0,1]`, sauvegarde neuve ou jamais choisie ; champ `qChoisi`). Vieux et moyens iPhone : RAPIDE par défaut, NETTE au choix mais allégée (`dprNetCap [1.25,1.35,1.5]`, `dprNet`, `dprNetBas`). `dbgNette()` décrit. Mesure : palier 2 NETTE = 2,25× les pixels, puce +1-2 ms ; palier 1 NETTE = puce ×2,3 (trop pour un défaut).
- Nuages du jade : GRAPHISME les a remplacés (ciel de coton). Budget que je leur ai donné : ≤ 40 k / 90 k / 180 k triangles et ≤ 6 / 10 / 16 appels par palier.

## En cours / la suite, par rendement
1. PORTAIL vers le jade : encore une image de ~1,7 s (palier 0, processeur ×4) — plus de compilation, c'est la CONSTRUCTION JavaScript du niveau (`newTrack` → `buildTrack` → `buildJade` → `jadeBatit` → `jadePorte` ; propre `jadeFini` + `voxMeshG`). `jadeBatit` est déjà un générateur (`JF.lim`) mais `buildJade` est appelé d'un bloc. Pistes : laisser le voile du portail attendre la fin d'un calcul en tranches ; ou préparer le niveau suivant pendant la course.
2. JOUER (~1,0-1,3 s) et REJOUER (~0,7 s) : la trace dit FunctionCall 1 280 ms de JavaScript dans le `fn()` du volet de transition (setTimeout 160 ms, ~l.28236) — pas du style ni du WebGL. Profiler ce `fn()` (construction du niveau tiré au hasard).
3. LE DOGE (Léo) : `dogeTete` ~1 s de processeur sur Mac = ~3-4 s figées sur iPhone 7 à sa 1re construction. À Léo : Worker ou plusieurs images (`dogeQueue` existe, jamais appelée).
4. BOUTIQUE (Léo) : ~400 ms à l'ouverture = `shopPhotoTour` (8 `toDataURL` 164 ms + 8 `readPixels` 66 ms). À Léo : une photo par image, `toBlob`, cache.
5. Jade palier 0 encore ~508 k triangles (cible 450 k) : postes lourds = MeshPhong de la scène 18 appels / 209 k, MeshBasic 50 appels / 159 k. `passation/banc-perf/postes.cjs` dit QUELS objets.
6. Gardien du budget : à chaque train, mesurer contre le précédent (T0→T1→T2 faits : aucune hausse graphique hors bruit ; hausses à suivre : EN ORBITE palier 2 +32 % triangles à T2, tas JS +16 % en course, un envoi de texture en pleine course jade palier 2).
7. Jamais mesuré sur un VRAI iPhone 7/8 : c'est la vérification qui manque le plus (Safari Web Inspector → Timelines).

## Mesurer sans les bancs du Mac
- Servir : `cd "VERSION PRINCIPALE" && python3 -m http.server 8400`, puis `http://localhost:8400/index.html?palier=0` (vieux iPhone), `&play=jade` (niveau jade direct), `&carte=espace&meteo=midi` (EN ORBITE), `&perf=1` (moniteur à l'écran). Émulation : DevTools, iPhone 667×375, processeur ×4.
- Crochets utiles (console) : `dbgPalier()` · `dbgCout(1)` puis `dbgCout()` (appels, triangles, toile, ombre, bloom, cran ql, programmes) · `dbgAppels()` (par famille) · `dbgJadePoste('liste'|'bandes')` · `dbgCadence()` / `dbgCadence(60|30|0)` · `dbgNette()` · `dbgMortImg()` · `dbgToiles()` · `dbgMonuLoin()` · `dbgJadeProgs()` · `dbgQual(k)` (force un cran) · `dbgJadeAller('porte', d)` / `dbgJadeVue('porte', d, 12)` · `dbgPortail` · tuer la caisse : `dbgSable(0);dbgAuto(0);dbgBoom()` + 7 s.
- Ce que mesuraient les bancs du Mac (`perf/banc/*.cjs`, non copiés : ils dépendent de Playwright et d'un sémaphore local) : fumée 5 cas (titre → course → fin, 0 erreur JS) ; compteurs WebGL par image (appels, triangles, octets envoyés) ; mémoire (puce, textures, tampons, toiles 2D, tas) ; images > 50 ms et programmes compilés par moment (chargement, JOUER, portail, REJOUER, garage, boutique) ; garde du budget train contre train.
- Copiés ici, autonomes : `banc-perf/preuve-cadence30.cjs` (node seul : `node passation/banc-perf/preuve-cadence30.cjs`) ; `banc-perf/postes.cjs` (fonction `postes(page)` pour Playwright/Puppeteer : triangles par OBJET nommé visible).
