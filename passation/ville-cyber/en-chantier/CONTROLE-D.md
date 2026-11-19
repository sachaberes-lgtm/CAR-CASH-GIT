# Contrôle adverse du lot D (19/11/2026)

## Tour 1 — verdict : REFUSÉ

Le contrôle porte sur le worktree `.lots/d`, détaché sur ff6a3a14d, avec les changements non commités de l'auteur.
Je n'ai rien corrigé dans son code. Mes bancs et sorties sont dans `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-d/controle/` (appelé `controle/` plus bas) :
- `ref/` : le code de HEAD, extrait par `git archive`, puis index assemblé par `--depuis-morceaux` ;
- `decor.cjs` : copie du banc de l'auteur ;
- `vols.cjs` et `dbg.cjs` : mes bancs ;
- `chrome.sh` et `page.cjs` : la passe Chrome ;
- `chrome/` : les photos et les planches `pl-844.jpg` / `pl-390.jpg`.

Mes graines diffèrent de celles de l'auteur : 401-480, 901-980, 3001-3080, 711-760, 447 et 37.

### En bref
- **Identités : toutes tenues.** Le décor du socle avec `?sans=villeetages` est égal au bit près. Pas de const en double, et les trois gardes sont vertes.
- **Génération : saine.** Pas de tour dans la route, et la hauteur libre est tenue. Les objectifs du lot E sont tenus, mais en recul aux paliers 0 et 10.
- **D2 est tenu en nombres.** En revanche, les scènes « qui se visitent » disparaissent presque.

**Trois défauts bloquants :**
1. L'effet n'est **pas visible en jeu** sur mes 12 photos.
2. Le **tirage de la route au palier 20 coûte +42 à +49 %**, mesuré deux fois en alternance.
3. Au palier 20, un **doute non levé de mort contre une tour en vol** : le modèle Node montre ×3 d'exposition.

### 1. Identités et périmètre

**Empreintes des routes** (`node outils/banc-routes/empreinte.cjs graines=1-12`) : toutes conformes.

| | ville p0 / p10 | crypto | nuages | espace |
|---|---|---|---|---|
| `SEARCH='?sans=villeetages'` | 17b89297a6b8 / 9dc6766ea34f ✔ | 5447610bd8f2 / eae97981f833 ✔ | 469d52aff855 / 2e1661d8fe93 ✔ | 9c99fae61d38 / ea2d9e750351 ✔ |
| `SEARCH='?sans=villeetages,villecyber'` | d63b36e2af8b / fb378a8c6756 ✔ | | | |
| sans drapeau | 321a39109773 / 093aae3d138a (D2, attendu) | idem ✔ | idem ✔ | idem ✔ |

**La vitrée n'est pas vérifiée par empreinte.** Le banc ne sait pas la tirer, ni sur HEAD ni ici : `VIT_SOL` puis `vitreAplanir` ne sont pas définis.
À la lecture du code, tout D2 est sous `VETG` (`veActif()`, qui exclut `vitre` et `crypto`), et tout D1 sous `VED = VAME9 && !CR && veActif()`.

**Le décor avec `?sans=villeetages`** (`decor.cjs`, le vrai `buildVoxCity` en Node) :
- graines 401-480 × paliers 0 / 10 / 20 : empreinte `c4e04e7ee962`, égale entre HEAD et le lot ✔ ;
- sous ALLEGE, graines 401-480 × paliers 0 / 10 : `aecd887604c1`, égale entre HEAD et le lot ✔.

**L'index.** HEAD assemblé depuis ses morceaux ne diffère de l'index du lot que par les 83 lignes du lot.
Les 3 366 lignes de `git diff` sur index.html viennent d'ailleurs : l'index commité à ff6a3a14d était déjà en retard sur `code/`. Ce n'est pas la faute de l'auteur, mais **le commit les embarquera**.

