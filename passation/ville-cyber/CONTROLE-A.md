# Contrôle adverse du lot A (les modules route-ville, `?sans=villecyber`)

## Tour 1 (2026-11-18, nuit) — VERDICT : REFUSÉ

Bancs et sorties brutes : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-a/controle/`
(`emp.cjs`, `malus.cjs`, `vol-droit.cjs`, `vs.cjs`, `page.cjs` = copie du banc page de l'auteur avec `--auto=`). Graines du contrôle : 101-160, et 60 graines 32 bits (4294967236-4294967295 ; 2147483647, 3000000001, 987654321, 4294967295, 123456789 pour les empreintes).

### 1. Identité, périmètre, gardes — VERT
- `SEARCH='?sans=villecyber' node outils/banc-routes/empreinte.cjs graines=1-12` (dans `.lots/a`) : ville p0 **d63b36e2af8b**, p10 **fb378a8c6756** ; crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 (sans drapeau : identiques). OK.
- Mon banc `emp.cjs` (graines 101-160 + 5 graines 32 bits, paliers 0/10/20, empreinte des points ET de `MODMARK` + `FILETMARK` — les ancres du décor) : lot `?sans=villecyber` = référence au bit près pour la ville (9e9e42ce4953 / 50cc745f986f / b86dd1813680) ; lot SANS drapeau = référence pour crypto, nuages, espace aux trois paliers.
- La vitrée ne se charge pas dans les bancs Node (`VIT_SOL` puis `vitreAplanir` manquants, avant comme après). Vérifié au code seulement : sa branche `MC==='vitree'` de `MCJ` est intacte, `vcPaquet`/`vcIndice` sont gardés `MC==='ville'`, `vcModules` ne tire rien à sa construction.
- `git diff` : code/ORDRE.txt, maps/ville-entree.js, maps/ville-scenes.js, maps/ville-cyber.js (neuf), outils/banc-routes/charge.cjs (+ deux bancs neufs). Rien hors périmètre, sw.js intact. Pas de `//` en milieu de ligne ; la regex `\w+` de `?villescene=` est intacte.
- `node code/assembler.cjs --verifier` : OK (348 morceaux). `node outils/garde-demarrage.cjs && sh garde-allege.sh && sh garde-charte.sh` : OK / OK / OK. La seule chose retirée de l'image (une luciole sur deux) est gardée par `ALLEGE`.

### 2. Génération (Node, vrais générateurs) — propre, un point mineur
`node outils/banc-routes/ville-cyber.cjs graines=101-160 paliers=0,10,20`, puis la même chose avec 60 graines 32 bits, puis forcé (`SEARCH='?villescene=slalomtours|pique|russes'`, graines 101-150) :
- Règle des 14 m : **0** ; audit dans / frôle : **0 / 0** ; nappes à moins de 12 m : **0** ; **0 plan abandonné** (cslalom, cpique, crusse), partout.
- Pièces perdues : seulement des tours de creux des montagnes russes (raison `route`) : 20/90 au p0 (101-160), 19/82 (32 bits), 26/112 (russes forcé). Le décor reste posé.
- Sorties (101-160) : p0 slalom 15, piqué 20, russes 22, routes avec 0/1/2 modules = 5/53/2 ; p10 10/10/6, 34/26/0 ; p20 slalom 5, piqué 1, 54/6/0. Raccourcis/route 2,00 / 1,00 / 0,47 : inchangés.
- Rayons en plan : slalom 2,17 / 2,05 / 1,95 rP, piqué 2,17 / 2,05 / 2,00 rP (p0/p10/p20) : au niveau de la plongée d'avant (1,98 / 2,04 / 1,74).
- **Mineur** : rayon vertical de crête du piqué à la SORTIE du module (99 %) au palier 10 : **1,34 vD** (graine 123 ; 1,33 vD forcé, graine 113), sous les 1,7 vD de la demande et sous la plongée d'avant (1,48-1,57). La bascule tient 1,67-1,69 vD.
- `ville-torsades.cjs graines=101-160 carte=ville`, lot / référence : torsades/route p0 0,6 / 1,02, p10 0,18 / 0,23, p20 0,15 / 0,15 ; boucles ≥ 180° p0 2,07 / 2,3, p10 1,75 / 1,77, **p20 0,87 / 0,78** (un peu plus) ; RMIN 2,04 / 2,04, 1,97 / 1,93, 1,77 / 1,78 rP ; tenue de cap t30 pire 9,06 s (sous 10 s).
- La génération reste en tranches (aucune boucle neuve dans `genCtrl1`, `vcBatir` passe par `vsBatirG` qui cède entre les plans). Mais voir § 3.

