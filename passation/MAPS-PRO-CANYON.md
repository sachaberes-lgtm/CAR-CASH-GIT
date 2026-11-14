> ## ⚠ CONSIGNE DE SACHA SUR L'OPTIMISATION (2026-11-14, 16 h 50) — PRIORITAIRE pour l'optimiseur, les vérificateurs et la reprise
> Sacha : « il faut que ce soit aussi peu lourd que ce qu'on a actuellement, mais qu'on fasse le maximum possible en rendu sans que ça nuise à la fluidité. Prends le temps. »
> Règle de budget : la map, après corrections ET optimisation, ne doit JAMAIS coûter plus que la référence origin/main v1589 (worktree wt-avant),
> sur ordinateur comme sur téléphone (--tel=1) : triangles, draw calls, ms de tirage/pré-bâti, image figée, mémoire, gels en course — chacun ≤ la référence
> (au bruit de mesure près, mesures alternées avant/après). Tout dépassement est un défaut BLOQUANT à corriger.
> À l'intérieur de ce budget : pousser le rendu au maximum (chaque milliseconde ou triangle gagné par l'optimisation se réinvestit en beauté visible :
> lumière, brume, matière, détail proche, raccords), tant que la fluidité ne baisse pas. Tableau « référence / après » obligatoire dans cette fiche.

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
- **Reprise du 14/11 (2e ingénieur, consigne « mollo sur les tokens »)** : le travail était déjà COMMITÉ (0d4aeced), arbre propre, aucun NUL ni CRLF, assembleur d'accord, seuls des fichiers canyon-* et outils/passation changés depuis ff0c9078. Planches relues à l'œil : bandes noires et arbres noirs disparus au soir ; tube nuit/orage nettement assombri, MAIS le dedans de la bouche reste beige clair la nuit (graine 11, s 10150-10250, `apres-tube-nuit-orage-planche.png`) : à reprendre dans `cyVouLum` (lumière du dedans trop haute la nuit). Aucun banc relancé à la reprise.

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

## Reprise 2 du 14/11 : les défauts des deux vérificateurs (consigne « mollo sur les tokens »)
| Défaut | Verdict | Ce qui est fait | Interrupteur |
|---|---|---|---|
| Bouche et dedans du tube beige clair la nuit (majeur) | REPRODUIT (g11 s10150) | `cyVouLum` refait : la lumière suit l'ombre de la roche (ciel/sol ×0,9, soleil ×0,30, plancher ciel 0,22 + rebond 0,18, phares ×0,015, dedans +×0,03), sans fond fixe de 0,08. MESURÉ (lumière du tube dehors/dedans) : nuit 0,34/0,37/0,52 → **0,24/0,26/0,43** (dedans 0,47/0,50/0,66 → 0,30/0,33/0,50) ; orage 0,35/0,41/0,57 → 0,27/0,35/0,54 ; soir et matin ≈ inchangés (0,60/0,54/0,56 au matin). Photo : le tube se lit maintenant dans la roche violette de la nuit ; soir et matin regardés, orange intact. | `?sans=cytex` |
| Chemin non-V3 (`?sans=canyonv3`) assombri par `cyVouLum` (mineur) | VRAI par lecture du code | `cyVouLum` ne touche plus la matière si `!CY_V3.on` (elle reste blanche, comme avant). Non photographié. | — |
| Quadrillage de « carreaux » sur toute la roche (majeur) | REPRODUIT (nuit g3 s1800, en roulant) | Les gros pixels sont VOULUS (Sacha, 25/10 : « des gros pixels, mais lisses », f59c23ce) ; le défaut est le JOINT : le bord de chaque case était assombri de 16 % → un carrelage net. Bord ramené à 5 % (`CY_JOINT`), la nuance ±10 % de la case reste. Photo avant/après : le carrelage disparaît, les gros pixels restent. | `?sans=cyjoint` |
| Bande orange vif des phares au pied de paroi la nuit (mineur) | REPRODUIT | La force du faisceau reste celle du bitume (Léo, 10/11 : « oui, partout ») ; l'albédo qu'il révèle est désaturé de 45 % (`CY_PHARE`) : bande sable au lieu d'orange fluo. | `?sans=cyphare` |
| Lames en pointe au téléphone (pluie g19 s9700, mineur) | REPRODUIT, PRÉEXISTANT (aussi avec `?sans=cytex,cylod`), absent à l'ordi | NON corrigé : c'est de la GÉOMÉTRIE, pas une texture — les contreforts étroits échantillonnés par la grille plus grossière du palier téléphone donnent de longs triangles qui débordent au-dessus du bord de route. Pistes : élargir/adoucir les contreforts au palier tél (`cyButte`/murs), ou une grille plus fine près de la route au tél (coût en triangles à mesurer). Preuve : `maps-pro-canyon/constat-tel-lames-pluie-g19.png`. | — |
| (vu en passant) silhouette d'arbre translucide à gauche du tube (g11 s10150, soir/matin ; opaque beige la nuit) | NON reproduit au 3e passage : transitoire (une particule ou un objet de passage ?) | Non traité, à surveiller. | — |

