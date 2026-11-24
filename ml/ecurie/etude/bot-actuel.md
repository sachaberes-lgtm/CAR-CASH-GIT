# bot-actuel

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Le contrat (yeux.js, doigts.js, piloter.js) est propre et déterministe, mais il est fait pour un pilote moyen. La vue ne contient aucun obstacle hors de la route, aucune trajectoire de vol complète, ni pièces en l'air, ni aura ×2, ni seuil du palier suivant. Les doigts recalculent le volant 10 fois par seconde au plus et réagissent sans délai. Leurs temps d'appui sont fixes et identiques d'un appui à l'autre : c'est mécanique.
Dans note-reference.json (jeu v1627, régime max, tmax 300, faite avant le passage en allégé), le bot de référence meurt EN VOL dans les 20 courses (morts_en_vol = 1 partout). 168 de ses 175 décollages partent du bord, alors qu'il ne quitte jamais la route exprès (reference.js:5-6) : ce sont donc des sorties involontaires, qu'il ne sait pas rattraper. 12 morts « vide » : il est passé sous la route et s'y est perdu plus de 2,2 s. 5 morts « roche » : les 5 courses finissent dans la grotte. 2 « air » et 1 « pic » (jade).
Recalculés depuis les pièces, ses paliers donnent une médiane de 10 (797 pièces médianes) et un record de 20. Les humains au clavier jouent tout autrement : nitro 60 % du temps contre 17,6 %, 8,4 vols par minute contre 3,7, 3,3 raccourcis par minute contre 0,04.
Pour une écurie réglable et humaine sans perdre « même graine = même course » : un hasard pseudo-aléatoire écrit dans le cerveau, rangé dans memoire, et une graine qui ne dépend que de la course et du profil. Le temps de réaction se fait avec une file de vues retardées, par pas de 100 ms. Les vrais réglages (cadence de décision irrégulière, appuis bruités, profil passé au cerveau) demandent de petites modifications de piloter.js et doigts.js.

## Pour le bot

