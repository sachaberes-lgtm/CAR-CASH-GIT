# Carte : LES DRAPEAUX DE PLATEFORME (ALLEGE, TEL_NATIF, LOOK_TEL, IS_MOBILE, FORCE_TEL, IS_LOW_END, POSTE, PAL)

Branche `qualite-appareil` (= origin/main v1596). Lecture seule, rien modifié dans `code/`. Les numéros de ligne sont ceux des morceaux de `code/`.
« vérifié » = lu dans le code ; « non vérifié » = déduit ou estimé, pas mesuré.

---

## 1. Les définitions et leur ordre

Ordre des morceaux (`code/ORDRE.txt`) : `page/tete.html` (5) → `interface/icones-fenetre.js` (70, ouvre la grande fonction) → `rendu/soleil-planete.js` (72 : tous les drapeaux + POSTE + ALLEGE) → `rendu/palier-appareil.js` (73 : PAL, puis le **renderer**) → `rendu/triptyque-bloom.js` (74) → `rendu/loupe-caisse.js` (75) → `rendu/nettete-qualite.js` (77) → … → `sauvegarde.js` (248 : SAVE) → `moteur/cadence.js` (316) → `moteur/gouverneur-thermique.js` (318) → `moteur/mobile-tactile.js` (329).
⚠ `SAVE` n'existe pas encore quand ALLEGE, POSTE, PAL et le renderer sont posés : ceux qui veulent le choix du joueur relisent `localStorage.cashcarSave` brut (POSTE `soleil-planete.js:476`, TOILE1 `palier-appareil.js:265-268`).

