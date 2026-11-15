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

## Passe 2 d'optimisation et de finition (14/11 soir → 15/11 matin) : LIRE D'ABORD CETTE SECTION
> ⚠ (15/11, reprise 4, en fin de fichier) la grille 18 du téléphone et la portée R0 126 de l'ordi décrites ici sont RETIRÉES (elles dépassaient la référence à des vues d'autres graines) ; le tube a changé de teinte. Les chiffres de cette section sont ceux d'avant la reprise 4.
Branche `pro/canyon-2026-11-14`, fusionnée avec origin/main v1596 (`22cb1856`, sans conflit), puis `53342044`, `50f07ffd`, `75ad9a62` (14/11 soir), puis la reprise du 15/11 après la coupure réseau (`a092ca58` et le commit de cette section).
**Rien n'est poussé, `cashcar-vNNN` n'est pas monté.** Référence de toutes les mesures : `wt-avant` = origin/main v1596 (le jeu actuel), servie à côté, avec les mêmes bancs.
Fichiers du jeu touchés : `canyon-relief.js`, `canyon-route.js`, `canyon-v3.js`, `canyon-voute.js` (et `canyon-mine.js` pour la première passe), plus index.html assemblé. Ce sont uniquement des fichiers du canyon : **aucun fichier partagé** (rien dans gameplay/, moteur/, rendu/), donc les autres maps sont identiques par construction.
Fichiers de la session « qualité par appareil » (soleil-planete, palier-appareil, cadence, gouverneur-*, sauvegarde…) : **aucun touché** par cette branche.
Reprise du 15/11 : l'ingénieur de la veille avait été coupé avec un seul changement non commité, un commentaire de canyon-relief.js. Il était sain : l'assembleur était d'accord et il n'y avait ni CR ni NUL. Il a été commité tel quel (`a092ca58`). Son brouillon de passation (resté dans le scratchpad) est repris ci-dessous et complété.

### Ce qui est fait (chaque point a son interrupteur)
| Quoi | Effet | Interrupteur |
|---|---|---|
| **Nœuds hors du cadre** (`cyBornesCalc` dans le travailleur, `cyBorne` dans `cySelect`) | Chaque nœud du relief était testé contre le cadre avec une boîte allant du fond le plus bas au plateau le plus haut de toute la carte. Résultat : de la moitié aux deux tiers des nœuds envoyés à la puce étaient invisibles. La correction est une pyramide de bornes, bâtie dans le TRAVAILLEUR, dont les marges couvrent tout ce que `cyHt` ajoute. **L'image est identique.** `dbgCyBornes(17)` donne 0 échantillon hors des bornes (4 graines × 44 vues la veille ; refait le 15/11 sur g19 pluie, ordi et téléphone, 5 vues). Le 15/11, les bornes passent en **Int16** (mètres entiers arrondis vers le dehors) : la pyramide pèse 262 Ko au lieu de 524 Ko et est libérée au changement de map (`CY.bo=null`). | `?sans=cybornes` |
| **Lames du téléphone, 0 triangle** (`cyVSLame`, `cyLameChamp`, `cyLamePose`) | Aux seuls niveaux grossiers (case effective > 7,5 m, morph compris), la hauteur est lue jusqu'à 8 m plus loin de la paroi, dans une bande de 12 à 20 m autour de la route dressée. Le champ est une RG8 signée en atlas : **63 Ko de texture au téléphone**, libérée au changement de map. Il ne s'applique que si la grille est < 24 : l'ordi (grille 32) n'a pas une ligne de plus dans son programme. Mesuré avec `dbgCyLames` (la puce émulée sur la dalle) : 0 lame sur g3, g7 et g19 (44 vues chacune la veille). Refait le 15/11 sur g19 pluie s9560/9640/9700 plus s3500 et s7454, ordi et téléphone : `lames 0, vrai 0`. | `?sans=cylame` |
| **Tube en un appel** (canyon-voute.js) | Un seul maillage. Un attribut `aIn` marque le dedans, et la lumière du dedans vaut celle du dehors + aIn × le filet de phares (`uPhI`). Le 15/11, `aIn` passe en **Uint8 normalisé** (1 octet par sommet au lieu de 4). Les couleurs du tube passent en **Uint16 normalisé** (`cyVouCoul`, seulement si toutes sont dans [0,1] ; sinon Float32 comme avant). Mesuré : couleurs du tube V3 entre 0,06 et 0,98 ; le tube de g11 pèse 1 258 560 octets au lieu de 1 656 000. Photos nuit g11 s10150/10250 : même image. | (avec `?sans=cytex`) |
| **cyTenue sondé** (canyon-v3.js) | Tests du cône : −89 %. Route identique au bit près (voir plus bas). | — |
| **Réinvestissement téléphone : grille 16 → 18** au palier 2 (ALLEGE). Les paliers 0 et 1 restent à 16. | Elle est payée par les nœuds hors du cadre. | `?cygrille=16` |
| **Réinvestissement ordi (15/11) : portée fine R0 118 → 126** (`CY_R0PC`, canyon-route.js, `!ALLEGE` seulement) | Chaque niveau de détail du relief porte 7 % plus loin, donc les falaises lointaines sont plus fines. On ne peut pas aller plus loin : la vue la plus chargée (g7 s7454, grand panorama où les bornes ne retirent presque rien) égale la référence à 132 et la dépasse à 140. **À l'œil, la différence est faible** (planche `pc2/r0-planche.png`, g7 s3150 et s7454 : silhouettes à peine plus fines). | `?cyr0=118` = l'avant ; `?cyr0=N` |
| Crochets de banc | `dbgCyLames(o)` (`{coupe:s}`, `{chrono:n}`, `{sansChamp:1}`), `dbgCyBornes(k)` (`'chrono'`). | — |

