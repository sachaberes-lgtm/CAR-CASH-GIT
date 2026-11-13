# FINITION iPhone — la voiture et les traînées (13/11 au soir)

Demande de Sacha : « augmente les graphismes des traînées et de la voiture. Le reste, ce n'est pas grave si c'est moins beau sur un mauvais
téléphone, mais les traînées et la voiture, ça doit être PARFAIT. » Garde-fou de la nuit : la fluidité d'abord.

Branche `fin/gfx` (chantier `~/cash-car/finition-gfx`, partie de `ios-finition`). `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS commités
(l'intégrateur réassemble : `node code/assembler.cjs --depuis-morceaux`).

## 1. État des lieux : ce que la voiture et les traînées perdent sur téléphone

Relevé au banc (`outils/banc-finition/gfx.cjs` : Chrome sans fenêtre, iPhone 13 Pro émulé 844×390 / 390×844, DPR 3, tactile, `?tel=1&garde=1`,
boucle menée à la main à 33 ms) et à la lecture du code.

| Sujet | Ordinateur | Téléphone récent, froid | Téléphone chaud (gouverneur) |
|---|---|---|---|
| Résolution de la 3D | celle de l'écran | plafond 1,25 sur un écran ×3 : toile 1055×487 pour 2532×1170 (17 % des pixels, agrandie ×2,4) | « serious » : échelle QL au cran maximal, DPR 1,0 mesuré (390×844) ; sérieux qui dure : plafond 1,1 ; critique ou serious branché : 0,85 (toile 331×717, agrandie ×3,5) |
| Anticrénelage | FXAA de la passe finale | FXAA + piqué… **mais absents dès que le flou de vitesse joue** (boost, nitro) : la caisse recevait 6 prises identiques, donc des marches de 2-3 px d'écran | flou radial coupé au cran maximal : FXAA partout |
| Halo (bloom) | plein, 5 étages | ½ résolution, 3 étages | 2 étages (fair) puis coupé (serious et plus) |
| Ombre portée | 1280 | 768 | 512 |
| Caisse du joueur (modèle, matières, vernis, cube de reflets 64², liseré, feux) | — | **identique** : aucun LOD, aucun allègement dans `code/voitures/` | identique |
| Rubans de lumière des feux (`SILS`) | un point tous les 0,6 m, 45 par seconde au plus, 2 rangées entre deux points | même géométrie mais **un point par image à 30 i/s** : 1,4 m à 150 km/h, 4,6 m à 500, 8,3 m à 900 ; toujours 2 rangées, donc des segments droits de 2 à 4 m | idem |
| Traînées POP (`TRX`, dix traînées de la boutique) | émission pleine | **demi-densité au-delà de 200 km/h** (levier e de la passe 3, `imgDensVit`) : au nitro la traînée achetée n'a que la moitié de ses objets (53 pétales en vie au lieu de 108, 50 filés au lieu de 100, mesuré) | demi-densité aussi (`imgRegle({stries:.5})`) |
| Feu de pixels du nitro (`NFEU`) | plein | plein | ×0,6 (`MOBH_R.feu`, régime chaud) |
| Flammes des pots, jet du vol, jet des figures (`emiN`) | plein | plein (palier récent ; .8 moyen, .6 ancien) | ×0,5 (`emiK` écrit par le gouverneur, palier 2 et plus) |
| Flou radial | 8 prises + aberration | 6 prises pré-floutées | coupé |
| Précision des shaders | highp | highp (mediump seulement à la demande `?imgplus=g`) | idem |

Ce qui ne peut pas remonter sans coût (et n'a pas été touché) : la résolution de la toile, le halo, la taille de la carte d'ombre.
La silhouette de la caisse à DPR 0,85 reste molle : elle est faite de pixels de 3,5 px d'écran, seul un rendu plus fin la rendrait
nette, donc une cible ou une passe de plus (hors budget). Photo : `photos/gfx-etat-des-lieux-debout-chaud4.jpg`.

## 2. Les lots livrés

### Lot 1 · LA CAISSE NETTE AU NITRO — `?sans=netnitro`
- **Quoi** : dans la passe finale, le choix « flou de vitesse ou anticrénelage » se fait par pixel au lieu de par image. Là où le filé du
  flou couvre moins d'un demi-texel (le disque de la caisse, la tête des traînées, la route juste devant), le pixel repasse par le FXAA
  et le piqué, comme en croisière. Ailleurs : le flou d'avant, au bit près.
- **Fichier** : `code/rendu/triptyque-bloom.js` (bloc `NET_NITRO`, posé après `flouFS`). Téléphone (`ALLEGE`) + WebGL2 seulement : l'ordinateur
  ne change pas d'un pixel. Les lignes de `FLOU_R` ne sont pas modifiées (`dbgFlou` bascule toujours).
- **Coût** : aucune passe, aucune cible, aucun appel de dessin ; dans le disque net 5 lectures au lieu de 6 (+4 sur les seuls pixels de bord).
  Non chronométré à part (Mac à charge 80-240) : par construction, pas plus de lectures qu'avant.
- **Vérifié à l'image** : oui, sur la MÊME image (bascule `dbgGfxFin(0|1)` du banc, `--ab 1`) : `photos/gfx-netnitro-meme-image-avant-apres.jpg`
  (gauche = avant : marches sur la caisse, l'anneau, la ligne blanche ; droite = après). Aussi `photos/gfx-avant-couche-nuages-zoom.jpg` /
  `gfx-apres-couche-nuages-zoom.jpg`.

### Lot 2 · LE RUBAN LISSE À TOUTE VITESSE — `?sans=rubanfin`
- **Quoi** : la courbe des rubans de lumière est découpée selon la DISTANCE (une rangée tous les 1,1 m au plus, 8 par intervalle au plus) au
  lieu de 2 rangées par intervalle. Même tampon (`SIL_ROWS`, jamais dépassé). Sous 2,2 m entre deux points : identique au bit près.
- **Fichier** : `code/voitures/atchoum-feu.js` (`SIL_FIN`, dans `sillageStep`). Vaut aussi pour l'ordinateur (au-delà de ~350 km/h seulement) :
  en mieux, même budget.
- **Coût** : des rangées de calcul en plus seulement à grande vitesse, au plus ce que le ruban coûte déjà à basse vitesse (le pire cas
  d'avant). Aucun appel de dessin.
- **Vérifié à l'image** : partiellement. Les rubans s'affichent proprement à 450 km/h sur nuages et jade (`photos/gfx-apres-couche-nuages-jeu.jpg`,
  `gfx-apres-couche-jade-jeu.jpg`), sans erreur. **Pas de photo avant/après qui isole les facettes** (il faudrait une vrille à 900 km/h au
  même instant) : le gain est établi par le calcul, pas par l'œil.

### Lot 3 · LES FLAMMES ET LES TRAÎNÉES HORS DU GOUVERNEUR DE CHALEUR — `?sans=feuplein`
- **Quoi** : les traînées POP gardent la densité de l'ordinateur (plus de demi-densité au-delà de 200 km/h, ni à chaud) ; le feu de pixels du
  nitro garde sa densité à chaud (plus de ×0,6) ; les flammes des pots, le jet du vol et le jet des figures gardent l'émission du palier de
  l'appareil (plus de ×0,5 du gouverneur). Les traits d'air, la fumée de drift, le vent, le halo et la résolution restent pilotés par la chaleur.
- **Fichiers** : `code/rendu/stries-vent.js` (`GFX_PLEIN`, `EMI_K0`, `emiK0()`, 3e argument de `emiN`), `code/rendu/trainees-2.js`,
  `code/voitures/nitro-feu.js`, `code/moteur/boucle-3-physique.js` (`'fl'`, `'jet'`), `code/gameplay/figures-physique.js` (`'figJet'`).
  L'ordinateur est inchangé (ces réductions n'y existaient pas).
- **Coût mesuré** (Mac saturé, donc indicatif) : SAKURA 53 → 108 pétales en vie (159 → 309 cubes instanciés), HYPERESPACE 50 → 100 filés
  (114 → 226 quads) ; `dbgTrx().ms` 0,11-0,14 → 0,14-0,16 ms. Appels de dessin : les mêmes maillages instanciés (aucun de plus).
  ⚠ C'est le seul lot qui AJOUTE du remplissage sur un téléphone chaud : à surveiller sur le 13 Pro, et à couper (`?sans=feuplein`) si la
  cadence en souffre.
- **Vérifié à l'image** : oui pour les traînées POP — `photos/gfx-feuplein-sakura-chaud2-debout-avant-apres.jpg` (téléphone chaud, debout, même
  instant) et `photos/gfx-feuplein-jade-hyper-couche-avant-apres.jpg`. **Non vérifié à l'image** : le feu du nitro et les flammes des pots à
  chaud (pas de photo qui les isole).

## 3. Le banc
`node outils/banc-finition/gfx.cjs --out <dossier> --tag avant|apres [--fmt couche|debout] [--carte nuages|jade] [--meteo midi]
[--q "sans=netnitro,rubanfin,feuplein"] [--trx aucune,grille,sakura…] [--chaud 2|3|4] [--pas 300] [--mesure 1] [--ab 1] [--js "dbgQual(1);1"]`
- Un seul Chrome, fermé à la fin. Sauvegarde muette. Ports 9851 / 9852.
- ⚠ La boucle saute une image appelée moins de 33 ms après la précédente (`cadSaute`) : le banc fait un pas toutes les 36 ms. `dbgStep(30)`
  d'un coup ne fait qu'UNE image.
- ⚠ Sur Mac saturé l'échelle QL monte seule et coupe le flou radial : `--js "dbgQual(1);1"` la fige (pas avec `--chaud`).
- `dbgNitro(9,0)` remet la jauge à chaque seconde (sinon les traînées s'éteignent).
- `dbgGfxFin()` : quels lots sont posés ; `dbgGfxFin(0|1)` : le lot 1 coupé / remis sur la même image (une recompilation, banc seulement).

## 4. Vérifications faites
- `node code/assembler.cjs --depuis-morceaux` : passe.
- Course lancée sur NUAGES (couché, debout, froid, chaud 2) et sur JADE (couché) : aucune exception, aucune erreur console, aucune « panne »
  dans la boîte noire (les « gel » / « serpent » de l'historique viennent du Mac saturé).

## 5. Non vérifié, et à juger sur le vrai iPhone 13 Pro
1. Lot 1 : la caisse au nitro, de près — plus de marches d'escalier ; vérifier qu'on ne voit pas d'anneau à la frontière du flou.
2. Lot 3 : la cadence à chaud (téléphone branché, « serious ») avec une traînée POP dense (SAKURA, POUDRE D'OR, HYPERESPACE) au nitro.
3. Lot 2 : les rubans dans une vrille ou un virage serré à très grande vitesse (pas de cassures).
4. Aucun chronométrage fiable n'a pu être fait (charge du Mac 80 à 240 pendant toute la passe).
5. Non traité : la netteté de la silhouette à DPR 0,85 / 1,0 (demande une passe ou une cible, hors budget), le halo coupé à chaud (les
   rubans gardent leur propre halo, les feux le perdent), le portrait/paysage de la caméra (en paysage la traînée sort vite par le bas de l'écran).
