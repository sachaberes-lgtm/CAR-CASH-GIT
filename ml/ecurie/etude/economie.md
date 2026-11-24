# economie

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Le palier d'une course ne dépend que de coinsGot, et seuls deux gestes l'augmentent : chaque pièce ramassée ajoute 1, quelle qu'elle soit, et chaque figure posée ajoute de 2 à 18. Les fruits, les plaques, la ligne parfaite, les portails, les billets, la frénésie et le flow ne donnent aucune pièce. Ils multiplient seulement l'argent, ou la valeur d'une figure.

Le palier fait monter la vitesse plus que ne le laisse croire push (1 → 4,2). La vitesse de pointe vaut push × lateMul, et lateMul ajoute jusqu'à +50 % à partir de l'index 9. Le facteur total va donc de ×1,0 à ×6,3, avec une croisière d'environ 8,7 km/min (en mètres de piste) au départ. Le palier fixe aussi la taille des virages de la piste construite (palier + 2), l'espacement des motifs de pièces et la réserve de nitro (2,0 → 3,6). Une seule capacité aide au ramassage : l'aimant moteur, à l'index 15 (palier 16). Les billets et la comète ne font que de la décoration.

La densité de pièces ne dépend pas de la map : elle suit le nombre de portails franchis (runStats.zones). Elle vaut environ 55 pièces/km dans la première zone, puis 97, 141, 188, et atteint le plafond de 240/km dès la cinquième zone.

