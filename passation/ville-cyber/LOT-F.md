# Lot F : le décor du 3/11 sur la route à étages (20/11/2026)

Rien commité, rien poussé. Worktree `.lots/f` assemblé (`--depuis-morceaux`), gardes vertes. Ni `sw.js`, ni Crypto City (`niveaux.js`, `cryptocity-*`), ni fichier de rendu réservé.
Bancs (Node et Chrome) : scratchpad de la session, `lot-f/enquete/` (`decor.cjs`, `tours-analyse.cjs`, `page-f3.cjs`, `norm.cjs`, `image-stats.py`) et `lot-f/f/` (`chrome-f.sh`, `planche.py`). Le scratchpad avait été vidé : les bancs de l'enquête ont été repêchés dans les transcriptions et rejoués.

## En bref (honnête)
- **Le décor est au niveau du 3/11 en nombres** : 936 tours par route (3/11 : 967, avant : 776), 21,7 tours au pied relevé (21,3 / 11,2), murs des deux côtés à moins de 100 m sur 72 % de la route (77 / 59), 15,7 % de géantes de verre (15,5 / 13,2).
- **La nuit noire** (tour 1 : active par défaut ; **tour 2 : seulement avec `?plus=villenoire`**, voir plus bas) (route L* 12, 75 % de noirs en 844 : 3/11 L* 11, 77 % ; avant L* 31, 3 %).
- **Au téléphone, le coût est égal** : 110 appels / 283 k triangles par image contre 111 / 276 k avant, 0 programme compilé en course.
- **Mais au premier coup d'œil, l'image du jeu n'est PAS encore celle du 3/11.** Le flou de vitesse cassé depuis le 17/11 (fichier réservé, hors lot) file encore les tours en traînées violettes. Avec le flou V2 remis au banc (colonne 5), on s'en approche nettement : tours nettes à fenêtres, route noire et mouillée, ciel sombre. Il reste des différences : nos tours sont plus proches et plus massives, il y a moins de ciel, pas de traits de pluie, et le violet est plus saturé.

## 1. Ce qui est repris du 3/11, et adapté
Le canyon d'aujourd'hui est, au caractère près, celui d'`aa160d07f:code/maps/jade-balade.js`, mais sans rien à reprendre ligne à ligne :
- même formule du toit (l.114) ;
- même pied `min(yLo,yN)−330−vr·120` (l.119) ;
- même `tourLibre` (l.57) ;
- même `villePied` (`ville-v3.js` l.109).

**L'écart du nombre de tours a été isolé** (en Node, par neutralisation) :
- l'air des sauts (AIRZ) rabat les tours qui auraient enjambé la route du dessus : sans AIRZ, on aurait 18,8 pendues au lieu de 11,2 ;
- les emprises des scènes retirent 54 tours ;
- la route est environ 10 % plus courte.

**On rend au canyon ce que ces trois causes lui prennent, sans toucher ni aux sauts ni aux scènes.** Tout est gardé par `veDecor3()`, donc seulement pour la nuit de la carte ville sur la route à étages :
- **`VE_RANGS`** (`ville-etages.js`) : les rangs du 3/11 (`ROWS` l.166 : `[28,40,.9],[100,60,.7],[190,130,.5]`) resserrés, les deux premiers à 100 %, plus un 4e rang.
- **`VE_HAUT` = 1,5** : les murs montent plus haut au-dessus de la route. `tourLibre` relève alors le pied de ceux que la route du dessus traverse dans leur moitié basse : ce sont les tours « à l'envers, transparentes » du 3/11.
- **`VE_LIBRE` = 60 m** (ajouté par moi) : ce pied relevé laisse 60 m d'air au-dessus de la route d'en bas. Le 3/11 et le socle n'en laissent que 44 m.
  - Le seuil d'exclusion de `tourLibre` passe de `b−40` à `b−59` ; avec `b−60`, la tour n'était plus jamais bâtie.
