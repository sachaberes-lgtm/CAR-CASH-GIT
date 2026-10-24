# SPEC — LA ROUTE DES PROFONDEURS LONGE LES PAROIS (2026-10-20)

Demande de Sacha : « change la génération de la route dans la map grotte : là, la route est tout le temps plate. Il faut qu'elle longe les murs de
la grotte : parfois tu roules à l'envers, parfois sur les côtés — qu'elle arrête d'être plate, qu'elle longe les parois, mais pas forcément le sol.
Des fois elle est sur le sol, puis on tourne, elle arrive sur le mur, et on est au plafond. »

Décisions de Sacha (20/10) : dose ÉQUILIBRÉE (~40 % sol · ~35 % murs · ~25 % plafond dans les salles qui roulent) ; le design ci-dessous validé tel quel
(route enroulée sur un tube, ~20 m de la roche, puits/mine/entrée/portail à plat, les autres salles roulent — y compris la lave, dont le lac reste
plat).

## 1. L'état d'aujourd'hui (lu dans `index.html`, branche `origin/main` v729)

- `genGrotte` → `grtTrace` rend une piste PLANE en plan (virages en x,z, une pente qui descend de 230-330 m), un tableau `ctrl` de points. La
  route flotte au CENTRE du vide : `GRT_FORME` donne par salle la demi-largeur `rh` (96-400 m), le plafond `up` et le fond `dn` (jusqu'à 220 m) ;
  la roche est creusée autour de la route (`grtEchantillons` → `grtCreuse1`) par un ellipsoïde aux AXES DU MONDE tous les `rh/3,2` m, plus un noyau
  vide autour de la route (ROAD_HALF + 10 m de large, 30 m dessus, THICK + 9 m dessous).
- Le jeu sait déjà rouler sur la tranche et à l'envers : LA MAP DES NUAGES SANS HAUT NI BAS (`TORD`, `pisteTord`). `TORD.N` = la normale de la dalle à
  chaque point de contrôle, reprise par `buildTrack` ; `TORD.on` allume la conduite sans haut ni bas : `hautPente()` = 0, les rails des loopings
  coupés (`rails9`), le vol qui suit la route (`VOLR`/`volrOn`, `volrSuit`), la gravité du bord (`TBORD`), la caméra qui suit la normale (`camUp`).
  `hautOn()` (le ciel replié, les nuages en sphère) reste propre aux nuages : la grotte ne l'appelle pas.
- Le piège qui interdit le « décalage simple » : les virages de la route ont ≥ ~100 m de rayon (`rM` = 40 + 0,3·v) ; les salles font 580 m de large.
  Une route décalée vers la paroi avec une grotte creusée autour d'ELLE donnerait des centres de creux en cusp (rayon de virage − décalage < 0) : les
  ellipsoïdes voisins recouvrent la paroi et la route se retrouve au milieu du vide (calcul fait pendant le cadrage). Il faut un AXE de grotte lisse.

## 2. Le modèle : un tube lisse, une route dessinée à plat puis ENROULÉE dessus

Pour chaque salle qui roule (luxuriante, stalactites, lave, abysses) :
1. **L'axe du tube** : une droite (ou un arc doux, rayon ≥ 2,5 × la demi-largeur de la salle) qui descend suivant la pente de la salle ; sa direction
   est le CAP DE LA ROUTE À L'ENTRÉE de la salle (`axeSalle`, fixe pour la salle). Ne pas le confondre avec la variable `axe` de `grtTrace` (le cap
   autour duquel les virages se rangent, ±68° de `LIM`) : dans une salle qui roule elle devient la DÉRIVE voulue (voir 4), l'axe du tube ne bouge pas.
   La coupe garde `GRT_FORME` (ellipse `rh`, `up`, `dn`, exposant `ex`, morsure `nz`, fondus de ±90 m entre salles).
