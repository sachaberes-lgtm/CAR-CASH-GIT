# P2 — l'image adaptée sur téléphone récent (07/11/2026, branche perf3/P2)

Captures `max-<map>.jpg` = AVANT (`?img=max`, tout comme avant) · `<a..f>-<map>.jpg` = un seul levier · `tout-<map>.jpg` = tous les leviers (le défaut sur un vrai téléphone p2).
iPhone émulé 390×844×3, `?garde=1&palier=2&pistegraine=777`, 1 800 m + 80 m de route, CPU ×4. Banc : `outils/banc-perf/p2-image.py`.

## Ce que ces chiffres valent (à lire d'abord)
- **Compteurs (pixels, taille de l'ombre, taille du halo, passes, appels)** : exacts, ils ne dépendent pas de la charge.
- **Millisecondes GPU** : INDICATIVES. Le Mac était saturé par d'autres sessions (charge 40 → 380) et la puce GPU du banc est celle du Mac, pas du 13 Pro. Médiane de 1 à 3 passages par case, dispersion ±30 %. Ne pas en tirer un chiffre fin.
- **Captures** : même graine, même position de route, mais PAS la même image exacte (vitesse, heure du ciel, objets ramassés diffèrent d'un passage à l'autre : on le voit entre `max-dunes` en nuit bleue et `tout-dunes` au couchant). Elles montrent le rendu, pas un différentiel au pixel.
- Ordinateur (`!TEL_NATIF`) : le code lit `PAL.imgOn(l)` qui vaut FAUX hors `TEL_NATIF` → toutes les valeurs retombent sur l'ancien comportement. Preuve par les compteurs `--ordi` : voir « Non prouvé ».

## Tableau levier × coût GPU × coût à l'œil (du moins visible au plus visible)
Les colonnes « coût à l'œil » sont déduites de ce que fait chaque levier dans le code et des captures ci-dessous ; elles n'ont PAS été jugées sur des paires d'images identiques (voir plus haut) : c'est à Sacha de trancher sur le téléphone.
GPU = gain de `gpu p50` moyen sur 4 maps vs `?img=max` (négatif = plus rapide), compteurs exacts entre parenthèses.

| Levier | Budget `PAL.B` | GPU p50 (indicatif) | Coût à l'œil |
|---|---|---|---|
| (d) passe lisse du ciel une image sur deux | `imgCielImg` | −9 % (ciel lisse ½) | Quasi invisible : le dégradé du ciel se rafraîchit à 30 i/s ; léger retard des nuages sur un virage très vif. |
| (e) stries de vent + traînées ½ densité > 200 km/h | `imgDensVit` | −5 % | Moins de traits d'air et de gouttes de traînée à très grande vitesse ; la traînée reste continue (émission fractionnaire). |
| (f) QL plus réactif (p75 > 19 ms au lieu de 24) | `imgQlP75` | ~0 quand ça tient (+10 % mesuré = bruit) | Ne change rien tant que la fluidité tient ; descend d'un cran QL plus tôt quand ça rame. |
| (b) ombre 1024 → 768 + PCF simple | `imgOmbre`, `imgOmbreDouce` | −3 % | Bord d'ombre de la caisse un peu plus dur/crénelé de près ; ombres lointaines plus floues. |
| (a) halo : entrée demi-résolution + 3 mips au lieu de 4 | `imgBloomRes`, `imgBloomMips` | −16 % (halo 246×532 → 123×266) | Halo plus doux et plus large, les pièces/néons brillent un peu moins « net » ; la lueur ne change pas de couleur. |
| (c) résolution interne plafonnée à 1,25 + QL cran 1 au départ | `imgDprCap`, `imgQlDepart` | −9 % (pixels 740 610 → 513 785, −31 %) | Le plus visible : image un peu plus molle (bords, texte du décor), nuages en coton moins denses au cran 1. Le HUD reste net. |
| **Tout** | — | **−21 %** (médiane des passages) | Image plus sobre mais même DA ; couleurs et lumières inchangées. |

Critère « gpu p50 −30 % » : **non atteint en millisecondes sur ce banc** (−21 %, bruit ±10 points) ; atteint sur les compteurs (pixels −31 %, halo −75 % de pixels, ombre −44 % de texels). Sur un vrai 13 Pro le gain dépend du goulot (remplissage → proche des pixels, sommets → moins).

## Réglage à chaud — `imgRegle`
`imgRegle({halo:'off'|'demi'|'tout', mips:3..4, ombre:512|768|1024, dpr:1..1.5, ciel:0|1|2, stries:0..1})` ; `imgRegle('reset')` revient à l'état de départ ; sans argument il relit l'état. Aucun programme recompilé (compteur `linkProgram` 210 → 210 au banc). Coût à chaud (durée d'appel, pire image) : mesure lancée (`--bascule`) mais **non terminée** (machine saturée) → à refaire sur une machine libre.

## Non prouvé
- Rien sur un vrai téléphone ni en régime thermique (le plan de P2 visait un 13 Pro).
- Pixel-identique ordinateur : par construction (le code lit `PAL.imgOn`, faux hors `TEL_NATIF`) ; la comparaison `--ordi` par défaut contre `&img=max` (compteurs) a été lancée mais n'a pas abouti avant la saturation de la machine.
- Coût de bascule à chaud (4 ms visés) : non mesuré.
- Levier (f) raisonné seulement : le gain n'apparaît que quand la fluidité rame.
- Écart au brief : « p75 > 19 → 16,7 » vit dans `cadence.js` (non touché) ; j'ai baissé le seuil p75 de `qlAuto`/`boucle-1.js` (24 → 19 ms) sous `imgQlP75`.
