# morts

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Tout passe par explode(cause) (code/gameplay/mort.js:258). Au SOL, on ne meurt que de trois façons : rester sous 22 km/h pendant 6 s (« arret »), percuter un mur de couloir à plus de 30° et plus de 200 km/h (« paroi »), ou toucher un pic du glacier, une carte hors du tirage de main (« glace »). Partout ailleurs, on meurt EN VOL. Une pose, même lourde ou ratée, ne tue jamais. Sortir par le bord de la route ne tue pas non plus tout de suite : la voiture passe en vol (startFall), puis elle meurt si la jauge d'air (6 s, 5 s dans l'espace) se vide (« air », ou « vide » si elle était perdue sous la route depuis plus de 2,2 s), si elle tombe 120 m sous le point le plus bas de la piste (« vide »), ou si elle entre dans un décor. Selon la carte, la cause s'écrit alors tour, pic, paroi, canyon, riviere, roche, lave, eau, glace, sable, oasis, monolithe, rocher, satellite ou sol. Le bump sur la tranche de la route rend une demi-jauge d'air. La seconde chance vaut une fois par partie, après au moins 20 s de course. Elle coûte une pub sur le web (gratuite dans l'app) et UN PALIER DE MOTEUR. Elle donne 3 s d'invulnérabilité et un sursis de 2,2 s. Aucun pouvoir ne rend invincible (le bouclier a été retiré le 29/09). Le gros manque des yeux du bot (ml/bot/yeux.js) : ils ne voient AUCUN obstacle du décor, ni l'invulnérabilité, ni le chrono d'arrêt. Et ils donnent une marge d'air fausse (99) quand le raisin est actif, alors que le raisin double seulement la jauge.

## Pour le bot

- ARRET : ne jamais rester sous 22 km/h plus de 5 s cumulées. La vue suffit à le surveiller : vitesse en m/s, divisée par vitMult, multipliée par 3,6. Pour un bot humain faible, c'est une vraie cause de mort de débutant à reproduire de temps en temps (calé sur l'étalon, qu'il faut d'abord vérifier).
- PAROI : dans un couloir, ne jamais toucher le mur à plus de 30° au-dessus de 200 km/h. Sous 30°, on ne fait que frotter. Les yeux ne disent PAS où sont les couloirs : il faut ajouter un champ (ex. couloir:[s0,s1] devant) ou le déduire de la carte (canyon, ville).
- BORD : |lat| > demi fait décoller (sans mourir tout de suite). Le pilote d'élite garde |lat| < demi et rase le bord (les 20 % extérieurs) pour recharger la nitro. Un pilote faible sort plus souvent. Il survit si la route est sous lui (la lèvre le rattrape pendant 0,8 s en braquant vers la route, ou un bump), il meurt (air ou vide) si la route est au-dessus de lui ou loin.
- VOL, règle sûre : se poser avant que reste < 0. reste et l'anneau (délai) sont visibles. Si l'anneau est absent (rien en vue), le joueur est perdu : chercher la tranche pour un BUMP (+3 s d'air) ou la route proche. Le plancher (en m) donne la marge avant 'vide'. L'élite vise une pose à moins de 0,5 s de la fin de jauge (réception à l'arrachée, qui rapporte).
- Avec le raisin, NE PAS croire reste=99 : la vraie marge est jauge restante + 6 s (si RAI.stage=0) ou la jauge seule (stage 1). À corriger dans yeux.js (lire RAI.stage) avant tout entraînement, sinon un cerveau appris volera jusqu'à la mort.
- DÉCORS EN VOL (tours, pics de jade, canyon, grottes, dunes, roches et satellites de l'orbite, épave) : c'est la plus grosse cause invisible. La porte de lecture actuelle n'en donne rien : un bot ne peut les éviter que par hasard ou en restant bas, près de la route. Il faut ajouter un sondage : la fonction *Heurt du jeu appliquée à la trajectoire prédite sur 1 à 2 s (comme le viseur, 14 pas de 0,12 s), qui renvoie le délai avant impact et la cause. Les fonctions *Heurt sont pures et peuvent se réutiliser en lecture seule.
- Pour l'écurie par palier : un humain faible meurt surtout par air/vide (sorties de route, vols trop longs) et par arrêt ; un humain fort meurt surtout par décor et en prenant des risques en vol (figures longues, raccourcis). Pour être indiscernable, il faut reproduire la RÉPARTITION des causes de l'étalon par palier, pas seulement la survie.
- SECONDE CHANCE et matchmaking : la reprise coûte UN palier de moteur. Un vrai joueur qui la prend finit un palier plus bas qu'il n'avait atteint. Si les bots imitent des records, il faut décider s'ils « prennent la pub » (une fois, après 20 s de course) et en tenir compte (palier -1, 3 s d'invulnérabilité où une chute est gratuite).
- Pendant les 3 s d'invulnérabilité, une chute n'est pas punie : un bot humain peut y prendre plus de risques. La vue ne l'expose pas (CHANCE.inv absent).

## Les faits

- Point d'entrée unique : explode(cause) enregistre la cause (mortCause), sauf si le bouclier de la seconde chance protège (chanceProtege). Si la voiture explose déjà ou si la partie est finie, rien ne se passe.
  - *preuve* : code/gameplay/mort.js:258-269
- ARRET : au sol, hors parc, balade et intro, et seulement quand graceT<=0. En dessous de 22 km/h (|vA|*3.6*SPD), idleT augmente. L'alerte « ROULE OU CRÈVE » s'affiche à 1,6 s, la mort arrive à 6 s. Au-dessus de 22 km/h, idleT redescend 2,5 fois plus vite qu'il ne monte.
  - *preuve* : code/moteur/boucle-2-conduite.js:5-14
- PAROI (au sol) : seulement dans un couloir (canyon : cyCouloirIci = couloir, tunnel ou mine ; ville : villeCouloirIci) et quand |lat| > ROAD_HALF-1,15. Mort si l'angle d'attaque dépasse 0,52 rad (environ 30°) ET la vitesse dépasse 200 km/h. Sinon c'est un simple coup d'épaule : la voiture perd au plus 30 % de vitesse, et son cap est renvoyé de -30 %.
  - *preuve* : code/moteur/boucle-2-conduite.js:146 ; code/maps/murs-parois.js:4-16 ; canyon-relief.js:516 ; ville-scenes.js:450
- BORD hors couloir : quand |lat| > ROAD_HALF, la voiture passe en vol (startFall(0,1,true)) si graceT<=0. Pendant le sursis (graceT>0), elle est simplement tenue au bord. Sur la glace du glacier, la congère ralentit sans tuer.
  - *preuve* : code/moteur/boucle-2-conduite.js:147-154
- DESSOUS / plafond : sous la route (F.n.y < -0,15) et sous |vA| = 7, la voiture décroche et passe en vol (sauf sur la route sans haut ni bas, volrOn).
  - *preuve* : code/moteur/boucle-2-conduite.js:155
- GLACE au sol (glacier) : un pic de la piste percuté au sol. Le test balaie le trajet tous les 1,2 m et ne joue pas pendant graceT. Le glacier est hors du tirage de main (SF_HORS.banquise).
  - *preuve* : code/maps/glacier-construction.js:16-32 ; code/maps/niveaux.js:58
- Ordre des tests EN VOL, à chaque image : portail ; grotte (renvoie roche/lave/eau/glace ou le type du décor) ; glacier (glace si on est plus de 1,6 m sous la surface) ; jade (pic) ; canyon (riviere/paroi/canyon) ; dunes (oasis/sable/monolithe/rocher/roche) ; ville vitrée (sol, sous CITY.solY+1,4) ; roches et satellites de l'orbite (roche/satellite) ; tours de la ville (tour) ; géants de l'orbite (paroi) ; pose (tryLand) ; enfin jauge d'air et plancher.
  - *preuve* : code/moteur/boucle-3-physique.js:584-595 ; grottes-2.js:515-520 ; canyon-relief.js:396-404 ; dunes-2.js:290-300 ; orbite-roches.js:74-84 ; orbite-geants.js:363-369 ; ligne-parfaite.js:102-107 ; jade-vol.js:282
- Sous 60 images/s, le trajet de l'image est retesté à la densité de 60 i/s contre les décors durs (grotte, jade, canyon, dunes, ville, roches) : on ne traverse plus un obstacle grâce à une image lente.
  - *preuve* : code/moteur/boucle-3-physique.js:583
- AIR / VIDE : mort si airDepasse() (sauf en balade) ou si jadeVide(y), c'est-à-dire y < trackMinY-120 (sur toutes les cartes). La cause vaut 'vide' si jadeVide ou si MIR.t > 2,2 s (voiture perdue : pas d'anneau, chute à plus de 4 m/s et plus de 10 m sous la route proche), sinon 'air'.
  - *preuve* : code/moteur/boucle-3-physique.js:595 ; code/maps/jade-3.js:371 ; code/gameplay/pouvoirs-grisants.js:68-71
- La jauge : AIR_MAX = 6 s, multiplié par 5/6 dans l'espace (5 s). Elle se compte en temps RÉEL (fallTR += dt), remis à 0 à chaque décollage.
  - *preuve* : code/son/curseurs.js:309 ; code/gameplay/gravite-orbite.js:7,14 ; boucle-3-physique.js:290 ; portail-passage.js:268
- Ce qui rend de l'air : un BUMP contre la tranche de la route rend une demi-jauge (fallTR -= 3 s). Il renvoie la voiture vers le haut et peut s'enchaîner (double, triple bump). Le glacier rend aussi de l'air en glisse (fallTR -= 3 s par seconde). Les nuages n'en rendent plus depuis le 30/09.
  - *preuve* : code/gameplay/demi-tour.js:390-417 (405) ; glacier-construction.js:276,290 ; nuages-vitrail.js:851
- Pouvoir air / RAISIN (pwrAirT, 14 s ; il s'use 4 fois moins vite au sol) : il ne rend plus l'air infini, il DOUBLE la jauge. Quand la 1re jauge est vide, la voiture perd ses ailes, RAI.stage passe à 1 et fallTR repart de 0. Quand la 2e est vide, c'est la mort. Si pwrAirT s'éteint en plein vol, fallTR est remis à 0 (jauge pleine).
  - *preuve* : code/gameplay/fruits-auras.js:358-372 ; code/moteur/boucle-1.js:193 ; pouvoirs-grisants.js:9
- Une POSE ne tue jamais : tryLand ne contient aucun appel à explode. Une pose dure coûte jusqu'à 30 % de vitesse. Une pose ratée (angle trop grand, ou en plein salto) remet seulement le flow à zéro. La lèvre du bord rattrape la voiture pendant la bascule (≈ 0,8 s).
  - *preuve* : code/gameplay/demi-tour.js:308-499 (356-364, 468-473)
- POLICE : mort seulement en mode Survivant (dernier de la minute). Ce n'est pas une course normale.
  - *preuve* : code/rendu/kit-lumiere.js:379-388
- Il n'existe aucun pouvoir d'invincibilité : le bouclier a été retiré le 29/09. Les seuls cas où l'on ne meurt pas : CHANCE.inv > 0 (après une reprise), dbgImmortel, le parc (PARK : replacement au lieu de la mort), et l'auto-école (air infini prêté par la leçon).
  - *preuve* : code/gameplay/pouvoirs-orbes.js:20-23 ; seconde-chance.js:222-231
- SECONDE CHANCE : une seule fois par partie (CHANCE.used), après au moins 20 s de course (tMin) sauf avec un bon gagné à la machine, et seulement sur une vraie mort (pas en parc, auto-école, Survivant, balade ou bac à sable). L'offre reste 5,5 s à l'écran. Prix : une pub récompensée (gratuite dans l'app). Un bon de la machine (SAVE.d.chanceG) réanime automatiquement.
  - *preuve* : code/gameplay/seconde-chance.js:91-109,127-137,148-151
- Effets de la reprise : le moteur PERD UN PALIER (engTier-1, et coinsGot redescend au seuil de ce palier). La chaîne, le flow et les pouvoirs sont perdus ; la nitro remonte à au moins 50 % de sa capacité. La voiture repart à max(safeS, s-40). Elle a un sursis graceT de 2,2 s et 3 s d'invulnérabilité (au moins 2 s après la résurrection). Pendant l'invulnérabilité : un choc est ignoré, une chute ('vide'/'air' ou en vol) replace la voiture sans frais.
  - *preuve* : code/gameplay/seconde-chance.js:179-207,212-213,224-231,367
- Sursis graceT : 1,4 s au départ, 2,2 s après une reprise ou un replacement, la durée du demi-tour + 0,3 s. Pendant graceT, ni le bord, ni l'arrêt, ni le plafond, ni les pics du glacier au sol ne tuent.
  - *preuve* : code/rendu/tirelire-reserves.js:26 ; demi-tour.js:171-198 ; boucle-1.js:248 ; boucle-2-conduite.js:6,152,155 ; glacier-construction.js:19
- Ce que les yeux du bot voient : au sol, lat, demi (ROAD_HALF), sursis (graceT), vitesse, cap, et la route devant (virage, monte, devers, envers, trou jusqu'à 550 m). En vol : reste (marge d'air), plancher (y-(trackMinY-120)), la route proche (lat, haut, axe), l'anneau de pose (délai) et la cause de mort à la fin.
  - *preuve* : ml/bot/yeux.js:36-83
- Erreur des yeux : en vol, reste = 99 dès que pwrAirT > 0. Avec le raisin, la mort arrive pourtant à la fin de la 2e jauge (RAI.stage n'est pas lu).
  - *preuve* : ml/bot/yeux.js:66 contre code/gameplay/fruits-auras.js:365-372
- Ce que les yeux ne voient PAS : aucun obstacle du décor (tours, piliers de jade, parois et arches du canyon, roche et lave des grottes, obélisques et pyramides, roches de Jupiter, satellites, épave, lunes). Ni l'emplacement des couloirs à murs (cyCouloirIci/villeCouloirIci), ni idleT, ni CHANCE.inv, ni MIR.t, ni RAI.stage, ni le sol de la ville vitrée.
  - *preuve* : ml/bot/yeux.js:36-83 (aucun appel à *Heurt, CITY, JADE.col, GROTTE, ROCHE_COL)

## Non verifie

- La liste complète des chaînes de cause renvoyées par les décors des grottes (o.k dans GROTTE.col) et par cyTun2Heurt (canyon v2) : je n'ai pas lu leurs tables.
- Comment un TROU de la route (TROU[k], entre deux segments au portail) agit au sol : je n'ai pas trouvé de test TROU dans boucle-2-conduite.js. Il est seulement exclu des poses (portail-passage.js:388) et la vue le signale.
- Si ml/reel exécute bien la seconde chance (écran de fin, pub, chancePrend) ou s'arrête à la 1re mort : non vérifié, simulateur non lancé.
- La répartition réelle des causes de mort dans l'étalon humain et pour le bot de référence : je ne l'ai pas mesurée (simulateur et noter.js non lancés comme demandé).
- Le détail de tryLand après la ligne 508 (réception à l'arrachée) et de la physique du bump au-delà de ce que j'ai lu.
- La mort à la mer de la jade (JADE.merY) : je n'ai vu que jadeVide (trackMinY-120) et la note « la mer de la jade » dans banqRamene. Une éventuelle autre mort liée à la mer n'est pas vérifiée.
