# FINITION iPhone — la caisse du joueur plus NETTE (13/11, nuit)

Demande de Sacha : « la voiture EN JEU pourrait être plus belle et plus NETTE » (la caisse en course, caméra derrière elle).
Branche `fin/caisse` (chantier `~/cash-car/finition-caisse`, partie de `ios-finition`). `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS commités
(l'intégrateur réassemble : `node code/assembler.cjs --depuis-morceaux`, puis `cashcar-vNNN` +1).

## 1. Ce qui rendait la caisse molle (vu sur les zooms, pixels d'écran)
Ni le modèle ni les matières : l'AGRANDISSEMENT. La 3D est calculée à 1055×487 (DPR 1,25, à froid) et c'est le navigateur qui l'étire ×2,4 en bilinéaire
sur les 2532×1170 de l'écran. Une arête de cube devient une rampe de 3 à 5 pixels d'écran ; le FXAA en amont l'adoucit encore d'un texel.
La caisse ne fait que ~110 points de large (13 % de l'écran couché) : ~140 texels de scène.
Repère : la même image rendue entièrement à ×3 (`dbgDPR(3)`, colonne « repère » des planches) — 5,8 fois plus de pixels de scène, hors de portée.

## 2. Les options comparées (même image, `outils/banc-finition/caisse.cjs`)
| Option | Image | Coût | Verdict |
|---|---|---|---|
| Piqué plus fort dans le disque, toile inchangée | les rampes restent (c'est le navigateur qui les fabrique après nous) | nul | ne règle pas la silhouette |
| DPR de toute la toile 1,25 → 1,5 | un peu mieux partout, agrandissement encore ×2 | +44 % de pixels de scène (513 000 → 740 000), chauffe | trop cher pour le gain |
| **LA LOUPE** : toile à la taille de l'écran, scène inchangée, reconstruction le long des arêtes dans le disque de la caisse | silhouette et arêtes au pixel d'écran, proche du repère ; les détails plus fins qu'un texel (lettres de la plaque, grille de calandre) ne reviennent pas | une passe de recopie | **retenue** |
| Re-rendre la zone de la caisse à ×2-3 (toute la scène dans un petit cadre) | le repère, plaque lisible | toute la scène soumise une 2e fois (appels de dessin, tri, particules), +16 à +37 % de pixels de scène | hors budget (≈ 1 ms) : non fait |
| Re-rendre la caisse SEULE à ×3 et la recoller | flammes, traînées, pièces, auras passent DEVANT la caisse : le recollage les efface ou laisse des franges | faible | écartée (image fausse) |

## 3. Le lot livré · LA LOUPE — `?sans=loupe`
- **Quoi** : en course, téléphone récent et froid, la toile prend la taille de l'écran (×3). La scène, le halo et l'étalonnage restent calculés à la
  résolution d'avant (curDPR / échelle QL) ; l'étalonnage écrit dans une cible 8 bits de cette taille ; une dernière passe l'agrandit sur la toile :
  une lecture bilinéaire par pixel partout (l'image que le navigateur fabriquait), et dans le disque de la caisse (centre et rayon projetés, bord fondu)
  une reconstruction orientée le long des contours (12 texels, bornée par ses 4 voisins : pas de halo) + un piqué (écart à la lecture bilinéaire, borné).
- **Fichiers** : `code/rendu/loupe-caisse.js` (nouveau morceau, inscrit dans `ORDRE.txt` après `triptyque-bloom.js` ; `triptyque-bloom.js` n'est PAS modifié),
  `code/gameplay/pose-verdict.js` (la coupe de la carte du moteur, seul compte en pixels d'écran du jeu, lit `LOUPE.k`).
- **Comment sans rien casser** : three croit toujours que la toile fait la taille de la scène (`getPixelRatio`, `getDrawingBufferSize`,
  `domElement.width/height` rendent la taille de la scène : les matières qui comptent en pixels, maps comprises, ne voient rien). La vraie taille est posée
  par les accesseurs natifs de la toile, juste avant de dessiner (pas d'image noire). Un rendu direct à l'écran (carte du moteur) reçoit la toile entière.
  Avantage : la toile n'est plus réallouée quand l'échelle QL bouge.
- **Qui** : `ALLEGE` + `LOOK_TEL` + WebGL2 + palier 2 + écran ≥ ×2. L'ordinateur ne change pas d'un pixel. Hors course (menu, garage, mort, vitrine HD) : avant.
- **À chaud** : thermique serious/critical, palier ≥ 2 du gouverneur ou échelle effondrée → la toile reprend la taille de la scène, l'étalonnage écrit
  dessus comme avant (au bit près) ; retour seulement après 20 s au frais. Vérifié au banc (`--trans 1`) : froid 2532×1170 → chaud 1055×487 → reste éteinte
  au refroidissement immédiat ; pivot du téléphone loupe posée : 1170×2532 puis retour, images correctes.
- **Coût en compteurs** (13 Pro couché, DPR 1,25) : +1 appel de dessin, +1 cible 1055×487 RGBA8 (2 Mo), toile 2532×1170 au lieu de 1055×487
  (+~10 Mo de couleur) ; par image 2,96 M de pixels × 1 lecture bilinéaire, et dans le disque (250 000 à 440 000 pixels selon la caisse couché, ~470 000
  debout, soit 8 à 16 % de l'écran) 12 lectures de texel + ~150 opérations. Aucune allocation par image, aucune lumière. L'étalonnage et le FXAA ne
  coûtent pas un pixel de plus (même résolution qu'avant). Non chronométré (Mac à charge 200-400).
- **Réglages** : `?loupe=2` (toile à ×2 : 1,3 M de pixels au lieu de 3) · `?loupe=tout` (reconstruction sur toute l'image, pour comparer) ·
  `dbgLoupe()` (état, taille réelle, pixels du disque, bascules) · `dbgLoupe({on:0|1|null, voir:1, pique:1, r:1.35, k:3})`.
- **Planches** (`passation/finition/photos/caisse/`, pixels d'écran) : `caisse-loupe-nuages-jour-couche.jpg` (ELDORADO, LÉONIE, POSTER 84),
  `caisse-loupe-jade-nuit-couche.jpg`, `caisse-loupe-jade-nuit-debout-la-honte.jpg`, `caisse-loupe-nuages-jour-la-honte.jpg`,
  `caisse-loupe-image-entiere-nuages.jpg`, `caisse-loupe-disque-teinte-debout.jpg` (le disque teinté par `voir:1`).

## 4. La beauté : ce qui a été regardé, et pourquoi rien n'a été retouché
Sur les zooms (4 caisses, nuages de jour, jade de nuit) les volumes, le liseré, le vernis et l'ombre de contact se lisent ; rendue à ×3 la caisse est
belle telle quelle. Ce qui la ternit à l'image : (1) l'agrandissement (traité), (2) la lueur orange des feux et des flammes qui lave l'arrière
(hayon du CAÏD, poupe de LA HONTE) — c'est le chantier de l'autre agent (`atchoum-feu.js`, `feux-led.js`) : non touché. Aucune retouche de couleur ou de
liseré faite à l'aveugle sur toute la gamme.

## 5. Le banc
`node outils/banc-finition/caisse.cjs --out <dossier> --tag t [--fmt couche|debout] [--carte nuages|jade] [--meteo nuit] [--caisse 1,4,5]
[--var "avant:dbgLoupe({on:0});;loupe:dbgLoupe({on:1});;verite:dbgLoupe({on:0});dbgDPR(3)"] [--plein 1] [--trans 1] [--mesure 1] [--http 9881 --cdp 9882]`
— la MÊME image redessinée dans chaque variante (`dbgLoupe({rendre:1})`, deux fois : sur Mac saturé la photo prenait parfois l'image d'avant).
`python3 outils/banc-finition/planche.py sortie.jpg [--crop x,y,l,h] [--zoom 2] [--col 3] etiquette=photo.png …` : les planches.

## 6. Vérifié / non vérifié
- Vérifié : assemblage ; course nuages (couché) et jade nuit (couché, debout), 5 caisses, aucune exception, aucune « panne », console vide ; bascules chaud / pivot.
- NON vérifié, à faire sur le vrai 13 Pro :
  1. La cadence loupe posée (coût réel de la toile ×3 dans WKWebView et de la recopie) : comparer avec `?sans=loupe` et `?loupe=2`.
  2. La chaleur sur 10 min : la loupe ajoute du remplissage tant que le téléphone est nominal/fair.
  3. Le bord du disque (doit être invisible) en nitro, en vol, en figure ; la carte du moteur qui plonge dans le capot.
  4. Le début de course et la mort (la toile change de taille : pas d'image noire attendue).
  5. Safari/WKWebView acceptent la surcharge de `width/height` sur la toile (vu dans Chrome seulement).
- Non traité : la netteté à chaud (DPR 1,0 / 0,85 : rien d'ajouté, par règle) ; les détails plus fins qu'un texel (plaque, calandre).
