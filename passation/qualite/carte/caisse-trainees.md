# CARTE — la voiture et les traînées de lumière en course (iPhone)

Lecture seule de `code/` (branche `qualite-appareil` = origin/main v1596), 14/11. Rien n'a été lancé (ni navigateur, ni banc) : tout ce qui
suit vient du code et des deux rapports de la nuit (`passation/finition/GFX.md`, `CAISSE.md`). Les largeurs en pixels sont CALCULÉES à partir
des constantes, pas mesurées ; c'est signalé à chaque fois.

## 0. La chaîne d'une image en course, téléphone récent (palier 2), dans l'ordre

1. **Scène** rendue dans la cible du compositeur à `curDPR` (plafond `PAL.B.imgDprCap=[1.25,1.35,1.25]`, `rendu/palier-appareil.js:251`,
   départ au cran QL 1 `imgQlDepart`). 13 Pro couché : 1055×487 pour un écran de 2532×1170 (×2,4). Cible demi-flottante (`triptyque-bloom.js:155-161`).
   Les rubans `SILS` (additifs, `renderOrder 2`), les traînées POP `TRX`, le feu de pixels `NFEU`, les halos des feux y sont dessinés
   **à cette résolution**.
2. **Halo (bloom)** : `UnrealBloomPass(bRes, 0.44, 0.44, 0.92)` (force, rayon, seuil), base `bSc=.42` au téléphone (`triptyque-bloom.js:167-169`),
   puis entrée en demi-résolution `imgBloomRes=[1,1,.5]` (`palier-appareil.js:300`), 3 étages au départ P2 (`MOB_P0`, `gouverneur-paliers.js:37`).
3. **Passe finale `acesPass`** (ACESShader, `triptyque-bloom.js:80-150`) : soit FXAA + piqué (`uSharp`, seulement en zone plate), soit
   — dès que `sp>0.02` (boost, nitro) — le **flou radial** à 6 prises (`ACES_N=LOOK_TEL?6:8`, l.35) qui lit des **mips pré-floutés**
   (`FLOU_MIPS`, l.65, `lodF=log2(intervalle)+0.5`, l.119). Lot `NET_NITRO` (l.117-123) : par pixel, là où l'intervalle du flou < ½ texel,
   retour au FXAA. Puis halo composé, ACES, contraste, saturation, vignette, tramage.
4. **LA LOUPE** (`rendu/loupe-caisse.js`) si active : `acesPass` écrit dans `LOUPE.rt` (8 bits, taille de la scène) ; une dernière passe
   l'agrandit sur une toile à la taille de l'écran : bilinéaire partout, reconstruction orientée (12 texels) + piqué **dans le disque de la
   caisse seulement**. Sinon : la toile fait la taille de la scène et c'est **WKWebView qui l'étire en bilinéaire** (×2,4 à froid).

## 1. LA LOUPE — conditions exactes

`code/rendu/loupe-caisse.js`
- Objet `LOUPE` l.19 (`k`, `r:1.35`, `pique:1`, `chaudT`, `bascules`…).
- **Éligibilité, calculée UNE FOIS au chargement** (IIFE l.21-28) : `ALLEGE && LOOK_TEL && W2_POST && PAL.n>=2 && devicePixelRatio>=1.9`
  et pas `?sans=loupe` ; `LOUPE.k=min(3,DPR)` (donc **3 sur tout iPhone ×3**, 13 Pro comme 17 Pro) ; `?loupe=2` → k=2 ; `?loupe=tout`
  → reconstruction plein écran. `LOUPE.ok` exige aussi les accesseurs natifs `HTMLCanvasElement.prototype.width/height` (l.26-27).
  Branchement réel seulement si `POST_ON && acesPass` (l.50).
- **Chaque image** `loupeVeut()` (l.41-43) : `started && !gameOver && !garageOn && !VHD.on && !stallOn && !loupeChaud()` (ou `LOUPE.force`).
- `loupeChaud()` (l.38-40) : vrai si `MOB_S.thermo>=2` (iOS serious/critical) **ou** `MOB_P.t>=2` (palier du gouverneur GPU ≥ 2)
  **ou** `QL.effondre` ; puis reste vrai **20 s** après la dernière fois (`LOUPE.chaudT`).
