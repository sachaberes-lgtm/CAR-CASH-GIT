# Lot A — les modules route-ville de la ville cyberpunk (nuit du 18/11/2026)

Worktree : `.lots/a` (détaché sur a42e9ec50). **Rien de commité.** Index assemblé (`node code/assembler.cjs --verifier` vert).
Reprise d'un premier auteur coupé à 03 h 20 : son squelette (3 modules, plan, décor, banc Node) était juste et compilait ; je l'ai gardé et corrigé (voir § 2).

## 1. Ce qui est fait

Nouveau morceau `code/maps/ville-cyber.js` (inscrit dans `ORDRE.txt` juste après `maps/ville-scenes.js`). Interrupteur **`?sans=villecyber`** (`VILLE_CYBER`,
même forme que `VILLE_CALME`, et il en dépend). Périmètre : `MC==='ville'` seulement (pas dans `VS.scenes`, donc ni Crypto City ni la vitrée).

| module | `?villescene=` | ce qu'on vit |
|---|---|---|
| LE SLALOM DES TOURS | `slalomtours` | calage sur la trame, puis 4 tours fines et hautes (4-5 au palier 0, 3 dès LV 1,5) DANS la ligne d'arrivée, en quinconce ; coups de volant de 40-46° (2 × 20-23°) à 2,3-2,45 rP ; chaque tour à 15 m du bord de la dalle, à l'INTÉRIEUR du virage (côté sûr en vol, critique du jury) ; une raie de néon face à l'arrivée, une enseigne sur le flanc frôlé |
| LE PIQUÉ | `pique` | calage, crête courte, BASCULE (rayon 1,9 vD dessiné), plongée de 30-38° dans l'axe entre deux murs de tours à 15 m du bord, à travers 2-4 nappes de lucioles immobiles en travers (une sous la dalle, une au-dessus, en alternance), ressource ≥ 3,3 rP au ras d'une rue (ancre `rue` : dalle dure), remontée qui tourne |
| LES MONTAGNES RUSSES DES TOITS | `russes` | 2-3 vagues en S très large ; chaque crête 8 m au-dessus d'un toit-terrasse (ancre `toit`), chaque creux sous les toits entre deux tours ; rayon vertical 2,05 vD dessiné |
| LA TRANCHÉE | — | **pas faite** (temps) |

