# L'oreille neuve n°1 — audit son de CASH CAR (lecture seule, 2026-10-14)

Base lue : `son/integ/VERSION PRINCIPALE` (index.html, sfx.js, sons-banque.js par ses fiches, CLAUDE.md sections son).
Numéros de ligne = index.html (ils bougent). Aucun fichier du jeu modifié. Non audité à l'oreille (pas de navigateur) : tout vient du code et des fiches.

## Les 10 défauts, du plus audible au moins audible

### 1. Sur iPhone, la musique écrase les effets et ne se baisse jamais
- PREUVE : `VOL_LOCKED` (l. 35644) rend `el.volume` inopérant ; la musique joue donc à 100 % du fichier. Sur ordi la cible est `musVol()*(.62+.38*boost)` = 0,38 à 0,62 en course (l. 33919) et `*.5` au menu (l. 33920) ; sur iPhone elle vaut 1,0. Les effets sont calés sur l'ordi : `SFX_SOUS_MUS=.7` (l. 33456) et `VOL.mus` défaut .62. Sur iPhone la musique est donc +4 à +8 dB trop forte face aux effets, et +10 dB au garage. Le ducking de la musique (`mDuck`, annonceur, explosion `duckT`) et `MUS_CIEL` (.15 dans le ciel) n'y font rien non plus. Le curseur MUSIQUE est mort, et la note `#volLock` (l. 8690) ne parle que de « la voix ».
- POURQUOI : c'est le joueur cible (iPhone). Léo a déjà dit « on n'entend pas les bruits » (CLAUDE.md l. 367) ; mesuré sur ordi, pas sur iPhone. Chaque récompense perd son impact quand la musique est 6 dB au-dessus de ce qui a été mixé.
- CORRECTIF : (a) `sfxVol()` (l. 33457) : `VOL.sfx*SFX_SOUS_MUS*(VOL_LOCKED?1.6:1)` (+4 dB, la différence 1,0 vs ~.62). Le limiteur −1 dBFS (l. 34849) protège. (b) Sur iPhone, créditer le ducking aux effets : les chaînes moteur/vent ont déjà `dk` ; le reste n'a pas de remplaçant, donc +4 dB suffit. (c) Cacher les lignes curseur MUSIQUE si `VOL_LOCKED` et réécrire `#volLock` (« le volume de la musique et des voix »). Rien ne touche au gameplay.

### 2. Les pièces plafonnent sur la même note après la 11e
- PREUVE : `blip()` l. 35174 : `GAMME_P[Math.min(combo-1, GAMME_P.length-1)]`, `GAMME_P` a 11 entrées (l. 35165, plafond +24 st). `combo++` n'a pas de plafond et `comboT=3` s (l. 48703) : une ligne de 30 pièces joue 20 fois la même note aiguë (v2, rj .003, cd .018).
- POURQUOI : la ligne de pièces est LE geste le plus répété du jeu. Après la gamme, c'est une mitraillette monotone, et c'est justement là que le joueur est « en flow ».
- CORRECTIF : après l'index 10, replier sur la dernière octave en aller-retour : `const T=[12,14,16,19,21,24,21,19,16,14]; st = k<=10 ? GAMME_P[k] : T[(k-11)%T.length]` (st max 24, les bases [0,12] du `piece` le supportent déjà). Option : à chaque 10e pièce, ajouter `sfx('piece',{st:st+7,vol:-6,t:.04})` (la quinte, épaisseur « chorale »).

### 3. Les échelles de vol (figures, frôlé, aura) plafonnent trop tôt
- PREUVE : `echSt()` l. 34664 : `Math.min(9,ECH++)` → dès le 10e geste du vol, plus de montée (19 st). `froleSnd` l. 35263 : `Math.min(9,n-1)` idem. Chaque demi-tour de vrille appelle `echSt()` (l. 36483) : 5 tours de vrille et la gamme est finie, avant le premier BIG AIR (l. 50025) et le palier d'échelle (l. 37912), qui tombent alors sur la même hauteur.
- POURQUOI : le vol est le moment le plus riche ; la promesse « tout monte » s'arrête au moment où le joueur enchaîne le plus.
- CORRECTIF : même repli en aller-retour sur l'octave haute (comme pour les pièces) ; ou, au-delà du 9e degré, doubler la note d'une quinte (`sfx(id,{st:s+7,vol:-7,t:.03})`). Dans `echSt` : `ECH++>9 ? sonPd(9-((ECH-10)%4)) : …`. Pour `froleSnd` idem.

