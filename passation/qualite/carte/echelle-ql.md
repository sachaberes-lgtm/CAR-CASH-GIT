# Carte : l'échelle de qualité dynamique (QL) et le palier de l'appareil (PAL)

Lecture seule de `code/` (branche qualite-appareil = origin/main v1596), le 14/11. Rien n'a été lancé : tous les chiffres ci-dessous sont **calculés à la lecture du code**, pas mesurés sur un téléphone. Les numéros de ligne renvoient aux morceaux de `code/`.

Ordre de chargement utile (`code/ORDRE.txt`) : 72 `rendu/soleil-planete.js` (TEL_NATIF, POSTE, ALLEGE, LOOK_TEL) → 73 `rendu/palier-appareil.js` (PAL, renderer, DPR_CAP, dprPlafond, BLOOM_BASE) → 74 `rendu/triptyque-bloom.js` (ombre, halo) → 77 `rendu/nettete-qualite.js` (QL, VHD, imgRegle) → 96 `moteur/piste-prebati.js` → 201 `rendu/ciel2.js` → 248 `sauvegarde.js` → 260 `rendu/stries-vent.js` → 283 `interface/chute-menu.js` → 316 `moteur/cadence.js` → 318 `moteur/gouverneur-thermique.js` → 319 `moteur/gouverneur-paliers.js` → 321 `moteur/boucle-1.js` (la régulation QL) → 327 `moteur/init.js` (applyDPR) → 329 `moteur/mobile-tactile.js` (réglage IMAGE).

---

## 1. Les drapeaux qui décident de tout

| Nom | Où | Valeur |
|---|---|---|
| `TEL_NATIF` | soleil-planete.js:418 | écran tactile ET (`hover:none` ou petit côté d'écran < 600). Vrai sur tout iPhone, dans l'app comme dans Safari. |
| `FORCE_TEL` / `IS_MOBILE` | :419-420 | l'ordi en cadre téléphone ; `IS_MOBILE` = interface seulement, jamais pour le rendu (`garde-allege.sh`). |
| `LOOK_TEL` | :433 | `FORCE_TEL‖TEL_NATIF` : réglage d'image (DA, halo `bSc` .42). Ce n'est pas un allègement. |
| `POSTE` | :452-494 | régime de l'ordi (3 MAX … 0 MINIMUM). Sur téléphone : `POSTE.auto=false`, `src='téléphone'`. |
| `ALLEGE` | :497 | `TEL_NATIF ‖ POSTE.allege ‖ ?tel=1/?mobile=1/?allege=1` ; `?allege=0` coupe. |
| `IS_LOW_END` | :535 | `=ALLEGE`. |
| `PAL.n` | palier-appareil.js:22-80 | 0 ANCIEN, 1 MOYEN, 2 RÉCENT. |
| `CAD30_REC` | cadence.js:38 | `TEL_NATIF && PAL.n===2 && !?cad30=0`. |
| `MOB_GOUV` | gouverneur-thermique.js:25 | `CAD30_REC && !?mob_gouv=0` : le gouverneur ne tourne qu'au palier 2. |
| `MOB_PALS` | gouverneur-paliers.js:17 | `MOB_GOUV && !?gouv=max`. |

### Comment PAL.n est choisi (palier-appareil.js:66-79, du plus fort au plus faible)
1. `?palier=0|1|2` ;
2. `localStorage.cashcarPalier` avec `src:'mesure'` (« appris en course »). ⚠ Les fonctions `palNote` et `palApprend` citées dans le commentaire (l.14-15) **n'existent plus nulle part dans `code/`** (grep) : seule une ancienne clé restée dans le stockage peut encore jouer, mais elle passe AVANT le modèle de l'iPhone ;
3. l'ordi (`!IS_MOBILE‖FORCE_TEL`) : `POSTE.pal` (2 au MAX et à l'ALLÉGÉ) ;
4. **le modèle** `window.__ccAppareil` (écrit par le natif avant le script ; `?appareil=iPhone14,2` au banc) : `iPhoneG,x` avec G ≤ 10 → 0, G ≤ 12 → 1, sinon → 2 (l.64-65) ;
5. iOS ≤ 15 → 0 ; 6. taille d'écran (`ecran`, l.51-58, `?palecran=0`) ; 7. petit banc processeur, retenu 7 jours (`src:'banc'`).

`palPuce` (l.134-138) ne rabat que sur Android. **Conséquence : tout iPhone 12 et après (iPhone13,x et plus) = palier 2, sans rien de plus fin.** Un 13 Pro (iPhone14,2), un 15 (iPhone15,4) et un 17 Pro Max ont exactement le même palier, donc les mêmes budgets.

