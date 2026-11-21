# Contrôle adverse du lot F, tour 2 (20/11/2026, 17:55-18:10)

**Verdict : REFUSÉ.** Le code reste sain et tous les chiffres tiennent : identités, 60 m d'air libre, aucun ajout dans la route, coût au téléphone sous +10 %, 0 programme compilé en course.
**Mais l'image ne passe toujours pas, et c'est elle qui décide.** Au tour 2, la nuit noire est devenue optionnelle (`?plus=villenoire`). Au téléphone, photographiés de la même façon, avant et après redeviennent **la même image à l'œil**, route comprise : des tours filées roses et cyan, une route claire. Le 3/11, lui, a des tours nettes à fenêtres, une route noire et un ciel violet profond.
L'auteur le dit lui-même (LOT-F.md, tour 2) : « Le lot seul ne peut pas rendre l'image ».

Je n'ai pas touché au code du lot. Bancs dans le scratchpad, sous `lot-f/controle/t2/` :
- `gen.sh`, `decor-x.cjs` (le `decor.cjs` du tour 1, avec `LVL.cur` réglable) et `generation.txt` ;
- `passe.sh` (ports 8951-8953 et 9951, profils `cc-banc-ctlf2-*`), `planche.py`, `stats.py`, `comptes.cjs`, et `chrome/<passe>/`.

« Avant » = HEAD 1a89d60fd, réassemblé : `controle/head` (son `code/` est égal à HEAD, `--verifier` ✔) et `controle/avant`, servis tels quels.
**Graines neuves de ce tour** : 3001-3080 (Node), 3003 / 3017 (844), 3011 (390) et 3007 (ordinateur).

## 1. Identités, périmètre, gardes : conformes
- **Périmètre** : `git diff --name-only` donne `index.html`, `jade-balade.js`, `ville-etages.js` et `equilibre-maps.js`. Rien dans `sw.js`, `niveaux.js`, `cryptocity-*` ni les fichiers de rendu réservés.
- **Nuit noire** : le diff d'`equilibre-maps.js` ne retire `villeOrage` que si `VILLE_ETAGES` est vrai et que `?plus=villenoire` est présent. Sans ce drapeau, l'équilibre doux est intact.
- **Routes** (`empreinte.cjs graines=1-12`) :
  - ville 77f22cbf4933 / 7aec17e77c92 ;
  - crypto 5447610bd8f2 / eae97981f833 ;
  - nuages 469d52aff855 / 2e1661d8fe93 ;
  - espace 9c99fae61d38 / ea2d9e750351 ;
  - avec `SEARCH='?sans=villeetages'` : ville 17b89297a6b8 / 9dc6766ea34f ✔.
- **Décor, graines 3001-3080, paliers 0, 10 et 20, HEAD contre lot** :
  - `?sans=villeetages` : 559e8aae161b = 559e8aae161b ; sous ALLEGE, f679a8d933f1 = f679a8d933f1 ✔ ;
  - `?sans=villedecor` : 751cf4028425 = 751cf4028425 (= HEAD sans drapeau) ; sous ALLEGE, 5b6ffdabdb90 = 5b6ffdabdb90 ✔.
- **Crypto City de jour sur la carte ville** (lot J, `LVL.cur.cj=1`, graines 3001-3020, p0 et p10) : HEAD = lot = 3d7fd9665f33 ✔.
  - Crypto City (`id:'crypto'`) et la vitrée sont exclues par `veActif()` (`c.id==='ville'&&!c.crypto&&!c.vitre`), par `!CR` dans `VED9` et par le drapeau `plus=` de la nuit. C'est **lu**, pas exécuté : la vitrée ne tourne pas dans le banc Node (`vitreAplanir` manquant).
