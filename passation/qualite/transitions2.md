# Lot TRANSITIONS, 2e tour (20/11) — branche `qa/transitions`

Sacha (18/11) : « quand on relance une partie, il y a une jolie animation, mais elle pourrait être moins buggée. »
Le 1er tour (`passation/qualite/transitions.md`) a été jugé NON CONCLUANT au contrôle. Les cinq points relevés, et ce qui est fait.
Un seul morceau du jeu change : `code/economie/aura-banque-contrats.js` (le volet doré, `ecranWipe` + le balayage `wipePx*`).
`?sans=transitions` rend l'avant (tout le neuf derrière `TRANS_ON`). `dbgTransitions()` : le dernier volet.

## Les cinq points

| point du contrôle | cause trouvée | ce qui est fait |
|---|---|---|
| (a) en PORTRAIT aucun gain | le pas du balayage était plafonné à 1,3 × le rythme relevé « pendant que le volet couvrait » ; ce relevé courait jusqu'au lever et prenait les images lourdes de `rejoueAttend` : pas de 43-65 ms, soit 40-47 % d'une grille portrait d'un coup | le relevé ne prend plus que la MONTÉE du volet (150 ms, le rythme du menu) ; le pas est plafonné à ce rythme (17 ms au moins), ou à la médiane des 5 dernières images du retrait si la course tourne plus lentement, **34 ms au plus** (la cadence 30 du téléphone) |
| (a) la scène reste lourde après les deux images régulières | la chauffe du niveau neuf (`CHAUFFE_R.t`, le monde dessiné une fois hors écran) tombait PENDANT le retrait | elle part à la 1re image après `fn`, sous le volet plein ; le lever attend qu'elle soit passée (toujours 450 ms au plus) |
| (b) le saut borné à 43 %, pas supprimé | idem (pas trop grand) | une image lourde avance le balayage d'UN pas d'image régulière : le saut ne dépasse plus le pas d'une image à 30 i/s (≈ 27 %). Une image à 60 i/s = 14 % |
| (c) le doigt avalé pendant l'attente du lever | `#wipe.in` a `pointer-events:auto` | à la 2e image après `fn` (l'instant où l'ancien code levait), le volet laisse passer le doigt (`style.pointerEvents='none'`) ; `_on` reste vrai, un 2e volet reste ignoré. `dbgTransitions().doigt` = cet instant |
| (d) `dbgTransitions()` périmé sous `?sans=` | les relevés n'étaient faits que sous `TRANS_ON` | relevés dans les deux modes (attente, sortie, doigt, images du retrait, pire, lourdes, saut, coupé) ; seul le geste dépend de `TRANS_ON`. `dbgTransitions({on:false/true})` bascule dans la même page (le banc entrelace ainsi) |
| (e) `passe.sh` appelle `timeout` | n'existe pas sur ce Mac | chien de garde shell (540 s, SIGTERM ; le banc tue le groupe de SON Chrome et efface son profil et son fichier pgid) |

Le saut est maintenant mesuré en AIRE (cases × leur cran), plus en nombre de cases : une case au plus petit cran comptait comme une pleine.

## Preuve au banc Chrome (exécutée le 20/11)

`sh outils/banc-transitions/passe.sh <étiquette> 10 [--portrait]` : Chrome sans fenêtre, muet, iPhone 13 Pro (`?tel=1&appareil=iPhone14,2&palier=2`),
processeur ×4, 10 tours ENTRELACÉS dans la même page (pair = avant, impair = après) : JOUER → MORT → REJOUER → MENU. 5 essais avant / 5 après.
Mac chargé (charge 19-26, un autre banc tenait la 2e place du verrou). Bilan : `python3 outils/banc-transitions/bilan.py outils/banc-transitions/mesures/{paysage5,portrait5}.json`.

« saut » = plus grand saut du balayage (% de l'écran découvert d'une image à la suivante, relevé du jeu) ; « > 50 » = images > 50 ms de la page pendant le retrait (total des 5 essais) ;
« pire » = pire image de la page pendant le retrait ; « retrait » = lever → volet vidé (médiane).

| | saut (5 essais) | > 50 ms (Σ) | pire | retrait |
|---|---|---|---|---|
| PAYSAGE REJOUER avant | 39 · 57 · 27 · 22 · 14 | 12 | 183 ms | 470 ms |
| PAYSAGE REJOUER après | 26 · 27 · 27 · 15 · 26 | **4** | **83 ms** | 489 ms |
| PAYSAGE MENU avant | 33 · 14 · 14 · 27 · 39 | 8 | 167 ms | 481 ms |
| PAYSAGE MENU après | 14 · 14 · 26 · 25 · 25 | **3** | 133 ms | 578 ms |
| PORTRAIT REJOUER avant | 37 · 38 · 14 · 49 · 39 | 15 | 167 ms | 472 ms |
| PORTRAIT REJOUER après | 28 · 14 · 21 · 25 · 14 | **9** | **67 ms** | 548 ms |
| PORTRAIT MENU avant | 39 · 49 · 14 · 14 · 24 | 8 | 217 ms | 485 ms |
| PORTRAIT MENU après | 14 · 25 · 28 · 27 · 14 | **3** | **83 ms** | 548 ms |

- Le saut ne passe plus 28 % (avant : jusqu'à 57 % en paysage, 49 % en portrait). Il n'est pas à 0 : 14 % = le pas d'une image à 60 i/s, 25-28 % = le pas d'une image à 30 i/s.
- Les images > 50 ms pendant le retrait baissent de 2 à 3 fois, sans aller à zéro (la course roule dessous ; des images de 67-83 ms restent, elles ralentissent le balayage au lieu de le faire sauter).
- Le prix : le volet se lève un peu plus tard (attente médiane +7 à +146 ms selon la transition) et le retrait dure +19 à +97 ms de plus (médianes). La course part au même instant qu'avant ; le doigt repasse à la 2e image comme avant (`doigt`, ex. paysage REJOUER après : 127-339 ms après `fn`, avant : au lever).
- (c) vérifié au relevé : en après, `doigt` < `attente` à chaque essai ; en avant, `doigt` = `attente`. Pas vérifié au vrai doigt (aucun toucher simulé pendant l'attente).
- Essais intermédiaires (non gardés) : pas plafonné à 17 ms seul → saut 14 % partout mais retrait jusqu'à 790 ms (la course tourne à ~30 i/s, le balayage durait deux fois plus) ; plafond 50 ms → sauts de 39 % revenus. 34 ms est le compromis retenu.

## Sans navigateur

`node outils/banc-transitions/balayage.cjs` (vrai code, fausse page ; sortie 1 si l'après saute plus que l'avant) : sortie 0. Relance ×4 (167·117·67 ms) : saut d'aire 47 % → 14 %,
paysage et portrait ; « lourd sans fin » (80 ms pendant 1 s) : 58 % → 28 %, retrait 567 → 1 247 ms.

## Pas fait / pas prouvé

- Rien sur le vrai téléphone, rien sur main. JOUER depuis l'accueil et MORT ne passent pas par ce volet dans le banc (rien à mesurer).
- Les temps sont bruités (Mac chargé, deux bancs à la fois) : les COMPTES (saut, > 50 ms) sont plus sûrs que les ms.
