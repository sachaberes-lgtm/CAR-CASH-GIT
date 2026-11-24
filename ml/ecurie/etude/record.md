# record

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Le record d'un joueur tient en trois chiffres de SAVE.d : `ex.eng` (le meilleur palier moteur, un index de 0 à 29, mis à jour pendant la course), `best` (le meilleur argent d'une partie) et `auraMax`. S'y ajoutent `ex.kmh`, `frenRec`, `prof.dMax` (la plus longue partie en secondes) et un Top 10 qui reste dans l'appareil. Il n'y a aucun record par map, aucune distance record et aucun serveur : le classement mondial a été retiré.
Une vieille sauvegarde ne donne PAS une meilleure voiture. La physique lit toujours CARS[0] et le palier moteur de la partie, qui repart à 0 à chaque course. La caisse équipée ne change que la carrosserie, plus quelques marges de collision liées à sa largeur et sa longueur.
Ce qui donne vraiment plus de force au départ d'une course :
(1) les figures achetées : aura de 50 à 220 contre 50 et 90 pour une sauvegarde neuve, donc plus de pièces par pose (2 à 18 par pose) ;
(2) les bons gagnés à la machine à sous : DÉPART BOOSTÉ (palier 1 et les 5 pouvoirs dès le départ) et SECONDE CHANCE gratuite ;
(3) la seconde chance après une pub, permise dès 20 s de course (le moteur perd un palier). La partie reprend, donc `ex.eng` peut être battu après une reprise.
Le bot joue la sauvegarde neuve SAVE0 et n'a rien de tout cela.
Pour des fantômes, deux choses existent déjà : l'enregistreur de parties (10 échantillons/s, la géométrie de la route, les événements, les pièces) et le moteur du Survivant, retiré de l'interface mais toujours dans le code (7 pilotes à personnalité, une simulation 1D le long de la piste, un classement en direct). Il existe aussi le profil de style AIP, écrit à chaque fin de partie dans SAVE.d.ai. Il manque la graine de la piste dans l'enregistrement, et un serveur.

## Pour le bot

