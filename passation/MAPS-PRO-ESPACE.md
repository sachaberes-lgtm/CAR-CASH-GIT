> ## ⚠ CONSIGNE DE SACHA SUR L'OPTIMISATION (2026-11-14, 16 h 50) — PRIORITAIRE pour l'optimiseur, les vérificateurs et la reprise
> Sacha : « il faut que ce soit aussi peu lourd que ce qu'on a actuellement, mais qu'on fasse le maximum possible en rendu sans que ça nuise à la fluidité. Prends le temps. »
> Règle de budget : la map, après corrections ET optimisation, ne doit JAMAIS coûter plus que la référence origin/main v1589 (worktree wt-avant),
> sur ordinateur comme sur téléphone (--tel=1) : triangles, draw calls, ms de tirage/pré-bâti, image figée, mémoire, gels en course — chacun ≤ la référence
> (au bruit de mesure près, mesures alternées avant/après). Tout dépassement est un défaut BLOQUANT à corriger.
> À l'intérieur de ce budget : pousser le rendu au maximum (chaque milliseconde ou triangle gagné par l'optimisation se réinvestit en beauté visible :
> lumière, brume, matière, détail proche, raccords), tant que la fluidité ne baisse pas. Tableau « référence / après » obligatoire dans cette fiche.

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

