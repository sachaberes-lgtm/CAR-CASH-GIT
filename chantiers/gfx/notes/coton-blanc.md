# coton-blanc — la matière des nuages (passe graphismes, lot B1, 14/10)

Branche `gfx/coton-blanc`. Fichier : `VERSION PRINCIPALE/index.html` seulement. Interrupteur : `?sans=coton` (= l'image d'avant au bit près,
l'ancien programme `nuage8inst`, les anciennes teintes).

## RÈGLES COMMUNES (recopiées du PLAN-6H)
- Base gfx-integration, une branche, un commit par correctif, rien hors zone. Réversible (`?sans=coton`). Aucun changement global.
- Capture au cran iPhone : `?palier=2&tel=1`, SANS dbgQual(0)/dbgDPR(2) ; même image avant/après. Pièce = `shots/coton-blanc/planche-iphone.png`.
- Charge > 25-40 : pas de navigateur. 3 ouvertures max.

## Ce qui change (zone : `nuage8Mat`, `N8_U`, `cotonPose`, + `n8Vap`, `COTON_V2`, `N8_VAP`, `dbgCotonV2`)
1. **Teinte par nuage NEUTRE** (`cotonPose`, tous paliers, gratuit) : l'ancienne teinte tirait ±20 % de rouge contre ∓22 % de bleu (vue à 30 %
   par le shader : ~±6 % rouge/bleu, ~12 % d'écart de teinte entre deux voisins = un nuage SABLE à côté d'un nuage LAVANDE). Désormais un gris
   neutre .83-1,04 (×.94 pour les « lourds ») — ±3 % de luminance vue par le shader, 0 % de teinte. Mêmes trois tirages `cr` (le ciel ne bouge
   pas d'un nuage). Les teintes de NUIT (mer-nuit, jade-nuit) multiplient ce blanc après coup : elles marchent telles quelles.
2. **Vapeur au palier 2** (`N8_VAP` = COTON_V2 && PAL.n===2) : toile `n8Vap()` 256² LuminanceAlpha (128 Ko, une fois, à la 1re matière = au
   menu par nuageChauffe) ; dans le shader UNE lecture par pixel (bruit 3D de valeur « deux tranches par lecture » : L = tranche z, A = tranche
   z+1 décalée de (37,17)), en coordonnées LOCALES du nuage (cellule = 7,7 % du rayon, décalée par nuage) :
   - frange `e9 = smoothstep(.62,.95,fr)` (≈ 8 % → 1,5 % du rayon à la silhouette) : l'alpha y est rongé par la vapeur (plus près du bord,
     plus la vapeur doit être dense pour rester) — `discard` sous .02 dans la frange (le lobe de derrière remplit) ;
   - grain du cœur ±4,5 % de clarté ;
   - éteint quand une cellule fait moins de ~3 px (`vQ` = taille angulaire, calculée au sommet) : pas de scintillement au loin.
   Paliers 0-1 : le shader est EXACTEMENT l'ancien (même source, même clé `nuage8inst`).
3. **L'or seulement à contre-jour** (palier 2) : la lisière de contre-jour prend l'or (1,.9,.7) quand le soleil est clair (lune exclue) ; de face,
   l'allègement du bord est en blanc neutre (luminance du soleil).
- Clés : instances `nuage8inst` → `nuage8inst2` au palier 2. La solo garde `nuage8solo` exprès : le TITRE (`CHUTE.nuM`, zone titre) en clone
  la source avec la même clé — elle partage donc le programme (0 programme de plus) et prend la vapeur aussi au titre (palier 2).
- Hook : `dbgCotonV2({x:érosion,y:grain,z:or,w:tout})` (doses 0-1, à chaud), rend {v2, vap, palier, k, tex}.

## Coût
Voir la fin de ce fichier (mesures du banc `banc/coton-blanc/ab.cjs`).

## POUR LES AUTRES
- mer-nuit / jade-nuit : vos teintes de nuit multiplient désormais un BLANC neutre (au lieu d'un blanc sable/lavande) : la couleur de nuit est
  la vôtre, sans dérive par nuage.
- Titre (CHUTE) : au palier 2 ses cumulus prennent la vapeur (même programme que les nuages de route) ; `?sans=coton` la retire.

## ÉTAT À LA FIN DE LA MISSION (7 h 00) — PAS VU À L'IMAGE
- Commit 2621a21 : code posé, syntaxe 0 erreur, garde du burn-out OK. Clés `nuage8inst` (palier 0-1) / `nuage8inst2` (palier 2).
- AUCUNE ouverture de navigateur : la charge machine est passée de 58 à 670 (1 min) pendant toute la fenêtre ; le banc attendait < 40.
  Donc : GLSL NON COMPILÉ au banc (relu à la main), image NON vue, renderer.info NON mesuré, planche NON faite.
- À FAIRE au prochain créneau calme : `sh banc/coton-blanc/lance.sh > banc/coton-blanc/ab1.log 2>&1` (UNE ouverture : 4 contextes
  apres2/avant2/apres0/avant0, 5 couples au palier 2 + gros plan `dbgCotonPlanche` en pause, `dbgCout`/`dbgProgsListe` par couple,
  écrit `shots/coton-blanc/ab.json`), puis assembler `planche-iphone.png` avec `B.planche`. Vérifier en premier : 0 erreur de shader
  au palier 2 (pageerror / programme `nuage8inst2` présent dans dbgProgsListe) ; au palier 0, programmes identiques à `?sans=coton`.
- Coût attendu (par construction, non mesuré) : palier 0-1 = 0 (même source, même programme, même clé ; seule la teinte CPU change) ;
  palier 2 = +1 lecture de texture/pixel de nuage, ~15 ALU, 2 varyings, 1 discard (frange), +128 Ko de texture, 0 appel, 0 triangle,
  +0 programme (la clé change, le compte non).
- Doutes : (a) le discard dans la frange peut coûter sur les puces Apple (transparents déjà mélangés : impact jugé faible, à mesurer) ;
  (b) la frange suit `fr` (silhouette PAR LOBE) : les bords internes entre deux lobes s'effilochent aussi — voulu, à juger ;
  (c) seuils `e9` .62-.95 et doses `uVapK` réglables à chaud (`dbgCotonV2`) — non réglés à l'œil.

## MESURÉ (7 h 11-7 h 36, banc ab.cjs, 2 ouvertures : A/B + planche)
- 0 erreur JS dans les 4 contextes ; programme `nuage8inst2` lié au palier 2 (compile).
- Programmes : palier 2 167/184 (après) = 167/184 (avant) ; palier 0 : mêmes 7 programmes de nuage des deux côtés (164 vs 163 au total, l'écart n'est pas un nuage).
- Appels/triangles : non comparables image à image (pilote auto, scènes différentes, échelle QL différente) ; aucun appel ni triangle ajouté par construction.
- ms GPU : non concluant (premier contexte joué sous charge 50-100 : 16-17 ms contre 2-3 ms au second) — À REMESURER au calme, même image figée.
- Vu : le mélange sable / lavande de l'AVANT (nuages midi) disparaît dans l'APRÈS (blancs neutres, ventres bleutés). La frange effilochée se voit à peine
  (le flou de vitesse et le NITROOO couvrent les bords ; le gros plan « planche » n'a pas tenu la pause). Doses non retouchées.
- Planche : shots/coton-blanc/planche-iphone.png (images PAS identiques avant/après : même couple, pas même instant).
