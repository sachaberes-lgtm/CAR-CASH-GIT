# Feuille à copier pour App Store Connect — les 38 achats intégrés

Liste du 09/11/2026, vérifiée sur la version `main` v1383 (`node app-ios/outils/produits-store.mjs --verifier` : « OK 9 caisses + 29 peintures »).
La même liste en tableur : `app-ios/outils/produits-app-store-connect.csv` (s'ouvre dans Numbers ou Excel).
**Si le jeu change** (une peinture ajoutée, une caisse retirée), cette feuille devient fausse : demande-moi de la refaire avant de créer les produits.

## Pour chaque produit, dans App Store Connect
Ton app CASH CAR › **Monetization** › **In-App Purchases** › **(+)**
1. **Type** : *Non-Consumable* (non consommable).
2. **Reference Name** : colonne « Nom de référence » (interne, tu es seul à le voir).
3. **Product ID** : colonne « ID produit ». **Copie-le exactement.** Il ne se modifie plus après l'enregistrement et, s'il est supprimé, il ne peut jamais être réutilisé dans l'app.
4. **Price / Availability** : choisis dans la liste d'Apple le palier **le plus proche** du prix visé (voir plus bas).
5. **Localizations** : ajoute **French** et **English** : *Display Name* (30 caractères maximum) et *Description* (45 maximum), colonnes ci-dessous. Tous les textes respectent déjà ces limites.
6. **Family Sharing** : laisse désactivé.
7. **Review Screenshot** : Apple en demande en général une capture d'écran par achat pour la relecture ; la même capture de la boutique peut servir à tous (à confirmer sur ton écran).
8. Enregistre. Le produit passe à « Ready to Submit » quand tout est rempli ; le premier achat est ensuite **soumis avec la nouvelle version de l'app**.

## Les prix
Apple impose ses paliers : les prix ci-dessous sont ceux du jeu, **pas forcément** des paliers d'Apple. Prends le palier le plus proche ; le jeu affichera le prix d'Apple.
- **161,00 €** (LA PIZZA EXPRESS) : très probablement hors palier, vérifie en priorité.
- **4,20 €** (CHAT POP-TART) et **1,61 €** (7 caisses) : à vérifier.
- Peintures : **1,00 €** (14), **2,00 €** (10), **3,00 €** (5) : les paliers d'Apple tournent autour de 0,99 / 1,99 / 2,99.

## Les 9 caisses
| N° | ID produit | Nom de référence | Nom affiché FR | Description FR | Nom affiché EN | Description EN | Prix visé |
|---|---|---|---|---|---|---|---|
| 1 | `cashcar.car.poptart` | Voiture - CHAT POP-TART | CHAT POP-TART | Voiture légendaire. Achat unique, à vie. | POP-TART CAT | Legendary car. One-time purchase. | 4,20 € |
| 2 | `cashcar.car.b_pizza` | Voiture - LA PIZZA EXPRESS | LA PIZZA EXPRESS | Voiture légendaire. Achat unique, à vie. | PIZZA EXPRESS | Legendary car. One-time purchase. | 161,00 € |
| 3 | `cashcar.car.e_feline` | Voiture - LA FÉLINE | LA FÉLINE | Voiture légendaire. Achat unique, à vie. | THE FELINE | Legendary car. One-time purchase. | 1,61 € |
| 4 | `cashcar.car.a_eternelle` | Voiture - L'ÉTERNELLE | L'ÉTERNELLE | Voiture légendaire. Achat unique, à vie. | THE ETERNAL | Legendary car. One-time purchase. | 1,61 € |
| 5 | `cashcar.car.d_chevalier` | Voiture - LE BLINDÉ NOIR | LE BLINDÉ NOIR | Voiture légendaire. Achat unique, à vie. | BLACK ARMOR | Legendary car. One-time purchase. | 1,61 € |
| 6 | `cashcar.car.e_murduson` | Voiture - LE MUR DU SON | LE MUR DU SON | Voiture légendaire. Achat unique, à vie. | THE SOUND BARRIER | Legendary car. One-time purchase. | 1,61 € |
| 7 | `cashcar.car.e_dragon` | Voiture - LE DRAGON D'OR | LE DRAGON D'OR | Voiture légendaire. Achat unique, à vie. | THE GOLDEN DRAGON | Legendary car. One-time purchase. | 1,61 € |
| 8 | `cashcar.car.squale` | Voiture - SQUALE | SQUALE | Voiture légendaire. Achat unique, à vie. | SHARKY | Legendary car. One-time purchase. | 1,61 € |
| 9 | `cashcar.car.mx5na` | Voiture - KELLY CHERRY | KELLY CHERRY | Voiture légendaire. Achat unique, à vie. | KELLY CHERRY | Legendary car. One-time purchase. | 1,61 € |

## Les 29 peintures
| N° | ID produit | Nom de référence | Nom affiché FR | Description FR | Nom affiché EN | Description EN | Prix visé |
|---|---|---|---|---|---|---|---|
| 10 | `cashcar.peinture.lagon` | Peinture - LAGON | LAGON | Peinture pour ta voiture. Achat unique. | LAGOON | Car paint. One-time purchase. | 1,00 € |
| 11 | `cashcar.peinture.poupee` | Peinture - ROSE POUPÉE | ROSE POUPÉE | Peinture pour ta voiture. Achat unique. | DOLL PINK | Car paint. One-time purchase. | 1,00 € |
| 12 | `cashcar.peinture.nardo` | Peinture - GRIS NARDO | GRIS NARDO | Peinture pour ta voiture. Achat unique. | NARDO GRAY | Car paint. One-time purchase. | 1,00 € |
| 13 | `cashcar.peinture.noir` | Peinture - NOIR MAT | NOIR MAT | Peinture pour ta voiture. Achat unique. | MATTE BLACK | Car paint. One-time purchase. | 1,00 € |
| 14 | `cashcar.peinture.lilas` | Peinture - LILAS | LILAS | Peinture pour ta voiture. Achat unique. | LILAC | Car paint. One-time purchase. | 1,00 € |
| 15 | `cashcar.peinture.pistache` | Peinture - PISTACHE | PISTACHE | Peinture pour ta voiture. Achat unique. | PISTACHIO | Car paint. One-time purchase. | 1,00 € |
| 16 | `cashcar.peinture.lave` | Peinture - LAVE | LAVE | Peinture pour ta voiture. Achat unique. | LAVA | Car paint. One-time purchase. | 1,00 € |
| 17 | `cashcar.peinture.couchant` | Peinture - COUCHER DE SOLEIL | COUCHER DE SOLEIL | Peinture pour ta voiture. Achat unique. | SUNSET | Car paint. One-time purchase. | 1,00 € |
| 18 | `cashcar.peinture.vaporwave` | Peinture - VAPORWAVE | VAPORWAVE | Peinture pour ta voiture. Achat unique. | VAPORWAVE | Car paint. One-time purchase. | 1,00 € |
| 19 | `cashcar.peinture.cuivre` | Peinture - CUIVRE | CUIVRE | Peinture pour ta voiture. Achat unique. | COPPER | Car paint. One-time purchase. | 1,00 € |
| 20 | `cashcar.peinture.holo` | Peinture - HOLOGRAMME | HOLOGRAMME | Peinture pour ta voiture. Achat unique. | HOLOGRAM | Car paint. One-time purchase. | 1,00 € |
| 21 | `cashcar.peinture.banana` | Peinture - BANANA | BANANA | Peinture pour ta voiture. Achat unique. | BANANA | Car paint. One-time purchase. | 1,00 € |
| 22 | `cashcar.peinture.sorbet` | Peinture - SORBET | SORBET | Peinture pour ta voiture. Achat unique. | SORBET | Car paint. One-time purchase. | 1,00 € |
| 23 | `cashcar.peinture.toxique` | Peinture - TOXIQUE | TOXIQUE | Peinture pour ta voiture. Achat unique. | TOXIC | Car paint. One-time purchase. | 1,00 € |
| 24 | `cashcar.peinture.apero` | Peinture - L'APÉRITIF | L'APÉRITIF | Peinture pour ta voiture. Achat unique. | THE APERITIF | Car paint. One-time purchase. | 2,00 € |
| 25 | `cashcar.peinture.stickers` | Peinture - STICKER BOMB | STICKER BOMB | Peinture pour ta voiture. Achat unique. | STICKER BOMB | Car paint. One-time purchase. | 2,00 € |
| 26 | `cashcar.peinture.popart` | Peinture - POP ART | POP ART | Peinture pour ta voiture. Achat unique. | POP ART | Car paint. One-time purchase. | 2,00 € |
| 27 | `cashcar.peinture.tigre` | Peinture - TIGRE | TIGRE | Peinture pour ta voiture. Achat unique. | TIGER | Car paint. One-time purchase. | 2,00 € |
| 28 | `cashcar.peinture.leopard` | Peinture - LÉOPARD | LÉOPARD | Peinture pour ta voiture. Achat unique. | LEOPARD | Car paint. One-time purchase. | 2,00 € |
| 29 | `cashcar.peinture.zebre` | Peinture - ZÈBRE | ZÈBRE | Peinture pour ta voiture. Achat unique. | ZEBRA | Car paint. One-time purchase. | 2,00 € |
| 30 | `cashcar.peinture.vache` | Peinture - VACHE | VACHE | Peinture pour ta voiture. Achat unique. | COW | Car paint. One-time purchase. | 2,00 € |
| 31 | `cashcar.peinture.coccinelle` | Peinture - COCCINELLE | COCCINELLE | Peinture pour ta voiture. Achat unique. | LADYBUG | Car paint. One-time purchase. | 2,00 € |
| 32 | `cashcar.peinture.fleurs` | Peinture - FLOWER POWER | FLOWER POWER | Peinture pour ta voiture. Achat unique. | FLOWER POWER | Car paint. One-time purchase. | 2,00 € |
| 33 | `cashcar.peinture.mousse` | Peinture - MOUSSE | MOUSSE | Peinture pour ta voiture. Achat unique. | MOSS | Car paint. One-time purchase. | 2,00 € |
| 34 | `cashcar.peinture.neon` | Peinture - NÉON TOKYO | NÉON TOKYO | Peinture pour ta voiture. Achat unique. | NEON TOKYO | Car paint. One-time purchase. | 3,00 € |
| 35 | `cashcar.peinture.sakura` | Peinture - SAKURA.EXE | SAKURA.EXE | Peinture pour ta voiture. Achat unique. | SAKURA.EXE | Car paint. One-time purchase. | 3,00 € |
| 36 | `cashcar.peinture.magma` | Peinture - MAGMA | MAGMA | Peinture pour ta voiture. Achat unique. | MAGMA | Car paint. One-time purchase. | 3,00 € |
| 37 | `cashcar.peinture.ocean` | Peinture - ABYSSES | ABYSSES | Peinture pour ta voiture. Achat unique. | ABYSS | Car paint. One-time purchase. | 3,00 € |
| 38 | `cashcar.peinture.rgb` | Peinture - RGB | RGB | Peinture pour ta voiture. Achat unique. | RGB | Car paint. One-time purchase. | 3,00 € |

## Après la création des 38 produits
Dis-moi « produits créés » : on passe à l'étape 3 (vérifier les prix) puis à la fiche de l'app.

Remarque : l'aide d'Apple décrit aussi une API pour créer ces produits par script. Je ne la propose pas ici : elle demande une clé d'API de ton compte, que tu n'as pas à me donner.
