# L'ESPACE, LA ROUTE UNIQUE — DANS LE JEU (2026-11-17, vérification)

Banc : `outils/banc-routes/uniques/jade-jeu.cjs` avec `carte=espace` (le même que Jade : Chrome sans fenêtre, MUET, `tel=1&appareil=iPhone14,2`, portrait
390×844, paysage avec `pay=1`, `?pistegraine=`, service worker contourné). Au pilote (`dbgAuto`, mortel, sans saut volontaire), course entière jusqu'à L − 60 m.
Relevés : exceptions, morts, passages en vol (`mode==='fall'` : une chute dans le vide en serait un), la dalle à l'endroit (min de `Nn.y` sur les 300 premiers m et
les 200 derniers), `dbgOrbU()` (le plan), `dbgVoyage()` (le décor des géants), `dbgMods()`, appels/triangles chaque image, programmes au départ et à la fin.
Code mesuré : l'état du worktree vers 19 h 30-20 h 30 (après le TOUR 2 d'ESPACE.md).

## Résultat — PROUVÉ (14 routes neuves dont 1 en paysage et 6 à tirage forcé, + 2 routes d'avant)
**0 exception, 0 mort, 0 vol (la caisse ne quitte jamais la route : aucune chute sur les replats, les remontées, au départ ni dans les petits modules),
arrivée au portail à l'endroit sur toutes les routes (Nn.y = 1 sur les 200 derniers m), programmes liés en course 0 (149 → 149).**
- Le départ : le 1er module dès 234 m (g302 marches, g305 bobsleigh, g308 bosse, g309 bobsleigh, g310/g311 plongeon, g313 ceinture, g314 mur) : la caisse est lancée,
  pas de vol, pas de mort. Dalle la plus penchée dans les 300 premiers m : Nn.y 0,47 (g301, ouverture « grand », ~62°) — les routes d'avant : 0,76-0,80.
- Les 7 petits modules passent : mur (g314, g308), esse (g304, g313), marche (g306, g310, g313), bosse (g303, g304, g308, g311, g314), quart (g303, g304, g311),
  chicane (g305, g307, g314), plongeon (g304, g307, g309, g310, g311, g312) — et marches, lacet.
- Les reliefs : vagues (g301, g309, g314), douce (g302, g305), rampe (g303, g304, g307, g308), raide (g306, g311, g312, g313), paliers (g310) : 0 vol, 0 mort.
- Les fins : virage (g301, g304, g305, g309, g312), module (g302, g303, g307, g308, g311, g313, g314), lacet (g306, g310).
- LES GÉANTS ailleurs qu'à la fin : roue (g306 à 3,6 km, g311 à 2,9 km), astéroïde (g305 à 2,5 km, g308 à 5,1 km, g313), lune (g310 à 4,0 km, g312 à 0,6 km),
  nébuleuse (g301, g303, g313, g314 à 1,4 km) : décor bâti sans erreur (`VOY_D.err` nul), la jante de la roue et la roche de l'astéroïde visibles, et LA ZONE DE SAUT
  REFUSÉ suit le géant là où il est : roue 3 600-4 986 → zone 3 954-5 046 (g306) ; 2 934-4 321 → 3 288-4 381 (g311) ; astéroïde 2 520-3 744 → 2 698-3 894 (g305),
  5 237-6 460 → 5 415-6 610 (g313), 5 060-6 266 → 5 220-6 416 (g308). Lune : « R360 écart 8 », « R430 écart 4 ».
- Caméra « dans la roche » : sans objet ici (le test est celui de la jade).

