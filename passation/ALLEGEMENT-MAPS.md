# ALLÈGEMENT — LOT E « maps » (18/10/2026, branche `al-maps`, base 024675ba)

`VERSION PRINCIPALE/index.html` : 7 660 148 → 7 538 359 octets (−121 789, −1,6 %). Chaque map par défaut reste IDENTIQUE : les tables de palette
(BIOMES, SF_CARTES, DA, NIVEAUX…) sont les mêmes avant/après (exécutées dans un bac à sable), les 98 textes GLSL de haut niveau inchangés sont
les mêmes au caractère près, les 5 qui changent sont celles dont on a enlevé une branche (lues avec un analyseur GLSL : rien de nouveau non déclaré).

## Ce qui est parti (octets gagnés)
- 31 · Forêt « slalom » + mousse (−16 188) : `?foret=slalom|zigzag`, `forZigzag`, `FORET.zig/zigTer/zigEl/zigL`, la MOUSSE (`MOU`, `foretSolVol`, `mousseOk`,
  `dbgMousse`, `dbgPont`), le shader `uMou`, les troncs de collision (`tronc`, `FORET.troncs`, `FORET.coup`), les lucioles du slalom (`uLucK`).
  `fbBoite` n'est PAS touché. Les abeilles testaient `FORET.zig!==undefined` : elles testent `FORET.pel!==undefined` (posé au même moment).
- 36 · Glacier v3 (−20 563) : `?glacier=v3`, les ~25 ternaires `BANQ_V4` (branche v4 gardée), les LACS GELÉS (`banqLacs`, `bkLacR`, `banqLacA`, `BK_LAC_*`,
  `M.lac`, `BANQ.lacs`, `BKS.lac`, le « galet »), les STALACTITES qui se brisent (`STAL*`, `dbgStal`), `BK_LARG`, `#ifdef V4` du verglas.
- 37 · PARTIEL (−110) : `?portail=ancien` part, mais l'ovule rose (`portalGeo/portalMat`, noyau, halo) RESTE : le PARC (Freestyle, bouton des réglages) le construit encore.
- 38 · `?cubes=gros` (−8 277 avec 37) : `fbCubes`, `FOR_CUBES_V` et la branche « cubes » du GLSL des arbres (`aA.z ≥ 10`, `hC9/hT9`).
- 39 · Styles de route de Jade (−23 921) : `?route=…`, touche R, `JROUTE`, `jadeRouteStyle` (réduit à `jadeRoute()` : les effets du style par défaut sont gardés),
  `JADE_PB`/`jadePiecesBord`, `JADE_LEVE`, et tout le GLSL « route de jade » du bitume (`uJadeR` valait 0 par défaut), `uJStyle`, `uHalf`.
- 41 · `?courbe=2` (−7 664 avec 42) : `COURBE_V2`, `ACES_FS_V2`, `courbeBascule`, `dbgGfx({courbe,pied})`.
- 42 · `cielMotif` (le ciel pommelé) et `?sans=ciel2`.
- 34 · Villes de jour (−14 930) : biomes `villeMatin/Midi/Soir`, leurs surcouches, `SIG_V.villejour`, `METRO_V`/`metroJour` (grues, tours de jour, ciel de la
  métropole), `VILLE_NUIT_V` (la ville de nuit est la seule définition de `SF_CARTES.ville`), `VILLE2_V`, `VILLE_ROSE_V`, `PLAFROSE_V`. Le GLSL des façades « de jour »
  RESTE : CRYPTO CITY et la ville vitrée de jour s'en servent (`CITY.uJ`).
- 44 · 53 `?sans=…` de couleurs et d'images (neon, nebuleuses, cysoleil, ciel2, flou, coton, nujour, nuvit, haut, virages, lumieres, bords, bordsmap, metropole, vives,
  plafrose, villenuit, villejour, villerose, nuagesjour, jade2, foret2, orbite3, canyon2, banquise2, volcan2, clairdelune, continuite, matiere, minicubes, vitrail,
  contraste, pleureurs, tordus, abeilles, cylisse, cyserre, facades, neonville, villegta, vitree, mernuit, garage, oeil, soir2, aurore2, cumnuit, ville2, jadenuit,
  orbite2, teinte, titre, nufond) + `?ciel=peche`, et les `?sans=mousse` et `lucioles` du lot 31. Valeur par défaut gardée partout ; `NFEU_P10_AVANT` et ses tables parties.
  Les valeurs de palette ÉCRASÉES plus tard (le « avant » des surcouches) sont retirées une à une (−19 k) : l'outil n'a gardé une suppression que si TOUTES les tables
  finales restaient identiques. Les surcouches restent des instructions séparées : `bioMet` copie le parent avant elles, les replier dans les définitions de base
  changerait les biomes filles.

## Ce qui reste et pourquoi
- Ovule rose du portail (PARC). Façades de jour (crypto/vitrée). `PLEUR={on:true}` et `dbgPleureurs` (bancs). `LUM_U`, `BORDS`… : vivants.
- Pas touché, hors lot : `?plafond=1`, `?vitre=spirale` (autres vieilles variantes de la ville vitrée), `?foret=serre`, `?prebati=0`.

## À régler par l'intégrateur (zones communes / hors lot)
- Sons de la banque devenus muets : `foret.mousse`, `banq.bris` (`sons-banque.js`, `atelier-son/recettes.js`).
- Mission secrète `lac10` (« GLISSE 10 S SUR UN LAC GELÉ », compteur `M2R.lac`, `BANQ.sur===2`) : impossible depuis le glacier v4 (déjà avant ce lot).
- `routeTick` remet `ROAD_U.uGlace` à 0 à chaque image : le « bitume glacé » (`GLACE`, shader `uGlace`) est mort par défaut (déjà avant ce lot).
- `CLAUDE.md` à la RACINE du dépôt, lignes 77 et 79 : `?sans=lumieres` et `?sans=villenuit` n'existent plus.

## Guides
`VERSION PRINCIPALE/CLAUDE.md` corrigé ; `passation/GRAPHISME.md`, `ETAT-GRAPHISME.md` (une ligne : la convention `?sans=` n'existe plus), `DEBUGGING.md`, `DA-CARCASH.md`.
