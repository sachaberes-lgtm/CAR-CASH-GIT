# MAPS PRO — NUAGES : le diagnostic (2026-11-14)

Demande de Sacha : « nuage a besoin de debugging sur les nuages et d'une meilleure animation quand on leur passe à travers ».
Branche `pro/nuages-2026-11-14` (partie d'origin/main v1589). **Cette passe n'a RIEN changé au jeu** : seulement le banc `outils/banc-nuages/` et ce document.
La ROUTE des nuages est validée (« keep as is ») : elle ne doit pas bouger d'un bit (empreinte ci-dessous).

> Note pour l'intégration : la demande relayée à ce lancement du workflow parlait de JADE (« variété de forme d'îlot ») ; la tâche calculée, elle, portait sur les NUAGES.
> Ce diagnostic ne touche pas au jeu, il est donc sans risque — mais la citation de Sacha sur les nuages n'a pas été vue dans le message relayé : à confirmer avant de coder la partie 2.

## Les bancs (tous headless, muets)

```
node outils/banc-nuages/serveur-sonde.cjs 8340            # sert le worktree ; glisse window.__NU dans index.html AU VOL (le disque n'est pas touché)
node outils/banc-nuages/traverse.cjs --graines=1,2 --meteo=midi --dur=115 --out=<dossier>      # ordi ; --tel=1 pour le téléphone ; --meteo=soir|nuit|pluie|orage
node outils/banc-nuages/empreinte-route.cjs               # md5 de la route (paliers 0/10/20, graines 1-20) + ms du tirage en Node
```
- `traverse.cjs` (CDP 9540, profil Chrome `pro-nuages`, `-tel` pour le téléphone) : par graine, l'audit statique (`__NUaudit`), la course au pilote auto qui VISE chaque mouton / nappe,
  la sonde image par image (`sonde-page.js`), les appels de dessin toutes les 4 s (`dbgAppels`), l'image figée (`dbgTemps`), des photos en rafale autour de chaque nuage traversé,
  et la preuve des pops en deux photos (A = le jeu ; B = la même vue, tri de champ neutralisé). Options : `--pops=0`, `--rafale=0`, `--vise=0`, `--nit=1`, `--q=a=b`.