- Le palier `MOB_P.t` avec capteur iOS = l'état thermique (`mobPalCible`, `gouverneur-paliers.js:50`) : fair → 1, serious → 2 (3 après
  150 s, 4 si branché `__ccBranche>=2` ou critical). Donc **en « fair » (tiède) la loupe reste ACTIVE** ; elle tombe à serious.
- `QL.effondre` (`moteur/boucle-1.js:59`) : au plancher NETTE, p50 > 24 ms pendant 6 s **en état « calme »** ; or `calme9` exige `!loop._r30`
  (l.47), et la cadence 30 Hz régulière pose `_r30` (l.38-39) ; `ms9` est en plus ramené à une image d'écran quand `CAD.on||CAD.eco` (l.27).
- **Mode économie d'énergie** (`window.__ccEco`, posé par `JeuViewController.swift:23,456`) : n'intervient PAS dans `loupeVeut`. Il ne
  sert qu'à la cadence (`CAD.eco`, `moteur/cadence.js:65`) et au wattmètre.
- **Verdict pour « un 13 Pro tiède en économie d'énergie »** : si l'état iOS était nominal ou fair et que le téléphone n'était pas
  branché-et-serious, la loupe était **très probablement active** (aucune condition ne la coupe ; `QL.effondre` est quasi impossible à 30 Hz
  régulier). Si iOS était déjà serious (fréquent d'après les vols du 12/11 : « une fois serious, on n'en redescend plus de la soirée »,
  `gouverneur-thermique.js:60-63`), elle était **éteinte** et l'image était l'étirement ×2,4 du navigateur. **NON VÉRIFIÉ** : l'état de
  la loupe n'est écrit nulle part dans la boîte noire (`LOUPE` n'apparaît que dans `loupe-caisse.js` et `pose-verdict.js:110,117`) ; seul
  `dbgLoupe()` le dit, à la console. Non vérifié non plus : que WKWebView accepte la surcharge `width/height` de la toile (CAISSE.md §6.5).
