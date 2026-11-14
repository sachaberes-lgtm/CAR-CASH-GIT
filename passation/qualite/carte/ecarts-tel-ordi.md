# Écart d'image téléphone / ordinateur, hors résolution (carte, lecture seule, 14/11)

Périmètre lu : `code/rendu/` (sans `palier-appareil.js` ni `nettete-qualite.js`, que je ne cite que là où ils rendent une valeur lue ailleurs), `code/voitures/`, `code/gameplay/`, `code/interface/`, `code/moteur/`. `code/maps/*` : seulement compté.
Toutes les lignes sont celles de la branche `qualite-appareil` (= origin/main v1596). Rien de ce qui suit n'a été mesuré sur un appareil : les coûts sont **calculés** à partir du code, sauf quand je cite un chiffre MESURÉ écrit dans un commentaire du code.

---

## 0. Les drapeaux : qui voit quoi (à lire avant tout)

| Drapeau | Définition | Vrai sur l'iPhone (app) | Vrai sur Vercel `/jouer/` (PC) |
|---|---|---|---|
| `TEL_NATIF` | `rendu/soleil-planete.js:418` (tactile ET (`hover:none` ou écran < 600)) | oui | non |
| `FORCE_TEL` | `soleil-planete.js:419` : `?tel=1`, ou `EDITION==='mobile'` sans `?pc=1` | non | **oui** (`EDITION='mobile'` : `page/tete.html:59`) |
| `IS_MOBILE` | `soleil-planete.js:420` = `FORCE_TEL‖TEL_NATIF` | oui | **oui** (interface seulement) |
| `LOOK_TEL` | `soleil-planete.js:433` = `FORCE_TEL‖TEL_NATIF` | oui | **oui** |
| `ALLEGE` | `soleil-planete.js:497` : `TEL_NATIF ‖ POSTE.allege ‖ ?tel/mobile/allege=1`, coupé par `?allege=0` | oui | non (sauf PC lent : `POSTE.r ≤ 2`) |
| `IS_LOW_END` | `soleil-planete.js:535` = `ALLEGE` (alias) | oui | non |
| `PAL.n` | `palier-appareil.js:22-80` | **2 pour tout iPhone ≥ iPhone13,x** (`modele`, l. 64-69 : 12, 13, 14, 15, 16, 17… même valeur) | 2 (ou `POSTE.pal`) |
| `PAL.imgOn(l)` / `PAL.bT(clé,avant,l)` | `palier-appareil.js:99-100` : leviers a…j, **seulement `TEL_NATIF && PAL.n>=2`** | oui (a-f, i ; g, j éteints : `iNeuf` l. 97) | jamais |

