# Le moteur, le son entendu 100 % du temps (session SON, 2026-10-14)

Branche `son/moteur` (worktree `son/wt/moteur`). Correctifs de l'audit n°3 §2, 3, 8, 9. Rien d'écouté : tout vient du code
exécuté hors ligne (`son/banc/moteur/genou.js` lit le VRAI bloc `<<<SON-MOTEUR>>>` et le joue genou coupé / allumé ;
`son/banc/moteur/rapports.js` rejoue la boîte au départ). Gameplay, paliers, poussées, burn-out : intouchés.

## 1. Le genou (§2) : `engGenou`, `ENG_DOUX`
Au-dessus de 420 Hz la hauteur est comprimée : `420·(f/420)^0,30`. Oscillateurs, sub et cliquetis lisent la hauteur comprimée ;
le FILTRE (`lpB`) et le SOUFFLE (`nzF`) lisent la fréquence d'origine (même timbre). Vaut au sol, en vol (roue libre .85-.98)
et au burn-out (même `engSndParams`).

Fondamentale (Hz), charge stabilisée, sans nitro — avant > après :

| palier | ralenti | croisière | plein | sub plein |
|---|---|---|---|---|
| 1 | 9 | 61 | 68 | 34 |
| 10 | 19 | 187 | 217 | 109 |
| 12 | 36 | 282 | 334 | 167 |
| 13 | 46 | 395 | 480 > 437 | 240 > 219 |
| 16 | 72 | 557 > 457 | 692 > 488 | 346 > 244 |
| 17 | 73 | 752 > 500 | 941 > 535 | 471 > 268 |
| 20 | 32 | 745 > 499 | 788 > 507 | 394 > 254 |
| 24 | 43 | 973 > 540 | 1 029 > 550 | 515 > 275 |
| 26 | 40 | 1 342 > 595 | 1 420 > 605 | 710 > 303 |
| 29 | 74 | 1 872 > 658 | 1 980 > 669 | 990 > 334 |
| 30 | 35 | 2 081 > 679 | 2 203 > 691 | 1 102 > 345 |

(table complète des 30 : `node son/banc/moteur/genou.js`, CSV dans `son/banc/moteur/genou.csv`)
- Paliers 1-12 : identiques au bit près (contrôle du banc ; palier 12 plein régime + nitro = 347 Hz < 420).
- Plafond : 699 Hz (nitro), sub 349 Hz — avant 2 292 / 1 146.
- Descentes > 1 demi-ton d'un palier au suivant : avant 9→10 (−4,9), 14→15 (−3,2), 17→18 (−13,9), 21→22 (−7), 22→23 (−27,5),
  27→28 (−1,5) ; après 9→10 (−4,9, inchangé : le boxer, palier < 13), 17→18 (−4,2), 21→22 (−2,1), 22→23 (le PULSORÉACTEUR, voulu :
  il bat à ~45 Hz par construction). Le reste monte.
- À juger à l'oreille par Léo : le timbre des paliers 17, 24, 30 (moins aigus, même brillance de filtre).

## 2. Le sifflet (§3)
`whineF = min(fF0·whine, 1000 + 2400·min(1,rpm)·(.7+.3·min(1,whine/30)))` (≤ 3 400 Hz, monte avec le régime) ; gain −30 % au plus
quand fF0 dépasse le genou (fondu sur 140 Hz). Plein régime : paliers 20, 21, 24-30 9 000 Hz fixes → 2 900-3 400 Hz ; 18 : 6 324 →
3 040 ; 19 : 5 109 → 2 872 ; 9 : 3 171 → 2 944 ; 12 : 4 336 → 2 992 (seulement en haut du régime) ; 6 et 7 : inchangés.
⚠ Les sifflets 9 et 12 changent en haut de régime (la fondamentale des 1-12, elle, ne bouge pas).

## 3. La respiration (§8) : `engSouffle(t,rpm)`
±0,7 % de hauteur (12 cents) par deux sinus lents (0,23 et 0,37 Hz), appliquée APRÈS le genou (sinon il l'écrasait à ±0,2 % sur les
paliers du haut), nulle sous 29 % de régime (là vit `wob`, le tremblement du ralenti), pleine à 49 %. Au sol et en vol ; pas au burn-out.

## 4. Les rapports au départ (§9)
q = .35 + .65·rapport/gn sur `subBoom` et `noiseBurst` ; `crackle` seulement aux deux derniers rapports ; garde 350 → 500 ms ;
`hap(5)` et `fovPunch` 1,8 (force inchangée) espacés de 900 ms au moins. Cérémonies avant 3 s (8 rapports) : 5 → 4, dont les deux
premières à ~moitié de force et sans pétarade ; vibrations/coups de champ avant 3 s : 5 → 3.

## Comparer en jeu
- `…/jouer/?genou=0` : l'ancien moteur (note, sifflet, respiration) — marche sur iPhone. Sans le paramètre : le nouveau.
- Console : `dbgGenou(0)` / `dbgGenou(1)` bascule à chaud (même partie, même palier) ; `dbgMoteur()` pour monter de palier.
- Les rapports ne passent pas par `ENG_DOUX` (comparer avec le commit d'avant `0542879`).
