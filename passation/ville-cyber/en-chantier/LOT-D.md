# Lot D : les tours pendues (D1) et la variété du paquet (D2), 19/11/2026

Worktree `.lots/d`, détaché sur ff6a3a14d. Rien n'est commité ni poussé, et `sw.js` n'est pas touché. L'index est assemblé (`--depuis-morceaux`) et `--verifier` est vert.
Bancs et sorties : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-d/` (appelé `lot-d/` plus bas ; le tour 1 est dans `lot-d/t1/`).

## Après le contrôle, tour 2 (CONTROLE-D.md, tour 2)

Sorties : `lot-d/t3/` (bancs Node, planches) et `lot-d/t2/chrome/` (photos). Planches copiées dans `passation/ville-cyber/planches/pendues-t2-*.jpg`.
D2 reste **non fait** (la consigne le permet ; voir plus bas). La route est toujours celle de ff6a3a14d au bit près.

**Fichiers touchés en plus du tour 1 :** `ville-v3.js` (le fondu court des pendues ; l'audit des rails) et `ville-scenes.js` (les rails des couloirs posés sur la dalle).

### Les défauts, un par un
**1. (bloquant) L'effet ne se lit pas à l'image. Changé, mais TOUJOURS PAS PROUVÉ à l'œil (⚠ ouvert, décision pour Sacha).**
- Ce qui a changé depuis les photos du contrôle :
  - **le mur et la voûte** : les pendues ne sont plus posées sur l'axe de la route du bas (vues par en dessous, elles ne montraient que leur fond). Elles vont **par paires, de part et d'autre** de la route du bas, l'arête intérieure à 0,3-1,1 × ROAD_HALF de l'axe. On voit leurs faces, et la paire fait le tunnel ;
  - **le fondu court** : leurs volumes sont marqués « pied court » (bleu + 8 dans la couleur d'instance, `PCT9`). `villePiedSP` les fond sur `VE_PEND_FC` = 110 m au lieu de 280 : la même courbe (violet de brume au pied, fenêtres pleines plus haut), ramenée dans la hauteur que la caméra en voit. Plus de voile séparé, plus de bloc SP9 à fond plat. Même matière, même programme (157 = 157 en Chrome) ; le décodage n'existe que sous `VILLE_ETAGES`.
- Node (`decor-fl.cjs`, graines 1201-1280) : pendues exprès 14,7 / 14,6 / 12,7 par route (7,4 sous ALLEGE) ; route « entre » deux pendues 39,8 / 26,5 / 19,8 %.
- **Chrome** (verrou « ville-cyber-d » place 1, 21:20:25 → 21:24:38, rendu ; profils supprimés, Chrome tués ; muet) : `?tel=1`, palier 0, graine 1225 en 844×390 et 1215 en 390×844, HEAD contre le lot, plus la graine 1225 sans teinte forcée.
  - Aucune erreur console, aucune mort. `dbgVilleAudit` 0 / 0 / 0 partout.
  - Appels moyens / max : 114 / 142 → 112 / 145 (844) ; 96 / 125 → 99 / 142 (390). Triangles max 380 k → 392 k ; 362 k → 340 k. Programmes 157 au départ = 157 à la fin.
  - Sans teinte forcée, la graine 1225 est sortie **violette** cette fois (le tirage de teinte ne dépend pas de `pistegraine`).
- **Ce que montrent les photos** (`pendues-t2-844-g1225.jpg`, `pendues-t2-390-g1215.jpg`) : après, plus de tours à fenêtres dans le haut de l'image, des deux côtés. Plus d'aplat violet sans fenêtres ni de bloc brun à fond plat. **Mais je ne peux pas dire qu'on se sent « enclavé sous des immeubles à l'envers »** : les photos tombent rarement au bon endroit (le banc photographie à l'abscisse, avec du retard), et le flou de vitesse noie le haut de l'image.
- **Le jeu du 3/11 en photo, pour la première fois** (390×844, `pendues-t2-0311-contre-lot.jpg` ; en 844×390 il reste bloqué sur l'écran de la plaque) : ce qui fait « dans la ville » le 3/11, ce sont surtout :
  - une image **nette** (pas de flou de vitesse) ;
  - une caméra **plus basse et plus serrée** ;
  - des tours **hautes et proches**, fenêtres allumées, qui remplissent la moitié haute de l'écran des deux côtés.

  Sur ces photos, on ne voit pas non plus de tour pendue au-dessus de la caisse : le rayon vers le haut en trouve 7,5 % du temps. **L'écart avec le 3/11 tient donc d'abord à la caméra et au flou de vitesse, pas aux pendues.** Les deux sont hors de ce lot (caméra = gameplay ; flou = rendu partagé).
  - Coût du 3/11 dans ce banc : 211 appels, 556 k triangles en moyenne (390×844), contre 99 / 239 k aujourd'hui.

**2. (mineur) L'en-tête périmé de `ville-etages.js`.** Corrigé : il décrit la paire, le fondu court (`PCT9`, `VE_PEND_FC`) et ne parle plus ni de voile ni de « ni marque SP9 ».

**3. (mineur) Les enseignes flottantes. Trouvées et corrigées sous la route à étages.**
- Graine 37 (`decor-fl.cjs`, paliers 0 / 10 / 20) : **aucune flottante** en Node, ni à HEAD ni dans le lot ; le contrôle n'en voit pas non plus en jeu. La paire du contrôle E n'est pas reproductible sur ff6a3a14d.
- Les 23 / 27 / 8 routes du contrôle (graines 1201-1280) : **ce sont toutes des RAILS de couloir, une paire par route, rien d'autre.** Mesuré : ils sont posés droit à `yb` (le bas de la route dans le couloir), alors que la route descend dans le tunnel. En leur milieu, ils sont **22 m sous la route**, 29 m de l'axe : ils flottent vraiment, sous la dalle.
- Correction (`couloir`, ville-scenes.js), **sous `veActif()` seulement** : si la route monte ou descend de plus de 2 m dans le couloir, le rail se pose par tronçons de 8 m à la hauteur de la route. Sinon, c'est le rail d'avant.
  - Rails « en l'air » (moins de 3 points sur 5 portés par la dalle) : 46 / 54 / 16 → **0 / 0 / 0**.
  - Néons +10 / +20 / +5 par route, instanciés (0 appel de plus).
- `dbgVilleAudit` jugeait les rails comme des enseignes adossées à une façade, d'où la « flotte 2 » de la graine 451. Ils sont maintenant jugés posés sur la dalle (« rail » dans `flottes` s'ils ne le sont pas). Ce n'est que du banc, aucun effet sur le décor.
- **Le socle (`?sans=villeetages`) garde ses rails en l'air** : 40 routes sur 80 à chaque palier, une paire chacune. C'est le prix de l'identité au bit près ; à corriger dans un lot à part si Sacha le veut.

**4. (mineur) D2 non fait.** Inchangé, voir « D2 : non fait » plus bas.

**5. (mineur) L'index.** Inchangé : **le commit emportera environ 3 300 lignes d'index venues des morceaux de HEAD** (l'index commité à ff6a3a14d était en retard). Il faut le dire dans le message de commit.

### Identités et sûreté (tour 2)
- Routes (`empreinte.cjs graines=1-12`), toutes conformes : `?sans=villeetages` 17b89297a6b8 / 9dc6766ea34f ; `?sans=villeetages,villecyber` d63b36e2af8b / fb378a8c6756 ; ville sans drapeau 77f22cbf4933 / 7aec17e77c92 (= ff6a3a14d) ; crypto, nuages et espace aux empreintes de la consigne.
- Décor du socle (`?sans=villeetages`, graines 1201-1280) : `09db1359ff0a` aux paliers 0 / 10 / 20 et `9248d9ba0288` sous ALLEGE, **égaux à HEAD** (valeurs du contrôle, tour 2).
- Décor avec le lot : `f157c7397756` (ALLEGE `de37f3a713dc`). Dans 0, frôle 0, règle des 14 m sur les pendues 0, air minimal sous une pendue 60 / 90 / 91 m.
- Vols (`t1/vols.cjs`, graines 1201-1260) : **0 vol dans une pendue** aux trois paliers, au naturel comme au nitro +40. Les vols contre les autres tours sont égaux à HEAD (0 / 5 / 125 et 218 / 924 / 1460).
- Gardes : `garde-demarrage` OK, `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔. Aucun nom en double (`PCT9`, `VE_PEND_FC`, `VE_PEND_IE0`, `vePendVolG`, `nPV` : une déclaration chacun).

