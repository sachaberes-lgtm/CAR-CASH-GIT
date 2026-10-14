# NOTES — courbe-noirs (passe graphismes, 14/10, 5 h 30) — la courbe de ton commune

Branche `gfx/courbe-noirs`. ÉTEINTE par défaut (Sacha 5 h 45 : « plus aucun changement global sans planche validée »).
Allumer : `?courbe=2` dans l'adresse (iPhone de Sacha) · `dbgGfx({courbe:1})` à chaud · `dbgGfx({pied:2|2.5|3})` règle le pied.

## LA COURBE
- AVANT (téléphone) : `c = max(c·k + .5(1−k), 0)` → sat → split (+uSh, plancher sarcelle) → grade figé `max(1,12c − ,12L)` puis `max(1,0185c − ,02425, 0)`.
  Seuil de noir pur (scène) : x0 = (,5k − ,5 + ,0238)/k → 17/255 à con 1,1 · 30 à 1,25 · 41 à 1,4 · 47 à 1,5.
- APRÈS : droite k' = 1,0185k, b' = 1,0185·,5(1−k) − ,02425 (le grade replié, mêmes mi-tons/lumières que l'ancienne au bit près) ;
  sous x1 = m·x0 (m = `POST_PIED` 2,5) un PIED quadratique `c·(s0 + a·c)`, s0 = k'(1 − 2/m), a = k'/(m²x0) — C1 au raccord, 0 en 0.
  Sat : `DA.sat` ×1,12 (1,2096) quand la v2 est allumée — la ligne GLSL du grade disparaît, le filtre CSS de l'ordi aussi (`body.post`).
  Split des ombres × min(L·12,5, 1) : éteint sous L ≈ ,08.
- Coût : identique (une sélection au lieu d'un max ; la ligne du grade en moins). Même programme pour tous les paliers ; la bascule
  à chaud recompile la passe finale (banc / essai seulement, jamais en course : `COURBE_V2` est lu au chargement).

## TABLE (simulation courbe.cjs, valeurs 0-255 en sortie, scène → écran, con total k)
| scène | k1,25 avant | k1,25 m2,5 | k1,4 avant | k1,4 m2,5 |
|---|---|---|---|---|
| 8 | 0 | 2,5 | 0 | 2,6 |
| 16 | 0 | 5,8 | 0 | 6,0 |
| 24 | 0 | 10,0 | 0 | 10,1 |
| 32 | 2,1 | 15,0 | 0 | 14,9 |
| 48 | 22,5 | 27,7 | 10,3 | 26,6 |
| 64 | 42,8 | 43,8 | 33,1 | 41,2 |
| 96+ | = | = | = | ≈ (+0,2) |

## MESURÉ (banc `banc/courbe-noirs/ab.cjs`, une ouverture, ?palier=2, cran FULL DPR 2, image figée, la toile 3D relue sans HUD)
Planche : `shots/courbe-noirs/planche.png` (AVANT v1 | APRÈS pied 2,5) ; `variantes.png` (v1 · pied 2 · 2,5 · 3) ; chiffres : `ab-mesures.json`.
| couple (con) | moyenne v1 → p2,5 → p3 | p5 v1 → p2,5 | noir pur (≤2/255) v1 → p2,5 → p3 | ombres (L<40) | mi-tons/lumières |
|---|---|---|---|---|---|
| ville midi (1,29) | 141,9 → 140,8 → 141,9 | 90,2 → 89,1 | 0 → 0 → 0 | — | −1,1 (tache du flou, voir doutes) |
| ville nuit (1,14) | 29,8 → 31,3 → 31,8 | 0,1 → 0,2 | 17,5 % → 5,9 % → 1,5 % | +2,3 | −0,03 |
| nuages midi (1,25) | 146,6 → 147,0 → 147,0 | 84,3 → 85,1 | 0 → 0 → 0 | — | +0,3 |
| nuages soir (1,25) | 149,0 → 149,4 → 149,4 | 107,7 → 108,8 | 0 → 0 → 0 | +8,1 | +0,4 |
| jade midi (1,10) | 131,7 → 132,0 → 132,1 | 26,2 → 27,8 | 0 → 0 → 0 | +1,4 | +0,2 |
| orbite midi (1,25) | 47,7 → 49,7 → 50,1 | 0,1 → 0 | 28,2 % → 24,0 % → 23,5 % | +2,9 | +0,9 |
Teinte moyenne : RGB à ±2/255 partout. Le noir de l'espace et du ciel de nuit reste du vrai noir (p5 ≈ 0).

## VU
À l'œil, à la taille de la planche, AVANT et APRÈS sont presque indiscernables : l'étalonnage de la nuit est conservé. Le gain est
dans les 0-40/255 : la nuit de la ville perd l'essentiel de ses aplats noirs (route lointaine, pieds des tours), l'ombre de la caisse en
orbite et les flancs de jade gardent un dégradé. Ce n'est PAS un « éclaircissement » : les mi-tons ne bougent pas.

## DOUTES
- ville midi, variante 2,5 : une tache SOMBRE à gauche (le flou de vitesse d'une tour) qui n'apparaît ni en v1 ni en pied 2 ni en 3 —
  un rendu figé non reproductible (halo composé / flou rejoué), pas la courbe (le pied ne touche que < x1). À revérifier sur iPhone.
- Le pied ouvre peu parce que la plupart des pixels sombres sont du VRAI noir (ciel, espace). Les « trous noirs » de Sacha dans les
  ombres de jour sont peut-être ailleurs (halo, vignette, ombres portées très denses) : à vérifier sur ses captures.
- Pied 3 = noirs encore plus ouverts (ville nuit 1,5 % de noir pur) pour +0,5/255 de moyenne : `dbgGfx({pied:3})` / `POST_PIED`.

## POUR LES AUTRES
- Équipes d'ambiance : rien à refaire si la v2 est allumée (expo/teinte ±1-2/255). Seules les ambiances qui ont REMONTÉ leur expo pour
  sortir du noir (nuits, orage, minuit) peuvent redescendre d'un cran. La saturation commune se lit désormais sur DA.sat (×1,12 inclus).
- INTERFACE : `body.post>canvas{filter:none}` vaut aussi pour l'ordi quand la v2 est allumée (CSS non touché).
