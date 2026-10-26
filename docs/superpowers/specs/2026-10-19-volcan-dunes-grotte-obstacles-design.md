# VOLCAN, DUNES, GROTTE — DES OBSTACLES ET DES MODULES À ELLES (design, 2026-10-19)

Session « Refonte map volcan » (worktree `cartes-obstacles`, parti de `origin/main` 433495b8). Spec seulement : rien n'est codé.

## 0. La demande (Sacha, 2026-10-19)
- « La map volcan est nulle : toutes les maps ont des éléments de gameplay spécifiques sauf celle-là. Refonte totale, mets-toi dans la peau
  d'un designer de jeu pro ; tu peux garder des éléments, mais trouve des concepts et des éléments de gameplay. Fais-moi des propositions avant
  de coder. » Puis : « pareil pour les maps désert et grotte d'ailleurs. »
- Aux premières propositions (bombes, tourbillons, rails…), il a recadré :
  · VOLCAN : « fais plutôt des trucs liés à la map, comme des obstacles, comme les montagnes chinoises ou les immeubles de la ville » ;
  · DUNES : « fais plusieurs petits segments de route posés sur les dunes de sable, et on peut sauter de segment en segment » ;
  · GROTTE : « trouve juste des idées d'obstacles et de modules de route, va pas dans des délires trop bizarres » + les CHAMPIGNONS.
- Retenu au questionnaire suivant :
  · VOLCAN : les AIGUILLES SERRÉES, les ARCHES + CHUTES DE LAVE, le TUNNEL DE LAVE + le COULOIR DES ORGUES (pas de rochers sur la route) ;
  · DUNES : la ROUTE EN MORCEAUX, les SAUTS VARIÉS, les PORTES D'OBÉLISQUES, le SAUT DE SEGMENT (nitro) ;
  · GROTTE : les CHAMPIGNONS, les STALAGMITES ET COLONNES, les STALACTITES BASSES, la GALERIE DE MINE + le BOYAU.

## 1. Le diagnostic (lu dans le code de main)
- VOLCAN : un décor qui vit, sans jeu. Les bombes des éruptions ne touchent jamais la caisse (`vlcEruption` : « décor »), les geysers sont du
  décor, les aiguilles sont posées à 18-60 m du bord (on ne les sent jamais), l'arche laisse 31-34 m d'air, les chutes de ses pieds n'ont pas de
  collision. Refait 5 fois depuis le 14/10 (v1 descente, v2 boucles, v3 balade, v4 descente emmêlée, 2e tour balade + spirale) : le tracé a
  toujours changé, jamais le jeu.
- DUNES : les vagues ne décollent qu'à la nitro (question restée ouverte dans le journal) ; les boucles à raccourci sont le trombone du canyon.
- GROTTE : rien sur la route (journal : « la route n'a aucun obstacle de plus ») ; le puits de la géode reprend le « sauter sur l'étage
  d'en dessous » du glacier et de la forêt.
- Ce qui fait l'identité des maps que Sacha aime : une matière ou un relief qui CHANGE la conduite ou le vol — les pics et les tours qui
  bordent la route (Jade, villes : couper en vol tue), les pics sur la piste et les congères (glacier), les parois des Étroits (canyon), le
  taureau et la pièce ₿ (crypto), la demi-gravité (orbite), la mer où l'on plonge (Jade).

## 2. Les règles communes aux trois chantiers
- R1 · LISIBLE 2 S AVANT. Tout obstacle se voit au moins 2 s avant à la vitesse du moment. On le pose en SECONDES (× `vPalier()`), pas en
  mètres ; là où la brume ne laisse pas 2 s (grotte, bancs de fumée, hauts paliers), on n'en pose pas.
- R2 · JAMAIS TOUTE LA LARGEUR. Un obstacle SUR la route laisse toujours une voie libre ≥ 24 m (ou deux de ≥ 18 m : la colonne centrale de la
  grotte), dans le fil naturel de la route ; jamais deux
  obstacles qui imposent un zigzag en moins de 1 s.
- R3 · PAS DANS LES MOMENTS FRAGILES : ni dans les 300 premiers mètres, ni dans les 400 derniers (le portail), ni dans les 2 s qui suivent une
  zone de pose, ni dans un banc de fumée, ni dans un module qui ne le prévoit pas.
- R4 · LA MÊME MORT PARTOUT : `explode(cause)` + L'IMPACT ; chaque cause nouvelle a son texte dans `CAUSES` (FR + EN, sans capitale accentuée :
  police pixel).