### 4. Les fruits ne montent pas à l'oreille
- PREUVE : l. 37755 `sfx(FRUIT_SON[nom],{rate:1+Math.min(5,r-1)*.025})` : le pas de la série est 2,5 % de vitesse (soit 0,4 demi-ton) alors que la fiche tire `rj .06` (±6 %, ±1 demi-ton) au hasard. Le hasard est plus grand que l'escalade : inaudible. Les fiches `fruit.*` sont `key:0` (hors tonalité) ; `fruit.rafale` (r≥3) joue sans `st`.
- POURQUOI : la série de fruits est la chaîne de récompense du nitro ; il n'y a aucun signal sonore de « je monte ».
- CORRECTIF : `rate:Math.pow(2,sonPd(Math.min(4,r-1))/12*0.5)` (monte jusqu'à ~+7 st sur le splotch, sans devenir chipmunk) et `sfx('fruit.rafale',{st:sonPd(Math.min(9,r-3))})` (elle est `key:1`, donc dans la gamme du morceau). Le `rj` de la fiche (sfx.js, valeur lue sur `S.m[id]`) peut aussi être baissé à .02 pour les fruits via un réglage au `init` côté index.html (`CCSON` ne l'expose pas ; passer par `o.rate` au contraire de `rj`).

### 5. Frénésie sans sa musique : un trou possible au 1er passage, puis une simple accélération de 6 %
- PREUVE : `dark-triad.mp3` absent (`ls assets/audio/music`). `FRENM.ok` ne passe à `false` que par la sonde HEAD/`error` (l. 33692-33699). Sur iPhone (appli native, schéma non-HTTP) le HEAD peut échouer sans réponse : `ok` reste `null` et `frenMus(true)` (l. 33726) pose `el.src=MUSIC_FREN.f`, la radio coupe, l'`error` arrive, `frenMusRate` (l. 33716) recharge la radio à `FRENM.t` : une coupure audible de 0,3 à 1,5 s, pile quand le joueur entre en frénésie. Ensuite la radio passe à ×1,06 (`MUSIC_FREN.surm`, `preservesPitch=false`) : +1 demi-ton, la tonalité suit bien (`sonTonSuit` +1, l. 34676), mais ça reste un bonus à peine perceptible comparé à `frenesie.entre` (+7 dB, prio 8).
- CORRECTIF : tant que le fichier manque, mettre `f:''` dans `MUSIC_FREN` (l. 33689) : le test `MUSIC_FREN.f&&FRENM.ok!==false` passe direct au repli surmultiplié, sans changement de source, donc sans trou. À remettre quand Léo livre le mp3. Option : `surm:1.09` (+1,5 st) pour que le repli s'entende.

### 6. Le ducking `SON_DUCK` est incohérent d'un grand moment à l'autre
- PREUVE : l. 34655-34657. Creusent le mix : `aura.x10` .4, `verdict.2` .35, `pwr.triple` .35. Ne le font pas, alors qu'ils sont plus forts ou égaux : `aura.x8` (+3 dB, prio 4), `aura.x5` (+2), `fig.snake` (+3, prio 4), `fig.essoreuse` (+3, prio 3), `fig.dauphinRoyal` (+2, prio 3), `pwr.double` (+3), `frenesie.record` (+3, prio 5), `argent.gros` (+1), `verdict.1` (+2), `jeu.miracule` est dedans mais pas `jeu.palierVitesse`. `defaite` .3 contre `victoire` .4.
- POURQUOI : le moteur, le vent et la flamme restent à plein pendant ces fanfares : elles passent mal. La hiérarchie n'est pas perçue de la même façon selon qu'on est en ×10 ou ×8.
- CORRECTIF : ajouter à `SON_DUCK` : `'aura.x5':.2,'aura.x8':.3,'fig.snake':.3,'fig.essoreuse':.25,'fig.dauphinRoyal':.3,'pwr.double':.25,'frenesie.record':.4,'verdict.1':.15,'argent.gros':.15`. Ne touche qu'au niveau des chaînes continues, pas au gameplay.

### 7. Le son de mort est tiré au sort parmi des « placeholders » et se superpose à l'explosion
- PREUVE : `DEATH_LIB` (l. 35533) : `minecraft.m4a` « placeholder », `explosion.m4a` « placeholder », `eww.m4a` (voix TTS « placeholder »), `gong.m4a`. `deathSound` (l. 35618) tire au hasard (jamais le même deux fois), tombe sur l'image de l'explosion (l. 32105) en plus de `boomSnd` → `sfx('explosion')` (+13 dB, l. 35462) et `duckT=1`. Les fiches `mort.*` de la banque (6 causes, +4 dB) existent à côté.
- POURQUOI : la mort arrive à CHAQUE partie ; une signature sonore reconnaissable (et « presque addictive », celle qui donne envie de rejouer tout de suite) vaut mieux qu'un tirage entre quatre sons dissemblables, dont un gong de cinéma et un « eww ». Le « eww » est écarté par défaut (`SANS_VOIX`, l. 71, sauf `?voix=1`) : en pratique 3 sons au hasard.
- CORRECTIF : ne garder que `explosion.m4a`+`gong.m4a` à poids 2:1 ou, mieux, jouer `mort.<cause>` (existent déjà) par-dessus une explosion ; baisser `v` de la déflagration de 0,70 → 0,55 pour qu'elle ne se cumule pas avec `sfx('explosion')`. À vérifier d'abord à l'oreille (je n'ai pas pu écouter).

