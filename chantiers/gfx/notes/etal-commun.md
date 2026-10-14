# NOTES — etal-commun (passe graphismes, 14/10) — LA COUCHE COMMUNE de l'étalonnage

Branche `gfx/etal-commun` : 2 commits (6605d27 voile des bonus · 39b040f DA + BIO_ETAL0). Des VALEURS seulement, coût nul.

## Valeurs AVANT → APRÈS
| Quoi (grep) | Avant | Après |
|---|---|---|
| `const DA=` sat | 1.2 | **1.08** |
| `const DA=` con | 1.14 | **1.06** |
| `const DA=` expo | 1.06 | 1.06 (gardée : baisser le contraste rouvre déjà les noirs ; 1.04 et 1.02 essayés, ils assombrissent la route sans rien apporter) |
| `const DA=` sh (sarcelle des ombres) | [-.026,.045,-.006] | **[-.013,.022,-.003]** |
| `const DA=` hi (or des lumières) | [.02,.038,-.042] | **[.01,.019,-.021]** |
| `const DA=` vigK (multiplie la vignette de TOUTES les ambiances) | 1 | **.6** |
| `const BIO_ETAL0=` wb | [1.02,.985,1.03] (magenta) | **[1,1,1]** |
| `BIO_ETAL0` sh | [.004,-.008,.062] (bleu-violet, −vert) | **[0,.004,.03]** (bleu-nuit) |
| `BIO_ETAL0` hi | [.052,.008,-.014] (rose) | **[.024,.014,-.008]** (à peine chaud) |
| `BIO_ETAL0` con | 1.23 | **1.16** |
| `BIO_ETAL0` bloomS / bloomT | .54 / .92 | **.46 / .95** |
| `BIO_ETAL0` vigC | [.149,.047,.212] (violet) | **[.03,.045,.09]** (encre bleu-nuit) |
| `BIO_ETAL0` vigK | .52 | .52 (× DA.vigK .6 = .31) |
| bords d'écran des bonus `#pwrFx` | alpha de `PWR_DEFS[k].fx/fx2` (aimant .55/.2, vitesse .85/.35…) | **× 0,4** (`PWR_BORD_K=1/2.5`, copies `bd`/`bd2` ; l'éclair du ramassage `flashEcran(d.fx)` inchangé) |

Le voile des bonus n'est PAS un uniforme (`uVigC` n'est écrit que par `bioApply`) : c'est un calque DOM `#pwrFx` (deux box-shadow internes
50 px + 150 px, qui battent) dont la couleur vient de JS (`PWR_DEFS[k].fx/fx2`, posée dans la boucle HUD, grep `--pf`). Dosé par l'alpha, sans toucher au CSS.

## Qui HÉRITE des défauts de BIO_ETAL0 (vérifié par le code AVANT le changement : `TOUT=1 node banc/etal-commun/produits.cjs`)
- wb/sh/hi/con : `tempete` (nuages orage), `nuitNoire` (ville nuit), `villeOrage`, `pluie` (ville pluie) + l'ancien parc (aube, lever, golden, couchant, soir, nuit, orage, aurore).
- bloomS/bloomT : matin, midi, aprem, nuagesSoir, nuagesNuit, nuagesPluie, villeMatin, villeMidi, villeSoir, bullrun, les 7 `titre*`.
- vigK/vigC : `pluie` (ville pluie) + l'ancien parc. TOUTES les autres ambiances ont leur vigC (jade* [.18,.08,.20] VIOLET, espace* [.05,.012,.09],
  nuagesSoir/villeSoir [.16,.07,.10] ROSE, bullrun [.16,.11,.03] OCRE) : pas touchées — aux équipes par map de les neutraliser (charte, règle 6).
- Les jade*, espace* ont tout en propre : elles ne bougent que par DA.
⚠ Dans le tableau ci-dessous la colonne « HÉRITE » compare aux NOUVELLES valeurs : `wb` (et `bloomS` du jade) y figurent par simple égalité.

