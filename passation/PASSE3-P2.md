# PASSE 3 — P2 : l'image adaptée sur téléphone récent, et le coût des bascules d'`imgRegle` (07/11/2026)

Branche `perf3/P2` (depuis origin/main c9d9895d). Rien poussé. Détail des captures et du tableau : `passation/perf-2026-11/captures/p2-tel/LISEZ-MOI.md`.

## Ce qui est commité
- Leviers a à f (halo, ombre, résolution, ciel lisse, stries/traînées, QL réactif), un commit chacun, budgets `PAL.B.img*` lus seulement sous `TEL_NATIF` palier 2 ; `?img=max` = l'image d'avant, `?imgsans=<l>` en retire un.
- `imgRegle({halo,mips,ombre,dpr,ciel,stries})` : couche dynamique pour le gouverneur (b2ce4629).
- **87dd46e4 — bascules moins coûteuses** (`code/rendu/nettete-qualite.js`) :
  - `curDPR=-1` retiré (fin d'`imgRegle` et `reset`) : `qlPose` ne rappelle `applyDPR` que si la résolution calculée change (un réglage de halo, mips, ciel, ombre ou traits ne réalloue plus la toile ni le compositeur).
  - `imgRegle('reset')` remet les valeurs tout de suite mais ne repose l'échelle qu'à la microtâche (`imgDiffere`) : un `imgRegle(o)` qui le suit dans la même tâche la pose UNE fois (avant : reset puis réglage = deux réallocations par bascule).
  - cartes d'ombre ≤ 1280 gardées par taille (`QL.ombres`) : revenir à 512/768/1024 ne réalloue rien ; les grandes de la vitrine (> 1280) sont libérées comme avant ; `renderer.shadowMap.needsUpdate=true` après l'échange.
- Banc `outils/banc-perf/p2-image.py --gouv` : dbgGouv 0 → 70 → 110 → 150 → 70, compte par étape les textures/renderbuffers alloués (`texStorage2D`, `renderbufferStorage*`), les programmes compilés et les images > 100 ms.
- `perf3/P2b` (même correctif sur la base perf3-main-b13, 406b3b2f) : non repris, vitesse-fluide a pris 87dd46e4.

## Comptages par bascule (Mac, `?tel=1&palier=2`, nuages)
| dose | avant (textures / renderbuffers / pixels) | après |
|---|---|---|
| 0 → 70 (palier 1) | 8 / 6 / 0,93 M | 8 / 6 / 0,93 M |
| 70 → 110 | 7 / 5 / 1,48 M (palier 3 atteint) | 4 / 3 / 1,00 M (palier 2) |
| 110 → 150 | 0 | 3 / 2 / 0,47 M |
| 150 → 70 | 3 / 2 / 0,74 M | 3 / 2 / 0,74 M |
**Programmes compilés par bascule : 0** dans tous les cas. Les différences entre « avant » et « après » sont en partie du bruit (l'échelle QL bouge d'elle-même, et la dose 110 n'a pas atterri sur le même palier) : ne pas y lire un gain chiffré, seulement qu'aucune bascule ne compile et que le doublon reset+réglage a disparu.
Les temps d'image du banc sont inutilisables (Mac à charge 300-500) : le coût en ms d'une bascule n'est PAS mesuré.

## Ce qui reste
- Pré-allouer / mettre en cache les cibles du halo et du compositeur par taille, et figer la toile à la résolution maximale (le final en bilinéaire) : refonte de `init.js` (`applyDPR`) et du bloom (`bloomPass.setSize`, `_cRT` dont la texture est posée une fois dans l'ACES). **À ne tenter qu'avec un téléphone et des captures A/B.** Décision d'OPTI ULTIME : pas maintenant.
- Côté gouverneur (vitesse-fluide) : halo en marche/arrêt (arrêt ne réalloue rien), peu de bascules de résolution, hystérésis.
- Le gain GPU p50 de « tout » vs `?img=max` : −21 % au banc (indicatif) ; le critère −30 % n'est atteint que sur les compteurs (pixels −31 %).

## Vérifier sur le 13 Pro
1. Dans la boîte noire, relever `dbgGouvPaliers().bascules` (nombre de bascules) et les instants des changements de palier.
2. Y superposer les gels > 1 s de la course : s'ils tombent sur ces instants, c'est la réallocation à chaud ; sinon l'hypothèse est fausse.
3. `?img=max` et `?gouv=max` donnent l'image et le régime d'avant pour comparer.

## Reprise du 8/11 — « préréglage 13 Pro dès le départ » (OPTI ULTIME)
**Constat : le départ est DÉJÀ allégé.** Sur `TEL_NATIF` palier 2, les leviers a à f sont des budgets statiques lus dès le lancement de la course (plafond 1,25, cran 1, halo ½ à 3 étages, ombre 768, ciel lisse ½, traits ½ au-delà de 200 km/h) ; le gouverneur ne fait que descendre en dessous. Ce n'est donc pas « seulement quand la dose monte » (vérifié dans le code de `perf3-sur-main-2` et `perf3-main` et par `dbgCout` ci-dessous). Les valeurs proposées (plafond 1,5, ombre 1024) sont MOINS sobres que l'actuel. J'ai donc ajouté un troisième réglage pour que Sacha juge :
- `?img=max` : l'image d'avant (plafond 1,5, ombre 1024, halo plein).
- (défaut) : le départ P2 actuel = tous les leviers.
- `?img=13` : le préréglage « doux » = SEUL le halo en demi-résolution (plafond 1,5, ombre 1024, ciel et traits entiers).

Mesure Mac calme (charge 2-4, un Chrome, `?tel=1&palier=2`, iPhone émulé 390×844×3, CPU ×4, nuages/jade/dunes, capture à l'instant `--tot`) :
| réglage | pixels/image | ombre | halo 1er mip | GPU p50 nuages / jade / dunes | moyenne |
|---|---|---|---|---|---|
| `?img=max` | 740 610 | 1024 | 246×532 | 7,29 / 10,98 / 6,60 | 8,29 ms |
| défaut (tout) | 513 785 (−31 %) | 768 | 103×222 | 4,45 / 2,91 / 5,72 | 4,36 ms (−47 %) |
| `?img=13` | 740 610 | 1024 | 123×266 | 5,49 / 6,63 / 6,32 | 6,15 ms (−26 %) |
Les temps ne valent que sur ce Mac (un seul passage chacun) ; les pixels sont exacts. Le gain du défaut dépasse le critère −30 % de P2 sur machine calme.
Captures A/B (même position de route, `--tot`) : `passation/perf-2026-11/captures/p2-depart/{max,tout,13}-{nuages,jade,dunes}-midi.jpg`. Nuages et jade : même instant, seuls les gerbes de particules (aléatoires) diffèrent. Dunes : le moment du jour de la partie est ALÉATOIRE d'une partie à l'autre (matin/soir/nuit/tempête, même avec `meteo=midi`) : `max` et `13` y sont au MATIN, `tout` au SOIR : comparer les formes et la netteté, pas les couleurs.
`dbgRemplissage` (P3) non utilisé : `dbgCout().px` donne les pixels de la toile ; les passes restent 3.
Non fait / non prouvé : l'œil de Sacha reste à consulter (A/B ci-dessus) ; aucun test sur le 13 Pro.
