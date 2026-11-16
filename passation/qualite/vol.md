# LES TRAÎNÉES EN VOL (14/11 soir, branche `qa/vol`, worktree `~/cash-car/qualite-vol`)

Sacha, build 115 sur son 13 Pro : « retravaille encore les shaders, je trouve qu'en mode AIR TIME (la caisse en vol) les traînées rouges qui partent des feux
arrière sont mal gérées ». But : la caisse et ses rubans (`SILS`) parfaits en vol, sans rien changer au sol, à l'ordinateur ni hors profil.

## Le banc (nouveau) : `outils/banc-qualite-vol/vol.cjs`
Un Chrome sans fenêtre, muet, iPhone 13 Pro émulé (844×390 / 390×844, DPR 3, tactile, UA iPhone → TEL_NATIF ; `?appareil=iPhone14,2` → PRF classe 1, N1),
boucle menée à la main (rAF coupé, `dbgStep(1,33)`, 36 ms entre deux pas), verrou du Mac pris/rendu à chaque passage. Le pilote roule à la vitesse visée,
attend des rubans ROUGES (pas l'or d'un pad turbo), DÉCOLLE (`DBG_AUTO.saut`, impulsion 45 : ~1,3-2 s de vol), lance une figure en vol (`dbgSautFig(x,y)` :
double-tap NITRO + pouce), et FILME CHAQUE IMAGE jusqu'à la pose : photo + relevé d'écran des rubans (`dbgRubans({releve:1})`, nouveau crochet de banc :
départ par rapport au feu, largeur du cœur et du halo à l'écran rangée par rangée, cassures, vrilles, éclat, couleur) + assiette (`dbgVol()`).
`--abj 4,11` redessine LA MÊME IMAGE sans chaque correctif (`--ab sansvol,sansvolfin,sansvolcaisse,sansmasque,sanslong,avant`) : c'est la preuve AVANT/APRÈS
(le jeu tire au hasard : deux chargements ne donnent pas le même ciel). `--cout n` mesure le coût CPU du ruban ; `--bv 1 --q perfrec=2` relit la boîte de vol.

Prises : nuages couché 300 km/h (petit saut, grand vol, tonneau), couché 600 km/h au nitro (salto), debout 300 km/h (tonneau), Jade de nuit couché 300 km/h.

## Les défauts vus (du plus visible au moins visible)

1. **LES « FILS DE MARIONNETTE » — deux barres qui s'élargissent jusqu'au bas de l'écran.** Au sol la caméra est à 4-5 m des feux : le ruban passe sous elle
   après 3-4 m, on n'en voit que la tête (relevé : 4 rangées dessinées). En vol la caméra recule : la TRAJECTOIRE ENTIÈRE se déroule entre la caisse et l'objectif.
   Le cœur passe de ~4 px CSS à la tête à 20-60 px en bas (relevé `wMax`), le halo jusqu'à 140-185 px, et les deux barres rouges saturées lavent le bas de
   l'image. Photos : `photos/vol/film-debout-nuages-v300-AVANT.jpg` (images 2-12), `film-couche-nuages-v300-tonneau-AVANT.jpg` (2-8),
   `film-jade-nuit-v300-AVANT.jpg` (3, 8). Même chose à 600 au nitro (orange) : `meme-image-couche-v600-nitro-salto.jpg` (AVANT 6).
   **Cause** : `voitures/atchoum-feu.js` (silRuban) — les plafonds d'angle `SIL.capC` 0,03 / `SIL.capG` 0,13 rad (`maps/orbite-2.js:418`, interdit) laissent
   le ruban s'élargir comme un objet à 1-3 m de l'objectif, et le fondu près de l'objectif (cœur 1,4-2,7 m, halo 1,9-3,8 m) était réglé pour le SOL.
   Les gerbes en éventail du salto à 600 (AVANT 14/16 : deux « ailes » orange jusqu'aux bords de l'écran) sont la même chose : le sillage d'une vrille qui
   file vers l'objectif.
2. **LE RUBAN TRAVERSE LA CAISSE pendant une figure.** En tonneau, les feux tournent autour de la caisse : le sillage d'une image plus tôt est entre la caméra
   et la carrosserie, et le ruban additif la couvre (orange sur la carrosserie trois images de suite). Photo : `meme-image-tonneau-f11-E-F.jpg` (AVANT, « sans F »),
   `film-couche-nuages-v300-tonneau-AVANT.jpg` (10-12). Cause : aucune — le ruban est juste (c'est la trajectoire) ; rien ne le retenait de passer devant la caisse.
3. **Petits crochets à la tête** pendant une figure (relevé : 45-67° entre deux rangées distantes de 2-4 px CSS, à la sortie du feu). C'est la trajectoire vraie
   d'un feu qui tourne ; à l'écran c'est un crochet de 2-4 px. **Non corrigé** (pas un défaut à l'œil sur les planches).
4. **Le masque NET_NITRO2 (lot 3) au pad turbo** : cœur net par plaques (`photos/vol/…` non gardée, vue sur `av3` image 24) — le seuil `smoothstep(0.015,0.08,…)`
   choisit le pixel net ou flou pixel par pixel. Léger, à 300 km/h sous pad seulement. **Non corrigé** : à juger sur le téléphone (`dbgRubans({masque:0})`).
5. **Une frange sombre le long d'un ruban sur une ligne blanche** (petit saut, `petit-saut-v300-AVANT.jpg` image 2, ruban de droite) : vue UNE fois, pas
   retrouvée sur les prises suivantes ni dans les redessins de la même image. Hypothèses : le voile d'encre de jour (`TRJ`) ou la ligne blanche elle-même.
   **Non reproduit, non corrigé.**

Ce qui est JUSTE en vol (relevé sur ~250 images de vol) : le ruban part exactement de son feu (écart tête/feu ≤ 0,1 px CSS à chaque image, au décollage
comme à la pose), jamais de bande retournée (`vrilles` = 0 partout), pas de ruban cassé en zigzag (cassures ≤ 3° hors des crochets de tête), pas de croisement
des deux rubans, pas de claquement au décollage ni à la pose (la largeur et l'éclat suivent `tr.cut` puis `tr.vf`).

## Les correctifs (téléphone PROFILÉ seulement : `RNET.vol` = `rnProfil()` ; `?sans=rubanvol` = avant)
Code : `code/rendu/rubans-nets.js:23-74` (section « LES RUBANS EN VOL »), appliqué dans `code/voitures/atchoum-feu.js:163-167` (vf9, plafonds, fondus),
`:189` (F), `:190-191` (E).
- **`tr.vf`** : 0 au sol, 1 en vol (`mode==='fall'`), glissé en ~0,4 s comme la coupe : le passage sol ↔ vol ne claque pas. Au sol vf = 0 ⇒ chaque nombre est
  celui d'avant (vérifié par l'image, plus bas).
- **(E) `volfin` — LA LARGEUR TENUE À L'ÉCRAN** : en vol les plafonds d'angle descendent vers `RNET.capV` = 0,021 (cœur) / 0,055 (halo) rad × la largeur du
  sillage — le cœur rejoint le plancher B du lot 3 (4,4 texels), donc la même largeur à l'écran de la tête à l'objectif, sans perte d'éclat (le plancher
  ne rabat pas l'énergie à ce niveau) ; le fondu près de l'objectif s'allonge (cœur 3-7,5 m, halo 3,5-9 m, `RNET.fondV`). Un trait de lumière au lieu
  d'un coin. `?sans=volfin`.
- **(F) `volcaisse` — LA CAISSE RESTE LISIBLE** : une rangée (20 premiers mètres) qui est DEVANT toute la boîte de la caisse (≥ 0,5 m), dont le rayon de vue
  traverse la boîte réduite (55 % et 80 %, la tranche basse épargnée) ET qui s'est écartée de son feu dans le plan de la caisse (35 → 80 % de la demi-largeur)
  perd jusqu'à 85 % (`RNET.occK`) de son éclat. Le ruban qui file droit derrière ses feux n'est jamais touché (au banc : 9 rangées voilées sur 40 testées
  pendant le tonneau, 0 en vol droit). `?sans=volcaisse`.
- Crochets : `dbgRubans()` donne `vol, volFin, volCaisse, volSt` ; `dbgRubans({vol:0|1, volFin, volCaisse})` bascule à chaud ; `dbgRubans({releve:1})` le relevé.

## AVANT / APRÈS (même image redessinée : `photos/vol/meme-image-*.jpg`)
- `meme-image-couche-v300-f4-f11.jpg` : image 4 (vol droit, rouge) — les deux barres deviennent deux traits nets qui s'éteignent avant le bas de l'écran ;
  image 11 (tonneau) — le ruban ne s'étale plus en nappe vers l'objectif.
- `meme-image-tonneau-f11-E-F.jpg` : AVANT · sans E · sans F · APRÈS — F retire l'orange du milieu de la carrosserie, E la nappe du bas.
- `meme-image-debout-v300.jpg` (debout, images 5, 14, 18) — le plus parlant : les barres rouges deviennent des traits ; les arcs du tonneau se referment avant
  le pad.
- `meme-image-couche-v600-nitro-salto.jpg` — à 600 au nitro, les « ailes » du salto qui allaient aux bords de l'écran ne restent que près de la caisse.
- `meme-image-jade-nuit-v300.jpg` — de nuit sur Jade, mêmes effets ; le halo reste.
- Films : `film-couche-nuages-v300-tonneau-AVANT.jpg` / `-APRES.jpg`, `film-debout-nuages-v300-AVANT.jpg` / `-APRES.jpg` (12 et 10 images du même vol ;
  ⚠ le ciel diffère d'un chargement à l'autre, la trajectoire est la même : même graine, mêmes pas, mêmes angles relevés).
- Pixels à N1 (×2,4, image 4) : le cœur rouge garde un bord franc de 1-2 texels, la couleur et l'éclat de la tête sont inchangés.

## Coût (mesuré)
`--cout 14` (pendant le tonneau, 2 rubans, Mac émulé) : redessin de tous les rubans **0,013-0,015 ms par image avec le vol, 0,010-0,011 ms sans** (300 redessins,
3 alternances ; la 1re mesure 0,034 ms = mise en route) — +3 µs par image. Aucun appel de dessin, aucun programme, aucune allocation par image (boîte et
vecteurs pré-alloués ; `rnReleve` n'alloue qu'au banc). Au sol : rien (vf = 0, `rnCaisse` pas appelé).

## VÉRIFIÉ (et comment)
- Les défauts 1 et 2 vus au banc, image par image, couché et debout, nuages de jour et Jade de nuit, 300 et 600 km/h ; leur disparition sur LA MÊME image
  redessinée (planches ci-dessus).
- **Le sol ne bouge pas** : course au sol (`--sol 1 --abj 1 --ab sansvol`) : la même image avec et sans `rubanvol` est identique au pixel près sur toute la
  moitié basse de l'écran (là où sont les rubans) ; les seuls pixels différents (7 718, en haut de l'image) sont le décor animé redessiné (feu de pixels, nuages).
