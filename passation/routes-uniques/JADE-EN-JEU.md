# JADE, LA ROUTE UNIQUE — DANS LE JEU (2026-11-17, vérification)

Écrit au fil de l'eau : chaque section dit ce qui est PROUVÉ (chiffres, commande) et ce qui ne l'est pas encore.

## 1. Gardes (OK)
`node outils/garde-demarrage.cjs` OK (21 scripts) · `sh garde-allege.sh` ✔ · `sh garde-charte.sh` OK · `node code/assembler.cjs --verifier` ✔ (346 morceaux).

## 2. Bugs trouvés et corrigés
1. **`jade-avatar.js`, `jadeAvTick` (×2) : `JADE_RU.uTime.value`** — un renommage de trop : `JADE_RU` est un booléen ; l'horloge est `JADE_U.uTime`.
   Effet : TypeError à chaque tick des pierres dès qu'une route a `pierres` (défaut ET `?sans=uniques&jade=avatar`). Corrigé : `JADE_U.uTime.value`.
2. **`jade-uniques.js`, la clé du plan** : `ruPlan('jade', g)` ne disait pas si les lacets étaient permis (`kv ≥ 1,6`), alors que le plan en dépend :
   une même graine à un autre palier reprenait un plan tiré sans lacets (le résultat dépendait de l'ordre des appels). Corrigé (`jadeUCle(g,kv)` = `g` ou `g:L`,
   repris depuis par le pilote).
3. **Banc : forcer dans le NOUVEAU plan** (ajout, `jade-uniques.js`) : `?jsceneu=porte,arche` met ces modules en tête de `U.ordre` (`?jscene=` repasse par l'ancien
   paquet) ; `?jouv=`, `?jcap=`, `?jrelief=` imposent l'ouverture, le cap, le relief. Sans ces paramètres : rien ne change (même `sig`, mêmes empreintes).