- R5 · UN INTERRUPTEUR PAR MAP, AU TIRAGE PRÈS : `?sans=volcanobs`, `?sans=dunesmorceaux`, `?sans=grotteobs` rendent la map d'avant à
  l'identique. Le hasard nouveau naît dans un flux à part (`mulberry32` semé une fois depuis la graine, comme les modules) : `rnd` ne bouge pas.
- R6 · PERF iPhone : instances ; aucun programme compilé en course (la chauffe au menu de chaque map) ; construction en tranches et pré-bâti
  (`PREB_PISTES`) ; pas de lumière three de plus.
- R7 · LE RYTHME : un « moment » d'obstacle toutes les 4-7 s au palier 0 ; jamais deux moments exigeants l'un sur l'autre.
- R8 · LA RÈGLE D'OR ADAPTÉE : `dbgVolcan('test')`, `dbgDunes('test')`, `dbgGrotte('test')` comptent à part les obstacles VOULUS et vérifient,
  eux, la voie libre (R2) ; tout le reste (roche, sable, décor sur ou sous la dalle) reste à zéro.

## 3. VOLCAN — LE ROYAUME DE FEU, MAP D'OBSTACLES

### 3.1 La forme de la map (45 s au palier 0, ~5 km)
départ → LA PLAINE DES AIGUILLES (la balade, ses virages, 1-2 modules) → UN MODULE À PAROIS (le tunnel de lave OU le couloir des orgues,
tiré ; les deux si la longueur le tient) → LA MONTÉE autour du volcan (gardée : la demande du 18/10), avec ARCHES et RIDEAUX DE LAVE sur la
corniche → le portail en haut. La spirale (1,3-1,45 tour, ~45 % de la map aujourd'hui) se ramène à ~1-1,15 tour pour laisser la place
(question 9.2).

### 3.2 Les AIGUILLES SERRÉES (« comme les immeubles de la ville »)
- LES FORÊTS D'AIGUILLES : 2-3 tronçons de 300-600 m (× √(v/78)) où les aiguilles bordent la route DES DEUX CÔTÉS, toutes les 35-60 m, à
  4-12 m du bord de la dalle, 40-120 m au-dessus de la route. On roule dans une rue d'obsidienne.
- À LA CORDE : dans chaque virage serré et dans les modules (vSlalom, vCorde, vChicane), une aiguille à l'apex, côté intérieur, à 6-14 m du
  bord. Couper le virage en vol, c'est la mort — la grammaire du `tSlalom` des villes et du `fSlalom` de la forêt.
- En roulant on ne les touche jamais (elles sont au-delà de la dalle) : elles comptent EN VOL — figures, bump de bord, saut nitro, chute.
- Jamais au-dessus de la route ; jamais à moins de 140 m d'une arche (règle d'aujourd'hui) ; jamais côté cône sur la corniche (la paroi y est
  déjà) ; jamais dans un couloir de saut.
- Cause : `aiguille` — « EMPALE SUR L AIGUILLE » / « IMPALED ON THE SPIKE » (au lieu de `roche`).