- **Noms neufs** : `VE_DECOR3`, `veDecor3`, `VE_RANGS`, `VE_HAUT`, `VE_LIBRE`, `VED9` et `hV9` sont chacun déclarés une seule fois dans index.html.
- **Gardes** : `garde-demarrage` OK (21 scripts), `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔ (349 morceaux, 13 211 867 octets).

## 2. Génération : vrai buildVoxCity en Node, 80 graines neuves (3001-3080), paliers 0 / 10 / 20

| | HEAD | lot F |
|---|---|---|
| tours / route | 809, 997, 1281 | 973, 1222, 1619 |
| sous ALLEGE | 525, 661, 884 | 659, 849, 1157 |
| pendues | 10,3, 13,2, 10,1 | 19,0, 25,5, 16,8 |
| **dans** la route | 0, 2, 0 | 0, 2, 0 (**égal** à HEAD ; ALLEGE pareil) |
| frôle | 8, 9, 0 | 8, 8, 0 |
| béton sous 60 m d'air libre | 865 / 1206 / 745 (mini 41 m) | **0 / 0 / 0** (mini 60-61 m), ALLEGE pareil |
| autres volumes sous 60 m | 367 / 605 / 302 | 23 / 35 / 8 |
| règle des 14 m hors SP9 | 58 / 65 / 17 | 58 / 65 / 17 (égale) |
| béton dans l'air des sauts | 10 / 36 / 0 | 10 / 36 / 0 (égal) |

- Les 2 volumes « dans » la route au palier 10 existent aussi dans HEAD : ils ne viennent pas du lot. Je ne les ai pas localisés.
- Le défaut des 59,x m du tour 1 est corrigé.
- Voiture : elle reste visible sur les 66 photos du téléphone et de l'ordinateur prises dans ce tour. Je n'ai vu aucune tour devant elle.
- Tranche du bâti (Node, Mac chargé, autre banc en parallèle) :
  - sans allègement : max 23 ms contre 12 ms pour HEAD, p90 5,1 contre 5,1 ;
  - ALLEGE : max **103 ms** contre 50 ms, p90 7,4 contre 5,3.
  - Les pointes doublent encore, comme au tour 1. Elles restent bruitées, mais le sens se répète d'une prise à l'autre. **Non tranché ; à mesurer dans le jeu et sur iPhone.**

## 3. Coût Chrome (renderer.info, une image auditée toutes les 4 s, 6 points par jeu, mêmes graines avant / après)

| | 3/11 | avant | après | après + nuit |
|---|---|---|---|---|
| tél 844, graine 3003 | 260 / 615 k | 103 / 286 k | 109 / 296 k (+6 % / +3 %) | 103 / 294 k |
| tél 844, graine 3017 | 243 / 600 k | 118 / 312 k | 119 / 315 k (+1 % / +1 %) | — |
| tél 390, graine 3011 | 266 / 741 k | 110 / 290 k | 115 / 309 k (+5 % / +7 %) | 110 / 302 k |
| ordinateur 1280×720, `poste=max`, graine 3007 | 268 / 698 k | 259 / 855 k | 258 / 850 k | 258 / 848 k |

- Au téléphone, tout reste ≤ +10 % aux mêmes graines. Les maxima sont à +7 % au plus (374 k contre 351 k).
- Programmes constants sur toute la course : 154 → 154 au téléphone, 177 → 177 à l'ordinateur. **0 programme compilé en course.**
- Bâti au téléphone : 28 → 35 k, 35 → 44 k et 32 → 40 k triangles, pour +0 à 2 appels.
- Aucune erreur JS, aucune mort.
- À l'ordinateur, les murs du lot ajoutent du bâti (55 → 67 k triangles) sans changer le total.

## 4. L'image, qui décide (photos regardées une à une)
Planches dans `planches/` :
- `controle-f2-t844-jeu.jpg` et `controle-f2-t844-net.jpg` ;
- `controle-f2-t844b-jeu.jpg`, `controle-f2-t390-jeu.jpg`, `controle-f2-pc-jeu.jpg`.

Colonnes : 3/11 (`aa160d07f`, sa route), avant, après (le lot par défaut), après + `?plus=villenoire`.

Conditions, identiques pour toutes les colonnes : ville, pluie, violet, `dbgAuto(1,0,{nit:0})`, HUD caché, une photo toutes les 4 s. Les « net » sont prises avec `dbgNet(true)` et `dbgFlou({s:0})`.

Ce que je vois :
- **844, image du jeu (graines 3003 et 3017).** Avant et après sont **la même image** : même route claire bleu-lilas, mêmes tours filées en traînées roses et cyan, même ciel. Seules les lignes 1 montrent quelques tours de plus en haut, et il faut chercher. Le 3/11 se reconnaît au premier coup d'œil : route noire, tours sombres et nettes à fenêtres.
- **844 net.** Après a des murs un peu plus fournis (lignes 1 et 3). C'est le même cadrage, la même route claire, le même rose. On est loin du 3/11.
- **390×844.** Avant et après sont quasi identiques ; après a un peu plus de tours en ligne 1. Rien d'« enclavé ».
- **Ordinateur.** C'est la seule vue où le lot se voit : des murs de tours à fenêtres plus pleins des deux côtés (lignes 1, 3 et 4). Mais la route reste claire et le rose et le cyan saturés : ce n'est pas le 3/11.
- **Avec `?plus=villenoire`** (colonne 4), la route redevient noire, ce qui rapproche le bas de l'image du 3/11. Les tours restent filées au téléphone, et cette nuit est hors du lot par défaut (décision de Sacha).
- **La route reste lisible partout.**

Mesures (`stats.py`, luma 0-255 ; haut = 45 % du haut de l'image, bas = 40 % du bas ; image du jeu) :

| | luma haut | luma bas | noirs du bas | netteté du haut |
|---|---|---|---|---|
| 844, graine 3003 : 3/11 / avant / après / + nuit | 27 / 44 / 45 / 36 | 31 / 65 / 56 / 38 | 78 / 24 / **27** / 69 % | 5,5 / 2,4 / **2,8** / 2,7 |
| 844, graine 3017 : 3/11 / avant / après | 30 / 47 / 54 | 34 / 65 / 60 | 77 / 28 / **39** % | 7,1 / 2,4 / **2,9** |
| 390, graine 3011 : 3/11 / avant / après / + nuit | 31 / 47 / 50 / 38 | 46 / 74 / 65 / 48 | 62 / 22 / **27** / 55 % | 7,6 / 3,3 / **4,0** / 3,7 |
| ordinateur, graine 3007 : 3/11 / avant / après / + nuit | 34 / 48 / 49 / 39 | 32 / 58 / 59 / 34 | 76 / 22 / **24** / 75 % | 14,8 / 11,2 / **14,0** / 12,8 |

Par défaut, après colle à avant (luma, noirs, netteté) et reste loin du 3/11 sur chaque mesure.

## Défauts
1. **BLOQUANT : l'image n'est pas revenue à la ville du 3/11. Au téléphone, avant et après sont identiques à l'œil sur les trois planches (deux graines en 844, une en 390).**
   - Ce qui rend le 3/11 tient à trois choses : le flou (fichier réservé, non appliqué), la nuit noire (derrière un drapeau, en attente de Sacha) et le décor (ce lot).
   - Le décor seul, qui est tout ce que le lot livre par défaut, ne se voit qu'à l'ordinateur.
2. **Mineur, non tranché.** Sous ALLEGE en Node, la pointe de la tranche du bâti double à nouveau (103 contre 50 ms ; p90 7,4 contre 5,3). Le Mac était chargé, donc c'est bruité. C'est la deuxième prise de suite dans ce sens, à mesurer dans le jeu et sur iPhone.
3. **Note, pas du lot.** 2 volumes dans la route au palier 10 sur les graines 3001-3080, **à égalité avec HEAD** : c'est un défaut du socle, à signaler au propriétaire de la ville.

## Pas vérifié
- La vitrée, à l'image et en Node : le banc ne la tire pas. L'exclusion est lue dans le code, pas exécutée.
- Crypto City à l'image. Crypto City de jour n'est vérifiée qu'en Node (empreinte égale), à travers `LVL.cur.cj`.
- Les sauts joués et le nitro en Chrome, les paliers 10 et 20 en Chrome (seulement en Node).
- L'iPhone réel, et la tranche du bâti dans le jeu.
- Le correctif du flou (`en-chantier/flou-v2-uSfx.diff`) : ni appliqué ni rejoué par moi, donc le verdict ne porte pas sur « lot + flou V2 ».
- Le 3/11 roule sa propre route : la comparaison avec lui se fait à l'impression, pas à la même abscisse.

Nettoyage :
- verrou « ville-cyber-f » pris et rendu à chaque passe (17:56-17:59, 17:59-18:01, 18:01-18:04, 18:04-18:05). Les deux places sont tenues aujourd'hui par une autre session ;
- profils `cc-banc-ctlf2-*` supprimés, aucun Chrome restant.

---

# Contrôle adverse du lot F, tour 1 (20/11/2026)

**Verdict : REFUSÉ.** Le code est sain : identités tenues, le coût au téléphone est égal et rien n'entre dans la route.
Mais l'image ne passe pas. Au premier coup d'œil, on n'est pas revenu dans la ville du 3/11 :
- photographiés de la même façon, avant et après sont la même image, l'après n'étant que plus sombre en bas (la route) ;
- les tours restent des traînées roses et cyan, floues ;
- au 3/11, les tours sont nettes, avec des fenêtres ambre, sous un ciel violet profond.

L'auteur l'écrit lui-même dans LOT-F.md, § « En bref ».

Je n'ai pas touché au code du lot. Mes bancs sont dans le scratchpad de la session, sous `lot-f/controle/` :
- `decor.cjs` : copie du banc Node du lot D, lue en entier ;
- `page-c.cjs` et `passe.sh` : banc CDP, avec mes ports, mon profil et mes graines ;
- `planche.py`, `stats.py`, `comptes.cjs`.

« Avant » = **HEAD 1a89d60fd réassemblé**, servi tel quel. Ce n'est pas le lot avec des drapeaux.

## 1. Identités et gardes : conformes
- **Diff dans le périmètre** : quatre fichiers seulement, `jade-balade.js`, `ville-etages.js`, `equilibre-maps.js` et `index.html`.
  - Ni `sw.js`, ni Crypto City, ni un fichier de rendu réservé.
  - `git diff` affiche 3 342 lignes pour `index.html`. C'est un artefact de diff : HEAD réassemblé dans un dossier à part, puis comparé au fichier, ne laisse que 45 lignes, celles de `code/`.
- **Empreintes des routes** (`empreinte.cjs graines=1-12`) :
  - ville 77f22cbf4933 / 7aec17e77c92 ;
  - crypto 5447610bd8f2 / eae97981f833 ;
  - nuages 469d52aff855 / 2e1661d8fe93 ;
  - espace 9c99fae61d38 / ea2d9e750351 ;
  - avec `?sans=villeetages` : ville 17b89297a6b8 / 9dc6766ea34f ✔.
- **Décor du socle** (`SEARCH='?sans=villeetages'`, graines **2001-2080**, paliers 0, 10 et 20) : HEAD et le lot sont égaux au bit près.
  - sans allègement : 3ff4bfa4abf7 = 3ff4bfa4abf7 ;
  - ALLEGE : 776bf0dbf927 = 776bf0dbf927 ✔.
- **Crypto City et vitrée** :
  - `VED9` exige `!CR` et `veActif()`, qui exclut `crypto`, `vitre`, `piste`, `camp` et `PARK` ;
  - `villeOrage` ne sert qu'à `SF_CARTES.ville` (`niveaux.js` l.75) ; NIV_CRYPTO tourne sur `bullrun` et ses météos ;
  - **non photographiées** (la vitrée ne se tire pas au banc).
- Aucune `const` en double : `VE_DECOR3`, `veDecor3`, `VE_RANGS`, `VE_HAUT`, `VE_LIBRE`, `VED9` et `hV9` n'ont chacun qu'une déclaration dans index.html. `VILLE_ETAGES` est défini avant `equilibre-maps.js` (ORDRE l.100 et 162).
- Gardes : `garde-demarrage` OK (21 scripts), `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔ (349 morceaux, 13 211 856 octets).

