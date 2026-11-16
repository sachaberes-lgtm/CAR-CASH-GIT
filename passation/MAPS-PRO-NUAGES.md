> ## ⚠ CONSIGNE DE SACHA SUR L'OPTIMISATION (2026-11-14, 16 h 50) — PRIORITAIRE pour l'optimiseur, les vérificateurs et la reprise
> Sacha : « il faut que ce soit aussi peu lourd que ce qu'on a actuellement, mais qu'on fasse le maximum possible en rendu sans que ça nuise à la fluidité. Prends le temps. »
> Règle de budget : la map, après corrections ET optimisation, ne doit JAMAIS coûter plus que la référence origin/main v1589 (worktree wt-avant),
> sur ordinateur comme sur téléphone (--tel=1) : triangles, draw calls, ms de tirage/pré-bâti, image figée, mémoire, gels en course — chacun ≤ la référence
> (au bruit de mesure près, mesures alternées avant/après). Tout dépassement est un défaut BLOQUANT à corriger.
> À l'intérieur de ce budget : pousser le rendu au maximum (chaque milliseconde ou triangle gagné par l'optimisation se réinvestit en beauté visible :
> lumière, brume, matière, détail proche, raccords), tant que la fluidité ne baisse pas. Tableau « référence / après » obligatoire dans cette fiche.

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
- Fait (passe 1, commit 484bfd8f) : le banc `outils/banc-nuages/` (4 fichiers), les mesures ci-dessus, les photos de preuve.
- Fait (passe 2, 2026-11-14, deux ingénieurs : le premier a codé, le second a vérifié et committé) — étapes 1 à 10 du plan, chacune avec son interrupteur :
  1. tri de champ au rayon vrai `COTON.RT` (`cotonRayons`, nuages-vitrail.js) — `?sans=nutri` ;
  2. rebond hors de `COTON.I` (`COTON.G`, quatre places fixes, zéro objet créé) ;
  3. bouffée de sortie seulement pour r > 75 et > 0,9 s dedans (`NUA_POUF.ent`) ;
  4. moutons / nappes empilés refusés (`empile`, nuages-modules.js ; le refus tire ses deux nombres : le reste du ciel ne bouge pas) — `?sans=nuempile` ;
  5. `nuErrDit` : les quatre `catch` disent l'erreur une fois à la boîte noire ; `banc-maps/banc.cjs` lit les quatre variables ;
  6-9. la traversée — `?sans=nudechire` coupe tout : fondu de proximité resserré au contact (`NUA_POUF.pres` → boucle-6-hud.js), lèvre des trouées (`uDech`, nuage8Mat),
     volutes en huit brins (`poufGpuVol`, nuages-pouf-gpu.js ; démo outils/pouf-nuage/demo.html ; film : `outils/banc-nuages/film.cjs`), vrai dedans (voile tenu, plafond 0,6),
     brume brève au pouf (`NUA_POUF.bru`), souffle de lumière en sortant d'un grand nuage (`NUA_POUF.lum`) ;
  10. bruit à gradient entrelacé à la place du Bayer sur la route des nuages (`uIgn`) — `?nuages=bayer`.
- Mesures APRÈS (diag-nu/apres*, même banc, mêmes graines) :

