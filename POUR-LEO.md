# Pour Léo — deux gels mesurés dans ta zone (voitures, boutique) — 14/10, mesures de la session OPTIMISATION

Personne n'a touché à ton code : la boutique 3D et les voitures sont restées « gelées » pour toutes les sessions pendant que tu poussais.

## 1. LE DOGE fige l'iPhone 3 à 4 secondes à sa première construction
- `dogeTete` (appelée par `SHAPES.doge`) : ~1,0 s de processeur sur le Mac (≈ 450 000 évaluations du champ de distance + couleurs moyennées
  sur 7 prises pour ~19 000 sommets) → ~3-4 s d'image figée sur iPhone 7, une fois par partie : au garage en feuilletant jusqu'à lui, en
  boutique, ou au départ s'il est équipé. La chauffer au menu ne ferait que déplacer les 4 s.
- Piste : `dogeQueue` existe déjà mais n'est appelée nulle part → étaler le calcul sur plusieurs images ; ou le faire dans un Worker
  (THREE.Color r128 = hex/255, reproductible) ; ou précalculer la tête une fois et la garder.

## 2. Ouvrir la BOUTIQUE gèle une image de ~400 ms (iPhone 7 émulé)
- `shopPhotoTour` (un setTimeout) fait les photos des caisses d'un coup : 8 `toDataURL` = 164 ms, 8 `readPixels` = 66 ms,
  `putImageData` 26 ms, plus 4 programmes compilés à l'ouverture. Mesures : `perf/mesures/v14.json`.
- Piste : une photo par image (file d'attente), `toBlob` asynchrone au lieu de `toDataURL`, garder les photos en cache d'une ouverture à l'autre.
