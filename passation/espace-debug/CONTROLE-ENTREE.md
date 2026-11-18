# CONTRÔLE ADVERSE de la correction D1 (l'entrée dans l'espace) — 2026-11-18

**VERDICT : FUSIONNABLE**, avec les réserves de la fin. Je n'ai rien modifié dans `code/`. Je n'ai rien commité.

## Comment j'ai contrôlé
- **La base (build 121)** vient de `git archive a42e9ec50`, dans `scratchpad/ctl/base`. On n'a utilisé ni stash ni checkout.
  - Constat en passant : l'`index.html` de HEAD n'est **pas** assemblé depuis ses morceaux (12 818 552 octets, contre 13 140 592 pour les morceaux).
  - `index-base121.html` = les morceaux de HEAD assemblés, **à l'octet près**.
  - Conséquence : le diff de l'`index.html` du worktree (+2495 / −375) contient, en plus de D1, le réassemblage des fusions qa/* déjà présentes dans `code/`. Ce n'est pas un défaut de D1.
- **Mes outils**, tous dans `scratchpad/ctl/` :
  - `charge.cjs` : une copie de `generation-charge.cjs` qui prend `RACINE` et une horloge compteur.
  - `entree-ctl.cjs` / `entree-strict.cjs` : ma mesure de l'entrée.
  - `bit.cjs` : l'empreinte par route, en pleine précision.
  - `profil.cjs`, `cmpmods.cjs`, `temps.cjs`.
- **Ma mesure de l'entrée** se fait sur la **dalle jouée**, c'est-à-dire refaite comme `pisteRoute` : courbe Catmull-Rom, normale interpolée puis lissée (σ 20-80 m). Ce n'est pas `TORD.N` comme `entree-test.cjs`.
  - Vitesse : v = vPalier × élan.
  - Grandeurs mesurées :
    - début du 1er module (marque `fig`) ;
    - 1er point où le dévers dépasse 25° ;
    - 1er changement de pente de plus de 20°/s (fenêtre de 0,2 s) ;
    - 1er envers (Ny < 0) ;
    - roulis, lacet et Ny min dans [0 ; 2,6 s].
- **Les graines** sont les miennes, différentes de 101-160 :
  - suite mulberry(31337 + 7919·p) en série (sac vivant, 30 routes de rodage) ;
  - 99001 en graines isolées (`raz()` avant chaque route) ;
  - 7700 pour les ouvertures forcées.

## 1. Le défaut ne se rejoue plus (200 routes par palier, paliers 0/5/10/15/20/27)
Sac vivant en série, même graines, build 121 → neuf. « < 2,6 s » compte les routes sur 200 :

| palier | 1er module : min (s) | dévers > 25° : min (s) | routes < 2,6 s (module / dévers / pente) | 1er envers : min (s) |
|---|---|---|---|---|
| 0 | 1,67 → 3,20 | 0,66 → 2,64 | 72/98/67 → 0/0/2* | 4,29 → 5,82 |
| 5 | 1,36 → 3,13 | 0,65 → 2,62 | 68/89/72 → 0/0/0 | 3,97 → 5,80 |
| 10 | 1,16 → 2,92 | 0,65 → 2,61 | 75/105/66 → 0/0/0 | 3,78 → 5,57 |
| 15 | 1,21 → 2,89 | 0,66 → 2,59 | 65/97/60 → 0/1**/0 | 3,83 → 5,50 |
| 20 | 1,36 → 2,82 | 0,66 → 2,64 | 67/97/59 → 0/0/0 | 3,94 → 5,41 |
| 27 | 1,44 → 2,79 | 0,62 → 2,67 | 50/81/48 → 0/0/0 | 3,93 → 5,29 |

\* Ces deux routes ont une fenêtre de 0,2 s qui commence à 2,56 s : le changement de pente est celui de l'ouverture, après l'entrée.
\*\* Dévers à 25° atteint à 2,59 s, sur la dalle lissée.

**Graines isolées** (200 par palier) : même tableau.
- 1er module ≥ 2,79 s.
- Dévers > 25° ≥ 2,61 s.
- 0 route sous 2,6 s, sauf 2 au palier 0 pour la pente (fenêtre à 2,57 s).

