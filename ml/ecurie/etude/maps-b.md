# maps-b

> Rapport d'un agent (Opus), 24/11/2026, lecture seule du code et des donnees. Les preuves renvoient au code du jeu `cashcar-v1627` ; a reverifier avant de s'y fier.

## En bref

Sur JADE, CANYON et CRYPTO CITY (jour = carte 'crypto', nuit = carte 'ville'), le décor ne tue que pendant le VOL (mode 'fall'). La boucle teste la position de la caisse avec jadeHeurt (cause 'pic'), canyonHeurt ('paroi', 'riviere' ou 'canyon') et villeHeurt ('tour') : boucle-3-physique.js:585-595. Au sol, la seule mort propre à ces maps vient des murs des COULOIRS (Étroits, tunnel d'arrivée et mine du canyon, couloirs dans les tours de la ville). On y meurt si on touche le bord à plus de 0,52 rad d'angle et plus de 200 km/h ; en dessous, la caisse frotte et ralentit (murs-parois.js:8, boucle-2-conduite.js:146). Les fonctions de choc sont des lectures pures sur des grilles et sur la position x,y,z. Comme les yeux sont évalués dans la fonction du jeu (__EV, sim-env-reel.js:13), yeux.js peut les appeler directement pour sonder la trajectoire de vol prévue. Ce qui manque surtout aux yeux : (1) un radar de choc pendant le vol, (2) les intervalles de couloirs et de plafonds devant (CY.cou, CY.tun, CY.mine, CY.vouT, CY.toits, CITY.couloirs), (3) les pièces en l'air, que yeux.js:57 écarte (p.air) alors que Jade en pose le long de ses grands sauts (les « fils d'or »), (4) les pièces ₿ géantes de Crypto City (JACKPOT en vol), (5) les montagnes de Jade qui s'effondrent en fin de niveau. Deux idées du sujet sont fausses : banqVerglas ne concerne que le GLACIER (banqOk exige id 'banquise'), et le taureau de Crypto City a été retiré du code le 05/11. Tirage sur PC : 6 maps, poids 1 chacune et 0,3 pour le canyon (environ 18,9 % chacune et 5,7 % pour le canyon). Le glacier et les dunes sont toujours hors du tirage, et Crypto City de jour aussi en régime ALLEGE.

## Pour le bot

- À AJOUTER aux yeux en VOL : un radar de choc. Simuler la trajectoire balistique (fallVel, FALL_G*gK()*SPD, pas de 50 ms sur ~2 s, comme jadeSautSur dans jade-secoue.js:22) et, à chaque point, appeler jadeHeurt(P) || canyonHeurt(P) || villeHeurt(P). Rendre {tChoc, cause, distance}. C'est la première cause de mort propre à ces maps, et le bot ne la voit pas aujourd'hui.
- À AJOUTER au SOL : 'couloirs' devant, sous forme d'intervalles {d0, d1, type} lus dans CY.cou, CY.tun (les 460 derniers mètres du canyon), CY.mine, CY.vou (voûte) et CITY.couloirs. Règle du pilote : pas de saut ni de bond dedans (le plafond tue), garder |lat| < ROAD_HALF-1.15, et si on touche le mur, l'angle doit rester < 0,52 rad ou la vitesse < 200 km/h.
- À AJOUTER : les plafonds du canyon V3 (CY.toits : bouchon, galerie, pont, avec s0 et s1) et la voûte, pour que le bot ne déclenche pas de saut ou de raccourci dessous.
- À AJOUTER : la hauteur sous la caisse au canyon, p.y - cyHauteur(x,z) avec o.eau et o.rk. Cela dit si un raccourci en vol passe au-dessus d'une crête ou d'une rivière. Sur Jade, rien en dessous : seul jadeVide (trackMinY-120) compte.
- À CORRIGER dans yeux.js:57 : les pièces air:1 sont écartées. Sur Jade, les fils d'or (jusqu'à 14 pièces par grand saut) dessinent le bon raccourci. Un très bon bot doit les voir (lèvre JADE.rac3[k].p0, pose p1) : c'est l'écart de pièces, donc de palier, entre bons et moyens joueurs sur Jade.
- Crypto City : exposer CRYPTO.pInfo (x, y, z, r) en vol pour viser les JACKPOT. Il ne rapporte que de l'aura (160), pas de pièces : priorité basse pour un bot qui vise le PALIER, utile pour avoir l'air humain (un vrai joueur les vise).
- Jade, fin de niveau : exposer les montagnes qui tombent (JCH.L avec t0 > 0 et fin faux, position à travers c.inv). Elles s'éloignent de la route mais restent dures en vol.
- Bot faible (humain moyen) : ne lui donner que ce que l'œil voit vraiment. Radar court (≤ 0,8 s), pas de fils d'or, réaction retardée de 0,2 à 0,4 s, et surtout des morts 'tour' en ville et 'paroi' au canyon pendant les sauts mal jugés : c'est la mort humaine typique sur ces maps.
- Bot d'élite (paliers 25-30) : radar complet ~2 s, fils d'or, intervalles de couloirs et de plafonds, et choix des raccourcis en vol qui croisent les tronçons (déjà dans yeux.js) en éliminant ceux que le radar déclare bouchés.
- Pour l'écurie : ALLEGE vaut faux dans le simulateur. Un bot classé ne verra donc jamais la ville seule de l'iPhone. Pour imiter un joueur iPhone, imposer carte 'ville' et jamais 'crypto'. Le canyon ne sort qu'environ une partie sur 18 : il faut l'imposer (--carte canyon) pour avoir assez de mesures.

