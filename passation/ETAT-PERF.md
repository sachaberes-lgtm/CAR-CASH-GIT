# ÉTAT — session PERF (ex-FORÊT), 14/10/2026 soir — axes A (constructions) et B (shaders)

## Mesures AVANT (banc PC, UA iPhone, DPR 1, `?perf=1`, intervalle d'image vrai)
- JOUER : deux images de 93 et 65 ms (resetGame → newTrack SYNCHRONE dans le geste, puis chauffeRendu à +120 ms).
- PORTAIL : ville ~200 ms · nuages ~160 ms · forêt ~260 ms · JADE ~700 ms (Porte du ciel : jadePorte 286 ms dont voxMeshG ~200).
- REJOUER et MORT : aucune image > 34 ms. Plus aucune compilation de shader en course (la chauffe du menu couvre tout).
- Arbre CPU moyen d'un portail (8 portails) : newTrack 313 ms sous profileur = buildTrack 241 (jade 116 en moyenne, forêt 33,
  pisteTranches 19, normales9 9, voxCity 9, nuages 8) + spawnPickups 9 + ~60 ms non attribués (fonctions inlinées).

## Fait (branche `foret` → main)
- Grilles de construction : clés de Map en CHAÎNE (`x+','+z`) → clés NUMÉRIQUES (`x*100003+z`) dans buildForet (grille + zones nues),
  buildParis (+ sa lecture en course PARIS.grille ~l.16740), buildJade, buildVoxCity. Injectif (|z/HB| ≪ 50 001), ordre d'insertion
  des Map inchangé, aucune itération de clés : identique par construction.
- Forêt : bruit du sol en deux moitiés (les sinus séparables lus dans des tables, mêmes opérandes) + index du sol en tableau typé.
- MESURÉ (banc d'égalité `egal2.cjs`, 3 graines fixes, empreinte FNV de TOUS les tampons de trackMeshes, ancienne contre nouvelle) :
  forêt IDENTIQUE AU BIT sur les 3 graines ; newTrack forêt 484 → 398 ms en moyenne (−18 %, PC). Jade et ville : pas repassés au banc
  (file d'attente) — le changement y est la seule substitution de clé, sûre par construction.
- Signaux `cc:portail` / `cc:construction` (debut, fin, chauffe) pour les voiles d'INTERFACE (voir LES SIGNAUX DE CONSTRUCTION).
- Axe B : la traînée WOW choisie au garage préparée hors course (buildCar), plus à la 1re nitro.
- Plan de la pré-construction du niveau suivant : `passation/PLAN-PREBUILD.md`.

## Reste, par rendement
1. JOUER : voile peint → 2 rAF → resetGame (INTERFACE l'a inscrit en tête de sa passation).
2. JADE : la Porte du ciel (voxMesh, déjà découpable en tranches : générateur `voxMeshG` + `JF.lim`) — la construire en tranches sous le voile.
3. Encore des clés en chaîne LUES EN COURSE (allocations par image) : `C.g.get(...)` (ville, l.15623/18574/18966), `G.G.get` (l.15381).
4. foretSolMesh : index en Uint16/32Array au lieu de `I.push` ; foretSol : sinus séparables (voir le rapport de l'axe A).
5. Pièges du banc : régler `CC_PORT` AVANT `require(lib.cjs)` (sinon on mesure le serveur d'une autre session sur 8742) ; un node de banc
   tué de force garde son verrou cc-banc.lock — le rendre à la main.