Conséquences directes :
- **`LOOK_TEL` n'est PAS un écart téléphone/Vercel** : Vercel joue l'édition `mobile` dans son cadre téléphone, donc `LOOK_TEL` y est vrai aussi. Tout ce qui est gardé par `LOOK_TEL` (bloom .44/.44, entrée du halo `bSc .42`, flou du boost à 6 prises, `BLOOM_K`, étalonnage dans l'ACES `GRADE_ACES`) est identique des deux côtés. Il ne diffère que sur `?pc=1`.
- **La « version Vercel » = `TEL_NATIF` faux + `ALLEGE` faux + leviers `PAL.bT` éteints + budget de pixels PC.** C'est cet ensemble qu'il faut reproduire sur un iPhone 17/18.
- **Tous les iPhone récents sont le même appareil pour le code** : `PAL.n=2` du 12 au 17, aucun champ ne distingue un 13 Pro d'un 15 ou d'un 17 Pro (le modèle `window.__ccAppareil` est lu, l. 64, mais seulement pour ranger en 0/1/2). C'est la cause de « mon pote en iPhone 15 a la même image que moi ».
- `?tel=1` sur le Mac pose `ALLEGE` mais **pas** `TEL_NATIF` : les leviers `PAL.bT` (a-f, i), `LOUPE`, `MOB_GOUV`, `CAD30_REC`, `mobhChaud` n'y jouent pas. Un banc Mac en `?tel=1` ne montre donc PAS l'image de l'iPhone.

Crochets utiles : `dbgImg()` (leviers actifs), `dbgPalier()`, `dbgPoste()`, `dbgChaine()` (`interface/habillages-accueil.js:198` : DPR, cran, plafond, VHD, qualité), `dbgGouv()`, `dbgGouvPaliers()` (`moteur/gouverneur-paliers.js:89`), `dbgMobh()` (`moteur/mobh-regime-chaud.js:19`), `dbgLoupe()`, `dbgGfxFin()` (`rendu/triptyque-bloom.js:264`), `dbgCiel2()`, `dbgTrx()`, `dbgLum()`, `dbgPerf()`, `dbgVHD()`, `dbgQual()`.
Interrupteurs d'URL : `?img=max` (tous les leviers à l'image d'avant), `?img=a,c` (seulement ceux-là), `?imgsans=b`, `?imgplus=g,i,j`, `?appareil=iPhone17,1`, `?palier=0|1|2`, `?allege=0`, `?gouv=max`, `?mob_gouv=0`, `?mobh_chaud=0`, `?cad30=0`, `?mob_g30=0`, `?sans=loupe|netnitro|feuplein|rubanfin|bordsec`, `?sobre=0`, `?poste=max|0..3`.

---

## 1. Les écarts STATIQUES (posés au chargement)

### 1.1 Ombre du soleil (taille + filtre) — levier **b**
- `rendu/triptyque-bloom.js:9-13`
  - `PAL.B.postOmbreDouce=[0,0,1]`, `PAL.B.imgOmbreDouce=[0,0,0]`, `PAL.B.imgOmbre=[1024,1024,768]`.
  - Filtre : `renderer.shadowMap.type = PAL.bT('imgOmbreDouce', PAL.b('postOmbreDouce',1),'b') ? PCFSoft : PCF` → **téléphone PCF simple (17 lectures/pixel éclairé)**, **PC PCFSoft (36 lectures)**.
  - Taille : `OMBRE_N = ALLEGE‖IS_LOW_END ? PAL.bT('imgOmbre',1024,'b') : 1280` → **téléphone 768²**, PC **1280²**.
- Portée identique : ortho `SUNC` ±34 m / +30 −64 / 40-340 m (l. 14-15), même biais.
- Coût : carte 768² = 0,59 M texels contre 1,64 M (×2,8) ; profondeur ~2,4 Mo contre ~6,6 Mo (calcul, 4 o/texel). Le type de filtre entre dans les `#define` des matières : **il se choisit avant toute compilation et ne change plus** (commentaire l. 5-8). Passer en PCFSoft à chaud = recompiler tous les programmes ombrés.
- Réglage : UN endroit pour la valeur de départ (deux clés `PAL.B` + `OMBRE_N`), mais trois autres écrivains à chaud : `qlPose` (`nettete-qualite.js:145`, cran ≥ 2 → 768, ≥ 4 → 512), `imgRegle({ombre})` (gouverneur), `VHD.ombre` 2048 (accueil).
- S'y ajoute l'ombre **une image sur deux en vol loin des dalles dès le cran 1** (`moteur/boucle-1.js:60-63`, `QL.k>=1`) ; or le téléphone part au cran 1 (`PAL.B.imgQlDepart=[5,2,1]`, `palier-appareil.js:251`, levier c, lu `nettete-qualite.js:239`) et le PC au cran 0.

### 1.2 Halo (bloom) — leviers **a** (et **j**, éteint)
- `rendu/triptyque-bloom.js:307-309, 318-319, 334` et `palier-appareil.js:300-303`.
  - Entrée du halo : `BLOOM_BASE = PAL.bT('imgBloomRes',1,'a')` → **téléphone ½**, PC 1. Taille posée par `bloomPass.setSize` : `W·bSc·2·BLOOM_RES` (`bSc = LOOK_TEL ? .42 : …`, identique des deux côtés). Calcul sur une toile 1055×487 : passe claire ≈ 222×102 px (téléphone) contre ≈ 443×205 (même toile, réglage PC) — **4× moins de pixels**, et le PC part en plus d'une toile 2,5 à 6× plus grande (résolution, hors périmètre).
  - Étages : `PAL.B.postBloomMips=[3,4,5]`, `PAL.B.imgBloomMips=[3,4,3]` ; `_nM = PAL.bT('imgBloomMips', ALLEGE ? min(4, …) : 5,'a')` → **téléphone 3 étages** (7 passes + somme), **PC 5** (11 passes + somme). `imgBloomMips2=[5,5,2]` (levier j, À DEMANDER : 2 étages).
  - Force/rayon `UnrealBloomPass(bRes, .44, .44, .92)` : `LOOK_TEL` → identique.
- Coût : peu de pixels (la passe claire fait < 5 % de l'écran), mais **4 changements de cible de plus par image** pour 5 étages (c'est ce qui coûte sur GPU à tuiles, commentaire l. 324-330). Mémoire : quelques centaines de Ko.
- Effet visible : un halo à ½ résolution sur des traits fins (rubans de traînée, feux, néons) donne un halo **plus mou et plus « baveux »** autour des traînées ; 3 étages = halo qui s'étale moins loin (énergie reportée sur le dernier étage).
- Réglage : un endroit statique (`BLOOM_BASE`, `_nM`), mais trois écrivains à chaud : `qlPose` (cran ≥ 3 → ×0,75 ; cran `kMax` → coupé), `imgRegle({halo,mips})`, `MOB_P0={halo:'demi',mips:3,…}` (`gouverneur-paliers.js:37`, à « tenir d'accord avec P2 »).

### 1.3 Ciel : passe lisse une image sur deux — levier **d**
- `rendu/ciel2.js:27-28, 59` : `PAL.B.imgCielImg=[2,1,2]`, `PAL.B.cielImg=[2,1,1]` ; `nI = max(PAL.b('cielImg',1), PAL.bT('imgCielImg',1,'d'), IMG_DYN.ciel)` → **téléphone : passe lisse (cible ½ résolution, ¼ des pixels) recalculée 1 image sur 2** ; PC chaque image. Recalculée de suite si le mode ou la taille change ; l'image sautée relit la passe dans le repère de sa caméra (correctif « le ciel vibre », 11/11).
- Coût : ¼ des pixels de l'écran × le programme lisse, une image sur deux, + un changement de cible. Effet : quasi invisible (fond à basse fréquence), sauf à-coups en rotation rapide de caméra.
- `JADE_CIEL_F = ALLEGE ? .5 : 1` (`ciel2.js:32`) : le ciel de Jade passe par la cible réduite sur téléphone, en direct à pleine résolution sur PC (`?jadeciel=1`). C'est du ciel de map (à laisser à la session maps).
- Réglage : un endroit (clé `imgCielImg`), plus `IMG_DYN.ciel` à chaud (gouverneur : 4 puis 8).

### 1.4 Photos du ciel 4096 → 2048 — levier **i**
- `interface/chute-menu.js:159-163` : `cielReduit(im)` réduit les photos `assets/ciel/ciel-matin|midi|soir.jpg` (4096×1024, vérifié par `sips`) à **2048×512** quand `PAL.imgOn('i')` (allumé par défaut sur téléphone récent, `iNeuf.i=1`).
- Coût : RGBA + mips ≈ 22 Mo par photo pleine contre ≈ 5,6 Mo (calcul ; le commentaire l. 162 dit « ~4 Mo », trois chargées d'avance) → **~50 Mo de mémoire graphique** d'écart pour les trois. Effet : ciel photo deux fois moins défini (se voit au menu et en course sur le grand ciel).
- Réglage : un endroit (le test `PAL.imgOn('i')`). `maps/jade-2.js:197` lit aussi le levier i (hors périmètre).

### 1.5 Densité des traits d'air et des traînées POP au-delà de 200 km/h — levier **e**
- `rendu/stries-vent.js:33-36` : `PAL.B.imgDensVit=[1,1,.5]`, `densVit(kmh)` / `emiVit(k,n,kmh)` → **téléphone ×½ au-delà de 200 km/h** pour les traits d'air `trS`/`trV` (`moteur/boucle-3-physique.js:83, 408`).
- Les **traînées POP** (`rendu/trainees-2.js:166`) en sont **sorties** par `GFX_PLEIN` (`stries-vent.js:27`, finition du 13/11) : pleine densité sur téléphone. Les flammes des pots, le jet du vol et des figures prennent `emiK0()` = l'émission du palier sans la part du gouverneur (`stries-vent.js:28`, `boucle-3-physique.js:104, 356`, `gameplay/figures-physique.js:100`).
- `PAL.B.emiK=[.6,.8,1]` (l. 17) et `PAL.B.ventK=[.5,.7,1]` (`gameplay/boost-depart.js:212`) : **1 au palier 2 → aucun écart statique** ; le gouverneur les écrit à chaud (`mobPalEcrit`, `gouverneur-paliers.js:43`).

### 1.6 Ce que le téléphone a EN PLUS (correctifs de netteté réservés au téléphone)
- **LA LOUPE** `rendu/loupe-caisse.js:1-27` : `ALLEGE && LOOK_TEL && W2_POST && PAL.n>=2 && DPR ≥ 1,9`, en course et à froid. La toile passe à la taille de l'écran (jusqu'à ×3) ; la scène reste à `curDPR` ; une passe finale agrandit l'image elle-même, avec une **reconstruction qui suit les arêtes (12 texels) dans un disque autour de la caisse seulement** (`loupeDisque`, rayon = `LOUPE.r 1,35` × demi-diagonale de la caisse projetée). Hors du disque : bilinéaire, comme le navigateur. Coupée à chaud (`loupeChaud` : `MOB_S.thermo>=2`, `MOB_P.t>=2`, `QL.effondre`, puis 20 s de frais), hors course, et dans la vitrine HD. `?sans=loupe`, `?loupe=2`, `?loupe=tout`.
  → **La tête des traînées est dans le disque, le reste du ruban (jusqu'à 100 m) n'y est pas** : il reste étiré ×2,4 en bilinéaire depuis 1,25. Et dès que le téléphone est « serious » (le cas courant en charge, mémoire « banc de chaleur »), la loupe s'éteint.
- **LA CAISSE NETTE AU NITRO** `rendu/triptyque-bloom.js:249-264` : `NET_NITRO = ALLEGE && W2_POST && FXAA_ON` : pendant le flou du boost, les pixels où le filé couvre < ½ texel repassent par le FXAA et le piqué. PC : flou d'avant partout.
- **Piqué natif** `moteur/init.js:393, 425-431` : `uSharp = max(piqN, …)`, `piqN` monte avec l'agrandissement (`devicePixelRatio / curDPR`) : plus fort sur téléphone parce qu'il est plus agrandi. Même code des deux côtés.

### 1.7 Anisotropie des textures rasantes
- Route (bitume) `rendu/bitume-beton.js:83` : `min(ALLEGE ? 4 : 8, max)`.
- Autoroute `rendu/autoroute.js:202` : idem 4 / 8.
- Plaque de la ligne parfaite `gameplay/ligne-parfaite.js:280` : `ALLEGE ? 2 : 4`.
- Coût : quelques lectures de texture de plus par pixel de route ; effet : le grain du bitume se brouille plus vite au loin sur téléphone. Dispersé (3 lignes).

### 1.8 Route et autoroute (rendu/, pas maps/, mais c'est du décor de piste)
- `rendu/bitume-beton.js:315-322` : `TRAIT_RGB = !ALLEGE ‖ ?bordsboost=1|rgb` : **le jeu de lumière arc-en-ciel des rails et de la nappe au boost est retiré du shader sur téléphone** (décision de Sacha du 12/11 « qu'ils gardent le même éclairage en permanence », plus le bug WebKit 232271). PC : présent. C'est un choix de DA, pas un allègement : à ne rendre qu'avec son accord.
- `rendu/autoroute.js:243` : `FACES = ALLEGE ? [0] : [0,1]` (téléphone : pas la face de dessous de l'autoroute, celle qu'on voit en vol) ; `autoroute.js:310` : `if(!ALLEGE)` → **les bandes rugueuses « autoroute gronde » n'existent pas sur téléphone**. Coût : sommets et un appel de dessin.

### 1.9 Vitrine miniature (boutique) et menus
- `interface/vitrine-miniature.js:26` : `vitLarg() = ALLEGE ? 480 : 640` px de large pour les photos des caisses en boîte (clé de cache `vitrineCle` inclut la largeur). Effet : vignettes de boutique 0,56× les pixels du PC.
- `interface/boutique-scene-1.js:536-537` `BQ_HORS` : met en pause les reflets CSS hors champ — **aucune différence visible** (seulement hors champ).
- `interface/vignette-moteur.js:27, 33-35` : `PAL.B.engVigMs=[100,66,33]`, `PAL.B.engRes=[480,624,864]` → palier 2 = PC : **pas d'écart**. `engLeger` (l. 198-199) : mémoire seulement, même image.
- `moteur/intro-161.js:103-105` : le film d'intro en 1,5 px de toile par point sur `TEL_NATIF` au lieu de 2.
- **Vitrine HD de l'accueil (`VHD`)** : définie dans `nettete-qualite.js:174` (`ombre:2048`, DPR propre, filet en `moteur/boucle-1.js:90-92`) — hors de mon périmètre ; je n'ai pas vérifié ses écarts.
- **Garage** (`interface/garage-*.js`, `voitures/finition.js`) : je n'ai trouvé **aucune** branche `ALLEGE`/`TEL_NATIF`/`PAL` touchant l'image (grep sur `mapSize|setPixelRatio|DPR|QUAL_|PAL.|IS_MOBILE|LOOK_TEL` : vide). Seul `garage-rendu.js:369` (minuteur du voile de départ, `ALLEGE`) : pas d'image.

---

## 2. Ce qui est IDENTIQUE (vérifié, pour ne pas chercher là)

- **Reflets de la caisse** : il n'y a **aucune** `CubeCamera` ni PMREM dans le jeu. `envTex` (`interface/passe-textes.js:425-428`) est un `THREE.CubeTexture` de 6 toiles **peintes** : 64² (`paintEnv`), **128² en course** (`paintEnvCiel`, `voitures/finition.js:241`), 256² au studio/menu (`finition.js:111, 147`). Aucune branche téléphone. Les matières de la caisse sont des `MeshPhongMaterial` + `envMap` en `MixOperation` (`voitures/buildcar.js:102-105`, `matieres-forme.js`). → aucun écart ; aussi aucune « marge PC » à rendre : pour un vrai mieux il faudrait l'inventer (cube 256 en course, sonde dynamique).
- **Voitures** : aucune géométrie ni matière allégée sur téléphone (`voitures/*` : seule `nitro-feu.js:125` `NFEU_PLAGE`, même image).
- **Ruban des traînées de lumière** (`voitures/atchoum-feu.js:91-200`, `sillageStep` / `silRuban`) : même géométrie, mêmes largeurs, même tampon `SIL_ROWS` des deux côtés ; `SIL_FIN` (découpe à la distance, `SIL_FIN_PAS=1,1 m`, `SIL_FIN_MAX=8`) vaut partout. Le flou vu sur téléphone ne vient pas du ruban mais de ce qu'on fait de l'image après (§ 4).
- **Anticrénelage** : `FXAA_ON` partout (`triptyque-bloom.js:34`, MSAA seulement `?msaa=1` et jamais sous `ALLEGE`, l. 300). Pas d'écart (levier h « rien à faire »).
- **Étalonnage, grain, vignette, flou du boost** : gardés par `LOOK_TEL` (identique Vercel) ; `ACES_VIF` (`TEL_NATIF`, l. 27) retire l'ACES par canal multiplié par 0 : même image annoncée au bit près (non vérifié par moi).
- **Lumières dynamiques de la caisse** : `LM_N=6` (`bitume-beton.js:137`), `HL_B` phares (l. 157), `LUMK` (`triptyque-bloom.js:620`) : pas de branche téléphone. MAIS `kt = QUAL_LOW ? 0 : …` (l. 703) : voir § 3.
- **Particules** : réserves (`makePool`, `TRX_N 900`, `TRX_PN 560`) identiques ; `emiK`/`ventK` = 1 au palier 2.
- **Eau** : l'objectif mouillé (`triptyque-bloom.js:268-274`) est identique ; l'eau des maps est dans `maps/` (hors périmètre).
- **Nuages** : rien dans mon périmètre (`maps/nuages-*`).

---

## 3. Les écarts DYNAMIQUES (seulement sur `TEL_NATIF`, à chaud)

Ce sont eux qui font qu'un iPhone 15 frais et un 13 Pro chaud finissent par la **même** image : ils ne regardent que l'état thermique, jamais le modèle.

- **Cadence 30 calée dès le départ** : `MOB_GOUV = CAD30_REC && !?mob_gouv=0` (`moteur/gouverneur-thermique.js:25`), `CAD30_REC = TEL_NATIF && PAL.n===2` (`moteur/cadence.js:38`) ; commentaire `gouverneur-thermique.js:58` : « 30 calées dès le départ » ; avec le capteur, 30 dès « fair » (`MOB_FAIR30`, l. 64). PC : 60+. Effet sur les traînées : un point de sillage par image à 30 i/s (commentaire `atchoum-feu.js:92-94`), mouvement moins lisse ; `SIL_FIN` corrige les facettes, pas la saccade.
- **Gouverneur par paliers** `moteur/gouverneur-paliers.js:34-38` (`MOB_PN`, avec capteur iOS) : fair = halo ½ à 2 étages, **ombre 512** ; serious = **halo coupé**, ciel 1/4, traits ×½, `ql:99` (cran maximal : flou radial coupé `FLOU_OK=k<5`, `nettete-qualite.js:148`) ; serious + branché (`mobBranche`, l. 49-50) = **palier 4 d'emblée, plafond 0,85**. Remontée (`MOB_RA`, halo 5 étages + ombre 1024) **inactive par défaut** (`MOB_R.on` seulement `?mob_raise=1`, l. 39).
- **Régime chaud** `moteur/mobh-regime-chaud.js:9-11` (`MOBH_R`) : à serious, vent ×0,7 une image sur deux, feu du nitro ×0,6 (`nitro-feu.js:196, 208` ; mais `GFX_PLEIN` l'annule pour le feu).
- **`QUAL_LOW` = halo éteint** (`nettete-qualite.js:152`). Dès que le halo est coupé (gouverneur serious, ou cran `kMax`) :
  - les **traînées de lumière n'éclairent plus la route** (`triptyque-bloom.js:703`, six lampes de moins) ;
  - le **feu de pixels du nitro passe à ×0,6** (`voitures/nitro-feu.js:196, 208`) — `GFX_PLEIN` ne retire que le facteur `mobhChaud`, **pas** `QUAL_LOW`. La promesse « les traînées et la voiture, ça doit être PARFAIT » ne tient donc plus à chaud.
- **La loupe s'éteint** à serious / gouverneur ≥ 2 / effondrement (`loupe-caisse.js:38-40`).
- **Le réglage HAUTE ne protège de rien de tout ça** : `qHaute()` n'est lu que par `qlPose` (cran forcé à 0) et `poste-juge.js` ; `PAL.imgOn` (`palier-appareil.js:99`), `gouverneur-paliers.js`, `gouverneur-thermique.js`, `mobh-regime-chaud.js`, `loupe-caisse.js` ne le lisent pas (grep « haute|qHaute » : 0). Sur iPhone, HAUTE = mêmes leviers a-f/i qu'en NETTE, ombre 768 PCF, halo ½ à 3 étages.

---

## 4. Pourquoi la voiture et les traînées paraissent floues (synthèse, non mesurée)

Chaîne d'un trait de traînée sur un 13 Pro en course (paysage) :
1. scène calculée à `curDPR` ≤ 1,25 (levier c, plafond NETTE) → 1055×487 ;
2. FXAA + piqué dans l'ACES ;
3. halo calculé depuis une entrée ½ (levier a), 3 étages ;
4. agrandissement ×2,4 vers 2532×1170 : par la loupe dans le disque de la caisse (arêtes refaites), **en bilinéaire partout ailleurs**, donc sur presque tout le ruban ;
5. à 30 i/s ;
6. à chaud : halo coupé (`QUAL_LOW`) → plus d'éclairage de la route par la traînée, feu ×0,6, loupe éteinte, plafond qui descend jusqu'à 0,85.
Le ruban lui-même (géométrie, couleurs) est celui du PC. Les points 1, 3 et 4 font le flou ; 5 et 6 la mollesse.

---

## 5. Classement : les 10 écarts qui SE VOIENT le plus (voiture, traînées, image générale ; hors décor des maps)

| # | Écart | Téléphone | Vercel PC | Où | Un seul endroit ? |
|---|---|---|---|---|---|
| 1 | Agrandissement bilinéaire hors du disque de la loupe (+ plafond 1,25, résolution couverte ailleurs) | ruban de traînée étiré ×2,4 ; loupe seulement autour de la caisse, éteinte à chaud | toile au budget `PC_PX` | `loupe-caisse.js:24, 29-40` ; `palier-appareil.js:251` | loupe : oui (rayon `LOUPE.r`, `?loupe=tout`) |
| 2 | Halo coupé à chaud → `QUAL_LOW` (pas de lueur, pas de lampes de traînée, feu ×0,6) | dès serious (souvent dès le lancement en charge) | jamais (sauf PC lent) | `gouverneur-paliers.js:34` ; `nettete-qualite.js:149-152` ; `triptyque-bloom.js:703` ; `nitro-feu.js:196, 208` | non : 3 lectures de `QUAL_LOW` |
| 3 | Entrée du halo à ½ (levier a) | ¼ des pixels | pleine | `palier-appareil.js:300-301` | oui (`imgBloomRes`) + `MOB_P0` |
| 4 | Halo à 3 étages au lieu de 5 (levier a) | 3 | 5 | `triptyque-bloom.js:334` | oui (`imgBloomMips`) + `MOB_P0.mips` |
| 5 | Cadence 30 dès le départ | 30 i/s | 60+ | `gouverneur-thermique.js:25, 58` ; `cadence.js:38` | oui (`MOB_GOUV`/`?mob_g30`) |
| 6 | Ombre 768 PCF au lieu de 1280 PCFSoft (levier b), puis 512 à chaud | bord d'ombre crénelé sous la caisse | 1280 douce | `triptyque-bloom.js:9-13` ; `nettete-qualite.js:145` | presque : 2 clés + `OMBRE_N` ; filtre figé à la compilation |
| 7 | Ciel photo 2048 au lieu de 4096 (levier i) | ½ définition | pleine | `chute-menu.js:159` | oui |
| 8 | Ombre une image sur deux en vol dès le cran 1 (départ au cran 1, levier c) | oui | non (cran 0) | `boucle-1.js:60-63` ; `palier-appareil.js:251` | oui (`imgQlDepart`) |
| 9 | Anisotropie 4/8 route et autoroute, 2/4 plaque | route plus floue au loin | 8 | `bitume-beton.js:83` ; `autoroute.js:202` ; `ligne-parfaite.js:280` | non (3 lignes) |
| 10 | Traits d'air ×½ au-delà de 200 km/h (levier e) + jeu RGB des bords au boost absent | moins de vitesse sentie | plein | `stries-vent.js:33-36` ; `bitume-beton.js:319` | e : oui ; RGB : décision de Sacha |

Suivent (moins visibles) : passe lisse du ciel 1/2 (levier d), vitrine boutique 480 px au lieu de 640, faces de dessous et bandes rugueuses de l'autoroute, film d'intro à 1,5.

---

## 6. Pour un système de profils par appareil : où brancher, pièges

**Où brancher**
- **Le seul point de décision par appareil est `PAL` (`palier-appareil.js:22-80`)**, et il ne sait dire que 0/1/2. Le modèle exact est déjà là (`modele`, l. 64, `window.__ccAppareil` posé par le natif, `?appareil=` au banc) : c'est l'endroit pour poser un **profil** (ex. `PAL.prof = 'A15'|'A16'|'A17+'`) ou un palier 3 « comme l'ordinateur ».
- **Presque tout l'écart statique passe par `PAL.bT(clé, avant, levier)`** : les 3es colonnes `img*` (`imgOmbre`, `imgOmbreDouce`, `imgBloomRes`, `imgBloomMips`, `imgCielImg`, `imgDensVit`, `imgDprCap`, `imgQlDepart`, `imgQlP75`) + `imgOn('i')`. Faire dépendre `P.imgOn(l)` (l. 99) du profil (ou de HAUTE) rend d'un coup l'image d'avant. `?img=max` montre déjà ce que serait un iPhone « version Vercel » : c'est le banc à faire tourner sur le 13 Pro et sur un récent.
- **Ce qui ne passe PAS par `PAL.bT`** (à traiter un par un) : `OMBRE_N` (branche `ALLEGE` : 1024 si levier b éteint, jamais 1280), `_nM` (`min(4, …)` sous `ALLEGE` : 4 étages même sans levier, jamais 5), anisotropies (3 lignes), `TRAIT_RGB`, `FACES`/« gronde » de l'autoroute, `vitLarg`, `JADE_CIEL_F`, `INTRO_S_MAX`. Tous gardés par `ALLEGE` ou `TEL_NATIF` en dur. Pour un profil « Vercel » il faut un drapeau distinct, p. ex. `IMG_PC` = « image de l'ordi », lu à ces endroits.
- **Le dynamique** : la table `MOB_PN`/`MOB_PP`/`MOB_P0` (`gouverneur-paliers.js:34-38`) est l'endroit unique de ce qui tombe à chaud ; le départ `MOB_P0` doit rester d'accord avec les leviers statiques (commentaire l. 37). Une table par profil y est simple. Ajouter un retour vers le haut (`MOB_RA`) existe mais est désactivé à cause de gels mesurés (build 13 : 15 gels > 1 s, hypothèse réallocations).

**Pièges**
1. **Ne jamais garder un allègement par `IS_MOBILE` ni par `LOOK_TEL`** : les deux sont vrais sur Vercel (`EDITION='mobile'`). `garde-allege.sh` refuse la publication pour `IS_MOBILE` hors interface. Changer `LOOK_TEL` change les couleurs et le halo validés par Sacha sur PC aussi.
2. `PAL.bT` ne joue que sur `TEL_NATIF` : un essai `?tel=1` sur le Mac n'a **ni** les leviers, **ni** la loupe, **ni** le gouverneur. Pour juger l'image téléphone : l'iPhone (ou le simulateur, qui est `TEL_NATIF`), ou `?img=…` sur l'iPhone.
3. **Le filtre d'ombre se choisit avant toute compilation** (`triptyque-bloom.js:5-11`) : un profil doit être connu AVANT `triptyque-bloom.js`, donc décidé dans `PAL` au chargement ; le changer en course = recompiler toutes les matières (gel).
4. **Les crans à chaud réallouent** des cibles (halo, ombre, toile) : c'est la cause supposée des gels de la remontée (`MOB_R`). `qlPose` garde déjà les cartes d'ombre ≤ 1280 par taille (`nettete-qualite.js:146`) ; garder la même discipline pour un profil haut (ex. une carte 1280 gardée prête).
5. **`QUAL_LOW` relie le halo à d'autres effets** (lampes des traînées, feu du nitro). Couper le halo pour la chaleur dégrade la traînée et le feu même avec `GFX_PLEIN`. À découpler si « traînées parfaites » doit tenir à chaud.
6. **HAUTE n'est lu que par l'échelle QL** : un profil HAUTE réel doit être lu aussi par `PAL.imgOn`, le gouverneur (`mobPalCible`), `mobhChaud` et `loupeChaud`, sinon HAUTE n'apporte rien sur iPhone hors du cran 0.
7. **Le chaud est le cas courant** : branché + serious = palier 4 d'emblée (`gouverneur-paliers.js:44-50`), plafond 0,85, halo coupé. Toute comparaison 13 Pro / 15 / 17 doit se faire **débranché et froid** (sentinelle thermique, mémoire « banc de chaleur »), sinon les deux appareils tombent dans la même table et se ressemblent quoi qu'on fasse.
8. **Les écarts « gratuits » du PC ne coûtent pas que des pixels** : 5 étages de halo = 4 changements de cible de plus (le vrai coût sur GPU Apple à tuiles) ; PCFSoft = ×2 lectures par pixel éclairé ; ciel 4096 = ~50 Mo de mémoire graphique (iOS tue la page au-delà d'un plafond de mémoire de toiles : commentaire `palier-appareil.js:110-113`).
9. **Les reflets n'ont pas d'écart à rendre** : la caisse reflète un cube peint de 128² sur les deux plateformes. Un mieux « au-delà du PC » (256 en course, ou une sonde dynamique) serait un ajout, pas un retour.
10. Maps : 35 occurrences d'`ALLEGE` dans 22 fichiers de `code/maps/`, `mapsSobres()` (`palier-appareil.js:109`, = `ALLEGE` sauf `?sobre=0`) lu 8 fois dans 6 fichiers (`orbite-1` ×2, `grottes-2` ×2, `dunes-1`, `jade-1`, `orbite-roches`, `grottes-embellies`). Hors périmètre, une autre session y travaille : un profil « Vercel » devra se mettre d'accord avec elle sur `mapsSobres` et `JADE_CIEL_F`.

**Non vérifié** : l'effet réel à l'écran de chaque levier (je n'ai rien lancé) ; `VHD` et l'échelle QL en détail (`nettete-qualite.js`, autre carte) ; le coût réel en ms de chaque écart sur un iPhone.
