# Audit du jour — lot B (commits poussés le 2026-11-10)

Lecture seule de `code/` sur la branche debug-gameplay (main v1424 + correctifs, tête 1ff2da3f). Aucun navigateur, aucun assemblage.
Preuve écrite : `passation/debug-gameplay/preuves/roches-forme.cjs` (forme visible des roches de Jupiter contre l'ellipsoïde qui tue).

## 1. Verdicts par commit

| Commit | Sujet | Verdict | Ce qui a été vérifié |
|---|---|---|---|
| 6f2c97df | Orbite : Terre + satellites, Mars vide, Jupiter + roches | SAIN (jeu) · DÉFAUT léger (JB-03 vient du correctif 1ff2da3f) | `orbiteBuild` remet `ROCHES.count/visible` à zéro sur chaque piste (y compris hors orbite) ; `peuple` lu dans `LVL.cur.astre` (défaut 'satellites') ; Mars : retour avant toute pose ; roches posées UNE fois (matrices fixes, pas d'aRot ni de train) ; `libre(...)` les garde à ROAD_HALF+1,7·rad+3,5 m de TOUTE portion de route ; `PLANETES_ON` ne fait qu'ajouter des météos midi/soir à la carte espace. Shader du globe : `uSunO`/`uTyp` posés dans `onBeforeCompile` du globe ET de l'atmo, clé de cache changée (globeJourNuit5, atmoDegrade3) : pas d'ancien programme réutilisé. |
| 58467102 | La planète reste dans le monde | SAIN (jeu) · DÉFAUT visuel douteux en PAYSAGE (JB-06) | `lvlPlanete` : `LVL.az` remis au cap tant que `LVL.espace<.05` (pas d'état collé d'un niveau à l'autre) ; la planète reste à `PLANET_D` de la caméra (inatteignable, aucune collision à prévoir). Les seuils 66° / 80° sont pensés pour le portrait. |
| 1ff2da3f (correctif debug, relu sévèrement) | Les roches de Jupiter tuent | SAIN sur la piste pré-bâtie · DÉFAUT faible de forme (JB-03) | Voir §2. |
| 429e3298 | Grottes : lave et eau sans dents de scie | DÉFAUT (JB-01) | La roche visible près des lacs est déplacée verticalement jusqu'à 0,4 case (4,8 m en grotte vaste) ; la collision lit la densité non déplacée. `grtSalAt` / `enSalle` : ne font que REFUSER des poses (moins de décors, aucun nouveau) ; `grtR6` copié dans le travailleur (liste `fns`) : pas d'oubli de nom côté Worker. `GT.MAGMA` n'est plus posé, le rougeoiement passe au fragment (`uLacW` posé à chaque `buildGrotteG`, -1e5 sans lac). |
| 350bb739 | La forêt quitte main | SAIN · DÉFAUT faible (JB-07) | Aucun nom forêt appelé sans être déclaré (`non-declares.cjs` : les 53 noms restants existaient déjà avant, gardés par `typeof` ou globals du navigateur/scripts externes) ; `SF_CARTES.foret` retiré → tous les accès `SF_CARTES[x]` sont gardés (`sfImpose`, `prebCible`, `pisteDirecte`, `depart-avance.js:28-34`) : `?carte=foret` ou un vieux tirage retombe sur une map au hasard ; la sauvegarde ne garde pas de « map en cours » ; missions « chaque map » : total = `m2Cartes()` recalculé, et `m2Vues` ignore une map sortie (une vieille sauvegarde qui a joué la forêt ne gagne ni ne perd) ; pré-bâti : `PREB_PISTES`, `prebChampsDe`, `prebDecorG`, `PREB_CPU_DEF` nettoyés ; `foretSentiersPose`, `foretTick`, `foretHeurt`, `foretChauffe` retirés des appelants. Restes inoffensifs : commentaires, `SONS_CARTE.foret` (sons jamais préchauffés), I18N « LA FORÊT NOIRE ». |
| c77a1f4c, 9966ff5f | Le faisceau des phares partout (hlMonde) | SAIN (compilation) · DÉFAUT de coût (JB-04) | `HLW_GLSL` déclaré dans `bitume-beton.js` (ordre 84) avant canyon (91), dunes (96), glacier (103) ; inséré seulement dans des FRAGMENTS (CY_FS, DN_FS, BK_*_FS) qui ne déclarent pas déjà `uHlK/uHlC/uHlN` → pas de double déclaration ; uniformes fournis par `...HLW_U` dans les trois matières ; `uHwP/uHwF/uHwR/uHwU` posés par `lumTick` chaque image. Le patch `lights_pars_begin` (PHS) : la ligne cherchée existe dans `vendor/three.min.js` ; seule la lumière à `coneCos==cos(.7)` change (headSpot) ; `villeApres` n'écrase plus l'angle. `uPhP/uPhD/uPhC` restent posés (inutiles, sans danger). |
| a2a3b303 | Le repère des phares suit avec retard | SAIN | Filtre `k=min(1,dt*10)` (indépendant de la cadence au premier ordre), recalage si `fs·F<.5` (demi-tour, réapparition). Rien ne touche la physique ni la collision. |
| 68416bac (+ fusion fc94db62) | Passe optimisation 10/11 | SAIN | `acesPass.needsSwap=false` : l'ACES est la DERNIÈRE passe et rend à l'écran (aucune passe ajoutée après, `insertPass` absent) ; cibles du halo sans profondeur (créées paresseusement, `setSize` garde le drapeau) ; seuil des mipmaps du flou = formule exacte du shader (`sp=uSpeed*(uFv.w+(1-uFv.w)*uSpeed)`, .0185 < .02) ; `clear(true,false,false)` du ciel (couleur seule, la passe repeint tout) ; jauge de pouvoir au 1/400 ; tonalité mise en cache par `src`. Rien ne touche collision, placement ni cadence de simulation. |
| 8f4439fa (+ fusion fc31cad4) | Le vrai capteur thermique d'iOS d'abord | SAIN | Sans capteur (navigateur, binaire d'avant) : `MOB_S.capteur` reste faux → modèle d'avant mot pour mot. Le Swift (`GardeThermique.envoie`) envoie `thermalState.rawValue` (entier 0-3) ; une valeur inattendue (chaîne, NaN) donnerait 0 = nominal (`n|0`), borne 0-3 ailleurs. Capteur en pleine course : `cadence.js:80` cale sur 30 dès `mobChaud()` vrai (comme avant avec la dose) ; un passage 30↔60 change seulement `dt` (même situation que la cadence réactive d'avant ; les heurts en vol sont sous-échantillonnés à 60 depuis PG-02). État collé : `capteur` reste vrai pour la session (voulu) ; `actif` posé par la cadence réactive en état « fair » tient le 30 jusqu'au retour à « nominal » (choix de conception). `MOB_PN` n'a pas d'index négatif (avec capteur, `mobPalCible` rend `thermo` 0-3). |
| 602f811a | 3D indisponible au démarrage | SAIN · DÉFAUT faible (JB-05) | `ccRendEssai` (rechargements du renderer) et `ccCtxPerdu` (pertes rapprochées, IOS-02) sont deux compteurs distincts, sans double comptage : une boucle « renderer OK → contexte reperdu » finit sur l'écran « a calé » à la 4e perte en < 2 min, une boucle « renderer refusé » après 3 essais. `sessionStorage` interdit → k9=9 → écran d'erreur direct (comme avant). Le chien de garde des 8 s n'est pas prévenu (JB-05). |
| 0edea248, 76d9a0e8, b3062cb7, 7d272cf0 | PC adaptatif (régime du poste) | SAIN pour le téléphone et l'app | `POSTE.pc=!TEL_NATIF` ; `TEL_NATIF` = tactile ET (`hover:none` ou petit écran) : vrai sur tout téléphone, dans l'app comme dans Safari → `POSTE.auto` faux, `ALLEGE` inchangé. `ALLEGE` est une `const` évaluée au chargement : il ne change jamais pendant une session (les obstacles ne changent pas en cours de partie). Seul cas limite : un iPad avec clavier/trackpad (hover vrai, écran ≥ 600) est classé « ordinateur » — ce l'était déjà avant (MAX) ; il peut maintenant passer ALLÉGÉ d'une visite à l'autre (contenu des maps sobres), jamais en cours de partie. Les fusions (7d272cf0, b3062cb7, 76d9a0e8) n'apportent côté poste que `posteCadOk` / `posteJuge`, gardés par `POSTE.auto`. |

## 2. Relecture sévère de `rochesHeurt` (1ff2da3f)

- **Pré-bâti** : `orbiteBuild` n'est appelé QUE par `buildTrackG` (`depart-avance.js:469`), APRÈS `pisteInstalle(W)` : les roches sont toujours celles de la piste où roule le joueur. Le pré-bâti (`prebDecorG`) ne connaît que grotte et banquise ; aucun `prebAvec` ne tourne pendant la physique (prebTick est en fin de boucle). Pas de cas « roches d'une autre piste ».
- **Visibilité** : `ROCHES.visible = LVL.espace>.01 && !garageOn && !stallOn && !MENUV.bio && ORB.actif && count>0` (orbite-2.js:153) ; `ORB.actif` faux au parc (`PARK.on`). Pendant le fondu d'entrée (espace .01-1) les roches sont presque couleur brume mais dures — sans effet : au début du niveau on est sur la route, à ≥ 4 m du bord des roches les plus proches.
- **Mathématique** : quaternion inverse correct (preuve `roches-heurt.cjs`, 0 désaccord sur 20 000 points) ; une roche est inscrite dans toutes les cases de 120 m que touche sa sphère englobante (demi-axe max) → un point dedans interroge toujours une case qui la contient.
- **Forme (JB-03)** : `roches-forme.cjs`, roches du BORD (rad 4-18, forme .75-1,35 par axe), 24 000 rayons :
  - PC (icosphère détail 3, rayon local réel .67-1,17) : on meurt dans le vide devant la surface vue sur 76 % des rayons — médiane 0,66 m, 95e 1,61 m, max 3,55 m — dont 0,9 m est la demi-caisse voulue ; on entre DANS la pierre avant de mourir sur 24 % — médiane 0,45 m, 95e 1,76 m, max 3,59 m.
  - Téléphone (détail 1, facettes plus grandes) : vide 89 % (médiane 0,81, 95e 1,68, max 4,09 m) ; dans la pierre 11 % (médiane 0,34, 95e 1,35, max 2,85 m).
  - Donc : au-delà de la demi-caisse, le vide « injuste » dépasse rarement 0,8 m (95e) ; le pire (3-4 m) est sur les plus grosses roches, dans un creux profond. Acceptable ; voir JB-03 pour l'affiner.
- **Cadence** : sous-pas à la densité de 60 i/s (comme les autres heurts) ; la plus petite roche qui tue est un éclat du champ (≈ 1,4 m × .75 → demi-axe 1,8 m), à ≥ ROAD_HALF+90 m de la route. À 900 km/h un pas de 60 i/s fait 4,2 m : un éclat de 3,6 m de large peut être sauté. Négligeable (loin de la route).
- **Coût** : hors orbite deux tests de propriété ; en orbite UNE recherche de case par appel (une chaîne `'x,y,z'` allouée, 1 à 3 appels par image) ; grille rebâtie paresseusement (≤ 280 `decompose`, < 1 ms) au premier vol après chaque pose. Sain.
- **Ordre de la chaîne** : la branche roche passe avant `tryLand` ; aucune roche ne touche une dalle (`libre`), donc aucune pose volée.

## 3. Inventaire « visible mais sans collision »

| Map | Objet | Taille | Distance à la route | Immobile ? | Choc ? | Proposition |
|---|---|---|---|---|---|---|
| Orbite (Terre, matin) | **Starlink / débris FLOTTANTS** (`orbite-2.js:50-63`, couche 0 bis) | Starlink rad 9-13 m (envergure 18-26 m), débris 7-11 m | 4-16 m du BORD, de −6 à +14 m autour de la dalle ; seuls, en porte, en file | Posés une fois, tournent sur eux-mêmes (`aRot`, .04-.16 rad/s), pas de dérive | **Aucun** | **À corriger en premier** (JB-02) : ce sont les « météorites » de la Terre, à portée de n'importe quel saut. |
| Orbite (Terre) | Starlink PASSANTS (couche 1) | rad 16-40 m | 14-52 m au-delà du bord + 1,1·rad ; +6/+36 m ou en contrebas | rotation propre lente | Aucun | Même liste que JB-02 (un saut latéral les atteint) ; à décider. |
| Orbite (Terre) | Champ : débris / éclats / Starlink (couche 2) | 3-49 m | ≥ ROAD_HALF+100 m de côté, ou 90-590 m au-dessus | rotation propre | Aucun | À laisser (hors de portée d'un vol normal), ou même liste si Sacha le veut. |
| Orbite (Terre) | Trains Starlink (couche 3) | rad 19-26 m, files de 1,5-2,6 km | ≥ 140 m de toute route, 240-560 m au-dessus | **glissent** (38-64 m/s) | Aucun | À laisser (inatteignables, mobiles). |
| Orbite (Terre) | Anneaux de débris (couche 4) | 6-46 m | rayon 1-2,6 km, ≥ ROAD_HALF+90 m | rotation propre | Aucun | À laisser. |
| Orbite (Jupiter) | Roches bord / champ / grands blocs | 4-120 m | voir §2 | immobiles | **Oui (aujourd'hui)** | Fait ; JB-03 pour la forme. |
| Orbite | Poussière cosmique (`orbBeau`), planète, lune (retirée du ciel) | — | planète à `PLANET_D` de la caméra (la suit) | — | Aucun | À laisser (décor d'astre, inatteignable). |
| Jade | Grappes de **cristaux** (13-28 m) et pins peints (11-22 m) posés sur les cimes | voir MAP-A05 | sur les montagnes du bord | immobiles | Aucun (`jadeHeurt` s'arrête au dessus de la montagne) | Déjà noté MAP-A05 : cylindre `r≈.32h` de `q[4]` à `q[4]+h` dans `jadeHeurt` si Sacha veut des cristaux durs. |
| Grotte (luxuriante) | **Lianes** (`grottes-2.js:57-59`) | longueur 24-100 m (vaste ×2,4), épaisseur 0,8·g9 | `grtLibre` à 2·g9 m de la route (la plus proche des décors) | immobiles | Aucun | Fines : à laisser, ou un `grtCol` mince (`hx=hz=.4*g9+.9`, `hy=Lv/2`) si on veut les rendre dures. Les **azalées** (octaèdres de 2,6-5·g9) : idem, à laisser (végétation). |
| Grotte | Gemmes dans les parois, torches, sculk, capteurs, feux d'âme, pingouin (ventre, yeux, ailes) | 1-5·g9 m | collés aux parois / au corps du totem (qui, lui, est dur) | immobiles | Aucun | À laisser (dans ou contre une surface dure). |
| Grotte | Cristaux des grottes embellies : grappe principale dure seulement si `L>9` (`grottes-embellies.js`), éclats jamais | ≤ 9 m | plantés dans la roche | immobiles | Partiel | À laisser (petits, dans la paroi). |
| Crypto City | Dirigeables à écran | ~2×48 m (réserve) | 75-155 m de côté, 70-120 m au-dessus | balancent ±3 m | Aucun | À laisser (hors de portée sauf vol extrême). |
| Crypto City | Diamants | r 6-11 m | 60-220 m de côté, 90-210 m au-dessus | tournent | Aucun | À laisser. |
| Crypto City | Pièces ₿ géantes | r 13-25 m | 40-150 m de côté | tournent | **Traversables exprès (paient)** | Rien. |
| Nuages | Bancs de nuages | — | sur et autour de la route | — | Traversables exprès (rendent de l'airtime) | Rien. |
| Canyon | Mitaines, arche, cheminées de fées, tunnel, mine | — | — | immobiles | Oui (`canyonHeurt`, `cyMonuHeurt`…) | Rien. |
| Ville (nuit) / tours | Tours | — | — | — | Oui (`villeHeurt`) — voir MAP-A07 (bande de 0,9 m) | Rien de neuf. |

## 4. Défauts, par gravité

### JB-01 — Grotte : la roche visible et la roche qui tue décalées jusqu'à 4,8 m le long des lacs (MOYENNE · PROBABLE)
- Commit 429e3298 ; `code/maps/grottes-1.js:558` (`const Y9=…,dy9=Y9&&Math.abs(wy-Y9.y)<B*.4?Y9.y-wy:0;`).
- Scénario : grotte vaste, salle de lave (ou d'eau), on vole bas au ras d'une BERGE en pente douce : la berge dessinée a été abaissée jusqu'au niveau du lac (jusqu'à 4,8 m), la densité ne l'a pas été → la caisse meurt « roche » dans l'air au-dessus de la berge vue ; à l'inverse un sommet immergé jusqu'à 4,8 m sous le niveau est remonté à la surface : on voit la lave à un endroit où la collision ne trouve que de l'air (on « entre » dans la lave sans mourir, jusqu'à 4,8 m plus bas).
- Cause : déplacement VERTICAL de tout sommet qui touche une case de lac (`lv` 4/5), quelle que soit l'orientation de sa surface. Écart dans la direction de la surface = |dy|·|n_y| : nul sur une paroi verticale (le sommet glisse dans le plan du mur — c'est le cas utile, la ligne d'eau droite), jusqu'à 4,8 m sur une berge plate (B = 12 m, `GRT_VASTE` vrai par défaut ; 3,2 m sans).
- Correctif minimal (garde les lignes d'eau droites le long des murs, plafonne l'écart réel à la demi-caisse) — `gx,gy,gz,gl` sont déjà calculés juste au-dessus dans la même boucle :
  ```diff
  -    const Y9=lv===4?GROTTE.lac:lv===5?GROTTE.eau:null,dy9=Y9&&Math.abs(wy-Y9.y)<B*.4?Y9.y-wy:0;
  +    const Y9=lv===4?GROTTE.lac:lv===5?GROTTE.eau:null,dd9=Y9?Y9.y-wy:0,dy9=Y9&&Math.abs(dd9)<B*.4&&Math.abs(dd9*gy/gl)<.9?dd9:0; /* l'écart réel (le long de la normale) ≤ 0,9 m : la collision lit la densité non déplacée */
  ```
  (La fonction est recopiée dans le travailleur par `toString` : rien d'autre à changer.) À vérifier au banc : `dbgGrotte('audit')` (lac) et une photo de rive de lave.

### JB-02 — Orbite (Terre) : les satellites et débris qui flottent au bord de la route se traversent (MOYENNE · SÛR, c'est la demande de Sacha « etc. »)
- `code/maps/orbite-2.js:50-63` (couche 0 bis `flotte`) ; aucune branche dans `boucle-3-physique.js:575-588`.
- Scénario : sur la Terre (matin), un saut au bord de la route passe à travers un Starlink de 20 m posé à 4-16 m du bord : aucun choc, alors que la même chose sur Jupiter tue depuis aujourd'hui.
- Correctif minimal (le plus simple qui tue DANS l'objet, jamais dans le vide autour, malgré la rotation propre) : une SPHÈRE INTÉRIEURE par objet flottant, au rayon du corps, pas des panneaux. Dans `flotte`, après `pose(k,…)` réussi, retenir le centre et un rayon prudent (`st ? rad*.22 : rad*.35`, + 0,9 m de demi-caisse), puis réutiliser la grille de `rochesHeurt` :
  ```diff
  # orbite-2.js, dans flotte() :
  -      pose(k,x,y,z,rad,.04+r()*.12,st?(r()<.5?0:1):tire(DEB_P));};
  +      if(pose(k,x,y,z,rad,.04+r()*.12,st?(r()<.5?0:1):tire(DEB_P))>=0)ORB.durs.push(x,y,z,(st?rad*.22:rad*.35)+.9);};
  # orbiteBuild, à la remise à zéro :  ORB.durs=[];
  # orbite-roches.js : rochesHeurt teste aussi ORB.durs (≤ ~60 sphères : une boucle simple suffit, ou les ranger dans ROCHE_COL.g)
  +  const S9=ORB.durs;if(S9&&ROCHES.visible===false&&SATS[0].visible)for(let i=0;i<S9.length;i+=4){const dx=p.x-S9[i],dy=p.y-S9[i+1],dz=p.z-S9[i+2];if(dx*dx+dy*dy+dz*dz<S9[i+3]*S9[i+3])return 'roche';}
  ```
  (adapter la garde de visibilité : `SATS[k].visible`, posé par `orbiteTick`). Le rayon du corps est à mesurer sur `geoStarlink`/`geoDebris` (`dbgOrbite('sat',v)`) avant de figer .22/.35. Les passants (couche 1) peuvent entrer dans la même liste. Décision de Sacha pour le champ, les trains et les anneaux : « à laisser ».

### JB-03 — Roches de Jupiter : l'ellipsoïde qui tue ne suit pas le relief de la roche (FAIBLE · SÛR, mesuré)
- `code/maps/orbite-roches.js:56` (`sx=C.S.x*.86+.9…`) et `:66` (`<1`).
- Scénario : grosse roche du bord avec un creux : on meurt jusqu'à ~2,6 m (au-delà de la demi-caisse) dans le vide devant le creux ; sur une bosse, la caisse entre jusqu'à ~1,8 m (95e) avant de mourir. Chiffres : §2.
- Cause : un ellipsoïde fixe (.86 du rayon nominal) contre une surface qui va de .67 à 1,17 du rayon.
- Correctif (si on veut l'égaler) : garder la graine `aVar.x` par roche dans `ROCHE_COL.d` (11e valeur), et dans `rochesHeurt` comparer la longueur du point local (divisé par `S`, SANS les +0,9) au rayon local recalculé en JS (`h31`/`vn`/trois octaves, recopiés de `ROCHE_GLSL` — la fonction `rayon(n,s)` de `preuves/roches-forme.cjs`), avec la demi-caisse en marge : `if(Math.hypot(lx,ly,lz) < rayon(normalisé, s) + .9/Math.min(sx,sy,sz)) return 'roche';`. Coût : 3 bruits seulement pour la roche dont la boîte contient la caisse. Sinon, laisser tel quel (l'écart est rare et petit).

### JB-04 — Dunes, canyon (et glacier) : le faisceau des phares calculé en plein jour (FAIBLE · PROBABLE, coût GPU téléphone)
- Commits c77a1f4c/9966ff5f ; `code/maps/canyon-relief.js:115`, `code/maps/dunes-2.js:167`, test `uHlC.r+uHlC.g+uHlC.b>0.` dans `code/rendu/bitume-beton.js:176` ; `code/rendu/triptyque-bloom.js:618` (`LUM.hl+=…`) et `:659`.
- Scénario : canyon de jour sur téléphone : chaque pixel du relief (plein écran) fait les deux tours de boucle de `hlMonde` (exp, pow, smoothstep) pour une lumière nulle. Avant, `phBeam` n'était appelé que si `uPhC>.001`, exactement 0 de jour.
- Cause : `LUM.hl` tend vers 0 par un filtre exponentiel sans jamais l'atteindre (≈ 250 s avant le sous-dépassement des flottants), et `LUM.nuit` aussi : `uHlC` reste un tout petit positif, la condition de sortie ne joue plus.
- Correctif minimal : couper le reste du filtre.
  ```diff
  -  LUM.hl+=(((boom?0:1)*nu*(CAR_PHK==null?1:CAR_PHK))-LUM.hl)*Math.min(1,dt*(boom?12:3));
  +  LUM.hl+=(((boom?0:1)*nu*(CAR_PHK==null?1:CAR_PHK))-LUM.hl)*Math.min(1,dt*(boom?12:3));if(LUM.hl<1e-4)LUM.hl=0; /* le faisceau éteint l'est vraiment : hlMonde et LUM_GLSL sortent au premier test */
  ```
  (Effet visible nul : 1e-4 × LUMK.hl = 3 sur 30 000.) Profite aussi au bitume.

### JB-05 — 3D indisponible : le chien de garde des 8 s peut poser « n'a jamais démarré » pendant l'attente du rechargement (FAIBLE · PROBABLE)
- Commit 602f811a ; `code/page/debut-corps.html:256-258` (`garde`) ; `code/rendu/palier-appareil.js` (délais 1,5 / 3 / 5 s).
- Scénario : iPhone qui relance après une perte de contexte : script lu en 3-4 s, renderer refusé au 3e essai → rechargement prévu 5 s plus tard (≈ 8-9 s) ; le chien de garde (8 s, page déjà `complete`) pose l'écran « Le jeu s'est chargé mais n'a jamais démarré » une seconde avant le rechargement. Le gardien d'erreurs, lui, a bien été prévenu (`__ccRendAttend`).
- Correctif :
  ```diff
  -    if(!window.__gameReady&&document.readyState==='loading'&&n<12){garde(n+1);return;}
  +    if(!window.__gameReady&&(document.readyState==='loading'||window.__ccRendAttend)&&n<12){garde(n+1);return;} /* (rendu/palier-appareil.js) la 3D est en train d'être réessayée : on attend le rechargement */
  ```

### JB-06 — Orbite en PAYSAGE : la planète « qui ne bouge que hors écran » glisse à l'écran (FAIBLE · DOUTEUX, visuel)
- Commit 58467102 ; `code/maps/continuite.js:302-310`.
- Scénario : téléphone couché, vitesse haute : champ vertical ≥ 74°, rapport ≈ 2,16 → demi-champ HORIZONTAL ≈ 58-70°. Le retour lent (au-delà de 66° du cap) et la butée dure (80°) tombent donc DANS l'image en paysage, alors qu'en portrait (demi-champ ≈ 19-35°) ils sont hors cadre. Dans un long virage la planète, posée « dans le monde », se met à glisser ou se bloque au bord gauche, à l'écran.
- Correctif proposé : seuils relatifs au champ horizontal réel. `const hf=Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect);` puis `Math.abs(df)>Math.max(1.15,hf+.35)` et butée `Math.max(1.4,hf+.6)` (au plus ~1,9). À valider à l'œil (goût).

### JB-07 — Forêt retirée : deux peintures à défi deviennent impossibles à GAGNER (FAIBLE · SÛR)
- Commit 350bb739 ; `code/economie/boutique.js:323` (CAMOUFLAGE, `{k:'sc:foret',v:10}`) et `code/economie/livrees.js:213` (BLOC D'HERBE, `{k:'sc:foret',v:25}`) ; le compteur `m2Cpt('foret',…)` est retiré de `defis-moteur.js:268`.
- Scénario : l'écran du nuancier affiche « Joue 10 / 25 niveaux dans la forêt » avec une jauge qui ne bouge plus jamais (une vieille sauvegarde garde sa valeur `sc.foret`).
- Correctif minimal (dans le code de main seulement, la forêt n’est pas touchée) : changer la condition de ces deux peintures pour une condition jouable sur main, p. ex. `{k:'sc:ville',v:10,t:'Joue 10 niveaux en ville.'}` (compteur existant, defis-moteur.js:268), ou retirer leur `def` (la peinture reste achetable). Choix de Sacha (économie). Rien d’autre du retrait ne casse : ni portail ni carte postale (`PCUBE_PAL`, `PCUBE_CP` nettoyés), ni tirage, ni sauvegarde.

### Notes sans défaut
- Capteur thermique : en état « fair », la première image ratée active `MOB_S.actif` (mobReactif) et garde le 30 jusqu'au retour « nominal » ; voulu d'après le commentaire, à surveiller sur le téléphone de Léo (une course entière à 30 alors qu'iOS dit seulement « fair »).
- `rochesHeurt` alloue une petite chaîne par appel ; une clé numérique comme `orbiteBuild` (`cle(gx,gz)`) l'éviterait. Sans enjeu.

## 5. Non vérifié
Rien exécuté dans le jeu (pas de navigateur) : la compilation des shaders est jugée à la lecture ; JB-01 est chiffré par la géométrie (borne 0,4 case), pas mesuré sur une graine ; rayon du corps des Starlink (JB-02) à mesurer.
