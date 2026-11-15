# LOT CAISSE — moins d'appels, traînées achetées plus nettes (15/11, chantier qualité par appareil)

Branche `qa/caisse` (partie de `qualite-appareil`), worktree `~/cash-car/qualite-caisse`.
Fichiers touchés : `code/voitures/caisse-pieces.js` (un crochet de banc seulement), `code/rendu/trainees-1.js`, `code/rendu/trainees-2.js`.
Banc : `outils/banc-caisse/` (nouveau ; un seul Chrome, ports 9831/9832, iPhone 13 Pro émulé, `?appareil=iPhone14,2`, muet).
**Résultat honnête : aucun des deux sujets ne change l'image par défaut.** (1) n'est pas livré : le gain sûr est de 0 appel par caisse. (2) est livré
ÉTEINT : au banc, sur la même image, il ne se distingue pas de l'avant. Il s'allume par `?trxnet=1` pour l'essai sur le téléphone.

---

## 1. Souder les matières qui ne diffèrent que par la couleur (critique coût n6) : NON LIVRÉ

### Fait
- Un relevé, `window.dbgSoudeInv({caisse:i, peint:j})`, dans `caisse-pieces.js`. Il ne fait que compter, sans effet sur le jeu.
  Il construit la caisse et rend : le temps de construction, les appels de dessin de la caisse (scène et ombre, dans la vraie image de course),
  et par conteneur (carrosserie, essieu, pivot d'aile…) ce que la soudure par couleur gagnerait.
  Une matière compte comme « simple » si elle est opaque, en mélange normal, sans couleurs de sommet, sans `userData` et sans greffe de programme.
  Un lot est « sûr » seulement si aucune de ses pièces ne s'anime seule.
  `dbgSoudeInv({peintures:1})` liste les peintures (motif, animée, livrée).
- Aucune soudure écrite : la règle du lot dit « gain sous 4 appels par caisse → ne pas livrer ».

### VÉRIFIÉ (banc, en course, carte nuages, téléphone profilé)
Balayage des **51 caisses actives** : partout, le seul lot « même matière à la couleur près » est l'aile par défaut (PANNEAUX, équipée sur toutes les
caisses de la sauvegarde de banc). Dans deux de ses groupes, une `MeshBasic` (#644738 ou #4e31b2) côtoie une `MeshBasic #fffffd` **qui s'anime seule**
(`userData.bouge`). Les souder casserait le geste de l'aile. **Gain sûr = 0 appel sur 51 caisses sur 51.** Le gain « brut » (en soudant la pièce
animée, interdit) est de 2.

Le détail sur 15 combinaisons (familles différentes, la première du jeu, des légendaires, des peintures animées, des livrées) :

| caisse | peinture | construction (ms) | appels scène | appels ombre | gain couleur sûr |
|---|---|---|---|---|---|
| 0 LA HONTE (la première) | usine | 10,5 | 41 | 12 | 0 |
| 0 LA HONTE | magma (animée) | 12,1 | 41 | 12 | 0 |
| 1 ELDORADO (rare) | usine | 30,5 | 37 | 11 | 0 |
| 9 CHAT POP-TART (classique animé) | usine | 83,8 | 22 | 12 | 0 |
| 19 LA PIZZA EXPRESS (légendaire) | usine | 9,6 | 36 | 11 | 0 |
| 54 LA FÉLINE (légendaire) | usine | 29,6 | 35 | 11 | 0 |
| 57 LE TRÔNE CENTRAL (légendaire) | usine | 12,2 | 38 | 11 | 0 |
| 61 LE DRAGON D'OR (légendaire) | usine | 10,1 | 36 | 11 | 0 |
| 70 SQUALE (légendaire, hélices) | usine | 43,0 | 36 | 14 | 0 |
| 82 LE BAROUDEUR (commun) | usine | 8,1 | 35 | 11 | 0 |
| 82 LE BAROUDEUR | groupeb (livrée) | 25,7 | 35 | 11 | 0 |
| 89 LE LOUP (légendaire) | usine | 94,3 | 40 | 13 | 0 |
| 5 POSTER 84 (légendaire) | néon (animée) | 20,1 | 38 | 11 | 0 |
| 88 LA ZAGAIE (épique) | sakura (animée) | 87,7 | 42 | 11 | 0 |
| 48 LA STRATOS (épique) | tokyodrift (livrée) | 59,2 | 51 | 21 | 0 |