## Produits sat/con par couple APRÈS la passe (plafonds de la charte ; ⚠ = encore au-dessus → à baisser PAR L'AMBIANCE : `sat`, `con`, `daCon`)
| couple | ambiance | sat (amb × DA = produit / plafond) | con (amb, daCon → produit / plafond) | expo | vigK | vigC | sh final | hi final | bloomS/T | HÉRITE du défaut |
|---|---|---|---|---|---|---|---|---|---|---|
| nuages matin | matin | 1.20 × 1.08 = **1.30** / 1.20 ⚠ | 1.28, 1.00 → **1.36** / 1.22 ⚠ | 1.02 | 0.16 | [0.050,0.140,0.220] | [-0.019,0.030,0.027] | [0.000,0.000,0.000] | 0.46/0.95 | wb bloomS bloomT |
| nuages midi | midi | 1.16 × 1.08 = **1.25** / 1.25 | 1.30, 1.00 → **1.38** / 1.28 ⚠ | 1.01 | 0.16 | [0.050,0.140,0.220] | [-0.019,0.030,0.027] | [0.000,0.000,0.000] | 0.46/0.95 | wb bloomS bloomT |
| nuages soir | nuagesSoir | 1.36 × 1.08 = **1.47** / 1.30 ⚠ | 1.24, 1.00 → **1.31** / 1.30 ⚠ | 0.95 | 0.18 | [0.160,0.070,0.100] | [-0.019,0.030,0.027] | [0.020,0.000,-0.020] | 0.46/0.95 | wb bloomS bloomT |
| nuages nuit | nuagesNuit | 1.10 × 1.08 = **1.19** / 1.15 ⚠ | 1.18, 1.00 → **1.25** / 1.25 | 1.07 | 0.25 | [0.010,0.020,0.060] | [-0.004,0.012,0.029] | [0.000,0.000,0.000] | 0.46/0.95 | wb bloomS bloomT |
| nuages pluie | nuagesPluie | 1.02 × 1.08 = **1.10** / 1.05 ⚠ | 1.16, 1.00 → **1.23** / 1.18 ⚠ | 1.04 | 0.20 | [0.040,0.050,0.080] | [-0.019,0.030,0.027] | [0.000,0.000,0.000] | 0.46/0.95 | wb con bloomS bloomT |
| nuages orage | tempete | 1.20 × 1.08 = **1.30** / 1.10 ⚠ | 1.16, 0.00 → **1.16** / 1.30 | 1.02 | 0.36 | [0.020,0.020,0.070] | [-0.005,0.012,0.029] | [0.034,0.033,-0.029] | 0.60/0.85 | wb sh hi con |
| ville matin | villeMatin | 1.20 × 1.08 = **1.30** / 1.20 ⚠ | 1.28, 1.00 → **1.36** / 1.22 ⚠ | 1.02 | 0.16 | [0.050,0.140,0.220] | [-0.019,0.030,0.027] | [0.000,0.000,0.000] | 0.46/0.95 | wb bloomS bloomT |
| ville midi | villeMidi | 1.16 × 1.08 = **1.25** / 1.25 | 1.30, 1.00 → **1.38** / 1.28 ⚠ | 1.01 | 0.16 | [0.050,0.140,0.220] | [-0.019,0.030,0.027] | [0.000,0.000,0.000] | 0.46/0.95 | wb bloomS bloomT |
| ville soir | villeSoir | 1.36 × 1.08 = **1.47** / 1.30 ⚠ | 1.24, 1.00 → **1.31** / 1.30 ⚠ | 0.95 | 0.18 | [0.160,0.070,0.100] | [-0.019,0.030,0.027] | [0.020,0.000,-0.020] | 0.46/0.95 | wb bloomS bloomT |
| ville nuit | nuitNoire | 1.25 × 1.08 = **1.35** / 1.15 ⚠ | 1.16, 0.00 → **1.16** / 1.25 | 0.76 | 0.43 | [0.000,0.000,0.030] | [-0.003,0.009,0.029] | [0.034,0.033,-0.029] | 0.62/0.80 | wb sh hi con |
| ville pluie | pluie | 1.38 × 1.08 = **1.49** / 1.05 ⚠ | 1.16, 1.00 → **1.23** / 1.18 ⚠ | 0.76 | 0.31 | [0.030,0.045,0.090] | [-0.013,0.026,0.027] | [0.034,0.033,-0.029] | 0.55/0.88 | wb sh hi con vigK vigC |
| ville orage | villeOrage | 1.20 × 1.08 = **1.30** / 1.10 ⚠ | 1.16, 0.00 → **1.16** / 1.30 | 1.02 | 0.36 | [0.020,0.020,0.070] | [-0.005,0.012,0.029] | [0.034,0.033,-0.029] | 0.60/0.85 | wb sh hi con |
| jade matin | jadeMatin | 1.08 × 1.08 = **1.17** / 1.20 | 1.06, 0.60 → **1.10** / 1.22 | 0.95 | 0.17 | [0.180,0.080,0.200] | [0.008,0.005,0.033] | [0.024,0.012,-0.012] | 0.46/0.84 | bloomS |
| jade midi | jadeMidi | 1.12 × 1.08 = **1.21** / 1.25 | 1.06, 0.60 → **1.10** / 1.28 | 0.95 | 0.17 | [0.180,0.080,0.200] | [0.008,0.005,0.033] | [0.024,0.012,-0.012] | 0.46/0.84 | bloomS |
| jade soir | jade | 1.08 × 1.08 = **1.17** / 1.30 | 1.06, 0.60 → **1.10** / 1.30 | 0.95 | 0.17 | [0.180,0.080,0.200] | [0.008,0.005,0.033] | [0.024,0.012,-0.012] | 0.46/0.84 | bloomS |
| jade nuit | jadeNuit | 1.10 × 1.08 = **1.19** / 1.15 ⚠ | 1.12, 0.60 → **1.16** / 1.25 | 1.05 | 0.24 | [0.020,0.030,0.080] | [-0.004,0.013,0.029] | [0.002,0.004,-0.004] | 0.46/0.84 | bloomS |
| jade pluie | jadePluie | 0.98 × 1.08 = **1.06** / 1.05 ⚠ | 1.04, 0.60 → **1.08** / 1.18 | 1.00 | 0.19 | [0.050,0.070,0.080] | [0.008,0.005,0.033] | [0.002,0.004,-0.004] | 0.46/0.84 | bloomS |
| jade orage | jadeOrage | 1.12 × 1.08 = **1.21** / 1.10 ⚠ | 1.10, 0.40 → **1.13** / 1.30 | 1.03 | 0.30 | [0.020,0.020,0.070] | [0.007,0.006,0.033] | [0.002,0.004,-0.004] | 0.46/0.84 | bloomS |
| espace matin | espaceMatin | 1.30 × 1.08 = **1.40** / 1.20 ⚠ | 1.28, 1.00 → **1.36** / 1.22 ⚠ | 0.78 | 0.25 | [0.050,0.012,0.090] | [0.007,0.010,0.030] | [0.040,0.049,0.009] | 0.50/0.90 | — |
| espace midi | espace | 1.30 × 1.08 = **1.40** / 1.25 ⚠ | 1.28, 1.00 → **1.36** / 1.28 ⚠ | 0.78 | 0.25 | [0.050,0.012,0.090] | [0.007,0.010,0.030] | [0.040,0.049,0.009] | 0.50/0.90 | — |
| espace soir | espaceSoir | 1.30 × 1.08 = **1.40** / 1.30 ⚠ | 1.28, 1.00 → **1.36** / 1.30 ⚠ | 0.78 | 0.25 | [0.050,0.012,0.090] | [0.007,0.010,0.030] | [0.040,0.049,0.009] | 0.50/0.90 | — |
| espace satellites | espace | 1.30 × 1.08 = **1.40** / 1.15 ⚠ | 1.28, 1.00 → **1.36** / 1.32 ⚠ | 0.78 | 0.25 | [0.050,0.012,0.090] | [0.007,0.010,0.030] | [0.040,0.049,0.009] | 0.50/0.90 | — |
| crypto — | bullrun | 1.12 × 1.08 = **1.21** / 1.25 | 1.24, 1.00 → **1.31** / 1.28 ⚠ | 1.01 | 0.13 | [0.160,0.110,0.030] | [-0.019,0.030,0.027] | [0.016,0.008,-0.010] | 0.46/0.95 | wb bloomS bloomT |

