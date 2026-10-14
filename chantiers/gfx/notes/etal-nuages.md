# NOTES — etal-nuages (passe graphismes, 14/10) — l'étalonnage de LA MER DE NUAGES à ses 6 météos

Branche `gfx/etal-nuages`, 4 commits. UNIQUEMENT des valeurs, dans le bloc `// ---- ÉTALONNAGE · MER DE NUAGES …` (6 lignes `Object.assign(BIOMES.<nom>,{…})`,
posées après toutes les définitions : les ambiances filles des autres maps ne bougent pas). Coût GPU nul. 3 ouvertures navigateur (+ 1 planche), 0 erreur JS.
Banc : `banc/etal-nuages/` (releve.cjs = relevé hors navigateur ; essais.cjs / essais2.cjs = variantes à chaud ; controle.cjs = contrôle). Captures : `shots/etal-nuages/` (planche.png = les 6 météos).

## LA DÉCOUVERTE QUI COMPTE
`jZen / jMid / jHor / jSol` sont LINÉAIRES (avant ACES + encodage sRGB) : y poser les couleurs sRGB de la charte les rend beaucoup trop claires et saturées
(vu à la 1re ouverture : nuit à ciel bleu roi). Convertir (≈ x^2.2) avant de poser. Idem pour `fog`.
Autre fait : la MER sous l'horizon (`merZ`, jour:1) a des SOMMETS BLANCS fixes dans le GLSL (`haut=vec3(1,.985,.96)` mélangé 18 % au `sunTint`) et une ombre violet-bleu
(`jMid*.58+(.10,.10,.16)`) : aucun champ d'ambiance ne les change → nuit et orage gardent une mer claire, légèrement indigo. (`uMzH/uMzO/uMzT` existent mais ne sont écrits que par le titre.)

