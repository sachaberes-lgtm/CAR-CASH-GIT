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
