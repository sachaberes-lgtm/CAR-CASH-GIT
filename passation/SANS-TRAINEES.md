# SANS TRAÎNÉES (2026-11-21)

Demande de Sacha : « dans la boutique on supprime les traînées pour l'instant, supprime l'onglet de la boutique et toutes les traînées du code du jeu ».

Branche : `claude/sans-trainees-fed5f1` (partie de `qualite-appareil`). Rien sur `main`, rien fusionné dans `qualite-appareil`, rien sur le téléphone.

## Pour tout remettre

`git revert <le commit « Sans traînées »>` puis `node code/assembler.cjs --depuis-morceaux`. Rien d'autre à faire :
la sauvegarde des joueurs n'a pas été touchée (voir plus bas), ils retrouvent leurs traînées et celle qu'ils portaient.

## Ce qui est retiré

1. **Les 12 traînées de la table** `COSM.trainee` (`code/economie/boutique.js`). Il ne reste que `nitro`, le rendu de base.

   | id | nom | prix payé par les joueurs |
   |---|---|---|
   | rose | ROSE NÉON | 40 000 |
   | sakura | SAKURA | 80 000 |
   | matrice | MATRICE | 110 000 |
   | or | POUDRE D'OR | 150 000 |
   | anneaux | ANNEAUX D'OR | 220 000 |
   | wow | WOW | 300 000 |
   | glouton | GLOUTON | 400 000 |
   | hyper | HYPERESPACE | 900 000 |
   | grille | LA GRILLE | 2 000 000 |
   | billets | FAIS PLEUVOIR | 5 000 000 |
   | foudre | FOUDRE DIVINE | gagnée (mission palier 30 du moteur) |
   | arcenciel | ARC-EN-CIEL | venait avec le CHAT POP-TART (4,20 €, plus en vente depuis le 13/11) |

   Certaines ont aussi été GAGNÉES sans payer : série de connexion (jour 5), anciens carnets, pass.
2. **L'onglet TRAÎNÉES de la boutique** (`BQ_CATS`, `code/interface/boutique-scene-1.js`) et la catégorie dans `SHOP_CATS` (`code/economie/boutique-vitrine.js`).
3. **L'onglet TRAÎNÉES de l'inventaire** du garage : les deux boutons de `code/page/ecrans-garage.html` (`.gTab` et `.ivTab`).
4. **Les récompenses qui donnaient une traînée** :
   - mission `eng30` (palier 30 du moteur) : FOUDRE DIVINE → **50 000 d'argent** (montant posé par Claude, à valider) ;
   - série de connexion, jour 5 : la règle déjà écrite s'applique seule (plus de traînée à gagner → **2 jetons**) ;
   - pass (`?pass=1` seulement) : `ps11` (ROSE NÉON) et `eng20` (SAKURA) → la prime normale de leur tranche.
5. **Les trois missions de collection** `tr5`, `tr10`, `trall` (« COLLECTE … TRAÎNÉES »), dans `code/missions/table.js` et dans le réservoir du pass (`code/missions/pass-table.js`).

## La sauvegarde : rien n'est effacé

- `shop.own` garde les `trainee:…` du joueur, `shop.eq.trainee` garde son choix. Le jeu ne les lit plus : `shopEqD` retombe sur `nitro`
  quand l'id n'existe pas, donc la caisse roule avec son rendu de base. Vérifié au banc : après une partie complète, la sauvegarde contient toujours ses traînées.
- Aucun index de `CARS` / `CAR_UNLOCK` ne bouge. Les missions sont désignées par leur id : `tr5`, `tr10`, `trall` restent dans `m2.ok` de qui les avait réussies.
- **Aucun remboursement** n'a été fait (les traînées ne sont PAS dans `HAB_RETIRES`, qui rembourserait et effacerait).

## Ce qui n'est PAS retiré (et pourquoi)

- **Les effets de base des caisses** : `fx` de `cars.js`, feux, feu du nitro. L'arc-en-ciel du CHAT POP-TART (`NYAN`) et les mots du DOGE (`fx.wow`) sont leur signature de base : ils restent.
- **Le moteur de rendu des traînées pop** (`code/rendu/trainees-1.js`, `trainees-2.js`) : il n'est plus appelé (il ne se bâtit qu'à la première traînée pop portée, coût nul),
  mais ces deux fichiers portent aussi les billets en cubes du menu ciel (`tcBilletMesh`, `tcPool`), l'arc-en-ciel du chat et les crochets de banc. Même usage que pour
  MENTHE / PLUIE DE BLOCS / 88 MPH le 18/10 : « leurs émetteurs restent, sans traînée qui les appelle ».
- **Le code des rayons** (`interface/boutique-trainee.js`, la partie traînées de `boutique-classique.js`, leur CSS), l'aperçu au garage, les gestes d'achat : plus atteignables, laissés en place.
- **Les textes** `I18N` des traînées (clés mortes, jamais affichées) et les photos `assets/boutique/trainees/*.jpg` (184 Ko).
- `sw.js` et `index.html` : pas commités sur cette branche (règle du chantier). À la livraison : `cashcar-vNNN` +1.

## Effets de bord à connaître

- Qui avait réussi `tr5` / `tr10` / `trall` sans toucher la prime (3 000 / 10 000 / 50 000) ne peut plus la récupérer tant que les traînées sont retirées.
- `ecoDebutPrix` (« la première chose qui s'achète ») : la moins chère était ROSE NÉON (40 000) ; c'est maintenant le moins cher du reste (caisses, ailes).
- Les pastilles « + TRAÎNÉE ARC-EN-CIEL INCLUSE » du chat existent encore dans le code, mais le chat n'est plus en vente : elles ne s'affichent pas.
- Compte des missions : 70 → 67 (les trois collections en moins).

## Vérifié au banc (Chrome sans fenêtre, muet, téléphone émulé 844×390)

Deux sauvegardes : NEUVE, et une qui POSSÈDE cinq traînées et porte HYPERESPACE (+ `tr5` et `eng30` réussies non réclamées).
Pour chacune : démarrage, boutique ouverte (5 onglets : voitures, achat, peintures, ailes, figures ; chaque rayon parcouru, 0 carte de traînée),
inventaire (4 onglets, chacun parcouru), une course au pilote auto, une mort, l'écran de série (jour 5 = 2 jetons). 0 exception, `__loopErr` et `__banqErr` vides.
Gardes : `garde-demarrage`, `garde-allege`, `garde-charte` OK.

## Pas vérifié

- Sur un vrai iPhone (aucun build fait).
- Le pass (`?pass=1`) à l'écran.
- La mise en page de l'ordinateur (cadre PC) de la boutique à 5 onglets : vue seulement en téléphone couché.
- L'anglais.

## Questions pour Sacha

1. **Remboursement** : rend-on l'argent des traînées achetées (prix du tableau) ? Rien n'est remboursé pour l'instant, et les joueurs les retrouvent si on les remet.
2. **FOUDRE DIVINE** : la mission du palier 30 paie 50 000 à la place. Bon montant ?
3. **Le chat et le DOGE** gardent leur arc-en-ciel et leurs mots (c'est leur effet de base). On les garde ?
4. **Le moteur de rendu** des traînées reste dans le code, éteint. Veux-tu qu'on le supprime vraiment (plus long, et plus dur à remettre) ?
5. Les primes des missions « COLLECTE … TRAÎNÉES » non réclamées : on les verse d'office ?
