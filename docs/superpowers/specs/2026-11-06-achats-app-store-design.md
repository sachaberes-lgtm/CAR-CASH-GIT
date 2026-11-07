# Achats intégrés App Store (StoreKit 2) — spec de design

Date : 2026-11-06 · Auteur : Claude (Sonnet 5.5) pour Sacha · Statut : **réalisé en local le 07/11/2026, rien de poussé** (voir §11 « Réalisé » ; l'encaissement réel n'est pas vérifié)

## 1. Objectif

Que les achats en vrai argent marchent dans l'app iOS (CASH CAR, `app-ios/`, Capacitor 8) dès sa sortie sur l'App Store :
la boutique en € redevient visible dans l'app, ACHETER passe par Apple, l'objet n'est donné que lorsqu'Apple a encaissé,
et RESTAURER MES ACHATS rend les achats après une réinstallation ou sur un autre appareil.

Réussite =
- au simulateur, avec un fichier `.storekit` : un achat donne l'objet, un achat annulé ne donne rien, une restauration rend tout ;
- en TestFlight (compte bac à sable) : un vrai flux Apple de bout en bout ;
- la fiche App Store et l'app disent la même chose (achats intégrés présents, pas de réseau ajouté).

## 2. Ce qui existe déjà (vérifié dans le code, origin/main v1221)

| Élément | Où | État |
|---|---|---|
| « La porte » `shopPaye(i)` | `code/economie/boutique.js:12` | rejette toujours `Error('storekit')` : c'est LA seule porte à brancher (commentaire d'origine) |
| `shopDonne(i)` / `habDonne(cat,id)` | `boutique.js:13`, `:642` | donnent l'objet dans la sauvegarde, sans toucher à la banque du jeu |
| `habPaye(cat,i,bt)` | `boutique.js:643` | appelle `shopPaye(cat+':'+d.id)` puis `habDonne` ; message « L'achat est indisponible… » si refus |
| Pack LA PALETTE (ancien) | `boutique.js:277` | `PALETTE_PACK` : ancien pack, **plus vendu** ; `palDonne` retiré ; aucun produit `cashcar.palette40` |
| Prix en € | `deblocage.js` (`k:'premium', eur`), `PEINT_EUR` (`boutique.js:354`) | présents dans le jeu |
| Les coupes de l'app | `app-ios/preparer-www.js` l. ~100-180 | convertit les € en argent du jeu (60 000 $ par €), masque OFFRES / tuile cadeau, vide la palette |
| Plugin natif local | `JeuViewController.swift` | `bridge?.registerPluginInstance(GardeNavigation())` : le modèle à suivre |
| Colle JS | `app-ios/natif/natif.js` | inerte hors de l'app ; c'est là qu'on injecte l'API d'achat |
| Fiche | `passation/regard-apple.md`, `passation/APP-STORE.md` | dit « Achats intégrés : Aucun » et « aucun réseau » : à corriger |

## 3. Périmètre : les produits (choix de Sacha : « tout ce qui est déjà prévu »)

Tous **non consommables** (« à toi pour toujours », comme le dit déjà le jeu).

