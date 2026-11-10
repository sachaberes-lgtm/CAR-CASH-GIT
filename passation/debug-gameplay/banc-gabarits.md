# Banc gabarits (2026-11-10) — ÉTAT PROVISOIRE

## Outil
`passation/debug-gameplay/preuves/banc-gabarits/gab.cjs` (copie adaptée de `outils/banc-course/course.cjs`), lancé par `lot.sh` (prend `/Users/sachaberes/cash-car/verrou-banc.sh`, attend la charge < 40) ; `chaine.sh` enchaîne 4 configurations. Sorties : `<tag>.jsonl` (une ligne par course), `<tag>.log`, `<tag>.out`.
Pilote : `dbgAuto(1,0,{vol:true})`, graine `Math.random` fixée par map (identique entre gabarits), temps réel, sonde 1 s (s, lat, vH, hOff, NaN, figé). Muet (sfx/mus/vox = false avant chargement).

## Mesuré jusqu'ici (essai de mise au point, 390×844 @3, palier 2, map nuages, 20 s réelles par course)
- Course 1 : s = 1641 m, vmax 227 km/h, 0 NaN, non figée, 45 i/s ; course 2 (après REJOUER tapé) : s = 3848 m, vmax 226, 50 i/s. Le pilote ne meurt pas en 20 s.
- 0 exception, 0 requête en échec. Console : seulement « Blocked call to navigator.vibrate » (artefact : pas de geste utilisateur) et le « READ-usage » connu.
- Un 1er essai en pas-à-pas (`dbgStep(30,33)`) n'avance quasiment pas (s = 3 après 15 « secondes ») : le pas-à-pas est inutilisable ici, temps réel retenu (`--reel 1`).
- `?tel=1` ne change pas le palier annoncé (`src: ordinateur`, n = 2) : le palier doit être forcé par `?palier=`.

## État de la chaîne
Lancée à 16:12 (se-p0 375×667 p0 → promax-p2 430×932 p2 → paysage-p2 844×390 → 13pro-p1), bloquée en attente du verrou de banc tenu par une autre session (« debug-gameplay-cadence »). Aucun résultat de matrice encore.