**Le reste du périmètre :**
- `git diff` ne touche que `jade-balade.js`, `ville-entree.js`, `ville-etages.js` et `ville-scenes.js`. Ni `sw.js`, ni Crypto City, ni les fichiers de rendu partagés.
- Les noms neufs sont déclarés une seule fois dans l'index.
- `garde-demarrage` OK, `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔.
- La moitié sous ALLEGE est gardée sur `ALLEGE`, et non sur `IS_MOBILE`.

### 2. Génération (Node, graines neuves)

**Tours dans la route** (`decor.cjs`, graines 401-480, paliers 0 / 10 / 20) :
- `dans` 0 et `frôle` 0 partout ;
- règle des 14 m sur les pendues exprès : 0 ;
- air minimum sous une pendue exprès : 60 m au palier 0, 90 m aux paliers 10 et 20 ✔.

**Pendues par route :**

| palier | pendues HEAD | pendues lot D (dont exprès) | route sous une pendue HEAD | route sous une pendue lot D |
|---|---|---|---|---|
| 0 | 8,5 | 21,1 (11,3) | 9,6 % | 21,9 % |
| 10 | 9,7 | 19,2 (10,2) | 7,7 % | 14,1 % |
| 20 | 10,7 | 37,2 (11,8) | 6,9 % | 21,5 % |

Sous ALLEGE, il y a 7,9 / 7,6 pendues exprès par route : le plafond est bien divisé par deux, mais la moyenne ne baisse que de 30 %.

**Modules** (`ville-cyber.cjs`, graines 901-960, paliers 0 / 10 / 20) :
- règle 0, audit 0 / 0, nappes 0, pièces perdues 0 ;
- plans abandonnés : 1 au palier 0 (« rue », air), 2 au palier 10 (« façade », « phare », air). C'est l'ordre de grandeur de HEAD.

**Objectifs du lot E** (`etages-c.cjs`, médianes ; deux séries, graines 901-980 et 3001-3080, chaque fois HEAD → lot D) :

| objectif | palier 0 | palier 10 | palier 20 | seuil |
|---|---|---|---|---|
| enclavé (%) | 73,2 → 68,7 et 74,7 → 69,2 | 55,7 → **51,6** et 56,0 → **52,1** | 55,2 → 60,1 et 54,6 → 58,1 | ≥ 50 ✔, au ras au palier 10 |
| tours de virage | 4,5 / 4,4 | 4,1 / 4,2 | 4,1 / 4,1 | ≥ 4 ✔ |
| écart avec la route du dessus, hors raccourci (m) | 174 / 173 | 175 / 174 | 176 / 175 | ≥ 150 ✔ |
| hauteur libre, pire cas (m) | 64,7 / 62,8 | 78,4 / 98,7 | 152 / 121 | ≥ 60 ✔ |
| t30 p90 (s) | 8,1 / 7,6 | 6,5 / 6,4 | 7,3 / 7,5 | < 8,5 ✔ |

- vsCroise 0, montée hors module 0, pente hors piqué ≤ 40,5 % ✔.
- Raccourcis : 1 / 1 / 0 par route, comme HEAD.

**D2, la variété** (`suites.cjs`, graines 901-980 et 3001-3080) :
- La suite la plus fréquente pèse **9-11 %** à chaque palier. Au palier 20, HEAD était à 89 % et 79 %.
- Chaque module du 3/11 et du lot A sort dans 10 à 13 % des routes ✔.

⚠ **Les scènes s'effondrent** (graines 901-980, HEAD → lot D) :
- traversée : 31-45 % → 1-3 % ;
- crête : 14-35 % → 1-4 % ;
- passerelle : 9-11 % → 1 %.

Dans `ville-cyber.cjs`, le plan « tunnel » passe de 19 / 24 à 0, et « crête des toits » de 22 / 10 à 0. Sacha parlait justement de ses « tunnels formés d'immeubles ». L'auteur l'a signalé comme un choix à faire.

⚠ **Le plan est périodique** (graine modulo 9) : la carte de clôture est fixée par la graine.

### 3. Coût

**Tirage de la route** (`ville-tirage-ab.cjs`, alterné ; deux passes, les racines inversées entre les deux) :

| passe | palier 0 | palier 10 | palier 20 |
|---|---|---|---|
| graines 711-730 ×2, HEAD → lot D | 121 → 124 ms | 100 → 112 ms | **83 → 123 ms (×1,49)** |
| graines 741-760 ×3, HEAD → lot D | | 96 → 80 ms (bruit) | **73 → 104 ms (×1,42)** |

`ville-cyber.cjs` (graines 901-960) donne la même chose : au palier 20, médiane 118 → 158 ms et maximum 364 → 650 ms.
**L'auteur écrivait ×1,21.**

**Bâti du décor** : médiane 36-42 → 38-47 ms, sans hausse nette.

**Tours et volumes par route.** D2 change les routes, donc la comparaison n'est pas à route égale :
- palier 10 : tours 982 → 1016, volumes 2815 → 2917, soit +3,6 % ; le maximum passe de 4133 à 4383 ;
- paliers 0 et 20 : en baisse ou égaux.

**Chrome, `?tel=1`, graine 447, palier 0** (moyenne d'appels et triangles → maximum) :

| | avant | après |
|---|---|---|
| 844×390 | 108 appels, 277 k triangles → 151 / 331 k | 105 / 263 k → **170** / 363 k |
| 390×844 | 100 / 252 k → 127 / 338 k | 95 / 241 k → **147** / 316 k |

- Les moyennes baissent, mais le maximum d'appels monte de 13 à 16 %. Ce ne sont pas les mêmes routes (D2).
- **Programmes : 157 au départ, 157 à la fin, donc 0 compilé en course ✔.**

### 4. Le vrai jeu

**La passe Chrome** a pris le verrou « ville-cyber-d » de 18:40:50 à 18:45:07. Elle l'a rendu, et les profils et les Chrome sont tués.
- Courses `?tel=1&carte=ville&meteo=pluie&pistegraine=447`, en 844×390 et 390×844, sur HEAD et sur le lot, plus la graine 37 en 390×844 sur le lot.
- Aucune erreur console, aucune mort.
- `dbgVilleAudit` : dans 0, frôle 0, **flotte 0 partout, y compris la graine 37** ✔. Comme la route a changé (D2), la correction des enseignes n'est pas isolée.
- En Node, il reste des enseignes flottantes sur 7 routes sur 240 (par exemple 426 au palier 0, 456 au palier 20). C'est une autre sorte que celle de la graine 37 ; HEAD en avait 62 routes sur 240.

**Le jeu du 3/11 n'a pas pu être photographié.**
- En 844×390 : « course pas lancée ».
- En 390×844 : `dbgClassique('ville',…)` n'a pas pris, la course est partie en grotte.

La comparaison se fait donc contre l'avant et contre la description de Sacha.

**Les photos** (`controle/chrome/pl-844.jpg`, `pl-390.jpg`, aux abscisses 950-3050 m, là où `decor.cjs` place les pendues de la graine 447) :
- Le rayon vers le haut trouve bien une tour au-dessus de la caisse **13,2 % du temps** en 844×390, contre 1,8 % avant ; et 4,8 % contre 1,5 % en 390×844.
- **Mais rien ne se lit à l'image.**
  - La caméra de poursuite ne cadre pas au-dessus de la caisse.
  - Sur la photo « sous47 », la tour est à 47 m au-dessus de la caisse, et on ne voit qu'une bande sombre et floue en haut du cadre.
  - Aucune des 12 photos ne montre de tours violettes translucides pendues, ni la sensation d'être sous et entre des immeubles.
- La ville de la graine 447 est sortie **ambre (teinte jaune)** dans le lot, et violette avant. Le pied « fondu violet » y est brun.
- La route reste lisible et la voiture visible ✔.

### 5. Le saut dans une pendue (doute non levé)

Le jeu tue la caisse en vol qui entre dans une tour (`villeHeurt` → `explode('tour')`). Le saut nitro est permis partout, sauf sous la dalle et sur les crêtes du lot A.

**Le banc `vols.cjs`.** Il tire un saut à +21 m/s tous les 8 m. Le vol est balistique (g 33), la caisse suit la route en plan, et le vol s'arrête au premier contact avec une tour, gardée par une marge de 2 m.

**Vols de 2 s au plus** (graines 401-460) :

| | palier 20 : vols qui touchent une tour | palier 10 |
|---|---|---|
| HEAD | 228 | 226 |
| D2 seul (copie avec `VE_PEND_N=0`) | 608 | 115 |
| lot D | 682, **dont 116 dans une pendue** (5 routes sur 60) | 115 |

Au palier 0 :
- avec un saut de 21 m/s, 10 départs touchent une pendue (graine 403), contre 0 pour HEAD ;
- avec un saut de 40 m/s (saut allongé), 128 départs touchent une pendue, sur 27 routes sur 80.

Le modèle est grossier (pas d'aimant, pas de volant), mais la comparaison est faite à modèle égal. **À vérifier en jeu avant de conclure.**

### Défauts

**Bloquants :**
1. **Effet absent à l'image.** Les pendues existent (rayon 13 %), mais ni en 844×390 ni en 390×844 on ne se voit « enclavé sous et entre des immeubles violets translucides ». Le cadrage les laisse hors champ, et la ville de l'essai était ambre.
2. **Tirage au palier 20 : +42 à +49 %**, soit +30 à 40 ms sur Mac, mesuré deux fois en alternance. L'auteur annonçait ×1,21.
3. **Exposition des vols aux tours au palier 20 : ×3** (228 → 682). D2 en fait l'essentiel, et D1 ajoute 116 vols qui finissent dans une pendue. Aucune mort n'a été vue en Chrome, mais la passe n'a roulé qu'au palier 0, sans saut. **Doute non levé.**

**Mineurs :**
4. Les scènes (traversée, crête, passerelle, tunnel) passent de 10-45 % des routes à 1-4 %.
5. L'enclavé recule de 4-5 points aux paliers 0 et 10. Au palier 10, il est à 51,6 / 52,1 %, au ras du seuil.
6. Au palier 10 : +3,6 % de tours et de volumes, et le maximum d'appels monte de 13-16 % en Chrome.
7. Sous ALLEGE, il y a 70 % des pendues, pas la moitié : seul le plafond est divisé.
8. Il reste 7 routes sur 240 avec une enseigne flottante en Node, d'une autre sorte.
9. L'index commité à HEAD est en retard de 3 000 lignes sur `code/` : le commit du lot les emportera.

### Ce que je n'ai pas vérifié
- Le jeu du 3/11 en photo : le lancement a échoué.
- La teinte violette forcée dans le lot.
- La vitrée : ni en empreinte, ni en jeu.
- Les paliers 10 et 20 en Chrome, et les sauts nitro en jeu.
- L'iPhone.

## Tour 2 — verdict : REFUSÉ

Je n'ai rien corrigé dans le code de l'auteur. Mes bancs et sorties sont dans `controle/t2/` (sous `lot-d/`). Mes graines sont neuves : 1201-1280 (décor), 1201-1260 (vols), 1225 et 1215 (Chrome).

### En bref
- **Identités : toutes tenues.** Le décor du socle avec `?sans=villeetages` est égal au bit près sur mes graines neuves. La route est celle de ff6a3a14d.
- **Génération : saine.** Pas de tour dans la route, la hauteur libre est tenue, aucune enseigne flottante de plus, aucun vol dans une pendue.
- **Coût : tenu en comptes.** Les appels, les triangles et les programmes sont égaux. Le calcul des vols coûte environ 2 ms en Node pur.
- **D2 n'est pas fait.** C'est permis par la consigne (« livre D1 seul »).
- **Un défaut bloquant reste, et l'auteur le reconnaît : l'effet ne se lit pas à l'image.**

### 1. Identités et périmètre
- **Routes** (`node outils/banc-routes/empreinte.cjs graines=1-12`), toutes conformes :

  | | ville p0 / p10 |
  |---|---|
  | `?sans=villeetages` | 17b89297a6b8 / 9dc6766ea34f ✔ |
  | `?sans=villeetages,villecyber` | d63b36e2af8b / fb378a8c6756 ✔ |
  | sans drapeau | 77f22cbf4933 / 7aec17e77c92 ✔ (= ff6a3a14d, D2 retiré) |

  Crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93 et espace 9c99fae61d38 / ea2d9e750351 sont conformes, avec et sans drapeau.
  La vitrée n'est pas tirable par le banc (`VIT_SOL is not defined`, comme à HEAD).
- **Décor avec `?sans=villeetages`** (`decor.cjs`, le vrai `buildVoxCity` en Node, graines **1201-1280**), HEAD (`controle/ref`) contre le lot :
  - paliers 0 / 10 / 20 : `09db1359ff0a` = `09db1359ff0a` ✔ ;
  - ALLEGE, paliers 0 / 10 : `9248d9ba0288` = `9248d9ba0288` ✔.
- **Le diff** ne touche que `jade-balade.js`, `ville-etages.js`, `ville-scenes.js` et `ville-entree.js`. Pour `ville-entree.js`, ce n'est qu'un commentaire, dans `genCtrl1`.
  Les fichiers de `code/` sont égaux octet par octet à ceux de `ref/`, hors ces quatre fichiers. Rien n'est commité, `sw.js` n'est pas touché, Crypto City et les fichiers de rendu partagés non plus.
- **Noms neufs** : `VE_PEND_N`, `VE_PEND_H`, `VE_PEND_F`, `VE_PEND_UP`, `vePendVolG` et `vePendVolA` sont déclarés une fois chacun dans l'index.
- **Garde** : la moitié sous allègement est gardée sur `ALLEGE`, et non sur `IS_MOBILE`.
- **Gardes** : `garde-demarrage` OK (21 scripts), `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔ (349 morceaux).
- **Mineur.** L'en-tête de `ville-etages.js` dit encore « ni marque SP9 ni matière : elle se noie dans villePied », et donne les mesures du tour 0. Or le code marque maintenant le corps en SP9 (voile de 36 m). Le commentaire est périmé.