(Temps de construction sur le Mac de banc saturé, compilation comprise : à lire comme ordre de grandeur. Le compte d'appels ne dépend pas de la résolution.)

### Pourquoi il n'y a rien à gagner (exemple : LA FÉLINE, 35 appels)
- **Aile PANNEAUX, ~16 appels** : 5 groupes qui bougent chacun à part (pivots animés), avec 2 ou 3 matières par groupe. Elle est animée et n'est pas
  à moi (`voitures/ailes.js`). C'est la plus grosse famille. Si l'on veut des appels en moins, la piste est là : une aile en un dessin, avec
  l'animation dans le shader. C'est un autre sujet.
- **Carrosserie, ~14 appels** : plaques (3 matières dont 2 transparentes), 4 halos (sprites), 5 lots du kit low-poly. Ces lots sont déjà en couleurs
  de sommet, mais diffèrent par la brillance, le reflet, `uG`/`uV` et la greffe d'arête. Ils ne diffèrent donc pas par la couleur seulement.
- **Essieux, 4 appels** : deux essieux qui tournent chacun autour de son axe, impossibles à souder ensemble sans shader.
- Les matières « rimify » (`uVr`, `rimK`) ont `emissive = couleur` : souder par couleur de sommet changerait l'émissif. Ce n'est pas le même rendu.
- La première soudure (par matière, 27/09) a déjà tout pris.

### NON vérifié / non fait
- Les images avant/après (garage, course, nitro, nuit, explosion, vitrine) : sans soudure, il n'y avait rien à comparer.
- La critique annonçait 20-23 appels pour la caisse ; le banc en compte 35-51, ailes comprises.

### À MESURER SUR LE 13 PRO
Rien pour ce sujet.

---

## 2. Traînées achetées (TRX) plus définies (critique qualité n5) : LIVRÉ ÉTEINT (`?trxnet=1`)

### Fait (`trainees-1.js`, `trainees-2.js`)
- `TRXNET` : sous profil (`PRF.on`) **et** `?trxnet=1`, la planche 8×8 prend l'anisotropie 4 (bornée par la carte). La lecture `texture2D(uMap,vUv)`
  devient `texture2D(uMap,vUv,uBiais)`, avec `uBiais = −0,6` par défaut.
  - Le biais est un **uniforme**. Le programme change une fois, à la construction de la traînée, et seulement quand c'est allumé.
  - L'ordinateur, tout téléphone hors profil et le téléphone par défaut gardent `TRX_FS` **mot pour mot** et la planche sans anisotropie.
- Réglages d'essai : `?trxbiais=-0.75` (borné à [−1 ; 0]), `?trxaniso=8`. `?sans=trxnet` retire tout.
- `window.dbgTrxNet({biais, aniso})` règle à chaud (banc).

### VÉRIFIÉ
- **Interrupteurs** (banc, après une course avec HYPERESPACE forcée) :
  - téléphone par défaut : `on:false`, lecture `texture2D(uMap,vUv)`, anisotropie 1, pas d'uniforme ;
  - `?trxnet=1` : `on:true`, `texture2D(uMap,vUv,uBiais)`, anisotropie 4, biais −0,6 ;
  - `?trxnet=1&sans=trxnet` : comme par défaut ;
  - **ordinateur** (sans émulation iPhone, `PRF.on` faux) avec `?trxnet=1` : `on:false`, lecture d'origine, anisotropie 1.
- **Image** : même image (boucle figée, horloge et hasard figés pendant le rendu, toile relue après 4 rendus ; témoin : 0 pixel de différence entre
  deux poses identiques). Avant = `{biais:0, aniso:1}`, soit la lecture de `TRX_FS`. Après = `{biais:−0,6, aniso:4}`. Vérité = sans loupe, à DPR 3.
  Quatre traînées (HYPERESPACE, POUDRE D'OR, MATRICE, SAKURA), à 302-303 et 602-604 km/h.

  | traînée | km/h | pixels différents | > 8/255 | > 32/255 |
  |---|---|---|---|---|
  | hyperespace | 303 | 540 339 | 6 198 | 0 |
  | hyperespace | 602 | 275 861 | 2 873 | 0 |
  | matrice | 302 | 11 053 | 53 | 3 |
  | matrice | 602 | 805 | 5 | 0 |
  | poudre d'or | 302 | 2 849 | 0 | 0 |
  | poudre d'or | 604 | 91 | 0 | 0 |
  | sakura | 303 / 602 | 95 / 119 | 0 | 0 |

  **À l'œil (planches regardées), l'après ne se distingue pas de l'avant**, même zoomé ×4 avec l'écart ×8. L'écart est diffus et faible ; il passe
  surtout par le halo des filés. En revanche la VÉRITÉ (DPR 3) est franchement plus nette : la mollesse des traînées vient de la **résolution de rendu**
  (1,25-1,5 puis loupe), pas du filtrage de la planche.
- Pourquoi : les filés d'hyperespace sont des quads de quelques centimètres de large. Sur la largeur, un pixel couvre plus que toute la planche, et la
  lecture tombe au dernier niveau de mip, où −0,6 ne change rien. Contrôle : une lecture brute en WebGL2 sur la même puce (ANGLE Metal) répond bien au
  biais. Le biais n'est donc pas ignoré : il n'a simplement pas de prise ici.
  SAKURA dessine ses pétales en cubes (pas de quads à la planche) : elle n'est pas concernée.
- Débordement entre cases : rien de visible sur les planches (l'écart ne montre aucun motif d'une case voisine).

### Planches (`passation/qualite/photos/caisse/`)
- `trx-300.jpg` : HYPERESPACE, POUDRE D'OR, MATRICE à 300 km/h, AVANT | APRÈS | VÉRITÉ (×2, pixels d'écran, zone du plus grand écart).
- `trx-600.jpg` : les mêmes à 600 km/h.
- `trx-hyper-ecart.jpg` : HYPERESPACE à 300 km/h, ×4, avec l'écart ×8.
- Pour POUDRE D'OR, la zone du plus grand écart est quasi vide : l'écart est nul presque partout. Les toiles brutes (PNG 2532×1170) restent dans
  `photos/caisse/brut/`, non committées.

### NON vérifié
- Le scintillement en mouvement (un biais négatif peut faire grésiller les étincelles) : le banc ne voit que des images figées.
- Le coût GPU de l'anisotropie 4 : estimé négligeable (peu de pixels), non mesuré.

### Piège du banc (à retenir)
Recompiler une matière des traînées en pause (`needsUpdate`, ou une matière clonée) : la traînée ne se dessine plus avant la prochaine image de la boucle.
Les premiers A/B étaient donc faux : une « après » pleine de filés contre une « avant » vide. D'où le biais en uniforme, et une seule course par A/B.

### À MESURER SUR LE 13 PRO (A/B, même map, nitro, HYPERESPACE ou MATRICE équipée)
- A : `…/jouer/?` (défaut, rien ne change) · B : `…/jouer/?trxnet=1`.
- Si B paraît mieux à l'œil : essayer aussi `?trxnet=1&trxbiais=-0.75` et `?trxnet=1&trxaniso=8`. Regarder le grésillement des étincelles (POUDRE D'OR)
  et la tenue des filés au loin.
- Si rien ne se voit (attendu d'après le banc), laisser éteint. La vraie piste pour des traînées nettes est la résolution autour d'elles : la loupe
  allongée du lot 3, ou un passage des quads TRX dans la loupe rubans.

---

## Banc `outils/banc-caisse/` (réutilisable)
- `hote.cjs` : serveur et un Chrome muet, iPhone émulé. Il garde la **seule** session CDP : l'émulation de l'écran se perdait quand d'autres clients se
  branchaient, le DPR retombait à 1 sans prévenir. Mode `--pc` pour l'ordinateur ; hasard semé `--graine`.
- `ev.cjs` : évaluer, photographier, recharger via l'hôte.
- `course.sh` : une course figée.
- `pose.cjs` + `rendu.js` : la MÊME image, relue sur la toile. Le capteur de capture d'écran rendait l'image d'avant quand la boucle est figée.
- `trx.sh` : l'A/B des traînées.
- `planche-trx.py` : la planche.
- La vitesse se monte par `dbgMoteur()` : au même palier, LA HONTE plafonne vers 300 km/h.
