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
- **Correctif** : `cyPlatOuvrages` (canyon-murs.js) ajoute un gabarit `plat` par ouvrage avant `cyMurPose`. Le masque est posé avant la borne de vitesse du roulis ET
  redit après elle (la borne fait refluer le dévers voisin dans l'ouvrage : 35° au bout du pont sans cela). Rampes à la vitesse du palier (150 m × VW/78 ; 340 m autour du
  pont) : le roulis se compte en °/s. (Le contrôle adverse a montré qu'à rampe fixe en mètres le correctif fuyait aux paliers 10 et 20 : pont 25° et 44° — repris.)
- **Après** : `devers-ouvrages.cjs` 0,0° dans les quatre ouvrages, graines 1-60 aux paliers 0, 10 et 20, graines 100-160 au palier 20 ; dans le jeu (palier de départ),
  0 point de collision dans le couloir sur 40 graines.
- **Prix** (canyon-charte.cjs, 40 routes × paliers 0/10/20) :
  | | avant | après |
  |---|---|---|
  | à plat (cible 35-55 %) | 42,5 / 43,1 / 44,5 % | 46,5 / 46,9 / 47,9 % |
  | > 60° (≥ 15 %) | 21,0 / 23,5 / 23,0 % | 20,7 / 23,3 / 23,0 % |
  | envers, la pire route (≥ 6 %) | 6,4 / 7,1 / 7,0 % | inchangé |
  | plus long passage à plat | 8,0 / 6,6 / 8,6 s | **14 / 13 / 16 s** (les routes à galerie : elle fait ~800 m) |
  | roulis « horizon », max (R3 : ≤ 60°/s) | 44 / 40 / 38 °/s | 49 / 51 / 53 °/s (95e centile inchangé : 40 / 37 / 36) |
  **Le plat du pont coûte du mur aux deux corniches de la traversée** (contrôle adverse, rampe 340 m) : leur dévers passe typiquement de 78° à ~50° de pic, et de ~300 m
  à ~60 m au-delà de 45° ; 4 corniches sur 65 tombent sous 20°. Une rampe plus courte (220 m) rendait du mur mais faisait 77°/s de roulis (hors charte). Voir « À dire à Sacha ».
- Photos : `photos/gen-galerie-g6-…`, `gen-tunnel-arrivee-g3-…`, `gen-mine-g25-…`, `gen-pont-g1-…` (avant | après, paysage et portrait).
- Test : `node outils/banc-routes/canyon-final/devers-ouvrages.cjs` (Node) et `lot.mjs` (jeu).

### G2 — La dalle qui casse avant la finale (3 routes sur 120) — CORRIGÉ (`?sans=cycourt`)
- **Constat** : graines 25 et 40 (palier 0), 8 (palier 10) : à 351 m de l'arrivée la dalle plie de 5°/m (le reste du canyon : ≤ 1,3°/m). Cause : `large()` pose le reste
  d'un arc comme une droite, même de 2 m → deux points de contrôle à 2 m l'un de l'autre, juste avant la plongée à −75 % de la finale ; la spline y plie de 15°.
- **Correctif** : un reste de moins de 12 m n'est pas posé (canyon-route.js, `CY_COURT`).
- **Après** : `pas-courts.cjs` 180 canyons (60 graines × 3 paliers) : 0 pas sous 8 m (7 avant), 0 cassure (5 avant) ; dans le jeu, 0 raccord en défaut sur 40 graines.
- **Effet de bord** (contrôle adverse, 180 routes) : 25 routes changent — 22 sont raccourcies de 2 à 18 m en aval ; **3 deviennent une autre route** (palier 0 graines 35 et 46,
  palier 10 graine 51 : un autre essai gagne la note). Une graine ne redonne donc plus exactement la route d'avant dans ~1,7 % des cas. Sans effet pour le joueur (les graines
  ne sont pas montrées), à savoir pour comparer des photos par graine.
- Il reste des pas de 8,5 à 12,5 m (arcs serrés échantillonnés fin, pli ≤ 11°) : pas des cassures, non vérifiés un par un.
- Photos : `photos/gen-cassure-finale-g25-…`. Test : `node outils/banc-routes/canyon-final/pas-courts.cjs`.

### G3 — Ce que l'audit a vérifié sans rien trouver (40 graines, après correctifs)
- **Pièces** : 0 hors de la route, 0 dans la roche côté conduite, 0 à plus de 9 m de la dalle (sur ~1 650 ramassables par graine). Pour information : ~100 doubles
  « sous la dalle » par graine sont enfouis là où la dalle porte sur la roche — chaque pièce de CHAQUE map a un double dessous ; ici on ne peut pas rouler dessous, ils ne se voient pas.