Depuis le 2026-11-15, aucune pièce n'est posée en l'air ni sur les raccourcis (sauf avec ?plus=piecesair). En vol, on ne prend que les pièces de la route à moins de 11 m (14 m avec l'aimant moteur), ou à moins de 50 m sous la pomme dorée.

La recette la plus rentable : rouler sur le fil des motifs avec l'élan au maximum, franchir les portails vite pour monter la densité, et prendre les raccourcis sous pomme dorée. Les figures posées parfaitement en frénésie rapportent 18 pièces chacune. La seconde chance coûte un palier entier, avec les pièces déjà gagnées vers le suivant.

Ce qui plafonne un joueur, c'est la survie et la part de pièces qu'il arrive à ramasser à grande vitesse, pas la quantité de pièces posées sur la route.

## Pour le bot

- Pour le matchmaking, le palier d'une course ≈ (pièces/min ramassées × minutes de survie) + pièces des figures − les pertes de seconde chance. Il y a donc deux réglages indépendants pour fabriquer un bot d'un niveau donné : la part de pièces qu'il ramasse et sa survie. Aux 391 pièces/min actuelles, il faut environ 2,2 min pour le palier 11, 4 min pour le palier 16, 10 min pour le palier 28 et 11 min pour le palier 30, en ignorant l'accélération et la densité qui montent avec le temps.
- Pour un bot faible (paliers 1 à 10) : il doit mourir tôt, dans les zones 1 et 2 (55 à 140 pièces/km), en ne prenant que 40 à 60 % des motifs (il ne tient pas le fil et lâche l'élan). Il ne doit pas faire de raccourci, pas de pose parfaite (figures à 2-4 pièces), et ses pièces/min doivent rester basses, car un humain faible se trahit aussi par sa vitesse (élan rarement plein, peu de nitro).
- Pour un bot d'élite (paliers 25 à 30) : il doit enchaîner les portails pour atteindre vite 240 pièces/km. Il roule centré sur le fil des motifs, avec un braquage sous 0,25 pour garder l'élan, la nitro dans les droites, la pomme dorée en priorité, et les raccourcis seulement sous pomme dorée (sphère de 50 m) ou en vol rasant (moins de 11 m). Il pose ses figures au centre, parfaites, en frénésie et en série, pour 12 à 18 pièces chacune. Il évite absolument la seconde chance, qui coûte un palier et les pièces vers le suivant.
- Le bot doit survivre à une caisse jusqu'à 6,3 fois plus rapide sur des virages agrandis jusqu'à ×4,4 : c'est le vrai plafond de l'élite. La portée de ramassage ne passe que de 3,8 à 4,3 m, donc à haute vitesse il faut viser plus tôt. Les motifs s'allongent peu (×1,13) alors que la vitesse est multipliée par plus de 6 : les pièces défilent de plus en plus vite.
- Aux paliers 16 et plus, l'aimant moteur élargit la zone d'attraction au sol (17 m devant, 11 m sur le côté). Un bot de haut niveau qui ramasserait moins après le palier 16 serait suspect.
- À corriger dans les yeux : yeux.js compte une pièce de 2 pour 2, alors qu'elle vaut 1 pour le moteur. Une file de pièces de 2 n'est pas plus rentable en palier, seulement en argent.
- Pour rester indiscernable, il faut comparer coinsGot/min et la part des pièces venant des figures aux parties de l'étalon. Le temps en l'air et les raccourcis des humains (28,7 % de temps en l'air, 2,66 raccourcis/min) coûtent des pièces de route mais font passer les portails plus vite : un bot copié sur les humains doit reproduire ce compromis.
- Pour un classement équitable, il faut aussi suivre deux biais hors pilotage : le départ boosté (moteur au palier 2 et 12 s d'aimant au départ) et le nombre de parties jouées, qui modifie les poids du tirage des pouvoirs (pomme dorée à 0,30 sous 8 parties, 0,19 au-delà de 30).

## Les faits

- ENGINE_TIERS a 30 entrées {coins,push,res}. Seuils de pièces : 0, 40, 85, 150, 225, 305, 400, 505, 615, 730, 860 (palier 11), 995, 1130, 1280, 1430, 1585 (palier 16), 1745, 1910, 2080, 2255, 2440, 2630, 2825, 3030, 3240, 3455, 3680, 3910 (palier 28), 4145, 4385. push va de 1,00 à 4,20, res de 2,00 à 3,60.
  - *preuve* : code/gameplay/pickups-fruits.js:557-588
- ENG_CAP = {billets:12, aimant:15, comete:27} sont des index qui partent de 0. Les capacités s'ouvrent donc aux paliers 13 (V10), 16 (V16) et 28 (COMÈTE) tels que l'interface les compte (v+1). Le commentaire de ramassage.js qui parle d'un aimant « V12 atmosphérique » est périmé.
  - *preuve* : pickups-fruits.js:592 ; achat-carte-moteur.js:37 ; ramassage.js:124
- addCoins(n) fait coinsGot += n, puis engTier = engineFor(coinsGot), c'est-à-dire le plus haut seuil atteint. Le record à vie SAVE.d.ex.eng est mis à jour sur-le-champ. checkUpgrade() ne touche pas au moteur : il ne sert qu'au déblocage des voitures (carScan).
  - *preuve* : economie/achat-carte-moteur.js:232-254 ; interface/jus-echelle.js:361-373
- addCoins n'a que deux appels en jeu : addCoins(1) par pièce ramassée, et addCoins(max(2, min(18, round(2 + q/6)))) par figure encaissée, au sol comme à la pose d'un vol. Les autres appels sont de la triche ou des bancs : dbgMoteur, TEST_PAL.
  - *preuve* : gameplay/ramassage.js:174 ; gameplay/figures-route.js:64 ; gameplay/demi-tour.js:574 ; rendu/ciel2.js:324 ; economie/aura-banque-contrats.js:89
- Une pièce de 2, la frénésie (fever) et le flow multiplient seulement l'argent g (×1,5 / ×0,75, ×2 et flowMult). Pour le moteur, chaque pièce vaut 1.
  - *preuve* : ramassage.js:174 puis 181
- Les fruits ne donnent que de la nitro bleue (« le fruit ne touche PAS au moteur »). Les orbes de pouvoir lancent un minuteur (pwrPrend) et ne donnent aucune pièce.
  - *preuve* : ramassage.js:146-155 ; gameplay/pouvoirs-grisants.js:31-52
- Pièces d'une figure : q = chainVal × min(6, chainMult) × g × (2 si face cachée) × (1 + 0,5 × FLOW.lv) × série (jusqu'à ×2) × (2 en frénésie). Une figure vaut val = aura/16 ; poser au centre ajoute chainVal +4 et chainMult +0,2 ; g vaut 1,5 pour une pose parfaite, 2 pour une pose divine, 0,65 pour une pose lourde. Il faut q ≥ 96 pour atteindre le plafond de 18 pièces.
  - *preuve* : demi-tour.js:526-548 ; interface/jus-echelle.js:302-303 ; gameplay/figures-physique.js:239
- La seconde chance enlève 1 palier (CHANCE.moteurPerte = 1) et remet coinsGot au seuil du palier atteint : les pièces gagnées vers le palier suivant sont perdues.
  - *preuve* : gameplay/seconde-chance.js:91, 188
- Une nouvelle partie remet engTier et coinsGot à 0. Le départ boosté (jeton du final spin) place le moteur au palier 2 (index 1) et donne les cinq pouvoirs pour leur durée pleine, dont l'aimant pendant 12 s.
  - *preuve* : seconde-chance.js:474 ; economie/final-spin.js:479-484
- Vitesse : maxSp = 190/3,6 × lateMul × push, avec lateMul = 1 + min(0,5 ; max(0, index − 8) × 0,035). La nitro, l'élan du départ et la poussée en vol sont multipliés par push. Il n'y a pas de plafond, seulement une traînée en v². Le facteur de vitesse vaut environ ×1,9 à l'index 10, ×2,9 à l'index 15, ×4,25 à l'index 20 et ×6,3 à l'index 29.
  - *preuve* : moteur/boucle-1.js:181-183 ; gameplay/camera.js:316-317 ; moteur/boucle-2-conduite.js:40-50 ; boucle-3-physique.js:322,331
- Croisière : l'élan (momF ≤ 2,8, en tenant sa ligne avec |psi| < 0,25 pendant 4,3 s) et la traînée donnent environ 2,75 à 3 × maxSp, soit environ 145 m/s de piste (≈ 8,7 km/min, 250 km/h affichés avec SPD = 0,48) au palier 1. Le bot de référence mesure 8 108 m/min, ce qui est cohérent.
  - *preuve* : boucle-2-conduite.js:38-50 ; camera.js:318 (« croisière ≈ 2,75 × maxSp ») ; passation/BOTS-ML.md:124
- La piste est construite pour la vitesse du palier courant + 2 : rayons des virages (lvPiste, de ×1 à ×4,4), vPalier et rayonPalier sont lus au palier de la piste. Le canyon rend aussi l'élan plus faible quand le palier monte (cyElan).
  - *preuve* : gameplay/camera.js:296, 321-322 ; rendu/traces-pneus.js:172 ; maps/canyon-v3.js:33
- La réserve de nitro res passe de 2,0 à 3,6. Le portail remplit la jauge jusqu'à res, et un fruit rend 0,2 × res × fruitK. Un palier élevé donne donc plus de nitro, donc plus de vitesse.
  - *preuve* : boucle-1.js:199-201 ; portail-passage.js:94 ; ramassage.js:150
- Aimant moteur (engTier ≥ 15) : au sol, la pièce est attirée à moins de 17 m devant et 11 m sur le côté (15 et 9 sans lui), avec une traction de 7,5 au lieu de 6, et se ramasse à 4,3 m au lieu de 3,8 m. En vol, il porte l'accroche de 11 à 14 m.
  - *preuve* : gameplay/ramassage.js:102, 111, 126-127, 138
- La pomme dorée (pouvoir m) dure 12 s et se cumule jusqu'à 24 s. Elle forme une sphère de 50 m (MAG_R) dans toutes les directions, au sol comme en vol, et n'attire que les pièces de ta face de route (pas les fruits ni les orbes). Elle garde la pièce sur ta trajectoire (magPorte) pour qu'elle ne passe pas derrière la caisse, et magSpirale ne fait que l'animation de l'aimant.
  - *preuve* : gameplay/boost-depart.js:152 ; pouvoirs-orbes.js:27 ; pouvoirs-grisants.js:35 ; ramassage.js:87, 105, 113-117 ; fruits-auras.js:240-272
- Fréquence des orbes de pouvoir : une tous les 860 à 1 620 m (environ 0,8/km), tirée au hasard sur la route (PWR_LIGNE est faux par défaut). Part de la pomme dorée : 0,30 avant 8 parties, 0,21 avant 30, puis 0,19. Le canyon n'a jamais de VITESSE ×2. VITESSE ×2 est plafonnée par vitMult à ×2,6.
  - *preuve* : pouvoirs-grisants.js:19-27, 532-548 ; fruits-nouveaux.js:244 ; portail-passage.js:70
- coinSerie (finir une série entière de pièces) ne donne que du flow (+2 + 0,4 n) et un texte, aucune pièce. Les séries sont les motifs du fil, toutes sauf « libre ».
  - *preuve* : gameplay/frenesie.js:68-74
- Densité de pièces : dens = min(0,24 ; 2,15 × 30 × rich^1,2 / 1000) par mètre, avec rich = clamp(0,88 + 0,52 × runStats.zones ; 0,88 ; 3,4). Selon le nombre de portails franchis, cela donne environ 55, 97, 141, 188 et 237 pièces/km, puis le plafond de 240/km dès 5 portails. Elle ne dépend PAS de la map : le seul générateur commun est filPlan, qui laisse un peu de place aux flaques, aux trous et aux pics.
  - *preuve* : gameplay/pouvoirs-grisants.js:489, 496-510 ; gameplay/pieces-fil.js:113
- runStats.zones augmente d'un à chaque portail franchi (une seule fois par portail) et n'est remis à 0 qu'en début de partie, pas par la seconde chance. Passer les portails vite rend donc la route plus riche plus tôt.
  - *preuve* : gameplay/portail-passage.js:90-92 ; zones-caisses.js:362,373
- Les motifs (serpent, vague, ADN, ruban, chevron, pixel, train, éclair, entonnoir, glissade, libre) sont posés sur un fil continu et restent conduisibles au rayon de braquage du moteur. Les motifs larges tiennent dans ±2,2 m (FIL_W), donc rouler droit dessus les ramasse tous. 18 % des motifs sont entièrement en pièces de 2, sinon 21 % des pièces. Un motif mesure au plus 120 à 160 m. L'espacement ne grandit que de ×1,13 au plus (kS).
  - *preuve* : gameplay/pieces-fil.js:12-15, 20, 34-44, 113, 144-149
- Chaque pièce existe sur les deux faces de la route, mais la boucle de ramassage ignore le jumeau : on n'encaisse qu'une seule face.
  - *preuve* : pouvoirs-grisants.js:462 ; ramassage.js:94-107, 119
- Depuis le 2026-11-15, aucune pièce n'est posée en l'air : les fils d'or de l'orbite et de Jade et les pièces des géants ne sont actifs qu'avec ?plus=piecesair. La boucle des fruits en vol tourne à vide. Les raccourcis n'ont donc aucune pièce à eux.
  - *preuve* : pouvoirs-grisants.js:512-526, 550-553
- En vol, une pièce de la route est accrochée seulement si elle est à moins de 70 m le long de la piste et à moins de 11 m en 3D (14 m avec l'aimant moteur, 50 m sous la pomme dorée). Un vol haut ou un raccourci fait donc manquer les pièces, sauf sous la pomme dorée.
  - *preuve* : ramassage.js:104-112
- Les billets (palier 13) sont des particules sans argent ni pièce (spawnBill). La comète (palier 28) n'est qu'un effet de flammes.
  - *preuve* : moteur/boucle-3-physique.js:129-136 ; rendu/billets-devises.js:27-32 ; boucle-6-hud.js:214-221
- Le compteur de pièces de l'étalon (fin.pieces) vaut coinsGot : il inclut les pièces des figures et baisse avec la seconde chance. yeux.js compte une pièce de 2 comme 2, ce qui est faux pour le moteur (+1).
  - *preuve* : moteur/enregistreur-jeu.js:49 ; ml/bot/mesures.js:34 ; ml/bot/yeux.js:60
- Ordre de grandeur de ce qu'on peut ramasser : à 8,7 km/min de croisière, environ 480 pièces/min dans la première zone (55/km) et environ 2 100/min au plafond de 240/km, avant même que le palier accélère la caisse. Le bot fait 391 pièces/min et les joueurs 416. La quantité posée ne les limite pas : ce sont la part ramassée et la survie.
  - *preuve* : calcul à partir de pieces-fil.js:113, pouvoirs-grisants.js:489, BOTS-ML.md:119-124

## Non verifie

- Je n'ai pas trouvé où se calcule la longueur L d'une zone, ni donc le nombre de km entre deux portails pour chaque map. Les notes de passation parlent d'environ 7 à 11 km (volcan, montagne), sans vérification dans le code.
- La croisière (2,75 à 3 × maxSp) et les pièces/min possibles sont des calculs faits à partir des formules, pas des mesures. Le simulateur n'a pas été lancé, comme demandé.
- Je n'ai pas lu le code des plaques turbo (PADCH, le train de boosts), des caisses et zones, ni de la ligne parfaite en détail : je n'ai vérifié que par grep qu'ils n'appellent jamais addCoins.
- Je n'ai pas tabulé la valeur aura/16 de chaque figure : les 2 à 18 pièces par figure et les « 4 à 10 typiques » sont des estimations.
- La « vitesse de départ » choisie au garage (#gVdep, citée dans les commentaires) n'a pas de code JS trouvé par grep : elle semble retirée, et resetGame remet le palier à 0. Je ne l'ai pas confirmé dans l'index.html assemblé.
- Je n'ai pas vérifié si d'autres maps (Jade, espace) ajoutent des pièces hors de spawnPickups lorsque ?plus=piecesair est absent (jade-alleluia.js:436 n'est appelé que via air9).
- Je n'ai pas mesuré la part de pièces que ramasse réellement le bot de référence dans chaque zone.