| course | ouv · relief · fin · silhouette · temps fort | modules (début, m) | couvert / L | exc | morts | vols (chutes) | dalle : Nn.y min départ 0-300 m / arrivée | caméra dans la roche | i/s | appels moy/p95 | triangles moy/p95 (k) | géo / tex |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pistegraine=301 sans=uniques | (avant) | plongeant 792, cascade 1872, s-retourne 3907, lacet 6067, rentree 6823, plongee 7669 | 8842 / 8918 | 0 | 0 | 0 | 0.8 / 1 | 0 | 58.8 | 43.2 / 110 | 117 / 360 | 462 / 92 |
| pistegraine=302 sans=uniques | (avant) | torsade 684, faille 2610, s-retourne 3871, lacet 5941, rentree 6715, plongee 7651 | 8951 / 8983 | 0 | 0 | 0 | 0.76 / 1 | 0 | 59.5 | 46 / 118 | 124 / 352 | 531 / 93 |
| pistegraine=301 | grand · vagues · virage · S · nebuleuse | fronde 828, ceinture 2215, nebuleuse-entree 4646, nebuleuse 5024, nebuleuse-sortie 5888, plongee 7653 | 8878 / 8967 | 0 | 0 | 0 | 0.47 / 1 | 0 | 58.8 | 49.7 / 125 | 122 / 353 | 450 / 92 |
| pistegraine=302 | direct · douce · module · vague · torsade | marches 234, grande-torsade 2862, mur 4841, bobsleigh 5705 | 8897 / 8939 | 0 | 0 | 0 | 0.84 / 1 | 0 | 59.5 | 47.3 / 131 | 135 / 424 | 529 / 92 |
| pistegraine=303 | sserre · rampe · module · libre · nebuleuse | ceinture 522, fronde 2412, bosse 3654, nebuleuse-entree 4752, nebuleuse 5112, nebuleuse-sortie 5994, quart 6877 | 8869 / 8899 | 0 | 0 | 0 | 0.81 / 1 | 0 | 59.5 | 54.1 / 137 | 131 / 376 | 551 / 93 |
| pistegraine=304 | sserre · rampe · virage · spirale · torsade | plongeon 486, bosse 1602, fronde 2646, grande-torsade 3798, esse 5526, quart 6407, plongee 7595 | 8873 / 8921 | 0 | 0 | 0 | 0.84 / 1 | 0 | 59.5 | 45.5 / 111 | 126 / 371 | 515 / 93 |
| pistegraine=305 | direct · douce · virage · libre · asteroide | bobsleigh 234, asteroide-entree 2520, asteroide 2898, asteroide-sortie 3744, surbaisse 4878, chicane 6427, plongee 7759 | 8919 / 8959 | 0 | 0 | 0 | 0.88 / 1 | 0 | 59.5 | 52.6 / 138 | 138 / 408 | 548 / 93 |
| pistegraine=306 | grand · raide · lacet · spirale · roue | bobsleigh 630, roue-entree 3600, roue 4104, roue-sortie 4986, marche 5868 | 8852 / 8891 | 0 | 0 | 0 | 0.57 / 1 | 0 | 59.5 | 47.2 / 129 | 131 / 400 | 524 / 92 |
| pistegraine=307 | sserre · rampe · module · derive · failleEnvers | ceinture 450, envers-entree 2826, faille-envers 4104, envers-sortie 4608, chicane 5328, plongeon 6299, faille 7415 | 8860 / 8891 | 0 | 0 | 0 | 0.81 / 1 | 0 | 59.2 | 50.3 / 130 | 129 / 376 | 549 / 94 |
| pistegraine=309 orbouv=direct orbrel=vagues | direct · vagues · virage · vague · failleEnvers | bobsleigh 234, envers-entree 2664, faille-envers 3383, envers-sortie 3851, plongeon 4949, stengel 5975, plongee 7577 | 8879 / 8914 | 0 | 0 | 0 | 0.83 / 1 | 0 | 59.5 | 48 / 128 | 125 / 384 | 542 / 94 |
| pistegraine=310 orbouv=plongeon orbrel=paliers orbfin=lacet | plongeon · paliers · lacet · libre · lune | plongeon 234, envers-entree 1602, faille-envers 2376, envers-sortie 2880, lune-entree 4032, lune 4482, lune-sortie 5364, marche 6121 | 8857 / 8893 | 0 | 0 | 0 | 0.84 / 1 | 0 | 59.5 | 47.1 / 118 | 119 / 338 | 546 / 95 |
| pistegraine=311 orbcx=roue orbrel=raide orbfin=module | plongeon · raide · module · crochet · roue | plongeon 234, bosse 1818, roue-entree 2934, roue 3438, roue-sortie 4321, quart 5293, surbaisse 6337 | 8873 / 8899 | 0 | 0 | 0 | 0.77 / 1 | 0 | 59.5 | 48 / 130 | 135 / 408 | 529 / 94 |
| pistegraine=312 orbcx=lune orbfin=virage | sserre · raide · virage · libre · lune | lune-entree 576, lune 1026, lune-sortie 1907, pique 2933, plongeon 4912, stengel 6334, plongee 7863 | 9029 / 9057 | 0 | 0 | 0 | 0.68 / 1 | 0 | 59.5 | 50.8 / 144 | 129 / 388 | 554 / 93 |
| pistegraine=313 orbcx=asteroide | direct · raide · module · crochet · asteroide | ceinture 234, esse 2159, nebuleuse-entree 3095, nebuleuse 3455, nebuleuse-sortie 4337, asteroide-entree 5237, asteroide 5615, asteroide-sortie 6460, marche 7558 | 8852 / 8890 | 0 | 0 | 0 | 0.81 / 1 | 0 | 59.5 | 55.5 / 149 | 141 / 418 | 546 / 93 |
| pistegraine=314 orbcx=nebuleuse orbrel=vagues | mur · vagues · module · S · nebuleuse | mur 234, nebuleuse-entree 1440, nebuleuse 1800, nebuleuse-sortie 2664, bosse 3942, fronde 4896, stengel 6121, chicane 7201 | 8871 / 8899 | 0 | 0 | 0 | 0.94 / 1 | 0 | 59.5 | 53.9 / 150 | 140 / 415 | 530 / 94 |
| pistegraine=308 pay=1 | bosse · rampe · module · S · asteroide | bosse 234, lacet 1801, fronde 3781, asteroide-entree 5060, asteroide 5420, asteroide-sortie 6266, mur 7220 | 8850 / 8895 | 0 | 0 | 0 | 0.87 / 1 | 0 | 59.5 | 50 / 127 | 125 / 365 | 528 / 93 |