- **Œil du joueur** : 0 position de caméra dans la roche (trois reculs : 12/4,5 m, 20/6,5 m, 34/9 m derrière la caisse, tous les 6 m).
- **Règle d'or** (aucune roche sur ni sous la dalle), **lames** du relief, **bornes** des nœuds, **ouvrages** (collisions témoins) : 0 défaut.
- **Modules** : `canyon-charte.cjs` R5 (répétitions) 0, 35 noms de pièces, Jaccard moyen 0,28 — inchangé.
- **Dalle couchée sans roche derrière elle** (information, pas un défaut) : au fond des BOUCLES la dalle penche à 60-75° dans le vide du cirque (sol 230 m plus bas, graine 1
  s 8672) — le plan de roche des murs n'y est pas posé. Vu à l'image (`dbgCanyonMurs('vue')`) : une piste de vélodrome suspendue, propre ; rien ne traverse rien. Laissé tel quel.
- **Tolérés par le test, vérifiés à l'image** : le pied des murs du tunnel d'arrivée posé sur le bord de la dalle (3 sommets au plus mesurés, le test en tolère 5), les rails de la mine posés sur le bitume (le test ne regarde plus que les sommets AU-DESSUS du bitume pour la mine : ≤ 10 ; des murs qui rentreraient y laisseraient des centaines de sommets).

## Volet 2 — bugs visuels des parois

### P1 — Les escaliers d'ombre (toutes les graines, matin et soir) — ADOUCIS, pas supprimés (`?sans=cyombre`)
- **Constat** : la limite soleil/ombre des parois sortait en grands rectangles nets (photos `parois-escaliers-ombre-g1-…`). Cause : l'ombre se lit PAR SOMMET, sur 14 m de
  hauteur ; au loin deux sommets voisins d'une falaise sont à 30-200 m de hauteur l'un de l'autre → l'un au soleil, l'autre à l'ombre, et la limite dessine la maille.
- **Correctif** (canyon-relief.js, `CY_VS`) : la bande du fondu s'élargit de la dénivelée de la maille (`hx`, `hz`, déjà lus pour la normale : aucune lecture de texture de
  plus ; 2 abs, 1 max, 1 min, 3 opérations par SOMMET, rien dans le fragment), 45 m au plus de chaque côté. **Les rectangles restent, leurs bords se fondent** : 2 à 3 % des
  pixels bougent de plus de 30 niveaux sur les photos. Les supprimer demanderait de lire l'ombre au pixel (une lecture de texture par pixel : refusé, c'est un shader plus lourd).
- Limites : la clarté moyenne des parois près de la limite d'ombre change un peu (non mesurée) ; les monuments et les ouvrages (`CY_MVS`) gardent la bande de 14 m.
- Photos avant | après (prises avant le plafond de 45 m) : `photos/parois-escaliers-ombre-g1-s8672-…`, `-s8720-…`.

