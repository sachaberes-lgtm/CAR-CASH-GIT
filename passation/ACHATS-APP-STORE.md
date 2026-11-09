# ACHATS EN VRAI ARGENT DANS L'APP — ce que Sacha doit faire (07/11/2026)

Branche `boutique-affichage` (locale : rien n'est poussé, rien n'est envoyé à Apple). Le plan et les choix sont dans
`docs/superpowers/specs/2026-11-06-achats-app-store-design.md` (la section 11 dit ce qui est vérifié et ce qui ne l'est pas).

## a. Ce qui est fait (en 8 lignes)
1. Le jeu connaît ses **38 produits** (liste du 09/11, elle change quand `main` change la boutique : toujours relancer `produits-store.mjs --verifier`) : 9 caisses premium + 29 peintures (depuis le 09/11 une peinture à défi ne s'achète plus : décision de Léo sur main). Pas de palette. Tous « non consommables » (à toi pour toujours).
2. ACHETER dans l'app passe par Apple (StoreKit 2) : l'objet n'est donné que si Apple a encaissé ; annulé ou « en attente » ne donnent rien.
3. Le bouton **RESTAURER MES ACHATS** de la page ACHAT rend les achats après une réinstallation ; au démarrage, l'app relit aussi ses achats sans fête.
4. Partout où un prix en euros s'affiche (cartes et boîtes, page ACHAT, fenêtre d'achat, garage, rayon PEINTURES de la boutique 3D : loupe, étiquette lue et prix de chaque rareté), c'est le prix d'Apple dans la monnaie du joueur **dès que la réponse d'Apple est arrivée** ; avant (ou si elle échoue, ou hors de l'app), le jeu montre son propre prix en €, par secours. Les prix sont redemandés à l'ouverture de la page ACHAT tant qu'Apple n'a rien répondu.
5. La page ACHAT, cachée jusqu'ici dans l'app, revient (uniquement quand le plugin d'achat est là) ; le site web ne change pas.
6. Le plugin Swift `Achats.swift`, le fichier de test `Produits.storekit`, le scheme Xcode `App` et la liste `app-ios/outils/produits.csv` sont prêts.
7. Les tests automatiques passent (voir le rapport `.superpowers/sdd/2026-11-06-achats-app-store/task-6-report.md`), mais **aucun vrai achat n'a été fait**.
8. L'ancienne fiche disait « aucun achat intégré » : les textes (FR et EN) sont mis à jour dans `app-ios/fiche/`.

## b. CE QUE SACHA DOIT FAIRE (App Store Connect, compte développeur)
1. **Signer le contrat « Apps payantes »** (Accords, fiscalité et banque) et remplir les coordonnées bancaires et fiscales. Sans lui, Apple refuse de vendre.
2. **Créer les 38 produits** : App Store Connect › ton app CASH CAR › Monétisation › Achats intégrés › « + », type **Non consommable**. Le fichier `app-ios/outils/produits.csv` donne, une ligne par produit : `id,nom,type,prix_eur`. Recopie **l'identifiant exact** (ex. `cashcar.car.poptart`, `cashcar.peinture.lagon`) comme « ID de produit » : une faute et l'app ne trouve pas le produit. Le nom du CSV sert de nom de référence et de nom affiché (ajoute une courte description FR et EN). Laisse « Partage familial » désactivé. Le nombre de peintures grandit quand le jeu en ajoute (92 produits au 07/11, v1306) : `produits.csv` fait foi ; si le jeu change, `node app-ios/outils/produits-store.mjs --verifier` dit s'il faut le refaire (sans `--verifier` il le réécrit).
3. **Vérifier les prix.** Apple impose ses paliers ; les prix du jeu n'en sont peut-être pas. Prends le palier le plus proche (une fois la réponse d'Apple arrivée, le jeu affiche le prix d'Apple, pas celui du tableau) :
   - **LA PIZZA EXPRESS, 161,00 €** (`cashcar.car.b_pizza`) : très probablement hors palier ;
   - **CHAT POP-TART, 4,20 €** (`cashcar.car.poptart`) ;
   - les **7 caisses à 1,61 €** : LA FÉLINE, L'ÉTERNELLE, LE BLINDÉ NOIR, LE MUR DU SON, LE DRAGON D'OR, SQUALE, KELLY CHERRY ;
   - les peintures à **1 €** (14), **2 €** (10) et **3 €** (5) : à confirmer (les paliers d'Apple tournent souvent autour de 0,99 / 1,99 / 2,99) ;
4. **Mettre la fiche à jour** (les textes sont prêts dans `app-ios/fiche/FICHE-APP-STORE.md`) :
   - **Achats intégrés = Oui** dans la classification d'âge ; « caisses » = achat direct d'une voiture connue, **jamais de tirage aléatoire** : à répondre « Non » aux boîtes à butin ;
   - **Confidentialité de l'app** : toujours « Non, nous ne collectons pas de données » (les paiements passent entièrement par Apple, le jeu ne reçoit ni nom ni moyen de paiement) ;
   - **Notes du testeur** : le texte prêt (section 6 de la fiche) explique les achats et où trouver RESTAURER ;
   - la page de confidentialité du site (`pages-app/confidentialite.html` sur `main`) doit recevoir le même paragraphe « Achats intégrés » que `app-ios/fiche/confidentialite.html` : à recopier sur ton OUI, puis pousser `main`.
5. **Ne jamais renommer un produit vendu.** Le `shape` d'une caisse et l'`id` d'une peinture SONT l'identifiant chez Apple (`cashcar.car.<shape>`, `cashcar.peinture.<id>`) : un acheteur qui réinstalle retrouve ses achats par ces noms. La restauration cherche dans les tables du jeu (même si la caisse a quitté la boutique, n'est plus « premium », ou si la peinture est devenue une récompense de mission et a perdu son prix), mais un nom changé ou supprimé = un achat perdu. Une caisse à retirer : `{retire:1,…}` en gardant son `shape` dans la fiche ; ne pas supprimer de ligne.
6. **Joindre les produits à la version soumise** (build 2 ou suivant : les achats exigent un nouveau binaire, les mises à jour en direct ne suffisent pas) et fournir **une capture d'écran par type d'achat** (une pour une caisse, une pour une peinture), demandée avec chaque produit.
7. **Mises à jour en direct (`publier-maj.js`) : toujours `--natif-min <x.y.z>`**, la version du **premier binaire App Store qui contient le plugin Achats** (par exemple `--natif-min 1.1.0` si le build des achats part en 1.1.0). Sans lui, le script **refuse** de publier une édition qui contient `achats.js` (par défaut il viserait `MARKETING_VERSION` = 1.0.0, le build 1 sans plugin : ces iPhone recevraient une boutique en € qui ne peut rien vendre, puisque l'édition n'y convertit plus les euros en argent du jeu). La version du projet Xcode n'a pas été montée ici : c'est à toi de choisir le numéro du binaire avec les achats, puis de le passer à `--natif-min`.
8. Le point **e** (ligne de compilation, résolu le 08/11) : seulement à vérifier sur l'appareil : l'indicateur d'accueil doit rester effacé.

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
- Que Xcode retrouve `Produits.storekit` grâce au scheme (le chemin relatif `../Produits.storekit` n'est pas testable en ligne de commande) ; le repli à la main est au point c.3. Si Xcode réécrit lui-même le chemin relatif du scheme vers le fichier StoreKit (en l'ouvrant ou en proposant la mise à niveau), **accepte le chemin qu'il écrit** : c'est le bon, ne le remets pas à la main dans le fichier.
- Le comportement réel de `Transaction.updates` (achat validé hors de l'app, Ask to Buy, remboursement).
- Les paliers de prix d'Apple (point b.3).
- Le dossier `app-ios/www/` de cette branche vient de `ios-capacitor` : il ne contient pas encore le pont d'achats. Il est refait par `npm run sync` (point c.1) ; on ne l'a pas lancé ici.

## e. ~~BLOQUANT~~ RÉSOLU LE 08/11 : l'app se construisait mal à cause d'une ligne (corrigé)
`app-ios/ios/App/App/JeuViewController.swift`, ancienne ligne 36 : `override var prefersHomeIndicatorAutoHidden: Bool { true }` ne compilait pas avec Capacitor 8.5.3 (propriété `public`, pas `open`, donc non surchargeable depuis l'app ; elle venait du correctif IOS-21 du 05/11). **La ligne est supprimée** : sous Capacitor 8 le plugin SystemBars est intégré et lit `SystemBars.hidden:true` de `app-ios/capacitor.config.json`.
Preuve : `xcodebuild -scheme App -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build` → **BUILD SUCCEEDED**, 0 erreur et 0 avertissement dans `Achats.swift` et `JeuViewController.swift` (essai fait avec les fichiers générés `config.xml`, `capacitor.config.json`, `public/` et `node_modules` empruntés à `~/cash-car/ios-capacitor`, retirés après ; `npm run sync` n'a pas été lancé).
**À vérifier sur l'appareil au premier lancement : l'indicateur d'accueil (la barre en bas) doit rester effacé.** S'il réapparaît : appeler `setNeedsUpdateOfHomeIndicatorAutoHidden` dans `capacitorDidLoad()` avec la configuration voulue, ou rétablir une surcharge compatible.
Rappel pour la suite : quand le binaire avec les achats part en production, noter son numéro de version et le passer à `publier-maj.js --natif-min` pour toute mise à jour en direct (point b.7).

## f. POINTS À SAVOIR (choix faits ou défauts connus, rien de grave pour v1.0)
- **RESTAURER** distingue maintenant l'échec (« RESTAURATION IMPOSSIBLE, RÉESSAIE ») de « AUCUN ACHAT À RESTAURER » ; le démarrage, lui, reste silencieux en cas d'échec.
- Si un achat est validé **en pleine course** (accord des parents arrivé tard, achat fait sur un autre appareil), la fête plein écran s'affiche par-dessus la course.
- **Prix : ce qui reste en secours.** Le prix d'Apple est utilisé dès que sa réponse est arrivée ; le prix du jeu en € reste affiché seulement (1) avant la réponse d'Apple (démarrage, réseau coupé, produit pas encore créé dans App Store Connect), (2) pour un produit qu'Apple ne renvoie pas, (3) sur le web (pas de plugin). Deux cas particuliers : le **prix d'une rareté de peintures** (intertitre du nuancier) prend le prix d'Apple de la première peinture à vendre de cette rareté — hypothèse : toutes les peintures d'une même rareté sont dans le **même palier de prix** chez Apple (1 € / 1 € / 2 € / 3 € dans le jeu) ; si tu les mets dans des paliers différents, l'intertitre dira le prix de la première seulement, mais chaque loupe, étiquette lue, fenêtre d'achat et bouton dit son propre prix. Les écrans déjà dessinés sont redessinés quand les prix arrivent seulement pour la page ACHAT ouverte ; les autres reprennent les prix à leur prochain rendu. Les rayons AILES, TRAÎNÉES et la boutique classique ne vendent **rien en euros** (leurs prix sont en argent du jeu) : aucun prix d'Apple à y brancher.
- Un **remboursement** Apple ne retire pas l'objet (choix de la v1.0).
- Le **code de sauvegarde** collé dans ENTRER UN CODE est accepté tel quel en v1.0 (décision R3) : un code fabriqué à la main pourrait donner un objet payant sans l'acheter. À durcir plus tard (ignorer les objets en € à l'import).
- Le plugin ne marque une transaction « terminée » qu'après l'avoir remise au jeu ; une transaction mal vérifiée est rejouée au lancement suivant (voulu).
- Si une peinture est gagnée par mission, elle n'est plus vendue en € (elle perd son prix) : voulu.
- Xcode proposera de « mettre à niveau » le scheme `App` (version 0920) : accepter.