## 2. Génération : vrai buildVoxCity en Node, graines neuves 2001-2080, paliers 0 / 10 / 20

| | HEAD | lot F |
|---|---|---|
| tours / route (p0, p10, p20) | 804, 999, 1279 | 968, 1220, 1617 |
| idem sous ALLEGE | 525, 669, 878 | 660, 848, 1154 |
| pendues | 8,2, 11,9, 10,8 | 17,3, 24,2, 17,7 |
| **dans** la route (volumes et néons) | 2, 2, 0 | **0, 0, 0** (ALLEGE : 0, 0, 0) |
| frôle | 13, 8, 0 | 13, 8, 0 |
| air libre sous le béton : mini, nombre < 60 m | 41 m, 762 / 1222 / 804 | **59 m**, 21 / 44 / 2 |
| autres volumes < 60 m | 382 / 637 / 426 | 29 / 55 / 7 |
| règle des 14 m hors SP9 | 40 / 67 / 14 | 40 / 67 / 14 (égale) |
| béton dans l'air des sauts (AIRZ) | 19 / 12 / 0 | 19 / 12 / 0 (égal) |

- Rien n'entre dans la route.
- L'air libre est très amélioré, mais quelques volumes restent à 59,x m, sous les 60 m demandés (seuil `b−59`).
- Les sauts ne sont pas gênés plus qu'avant.
- La voiture est visible sur les 72 photos.
- Tranche du bâti (Node, Mac chargé, charge 13-21), sous ALLEGE :
  - p90 égal (3,5-4 ms des deux côtés) ;
  - les pointes sautent d'une prise à l'autre (lot : 13,6 puis 72 ms ; HEAD : 7,9 puis 9,5 ms), donc c'est **du bruit, non tranché**.