| course | POPS avant → après | poufs → tirs GPU avant → après | sans pouf / doubles | voile max | appels / triangles figés |
|---|---|---|---|---|---|
| midi g1 | 60 → 0 | 4→8 → 4→4 | 0/0 | 0,37 → 0,57 | 95 / 278k → 95 / 278k |
| midi g2 | 63 → 0 | 3→5 → 3→4 | 0/0 | 0,38 → 0,60 | 90 / 250k → 100 / 259k |
| midi g3 | — → 0 | — → 4→6 (deux nappes > 0,9 s : voulu) | 0/0 | 0,60 | 71 / 105k |
| soir g1 | 63 → 0 | 4→7 → 4→4 | 0/0 | 0,38 → 0,58 | 98 / 278k → 96 / 278k |
| nuit g4 | 43 → 0 | 3→4 → 3→3 | 0/0 | 0,35 → 0,59 | 79 / 257k → 81 / 257k |
| pluie g5 | 47 → 0 | 4→8 → 4→4 | 1/1 → 0/0 | 0,34 → 0,57 | 85 / 298k → 85 / 299k |
| orage g1 | 249 (avant2 : 109) → 69-73 | 4→6 → 4→4 | 0/0 | 0,44 → 0,54 | 95 / 365k → 90 / 328k |
| tel midi g1 | 38 → 0 | 4→8 → 4→4 | 0/0 | 0,35 → 0,58 | 90 / 206k → 91 / 208k |
| tel midi g3 | 54 → 0 | 4→8 → 4→6 | 1/0 → 0/0 | 0,38 → 0,60 | 87 / 217k → 88 / 242k |

  - Orage : les pops qui restent sont TOUS des nuages qui apparaissent à la limite de la brume (d − R ≥ 1,015 × fog.far sur les 25 relevés : brume pure, invisibles) — pas des sauts.
  - Finesse près (lodPres) inchangée (54/45/55/36/51/73…) : aucun nuage ne change de lot. Triangles du coton : +0 à +25k selon l'instant de la photo figée (le tri garde les nuages de bord d'écran).
  - Route : les trois md5 identiques après les changements (`empreinte-route.cjs`, revérifié à la fin).
  - Jade (banc-maps gen, graines 1-2, diag-nu/jade2-av|ap) : mêmes obstacles de coton (ShaderMaterial) ; seuls diffèrent des objets mobiles (MeshBasic 100 × 133, deux cubes Phong) — l'instant de la mesure.
  - Autres maps : uDech = uIgn = 0 hors nuages (nuMoodTick), NUA_POUF.pres/bru/lum = 0 hors nuages (cotonPouf sort tout de suite) → mêmes nombres dans les shaders et l'exposition. Seul le tri de champ change partout où il y a du coton (Jade, orage) : voulu.
  - Course complète `outils/banc-course/course.cjs --map nuages:midi` (téléphone, deux courses, pause, mort, REJOUER) : 0 exception, 0 requête en échec, la même console qu'avant (wt-avant : même avertissement WebGL « too many errors » des deux côtés).
- Photos APRÈS : `apres-nappe-planche.jpg` (mur jusqu'au contact puis la matière qui s'ouvre), `apres-volutes-film.jpg` (les huit brins, 0,04 → 0,90 s), `apres-mouton-dechirure.jpg`, `apres-tel-deux-couches.jpg`, `trame-bayer-puis-ign-zoom.png`.
- Reste / non vérifié :
  - ⚠ la demande nuages n'a toujours pas été vue dans un message de Sacha (voir la note en tête) : la partie 2 est entièrement derrière `?sans=nudechire` pour la retirer d'un mot si elle n'est pas voulue ;
  - dedans une nappe, on voit encore les plans translucides de la coquille (planche, s4899-s4920) : un intérieur plus doux reste à faire ;
  - la traversée EN VOL (aucun vol dans les courses du pilote), le z-fighting, un vrai iPhone ; les galettes lisses (étape 11, cause non trouvée) ;
  - l'image figée reste dans le bruit de la machine partagée (1 à 5,6 ms des deux côtés) : coût GPU de la lèvre et des volutes non chiffré au-delà de « appels +0 ».