## Valeurs AVANT → APRÈS (produits = ambiance × DA après la couche commune : sat 1,08, con 1,06)
| Météo (ambiance) | sat × DA → produit (plafond) | con → produit (plafond) | Changements principaux |
|---|---|---|---|
| matin (`matin`) | 1,20 → 1,10 = **1,19** (1,20) | 1,28 → 1,14 = **1,21** (1,22) | expo .96 → .98 ; ciel jZen [.08,.30,.62] → [.12,.36,.76], jMid [.30,.66,.86] → [.35,.58,.85], jHor crème [.93,.93,.86] → pêche [.97,.85,.74] ; fog [.84,.90,.92] → [.93,.87,.82] ; clé [1,.95,.84] → [1,.92,.78] ; hemiG [.78,.80,.86] → [.70,.72,.80] ; cumulus volSky/volGnd moins bleus ; vigC bleu pétrole [.05,.14,.22] → neutre [.06,.07,.11] ; env aligné |
| midi (`midi`) | 1,16 → 1,14 = **1,23** (1,25) | 1,30 → 1,18 = **1,25** (1,28) | expo .95 → .96 ; plus de cobalt : jZen [.03,.22,.55] → [.13,.40,.84], jHor [.86,.92,.94] → [.81,.91,.97] ; clé [1,.98,.92] → [1,.99,.96] ; volSun [2.3,2.25,2.15] → [2.35,2.35,2.3], volSky [.55,.75,.95] → [.8,.86,.95], volGnd [.6,.66,.78] → [.8,.82,.88] (cumulus BLANCS) ; fog [.78,.87,.95] → [.80,.89,.96] ; vigC neutre |
| soir (`nuagesSoir`) | 1,36 → 1,16 = **1,25** (1,30) | 1,24 → 1,18 = **1,25** (1,30) | expo .90 → .97 ; ciel pêche → mauve doux : jZen [.12,.22,.52] → [.14,.17,.42], jMid [.56,.52,.72] → [.50,.38,.50], jHor [1,.70,.42] → [1,.66,.46] ; clé [1,.72,.44] → [1,.78,.60], sunI 1,7 → 1,15, hemiI .55 → .60 ; volSun [2.1,1.35,.8] → [2.1,1.85,1.5] (cumulus pêche, plus d'orange) ; ventres moins noirs ; fog [.94,.72,.58] → [.93,.76,.66] ; vigC rose [.16,.07,.10] → [.07,.05,.08] ; sunHalo 1,15 → .9 |
| nuit (`nuagesNuit`) | 1,10 → 1,04 = **1,12** (1,15) | 1,18 → 1,14 = **1,21** (1,25) | expo .92 → 1,0 ; hemiI .5 → .58, lune sunI .75 → .8 (#B3C2E6), fillI .22 → .26 ; moins de bleu dans hemiS/fillC/kickC ; ciel linéaire charte : jZen [.006,.012,.045] → [.004,.008,.035], jHor [.09,.13,.25] → [.013,.024,.09] ; fog [.06,.08,.16] → [.02,.03,.08] (fogN/F 700/4600 → 600/4000) ; vigK .42 → .34 ; nuages moins noirs (volSky/volGnd) |
| pluie (`nuagesPluie`) | 1,02 → .96 = **1,04** (1,05) | 1,16 → 1,10 = **1,17** (1,18) | expo .98 → .97 ; clé diffuse [.78,.82,.92] → [.84,.87,.92] ; ciel et brume au même gris-bleu : jZen [.30,.34,.42] → [.20,.24,.30], jHor [.66,.68,.71] → [.42,.45,.50], fog [.50,.53,.59] → [.46,.50,.56] ; vigK .34 → .30 |
| orage (`tempete`, niveau L'ORAGE : lit bien `tempete`) | 1,20 → 1,0 = **1,08** (1,10) | 1,16 (daCon 0) | ARDOISE : `jour` 0 → 1 (le ciel « Vice City » violet/orange devient le jour d'altitude gris-bleu : jZen [.012,.017,.05] → jHor [.07,.08,.14], jSol 0, comme les 5 autres météos) ; kickC violet [.55,.46,1] → [.40,.50,.70], kickI .26 → .20 ; hemiS/fillC/fog/vigC sans violet ; vigK .6 → .5 ; env + eS1/eS2 gris-bleu ; fogN/fogF inchangés (visibilité du niveau) |

## Ce que j'ai vu (3 ouvertures : essais, essais2, contrôle ; mesures de L* avec `banc/audit-nuages/mesure.py`)
- MIDI : azur clair → horizon bleu très clair, cumulus blancs-crème (ombres bleu pâle), béton gris L* 39-46 — la meilleure des six. MATIN : azur → pêche, cumulus crème clair, béton L* 50-58 (un peu clair).
- SOIR : pêche → mauve doux, cumulus pêche ; MAIS au contrôle, le béton éclairé de face par le soleil virait au saumon (L* 63-69, sat .5) : j'ai ADOUCI après coup (sunI 1,7 → 1,15, sunC [1,.78,.6], hemiI .6). ⚠ NON REVÉRIFIÉ à l'image (budget d'ouvertures épuisé).
- NUIT : ciel noir à étoiles, béton bleu-gris lisible (L* 18-21 dans le meilleur cas des essais, 34 au contrôle quand les phares éclairent) ; allégé d'un cran après coup (hemi .65 → .58, sunI .9 → .8, fill .3 → .26) ⚠ non revérifié. Un gros cumulus proche reste gris-beige (lumière lune + hemi sur la ouate).
- PLUIE : gris perle, béton L* 46-54 ; le fond reste un peu lavande (ombre de la mer, GLSL). Les confettis colorés de la pluie (rectangles) sont des particules, pas l'étalonnage.
- ORAGE : ardoise nettement meilleure que l'indigo-magenta d'origine (comparé à `jour:0` avec skyMul réglés : ceux-ci donnaient une bande orange au zénith → abandonné) ; reste un fond de mer indigo-clair (GLSL).
- Le contrôle de `jour` .75 pour l'orage (plus sombre, plus indigo) a été écarté : `jour` 1 est plus gris.

## Ce qui reste / doutes
- Vérifier à l'image soir et nuit après le dernier réglage (valeurs plus douces que ce qui a été vu).
- Route : plus claire que la cible charte de jour (L* 39-58 pour 32-45) : le béton est lu à travers `hemiI`/`expo` ; à baisser côté `route-beton` (`uLift`) plutôt que dans les ambiances. Matin/pluie sont les plus clairs.
- Vignettes : vigC neutres et vigK ≤ 60 % d'avant (le DA les multiplie encore par .6).

## PROPOSITIONS (GLSL, hors périmètre de la nuit)
1. Exposer `mzH` (couleur des sommets de la mer, `uMzH`) et `mzO` (ombres) dans les ambiances : au moins pour nuit et orage, où la mer blanche contredit « ciel plus sombre que la route » et « ardoise sombre ».
2. Retirer ou doser le grade « téléphone » figé de l'ACES (sat × 1,12, con × 1,05) : il fausse tous les plafonds à l'iPhone.

## POUR LES AUTRES
- `jZen/jMid/jHor/jSol/fog` sont en LINÉAIRE : poser les couleurs de la charte en sRGB donne des ciels deux fois trop clairs (valable pour ville, jade, orbite).
- `tempete` est maintenant en `jour:1` (ses filles `villeOrage` et `jadeOrage` sont des copies figées : inchangées).