## Le coût (mêmes graines, alternées dans la même série, 59 i/s)
| | g301 appels moy / p95 | g301 triangles (k) | g302 appels | g302 triangles (k) | géométries fin |
|---|---|---|---|---|---|
| nouveau (deux passages) | 48,5 / 123 · 49,7 / 125 | 120 / 345 · 123 / 354 | 47,3 / 132 · 47,3 / 131 | 135 / 425 · 135 / 424 | 516, 450 / 537, 529 |
| `?sans=uniques` | 43,2 / 110 | 118 / 360 | 46,0 / 118 | 124 / 353 | 462 / 531 |
Sur ces deux graines, le nouveau tirage coûte ~+7 % d'appels moyens et ~+5 % de triangles (p95 appels +12 %) : les géants des voyages (nébuleuse, torsade) sont
maintenant dans le sac de toutes les routes (`ORB_VOY` vrai sous RU). Deux graines : un ordre de grandeur, pas une preuve. Toutes les routes neuves : 45-56 appels
moyens, 111-150 en p95, 119-141 k triangles moyens.
NON mesuré : la plus longue tâche au départ et au portail (banc `prebati-bride.cjs` / boîte de vol) ; le temps de génération en jeu (le pilote l'a mesuré en Node :
31-47 ms contre 45-55, ESPACE.md).

## NON prouvé / à voir
- **La lueur de la rentrée** sur une fin sans plongée (`?orbfin=lacet|module`) : routes jouées sans erreur (g306, g310 lacet ; 7 routes « module »), mais la lueur
  n'est ni mesurée ni photographiée au bon moment.
- Les sauts volontaires (le pilote n'a pas sauté : `saut=0`) au-dessus d'un géant et au sommet d'une remontée.
- Le roulis ressenti, le rappel vers le ciel ralenti (RAPU) : à juger en jouant.
- Captures : 2, 5, 9 s après le départ de chaque route dans `captures/espace/` (portrait ; `esp-pay-g308` en paysage).

## Commandes
```
~/cash-car/verrou-banc.sh … (prendre le verrou)  puis
node outils/banc-routes/uniques/jade-jeu.cjs <racine abs> 8961 9361 passation/routes-uniques/jeu/espace "carte=espace&pistegraine=301" "carte=espace&pistegraine=309&orbouv=direct&orbrel=vagues" …
```
