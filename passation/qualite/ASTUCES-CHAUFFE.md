# ASTUCES CONTRE LA CHAUFFE — les « triches » (19/11, session astuces-chauffe)

Demande de Sacha (19/11) : « des techniques pour alléger le jeu, des techniques de triche, par exemple supprimer les décors qui sont derrière le joueur. […]
Si ça peut alléger le jeu, on le fait. Trouve plein de petites techniques comme ça, pour la chauffe, surtout. »

**État (19/11, soir)** : `qa/derriere`, `qa/jumeaux` et `qa/dessinsloin` sont FUSIONNÉES dans `qualite-appareil` (oui de Sacha). `qa/horizon` attend son avis.

## En bref (pour Sacha)

- **Le décor derrière toi est déjà presque gratuit.** Le moteur 3D ne dessine déjà pas ce qui est hors de l'écran. Le décor que tu as vu en te retournant
  existe, mais il ne coûte presque rien tant qu'on ne le regarde pas. Il restait quelques objets « toujours dessinés », même dans le dos : je les ai corrigés.
- **Ce qui coûte vraiment, c'est le nombre de dessins par image** (un « appel » = un objet envoyé à la puce). Au processeur bridé ×4, chaque appel coûte
  environ 0,05 ms de JS, et le rendu prend plus de la moitié du temps de chaque image. Le canyon en fait 145 à 165 par image, la ville 75, les nuages 60 à 100.