2. **Les coordonnées développées** : le tracé de `grtTrace` (virages, slalom, corde, chicane, houle, leurs rayons) est lu dans le repère de la salle :
   `u` le long de l'axe, `v` en travers. La route est ENROULÉE : `v` devient un déplacement le long de la coupe (par longueur d'arc de l'ellipse, donc
   le rayon d'un virage est le même qu'à plat, comme `pisteTord` le garde pour les nuages). Tourner à gauche/droite = monter sur le mur.
3. **L'angle `θ(u)` autour du tube** : 0 = sur le sol, ±90° = sur un mur, 180° = au plafond. La route est à `ρ(θ) − 20 m` de l'axe, dans la direction
   `dir(θ)` ; sa normale `N` = `−dir(θ)` (vers l'axe, donc vers l'intérieur du vide). Elle est suspendue à ~20 m de la roche (la dalle fait ~4-5 m :
   ~15 m de vide visible entre la dalle et la paroi) : la roche défile à côté, la caisse ne la touche pas.
4. **Le plan de roulis** (la dose) : une cible `θ_cible(u)` en paliers, tirée avec le flux `rh` de la grotte (`GRT_HASARD`) : tenue au sol 2-5 s ·
   quart de tour 6-10 s (à la vitesse de croisière du palier : `v = 70 + 100·(LV−1)` m/s) · tenue sur le mur · quart de tour · plafond · retour par le
   plus court ou le tour complet (1 fois sur 6). La DOSE est celle de Sacha (« équilibré : on tourne lentement autour de la salle, on revient régulièrement au sol »), DANS LES SALLES QUI ROULENT :
   sol |θ| < 45° ≈ 40 %, mur 45-135° ≈ 35 %, plafond > 135° ≈ 25 % (`GRT_PAROI_DOSE`). L'entrée, la mine, le puits et la salle du portail (~30 % de la
   longueur, la spirale du puits seule ~2,2 km) sont au sol : sur tout le parcours cela donne ~58 % sol · ~24 % murs · ~18 % plafond. (Appliquer 40/35/25 au
   parcours entier aurait imposé ~88 % de travers dans les salles qui roulent : écarté, trop violent — la route des nuages « un peu trop tordue » du
   18/10.) Au plus 90° de roulis par 6 s ; le sol revient au moins toutes les ~35 s ; jamais deux tours complets de suite.
   La dérive du générateur (`axe`, dynamique) est braquée vers `v_cible = ρ·θ_cible` (± 45° en travers) : le tracé
   suit la cible tout en gardant ses bends.
5. **La normale** pour `TORD.N` : à chaque point de contrôle, `N` ci-dessus remise d'équerre sur la tangente (comme `buildTrack` le fait pour les
   nuages). La route reste dans le plan de sa dalle : les virages au volant ne changent pas.

Les salles qui restent À PLAT (entrée, mine, puits de la géode, salle du portail) gardent leur tracé en plan, leur creusement centré sur la route et
leur `TORD.N` = le haut du monde : rien ne change pour elles. Entre une salle plate et une salle qui roule, un RACCORD de ~500 m : la route est au
sol (θ = 0), le centre du creux monte de `dn − 20` m au-dessus d'elle, la coupe passe de `GRT_FORME` d'une salle à l'autre par le fondu existant.

## 3. Ce que touche le code (par nom, jamais par numéro de ligne)

- **Nouveau** `grtParoi(ctrl, SL, Q, …)` : la phrase du §2 (axes, coordonnées développées, plan de roulis, enroulement, normales, raccords). Rend
  la route enroulée (`ctrl`), `TORD.N`, l'axe par échantillon et `θ(u)`. Appelé par `genGrotte` après le choix du meilleur essai, avant `return`.
- `genGrotte` : le contrôle des croisements de `grtTrace` (plan + `|Δy| < 32`) est refait en 3D sur la route enroulée (non voisine à moins de
  `2·ROAD_HALF + 14` m = conflit ; les 6 essais de `genGrotte` tiennent) ; les tours complets doivent laisser ≥ 70 m entre deux spires.
