# CANYON — LA VERSION FINALE (2026-11-17) : journal

Demande de Sacha (17/11) : « Il y a encore des bugs de génération dans la map Canyon. […] gérer les problèmes de génération, les bugs visuels sur les parois,
retravailler les graphismes de la map et faire tout ça en respectant l'optimisation. […] les couleurs et le rendu général. Faire la version finale du Canyon. »

Branche `canyon-final` (worktree `~/cash-car/canyon-final`), partie d'`origin/main` 492ac0970 (v1616). **Rien sur `main`, aucun build installé.**
iOS seulement : tout est mesuré en `?tel=1`, formats 844×390 (paysage) et 390×844 (portrait), ×2.

## Les bancs de cette passe (`outils/banc-routes/canyon-final/`)
| banc | ce qu'il fait | Chrome |
|---|---|---|
| `pilote.mjs <scénario>` | le vrai jeu sans fenêtre (CDP, muet), format iPhone ; prend et rend le verrou commun lui-même | oui |
| `lot.mjs` + `audit-page.js` | **le test de génération** : par graine, la collision du vol (`dbgCanyon('heurt')`) dans le couloir de conduite, à l'œil du joueur, sur chaque pièce ; les décors dans le couloir (`dbgCanyonAudit`) ; les raccords de la dalle ; les murs ; les lames ; les ouvrages. Code de sortie 1 au moindre défaut | oui |
| `devers-ouvrages.cjs` | le roulis de la dalle dans chaque ouvrage bâti d'aplomb (galerie, pont, mine, tunnel d'arrivée) | non (Node) |
| `pas-courts.cjs` | les points de contrôle presque confondus et la cassure qu'ils font | non (Node) |
| `course.mjs` | la course pas à pas (30 i/s exactes, `dbgStep`) : morts, décor qui apparaît d'un coup, appels et triangles à chaque image | oui |
| `cout.mjs` | appels de dessin et triangles sur 12 vues fixes, mémoire du renderer, pièces du canyon | oui |
| `photos.mjs`, `pistes.mjs`, `essai.mjs`, `atelier.mjs` | photos aux mêmes points de vue ; pistes de couleurs posées à chaud ; un Chrome gardé ouvert pour régler | oui |

