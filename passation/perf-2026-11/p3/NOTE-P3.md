# P3 — appels de dessin et programmes (7/11/2026) — ÉTAT, session interrompue

Branche `perf3/P3` (worktree `~/cash-car/perf3/wt/P3`), 1 commit local : `4f925889`. Aucun push.

## AVANT (p2 émulé, garde-perf, 1800 m, `avant-p2.json`, `dbgCout` image entière)
nuages 162 appels · dunes 149 · canyon 123 · forêt 149. La caisse seule = 33 appels (dunes jusqu'à 66) : 13 MeshDepth (ombre), 11 Phong, 6 Basic, 3 sprites.
La piste = 15-35 appels (tranches de 1 200 pts × bitume/flancs/rails/nappe/ligne) : déjà optimisée par C3 (culling + LOD par tranche) — la fusionner ferait perdre le tri par le champ de vision, NON touchée.

## FAIT (commit 4f925889)
- `moba-ombre.js` repris de `mobile-perf` (040c8a69) : l'ombre de la caisse en 1-4 appels. Mesuré : dunes 86 → 73 appels, image finale IDENTIQUE (0 pixel) ; canyon/forêt : image identique (l'ombre ne passe pas à l'instant mesuré) ; nuages : le témoin de déterminisme VARIE (nuages animés dans la tâche) → comparaison par `dbgImgDiff` à refaire.
- `jade-eau.js` : 3 InstancedMesh vides mais visibles dans TOUTES les maps (EAUP, EAUB, JEAU) dorment après leur 1re image : −3 appels. Non remesuré (banc privé du verrou). `?dormeur=0` = avant.
- Outils : `dbgAppelsBrut()`, `dbgImgEmpreinte()`, `dbgImgDiff(i,j)` (code/maps/jade-vol.js), `outils/banc-perf/p3-egal.py` (A/B dans une seule tâche JS : `P3_A=… P3_B=… P3_POS=1800,900`), `p3-sonde.py`.
- Piège : un commentaire `/* … */` non fermé dans jade-vol.js avait avalé le code suivant (crochets absents).

## PAS FAIT
- Vérifs banc de l'état commité (nuages A/B au pixel avec `dbgImgDiff`, −3 de dormeEau) : le verrou de banc a été monopolisé des heures par `perf3-batterie` ; load 130-380.
- Candidats restants (sonde nuages/dunes) : fruits (6-8 meshes individuels, matière partagée), 4-8 plans texturés opaques 2 triangles près de la caisse (non identifiés), 4 PointsMaterial, nuages v8 (22 appels, transparents triés) et coton (6-20 instanciés) = hors d'une fusion sûre ; caisse couleur ~24 appels (1 par matière après soudure, pas de fusion sans changer le shader) → 31 → ~21 réaliste, pas 10.
- Programmes (`dbgProgs`) : non commencé.
- Critère −40 % appels / −25 % programmes : NON atteint (mesuré −13 sur dunes, ~−8 %).

## 2e tâche : LE NIVEAU EN TRANCHES (commit 9ddc8168)
Diagnostic (`dbgChamp`, p2 émulé, `champ-p2.json`) : triangles dessinés / dans le champ = nuages 92-76 %, dunes 82-86 %, canyon 50-87 %, forêt 70-90 %, grotte 56-98 %. Le seul gros gaspillage structurel = `canyon décor` (peupliers + cheminées en InstancedMesh `frustumCulled=false` sur toute la piste : 164 k triangles dessinés pour 8 k dans le champ). La forêt fenêtre déjà ses `count` à chaque image ; les rubans de piste sont déjà en tranches (C3).
Remède : `instSegmente()` (code/maps/instances-segments.js) → cellules 3D de 800 m, géométrie proxy qui partage les tampons. Canyon p2 : triangles 405k→265k (−35 %), 338k→182k (−46 %), 426k→297k (−30 %), appels ≈ +3 ; image identique (0 px, `p3-egal.py`, A = `dbgSegments(false)`). `?segments=0` = avant.
Pas fait / à voir :
- Déchargement (dispose) des segments > 600 m DERRIÈRE la caisse : le demi-tour (demi-tour.js) ne pivote que la caisse, le monde ne se retourne pas, et la caméra ne regarde jamais en arrière → rien à gagner au rendu (le culling suffit), seulement de la mémoire : à coordonner avec perf3-p1 (non fait).
- ⚠ Au banc, `canyon décor` (164 k triangles) est encore DESSINÉ DANS LA GROTTE (carte enchaînée canyon → forêt → grotte par portails dbgClassique) : fuite de décor d'une map à la suivante ? à vérifier dans le jeu (cyLiberer / cyEteindre n'est appelé que par cyBatitG).
- Pièces 1 €/2 € : InstancedMesh dont 25-75 % des instances sont hors champ (12-36 k triangles dessinés) ; plaques turbo (8 plans) et fruits de la file : meshes individuels ajoutés au vol (ligne-parfaite.js:173, deux faces chacun) = ~8-14 appels : instanciation dynamique possible, non faite.
- Les 8 « plans gris » = les plaques turbo (PlaneGeometry 8×13, texture 128×256, `padGeo`/`PAD_MAT`, 2 faces par plaque), dans le champ : pas gratuits.