## 3. Coût, Chrome, renderer.info, une image auditée toutes les 4 s, 6 photos par jeu

| | avant (HEAD) | après (lot F) | écart |
|---|---|---|---|
| tél 844×390, graine 2003 | 114 appels / 288 k triangles | 109 / 289 k | ≤ +10 % ✔ |
| tél 844×390, graine 2017 | 110 / 277 k | 113 / 284 k | +3 % ✔ |
| tél 390×844, graine 2011 | 98 / 261 k | 99 / 264 k | ✔ |
| ordinateur 1280×720, `poste=max`, graine 2003 | 261 / 870 k | 265 / 907 k | le maximum est gardé |

- **Programmes** : 154 → 154 au téléphone et 177 → 177 à l'ordinateur sur toute la course, donc **0 programme compilé en course**.
- Bâti au téléphone : 33 → 39 k triangles et 24 → 29 k (appels égaux).
- Aucune erreur JS, aucune mort.

## 4. L'image, qui décide

Planches, toutes ≤ 250 Ko, dans `planches/` :
- `controle-f-t844-jeu.jpg` et `controle-f-t844-net.jpg` (graine 2003) ;
- `controle-f-t844b-jeu.jpg` (graine 2017) ;
- `controle-f-t390-jeu.jpg` (graine 2011) ;
- `controle-f-pc-jeu.jpg` (graine 2003).

