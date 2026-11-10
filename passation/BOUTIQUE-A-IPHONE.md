# La boutique en version A pour iPhone (2026-11-10, v1411)

**La demande de Sacha :** « la boutique est cool mais pas adaptée à l'iPhone, c'est trop petit pour l'écran », puis « j'aime bien la A, fais-la bien, sans bug, avec une vraie réflexion profonde pour l'ergonomie » et « objectif visibilité et ergonomie pour iPhone ». Il tient au plateau de Léo (la caisse tenue par les bras robot, qu'on fait tourner du doigt) : on ne l'enlève pas.

## Ce qui change (uniquement sur les formats d'iPhone)
- **La caisse devient l'écran.** Elle occupe environ deux fois plus de place qu'avant (debout, la liste ne couvre plus que ~25 % de la hauteur au lieu de ~50 %).
- **Debout :** la liste se range en **bande** qu'on fait défiler de côté ; les **rayons** se posent juste au-dessus de la bande (sous le pouce) ; ACHETER, RETOUR et JOUER restent en bas, comme avant.
- **Couché :** colonne étroite à droite (260 à 292 px), la scène gagne la place ; les rayons restent à gauche.
- **Deux flèches** sur la scène passent à l'objet d'avant et d'après, dans l'ordre affiché de la liste (`bqaPas`). La bande se recentre sur l'objet choisi.
- **Aucune statistique, aucune pastille nouvelle** (refus du 2026-11-07 : TOUT / À MOI / À ACHETER / TRI ; pas de niche autour des boîtes).
- Inchangés : le plateau 3D, les bras, le glisser sur la caisse, l'achat et sa vitre brisée, les prix, les conditions, la sauvegarde.

## Où ça vit
| Quoi | Fichier |
|---|---|
| le choix du mode, la bande, la zone libre, les flèches, le recentrage | `code/interface/boutique-scene-1.js` (`bqaVeut`, `bqaHaut`, `bqaPas`, `bqaCentre`, `bqaFlPlace` ; bloc « LA PLACE » de `garBqPanneau`) |
| le recul de la caméra et l'échelle de la caisse | `code/interface/garage-rendu.js` (facteur `KA` ; recul .3 → .1 debout) |
| les cartes en bande, les intertitres verticaux, les flèches | `code/css/boutique-a-iphone.css` (`<style id="bqA">`, posée en dernier) |

- **Quand ça s'active** (`bqaVeut`) : debout ≤ 480 px de large et hauteur ≥ 1,4 × largeur ; couché ≤ 480 px de haut. Ni iPad ni grand écran. `?bqa=0` rend l'ancienne mise en page, `?bqa=1` force la version A partout.
- La classe `html.bqA` est posée / retirée avec la mise en page, et retirée à la sortie de la boutique.
- Hauteur de la bande : `H × 0,27` bornée de 150 à 252 px (+58 px pour les figures : leur rangée de trois emplacements). Les largeurs de carte en découlent par `--bqaC` (CSS).

## La réflexion d'ergonomie (les choix)
1. **L'objet d'abord** : la caisse ≥ 60 % de la hauteur debout. C'est la visibilité demandée.
2. **Un seul squelette pour les six rayons** : plateau, rayons, bande, une action, RETOUR | JOUER. On l'apprend une fois ; seule la forme de la carte change (vitrine, coffret doré, caisse repeinte, carte postale, longue piste, film de figure).
3. **Tout ce qui se touche est dans le tiers bas** : bande, rayons (juste au-dessus), ACHETER, JOUER. Le haut ne montre que l'information (nom, rareté, solde).
4. **Choisir sans viser** : toucher une carte, glisser la bande, ou les flèches de 46 pt (42 pt couché). Aucune ne demande de précision.
5. **Une action principale**, toujours au même endroit, toujours du même rose (états inchangés : ACHETER, ÉQUIPER, ÉQUIPÉE, VOIR LE DÉFI, MISSION…).
6. **Cartes grandes** : la vitrine d'une voiture fait ~215 pt de large (elle en faisait ~175 dans la grille). Texte ≥ 9 pt, prix lisibles.
7. **Tailles d'écran** : la bande s'adapte à la hauteur (SE 667 px : 180 px ; iPhone 15 852 px : 230 px ; Pro Max : 252 px).

## Vérifié (bancs headless, `outils/banc-boutique/banc.cjs` sur une copie à jour de main)
393 × 852, 852 × 393, 375 × 667, 667 × 375 ; français et anglais ; six rayons ; flèches (avant, arrière, retour au début) ; achat d'une voiture (débit, vitre, équipement, carte « ÉQUIPÉE ») ; `?bqa=0` ; 0 erreur JS ; gardes allège / burn-out / charte ; `non-declares.cjs` ne signale rien de nouveau.

## À savoir
- La bande se fait défiler au doigt (`touch-action:pan-x`) ; le glisser sur la liste ne fait pas tourner la caisse (la liste est exclue de la zone sensible, `bqScene`).
- Le rayon ACHAT reste caché dans l'app iPhone v1 (pas de StoreKit) : sa bande est prête pour plus tard.
- Si on veut une autre disposition (rayons en dock tout en bas, bande de deux rangées…), tout se règle dans `bqaHaut` et `boutique-a-iphone.css` sans toucher au plateau.
