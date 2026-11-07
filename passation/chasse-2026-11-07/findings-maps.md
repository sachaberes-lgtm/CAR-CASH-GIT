# Chasse — maps (agent Sonnet, 2026-11-07, v1235 c9d9895d)

Bilan : 0 bloquant, 2 majeurs, 4 mineurs. Scripts : chasse/maps/ (dead.cjs, worker.cjs, game.js).

Méthode mécanique : `dead.cjs` (appels sans définition : seulement globaux externes et `genParis`) ; ESLint `no-undef` sur le script de 8,9 Mo : aucun ReferenceError dans les constructeurs de maps ; `worker.cjs` : aucune variable libre manquante dans les Workers dunes/canyon/nuages ; toutes les clés `bio` de `SF_CARTES` existent dans BIOMES ; toutes les cartes postales retombent sur une image existante ; `sfTire`, `sfNiveau`, `portDest` ne renvoient qu'une carte × météo présente ; météos inconnues → `midi`/`matin`.

Fichiers lus : niveaux.js, continuite.js (1-260), murs-slide.js, pigeons.js, dunes-ver.js, dunes-4.js, audit-placement.js (début), canyon-murs.js (début), foret-sentiers.js (20-130), dunes-1.js (395-640), dunes-2.js (280-330, 440-460), jade-2.js (270-420), jade-eau.js (359-426), jade-balade.js (27-80), grottes-2.js (1-75, 245-262), grottes-1.js (272-280, 388-394), glacier-construction.js (1-60), foret-construction.js (5-40, 68-75, 483-506), canyon-route.js (310-352, 420-450, 500-520), cryptocity.js (40-48), pluie-argent.js (106-123) ; piste-prebati.js (35-420), depart-avance.js (60-130, 415-470), traces-pneus.js (89-140), portails.js (23-28, 110-136, 250-285), tirelire-reserves.js. Les ~2,2 Mo de code/maps/ non lus en entier.

## A. Audit du 11-05
| ID | état | preuve |
|---|---|---|
| RND-01 | OUVERT (atténué) | dunes-1.js:540 `const W=started&&…?dnTravailleur():null;` puis `dnMondePose(dnMondeCalc(S,opt))` ; :461-463 ; `dunes` absent de `PREB_CPU_DEF` (piste-prebati.js:367) |
| RND-02 | OUVERT | prebJob ne gère que jade/foret/banquise/grotte/canyon/dunes ; depart-avance.js:429 `buildClouds`, :452 `buildVoxCity`, :466 `orbiteBuild` dans buildTrack |
| RND-07 | NON VÉRIFIABLE ; mitigé par piste-prebati.js:26,62 | |
| RND-08 | OUVERT | piste-prebati.js:364 : pré-bâti grotte/jade toujours sur le fil principal |
| RND-09 | NON VÉRIFIABLE | |
| RND-10 | OUVERT | cartes postales dunes du 10-22, Arrakis du 11-05 ; `PCUBE_PAL.dunes` or/cyan (portails.js:26) |
| RND-11 | OUVERT (pire : MAP-N01) | piste-prebati.js:289 ; dunes-1.js:461-463 ; `DN.on` faux → `dunesHeurt` renvoie '' |
| RND-12 | CORRIGÉ en course (confiance moyenne) | jade-2.js:335 `if(started&&!gameOver)jadeOublie();` |
| RND-13 | CORRIGÉ | une seule `dnGeos2` (dunes-embellie.js:7) ; plus de dunes-dieux/gizeh |
| RND-03 / RND-28 | CORRIGÉ | |

## B. Nouveaux défauts

### MAP-N01 · MAJEUR · Dunes : portail avant le Worker, sable absent et calcul refait
- Où : piste-prebati.js:289 (prebJob) et dunes-1.js:459-463 (buildDunes).
- Quoi : si le portail des dunes arrive avant la réponse du Worker, `prebTravaille(Infinity)` sort de la boucle (`JF.lim===Infinity` → break), `W.dunes.R` reste nul, et `buildDunes` reposte un second job identique au lieu d'attendre le premier (le canyon attend : canyon-route.js:346 `CY.attente`). Pendant ce temps `DN.on` faux : pas de sable, `dunesHeurt` renvoie '', route dans le vide ; calcul fait deux fois.
- Preuve : `while(!a.R){if(JF.lim===Infinity||!DN.w)break;…}` ; `if(W9){const job=DN.job;DN.attente={…};try{W9.postMessage({job:job,…});return;}`
- Correction proposée : dans `buildDunes`, si `a.job` est en vol (`!a.R` et `DN.w`), poser `DN.attente={job:a.job,…}` et accepter `R.job===a.job` dans `W.onmessage` (comme `cyAvPrend`). Ajouter `dunes:3000` dans `PREB_CPU_DEF`.
- Confiance : moyenne-haute sur le mécanisme, basse sur la fréquence.