Colonnes : 3/11 (aa160d07f, sa route), avant, après.

Conditions de prise, identiques pour les trois :
- `dbgAuto(1,0,{nit:0})`, HUD caché, une photo toutes les 4 s ;
- ville, pluie, violet ;
- les « net » sont prises avec `dbgNet(true)` et `dbgFlou({s:0})`.

Ce que je vois :
- **844, image du jeu (deux graines).** Après ressemble trait pour trait à avant : même cadrage, mêmes murs filés en traînées rose et cyan par le flou, même ciel. La seule différence visible est la route, plus noire. Au 3/11, on voit tout de suite des tours nettes à fenêtres ambre, des traits de pluie et un ciel violet sombre. **Le lot n'y est pas revenu.**
- **844, image nette.** Après a des murs un peu plus fournis et une route plus sombre. C'est plus proche du 3/11, mais encore très voisin d'avant, et il faut mettre les deux côte à côte pour le remarquer.
- **390×844.** Avant et après sont presque identiques ; après a seulement un bas plus sombre.
- **Ordinateur.** Après est nettement plus sombre qu'avant (route noire, comme au 3/11), mais les tours restent filées et saturées cyan et rose.
- Je ne retrouve pas l'« enclavé » : nulle part une tour au-dessus ou un tunnel d'immeubles qui se lise au premier regard.
- La route reste lisible partout.