### Tableau référence (v1596) / après : compteurs déterministes du canyon (relief + décor + poussière, comptés objet par objet par `sonde-cout.js`), somme sur 12 vues fixes
| | sommets du relief | triangles canyon | appels canyon | ms image figée (médianes, tours alternés) |
|---|---|---|---|---|
| ordi g7 soir | 1 344 915 → **870 111 (−35 %)** | 3 216 250 → **2 323 322 (−28 %)** | 164 → 164 | 108,9 → 108,4 (2 tours, 15/11) ; 111,7 → 98,0 (3 tours, la veille, R0 118) |
| ordi g3 soir | 1 329 669 → **885 357** | 3 148 410 → **2 312 826** | 157 → 157 | — |
| ordi g11 nuit (tube compris) | 1 323 135 → **872 289** | 3 258 948 → **2 411 076** | 185 → 185 | — |
| téléphone palier 2 g7 (grille 18) | 305 184 → **220 932 (−28 %)** | 1 074 100 → **930 004 (−13 %)** | 125 → 125 | 82,1 → 81,4 (3 tours, la veille) |
| téléphone palier 0 g7 (grille 16) | 237 269 → **159 817 (−33 %)** | 911 988 → **774 772 (−15 %)** | 128 → 128 | 86,1 → 74,0 (4 tours alternés, 15/11) ; la veille 77,2 → 84,5 (3 tours) : pas de tendance défavorable prouvée |
| téléphone palier 1 g7 (grille 16, la veille) | 269 059 → 159 817 | 986 748 → 793 212 | 128 → 128 | 1 tour : non conclusif |
- **Vue par vue** (g7, g3, g11 à l'ordi ; g7 aux paliers 0 et 2 du téléphone), sommets et triangles du canyon sont ≤ la référence partout, avec **une exception connue** : téléphone palier 2, g7 s10200, 67 360 triangles contre 67 312 (+48, +0,07 %), alors que les sommets y sont plus bas (13 718 contre 13 872). La grille 18 y fait un peu plus de triangles par sommet. `?cygrille=16` l'efface.
- Le compteur GLOBAL du renderer (appels, géométries, programmes) bouge d'un passage à l'autre avec les effets du jeu (pièces, étincelles). Exemple : la référence elle-même donne 1 096, 1 108 ou 1 140 appels au téléphone selon le passage. Seul le compte objet par objet du canyon est déterministe.
- Les ms sont BRUITÉES (5 agents sur la machine ; deux passages du même code varient de ±30 %).

### Pré-bâti, mémoire, course
- **Pré-bâti** (`prebati.cjs --n 3 --carte canyon --jeu <worktree>`, chemin `?tel=1`, 3 tours alternés après/référence, 15/11) : sous `prebTravaille`, la référence fait 869 / 2 094 / 895 ms par map et la branche **616 / 567 / 619 ms**. `cyTenue` passe de 44 / 57 / 60 à **37 / 34 / 36 ms** et `pisteRoute` de 157-220 à 111-171 ms. Nouveaux postes sur le fil principal, au téléphone seulement : `cyLamePose` 6 à 15 ms, dont `cyLameChamp` 8-9 ms, en un seul bloc à la pose (sous la règle des 250 ms). Bornes : 13 à 30 ms dans le TRAVAILLEUR (`dbgCyBornes('chrono')`, machine chargée), rien sur le fil principal.
- **Mémoire propre au canyon** (`pc2/sonde-mem2.js`, g19 pluie s9640, puis changement de map vers les dunes et attente de 25 s) :
  - Textures de données : identiques à la référence (uTC 4,08 Mo, uTM 2,04 Mo, uTZ 1,84 Mo, uTS 0,41 Mo), plus `uTL` 63 Ko au téléphone (le champ des lames ; 16 octets à l'ordi).
  - Géométries du décor : 3 992 616 → **3 660 936 octets (−332 Ko**, grâce au tube en Uint16 et Uint8).
  - Côté processeur, la pyramide des bornes : +262 Ko.
  - Au changement de map, tout est rendu (uTC/uTZ/uTS/uTL reviennent à la texture vide de 16 octets, le décor à 0 objet, `CY.bo` à null), comme dans la référence.
  - Au total, le canyon reste sous la référence côté puce. Côté processeur il prend +262 Ko pendant la course, au-dessus du budget à la lettre : signalé.
- **Course complète** (`course.cjs`, téléphone émulé) : canyon:soir, canyon:nuit (deux fois) et canyon:pluie donnent **0 exception et 0 requête en échec**. Le message « WebGL: too many errors » à la nuit est **aussi dans la référence** (course nuit avec `--jeu wt-avant`) : il est antérieur et ne vient pas du canyon de cette branche (non investigué).
- **Route** : `canyon-charte.cjs graines=1-12 paliers=0,10,20 --detail` donne une sortie **identique octet pour octet** à wt-avant (`cmp`, 15/11). Le juge commun n'a pas été relancé, puisque la route est identique au bit près.
- `garde-allege.sh` ✔ ; assembleur d'accord ; ni CR ni NUL.

### Restes et non vérifié
- **Gels en course** (sonde des gels, chasse.cjs) : NON mesurés. Seuls le pré-bâti (en baisse) et les blocs ajoutés au fil principal (≤ 15 ms) sont chiffrés.
- Coût en ms sur un **vrai téléphone** : non mesuré. Les grilles et les portées sont payées en sommets et triangles (compteurs), pas en millisecondes d'iPhone.
- **Colonne sombre g11 soir s2627** : non reproduite (trois tentatives sur deux jours, en vue fixe et en roulant). **Coin violet g7 s2580** : c'est une fente entre deux falaises (géométrie), présente aussi dans la référence ; non traitée. **Arbres verts translucides** sur la première photo après un saut du banc (g11 s10150) : c'est le fondu d'apparition après la téléportation. Ils sont absents à la photo suivante et absents en course ; non traités.
- **Beauté réinvestie** : modeste. Elle se limite à la grille 18 du téléphone récent et à R0 126 à l'ordi, toutes deux bornées par la vue la plus chargée (le panorama g7 s7454). La marge moyenne est grande (−35 % de sommets à l'ordi), mais la pire vue ne la laisse pas dépenser en finesse uniforme. Piste : une portée qui dépend de la part du cadre visible (plus de finesse quand les bornes retirent beaucoup). Le shader de fragment de la roche n'a pas été alourdi : c'est le poste connu de l'iPhone chaud, et les gains sont côté sommets.

### Bancs de cette passe (scripts dans `<scratchpad>/` et `<scratchpad>/pc2/`)
- A/B des compteurs et des ms : `cout-ab.cjs <scratch> <tag> --meteo=soir --graine=7 [--tel=1] [--q=palier=0] --s=…` (serveurs : wt-avant sur :8316, wt-canyon sur :8310, `outils/banc-maps/serveur.cjs`), puis `cout-table.cjs <scratch> <tag>`.
- Une variante contre la référence, vue par vue : `pc2/cmp2.cjs <ref> <dossiers…>`, ou `pc2/cmp3.cjs <scratch> <tag-ref> <dossier>`.
- Mémoire : `--jsfile=pc2/sonde-mem2.js`. Bornes et lames : `--jsfile=pc2/sonde-val.js`. Couleurs du décor : `--jsfile=pc2/sonde-coul.js`.
- Pré-bâti : `node outils/banc-vitesse/prebati.cjs --n 3 --carte canyon --http 831x --cdp 951x --jeu <worktree>/VERSION PRINCIPALE`. ⚠ Changer de port à chaque passage (un port CDP fermé reste occupé quelques secondes).

## Reprise 4 du 15/11 : le vérificateur adverse de la passe 2 (LIRE AUSSI : la grille 18 et la portée 126 sont RETIRÉES)
Verdict reçu : budget téléphone dépassé (bloquant), tube rouge saturé avec une fissure noire (majeur), colonne sombre g11 s2627 non expliquée (mineur). Rien n'est poussé, `cashcar-vNNN` n'est pas monté.
Serveurs du banc : wt-avant (v1596) sur :8312, wt-canyon sur :8313 ; compteurs objet par objet (`sonde-cout.js`), un passage par côté (déterministes). Scripts : `<scratchpad de la reprise>/ab.cjs <tag> <cdp> [args de canyon-textures]`.

| Défaut | Verdict | Ce qui est fait | Interrupteur |
|---|---|---|---|
| Grille 18 du téléphone récent au-dessus de la référence (bloquant) | CONFIRMÉ par le vérificateur (g14 pluie s11000, g20 soir s10500 et s12000) | RETIRÉE : le palier 2 revient à la grille 16 de v1596. | `?cygrille=18` = l'essai retiré |
| (trouvé en remesurant) Portée R0 126 de l'ordi au-dessus de la référence | REPRODUIT : g14 pluie s2000, sommets 79 497 contre 78 408, triangles du canyon 231 548 contre 229 500 ; à 118 : 63 162 / 200 828 | RETIRÉE : l'ordi revient à R0 118 (v1596). | `?cyr0=126` = l'essai retiré |
| Tube rouge saturé, fissure noire (g1 soir s6000, g4 pluie s6000) (majeur) | REPRODUIT (photos ref/branche). CAUSE : depuis la première passe le tube prenait le CARRÉ des strates (l'albédo du relief) sans ses planchers ; un lit sombre au carré × la lumière du tube (0,4-0,6) × la bouche (~0,5) passait sous le point noir de l'étalonnage (tout canal < ~0,09 sort à zéro) : la zigzag noire ; les lits clairs au carré sortaient rouge pur (violet vif à la pluie). ESSAYÉ en photo : carré + planchers de la roche (vert ≥ 0,5 L, bleu ≥ 0,42 L, lits sombres relevés) → la zigzag RESTE noire ; exposant 1 → plus de noir mais rouge vif ; retenu : exposant 1,15, saturation 0,62, planchers de la roche, plancher de luminance 0,15. | `teinte()` de `cyVouteV3` (canyon-voute.js). Photos ref/branche (soir, matin, pluie, orage, nuit ; ordi et téléphone) : plus aucune bande noire ; soir brun-rouge et pluie violette (les couleurs de la roche autour, plus sourdes qu'avant), nuit violet sombre lisible (le défaut « bouche beige la nuit » de la reprise 2 ne revient pas). Coût : 0 (couleurs cuites au tirage). | `?sans=cyvoualb` = le tube de la passe 2 ; `?sans=cytex` = celui de v1596 |
| Colonne sombre g11 soir s2627 (mineur) | REPRODUITE et EXPLIQUÉE. Elle est AUSSI dans v1596 (plus noire encore). Ce n'est pas une ombre (`lit` = 0 sur toute la paroi) ni le décor (variante `terrain` : présente ; `decor` : absente) : c'est un LIT DE STRATE SOMBRE. La caméra est roulée de −83° (la route longe la paroi, gabarit `corniche`), donc une couche horizontale de quelques mètres se lit comme une colonne verticale. Preuve : en figeant le mip des strates à 3 (`--patch`, variante `lodfixe`), la colonne disparaît ; dist et gCs n'y montrent aucune coupure. | Non corrigée : c'est la roche voulue (une couche lie-de-vin) ; la passe textures l'a déjà relevée (brun sombre au lieu de noir). L'éclaircir encore = affaire de DA (relever les lits sombres de cyFS, coût 0). Preuves : `maps-pro-canyon/reprise4-colonne-*`. | — |
| Coin violet g7 s2580 (mineur) | Déjà qualifié (reprise 3) : une fente entre deux falaises par où l'on voit le ciel, présente dans v1596. | Laissé tel quel. | — |
| Mémoire processeur des bornes (+262 Ko, signalé au rapport précédent) | VRAI à la lettre (le canyon ne libérait AUCUNE copie JavaScript de ses géométries, ni avant ni après). | La copie JavaScript du tube est jetée une fois envoyée à la puce (`memLibere`, la fonction commune de palier-appareil.js, APPELÉE seulement, non modifiée). Vérifié dans la page (g11 nuit) : positions, couleurs et aIn « libéré » (−1 258 560 octets) ; avec `?memoire=ancien` : gardés. La référence garde 1 589 760 octets pour son tube. Bilan processeur du canyon : −1,33 Mo contre v1596 (bornes comprises), sur les graines vues (1, 4, 7, 11, 14, 20 ont toutes un tube ; une graine sans tube n'a PAS été trouvée ni mesurée). | `?memoire=ancien` |

### Tableau référence (v1596) / après (la branche à la fin de cette reprise) : somme des vues, compteurs du canyon objet par objet
| | vues | sommets du relief | triangles du canyon | appels | vues au-dessus de la référence |
|---|---|---|---|---|---|
| ordi g7 soir | 15 | 1 620 432 → 1 033 461 | 3 794 284 → 2 690 412 | 188 → 188 | 0 |
| ordi g14 pluie | 15 | 1 635 678 → 1 057 419 | 3 940 148 → 2 852 660 | 228 → 228 | 0 |
| ordi g2 nuit | 15 | 1 662 903 → 1 078 110 | 3 938 658 → 2 838 882 | 179 → 179 | 0 |
| ordi g11 nuit (tube) | 15 | 1 580 139 → 1 080 288 | 3 858 496 → 2 918 464 | 207 → 207 | 0 |
| tél palier 2 g7 soir | 15 | 356 337 → 209 814 | 1 219 794 → 960 210 | 145 → 145 | 0 |
| tél palier 2 g12 orage | 15 | 393 618 → 241 315 | 1 154 084 → 884 260 | 104 → 104 | 0 |
| tél palier 2 g14 pluie | 12 | 289 867 → 175 423 | 957 966 → 755 214 | 104 → 104 | 0 (s11000 : 71 728 → 68 656) |
| tél palier 2 g20 soir | 12 | 272 816 → 180 336 | 982 338 → 818 498 | 127 → 127 | 0 (s10500 : 79 022 → 74 926 ; s12000 : 75 290 → 73 242) |
| tél palier 2 g5 matin | 12 | 292 468 → 176 001 | 1 084 632 → 878 296 | 141 → 141 | 0 |
| tél palier 1 g19 pluie | 15 | 343 332 → 212 415 | 1 227 990 → 996 054 | 107 → 107 | 0 |
| tél palier 1 g20 soir | 12 | 246 228 → 176 579 | 926 074 → 802 682 | 128 → 128 | 0 |
| tél palier 0 g3 soir | 15 | 304 606 → 207 791 | 1 179 752 → 1 008 232 | 134 → 134 | 0 |
| tél palier 0 g9 orage | 12 | 250 852 → 165 308 | 991 372 → 839 820 | 105 → 105 | 0 |
| tél palier 0 g14 pluie | 12 | 230 333 → 165 308 | 810 414 → 695 214 | 102 → 102 | 0 |
Vues : 700, 1300, 2000, 2600, 3500, 4400, 5000, 6000, 7454, 8800, 10000, 10500, 11000, 12000, 13500 (12 vues : sans 1300, 2600, 4400). 195 vues, AUCUNE au-dessus de la référence, sur aucun des trois compteurs.
Avec la grille 16 et R0 118, les nœuds du relief sont ceux de v1596 moins ceux que les bornes retirent ; la portée de `CY_LODF` (première passe) reste au téléphone, mais elle est payée vue par vue ci-dessus.

### Ce qui change dans le jeu (cette reprise)
- `canyon-route.js` : grille du palier 2 du téléphone 18 → 16 ; `CY_R0PC` 126 → 118 (commentaires mis à jour).
- `canyon-voute.js` : `CY_VOUALB` (la teinte du tube), `memLibere` sur la géométrie du tube.
- Aucun fichier partagé modifié ; aucun fichier de la session « qualité par appareil » modifié (`memLibere` de palier-appareil.js est seulement appelée, comme par les autres pistes).

### Contrôles de cette reprise
- Courses complètes (`course.cjs`, canyon soir, nuit, pluie) : 0 exception, 0 requête en échec (« WebGL: too many errors » : déjà dans la référence, voir passe 2).
- Route : `canyon-charte.cjs graines=1-12 paliers=0,10,20 --detail` identique octet pour octet à wt-avant (`cmp`).
- `garde-allege.sh` ✔ ; `assembler --verifier` ✔ ; ni CR ni NUL ; `ERREURS []` sur tous les passages du banc.
- Pré-bâti (prebati.cjs --n 2, chemin ?tel=1, 4 passages alternés branche/réf/branche/réf) : sous prebTravaille 543 / 1 054 ms (branche) contre 931 / 571 ms (référence) : le bruit de la machine partagée (±50 %) noie tout ; PREB_CPU 373-409 contre 371-426 ms ; cyTenue 28-29 ms contre 51-54 ms (le seul poste propre au canyon, nettement plus bas). Les retouches de cette reprise ne touchent pas le pré-bâti du fil principal (teinte du tube : cyVouteV3 2,3 ms et cyVouCoul 3,4 ms au passage).

### Non vérifié
- Gels en course (sonde des gels) : non mesurés. Vrai téléphone (ms d'iPhone) : non mesuré.
- Une graine SANS tube (le bilan mémoire processeur y serait +262 Ko) : non trouvée parmi les 6 vues.
- Le rouge du soir du tube (et de la roche autour) reste saturé : DA, à juger par Sacha (`reprise4-tube-ref-branche.png`).
- Le réinvestissement en beauté se limite désormais au tube corrigé et aux corrections des passes précédentes : la finesse payée par les bornes (grille 18, R0 126) dépassait la référence aux pires vues. Piste (décision de Sacha) : une portée qui suit la part du cadre visible, garantie ≤ la référence image par image (compter les nœuds « comme v1596 » et ne raffiner que s'il reste de la marge), au prix d'un peu de calcul par image et d'un risque de changement de détail visible en roulant.

## Tour 1/4 du critique (15/11 après-midi) : programmes attribués, case fine d'abord
Verdict reçu (confiance 55) : programmes de shader en plus non attribués (majeur), mosaïque de gros carrés sur les parois proches (majeur), soir saturé (mineur, DA), aiguille noire (mineur), course canyon et juge non refaits par le critique (mineur). Rien n'est poussé, `cashcar-vNNN` n'est pas monté.
Reprise : l'ingénieur précédent avait laissé `canyon-voute.js` non commité (le programme du tube retiré). Relu, assembleur d'accord, ni CR ni NUL ; l'affirmation est vraie à la lecture (un `Uint8Array` normalisé qui contient 1 vaut 1/255 dans le shader) ; photo g11 nuit s10150 avec et sans : tube identique à l'œil (les seuls écarts sont des arbres en fondu et des particules). Gardé et commité avec ce tour.
Bancs : wt-avant (v1596) sur :8312, wt-canyon sur :8313 ; scripts dans le scratchpad de la session (`cy1/`) : `sonde-prog2.js` (chaque programme et les objets qui l'utilisent), `sonde-appels.js` (appels par groupe de la scène), `lot.sh` (référence/après alternés, `sonde-cout.js`), `crop.cjs` (même rectangle de plusieurs photos côte à côte).

| Défaut | Verdict | Ce qui est fait | Interrupteur |
|---|---|---|---|
| Programmes de shader en plus (+16 ordi, +2 à +10 téléphone) (majeur) | ATTRIBUÉ, RÉFUTÉ pour le canyon. Chaque programme relié aux objets qui l'utilisent (`sonde-prog2.js`). Ordi g6 soir s5500 : 134 → 134 ; les 4 programmes propres au canyon (relief, ouvrages, décor, façade du tunnel) sont REMPLACÉS un pour un (sources de longueur différente), aucun ajouté. Téléphone palier 0 g9 nuit s5500 : 129 → 154 au premier passage, 154 → 131 en ÉCHANGEANT les profils Chrome : les ~23 programmes d'écart (poussière de la grotte, « pouf » des nuages, Phong/Basic du jeu) suivent le profil, pas la branche — la sauvegarde est par origine (:8312 et :8313 sont deux origines), donc l'état de la page diffère d'un côté à l'autre. Le seul programme canyon en plus était `cyVouIn` (le tube) : retiré (+1 → 0). | Tube sans programme propre (voir le commentaire en tête de `canyon-voute.js`). | `?sans=cyvouin1` = le programme cyVouIn ; `?cyvouin=1` = le filet de phares du dedans d'origine, cuit (DA, non décidé) |
| Mosaïque de gros carrés sur les parois proches (majeur) | REPRODUIT (g12 orage téléphone s9000 ; g18 matin ordi s9000). CAUSE : la taille des cases n'a pas changé (0,012 × la distance), mais la case vue est un fondu de la grille fine et de la double ; v1596 traçait le joint de la fine à 16 % d'ombre (on lisait la fine partout, avec le quadrillage), le joint à 5 % (reprise 2) laissait voir la nuance de la DOUBLE dès le milieu du palier : des pavés deux fois plus gros. | Le fondu suit wq² au lieu de wq (`CY_FIN`, `cyFS`) : la fine domine les trois quarts du palier, continu aux deux bouts. La lecture des textures (mip) ne change pas. Photos (`cy1/z1.png`, `z2.png`, `rtel.png`) : téléphone, des cases de la taille de v1596 sans joint ni arêtes de triangles ; ordi, une paroi plus fine et moins tachée. ESSAYÉS et écartés : wq³ (plus raide, risque de « nager » en roulant), position lue moins quantifiée (Pc à 0,5 : presque rien). Coût : une multiplication par pixel. | `?sans=cyfin` |
| Roche du soir très saturée (mineur) | Vu sur la photo en roulant g6 s5500 (`cy1/rpc.png`). | Non touché : décision de DA en attente de Sacha (déjà listée). | — |
| Aiguille noire flottante (mineur) | Vue sur la photo de RÉFÉRENCE g6 s5500 en roulant (paroi gauche), pas sur celle de la branche au même passage. | Non investiguée plus loin (préexistante, probablement un débris de décor). | — |
| Course et juge non refaits (mineur) | Refaits. | Course complète `course.cjs --map canyon:orage` : 99 s, 0 exception, 0 requête en échec (« WebGL: too many errors » : déjà dans la référence). Route : `canyon-charte.cjs graines=1-12 paliers=0,10,20 --detail` lancé DANS wt-avant et DANS wt-canyon (chacun lit son propre code), sorties identiques octet pour octet (`cmp`). | — |

### Tableau référence (v1596) / après (ce tour) : 2 tours alternés (réf, après, puis après, réf), médianes
| | vues | triangles du canyon | appels du canyon | sommets du relief | ms image figée (bruitées) |
|---|---|---|---|---|---|
| ordi g6 soir | 3500, 5500, 9000 | 760 978 → 523 410 | 57 → 57 | 312 543 → 186 219 | 26,5 → 27,3 |
| tél palier 2 g12 orage | 5500, 9000, 10500 | 164 606 → 111 358 | 15 → 15 | 74 851 → 44 795 | 18,5 → 20,9 |
| tél palier 0 g9 nuit | 2000, 5500, 9000 | 239 116 → 203 276 | 26 → 26 | 65 892 → 45 662 | 16,3 → 18,4 |
- Vue par vue, aucun compteur du canyon au-dessus de la référence.
- Le compteur GLOBAL d'appels montrait +2 à l'ordi et +8 à g9 s2000 au téléphone : avec deux profils neufs (`sonde-appels.js`, ordi g6 s3500), 113 → 111, et le seul groupe qui diffère est un `Points` du jeu (particules, 5 → 3) : l'état de la page, pas le canyon.
- Les ms sont dans le bruit (machine partagée par 5 agents ; à la même vue, deux tours du même côté varient de 1 à 2 ms). Le seul ajout au fragment est une multiplication ; le tube perd un programme et un attribut.

### Contrôles de ce tour
`assembler --verifier` ✔ ; `garde-allege.sh` ✔ ; aucun IS_MOBILE dans le diff ; ni CR ni NUL ; `ERREURS []` sur tous les passages du banc ; fichiers touchés : `canyon-relief.js`, `canyon-voute.js` (aucun fichier partagé, aucun fichier de la session « qualité par appareil »).

### Non vérifié (ce tour)
- Gels en course (sonde des gels) : toujours non mesurés. Vrai téléphone : non mesuré.
- La case fine en mouvement sur une longue durée (passage d'un palier de cases à l'autre en roulant) : vue sur des photos en roulant seulement, pas en vidéo.
- Lissage du relief au téléphone g12 orage : regardé sur une vue (s9000), pas sur toute la course.