- (1) VUE, ce qui manque à un pilote d'élite. Les OBSTACLES hors de la route, par carte : roche, lave et eau de la grotte, pics et plancher de jade, parois et rivière du canyon, roches de Jupiter, tours, au moins comme distance et gisement le long de la trajectoire de vol. La TRAJECTOIRE DE VOL prévue (point d'impact en chute libre, avec plané ou poussée de nitro, et l'obstacle rencontré en premier), au lieu des seuls anneau, route proche et tronçons. L'état « PERDU » (MIR.t), qui décide entre la mort « vide » et la mort « air ». Les PIÈCES EN L'AIR et l'AURA ×2. Le SEUIL DU PALIER SUIVANT (pièces restantes) et sa poussée. La route APRÈS le portail. La courbure maximale à venir comparée au lacet possible, pour savoir quand freiner. Les tronçons quand on roule dessous. Les couloirs à parois. La largeur utile est déjà dans demi (28 m partout sur main) ; le verglas ne concerne que le glacier (hors du tirage), la flaque est dans glisse ; le portail est dans fin.
- (2) DOIGTS, ce qui manque. Un geste DRIFT tenu (↓ avec la touche de volant tenue, sinon les impulsions le cassent). Un volant recalculé à chaque image à partir de la dernière consigne : aujourd'hui il est figé 100 ms, soit 13 m à 470 km/h. Des enchaînements en vol (le minimum de 30 images entre gestes autorise 2 figures par seconde, mais un seul geste peut être en file). Attention : dans le simulateur ↑ au sol ne fait rien (AUTO_GAS) et ↓ avec le volant fait drifter au lieu de freiner : la réponse au clavier ordinateur peut différer, à vérifier.
- (2 bis) Limites HUMAIN. Trop SERRÉES : 67 ms d'appui minimal (un joueur au clavier tape en 40 à 60 ms), une décision toutes les 100 ms sans variation. Trop LARGES : aucun temps de réaction (perception et action à la même image, un humain met environ 200 à 300 ms), des chiffres exacts au centimètre, la route vue jusqu'à 550 m avec ses trous et ses passages à l'envers, des minutages d'appui identiques au frame près (une signature de machine sur le journal des touches).
- (3) Pourquoi la référence meurt. Elle sort involontairement par le bord, environ 8 fois par course (aucune gestion de vitesse avant les virages ; la ligne tirée vers les pièces jusqu'à 19 m du centre ; une consigne figée 100 ms). Puis elle ne sait pas se rattraper : le plané n'est permis que dans une fenêtre étroite, le volant est à 0 sans anneau ni route proche, les tronçons inférieurs et le plancher sont ignorés, la nitro est dépensée en figures. D'où 12 morts « vide », et 5 « roche » dans la grotte, qu'elle ne voit pas. Viser un palier d'élite (25 à 30) demande de rattraper ces sorties, de tenir la nitro (60 % chez les humains), de chercher des raccourcis et de lire les obstacles.
- (4) Niveau RÉGLABLE. Un seul cerveau paramétré par un PROFIL : horizon regardé (quels indices de route), gain et marge de la ligne, prudence avant les virages (freinage), appétit pour la nitro, fréquence des figures et des sauts, recherche de raccourcis, qualité du rattrapage en vol, taux d'erreur (oublis, braquage en retard), temps de réaction. Il faut passer le profil au cerveau : aujourd'hui c'est impossible sans modifier piloter.charger, par exemple en injectant PROFIL dans le contexte ou en mettant le profil et la graine dans memoire au départ. À défaut, un fichier par niveau avec ses REGLAGES en dur.
- (4 bis) Comportement HUMAIN en restant déterministe. Un hasard écrit dans le cerveau (un mulberry32, par exemple), dont l'état vit dans memoire et dont la graine vient du profil et de la première vue (carte, L, s), qui sont identiques pour une même graine de course. Le temps de réaction se fait par une file circulaire de vues dans memoire, en multiples de 100 ms (impossible plus fin sans toucher piloter). Le bruit se met sur la ligne visée, les seuils et les moments de décision ; les erreurs et hésitations se tirent de ce même hasard. Pour une cadence irrégulière ou des appuis de durée variable, il faut modifier piloter.js et doigts.js : un hasard semé par la graine de course, en respectant les minima HUMAIN contrôlés par verifier.js.
- Étalonner chaque niveau sur 20 graines au moins avec noter.js. Le matchmaking se fait au RECORD : il faut la distribution du meilleur palier sur autant de parties qu'un vrai joueur, pas la médiane. Le palier gagné augmente la poussée du moteur (ENGINE_TIERS push), donc la difficulté monte d'elle-même avec le palier. Faire passer chaque niveau devant discerner.js : il juge sur ce qui se voit (écart au milieu, ondulation, nitro, vols, bascules de nitro, drift). Les écarts actuels (nitro 17,6 % contre 60 %, vols 3,7 par minute contre 8,4) trahiraient la référence immédiatement.

## Les faits

- Ce que donne la vue, toujours : mode, fini, cause de mort, carte, météo, nitro et réserve (en part de la jauge), nitroOn, nitroLibre, flow, argent, pièces, figures, chaîne, moteur (le palier), les pouvoirs nitro, vitesse, air et aimant (secondes restantes), L, demi.
  - *preuve* : ml/bot/yeux.js:36-42
- Ce que donne la vue au sol : s, fin, lat, cap, vitesse, volant, dessous, drift, glisse, sursis, rebond, figureRoute, bond, lacetRoute, lacetMax, pente, dévers. La route est vue à 8 distances (30 à 550 m) : virage cumulé, montée, dévers, envers, trou. Plus les plaques (< 450 m), les flaques (< 350 m), les pièces par tranches de 25 m (< 325 m), les fruits, les orbes, les 2 prochains modules et les tronçons en contrebas.
  - *preuve* : ml/bot/yeux.js:43-64
- Ce que donne la vue en vol : t, reste (avant les 6 s), monte, plancher, lacetMax ; la route la plus proche (lat, haut, avant, côté, versRoute, axe) ; l'anneau de pose, seulement quand le jeu l'affiche (LM.vu et eta < 90) ; la figure en cours ; les tronçons.
  - *preuve* : ml/bot/yeux.js:65-83
- Les pièces EN L'AIR (p.air) et tout ce qui est sur l'autre face de la route sont exclus de la vue.
  - *preuve* : ml/bot/yeux.js:57
- Le pouvoir AURA ×2 (pwrAurT) n'apparaît pas dans vue.pouvoirs, alors que POUV le nomme ('x2').
  - *preuve* : ml/bot/yeux.js:9,41 ; code/gameplay/boost-depart.js:151
- Les tronçons en contrebas ne sont calculés au sol que si sd > 0 (pas en roulant dessous). Leur calcul suppose une chute libre, sans plané ni poussée de nitro, et ne cherche qu'entre 80 et 3500 m devant.
  - *preuve* : ml/bot/yeux.js:16-32,64
- Aucun obstacle hors de la route n'est visible. Pourtant le jeu tue en vol sur la roche ou la lave de la grotte, les pics de jade, les parois et la rivière du canyon, les roches de Jupiter, les tours de la ville et les géants de l'orbite. Le README le reconnaît.
  - *preuve* : code/moteur/boucle-3-physique.js:585-593 ; ml/bot/README.md:78
- La mort « vide » survient quand les 6 s de vol sont dépassées alors que la caisse était « perdue » (sous la route, aucun anneau en vue) depuis plus de 2,2 s, ou sous le plancher de jade. La mort « air », c'est l'airtime dépassé sans être perdu. L'état « perdu » (MIR.t) n'est pas dans la vue.
  - *preuve* : code/moteur/boucle-3-physique.js:595 ; code/gameplay/pouvoirs-grisants.js:68-71
- vue.demi lit ROAD_HALF en direct : 14 × LARGEUR[0] = 2,0, soit 28 m partout sur main. Le glacier, plus large, n'est plus dans le tirage.
  - *preuve* : code/maps/continuite.js:225,229
- Une sortie de route par le bord, c'est |lat| > ROAD_HALF : la caisse bascule (startFall), sauf dans les couloirs à parois du canyon et de la ville. L'enregistreur classe un décollage « bord » si |lat| > 0,92 × demi.
  - *preuve* : code/moteur/boucle-2-conduite.js:146-153 ; code/moteur/enregistreur-jeu.js:74
- Le simulateur tourne en édition 'mobile' sans pc=1. Donc FORCE_TEL et IS_MOBILE sont vrais, AUTO_GAS = true (ça pousse tout seul) et TCTL.on = true. ↑ au sol ne sert à rien, et ↓ avec le volant au-delà de 0,35, à plus de 42 % de la vitesse max, déclenche le drift au lieu de freiner.
  - *preuve* : ml/reel/jeu-reel.js:99 ; code/page/tete.html:59 ; code/rendu/soleil-planete.js:419-420 ; code/moteur/mobile-tactile.js:18-21 ; code/moteur/boucle-2-conduite.js:43,64-67
- Le volant au clavier est du tout ou rien, lissé en 47 ms (VOL_LIS), puis le lacet suit en VOL_TAU. Les doigts dosent par impulsions : on = max(4, round(a × 12)) images, off ≥ 4 images. Le cycle dure donc au moins 8 images (133 ms) et la consigne n'est recalculée qu'aux décisions, toutes les 6 images.
  - *preuve* : code/moteur/boucle-1.js:244,247 ; ml/bot/doigts.js:72-81,14,29-33
- Les limites HUMAIN sont toutes des constantes fixes : décision toutes les 6 images, appui et repos de 4 images au moins, double appui de 5 + 5 + 5 images, un geste toutes les 30 images au plus, 27 images de verrou NITRO. Les gestes ont un minutage identique à chaque fois et le cerveau ne subit aucun délai de réaction : il voit et agit à la même image.
  - *preuve* : ml/bot/doigts.js:13-21,83-112 ; ml/bot/piloter.js:69-80
- Il n'existe pas de geste « drift » : il passe par manche +1 avec le volant. En impulsions, le braquage retombe sous 0,2 et le drift s'arrête ; il faut un volant ≥ 0,92 (touche tenue) pour le garder. Un seul geste à la fois, 500 ms au moins entre deux.
  - *preuve* : ml/bot/doigts.js:65,77 ; code/moteur/boucle-2-conduite.js:64-67
- Le cerveau tourne dans un bac sans Math.random (M.random = undefined), sans require ni horloge. decide(vue, memoire) ne reçoit ni la graine ni aucun paramètre : charger n'accepte que {ms}.
  - *preuve* : ml/bot/piloter.js:39-54,64,74
- note-reference : 20 courses, cashcar-v1627, tmax 300 (aucune n'atteint la limite, maximum 230 s), régime max car la note précède le régime allégé. Causes : vide 12, roche 5, air 2, pic 1. Survie médiane 142,6 s, nitro 17,6 %, 3,67 vols par minute, air 9,6 %, 0,04 raccourci par minute, drift 0 %, 0 geste refusé.
  - *preuve* : ml/bot/results/note-reference.json (champs note et courses)
- Les 20 courses finissent par une mort en vol (morts_en_vol = 1 partout). Décollages : 168 par le bord, 7 par un saut, 0 par un trou. Quatre courses meurent au premier vol (vols 1, poses 0 : 910333, 910370, 910407, 910666).
  - *preuve* : ml/bot/results/note-reference.json (courses[].decollages, poses, morts_en_vol)
- Les 5 morts « roche » finissent toutes sur la grotte. Les morts « vide » finissent sur jade (5), canyon (4), nuages (2) et ville (1). La mort « pic » est à jade.
  - *preuve* : ml/bot/results/note-reference.json (courses[].cartes, cause)
- Paliers recalculés avec palierDe sur les pièces : 4 4 4 4 6 6 7 8 9 10 10 11 12 12 13 15 16 18 18 20, soit une médiane de 10 et un record de 20 ; pièces médianes 797.
  - *preuve* : ml/bot/mesures.js:12,15 appliqué à note-reference.json
- Étalon humain. Sacha au clavier, 10 parties : 241 décollages par le bord et 15 par un saut, nitro 59,7 %, 8,39 vols par minute, air 32,9 %, 3,31 raccourcis par minute, drift ≈ 0, paliers 1 à 28. Léo au doigt, 4 parties : drift 12 à 17,6 %, nitro 61,2 %.
  - *preuve* : ml/bot/results/etalon-sacha.json, etalon-leo.json (champs barre et parties)
- Au sol, le bot de référence vise l'intérieur du virage (v150 × 60, jusqu'à 0,7 × max). Les pièces, fruits, orbes et plaques écrasent cette ligne jusqu'à |lat| = demi − 9 = 19 m, sans vérifier le virage qui suit. Il ne freine jamais et ne compare pas lacetMax à la courbure à venir.
  - *preuve* : ml/bot/reference.js:25-34
- En vol, le bot de référence ne braque que s'il voit l'anneau, ou la route proche avec |axe| < 1,6 ; sinon volant 0. Il ne tient la NITRO (plané) que si |lat| > demi, haut entre −12 et 4 et nitro > 0,1. Il ne pique que s'il est trop haut. Il n'utilise ni les tronçons, ni le plancher, ni le geste redresser.
  - *preuve* : ml/bot/reference.js:53-67
- Le bot de référence lance des figures qui coûtent de la nitro : sur la route avec une jauge > 0,6 (coût 35 %), en vol avec une jauge > 0,4 et un délai d'anneau > 1,1 s. Cette nitro manque ensuite pour se rattraper, et tenir NITRO pendant une figure en vol la redresse.
  - *preuve* : ml/bot/reference.js:11,40-49,69-72 ; ml/bot/README.md:103-104

## Non verifie

- Rien n'a été exécuté (simulateur, noter, autopsie) : les causes des 168 sorties par le bord (vitesse, impulsions, poursuite des pièces) sont déduites du code, pas mesurées par une autopsie.
- Les valeurs « médiane palier 11, environ 930 pièces » de la consigne ne correspondent pas à ce que je recalcule (médiane 10, 797 pièces, record 20). Elles viennent peut-être d'une autre note (régime allégé ?) que je n'ai pas ouverte.
- Si la version ordinateur de /jouer/ (le clavier de Sacha) est aussi en AUTO_GAS / FORCE_TEL comme le simulateur : non vérifié. Si non, ↑ et ↓ n'ont pas le même effet chez Sacha et chez le bot.
- Les seuils exacts du double appui (300 et 420 ms) et la valeur de VOL_TAU ne sont pas relus dans figures-physique.js et camera.js (ils sont repris des commentaires de doigts.js).
- Les temps de réaction et de frappe humains cités (environ 200 à 300 ms, appui de 40 à 60 ms) sont des ordres de grandeur généraux, pas des mesures sur l'étalon.
- Les modifications de piloter.js et mesures.js présentes dans l'arbre de travail (non commitées) ont été lues telles quelles. Je n'ai pas vérifié si elles changent le comportement par rapport au commit 3317b893a qui a produit note-reference.