Crochets ajoutés au jeu (lecture seule) : `dbgCanyon('h', x, z)`, `dbgCanyon('heurt', x, y, z)`, `dbgCanyon('objets')`. `dbgCanyonAudit()` plantait depuis le 15/11
(le tube libère sa copie JS après l'envoi au GPU) : il saute maintenant ce maillage.

⚠ Le verrou des bancs est très disputé (4 à 5 sessions en file le 17/11) : une prise de verrou = 10 à 25 min d'attente. Tout ce qui peut se mesurer en Node l'est.

## Volet 1 — bugs de génération

État de départ (lot de 40 graines, matin, `?tel=1`, origin/main) : **40 graines sur 40 en défaut.**

### G1 — Les ouvrages d'aplomb sous une dalle penchée (40/40) — CORRIGÉ (`?sans=cyplat`)
- **Constat** : depuis « le dévers partout » de la V3 (13/11), la dalle penche dans chaque virage. Or la galerie, la mine, le pont naturel et le tunnel d'arrivée sont
  bâtis d'aplomb. `devers-ouvrages.cjs`, 40 graines : roulis de la dalle **21 à 28°** dans le tunnel d'arrivée (40/40), la galerie (10/10) et la mine (4/4),
  **60 à 62°** au bout du pont (8/8 : la rampe du dévers de la corniche suivante).
- **Dans le jeu** : 28 à 35 sommets du tunnel d'arrivée dans le couloir de conduite sur CHAQUE graine ; 105 à 132 sommets de la galerie (graines 6, 13, 18, 24, 26, 30, 32, 40)
  dont 3 à 6 dans le bitume ; ~1000 sommets de la mine dans le couloir et ~160 dans le bitume, les rails déportés de 24 m (graines 25, 36, 37) ; la culée du pont
  (graines 1, 7, 12, 22, 28, 31, 33). La collision du vol touchait le bord de route sur 19 à 83 points (galerie, pont).
- **Correctif** : `cyPlatOuvrages` (canyon-murs.js) ajoute un gabarit `plat` par ouvrage avant `cyMurPose` (le masque lissé existant, avant la borne de vitesse du roulis) ;
  rampe 150 m, 340 m autour du pont (sinon la borne de roulis fait refluer le dévers de la corniche sur le pont : 35° à 150 m, 9° à 260 m, 0° à 340 m).
- **Après** : 0,0° dans les quatre ouvrages sur 60 graines ; dans le jeu, 0 point de collision dans le couloir sur 40 graines.
- **Prix** (canyon-charte.cjs, 40 routes × 3 paliers) : à plat 42,5 → 46,5 % (cible 35-55 %), > 60° 21,0 → 20,7 % (≥ 15 %), envers inchangé (min 6,4 %) ;
  **le plus long passage à plat monte de 8 s à 12-14 s** sur les routes à galerie (elle fait ~800 m). Voir « À dire à Sacha ».
- Photos : `photos/gen-galerie-g6-…`, `gen-tunnel-arrivee-g3-…`, `gen-mine-g25-…`, `gen-pont-g1-…` (avant | après, paysage et portrait).
- Test : `node outils/banc-routes/canyon-final/devers-ouvrages.cjs` (Node) et `lot.mjs` (jeu).

### G2 — La dalle qui casse avant la finale (3 routes sur 120) — CORRIGÉ (`?sans=cycourt`)
- **Constat** : graines 25 et 40 (palier 0), 8 (palier 10) : à 351 m de l'arrivée la dalle plie de 5°/m (le reste du canyon : ≤ 1,3°/m). Cause : `large()` pose le reste
  d'un arc comme une droite, même de 2 m → deux points de contrôle à 2 m l'un de l'autre, juste avant la plongée à −75 % de la finale ; la spline y plie de 15°.
- **Correctif** : un reste de moins de 12 m n'est pas posé (canyon-route.js, `CY_COURT`). Aucun tirage ne change (une droite ne tire rien).
- **Après** : `pas-courts.cjs` 120 canyons : 0 pas sous 8 m (4 avant), 0 cassure ; dans le jeu, 0 raccord en défaut sur 40 graines.
- Photos : `photos/gen-cassure-finale-g25-…`. Test : `node outils/banc-routes/canyon-final/pas-courts.cjs`.

### G3 — Ce que l'audit a vérifié sans rien trouver (40 graines, après correctifs)
- **Pièces** : 0 hors de la route, 0 dans la roche côté conduite, 0 à plus de 9 m de la dalle (sur ~1 650 ramassables par graine). Pour information : ~100 doubles
  « sous la dalle » par graine sont enfouis là où la dalle porte sur la roche — chaque pièce de CHAQUE map a un double dessous ; ici on ne peut pas rouler dessous, ils ne se voient pas.
- **Œil du joueur** : 0 position de caméra dans la roche (trois reculs : 12/4,5 m, 20/6,5 m, 34/9 m derrière la caisse, tous les 6 m).
- **Règle d'or** (aucune roche sur ni sous la dalle), **lames** du relief, **bornes** des nœuds, **ouvrages** (collisions témoins) : 0 défaut.
- **Modules** : `canyon-charte.cjs` R5 (répétitions) 0, 35 noms de pièces, Jaccard moyen 0,28 — inchangé.
- **Dalle couchée sans roche derrière elle** (information, pas un défaut) : au fond des BOUCLES la dalle penche à 60-75° dans le vide du cirque (sol 230 m plus bas, graine 1
  s 8672) — le plan de roche des murs n'y est pas posé. Vu à l'image (`dbgCanyonMurs('vue')`) : une piste de vélodrome suspendue, propre ; rien ne traverse rien. Laissé tel quel.
- **Tolérés par le test, vérifiés à l'image** : le pied des murs du tunnel d'arrivée posé sur le bord de la dalle (≤ 3 sommets), les rails de la mine posés sur le bitume.

## Volet 2 — bugs visuels des parois

### P1 — Les escaliers d'ombre (toutes les graines, matin et soir) — CORRIGÉ (`?sans=cyombre`)
- **Constat** : la limite soleil/ombre des parois sortait en grands rectangles nets (photos `parois-escaliers-ombre-g1-…`). Cause : l'ombre se lit PAR SOMMET, sur 14 m de
  hauteur ; au loin deux sommets voisins d'une falaise sont à 30-200 m de hauteur l'un de l'autre → l'un au soleil, l'autre à l'ombre, et la limite dessine la maille.
- **Correctif** (canyon-relief.js, `CY_VS`) : la bande du fondu s'élargit de la dénivelée de la maille (`hx`, `hz`, déjà lus pour la normale : aucune lecture de texture de
  plus ; 2 abs, 1 max, 3 opérations par SOMMET, rien dans le fragment). La limite devient un dégradé à l'échelle de la maille.
- Photos avant | après : `photos/parois-escaliers-ombre-g1-s8672-…`, `-s8720-…`.

