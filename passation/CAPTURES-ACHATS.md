# CAPTURES DES ACHATS INTÉGRÉS — passation (24/11/2026)

Demande de Sacha : « une capture d'écran iPhone (1290×2796) de la boutique pour chaque achat intégré (voitures et peintures), à partir de l'app,
rangée dans `app-ios/fiche/captures-achats/` avec le nom de l'identifiant produit » — et « que ça ait l'air pro ».
Puis (24/11 au soir) : « les couleurs, ne les mets pas sur LA HONTE, mets-les sur LÉONIE ».
Rien n'est envoyé à Apple.

## Où on en est (24/11, 20 h 30, sur le Mac)
- Branche **`captures-achats-134`**, partie de `pub-admob-app` (la 1.1.0 build 134, celle qui part chez Apple).
  ⚠ La première branche `captures-achats` (faite sur l'autre ordi, partie de `bots-ml-etape-1`) suivait une liste de produits PÉRIMÉE :
  la Pizza encore en vente, pas d'AIGLE DE FEU ni d'ICEBERG, et les anciens prix (1,61 €, 1,00 €…). Ses captures sont remplacées ; ne plus s'en servir.
- **38 produits**, d'après `app-ios/outils/produits.csv` de la build 134 : 9 voitures + 29 peintures. **Les 38 sont BONNES**, vérifiées une à une
  à l'œil : le nom en haut = la carte (ou la pastille) entourée = la peinture sur la caisse = le prix du bouton
  (voitures 1,99 €, L'ICEBERG 0,99 € ; peintures 0,99 € / 1,99 € / 2,99 € selon la famille). Toutes en 1290×2796, PNG RGB sans transparence.
- La Pizza (`cashcar.car.b_pizza`) est hors vente dans la build 134 : sa capture est retirée.
- Les peintures sont essayées sur **LÉONIE** (achetée et équipée dans la graine du joueur), plus sur LA HONTE.
- Toutes les captures sont prises sous **le même angle** (3/4 avant gauche, `ANGLE=0.8`), caisse immobile.

## Comment c'est fait
`outils/captures-achats/captures.cjs` : le VRAI jeu tel que l'app l'embarque (`preparer-www --essai`), le faux StoreKit du banc
(`outils/banc-achats/storekit-faux.js`, prix forcés à ceux du CSV), un Chrome sans fenêtre et muet en 430×932 @3x (= 1290×2796), marges d'encoche
`--ccT:59px` / `--ccB:34px`. Joueur semé : 48 250 pièces, sons coupés, LÉONIE achetée et équipée (son index est relu dans `code/voitures/cars.js`
par son nom, et contrôlé dans la sauvegarde après le lancement). Parcours : accueil › garage › boutique › rayon ACHAT (voitures) puis PEINTURES ;
pour chaque produit : faire défiler jusqu'à sa carte, la toucher, attendre que `#gBqNom` porte SON nom, poser la caisse, capturer.

**LE CROCHET DES CAPTURES** : le jeu de l'app est enfermé dans une fonction (rien n'est global), on n'y voit ni la vitrine `GBQ` ni le geste `BQG`.
Le script ajoute, dans la COPIE TEMPORAIRE du jeu seulement (`$TMPDIR/capt-achats-www`), `window.__capt` : `pose(a)` fait ce que fait le doigt
(`bqPoseTient` : le plateau s'arrête) et met le plateau à l'angle `a` ; `etat()` donne le geste en cours et la place de la caméra. On capture quand
le geste est fini et que la caméra n'a plus bougé pendant ~1,2 s. Le jeu (code/, VERSION PRINCIPALE, l'app) ne change pas.

```sh
# tout (≈ 6 min sur le Mac, GPU, après ~1 min de fabrication du jeu) :
ANGLE=0.8 node outils/captures-achats/captures.cjs
# seulement certains produits (2e argument = identifiants séparés par des virgules ; 1er = dossier de sortie) :
ANGLE=0.8 node outils/captures-achats/captures.cjs app-ios/fiche/captures-achats cashcar.peinture.lagon,cashcar.car.iceberg
# variantes : VOITURE='LE NOM' (une autre caisse pour les peintures), ANGLES=0,0.8,1.6 (une image par angle, pour choisir),
#             RAFALE=12 (12 images à 1 s d'intervalle après le choix), REFAIT=1 (refabriquer la copie du jeu après un changement de code/)
```
Le script écrit une ligne par produit (`nom affiché | bouton`) ; `NON SÉLECTIONNÉ …` = carte pas prise (fichier non écrit).

## Pièges rencontrés
- **Liste des produits** : toujours partir de la branche de la build qui part chez Apple (`produits.csv` et les prix changent d'une branche à l'autre).
- **WebGL refusé** au Chrome sans fenêtre sur le PC Windows : `-r ./outils/captures-achats/logiciel.cjs` force SwiftShader (rendu logiciel,
  même image, bien plus lent). Sur le Mac, le GPU marche : pas besoin.
- **Un Chrome orphelin** reste ouvert si le script est tué : le fermer (profils `banc-achats-*` dans le dossier temporaire) avant de relancer.
- **La vitrine tourne seule** et la caméra se recadre selon l'angle : sans `__capt.pose`, chaque capture tombe à un angle différent (caisse coupée
  ou toute petite). D'où le crochet.
- **Les index de `CARS`** : les voitures retirées s'écrivent `{retire:1,name:'…'}` et gardent leur place. LÉONIE est l'index 4. Une graine qui
  désigne une voiture retirée est « remboursée » au chargement (le solde gonfle, la caisse repart en LA HONTE).
- `dbgGarage`, `dbgBqA`, `dbgProduits` n'existent pas dans le jeu de l'app (retirés par `preparer-www`) ; `dbgAchats` oui.
- Le premier clic sur un rayon ou une carte juste après un défilement est parfois avalé : le script réessaie (4 fois par carte, 6 par rayon).

## Ce qu'il reste à faire
1. Rien côté captures. Option « pro » non tranchée : la bande du haut (titre BOUTIQUE et solde) et le bouton JOUER restent sur chaque capture ;
   Apple accepte une capture de l'app telle quelle.
2. Rien n'est envoyé à App Store Connect : c'est à Sacha de joindre une capture à chaque produit (voir `passation/ACHATS-APP-STORE.md`, b.6).
3. La branche `captures-achats-134` n'est pas fusionnée : elle ne contient que les captures, le script et cette passation (le jeu ne change pas).