## 3. L'ancien tirage à l'identique (`?sans=uniques`) — PROUVÉ en Node
`outils/banc-jade/opt-empreinte.cjs` : option neuve `uniques=1` (charge AUSSI `route-uniques.js` + `jade-uniques.js`, `sans=uniques` dans le search) et `uniques=2`
(le nouveau tirage, sac figé `RU.fige` pour comparer à historique égal ; l'empreinte inclut alors `JADE.u`).

| | drapeau 1 (`jade=avatar`) p0 / p10 / p20 | drapeau 0 p0 / p10 / p20 |
|---|---|---|
| référence jadeopt.md | 00706b5c / 9bd4d6f6 / 40c4a39e | 77bb6d2f / 87511d1e / 8b358b27 |
| chemin d'avant (sans les fichiers neufs), sync | identiques | identiques |
| `uniques=1` (fichiers neufs chargés, `?sans=uniques`), sync | identiques | identiques |
| `uniques=1`, tranches | identiques | identiques |

Revérifié après les retouches du pilote (LC ×1,5, unicité stricte `ruDeja`/`ruRefait`, boucle `t7`) : toujours identiques (24 graines × 3 paliers).

## 4. Le nouveau tirage : tranches / mémo = d'un trait — PROUVÉ en Node
`opt-empreinte.cjs uniques=2` (24 graines × p0/p10/p20, sac figé) : sync = memo (72 essais gagnants rejoués) = tranches (une autre vallée générée entre deux
tranches) = tranches `jf=-1` (l'essai rend la main à CHAQUE étape : 9 320-10 541 tranches par palier). État final (après les retouches du pilote), graines 1-6 :
p0 8afaf5cd… p10 8600a0ba… p20 e35a12f2… dans les trois modes.
NON prouvé : le sac NON figé (mémoire `cashcarRU`) en tranches — le plan est mémorisé par graine dans `RU.P` au premier appel, donc les tranches suivantes le
reprennent ; mais une vallée générée ENTRE deux tranches appelle `ruMarque` (elle vieillit le sac) : sans effet sur le plan déjà gardé, pas mesuré.

## 5. Forçages en Node (`?jsceneu=`, `?jouv=`, `?jrelief=`, 6 graines × p0/p10/p20)
Chaque petit module forcé est bien en tête (18/18), chaque ouverture et chaque relief tenus (18/18) ; 0 exception, 0 conflit ; notes moyennes 0,71-1,16 (pire 4,6).

## 6. Coût de génération en Node (`uniques-stat.cjs n=100`, routes de suite)
| palier | défaut : essais · ms/route · note moy | `sans=uniques` | `sans=uniques&jade=avatar` |
|---|---|---|---|
| 0 | 5,5 · 72 · 1,06 | 10 · 100 · 3,40 | 10 · 137 · 4,73 |
| 10 | 5,0 · 75 · 1,08 | 10 · 125 · 4,91 | 10 · 197 · 5,25 |
| 20 | 4,7 · 119 · 0,85 | 10 · 284 · 7,34 | 10 · 335 · 7,38 |
Le nouveau tirage est MOINS cher à générer (moins d'essais : une note ≤ 0,6 arrête la boucle) ; longueur rendue / visée ×1,5 : 1,08-1,12 (soit 1,6-1,7 × la visée
d'avant ; l'ancien paquet : 1,49-2,43).

## 7. Dans le jeu — PROUVÉ (14 courses entières + 6 avec sauts + 6 de coût)
Banc : `outils/banc-routes/uniques/jade-jeu.cjs` (neuf). Chrome sans fenêtre, MUET (`--mute-audio` + sfx/mus/vox coupés), `tel=1&appareil=iPhone14,2`, portrait
390×844 (paysage 844×390 : `pay=1`), service worker contourné + `sw.js` en 404, `?pistegraine=` (le sac est figé : le plan ne dépend que de la graine).
Jade en 1re map, au PILOTE (`dbgAuto`, mortel, sans saut volontaire ; `saut=4` : un saut toutes les 4 s), course entière (jusqu'à L − 60 m).
Relevés : exceptions, `__jadeErr`, la règle d'or (`dbgJadeRegle`), LE COULOIR de `dbgJadeAudit` (5 places × 5 hauteurs tous les 2 m + le frôlement à 1-3 m du bord ;
les panneaux et le témoin de l'audit sont retirés : 28 min par vallée sur la machine chargée), la caméra dans la roche (`jadeHeurtPt(camera.position)` toutes les
100 ms), la caisse qui décolle dans les 6 premières secondes, la route qui se recoupe (deux points à > 150 m d'écart le long de la route, < 2 demi-largeurs + 4 m en
plan, < 14 m en hauteur), les îles des scènes posées / refusées, l'eau sous la route, les programmes au départ et à la fin, appels/triangles chaque image.

**Résultat : sur les 14 courses (10 graines naturelles dont 1 en paysage, 3 à petits modules forcés, + 4 à ouverture/relief forcés), 0 exception, 0 `__jadeErr`,
règle d'or 0 heurt (≈ 10 000 essais par vallée), couloir 0, frôle 0, caméra jamais dans la roche (0 sur ~11 000 relevés), la caisse ne décolle jamais au départ,
la route ne se recoupe jamais (plus petit écart vertical entre deux passages superposés : 28 m), 0 mort.**
- Les 9 petits modules passent tous (au moins deux fois chacun, forcés ou naturels) : 0 heurt de décor dans leur tronçon.
- Les 7 ouvertures (virage, esse, calme, plonge, balcon, bosse, direct) et les 5 reliefs (plateaux, vagues, mixte, falaise, gradins) passent.
- L'eau : la route reste à 560 m au-dessus de la mer dans toutes les vallées (la mer est posée sous le point le plus bas de la route) : elle suit les reliefs qui
  remontent.
- Les îles des scènes : posées 0-9 par vallée ; refus (gardes existantes, sans défaut visible) : `ile-voisin`, `ile-route`, `ile-route-bord`, `tour-voisin`,
  `tour-route`, et `tour-aucun-gabarit` ×6 sur g203 : ce sont les six pics de LA PAROI du `mur` (scène d'avant, r = 17-23 m) — la palette de CETTE vallée n'a
  aucune forme haute assez fine (relu en Node : les 6 tours de r 17-22 m sont celles du mur). Pas un défaut des petits modules : l'ancien tirage perd la même paroi
  (`?sans=uniques` g102 : `tour-voisin` ×6) ; sur g102 (nouveau) elle est posée. La scène reste roulable, le décor manque.
- g101 : la 1re course n'a couvert que 876 m (machine à une charge de 25, 1 049 s pour 876 m) ; la vallée relue est saine ; reprise en g101 non refaite.

| course | format | ouverture · cap · relief | modules (dans l'ordre) | couvert / L (m) | exc · jadeErr | règle d'or · couloir · frôle | caméra dans la roche | décolle au départ | se recoupe | petits : heurts | morts | i/s | appels moy/p95 | triangles moy/p95 (k) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pistegraine=101 | 390x844 | virage · zigzag · plateaux | porte › defile › pierres › passerelles › arche › balcon | 876 / 8696 | 0 · 0 | 0 · 0 · 0 | 0 / 127 | 0 | 0 | porte 0, passerelles 0, arche 0 | 0 | 53.5 | 82.4 / 176 | 228 / 509 |
| pistegraine=102 | 390x844 | esse · libre · vagues | mouton › porte › plongee › bosse › mur › passerelles | 9184 / 9217 | 0 · 0 | 0 · 0 · 0 | 0 / 830 | 0 | 0 | porte 0, bosse 0, passerelles 0 | 0 | 59.2 | 76.6 / 192 | 258 / 722 |
| pistegraine=103 | 390x844 | esse · crochet · mixte | cirque › ilots › passerelles › pont › epingle › porte › ile | 8636 / 8698 | 0 · 0 | 0 · 0 · 0 | 0 / 798 | 0 | 0 | passerelles 0, epingle 0, porte 0, ile 0 | 0 | 59.2 | 63.1 / 156 | 168 / 481 |
| pistegraine=104 | 390x844 | direct · derive · falaise | tours › colimacon › ile › epingle › envers › passerelles | 9274 / 9320 | 0 · 0 | 0 · 0 · 0 | 0 / 850 | 0 | 0 | ile 0, epingle 0, passerelles 0 | 0 | 30.1 | 141.8 / 192 | 496 / 823 |
| pistegraine=105 | 390x844 | balcon · libre · gradins | couloir › puits › gorge › belvedere › toboggan | 8632 / 8697 | 0 · 0 | 0 · 0 · 0 | 0 / 825 | 0 | 0 | gorge 0, toboggan 0 | 0 | 29.8 | 143.8 / 189 | 410 / 563 |
| pistegraine=106 | 390x844 | calme · crochet · vagues | bosse › remontee › colimacon › epingle › balcon › couloir | 9856 / 9895 | 0 · 0 | 0 · 0 · 0 | 0 / 884 | 0 | 0 | bosse 0, remontee 0, epingle 0 | 0 | 29.8 | 130.1 / 187 | 385 / 620 |
| pistegraine=111 pay=1 | 844x390 | direct · crochet · vagues | pierres › toboggan › belvedere › ile › bosse › ange | 9292 / 9342 | 0 · 0 | 0 · 0 · 0 | 0 / 797 | 0 | 0 | toboggan 0, ile 0, bosse 0 | 0 | 29.7 | 140.1 / 167 | 470 / 664 |
| pistegraine=201 jsceneu=porte,arche,gorge jouv=calme jrelief=vagues photos=petits max=200 | 390x844 | calme · serpent · vagues | porte › arche › gorge › galerie › epingle › pont › ile | 8320 / 8394 | 0 · 0 | 0 · 0 · 0 | 0 / 863 | 0 | 0 | porte 0, arche 0, gorge 0, epingle 0, ile 0 | 0 | 59.2 | 62.9 / 170 | 161 / 494 |
| pistegraine=202 jsceneu=passerelles,bosse,toboggan jouv=virage jrelief=plateaux photos=petits max=200 | 390x844 | virage · crochet · plateaux | passerelles › bosse › toboggan › mouton › envers | 8789 / 8848 | 0 · 0 | 0 · 0 · 0 | 0 / 773 | 0 | 0 | passerelles 0, bosse 0, toboggan 0 | 0 | 44.8 | 87.4 / 170 | 254 / 593 |
| pistegraine=203 jsceneu=epingle,ile,remontee jouv=plonge jrelief=falaise photos=petits max=200 | 390x844 | plonge · libre · falaise | epingle › ile › remontee › mur › ange › arche › porte › bosse | 8225 / 8296 | 0 · 0 | 0 · 0 · 0 | 0 / 827 | 0 | 0 | epingle 0, ile 0, remontee 0, arche 0, porte 0, bosse 0 | 0 | 35.2 | 119.9 / 201 | 300 / 507 |
| pistegraine=204 jouv=balcon jrelief=gradins max=150 | 390x844 | balcon · serpent · gradins | cirque › gorge › bosse › couloir › porte › gouffre › arche | 8817 / 8878 | 0 · 0 | 0 · 0 · 0 | 0 / 784 | 0 | 0 | gorge 0, bosse 0, porte 0, arche 0 | 0 | 29.7 | 136.1 / 168 | 359 / 480 |
| pistegraine=205 jouv=bosse jrelief=mixte max=150 | 390x844 | bosse · derive · mixte | stade › envers › arche › remontee › belvedere › voute | 8466 / 8517 | 0 · 0 | 0 · 0 · 0 | 0 / 851 | 0 | 0 | arche 0, remontee 0 | 0 | 29.8 | 142 / 175 | 530 / 770 |
| pistegraine=206 jouv=esse jrelief=vagues max=150 | 390x844 | esse · libre · vagues | pont › epingle › envers › corniche › toboggan | 8766 / 8831 | 0 · 0 | 0 · 0 · 0 | 0 / 839 | 0 | 0 | epingle 0, toboggan 0 | 0 | 29.7 | 122.4 / 170 | 337 / 500 |
| pistegraine=207 jouv=direct jrelief=plateaux max=150 | 390x844 | direct · derive · plateaux | galerie › remontee › stade › pierres › gorge › epingle › gouffre | 8417 / 8479 | 0 · 0 | 0 · 0 · 0 | 0 / 786 | 0 | 0 | remontee 0, gorge 0, epingle 0 | 0 | 29.7 | 143.7 / 183 | 496 / 782 |


### Les sauts (le pilote saute toutes les 4 s : `saut=4`)
| route | raccourcis | vols | morts |
|---|---|---|---|
| g103 (cirque) | cirque | 18 | 0 |
| g104 (colimaçon) | colimacon | 19 | 0 |
| g205 (stade) | stade | 20 | 0 |
| g105 (puits) | puits | 20 | 0 |
| g111 (ange) | ange | 17 | 0 |
| **avant** g103 `sans=uniques&jade=avatar` | corniche, cirque | 20 | 1 (s 2912, vide) |
La caisse retombe sur la route après chaque saut du pilote sur les routes neuves. (« décolle au départ » = 1 sur certaines : c'est le saut volontaire de la 4e s.)
NON prouvé : que le saut d'un raccourci se pose aux trois vitesses (le banc sauts-node.cjs du 16/11 le fait en Node ; pas refait).

## 8. Le coût (mêmes graines, même série, à 29-30 i/s, tel=1, appareil=iPhone14,2, portrait)
Relevé à CHAQUE image de la course entière (`renderer.info`, remis à zéro par image ; les 10 premières images retirées).

| | g102 appels moy / p95 | g102 triangles moy / p95 (k) | g103 appels | g103 triangles (k) | décors de scène (`JADE.deco3`) g102 / g103 | appels de Jade au départ (`dbgJade`) | programmes départ → fin | géométries / textures en fin |
|---|---|---|---|---|---|---|---|---|
| **défaut (nouveau)** | 140,8 / 244 | 402 / 612 | 127,7 / 161 | 340 / 465 | 11 / 25 | 24 / 24 | 149 → 149, 148 → 148 | 592 / 94 · 573 / 88 |
| `?sans=uniques` | 132,9 / 171 | 384 / 532 | 135,4 / 173 | 439 / 681 | 16 / 14 | 25 / 29 | 149 → 149 | 576 / 90 · 568 / 92 |
| `?sans=uniques&jade=avatar` | 122,5 / 159 | 315 / 465 | 132,8 / 164 | 404 / 602 | 44 / 22 | 18 / 18 | 148 → 148, 149 → 149 | 576 / 90 · 625 / 94 |

- Moyenne des deux graines : appels 134,3 (nouveau) / 134,2 (avant) / 127,7 (avant + verbes) ; triangles 371 k / 412 k / 360 k. **Au bruit près, le nouveau tirage
  coûte comme l'ancien défaut et ~+5 % d'appels / +3 % de triangles par rapport à `jade=avatar`** — sur DEUX graines seulement : ce n'est pas une preuve, c'est un
  ordre de grandeur. Le p95 de 244 appels sur g102 (nouveau) est un passage chargé de la route (pierres + porte + plongée), pas mesuré à part.
- **Programmes liés en course : 0** dans les 26 courses (le compte de renderer.info.programs ne bouge pas entre le départ et la fin).
- Mémoire : 568-625 géométries, 88-108 textures : même plage avec et sans le nouveau tirage.
- ⚠ Les courses à ~59 i/s (g101-103 du 1er passage, g105/g111 avec sauts) montrent ~65-85 appels moyens contre ~130-145 à 30 i/s : le gouverneur / la cadence
  change le rendu (passes, ombres une image sur deux ?). On ne compare QU'À cadence égale (tableau ci-dessus : 29,2-29,8 i/s partout).
- **Génération** (en Node, `uniques-stat.cjs`, § 6) : le nouveau tirage est MOINS cher (5 essais au lieu de 10, 72-119 ms par route contre 100-335).
  Dans le jeu, `JADE.a3.ms` (l'essai gagnant) 4-27 ms ; construction de la vallée (`JADE.n.ms`) 72-153 ms (nouveau) contre 63-100 (avant), une course seule à 402
  (la 1re, machine à une charge de 25). NON mesuré : la plus longue tranche du pré-bâti au processeur bridé (`prebati-bride.cjs`, 13 min de banc par cas) — pas
  eu le temps de banc (verrou tenu par d'autres sessions des heures durant).

## 9. Ce qui n'est PAS prouvé / reste douteux
- **La plus longue tranche du pré-bâti au processeur bridé** (`prebati-bride.cjs`) et l'empreinte de la vallée BÂTIE en jeu sous `?sans=uniques` (`dbgJadeEmpreinte`,
  référence f93ad157 pour la graine 7) : pas lancés, faute de temps de banc (verrou tenu des heures par d'autres sessions ; 13 min par cas). L'identité de
  l'ancien tirage est prouvée en Node (route + décors de scène + verbes au bit près), pas sur la vallée bâtie.
- Le coût en course sur deux graines seulement (§ 8) ; et la cadence du banc varie d'une série à l'autre (30 ou 59 i/s) : ne comparer qu'à cadence égale.
- Les sauts des raccourcis aux trois vitesses (Node `sauts-node.cjs`) : pas refaits pour le nouveau plan ; en jeu, 5 routes à sauts volontaires, 0 mort.
- La caméra : jamais dans la roche (point de la caméra testé contre les cubes), mais pas de mesure de « la caméra passe à ras d'un pic ».
- Les courses ont été jouées sur un code qui bougeait (le pilote a retouché jade-alleluia.js / route-uniques.js à 17 h 44 et 18 h 30) : g101-g111 et g201-g207
  avant 18 h 30, les séries coût et sauts après. Les deux états passent sans défaut.
- Sac NON figé (sans `pistegraine`) : jamais joué en jeu (toutes les courses du banc ont `pistegraine`, donc `RU.fige`).

## 10. Fichiers que j'ai changés
- `code/maps/jade-avatar.js` : `JADE_RU.uTime` → `JADE_U.uTime` (×2, jadeAvTick).
- `code/maps/jade-uniques.js` : la clé du plan avec les lacets (repris par le pilote en `jadeUCle`) ; `JU_FORCE` (`?jsceneu=`, `?jouv=`, `?jcap=`, `?jrelief=`).
- `outils/banc-jade/opt-empreinte.cjs` : `uniques=1|2`.
- `outils/banc-routes/uniques/jade-jeu.cjs` (neuf) : le banc en jeu (Jade et `carte=espace`).
- `VERSION PRINCIPALE/index.html` : réassemblé (`--depuis-morceaux`).
- `passation/routes-uniques/` : ce fichier, ESPACE-EN-JEU.md, `jeu/` (JSON + photos de chaque course), `captures/jade/` (2-5-9 s de 18 débuts, 14 photos de
  petits modules + vues larges), `captures/espace/`.

## Commandes
```
node outils/banc-jade/opt-empreinte.cjs drapeau=1|0 mode=sync|tranches|memo uniques=0|1|2 [jf=-1] [graines=1-24] [paliers=0,10,20]
node outils/banc-jade/uniques-stat.cjs n=100 palier=0 [sans=1] [avatar=1]
# en jeu, sous le verrou (un seul Chrome) :
node outils/banc-routes/uniques/jade-jeu.cjs <racine abs> 8961 9361 <dossier> "pistegraine=101" "pistegraine=201&jsceneu=porte,arche,gorge&jouv=calme&jrelief=vagues&photos=petits" "pistegraine=103&saut=4" "pistegraine=102&sans=uniques&jade=avatar" "pistegraine=111&pay=1"
```
Options d'un cas : `pay=1` (paysage), `max=` (s), `photos=0|depart|petits`, `saut=4`, `carte=espace` ; le reste passe dans l'URL.