- Hors profil : `RNET.vol` = `RNET.p && …` (= `rnProfil()`, le même interrupteur que le lot 3) — ordinateur, iPhone sans modèle, `?sans=profil` : faux, rien
  ne change. Par construction (pas de banc dédié dans ce lot ; `controle.cjs` du lot 3 le couvre pour `RNET.p`).
- Le garage et la boutique (`silApercu`, encre) : `vf` n'est posé que si `RNET.vol && !SIL_ENCRE` et `mode==='fall' && running` ; au garage le mode n'est pas
  `fall` : vf = 0, rien ne change (par le code, pas photographié).
- Aucune exception, aucune panne au banc (seule la ligne `profil` du journal). `node code/assembler.cjs --depuis-morceaux`, `garde-demarrage`, `garde-allege.sh` : OK.

## NON VÉRIFIÉ
- **1000 km/h et plus** : non filmé (600-700 km/h au nitro est le plus vite pris). Le correctif ne dépend pas de la vitesse (angles et distances), mais pas vu.
- Une vraie vrille longue (plusieurs tours) : les figures du banc durent ~0,5 s.
- Le temps GPU (le Mac émule) — le correctif ne touche pas aux pixels dessinés, sauf qu'il en dessine MOINS (rubans plus fins près de l'objectif).
- La loupe (capsules du lot 3) suit toujours l'ancien plafond `SIL.capC` pour son rayon : en vol elle reconstruit un peu plus large que le ruban (pas de frange
  vue ; un gain de pixels possible, voir « proposé »).