## Les faits

- Les chocs avec le décor des maps ne sont testés qu'en VOL (branche mode 'fall'), dans l'ordre : grotte, glacier, jade ('pic'), canyon (cause rendue), dunes, sol de la ville vitrée, roches de l'orbite, tours de la ville ('tour'), géants de l'orbite, puis tryLand, puis airDepasse ou jadeVide ('vide' ou 'air'). Sous 60 i/s, le trajet de l'image est aussi testé point par point.
  - *preuve* : code/moteur/boucle-3-physique.js:583-595
- Au sol, la seule mort propre à ces maps est le mur des couloirs : si cyCouloirIci() ou villeCouloirIci() est vrai et |lat| > ROAD_HALF-1.15, murCote(dt,'paroi') s'applique. On meurt si l'angle d'entrée a > 0,52 rad ET la vitesse > 200 km/h. Sinon on perd 3 à 30 % de vitesse et le cap est renvoyé (-30 % de psi).
  - *preuve* : code/moteur/boucle-2-conduite.js:146 ; code/maps/murs-parois.js:4-17
- JADE, ce qui tue : en vol, les cubes des montagnes et rochers (PIL), la porte du ciel (JADE.porte) et le pont du ciel (JADE.pont). La caisse compte pour 5 points : le centre et ±1,4 m en x et en z du MONDE (JH), sans tourner avec la caisse.
  - *preuve* : code/maps/jade-vol.js:278-296
- JADE, en mémoire : JADE.col = {g: Map(gx*100003+gz -> indices), CG: 80, P: PIL}. Chaque q de PIL vaut [x, z, rayon, yBas, yHaut, indice de gabarit, quart de tour, (q.inv, q.sc)]. Le test fin est jadePilierDans(q,x,y,z) (voxAt sur le gabarit). jadeHeurtPt(p) teste un point seul.
  - *preuve* : code/maps/jade-3.js:277-280 ; code/maps/jade-vol.js:279-280 ; code/maps/jade-secoue.js:20-21
- JADE, l'effondrement : des montagnes (6 % vers 18 % de la piste, jusqu'à 90 % vers la fin) tombent quand s > c.sN-700-c.dl. Elles tremblent 0,9 s puis basculent vers l'extérieur. Elles quittent la grille (JADE.col.mort) mais gardent une hitbox mobile (c.inv). Jamais celles qui surplombent la route ou la frôlent à moins de ROAD_HALF+30 m. Le joueur sent un tremblement si elles sont à moins de 500 m.
  - *preuve* : code/maps/jade-3.js:312-327, 345-352 ; jadeHeurt jade-vol.js:288-291
- JADE n'a plus d'eau : la mer a été retirée (12/11). JEAU reste neutre, la caisse n'est jamais dans l'eau. La chute fatale est jadeVide : y < trackMinY-120, appliquée sur TOUTES les maps.
  - *preuve* : code/maps/jade-3.js:368-371 ; boucle-3-physique.js:595