- Le niveau d'un joueur se lit dans `ex.eng`, le meilleur palier (attention, c'est un index : palier N affiché = ex.eng+1). Pour ranger un bot dans la bonne case, il faut le comparer à un palier de partie TYPIQUE (médiane des pièces sur ses dernières parties), pas au record, qui est un sommet. Le jeu ne garde pas l'historique des pièces par partie. Seuls `auraH` (une moyenne d'aura) et le profil AIP existent : un matchmaking juste demandera d'ajouter un petit historique (par exemple les 20 dernières parties : pièces et durée).
- Aucune voiture n'avantage un joueur : un bot « palier 25 » peut garder CARS[0] et seulement porter la carrosserie qu'aurait un joueur de ce niveau. Cela ne change rien à sa physique, sauf les petites marges liées à la largeur et la longueur de la caisse.
- Les FIGURES sont le vrai écart de sauvegarde. Pour un bot d'élite indiscernable, il faut lui donner les figures d'un joueur de ce niveau (par exemple double tonneau, tire-bouchon, hélico, rodéo, cosmique), en écrivant SAVE0.figs et figEq avant `lancer()`. Un bot débutant garde tailwhip et salto. C'est à mesurer : combien de paliers les figures valent-elles à pilote égal ?
- Les meilleures parties humaines (palier 28) peuvent contenir une seconde chance (l'étalon les recolle déjà) et un DÉPART BOOSTÉ venu de la machine à sous. Pour l'élite, il faut soit permettre au bot une reprise (en perdant 1 palier) et parfois un départ boosté, soit retirer ces parties de l'objectif. Sinon, le palier 28 humain n'est pas comparable.
- Pour des bots humains de bas niveau, le profil AIP (air, boost, caution, skill, aggr, airDur) et les personnalités SURV_PILOTS (agro, err, rea, line) donnent déjà un vocabulaire de défauts réglables, par exemple : erreurs fréquentes, réaction lente, ligne sale, faible appétit de saut. Un même cerveau dégradé par ces boutons peut couvrir les paliers 1 à 10.
- Les fantômes peuvent se brancher sur deux pièces existantes. (a) L'enregistreur de parties, dont le format jeurec contient déjà ce qu'il faut pour rejouer une trace (s, lat, h, mode, xyz à 10 Hz, avec les routes). Il faut y ajouter la graine `sd` de chaque piste, le palier et la liste des figures. (b) Le moteur du Survivant (maillages, traînées, classement vivant, simulation 1D le long de la piste), qui peut afficher des rivaux qui roulent sans physique complète.
- Pour qu'un fantôme roule sur la MÊME route que le joueur, il faut une graine commune (`?pistegraine` ou « piste du jour ») et désactiver la mémoire du sac (`cashcarRU`, `SF_HIST`), comme le fait déjà ml/reel. Attention aussi au régime : sur téléphone (`ALLEGE`) le tirage des maps diffère (Crypto City), donc les fantômes doivent être calculés dans le même régime que le joueur.
- Il n'y a aucun serveur ni classement en ligne. Le matchmaking ne peut donc se faire que sur l'appareil : les fantômes livrés avec le jeu (comme `ml/bot/etalon`), et le niveau du joueur lu dans sa sauvegarde locale.

## Les faits

- Le palier record est `SAVE.d.ex.eng`, un INDEX de 0 à 29. Il est mis à jour à l'instant où l'on passe un palier, pas à la fin de la partie.
  - *preuve* : code/economie/achat-carte-moteur.js:244 ; code/sauvegarde.js:29 et :87 (borné à ENGINE_TIERS.length-1)
- Le palier dépend uniquement des pièces ramassées pendant la partie (`coinsGot`). Une pièce rapporte 1, et une figure posée rapporte entre 2 et 18 pièces : max(2, min(18, round(2+q/6))).
  - *preuve* : code/economie/achat-carte-moteur.js:231-241 ; code/gameplay/figures-route.js:64
- À la fin de la partie, `ex.eng=max(ex.eng,engTier)`. Le reste des records y est aussi versé : kmh, zones, chaîne, nombre de parties, `prof.dMax` (la plus longue partie, en secondes), `auraMax` et `auraH` (somme et nombre, pour l'aura moyenne).
  - *preuve* : code/gameplay/seconde-chance.js:510-552
- `SAVE.d.best` est le record d'ARGENT d'une partie. Il monte en direct pendant la course, sauf à l'auto-école et dans le bac à sable.
  - *preuve* : code/moteur/boucle-6-hud.js:62 ; code/gameplay/seconde-chance.js:616 ; code/gameplay/boost-depart.js:373
- L'affichage : l'affiche RECORD PERSO du garage montre MEILLEURE PARTIE, AURA MAX, PALIER MOTEUR (l'index brut `nb(ex.eng)`, donc 0 = premier palier) et VITESSE MAX. Les missions, elles, comptent `ex.eng+1`.
  - *preuve* : code/gameplay/evenements-rares.js:248 ; code/missions/defis-moteur.js:121
- L'écran de fin annonce « RECORD ! » quand le palier dépasse `RUNX.engAvant`, l'argent dépasse `best0` ou la chaîne d'aura bat son record.
  - *preuve* : code/gameplay/frole-contrats.js:188 ; code/gameplay/mort.js:253 ; code/economie/achat-carte-moteur.js:142
- Le Top 10 (`SAVE.d.leaders`, nom sur 8 lettres et argent) reste dans l'appareil. L'affiche RECORDS MONDIAUX a été retirée le 30/09 et aucun appel réseau ne sert aux scores.
  - *preuve* : code/gameplay/boost-depart.js:314-364 ; code/gameplay/evenements-rares.js:207 ; recherche fetch/WebSocket dans code/ : version.json, sons et musique seulement
- Il n'y a pas de record par map. Il existe seulement `ex.morts` (causes de mort par niveau) et `ex.temps` (temps par niveau), jamais affichés.
  - *preuve* : code/sauvegarde.js:29 et :90-95
- La voiture équipée ne donne AUCUNE performance : la boucle utilise CARS[0] pour maxKmh, accel et turn, et la poussée vient de ENGINE_TIERS[engTier].
  - *preuve* : code/moteur/boucle-1.js:175-183 ; code/gameplay/seconde-chance.js:466-470
- Le moteur repart à zéro à chaque partie (`engTier=0`, `coinsGot=0`). La « VITESSE DE DÉPART » du 19/10 n'a plus de code, il n'en reste que des commentaires.
  - *preuve* : code/gameplay/seconde-chance.js:474 ; recherche vdep : seuls des commentaires restent
- Les dimensions de la caisse équipée (w, l, h) jouent quand même un peu : retour sur le bitume, rattrapage au bord et à la pose, dégagement des figures au sol, sphère du portail.
  - *preuve* : code/gameplay/demi-tour.js:195, 344, 356, 387, 438 ; code/gameplay/figures-route.js:24 ; code/gameplay/portail-passage.js:211
- La piste ne dépend pas de la caisse : `const level=0` est forcé dans le générateur de route.
  - *preuve* : code/maps/ville-entree.js:55-58
- Les figures possédées changent le gain. Une sauvegarde neuve a figs=['tailwhip','salto'] (aura 50 et 90). Les figures achetées vont de 15 000 $ (tonneau) à 500 000 $ (salto cosmique, aura 220). L'aura d'une figure fixe sa valeur dans la chaîne (aura/16), et la chaîne fixe le nombre de pièces à la pose. Des figures différentes font monter le ×.
  - *preuve* : code/sauvegarde.js:38 ; VERSION PRINCIPALE/figures.js:21-32 ; code/gameplay/figures-physique.js:237-239 ; code/interface/jus-echelle.js:286-295 ; code/gameplay/evenements-rares.js:202
- La machine à sous de fin de partie verse des bons gardés dans la sauvegarde : `spinBoost` (p=0,07 : la partie suivante part au palier 1, nitro pleine, avec les 5 pouvoirs pour leur durée pleine) et `chanceG` (p=0,19 : réanimation automatique à la prochaine explosion).
  - *preuve* : code/economie/final-spin.js:13-14, 36-37, 479-486 ; code/gameplay/seconde-chance.js:99, 168
- La seconde chance (une pub sur le site, gratuite dans l'app) est proposée après au moins 20 s de course, une fois par partie, et coûte un palier moteur. Le record `ex.eng` peut donc venir d'une partie reprise.
  - *preuve* : code/gameplay/seconde-chance.js:91, 188, 103 ; :11-12 (l'app sans pub)
- Pas d'amélioration de caisse à acheter : la boutique vend des peintures, des ailes, des traînées et des figures. Seules les figures touchent au jeu. L'« argent de l'atelier » n'est que du décor (les liasses du garage).
  - *preuve* : code/economie/boutique-vitrine.js:108, 121 ; code/sauvegarde.js:38 et :118-120 ; code/economie/argent-atelier.js:1-9
- Le MODE FACILE (`SAVE.d.facile`) n'est relu nulle part dans le jeu. Il sert seulement à savoir si la question a déjà été posée au premier JOUER.
  - *preuve* : recherche `.facile` : code/sauvegarde.js:61, code/interface/garage-cadrage.js:210, code/moteur/mobile-tactile.js:982-986
- Le simulateur remet la sauvegarde neuve photographiée après la chauffe (SAVE0) avant chaque course. Le bot n'a donc ni figures achetées, ni bons de la machine, ni seconde chance.
  - *preuve* : ml/reel/jeu-reel.js:135-138, 156 ; ml/README.md:159 ; passation/BOTS-ML.md:290-291
- Le Survivant (7 pilotes police) est retiré de l'interface, mais tout le code reste. SURV_PILOTS donne à chaque pilote une personnalité (agro, err, rea, line). La simulation est en 1D le long de la piste, avec ta caisse CARS[0] et ton palier. Les bots imitent les zones où tu as sauté, et un classement en direct par distance existe déjà.
  - *preuve* : code/interface/menu-logo.js:164-189 ; code/rendu/kit-lumiere.js:74-109, 140-163, 408 ; code/moteur/mobile-tactile.js:25 ; code/page/ecrans-menus.html:46
- Le profil AIP (air, boost, caution, skill, aggr, airDur, runs) est encore calculé à CHAQUE fin de partie et écrit dans SAVE.d.ai, alors que le Survivant est éteint. Il fait une moyenne glissante de la façon de jouer du joueur.
  - *preuve* : code/interface/menu-logo.js:195-228 ; code/gameplay/seconde-chance.js:615
- L'enregistreur de parties (éteint par défaut ; `?jeurec=1` ou BOÎTE NOIRE) note 10 échantillons/s : t, route, mode, s, lat, h, kmh, stick, nitro, drift, xyz. Il garde la géométrie de chaque route (un point tous les ~20 m, les modules, les trous) et les événements (décollages, poses, figures, pièces, morts), avec en fin de partie les pièces, l'argent et vmax. Il ne note NI la graine de piste, NI les figures possédées, NI le palier.
  - *preuve* : code/moteur/enregistreur-jeu.js:17-19, 26-40, 48-50, 88-89 ; passation/ENREGISTREUR-JEU.md:31-41
- La piste a bien une graine (`sd`, tirée au hasard). `?pistegraine=n` la fixe pour toutes les pistes et coupe la mémoire du sac des routes uniques (localStorage `cashcarRU`). Sans ce paramètre, la route dépend aussi de l'historique du joueur (SF_HIST, cashcarRU).
  - *preuve* : code/rendu/traces-pneus.js:105 ; code/moteur/piste-prebati.js:382 ; code/gameplay/route-uniques.js:9-13 ; ml/reel/jeu-reel.js:158
- Le plan BOTS-ML recommande déjà des fantômes : courses calculées d'avance sur la « piste du jour », rejouées chez le joueur. La boutique du jour utilise déjà une graine = jour UTC.
  - *preuve* : passation/BOTS-ML.md:285 ; code/economie/boutique-du-jour.js:3

## Non verifie

- Je n'ai pas mesuré le poids réel des figures achetées sur le palier atteint (combien de paliers séparent tailwhip+salto de toutes les figures) : il faudrait le simulateur, que je n'ai pas lancé.
- Je n'ai pas vérifié la formule de pièces à la pose d'un VOL (tryLand) : j'ai vu seulement la pose d'une figure au sol (frEncaisse), plafonnée à 18. Je suppose que la pose en vol suit la même règle.
- L'effet réel des dimensions de la caisse (w, l, h) sur la survie n'est pas mesuré, seulement repéré dans le code.
- Je n'ai pas vérifié si une sauvegarde neuve en mode `?sim=1` lance l'auto-école (SAVE.d.tuto=0), ni comment ml/reel l'évite.
- Je n'ai pas vérifié si les missions v2 ou le pass (`?pass=1`, éteint par défaut) donnent des pièces de moteur en course, ou seulement de l'argent en banque.
- Je n'ai pas vérifié le plafond des bons `chanceG` et `spinBoost` qu'une sauvegarde peut accumuler hors du crochet de test (borné à 3 dans dbg).
- Je n'ai pas vérifié si le joueur peut encore armer le Survivant par un chemin caché : seuls existent le bouton #survBtn (encore dans le HTML) et les crochets dClic/clic de desktop-banc et mobile-tactile.
