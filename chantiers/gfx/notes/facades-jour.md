# facades-jour (passe graphismes, 14/10) — les tours de la VILLE ne sont plus allumées à midi
Branche `gfx/facades-jour`, copie `gfx/wt/facades-jour`. Interrupteur : `?sans=facades` (tout, au bit près) · `?sans=neonville` (la palette seule).

## RÈGLES COMMUNES (recopiées du PLAN)
Réversible (`?sans=<nom>`) · aucun changement global · capture au cran iPhone (palier 2, DPR 1, sans dbgQual/dbgDPR) · planche AVANT | APRÈS · charge > 40 = attendre.

## CE QUI CHANGE (zone : villeMatTours, villeApres, branche ville de `const NEON`)
- `CITY.uJ` (« uJour9 ») = `skyU.uJour × (1 − LVL.nuit) × (1 − smoothstep(.45,.95, skyU.uCity))`, posé par `villeApres`.
  ⚠ ÉCART AU PLAN : la formule du plan (uJour × (1 − nuit)) aurait éteint les fenêtres le SOIR, sous la PLUIE et à l'ORAGE —
  `nuitNoire`, `pluie`, `villeOrage`, `tempete` et les soirs ont tous `jour:1` (le dégradé d'altitude). Le champ `city` (la ville
  peinte du ciel : matin .25, midi .12, soir 1,1, pluie/orage 1,2) fait la différence. Fondu au portail (bioLerp).
- Fenêtres et liserés des toits : gain × (1 − .9·uJ) — de jour un reflet à 10 %, pas une lumière.
- Le VERRE DE JOUR : le carreau s'assombrit (×.5) et renvoie le ciel en rasant — palier 2 : Fresnel de Schlick (normale monde
  `vWN9`, reflet → mélange `uJHor`/`uJMid` selon la hauteur du reflet, plafonné à .8, ciel ×.85 sous le seuil du halo) ; paliers
  0-1 : part fixe .3 de l'horizon (zéro calcul de plus). Part de verre `gm9` = le carreau de près, la couverture moyenne au loin.
- Le BÉTON : teinte d'instance lavande (.20,.21,.26)×t9 → #6B717A à même luminance, fait DANS LE SHADER (×(1.008,1.013,.883) pondéré
  par uJ) au lieu de la ligne JS de buildVoxCity : ainsi la NUIT garde ses teintes au bit près (le plan demande les deux).
- Parapets : cyan/magenta/ambre → blanc de bureau #E8EEF2 / ambre #FFB04A. NEON ville : ambre, blanc, ambre, blanc, ambre, feu
  d'antenne #E5484D, couronne blanche (mêmes indices, même tirage `vr`). ⚠ Ces deux-là changent AUSSI la nuit (c'est l'intention
  de la DIRECTION §2.2) — `?sans=neonville` les coupe seuls.
- Clé `toursV4` → `toursV5[f][n]` (ancien chemin `toursV3` → `toursV3j`) : 0 programme de plus, 0 texture, +1 varying au palier 2.
- Crochet de banc `dbgFacades(v)` : force uJ (0 = façades de nuit sur l'image figée) ; `null` = auto.

## BANC
`banc/facades-jour/ab.cjs` (une ouverture, deux pages AVANT/APRÈS, dsf 1, ?palier=2, graine Math.random fixe, flou de vitesse coupé).

## POUR LES AUTRES
- Les réclames (`villePubAtlas`) et `villeMatNeon` gardent leurs couleurs propres (hors zone) : à ramener à ambre/blanc/rouge par leur propriétaire.
- L'accent de route de la ville (`accC` 0xf24aa0, magenta) n'est plus utilisé par la couronne, mais reste sur les bords (zone bords-route).

## VU (banc ab.cjs + crypto-planche.cjs, 2 ouvertures, palier 2 · DPR 1 · cran « fast » réel, 0 erreur JS, 167 programmes avant = après)
- midi / matin : uJ = 1 ; soir, nuit : uJ = 0 (image des fenêtres inchangée) ; A/B exact sur l'image figée (`apres-midi-uJ0` | `apres-midi`).
- Crypto : intacte par construction (cryptoMatTours, branche CR) — captures à des instants différents, même famille.
## DOUTES / RESTE
- Matin : une face de tour à l'ombre sort presque noire (verre ×.5 sur une face sans soleil) — relever le plancher du verre si Sacha le voit.
- Les fenêtres FROIDES restent cyan #8fd8ff la nuit (la DIRECTION veut le blanc de bureau #E8EEF2) : non fait, pour ne pas bouger la nuit.
- Le Fresnel n'est vu qu'au palier 2 ; paliers 0-1 (part fixe .3 de l'horizon) pas capturés.
