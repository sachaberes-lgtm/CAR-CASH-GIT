// ---------- VOITURES & ÉCONOMIE ----------
// 15 caisses, UNE SILHOUETTE CHACUNE (2026-08-05) — l'ancien roster de 24 faisait sortir 10 caisses
// du même moule `rocket` : 20 paires au-dessus de 90 % de recouvrement. Mieux vaut 15 formes qu'on
// reconnaît que 24 variantes d'une seule. ⚠ toutes au-dessus de l'ex-reine
// (657 km/h) et de plus en plus extrêmes. Le skin = le palier visuel ; `desc` = la carte de déblocage.
const CARS=[
 // ---- LA GAMME (2026-08-05, ramenée à 6 le 2026-09-24) : UNE SILHOUETTE PAR CAISSE, point. -----
 // ⚠ RÈGLE FONDATRICE, mesurée puis gravée : `shape` est DÉCLARÉ ici, une valeur unique par
 // caisse, et le constructeur refuse de deviner. L'ancienne gamme de 24 tirait son gabarit d'une
 // échelle de niveaux (`lvl>=14?'rocket':…`) : 10 caisses partageaient `rocket` et 4 `gt`, ce qui
 // donnait 20 paires au-dessus de 90 % de recouvrement de silhouette et une pire paire à 99,0 %
 // (ANTIMATIÈRE × ÉCLIPSE VII — deux caisses séparées par une teinte). Voir `voitures.html`,
 // bouton DOUBLONS : c'est là qu'on vérifie qu'on n'a pas recréé le problème.
 // Chaque ligne a une RÉFÉRENCE réelle (ou assumée fantastique) et un trait qui se lit de loin.
 {name:'LA HONTE',        shape:'epave',   color:0x7a4a2b,accent:0x4d2e1a,maxKmh:190,accel:22,turn:2.4, h:.75,w:1.90,l:4.0,spoiler:0,
  desc:'Elle démarre par pitié. Fais des thunes et oublie-la vite.'},
 // ---- LES CINQ (2026-09-24) : la gamme repart de zéro. Verdict du user : « à part la honte, tout
 // est un peu fade ». Cinq voitures VRAIES, que l'argent a rendues célèbres, cinq silhouettes qui
 // n'ont rien en commun, cinq couleurs franches — modelées au kit low-poly (voir `lpKit`).
 // `l`/`w`/`h` = les cotes RÉELLES du modèle : le hors-tout de la caisse en briques les respecte,
 // parce que les flaques de lumière, les traînées et la plume s'y calent.
 {name:'ELDORADO',        shape:'eldorado',color:0xff6fae,accent:0xe8ebef,maxKmh:232,accel:26,turn:2.6, h:1.30,w:2.02,l:5.70,spoiler:0,rar:'rare', /* (2026-10-14) à 10 000 $, carRar l'aurait classée COMMUNE */
  desc:'Rose bonbon, ailerons de requin et une banquette pour trois avocats.'},
 {name:'LE CAÏD',         shape:'caid',    color:0xbec2c8,accent:0x16171b,maxKmh:275,accel:31,turn:2.7, h:2.01,w:2.20,l:5.51,spoiler:0, /* (2026-10-19, Léo : « sans le toit, comme sur la photo exactement ») le pick-up blanc nacré de sa photo (avant : 0x7cb83f, le SUV 1,98 × 5,00) */
  desc:'Trois tonnes de cube. Personne ne t\'a jamais demandé de te pousser.'},
 {retire:1,name:'SA MAJESTÉ'},
 {name:'ROSSO 40',        shape:'rosso',   color:0xe8121c,accent:0x131417,maxKmh:420,accel:48,turn:3.05,h:1.12,w:1.98,l:4.36,spoiler:0,rar:'epique', /* (2026-10-22, Sacha : « tableau des voitures » ROSSO 40 épique à 400 000 $ : sans cette ligne le prix la ferait RARE) */
  desc:'Rouge course, aileron plateau. La caisse de rêve : 1,5 million, et chaque dollar se voit.'},
 {name:'POSTER 84',       shape:'poster',  color:0xffc414,accent:0x131417,maxKmh:480,accel:55,turn:3.15,h:1.07,w:2.00,l:4.14,spoiler:0,
  desc:'Elle était punaisée au mur de ta chambre. Maintenant, c\'est toi qui la conduis.'},
 // ---- LES CAISSES DE CONTRAT (2026-09-25) : elles ne s'achètent PAS — chacune est la récompense d'un
 // carnet de trois missions (voir `CARNETS`). Des silhouettes que tout le monde reconnaît de loin, sans
 // leur nom ni leur logo : la bulle, le combi, l'inox à portes papillon. Ajoutées EN FIN de gamme : les
 // index 0-5 des sauvegardes existantes ne bougent pas.
 {name:'LE SCARABÉE',     shape:'bulle',   color:0x5fb4c2,accent:0xf3ead6,maxKmh:215,accel:24,turn:2.75,h:1.55,w:1.57,l:4.07,spoiler:0,rar:'commun', // (2026-10-18, Léo) COMMUNE (était RARE : contrat 1) ; (même jour, Léo, sur la planche) LA BULLE → LE SCARABÉE · (2026-10-18, RONDES) refaite sur le plan coté de la 1962 : cotes réelles, le bleu de l'annonce · (2026-10-26, la V1 figée) 0x93cfd6 → 0x5fb4c2 : le bleu glacé brûlait au blanc sous la lampe, un bleu-vert franc qui tient
  desc:'Ronde comme un sou neuf. Tout le monde lui sourit, même la police.'},
 {name:'LE COMBI',        shape:'combi',   color:0x86c9b1,accent:0xf4ecd8,maxKmh:245,accel:27,turn:2.55,h:1.94,w:1.72,l:4.28,spoiler:0,rar:'commun', // (2026-10-18, Léo : « il est rare actuellement : le passer en commune ») (2026-10-18, BOÎTES) refait au plan coté, façon Fillmore — `yeux:1` = les yeux dans le pare-brise
  desc:'Des fleurs sur la tôle, la paix sur le nez, et 45 chevaux qui font de leur mieux.'},
 {name:'LA DOLORÈS',      shape:'dolores', color:0xc3c7cc,accent:0x141518,maxKmh:360,accel:40,turn:2.9, h:1.14,w:1.86,l:4.22,spoiler:0,
  desc:'Inox brossé, portes papillon. À 88 à l\'heure elle remonte le temps, paraît-il. Toi, tu vas plus vite.'},
 // ---- LES CAISSES PREMIUM (2026-09-25) : la gamme des 15 retrouvée, en BOUTIQUE (vrai argent). Hors du garage tant
 // qu'elles ne sont pas achetées (voir `garageListe`). Fiches reprises de la branche `appstore-backlog`, emojis retirés.
 {name:'CHAT POP-TART',   shape:'poptart', color:0xf6b98a,accent:0xf78fb8,maxKmh:560,accel:64,turn:3.2, h:1.35,w:1.88,l:2.85,spoiler:0, // (2026-10-09) encore un peu plus grande : ×,95 (h 1,22 · w 1,7 · l 2,58 avant) · plus volumineuse : ×,86, ailes +12 cm (h 1,14 · w 1,5 · l 2,4 avant) · la mini de rallye : plus basse, plus large (h 1,2 · w 1,36 avant)
  // (2026-10-09, Léo, fiche de la salle blanche) « plus petite » : tout le chat ×NY_K (,8) — h 1,5 · w 1,7 · l 3,0 avant
  // (2026-10-06) en voxels : 1,7 × 3 m, oreilles à 1,5 m — plus de bandes néon (`glow`) : elles barraient les murs noirs
  fx:{jet:0xff64d2,core:0xffd8f2,trail:[1.5,.35,1.1],light:0xff5ec8}, // (2026-10-07) son arc-en-ciel EN FEU DE PIXELS (voir ARC_*) + ses pixels qui scintillent (NY_PIX), à la nitro et en vol — branché par NYAN.on
  desc:'Une pâtisserie industrielle avec une tête de chat et quatre roulettes. Personne n\'a demandé pourquoi. Tout le monde a demandé comment.'},
 {retire:1,name:'REQUIN'}, /* (2026-10-21, Sacha : « suprime la voiture shark dans la boutique ») RETIRÉ : remplacé en boutique par LE SQUALE (le requin de Léo) ; sa ligne reste (index de sauvegarde) */
 {retire:1,name:'COMÈTE',          shape:'proto',   color:0x3c16ae,accent:0xffd75e,maxKmh:657,accel:75,turn:3.25,h:1.2,w:2.08,l:5.05,spoiler:1, /* (2026-10-27, au kit) h = sa vraie hauteur de toit ; ni `glow` (deux traits blancs sur la tôle) ni `rocket` (deux tubes gris génériques) : ses propulseurs sont dans son gabarit */
  desc:'Coin furtif, bulle de verre, dérive dorsale. La reine du ciel, et elle le sait. Personne ne l\'a jamais vue de face.'},
 {retire:1,name:'FORMULE OR'},
 {retire:1,name:'LE MANS 24'},
 {retire:1,name:'EL PATRON'},
 {rar:'epique',name:'ACIDE',           shape:'tuner',   color:0x5cff1e,accent:0x123a08,maxKmh:520,accel:60,turn:3.18,h:1.17,w:1.93,l:4.22,spoiler:0,
  fx:{jet:0x7cff28,core:0xe8ffb4,trail:[.52,1.55,.10],light:0x6fe81e},
  desc:'Un coin des années 80 passé au bain d\'acide : une ampoule qui luit sur le dos, et l\'échappement qui crache vert.'},
/* ===== LES FICHES DES 50 — DÉBUT ===== */
 /* (2026-10-02, Sacha, capture du garage : « supprimer ces 6 voitures du jeu, elles sont pas intéressantes ») SIX COMMUNES RETIRÉES —
    la pizza, le monospace, le break suédois, la boule, le glacier, le tout-terrain soviétique : `retire:1`. Elles ne sont plus NULLE
    PART pour le joueur (garage, compteurs des familles, objectif, pastille « à ta portée », équipement — voir carRetiree). ⚠ Leur
    LIGNE reste : la sauvegarde désigne les caisses par leur INDEX (`equipped`, `owned`) — ôter six lignes ici décalerait toutes les
    suivantes et donnerait à chacun la caisse d'un autre. Qui en avait acheté une est remboursé au chargement (voir `san`).
    (2026-10-18) Toutes les caisses retirées sont RÉDUITES à `{retire:1,name:'…'}` : plus de cotes, de couleurs ni de punchline — aucune boucle
    ne lit la fiche d'une retirée (carRetiree d'abord). Le NOM reste : la mission qui la donne et le message de remboursement l'écrivent. */
 {retire:1,name:'LA POSTIÈRE'},
 {retire:1,name:'LA DEUCHE'},
 {retire:1,name:'LE TAXI JAUNE'},
 {name:'LA PIZZA EXPRESS',color:0xf4f1ea,accent:0xd8261e,maxKmh:190,accel:21,turn:2.9,h:1.45,w:1.5,l:3.4,spoiler:0,shape:'b_pizza',rar:'legendaire',
  desc:'30 minutes chrono ou la pizza est offerte. Spoiler : elle n\'a jamais été offerte.'},
 {retire:1,name:'LE MONOSPACE'},
 {retire:1,name:'LE BREAK SUÉDOIS'},
 {retire:1,name:'LA BOULE'},
 {retire:1,name:'LE GLACIER'},
 {retire:1,name:'LE TOUT-TERRAIN SOVIÉTIQUE'},
 {retire:1,name:'LE GRILLE-PAIN'},
 {name:'LE CORBILLARD',color:0x0d0d10,accent:0xe9ecf0,maxKmh:200,accel:22,turn:2.4,h:1.55,w:2,l:6,spoiler:0,shape:'d_corbillard',rar:'rare',
  desc:'Six mètres de classe funèbre. Ceux qu\'il double finissent à l\'arrière, c\'est la tradition.'},
 {retire:1,name:'LA SANS-PERMIS'},
 {retire:1,name:'L\'AUTO-ÉCOLE'},
 {retire:1,name:'LE PICK-UP DU FERMIER'},
 {retire:1,name:'L\'AMBASSADEUR'},
 {name:'LE CHARGEUR',color:0x050608,accent:0x121316,maxKmh:290,accel:32,turn:2.6,h:1.48,w:1.9,l:5.1,spoiler:0,shape:'a_chargeur',rar:'rare',
  desc:'Quatre portes, parce qu\'il faut bien emmener quelqu\'un pour voir la tête des autres.'},
 {name:'LE DÉFIEUR',color:0xffd000,accent:0x121212,maxKmh:310,accel:34,turn:2.5,h:1.45,w:1.92,l:5.02,spoiler:0,shape:'a_defieur',rar:'rare', // (2026-10-17, Sacha : « la voiture de Transformers, la bonne couleur de base ») orange 0xff7a14 → JAUNE RALLYE, voir SHAPES.a_defieur
  desc:'Né en 1970, jamais sorti de la puberté. Il te défie au feu rouge, puis au suivant, puis au suivant.'},
 {name:'LA BAVAROISE',color:0xf2f2f0,accent:0x3a2a8c,maxKmh:280,accel:31,turn:2.9,h:1.37,w:1.68,l:4.35,spoiler:0,shape:'b_bavaroise',rar:'rare',
  desc:'Homologuée pour la route, élevée sur circuit. Elle perd patience avant toi.'},
 {retire:1,name:'LA SUÉDOISE TURBO'},
 {retire:1,name:'LE QUATTRO'},
 {retire:1,name:'LA SILENCIEUSE'}, /* (2026-10-27, Léo : « la Silencieuse, on peut la virer du jeu, on n'en veut plus du tout ») RETIRÉE : sa ligne reste (index de sauvegarde), sans gabarit elle ne revient pas ; le défi secret « partie sans son ni musique » (id 'silence') disparaît avec elle (m2Dispo) */
 {retire:1,name:'LE TRIDENT'},
 {retire:1,name:'LA HUIT'},
 {name:'LE SAMOURAÏ',color:0x3b2c4e,accent:0x16181c,maxKmh:300,accel:33,turn:2.9,h:1.36,w:1.79,l:4.6,spoiler:0,shape:'d_samourai',rar:'rare',
  desc:'Quatre feux ronds, un aileron, zéro pitié. Tu le vois une fois : dans ton rétro, en train de partir.'},
 {name:'LA VETTE',color:0xd01a22,accent:0x141414,maxKmh:290,accel:32,turn:2.8,h:1.18,w:1.8,l:4.48,spoiler:0,shape:'d_vette',rar:'rare',
  desc:'Phares cachés, V8 pas caché du tout. Elle se lève pour voir la route, puis elle la mange.'},
 {retire:1,name:'LE CHÂTELAIN'},
 {name:'LA GRANDE ANGLAISE',color:0x0f4527,accent:0xe9ecf0,maxKmh:320,accel:35,turn:2.6,h:1.4,w:1.94,l:4.8,spoiler:0,shape:'e_anglaise',rar:'rare',ordre:1e8, /* (10/10, Léo, salle blanche : la DERNIÈRE des RARES, après LA ZED — son prix ne bouge pas) */
  desc:'Deux tonnes et demie de cuir, de noyer et de W12. Elle ne dépasse pas : elle congédie.'},
 {name:'LE CHARGEUR 69',color:0x0e0e10,accent:0xe9ecf0,maxKmh:360,accel:40,turn:2.55,h:1.35,w:1.95,l:5.28,spoiler:0,shape:'a_chargeur69',rar:'rare',
  desc:'Phares cachés, intentions aussi. Quand la calandre s\'ouvre dans ton rétro, c\'est déjà trop tard.'},
 {retire:1,name:'L\'ÉTALON'},
 {name:'LA QUEUE DE CANARD',color:0xf2efe6,accent:0x1f5fd8,maxKmh:340,accel:37,turn:3,h:1.32,w:1.65,l:4.15,spoiler:0,shape:'b_canard',rar:'epique', // (2026-10-18, Léo : « mets-la en Epic ») ÉPIQUE (était RARE)
  desc:'Le moteur est derrière, le becquet aussi. Toi, tu seras devant — c\'est tout ce qui compte.'},
 // (2026-10-18, Léo : « enlève la daytona du main ») RETIRÉE : la ligne reste (les index de sauvegarde ne bougent pas), qui l'avait
 // achetée est remboursé (550 000 $) et repart en LA HONTE s'il roulait avec (voir LES CAISSES RETIRÉES dans SAVE).
 {retire:1,name:'LA DAYTONA',color:0xd01a1a,accent:0x121316,maxKmh:360,accel:40,turn:2.8,h:1.25,w:1.76,l:4.42,spoiler:0,shape:'b_daytona',rar:'epique',
  desc:'Deux mètres de capot, douze cylindres dessous. Le reste de la voiture est juste là pour le suivre.'},
 {name:'LA TAURINE',color:0xff8a14,accent:0x121212,maxKmh:370,accel:41,turn:2.9,h:1.05,w:1.78,l:4.36,spoiler:0,shape:'c_taurine',rar:'epique',
  desc:'Elle a des cils. Et un V12 juste derrière ta nuque. Elle te fait les yeux doux, pas de cadeaux.'},
 {name:'LA STRATOS',color:0xf4f4f0,accent:0x1ea050,maxKmh:340,accel:38,turn:3.2,h:1.11,w:1.75,l:3.71,spoiler:0,shape:'c_stratos',rar:'epique',
  desc:'Trois titres mondiaux, un mètre onze de haut. La visière, c’est pour voir les autres dans le rétro.'},
 {name:'LA NOCTAMBULE',color:0xf4f4f0,accent:0x3b2a8c,maxKmh:360,accel:40,turn:2.9,h:1.37,w:1.73,l:4.63,spoiler:0,shape:'d_batmobile',rar:'rare',
  desc:'Un aileron si grand qu\'on l\'a interdite sur route. Toi, tu roules dans le ciel : personne ne dira rien.'},
 {retire:1,name:'LA PAGODE'},
 {retire:1,name:'LA DÉESSE'},
 {name:'L\'AIGLE DE FEU',color:0x0b1022,accent:0xd9a520,maxKmh:340,accel:38,turn:2.6,h:1.25,w:1.85,l:5.1,spoiler:0,shape:'e_aigle',rar:'rare', // (2026-10-09, Léo, fiche de la salle blanche) ÉPIQUE → RARE
  desc:'Un oiseau d\'or sur le capot, un shérif dans le rétro. Le shérif n\'a jamais rattrapé l\'oiseau.'},
 {retire:1,name:'LA ZED'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 {name:'LA FÉLINE',color:0xeee3c6,accent:0xe9ecf0,maxKmh:320,accel:36,turn:2.8,h:1.22,w:1.66,l:4.45,spoiler:0,shape:'e_feline',rar:'legendaire',
  desc:'Un capot si long qu\'il arrive au virage avant toi. Élue plus belle du monde, et elle le sait.'},
 {name:'LA RAIE',color:0xc4161c,accent:0x131417,maxKmh:360,accel:40,turn:2.7,h:1.21,w:1.75,l:4.64,spoiler:0,shape:'e_raie',rar:'epique', // (2026-10-18, Sacha) REMISE dans le jeu (retirée le 14/10) : épique à 2,5 M, comme avant le 6/10
  desc:'Une taille de guêpe, des hanches de starlette et un V8 sous le capot. Hollywood a pris la route.'},
 {name:'L\'ÉTERNELLE',color:0x1d4fd8,accent:0x121418,maxKmh:620,accel:69,turn:3,h:1.21,w:2.04,l:4.54,spoiler:0,shape:'a_eternelle',rar:'legendaire',
  desc:'Seize cylindres, quatre turbos, zéro remords. Le temps, lui, attend qu\'elle passe.'},
 {name:'LE TRÔNE CENTRAL',color:0xff7a10,accent:0x121316,maxKmh:560,accel:62,turn:3,h:1.14,w:1.82,l:4.29,spoiler:0,shape:'b_trone',rar:'legendaire',
  desc:'Un seul siège, au milieu. Les passagers regardent de côté : ils ne sont pas là pour conduire.'},
 {name:'LE SPECTRE',color:0x1a1d22,accent:0x5cff1e,maxKmh:560,accel:62,turn:3,h:1.13,w:2,l:4.5,spoiler:0,shape:'c_spectre',rar:'epique',
  desc:'Tu l’as vu passer ? Non. Personne ne l’a jamais vu passer. D’où le nom.'},
 {name:'LE BLINDÉ NOIR',color:0x17181b,accent:0x4a4e56,maxKmh:520,accel:58,turn:2.6,h:1.6,w:2.6,l:4.6,spoiler:0,shape:'d_chevalier',rar:'legendaire',
  desc:'Pas de capot, pas de pitié, pas de feu rouge. Quand il passe, la rue se range toute seule.'},
 {name:'LE MUR DU SON',color:0xf4f4f0,accent:0xd9a520,maxKmh:620,accel:68,turn:2.4,h:1.4,w:2.2,l:6,spoiler:0,shape:'e_murduson',rar:'legendaire',
  desc:'Deux réacteurs de chasseur, zéro complexe. Le bang que tu entends, c\'est elle qui passe.'},
 {name:'LE DRAGON D\'OR',color:0xd9a520,accent:0x121316,maxKmh:650,accel:72,turn:2.9,h:1.1,w:2.1,l:4.7,spoiler:0,shape:'e_dragon',rar:'legendaire',
  desc:'Il dormait sur un tas d\'or. Maintenant il roule dessus, et il crache du feu à chaque rapport.'},
 {name:'LE MASTODONTE',color:0x1463ff,accent:0xff7a14,maxKmh:280,accel:31,turn:2.4,h:3,w:2.6,l:4.8,spoiler:0,shape:'a_mastodonte',rar:'defi',
  desc:'Il ne double personne : il passe dessus. Les dos d\'âne, c\'est lui qui les fabrique.'},
 {retire:1,name:'LA GROUPE B'}, /* (2026-10-18 soir, Sacha : « enlève la groupe B ») RETIRÉE : sa ligne reste (index de sauvegarde), qui l'avait est remboursé par `san` ; son gabarit b_groupeb reste dans SHAPES */
 {name:'LE HOT ROD',color:0xc8141c,accent:0xe9ecf0,maxKmh:380,accel:42,turn:2.5,h:1.4,w:1.7,l:3.9,spoiler:0,shape:'c_hotrod',rar:'defi',
  desc:'Un capot ? Pour cacher un compresseur pareil ? Tu rigoles. Même les flammes sont d’époque.'},
 {retire:1,name:'LA PUCE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
/* ===== LES FICHES DES 50 — FIN ===== */
 // (2026-09-27) LA CAISSE-NUAGE — la récompense de la CAMPAGNE NUAGES : un petit cumulus monté comme une vraie voiture (châssis, roues,
 // feux sobres), taillé dans la même ouate que le ciel. Elle ne s'achète pas : on la CHASSE au niveau 10 (voir fantomeTick) et elle
 // devient à toi quand tu tiens son sillage une seconde. Ajoutée APRÈS le bloc généré des 50 : aucun index existant ne bouge.
 {retire:1,name:'LA CAISSE-NUAGE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 // (2026-09-27) LE LINGOT — la récompense de la CAMPAGNE VILLE : un lingot d'or de 1 kg (poinçon 999,9) monté sur roues. Il ne s'achète
 // pas : on le GAGNE en battant le banquier au portail du niveau 10 (voir banquierTick). Ajouté en dernier : aucun index ne bouge.
 {retire:1,name:'LE LINGOT'}, /* (2026-10-18 soir, Sacha : « enlève la gold bar ») RETIRÉ : sa ligne reste (index de sauvegarde), qui l'avait est remboursé par `san` ; son gabarit `lingot` reste dans SHAPES */
 // (2026-10-02) L'ORIGAMI — Sacha, photo du pick-up d'inox : « mets cette voiture dans le jeu, fais-la exceptionnellement belle et parfaite ».
 // Le pick-up plié dans une feuille d'acier, sans son nom ni son logo (comme toute la gamme). Cotes réelles : 5,68 × 2,03 × 1,79 m.
 // Ajoutée EN DERNIER : aucun index de sauvegarde ne bouge. Son sillage est un courant froid (elle est électrique).
 {name:'L\'ORIGAMI',shape:'origami',color:0xc9cdd2,accent:0x16181c,maxKmh:380,accel:42,turn:2.6,h:1.79,w:2.03,l:5.68,spoiler:0,rar:'epique',
  fx:{jet:0xa8dcff,core:0xffffff,trail:[.62,1.08,1.5],light:0x9fd4ff},
  desc:'Une feuille d\'inox, sept plis, zéro courbe. Vitres incassables, paraît-il : on a essayé avec une boule, on n\'en parle plus.'},
 // (2026-10-06) ATCHOUM — Léo : « la voiture tuning McQueen orange qui crache du feu et éternue des flammes, elle ressemble un peu à la
 // cabossée ». Un stock-car de piste ovale, tuné et cabossé (voir SHAPES.atchoum) ; son feu : ATCH / atchTick. Ajoutée EN DERNIER.
 {name:'ATCHOUM',shape:'atchoum',color:0xff9020,accent:0x141417,maxKmh:300,accel:34,turn:2.7,h:1.24,w:1.95,l:4.32,spoiler:0,rar:'epique', // (2026-10-09, Léo, fiche de la salle blanche) RARE → ÉPIQUE
  fx:{jet:0xff7a24,core:0xffe08a,trail:[1.5,.62,.18],light:0xff8030},
  desc:'Elle a pris froid au dernier tour : depuis, elle éternue du feu. Ne reste jamais devant elle.'},
 // (2026-10-08) LE SQUALE — Léo : la voiture au sourire de requin de son sketch du garage, bleu clair, sportive, carrée aux angles
 // arrondis, les phares en yeux (voir SHAPES.squale). Ajoutée EN DERNIER (les index de sauvegarde ne bougent pas).
 {name:'SQUALE',shape:'squale',color:0x5e666d,accent:0x2a3036,maxKmh:340,accel:40,turn:2.7,h:1.66,w:2.52,l:4.5,spoiler:0,rar:'legendaire', // (2026-10-21, Sacha) ÉPIQUE → LÉGENDAIRE : elle est en boutique payante, où toutes les caisses le sont (carRar lit cette fiche avant le prix) — (2026-10-09, Léo, fiche de la salle blanche) RARE → ÉPIQUE
  fx:{jet:0xbfe4ff,core:0xffffff,trail:[.75,.85,.95],light:0xcfe8ff},
  desc:'Toujours le sourire. Surtout quand elle te double.'},
 // (2026-10-09, Léo : « fais-en une hyper abstraite mais travaillée, concept, ajoute-la à la liste ») L'ABSTRAITE (voir SHAPES.abstraite). Ajoutée EN DERNIER (les index de sauvegarde ne bougent pas).
 {retire:1,name:'L\'ABSTRAITE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 // (2026-10-10, Léo : « une nouvelle abstraite, en glace, genre iceberg, stylisée, dynamique ») L'ICEBERG (voir SHAPES.iceberg). Ajoutée EN DERNIER (les index de sauvegarde ne bougent pas).
 {name:'L\'ICEBERG',shape:'iceberg',color:0x52c8f0,accent:0xf4faff,maxKmh:415,accel:49,turn:3.1,h:1.15,w:2.1,l:4.75,spoiler:0,rar:'epique',
  fx:{jet:0x9fe8ff,core:0xffffff,trail:[.75,1.15,1.45],light:0x8fe0ff},
  desc:'Un iceberg fendu en trois : deux blocs de glace sur les roues, une bulle au milieu pour un seul pilote. Le vent passe entre.'},
 // (2026-10-10, Léo : « une voiture flamme — dur, vas-y dur ; une autre technique ; une forme de voiture originale, associée au feu ») LA FOURNAISE (voir SHAPES.fournaise). Ajoutée EN DERNIER.
 {retire:1,name:'LA FOURNAISE'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 // (2026-10-10, Léo : « une abstraite type EAU — l'élément, pas une bouteille ; quelque chose de vraiment méchant ») LA DÉFERLANTE. RETIRÉE le 2026-10-15 (Sacha : « elle ne respecte pas les règles du low-poly », comme LA MERCURE) : son gabarit est effacé, la ligne reste pour les index.
 {retire:1,name:'LA DÉFERLANTE'},
 // (2026-10-11, Léo, « retoucheur de voitures » : la planche générée, « génère la mercure », « génère-la en 3D dans mon jeu ») LA MERCURE
 // : l'hypercar en mercure liquide. RETIRÉE le 2026-10-15 (Sacha : hors des règles du low-poly) : son gabarit est effacé, la ligne reste pour les index.
 {retire:1,name:'LA MERCURE'},
 // (2026-10-14, Léo : « fais une voiture tête de doge » · « dans le même esprit que la nyan cat ») LE DOGE (voir SHAPES.doge) : le mème du
 // shiba en voxels, regard en coin, queue en tire-bouchon, et les phrases du mème qui surgissent autour de lui. Ajoutée EN DERNIER.
 // (2026-10-26) REDESSINÉ EN POLY (SHAPES.doge v3) : la grosse tête taillée en pans plans, ~2 800 triangles au lieu de 46 000 ; `?doge=ancien` rend la v2.
 {name:'LE DOGE',shape:'doge',color:0xd99545,accent:0xf6e6c6,maxKmh:440,accel:53,turn:3.1,h:2.0,w:2.0,l:2.3,spoiler:0,rar:'epique',
  fx:{jet:0xffc83a,core:0xfff2c0,trail:[1.5,1.1,.3],light:0xffb43a,wow:1}, // sa traînée : les phrases du mème (voir LA TRAÎNÉE WOW)
  desc:'Wow. Très tête. Beaucoup roues. Il te regarde de côté, et il a raison.'},
 // (2026-10-16, Léo : « fais une belle Porsche Cayenne rose Barbie », puis « un rose plus pâle, vraiment Cayenne ») LA POUPÉE (voir SHAPES.poupee) :
 // le grand SUV de luxe allemand, en rose poupée pâle. Pas de marque (ni le nom, ni le blason) : un petit cœur à la place. Ajoutée EN DERNIER.
 // (2026-10-17, Léo : « enlève la barbie » → « du jeu ») elle avait été RETIRÉE, et remboursée (4,2 M$) à qui l'avait achetée ; (2026-10-18, Sacha) la
 // voilà REMISE dans le jeu : les remboursements déjà versés restent acquis, on peut la racheter 4,2 M$.
 // (2026-10-18) RETIRÉE À NOUVEAU : Sacha l'avait remise dans le jeu (allègement, 20cda983) ; Léo : « on l'enlève ». Qui l'avait achetée est
 // remboursé (4,2 M$) et repart en LA HONTE s'il roulait avec (voir LES CAISSES RETIRÉES dans SAVE).
 {retire:1,name:'LA POUPÉE',shape:'poupee',color:0xf49bcb,accent:0xfdf0f6,maxKmh:445,accel:54,turn:3.1,h:1.7,w:2.0,l:4.93,spoiler:0,rar:'epique',
  fx:{jet:0xff5cb0,core:0xffe2f1,trail:[1.5,.5,1.05],light:0xff5cb0},
  desc:'Rose poupée, cuir crème, 650 chevaux. Elle se gare en double file, et c\'est la file qui s\'excuse.'},
 // (2026-10-16, Léo : « Taycan 4S » ; puis « trop style jouet, mimétisme » → « blanche, laquée comme une vraie, lissée, tous les traits
 // du plan », nom « la perle ») LA PERLE (voir SHAPES.perle) : la berline électrique, BLANC LAQUÉ, refaite sur un plan coté. Elle
 // remplace L'ONYX (noire). Pas de marque (ni le nom, ni le blason). Électrique : pas de pots, deux fentes bleues dans le diffuseur.
 {name:'LA PERLE',shape:'perle',color:0xf3f3f1,accent:0xd31f2a,maxKmh:450,accel:56,turn:3.2,h:1.38,w:1.97,l:4.96,spoiler:0,rar:'epique',
  fx:{jet:0x6fd6ff,core:0xe8fbff,trail:[.3,1.0,1.5],light:0x46c8ff},
  desc:'Blanc laqué, zéro bruit, 571 chevaux. Elle passe sans un son, et tout le monde se retourne quand même.'},
 /* ===== LES NOUVELLES VOITURES (2026-10-18, Léo : « actuellement la seule commune du jeu est LA HONTE, ajoute… ») — HUIT PLACES RÉSERVÉES
    (index 79-86), CACHÉES (`retire:1`) jusqu'à ce que la discussion qui modèle la caisse la livre : elle remplace SA ligne (nom, gabarit,
    fiche) et retire `retire:1`. Les commentaires « · » entre les places sont là pour que trois discussions en parallèle fusionnent sans conflit.
    ⚠ NE PAS prendre ces index pour une autre caisse : la suivante est la 87. ===== */
 /* · */
 /* · */
 /* · */
 {name:'LA CABOSSÉE',shape:'simpson',color:0xd090d0,accent:0x4b474f,maxKmh:205,accel:23,turn:2.5,h:1.56,w:1.84,l:4.95,spoiler:0,rar:'commun', // 79 — discussion BOITES : la berline rose des Simpson, telle que dans la série (SHAPES.simpson)
  desc:'Rose bonbon, l\'aile avant gauche froissée depuis toujours, l\'antenne en zigzag. Elle démarre une fois sur deux, mais elle démarre.'},
 /* · */
 /* · */
 /* · */
 {name:'LA DOLCE VITA',shape:'cinq',color:0x4a7599,accent:0x9d998e,maxKmh:200,accel:22,turn:2.9,h:1.50,w:1.63,l:3.43,spoiler:0,rar:'commun', // 80 — discussion RONDES : la 500 (2007) en finition « 1957 » de la photo de Léo — bleu ciel, toit blanc, rétros blancs, jantes à cercle crème (SHAPES.cinq, sur le plan coté)
  desc:'Toit blanc, robe céleste, moustache chromée. Elle se gare dans un mouchoir de poche, et elle repart avec le mouchoir.'},
 /* · */
 /* · */
 /* · */
 {name:'LA FIDÈLE',shape:'corolla',color:0x9fa3a9,accent:0x17181b,maxKmh:215,accel:24,turn:2.7,h:1.44,w:1.78,l:4.63,spoiler:0,rar:'commun', // 81 — discussion JAPONAISES : la berline compacte de 2019 (la ligne de la Toyota Corolla E210), argent (SHAPES.corolla)
  desc:'La voiture la plus vendue de la planète. Elle ne tombe jamais en panne, ce qui est presque suspect.'},
 /* · */
 /* · */
 /* · */
 {name:'LE BAROUDEUR',shape:'wrangler',color:0x464950,accent:0x141414,maxKmh:210,accel:23,turn:2.4,h:1.85,w:1.89,l:4.59,spoiler:0,rar:'commun', // 82 — discussion BOITES : Jeep Wrangler JL 4 portes (2018), relevée sur son élévation (SHAPES.wrangler)
  desc:'Sept fentes, quatre roues motrices, zéro route nécessaire. Il ne contourne pas les obstacles : il monte dessus.'},
 /* · */
 /* · */
 /* · */
 {name:'LA CERISE',shape:'mx5na',color:0x8c0a14,accent:0x141416,maxKmh:225,accel:26,turn:3,h:1.23,w:1.68,l:3.97,spoiler:0,rar:'commun', // 83 — discussion JAPONAISES : le roadster d'Hiroshima de 1989 (la ligne de la Mazda MX-5 NA), rouge classique, capote repliée, PHARES ESCAMOTABLES qui se lèvent (SHAPES.mx5na, `MX5PH`)
  desc:'Elle ouvre les yeux à chaque coup de nitro. Une tonne, cent quinze chevaux, et le plus grand sourire du parking.'},
 /* · */
 /* · */
 /* · */
 {name:'LE ROUGE-GORGE',shape:'robin',color:0x1d74cc,accent:0x1a1a1d,maxKmh:230,accel:26,turn:2.6,h:1.44,w:1.42,l:3.37,spoiler:0,rar:'rare', // 84 — discussion RONDES : la Reliant Robin Mk1 (1973-81), trois roues, la roue AVANT seule au milieu (SHAPES.robin, `w1F`)
  desc:'Trois roues, de la fibre de verre et une confiance aveugle. Dans les virages, elle penche ; toi, tu pries.'},
 /* · */
 /* · */
 /* · */
 {name:'LA LAME',shape:'mx5rf',color:0x868b92,accent:0x141416,maxKmh:275,accel:31,turn:3,h:1.24,w:1.73,l:3.92,spoiler:0,rar:'rare', // 85 — discussion JAPONAISES : le roadster d'Hiroshima en targa « fastback » (la ligne de la Mazda MX-5 RF, 2016), argent, toit fermé : ses deux arceaux et la lunette au fond du tunnel (SHAPES.mx5rf)
  desc:'Le même petit roadster, avec un toit qui se range en treize secondes. Il ne pleut jamais assez vite pour la rattraper.'},
 /* · */
 /* · */
 /* · */
 {retire:1,name:'LE TOFU'}, /* (2026-10-22, Sacha : « tableau des voitures » : à supprimer) RETIRÉE ; sa ligne reste (index de sauvegarde), son prix dans CAR_UNLOCK sert au remboursement */
 /* · */
 /* · */
 /* · */
 {name:'LA BÊTE',shape:'pikes',color:0xf1f2f4,accent:0x1a2240,maxKmh:380,accel:46,turn:3.2,h:1.30,w:2.0,l:4.5,spoiler:0,rar:'epique', // 87 — discussion JAPONAISES : la bête de course de côte de 2013 (la ligne de la Peugeot 208 T16 Pikes Peak), livrée « un peu boisson énergisante » sans logo (SHAPES.pikes)
  desc:'875 chevaux pour 875 kilos, et un aileron plus large qu\'un canapé. Elle a avalé la montagne en huit minutes : le sommet ne s\'en est jamais remis.'},
 /* · */
 /* · */
 /* · */
 {name:'LA ZAGAIE',shape:'zagato',color:0xc7753c,accent:0x2a2c31,maxKmh:500,accel:58,turn:3.1,h:1.17,w:1.93,l:4.22,spoiler:0,rar:'epique', // 88 — (2026-10-22, Léo : « zagato imite exactement la forme de la voiture orange ») la 5-95 de Zagato (2014, un exemplaire) : gueule creuse, vitrage noir qui s'enroule, nacelle de toit, queue coupée net, cuivre mat (SHAPES.zagato)
  desc:'Une pièce unique, taillée comme une lance : la gueule grande ouverte, le toit noir qui s\'enroule, la queue coupée net.'},
 /* · */
 /* · */
 /* · */
 {name:'LE LOUP',shape:'countach',color:0xb4b9c2,accent:0x2a2c31,maxKmh:500,accel:58,turn:3.0,h:1.07,w:2.0,l:4.46,spoiler:0,rar:'legendaire', // 89 — (2026-10-22, Léo : « genere la blanche ressemblance 11/10 ») la Countach blanche du film, l'ÉPAVE : aile avant gauche écrasée et son phare entrouvert, phare droit arraché, pare-chocs déchiré et sa lame basse qui pend, portière et quartiers froissés, portes à ciseaux (SHAPES.countach ; `?epave=0` : la Countach intacte)
  desc:'Blanche, basse, taillée à la hache, et passée sous un camion. Les portes se lèvent encore.'},
 /* · */
 /* · */
 /* · */
 {retire:1,name:'NOUVELLE 90',shape:'epave',rar:'epique', // 90 — RÉSERVÉE, LIBRE (22/10 : LE LOUP a pris la 89) — la prochaine caisse la prend
  desc:'(place réservée)'},
];
// ---- VALEUR D'UNE PIÈCE — UNE ENTRÉE PAR PALIER MOTEUR (30) ---------------------------------
// ⚠ Cette table est indexée par `engTier` depuis que les PIÈCES portent la progression, mais elle
// avait gardé les 24 entrées taillées pour les 24 VOITURES : avec 30 paliers elle saturait sur les
// six derniers, et surtout ses valeurs hautes (jusqu'à 15 milliards) étaient calibrées pour un
// palier de VOITURE, pas de moteur — les 10 anciens paliers n'en touchaient que les 10 premières
// cases (10 → 40 000). La reprendre telle quelle aurait multiplié la valeur d'une pièce par 375.
// RECALAGE À EFFORT ÉGAL : le palier 18 (731 pièces) vaut 39 000, soit ce que valait l'ancien
// dernier palier (760 pièces → 40 000). Ce qui est en dessous est inchangé à effort comparable ;
// ce qui est au-dessus prolonge la rampe. Série 1-1,6-2,5-4-6,2 par décade (ratio ×1,585,
// 5 marches par décade) : des nombres qui se lisent, sur 6 décades.
/* ⚠ ÉCONOMIE v4 — ALIGNÉE SUR LE PRIX DES CAISSES (2026-09-26, user : « après un bon score j'ai gagné trop d'argent, équilibrage
   à faire pour rester aligné sur la valeur des voitures »). Mesuré sur sa capture : une grande partie (palier moteur 30, niveau 6,
   119 figures) versait 401 MILLIARDS — la pièce valait ×1,585 par palier (6,2 M au palier 30) alors que la caisse la plus chère
   coûte 2,5 M. Désormais la pièce monte DOUCEMENT (×1,06 par palier : 3 → 16 $). Une partie de débutant rapporte ~1-2 k (une
   COMMUNE en une à trois parties), une très grande partie ~1 M (une ÉPIQUE en deux ou trois) — les 16 k des rares se méritent. */
const DENOMS=[3,3,3,4,4,4,4,5,5,5,
              5,6,6,6,7,7,8,8,9,9,
              10,11,11,12,12,13,14,15,16,16]; // 30 paliers moteur
