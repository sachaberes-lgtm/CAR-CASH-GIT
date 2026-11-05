# PASSE PERF MOBILE 2 — plan d'optimisation pour agents Sonnet (2026-11-04)

> **Pour les agents :** sous-compétence REQUISE `superpowers:subagent-driven-development` (ou `superpowers:executing-plans`) : une tâche à la fois, dans l'ordre des vagues (§6). Les étapes sont des cases `- [ ]` à cocher. Chaque tâche = une session Sonnet (`effort: medium`, `high` au plus), 1 à 3 h, **un commit par gain**.

**But :** la version TÉLÉPHONE de CASH CAR (`ALLEGE`, paliers `PAL` 0/1/2) fluide et sans gel, de l'iPhone 7 à l'iPhone 15, sans changer d'un pixel le palier 2 ni l'ordinateur, sans toucher au gameplay.

**Architecture :** un seul code (`code/` → `node code/assembler.cjs` → `VERSION PRINCIPALE/index.html`) ; tout allègement se garde sur `ALLEGE` / `TEL_NATIF` / `PAL.b('clé')` (jamais `IS_MOBILE`). Chaque optimisation est soit INVISIBLE (même image, moins de travail : vaut pour tous), soit taillée par palier avec la 3e colonne `= avant`. Chaque changement a son interrupteur `?x=0` et se mesure AUX COMPTEURS (appels de dessin, triangles, programmes compilés, octets, images > 100 ms), jamais aux millisecondes seules d'un Mac chargé.

**Base :** `origin/main` **846460c6** (v1116, 5/11 ; le plan a été écrit sur d3cc2fd0 v1112 : lignes ±10). Mesures de Fable du 5/11 au §2 bis ; A1, A2 et C3 réécrits avec leurs décisions. Chantier : `~/cash-car/perfmob/` — `integ/` = worktree de la branche d'intégration **`perf-mobile-2026-11`** (créée depuis d3cc2fd0), `wt/<tache>` = worktree de la branche `perfmob/<tache>`. Ports 8450 (integ) puis 8451+ (un par tâche).

