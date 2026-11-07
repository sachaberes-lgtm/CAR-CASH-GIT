# Chasse — rendu / perf / ALLEGE (agent Sonnet, 2026-11-07)

Bilan : 0 bloquant, 2 majeurs, 5 mineurs. Worktree c9d9895d (v1235).

Fichiers lus : palier-appareil.js, nettete-qualite.js (entier) ; triptyque-bloom.js l.1-76 et 228-440 ; soleil-planete.js l.1-80 et 270-330 ; ciel2.js l.28-62 ; photos-films.js l.1-175 et 276-299 ; vignette-moteur.js l.225-470 ; garage-ombre.js ; garage-rendu.js l.1-150 ; buildcar.js l.61-98 ; boucle-4-effets.js l.1-120 ; boucle-6-hud.js l.270-315 ; mobile-tactile.js l.318-345 et 545-566 ; page/tete.html ; garde-allege.sh ; vercel-build.sh ; publie-allege.cjs ; le reste par greps ciblés.

## A. Audit du 11-05
| ID | état | preuve |
|---|---|---|
| RND-01 | OUVERT (atténué par « les dunes d'avance ») | dunes-1.js:540 `const W=started&&…?dnTravailleur():null;` puis `dnMondePose(dnMondeCalc(S,opt))` synchrone quand `!started` ; piste-prebati.js:367 `PREB_CPU_DEF={grotte,jade,foret}` sans dunes |
| RND-02 | OUVERT | piste-prebati.js:291 `PREB_PISTES=['','jade','foret','canyon','banquise','grotte','dunes']` |
| RND-03 | CORRIGÉ | palier-appareil.js:91 |
| RND-04/DIR-06 | NON VÉRIFIABLE | vercel-build.sh appelle scinde-banque.cjs |
| RND-05 | CORRIGÉ | nettete-qualite.js:68 `QL_BARRIERE=ALLEGE&&…isWebGL2` |
| RND-06 | PARTIEL | triptyque-bloom.js:280 ; FXAA demi-cible non fait |
| RND-07 | OUVERT | RAPPORT-JURY-OPUS.md:52 |
| RND-08 | NON VÉRIFIABLE | |
| RND-09/10/11/12 | OUVERT | rapports jury |
| RND-13 | NON VÉRIFIABLE | |
| RND-14 | OUVERT (voir RND-N03) | scene-ciel.js:1021 `PerspectiveCamera(72,…,.1,9800)` |
| RND-15 | OUVERT : aucun anti-rebond sur le `resize` principal | palier-appareil.js:218 (RND-N04) |
| RND-16 | OUVERT en partie | vignette-moteur.js:445 `renderer.compile(scene,camera)` |
| RND-17/19/21/22/37 | NON VÉRIFIABLE | |
| RND-28 | CORRIGÉ | piste-prebati.js:62 |
| RND-42 | NON VÉRIFIÉ | |
| DIR-01 | OUVERT | soleil-planete.js:36-38 `draw();…fonts.ready.then(draw)` synchrone à la lecture du script ; pas de PNG pré-rendu |
| DIR-02 | NON VÉRIFIABLE | buildCar libère (buildcar.js:70-76), débris libérés (boucle-3-physique.js:650), photos plafonnées 32 Mo (photos-films.js:9) |
| DIR-03 | CORRIGÉ en pratique palier 2 (NETTE, DPR_CAP 1,5) ; RAPIDE reste 1,0 ; paliers 0-1 démarrent en RAPIDE | nettete-qualite.js:93, palier-appareil.js:167-170 |
| DIR-07 | CORRIGÉ | debut-corps.html:9 `<plaintext id="ccCadreInerte">` quand CC_COLONNE |

Contexte WebGL perdu : géré (palier-appareil.js:125-137 : preventDefault, restored → ctxRecharge, filet 5 s, écran « a calé » à la 4e perte). Canvas : une seule allocation (TOILE1, l.170-180) ; taille nulle ignorée. Shaders : `texelFetch`/`textureLod` conditionnés par W2_POST ; `fwidth` de finition.js:84 sans `extensions.derivatives` en WebGL1 (sans effet iOS 16.4+).

## B. Nouveaux défauts

### RND-N01 · MAJEUR · La protection « écran 4K » est annulée dans la colonne de l'ordi
- Où : code/rendu/palier-appareil.js:157-163 (`RETINA_OK`, `PC_4K`, `PC_PX`, `VHD_PX_PC`)
- Quoi : `RETINA_OK=devicePixelRatio>=2&&innerWidth*innerHeight<=2.6e6` est calculé sur l'iframe (844×390 à densité 3-4,5 dans la colonne), donc VRAI sur un 4K ; `PC_4K` FAUX ; course à 3,2 Mpx au lieu de 2,0, vitrine à 4,2 au lieu de 2,6. Les 300-600 Mo GPU que f8828587 (v1173) voulait retirer reviennent.
- Preuve : `const RETINA_OK=!/[?&]retina=0\b/.test(location.search)&&devicePixelRatio>=2&&innerWidth*innerHeight<=2.6e6; const PC_4K=…&&!RETINA_OK&&innerWidth*innerHeight*devicePixelRatio*devicePixelRatio>=4.5e6;`
- Correction proposée : mesurer l'aire de l'écran, pas de l'iframe : `parent.innerWidth*parent.innerHeight` (try/catch quand `window.parent!==window`) ou `screen.width*screen.height`. Vérifier avec `dbgVhdEcran().pc4k`.
- Confiance : haute sur la logique ; moyenne sur l'effet (non mesuré).

### RND-N02 · MAJEUR · La résolution 3D ne suit pas le zoom du cadre après le chargement
- Où : palier-appareil.js:179 (DPR_CAP lu une fois) et :218 (resize ne refait que setSize). Seul SIMU_JEU suit (soleil-planete.js:318-321).
- Quoi : sur ordi, agrandir la fenêtre, F11 ou changer d'écran après le chargement → 3D floue en course jusqu'au rechargement. La vitrine du menu se recalcule (nettete-qualite.js:192).
- Preuve : `if(SIMU_JEU){…setInterval(function(){…DPR_CAP=Math.min(devicePixelRatio,ALLEGE?1:1.5);qlReprise();},250);}` ; `DPR_CAP` recalculé seulement dans `applyQ` (mobile-tactile.js:326).
- Correction proposée : dans le handler resize, `if(!ALLEGE&&Math.abs(devicePixelRatio-DPR_VU)>.01){DPR_VU=devicePixelRatio;DPR_CAP=dprPlafond(SAVE.d&&SAVE.d.q==='fast');qlReprise();}` avec anti-rebond (RND-N04).
- Confiance : haute sur le mécanisme.

### RND-N03 · MINEUR · Tampon de profondeur 16 bits, near=0,1, far=9 800
- Où : triptyque-bloom.js:246-248 (`WebGLRenderTarget` sans depthTexture), scene-ciel.js:1021
- Quoi : three r128 → DEPTH_COMPONENT16 (vendor/three.min.js : 33189). Résolution ~1,5 m à 100 m ; z-fighting lointain déjà contourné par polygonOffset (bitume-beton.js:268).
- Correction proposée : `camera.near=.3` (RND-14) ou `rt.depthTexture=new THREE.DepthTexture(w,h,THREE.UnsignedIntType)` (24 bits, WebGL2 ; vérifier renderTarget2).
- Confiance : haute sur le fait, moyenne sur la visibilité.

### RND-N04 · MINEUR · Le resize principal n'est pas anti-rebondi
- Où : palier-appareil.js:218
- Quoi : chaque `resize` fait `renderer.setSize` + `composer.setSize` (réallocation des cibles). Seul orientationchange/visualViewport est anti-rebondi (mobile-tactile.js:561-564, 280 ms). Glisser la fenêtre = réallocations en rafale.
- Correction proposée : garder aspect/fovFit immédiats ; différer les setSize de ~120 ms ; sauter si la taille n'a pas changé.
- Confiance : haute.

### RND-N05 · MINEUR · `?vhd15` sans effet : le « rendu B pour tout le monde » (89f6dcb8) n'est pas appliqué
- Où : nettete-qualite.js:180 (`vhdDpr`), VHE_MODE l.160 = 2 par défaut sur ordi
- Quoi : `(TEL_NATIF||VHE_MODE||(CC_DPR_CADRE&&vhd15=0))?1:1.5` → toujours 1 sauf `?vhdecran=0`.
- Correction proposée : décider ce qu'est « le rendu B » (demander à Léo) ; tester vhd15 avant VHE_MODE.
- Confiance : haute sur le code, basse sur l'intention.

### RND-N06 · MINEUR · Allègements du post-traitement via `LOOK_TEL` (= FORCE_TEL||TEL_NATIF), invisibles à la garde
- Où : triptyque-bloom.js:30 (`ACES_N=LOOK_TEL?6:8`), :120-124 (halo/aberration retirés), :152, :253-255 (bloom .42 vs .55)
- Quoi : l'ordi joue dans la colonne en FORCE_TEL donc LOOK_TEL vrai : 6 prises au lieu de 8, plus d'aberration, bloom .42. Le commentaire de LOOK_TEL (soleil-planete.js:295) assume « l'image réglée » : décision produit Sacha.
- Correction proposée : si « PC = maximum » : `ALLEGE?6:8`, etc. Sinon étendre garde-allege.sh à FORCE_TEL/LOOK_TEL avec liste blanche.
- Confiance : haute sur le fait ; peut être un non-défaut.

### RND-N07 · MINEUR · `chauffeRendu` : restauration de la scène hors du `finally`
- Où : vignette-moteur.js, fin de `chauffeRendu` (~l.410-428)
- Quoi : si `renderer.render` lève pendant la chauffe, `scene.onBeforeRender=function(){}` reste (tri de piste `pisteLoin` coupé pour la session), objets `vis` restent visibles, `frustumCulled` désactivés.
- Correction proposée : déplacer `scene.onBeforeRender=ob9`, `vis`, `off`, `cul`, `caches9` dans le `finally` existant.
- Confiance : moyenne.

## C. garde-allege.sh
`✔ aucun allègement du rendu ne tient à IS_MOBILE` (code 0). Aveugle à FORCE_TEL/LOOK_TEL/TACTILE_NATIF. `node code/assembler.cjs --verifier` OK.

## D. Non vérifié
Tas JS, coût GPU vitrine, draw() du soleil sous contention, shaders iPhone/Adreno/Mali. Non lus en entier : scene-ciel.js, triptyque-bloom.js (partiel), stries-vent, trainees-1/2, etalonnage-da, kit-lumiere, bitume-beton, traces-pneus, nitro-feu, finition, feux-led, atelier-roues, matieres-forme, garage-cadrage. Retouche `__ccLier` de vendor/three.min.js non relue (un SW qui servirait un three.min.js non retouché casserait `compileDoux`).