### Les leviers « image sur téléphone récent » (palier-appareil.js:86-101)
- `PAL.imgOn(l)` = `TEL_NATIF && PAL.n>=2 && !PAL.imgMax && (filtres d'URL)` et, pour g/i/j, la table `iNeuf={g:0,i:1,j:0}` (l.97).
- `PAL.bT(clé, avant, l)` = `PAL.B[clé][2]` si le levier l est actif, sinon `avant`. L'ordi (TEL_NATIF faux, même avec `?tel=1`) a toujours `avant`.
- URL : `?img=max` (tous éteints) · `?img=a,c` (seulement ceux-là) · `?img=13` (= seulement a) · `?imgsans=b` (tous sauf) · `?imgplus=g,i,j` (allume les leviers à demander).
- `dbgImg()` les décrit.

| Levier | Défaut sur palier 2 natif | Ce qu'il fait | Clé et lieu |
|---|---|---|---|
| a | ALLUMÉ | halo en ½ résolution (`BLOOM_BASE` .5) et 3 étages au lieu de 4 | `imgBloomRes` palier-appareil.js:300-301 ; `imgBloomMips` triptyque-bloom.js:334 |
| b | ALLUMÉ | ombre PCF simple au lieu de PCFSoft, carte de 768 au lieu de 1024 | `imgOmbreDouce`, `imgOmbre` triptyque-bloom.js:10-13 |
| c | ALLUMÉ | plafond de NETTE 1,25 au lieu de 1,5 ; départ au cran QL 1 | `imgDprCap`, `imgQlDepart` palier-appareil.js:251-253 ; nettete-qualite.js:239 |
| d | ALLUMÉ | passe lisse du ciel une image sur 2 | `imgCielImg` ciel2.js:27,59 |
| e | ALLUMÉ | traits d'air et traînées en demi-densité au-delà de 200 km/h | `imgDensVit` stries-vent.js:34-35 |
| f | ALLUMÉ | l'échelle QL réagit dès p75 > 19 ms au lieu de 24 | `imgQlP75` nettete-qualite.js:106, boucle-1.js:98 |
| g | éteint | précision des shaders mediump | `imgPrec` palier-appareil.js:159,174 |
| h | (rien) | anticrénelage : rien à faire, FXAA partout (triptyque-bloom.js:34) | — |
| i | ALLUMÉ | photos du ciel 4096×1024 → 2048×512 | chute-menu.js:159 (`cielReduit`) ; maps/jade-2.js:197 |
| j | éteint | halo à 2 étages | `imgBloomMips2` triptyque-bloom.js:334 |

---

## 2. L'échelle QL (rendu/nettete-qualite.js + moteur/boucle-1.js)

### Les objets
- `QLR` (l.22-23) : l'anneau des 60 dernières durées d'image `a`, et `p50/p75/p90`, recalculés toutes les 250 ms (boucle-1.js:57-58). La sonde : `vrai` (coût réel médian de 5 images), `vraiT`, `dern`, `cg`.
- `QLT` (l.40) : le chronomètre GPU `EXT_disjoint_timer_query_webgl2` (Chrome, Android ; **absent sur iPhone**).
- `QL_BARRIERE` (l.68) : sur ALLEGE + WebGL2, la sonde utilise `fenceSync` (sans blocage) ; `?sonde=ancien` = `readPixels`. `dbgBarriere()`.
- `QL` (l.76-77) : `k` (le cran), `mur/murT`, `roseT`, `up`, `efT`, `effondre`, `N_EFF=5`, `ombre0` (= `sun.shadow.mapSize.x` au moment où le morceau se charge, donc `OMBRE_N`), `essai`, `plafK/plafT`, `force`, `bride`, `nom`.
- `qlSondeDebut()` est appelé en tête de boucle (boucle-1.js:17), `qlSonde()` en fin (boucle-6-hud.js:315).

### Les crans (qlBornes l.135-139, qlDpr l.140-143, qlPose l.144-152)
Crans 1 à 5 = « invisibles », sans recompilation :

| Cran k ≥ | Ce qui est retiré | Code |
|---|---|---|
| 1 | ombre redessinée une image sur deux EN VOL, loin de toute dalle (> 14 m) | boucle-1.js:61-63 (`renderer.shadowMap.autoUpdate=false`) |
| 2 | carte d'ombre 768 | qlPose l.145 (`k>=2?768`) |
| 3 | halo à ¾ de sa base (`BLOOM_RES = .75 × BLOOM_BASE`) | l.147 |
| 4 | carte d'ombre 512 | l.145 |
| 5 | plus de flou radial au boost (`FLOU_OK=k<5`) | l.148 ; `FLOU_OK` déclaré portails.js:293 |
| 6 … kNet | la résolution descend du plafond `cap` au plancher NET `pl`, par pas de ≈ 0,08 (`nA` crans) | qlDpr |
| kNet+1 … kBas | sous le plancher NET jusqu'au plancher BAS `bas` (`nB` crans) : **seulement sur effondrement** | |
| kMax = kBas+1 | halo éteint (`bloomPass.enabled=false`) | l.149 |