### 2. Génération (Node, graines 1201-1280)
**Décor sans drapeau, HEAD → lot** (`t2/dn-ref.json`, `t2/dn-wt.json`) :
- dans 0, frôle 0 aux trois paliers ;
- règle des 14 m sur les pendues exprès : 0 ;
- air minimal sous une pendue exprès : 60 / 90 / 91 m ✔.

Pendues exprès par route :

| | palier 0 | palier 10 | palier 20 |
|---|---|---|---|
| sans allègement | 11,1 | 11,2 | 8,9 |
| sous ALLEGE | 5,8 | 5,8 | |

C'est bien la moitié.

Tours et volumes par route, HEAD → lot :

| | palier 0 | palier 10 | palier 20 |
|---|---|---|---|
| tours | 780,7 → 775,6 | 989,6 → 985,2 | 1226,4 → 1221,6 |
| volumes | 2364 → 2358 | 2975 → 2973 | 3915 → 3905 |

Le maximum de volumes passe de 3416 → 3365, 4440 → 4357 et 5734 → 5766 (+0,6 % au palier 20).

**Enseignes flottantes** : 23 / 27 / 8 routes, des deux côtés. La liste est la même route par route : **le lot n'en ajoute ni n'en retire aucune**. La paire de la graine 37 n'est donc toujours pas prouvée corrigée.