Mesures (`stats.py`, luma 0-255 ; haut = 45 % du haut de l'image, bas = 40 % du bas ; image du jeu) :

| | luma haut | luma bas | noirs du bas | netteté du haut |
|---|---|---|---|---|
| 844, graine 2003 : 3/11 | 30 | 31 | 79 % | 8,6 |
| 844, graine 2003 : avant | 47 | 60 | 26 % | 2,7 |
| 844, graine 2003 : après | 45 | 39 | 70 % | **3,1** |
| 844, graine 2017 : 3/11 | 31 | 33 | 74 % | 7,9 |
| 844, graine 2017 : avant | 39 | 55 | 33 % | 2,2 |
| 844, graine 2017 : après | 40 | 33 | 74 % | **2,5** |
| 390 : 3/11 | 30 | 42 | 63 % | 6,3 |
| 390 : avant | 43 | 70 | 21 % | 3,3 |
| 390 : après | 39 | 45 | 59 % | **3,8** |
| ordinateur : 3/11 | 34 | 32 | 79 % | 15,5 |
| ordinateur : avant | 56 | 72 | 18 % | 13,1 |
| ordinateur : après | 41 | 33 | 78 % | 14,0 |

Les chiffres disent la même chose que l'œil :
- seul le **bas** de l'image (la route) rejoint le 3/11, et ce gain vient de la retouche `villeOrage` retirée (`equilibre-maps.js`), pas du décor ;
- le **haut** (les tours) reste flou au téléphone (netteté 2,5-3,8 contre 6-9 au 3/11), comme avant.

## Défauts
1. **BLOQUANT : l'image n'est pas celle du 3/11, et avant/après sont la même image à l'œil, à la route près.** Les rangs plus serrés et les murs ×1,5 ne se voient pas à travers le flou du jeu.
   - L'auteur l'attribue au flou V2 cassé (`triptyque-bloom.js`, fichier réservé). Je ne l'ai pas vérifié, mais c'est plausible : les images nettes s'approchent davantage du 3/11.
   - Tant que ce correctif n'existe pas, le lot ne livre pas ce que Sacha a demandé.
2. **Mineur, décision de Sacha.** La « nuit noire » défait par défaut, pour la carte ville, l'équilibre doux qu'il avait demandé le 06/11. C'est elle qui fait tout le gain visible. Elle est signalée par l'auteur et réversible par `?sans=villenoire`.
3. **Mineur.** Quelques volumes de béton gardent 59,x m d'air libre (21 / 44 / 2 sur 80 routes), sous les 60 m demandés.
4. **Mineur, non tranché.** Les pointes de la tranche du bâti sont bruitées (13 à 72 ms en Node sous ALLEGE contre 8-9,5 ms pour HEAD, p90 égal). À mesurer dans le jeu et sur iPhone.

## Pas vérifié
- Les sauts joués en Chrome, le nitro, les paliers 10 et 20 en Chrome (seulement en Node).
- L'iPhone réel et la tranche du bâti dans le jeu.
- La vitrée et Crypto City à l'image ; Crypto City de jour (lot J absent du worktree).
- Le flou V2 remis : je ne l'ai pas rejoué, donc l'affirmation « avec le flou V2, on s'approche du 3/11 » repose sur les planches de l'auteur.
- Le 3/11 roule sa propre route : la comparaison avec lui est faite à l'impression, non à l'abscisse.

Nettoyage : profils Chrome `cc-banc-ctlf-*` supprimés, aucun processus restant, place du verrou rendue après chaque passe.