- **Le disque** `loupeDisque()` (l.30-37) : centre = la caisse remontée d'une demi-hauteur ; rayon = ½·diagonale (l,w,h) projetée × `LOUPE.r`
  (1,35), plafonné à 0,45 × max(toile) ; fondu de bord `max(8, r·0,3)` px (l.37, l.73). CAISSE.md : 250 000-440 000 px couché (8-16 % de
  l'écran). **Les traînées sortent du disque à quelques mètres derrière les feux** : tout le reste du ruban n'a que la lecture bilinéaire.
- Reconstruction : `lpS`/`lpT` (l.64-69), bornée par f g j k (l.89), piqué `uPq` (=1). Elle est faite pour des **arêtes** : sur un profil
  gaussien (le ruban) elle n'a presque rien à reconstruire.
- Crochets : `dbgLoupe()` → `{ok,on,k,tout,toile,scene,disque,pxDisque,images,bascules,chaud}` ; `dbgLoupe({on:0|1|null, voir:1, k, r, pique,
  caisse, rendre:1})` (l.106-111).

## 2. LES RUBANS DE LUMIÈRE `SILS` — où vit quoi

⚠ **Les constantes, la texture et les maillages des rubans vivent dans `code/maps/orbite-2.js`** (zone interdite) :
- `SIL` l.418 : `N:200, SUB:2, PAS:.6, DTM:1/45, LONG:100, QUEUE:24, OFF:.9, VMAX:12, cutA:.3, cutK:.55, cutB:9, cutV:9, kx:.9,
  wC:.21, wG:.56, wGa:.9, capC:.03, capG:.13, halo:.62, coeur:1.3, chaud:.9, froid:.55, un:1.4, tete:1.8, pres:.6, axeV:.02, pouls:.55,
  poulsV:30, braise:1.1`.
- `LUMT` (traînée des feux arrière) : `k:.58, kF:.7, lg:46, w:.72, r:[1.5,.1,.07], rF:[1.75,.16,.08], rDn:30`.
- `TRJ` (voile d'encre de jour) : `k:1.15, max:.78, trx:1.1` ; `?sans=encrejour`.
- `SIL_TEX` : canvas **128×2**, moitié gauche = halo `exp(-4.5u²)`, moitié droite = cœur `exp(-10u²) + 0.3·exp(-2.5u²)`, bords forcés à 0 par
  `1-|u|^6` ; `LinearFilter`, **pas de mipmaps**.
- `mkSillage()` : 4 sommets par rangée (halo G/D, cœur G/D ; uv.x 0 / .5 / .5 / 1), `MeshBasicMaterial({map:SIL_TEX, vertexColors,
  AdditiveBlending, depthWrite:false, DoubleSide, fog:false})`, `renderOrder 2` ; + maillage d'encre `mi` (`renderOrder 1`, mélange
  `Zero / OneMinusSrcColor`). `SILS=[4 sillages]`, `trailL/trailR`. `SIL_ROWS=(N-1)*SUB+1=399`.
- `dbgSillage()` est cité en commentaire (l.403) mais **n'est défini nulle part** (grep) : pas de crochet pour régler les rubans à chaud.

Le code qui les anime (autorisé) — `code/voitures/atchoum-feu.js` :
- `sillageStep(tr,px,py,pz,cr,cg,cb,k,wm,dt,wu)` l.99-139 : fixe un point si > `SIL.PAS` m ET > `SIL.DTM` s (45 pts/s max ⇒ **à 30 i/s un point
  par image** : 1,4 m à 150 km/h, 4,6 m à 500, 8,3 m à 900, GFX.md) ; Catmull-Rom ; `SIL_FIN` (l.98, `SIL_FIN_PAS=1.1`, `SIL_FIN_MAX=8`,
  `?sans=rubanfin`) découpe selon la distance.
- `silRuban(tr,R9,emet,dt,wm,wu)` l.150-206 (lignes du fichier : 150 + n de l'extrait) : ruban face caméra ;
  - largeurs l.183 : `wc=min(SIL.wC·wa·(1+.25·al)·wk, dC·SIL.capC·wa)`, `wg=min((SIL.wG+SIL.wGa·al)·wa·wk, dC·SIL.capG·wa)` (demi-largeurs en m ;
    `al`=part de la longueur, `wk`= élargissement de tête, `wa`= largeur du sillage) ;
  - fondus près de l'objectif l.182 : cœur `SM(dC,1.4,2.7)`, halo `SM(dC,1.9,3.8)` ; vu dans l'axe `SM(sA,.05,.22)` au sol ;
  - intensités l.192 : halo `SIL.halo`(.62)×couleur, cœur `SIL.coeur`(1.3)×couleur + `hot` (`SIL.chaud` .9, blanchit la tête) ; pouls.
- Appel par image : `moteur/boucle-4-effets.js:139-160`. Au roulage `wl9 = LUMT.w = .72`, couleur rouge `LUMT.r × kB(.58) × .74` ;
  au nitro `wa → 1`, `wm = 1.3 + allumage`, couleur de la nitro `(1.38,.62,.17)×.74` ou celle de la traînée achetée (`FXT.trail`).
- `trailStep` l.41-87 : l'ancien ruban (meute, fantôme, fourgon), pas celui du joueur.

## 3. POURQUOI les traînées paraissent floues sur iPhone (du plus lourd au plus léger)

Repère : fov vertical 72° (`rendu/scene-ciel.js:979`, retouché en portrait par `palier-appareil.js:271` — non vérifié en course). Couché sur
13 Pro à DPR 1,25 : 487 texels de haut ⇒ ~6,8 texels de scène par degré ; 1 texel = 2,4 px d'écran.

1. **Le profil du cœur est une gaussienne SANS plateau, plus une jupe.** Dans `SIL_TEX` le cœur vaut `exp(-10u²)+0,3·exp(-2,5u²)` sur la
   largeur `2·wc` : mi-hauteur à |u|=0,26, soit **une largeur à mi-hauteur de 26 % de la bande**, et la jupe (30 % d'éclat) occupe la moitié de
   la bande. Sous le cœur, le halo `exp(-4,5u²)` sur `2·wg` (2,7× plus large). Il n'y a **aucun bord** : par construction c'est un trait doux.
   Calcul (non mesuré) : près de la caméra le plafond `capC` joue (demi-angle 0,03·wa rad) → au roulage bande de cœur ≈ 2,5° ≈ 17 texels,
   mi-hauteur ≈ 4,4 texels ≈ **10 px d'écran** de dégradé, sans bord net ; au nitro ≈ 23 texels de bande. Loin (20 m) : demi-largeur
   ≈ 0,15 m → bande ≈ 6 texels, mi-hauteur ≈ 1,5 texel ≈ 3,7 px ; à 40 m elle passe sous le texel (scintillement + bilinéaire).
2. **Rendu à la résolution de la scène puis agrandi ×2,4 en bilinéaire** (×3,5 au palier 4, DPR 0,85). Hors du disque de la loupe c'est
   le cas même loupe posée (lecture bilinéaire, `loupe-caisse.js:72`) ; loupe éteinte, c'est le navigateur. Un dégradé de 4 texels devient
   ~10 px d'écran, un texel isolé une bosse de 5 px.
3. **Au nitro, le flou radial pré-flouté.** Hors du disque net (`uSafe`, rayon ≤ 0,32 de l'image, `postCaisse` l.70-78 ; le flou commence au-delà
   de `uFv.x=.26`, l.99) chaque prise lit le niveau de mip `log2(intervalle)+0,5` (l.119, l.123) : **un flou isotrope de plusieurs texels**,
   pas seulement dans le sens du filé. Les rubans partent des feux vers le BAS de l'écran, vers la caméra : ils quittent le disque net en
   quelques mètres et sont précisément les objets les plus filés. `NET_NITRO` ne rend le FXAA qu'aux pixels où l'intervalle < ½ texel.
4. **Le halo (bloom)** : le cœur du nitro dépasse 1 (couleur ×1,3 + `hot`) → au-dessus du seuil 0,92, le bloom l'étale (force 0,44, rayon 0,44)
   depuis une base à ~0,42 × ½ de résolution, 3 étages (2 en fair). Il ajoute une lueur large qui « mange » la ligne. Au roulage la couleur
   rouge (luminance ~0,2) reste sous le seuil : pas de bloom, mais un trait déjà doux (point 1).
5. **Le FXAA** (l.132-145) : sur un trait fin et contrasté le test `lMax-lMin > max(.0312, lMax·.125)` est vrai ⇒ moyenne le long du contour
   détecté : ~1 texel de plus de douceur. Le piqué `uSharp` ne s'applique QUE dans la branche « pas de contour » (l.145-147) : jamais sur le ruban.
6. **Additif + voile d'encre de jour** : l'additif sur fond clair ne fait qu'éclaircir (d'où `TRJ`) ; le halo et le voile, larges et doux,
   baissent le contraste entre le cœur et le fond : l'œil lit un ruban plus large et plus mou qu'il n'est.
7. **Facettes à grande vitesse** (avant `SIL_FIN`) : réglé cette nuit par `SIL_FIN` (non vérifié à l'œil sur le 13 Pro, GFX.md §5.3).
8. **Le disque de la loupe ne couvre que la caisse** : les 2-4 premiers mètres du ruban au mieux. Et même dedans la reconstruction orientée
   aiguise les arêtes, pas une gaussienne (point 1).
9. Ce qui **n'est pas** en cause : la définition de la texture (64 texels par moitié, largement assez) ; aucune passe temporelle (pas de TAA).

Traînées POP (`TRX`, `rendu/trainees-1.js`, `trainees-2.js`) : quads instanciés, planche canvas 8×8 cases de 128 px (`trxPlanche`), filtre
`LinearMipmapLinear` (l.143) ⇒ petits à l'écran, ils lisent des mips (plus mous) ; dessins eux-mêmes doux (filé `img(37)` en gaussiennes ;
`shadowBlur` sur les néons). Fondu près de l'objectif `uNear (.9,2.1)`. Densité : `GFX_PLEIN` (`stries-vent.js:27`) les garde pleines.
Feu de pixels `NFEU` (`nitro-feu.js:126+`) : des cubes `InstancedMesh` (arêtes vraies, donc bien servies par une reconstruction d'arêtes) ;
`NFEU_PLAGE` (ALLEGE). Feux LED (`feux-led.js`) : halos sprites `ledTex` (dégradé radial 128², `LinearFilter`), cônes `FAIS_M` additifs ;
`?feux=0|1|2`. Stries de vent (`stries-vent.js:4-5`) : points additifs `sparkTex`.

## 4. La caisse elle-même

Aucun LOD ni allègement dans `code/voitures/` (GFX.md §1) : matières, vernis (`ENV_VERNIS`), liseré (`RIM_GLSL`), feux sur la tôle (`FEU_U`,
`FEU_GLSL`), lampes éteintes sautées (`LFB_CAISSE`) — identiques sur tous les appareils. Ce qui la rend molle : l'agrandissement (traité par la
loupe, à froid seulement) ; à chaud rien n'est rendu ; la lueur orange des feux/flammes qui lave l'arrière (CAISSE.md §4). Cube de reflets
64² (GFX.md). Détails plus fins qu'un texel (plaque, calandre) : seul un rendu plus fin les rendrait.

## 5. Pistes, classées par (gain de netteté / coût)

| # | Piste | Gain | Coût / risque |
|---|---|---|---|
| A | **Profil du cœur plus dur** : dans une nouvelle texture (ou en réécrivant le canvas de `SIL_TEX` depuis un morceau autorisé, cf. pièges) un cœur à **plateau + bord raide** (ex. `smoothstep` sur 15-20 % de la bande), jupe 0,3 → ~0,1 ; halo inchangé. | fort (c'est LA cause n°1, sur tous les appareils, loupe ou non) | nul en GPU (même texture, même géométrie) ; risque d'aliasing loin → garder un plancher de largeur |
| B | **Plancher de largeur en pixels** : `wc ≥ ~1,2 texel` à la distance `dC` (calcul : `dC·tan(fov/2)·2/hauteurScène`) pour que le cœur loin ne passe jamais sous le texel (scintille puis bave). | moyen (queue propre, plus de grésillement) | quelques opérations CPU par rangée |
| C | **Sortir les rubans du flou radial** : au nitro, ne pas lire le mip pré-flouté sur les pixels de ruban (masque : alpha/stencil écrit par le ruban, ou rubans dessinés APRÈS la passe finale). | fort au nitro (moment où on les regarde) | moyen : un masque = une cible ou le canal alpha de la cible demi-flottante (à vérifier : alpha libre ?) |
| D | **Étendre la loupe aux traînées** : en plus du disque, une ou deux capsules d'écran le long des 15-20 premiers mètres projetés de chaque ruban (`SIL_Q` projeté, 2 segments), ou un masque « pixel clair » (luminance du bilinéaire > seuil). | moyen (bord du cœur au pixel d'écran SI le cœur a un bord : à faire après A) | 12 lectures sur quelques % de pixels en plus ; ne sert à rien loupe éteinte |
| E | **Dessiner le CŒUR des rubans à la résolution de l'écran**, après la loupe, sur la toile ×3 : halo laissé dans la scène (il nourrit le bloom), cœur seul en passe tardive, test de profondeur contre une `DepthTexture` de la cible du compositeur (lue et comparée dans le shader du ruban), couleur passée par une approximation de l'étalonnage. | très fort (un trait de 1-3 px d'écran franc) | élevé : nouvelle passe, cible de profondeur, étalonnage dupliqué, seulement quand la loupe est posée (sinon pas de toile ×3) |
| F | Monter `LOUPE.k`/DPR scène sur les iPhone plus puissants (profil) : DPR 1,5-1,75 au lieu de 1,25 sur 15 Pro / 16 / 17. | moyen partout (×1,7 de pixels = trait 30-40 % plus fin à l'écran) | fill +44 % (1,5) à +96 % (1,75) : chaleur ; c'est un choix de profil |
| G | Bloom : seuil un peu plus haut ou force du cœur plus basse sur les rubans (`SIL.chaud`), ou halo pleine résolution 5 étages sur les profils puissants (`imgRegle({halo:'tout',mips:5})`). | faible-moyen | faible ; c'est une affaire de goût (« trop sec » possible) |
| H | `?loupe=tout` sur profil très puissant (reconstruction plein écran). | faible pour les rubans (gaussiens), moyen pour le décor | 12 lectures × 2,96 Mpx |

Ordre conseillé : A (+B) d'abord — gratuit et valable pour tous —, puis C, puis D ; E seulement si A-D ne suffisent pas à l'œil de Sacha.

## 6. Paramètres d'URL et crochets utiles (sous-système)

`?sans=loupe` · `?loupe=2` · `?loupe=tout` · `?sans=netnitro` · `?sans=rubanfin` · `?sans=feuplein` · `?sans=encrejour` · `?sans=plage` ·
`?flou=ancien` · `?traits=0` · `?bloom=ancien|plie2d` · `?feux=0|1|2` · `?flamme=ancien` · `?trainee=signal` · `?img=max` / `?imgsans=a..f`
(leviers P2 : a halo ½, b ombre, c plafond 1,25…) · `?gouv=max` · `?mob_gouv=0` · `?mob_froid30=0` · `?thermo=modele` · `?palier=0|1|2` ·
`?appareil=iPhone14,2` (essayer un modèle) · `?tel=1` (banc) · `?garde=1`.
`dbgLoupe()` · `dbgGfxFin()` / `dbgGfxFin(0|1)` · `dbgFlou({v,s,fv})` (défini dans `maps/nuages-vitrail.js:217`) · `dbgTrx()` · `dbgGouv()` ·
`dbgGouvPaliers()` · `dbgThermique(n)` · `dbgQual(k)` · `dbgDPR(x)` · `dbgGfx` · `dbgPalier()` · `imgRegle({...})` · `dbgNitro(9,0)` · `dbgStep`.
Bancs : `outils/banc-finition/gfx.cjs`, `outils/banc-finition/caisse.cjs`, `planche.py`.

## 7. Pour un système de profils par appareil : où brancher, pièges

**Où brancher**
- **Le modèle exact est déjà connu** : `window.__ccAppareil` (« iPhone14,2 ») est écrit par l'app avant le script
  (`JeuViewController.swift:33`) ; `PAL` le lit (`palier-appareil.js:60-66`) mais **le réduit à 0/1/2** (`g<=10→0, g<=12→1, sinon 2`) : un
  iPhone 12 et un 17 Pro Max sont le même palier 2. C'est LA raison pour laquelle le 15 de Léo a l'image du 13 Pro. Un profil doit naître là
  (ex. `PAL.prof` ou un `PAL.n` étendu à 3/4) sans casser `PAL.b` (tableaux à 3 colonnes : un palier 3 lirait `undefined` → prévoir un repli).
  `?appareil=` permet de l'essayer au banc. Correspondance identifiants ↔ modèles : à établir (non vérifiée ici).
- **Leviers du sous-système à piloter par profil** : `PAL.B.imgDprCap` / `dprNetCap` (résolution de scène) ; `imgBloomRes`, `bloomPass._nM`
  (via `imgRegle({halo,mips})`) ; `LOUPE.k`, `LOUPE.tout`, `LOUPE.r` ; `ACES_N` (6/8 prises, **figé à la compilation** : `LOOK_TEL`) ;
  `FLOU_MIPS` ; `NET_NITRO` ; la table `MOB_PN` (`gouverneur-paliers.js:34`) et `loupeChaud` (seuils de coupure à chaud) ; les constantes
  `SIL.*` (largeurs, cœur, halo) ; `emiK`, `GFX_PLEIN`.
- **HAUTE / BASSE** : le réglage actuel est `SAVE.d.q` = `'fast' | 'net' | 'haute'` (`sauvegarde.js:67,71`, `qLbl`, `qSuivant`,
  `nettete-qualite.js:97-134`) ; `qHaute()` empêche l'échelle QL de baisser. **La loupe ignore ce réglage** (elle ne regarde que la chaleur) ;
  `dprPlafond(fast)` (`palier-appareil.js:252`) est le seul endroit où il touche la résolution. Un passage à deux choix doit relire aussi
  `toile1` (`palier-appareil.js:266-268`, qui lit `q` dans la sauvegarde BRUTE avant `SAVE`) et `soleil-planete.js:476`.

**Pièges**
1. **`SIL`, `SIL_TEX`, `mkSillage`, `LUMT`, `TRJ` sont dans `code/maps/orbite-2.js` (interdit).** `SIL` est un `const` objet : ses
   propriétés se modifient depuis un morceau PLUS LOIN dans `ORDRE.txt` (orbite-2 = l.154 ; `atchoum-feu.js` = l.161, `boucle-4-effets.js`
   = l.324). `SIL_TEX` ne peut pas être réassigné : soit repeindre son canvas (`SIL_TEX.image`, puis `needsUpdate=true`), soit poser une
   autre texture sur `SILS[i].m.material.map` ET `SILS[i].mi.material.map`. Attention : `silApercu` (garage, `interface/habillages-accueil.js:125`)
   et la boutique (`SIL_ENCRE`) utilisent le même ruban : un profil de cœur plus dur change aussi la vitrine.
2. **Éligibilité de la loupe figée au chargement** (IIFE) : si `PAL.n` baisse en course (`palApprend`, `palier-appareil.js:138`), la loupe
   reste « ok ». Inversement un profil ne peut pas l'allumer après coup sans refaire le branchement (l.50-105 ne s'exécutent qu'une fois).
3. **Ordre des morceaux** : `loupe-caisse.js` (l.75) tourne AVANT `gouverneur-thermique.js` / `gouverneur-paliers.js` (l.318-319) : `MOB_S`,
   `MOB_P` n'y sont lus qu'à l'exécution, sous `try` — une lecture au chargement lèverait une TDZ avalée en silence.
4. **Les programmes se figent à la compilation** : `ACES_N`, `FLOU_MIPS`, `NET_NITRO`, `GRADE_ACES`, `ACES_VIF`, la reconstruction de la loupe
   (`LOUPE.tout`) sont dans le texte du shader. Les rendre dépendants du profil = décider AVANT la compilation (OK si le profil est connu au
   chargement, ce qui est le cas avec `__ccAppareil`) ; jamais de recompilation en course.
5. **La toile ×3 de la loupe** : trois croit que la toile fait la taille de la scène (accesseurs surchargés) ; tout code nouveau qui lit
   `renderer.domElement.width` reçoit la taille de la SCÈNE, et un rendu direct à l'écran reçoit le viewport entier (`setRenderTarget` enveloppé,
   l.56-57). Un rendu des rubans « à la résolution de l'écran » (piste E) doit passer par ce chemin.
6. **Rien ne trace la loupe dans la boîte noire** : avant de juger une photo de Sacha, ajouter `LOUPE.on/k` (et `MOB_P.t`, `MOB_S.thermo`,
   `curDPR`) à l'enregistreur (`moteur/enregistreur-perf.js:87`), sinon impossible de savoir quelle image il a vue.
7. **Le 30 i/s calé dès le départ** (`MOB_FROID30`, `gouverneur-thermique.js:68`) : un point de ruban par image ⇒ `SIL_FIN` travaille plus ;
   et tout coût ajouté à froid hâte « fair → serious » (mesures du 12/11), qui ÉTEINT la loupe : un profil trop gourmand rend l'image plus
   floue au bout de 2 minutes qu'un profil sobre.
8. **ALLEGE vs IS_MOBILE** (`CLAUDE.md`, `garde-allege.sh`) : tout retrait d'image se garde sur `ALLEGE`/`TEL_NATIF`, jamais `IS_MOBILE`.
   L'ordinateur (Vercel) n'a ni loupe, ni `NET_NITRO`, a 8 prises de flou, l'aberration, le halo plein 5 étages, `bSc=.55` : c'est la cible
   « iPhone 17 = version Vercel ».
9. Branché + serious ⇒ palier 4 (DPR 0,85, `MOB_CHARGE`, `gouverneur-paliers.js:48-50`) : les essais « au bureau, en charge » montrent
   l'image la plus floue possible ; tester débranché (`banc-de-chaleur` : la surchauffe vient de la charge).