`QUAL_MED = k>0`, `QUAL_LOW` = halo éteint (l.152). `bloomPass.enabled` est aussi faux si `PAL.b('bloomOff')` ou REDUCED_MOTION.

Bornes (l.137-138), téléphone : `cap=DPR_CAP` ; `pl = min(cap, NETTE ? PAL.b('dprNet') : .85)` ; `bas = min(pl, max(DPR_MIN, NETTE ? PAL.b('dprNetBas') : .7))` ; `nA = ceil((cap−pl)/.08)`, `nB = ceil((pl−bas)/.08)` ; `kNet = 5+nA`, `kBas = kNet+nB`. NETTE et HAUTE comptent comme « net » (`qlNet`, l.97). Ordi (`POSTE.auto`) : `pl = 72 % cap`, `bas = 50 % cap`, 2 + 1 crans ; Mac (`POSTE.fixe`) : aucun cran de résolution, ni ombre ni halo refaits.
`qlPose` borne k entre `PAL.b('qlMin')` (0 si VHD ou `QL.force`) et kMax ; **HAUTE (`qHaute`) force k = 0**.

### La régulation (boucle-1.js:98-124), un pas toutes les 1,1 s (`dprT`)
Conditions : `!RESPIN` (gel du banc), `now > 4000`, `qlAuto()` = `(TEL_NATIF‖POSTE.auto) && !HAUTE && started && !gameOver` (nettete-qualite.js:132). `calme9` (l.48) = page visible, plus de `loop._rebuildD` (2,5 s) depuis une reconstruction, et pas à 30 Hz réguliers (`loop._r30`, l.39-40).
- « ça tire » `tire9` = `p75 > PAL.bT('imgQlP75',24,'f')` (**19 ms** sur palier 2 natif) ou `p50 > 18,5` ; « ça rame fort » `fort9` = `p50 > 24` (descente de 2 crans).
- **Essai d'un cran de résolution** (l.101-103) : 3,3 s après, si p50 et p75 n'ont pas baissé de 1,5 ms et la moyenne de 8 %, on revient et ce cran devient un PLAFOND 45 s (`plafK/plafT`).
- **Avant de descendre : la sonde** (l.104) : `qlSondeArme()` (5 images). Elle se tait 8 s après une mesure, 30 s quand l'échelle est au plancher et sans chrono (iPhone).
- **Bride de l'écran** (l.111-112) : sonde `vrai < 14,5 ms` → rien n'est baissé (`QL.bride`), et au 3e pas un cran REMONTE.
- **Descente** (l.113-120) : `k+1` (ou `+2`), limitée à `kNet` sauf effondrement (`kMax`), bornée par un plafond récent ; une descente moins de 6 s après une remontée pose un MUR 45 s (`QL.mur`).
- **Effondrement** (l.59) : `k ≥ kNet` et `p50 > 24` pendant 6 s d'affilée → `QL.effondre`.
- **Remontée** (l.121-124) : marge = `p90 < 17,8` ou 30 Hz réguliers (`loop._r30`) ou (`CAD.eco` et `p75 < 19`), et pas `CAD.gel` (calé sur 30 par chaleur, cadence.js:77,85). 3 pas de marge (~3,3 s) → un cran de moins (2 si `p90 < 16,9` et sous la résolution), jamais au-delà du MUR.
- `gouverneur-thermique.js:92` : état iOS « critical » → `qlPose(QL.k+1)` une fois par épisode.