À l'iPhone s'ajoute le grade figé de l'ACES (`GRADE_ACES` : sat × 1,12, contraste × 1,05) — non compté ci-dessus, non touché (c'est du GLSL).
AVANT (même script, DA d'origine) : nuages matin 1,44/1,46 · midi 1,39/1,48 · soir 1,63/1,41 · nuit 1,32/1,35 · pluie 1,22/1,32 · ville pluie 1,66/1,40 ·
ville nuit 1,50/1,23 · orages 1,44/1,23 · jade 1,18-1,34/1,13-1,21 · orbite 1,56/1,46 · crypto 1,34/1,41.

## Ce que j'ai vu
- `shots/etal-commun/planche-essais-DA.png` (midi, nuagesSoir, nuitNoire × avant / B 1.10-1.08 / C 1.08-1.06 / D 1.06-1.04 / +halo ou +défauts) et
  `planche-essais-defauts.png` (ville pluie, matin). `planche-avant-apres.png` : 4 couples, MÊME image figée (avant = anciennes valeurs reposées à chaud).
- Midi : le cobalt se calme, les coins ne virent plus au bleu pétrole ; les cumulus restent crème (c'est `volSun`/`fogCj` de l'ambiance).
- Soir nuages : l'orange est moins fluo mais RESTE la dominante (sat produit 1,47 > 1,30) : à finir par `nuagesSoir.sat` (≈ 1.20) et son ciel.
- Ville nuit : plus de voile magenta dans les ombres ni de lumières roses, coins moins fermés ; la route reste un trou noir (lumière/route, pas l'étalonnage).
- Jade soir (Léo) : un peu plus doux (sat 1,30 → 1,17, con 1,15 → 1,10). Si on veut son image exacte : `sat` des jade × 1,11 et `daCon` .6 → 1.
- Le halo .46/.95 se voit à peine sur les captures de jour (aucune bavure avant non plus à ces instants) : gardé parce que demandé, sans risque.
- 0 erreur JS sur les 3 ouvertures ; syntaxe 0 erreur ; garde burn-out OK.

## POUR LES AUTRES / ce que je laisse aux équipes par map
- Baisser `sat`/`con` des ambiances marquées ⚠ (orbite 1,40 ; soirs 1,47 ; ville pluie 1,49 ; ville nuit 1,35 ; orages 1,30 ; matins 1,30/1,36).
- Les vigC propres encore colorées (jade violet, soirs rose, bullrun ocre, matin/midi [.05,.14,.22] bleu pétrole).
- `tempete`/`nuitNoire`/`villeOrage` gardent `hi` final chaud [.034,.033,-.029] : neutre-or, plus de rose.
- Vu sur les captures de contrôle (HUD masqué) : des taches de pixels roses/bleues/orange qui s'estompent dans les coins du canevas (ville nuit, jade soir,
  nuages midi) — un effet existant, pas l'étalonnage (présent avec les anciennes valeurs) ; à identifier par l'équipe effets.
- PROPOSITION (GLSL, donc pas cette nuit) : retirer ou doser le grade « téléphone » figé (sat × 1,12) de l'ACES, qui fausse tous les plafonds à l'iPhone.
- Revenir en arrière : remettre les valeurs « avant » des deux lignes (elles sont en commentaire au-dessus/à côté) ; `PWR_BORD_K=1`.
