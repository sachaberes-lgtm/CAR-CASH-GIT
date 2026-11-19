# Lot « jsimage » — moins de JS par image, rien de changé à l'écran (16/11)

Branche `qa/jsimage` (worktree clairsemé `~/cash-car/qualite-jsimage`), depuis `qualite-appareil` 7a3cc3b0a. Interrupteur : `?sans=jsimage` = exactement l'avant.

## Pourquoi
Build 118, 25 min de jeu : le fil principal ralentit ×8 par paquets (téléphone chaud). Chaque ms de JS par image en coûte alors huit.

## Ce qui a été mesuré d'abord (Chrome déguisé en 13 Pro, ?tel=1 donc TEL_NATIF, processeur ×6)
- **Les lectures de mise en page ne sont PAS forcées.** getComputedStyle (≈ 1,5 par image) et getBoundingClientRect viennent de `hudColMesure`
  (interface/passe-textes.js), qui tourne dans le rappel du ResizeObserver, APRÈS la mise en page (voir `apresMiseEnPage`). Temps propre de toutes
  ces lectures : ≈ 0,03 ms par image à ×6. Rien à gagner : pas touché.
- **HUD_DORT** : scanne au plus une fois par seconde (0,064 ms/image à ×6). Pas touché.
- **Écritures sans effet** (--nx, --f, toggle…) : la plupart déjà derrière une clé (flowHudMaj ne tourne qu'au changement de clé, 0,5 fois par image).
  Une écriture identique n'invalide rien dans WebKit ni Chrome : le gain ne serait que l'appel. Pas touché, sauf le volant (touchmove).
- **La flamme du pouce sous le HUD calme** : déjà coupée depuis le 13/11 (`NX3.calmeOff`, bouton-nitro-gains.js:117). Rien à gagner là.
- **Le plus gros poste du HUD (b6) est la flamme du pouce, VISIBLE** : `nx3Tick` 2,2 ms/image à ×6, dont `nxfDessine` ≈ 1,5.

## Ce qui a changé
1. `nxfDessine` (interface/boost-icones.js) — mêmes octets, moins de calcul :
   - chaque langue a sa boîte (G.TB) là où elle peut donner qk > −0,2 ; une ligne n'essaie que les langues qui la touchent, sur leur seule largeur ;
   - la calotte ne calcule plus atan2 + deux sinus quand r > 1,35·r0 (qk < −0,2 sûr).
   - Pourquoi c'est exact : une case ne peint que si q + bruit > 0, et le bruit vaut au plus +0,169 ; q ≤ −0,2 ne peint jamais.
2. `stSet` (moteur/mobile-tactile.js, à chaque touchmove) : la transformation du bouton et --sl/--sr/--su/--sd ne s'écrivent que si la chaîne change
   (seul stSet écrit ces cinq-là).
3. `JSI` (moteur/cadence.js) : l'interrupteur. `dbgJsImage()` (rendu/ciel2.js) et `dbgNxfDouble()` (boost-icones.js) : crochets de banc.

## Preuves
- `node outils/banc-jsimage/flamme.cjs` : chaque dessin fait deux fois sur le même état (avant / lot), comparé (toile u32, grille B, rc, Lc, putImageData).
  nuages portrait : 250 dessins, 0 écart, 2,30 → 1,71 ms/dessin (−26 %) · canyon paysage : 233, 0 écart, 2,31 → 1,69 (−27 %) ·
  jade portrait nitro 1 : 293, 0 écart, 2,24 → 1,69 (−25 %). (×6, charge 2,7-4,4.)
- `node outils/banc-jsimage/volant.cjs [--paysage 1]` : 242 événements, style du volant identique à chaque événement (portrait et paysage) ;
  setProperty pendant les touchmove 1136 → 426 (portrait), 1135 → 431 (paysage).
- `node outils/banc-jsimage/profil.cjs --qs sans=jsimage` contre sans argument, deux fois chacun (course réelle, bruitée) :
  nx3Tick 2,18 / 2,20 → 1,69 / 1,87 ms par image ; b6 3,78 / 3,98 → 2,89 / 3,48 ms.

## NON prouvé / pas fait
- La preuve « DOM du HUD identique image par image sur 600 images dbgStep » n'a pas été faite : aucune écriture DOM de la boucle n'a changé ;
  les deux sorties touchées (toile de la flamme, style du volant) sont comparées directement.
- Pas de mesure sur le 13 Pro. Allocations (≈ 250 ko/image : nfeuPas, itérateurs, nombres en boîte) : pas traitées (code de rendu créatif, gain incertain).
- b4 : rien de retiré (le vent, le feu des pots, les pièces sont visibles).

## Sur le 13 Pro
Gain attendu ≈ 0,07 ms par image à froid sur la flamme, ≈ 0,5 ms sous le bridage ×8. Regarder : la flamme du pouce (doit être la même), le volant.