### Pas vérifié (tour 2)
- Que l'effet « enclavé sous des immeubles à l'envers » se lise : voir le défaut 1.
- Les paliers 10 et 20 en Chrome, les sauts nitro joués en jeu, la plus longue tranche du bâti en Chrome, la vitrée, l'iPhone.
- Le 3/11 en 844×390 (écran de la plaque).

### Décisions pour Sacha (tour 2)
1. **L'effet du 3/11 vient d'abord de la caméra et de la netteté**, pas seulement des tours. Faut-il un lot « caméra basse et sans flou de vitesse en ville » ? Il touche au gameplay et au rendu partagé.
2. Les pendues en paires (mur et voûte) et le fondu court sur 110 m : garder, ou revenir à une pendue seule sur l'axe ?
3. Les rails en l'air du socle (40 routes sur 80) : à corriger aussi hors route à étages ? Cela change le décor de `?sans=villeetages`.
4. D2 : la variété du paquet contre les scènes (inchangé).

## Après le contrôle, tour 1 (CONTROLE-D.md)

**Décision : D1 seul est livré. D2 est retiré, il est noté « non fait »** (consigne : « si D2 menace D1, livre D1 seul »).
D2 portait deux des trois défauts bloquants (le tirage à +42-49 % au palier 20, et l'essentiel des vols contre une tour) et trois défauts mineurs (les scènes et le tunnel qui disparaissent, l'enclavé en recul, plus de tours au palier 10).
Sans lui, **la route est celle de ff6a3a14d au bit près** : ville sans drapeau `77f22cbf4933` / `7aec17e77c92`. Le tirage ne coûte donc rien de plus, et les objectifs du lot E sont ceux du lot E.
Le code de D2 du tour 0 est gardé dans `lot-d/t1/lotD-tour0.diff`, pour un lot à part.

