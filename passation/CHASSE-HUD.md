# CHASSE AUX BUGS VISUELS DU JEU — HUD de course, téléphone (10/11/2026, session Fable)

Méthode : `outils/banc-hud/photos.cjs` (course réelle, debout et couché), chaque photo regardée.

## Corrigé
1. **Le compte à rebours de DARK TRIAD recouvert (debout)** — `code/interface/passe-textes.js`, `hudColMesure`. `#frenChrono` est posé SOUS la boîte de l'emblème
   (`top:100% + 2px`) ; la colonne de droite n'empilait que la boîte : le bloc suivant (chrono de vol « 6,0 AIR » ou plaque NITRO MAX) se posait sur « 0:03 ».
   Ce qui dépasse compte maintenant dans la hauteur (place gardée dès l'entrée en frénésie : la colonne ne saute pas quand le chrono arrive).
   Vérifié à l'image en 390 × 844, 430 × 932 et 375 × 667 : `passation/chasse-visuel-triade-chrono.png` (avant | après). Couché : non concerné (l'emblème est en haut au milieu).

## Vu, jugé propre
Départ, course, HUD chargé (chaîne + NITRO MAX + AIR MAX), HUD discret, pause — debout ; départ et course — couché.

## Pas jugé
- Couché : HUD chargé, frénésie avec vol, pause (le banc a rendu « délai : Page.captureScreenshot », machine chargée).
- Les animations (entrées et sorties des blocs, annonces) : le banc ne prend que des images fixes.

## À savoir
- Le banc du HUD n'est pas déterministe : une fois sur deux la caisse meurt avant le moment « frenesie » (les prises montrent alors l'écran de mort).
- La ligne du bas « PEINTURE GAGNÉE · NOM » au départ, couché : vue coupée par le bas de l'écran sur une prise (peut-être en train de sortir) — à revoir en direct.