## Reprise après les deux vérificateurs (2026-11-14)
Quatre défauts mineurs relevés ; trois corrigés, un (couverture) laissé ouvert et dit tel quel.
- **Nappes encore empilées sur une pente** (soir, tel, graine 3 : deux humilis r 142 / 143 à 90 m de route, centres à ~55 m de haut, le test en hauteur laissait 49 m) : REPRODUIT (cibles j=43 et j=44, nappes 4, empilés 1). Corrigé dans `empile()` (nuages-modules.js) : dès qu'une nappe est en jeu, on compte aussi la ROUTE entre les deux (moins de 0,8 × (r1 + r2) = refus ; le refus tire toujours ses deux nombres). APRÈS : soir tel g3 et midi ordi g3 = nappes 3, empilés 2, j=44 disparu, POPS 0, entrées 3 sans pouf 0 doublons 0, erreurs avalées vides. Graines 1 et 5 (midi ordi) : moutons 3, nappes 1, empilés 0, comme avant. `?sans=nuempile` coupe les deux tests.
- **Shader partagé « au bit près »** : le test du trou était devenu `distance/h9.w<1.`. Remis au caractère près (`d9<h9.w`, la même distance) ; la lèvre passe en `smoothstep(h9.w,1.4*h9.w,d9)`, multipliée par uDech = 0 hors nuages. Le discard des autres maps est donc l'expression d'avant. Pas de comparaison de rendu photo des autres maps (non fait).
- **`?sans=nudechire` ne coupait pas tout** : c'est la documentation qui était fausse. Le commentaire de nuages-v8.js dit maintenant ce qu'il coupe (la traversée seule : fondu, voile, couronne, lèvre) et donne l'ancien jeu entier : `?sans=nudechire,nutri,nuempile&nuages=bayer`.
- **Couverture** (vol, z-fighting, coût GPU, étape 11, vrai iPhone) : toujours NON vérifié, rien de neuf (consigne « mollo sur les tokens »).
- Route : md5 identiques (dfdff242…, f39bc3ed…, c1f2bb99…). Assembleur --verifier OK. Fichiers en LF.
- Banc : lancer d'abord `node outils/banc-nuages/serveur-sonde.cjs <port> <worktree>` (sinon « __gameReady jamais levé »), puis `node outils/banc-nuages/traverse.cjs --graines=3 --meteo=soir --tel=1 --dur=80 --port=<port> --cdp=<cdp> --rafale=0 --pops=0 --out=...`.

