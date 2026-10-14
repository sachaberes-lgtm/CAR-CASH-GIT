# bords-route — notes (passe graphismes, 14/10, lot A2 du PLAN-6H)

Branche `gfx/bords-route` (copie `gfx/wt/bords-route`) · banc `gfx/banc/bords-route/` (chaine.cjs, planche.cjs) · captures `gfx/shots/bords-route/`.
Interrupteur : `?sans=bords` (ou `?sans=…,bords,…`) = l'image d'avant au bit près (`const BORDS_V2`). Le socle `ETAL_SANS` n'existe pas : interrupteur local.

## Règles communes recopiées
Réversible (`?sans=bords`) · aucun changement global (pas de DA/ACES/grade/BIO_ETAL0) · capture au cran iPhone (`?palier=2`, DPR 1 réel, SANS dbgQual/dbgDPR) ·
pièce de validation `shots/bords-route/planche-iphone.png` (AVANT | APRÈS) · 3 ouvertures max, charge < 25-40.

## Ce qui change (tout derrière BORDS_V2)
- `const BORDS_V2` + `BORDS` + `bordsTick()` + `dbgBords()` : bloc neuf juste avant `let LIGNE_TEX`.
- `bordsTick()` est appelée (1 ligne) en fin de la boucle caméléon de `musicTick` et à la fin de la construction de la nappe dans `buildTrack`.
  Rail = couleur (chanfrein béton #C9C3B6 de jour ; blanc doux #E8E4DA × .5 la nuit/pluie/orage), nappe = opacité 0 de jour, 30 % la nuit.
  `userData.base` reste l'accent ambre : le ciel musical (`lvlTick`) le lit toujours, le rail blanc ne vire plus de teinte à la musique.
- `ACCENTS`/`accC` : ambre #FFB04A (nuages, ville, orage, hasard), or #F2B93B (jade, cryptocity), blanc froid #E8EEF2 (orbite), Paris inchangé.
  `accC` nourrit `ROAD_U.uAcc` (reflet des flaques), le liseré des flancs, la couronne des tours (`buildVoxCity`, zone facades-jour) et le ciel musical.
- `trancheMat` : béton sombre #3A3833 ; liseré .55 → .30 ; catadioptres .9 → 1 ; clé `trancheV3` (un programme remplacé).
- `ligneMat` : #F2EEE6 .7 (jade : #EAF0E8 .55 via `LIGNE_OPJ`, 2 endroits : buildTrack et jadeRouteStyle).
- `padTex` : fond de plaque et grille en béton sombre, arête claire des chevrons blanche (même taille de texture).
- `jadeRouteStyle` (2 valeurs, route normale k=5) : flanc béton, `uAcc` or.

## Vu / pas vu
- Ouverture 1 (APRÈS, couché 844×390, `?palier=2`, DPR 1 réel, sans dbgQual/dbgDPR) : nuages midi · nuit · matin · soir · pluie · orage(sonde seule), ville pluie, jade matin, orbite matin
  → 0 erreur JS. Le bord se lit en fine ligne claire + tirets ambre (jade matin, orbite matin, nuages nuit). La sonde `dbgBords()` confirme jf=1 de jour, 0 de nuit/pluie/orage, accent #FFB04A (nuages, ville),
  #F2B93B (jade), #E8EEF2 (orbite). La capture s'est arrêtée à nuages orage (timeout d'écran, machine à charge 670).
- ⚠ Les vues figées `dbgView` (rasant, loin) de la chaîne sont inutilisables : après un portail la caméra se retrouve sous la dalle. Les planches utilisent la vue « jeu ».
- Réglage après la 1re ouverture : rail de nuit .5 → .62, nappe de nuit 30 → 40 % (le bord du vide doit rester lisible la nuit).
- Planche : `shots/bords-route/planche-iphone.png` (AVANT = `?sans=bords`), script `banc/bords-route/ab.sh`.

## Doutes
- Le rail est un matériau opaque : le « blanc à demi » est obtenu en baissant sa couleur (pas d'opacité réelle) ; il ne se mélange pas au sol mouillé.
- De jour, le chanfrein est une couleur FIXE (#C9C3B6, non éclairée) : au soir sombre ou en orbite il peut sembler un peu clair ; `dbgBords({kJ:.8})` le baisse à chaud.
- Rail, liseré et ciel musical : `userData.base` reste ambre, donc `lvlTick` (roue, ondes du ciel musical) peint désormais en ambre/or au lieu du cyan/rose.
- Pas vérifié à l'image : orage (nuages et ville), jade nuit, pluie jade, espace soir/satellites, ville nuit (rail pré-divisé par le facteur `villeApres`).

## PROPOSITIONS
- Catadioptres de jour plus rares et un vrai chanfrein en géométrie (un biseau de 20 cm) : hors périmètre (aucune géométrie).
- `ETAL_SANS` : quand le socle existera, remplacer `BORDS_V2` par `!ETAL_SANS.has('bords')`.

## POUR LES AUTRES
- facades-jour : `accC` → `buildVoxCity` (couronnes des tours) est désormais ambre #FFB04A en ville (or à Cryptocity) : la couronne suit, rien à faire.
- mer-nuit / ambiances : `uAcc` (reflet des flaques) est ambre/or/blanc, plus cyan/rose.

## Ouvertures 2 et 3 (planche produite)
AVANT (`?sans=bords`, v2:false confirmé par la sonde) : nuages midi/nuit, ville pluie, jade matin, orbite matin, crypto. APRÈS nuit (réglage .62/.4), crypto, debout nuages nuit avant/après. 0 erreur JS partout.
Planches : `shots/bords-route/planche-iphone.png` (6 lignes) et `planche-debout-nuit.png`. Lecture : à l'échelle de l'iPhone le bord est un filet clair + tirets ambre, bien moins voyant que le rail cyan d'avant (c'est voulu) ;
sur la vue debout de nuit le bord du vide n'est PAS net sur la capture (route large, caméra loin du bord) : à regarder sur l'iPhone, `dbgBords({kNuit:.8})` le renforce à chaud.
Non vus : orage, jade nuit/pluie, orbite soir, ville nuit.