- **Le gros gisement : le lointain.** Au canyon, 39 % des appels vont à des objets à plus de 1,6 km (la route et le décor au fond). C'est une triche visible
  (l'horizon), donc à te montrer avant.

## Comment c'est mesuré

`outils/banc-astuces/` (Chrome sans fenêtre et muet, sous le verrou commun, édition téléphone `?tel=1&appareil=iPhone14,2`, pilote auto qui saute, processeur bridé ×4) :
- `sonde.cjs` + `sonde-page.js` : chaque appel de dessin de l'image classé (caméra, ombre, post ; caisse, route, décor ; distance ; derrière la caméra ; hors du champ),
  le temps du rendu, des matrices, de l'ombre, les tranches de la boucle (mouchard `perfrec=2`).
  `--fige K` : la MESURE SUR IMAGE FIGÉE — la même image redessinée avec et sans chaque astuce (comptes exacts, sans le bruit du parcours).
- `course.cjs` : la course complète (3 vrais portails, mort, seconde chance, mort, menu, relance, mort, garage) ; exceptions de la page et erreurs de boucle.
- `inspecte.cjs`, `diag.cjs` : l'empreinte des gros groupes de la scène ; les avertissements de la boucle.

## Ce que coûte une image aujourd'hui (processeur ×4, 10-12 s de course, après 20-25 s)

| map | appels / image | triangles | JS du rendu | boucle entière | matrices | ombre |
|---|---|---|---|---|---|---|
| canyon | 144-164 | 410-485 k | 6,9-8,5 ms | ~9 ms | 0,4-0,6 ms | 0,4-0,6 ms |
| nuages | 61-98 | 210-315 k | 4,5-6,7 ms | ~8 ms | 0,5-0,6 ms | 0,3-0,5 ms |
| ville | 74 | 170-175 k | 4,3-5,7 ms | ~7,5 ms | 0,3 ms | 0,4 ms |
| grotte | 72 | 162 k | 5,0 ms | ~8,5 ms | 0,8 ms (2 550 objets) | 0,3 ms |
| jade | 62 | 170 k | 3,5 ms | ~7 ms | 0,2 ms | 0,2 ms |

Par famille (canyon) : décor 67-86 appels, caisse 37-43, route 35-41. Plus loin que 1,6 km : 34 appels de décor + 23 de route.
Nuages : caisse 24-31, décor 28-50, route 8-16. Ville : décor 31, caisse 28, route 14.
Déjà bien fait (vérifié, rien à gagner) : le coton des nuages est trié nuage par nuage ; les pièces hors du couloir ne sont ni dessinées ni animées ;
la route est en tranches avec une version moyenne au loin ; l'ombre de la caisse est en un seul dessin (moba-ombre).

## Le tableau classé

Gain = mesuré sur image figée (même image avec / sans), sauf mention. « Appels » = appels de dessin par image.

| # | technique | où | gain mesuré | risque visible | effort | état |
|---|---|---|---|---|---|---|
| 1 | **Horizon court** (route) : au-delà de 1,5 km, la route ne garde que la silhouette de son bitume | `piste-prebati.js` (pisteLoin) | canyon −14 appels et **−108 k triangles (−24 %)** ; grotte −3,9 / −31 k ; jade −2,5 / −24 k ; nuages −1,5 ; ville −0,6 | en principe (néons lointains la nuit) ; 0,01-0,16 % de pixels changés sur les clichés, ceux des effets animés | petit | **fait** `qa/horizon` — à montrer à Sacha |
| 2 | **Jumeaux cachés par la dalle** (fruits, cristaux, pièces) en vol | `boucle-4-effets.js`, `jumVu` (pouvoirs-grisants.js) | voir « Réalisées » | non (caché par la route) | petit | **fait** `qa/jumeaux` |
| 3 | **Les dessins du loin** : les motifs peints de la route (chevrons, damiers) plus dessinés au-delà de 400 m | `autoroute.js`, pisteLoin | voir « Réalisées » | quasi nul (1-2 pixels) | petit | **fait** `qa/dessinsloin` |
| 1 bis | Horizon court pour le DÉCOR (34 appels de décor à plus de 1,6 km au canyon) | décors des maps, un par un | non mesuré objet par objet | en principe | moyen | pas fait (suite logique de `qa/horizon`) |
| 4 | **Le décor dans le dos** : les objets « toujours dessinés » rendus au tri du champ de vision | `instances-segments.js` (derrTri), `canyon-mine.js` | voir « Réalisées » | non | petit | **fait** `qa/derriere` |
| 5 | Les dessins de la caisse : 24 à 43 appels pour 1 400-6 800 triangles (plaque, feux, pièces mobiles, la loupe) | `voitures/buildcar.js`, `loupe-caisse.js` | jusqu'à ~15 appels en soudant par matière | non si exact, mais touche à la voiture (règle de Sacha) | gros | pas fait |
| 6 | Les matrices des objets cachés : 920-1 000 objets recalculés à chaque image, dont 550-1 240 cachés | three.js (updateMatrixWorld) | ≤ 0,3-0,8 ms ×4 en tout (grotte au pire) | non | moyen, risqué | pas fait |
| 7 | L'ombre une image sur deux | `boucle-1.js` (existe déjà en vol loin du sol) | 0,2-0,3 ms ×4 | **oui** : l'ombre traîne de 2-3 m à 300 km/h | petit | déconseillé |
| 8 | Calculs JS par image à 10 Hz (HUD, effets) | b4 (0,6-1,2 ms), b6 (1,1-1,9 ms) | non mesuré fonction par fonction ici | selon | moyen | à faire avec `outils/banc-jsimage/profil.cjs` |

## Réalisées — la mesure exacte

`node outils/banc-astuces/sonde.cjs --cartes canyon,nuages,jade,ville --cpu 4 --attente 15000 --fige 15 --pas 20` : 15 clichés par map (une seconde de course
entre deux), et à chaque cliché la MÊME image redessinée dans chaque état, deux fois. Appels et triangles de la passe principale, par image.
Les ms (rendu, boucle) d'une seule image à ×4 bougent de ±1 ms d'un essai à l'autre : seul l'ordre de grandeur compte (≈ 0,05 ms ×4 par appel retiré).

| map | toutes les astuces | sans « derrière » | sans « jumeaux » | sans « dessins du loin » | sans aucune |
|---|---|---|---|---|---|
| canyon (en vol 100 %) | 162,0 appels · 471,6 k tri | +0,5 · +6,1 k | +0,7 · +19,0 k | +4,5 · +0 | **+6,7 · +25,2 k** |
| jade (en vol 93 %) | 140,6 · 393,1 k | 0 · 0 | +2,1 · +16,0 k | +1,5 · 0 | **+3,7 · +16,0 k** |
| nuages (en vol 73 %) | 139,2 · 471,8 k | 0 · 0 | ~0 · +13,4 k | ~0 · 0 | **+0,9 · +13,4 k** |
| ville (en vol 73 %) | 102,9 · 236,5 k | 0 · 0 | ~0 · +13,0 k | ~0 · 0 | **+0,9 · +13,0 k** |

(Les écarts de ±0,5 appel sur les maps où une astuce ne fait rien sont le bruit du cliché : l'image avance d'une milliseconde.)
Course complète (`course.cjs`) : deux parties, 3 vrais portails chacune (nuages → ville → jade → canyon, puis nuages → ville → grotte → jade), mort, seconde
chance, mort, menu, relance, mort, garage : **0 exception, 0 erreur de boucle**. La 2e avec les QUATRE astuces réunies sur `qualite-appareil` df4b24087.

### 1. `qa/derriere` — le décor dans le dos (l'exemple de Sacha)
- Quoi : le motel de la Route 66, au départ du canyon, était marqué « toujours dessiné » : 6 148 triangles redessinés à chaque image, dans le dos, tout le canyon durant.
  Il reprend le tri du champ de vision (sa sphère + 6 m de marge pour les arbres qui ondulent). Outil `derrTri(m, marge)` pour les prochains cas.
- Gain : canyon −0,5 appel et −6 100 triangles par image (en moyenne : 1 appel quand il est dans le dos). Rien ailleurs.
- Autres « toujours dessinés » vus dans le dos (0,5 à 2 appels par image, quelques centaines de triangles) : les traces de pneus (scène #25/#26), un rideau
  d'instances (#101), un trait (#491). Petits, et leur géométrie bouge à chaque image : pas touchés.
- Interrupteur : `?sans=derriere` ; `dbgDerriere(on)`. Avis : **à fusionner** (aucun pixel ne change).

### 2. `qa/jumeaux` — le jumeau caché par la dalle
- Quoi : chaque pièce, fruit et cristal existe deux fois (dessus et dessous de la route). En vol, les deux étaient dessinés. Maintenant, en vol, celui que la
  dalle cache (droite caméra → objet qui traverse la route à moins de 85 % de sa demi-largeur, près de l'objet) n'est plus envoyé. Un trou de route,
  un regard qui passe au-delà du bord, la caméra presque dans le plan : montré comme avant. Au sol, rien ne change.
- Gain : −13 000 à −19 000 triangles par image en vol (−3 à −4 %), jusqu'à 2 appels (jade).
- Interrupteur : `?sans=jumeaux` ; `dbgJumeaux(on)` (rend aussi le nombre d'objets cachés). Avis : **à fusionner**.

### 3. `qa/dessinsloin` — les dessins du loin
- Quoi : les motifs peints de l'autoroute (chevrons, damiers, flèches) ne sont plus dessinés au-delà de 400 m (téléphone seulement). À 400 m la route fait
  une vingtaine de pixels de large : un motif y tient en un ou deux pixels. Leur version « moyenne » coûtait 4 à 5 appels pour ~100 triangles en tout.
- Gain : canyon −4,5 appels par image, jade −1,5 ; nuages et ville ~0 (peu de motifs au loin).
- Interrupteur : `?sans=dessinsloin` ; `dbgDessinsLoin(on)`. Avis : **à fusionner** (à regarder une fois sur le téléphone : le fond de la route).

### 4. `qa/horizon` — l'horizon court (bâtie sur `qa/dessinsloin`, même fichier)
- Quoi : au téléphone, une tranche de route à plus de 1 500 m de profondeur ne garde que la silhouette de son bitume (la tranche « maigre », la même qu'au-delà
  du brouillard) : plus de rails néon, de nappe, de flancs, de traits ni de motifs.
- Gain (image figée, 10-12 clichés, la même image avec / sans) : **canyon −14 appels et −108 000 triangles par image (−24 %)** ; grotte −3,9 appels et −31 000
  triangles (−9 %) ; jade −2,5 et −24 000 (−6 %) ; nuages −1,5 appel ; ville −0,6. (À 1 000 m : canyon −15, jade −5,8, grotte −4,5.)
  Au canyon, la route lointaine était dessinée DERRIÈRE les falaises : invisible et pourtant payée.
- Ce qui se voit : sur les photos avant/après (`outils/banc-astuces/mesures/photos/`, non versionnées), 0,01 à 0,16 % des pixels changent, et ce sont les
  effets animés (l'anneau rouge, la pluie), pas la route ; dans la grotte, 0 pixel. En principe, sur une map ouverte la nuit, les néons de la route au-delà de 1,5 km disparaissent.
- Interrupteur : `?sans=horizon` ; `?horizon=1200` (la distance) ; `dbgHorizon(on, d)`. Avis : **à montrer à Sacha d'abord** (regarder le fond de la route
  aux nuages la nuit, avec et sans `?sans=horizon`), puis à fusionner : c'est le plus gros gain des quatre.

## Ce que je n'ai pas fait (et pourquoi)
- **Les dessins de la caisse** (24 à 43 appels par image, autant que tout le décor des nuages) : c'est la voiture, la règle de Sacha la garde nette ; souder
  ses pièces par matière serait invisible mais touche `buildcar.js` et la loupe. Gros chantier, à proposer à part.
- **Le décor au-delà de 1,6 km** (34 appels au canyon) : la suite naturelle de l'horizon court, mais chaque map a ses propres décors (segments d'instances,
  ouvrages, tunnels…) : à faire map par map. Les sessions maps/ville y travaillent : à leur passer.
- **Les matrices des objets cachés** : 920 à 1 000 objets recalculés à chaque image, ~0,3-0,8 ms ×4 en tout. Sauter les branches cachées dans three.js
  est risqué (du code lit les matrices d'objets cachés). Gain trop petit pour le risque.
- **L'ombre une image sur deux** : l'ombre de la caisse traînerait de 2-3 m à 300 km/h. Déconseillé.
- **JS à 10 Hz** : pas eu le temps de profiler fonction par fonction (le banc commun était saturé : 10 à 30 min d'attente par passe).

## Sur le téléphone (rien n'a été installé)
Les quatre branches sont indépendantes (`qa/horizon` contient `qa/dessinsloin`). Gain attendu sur le 13 Pro à chaud : quelques appels de dessin par image
partout, et au canyon ~20 appels et ~130 000 triangles de moins (−12 % d'appels, −28 % de triangles), surtout en vol. À juger au prochain vol (boîte noire) :
le vrai coût par image au canyon, avant / après.