### 3. Coût du tirage PAR TRANCHE — **BLOQUANT**
`vsMalusDecor` (le malus décor du meilleur-de-N) est un terme d'un seul tenant dans `malusG` : il appelle `vsReserve(V,true)`, donc `vcReserve` (vsLibre pièce par pièce + `vcEcart` en 3D pour chaque nappe), une fois **par candidat**. Mon banc `malus.cjs` chronomètre chaque appel, lot et référence en alterné, mêmes graines :

| palier | graines 101-140 : médiane / p95 / max (ms), lot vs réf. | graines 141-180 : médiane / p95 / max (ms), lot vs réf. | total malus |
|---|---|---|---|
| 0 | 2,24 / **19,1** / **85,2** vs 1,34 / 9,9 / 25,1 | 2,07 / **14,7** / **75,6** vs 1,37 / 6,5 / 25,1 | **×1,9 / ×2,0** |
| 10 | 1,28 / 18,2 / 82,5 vs 1,23 / 10,4 / 94,0 | 1,36 / 11,1 / 64,2 vs 1,16 / 11,5 / 44,7 | ×1,36 / ×1,38 |
| 20 | ≈ réf. | ≈ réf. | ≈ |

Au palier 0 (là où presque chaque route joue un module), le p95 de la tranche double et son pic triple, sur deux lots de graines : c'est hors du bruit (le Mac était à 20-55 de charge, mais les deux variantes alternaient). Sur iPhone, ×2-3 de plus. L'auteur le signale lui-même (« vsReserve n'est pas découpé en tranches »). La règle « temps de tirage par tranche ≤ avant » n'est pas tenue. Le tirage total (`ville-tirage-ab.cjs graines=101-110`) reste à +2 % au p0 et au p10 : le défaut est le PIC d'une tranche, pas le total.
Piste : découper `vcReserve` (céder entre deux pièces dans le malus, ou ne juger les nappes qu'à la pose réelle), ou borner `vcEcart` par pièce.

### 4. Le vrai jeu (Chrome) — **NON FAIT**
Les deux prises étaient prêtes (`priseA.sh` : `toutes.mjs cartes=ville paliers=0,10,20 graines=101-103`, 6 courses au pilote auto sur 6 graines neuves (105, 131, 107, 122, 113, 140) en 844×390 et 390×844, `?tel=1`, et 4 courses avec sauts (`dbgAuto(1,0,{nit:0,saut:1,vol:true})`) dans le slalom ; `priseB.sh` : comptes renderer.info lot / `?sans=villecyber` sur 5 graines). Le verrou commun n'a jamais été libre pour moi en ~95 min (14-15 sessions en attente). J'ai arrêté mes attentes ; aucun Chrome à moi n'est resté ouvert.
Donc NON VÉRIFIÉS par moi : 0 erreur console, 0 mort subie, dbgVilleAudit sur mes graines, `toutes.mjs`, et surtout les COMPTES. Les chiffres de l'auteur (`page-*.json`) montrent sur 4 graines sur 4 **+8 % d'appels et +13 % de triangles** en moyenne de course, contre une référence qui roule une AUTRE route, sur une distance différente (fin du module + 150 m contre 2 500 m). Ce n'est pas une preuve « ≤ avant », et 4/4 dans le même sens n'est pas du bruit. Doute non levé, donc **défaut**.

### 5. Ce que l'image montre (planches de l'auteur, regardées)
- Piqué (`pique-g3-844x390-2`, `pique-g3-390x844-2`) : oui. Le canyon de tours, le fond visible, une nappe rouge en travers. La demande est servie.
- Montagnes russes (`russes-g4-844x390-1`) : une avenue de tours plate. Aucune vague ni toit ne se lit. Pas servie à l'image.
- Slalom des tours (`slalomtours-g7-844x390-2`, `-390x844-3`) : en paysage, aucune tour droit devant ; en portrait, une tour un peu décalée. Le « slalom ENTRE les immeubles » ne se lit pas. Pas servie (l'auteur le dit aussi).
- La tranchée (module 4) n'est pas faite : elle était facultative.

### 6. Autres constats
- Saut dans le slalom : les tours sont DURES en vol (`villeHeurt`, mort « tour »), et le saut n'est pas refusé dans le slalom. Un vol droit de 1,5 s (`vol-droit.cjs`, slalom forcé, p0, graines 101-125) touche une tour du slalom depuis ~10 points de route par route jouée, contre ~30 pour l'ensemble des autres scènes. Ce n'est pas pire que l'existant, mais ce n'est pas éprouvé au pilote (Chrome non fait).
- `vcPaquet` met une carte route-ville en tête de la ville sur 55 routes sur 60 au palier 0. Ce choix de fréquence revient au lot U.

### Ce qu'il faut pour un tour 2
1. Ramener le pic de tranche de `vsMalusDecor` au p0 au niveau d'avant (p95 ≈ 10 ms, max ≈ 25 ms sur ce Mac), preuve par `malus.cjs` (lot / réf., alterné).
2. Faire une A/B des comptes sur la MÊME distance et sur ≥ 5 graines (`priseB.sh`), ou prouver que le surcoût vient de la route et pas du décor (même route avec et sans `vcBatir`).
3. Rendre le slalom et les montagnes russes lisibles à l'image (tour droit devant dans l'axe, vagues visibles), photos à l'appui.
4. Le contrôle Chrome (courses, console, audit, sauts dans le slalom) reste à faire.

## Tour 2 (2026-11-18 → 19) — VERDICT : REFUSÉ

Code contrôlé : `ville-cyber.js` du 18/11 07:49, `ville-scenes.js` 07:39, `ville-entree.js` 02:57, index assemblé 07:49 (inchangés depuis). Rien corrigé dans le lot.
Sorties brutes : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-a/controle2/` (Node + 3 prises Chrome du 18/11, 11:32-11:44)
et `.../controle3/` (1 prise Chrome du 19/11, 12:44-12:47 : `patch.cjs`, `tr.cjs`, `prise.sh`, `tr.txt`, `gen10ref.txt`). Graines du contrôle : 101-220 et 60 graines 32 bits.

### 1. Identité, périmètre, gardes — VERT
- `SEARCH='?sans=villecyber' node outils/banc-routes/empreinte.cjs graines=1-12` (relancé le 19/11) : ville **d63b36e2af8b / fb378a8c6756** ; crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 ; sans drapeau : crypto/nuages/espace identiques, ville 17b89297a6b8 / 9dc6766ea34f (le neuf).
- `controle/emp.cjs` (101-160 + 5 graines 32 bits, p0/10/20, points + MODMARK + FILETMARK) : lot `?sans=villecyber` = référence au bit près (9e9e42ce4953 / 50cc745f986f / b86dd1813680) ; crypto, nuages, espace du lot sans drapeau = référence (809646f5617c…, ea9c0b68088b…, c598d5b726d5…). La vitrée ne se charge pas dans les bancs Node, avant comme après (vérifiée au code seulement).
- index du lot contre index de la référence : 173 lignes de diff, toutes le lot (raccords + ville-cyber.js). `git diff` : ORDRE.txt, ville-entree.js, ville-scenes.js, charge.cjs, + neufs. sw.js, autres maps, rendu partagé : intacts. Regex `\w+` de `?villescene=` intacte.
- `node code/assembler.cjs --verifier` OK (348 morceaux) ; `garde-demarrage` OK, `garde-allege.sh` OK, `garde-charte.sh` OK (relancées le 19/11). Le seul retrait d'image (une luciole sur deux) est sur `ALLEGE`.

### 2. Génération (Node, vrais générateurs) — propre
- `ville-cyber.cjs graines=101-160 paliers=0,10,20`, puis 60 graines 32 bits, puis forcés (`?villescene=slalomtours|pique|russes`) : règle des 14 m **0**, audit dans / frôle **0 / 0**, nappes < 12 m **0**, **0 plan de module abandonné**. Pièces perdues : tours de creux des montagnes russes (`route`) 15/64 au p0, 30/120 forcé ; 3 nappes (`nappe`) en piqué forcé. Raccourcis/route 2,00 / 1,00 / 0,45-0,47 (inchangés). Routes à 0/1/2 modules (101-160) : p0 15/44/1, p10 30/30/0, p20 ≈ 59/1/0.
- Rayons (vitesse réelle) : plan slalom 2,17 / 2,05 rP, piqué 2,17 / 2,05 rP, russes ≥ 5,5 rP ; crêtes verticales piqué 1,73-1,83 vD (bascule), russes 2,03-2,10 vD, creux ≥ 1,66 vD. La crête de sortie à 1,34 vD du tour 1 a disparu. Pente du piqué 31-38°.
- `ville-torsades.cjs graines=101-160` lot / réf. : torsades p0 0,4 / 1,02, p10 0,18 / 0,23, p20 0,15 / 0,15 ; boucles ≥ 180° 2,02 / 2,3, 1,73 / 1,77, 0,87 / 0,78 ; RMIN 2,04 / 2,04, 1,97 / 1,93, 1,77 / 1,78 rP ; « suites > 220° hors raccourci » 1 / 1,03, 0,02 / 0, 0 / 0. R1/R2 tenues.
- Tirage total (`ville-tirage-ab.cjs`, 161-172 × 2) : B/A 1,02 / 0,98 / 0,96. Malus du meilleur-de-N par appel (`reserve.cjs`, 101-160 et 32 bits) : p95 2,71 / 2,80 et 2,61 / 2,41 ms (lot / réf.) : le bloquant 1 du tour 1 est levé.

### 3. Le vrai jeu (Chrome, sous verrou, `?tel=1`, muet)
- `toutes.mjs cartes=ville paliers=0,10,20 graines=161-164` lot et `&sans=villecyber` : 12 + 12 routes, **0 infraction**, 0 serré.
- `banc.cjs gen --tel=1 --palier=10 / 20 --graines=114,116,118` + audit : 3/3 sans erreur, 0 croisement, 0 trou ; obstacles 6,7,8 (p10) / 6,6,8 (p20) contre la référence 19,6,7 (p10) : rien de plus.
- Courses au pilote auto (palier 0, nitro coupée), MES graines : slalom 114 (844×390), 139 (390×844) ; piqué 116 (844×390), 146 (390×844) ; russes 118 (844×390), 142 (390×844) : **dbgVilleAudit dans 0 / frôle 0** partout (flotte 0-2 : les deux enseignes de la traversée, déjà là dans la référence), **0 erreur console, 0 mort**, mode `drive` à chaque relevé dans le module.
- Sauts (`{nit:0,saut:1,vol:true}`), slalom 150, piqué 134, russes 124 : 0 mort, 0 erreur.
- Comptes (moyenne de course, 0-2 200 m, 5 graines, lot / référence — routes DIFFÉRENTES) : appels 108 / 111, triangles 311 k / 298 k (+4 %, signe variable selon la graine : g114 −21 %, g118 +40 %) ; géométries 532-550 / 532-552, textures 113-121 / 119-121, programmes 153-154 / 154. Pas de hausse nette ; l'A/B à route égale de l'auteur (décor des modules ±0,5 %) est cohérente avec le code (0 maillage, 0 matière neufs). Non refait par moi.

### 4. DÉFAUT BLOQUANT 1 — la tranche atomique de la ville s'alourdit quand le piqué joue
`vsReserve(V9)` est appelé dans `buildVoxCityG` AVANT le premier `if(ech9())yield;` : toute cette tête est UNE tranche, que le pré-bâti ne peut pas couper. `vcReserve` y pose le piqué pièce par pièce (≈ 30 `vsLibre` des murs + `vcEcart`/`vcFrole` des nappes).
Mesure (`controle3/patch.cjs` : copies chronométrées des deux index, rien d'autre ; `tr.cjs`, Mac sans bridage, 844×390 `?tel=1`, lot/réf. alternés, mêmes graines) :

| graine (module joué) | tête de buildVoxCityG lot / réf. (ms) | dont vsReserve lot / réf. (ms) |
|---|---|---|
| 116 (piqué) | 3,5 / 1,5 | 2,1 / 0,3 |
| 146 (piqué) | 2,8 / 2,1 | 1,8 / 0,5 |
| 134 (piqué) | 2,2 / 1,4 | 1,3 / 0,3 |
| 122 (piqué) | 2,6 / 1,4 | 1,5 / 0,3 |
| 110 (piqué) | 2,8 / 2,3 | 1,4 / 0,8 |
| 114 (slalom) | 1,8 / 1,8 | 0,4 / 0,6 |
| 118 (russes) | 2,2 / 1,9 | 0,5 / 0,6 |

5 piqués sur 5 : la tranche passe de 1,74 à 2,78 ms en moyenne (**+60 %**, vsReserve ×3-5) ; en Node (`reserve-jeu.cjs`, 101-160 et 161-220) vsReserve du piqué médiane 1,8-2,5 ms, pire 3,6-6,0 ms contre ≤ 1,1 sans module. Slalom et russes : dans le bruit. La règle « temps de tirage par tranche ≤ avant » n'est pas tenue pour le piqué (une route sur quatre au palier 0). En valeur absolue c'est petit au Mac (+1 ms ; ×3 à ×10 sur l'iPhone selon le bridage, dans une tranche qui dépasse déjà la tranche de 4 ms du pré-bâti), mais c'est systématique, pas du bruit.
Piste : faire de `vsReserve` un générateur (céder entre deux plans, comme `vsBatirG`), ou au moins céder (`if(ech9())yield;`) juste avant l'appel ; ou ne juger les nappes qu'une fois (elles ne sont jamais perdues au jeu).

### 5. DÉFAUT BLOQUANT 2 — le slalom des tours ne se lit toujours pas à l'image
Regardé 6 photos du vrai jeu à mes graines (`controle2/A/slalomtours-g114-844x390-{1,2,3}`, `-g139-390x844-{1,2,3}`) et la meilleure planche de l'auteur (`slalomtours-g131-390x844-1`) : AUCUNE ne montre une tour dans l'axe de la route, droit devant. On voit une avenue bordée de tours, la route qui tourne un peu ; en portrait (g139-2) une tour à néon rouge à gauche. La demande (« on voit la tour droit devant, on la frôle », un slalom ENTRE les immeubles) n'est pas servie à l'image, comme au tour 1. La géométrie dit « centre de la tour sur l'axe d'arrivée », mais la caméra est déjà dans le virage quand la tour est proche, et à 15 m du bord d'une dalle de 56 m elle reste sur le côté.
Les deux autres modules : **piqué** servi (g116-2 : la route plonge entre deux murs de tours, on voit le fond) ; **montagnes russes** servies en portrait (g142-2 : la vague monte vers une crête entre deux tours), plus faibles en paysage. Le flou de vitesse mange le premier plan partout.

### 6. Mineurs
- Montagnes russes : ~25 % des tours de creux perdues (raison `route`) : un creux sur deux environ n'est pas « entre deux tours » mais à côté d'une seule. Le plan reste posé.
- Le piqué, les russes et le slalom éliminent beaucoup des scènes d'avant au palier 0 (façade 25 → 6, portes 21 → 4, passerelle 10 → 2 sur 60 routes) : choix de fréquence à trancher au lot U.
- La tranchée (module 4) n'est pas faite (facultative).

### Ce que je n'ai PAS pu vérifier
- Rien sur un vrai iPhone (ni la tranche, ni la fluidité).
- Les courses en Chrome aux paliers 10 et 20 (Node + `banc.cjs gen` seulement) ; la vitrée (bancs Node en panne avant comme après).
- Une A/B des comptes à route égale de ma main (celle de l'auteur seulement) ; je n'ai pas cherché où exactement tombent les vols du pilote dans le slalom (0 mort).

### Pour un tour 3
1. Découper ou alléger `vsReserve` pour que la tête de `buildVoxCityG` reste ≤ avant au bruit près quand le piqué joue (preuve : `controle3/tr.cjs` sur ≥ 5 graines du piqué, lot / réf.).
2. Rendre la tour du slalom visible DANS l'axe, devant la caisse (photos 844×390 et 390×844, au moins 2 graines sur 3).

## Tour 3 (2026-11-19, 13:40-14:45) — VERDICT : FUSIONNABLE (aucun bloquant ; mineurs ci-dessous)

Code contrôlé : `ville-cyber.js` et index du 19/11 13:15, `ville-scenes.js` 12:57, `jade-balade.js` 12:50, `ville-entree.js` 18/11 02:57 (rien corrigé par moi).
Sorties brutes : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/lot-a/controle4/`
(`node1.sh`, `node2.sh`, `tranches.cjs`, `vol-tous.cjs`, `page.cjs` = banc page de l'auteur + `--force=0`/`--auto=`, `patch3.cjs`/`tr3.cjs` de l'auteur relus, `prise.sh`, `prise4.sh`, `nd/` = le lot sans `vcBatirG`).
Graines du contrôle : 101-160, 221-280 (forcées), 60 graines 32 bits, 165-168, 173-200 ; Chrome : 104, 120, 126, 128, 129, 130, 144, 147, 152, 154, 156, 158 (p0), 121, 147, 129 (p10), 103, 123, 127 (p20). Tous les modules en Chrome ont été joués SANS `?villescene=` (tirage naturel), sauf `tr3`.

### 1. Identité, périmètre, gardes — VERT
- `SEARCH='?sans=villecyber' node outils/banc-routes/empreinte.cjs graines=1-12` : ville **d63b36e2af8b / fb378a8c6756** ; crypto 5447610bd8f2 / eae97981f833, nuages 469d52aff855 / 2e1661d8fe93, espace 9c99fae61d38 / ea2d9e750351 ; sans drapeau : crypto/nuages/espace identiques (ville 17b89297a6b8 / 9dc6766ea34f).
- `controle/emp.cjs` (101-160 + 5 graines 32 bits, p0/10/20, points + MODMARK + FILETMARK) : lot `?sans=villecyber` = référence au bit près pour la ville ; lot sans drapeau = référence pour crypto, nuages, espace (`diff` vide). Vitrée : bancs Node en panne avant comme après ; au code, `MCJ` vitrée intacte, `vcSautRefuse` sort sur `vitre`/`crypto`, `V9.vcDiff` reste vide sans ancre de module (crypto : FILETMARK identique).
- `git diff` : ORDRE.txt, ville-entree.js, ville-scenes.js, jade-balade.js (1 ligne, gardée `VILLE_CYBER`), charge.cjs, + neufs. Diff index lot / index de la référence : 191 lignes, toutes du lot. sw.js, autres maps, rendu partagé intacts ; regex `\w+` de `?villescene=` intacte ; aucun `//` dans ville-cyber.js.
- `node code/assembler.cjs --verifier` OK (348 morceaux) ; `garde-demarrage` OK, `garde-allege.sh` OK, `garde-charte.sh` OK. Seul retrait d'image : une luciole sur deux, sur `ALLEGE`.

### 2. Génération (Node, vrais générateurs) — VERT
- `ville-cyber.cjs graines=101-160`, `graines=4294967236-4294967295`, forcés `?villescene=slalomtours|pique|russes` sur 221-280, paliers 0/10/20 (15 tableaux) : règle des 14 m **0**, audit dans / frôle **0 / 0**, nappes < 12 m **0**, **0 plan de module abandonné** partout. Pièces perdues : tours de creux des russes (`route`) 11/64 (101-160 p0), 7/60 (32 bits), 13 et 6 en forcés ; 3 nappes (`nappe`, piqué forcé p0). Abandons d'avant (passerelle 3, vrille 1-2, raison `route`) : niveau de la référence.
- Sorties p0 (101-160) : slalom 15, piqué 15, russes 16 ; routes 0/1/2 modules 15/44/1 ; p10 33/27/0 ; p20 53/7/0. Raccourcis/route 2,00 / 1,00 / 0,45.
- Rayons à la vitesse réelle : plan slalom 2,17 / 2,06 / 2,03 rP, piqué 2,17 / 2,05 / 2,10 rP, russes ≥ 5,5 rP ; crêtes verticales piqué ≥ 1,74 vD (bascule), russes ≥ 2,03 vD, creux ≥ 1,66 vD ; pente piqué 34-38°, slalom ≤ 5,4°.
- `ville-torsades.cjs graines=101-160` lot / réf. (controle2) : torsades 0,47 / 1,02, 0,2 / 0,23, 0,15 / 0,15 ; boucles ≥ 180° 2,02 / 2,3, 1,75 / 1,77, 0,87 / 0,78 (inchangé depuis le tour 1, viennent des modules d'avant) ; RMIN 2,04 / 2,04, 1,97 / 1,93, 1,77 / 1,78 rP ; tenue de cap t30 pire 8,6 s.
- Tirage total (`ville-tirage-ab.cjs A='?sans=villecyber' B=''`) : 173-184 × 2 : B/A 0,92 / 0,96 / 1,10 ; 185-200 × 3 : 1,00 / 1,00 / 0,92 → neutre.
- Tranches en Node (`tranches.cjs`, min de 5, vsReserve avec `V.vcDiff` puis `vcReserveG` mené avec une échéance toujours vraie) : tête lot p0 médiane 0,73 ms (réf. 1,01), p10 1,23 (réf. 0,86 ; routes différentes) ; plus longue pièce sans coupe d'un module : piqué p0 médiane 0,80 / max 1,54 ms, p10 1,16 / 1,37 ms — sous les tranches existantes (2-3 ms en Chrome).
- Vol droit (`vol-tous.cjs`, p0, 101-160, sauts autorisés seulement, toutes les tours de scène) : lot 1 195 / 3 079 touches (1,5 s / 2,5 s) contre **1 823 / 4 270** pour la référence → pas pire. Slalom seul forcé (221-260) : 0 touche à 1,5 s ; à 2,5-3,5 s, 3-4 par route, depuis des parties LOINTAINES de la route (s ≫ module) vers les tours hautes (230-430 m).

### 3. Le vrai jeu (Chrome, 4 prises sous verrou de 1 à 6 min, `?tel=1`, muet, mon Chrome tué à chaque fois)
- Courses au pilote auto (nitro coupée, palier 0, tirage naturel) : slalom 120 (844×390), 156 (390×844), 126 (844×390) ; piqué 128 (844×390), 152 (390×844) ; russes 130 (844×390), 154 (390×844) : **dans 0 / frôle 0** partout (flotte 2 = les deux enseignes de la traversée, déjà là avant), **0 erreur console, 0 mort**, mode `drive` à chaque relevé dans le module (47, 31, 42, 22, 29, 29, 27).
- Sauts (`{nit:0,saut:1,vol:true}`) : slalom 144, piqué 158 : 0 mort, 0 erreur. Piqué 158 : fenêtre refusée (Node, même route : s 1530-1821) ; vols relevés à 1821 (bord) et 1959 (la rue / la remontée, autorisé) → le refus tient. Slalom 144 : vols avant la fenêtre (approche), aucun ensuite jusqu'à la sortie.
- `toutes.mjs cartes=ville paliers=0,10,20 graines=165-168` : 12 routes, **0 infraction**. `banc.cjs gen --tel=1` + audit, p10 (121 slalom, 147 piqué, 129 russes) et p20 (103, 123, 127) : 6/6 sans erreur, 0 croisement, 0 trou ; obstacles tous au départ (s < 300), vers 4 700-4 900 m et à l'arrivée, aucun dans un module.
- COMPTES à route ÉGALE (lot contre `nd/` = même index sans `vcBatirG`, 0-2 200 m) : slalom 120 appels 221 / 215, triangles 578 k / 577 k ; slalom 156 254 / 257, 686 k / 684 k ; piqué 128 229 / 244, 619 k / 617 k ; géométries 532-567 égales ±6, textures 120-122, programmes 154. **Le décor des modules ne coûte rien.** (Les comptes absolus de cette prise sont ~2× ceux de la 1re prise, pour les deux variantes : l'état du profil Chrome, pas le lot.)
- Tranches (`tr3.cjs` sur `patch3.cjs`, lot / réf. alternés, 7 graines, 3 passages + 1 passage CPU ×4) :
  - tête (jusqu'au 1er point de coupe) : médianes lot 1,4 ms / réf. 1,33 ms ;
  - plus longue tranche, médiane des 3 passages : 128 2,4 / 2,1 ; 152 3,2 / 2,4 ; 158 2,9 / 2,9 ; 104 3,0 / 2,1 ; 120 3,2 / 2,9 ; 126 3,1 / 2,9 ; 130 2,6 / 2,4 (moy. 2,91 / 2,53) ; minima 2,5 / 2,44 ;
  - CPU ×4 : 152 9,7 / 9,2 ; 104 8,8 / 10,1 ; 126 10,1 / 11,6 (lot plus bas 2 fois sur 3).
  Le tour 2 était net (tête +60 % sur 5 piqués sur 5, vsReserve ×3-5) : c'est **levé**. Il reste un écart de +15 % sur la médiane non bridée, que le passage bridé contredit et qu'aucune pièce des modules n'explique (≤ 1,5 ms en Node) : je le classe dans le bruit (routes différentes), en mineur.

### 4. L'image (regardé 30 photos du vrai jeu à mes graines ; planches `controle4/planche-*.jpg`)
- **Piqué** : servi. Portrait g152 : la plongée entre les tours, le fond ; paysage g128-2 : la route qui plonge dans le canyon (flou).
- **Montagnes russes** : servies en portrait (g154-2 : la crête qui monte entre deux tours), faibles en paysage (g130 : avenue).
- **Slalom des tours** : progrès réel. Portrait g156-4/5 : la tour à bandeaux rouges barre la vue au-dessus de la route, droit devant — c'est la demande. Paysage : g126-3 une tour à bandeaux devant, à droite de la courbe (lisible) ; g120 (5 photos) aucune tour dans l'axe ; le frôlement ne se voit sur aucune photo (flou). Avec l'auteur : portrait 3/3 graines, paysage 2/4. Même niveau que les montagnes russes, que j'ai acceptées au tour 2 : je ne le tiens plus pour bloquant.

### Défauts restants (mineurs)
1. Slalom des tours en paysage : la tour dans l'axe ne se lit qu'une graine sur deux ; le frôlement ne se voit pas (flou de vitesse, marge de 15 m imposée).
2. Plus longue tranche non bridée +15 % en médiane (7 graines × 3), contredite bridé ×4 : bruit probable, non prouvé sur iPhone.
3. Tours de creux des montagnes russes perdues ~17 % (raison `route`) ; le plan reste posé.
4. Vol droit de 2,5 s et plus : 3-4 départs par route vers les tours hautes du slalom (moins de touches que la référence au total).
5. Fréquence : 44-45 routes sur 60 jouent un module neuf au palier 0, presque aucune au palier 20 ; la façade, les portes et la passerelle d'avant reculent (choix du lot U). La tranchée (module 4) n'est pas faite (facultative).

### Ce que je n'ai PAS pu vérifier
- Rien sur un vrai iPhone (tranches, fluidité, chauffe).
- Courses au pilote auto aux paliers 10 et 20 (seulement `toutes.mjs` + `banc.cjs gen` + Node).
- La vitrée en banc (Node en panne avant comme après ; vérifiée au code).
- Une A/B des comptes lot / `?sans=villecyber` sur beaucoup de graines (routes différentes) : seule l'A/B à route égale est faite.