### Le départ (imgQlDepart) et la vitrine
- **Au chargement seulement** (nettete-qualite.js:239) : `qlPose(max(PAL.bT('imgQlDepart', PAL.b('qlDepart'), 'c'), POSTE.k0))` → **cran 1** sur palier 2 natif (5 / 2 / 0 sinon).
- ⚠ **Aucun code ne remet QL.k au départ d'une course** (grep de `QL.k=` et `qlPose(`). Au menu, `vhdBascule(true)` (l.213-216, déclenché par boucle-6-hud.js:134) retient `VHD.k0 = QL.k` et force le cran 0 ; au départ, `vhdBascule(false)` rend `qlPose(VHD.k0)`. Avec `PCM_ON` (vrai sur téléphone, l.205), l'écran de fin n'allume pas la vitrine : **la course suivante repart du cran où la précédente a fini**, pas de `imgQlDepart`. Les morceaux `qlReprise()` (l.153-154 : RAPIDE⇄NETTE, retaille) remettent au plus au cran 5.
- **VHD** (l.174-222) : à l'accueil, au garage et à l'atelier, l'échelle dort et `VHD.dpr` tient la résolution. `vhdDpr()` (l.209-210) = `max(DPR_CAP, min(dpr, √(vhdPx / points), vhdDprTel 2))`. Ombre `min(vhdOmbre, vhdOmbreTel)` = 1024 sur téléphone (`?menu=max` : 2048). Le filet (boucle-1.js:84-97) : lenteur tenue 2,5 s (p75 > 22) → sonde → ×0,8 jusqu'à `DPR_CAP` ; marge 3 s → ×1,25 (`vhdMonte`). `?hd=0` coupe. `vhdAniso` : anisotropie max de la carte dans la vitrine, `ALLEGE ? 4 : 8` en course.

### applyDPR (moteur/init.js:420-…)
`renderer.setPixelRatio(curDPR)` et `composer.setPixelRatio` → **réalloue la toile, les cibles du compositeur et du halo**. Avec `ROT_DOUX` (téléphone) rien n'est réalloué si le ratio et la taille n'ont pas bougé. Le « piqué natif » `uSharp` compense l'agrandissement par le navigateur : `up9 = min(3,dpr)/curDPR`, force `min(PIQUE_NAT .4, (up9−1)×.4)` (`?pique=0`, `?piquen=`). `PT_U.uPxMax = 26×curDPR`.

### La couche dynamique `imgRegle` (nettete-qualite.js:107-131)
`imgRegle({halo,mips,ombre,dpr,ciel,stries})` à chaud (`window.imgRegle`) ; `imgRegle('reset')` rend l'état d'origine à la microtâche (`imgDiffere`). Elle écrit `BLOOM_BASE`, `bloomPass._nM`, `QL.ombre0`, `DPR_CAP`, `IMG_DYN.ciel/dens/vmin` et **`PAL.B.bloomOff[PAL.n]`** (la table est modifiée), puis `qlPose(QL.k)`. `IMG_DYN` est déclaré palier-appareil.js:302.

### Le gouverneur par paliers (moteur/gouverneur-paliers.js) — par-dessus QL
Avec le capteur d'iOS (`MOB_S.capteur`, événement `cc:thermique`), la table `MOB_PN` (l.30-31) :

| État | Posé |
|---|---|
| 0 nominal | rien (`imgRegle('reset')`) |
| 1 fair | halo ½ à 2 étages, ombre 512, `qlMin` 3 |
| 2 serious | halo coupé, ombre 512, ciel 1/4, traits ×½, `ventK/emiK` ×½, `qlMin` 99 |
| 3 serious depuis 150 s (`MOB_LONG`) | + plafond 1,1, ciel 1/8 |
| 4 critical, ou serious + branché (`__ccBranche ≥ 2`) | plafond 0,85 |

Sans capteur : `MOB_PP` (l.21) par la « dose » (60 / 100 / 140). `mobPalEcrit` (l.37) **réécrit `PAL.B.qlMin/ventK/emiK[PAL.n]`**. La remontée au-delà du départ (`MOB_RA`, `MOB_R`) est **éteinte par défaut** (`?mob_raise=1`). `dbgGouvPaliers()`, `dbgGouv(dose)`, `dbgThermique(n)`.
⚠ À la lecture : `qlMin` 99 → `qlPose` borne à **kMax**, donc DPR = plancher BAS (1,0 en NETTE sur 13 Pro) et halo éteint. Le commentaire de gouverneur-thermique.js (l.~32) dit pourtant « serious : la résolution INTACTE », et un relevé ancien cite 1,19. **Non vérifié en jeu.**

---

## 3. Valeurs effectives : iPhone 13 Pro dans l'app (palier 2, TEL_NATIF, ALLEGE)

Hypothèses : modèle `iPhone14,2`, écran 390×844 pt, densité 3, réglage NETTE (le défaut du palier 2 : `qNetDefaut=[0,0,1]`, sauvegarde.js:11/71), aucun paramètre d'URL, état thermique nominal. Calculé, pas mesuré : à confirmer par `dbgNette()` / `dbgQual()` / `dbgVHD()` / `dbgImg()` / `dbgPalier()`.

