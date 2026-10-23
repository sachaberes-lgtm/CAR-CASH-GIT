/* ============================================================================
   DÉBLOCAGE DES 24 VOITURES (2026-08-03)
   Le MOTEUR est la progression DANS une partie (il repart à zéro à chaque run) ; la VOITURE est la
   progression ENTRE les parties. Les deux échelles ne se marchent donc plus dessus — c'est pour ça
   que les conditions portent toutes sur des compteurs PERSISTANTS (`SAVE.d.ex`, + le record `best`),
   jamais sur l'argent de la partie en cours.
   TROIS FAMILLES mélangées, pour que 24 déblocages ne se ressemblent pas :
     `cash`  → ton RECORD de partie (la boucle de base, ça enseigne le jeu)
     `eng`   → le plus haut PALIER MOTEUR jamais atteint (récompense la montée en course)
     le reste → des DÉFIS nommés (figures, gaps, bumps, zones, chaîne, vitesse, Survivant)
   ⚠ Les caisses ne se débloquent PLUS dans l'ordre : chacune a sa condition propre, on peut très bien
   décrocher la 15e avant la 12e. Tout ce qui gate une caisse doit donc passer par `carUnlocked(i)` —
   comparer à `bestCar` (qui n'est plus qu'un indicateur d'avancement) laisserait passer des trous.
   ⚠ La caisse est COSMÉTIQUE : rien ici ne touche à la vitesse ni à la valeur des pièces. */
/* ---- COMMENT ON OBTIENT UNE CAISSE (refonte 2026-08-17) --------------------------------------
   Trois voies, et une seule par caisse :
     `p`      = un PRIX, payé au compte en banque (trois caisses sur cinq).
     `k:'aura'` = un RANG d'aura. Ces deux-là ne s'achètent PAS : c'est la récompense du style,
                  et c'est ce qui empêche la banque de tout ouvrir à elle seule.
     `k:'surv'` = le trophée. ROSSO 40 se gagne en gagnant, point.
   ⚠ l'échelle des prix est géométrique (×5 environ) parce que l'économie du jeu l'est : les paliers
   moteur vont de 5 à 2 854 et la valeur d'une pièce suit. Une échelle linéaire rendrait les
   premières caisses interminables et les dernières gratuites. */
