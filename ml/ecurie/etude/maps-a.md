# maps-a

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Sur ces trois maps, au sol, seule la sortie par le bord de la route est dangereuse : rien ne tue sur la dalle. On meurt toujours en VOL (branche 'fall' de boucle-3-physique.js:584-595). NUAGES et ORAGE : aucun obstacle dur. Les nuages ne font que boucher la vue, la foudre n'est qu'un effet visuel. On y meurt de 'vide' ou de 'air', c'est-à-dire quand la jauge d'air se vide, ou de 'vide' sous le plancher du monde. ESPACE : dans la version par défaut (ESP_SANS_GEANTS vrai), les roches, satellites et géants ne tuent plus du tout (rochesHeurt renvoie toujours ''). Restent 'air' et 'vide', avec une gravité ×0,5 et une jauge de 5 s au lieu de 6. GROTTE : la roche, la lave, l'eau et la glace tuent en vol (grotteHeurt). La route est enroulée sur le sol, les murs et le plafond. En vol, le « bas » est celui de la dalle quittée (VOLR.u), pas le bas du monde. Quitter le bord, c'est donc tomber sous SA dalle, où il ne reste que 14 à 36 m d'air avant la roche, sauf au-dessus d'un gouffre. Dans les passages exigus, la paroi est à 9 m du bord de la route et la voûte à 26 m. Les 5 morts « roche » du bot de référence (note-reference.json) sont TOUTES en grotte ; ses morts « air » sont en espace. Les yeux actuels sont aveugles à tout ça : `trou` est toujours faux sur ces maps et `troncons` raisonne avec le haut du monde. Tout est lisible à bas coût depuis la portée d'eval : GROTTE.R (la forme de l'air autour de la route, par abscisse), grtDensIci et grotteHeurt (le test exact en un point), VOLR.u (le vrai bas du vol), nuaSautRefuse et espSautRefuse (les sauts que le jeu refuse).

## Pour le bot

