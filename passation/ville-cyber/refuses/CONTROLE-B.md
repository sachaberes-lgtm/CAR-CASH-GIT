# CONTRÔLE ADVERSE DU LOT B — « L'IMMEUBLE QU'ON TRAVERSE » (`?sans=villehall`)

## Tour 1 (2026-11-18, nuit)

Contrôleur : ne croit rien du rapport `LOT-B.md`, exécute avec SES graines (101-160 + 32 bits : 123456789, 987654321, 2000000011,
305419896, −559038737). Bancs du contrôle : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-b/controle/`
(`ctl.cjs` empreinte + décor de toutes les scènes sur la route Catmull-Rom à 1 m, `ana.cjs`, `sim.cjs` décollages, `droit.cjs` droites, `hc.cjs` + `chrome.sh` Chrome sous verrou).
Référence « avant » : `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59` (index assemblé, même code que a42e9ec50).

### VERDICT : **REFUSÉ** (un défaut bloquant prouvé en Node : le raccourci perdu au palier 20 ; le jeu en Chrome n'a pas pu être contrôlé)

### 1. Identité, périmètre, gardes — VERT
- `SEARCH='?sans=villehall' node outils/banc-routes/empreinte.cjs graines=1-12` (dans `.lots/b`) : ville p0 **d63b36e2af8b**, p10 **fb378a8c6756** ;
  sans drapeau : crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 — = référence.
- Mes graines (65 graines × paliers 0/10/20 × ville, crypto, nuages, espace, vitrée = 975 routes), `ctl.cjs` : référence ↔ lot `?sans=villehall` :
  **0 écart** de route (ctrl au cm), 0 écart des ancres FILETMARK, **0 écart du décor des scènes** (empreinte de V.corps/genre/neon/neonC, nombre de couloirs,
  abris, rails). Référence ↔ lot SANS drapeau pour crypto/nuages/espace : 0 écart. (Vitrée : `VIT_SOL is not defined` dans le chargeur Node, avant comme après — non vérifiable en Node.)
- `git diff` : seulement `code/maps/ville-scenes.js`, `code/maps/ville-entree.js`, index.html réassemblé (avec référence assemblée : 86 lignes de diff), bancs neufs dans
  `outils/banc-routes/`, `passation/ville-cyber/`. Ni sw.js, ni autre map, ni rendu partagé. Aucun ALLEGE/IS_MOBILE touché. Regex `(\w+)` de `?villescene=` intacte.
- `node code/assembler.cjs --verifier` ✔ (347 morceaux, 13 150 302 octets) ; `garde-demarrage` OK ; `garde-allege` ✔ ; `garde-charte` OK.

### 2. Génération, banc Node des vrais générateurs (65 graines × p0/10/20, `ctl.cjs`, `ana.cjs`)
Route échantillonnée comme le jeu (Catmull-Rom centripète, ~1 m), `vsReserve` (non-essai) + `vsBatirG` mené au bout, puis CHAQUE volume / néon (rails exclus) de
CHAQUE scène contre TOUS les points de la route (règles de dbgVilleAudit : dans = couloir ±(ROAD_HALF+1), 0,3-7 m ; frole = < 6 m du bord, −1/+12 m).

| | p0 avant → après | p10 | p20 |
|---|---|---|---|
| plans 'tunnel' bâtis | 36/36 → 33/33 | 31/31 → 31/31 | 31/31 → 31/31 |
| abandons du tunnel | aucun → aucun | aucun → aucun | aucun → aucun |
| toutes scènes bâties / abandons | 274/286 (passerelle:route 8, vrille:route 3, vrille:pont 1) → 253/267 (passerelle:route **10**, vrille 3+1) | 224/224 → 193/193 | 149/149 → 125/125 |
| dans / frole (toutes scènes) | 0/0 → 0/0 | 0/0 → 0/0 | 0/0 → 0/0 |
| route à < ROAD_HALF+14 m d'un volume du hall hors de sa bande | — → **0** | — → 0 | — → 0 |
| hauteur libre mini sous linteau/plafond (bitume) | 40 → **40,2 m** | 40,5 | 40,5 |
| chute de la route dans le hall (méd) | ~2 m → 7,8 m | → 17,4 m | → 17,6 m |
| modules par route | 5,72 → **5,37** | 4,48 → **4,00** | 3,20 → **2,95** |
| **raccourcis (saut / grand saut) par route** | 1,00 → 1,00 | 1,00 → 1,00 | **0,48 → 0,29** |
| tirage genCtrl (méd) | 68 → 67 ms | 67 → 68 ms | 70 → 72 ms |
| décor des scènes (vsReserve + vsBatirG, méd) | 2,8 → 3,1 ms | 3,1 → 3,5 ms | 2,8 → 2,5 ms |
| volumes par tunnel (méd) | 24 → 54 | 32 → 70 | 33 → 68 |
| erreurs | 0 | 0 | 0 |

- **DÉFAUT BLOQUANT — LE RACCOURCI DISPARAÎT AU PALIER 20.** Au p20, 12 routes sur 65 PERDENT leur raccourci (31 → 19 routes qui en ont un) : graines
  102, 108, 116, 122, 132, 134, 136, 138, 142, 146, 150, 158 — TOUTES des graines paires, celles où la traversée est imposée à l'ENTRÉE (ville-entree l. 508).
  Exemple g102 p20 : avant `traversée | plongeon en S | saut`, après `traversée | plongeon en S | rond-point` ; g108 : `… | saut` → `… | plongée`.
  Cause : `sHall` est bien plus long (ligne de mire 2,1 s réelles + hall 270-340 m × LV + sortie ; `VS_HALL_LONG` 12,3/7,3 s contre 7/3,2 s) et la route de p20 n'a
  plus la place. Gain nul ailleurs (0 graine qui gagne un raccourci). « Raccourcis toujours là » est une exigence explicite : non tenue.
- Variété en baisse : p10 crête des toits 22 → 6, virage de façade 15 → 3, passerelle 8 → 5 ; p20 passerelle 20 → 4 ; p0 3 traversées de milieu de route
  disparaissent (36 → 33) et 2 passerelles de plus abandonnées (« route »). Pour une demande « visiter une ville », moins de scènes par route va contre.
- `ville-torsades.cjs graines=101-160 carte=ville` avant / après : roulis, RMIN (2,04 / 1,95 / 1,76 rP au lieu de 2,04 / 1,93 / 1,78), torsades, boucles,
  recoupements au bruit près ; `boucles saut` p20 30 → 18 (le même raccourci perdu). Fichiers `tors-ref.txt`, `tors-lot.txt`.
- Droites (cap à ±6°, en s à la vitesse réelle, `droit.cjs`) : la plus longue par route passe de 2,1 / 1,9 / 2,3 s (méd) à 3,5 / 3,6 / 3,1 s (max 4,3 s) :
  c'est la ligne de mire voulue, sous la limite de 6,5 s de GENERATION-ROUTES.md. Pas un défaut.
- **Défaut mineur — les rails du hall sous le bitume** : `lumU(…, ys+.2, ys+1.6 …)` pose les deux rails (CITY.railN) à plat à la hauteur du POINT LE PLUS BAS du hall,
  alors que la route y descend maintenant de 5 % : à l'entrée le bitume est jusqu'à **12,5 m (p0), 19,2 m (p10), 19,7 m (p20)** au-dessus du haut du rail
  (méd 7,1 / 16,8 / 17,1 m). Les rails sont noyés dans le socle en marches ou flottent sous le bord de la dalle ; ils ne bordent la route qu'à la sortie.
- Pré-bâti : `vsBatirG` garde sa pause `ech9()` entre deux plans ; le hall est construit dans un seul pas (54-70 volumes au lieu de 24-33) : coût mesuré 2,5-3,5 ms
  pour TOUTES les scènes d'une route, sans risque pour JF.lim.
- Décollages (`sim.cjs`, vol balistique SANS volant ni aimant, g = 23 — pire cas grossier, bruité) : p0 aucune sortie de route liée au hall ; p10 « sortie du hall »
  10 → 20 atterrissages hors dalle (sur 60 routes), « dans le hall » 30 → 30 ; p20 29 → 0. Signal ambigu : le vol du jeu suit la route (non simulé). Non tranché.

### 3. Le vrai jeu en Chrome — NON EXÉCUTÉ (verrou)
Banc prêt (`controle/chrome.sh` : `hc.cjs` = le harnais CDP de l'auteur recopié, avec MES graines 104, 113, 131, avant = la référence, après = `.lots/b`,
course au pilote auto en paysage + vues pay/por, dbgVilleAudit, renderer.info.memory/programs ; puis `toutes.mjs cartes=ville paliers=0,10,20 graines=101-103` ;
puis une course en portrait). Le verrou commun a été attendu ≈ 55 min (06 h 36-07 h 31 : auteur-flushtot, ctl-pilote8, finition-canyon, auteur-hudmort,
une quinzaine de sessions en file) sans être obtenu ; j'ai arrêté mon attente proprement (aucun verrou pris, rien à rendre).
**Donc NON vérifié par moi** : 0 erreur console, course sans mort, dbgVilleAudit dans/frole/flotte en jeu, comptes renderer.info avant/après en ?tel=1,
toutes.mjs 0 ERREUR, la lecture à l'image sur téléphone (844×390, 390×844). Le rapport de l'auteur (§ 4.3) l'affirme sur ses graines 2, 3, 4 au p0 seulement.
Par construction (relu dans le code) : le hall pose ses volumes dans V.corps/V.genre et V.neon (instances des familles existantes) — 0 matière, 0 texture,
0 programme neufs ; volumes par tunnel ×2,2 (24-33 → 54-70), soit ~+400 triangles par hall.
Image : j'ai regardé les planches de l'auteur (`planches/hall-g3-pay*.jpg`) — l'approche dans l'axe et la tour plus haute se lisent à 300 / 150 m, la bouche a une enseigne,
sans cadre de lumière autour de la route ; l'intérieur reste un couloir de façades à fenêtres, l'atrium de 96 m se sent peu à hauteur de caisse. Les palettes avant/après
diffèrent (or / violet) : ce ne sont pas des vues comparables d'une même ville. Pas de jugement définitif sans mes propres photos.

### 4. Ce qu'il faut corriger avant un tour 2
1. **Le raccourci au p20** (bloquant) : les graines paires du p20 ne doivent pas perdre leur saut. Pistes : raccourcir la ligne de mire / le hall quand la
   traversée est l'ENTRÉE (elle suit déjà la droite surélevée de 2,6 s : l'axe est déjà là), ou borner la ligne de mire à p ≥ 10 (EL) ; puis prouver
   « raccourcis par route ≥ avant » sur ≥ 60 graines × p0/10/20.
2. La variété : modules par route −6 / −11 / −8 % (crête des toits et virage de façade quasi disparus au p10) — à ramener au bruit.
3. Les rails : les poser par tranche (yT) ou suivre la pente, pas à plat au point le plus bas.
4. Puis le banc Chrome (mes graines 104, 113, 131 ; paysage + portrait ; course p0, et une course aux paliers 10/20 à la vraie vitesse à la sortie −5 % → −14 % en virage).

### 5. Commandes
```
cd .lots/b && node code/assembler.cjs --verifier && node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh
SEARCH='?sans=villehall' node outils/banc-routes/empreinte.cjs graines=1-12 ; node outils/banc-routes/empreinte.cjs graines=1-12
C=…/scratchpad/lot-b/controle ; GR=101-160,123456789,987654321,2000000011,305419896,-559038737
node $C/ctl.cjs racine=<ref> graines=$GR cartes=ville,crypto,nuages,espace,vitree out=ref.json   (idem SEARCH='?sans=villehall' racine=.lots/b → sans.json ; racine=.lots/b → lot.json)
node $C/ana.cjs ; node outils/banc-routes/ville-torsades.cjs racine=<arbre> graines=101-160 carte=ville ; node $C/droit.cjs racine=<arbre> ; node $C/sim.cjs racine=<arbre>
```

## Tour 2 (2026-11-18, 08 h 15 - 09 h 20)

Contrôleur, tour 2 : ne croit rien de `LOT-B.md` § 8, exécute avec de NOUVELLES graines (161-230 + 32 bits : 4000000007, 271828182, 1414213562,
−123456789, 777777777 ; aucune de l'auteur ni du tour 1). Bancs : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-b/controle/t2c/`
(`ctl.cjs`/`ana.cjs`/`ana2.cjs` génération + décor, `rail2.cjs` rails du hall, `pas.cjs` temps de bâti, `sim10.cjs` décollages, `chrome2.sh` + `hc.cjs` vues et course,
`chrome3.sh` + `hc2.cjs` = **comptes renderer pendant la course** (crochet sur renderBufferDirect, moyenne par image du départ à la sortie du hall + 250 m)).
Référence « avant » : `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59` (code = a42e9ec50, index assemblé).