const CAR_UNLOCK=[
  /* (2026-10-06, Léo : « fiche-voitures-cash-car.txt — applique les changements ») LA GAMME RESSERRÉE : 43 caisses jouables. Prix et
     familles de la fiche ; les 25 supprimées gardent leur ligne (`retire:1` dans CARS, leur prix ici sert au REMBOURSEMENT de san) ;
     `k:'bientot'` = un DÉFI encore à écrire (COMÈTE : verrouillée, « DÉFI À VENIR ») ; `k:'pubs'` = L'ÉTERNELLE,
     100 pubs regardées (`SAVE.d.ex.pubs` : seule l'édition des portails, retirée le 14/10, avait des pubs). */
  null,                 // LA HONTE — le point de départ, jamais verrouillée
  /* ⚠ ÉCONOMIE v3 (2026-09-25) — LES PRIX SONT CALÉS SUR UNE MESURE, PLUS SUR UNE INTUITION. Le pilote
     automatique (`dbgAuto`, aucune figure, aucun nitro) encaisse ~2 600 $ en une minute avant de tomber ;
     un débutant fait 200 à 1 000 $. L'ancien 25 000 $ demandait donc ~30 parties pour la 1re caisse :
     un mur. Cible : la 1re caisse en 10-15 min de jeu (parties + primes de contrat), puis ×6-7 par marche. */
  {p:40e3},             // ELDORADO — (2026-10-17, Sacha : « pas 3 000 dollars, elle doit coûter 40 000 dollars » — 3 000 → 40 000, juste sous LE CAÏD (50 000) ; le même jour LE CHARGEUR (60 000), LA BAVAROISE (100 000) et LE DÉFIEUR (120 000) montent aussi : l'ELDORADO reste la 1re caisse à l'argent) — (2026-10-14 soir, Sacha : option A de passation/ECONOMIE.md — 10 000 → 3 000 : la 1re caisse en 3-4 parties de joueur moyen, aucun gain ne change) — (2026-10-14, équilibrage : 24 000 → 10 000 — la 1re caisse à l'argent depuis le retrait des communes : un débutant l'avait en ~58 parties, ~22 désormais) — (2026-09-26) RARE : les 14 COMMUNES (1 500 → 15 000 $) prennent le rôle de « première caisse »
  {p:180e3},            // LE CAÏD — RARE (2026-10-06 : 60 000 → 50 000) ; 50 000 → 180 000 : c'est le HUMMER EV désormais ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille)
  {p:180e3},            // (2026-10-06 : RETIRÉE, le prix sert au remboursement) SA MAJESTÉ — RARE, la plus chère des rares : l'argent achète la Rolls, c'est même à ça qu'il sert
  {p:4e6},              // (2026-10-19 : 2,5 M → 4 M, la plus chère des caisses à l'argent du jeu ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille)) (2026-10-06 : 1,5 M → 2,5 M) ROSSO 40 — (2026-09-25 : le mode Survivant est retiré, un seul mode de jeu) la caisse de RÊVE, à 1,5 M
  {k:'aura',  v:6},     // POSTER 84 — le poster se mérite au style : rang MYTHE, l'argent n'y peut rien
  {k:'carnet',v:1},     // LA BULLE — contrat n° 1
  {k:'carnet',v:2},     // LE COMBI — contrat n° 2
  {k:'carnet',v:3},     // LA DOLORÈS — contrat n° 3
  // LES PREMIUM : en BOUTIQUE, contre du vrai argent (StoreKit à brancher). `eur` = le prix affiché, `rar` = la rareté de la carte
  {k:'premium',eur:'4,20 €',rar:'leg',une:1}, // (2026-10-06 : 4,99 → 4,20 €) CHAT POP-TART — l'offre à la une
  {k:'premium',eur:'9,99 €',rar:'leg'},       // REQUIN — RETIRÉ (2026-10-21, Sacha : remplacé en boutique par LE SQUALE) ; (2026-10-18, Sacha) REMIS dans le jeu : de nouveau en boutique à 9,99 € (il était « DÉFI À VENIR » du 6 au 14/10, caché ensuite)
  {k:'bientot',v:1},                          // COMÈTE — (2026-10-06) DÉFI à définir (était en boutique, 4,99 €)
  {k:'premium',eur:'4,99 €',rar:'leg'},       // FORMULE OR — (2026-10-06) RETIRÉE
  {k:'premium',eur:'2,99 €',rar:'leg'},       // LE MANS 24 — (2026-10-06) RETIRÉE
  {k:'premium',eur:'2,99 €',rar:'leg'},       // EL PATRON — (2026-10-06) RETIRÉE
  {p:550000},                                 // (2026-10-19 : 750 000 → 550 000, la plus abordable des épiques ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille)) ACIDE — (2026-10-06) ÉPIQUE à l'argent du jeu (était en boutique, 1,99 €)
/* ===== LES CONDITIONS DES 50 — DÉBUT ===== */
  {p:1500}, // LA POSTIÈRE — (2026-10-06) RETIRÉE
  {p:2000}, // LA DEUCHE — (2026-10-06) RETIRÉE
  {p:2500}, // LE TAXI JAUNE — (2026-10-06) RETIRÉE
  {k:'premium',eur:'161,00 €',rar:'leg'}, // LA PIZZA EXPRESS — (2026-10-06) revient, LÉGENDAIRE en boutique
  {p:3500}, // LE MONOSPACE
  {p:4000}, // LE BREAK SUÉDOIS
  {p:5000}, // LA BOULE
  {p:6000}, // LE GLACIER
  {p:7000}, // LE TOUT-TERRAIN SOVIÉTIQUE
  {p:8000}, // LE GRILLE-PAIN — (2026-10-06) RETIRÉE
  {p:300000}, // LE CORBILLARD — (2026-10-06) RARE (était commune, 9 000 $)
  {p:10000}, // LA SANS-PERMIS — (2026-10-06) RETIRÉE
  {p:12000}, // L'AUTO-ÉCOLE — (2026-10-06) RETIRÉE
  {p:15000}, // LE PICK-UP DU FERMIER — (2026-10-06) RETIRÉE
  {p:20000}, // L'AMBASSADEUR — (2026-10-06) RETIRÉE
  {p:60000}, // LE CHARGEUR — (2026-10-17, Sacha : « le chargeur, il doit coûter 60 000 dollars » : 6 000 → 60 000) — (2026-10-14 soir, option A : 16 000 → 6 000, la 1re marche de transition ; les communes retirées n'ont plus de modèle) — (2026-10-14, équilibrage : 26 000 → 16 000 — une marche douce ×1,5 au bas de la gamme)
  {p:120000}, // LE DÉFIEUR — (2026-10-17, Sacha : « tu mets son prix à 120 000 dollars » : 10 000 → 120 000, avec sa refonte en robot jaune) — (2026-10-14 soir, option A : 24 000 → 10 000, la 2e marche) — (2026-10-14, équilibrage : 32 000 → 24 000)
  {p:100000}, // LA BAVAROISE — (2026-10-17, Sacha : « cent mille dollars » — 20 000 → 100 000, le jour du KIT RALLYE : elle passe entre LA SILENCIEUSE 90 000 et LE SAMOURAÏ 120 000) — (2026-10-14 soir, PILOTAGE après l'option A : 42 000 → 20 000, la marche à ×2 entre LE DÉFIEUR 10 000 et LE CAÏD 50 000) — (2026-10-06 : 38 000 → 42 000)
  {p:45000}, // LA SUÉDOISE TURBO — (2026-10-06) RETIRÉE
  {p:52000}, // LE QUATTRO — (2026-10-06) RETIRÉE
  {p:90000}, // LA SILENCIEUSE (2026-10-06 : 70 000 → 90 000)
  {p:85000}, // LE TRIDENT — (2026-10-06) RETIRÉE
  {p:100000}, // LA HUIT — (2026-10-06) RETIRÉE
  {p:120000}, // LE SAMOURAÏ
  {p:140000}, // LA VETTE
  {p:160000}, // LE CHÂTELAIN — (2026-10-06) RETIRÉE
  {p:200000}, // LA GRANDE ANGLAISE
  {p:300000}, // LE CHARGEUR 69
  {p:380000}, // L'ÉTALON — (2026-10-06) RETIRÉE
  {p:800000}, // LA QUEUE DE CANARD — (2026-10-19) 550 000 → 800 000 ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille) — (2026-10-18, Léo) 460 000 → 550 000 : épique, elle passe au-dessus des exotiques (LA GROUPE B 500 000)
  {p:550000}, // LA DAYTONA
  {p:1200000}, // LA TAURINE — (2026-10-19) 650 000 → 1 200 000 ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille)
  {p:750000}, // LA STRATOS
  {p:850000}, // LA NOCTAMBULE (ex-LA CHAUVE-SOURIS — renommée le 2026-10-14, Sacha : nom trop proche de Batman pour la revue App Store)
  {p:950000}, // LA PAGODE — (2026-10-06) RETIRÉE
  {p:1100000}, // LA DÉESSE — (2026-10-06) RETIRÉE
  {p:800000}, // L'AIGLE DE FEU (2026-10-06 : 1,3 M → 1 M) (2026-10-09, Léo, fiche de la salle blanche) RARE à 800 000 : entre LA QUEUE DE CANARD et LA NOCTAMBULE (ex-LA CHAUVE-SOURIS), l'ordre de la fiche
  {p:600000}, // (2026-10-19) 1 600 000 → 600 000 ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille) — // LA ZED
  {k:'premium',eur:'1,61 €',rar:'leg'}, // LA FÉLINE — (2026-10-06) LÉGENDAIRE en boutique (était épique, 2 M)
  {p:2500000}, // LA RAIE — (2026-10-18, Sacha) REMISE dans le jeu : épique à 2,5 M, comme avant le 6/10 (« DÉFI À VENIR » du 6 au 14/10, retirée ensuite)
  {k:'runs',v:100}, // L'ÉTERNELLE — (2026-10-14, PILOTAGE) DÉFI : 100 PARTIES jouées (`ex.runs`, déjà compté : les parties passées valent) — c'était 100 pubs, impossible depuis qu'il n'y a plus de pubs — (2026-10-06) DÉFI : 100 pubs (était en boutique, 9,99 €)
  {k:'premium',eur:'1,61 €',rar:'leg'}, // LE TRÔNE CENTRAL (2026-10-06 : 7,99 → 1,61 €)
  {k:'premium',eur:'1,61 €',rar:'leg'}, // LE SPECTRE (2026-10-06 : 7,99 → 1,61 €)
  {k:'premium',eur:'1,61 €',rar:'leg'}, // LE BLINDÉ NOIR (2026-10-21, Sacha : 9,99 → 1,61 €) (ex-LE CHEVALIER NOIR — renommé le 2026-10-14, Sacha : nom trop proche de Batman pour la revue App Store)
  {k:'premium',eur:'0,99 €',rar:'leg'}, // LE MUR DU SON (2026-10-06 : 6,99 → 0,99 €)
  {k:'premium',eur:'1,61 €',rar:'leg'}, // LE DRAGON D'OR (2026-10-21, Sacha : 9,99 → 1,61 €)
  {k:'carnet',v:9}, // LE MASTODONTE
  {k:'carnet',v:7}, // LA GROUPE B
  {k:'carnet',v:8}, // LE HOT ROD
  {k:'carnet',v:6}, // LA PUCE
/* ===== LES CONDITIONS DES 50 — FIN ===== */
  {p:1800000,exK:'carrN',exV:5}, // LA CAISSE-NUAGE — (2026-10-18) la carrière retirée : à l'argent du jeu (le prix de l'ancienne édition Poki, depuis le 14/10) ; exK/exV : la condition d'avant (les 5 niveaux de SKY HIGH), gagnée = la caisse est à toi (voir la migration après SAVE.load)
  {p:2200000,exK:'carrV',exV:5}, // LE LINGOT — (2026-10-18) idem : les 5 niveaux de la VILLE gagnés = il est à toi
  {p:1200000}, // (2026-10-02) L'ORIGAMI — ÉPIQUE, à l'argent : entre LA DÉESSE et L'AIGLE DE FEU
  {p:900000}, // (2026-10-06) ATCHOUM — RARE, à l'argent (2026-10-09, Léo, fiche de la salle blanche) ÉPIQUE à 900 000 : entre LA STRATOS et L'ORIGAMI, l'ordre de la fiche
  {k:'premium',eur:'1,61 €',rar:'leg'}, // (2026-10-21, Sacha : « remplace le shark par l'autre requin de Léo, à 1,61 € ») LE SQUALE passe en boutique, ex-700 000 (la mission secrète `abysse` ne le donne plus : elle paie de l'argent, voir missions/table.js — sinon le patch des missions le remettait en `k:'mis'` et il disparaissait de la boutique) ; (2026-10-08) LE SQUALE — RARE, à l'argent (2026-10-09, Léo, fiche de la salle blanche) ÉPIQUE à 700 000 : entre LA TAURINE et ACIDE, l'ordre de la fiche
  {p:3000000}, // (2026-10-09, Léo : « fais-en une hyper abstraite mais travaillée, concept, ajoute-la à la liste ») L'ABSTRAITE — ÉPIQUE, la plus chère des épiques (juste après ROSSO 40)
  {p:3200000}, // (2026-10-10, Léo : « une nouvelle abstraite, en glace, genre iceberg ») L'ICEBERG — ÉPIQUE, juste après L'ABSTRAITE
  {p:3400000}, // (2026-10-10, Léo : « une voiture flamme ») LA FOURNAISE — ÉPIQUE, juste après L'ICEBERG
  {p:3600000}, // (2026-10-10, Léo : « une abstraite type eau ») LA DÉFERLANTE — ÉPIQUE, juste après LA FOURNAISE
  {p:3800000}, // (2026-10-11, Léo : « génère-la en 3D dans mon jeu ») LA MERCURE — ÉPIQUE, juste après LA DÉFERLANTE
  {p:4000000}, // (2026-10-14, Léo : « fais une voiture tête de doge ») LE DOGE — ÉPIQUE, juste après LA MERCURE
  {p:4200000}, // (2026-10-16, Léo : « une belle Porsche Cayenne rose Barbie ») LA POUPÉE — ÉPIQUE, juste après LE DOGE
  {p:2000000}, // (2026-10-19) 4 400 000 → 2 000 000 ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille) (2026-10-16, Léo : « Taycan 4S », blanche, « la perle ») LA PERLE — ÉPIQUE, juste après LA POUPÉE
  /* LES NOUVELLES VOITURES (2026-10-18) — prix provisoires (réglables dans la salle blanche) : communes 2 500 → 8 000 $, rares 25 000 → 50 000 $ */
  /* · */
  /* · */
  /* · */
  {p:2500}, // 79 — COMMUNE : la berline rose des Simpson
  /* · */
  /* · */
  /* · */
  {p:3000}, // 80 — COMMUNE : Fiat 500 (2007), finition « 1957 »
  /* · */
  /* · */
  /* · */
  {p:4000}, // 81 — COMMUNE : Toyota Corolla berline (2019)
  /* · */
  /* · */
  /* · */
  {p:8000}, // 82 — COMMUNE : Jeep Wrangler JL (2018)
  /* · */
  /* · */
  /* · */
  {p:6000}, // 83 — COMMUNE : Mazda MX-5 NA (1989), phares escamotables
  /* · */
  /* · */
  /* · */
  {p:25000}, // 84 — RARE : Reliant Robin (trois roues)
  /* · */
  /* · */
  /* · */
  {p:50000}, // 85 — RARE : Mazda MX-5 RF (2016), argent
  /* · */
  /* · */
  /* · */
  {p:40000}, // 86 — RARE : Toyota AE86 (1983)
  /* · */
  /* · */
  /* · */
  {p:1500000}, // 87 — ÉPIQUE : Peugeot 208 T16 Pikes Peak (2013), LA BÊTE — (2026-10-19) 1 000 000 → 1 500 000 ; (2026-10-19, Léo : la grille des prix — le prix suit le prestige de la vraie voiture, chaque prix dans sa famille)
  /* · */
  /* · */
  /* · */
  {p:3500000}, // 88 — ÉPIQUE : LA ZAGAIE, la 5-95 de Zagato (2026-10-22, Léo : « zagato imite exactement la forme de la voiture orange ») — prix provisoire (entre L'ICEBERG et ROSSO 40, la caisse de rêve à 4 M : un exemplaire unique)
  /* · */
  /* · */
  /* · */
  {p:5000000}, // 89 — LÉGENDAIRE : LE LOUP, la Countach blanche du film (2026-10-22, Léo : « genere la blanche ressemblance 11/10 ») — prix provisoire (la caisse la plus chère de la boutique à pièces)
  /* · */
  /* · */
  /* · */
  {p:1500000}, // 90 — RÉSERVÉE, LIBRE (prix provisoire)
]