- **Part de verre jugée à la hauteur d'avant `VE_HAUT`** (ajouté par moi, `hV9`) : sinon `villeVerreTour` prend 52 % de géantes au-dessus de 190 m, et la ville passe à 20 % de géantes de verre (façades lilas en bandeaux, filets roses) au lieu des fenêtres ambre et bleues du 3/11.
- **Mât des géantes de verre plafonné** à 12 m sous la route du dessus, comme celui du béton (ajouté par moi). C'était un défaut du socle aussi : 0 à 2 mâts et feux dans la route pour 80 routes.
- **`veDecor3()`** (ajouté par moi) : `VE_DECOR3 && veActif() && !LVL.cur.cj`. Il exclut les météos de jour de Crypto City du lot J (`cj`), absentes de ce worktree, ainsi que la vitrée, `crypto` et le parc.
- **La nuit noire** (`equilibre-maps.js`, reprise de l'auteur interrompu) : sous `VILLE_ETAGES`, la retouche `villeOrage` de l'équilibre doux est retirée. On retrouve ainsi la nuit d'avant le 06/11. `?sans=villenoire` la remet. **Voir les décisions plus bas.**
- Ce qui était correct chez l'auteur interrompu est gardé : `VE_RANGS`, `VE_HAUT` et la place DZ, qui n'efface que les deux premiers rangs, à l'identique sur le socle.
- Drapeaux : `?sans=villedecor` rend le décor du lot E au bit près ; `?sans=villeetages` rend le socle.

## 2. Planches (`planches/decor-*.jpg`, toutes ≤ 240 Ko)
Colonnes, de gauche à droite :
1. 3/11 (`aa160d07f`, sa route) ;
2. avant (HEAD) ;
3. lot F, décor seul (`?sans=villenoire`) ;
4. **maintenant** (lot F) ;
5. maintenant + flou V2 remis dans la page, **au banc seulement**.

Conditions de prise :
- `?tel=1`, ville violette sous l'orage, `dbgAuto(1,0,{nit:0})` ;
- HUD caché, une photo toutes les 4 s ;
- graines 1506 (844×390 et ordinateur) et 1509 (390×844) ;
- avant et maintenant sont pris à ±20 m d'abscisse près ; le 3/11 roule sa propre route.

Fichiers :
- `decor-844-jeu.jpg` : l'image du jeu ;
- `decor-844-net.jpg` : les mêmes instants, sans flou ;
- `decor-390.jpg` et `decor-390-net.jpg` ;
- `decor-pc.jpg` : ordinateur 1280×720, `poste=max`. Le 3/11 n'y a que 3 photos (sa course s'est arrêtée plus tôt).

Ce que j'y vois, sévèrement :
- **844, image du jeu.** La route est enfin noire et mouillée, et les tours forment des murs des deux côtés. Mais le flou brut les file encore : au premier coup d'œil, ce n'est pas le 3/11. Avec le flou V2 (colonne 5), c'est proche : tours nettes à fenêtres, ciel sombre.
- **844, image nette.** Les murs sont plus proches et plus massifs qu'au 3/11. Le 3/11 a plus de ciel, des fenêtres plus fines, des traits de pluie et souvent une route au-dessus dans le champ.
- **390.** C'est la colonne la plus proche du 3/11 (route sombre, ciel violet profond). Une « plaque violette » de pied relevé se voit en haut à s≈1500.
- **Ordinateur.** Plus sombre qu'avant, mais pas encore le 3/11 : flou, saturation.