- Ce que compte la sonde : **POPS** (un nuage retiré/remis par le tri de champ alors qu'un de ses lobes, ≥ 10 px, est dans le champ), changements de finesse à moins de 400 m,
  poufs, tirs du pouf GPU, entrées sans pouf, doubles entrées (même nuage < 4 s), secondes dedans (caisse, caméra) avec/sans voile, trouées, erreurs avalées
  (`__nuModErr`, `__nuPoufErr`, `__poufGpuErr`, `__nuEmbErr`).
- ⚠ `outils/banc-maps/banc.cjs` ne lit AUCUNE de ces quatre erreurs (sa liste : `__jadeErr`, `__foretErr`…) : un `cotonModules` qui lève y passe pour « 0 erreur ».
- Machine partagée : un échec `__gameReady jamais levé` se relance. Les compteurs (pops, poufs, triangles, md5) sont stables ; les ms sont bruitées.

## L'état « avant » (origin/main v1589)

| mesure | valeur |
|---|---|
| route, md5 palier 0 / 10 / 20 (graines 1-20) | `1530137c3b8a49c7385d08be2934989f` / `e2f15de10ff09d088bae95a6f4ccf252` / `1ffead448ffab2f4338c6f1a75944db6` |
| tirage de la route en Node (médiane) | 41 / 38 / 46 ms |
| construction (`cc:construction`, graine 1 midi, ordi) | 998 ms + 254 ms |
| rayon vrai / rayon du tri de champ (par nuage) | médiane 1,19-1,24 · max 1,40-1,73 · 23 à 29 nuages sur ~52 au-dessus de 1,2 (59/133 à l'orage) |
| POPS en course (ordi) | midi g1 60 (44,6/min) · midi g2 63 (58,4/min) · soir g1 63 (45,6/min) · nuit g4 43 (39,5/min) · pluie g5 47 (42,6/min) · **orage g1 249 (242/min)** |
| POPS en course (téléphone, `--tel=1`) | midi g1 38 (27,3/min) · midi g3 54 (40,8/min) |
| finesse changée à moins de 400 m | 28 à 46/min (69/min à l'orage) |
| un mouton (r 27-34 m) à 230-250 km/h | dedans ~0,5 s ; 1 pouf + 1 bouffée « de sortie » 0,47-0,70 s après (pas toujours) |
| la nappe (r 114-157 m) à 280-390 km/h | dedans 0,6-1,2 s |
| voile (`cloudInS` max) | 0,33-0,44 → opacité du voile CSS ≤ 0,11, ~0,5 s |
| appels de dessin en course (ordi) | 87 à 257 (dont coton 9 à 98) |
| triangles en course (ordi) | 282 k à 1 208 k (dont coton 48 k à 602 k) |
| appels / triangles en course (téléphone) | 93 à 186 / 282 k à 715 k |
| image figée `dbgTemps` (ordi, fin de course) | 1,9 à 6,3 ms (bruitée) |
| `cotonTick` (lissé) | 0,05-0,08 ms, pointe 0,7 ms |
| le pouf GPU | 1 appel, 256 instances × 12 triangles, seulement tant qu'une bouffée vit |
| erreurs avalées, 8 courses | aucune |

## Les constats (preuves : `passation/maps-pro-nuages/`)

1. **Les nuages sautent au bord de l'écran (majeur).** `cotonTick` (nuages-vitrail.js, ligne du `R=Math.max(r*1.08*I[o+8],h*.56)`) trie le champ avec une sphère trop petite :
   les lobes d'un gabarit débordent l'unité (le commentaire de `cotonPose` le dit lui-même : « ~1,4 r pour un cumulus, plus pour une enclume »). Mesuré : rayon vrai / rayon du tri
   médian 1,2, max 1,73 ; 40 à 60 pops par minute, 242 à l'orage. Le colosse (gabarit 24, r 699 m, déborde de 479 m) clignote : sort à s 347, revient à s 367, ressort à s 407.
   Preuve image : `avant-pop-A-jeu.jpg` / `avant-pop-B-sans-tri.jpg` (même caméra ; le bord droit et la bande du haut à gauche gagnent de la ouate en B) — le saut vu est modeste sur cette paire,
   la mesure, elle, est sans appel. Le même rayon sert au test de brume de l'orage (`d-R>fF`).
2. **Traverser un nuage ne montre presque rien (majeur — c'est la demande).** Séquence photographiée (`avant-mouton-*.jpg`, `avant-nappe-*.jpg`) :
   - le nuage se DISSOUT en trame (Bayer 4 × 4, `N8_TRAME`) entre 40 et 10 m de la CAMÉRA (`uNearF`, boucle-6-hud.js : 10-40 m au sol, 30-110 m en vol) : la caméra étant ~10 m derrière la caisse,
     la matière a disparu AVANT que la caisse la touche (`avant-nappe-2-trame-11m-avant.jpg` : on voit la route et des arêtes de cubes fantômes à travers) ;
   - dedans, il n'y a RIEN : la ouate est une coquille vue de face seulement (matière sans `side`), donc ciel dégagé au milieu d'une nappe de 250 m (`avant-nappe-3-dedans-ciel-vide.jpg`) ;
   - le voile ne dure que 0,5 s et plafonne à 11 % d'opacité (`cotonPouf` ne pose `cloudIn` que pendant la bouffée ; `updateClouds` le remet à 0 à chaque image) : ni brume, ni lumière, alors que
     `GLARE`, la brume `FOG_CLOUD` et l'exposition sont déjà branchés sur `cloudInS` ;
   - il ne reste que la couronne de cubes : des cubes opaques aux arêtes dures, qui naissent autour de la caisse — rien ne s'ouvre, rien ne se referme.
3. **Le rebond du nuage fausse sa propre mesure (majeur).** `nuaPoufPulses` écrit le rayon et l'étirement gonflés dans `COTON.I` (I[o+3], I[o+9]) ; `cotonPouf` relit ces mêmes chiffres pour
   savoir si la caisse est dedans. Mesuré (pluie g5, mouton j 20) : entrée à t 5,33 s (r 27, sy 0,62), « sortie » puis ré-entrée 0,05 s plus tard (r 30, sy 0,51). Ici l'anti-rebond de 0,3 s
   a absorbé le deuxième pouf ; une ré-entrée après 0,3 s (le rebond dure 0,9 s) en lance un second avec son bruit et son voile — **non reproduit**, mais le mécanisme est là.
   Le rayon gonflé passe aussi dans le tri de champ et le choix de finesse.
4. **Le pouf part deux fois sur un mouton, ou pas, selon la vitesse (majeur).** `if(t-NUA_POUF.t>.45&&NUVIT.vox)poufGpuTir(cp,.35,.5,.8)` : la bouffée « de sortie » est prévue pour un nuage où l'on est
   resté, mais un mouton de 30 m à 230-250 km/h dure justement 0,47-0,70 s. Mesuré : midi g1 4 poufs → 8 tirs ; midi g2 3 → 5 ; orage 4 → 6 ; nuit 3 → 4.
5. **Des nappes empilées (majeur).** `nappe()` (nuages-modules.js) vérifie les autres passages de la ROUTE, pas les autres nuages. Midi g3 téléphone : trois nappes (r 142, 114, 143 m) à
   s 4656, 4716, 4740 — trois poufs demandés en 1,1 s, le troisième refusé (anti-rebond), quatre bouffées vivantes (les 4 places de `POUF_GPU`), et un fouillis de plans translucides
   (`avant-tel-nappes-empilees.jpg`).
6. **La trame se voit (mineur à majeur selon l'écran).** Rectangles pointillés suspendus dans le ciel et bords de nuages en damier à 1280 × 800 (`avant-pop-A-jeu.jpg`, `avant-mouton-2-trame-45m-avant.jpg`) :
   le fondu corps ↔ cubes fantômes (`nuvPoids`) et le fondu de proximité passent par la même trame Bayer 4 × 4, très régulière à densité 1.
7. **Des « galettes » lisses (mineur, cause non établie).** Un empilement de disques lavande (rose le soir), sans relief ni cubes (`avant-galette-lisse.jpg`, en haut au centre). Hypothèse : un nuage
   plat (`dessous` / `plafond` / nappe, sy 0,34-0,65) vu par son ventre à l'ombre, hors de portée du relief de près (320 m). À confirmer avec `dbgAppels` et la sonde avant d'y toucher.
8. **Erreurs avalées sans trace (mineur).** Quatre `catch` rangent l'erreur dans une variable globale et rien d'autre ; `cotonPouf` est appelé à chaque image : s'il lève, plus de pouf du tout, en silence.
   `window.dbgErreurs` (la boîte noire) existe. Aucune erreur sur 8 courses.
9. **Finesse sans hystérésis (mineur).** `fq` change de lot dès que `sg` franchit 10 / 16 / 32 : 28 à 69 changements par minute à moins de 400 m. Aucun aller-retour vu sur un même nuage dans les exemples relevés.
10. **Les quatre places du pouf GPU (mineur).** Après deux moutons les quatre bouffées vivent (constat 4) : la suivante coupe la plus vieille (âge ~1,9 s, quelques cubes encore visibles).

Non vérifié : la traversée EN VOL (aucun vol dans les courses du pilote, `sVol` = 0) ; z-fighting ; un vrai iPhone (seulement `?tel=1` en Chrome).

## Le plan (dans cet ordre ; chaque étape a son interrupteur et sa mesure au banc)

Avant tout et après chaque étape : `empreinte-route.cjs` (les trois md5 identiques) et `traverse.cjs` sur midi g1-g3, soir g1, orage g1, pluie g5, plus `--tel=1` midi g1, g3.

**Partie 1 — déboguer**
1. Tri de champ juste (`?sans=nutri`). À la création des gabarits, un rayon vrai par gabarit (`S.rt` : le plus grand « distance au centre du tri + rayon du lobe », reflets compris).
   Dans `cotonTick`, ce rayon pour le tri de champ et le test de brume ; l'ANCIEN `R` reste pour la finesse (aucun nuage ne change de lot). Cible : POPS = 0 ; noter la hausse des triangles du coton.
   ⚠ `cotonTick` sert aussi aux Pics de Jade et à l'orage : prouver par `banc-maps` que Jade ne change que par des nuages de bord d'écran.
2. Le rebond hors des chiffres du nuage. Deux facteurs par nuage dans un tableau à part (alloué avec `COTON.I`), appliqués dans `cotonInst` ; `COTON.I` n'est plus jamais écrit en course.
   Cible : `doubles` = 0 (pluie g5), finesse stable pendant le rebond.
3. Un pouf par mouton. La bouffée de sortie seulement après plus de 0,9 s dedans et jamais pour un nuage de r ≤ 75. Cible : tirs GPU = poufs sur les moutons.
4. Pas de nappes empilées. `nappe()` et `mouton()` refusent si un nuage déjà traversable est à moins de 0,8 × (r1 + r2) en plan et dans sa hauteur.
   ⚠ un refus consomme moins de tirages `cr` : le ciel APRÈS ce point change (pas la route — vérifier quand même l'empreinte). Cible : `sansPouf` = 0, jamais deux traversées à moins de 150 m.
5. Erreurs dites une fois à la boîte noire (les quatre `catch`), et les quatre variables ajoutées à la liste de `banc-maps/banc.cjs`.

**Partie 2 — la traversée (`?sans=nudechire` coupe tout)**
6. La matière tient jusqu'au contact : quand un nuage traversable est devant (moins de ~90 m, au sol), `uNearF` descend vers 4-14 m au lieu de 10-40. Zéro coût (deux nombres).
   Photo cible : à 11 m de l'entrée, un mur plein.
7. La déchirure : dans la boucle des huit trouées du fragment (elle existe), une lisière entre 1 et 1,35 × le rayon — plus claire (la lumière du soleil sur le bord) et effilochée par la vapeur (`n8vap`, palier 2 ;
   la trame seule ailleurs). La trouée s'ouvre déjà en 70 ms et se referme en 1,2 s : c'est elle, « la matière qui s'ouvre et se referme ».
8. Les volutes : même maillage, même appel (256 cubes, `POUF_GPU`), nouvelle chorégraphie dans le vertex shader — les cubes naissent SUR la lèvre de la trouée, s'enroulent vers l'extérieur
   (un anneau tourbillon autour de la marche), puis se referment sur l'axe derrière la caisse ; étirés dans le sens de la vitesse pour se lire à 300 km/h. Rien de neuf côté processeur.
9. Dedans, un vrai dedans (nappe, gros nuage, vol) : `cloudIn` tenu à la profondeur réelle (plafonné ~0,6) tant que la caisse est dans un lobe — le voile, la brume `FOG_CLOUD`, `GLARE` et l'exposition
   suivent déjà `cloudInS` : rien à écrire de plus. À la sortie, un souffle de lumière de 0,2 s.
10. La trame : essayer un bruit à gradient entrelacé à la place du Bayer 4 × 4 (`?nuages=bayer` pour revenir) ; à juger sur photos à densité 1 et sur `--tel=1`. Gain non mesuré à ce jour.
11. Les galettes (constat 7) : seulement après en avoir trouvé la cause.

Preuve de coût attendue pour la partie 2 : appels +0, triangles +0, `cotonTick` inchangé, image figée dans le bruit (alterner avant/après sur deux ports, « avant » = le worktree `wt-avant`).
Téléphone : tout ce qui retirerait de l'image se garde sur `ALLEGE` / `TEL_NATIF`, jamais `IS_MOBILE` ; rien dans ce plan n'en retire.

## Ce qui est fait / ce qui reste
- Fait : le banc `outils/banc-nuages/` (4 fichiers), les mesures ci-dessus, les photos de preuve.
- Reste : tout le plan (aucune ligne du jeu n'a été touchée) ; la traversée en vol à instrumenter (pilote `dbgAuto({vol:1})` ou saut imposé) ; un essai sur vrai téléphone.