- JADE, les pièces : des 'fils d'or', jusqu'à 14 pièces posées le long de l'arc de chaque grand saut (JADE.rac3, de la lèvre p0 au point de pose p1), marquées air:1. yeux.js les ignore (condition p.air ligne 57). Les pièces ordinaires de Jade sont des sapèques (le symbole 'Y'), un simple changement d'apparence.
  - *preuve* : code/maps/jade-alleluia.js:422-438 ; ml/bot/yeux.js:57 ; code/gameplay/pickups-fruits.js:84,137
- CANYON, ce qui tue en vol : canyonHeurt(p) rend la cause, ou '' si rien. Relief : p.y < cyHauteur(x,z)+0,7 sur les 5 points donne 'riviere' si eau, 'paroi' si roche > 0,35, sinon 'canyon'. S'y ajoutent les monuments (cyMonuHeurt), les Étroits (cyCouloirHeurt sur CY.couT), le tunnel de grès (cyTun2Heurt : murs, voûte, fond du gouffre = 'canyon'), la mine (cyMineHeurt), la voûte en tube (cyVouteHeurt) et les ouvrages V3 (cyToitHeurt : bouchon, toit et piliers de galerie, pont naturel).
  - *preuve* : code/maps/canyon-relief.js:395-405, 568-572, 711-720 ; code/maps/canyon-v3.js:220-232