**Dans [0 ; 2,6 s] strictement** (fenêtre entière dans l'entrée), build 121 → neuf :

| grandeur | build 121 | neuf |
|---|---|---|
| dévers max | 53-62° | 21-23° |
| changement de pente max | 59-84°/s | 6-9°/s |
| lacet max | 57-72°/s | 32-38°/s |
| Ny min | 0,21-0,56 | 0,72-0,74 |
| roulis max | 40-44°/s | 37-40°/s |

**Ouvertures forcées** (`?orbouv=`, 50 routes isolées × 6 paliers chacune, 2100 routes en tout) : pour direct, mur, plongeon, bosse, grand, sserre et demiS, à tous les paliers :
- 1er module ≥ 2,79 s ;
- dévers > 25° ≥ 2,59 s (grand, palier 15) ;
- pente > 20°/s ≥ 2,57 s ;
- 1er envers ≥ 5,29 s ;
- Ny min ≥ 0,725.

**Pire cas pour un joueur 30 % plus rapide que la règle :** le 1er module vient à 2,15 s et le dévers dépasse 25° à 1,99 s. Les deux restent après la fin du warp (1,9 s).

## 2. `?sans=entreetenue` = build 121 au bit près
Je compare l'arbre neuf avec `?sans=entreetenue` et la base. L'empreinte de chaque route couvre :
- ctrl0 (sortie de genCtrl), les marques, ctrl et N (pisteTordPropre), `TORD.info` ;
- la dalle jouée : un point sur 7, avec sa normale, et les marques dans la dalle.

Résultats :
- **Série**, graines 55555, paliers 0/10/27, 360 routes : identique (`830f52e91674bdb1`), y compris avec la base sans paramètre.
- **Isolées**, graines 8888, paliers 5/15/20, 360 routes : identique (`647b3cd7f4e40738`).

## 3. Les autres cartes sont inchangées
- **`?sans=uniques`**, série, 360 routes : identique (`531aaafa56106a4d`).
- **`empreinte.cjs graines=1-40`** : ville, crypto et nuages identiques. L'espace change, c'est voulu. Vitrée plante des deux côtés (`VIT_SOL is not defined`), ce qui existait déjà.
- **Avec `SEARCH=?torsion=hasard`** : tout est identique.
- **Jade** (`opt-empreinte.cjs`, 24 graines × paliers 0/10/20) : identique.
- **`grotte.cjs 10 1-6`** et **`canyon.cjs`** : identiques.
- **`espaces-bit.cjs`** : 0 coordonnée différente.

## 4. Aucun module ne se dégrade (crible 300 routes × paliers 0/10/20/27, base=4242, mes graines, les deux arbres)
- **Routes** :
  - 0 exception, 0 NaN ;
  - Ny au départ (0-300 m) : 0,38 / 0,53 / 0,70 / 0,70 → 0,725 / 0,724 / 0,734 / 0,739 ;
  - arrivée inchangée (≥ 0,995) ;
  - L médiane +2,4 à +4,4 %.
- **Modules par route** (`unicite.cjs`, n = 300) :
  - 4,88 → 4,88 / 4,00 → 3,98 / 3,26 → 3,32 / 2,84 → 2,85 ;
  - 0 redite partout, avant comme après.
- **`uniques/test.cjs`** : tout tient.
  - Jade identique.
  - Espace palier 0 : formes de dessus 29 → 27 (seuil 20), écart-type de la pente à 300 m 12,9 → 11,7°.
  - Espace palier 10 : formes 17 → 20, modules vus 28 → 29.
- **Zones refusées** : toutes sont la plongée de la fin (désorbitage), refusée dans 100 % des cas des deux côtés (même conception). Au palier 20, la fin « module » passe de 267 à 221 routes : les fins prévues (virage, désorb) trouvent plus de place.
- **Géants** : tous posés, décalage 0 m, 0 route dans la roche ni sous la surface de la lune.
- **Par module** (`cmpmods.cjs`) :
  - Aucun « > 90°/s » nouveau, aucun Rh < rP nouveau, aucun demi-tour de la normale.
  - Roulis max partout ≤ 64,3°/s, contre ≤ 66,2 sur le build 121.
  - Écarts signalés, tous sous les bornes et sur des tirages différents :
    - plongée palier 0 : 58,9 → 64°/s, 2/144 routes au-dessus de 60 (0/139 avant) ;
    - lacet palier 0 : roulis 32 → 39,5, Rv min 132 → 108 ;
    - bosses palier 0 : crêtes Rv < rP sur 7/27 routes au lieu de 3/21, mais Rv min 55 m contre 57 avant (défaut qui existait déjà, rP = 63) ;
    - chicane palier 27 : 38,9 → 46,4°/s.
  - Aucun de ces écarts ne se trouve dans l'entrée.

## 5. Coût
- **genCtrl seul** (`generation-temps.cjs 150`, deux passages alternés) : médiane 9-15 ms des deux côtés, sans écart mesurable.
- **genCtrl + pisteTord**, horloge compteur, meilleur de 2 passages : +4 à +6 % (26,4 → 27,6 / 31,6 → 33,2 / 35,9 → 37,4 / 31,6 → 33,4 ms). C'est cohérent avec une route 3-4 % plus longue. La charge du Mac était de 3,6 à 6,8.
- **Reprises d'unicité** (crible, horloge réelle) : moyenne 0,24 / 3,7 / 46 / 128 → 0,14 / 0,9 / 22 / 110.

## 6. Gardes et relecture
- Tout est vert :
  - `assembler --verifier` : 347 morceaux d'accord ;
  - `garde-demarrage` : OK ;
  - `garde-allege` ;
  - `garde-charte` : OK.
- **vm.Script** : les 21 balises compilent une fois les commentaires HTML retirés, dans le neuf comme dans `index-base121`. Le 5e « script » en échec est le faux signalé par l'auteur : la ligne 1992, `IL EST DANS SON PROPRE <script>`, dans un commentaire.
- **Relecture du diff** :
  - sections datées, en français, aucun `//` ajouté ;
  - aucune couleur ni matière touchée ;
  - `sw.js` et `index-base121.html` intacts ;
  - nouvel état `ORB5.cE` / `OU.ent` : remis à zéro dans `genCtrl1` et lu seulement sous `D2===ORB5` (la houle via `PRF`, qui n'existe que pour ORB5).

## Réserves (pas bloquantes, à savoir)
1. **Le roulis sous le warp reste à 37-40°/s** (build 121 : 40-44). La dalle de la courbe d'entrée se couche jusqu'à ~20° en 0,6-0,9 s. Exemple : graine 231762951, palier 0, isolée, de 0 à 19,7° entre 0 et 0,8 s. Le lacet de la courbe vaut jusqu'à 32-38°/s, puisque son rayon est de 4 rP. C'est moins qu'avant, mais pas « rien ».
2. **Le diff d'`index.html`** embarque le réassemblage des fusions qa/* (index de HEAD désynchronisé). Ce qui part dans le commit est plus large que D1.
3. **`orbUForme`** coupe à `OU.ent` en distance horizontale. C'est sans effet tant que le ctrl de genCtrl est plat, ce que je n'ai pas vérifié pour toutes les routes.

## Pas vérifié
- Rien dans Chrome ni en jeu : warp réel, pilote, pré-bâti par tranches (une génération intercalée entre genCtrl et pisteTord écraserait `cE` comme `s0U` et `prof`), `?routeverif=1`, `piste-empreinte-ab.cjs`.
- Le départ direct (vitesse de lancement plus basse, donc une entrée plus longue en temps).
- Rien sur le téléphone. `sw.js` n'est pas incrémenté (consigne).

## Commandes (S = scratchpad/ctl)
```
git archive a42e9ec50 | tar -x -C $S/base
node $S/entree-ctl.cjs n=200 mode=serie|isole [base=99001] ; RACINE=$S/base node $S/entree-ctl.cjs n=200 mode=serie
node $S/entree-ctl.cjs "search=?orbouv=<o>" n=50 rodage=5 mode=isole base=7700   (o = direct mur plongeon bosse grand sserre demiS)
node $S/entree-strict.cjs n=200 paliers=…  (et RACINE=$S/base)
node $S/bit.cjs "search=?sans=entreetenue" [mode=isole base=8888 paliers=5,15,20] ; RACINE=$S/base node $S/bit.cjs … ; cmp
node $S/bit.cjs "search=?sans=uniques" (les deux arbres)
node outils/banc-espace/generation-crible.cjs paliers=0,10,20,27 n=300 base=4242 sortie=… (les deux arbres) ; generation-tableau.cjs quoi=routes|mods|racc|geants ; node $S/cmpmods.cjs
node outils/banc-routes/uniques/test.cjs ; unicite.cjs carte=espace n=300 palier=0|10|20|27 (les deux arbres)
node outils/banc-routes/empreinte.cjs graines=1-40 (et SEARCH='?torsion=hasard') ; grotte.cjs 10 1-6 ; canyon.cjs ; banc-jade/opt-empreinte.cjs . ; espaces-bit.cjs
node outils/banc-espace/generation-temps.cjs 150 ; node $S/temps.cjs (les deux arbres, alternés)
node code/assembler.cjs --verifier && node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh
```
