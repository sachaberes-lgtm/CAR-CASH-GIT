# LOT BOUTIQUE — les corrections de la boutique (14/11, chantier qualité par appareil)

Branche `qa/boutique` (worktree `~/cash-car/qualite-boutique`), partie de `qualite-appareil`. Trouvailles : `INTERFACE-AUDIT.json`, clé `confirmes`, numérotées à partir de 0.
Banc : `outils/banc-boutique-a/banc.cjs` (Chrome sans fenêtre, iPhone tactile émulé, `?tel=1` donc `ALLEGE` vrai, sons coupés dans la sauvegarde),
un crochet d'évaluation `window.__qaEv` injecté À LA MAIN dans l'index.html du banc (jamais dans `code/`, index.html non commité),
StoreKit simulé par un bouchon `window.ccAchat` (réponses `ok`, `echec`, `annule`, `attente`, `jamais`, prix tardifs). Photos : `photos/boutique/`.
Nouvelle sonde : `outils/banc-boutique-a/perf/qa-boutique.mjs <port> <étiquette> [portrait|couche]` (ouverture, animations, images/s au défilement).

## Mesures de fluidité (390×844 tactile, Chrome sans fenêtre ; machine chargée : à lire en tendance)
| fenêtre | avant | après |
|---|---|---|
| ouverture de la boutique (toucher → 3 cartes posées) | 1 201 ms | 1 283 ms (bruit) |
| animations infinies en cours, rayon VOITURES | 6 (3 `lgShine` vides sur les plaques + 3 chevrons de JOUER) | 3 (les chevrons, visibles) |
| repos 5 s, rayon VOITURES : recalcul de style | 72 ms | 30 ms |
| 4 lancers de la bande VOITURES : recalcul de style / script / pire image | 912 / 1 738 / 83 ms | 579 / 1 215 / 67 ms |
| 4 lancers, rayon PEINTURES : pire image | 50 ms | 33 ms |
| boucles rAF demandées en 2 s, peinture MAGMA essayée | 482 (`?sans=horloge`) | 362 (−60/s) |
| passages de `bqNomsAjuste` pendant 4 lancers | 116 (comportement d'avant émulé) | 10 |
| lectures `offsetTop` de `garAplomb` pendant un geste | 12 par tick | 0 |
Les images/s restent à 59-60 dans les deux cas sur ce Mac : le gain se lit en temps de style et de script, pas en images. Sur l'iPhone, à mesurer.
Couché (844×390), après : défilement VOITURES 548 ms de style, PEINTURES pire image 33 ms (pas de mesure « avant » couché).

## Par trouvaille
**0 — INDISPONIBLE après un échec** · FAIT (`economie/boutique.js`) : le réessai retire `refus`, remet ACHETER, vide la note. EN PLUS : si la synchro trouve l'achat
encaissé malgré l'échec, la fenêtre passe à À TOI / ÉQUIPER (`shopPopAJour`, appelée par `achatsRafraichit`). VÉRIFIÉ : bouchon `echec` puis `ok` (avant : « INDISPONIBLE »
pendant le réessai, photo `00-avant-reessai` ; après : « ACHETER », `00-apres-reessai`) ; `echec` + `possedes` qui rend l'id → À TOI (`00-apres-encaisse-malgre-echec`).
Web inchangé (le bouton y reste `off`). À JUGER SUR L'IPHONE : un vrai échec réseau.

