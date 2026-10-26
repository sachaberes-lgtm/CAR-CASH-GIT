## LA GRANDE SÉANCE DE DÉBOGAGE DES MAPS — 25 CORRECTIONS SUR 11 MAPS (2026-10-22, v786, Sacha, session DEBUGGING : « lance une immense session de debugging surtout centré sur les map, lance autant de sous-agents que tu veux, qu'il n'y ait aucun bug »)
Deux vagues d'agents (18-19/10 : un par map + portails, mort/reprise, météos ; 22/10 : grottes, dunes, décor au hasard + nuages en cubes,
transitions), chacun sur sa copie, au banc CDP sous le verrou commun ; les correctifs de la 1re vague (scratchpad effacé au redémarrage du Mac)
ont été repêchés dans les transcriptions et reportés sur le code découpé. Chaque correction : prouvée au banc avant/après, puis les 11 maps
(+ tel, debout, cadre) et une chaîne par le vrai portail, chauffe du menu attendue : 0 erreur, 0 programme compilé en course.
- **LA VILLE** (`villeForme`, `villeSFj`, `villeSS`, `CITY.col.f`, `villeHeurt`) : les géantes de verre étaient dures selon leur BOÎTE — mort en vol
  contre l'air jusqu'à 31 m à côté du verre (100 % des tours effilées/rondes/lames), le fuseau traversable. Dures selon leur forme visible
  (mêmes anneaux que `vitreGeoFab`, biseau, toit de lame) ; béton et Crypto City inchangés. Et dans `batir`, `yV` suit le VRAI toit des tours de
  béton (un retrait sauté par le `break`) : couronnes au néon, mâts et feux d'antenne ne flottent plus 95-256 m au-dessus (7-26 par ville → 0).
- **LE VOLCAN** (le rabot du sol, `EV`/`EVon`) : sur la spirale de `vlcTrace3`, la dalle la plus basse à 120 m prenait le tour d'EN DESSOUS —
  falaises de 110-250 m sous la moitié de la route et un lac de cratère qui FLOTTAIT en couvercle sur des rideaux de lave. Chaque route garde son
  couloir ; le lac ne monte plus au-dessus de la lèvre rabotée. `dbgVolcan('test')` : 0/0 avant et après (photos même `pistegraine`).
- **LA FORÊT** (`buildForetG`) : le fût d'un géant devenu saule/hêtre PLEUREUR mordait la route (32 géants sur 15 graines, jusqu'à 4 m) — testé
  contre la chaussée (l'autre pleureur, sinon la clairière vide ; tirages inchangés). `FORET.yRaz` enfin posé (la brume du fond glissait 2 s).
- **LE CANYON** (`cyCouloirHeurt`) : la bande des Étroits et du tunnel est bornée en long — plus de mort « encastré dans la paroi » contre rien,
  jusqu'à 85 m avant la bouche du tunnel et après la sortie des Étroits.
- **LES NUAGES** : `mkCloud` reteste la garde du ruban avec la VRAIE hauteur des nuages v8 (une tour sur ~450 laissait passer la route dedans).
  La PEAU d'un nuage seul (v773, `nuSkinGeo`, `mesh.userData.peau`) est libérée par `disposeClouds` : 43 créées / 0 libérées → 38 / 38.
  L'ORAGE des nuages (niveau d'id `'orage'`) entre dans `contiMap` et `routeSig` : bitume commun, ciel continu, ligne centrale OR — ⚠ le rendu
  de l'orage change un peu (route plus neutre, ciel plus saturé) : à juger à l'œil, deux entrées à retirer si non.
- **CRYPTO CITY** (`cryptoTick`) : les gerbes d'un NOUVEL ATH tiré juste avant le portail (setTimeout jusqu'à 1 s) restaient allumées toute la map suivante.
- **LE GLACIER** : un `//` en milieu de ligne avalait le frein du voile de givre (`fx.brume.drag`) et son nom. La section 4 bis de `buildBanqG`
  (tremplins, massif, fourche, champ, porte, îlot) prend son PROPRE flux (`seed^0xB0B57AC`) : le décor au hasard rebattait les pics de la piste
  (16 contre 14 avec/sans décor, même graine) — la disposition des pics change donc par rapport à v785, toujours au hasard.
- **LES DUNES** (`dnRelance`, dans `chanceRepart` et `chanceProtege`) : la SECONDE CHANCE reposait la caisse au pas 8 m avant la lèvre ratée →
  ensevelie 6-7 s plus tard, 3 cas sur 3 (la pub regardée pour rien). Sur une map à trous, la caisse replacée repart à la croisière du palier.
- **LES PROFONDEURS** : (1) mort en vol dans l'AIR autour des stalactites et stalagmites — leur boîte de collision (0,8 × le rayon de la base + 1 m,
  au-delà de la pointe) : `grtPrisme` accroche son cône à la boîte (`grtCol` la rend), `grotteHeurt` teste `grtDansCone` (graine 1111 : 806 → 33
  au-delà de la pointe). (2) `grtBouche` : un trou NOIR dans la paroi d'un puits (tronçon voisin jamais alloué) refermé, collision inchangée.
  (3) la chute dans un lac lue « roche » (cases de 12 m) : `grtIci` une demi-case plus bas.
- **Vérifié sain** : l'orbite (aucune pluie/orage/nuage, planètes repeintes, satellites hors route), le jade (56 vallées : aucun virage sous le
  rayon tenable), les météos (aucune fuite d'une map à l'autre, `dbgEtat` ~300 valeurs), le tirage et les 69 cartes postales, le pré-bâti
  (identique au bâti d'un trait : dunes, grottes), 3 parties de suite, la pause au portail, la mémoire sur 14 portails (géométries 585 → 725, stables).
- **Faux positif levé** : « un programme compilé en course » au 1er palier venait du BANC qui touchait JOUER avant la fin de la chauffe du menu
  (~10 s) — après la chauffe : 0 sur toutes les maps.
- **Écarté, non prouvé** : le renvoi du coup d'épaule contre le bourrelet du glacier sur la TRAJECTOIRE (`PARIS.psiR = BKV.gl−(psi−BKV.gl)×0,3`).
- **À TRANCHER (Sacha / Léo)** : en ORBITE, la mort en l'air au-dessus de SA route (5 s d'airtime, gravité ½, plongée de 27°) ; la durée de
  l'orbite (8,3-8,8 km pour 45 s) ; les singes du `?play=jade` qui ne reviennent pas au 2e tour (`JSG.cle`) ; dans la ville, `cameraPosition`
  vaut 0 dans les Lambert (la profondeur de la pluie et les reflets GTA comptés depuis l'origine — changerait l'aspect de la pluie) ; l'entonnoir
  du puits des grottes élargi à sa vraie forme ; la caisse replacée dans les dunes décolle aussitôt (la replacer au début du segment ?).
- Bancs (locaux, non suivis) : `debug-maps/.banc-debug/` (banc.mjs sous `verrou-banc.sh`, scénarios JSON, `--attente` = chauffe du menu finie).
