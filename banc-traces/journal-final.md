## LE ROYAUME DE FEU ET LES PROFONDEURS AU HASARD — L'AXE, L'ORDRE, LES CARACTÈRES, LA MONTÉE ET LE PUITS TIRÉS (2026-10-19, session HASARD — Sacha : « vérifie bien que toutes les maps sont générées aléatoirement »)
- **Le constat, mesuré** (banc Node sur les vrais générateurs, 40 graines, palier 0 ; l'ÉCART DE FORME = les pistes rééchantillonnées en 64 points
  par fraction de longueur, départ à l'origine, distance moyenne entre deux pistes / longueur moyenne — la jade refaite le 18/10 : 0,226) : le TIRAGE
  de la map et de la graine était bon, mais deux maps suivaient toujours la même RECETTE. LE ROYAUME DE FEU : 0,085 — plein nord, l'arche à 6-10 %
  du parcours, le lac au milieu, la montée du volcan toujours à 43-49 %. LES PROFONDEURS : 0,067 — plein nord, mine → luxuriante → PUITS (à 25-29 %)
  → stalactites → lave → abysses, toujours.
- **LE ROYAUME AU HASARD** (`vlcTrace3`, `VLC_HASARD`, `VLC_HUMEURS` ; son flux `rh`, un seul tirage `rnd` de plus) — chaque royaume tire :
  · son AXE (±45° autour du nord, comme la jade : la butée de cap ±72° et le « devant » du cône se comptent autour de lui) et LE COUDE DE LA PLAINE
    (au milieu de la balade, l'axe tourne une fois de 15-35° : jamais plus de 90° de la bissectrice — la balade ne se recroise toujours pas) ;
  · l'ORDRE des tableaux de la balade : l'arche, le lac (2 à 4 courbes), un fumeron et un module toujours ; le 2e module, le 3e, le 2e fumeron si la
    longueur visée les tient ; jamais l'arche juste avant la montée ;
  · un CARACTÈRE par tronçon de virages (`VLC_HUMEURS` : flammes = la balade d'avant, serpent, courbes, dérive, balcon, chicanes ; jamais deux fois
    le même de suite) et la part de chaque tronçon ;
  · LA MONTÉE : 0,9 à 1,55 tour (avant 1,3-1,45), le dernier tour à 1-1,25 × le rayon d'avant, ≥ 140 m d'un tour à l'autre, 5-7 % ; jamais plus de
    58 % de la longueur visée. Le rayon s'y resserre EN DOUCEUR à l'entrée et à la sortie (sinon, quand il se resserre vite, un cran de 4-7° à
    l'entrée : un « virage » de 116 m au palier 25, banc). Le portail reste là-haut.
- **LES PROFONDEURS AU HASARD** (`grtTrace`, `GRT_HASARD` ; flux `rh`) — chaque grotte tire :
  · son AXE dans TOUTES les directions (sous la terre aucun soleil ne l'oriente) ;
  · l'ORDRE des quatre salles du milieu (luxuriante, puits de la géode, stalactites, lave) entre la MINE (toujours la 1re : la porte qu'on
    reconnaît) et les ABYSSES (toujours la dernière : le noir et la salle du portail) — jamais la lave contre le puits (son lac déborderait dans
    l'entonnoir où l'on saute pour le raccourci) : 12 ordres, le puits arrive de ~6 à ~70 % du parcours ;
  · la longueur de chaque salle (0,6-1,4 × sa part d'avant, puis ramenées à la longueur visée) et un CARACTÈRE par salle (ceux du volcan ; la
    salle de lave garde ses grandes courbes) ;
  · LE PUITS : 1¼ tour ± 0,12 (avant ± 0,04) et son rayon (+0-80 m, avant +0-30) ; on en ressort jusqu'à ±43° de biais et L'AXE SUIT (borné à ±40°
    de celui de l'entrée : avant comme après le puits, le cap reste à moins de 90° de la bissectrice — la grotte ne revient pas sur ses pas) ;
  · ce qui supposait l'ordre fixe suit maintenant les salles VOISINES (`R.apres`, `voisin` dans `grtEchantillons`) : le lac de lave ne déborde
    (300 m) que dans les stalactites et les abysses — ses voisines d'avant —, jamais dans la mine, le puits ni la luxuriante ; l'eau de la
    luxuriante, les piliers (`grtPiliers`), les décors par salle (`grtDecors` : mine, luxuriante, stalactites, lave) ; la lumière de la lave
    n'éclaire qu'elle et les voisines où elle déborde (`GROTTE.lavLum` — avant « salle ≥ 3 », les mêmes dans l'ordre d'avant).
- **`?sans=hasardvolcan`, `?sans=hasardgrotte` = les maps d'avant, AU BIT PRÈS** (banc `identite.cjs` : 240 pistes sur 240 identiques à main pour
  chacune — 40 graines × paliers 0/10/25 × au JOUER et hors du JOUER). Le tirage se lit dans `dbgVolcan().hasard` et `dbgGrotte().hasard`
  (axe, coude, ordre, caractères, parts) ; il est rangé dans `Q.hasard` (le pré-bâti l'échange avec Q).
- **MESURÉ** (avant → après, 40 graines) :
  ÉCARTS, ROYAUME : 0,085 → 0,23 (paliers 0, 10, 25 : 0,23 · 0,23 · 0,25 ; sans compter la rotation — la FORME seule, Procrustes autour du départ :
  0,05 → 0,08) · PROFONDEURS : 0,067 → 0,49 (sans la rotation : 0,037 → 0,08 ; la jade : 0,23 et 0,10).
  REPÈRES, ROYAUME : l'arche de 6 à 46 % du parcours (avant 6-10), la montée de 36 à 63 % (43-49), le lac à toutes les places de la balade ;
  PROFONDEURS : le puits de 10 à 67 % (27-31), 11 des 12 ordres de salles sur 40 graines (avant : un seul), le puits à 1,14-1,36 tour (1,21-1,29). Longueurs inchangées (royaume 5,5-6,6 km au palier 0, avant 5,9-6,6 ; grotte 8,8-9,6, avant 8,9-9,5), 0 conflit de
  croisement, le rayon le plus serré au même endroit qu'avant (le dernier tour de la spirale : 73-74 m au palier 0, avant 77 ; au palier 25 152 m,
  avant 151), dénivelé du royaume 121-223 m (174-223), de la grotte 362-427 (380-423). Génération 3-15 ms.
  EN JEU (banc Chrome sans fenêtre, muet) : 10 constructions par map (`dbgTrace({carte,graine})`) sans erreur JS, règle d'or `dbgVolcan('test')` /
  `dbgGrotte('test')` à 0 partout. Coût de construction INCHANGÉ — compté (les temps, avec des charges de 3 à 90 ce jour-là, ne se comparent pas) :
  grotte 734 → 744 tronçons, 341 k → 341 k triangles ; royaume 118 k → 120 k cases de relief, mêmes aiguilles, orgues, coulées.
  COURSES au pilote (`dbgAuto`, jusqu'au 1er portail, le Mac chargé de 3 à 100 par d'autres bancs — les secondes réelles ne se comparent pas) :
  royaume 3 sur 3 et profondeurs 3 sur 3 au portail, aucune mort, aucune erreur JS (la version d'avant, dans les mêmes conditions : 3 sur 3 et 2 sur 3,
  une mort au pilote dans la grotte sous une charge de ~90). Couché (844 × 390), debout (390 × 844) et dans le cadre de l'ordi : menu → JOUER →
  course sur les deux maps, sans erreur. Photos avant/après (`photos.py`, les vues « vers le volcan », le puits et les salles, trois graines).
- **Les bancs** (pas commités, `banc-traces/` à côté du dépôt dans le worktree de la session) : `charge.cjs` extrait les VRAIS générateurs
  d'index.html (genVolcan, vlcTrace3, vlc3Cone, genGrotte, grtTrace, genJade…) et les fait tourner dans Node avec three et des valeurs mesurées
  (longueurCible, lvPiste au palier) — il redonne les chiffres du jeu (0,085, l'arche à 6-10 %…) en 0,3 s pour 40 pistes ; `mesure.cjs` (écarts,
  repères, rayons, conflits), `identite.cjs` (l'interrupteur coupé = main au bit près), `rmin.cjs` (le rayon le plus serré sur la courbe du jeu),
  `plans.cjs` (les plans vus de dessus), `jeu.cjs` (le vrai jeu par CDP : constructions, courses au pilote, photos).
- **À trancher par Sacha** : la grotte part dans toutes les directions (le volcan reste à ±45° du nord : son soleil bas) ; la montée reste la FIN du
  royaume (le portail là-haut, la demande du 18/10) — un volcan AU MILIEU de la map (monter une corniche puis redescendre) serait une autre map,
  à proposer. La session « Refonte map volcan » (obstacles, spec seulement) bâtira par-dessus : elle n'a rien codé dans `vlcTrace3`/`grtTrace`.