Preuves : `maps-pro-canyon/avant-reprise2-*`, `apres-reprise2-*` (tube nuit g11 ; joints + phares nuit g3 en roulant).
Contrôles : `ERREURS []` sur toutes les passes (nuit/soir/matin/orage g11, nuit g3 roulée, pluie g19 ordi et tél) ; assembleur d'accord ; `garde-allege.sh` ✔ ; ni CR ni NUL.
Fichiers partagés : aucun (seuls `canyon-relief.js`, `canyon-voute.js`, le banc `canyon-textures.cjs` — variantes `sanscases`/`sansphares` adaptées — et cette passation). Route non touchée : charte et juge non relancés.
NON vérifiés dans cette reprise : mesures chiffrées de noir sur la graine 7 (non rejouées), paliers 10/20 en image, vrai téléphone, pré-bâti réel, course complète, mipmaps.
Sonde des lumières du tube : `--jsfile=<scratchpad>/sonde-tube.js` (lit `material.color` des matières du tube et les uniformes uSunC/uSky/uGnd/uPhC/uBnc de la roche).

## Passe d'optimisation du 14/11 (consigne « mollo sur les tokens ») : mesures, aucun changement du jeu
- **Pré-bâti** (`node outils/banc-vitesse/prebati.cjs --n 3 --carte canyon --http 8314 --cdp 9514`, chemin `?tel=1`) : deux passes sur le MÊME code donnent 1043 et 687 ms/map sous `prebTravaille` (PREB_CPU 374/388/1180 puis 585/389/400). Le bruit de la machine partagée vaut donc ±50 %, et aucune comparaison avant/après en ms n'est fiable ici. `newTrack` au passage : 121 et 118 ms. ⚠ Ce banc sert TOUJOURS le jeu de son propre worktree (`__dirname`). Le lancer depuis wt-avant avec le script de wt-canyon ne mesure pas l'« avant » : il faut `--jeu <wt-avant>/VERSION PRINCIPALE`.
- **Postes du pré-bâti, temps propre par map** : prebJob 143, pisteRoute 94, **cyTenue 51** (le seul poste propre au canyon dans le haut du classement), getPoint 35, normales9 33, pisteMaigre 30, arPeint 28, fabL 27, genCanyon 21, cyBatitG 12, bornes9 9. Au passage : hsh 5,7, cyNz 1,7, cyVouteV3 1,4.
- **Essai sur cyTenue, défait** : la ligne n'était rééchantillonnée qu'une fois pour les deux cônes (30° et 8°). La route reste identique au bit près (sortie `--detail` de canyon-charte graines 1-12, paliers 0/10/20, `cmp` identique). Mais le chrono en Node ne montre aucun gain hors du bruit (21,0/23,5/23,0 contre 20,3/16,5/24,6 ms par essai), car le coût est dans la recherche du cône, pas dans le rééchantillonnage. J'ai donc retiré cet essai, plutôt que de laisser du code sans gain prouvé.
- **Piste pour la suite** : réduire la recherche du cône dans cyTenue (aujourd'hui en O(m × course) malgré CY_ELAG). On peut par exemple arrêter dès que `m - i` ne peut plus battre `best`, ou utiliser une fenêtre glissante. Le résultat doit être prouvé identique avec la charte `--detail` en `cmp`. Gain attendu : au plus environ 50 ms par map de pré-bâti.
- **Route** (canyon-charte graines 1-12) : identique à la référence (p0 7,26/2,93/66 ; p10 7,32/2,79/70 ; p20 8,25/3,30/71 ; climax 12/12).
- **Non fait dans cette passe** : triangles et draw calls avec et sans --tel=1 (la référence du diagnostic reste valable, les reprises n'ont changé que des constantes de shader), image figée, sonde des gels, mémoire au changement de map, course complète, embellissements.

## Reprise 3 du 14/11 : les défauts des vérificateurs (consigne « mollo sur les tokens »)
| Défaut | Verdict | Ce qui est fait |
|---|---|---|
| Lames en pointe au travers de la route au téléphone (majeur) | REPRODUIT (pluie g19 s9560/9640/9700, `--tel=1`). CAUSE PROUVÉE : la grille du relief au téléphone (16, cases de 4 m). Photos zoomées : grille 16 → lames, 20 → une petite lame, 24 et 32 → propres (`reprise3-lames-grille-16-20-24-32.png`). Deux correctifs sans triangle en plus ont été ESSAYÉS ET RÉFUTÉS en photo : (a) brider les terrasses sous le plafond du couloir, (b) abaisser un sommet au plafond du couloir de ses voisins. Les lames restent dans les deux cas, donc ce n'est ni la terrasse ni le bord du couloir à ±1 case. | NON corrigé par défaut, à cause du BUDGET de Sacha (en tête de fichier) : la grille 24 coûte **+14 à +27 % de triangles au téléphone** (nuit g3, 11 vues : 232→298 k, 244→325 k, 317→367 k…). Ajout de l'interrupteur `?cygrille=N` (sans effet par défaut, l'ordi reste à 32) : `?cygrille=24` montre la route propre. DÉCISION À PRENDRE PAR SACHA : payer +20 % de triangles relief au téléphone, ou garder les lames. Non mesuré : le coût en ms sur un vrai iPhone (le passage de 32 à 16 avait été décidé pour l'iPhone 15). |
| Coin violet à g7 soir s2580 (mineur) | QUALIFIÉ : il est dans le RELIEF (présent avec le décor caché, absent avec le relief caché), il ne dépend ni de la grille (`?cygrille=64`) ni du morph (`?sans=cylod`). En approchant (s2640/2700), c'est une fente entre deux falaises (corniche) par où l'on voit le ciel : c'est de la géométrie, pas une texture. | Laissé tel quel. Preuves : `reprise3-soir-g7-coin-violet-*.png`. |
| Arête en dents de scie à g7 s3150 (mineur) | Elle est dans le relief (variante `terrain`). Lecture : la silhouette des terrasses d'une falaise lointaine au niveau grossier. | NON vérifié plus loin (pas d'essai à grille fine sur cette vue). |
| Tube s10200 en gros blocs facettés (mineur) | VOULU : les gros pixels lisses de Sacha (25/10, f59c23ce), voir reprise 2. | — |
| Colonne sombre à g11 soir s2627 (mineur) | NON reproduite : ni la vue fixe ni la photo en roulant de canyon-textures à s2627 ne la montrent ; la variante `lit` est uniforme (ce n'est pas une ombre). | — |
| (vu) taches roses translucides en forme d'arbre (g7 s2580, g11 s2627) | Présentes sur la PREMIÈRE photo après le saut du banc seulement, pas sur les variantes prises juste après, ni en roulant : ce sont des arbres en fondu d'apparition après la téléportation (lecture). | Non traité ; non prouvé hors du banc. |
| Optimisation non livrée, coûts non mesurés (majeur) | Mesuré de façon DÉTERMINISTE (compteur du renderer, g7 soir, s1260/3500/7454/10200). Ordi : réglages actuels contre `?sans=cytex,cylod` = triangles −492 (≈0 %), appels **+1** sur 3 des 4 vues (la matière du dedans du tube). Téléphone : `?sans=cytex,cylod` avec la grille 16 donne 239/530/216/174 k triangles et 45/139/44/45 appels. | Aucune optimisation livrée. Le +1 appel de dessin au PC et le R0 de `cylod` (+3 % de triangles au téléphone d'après le diagnostic) DÉPASSENT le budget de Sacha de peu : à arbitrer (`?sans=cytex` et `?sans=cylod` les retirent). |

Bancs : `node outils/banc-routes/canyon-textures.cjs --meteo=pluie --graine=19 --tel=1 --s=9560,9640,9700 --clip=0,40,220,280,2 --q=cygrille=24 --cout=1 --port=8310 --cdp=9510 --profil=pro-canyon` ; planche : `node outils/banc-routes/canyon-planche.cjs --out=p.png --cols=3 <photos>`.
Contrôles : `ERREURS []` et `cyErr null` partout ; assembleur d'accord ; `garde-allege.sh` ✔ ; aucun CR ; jeu par défaut identique à 23d6bf72 (seul `?cygrille=` ajouté ; téléphone 351 k triangles à s9700, comme avant). Route non touchée.
Piège : un script de retouche qui fait `s.replace()` sans contrôle peut échouer sans rien dire (un essai est resté dans le code un moment). Contrôler que l'ancre existe une seule fois (`split(a).length===2`).