Mesures sur les photos (`image-stats.py`, 5 moments, haut et bas de l'image) :

| | L* haut / bas | noirs bas | netteté du haut (jeu) |
|---|---|---|---|
| 844 : 3/11 | 13 / 11 | 77 % | 16,2 |
| 844 : avant | 26 / 31 | 4 % | 8,8 |
| 844 : maintenant | 16 / 12 | 75 % | 8,0 |
| 844 : maintenant + flou V2 | 17 / 13 | 74 % | 20,0 |
| 390 : 3/11 | 15 / 19 | 53 % | 19,0 |
| 390 : avant | 19 / 31 | 18 % | 10,6 |
| 390 : maintenant | 15 / 24 | 42 % | 9,2 |
| 390 : maintenant + flou V2 | 14 / 21 | 52 % | 17,0 |
| ordinateur : 3/11 | 14 / 14 | 72 % | 18,3 |
| ordinateur : avant | 20 / 24 | 14 % | 17,7 |
| ordinateur : maintenant | 15 / 15 | 67 % | 20,6 |

## 3. Comptes (`renderer.info`, appels et triangles par image, `norm.cjs`, mêmes graines)

| | avant | maintenant | plafond (+10 %) |
|---|---|---|---|
| tél 844 | 111 / 276 k (max 142 / 350 k) | **110 / 283 k** (max 142 / 358 k) | 124 / 311 k ✔ |
| tél 390 | 105 / 265 k | **103 / 253 k** | ✔ |
| ordinateur `poste=max` | 128 / 427 k | 132 / 449 k | pas de plafond |

- Tours au téléphone : 6 appels avant comme après, 19 k → 25 k triangles.
- Programmes : identiques du début à la fin de la course (154 → 154 au téléphone) : **0 programme compilé en course**.
- Plus longue tranche du bâti (Node vm, `JF.lim`, 80 graines, Mac chargé, donc bruité) :
  - sans allègement : 54 ms contre 31 ms avant (p90 13 contre 9,5) ;
  - ALLEGE : 72 ms contre 38 ms (p90 9,4 contre 9,5).
  - La pointe double environ. Elle n'est **pas mesurée dans le jeu ni sur iPhone**.

## 4. Génération (vrai `buildVoxCity` en Node, graines 401-480, paliers 0 / 10 / 20, avec et sans ALLEGE)

| | avant (lot E) | lot F |
|---|---|---|
| tours / route, p0, p10, p20 | 804, 982, 1267 | 968, 1201, 1598 |
| tours / route sous ALLEGE, p0, p10, p20 | 524, 658, — | 658, 834, 1142 |
| pendues / route | 8,5, 9,7, 10,7 | 16,1, 20,3, 17,1 |
| pendues sous ALLEGE | 7,0, 7,6 | 12,4, 16,8, 14,9 |
| **dans** (volumes et néons dans le couloir de conduite) | 0, 2, 0 | **0, 0, 0** (et 0 sous ALLEGE) |
| frôle | 2, 3, 2 | 2, 3, 2 |
| air libre sous un volume de béton | mini 41 m ; 793 / 909 / 762 volumes sous 60 m | **mini 59,x m** ; 21 / 26 / 3 volumes sous 60 m |

Sur l'air libre :
- le reste sous 60 m, ce sont des arrondis à 59,x m ou d'autres volumes (mâts, scènes) : 31 / 47 / 7 contre 297 / 372 / 278 avant ;
- le lot E et le socle gardent leurs 41-44 m.

Le reste :
- **Règle des 14 m hors SP9** : 58 / 69 / 10, égale à avant (elle ne vient pas du lot).
- **Air des sauts** : volumes de béton au-dessus de `a.y−60` dans l'air d'un saut : 16 / 23 / 0, **égal à avant**. Ce sont des tours du socle (repères et ancres hors `batir`), pas du lot.
- Graines 1-12, palier 0 : 3/11 = 967 tours, 21,3 pendues ; lot F = 936 tours, 21,7 pendues, murs des deux côtés < 100 m sur 72 % (3/11 : 77 %), 1er rang 11,8 tours (3/11 : 8,9), champ avant bouché 52 % (3/11 : 38 %).
- Vols (balistique) : **pas rejoués**, seulement l'air AIRZ, égal à avant.

## 5. Identités
- Routes (`empreinte.cjs graines=1-12`), toutes conformes :
  - ville 77f22cbf4933 / 7aec17e77c92 ;
  - crypto 5447610bd8f2 / eae97981f833 ;
  - nuages 469d52aff855 / 2e1661d8fe93 ;
  - espace 9c99fae61d38 / ea2d9e750351 ;
  - avec `?sans=villeetages` : ville 17b89297a6b8 / 9dc6766ea34f ✔.
- Décor du socle (`?sans=villeetages`, graines 401-480) : HEAD = lot, a2e0c65697a6 (p0/10/20) et 15eb5bf5e6db (ALLEGE, p0/10) ✔.
- `?sans=villedecor` = HEAD : f6239ce5b093 et 190efb87c064 ✔.
- Une seule déclaration de chaque nom neuf (`VE_DECOR3`, `veDecor3`, `VE_RANGS`, `VE_HAUT`, `VE_LIBRE`, `hV9`).
- Gardes : `garde-demarrage` OK (21 scripts), `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔ (349 morceaux).

## 6. Pas vérifié, et décisions pour Sacha
**Décisions :**
1. **La nuit noire défait, pour la ville, une demande de Sacha** : l'équilibre doux du 06/11 (« trop de maps sont sombres et ternes »). Elle est active par défaut (`?sans=villenoire` pour revenir). À lui faire trancher sur la planche : colonne 3 = sans elle, colonne 4 = avec.
2. **Le flou V2 et `NET_NITRO2` cassés depuis 3df790c92** (`triptyque-bloom.js` l.276 et l.308 : les motifs cherchent `uniform float uSafe,uRn;` alors que la déclaration contient `uSfx`) :
   - c'est **le premier écart à l'œil** et il touche toutes les maps ;
   - fichier réservé : au propriétaire du rendu ;
   - sans ce correctif, le lot F ne rend pas l'image du 3/11.
3. **L'autoroute vivante (13/11, `AR_CARTES`, réservé)** éclaircit encore la route. Je ne l'ai pas touchée.

**Pas vérifié :**
- Les photos ont été prises **avant le correctif des mâts** (géométrie seulement : quelques mâts raccourcis).
- La pluie (10 appels au 3/11 contre 2-3) n'est pas reprise : les traits de pluie manquent à l'image.
- Le 3/11 garde plus de ciel et des tours plus fines. Des rangs moins serrés (`[[28,24,1],[80,40,1],…]`, `VE_HAUT` 1,3) ont été essayés en Node : ils ne changent presque rien. Pas retenus.
- Pas vérifiés non plus :
  - les paliers 10 et 20 en Chrome, le nitro, l'iPhone réel, les sauts joués en Chrome ;
  - la vitrée (non tirable par le banc) ;
  - Crypto City de jour (lot J absent du worktree : gardé par `!LVL.cur.cj`, lu dans son diff, non exécuté).
- La tranche du bâti dans le jeu.

## Après le contrôle, tour 1 (20/11, 17:30-18:00)
Rien commité. Worktree réassemblé (`--depuis-morceaux`). Bancs : scratchpad, sous `lot-f/t2/` (`passe.sh`, `planche.py`, `stats.py`, `generation.txt`, `chrome/`). Ils reprennent `page-c.cjs` et `decor.cjs` du contrôle, avec les mêmes graines (2003, 2011, 2001-2080).

### Défaut bloquant : l'image ne revient pas à la ville du 3/11. Reproduit, mais pas corrigeable dans le lot
- **Reproduit.** Sur `planches/tour2-t844-jeu.jpg`, colonnes 2 et 3, avec le flou du jeu : avant et lot F donnent la même image, des tours filées. Netteté du haut de l'image : 2,6 avant, 3,1 lot F, 7,2 au 3/11.
- **Cause, rejouée cette fois à l'identique pour avant et après.** Le contrôle n'avait pas rejoué la vue « flou V2 ». Ici, les colonnes 4 à 6 remettent le flou V2 dans la page, au banc seulement (`pre=flou`, 5 remplacements sur 5).
  - Les tours redeviennent nettes, avec leurs fenêtres, **avant comme après**.
  - Netteté au 844 : avant + V2 6,5 ; lot F + V2 8,1 ; 3/11 7,2.
  - Netteté au 390 : 5,1 ; 6,5 ; 9,4.
  - Netteté à l'ordinateur : 16,4 ; 20,3 ; 13,0.
  - **Le premier écart à l'œil est donc le flou cassé depuis le 17/11** (3df790c92), dans `rendu/triptyque-bloom.js`. Ce fichier est réservé : je n'y ai pas touché.
- **Ce que le lot apporte, une fois le flou rendu** (colonne 4 contre colonne 5) :
  - des murs de tours à fenêtres des deux côtés, plus serrés et plus hauts, là où l'avant montre surtout du ciel. Voir le 844 aux lignes 2 et 5, le 390 aux lignes 2 et 5, l'ordinateur à la ligne 2 ;
  - à l'image, le gain du décor est réel, mais second.
- **La photo la plus proche du 3/11 est la colonne 6** : lot F + flou V2 + `?plus=villenoire`.
  - À l'ordinateur : route noire (83 % de noirs, 3/11 : 67 %), tours sombres à fenêtres, ciel violet.
  - Au 390 : 52 % de noirs (3/11 : 58 %).
  - Il faut **les trois** : le flou (réservé), la nuit (décision de Sacha) et le décor (ce lot). Le lot seul ne peut pas rendre l'image.
- **Correctif du flou, prêt mais NON appliqué** : `en-chantier/flou-v2-uSfx.diff`, 3 lignes de `triptyque-bloom.js`.
  - Les motifs `FLOU_R[0]` et `u1` de `NET_NITRO2` suivent `uSfx`.
  - Il est identique à la retouche faite au banc, qui coûte 0 appel, 0 triangle et 0 programme en course (155 → 155).
  - **À faire passer par le propriétaire du rendu.** Il touche toutes les maps.

### Mineur : la nuit noire n'est plus active par défaut
- Elle ne s'active plus qu'avec `?plus=villenoire` (`equilibre-maps.js`). Sans ce drapeau, l'équilibre doux du 06/11 est intact.
- C'est à Sacha de trancher, sur `tour2-*-jeu.jpg`, colonne 5 (sans) contre colonne 6 (avec).

### Mineur : air libre de 59,x m. Corrigé
- `tourLibre`, sous la route à étages : le pied relevé se pose à `p.y+61`, et la fenêtre d'exclusion devient `b−60`. Le point dégagé sort ainsi de la fenêtre, et la passe suivante ne le revoit plus. Avec 60 pile, il n'en sortait jamais.
- `decor.cjs`, graines 2001-2080, paliers 0, 10 et 20 :
  - **béton sous 60 m : 0 / 0 / 0** (tour 1 : 21 / 44 / 2), sous ALLEGE aussi ;
  - mini 60-61 m ;
  - autres volumes sous 60 m : 16 / 37 / 6 (tour 1 : 29 / 55 / 7). Ce sont des mâts, des scènes et le socle.
- Le reste est inchangé par rapport au tour 1 :
  - dans la route : 0 / 0 / 0 ;
  - frôle : 13 / 8 / 0 ;
  - règle des 14 m : 40 / 67 / 14 ;
  - air des sauts : 19 / 12 / 0, égal à HEAD ;
  - pendues : 17,5 / 24,1 / 17,7.
- Décor du socle (`?sans=villeetages`) : 3ff4bfa4abf7, et 776bf0dbf927 sous ALLEGE, **égal à HEAD**.

### Mineur : pointes de la tranche du bâti. Non tranché
- Même banc Node, Mac chargé :
  - sans allègement : max 7,3 ms, p90 4,5 ms (tour 1 : max 74, p90 8,1) ;
  - ALLEGE : max 43 ms, p90 4,2 ms (tour 1 : max 25, p90 4,3).
- Le p90 est stable et les pointes changent de côté d'une prise à l'autre : c'est du bruit de charge.
- **Pas mesuré dans le jeu ni sur iPhone.**

### Coût Chrome, tour 2 (par image, `renderer.info`)
| | 3/11 | avant + V2 | lot F + V2 | lot F + V2 + nuit |
|---|---|---|---|---|
| 844, graine 2003 | 70 / 199 k | 94 / 230 k | 67 / 180 k | 80 / 202 k |
| 390, graine 2011 | 66 / 158 k | 70 / 183 k | 80 / 212 k | 71 / 196 k |
| ordinateur, `poste=max` | 76 / 270 k | 65 / 232 k | 65 / 231 k | 66 / 229 k |

- Au 844, sans V2 : avant 90 / 231 k, lot F 66 / 180 k.
- Tout reste sous le plafond du téléphone (124 appels / 311 k).
- Au 390, la prise du lot F est à +14 % de l'avant sur cette course. Ce sont des abscisses différentes, et le contrôle, au même endroit, avait mesuré 98 / 261 k contre 99 / 264 k.
- Programmes constants de bout en bout : 154 → 154, 155 → 155 (V2) et 178 → 178. **0 programme compilé en course.**
- Aucune erreur JS, aucune mort.

### Identités et gardes
- Routes (`empreinte.cjs graines=1-12`) toutes conformes :
  - ville 77f22cbf4933 / 7aec17e77c92 ;
  - crypto 5447610bd8f2 / eae97981f833 ;
  - nuages 469d52aff855 / 2e1661d8fe93 ;
  - espace 9c99fae61d38 / ea2d9e750351 ;
  - avec `?sans=villeetages` : 17b89297a6b8 / 9dc6766ea34f.
- Gardes vertes : `garde-demarrage` (21 scripts), `garde-allege`, `garde-charte`, `--verifier` (349 morceaux).
- Bancs : verrou « ville-cyber-f » pris et rendu à chaque passe (17:38-17:41, 17:41-17:43, 17:43-17:45). Profils supprimés, aucun Chrome restant.

### Pas vérifié
- Le correctif du flou dans le vrai fichier, puisqu'il n'est pas appliqué. Il n'a été essayé qu'injecté dans la page. Je n'ai pas rejoué sa recompilation au chargement.
- L'iPhone réel, les paliers 10 et 20 en Chrome, le nitro, les sauts joués.
- La vitrée et Crypto City à l'image.
- Le 3/11 roule sa propre route : la comparaison se fait à l'impression, pas à la même abscisse.

### Décisions demandées
1. **Propriétaire du rendu** : appliquer `en-chantier/flou-v2-uSfx.diff`. Sans lui, aucune version du décor ne rend l'image du 3/11.
2. **Sacha** : la nuit noire pour la ville, c'est-à-dire activer `?plus=villenoire` par défaut. Elle défait l'équilibre doux du 06/11.