**Vols** (`t1/vols.cjs` de l'auteur, relu : il ne diffère du mien que pour compter les pendues SP9 du lot comme pendues ; graines 1201-1260) :
- vols dans une pendue : **0** aux trois paliers, au saut naturel comme au nitro +40 ;
- vols contre une autre tour : **identiques à HEAD** (0 / 5 / 125 au naturel, 218 / 924 / 1460 au nitro).

**Route et objectifs du lot E.** `genCtrl1` ne change que par un commentaire, et l'empreinte sans drapeau est égale à ff6a3a14d. Les objectifs du lot E sont donc **ceux de HEAD, par construction**. Je ne les ai pas re-mesurés.

**D2, la variété : non faite.** Le paquet est celui de HEAD (au palier 20, 69 routes sur 80 sont « parking, slalom des tours », d'après la consigne). C'est un écart à la demande de Sacha, mais il est permis : je le note sans le compter comme défaut.

### 3. Coût
**Comptes en Chrome** (`?tel=1`, palier 0, même route, HEAD → lot ; appels moyens / max, triangles moyens / max) :

| | appels moyens / max | triangles moyens / max | programmes |
|---|---|---|---|
| g1225, 844×390 | 112 / 151 → 111 / 150 | 298 k / 385 k → 293 k / 392 k | 157 = 157 |
| g1215, 390×844 | 92 / 140 → 94 / 139 | 209 k / 366 k → 218 k / 365 k | 157 = 157 |

- 0 programme compilé en course ✔.

**Bâti du décor** (Node sous `vm`, ALLEGE, graines 1201-1240, alterné deux fois, médianes) :
- palier 0 : 22 / 18 → 31 / 39 ms ;
- palier 20 : 26 / 30 → 80 / 74 ms.

J'ai vérifié d'où vient la hausse. Le même code `vePendVolG`, sur la route 401 au palier 20, coûte :
- **2,06 ms en Node pur** ;
- **87,7 ms dans un contexte `vm`**.

La hausse vient donc du banc (×40 sur ce code). Le coût réel est d'environ 2 ms, rendu en tranches (`ech9`).

**Pas mesuré en Chrome** : la plus longue tranche du bâti.

### 4. Le vrai jeu (Chrome, verrou « ville-cyber-d », place 2, 20:25:29 → 20:29:35, rendu)
Profils supprimés, Chrome tués. Courses `?tel=1&carte=ville&meteo=pluie`, palier 0 :
- graine 1225, la plus dense en pendues dans `decor.cjs` (pieds à 60-73 m), en 844×390 ;
- graine 1215 en 390×844 ;
- teinte violette forcée, HEAD contre le lot ;
- plus la graine 1225 **sans teinte forcée** sur le lot.

Toutes les courses roulent en `dbgAuto`, sans nitro. Résultats :
- **Aucune erreur console, aucune mort.**
- `dbgVilleAudit` : dans 0, frôle 0, flotte 0 partout.
- Rayon vers le haut, une tour au-dessus de la caisse :

  | | HEAD | lot | lot, teinte libre |
  |---|---|---|---|
  | 844×390 | 0 % | 12,8 % | 7,8 % |
  | 390×844 | 0 % | 2,8 % | |

**Les photos, que j'ai regardées** (`t2/chrome/pl-844.jpg`, `pl-390.jpg`, `pl-nat.jpg`) :
- **844×390, violet.** Sur 6 photos, une seule diffère à l'œil (s 3316). En haut à gauche, un grand **aplat violet uni, sans fenêtres, de la couleur du ciel**. On le lit comme un trou dans l'image, pas comme un immeuble translucide. Les 5 autres sont presque identiques à HEAD.
  Le côté « entre des tours » existe déjà à HEAD sur cette graine : le canyon est dense des deux côtés.
- **390×844, violet.** Rien ne se lit. La caméra de poursuite cadre sous les pendues, et le rayon n'en trouve que 2,8 % du temps.
- **844×390, teinte libre.** Le tirage a donné l'**ambre (jaune)**. Les pendues **se voient** (s 2910-3309) : des **blocs bruns à fond plat qui flottent** au-dessus de la route, sans pied ni fondu. Elles ont l'air d'une géométrie cassée, pas d'immeubles « à l'envers, transparents, violets ».
  Le violet n'est qu'une des teintes du tirage. L'effet voulu n'est donc garanti dans aucune course.
- La route reste lisible et la voiture visible, partout ✔.

**Le jeu du 3/11** (servi depuis `ancienne/`, lancé par `dbgAudit('aller',{carte:'ville',meteo:'pluie',teinte:'violet'})`) :
- La course **part bien en ville violette**, contrairement au tour 1.
- Mais mon déclencheur de photo (le rayon vers le haut, maillages instanciés de plus de 50 instances) n'a rien trouvé : **0 photo**. La comparaison visuelle avec le 3/11 reste donc à faire.
- À noter : le 3/11 coûtait 240-248 appels et 674-682 k triangles en moyenne, contre 92-112 appels aujourd'hui.

### Défauts
**Bloquant :**
1. **L'effet est absent ou illisible à l'image** (le défaut 1 du tour 1, toujours ouvert, et reconnu par l'auteur).
   - En violet : un aplat violet sans fenêtres sur une photo sur six en 844×390, rien en 390×844.
   - En teinte libre (ambre) : des blocs bruns qui flottent, à fond plat.
   - On ne se sent jamais « enclavé sous et entre des immeubles violets translucides ».

**Mineurs :**
2. Le commentaire d'en-tête des pendues (`ville-etages.js`) est périmé : « ni marque SP9 », et les mesures du tour 0.
3. L'enseigne flottante de la graine 37 n'est pas prouvée corrigée. Le lot ne change aucune flottante sur 240 routes.
4. D2 n'est pas fait (permis).
5. Le commit embarquera environ 3 300 lignes d'index venues de HEAD (défaut 9 du tour 1, inchangé).

### Ce que je n'ai pas vérifié
- Les photos du jeu du 3/11 : la course part, mais aucune photo n'a été prise.
- La plus longue tranche du bâti en Chrome.
- Les paliers 10 et 20 en Chrome.
- Les sauts nitro joués en jeu : seul le modèle Node les couvre.
- La vitrée.
- L'iPhone.
- Les objectifs du lot E : pas re-mesurés, égaux par construction.