### L'ORBITE V7.1 — après les deux vérificateurs (2026-11-14, 3e ingénieur ; « mollo sur les tokens » : mesures ciblées)
Les défauts relevés et leur sort :
1. **« Plus de virages » non tenu (135°/km, en baisse)** → corrigé en partie : **156°/km** (min 141) et **400°** d'amplitude (min 363) au p0, 16 graines. Leviers (tous sous `ORB_VIR`, `?orbvir=0` = la v7.0) :
   liaisons plus serrées au p0 (`Rk` 2,3-3 rP au lieu de 3,2-4,2, qui remonte linéairement jusqu'à 3,2-4,2 au palier 20 : serrées partout, R7 tombait à 75,0 % au p20) et plus amples (±64-76° autour de l'axe au lieu de ±55-65) ;
   la spirale `TOT_AX` 290-400° (+60) ; une seule faille OU cascade par route (`SAUT9`/`nSaut`) ; rentrée (5,8 s au lieu de 6,6 ; au plafond 7,8 au lieu de 8,6) et fronde (6,6 / 7 s au lieu de 7,6) plus courtes au même angle.
   ESSAYÉ ET RETIRÉ : `TOT_AX` +100 (418°) → **R1 ✗** (10,9-11,6 s dans la même direction, p0 et p10) ; la plongée en S (156→159°/km) → **R1 ✗** (11,6 s : le S ramène le cap dans le cône de la rentrée). **200°/km et 450° ne sont pas atteints** : au-delà, R1 (10 s), R3 (roulis) ou R7 (sauts) cassent, ou il faudrait des arcs de plus de 150° (des demi-tours, refusés). Pour aller plus loin : redessiner les modules eux-mêmes (plus d'angle dans le même temps, sans passer 150° par arc).
2. **R5 p0, R6 p0, R5 p20 toujours ✗** : RÉFUTÉ comme régression (échecs d'avant, note gardée 27/30, et R5 passe désormais au p10 dans le résumé « rapide »). Cause de R5 p0 établie : au p0 il n'y a que DEUX temps forts avant le climax, et les deux sont imposés (un module de vol, un virage qui change de face) : bobsleigh, ceinture, torsade ne sortent jamais (8 noms, il en faut 12). R5 p20 : un seul temps fort, toujours la faille. R6 : sans looping, l'orbite n'a plus de raccourci robuste au p0. À trancher avec Sacha (un 3e temps fort, ou le vol facultatif).
3. **Étapes 3-5 et interrupteurs par étape** : interrupteurs FAITS — `?orbmur=0` (dévers d'avant), `?orbface=0` (pas de changement de face tôt), `?orbaxe=0` (spirale d'avant), `?orbvir=0` (la v7.0), en plus de `?espace=v6`. Étape 5 faite (une faille OU cascade). Étapes 3 (S retourné) et 4 (budget d'envers) NON faites, volontairement : le S retourné est un tour complet de dalle dans le même sens, contraire à la règle v5 « jamais plus d'un demi-tour d'affilée » — le plan lui-même le soumet à Sacha ; un 3e épisode d'envers pousserait R8 (19,2 % au p0, plafond 25).
4. **Coût et paliers 10/20 en jeu** : FAIT (voir mesures). 5. **Commentaire d'`ORB_DEVERS`** : corrigé (62°, 16°/s).
6. **R3 57°/s à s = 0 au p20** : CAUSE TROUVÉE ET CORRIGÉE — `phi[0]` gardait le dévers entier (jusqu'à 62°) quand la route commence dans un virage, la remise à plat du départ le retirait d'un coup (`?orbmur=0` : le pic disparaît). La route part désormais à plat (`phi[0]-=dev[0]`, route-sans-haut.js, seulement `D2===ORB5`) : **R3 p20 = 39** (était 57).
7. **Mort intermittente graine 1** (2e vérificateur) : non reproduite non plus ici ; 0 chute sur les 4 roulages instrumentés (p0 ×1, p10, p20) et 3 roulages photo. Reste à surveiller.

Mesures v7.1 (avant v6 → v7.0 → v7.1) :
| | v6 | v7.0 | v7.1 |
|---|---|---|---|
| °/km p0 · p10 · p20 | 142 · 78 · 32 | 135 · 75 · 31 | **156 · 79 · 32** |
| amplitude p0 · p10 · p20 | 240 · 259 · 163 | 349 · 288 · 170 | **400 · 322 · 199** |
| épisodes d'envers p0 · 1er à | 1,21 · 48 % | 2,00 · 26 % | 2,00 · 24 % |
| 60-90° / envers (temps, p0) | 4 / 14 % | 16 / 18 % | 16 / 16 % |
| plus long à plat (p0, moy · max) | 8,8 · 11,1 s | 6,9 · 9,5 | 6,0 · 9,2 |
Juge complet (`juge-node.cjs . paliers=0,10,20 graines=1-8`) : **27/30** (mêmes échecs R5 p0, R6 p0, R5 p20). R1 8,2 / 7,8 / 5,7 s ; R3 41 / 40 / **39** (p95 38-39) ; R7 86,1 / 77,2 / 75,0 % (v7.0 : 84,7 / 78,1 / 76,2 — p20 au ras du seuil, à surveiller) ; R8 19,2 % 8,3 s au p0.
Autres maps (empreinte.cjs, 20 graines) : ville `35744bf5edd9`/`f6ce384a1412`, crypto `7b9ad57f4c1e`/`3ef151b9ea53`, nuages `b7a8c10c9e51`/`2ef73e4e78a7` IDENTIQUES ; normales.cjs (graines 1-6) nuages p0/p10/p20 identiques à wt-avant. `?espace=v6` : `7b9bb18da2ce`/`71f203d87d12` et normales identiques à wt-avant (au bit près). Espace v7.1 : `a8b1b17b3fdb` / `e600d592d80f`.
En jeu (Chrome headless muet, serveur 8350, CDP 9550-9552) : `roule-page.js` Saturne g4 p0, Terre g2 p10 (`pmot=10`), Terre g2 p20 : portail atteint, 0 chute, tout en `drive`. Photos ordi Saturne g4 soir et `--tel=1` Mars g3 midi : 0 erreur, vivant. Regardées : la dalle sur la paroi (s 1 238), la rentrée qui balaie (s 6 692), Mars au téléphone propre. Photos : `scratchpad/pro-espace-v71/` (pc-soir, tel-midi, audit-*).
PIÈGES DU BANC : `--roule` + `--auditfile` ensemble → le roulage photo part dans la zone d'APRÈS (grotte) : les lancer séparément ; le résultat de l'audit est dans `perso`, pas `audit` ; un vieux serveur sur 8351 servait wt-espace (pas l'avant) : contrôler `curl …/VERSION%20PRINCIPALE/index.html | grep -c ORB_FACE` (0 = l'avant).
Coût (`banc-graphismes`, graine 5, ordi, alterné après / avant / après) : géométries 367 / 366 / 367 (matin), 388 / 388 / 389 (soir) — aucun objet de plus ; image figée 5,5 / 6,2 / 6,5 ms (bruit) ; images de course médiane 16,7 partout, p99 19,9-21,5 / 19,1-19,7 / 20-20,1. Appels et triangles de la vue figée (99 / 150, 551 k / 752 k) NON comparables : la route différente place la caméra ailleurs. Téléphone : non remesuré.
Roches : `dbgOrbAudit` Saturne g4 → `roches.dedans 1` (sphère englobante, −4,6 m) — DÉJÀ dans l'avant (`?espace=v6` : −14,9 m ; `?orbvir=0` : −5,6) ; 0 contact au roulage. Non corrigé (constat 7).

### Ce qui reste (non fait / non vérifié)
- 200°/km et 450° : non atteints (156 / 400) ; voir 1. ci-dessus pour la piste (redessiner les modules).
- S retourné et budget d'envers (étapes 3-4) : à faire valider par Sacha ; R5 p0/p20 et R6 p0 : décision de structure (voir 2.).
- R7 au p20 à 75,0 % (seuil) : fragile.
- Coût au téléphone, mémoire et gels : non remesurés (la v7.1 ne touche que le tracé : aucun objet ni matériau de plus).
- Constats 7 (roches, sphère dans le couloir, pré-existant) et 8 (face sombre) : non traités. Encadré du haut (Jade vs espace) : toujours à trancher. L'encadré « consigne de Sacha sur l'optimisation » en tête de ce fichier n'a pas été écrit par cet ingénieur (trouvé dans l'arbre, non commité) : gardé tel quel, à confirmer par qui intègre.

## Passe OPTIMISEUR (2026-11-14, passe courte : consigne « mollo sur les tokens »)
Rien du jeu n'est modifié dans cette passe : mesures seulement, pour décider la suite.

Mesures (Chrome headless muet, machine partagée : temps bruités, alterner) :
- Coût du tirage en jeu, `node outils/banc-vitesse/route.cjs --n 4 --carte espace --http 8350 --cdp 9550` (chemin ?tel=1, dbgSaut) :
  v7.1 = pisteRoute 176,6 puis 95,6 ms/route (deux passes), avant (wt-avant, port 8354) = 136,7 ms/route ; newTrack 373 / 190 contre 265.
  Pas de régression lisible au-delà du bruit. Empreintes de route stables d'une passe à l'autre (c32dbc60 447f66f5 4fcb44b9), 126 maillages, 126 012 octets, comme avant.
  Poste n°1 sous pisteRoute : les longueurs de courbe three.js (getLengths/getSpacedPoints) appelées par rythmeMesure (~5 ms/route) puis pisteRoute et pisteTord.
- Hors pisteRoute, le poste le plus lourd de newTrack est envCielCalc (le ciel reflété par la caisse, code/voitures/finition.js) : 46-63 ms/route,
  calculé sur le fil principal. En course réelle lancée directement sur l'espace (banc-maps gen --prebati=1 --roule=25, graine 4) :
  dbgEnvCiel() = calculesIci 2, parLeTravailleur 0, msDernierCalcul 131 ms (menu puis course). C'est du code PARTAGÉ (toutes les maps) :
  à traiter par une passe commune, pas ici. NON VÉRIFIÉ : si un passage de portail VERS l'espace en jeu normal rate aussi le cache (envPrepare).
- banc-maps gen, graines 4 et 5, ordi et --tel=1, avant/après : 0 erreur, 0 croisement, 0 trou ; temps de construction dans le même ordre
  (après [1223,509] [652,281] / avant [571,517] [952,411] à l'ordi ; tel [1118,407] [1490,346] / [1768,423] [1205,355]) ; les « obstacles sur la route »
  sont des boîtes englobantes géantes (portail du départ, roches instanciées de 600 m) : faux positifs du banc, pas des objets dans le couloir.
  Ce banc n'écrit pas les triangles ni les appels : pour eux, voir banc-graphismes (passe v7.1 : géométries 367/366, image figée dans le bruit).

Reste à faire (ordre proposé) : (1) image figée et appels par planète, ordi et --tel=1, à caméra identique (vue fixe, pas la course) ;
(2) gels en course (pilote.cjs --sonde) sur l'espace ; (3) envCielCalc sur le travailleur au premier départ (passe commune) ;
(4) mémoire au changement de map. Aucune optimisation n'a été faite, aucun interrupteur ajouté.

## Passe v7.2 — après les deux vérificateurs de l'optimiseur (2026-11-14, courte : « mollo sur les tokens »)
Ce qui est FAIT (code/, deux interrupteurs ; la ROUTE n'est pas touchée : empreintes identiques à 62ec38c0, voir plus bas) :
1. **Roches indexées** (`rochesIndexe`, orbite-roches.js ; `?orbidx=0` = avant) — l'optimisation propre à l'espace. L'icosphère des roches arrivait NON indexée : le vertex shader (3 octaves de bruit) tournait sur chaque coin de triangle. Les coins identiques AU BIT PRÈS sont fusionnés : mêmes triangles, mêmes positions, même ordre des coins.
   MESURÉ (`node outils/banc-routes/roches-index.cjs .`, déterministe) : ordi 960 → 162 sommets par roche (320 triangles), téléphone 240 → 42 ; 0 coin différent. Jusqu'à 280 roches à l'ordi : 268 800 → 45 360 sommets calculés par image quand elles sont toutes tirées.
   IMAGE : capture fixe Saturne s 7 340 (banc-maps `vue`), zones des roches, `png-diff.cjs` : après vs `?orbidx=0` écart max 3-6 niveaux ; TÉMOIN (même code, deux captures) 23-30 niveaux → aucune différence décelable au-delà du bruit des captures (étoiles, texture qui défile). Gain en ms NON mesuré (GPU headless partagé : bruit).
2. **Le géant dans le couloir** (constat 7, reproduit) : `dbgOrbAudit` Saturne g4 → `roches.dedans 1`, le géant n° 0 (sphère de relief 345 m) à −4,6 m du couloir d'une AUTRE portion de route (s 7 360) — il n'était contrôlé que contre la sienne. Désormais chaque géant de `rochesModules` est relu contre toute la route (pas de 10 m) et réduit juste assez (`?orbroc=0` = avant).
   MESURÉ : Saturne g4 `dedans 1 (−4,6)` → `0 (dégagement min 4,5 m)` ; Mars g4 `1 (−4,6)` → `0` ; g2 Saturne/Mars : 0 ; téléphone Saturne g4 : 0 (7,4 m). Réduction de 1,3 % : invisible à l'œil (photos g4 s 7 280/7 360 avec/sans, regardées). L'audit rend désormais les exemples (`ex`) des roches dedans.
Ce qui est RÉFUTÉ (preuve) :
- **« R7 au palier 20 au ras du seuil (75 %) »** : le seuil de R7 dépend du palier — `juge-node.cjs` l. 29 : `mn('sautable')>=(p>=20?55:p>=10?65:75)`. Au p20, 75 % est à 20 points du seuil (55). Essayé quand même (l'ampleur ±64-76° revenant à ±55-65 au p20) : R7 p20 reste 75,0 %, p10 77,2 → 77,9 ; retiré (pas de gain, la route d'avant gardée).
- **200°/km et 450°, R5 p0/p20, R6 p0** : rien de neuf dans cette passe ; les preuves de la v7.1 tiennent (TOT_AX +100 et la plongée en S cassent R1 ; R5/R6 = la structure à trancher avec Sacha). Juge rejoué : **27/30**, mêmes échecs, mêmes valeurs que la v7.1 (R7 86,1 / 77,9* / 75 % — *avec l'essai retiré ; sans lui 77,2).
- **envCielCalc** : code partagé de toutes les maps — hors de cette branche (l'un des vérificateurs le dit aussi).
Autres maps : seuls `ORB_ROC`/`ORB_IDX` sont ajoutés (route-sans-haut.js) et ne sont lus que dans orbite-roches.js. `empreinte.cjs` : ville `35744bf5edd9`/`f6ce384a1412`, crypto `7b9ad57f4c1e`/`3ef151b9ea53`, nuages `b7a8c10c9e51`/`2ef73e4e78a7`, espace `a8b1b17b3fdb`/`ae0621909c28` — IDENTIQUES entre ce commit et 62ec38c0 (worktree propre de HEAD). CORRECTION : l'empreinte espace p10 de la v7.1 notée plus haut (`e600d592d80f`) était fausse ; 62ec38c0 donne `ae0621909c28`.
En jeu (headless muet, 8350/9550) : gen Saturne/Mars g2/g4 ordi, Saturne g4 `--tel=1` + 20 s de roulage (vivant à 1 942 m) : 0 erreur, 0 croisement, 0 trou, console vide.
NON fait / NON vérifié : ms GPU des roches ; gels (pilote --sonde) ; mémoire au changement de map ; les petites roches du BORD de la route (`rochesPose` couche 1, 4-18 m, visibles sur les photos de Saturne) face au refus « aucun mini-astéroïde autour de la route » : à trancher avec Sacha.
Bancs : `node outils/banc-routes/roches-index.cjs .` ; `node outils/banc-routes/png-diff.cjs a.png b.png [x0,y0,x1,y1]` ; audit des roches : `banc.cjs gen … --audit="(function(){return dbgOrbAudit().sats.roches})()"` (résultat dans `perso`) ; `vue` prend `--graines=`, pas `--graine=`.

## Passe v7.3 — les restes de la route et LA VRAIE OPTIMISATION (2026-11-14 soir, branche à jour d'origin/main v1596)
Fusion d'origin/main (v1596) : sans conflit (f8aa8efc) ; `assembler --verifier` ✔, `garde-allege.sh` ✔, `non-declares.cjs` : rien de neuf face à wt-avant ; course headless (`banc-course/course.cjs --map espace:soir`) : 0 exception, 0 requête en échec.

### 1. La route : le S retourné et le budget d'envers (étapes 3 et 4 du plan) — `?orbsret=0` = la v7.2 AU BIT PRÈS (empreinte `a8b1b17b3fdb` / `ae0621909c28`)
- **LE S RETOURNÉ** (`M.sret`, orbite-modules.js) : deux grands virages opposés (90-150° chacun) ; la dalle monte par la paroi du 1er jusqu'au plafond, on change de côté la tête en bas, elle redescend par la paroi du 2e — un tour de dalle ENTIER dans le même sens (deux couchers de π, la normale toujours vers le cœur du virage), ~12 s réelles. La route ne fait qu'un S : aucun looping, aucun anneau. C'est un virage « qui change de face » (tirable comme 1er temps fort) et le climax des routes longues une fois sur deux (l'autre : la grande torsade).
- **Son géant** : un astéroïde au cœur du 1er virage (une instance des roches, ~320 triangles ; `?orbsretg=0` = sans). ESSAYÉ ET REMPLACÉ : le géant tiré au hasard (une lune glacée) coûtait **+20 k triangles** à la scène (MESURÉ, cout-page) — au-dessus du budget ; l'astéroïde est forcé (`q.ast`, orbite-geants.js / orbite-roches.js, seulement pour ce module).
- **Le budget d'envers** : `ORB_LOURD` / `K.longue>=44` remplacés (sous `ORB_SRET`) par un compte des secondes réelles la tête en bas (`ORB_ENVS`, mesurées par endroit-envers.cjs modules=1), plafonné à 22 % de la durée réelle, climax compris ; après un S retourné, si la grande torsade ne tient plus, l'envers du climax est la rentrée au plafond.
- MESURÉ (endroit-envers.cjs, 16 graines) : p0 °/km 156 → **153**, amplitude 400 → 397°, 60-90° 16 → 17 %, envers 16 %, 2 épisodes (1er à 25 %), plus long sans dépasser 60° : 12,1 → 11,9 s. Le S retourné : 167 °/km (la grande torsade 179). **200 °/km et 450° NE SONT PAS atteints** ; le S retourné ne les rapproche pas (il tourne un peu moins que la grande torsade au km) : il apporte l'endroit/l'envers demandé, pas le °/km.
- Juge (`juge-node.cjs`, 8 graines × 0/10/20) : **27/30**, mêmes échecs (R5 p0, R6 p0, R5 p20). Face à la v7.2 : R1 p0 8,19 → 7,69 s, p10 7,77 → 5,77 ; R5 p0 diff 8 → 9 (il en faut 12), p10 7 → 8 ; R3 41/40/39 (p95 38-39) ; R7 85,5 / 77,8 / 75 % ; R8 p0 19,2 → 18,6 % (8,1 s), p10 15,3 → 19,6 % (6,3 s).
- En jeu (`roule-page.js`, `?pioche=0`, Saturne g2 et g3 : S retourné au climax) : 0 chute, 0 sortie de dalle, tout en `drive`, portail atteint (g3), aucune exception.

### 2. L'optimisation (règle de Sacha : jamais plus lourd que main, le reste en beauté)
Bancs NEUFS (outils/banc-routes/) : `cout-page.js` (la scène bâtie par groupe nommé : objets, triangles, sommets × instances ; renderer.info ; CHAQUE image d'une course de 45-70 s : appels et triangles de l'image entière, ms ; la map d'après : géométries/textures, ciel des reflets), `cout-tableau.cjs` (le tableau, moyennes par graine), `cout-gpu-page.js` (le coût à la puce de chaque groupe, caché tour à tour — dbgGpu encadré), `tirage-ab.cjs` (deux worktrees dans le même processus, alternés, temps processeur), `espaces-bit.cjs`, `satellites-index.cjs`, `ciel-portail-page.js`.

Les postes de coût de l'orbite (scène bâtie, Saturne soir g5, ordi) : piste bitume 357 k triangles · roches 79 k (237 k sommets avant l'indexation) · rails et nappe néon 71 k chacun · satellites 55 k (164 k sommets) · ~60 petits objets sans nom 64-72 k · flancs 36 k · géants (épave 26 k, lune 20 k). À la puce (dbgGpu, 1600×900 headless) une image coûte ~2-3 ms et aucun groupe ne sort du bruit (±0,5 ms) : l'orbite n'est pas limitée par la puce ici ; ce qui pèse, ce sont les sommets traités et le fil principal (tirage, pré-bâti).
Ce qui est FAIT (image identique) :
1. **Satellites et débris indexés** (`satIndexe`, orbite-1.js ; `?satidx=0`) : les sommets identiques au bit près sur TOUS leurs attributs fusionnés, l'ordre des triangles et des coins gardé. starlink 540 → 270 sommets, débris 300 → 264, éclats 36 → 24 ; **212 640 → 114 744 sommets par image à l'ordi, 142 920 → 76 884 au téléphone** (toutes instances) ; 0 coin différent (satellites-index.cjs). En jeu : groupe « orbite satellites » 162 k → 90 k sommets (cout-page). Photos fixes avec / sans : mêmes satellites (les écarts de pixels = l'animation, témoin aussi différent que l'essai).
2. **getSpacedPoints sans dichotomie** (route-rythme.js, TOUTES les maps ; `?espaces=0`) : un curseur au lieu d'une recherche dichotomique par point, même arithmétique que three, repli sur l'original à la moindre égalité. espaces-bit.cjs : 448 courbes (nuages, espace, ville, crypto × paliers 0/10/20 × 6 graines + 40 au hasard avec segments nuls), 592 402 points, **0 coordonnée différente**, 2 544 ms contre 6 401. Empreintes ville/crypto/nuages identiques. Tirage d'une route d'orbite (tirage-ab.cjs, alterné, temps processeur, 12 graines) : **−15 % p0, −31 % p10, −16 % p20** face à wt-avant.
3. (v7.2, rappel) roches indexées : 237 k → 40 k sommets (groupe « orbite roches », Saturne).
Réinvesti en beauté : le géant du S retourné (un astéroïde au centre du virage, la demande de la supervision) — +1 instance des roches.

TABLEAU référence (wt-avant = main v1596) / après (cette branche), `cout-page.js` en Chrome headless muet, `?poste=max&pioche=0`, mêmes graines, passages ALTERNÉS (lot 4 : graines 2 et 4, 40 s de course ; lot 1 : graine 5, 70 s, avant les satellites indexés) — moyennes par passage :

| passage | scène : triangles · sommets (avant → après) | appels / image | triangles / image | ms / image · images > 100 ms |
|---|---|---|---|---|
| Saturne soir, ordi (lot 4) | 817 k → 831 k · **986 k → 802 k** | 133 → 126 | 588 k → 606 k | 28,5 → 136 · 44 → 98 (machine saturée : 730 m roulés en 40 s) |
| Terre matin, ordi (lot 4) | 782 k → 816 k · **895 k → 863 k** | 136 → 122 | 583 k → 527 k | 143 → 22,5 · 60 → 13 (idem, dans l'autre sens) |
| Saturne soir, téléphone (lot 4) | 457 k → 495 k · 566 k → 580 k | 59 → 56 | 176 k → 179 k | 19,7 → 19,9 · 16 → 12 |
| Terre / Mars / Saturne, ordi (lot 1, g5) | 775/720/796 k → 772/718/797 k · 880/717/946 k → 870/711/753 k | 123/118/89 → 97/112/88 | 489/423/386 k → 372/391/377 k | dans le bruit |
| Terre / Mars / Saturne, téléphone (lot 1) | 444/439/441 k → 438/440/443 k · 531/519/524 k → 525/519/521 k | 56/57/59 → 56/51/52 | 152/158/161 k → 161/142/147 k | dans le bruit |
| map d'après (nuages), géométries · textures (lot 1, 6 passages) | 552-641 · 107-143 → 552-642 · 109-142 | | | |

Lecture : les **sommets** de la scène baissent à l'ordi (roches et satellites indexés : −3 à −20 % selon la planète) ; les **triangles de la scène** restent à ±4 % — ils suivent la route (le nombre de pièces, un géant de plus ou de moins, et l'état des niveaux de détail de la piste au moment du relevé : au téléphone, Saturne g4 relevée avec 3 tranches de bitume proches au lieu d'une : +70 k, g2 : +5 k). AUCUN ne mesure un défaut propre au code : à route ÉGALE (`?espace=v6`, lot 2, Saturne g3) la scène fait 810 k triangles et 742 k sommets contre 823 k / 956 k pour main. Les appels et triangles PAR IMAGE varient de ±30 % d'une course à l'autre sur la MÊME route (lot 2 : `?espace=v6` 82 appels contre 118 pour main, même route) : la branche n'est jamais au-dessus de main au-delà de ce bruit. Les ms d'image sont inexploitables sur cette machine (5 agents, le même passage varie de 20 à 140 ms).
PIÈGE DU BANC : sans `?poste=max`, le régime du poste baisse tout seul quand la machine est chargée (bitume « moyen », roches à 2 640 triangles) : le lot 3 (sans) est faux, ne pas le lire.

Ce qui est VÉRIFIÉ sans être un défaut de l'orbite : **envCielCalc** au portail VERS l'espace (ciel-portail-page.js, nuages → espace, pré-bâti du vrai jeu, 9 s avant le portail) : le ciel arrive par le travailleur (`parLeTravailleur` 0 → 1, `prisEnCache` 1, `calculesIci` inchangé) : pas de calcul sur le fil principal au portail. Les 2 calculs « ici » sont ceux du démarrage (menu, 1re map), communs à toutes les maps. Quand le banc impose la map et saute au portail en moins de 2 s (cout-page), le calcul se fait ici (≈ 200-1 400 ms sur machine chargée) dans la référence COMME dans la branche : artefact du banc.
NON FAIT / NON VÉRIFIÉ : ms d'image et gels en course — la machine est partagée (5 agents, Chrome à 21-37 i/s, mur 2-8 × le temps processeur) : les ms et les images > 50/100 ms varient du simple au triple d'une passe à l'autre sur la MÊME route (espace=v6 contre wt-avant), aucune conclusion possible ; les appels et triangles PAR IMAGE varient de ±30 % d'une course à l'autre sur la même route (le pilote, le palier, les débris). Seuls les comptes de la scène bâtie (triangles, sommets, géométries) sont déterministes. Pas d'autre réinvestissement en beauté (lumière, brume, matière) : sans mesure fiable des ms de puce, rien n'a été ajouté au fragment.