## Passe de l'optimiseur (2026-11-14, courte : « mollo sur les tokens »)
Aucun code du jeu changé dans cette passe : seulement des mesures et ce constat.
- Route : md5 identiques à origin/main (wt-avant) aux trois paliers (1530137c…, e2f15de1…, 1ffead44…, graines 1-20).
- Tirage de la route en Node, alterné avant/après deux fois (copie du banc dans le scratchpad, `RAC=<worktree>`) :
  avant 65,6 / 67,1 / 73,2 puis 64,5 / 52,5 / 69,1 ms ; après 61,1 / 56,1 / 64,7 puis 67,0 / 57,0 / 67,7 ms (paliers 0/10/20) : même coût, dans le bruit (la route n'est pas touchée).
- Zéro allocation par image : relu `cotonTick` (nuages-vitrail.js), `nuCasseTick`, `nuMoodTick`, `nuPouTick` (nuages-casses.js) et le pouf GPU :
  aucun `new`, `clone`, tableau ou fermeture créés par image (les `new` sont à la fabrication ou dans les crochets `dbg*`). Rien à gagner là.
- Appels / triangles : voir le tableau APRÈS ci-dessus (appels +0 à +10, triangles +0 à +25 k selon l'instant ; l'orage baisse de 365 k à 328 k). Pas remesuré ici.
- Pas fait (à reprendre si on veut un vrai gain) : coût GPU chiffré de la lèvre et des volutes (image figée trop bruitée sur la machine partagée :
  il faudrait une trace GPU ou dbgTemps alterné sur deux ports, 10 relevés chacun) ; banc-maps --tel=1 pour voir si le coton d'ALLEGE peut perdre un lot de finesse au loin ;
  libération des géométries au changement de map (non remesurée) ; intérieur des nappes plus doux ; traversée en vol ; vrai iPhone.

## Relecture des vérificateurs (2026-11-14, passe courte)
- **Corrigé : le tri au rayon vrai (NU_TRI) touchait l'orage et les Pics de Jade.** Dans cotonTick (nuages-vitrail.js), `TRI=NU_TRI&&!J&&!(LVL.cur&&LVL.cur.id==='orage')` :
  la map NUAGES seule garde le rayon vrai ; l'orage et Jade reprennent `Rc=R`, exactement le code d'origin/main (le chiffre « orage 365 k → 328 k triangles » du tableau APRÈS ne vaut donc plus).
  `?sans=nutri` coupe toujours le tri sur les nuages. Assembleur vert, garde-allege vert, diff 3/3 lignes, fichier en LF.
- Banc rejoué (ordi) : `node outils/banc-maps/banc.cjs gen --carte=<nuages|orage|jade> --graines=1,4 --roule=20 --photos=1 --port=8340 --cdp=9540 --profil=pro-nuages`
  → 6/6 graines sans erreur (__nuModErr compris), 0 croisement, 0 trou, aucune mort. Photos regardées (nuages g1 s1191, orage→jade g4 s1261) : rien d'anormal.
- **Non reproduit : la « silhouette bleue à bords en escalier »** (verif-pc g4 s1512). Sur la photo nuages/nuit g1 s1191 on voit à gauche un grand astre bleu pixelisé : c'est le décor du ciel de nuit
  (non touché par cette branche). Pas de comparaison à abscisse égale avec origin/main : reste un doute, non tranché.
- Toujours non vérifié : --tel=1, traversée en vol photographiée, coût GPU de la lèvre et des volutes, z-fighting, vrai iPhone, demande confirmée par Sacha.

## La vraie optimisation (passe 2 de l'optimiseur, 2026-11-14 soir → reprise du 2026-11-15)
Référence = `wt-avant` (origin/main v1596). Le premier optimiseur a été coupé (réseau) juste après le commit 700e6d32, avant d'écrire cette section : l'arbre était PROPRE (rien de non commité),
le commit a été revérifié (assembleur vert, garde-allege verte, fichiers en LF, empreinte de route identique : 1530137c… / e2f15de1… / 1ffead44…) puis complété.
- 700e6d32 (le premier optimiseur) : la peau des nuages à part triée par le champ (`?sans=nupeautri`), la boîte du nuage pour le tri (`nuboite`), une finesse légère pour les nuages à part au loin
  (`nulodapart`), le bord une finesse plus bas au-delà de 400 m (`nubordfin`), le vrai dedans (`nudedans`), le contact en vol (`nuvolpres`), les galettes devenues de la ouate (`nuvoile`).
- **Défaut trouvé à la reprise (bloquant, corrigé)** : la finesse légère gardait DEUX formes par nuage à part : octets des géométries au GPU (`q-octets-gpu.js`) 20,7 → 28,5 Mo à l'ordinateur,
  14,6 → 22,1 Mo au téléphone — au-dessus de la référence. Correctif (nuages-vitrail.js, `nuCompacte`, `?sans=nucompact`) : sur la route des NUAGES seulement, chaque forme des nuages à part
  (corps et peau, fine et légère) range sa normale en Int8 normalisé et sa couleur cuite en Uint8 normalisé (au lieu de Float32). APRÈS : **16,9 Mo (ordi), 13,1 Mo (téléphone)**, sous la référence.
  Même image : `q-meme-image.js` rend la forme en flottants puis la même en octets, même instant, même caméra : 8/8 vues, l'écart flottants/octets est inférieur au bruit d'un rendu à l'autre (animations).
  Libération au portail (opt/q-lib.js) : 68/68 géométries des nuages à part (formes et peaux, fine et légère) reçoivent `dispose`, ordi et téléphone ; plus aucun « nuages v8 » dans la scène.

| poste (graine 1, midi sauf mention) | référence wt-avant | après (branche) |
|---|---|---|
| route : md5 paliers 0/10/20, graines 1-20 | 1530137c / e2f15de1 / 1ffead44 | identiques |
| ordi, 72 vues fixes (sol) : appels moy · triangles moy · max triangles | g1 102 · 687 k · 1 272 k / g3 90 · 699 k · 1 391 k | g1 93 · 588 k · 1 267 k / g3 83 · 563 k · 1 319 k |
| téléphone, 72 vues (sol) : appels moy · triangles moy · max triangles | g1 73 · 412 k · 721 k / g3 74 · 435 k · 689 k | g1 64 · 324 k · 711 k / g3 64 · 342 k · 628 k |
| vue la plus lourde (le départ, même vue figée, ordi) | 191 appels · 1 273 k | 183 appels · 1 209 k (coton 435 k → 531 k : le tri juste ; peau des nuages à part 299 k → 147 k) |
| octets des géométries des nuages à part (GPU) | ordi 20,7 Mo · tél 14,6 Mo | ordi 16,9 Mo · tél 13,1 Mo |
| temps GPU d'une image, duel 24 vues × 6 tours, deux ordres | ordi 6,05 / 7,23 ms · tél 4,82 / 3,68 ms | ordi 5,67 / 7,77 ms · tél 4,67 / 4,10 ms |
| en course, ordi g1, 80 s alternés ×2 : image médiane · p95 · pire | 20,4 · 75-88 · 1 392-1 868 ms | 16,7-16,8 · 21-36 · 635-1 092 ms |
| en course, tél g3, 80 s alternés ×2 : image médiane · p95 · pire | 15,3-15,6 · 25-30 · 633-687 ms | 16,1-16,4 · 24-25 · 463-846 ms |
| `cotonTick` en course (médiane) | ordi 0,091-0,094 · tél 0,055-0,059 ms | ordi 0,068-0,077 · tél 0,050-0,064 ms |
| pré-bâti de la route (banc-vitesse/route.cjs, 6 routes) | newTrack 357 puis 289 ms/route | 291 ms/route (2e passe polluée par la machine : rejetée) |
| course complète (banc-course, téléphone) | 0 exception, 273 messages console | 0 exception, 274 messages (même nature) ; un 1er passage où la 2e course n'est pas partie, non reproduit au 2e |

Lecture honnête :
- Le duel GPU a un biais de position MESURÉ (l'onglet B gagne ~7 % quel que soit le code) : c'est pourquoi les deux ordres sont donnés. Ordi : rapport branche/référence 0,94 puis 1,07 → à égalité.
  Téléphone : 0,97 puis 1,11 (médianes ; 0,84 puis 1,09 en sommes) → à égalité au bruit près, PAS une baisse prouvée. Le coton coûte plus (le tri juste dessine les nuages du bord : c'était le défaut n° 1),
  la peau triée et la finesse légère le reprennent.
- Les maxima d'appels « 72 vues » montent de +5 sur la graine 1 (183 → 188 ordi, 139 → 144 tél) et baissent de −5 ailleurs : la dérive des nuages change la vue d'un passage à l'autre ;
  à la même vue figée du départ, la branche fait −8 appels. Non tranché au-delà.
- Rien n'a été réinvesti en beauté dans cette reprise : la marge (mémoire −18 % ordi / −11 % tél, triangles moyens −15 à −22 %) est laissée en réserve. Le seul défaut visible restant
  (les PANS translucides au cœur d'une nappe, ci-dessous) n'a pas trouvé de remède sûr sans itérer en photos.

Les restes de la première passe :
- **La traversée** (photos regardées : passation/maps-pro-nuages/apres-traversee-planche.jpg ; passation/maps-pro-nuages/apres-*.jpg) : au sol, un mouton se lit bien (mur jusqu'au contact, déchirure, volutes en cubes qui s'écartent puis se referment).
  Au cœur d'une nappe (r 126, s 4 858-4 902) on voit encore des pans translucides à arêtes droites au-dessus de la route : correct, pas encore « pro ». **En vol : NON vérifié** — avec `--sautcible=70`,
  les sauts du pilote restent au ras de la route (photos de vol non représentatives).
- **z-fighting** (opt/zf, carte des pixels qui changent pour un décalage de 2 cm) : aucune zone de surfaces qui se battent ; seulement des points isolés et des liserés d'arête (crénelage). Rien corrigé.
- **Silhouette bleue en escalier sous l'orage** : comparée à la même abscisse (orage g4 s 1 512 et s 1 580, passation/maps-pro-nuages/orage-silhouette-reference-et-branche.jpg) : la même forme bleue est DANS la référence (décor existant) — pas une régression.
- **Galettes lisses** : cause trouvée et corrigée dans 700e6d32 (`nuvoile`, photo passation/maps-pro-nuages/galettes-avant-apres.jpg : les quatre voiles d'altitude Phong deviennent de la ouate).
- Fichiers partagés de la branche (rien de neuf dans cette reprise) : `moteur/boucle-6-hud.js` (hors nuages `NUA_POUF.pres` = 0 → les mêmes cibles 10/40 et 30/110), `rendu/portails.js`
  (n'agit que si `userData.lod` existe : route des nuages). Aucun fichier de la session « qualité par appareil » n'est touché.
- Bancs ajoutés : `outils/banc-nuages/duel-gpu.cjs` (le duel, deux ordres), `q-octets-gpu.js`, `q-meme-image.js`, `q-cout-vues.js`, `q-pause.js` ; lancés avec
  `node outils/banc-maps/banc.cjs gen --carte=nuages --meteo=midi --graines=1 --port=8340 --cdp=9541 --profil=pro-nuages-m [--tel=1] --auditfile=<q>.js --auditms=300000 --out=<dossier>`.

## Reprise après le vérificateur adverse (2026-11-15) : les pans, le dedans, le vol, le budget tranché
Le vérificateur a relevé quatre défauts : la traversée en vol jamais photographiée, les pans translucides au cœur des nappes, la pointe d'appels à +5 jamais tranchée, et rien réinvesti en beauté. Les quatre sont traités ci-dessous. Rien n'est poussé et la version n'a pas été montée.

**Le nouveau banc : le film à l'horloge du jeu** (`outils/banc-nuages/vol-film.cjs`)
- Le banc remplace `performance.now` par sa propre horloge et coupe la boucle `requestAnimationFrame`. Le jeu n'avance que par `dbgStep`, à 16,7 ms par image.
- Le voile, les volutes et la brume sont donc filmés comme à 60 images/s, quelle que soit la lenteur des captures.
- ⚠ `dbgStep` seul ne suffit pas : la boucle `requestAnimationFrame` d'origine continuait en parallèle. Mesuré : 25 à 60 m parcourus toutes les 3 images.
- Trois modes :
  - `--mode=vol` : la caisse est lâchée par `dbgLache` sur un arc qui traverse un nuage à hauteur de vol. Option `--dh` pour viser plus bas.
  - `--mode=nappe` : traversée d'une nappe au sol.
  - `--mode=mouton` : traversée d'un mouton.
- Deux outils de diagnostic :
  - `--diag=1 --diags=<s>` : sur la même image, chaque matière visible est retirée à son tour. `ecart.ps1` classe ensuite ce qui change l'image.
  - `--exp=<fichier> --exps=<s,…>` : des variantes de shader rendues sur la même image. Après chaque recompilation, attendre au moins 0,6 s : sinon le nuage manque à l'image.
- Planches : `choix.cjs` choisit les images, puis `grille.ps1` les assemble.

**Les pans : trois causes, isolées couche par couche** (photos `reprise2-diag-couches-approche.jpg`, `reprise2-peau-coupable.jpg`, `reprise2-diag-couches-dedans.jpg`)
1. **La peau** (le vernis de verre, `nuages-casses.js`) est la vraie coupable des pans **bleus translucides**. Ses grandes facettes plates, vues à 20-60 m, donnaient ces pans.
   - Correctif : sur la route des nuages, elle s'efface entre ~40 et ~180 m (`uPeauP`). La peau proche n'est plus mélangée, ce qui fait moins de remplissage.
   - Interrupteur : `?sans=nupeaupres`.
2. **Le corps vu de dessous** formait un plafond de carreaux, les faces des cubes.
   - Correctif : au contact prévu (`NUA_POUF.pres`) et dedans, la ouate à moins de 220 m se fond dans sa propre lumière (`uPres`, lissé : 0,5 s pour monter, 0,8 s pour retomber). Ses faces vues par la tranche ne s'effilochent plus (`e9`, l'alpha du bord).
   - Interrupteur : `?sans=nubrume`.
3. **Dedans, des planches blanches** : ce sont les dalles du corps entre les trouées.
   - Correctif : dans un grand nuage, elles se dissolvent dans la trame entre 18 et 55 m (`uDed`).
   - Testé et écarté : l'alpha de silhouette (`uK.w`) et la trame ne sont pas en cause.

**Le vrai dedans**
- Au cœur d'une nappe, on voyait le ciel bleu : la coquille n'est pas dessinée vue de l'intérieur.
- Un second voile CSS (`#cloudDed`, créé au premier besoin) le corrige. Il est transparent au centre (la route, la caisse) et blanc-lavande vers les bords et le haut. Son opacité suit `NUA_POUF.dedS`.
- Coût : rien au GPU du jeu. C'est une couche du compositeur, en `display:none` hors d'un grand nuage.
- Interrupteur : `?sans=nuvoileded`.
- ⚠ **Défaut trouvé, déjà présent dans la référence** : au téléphone, le HUD contemplatif (`body.hudCalme`, `hud-leger.css`) met à zéro tous les enfants de `#hud`, `#cloudFx` compris.
  - Preuve : le voile, même forcé en rouge opaque, n'apparaissait pas. Donc, au téléphone sans nitro, le voile des nuages n'existe pas, sur toutes les maps.
  - `#cloudDed` est donc posé **hors** de `#hud`, juste avant lui (`position:fixed`, `z-index:1`).
  - `#cloudFx` n'est pas touché (CSS partagé) : c'est une décision pour Sacha.

**Photos** (regardées)
- `reprise2-nappe-avant-apres.jpg` : rangée du haut = référence, rangée du bas = branche. À l'approche, un banc blanc au lieu des pans bleus ; dedans, le blanc tout autour et la route lisible.
- `reprise2-dedans-nappe-ordi.jpg` : l'intérieur d'une nappe, sur ordinateur.
- `reprise2-tel-nappe-apres.jpg` : la même traversée au téléphone.
- `reprise2-vol-avant-apres.jpg` : **la traversée en vol, enfin photographiée**, référence puis branche, graine 1, nuage j37, r 146.
  - La référence montre les mêmes pans translucides avant l'entrée. La branche montre une masse blanche.
  - Limite : la caisse ne fait qu'effleurer le haut du nuage (profondeur ≤ 0,25). Le dedans en vol reste donc léger.
  - Seule la graine 1 a un nuage à 18-80 m au-dessus de la dalle (pas les graines 2 et 3). La dérive au vent fait parfois manquer le nuage : relancer, ou viser plus bas avec `--dh=-6`.
- Ce qui reste visible :
  - à l'approche d'une nappe, de fines lignes sombres entre les carreaux blancs ;
  - en vol, quelques dalles blanches à arêtes droites juste avant l'entrée ;
  - en effleurant un nuage en vol, le contact prévu (`pres`) clignote d'une image à l'autre. `uNearF` (code de 700e6d32) oscille : 4 → 13 → 6 m. `uPres`, lui, est lissé.

**Le budget**, mesuré à neuf. ⚠ Les mesures d'avant dépendaient du profil Chrome :
- le `localStorage` est propre à chaque origine (8340, 8341) ;
- le régime du poste PC y est gardé ;
- résultat : le même code donnait 140 ou 174 programmes, et 12 ou 73 Mo de copies JS, selon le profil.

Désormais, chaque mesure se fait avec un **profil neuf**, et `?poste=max` à l'ordinateur.

| poste | référence wt-avant | branche |
|---|---|---|
| route, md5 paliers 0/10/20, graines 1-20 | 1530137c / e2f15de1 / 1ffead44 | identiques |
| ordi, 72 vues, passage 1 : appels moy/max · triangles moy/max | 103 / 185 · 698 k / 1 317 k | 92 / 183 · 565 k / 1 190 k |
| ordi, 72 vues, passage 2 | 106 / 192 · 697 k / 1 317 k | 93 / 190 · 562 k / 1 189 k |
| téléphone, 72 vues | 76 / 147 · 422 k / 768 k | 63 / 139 · 329 k / 723 k |
| mémoire à temps égal, ordi (25 s et 50 s) : octets GPU · copies JS · tas JS | 200,3 Mo · 37,3 Mo · 200-279 Mo | 196,0 Mo · 36,3 Mo · 188-193 Mo |
| idem, dont les nuages : GPU · JS | 141,9 · 12,9 Mo | 137,8 · 11,9 Mo |
| mémoire, téléphone : GPU · JS | 144,8 · 29,9 Mo | 143,0 · 29,8 Mo |
| nombre de géométries · textures · programmes (ordi) | 576 · 129 · 140 | 606 · 124 · 140 |
| idem (téléphone) | 558 · 107 · 126 | 590 · 108 · 128 |
| duel GPU, 24 vues au sol ×6, deux ordres (somme, ms) | 99,5 puis 118,0 | 99,5 puis 118,8 (à égalité) |
| duel GPU au téléphone, 16 vues ×5, deux ordres | 42,2 puis 43,2 | 42,6 puis 40,4 (à égalité ou mieux) |
| en course, ordi g1, 80 s, 2 courses alternées : image médiane · p95 | 16,7 · 17,8 / 18,2 ms | 16,7 · 17,9 / 18,1 ms |
| pops en course · tirs GPU (ordi g1) | 64 / 63 · 8 | 0 / 0 · 4 |
| course complète (banc-course, téléphone) | 0 exception, 273 messages console | 0 exception, 273 messages |

Lecture :
- **La pointe d'appels est tranchée.** D'un passage à l'autre, la référence elle-même varie de 185 à 192. Mesurée deux fois avec des profils neufs, la branche reste chaque fois sous la référence : −2 en pointe, −11 à −13 en moyenne. Le +5 du rapport précédent venait de la dérive des nuages et du profil.
- **Le nombre de géométries monte de 30.** Ce sont les formes légères des nuages à part. Les octets, eux, baissent.
- **Programmes au téléphone : +2** (128 contre 126), sur un seul passage. Non tranché : peut-être l'heure de compilation de la bouffée ou des peaux.
- **Image figée en fin de course** (`dbgTemps`) : 3,4-3,5 ms contre 2,0-2,1 ms, mais sur des vues de fin différentes (78-88 appels contre 100). Le duel, fait sur les mêmes vues, est à égalité. Je retiens donc le duel. Le coût exact des deux uniformes dans une vue *dedans* n'est pas chiffré à part.

**Fichiers touchés** : `nuages-v8.js`, `nuages-casses.js`, `nuages-modules.js` et `nuages-vitrail.js` (une ligne). Aucun fichier partagé de plus.
- Hors de la route des nuages, rien ne change :
  - `uPres` = 0 et `uPeauP` = (0, 0), posés à chaque image par `nuMoodTick` ;
  - donc `mix(…, 0.)`, `×(1.-0.)` et `+0.` rendent les mêmes valeurs, et le `discard` de la peau ne s'applique pas ;
  - `#cloudDed` n'est jamais créé tant que `dedS` = 0.
- Contrôles : orage et Jade au banc-maps sans erreur, `non-declares.cjs` sans doublon, assembleur `--verifier` vert, `garde-allege` vert.
- Aucun fichier de la session « qualité par appareil » n'est touché.
