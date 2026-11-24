# CAPTURES DES ACHATS INTÉGRÉS — passation (24/11/2026)

Demande de Sacha : « une capture d'écran iPhone (1290×2796) de la boutique pour chaque achat intégré (voitures et peintures), à partir de l'app,
rangée dans `app-ios/fiche/captures-achats/` avec le nom de l'identifiant produit » — et « que ça ait l'air pro ».
Branche : `captures-achats` (partie de `bots-ml-etape-1`). Rien n'est envoyé à Apple.

## Où on en est
- **37 produits** d'après `app-ios/outils/produits.csv` : 8 voitures + 29 peintures. Un fichier par produit : `<id>.png`, 1290×2796, PNG.
- **Les 8 voitures : BONNES.** Vérifiées à l'œil et par le script : bon nom sur le plateau, carte choisie dans le rayon ACHAT,
  bouton « ACHETER x € » au prix du CSV (161,00 € pour la Pizza, 1,61 € pour les 7 autres), caisse de 3/4 avant.
- **Les 29 peintures : À REFAIRE (ne pas les envoyer telles quelles).** Le fichier existe pour chacune, mais :
  - `apero`, `popart`, `tigre`, `magma`, `ocean` (1re passe) : le nom affiché est celui de la peinture PRÉCÉDENTE ;
  - `leopard` : bon nom, mais la caisse porte encore la peinture tigre (les bras du robot n'avaient pas fini de peindre) ;
  - `lagon` → `toxique` (2e passe, 14 fichiers de 19 h 28 à 19 h 36) : bon nom, mais au moins `banana` montre la caisse pas encore repeinte, vue de dos ;
  - les autres de la 1re passe (`stickers`, `zebre`, `vache`, `coccinelle`, `fleurs`, `mousse`, `neon`, `sakura`, `rgb`, `vaporwave`, `holo`, `sorbet`) :
    nom juste, mais la peinture sur la caisse n'a pas été contrôlée une à une.
  - Conclusion : relancer les 29 peintures, puis regarder CHAQUE image (nom en haut = peinture sur la caisse = carte entourée = prix du bouton).

## Comment c'est fait
`outils/captures-achats/captures.cjs` : le VRAI jeu tel que l'app l'embarque (`preparer-www --essai`), le faux StoreKit du banc
(`outils/banc-achats/storekit-faux.js`, prix forcés à ceux du CSV), un Chrome sans fenêtre et muet en 430×932 @3x (= 1290×2796), marges d'encoche
`--ccT:59px` / `--ccB:34px`. Joueur semé : 48 250 pièces, sons coupés. Parcours : accueil › garage › boutique › rayon ACHAT (voitures) puis
PEINTURES ; pour chaque produit : faire défiler jusqu'à sa carte, la toucher, attendre que `#gBqNom` porte SON nom, attendre la fin de la pose, capturer.
`TOUR=360` : un glissé du doigt au premier produit fait tourner la caisse de 3/4 avant ; l'angle reste ensuite d'un produit à l'autre.

```sh
# tout (≈ 1 min par capture en rendu logiciel) :
TOUR=360 node -r ./outils/captures-achats/logiciel.cjs outils/captures-achats/captures.cjs
# seulement les peintures :
TOUR=360 node -r ./outils/captures-achats/logiciel.cjs outils/captures-achats/captures.cjs app-ios/fiche/captures-achats \
  $(grep peinture app-ios/outils/produits.csv | cut -d, -f1 | paste -sd,)
# 2e argument = liste d'identifiants séparés par des virgules ; 1er = dossier de sortie.
```
Le script écrit une ligne par produit (`nom affiché | bouton`) ; `NON SÉLECTIONNÉ …` = carte pas prise (fichier non écrit).

## Pièges rencontrés (à savoir sur l'autre ordi)
- **WebGL refusé** au Chrome sans fenêtre après quelques lancements sur ce PC (« Error creating WebGL context ») : `-r logiciel.cjs` force
  SwiftShader (rendu logiciel, même image, plus lent). Sur une machine où le GPU marche, on peut l'enlever : tout va bien plus vite.
- **Un Chrome orphelin** reste ouvert si le script est tué : le fermer (profils `banc-achats-*` dans le dossier temporaire) avant de relancer,
  sinon WebGL manque.
- **La pose de peinture est lente en rendu logiciel** : l'attente après le nom est de 10 s (`dormir(p.type==='car'?2500:10000)`) et ne suffit
  pas toujours. Piste sûre : attendre que les bras du robot soient rangés, ou monter à 20 s, ou utiliser le GPU.
- `dbgGarage`, `dbgBqA`, `dbgProduits` n'existent pas dans le jeu de l'app (retirés par `preparer-www`) : d'où le glissé au doigt et `#gBqNom`.
- Le premier clic sur un rayon ou une carte juste après un défilement est parfois avalé : le script réessaie (4 fois par carte, 6 par rayon).

## Ce qu'il reste à faire
1. Relancer les 29 peintures (de préférence avec GPU, ou avec une attente plus longue), puis contrôler chaque image à l'œil.
2. Option « pro » non tranchée : la bande du haut (titre BOUTIQUE et solde) et le bouton JOUER apparaissent sur chaque capture ; Apple
   accepte une capture de l'app telle quelle. Les captures de la fiche du 14/10 étaient en JPEG sans transparence : si App Store Connect
   refuse un PNG, les convertir en JPEG.
3. Rien n'est envoyé à App Store Connect : c'est à Sacha de joindre une capture à chaque produit (voir `passation/ACHATS-APP-STORE.md`, b.6).