Fichiers touchés maintenant :
- `code/maps/jade-balade.js` : la passe des tours pendues ;
- `code/maps/ville-etages.js` : leurs réglages et le calcul des vols ;
- `code/maps/ville-scenes.js` : les enseignes de la passerelle et de la façade ;
- `code/maps/ville-entree.js` : **le commentaire de mParking seulement**.

Aucun nouveau morceau, aucun nouveau nom en double.

### Les défauts, un par un

**1. (bloquant) L'effet ne se voyait pas à l'image. Reproduit et expliqué ; la correction ne suffit PAS à l'image (⚠ toujours ouvert).**
- Passe Chrome 1 : `?tel=1&teinte=violet`, graines 451 (844×390) et 447 (390×844), photos à la même abscisse avant et après (D2 retiré, la route est la même). Les deux colonnes sont **presque identiques** : `lot-d/t1/chrome1/pl-844.jpg`.
- J'ai projeté les pendues de ces graines dans la caméra de poursuite (Node, `lot-d/t1/dump/`). À chaque photo, une pendue est bien dans le haut de l'image, 80-200 m devant, son pied 50-60 m au-dessus de la caisse.
- Mais on n'en voit que les 60-120 m du bas. Or `villePied` noie les 280 premiers mètres d'un volume (`mb = smoothstep(10, 280, vB9)`) vers la couleur de la brume, c'est-à-dire, sous la pluie violette, **la couleur du ciel**. La pendue est dans l'image, mais elle est invisible.
- La ville ambre du contrôle était sur la route de D2. Sans teinte forcée, la graine 447 était violette à HEAD, et le lot a maintenant la route de HEAD. Mes passes forcent `teinte=violet`, donc **je ne l'ai pas revu sans forçage**.
- **Correction, sans matière ni programme de plus.** Une pendue est maintenant faite de deux parties :
  - un **voile** de `VE_PEND_F` = 36 m, le pied qui se noie en violet, comme au 3/11 ;
  - un **corps marqué « sans pied »** (SP9, bleu + 4 : le chemin déjà compilé des scènes), dont les fenêtres se lisent dès le haut du voile.
- Résultat Chrome : **à peine visible**. Voir « Passe Chrome 2 » plus bas.

**2. (bloquant) Le tirage coûtait +42 à +49 % au palier 20.** Cela venait de D2 (le plan et `VE_KTMAX` 4,6). D2 est retiré, et `genCtrl1` est revenu au caractère près à ff6a3a14d : les empreintes de la ville sont égales, sans drapeau comme avec. Le coût du tirage est donc celui de HEAD.

**3. (bloquant) Un saut nitro pouvait finir dans une pendue. Corrigé.**
- `vePendVol` (ville-etages.js) calcule la plus haute caisse en vol au-dessus de chaque point de la route. C'est le modèle du contrôle (`controle/vols.cjs`), avec un saut plus fort et plus long :
  - un saut tous les 16 m, à la pente plus 40 m/s ;
  - 0,8 / 1 / 1,25 fois la vitesse réelle du palier (`DUREE_ELAN`) ;
  - 6 s de vol au plus, chute `FALL_G` ;
  - le vol s'arrête quand il touche le bitume.