### P2 — La bande violette au pied des parois, l'ombre lavande (toutes les graines, matin et soir) — traité par le volet 3
- **Constat** (photo `gen-galerie-g6-…`, et toutes les photos « AUJOURD'HUI » des pistes) : une bande violet vif au pied des parois et des piliers = la brume du fond
  (`cyF` fondu à 45 % vers l'ardoise) ; l'ombre de la roche lavande ; le soir, une route violette. Ce sont des COULEURS, pas de la géométrie : les trois pistes les règlent.

### P3 — Vérifié sans défaut
- Coutures et trous entre tronçons : `dbgCyLames()` 0 lame, `dbgCyBornes()` 0 nœud hors bornes sur 40 graines (les correctifs du 14-15/11 tiennent).
- La roche dans les tubes : 0 point de collision dans le couloir des tubes (le correctif du 16/11 tient).
- Parois qui coupent la caméra : 0 (voir G3). Décor qui apparaît d'un coup : voir « La course ».

## La course d'un bout à l'autre (`course.mjs`)
**EN ATTENTE au moment d'écrire** (le verrou des bancs tourne entre d'autres sessions depuis plus d'une heure ; les deux travaux sont en file et écriront leurs
résultats dans le scratchpad de la session, à recopier ici) :
- la course à ~890 km/h (moteur au dernier palier, sans nitro) sur les graines 3, 7, 12, 25 et à la croisière sur la graine 3 : morts, décor qui apparaît d'un coup ;
- l'audit en jeu de 40 graines sur le DERNIER code (après la reprise des rampes du plat) — le précédent audit de 40 graines (0 défaut) portait sur le code d'avant cette reprise ;
- `outils/banc-routes/toutes.mjs cartes=canyon` (le banc commun des routes), à lancer sous le verrou. Les bancs Node du canyon (`canyon.cjs`, `canyon-charte.cjs`) sont verts.

Ce qui a été vu avant :
- `dbgStep` n'avance pas la boucle en `?tel=1` (le limiteur de cadence ignore les pas forcés) : la première version « pas à pas » du banc ne roulait pas ; ses résultats sont jetés.
- En temps réel avec moteur au dernier palier ET nitro tenue, la caisse monte à 3 700-4 200 km/h et le pilote automatique finit dans une paroi vers s 1 150-1 650
  (graines 3, 7, 12) : hors sujet (la demande est ~900 km/h), le banc roule maintenant sans nitro.
- Dans ces essais, un seul maillage se rallume dans le champ à ~440 m sur chaque graine, vers s 405-443 : « pays traits » (rayon ~460 m, pas un décor du canyon) ; à 3 000 km/h
  et plus, un tronçon de « piste bitume » se rallume à ~420 m. À revoir à 890 km/h.

## Volet 3 — couleurs et rendu : TROIS PISTES, le choix est à Sacha

**Le diagnostic** (photos du jeu, graine 3) : la gorge est presque toujours à l'ombre (soleil à 13° le matin, 6° le soir). Or l'ombre de la roche tirait à l'ardoise
bleutée, sous un ciel d'hémisphère bleu, sur des lits lie-de-vin et crème → **un canyon lavande et cramoisi**, une brume violette au pied des parois, et le soir une
route violette. La charte dit « jamais de violet en dominante de jour ».

**Le mécanisme** (`CY_LOOKS`, canyon-relief.js) : une piste = des CONSTANTES seulement — la saturation des lits, la teinte de l'ombre, la part et la teinte de l'ardoise,
le rebond des parois (dans l'uniforme), la palette des lits posée par-dessus celle de la graine à luminance égale (les cinq palettes tirées restent variées), la brume du
fond, et des retouches d'ambiance du matin et du soir (ciel d'hémisphère, remplissage, teinte de la route le soir) posées après l'équilibre des maps et le plan de feu.
Zéro instruction de plus dans le fragment, zéro texture, zéro uniforme. Exposition et intensités des lumières : **inchangées** (aucune piste ne touche `expo` ni `lum` ; la règle expo × lum ≤ 1,45 n'était déjà pas tenue par l'étalonnage du 16/11 — matin 1,49, soir 1,71 — et je n'y ai pas touché). Les pistes changent la COULEUR du ciel d'hémisphère et du remplissage (donc aussi un peu la caisse et la route), le rebond (×1,25 pour A) et le zénith du ciel (C).

`?cypiste=A|B|C` choisit ; **sans ce paramètre les COULEURS ne changent pas** (shader du fragment, strates et ambiances identiques à main, vérifié caractère pour caractère par le contrôle adverse) tant que Sacha n'a pas choisi ; `?sans=cyfinal` forcera l'avant ensuite. (Les correctifs G1, G2 et P1, eux, sont actifs par défaut.)

| piste | l'idée | L* · chroma matin (gorge ouverte / corniche) | soir |
|---|---|---|---|
| aujourd'hui | lavande, cramoisi, bande violette, route violette le soir | 39 · 25 / 47 · 28 | 39 · 37 / 40 · 40 |
| **A · GRÈS DORÉ** (recommandée) | le canyon naturel : orange doré, lits crème, l'ombre reste chaude, brume pêche | 41 · 39 / 46 · 44 | 39 · 43 / 37 · 45 |
| B · PIERRE ET OCRE | plus minéral : ocre pâle, ombres gris-bleu (jamais violettes), brume claire | 40 · 22 / 46 · 29 | 37 · 33 / 37 · 37 |
| C · TERRE ROUGE | l'affiche : grès rouge brique, ombres bordeaux, le plus saturé — la moins réussie : rouge presque uniforme, strates écrasées | 39 · 42 / 45 · 48 | 36 · 47 / 35 · 49 |

Pixels dont un canal dépasse 250 (l'orange vif sature le rouge) : aujourd'hui 1,1-1,9 % ; A 1,2-3,1 % le matin, jusqu'à 4,3 % le soir en portrait ; B 1,2-1,9 % ; C jusqu'à 6 % le soir en portrait. Nuit, pluie, orage : mêmes clartés à ±1,5 L* (les pistes n'y posent que
la palette et l'ombre) — `photos/pistes-nuit-…`, `pistes-pluie-…`.

Planches (même point de vue, vraies captures, 844×390 et 390×844) : `photos/pistes-<matin|soir>-<gorge-ouverte|corniche|en-course>-<paysage|portrait>.jpg`.
Banc : `pistes.mjs` (les mesures L*/chroma sont lues sur les captures).

**Reste à faire après le choix** : mettre la piste choisie par défaut (une ligne : `CY_PISTE`), reprendre nuit/pluie/orage dans sa famille de teintes si Sacha le veut
(la route de nuit est d'un bleu électrique très saturé — vu, non touché), refaire les 5 météos au banc des couleurs.

## Coût avant / après (`cout.mjs`, `?tel=1`, 12 vues fixes par graine, caisse posée au même endroit)

Même route des deux côtés (correctifs de génération allumés) ; avant = `?sans=cyombre` sans piste ; après = `?cypiste=A`, tout allumé. Deux lancements « avant » pour chiffrer le bruit.
| graine | appels de dessin (somme des 12 vues) avant · avant bis · après | triangles avant · avant bis · après | textures | programmes | nœuds du relief |
|---|---|---|---|---|---|
| 3 | 1095 · 1107 · 1095 | 4 425 374 · 4 422 730 · 4 421 826 | 124 · 124 | 176 · 176 | 63 · 63 |
| 7 | 1102 · 1102 · 1166 | 4 412 670 · 4 412 094 · 4 416 566 | 124 · 124 | 176 · 176 | 64 · 64 |
| 11 | 1202 · 1266 · 1202 | 4 956 976 · 4 964 960 · 4 945 016 | 126 · 126 | 176 · 176 | 55 · 55 |

- Le bruit d'un lancement à l'autre (objets vivants de la scène) vaut ± 64 appels et ± 0,2 % de triangles : **l'après est dans le bruit de l'avant**. Textures, programmes
  et nœuds : identiques. Triangles du décor : 58 935 → 58 431, 78 095 → 77 815, 88 451 → 87 835 (la façade du tunnel se découpe selon les lits : un peu moins avec la piste A).
- **Shaders** : fragment de la roche sans une instruction de plus (les pistes ne changent que des nombres ; le rebond passe par l'uniforme) ; sommet : + 2 abs, 1 max, 1 min, 3 opérations (P1).
- **Tirage de la route** (Node, 40 canyons, palier 0) : 8 340-8 660 ms avant, 8 245-8 290 ms après ; 4 273 → 4 271 tranches ; tranche la plus longue 39-62 ms des deux côtés (bruit).
  Le découpage en tranches n'est pas touché (`cyPlatOuvrages` : une passe sur ~450 points, une fois).
- **Pose et chargement** (indicatif, machine à 12-66 de charge) : pose du canyon ~300-340 ms des deux côtés ; gels relevés par le mouchard au chargement : 4 graines sur 8 avant
  (1,2-1,3 s), 4 sur 8 après (1,2-1,4 s) — la machine, pas le changement.
- Mémoire : aucune texture, aucune géométrie ajoutée (les compteurs `géométries` du renderer varient de 527 à 614 d'un lancement à l'autre dans les deux camps).

## Non vérifié (à faire avant de publier)
- **Le vrai téléphone** : tout est mesuré dans Chrome sans fenêtre en `?tel=1` ; ni la compilation du shader sur l'iPhone, ni la fluidité, ni la chaleur n'ont été vues. Aucun build n'a été fait.
- **Les paliers de vitesse > 0 dans le jeu** : seuls les bancs Node les couvrent (0, 10, 20).
- **Les portails** d'entrée et de sortie (arriver dans le canyon depuis une autre map, en repartir) : pas regardés.
- **Nuit, pluie, orage** : une planche chacune (nuit, pluie) ; l'orage n'a été photographié que pendant un éclair. Pas de mesure au banc des couleurs sur les 5 météos.
- **Les pièces sur la roche** : aucune planche ne montre une file de pièces devant une paroi ; leur lisibilité par piste n'est pas démontrée.
- Le pré-bâti (`prebati`) est resté sur son réglage par défaut du téléphone ; je n'ai pas comparé avec/sans.

## À dire à Sacha
- La galerie, la mine, le pont et le tunnel d'arrivée se roulent maintenant à plat (c'était la cause des piliers dans la route). Deux prix : un passage de 13 à 16 s sans
  dévers sur les routes à galerie, et les deux corniches autour du pont naturel perdent l'essentiel de leur mur. L'autre solution — pencher les ouvrages avec la route —
  rend tout cela, mais c'est un chantier (géométrie et collision de chaque ouvrage).
- Au fond des boucles, la dalle penche à 60-75° dans le vide (pas de paroi derrière) : propre à l'image, mais ce n'est pas « on ride le mur ». À garder ou à reprendre ?
- Les couleurs : trois pistes, à choisir sur les planches ; A recommandée. Tant que rien n'est choisi, les couleurs du jeu ne bougent pas.