**1 — garage pas rafraîchi après achat en euros** · FAIT a minima : au succès, si `garageOn`, `GBQ.rk=''` + `gShopJour()` (comme `habPaye`). PAS de `garageShow` :
au banc (version A, tous formats) le bouton visible `#gBqBtn` passe déjà à ÉQUIPER tout seul (il lit l'état à chaque image), `#gBuy` « EN BOUTIQUE » est caché en boutique,
et au retour au garage il dit ÉQUIPÉE. `garageShow` pendant la fête risquait de la casser pour rien. `#gBuy` garde `data-bout='1'` jusqu'au prochain `garageShow` : sans effet vu.

**2 — horloge rAF perpétuelle** · FAIT : `MOT_TU.value` est un accesseur (lu par three.js au moment de dessiner), plus de boucle. `?sans=horloge` = l'ancienne boucle.
VÉRIFIÉ : MAGMA anime (valeur qui avance, deux photos différentes), −120 rAF en 2 s. À JUGER : la peinture se fige quand rien n'est rendu (pause) — voulu.

**3 — prix de repli au lieu du prix d'Apple** · FAIT : `achatsRafraichit` met à jour la fenêtre ouverte (`.spPrix em`) et le bouton EN BOUTIQUE du garage ; les prix sont
redemandés à l'ouverture de la fenêtre et de la boutique du garage s'ils ne sont pas venus. Pas de prix « … » (un échec durable de `produits()` aurait bloqué l'achat).
VÉRIFIÉ : prix bouchonnés à 2,5 s : la fenêtre ouverte passe de « 1,61 € » à « 2,49 $ », bande et bouton aussi (`03-apres-prix-apple-fenetre`). Restent en euros tant
qu'Apple n'a pas répondu (feuille d'Apple = vrai prix). À JUGER : réseau lent réel.

**4 — fête d'un achat accordé en course jamais jouée** · FAIT : `achatsFetesGuet` (1 s, seulement tant que la file n'est pas vide) joue la file dès que l'accueil (`#mHome.on`),
l'écran ACHAT ou le garage est à l'écran, jamais en course (`started&&!gameOver`) ni sur l'écran de mort (aucun des trois n'y est `.on`). Correction faite dans
`achats-store.js` (le routeur `mobile-tactile.js` n'est pas à ce lot). VÉRIFIÉ : `onRecu` en « course » simulée → file 1, pas de fête ; fin de course au garage → fête jouée,
file vide, veille arrêtée. NON VÉRIFIÉ : la fête sur l'accueil pendant son entrée (risque de superposition noté par l'audit). À JUGER SUR L'IPHONE.

**5 — aucun délai sur le verrou d'achat** · FAIT : `ACH_EN_COURS` et `habPaye.on` se relâchent après 120 s (`ACH_DELAI`, `?achdelai=ms`), avec resynchro et une note
`achat` dans la boîte noire ; la réponse tardive reste traitée. VÉRIFIÉ : bouchon `jamais`, délai 2 s : verrou relâché, resynchro, l'achat suivant part (avant : refusé en silence).
La fenêtre de l'achat pendu reste grisée (« attend ») jusqu'à ANNULER : voulu (on ne sait pas si Apple a encaissé). Le verrou natif (`app-ios/natif/achats.js`) n'a pas de délai :
hors lot. À JUGER : seulement sur appareil, cas rare.

**6 — fenêtre ouverte, grille redessinée** · FAIT : `shopPopFerme` vise la vignette d'aujourd'hui (`#mShop [data-car]`) ; `shopPopAJour` recache la nouvelle vignette.
VÉRIFIÉ : `achatsRafraichit` fenêtre ouverte → ancien nœud détaché, nouveau caché (`spParti`), à la fermeture `--dx/--dy` visent le nouveau, plus aucun `spParti` après.

**7 — mesures de la bande** · FAIT a minima : au verrou, un seul balayage des cartes (deux avant). `bqaTeinte` NON TOUCHÉE : mesuré 773 lectures pour 4 lancers
(~3 par image, sans écriture entre elles : pas de mise en page forcée) ; la réécrire sur des `offsetLeft` en cache changeait sa logique (deux rangs en peinture) pour un gain faible.

**8 — backdrop-filter de `.pNav`**, **9 et 20 — reflets des peintures légendaires** · NON TOUCHÉS, sans objet sur le jeu livré : la boutique version A
(`html.bqA`, tous les formats depuis le 10/11, `bqaVeut`) ne dessine pas le nuancier `.pNu/.pNav/.pNsw/.pL` (il n'existe qu'avec `?bqa=0`). MESURÉ au rayon PEINTURES :
0 `backdrop-filter`, 0 `.pL`, les `.bqRl` légendaires en `display:none`, seules 3 animations en cours (les chevrons de JOUER). EN REVANCHE la mesure a trouvé le vrai reflet
qui tournait : `.bqKn.lg` (plaque au nom long) héritait de `.lg::after` (lgShine infini, pseudo-élément vide). Corrigé dans `css/boutique-a-iphone.css` (`content:none`
sur la plaque) : 6 → 3 animations infinies au repos, rien ne change à l'écran.

**10 — garAplomb toutes les 250 ms** · FAIT : sortie immédiate si la caisse est tenue (`GBQ.drag`) ou si la bande a défilé il y a moins de 400 ms (`PHQ.defile`).
VÉRIFIÉ : 12 lectures `offsetTop` au repos, 0 pendant un geste ; la pile se recale au tick suivant.

**14 — plaques mesurées une fois** · FAIT : `resize` (largeur seulement) → 350 ms après, `data-lg`, `lg`, `lg2` effacés et remesure. VÉRIFIÉ : plaques marquées « X » et un
`lg2` factice avant pivot → après 844×390 : 0 « X », 0 `lg2` factice, toutes remesurées. NON VÉRIFIÉ en anglais (pas de bascule de langue au banc).

**15 — MutationObserver sur tout le garage** · FAIT : une classe changée ne relance la mesure que s'il reste des plaques cachées non mesurées (`REVUE.reste`) ; les nœuds
ajoutés la relancent toujours. VÉRIFIÉ : 116 → 10 passages pendant 4 lancers ; plaques de la bande refaite toujours mesurées.

**22 — taper la bande qui roule choisit la carte sous le doigt** · FAIT : le toucher qui arrête la glisse avale le clic et pose la bande (`bqaVerrou(rl,0)`). `?sans=arret`.
VÉRIFIÉ (ressort ralenti pour avoir le temps de taper) : avant, la carte touchée (v:33) était choisie et la bande repartait ; après, la glisse s'arrête, la bande se pose,
la carte au repère (v:40) est choisie, pas v:33. À JUGER SUR L'IPHONE : la sensation (un tap = stop + petit recalage).

**23 — deuxième doigt** · FAIT : `bqTap2` sur `#gBqBtn`, les rayons `#gBqCats`, les flèches : un tap court d'un doigt posé pendant qu'un autre est là → `el.click()`
(mêmes écouteurs), un clic natif en double est avalé 700 ms. `?sans=tap2`. VÉRIFIÉ en CDP deux doigts (un sur la scène, un sur le bouton) : avant 0 clic, après 1 clic et
la fenêtre d'achat s'ouvre ; rayon AILES pris au 2e doigt ; un doigt seul = toujours 1 clic. Les cartes de la bande ne sont PAS couvertes (conflit avec la tire de la bande).
À JUGER SUR L'IPHONE : le vrai iOS (le banc Chrome se comporte comme iOS : aucun clic natif pour le 2e doigt).

**25 — tap avalé pendant la sortie de la fenêtre** · FAIT : `shopPop` accepte une fenêtre `sortant`. VÉRIFIÉ : réouverture à 370 ms après ANNULER sur une autre vignette
(classe « on sortant » → « on », bonne caisse, un seul `spParti`).

**26 — la barre des rayons saute de ~100 px en FIGURES** · NON TOUCHÉ : c'est la place du dock AVANT / ARRIÈRE / CÔTÉS au-dessus de la bande. Garder la barre fixe
demande soit d'écraser la bande des figures (~50 px de haut, affiches illisibles), soit de déplacer le dock (sur la scène, ou en ligne unique) : c'est un choix de mise en page
pour Sacha (règle « maquettes avant le code »). Pistes : (A) dock en une ligne sans la phrase d'aide (saut ~60 px), (B) dock posé sur la scène au-dessus des rayons (saut 0).

**27 — prix trop chers gris pâle** · FAIT : `--bqGris` (#6b6587, ≈ 5,5:1) au lieu de `--bqGris2` (#9a95ad, ≈ 2,9:1) pour `.cher` dans ailes, classique (les ailes de la
version A passent par `.bcP`), figures, peintures. Couleur existante de l'écran. VÉRIFIÉ : couleur calculée rgb(107,101,135) sur les prix trop chers, photo
`27-avant-apres-prix-ailes` (haut : avant, bas : après). Change aussi l'ordinateur (bogue listé). À JUGER : le trop cher reste distinct de l'abordable (encre) ? oui au banc.

**28 — couture dans le fond** · FAIT dans `interface/boutique-scene-1.js` (la cause est la scène 3D, pas `boutique-ensemble.css`) : la sphère du fond prend l'éclat du sol
(×3,4, valeur déjà à l'écran) et un horizon `#f2f4f7` (le blanc moyen d'une dalle). `?sans=couture` = avant. VÉRIFIÉ : marche à l'horizon (233,237,240)→(237,239,243)
avant, ≤ 1 niveau après ; photos aux niveaux étirés (×13 autour de 225-245) `28-niveaux-{390x844,375x667,844x390}-{ailes,voitures}` (gauche avant, droite après).
Change aussi l'ordinateur (bogue listé) : le ciel de la boutique est 2 à 4 niveaux plus clair. À JUGER SUR L'IPHONE : l'écran réel (étalonnage, P3).

## Ce qui n'est pas dans ce lot et qu'il faudrait regarder
- Le verrou du pont natif `app-ios/natif/achats.js` (`enCours`) n'a pas de délai non plus (branche `ios-capacitor`).
- `garBqPanneau` lit 4 `getBoundingClientRect` par image en boutique (1 380 lectures sur 4 lancers, la plus grosse source) : hors audit, non touché.