### MAP-N02 · MAJEUR · Les Workers dunes et canyon ne sont jamais arrêtés
- Où : dunes-1.js:545-553 (dnTravailleur), canyon-route.js:429-440 (cyTravailleur).
- Quoi : chaque Worker vit toute la session avec ses caches ; URL Blob jamais révoquée. Le Worker des nuages est arrêté au repos depuis le 05-11 (nuages-v8.js:~377-387, mesuré 64 Mo + 18-51 Mo). `.terminate()` absent de dunes et canyon.
- Correction proposée : même mécanisme que `cotonOuvrierRepos` : après `dnMondePose` / `cyMondePose`, `setTimeout` 1,5 s → `W.terminate();DN.w=undefined;` + `revokeObjectURL`.
- Confiance : haute sur l'existence ; basse sur l'ampleur.

### MAP-N03 · MINEUR · Trois exceptions du pré-bâti l'éteignent pour toute la session
- Où : piste-prebati.js:304 (`PREB.echecs++`), :353, depart-avance.js:45 (`PREB.echecs<3`). Jamais remis à zéro.
- Correction proposée : `PREB.echecs=0` dans `resetGame`, ou décrémenter après un pré-bâti réussi.
- Confiance : haute.

### MAP-N04 · MINEUR · Volées de pigeons dans la grotte, le canyon, les dunes
- Où : pigeons.js (`pigeonsInterdits`) : seuls espace/orage/jade exclus ; dans LES PROFONDEURS la volée apparaît dans la roche ou sous la voûte.
- Correction proposée : ajouter `c.id==='grotte'`.
- Confiance : moyenne.

### MAP-N05 · MINEUR · `genParis` supprimé mais encore appelé par le banc (piste-prebati.js:95, branche morte). Retirer.

### MAP-N06 · MINEUR (garde-fou) · `lvlBiome` peut boucler à l'infini si `bio:['matin','matin']` (continuite.js). Pas de défaut actuel.

## C. Ce qui survit au changement de map
Commun : `pisteInstalle` retire `trackMeshes`, dispose géométries, matières en `MAT_SURSIS` (piste-prebati.js:230-236).
| Map | Libéré | Survit |
|---|---|---|
| nuages/orage | `disposeClouds` (portails.js:272), `cotonVide` | `CLOUD_MAT`, `COTON.root`+`im` (count=0), `NCB.mesh`, `NPOU`, `PCUBE.img` (≤5) ; Worker arrêté (OK) |
| ville/crypto | `buildVoxCity` (`F.im/imL.dispose`), `cryptoVide`, `crhVide` | `CRH.tours/fais`, `CRYPTO.lune/feux/fus` (cachés), `PLA.mB/mP`, `VIT.ciel/dir`, warm-up `cryptoChauffe` (une fois) |
| jade | `jadeRange`→`jadeOublie`/`jadeJette` | `JADE_GARDE.m` (menu), EAUP/EAUB/SILL/JSOUS/JEAU, `GRUE.im`, `JSG.node`, `JDM.node`, `JADE_ESPRITS`, `JADE.geos`, `JADE_PORTE_C` |
| forêt | `foretVide` | `fx.pap/luc/fol/lune/halo/loup`, `ABE.g`, `foretMats()` |
| canyon | `cyLiberer` (canyon-route.js:314) | `CY.mesh/grp`, `CY_POUS.p`, `V.im`, `CY.z1`, `CY.tNz/tRnd`, Worker `CY.w` (MAP-N02), `CY.Z/F/O/qw/bg` |
| dunes | `dnEteindre`→`dnLibere` (dunes-1.js:409) | `DN.mesh/part/mat`, `DN.geos2`/`DN_MOD`, `DN.Z/F/O`, `DN.pre`, Worker `DN.w` (MAP-N02) |
| glacier | `banqVide`, `bkTraceVide` | `fx.pan/cre/aur`, `BK_TR.mesh`, `banqMats()` |
| grottes | `grotteVide` | `GRT_FX.part`, 24 ambiances `grt-*` |
| orbite | `orbiteBuild` (`SATS[i].count=0`) | `SATS`, `GLINT`, lumières persistantes |
Aucune map ne laisse de `setInterval` ni d'écouteur ; `setTimeout` bornés.

## D. Non vérifié
Lecture par sondage des 2,2 Mo ; aucun code exécuté. Écarts décor/route non mesurés : dunes (balises de crête à `lat=RH+8`, rayon de mort ≈7,4 m, ~0,6 m du bord de dalle à 40° ; murs de sable des virages vs bord relevé +18 m) ; jade (Porte du ciel ht=150/hw=62 vs `airMax()`) ; grotte (`grtLibre` sur grotte glacée). `TROU`/`TROUMARK` : code mort. RND-07/09 non mesurables.
