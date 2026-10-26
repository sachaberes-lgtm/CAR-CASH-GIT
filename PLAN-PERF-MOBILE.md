# PLAN — CASH CAR fluide, frais et sans latence sur tous les iPhone
Écrit le 25/10/2026 sur le jeu v895 (origin/main). Source : 13 lectures de code et de journal (une par sous-système), 161 leviers ouverts, 38 déjà livrés ou rejetés.
Fiches complètes de chaque levier : `.banc-perf-mobile/lectures-recuperees.json` (id, quoi, où, gain, risque, effort, preuve, déjà).

## 1. But et critères de réussite
Téléphones de banc : iPhone 13 Pro (A15, 120 Hz, iOS 26.6.1) et iPhone 15 (A16, 60 Hz, iOS 18.7.8). Un vieux iPhone (palier ANCIEN) sera mesuré dès qu'on en trouve un.
Critères, à confirmer après l'étape 0 (la base n'est pas mesurée sur le jeu actuel) :
- Course de 10 min, niveaux 1 à 9, sur les deux téléphones : jamais sous 30 i/s calées, 60 tenus tant que le téléphone est frais.
- Niveau 9 (ville, jade) : au moins 30 i/s à chaud. Aujourd'hui 7 à 22 i/s.
- Images de plus de 50 ms : divisées par 3. Aucun gel de plus de 100 ms à l'arrivée dans une map ni à une mort.
- Pente de chauffe divisée par 2, mesurée en °C par minute.
- Image par défaut identique, prouvée par photos avant/après. Tout levier qui change l'image passe par Sacha (étape 4).

## 2. Ce que les lectures ont établi
1. **Le jeu de ton téléphone date du 18/10.** Rien du travail du 24/10 n'est dans l'app : palier lu sur l'écran (33,6 → 58,4 i/s à froid), cadence 30 (v892), HUD allégé (v876). Sans nouveau build ou mise à jour en direct, tout le reste est invisible chez toi.
2. **La chauffe est subie, pas anticipée.** Le jeu passe à 30 i/s après que iOS a bridé. Un gouverneur thermique natif existe déjà dans la branche `iphone-perf` (commit 5c6bdeec, jamais fusionné) : il lit l'état thermique d'iOS et cale à 30 avant le bridage.
3. **La cadence 30 n'est pas calée.** Au banc du 24/10, le jeu lit une période d'écran de 6,94 ms alors que les images arrivent toutes les 17 ms. Il vise alors ~25 ms au lieu de 33 : environ 40 i/s irréguliers, d'où le « haché ». Petit défaut, gros effet.
4. **Les chiffres de JS par image de l'enregistreur sont faux** (rappel enregistré avant la boucle). Le « JS 2 ms » du journal vient d'un autre banc. À corriger avant de s'y fier.
5. **Niveaux 7 à 9 : le JS passe de 2 ms à 14-18 ms par image**, et un profil existe depuis le 24/10 (`profil-n9-ville.cpuprofile`) sans avoir été exploité. Il faut savoir si ces niveaux sont limités par le CPU ou par la puce avant de toucher aux triangles.
6. **Les triangles restent le gros poste** : la route fait 50 à 70 % des triangles. Seul le bitume a une version moyenne (v892). Les flancs, rails, nappe et ligne ont encore toute leur finesse au loin (−60 à −120 k triangles par image, risque nul attendu).
7. **La sonde de qualité gèle WebKit** : cinq lectures synchrones de pixels toutes les 8 à 30 s dès que ça rame, donc des gels au moment exact où le téléphone chauffe.
8. **Pause, menu et garage redessinent encore trop** : la pause redessine la course à pleine cadence, le menu garde une vitrine à 2,06 de densité avec ombre 2048.

