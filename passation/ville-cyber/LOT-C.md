# LOT C — les cadres de lumière, par moments (nuit du 2026-11-18)

Demande de Sacha : remettre les « portails » de la ville retirés le 14/11 (44a5de54, `VILLE_SANS_CADRES`), « à certains moments, pas tout le temps ».
Worktree `.lots/c`, **rien de commité**. Premier auteur coupé à 03 h 20 (réseau) ; repris par un second auteur, qui a gardé son code (relu, compilé, mesuré).

## 1. Ce qui a existé dans la ville (historique)

| Famille | Où (avant) | Retirée | Dessin d'avant | Verdict |
|---|---|---|---|---|
| Portiques des PORTES DE LUMIÈRE (le grand S) | `vsBatirG`, InstancedMesh à part (`CITY.vsIm`) | 14/11 (44a5de54) | montants de 7 m × 34 m à 5 m du bord, barre de 3 m à 30,5 m : un appel de dessin de plus | « chelou » : montants épais qui bouchent la vue |
| ANNEAU du saut des néons | idem (`A9`) | 14/11 | carré de 100 × 56 m, barres de 3,2 m, au milieu du saut (graine impaire) | l'idée est la bonne (on vole à travers), le carré passait parfois au ras de la trajectoire |
| Cadres des BOUCHES de tunnel et de couloir | `couloir()` (lumA) | 14/11 | montants 3,2 m sur toute la largeur ±hi + linteau 3 m | lourd, mais c'est un vrai « passage de lumière » |
| Anneaux carrés du PHARE | sommet du phare | 14/11 | anneaux autour d'une tour | décor de tour, pas un passage : non repris |
| Ponts de verre de la PASSERELLE | `ponts` | 14/11 | ponts lumineux par-dessus la route | « barre au-dessus de la route » : non repris |
| Pont flottant de la VRILLE | `p.pont` | 14/11 | pont et arêtes au-dessus de la vrille | flottait : non repris |
| Anneaux de la VRILLE (« le portail jaune ») | `sVrille`, `if(false)` | 13/11 (1e450ecdf) | trois anneaux autour de l'axe | refusé explicitement par Sacha : non repris |

## 2. Ce qui revient (3 familles, redessinées)

Fichiers : `code/maps/ville-scenes.js` (VILLE_CADRES_RARES, cadPose/cadFige/cadLibre/cadPousse, le tirage), `code/maps/jade-balade.js` (`fam(…, rot)` : une
instance posée par sa matrice ; `V9.neonR`), `code/maps/ville-entree.js` (l'ancre de l'anneau porte la géométrie du vol : aX…vD, rien de tiré),
`code/maps/ville-v3.js` (dbgVilleAudit ignore les cadres, `dbgVilleCadres`).

- **Portes de lumière** : deux montants de 1,4 m à 9 m du bord de la dalle, la barre à 26 m au-dessus d'elle, dans le repère de la dalle (penchent avec le dévers).
- **Anneau du saut des néons** : un cadre de 1,4 m en travers de l'axe du saut, placé là où passent TOUS les vols (du plus lent, 0,4 vD, au plus vif, +14 m), essayé à
  50/62/38/74/26 % du vol ; une barre à moins de 5 m d'une dalle = l'essai suivant.
- **Bouches de tunnel et de couloir** : deux montants et un linteau de 1,6 m, à 13 m du bord, le linteau à ~39 m (VS_HC), une couleur par tunnel.

