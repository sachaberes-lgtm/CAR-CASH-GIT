# MAPS PRO — CANYON : les textures (2026-11-14) — passation de la CORRECTION

Branche `pro/canyon-2026-11-14` (partie d'origin/main v1589). Demande de Sacha : « canyon est très buggé dans les textures ».
Deux commits : `2451cd49` le diagnostic (bancs, mesures « avant »), puis la correction (ce document). **Rien n'est poussé, `cashcar-vNNN` n'est pas monté** : l'intégration s'en charge.
⚠ La demande relayée par le harnais portait sur Jade (« variété de forme d'îlot ») ; l'étape assignée était le canyon. Rien n'a été fait sur Jade.

Fichiers du jeu touchés : `code/maps/canyon-relief.js`, `canyon-voute.js`, `canyon-mine.js` (+ `index.html` assemblé). Aucun fichier partagé : les autres maps sont identiques par construction.
Interrupteurs : **`?sans=cytex`** (toute la correction des textures), **`?sans=cylod`** (le morph du relief d'avant), `?cyk=0.55` (la part de soleil de la roche, pour essayer).

## La cause première (pas vue au diagnostic)
`canyonTick` baisse `sun.intensity` de 72 % (et l'hémisphère de 28 %) quand la CAISSE est à l'ombre — pour la caisse. Mais la matière du relief relisait `sun.intensity` à l'image suivante :
sur toute la gorge (la caisse y est toujours à l'ombre le matin et le soir) le soleil des parois, le REBOND (`uBnc`) et la part de soleil du plancher valaient 0,29 × l'heure (sonde des
uniformes : `uSunC` 0,47 au lieu de 1,6 le matin). L'ombre « claire » du désert passait sous le point noir de l'étalonnage (contraste ×1,25 autour de 0,5 après ACES : tout canal sous ~0,09
sort à zéro) : roche rouge-noir, arbres noirs, lits noirs. Et toute la roche changeait d'éclat quand la caisse croisait une ombre.
→ le relief lit la lumière de l'HEURE (`BIO.cur.sunI`, `hemiI`) à une part FIXE du soleil, `CY_SOLK = 0,55` (à 1 : le soir sort rouge fluo, 9 % des pixels ; à 0,29 : noir).

## Ce qui est fait (tout derrière `?sans=cytex`, sauf 6)
1. **Roche** (`cyFS`) : la lumière de l'heure (ci-dessus) ; plancher d'albédo après la saturation (vert ≥ 0,5 × et bleu ≥ 0,42 × la luminance : les lits brique et lie-de-vin ne sont plus du rouge pur) ;
   plancher d'ombre refait : albédo à demi neutre, les lits sombres relevés (`pow(.42/L,.75)`), teinté par l'ambiance de l'heure et dosé par elle (`Wf` : 0,67 la nuit, 1 de jour), un peu de volume
   (normale de facette) ; garde-fou de chroma à l'ombre (aucun canal sous 0,34-0,5 × la luminance).
2. **Arbres, éboulis, Route 66** (`CY_AFS`) : même plancher ; pour le feuillage (vert dominant) le plancher part de la couleur NON mise au carré ; palette `sombre` de `CY_ARB` remontée (canyon-mine.js).
3. **Ripisylve** : verts remontés (0,12-0,35 au lieu de 0,05-0,24), seuil élargi (moins de cases franches).
4. **Filons d'or** : plus fins (0,010), 12 % à l'ombre au lieu de 30 %, × la chaleur du soleil (`(uSunC.r − uSunC.b) × 2`) : éteints la nuit, sous la pluie et l'orage.
5. **Tube de la phrase** (`cyVouteV3`) : les sommets portent l'albédo du relief (le carré) × l'occlusion ; `material.color` porte la lumière de l'heure, posée chaque image par `cyVouLum` (appelée
   dans `canyonTick`) ; le DEDANS a sa matière (même programme, +1 appel de dessin par tube) avec un fond et un peu des phares ; le jour des bouches est cuit selon la météo (`T2_JOUR`) ;
   damier réduit (±8 %, rangées 0,88).
6. **Écume de l'eau** : le moiré « empreintes digitales » venait de l'écume lue le long de la tangente de la normale (du bruit sur l'eau plate). Deux plans fixes + le plan horizontal, au mip de la case.
7. **`CY_LODF`** (`?sans=cylod`) : le correctif de la session `canyon-murs-2026-11-13` (worktree wt-cy, NON commité là-bas), repris **à l'identique** (`git diff` appliqué) pour que la fusion soit sans conflit.
   Son auteur reste propriétaire du réglage.

## Mesures avant → après (graine 7, 12 vues fixes ; pixels de roche ; moyenne sur les 10 vues qui ont de la roche)
Les chiffres « avant » du diagnostic étaient divisés par 12 : ils sont ici recalculés sur 10 (`cy-*.json` = avant, `apres-cy-*.json` = après).
| météo | noir < 10 avant (moy / pire) | après | luma avant → après | fluo avant → après | fourmillement |
|---|---|---|---|---|---|
| matin ordi | 0,7 % / 3,0 % | **0,2 % / 0,7 %** | 102 → 87 | 6,2 % → 0,6 % | 4,7 → 4,9 |
| soir ordi | 9,3 % / 20,5 % | **0,4 % / 0,8 %** | 52 → 75 | 0,1 % → 1,6 % | 4,8 → 5,2 |
| nuit ordi | 15,1 % / 25,1 % | **5,2 % / 16,0 %** | 37 → 39 | 0,1 → 0,1 | 4,1 → 3,5 |
| pluie ordi | 4,2 % / 22,6 % | **0,8 % / 5,9 %** | 88 → 85 | 0,3 → 0,1 | 5,2 → 4,5 |
| orage ordi | 17,9 % / 41,3 % | **8,5 % / 19,5 %** | 40 → 42 | 0,2 → 0,1 | 4,6 → 3,3 |
| soir tél | 8,4 % / 23,6 % | **0,2 % / 0,9 %** | 61 → 79 | 0,1 → 1,6 | 4,5 → 4,6 |
| nuit tél | 13,0 % / 27,2 % | **5,4 % / 14,4 %** | 46 → 47 | 0,1 → 0,1 | 7,6 → 7,4 |
- Cibles du plan : soir et pluie ≤ 2 % ✔, nuit ≤ 6 % ✔, **orage ≤ 6 % ✘ (8,5 %)** : le reste est la BRUME de l'orage (brouillard presque noir de 90 à 1500 m), une ambiance, pas une texture — non touché.
- « Luma du matin ±2 » : NON tenu et non tenable — la référence « avant » du matin était prise la caisse au SOLEIL (roche à pleine lumière) ; dans la gorge elle était à 0,29. La roche est
  maintenant à 0,55 partout : le matin baisse de 15 au départ et monte dans la gorge.
- Téléphone palier 0, soir (7 vues) : noir 11,2 % → 0,5 % ; fourmillement 8,9 → 4,1 ; triangles 215 600 → 222 400 (+3 %, c'est `CY_LODF` : R0 85 → 103 m) ; sans `cylod` : 215 000.
- Coût (image figée, soir ordi, 6 vues, avant/après alternés ×3) : 8,37 / 6,58 / 6,32 ms avant, 6,67 / 6,63 / 6,73 ms après : pas de différence mesurable (bruit de la machine). Triangles identiques à l'ordi.
- Trous du relief (sonde « dos », 40 vues, graine 5) : tél palier 0 0,0021 % → 0,0013 % de pixels de dos ; ordi 0,0026 % → 0,0021 %. Petit gain, pas de régression ; les fissures « ciel à travers » ne sont pas comptées par cette sonde.
- Route : `canyon-charte.cjs graines=1-12` p0 7,26 s / 2,93 s / 66 / 6,4 %, p10 7,32 / 2,79 / 70 / 7,1 %, p20 8,25 / 3,30 / 71 / 7,0 % — **identique** à avant.
- Erreurs : aucune (`ERREURS []` sur toutes les passes ; niveaux de détail 0 et 1 compilés au téléphone ; photos en roulant soir g3/g11, nuit g5/g11, orage tél g5 : « sans erreur »).
- Course complète (`banc-course/course.cjs --map canyon:soir` et `canyon:nuit`) : 0 exception, 0 requête en échec.
- `garde-allege.sh` ✔ ; `non-declares.cjs` : rien de neuf (le doublon `hudReveil` est antérieur).

## Ce qui reste / non vérifié
- **Phares sur la roche la nuit** (pans orange vif) : NON touché — décision de Sacha/Léo (la force du faisceau est celle du bitume, voulue). Piste : désaturer l'albédo sous le faisceau.
- **Orage** : 8,5 % de noir, dû à la brume (biome `canyonOrage`, fog 90-1500 m).
- **Traînées par sommet** sur les murs raides (`rk`, `lit`, `dk` en varyings) : NON traité.
- **Le soleil de la caisse** baisse toujours à l'ombre (voulu) ; seule la roche en est détachée. Les DUNES ont le même couplage (`dunes-2.js`, `uSunC` relit `sun.intensity`) : NON touché, à regarder.
- La mine (`canyon-mine.js`, MeshBasic cuit) et le tunnel d'arrivée (`CY_T2M`) restent sans lumière de l'heure (le tunnel a `T2_JOUR`) : NON regardés en image.
- Pré-bâti du vrai jeu (`prebati=0` au banc), mipmaps, paliers de route 10/20 en image, vrai téléphone : NON vérifiés. `?sans=cytex` n'a pas été comparé au pixel avec origin/main (même ordre de grandeur mesuré).
- Le rouge du soir reste très saturé (étalonnage) : affaire de DA, à juger par Sacha sur les planches.

## Les bancs (ports réservés : serveur 8310-8319, CDP 9510-9519, profil « pro-canyon »)
```
node outils/banc-maps/serveur.cjs 8310 <worktree>
# la référence (à lancer pour soir, matin, nuit, pluie, orage, puis --tel=1) ; --q=sans=cytex,cylod = l'avant sur le même code
node outils/banc-routes/canyon-textures.cjs --meteo=<m> --graine=7 --s=700,1260,2076,2580,3150,3500,4414,7454,8800,9300,9510,10200 --mesure=1 --cout=1 --cdp=9512 --profil=pro-canyon-b --out=<d>
# tube : graine 11
node outils/banc-routes/canyon-textures.cjs --meteo=nuit --graine=11 --s=10150,10250,10900,11550 --out=<d>
# vues de diagnostic, retraits, essais à chaud d'une retouche du shader (sans toucher au jeu), détail agrandi
node outils/banc-routes/canyon-textures.cjs --meteo=soir --graine=7 --s=3150 --variantes=rc,col,lit,wat,eau,sansfilons --patch=essais.json --mesurevar=<nom> --clip=900,250,380,150,2
# trous du relief (faces vues de dos)
node outils/banc-routes/canyon-textures.cjs --meteo=matin --graine=5 --s=700 --tel=1 --q=palier=0 --jsfile=outils/banc-routes/canyon-textures-sonde-dos.js
# photos en roulant, planche-contact, route, course
node outils/banc-maps/banc.cjs gen --carte=canyon --meteo=soir --graines=3,11 --port=8310 --cdp=9511 --profil=pro-canyon --roule=55 --photos=1 --photoms=3500 --out=<d> [--tel=1]
node outils/banc-routes/canyon-planche.cjs --out=planche.png --cols=4 --larg=2000 [--filtre=txt] <dossier>
node outils/banc-routes/canyon-charte.cjs graines=1-12 palier=0
node outils/banc-course/course.cjs --map canyon:soir --http 8311 --cdp 9514      (⚠ réécrit outils/banc-course/course-fin.png : git checkout après)
```
Pièges : un `--profil` par Chrome lancé en parallèle ; `--meteo=midi` n'existe pas au banc ; après une retouche de `code/`, `node code/assembler.cjs --depuis-morceaux` (l'assembleur nu a refusé une fois :
« index.html ET les morceaux ont changé ») ; la mesure dépend de la part de soleil, plus de la place de la caisse (c'était le cas avant : la référence « avant » du matin est prise caisse au soleil).
Preuves : `passation/maps-pro-canyon/` (`avant-*`, `apres-*` : planches soir, nuit, orage, tube nuit/orage ; bande s1260, arbres s2580, fond s3150, dedans du tube s10200).