## 3. Déjà fait ou rejeté : ne pas refaire
- Livrés : palier lu sur l'écran v873, menu à 30 i/s v885, cadence 30 sur récent et route en tranche moyenne v892, HUD converti v876, passe PC v860-v861, départ d'avance et pré-bâti (v619 à v853), zéro compilation en course.
- Rejetés : JS externe (22/10), simulation espacée pour nuages et audio (14/10), fenceSync sur Chrome (08/10), hmFeu (essayé v876), « NETTE doit rester nette, surtout en vol » (Sacha 27/09, donc pas de baisse de netteté à chaud), pas de fuite de mémoire entre maps (mesuré 24/10).

## 4. Règles pour tous (coût et sécurité)
Le 25/10 la lecture à 13 agents a consommé environ la moitié d'une session. Chaque agent lisait des fichiers entiers et portait jusqu'à 800 k tokens de contexte. Donc :
- **Un agent = une zone, une mission courte.** Pas plus de 4 en même temps. Pas de lecture générale du code : tout est déjà dans le fichier de fiches.
- **Lire par tranches** (`grep -n`, `sed -n 'a,bp'`), jamais un fichier entier. Viser moins de 150 k de contexte et 40 appels d'outils par agent.
- Brief de départ : reprendre `/Users/sachaberes/cash-car/perf-pc/.banc-pc/BRIEF.md` (règles de la passe PC), adapté au téléphone.
- Worktree neuf depuis origin/main (jamais ce dossier, resté en v746). On édite `code/`, jamais index.html. `node code/assembler.cjs`, puis la syntaxe. `sw.js` : cache +1.
- Chaque gain a un interrupteur `?mob_nom=0` qui rend l'ancien comportement. Les noms portent un préfixe unique (deux `const` identiques empêchent le jeu de démarrer).
- Même simulation. Le gameplay est verrouillé. Les commentaires datés qui citent Sacha ou Léo sont des décisions.
- Bancs : un seul Chrome à la fois (`/Users/sachaberes/cash-car/verrou-banc.sh`), toujours muet. Le téléphone ne se prend qu'avec le oui de Sacha, un seul agent à la fois, mesure sous 37 °C en A/B/B/A.
- Rien n'est poussé sur main sans le oui écrit de Sacha.

## 5. Les étapes

### Étape 0 — Prérequis et base (le chef, 1 à 2 h, aucun agent de code)
| # | Quoi | Pourquoi |
|---|---|---|
| 0.1 | Mettre le jeu v895 dans l'app : build Release inspectable, puis mise à jour en direct (oui de Sacha) | Sinon rien ne se voit chez toi. Fiches IOS-1, IOS-7. |
| 0.2 | Monter l'image développeur du 13 Pro, remettre l'iPhone 15 en ligne, rendre l'identifiant du banc paramétrable | Instruments et deux courbes au lieu d'une. Fiches O2, O4. |
| 0.3 | Corriger l'enregistreur (mesure du JS) et la période d'écran lue par la cadence | Sans ça, on mesure faux. Fiches PREC-JS, OUV-CAD-ECRAN. |
| 0.4 | Mesure de base sur les deux téléphones, à froid puis à chaud : 5 scénarios (nuages niv 1, forêt niv 4, ville niv 9, jade niv 9, garage 5 min), courbe de chauffe de 10 min, latence doigt vers image, et le même niveau 9 avec la puce déchargée poste par poste | Fixe la ligne à battre et tranche CPU contre GPU. Fiches H-BANC-TEL, O8, O3, O11, OUV-JS-NIV9. |
Sortie : `base-v895.json` + un verdict d'une page. Si le niveau 9 est limité par le CPU, la vague A2 passe après le travail sur le JS (voir 0.4).