- `pisteRoute` : pour `piste === 'grotte'` (et `GRT_PAROI` vrai), `TORD.on = true` et `TORD.N` = les normales de `grtParoi` ; `hautOn()` reste faux.
- `grtEchantillons` : les échantillons de creusement (`R.X/Y/Z`, `R.TX/TZ`) sont ceux de l'AXE (route − décalage de la section, interpolé comme
  `TORD.N`), plus `R.PX/PY/PZ` (la route), `R.TH` (θ) et `R.ROUL` (1 si la salle roule). Les bornes de salle (`near`) restent lues sur la route.
- `grtCreuse1` : le noyau vide est refait dans le repère de la dalle (large `ROAD_HALF + 10` ; 30 m « au-dessus » = vers l'axe ; `THICK + 9` m
  « au-dessous » = vers la roche) ; la morsure du bruit est ATTÉNUÉE à 0 dans une bande de ±70 m (le long de la paroi) autour de θ de la route et
  pleine à ±150 m : la roche proche de la route est la paroi idéale. Les salles à plat : inchangées, bit pour bit.
- `grtLacs` / `yMinDe` : le lac de lave reste PLAT, 48 m sous le sol de la route (θ = 0) de la salle de lave ; le fond du creux est approfondi pour le
  contenir (la règle `R.DN = max(R.DN, R.Y − lac.y + 14)` lue sur l'axe) ; l'eau de la luxuriante pareil.
- `grtLibre`, `grtPiliers`, `grtDecors` (`pris`), `grtLum` : « la route est-elle libre ? » passe de la colonne (x,z, 36 m au-dessus / 14 m en dessous)
  à une distance 3D à la route enroulée (grille de 48 m sur `R.PX/PY/PZ`). Plus de colonne de décor, de stalactite ou de cristal à moins de
  `ROAD_HALF + r + 10` m de la route.
- `grotteHeurt` : inchangé (la densité du champ, la lave, l'eau, les gros décors — tout en coordonnées du monde).
- Physique : AUCUN changement dans `VOLR`, `TBORD`, `camUp`, `hautPente` — la grotte les reçoit par `TORD.on`. La pente de la descente ne pousse
  plus la caisse dans la grotte (comme sur les nuages) ; à mesurer (§5) que la durée des salles ne bouge pas.
- Interrupteurs : `GRT_PAROI = !/[?&]sans=([^&]*,)?grotteparois(,|&|$)/.test(location.search)` ; `?sans=grotteparois` = la grotte d'avant, AU BIT PRÈS
  (le tirage des essais de `grtTrace` consomme `rnd` exactement comme avant ; le nouveau tirage prend un flux `rp` propre, comme `rh` et `rv`).
  Console : `dbgGrotte('paroi')` (θ, parts sol/mur/plafond, distance à la roche, vitesse de roulis, salle par salle).
- Les réglages à un seul endroit, en tête du bloc : `GRT_PAROI_SALLES` (quelles salles roulent : luxe, stal, lave, abysse), `GRT_PAROI_DOSE` (sol / mur /
  plafond), `GRT_PAROI_JEU` (les 20 m de la roche), `GRT_PAROI_QUART` (6-10 s le quart de tour), `GRT_PAROI_BRUIT` (la bande où la roche est lissée).

## 4. Hors périmètre (décidé, pas oublié)

- Pas de nouveaux décors, de nouveaux obstacles ni de nouvelles mécaniques (« rien d'ajouté sans demande »). Le puits de la géode, son raccourci, la
  musique, les couleurs et les ambiances ne bougent pas.
- Pas de roulis dans l'entrée, la mine, le puits, la salle du portail. Pas de changement de la durée visée des maps (`DUREE_ALLURE.grotte`).
- Pas de changement de `VOLR`/`TBORD`/`pisteTord` (la session « attraction routière » des nuages y travaille : on se coordonne, on ne les modifie pas).

## 5. Comment on le prouve (critères de réussite)

Banc Node sur les VRAIES fonctions extraites d'`index.html` (le banc `banc-traces/` de la session HASARD), 40 graines × paliers 0 / 10 / 25 :
- **La dose** : dans chaque salle qui roule, sol 30-50 %, murs 28-42 %, plafond 18-32 % ; sur le parcours entier ~50-65 % sol, 18-30 % murs, 12-22 %
  plafond ; les salles à plat 100 % sol. Le banc imprime les deux lectures (par salle qui roule, parcours entier) pour que Sacha juge.
- **Le roulis** : ≤ 90° par 6 s de croisière ; aucune tenue au plafond > 12 s ; le sol revient au moins toutes les ~35 s dans une salle qui roule.
- **La route** : rayon de virage minimal ≥ celui d'aujourd'hui (même `rM`) ; zéro conflit 3D, zéro spire à moins de 70 m ; longueur de chaque salle à ±3 %
  de la longueur visée ; 0 point de la route dans la roche (`dbgGrotte('test')` : 0 roche, 0 décor dans le noyau).
- **La paroi** : la distance route → roche le long de `N` : médiane 15-25 m, ≥ 90 % des échantillons entre 8 et 45 m dans les salles qui roulent.
- **L'identité** : `?sans=grotteparois` = les pistes d'avant au bit près (240 pistes sur 240) ; les salles à plat inchangées.
Dans le vrai jeu (Chrome sans fenêtre, muet, `?carte=grotte&meteo=…`, téléphone couché 844 × 390 ET debout) : course lancée sans erreur de boucle
(`__loopErr`), photos de chaque salle au sol, sur le mur et au plafond, la caméra et la gravité en vol qui suivent la route (poussée de côté mesurée
comme pour `VOLR_ROULIS`), le pilote automatique (`dbgAuto`) qui finit la grotte, les coûts de construction comptés en tronçons/triangles (pas en ms).

## 6. Risques

- **Gros chantier** : génération, creusement, décors, raccord à `TORD`. Livraison en étapes mesurées (génération au Node d'abord, puis creusement, puis jeu).
- **Coût de construction sur iPhone** : l'axe qui tourne rend le creusement moins ordonné ; on compte les cases creusées et on garde le plafond d'avant.
- **La forme des grottes change** : chaque salle devient un tube plus droit dont la route fait le tour ; les tracés au hasard du 20/10 gardent axe, ordre
  des salles, caractères et puits, mais le plan est moins sinueux.
- **Le lac de lave** : une route au plafond au-dessus du lac, c'est loin du lac ; à juger en photo, ajustable par `GRT_PAROI_SALLES` (la table des salles
  qui roulent) sans toucher au reste.
- **Trop sage ? Trop violent ?** Dans les salles qui roulent, 60 % du temps est de travers : c'est ce que « équilibré » a voulu dire ici. Le parcours
  entier reste ~40 % de travers (les salles à plat). Si l'essai la veut plus folle (Sacha avait aussi proposé « très souvent de travers »), c'est
  `GRT_PAROI_DOSE`, une constante ; la route des nuages, trop tordue au premier jet, avait été calmée le 18/10.
- **À trancher par Sacha après essai** : la distance à la roche (20 m), la dose, la vitesse du roulis, le lac de lave à plat ou roulant.

## 7. Livraison

`JOURNAL.md` (une section en haut, titre sur une ligne, mesures avant/après), `CLAUDE.md` si une règle change, `CACHE` de `sw.js` +1 sur `HEAD` de
`origin/main`, `node code/assembler.cjs --verifier` (le jeu est assemblé depuis `code/`), `sh garde-burnout.sh` et `sh garde-charte.sh`, push
`grotte-parois:main`, lien https://car-cash-git.vercel.app/jouer/ avec `?carte=grotte`.