### 8. Dans l'espace, le vent et le sifflement sont coupés alors que c'est là qu'on va le plus vite
- PREUVE : l. 50585 et 50590 : `*(SONV2?1-Math.min(1,LVL.espace):1)` sur `windG` ET `whG`. Il reste le moteur et `espace.ambiance` (−8 dB, bus amb, cd 1). CLAUDE.md « L'AUTOROUTE ORBITALE » : « vu qu'on va très vite ». La section « LA VITESSE QU'ON SENT » a pourtant retiré les plafonds du vent pour que l'oreille reçoive la vitesse.
- POURQUOI : le monde 3 (niveaux 21-30) est le plus rapide et devient le plus plat à l'oreille ; c'est aussi celui où l'on a le plus joué pour arriver là.
- CORRECTIF : garder un plancher : `(1-.75*Math.min(1,LVL.espace))` sur `windG` (rumeur grave sans l'air chuintant), `whG` laissé coupé. À régler à l'oreille (⚠ pas de physique touchée).

### 9. Les gestes de menu sont toujours le même « tic »
- PREUVE : `ui.tap` v1 / rj .012 (±0,2 st) / cd .035 ; `ui.nav`, `ui.retour`, `ui.on`, `ui.onglet` aussi v1. `uiClic` (l. 36005) joue l'id sans `st`. Garage, boutique et carrière enchaînent des dizaines de taps.
- POURQUOI : sur plusieurs minutes de menu, l'oreille entend un métronome ; les jeux au top en font une micro-mélodie qui s'accorde au morceau.
- CORRECTIF : dans `uiClic`, passer `{st:[0,2,4,2,7,4][uiClic._n=(uiClic._n+1)%6]}` pour `ui.tap`/`ui.nav` (ils sont `key:1`, donc dans la pentatonique du morceau) ; `ui.retour` redescend d'un degré. Aucune nouvelle cuisson.

### 10. Sons appelés mais absents de la banque
- PREUVE : `sfx('singe.troupe')` (l. 33163) et `sfx('caisse.atchoum')` (l. 21079) : aucune de ces fiches dans `sons-banque.js`. `sfx()` rend `null` sans erreur : le premier est muet, le second tombe sur `noiseBurst` (repli ancien). Fiches jamais citées dans l'index (retirées ou mortes) : `mallette.chaude`, `vitesse.pure`, `pwr.bouclierFin`, `pwr.bouclierPlot` (jamais appelé : le bouclier qui encaisse un plot ne sonne pas autrement que `plot`).
- CORRECTIF : `singe.troupe` → `sfx('fig.dauphin')`-like existant (ou `fantome.accroche` pour le côté « apparition ») ; `caisse.atchoum` → `sfx('pose.choc',{vol:-6})`; brancher `pwr.bouclierPlot` là où le bouclier encaisse (`grep bouclier`). Ne pas rétablir `vitesse.pure`/`mallette.chaude` (décisions).

## Ce qui est déjà au niveau
- Tonalité : les 15 morceaux de `assets/audio/music/**` ont leur ligne dans `SON_TON` (chris-*, ciel-n1-5, ville-n1-5, glassy, noite, swag, neon, vitesse, addictive) ; GLISSE à +1 ; `FRENM.surm` ajoute +1 (cohérent avec le ×1,06 de lecture).
- Le lecteur : 4 bus + salle débranchée au repos, chef d'orchestre à priorité (−9 dB aux sons moindres, `cede`), polyphonie et décalage de coupure à 15 ms, boucle exacte sans clic.
- La pose : `pose.choc` mis à l'échelle de l'impact, verdict qui résout, parfait/cheveu/lourde distincts ; départ en musique avec fondu en S.
- L'aura : `aura.geste` monte avec le × (sans plafond jusqu'à ×10) puis laisse la place à `aura.x5/x8/x10`.
- Interrupteur son : `musicSession()` bascule `playback`/`ambient` ; pause → `stopJeu`+`annuleFutur` ; les pièces ont +4 dB (Léo : « je ne les entendais pas »).

## Idées addictives hors liste
1. Quantifier les pièces sur la grille du morceau (`instruTempo`/`instruGrille` existent) : la ligne de pièces devient une partie rythmique de la musique.
2. Frôlé panoramique : `froleSnd` ne passe jamais `pan` ; `sfx` le supporte déjà (côté de l'obstacle −1…1).
3. Un « riser » pendant le vol : une couche filtrée qui monte avec `ECH` (0 → 9), résolue par `verdict.*` à la pose (sons existants `air.regain`/`jeu.palierVitesse` à `st` croissant, très bas).
4. Pompage de la musique sur l'iPhone par l'inverse : puisqu'elle ne se baisse pas, faire reculer le moteur/vent de −3 dB (`dk`) sur chaque `verdict.2+` pour que la récompense « perce ».
5. Une résolution de l'écran de fin : `mort.compteFin` sur la tonique + `ui.go` à 1 degré plus haut quand REJOUER devient actif (la tentation de relancer, côté oreille).