Patron des scènes respecté : fonction de route dans le contexte G (`vcModules`, appelé par `vsModules` sans tirage), ANCRES dans `FILETMARK`
(`cslalom`, `cpique` + `rue`, `toit` + `crusse`), PLAN dans `vsReserve` (→ `vcReserve` : chaque pièce passe seule `vsLibre` à ROAD_HALF+14 et `vsAirOk` ; les nappes : 12 m de tout
le ruban en 3D ET hors de la bande de l'audit, `vcFrole` ; une pièce refusée est perdue seule, comptée une demie dans `vsMalusDecor`), volumes dans `vsBatirG`
(→ `vcBatir`, familles existantes `vol`/`lum`/`sommet` : **0 nouvel appel de dessin, 0 matière, 0 texture, 0 programme**), emprises pièce par pièce dans `vsBloque`
(`p.zones`), longueur `lg` (lue par `VS.longueur`), noms dans `VS_NOMS`, dévers `nul` (piqué de la crête à la rue ; montagnes russes en entier).

Raccords (courts, gardés `VILLE_CYBER`, et `MC==='ville'` côté route) :
- `ville-entree.js` : le paquet de la ville (`MCJ`) reçoit `VS.cyber.liste` ; `?villescene=` connaît les trois clés ; `vcPaquet` met une carte route-ville en tête du
  paquet (laquelle : la graine), une graine sur trois une deuxième juste derrière. Aucun tirage `rf` ajouté (seul l'ordre du paquet mélangé change). Branchement d'une
  ligne, à retirer quand le lot U refera le tirage unique.
- `ville-scenes.js` : `vcModules` dans `vsModules`, `fn.lg` dans `VS.longueur`, `vcReserve`/`vcBatir` dans `vsReserve`/`vsBatirG`, `p.zones` dans `vsBloque`,
  `p.vcPerdus` dans `vsMalusDecor`, `vcSautRefuse` en tête de `villeEnversRefuse`.
- `outils/banc-routes/charge.cjs` : charge `ville-cyber.js` s'il existe (sinon inchangé : les bancs tournent aussi sur la référence).

LE SAUT (critique du jury « la crête lance la caisse ») : lu dans le code, en CONDUITE la caisse reste collée à la dalle (aucun décollage par la courbure :
`boucle-2-conduite.js`, seuls le bord, les tremplins du glacier et les crêtes des dunes font décoller ; « la caisse ne quitte jamais la route d'elle-même »).
Le seul vol possible est le saut nitro voulu : il est REFUSÉ au-dessus des fenêtres `ss` (crête → bas de la ressource du piqué ; chaque crête → pied de sa descente
aux montagnes russes), par `vcSautRefuse`, comme LA CRÊTE SANS SAUT des nuages (`nuaSautRefuse`, mêmes 1,2 s / 2 s nitro de regard). Pas de cône `FILETMARK.air` :
il aurait rabattu les murs du piqué eux-mêmes (rayon 58 m et plus).

## 2. Ce que j'ai changé dans le travail repris (et pourquoi)

- Les modules ne sortaient **jamais au palier 10** (0/60 routes) et 1 fois sur 60 au palier 20 : longueurs `lg` surestimées et modules trop longs pour la place.
  Droites d'entrée/sortie raccourcies dès LV > 1,08 (`kC`), slalom à 3 tours dès LV 1,5, `lg` recalées sur le pire de 20 graines mesuré (×1,08 dans `VS.longueur`).
- Jury : ressource ≥ 3,3 rP ; rayon vertical des montagnes russes 1,45 → 2,05 vD dessiné (tenu 1,85-2,1 vD, il était à 1,19-1,31) ; pentes 15-18° ; saut refusé.
- Rayon en plan : calage à 2,45 rP et arcs du slalom à 2,3-2,45 rP (le minimum tenu passait sous 2 rP : 1,87 au palier 10).
- Nappes : étagées au-dessus / au-dessous ; écartées de la bande de l'audit (1 `frole` au palier 10, graine 45, avant) ; une luciole sur deux sur `ALLEGE`.
- `vcEcart` : une borne basse avant les 9 échantillons (le décor des scènes coûtait ~30 % de plus).
- La deuxième carte route-ville passe en 2e place (elle n'était jamais jouée en 3e).

## 3. Preuves (commandes et chiffres)

Sorties brutes : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-a/`
(`cyber-final.txt`, `cyber-avant.txt`, `force-*.txt`, `tors-final.txt`, `tors-avant.txt`, `tirage-ab.txt`, `chrome/`).

### 3.1 Identité (Node, `node outils/banc-routes/empreinte.cjs graines=1-12` dans `.lots/a`)
| | `SEARCH='?sans=villecyber'` | sans drapeau |
|---|---|---|
| ville p0 / p10 | **d63b36e2af8b / fb378a8c6756** (= référence) | 57a59ed80b5e / 9dc6766ea34f (le neuf) |
| crypto | 5447610bd8f2 / eae97981f833 | identique |
| nuages | 469d52aff855 / 2e1661d8fe93 | identique |
| espace | 9c99fae61d38 / ea2d9e750351 | identique |
(La vitrée ne se charge pas dans ce banc, `VIT_SOL is not defined`, avant comme après ; elle ne passe pas par le paquet de la ville.)
Le décor sans drapeau : tout le neuf est derrière `VILLE_CYBER` et les types `cslalom/cpique/crusse`, qui n'existent pas sans lui.

### 3.2 Banc Node des modules — `node outils/banc-routes/ville-cyber.cjs graines=1-60 paliers=0,10,20` (nouveau)
Vrais générateurs (charge.cjs) + vrai plan du décor (`vsReserve` + `vsBatir` sur la route échantillonnée à 3 m) ; la règle et l'audit sur chaque volume et néon des modules.

| palier | routes avec 0 / 1 / 2 modules | sorties (slalom, piqué, russes) | raccourcis/route (avant) | règle 14 m | audit dans / frole | nappes < 12 m |
|---|---|---|---|---|---|---|
| 0 | 5 / 53 / 2 | 15, 20, 22 | 2,00 (2,00) | 0 | 0 / 0 | 0 |
| 10 | 31 / 29 / 0 | 10, 10, 9 | 1,00 (1,00) | 0 | 0 / 0 | 0 |
| 20 | 53 / 7 / 0 | 7, 0, 0 | 0,42 (0,40) | 0 | 0 / 0 | 0 |

Plans : **0 plan abandonné** (cslalom 15/10/7 bâtis, cpique 20/10, crusse 46/18). Pièces perdues seules : 20 tours de creux sur 92 au palier 0 (raison `route` : une autre
partie de la route passe là — l'écart ne change rien, essayé à +6 et +12 m), 0 ailleurs. Forcés (`SEARCH='?villescene=X'`, 50 graines × 3 paliers) : mêmes zéros.

Rayons (fenêtre 20 m, à la vitesse réelle) — en plan : slalom 2,16 / 2,05 / 1,95 rP (p0/p10/p20), piqué 2,17 / 2,05 rP, russes ≥ 5,6 rP (la route entière avant : 2,04 / 1,93 / 1,78 rP).
Vertical (crêtes) : piqué 1,69 vD au p0 (la bascule, à 48 % du module) ; 1,39-1,48 vD au p10 **à la sortie du module** (98 % : la jonction remontée → module suivant, comme
la plongée existante, 1,50) ; creux du piqué 2,2-2,4 vD ; russes crêtes 2,1 vD, creux 1,65-1,85 vD. Pente maxi du piqué 37,5°.

### 3.3 Torsades, règle des 10 s — `node outils/banc-routes/ville-torsades.cjs graines=1-30 carte=ville` (après / avant, racine=référence)
p0 : torsades/route 0,77 / 0,97, boucles ≥ 180° 2 / 2,2, RMIN 2,04 / 2,04 rP. p10 : 0,2 / 0,27 ; 1,77 / 1,8 ; 1,93 / 1,95 rP. p20 : 0,13 / 0,23 ; 0,8 / 0,83 ; 1,78 / 1,77 rP.
Tenue de cap (vsTenue, 60 graines) : t30 pire 9,12 s au p0 (avant 8,38 s) — sous 10 s mais plus près ; t8 2,39 s (avant 2,85).

### 3.4 Coûts du tirage (Node)
- `ville-tirage-ab.cjs A='?sans=villecyber' B='' graines=1-10 rep=2` (alterné) : médianes p0 131 / 131 ms, p10 110 / 110, p20 111 / 113 ms → **neutre**.
- Le décor des scènes (vsReserve + vsBatir, mesuré dans ville-cyber.cjs) : médiane ~4 ms sans → ~4-9 ms avec, **max 28-37 ms** sur le Mac (un piqué : murs + nappes).
  ⚠ `vsReserve` n'est pas découpé en tranches : sur iPhone ce pic peut tenir une tranche d'environ 2-3 × plus. Non mesuré sur l'appareil.

### 3.5 Chrome (sous verrou, `?tel=1`) — `node outils/banc-routes/ville-cyber-page.cjs` (nouveau)
Commande (sous `~/cash-car/verrou-banc.sh prendre "ville-cyber-a"`, Chrome muet, serveur `node outils/banc-maps/serveur.cjs 8371 .lots/a`, référence sur 8372) :
`node outils/banc-routes/ville-cyber-page.cjs --port=8371 --cdp=9571 --jeux=slalomtours:7:844x390,pique:3:844x390,russes:11:844x390,slalomtours:4:844x390,pique:11:844x390,russes:4:844x390 --out=<d>`
(+ les trois premiers en 390x844 ; la référence : `--port=8372 --jeux=aucun:7:844x390,aucun:3:…,aucun:11:…,aucun:4:…`). JSON : `page-paysage.json`, `page-portrait.json`, `page-reference.json` ici.
Palier 0, pilote auto (nitro coupée) du départ jusqu'à 150 m après le module.

| module | graine | écran | dbgVilleAudit dans / frole / flotte | mode dans le module | mort | erreurs console |
|---|---|---|---|---|---|---|
| slalom des tours | 7 | 844×390 / 390×844 | 0 / 0 / 0 | drive 40/40, 44/44 relevés | aucune | 0 |
| slalom des tours | 4 | 844×390 | 0 / 0 / 2 | drive 31/31 | aucune | 0 |
| piqué | 3 | 844×390 / 390×844 | 0 / 0 / 0 | drive 28/28, 27/27 | aucune | 0 |
| piqué | 11 | 844×390 | 0 / 0 / 0 | drive 28/28 | aucune | 0 |
| montagnes russes | 11 | 844×390 / 390×844 | 0 / 0 / 0 | drive 21/21, 24/24 | aucune | 0 |
| montagnes russes | 4 | 844×390 | 0 / 0 / 2 | drive 20/20 | aucune | 0 |

Les 2 `flotte` de la graine 4 sont deux enseignes à y = −22 m HORS des modules ; la RÉFÉRENCE (sans lot A) en a aussi 2 sur la graine 4 (et 2 sur la graine 7) : déjà là avant.
Aucun décollage subi : la caisse est restée en mode `drive` à chaque relevé (toutes les 250 ms) dans chaque module.

COMPTES d'une vraie image (renderBufferDirect enveloppé une image, toutes les ~0,9 s, moyenne de la course, 844×390 `?tel=1`) :

| graine | après : appels / triangles | référence (même graine, AUTRE route) | programmes | textures | géométries |
|---|---|---|---|---|---|
| 7 | 112 / 279 k | 104 / 248 k | 154 / 154 | 121 / 121 | 508 / 502 |
| 3 | 115 / 331 k | 107 / 281 k | 154 / 154 | 121 / 121 | 492 / 488 |
| 11 | 122 / 333 k | 120 / 315 k | 154 / 154 | 123 / 123 | 495 / 489 |
| 4 | 116 / 293 k | 99 / 251 k | 154 / 154 | 121 / 120 | 521 / 519 |

⚠ Honnêtement : ~+9 appels (+8 %) et ~+13 % de triangles en moyenne, mais la route n'est PAS la même (le module change la route, donc ce que la caméra voit) —
ce n'est pas une preuve « ≤ avant ». Le neuf n'ajoute aucun maillage (il remplit les familles instanciées existantes) ; programmes et textures égaux. Les +2 à +6
géométries ne viennent pas de `vcBatir` (aucune géométrie neuve) : sans doute d'autres scènes de la route. Une vraie A/B demanderait la même route avec et sans le décor
des modules (non fait).

### 3.6 Planches
`passation/ville-cyber/planches/` : 3 images par module et par graine en 844×390 (18) et en 390×844 (9), 55-80 Ko pièce, vrai jeu, palier 0, `?tel=1`.
Regardées. Mon avis honnête :
- **Le piqué** : oui, on est DANS la ville. Le canyon de tours monte des deux côtés, la route plonge au fond, une nappe de lucioles barre l'avenue devant
  (`pique-g3-844x390-2`, `pique-g3-390x844-2` : le plus fort, surtout en portrait). C'est le module qui répond le mieux à la demande.
- **Les montagnes russes** : on lit les toits sous la crête et l'avenue de tours (`russes-g4-844x390-1`), mais les vagues (15-18°) restent douces à l'image ; l'effet
  « grand huit » est faible. On le sent plus qu'on ne le voit.
- **Le slalom** : en portrait on voit bien une tour droit devant, légèrement décalée (`slalomtours-g7-390x844-3`) ; en paysage, sur les images prises, les tours
  sont sur les côtés et le « slalom ENTRE les immeubles » ne se lit pas encore. Les tours sont à 15 m du bord (règle des scènes) : un frôlement plus proche
  demanderait de baisser la marge, ce que je n'ai pas fait (règle dure du lot).
- Le flou de vitesse du jeu mange beaucoup de détails à 140 m/s sur toutes les images.

## 4. Ce qui N'EST PAS vérifié
- Sur un vrai iPhone : rien (ni la fluidité, ni la tranche de `vsReserve`).
- Les paliers 10 et 20 en Chrome (le banc page part au palier 0) ; le saut nitro refusé n'a pas été joué en vrai (le code est lu, pas éprouvé au pilote `dbgAuto(…,{saut})`).
- La vitrée (banc d'empreinte en panne avant comme après) — elle n'appelle pas le paquet de la ville.
- La tranchée (module 4) : pas faite.

## 5. Décisions pour Sacha
1. Le saut nitro est refusé sur le piqué et les crêtes des montagnes russes (comme aux nuages). Alternative : une piste de réception dans l'axe (≈ 1,75 vD·t0, ~2 s de
   plus par module) — refusée ici parce qu'elle allonge le module et qu'il ne tient déjà qu'une route sur deux au palier 10.
2. Fréquence : au palier 0 presque chaque route (55/60) joue un module route-ville, rarement deux ; au palier 10 une sur deux ; au palier 20 presque jamais
   (la route y dure ~25 s, les scènes d'avant n'y tiennent pas non plus). Le lot U (tirage unique) devra trancher.
3. Le slalom ne garde que 3 tours dès le palier ~5 (LV 1,5) : à 4 il ne tenait jamais.

## 6. Après le contrôle, tour 1 (2026-11-18, matin)

Sorties brutes de ce tour : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-a/t2/`
(`vc*.txt`, `malus-*.txt`, `tors-lot.txt`, `tirage-ab.txt`, `emp-*.txt`, `A-*.txt`, `B-*.txt`, `page.cjs` = le banc page du contrôle + `--fin=`, `prise.sh`).

### 6.1 Ce qui a changé (tout dans `ville-cyber.js`, plus `essai` passé à `vcReserve` dans `vsReserve`)
1. **Le pic de tranche du malus (bloquant 1).** Reproduit d'abord (`controle/malus.cjs`, 101-140, Mac à ~6 de charge) : p0 p95 2,66 / 1,48 ms (lot / réf.), max 3,67 / 2,55.
   Mesuré où va le temps : `vcEcart` (les nappes, 0,36 ms l'appel) et les ~30 `vsLibre` des murs du piqué. Correction : en ESSAI (`vsMalusDecor`), les nappes ne se jugent
   plus (elles se jugent toujours à la pose réelle ; aucune n'a jamais été perdue sur 60 graines × 3 paliers) et chaque mur du piqué passe d'un seul `vsLibre` (son
   rectangle englobant ; refusé = deux tours perdues). La pose réelle ne change pas.
2. **Le slalom des tours (bloquant 3).** La cause, chiffrée : la route ondulait de ±20-28 m sur une dalle de 56 m — la caisse roulait presque droit, les tours
   restaient sur les côtés. Maintenant A/2 = ROAD_HALF + 15 + 6,4 : le CENTRE de chaque tour tombe sur l'axe d'arrivée, les trois tours sont alignées droit devant
   et la route ondule de ±50 m autour d'elles (toujours 15 m du bord de la dalle à l'intérieur du virage, coups de volant 2a = 42-45°, rayon 2,3-2,45 rP). Tours
   fines (12,8 m de large). 3 tours au palier 0, 2 dès LV 1,5 (la place). **Le saut nitro est refusé dans tout le slalom** (`ss`, `vcSautRefuse`) : les tours sont
   dures en vol et maintenant dans l'axe.
3. **Les montagnes russes (bloquant 3).** Chaque vague faisait ~18 m de dénivelé (invisible à 140 m/s). Maintenant 20-23° de pente tenue et une montée deux fois
   plus longue au palier 0 : ~35-40 m par vague ; à vitesse haute la pente et la montée raccourcissent (les arcs de 2,05 vD font déjà le dénivelé). 2 vagues.
   Plat de crête 50 m. Rayon vertical inchangé (2,05 vD dessiné).
4. **La crête de sortie du piqué (mineur).** La remontée à +10 % était cassée net par la descente de la liaison suivante (1,32-1,34 vD au palier 10). La remontée
   se couche maintenant sur un arc de 2,2 vD puis un palier plat de 0,45 vD. La bascule passe de 1,9 à 1,97 vD dessinés (elle tenait 1,69, sous les 1,7 demandés).
5. Longueurs `lg` remesurées (20 graines forcées × 3 paliers, `longueurs2.cjs`) : slalom 18,3 / 8,3 / 5,6 s, piqué 11,7 / 8,9 / 8,3 s, russes 12,2 / 8,4 / 7,7 s.

### 6.2 Preuves (Node)
- **Identité** : `SEARCH='?sans=villecyber' node outils/banc-routes/empreinte.cjs graines=1-12` → ville **d63b36e2af8b / fb378a8c6756** ; sans drapeau crypto
  5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 (inchangés). `controle/emp.cjs` (101-160 + 5 graines 32 bits,
  p0/10/20, points + MODMARK + FILETMARK) : lot `?sans=villecyber` = référence au bit près (9e9e42ce4953 / 50cc745f986f / b86dd1813680) ; crypto, nuages, espace
  du lot sans drapeau = référence aux trois paliers. Gardes vertes, `--verifier` vert, sw.js intact.
- **Tranche du malus** (`controle/malus.cjs`, lot / réf. alternés, ms par appel ; Mac à 6-19 de charge, d'autres bancs tournaient) :

| graines | p0 médiane / p95 / max | p10 médiane / p95 / max | p20 médiane / p95 / max |
|---|---|---|---|
| 101-140 (1) | 1,28 / 4,62 / 16,3 vs 1,27 / 5,55 / 11,9 | 1,12 / 8,01 / 55,2 vs 1,03 / 4,12 / 36,7 | 0,89 / 2,30 / 23,2 vs 0,86 / 3,33 / 37,5 |
| 101-140 (2) | 1,42 / 4,33 / 12,7 vs 1,23 / 3,97 / 12,7 | 1,16 / 3,06 / 24,7 vs 1,05 / 3,71 / 7,4 | 0,91 / 4,03 / 14,0 vs 0,88 / 3,29 / 12,7 |
| 141-180 | 1,20 / 5,60 / 26,6 vs 1,30 / 8,24 / 39,8 | 1,12 / 3,94 / 27,5 vs 1,05 / 4,47 / 29,5 | 0,82 / 5,16 / 16,6 vs 0,77 / 4,11 / 43,1 |
| 181-220 | 1,43 / 5,13 / 59,3 vs 1,41 / 8,31 / 18,3 | 1,17 / 3,02 / 10,4 vs 1,16 / 3,77 / 28,2 | 0,89 / 3,19 / 90,8 vs 0,88 / 4,09 / 28,9 |

  Le p95 du lot est maintenant au niveau de la référence (au-dessous 8 fois sur 12) ; les max sautent d'un côté comme de l'autre (GC, Mac chargé) ; la médiane
  reste +0-15 % (un plan de plus par route). Avant la correction, sur Mac calme : p95 ×1,8.
- **Banc des modules** (`ville-cyber.cjs graines=101-160`, puis forcés 101-150 × 3 modules) : règle des 14 m **0**, audit dans / frôle **0 / 0**, nappes < 12 m **0**,
  **0 plan de module abandonné**, partout. Pièces perdues : seulement des tours de creux des montagnes russes (raison `route`, 15/49 au p0) et 4 nappes (`nappe`, piqué
  forcé, p0) — le plan reste posé. Passerelle 3 abandonnées au p0 (référence sur les mêmes graines : 8, et 3 vrilles) : pas plus qu'avant.

| palier | routes 0 / 1 / 2 modules | slalom / piqué / russes | raccourcis/route | rayon plan mini (rP) | crêtes verticales mini (× vD) |
|---|---|---|---|---|---|
| 0 | 15 / 44 / 1 | 15 / 15 / 16 | 2,00 | slalom 2,17, piqué 2,17, russes 5,5 | piqué 1,75 (bascule), russes 2,03 ; creux ≥ 1,86 |
| 10 | 30 / 30 / 0 | 10 / 6 / 14 | 1,00 | 2,07 / 2,05 / 9,0 | piqué 1,81 (la sortie n'est plus le minimum), russes 2,10 ; creux ≥ 1,67 |
| 20 | 54 / 6 / 0 | 5 / 1 / 0 | 0,47 | 1,96 / 2,10 | piqué 1,74 |

  Forcés : bascule du piqué 1,73 vD au pire (p0), 1,75 (p10), 1,83 (p20). Pente maxi du piqué 36-38°, des russes 22° (p0) / 18° (p10).
- **Torsades** (`ville-torsades.cjs graines=101-160`, lot ; référence = contrôle) : torsades/route p0 0,4 (réf. 1,02), p10 0,18 (0,23), p20 0,15 (0,15) ; boucles ≥ 180°
  p0 2,02 (2,3), p10 1,73 (1,77), **p20 0,87 (0,78) — inchangé depuis le tour 1** : aucun module neuf ne fait de boucle (le slalom ne tourne que de ±21°, les russes ±22°) ; la
  différence vient des autres modules que tire une route décalée (`saut`, `spirale`, `rondpoint`). RMIN 2,04 / 1,97 / 1,77 rP (réf. 2,04 / 1,93 / 1,78). Tenue de cap t30 pire 9,17 s.
- **Tirage total** (`ville-tirage-ab.cjs`, réf. / lot, 101-110 × 2) : p0 146 / 132 ms, p10 135 / 138, p20 138 / 146 (±6 %, bruit du Mac).

### 6.3 Preuves (Chrome, sous verrou, `?tel=1`, Chrome muet, 4 prises de 3-6,5 min)
`toutes.mjs cartes=ville paliers=0,10,20 graines=101-103` : 9 routes, 0 infraction, 0 serré ; les 2-3 « douilles » par route au p0 sont toutes à la sortie du grand
saut (raccourci), après le module (slalom 1184-2439 m, douilles 3944-4124 m sur g102).

Courses au pilote auto (nitro coupée), palier 0, jusqu'à 150 m après le module (`?villescene=` ne force le module que là où il tient : 6 courses sur 15 ne l'ont pas
joué et ne comptent pas ci-dessous) :

| module | graine · écran | dbgVilleAudit dans / frôle / flotte | modes dans le module | mort | erreurs console |
|---|---|---|---|---|---|
| slalom | 131 · 844×390, 390×844 | 0 / 0 / 0 | drive 47 / 47 | aucune | 0 |
| slalom | 102, 108 · 844×390 | 0 / 0 / 2 | drive 52, 40 | aucune | 0 |
| piqué | 122 · 844×390, 390×844 | 0 / 0 / 2 | drive 20 / 20 | aucune | 0 |
| piqué | 110 · 844×390 | 0 / 0 / 2 | drive 22 | aucune | 0 |
| russes | 106, 112 · 844×390 | 0 / 0 / 2 | drive 27, 31 | aucune | 0 |
| russes | 107 · 390×844 | 0 / 0 / 0 | drive 27 | aucune | 0 |

Les `flotte` 2 sont, chaque fois, deux enseignes de la TRAVERSÉE (même scène d'ouverture, 58 m d'écart, y −22 à −30, hors modules) ; la référence `?sans=villecyber`
a les deux mêmes sur la graine 122.
SAUTS (pilote `{nit:0,saut:1,vol:true}`, slalom 131 et 102) : aucune mort ; 3-4 relevés en vol (`fall`) dans la fenêtre comptée du module — où exactement n'est pas
relevé (la fenêtre de refus s'arrête à la dernière tour, la fenêtre du banc 1 s plus loin : vraisemblablement la sortie).

**COMPTES (même route, même distance 0-2 200 m, 844×390 `?tel=1`)** — le lot contre le MÊME index où seul `vcBatir` est coupé (copie patchée servie à part,
`racine-nd/`), puis contre `?sans=villecyber` :

| graine (module joué) | lot : appels / triangles (moy. course) | lot sans le décor des modules | `?sans=villecyber` (autre route) |
|---|---|---|---|
| 122 (piqué) | 104 / 299,2 k ; dans le module 104 / 300,5 k | 111 / 299,4 k ; 113 / 300,3 k | 99 / 304,3 k |
| 131 (slalom) | 115 / 324,2 k ; dans le module 111 / 313,9 k | 115 / 324,4 k ; 110 / 314,0 k | 88 / 245,9 k |
| 107 (russes) | 109 / 307,6 k | 124 / 309,0 k | 102 / 284,3 k |
| 105, 113 (aucun) | 104 / 269,3 k ; 109 / 315,4 k | 112 / 270,0 k ; 118 / 316,4 k | 103 / 264,4 k ; 114 / 331,6 k |
Programmes 153-154, textures 113-121, géométries 512-550 : égaux entre les trois.
**Le décor des modules ne coûte rien** : à route égale, triangles à ±0,5 % et appels dans le bruit de l'échantillonnage (le relevé tombe à des instants différents).
L'écart avec `?sans=villecyber` vient de la ROUTE (une autre route, d'autres scènes) — dans les deux sens (g113 : −16 k triangles avec le lot, g131 : +78 k).
Ce que ça ne prouve pas : qu'une route du lot coûte en moyenne ce que coûte une route d'avant (il faudrait beaucoup de graines) ; rien n'est mesuré sur un vrai iPhone.

### 6.4 Planches (vrai jeu, `planches/`, 55-80 Ko) — regardées
Les planches du tour 1 du slalom et des montagnes russes sont rangées dans `planches/tour1-ancien/` (géométrie d'avant).
- **Slalom** (`slalomtours-g102-844x390-1`, `-g131-390x844-1`, `-g131-844x390-2`) : on voit maintenant une tour haute, néon en arête, au bord immédiat de la route qui
  tourne autour d'elle ; en portrait c'est net (la tour droit devant, la route s'incurve). En paysage c'est mieux qu'au tour 1 mais pas spectaculaire : la dalle fait 56 m,
  la tour est à 15 m du bord (règle dure), et le flou de vitesse mange le premier plan (`g108-2` : rien ne se lit). Honnêtement : lisible, pas saisissant.
- **Montagnes russes** (`russes-g107-390x844-2`, `-g112-844x390-2`) : le creux puis la crête qui remonte entre deux murs de tours se lisent, surtout en portrait ;
  `g106-1` (en haut d'une crête) reste une avenue plate. Lisible deux fois sur trois.
- **Piqué** (`pique-g122-844x390-2`, `-390x844-2`) : toujours le plus fort — le fond du canyon, la remontée entre les murs.

### 6.5 Ce qui reste / non vérifié
- Rien sur un vrai iPhone (fluidité, tranche du malus ×2-3 plus lente qu'au Mac — maintenant au niveau de la référence au Mac).
- Paliers 10 et 20 : en Node seulement (Chrome au palier 0 ; `toutes.mjs` génère les trois paliers sans décor).
- Le slalom passe de 4-5 tours à 3 (2 dès LV 1,5) : plus lisible, moins de tours. Il dure 18 s au palier 0 (le plus long des modules de la ville avec le phare).
- La tranchée (module 4) : toujours pas faite.

## 7. Après le contrôle, tour 2 (2026-11-19)

Sorties brutes de ce tour : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-a/t3/`
(`reserve-t3-min.cjs` / `.txt`, `patch3.cjs` + `tr3.cjs` / `tr.txt`, `vc-*.txt`, `tors-lot.txt`, `tirage-ab.txt`, `emp-*.txt`, `A/`, `C/`, `prise.sh`).

### 7.1 Bloquant 1 — la tranche qu'on ne peut pas couper (corrigé)
Reproduit d'abord : `reserve-t3.cjs` (le banc `controle2/reserve-jeu.cjs` du contrôle), Mac à 60 de charge, vsReserve d'un tenant du piqué p95 14 ms contre 9 ms pour la référence.
La cause est celle que le contrôle a vue : `vsReserve(V9)` tourne avant le premier point de coupe de `buildVoxCityG`, et `vcReserve` y posait tout le piqué (≈ 30 `vsLibre` des murs, `vcEcart`/`vcFrole` des nappes).
Correction (même résultat au bit près, découpé) :
- `vcReserve` devient un générateur `vcReserveG(V,a,P0,non,essai,ech)` qui peut céder (`ech`, l'échéance `JF.lim`) avant chaque tour, chaque mur, chaque nappe. `vcReserve` (le meilleur-de-N, les bancs) le mène d'un trait (`rythmeMene`).
- `vsReserve` met les plans des modules de côté quand `V.vcDiff` existe (`[ancre, P0, non]`) au lieu de les juger. Un plan de module ne se juge contre aucun autre plan, donc l'ordre ne change rien.
- `buildVoxCityG` (jade-balade.js, un raccord d'une ligne gardé `VILLE_CYBER`) : `V9.vcDiff=[]`, `vsReserve(V9)`, puis `yield* vcReserveG(…, ech9)` pour chacun, AVANT les tours ordinaires (qui lisent les emprises par `vsBloque`).
- Même chose pour la pose : `vcBatir` devient `vcBatirG`, mené par `yield*` dans `vsBatirG`, avec une pause possible avant chaque tour, mur et nappe. La tranche d'un plan du piqué pesait 14 ms au pire, contre 3 ms pour la référence, au même banc sous charge.

Preuves :
- **Égalité** : `reserve-t3-min.cjs` compare, sur chaque route, le plan en tranches au plan d'un trait (types, ok, raisons, pièces, nappes, emprises, pertes, centres) : **0 différence** sur 60 graines × 3 paliers.
- **Node, chaque mesure = le minimum de 5 répétitions** (le Mac est chargé), graines 101-160, lot / référence (ms) :

| palier | vsReserve d'un tenant, médiane / p95 / max | plus longue pièce d'un module (piqué), médiane / max | tranche max de vsBatirG, p95 / max |
|---|---|---|---|
| 0 | 0,27 / 0,41 / 0,44 contre 0,32 / 0,54 / 0,68 | 0,35 / 0,44 | 0,06 / 0,08 contre 0,08 / 0,11 |
| 10 | 0,37 / 0,55 / 0,60 contre 0,33 / 0,58 / 0,69 | 0,35 / 0,43 | 0,16 / 0,18 contre 0,18 / 0,18 |
| 20 | 0,22 / 0,35 / 0,36 contre 0,22 / 0,35 / 0,45 | 0,36 | 0,19 / 0,20 contre 0,22 / 0,24 |

- **Chrome** (`patch3.cjs` chronomètre chaque point de coupe de `buildVoxCityG` et `vsBatirG`. La mesure retenue est l'écart entre deux points de coupe : la plus longue tranche qu'on ne peut pas couper. `tr3.cjs`, 844×390 `?tel=1`, lot et référence alternés, mêmes graines que le contrôle) :

| graine (module) | tête (jusqu'au 1er point de coupe) lot / réf. | plus longue tranche lot / réf. |
|---|---|---|
| 116 (piqué) | 1,9 / 2,3 | 3,7 / 3,6 |
| 146 (piqué) | 1,7 / 1,8 | 3,7 / 4,4 |
| 134 (piqué) | 1,7 / 1,6 | 5,1 / 5,8 |
| 122 (piqué) | 2,0 / 1,7 | 5,3 / 3,8 |
| 110 (piqué) | 1,8 / 1,9 | 4,2 / 3,8 |
| 114 (slalom) | 1,8 / 1,8 | 4,4 / 7,1 |
| 118 (russes) | 1,4 / 1,8 | 2,4 / 3,0 |

  Avec le piqué, la tête passe en moyenne à 1,82 ms contre 1,86 ms pour la référence. Au tour 2, elle était à 2,78 ms contre 1,74 ms. La plus longue tranche fait 4,4 ms contre 4,3 ms, dans le bruit, et ce n'est pas un morceau des modules : leur plus longue pièce dure 0,44 ms en Node.
  Cette mesure Chrome a été prise avant l'élargissement de la tour du slalom (§ 7.2). Les lignes du piqué et des russes valent pour le code final ; celle du slalom 114 est faite avec des tours de 12,8 m (les bandeaux ajoutent 8 instances `lum`, posées en tranches). Les chiffres Node sont tous mesurés sur le code final.
  (La « tête » du contrôle allait jusqu'à `kC`. Elle compterait maintenant les pièces des modules, qui sont pourtant coupables : c'est pourquoi on mesure l'écart entre deux points de coupe.)

### 7.2 Bloquant 2 — le slalom ne se lisait pas (reconstruit)
La cause : la route ondulait d'un sommet à l'autre sans jamais VISER une tour. Les tours étaient bien sur l'axe d'arrivée, mais la caisse était déjà dans un virage de 21° quand elles approchaient.
Le module se rejoue donc ainsi, pour chacune des 2 tours :
1. une ligne droite DANS l'axe, droit sur la tour (0,3 × la croisière ; 0,18 dès le palier 10 ; la première est l'entrée) ;
2. l'écart au dernier moment (arc de 21-22,5°, droite S1, arc inverse : 49 m de côté de plus) ;
3. le sommet le long de la tour (double arc, la tour à l'intérieur, à 15 m du bord de la dalle) ;
4. le retour dans l'axe (arc, S1, arc).
La tour suivante est alors de nouveau droit devant, et on l'évite de l'autre côté.

La tour s'élargit : 25,6 m au lieu de 12,8 (à 200 m, la fine se perdait dans le flou). Sa face d'arrivée porte maintenant 4 bandeaux de néon en travers, sur toute sa largeur, en plus de la raie verticale. Le tout passe par la famille `lum` existante : 0 appel, 0 matière.
2 tours à tous les paliers : avec 3, le module durait 20,7 s au palier 0 et une route forcée sur douze seulement le jouait. `lg` est remesuré sur 20 graines forcées : 16,2 / 9,6 / 6,4 s.
Rayons : 2,17 rP au palier 0, 2,06 au palier 10, 2,03 au palier 20 (20 m) ; 2,17-2,30 rP sur 80 m. Pente ≤ 5,4°.

À l'image (vrai jeu, palier 0, `?tel=1`, `ville-cyber-page.cjs --ph=0,.04,.08,.43,.47` : les photos tombent à l'approche de chaque tour). Les planches sont dans `planches/*-tour3.jpg` ; celles du tour 2 sont rangées dans `planches/tour2-ancien/`. Je les ai regardées, et voici mon avis honnête :
- **Portrait (390×844)** : la tour barre l'axe, droit devant, au-dessus de la route, avec ses bandeaux de néon, sur les **2 graines sur 2** (`g108-4`, `g108-5`, `g139-2`, `g139-3`). Puis la route s'écarte. C'est le « on voit la tour droit devant, on l'évite » demandé.
- **Paysage (844×390)** : **1 graine sur 2**. Sur `g114-4`, la tour verte à bandeaux est au centre, au bout de la route. Sur `g102-4`, une tour sombre est au centre mais noyée dans le flou de vitesse ; on la devine plus qu'on ne la lit. Le frôlement lui-même (la tour qui défile à 15 m du bord) ne ressort sur aucune photo : à 140 m/s, le flou mange le premier plan.
  C'est mieux qu'au tour 2 (0 sur 7), mais ce n'est pas saisissant en paysage. La limite est géométrique : pour passer à 49 m de côté au rayon tenable de 2,3 rP, l'écart commence environ 180 m (1,3 s) avant la tour. La tour est donc droit devant de loin, pas au tout dernier moment. Pour aller plus loin, il faudrait frôler plus près que 15 m (la règle des scènes) ou casser le flou ; je n'ai fait ni l'un ni l'autre.

Courses au pilote auto (nitro coupée, palier 0, 844×390 et 390×844) sur le code final :

| module | graine · écran | dans / frôle / flotte | modes dans le module | mort | erreurs | appels / triangles (moyenne de course) |
|---|---|---|---|---|---|---|
| slalom | 114 · 844×390 | 0 / 0 / 2* | drive 39 | aucune | 0 | 129 / 326 k |
| slalom | 102 · 844×390 | 0 / 0 / 2* | drive 43 | aucune | 0 | 109 / 281 k |
| slalom | 139 · 390×844 | 0 / 0 / 0 | drive 39 | aucune | 0 | 107 / 254 k |
| slalom | 108 · 390×844 | 0 / 0 / 2* | drive 37 | aucune | 0 | 102 / 276 k |
| piqué | 116 · 844×390 | 0 / 0 / 2* | drive 21 | aucune | 0 | 118 / 304 k |
| russes | 118 · 390×844 | 0 / 0 / 2* | drive 27 | aucune | 0 | 108 / 286 k |

\* Ce sont les deux enseignes de la traversée (y −22 à −30, hors des modules), déjà là dans la référence.
Au premier essai du slalom élargi (A/, tours fines de 2 × 6,4 m, mêmes graines plus la 131), j'ai eu 0 / 0 aussi, 0 mort, 0 erreur. J'ai aussi lancé un saut (`{nit:0,saut:1,vol:true}`, slalom 114) : drive 39, aucun vol (le saut est refusé dans le module), aucune mort.
Comptes : le décor neuf, ce sont 4 bandeaux de néon de plus par tour du slalom, soit 8 instances dans la famille `lum` existante. Il n'ajoute aucun appel, aucune géométrie, aucune matière, aucun programme. Les appels restent entre 102 et 129, comme au tour 2 (programmes 153-154, textures 119-121, géométries 514-536). Je n'ai pas refait l'A/B à route égale.

### 7.3 Mineur — les tours de creux perdues des montagnes russes (atténué)
Quand une autre partie de la route passe là, la tour du creux glisse de 36 m le long du creux, en amont puis en aval, toujours au même flanc. Elle n'est perdue que si les trois places sont prises.
Pertes au palier 0 : 11 tours sur 64 sur les graines 101-160 (contrôle : 15 sur 64), 12 sur 72 forcées (contrôle : 30 sur 120). On passe donc de 25 % à environ 17 %. Le plan reste posé et la règle des 14 m reste à 0.

### 7.4 Mineur — la fréquence des scènes d'avant au palier 0
Laissée au lot U, comme le contrôle le propose. Sur les graines 101-160 au palier 0 : façade 8, portes 4, passerelle 2 (+3 abandonnées, la référence en abandonne autant).

### 7.5 Le reste des preuves (code final)
- **Identité** : avec `SEARCH='?sans=villecyber'`, `empreinte.cjs graines=1-12` donne ville **d63b36e2af8b / fb378a8c6756**. Sans drapeau, crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93 et espace 9c99fae61d38 / ea2d9e750351 sont inchangés. La ville sans drapeau reste 17b89297a6b8 / 9dc6766ea34f : le slalom ne sort pas sur les graines 1-12. Hors drapeau, le découpage ne passe que par `V9.vcDiff`, posé seulement quand `VILLE_CYBER` est vrai. Le diff de l'index contre la référence ne contient que le lot.
- **`ville-cyber.cjs graines=101-160`** (et forcés 101-150 × 3 modules), aux paliers 0, 10 et 20 :
  - règle des 14 m **0** ; audit dans / frôle **0 / 0** ; nappes à moins de 12 m **0** ; **0 plan de module abandonné** ;
  - raccourcis par route : 2,00 / 1,00 / 0,45 ;
  - routes jouant 0 / 1 / 2 modules : p0 15/44/1, p10 33/27/0, p20 53/7/0 ;
  - sorties de chaque module au p0 : slalom 15, piqué 15, russes 16 ;
  - rayons en plan : slalom 2,17 / 2,06 / 2,03 rP ; piqué 2,17 / 2,05 / 2,10 rP ;
  - crêtes verticales : piqué ≥ 1,73 vD, russes ≥ 2,03 vD.
- **Torsades** (`ville-torsades.cjs graines=101-160`) : torsades par route 0,47 / 0,2 / 0,15 (référence 1,02 / 0,23 / 0,15) ; boucles ≥ 180° 2,02 / 1,75 / 0,87 (réf. 2,3 / 1,77 / 0,78) ; RMIN 2,04 / 1,97 / 1,77 rP ; suites > 220° hors raccourci 1 / 0,02 / 0. Tenue de cap t30 au pire 8,6 s.
- **Tirage** (`ville-tirage-ab.cjs A='?sans=villecyber' B='' graines=161-172 rep=2`) : B/A ville 1,00 / 1,00 / 0,98, crypto 0,95 / 1,06 / 1,00.
- Gardes : `garde-demarrage`, `garde-allege.sh`, `garde-charte.sh` et `assembler --verifier` sont vertes. `sw.js` et les autres maps sont intacts. Rien n'est commité.

### 7.6 Toujours non vérifié
- Rien sur un vrai iPhone : ni la fluidité, ni la longueur des tranches à l'appareil.
- Pas de course en Chrome aux paliers 10 et 20 (seulement Node).
- La vitrée : les bancs Node sont en panne avant comme après. Le raccord de `buildVoxCityG` ne change rien pour elle (aucune ancre de module, `vcDiff` reste vide).
- L'A/B des comptes à route égale n'a pas été refait pour les bandeaux du slalom.
- La tour du slalom tient la demande en portrait, à moitié seulement en paysage (§ 7.2).
- La tranchée (module 4) n'est pas faite.
