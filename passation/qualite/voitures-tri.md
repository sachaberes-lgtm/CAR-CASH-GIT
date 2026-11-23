# Le tri des voitures (18/11, lot « tri des voitures », branche `qa/voitures-tri`)

Ta demande, mot pour mot : « Supprime du jeu les voitures : cabossées, La fidèle, La scarabée. La combi, mets-la en voiture secrète après, qui se débloque après avoir passé 10 niveaux dans les nuages. La Dolores aussi, elle se met en voiture secrète. C'est après avoir téléchargé le jeu depuis 1 mois. Pas avoir joué tous les jours depuis 1 mois, mais avoir téléchargé le jeu depuis 1 mois. La voiture Aigle de Feu, tu la mets en payante à 1,61 € en légendaire. Supprime la voiture, la perle. La queue de canard. La iceberg, tu la mets là où elle était Nyan Cat avant, en mode offre de l'hiver. Elle est à 80 centimes au lieu de 1,61 € en mode promo. »

Rien n'est sur `main`. Le téléphone et App Store Connect n'ont pas été touchés.

## Ce qui change, voiture par voiture

Les index viennent de `CARS`. La consigne du lot en donnait d'autres (80, 82, 79, 46). Les bons sont ceux-ci, confirmés par `TABLEAU-VOITURES.md` et par le banc.