| Drapeau | Fichier:ligne | Définition exacte | Vrai sur… |
|---|---|---|---|
| `EDITION` | `page/tete.html:59` | `const EDITION='mobile'` (global, seule ligne qui diffère avec AUTRE VERSION) | — |
| `EN_APP` | `interface/icones-fenetre.js:10` | `!!window.Capacitor \|\| ?app=1` | l'app iOS seulement (pas Safari iPhone) |
| `TACTILE_NATIF` | `soleil-planete.js:417` | `(pointer:coarse) \|\| ontouchstart \|\| maxTouchPoints>0` | tout écran tactile |
| `TEL_NATIF` | `soleil-planete.js:418` | `TACTILE_NATIF && ((hover:none) \|\| min(screen.w,h)<600)` | **vrai téléphone** (app ET Safari iPhone). Jamais l'ordi, même avec `?tel=1` |
| `FORCE_TEL` | `soleil-planete.js:419` | `?tel=1 \|\| ?mobile=1 \|\| (EDITION==='mobile' && !TEL_NATIF && !?pc=1/?desktop=1)` | **l'ordi** qui joue l'édition mobile (donc Vercel `/jouer/` sur PC, dans la colonne) |
| `IS_MOBILE` | `soleil-planete.js:420` | `FORCE_TEL \|\| TEL_NATIF` | téléphone ET ordi Vercel : INTERFACE seulement |
| `LOOK_TEL` | `soleil-planete.js:433` | `FORCE_TEL \|\| TEL_NATIF` (même valeur qu'IS_MOBILE) | téléphone ET ordi Vercel : la « DA » réglée (pas un allègement) |
| `POSTE_BANC` | `soleil-planete.js:434` | `[7,10]` ms | — |
| `POSTE` | `soleil-planete.js:452-494` | IIFE ; `P.pc=!TEL_NATIF` ; sur téléphone **retourne tout de suite** `{auto:false,r:3,pal:2,allege:false,src:'téléphone'}` (l.455) | ordi : régime 0..3 |
| `ALLEGE` | `soleil-planete.js:497` | `!?allege=0 && (TEL_NATIF \|\| POSTE.allege \|\| ?tel=1/?mobile=1/?allege=1)` | vrai téléphone, PC lent (POSTE r≤2), essais `?tel=1` |
| `self.__ccVao` | `soleil-planete.js:503` | `ALLEGE && !?sans=vao` | — |
| `window.__ccAllege` | `soleil-planete.js:504` | `=ALLEGE` (lu hors du grand script par `VERSION PRINCIPALE/assets/audio/pouce-bleu-jeu.js:82`) | — |
| `INTRO_APRES` | `soleil-planete.js:527` | `TEL_NATIF?1:0` (sauf `?introapres=`, `?intro=sous`, balade, simu) | — |
| `IS_LOW_END` | `soleil-planete.js:535` | `=ALLEGE` (alias historique, plus rien d'autre) | — |
| `TERRE_PETITE` | `soleil-planete.js:268` | **recopie à part** du test TEL_NATIF/ALLEGE (car défini avant ALLEGE) | ⚠ ne suit pas ALLEGE si on le change autrement que par l'URL |
| `PAL` | `palier-appareil.js:22-102` | palier 0 ANCIEN / 1 MOYEN / **2 RÉCENT (max)** | voir §2 |
| `MSAA_TOILE` | `palier-appareil.js:157` | `?msaa=1` seulement | — |
| `FXAA_ON` | `triptyque-bloom.js:34` | `!?msaa=1` → vrai partout | — |
| `W2_POST` | (non relu, utilisé par loupe et NET_NITRO) | WebGL2 + post | non vérifié |

### POSTE (ordinateur seulement)
`soleil-planete.js:452-494`. Régimes `r` : 3 MAX, 2 ALLÉGÉ, 1 LÉGER, 0 MINIMUM ; `P.pal=[0,1,2,2][r]`, `P.allege=r<=2` (l.491). Source par priorité : `?poste=0..3` → `?poste=max` (auto=false) → `?tel/?allege=0|1` (auto=false) → save `q==='haute'` (r=3) → rendu logiciel (r=0) → appris (`localStorage.cashcarPoste`, src `mesure`) → puce/cœurs/mémoire/banc. `P.fixe` = Mac (`?postefixe=0|1`) : jamais de réallocation de toile en course. Juge : `moteur/poste-juge.js` ; `dbgPoste()`, `dbgPoste('oubli')`.
**Sur iPhone POSTE est inerte** (auto=false, allege=false) : il n'existe aucun « régime » pour les téléphones.

### Ce que voit chaque plateforme (vérifié par lecture)
| | TEL_NATIF | FORCE_TEL | IS_MOBILE | LOOK_TEL | ALLEGE | POSTE.auto | PAL.n |
|---|---|---|---|---|---|---|---|
| **Vercel `/jouer/` sur PC rapide** (colonne 844×390) | 0 | **1** | 1 | **1** | **0** | 1 (r=3) | 2 |
| PC Vercel lent | 0 | 1 | 1 | 1 | 1 | 1 (r≤2) | 0-2 |
| PC avec `?tel=1` | 0 | 1 | 1 | 1 | 1 | 0 | 2 (`'ordinateur'`) |
| **iPhone (app ou Safari)** | **1** | 0 | 1 | 1 | **1** | 0 | 0-2 |

Conséquence clé : « la version Vercel » = `ALLEGE=0` **avec** `LOOK_TEL=1` (même étalonnage, bloom .44, ACES_N 6). Elle diffère du téléphone par ALLEGE **et** par tout ce qui est gardé par `TEL_NATIF` (leviers `PAL.imgOn`, cadence 30, gouverneurs, vitrine plafonnée, son).

---

## 2. PAL : pourquoi tous les iPhone récents ont la même image

`palier-appareil.js:22-102`. Ordre de décision (l.66-79) : `?palier=0|1|2` → appris en course (`cashcarPalier`, src `mesure`) → **ordi** (`!IS_MOBILE||FORCE_TEL` → `POSTE.pal`) → **modèle natif** `window.__ccAppareil` (« iPhone14,2 », posé par `JeuViewController.webViewConfiguration` avant le script ; `?appareil=iPhone12,8` au banc) → iOS ≤ 15 → taille d'écran → banc CPU.
Modèle (l.64-65) : `g<=10 → 0`, `g<=12 → 1`, **sinon 2**. Donc iPhone 12 (iPhone13,x), 13 Pro (iPhone14,2), 15 (iPhone15,4), 15 Pro (iPhone16,x), 16/17… → **tous palier 2**. Le commentaire l.62 le dit : « jamais d'image plus lourde d'office ». **Il n'existe pas de palier au-dessus de 2** : c'est la cause directe de « mon pote en iPhone 15 a la même image que moi ».

`PAL.b(k,d)` (l.85) = `PAL.B[k][PAL.n]` (⚠ `v?v[P.n]:d` : si `PAL.n` valait 3, `v[3]` est `undefined`, **pas** `d`).
`PAL.imgOn(l)` (l.99) = `TEL_NATIF && PAL.n>=2 && !PAL.imgMax && filtres d'URL` ; `PAL.bT(k,avant,l)` (l.100) = colonne 2 si le levier est actif, sinon `avant`.
Leviers « image adaptée téléphone récent » (tous actifs sur tout iPhone palier 2, éteints sur l'ordi même en `?tel=1`) :

| Levier | Clé | Valeur tél. | Ordi | Où |
|---|---|---|---|---|
| a halo demi-rés. | `imgBloomRes=[1,1,.5]` | 0,5 | 1 | `palier-appareil.js:300-301` |
| a/j étages du halo | `imgBloomMips=[3,4,3]`, `imgBloomMips2=[5,5,2]` (j éteint par défaut) | 3 | 5 | `triptyque-bloom.js:334` |
| b ombre | `imgOmbre=[1024,1024,768]`, `imgOmbreDouce=[0,0,0]` | 768, PCF simple | 1280, PCFSoft | `triptyque-bloom.js:10-13` |
| c résolution | `imgDprCap=[1.25,1.35,1.25]`, `imgQlDepart=[5,2,1]` | DPR 1,25, départ cran 1 | budget de pixels réels | `palier-appareil.js:251-253` |
| d ciel lisse 1 image/2 | `imgCielImg=[2,1,2]` | 2 | 1 | `ciel2.js:27` |
| e traits/traînées ½ > 200 km/h | `imgDensVit=[1,1,.5]` | 0,5 | 1 | `stries-vent.js:33-36` |
| f échelle QL plus nerveuse | `imgQlP75=[24,24,19]` | 19 ms | 24 | `nettete-qualite.js:106`, `boucle-1.js` |
| g mediump | `imgPrec` | éteint par défaut (`?imgplus=g`) | highp | `palier-appareil.js:159,174` |
| i textures ≤ 2048, aniso 4 | `PAL.imgOn('i')` | **allumé** par défaut | — | `chute-menu.js:159`, `maps/jade-2.js` |

Interrupteurs : `?img=max` (tout à l'ancien), `?img=a,c` (seulement), `?imgsans=b`, `?imgplus=g,i,j`, `?img=13` (préréglage « doux » = seul a). Crochets : `dbgImg()`, `dbgPalier()`, `dbgPalier(n)`.

---

## 3. Le réglage IMAGE et la résolution (3 choix aujourd'hui)

- Sauvegarde : `SAVE.d.q ∈ {'fast','net','haute'}`, `SAVE.d.qChoisi` (`sauvegarde.js:11,67,71`). Défaut : `'net'` si `PAL.b('qNetDefaut')` (palier 2 = 1) ou `!ALLEGE` ou `POSTE.auto`, sinon `'fast'`.
- Cycle : `qSuivant` fast→net→haute→fast (`nettete-qualite.js:133`) ; libellés `qLbl` RAPIDE/NETTE/HAUTE (l.134) ; I18N `HAUTE`→`HIGH` (`mobile-tactile.js:330`).
- Boutons : `mobile-tactile.js:398` (pause), `:969` (menu), `desktop-banc.js:40` (`applyQ9`).
- `applyQ(fast)` (`mobile-tactile.js:331`) → `DPR_CAP=dprPlafond(fast)` puis `qlReprise()`.
- `dprPlafond(fast)` (`palier-appareil.js:252-258`) : RAPIDE → `min(dpr,1)` ; **téléphone** (`ALLEGE&&!POSTE.auto`) → `min(dpr, PAL.bT('imgDprCap', PAL.b('dprNetCap',1.5),'c'))` = **1,25** sur tout iPhone récent ; **ordi** → budget `PC_PX` (3,2 Mpx ; 2,0 si `PC_4K`) : `min(dpr, max(PC_MIN, √(px/(innerW·innerH))), 4)`.
- **HAUTE sur téléphone = même plafond que NETTE** (dprPlafond ne connaît que `fast`) ; la seule différence est `qHaute()` → l'échelle QL ne baisse jamais (`qlPose` l.144) et `qlAuto` faux (l.132). Donc aujourd'hui HAUTE ne donne **aucun pixel de plus** à un iPhone 15/17 qu'à un 13 Pro.
- `dprNetCap=[1.25,1.35,1.5]` est déclaré **deux fois** (`palier-appareil.js:263` et `nettete-qualite.js:93`) : les deux doivent rester identiques.
- Planchers QL téléphone : `dprNet=[1,1.15,1.25]`, `dprNetBas=[.85,.9,1]` (`nettete-qualite.js:93`) ; `qlBornes()` l.135-139 (branche ordi `pcMax=POSTE.auto&&PC_PX>0` : planchers à 72 %/50 % du plafond).
- Crochets : `dbgNette()`, `dbgVhdEcran()`, `imgRegle({...})` / `window.imgRegle('reset')`.

---

## 4. Recensement des utilisations (hors `code/maps`)

Totaux (grep -w, commentaires compris) : `ALLEGE` 127 (dont 41 dans maps), `TEL_NATIF` 151 (25 dans maps), `LOOK_TEL` 12 (0 dans maps), `IS_LOW_END` 9 (2 dans maps), `IS_MOBILE` 20, `FORCE_TEL` 11, `POSTE` 75.
Colonne « perd » = ce que le téléphone a de moins que l'ordi. « même image » = optimisation sans perte visible annoncée par le code (non re-mesuré ici).

### 4.1 Résolution
| Site | Garde | Perd / effet |
|---|---|---|
| `palier-appareil.js:214` `DPR_CAP` initial | ALLEGE | 1 au lieu de 1,5 (provisoire, repris par TOILE1) |
| `palier-appareil.js:253` `dprPlafond` | ALLEGE && !POSTE.auto | **1,25** (levier c) au lieu des pixels réels (jusqu'à 3,2 Mpx) — la perte n°1 |
| `palier-appareil.js:267` / `sauvegarde.js:11,71` défaut `q` | !ALLEGE → net | aucun écart au palier 2 (qNetDefaut=1) |
| `palier-appareil.js:314` resize DPR | ALLEGE \|\| TEL_NATIF | le téléphone ne recalcule pas sur changement de densité (sûr) |
| `soleil-planete.js:532` (simu) | ALLEGE | 1 au lieu de 1,5, `?simu=1` seulement |
| `nettete-qualite.js:187-214` vitrine VHD (`vhdDpr`, `VHE_MODE`, `vhdDprTel` 2, `vhdPx` 3,2 M) | **TEL_NATIF** | vitrine du menu ≤ densité 2, ombre 1024 (ordi : jusqu'à 4, ombre 2048/4096) |
| `nettete-qualite.js:132` `qlAuto` | TEL_NATIF \|\| POSTE.auto | l'échelle QL baisse en course |
| `rendu/loupe-caisse.js:24` LA LOUPE | **exige** ALLEGE && LOOK_TEL && W2_POST && PAL.n≥2 && dpr≥1,9 | **gain** pour le téléphone : toile à la taille de l'écran (×3), reconstruction des arêtes dans le disque de la caisse. `?sans=loupe`, `?loupe=2|tout`, `dbgLoupe()` |
| `moteur/intro-161.js:105` `INTRO_S_MAX` | TEL_NATIF | film d'intro à 1,5 px/pt au lieu de 2 |
| `missions/ecran-revelation.js:550-552` `rvxAl` | ALLEGE | toile de la révélation ≤ 1,5 px/pt, moins de particules |
| `palier-appareil.js:270` `DPR_MIN` | IS_MOBILE&&!FORCE_TEL | plancher 0,5 au lieu de 0,6 |

### 4.2 Halo (bloom)
| Site | Garde | Perd |
|---|---|---|
| `triptyque-bloom.js:307` `bSc` | LOOK_TEL / IS_LOW_END | .42 (LOOK_TEL, donc **aussi sur Vercel PC**) |
| `triptyque-bloom.js:309` force/rayon | LOOK_TEL | .44/.44 (DA réglée, identique Vercel) |
| `triptyque-bloom.js:334` `_nM` | ALLEGE (+levier a/j) | 4 étages (3 avec levier a) au lieu de 5 |
| `palier-appareil.js:300` `BLOOM_BASE` | levier a (TEL_NATIF) | entrée en demi-résolution |
| `etalonnage-da.js:242` `BLOOM_K` | LOOK_TEL | rapport .44/.54 (DA, identique Vercel) |
| `portails.js:294` `QUAL_MED` | ALLEGE\|\|IS_LOW_END | état initial lu par dbgPerf (réécrit par qlPose) |

### 4.3 Ombres
| `triptyque-bloom.js:13` `OMBRE_N` | ALLEGE\|\|IS_LOW_END | 1024 → 768 (levier b) au lieu de 1280 ; PCF simple au lieu de PCFSoft (l.11) |
| `nettete-qualite.js:145` `qlPose` | crans QL | 768 puis 512 en course chargée |
| `gouverneur-paliers.js:22-38` `MOB_PP`/`MOB_PN`/`MOB_P0` | TEL_NATIF (MOB_GOUV) | ombre 768/512 selon la chaleur |

### 4.4 Anticrénelage
| `palier-appareil.js:174` `antialias` | `!ALLEGE&&!IS_LOW_END&&MSAA_TOILE` | rien : faux partout sans `?msaa=1` |
| `triptyque-bloom.js:300` cible MSAA | `!FXAA_ON&&!ALLEGE&&…` | rien : FXAA_ON vrai partout |
| `triptyque-bloom.js:257` `NET_NITRO` | **exige** ALLEGE && W2_POST && FXAA_ON | **gain** téléphone : la caisse reste anticrénelée sous le flou nitro/boost (`?sans=netnitro`) |
| `triptyque-bloom.js:35,125,129,157` `ACES_N` et flou radial | LOOK_TEL | 6 prises au lieu de 8, une lecture du halo au lieu de deux (identique Vercel) |

### 4.5 Textures
| `autoroute.js:202`, `bitume-beton.js:83`, `nettete-qualite.js:211` (`vhdAniso`) | ALLEGE | anisotropie 4 au lieu de 8 |
| `gameplay/ligne-parfaite.js:280` | ALLEGE | aniso 2 au lieu de 4 |
| `economie/livrees.js:64` `livToiles(id, .5)` | ALLEGE | livrées (peintures) à **½ résolution** — touche la voiture |
| `interface/vitrine-miniature.js:26` `vitLarg` | ALLEGE | photo de vitrine 480 au lieu de 640 |
| `interface/chute-menu.js:159` `cielReduit` | levier i / TEL_NATIF&&PAL.n<2 | ciel photo ≤ 2048 |
| `palier-appareil.js:132-133` `memToiles` | `PAL.b('memToiles')\|\|ALLEGE` | toiles 2D vidées après envoi (même image, mémoire) ; `dbgToiles()` |
| `soleil-planete.js:268` `TERRE_PETITE` | test recopié | Terre 512×256 au lieu de 1024×512 |
| `rendu/ciel2.js:32` `JADE_CIEL_F` | ALLEGE | ciel de Jade à ½ résolution (`?jadeciel=`) |

### 4.6 Densité de particules / traînées
| `stries-vent.js:33-36` `densVit`/`emiVit` | levier e (TEL_NATIF) | ½ des traits d'air et de l'émission des traînées au-delà de 200 km/h |
| `stries-vent.js:26-29` `emiK`, `GFX_PLEIN` | `PAL.b('emiK')` | émission du palier (le gouverneur l'écrit à chaud) |
| `gouverneur-paliers.js:22,62,89` `stries:.5,k:.5` | TEL_NATIF chaud | ½ densité, `ventK`/`emiK` réduits |
| `economie/boutique.js:666` | ALLEGE | 120 particules au lieu de 230 |
| `voitures/nitro-feu.js:125` `NFEU_PLAGE` | ALLEGE | n'envoie que les cubes vivants (même image) |
| `interface/flammes-cubes.js:115` | TEL_NATIF && PAL.b('feuDt') | flamme du garage à pas fixe |
| `interface/bouton-nitro-gains.js:117,318` | TEL_NATIF | flamme du HUD calme coupée ; `MORT_FL` |
| ⚠ Les fichiers `rendu/trainees-1.js`, `rendu/trainees-2.js` ne lisent **aucun** de ces drapeaux (vérifié par grep) : leur flou ne vient pas d'un `if(ALLEGE)` local mais de la résolution (DPR 1,25 étiré ×2,4), du halo demi-rés. et du levier e. |

### 4.7 Voiture
| `loupe-caisse.js` (gain), `NET_NITRO` (gain), `livrees.js:64` (½ rés.), `vignette-moteur.js:199` `engLeger` (ALLEGE : copie JS des moteurs jetée, même image), `vitrine-miniature.js:26` |

### 4.8 Reflets / matières
| `bitume-beton.js:319` `TRAIT_RGB` | !ALLEGE | branche arc-en-ciel des rails non compilée (code mort sur tél., même image ; `?bordsboost=1`) |
| `autoroute.js:243` `FACES` | ALLEGE | une seule face au lieu de deux |
| `autoroute.js:310` « autoroute gronde » | !ALLEGE | maillage supplémentaire absent du téléphone |
| `triptyque-bloom.js:27` `ACES_VIF` | TEL_NATIF | variante d'étalonnage « lumière » propre au téléphone (`?lumiere=0`) |
| `triptyque-bloom.js:33` `GRADE_ACES` | LOOK_TEL | étalonnage dans l'ACES (identique Vercel) |
| `boutique-scene-1.js:537` `BQ_HORS` | ALLEGE | reflets CSS hors champ en pause (même image) |

### 4.9 Ciel
| `ciel2.js:27` levier d (ciel lisse 1 image sur 2), `ciel2.js:32` Jade ½, `chute-menu.js:159`, `TERRE_PETITE`, `interface/atelier-ferme.js:632` (`cielPrise`, TEL_NATIF) |

### 4.10 Interface (aucun rendu)
`IS_MOBILE` : `mobile-tactile.js:6` (tout le bloc tactile), `desktop-banc.js:13` (menu souris si `!IS_MOBILE`), `init.js:344,464,468`, `intro-161.js:759`, `boost-depart.js:168`, `garage-menu-inventaire.js:309`, `habillages-accueil.js:199` (dbg). `TEL_NATIF` : `garage-menu-inventaire.js:304` (VOL INVERSÉ replié), `burn-out-2.js:119` (classe `clavier` si !TEL_NATIF), `init.js:399,406` (rotation douce `ROT_DOUX`, `ROTA`), `intro-161.js:934`, `cadence.js:99-141` (`hudCalmeTick`, `hudDortTick`, `gvFixe`), `desktop-banc.js:128` (`RADP`).
→ **Le tactile tient à IS_MOBILE / TEL_NATIF, jamais à ALLEGE** (vérifié : aucune utilisation d'ALLEGE ne branche souris, clavier ou cadre).

### 4.11 Mémoire
`memToiles` (`palier-appareil.js:132`), `engLeger` (`vignette-moteur.js:199`, ~40 Mo JS selon le commentaire), `livrees.js:64`, `CTX3D_POCHOIR` (`palier-appareil.js:171` : pas de tampon pochoir sous ALLEGE), `self.__ccVao` (moins d'appels WebGL, même image), `PHOTO_VUE`/`PHOTO_APRES` (`vignette-moteur.js:526-527`), `DENSE` (`vignette-moteur.js:423`, TEL_NATIF\|\|ALLEGE), tranches du chargement (`vignette-moteur.js:497`).

### 4.12 Cadence / thermique (tout sur TEL_NATIF, sauf mention)
`cadence.js:38` `CAD30_REC=TEL_NATIF&&PAL.n===2` ; `gouverneur-thermique.js:25` `MOB_GOUV=CAD30_REC` ; `:69` `mobChaud()` avec `MOB_FROID30` (l.68) = **course calée sur 30 i/s dès le départ, même froid** (`?mob_froid30=0`, `?mob_gouv=0`, `?cad30=0`) ; `gouverneur-paliers.js:17` `MOB_PALS` (`?gouv=max`) ; `mobh-regime-chaud.js:12` ; `cadence.js:73` `CAD_CRIT20`, `:207` `ACC30`, `:214` `hcRepos` (menus à 15 i/s), `:236` `menuCull`, `:167` `HC_FROID` ; ALLEGE : `cadence.js:193` `BANDE30`, `:225` `transBloque`, `garage-rendu.js:369` (voile de départ), `piste-prebati.js:48,100,101` (`bornesOn`, `RAIL_CHAUD`, `PISTE_MOY`), `depart-avance.js:184` `LV9`, `nettete-qualite.js:68` **`QL_BARRIERE`** (sonde de l'échelle QL par fenceSync au lieu de readPixels). `nettete-qualite.js:204` `PFR_ON` (mode frais hors course, TEL_NATIF).

### 4.13 Son (TEL_NATIF, haut-parleur)
`son/graphe-audio.js:68,231,238,500,503,509`, `son/regie.js:41-49`, `son/fanfare-turbo.js:47-178`, `son/moteur-vivant.js:36`, `son/musique.js:316` (`SES_AMB`), `son/triade-edit.js:28`, `son/curseurs.js:87`, `boucle-5-sons.js:84,181,190`, `stries-vent.js:291-292`. **Et `window.__ccAllege` → musique de course pré-rendue** (`pouce-bleu-jeu.js:82` `figeOn`).

### 4.14 Autre / journal
`enregistreur-jeu.js:38` (`tel:ALLEGE`), `intro-161.js:67`, `mort.js:270`, `piste-prebati.js:448`, `vignette-moteur.js:402`, `gameplay/premiere-fois.js:92` (`MORT_ENG_MS` 66 ms), `poste-juge.js:48`, `habillages-accueil.js:199`.

### 4.15 Dans `code/maps` (nombre seulement — domaine de l'autre session)
ALLEGE (41) : jade-balade 4, nuages-modules 3, nuages-vitrail 3, ville-nuit 2, orbite-1 2, orbite-roches 2, nuages-coton 2, continuite 2, orbite-geants 2, et 1 dans niveaux, canyon-mine, glacier-route, jade-alleluia, dunes-1, glacier-verglas, pluie-argent, jade-1, canyon-route, jade-3, glacier-construction, grottes-2, orbite-embellie.
TEL_NATIF (25) : jade-3 5, jade-2 3, nuages-modules 3, grotte-travailleur 2, jade-vol 2, dunes-1 2, jade-1 2, et 1 dans niveaux, orbite-1, canyon-relief, glacier-construction, grottes-2.
IS_LOW_END : nuages-coton (1 ligne). LOOK_TEL : 0. `mapsSobres()` (`palier-appareil.js:109` = `ALLEGE && !?sobre=0`) : orbite-1 2, grottes-2 2, dunes-1, jade-1, grottes-embellies, orbite-roches.

---

## 5. Question clé : ALLEGE=false sur un iPhone très puissant, interface tactile gardée

Ce qui **reste** tactile : IS_MOBILE (=TEL_NATIF) reste vrai → bloc tactile, NITRO, volant ; LOOK_TEL reste vrai → la DA est identique à Vercel. Aucun code d'interface ne lit ALLEGE (vérifié). Donc pas de bascule souris/clavier.
Ce qui **reste téléphone malgré tout** (gardé par TEL_NATIF, pas par ALLEGE) : leviers PAL a-i (DPR, halo, ombre 768, ciel, traînées ½…) sauf `?img=max`, cadence 30 et gouverneurs, vitrine VHD plafonnée, mode frais, son. ⚠ Donc `ALLEGE=false` **seul ne donne pas « la version Vercel »** ; il faut aussi `PAL.imgMax` (ou équivalent) pour éteindre les leviers.

Ce qui **casserait ou deviendrait dangereux** :
1. **Résolution explosive** — `dprPlafond` (l.253) quitte la branche téléphone (`ALLEGE&&!POSTE.auto` faux) pour la branche ordi : `ECRAN` = la fenêtre elle-même (`window.parent===window` dans l'app), `RETINA_OK` vrai (densité 3, < 2,6 M pts) → `PC_MIN=1.5`, `PC_4K` faux → `PC_PX=3.2e6`. 13 Pro (390×844) : √(3,2e6/329 160)=3,12 → **DPR 3 = 2,96 Mpx** ; 17 Pro Max (440×956) : DPR 2,76 → 3,2 Mpx. Aujourd'hui 1,25 → 0,51-0,66 Mpx : **×5 à ×6 de pixels** (calcul, non mesuré). Toile + cible demi-flottante du compositeur + halo + profondeur : ordre de 80-100 Mo de mémoire graphique au lieu de ~15 (estimation non vérifiée). Sans levier c, `PAL.bT` aurait au moins rendu 1,5 ; c'est le chemin « ordi » qui retire tout plafond.
2. **Échelle QL incohérente** — `qlBornes` (l.137) : `pcMax=POSTE.auto&&…` est faux sur téléphone → planchers téléphone (1,25 / 1) sous un plafond de 3 : pas énormes, chaque cran réalloue toile et cibles (`applyDPR`) ; sur iOS aucune protection type `POSTE.fixe`.
3. **Gouverneur** — `mobPalCapJoueur` (`gouverneur-paliers.js:53`) relit `dprPlafond` → 3 ; `mobPalCapPlein` (l.54) suppose 1,5 : les deux « remontées » ne visent plus la même valeur.
4. **Sonde QL bloquante** — `QL_BARRIERE` (`nettete-qualite.js:68`) tombe : iPhone n'a pas `EXT_disjoint_timer_query_webgl2` → retour à `readPixels` qui force le processeur à attendre la puce (510 ms gelés pour 15 lectures mesurés sur Mac selon le commentaire). Danger de saccades.
5. **Mémoire iOS** — `memToiles` palier 2 = 0 → les toiles 2D ne sont plus vidées (iOS plafonne la mémoire de toiles : toiles blanches puis page tuée, commentaire l.110-111) ; `engLeger` off (~40 Mo JS) ; livrées pleine rés. ; `CTX3D_POCHOIR` vrai (tampon pochoir en plus) ; risque de **contexte 3D perdu** → `ctxRecharge` (rechargement, « a calé » à la 4e perte).
6. **Appels WebGL** — `__ccVao` faux : retour des 400 `vertexAttribPointer`/image mesurés (chaque appel traverse le processus GPU de WebKit).
7. **Saccades CPU** — `bornesOn`, `RAIL_CHAUD`, `PISTE_MOY` (pré-bâti), `LV9`, `NFEU_PLAGE`, `BANDE30`, `transBloque`, `PHOTO_VUE/APRES`, voile de départ (`garage-rendu.js:369`) : tous perdus alors qu'ils ne retirent aucune image.
8. **Chaleur audio** — `__ccAllege` faux → la musique de course repasse en synthèse directe (`figeOn`), alors qu'elle avait été figée pour la chaleur.
9. **Pertes de qualité à l'envers** — la LOUPE (`loupe-caisse.js:24`) et `NET_NITRO` (`triptyque-bloom.js:257`) **exigent** ALLEGE : la caisse perd sa netteté sous nitro (à DPR 3 la loupe devient inutile, mais NET_NITRO non vérifié à ce DPR).
10. **Maps** — `mapsSobres()` faux et ~41 sites ALLEGE dans maps → maps pleines (plus de triangles/mémoire) : décision qui appartient à l'autre session.
11. **Hypothèses ordi** — `ECRAN` lit `window.parent` (iframe du cadre) : dans l'app `parent===window`, donc correct. `PC_4K`/`RETINA_OK`/`VHD_PX_PC` sont des notions d'ordi qui s'appliqueraient à un téléphone. `POSTE.fixe` (Mac) ne s'applique pas. `enregistreur-jeu.js:38` enregistrerait `tel:false` (statistiques faussées).
12. **Recopies du test** — `TERRE_PETITE` (`soleil-planete.js:268`) et le bouton MOBILE du cadre (`tete.html:179`) recopient le test au lieu de lire ALLEGE : ils ne suivraient pas.
13. **Bancs** — `?tel=1` sur Mac n'allume pas les leviers PAL (TEL_NATIF faux, `palier-appareil.js:93`) : un banc ordi ne reproduit pas l'image d'un iPhone ; utiliser `?appareil=iPhoneXX,Y` ne suffit pas non plus hors iPhone (PAL : `!IS_MOBILE||FORCE_TEL` passe avant le modèle).

---

## 6. Pour un système de profils par appareil : où brancher, pièges

**Où brancher**
- Le modèle exact est déjà là : `window.__ccAppareil` (posé par le natif avant le script), lu par `PAL` (`palier-appareil.js:64`) ; `?appareil=` pour le banc. Il est disponible **dès `soleil-planete.js`** (avant ALLEGE) : un `PROFIL` peut être calculé juste avant `ALLEGE` (l.497) à partir du modèle et du choix HAUTE/BASSE lu dans `localStorage.cashcarSave` brut (comme POSTE l.476).
- **Ne pas basculer ALLEGE** pour « monter » un iPhone : ALLEGE mélange des allègements visibles et ~20 optimisations sans perte (VAO, sonde, mémoire, pré-bâti, musique). Mieux : garder ALLEGE = « tourne sur téléphone », et faire dépendre du profil les **seules** grandeurs visibles :
  - résolution : `dprPlafond` branche téléphone (`palier-appareil.js:253`) + `PAL.B.dprNetCap` (2 déclarations : `palier-appareil.js:263`, `nettete-qualite.js:93`) + `imgDprCap` + planchers `dprNet`/`dprNetBas` ; ou un budget de pixels propre au téléphone (pas `PC_PX`) ;
  - leviers PAL a-j : `PAL.imgOn` (l.99) → un profil fort = `imgMax` vrai ou une liste de leviers par profil ;
  - ombre `OMBRE_N` (`triptyque-bloom.js:13`), étages du halo `_nM` (l.334), aniso (`autoroute.js:202`, `bitume-beton.js:83`, `vhdAniso`), livrées `.5` (`livrees.js:64`), vitrine `vitLarg`, VHD `vhdDprTel`/`vhdOmbreTel`, `TERRE_PETITE`, boutique 120/230.
- Le choix joueur : `qSuivant`/`qLbl` (`nettete-qualite.js:133-134`), `sauvegarde.js:67,71` (normalisation de `q`), `TOILE1_Q` (`palier-appareil.js:265-268`), POSTE (`soleil-planete.js:476`), les trois boutons (`mobile-tactile.js:398,969`, `desktop-banc.js:40`), `mobPalCapJoueur`. Passer à HAUTE/BASSE impose une **migration** de `'net'` (existant chez tous les joueurs palier 2) et de `'fast'`.
- Le gouverneur thermique (`gouverneur-thermique.js`, `gouverneur-paliers.js`) et `CAD30_REC` sont la vraie garde de fluidité : un profil HAUTE peut assouplir `MOB_FROID30` sur les puces fortes, mais c'est la décision « 30 dès le départ » de Sacha (13/11).

**Pièges**
- `PAL.n` max = 2 ; `PAL.b` rend `v[PAL.n]` sans repli si l'index manque : **ajouter un palier 3 casse silencieusement** toutes les tables `PAL.B` (`undefined`). Tests durs à surveiller : `PAL.n===2` (`cadence.js:38`), `PAL.n>=2` (`imgOn`, loupe `pal<2`), `mobPalEcrit` écrit `A[PAL.n]`. Préférer un axe à part (profil) à un 4e palier.
- `PAL.bT` rend **la colonne 2** (`v[2]`) quel que soit le palier.
- RÈGLE D'OR du code : « palier 2 = l'image d'avant » ; aujourd'hui fausse sur téléphone (leviers a-i) : la documenter quand on la change.
- Le renderer est créé dans `palier-appareil.js:174` (contexte : `antialias`, `stencil`, `precision`) : tout ce qui touche ces attributs doit être décidé **avant** cette ligne ; la taille de toile aussi (TOILE1, une seule allocation).
- `garde-allege.sh` refuse IS_MOBILE hors interface ; un nouveau drapeau de profil ne doit pas reposer sur IS_MOBILE (vrai sur Vercel PC).
- LOOK_TEL est vrai aussi sur Vercel PC : ne pas le toucher pour « améliorer » (couleurs validées).
- Les traînées (`trainees-1/2.js`) n'ont pas de drapeau : leur netteté passera par la résolution, le halo et le levier e, pas par un `if`.
- Le Mac de banc ne reproduit pas les leviers téléphone (`TEL_NATIF` faux) ; il faut le vrai iPhone ou un `TEL_NATIF` simulé (aucun paramètre ne le force, vérifié : TEL_NATIF ne lit pas l'URL).
- Non vérifié ici : `W2_POST`, la valeur exacte de `SANS_DAUPHIN` (cité au commentaire de `TERRE_PETITE`, non trouvé par grep sous ce nom), la mémoire réelle à DPR 3 sur iPhone, le plafond de mémoire de toiles d'iOS.