## 3e tâche : LE NIVEAU DERRIÈRE LE JOUEUR — mesure (7/11, `vitesse-avant.json`, `vitesse-distance.json`, `p3-vitesse.py`)
?tel=1 p2, voiture lancée (nitro) aux paliers moteur 4/10/13/16. Triangles de la scène : DERRIÈRE la caméra 4-12 %, au-delà du brouillard réel (nuages 5 600 m, canyon 6 500, forêt 2 700) ≈ 0,8 k. Répartition DANS le champ par distance (0-500 · 500-1 000 · 1-2 k · 2-3,5 k · 3,5 k+) :
canyon p10 211k·33k·4k·0·0 · forêt p10 455k·51k·33k·5k·0 · nuages p10 230k·139k·102k·0·0.
→ plus de 80 % des triangles sont à moins de 500 m de la caméra ; plus vite = MOINS de triangles par image (canyon 632k p4 → 408k p10), pas plus. Ni supprimer l'arrière (≤ 12 %) ni plafonner la distance (rien au-delà de 2 km) n'expliquent « saccadé à partir du palier 10 » : le coût à grande vitesse est du CPU (fenêtres d'instances, envois de tampons, pré-bâti, ramasse-miettes), pas du volume de dessin. Leviers (a)/(b) NON codés (gain ≤ 10 %).
⚠ Nuages p16 : la caisse dépasse le contenu (vH 700-930) — lecture non représentative.

## Passe d'OMBRE seule (`dbgOmbre`, `vitesse-ombre.json`) — rien à gagner
?tel=1 p2, paliers 4/10/13, nuages/canyon/forêt : la passe d'ombre = 4 appels, 6 164 triangles (14 appels / 6 388 au p13 avec les pièces d'essieu), TOUS à moins de 50 m de la caisse (0 maillage à 50-150, 150-500, 500+) : la caméra d'ombre ortho ±34 m + le mandataire d'ombre de la caisse (moba-ombre) font déjà le travail. < 1 % de la scène. Le « ×1,8 de l'image entière » était du bruit de lecture : nuages image 692k ≈ scène 697k ; canyon 636k/447k/438k pour 474k/284k/267k (pièces et fenêtres d'instances qui varient d'une lecture à l'autre). La passe halo ne relit pas la géométrie : son coût est celui des passes plein écran (13 cibles distinctes par image au p2 contre 2 au p0, PASSES.md C4), pas des triangles.
Plafond de distance (b') : l'histogramme (> 80 % des triangles à < 500 m, ≈ 0 au-delà de 2 km) ne laisse rien à couper à 2 500-3 500 m ; un plafond ≤ 1 000 m changerait l'ambiance (brouillard de 5,6 km → 1 km) : non codé, en attente d'un feu vert.

## Remplissage par image (`dbgRemplissage`, `remplissage-pal{0,1,2}.json`, `remplissage-p10.json`) — nuages p10, ?tel=1, SANS les leviers de perf3/P2
Écran 585×1266 (0,74 Mpx) au palier 2 (526×1139 au p1, 487×1055 au p0 : le DPR adaptatif baisse). Passes (en écrans) :
- p2 : scène 1,00 · ciel lisse 293×633 0,25 · halo 246×532 ×3 (0,18) + 123×266 ×2 (0,04) + 62×133 ×2 (0,01) + 31×67 ×2 (0) · écran final 1,00 · ombre 1024² = 1,42 (profondeur seule) → ≈ 4,3 écrans / 12 passes + ombre.
- p1 : mêmes passes (4 étages de halo au lieu de 5 : postBloomMips=[3,4,5]) ≈ 4,5 écrans.
- p0 : scène 1,00 · ciel lisse 0,25 · écran 1,00 · ombre 1024² = 2,04 → 3 passes, ≈ 4,3 écrans (l'ombre pèse plus car l'écran est plus petit).
→ En PIXELS le halo ne vaut que ≈ 0,9 écran et ses mips < 0,04 : le surcoût du p2 (13 cibles contre 3) est le NOMBRE DE PASSES, pas les pixels (fin de passe de tuile à chaque changement de cible).
- Transparents (estimation : aire des triangles projetés, plafonnée à un écran) au canyon p10 ≈ 11 écrans (rails néon + nappe + ligne centrale ≈ 2 chacun, traînées, streaks) ; au nuages p0 ≈ 9 écrans (nuages v8 ≈ 2,2). C'est le vrai remplissage. ⚠ nuages/forêt p2 : le crochet ne voit pas les appels de la passe scène du compositeur (0 appel) → pas d'estimation à ce palier.
- Doublon : perf3/P2 contient déjà halo 3 étages + demi-résolution, ciel lisse 1/2, ombre 768, plafond NETTE, stries/traînées demi-densité, qlAuto, imgRegle. Rien recodé ici.