### VERDICT : **REFUSÉ** — coût de rendu en hausse nette à l'ouverture des graines paires (la « porte de la ville »), mesuré en course en ?tel=1, paysage ET portrait.
Tout le reste est vert (identité, génération, raccourcis, 0 mort, 0 erreur, gardes).

### 1. Identité, périmètre, gardes — VERT
- `SEARCH='?sans=villehall' node outils/banc-routes/empreinte.cjs graines=1-12` (dans `.lots/b`) : ville **d63b36e2af8b / fb378a8c6756** ; sans drapeau : crypto
  5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 (= référence). Vitrée : `VIT_SOL is not defined` avant comme après (chargeur Node).
  ⚠ `empreinte.cjs` ne fixe pas `VILLE_BANK.graine` : l'entrée (la porte) n'y joue pas ; elle est couverte par `ctl.cjs` ci-dessous.
- `ctl.cjs` 75 graines × p0/10/20 × ville, crypto, nuages, espace = **900 routes** (graine fixée, donc l'entrée jouée) : référence ↔ lot `?sans=villehall` **0 écart**
  de route (ctrl au cm), d'ancres FILETMARK et de décor (empreinte V.corps/genre/neon/neonC, couloirs, abris, rails) ; crypto/nuages/espace sans drapeau : **0 écart**. 0 erreur.
- Diff de `code/` contre la référence : `maps/ville-entree.js`, `maps/ville-scenes.js`, `maps/ville-v3.js` seulement ; index.html = 117 lignes de diff contre l'index
  assemblé de la référence (cohérent) ; `sw.js` identique. Aucun ALLEGE / TEL_NATIF / IS_MOBILE touché. Regex `[?&]villescene=(\w+)` intacte.
  Remarques mineures : une ligne de `ville-entree.js` (l. 561, `if(VRAC&&!vRac…`) n'a changé que d'indentation (bruit de diff) ; l'exclusion des rails de `flotte`
  dans `dbgVilleAudit` (`ville-v3.js`) vaut pour toutes les villes (audit seulement, sans effet de rendu).
- Noms neufs déclarés une fois dans index.html : VILLE_HALL, VS_HALL_LONG, VS_HA, vsAirSous, vHallE, sHall.
- `node code/assembler.cjs --verifier` ✔ (347 morceaux, 13 153 412 octets) ; `garde-demarrage` OK ; `garde-allege` ✔ ; `garde-charte` OK.

### 2. Génération, Node (75 graines × p0/10/20, vrais générateurs)
| | p0 avant → après | p10 | p20 |
|---|---|---|---|
| tunnels bâtis / abandons | 43/43 → 41/41, aucun | 37/37 → 37/37 | 37/37 → 37/37 |
| toutes scènes bâties | 313/323 → 316/326 (passerelle:route 5→4, façade:route 0→1, vrille 5→5) | 257/257 → 256/256 | 165/165 → 165/165 |
| dans / frole (toutes scènes) | 0/0 → 0/0 | 0/0 | 0/0 |
| route à < ROAD_HALF+14 m d'un volume du TUNNEL hors bande | 912 → **0** | 1085 → **0** | 1117 → **0** |
| routes avec un raccourci (saut/grand saut) | 75 → 75 | 75 → 75 | **36 → 44** (5 perdent, 13 gagnent) |
| modules par route | 5,69 → 5,75 | 4,49 → 4,48 | 3,12 → 3,13 |
| tirage genCtrl méd | 128 → 128 ms | 137 → 141 | 114 → 117 |
| décor de toutes les scènes méd | 5,5 → 6,5 ms | 6,8 → 7,6 | 4,6 → 5,0 |

- Le raccourci du p20 (bloquant du tour 1) : **corrigé**, sur mes graines aussi (36 → 44 routes avec un saut). Les 5 perdantes (172, 178, 198, 206, 222) gardent
  `crête des toits` + `rond-point`/`plongée` : c'est le tirage, pas une perte de parité.
- Variété au p20 déplacée (plongée 14 → 5, passerelle 18 → 9 ; crête 0 → 10, grand saut 0 → 4, saut 10 → 14) : total égal.
- **Rails du hall** (`rail2.cjs`, 40 graines, 62 halls) : la route reste dans l'axe du hall (écart latéral max 0,13 m) ; aucun rail sur la dalle (axe → rail ≥ 28,17 m) ;
  bas du rail −0,31 à +0,74 m du bitume. Corrigé.
- `ville-torsades.cjs graines=161-220` avant → après : RMIN 2,04/1,93/1,75 → 2,04/1,94/1,84 rP ; recoupements p20 5,43 → 3,13 ; torsades, roulis au bruit. Rien de pire.
- Décollages (`sim10.cjs`, vol balistique sans volant ni aimant, pire cas, p10, 60 routes) : « hall + sortie » 39 vides sur 29 routes → 52 sur 30 routes, plus courts
  (t méd 1,82 → 1,12 s) ; p20 30 → 0 ; p0 0 → 0. Même ordre qu'avant (le plongeon existait déjà) : non bloquant, non tranché sans le jeu au p10.
- Pré-bâti : sans JF en Node toute la construction est un pas ; `vsBatirG` complet méd 0,47 → 0,69 ms (p0), max 10,2 → 2,0 ; p10 max 1,5 → 4,0 ms. Le hall reste
  dans un seul pas entre deux `ech9()`. Au bruit (Mac chargé), non mesuré par tranche sur téléphone.

### 3. Le vrai jeu en Chrome (deux prises du verrou : 08 h 40-08 h 44, 219 s ; 09 h 14-09 h 19, 293 s ; rendu, Chrome et serveurs tués)
`?tel=1&villescene=traversee`, palier 0, pilote auto. Graines 162, 164, 170 (paires : la porte), 175, 189 (impaires).
- **Courses : 0 mort** (162, 164, 170, 175 avant et après ; 162/170 aussi en portrait) ; **0 erreur console** sur toutes les pages ; `dbgVilleAudit` **dans 0 / frole 0**,
  flotte 2 → 0 (les 2 enseignes flottantes de l'ancienne bouche ont disparu). 189 : aucune ancre tunnel à l'écran, avant comme après.
- `toutes.mjs cartes=ville paliers=0,10,20 graines=161-163` (lot) : 9 routes, **0 ERREUR**, hors ≤ 0,09, douilles 0-3(0), droites max 4,7 s, rMin ≥ 1,74 rP.
- **Comptes de rendu PENDANT LA COURSE** (`hc2.cjs`, moyenne/max par image, départ → sortie du hall + 250 m) :

| graine | orientation | appels moy (max) avant → après | triangles moy avant → après |
|---|---|---|---|
| 162 (porte) | paysage | 121,8 (145) → **139,0 (149)** | 327 k → 351 k |
| 164 (porte) | paysage | 113,2 (129) → 105,8 (114) | 303 k → 274 k |
| 170 (porte) | paysage | 99,6 (126) → **133,1 (138)** | 263 k → **362 k** |
| 162 (porte) | portrait | 102,2 (121) → **137,1 (147)** | 240 k → **345 k** |
| 170 (porte) | portrait | 93,0 (110) → **127,8 (138)** | 228 k → **350 k** |
| 175 (milieu, 45 s avant d'atteindre le hall) | paysage | 111,2 (142) → 112,9 (158) | 290 k → 286 k |

  Géométries / textures / programmes égaux (549/121/154 à la 162 ; 523-560 selon la route). Les vues fixes (`hc.cjs`, 7 vues × 2 orientations) disent pareil à la 162 :
  paysage 118 → 128 appels, portrait 84 → 102.
- **DÉFAUT BLOQUANT — LA PORTE COÛTE PLUS CHER À L'ÉCRAN.** Sur les graines paires, l'ouverture (≈ 20-25 s, de la droite du départ à la sortie du hall) tire
  **+13 % d'appels et +10 % de triangles en paysage** (moyenne des 3 graines, 2 sur 3 en hausse, jusqu'à +34 % / +38 % à la 170) et **+34-37 % d'appels, +44-54 % de triangles
  en portrait** (2 graines sur 2) ; le maximum par image monte de 121-126 à 138-149. Ce n'est pas le hall lui-même (ses volumes sont des instances des familles existantes,
  géométries égales) : c'est le CADRAGE — la porte pose la droite du départ dans l'axe de la trame, face à la ville et à la tour la plus haute ; la caméra voit l'avenue
  entière, donc beaucoup plus de cellules. C'est le prix de la ligne de mire, mais l'exigence de Sacha (« comptes ≤ avant, au bruit près ») n'est pas tenue, et en portrait
  (le format qui a le plus de ciel et de ville dans le champ) l'écart est trop régulier pour être du bruit. Une graine sur deux, au moment où le téléphone est le plus
  sollicité (le pré-bâti vient de finir).
  Pistes : borner la profondeur vue pendant la porte (brouillard/ distance de coupe des cellules, à garder sur ALLEGE), décaler l'axe de la porte d'une demi-maille pour
  que la ligne de mire ne file pas toute l'avenue, ou n'imposer la porte qu'au palier où le téléphone a de la marge ; puis remesurer avec `hc2.cjs` (même graines, paysage + portrait).

### 4. L'image (planches du contrôle, mêmes graines, mêmes abscisses relatives à la bouche ; AVANT en haut, APRÈS en bas)
`t2c/p162pay.jpg`, `t2c/p162por.jpg`, `t2c/p175pay.jpg`, `t2c/p162jeu.jpg`, `t2c/p175jeu.jpg` (≤ 235 Ko ; vues brutes dans `t2c/ch1/`).
- Graine 162 (porte) : l'approche est réellement dans l'axe, la tour se lit à 300 m, la bouche et son enseigne à 150 m, sans cadre de lumière autour de la route : la demande
  « bien amenée » est servie. Dedans, en portrait, le milieu du hall se lit comme une rue entre deux falaises de fenêtres avec le ciel au-dessus : « atrium » peu perçu, ce
  n'est pas encore un hall. La sortie s'ouvre sur la ville.
- Graine 175 (milieu de route) : à 300 m la route est droite mais la bouche est un trou sombre entre les tours ; en course (jeu0-jeu1) elle se lit moins bien que l'ancienne
  grille verte (la palette tirée change, or/sombre contre vert : vues pas strictement comparables). Lisible sur téléphone à 150 m, pas « éclairée de loin ».

### 5. Ce que je n'ai PAS vérifié
- La course aux paliers 10 et 20 (pas de crochet de palier de partie ; le palier de route monte avec les pièces) : la bascule hall → plongeon au p10 n'est jugée qu'au simulateur.
- Le temps par tranche JF.lim en Chrome et sur iPhone ; le vrai iPhone.
- La vitrée en Node (`VIT_SOL`).
- Le saut du joueur contre le linteau : calcul seulement (hauteur libre min 40,2 m mesurée en Node, saut 5,6 m).
- Le coût de la porte au-delà de 3 graines paires (162, 164, 170) : le verrou ne permet pas plus en < 10 min.

### 6. Commandes
```
cd .lots/b && node code/assembler.cjs --verifier && node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh
SEARCH='?sans=villehall' node outils/banc-routes/empreinte.cjs graines=1-12 ; node outils/banc-routes/empreinte.cjs graines=1-12
D=…/scratchpad/lot-b/controle/t2c ; GR=161-230,4000000007,271828182,1414213562,-123456789,777777777
node $D/ctl.cjs racine=<ref> graines=$GR cartes=ville,crypto,nuages,espace out=ref.json   (SEARCH='?sans=villehall' racine=.lots/b → sans.json ; racine=.lots/b → lot.json)
node $D/ana.cjs ; node $D/ana2.cjs ; node $D/rail2.cjs racine=.lots/b graines=161-200 out=rail.json ; node $D/pas.cjs racine=<arbre> graines=161-200 out=pas-*.json
node $D/sim10.cjs racine=<arbre> graines=161-220 paliers=10 ; node outils/banc-routes/ville-torsades.cjs racine=<arbre> graines=161-220 carte=ville
bash $D/chrome2.sh   (verrou ; hc.cjs graines 162,175,189 avant/après + toutes.mjs 161-163 + hc.cjs 170 portrait)
bash $D/chrome3.sh   (verrou ; hc2.cjs comptes en course : 162,164,170,175 paysage ; 162,170 portrait)
```

## Tour 3 (2026-11-19, 13 h 10 - 13 h 35)

Contrôleur, tour 3 : ne croit rien de `LOT-B.md` § 9, exécute avec de NOUVELLES graines (231-300 + 32 bits : 3000000019, 1234567891, −987654321,
2147483647, 1999999999 ; aucune de l'auteur ni des tours 1-2). Bancs et sorties : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-b/controle/t3c/`
(`ctl.cjs`, `ana.cjs`, `ana2.cjs`, `rail2.cjs`, `pas.cjs` des tours précédents ; `ctl-hall.cjs` = `ctl.cjs` + la forme de chaque hall (atrium `aA`, longueur, hauteur) ;
`chrome-a.sh`, `chrome-b.sh` = `t2c/hc2.cjs` sous verrou avec `&spin=0` (le jeton du FINAL SPIN coupé : `?spin=0` marche sur 127.0.0.1, `DEV`) ; `planche.py`).
Référence « avant » : `/Users/sachaberes/cash-car/game/.claude/worktrees/ville-cyberpunk-063e59` (a42e9ec50, index assemblé).

### VERDICT : **REFUSÉ** — la demande de Sacha n'est pas servie à l'image dans le cas courant (le hall d'entrée des graines paires : même approche, même sortie,
et au palier 0 deux fois sur trois le même couloir de 40 m qu'avant) ; et un doute de coût non levé sur le hall de milieu de route (+11 % d'appels en paysage à la 235).
Tout le reste est vert : identité, génération (0 dans / frole / hors bande, 0 abandon en tirage naturel), raccourcis, 0 mort, 0 erreur, gardes.

### 1. Identité, périmètre, gardes — VERT
- `SEARCH='?sans=villehall' node outils/banc-routes/empreinte.cjs graines=1-12` : ville **d63b36e2af8b / fb378a8c6756** ; sans drapeau : crypto 5447610bd8f2 / eae97981f833,
  nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 (= référence). Ville sans drapeau e8b3bd10c92e / e70f0717b6f3 (`empreinte.cjs` ne fixe pas la graine :
  des traversées de milieu de route y tombent aussi au p10). Vitrée : `VIT_SOL is not defined`, avant comme après.
- `ctl.cjs`, 75 graines × p0/10/20 × ville, crypto, nuages, espace = **900 routes**, graine fixée (l'entrée jouée) : référence ↔ lot `?sans=villehall` **0 écart** de route,
  d'ancres et de décor (empreinte V.corps/genre/neon/neonC, couloirs, abris, rails) ; crypto/nuages/espace sans drapeau **0 écart** ; 0 erreur.
- `diff -rq code` contre la référence : `maps/ville-entree.js`, `maps/ville-scenes.js`, `maps/ville-v3.js` seulement ; index.html : 92 lignes de diff contre l'index de la référence ;
  `sw.js` identique ; aucun ALLEGE / TEL_NATIF / IS_MOBILE touché ; regex `[?&]villescene=(\w+)` intacte ; noms neufs (VILLE_HALL, VS_HALL_LONG, VS_HA, vsAirSous, sTravAvant,
  sHall) déclarés une fois (`RH9` existe aussi dans `dunes-4.js`, dans une fonction : pas de conflit).
- `node code/assembler.cjs --verifier` ✔ (347 morceaux, 13 152 957 octets) ; `garde-demarrage` OK ; `garde-allege` ✔ ; `garde-charte` OK.

### 2. Génération, Node (75 graines × p0/10/20, vrais générateurs)
| | p0 avant → après | p10 | p20 |
|---|---|---|---|
| tunnels bâtis / abandons (tirage naturel) | 38/38 → 39/39, aucun | 35/35 → 35/35 | 36/36 → 35/35 |
| toutes scènes bâties | 325/336 → 328/339 (passerelle:route 8, vrille 1+2 : inchangés) | 264/264 → 264/264 | 170/170 → 169/169 |
| dans / frole (toutes scènes) | 0/0 → 0/0 | 0/0 | 0/0 |
| route à < ROAD_HALF+14 m d'un volume du TUNNEL hors bande | 810 → **0** | 1015 → **0** | 1059 → **0** |
| routes avec un raccourci | 75 → 75 (perd 0, gagne 0) | 75 → 75 | 36 → 36 |
| modules par route | 5,84 → 5,84 | 4,47 → 4,47 | 3,19 → 3,17 |
| halls bâtis, dont **avec un atrium** (`aA` > 8) | — → 38, **12** | — → 35, 27 | — → 35, 28 |

- **Le hall d'entrée n'a PAS d'atrium deux fois sur trois au palier 0** (`ctl-hall.cjs`) : sur l'ancienne route d'entrée le hall mesure 111-180 m (méd 145) ; `kA = ⌊(L2−8)/PA⌋` vaut 0
  et `vsBatirG` prend la branche `else` : UN linteau de 40 m sur toute la longueur, c'est-à-dire le même couloir de 40 m qu'avant. Graines sans atrium au p0 : 232, 234, 236, 238, 242,
  244, 246, 250, 252, 254, 256, 258, 268, 270, 272, 278, 280, 282, 284, 286, 288, 290, 292, 296, 298, 300 (26 sur 38). Aux p10/p20 (hall de 200-300 m) l'atrium est là 27/35, 28/35.
- **Le hall de milieu de route (l'approche longue, la sortie qui plonge)** : en tirage naturel 4 routes sur 75 au p0 (235, 275, 295, 1234567891), **0 aux p10 et p20** (les routes
  des p10/p20 sont celles d'avant, raccourcis et variété compris). Avec `?villescene=traversee` (le test) : 15 graines impaires sur 35 au p0, 0 au p10, 2 au p20 ; un hall refusé
  (`275 p0`, raison `route`, sans aucun volume : une traversée sans immeuble) contre 8 refus de l'ancienne traversée dans la référence (mieux qu'avant, pas zéro).
- Rails (`rail2.cjs`, 108 halls) : écart latéral de la route ≤ 0,13 m, aucun rail sur la dalle (≥ 28,17 m de l'axe), bas du rail −0,32 à +0,73 m du bitume. Hauteur libre
  mini 39,1 m (saut du joueur 5,6 m). Volumes par hall 35-68 (méd 57) contre 24-32.
- Temps (`pas.cjs`, 40 graines, deux passages) : construction des scènes `vsBatirG` méd 0,24 → 0,48 ms (p0), max 1,04 → 1,68 ms (Node, un pas sans JF) ; tirage genCtrl au bruit
  (67-86 ms selon le passage). Le hall reste un seul pas entre deux `ech9()` : +0,25 ms méd en Node, petit en absolu, mais **×2** ; non mesuré sur iPhone.

### 3. Le vrai jeu en Chrome (deux prises du verrou : 13 h 23-13 h 25, 125 s ; 13 h 25-13 h 27, 99 s ; verrou rendu, Chrome et serveurs tués)
`?tel=1&villescene=traversee&spin=0`, palier 0, pilote auto, `hc2.cjs` (moyenne par image du départ à la sortie du hall + 250 m).
| graine | format | appels moy (max) avant → après | triangles moy avant → après | course | dans/frole | flotte avant → après | erreurs |
|---|---|---|---|---|---|---|---|
| 232 (entrée, sans atrium) | paysage | 90,4 (101) → 90,4 (101) | 202,6 k → 202,7 k | 0 mort → 0 mort | 0/0 → 0/0 | 2 → **2** | 0 → 0 |
| 236 (entrée, sans atrium) | paysage | 134,0 (137) → 134,0 (139) | 353,7 k → 353,9 k | 0 → 0 | 0/0 → 0/0 | 2 → 0 | 0 → 0 |
| 248 (entrée, avec atrium) | portrait | 124,0 (140) → 124,0 (140) | 339,3 k → 339,7 k | 0 → 0 | 0/0 → 0/0 | — | 0 → 0 |
| 235 (milieu de route) | paysage | 105,3 (124) → **116,8 (133)** | 272,7 k → **315,7 k** | 0 → 0 | 0/0 → 0/0 | 0 → **2** | 0 → 0 |
| 235 (milieu de route) | portrait | 96,2 (123) → **102,1 (129)** | 230,6 k → **256,9 k** | 0 → 0 | 0/0 → 0/0 | — | 0 → 0 |

- Textures 120 = 120, programmes 151-152 = avant ; géométries 521-569, au bruit de page.
- `toutes.mjs cartes=ville paliers=0,10,20 graines=231-233` (lot) : 9 routes, **0 ERREUR**, hors ≤ 0,09, douilles 0-2(0), droites max 4,4 s, rMin ≥ 1,62 rP.
- **Entrée (graines paires) : coût égal** au dixième, comme l'auteur le dit (même route, mêmes cellules) : le bloquant du tour 2 est levé.
- **Milieu de route (235) : +11 % d'appels / +16 % de triangles en paysage, +6 % / +11 % en portrait.** Avant, à la 235, le décor de la traversée était REFUSÉ (raison `route`) :
  pas d'immeuble ; après, le hall est bâti et la route est plus longue avant lui (bouche à s 1248 au lieu de 982), donc la fenêtre et les vues ne sont pas les mêmes. Vue fixe
  à 150 m de la bouche, portrait : 65 → 93 appels (la ligne de mire file l'axe de la trame : c'est le même effet de cadrage que la porte du tour 2). L'auteur mesurait +4,4 % en paysage à la 175.
  Deux graines sur deux en hausse en paysage : **doute non levé** (peu fréquent — 4 routes sur 75, au p0 seulement — mais l'exigence est « ≤ avant au bruit près »).
- `flotte` : le rapport annonce « 2 → 0 » ; je mesure **2 à la 232 et 2 à la 235** après. Ce sont les deux traits de lumière des lames (x = centre − L2 − 3,15, ±47 m de l'axe) :
  posés contre une lame (genre 1) que l'audit ne compte pas comme appui (`adosse` ne lit que le genre 0, et le mur est à 3,0 m pile du trait, au seuil de 3 m) : faux positif à l'image,
  mais l'affirmation du rapport est fausse sur 2 graines sur 3 (mineur).

### 4. L'image (planches du contrôle, AVANT en haut, APRÈS en bas, en course aux mêmes abscisses relatives à la bouche : −150, −50, +20 m, milieu, sortie +15, +120 m)
`t3c/p232pay.jpg`, `t3c/p236pay.jpg`, `t3c/p235pay.jpg`, `t3c/p248por.jpg`, `t3c/v248por.jpg` (vues fixes a300…apres), `t3c/g232-jeu1-3.jpg`, `t3c/g235-jeu0-3.jpg` (en grand).
- **232, 236 (entrée, sans atrium — le cas le plus fréquent du palier 0)** : avant et après sont **la même image** à toutes les abscisses (seule la teinte tirée change à la 236) :
  même arrivée, bouche sur le côté de la droite du départ, même couloir de fenêtres sous le plafond de poutres éclairées, même sortie droite. À −150 m on devine une enseigne cyan
  à la place de l'ancien cadre. Ce que Sacha reproche (« mal amenée, mal faite, mal gérée ») est intact ici.
- **248 (entrée, avec atrium)** : l'approche et la sortie sont celles d'avant ; dedans (+20 m, milieu), le plafond s'ouvre plus haut et on voit un pan de façade et des galeries
  au-dessus : c'est mieux, mais lu une seconde à peine, et il manque une approche qui l'annonce.
- **235 (milieu de route)** : à −150 m la tour est dans l'axe, l'enseigne orange et la bouche se lisent ; dedans, les rails rouges et verts, un plafond haut, une galerie verte ;
  à la sortie la route plonge. C'est le seul cas où la demande est servie — et c'est un vrai progrès (avant : aucun immeuble, décor refusé).
- Conclusion image : la demande est servie pour ≈ 4 routes sur 75 au palier 0 et jamais aux paliers 10/20 ; pour le hall qu'on rencontre une partie sur deux (l'entrée), le joueur
  ne verra rien de changé au palier 0 deux fois sur trois.

### 5. Ce qu'il faudrait pour un tour 4
1. Le hall d'ENTRÉE doit être refait lui aussi, sans le cadrage coûteux du tour 2 : au moins un atrium à tout palier (raccourcir `PA`-multiple : un atrium à `kA = 0`, ou allonger
   la traversée d'entrée au multiple de période suivant — attention : ça change la route, à reprouver), et une sortie mise en scène ; une ligne de mire le long d'une rue étroite
   (piste de l'auteur, § 9.8) mesurée avec `hc2.cjs` + `&spin=0`.
2. Le coût du hall de milieu de route : mesurer dans une FENÊTRE de même longueur avant la bouche (pas du départ), sur ≥ 4 graines où il tombe (235, 275, 295, 1234567891 au p0),
   paysage et portrait ; si la ligne de mire coûte, la décaler d'une demi-maille.
3. Mineurs : corriger le § 9.6 (« flotte 2 → 0 ») ou adosser le trait au mur ; marquer les planches périmées (`hall-g2/g3/g4-*`, `hall-t2-g104-*`) ou les retirer de `planches/`.

### 6. Ce que je n'ai PAS vérifié
- Le vrai iPhone ; le temps par tranche `JF.lim` en Chrome et sur iPhone (Node seulement).
- Les courses aux paliers 10 et 20 (pas de crochet) : par construction les routes y sont celles d'avant (Node, 150/150), seul le décor du hall d'entrée change.
- Le hall de milieu de route en course au-delà de la graine 235 ; la 248 en paysage ; les comptes de la 232/236 en portrait.
- La vitrée en Node (`VIT_SOL`).
- Le saut contre le linteau : calcul (39,1 m libres, saut 5,6 m).

### 7. Commandes
```
cd .lots/b && node code/assembler.cjs --verifier && node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh
SEARCH='?sans=villehall' node outils/banc-routes/empreinte.cjs graines=1-12 ; node outils/banc-routes/empreinte.cjs graines=1-12
D=…/scratchpad/lot-b/controle/t3c ; GR=231-300,3000000019,1234567891,-987654321,2147483647,1999999999
node $D/ctl.cjs racine=<ref> graines=$GR cartes=ville,crypto,nuages,espace out=ref.json   (SEARCH='?sans=villehall' racine=.lots/b → sans.json ; racine=.lots/b → lot.json)
SEARCH='?villescene=traversee' node $D/ctl.cjs racine=<arbre> graines=231-300 cartes=ville out=vs-*.json ; node $D/ctl-hall.cjs racine=.lots/b graines=231-300 cartes=ville out=hall.json
node $D/ana.cjs ; node $D/ana2.cjs ; node $D/rail2.cjs racine=.lots/b graines=231-300 out=rail.json ; node $D/pas.cjs racine=<arbre> graines=231-270 out=pas-*.json
bash $D/chrome-a.sh  (verrou ; hc2.cjs 232,236,235 paysage avant/après &spin=0 ; toutes.mjs 231-233)   bash $D/chrome-b.sh  (verrou ; hc2.cjs 248,235 portrait + vues)
```