| N° | Voiture | Avant | Maintenant |
|---|---|---|---|
| 6 | LE SCARABÉE | commune, gagnée par la mission `fig5` (12 figures en un saut) | **retirée** |
| 79 | LA CABOSSÉE | commune, 25 000 $ | **retirée** |
| 81 | LA FIDÈLE | commune, 40 000 $ | **retirée** |
| 78 | LA PERLE | épique, 2 400 000 $ | **retirée** |
| 45 | LA QUEUE DE CANARD | épique, gagnée par la mission `km100k` (20 000 km) | **retirée** |
| 7 | LE COMBI | commune, mission `parf10` (25 poses parfaites d'affilée) | **secrète** : mission secrète `nuages10` |
| 8 | LA DOLORÈS | mission `rares` (avoir toutes les rares) | **secrète** : mission secrète `mois1` |
| 52 | L'AIGLE DE FEU | rare, mission secrète `lave` | **légendaire, payante 1,61 €** |
| 72 | L'ICEBERG | épique, mission `verglas100` (glacier, hors du tirage) | **légendaire, payante 0,80 € au lieu de 1,61 €**, « OFFRE DE L'HIVER », dans la grande boîte de la page ACHAT |

### Les retirées : la règle déjà en place
- La fiche devient `{retire:1,name:'…'}` au même index. `CARS` et `CAR_UNLOCK` gardent 91 lignes.
- La fiche n'a plus de `shape`. Une mission ne peut donc pas la faire revenir (`missions/table.js`, `revenue`).
- Au chargement, `SAVE.san` sort la caisse de `owned`. Il rembourse le prix de `CAR_UNLOCK`, une seule fois. Le menu le dit : « … QUITTENT LE GARAGE : … REMBOURSÉS ».
  - LA CABOSSÉE rend 25 000 $, LA FIDÈLE 40 000 $, LA PERLE 2 400 000 $.
  - LA QUEUE DE CANARD rend 8 000 000 $ à qui l'avait achetée. Qui l'a gagnée par la mission `km100k` ne touche rien : elle est ajoutée à `GAG` dans `SAVE.san`, la même règle que LA CAISSE-NUAGE.
  - LE SCARABÉE ne rend rien : il ne s'achetait pas.
- Qui roulait avec une retirée repart en LA HONTE (index 0).
- Les habillages posés (peinture, aile, traînée) restent à toi et restent posés : ils suivent la caisse équipée, pas une caisse en particulier.
- Les dessins restent dans `SHAPES` (`bulle`, `simpson`, `corolla`, `perle`, `b_canard`). D'autres caisses en réutilisent les outils (le CAÏD prend la grille de LA CABOSSÉE, les japonaises prennent la méthode de LA PERLE). La Corolla sort de la préchauffe du menu (`japChauffe`) : plus rien ne la montre.

### Les missions qui donnaient ces caisses paient de l'argent
Les montants sont de moi, **à valider** : `fig5` 15 000 $ · `km100k` 100 000 $ · `parf10` 25 000 $ · `rares` 150 000 $ · `verglas100` 30 000 $ · `lave` 20 000 $.
Qui avait **réussi** `parf10`, `rares`, `lave` ou `verglas100` **sans encore toucher** la récompense avait gagné la caisse. Au premier lancement de cette version, il la reçoit et la mission est marquée prise (`voitTriMigre`, dans `sauvegarde.js`). Ça ne joue qu'une fois par sauvegarde (témoin `m2.c.sc.tri_voitures`). Une mission réussie après la mise à jour paie l'argent.

## Les conditions exactes des deux secrètes

Les deux sont des **missions secrètes** (`f:'secret'`), le mécanisme des autres secrètes. La boutique et le garage les montrent en silhouette, « SECRÈTE ». Une fois réussie, l'écran de révélation les donne (RÉCUPÈRE).

- **LE COMBI, `nuages10`** : « PASSE 10 NIVEAUX DANS LES NUAGES ».
  - Un niveau passé = le portail franchi en sortant d'un niveau sur la carte `nuages`, toutes météos (matin, midi, soir, nuit, pluie, orage).
  - Compté par `secPorte()` (`missions/defis-moteur.js`), une fois par portail. Hors course, auto-école, parc et balade, rien ne compte.
  - Stocké à vie dans `SAVE.d.m2.c.sc.nuages_passes`. `SAVE.san` le garde.
  - **Compteur neuf, compté à partir de maintenant** : aucun compteur existant ne comptait les niveaux *finis* par map. Celui des peintures (`sc.nuages`) compte les niveaux *entrés*.
  - 9 niveaux : non. 10 : oui.
- **LA DOLORÈS, `mois1`** : « GARDE LE JEU 30 JOURS ».
  - On compte les jours entiers depuis `SAVE.d.prof.ne`, la naissance du compte. Ce n'est pas le nombre de jours joués.
  - `prof.ne` est posé au tout premier lancement. Une sauvegarde d'avant le 17/10 (la version qui a créé le profil) l'a reçu au premier lancement d'une version d'après le 17/10 : un joueur revenu entre-temps compte depuis ce retour, il peut déjà avoir ses 30 jours. Une sauvegarde qui n'a toujours pas de `prof` (pas relancée depuis, ou importée sans) prend la date du jour : **ce joueur attend 30 jours à partir de cette mise à jour**.
  - 29 j 23 h : non. 30 j pile : oui.
  - La mission est vérifiée pendant la course (4 fois par seconde) et en fin de partie. Elle tombe donc à la première partie jouée après le 30e jour.
  - Horloge reculée : une mission réussie reste dans `m2.ok` et la caisse reste dans `owned`, rien ne se reverrouille.
  - Horloge avancée : elle ouvre la caisse plus tôt. On ne peut pas l'empêcher hors ligne : le jeu n'a pas de serveur.
  - Une naissance posée dans le futur est ramenée à « maintenant » par `SAVE.san`.
- Ceux qui avaient déjà LE COMBI ou LA DOLORÈS (contrats 2 et 3, ou missions d'avant) **les gardent** : elles sont dans `owned`.

## L'argent réel (App Store)

Comment ça marche dans le jeu : toute caisse `k:'premium'` en vente devient un produit `cashcar.car.<shape>` (`produitsStore`, `economie/achats-store.js`). Je n'ai inventé aucun identifiant : ce sont ceux que la règle du jeu fabrique.
- L'AIGLE DE FEU = **`cashcar.car.e_aigle`**
- L'ICEBERG = **`cashcar.car.iceberg`**

`app-ios/outils/produits.csv` et `app-ios/ios/App/Produits.storekit` (le fichier de test de Xcode) ont les deux nouvelles lignes : 39 produits, 10 caisses et 29 peintures. Je les ai ajoutées à la main, avec les mêmes formules que `produits-store.mjs`. Je n'ai pas relancé `produits-store.mjs --verifier`, qui demande Chrome.

### À faire par Sacha dans App Store Connect
1. **Créer `cashcar.car.e_aigle`**
   - Ta app › Monétisation › Achats intégrés › « + », type **Non consommable**.
   - Nom de référence « Caisse L'AIGLE DE FEU ».
   - Nom affiché : FR « L'AIGLE DE FEU », EN « THE FIRE EAGLE ». Une courte description FR et EN.
   - **Prix : 1,61 €**, le même palier que LA FÉLINE et les autres à 1,61 €.
   - Partage familial désactivé.
2. **Créer `cashcar.car.iceberg`**
   - Même chemin, **Non consommable**, « Caisse L'ICEBERG », FR « L'ICEBERG », EN « THE ICEBERG ».
   - **Prix : 0,80 €**, ou le palier le plus proche qu'Apple propose (0,79 € ?).
   - Il n'existe pas de « prix promotionnel » pour un achat non consommable : les offres promotionnelles d'Apple sont réservées aux abonnements. La promo, c'est le prix lui-même.
   - Pour finir l'offre plus tard : programmer dans le planning de prix un passage à 1,61 € à une date. **Le même jour, publier une version du jeu** où L'ICEBERG passe à `eur:'1,61 €'` sans `promo`.
   - Si la mise à jour du jeu tarde, le jeu cache déjà le prix barré dès que le prix d'Apple n'est plus plus bas que 1,61 €.
3. Joindre les deux produits à la prochaine version soumise à la revue : capture de la fenêtre d'achat et note pour la revue.
4. `app-ios/fiche/FICHE-APP-STORE.md` dit maintenant 39 produits (10 voitures + 29 peintures).

### Ce que le jeu affiche tant que les produits n'existent pas chez Apple
- Le prix du jeu, en euros : « 0,80 € » et « 1,61 € » barré pour L'ICEBERG, « 1,61 € » pour L'AIGLE DE FEU. Le bouton dit ACHETER.
- Au toucher, StoreKit répond « produit inconnu ». Le jeu ne donne rien. Le bouton passe à **INDISPONIBLE** avec la note « L'achat est indisponible pour le moment. » Ce n'est jamais muet : c'est le chemin `achatsPaye` / `shopPaye` déjà en place.
- Sur le web : même chose (pas de StoreKit, INDISPONIBLE).

### ⚠ Le prix barré : un risque à trancher
- L'ICEBERG n'a **jamais été vendue 1,61 €** : elle coûtait 3,2 M$ d'argent du jeu.
- En Europe, la directive « Omnibus » (UE 2019/2161, art. 6 bis) veut qu'un prix barré soit le prix le plus bas pratiqué dans les **30 jours** avant la réduction. Un « 1,61 € » barré qui n'a jamais existé peut être lu comme une fausse promotion, par la loi comme par la revue d'Apple.
- Le 14/10, le jeu avait déjà retiré le « 9,99 € » barré et le « -50 % » du CHAT POP-TART pour cette raison (commit 1b35a2b2, « offre honnête »).
- J'ai fait ce que tu as demandé : prix barré et bandeau. C'est réversible en une ligne :
  - **garder le bandeau sans le prix barré** : enlever `av` de `promo` dans `code/voitures/deblocage.js` (ligne de L'ICEBERG) ;
  - tout éteindre pour essayer : `?promo=0`.
- Autre voie : vendre L'ICEBERG 1,61 € pendant 30 jours, puis la mettre à 0,80 €.

## Ce que j'ai lu à ma façon (Sacha dormait)
1. « cabossées » = LA CABOSSÉE (79). « La scarabée » = LE SCARABÉE (6). « La combi » = LE COMBI. « La iceberg » = L'ICEBERG.
2. « passé 10 niveaux dans les nuages » = 10 portails **franchis** sur la mer de nuages, cumulés sur toutes les parties, comptés **à partir de cette version**.
3. « téléchargé le jeu depuis 1 mois » = **30 jours** depuis le premier lancement, que je lis comme l'installation (le web n'a pas de date d'installation, l'app non plus côté jeu).
4. L'AIGLE DE FEU et L'ICEBERG sont **légendaires** : tu l'as dit pour l'Aigle. Pour l'Iceberg, je reprends ta règle du 21/10 pour LE SQUALE (« en boutique payante, où toutes les caisses le sont »).
5. « là où elle était Nyan Cat avant » = l'**offre à la une** : la grande boîte en haut de la page ACHAT (`une:1`), vide depuis que le CHAT POP-TART est hors vente (13/11). L'historique le confirme : `git log -S"une:1"` et le commit 1b35a2b2, où la boîte portait déjà un ruban, un prix barré et une remise.
6. Pas de date de fin pour l'offre de l'hiver : elle dure jusqu'à ce que tu la retires.
7. Les missions qui donnaient les caisses touchées paient de l'argent, comme pour les retraits du 19/10. Montants à valider.
8. Les dessins des retirées restent dans le code (la règle des retraits d'avant ; pas de « supprime-la complètement du code » cette fois).

## Fichiers
- `code/voitures/cars.js`, `code/voitures/deblocage.js` : les fiches, les conditions, la promo.
- `code/missions/table.js` : 6 missions passent à l'argent, et les 2 secrètes `nuages10` et `mois1`.
- `code/missions/defis-moteur.js` : `secPorte` compte les niveaux des nuages, `m2Val` (`nuagesPasse`, `installJ`), `m2InstallJ`.
- `code/sauvegarde.js` : `GAG` (LA QUEUE DE CANARD gagnée = pas de remboursement), `voitTriMigre`.
- `code/economie/achats-store.js` : `promoDe`, `prixBarreHtml`, `promoBandeau`, I18N « OFFRE DE L'HIVER » → « WINTER DEAL ».
- `code/interface/photos-films.js` (la page ACHAT), `code/economie/boutique.js` (la fenêtre d'achat), `code/css/charte-2-ecrans.css` (le bandeau, le prix barré de la grille).
- `code/voitures/japonaises-2.js` : la Corolla sort de la préchauffe.
- `app-ios/outils/produits.csv`, `app-ios/ios/App/Produits.storekit`, `app-ios/fiche/FICHE-APP-STORE.md`, `TABLEAU-VOITURES.md`.
- Bancs : `outils/banc-voitures-tri/banc.cjs` (Node), `outils/banc-voitures-tri/page.cjs` (une passe Chrome, sous le verrou).

## Preuves
- `node outils/banc-voitures-tri/banc.cjs` : **188 vérifications, 0 en échec, BANC OK**. Il assemble les vrais morceaux dans une seule fonction et met des bouchons pour le reste du jeu. Il vérifie :
  - 91 lignes et le même nom à chaque index, comparés à `origin/qualite-appareil` ;
  - aucune retirée dans le catalogue App Store, la boutique du jour, le garage, la machine à sous ou les missions ;
  - les sauvegardes fabriquées (possédée, équipée + habillée, équipée sans la posséder, gagnée par mission, mission réussie non récupérée, mission en cours, vieille sauvegarde à carnets, tronquée) et le rechargement sans second remboursement ;
  - les seuils 9 / 10 / 11 niveaux et 29 j 23 h / 30 j / 31 j, l'horloge reculée de 41 jours, la naissance dans le futur ;
  - le prix barré (en € oui, en $ non, prix d'Apple remonté non, `?promo=0`).
- Contre-épreuve : retirer LA QUEUE DE CANARD de `GAG` fait tomber le banc (« sort sans remboursement — 8001000 »).
- `node code/assembler.cjs --depuis-morceaux` : index.html et les 347 morceaux sont d'accord.
- Gardes : `node outils/garde-demarrage.cjs` OK (21 scripts lus), `sh garde-allege.sh` OK, `sh garde-charte.sh` OK.
- Passe Chrome (`page.cjs`, sous le verrou, muette, profil effacé) sur le jeu assemblé, compte neuf : **tout vert**.
  - La grande boîte de la page ACHAT est L'ICEBERG, avec le bandeau OFFRE DE L'HIVER, « 1,61 € » barré et « 0,80 € ».
  - L'AIGLE DE FEU est dans la grille. Aucune retirée sur la page ACHAT.
  - La fenêtre d'achat montre le bandeau et le prix barré, et dit ACHETER.
  - Aucune exception, aucune erreur console.
  - Le cas « lot » (sauvegarde avec les cinq retirées) arrive bien à l'accueil. Sa première lecture a échoué à cause du banc, qui lisait `SAVE` alors que `SAVE` est dans l'IIFE ; c'est corrigé (lecture par `dbgAchats.etat()`). Le Node prouve le même cas.

## Non vérifié
- Rien sur un vrai iPhone, rien dans l'app (StoreKit, `Produits.storekit` dans Xcode).
- `produits-store.mjs --verifier` n'a pas été relancé (il faut Chrome) : le CSV et le .storekit ont été édités à la main.
- La boutique 3D du garage (`bqPrixCaisse`) et le bouton EN BOUTIQUE du garage montrent 0,80 € **sans** prix barré ni bandeau : je n'ai touché qu'à la page ACHAT et à la fenêtre d'achat.
- La mise en page du bandeau sur petit écran (320 pt) n'a pas été regardée.
- L'écran de révélation des deux nouvelles secrètes n'a pas été joué.
- Les paliers de prix exacts d'Apple (0,80 € existe-t-il ?).

## 23/11 : quatre voitures retirées de plus
- (23/11, Sacha : « enlève les voiture : baroudeur, dolce vita, caid, zagaie ») LE CAÏD (2), LA DOLCE VITA (80), LE BAROUDEUR (82) et LA ZAGAIE (88) sont retirées, par la même règle que le 18/11 : `{retire:1,name}` au même index, prix gardés dans `CAR_UNLOCK` (600 000, 30 000, 80 000, 3 500 000 $) pour le remboursement, équipée → LA HONTE, dessins gardés dans `SHAPES`. Banc : `outils/banc-voitures-tri/banc.cjs` (297 vérifications, section 5) et `page-23-11.cjs` (Chrome). Détail, points délicats et questions : `PASSATION-21-11.md`, section « 23/11 : quatre voitures retirées ».

## 23/11 (soir) : CHAT POP-TART et LA PIZZA EXPRESS retirés du jeu (branche `qa/voitures-noms`)
- Sacha : « CHAT POP-TART ça fait longtemps qu'on en veut plus » · « enlève la voiture pizza » · « change les nom si tu veux » · « les son c'est leo qui les as fait avec garage bande » · « on garde les code de triche on verra apres ».
- CHAT POP-TART (index 9) et LA PIZZA EXPRESS (19) : `retire:1` au même index, fiche et `shape` gardés (identifiants Apple `cashcar.car.poptart` et `cashcar.car.b_pizza`, jamais vendus). Pas de prix dans `CAR_UNLOCK` : **aucun remboursement** (personne ne les a payées). Équipée → LA HONTE.
- La traînée ARC-EN-CIEL (« vient avec le CHAT POP-TART ») devient secrète dans le jeu, comme dans l'app depuis le 11/11 (`economie/boutique-vitrine.js`). Les deux coupes du chat dans `preparer-www.js` sont ôtées (le jeu le fait lui-même), un témoin les remplace.
- LA PIZZA quitte `app-ios/outils/produits.csv` et `Produits.storekit` : **38 produits** à créer dans App Store Connect.
- Nom : LE SPECTRE (modèle Rolls-Royce en vente) → **LE REVENANT / THE REVENANT dans l'app seulement** (`preparer-www.js`, après les renommages du 11/11). Le jeu web garde LE SPECTRE.
- Sons `kaching`, `compteuse`, `cash`, `compteur`, `wow` : faits par Léo avec GarageBand (Sacha, 23/11) → droits réglés.
- Contrôles : assembleur OK, gardes démarrage / allégé / charte / burn-out OK, `preparer-www.js --essai` réussi (LE REVENANT ×3, LE SPECTRE ×0 dans l'app), banc `outils/banc-voitures-tri/page-23-11-chat-pizza.cjs` : **BANC OK** (joueur neuf : ni l'une ni l'autre nulle part ; joueur qui roulait en chat avec la pizza : LA HONTE, banque inchangée, aucun message de remboursement, 30 s de course, 0 exception). Cache v1617.
- Pas fait : rien sur le vrai iPhone ; `cashcar.car.poptart` n'a jamais été dans `produits.csv`.
- (23/11, Sacha : « Non, garde-le ») le prix barré 1,61 € de L'ICEBERG est GARDÉ, malgré la règle européenne des 30 jours (risque connu, écrit plus haut). Kit App Store à copier-coller : https://claude.ai/artifact/Ko8onhNZ2JYAvGEPJcmC5a
