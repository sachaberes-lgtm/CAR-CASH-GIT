# LOT ombre-image — L'OMBRE ET L'IMAGE RECONSTRUITE (15/11, branche `qa/ombre-image`, worktree `~/cash-car/qualite-ombre-image`)

Sacha : « aller au maximum du couple fluidité / qualité ». Fichiers touchés : `code/rendu/triptyque-bloom.js`, `code/rendu/loupe-caisse.js`,
`code/rendu/soleil-planete.js` (table `PRF.T` : la clé `loupeArete` seulement). `voitures/plaque.js` : lu, pas touché.
Tout est sous `PRF.on` (téléphone profilé). L'ordinateur et tout téléphone hors profil : programmes et comportement de main (vérifié, §5).

Commits (dans l'ordre, chacun poussé par le crochet) :
- `de7e8e185` la loupe hors profil redevient celle de main (défaut n0)
- `3bae3a6b9` l'ombre sans escalier (PCF à 9 prises) + le banc `outils/banc-ombre-image/`
- `1b41a91db` les arêtes de la loupe (N2+) + la trame à l'écran (éteinte)
- `ff28c978b` l'effacement tardif de la scène (éteint, `?plus=effacetard`)

## Le banc (`outils/banc-ombre-image/`)
`banc.cjs` (repris de `banc-qualite/niveaux.cjs`) : Chrome sans fenêtre, muet, iPhone émulé 844×390 DPR 3 tactile, `?appareil=iPhone14,2` (TEL_NATIF vrai, vérifié :
`dbgPrf().src` = « modèle iPhone14,2 »), boucle menée à la main. Nouveauté : des **VUES** de la **MÊME image** (une expression évaluée puis la même image redessinée),
donc l'avant et l'après sont la même image au pixel près. Une vue **témoin** (deux rendus identiques) mesure le bruit du banc : 0 px sur Jade, mais 1 à 27 % des
pixels sur les nuages (les nuages et les débris bougent d'un rendu à l'autre, un rendu sur deux). Les comparaisons d'un rechargement à l'autre ne valent rien
(la caisse n'est pas au même endroit) : c'est pour cela que tout se bascule à chaud.
`lance.sh` attend une place (au plus 3 Chrome de banc sur le Mac) et ferme son Chrome (port 9812) ; `--sources 1` relève la source de chaque programme compilé ;
`compare-sources.py`, `ecart.py`, `ecarts-vues.py`, `planche-trame.py` (contraste étiré). Planches : `passation/qualite/photos/ombre-image/`.

## 1. L'ombre sans escalier — FAIT, ALLUMÉ sous profil (`?sans=ombrepcf` = avant)
- `triptyque-bloom.js` (bloc « L'OMBRE SANS ESCALIER », juste après le choix du filtre) : sous `PRF.on`, en PCF simple et WebGL2, le bloc `SHADOWMAP_TYPE_PCF` de
  `THREE.ShaderChunk.shadowmap_pars_fragment` est remplacé avant toute compilation : boîte de 2 texels centrée sur le point exact, intégrée sur les 9 texels qu'elle
  couvre (poids `[1-g, 1, g]` par axe, `g = fract`), 9 `texelFetch` au lieu de 17 `texture2D`. Bord continu (rampe de 2 texels, même largeur que le noyau de r128),
  mêmes biais, même portée (≤ 1,5 texel : pas plus d'acné). Le PCFSoft de r128 (N3-N4, `PRF.pc`) lit DÉJÀ 16 texels d'un bloc 4×4 avec des poids continus
  (compté dans `vendor/three.min.js` : 4 + 4×2 + 4 ; le « 28 » de la critique coût est faux pour r128) : laissé tel quel.
  Qui le reçoit : la classe 1 en BASSE et en HAUTE (statique N2 → PCF) ; les classes 2-4 sont en PCFSoft (image PC statique), inchangées.
- VÉRIFIÉ (même image, `?ombrebanc=1` : les deux filtres dans le même programme, choisis par le signe de `shadowRadius`, `dbgOmbrePcf(0|1)`) :
  · Jade nuit (cadrage de `niveaux.cjs`, 420 pas) N1 et N2 : les PAVÉS de l'ombre de la caisse (grille de demi-texel) disparaissent, bord lisse → `ombre-jade-nuit-N1-N2.jpg` ;
  · nuages (cadrage par défaut) N2 : les BANDES horizontales dans l'ombre sous la caisse disparaissent, bord plus continu (contraste ×4) → `ombre-nuages-N2-bandes.png`, `ombre-nuages-N2-bord.png` ;
  · contrôle que la bascule agit : le PCF de three au rayon 6 floute franchement (`ombre-nuages-N2-controle-rayon6.jpg`) ;
  · pas d'acné vue : nuages matin, midi, défaut, Jade nuit, Jade midi (N1 et N2) ; l'ombre ne flotte pas (mêmes biais). Écart PCF9 / three : ≤ 10/255 sur le bord, 0 ailleurs.
  · les programmes : 31 programmes portent le nouveau bloc sous profil ; 0 hors profil, ordinateur et PCFSoft (D3 = classe 2).
- NON VÉRIFIÉ : le coût réel (9 `texelFetch` contre 17 `texture2D` au plus proche, pas de dérivées : devrait être moins cher, non mesuré).

## 2. Les arêtes de toute l'image (loupe adaptative) — FAIT, ALLUMÉ en HAUTE seulement (N2-N4), ÉTEINT en BASSE et en N1 (`?sans=loupearete`, `?loupearete=1`)
- (tour 2, arbitrage du pilote) `loupeArete()` = `PRF.q==='haute' && PRF.n>=2 && PRF.T.n[n].loupeArete`, relu à chaque image : suit à chaud le réglage
  (HAUTE ↔ BASSE) et le niveau. BASSE = la fluidité d'abord. Éteint, le programme ne calcule plus la position du texel pour chaque pixel : elle ne l'est que
  dans les deux branches qui la lisent (arêtes allumées, ou disque de la caisse) ; il reste un test d'uniforme de plus que le programme de qualite-appareil.
- `loupe-caisse.js` (bloc « LA LOUPE SOUS PROFIL ») : hors du disque, chaque pixel lit les 4 texels de son interpolation (`texelFetch`), en tire la même valeur
  bilinéaire et l'écart de clarté des 4 ; sous `uAr.y` = 0,1 rien de plus ; fondu jusqu'à `uAr.z` = 0,2 vers la reconstruction orientée (les 8 autres texels),
  piqué 0,5 hors de la caisse (`uAr.w`, contre 1 sur la caisse : le grain du bitume ne grésille pas). Uniforme, pas de `#define` : suit le niveau À CHAUD
  (`PRF.T.n[PRF.n].loupeArete` : N1 0, N2-N4 1). `dbgLoupe({arete, seuil:[a,b], piqueArete, compte:1})`.
- VÉRIFIÉ au banc (même image, bascule `dbgLoupe({arete:0|1})`) :
  | carte | N1 (forcé) cher / dont disque | N2 cher / dont disque | lectures de la passe N2 avant → après |
  |---|---|---|---|
  | nuages matin, au sol | 16,5 % / 12,3 % | 16,1 % / 12,3 % | 7,34 M → 15,66 M |
  | nuages, nitro (défaut) | 14,0 % / 9,3 % | 13,7 % / 9,1 % | 6,20 M → 15,09 M |
  | nuages matin, nitro | 10,0 % / 6,6 % | 9,5 % / 6,6 % | 5,31 M → 14,10 M |
  | Jade nuit, au sol | 18,9 % / 13,1 % | 18,1 % / 13,3 % | 7,68 M → 16,13 M |
  | Jade nuit, nitro | 19,1 % / 12,0 % | 18,2 % / 12,0 % | 7,22 M → 16,16 M |
  | Jade midi, nitro | 16,6 % / 11,7 % | 15,9 % / 11,7 % | 7,11 M → 15,62 M |
  Le chemin cher reste ≤ 20 % partout (disque de la caisse compris ; les arêtes n'en ajoutent que 4-7 %). Les lectures de texture de la passe sont ×2,1-2,7 :
  4 `texelFetch` remplacent 1 lecture filtrée sur tout l'écran (2,96 Mpx). C'est le prix du test (la consigne disait 1 + 4 ; j'en fais 4 : la valeur bilinéaire
  est recalculée à partir des 4 texels, plus précise que le filtre 8 bits). ~9 M lectures de plus par image : estimé 0,2-0,5 ms sur l'A15, NON MESURÉ.
  Planches : `aretes-nuages-N2-arche.jpg` (bord rose, pointillés et rail de l'arche francs), `aretes-nuages-N1-forcees-marquage.jpg` (le marquage blanc passe
  d'une rampe molle à un trait net), `aretes-nuages-N1-forcees-arche.jpg`, `aretes-nuages-N2-route.jpg`, `aretes-nuages-N2-image.jpg` (image entière).
  Le feu du nitro (`aretes-nuages-feu-nitro.jpg`) ne change presque pas : il est déjà dans le disque et les capsules des rubans. Défaut vu : sur une arête déjà
  crénelée par la scène, la reconstruction rend les marches un peu plus nettes (bord de l'arche) — léger, pas d'artefact de halo (borné par les 4 texels).

## 3. La plaque lisible à N1/N2 — NON LIVRÉE
La proposition (homographie de la plaque, `G` = l'étalonnage de l'ACES refait en GLSL, réinjection `G(hi)−G(lo)` masquée) demande de reproduire au bit près, à
l'endroit de la plaque, TOUTE la chaîne de la passe ACES : halo ajouté avant, `uWE`, ACES sur la luminance, contraste `uKC`, saturation, split-tone, grade du
téléphone, `roule`, vignette, lueur et tunnel du nitro, traits de vitesse, FXAA — plus le brouillard de la MeshBasic et l'échantillonnage anisotrope réel de la
scène pour `lo`. Je ne peux pas garantir la même teinte que l'étalonnage ni l'absence de fantôme de lettres quand la plaque est de biais, loin, en vol, en
figure, sous un ruban, une flamme ou de la boue, avec la seule nuit de banc qui reste (la proposition elle-même compte ~1 jour + une matrice de photos).
Ne pas livrer à moitié : la plaque se lit à N3 (`?classe=2`), c'est la piste la plus sûre pour le 13 Pro si Sacha la veut (DPR 2 en HAUTE, à mesurer).

## 4. La trame à la résolution de l'écran — FAIT, ÉTEINTE par défaut (`?trameecran=1` l'allume, `?sans=trameecran`)
- Choix : la cible de la loupe passe en DEMI-FLOTTANT (la même cible, pas une de plus ; seulement si la cible de la scène l'est déjà, le cas des iPhone),
  l'ACES y écrit SANS trame (`uTrame` mis à 0 le temps de l'appel), la loupe ajoute la même trame (même bruit entrelacé, même `uTrame`, même `uJit`) sur
  `gl_FragCoord` de la toile. Sans plus de 8 bits dans la cible intermédiaire c'est impossible : la trame posée après un arrondi 8 bits ne casse pas les
  marches déjà arrondies. Coût : +4 octets par pixel de scène écrits puis relus (+2 à +3 Mo par image).
- VÉRIFIÉ : grain de 1 px d'écran au lieu de blocs de 2-3 px, même amplitude (`trame-jade-nuit-ciel-N2.png`, `trame-nuages-midi-ciel-N2.png`) — MAIS l'écart ne
  se voit qu'en étirant le contraste ×12 : à l'œil, sur la photo, rien. D'où ÉTEINTE par défaut (règle : pas « franchement mieux » au banc).
- NON VÉRIFIÉ : sur l'OLED de nuit (les marches de 1/255 ne passent pas en photo), et le débit de filtrage du RGBA16F de l'A15.

## 5. Relecture, défaut n0 — FAIT (`de7e8e185`)
`correction_precise` appliquée : `RB = rnProfil()` à la construction ; uniformes `uS*`, `lpC` et la ligne `uSn` seulement si `RB` ; `loupeRubans` seulement si
`LOUPE.rb && RNET.long`. VÉRIFIÉ (sources relevées par `gl.shaderSource`, même course) :
- iPhone14,2 `?sans=profil` : 308 programmes, **identiques un à un à origin/main**, programme de la loupe identique au caractère près (2 604 caractères) ;
- iPhone11,2 (hors profil, pas de loupe) : 306 programmes identiques à origin/main ;
- ordinateur 1280×720 : les 329 programmes de main se retrouvent tous à l'identique ; la branche en a 18 de plus, sans aucun bloc de ce lot — sa course n'arrive pas
  au même endroit en 120 pas (caisse à x ≈ −114 contre 0,1 sur main), d'autres décors se compilent. **À voir par l'intégrateur** : sur l'ordinateur, la branche
  `qualite-appareil` ne refait pas la course de main à pas égaux (ce lot n'y est pour rien : `PRF.src` = « ordinateur », rien de ce lot ne s'y installe).
- contrôle statique : la source de la loupe construite avec RB/AR/TE faux = celle de main (`node`, 2 604 = 2 604).

## 6. Code mais éteint — l'effacement tardif (critique coût n3) : FAIT, ÉTEINT (`?plus=effacetard`)
`triptyque-bloom.js`, juste après le RenderPass : plus d'effacement avant `render()` ; `autoClear` vrai pour le fond de three (faux pendant `onBeforeRender` : le ciel
en deux temps garde son propre effacement), puis `invalidateFramebuffer(DEPTH)` de la cible de la scène. VÉRIFIÉ : même image (Jade nuit N1 0 px, N2 38 à 62 px à
≤ 3/255 ; nuages : au niveau du témoin). L'invalidation de la profondeur de la TOILE (après `engVigRender`, `moteur/boucle-6-hud.js`) n'est PAS faite : fichier hors lot.
Critique coût n4 : déjà l'interrupteur `?bloom=plie2d`, rien codé.

## À MESURER SUR LE 13 PRO (branche, économie d'énergie, 30 i/s, ≥ 5 min par essai, batterie débranchée)
Les paramètres s'ajoutent à l'adresse du jeu (ou à `CC_QS` dans l'app). Réglage BASSE = N1, HAUTE = N2. La boîte noire (ligne « profil ») et `dbgPrf().ombre.pcf9`
disent si l'ombre PCF9 est vraiment posée (« PCF9 » ou « PCF de three (raison) »).
1. **L'ombre PCF9** (N1 et N2) : A `?sans=ombrepcf` / B sans rien. Attendu : B ≤ A en ms (9 lectures au lieu de 17) ; regarder le bord de l'ombre de la caisse
   en virage au soleil (nuages, Jade) : plus de pavés. Si B est plus lent ou montre de l'acné au matin : `?sans=ombrepcf` devient le défaut (une ligne).
2. **Les arêtes** (allumées par défaut en HAUTE seulement) : en HAUTE (N2), A `?sans=loupearete` / B sans rien, 9 min chacun : ms par image et chaleur (N2 tient
   9 min à serious : vérifier que B ne passe pas critical ; sinon `loupeArete:0` en N2). En BASSE (N1), A sans rien / B `?loupearete=1` : si B coûte ≤ ~1 ms et
   ne chauffe pas, l'allumer en BASSE aussi demande une décision (retirer `PRF.q==='haute'` dans `loupeArete()`, `loupe-caisse.js`).
3. **La trame à l'écran** (N2, de nuit, Jade nuit `?carte=jade&meteo=nuit` ou nuages `?meteo=nuit`) : A sans rien / B `?trameecran=1`. Regarder les grands dégradés
   du ciel sur l'OLED, luminosité basse. Si B est mieux sans coût visible : l'allumer par défaut (`loupe-caisse.js`, `const TE=`).
4. **L'effacement tardif** (N2) : A sans rien / B `?plus=effacetard`. Image identique attendue ; gain espéré 0,2-0,6 ms et de la bande passante (watts).
5. Toujours `dbgPrf()` / `dbgLoupe()` pour vérifier l'état (`ar`, `arete`, `te`, `cible`, `kq`).

## Non fait / restes
- La plaque (§3). L'invalidation de la toile (§6). Le coût réel de tout ce lot (aucun téléphone cette nuit).
- Le banc photographie au Mac (Chrome sans fenêtre) : les ms n'y valent rien, seulement les images, les comptes et les sources.

## Tour 2 — les corrections du contrôle adverse (`passation/qualite/tour2/controle-ombre-image.md`) et l'arbitrage du pilote
- Défaut 6 (arbitrage) : les arêtes seulement en HAUTE, N2-N4, à chaud (voir §2). `?loupearete=1` force, `?sans=loupearete` coupe (programme de qualite-appareil).
- Défaut 7 / consigne « en N1 ou BASSE, pas d'opérations en plus » : FAIT, la position du texel (textureSize, floor, fract) n'est calculée que dans les branches qui
  la lisent (macro `LPP`). Reste : un test d'uniforme (`uAr.x`) par pixel, et `float wd=w9`. L'ombre PCF9 reste allumée (9 lectures au lieu de 17).
- Défaut 1 : `loupeRubans` est appelée dès que `LOUPE.rb` (plus `&& RNET.long`) : elle remet `uSn` à 0 elle-même quand les rubans longs s'éteignent à chaud.
- Défaut 2 : l'effacement tardif (éteint) ne crée plus rien par image (enveloppe d'`onBeforeRender` et listes d'attachements faites une fois) ; commentaire corrigé
  (« pas au bit près : Jade N2, 62 px à ≤ 3/255 »).
- Défaut 3 : commentaire de `PRF.T.n[1]` corrigé (`fps` et `loupeArete:0` y sont lus).
- Défaut 4 : `const AR` de la loupe renommé `LAR` (ne masque plus `AR` de l'autoroute).
- Défaut 5 : `ombrePcfR` garde la raison quand l'ombre PCF9 n'est pas posée ; `ombreFiltre()` (hissée, sûre avant la ligne d'`OMBRE_PCF9`) ; sous profil une ligne
  « profil · ombre : PCF9 » au chargement dans la boîte noire, « · ombre PCF9 » à chaque ligne « profil » suivante, `dbgPrf().ombre.pcf9`, `dbgGfx().ombreFiltre`,
  `dbgQual().ombreFiltre`, `dbgChaine().ombreFiltre`. Hors profil : aucune ligne de boîte noire (les `dbg*` disent « PCF de three (hors profil) »).
- Contrôles : voir « Vérification du tour 2 » ci-dessous.

### Vérification du tour 2 (reprise après le redémarrage du Mac)
- Assemblage `--depuis-morceaux` : « index.html et les 330 morceaux sont d'accord » ; le grand script (10,6 Mo) passe le contrôle de syntaxe.
- Banc (`banc.cjs`, nuages, 844×390 ×3), le réglage changé À CHAUD dans la même course (`dbgPrf('fast'|'haute')`), `dbgLoupe().arete` relu après chaque image :
  · classe 1 (iPhone14,2) HAUTE → N2, arêtes 1 ; → BASSE N1, 0 ; → HAUTE N2, 1.
  · classe 2 (iPhone15,2) BASSE → N2, arêtes **0** (l'arbitrage) ; → HAUTE N3, 1 ; → BASSE N2, 0.
  · `?loupearete=1` en BASSE N1 : 1, et reste 1 au changement de réglage. `?sans=loupearete` : programme sans arêtes (`ar:false`).
  · ombre : « PCF9 » en classe 1 ; « PCF de three (filtre de three autre que PCF) » en classe 2 (PCFSoft, attendu) ; boîte noire « profil|ombre : … » présente.
  · ordinateur : loupe éteinte, aucune ligne « profil », « PCF de three (hors profil) » ; aucune exception, aucune console d'erreur dans tous les essais.
- NON VÉRIFIÉ au pixel : « arêtes éteintes = image de qualite-appareil ». Deux rendus successifs de la même course diffèrent déjà de ~15 % des pixels au banc
  (nuages, débris), l'A/B photo ne tranche pas. Raisonnement : uAr.x=0 → même lecture bilinéaire, mêmes 12 texels dans le disque, `wd==w9` donc le piqué `uPq`
  comme avant ; le seul changement du tour 2 (macro `LPP`) déplace le calcul de la position du texel sans le changer. GLSL non compilé hors Chrome (pas de téléphone).
