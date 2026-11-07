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