- Le pied d'une pendue passe 8 m au-dessus de tout vol sous son emprise (rayon `hd + ROAD_HALF + 24`).
- Un vol « dominé » s'arrête : il est plus bas qu'un autre au même point et ne peut plus le rattraper (l'écart entre les deux est linéaire en temps). Le calcul rend aussi la main à l'échéance (`ech9`).
- Coût en Node pur, graine 401 au palier 20 : **1,8 ms**. Les chiffres plus élevés du banc vm (8-28 ms) viennent du vm de Node, qui ralentit l'accès aux globales.
- Mesure : `lot-d/t1/vols.cjs` est le banc du contrôle, qui compte aussi les pendues marquées SP9. Sortie dans `out2/` :

  | | palier 0 | palier 10 | palier 20 |
  |---|---|---|---|
  | +21 m/s, 2 s (401-460) : vols dans une pendue | **0** | **0** | **0** |
  | +21 m/s, 2 s : autres tours (HEAD) | 0 (0) | 226 (226) | 228 (228) |
  | +40 m/s, 5 s (401-480) : vols dans une pendue | **0** (HEAD 0, tour 0 : 128) | **0** (tour 0 : 290) | **0** (tour 0 : 4973) |
  | +40 m/s, 5 s : autres tours (HEAD) | 295 (295) | 1178 (1178) | 1589 (1589) |

- Les vols contre les autres tours sont **exactement ceux de HEAD**. Ils sont antérieurs au lot : le canyon et `tourLibre` à +44 m.
- **Pas vérifié en jeu.** Aucun saut nitro n'a été joué en Chrome.

**4. (mineur) Les scènes et le tunnel disparaissaient.** C'était D2. D2 retiré, les scènes sortent comme à HEAD.

**5. (mineur) L'enclavé reculait.** C'était D2. La route est celle du lot E : enclavé 75 / 57 / 53 % (LOT-E.md).

**6. (mineur) Plus de tours et d'appels au palier 10.** `decor.cjs`, graines 401-480, tours / volumes par route, HEAD → lot :

| palier | HEAD | lot |
|---|---|---|
| 0 | 804 / 2326 | 801 / 2326 |
| 10 | 982 / 2815 | 978 / 2819 |
| 20 | 1267 / 3845 | 1265 / 3849 |

- Les volumes des pendues sont pris sur la forêt du large, à ±0,1 %.
- Appels en Chrome : voir la passe 2.

**7. (mineur) Sous ALLEGE, 70 % des pendues au lieu de la moitié. Corrigé.** Sous `ALLEGE`, une pendue retenue sur deux est sautée (`nPC`), en plus du plafond divisé par deux.
- Pendues exprès par route, graines 401-480, sans → avec ALLEGE : 11,0 → **5,8** au palier 0, 10,9 → **5,7** au palier 10.
- La garde est sur `ALLEGE`, pas sur `IS_MOBILE`.

**8. (mineur) Les enseignes flottantes en Node.** Le banc `lot-d/t1/decor-rails.cjs` sépare les rails des couloirs (`CITY.railN`).
- Graines 401-480 × 3 paliers : 62 routes sur 240 ont une « flottante », **autant qu'à HEAD**.
- **Toutes, sauf une, sont les RAILS des tunnels** (`couloir`, ville-scenes.js). Ils sont posés au bord de la route, à ±29 m, contre la paroi `murCote`, qui n'est pas un volume de béton : l'audit ne la voit pas.
- La seule autre flottante (graine 423, palier 20) est **la même à HEAD**.
- Le lot n'ajoute aucune flottante. Les 7 routes du contrôle venaient des routes de D2.
- En jeu, `dbgVilleAudit` voit aussi une paire de rails (graine 451 : `flotte 2` à x 751 / 809, **avant comme après**). C'est antérieur au lot, et c'est à l'audit d'exclure `CITY.railN`. **Je n'y ai pas touché** (hors périmètre).

**9. (mineur) L'index commité à HEAD est en retard sur `code/`.** C'est vrai, et ce n'est pas du lot. `code/` fait foi, et l'index est réassemblé depuis les morceaux. **Le commit du lot emportera environ 3 300 lignes d'index qui viennent des morceaux de HEAD** : il faut le dire dans le message de commit.

### Passe Chrome 2 (verrou « ville-cyber-d »)
Le verrou a été pris de 20:07:01 à 20:09:38, puis rendu. Les profils sont supprimés et les Chrome tués. Une première attente de 40 min (19:16 → 19:56) n'avait pas eu le verrou. Sorties : `lot-d/t1/chrome3/`.

Courses `?tel=1&carte=ville&meteo=pluie&teinte=violet`, palier 0, HEAD (`controle/ref`) contre le lot, à la même route :
- graine 451 en 844×390 ;
- graine 447 en 390×844 ;
- graine 37 en 390×844.

Aucune erreur console, aucune mort.

| | 844×390, g451 avant → après | 390×844, g447 | 390×844, g37 |
|---|---|---|---|
| appels moyens / max | 102 / 136 → 104 / 141 | 104 / 139 → 103 / 130 | 97 / 122 → 98 / 129 |
| triangles max | 363 k → 365 k | 338 k → 327 k | 344 k → 346 k |
| programmes au départ = à la fin | 157 = 157 → 157 = 157 | 153 → 153 | 154 → 154 |
| rayon vers le haut : une tour au-dessus de la caisse | 1,4 % → 8,3 % | 1,4 % → 5,4 % | 1,8 % → 4,9 % |
| `dbgVilleAudit` dans / frôle / flotte | 0 / 0 / 2 → 0 / 0 / 2 (les rails, voir 8) | 0 / 0 / 0 → idem | **0 / 0 / 0 → 0 / 0 / 0** |

**Graine 37 :** pas de flottante, ni à HEAD ni dans le lot, à la même route. La paire du contrôle E n'est donc pas reproduite. La correction des enseignes reste **sans preuve en jeu**, mais elle ne casse rien.

**Ce que montrent les photos** (planches `passation/ville-cyber/planches/pendues-jeu-844-g451.jpg` et `pendues-jeu-390-g447.jpg`, avant à gauche, après à droite, même abscisse) :
- Le haut de l'image est par endroits plus sombre, avec une masse de fenêtres. C'est le corps d'une pendue (s 2060, s 2430).
- **Mais les deux colonnes restent presque pareilles. On ne se sent pas « enclavé sous des immeubles violets ».**

**Ce qui l'empêche, d'après mes mesures :**
- Au téléphone (ALLEGE), il n'y a que **5,8 pendues par route**, la moitié demandée.
- La caméra de poursuite ne cadre que leur bas.
- Sous la pluie, `uWet9` noie vers un plafond sombre tout ce qui monte au-dessus de l'œil.
- Le flou de vitesse fait le reste.

**Projection Node** (`lot-d/t1/lisible.cjs`, caméra approchée : 14 m derrière, 6 m au-dessus, champ vertical de 94°, graines 401-440, palier 0). Part des images où une pendue montre des fenêtres lisibles sur au moins 20 % de la hauteur de l'écran, tour 0 (fondu entier) → tour 1 (voile et corps) :
- 23 → 41 % sans ALLEGE ;
- 18 → 35 % sous ALLEGE en 844×390 ;
- 9 → 18 % en 390×844.

Ce modèle **surestime** : il ne compte ni l'occlusion, ni la pluie, ni le flou. Les photos du tour 0 ne différaient pas de HEAD.

**Pistes, à décider** (aucune n'est faite) :
- le fondu court pour les volumes SP9, l'option B de l'enquête : il faut toucher `villePiedSP`, donc le shader du socle (même programme, une ligne) ;
- plus de pendues au téléphone que la moitié ;
- poser les pendues en murs à 40-80 m de l'axe du bas, plutôt qu'en voûte au-dessus : on les verrait de face, pas par le dessous ;
- juger par temps clair : la pluie assombrit tout ce qui est au-dessus.

### Identités (tour 1)
- Routes (`empreinte.cjs graines=1-12`) :
  - `?sans=villeetages` : `17b89297a6b8` / `9dc6766ea34f` ✔ ;
  - `?sans=villeetages,villecyber` : `d63b36e2af8b` / `fb378a8c6756` ✔ ;
  - crypto `5447610bd8f2` / `eae97981f833`, nuages `469d52aff855` / `2e1661d8fe93`, espace `9c99fae61d38` / `ea2d9e750351` ✔ ;
  - **ville sans drapeau `77f22cbf4933` / `7aec17e77c92`, comme ff6a3a14d** (D2 retiré).
- Décor avec `?sans=villeetages`, vrai `buildVoxCity` en Node (graines 401-480) :
  - paliers 0 / 10 / 20 : `c4e04e7ee962` ;
  - ALLEGE, paliers 0 / 10 : `aecd887604c1`.

  Ce sont les empreintes de HEAD relevées par le contrôle ✔.
- La vitrée et Crypto City : gardes `veActif()` et `!CR`, empreintes crypto inchangées. La vitrée n'est pas tirable par le banc.
- Gardes : `garde-demarrage` OK, `garde-allege` ✔, `garde-charte` OK, `--verifier` ✔.

### Génération (graines 401-480, `decor-rails.cjs`)
- `dans` 0 et `frôle` 0 partout.
- Règle des 14 m sur les pendues exprès : 0.
- Air minimal sous une pendue exprès : 60 m au palier 0, 90 m aux paliers 10 et 20.
- Pendues exprès par route : 11,0 / 10,9 / 8,5, entre 2 et 16. Au palier 20, l'enveloppe des vols en relève ou en refuse.
- Route sous une pendue : 21,3 / 15,4 / 10,8 %, contre 9,6 / 7,7 / 6,9 % à HEAD.

## D2 : non fait, ce qu'il en reste à faire
- Le tour 0 a montré que l'objectif chiffré était tenable : suite la plus fréquente à 9-11 %, chaque module du 3/11 et du lot A dans 10-13 % des routes.
- Mais à ce prix :
  - une seule carte par route aux paliers 0-10, donc les scènes, dont le tunnel, tombaient à 1-4 % ;
  - `VE_KTMAX` 4,6, pour garder 4 tours de virage, faisait monter le tirage du palier 20 de +42-49 % et triplait les vols exposés aux tours ;
  - l'enclavé reculait de 4-5 points.
- Un D2 sain devrait garder une place de scène en plus du plan, ou allonger la route d'une carte.
- Il faudrait aussi tenir le virage du palier 20 autrement que par `VE_KTMAX`, et se mesurer avec `ville-tirage-ab.cjs` et `vols.cjs` **avant** d'être livré.
- **Choix pour Sacha** : la variété contre les scènes.
- Le commentaire de mParking, lui, est corrigé (`ville-entree.js` l. 420) : pente ~21-24 % au palier 0, ~15-17 % au palier 10, ~9-11 % au palier 20 ; ailleurs ~9 %.

## Ce que le tour 0 avait fait et qui reste (D1)
- La passe « LES TOURS PENDUES » est dans `buildVoxCityG`, juste après le canyon, gardée par `VED = VAME9 && !CR && veActif()`.
- Elle avance par pas de 90 m. Là où un étage passe 100-480 m plus haut, à moins de 300 m, elle pose au-dessus de la route du bas une tour du canyon de l'étage du haut :
  - à 40 m au plus de l'axe du bas ;
  - à l'écart de la route du haut ;
  - pied à 60 / 90 m (et maintenant au-dessus de tout vol) ;
  - toit 120-450 m au-dessus de l'étage du haut.
- Elle passe par `tourLibre`. Elle n'entre jamais dans AIRZ, sur une géante ou dans une scène.
- Aucun tirage `vr`. 16 tours au plus (8 sous ALLEGE). Ses volumes sont pris sur la forêt du large.
- Les enseignes de la passerelle et de la façade tiennent dans la hauteur de leur tour sous `veActif()`.

## Ce qui n'est PAS vérifié, et les décisions pour Sacha
**Pas vérifié :**
- **Que l'effet se lise à l'image : ce n'est pas le cas.** Le défaut 1 reste ouvert, voir la passe Chrome 2.
- Le jeu du 3/11 en photo. J'ai fait deux essais, `?carte=ville&teinte=violet` sur l'index d'aa160 : en 844×390, la course ne part pas ; en 390×844, elle part en nuages. Je n'ai pas insisté, le verrou était trop demandé.
- Les paliers 10 et 20 en Chrome.
- Les sauts nitro en jeu.
- L'iPhone.
- La vitrée en jeu.

**Décisions pour Sacha :**
1. **L'effet n'est pas encore là à l'image.** Toucher le shader (fondu court SP9), doubler les pendues au téléphone, ou les poser en murs : laquelle ? Le voile de 36 m : plus long, ce serait plus « transparent » mais moins lisible.
2. 16 pendues par route au plus, 8 au téléphone.
3. D2 : la variété du paquet contre les scènes (voir plus haut).
