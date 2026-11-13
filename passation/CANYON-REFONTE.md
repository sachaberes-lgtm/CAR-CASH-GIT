# CANYON — la refonte des modules (2026-11-12) : passation

Branche `canyon-modules-2026-11-12` (partie d'origin/main v1496, **non poussée, cache non incrémenté**). Demande de Sacha : « de loin la map la plus dure… des modules
plus exploratifs : une gorge serrée et puis, bam, une plus grande gorge avec une rivière en dessous, une route le long de la falaise… plus de passages larges… modules
variés, sans grand demi-tour où il faut aller en arrière… qui exploitent beaucoup les parois, agréables à rider ». Il a validé le design et le remplacement des trombones ;
puis, une fois dit qu'aucun raccourci n'existe sans boucle : **« trombone ok »** → le trombone revient comme pièce RARE (`CY_REF.rac` = 0,25 : 16 canyons sur 80 au banc).
Puis : « fais d'abord ce que seul Fable peut faire, laisse le reste pour un autre modèle » — ce fichier est ce reste.

## Ce qui est fait (le cœur)
- `code/maps/canyon-route.js` : `CY_REF` (le grand commentaire dit tout) ; dans `genCanyon`, la branche `if(CY_REF.on){…}` : les pièces `gorge`, `meandre`, `traversee`,
  `toboggan`, `vire`, `riviere` (+ saut de la cascade), les modules `courbes`, `entonnoir`, `tremplin`, deux paquets de modules (T technique, F coulé), la liaison choisie
  selon ses voisines (`lienR`), le jeu de pièces tiré par la graine seule (`rj`), les gabarits (`gab()` → `CY.gab`). Dans `cyBatitG` : les gabarits deviennent des clés de
  profil (fente, ouvert, large, vallée, corniche), `S.zL` (le serrage s'efface), `S.co` → `S.of` (l'axe de la vallée décalé : la corniche). Dans `cyProfil` : le décalage.
- `code/maps/canyon-murs.js` : `cyMurPose(C,Q,VW,GA)` gère plusieurs dévers (grand mur 86°, vire 58°, toboggan 32°), `cyMurBank(…, mx9)`, `dbgCanyonGab()`.
- `code/maps/canyon-mine.js` : `dbgCanyonSonde` rend aussi `of` et `zL`.
- `?sans=canyonrefonte` = le canyon d'avant. Au banc Node ses chiffres sont identiques à ceux d'avant la refonte (40 graines) ; l'égalité au bit près en jeu n'a pas été contrôlée.
- Bancs : `node outils/banc-routes/canyon.cjs graines=1-80 palier=0 [--v] [--json=f]` (Node, le vrai genCanyon ; `SEARCH="?sans=canyonrefonte"` pour l'avant ; trois lancements de suite rendent les mêmes chiffres) ·
  dans le vrai jeu : `node outils/banc-maps/serveur.cjs 8231` puis
  `node outils/banc-maps/banc.cjs gen --carte=canyon --meteo=midi --graines=1,2,3 --port=8231 --cdp=9431 --profil=canyonref --auditfile=outils/banc-routes/canyon-page.js`
  (règle d'or, couloir, pièces, gabarits, distance de la falaise et largeur du vide de chaque corniche) ; photos : `banc.cjs vue … --s=1130,1290,1500`.

## Mesuré
| (palier 0) | avant (40 graines) | après (80 graines) |
|---|---|---|
| demi-tours par canyon | 1 (le trombone : 1,5-2 km, 30 % de la map) | 0 dans 4 canyons sur 5 (cap à 84° au plus du cap moyen) ; 1 dans les autres (le trombone rare) |
| gorge serrée (part de route) | 64 % | 55 % · corniche 16 %, large/ouvert 26 %, fente 2 %, vallée 1 % |
| virages/km · rayon mini (× rP) | 2,3 · 1,16 | 2,8 · 1,25 |
| note de rythme (moyenne) | 84 (les écarts du trombone) | 3,7 sans trombone ; ~80 avec (la même pénalité d'écart qu'avant) |
| ordres de pièces différents | 10 sur 40 | 61 sur 80 ; 4 pièces par canyon (3 avec le trombone), toutes les pièces sortent |
| descente | 25 % | 26 % |
Dans le vrai jeu (graines 1 à 22, ordi, midi) : règle d'or `dessus 0, dessous 0` partout, marge mini 7 à 34 m ; aucun point du couloir dans la roche. ⚠ La graine 9 l'a d'abord
violée (25 points dessus, 136 dessous) : dans le gabarit `vallee` le lit descend par marches de 22 × K m et passait au-dessus de la route à D = 16 m — corrigé (D = une marche
+ 16 m), revérifié : la route est 19 à 44 m au-dessus du lit, les parois à 84-232 m du bord. Le trombone rare (graines 6 et 12) : 840 m gagnés, 87 m de chute, garde −52 m.
En corniche la falaise passe à
12-16 m du bord, le vide fait 130-460 m, la route est 115-160 m au-dessus du lit ; toboggan : 29° de dévers ; construction 170-210 ms. Photos vues : le goulot, la
révélation (une cascade naît au pied : le lit tombe de ~100 m), la corniche, le toboggan, le lit de la rivière et la crête de la cascade (graine 9). Pilote auto 75 s sur 4 graines : aucune mort (mais 1,2 à 4,5 km parcourus seulement).

## ⚠ À dire à Sacha
Sans boucle, **aucun raccourci « rentable » n'est possible** au palier 0 (rayon mini 68 m, 2-3 s de vol = 156-234 m : un détour sans demi-tour n'allonge la route que de
quelques mètres ; il faut ~360° de virage pour que la route repasse à côté d'elle-même). Le « Grand Méandre » promis comme raccourci est donc devenu deux coudes en
corniche reliés par un pont. C'est DIT (le 12/11) et sa réponse est « trombone ok » : le trombone est revenu, rare. Le raccourci de distance n'existe donc que dans ~1 canyon
sur 4 ou 5 (règle RACCOURCIS : 0,4-0,6/km avant) — à lui de dire si `CY_REF.rac` doit monter.

## Reste à faire (dans l'ordre)
1. **Vérifier large** : `banc.cjs gen` sur 12 graines × (midi, soir, nuit, orage), ordi et `--tel=1`, avec `canyon-page.js` → règle d'or et couloir à zéro partout ;
   paliers 10 et 20 (`--q=palier=…` : voir comment les autres bancs imposent le palier). Contrôler `--q=sans=canyonrefonte` (l'ancien se bâtit toujours).
2. **Photos des pièces pas encore vues** : la vire, le méandre et son pont, la traversée, l'entonnoir, le tremplin, le trombone dans le nouveau canyon ; dans la vallée de la
   rivière (graine 9, s ≈ 2200) des formes NOIRES au bord de la route (des arbres ?) et pas d'eau visible : à regarder
   (`dbgCanyon().hz.p` donne les pièces et leurs longueurs, `dbgCanyonGab()` les abscisses).
3. **Course réelle** : `outils/banc-course/course.cjs` sur le canyon ; le saut de la cascade et le tremplin avec `outils/banc-routes/saut-page.js` (la pose : prévue
   30-180 m après le début de la réception, 3,1-3,4 s de vol — calcul, pas mesuré en jeu) ; la tenue sur la vire et le toboggan (`dbgCanyonMurs()` : roulis 27,7°/s
   mesuré sur le toboggan pour une borne de 24).
4. **Le goulot** (gabarit `fente`) : ses parois sont des nappes violettes étirées (les étroits, eux, ont un maillage cuit : `C.cou` / cyCouloir). Soit lui donner ce
   maillage, soit adoucir la fente (`st`, `wF` dans `prof()` de cyBatitG).
5. **Le lit de la rivière** : la route est 19 à 44 m au-dessus du lit (mesuré, 4 canyons) — on ne peut pas descendre sous une marche de cascade + 16 m sans changer le pas
   des marches (`stepH` de l'étape 3 de cyBatitG) dans la vallée ; à faire seulement si Sacha la veut plus près de l'eau.
6. **Le décor** ne connaît pas `S.of` : peupliers, éboulis et cheminées (`cyMonuPrevoir`, `cyMonuments`) se posent comme si la rivière était sous la route — en corniche,
   vérifier sur photo qu'aucun n'est planté dans la falaise ; les ramener au bord de l'eau (l'axe de la vallée est à `S.of` m de la route, + = à droite).
7. **Les petites interactions promises, pas faites** : des pièces en haut des virages relevés et en file au-dessus du vide ; des cheminées de fée à la corde des virages.
8. **Réglages** : gorge serrée 54 % (visée 45 %) ; `serreKm` 0,09 pour une cible de 0,5 dans `RYTHME_CIBLES.canyon` (voulu : baisser la cible) ; au-dessus du palier 10 un
   canyon ne tient que 3 pièces.
9. **Livrer** (seulement avec l'accord de Sacha) : `cashcar-vNNN` +1 dans `VERSION PRINCIPALE/sw.js`, mettre à jour la ligne `maps/canyon-route.js` de `code/ORDRE.txt`,
   fusionner origin/main, `node code/assembler.cjs --depuis-morceaux`, `--verifier`, gardes, pousser À PART, vérifier `/jouer/sw.js` en ligne.

## LA ROUTE SUR LES PAROIS ET LA VOÛTE (2026-11-13) — demande de Sacha : « la route est toujours plate : elle pourrait être torsadée, longer les parois par moments, jouer sans dessus dessous »
Il a choisi « les deux d'un coup ». Fait (branche `canyon-modules-2026-11-12`, même branche) :
- **Les parois** : les courbes de la grande gorge, du méandre et de la traversée qui tournent vers le VIDE se couchent contre la falaise (`CY_REF.corMax` 66°, jusqu'à 82° mesurés) ; `pipe` LE HALF-PIPE (3 courbes alternées, 80°) ;
  la vire monte à 84°, le toboggan à 48° ; quatre pièces de paroi (vire, mur, pipe, toboggan) + la voûte, trois au plus par canyon (`FAM`). `cyProfil` mêle le décalage de la corniche (S.of) et le plan de roche (S.mu) : `of9 × (1 − mu)`.
- **Les dévers se SOMMENT** (`cyMurPose`, canyon-murs.js : angles signés, bornés à ±86°, puis borne de vitesse 1,2 × 24°/s) — avant, « la plus couchée gagne » faisait sauter la dalle (73-76°/s mesurés ; après : ~30°/s).
- **La voûte** (`code/maps/canyon-voute.js`, inscrit dans ORDRE.txt après canyon-murs.js) : un TUBE de grès cuit (super-ellipse 44 × 26 m, coque de 14 m, ~12 800 triangles) autour de 10 s de route droite où la dalle fait UN TOUR COMPLET de roulis (`cyVouBank`,
  0 → 360°, smoothstep : 54°/s au plus, ~4,5 s à l'envers). Le tube tourne avec la dalle (sa section est fixe dans le repère de la route). Gabarit `tonneau` (parois à 170 m, rivière ≥ 120 m, S.mu = 0), collision `cyVouteHeurt` en vol,
  caisse assombrie dedans (canyonTick). ~1 canyon sur 4 (`vouteW` 5,5), au plus une. `?sans=canyonvoute` la retire. Hook `dbgCanyonVoute()` / `('test')` / `('vue', quart)` ; vues : `banc.cjs jadevues --carte=canyon --vuesfile=…` (voir vues-voute.json dans l'historique).
- Mesuré (Node, 80 graines, palier 0) : route penchée de plus de 20° : 6 % → 25 % ; de plus de 60° : 1 % → 6,9 % (visée 8 %) ; voûte dans 18/80 canyons ; piecesParCanyon 3,75. En jeu (graines 1 à 25, ordi et téléphone, soir/nuit/orage) : règle d'or à zéro, roche jamais touchée, construction 170-300 ms.
  Le pilote automatique franchit la voûte à l'envers sans mourir (graines 7, 10, 25) et traverse le canyon entier sur 3 graines.
- ⚠ NON vérifié : le chemin « pré-bâti » (le canyon d'après bâti pendant l'approche du portail — le banc le coupe avec `prebati=0`) ; la voûte dépend de `CY.vou`/`S.mu` posés par cyBatitG, déjà portés par `CY.av.C` comme le reste, mais jamais joués de bout en bout ;
  les paliers moteur 10 et 20 en jeu (Node seulement : penche20 0,35, 3 pièces) ; la sensation de la voûte à la main (vertige ? 54°/s est sous les 90°/s de la torsion des nuages, mais Sacha a déjà dit « envie de vomir » des routes torsadées : `CY_REF.vouteT` plus long = plus doux) ;
  l'extérieur du tube vu de loin (jamais photographié) ; le HUD/la caméra à l'envers au-delà de la photo prise à l'intérieur.
- Photos de la voûte vue de l'intérieur : la section est ronde-carrée et sombre, des bandes de grès en spirale ; le chiffre du tube dans `dbgCanyonVoute()`.

## LE CANYON V3 (2026-11-13 soir) — « le canyon se ride par ses murs »
Sacha a joué la première V3 et l'a refusée (« plate du début à la fin, la plupart du temps droite, aucune torsade, trop large, le tunnel au milieu de nulle part, buggé »).
La reprise, mesurée au juge commun de la supervision (`passation/CHARTE-ROUTES.md` de son worktree) : **30/30, R13 compris**, aux paliers 0/10/20.
- **La gorge serrée par défaut** (`CY_V3.zL0 = 0`) ; le large n'est plus qu'une révélation (cirque des boucles, vallée, corniche, pont) : ~22 % de la route.
- **Les virages relevés** (`cyDouxBank`, 32° au plus, gain `douxK` 3,2, lissage suivant le rayon des courbes) : la paroi extérieure porte la dalle ; il reste ~41 % de plat (35-55 % voulus).
- **LA PHRASE DU MUR** sur CHAQUE route (`PC.phrase`, `cyPhraseCles`/`cyPhraseBank` dans canyon-v3.js) : un plat → la dalle monte à 85° sur la paroi (le plan de roche des murs derrière elle) → le tunnel
  percé sous un BOUCHON de roche qui ferme la gorge, tête en bas ~2,4 s → l'autre paroi (`traversee`) ou la même (`arche`) → le fond. Roulis à vitesse constante (≤ ~44 °/s ressentis).
  Envers 7-9 % de chaque route (R13 : ≥ 6 %), > 60° : 21-24 %, > 45° : 26-29 %.
- **Le tunnel** (`cyVoute`, plusieurs par route) : couleur des strates (`cyT2Strate`), encastré (gabarit `tube` : parois à ~72 m, juste au-delà du creux qui tourne), bouchon au-dessus
  (`cyV3Plan`, toit `bouchon`), aucun arbre à moins de 90 m (`cyDansTube`). L'ancienne voûte (un tube orange uni, sans lumière, dans une gorge ouverte à 170 m) quitte la V3.
- **Le cap** : pièces et liaisons balancent ±35-46° (`vise`, `zig`) ; la tenue se mesure comme le juge (route rééchantillonnée, tangentes centrées, sur le tracé LISSÉ : `cyLisse`).
- Bancs : `outils/banc-routes/canyon-charte.cjs` (R1-R5 + R13, sans vols, 40 graines en 1 min), `canyon-juge.cjs --juge=<juge-page.js>` (le juge complet en Node),
  `dbgCanyonVoute('vueS', s)` (l'œil du joueur dans le repère de la dalle, pour les photos).
- Reste : le climax « la grande chute » (le rapide qui débouche sur le vide), la façade du tunnel encore lisse face aux parois en gros pixels.
