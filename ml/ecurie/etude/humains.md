# humains

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

J'ai mesuré les 14 parties de l'étalon : 10 au clavier (attribuées à Sacha) et 4 au doigt (Léo), soit 41,3 min de jeu. Je les ai chargées comme etalon.js (dédoublonnage, pause, seconde chance recollée), avec un script jetable qui n'écrit rien dans le dépôt.
- Paliers atteints, tous joueurs : 1 1 4 5 5 8 11 12 14 15 16 21 22 28 (médiane 11,5).
- Sacha : 1 4 5 5 8 12 14 15 22 28 (médiane 10). Léo : 1 11 16 21.
- Le palier dépend surtout du temps de survie. Une fois lancée, une partie ramasse 400 à 590 pièces/min (416 sur l'ensemble), donc palier ≈ survie × ~420 pièces/min.
- Ordres de grandeur : palier 5 vers 40-95 s, palier 10 vers 114-172 s, palier 15 vers 181-248 s, palier 20 vers 247-349 s, palier 25 vers 408 s.
- Les deux parties les plus hautes (28 et 22) ont toutes les deux utilisé la seconde chance. Elle retire un palier au moteur (seconde-chance.js:188).
- Le profil humain est très reconnaissable :
  - slalom permanent sur toute la largeur de la route (écart latéral σ ≈ 10,7 m pour une demi-route de 28 m ; 1,2 à 1,8 changements de sens par seconde ; amplitude médiane 9 à 17 m) ;
  - volant en tout-ou-rien, par petits coups de 0,1 à 0,4 s, environ 110 par minute au sol, espacés de 0,56 s en médiane, avec un intervalle irrégulier (CV 0,66) ;
  - nitro tenue environ 60 % du temps, mais par tapotements (tenue médiane 0,35 à 0,4 s ; 90 % des tenues font moins de ~3 s) ;
  - beaucoup de vols (~8/min, 2,1 s en médiane, 38 m de haut chez Sacha), presque tous en sortant par le bord, et 85 % sans figure.
- Le bot de référence s'en écarte nettement : nitro 17,6 %, en l'air 9,6 %, 3,7 vols/min. Le juge déjà dans le dépôt les sépare avec une AUC de 0,97.
- 14 parties de 2 joueurs ne disent rien des joueurs faibles ou débutants, ni de la variabilité entre joueurs. Elles ne couvrent pas non plus les paliers 2-3, 6-7, 9-10, 13, 17-20, 23-27, 29-30.

## Pour le bot

- Comment régler le niveau d'un bot : le palier se règle surtout par l'instant de la mort. Les humains ramassent environ 400-480 pièces/min, de façon assez constante, quel que soit leur niveau. Un bot « palier N » doit donc garder ce rythme humain (220 la 1re minute, puis 400-600) et mourir vers la durée correspondante : P5 vers 1 min, P10 vers 2-3 min, P15 vers 3-4 min, P20 vers 4-6 min, P28 vers 8-9 min. Un bot qui ramasserait deux fois plus vite pour mourir tôt aurait un rythme qui le trahirait.
- Bas de l'échelle (P1-P5) : les humains meurent vite, sur pic, air ou vide, souvent dans la 1re ou 2e route, avec un slalom moins ample (σ lat 6-9,6 m, dlat 5-24 m/s). Haut de l'échelle (P20+) : longues parties qui traversent 5 à 9 maps, et les deux seules parties P22 et P28 ont pris une seconde chance (perte d'un palier). Un bot d'élite crédible devrait parfois mourir puis reprendre.
- Ce que le bot doit reproduire sur la trace, du plus visible au moins visible :
- nitro tenue environ 60 % du temps, par tapotements de 0,1 à 0,5 s avec quelques longues tenues (jusqu'à 25 s), et une part qui baisse vers 35-50 % en fin de partie ;
- beaucoup de temps en l'air (25-40 %, puis jusqu'à 60 % quand ça va vite) : ~8 vols/min, presque tous en sortant par le bord, ~2 s chacun, 30-50 m de haut et parfois plus de 150 m ;
- un slalom permanent sur toute la largeur (σ lat ≈ 10 m, p5/p95 ≈ ±18 m), avec 1,2-1,8 changements de sens par seconde et une ondulation qui grandit avec la vitesse.
- Les gestes, côté doigts.js : volant tout-ou-rien, par coups de 0,1-0,4 s (médiane 0,2 s) et une centaine d'appuis par minute au sol. L'espacement est irrégulier : médiane 0,56 s, p10 0,32 s, p90 1,3 s, CV ~0,65. Un geste à intervalle fixe ou au volant proportionnel lisse se verrait tout de suite.
- Les figures restent rares : 85 % des vols sans figure, et quand il y en a, souvent 2 ou 3 enchaînées dans le même vol. Pour imiter Léo (doigt), il faut en plus du drift (12-18 % du temps au sol), des vols plus courts et bas (~1,3 s, ~7 m) et presque zéro figure. Il y a donc au moins deux styles humains, pas un seul.
- Ce qui ne sert pas à distinguer : pièces par seconde, figures par minute, vitMult. Le juge existant tient déjà compte des signatures à fort pouvoir (nitro, accélération latérale, ondulation, temps en l'air, durée et hauteur des vols). Ce sont elles que le bot doit viser en premier.

## Les faits

- Le palier vient de coinsGot, compté PENDANT la course : 1 par pièce ramassée, plus une poignée par figure réussie (addCoins). engineFor prend le dernier seuil franchi. L'enregistreur note fin.pieces = coinsGot, donc palierDe(fin.pieces) est exactement le palier du jeu.
  - *preuve* : code/economie/achat-carte-moteur.js:231-241 ; code/moteur/enregistreur-jeu.js:49,82 ; ml/bot/mesures.js:12-15
- Seuils de ENGINE_TIERS (30 entrées) : 0,40,85,150,225,305,400,505,615,730,860,995,1130,1280,1430,1585,1745,1910,2080,2255,2440,2630,2825,3030,3240,3455,3680,3910,4145,4385.
  - *preuve* : code/gameplay/pickups-fruits.js:557-588
- La seconde chance retire 1 palier et remet coinsGot au seuil du palier inférieur. Partie du 23/11 19:33 : 4044 pièces (palier 28) avant la mort, reprise à 3680, fin à 3923 (toujours palier 28 ; 4287 pièces vraiment ramassées). Partie du 24/11 12:06 : 1385 (palier 14), reprise à 1130, fin à 2677 (palier 22 ; 2932 pièces ramassées).
  - *preuve* : code/gameplay/seconde-chance.js:91 (moteurPerte:1), :188 ; mesure sur les morceaux bruts de ml/bot/etalon/cashcar-parties-2026-11-23-1950.json et -2026-11-24-1213.json
- Parties de Sacha (clavier), au format date · durée · pièces · palier · pièces/min · fin · maps :
- 23/11 19:29 · 195,6 s · 1529 · P15 · 469 · glace · grotte>nuages>jade>espace>grotte
- 19:32 · 65,4 s · 275 · P5 · 252 · pic · nuages>jade
- 19:33 · 548,8 s (1 seconde chance) · 3923 · P28 · 429 · paroi · canyon>grotte>ville>nuages>espace>grotte>jade>ville>nuages>e…
- 19:43 · 67,1 s · 289 · P5 · 259 · pic · ville>jade
- 19:44 · 172,3 s · 1390 · P14 · 484 · paroi · nuages>espace>ville>jade>canyon
- 20:15 · 154,8 s · 612 · P8 · 237 · air · grotte>espace>nuages
- 20:18 · 53,7 s · 198 · P4 · 221 · pic · jade
- 20:19 · 158,8 s · 1086 · P12 · 410 · roche · ville>espace>nuages>grotte
- 24/11 12:05 · 13,6 s · 14 · P1 · 62 · air · ville
- 24/11 12:06 · 400 s (1 seconde chance) · 2677 · P22 · 402 · tour · espace>nuages>grotte>canyon>ville>nuages>espace>jade>ville
  - *preuve* : scratchpad/humains/analyse.js (sortie console), chargement copié de ml/bot/etalon.js:29-58
- Parties de Léo (doigt), même format :
- 24/11 10:46 · 131,4 s · 920 · P11 · 420 · roche · espace>ville>grotte
- 10:48 · 239 s · 1671 · P16 · 420 · roche · nuages>espace>ville>jade>grotte
- 11:00 · 15,6 s · 17 · P1 · 66 · vide · nuages
- 11:00 · 263,4 s · 2597 · P21 · 592 · air · espace>jade>grotte>nuages>espace

Une partie d'auto-école et une partie quittée après 3,6 s (pause) sont écartées. Ensemble : 41,3 min ; fins : pic 3, roche 3, air 3, paroi 2, glace 1, vide 1, tour 1.
  - *preuve* : scratchpad/humains/analyse.js ; ml/bot/results/etalon.json (barre déjà écrite, mêmes chiffres : pieces_min 416,2, palier_median 11,5)
- Distribution des paliers atteints :
- tous : 1,1,4,5,5,8,11,12,14,15,16,21,22,28 (médiane 11,5) ;
- Sacha : 1,4,5,5,8,12,14,15,22,28 (médiane 10) ;
- Léo : 1,11,16,21 (médiane 13,5).
Aucune partie aux paliers 2-3, 6-7, 9-10, 13, 17-20, 23-27, 29-30.
  - *preuve* : scratchpad/humains/analyse.js
- Instant où chaque palier est franchi (s) :
- P5 : 39 à 95 ;
- P10 : 114 à 172 ;
- P15 : 181 à 248 ;
- P20 : 247 (Léo) à 349 ;
- P25 : 408 (une seule partie).
Le rythme de pièces augmente au fil de la partie : Sacha ~220/min la 1re minute, ~390 la 2e, 450-630 de la 3e à la 6e. Léo : 330, 400, 515, 686.
  - *preuve* : scratchpad/humains/analyse.js (t_pal*) et fenetres.js (fenêtres de 60 s)
- Écart latéral au sol (lat, demi-route ROAD_HALF = 28 m sur toutes les routes jouées) :
- tous : p5 -18,5, p25 -5,9, médiane 0,1, p75 7,2, p95 19,2, σ 10,7 m ;
- Léo penche à droite : médiane +1,6, p75 10,6.
Le pic de 8,5 % dans [0,1) m est probablement les départs et poses à lat = 0 (non vérifié).
  - *preuve* : scratchpad/humains/analyse.js ; rh = 28 relu dans routes[].rh
- Ondulation : écart-type de dlat/dt au sol ≈ 30 m/s (Sacha 31,6, Léo 26,4) ; |dlat/dt| médian 13 m/s, p90 47, p99 103. Elle grandit avec la vitesse : σ 17-18 m/s la 1re minute, 34-38 à la 3e, 50-55 aux minutes 6-8. 1,2 à 1,8 changements de sens par seconde, amplitude médiane 9 à 17 m, demi-période médiane 0,65 à 0,95 s.
  - *preuve* : scratchpad/humains/fenetres.js
- Volant. Au clavier, la cible vaut -1, 0 ou +1 et steer est cette cible lissée. Au doigt, Léo utilise lui aussi un volant presque tout-ou-rien : st (le stick) vaut surtout 0 ou ±1, comme avec les flèches tactiles ou le pad. Valeurs de steer : 0 dans 49 % des échantillons, ±1 dans ~13 %, le reste en transition.
  - *preuve* : code/moteur/boucle-1.js:241-247 ; données brutes, partie 9 (Léo) et partie 2 (Sacha)
- Appuis de volant (|steer| > 0,3 au sol) :
- Sacha : 111/min, durée p10 0,1 s, p50 0,2 s, p90 0,4 s, max 1,5 s ;
- Léo : 98/min, p50 0,2 s, max 0,9 s.
Délai entre deux débuts d'appui : p10 0,32 s, p50 0,56 s, p90 1,3 s, coefficient de variation 0,66 (Léo 0,58).
  - *preuve* : scratchpad/humains/analyse.js
- Nitro :
- Sacha 52-73 % du temps selon la partie, Léo 59-71 %, ensemble 60,1 % ;
- 18 à 44 appuis par minute, tenue p10 0,1 s, p50 0,35-0,4 s, p90 2,7-3,8 s, max 25 s ;
- la part baisse au fil de la partie : 72-78 % la 1re minute, 34-50 % après 5 min.
  - *preuve* : scratchpad/humains/analyse.js, fenetres.js
- Vitesse au sol : ~400 km/h la première minute pour les deux joueurs. Sacha : 518 km/h à la 2e minute, 622 à la 3e, 866 à la 5e, 1211-1517 aux minutes 7-8 (pointe 3624 km/h dans la partie P28). Léo : 404, 479, 550, 614. vitMult reste à 1 (pointes à 1,1-1,16).
  - *preuve* : scratchpad/humains/fenetres.js
- Vols :
- Sacha : 6 à 11 vols/min, durée p10 0,47 s, p50 2,27 s, p90 3,9 s, max 9,7 s ; hauteur max médiane 38 m, p90 147 m, max 547 m ; temps en l'air 22-41 %, qui monte de 19 % (minute 1) à 60 % (minutes 6-8) ;
- Léo : vols plus courts et plus bas (p50 1,33 s, hauteur médiane 7 m), avec du drift 12-18 % au sol (Sacha ~0 %) ;
- origine du décollage : presque toujours le bord (bord 308, saut 19, trou 0).
  - *preuve* : scratchpad/humains/analyse.js
- Figures par vol : 0 figure dans 265 vols sur 312 (85 %), 1 dans 22, 2 dans 16, 3 à 5 dans 9. Moyenne 0,33 chez Sacha, 0,07 chez Léo. Délai entre deux figures lancées : p50 1,2 s (enchaînées dans le même vol), p90 ~37 s.
  - *preuve* : scratchpad/humains/analyse.js
- Le bot de référence, d'après sa note existante (20 courses, coupées à 300 s), est loin des humains :
- nitro 17,6 % contre 60,1 % ;
- en l'air 9,6 % contre 28,7 % ;
- vols 3,67/min contre 7,91 ;
- vol moyen 1,57 s contre 2,18 s.
Le juge déjà écrit (11 parties clavier contre 4 courses du bot, fenêtres de 10 s) donne une AUC de 0,971. Ses meilleures mesures : nitro (AUC 0,955), accélération latérale (0,848), ondulation (0,787), part en l'air (0,784), vol moyen (0,76), hauteur (0,749). Pièces/s (0,489) et figures (0,456) ne départagent pas.
  - *preuve* : ml/bot/results/note-reference.json ; ml/bot/results/discerner-reference-4-courses.json

## Non verifie

- L'identité des joueurs n'est pas prouvée. Les parties 24/11 12:05 et 12:06 (version ccdca9b, fenêtre portrait 782x844, au clavier) sont attribuées à Sacha seulement parce qu'elles sont au clavier. Toutes les parties portent ecran.tel = true (ALLEGE), y compris celles de Sacha sur PC. Léo a joué dans le navigateur du téléphone, pas dans l'app.
- La durée des appuis est déduite de steer lissé échantillonné à 10 Hz, pas des vraies touches. Les durées sont arrondies à 0,1 s et un coup plus court que 100 ms peut passer inaperçu. Pour Léo, je n'ai pas vérifié dans le code quel mode de contrôle il utilise (pad ou flèches tactiles, volant, inclinaison) ; st ±1 le laisse seulement penser.
- Le pic de 8,5 % à lat ∈ [0,1) m est probablement un artefact (départs et poses à lat = 0) ; je ne l'ai pas vérifié.
- Ce que 14 parties de 2 joueurs ne permettent pas de conclure :
- Les deux joueurs sont bons : aucun vrai débutant. Les P1 sont des morts en 15 s, pas des joueurs faibles, et on ne sait rien du style d'un joueur qui plafonne aux paliers 3 à 8.
- La variabilité entre joueurs est inconnue : 2 styles ont été vus (clavier et doigt), mais pas tous les humains.
- Paliers 2-3, 6-7, 9-10, 13, 17-20 et 23-30 : aucune partie, et une seule au-delà de 22.
- Le haut de l'échelle (P25-P30) repose sur une seule partie, qui a pris une seconde chance.
- L'effet de la voiture n'est pas mesurable : toutes les parties ont été jouées avec « LA HONTE ».
- Les versions du jeu diffèrent : 60aa15e et ccdca9b.
- Il y a 4 parties au doigt, et les chiffres par minute au-delà de 4-5 min viennent de 1 ou 2 parties.
- Je n'ai pas lancé le simulateur, ni etalon.js ou discerner.js (ils écrivent dans results/). Les chiffres du bot et l'AUC de 0,971 sont relus dans les fichiers results/ existants, pas recalculés.
