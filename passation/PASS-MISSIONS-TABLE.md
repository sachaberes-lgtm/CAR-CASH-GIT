# LE PASS — le réservoir du chapitre 1 (07/11/2026)

> Généré par `node outils/pass-table-md.cjs` depuis `code/missions/pass-table.js` : ne pas éditer à la main. À relire par Léo : la courbe, les durées, les primes.

## Comment ça marche
- **3 missions actives** pour tous. Réussie + récompense prise -> remplacée par une mission tirée dans le réservoir.
- **Tirage au hasard, borné** : seulement la tranche atteinte (selon les missions réussies du chapitre) et la précédente ; jamais deux missions de la même famille en même temps si possible ; jamais une mission déjà remplie ; jamais deux caisses à moins de 5 missions réussies l'une de l'autre ; la petite peinture (`ps04`) est garantie dans les 4 premiers tirages.
- **Garde-fou** : un emplacement non fini après max(12, 2 x ses parties) parties peut être ÉCHANGÉ (la mission retourne au réservoir).
- **Un seul chapitre** (« CHAPITRE 1 ») contient toute la courbe. Pour en ajouter un : une ligne dans `PASS_CHAPITRES` + des entrées `ch:2` dans le réservoir ; le moteur n'est pas touché.

## Durée d'une partie : les constantes (UN SEUL endroit : `PARTIE_MN`, `GAIN_PARTIE`, `PASS_CROIS`, `PASS_TAUX` en tête de `pass-table.js`)

| | débutant | habitué |
|---|---|---|
| minutes par partie (`PARTIE_MN`) | 1.1 | 3 |
| $ par partie au début (`GAIN_PARTIE`) | 800 | 4 000 |
| le gain grandit de 1/x par partie (`PASS_CROIS`) | 24 | 60 |
| km roulés par partie | 8 | 45 |
| figures par partie | 5 | 20 |
| power-ups par partie | 3 | 10 |
| s de nitro par partie | 9 | 30 |
| s de nitro max par partie | 2,5 | 8 |
| s en l'air par partie | 12 | 35 |
| km sur verglas (partie au glacier) par partie | 6 | 25 |
| morts par partie | 1 | 1 |