## « Retravaille encore les shaders » — ce qui a été regardé
- Le cœur à plateau + bord tenu à 1,5 texel du lot 3, vu à N1 ×2,4 (pixels) : le bord est franc, sans marche ; en vol, avec E, le cœur garde ses 4,4 texels.
  Un anticrénelage analytique par `fwidth` demanderait un programme de plus (MeshBasic retouché) pour un gain que les planches ne montrent pas : le ruban
  est face caméra, sa largeur n'est jamais vue en biais ; le choix de rangée de texture du lot 3 fait déjà ce travail. **Pas appliqué.**
- Au nitro en vol, le cœur et le halo saturent ensemble en orange (le cœur ne se lit plus) : c'est la couleur (`SIL.coeur` 1,3 × l'orange + `hot`) et le halo
  — une affaire de DA, pas de shader : à poser à Sacha (piste : un cœur qui blanchit un peu plus loin que la tête au nitro, `SIL.chaud`).
- `feux-led.js` (lecture) : rien vu à reprendre en vol.

## Proposé, pas fait
- Rayon des capsules de la loupe (`loupe-caisse.js:47`, `lgPt`) : suivre `tr.vf` et `RNET.capV` (moins de pixels reconstruits en vol).
- Le masque NET_NITRO2 « par plaques » sous pad (défaut 4) : seuil plus doux ou mélange au masque seul — à juger d'abord sur le téléphone.