- CANYON, en mémoire : le relief est un champ de hauteurs (CY.Z, CY.F, interpolation cyBil). cyHauteur(x,z,o) rend la hauteur et remplit o.eau, o.rk (roche), o.fond. cyHauteurVite(x,z) est la version rapide. Intervalles en s : CY.cou = [etroit0, etroit1] (couloir), CY.tun = [L-460, L+60] (tunnel d'arrivée, toujours présent), CY.mine (présente à 82 %), CY.vou (tubes 'tonneau' ou 'tube'), CY.toits (ouvrages).
  - *preuve* : code/maps/canyon-relief.js:9-22, 511 ; code/maps/canyon-route.js:583, 689, 745-748
- CANYON, sol : cyCouloirIci() est vrai dans les Étroits, dans tout le tunnel d'arrivée et dans la mine. Ce sont les seuls endroits du canyon où le bord de route est un mur.
  - *preuve* : code/maps/canyon-relief.js:516
- CRYPTO CITY (jour = 'crypto', nuit = 'ville', même constructeur), ce qui tue : en vol, les tours (villeHeurt). En mémoire : CITY.col = {g: Map('gx,gz' -> décalages), CG: 60, c: Float32Array [x,y,z,w,h,d par 6], f: forme}. Test : boîte élargie de 0,9 m en x/z et 0,5 m en y, ou villeForme pour les géantes de verre (vrillée, fuseau, lame, biseau). Les reflets au plafond (VIT_PLAFOND) sont durs aussi.
  - *preuve* : code/gameplay/ligne-parfaite.js:91-108 ; code/maps/jade-balade.js:262-285 ; code/maps/jade-1.js:23
- VILLE, les couloirs : les tunnels dans les tours (le nœud) sont rangés dans CITY.couloirs = [[s0,s1],...]. Au sol, les rails sont un mur (murCote). En vol, le plafond du couloir est un volume de CITY.col, donc sauter dedans tue.
  - *preuve* : code/maps/ville-scenes.js:370-376, 450
- Le TAUREAU et les bougies de Crypto City sont retirés (05/11) : rien de dur à part les tours.
  - *preuve* : code/maps/cryptocity.js:24-30 ; code/gameplay/ligne-parfaite.js:103
- banqVerglas (verglas) ne s'applique qu'au GLACIER : banqOk() exige LVL.cur.id==='banquise'. Crypto City n'a pas de verglas.
  - *preuve* : code/maps/glacier-verglas.js:43-45 ; code/maps/glacier-construction.js:233
- CRYPTO CITY, le bonus : traverser EN VOL une pièce ₿ géante (CRYPTO.pInfo : x, y ± 4 m qui ondule, z, rayon r) avec une distance au carré < r²·0,8 déclenche JACKPOT : chaineAura('JACKPOT',160), une pluie d'argent et un feu d'artifice, puis 8 s de recharge. Pas de pièces directement.
  - *preuve* : code/maps/cryptocity-taureau.js:156-160, 175-180
- Hors du tirage (SF_HORS) : banquise (glacier) et dunes, toujours. crypto (Crypto City de jour) si ALLEGE. vitree n'est plus une carte. Chacune revient avec ?carte=.
  - *preuve* : code/maps/niveaux.js:58
- Le canyon n'existe que si CANYON_OK (WebGL2), et les dunes si DUNES_OK = CANYON_OK.
  - *preuve* : code/maps/canyon-route.js:33 ; code/maps/dunes-1.js:15 ; niveaux.js:99
- Tirage (sfTire) : une MAP au hasard, jamais celle d'avant, et on écarte les 3 dernières de SF_HIST tant qu'il en reste au moins 3. Poids 1, sauf SF_RARE.canyon = 0,3. crypto et ville sont fusionnées en une map ('cryptoville'). Ensuite une météo selon ses poids p.
  - *preuve* : code/maps/continuite.js:186-198
- Poids sur PC (ALLEGE faux) : nuages, cryptoville, jade, espace, grotte = 1 ; canyon = 0,3. Total 5,3 : environ 18,9 % par map et 5,7 % pour le canyon, avant l'exclusion des maps récentes. Dans cryptoville : crypto matin 1, midi 1,3, soir 1,2 contre ville orage 3,5, donc jour et nuit à 50/50. En ALLEGE : la nuit d'orage seulement.
  - *preuve* : code/maps/niveaux.js:74-77, 89-100 ; continuite.js:186
- Météos : Jade a 6 météos de poids 1 (matin, midi, soir, nuit, pluie, orage). Canyon : matin, soir et nuit à 1/3 chacun (pluie et orage à p:0). La ville est toujours de nuit sous orage (pluie 1, orage 1), teinte violet, vert ou jaune.
  - *preuve* : code/maps/niveaux.js:75-77, 99-100 ; continuite.js:183
- Les yeux peuvent appeler les fonctions du jeu (jadeHeurt, canyonHeurt, villeHeurt, cyHauteur…) : __EV fait un eval DANS la fonction du jeu, et yeux.js lit déjà T, pts, PADS. jadeHeurt, canyonHeurt et cyHauteur n'écrivent que dans leurs propres vecteurs de travail (V9J, CY_H9, CY_O9), aucun état de jeu.
  - *preuve* : ml/reel/sim-env-reel.js:13 ; code/maps/jade-vol.js:281 ; code/maps/canyon-relief.js:3, 395
- Le simulateur tourne au régime MAXIMUM (ALLEGE faux) : Crypto City de jour y est tirée. Le canyon y est présent (README).
  - *preuve* : ml/reel/README.md:37, 79

## Non verifie

- Je n'ai rien exécuté : ni le simulateur, ni noter.js, ni autopsie.js. Les fréquences de mort par cause et par map ne sont pas mesurées.
- Que la Crypto City de jour (NIV_CRYPTO) construise bien CITY.col avec le même constructeur que la nuit : affirmé par le commentaire de cryptocity.js:9-10, pas suivi dans buildVoxCity.
- Le contenu exact de CRYPTO.pInfo (rayons, hauteurs, nombre de pièces ₿) : bâti par S.pieces dans cryptocity-taureau.js:55, non lu.
- La portée de vue réelle du joueur (brouillard fogN/fogF par biome, environ 2,3 à 2,7 km dans maps/biomes.js) : non vérifiée map par map, ni la visibilité de nuit sous orage.
- Combien de couloirs par partie de ville (CITY.couloirs) ni la fréquence des voûtes et ouvrages V3 du canyon.
- Que ALLEGE soit faux et CANYON_OK vrai dans ml/reel : lu dans le README (lignes 37 et 79) et déduit du faux renderer, dont le Proxy rend capabilities.isWebGL2 vrai, pas vérifié en exécution.
- L'effet de SF_HIST (localStorage 'cc_sfhist') sur le tirage dans le simulateur, d'une course à l'autre.
