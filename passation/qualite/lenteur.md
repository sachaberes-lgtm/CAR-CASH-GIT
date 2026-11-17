# Lot LENTEUR (17/11, 2e tour) — branche `qa/lenteur`, partie d'`origin/qualite-appareil`

Source : l'analyse du vol du build 120 (juge adverse). En économie d'énergie + téléphone tiède/chaud (pire branché),
des RAFALES de 3 à 34 s : une image sur 3-4 pèse ~115 ms. Et une fuite du calage : 81 secondes sur 864 calculaient 34 à 44 images au lieu de 30.

## Ce que le lot garde

| | quoi | par défaut ? | interrupteur |
|---|---|---|---|
| A | L'HORLOGE DU CALAGE (`cadence.js`, cadSauteH ; appelée par `boucle-1.js`) | **NON** (elle ne saute rien, voir plus bas) | `?plus=cadhorloge` |
| B | LE SON DE LA CARTE MOTEUR AMORCÉ AU MENU (`sfx.js` amorce, `console-son.js`) | OUI (même son, gain 0) | `?sans=swapchaud` |

**C (gouverneur de lenteur) et D (loupe au chaud) sont SORTIS du lot** (décision de la session parente, 2e tour), par un commit de retrait.
Leur état complet est sur la branche **`qa/gouvlent`**, avec les corrections demandées par le contrôle dans `passation/qualite/gouvlent.md`.
À reprendre après la fusion du pilote de qualité.

## A — l'horloge du calage, 2e tour

Le 1er tour sautait les images « en trop » partout. Le contrôle a prouvé que c'était un échange d'images contre des à-coups :
- là où l'écran livre 34-44 images/s (68 des 81 secondes de fuite du vol `vol-1117-1448`), elle ajoutait des trous > 50 ms ;
- à 20 i/s avec un travail de 22-30 ms, des intervalles de 60-76 ms ;
- or le jeu plafonne dt à 50 ms (`boucle-1.js`) : tout ce qui dépasse est du temps de jeu perdu (un ralenti).

Nouvelle règle (`cadSauteH`, juste avant « LE HUD CONTEMPLATIF » dans `cadence.js`). Une image que cadSaute calculerait n'est sautée que si :
1. l'écran livre RÉGULIÈREMENT ≥ 50 images/s : sur ses 60 derniers intervalles, médiane ≤ 20 ms, 9e décile ≤ 1,5 × médiane, plus long ≤ 2 × médiane ;
2. l'horloge est en avance (échéance idéale de la dernière image calculée, une période par image, jamais plus d'une période en retard) ;
3. le saut ne peut pas faire d'intervalle > 1,5 période ni > 50 ms : temps depuis la dernière image calculée + le plus long intervalle d'écran des ~5 dernières secondes + 2 ms ≤ min(1,5 × per, 50).

