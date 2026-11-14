# MAPS PRO — ESPACE (2026-11-14) : le diagnostic « plus de virages qui jouent l'endroit / l'envers »

Branche `pro/espace-2026-11-14` (partie d'origin/main v1589, ff0c9078). **Rien du jeu n'est modifié à ce stade** : seulement des bancs (`outils/banc-routes/`) et ce fichier.

> ATTENTION (à trancher par qui intègre) : la demande relayée par le harnais pour ce lancement était « pour jade travaille la variété de forme d'îlot ». La tâche calculée, elle, portait sur l'ESPACE
> (« espace a besoin de plus de virages qui exploitent le concept de à l'endroit / à l'envers »). Le diagnostic ci-dessous ne touche pas au jeu ; avant d'engager la correction, vérifier que Sacha veut bien ce chantier.

## La demande (telle que transmise)
Route de l'orbite v6 (« la désorbitation ») jugée trop droite : de grands virages qui jouent VRAIMENT l'endroit/l'envers (la dalle se couche, passe au plafond dans le virage, ressort de l'autre côté ; virages relevés qui basculent ; S où l'on change de face), amples et lisibles. Cibles de la supervision : ~200°/km et ~450° d'amplitude de cap au palier 0.
Refus définitifs : aucun looping, aucun anneau, aucun mini-astéroïde autour de la route, pas de torsade serrée, jamais plus de 10 s dans la même direction, pas de grand demi-tour ; le décor au CENTRE du virage, gros ; nuages/ville identiques au bit près.

## L'état AVANT (origin/main v1589) — les chiffres de référence
Vitesse réelle = croisière × élan (1,8 au palier 0). Graines 1-24 sauf mention. Tout est rejouable en Node, sans Chrome.

| mesure (palier) | 0 | 5 | 10 | 20 | cible |
|---|---|---|---|---|---|
| virage en plan, °/km | **142** (min 127) | 110 | 78 | 32 | ~200 au p0 |
| amplitude du cap | **240°** (min 212) | 215 | 259 | 163 | ~450 au p0 |
| cap net fin − début (la spirale tirée : 180-300°) | **119°** (82-142) | — | 146 | 74 | = le total tiré |
| temps à plat (< 20°) | 41 % | 40 | 42 | 49 | 35-55 % (R13) |
| temps penchée 20-60° | 41 % | 41 | 44 | 35 | |
| temps couchée 60-90° | **4 %** | 5 | 5 | 5 | |
| temps à l'envers (> 90°) | 14 % | 14 | 9 | 11 | 6-25 % (R8/R13) |
| part des DEGRÉS TOURNÉS à plus de 60° | **22 %** (5 + 17) | 26 | 12 | 20 | |
| virages ≥ 30° par route : total · relevés 60-90° · au plafond | 11,0 · **0,2** · 3,0 | 9,6 · 0,3 · 3,1 | 7,6 · 0,1 · 1,3 | 4,0 · 0 · 1,0 | |
| ÉPISODES à l'envers par route | **1,21** (1-2) | 1,08 | 1,25 | 1,00 | |
| le 1er envers commence à … de la route | **48 %** | 43 | 62 | 54 | |
| plus long passage sans dépasser 60° | **28,3 s** (max 33,6) sur 63 | 24,0 | 28,6 | 17,6 | |
| plus long passage à plat | 8,8 s (max 11,1) ; 21/24 routes > 6 s | 7,4 | 7,7 | 8,1 | ≤ 6 s (R13) |

Par module (tous paliers, `modules=1`) : faille **10°/km** (47 posées, 1,6 km), cascade **18°/km** (23, 1,5 km), plongée 56°/km (1,8 km, 12 % de la route au p0, 25 % au p20), rentrée 67°/km, surbaissé 79, plongeant 76, fronde 96, ceinture 133, bobsleigh 136, grande torsade 152 (roulis 180°, 55 % à l'envers). Roulis max des modules « à virage » : ceinture 35°, bobsleigh 46°, fronde 54°, plongeant 70° ; seuls le surbaissé (123°, 7 routes sur 64), la grande torsade et la rentrée au plafond (112°, routes courtes) passent la verticale.

Juge commun (`juge-node.cjs`, 8 graines × paliers 0/10/20, 4 min 39) : **27/30** — R5 p0 ✗ (10 noms, il en faut 12), R6 p0 ✗ (0-2 raccourcis, aucun robuste), R5 p20 ✗ (toutes les routes = faille + rentrée + plongée, jaccard 1,00). R3 : max 46/58/50°/s, p95 39-40. R8 : 17,8 % et 8,8 s au p0. R7 : 78,7 / 80,3 / 75,7 %. R13 ✓ (juge-node ne contrôle que l'envers ≥ 6 % et > 60° ≥ 15 %, pas les 6 s à plat).

Coût (graine 5, `banc-graphismes`, poste max ; ordi 1600×900 / téléphone 487×1055 cran 1) :

| | appels | triangles | image figée (médiane, ms) | images de course (méd. / p99) |
|---|---|---|---|---|
| Terre (matin) ordi | 156 | 745 k | 9,5 / 8,3 | 16,7 / 28,2 |
| Mars (midi) ordi | 147 | 688 k | 8,4 / 7,9 | 16,7 / 56,8 |
| Saturne (soir) ordi | 143 | 763 k | 9,3 / 9,4 | 16,7 / 58,2 |
| Terre tél. | 99 | 296 k | 5,9 / 7,2 | 33,5 / 535 (machine chargée) |
| Mars tél. | 99 | 289 k | 6,2 / 6,6 | 33,4 / 467 |
| Saturne tél. | 83 | 281 k | 5,3 / 5,6 | 33,4 / 50,8 |

Tirage en Node (genCtrl + pisteTord, médiane / pire) : p0 418 / 505 ms · p10 374 / 739 · p20 344 / 461 (bruité : machine partagée) ; ~500-750 points de contrôle. Construction en jeu (`constr`) : 650-1 600 ms + 360-735 ms.
Empreinte des autres maps (`empreinte.cjs`, 20 graines) : ville p0 `35744bf5edd9` p10 `f6ce384a1412` · crypto `7b9ad57f4c1e` / `3ef151b9ea53` · nuages `b7a8c10c9e51` / `2ef73e4e78a7` · espace `7b9bb18da2ce` / `71f203d87d12` (vitree : le banc casse, `VIT_SOL is not defined`).
En jeu (Chrome headless, pilote auto) : Terre g2 et g5, Saturne g2 et g4 (ordi), Mars g3 (`--tel=1`) : 0 erreur, 0 contact, 0 chute, portail atteint ; `dbgOrbAudit` : rien dans la route, partNoire 0.

## Les constats (preuve → cause)
1. **L'envers est UN seul épisode, tard, puis plus rien** (bloquant pour la demande). 1,21 épisode par route au p0, il commence à 48 % de la route ; les 28 premières secondes (sur 63) ne dépassent jamais 60° de roulis. Cause : `orbite-modules.js` — `ORB_LOURD` interdit tout grand tour de dalle avant le climax sur une route de 44 s et plus (`K.longue>=44`), et le climax (grande torsade, 22 % de la route) concentre l'envers en un passage de 7,7-8,8 s, au ras du plafond de R8 (9,5 s).
2. **Les virages ne passent presque jamais par le mur** (bloquant). 4 % du temps entre 60 et 90°, 0,2 virage relevé par route ; 57 % des degrés tournés le sont à 20-60° seulement. Causes : le dévers automatique des liaisons est plafonné à 38° (`TORD_DEVERS.max`, route-sans-haut.js l.84, partagé avec les nuages) ; les modules à virage sont dessinés peu couchés (ceinture `th` 0,5-0,62 rad, bobsleigh 0,74-0,8, fronde 0,75-0,95).
3. **La route tourne peu là où elle est la plus longue** (majeur). Faille 10°/km et cascade 18°/km (imposées comme « module de vol » : 70 posées sur 96 routes, jusqu'à deux par route au p5), plongée 56°/km. 142°/km au p0 pour 200 visés.
4. **La spirale n'est suivie qu'à moitié** (majeur, bug). Tirée 180-300°, le cap net n'est que de 119° au p0 et 74° au p20. Cause : `derAx` n'avance qu'au début de chaque tranche de la phrase (`for(sl=PH.suivant…)`, ville-entree.js l.554) ; le climax (torsade + rentrée + plongée, ~45 % de la route au p0, plus au p20) est UNE tranche : l'axe y reste figé. D'où l'amplitude de 240°.
5. **La plongée est refusée par pisteTord sur 100 % des routes** (mineur aujourd'hui, piège demain). `TORD.info.zones` : `plongee` toujours `…,0` (elle déborde l'arrivée tenue à l'endroit : 8 759 > 8 428). Sans coucher scripté, c'est sans effet visible ; mais tout coucher qu'on y ajouterait serait perdu en silence.
6. **Les quatre commits non fusionnés de `espace-v5-ruban` ne répondent pas à la demande** (majeur pour le plan). Mesuré sur `wt-v5` (cc7d3b30) : amplitude 568° et 155°/km au p0, juge 29/30, mais 51 % des degrés tournés À PLAT (balcon 216°/km à 65° max, corde 248°/km à 16°), l'envers 10 % des virages, plus long passage à plat 17 s (max 22,8). Et le balcon est « un tour complet, deux lacets du même côté » : une hélice de 360°, à confronter au refus « pas de grand demi-tour ». À reprendre de cette branche : la rentrée au plafond en climax de toutes les routes, la plongée à ~50° et son saut refusé, le palier 20 (R5), `ORB5.tangFin`.
7. **Des roches moyennes flottent autour de la route près des géants** (à vérifier contre le refus « aucun mini-astéroïde autour de la route »). Photos Saturne g4 s 4 787 et s 5 484 (une dizaine de roches autour de la chaussée). Origine non établie (`geantsRoches` d'orbite-geants.js ou les débris d'orbite-2.js) : NON VÉRIFIÉ.
8. **La face sombre de la dalle** : sur Saturne et sur Terre côté nuit, la chaussée est presque noire avec ses seules lignes (photos Terre g5 s 1 970, Saturne g4 s 5 484). `partNoire` 0 au banc : ce n'est pas un aplat noir, mais l'envers s'y lit mal. Non chiffré.
9. Divers : au p20 toutes les routes ont la même structure et les mêmes abscisses (rentrée à 6 056, plongée à 9 737) ; la graine d'une route en jeu ne redonne pas la route du banc Node (la pioche dépend de la route d'avant : comparer avec `?pioche=0`) ; `roule-page.js` rend la carte de la zone SUIVANTE dans son champ `carte`.

## Le plan de correction (ordonné ; chaque étape a son interrupteur d'URL et se mesure avec `endroit-envers.cjs` + `juge-node.cjs` + `empreinte.cjs`)
Interrupteur général proposé : `?espace=v6` = la route d'aujourd'hui au bit près (comme `?espace=v4`), et un drapeau par étape (`?orbmur=0`, `?orbface=0`, `?orbaxe=0`).
1. **L'axe qui avance partout** (constat 4) : `derAx` recalculé à la lecture (dans `dev()`, `thrG`, `capA`) depuis `approx`, pas seulement par tranche. Attendu : cap net = le total tiré, amplitude ~330-360°. Puis monter `TOT_AX` vers 280-400° pour viser 450° (rayon de la spirale ≥ 1,3 km : pas un demi-tour ; contrôler `croisements` et `dMin`). Fichier partagé (ville-entree.js) : le code ne s'exécute que sous `EV5` → empreinte ville/crypto/nuages à prouver identique.
2. **Le mur dans les liaisons** (constat 2) : un dévers propre à l'orbite (`DVX` quand `D2===ORB5` : max ~78-82°, k 1, vitesse de roulis bornée à la vitesse RÉELLE) — les demi-S de 110-130° se prennent sur la paroi. Attendu : 60-90° de 4 % à ~15 % du temps, sans toucher R8. À surveiller : R3 (p95 ≤ 45°/s), R7 (au-delà de 25° de roulis à la lèvre, le vol prend le haut de la dalle : le pourcentage sautable peut tomber sous 75 %) — si R7 baisse, limiter le mur aux arcs ≥ 90° ou refuser le saut sur le mur (`espSautRefuse`) et vérifier comment le juge compte un saut refusé (NON VÉRIFIÉ).
3. **Les virages qui changent de face** (constats 1 et 2), dans `orbite-modules.js`, tous `calme`, couchers `cvTrap` (`ORB_K`) dessinés à `Tt` (vitesse réelle), un géant au centre de chaque arc (`nu`) :
   - LE BASCULÉ : un arc de 100-130° pris sur le mur (80°) qui bascule au plafond (105-120°) en son milieu puis revient — le surbaissé d'aujourd'hui, à tirer bien plus souvent (5 routes sur 24 au p0) ;
   - LE S RETOURNÉ : deux arcs opposés ; on entre à l'endroit, la dalle monte par la paroi du 1er jusqu'à l'envers, on change de côté LA TÊTE EN BAS, elle redescend par la paroi du 2e (la normale toujours vers le cœur du virage) — un tour complet étalé sur ≥ 10-11 s réelles (≤ 36°/s en moyenne, ~46 en pointe), ~4-5 s à l'envers. À faire valider par Sacha (c'est un tour entier dans le même sens, la v5 s'interdisait plus d'un demi-tour d'affilée) ; repli : la petite torsade à trois arcs (aller par une paroi, retour par la même) ;
   - ceinture, fronde, bobsleigh : couchés à 70-85° (le mur) au lieu de 29-54°.
4. **Le budget d'envers en secondes, pas en interdits** (constat 1) : remplacer `ORB_LOURD`/`K.longue>=44` par un compte — secondes à l'envers prévues par module (table mesurée par `endroit-envers.cjs modules=1`), refus si le total dépasse ~22 % de la durée réelle ou si un épisode dépasse 9 s ; viser 3 épisodes courts (2,5-4 s) à ~20 %, ~50 % et au climax, au lieu d'un seul de 8,8 s. La grande torsade du climax devient un S retourné + la rentrée au plafond (reprise de `espace-v5-ruban`).
5. **Moins de droite** (constat 3) : une seule faille OU cascade par route (plus de cascade si une faille est déjà posée), la géométrie de saut prouvée laissée telle quelle ; la plongée et son bas en S plus marqué. 200°/km ne s'atteint qu'en resserrant les rayons au p0 (plancher `rPv`) : à tenter en dernier, R7 en main ; sans cela, attendre ~170-185°/km.
6. La plongée : marquer sa zone avant l'arrivée tenue (constat 5) si on lui donne un coucher. Roches autour de la route (constat 7) : établir l'origine, puis les écarter du couloir visible ou les retirer.
7. Vérification finale : juge ≥ 27/30 (viser 29), `endroit-envers.cjs` (≥ 3 épisodes, 1er envers avant 25 % de la route, 60-90° ≥ 12 %, à plat ≥ 35 %), empreinte des autres maps identique, `roule-page.js` aux paliers 0/10/20 (0 chute), photos EN ROULANT ordi + `--tel=1` sur les trois planètes, triangles et appels inchangés (la route ne change pas le décor : ±5 %).

## Les bancs (commandes)
- `node outils/banc-routes/endroit-envers.cjs <racine> paliers=0,5,10,20 graines=1-24 [detail=1] [modules=1]` — NEUF : temps et virages par classe de roulis, épisodes à l'envers, virages relevés / au plafond, plat max.
- `node outils/banc-routes/spirale-orbite.cjs <racine> [detail=1]` — NEUF : la spirale est-elle suivie (cap net).
- `node outils/banc-routes/zones-refusees.cjs <racine>` — NEUF : modules refusés par pisteTord.
- `node outils/banc-routes/tirage-ms.cjs <racine>` — NEUF : ms de tirage.
- `node outils/banc-routes/juge-node.cjs <racine> paliers=0,10,20 graines=1-8 detail=1 zones=1` (4-5 min ; `rapide=1` : 1 min sans R6/R7) ; `virages-orbite.cjs`, `virages-parties.cjs`, `empreinte.cjs`.
- En jeu : `node outils/banc-maps/serveur.cjs 8350 <worktree>` puis
  `node outils/banc-maps/banc.cjs gen --carte=espace --meteo=matin|midi|soir --graines=2,5 --roule=75 --photos=1 [--tel=1] --port=8350 --cdp=9550 --profil=pro-espace --out=<dossier> --audit="dbgOrbAudit()"` ;
  roulage instrumenté : `--q="pmot=0&dur=90" --auditfile=outils/banc-routes/roule-page.js` ;
  coût : `node outils/banc-graphismes/banc.cjs --out=<dossier> --cartes=espace:matin,espace:midi,espace:soir --graine=5 [--tel=1] --port=8350 --cdp=9551 --profil=pro-espace-g`.
- Référence « avant » : le worktree `wt-avant` (ff0c9078) ; `<racine>` accepte n'importe quel worktree (ex. `wt-v5` pour `espace-v5-ruban`).

## Ce qui est fait / ce qui reste
Fait (diagnostic) : mesures avant, constats, plan, quatre bancs Node.

### L'ORBITE V7 — première passe de correction (2026-11-14, deux ingénieurs : le 1er interrompu, le 2e a vérifié, mesuré, commité ; consigne de Sacha relayée : « vas-y mollo sur les tokens » → mesures ciblées)
Interrupteur : `?espace=v6` = la route d'avant AU BIT PRÈS (points ET normales identiques à origin/main, prouvé par `normales.cjs`, graines 1-6, p0/10/20). Pas d'interrupteur par étape (`?orbmur`, `?orbface`, `?orbaxe` du plan : non faits).
Ce qui change (tout sous `ORB_FACE`, défini dans `route-sans-haut.js`) :
- **dévers des liaisons propre à l'orbite** (`ORB_DEVERS` : max 62° au lieu de 38, vitesse bornée ; `ORB_ROULIS` = 38°/s réels pour le coucher total dévers + module) — `pisteTord` ne l'applique que si `D2===ORB5` : les nuages gardent `TORD_DEVERS` (prouvé, normales identiques) ;
- **modules couchés sur le mur** : fronde et plongeant 72-80°, ceinture et bobsleigh 52-62°, rentrée à l'endroit 69-77° ; **un virage qui change de face TÔT** (`ORB_FACE9` : surbaissé / fronde au plafond / plongeant au plafond, 1er ou 2e temps fort), surbaissé plus ample (126-148°) avec un géant au cœur ;
- **la spirale suivie partout** : `derAx` recalculé à chaque module (`poseO`, ville-entree.js) et `TOT_AX` 230-340° (même tirage) ; la tête en bas de la grande torsade raccourcie de 0,6 s ; faille à l'envers redécoupée (R3).

Mesures APRÈS (même bancs, 16 graines sauf juge) — avant → après :
| palier 0 | avant | après |
|---|---|---|
| amplitude du cap | 240° | **349°** (min 236) |
| cap net (spirale) | 119° | **246°** |
| °/km | 142 | **135** (en baisse : cible 200 NON atteinte) |
| temps à plat / 20-60 / 60-90 / envers | 41 / 41 / 4 / 14 % | 35 / 32 / **16** / 18 % |
| virages relevés 60-90° · au plafond, par route | 0,2 · 3,0 | **3,1 · 3,9** |
| épisodes à l'envers · 1er à | 1,21 · 48 % | **2,00 · 26 %** (au plus tôt 14 %) |
| plus long sans dépasser 60° | 28,3 s | **12,3 s** (max 20,1) |
| plus long à plat · routes > 6 s | 8,8 s · 21/24 | 6,9 s (max 9,5) · 13/16 |
Palier 10 : amplitude 259 → 288°, 60-90° 5 → 12 %, 2 épisodes (1er à 35 %), °/km 78 → 75. Palier 20 : quasi inchangé (1 épisode à 54 %, 170°, 31°/km).
Juge (`juge-node.cjs`, 8 graines × 0/10/20) : **27/30 gardé**, mêmes échecs (R5 p0, R6 p0, R5 p20). R3 p95 38 partout ; max 40 au p0/p10 ; **57°/s au p20 à s=0** (liaison du départ, 50 avant — sous 60, à regarder). R7 84,7 / 78,1 / 76,2 % (avant 78,7 / 80,3 / 75,7). R8 18,7 % et 8,9 s au p0. R13 >60° 42,4 % au p0.
Empreinte des autres maps : ville, crypto, nuages IDENTIQUES (mêmes hashes que l'avant) ; espace p0 `1c2316daab18`, p10 `11c5e3e7b4c7`.
En jeu (Chrome headless muet, port 8350/9550-9551) : roulage instrumenté Saturne g2 et g4 (`roule-page.js`, p0) : portail atteint, 0 chute, 0 contact, tout en `drive`, 0 erreur ; photos ordi Saturne g4 et `--tel=1` Mars g3 : 0 erreur, vivant au bout. Photos : `scratchpad/pro-espace-apres/` (roule, pc-soir, tel-midi). Vu : la fronde monte sur la paroi, lisible ; écran de Mars au téléphone propre.

### Ce qui reste (non fait / non vérifié)
- **°/km : 135 pour 200 visés** (étape 5 : une seule faille OU cascade, rayons au p0) ; amplitude 349 pour 450 (monter `TOT_AX`).
- Le « S retourné » (étape 3) et le budget d'envers en secondes (étape 4) : non faits ; ce sont encore 2 épisodes (pas 3).
- Palier 20 : inchangé (R5 jaccard 1,00, 1 seul épisode).
- R3 57°/s au départ du p20 : à comprendre.
- Coût (banc-graphismes) non remesuré : la route ne change pas le décor ; non vérifié. Paliers 10/20 en jeu non roulés. Photos Terre et téléphone Saturne non prises.
- Constats 7 (roches autour de la route) et 8 (face sombre) : non traités. Encadré du haut (Jade vs espace) : toujours à trancher.