**D'où viennent ces chiffres (déduits, pas inventés)** : `passation/ECONOMIE.md` §1-2 (parties de 15 à 75 s au banc, 500-1 000 $ la partie d'un humain moyen au début) ; `outils/eco-debut-modele.cjs` (profil « moyen » : 45-90 s, la moitié des pièces = DÉBUTANT ; profil « fort » : 2 à 4 min, 75 % des pièces, frénésie = HABITUÉ) ; journal « LES MISSIONS v2 » (1 000 km/h en ~50 s, ~55 d'aura/s). Les taux par partie (km, figures, power-ups…) sont des HYPOTHÈSES à corriger avec de vraies parties de Léo. Les exploits (records) sont des estimations directes dans la table. Limite connue : une prime en argent compte pour « accumule » (`gagneAjoute`), les durées de l'argent sont donc un peu pessimistes.

Classes (parties du débutant) : **COURT** <= 2 · **MOYEN** 3 à 12 · **LONG** > 12 (Léo : court <= 1, moyen 3-10 ; les trous sont rattachés au voisin).

## Les tranches

| tranche | s'ouvre à | missions | prime de base | courtes / moyennes / longues | caisses |
|---|---|---|---|---|---|
| 1 | 0 missions réussies | 8 | 600 $ | 7 / 1 / 0 | 0 |
| 2 | 5 missions réussies | 3 | 1 500 $ | 0 / 3 / 0 | 0 |
| 3 | 10 missions réussies | 9 | 3 500 $ | 0 / 9 / 0 | 1 |
| 4 | 16 missions réussies | 13 | 9 000 $ | 0 / 13 / 0 | 0 |
| 5 | 24 missions réussies | 18 | 24 000 $ | 0 / 0 / 18 | 4 |
| 6 | 34 missions réussies | 21 | 60 000 $ | 0 / 0 / 21 | 6 |
| 7 | 46 missions réussies | 13 | 150 000 $ | 0 / 0 / 13 | 2 |
| 8 | 58 missions réussies | 11 | 350 000 $ | 0 / 0 / 11 | 2 |

## Le réservoir, tranche par tranche

### Tranche 1 — prime de base 600 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `ps01` | ROULE 1 KM | COURT | 1 (1 min) | 1 (3 min) | 600 $ |
| `ps02` | FAIS 3 FIGURES | COURT | 1 (1 min) | 1 (3 min) | 600 $ |
| `ps03` | MONTE AU PALIER 4 DU MOTEUR | COURT | 1 (1 min) | 1 (3 min) | 600 $ |
| `fig2` | FAIS 2 FIGURES DANS UN SEUL SAUT | COURT | 2 (2 min) | 1 (3 min) | 600 $ |
| `ps07` | ATTEINS 2 000 D'AURA EN UNE PARTIE | COURT | 2 (2 min) | 1 (3 min) | 600 $ |
| `ps09` | DÉPASSE 500 KM/H | COURT | 2 (2 min) | 1 (3 min) | 600 $ |
| `eng10` | MONTE AU PALIER 10 DU MOTEUR | COURT | 2 (2 min) | 1 (3 min) | 600 $ |
| `ps04` | BRÛLE 30 S DE NITRO | MOYEN | 4 (4 min) | 1 (3 min) | peinture LAGON |

### Tranche 2 — prime de base 1 500 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `ps06` | PASSE 30 S EN L'AIR | MOYEN | 3 (3 min) | 1 (3 min) | 1 500 $ |
| `ps08` | RAMASSE 8 POWER-UPS | MOYEN | 3 (3 min) | 1 (3 min) | 1 500 $ |
| `kmh1000` | DÉPASSE 1 000 KM/H | MOYEN | 4 (4 min) | 1 (3 min) | 1 500 $ |

### Tranche 3 — prime de base 3 500 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `ps05` | ACCUMULE 5 000 | MOYEN | 6 (7 min) | 2 (6 min) | 3 500 $ |
| `air5` | RESTE 5 S EN L'AIR, PUIS POSE-TOI EN PARFAIT | MOYEN | 6 (7 min) | 2 (6 min) | 3 500 $ |
| `ps11` | FAIS 30 FIGURES | MOYEN | 6 (7 min) | 2 (6 min) | traînée ROSE |
| `ps10` | BRÛLE 60 S DE NITRO | MOYEN | 7 (8 min) | 2 (6 min) | 3 500 $ |
| `ps12` | RAMASSE 20 POWER-UPS | MOYEN | 7 (8 min) | 2 (6 min) | 3 500 $ |
| `fren` | ATTEINS LA FRÉNÉSIE | MOYEN | 7 (8 min) | 2 (6 min) | 3 500 $ |
| `ps13` | ROULE 50 KM | MOYEN | 7 (8 min) | 2 (6 min) | 3 500 $ |
| `fig5` | FAIS 5 FIGURES DANS UN SEUL SAUT | MOYEN | 8 (9 min) | 2 (6 min) | CAISSE LE SCARABÉE |
| `ps14` | PASSE 90 S EN L'AIR | MOYEN | 8 (9 min) | 3 (9 min) | 3 500 $ |

### Tranche 4 — prime de base 9 000 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `fig3` | COLLECTE 3 FIGURES *(hors cadeaux)* | MOYEN | 9 (10 min) | 2 (6 min) | 9 000 $ |
| `ps20` | RESTE 8 S EN L'AIR, PUIS POSE-TOI EN PARFAIT | MOYEN | 10 (11 min) | 3 (9 min) | 9 000 $ |
| `ps17` | TIENS LA FRÉNÉSIE 10 S | MOYEN | 11 (12 min) | 3 (9 min) | 9 000 $ |
| `ps19` | DÉPASSE 1 400 KM/H | MOYEN | 11 (12 min) | 2 (6 min) | 9 000 $ |
| `aura10k` | ATTEINS 10 000 D'AURA EN UNE PARTIE | MOYEN | 12 (13 min) | 3 (9 min) | 9 000 $ |
| `ps15` | FAIS 60 FIGURES | MOYEN | 12 (13 min) | 3 (9 min) | 9 000 $ |
| `ps16` | RAMASSE 36 POWER-UPS | MOYEN | 12 (13 min) | 4 (12 min) | 9 000 $ |
| `ps18` | BRÛLE 100 S DE NITRO | MOYEN | 12 (13 min) | 4 (12 min) | 9 000 $ |
| `ps21` | TIENS LA FRÉNÉSIE 15 S | MOYEN | 12 (13 min) | 3 (9 min) | 9 000 $ |
| `ps22` | PASSE 140 S EN L'AIR | MOYEN | 12 (13 min) | 4 (12 min) | 9 000 $ |
| `ps23` | ROULE 90 KM | MOYEN | 12 (13 min) | 2 (6 min) | 9 000 $ |
| `ps24` | RESTE 10 S EN L'AIR, PUIS POSE-TOI EN PARFAIT | MOYEN | 12 (13 min) | 4 (12 min) | 9 000 $ |
| `eng20` | MONTE AU PALIER 20 DU MOTEUR | MOYEN | 12 (13 min) | 3 (9 min) | traînée SAKURA |

### Tranche 5 — prime de base 24 000 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `parf10` | FAIS 10 POSES PARFAITES D'AFFILÉE | LONG | 14 (15 min) | 4 (12 min) | CAISSE LE COMBI |
| `ps25` | ATTEINS 15 000 D'AURA EN UNE PARTIE | LONG | 14 (15 min) | 3 (9 min) | 24 000 $ |
| `maps` | JOUE SUR CHAQUE MAP AU MOINS UNE FOIS | LONG | 15 (17 min) | 8 (24 min) | CAISSE LE ROUGE-GORGE |
| `verglas100` | PARCOURS 100 KM SUR LE VERGLAS (LE GLACIER) | LONG | 17 (19 min) | 4 (12 min) | CAISSE L'ICEBERG |
| `ps28` | RAMASSE 50 POWER-UPS | LONG | 17 (19 min) | 5 (15 min) | 24 000 $ |
| `ps26` | ROULE 150 KM | LONG | 19 (21 min) | 4 (12 min) | 24 000 $ |
| `ps27` | FAIS 100 FIGURES | LONG | 20 (22 min) | 5 (15 min) | 24 000 $ |
| `ps29` | BRÛLE 180 S DE NITRO | LONG | 20 (22 min) | 6 (18 min) | 24 000 $ |
| `tours5` | FRÔLE 5 TOURS DANS UN SEUL SAUT (LA VILLE) | LONG | 20 (22 min) | 6 (18 min) | 24 000 $ |
| `ps30` | PASSE 250 S EN L'AIR | LONG | 21 (23 min) | 8 (24 min) | 24 000 $ |
| `ps47` | ACCUMULE 25 000 | LONG | 22 (24 min) | 6 (18 min) | 24 000 $ |
| `vie5min` | TIENS 5 MIN SANS MOURIR | LONG | 22 (24 min) | 5 (15 min) | 24 000 $ |
| `ps34` | TIENS LA FRÉNÉSIE 20 S | LONG | 24 (26 min) | 5 (15 min) | 24 000 $ |
| `ps31` | DÉPASSE 1 800 KM/H | LONG | 25 (28 min) | 4 (12 min) | peinture COUCHANT |
| `ps32` | FAIS 15 POSES PARFAITES D'AFFILÉE | LONG | 25 (28 min) | 6 (18 min) | 24 000 $ |
| `ps33` | RESTE 15 S EN L'AIR, PUIS POSE-TOI EN PARFAIT | LONG | 28 (31 min) | 8 (24 min) | 24 000 $ |
| `ps36` | MONTE AU PALIER 25 DU MOTEUR | LONG | 28 (31 min) | 6 (18 min) | 24 000 $ |
| `aura20k` | ATTEINS 20 000 D'AURA EN UNE PARTIE | LONG | 30 (33 min) | 6 (18 min) | CAISSE LE CHARGEUR |

### Tranche 6 — prime de base 60 000 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `pu100` | RAMASSE 100 POWER-UPS | LONG | 34 (37 min) | 10 (30 min) | CAISSE LE DÉFIEUR |
| `meteo` | JOUE UNE MAP SOUS TOUTES SES MÉTÉOS ET TOUS SES MOMENTS DE LA JOURNÉE | LONG | 35 (39 min) | 12 (36 min) | CAISSE LA STRATOS |
| `ps48` | ACCUMULE 50 000 | LONG | 36 (40 min) | 12 (36 min) | 60 000 $ |
| `nmax100` | BRÛLE 100 S DE NITRO EN MODE NITRO MAX | LONG | 40 (44 min) | 13 (39 min) | CAISSE LE SAMOURAÏ |
| `fren30` | TIENS LA FRÉNÉSIE 30 S | LONG | 40 (44 min) | 8 (24 min) | 60 000 $ |
| `parfmaps` | POSE-TOI EN PARFAIT SUR CHAQUE MAP | LONG | 40 (44 min) | 14 (42 min) | 60 000 $ |
| `ps38` | FAIS 8 FIGURES DANS UN SEUL SAUT | LONG | 40 (44 min) | 9 (27 min) | 60 000 $ |
| `ps42` | PASSE 500 S EN L'AIR | LONG | 42 (46 min) | 15 (45 min) | 60 000 $ |
| `ps39` | ROULE 400 KM | LONG | 50 (55 min) | 9 (27 min) | 60 000 $ |
| `ps40` | FAIS 250 FIGURES | LONG | 50 (55 min) | 13 (39 min) | 60 000 $ |
| `fig8` | COLLECTE 8 FIGURES *(hors cadeaux)* | LONG | 52 (57 min) | 19 (57 min) | 60 000 $ |
| `ps35` | ATTEINS 30 000 D'AURA EN UNE PARTIE | LONG | 55 (61 min) | 10 (30 min) | 60 000 $ |
| `ps37` | TIENS 10 MIN SANS MOURIR | LONG | 55 (61 min) | 12 (36 min) | 60 000 $ |
| `cash100k` | ACCUMULE 100 000 | LONG | 58 (64 min) | 22 (66 min) | 60 000 $ |
| `eng30` | MONTE AU PALIER 30 DU MOTEUR | LONG | 60 (66 min) | 12 (36 min) | traînée FOUDRE |
| `ps41` | BRÛLE 600 S DE NITRO | LONG | 67 (74 min) | 20 (60 min) | 60 000 $ |
| `air1000` | PASSE 1 000 S EN L'AIR | LONG | 84 (1,5 h) | 29 (87 min) | CAISSE LE MASTODONTE |
| `ps43` | DÉPASSE 2 200 KM/H | LONG | 90 (1,7 h) | 12 (36 min) | 60 000 $ |
| `ps44` | TIENS LA FRÉNÉSIE 45 S | LONG | 90 (1,7 h) | 15 (45 min) | 60 000 $ |
| `morts100` | MEURS 100 FOIS | LONG | 100 (1,8 h) | 100 (5 h) | CAISSE LE CORBILLARD |
| `figs500` | FAIS 500 FIGURES | LONG | 100 (1,8 h) | 25 (75 min) | CAISSE ATCHOUM |

### Tranche 7 — prime de base 150 000 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `car5` | COLLECTE 5 VOITURES *(hors cadeaux)* | LONG | 101 (1,9 h) | 46 (2,3 h) | 150 000 $ |
| `figall` | COLLECTE TOUTES LES FIGURES | LONG | 113 (2,1 h) | 53 (2,7 h) | 150 000 $ |
| `aura50k` | ATTEINS 50 000 D'AURA EN UNE PARTIE | LONG | 120 (2,2 h) | 22 (66 min) | aile PHENIX |
| `tr5` | COLLECTE 5 TRAÎNÉES *(hors cadeaux)* | LONG | 129 (2,4 h) | 63 (3,2 h) | 150 000 $ |
| `cash500k` | ACCUMULE 500 000 | LONG | 151 (2,8 h) | 77 (3,9 h) | 150 000 $ |
| `col5` | COLLECTE 5 COULEURS *(hors cadeaux)* | LONG | 161 (3 h) | 83 (4,2 h) | 150 000 $ |
| `ps46` | ROULE 1 500 KM | LONG | 188 (3,4 h) | 34 (1,7 h) | 150 000 $ |
| `cash1m` | ACCUMULE 1 000 000 | LONG | 223 (4,1 h) | 124 (6,2 h) | peinture VAPORWAVE |
| `nit2000` | BRÛLE 2 000 S DE NITRO | LONG | 223 (4,1 h) | 67 (3,4 h) | CAISSE LA TAURINE |
| `car10` | COLLECTE 10 VOITURES *(hors cadeaux)* | LONG | 246 (4,5 h) | 139 (7 h) | 150 000 $ |
| `ps45` | ATTEINS 70 000 D'AURA EN UNE PARTIE | LONG | 250 (4,6 h) | 40 (2 h) | 150 000 $ |
| `cash2m` | ACCUMULE 2 000 000 | LONG | 324 (5,9 h) | 193 (9,7 h) | 150 000 $ |
| `km100k` | ROULE 3 000 KM | LONG | 375 (6,9 h) | 67 (3,4 h) | CAISSE LA QUEUE DE CANARD |

### Tranche 8 — prime de base 350 000 $

| id | mission | classe | parties débutant | parties habitué | récompense |
|---|---|---|---|---|---|
| `ai5` | COLLECTE 5 AILES *(hors cadeaux)* | LONG | 401 (7,4 h) | 246 (12,3 h) | 350 000 $ |
| `tr10` | COLLECTE 10 TRAÎNÉES *(hors cadeaux)* | LONG | 479 (8,8 h) | 300 (15 h) | 350 000 $ |
| `car20` | COLLECTE 20 VOITURES *(hors cadeaux)* | LONG | 577 (10,6 h) | 369 (18,5 h) | 350 000 $ |
| `rares` | DÉBLOQUE TOUTES LES VOITURES RARES | LONG | 577 (10,6 h) | 369 (18,5 h) | CAISSE LA DOLORÈS |
| `col10` | COLLECTE 10 COULEURS *(hors cadeaux)* | LONG | 625 (11,5 h) | 403 (20,2 h) | 350 000 $ |
| `trall` | COLLECTE TOUTES LES TRAÎNÉES | LONG | 720 (13,2 h) | 469 (23,5 h) | 350 000 $ |
| `ai10` | COLLECTE 10 AILES *(hors cadeaux)* | LONG | 1151 (21,1 h) | 773 (38,7 h) | 350 000 $ |
| `colall` | COLLECTE TOUTES LES COULEURS | LONG | ∞ | ∞ | 350 000 $ |
| `aiall` | COLLECTE TOUTES LES AILES | LONG | ∞ | ∞ | 350 000 $ |
| `carall` | COLLECTE TOUTES LES VOITURES | LONG | ∞ | ∞ | CAISSE LE TRÔNE CENTRAL |
| `toutall` | COLLECTE TOUS LES OBJETS DU JEU | LONG | ∞ | ∞ | 1 000 000 $ |

## Sortis du pass
- `mis10` : « RÉUSSIS 10 MISSIONS » : une méta-mission, elle se remplit toute seule (point 6). Sa caisse, LE CHARGEUR, passe à aura20k (PASS_LIEN).
- `maps2` : « AVOIR EXPLORÉ CHAQUE MAP » : la même mesure que `maps` (deux missions identiques, point 6). Sa caisse, LE ROUGE-GORGE, passe à `maps` (PASS_LIEN).

## Bilan
- 96 missions dans le réservoir (dont 48 nouvelles, `ps01`..`ps48`).
- Argent versé si TOUT le chapitre est fini : **6 443 200 $** (le garage à l'argent ~34 M$, voir `ECONOMIE.md`). Caisses données : **15**.

## Les missions CADEAU (voiture / habillage) — le système d'apparition
Dans le réservoir : **15 missions voiture** et **7 missions habillage** (champ `cadeau`), contre 74 d'argent. Elles sont plus rares mais apparaissent toujours. Constantes : `PASS_CADEAU` (pass-table.js).
- **Intervalle variable, plafond garanti** : après chaque mission réussie le compte monte ; le prochain cadeau est tiré dans une fenêtre cachée de missions réussies : habillage tous les 4 à 12, voiture tous les 10 à 25. Le maximum est une GARANTIE (jamais plus de 12 sans habillage, 25 sans voiture). L'écart s'allonge doucement (+0.5 / +1 mission par cadeau donné, plafonné à 20 / 40).
- **Début généreux** : la petite peinture LAGON au plus tard à la 5e mission réussie, la première voiture entre la 10e et la 12e.
- **Garde-fous** : jamais deux cadeaux de suite (2 missions d'écart au moins), jamais deux caisses à moins de 5 missions, voiture / habillage en alternance, pas deux peintures de suite, jamais un objet déjà possédé.
- **Anticipation** : quand un cadeau est tiré, sa carte est DORÉE avec la silhouette (voiture noire floutée, ou l'aperçu de la peinture) et le message « NOUVELLE MISSION CADEAU ». Barre de progression sur chaque carte ; la carte cadeau pulse doucement dans son dernier tiers. Une mission cadeau commencée reste dans ses emplacements jusqu'à réussite (jamais remplacée, jamais échangée par le garde-fou).
- **Presque-gagné** : rien n'est annoncé avant ; quand la jauge cachée dépasse 75 % de la fenêtre, l'écran de fin de partie peut dire « une mission cadeau est proche » (sans chiffre).
- **Pic de fin** : récupérer un cadeau = la petite scène de révélation (celle des secrètes) ; l'argent se prend d'un tap.
- **Équité** : le tirage est sauvegardé (pas de re-tirage en rouvrant ni en quittant).
- **Exemple de rythme** (valeurs de départ) : environ 3 habillages et 1 à 2 voitures sur les 25 premières missions réussies (le début est plus généreux). Le réservoir contient 15 voitures et 7 habillages : de quoi tenir la garantie sur tout le chapitre.

## Décisions à valider par Léo
1. **Sortis** : « RÉUSSIS 10 MISSIONS » (méta, se remplit seule) et « AVOIR EXPLORÉ CHAQUE MAP » (doublon de « JOUE SUR CHAQUE MAP »). Leurs caisses (LE CHARGEUR, LE ROUGE-GORGE) passent à « ATTEINS 20 000 D'AURA » et « JOUE SUR CHAQUE MAP » (bonne difficulté, tranche 5 et 5).
2. **Les collections comptent HORS cadeaux** (voitures, couleurs, traînées, ailes, figures : variante `T` de la mesure), sinon les caisses données par le pass remplissaient « COLLECTE 5 VOITURES » toutes seules.
3. **« ROULE 100 000 KM » (LA QUEUE DE CANARD) est impossible** (12 500 parties au débutant) : seuil ramené à 3 000 km dans le pass. Les ailes (10 / toutes), « toutes les couleurs », « toutes les voitures », « tout collecter » demandent des dizaines de millions ou le pack de peintures à 0,99 € : ce sont l'horizon du chapitre (tranche 8, durée ∞).
4. **Petite peinture de base** : LAGON (une des peintures unies du pack), tirée au plus tard au 4e tirage ; proposition, on peut prendre une autre. Les autres habillages : traînée ROSE NÉON (tr. 2), SAKURA (tr. 3), peinture COUCHER DE SOLEIL (tr. 4-5), VAPORWAVE (tr. 7), aile PHÉNIX et traînée FOUDRE restent liées à leurs missions d'origine.
5. **Classes** : COURT <= 2 parties, MOYEN 3 à 12, LONG au-delà (Léo avait dit <= 1 et 3-10).
6. **Durée d'une partie** : débutant 1,1 min / 800 $, habitué 3 min / 4 000 $ ; à corriger avec de vraies parties (un seul endroit, en tête de pass-table.js).
7. **Argent total versé** si tout le chapitre est fini : voir Bilan (surtout les 20 missions de fond, tranches 7-8). À rabaisser si trop.
8. **Tranches** : s'ouvrent après 0 · 5 · 10 · 16 · 24 · 34 · 46 · 58 missions réussies ; le tirage prend la tranche atteinte et la précédente.
