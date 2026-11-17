# CHALEUR — toutes les pistes pour que l'iPhone chauffe moins (17/11, recherche Fable)

Mission de recherche. Aucun code du jeu touché, rien de commité, rien mesuré sur le téléphone.
Condition de référence (Sacha) : **branché + mode économie d'énergie + téléphone chaud**.

Niveaux de preuve :
- **[PROUVÉ]** : une source ou une mesure du téléphone le dit.
- **[PROBABLE]** : déduit de faits prouvés, pas mesuré tel quel.
- **[À TESTER]** : idée, aucun chiffre.

## 0. En bref

On n'est PAS au minimum. On est au minimum sur les **pixels**. Il reste trois postes presque intacts :
1. **les appels de dessin et les sommets** (la radio du téléphone : 45 à 85 % du coût d'une image) ;
2. **la composition du HUD par-dessus la toile** (hors de notre JS, donc hors de nos mesures) ;
3. **le rythme imposé par WebKit en mode économie** (30 images d'écran par seconde : une image en retard coûte 33 ms entières).

Et une limite honnête : en charge, la plus grosse source de chaleur est la charge elle-même (mesuré le 13/11). L'app ne peut pas la couper.
Elle peut seulement baisser sa propre part.

## 1. D'où vient la chaleur aujourd'hui (ce que disent les fichiers)

Sources : `vol-1117-0049.json` (16 courses, 34 min, 13 Pro, N1 BASSE, DPR 1,25) et `boite-noire-1117-0049.txt`.

| Poste | Chiffre | Preuve |
|---|---|---|
| JS du jeu | 8 à 9 ms par image, ≈ 230 ms par seconde de fil principal | [PROUVÉ] analyse-vol, « travail » |
| Image, du début à « la puce a fini » | 26 à 35 ms à fair/serious (champ `R`, « vrai coût »). La période est de 33 ms. | [PROUVÉ] vol, courses de 23 h 30-23 h 44 |
| Image rendue 4 fois de suite (radio) | 6 à 15 ms. Donc la même image coûte 2 à 4 fois plus cher en vrai rythme qu'en rafale. | [PROUVÉ] lignes `radio` |
| Part des pixels dans cette image | grotte 1 ms sur 6 · jade 5 sur 9 · canyon (critical, DPR 1) 5 sur 14 | [PROUVÉ] radio, « témoin » − « sans pixels » |
| Part des appels seuls | 3 à 5 ms (68 à 173 appels) | [PROUVÉ] radio |
| Part des sommets | 1 à 4 ms (157 000 à 605 000 triangles) | [PROUVÉ] radio, « sans pixels » − « appels seuls » |
| Rappels hors boucle (minuteries, toucher) | 8 à 18 ms par seconde | [PROUVÉ] analyse-vol, table M |
| Images par seconde selon la chaleur | nominal 28,8 · fair 28 · serious 24 · critical 18,7 | [PROUVÉ] analyse-vol |
| Gels « hors boucle », processeur normal | 80 à 119 ms, médiane ≈ 90. Sentinelle normale. | [PROUVÉ] vol, table G |
| HUD en CSS | levier `fx0` (sans filtres ni animations) : 29 i/s en vol contre 21 | [PROUVÉ] mémoire chantier-ios-ultime, build 52-55 |
| Charge de la batterie | une course en charge effondre le budget en 1-2 min ; débranché, 30 i/s tenues | [PROUVÉ] banc de chaleur du 13/11 |

Trois lectures (les miennes) :
- **Les pixels ne sont plus le gros poste.** L'écran de course fait 1055 × 487 = 514 000 pixels. Jade envoie 605 000 triangles. Il y a plus de triangles que de pixels. Baisser encore le DPR ne rend presque rien ; baisser les appels et les sommets, si.
- **Rafale contre vrai rythme.** [PROBABLE] Entre deux images le processeur et la puce retombent à basse fréquence (et le mode économie les bride). L'image légère met alors 26-35 ms à sortir. C'est une affaire de rythme autant que de chaleur.
- **Le gel de ≈ 95 ms.** [PROBABLE] En mode économie, WebKit donne 30 images d'écran par seconde (voir 2.A1). Une image qui dépasse 33 ms attend le tic suivant : 66 ms. Deux tics ratés : 100 ms. Les gels « hors boucle, boucle légère » tombent pile là (80-119 ms). Pas prouvé : le mouchard ne note que les intervalles > 80 ms, on ne voit pas le pic à 66.

## 2. Les pistes, classées

### A. Invisible à l'écran, gros gain

**A1. Tenir l'image sous UN tic de 33 ms en mode économie (le rythme, pas la qualité)**
- Quoi : en mode économie, WebKit divise par deux la cadence de `requestAnimationFrame` : 30 par seconde. [PROUVÉ] `AnimationFrameRate.cpp` de WebKit : `halfSpeedThrottlingReasons { LowPowerMode, NonInteractedCrossOriginFrame, VisuallyIdle, AggressiveThermalMitigation }` → 30 i/s. Et `ThermalMitigationNotifier.mm` : la mitigation s'allume à `thermalState >= Serious`.
- Pourquoi ça compte : le jeu n'a plus de marge. À 60 Hz, une image de 35 ms glisse de 17 ms. À 30 Hz imposé, elle glisse de 33 ms. Le « vrai coût » mesuré (26-35 ms) est collé à la limite.
- Gain attendu : [PROBABLE] la majorité des gels « hors boucle » (65 sur 94, 49 sur 85, 106 sur 240 selon la course). Pas de degrés en moins, mais c'est le défaut que Sacha voit.
- Comment : tout ce qui raccourcit l'image de bout en bout (A2, A3, A4). Et envoyer le dessin TÔT : aujourd'hui 8 ms de JS passent avant le premier appel WebGL (`boucle-1` à `boucle-5`, rendu en `code/moteur/boucle-6-hud.js:309`). [À TESTER] Dessiner d'abord l'image avec l'état calculé à l'image d'avant, puis faire la physique : la puce travaille pendant le JS au lieu d'après. Coût : une image de latence d'entrée (33 ms), à juger au pouce.
- Risque : l'ordre « dessin puis physique » touche la sensation de conduite. À garder derrière un `?plus=`.
- Preuve : ajouter au mouchard un histogramme de TOUS les intervalles (cases de 8 ms). On attend des pics à 33 / 66 / 100 en mode économie, 33 / 50 / 67 sans. A/B mode économie coupé, même état thermique.

**A2. Moins d'appels de dessin (fusion, tri, ombre)**
- Quoi : 68 à 173 appels par image. Chaque appel WebGL part dans un autre processus (le « GPU process » de WebKit, `RemoteGraphicsContextGL`) et y est traduit en Metal par ANGLE. [PROUVÉ pour l'architecture] sources WebKit ; [PROUVÉ pour le coût] radio : « appels seuls » 3-5 ms.
- Pourquoi ça chauffe moins : c'est du processeur, dans DEUX processus, à chaque image. Sous bridage ×3 à ×7, c'est le poste qui gonfle le plus.
- Gain attendu : [PROBABLE] −30 à −50 % des appels sur les maps lourdes, soit 1 à 2 ms par image à chaud. Ordre de grandeur, à mesurer.
- Comment : fusionner par matériau les objets fixes d'un même tronçon au pré-bâti (`code/moteur/piste-prebati.js`) ; l'ombre redessine chaque objet qui la porte : limiter les porteurs d'ombre au strict visible ; réunir les programmes voisins (155 à 195 programmes vivants).
- Invisible : oui (même image au bit près si la fusion garde l'ordre).
- Risque : mémoire des tampons fusionnés ; gros travail, map par map.
- Preuve : la radio en pause donne déjà « N appels » et « appels seuls ». Avant / après, même map, même état thermique.

**A3. Des triangles à la mesure des pixels**
- Quoi : 157 000 à 605 000 triangles pour 514 000 pixels. Un triangle plus petit qu'un pixel coûte sans rien montrer.
- Pourquoi : le coût des sommets est de 1 à 4 ms (radio). Il ne baisse PAS quand le DPR baisse. Le gouverneur coupe aujourd'hui la résolution, pas la géométrie.
- Gain attendu : [PROBABLE] 1 à 3 ms par image sur jade, ville, nuages. Rien sur canyon ou grotte (déjà légers).
- Comment : un cran de géométrie lié au DPR dans `PRF` (`code/rendu/palier-appareil.js`, table du profil dans `code/rendu/soleil-planete.js`) : segments des tubes, anneaux, décors lointains, décimés quand DPR ≤ 1,25. À poser au changement de map, jamais en course.
- Invisible : oui si on vise < 1 pixel d'écart de silhouette. À vérifier au banc photo.
- Preuve : radio, « sans pixels » − « appels seuls », avant / après.

**A4. Le HUD : compter et écraser les couches**
- Quoi : le HUD est du DOM posé sur la toile. Chaque couche à part (will-change : 38 lignes, filter : 253 lignes de CSS, backdrop-filter : 22, animations infinies : 285) est mélangée par le système à chaque image de la toile. Ce travail se fait hors de notre processus : nos chronos ne le voient pas.
- Preuve existante : `fx0` (sans filtres ni animations) : 29 i/s contre 21 en vol. [PROUVÉ, builds 52-55]. `ecrLeger` et le HUD calme en retirent déjà une partie.
- Ce qui reste [À TESTER] : le NOMBRE de couches en course, filtres retirés. Un élément en `will-change` ou animé garde sa couche même immobile.
- Gain attendu : inconnu ; c'était le plus gros levier mesuré de tout le chantier, donc à finir.
- Comment : inspecteur Web de Safari branché sur l'app, onglet Couches, en course : viser < 10 couches. Retirer `will-change` au repos. Dessiner les jauges qui bougent à chaque image DANS la toile WebGL (un quad) plutôt qu'en DOM.
- Invisible : oui si on garde le dessin.
- Preuve : A/B sur le banc de chaleur avec un crochet `dbgHud(0)` (`display:none` sur tout le HUD) : temps jusqu'à serious, budget audiomxd. Si l'écart est nul, la piste est close.

**A5. Les maps comme levier thermique (le directeur de maps)**
- Quoi : quand le téléphone est chaud ou en charge, tirer plus souvent les maps froides au prochain portail. Aucune image n'est abîmée : c'est un autre décor.
- Pourquoi : [PROUVÉ] le travail va du simple au double selon la map : canyon 5,7 ms, espace 5,1, grotte 9,1 ; jade 605 000 triangles contre 157 000-292 000. [PROBABLE] Les maps sombres (nuit, grotte, espace) coûtent aussi moins à l'écran OLED, qui consomme selon la lumière émise.
- Gain attendu : [PROBABLE] le plus gros de la liste à effort faible, parce qu'il agit sur tous les postes à la fois.
- Comment : un poids thermique par map dans le tirage (`code/maps/`, biomes et niveaux), lu à l'état thermique et à `__ccBranche`.
- Invisible : oui comme perte de qualité. Mais la variété baisse à chaud : à faire valider par Sacha.
- Preuve : banc de chaleur, une course forcée sur une map froide contre une map chaude, même durée.

### B. Invisible, gain petit (à prendre parce que gratuit)

**B1. Le ciel une image sur N, AVEC reprojection**
- Le ciel est redessiné chaque image en 9 rendus dans 2 cibles (`code/rendu/ciel2.js:84-85`). L'essai « une image sur N » a été abandonné : le ciel tremblait quand la caméra tournait (`ciel2.js:58-61`).
- [À TESTER] Le ciel est à l'infini : le recaler par la rotation de la caméra entre deux mises à jour est exact. Plus de tremblement. Gain : jusqu'à 9 appels et 2 changements de cible une image sur deux.
- Preuve : banc photo (même image avec et sans), puis radio.

**B2. Les minuteries et les réveils**
- 17 `setInterval` vivants en course (5 à 250 ms, d'autres à 100, 140, 200 ms) et 4 minuteries natives qui appellent `evaluateJavaScript` (`JeuViewController.swift:296`, `:494`, `:503`, `:574` : 2 s, 5 s, 1 s, 5 s). [PROUVÉ] 8-18 ms par seconde de rappels hors boucle.
- Gain : ≈ 1 à 2 % du fil principal, plus les réveils du processeur entre deux images. Petit.
- Comment : en course, une seule horloge appelée depuis `loop()`. Côté natif : l'état thermique, la batterie et l'« autre musique » ont déjà des notifications ; les sondages de 1 s et 5 s font doublon.
- Preuve : table M du mouchard (« rappels hors boucle », « intervalles »).

**B3. Le toucher**
- [PROUVÉ] `touchmove` : 68 rappels de plus de 8 ms en une course chaude (940 ms). Les événements arrivent jusqu'à 120 fois par seconde sur le 13 Pro.
- Comment : le rappel ne fait que ranger la position ; le volant se met à jour une fois par image dans `loop()` (`code/moteur/mobile-tactile.js`).
- Preuve : table Q du mouchard.

**B4. Les rAF en trop**
- Le guet des gels de `code/page/debut-corps.html:128-130` tourne un `requestAnimationFrame` à chaque image d'écran, toute la séance, dans tous les builds. À ranger dans `loop()`. Gain minuscule, coût nul.
- Hors mode économie, `loop()` reçoit 60 rappels et en saute un sur deux (`code/moteur/boucle-1.js:24`, `cadSaute`). C'est le mieux possible : aucune API publique ne règle la cadence d'une WKWebView.

**B5. Le son en direct**
- [PROUVÉ] 10 morceaux sont pré-rendus ; NÉNUPHARS a été traité (musique3.md). Reste en direct : le moteur (oscillateurs + filtres, `code/son/graphe-audio.js:336`), les effets, le limiteur.
- [PROBABLE] Le fil audio est temps réel : il tourne même bridé et prend sa part avant le jeu. La boîte noire note des « décrochages audio » à chaud.
- Pistes, par ordre d'effort : (1) le moteur en boucles d'échantillons relues à vitesse variable (un `AudioBufferSource` coûte bien moins qu'une chaîne d'oscillateurs et de filtres) [À TESTER, s'entend peut-être] ; (2) tout déporter dans `AVAudioEngine` natif [À TESTER, gros chantier, gain non chiffré].
- Preuve : banc de chaleur `chaleur=course` avec et sans `chalson`, ET la sentinelle : si le son pèse, la sentinelle baisse quand il est coupé.

**B6. Le format des cibles de rendu**
- La scène et le halo sont en demi-flottant 16 bits (64 bits par pixel, `code/rendu/triptyque-bloom.js:344`). `R11F_G11F_B10F` en fait 32. [À TESTER] Moitié moins de mémoire à écrire et relire par passe.
- Risque : des bandes dans les grands dégradés (c'est pour ça que le 16 bits a été choisi). Ne joue que sur la part pixels (1-5 ms). Petit gain, risque visible : en dernier.

**B7. L'effacement tardif**
- Déjà codé, éteint, jamais mesuré sur le téléphone : `?plus=effacetard` (`triptyque-bloom.js:349`). À passer au banc de chaleur avant d'inventer autre chose.

### C. Touche l'image ou le son (à réserver aux mauvaises conditions)

**C1. Viser le soutenable dès le départ** (c'est le pilote que la session principale conçoit)
- [PROUVÉ] à serious le jeu tourne à 24 i/s, à critical à 18,7, avec 85 à 100 % de secondes abîmées. Le gouverneur coupe après coup.
- Ce que cette recherche ajoute : couper la résolution rend peu (pixels = 15 à 55 % de l'image). Le pilote doit couper d'abord **appels et sommets** (A2, A3) et choisir la **map** (A5).

**C2. Le halo une image sur deux** [À TESTER]
- 2 étages de flou = 6 passes sur 11 environ. Un halo est flou : le mettre à jour à 15 Hz peut ne pas se voir. Risque : une traîne derrière les feux à haute vitesse.

**C3. L'ombre moins souvent** : déjà fait en vol loin des dalles (`code/rendu/nettete-qualite.js:7`). [À TESTER] L'étendre au sol quand le soleil et la caisse bougent peu dans la carte d'ombre.

**C4. L'image plus sombre à chaud** [À TESTER]
- L'écran OLED consomme selon la lumière émise. Baisser l'exposition de 10 % à critical (`acesPass.uniforms.uExposure`, `code/rendu/etalonnage-da.js`) baisse la chaleur de l'écran. Visible si on compare, pas en jouant. Gain non chiffré.

**C5. Une image sur deux avec reprojection de toute la scène** [À TESTER, risqué]
- À 1 000 km/h la route proche se déforme trop pour être recalée. Chantier lourd, défauts probables. À ne tenter qu'après A et B.

## 3. Fausses bonnes idées

- **Baisser encore le DPR.** Les pixels ne sont plus le poste (voir 1). Le passage 1,25 → 1,00 à critical n'a pas ramené la cadence (18,7 i/s).
- **`powerPreference: 'low-power'`.** L'iPhone n'a qu'une puce graphique. [PROBABLE] sans effet. Le crochet existe (`?gpupref=low-power`, `palier-appareil.js:179`) : un essai au banc de chaleur clôt la question.
- **Régler la cadence de la WKWebView en natif (`preferredFrameRateRange`).** Le `CADisplayLink` appartient à WebKit. Pas d'API publique. Une API privée = refus de l'App Store.
- **`antialias`, `preserveDrawingBuffer`, `alpha`, pochoir.** Déjà au mieux sur téléphone : anticrénelage coupé sous `ALLEGE`, pas de `preserveDrawingBuffer`, toile opaque, pochoir coupé (`palier-appareil.js:179-182`). Vue web opaque (`JeuViewController.swift:81`).
- **Textures compressées (ASTC).** La plupart des textures sont peintes au lancement (toiles 2D) : pas compressibles sans tout refaire. Et elles ne jouent que sur la part pixels.
- **`mediump` partout.** [NON VÉRIFIÉ] Rien ne dit qu'ANGLE sur Metal en tire des calculs plus courts. Risque d'artefacts de précision sur une piste de plusieurs kilomètres. À ne pas faire sans mesure.
- **OffscreenCanvas dans un Worker pour le jeu.** La sonde `sondeoc` attend toujours le verdict de l'iPhone (« dessiné » n'est pas « affiché »). Et ça déplace le travail, ça ne le réduit pas.
- **Le ramasse-miettes.** Écarté par le témoin (16 gels sur 94 à moins de 300 ms d'un passage).
- **Demander à Sacha de débrancher.** Refusé par lui. Reste vrai comme fait : la charge est la première source de chaleur.

## 4. Ce que je n'ai PAS pu vérifier

- Rien n'a été mesuré sur le téléphone ni au banc (interdit dans cette mission).
- Que les gels de 80-119 ms sont bien des tics de 33 ms ratés : cohérent, pas prouvé (il manque l'histogramme complet).
- Ce que le mode économie retire exactement au processeur et à la puce : Apple ne le chiffre pas. Je n'ai trouvé aucune source sûre.
- Ce que fait `ThermalMitigation` seul dans WebKit (hors cadence) : pas lu jusqu'au bout. La moitié de cadence « agressive » dépend d'un réglage (`respondToThermalPressureAggressively`) dont je ne connais pas la valeur sur iOS.
- Le nombre réel de couches du HUD en course, et le coût de leur mélange par le système.
- La part du son dans la chaleur.
- Le gain OLED d'une image plus sombre.
- Les gains chiffrés de A2 et A3 sont des ordres de grandeur tirés de la radio, pas des mesures d'un correctif.

## 5. Comment prouver, pour toutes les pistes

1. **Banc de chaleur** (`outils/banc-chaleur/essai.sh`) : même scénario, téléphone parti du même état (budget ≥ 380), en charge et en mode économie puisque c'est la référence. Mesure : secondes jusqu'à serious, puis jusqu'à critical ; budget audiomxd.
2. **Radio en pause** : appels, « appels seuls », « sans pixels », témoin. Elle isole A2, A3, B1, B6.
3. **Mouchard** : table G (gels, sentinelle), M (rappels hors boucle), Q (rappels lourds). À compléter par l'histogramme de tous les intervalles (A1).
4. Deux essais identiques diffèrent de ×2 (noté le 13/11) : trois passes par bras, alternées A-B-A-B.

## Sources

- WebKit, `Source/WebCore/platform/graphics/AnimationFrameRate.cpp` et `.h` (branche main) : https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/graphics/AnimationFrameRate.cpp
- WebKit, `Source/WebCore/platform/cocoa/ThermalMitigationNotifier.mm` : https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/cocoa/ThermalMitigationNotifier.mm
- WebKit, `Source/WebCore/page/Page.cpp` (lignes 570-576, 3099-3120) : https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/Page.cpp
- WebKit bug 215745, rAF à 30 i/s en mode économie, voulu : https://bugs.webkit.org/show_bug.cgi?id=215745
- WebKit bug 168837, l'origine (2017) : https://bugs.webkit.org/show_bug.cgi?id=168837
- WebKit, `RemoteGraphicsContextGL` (WebGL dans le processus GPU) : https://webkit.googlesource.com/WebKit/+/a1b821bd3095346d5e11279026fa60f518e18271/Source/WebKit/GPUProcess/graphics/RemoteGraphicsContextGL.h
- Données : `~/cash-car/ios-ultime-mesures/vol/vol-1117-0049.json`, `~/cash-car/ios-ultime-mesures/boite-noire-1117-0049.txt`