### Étape 1 — Vague A : quatre agents en parallèle, zones disjointes
**A1 · Chauffe et cadence** (fichiers : cadence.js, boucle-1.js, mobile-tactile.js, natif et plugin Swift de l'app)
- Reprendre le plugin thermique de `iphone-perf` et le brancher : état « chaud » → 30 i/s calées, « très chaud » → qualité basse. Nécessite un build App Store. Fiches L1, IOS-2.
- Gouverneur unique qui remplace les trois automates (cadence, qualité, menu) avec une estimation de chauffe : passer à 30 avant le bridage. Fiche GOUV. Gain visé : 17-45 haché → 30 stables dès la 2e minute.
- Pause et compte à rebours à 30 i/s avec scène redessinée une image sur 4 ; repos après 20 s sans toucher. Fiches PAUSE30, M1, M9.
- Latence à 30 i/s : deux sous-pas de direction ; palier appris entre les parties ; une seule horloge lente. Fiches INPUT30, PAL-APPRIS, TIMERS-UN.
- App : veille seulement en course, cadence d'écran vérifiée. Fiches IOS-3, IOS-6.

**A2 · Géométrie des maps** (fichiers : piste-prebati.js, maps/*)
- Versions moyennes des flancs, rails, nappe et ligne de la route au loin. −60 à −120 k triangles. Fiches R1, OUV-ROUTE-HORS-BITUME.
- Moins de colonnes de bitume au loin (R2), nappe de lueur non dessinée quand elle est invisible (R4-nappe, −5 à −8 appels).
- Canyon : plancher de subdivision (C1, −100 à −250 k) ; décors écartés par le champ de vision (C2, −50 à −150 k, nul visuellement).
- Glacier : verglas et congères coupés au champ (G1, −60 à −120 k au niveau 9). Grotte : tronçons fusionnés (P1, 200 → 60-90 appels). Jade : verre en trois passes réduit (J2, −50 à −100 k).
- En dernier, une fois le reste mesuré : plafond de triangles par image qui dégrade d'abord les lointains (X1, vise 400-500 k). Fiche XL, risque de bascule visible.

**A3 · Rendu et gels** (fichiers : rendu/*, boucle-1.js, mort.js)
- Sonde qualité sans lecture synchrone sur WebKit (R3-SONDE). Plus de réallocation des cibles à chaque cran (R4-REALLOC).
- Boucles de lumières ponctuelles que plus rien ne regarde (R2-LUM, 5 à 15 % des sommets) ; lampe morte retirée (L6) ; cibles sans profondeur inutile (R9) ; mips du flou (R8) ; bitume sec sans reflet (R3-bitume).
- Le programme compilé à l'explosion, source d'un gel de 0,1 à 0,3 s à chaque mort (L5-explosion).

**A4 · Interface et son** (fichiers : css/*, hud-figures.js, son/*)
- Zone NITRO du HUD en transform et opacité : −50 à −80 % des ~40 images de plus de 25 ms qui restent par course (OUV-NITRO, H3). Voiles plein écran sur calque propre (H1, H2), écritures DOM inutiles supprimées (H4, H5, H7, H10, H11).
- Garage et boutique : relecture du canvas du ciel (M8), ombre du soleil (M4), animations CSS infinies restantes (M3).
- Son coupé : endormir vraiment le graphe (A1-son). Consignes audio par image espacées (A4-son).
Chaque agent rend un tableau avant/après sur le scénario qu'il touche et ses interrupteurs. Le chef fusionne dans l'ordre A1, A3, A4, A2.

### Étape 2 — Vague B : à-coups d'arrivée, mort, mémoire (4 agents au plus)
- Arrivée dans une map : nuages bâtis d'avance (N2), pose du canyon étalée (C3), grotte maillée hors du fil principal (OUV-GROTTE-OUVRIER), chauffe de rendu étalée (CHAUFFE-ETALE), pré-bâti plus large aux approches (PREB-URGENCE).
- JOUER et mort : la caisse n'est plus reconstruite quand rien n'a changé (L12), salle du garage en tranches (L8).
- Mémoire : tableaux de sommets libérés après l'envoi à la puce, −60 à −120 Mo (L3, OUV-MEM-SOMMETS) ; alerte mémoire iOS → délester (L6, IOS-5) ; sons décodés à la demande, −15 à −25 Mo (A6-son).
- Reprendre les deux branches PC non fusionnées `pcperf-three-course` et `pcperf-lectures-2d` (0,3 à 0,8 ms par image estimé sur téléphone, image identique prouvée au bit près sur PC). Fiche L10.

### Étape 3 — Vérification (le chef, jamais l'agent qui a codé)
Mêmes cinq scénarios, mêmes téléphones, mêmes conditions que l'étape 0.4, A/B/B/A après refroidissement sous 30 °C. Un gain est gardé s'il tient au banc et que la photo avant/après est identique. Un gain non mesuré est retiré.

### Étape 4 — Ce qui change l'image : à toi de trancher sur planche avant/après
Aucun de ces leviers n'est appliqué sans ton oui, chacun avec son interrupteur :
- Peau transparente des cumulus seulement de près sur téléphone (−150 à −450 k triangles, N1).
- Brume du glacier et far par map resserrés (G2, F1) ; ombre à filtrage simple et carte 768 sur récent (R6).
- Vitrine HD du menu à la définition de l'écran, ombre 1024 (M5, OUV-MENU-VHD).
- Feu de pixels, halo et ombre de la caisse allégés sur ANCIEN (L2, L3, L7, L13).
- Plafond de triangles adaptatif (X1).

### Étape 5 — Livrer
- Fusion dans origin/main, syntaxe vérifiée, cache +1, push sur ton oui.
- App : nouveau build TestFlight pour le plugin natif, mise à jour en direct pour le reste. Les téléphones qui ont encore le build sans mise à jour en direct restent au jeu embarqué.
- Garde de régression : `outils/banc-perf/garde-perf.py` avant chaque push (zéro compilation en course, zéro erreur de page), et le banc téléphone avant chaque version publiée. Fiches O5, O10.

## 6. Qui fait quoi, avec quel effort
| Rôle | Modèle | Effort | Pourquoi |
|---|---|---|---|
| Chef : prérequis, base, fusion, vérification | Opus 5.5 | élevé | Lit les chiffres et décide. Ne code pas les leviers. |
| Agent téléphone (étape 0.4 et 3) | Sonnet 5.5 | moyen | Suit un script de banc. Un seul à la fois. |
| Agents A1 et A3 (cadence, rendu, gels) | Opus 5.5 | élevé | Code délicat, risque de casser l'image ou la physique. |
| Agents A2 et A4 (maps, HUD, son) | Sonnet 5.5 | élevé | Leviers précis, fiches détaillées, preuve par compte. |
| Relecture du diff final | Fable 5.1 | élevé | Un œil neuf, sur le diff seulement, jamais sur tout le code. |
Budget : quatre agents, environ 40 appels chacun, par vague. Deux vagues, plus le chef. Pas de lecture générale.

## Avancement de l'étape 0 (25/10, 17 h 10)
- 0.1 FAIT. Worktree `/Users/sachaberes/cash-car/mobile-perf` (branche `mobile-perf`, depuis origin/main v896). App de banc CC BANC construite en Release, signée développement (inspectable), jeu v897, identifiant `com.sachaberes.carcash.banc` : ta vraie app n'est pas touchée. Rien installé, rien envoyé, aucune mise à jour en direct.
- 0.3 à moitié. FAIT : la période d'écran de la cadence est lue en médiane (commit 567724e9, local, interrupteur `?mob_ecran=0` pour l'ancien comportement, cache v897). PAS FAIT : la mesure du JS de l'enregistreur de parties, car le banc de l'app mesure le JS de son côté ; à faire avec la vague A1.
- 0.4 PRÉPARÉ : `/Users/sachaberes/cash-car/optim-mobile/.banc-optim/file-base.json` = quatre courses de 75 s en A/B/B/A (A = ancien comportement, B = correctif) plus une course chaude de 600 s, niveau 9 ville atteint en 25 s.
- 0.2 BLOQUÉ : le 13 Pro est verrouillé, l'image développeur ne peut pas se monter (« device is locked »). L'iPhone 15 s'appelle « iPhone de Leo » et est hors ligne : il faut le brancher, le déverrouiller et accepter « Se fier à cet ordinateur ».
- Non fait, à écrire avant l'étape 3 : la mesure de latence doigt vers image (fiche O3). Le chef du banc a l'identifiant du 13 Pro écrit en dur.

## Résultats de l'étape 0.4 sur le 13 Pro (25/10, 17 h 45 à 18 h 05, jeu v897 Release, partage de connexion et charge actifs)
Courses de 75 s, niveaux 1 à 9 enchaînés en 25 s, tenue au niveau 9 (ville). A = ancien (`?mob_ecran=0`), B = correctif de période d'écran.
| Course | Batterie | Sauts, i/s | Niveau 9, i/s | Niveau 9, images > 25 ms sur ~950 |
|---|---|---|---|---|
| A1 | ? (lecture ratée) | 56,8 | 56,0 | 52 |
| B1 | 32,8 → 33,9 °C | 57,7 | 56,6 | 38 |
| B2 | 33,9 → 35,0 °C | 51,2 | 43,4 | 262 |
Lecture : à froid, la ville niveau 9 tient 56 i/s. Après cinq minutes de jeu cumulées (B2), elle tombe à 43 i/s avec 7 fois plus d'images lentes, alors que la batterie n'a gagné que 2 °C. Le goulot est donc la chauffe de la puce, pas la map. Le correctif de période d'écran ne change rien à froid, ce qui est attendu : il ne joue que cadence 30 engagée, donc à chaud. A2 et la course chaude n'ont rien rendu : les deux iPhone étaient verrouillés. L'iPhone 15 n'a jamais joint le chef (réseau ou fenêtre « réseau local » non acceptée) ; son chef est arrêté. Fichiers : `/Users/sachaberes/cash-car/optim-mobile/.banc-optim/res-app/base-*.json`.

## Résultats complets de l'étape 0.4 sur le 13 Pro (25/10, 18 h 30), cinq courses de suite
| Ordre | Course | Batterie | Sauts, i/s | Niveau 9, i/s | Images > 25 ms au niveau 9 | Sonde CPU |
|---|---|---|---|---|---|---|
| 1 | A1 ancien | ? | 56,8 | 56,0 | 52 | 4 → 3 |
| 2 | B1 correctif | 32,8 → 33,9 | 57,7 | 56,6 | 38 | 4 → 3 |
| 3 | B2 correctif | 33,9 → 35,0 | 51,2 | 43,4 | 262 | 5 → 7 |
| 4 | A2 ancien | 35,2 → 35,8 | 49,4 | 52,4 | 109 | 4 → 5 |
| 5 | chaud-b correctif | 35,8 → 36,4 | 37,9 | 33,4 | 425 | 8 → 9 |
Lecture : l'ordre des courses pèse bien plus que le réglage testé. Après environ 7 minutes de jeu cumulées, la même ville niveau 9 passe de 56 à 33 i/s alors que la batterie ne gagne que 4 °C. L'effet du correctif de période d'écran n'est pas isolable dans ce plan A/B/B/A : il est noyé par la chauffe. Défaut du banc : la « course chaude » de 600 s a duré 92 s, car la voiture du pilote automatique meurt vers 72 s. Pour mesurer une vraie chauffe de 10 minutes, il faut une caisse immortelle ou une relance automatique de la partie. À écrire avant de juger la cadence à chaud.
Décision du plan : le gouverneur thermique (vague A1) est confirmé comme premier levier. Les travaux sur les triangles passent après.

## Vague A faite, intégrée en local (25/10 soir) : branche `mobile-perf` à `df0bc319`, cache v900, rien poussé
Worktree complet : `/Users/sachaberes/cash-car/mobile-perf`. Aucun gain n'est encore mesuré sur banc ou téléphone : tout est prouvé par calcul sur le code.
| Agent | Commit | Fait, actif par défaut | Fait, INACTIF (à trancher sur photos) | Pas fait ou fiche fausse |
|---|---|---|---|---|
| A1 gouverneur | b4179370 | dose de chaleur → 30 i/s avant le bridage, prise `cc:thermique`, `?mob_gouv=0` | | |
| A2 géométrie | e754d3f7 | rubans de route en tranche moyenne (−57 à −115 k triangles), champ de vision pour canyon, dunes, verglas, `?mobg_rubans/nappe/champ=0` | R2, C1, J2, F1 | P1 grotte non fait ; R4 : la nappe n'est nulle que par plein jour sec |
| A3 rendu | 8c9f409d | sonde qualité par barrières sans gel WebKit (repli sur l'ancienne lecture), matières de mort chauffées au menu, `?mobr_sonde=0`, `?mobr_explo=0` | | R4 réallocation et R9, R8 non faits ; L6 et L4 : fiches fausses (la lampe sert au menu, l'opacité n'atteint jamais 0) |
| A4 HUD | 5b31fb04 | zone NITRO en transform/opacité, `--nr/--nx` plus écrits, DOM tactile, compteur d'argent au dollar, son (`?mobi_h3/nr/dom/cash/son=0`) | H3b (lueur jauge pleine), H5, H2, espacement du voile NITRO MAX | H1 : fiche en grande partie fausse ; H7, M3, M4, M8, A1 non faits |
À mesurer sur le 13 Pro : triangles et appels de dessin avec et sans `?mobg_rubans=0&mobg_nappe=0&mobg_champ=0`, images de plus de 50 ms avec et sans `?mobr_sonde=0`, compteur d'argent du HUD inchangé, reflet de la barre NITRO sans saut de phase.
Mesures du gouverneur (13 Pro, v898) : calage forcé = 30,7 et 30,0 i/s, intervalle p99 46 ms, 89 à 96 % entre 28 et 39 ms, contre p99 68 à 87 ms sans gouverneur. Séances continues de 7 minutes en cours.
Disque : 88 worktrees de sessions remplissaient le disque ; dix périmés retirés (1,9 Go). Les 22 worktrees avec commits non fusionnés restent.

## État à 23 h 30 (25/10) — branche locale `mobile-perf` à f227baa9, jeu v903, rien poussé
**Livré en local, actif par défaut** : gouverneur thermique (30 calés quand ça chauffe, `?mob_gouv=0`), période d'écran lue en médiane (`?mob_ecran=0`), rubans de route moyens et écartement par cases (`?mobg_rubans|nappe|champ=0`), matières de mort chauffées au menu (`?mobr_explo=0`), HUD NITRO/DOM/argent/son allégés (`?mobi_h3|nr|dom|cash|son=0`), ombre de la caisse en un maillage (`?moba_ombre=0`). **Inactifs (changent l'image), à trancher sur photos** : régime chaud `?mobh_chaud=1` (vent à 15 i/s, feu plus clairsemé, bouton NITRO moins fluide), ombre à 15 i/s `?moba_ombre15=1`, lueur de la jauge pleine `?mobi_h3b=1`, plaques `?mobi_cran=1`, voile `?mobi_h2=1`, sonde sans gel `?mobr_sonde=1` (inutile à chaud), R2/C1/J2/F1 non faits.
**Mesures sur le 13 Pro (partage de connexion + charge USB, départ 36-37 °C)** : une course isolée à froid tient 56 i/s au niveau 9 ; une séance continue de 7 min s'effondre à 5-13 i/s aux minutes 4-7 sur TOUTES les versions testées, résolution figée à 1,0 comprise (donc pas le remplissage). Calage forcé sur 30 : 30 i/s réguliers (p99 46 ms). Séances (moyenne des minutes 4 à 7, i/s) : sans gouverneur 13,3 · v900 22,6 · v901 15,9 · v903 tous allégements 19,9 · v903 par défaut 7,4 · résolution 1,0 : 9,7. Ces séances isolées ne se comparent pas (historique thermique de la puce, 4 h de chauffe) ; un test croisé A/B/B/A (leviers actifs contre coupés, 12 min de repos et batterie ≤ 36,5 °C entre chaque) est lancé pour trancher. Appels de dessin niveau 9 : 130 → 115. Triangles : −13 à −17 % (canyon, ville).
**À faire à la main, téléphone débranché** : CC JEU (copie jouable de la v903, sauvegarde de Sacha, enregistreur de parties allumé) — jouer 7 min, puis lire `dbgPerfRec('resume')` par le pont inspecteur ; c'est la seule mesure hors banc chaud.
Mémoire du projet : `perf-mobile-25-10-resultats.md`, `banc-iphone-pieges-25-10.md`.

## Preuve en images de l'ombre de la caisse (A5), 25/10 soir — IDENTIQUE au bit près
12 paires (LE LOUP, LE ROUGE-GORGE, SQUALE × 4 angles), jeu v903, Chrome sans fenêtre, horloge figée, même page et même image, levier allumé contre éteint par `dbgMobaOmbre(true|false)` : 0 pixel différent au seuil 0, écart max 0. Appels de la passe d'ombre : 15 → 5, 10 → 3, 15 → 6. Planches AVANT | APRÈS | DIFFÉRENCE ×16 dans `/Users/sachaberes/cash-car/mobile-perf/.banc-perf/ombre/`. Méthode : ne JAMAIS comparer deux chargements de page (ciel, particules et caméra diffèrent déjà), basculer le levier sur la même page.

## Essai à la main, téléphone débranché : CC JEU (prête, 23 h 51)
Installée sur le 13 Pro (icône « CC JEU », à côté de CASH CAR, CC BANC et CC DEBUG), jeu v903, ta sauvegarde copiée une fois, enregistreur de parties allumé (`ccPerfRecOn`). Aucun mode banc : elle ne contacte pas le Mac. Pour t'en servir : laisse le téléphone refroidir 10 min, débranche-le, joue 7 minutes de suite (rejoue après chaque mort), puis rebranche-le, laisse l'app ouverte et dis-moi. Je lis ensuite l'enregistrement avec `/Users/sachaberes/cash-car/optim-mobile/.banc-optim/lis-jeu.sh` (pont inspecteur, USB). Limite : l'enregistreur compte les rappels d'écran, il montre bien les à-coups (intervalles > 50 ms, p99) mais pas la différence entre 30 stables et 60.
Paramètres d'essai (à ajouter à l'adresse, ou me demander de les poser) : `?mob_gouv=0` sans gouverneur ; `?mobh_chaud=1` régime chaud ; `?moba_ombre15=1` ombre à 15 i/s.

## LA DÉCOUVERTE DE LA NUIT (26/10, 00 h 58) : le 30 DÈS LE DÉPART supprime l'effondrement
Séance de 7 min, 13 Pro, v903, dose du gouverneur forcée à 200 dès la 2e seconde (donc 30 calées du début à la fin) : **31,5 · 26,5 · 25,4 · 29,6 · 30,4 · 30,3 · 30,3 · 31,1 i/s**, 85 à 100 % des intervalles entre 28 et 39 ms, p99 35-68 ms, 14-53 images > 50 ms par minute aux minutes 4-8 (contre 330-430 sans), alors que la batterie monte à 38 °C. Les séances qui jouent les 60 à 100 premières secondes à 60 i/s s'effondrent à 5-13 i/s aux minutes 3-5, MÊME parties de 32,3 °C (témoin A1 : 51,9 · 26,4 · 19,2 · 7,6 · 5,6 · 6,8 · 5,8) et MÊME quand le gouverneur cale ensuite sur 30 (v901). Lecture : c'est la chaleur des premières minutes à 60 qui déclenche la bride d'iOS ; une fois bridé, caler sur 30 ne rattrape pas.
**Décision à prendre par Sacha** : `?mob_g30=1` (v904, commit bf665320, INACTIF par défaut) = 30 calées dès le départ de chaque course sur téléphone récent. Contrepartie : plus de 60 i/s dans les premières minutes, là où le 13 Pro les tient quelques dizaines de secondes. Variante « 60 pendant ~40 s puis 30 » : non validée. La preuve complète est la séance F ci-dessus ; la reproduction par le paramètre (G30) et deux témoins suivent.