### 3.3 Les ARCHES et les CHUTES DE LAVE
- LES ARCHES (3-4 par map au palier 0) : les pieds à 10-20 m du bord (aujourd'hui 78-84 : on ne la sentait pas), deux sortes —
  · HAUTE : 28-34 m d'air (l'arche d'aujourd'hui, rapprochée) ;
  · BASSE : 9-10 m d'air sous la clé — on passe en roulant (la caméra, 3-6 m au-dessus de la caisse, reste dessous), le saut nitro simple aussi
    (~2 m d'apogée) ; mais le saut ALLONGÉ d'une figure (`sautAllonge`, jusqu'à ~8 m) ou un décollage au manche dessous = dans l'arche.
  Posées sur du droit ou des courbes douces (rayon > 3 × `rayonPalier()`), jamais deux à moins de 3 s ; sur la corniche, ce sont des ponts de
  roche jetés depuis le flanc du cône.
- LES RIDEAUX DE LAVE (2 par map) : la lave tombe d'une arche ou d'un surplomb SUR TOUTE LA LARGEUR, sauf une BRÈCHE de 24-30 m (gauche, milieu
  ou droite, tirée). Passer dans le rideau tue, même en roulant. La brèche est alignée 2,5 s avant (jamais en sortie de virage) ; le rideau
  perce la brume (il luit). Sur la corniche, c'est une coulée qui dévale le cône et traverse la route.
- LES CASCADES LATÉRALES : les chutes des pieds d'arche et celles des mesas prennent une collision ; certaines tombent à 6-15 m du bord.
- Cause : `lave` (gardée) ; texte dédié pour le rideau — « DANS LA CHUTE DE LAVE » / « INTO THE LAVAFALL ».

### 3.4 Le TUNNEL DE LAVE et le COULOIR DES ORGUES (les modules à parois)
- LE TUNNEL DE LAVE : 300-600 m (× √(v/78)), un tube : parois à ROAD_HALF + 3 m de l'axe, voûte ronde à 16-20 m, un S ou une longue courbe
  dedans (rayon ≥ 1,4 × `rayonPalier()`), des puits de lumière tous les ~150 m (le toit effondré), des fissures qui luisent, un chenal de lave au
  pied d'une paroi (décor).
- LE COULOIR DES ORGUES : 300-500 m à ciel ouvert entre deux murs de colonnes de basalte hexagonales (sommets 40-90 m), parois à
  ROAD_HALF + 4 m ; une chicane ou un slalom dedans (1,3-1,6 × `rayonPalier()`).
- Les deux suivent les règles des Étroits du canyon : frotter (≤ 30° ou < 200 km/h) = le coup d'épaule ; de face au-delà = la mort `paroi` ;
  la voûte tue en vol.
- Un des deux par map au palier 0 (tiré dans le flux à part), les deux si la longueur le tient (`bal()`) ; jamais dans la spirale.

### 3.5 Ce qui reste, ce qui part
- Gardés : la montée autour du volcan, la mer de lave, les éruptions et leurs bombes (décor), les panaches, les coulées, les geysers (décor),
  les six temps, les sons.
- Les bancs de fumée (fumerons) : gardés, mais jamais sur un obstacle (R3) — ou retirés (question 9.3).
- Les rochers sur la route : NON (Sacha).

## 4. DUNES D'OR — LA ROUTE EN MORCEAUX

### 4.1 Le principe
La route n'est plus continue : des SEGMENTS posés sur les dunes, séparés par du vide (le sable en dessous). On saute de crête en crête.
- Un SAUT = [la fin d'un segment, sur une crête, avec un TREMPLIN de sable] → [le vide] → [la FACE DE RÉCEPTION : le début du segment
  suivant, posé sur la face d'avalanche, qui descend comme la trajectoire] → [la course] → [la montée vers la crête suivante].
- LE TREMPLIN : les 25-40 derniers mètres se relèvent en lèvre et la caisse est LANCÉE à la lèvre (le mécanisme des tremplins du glacier,
  `BK_BEC` : `startFall` à la lèvre) — on décolle à la vitesse de croisière, SANS nitro. (Une crête seule ne fait jamais décoller : en roulant,
  la caisse reste collée à la dalle ; c'est pourquoi les vagues d'aujourd'hui ne partent qu'à la nitro.)
- LE VIDE et LA RÉCEPTION se règlent en SECONDES sur `vPalier()` : à 0,7 × la croisière on atteint encore la face (la caisse qui sort d'un
  crash) ; la face couvre jusqu'à 1,6 × (la nitro, l'élan du départ). Ordre de grandeur au palier 0 (g monde ≈ 23 m/s² depuis LA CAISSE PLUS
  LOURDE — `FALL_G` 33 × 1,45 × `SPD` 0,48 —, sortie à 8°, 20 m de dénivelé) : à 0,7 × on vole ~90 m, à 1,6 × ~280 m ; d'où un vide de ~80 m
  et une face de ~220 m qui descend de ~22° (l'angle d'arrivée) vers 5° ; vol 1,6-2,3 s. Chiffres exacts au banc (la lèvre réelle, `hopY`).
  Même sens à ± 10° : la pose est propre (≤ 55°).
- RATER LE SEGMENT = le sable = la mort (`ENSEVELI DANS LE SABLE`, cause existante).

### 4.2 Les SAUTS VARIÉS (une progression)
1. LE PREMIER SAUT, toujours le premier : droit, petit dénivelé (10-15 m), vide court. On apprend.
2. LE SAUT EN VIRAGE : la suite tournée de 20-35° et décalée ; on braque en l'air (~100°/s à fond).
3. LA PLONGÉE : la suite 40-70 m plus bas, 2,5-3,5 s de vol — le temps d'une figure (les figures paient la nitro).
4. LES SAUTS EN CHAÎNE : 2-3 segments courts d'affilée, un rythme.
5. LE GRAND SAUT DE LA VALLÉE MORTE : le plus grand (3-3,5 s), au-dessus de l'argile blanche et des acacias morts. Une fois par map, si la
   longueur le tient.
Tirés dans le flux à part, jamais deux fois le même de suite ; 5-7 sauts par map au palier 0 (un toutes les 5-7 s).

### 4.3 Les PORTES D'OBÉLISQUES
Sur 1-2 sauts par map : deux obélisques plantés au milieu du vide, de part et d'autre de la ligne de vol, faces intérieures à
ROAD_HALF + 8-12 m de la ligne, 40-70 m de haut (plus haut que l'apogée). On passe entre ; dériver en l'air = l'obélisque
(`CONTRE L OBELISQUE`, cause existante). Visibles depuis la crête.

### 4.4 Le SAUT DE SEGMENT (nitro)
Sur 1-2 sauts par map : le segment suivant est COURT (120-180 m, une île de route) et le suivant encore continue sur la même ligne, 10-25 m
plus bas. À la croisière on se pose sur l'île, puis on resaute de son tremplin ; à la nitro (≥ ~1,35 × la croisière) on survole l'île et l'on
se pose directement plus loin : gain ≥ 150 m, le jeu crie RACCOURCI (dès 60 m). La face d'arrivée est taillée pour cette longue arrivée.

### 4.5 Ce qui reste, ce qui part
- Gardés (CONTINUS) : la crête du grand erg au départ, le toboggan, l'oasis et le portail ; la vallée morte (décor du grand saut), l'allée des
  obélisques (elle mène à une porte), la grande pyramide, les caravanes, les six temps ; les modules dSlalom, dCorde, dChicane sur la partie
  « course » des segments.
- Partent : les boucles à raccourci (le trombone copié du canyon) et les vagues (`dVagues`) — les vrais sauts les remplacent.
- Le sable : chaque segment a sa dune porteuse (une clé de section à petit D, zC = 1) ; sous un vide, le sable reste loin sous la trajectoire la
  plus basse (une clé « vide » à grand D, zC = 0). La règle d'or : zéro sable sur ou sous une dalle qui existe ; sous un vide, zéro sable au-dessus
  de la trajectoire à 0,7 × la croisière moins 6 m.

## 5. LES PROFONDEURS — OBSTACLES DE GROTTE ET CHAMPIGNONS
Bâti SUR « LA GROTTE VASTE » (session « Grotte map: longueur et vastité », poussée attendue le 19/10) : on ne touche ni `GRT_FORME`, ni la
grille (`GRT.B`), ni la longueur ; nos décors dans un bloc à nous, à la fin de `grtDecors`.

### 5.1 Les CHAMPIGNONS
- LES CHAPEAUX-FILETS : des chapeaux géants (rayon 18-35 m) sous la route et à côté (8-30 m sous la dalle, jusqu'à 25 m au-delà du bord), dans la
  grotte luxuriante surtout (quelques-uns ailleurs). Tomber dessus en vol = un REBOND au lieu de la mort : la vitesse verticale renvoyée
  × ~0,85, avec un plancher qui ramène l'apogée 6-10 m au-dessus de la route ; la vitesse horizontale gardée, un peu poussée vers la route.
  « REBOND ! », de l'aura ; les rebonds s'enchaînent (×2, ×3) ; un rebond rend la moitié du compteur d'air, comme le bump de bord. Les
  chapeaux luisent : le filet se lit de loin.
- LES CHAMPIGNONS-TREMPLINS : de petits chapeaux SUR la route (rayon 6-10 m, au ras de la dalle, lumineux) : rouler dessus = un saut de
  ~1,5-2 s qui retombe plus loin sur la route. Sur une partie de la largeur seulement : un choix, jamais une obligation ; jamais sous des
  stalactites basses.

### 5.2 Les STALAGMITES et les COLONNES sur la route
- LES STALAGMITES : des cônes (base 3-6 m de rayon, 8-20 m de haut) sur la dalle, 1-3 par moment, voie libre ≥ 24 m (R2). Les percuter en
  roulant tue — cause `stalagmite` « CONTRE UNE STALAGMITE » / « INTO A STALAGMITE ».
- LA COLONNE CENTRALE : une colonne (rayon 7-10 m) du sol au plafond au MILIEU de la route ; deux voies de 18-21 m ; dans la cathédrale
  (salle des stalactites) surtout ; visible de loin.
- Sur du droit ou des courbes douces, 2 s de visibilité dans la brume de la salle (R1), jamais dans les 2 s après la pose du puits de la géode,
  jamais dans un module à parois.

### 5.3 Les STALACTITES BASSES
Des cônes pendus dont la pointe descend à 9-11 m au-dessus de la dalle : on passe en roulant (la caméra reste dessous), le saut nitro simple
aussi ; un saut allongé de figure, un décollage au manche ou un champignon-tremplin dessous = le crash (cause `roche`). Par grappes de 3-8 sur 80-150 m, dans la cathédrale et dans le boyau ;
jamais au-dessus d'un champignon-tremplin ni d'une zone de pose. Leur pose ne passe pas par `grtLibre` (qui refuse tout à moins de 36 m
au-dessus de la dalle) : un placement à elles, des boîtes dures à elles.

### 5.4 La GALERIE DE MINE et le BOYAU
- LA GALERIE : dans la mine (et une deuxième entre deux salles si la longueur le tient) : parois à ROAD_HALF + 3 m, plafond à 16-18 m, cadres
  de bois tous les 20-32 m ; des virages « à angle droit » : arcs de 80-90° au rayon le plus serré que la vitesse permet
  (1,2-1,4 × `rayonPalier()`). Les parois suivent les règles des Étroits (coup d'épaule / `paroi`).
- LE BOYAU : un passage bas et serré de 150-300 m entre deux salles : parois à ROAD_HALF + 2 m, plafond à 10-12 m, droit ou en S doux ; on ne
  peut pas y sauter.
- Le NOYAU de la roche (`rc` = ROAD_HALF + 10, `hcU` = 30 m) interdit aujourd'hui une paroi plus proche et un plafond plus bas : il prend une
  valeur par échantillon dans ces deux modules, et `dbgGrotte('test')` (sonde à +14 m) les connaît.

## 6. Les branchements dans le code
Relevé sur main 433495b8 (numéros de ligne de ce jour-là, à titre indicatif : ils bougent à chaque commit).

### 6.1 Les briques communes (un petit bloc partagé, `OBST`)
Elles existent à moitié, liées à une seule map ; on les généralise sans changer les maps qui s'en servent déjà.
- LES OBSTACLES SUR LA ROUTE (volcan : rideaux de lave · grotte : stalagmites, colonne) — le modèle est `banqPisteHeurt` du glacier (~17323) :
  à chaque image en roulant, les obstacles proches de `s` testés en distance horizontale + hauteur ; au contact, `IMP` rempli (direction,
  normale, point) puis `explode(cause)` → L'IMPACT. Une liste par map (`OBST.route`), un seul test, appelé là où `banqPisteHeurt` l'est (~63479).
  La LIGNE PARFAITE (pads et fruits posés en course) et les pièces s'écartent de ces obstacles comme des pics du glacier.
- LES ZONES À PAROIS (volcan : tunnel, orgues · grotte : galerie, boyau) — en roulant, `parisMur(dt,'paroi')` est déjà générique (la paroi au
  bord de la dalle ; coup d'épaule `impMini` ou mort `paroi`) : il suffit que `cyCouloirIci()` (~16002) devienne « suis-je dans une zone à
  parois de la map ? » (`OBST.parois` : [s0, s1, voûte] ; le canyon y verse ses Étroits, sa mine, son tunnel sans rien changer). En vol, chaque
  map teste ses parois et sa voûte dans son `xxxHeurt` (le canyon garde `cyCouloirHeurt`).
- LES TROUS DANS LA DALLE (dunes) — retirés le 03/09 (`GAP_ON=false`) puis effacés le 18/10 ; le code se relit au tag
  `avant-allegement-2026-10-18` (024675ba) : `HOLES` {i0, i1, s0, s1}, la dalle vraiment coupée (`trou9`), `dalleProche`/`tryLand` qui sautent les
  trous (`holeAtI`), les pièces aussi (`holeAtS`). À rendre, plus une chose qui n'a jamais existé : en roulant sur un trou sans avoir décollé
  (caisse trop lente), la chute (`startFall(0,…)`). `runStats.gaps` (« GAPS FRANCHIS », toujours à 0 aujourd'hui) recompte à la pose après un trou.
- LES TREMPLINS (dunes, champignons-tremplins de la grotte) — le mécanisme `BK_BEC` du glacier (~17645 ; physique ~63480 : la lèvre en `hopY`,
  `startFall(clamp(.18·|vA|·vitMult(), 14, 60), 1.04)` à la lèvre, sous 70 km/h la caisse tombe simplement) sort de sa garde `banqOk()` : une
  liste de tremplins par map, la hauteur de lèvre et l'impulsion par tremplin.
- LE REBOND (grotte) — sur le modèle du ricochet de l'eau de Jade (`jadeEauVol` ~22997 : vy = |vy|·0,55 + 15) et du bump de bord (`BUMP_VY`) ;
  testé AVANT la mort dans `grotteHeurt`.

### 6.2 Volcan (bloc `<<<VOLCAN>>>`)
- `vlcTrace3` (~18091) : la spirale raccourcie (TH) ; les pièces nouvelles posées avec `bal()` : forêts d'aiguilles (plages de `s`), arches
  (positions, HAUTE/BASSE), rideaux (position, côté de la brèche), le module à parois (TUNNEL ou ORGUES, une plage de `s` + sa forme). Rendues
  dans `Q`, comme `arche0/arche/arche1` aujourd'hui. Le hasard nouveau dans un flux à part (comme `rv` des modules).
- `buildVolcanG` (~18534) : la passe des aiguilles (~18584-18608) gagne les rangées et l'apex rapproché (le refus `loinRoute(ROAD_HALF + rR + 5)`
  s'ajuste) ; `vlcArche` (~18472) prend la distance des pieds et la hauteur sous la clé ; les rideaux et le tunnel en matière de lave et de roche
  existantes (`VLC_LAVE_*`, `VLC_ROC_*`) ; les cascades des pieds d'arche et des mesas reçoivent leurs capsules. TOUTE capsule nouvelle entre dans
  `COL` avant la tâche qui bâtit `VOLCAN.gcol` (~18644), dans la file des tranches (`vlcTache`).
- `volcanSol` : le terrain s'écarte du tunnel et des murs d'orgues (comme il s'écarte de la route aujourd'hui : `h ≤ ym − 16 + …`).
- `volcanHeurt` (~18760) : causes `aiguille` et rideau ; la voûte du tunnel. `dbgVolcan('test')` (~18788) : la voie libre des rideaux.
- `?sans=volcanobs` = la map d'aujourd'hui, au tirage près.

### 6.3 Dunes (`genDunes` ~16310, `buildDunes` ~16528)
- `genDunes` : une aide `saut(type)` qui émet crête + tremplin, trou, face de réception, course (un module dSlalom/dCorde/dChicane), montée ;
  types : premier, virage, plongée, chaîne, grand saut, porte, île (le saut de segment) ; elle remplace les boucles `racA…racG` (`boucle` ~16366) et
  les vagues (`vag0…vag3`, `dVagues`). La crête du départ, le toboggan, la vallée morte, l'allée et l'oasis restent ; le budget `tient(f)` décide
  combien de sauts tiennent dans la durée visée.
- `buildDunes` : deux clés de section nouvelles dans `KEYS` (~16545) — `seg` (petit D, zC = 1 : la dune porte la route) et `vide` (grand D,
  zC = 0, le plancher loin sous la trajectoire) ; `dnProfil`/`dnMondeCalc` les lisent comme les autres.
- `dnPrevoir` (~16440) : les portes d'obélisques au milieu des vides ; leur collision est celle d'aujourd'hui (`dnMonuHeurt` ~16735).
- Le pré-bâti (`PREB_PISTES`) emporte trous et tremplins avec la piste. `?sans=dunesmorceaux` = la map d'aujourd'hui.

### 6.4 Grotte (`grtTrace` ~18892, `grtDecors` ~19229, `grotteHeurt` ~19449) — après la poussée de LA GROTTE VASTE
- `grtTrace` : la GALERIE comme module (dans `MJ`, ou en dur dans le bloc de la mine ~18940) avec des arcs de 80-90° tracés par `arc` (la butée
  `tourne` ±68° ne s'y applique pas) ; le BOYAU entre deux salles ; le contrôle des croisements (~18964) inchangé.
- `grtEchantillons`/`grtCreuse1` (~19001/~19041) : le NOYAU (`rc`, `hcU`) par échantillon, rétréci dans la galerie et le boyau.
- Un bloc à nous à la fin de `grtDecors` : stalagmites, colonnes, stalactites basses (leurs boîtes dures dans `GROTTE.col`, posées SANS
  `grtLibre`), chapeaux-filets (liste de rebond), champignons-tremplins (liste de tremplins) ; les obstacles sur la route dans `OBST.route`.
- `grotteHeurt` : le rebond sur un chapeau avant la densité et les boîtes ; `dbgGrotte('test')` (~19462) : les obstacles voulus à part, la voie
  libre, le noyau rétréci des deux modules. `?sans=grotteobs` = la grotte vaste sans nos ajouts.

## 7. L'ordre et les vérifications
- L'ORDRE : (0) les briques communes (§ 6.1), petites, d'abord seules sur main — elles ne changent aucune map ; (1) puis les trois maps, trois
  chantiers indépendants (un worktree et une session chacun, des blocs différents du même index.html, chacun refusionne origin/main avant de
  pousser) ; la grotte attend la poussée de LA GROTTE VASTE.
- PAR MAP, avant de pousser :
  · banc Node sur le vrai générateur (12 graines × paliers 0, 10, 25) : longueur visée tenue, 0 conflit de tracé, R1-R3 respectées ; pour les dunes,
    chaque saut atteint à 0,7 / 1 / 1,6 × la croisière (trajectoire simulée avec la vraie gravité) ;
  · dans le jeu (banc muet) : la règle d'or adaptée (R8) à zéro, le pilote automatique (dunes : toutes les traversées au palier 0 sans nitro),
    une photo par obstacle, la CAMÉRA jamais dans un obstacle (couché ET debout : sous l'arche basse, les stalactites, dans le tunnel, le boyau) ;
  · 0 erreur JS, `__loopErr` nul, 0 programme compilé en course ; `?sans=…` identique à la map d'avant ;
  · la règle du guide : menu → JOUER → course, couché, debout et dans le cadre de l'ordi ; `sh garde-burnout.sh` et `sh garde-charte.sh` OK ;
  · journal (`VERSION PRINCIPALE/JOURNAL.md`), guide si un nom change, cache `sw.js` monté au commit.

## 8. Hors périmètre
- Aucune mécanique nouvelle hors de ces trois maps ; la physique de conduite, les vitesses, l'économie ne changent pas.
- Ni bombes qui touchent, ni geysers-catapultes, ni tourbillons, ni rails, ni jauge de chaleur (proposés puis écartés par Sacha).

## 9. Questions ouvertes (pour Sacha)
1. DUNES : la caisse trop lente sur une crête (après un crash) tombe dans le vide. On garde (c'est le prix), ou un avertissement « TROP LENT »
   / un petit coup de pouce du tremplin ?
2. VOLCAN : ramener la spirale à ~1 tour pour faire la place à la plaine des aiguilles et au module à parois ?
3. VOLCAN : les bancs de fumée — gardés loin des obstacles, ou retirés ?
4. Les textes des morts nouvelles (aiguille, chute de lave, stalagmite).
