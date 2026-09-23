# CASH CAR — guide projet pour Claude Code

## Le jeu
Runner arcade 3D dans le ciel (Three.js r128). On conduit sur un ruban de route suspendu,
on saute, vrille, rebondit sur les tranches, traverse des nuages, ramasse pièces et nitro.
Une seule vie. **15 voitures**, UNE SILHOUETTE CHACUNE (roster ramené de 24 à 15 le 2026-08-05 :
10 caisses sortaient du même moule `rocket`, 20 paires dépassaient 90 % de recouvrement — mieux vaut
15 formes qu'on reconnaît que 24 variantes d'une seule). Déblocage par conditions persistantes.
Langue : français. Ton du flavour : fun, arrogant, cash, speed-addict, second degré.

## Structure
- `index.html` — TOUT le jeu (HTML + CSS + JS dans un seul fichier, ~3200 lignes). C'est voulu : ne pas le découper sans demande explicite.
- `assets/audio/announcer/*.mp3` — 9 voix d'annonceur. Le TITRE du fichier = la condition de déclenchement.
- **LES ATELIERS** — pages autonomes de revue, à servir en HTTP (elles LISENT `index.html`, elles n'en recopient rien) : `moteurs.html` (les 30 moteurs) · **`voitures.html` — L'ÉTAL DES VOITURES** (la gamme, une silhouette par caisse) · `atelier-rouille.html` (les 3 propositions du moteur rouillé + les régimes) · **`atelier-fond.html` — LE FOND DU NIVEAU** (le ciel réactif, sur le VRAI morceau, plein écran).

## Lancer / tester
- Serveur local : `python -m http.server 8000` (ou `npx serve`) puis http://localhost:8000 — nécessaire pour que les mp3 chargent proprement.
- Vérif syntaxe rapide : extraire le JS entre `<script>` et `</script>` puis `node --check`.
- Déploiement : zipper `index.html` + `assets/` et glisser le zip sur Netlify Drop.
- Pas de build, pas de dépendances, pas de framework. Three.js vient du CDN cloudflare (r128 — NE PAS changer de version sans tester : l'API a bougé après r128).

## Architecture (repères dans index.html)
- **Ciel/décor — VICE CITY NUIT (rose/violet SOMBRE)** : skyDome shader (indigo profond au zénith → violet → grande bande ROSE Miami assombrie → corail → ambre au ras du couchant ; ÉTOILES scintillantes par cellules d'azimut — 64/tour, zéro couture ; LUNE pâle à l'opposé du soleil ; GUIRLANDE néon rose↔cyan sur l'horizon loin du soleil = la ville sous la mer de nuages), soleil « 1.61 » (halo contenu, échelle 940), horizonGlow rosé, RAYS, pigeons. ÉCLAIRAGE NUIT : hemi rose-mauve/indigo `0xba86b6`/`0x18162e` baissé à **.40**, soleil **BRAISE ROUGE-CORAIL `0xff6a3c`** 1.45 (« red hour » : lumière rasante rouge sombre sur le bitume, ombres longues inchangées), fill bleu néon `0x4f74e8` .24 par dessous, kick MAGENTA `0xff3d9e` .20. `POST_EXPO` **0.71** + `brightness .97` : le sol s'éteint pour que les lumières de la caisse y VIVENT. Fog `0x5e3254` (contre-jour corail, nuage rose-lavande). PISTE : bitume NUIT VIOLET `0x2b2937`, spéculaire BRAISE CUIVRÉE `0x8a524a` shininess 40 (2026-07-20 : le mauve `0x9a5568`/58 — bleu > vert — teintait TOUS les reflets en MAGENTA : feux arrière roses, soleil pincé en point plastique ; la braise garde le chaud, chaque lumière garde SA teinte, le lobe élargi nappe au lieu de piquer), BANDES NÉON ROSE `0xf24aa0` + NAPPE additive `fog:false` qui saigne vers l'intérieur (1 mesh/face, dans `trackMeshes`), ligne centrale sodium doré. **LUMIÈRES DE CAISSE** (toutes à l'init → zéro recompilation) : `headSpot` = SPOT phares (suit le nez via `getWorldDirection`, 1.2, éteint en 'boom') + **`nitroLight`** = PointLight du REFLET NITRO/BOOST derrière l'échappement (repère caisse via `hsF`/`hsU` — marche sous la dalle) : orange `0xff7a24` nitro / bleu `0x5b7dff` réserve bleue / or `0xffb040` pad turbo, intensité lissée + tremblement 43 Hz, pilotée par `nitroOn`/`nitroBlue`/`boost`. Halos phares élargis, NÉON SOUS CAISSE magenta (`userData.noShadow` → exclu du castShadow, sinon carré d'ombre). **ÉCHAPPEMENT v2 (refonte totale)** : (1) **PLUME DE RÉACTEUR** (`JETS`, `jetTex`/`jetGeo`/`jetShellM`/`jetCoreM`/`jetGlowM`) — cône additif par pot (coquille colorée + cœur blanc + halo tuyère), texture dégradée avec ANNEAUX DE CHOC bakés, construit dans buildCar (listes vidées à chaque rebuild), animé chaque frame (`JETS.k` lissé, flicker 57 Hz, long à la nitro) ; (2) **TRAÎNÉE RUBAN** (`mkTrail`/`trailStep`, `trailL`/`trailR`, `TRAIL_N=26`) — 2 rubans additifs à buffers FIXES accrochés aux tuyères (historique de positions, largeur orientée face caméra, fondu au carré de l'âge, couleurs franches orange/bleu/or) avec **FONDU PRÈS CAMÉRA** (<3-7 m → 0 : la caméra de poursuite roule DANS le sillage, sans ça = voile blanc plein écran) et reset d'historique au réveil (pas de trait fantôme) ; (3) **BRAISES fines** — particules d'échappement à vie COURTE (.05-.14 s) et taille plafonnée (les sprites géants qui restaient plantés dans le monde et que la caméra TRAVERSAIT, c'est fini), exSmoke discret. `nitroLight` portée 18 (une flaque, pas une rivière spéculaire) — au REPOS elle passe rouge feux arrière profond .68 (reflet permanent, la nuit sert à ça), nitro orange 1.6 / réserve bleue 2.1 / pad or .9 ; + **`trailLight`** (PointLight 26) : le reflet de la traînée glisse 9 m derrière, couleur du ruban. **MEUTE ÉQUIPÉE PAREIL** : halos phares/feux (`pcHeadM`/`pcTailM`), plume réacteur bleue (2 cônes `jetGeo`/caisse, `b.mesh.jets`), **7 rubans bleus `botTrails`** (larges ×1.7, sans limite de distance, reset survStart/endGame), **`botJetLight`** (1 PointLight bleue → l'échappement du boosteur le plus proche), cerveau nitro débridé (`appBoost` .45 base, gate .35, durée .7-1.9 s — la ressource régule, zéro triche). envTex indigo→rose sombre→ambre + strips rose/cyan. Nuages VOL : `uSunCol` rose-doré tamisé (1.95,.92,.62), `uSkyCol` violet, `uGroundCol` prune, `uAmb` .46. GRADE : SAT 1.40, VIVID .74, WB magenta (1.02,.985,1.03), ombres bleu-violet, hautes lumières or rosé, bloom .58/.52 seuil .92, vignette pourpre .52.
- **LE FOND DU NIVEAU 1 — le décor JOUE la musique (2026-08-08, blocs `<<<CIEL>>>` + `<<<FOND>>>`)** : le pari Geometry Dash / Super Hexagon dans un jeu où l'on VISE une réception. **QUATRE COUCHES peintes DANS le shader du skyDome** (pas un calque DOM : le ciel EST le fond, et le bloom l'attrape) — (1) **LA ROUE** : 16 quartiers alternés qui tournent autour du zénith, la teinte d'accent contre sa complémentaire ; (2) **LES ONDES** : chaque coup de grosse caisse part du zénith et DÉFERLE jusqu'à l'horizon (4 emplacements, `uRingR`/`uRingA` en vec4 — zéro boucle GLSL) ; (3) **LA LUEUR** : deux écharpes sinusoïdales lentes, la part qui VIT quand le morceau respire ; (4) **LES PILIERS** : un égaliseur de 26 barreaux qui monte de l'horizon. **TOUT LE CHAMP VISUEL (2026-08-08, v2)** : la 1re version sanctuarisait la bande d'horizon (`smoothstep(-.02,.15,y)`) — le décor n'existait donc qu'AU-DESSUS de la route, et en conduite, où l'on regarde droit devant, on ne voyait presque rien. Le masque ne coupe plus, il DOSE (`uLvl*(.62+.38*smoothstep(-.45,.12,y))`) : le bas du ciel joue à 62 %, le haut à 100 %. La route reste lisible parce qu'elle est un objet 3D DEVANT le dôme — elle se découpe sur le fond au lieu d'être noyée. **MESURÉ : 100 % de couverture** dans les 4 directions (devant / haut / bas / dos au soleil). **DEUX COUCHES DE PLUS** : (5) **LA CONTRE-ROUE** — 7 quartiers, sens inverse, vitesse 1,7× : deux comptes premiers entre eux et deux vitesses irrationnelles l'une par rapport à l'autre, donc **un moiré qui ne se répète jamais** (c'est ça, le génératif : pas du bruit, deux règles simples qui ne retombent pas en phase) ; (6) **LE GRÉSIL / LES AIGUS** — `uHi` alimenté par les 45 % supérieurs des bins, trame fine re-tirée **21 fois par seconde** (`floor(uTime*21.)`) : un effet qui se DÉPLACE lirait comme du mouvement, un effet qui se RETIRE lit comme du souffle. ⚠ les aigus montent (dt*24) et retombent (dt*11) beaucoup plus vite que l'énergie moyenne (dt*8) — les lisser comme elle les transformerait en nappe continue et on perdrait le GRAIN, seule chose qu'on est venu chercher. **L'ONDE DE COULEUR** (`hueRot`, `uWave`/`uHueAmp`) — le grand effet du niveau : ⚠ **placée TOUT À LA FIN du shader**, et c'est le point — dans le bloc des couches elle n'aurait teinté que ce que le décor AJOUTE ; à cet endroit elle emporte le dégradé du couchant, le soleil, la lune, les étoiles, la ville. ⚠ **c'est une ROTATION de teinte (Rodrigues autour de l'axe des gris), pas un remplacement** : repeindre donnerait un aplat mort, faire tourner garde le modelé et les dégradés. Deux fronts qui se croisent (sens, vitesses et fréquences différents) → l'onde n'a jamais deux fois la même forme. ⚠ `lvlKick` donne de la VITESSE au front, il ne saute jamais la phase (un saut ferait clignoter tout le ciel en une frame = défaut de rendu, pas effet) ; ⚠ l'amplitude `hueA` FUIT en permanence (−.30/s), sinon elle s'empile frappe après frappe et le ciel finit en arc-en-ciel permanent — spectaculaire dix secondes, puis illisible. **LES ASTRES PRENNENT LA MUSIQUE** : le **« 1.61 » passe de 940 à 2050 d'échelle** (~15° → **~31°, 43 % de la hauteur d'écran**) et GONFLE jusqu'à ×1,30 sur la frappe en rougissant ; le **LIMBE de la Terre** s'embrase de .10 à .52 et prend l'accent de zone. ⚠ **on ne touche PAS au globe** : la doc de `planetGroup` dit que le grade final brûle tout ce qui est clair et que la planète est rentrée volontairement sombre — c'est une seconde coquille additive (`userData.halo`) qui prend la musique. Un halo qui gonfle se lit comme une atmosphère ; un globe qui blanchit se lit comme un bug. ⚠ le soleil se pilote en **échelle + `material.color`, JAMAIS en opacité** : l'opacité appartient aux biomes (`bioApply`) et se la disputer le ferait clignoter à chaque portail. ⚠ **`lvlTick` CALCULE `sunK`/`planetK`, le jeu et l'atelier les APPLIQUENT** — le bloc balisé n'a pas le droit de connaître `sunSprite` ni `planetGroup`. **L'AMORTISSEMENT ET L'ÉPAULE** — la mesure qui a tout changé : en ajoutant les couches directement dans `col`, une frappe pleine cramait **13 à 22 % de l'écran en BLANC PUR**, or un blanc pur n'a plus de teinte : l'onde de couleur s'effaçait exactement au moment où elle devait crier. Deux remèdes, pas une baisse d'amplitude — (a) les couches s'accumulent dans un `fx` ajouté en `fx/(1+fx*.55)` (apport plafonné à ~1,8 quoi qu'il arrive) ; (b) une **ÉPAULE** finale `ex/(1+ex*4.55)` au-dessus de .78, **asymptotique à 1, jamais atteinte** — ⚠ ce n'est PAS un `min()` : un écrêtage met les trois canaux à égalité, donc du blanc, donc plus de teinte du tout ; l'épaule les garde ordonnés et distincts. **MESURÉ après remède : 0 % de blanc pur** dans les 4 directions et les 3 régimes (contre 8-22 %), max 243-248, **saturation encore à 0,27-0,29 sur la frappe**, luminance moyenne qui DOUBLE au coup (70-97 au repos → 129-190). ⚠ **`uLvl` reste l'interrupteur général** : tout est sous `if(uLvl>.001)` — à 0, **1 sous-pixel de différence à ±1/255** avec la version d'avant sur 4 orientations (le dither) ; à 1, 267 168 sous-pixels changent. ⚠ **DEUX GARDE-FOUS D'ENTRÉE dans `lvlTick`, trouvés en atelier et non en jeu** : (1) **`dt` borné à ZÉRO** — un horodatage rAF antérieur au précédent (réveil d'onglet, premier tour, pas-à-pas) donne un `dt` négatif qui INVERSE toutes les décroissances : mesuré, la frappe montait à **14,19 au lieu de ≤1** et le soleil gonflait à **×3,37** ; (2) **entrées pincées à [0,1] et sorties d'échelle plafonnées à 1,6** — le bloc a deux appelants et rend des facteurs d'ÉCHELLE ; vérifié qu'une entrée empoisonnée (`dt=-3`, `beat=14.19`, `hi=-5`, `boost=NaN`, `surge=1e6`) ne produit **aucune valeur non finie** et que le régime normal repart derrière. **LE MÉTRONOME (`BCLK`)** — ⚠ le cœur du truc : brancher un décor DIRECTEMENT sur `MUSIC_BEAT` donne un fond qui SURSAUTE, qui n'existe que sur les coups et qui MEURT sur un pont sans grosse caisse. Ici les onsets servent à ESTIMER le tempo et RECALER la phase, jamais à piloter : entre deux coups le décor continue tout seul. ⚠ **repliement d'octave** (`r>1.55`/`r<.68`) obligatoire — sans lui un passage en double-croches double le tempo estimé et le décor part au galop pour ne plus revenir ; ⚠ **période réfractaire .20 s** — une frappe s'étale sur plusieurs frames et compterait pour cinq coups ; ⚠ **recalage de phase DOUX** (30-65 %) — un saut se voit comme une saccade ; ⚠ **4 coups de suite à côté = c'est NOUS qui avions tort**, on adopte le nouveau tempo. MESURÉ : injecté 129,3 BPM → verrouillé **129 BPM en ~12 temps**, confiance 1,0, **erreur de phase 0,04 temps**. ⚠ **LA BASE DE TEMPS EST `dt`** (`BCLK.t`), ni `performance.now()` ni `AC.currentTime` : le temps audio se FIGE quand le contexte est suspendu (bouton SON) et le métronome repartirait en vrille au rallumage — et le temps mur rend le système intestable (un onglet caché bride les timers). **LA BASCULE** (Geometry Dash) : une fois par PHRASE (8 temps, pas par temps sinon c'est un gyrophare) les deux teintes s'échangent ET la roue change de sens. **L'ACCENT vient des rails** (`NEON_RAILS[0].userData.base`) : le ciel et la piste sont toujours de la même couleur, la règle n'est écrite qu'une fois ; la complémentaire est à teinte +0,47 — assez loin pour que la bascule SE VOIE, pas assez pour renier la zone. ⚠ **RÈGLE DES BLOCS BALISÉS** : `<<<FOND>>>` ne dépend QUE de `THREE` + `skyU`, `<<<CIEL>>>` (le dôme + le soleil « 1.61 » + la nappe d'horizon + la Terre) QUE de `THREE` + `document` + `scene` (vérifié par scan d'identifiants libres) — tout entre par le paramètre `S` de `lvlTick(dt,S)` ; y glisser une globale du jeu casse `atelier-fond.html` EN SILENCE. Hooks : **`dbgLvl()`** (présence, BPM verrouillé, confiance, phase de mesure, roue, bascule, ondes vivantes, accent), `dbgLvl(1)` force le décor à fond sans musique, **`dbgBeat(v)`** injecte un coup par le VRAI chemin (`BCLK.force` → détection d'onset), et `dbgStep(n,ms)` avance le temps simulé : les trois ensemble rejouent une séquence de coups à l'identique, ce qu'aucun test en temps réel ne sait faire ici.
- **Nuages — MESH SIMPLES OPAQUES (refonte 2026-07-20 ; le raymarch volumétrique est SUPPRIMÉ)** (`CLOUD_MAT`, `CLOUD_SPH`, `mergeSpheres`, `mkCloud`, `buildClouds`, `updateClouds`) : **décision de Sacha après ~35 requêtes de correctifs ratés sur le clignotement.** ⚠ NE PAS réintroduire de shader, de transparence ni de raymarch ici sans demande explicite. **LA CAUSE, enfin trouvée — par la VIDÉO, pas par le code** : le shader basculait l'alpha à `1.0` D'UN COUP quand la caméra entrait dans la matière (`if(tHit<=t0+0.002)a=1.0`) → **plein écran blanchi sur UNE frame**, puis retour. Mesuré sur la capture de Sacha : **10 frames blanchies sur 411, soit un flash toutes les ~1,3 s**. Ce n'était pas un réglage mais une marche d'escalier : aucun paramètre ne pouvait la corriger. **CE QUI AVAIT ÉTÉ ÉLIMINÉ AVANT (mesuré, ne pas y retourner)** : détection d'iso-surface (0 saut sur 47 400 déplacements caméra, rayons tangents, titan à 4 pas compris) · tri des transparents (0 inversion sur 1 600 frames, shake 1,0) · culling/pop (compte dessiné constant) · bascules matF/matB (0) · shader déterministe (`ign()` n'a **pas** d'entrée temps — le commentaire « grain animé » était FAUX). **LEÇON DE MÉTHODE** : 5 rondes ont échoué en corrigeant à l'aveugle ; ce qui a débloqué, c'est une VIDÉO + différence image à image (repérage automatique des pics de luminosité). Pour tout bug visuel : **exiger une capture AVANT de toucher au code** — le pane headless gèle le rAF et ne rend aucun pixel, je ne peux rien juger à l'œil. **LE SYSTÈME ACTUEL** : un nuage = ses métaballes (`mkBlobs`) transformées en **sphères réelles FUSIONNÉES par `mergeSpheres` en UNE géométrie** (~1 200 sommets, ~2 250 tri/nuage) → **un seul draw call**, matériau **partagé** `CLOUD_MAT` (MeshLambert, `side:DoubleSide`, `transparent:false`, `depthWrite:true`). Conséquence structurelle : plus de tri de transparents, plus de `gl_FragDepth`, plus de `discard`, plus d'uniformes par frame → **le clignotement est devenu impossible, pas « corrigé »**. On TRAVERSE toujours (aucune collision ; DoubleSide → dedans on voit la paroi, c'est le white-out). ⚠ chaque nuage a sa PROPRE géométrie : `disposeClouds` DOIT la libérer (sinon fuite VRAM à chaque portail) ; le matériau, lui, est partagé et ne se dispose jamais. BIOMES : `bioApply` teinte `CLOUD_MAT.color` depuis `volSun` (crème le soir, bleu la nuit) et l'éclairage hemi/soleil fait le reste — les 10 ambiances marchent sans un seul uniforme. **ZÉRO PARTICULE à la traversée** (demande explicite) : les anciennes `wisps`/`sparkGold`/`puffs` ont sauté ; il reste le son (`noiseBurst`), le voile `#cloudFx`, le fog et le surf d'airtime (`c.refT`). **FORMES v2 (2026-07-20, « les nuages sont vides ») — `mkBlobs` réécrit** : ⚠ le défaut était la CONNEXITÉ. Un bourgeon de cumulus pouvait être posé à **0,99** du corps pour une somme de rayons de **0,72** → boule TOTALEMENT DÉTACHÉE ; le nuage se lisait comme des saucisses flottantes et paraissait creux. Désormais toute boule fille naît via `grow(mère,…)` à une distance `(r_mère+r_fille)×0.50` → recouvrement franc, **connexité VÉRIFIÉE à 100 % sur 2 000 tirages** (400 par famille, parcours de graphe). Silhouettes refaites d'après le ciel réel, avec un 5e champ par boule = **aplatissement vertical** (sans lui tout est sphérique = bonbons) : **CUMULONIMBUS** (`giant`) = socle lourd → colonne qui PENCHE (cisaillement) et bourgeonne → **ENCLUME** étalée au sommet (13-19 boules — la silhouette la plus lisible du ciel) · **CUMULUS** = **BASE PLATE** au niveau de condensation + 2 générations de chou-fleur (4-12) · **STRATUS** (`sea`) = nappe CHAÎNÉE continue (8) · **CIRRUS** (`veil`) = une seule traînée étirée dans le vent (6). DISTRIBUTION : les coussins d'airtime passent de r 16-36 à **34-62** (à 16 c'était du confetti à côté de tours de 400) et la ouate mi-distance de 55-115 à **95-180**, les deux un peu moins nombreux. MESURÉ après refonte : 105 nuages, **309 760 triangles**, rayon médian **159** (q25 111 / q75 217 / max 850), compte visible **constant** sur 199 frames, **5,6 ms/frame contre 12,7 avant (≈ ×2,3 de FPS)**. Le repli sprites (`mkCloudSprite`) et tout le bloc raymarch (216 lignes, texture 3D Perlin-Worley, `dbgFlicker`/`dbgVOL`/`dbgCloud`/`dbgCloudMat`, paliers `stepBase`) sont SUPPRIMÉS — un seul chemin de nuage désormais. DONNÉES de placement INCHANGÉES : familles gameplay (bancs sur route, champs de vol, tours `giant`, `sea`/`deco`/`veil`, `titan`) et les 6 couches de la MÉTÉO (rues sous le vent, électrons libres, banc haut, océan d'undercast, massifs, titans + LE COLOSSE via `pickAz`) — voir `buildClouds`. `cloudInS` pilote toujours voile/fog/sons feutrés.
- **BIOMES — LE CYCLE DU CIEL** (`BIOMES`, `BIO`, `bioGo/bioStep/bioApply`, `paintEnv`) : **10 ambiances**, LERPÉES ~4 s au portail (uniforms/couleurs UNIQUEMENT, zéro recompilation) — le tour du cadran dans l'ordre : **`aube`** (L'HEURE BLEUE, avant que le soleil perce : indigo froid, une estafilade magenta à l'horizon, étoiles .95 + lune 1.15 qui s'éteignent, ville encore allumée — c'est BLEU et ça respire, à l'opposé de la nuit noire), **`lever`** (LEVER DE SOLEIL : LE grand écart chaud/froid du jeu — soleil corail 1.46 rasant + remplissage CYAN franc .31, c'est ce contraste qui fait la beauté d'un vrai lever), **`matin`** (MATIN CLAIR : le plus NET — cyan franc, soleil blanc-doré, zéro rose ; sert de respiration au milieu de tout ce violet), **`midi`** (PLEIN MIDI : le plus LUMINEUX — cobalt profond, soleil quasi blanc, ombres dures, fog far 3500 ; sat volontairement BASSE 1.16, à cette heure c'est la lumière qui claque pas la teinte), `aprem` (fin d'après-midi lumineuse : hemi .88/expo 1.0), `golden` (golden hour ambre, soleil 1.55 rasant — vitrine du menu et valeur d'init/repli), `couchant` (début de soirée rose/corail), `soir` (soirée Vice bleu profond + néons), `nuit` (NUIT NOIRE : étoiles ×1.9, lune 1.7, phares rois), plus **`orage`** (ORAGE VIOLET — le seul qui soit une MÉTÉO et pas une heure : tout est assombri, plafond violet de contusion, brume qui se referme à 1900, SAUF une fente d'or brûlant sous les nuages + kick violet électrique ; sat poussée au MAX du jeu 1.54, c'est elle qui empêche le sombre de virer au gris). Échelle de clarté (`expo×hemiI`, vérifiée sans collision) : nuit .21 < orage .32 < aube .34 < soir .36 < couchant .42 < lever .54 < golden .56 < aprem .78 < matin .89 < midi .98. ⚠ **les couleurs de LUMIÈRE (`hemiS/hemiG/sunC/fillC/kickC/fog`) doivent rester dans 0..1** — au-dessus, `Color.getHexString()` DÉBORDE (un bleu à 1.02 ressortait en `#d3ec04`, vert) ; seuls `volSun/volSky/volGnd` (uniformes du raymarch) dépassent 1 volontairement, c'est du HDR assumé. ⚠ `bioLerp` parcourt TOUTES les clés numériques : un biome à qui il manque un champ garderait la valeur du précédent en plein fondu — copier le gabarit ENTIER (29 champs). SÉLECTION (dans newTrack) : tirage ALÉATOIRE parmi les **9 du jour** (`BIO_DAY`, jamais deux fois la même de suite — `Math.random()`, PAS le rnd seedé de piste) au départ ET à chaque portail ; au 3e portail de la MÊME partie (`runStats.zones>=3`, ++ avant newTrack, reset par resetGame) la NUIT tombe pour de bon (+ message « LA NUIT TOMBE… », capturé AVANT bioGo qui écrase BIO.name). `zoneArch` n'influence PLUS les biomes (gardé pour debug). Chaque biome pilote : GRADE DU CIEL (uniforms `uSkyMul/uSkyLift/uSunTint/uSunHalo/uCity/uStars/uMoon` injectés dans le shader skyDome — identité neutre par défaut = rendu d'origine au pixel), fog (`FOG_N/FOG_F` devenus `let`, RGB de `FOG_BASE` muté), les 4 lumières (hemi/sun/fill/kick — hemi désormais NOMMÉE), uniforms nuages VOL (`uSunCol/uSkyCol/uGroundCol/uAmb`), `POST_EXPO` (let, relu chaque frame par le contre-jour) + `uSat` ACES, sprites soleil « 1.61 »/horizonGlow/RAYS (opacité ×sunHalo — la nuit le soleil devient fantôme), et `envTex` REPEINT via `paintEnv` (canvases gardés dans `envCvs`). `bioStep(dt)` tourne en tête de loop (hors gate de sim : le ciel vit même au menu). Hook console : `dbgBio('nuit',durée)`. ⚠ bioApply est la SEULE écriture de sun/hemi/fill/kick/uSat — ne pas ajouter d'autre écrivain sans passer par les biomes.
- **Piste** (`genCtrl`, `buildTrack`, `frameAt`) : Catmull-Rom + repères T/N/B. Deux faces roulables (`side` ±1). **ADN DE PISTE (genCtrl v2)** : chaque zone tire un ARCHÉTYPE (`AR` : FLOW sweepers / TECH épingles-chicanes / ALPIN crêtes-plongeons / VOLTIGE loops-hélices / GRAND8 mixte) = poids des **13 motifs** + LATÉRALITÉ (`hand`/`sgn()` : piste qui spirale à gauche, à droite ou équilibrée) + humeur verticale `vt` + SIGNATURE DE FIN par archétype (double loop, triple chicane, méga-plongeon…). **NIVEAU → PRATICABLE** : `LV=1+min(2.6,level*.13)` élargit TOUS les rayons (`RS=AR.rs*LV`), évase les épingles (`180/√(LV·.7)`), allonge départ/respirations/droites et la zone (`LEN=7200×(1+min(1.1,level*.07))`) ; gros motifs plafonnés en longueur d'arc (~58000/R) pour ne pas manger la zone ; loops en douceur (`LOOPS=1+(LV-1)*.35`). **ACCENT DE ZONE** : `accC` tiré parmi 6 néons (rose/cyan/ambre/menthe/violet/corail) teinte bandes + nappe — chaque portail change la couleur de la nuit. **PLUS DE VIRAGE, PLUS EMMÊLÉ, MOINS RÉPÉTITIF (2026-07-20)** — trois causes traitées, mesurées : (1) **la spirale était BRIDÉE** : `aS=Math.min(360+rnd()*220,52000/RSp)` — le plafond gagnait quasiment toujours, donc la « spirale géante » ne faisait en vrai que **218-371°**, à peine un virage (« je ne vois jamais de spirale »). Débridée : **540-900°**, 1,5 à 2,5 tours pleins. (2) **2 motifs neufs** — `11` **LE TIRE-BOUCHON** (rayon serré `(44+24)*RS`, 1,5 à 2,6 tours, chute de 52-80 PAR TOUR pour que l'étage d'en dessous passe sous la caisse ; le nb de tours baisse quand `LV` élargit les rayons, sinon il mange la zone) et `12` **L'ENTRELACS** (une hélice dans un sens puis l'autre AUSSITÔT, sans respiration : le ruban se croise avec lui-même). (3) **HUMEUR DE ZONE** : les poids étaient FIXES par archétype → deux FLOW sortaient statistiquement jumelles. Ils sont désormais secoués à chaque zone (`W=AR.w.map(v=>v*(0.35+rnd()*1.7))`) — le caractère tient (un 0 reste un 0), l'obsession change. + RESPIRATION plus rare et plus courte (`.6→.42`) : le liant entre motifs n'est plus toujours le même bout de droite. MESURÉ sur 8 zones : **11,1 tours de cap par zone**, **446°/1000 u**, **32 % de droit seulement**, et un indice d'enchevêtrement (points éloignés en arc-length mais à <130 u dans l'espace) qui va de **6 à 4162 selon la zone** — c'est cette VARIANCE qui tue l'effet « toujours pareil ». Jouabilité vérifiée en A/B au même pilote automatique : **10 % de zone parcourue contre 8 % avant** → aucune régression. ATTENTION : `rnd` (mulberry32 seedé) est consommé séquentiellement dans buildTrack — insérer/retirer des appels `rnd()` change toute la génération en aval.
- **LE GAP CATAPULTE — motif rare à VRAI TROU** (`gapRun` dans genCtrl · `GAPMARK`/`HOLES`/`RAMPS` · `holeAtS`/`holeAtI`, 2026-07-20) : 11e motif du générateur, au même rang que vague/plongeon/droite. Recette COLINÉAIRE (la route d'en face est droit devant — condition non négociable pour se lire à 1200 km/h) : **très longue ligne droite** (320-410, presque plate, couloir gardé NU) → pad turbo OPTIONNEL à 95 m (choix risque/récompense, pas un péage) → rampe + **LÈVRE** franche → **LE VIDE** → route d'en face. **Le trou est RÉEL** : `buildTrack` calcule `HOLES` (index/arc-length des deux bords) puis SAUTE ces segments dans TOUS les maillages (surface, tranches, néons, nappe, ligne centrale) et ferme la coupe par un liseré rouge d'alerte ; `tryLand` ET le viseur `landMark` excluent ces index (`holeAtI`) → impossible de se poser sur du vide ; en drive, `holeAtS(s)` déclenche `startFall` (la dalle a disparu = on tombe, sans fond ni filet). La courbe, elle, continue (invisible) : elle sert de repère au bord d'en face. **Calibrage MESURÉ, pas deviné** : la catapulte porte ~118 u à 150 km/h et ~220 u à 300 km/h (portée = `v0x·v0y/g`, g=33 ; ⚠ INERTIE RÉELLE (2026-07-20) : `startFall` ne plafonne PLUS la vitesse totale (l'ancien cap 95/`capV` 130 est SUPPRIMÉ — éjecté à 300 km/h on vole à 300 km/h, la portée est ∝ vitesse nativement) ; seule la composante VERTICALE est bornée à 70 (crêtes ALPIN endgame : pas d'orbite, jauge des 6 s tenable, vol balistique max ≈ 4,2 s-sim)). Trou = 86 u au niveau 0 → ~150 u dans l'endgame (mesuré 87-100 au niv. 0) : franchi avec marge dès qu'on arrive lancé, manqué si on traîne. Variantes `v` : 0 propre · 1 **arrivée SURÉLEVÉE** (+14→24, force l'engagement/nitro) · 2 **DOUBLE GAP** (2e cassure courte, `level>=8` seulement). RARETÉ (mesurée sur 70 zones) : **43 % des zones** — ALPIN 100 % (sa SIGNATURE DE FIN se clôt sur le vide), FLOW 43 %, VOLTIGE 29 %, GRAND8 27 %, **TECH 0 %** (poids 0 : on est en ville) ; plafond dur `gapN` 1/zone (2 dès `level>=8`) + latence `approx-lastGap>2600`. Décollage : `RAMPS` déclenche `startFall(6.6,1.14)` si >110 km/h, arme `gapArmed=v+1` APRÈS l'appel (startFall le remet à 0), `rampCd` empêche de se relancer en retombant dessus. Récompense : **GAP FRANCHI** (+16/20/26 chainVal, +0.6 mult, verdict tier 3) dans le verdict d'atterrissage. Bots : `holeAtS(rel)` les fait décoller avec un `vy` calé sur la largeur du trou, et `botBoom` s'ils retombent dedans. **Bugs corrigés le 2026-07-20** (tous nés du trou) : (1) `holeAtI` bornait `i0`/`i1` de façon INCLUSIVE alors que ce sont le dernier et le premier point de bitume → deux bandes mortes où l'on ne pouvait pas se poser, donc un atterrissage pile sur le bord d'en face échouait et la caisse repartait dans le vide (bornes désormais STRICTES) ; (2) `spawnPickups` ignorait les trous → pièces et orbes **suspendues en plein ciel** au-dessus du vide (skip via `holeAtS(ss)`, tirages consommés AVANT pour ne pas décaler le flux rnd) ; (3) l'ombre de contact de vol se dessinait au-dessus du vide, flottant à l'altitude du bord (gate `lastNearH2<560` = distance HORIZONTALE² au bitume réel). ⚠ le balisage (tapis de chevrons `rampTex`, lèvre `rampLipMat`, anneau de visée) ne consomme **AUCUN** `rnd()` — sinon toute la génération en aval se décale ; idem pour les filtres `inGap` des plots/huile/dos-d'âne (tirages consommés AVANT le filtre).
- **Voiture — LA GAMME DES 15 (`CARS`, `SHAPES`, `buildCar`, refonte 2026-08-05)** : 15 caisses, **UNE SILHOUETTE PAR CAISSE**. ⚠ **LA RÈGLE FONDATRICE** : `shape` est DÉCLARÉ dans la fiche (`CARS[i].shape`), jamais déduit — le constructeur ne devine plus, il crie en console et se replie sur `gt` si le gabarit est inconnu (c'est un filet pour voir l'oubli, pas une valeur par défaut confortable). **POURQUOI** : l'ancienne gamme de 24 tirait son gabarit d'une échelle de niveaux (`lvl>=14?'rocket':lvl>=11?'proto':…`), donc 10 caisses partageaient `rocket` et 4 `gt` → **20 paires au-dessus de 90 % de recouvrement de silhouette, pire paire à 99,0 %** (ANTIMATIÈRE × ÉCLIPSE VII : deux caisses séparées par une teinte). Même erreur, même remède que les 30 moteurs. **RÉSULTAT MESURÉ** (bouton DOUBLONS de `voitures.html`) : **0 paire ≥ 90 %, 0 paire ≥ 80 %, pire cas 78,0 %** sur 105 paires. Le levier le plus discriminant s'est révélé être la **LONGUEUR** : les six caisses basses sont étalées de 4,05 à 5,35 m (deux passes de réglage ont été nécessaires — raccourcir l'hypercar l'avait collée au tuner, allonger le fastback l'avait collé à la muscle : chaque correction se re-mesure). **LA GAMME** : `epave` LA HONTE · `kei` CAISSE À SAVON (cube, galerie de toit) · `break` PAPA MOBILE (toit droit, barres) · `pickup` LE CONTREMAÎTRE (benne ouverte, arceau, pare-buffle) · `muscle` GROS BLOC · `berline` DIVA BLANCHE (calandre droite, emblème) · `gt` SCALPEL VERT (fastback) · `wedge` VEUVE NOIRE (coin, écopes) · `hyper` EL PATRON (arche de toit, fer à cheval) · `formula` FORMULE OR · `lemans` LE MANS 24 (dérive + aileron de porte-avions) · `proto` COMÈTE · **+ LES 3 FANTASTIQUES** `tuner` ACIDE, `poptart` CHAT POP-TART, `requin` REQUIN. **`SHAPES`** est un registre : chaque gabarit reçoit la boîte à outils `K` (`box/prof/cyl/sph/con` + matériaux) et rend une **FICHE D'ANCRAGES** (`hl`/`tl` phares et feux, `wr`/`wx`/`wz`/`wy` roues, `glowX`/`glowY`, et les accessoires voulus : `sp` aileron générique, `skirt`, `split`, `doors`, `slats`, `wings`) — c'est ce qui a supprimé la forêt de `shape==='rocket'?…:…` de l'ancien code. ⚠ **ANCRES INTOUCHABLES** : les pots et les plumes JETS restent à `±w*.22, y0+.08, -l/2-.14/-.28` QUEL QUE SOIT le gabarit — les traînées-rubans et `nitroLight` s'y accrochent en dur (`hsF`/`hsU`/`hsR`). ⚠ **`wings:'props'`** (REQUIN) remplace les panneaux de mini-ailes par quatre bras d'hélices sur les MÊMES pivots `carWingL`/`carWingR` : la boucle du jeu les déploie en vol sans une ligne de code en plus. Hooks console : `dbgCar(i)`, `dbgView(a,d,h)`, `dbgScene()`.
- **LE LOFT — un corps ANIMAL, pas un tas de boules (`loftBody`, `finShape`, 2026-08-05)** : des anneaux le long d'une épine, un rayon PROFILÉ point par point (`[[u,r],…]`, u=0 au nez), et le CONTRE-OMBRAGE peint DANS les sommets (donc gratuit : ni texture, ni deuxième matériau). ⚠ **POURQUOI** : les caisses fantastiques étaient montées en sphères aplaties empilées — ça donne un galet, jamais un être vivant. Un animal se lit à sa LIGNE (un rayon qui enfle au thorax puis s'étrangle au pédoncule) et à son contre-ombrage. La recette est rapatriée de `dauphins.html`, écrite pour la figure LE DAUPHIN, plutôt que réapprochée. `finShape` complète : une nageoire est une LAME falciforme extrudée, jamais un cône. ⚠ **DEUX PIÈGES MESURÉS** : (1) `arch`/`droop` sont en unités de PROFIL (rayon max = 1) car le loft est mis à l'échelle APRÈS — les donner en mètres faisait un poisson de 2 m de haut sur une caisse d'1 m ; (2) l'objet d'options avait `belly` en double (l'aplatissement du ventre ET sa couleur) : la seconde clé gagnait, le bas de chaque anneau se multipliait par 16 055 551 et la caisse mesurait 16 000 km — écran vide. Les clés sont désormais `flat` et `bel`.
- **MATIÈRES GÉNÉRATIVES DES CAISSES (`MATV`)** — jumelles de `MAT9` côté moteurs, pour les 3 fantastiques : `carbone` (sergé 2/2 tissé par le code — le reflet doit COURIR le long des mèches, d'où l'alternance de sens d'une tuile à l'autre ; sans elle, du damier gris), `stickers` (des blocs et des chevrons, jamais du texte : à 60 px de haut en course, ce qu'on reconnaît d'une caisse kittée c'est le RYTHME), `flake` (peinture à paillettes : ce qui vend le vernis tuning n'est pas la couleur mais le SCINTILLEMENT — fond quasi blanc pour se laisser teindre par `material.color`), `icing`/`crust` (la pop-tart : ⚠ le glaçage NE VA PAS jusqu'au bord, c'est le liseré de pâte nue qui fait lire « pâtisserie » et non « rectangle rose » ; le pavé est un `BoxGeometry` à 6 matériaux, ordre `+X,-X,+Y,-Y,+Z,-Z` → glaçage en index 2), `skin` (peau de requin : le CONTRE-OMBRAGE sombre-dessus/blanc-dessous fait tout le travail, les denticules empêchent le plastique de jouet). ⚠ calculées UNE fois et cachées dans `MATV._c`. ⚠ **Piège rencontré** : ces peaux pastel ressortaient BLANCHES dans l'étal et on a d'abord cru à une texture manquante — c'était la lumière de studio héritée des moteurs (hemi 1,05 + clé 1,55, taillée pour de l'alu sombre) qui CRAMAIT tout. Un atelier de revue n'a pas le droit de mentir sur une couleur : `voitures.html` est descendu à hemi .62 / clé 1.02, et le banc hors écran partage la MÊME fonction `studio()`.
- **SIGNATURE D'ÉCHAPPEMENT PAR CAISSE (`spec.fx`, 2026-08-05)** — ⚠ **C'EST UN EFFET DE NITRO, PAS UNE PEINTURE** (décision du user) : au filage toutes les caisses gardent la plume orange commune ; c'est en APPUYANT que la caisse montre sa couleur. Une signature toujours affichée ne récompense plus rien. Champs : `fx.jet`/`fx.core` (plume), `fx.trail` (RGB du ruban, en linéaire — les valeurs dépassent 1, c'est de l'additif), `fx.light` (le reflet `nitroLight` au sol), `fx.rainbow`. ⚠ **LA RÉSERVE BLEUE GAGNE TOUJOURS** : `nitroBlue` est un SIGNAL de jeu (« tu tapes dans la réserve »), aucune identité de caisse n'a le droit de l'effacer — plume, ruban, reflet ET arc-en-ciel s'effacent tous en réserve, sinon le joueur reçoit deux messages contradictoires. Les trois fantastiques : ACIDE vert `0x7cff28`, CHAT POP-TART rose `0xff64d2` + arc-en-ciel, REQUIN turquoise `0x7ff0d8` (⚠ turquoise et non bleu, précisément pour ne pas se confondre avec l'indigo de la réserve). Hook console **`dbgJet()`** : caisse, plume, cœur, ruban, arc-en-ciel, hélices, reflet — la seule façon de vérifier une signature sans regarder l'écran.
- **L'ARC-EN-CIEL DU CHAT POP-TART (`rainbow`, `rainbowStep`, `RB_BANDS`)** — un ruban à part, DÉCLARÉ HORS du bloc `<<<VOITURES>>>` (il a besoin de `scene`). ⚠ **POURQUOI PAS LES RUBANS NORMAUX** : `mkTrail` n'a que DEUX sommets en travers, donc le GPU interpole en ligne droite et un rouge→violet passe par un mauve boueux au lieu de traverser jaune, vert et cyan. ⚠ **ET POURQUOI DEUX SOMMETS PAR BANDE** (`RB_ROWS = 6 bandes × 2`) : avec UNE rangée par couleur on obtient un beau dégradé continu — qui n'est pas un arc-en-ciel de Nyan Cat. Il faut six barres FRANCHES, donc chaque rangée est doublée (haut et bas de bande portent la MÊME couleur) et l'index ne referme que l'INTÉRIEUR des bandes. Deux autres choix qui font tout : **largeur CONSTANTE** (c'est une bannière, pas une flamme — l'effiler lui donnait une pointe de comète) et une **ONDULATION** sinusoïdale le long du ruban, portée par sa normale `rbU`, qui transforme une planche plate en tissu qui claque. Même historique de positions, même largeur orientée caméra, même fondu près caméra que les rubans (sans lui : voile plein écran, la caméra de poursuite roule dedans). Il suit `trailK` — il s'allume à la nitro et s'éteint en douceur, comme n'importe quel ruban. Invisible et gratuit pour les 14 autres caisses.
- **L'EAU DU REQUIN (`spray`, `foam`, `fx.spray`)** — ce qui sépare de l'eau du feu n'est PAS la couleur, c'est le COMPORTEMENT : la gerbe s'évase (composante latérale franche à l'émission), elle RETOMBE (`updatePool(spray,dt,9)` — gravité positive, là où les braises ont une gravité négative et montent) et elle meurt vite. La teinte suit (plume `0x86f2ff`, cœur BLANC pur) et la peau passe en mouillé (shininess 150, reflectivity .66 — un requin qui sort de l'eau BRILLE). Comme toutes les signatures : sous poussée seulement, jamais en réserve bleue.
- **CE QUI SE DÉPLOIE EN VOL (`carWingL/R`, `carProps`, `carFins`)** — une SEULE variable, `wingT` (0 au sol, 1 en vol), ouvre toute la caisse : les bras d'hélices sortent, les pales tournent plus vite, l'aileron dorsal se dresse. ⚠ **`carFins` se vide EN TÊTE de `buildCar`**, avec `JETS`, et surtout PAS dans le bloc des mini-ailes : celui-ci tourne APRÈS le gabarit, donc y remettre le reset effaçait l'aileron que le gabarit venait d'enregistrer — il ne se déployait jamais, sans la moindre erreur. **Règle générale : tout ce qu'un GABARIT peut remplir doit être vidé avant qu'il ne tourne.** ⚠ chaque aileron est un PIVOT posé à sa base dont on étire le Y : `finShape` centre sa géométrie, donc un `scale.y` sur le mesh le ferait pousser des deux côtés, moitié dans la carrosserie.
- **LES HÉLICES DU REQUIN (`carProps`, `propSpin`)** — `buildCar` recense les pales, la boucle les tourne à `3.5+wingT*36` rad/s : **une seule variable** (`wingT`, déjà le taux de déploiement des bras) pilote la SORTIE et le RÉGIME. Elles brassent au ralenti au sol, s'emballent en vol. L'étal les fait tourner aussi (bouton **✈ EN VOL** : `buildCar` pose les ailes à plat, c'est la boucle du JEU qui les rétracte — sans ce bouton les bras d'hélices n'existaient nulle part hors partie).
- **DÉBLOCAGE — 12 DE PROGRESSION + 3 PREMIUM (`CAR_UNLOCK`)** : 11 conditions persistantes (cash ×3, eng ×2, tricks, bumps, gaps, chain, kmh, surv pour COMÈTE) + les 3 fantastiques en `{k:'prem',v:0}`. ⚠ `carStat('prem')` vaut 0 et le seuil est 0 → elles sont OUVERTES d'entrée (demande explicite du user : « je veux les posséder direct »). Le jour où elles deviennent payantes, il n'y a qu'un `0` à passer à `1` ici et un `ex.prem` à poser à l'achat — aucun autre code à toucher. Les indices en dur de l'ère 24 (`Math.min(23,…)`, `dbgCar` clamp, `setBestChip`) sont passés à `CARS.length-1`. ⚠ **BUG CORRIGÉ AU PASSAGE** : `san()` bornait `equipped` à `bestCar`. Ce clamp datait de l'époque où les caisses se gagnaient DANS L'ORDRE (`bestCar` était alors un plafond valable) ; depuis les conditions individuelles — et surtout depuis que les PREMIUM sont ouvertes alors que `bestCar` vaut encore 0 — il RAMENAIT à la cabossée, à chaque chargement, une caisse parfaitement légitime. On ne borne plus ici que la FORME (un index qui existe) ; le vrai garde-fou est `equippedCar()`, qui teste `carUnlocked()`.
- **L'ÉTAL DES VOITURES (`voitures.html`, 2026-08-05)** — l'atelier de la gamme, jumeau de `moteurs.html`. Tout ce qui fabrique une caisse (RIM_U/rimify, textures de halo, plume de réacteur, JETS/CARPOOL, `carProfile`, `buildCar`) vit désormais dans le bloc balisé `/* <<<VOITURES>>> … <<<FIN VOITURES>>> */` ; l'étal l'exécute tel quel avec `CARS` et `CAR_UNLOCK`. ⚠ **RÈGLE : ce bloc ne doit dépendre QUE de `THREE` · `envTex` · `CARS` · `carGroup`** — y glisser une référence à un global du jeu (`scene`, `level`, `SND`…) casse l'étal en silence (vérifiable par un scan des identifiants libres). `buildCar` pose `carGroup.userData.shape/lvl` : l'étal LIT le gabarit là où il est décidé au lieu de recopier la règle des seuils. QUATRE VUES : showroom 3D (lumière de studio neutre, cadrage recalculé à chaque redimensionnement — ⚠ un `aspect` NaN sur un panneau à 0×0 gelait la caméra pour de bon), **planche contact** des 24 en 4/3, **SILHOUETTES** (profil noir sur papier, caméra ORTHO et cadre COMMUN mesuré sur les 24 : hors-tout 4,38→6,74 m, hauteur 1,10→1,42 m — donc une caisse courte SE VOIT courte ; ⚠ les bornes d'une ortho sont en repère CAMÉRA, `top=CY+HH` décalait le cadre de CY une seconde fois et coupait les roues), et **DOUBLONS** = le recouvrement (intersection/union) des masques de profil, 276 paires classées. ⚠ deux détails sans lesquels tout est faux : les FLAQUES au sol (`userData.noShadow`) et les halos sprites sont éteints (le faisceau de phares mesure 4,6 longueurs de voiture et noierait silhouette et cadrage), et les MINI-AILES sont remises à l'état SOL (`scale.x` .05 — `buildCar` les pose à plat, c'est la boucle du jeu qui les rétracte). **PREMIER VERDICT MESURÉ (2026-08-05)** : gabarits `boxy` 4 · `gt` 4 · `muscle` 2 · `formula` 1 · `proto` 3 · **`rocket` 10** ; **20 paires au-dessus de 90 % de recouvrement, 53 au-dessus de 80 %** — ANTIMATIÈRE × ÉCLIPSE VII **99,0 %**, ONDE DE CHOC × RAZOR-9 98,6 %, TÊTE CHERCHEUSE × PLASMA ROYAL 98,4 %, COMÈTE × ONDE DE CHOC 97,5 %. Le « certaines se ressemblent trop » du backlog a maintenant un chiffre et un coupable : tout l'endgame est une seule silhouette redécorée. **SUITE (2026-08-05)** : le roster passe de 24 à **15 caisses, une SILHOUETTE CHACUNE** (`SHAPES`, 15 gabarits nommés : epave · kei · break · pickup · muscle · berline · gt · wedge · hyper · formula · lemans · proto · tuner · poptart · requin). ⚠ **RÈGLE : deux caisses ne partagent JAMAIS un gabarit**, et le constructeur REFUSE de deviner — pas de `shape`, pas de caisse. C'est le même remède que pour les moteurs : le choix par SEUILS de niveau était la cause, pas la finition.
- **Modes** : `mode` = 'drive' | 'fall' | 'boom'. Physique conduite dans la boucle, vol dans le bloc 'fall', `tryLand(dt)` gère atterrissage, BUMPS (rebond tranche) et SNAKE LOOP v2 (passer SOUS la route en vol puis se poser sur la face de DÉPART — voir Chaîne de figures). **`AIR_RATE` — TEMPO ∝ VITESSE (2026-07-20, dosage doux sur base V1)** : `=1` jusqu'à 450 km/h affichés (identique V1), puis startFall le monte de `+(kmh−450)/1800` avec CAP **1.35** (loin du 2.3 de l'ère SPD=.25 qui était une COMPENSATION) — l'endgame traverse sa phase aérienne un peu plus vite au lieu de flotter ; nitro aérien façon Rocket League : poussée **52/70** (était 34/49), portance ↑ **9/13** (était 6/9) — en l'air on SCULPTE sa trajectoire ; le redressement ↓ 10/14 inchangé. L'ancienne version DYNAMIQUE (`clamp(.95+kmhAffichés/420*.55,1,2.3)` posée par startFall) COMPENSAIT le `SPD=.25` en compressant le temps de vol ; comme `SPD` est revenu à .5 (valeur V1), la compensation n'a plus lieu d'être et `AIR_RATE=1` redonne PILE la parabole ET le rythme réel des sauts/réceptions de la V1 (net = `fallVel*AIR_RATE*SPD = fallVel*.5`). `startFall` reste le SEUL écrivain d'`AIR_RATE` (figé au décollage, jamais en cours de vol). Dans le bloc 'fall' un `dtF=dt*AIR_RATE` remplace `dt` pour TOUTES les intégrations de vol (gravité `FALL_G`, position, `fallT`/`nitroAirT`, lacet/vrille, poussée nitro, compteur dauphin, surf de nuage). La parabole DANS L'ESPACE est identique (viseur d'atterrissage + seuils de figures + paiements INCHANGÉS car `fallT` suit le temps-sim), mais on flotte moins longtemps. **JAUGE D'AIRTIME EN TEMPS RÉEL (`fallTR`)** : le camembert des 6 s (`#airPie`) et l'explosion comptent sur `fallTR+=dt` (secondes VÉCUES — sinon le chrono filait à ×1,6) ; `fallT` (temps-sim) reste la référence des figures/paiements ; les remboursements sont miroités (nuage `rf/AIR_RATE`, bump demi-jauge, `pwrAirT` reset les deux). ⚠ `tryLand` DOIT recevoir `dtF` (pas `dt`) sinon le balayage anti-tunnel couvre une distance trop courte → traversée de dalle à grande vitesse. Collisions BALAYÉES anti-tunnel : `prevH/prevL` (position de la frame d'avant dans le repère de la dalle) rattrapent dessus/dessous/paroi percés en une frame à grande vitesse. **PLONGEON FATAL v2 (`trackMinY`)** : la mort en vol = passer sous le point le plus BAS de toute la piste −120 m (`trackMinY`, calculé dans buildTrack) — l'ancienne référence `lastNearY-200` (route la plus proche en 3D) tuait injustement en plein plongeon légitime de crête ALPIN (elle référençait la crête au-dessus). `lastNearY` reste pour le télégraphe d'atterrissage. **`SPD=0.5` — FUSION V1 (2026-07-19)** : RESTAURÉ à la valeur de la V1. Le `÷2→0.25` du 2026-07-16 (« trop rapide dès le début ») avait tué le fun nerveux/arcade que le user préférait dans la V1 → verdict tranché pour la V1. SPD scale TOUT — avance joueur/bots, position de chute, viseur ET compteur affiché ; c'est LE bouton de vitesse globale. ⚠ Les km/h AFFICHÉS ont donc DOUBLÉ vs l'ère 0.25 : les systèmes de sensation RELATIFS (via `vmaxShow()` : shake `spdN`, part relative du FOV, speed lines) s'ajustent seuls ; les seuils ABSOLUS ont été mis à l'échelle ×2 (calm9 350/900→700/1800, sifflement `spd3-280/2200`→`-560/4400`, vent, backfire 140→280, compteur rouge 460→920, `speedFx`, tiers de streaks, teinte de traînée). ⚠ les VIEUX records localStorage sont sur l'échelle 0.25 (moitié moins) — proposer un reset au user. Le viseur d'atterrissage intègre comme la vraie chute (pas de position ×SPD). Hooks debug : `dbgState()` (état interne lecture seule — dont `lat`/`side`/`gapArmed`/`fallT`), `dbgGap()` (les TROUS de la zone : largeur réelle bord à bord, dénivelé, pente à la lèvre, index/arc-length ; `dbgGap(true)` téléporte 260 m avant la 1re lèvre), **`dbgStep(n,ms)`** (fait avancer la boucle À LA MAIN : en headless l'onglet est « caché », rAF est suspendu et le jeu ne bouge plus — sans ça aucune mécanique n'est testable hors écran ; ⚠ chaque appel empile un rAF, éviter les très longues séries), `window.__loopErr` (dernière exception avalée par le try/catch de loop), capteur `addEventListener('error')` → `document.title='ERR:…'` (les erreurs d'init échappent aux consoles headless).
- **LES SAMPLES D'ÉVÉNEMENT (`FX_WOW`, `FX_ARGENT`, `fxPlay`, 2026-08-18)** : même machinerie que les sons de mort (plafond de durée, fondu, gate `SND.sfx`, tirage sans doublon consécutif) mais pour le STYLE et l'ARGENT. ⚠ **CE QUI TUE CE GENRE DE SON, C'EST LA RÉPÉTITION** — un « WOW » sur chaque combo devient une alarme en trois minutes. Deux garde-fous, jamais un seul : un **SEUIL** (`fxWow` exige 5 maillons — en dessous ce n'est pas un exploit) ET une **PÉRIODE RÉFRACTAIRE** (12 s pour le WOW, 6 s pour l'argent). Le silence est ce qui rend sa valeur au son. L'argent (9 samples) ne tombe que sur un encaissement `>= denom()*25` : sur chaque pose, même minuscule, il deviendrait un tic. MESURÉ : 200 tirages → **9/9 sons sortent, 0 doublon consécutif**, répartition 15-29. ⚠ `fxTick` s'égrène **hors du gate de simulation** : un réfractaire figé en pause rejouerait le son au retour. ⚠ **le hook s'appelle `dbgSfx`, PAS `dbgFx`** — ce nom était déjà pris par les effets visuels plus bas dans le fichier, et il écrasait le nouveau EN SILENCE (on lisait l'état du post-traitement en croyant lire celui des sons).
- **AUDIT DU 2026-08-18 — DEUX VRAIS BUGS TROUVÉS** : (1) **LE DÉCOLLAGE FAISAIT TRAVERSER LA DALLE**, et ce n'était pas un problème de collision mais de REPÈRE. `startFall` décolle le long de la NORMALE de la surface (retournée quand `side<0`), mais `heistFire` faisait ensuite `fallVel.y=Math.max(fallVel.y,36)` — une garantie exprimée en **Y MONDE**. Sur la face du dessous, la normale pointe vers le bas : forcer +36 en Y renvoyait donc la caisse DROIT DANS LE BITUME. Idem dans un looping, où la normale devient horizontale puis s'inverse. Corrigé en complétant la vitesse le long de `F.n` (`if(vN<34)fallVel.addScaledVector(F.n,34-vN)`) — l'intention d'origine est préservée, dans le bon repère. MESURÉ : face dessus `vy=+35,7` · face dessous **`vy=−48,2`**, les deux à 42 sur la normale, les deux s'éloignant du bitume. ⚠ `F` doit rester la frame posée par `startFall` : ne rien intercaler entre les deux. (2) **L'AURA SE FARMAIT** — trois trous : `pureLvl` montait sans borne (`150+pureLvl*100` : tenir 60 s donnait 30 salves dont la dernière à 3 150), le combo de figures n'avait **aucune décote de redite** là où l'argent en a une (`.6^n`) donc refaire la même vrille en boucle escaladait indéfiniment, et le **PARC FREESTYLE** — qui n'a ni mort ni chute fatale — payait comme une vraie partie. Corrigés : palier PURE SPEED plafonné à 5, gain de combo plafonné au 12e maillon, décote `.78^(n-1)` sur la redite, et **zéro aura en freestyle** (une monnaie de panache ne se gagne pas là où l'on ne risque rien, sinon le mode d'entraînement devient la meilleure façon de monter en rang). MESURÉ : 10 figures variées = 950 · 10 fois la même = 288, soit **30 % pour le farm contre 100 % pour le skill** ; le gain plafonne à 186 à partir du 13e maillon. AUDIO vérifié au passage : aucune valeur non finie dans le graphe, aucun sample absent, le bouton SON suspend et reprend le contexte (⚠ `AC.resume()` est ASYNCHRONE — lire `acState` juste après donne encore « suspended », ce n'est pas un bug).
- **TROIS ÉVÉNEMENTS D'AURA DE PLUS (2026-08-18)** : (1) **LA RÉCEPTION À L'ARRACHÉE** — se poser à moins de 0,30 s du couperet des 6 s (+280) ou à moins de 0,10 s (+600, WOW, hit-stop). C'est le geste le plus tendu du jeu : rester en l'air paye en chaîne mais dépasser tue, donc le style consiste à frôler la limite. ⚠ mesuré sur **`fallTR`** (le temps VÉCU, celui du camembert) et pas `fallT` (temps-sim, plus rapide dans l'endgame) : le joueur joue contre le chrono qu'il VOIT ; ⚠ et **désactivé sous AIRTIME INFINI** — sans risque, pas de mérite. (2) **LA RAFALE DE FRUITS** (`fruitCroque`, fenêtre 2,6 s) — l'éclaboussure GROSSIT avec la rafale (2e gerbe dès ×2), le **CRUNCH** monte dans les aigus, et l'aura tombe à partir de 3. ⚠ le crunch est **synthétisé, pas samplé** : il doit changer de hauteur à chaque fruit (c'est l'escalade qui se lit à l'oreille) et un sample fixe rejoué cinq fois sonne comme un bug. (3) le **COMBO DE FIGURES** déclenche le WOW. ⚠ **PIÈGE RENCONTRÉ** : une insertion automatique a glissé `fxWow(...)` **entre un `if` et son `else`** → `SyntaxError: Unexpected token 'else'`, script entier mort, page noire. Les accolades étaient équilibrées et le message ne donnait aucune ligne utilisable ; ce qui a localisé le défaut, c'est d'avoir fait **parser le script par le navigateur via un Blob** (`<script src=blob:…>`), qui rend un vrai `lineno` — à refaire pour toute erreur de syntaxe dans ce fichier.
- **LES SONS DE MORT (`DEATH_LIB`, `deathSound`, 2026-08-11)** : 4 samples tirés au sort dans `explode()`, au moment de la boule de feu (pas à l'écran de fin : le son doit tomber sur l'IMAGE). Le sel vient du mélange des registres — deux explosions (`minecraft`, `explosion`), une réaction de dégoût (`eww`), un gong solennel à contre-emploi. ⚠ **JAMAIS DEUX FOIS DE SUITE LE MÊME** : un tirage uniforme sort un doublon une fois sur quatre, et un doublon sur un son qu'on vient d'entendre ne se lit pas comme du hasard mais comme un bug — on exclut le dernier joué (mesuré sur 400 tirages : répartition 23,3-27,3 %, **0 doublon consécutif**). ⚠ **DURÉE MAXIMALE PAR SON** (`max`) : l'explosion fait 8,4 s à la source et sa traîne mangerait tout l'écran de fin ; chacun se coupe en fondu de 500 ms (mesuré : plein volume jusqu'à 3,96 s, pause à 4,57 s pour un plafond de 4,5). ⚠ **C'EST UN SFX, PAS UNE VOIX** → gate sur `SND.sfx`, et comme c'est un HTMLAudio il ne passe PAS par le bus WebAudio : `AC.suspend()` (bouton SON) ne le coupe pas tout seul, d'où le `deathStop()` explicite dans `sndRefresh` et dans `resetGame`. Préchargés par `annPreload` (une mort qui arrive en retard ne fait pas rire). Hooks : `dbgDeath()` / `dbgDeath(n)` joue sans mourir, `dbgDeathNow()` rend l'état de l'élément en cours (les `Audio` ne sont pas dans le DOM, rien ne les observe autrement).
- **Announcer** (`ANN_LIB`, `annSpeak`, `annRoll`) : chaque condition déclenche sa voix EXACTEMENT 1 fois sur 3 (paquets de 3, place aléatoire). TOUTES les clés ont `first:1` : la voix se présente à sa 1re occurrence, ensuite elle se mérite. Couches : voix (`ANN_VOICE_VOL=.58`) + doublure démon pitchée (.26) + 2 échos dorés (161,8/323,6 ms). Ne jamais laisser un fichier manquant planter le jeu (`e.dead`).
- **LES 30 MOTEURS — CONSTRUCTEUR PARAMÉTRIQUE (2026-08-05)** : tout vit dans le bloc balisé `/* <<<MOTEURS>>> … <<<FIN MOTEURS>>> */` (les balises servent à `moteurs.html`, qui LIT le jeu au lieu d'en recopier une version qui dériverait). Chaque palier DÉCLARE sa silhouette dans **`ENG_LOOK`** (architecture, cylindres, turbos, ailettes, pièces en plus) et `mkEngine` assemble ; toutes les briques sont SEMÉES par boucle (bancs de cylindres selon l'architecture, ailettes, turbos en cercle, boulons, trompettes, anneaux). 11 architectures (en ligne, V, à plat, W, H, rotatif, turbine, statoréacteur, pulsoréacteur, réacteur, exotique) : le CORPS change de forme, pas seulement sa décoration. ⚠ **RÈGLE : deux paliers voisins doivent différer visiblement** — l'ancien système à seuils (`i>=5` turbo…) laissait 13 paliers sur 29 identiques au précédent, avec des séries de 4. Vérifiable par script. ⚠ **RÈGLE : un moteur à pistons a TOUJOURS un échappement** — garantie posée dans le CONSTRUCTEUR et non dans la table (11 paliers sur 30 n'en avaient aucun, dont le MOTEUR ROUILLÉ : un oubli par entrée se serait reproduit à la retouche suivante).
- **MATIÈRES GÉNÉRATIVES (`MAT9`, `M9`)** : d'après références réelles. `alu` (grain de moulage + micro-piqûres, presque neutre pour se laisser teinter mais VIVANT en spéculaire — c'est ça qui tue l'effet plastique), `carbone` (sergé 2/2 tissé par le code ; ce qui fait lire le carbone c'est que le reflet COURT le long des mèches, donc le spéculaire suit le fil), `fonte` (rouille, cloques, coulures — ⚠ RÉSERVÉE aux 2 premiers paliers, l'appliquer aux 30 donne trente moteurs en terre cuite). ⚠ **l'INOX n'a AUCUNE texture** : en r128 (MeshPhong, pas de PBR) le chrome vient d'une `shininess` énorme + une `envMap` très réfléchissante — le ciel du jeu sert de sonde. ⚠ **calculées UNE fois et partagées par les 30** : la teinte du palier est portée par `material.color` qui MULTIPLIE la carte (sans ce partage, chaque ouverture du garage recalculerait des canvas). La couleur du palier habille le COUVRE-CULASSE, pas tout le bloc — teindre le bloc entier donne du plastique coloré.
- **VIE DU MOTEUR + ANIMATION DE PALIER** : la vignette TREMBLE au régime (⚠ pas un bruit aléatoire : un moteur BAT à une fréquence, et c'est ce battement régulier + une dérive irrégulière qui le fait lire comme une machine), ROUGIT et crache une flamme au boost (la chaleur monte vite et redescend LENTEMENT — c'est de la fonte ; ce sont les pièces qui rougissent qui vendent le boost, pas la flamme). Changement de palier : `engSwapT` + `engSwapSnd()` — une SCÈNE de 1,2 s (clé à chocs qui ralentit, clanks de tôle à rapports NON entiers = métal et non cloche, puis démarreur), étincelles de soudure au CAPOT (pas au centre : au centre on lit une explosion), vignette qui s'emballe. Le moteur atteint s'affiche aussi en FIN DE PARTIE — ⚠ là le recollage WebGL ne marche pas (l'overlay est un DOM au-dessus du canvas, avec flou) : l'image du RenderTarget est rapatriée dans un `<canvas>` DOM.
- **FLUX DE PIÈCES INDEXÉ SUR LA PROGRESSION (`rich` dans `spawnPickups`)** : la densité était identique dans toutes les zones alors que l'échelle des paliers ACCÉLÈRE (5, 12, 21 … 2854) — on affichait 30 paliers pour n'en jouer qu'une dizaine. La route s'enrichit : mesuré 20 pièces/1000 m en zone 1 → 99 en zone 6. On ne touche pas aux motifs, on resserre les ESPACES entre eux. ⚠ `rnd` est la suite seedée de la piste : SCALER des résultats est sûr, ajouter/retirer un appel décale toute la génération en aval.
- **PROGRESSION — DEUX ÉCHELLES QUI NE SE MARCHENT PLUS DESSUS (2026-08-03)** : le **MOTEUR** est la progression DANS une partie (30 paliers, `ENGINE_TIERS`, remis à zéro à chaque run, monté aux PIÈCES via `addCoins`) ; la **VOITURE** est la progression ENTRE les parties (15 caisses, `CAR_UNLOCK`, conditions PERSISTANTES dans `SAVE.d.ex`, choisie au garage, purement cosmétique). ⚠ Les caisses ne se débloquent PLUS dans l'ordre — chacune a sa condition (record d'argent / palier moteur atteint / défi nommé), donc tout gate passe par `carUnlocked(i)` et JAMAIS par une comparaison à `bestCar` (qui n'est qu'un indicateur d'avancement). `ex.floor` = clause de grand-père pour les caisses gagnées sous les anciennes règles. ⚠ `lateMul()` (l'overdrive) et `vmaxShow()` suivent le PALIER MOTEUR : les indexer sur `level` revenait à vendre de la vitesse au garage. La physique lit `CARS[0]` ; `CARS[level]` ne sert plus qu'à la carrosserie et au nom. `THRESH` a été SUPPRIMÉ (ancienne échelle de déblocage à l'argent, plus lue nulle part).
- **L'AURA ET LE COMPTE EN BANQUE (2026-08-17) — la troisième économie** : **DEUX MONNAIES QUI NE FONT PAS LE MÊME MÉTIER**, et c'est tout l'intérêt. **L'ARGENT** s'accumule désormais en **BANQUE** (`SAVE.d.bank`) d'une partie à l'autre et **ACHÈTE** les caisses : il récompense la régularité. **L'AURA** (`SAVE.d.aura`) ne s'achète RIEN — elle monte sur le STYLE, donne un **RANG à vie** (`AURA_RANKS`, 8 titres d'ANONYME à DIVINITÉ DU CIEL), et le rang ouvre les caisses que l'argent ne peut PAS acheter : elle récompense le panache. ⚠ **SI L'AURA ACHETAIT AUSSI**, elle serait un second porte-monnaie et le joueur farmerait la monnaie la plus facile ; en la rendant **INCONVERTIBLE**, les deux voies restent nécessaires — le farmeur n'aura jamais LE MANS 24, le styliste devra quand même remplir son compte pour rouler en EL PATRON. ⚠ **REFONTE DES SOURCES (2026-08-18) — L'AURA NE COULE PLUS, ELLE ÉCLATE.** La 1re version accumulait par seconde dès qu'on roulait vite ; verdict en jouant : « ça monte trop, ça augmente dès que je suis en mouvement ». **Le défaut n'était pas le dosage mais la NATURE de la source** — un robinet ouvert récompense le fait d'exister, pas le fait de bien jouer, et on ne se souvient pas d'un robinet. `auraVitesse` est SUPPRIMÉE. L'aura ne vient plus que d'**ÉVÉNEMENTS qui ont un nom**, pour qu'on puisse dire à voix haute pourquoi on vient de gagner : (1) **LE COMBO DE FIGURES** (`auraFigure`, fenêtre `FIG_FENETRE`=6,5 s) — la source principale ; ⚠ **le gain croît avec le RANG dans le combo, pas avec la valeur de la figure** : ce qu'on récompense est l'ENCHAÎNEMENT, donc une petite figure qui prolonge un combo à ×7 vaut plus qu'une grosse figure isolée (mesuré : 32 pour une figure seule, puis 46·60·74·88·102·116 en chaîne — **7 isolées = 224, 7 enchaînées = 518**) ; les figures GRATUITES (le bump) comptent, elles prolongent ; (2) **PURE SPEED** (`pureT>3`, +300) puis une **salve tous les 2 s tenues, de plus en plus grosse** — ⚠ par PALIERS et non en continu, sinon on recrée le robinet qu'on vient de supprimer ; (3) **LA RÉCOLTE EN SÉRIE** — ⚠ une pièce isolée ne donne RIEN (sinon on récompense encore le simple fait d'avancer) : c'est tous les 5 ramassages sans laisser retomber le combo de 3 s ; (4) le **DÉCOLLAGE** (`heistFire`, +150). **L'AFFICHAGE EST UNE JAUGE DE CHARGE, PAS UN COMPTEUR** — 1re version : un petit chiffre or discret, verdict « on ne voit pas, ça donne pas envie d'augmenter » ; un score qu'on doit chercher des yeux n'est pas une récompense. Trois éléments, un par question : le CHIFFRE (« combien j'ai »), la JAUGE vers le rang suivant (« où je vais »), le **MAX** (`SAVE.d.auraMax`, la meilleure aura d'UNE partie — « quoi battre » ; sans lui il n'y a aucune raison de vouloir monter). Plus un halo qui enfle au gain et le COMBO ×N affiché tant que la fenêtre est ouverte. ⚠ **le bloc est posé à `top:292px`, SOUS `#engVig`** (top 150, hauteur 132) : à 130 px il se superposait à la vignette et on lisait « MOTEUR ROUILLÉ » au travers du chiffre. **LES TROIS VOIES D'OBTENTION** (`CAR_UNLOCK` refondue) : `p` = un PRIX payé à la banque (8 caisses, échelle géométrique ×5 de 5 000 à 500 M — l'économie du jeu est exponentielle, une échelle linéaire rendrait les premières interminables et les dernières gratuites) · `k:'aura'` = un RANG (FORMULE OR au rang 6 MYTHE, LE MANS 24 au rang 4 LÉGENDE LOCALE) · `k:'surv'` = le trophée (COMÈTE). ⚠ **LE VIREMENT NE VERSE QUE LES GAINS** (`money-START_CASH`) : verser `money` tel quel créditerait 1,61 € par partie, soit de l'argent créé à partir de rien, qui finirait par acheter une caisse à force de lancer et quitter des parties (mesuré : partie à vide → virement 0). ⚠ **ET SEULEMENT CE QUI A ÉTÉ ENCAISSÉ** : la mallette en cours n'a jamais touché `money`, donc mourir en vol la perd exactement comme avant — la banque ne rachète pas le bank-or-bust, elle en est la conséquence logique. ⚠ **SECONDE CLAUSE DE GRAND-PÈRE dans `san()`** : les conditions d'avant (cash/tricks/gaps/chain/kmh/eng/bumps) ayant disparu de la table, un joueur qui avait mérité la VEUVE NOIRE se la verrait REPRENDRE au chargement ; `ex.floor` est donc relevé à `bestCar` pour toute sauvegarde ayant des runs. Ça rend un peu plus que le dû et c'est VOULU — entre trop rendre et confisquer, une mise à jour se trompe toujours du bon côté (vérifié : ancien joueur à `bestCar:7` → 0 caisse confisquée). ⚠ `carBuy` fait le débit ET le flush dans la MÊME fonction : une caisse posée dans `owned` sans débit, c'est de l'argent créé, et ça ne se rattrape pas. ⚠ le bouton ACHETER n'existe QUE pour les caisses à vendre — en afficher un grisé sur LE MANS 24 laisserait croire qu'elle finira par s'acheter. Hooks : **`dbgAura()`** (banque, aura, rang, et la VOIE d'obtention de chaque caisse — le seul moyen de voir d'un coup qu'aucune n'est devenue inatteignable), `dbgAura(banque,aura)` force les compteurs, **`dbgBuy(i)`** achète par le vrai chemin, **`dbgRunEnd(argent,aura)`** simule une fin de partie via `commitExploits`.
- **TRADUCTION FR/EN (2026-08-03)** : dictionnaire `I18N` dont la CLÉ est la phrase française (repli silencieux si une traduction manque), fonction **`TR()`** — ⚠ **pas `T`**, déjà pris par le tableau des tangentes de la piste : la collision fait planter tout le script au parsing, écran noir sans erreur console. `TR()` est appliqué DANS `showMsg`/`trickMsg` (une seule porte d'entrée pour ~40 points d'appel, phrases de saveur comprises) ; les phrases composées à l'exécution appellent `TR()` sur chaque morceau car la correspondance est EXACTE. `applyLangDOM()` repeint le HTML statique TOUJOURS depuis la source française mémorisée en `data-fr` (sinon le retour au FR traduirait de l'anglais vers rien) ; ⚠ ne jamais y inclure un élément à enfants (`#cpInfo` contient `#cpDist` et `#cpBar`).
- **VIGNETTE MOTEUR (`engVigRender`, 2026-08-03)** : rendue dans un `WebGLRenderTarget` DÉDIÉ puis recollée APRÈS le composer comme quad ortho, `autoClear` coupé. ⚠ NE JAMAIS revenir à `setViewport`/`setScissor` sur le framebuffer principal : c'est ce que faisait la 1re version, et le composer rendait ensuite la scène dans le cadre laissé en place — l'image déformée qui avait fait désactiver la fonction. Position lue sur le rect DOM de `#engVig` (le CSS décide, mobile compris). ⚠ la caméra est posée à l'INIT, pas dans la boucle : le cadrage automatique lit sa distance, et un premier build sur une caméra en (0,0,0) donne une échelle 0 (vignette vide). `mkEngine` crée des matériaux neufs à chaque appel → les libérer au changement de palier.
- **Économie — REBASÉE ×2,5 (2026-07-17) puis RECALÉE SUR 30 PALIERS (2026-08-03)** : `DENOMS` a désormais **30 entrées indexées par `engTier`** (série 1-1,6-2,5-4-6,2 par décade, ×1,585, de 10 à 6,2e6). ⚠ elle avait gardé les 24 entrées taillées pour les 24 VOITURES alors qu'elle est lue par le MOTEUR : la reprendre telle quelle multipliait la valeur d'une pièce par 375. Recalage vérifié : à nombre de pièces égal, la valeur reste à ±3 % de l'ancienne. ⚠ tout revenu est relatif à `denom` → l'échelle suit seule ; la pluie de billets est calée dessus (`nextRainAt=4e3`, `×2.6`) ; les VIEUX records localStorage sont sur l'ancienne échelle (inatteignables — proposer un reset au user). `UNITS` monte jusqu'aux QUINTILLIONS (1e30). **Flavour pools** (`pickL` + `GO_LINES`/`ZONE_LINES`/`RAIN_LINES`/`CRASH_LINES` (fonctions montant→phrase)/`END_LINES`/`END_TOP`) : départ, portail, pluie de billets, chaîne perdue, punchline de fin de run (dans `tagline` sous GAME OVER, variante record). Revenus : pièces (combo x5 max), CHAÎNE de figures (voir ci-dessous), portail (`denom*40` + nitro pleine), tirelire (`denom*8`). Fever = tout ×2 pendant 10 s. **Unités compactes** (`fmtC`, `UNITS`) : tous les messages d'événement (verdict, mallette, tirelire, portail, « pièces de », prochaine voiture) affichent « $ 1,4 M » — échelle longue française k/M/Md/Bn/Bd/T ; le compteur GTA 8 chiffres (`fmtGta`) et les records gardent le nombre plein. Première traversée d'un ordre de grandeur = célébration « 💸 TU COMPTES EN MILLIONS » (`unitSeen`, une fois par SESSION, jamais reset).
- **Chaîne de figures** (`addTrick`, `chainVal/chainMult`, `#chainHud`) : chaque exploit aérien se NOMME à l'instant où il naît (pop `trickMsg` + carillon `trickPop` qui monte d'un demi-ton par maillon) et gonfle la chaîne — RIEN n'est payé en vol, tout se cashe à l'ATTERRISSAGE : `gain = denom*chainVal*chainMult(≤6)*grade*(face cachée ×2)*série*fever`. **L'AIRTIME BRUT NE RAPPORTE RIEN (purge 2026-07-20)** : le terme `5*fallT` a sauté du gain ET de `chainEst` ; sans chaîne à casher le verdict est MUET (gate `gain>0` : ni paye, ni annonce, ni boost/style — la jauge d'airtime reste une LIMITE de survie, 6 s = boom) et la mallette ne s'affiche que si `chain>0||chainVal>0`. Figures PURGÉES ce jour-là (déclenchement, addTrick, compteurs, HUD, doc — supprimées, PAS désactivées ; ne pas les réintroduire sans demande) : BIG AIR, AIR MONSTRE, PLEIN CIEL, SANS LES MAINS, PERCE-NUAGE, RASE-MOTTES, LIMBO, DAUPHIN ROYAL. Grade de réception : PARFAIT ×1.5 (impact<4.5), normal, POSÉ LOURD ×0.65 (impact≥10) — pendant le BRAQUAGE tout monte d'un cran (PARFAIT→DIVIN ×2, normal→PARFAIT, lourd→normal). **BRAQUAGE** (`feverArmed`, `heistFire`) : à `styleM`≥100 la jauge S'ARME (clignote rose `.armed`, fuit à −2/s, retombée à 0 = désarmée) — DOUBLE-TAP ESPACE <280 ms (`lastSpaceT`, garde `e.repeat`) déclenche le fever ×2 de 10 s ; chaque figure pendant le braquage PROLONGE de +0,8 s (plafond 18 s, largeur de jauge clampée). **ROLLOVER** (`rollover`) : une pose PARFAIT/DIVIN reporte 10 % de `chainVal` comme mise de départ du vol suivant (pop « REPORT +X » dans `startFall`, consommé une fois) — reset avec `feverArmed` dans `resetGame`. Bonus posés : PILE AU CENTRE (|lat|<30 % demi-route), À RECULONS (vA<-3). Si on EXPLOSE : « CHAÎNE PERDUE » — tout s'envole (bank-or-bust). La redite paye 60 % de la précédente (`chainSeen`), sauf échelles `raw` (vrilles, bumps). Figures en vol — NOYAU RESSERRÉ : vrilles par demi-tour de lacet (180°/360/540…), MÉTÉORE (nitro 1,2 s en l'air), LE DAUPHIN — LA mécanique du vol bas, précision et danger immédiat, seule source de gain liée au vol près de la route (nager au ras de la dalle, bande **2,2-12 m** (réparée 2026-07-20 : l'ancienne 0,9-7 m tombait DANS la fenêtre d'atterrissage de tryLand (hOff<3) — jamais déclenchable ; gain 14/s max ×prox², pop à 0,25 s) via radar `curNear/curHOff/curLatOff` rempli par `tryLand` : `chainVal` accrue en continu au CARRÉ de la proximité via `dolphT` ; on s'écarte = le gain s'effondre à l'instant, on touche = l'accumulation s'arrête et la chaîne se cashe ; écume `sparkGold` quand on frôle ; pendant l'accumulation le HUD de chaîne affiche EN CONTINU « 🐬 LE DAUPHIN +X » via `dolphGain` — on sait POURQUOI ça monte), BUMPS (tranche de dalle, échelle 8+3n, demi-jauge d'airtime rendue), SNAKE LOOP v2 (redéfini 2026-07-20 — fini le tour complet côté A→dessous→côté B) : `fallStartSide` mémorise la face au décollage (`startFall`), `fallUnder` s'arme dans `tryLand` au passage SOUS la route (côté opposé au départ, `|latOff|<ROAD_HALF`), et le trick se VALIDE à l'atterrissage sur la MÊME face que le départ (`snaked` : +14 chainVal +0.5 mult, verdict announcer tier 3). Détection dans le bloc 'fall' de `loop` (SNAKE LOOP armé/validé dans `tryLand`). Reset de la chaîne dans `startFall`, verdicts announcer par seuils `gain/denom` (m2≥45, m3≥140) + overrides meteor/snakeLoop/megaMeteor — le tout sous le gate `gain>0`. **LA MALLETTE** (`#caseHud`, `chainEst()`) : la valeur en jeu s'affiche EN DIRECT sous le HUD de chaîne (💰 + montant, police qui gonfle avec le magot) ; au-delà de `denom*20` elle passe `.hot` (or, tremblement CSS `caseTremble`) + battement de cœur (`heartBeat`, toum-toum sinus 58→38 Hz, cadence 0,86 s). À l'explosion EN VOL : « CHAÎNE PERDUE — $X ENVOLÉS ! » + gerbe `sparkGold` (garde `mode==='fall'` : une explosion au sol après encaissement ne perd rien) — SAUF la 1re fois : **L'ASSURANCE** (`insUsed`, reset dans `resetGame`) sauve 30 % de la mallette (« 🛡 ASSURANCE — $X sauvés sur $Y (une seule fois par run !) », `checkUpgrade` + `flyCash`) — le filet qui enseigne le bank-or-bust aux débutants sans coûter aux experts. Masquée à l'atterrissage/explosion/reset. **L'ÉCHELLE** (`LADDER`, `ladderI`) : chaque palier de multiplicateur franchi se crie (×2 CHAUD ! · ×3 EN FEU ! · ×4.5 MILLIONNAIRE · ×6 JACKPOT MAX) avec carillon qui monte — reset dans `startFall`. **HIT-STOP** (`hitT`) : 80 ms de gel (`dt×.04`, à côté du slow-mo dans `loop`) déclenché sur le grade PARFAIT. **BILLETS VOLANTS** (`flyCash`, CSS `.bill`) : des `$` DOM volent de la position monde (projetée caméra) vers le compteur `elMoney` — branchés sur verdict d'atterrissage, tirelire, portail. **VISEUR GRADÉ** : `landMark` se colore selon l'impact PRÉDIT (`tmp3·Nn` dans l'intégration du viseur) — or <4.5 (pulse), blanc, rouge ≥10 ; même unité que le verdict.
- **Symétrie des faces — MIROIR STRICT (zéro dessus-dessous)** : pièces/nitros, pouvoirs, flaques et groupes de plots existent SUR LES DEUX FACES aux mêmes positions (`for(const face of [1,-1])`), intervalles DOUBLÉS → densité et économie PAR FACE identiques à l'ancienne alternance. Dos d'âne : mesh jumeau dessous + physique `hopY` sur les deux faces (F.n est déjà retournée quand `side<0`, le check `side>0` a sauté). Ligne centrale sodium sur les deux faces. Les deux faces de la dalle sont à pleine lumière (`dim=1`). Chaque obstacle porte `face` — les collisions testent `face===side`.
- **Fin de partie (niveau 6+)** : OVERDRIVE `late=1+min(.5,(level-5)*.08)` sur `maxSp`/`accel` (+8 %/niveau, plafond +50 %) ; 2e vague de plots — flux aléatoire DÉRIVÉ (`seed^0xCA55E77E`) : la densité dépend du niveau sans rebrasser la génération. ⚠ 2026-07-20 : les **ÉPAVES-obstacles n'existent PAS** dans le code (`WRECKS`/`mkWreck`/`w9` = 0 occurrence — vérifié). Cette doc décrivait une fonctionnalité fantôme (percuter une épave, −50 %, mur à 330 km/h) : supprimée d'ici pour ne plus envoyer chercher du code inexistant. Le seul « wreck » du projet est la CAISSE de niveau 0 (`buildCar`, `lvl===0`).
- **Mode SURVIVANT v3 — la POURSUITE À ARMES ÉGALES** (`SURV`, `survStart/survTick/survRender/botBoom`, `#survHud`/`#lastAlert`, bouton `#survBtn`) : 7 voitures de POLICE incarnées sur la piste (`mkPolice`, 3 livrées, géométries/matériaux partagés + roues d'épave réutilisées). Classement = DISTANCE (`SURV.pBase+s` pour le joueur ; au portail `SURV.pBase+=s` → les écarts traversent les zones, téléportation invisible). **ZÉRO TRICHE — même moteur que le joueur** : chaque bot intègre les équations EXACTES du joueur (accél/traînée/MOMENTUM `b.momT`, pente `GRAV·T[bi].y`, nitro-RESSOURCE `b.nitroR` regen .2/s + poussée 30/s, volant complet `phi/steer/sHold` avec plafond `TURN_HS` et rétroaction de courbure comme `psi`, avance `v·cos(phi)·SPD`) et subit les MÊMES obstacles : plots (qu'il fait VALSER via `FLYCONES` — visible devant toi), flaques (`b.slipT`), pads turbo (`b.padB`), TROUS du gap catapulte (`holeAtS(rel)` → décollage calibré sur la largeur, `botBoom` s'il retombe dedans). Plus d'élastique, plus d'aspiration, plus de garde-fou, plus de rush artificiel, plus de bonus de vitesse. **Le CERVEAU fait la différence** (`SURV_PILOTS` : agro/err/rea/line) : tick de décision à RETARD HUMAIN (`rea` 100-300 ms — toutes les décisions tombent au tick, entre deux il roule sur les précédentes), perception BORNÉE (75 m devant, 25 m derrière, écarts estimés ±10 %, obstacles vus seulement devant), POINT DE CORDE par waypoints (3 échantillons de courbure sur la vraie distance de freinage, `vSafe` résout κ·v·SPD = plafond de braquage, marge `b.marg` bruitée à chaque tick), ligne de corde selon `line`, fautes VISIBLES (`errK` : 0 = coup de frein injustifié, 1 = embardée sinusoïdale, 2 = corde ratée → part large), DÉBOÎTEMENT (<14 m) / DÉFENSE (<9 m) au tick. SORTIE DE ROUTE = même sanction : décollage (vy 6), retombée hors piste = `botBoom` — le vide ne pardonne à personne. **VOL des bots** : état aérien complet (`air/airH/vy/spin/spinV`, gravité 26, gerbe `sparkGold` à la retombée, vrille `rotateZ`, cap réel `rotateY(b.phi)` — on VOIT les braquages) — décollage UNIQUEMENT sur les ZONES DE SAUT du joueur (`SURV.jumpZones`, gravées à chaque passage drive→fall, osées selon `appJump` à <8 m via `zoneMark`) : s'il n'y a pas de tremplin prouvé, personne ne s'envole. **NITRO VISIBLE** : sprite réacteur `jet` + braises `flameCore` (LOD <130 m) — la flamme suit la VRAIE combustion (`b.boostT`=flag), allumée au tick sur du droit dégagé selon `appBoost`. **DRIVATAR** (`AIP`) : profil persistant `SAVE.d.ai` (air/boost/caution/skill/aggr/airDur/runs, désinfecté dans `san()`) — `AIP.tick(dt)` observe CHAQUE frame (même hors Survivant), `resetRun()` dans `resetGame`, `commit()` dans `endGame` (adoption totale 1re run, EMA .35 ensuite) ; `survStart` biaise le CERVEAU seulement : `line×(.72+skill×.3)`, `marg` (caution), appJump, appBoost. LOD : sim complète permanente (~7 bots, coût négligeable), mesh+gyros seulement à |Δs|<340, halo sprites additifs qui s'éteignent au loin, POOL de 2 PointLights (les 2 plus proches <170 m éclairent vraiment route+caisse — jamais de recompilation shader, lights toujours en scène), sirène UNIQUE en WAIL doux (`sirenInit` : sine + LFO glissando ±115 Hz à 0.27 Hz + vibrato 5.3 Hz, lowpass 880, volume ≤.032 dosé sur la poursuivante la plus proche DERRIÈRE — plus jamais de deux-tons `setValueAtTime`). Rampes : matériaux on/off swappés par phase (`SURV.ph`), chaque unité bat sur SA phase. Minimap : points rouge/bleu temps réel dans `drawMinimap`. Minuteur PIXEL-ART : canvas 20×20 upscalé `image-rendering:pixelated` (`svClockDraw`, anneau qui se vide vert→orange→rouge, aiguille fluide, secondes dessous), dessiné chaque frame. DERNIER = CONDAMNÉ : `SURV.last` → `#lastAlert` clignote (« EXPLOSION DANS : 00:XX ») + `carLight` rouge 18 Hz ; au couperet → flash + gerbes + `explode()`. Bot dernier → `botBoom` (gerbe or+bleu + champignon + son si <220 m), les survivants gagnent en TÉMÉRITÉ (agro/appBoost/marg — jamais en vitesse). Tous morts = CHAMPION (jauge offerte). `endGame` coupe sirène/lumières/alerte et fige le classement. `survStart()` APRÈS `newTrack()` dans `resetGame` (sinon meute sur position périmée).
- **Pouvoirs** (`PWR_DEFS`, `mkPower`, `pwrNitroT/pwrAirT/pwrSpdT`) : orbes rares sur la piste (spawn dans `spawnPickups`, ~1 tous les 430-810 m). `n` = NITRO INFINIE 6 s (jauge pleine, zéro drain), `a` = AIRTIME INFINI 10 s (pas d'explosion à 6 s, camembert cyan, jauge neuve à l'expiration), `v` = SPEED UP +60 % 6 s (multiplie l'avance `s/lat` et le compteur, pas `vA`). Chaque orbe porte une ÉTIQUETTE flottante (sprite canvas : pictogramme 🔥/🪂/⚡ + nom, matériau partagé `d.icoM`, côté joueur même sous la route) — on sait ce qu'on vise avant de le prendre. Ramassage : `showMsg` coloré + `trickMsg` doré. Compte à rebours emoji dans `#pwrChip`, reset dans `resetGame`.
- **Sensation de vitesse — RELATIVE à la caisse (`vmaxShow()`)** : vibration caméra dès ~45 % de la vmax de LA caisse (`spdN` relatif, `CAM_SHAKE_V=.45`, encore atténuée ×.42×calm9 — un frisson volontairement doux, réduit par le user 2026-07-19) MAIS **plané supersonique** : `calm9` fond les vibrations à 30 % passé 700-1800 km/h affichés (seuil ×2 depuis SPD .25→.5 ; l'endgame FEND l'air, il ne tremble plus) ; speed lines dès ~55 % vmax (`drawSpeedLines`) ; FOV mixte (part relative ×17° + part absolue ×.030) — même LA HONTE à fond a sa sensation. Sifflement d'air (`whF/whG`, seuil `spd3-560` depuis SPD .5), compteur qui gonfle/rougit — **compteur VERT GTA V** (dégradé menthe→vert billet, `.dz` vert éteint).
- **Audio** : tout en WebAudio procédural sauf les voix (HTMLAudio). `initAudio()` exige un geste utilisateur. Tout passe par le bus `MASTER` (compresseur + limiteur tanh) — ne JAMAIS reconnecter à `AC.destination`. `duckT=…` creuse brièvement le mix (gros événements). Boutons `#sndBtn` (SON : `AC.suspend()/resume()`) et `#voxBtn` (VOIX : gate dans `annSpeak`), persistés `rrSfx5`/`rrVox5`. **Moteur v2** (`ENGINES`) : un timbre par caisse (onde harmonique + sub + souffle → saturation → filtre), fréquence = explosion (`i`+`engRpm`×`r`), boîte virtuelle (`gr` rapports, thump au passage), RONRON au ralenti (`lope`, LFO 8-15 Hz), crépitements au lâcher (`crk`, fn `crackle`), sifflement onduleur/turbine (`whine`) pour les 3 caisses du haut. Changer une caisse de son = éditer sa ligne `ENGINES`, zéro code. Crissement = stick-slip (2 bandes + LFO `skLfo`, zone morte |psi|>.32). Nitro façon fusée RL : le CORPS = rumble de bruit BROWN (`brownBuf`, boucle sans couture) sous double lowpass (`jrF`) + flutter 5 Hz (`jrDep`) — rond et chaud, dominant EN L'AIR. Pétillement = pops BRUNS (`flamePop`, ~25/s au sol) + POK (plop+subBoom) — des pops blancs trop denses fusionnent en tapis de souffle. Zéro couche de bruit blanc continue pendant la nitro : ça chuinte. Les médiums saturés (`jetDist`/`jcFb`) sont au repos, gardés pour usage ponctuel.
- **Persistance** (`SAVE`) : UNE clé localStorage versionnée `cashcarSave` (`{v:2, best, leaders, bestCar, sfx, vox}`). Toute la persistance passe par `SAVE.d` + `SAVE.flush()` (écriture immédiate) ou `SAVE.mark()` (filet auto-save 30 s) — ne JAMAIS écrire localStorage en direct. `san()` désinfecte tout ce qui entre (storage rongé, code importé) : la forme est garantie. Migration douce : les anciennes clés `rrBest5`/`rrLeaders5`/`rrBestCar5`/`rrSfx5`/`rrVox5` sont lues UNE fois si `cashcarSave` absent, jamais réécrites (retour arrière possible). Export/import par code base64 (`SAVE.export()`/`SAVE.import()`) — boutons `#saveExp`/`#saveImp` sur l'overlay (copie presse-papier avec repli `prompt`, restauration + reload). Flush aux moments clés : fin de run (`endGame`), record leaderboard, meilleure caisse, mutes. Migrations futures : une marche par version dans `SAVE.load()`.

- **MOBILE / TACTILE** (`IS_TOUCH`/`IS_MOBILE`, UI `#touchCtl` révélée par `body.touch`, câblage en fin de fichier ; test desktop : `?touch=1`) : `AUTO_GAS` (accél auto). **PAD GAUCHE ADAPTATIF** `#tPad` — VOLANT au sol (axe X → ArrowLeft/Right, tirer FRANCHEMENT vers le bas = frein) qui SE TRANSFORME en JOYSTICK en vol (`mode==='fall'` → classe `.air` posée par setInterval 120 ms : il grossit, vire cyan, 4 flèches apparaissent ; l'axe Y s'ouvre → ↑ portance nitro / ↓ redressement). Ancre RELATIVE (le stick naît SOUS le pouce, rayon `R9=46px`), suivi par `identifier` (multi-touch sûr avec la nitro), écrit dans le MÊME objet `keys` que le clavier → zéro physique nouvelle. **NITRO pouce droit** `#tNitro` (= Space ; double-tap <280 ms = BRAQUAGE, même règle que la barre), `#tPause`. Plein écran + `screen.orientation.lock('landscape')` au premier geste (Android ; iOS refuse → silencieux), overlay `#rotate` en portrait, `contextmenu` bloqué, safe-area insets, HUD responsive `@media (max-width:820px)`, PWA (`sw.js` + `manifest.webmanifest` — sans effet en file://).

- **PERF — LOD DE PROXIMITÉ (2026-07-20, MESURÉ)** : la scène porte **~1450 meshes** (≈550 pièces + ≈590 plots + la caisse + la piste) pour ~770 k triangles. Chaque frame faisait tourner les **600 pièces** (`rotateOnWorldAxis` + matrice monde recalculée) — y compris celles à l'autre bout de la piste. Correctif : dans la section animation de `loop`, pièces ET plots hors du couloir utile passent `visible=false` (ni draw call, ni test de frustum, ni matrice) et ne sont plus animés. Rayon `620+|vA|*1.1` (s'élargit avec la vitesse : zéro pop-in dans l'endgame) ; centre = `s` en drive mais **`lastNearS` en VOL** (posé par `tryLand` depuis `bestI`) — sinon le couloir resterait figé au point de décollage et la zone d'arrivée serait vide pendant tout le saut. Mesuré : **1444 → 326 meshes visibles (−77 % de draw calls)**, ramassage des pièces intact (il dépend de `p.s`/`p.mesh.position`, jamais de `visible`). ⚠ **NE PAS optimiser les recherches de point le plus proche** (`tryLand` 4500 itér./frame, viseur 14×1125) : mesurées à **0,035 ms/frame = 0,2 % d'une frame**. Le coût est GPU (nuages, ombres, bloom), pas JS — toute « optimisation » de ces boucles est du temps perdu et du risque de régression gratuit.

- **CLIGNOTEMENT DES NUAGES — CE QUI EST DÉFINITIVEMENT ÉLIMINÉ (2026-07-20, mesuré)** : après 5 rondes de correctifs ratés, la bonne méthode n'est plus de « tenter un fix » mais d'ÉLIMINER des causes par la mesure. Résultats — **ne pas re-corriger ces pistes, elles sont innocentes** : (1) **détection d'iso-surface** : le balayage linéaire `nSub` (4-10 pas) semblait phase-dépendant de la caméra, donc suspect n°1 → reproduit hors GPU (champ métaballe + rayons TANGENTS aux boules, le pire cas) : **0 clignotement et 0 saut de forme sur 47 400 micro-déplacements caméra**, titan `nSub=4` compris. Une méthode alternative (plus proche approche du centre de blob, continue par construction) donne EXACTEMENT le même résultat → inutile de la coder. (2) **tri des transparents** : 108 nuages tous en `renderOrder:0`, 103 paires se chevauchant, `depthWrite:false` → terrain idéal pour un swap d'ordre… mais **0 inversion sur 1 600 frames**, shake caméra 1,0 compris. (3) **culling/pop** : nuages dessinés **constant à 96** sur 219 frames de conduite (amplitude 0). (4) **bascules matF/matB : 0**. (5) le shader est **DÉTERMINISTE** : `ign()` ne dépend que de `gl_FragCoord` (le commentaire « grain ANIMÉ » est FAUX, il n'y a pas d'entrée temps) et `lightMarch` reçoit un jitter constant 0.5 → à caméra et uniformes identiques, l'image est identique. (6) `uSteps` change bien la forme, mais sur **0,03-0,06 % des rayons** et à sens unique (le palier ne fait que descendre) : pas un clignotement répété. **CONCLUSION** : tout le côté logique est stable ; il ne reste qu'un mécanisme capable de changer l'image sans que rien ne bouge dans la scène — le **RÉ-ÉCHANTILLONNAGE** (DPR adaptatif + paliers perf), piloté par la charge GPU, laquelle monte précisément quand la caméra bouge et découvre des nuages. D'où le hook **`dbgPin(1)`** qui fige résolution ET paliers : si le clignotement s'arrête net, la cause est là. ⚠ ce test doit être fait par le JOUEUR (le pane headless gèle le rAF et ne rend pas de pixels — aucune vérification visuelle possible ici).

## Conventions
- Style compact existant (pas de point-virgule manquant, minification manuelle légère) : s'y conformer.
- Commentaires en FRANÇAIS, avec la voix du projet (imagés, précis).
- Perf d'abord : pools de particules réutilisés (`makePool`/`spawnP`), pas d'allocation dans la boucle (réutiliser tmp/tmp2/tmp3/cldV1…), sprites plutôt que géométrie lourde.
- Tout nouvel élément visuel doit être disposé proprement au rebuild (`trackMeshes` ou équivalent de `disposeClouds`).
- Ne jamais casser la boucle : le try/catch de `loop()` masque les erreurs (voir console).

## Pièges connus
- `tmp3` & co sont partagés : toujours `set`/`copy` avant usage.
- Les positions des sprites de nuage sont LOCALES à leur groupe (monde = `g.position + sp.position`).
- `checkUpgrade()` doit être appelé après CHAQUE gain d'argent.
- `annSpeak(key,prio,forced)` : `forced=true` uniquement pour rejouer la file d'attente (bypass du 1/3).

## LA FUSION DU 2026-08-30 — la version téléphone entre dans le jeu
`index-10.html` (la version du user) n'était PAS dérivée de la dernière : elle repartait d'une base du
**17/08 20:58** (retrouvée dans `~/Downloads/CASH-CAR 3/index.html`). Elle apportait la VERSION
TÉLÉPHONE et le GARAGE LOW-POLY, mais avait perdu en route l'aura, la banque, les niveaux, le menu
refondu, le jus, les samples WOW. ⚠ **LA MÉTHODE, à refaire telle quelle la prochaine fois** : ne PAS
porter à la main. On retrouve l'ANCÊTRE COMMUN et on lance une vraie fusion à trois points
(`git merge-file ACTUEL BASE LEUR`) — ici **3 conflits seulement** sur ~2 300 lignes divergentes, tous
résolus en GARDANT LES DEUX CÔTÉS (le butin du logo cassé + la coque mobile ; `fovFit()` + le canvas de
jus dans le resize ; `hap()` + `addAura(150)` au braquage). Un portage manuel de 700 lignes aurait
coûté des heures et laissé des trous. Le diff et la carte sont dans le scratchpad
(`carte-fusion.md`, `index-vs-index10.patch`), l'état d'avant dans `versions/index_2026-08-30_avant-fusion-mobile.html`.
- **CE QUI ENTRE** : la VERSION TÉLÉPHONE (portrait assumé, `#tSteer` volant analogique flottant à
  2 axes — X braquage, Y assiette en vol — qui écrit dans le MÊME `keys`/`steer`, mode PAD en repli,
  `#tNitro` plaque d'arcade, `#tGear`/`#tPanel` pause+réglages, ÉCRAN NU, coque d'écrans
  `mGo`/`mFill`/`mTap`, charte `.pbtn`, `goImmersive`/`wakeAsk`, caméra PORTRAIT `POR`/`FOV_K`,
  `DPR_MIN`, `hap()`) · le **GARAGE LOW-POLY** (`GAR`, `buildGarageRoom` : 6 géométries + 7 canvas,
  aucune lumière ajoutée — il recycle celles de l'étal) · le **BAC À SABLE** (`sandRevive`) · deux vrais
  correctifs iOS : **`VOL_LOCKED`** (le `volume` d'un HTMLAudio est en LECTURE SEULE sur iOS — sans le
  test, les 3 doublures d'annonceur sortent à plein volume : un MUR de 4 voix au lieu d'une voix
  habillée) et l'état **`'interrupted'`** dans `audioKick` (l'état d'après un appel ou Siri : ne tester
  que `'suspended'` laissait le jeu muet pour toute la partie).
- **LA COUTURE À CONNAÎTRE** : `body.touch #overlay>*{display:none!important}` efface TOUT le menu
  desktop et `#mob` prend la place — c'est pour ça que le menu refondu et la coque mobile cohabitent
  sans se voir. ⚠ **`#auraHud` a dû être AJOUTÉ à la main à la liste de l'écran nu** : l'aura est née
  le 17/08, donc APRÈS la base de la version téléphone — elle n'était dans aucune des deux listes et
  restait plantée seule au milieu d'un écran qu'on avait vidé exprès. **Règle : tout HUD créé après
  cette date doit être ajouté à cette liste, sinon il réapparaît sur téléphone.**
- VÉRIFIÉ EN VRAI (serveur local + navigateur, pas à l'œil sur le code) : syntaxe OK (JavaScriptCore —
  ⚠ pas de `node` sur cette machine, utiliser
  `/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc` avec `new Function(src)`),
  zéro doublon de fonction/global, `window.__loopErr` vide, `dbgState()`/`dbgAura()` sains, la coque
  mobile s'affiche (`body.touch`, `#mHome.on`), le menu desktop garde son sélecteur de niveau, et le
  garage low-poly rend la caisse avec la carte « COMPTE / AURA » de la nouvelle économie par-dessus.

- **LE GARAGE REMONTE D'UN CRAN (2026-08-30, après la fusion)** — verdict du user en trois mots :
  « où est le garage ». La refonte du menu du 18/08 avait passé les quatre actions secondaires en
  liens gris ; le garage s'est retrouvé au même rang que « Réglages », alors que ce n'est pas un
  réglage mais **la deuxième destination du jeu** (on y choisit sa caisse). Il repasse en BOUTON, sur
  sa propre ligne (`#garageRow`, `.saveBtn.majeur`), juste sous JOUER. ⚠ la hiérarchie du menu n'est
  pas reniée : elle passe de deux étages à trois — AGIR (Jouer) · ALLER (Garage) · RÉGLER (les trois
  liens restants). Ce qui la cassait, c'étaient QUATRE pavés qui criaient aussi fort que l'action
  principale ; un seul objet secondaire, plus discret que le bouton d'or, ne la casse pas.
  ⚠ **le pictogramme est en `::before`, jamais un enfant** : `applyLangDOM` réécrit le `textContent`
  du bouton à chaque bascule de langue (`put('#garageBtn',TR('Garage'))`) — un `<i>` à l'intérieur
  serait effacé au premier passage en anglais et ne reviendrait jamais. ⚠ `#garageRow` a été ajouté à
  l'exception du bloqueur de clics en capture (à côté de `#nameEntry,#saveRow`) : le bouton n'est
  plus dans `#saveRow`, il aurait perdu son clic si la coque mobile s'affichait sur le menu desktop.
- ⚠ **LE FICHIER À DOUBLE-CLIQUER NE SE MET PAS À JOUR TOUT SEUL.** `~/Downloads/CASH CAR.html` est
  fabriqué par `faire-le-fichier-a-envoyer.py` À PARTIR de `index.html` : tant qu'on ne relance pas le
  script, le user joue la version d'avant. C'est ce qui a fait croire que le garage avait disparu de
  la fusion alors qu'il était bien là. **Relancer le script après chaque changement destiné à être
  essayé par le user.**

- **LE MENU REDEVIENT UNE BORNE (2026-08-30) — la refonte « Apple » du 18/08 est ANNULÉE.** Mots du
  user : « oublie la DA Apple, reprends la version que je t'ai fournie pour le menu, et maintenant
  toutes les lettres sont en 3D comme le logo, et sortent de l'écran ». On reprend SON fond (halo
  magenta, veine cyan rasante, trame de balayage, le jeu qui reste visible derrière au lieu de
  disparaître sous un voile mat) et on pousse le trait : plus une seule typo système sur cet écran,
  tout est en pixel et tout est EXTRUDÉ. Les actions secondaires redeviennent des **plaques d'arcade**
  — la MÊME que sur téléphone (`.pbtn`) : une seule langue de bouton pour tout le jeu. Le sélecteur de
  niveau devient une pile de plaques, la ligne choisie passe en or. ⚠ **le « clic n'importe où » n'est
  PAS revenu** et le bouton JOUER reste : avec une liste de niveaux, un écran-bouton lancerait la
  partie en essayant de choisir son morceau. **CE QU'IL FAUT SAVOIR POUR Y RETOUCHER** :
  (1) ⚠ **l'extrusion se fait en `filter:drop-shadow`, JAMAIS en `text-shadow`** — ces lettres sont
  peintes par un dégradé découpé (`background-clip:text`, donc `color:transparent`) et une ombre de
  texte se dessine DERRIÈRE la glyphe, donc derrière du transparent : invisible. `drop-shadow` empile
  des copies de la FORME rendue. C'est ce qui donne la tranche dorée du logo sur n'importe quelle
  ligne, sans dupliquer le texte ni exiger un `data-t` à tenir à jour dans deux langues (la limite de
  `.lg`, qui se recopie via `attr(data-t)`). (2) ⚠ **`overflow-x:hidden` sur `#overlay`** : le
  wordmark est VOLONTAIREMENT plus large que la fenêtre — sans ça le navigateur ajoute une barre
  horizontale et le menu se met à glisser sous la souris (un titre qui déborde est un parti pris, une
  page qui se balade est un bug). (3) ⚠ **`justify-content:safe center`** : un centrage flex classique
  COUPE le début du contenu quand il dépasse — le titre se retrouvait rogné par le haut, sans aucun
  moyen d'y remonter. (4) ⚠ **la taille du titre est bornée par la HAUTEUR autant que par la largeur**
  (`clamp(58px,min(14.2vw,24vh),230px)`) : indexée sur la seule largeur, elle mangeait 208 px sur un
  portable 1280×720 et poussait les boutons du bas hors de l'écran. (5) ⚠ **`.lg` porte son propre
  `line-height:1.2`** : dans le titre c'est LUI qui commande, pas le `h1` — régler l'interligne du h1
  seul ne faisait rien (d'où `#overlay h1 .lg{line-height:.94}`). MESURÉ à 1440×900 : le titre déborde
  des deux côtés (−57 px à gauche, +57 px à droite), zéro barre horizontale, et tout le menu tient
  sans défilement.
- **UN SEUL ÉCRIVAIN POUR LES LIBELLÉS DE MODE (`modeLbl`)** — ils se reconstruisaient à SIX endroits
  (la bascule de langue, et les deux boutons qui s'excluent mutuellement). Six copies de la même
  phrase = six occasions de diverger, et c'est arrivé : le passage « sans emoji » du 18/08 en avait
  raté la moitié, donc le libellé changeait de tête selon le chemin par lequel on venait de le
  toucher. Les pictogrammes sont revenus avec la DA borne, et ils ne reviennent qu'à cet endroit.
  ⚠ `modeLbl` relit les boutons par `$()` et non par les constantes `parkBtnEl`/`survBtnEl` :
  `applyLangDOM` peut tourner avant la construction de la liste d'éléments, et une `const` pas encore
  initialisée lève une ReferenceError qui tuerait tout le démarrage.

- **LE RETOURNEUR DU GARAGE (2026-08-30)** — changer de caisse ne fait plus un remplacement sec :
  le plateau s'emballe, un SCANNER cyan monte, avale la caisse, et recrache la suivante.
  ⚠ **LE VRAI PROBLÈME N'ÉTAIT PAS L'ANIMATION, C'ÉTAIT LE REMPLACEMENT.** Il n'y a qu'UNE caisse en
  mémoire (`carGroup`) : passer de l'une à l'autre, c'est `buildCar`, et ça se voit comme un
  clignement. Le scanner est le RIDEAU qui cache le changement d'acteur — l'échange tombe pile à son
  point haut, pendant que la caisse est écrasée à `.001`. **Zéro caisse en plus, zéro mémoire** :
  la solution « deux caisses et on permute » aurait coûté un second jeu complet de géométries et de
  matériaux pour exactement le même effet à l'écran. ⚠ l'écrasement va à **`.001` et jamais à 0** :
  une échelle nulle rend la matrice non inversible, three râle à chaque frame et certains pilotes
  affichent n'importe quoi. ⚠ **DEUX PORTES D'ENTRÉE, ET C'EST VOULU** : `garageShow(i)` reste le
  chemin INSTANTANÉ (ouverture du garage, bascule de langue, achat) — y coller l'animation ferait
  tourner le plateau à chaque changement de langue ; `garageGo(d)` est le chemin JOUEUR, branché sur
  les flèches, et lui seul déclenche la machine. ⚠ marteler ◀ ▶ retombe sur l'instantané : relancer
  l'animation à mi-course laisserait la caisse écrasée. ⚠ `closeGarage` **remet `scale` à 1 et coupe
  le scanner** — fermer PILE pendant une bascule partait en course dans une caisse plate, le genre de
  bug qui ne se voit jamais en test et toujours chez le joueur. ⚠ le disque, l'anneau et les douze
  plots vivent désormais dans un GROUPE (`GAR.pod`) : à plat dans la scène, impossible de les faire
  tourner ensemble. ⚠ **FLASH DES LAMPES DOSÉ TRÈS BAS** (+.45/+.35) : au premier essai (+1,6/+1,3)
  tout l'atelier virait au pastel délavé — le défaut déjà noté en tête de `garageRender`. Le scanner
  est additif, il fait DÉJÀ le travail lumineux ; les lampes ne font que confirmer.
  ⚠ **TESTER CE GENRE D'ANIMATION EXIGE `dbgStep`** : le pane headless gèle le rAF, donc `GAR.sw.t`
  reste bloqué à 0 et on conclut à tort que l'animation est cassée. Mesuré en pas-à-pas :
  t=0,288 écrasement à .28 · **t=0,384 ÉCHANGE fait** sous le scanner · t=1,056 échelle revenue à 1,
  scanner éteint, plateau à 7,79 rad (1,24 tour). Hook : **`dbgPod()`**.

- **LE LÂCHER (2026-08-30)** — on ne « ferme plus le garage pour lancer la partie » : un bouton
  **JOUER AVEC CELLE-CI** est posé dans la fiche, et la caisse SORT de l'atelier. 1,7 s, trois gestes,
  et c'est leur ORDRE qui fait la sensation : (1) l'APPUI — elle s'assoit sur ses suspensions, le nez
  se lève, l'anneau du plateau s'embrase ; (2) la SORTIE — elle part vers la porte en **`u²`, jamais
  en linéaire** : une voiture qui démarre à vitesse constante ne démarre pas, elle glisse ; (3) la
  PRISE DE VUE — la caméra quitte son orbite et vient se planter DERRIÈRE elle, à hauteur de
  pare-chocs, là où elle sera pendant la course, pendant que le champ s'ouvre de 56° à 66°.
  ⚠ **LE VOILE N'EST PAS UN EFFET, C'EST UN RACCORD** (`#gFade`) : l'atelier et le départ de piste
  sont deux endroits sans rapport dans la scène, il y a donc forcément une COUPE à la fin. Un fondu
  de 0,34 s la rend invisible ; sans lui on téléporte le joueur et tout le travail de caméra est
  perdu sur la dernière frame. ⚠ la séquence fait `return` en plein `garageRender` : elle PREND LA
  MAIN sur la caméra d'orbite au lieu de se battre avec elle. ⚠ `closeGarage` remet aussi
  `carGroup.rotation` à zéro — fermer pendant le lâcher laissait le nez en l'air pour toute la course.
  ⚠ la caisse vise **+Z** parce que c'est à la fois le côté de la porte et le nez de la caisse (les
  pots sont en −Z) : les deux coïncident aujourd'hui, mais si la porte déménage, c'est là que ça se
  règle. VÉRIFIÉ en pas-à-pas : garage fermé, voile retiré, `running:true`, `mode:'drive'`, zéro erreur.
- **LE MENU DEVIENT TRANSPARENT (2026-08-30)** — demande du user : « pour qu'on voie le décor ». Fond
  de `.94` à `.56`, flou de 9 px à 2,5. ⚠ **ce qui rend le texte lisible par-dessus un décor qui
  bouge, ce n'est PAS l'opacité du fond** — c'est que chaque lettre porte sa propre extrusion et son
  ombre dure. Un menu qui s'appuie sur son voile pour être lisible ne peut jamais devenir
  transparent ; un menu dont les lettres se défendent seules, si. C'est la DA borne qui a rendu cette
  demande réalisable — elle serait illisible sur l'ancien menu en typo système. ⚠ ne pas remonter
  l'opacité pour « corriger » un contraste : épaissir le halo derrière le titre, jamais le voile.
- **LE VOILE BLANC AU RÉVEIL DU GARAGE — bug trouvé et corrigé (2026-09-04)** — plainte du user :
  « l'animation du début bug ». Mesuré (pas deviné : `elementFromPoint`/`getBoundingClientRect` en
  console, PAS à l'œil) — `hide()` (fin du splash « 1.61 ») fait `sp9.id=''` pour que
  `document.getElementById('splash')` cesse de bloquer `start()` pendant le fondu. ⚠ **retirer l'ID
  détache AUSSI toute la règle CSS `#splash{position:fixed;inset:0;…}`** : le voile retombe en
  `position:static`, DANS LE FLUX du document, avec la hauteur de son contenu (mesuré : 86px). Le
  canvas WebGL — dernier enfant de `<body>`, lui aussi en flux normal — se fait POUSSER de 86px vers
  le bas pendant toute la durée de vie du nœud détaché (jusqu'à `sp9.remove()`, 1,15 s) : bande
  BLANCHE (fond de `<body>`, `html,body{background:#fff}`) en haut d'écran, bas de l'image rogné
  d'autant. Corrigé en figeant en dur sur l'élément, au moment où l'ID part, exactement ce qu'il lui
  donnait (`sp9.style.cssText='position:fixed;inset:0;…'`) — plus `pointer-events:none` (le CSS
  d'origine avait `cursor:pointer` pour le double-clic « passer », qui n'a plus de sens une fois
  `hide()` déjà lancé ; sans `none`, le voile invisible avalait les clics sur le garage fraîchement
  révélé pendant tout son fondu). ⚠ **MÉTHODE, à refaire telle quelle** : ce genre de bug (un
  décalage de layout d'une poignée de frames) ne se voit PAS dans `dbgState()` ni dans les captures
  écran classiques d'ici — il a fallu `document.elementFromPoint` + `getBoundingClientRect` sur le
  canvas au bon instant pour le débusquer. ⚠ **ET UN PIÈGE D'OUTILLAGE découvert au passage** : dans
  ce pane, une suite d'appels JS purs (sans action `computer` intercalée) fait passer l'onglet en
  arrière-plan — `innerWidth`/`innerHeight` retombent à 0, `requestAnimationFrame` se FIGE (donc tout
  ce qui dépend de `dt` réel, comme la séquence « LE LÂCHER » ou `garageRender`, reste bloqué à
  `t=0` indéfiniment) alors que les timers `setTimeout` (le splash) continuent. **`dbgStep(n,ms)`
  contourne ça en avançant la boucle à la main** — c'est la seule façon fiable de faire progresser une
  partie depuis la console ici. Autre piège : ce pane sert parfois une version EN CACHE de
  `index.html` pour l'URL nue malgré un rechargement forcé — ajouter un paramètre bidon (`?cb=N`)
  force un contenu frais (vérifié via `document.querySelector('script').textContent.includes(...)`).
- **DYNAMIQUE DE CAMÉRA — PREMIÈRE PASSE (2026-09-04)** — plainte du user : le suivi caméra en
  conduite est « stagnant », il veut du fluide qui réagit au mouvement — vitesse (l'écran qui « part
  en l'air ») et virage (la caméra qui tourne avec). Le système existant (position/FOV/tremblement
  déjà en place, INTOUCHÉ) recalculait tout chaque frame sans aucune mémoire d'une frame à l'autre à
  part le lerp de position : rien ne « traînait ». Trois variables persistantes ajoutées PAR-DESSUS
  (`camLean`, `camSwing`, `camKick`, déclarées à côté de `camUp`) : `camLean` = roulis de caméra qui
  réagit VITE au braquage réel pondéré par la vitesse (`turnRate=steer*min(1,speedKmh/140)` — immobile
  = pas de lean) ; `camSwing` = glissement latéral qui réagit plus LENTEMENT que le lean, donc la
  caméra a l'air TIRÉE vers l'extérieur du virage plutôt que pivotée avec la caisse (même glissement
  appliqué, amorti différemment, à la position ET à la visée — la caméra glisse dehors tout en
  regardant encore un peu dedans) ; `camKick` = poussée verticale de la VISÉE (pas du FOV, déjà piloté
  ailleurs) au boost/nitro, montée vite/retombée douce (même idiome asymétrique que `hueA`/le crunch
  des fruits ailleurs dans le fichier) — l'écran « part en l'air » sur une poussée. ⚠ **CALIBRAGE
  MESURÉ EN JEU, PAS SUR PAPIER** (`dbgStep` pour driver la boucle sans rAF réel, `dbgCam9()` pour
  lire l'état, capture d'écran au bon instant) : les PREMIERS coefficients (lean ×0,34, swing ×2,2)
  donnaient un swing latéral de ~1,45 m à fond de braquage à 190 km/h — la caméra plongeait
  quasiment dans le décor, image illisible. Redescendus à lean ×0,14 / swing ×0,45 (plus le terme de
  visée proportionnellement réduit) : un virage à fond reste lisible, la caisse bien cadrée, tout en
  banquant visiblement. ⚠ **CECI RESTE UNE PREMIÈRE PASSE** — le user a demandé de « commencer » le
  concept pour l'affiner ensuite : les coefficients ci-dessus sont un point de départ mesuré, pas un
  verdict final. Hook : **`dbgCam9()`** (camLean/camSwing/camKick/steer) — régler au clavier en
  conduisant (`dbgStep` + `ArrowLeft`/`ArrowUp` synthétiques), pas en relisant le code.
- **L'INTRO « 1.61 » — LE BOUTON SAUTE, LA FISSION S'ALLÈGE (2026-09-05)** — retour du user en jouant
  EN VRAI (pas dans ce pane) : « intro toujours buggée », un bouton jaune de trop, un « rectangle
  bizarre » derrière le 1.61, et ça lague. Trois choses distinctes, trois corrections distinctes :
  (1) **PLUS DE BOUTON** — `#spPlay` a sauté (HTML + CSS + les trois `if(pb)…`/`spBtn` qui le
  touchaient en JS) : `sp9` écoutait DÉJÀ le clic sur tout l'écran, le bouton était donc une CIBLE EN
  TROP à côté de la vraie cible (le titre). `#spNote` porte maintenant l'instruction entière
  (« clique sur CASH CAR — le son s'allume avec toi ») et respire doucement (`spBreath`, sur
  `opacity` seulement — jamais sur un `filter`, ça se paierait en frames). (2) **LE « RECTANGLE
  BIZARRE » = `#spFlash`** — un `background:#fff` plein écran qui saute à `opacity:1` EST un
  rectangle blanc à bords nets qui traverse l'image ; converti en dégradé radial centré sur le
  titre (`radial-gradient(60vw 60vh …, transparent 72%)`) : même flash, plus rien à pointer du
  doigt sur les côtés. (3) **LE LAG — mesuré par lecture de code, pas par capture (le pane ne rend
  pas ces 450 ms de façon fiable)** : à l'instant de la fission, TROIS effets chers tournaient
  EN MÊME TEMPS — 120 particules canvas avec `shadowBlur` CHACUNE (une passe de flou par glyphe,
  par frame), le flash, et le titre qui anime `blur(10px)+drop-shadow(70px)` PENDANT un
  `scale(3.6)`. Corrigé sans changer l'intention : particules 120→70, `shadowBlur` par particule
  supprimé et remplacé par UNE SEULE dégradé radiale dessinée une fois par frame (même ambiance
  dorée, coût qui s'effondre), flou du titre 10px→6px et ombre 70px→42px (silhouette encore lisible,
  calcul plus léger), `will-change` posé UNIQUEMENT sur `.boom` (un calque dédié vaut le coup ici,
  pas en permanence sur l'élément). ⚠ **MÉTHODE** : ce lag ne se JUGE pas dans ce pane (rAF/canvas
  gelés entre les appels sans action `computer` intercalée, voir la note du 2026-09-04 plus haut) —
  la lecture de code (deux `filter` animés + 120 flous canvas au même instant d'horloge) suffisait à
  identifier la cause sans avoir besoin de la voir.
- **LE LOGO DU MENU RÉDUIT (2026-09-05)** — le débordement volontaire du 2026-08-30 (« les lettres
  sortent de l'écran ») a fini par devenir le problème lui-même : `clamp(58px,min(14.2vw,24vh),230px)`
  descend à `clamp(40px,min(8.2vw,14vh),150px)`. Même logique (plafonné par la hauteur ET la
  largeur), juste des valeurs plus sages — le titre garde perspective et extrusion, il ne mange plus
  l'écran.
- **LE GESTE DU GARAGE — ON GLISSE LA CAISSE, PAS DES FLÈCHES (2026-09-05)** — demande précise du
  user : toucher la caisse (petite réaction), puis la faire glisser à gauche ou à droite pour faire
  entrer la suivante, comme un carrousel. ⚠ **ÇA NE REMPLACE PAS L'ORBITE, ÇA SE POSE DESSUS** : le
  glissé faisait déjà tourner la caméra autour de la caisse (`garageAng`/`garagePitch`) — c'est CE
  mouvement qui sert d'accusé visuel pendant qu'on glisse, il n'y avait rien à ajouter là. Ce qui
  manquait : un SEUIL au relâchement (`pointerup`, `SWIPE_PX=64`, comparant le déplacement TOTAL
  depuis le `pointerdown` — pas le delta incrémental qui sert à l'orbite) — en dessous, l'orbite
  seule reste ; au-dessus, dans une direction nettement plus horizontale que verticale, on COMMIT
  `garageGo(dx<0?1:-1)` (glisser à GAUCHE → caisse SUIVANTE, comme feuilleter un carrousel), la MÊME
  fonction et la MÊME animation de retourneur que les flèches ◀▶ — aucun deuxième chemin à
  maintenir. **LE TOUCHER** : `GAR.pressT` s'arme au `pointerdown` (si aucune bascule n'est déjà en
  cours) et la caisse s'aplatit brièvement (courbe en sinus, 160 ms, ni à-coup au début ni à la fin)
  dans la branche de repos de `garageRender` — la caisse accuse la pression avant même qu'on ait
  glissé quoi que ce soit. ⚠ VÉRIFIÉ EN JEU (`dbgPod()` + `dbgStep`, pas en relisant le code) : un
  glissé de 150px vers la gauche sur « LA HONTE » (caisse 1) déclenche bien la bascule vers
  « CAISSE À SAVON » (caisse 2), même animation de retourneur que les flèches.
- **ZOOM ARRIÈRE (course + garage) ET CAMÉRA MOINS BRUSQUE (2026-09-05)** — deux plaintes du user en
  jouant EN VRAI : « trop zoomé » (course et garage) et « la caméra tourne trop en fonction des
  flèches, faudrait plus flotter et suivre la voiture ». Course : `camBack` remonte de 4,1 à 5,3
  (même rapport de hauteur ×.46, donc même angle, juste plus loin). Garage : distance d'entrée
  6,9→7,8, plafond de zoom molette/pincement 7,8→8,6. Dynamique de caméra (`camLean`/`camSwing`,
  voir plus haut) : constantes de temps DOUBLÉES (4,5→2,2 et 2,4→1,3) — le lean/swing collaient de
  trop près au rythme des TOUCHES (`steer` répond en 0,055 s), pas au mouvement réel de la caisse.
- **LE FAUX « BUG DE TÉLÉPORT » — en réalité un crash rendu ILLISIBLE par la caméra (2026-09-05)** —
  rapport du user : après ~3 minutes de jeu, « la voiture fait un TP et redémarre depuis un point
  précis, le menu s'affiche », **sans aucune explosion visible**. Lecture de code (pas de repro
  visuelle possible ici, voir la note plus haut sur `dbgStep`) : la séquence de mort est UNIQUE et
  intacte — `explode()` (mode='boom', debris, anneaux, son) puis `if(boomT>1.8&&!gameOver)endGame()`
  dans la boucle ; `die()`, la seule autre fonction qui appelle `endGame()` en dehors de ce chemin,
  n'est APPELÉE NULLE PART dans tout le fichier (code mort, vérifié par grep) — donc CE chemin est
  forcément celui qui s'est déclenché. ⚠ **CE N'ÉTAIT DONC PAS UN BUG D'ÉTAT, MAIS DE LISIBILITÉ** :
  la caméra explosion vise `boomPos` (fixe) mais NE REPOSITIONNE PAS la caméra elle-même — si celle-ci
  traînait encore loin derrière la caisse au moment de l'impact (le suivi de position venait de
  passer de dt*5 à dt*3, voir l'entrée précédente), l'explosion rendait minuscule/lointaine, presque
  invisible. Remonté à dt*4.2 : toujours plus lâche que l'original, mais la caméra reste assez proche
  pour que le crash SE VOIE au moment où ça compte. ⚠ **MÉTHODE, à refaire telle quelle** : devant un
  rapport « ça saute sans raison », chercher D'ABORD tous les appelants de la fonction qui montre le
  symptôme (ici `endGame`, 3 sites : `die()` [mort, jamais appelée], le chemin `boomT`, et le bouton
  QUITTER) — un `grep` suffit souvent à trancher entre « bug d'état » et « bug de rendu » sans avoir
  besoin de voir l'écran.
- **LE SERVEUR LOCAL N'EST PAS ÉTERNEL** — `python3 -m http.server 8765` tournait depuis DIMANCHE
  (`Sun07PM` dans `ps aux`) et s'est arrêté en cours de session sans message — `curl` a renvoyé une
  connexion refusée. `lsof -i :8765` avant tout `navigate` échoué évite de chercher le bug dans le
  jeu alors que c'est le serveur qui a disparu.
- **UN SERVICE WORKER QUI SE CROYAIT « TOUJOURS FRAIS » NE L'ÉTAIT PAS (2026-09-05)** — le user
  rapportait ne voir « aucun vrai changement » sur `localhost:8765` malgré des dizaines d'éditions
  livrées. `sw.js` se disait « réseau d'abord » pour la navigation, mais son `fetch(req)` n'avait
  AUCUNE option de cache explicite : sans `{cache:'no-store'}`, ce `fetch()` reste soumis au cache
  HTTP ORDINAIRE du navigateur, qui peut satisfaire un simple rechargement sans le moindre
  aller-retour réseau. Corrigé : `no-store` explicite sur la navigation, `updateViaCache:'none'`
  sur `register()` (sinon `sw.js` lui-même peut mettre jusqu'à 24 h à être re-vérifié), et le numéro
  de CACHE incrémenté (v11→v12) pour purger l'ancien. ⚠ un service worker déjà actif dans le
  navigateur du user ne prend PAS le relais tout seul avant d'avoir lui-même rechargé une fois la
  page — la première visite après le correctif peut encore servir de l'ancien.
- **LE LÂCHER — L'ÉCLAIR DE VITESSE, DISCUTÉ AVANT D'ÊTRE CODÉ (2026-09-05)** — le voile noir qui
  cachait la coupure garage→piste se faisait décrire comme « un rechargement de page » par le user.
  ⚠ **MÉTHODE, sur demande explicite du user** : avant tout code, trois questions (approche
  déguiser-la-coupure vs continuité physique · identité visuelle du flash · budget perf) pour aligner
  la direction plutôt que deviner. Direction retenue : déguiser la coupure (pas de refonte physique
  du garage), flou de vitesse ET flash néon COMBINÉS, un petit temps de chargement caché dans l'effet
  est acceptable. **CE QUI A ÉTÉ ÉLIMINÉ AVANT DE CODER** : réutiliser le canvas `drawSpeedLines`
  existant (`#slCv`) — impossible sans toucher toute la hiérarchie de z-index du HUD, puisque
  `#slCv` vit dans `#hud` (z-index 2, sous `#gFade` à 70) et que `body.inGarage` l'éteint pendant
  tout l'atelier. Choix retenu à la place : tout l'effet (dégradé radial + 10 traits en `<i>`
  enfants, angles fixes via `nth-child`) vit ENTIÈREMENT dans `#gFade` — zéro risque sur le reste de
  la mise en page. ⚠ **UN VRAI BUG TROUVÉ EN TESTANT (`dbgStep`, pas à l'œil)** : `#gFade` est lui
  aussi un enfant de `#hud`, donc visé par `body.inGarage #hud>:not(#garage){display:none!important}`
  — la classe `.on` s'allumait PENDANT que `body.inGarage` était encore posé (elle ne part qu'à la
  toute fin, dans `closeGarage()`), donc l'élément restait invisible pendant TOUTE la montée de
  l'éclair, puis `display:none` sautait pile au moment où `.on` était déjà là : l'effet n'apparaissait
  jamais en train de monter, il POPAIT d'un coup à pleine intensité — ce qui explique le ressenti
  « rechargement » bien mieux qu'une simple histoire de courbe d'accélération. `#gFade` est passé en
  exception (`:not(#garage):not(#gFade)`) : l'éclair peut enfin monter avant que le garage ne se
  referme. Timing asymétrique (attaque 0,16 s quasi instantanée, dissipation 0,3-0,34 s plus douce) :
  un éclair claque, il ne s'éteint pas d'un coup. VÉRIFIÉ EN JEU (`dbgStep` jusqu'à `u>.80`) :
  `display:block`, dégradé blanc→magenta→cyan et dix traits bien visibles, puis retour propre à
  `mode:'drive'` sans erreur.
- **L'ÉCLAIR NÉON REJETÉ EN BLOC, ET LE VRAI DÉPART REPENSÉ (2026-09-05)** — verdict du user en
  testant l'éclair ci-dessus, EN INCOGNITO (donc pas un problème de cache) : « transition is horrible
  and bug still not fixed ». Les QUATRE options négatives cochées d'un coup (couleurs, traits, timing,
  ET l'idée elle-même) disent la même chose : ce n'était pas un réglage à affiner, c'était la MAUVAISE
  IDÉE. `#gFade` est redescendu à un simple voile blanc quasi invisible (`opacity:.9`, transition
  `.08s`/`.18s`, plus aucun `<i>` de traits) — il ne reste qu'un RACCORD de coupe, plus un effet.
  **LE USER A DONNÉ LA SOLUTION LUI-MÊME, EN DÉTAIL** (pas une piste à interpréter, un cahier des
  charges) : plus de largage du ciel sur la tirelire, on ne joue QUE depuis le garage porte ouverte,
  et dès que la caisse franchit la porte on bascule sur l'écran de jeu (une coupe nette, « bam », pas
  une continuité physique pixel-perfect) — accompagnée d'un BOOST AUTOMATIQUE de 3 s qui ralentit tout
  seul si le joueur ne touche à rien (« le but c'est déclencher un truc chez le joueur », pas de le
  faire travailler), d'une lueur façon décollage (arc-en-ciel), et d'un logo CASH CAR qui brille
  au-dessus de la caisse puis s'efface. **CE QUI A ÉTÉ FAIT :**
  (1) **PLUS DE LARGAGE** — `setupIntroPig()` a sauté de `resetGame()` (elle reste pour le décor du
  MENU, `rebuildMenuScene()`, jamais touchée) ; `respawn()`, déjà appelé juste avant, pose maintenant
  la caisse DIRECTEMENT au sol, roulante — rien à démolir pour partir.
  (2) **`startBoostT`** (3 s, déclaré à côté de `nitroR`) remplace le largage : câblé dans le MÊME
  bloc nitro que `pwrNitroT` (jauge pleine, `nitroOn` forcé vrai — « la poussée tient la touche à la
  place du joueur »), donc `vA+=(nitroBlue?48:30)*push*dt` (la ligne qui pousse la caisse même SANS
  gas, voir le bloc drive) s'applique automatiquement : ⚠ **LA CAISSE AVANCE TOUTE SEULE PENDANT LE
  BOOST**, ce n'est pas qu'une jauge offerte — vérifié en jeu (`dbgStep`+`dbgState()`) : `vA` monte de
  0 à ~5 en 20 pas de 30 ms SANS AUCUNE touche simulée. Décroît chaque frame quel que soit le mode
  (`if(startBoostT>0)startBoostT=Math.max(0,startBoostT-dt)`), et la friction normale du jeu reprend
  la main dès qu'il atteint 0 — « ralentit petit à petit » vient GRATUITEMENT de la physique
  existante, pas d'un nouveau code de décélération.
  (3) **L'ARC-EN-CIEL** : pendant `startBoostT>0`, `nitroLight`/`jetShellM`/`jetCoreM`/`jetGlowM`
  reçoivent une teinte `setHSL((t*.65)%1,1,.6)` — ⚠ **LA RÉSERVE BLEUE GAGNE TOUJOURS** (règle déjà
  posée pour `spec.fx`, voir plus haut) : ce nouvel override doit un jour être vérifié contre
  `nitroBlue` si le chevauchement pose souci, mais la fenêtre de 3 s au tout début d'une run ne
  croise jamais la réserve (elle est forcée pleine par le même `startBoostT>0`).
  (4) **`#launchLogo`** — le SEUL nouvel élément DOM : réutilise TEL QUEL `.lg`/`.lg.gold`/`.lg.grad`
  (les classes du logo 3D or du menu) plutôt que d'inventer un second habillage — le sweep `lgShine`
  tourne déjà en boucle sur ces classes, donc l'afficher 1,6 s suffit à le faire « briller un coup »
  sans une ligne d'animation en plus. `fireLaunchBoost()` (un seul écrivain, appelée par `resetGame`
  ET par la fin du LÂCHER) toggle `.on` (reflow forcé via `void ll9.offsetWidth` pour que la
  transition rejoue même sur un rejeu rapproché) puis la retire après 1,6 s réelles (`setTimeout` —
  PAS `dt`, le logo doit rester lisible même si le jeu est en pause/lent).
  (5) **UNE SEULE PORTE D'ENTRÉE** (`playViaGarage()`) — le bouton JOUER du menu (`#playBtn`), son
  double mobile (`mTap('play'/'replay')`), et la touche Entrée en fin de partie (`keydown`,
  `nameInput`) ouvrent maintenant le garage puis enchaînent `garageLaunch()` au lieu d'appeler
  `start()`/`resetGame()` en direct — « on ne peut jouer que depuis le garage » est donc vrai pour
  TOUTE façon de (re)lancer une course, pas seulement le bouton dédié du garage (`#gPlay`, inchangé).
  ⚠ **`#resetBtn` (coin de l'écran, EN COURS de partie) et l'action `reset` du panneau pause mobile
  GARDENT `resetGame()` en direct** : ce sont des utilitaires de « relance immédiate » pendant le jeu,
  pas le geste de DÉPART d'une course — les faire attendre 1,7 s de porte de garage aurait été une
  régression que le user n'a pas demandée.
  (6) **`GAR.go` (LE LÂCHER) restructuré à sa complétion** (`u>=1`) : au tout premier lancement
  (`!wasStarted`) il appelle encore `start()` (rien à réinitialiser, `newTrack()/respawn()` du
  chargement de page suffisent) MAIS ajoute `fireLaunchBoost()` juste après — AVANT ce correctif, le
  tout premier départ d'une session ne recevait NI le boost NI le logo (seul `resetGame()`, jamais
  appelé sur ce chemin, les portait). Sur un REJEU (`wasStarted` vrai), c'est `resetGame()` qui prend
  le relais et porte `fireLaunchBoost()` lui-même — pas de double appel.
  ⚠ **BUG D'OUTILLAGE DÉCOUVERT EN TESTANT, PAS DANS LE JEU** : `GAR`/`startBoostT`/toute variable
  `let`/`const` du script principal est INVISIBLE depuis l'évaluation JS de ce pane (`GAR is not
  defined`), MÊME un `function fireLaunchBoost(){}` de premier niveau — seules les affectations
  EXPLICITES `window.X=…` (le style déjà en place pour tous les `dbg*`) traversent la frontière. D'où
  l'ajout de **`window.dbgGo()`** (armé/t/garageOn/started/gameOver/startBoostT/inGarage/gFadeOn/
  launchLogoOn) pour instrumenter cette séquence depuis la console — sans lui, aucun moyen de savoir
  depuis ce pane si `GAR.go` avait seulement été armé ou déjà rendu la main. La fenêtre de fondu du
  logo (1,6 s RÉELLES, via `setTimeout`) s'est révélée trop courte pour la capturer par screenshot vu
  le round-trip de cet outillage — vérifié par LA MACHINE D'ÉTATS (`dbgGo()` avant/pendant/après) et
  non par une capture visuelle du logo lui-même ; le mécanisme CSS est identique à celui déjà
  confirmé à l'écran pour le titre du menu, seule la preuve visuelle de CETTE instance précise reste
  à faire par le user en jouant pour de vrai. MESURÉ (`dbgStep`+`dbgGo`+`dbgState`) sur un lancement
  complet : `armé:true→false`, `started:false→true`, `startBoostT:3→décroissance régulière`,
  `launchLogoOn:false→true→false`, `vA:0→4,91` sans touche, aucune `window.__loopErr`.
  ⚠ **CONSTATÉ EN TESTANT, HORS SUJET DE CETTE TÂCHE** : sur cette session de test, le clic qui ferme
  le splash « CASH CAR »/« 1.61 GAMING » a systématiquement enchaîné DIRECTEMENT sur le garage plutôt
  que sur le menu principal — reproductible plusieurs fois, cause non investiguée (aucun code de ce
  chantier ne touche `hide()` ni la transition splash→menu). À vérifier par le user en conditions
  réelles ; si confirmé, c'est un sujet SÉPARÉ.
- **CE N'ÉTAIT PAS UN MYSTÈRE, C'ÉTAIT DÉJÀ ÉCRIT (2026-09-05, suite immédiate)** — la ligne
  incriminée existe bel et bien, en toutes lettres, dans `hide()` : `if(typeof openGarage===
  'function')openGarage();`, avec tout un bloc de commentaires DATÉS l'expliquant (« ON N'ATTERRIT
  PLUS SUR UN MENU, ON ATTERRIT DANS LE GARAGE »). Le splash mène donc DÉJÀ, délibérément, au garage
  plein écran — ce n'est PAS le vieux menu (`#overlay`, Play/Garage/Top 10) qui est cassé, c'est
  simplement qu'IL N'EST PLUS LA PREMIÈRE CHOSE VUE. **Ça change la lecture de tout le retour du
  user qui suit** (capture d'écran du GARAGE avec « PLAY » écrit en gros au marqueur par-dessus) :
  il ne dessinait pas sur un écran secondaire oublié, il dessinait sur SON écran d'accueil réel.
- **LE GARAGE REÇOIT SON PROPRE JOUER + SON TOP 10 (2026-09-05)** — le user a confirmé par
  question posée : garder le garage comme écran d'accueil, mais lui ajouter un GROS bouton JOUER
  autonome et un Top 10 (le Top 10 existant, pas un second tableau pour l'instant ; pas de pub).
  ⚠ **`#gTop` EST UN ID PARTAGÉ AVEC `#stall`** (l'étal des fruits) : une règle bare `#gTop{flex-
  direction:column}` aurait empilé les éléments du stall aussi — toute règle de mise en page qui
  change la STRUCTURE (pas juste une couleur) doit être scopée `#garage #gTop` (deux ID > un seul,
  gagne sans toucher au stall). `#gPlayMain` (`.saveBtn.play.big`, la même plaque or que « JOUER
  AVEC CELLE-CI » mais compacte et centrée) et `#lbBoxG` (le MÊME Top 10 que le menu, backdrop ajouté
  après un premier essai illisible sur le fond de l'établi) vivent dans `#gTop`, sous la ligne
  titre/fermer. `renderLeaders()` écrit désormais dans LES DEUX réceptacles (`#lbBox` et `#lbBoxG`)
  à partir du même HTML — un seul calcul, deux affichages, pas de second calcul à maintenir en sync.
- **LA VITRINE DISPARAÎT AU DÉPART, QU'ON L'AIT VUE OU PAS (2026-09-05)** — retour du user après un
  premier jet : « un bouton play séparé des achats de voitures ». Le problème n'était pas la
  présence du bouton JOUER lui-même mais que la fiche d'achat/échange (`#gCard`, avec « PLAY WITH
  THIS ONE », ACHETER, ÉQUIPÉ…) restait plaquée à l'écran PENDANT TOUTE la sortie de porte —
  vérifié dans les captures du tour précédent, le panneau ne bougeait pas d'un pixel du décollage
  à la porte. Deux DÉCLENCHEURS pour un seul résultat (`#gTop`/`#gCard`/`.gNav` en `display:none`) :
  `.quiet` posée par `openGarage(true)` (le lancement rapide, avant même que quoi que ce soit
  s'affiche) et `.launching` posée par `garageLaunch()` lui-même (dès qu'on part, qu'on ait
  parcouru la vitrine ou cliqué JOUER direct) — sans la seconde, partir en ayant BROWSÉ les caisses
  aurait quand même montré la fiche pendant tout le trajet. Les deux classes sont retirées dans
  `closeGarage()`. VÉRIFIÉ EN JEU (`dbgGo()` avant/après clic sur `#gPlayMain`) : capture AVANT
  clic → fiche visible ; capture APRÈS clic (`GAR.go` armé) → salle nue, caisse sur son plateau,
  aucune UI de shop à l'écran.
- **LES FILÉS DE VITESSE ÉTAIENT MORTS EN SILENCE (2026-09-05)** — retour du user : « remets un peu
  de zoom ou de flou… puis encore plus au boost ». `drawSpeedLines(kmh,nitro)` (traits radiaux façon
  anime, cyan et deux fois plus denses sous `nitroOn`) existait TOUJOURS dans le fichier — mais son
  SEUL site d'appel avait été remplacé, un jour, par un simple `clearRect` une fois par frame, avec
  un commentaire affirmant qu'« un warp du shader » avait pris le relais. **`grep -n "warp"` sur
  tout le fichier : ZÉRO résultat.** Ce warp n'a jamais existé (ou a été retiré sans qu'on retire la
  mention) — la sensation de vitesse a donc disparu SANS RIEN pour la remplacer, et personne ne l'a
  remarqué avant que le user la réclame. Corrigé en rappelant `drawSpeedLines(speedKmh,nitroOn)`
  chaque frame à la place du `clearRect` mort. ⚠ **MÉTHODE** : avant de RÉINVENTER un effet qu'un
  user dit avoir « avant », `grep` la fonction qui y ressemble — elle existe parfois déjà, juste
  débranchée.
- **LE LOGO DU LANCEMENT DEVIENT UN IMPACT, PAS UN FONDU (2026-09-05)** — retour du user : « cash
  car début de partie plus impressionnant ». `#launchLogo` partait de `scale(.55)` avec un ease-out
  poli ; passé à `scale(.18)` avec un `cubic-bezier(.22,1.61,.36,1)` qui DÉPASSE 1 avant de s'y
  stabiliser (un ressort, pas un fondu), taille doublée (clamp 34-84px contre 24-54px), et un nouvel
  élément `#launchGlow` (halo radial doré, même classe `.on`, même minuteur que le logo dans
  `fireLaunchBoost()`) qui gonfle en même temps pour donner le FLASH qui accompagne le mot. Durée du
  plateau remontée de 1,6 s à 1,9 s. ⚠ **NI L'UN NI L'AUTRE N'A ÉTÉ VU À L'ÉCRAN PAR MOI** : sa
  fenêtre de pleine visibilité (~1,1 s réelles entre la fin de la transition d'entrée et le début du
  fondu de sortie) reste plus courte que l'aller-retour d'un outil de ce pane — confirmé par la
  MACHINE D'ÉTATS (`dbgGo().launchLogoOn`/`launchGlowOn` passent bien `false→true→false` au bon
  moment) et non par une capture de l'apparence réelle. Le mécanisme CSS (`.lg.gold`/`.lg.grad`,
  `drop-shadow`, `background-clip:text`) est IDENTIQUE à celui déjà confirmé à l'écran pour le
  titre du menu — seule la taille/l'easing/le halo sont nouveaux et n'ont pas été vus en vrai.
  **À CONFIRMER PAR LE USER EN JOUANT POUR DE VRAI.**
- **LE JOUER DU GARAGE PERD SA BULLE ET GAGNE UNE VAGUE (2026-09-05 ter)** — retour du user : « je
  veux pas entouré d'une bulle, chaque lettre en pixel plus jolies et [qui] fait une onde qui fait
  rebondir tous les autres pixels en vague depuis le point cliqué ». `#gPlayMain` n'est plus un
  `<button class="saveBtn play">` (fond, bordure, ombre portée) mais un `<div role="button">` VIDE
  que `buildPlayWord()` remplit lettre par lettre — chaque lettre est un `<span class="lg gold"
  data-t="X">`, exactement le traitement or extrudé du logo CASH CAR (`::before` ombre + `::after`
  reflet qui balaie), rien de neuf à inventer pour « plus jolies ». **LA VAGUE** (`playWordWave`) :
  au clic, chaque lettre reçoit un `animation-delay` proportionnel à sa DISTANCE HORIZONTALE au point
  cliqué (`Math.abs(centre_lettre - clickX)*1.1`, plafonné à 240 ms) puis rejoue la MÊME animation de
  rebond (`pxBounce`, un ressort `cubic-bezier` qui dépasse avant de retomber) — c'est ce DÉCALAGE,
  pas l'animation elle-même, qui se lit comme une onde qui voyage depuis le clic plutôt qu'un mot qui
  saute d'un bloc. `garageLaunch()` est retardé de 260 ms après le clic pour laisser la vague partir
  avant que le garage ne s'éteigne. ⚠ **PIÈGE DE TEST, PAS DE BUG DE JEU** : un `MouseEvent` synthétique
  envoyé via `dispatchEvent` dans ce pane revient avec `clientX/clientY` à ZÉRO (coordonnées non
  fiables sur un événement non « trusted ») — les quatre lettres prenaient alors le même délai
  plafonné (240 ms), ce qui ressemblait à un bug de calcul. Un VRAI clic (`computer.left_click`, à la
  bonne échelle : ce pane rend la page à 1280×720 mais sert des captures à 800×450, donc diviser par
  0,625 les coordonnées DOM avant de cliquer) a confirmé la vague réelle : P=0 ms, l=29 ms, a=59 ms,
  y=88 ms — une progression parfaitement linéaire depuis la lettre cliquée. **LA GRILLE DE
  COMPÉTITION PASSE À DROITE** (`#lbBoxG`, retour du user : « met la à droite ») — sortie de la
  colonne titre/JOUER, `position:absolute` ancrée sur `#garage` (`top:96px;right:22px`), donc stable
  quelle que soit la langue ou la taille du bouton JOUER au-dessus. Toujours cachée pendant `.quiet`/
  `.launching` (ajoutée à la même liste que `#gCard`/`.gNav` — sinon elle serait restée plaquée à
  l'écran pendant toute la sortie de porte, exactement le défaut qu'on venait de corriger pour la
  fiche d'achat).
- **DEUX VRAIS BUGS AUDIO CORRIGÉS (2026-09-05 ter)** — retour du user : « il y a qq problème
  technique dans le code de l'audio ». (1) **LE GARAGE ÉTAIT MUET** : `chimeNote`/`noiseBurst`
  (changement de caisse, tap) se posent tous en garde `if(!AC)return` — silencieuses tant qu'aucun
  `AudioContext` n'existe. Or `AC` ne se créait que dans `start()`, c'est-à-dire APRÈS avoir déjà
  visité le garage (premier écran vu depuis que le splash y atterrit direct, voir plus haut) : toute
  la session de shopping se déroulait sans le moindre retour sonore, en silence total, sans la
  moindre erreur console pour le signaler. Corrigé en appelant `initAudio()` (gardé par `if(!AC)`)
  dans `hide()`, au moment même où `openGarage()` se déclenche — le clic qui ferme le splash EST déjà
  le geste utilisateur qu'un `AudioContext` réclame, autant s'en servir tout de suite. (2) **RISQUE
  DE DOUBLE CONTEXTE AUDIO** : `initAudio()` n'a AUCUN garde interne — chaque appel FABRIQUE un
  nouveau `AudioContext`, point. `start()` l'appelait sans condition ; tant que le garage restait
  hors-jeu (avant le splash-atterrit-au-garage), `start()` était la PREMIÈRE et seule occasion pour
  `AC` d'exister, donc l'absence de garde ne mordait jamais. Depuis le correctif (1), `AC` existe
  déjà quand `start()` tourne — un second appel sans garde aurait alors fabriqué un DEUXIÈME contexte
  pendant que le premier restait connecté et continuait de jouer en arrière-plan, hors de portée des
  boutons SON/MUSIQUE/VOIX (qui n'agissent que sur le `AC` courant) : un son qui ne s'éteint plus,
  quoi qu'on coche. `start()` est passé en `if(!AC){initAudio();}` — le même garde déjà posé sur
  `playMusic`/`musicStartRun`.
- **LE JOUER DEVIENT DES CUBES QUI BASCULENT COMME DES ÉCAILLES (2026-09-05 quater)** — retour du
  user : « plus gros le bouton play et plus de cube qui le constitue, que ça ne bounce pas mais
  plutôt que ça réagit comme des écailles » (+ « la grille de compét à gauche plutôt », un second
  revirement dans la même respiration). **TAILLE** : `#gPlayMain .lg{font-size}` 26px→44px.
  **LES CUBES** : plutôt que reconstruire un vrai bitmap voxel par lettre (un chantier de police
  entier), un quadrillage `repeating-linear-gradient` (deux sens, cellules ~6px, arête claire +
  ligne sombre) est superposé EN PREMIER PLAN de l'image de fond existante (`#gPlayMain .lg.gold`
  scopé — la règle de base `.lg.gold` reste intacte, PARTAGÉE avec le titre CASH CAR du menu) :
  `background-clip:text` découpe l'ensemble sur la forme de la lettre, qui se lit alors comme
  empilée de petits blocs plutôt que comme un aplat lisse — cohérent avec le reste du jeu, tout en
  voxels (les caisses, le garage). **L'ÉCAILLE, PAS LE REBOND** : l'ancien `pxBounce` (un
  `translateY` qui fait sauter la lettre verticalement) devient `pxScale`, un `rotateX` pivoté
  depuis `transform-origin:50% 100%` — LE PIED de la lettre, pas son centre — avec un `translateZ`
  qui fait ressortir le sommet au pic du geste : la lettre bascule depuis sa base et retombe, exactement
  le mouvement d'une écaille qu'on brosse à rebrousse-poil plutôt qu'un saut. `perspective` posé sur
  `#gPlayMain` (le conteneur) et non par lettre, sinon chacune bascule dans son propre plan sans point
  de fuite commun. ⚠ le NOM de classe JS (`pxBounce`, dans `playWordWave`) n'a PAS changé — seul le
  `@keyframes` qu'elle déclenche a été renommé et réécrit ; aucune édition JS nécessaire, seul le CSS
  a bougé. VÉRIFIÉ par lecture d'état (même méthode que la vague ci-dessus, un vrai clic puis lecture
  de `getComputedStyle(...).animationName`) : `animationName:"pxScale"` sur les quatre lettres,
  délais 30/19/69/118 ms croissant globalement avec la distance au clic. **LA GRILLE À GAUCHE** :
  deuxième revirement du user sur la même session — `#lbBoxG` passe de `right:22px` à `left:22px`
  (même ancre `position:absolute` sur `#garage`, un seul mot-clé à retourner).
- **« JOUER AVEC CELLE-CI » A SAUTÉ DE LA FICHE (2026-09-05 quinquies)** — retour du user : « enlève
  le truc qui mélange description de voiture avec un bouton jouer ». Depuis que `#gPlayMain` (en
  haut de l'écran) existe, la fiche du bas (`#gCard`) avait DEUX boutons de lancement pour une seule
  intention — un archaïsme de l'étape précédente, pas un choix. `#gPlay` (« PLAY WITH THIS ONE »)
  est retiré du HTML, de son `addEventListener`, et de la liste de traduction d'`applyLangDOM` ; la
  fiche n'ACHÈTE et n'ÉQUIPE plus que — JOUER est maintenant à un seul endroit. `.saveBtn.play`
  (règles CSS de la plaque or) est mort avec lui, supprimé plutôt que laissé en orphelin.
- **LA CAISSE DÉMARRAIT EN L'AIR AU TOUT PREMIER LANCEMENT — VRAI BUG TROUVÉ ET CORRIGÉ
  (2026-09-05 quinquies)** — retour du user : « corrige le début de la partie, ça recommence trop
  haut ». Mesuré via `dbgState()` juste après avoir traversé la porte du garage pour la toute
  première fois d'une session : **`hopY:7.08, introD:true`** alors que la piste roule au sol.
  **LA CAUSE** : le décor du MENU fait tourner `setupIntroPig()` en boucle derrière le splash (le
  largage décoratif — `introD=true,hopY=13` au lâcher, la caisse tombe visuellement de 13 m en fond
  d'écran). `start()` — le SEUL chemin de la toute première partie (les rejeux passent par
  `resetGame()`, qui appelle déjà `respawn()`) — ne remettait JAMAIS `introD`/`hopY` à zéro : la
  partie démarrait donc avec l'état du décor figé EN PLEINE CHUTE, la caisse posée en l'air
  au-dessus du bitume au lieu d'être au sol. Corrigé par un simple `respawn()` ajouté en tête de
  `start()` — la même fonction que la touche R utilise déjà pour annuler proprement un largage en
  cours (`if(introD){introD=false;if(pigGroup){scene.remove(pigGroup);pigGroup=null;}}`). VÉRIFIÉ
  EN JEU (`dbgState()` juste après le tout premier passage de porte) : `hopY:0, introD:false,
  mode:"drive"`, caisse au sol, `vA` qui monte normalement sous le boost de départ.
- **LE DESKTOP HÉRITE DE L'ÉCRAN NU DU MOBILE — LA MINI-CARTE ET LES 4 BOUTONS DEVIENNENT UN SEUL
  ⚙ (2026-09-05 sextus)** — retour du user : « enlève la mini app, déplace tous les boutons du
  gameplay, par un petit logo réglages qui inclue tous les boutons qu'on vient de supprimer ». La
  « mini app » = la minimap (`#minimap`) ; les « boutons du gameplay » = `#resetBtn`/`#sndBtn`/
  `#voxBtn`/`#musBtn`, quatre plaques éparpillées en haut à droite. **CE QUI EXISTAIT DÉJÀ** : le
  mobile a DEPUIS LONGTEMPS résolu exactement ce problème — `#tGear`/`#tPanel` (un seul ⚙ qui ouvre
  un panneau PAUSE/RÉGLAGES/LA PARTIE) et la règle « ÉCRAN NU » qui masque déjà `#minimap` et les 4
  boutons pour `body.touch`. Il ne s'agissait donc pas d'inventer, mais d'ÉTENDRE au desktop ce qui
  ne servait qu'au mobile. **CE QUI A ÉTÉ FAIT** : (1) `#minimap`/`#resetBtn`/`#sndBtn`/`#voxBtn`/
  `#musBtn` passent en `display:none!important` INCONDITIONNEL (plus seulement `body.touch`) — le
  CODE reste (les interrupteurs `sndBtnEl`/`voxBtnEl`/`musBtnEl` restent le SEUL point de vérité,
  invoqués via `.click()` depuis le panneau, exactement comme le mobile le fait déjà), seule la VUE
  change ; `drawMinimap()` reste écrite mais n'est plus appelée nulle part (repeindre un canvas que
  rien ne montre coûterait pour rien). (2) `#tSet{display:none}`/`body.play #tSet{display:block}`
  remplace l'ancien gate `body.touch` — `body.play` est DÉJÀ synchronisé pour les deux plateformes
  par un tick existant, rien à dupliquer côté détection. ⚠ **PIÈGE STRUCTUREL TROUVÉ EN TESTANT** :
  `#tGear`/`#tPanel` semblaient prêts à l'emploi, mais TOUT leur câblage (`gear.addEventListener`,
  `panOpen`, `panSync`, le tick `body.play`) vit À L'INTÉRIEUR d'un bloc `if(IS_MOBILE||touch=1){…}`
  géant qui ne tourne JAMAIS sur un vrai desktop — mesuré en jeu : `document.body.className` restait
  `""` indéfiniment (`await new Promise(r=>setTimeout(r,1200))` n'y changeait rien), pas un problème
  de timing mais de CODE QUI NE S'EXÉCUTE PAS. Rejouer ce bloc tel quel aurait aussi activé le
  joystick tactile, le verrou d'écran et `AUTO_GAS` sur un poste à clavier — il fallait un second
  bloc, MIROIR mais MINIMAL, gaté à l'INVERSE (`!(IS_MOBILE||touch=1)`) : les deux s'excluent
  mutuellement sur la même condition retournée, donc zéro risque de double-câblage sur un vrai
  téléphone. Ce second bloc ne reprend QUE panOpen/panSync/les clics + le tick play/⚙↔⏸ ; il OMET
  volontairement le gel « téléphone à plat » (`innerWidth>innerHeight` est today TOUJOURS vrai sur
  desktop — l'appliquer tel quel aurait mis la partie en pause à la première frame) et `mGo()`
  (routeur d'écrans de la coque mobile, sans objet ici). ⚠ **« VOLANT » RETIRÉ DU PANNEAU DESKTOP**
  (`body:not(.touch) [data-a="ctl"]{display:none}`) : ce bouton ne fait que basculer le pad tactile
  en joystick, aucun sens sans écran tactile — SON/VOIX/MUSIQUE/IMAGE/SURVIVANT/RECOMMENCER/
  REPLACER LA CAISSE/QUITTER restent, eux, universels. VÉRIFIÉ EN JEU (clics réels, pas seulement
  lecture d'état) : ⚙ apparaît pendant la course puis devient ⏸, ouvre le panneau PAUSE (sans
  VOLANT), un clic sur SON bascule bien 🔊→🔇 avec la classe `.off`, REPRENDRE referme le panneau et
  relance la partie (« GO! » réaffiché), `window.__loopErr` reste vide.

## LE CHANTIER VOXEL (2026-09-11) — état des lieux, arbitrage, et la ville
Brief du user : progresser sur quatre axes esthétiques — (1) variété des formes voxel, (2) matières
mat/lisse/brillant/lueur, (3) modèles de voitures plus complexes, (4) un fond de scène en voxels —
sous UNE contrainte : **un seul type de voxel comme brique de base**. Ordre d'attaque validé :
**fond → voitures → matières**, le fond en premier parce qu'il remplit le plus de pixels et qu'il
fabrique au passage l'outillage (brique partagée + instanciation) dont les deux autres vivront.

- **L'ÉTAT DES LIEUX, EN CHIFFRES MESURÉS** (pas lus dans le code — comptés dans la scène qui tourne) :
  scène 3 160 meshes / 177 géométries distinctes / **1,51 M triangles** ; **0 `InstancedMesh` et
  0 `mergeBufferGeometries` dans tout le fichier** (chaque brique = un draw call, c'est LA contrainte
  silencieuse). Les 15 caisses, en triangles : les **douze de progression tiennent toutes entre 1 300
  et 2 700** — EL PATRON, la hypercar à 500 M, en vaut **1 632**, FORMULE OR **1 300**, soit MOINS que
  l'épave du départ. Les 3 fantastiques (5 890 / 4 840 / 8 372) sont 3 à 6× plus riches, et ce sont
  exactement celles qui ont `loftBody`, `finShape` et `MATV`. ⚠ **La progression n'achète aucun détail** :
  c'est ça, le vrai défaut de l'axe 3, et il ne se voyait pas sans mesurer.
  Étalon qui tranche tout : une **grappe de fruits suspendue au-dessus de la route = 12 882 triangles**
  (36 sphères, 14 exemplaires dans la scène) — soit **8× la hypercar**, et autant que **tout le garage
  réuni** (408 pièces, 12 658). Le budget existe, il part juste dans le décor jetable.
- **MATIÈRES (axe 2), les trois plafonds** : (1) la seule variation entre les 15 caisses est une RAMPE
  sur l'index (`shin=50+lvl*34`, `refl=min(.98,.10+lvl*.085)` dans `buildCar`) — donc « mat / lisse /
  brillant » n'est pas un choix mais une place dans la file, et le reflet est **écrêté à .98 dès
  l'index 11** (les 5 dernières caisses sont identiques) ; (2) `envTex` est un `CubeTexture` de **six
  canvas 64×64 px** : c'est tout ce qu'un chrome à .98 peut réfléchir ; (3) **0 `MeshStandardMaterial`**
  dans le fichier (63 Phong / 66 Basic / 8 Lambert) — sans `roughness`, « mat » n'a pas de bouton.
  ⚠ **BUG OUVERT** : `buildGarageRoom` demande `flatShading:true` sur des `MeshLambertMaterial`
  (index.html:10745). En r128 Lambert éclaire par SOMMET et ignore le drapeau : **18 avertissements
  console** à chaque ouverture du garage, et le facettage n'arrive jamais. Les boîtes s'en sortent
  (normales par face natives) ; ce sont les pièces RONDES de l'atelier qui perdent leur cachet.
- **L'ARBITRAGE « UN SEUL VOXEL » — J'AVAIS TORT, LE USER AVAIT RAISON.** J'avais proposé d'assouplir
  la contrainte (un cube + le même cube coupé en diagonale) en arguant que le cube pur ferait des
  escaliers dans les capots plongeants. Vérifié en construisant les deux, pas en argumentant :
  **`atelier-voxel.html`** (page neuve, même patron que `voitures.html` — elle LIT `index.html` et
  n'échange que `carProfile`, curseur de taille de brique, les 15 caisses, bouton « voir l'actuelle »).
  Verdict mesuré sur la VEUVE NOIRE, le pire cas de la gamme : **le coin diagonal ne touche que 2 %
  des briques** (350 sur 18 566 à 5 cm) et les deux versions sont **indiscernables à l'écran**.
  ⚠ **POURQUOI** : le coin ne sait couper qu'à 45°, donc il ne s'applique qu'aux cellules à 3 sommets
  sur 4 dans la silhouette. Or la gamme est PLATE — la VEUVE NOIRE fait 0,30 m de haut pour 4,70 m de
  long — donc ses cellules de bord sont presque toutes à 2 sommets, le cas que le coin ne traite pas.
  **La pièce répondait à un problème que cette gamme n'a pas.** Décision : **UN SEUL CUBE, aucune pièce
  dérivée**, et la vraie variable est la TAILLE. Retenue : **`VOX_M` = 5 cm** (6 briques de haut sur la
  carrosserie, ~6 px/brique en course, 22 068 triangles pour une caisse entière = 1,7 grappe de raisin).
- **LA VILLE SOUS LES NUAGES (axe 4) — FAITE** (`buildVoxCity`/`cityTick`, appelée en fin de
  `buildTrack`). ⚠ **CE QU'IL FAUT SAVOIR AVANT D'Y RETOUCHER** :
  (1) **Il n'y avait RIEN** dans le fond — mesuré : hors ruban/caisse/ramassages/nuages, aucune
  géométrie. La « ville » de la doc tenait en UNE ligne du shader du dôme (index.html:1524, une bande
  de néon sur l'horizon). Le lore parlait déjà d'une ville sous la mer de nuages : on l'a construite.
  (2) **Une seule trame** : `VOX_CITY` = 128 × `VOX_M` = 6,4 m, toutes les dimensions sont des multiples
  ENTIERS. À distance de ville on ne résout que la maille, jamais la brique — c'est ce qui la fait
  appartenir au même monde que les caisses sans coûter un million d'instances.
  (3) **Flux de tirage DÉRIVÉ** (`mulberry32(seed^0x5EED10C1)`), JAMAIS `rnd` : un seul appel de plus
  dans la suite seedée décalerait toute la génération en aval (même précaution que la 2e vague de plots).
  (4) **2 draw calls** : corps (`InstancedMesh` + MeshLambert → hérite gratuitement des 10 biomes ET du
  brouillard) et couronnes (MeshBasic dans l'accent de zone `accC`, celui des rails — la règle de
  couleur n'est écrite qu'une fois). Mesuré : **4 696 volumes + 1 083 couronnes ≈ 69 000 triangles**,
  soit 5 grappes de raisin pour 3 km de ville. `setColorAt` nuance chaque tour sans casser l'appel unique.
  (5) ⚠⚠ **LE PLANCHER NE PEUT PAS ÊTRE FIXE — et c'est la mesure qui l'a dit.** Premier jet posé à
  `trackMinY-420` (par analogie avec la prairie du parc) : **INVISIBLE en jeu**. L'altitude réelle du
  ruban sur une zone tirée au hasard va de **-3 544 à +693, soit 4 237 unités d'amplitude**, et la caisse
  se retrouvait **3 860 au-dessus des toits pour 2 600 de brouillard**. Le remède vient d'une
  dissymétrie mesurée elle aussi : l'étendue HORIZONTALE de la piste n'est que de ~1 800 unités,
  largement dans le rayon de 3 000 de la ville → **on ne touche pas à X/Z** (la parallaxe horizontale,
  celle qui vend la profondeur, reste VRAIE) **et seule l'ALTITUDE suit la caméra, avec retard**
  (`cityTick`, `CITY_LAG` .55, butées `CITY_MIN` 520 / `CITY_MAX` 1700). Une ville collée à la caméra
  serait un décor peint ; une ville qui la suit avec retard se laisse rattraper dans les plongeons.
  ⚠ les butées ne sont pas décoratives : sans elles un plongeon de 3 000 unités laisserait la ville
  AU-DESSUS de la caisse, ou très au-delà du brouillard.
  (6) ⚠ **libération** : le groupe ET chaque enfant sont poussés dans `trackMeshes` — le `scene.remove`
  sur un enfant de groupe est un no-op inoffensif, mais le `dispose` doit avoir lieu, sinon on fuit une
  ville de VRAM à chaque portail. (7) no-op si `PARK.on` (le parc a sa prairie).
  Hook : **`dbgCity()`** (nb d'objets, altitude, distance sous la caméra, `FOG_F`).
  ⚠ **VÉRIFIÉ PAR INSTRUMENTATION, PAS ENCORE VU À L'ÉCRAN** : syntaxe (JavaScriptCore), construction,
  2 draw calls, `instanceColor` actif, couronnes à l'accent de zone, **882 unités sous la caméra pour
  3 500 de brouillard**, `window.__loopErr` vide — mais la pane de test était masquée au moment de la
  capture et je n'ai JAMAIS vu cette ville rendue. **À confirmer par le user en jouant pour de vrai**,
  et notamment : densité, hauteur des tours (`CITY_H` 420) et distance (`CITY_BELOW` 900) sont les
  trois boutons de cadrage.

## LE CHANTIER EN COURS (brief du user, 2026-08-30) — pas encore fait
> Noté ici pour ne rien perdre. **Rien de ce bloc n'est implémenté à ce jour, SAUF le point 4**
> (voir plus bas, 2026-09-05 : le splash atterrit désormais dans le garage, qui a reçu son propre
> bouton JOUER et son Top 10 — le reste de ce bloc, points 1/2/3/5/6, reste à faire).
1. **LE MOTEUR SE GAGNE À LA VITESSE, PLUS À L'ARGENT** — on sépare les deux économies pour de bon :
   le palier monte quand on TIENT la vitesse maximale atteignable par le moteur courant (nitro à fond,
   grande ligne droite). **JAUGE VIOLETTE** qui se remplit tant qu'on reste appuyé sur la nitro ;
   pleine = palier suivant. (⚠ `addCoins`/`DENOMS` ne pilotent donc plus `engTier`.)
2. **LES FIGURES PAIENT EN NITRO OU EN PIÈCES** selon leur difficulté ET l'aura. Le **BUMP** ne donne
   pas de pièce : il donne un MULTIPLICATEUR.
3. **LE SLOW-MO DU DÉCOLLAGE DÉMÉNAGE** : il quitte le décollage (que la jauge violette occupe
   désormais) et va sur les TREMPLINS — que le user juge ratés et qui sont à refaire.
4. ~~**LE GARAGE DEVIENT LE MENU**~~ **FAIT (2026-09-05)** : le sélecteur de niveau n'existait déjà
   plus (la radio aléatoire l'avait remplacé le 2026-09-03) ; il ne restait que l'écran d'accueil
   séparé — supprimé de la première visite, voir plus bas.
5. **UNE PAGE SCORE** entre la fin de partie et le menu garage — barrière volontaire, avec de la place
   pour une pub ou deux.
6. Carte blanche sur l'esthétique : « fais les changements nécessaires et non nécessaires ».

## PROBLÈMES NON RÉGLÉS — le carnet des trucs à régler
> ⚠ **Ce ne sont PAS des idées, ce sont des défauts constatés en JOUANT.** Ils sont notés avec les mots
> exacts du user, même quand ils sont flous : un symptôme mal formulé mais VRAI vaut mieux qu'un
> diagnostic propre et inventé. Statut **INDÉFINI** = pas encore reproduit, pas encore mesuré, cause
> inconnue — ne pas « corriger » un INDÉFINI à l'aveugle (les 5 rondes ratées du clignotement des nuages
> sont là pour rappeler ce que ça coûte). **La première étape de chacun est une CAPTURE VIDÉO du user**,
> pas une lecture de code : le pane headless gèle le rAF et ne rend aucun pixel.

- **[INDÉFINI] LES NUAGES SUR LA ROUTE** — mots du user : « nuages sur la route ». À préciser : est-ce
  qu'un nuage se pose SUR le bitume et bouche la vue au point qu'on ne voit plus où l'on va (problème de
  PLACEMENT — voir les familles « bancs sur route » de `buildClouds`), ou est-ce le white-out en le
  traversant (`DoubleSide` : dedans on voit la paroi — c'est documenté comme VOULU, à re-trancher),
  ou est-ce qu'il masque une réception / un trou de gap catapulte (là c'est un problème de JEU, pas de
  décor). Les trois ont des remèdes opposés, donc ne rien toucher avant de savoir lequel c'est.
- **[INDÉFINI] LA ROUTE PASSE À TRAVERS** — mots du user : « bug route passe a travers ». À préciser :
  la CAISSE traverse la dalle (échec du balayage anti-tunnel `prevH`/`prevL` de `tryLand` — vérifier que
  c'est bien `dtF` et pas `dt` qui lui est passé), ou le RUBAN se traverse lui-même (le générateur
  s'auto-croise : `11` TIRE-BOUCHON et `12` ENTRELACS créent des étages volontairement proches, la chute
  par tour peut être insuffisante quand `LV` élargit les rayons), ou deux morceaux de piste se
  chevauchent visuellement au portail. Noter la VITESSE et l'endroit au moment du bug.

- **[EN PAUSE] LES ANIMATIONS — et la musique, dégelée juste assez pour ajouter des morceaux** —
  décision du user (2026-08-30) : *« la musique tout ça et les animations, mettons de côté »*. Ce n'est
  PAS abandonné, c'est GARÉ. ⚠ ne pas « améliorer » le ciel réactif ni le branchement musical en
  passant, même si l'occasion se présente au détour d'une autre tâche — c'est exactement comme ça qu'un
  chantier garé se rouvre tout seul. **AJOUTER UN MORCEAU, en revanche, est une opération à une ligne
  et ne rouvre rien** (fait le 2026-09-23 sur demande explicite).
  ÉTAT ACTUEL : **3 morceaux** dans `MUSIC_TRACKS` (⚠ la table s'appelait `MUSIQUES` dans une version
  antérieure de cette doc — ce nom n'existe plus) : NÉON CASH CAR (3:02) · CASH CAR VITESSE (2:37) ·
  **HEYMIKEY! — IN DA BACK 2 (3:46)**. Pas de musique de menu (`MUSIC.menu:''`, l'entrée existe et
  attend son fichier). 4 mp3 ORPHELINS dans `assets/audio/music/` sans être référencés
  (`lvl1-chrome-ledger`, `lvl1-neon-cash-car` [v1, remplacée par la v3], `lilb-bor`,
  `nettspend-nothinglikeuuu`) : à trancher, garder ou jeter — ils ne pèsent PAS dans le fichier
  autonome (`faire-le-fichier-a-envoyer.py` n'embarque que les mp3 RÉFÉRENCÉS, vérifié : le compteur
  est passé de 20 à 21 en ajoutant une seule piste).
  **LA RECETTE POUR EN AJOUTER UN** (2026-09-23) : (1) renommer le fichier en **ASCII sans espace**
  avant de le copier dans `assets/audio/music/` — ⚠ c'est LA règle non négociable, déjà écrite au-dessus
  de `MUSIC_TRACKS` : un espace ou un « ! » exige un percent-encoding, et une URL mal encodée **n'échoue
  pas, elle se tait** ; le jeu démarre muet ET le décor réactif avec lui, sans une ligne d'erreur
  (le fichier reçu s'appelait « HEYMIKEY! - IN DA BACK 2.mp3 », deux espaces et un « ! ») ;
  (2) une ligne dans `MUSIC_TRACKS` ; (3) incrémenter `CACHE` dans `sw.js` ; (4) relancer
  `faire-le-fichier-a-envoyer.py`. Rien d'autre : la radio tire au hasard dans le pool et le décor se
  branche tout seul sur l'analyse du morceau.
  ⚠ **LE FICHIER AUTONOME GROSSIT VITE** : 13,3 → **20,2 Mo** pour ce seul ajout (un mp3 en base64 coûte
  +33 %). À surveiller si le pool s'allonge — c'est le fichier que le user double-clique.
  VÉRIFIÉ EN VRAI : syntaxe (JavaScriptCore), HTTP 200 `audio/mpeg` 5 425 572 o, **décodage réel par le
  navigateur** (`loadedmetadata` → 226,1 s, ce qui écarte précisément la panne silencieuse ci-dessus),
  `dbgRadio().poolSize:3`, et le tirage simulé sur 3 000 passages : **33,3 % pour le nouveau morceau,
  0 doublon consécutif**. Hook : `dbgRadio()` / `dbgRadio(true)` (force l'enchaînement).
  Reste à préciser au dégel : ce qui n'allait pas dans les ANIMATIONS (le user n'a pas encore dit
  lesquelles ni ce qui cloche).

## Idées de suite (backlog)
- Boucliers/malus dans les nuages sur route (risque/récompense de la percée à l'aveugle).
- Mode contre-la-montre par zone + fantôme du record.
- Voix supplémentaires (bump.mp3, fever.mp3) — suivre le pattern ANN_LIB + règle du 1/3.
- Gamepad (API Gamepad).
- Réglage qualité auto (compter les ms/frame, réduire nuages/particules si <50 fps).
