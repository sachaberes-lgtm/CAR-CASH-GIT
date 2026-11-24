# vol

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

J'ai tout tiré de la lecture du code, sans lancer le simulateur.

**Décoller.** La caisse ne quitte la route que de quelques façons :
- en sortant par le bord, sans aucune impulsion ;
- par le saut nitro (double appui au sol quand la direction n'a pas de figure) : impulsion 21, 2,2 m de haut, 0,88 s de vol sur du plat, il coûte 20 % de la jauge ;
- par une figure sur la route, en tirant le manche vers le haut puis en appuyant à nouveau sur NITRO : impulsion d'au moins 6 ;
- par les tremplins du glacier et des dunes, et quelques cas de débogage.
Une crête ne fait jamais décoller.

**La chute.** C'est une parabole pure : gravité de 22,97 m/s² dans le monde, montée bornée à 33,6 m/s, vitesse à plat plafonnée à celle du décollage (seule la nitro la relève). En vol :
- la nitro retire 60 % de la gravité, pousse dans l'axe et donne un coup de +46 à l'allumage ;
- le manche fait tourner la trajectoire : 0,85 rad/s sans nitro, 1,7 rad/s avec ;
- le volant tourne la trajectoire jusqu'à 3,1 rad/s.
On meurt après 6 s réelles en l'air, 120 m sous le point le plus bas de la piste, ou contre le décor.

**La pose.** Elle est acceptée entre 1,2 m sous et 3 m au-dessus de la route, après 0,35 s de vol, dans la largeur. La note dépend de la vitesse vers la route (vN) : moins de 4,5 = PARFAIT, 10 ou plus = POSÉ LOURD. Elle est RATÉE si le cap fait plus de 55° avec l'axe de la route, ou si une figure est à plus de 52° de l'endroit.

**Un vol rapporte bien des PIÈCES, pas seulement de l'aura.** Chaque pose qui encaisse une chaîne en donne de 2 à 18. Se poser au centre (PILE AU CENTRE) suffit pour en encaisser une. En l'air, la caisse attrape aussi les pièces de la route à moins de 11 m, et celles du ciel à moins de 30 m.

**Le RACCOURCI ne donne ni argent ni pièce.** Il rapporte du flow, 0,3 de nitro et de l'aura.

## Pour le bot

- LA LOI DU SAUT SÛR (à suivre AVANT de décoller). Intégrer le vol comme le fait le jeu : pas de 1/30 s ; v.y −= 47,85 × gK × (0,4 si nitro tenue, 0,25 en bleu) × h ; p += v × 0,48 × h ; montée bornée à 70 ; pour la pose, chercher la dalle la plus proche, trous exclus. Le saut est sûr si quatre conditions tiennent : (a) la pose arrive avant (6 s − 1 s de marge), ou 4 s en orbite ; (b) la trajectoire perce la dalle à |lat| < ROAD_HALF − 3 m ; (c) le cap à la pose est à moins de 45° de l'axe (55° = ratée) ; (d) aucune carte à décor qui tue sur le chemin (canyon, grotte, ville, Jade). La formule fermée suffit pour un premier tri : t = (vy + √(vy² + 2·22,97·Δy)) / 22,97 en m/s du monde, portée = v_horizontale × t.
- CHOISIR SA SORTIE. Le BORD ne coûte rien (impulsion 0, la caisse garde vA et sa dérive) : c'est le geste des raccourcis, pris dans les épingles ou au-dessus d'une route en contrebas. Le saut nitro (impulsion 21, ≈ 0,9 s, 2,2 m) coûte 20 % de la jauge et ne rend que 0,3 × une pose normale. Le geste 'saut' des doigts du bot passe d'abord par la figure sur la route : avec une figure équipée vers l'avant, il décolle par frEnvol (impulsion ≥ 6, plus mou), et non par veqSaut. Pour un vrai saut nitro, il faut que la direction tenue soit vide.
- PILOTER LE VOL. Volant vers le gisement de l'anneau (le jeu tourne la VITESSE : rayon = v × 0,48 / lacetVol, ≈ 20 m à 170 km/h). Anneau trop loin devant (tTrajet > tChute) : cabrer (↓) et/ou tenir la nitro (plané à 0,4 g plus poussée). Anneau trop court ou caisse trop haute : piquer (↑). Le cabré ne crée jamais de vitesse à plat ; seule la nitro en ajoute. Garder la nitro COUPÉE quand c'est possible : un vol de 1,2 s ou plus sans réacteur rend +20 % de jauge à la pose. L'anneau ne voit qu'à 1,68 s. Au-delà, viser la route la plus proche (f.proche) et surveiller f.reste.
- RÉUSSIR LA POSE. Trois points : (1) l'axe, viser moins de 20 à 30° d'écart (la limite dure est 55°) ; (2) le centre, |lat| < 0,3 × ROAD_HALF (≈ 8 m sur une route de 56 m) donne +4 à la chaîne, donc au moins 2 PIÈCES dès que le vol dépasse 0,7 s ; (3) la douceur : |v·N| < 4,5 (anneau OR) donne PARFAIT, soit momentum +3 s, flow et ×1,5 sur les pièces, tandis que 10 ou plus (anneau ROUGE) coûte la moitié du momentum, une faute de flow et jusqu'à 30 % de vitesse. Pour viser l'or : se poser sur une DESCENTE, ou cabrer dans les 0,3 dernières secondes pour aplatir la trajectoire sur la pente de la route. Sur du plat, un saut nitro retombe vers vN ≈ 21, donc LOURD (déduit du code, à vérifier au banc).
- LES FIGURES SANS CHUTE. N'en lancer que si le budget (anneau.delai, ou la parabole) dépasse ≈ 0,8 s + la durée de la figure, et si la jauge dépasse 35 %. Si l'écart reste au-dessus de 20° à 0,4 s de la pose, un appui seul la redresse (après 430 ms) ; au-delà de 52° à la pose, c'est la CHUTE. Varier les figures dans un même vol : chainMult +0,5 par figure nouvelle contre +0,15 pour une redite, et le combo du vol va jusqu'à ×4. Trois figures différentes forment un TRIO (aura en plus). Chaque figure lancée et posée proprement rend +5 % net de nitro et grossit qG, donc les pièces : 2 + qG/6, jusqu'à 18 par pose.
- LES PIÈCES ET LE VOL (le cœur du matchmaking par palier). La route reste la source principale : 1 pièce par pièce. Un vol à plus de 11 m (14 m à partir du palier 15) au-dessus de la file de pièces la rate. Un raccourci saute aussi les pièces de la piste coupée, et ne rapporte ni pièce ni argent : seulement du flow, 0,3 de nitro et de l'aura. Ce que le vol rapporte en pièces passe par la pose (2 à 18), par les grappes du ciel (orbite, Jade, à 30 m) et par le flow (× (1 + 0,5 × niveau) sur les pièces de pose). Pour un pilote d'élite : de petits vols centrés et rasants au-dessus des files de pièces, posés PARFAIT avec 1 à 3 figures variées ; des raccourcis seulement s'ils font gagner du temps vers le portail ou si la route du dessous porte de l'or.
- SURVIVRE. Il faut toujours une sortie avant la limite de 6 s réelles. Si l'anneau n'est toujours pas en vue à 3,5–4 s de vol, piquer vers la route la plus proche. Si la caisse passe sous le niveau de la route, à côté d'elle, viser la TRANCHE pour un BUMP : il rend 3 s d'air et la renvoie ≈ 1,3 m plus haut. Au bord, dans la seconde qui suit la sortie, braquer vers la route accroche la lèvre (sauvetage gratuit). Ne jamais descendre à 120 m sous le point le plus bas de la piste. Pas de saut sous la dalle (le jeu le refuse) ni juste avant une crête des nuages.
- DES BOTS HUMAINS PAR NIVEAU (la demande de Sacha : des bots faibles pour les joueurs faibles, des bots forts pour les forts). Les mêmes leviers règlent le niveau de jeu :
- la fréquence des vols : de 3–4 par minute pour un débutant à 8 par minute pour un humain moyen (29 % du temps en l'air, soit ≈ 2,2 s par vol) ;
- la part des raccourcis : quasi nulle pour un faible, ≈ 1 vol sur 3 pour un humain (2,7 par minute) ;
- la précision de pose : taux de PARFAIT, d'axe et de centre — c'est là qu'un bot faible doit faire des POSÉS LOURDS et quelques poses ratées ;
- l'usage des figures et leur variété ;
- un taux d'erreur réaliste en vol (rares morts « air » ou « vide »).
Le réglage se règle sur ces taux, pas sur des réflexes surhumains : les limites de la main restent dans doigts.js.
- CE QUI MANQUE À LA VUE POUR VOLER COMME UN HUMAIN. Le filtre des tronçons (yeux.js) suppose un vol droit sans nitro : il faudrait y ajouter la vraie intégration du jeu (plané et poussée nitro, cabré) et l'impact prédit (|v·N|, la couleur de l'anneau), qui n'est pas exposé aujourd'hui. Il manque aussi ROAD_HALF × 0,3 pour la cible PILE AU CENTRE, et la hauteur au-dessus des files de pièces pendant un vol rasant.

## Les faits

- Gravité du vol : FALL_G = 33 × GRAV_K, avec GRAV_K = 1,45 par défaut (paramètre d'URL ?grav), soit 47,85 en unités du jeu. La position avance de fallVel × dt × SPD, avec SPD = 0,48. Dans le monde : g = 47,85 × 0,48 ≈ 22,97 m/s². gK() vaut 0,5 en orbite et DN.gx (plus de 1) sur un tremplin des dunes. Le commentaire du BUMP parle encore de « 15,8 m/s² » : c'est un chiffre périmé, d'avant GRAV_K = 1,45.
  - *preuve* : code/son/curseurs.js:308-309 ; code/gameplay/gravite-orbite.js:8,21 ; code/moteur/boucle-3-physique.js:299,390 ; code/gameplay/demi-tour.js:396
- Conversions : km/h affichés = v × 3,6 × SPD = v × 1,728 ; m/s dans le monde = v × 0,48. AIR_RATE = 1, donc le temps de vol est réel (fallT ≈ fallTR, sauf après un bump).
  - *preuve* : code/moteur/boucle-3-physique.js:289-290,392 ; code/gameplay/portail-passage.js:275
- Vitesse au décollage : fallVel = T·vA·cos(cap)·vitMult + B·vL·vitMult + N·impU. La montée est bornée à 70 (volPlafU), soit 33,6 m/s et au plus ≈ 24,6 m au-dessus du point de départ. Le vol part du point exact de la caisse (aucun bond).
  - *preuve* : code/gameplay/portail-passage.js:288-300
- Les façons de quitter la route :
- le bord : |lat| > ROAD_HALF, alors startFall(0,1,true), impulsion nulle, bascule ;
- le saut nitro veqSaut : impulsion VEQ_K.saut = 21, coût 0,2 × la jauge, attente 0,9 s, refusé sous la dalle et dans quelques cartes ;
- la figure sur la route, puis manche au-delà de 55 % et NOUVEL appui NITRO pendant le bond (frEnvol) : startFall(max(6, vitesse du bond)) ;
- les tremplins du glacier : impulsion entre 14 et 60, au-dessus de 70 km/h ;
- les crêtes des dunes (dnLevre) ;
- le plafond franchi au ralenti (F.n.y < −0,15 et vF < 7).
Aucun décollage automatique sur une crête ordinaire : en conduite, la caisse reste collée au ruban (frameAt).
  - *preuve* : code/moteur/boucle-2-conduite.js:148-155,185-191 ; code/gameplay/vol-equilibre.js:43-45,221-238 ; code/gameplay/figures-route.js:130-142 ; code/maps/dunes-2.js:267-274
- Le double appui au sol : s'il y a une figure dans la direction tenue, frLance la joue SUR LA ROUTE, sans vol. Sinon c'est le saut nitro (veqSaut). Le geste 'saut' des doigts du bot passe par la figure sur la route, puis ↓ et un nouvel appui NITRO : il décolle par frEnvol (impulsion d'au moins 6), pas par veqSaut (21), dès qu'une figure est équipée vers l'avant.
  - *preuve* : code/gameplay/vol-equilibre.js:173-176 ; code/gameplay/figures-route.js:32-38,134-142 ; ml/bot/doigts.js:106-111
- Saut nitro sur du plat (déduit de la formule, pas mesuré) : 21 / 47,85 = 0,44 s jusqu'au sommet, 0,88 s de vol, 21² / (2 × 47,85) × 0,48 ≈ 2,2 m de haut. Cela recoupe le commentaire du code (« 0,85 s sur du plat », 5,6 m au plus quand sautAllonge ajoute jusqu'à +19 si la route remonte).
  - *preuve* : code/gameplay/vol-equilibre.js:191-217
- Le volant en vol (lacet) : lacetVol(v) = 1,5 × (1,15 + min(0,9 ; v × 0,004)) rad/s, de 1,73 à 3,1 rad/s. Il fait tourner la VITESSE autour du haut de la caisse (banqLacet). Le braquage tenu depuis la route est verrouillé 0,35 s, sauf après un saut voulu (VEQ.l0 = 0). Aucune aide au recentrage : AIR_ASSIST = 0.
  - *preuve* : code/gameplay/vol-equilibre.js:38-39,59-66 ; code/moteur/boucle-3-physique.js:308-309 ; code/gameplay/camera.js:311
- Le manche (↑ pique, ↓ cabre, inversible par réglage) fait tourner fallVel autour de FLY_R, à (0,85 + 0,85 × nk) rad/s : 0,85 sans nitro, 1,7 avec. Il est lissé (τ ≈ 47 ms). Aucune butée : le looping est possible. La vitesse à plat ne dépasse jamais fallVH0, la vitesse au décollage : un cabré ne fabrique pas de vitesse.
  - *preuve* : code/moteur/boucle-3-physique.js:340-346,372-378,386-387
- Le réacteur en vol, quand la nitro est tenue :
- il fait PLANER : il reprend 60 % de la gravité, 75 % en réserve bleue, donc g × 0,4 (× 0,25 en bleu), lissé sur ≈ 80 ms ;
- il pousse en continu de 60 × push × dt (96 × NITRO_BLEU_K en bleu) et relève le plafond fallVH0 ;
- l'allumage en vol donne un COUP de +46 × push, au plus un toutes les 0,5 s, réarmé au relâché, et coûte 12 % de la jauge.
Un double appui rend le coup (FLC).
  - *preuve* : code/moteur/boucle-3-physique.js:315-332 ; code/gameplay/frole-contrats.js:144-149 ; code/gameplay/figures-physique.js:171
- L'anneau de pose (viseur) : 14 pas de 0,12 s, soit un horizon de 1,68 s. Il suit la même loi que la chute (plané et poussée nitro compris). Il cherche la dalle à moins de 34 m (ROAD_HALF + 6) d'un point d'axe sur 8, dans la largeur, entre −épaisseur−1 et +3 m. CAMV.eta = (pas + 1) × 0,12, ou 99 si rien n'est en vue. Sa couleur dépend de l'impact prédit |v·N| : or sous 4,5 (il pulse), rouge à 10 ou plus. Il ne promet jamais une pose dans un trou.
  - *preuve* : code/moteur/boucle-3-physique.js:530-569
- Les morts en vol :
- la jauge d'air : fallTR > airMax() = 6 s réelles (5 s en orbite) ; AIRTIME INFINI dure 14 s et s'use au quart au sol ; le RAISIN double la jauge ;
- le vide : y < trackMinY − 120 ;
- le décor : grotte, banquise, pics de Jade, canyon, dunes, sol de la ville vitrée, roches, tours, géants.
La cause « vide » s'affiche si MIR.t > 2,2 s.
  - *preuve* : code/moteur/boucle-3-physique.js:583-595 ; code/gameplay/fruits-auras.js:365-372 ; code/gameplay/gravite-orbite.js:7,14 ; code/maps/jade-3.js:371
- Quand la pose est acceptée (tryLand) :
- face du dessus si fallT > 0,35, hauteur entre −1,2 et 3 m, et vN < 4,5 (la caisse ne s'éloigne pas) ;
- le plan percé est rattrapé dès 0,1 s ;
- le point où la trajectoire perce la dalle doit avoir |lat| < ROAD_HALF (sinon on tombe : aucun recentrage) ;
- la LÈVRE : roues à moins de 45 cm sous le bitume au bord, la pose se fait au bord.
  - *preuve* : code/gameplay/demi-tour.js:374,419-451
- La note de pose porte sur impact = |vN| (unités du jeu, ramené à 60 i/s) :
- PARFAIT si moins de 4,5 (g = 1,5 ; momT = 3, ce qui relance la vitesse) ;
- POSÉ LOURD si 10 ou plus (g = 0,65 ; momT × 0,5 ; faute de flow) ;
- ordinaire sinon (g = 1).
Déduction non mesurée : à v = 150 (≈ 260 km/h), PARFAIT exige d'arriver à moins de asin(4,5/150) ≈ 1,7° du plan de la route, et c'est LOURD au-delà de ≈ 3,8°. Un saut nitro sur du plat retombe à vN ≈ 21, donc LOURD, sauf si on cabre ou si l'on vise une descente.
  - *preuve* : code/gameplay/demi-tour.js:460-462,524-541
- Perte de vitesse à la pose : landLoss = min(0,30 ; (fallT × gK − 0,8) × 0,15 + impact × 0,008), appliquée au contact en ≈ 0,2 s. Ralenti de 0,35 s si fallT > 2.
  - *preuve* : code/gameplay/demi-tour.js:472-478,491,585
- Pose RATÉE dans deux cas :
- l'angle à plat entre la trajectoire et l'axe de la route dépasse FLOW2.pose.angle = 55° (dès que la vitesse à plat dépasse 4) ;
- une figure tourne encore (VEQ.rate).
Alors g = 0,65, pas de PARFAIT, le flow (frénésie comprise) tombe à zéro, et le demi-tour s'arme au-delà de 90°.
  - *preuve* : code/gameplay/demi-tour.js:468-470,598 ; code/gameplay/sensations-flow.js:299
- Les figures à la pose (FIG.Corps.pose) :
- une figure est payée si l'écart à l'endroit est sous PHY.ok = 0,35 rad (≈ 20°), si au moins 75 % de ses tours sont faits, et si la rotation est sous 9 rad/s ;
- c'est une CHUTE si l'écart dépasse 0,9 rad (≈ 52°) ou si la rotation atteint 9 rad/s (sauf les figures automatiques « douce ») : la chaîne perd l'aura des figures du vol (figChute).
  - *preuve* : VERSION PRINCIPALE/figures.js:126,314-322 ; code/gameplay/vol-equilibre.js:120-121 ; code/gameplay/figures-physique.js:245
- Le double appui : un 1er appui de moins de 300 ms, puis un 2e moins de 420 ms après le début du 1er. Un appui seul pendant une figure la redresse, après 430 ms. Le joystick au moment du double appui choisit l'emplacement : avant / au repos = 0, arrière = 1, côté = 2 (au clavier : ↑, ↓, ← →).
  - *preuve* : code/gameplay/vol-equilibre.js:162-172 ; code/gameplay/figures-physique.js:270-274
- Le budget d'une figure en vol : sa durée vaut min(f.D × 1,35 ; (budget − 0,35) × 0,72), et elle ne part que si cette durée atteint au moins max(0,32 ; f.D × 0,5). Il faut donc au moins ≈ 0,79 s avant la pose. Le budget est CAMV.eta, ou à défaut la parabole t = (vn + √(vn² + 2·g·h)) / g (g × 0,4 avec nitro), ou 9 s si aucune route n'est en vue. Au plus 3 figures à la fois, et jusqu'à 4 tours empilés.
  - *preuve* : code/gameplay/figures-physique.js:26,109-120,157-166 ; code/gameplay/figures-physique.js:261
- Le prix d'une figure : 35 % de la jauge au lancement (NITRO2.figN.cout). Chaque figure LANCÉE rend 40 % à une pose réussie (l'excédent passe dans la réserve bleue, plafond 2), soit +5 % net, et rien si la pose est ratée. Les figures du saut nitro et de la toupie de drift sont gratuites. Le saut nitro coûte 20 %, et sa pose ne rend que 0,3 × la nitro d'une pose normale.
  - *preuve* : code/gameplay/frole-contrats.js:151 ; code/gameplay/figures-physique.js:156,172,189-195 ; code/gameplay/vol-equilibre.js:153,229-231
- Nitro rendue à la pose : 0,2 × la jauge × min(1 ; vol / 1,2 s) × la part du vol faite nitro COUPÉE. Un vol de 1,2 s ou plus sans réacteur rend donc +20 %.
  - *preuve* : code/gameplay/frole-contrats.js:149,156-158 ; code/gameplay/demi-tour.js:459
- La chaîne (paiement) :
- addTrick ajoute val × 0,6^(redites) à chainVal et augmente chainMult de 0,5 (+0,15 pour une redite) ;
- une figure physique compte val = aura / 16, une vrille 3,5 × le nombre de demi-tours de LACET (yawAcc, après 0,45 s), un BUMP 5 × 0,6^(n−1) ;
- BIG AIR (1,8 s) et AIR MONSTRE (3,4 s) ne donnent que de l'aura (50 et 110) et du flow : ils ne touchent pas chainVal.
La chaîne d'aura (CHA) est à part : ×10 au plus, 3,5 s au sol, gelée en vol.
  - *preuve* : code/interface/jus-echelle.js:286-316 ; code/moteur/boucle-3-physique.js:396-400 ; code/gameplay/camera.js:431 ; code/gameplay/aura-chaine.js:27,76-94
- LES PIÈCES À LA POSE. Dans le verdict (fallT > 0,7 ou chaîne en cours) :
- poser à |lat| < 0,3 × ROAD_HALF ajoute chainVal += 4 et chainMult += 0,2 (PILE AU CENTRE) ;
- puis qG = chainVal × min(6, chainMult) × g × (2 si posé dessous) × (1 + FLOW.lv × 0,5) × bonus de série × (2 en BRAQUAGE) ;
- si qG × DENOMS[palier] ≥ 0,5 (DENOMS vaut au moins 3), on gagne addCoins(clamp(round(2 + qG/6) ; 2 ; 18)) PIÈCES DU MOTEUR, celles qui font monter le palier.
Un vol de plus de 0,7 s posé au centre rapporte donc au moins 2 pièces. Une bonne chaîne en rapporte jusqu'à 18. Une figure de route retombée fait la même chose (frEncaisse).
  - *preuve* : code/gameplay/demi-tour.js:524,542-574 ; code/gameplay/figures-route.js:63-64 ; code/economie/achat-carte-moteur.js:236-239 ; code/voitures/cars.js:290
- Aucun argent ($) à la pose : depuis le 29/09, les figures ne paient qu'en aura, en flow, en nitro et en pièces du moteur. L'argent vient des pièces, du portail et de la campagne.
  - *preuve* : code/gameplay/demi-tour.js:551-554
- Ramassage EN VOL :
- une pièce de la route est accrochée si le trajet de l'image passe à moins de 11 m en 3D (14 m à partir du palier 15, ENG_CAP.aimant), sur la face survolée ; elle file ensuite jusqu'à la caisse ;
- les grappes du ciel (p.air : fils d'or de l'orbite, Jade alléluia, pièces des géants) se prennent à 30 m, et seulement en vol ;
- sous le pouvoir AIMANT, la sphère vaut MAG_R (≈ 50 m d'après le commentaire).
Chaque pièce vaut addCoins(1), en vol comme au sol. Un vol à plus de 11 m au-dessus de la route ne prend donc RIEN de la file du dessous.
  - *preuve* : code/gameplay/ramassage.js:87-112,122,129-136,174 ; code/gameplay/pickups-fruits.js:592 ; code/gameplay/pouvoirs-grisants.js:558-596
- Le RACCOURCI, mesuré à la pose : gagne = (s_pose − s_décollage) − la distance 3D en ligne droite. Il compte à partir de 60 m, sauf si la caisse se pose dans le filet du même virage (c'est alors RATTRAPÉ : 50 d'aura et 6 de flow). Entre 25 et 60 m, seul le trait MACHIAVEL est nourri. Le raccourci rapporte :
- du flow min(45 ; 12 + 0,06 × gain), famille risque / Machiavel ;
- 0,3 de nitro ;
- de l'aura min(250 ; 60 + 0,2 × gain) ;
- le départ de la frénésie armée en ville (decl.racc).
Ni argent, ni pièce. Le parc n'en a pas.
  - *preuve* : code/gameplay/demi-tour.js:587-590,599 ; code/gameplay/zones-caisses.js:326-335 ; code/gameplay/sensations-flow.js:306,314
- Le BUMP : quand la caisse cogne la tranche de la dalle (roues au niveau de la dalle ou dessous, vitesse vers l'intérieur au-delà de 3), elle rebondit à 1,65 × sa vitesse latérale puis ×0,78, et repart vers le haut à une vitesse verticale d'au moins BUMP_VY = 16 (≈ 1,3 m de montée avec la gravité ×1,45). Il rend une DEMI-JAUGE d'air (3 s), entre dans la chaîne, et rend 0,35 de nitro, puis ×0,6 par rebond (rien au-delà du 4e, ni nitro allumée). Une sortie par le bord reste rattrapable : braquer vers la route pendant la bascule (jusqu'à 1 s) accroche la lèvre (levreRattrape).
  - *preuve* : code/gameplay/demi-tour.js:344-418,356-364 ; code/gameplay/camera.js:430 ; code/gameplay/frole-contrats.js:152
- MIRACULÉ : si la caisse a été « perdue » au moins 0,6 s (aucun anneau, en chute, plus de 10 m sous la route proche) et qu'elle se pose quand même, elle reçoit 160 d'aura (240 au-delà de 1,5 s) et 10 de flow. SANS FAUTE : les poses propres d'affilée (vols de plus de 0,7 s) paient à ×3, ×5, ×8, ×12, avec +0,12 de nitro.
  - *preuve* : code/gameplay/pouvoirs-grisants.js:68-96
- Les yeux du bot donnent déjà, en vol, l'anneau (delai, dist, dessous, gisement), la route la plus proche (lat, haut, versRoute, axe), le temps qui reste et la figure en cours. Au sol, ils listent les tronçons de raccourci. Ce filtre est approché : vol horizontal en ligne droite, chute balistique sans nitro, et conditions tChute < reste − 0,3, 0,55 × tChute < tTrajet < 1,6 × tChute, |gisement| < 0,9 rad, axe < 0,95 rad.
  - *preuve* : ml/bot/yeux.js:16-32,65-83
- Le bot de référence ne quitte jamais la route exprès : aucun raccourci, et des sauts seulement dans les droites plates.
  - *preuve* : ml/bot/reference.js:6,38-48

## Non verifie

- Rien n'a été exécuté : tous les chiffres dérivés (saut nitro de 0,88 s et 2,2 m, rayon de virage en vol, saut nitro sur du plat noté POSÉ LOURD à vN ≈ 21, angles PARFAIT et LOURD selon la vitesse) sont déduits des formules, pas mesurés au banc.
- La valeur exacte de ROAD_HALF selon la zone (ROAD_HALF0 × LARGEUR[zone]) : 28 m n'apparaît que comme valeur de repli dans plusieurs fichiers (canyon-route.js:762, portails.js:148, grottes-1.js:330).
- La hauteur des pièces de la route au-dessus du bitume, donc la hauteur de vol exacte qui garde le ramassage.
- Les valeurs de ENGINE_TIERS[...].push et .res (poussée nitro et taille de jauge par palier), MAG_R, NITRO_BLEU_K, ECO3.flow : non lues.
- Le décollage sur les crêtes des dunes (dnLevre) et DN.gx, lus seulement en survol.
- L'effet net du raccourci sur les pièces par minute : il fait arriver plus tôt au portail et à une nouvelle zone, mais saute les files de pièces coupées. Le solde n'est pas mesuré.
- La correction PG-01 de l'impact à 30 i/s ne s'applique qu'à la cadence < 60 i/s. Sans effet sur ml/reel si celui-ci tourne à 60 i/s, ce que je n'ai pas vérifié.
- La loi de pose proposée (cabrer dans les 0,3 dernières secondes pour passer sous 4,5) n'est pas testée ; il faudra la valider au banc.