## À JUGER SUR LE 13 Pro
1. Un saut long (AIR TIME) feux rouges : deux traits nets qui s'éteignent avant le bas de l'écran, au lieu de deux barres. `?sans=rubanvol` = avant.
2. Trop fin ou trop court près de l'objectif ? `dbgRubans()` puis `RNET.capV` (0,021 / 0,055) et `RNET.fondV` (3, 7,5, 3,5, 9) à chaud.
3. Un tonneau, une vrille : la caisse reste lisible, le ruban ne « disparaît » pas en entier (`?sans=volcaisse` pour comparer ; `RNET.occK` 0,85).
4. Le décollage et la pose : aucun bout de ruban qui saute (0,4 s de glissé).
5. Au nitro en vol : le cœur se lit-il dans l'orange ? (question de DA ci-dessus)

## La boîte de vol (petite tâche, `code/moteur/enregistreur-perf.js:83-99`)
Chaque course note `prf:{c,q,n,plaf,fps,dpr}` (lu sur PRF, téléphone profilé seulement ; sinon `null`), et suit un changement de réglage en course : `prfN`
(combien), `prfD` (dernier état), `prfC` (40 au plus : [seconde, q 0/1, niveau, plafond ×100, fps, dpr ×100]). Une lecture par seconde, aucune allocation tant
que rien ne change. `outils/banc-perf/analyse-vol.py` : nouvelle table « PAR NIVEAU D'IMAGE » (réglage, niveau, cadence, appareil → secondes, part en vol,
images calculées /s, vrai coût médian, secondes par état thermique) + le nombre de changements en course. Vérifié au banc (`--sol 1 --bv 1 --q perfrec=2`, course de 9,5 s, `dbgPrf('haute')` au milieu, course refermée par `pagehide` et relue dans
`localStorage`) : `prf:{c:1,q:'fast',n:1,plaf:1.25,fps:30,dpr:1.25}`, `prfN:1`, `prfD:{…q:'haute',n:2,plaf:1.5,dpr:1.5}`, `prfC:[7,1,2,150,30,150]` ; la table
`analyse-vol.py` vérifiée sur une course fabriquée (BASSE N1 puis HAUTE N2 à la 12e seconde : les secondes et les états thermiques se rangent sous le bon couple).
Non vérifié : sur une vraie boîte relue par câble (pas de téléphone dans ce lot).