Sinon : cadSaute, au bit près. Une image sautée passe quand même par cadSaute (dose de chaleur, compte des images d'écran), échéance posée à l'instant puis rendue.
Elle n'est donc pas comptée comme calculée (le `pilImg` du pilote reste juste après la fusion).
L'appel passe par `boucle-1.js` (`cadSauteH` au lieu de `cadSaute`) : cadSaute n'est pas touchée, aucun conflit avec `qa/pilote` ni `qa/portv`.

**Résultat : la règle tient l'exigence, mais ne saute AUCUNE image.** 41 graines × 14 écrans × 30 et 20 i/s : 0 saut.
La fuite n'existe que sur un écran qui livre moins de 50 images/s ou de travers ; là, tout saut fait un trou.
Sur un écran régulier à 60 ou 120 Hz, cadSaute tient déjà 30,0 i/s. **A est donc ÉTEINTE par défaut** (`?plus=cadhorloge` pour une mesure sur le téléphone).
Sans le paramètre, `cadSauteH` appelle `cadSaute` tel quel (un appel de fonction de plus).

Banc : `node outils/banc-lenteur/horloge.cjs` (sans navigateur, déterministe ; `GRAINE=n` ; `--json` ; sortie 1 si l'exigence casse).
Chiffres complets : `outils/banc-lenteur/mesures/horloge.json`. Avant = défaut, après = `?plus=cadhorloge` :

| écran | i/s | σ (ms) | max (ms) | > 50 ms /min | temps perdu ms/min |
|---|---|---|---|---|---|
| 30 · 60 Hz propre | 30 = 30 | 0,6 | 35 | 0 | 0 |
| 30 · 60 Hz, moitié des images en retard de 12 ms | 31,52 = | 8,7 | 51 | 25,9 | 26 |
| 30 · 60 Hz, gigue 10 ms | 30,17 = | 4,3 | 51 | 1 | 1 |
| 30 · 120 Hz propre | 30 = | 0,6 | 35 | 0 | 0 |
| 30 · 30 Hz (économie) | 30 = | 1,3 | 37 | 0 | 0 |
| 30 · 34-44 Hz irréguliers (synthétique) | 36,32 = | 6,9 | 54 | 13,6 | 30 |
| 30 · le vol : 81 secondes de fuite rejouées | 31,39 = | 9,4 | 69 | 83,1 | 382 |
| 20 · 60 Hz, travail 22-30 ms | 22,32 = | 7,3 | 51 | 25,6 | 26 |
| 20 · le vol rejoué | 19,72 = | 8,7 | 85 | 565,8 | 4 537 |

(« = » : identique avant et après, partout. Les autres cas — 30 % en retard de 9 ms, gigue 5 ms, vsync manquée 1/20, 90 Hz, 120 Hz en retard, travail 12-20 ms — aussi.)
Le 1er tour, sur les mêmes cas : 60 Hz moitié en retard 32,8 → 28,3 i/s et trous 19,7 → 38,3 /min ; 20 i/s travail 22-30 : temps perdu 21 → 4 457 ms/min.

Note : à 20 i/s sur un écran à 60, la base fait déjà 50/51 ms (arrondi de l'horodatage à 1 ms) : ces « > 50 ms » valent 1 ms chacun. Rien de neuf.

## B — l'amorce du son de la carte moteur

- Vol : gel de 332 ms à 0,8 s de course, dont 157 ms dans `engSwapArme` → `engSwapSnd` → `moteur.palier` (69 ms dans un autre vol du jour).
- Le son, déjà décodé d'avance, est JOUÉ une fois en silence au menu : gain posé à 0 avant tout branchement, aucune automation, 30 ms, même chemin (tampon, source, gain, bus).
- 2e tour (remarque du contrôle : « contexte endormi au menu → l'amorce part au premier son, possiblement en course ») :
  - jamais en course (`S.enCourse` de sfx.js) : ni l'amorce, ni sa relance par `play()` ;
  - jamais si le jeu dit non : `amorceOk()` (console-son.js) = effets allumés (`SND.sfx`), page visible, hors partie (menu ou écran de mort) ;
  - refus comptés : `CCSON.etat().amorcesRefusees` ; faites : `CCSON.etat().amorces`.
- Banc : `node outils/banc-lenteur/amorce.cjs` (vraie sfx.js, faux AudioContext qui note tout) :
  - au menu : 1 source, gain 0 posé avant le branchement, jamais changé, 30 ms ; le vrai `play('moteur.palier')` qui suit part (ni polyphonie max 1, ni délai) ;
  - son coupé : 0 amorce, 1 refus ; rallumé, au son suivant : 1 amorce ;
  - contexte réveillé EN COURSE : 0 amorce ; au menu suivant : 1 ;
  - contexte endormi au menu : 0, puis 1 au premier son.

## Vérifié aussi
- `git merge-tree` de `qa/lenteur` avec `origin/qa/pilote` et avec `origin/qa/portv` : sans conflit.
  (Le pilote et portv entre eux : conflit dans `rendu/traces-pneus.js`, qui n'est pas de ce lot.)
- Gardes : démarrage, allège, charte ; `node --check` de sfx.js et du gros script.

## Non prouvé
- B : la cause des 157 ms n'est pas connue (Chrome ne la reproduit pas, sauvegarde muette au banc). À relire dans la boîte de vol (Q : `engSwapArme`).
- A : le vrai motif image par image des images d'écran du 13 Pro (le vol ne donne que des comptes par seconde ; les secondes du vol sont reconstruites).

## Protocole sur le téléphone (13 Pro, branché + économie + chaud)
1. Build de mesure (`?perfrec=2`), même carte, 3 courses de 3 min par variante, en alternant : défaut · `?sans=swapchaud` · `?plus=cadhorloge`.
2. Lire dans la boîte de vol :
   - Q `engSwapArme` (B) : plus de rappel > 8 ms au premier moteur ;
   - pour A : S[1] (images calculées / s), `dbgHorloge().sauts` (attendu : 0 ou presque), intervalles calculés > 50 ms /min et temps de jeu perdu, avant et après.