### P2 — La bande violette au pied des parois, l'ombre lavande (toutes les graines, matin et soir) — traité par le volet 3
- **Constat** (photo `gen-galerie-g6-…`, et toutes les photos « AUJOURD'HUI » des pistes) : une bande violet vif au pied des parois et des piliers = la brume du fond
  (`cyF` fondu à 45 % vers l'ardoise) ; l'ombre de la roche lavande ; le soir, une route violette. Ce sont des COULEURS, pas de la géométrie : les trois pistes les règlent.

### P3 — Vérifié sans défaut
- Coutures et trous entre tronçons : `dbgCyLames()` 0 lame, `dbgCyBornes()` 0 nœud hors bornes sur 40 graines (les correctifs du 14-15/11 tiennent).
- La roche dans les tubes : 0 point de collision dans le couloir des tubes (le correctif du 16/11 tient).
- Parois qui coupent la caméra : 0 (voir G3). Décor qui apparaît d'un coup : voir « La course ».

## La course d'un bout à l'autre (`course.mjs`)
(à remplir : résultats)

## Volet 3 — couleurs et rendu : TROIS PISTES, le choix est à Sacha

**Le diagnostic** (photos du jeu, graine 3) : la gorge est presque toujours à l'ombre (soleil à 13° le matin, 6° le soir). Or l'ombre de la roche tirait à l'ardoise
bleutée, sous un ciel d'hémisphère bleu, sur des lits lie-de-vin et crème → **un canyon lavande et cramoisi**, une brume violette au pied des parois, et le soir une
route violette. La charte dit « jamais de violet en dominante de jour ».

**Le mécanisme** (`CY_LOOKS`, canyon-relief.js) : une piste = des CONSTANTES seulement — la saturation des lits, la teinte de l'ombre, la part et la teinte de l'ardoise,
le rebond des parois (dans l'uniforme), la palette des lits posée par-dessus celle de la graine à luminance égale (les cinq palettes tirées restent variées), la brume du
fond, et des retouches d'ambiance du matin et du soir (ciel d'hémisphère, remplissage, teinte de la route le soir) posées après l'équilibre des maps et le plan de feu.
Zéro instruction de plus dans le fragment, zéro texture, zéro uniforme. Exposition et lumières : **inchangées** (aucune piste ne touche `expo` ni `lum`).

`?cypiste=A|B|C` choisit ; **par défaut rien ne change** (le canyon d'aujourd'hui au bit près) tant que Sacha n'a pas choisi ; `?sans=cyfinal` forcera l'avant ensuite.

| piste | l'idée | L* · chroma matin (gorge ouverte / corniche) | soir |
|---|---|---|---|
| aujourd'hui | lavande, cramoisi, bande violette, route violette le soir | 39 · 25 / 47 · 28 | 39 · 37 / 40 · 40 |
| **A · GRÈS DORÉ** (recommandée) | le canyon naturel : orange doré, lits crème, l'ombre reste chaude, brume pêche | 41 · 39 / 46 · 44 | 39 · 43 / 37 · 45 |
| B · PIERRE ET OCRE | plus minéral : ocre pâle, ombres gris-bleu (jamais violettes), brume claire | 40 · 22 / 46 · 29 | 37 · 33 / 37 · 37 |
| C · TERRE ROUGE | l'affiche : grès rouge brique, ombres bordeaux, le plus saturé | 39 · 42 / 45 · 48 | 36 · 47 / 35 · 49 |

Pixels dont un canal dépasse 250 (l'orange vif sature le rouge) : aujourd'hui 1,1-1,9 % ; A 1,2-3,1 % le matin, jusqu'à 4,3 % le soir en portrait ; B 1,2-1,9 % ; C jusqu'à 6 % le soir en portrait. Nuit, pluie, orage : mêmes clartés à ±1,5 L* (les pistes n'y posent que
la palette et l'ombre) — `photos/pistes-nuit-…`, `pistes-pluie-…`.

Planches (même point de vue, vraies captures, 844×390 et 390×844) : `photos/pistes-<matin|soir>-<gorge-ouverte|corniche|en-course>-<paysage|portrait>.jpg`.
Banc : `pistes.mjs` (les mesures L*/chroma sont lues sur les captures).

**Reste à faire après le choix** : mettre la piste choisie par défaut (une ligne : `CY_PISTE`), reprendre nuit/pluie/orage dans sa famille de teintes si Sacha le veut
(la route de nuit est d'un bleu électrique très saturé — vu, non touché), refaire les 5 météos au banc des couleurs.

## Coût avant / après
(en cours)

## À dire à Sacha
- La galerie, la mine et le tunnel d'arrivée se roulent maintenant à plat (c'était la cause des piliers dans la route). Sur une route à galerie cela fait un passage
  de 12 à 14 s sans dévers. L'autre solution — pencher l'ouvrage avec la route — est possible mais c'est un chantier (géométrie et collision) : à faire si le plat gêne.