**Spec :** ce document est aussi la spec (la demande de Sacha : « prends la version mobile et fais un plan d'optimisation poussé »). Les passations qui le fondent, à lire par celui qui prend la tâche concernée : `passation/OPTIMISATION.md`, `passation/ETAT-OPTIMISATION.md`, `passation/ETAT-PERF.md`, `passation/PLAN-PREBUILD.md`, et dans `VERSION PRINCIPALE/JOURNAL.md` les sections « LA LIAISON EN ARRIÈRE-PLAN » (v990), « LE DÉPART ATTEND LA CHAUFFE » (v1004-1005), « LA PASSE PERF DU 24/10 ».

---

## 1. Contraintes globales (valent pour TOUTES les tâches)

- **On édite `code/`, jamais `index.html` à la main** ; après chaque modif : `node code/assembler.cjs`, puis commit de `code/` ET `VERSION PRINCIPALE/index.html` ensemble. `node code/assembler.cjs --verifier` avant chaque commit.
- **Les gardes doivent passer** avant chaque commit : `sh garde-burnout.sh` · `sh garde-charte.sh` · `sh garde-allege.sh` · `node outils/garde-demarrage.cjs` (toutes à la racine du worktree ; 0 = OK).
- **`IS_MOBILE` est interdit pour alléger** (vrai aussi sur l'ordi). Un allègement se garde sur `ALLEGE` (`code/rendu/soleil-planete.js:298`), `TEL_NATIF` (`:282`) ou `PAL.b('clé', défaut)` avec `PAL.B.clé=[ancien, moyen, récent]` déclaré près du code (`code/rendu/palier-appareil.js:22` définit `PAL` ; helper `PAL_B9` pour les fichiers lus avant lui).
- **Le palier 2 (iPhone 12+, ordinateurs) reste IDENTIQUE** : capture A/B au pixel (`?palier=2`, même `?pistegraine=777`, même map/météo) + `dbgCout()` identique (appels, triangles).
- **Le gameplay ne change pas** : conduite, vitesses, collisions, ramassages, tirages, difficulté. On espace l'AFFICHAGE, jamais la simulation. Preuve : `?pistegraine=777&perfrec=1`, même séquence de gestes, `dbgPerfRec()` avant/après → mêmes phases, même score.
- **Chaque changement a un interrupteur d'URL** `?<nom>=0` (= avant) et un commentaire daté en français : `/* (2026-11-xx, passe perf mobile 2, <tâche>) pourquoi */`. Jamais de `//` au milieu d'une ligne.
- **Chirurgical** : on AJOUTE (garde, budget, cache, sortie anticipée, tranche), on ne reformate pas, on ne déplace pas de bloc, on ne renomme pas. Plusieurs sessions touchent le même fichier.
- **Intouchables** : `vendor/` (sauf la retouche existante `renderer.__ccLier`), `sw.js` (l'intégrateur l'incrémente UNE fois par train), `app-ios/`, les `CLAUDE.md`, le BURN-OUT de Léo (`burn*/don*`), la BOUTIQUE 3D et les dessins des voitures, les couleurs/lumières/shaders (DA validée : `LOOK_TEL`, bloom .44, ACES).
- **Git** : on travaille UNIQUEMENT dans `~/cash-car/perfmob/wt/<tache>` sur `perfmob/<tache>` ; jamais de push sur `main`, jamais de merge d'une autre branche, jamais `reset --hard`/`stash`. Message : `Perf mobile 2 — <zone> : <ce qui change>, <le chiffre> (palier N)`, terminé par `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Journal commun : `printf 'perfmob:<tache>\t<fonction>\t<fichier:ligne>\t<titre>\n' >> ~/cash-car/debug/journal-correctifs.tsv` après chaque commit (et `grep` AVANT de toucher une fonction).
- **La machine** (Mac 10 cœurs / 16 Go, disque à 10 Go libres) : `uptime` charge 1 min **< 8** avant toute mesure (sinon attendre 5 min, puis réessayer) ; **au plus 3 navigateurs de banc pour toute la machine**, via `sh ~/cash-car/verrou-banc.sh prendre "<tache>"` … `rendre` (à rendre MÊME si le banc a échoué) ; jamais le simulateur iOS en même temps qu'un banc ; fermer Chrome à la fin de chaque banc (`process.exit`). Pas plus de 6 agents en même temps sur ce chantier (d'autres sessions tournent).
- **Pas de navigateur pour lire du code** : on lit `code/<fichier>.js` (jamais `index.html` en entier : des lignes font 200 000 caractères — `grep -n … | cut -c1-300`, `sed -n 'A,Bp' | cut -c1-600`).

## 2. La base mesurée aujourd'hui (4/11, main d3cc2fd0)

| Quoi | Valeur |
|---|---|
| `index.html` source | 9 772 833 octets, 79 978 lignes (JS en ligne 8,76 Mo, CSS 0,93 Mo en 56 `<style>`, HTML 86 Ko) |
| `index.html` PUBLIÉ (après `publie-allege`) | 6 079 638 octets, **1,92 Mo gzip** (−3,71 Mo : commentaires + 262 crochets `dbg*`) ; ⚠ « un `<style>` gardé tel quel (accolades) » |
| `sons-banque.js` | 7,29 Mo (scindé à la publication : 0,8 Mo d'abord, `sons-banque-2.js` après `load`) |
| `vendor/three.min.js` | 604 Ko (r128 retouché) ; post-traitement 22 Ko |
| `assets/audio/` | 86 Mo / 557 fichiers (le build en retire une partie) ; musiques de lobby 2,5-4,3 Mo chacune |
| `code/` par dossier | voitures 2,36 Mo · maps 2,10 · interface 1,28 · gameplay 0,98 · css 0,91 · rendu 0,66 · moteur 0,62 |
| Dans le JS | 83 `new THREE.CanvasTexture` · 76 `ShaderMaterial` · 69 `getBoundingClientRect` · 15 `readPixels` · 15 `WebGLRenderTarget` · 66 `renderer.render(` + 54 `composer.render` · 32 fonctions `*Chauffe*` · 161 `.dispose()` |
| Budgets `PAL.B` existants (69 clés `PAL.B.x=` + des `Object.assign(PAL.B,…)`) | bloom, cadence, crypto*, cy* (canyon), dn* (dunes), dpr*, eng*, hud*, jade*, mem*, mort*, nu*, orb*, post*, ql*, routeCols, vent, vhd*, vilRais*, banq* (glacier), grotte*, foret* — **sans budget par palier** (seulement `ALLEGE` ou rien) : nuages (`nuages-vitrail.js`), ville v3 et vitrée (`ville-v3.js`, `ville-verre.js`), orbite (`orbite-1/2.js` : `SAT_MAX` sur `ALLEGE`), dunes 3/dieux/gizeh, taureau crypto |
| Connu, non réglé (passations d'octobre) | portail vers JADE ~1,7 s d'un bloc au palier 0 (Porte du ciel `voxMesh` 272 ms, jade 508 k triangles pour 450 k visés) · JOUER 1,0-1,3 s · REJOUER 0,7 s · `hudColonne` ~10 ms/s de `getBoundingClientRect` · à froid : 3,9 s figées quand le menu apparaît (1er dessin des programmes), 8 programmes du ciel 1,5 s, ~1,3 s de JS au chargement, gels de 3-5,6 s au menu pendant la chauffe · **jamais mesuré sur un vrai iPhone 7/8** |
| Branche `mobile-perf` (26/10) | 11 commits NON fusionnés dans main (437 commits de retard) : gouverneur thermique, régime chaud, ombre de la caisse en un maillage, rubans en tranche moyenne, sonde sans gel — mesurés sur le 13 Pro ; 29 fichiers, +433 lignes |

Machine au moment du plan : charge 125, 4 Chrome sans fenêtre, 10 Go de disque. **Aucune mesure de temps n'a été faite** : la T0 les établit.

## 2 bis. Les mesures de Fable du 5/11 (profil du chargement + familles par map, Chrome iPhone émulé, palier 0, Mac chargé : proportions valables, pas les ms)

**Le chargement à froid (profil CPU de 26 s, du `navigate` au menu touchable ; fichiers dans `outils/banc-perf/mesures/2026-11-05-fable/`) :**
- `(program)` = **l'analyse (parse) du script de 8,7 Mo : ≈ la moitié** du temps de JavaScript avant l'intro ; l'autre moitié = l'exécution de tête du grand script (2,27 s ici), dont : `newTrack()` **737 ms** (`code/moteur/init.js:2` — la première piste, bâtie d'un bloc avant même que l'intro soit touchable), `mGo('home')` → `garAccueil` **606 ms** (`code/moteur/mobile-tactile.js:584`, l'atelier du menu), `cielChauffe()` **282 ms** (`code/rendu/ciel2.js:63`, 7 rendus synchrones du dôme), `buildCar(CARS[0])` 147 ms (`code/rendu/ciel2.js:261`), l'atelier de matières 135 ms (`code/voitures/matieres-forme.js:14`). Hors script : `creatures/dauphin.js` **290 ms** au chargement (`dolCubes` ×2, l.181 : la géométrie des dauphins, qui ne servent qu'à la jade).
- Puis, juste avant le menu : `applyQ` → `qlReprise` → `qlPose` → `applyDPR` → `renderer.setSize` **1 140 ms** (`code/moteur/mobile-tactile.js:11`, `setTimeout 0`) : la toile et toutes les cibles (composer, halo) RÉALLOUÉES une 2e fois parce que `DPR_CAP` n'est connu qu'après le 1er `renderer.setSize` (`code/rendu/palier-appareil.js:110`).
- Sous « PRESENTS » et au menu : `engChauffe` 1,42 s (chauffeDivers 0,77 + mkEngine 0,65), `prebAvec` (départ d'avance) 0,91 s, `renderer.compile` 1,0 s, `setup` des uniformes 0,77 s — et **`photoTour` → `carPhoto` 1,58 s** (`code/interface/atelier-ferme.js:554`) : les photos des caisses de la bande du garage, prises au menu, en concurrence avec la chauffe (cache IndexedDB vide au 1er lancement ou après une mise à jour des caisses).
- Le banc de T0 touchait l'écran à 20 s : le « menu à 24,8 s » est un artefact ; l'intro attend un 1er toucher (`lancer`), puis la boule n'accepte le 2e qu'à 4,6 s (`pretT`), puis « PRESENTS » tient tant que le jeu gèle. **Pendant la boule (≥ 4,6 s) le jeu ne fait RIEN** (`boucle-1.js:3`) : c'est le temps à récupérer.

**Les familles de triangles (dbgAppels, même graine, p0 / p2) :**
| map | p0 | p2 | les postes du p0 (appels / triangles) |
|---|---|---|---|
| nuages:midi (s = 463 m) | 126 / 461 k | 127 / 480 k | `MeshBasicMaterial (scène)` 25 / 114 k · `ShaderMaterial` sans nom 18 / 117 k · `coton` 8 / 102 k · `MeshPhongMaterial (scène)` 5 / 77 k · Lambert 4 / 19 k |
| dunes:soir (écran de mort, s = 238) | 115 / 348 k | 109 / 378 k | `MeshBasicMaterial (scène)` **27 / 165 k** · `MeshPhongMaterial (scène)` 36 / 66 k · papyrus 38 k · Lambert 36 k · décor tiré 16 k |
| forêt:midi (écran de mort, s = 351) | 116 / 143 k | 126 / 418 k | les budgets `foret*` mordent bien ; Phong (scène) 30 / 21 k |

Lecture : aux NUAGES et aux DUNES le palier 0 dessine presque autant que le palier 2 — les plus gros postes sont des maillages SANS NOM (`(scène)` = enfants directs de la scène : piste, rubans, sol, sable, ciel) que `dbgAppels` ne sait pas attribuer. Avant tout budget : NOMMER (voir C3). Captures p0/p2 dans le même dossier (nuages p0 : image propre, nuages en cubes nets — le p0 ne choque pas).

## 3. Les outils (à connaître par cœur)

- **Servir** : `cd "VERSION PRINCIPALE" && python3 -m http.server <port> --bind 0.0.0.0`. Téléphone émulé : `index.html?tel=1&palier=0` (ou `1`, `2`) ; `?allege=0` = l'image de l'ordi ; `?garde=1` lit/écrit la sauvegarde (sans lui `SAVE.neuf`) ; `?pistegraine=777` fige la piste ; `?carte=<id>&meteo=<id>` choisit la map (ids dans `SF_CARTES`, `code/maps/niveaux.js`) ; `?play=jade` = le Soleil de jade ; `?perf=1` = le moniteur à l'écran + relevé des à-coups (`perfAcoup`, `code/rendu/nettete-qualite.js:224`) ; `?prebati=0`, `?frais=0`, `?fps=0`, `?bloom=1`, `?hd=0`, `?palecran=0`.
- **Console (crochets `window.dbg*`, retirés de la copie publiée)** : `dbgPalier()` · `dbgCout(1)` puis `dbgCout()` (appels, triangles, toile, ombre, bloom, cran, programmes par image) · `dbgAppels()` (par famille) · `dbgPerf()` (ms, i/s, pics, dpr) · `dbgPerfRec()` (`?perfrec=1`) · `dbgCadence()` · `dbgNette()` · `dbgToiles()` · `dbgProgs()` / `dbgLier()` / `dbgChauffe()` · `dbgPrebati()` · `dbgJadeProgs()` · `dbgPhoto()` / `dbgPhotoMem()` · `dbgVHD()`. Crochets du jeu : `dbgState`, `dbgTouch`, `dbgClassique(c,m)`, `dbgPortail`, `dbgSaut`.
- **Le banc court** : `python3 outils/banc-perf/garde-perf.py [carte:météo …]` (Chrome sans fenêtre déguisé en iPhone 390×844 ×3, processeur ×4, `?garde=1&palier=2&pistegraine=777`, un vrai portail vers chaque map ; compte les programmes compilés en course — doit rester **0** —, les erreurs, les images > 100 ms ; sortie 0/1/2). Lire `outils/banc-perf/LISEZMOI.txt` et `cdp.py` (le client CDP maison : `ev`, `call`, `pump`, `tap`).
- **Égalité au bit** : l'empreinte FNV des tampons de `trackMeshes` sur graines fixes (modèle : `egal2.cjs` décrit dans `passation/ETAT-PERF.md`) ; empreinte SHA de `dogeTete` (`doge-banc.cjs`).
- **Taille publiée** : `node outils/publie-allege.cjs <copie> --essai` ; `gzip -9 -c index.html | wc -c`.
- **Carte ligne → fichier** (une ligne d'`index.html` citée par un profil ou une passation) :
  ```bash
  node -e 'const fs=require("fs"),o=fs.readFileSync("code/ORDRE.txt","utf8").split("\n").filter(l=>l&&!l.startsWith("#")).map(l=>l.split("#")[0].trim()).filter(Boolean);let L=1;for(const f of o){const n=(fs.readFileSync("code/"+f,"utf8").match(/\n/g)||[]).length;const q=+process.argv[1];if(q>=L&&q<=L+n){console.log(f+":"+(q-L+1));break;}L+=n;}' 46279
  ```
- **Profil processeur** d'une course (CDP `Profiler.start/stop`, 8 s, `?palier=0&tel=1`) : le modèle est le banc `perf/banc/perf.cjs` de `~/cash-car/perf/` (Playwright de `~/.hermes/hermes-agent/node_modules`, Chrome `/Applications/Google Chrome.app`) — à recopier dans `outils/banc-perf/` si on s'en sert (il dépend d'un sémaphore local : le remplacer par `verrou-banc.sh`).

## 4. Points de vigilance (à vérifier par la tâche qui possède le code)

1. **Dérive du palier 2** : une garde `PAL.b` mal posée change l'image des iPhone récents / de l'ordi → chaque tâche C/B fait la capture A/B `?palier=2` et compare `dbgCout()` (T0 fournit l'outil).
2. **Dérive de simulation** : une tranche qui déplace `spawnPickups` ou un calcul de piste change le tirage → trace `dbgPerfRec` + empreinte des tampons sur `?pistegraine=777` (B1, B3, C2).
3. **Un report qui n'est pas prêt quand on en a besoin** (A2 : une initialisation différée lue par le garage avant son tour → `ReferenceError`) → le test de fumée doit OUVRIR garage, inventaire, boutique, réglages, missions, puis JOUER, dans les 3 premières secondes après le menu.
4. **Cache HTTP immuable sur un fichier changé sans nouveau `?v=`** (A3) → le jeton est calculé au build depuis le contenu, jamais à la main ; la garde du démarrage vérifie qu'aucun `src` immuable n'est sans jeton.
5. **Le PC via `IS_MOBILE`** (interdit) et **l'édition App Store** (`app-ios/preparer-www.js` découpe `index.html` par motifs : un bloc déplacé peut casser `une("const TEST_CAISSES…`) → à la fin du chantier, `cd app-ios && npm run sync` sur une copie et vérifier qu'il n'écrit pas « motif introuvable ».

---

## 5. Les tâches

Chaque tâche : **Pourquoi** (la preuve) · **Fichiers** (`code/…:ligne` à la base d3cc2fd0, ±5 lignes) · **Mesure avant** · **Ce qu'on fait** · **Interrupteur** · **Critère** · **Commit**. Les tâches sont indépendantes sauf mention « après ».

### T0 — Le banc par palier et la base de mesure (1 agent, AVANT tout le reste, avec navigateur)

**Pourquoi :** `garde-perf.py` ne tourne qu'au palier 2 et ne sort que des seuils ; il nous faut des COMPTEURS par map et par palier, reproductibles, pour prouver chaque tâche.

**Fichiers :** modifier `outils/banc-perf/garde-perf.py` (option `--palier N`, `--tel`, `--json <fichier>` ; le comportement sans option reste identique) ; créer `outils/banc-perf/demarrage.py` (chargement à froid) ; créer `outils/banc-perf/mesures/2026-11-04-base-p0.json`, `-p1.json`, `-p2.json`, `-demarrage-p0.json`.

- [ ] Dans `garde-perf.py`, après chaque map franchie, lire par `c.ev(...)` : `dbgCout()` (appels, triangles, programmes), `renderer.info.memory` (via `dbgCout`), `dbgToiles().n`, `performance.memory.usedJSHeapSize`, les images > 100 ms de la fenêtre du portail, la pire image ; écrire le tout dans le JSON (`{map, palier, appels, triangles, programmes, textures, toiles, tas, pire, longues}`).
- [ ] `demarrage.py` : Chrome neuf (profil temporaire, cache vide), UA iPhone, ×4 posé AVANT la navigation, `?tel=1&palier=N&garde=1` ; relève : instant où `.mPlay` devient visible et touchable (modèle `BTN` de garde-perf), nombre et durée des tâches > 50 ms jusque-là (CDP `Tracing` catégorie `devtools.timeline`, événements `RunTask` ; ou `PerformanceObserver('longtask')` injecté par `Page.addScriptToEvaluateOnNewDocument`), `Performance.getMetrics` (`ScriptDuration`, `JSHeapUsedSize`), puis 10 s au menu : images > 100 ms, `dbgProgs().length`, `dbgToiles()`.
- [ ] Lancer, machine calme (`uptime` < 8), les 11 maps au palier 0 puis 1 puis 2 (`nuages:midi ville:pluie jade:midi grotte:matin dunes:midi canyon:midi foret:midi glacier:midi crypto:midi vitree:nuit espace:midi` — vérifier les ids dans `SF_CARTES`), et le démarrage au palier 0 trois fois (garder la médiane).
- [ ] Commit : `Perf mobile 2 — banc : garde-perf par palier + démarrage à froid, base du 4/11 (p0/p1/p2)`. Journal.

**Produit (lu par toutes les autres tâches) :** `python3 outils/banc-perf/garde-perf.py --palier 0 --json out.json [maps]` et `python3 outils/banc-perf/demarrage.py --palier 0 --json out.json` ; la comparaison = `node outils/banc-perf/compare.cjs base.json apres.json` (à écrire : une ligne par map, Δ en % des compteurs, **rouge** si un compteur du palier 2 bouge).

### A1 — Le démarrage à froid : lier sous la boule, dessiner par tranches (CONCEPTION FABLE, 5/11)

**Ce que fait le code aujourd'hui (lu dans `code/moteur/intro-161.js`, `code/interface/vignette-moteur.js`, `code/moteur/boucle-1.js`) :**
1. Le 1er toucher lance le film (`lancer`, l.~886) et pose `window.__introCouvre=true` : dans `loop()` (`boucle-1.js:3`) le jeu ne fait RIEN tant que la BOULE tourne — au moins 4,6 s (`pretT`, l.~864), plus le temps que le joueur touche.
2. Au 2e toucher (`tapBoule`, l.~776) : `ouvrir()` (audio, garage), puis `__introCouvre=false` 150 ms après, puis `ouvreQuandPret()` : le voile « 1.61 PRESENTS » tient tant que 25 images d'affilée ne sont pas < 100 ms (15 s au plus).
3. Seulement là, `lierDemarrage` (`vignette-moteur.js:276`) lance en doux les ~103 programmes de la 1re image (`compileDoux`), attend `lierPret`, puis le menu dessine : le 1er DESSIN de chaque programme coûte à Metal 10-110 ms (cache froid) → les 3,9 s de « gel » qu'ouvreQuandPret cache derrière PRESENTS.
4. Au menu, `engChauffe` (`boucle-6-hud.js:304`) déroule `chauffeDivers(k)` UNE étape par image, chaque étape = un `chauffeRendu(sous-arbre)` qui dessine d'un coup TOUS les couples (matière, géométrie) du sous-arbre → 0,2 à 1,5 s par étape à froid (JOURNAL 28/10 : « gels de 3 à 5,6 s au menu pendant la chauffe : l'orbite, un lot de 6 programmes »).
5. `cielChauffe()` (`code/rendu/ciel2.js:56-63`) est appelé AU NIVEAU DU SCRIPT, pendant l'évaluation d'`index.html` : 7 rendus synchrones du dôme (2 cibles 8×8) = les « 8 programmes du ciel, 1,5 s à froid » du JOURNAL, dans la tâche de 4,3 s du chargement.

**Les trois décisions :**
- **A1.a — lier pendant la BOULE.** Le temps de la boule (≥ 4,6 s) est perdu : on y lance la liaison douce de la 1re image. Dans `lancer()` (intro-161.js), après `window.__introCouvre=true`, appeler `window.__ccLierTot&&window.__ccLierTot()` ; dans `vignette-moteur.js`, `lierTot()` = le corps de `lierDemarrage` quand `LIER.dem===0` (compileDoux de la scène sur `composer.renderTarget1` + `lierPasses()`), sans attendre, et pose `LIER.dem=1`. `lierDemarrage` devient alors un simple `lierPret()` après le toucher : si la boule a duré plus que la liaison (le cas normal), le menu ne l'attend plus. La liaison tourne sur les threads du pilote (KHR_parallel_shader_compile) : coût sur le fil principal = la génération des sources par three (quelques ms par programme) — à vérifier : la boule ne doit pas saccader (mesure : images > 50 ms de `boucle()` de l'intro pendant la liaison, avant/après). Interrupteur : `?lierboule=0`.
- **A1.b — `cielChauffe` hors du chargement.** Remplacer l'appel de tête (`ciel2.js:63`) par une inscription : `CHAUFFE_R.ciel=1`, et faire le travail soit dans `lierTot()` (en doux : `compileDoux(sc,camera)` sur la même scène de 1 maillage et ses 7 matières — pas de dessin), soit en 1re étape de `chauffeDivers` (le dessin 8×8, quand on est lié). Gain : −1,5 s à froid dans la tâche du chargement (iPhone 15), plus sur un iPhone 7. Interrupteur : `?cielchauffe=tete` = avant.
- **A1.c — `chauffeRendu` en TRANCHES de programmes.** Dans `chauffeRendu(que)` (`vignette-moteur.js:363`), le `walk` garde TOUS les couples (matière, géométrie) visibles pour un seul `renderer.render`. Nouveau : un budget `PAL.B.chauffeTranche=[3,6,999]` = nombre de PROGRAMMES JAMAIS DESSINÉS (clé `p.cacheKey` absente de `CHAUFFE_R.dessines`, un `Set`) que l'étape accepte ; au-delà, les objets restants sont cachés (`off`) et `CHAUFFE_R.encore=1` → l'étape est rejouée à l'image suivante (mécanique existante, l.331 : « une étape en plusieurs images »). Un programme déjà dessiné une fois ne compte plus (son état de pipeline existe). Palier 2 : 999 = comme avant. Critère : au menu p0 (cache froid simulé — voir ci-dessous), aucune image > 150 ms après PRESENTS ; nombre total d'étapes × 2-3 au plus.

**Simuler le cache froid sur le banc :** Chrome garde ses programmes en cache disque ; profil temporaire = froid pour Chrome, mais Chrome n'a pas le coût Metal du 1er dessin. Le juge réel est l'iPhone (Safari → Timelines) avec une variante de shader unique (`?shaderunique=<hasard>` : ajouter `#define CC_SEL <n>` en tête des shaders → programmes neufs à chaque lancement ; précédent : « shaders rendus uniques à chaque lancement » du banc de Léo, 27/10). Sur le Mac on vérifie seulement : 0 compilation en course, menu identique au pixel, et le nombre d'étapes/images.

**Fichiers :** `code/moteur/intro-161.js` (`lancer`, ~l.886), `code/interface/vignette-moteur.js` (`compileDoux` 251, `lierDemarrage` 276, `engChauffe1` 329-333, `chauffeRendu` 363, `CHAUFFE_R` ~l.471), `code/rendu/ciel2.js:56-63`, `code/rendu/palier-appareil.js` (le budget, ou près de `CHAUFFE_R`).
**Ordre :** A1.b (le plus simple, mesurable au ×4 : la tâche de tête rétrécit), puis A1.c (mesurable : pire image au menu), puis A1.a (à juger sur l'iPhone, la boule ne doit pas saccader).

### A2 — LE CHARGEMENT SOUS LA BOULE : la tête du script vidée, le travail fait pendant que la boule tourne (CONCEPTION FABLE, 5/11 ; après A1 : même `vignette-moteur.js`)

**Pourquoi :** mesuré (§2 bis) : avant que l'intro soit touchable, le téléphone analyse 8,7 Mo de script PUIS exécute ~2,3 s (Mac chargé) de code de tête — `newTrack`, `garAccueil`, `cielChauffe`, `buildCar`, les matières, les dauphins — et, au menu, ré-alloue toute la toile (1,1 s) et prend 1,6 s de photos de caisses pendant la chauffe. Rien de tout cela n'a besoin d'exister avant que le joueur touche la boule : la boule tourne ≥ 4,6 s pour rien.

**Fichiers :** `code/moteur/init.js:2` (`newTrack()`), `code/moteur/mobile-tactile.js:11` (`setTimeout(applyQ)`) et `:584` (`mGo`), `code/rendu/ciel2.js:261` (`buildCar(CARS[0])`), `code/voitures/matieres-forme.js:14` et `:143`, `VERSION PRINCIPALE/creatures/dauphin.js:181` (`DOL_GEO`, `DOL_GEO_L`), `code/rendu/palier-appareil.js:110-174` (`renderer.setSize`, `DPR_CAP`, `dprPlafond` :143), `code/interface/atelier-ferme.js:536-562` (`photoCalme`, `photoTour`), `code/moteur/intro-161.js` (`pretT`, ~l.864 ; `lancer` ~l.886), `code/moteur/desktop-banc.js:294` (le premier `requestAnimationFrame(loop)`), `code/moteur/depart-avance.js:91` (`pisteRoute`, générateur) et `code/moteur/piste-prebati.js:203` (`prebAvec`).

- [ ] **A2.a — la file `CHARGEMENT`.** Nouveau bloc dans `vignette-moteur.js` (après `CHAUFFE_R`) : `const CHARGEMENT={pas:0,fini:false,E:[]}` et `chargementTick(now)` appelée en tête de `loop()` (`boucle-1.js`, AVANT le test `__introCouvre`) : tant que `!CHARGEMENT.fini`, exécute UNE étape par image (ou avance un générateur de 8 ms, `performance.now()` en butée), puis `return` sans dessiner. Les étapes, dans l'ordre : (1) `cielChauffe` en doux (A1.b) ; (2) la 1re piste : `newTrack` par le générateur du pré-bâti (`prebAvec` / `pisteRoute`, tranches de 8 ms), les décors de la carte du menu compris ; (3) `buildCar(CARS[0])` puis la caisse sauvegardée ; (4) `garAccueil()` (ce que `mGo('home')` fait à la tête : `mGo` reste appelé, mais la construction de l'atelier devient une étape) ; (5) l'atelier de matières (`matieres-forme.js:14` et `:143` → fonctions `matieresInit()` appelées ici) ; puis `CHARGEMENT.fini=true`. Interrupteur : `?chargement=0` = tout en tête, comme avant (les mêmes fonctions, appelées à la place d'avant).
- [ ] **A2.b — la boule attend le chargement.** Dans `intro-161.js`, la condition de `pretT` (l.~864 : `t>=4.6&&document.readyState==='complete'&&…`) ajoute `&&(window.__ccCharge?window.__ccCharge():true)` où `__ccCharge` rend `CHARGEMENT.fini` ; et `finRapide`/`secours`/`fonduDoux` (intro sautée ou plantée) appellent d'abord `window.__ccChargeTout&&window.__ccChargeTout()` (toutes les étapes d'un trait). Jamais plus de 15 s d'attente : au-delà, `chargementTout()` d'un bloc.
- [ ] **A2.c — une seule allocation de la toile.** `DPR_CAP` est calculé par `dprPlafond(q==='fast')` AVANT le premier `renderer.setSize` (`sauvegarde.js` vient APRÈS `palier-appareil.js` dans `ORDRE.txt` : lire `localStorage.cashcarSave` directement, champ `q`, repli `fast`, dans `palier-appareil.js`), et `applyQ` au chargement (`mobile-tactile.js:11`) ne refait `qlReprise` que si `DPR_CAP` change. Mesure : nombre d'appels à `renderer.setSize` jusqu'au menu (piéger la méthode) : 2 → 1.
- [ ] **A2.d — les photos après la chauffe.** `photoCalme()` (`atelier-ferme.js:536`) rend faux tant que `!CHAUFFE_R.fait && performance.now()-CHAUFFE_R.tMenu<12000` (poser `CHAUFFE_R.tMenu` à `cc:revele`), SAUF si le joueur a ouvert l'inventaire ou la boutique (`GBQ.on`, `#gInv` visible) : ses vignettes passent devant. Palier 2 aussi (invisible : les vignettes arrivent 1-3 s plus tard au 1er lancement seulement ; le cache IndexedDB fait le reste).
- [ ] **A2.e — les dauphins à la demande.** `dauphin.js:181` : `DOL_GEO`/`DOL_GEO_L` deviennent des fonctions `dolGeo()`/`dolGeoL()` qui construisent au 1er appel (chercher chaque lecteur : `grep -n "DOL_GEO" VERSION PRINCIPALE/creatures/*.js code/maps/jade-singes-dauphins.js`), et `jadeChauffeProgs` les appelle (la jade les chauffe déjà). Même traitement pour tout autre `creatures/*.js` qui bâtit au chargement (`singe.js`, `vitrail.js` : mesurer ; seul `dolCubes` a été vu).
- [ ] **A2.f — LE SCRIPT EN FICHIER (à la publication seulement).** `vercel-build.sh`, après `publie-allege` et avant l'empreinte : découper le `<script>` du jeu (celui ouvert par `code/page/bibliotheques.html`, fermé dans `moteur/desktop-banc.js`) de `.vercel-static/jouer/index.html` vers `.vercel-static/jouer/jeu.js`, et le remplacer par `<script src="jeu.js?v=<sha1 8>"></script>` ; appliquer les `sed` de `__CC_BUILD__`/`__CC_PHOTOS__` aussi à `jeu.js` ; pas de `CORE` dans `sw.js` (le SW ne connaît pas le jeton : son cache-first le range au 1er passage) ; `vercel.json` le rend immuable (règle A3). Pourquoi : Safari et Chrome gardent le BYTECODE d'un script EXTERNE entre deux lancements (pas d'un script en ligne) → aux lancements suivants, l'analyse (≈ la moitié de la tâche de tête) disparaît. Le SOURCE (`VERSION PRINCIPALE/index.html`) reste un seul fichier (bancs, app iOS, `preparer-www.js` inchangés). Preuve : 2e chargement sur l'iPhone (Timelines : « Script Evaluation ») avant/après ; sur Chrome : `Performance.getMetrics().ScriptDuration` au 2e lancement avec profil persistant. Risque : la boîte noire note des numéros de ligne de `jeu.js` (= ceux du source + un décalage constant : l'écrire dans `version.json`).
- [ ] Mesures : `demarrage.py` corrigé (touchers dès 0,5 s) ×3 : `ScriptDuration` jusqu'au 1er toucher possible, pire tâche de tête, instant `cc:revele`, instant du menu touchable ; captures menu p0 avant/après identiques au pixel ; fumée garage/inventaire/boutique/réglages/missions/JOUER dans les 3 s après le menu, 0 erreur `__ccNote` ; garde-perf 0 compilation.
- [ ] **Critère :** pire tâche avant le 1er toucher −50 % (×4, p0) ; `renderer.setSize` 1 fois ; menu touchable au plus tôt à `pretT` (4,6 s après le 1er toucher) sur machine calme ; palier 2 identique.
- [ ] Un commit par lettre (A2.c et A2.e d'abord : petits, sûrs ; puis A2.a+b ; A2.d ; A2.f en dernier, avec son essai de build local `sh vercel-build.sh`).

### A3 — Le cache HTTP des fichiers du jeu hors `assets/` (sans navigateur ; indépendante)

**Pourquoi :** `vercel.json` ne rend immuables que `/jouer/(vendor|assets)/…`. `sons-banque.js` (7,3 Mo), `sons-banque-2.js`, `sfx.js`, `figures.js`, `musique-paliers.js`, `creatures/*.js` sont revalidés (un aller-retour 304 chacun) à CHAQUE lancement sur réseau mobile, et retéléchargés si le cache est évincé.

**Fichiers :** `vercel.json` (headers) · `vercel-build.sh` (après `publie-allege`, avant l'empreinte `JEU`) · `outils/garde-demarrage.cjs` (contrôle) · `code/page/bibliotheques.html` (les `<script src>` avec `?v=`). `sfx.js` n'a RIEN à changer : il dérive l'URL de `sons-banque-2.js` du `src` de `sons-banque.js` (`replace('sons-banque.js','sons-banque-2.js')`, `suite()` l.~100), le jeton suit.

- [ ] Au build : pour chaque `src="X.js?v=…"` local hors `vendor/assets` d'`index.html`, remplacer le jeton par `?v=<8 hex du sha1 du fichier publié>` (`sed` dans `vercel-build.sh`, modèle `__CC_BUILD__`) ; pour `sons-banque.js`, le sha des DEUX moitiés concaténées (la 2e hérite du jeton). Le source (`code/page/bibliotheques.html`) garde ses `?v=N`.
- [ ] `vercel.json` : règle `"/jouer/(sons-banque|sons-banque-2|sfx|figures|musique-paliers)\\.js"` et `"/jouer/creatures/(.*)"` → `public, max-age=31536000, immutable`.
- [ ] `garde-demarrage.cjs` : refuse si un `<script src>` local hors vendor/assets n'a pas de `?v=` (sinon il serait immuable sans jeton).
- [ ] Preuve locale : `sh vercel-build.sh` dans une copie (GARDE_* à 1) → `.vercel-static/jouer/index.html` : chaque `src` porte son sha ; le sha change quand le fichier change (modifier un octet de `figures.js`, rebâtir, comparer).
- [ ] **Critère :** au 2e lancement (CDP `Network`, cache chaud) : 0 requête pour ces fichiers ; `sw.js` inchangé.
- [ ] Commit : `Perf mobile 2 — réseau : jetons de contenu au build + cache immuable pour les .js du jeu hors assets (0 revalidation au 2e lancement)`.

### B1 — JOUER et REJOUER sans gel (après T0)

> **Clos le 5/11 : sans objet, mesuré** — départ d'avance pris 16/16, `newTrack` 20-99 ms au JOUER ; les ~333 ms restants sont la chauffe du niveau neuf après le voile, confiée à A1 (A1.d). Livré : `jouer.py`, `dbgPick`, mesures AVANT (`mesures/2026-11-05-B1-*.json`).

**Pourquoi :** `resetGame` (`code/gameplay/seconde-chance.js:338`) → `newTrack` (`code/rendu/traces-pneus.js:89`) → `buildTrack` (`code/moteur/depart-avance.js:421`) + `spawnPickups` (`code/gameplay/pouvoirs-grisants.js:149`) + `computeMinimap` (`code/gameplay/boost-depart.js:378`) : 1,0-1,3 s d'un bloc au JOUER, 0,7 s au REJOUER (passations du 14/10 ; le DÉPART D'AVANCE et le PRÉ-BÂTI existent depuis : état à remesurer).

**Fichiers :** `code/moteur/depart-avance.js` (le départ d'avance, `pisteRoute` :91 en générateur), `code/moteur/piste-prebati.js` (`PREB` :160, `prebEchange` :185, `pisteInstalle` :205), `code/gameplay/seconde-chance.js:338`, `code/gameplay/pouvoirs-grisants.js:149`, `code/gameplay/boost-depart.js:378`.

- [ ] Mesure avant : script `outils/banc-perf/jouer.py` (dérivé de garde-perf : menu → JOUER, course 5 s, mort forcée `dbgState`/`dbgBoom`, REJOUER ; ×4, palier 0 ; pour 4 maps : nuages, ville, jade, forêt) : images > 100 ms et pire image dans la seconde qui suit le toucher. Résultat dans `mesures/`.
- [ ] Lire `dbgPrebati()` au JOUER et au REJOUER : le départ d'avance est-il PRIS (`PREB.prend`) ? Sinon, pourquoi (la carte tirée à ce moment-là, le délai du volet `setTimeout 160`) — corriger pour que la route soit déjà bâtie dans les deux cas.
- [ ] Ce qui reste synchrone (`spawnPickups`, `computeMinimap`, les décors non couverts) : en tranches de ≤ 4 ms par image sous le voile (`performance.now()>JF.lim` → `yield`, modèle `jadeBatit` `code/maps/jade-3.js:40`), le voile tenu jusqu'à la fin (modèle « LE DÉPART ATTEND LA CHAUFFE », `vignette-moteur.js`).
- [ ] Égalité de simulation : `?pistegraine=777` + `dbgPerfRec` avant/après (même tirage, mêmes pièces : compter `pickups.length` et la somme des positions).
- [ ] Interrupteur `?prebati=0` (existe) couvre le tout ; sinon `?jouertranches=0`.
- [ ] **Critère :** aucune image > 150 ms (×4, p0) dans la seconde du JOUER et du REJOUER sur les 4 maps ; palier 2 : mêmes compteurs.
- [ ] Commit : `Perf mobile 2 — JOUER/REJOUER : départ d'avance pris à chaque fois + ramassages/minicarte en tranches (pire image X → Y ms, p0)`.

### B2 — Le portail vers JADE (après T0 ; indépendante de B1)

**Pourquoi :** la pire transition : ~1,7 s au palier 0 (`jadePorte` / `voxMesh(G,4)` 272 ms sur PC, ×3-5 sur iPhone) ; le niveau pèse 508 k triangles au palier 0 pour 450 k visés (postes : MeshPhong 18 appels / 209 k, MeshBasic 50 appels / 159 k).

**Fichiers :** `code/maps/jade-3.js:40` (`jadeBatit`, générateur, `JF.lim`), `code/maps/jade-eau.js:347` (`function* jadePorte`, la Porte du ciel ; `jadeMonuLoin` :329), `code/maps/jade-1.js` (`jadeFini` :192, `voxMesh` :194, `voxMeshG` :195, `JADE_SOBRE` :167), `code/maps/jade-2.js` (`jadeVerreR1` :271, précédent `JADE_GARDE` :280, `jadeRange` :298, `buildJade` :327), budgets `PAL.B.jade*` aussi dans `code/maps/jade-vol.js:159` (`jadeNuvox*`) et `code/maps/jade-embellie.js:8` (`jadeCristaux`).

- [ ] Mesure avant : `garde-perf.py --palier 0 --json nuages:midi jade:midi` (pire image, images > 100 ms) + en course jade `dbgJadePoste('liste')` (triangles par objet nommé) → les 10 postes les plus lourds.
- [ ] La Porte du ciel GARDÉE d'une visite à l'autre : cache `{cle: G (la grille), mesh}` dans `jadePorte`, rangée par `jadeRange` et non disposée (modèle `JADE_GARDE`) ; à la 2e visite de la map, 0 ms de `voxMesh`. Au 1er passage : tranches `JF.lim` plus fines (2 ms) sur le palier 0.
- [ ] Budgets : pour les postes au-dessus de la part (ex. `jadeCristaux`, cubes lointains `jadeNuvoxQuart`, piliers > 700 m) ajouter/abaisser la colonne ANCIEN de `PAL.B.jade*` jusqu'à ≤ 450 k triangles et ≤ 150 appels à 1 100 m de la Porte ; colonne RÉCENT inchangée.
- [ ] Captures A/B `?palier=2&play=jade&pistegraine=777` à t = 2 s : identiques au pixel ; captures p0 avant/après dans `passation/perf-2026-11/captures/` (Sacha juge l'œil).
- [ ] Interrupteurs : `?jadegarde=0` (porte refaite à chaque fois), les budgets via `?palier=2`.
- [ ] **Critère :** pire image du portail nuages → jade < 300 ms (×4, p0), 2e visite < 100 ms ; triangles p0 ≤ 450 k ; p2 identique.
- [ ] Commit : `Perf mobile 2 — jade : Porte du ciel gardée entre deux visites + budgets p0 (portail X → Y ms, 508 → N k triangles)`.

### B3 — Les autres portails en tranches (après B1 : même `piste-prebati.js`)

**Pourquoi :** garde-perf du 27/10 : pire image 533 ms (portail → ville:pluie), 117-333 ms ailleurs — sur Mac ×4 ; ×1,5-2 sur un iPhone 7. Le PRÉ-BÂTI couvre la route ; les décors de certaines maps se bâtissent encore d'un trait au passage.

**Fichiers :** `code/moteur/piste-prebati.js` (`PREB`, ce que `prebEchange` couvre), `code/maps/jade-balade.js:27` (`buildVoxCity`, ville), `code/maps/ville-v3.js`, `code/maps/ville-verre.js` (vitrée), `code/maps/foret-construction.js:69` (`buildForetG`, déjà générateur : vérifier qu'il `yield` bien sous le palier 0), `code/maps/glacier-construction.js:79` (`buildBanqG`, `bkTranches`), `code/maps/grottes-2.js:209` (`buildGrotteG`), `code/maps/canyon-route.js:315` (`cyBatitG`), `code/maps/dunes-1.js:397` (`buildDunes`, SYNCHRONE), `code/maps/cryptocity-taureau.js:209` (`cryptoBatit`), `code/maps/orbite-2.js:12` (`orbiteBuild`), `code/maps/nuages-vitrail.js:539` (`buildClouds`).

- [ ] Mesure avant : `garde-perf.py --palier 0 --json` sur les 11 maps : par map, pire image et images > 100 ms au passage. Tableau dans `passation/perf-2026-11/PORTAILS.md`.
- [ ] Pour chaque map dont la pire image dépasse 250 ms : son constructeur synchrone (d'abord `buildDunes`, `buildVoxCity`, `cryptoBatit`, `buildClouds`) devient un générateur `*…G` à rendez-vous `JF.lim` (modèle `buildForetG`), appelé par le pré-bâti pendant l'approche ; fallback synchrone (`jadeFini(gen)`) quand `?prebati=0`.
- [ ] Égalité au bit : empreinte FNV des tampons de `trackMeshes` + des maillages de la map sur 3 graines (modèle `egal2.cjs`), avant/après, par map touchée.
- [ ] **Critère :** 11 maps : pire image < 250 ms (×4, p0), ≤ 8 images > 100 ms par passage, 0 compilation, 0 erreur ; empreintes égales.
- [ ] Un commit PAR MAP : `Perf mobile 2 — portail <map> : décor bâti en tranches pendant l'approche (pire image X → Y ms, p0)`.

### C1 — Le HUD sans lecture forcée du DOM (après T0 ; indépendante)

> **Clos le 5/11 : sans objet, mesuré** — la lecture après mise en page (17/10) avait déjà réglé le problème, ~1,6 ms/s restants ; aucun changement de code. Livré : `hud-profil.py` + mesures (`mesures/2026-11-05-C1/`).

**Pourquoi :** `hudColonne` (`code/interface/passe-textes.js:189`) et `volgTick` (`code/interface/bouton-nitro-gains.js:231`) lisent `getBoundingClientRect` (`zRect`, `code/interface/auto-ecole.js:242`) à 10 Hz : ~13 ms/s de mise en page forcée sur PC (×4 sur iPhone 7). 69 appels à `getBoundingClientRect` dans le fichier ; 6 `ResizeObserver` déjà en place.

- [ ] Mesure avant : profil CDP 8 s de course (p0, ×4) : self time de `hudColonne`, `volgTick`, `zRect`, et le compteur `Layout` (événements `UpdateLayoutTree`/`Layout` dans la trace) par seconde.
- [ ] Les rectangles que le HUD relit à chaque tour deviennent un cache `HUD_R` rempli par UN `ResizeObserver` sur les éléments concernés + invalidé sur `resize`/`orientationchange`/changement de classe du HUD ; `zRect(el)` lit le cache si l'élément y est.
- [ ] Repérer les autres lectures par image en course (`grep -n getBoundingClientRect code/moteur/boucle-*.js code/interface/*.js`) : celles qui tournent dans `loop()` passent par le cache.
- [ ] Interrupteur `?hudcache=0`. Capture A/B du HUD en course (couché ET debout) : identique.
- [ ] **Critère :** `Layout` forcés en course < 1/s ; self time cumulé des trois fonctions −70 %.
- [ ] Commit : `Perf mobile 2 — HUD : rectangles du HUD en cache (ResizeObserver), plus de mise en page forcée par image (X → Y ms/s)`.

### C2 — Les allocations par image en course (après T0 ; indépendante)

**Pourquoi :** sur un vieux iPhone, le ramasse-miettes fait des pauses de 10-30 ms ; `ETAT-PERF` listait des clés de `Map` en CHAÎNE lues en course (`C.g.get(x+','+z)` dans la ville, `G.G.get`), `pickupsTick` (`code/gameplay/ramassage.js:53`) copiait ~9 000 vecteurs par image avant le 14/10. État à remesurer.

- [ ] Mesure avant : course 20 s (p0, ×4, `?pistegraine=777`, nuages puis ville) : `performance.memory.usedJSHeapSize` toutes les secondes → pente (Mo/s) ; trace CDP catégorie `v8.gc` (ou `disabled-by-default-v8.gc`) → nombre de GC mineurs par 10 s.
- [ ] `grep -n "\.get([a-zA-Z0-9_]*+','+" code/maps/*.js code/gameplay/*.js code/moteur/*.js` : chaque clé en chaîne lue en course → clé numérique `x*100003+z` (précédent des grilles, injectif, ordre d'insertion inchangé) ; `grep -n "new THREE\.\(Vector3\|Matrix4\|Quaternion\)" code/moteur/boucle-*.js code/gameplay/ramassage.js` : objets créés par image → réutilisés (module-level scratch).
- [ ] Égalité de simulation (`dbgPerfRec` + score) sur 2 graines.
- [ ] **Critère :** pente du tas en course −50 %, GC mineurs −30 % ; simulation identique.
- [ ] Commit : `Perf mobile 2 — course : N allocations par image supprimées (clés numériques, vecteurs réutilisés) : tas X → Y Mo/s (p0)`.

### C3 — Le budget de rendu par map aux paliers 0 et 1 : NOMMER d'abord, puis tailler (CONCEPTION FABLE, 5/11 ; après T0 ; ne touche pas à la jade = B2)

**Pourquoi (mesuré, §2 bis) :** aux NUAGES (461 k au p0 contre 480 k au p2) et aux DUNES (348 k contre 378 k) le palier 0 dessine presque autant que le palier 2 : les budgets `PAL.B` existants ne mordent pas sur les plus gros postes, qui sont des maillages SANS NOM ajoutés directement à la scène (`MeshBasicMaterial (scène)` : 114 k aux nuages, **165 k aux dunes** ; `ShaderMaterial` sans nom 117 k aux nuages ; `MeshPhongMaterial (scène)` 77 k). La forêt, elle, est bien taillée (143 k contre 418 k). Cible p0 : ≤ 150 appels, ≤ 300 k triangles (iPhone 7 : la puce souffre au-delà de ~300 k) ; p1 : ≤ 250 / 500 k ; p2 : inchangé.

**Fichiers :** les constructeurs des maps (§5 B3) ; `window.dbgAppels` (`code/maps/jade-vol.js:371` ; `window.__appelsDetail=1` donne le type de géométrie, `renderOrder`, `userData`) ; les budgets au début de chaque fichier de map.

- [ ] **C3.a — nommer.** Pour nuages, dunes, canyon, ville v3/vitrée, orbite, grottes, banquise, crypto : chaque `scene.add(m)` / `trackMeshes.push(m)` d'un maillage de décor ou de piste reçoit un `m.name='<map> <chose>'` (ex. `'dunes sable'`, `'piste rubans'`, `'nuages v8'`, `'ciel dôme'`). Zéro changement d'image. Puis `dbgAppels()` à p0 sur les 11 maps (lecture à instant fixe de T0) → tableau `passation/perf-2026-11/FAMILLES.md` : par map, les 8 familles les plus lourdes, nommées.
- [ ] **C3.b — tailler, map par map, du plus gros poste au plus petit**, en commençant par les dunes (le sable / les pyramides : 165 k en `MeshBasic`) puis les nuages (le poste sans nom de 117 k et les sphères `mkCloud` : `CLOUD_SPH` 16×11 sur ALLEGE → `PAL.B.nuSph=[[10,7],[12,8],[16,11]]` ; `coton` 102 k → `PAL.B.cotonCap=[280,420,560]` sur `COTON.cap`), puis canyon, grottes, orbite, villes. Moyens, dans l'ordre : moins de segments (sphères, cylindres), distance de LOD plus courte, densité des instances, JAMAIS retirer un objet de Léo. Budget = `PAL.B.<map><Chose>=[ancien, moyen, AVANT]` au début du fichier de la map.
- [ ] Par map : capture p0 avant/après (même graine, même instant) dans `passation/perf-2026-11/captures/` pour l'œil de Sacha ; capture p2 identique au pixel ; `dbgCout()` p2 identique.
- [ ] **Critère :** 11 maps dans la cible p0 (≤ 150 / 300 k) et p1 (≤ 250 / 500 k) ; p2 inchangé ; `compare.cjs` vert.
- [ ] Un commit pour C3.a, puis un commit PAR MAP : `Perf mobile 2 — <map> : budgets p0/p1 (<chose>), appels A → B, triangles X → Y k (p2 inchangé)`.

### C4 — Les passes et lectures de la puce par image au palier 0 (après T0 ; indépendante)

**Pourquoi :** la puce à tuiles de l'iPhone 7 paie chaque passe plein écran et toute LECTURE (`readPixels`, `getBufferSubData`, `fenceSync`). Bloom éteint au p0 (`bloomOff`), ombre 1024 (`code/rendu/triptyque-bloom.js:4`), mais 15 `WebGLRenderTarget` et 15 `readPixels` existent : lesquels tournent EN COURSE ?

**Fichiers :** `code/rendu/triptyque-bloom.js` (8 `setRenderTarget`), `code/rendu/ciel2.js` (4), `code/interface/vignette-moteur.js` (10, chauffe), `code/rendu/nettete-qualite.js:43` (la sonde `qlSonde*`, `readPixels` ; `bloomOff` :193), `code/maps/dunes-2.js`, `canyon-mine.js`, `jade-vol.js`, `code/son/musique-frenesie.js` (2 `readPixels` ?!), `code/moteur/boucle-4-effets.js` (reflets, phares).

- [ ] Mesure avant : piéger `WebGL2RenderingContext.prototype.{bindFramebuffer,readPixels,getBufferSubData,clientWaitSync}` (script `addScriptToEvaluateOnNewDocument`, modèle `HOOK` de garde-perf) → par image en course, p0, 4 maps : passes (framebuffers distincts liés), lectures. Tableau.
- [ ] Toute passe/lecture par image non indispensable au p0 (ex. reflet/cubemap par image, sonde de qualité quand `CAD.on`, lecture de la carte moteur à l'écran de mort — `PAL.B.mortImg` existe, `code/interface/bouton-nitro-gains.js:299`) : espacée (`PAL.B.<nom>Img=[4,2,1]` : une image sur n) ou coupée au p0 (`[0,1,1]`), 3e colonne = avant.
- [ ] **Critère :** en course p0 : passes par image = 2 (ombre + scène) hors événements, 0 lecture synchrone par image ; p2 inchangé.
- [ ] Commit : `Perf mobile 2 — rendu : N passes/lectures par image espacées au p0 (passes 5 → 2, lectures 1 → 0)`.

### C5 — Le gouverneur thermique (port de `mobile-perf` du 26/10) (après B3 et C4 : fichiers communs)

**Pourquoi :** mesuré sur le 13 Pro : effondrement de la cadence dès la 2e minute (chauffe), avant tout bridage d'iOS ; la branche `mobile-perf` (11 commits, jamais fusionnée, 437 commits de retard) porte la dose de chaleur sans capteur (`gouverneur-thermique.js`), le régime chaud (`mobh-regime-chaud.js`), l'ombre de la caisse en un maillage (`moba-ombre.js`), les rubans en tranche moyenne, la période d'écran en médiane. On ne fusionne pas la branche : on REPORTE à la main, commit par commit, en vérifiant que main n'a pas déjà fait l'équivalent (ex. `perf-mobile-3110`, 1/11).

**Fichiers (de la branche, `git show mobile-perf:code/…`) :** `code/moteur/gouverneur-thermique.js` (68 l., nouveau), `mobh-regime-chaud.js` (17), `mobi-interrupteurs.js` (11), `code/voitures/moba-ombre.js` (91), et les diffs de `cadence.js` (+19), `nettete-qualite.js` (+37), `boucle-6-hud.js`, `piste-prebati.js` (+91 : à CONFRONTER au pré-bâti actuel), `glacier-verglas.js`, `canyon-mine.js`, `dunes-2.js`, `nitro-feu.js`. Ordre dans `ORDRE.txt` : après `moteur/cadence.js`.

- [ ] `git log --stat origin/main..mobile-perf -- code` et, pour chacun des 11 commits, `git show <sha> -- code | head -200` : décider GARDER / DÉJÀ FAIT / ABANDONNER (tableau dans `passation/perf-2026-11/MOBILE-PERF-26-10.md`). Priorité : gouverneur (b4179370, d7fb7b2f, 567724e9), A5 ombre (040c8a69), A2 rubans (e754d3f7).
- [ ] Reporter d'abord le gouverneur : mêmes interrupteurs (`?mob_gouv=0` = avant, `?mob_g30=1`), mêmes crochets (`dbgGouv`, `dbgThermique`), prise `cc:thermique` (l'app iOS l'enverra plus tard).
- [ ] Preuve sans téléphone : test node en `vm` de la dose (modèle `perf/banc/chef/v13.cjs` / `preuve-cadence30.cjs`) : 7 min simulées d'images à 24 ms → bascule à 30 avant la 3e minute, retour à 60 après 90 s de repos ; palier 2 sur ordinateur : `CAD.ok=0`, jamais calé (test).
- [ ] Vrai iPhone (Sacha, 13 Pro, Safari → Web Inspector → Timelines, ou `?perf=1` à l'écran) : 7 min de course, p50/p90 à la minute 1 et à la minute 6, avant/après — la seule preuve qui compte ; le demander dans le rapport.
- [ ] **Critère :** tests node verts ; garde-perf 0 compilation ; p2 PC inchangé ; Sacha valide à l'œil sur son téléphone.
- [ ] Un commit par élément reporté : `Perf mobile 2 — gouverneur thermique (report de mobile-perf b4179370) : 30 i/s avant le bridage, ?mob_gouv=0 = avant`.

### D1 — La mémoire par écran et les fuites entre maps (après T0 ; indépendante)

**Pourquoi :** iOS tue l'onglet/l'app bien avant 1 Go ; l'iPhone 7 a 2 Go. Le 14/10 : 184 toiles 2D = 52 Mo avant le 1er écran (ramené à 155 = 26 Mo), tas 204 Mo en course, 1 760 tampons = 35 Mo. Depuis : 29 moteurs hybrides, pluie de richesse, nouvelles maps. Jamais remesuré.

**Fichiers :** `code/rendu/palier-appareil.js:88-90` (`PAL.B.memToiles`, `toileRend`, `texLibere`), `code/maps/ville-nuit.js:234` (`MAT_SURSIS`) et `code/moteur/depart-avance.js:421` (le ménage de `buildTrack`), les `dispose` des `build*` (B3), `code/interface/photos-films.js:77` (`carPhoto`, cache IndexedDB des photos), `code/rendu/tirelire-reserves.js:151` (`makePool`).

- [ ] Mesure avant (p0, ×4) : à l'accueil, au garage, à l'inventaire, à la boutique, en course (4 maps), à l'écran de mort : `renderer.info.memory` (textures, geometries), `dbgToiles()` (n, Mo), `usedJSHeapSize`, `renderer.info.programs.length`. Puis le TOUR des 11 maps par portails (garde-perf) : textures/geometries/tas AVANT et APRÈS le tour → la croissance = la fuite.
- [ ] Les 5 postes les plus lourds et toute croissance > 5 % après le tour : disposer ce qui n'est plus dans la scène (`MAT_SURSIS`), `texLibere` les `CanvasTexture` peintes une fois (83 sites : vérifier « jamais redessinée »), plafonner les réserves (`makePool`) par palier (`PAL.B.pool*=[…]`).
- [ ] **Critère :** après le tour des 11 maps : textures et geometries reviennent à ±5 % de la valeur d'avant le tour ; tas en course p0 ≤ 150 Mo (Chrome ×4 comme proxy) ; p2 : mêmes compteurs de rendu.
- [ ] Commit : `Perf mobile 2 — mémoire : N textures/toiles rendues, fuite de X Mo par tour de maps bouchée (tas course X → Y Mo, p0)`.

### E1 — La copie publiée : le `<style>` non allégé et le CSS mort (sans navigateur ; indépendante)

**Pourquoi :** 1,92 Mo gzip retéléchargés à chaque nouvelle version ; `publie-allege` laisse un `<style>` entier avec ses commentaires (« gardé tel quel (accolades) ») ; 0,93 Mo de CSS en 56 feuilles dont une part ne s'applique plus (charte 6 retirée le 18/10, UX 8, menu de Léo…).

- [ ] `node outils/publie-allege.cjs <copie> --essai` : identifier la feuille gardée (ajouter l'`id` du `<style>` au message d'avertissement), trouver le commentaire CSS qui fausse le compte d'accolades (`accolades()`), corriger le COMMENTAIRE dans `code/css/<feuille>.css` (pas la règle) ; essai → 0 avertissement.
- [ ] Couverture CSS (CDP `CSS.startRuleUsageTracking` … `stopRuleUsageTracking`) sur un parcours complet couché + debout (accueil, bienvenue, garage, inventaire, boutique + un rayon, réglages, missions, pause, course, mort, final spin, auto-école) → `passation/perf-2026-11/CSS-MORT.md` : les règles jamais utilisées, par feuille, avec leur poids. **Rapport seulement** : Sacha décide ce qui part (une règle « jamais vue » peut être celle d'un état rare).
- [ ] **Critère :** publie-allege sans avertissement ; rapport chiffré.
- [ ] Commit : `Perf mobile 2 — publication : la feuille <id> allégée elle aussi (−X Ko gzip) + rapport du CSS mort`.

---

## 6. L'ordre, les vagues, l'intégration

| Vague | Tâches (en parallèle) | Navigateurs | Après |
|---|---|---|---|
| 0 | **T0** | 1 | — |
| 1 | A1 · A3 · B1 · C1 · C2 | ≤ 3 (A3 sans) | T0 intégrée |
| 2 | A2 · B2 · B3 · C3 · C4 | ≤ 3 | vague 1 intégrée (A2 après A1, B3 après B1) |
| 3 | C5 · D1 · E1 | ≤ 2 | vague 2 intégrée (C5 après B3 et C4) |

**L'intégrateur (une session Sonnet, la même du début à la fin) :**
1. Crée `~/cash-car/perfmob/`, `integ/` = `git worktree add integ -b perf-mobile-2026-11 origin/main` (depuis `~/cash-car/game`, après `git fetch origin` ; si main a avancé, repartir du nouveau `origin/main` et le noter en tête de ce plan), `wt/<tache>` = worktree de `perfmob/<tache>` depuis `perf-mobile-2026-11`. Chaque worktree de tâche peut être LÉGER (`git sparse-checkout` sans `assets/audio`).
2. Lance la vague (une session Sonnet par tâche, `start_session` initiation user_asked, brief = la tâche copiée MOT POUR MOT + §1 + §3) ; relit chaque rapport (≤ 25 lignes : commits, fichiers:lignes, chiffres avant/après, ce qu'il faut vérifier, ce qui a été vu sans être touché).
3. À la fin de la vague : `git merge perfmob/<tache>` dans `perf-mobile-2026-11` une à une ; après chaque fusion `node code/assembler.cjs --verifier`, les 4 gardes, puis `garde-perf.py --palier 0` ET `--palier 2` contre la base de T0 (`compare.cjs`) : **un compteur du palier 2 qui bouge = la fusion est refusée** et retourne à l'agent.
4. Fumée de la version intégrée, couché ET debout : accueil → garage → inventaire → boutique → réglages → JOUER → course (3 maps par portail) → mort → REJOUER → final spin ; 0 erreur `__ccNote`.
5. Un seul `sw.js` +1 par train, dans un commit à part (`cache vNNNN : passe perf mobile 2, vague N`).
6. **Pousser `perf-mobile-2026-11` sur origin** (jamais main). La fusion dans `main` (= publication Vercel) se fait sur le OUI de Sacha, vague par vague ; puis, sur `ios-capacitor` : `git merge origin/main` et `cd app-ios && npm run sync` (vérifier que `preparer-www.js` n'écrit aucun « motif introuvable »).
7. Rapport à Sacha par vague : le tableau compteurs base → après par palier, les captures p0 avant/après, et **le lien de test** : `https://car-cash-git.vercel.app/jouer/?tel=1&palier=0` (vieux iPhone émulé), `…?tel=1&palier=1`, `…?palier=2` (doit être l'image d'avant), sur son iPhone : `https://car-cash-git.vercel.app/jouer/` tel quel (le palier se lit dans `dbgPalier()` → la version publiée l'a retiré : noter le palier choisi dans l'écran RÉGLAGES si on veut le voir sans console).

**Ce qui n'est PAS dans ce plan (à décider par Sacha) :** la sonde à distance (télémétrie des vrais téléphones : il faut un stockage Vercel Blob/KV créé par un humain) ; la pré-construction complète du niveau suivant (`PLAN-PREBUILD.md`, E4-E5 : semaines) ; le découpage des dessins de caisses hors du script (A2 le chiffre) ; l'achat d'un iPhone 7/8 de test (la vérification qui manque le plus depuis le 14/10).