- GROTTE, LE COULOIR D'AIR (peu coûteux) : pour d = 30…550 m devant, la dichotomie sur GROTTE.R.S donne q. Les yeux exposeraient {d, rh:R.RH[q]-ROAD_HALF (la marge latérale), up:R.UP[q], dn:R.DN[q], tube:R.TUF[q]>.5, bas:R.BAS[q]>0 (lac dessous), salle:R.SAL[q]}. C'est la forme nominale du creux ; le bruit de la roche (NZ) n'y est pas.
- GROTTE, LA VRAIE ROCHE (sonde exacte) : depuis la caisse, lancer quelques rayons dans le repère de la dalle (vers le haut, vers le bas, à gauche, à droite, au-delà du bord), pas de 2 m comme `plafond` et `plancher` dans grottes-2.js:18-19. Retourner la distance à grtDensIci(GROTTE.V,x,y,z)<=0, et la nature du point (grtIci : 4 ou 6 lave, 5 ou 7 eau). Environ 8 lectures de case par point.
- GROTTE, LE VOL PRÉDIT : intégrer la parabole sur 1 à 3 s (P+=V·dt·SPD ; V-=VOLR.u·FALL_G·gK()·dt si VOLR.on, sinon V.y) et appeler grotteHeurt(P) sur chaque point. Les yeux sortiraient « choc dans t s (roche, lave, eau, glace) » et « pose dans t s ». Il faut le faire au sol aussi, pour l'hypothèse « je saute ici » ou « je sors par le bord ». C'est ce qui manque pour arrêter les morts 'roche'.
- GROTTE, LES RÈGLES QUI EN DÉCOULENT : jamais de sortie par le bord (le fond est à 14-36 m, puis la roche). Jamais de saut ni de nitro planée quand R.TUF>0 ou dans un GROTTE.boyaux (les bornes × kS). Le seul raccourci volant fiable est le module pSaut ; la fonction troncons() actuelle est fausse ici.
- TOUTES LES MAPS ENROULÉES (nuages, grotte, orbite couchée) : il faut exposer VOLR.on et VOLR.u, puis réécrire troncons(), vol.monte et vol.plancher dans le repère VOLR.u : la chute se mesure le long de -VOLR.u, et une dalle d'arrivée est valable si Nn[j]·VOLR.u>.35. Sinon, les raccourcis proposés et le « plancher » sont faux dès que la dalle est couchée.
- NUAGES ET ESPACE, LES SAUTS INTERDITS : exposer `sautRefuse: nuaSautRefuse()||espSautRefuse()`. Elles se lisent sans effet sur le jeu, mais nuaSautRefuse écrit NUA_SS.der, une variable de diagnostic. C'est le jeu lui-même qui dit qu'un saut tuerait (crête qui plonge, montée de plus de 7° en orbite). Le bot de référence n'en tient pas compte aujourd'hui.
- LE 'VIDE' PARTOUT : exposer en vol `perduDepuis: MIR.t` (plus de 2,2 s avec la jauge vide, c'est 'vide') et `reste` (déjà là). Les morts 'vide' et 'air' sont des jauges qui se vident loin de la route, pas des chocs. Le bon signal, c'est l'anneau de pose absent (LM.vu faux) et la dalle qui s'éloigne le long de VOLR.u.
- ESPACE : rien de dur dans la version par défaut. Les risques sont la jauge de 5 s et la gravité ×0,5 : un saut pris en montée ou depuis une dalle à l'endroit dure trop longtemps. Pas besoin de sonde d'obstacle ; il faut la prédiction de pose et espSautRefuse.
- NUAGES ET ORAGE : rien à éviter hors route. Un pilote d'élite peut traverser les nuages sans crainte (ils ne bouchent que la vue). Pour un bot qui doit avoir l'air humain, cloudIn (la part de vue bouchée) peut servir à dégrader sa vision devant, comme pour un vrai joueur.
- BOTS DE NIVEAU HUMAIN (les plus faibles) : les sondes ci-dessus sont ce que voit un humain (parois, voûte, lac, brouillard de 460-740 m en grotte). Pour un bot moyen ou faible, on peut raccourcir leur portée au brouillard (fogF), les bruiter ou les retarder, au lieu de lui laisser grotteHeurt exact à 3 s. Le pilote d'élite, lui, garde la sonde exacte.
- PETITES CORRECTIONS DES YEUX : `trou` est toujours faux sur ces trois maps. Dans `modules`, ajouter les passages exigus de la grotte depuis GROTTE.boyaux, puisque MODS perd leur nom. `envers` (Nn.y<0) n'est pas un danger en soi sur une route enroulée, car on n'y décroche pas à basse vitesse.

## Les faits

- Les morts par décor sont toutes testées en VOL, à chaque image : portail, grotteHeurt, banquise, jade, canyon, dunes, ville vitrée, rochesHeurt, villeHeurt, geantsHeurt, puis la pose (tryLand), puis la jauge ou le vide. Au sol, la sortie par le bord appelle startFall(0,1,true) : la caisse tombe, elle ne meurt pas sur place.
  - *preuve* : code/moteur/boucle-3-physique.js:584-595 ; code/moteur/boucle-2-conduite.js:148-153
- Fin 'vide' contre fin 'air' : explode(jadeVide(fallPos.y)||MIR.t>2.2?'vide':'air') quand la jauge est vide (airDepasse). jadeVide(y) vaut y<trackMinY-120 en Y DU MONDE. MIR.t compte les secondes passées « perdu d'avance » : plus de 10 m sous la dalle survolée, en tombant, sans anneau de pose.
  - *preuve* : code/moteur/boucle-3-physique.js:595 ; code/maps/jade-3.js:371 ; code/gameplay/pouvoirs-grisants.js:68-72 ; code/gameplay/fruits-auras.js:365
- airMax() = 6 s × (5/6 si gK()<1). En orbite, gK()=0,5 (ORB_G) : la jauge dure 5 s et les sauts montent deux fois plus haut.
  - *preuve* : code/gameplay/gravite-orbite.js:7-14 ; code/son/curseurs.js:309 (AIR_MAX=6, FALL_G=33*GRAV_K)
- TROU n'est rempli que depuis TROUMARK, et seul dunes-1.js l'utilise (vidé, avec le commentaire « aucun TROU »). Sur nuages, espace et grotte, TROU=null : le champ `trou` des yeux est toujours faux.
  - *preuve* : code/moteur/depart-avance.js:139-144 ; code/maps/dunes-1.js:66 ; ml/bot/yeux.js:52
- La route SANS HAUT NI BAS (TORD.on) est active sur les nuages et l'orage (hautOn), l'orbite (espTordOn) et la grotte (grtTordOn). La dalle peut être couchée, sur la tranche ou à l'envers.
  - *preuve* : code/moteur/depart-avance.js:111 ; code/gameplay/route-sans-haut.js:172,182 ; code/maps/grottes-1.js:63
- Le haut du vol vaut VOLR.u = la normale de la dalle QUITTÉE, figée tout le vol (VOLR_FIGE), dès que volrOn() et murRoule(F) sont vrais. Sur les nuages et la grotte, murRoule renvoie toujours vrai (TORD.murs faux, pas l'orbite). En orbite, il ne vaut que pour une dalle couchée de plus de 25° ; sinon, c'est le haut du monde. La gravité du vol vaut -VOLR.u*FALL_G*gK().
  - *preuve* : code/gameplay/portail-passage.js:300-301 ; code/maps/canyon-murs.js:104-108 ; code/gameplay/camera.js:395-414 ; code/moteur/boucle-3-physique.js:297-299
- Sortir par le bord sur une route tordue, c'est tomber « sous SA dalle et s'y perdre » (commentaire du jeu). Au sol, le décrochage à basse vitesse sous une dalle à l'envers est coupé quand volrOn() est vrai.
  - *preuve* : code/gameplay/camera.js:368-380 ; code/moteur/boucle-2-conduite.js:155
- NUAGES : un nuage ne touche plus du tout la caisse : ni portance, ni frein, ni airtime rendu. Il ne fait que boucher la vue (cloudIn, voile, brouillard) et trembler la caméra. Aucun explode dans les fichiers des nuages.
  - *preuve* : code/maps/nuages-vitrail.js:820-862 (commentaires 2026-09-30, « juste bloquer la vue »)
- ORAGE : la foudre (eclFrappe, orageTick) est visuelle et sonore : étincelles quand elle frappe la route, flash, brouillard ouvert (CAMP_FOG). Elle ne tue jamais.
  - *preuve* : code/gameplay/zones-caisses.js:36-60,174-183 (« visuel seulement », ligne 39)
- NUAGES : le saut nitro et le décollage au manche sont REFUSÉS (nuaSautRefuse) là où la route se déroberait sous le vol (crête qui plonge de 50-70°). Le jeu regarde 1,2 s devant, 2 s nitro tenue, seuil 8 ou 6 m/s. Il refuse aussi dans les fenêtres MODS[k].ss (épingles relevées, looping).
  - *preuve* : code/gameplay/route-sans-haut.js:142-161 ; code/maps/nuages-parcours.js:43-46
- ESPACE : ESP_SANS_GEANTS est VRAI par défaut (il faut ?plus=geants pour le défaire). rochesHeurt renvoie alors '' tout de suite (ni roche ni satellite), et aucun géant n'est créé (GEANTS.col reste faux). Le décor se réduit à quelques amas à 60 m ou plus de la route, sans collision.
  - *preuve* : code/maps/orbite-modules.js:44-52 ; code/maps/orbite-roches.js:74-75 ; code/maps/orbite-geants.js:60-61,166,320
- ESPACE : le saut nitro est refusé sur une dalle à l'endroit qui monte de plus de 7° (espSautRefuse). Le jeu l'a mesuré : la remontée de LA FAILLE tuait en 'air' à tous les coups.
  - *preuve* : code/gameplay/route-sans-haut.js:125-141 ; code/gameplay/vol-equilibre.js:228
- ESPACE : les modules de forme restent (torsade, virage surbaissé au plafond, bobsleigh, plongeant, faille et cascade, faille à l'envers d'environ 12 s la tête en bas, croisement en looping). Ils sont dans MODS[].fig.
  - *preuve* : code/maps/orbite-modules.js:1-30,53
- GROTTE : grotteHeurt(p) est un test pur. Si grtDensIci(GROTTE.V,x,y,z)<=0, le point est dans la matière : la case (grtIci) 4 ou 6 donne 'lave' (ou 'glace' en météo glace), 5 ou 7 donne 'eau', le reste 'roche'. Sinon, il teste les boîtes et prismes des gros décors (GROTTE.col.G, grille de 64 m, o.k = la cause).
  - *preuve* : code/maps/grottes-2.js:512-520 ; code/maps/grottes-1.js:855-859
- Le jeu teste aussi les points intermédiaires du trajet de l'image quand il tourne sous 60 i/s : la roche se percute même à grande vitesse.
  - *preuve* : code/moteur/boucle-3-physique.js:583
- GROTTE : la forme de l'air autour de la route est stockée par échantillon (~6 m) dans GROTTE.R. On y trouve S (l'abscisse), RH (la demi-largeur du creux), UP (la voûte au-dessus de la dalle), DN (le fond sous la dalle), LAT (le décalage latéral du creux), BAS (le bassin vers le lac), TUF (0-1 : dans un tube), SAL (la salle), NNX/Y/Z et BX/Y/Z (le repère de la dalle). Les index vont de R.i0 à R.n-21, triés par S : grtSalleIci en fait déjà la dichotomie.
  - *preuve* : code/maps/grottes-1.js:872-915 ; code/maps/grottes-2.js:482
- GROTTE, les tailles : en salle, le fond sous la route ne vaut que `hug` (30-36 m) quand la route longe la paroi, et s'ouvre en gouffre environ 25 % du temps (grtProfond). Les salles font 125 à 340 m de demi-largeur et 115 à 240 m de voûte. La mine fait rh 44, up 33, dn 15. Les goulets pincent la salle de 42 % sur environ 150 m tous les 1,2 km.
  - *preuve* : code/maps/grottes-1.js:68-100 (GRT_FORME, GRT_VASTE), 889-891
- GROTTE, LES PASSAGES EXIGUS : 2 ou 3 par route (boyau, faille, chas, tube). La paroi est à 9 m du bord de la dalle (rh 37, la route fait 56 m), la voûte à 26 m, le fond à 14 m ; la faille n'a pas de plafond. Ils ne sont jamais placés à moins de 1,5 s avant ni 3 s après un saut voulu. Ils sont stockés dans GROTTE.boyaux ({s0,s1,f}, en abscisse de génération : il faut multiplier par kS=L/GROTTE.sTot).
  - *preuve* : code/maps/grottes-1.js:220-222,793-826,909-914
- Les marques des passages exigus ont un `nom` ('xTube', 'xBoyau'…) mais pas de `fig`. Or MODS ne garde que s0, s1, fig, climax, nu et ss : dans vue.modules, ces passages arrivent avec nom:null.
  - *preuve* : code/maps/grottes-1.js:325,824 ; code/moteur/depart-avance.js:131 ; ml/bot/yeux.js:62
- GROTTE : LE SAUT DES ABYSSES (gSaut, pSaut) est le seul raccourci dessiné : on va tout droit dans un virage serré, et la route d'en bas est 58 à 80 m plus bas, dans l'axe. Partout ailleurs, couper un virage en vol, c'est percuter la roche (« la roche tue en vol »).
  - *preuve* : code/maps/grottes-1.js:383-388,655 ; code/maps/grottes-1.js:39 ('LA ROCHE NE PARDONNE PAS')
- GROTTE, ce que voit le joueur : un brouillard de biome (fogF 460 à 740 m × GRV.fog), des torches, une lueur au bout des failles, des cristaux, la lave. Au-delà du brouillard, les tronçons de roche sont cachés.
  - *preuve* : code/maps/grottes-2.js:15-19,504-506 ; grtBiomes (fogN:30-60, fogF:460-740)
- Les pièces sont posées par le même générateur sur toutes les maps (spawnPickupsG) : sur la dalle, les deux faces en miroir. Les pièces EN L'AIR (fils d'or de l'orbite, pièces des géants) sont coupées par défaut depuis le 15/11 (il faut ?plus=piecesair). De toute façon, yeux.js saute p.air.
  - *preuve* : code/gameplay/pouvoirs-grisants.js:428-475,550-553 ; ml/bot/yeux.js:57
- Les yeux supposent le haut du monde. troncons() utilise P.y-Q.y, Nn[j].y>.35 et une gravité en Y ; le vol utilise VIT.y et plancher=fallPos.y-(trackMinY-120). Sur les nuages et la grotte, en vol, le vrai haut est VOLR.u.
  - *preuve* : ml/bot/yeux.js:16-31,69
- YEUX_CODE est évalué DANS la fonction du jeu (__EV injecté avant le dernier '})();'). grotteHeurt, grtDensIci, GROTTE, VOLR, nuaSautRefuse, espSautRefuse, airMax et fallTR y sont donc lisibles directement.
  - *preuve* : ml/reel/sim-env-reel.js:13,177-178
- Le simulateur creuse la grotte sur place (grotteworker=0, parce que le Worker du simulateur ne répond pas). GROTTE.V et GROTTE.R existent donc dans ml/reel.
  - *preuve* : ml/reel/sim-env-reel.js:160-163 ; ml/reel/README.md:34-35
- Le bot de référence, sur 20 graines : 5 fins 'roche', toutes avec la grotte comme DERNIÈRE map (910000, 910074, 910259, 910481, 910555). 2 fins 'air' avec l'espace en dernier (910703) ou la grotte>jade>espace (910037). Les fins 'vide' tombent sur le canyon ×4, jade ×5, nuages ×2, ville ×1.
  - *preuve* : ml/bot/results/note-reference.json (courses[].cause et cartes, lu avec node)

## Non verifie

- Rien n'a été exécuté (consigne) : coût réel des sondes grtDensIci par décision, et vrai lieu des 5 morts 'roche' (après un saut ? une sortie par le bord ? un raccourci par troncons ?). Il faut l'autopsie (ml/bot/autopsie.js) ou le journal 'mort' de l'enregistreur (moteur/enregistreur-jeu.js:67,74) pour trancher.
- Que la forme nominale de GROTTE.R (RH, UP, DN) colle à la roche réelle à quelques mètres près : le bruit NZ et le creusement par les échantillons voisins s'y ajoutent ; seul grtDensIci fait foi.
- La correspondance exacte entre R.S et l'abscisse s du jeu sur toute la route : grtSalleIci compare directement s à R.S, mais je ne l'ai pas mesuré.
- La part des morts 'vide' en nuages qui vient de nuaSautRefuse ignoré, d'une sortie de bord ou de la jauge : non mesurée.
- Lu en diagonale seulement : les modules des nuages (nuages-modules.js, nuages-parcours.js : boucle, stade, raccourcis sous la lèvre) et orbite-uniques.js. Je n'y ai trouvé aucun explode, mais je n'ai pas vérifié chaque cas particulier de saut.
- Les décors de grotte en GROTTE.col (concrétions, cristaux, géants coupés par défaut : GRT_GEANT.on ne s'active que par ?avec=geants) : la liste exacte des valeurs o.k n'a pas été relevée.
- La météo 'glace' de la grotte (grt-glace) : la cause 'glace' est confirmée dans grotteHeurt, mais pas d'éventuelles règles de glisse au sol propres à cette météo.