| Chose | Valeur | D'où |
|---|---|---|
| DPR de départ = plafond (`DPR_CAP`) | **1,25** (514 000 px ; l'écran en a 2,96 M : agrandi ×2,4 par WebKit) | `dprPlafond` l.252-253 : `bT('imgDprCap', dprNetCap 1,5, 'c')` |
| RAPIDE | 1,0 | `dprPlafond(true)` |
| HAUTE | **1,25 aussi** (même plafond que NETTE, seulement « jamais baissé ») | `dprPlafond(false)` |
| Plancher NET | 1,25 (= plafond : `nA = 0`, aucun cran de résolution en régime normal) | `dprNet[2]=1,25` |
| Plancher BAS (effondrement) | 1,0 : crans 6-9 → 1,1875 / 1,125 / 1,0625 / 1,0 | `dprNetBas[2]=1` ; `nB=4` |
| Crans | kNet 5, kBas 9, **kMax 10** (halo éteint) | qlBornes |
| Cran de départ | 1 au chargement (ombre en vol ½), ensuite celui de la course précédente | l.239 ; voir §2 |
| Cran 2 « ombre 768 » | **sans effet** : la carte est déjà à 768 | `QL.ombre0 = OMBRE_N = 768` |
| Ombre de course | **768, PCF simple** (cran 4 : 512) | triptyque-bloom.js:10-13 |
| Halo : base | `BLOOM_BASE` 0,5 ; `bSc` 0,42 (LOOK_TEL) | palier-appareil.js:301 ; triptyque-bloom.js:307 |
| Halo : cible | argument `round(W×1,25×.42×2×.5)` puis ÷2 par UnrealBloomPass : 1er étage ≈ **103×222** en portrait (cran ≥ 3 : ≈ 77×166) | triptyque-bloom.js:326 ; vendor/postprocessing/UnrealBloomPass.js:141-155 ; EffectComposer.js:185-196 |
| Halo : étages | **3** (`imgBloomMips[2]`) ; sans levier a sous ALLEGE : 4 ; ordi : 5 | triptyque-bloom.js:334 |
| Ciel lisse | une image sur 2 | ciel2.js:59 |
| Traits d'air / traînées > 200 km/h | densité ×0,5 (les traînées POP et les flammes en sont sorties par `GFX_PLEIN`) | stries-vent.js:17-35 |
| Textures | photos du ciel 2048×512 (levier i) ; anisotropie route/autoroute 4 (ordi 8) ; ligne parfaite 2 (ordi 4) | chute-menu.js:159 ; bitume-beton.js:83 ; autoroute.js:202 ; ligne-parfaite.js:280 |
| Précision shaders | highp (g éteint) | palier-appareil.js:174 |
| MSAA de la toile | non ; FXAA | palier-appareil.js:174 ; triptyque-bloom.js:34 |
| Pochoir | non (`CTX3D_POCHOIR`) | palier-appareil.js:171 |
| Vitrine (menu) | DPR **2,0** (`vhdDprTel`, budget `vhdPx` 1,4 M → 2,06), ombre **1024** | nettete-qualite.js:208-214 |
| Seuil de descente | p75 > 19 ms ou p50 > 18,5 | boucle-1.js:98 |

Un iPhone 15 et un iPhone 17 Pro Max ont **exactement les mêmes valeurs** (seul le nombre de points d'écran change les pixels). Rien ne remonte jamais au-dessus de ce départ en course.

À comparer, l'ordi au MAX (« Vercel ») : `dprPlafond` → budget de pixels réels `PC_PX` 3,2 M (2,0 M en 4K, plancher `PC_MIN` 1,25/1,5) ; ombre 1280 PCFSoft ; halo base 1, 5 étages, `bSc` .42 en cadre ; ciel à chaque image ; densité 1 ; ciel 4096 ; anisotropie 8. **`?img=max` sur téléphone ne donne PAS ça** : il garde tout ce qui est sur `ALLEGE` (ombre 1024 au lieu de 1280, 4 étages au lieu de 5, plafond 1,5 au lieu des pixels réels, anisotropie 4, `mapsSobres()`, VAO, pochoir, `menu` 30 i/s…).

---

## 4. Table complète des clés PAL.B (hors maps)

`[ANCIEN, MOYEN, RÉCENT]`. Pour les clés `img*`, seule la 3e colonne est lue (par `PAL.bT`, sur palier 2 natif) ; le reste du temps c'est la valeur « avant » du code qui joue.

| Clé | Valeurs | Déclarée | Lue / rôle |
|---|---|---|---|
| memToiles | [1,1,0] | rendu/palier-appareil.js:119 | rendre les toiles 2D après envoi (aussi sur tout ALLEGE) |
| imgPrec | ['highp','highp','mediump'] | rendu/palier-appareil.js:159 | levier g |
| imgDprCap | [1.25,1.35,1.25] | rendu/palier-appareil.js:251 | levier c, plafond NETTE |
| imgQlDepart | [5,2,1] | rendu/palier-appareil.js:251 | levier c, cran de départ |
| dprNetCap | [1.25,1.35,1.5] | rendu/palier-appareil.js:263 **et** rendu/nettete-qualite.js:93 (doublon, identique) | plafond NETTE |
| imgBloomRes | [1,1,.5] | rendu/palier-appareil.js:300 | levier a |
| dprNet | [1,1.15,1.25] | rendu/nettete-qualite.js:93 | plancher NET |
| dprNetBas | [.85,.9,1] | rendu/nettete-qualite.js:93 | plancher BAS |
| qNetDefaut | [0,0,1] | rendu/nettete-qualite.js:93 | NETTE par défaut |
| imgQlP75 | [24,24,19] | rendu/nettete-qualite.js:106 | levier f |
| vhdDprTel | [2,2,2] | rendu/nettete-qualite.js:208 | plafond de la vitrine sur téléphone |
| vhdOmbreTel | [1024,1024,1024] | rendu/nettete-qualite.js:208 | ombre de la vitrine sur téléphone |
| bloomOff | [`?bloom=1`?0:1, 0, 0] | rendu/nettete-qualite.js:238 | halo coupé (réécrit par imgRegle) |
| qlDepart | [5,2,0] | rendu/nettete-qualite.js:238 | cran de départ |
| qlMin | [4,0,0] | rendu/nettete-qualite.js:238 | cran plancher (réécrit par le gouverneur) |
| vhdPx | [.45e6,1.4e6,1.4e6] | rendu/nettete-qualite.js:238 | budget de pixels de la vitrine |
| vhdOmbre | [1024,2048,2048] | rendu/nettete-qualite.js:238 | ombre de la vitrine |
| vhdMort | [0,0,1] | rendu/nettete-qualite.js:238 | vitrine HD à l'écran de fin (sans effet sur téléphone : PCM_ON) |
| postOmbreDouce | [0,0,1] | rendu/triptyque-bloom.js:9 | PCFSoft |
| imgOmbreDouce | [0,0,0] | rendu/triptyque-bloom.js:10 | levier b |
| imgOmbre | [1024,1024,768] | rendu/triptyque-bloom.js:10 | levier b |
| postBloomMips | [3,4,5] | rendu/triptyque-bloom.js:334 | étages du halo |
| imgBloomMips | [3,4,3] | rendu/triptyque-bloom.js:334 | levier a |
| imgBloomMips2 | [5,5,2] | rendu/triptyque-bloom.js:334 | levier j |
| imgCielImg | [2,1,2] | rendu/ciel2.js:27 | levier d |
| cielImg | [2,1,1] | rendu/ciel2.js:28 (rappelée en commentaire l.58) | ciel lisse 1/N |
| emiK | [.6,.8,1] | rendu/stries-vent.js:17 | émission des effets (réécrite par le gouverneur ; `EMI_K0` en garde la copie) |
| imgDensVit | [1,1,.5] | rendu/stries-vent.js:34 (rappelée en commentaire l.33) | levier e |
| pisteCh | [720,900,1200] | moteur/piste-prebati.js:26 (Object.assign) | piste pré-bâtie |
| railMoy | [1,1,0] | moteur/piste-prebati.js:26 | |
| pieceArr | [150,240,1e9] | moteur/piste-prebati.js:26 | |
| routeCols | [5,7,11] | moteur/depart-avance.js:241 | `?routecols=` |
| cadence30 | [1,1,0] | moteur/cadence.js:29 | |
| cadenceDepart | [1,0,0] | moteur/cadence.js:29 | |
| cadenceTenue | [1000,2000,2000] | moteur/cadence.js:29 | |
| cadenceMonte | [1,0,0] | moteur/cadence.js:29 | (`CAD.gel`, gel de la remontée QL) |
| hors30 | [1,1,0] | moteur/cadence.js:166 | menus à 30 i/s |
| reposMs | [66.7,66.7,66.7] | moteur/cadence.js:200 (l.199 = commentaire) | |
| reposLongMs | [66.7,66.7,66.7] | moteur/cadence.js:200 | |
| menuCull | [1,1,1] | moteur/cadence.js:232 | |
| ventK | [.5,.7,1] | gameplay/boost-depart.js:212 | réécrite par le gouverneur |
| shopPre | [1,1,0] | economie/boutique.js:179 | |
| feuDt | [1,1,1] | interface/flammes-cubes.js:119 | |
| cielPrise | [1,1,1] | interface/atelier-ferme.js:629 | |
| hudNitroQ | [50,50,100] | interface/bouton-nitro-gains.js:40 | |
| hudBarQ | [100,100,200] | interface/bouton-nitro-gains.js:40 | |
| mortImg | [4,2,1] | interface/bouton-nitro-gains.js:308 | scène derrière l'écran de fin, 1 image sur N |
| engVigMs | [100,66,33] | interface/vignette-moteur.js:27 | |
| engRes | [480,624,864] | interface/vignette-moteur.js:33 | |

Total hors maps : **49 clés** (dont `dprNetCap` déclarée deux fois). `moteur/gouverneur-paliers.js:43` écrit `PAL.B[k]` à chaud (qlMin, ventK, emiK).

**Dans `code/maps/`** (non ouverts en détail, comptés seulement) : 44 clés distinctes en `PAL.B.x=` (canyon-route 9, dunes-1 14, jade-2 3, jade-eau 3, nuages-coton 3, jade-vol 2, ville-embellie 2, cryptocity-embellie 2, et 1 dans cryptocity, dunes-ruines, jade-embellie, nuages-embellie, orbite-embellie, pluie-argent) + 14 par `Object.assign` (glacier-route 8, glacier-embelli 3, grottes-embellies 2, grottes-2 1) = **58 clés**. maps/jade-2.js:197 lit aussi `PAL.imgOn('i')`.

---

## 5. Crochets et paramètres utiles

Crochets : `dbgPalier()` / `dbgPalier(n)` · `dbgImg()` · `dbgNette()` (plafond, planchers, crans, pixels) · `dbgQual()` / `dbgQual(k)` (force et fige ; `dbgPin(false)` relâche, missions/atelier.js:330) · `dbgDPR(d, sansPique)` (fige) · `dbgVHD()` · `dbgVhdEcran()` · `dbgSonde()` / `dbgSonde(1|'sync')` · `dbgBarriere()` · `dbgGfx({...})` · `imgRegle()` · `dbgGouvPaliers()` · `dbgGouv(dose)` · `dbgThermique(n)` · `dbgCadence(30|60)` · `dbgPoste()` · `dbgFluide()` · `dbgToiles()`.

URL : `?palier=` `?appareil=iPhoneX,Y` `?palecran=0` `?img=max|a,c|13` `?imgsans=` `?imgplus=g,i,j` `?perf=1` (moniteur à l'écran) `?hd=0` `?menu=max` `?bloom=1` `?sonde=ancien|0` `?gouv=max` `?mob_gouv=0` `?mob_raise=1` `?mob_long=0` `?thermo=modele` `?sans=chargechaud|feuplein|rotation|pochoir0` `?cad30=0` `?frais=0` `?pcmort=0` `?pique=0` `?piquen=` `?allege=0` `?tel=1` `?poste=` `?sobre=0|1` `?halo=large` `?post=ancien` `?msaa=1` `?toile1=0`.

---

## 6. Pour un système de profils par appareil : où brancher, pièges

**Le constat** : la seule chose qui distingue les iPhone récents est `PAL.n`, à 3 valeurs, et tous les iPhone 12 et après tombent dans la même. Les leviers a-f et i sont des interrupteurs tout-ou-rien « téléphone récent natif ». L'échelle QL et le gouverneur ne savent que **baisser** depuis ce départ : aucun téléphone n'a de mécanisme pour monter au-dessus (la remontée `MOB_RA` est éteinte, le départ est fixe).

**Où brancher**
1. **Dans `PAL`** (palier-appareil.js, après `modele` l.64-65) : le modèle `iPhoneG,x` est déjà lu. On peut y poser `P.profil` (par exemple 0 bas … 3 max) depuis G. Correspondances usuelles **à vérifier** : 14,x = iPhone 13 (14,2 = 13 Pro) ; 15,2/15,3 = 14 Pro ; 15,4/15,5 = 15 ; 16,1/16,2 = 15 Pro ; 17,x = 16 ; 18,x = 17. Sur le web (Safari, sans `__ccAppareil`) : seulement la taille d'écran (`ecran`), qui confond plusieurs générations.
2. **Une façon de régler d'un seul point** : `PAL.bT` et `PAL.imgOn` sont les seuls passages des leviers. Une 4e source (une ligne par profil) peut se loger là sans toucher les colonnes ancien/moyen ni l'ordi (`TEL_NATIF` faux → `avant`).
3. **Réglage IMAGE HAUTE / BASSE** : trois choix aujourd'hui (`qSuivant`, `qLbl` nettete-qualite.js:133-134 ; bascules mobile-tactile.js:398 et 969, desktop-banc.js:40 ; `applyQ` mobile-tactile.js:331 ; défaut sauvegarde.js:11 et 71 ; pré-lecture `TOILE1_Q` palier-appareil.js:265-268 ; `POSTE` lit `haute` soleil-planete.js:476 ; `qNetDefaut`). HAUTE ne fait aujourd'hui que fixer le cran à 0 avec le **même plafond 1,25** et les mêmes leviers : il ne donne pas plus d'image. Les sauvegardes existantes ont `q:'fast'|'net'|'haute'` : il faut une migration (`net` → ?).

**Pièges**
- **Lu une fois, à la construction** : `OMBRE_N`, `renderer.shadowMap.type` (PCFSoft ou PCF entre dans les `#define` des programmes : changer ensuite = recompiler tous les programmes), `bloomPass._nM`, `BLOOM_BASE`, `precision` du renderer, `cielReduit` (ciel), anisotropies, `mapsSobres()`, budgets de contenu `PAL.b` des maps. Un profil doit être tranché **avant** palier-appareil.js:174, donc synchrone au chargement ; un changement HAUTE/BASSE en jeu ne peut pas tout rendre sans rechargement (ou il faut accepter une recompilation sous un volet).
- **`dprNetCap` est déclaré deux fois** (palier-appareil.js:263 et nettete-qualite.js:93) : les garder identiques, sinon la toile est allouée à un rapport puis réallouée.
- **`imgQlDepart` ne vaut qu'au chargement** : les courses suivantes repartent du cran de fin de la précédente (`VHD.k0`).
- **HAUTE n'arrête pas le gouverneur** : `imgRegle` baisse quand même `DPR_CAP`, le halo (`bloomOff`), l'ombre et le ciel en HAUTE (seul `qlMin` est ignoré, parce que k est forcé à 0).
- **`PAL.B` est muté à chaud** (`imgRegle` sur `bloomOff[PAL.n]`, le gouverneur sur `qlMin/ventK/emiK[PAL.n]`, copies d'origine dans `IMG_REGLE0` et `MOB_P.b`). Une table de profils doit se poser avant la première lecture de `mobPalBase()` et ne pas être écrasée par `imgRegle('reset')`.
- **Le gouverneur et `CAD30_REC` n'existent qu'au palier 2** (`PAL.n===2`) : passer un appareil puissant à un « palier 3 » sortirait du gouverneur thermique, de la cadence 30 et de tous les `PAL.b` à 3 colonnes (`v[3]` = `undefined` → `PAL.b` rend la valeur par défaut `d`, et `PAL.bT` rend `undefined`). Il vaut mieux un axe séparé (`PAL.profil`) que d'étendre `PAL.n`.
- **serious → kMax** (voir §2) : à la lecture, la résolution tombe au plancher BAS et le halo s'éteint, contrairement au commentaire. À vérifier sur l'iPhone avant de bâtir dessus.
- **La « version Vercel » sur un téléphone** demande plus que d'éteindre les leviers : tout ce qui est sur `ALLEGE` (ombre 1024/1280, 4/5 étages, plafond en pixels réels `dprPlafond` branche ordi, anisotropie, maps sobres, menus à 30 i/s, VAO, pochoir). La règle de CLAUDE.md : un allègement se garde sur `ALLEGE` ou `TEL_NATIF`, jamais sur `IS_MOBILE` (`garde-allege.sh` refuse la publication).
- **Le flou de la caisse et des traînées** vient en grande partie de ce qui est décrit ici : la 3D à 1,25 sur un écran à densité 3 (agrandie ×2,4 par WebKit, à peine compensée par `uSharp`), et un halo, qui fait la lueur des traînées, calculé sur un 1er étage d'environ 103×222 et 3 étages. Le halo garde sa largeur à l'écran grâce à `bloomPass.norme` (triptyque-bloom.js:371-383) mais perd sa finesse.
- **Une remontée change la résolution, donc applyDPR**, qui réalloue la toile et les cibles. Le gouverneur a vu 15 gels de plus d'une seconde quand il remontait (build 13, gouverneur-paliers.js:13). Tout profil « haut » qui bouge en course doit compter ce coût ; le plus sûr est de poser un plafond plus haut au départ et de laisser QL descendre.
- **Une ancienne clé `localStorage.cashcarPalier` en `src:'mesure'`** passe avant le modèle, et plus aucun code ne l'écrit ni ne l'efface. À contrôler avec `dbgPalier()` sur les téléphones de test.
- **La sonde de l'iPhone** est la barrière `fenceSync` (pas de chronomètre GPU) : elle compte un peu trop large, donc l'échelle est un peu prudente.
- **Machine saturée** (mémoire « Mesurer une latence ») : une mesure d'image sur le Mac ne dit rien du téléphone. Il faut juger les profils sur les vrais appareils, avec `?perf=1` et `dbgNette()`.
