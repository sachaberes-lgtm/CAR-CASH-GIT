# ACHATS EN VRAI ARGENT DANS L'APP — ce que Sacha doit faire (07/11/2026)

Branche `boutique-affichage` (locale : rien n'est poussé, rien n'est envoyé à Apple). Le plan et les choix sont dans
`docs/superpowers/specs/2026-11-06-achats-app-store-design.md` (la section 11 dit ce qui est vérifié et ce qui ne l'est pas).

## a. Ce qui est fait (en 8 lignes)
1. Le jeu connaît ses **74 produits** : 10 caisses premium (dont LE REQUIN, revenu en boutique) + 64 peintures. Pas de palette. Tous « non consommables » (à toi pour toujours).
2. ACHETER dans l'app passe par Apple (StoreKit 2) : l'objet n'est donné que si Apple a encaissé ; annulé ou « en attente » ne donnent rien.
3. Le bouton **RESTAURER MES ACHATS** de la page ACHAT rend les achats après une réinstallation ; au démarrage, l'app relit aussi ses achats sans fête.
4. Le prix affiché dans l'app est celui d'Apple (dans la monnaie du joueur) ; en secours, celui du jeu.
5. La page ACHAT, cachée jusqu'ici dans l'app, revient (uniquement quand le plugin d'achat est là) ; le site web ne change pas.
6. Le plugin Swift `Achats.swift`, le fichier de test `Produits.storekit`, le scheme Xcode `App` et la liste `app-ios/outils/produits.csv` sont prêts.
7. Les tests automatiques passent (voir le rapport `.superpowers/sdd/2026-11-06-achats-app-store/task-6-report.md`), mais **aucun vrai achat n'a été fait**.
8. L'ancienne fiche disait « aucun achat intégré » : les textes (FR et EN) sont mis à jour dans `app-ios/fiche/`.

## b. CE QUE SACHA DOIT FAIRE (App Store Connect, compte développeur)
1. **Signer le contrat « Apps payantes »** (Accords, fiscalité et banque) et remplir les coordonnées bancaires et fiscales. Sans lui, Apple refuse de vendre.
2. **Créer les 74 produits** : App Store Connect › ton app CASH CAR › Monétisation › Achats intégrés › « + », type **Non consommable**. Le fichier `app-ios/outils/produits.csv` donne, une ligne par produit : `id,nom,type,prix_eur`. Recopie **l'identifiant exact** (ex. `cashcar.car.requin`, `cashcar.peinture.bolide`) comme « ID de produit » : une faute et l'app ne trouve pas le produit. Le nom du CSV sert de nom de référence et de nom affiché (ajoute une courte description FR et EN). Laisse « Partage familial » désactivé. Le nombre de peintures grandit quand le jeu en ajoute (74 produits au 07/11, v1302) : `produits.csv` fait foi ; si le jeu change, `node app-ios/outils/produits-store.mjs --verifier` dit s'il faut le refaire (sans `--verifier` il le réécrit).
3. **Vérifier les prix.** Apple impose ses paliers ; les prix du jeu n'en sont peut-être pas. Prends le palier le plus proche (le jeu affichera de toute façon le prix d'Apple) :
   - **LA PIZZA EXPRESS, 161,00 €** (`cashcar.car.b_pizza`) : très probablement hors palier ;
   - **CHAT POP-TART, 4,20 €** (`cashcar.car.poptart`) ;
   - les **7 caisses à 1,61 €** : LA FÉLINE, L'ÉTERNELLE, LE BLINDÉ NOIR, LE MUR DU SON, LE DRAGON D'OR, SQUALE, KELLY CHERRY ;
   - les peintures à **1 €** (43), **2 €** (15) et **3 €** (6) : à confirmer (les paliers d'Apple tournent souvent autour de 0,99 / 1,99 / 2,99) ;
   - LE REQUIN, 9,99 € : en général un palier valable.
4. **Mettre la fiche à jour** (les textes sont prêts dans `app-ios/fiche/FICHE-APP-STORE.md`) :
   - **Achats intégrés = Oui** dans la classification d'âge ; « caisses » = achat direct d'une voiture connue, **jamais de tirage aléatoire** : à répondre « Non » aux boîtes à butin ;
   - **Confidentialité de l'app** : toujours « Non, nous ne collectons pas de données » (les paiements passent entièrement par Apple, le jeu ne reçoit ni nom ni moyen de paiement) ;
   - **Notes du testeur** : le texte prêt (section 6 de la fiche) explique les achats et où trouver RESTAURER ;
   - la page de confidentialité du site (`pages-app/confidentialite.html` sur `main`) doit recevoir le même paragraphe « Achats intégrés » que `app-ios/fiche/confidentialite.html` : à recopier sur ton OUI, puis pousser `main`.
5. **Joindre les produits à la version soumise** (build 2 ou suivant : les achats exigent un nouveau binaire, les mises à jour en direct ne suffisent pas) et fournir **une capture d'écran par type d'achat** (une pour une caisse, une pour une peinture), demandée avec chaque produit.
6. Le **bloquant du point e** ci-dessous doit être tranché avant toute archive.

## c. COMMENT TESTER (au simulateur, sans argent)
1. Sur le Mac : `git checkout boutique-affichage`, puis `cd app-ios && npm run sync` (fabrique `www/` avec le pont d'achats).
2. Ouvrir le projet (`npm run ouvrir`), choisir le scheme **App** et un iPhone 17 Pro, puis **Xcode ▶**. Seul ▶ applique le fichier `Produits.storekit` : un simple `simctl launch` ne le fait pas.
3. Si les prix d'Apple n'apparaissent pas (le jeu garde alors ses prix en €) : le chemin du fichier n'a pas été retrouvé par le scheme. Dans Xcode : Product › Scheme › Edit Scheme › Run › Options › **StoreKit Configuration** › choisir `Produits.storekit` à la main (le fichier est dans `app-ios/ios/App/`).
4. Liste de contrôle :
   - [ ] accueil › tuile ACHAT : la page s'ouvre, les prix sont en euros, RESTAURER MES ACHATS est là ;
   - [ ] **acheter une caisse** : la feuille d'achat d'Apple s'ouvre, valider ; la caisse devient « A TOI », fête, elle est dans le garage ;
   - [ ] **annuler un achat** (fermer la feuille) : rien n'est donné, le bouton ACHETER redevient utilisable ;
   - [ ] **acheter une peinture** (garage › peintures, ou la page ACHAT) : elle est équipable ;
   - [ ] quitter l'app puis la rouvrir : les achats sont toujours là ;
   - [ ] **désinstaller l'app puis la réinstaller** (▶ de nouveau), ouvrir ACHAT › **RESTAURER MES ACHATS** : les achats reviennent ;
   - [ ] Xcode › Debug › StoreKit › **Manage Transactions** (Transaction Manager) : activer « Ask to Buy » puis acheter : le jeu doit afficher « EN ATTENTE D'ACCORD » et ne rien donner ; approuver la demande dans le Transaction Manager : l'objet arrive ;
   - [ ] toujours dans le Transaction Manager : **rembourser** un achat : en v1.0 l'objet **reste** (choix fait, à revoir si abus) ;
   - [ ] en mode avion : l'app démarre et se joue normalement.
5. Puis **TestFlight avec un compte bac à sable** (App Store Connect › Utilisateurs et accès › Bac à sable) pour un vrai flux Apple : un achat, une restauration, un refus. C'est la seule façon de voir un vrai encaissement de test.

## d. CE QUI N'EST PAS VÉRIFIÉ ICI
- **Aucun achat n'a été exécuté**, ni au simulateur ni sur un téléphone. L'encaissement réel, la validation par Apple, Ask to Buy, le remboursement, la restauration après réinstallation sont raisonnés dans le code et testés seulement avec de FAUX ponts et un faux plugin.
- Que Xcode retrouve `Produits.storekit` grâce au scheme (le chemin relatif `../Produits.storekit` n'est pas testable en ligne de commande) ; le repli à la main est au point c.3.
- Le comportement réel de `Transaction.updates` (achat validé hors de l'app, Ask to Buy, remboursement).
- Les paliers de prix d'Apple (point b.3).
- Le dossier `app-ios/www/` de cette branche vient de `ios-capacitor` : il ne contient pas encore le pont d'achats. Il est refait par `npm run sync` (point c.1) ; on ne l'a pas lancé ici.

## e. BLOQUANT CONNU, ANTÉRIEUR À CE TRAVAIL : l'app ne se construit pas
`app-ios/ios/App/App/JeuViewController.swift`, ligne 36 : `override var prefersHomeIndicatorAutoHidden: Bool { true }` **ne compile pas** avec Capacitor 8.5.3 (la propriété y est déclarée `public`, pas `open`, donc interdite à surcharger depuis l'app). Elle vient du correctif IOS-21 du 05/11, « à vérifier le jour Mac ». Tant que ce n'est pas tranché, ni ▶ ni l'archive ne marchent. Deux issues, qui changent le comportement de la barre d'accueil de l'iPhone, donc **à toi de décider** :
- supprimer la ligne et laisser le module SystemBars de Capacitor 8 gérer la barre (selon sa configuration) ;
- ou appeler `setNeedsUpdateOfHomeIndicatorAutoHidden` avec la configuration voulue.

Preuve : avec cette seule ligne mise en commentaire pendant l'essai, la cible compile (simulateur, 0 erreur et 0 avertissement dans `Achats.swift`). La ligne n'a pas été touchée dans les commits.

## f. POINTS À SAVOIR (choix faits ou défauts connus, rien de grave pour v1.0)
- **RESTAURER** dit « AUCUN ACHAT À RESTAURER » même si la restauration a **échoué** (réseau, Apple indisponible) : le message est trompeur dans ce cas. À corriger avant le gros public (Apple teste RESTAURER).
- Si un achat est validé **en pleine course** (accord des parents arrivé tard, achat fait sur un autre appareil), la fête plein écran s'affiche par-dessus la course.
- **Prix d'Apple pas partout** (relevé dans le code, pas vérifié à l'écran) : les cartes des rayons de la boutique 3D (`boutique-peinture.js`, et `boutique-aile.js`, `boutique-trainee.js`, `boutique-classique.js` pour les objets qui auraient un prix) lisent encore le prix du jeu en euros ; la fenêtre d'achat, la page ACHAT et le garage affichent, eux, le prix d'Apple. Apple veut que le prix montré soit le prix débité : à brancher sur `prixTxt` avant l'envoi si ces rayons vendent des peintures en € dans l'app.
- Un **remboursement** Apple ne retire pas l'objet (choix de la v1.0).
- Le **code de sauvegarde** collé dans ENTRER UN CODE est accepté tel quel en v1.0 (décision R3) : un code fabriqué à la main pourrait donner un objet payant sans l'acheter. À durcir plus tard (ignorer les objets en € à l'import).
- Le plugin ne marque une transaction « terminée » qu'après l'avoir remise au jeu ; une transaction mal vérifiée est rejouée au lancement suivant (voulu).
- Si une peinture est gagnée par mission, elle n'est plus vendue en € (elle perd son prix) : voulu.
- Xcode proposera de « mettre à niveau » le scheme `App` (version 0920) : accepter.