Toutes : des « lames » de 3,6 m de profondeur dans la famille néon existante (villeMatNeon) — **aucun appel de dessin, aucune matière, aucune géométrie de plus**
(l'ancien portique avait son InstancedMesh à lui : un appel de plus quand il était là). Juge de pose `cadLibre` : une pièce à moins de 5 m de la dalle roulée
(de 6 m sous elle à 18 m au-dessus, tous les étages) → le cadre entier n'est pas posé.

## 3. Le tirage (« à certains moments »)

`k = ⌊3·u⌋` familles, u = VS_H de la PLACE de la route finie (milieu et bout de `pts`) ; l'ordre des familles par un second VS_H ; on prend les k premières
DISPONIBLES (la scène existe et son cadre a passé le juge). Ni `rf` ni `vr` : la route et les tours ne bougent pas d'un bit. Jamais trois familles.

## 4. Les interrupteurs

- `?sans=villecadres` (VILLE_CADRES_RARES faux) : la ville du 14/11, aucun cadre.
- `?sans=villeportails` : toute la ville d'avant le 14/11 (inchangé).
- Crypto City, la vitrée : jamais de cadre (garde `LVL.cur.id==='ville' && !vitre && !crypto && !V.CR`).

## 5. Preuves (reprise du 19/11 par un troisième auteur : code relu, compilé, NON modifié ; bancs refaits sur ce code)

Sorties : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-c/`
(`s5/stats.json`, `s6sans/`, `s6ref/`, `vol/vol.json`, `ab-c/`, `ab-s/`, `li-c/`, `li-s/`, `ph4/`, `vx/` ; banc `cadres-banc.cjs` = Chrome sans fenêtre, `--mute-audio`,
sfx/mus/vox coupés, sous `~/cash-car/verrou-banc.sh` via `verrou.sh` ; modes `stats`, `photos`, `vues`, `vieux`, `vol`). Ces sorties sont dans /private/tmp : à recopier si on veut les garder.

### 5.1 Routes identiques au bit près (Node)
`SEARCH=<…> node outils/banc-routes/empreinte.cjs graines=1-12` dans `.lots/c` pour `''`, `'?sans=villecadres'`, `'?sans=villeportails'`, et `''` dans la référence :
ville p0 `d63b36e2af8b`, p10 `fb378a8c6756` ; crypto `5447610bd8f2` / `eae97981f833` ; nuages `469d52aff855` / `2e1661d8fe93` ; espace `9c99fae61d38` / `ea2d9e750351`
— les quatre fichiers identiques (`diff` vide). (`vitree` : « VIT_SOL is not defined » dans le banc Node, pareil dans la référence : défaut du banc, pas du lot.)

### 5.2 Le décor hors cadres est identique (Chrome, `?tel=1`)
- `dbgVilleCadres({empreinte:1})` = FNV-1a de tous les volumes, genres, néons (et couleurs) et réclames, cadres exclus. Graines 1-8 × paliers 0/10/20 :
  défaut (`s5`) = `?sans=villecadres` (`s6sans`) sur **24/24** (empreinte, nombres de volumes et de néons). Avec `?sans=villecadres` : 0 pièce de cadre partout.
- `?sans=villecadres` contre la RÉFÉRENCE (worktree racine, sans le lot) : graines 1-3 × 3 paliers, volumes, néons, réclames, dans/frôle/flotte de `dbgVilleAudit`
  **identiques 9/9** (seuls diffèrent les triangles de l'image vivante, à ±1 % : la caisse n'est pas au même endroit après 3 s de pilote).
- `flotte 2` sur les routes à tunnel : présent à l'identique dans la référence (les cadres sont exclus du test « flotte » : posés en l'air exprès).

### 5.3 Le tirage mesuré (graines 1-24 × paliers 0/10/20 = 72 routes, `s5`)
| | 0 famille | 1 famille | 2 familles | portes | bouches | anneau |
|---|---|---|---|---|---|---|
| palier 0 | 9 | 14 | 1 | 4 | 12 | 0 |
| palier 10 | 16 | 8 | 0 | 0 | 8 | 0 |
| palier 20 | 10 | 14 | 0 | 3 | 11 | 0 |
| **total** | **35 (49 %)** | **36 (50 %)** | **1 (1 %)** | **7 (10 %)** | **31 (43 %)** | 0 (hors tirage) |

Ce que la route OFFRE borne le tirage : 26/72 routes n'ont ni grand S ni tunnel/nœud (aucune famille possible) ; le grand S n'existe que sur 12/72.
k visé : 0 → 15, 1 → 28, 2 → 29 (proche de 1/3 chacun). Jamais trois. Aucun cadre refusé par le juge (`rejets` 0 partout).
⚠ L'exemple de la commande (« ~1/3 portes, ~1/3 anneau, 1/3 aucune ») n'est PAS atteint : l'anneau est hors tirage (§ 6) et le grand S manque à 5 routes
sur 6. En vrai : une route sur deux a un cadre, presque toujours la bouche de tunnel. Décision laissée à Sacha (§ 7).

### 5.4 Écart à la route : jamais un obstacle
- `dbgVilleCadres()` (boîte orientée de chaque pièce contre chaque point de la route, tous étages, de 6 m sous la dalle à 18 m au-dessus, indépendant du juge de pose) :
  `sous5` = **0 sur 72 routes** ; plus petit écart : portes 8,2 m (le montant, à côté de la dalle), bouches 12,4 m. Barre la plus BASSE au-dessus de la dalle :
  portes 25,3 m, bouches 40 m (rien au ras du toit de la caisse).
- `dbgVilleAudit` : dans 0 / frôle 0 sur les 72 routes. `dbgVillePortiques` : les seules « barres » au-dessus de la route sont les linteaux des cadres (≤ 8 par route).
- Vol réel au pilote (30 s, graines 2, 6, 9, palier 0, `vol/vol.json`) : jamais à moins de 24,9 m d'une porte ni de 40,3 m d'une bouche (en l'air : 24,9 / 48 m) ;
  aucune mort. Les sauts ne croisent aucun cadre tant que l'anneau est hors tirage (portes et bouches sont sur la route roulée, pas dans un couloir de vol).

### 5.5 Coût
- PAR CONSTRUCTION aucun appel de dessin, aucune géométrie, matière, texture ni programme de plus : les pièces sont des instances de la famille néon
  existante (`fam(…, rot)` dans `buildVoxCityG`, une matrice par instance). L'ancien portique (avant le 14/11) avait son InstancedMesh à lui : il n'est plus créé.
- renderer.info `?tel=1`, 844×390, même caméra, même Chrome (`ab-c` / `ab-s`, `VUE` de `cadres-banc.cjs`) :

| vue | appels avec / `?sans=villecadres` | triangles avec / sans | programmes |
|---|---|---|---|
| g6 p0 s1358 (portes) | 76 / 75 | 219 563 / 216 863 | 153 / 153 |
| g6 p0 s1432 (portes) | 93 / 93 | 255 497 / 255 389 | 153 / 153 |
| g2 p0 s482 (bouche) | 103 / 102 | 345 801 / 345 741 | 153 / 153 |
| g2 p0 s604 (bouche) | 103 / 102 | 344 445 / 344 385 | 153 / 153 |

  L'appel d'écart a été traqué (`cadres-banc2.cjs`, liste des appels par objet, g2 s482 refait) : il vient des particules du jeu (« étincelles en pixels »,
  « étoiles des pièces », un Mesh de shader), présentes ou non selon l'instant — au 2e tirage c'était 102 avec / 103 sans. Aucun appel ne vient des cadres.
  Triangles : +60 à +2 700 (5 à 24 cubes de 12 triangles en plus, + bruit de la vue). Géométries : bruit de ±10 entre chargements, dans les deux sens.
- Temps de bâti : 6 (bouches) à 24 (portes) pièces ; le juge `cadLibre` fait V.proches + 9 échantillons par point, au bâti seulement, dans `vsBatirG`
  (déjà en tranches). NON chronométré à part (voir § 8).

## 6. Ce que j'ai regardé (planches `passation/ville-cyber/planches/`, 844×390 et 390×844, `?tel=1`)
- `cadres-avant-14-11.jpg` (`?sans=villeportails`) : les vieux portiques des portes = montants de 7 m à damier jaune/cyan, barre rayée — c'est bien le
  « chelou » ; la vieille bouche = gros cadre plein, correct.
- `cadres-portes.jpg` : une enfilade de portes de néon fines (cyan, rose) qui suivent le grand S et penchent avec lui — **beau, cyberpunk**, un vrai
  passage de lumière ; on les voit de loin, rien ne bouche la vue.
- `cadres-bouches.jpg` : un liseré de néon autour de la bouche du tunnel — **propre**, discret, se lit comme une entrée.
- `cadres-anneau-hors-tirage.jpg` (`?avec=villeanneau`) : encore un grand rectangle suspendu dont la barre basse barre l'écran au-dessus de la route d'en bas —
  **encore « chelou »** : hors tirage.

## 7. Décisions pour Sacha
1. Les portes reviennent rarement (10 % des routes) parce que le grand S est rare. Si Sacha les veut plus souvent, c'est le tirage des SCÈNES (lot U), pas ce lot.
2. La bouche de tunnel revient sur ~43 % des routes (presque chaque fois qu'il y a un tunnel et que le tirage dit « au moins un »). Si c'est trop : la limiter
   à k = 2 (une ligne dans le bloc CAD).
3. L'anneau du saut des néons : à redessiner (sans barre basse, ou en arche) avant de le remettre ; `?avec=villeanneau` pour le juger.

## 8. Ce qui N'EST PAS vérifié
- Le temps de bâti par tranche (JF.lim) avec / sans cadres n'a pas été chronométré (quelques dizaines de pièces : attendu négligeable).
- Pas d'essai sur un vrai iPhone, ni en ?poste=… sur PC lent. Pas de vidéo en course à travers les portes (photos fixes + vol au pilote seulement).
- L'anneau (`?avec=villeanneau`) n'a pas eu le banc des sauts au pilote (`ville-sauts-page.js`) : il est hors tirage.
- Le `vitree` du banc d'empreintes Node ne charge pas (pré-existant).