| Famille | Produits | Prix prévus dans le jeu | Identifiant |
|---|---|---|---|
| Caisses premium | **10 en vente** (règle : `k:'premium'` et non retirée ; LE REQUIN est revenu en boutique sur main le 07/11, décision R7) : CHAT POP-TART 4,20 € · REQUIN 9,99 € · LA PIZZA EXPRESS 161,00 € · LA FÉLINE · L'ÉTERNELLE · LE BLINDÉ NOIR · LE MUR DU SON · LE DRAGON D'OR · SQUALE · KELLY CHERRY (les sept derniers à 1,61 €) | voir à gauche | `cashcar.car.<forme>` (la `shape` de la fiche, stable ; jamais l'index) |
| Caisses « retirées » | celles que `carRetiree(i)` donne vrai (FORMULE OR, LE MANS 24, EL PATRON…) : **pas en vente** | — | aucun produit |
| Peintures | toutes celles dont `COSM.peinture[i].eur` existe, **défi ou non** (`habPaye` n'exige que `d.eur` ; les peintures gagnées par mission perdent leur `eur`, `boutique.js:633-639`) ; 61 au total (40 à 1 €, 15 à 2 €, 6 à 3 €) ; la peinture « usine » est exclue | 1 € commune/rare · 2 € épique · 3 € légendaire | `cashcar.peinture.<id>` (déjà prévu par le code) |

Au total **71 produits** (10 caisses + 61 peintures), **aucune palette**. La liste exacte n'est **pas écrite à la main** : un script (`app-ios/outils/produits-store.mjs`) la lit dans le code du jeu et produit
(a) le fichier `Produits.storekit` pour le simulateur, (b) un tableau `produits.csv` pour que Sacha crée les produits dans App Store Connect. Une seule source.

## 4. Architecture

```
jeu (boutique.js)  ──shopPaye(id)/habPaye──▶  window.ccAchat  (natif.js)
                                                   │ Capacitor.Plugins.Achats
                                                   ▼
                                         Achats.swift (StoreKit 2, sur l'appareil)
                                                   │
                                                   ▼
                                               App Store
```

Aucun serveur, aucun SDK tiers, aucune requête réseau du jeu : StoreKit est le système d'iOS.
Les reçus se vérifient sur l'appareil (`VerificationResult.verified`), suffisant pour des objets cosmétiques sans compte ni serveur.

### 4.1 `Achats.swift` (nouveau, `ios/App/App/`, enregistré comme `GardeNavigation`)
Plugin `CAPPlugin, CAPBridgedPlugin`, jsName `Achats`. Méthodes :
- `produits({ids})` → `[{id, prix, devise, nom}]` : `Product.products(for:)`, prix **localisé** (`displayPrice`).
- `acheter({id})` → `Product.purchase()` ; résultat `{etat:'ok'|'annule'|'attente'}` ; une transaction non vérifiée = erreur ; `transaction.finish()` seulement après remise à JS.
- `possedes()` → ids de `Transaction.currentEntitlements` (vérifiés) : sert au démarrage et à la restauration.
- `restaurer()` → `AppStore.sync()` puis `possedes()`.
- Écoute de `Transaction.updates` (achat validé hors de l'app : « Ask to Buy » des parents, remboursement) → événement JS `achatRecu`.

### 4.2 `natif.js` — `window.ccAchat` (nouvelle partie 8)
Pont mince et inerte hors de l'app : `ccAchat.pret` (booléen), `produits()`, `payer(id)` (promesse), `restaurer()`, `possedes()`, `onRecu(cb)`.
Si le plugin manque ou StoreKit n'est pas disponible : `payer` rejette `'indisponible'` — jamais un don silencieux.

### 4.3 Le jeu (`code/economie/boutique.js` + `code/interface/…`)
- `shopPaye(id)` : si `window.ccAchat` existe → `ccAchat.payer(produitDe(id))`, **promesse tenue seulement sur `ok`** ; sinon le rejet actuel (web : rien ne change).
  `produitDe(id)` : `cashcar.car.<shape>` pour un index, `cashcar.peinture.<id>` pour `peinture:<id>`. Pas de produit palette (pack plus vendu).
- Au démarrage de l'app et à RESTAURER : `possedes()` → pour chaque produit possédé, `shopDonne` / `habDonne` s'il manque (**idempotent**, sans fête ni écrasement de l'équipement du joueur).
- Prix affiché = prix StoreKit (localisé) quand il est connu ; sinon repli sur `eur` du jeu.
- Bouton **RESTAURER MES ACHATS** (exigé par Apple) : il existe déjà sur la page ACHAT (`code/page/ecrans-menus.html:124`, `data-m="shopRestore"`), où il n'affiche aujourd'hui qu'un message « AUCUN ACHAT À RESTAURER » (`code/moteur/mobile-tactile.js:896`) ; on le branche à `ccAchat.restaurer()`. Aucune ligne ajoutée dans RÉGLAGES.
- Messages d'erreur existants (« L'achat est indisponible pour le moment. ») + un message « EN ATTENTE D'ACCORD » pour `attente` (Ask to Buy).

### 4.4 `app-ios/preparer-www.js`
Retirer les coupes qui transforment le vrai argent : conversion `CAR_UNLOCK`, `PEINT_EUR → $`, prix du pack, masquage OFFRES / tuile cadeau (`#mShop`, `#bdShop`, `data-m="shop"`). La coupe « palette → SECRÈTE » peut rester : sans objet, le pack n'est plus vendu.
**Gardées** : ENTRER UN CODE masqué (règle 3.1.1 : pas de déblocage par code), pubs maison, panneau RÉGLAGES d'ordinateur, mode TEST.
Les « témoins » (une coupe dont la cible disparaît fait échouer la fabrication) restent, adaptés aux coupes retirées.

## 5. Flux de données

Achat : toucher ACHETER → fenêtre d'achat du jeu → `shopPaye` → feuille Apple (Face ID) → transaction vérifiée → `ok` → **seulement alors** `shopDonne` + sauvegarde + fête → `transaction.finish()`.
Annulation / échec : rien n'est donné, message, aucune sauvegarde modifiée.
Réinstallation : démarrage → `possedes()` → l'inventaire est reconstruit.
Argent du jeu : jamais touché par un achat en €.

## 6. Cas limites et décisions
- **Remboursement Apple** (`revocationDate`) : v1.0 = l'objet reste (pas de retrait automatique) ; à revoir si abus.
- **Plusieurs appareils** : la sauvegarde du jeu est locale ; la restauration réapplique les droits Apple, pas la progression.
- **Coupure réseau** pendant l'achat : StoreKit reprend la transaction (`Transaction.updates`) à la relance.
- **Double touche** : `habPaye.on` existant + verrou côté Swift (un seul achat à la fois).
- **Version web / Vercel / portails** : aucun changement de comportement (`window.ccAchat` absent).
- **Sauvegarde cousin / export** : un objet acheté se rend par restauration. **En v1.0**, un `owned` importé par code de sauvegarde vaut possession (import accepté tel quel, voir §9 à rediscuter avec Sacha) ; à revoir avant toute suite, pour ne pas en faire un moyen de gratuit.

## 7. Tests
1. `node app-ios/outils/produits-store.mjs --verifier` : tous les ids sont uniques, valides, le `.storekit` correspond au jeu.
2. Banc navigateur : `ccAchat` simulé (succès / annulation / attente / indisponible) — le jeu ne donne rien sur refus, donne une fois sur succès (idempotent).
3. **Simulateur iOS** avec `Produits.storekit` branché au schéma (Debug seulement) : un achat par famille (caisse, peinture), annulation, restauration après désinstallation.
4. `sh garde-burnout.sh` OK (boutique 3D intouchable), `assembler.cjs --verifier`, `sw.js` +1 si `code/` change.
5. **TestFlight bac à sable** (par Sacha) : un vrai achat, une restauration, un refus.
Non vérifiable ici : l'encaissement réel et la validation par Apple.

## 8. À faire par Sacha (App Store Connect / compte développeur)
- Contrat « Apps payantes » signé + coordonnées bancaires et fiscales (indispensable pour vendre).
- Créer les produits (le `produits.csv` donne identifiants, noms, prix) et les joindre à la version 1.0 soumise.
- **Prix** : 1,61 €, 4,20 €, 161,00 € et 1 € / 2 € / 3 € ne sont peut-être pas des paliers de prix Apple ; l'App Store Connect le dira. Sinon : palier le plus proche (le jeu affiche de toute façon le prix d'Apple).
- Fiche : « Achats intégrés » = Oui ; réponses de classification d'âge (« caisses » = achat direct d'une voiture connue, jamais de tirage aléatoire : à garder dit tel quel) ; notes du testeur ; confidentialité (aucune donnée collectée par l'app elle-même) ; page `confidentialite` à rejouer si besoin.
- Une capture d'écran de la boutique pour chaque type d'achat (exigée avec les produits).

## 9. Questions (réponses)
1. **Tranché :** les peintures **à défi** (`def`) sont vendues en € comme les autres ; seules les peintures gagnées uniquement par mission (qui perdent leur `eur`) ne le sont pas.
2. **Tranché pour v1.0 : import accepté tel quel.** ENTRER UN CODE restaure toujours une sauvegarde dans l'app (`preparer-www.js:152`) ; à rediscuter avec Sacha.
3. **Tranché :** oui, les achats entrent dans le **build 2** ; la capacité native exige un nouveau binaire (les mises à jour en direct ne suffisent pas).

## 10. Hors périmètre
Serveur de reçus, RevenueCat ou autre SDK, abonnements, consommables, packs d'argent du jeu en €, codes promo, pubs.

## 11. Réalisé (07/11/2026, branche `boutique-affichage`, tout en local, rien de poussé)

**Ce qui a été construit**
- Le jeu : `code/economie/achats-store.js` (catalogue des 71 produits, la porte `shopPaye` branchée sur l'app, la synchro du démarrage, RESTAURER, les prix d'Apple), les appels dans `boutique.js`, `mobile-tactile.js`, `desktop-banc.js` et les écrans qui affichent un prix (`prixTxt`). Le drapeau `ACHAT_EUR` (`icones-fenetre.js`) s'allume dans l'app quand le pont existe ; sur le web rien ne change.
- Le pont JavaScript : `app-ios/natif/achats.js` (`window.ccAchat`), copié et chargé par `app-ios/preparer-www.js`, dont les coupes qui transformaient les € en argent du jeu sont retirées.
- Le plugin Swift : `app-ios/ios/App/App/Achats.swift` (StoreKit 2), enregistré dans `JeuViewController.swift` et `project.pbxproj`.
- Pour tester et créer les produits : `app-ios/ios/App/Produits.storekit`, le scheme partagé `App.xcscheme`, `app-ios/outils/produits.csv` et le générateur `app-ios/outils/produits-store.mjs` ; mode d'emploi dans `app-ios/LISEZ-MOI.md`.
- Les bancs : `app-ios/outils/achats-test.cjs`, `outils/banc-achats/{produits,paye,app}.mjs`.
- Les passations pour Sacha : `passation/ACHATS-APP-STORE.md` (la liste à faire), `passation/APP-STORE.md`, `passation/regard-apple.md`, et les textes de `app-ios/fiche/`.

**Ce qui a été vérifié, et comment**
- Le catalogue : 10 caisses + 61 peintures, ids uniques et valides, accord avec `Produits.storekit` et `produits.csv` (`produits-store.mjs --verifier`, bancs `produits.mjs`).
- La logique d'achat dans le jeu, avec un FAUX pont (navigateur, `paye.mjs`) : seul `ok` donne l'objet ; annulé et en attente ne donnent rien ; un second achat en vol est refusé ; un doublon ne rejoue pas la fête ; RESTAURER et la synchro du démarrage rendent les achats sans fête ; les prix d'Apple remplacent ceux du jeu.
- Le pont `achats.js` contre un faux plugin (`achats-test.cjs`) et le contenu de la page de l'app fabriquée (`--essai`) : drapeau `ACHAT_EUR` allumé avec le pont, éteint sans, inchangé sur le web (`app.mjs`).
- Le plugin Swift **compile** (Xcode, simulateur, Capacitor 8.5.3, 0 erreur et 0 avertissement dans `Achats.swift`), mais seulement avec une ligne préexistante de `JeuViewController.swift` mise de côté (voir `passation/ACHATS-APP-STORE.md`, § bloquant).
- Les gardes du dépôt (assembleur, burn-out, charte, allègement, démarrage) et l'intégration locale avec `origin/main` et `origin/ios-capacitor` : voir `.superpowers/sdd/2026-11-06-achats-app-store/task-6-report.md`.

**Ce qui n'est PAS vérifié**
- Aucun achat n'a été exécuté, ni au simulateur ni sur un téléphone : l'encaissement réel, la validation par Apple, Ask to Buy, les remboursements, la restauration après réinstallation.
- Que Xcode retrouve `Produits.storekit` par le scheme (chemin relatif non testable en ligne de commande ; repli à la main documenté).
- Le comportement réel de `Transaction.updates` (raisonné, pas exécuté).
- Les prix : les paliers de prix d'Apple décideront (1,61 €, 4,20 €, 161,00 €, 1/2/3 €).
- L'app ne se construit pas en l'état à cause du bloquant préexistant de `JeuViewController.swift`.
