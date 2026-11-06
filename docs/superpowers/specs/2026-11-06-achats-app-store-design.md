# Achats intégrés App Store (StoreKit 2) — spec de design

Date : 2026-11-06 · Auteur : Claude (Sonnet 5.5) pour Sacha · Statut : **à relire par Sacha** (aucun code écrit)

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
| Pack LA PALETTE | `boutique.js:277` | `PALETTE_PACK`, produit prévu `cashcar.palette40`, 0,99 € |
| Prix en € | `deblocage.js` (`k:'premium', eur`), `PEINT_EUR` (`boutique.js:354`) | présents dans le jeu |
| Les coupes de l'app | `app-ios/preparer-www.js` l. ~100-180 | convertit les € en argent du jeu (60 000 $ par €), masque OFFRES / tuile cadeau, vide la palette |
| Plugin natif local | `JeuViewController.swift` | `bridge?.registerPluginInstance(GardeNavigation())` : le modèle à suivre |
| Colle JS | `app-ios/natif/natif.js` | inerte hors de l'app ; c'est là qu'on injecte l'API d'achat |
| Fiche | `passation/regard-apple.md`, `passation/APP-STORE.md` | dit « Achats intégrés : Aucun » et « aucun réseau » : à corriger |

## 3. Périmètre : les produits (choix de Sacha : « tout ce qui est déjà prévu »)

Tous **non consommables** (« à toi pour toujours », comme le dit déjà le jeu).

| Famille | Produits | Prix prévus dans le jeu | Identifiant |
|---|---|---|---|
| Caisses premium | **9 en vente** (index CAR_UNLOCK) : 9 CHAT POP-TART 4,20 € · 19 LA PIZZA EXPRESS 161,00 € · 54 LA FÉLINE · 56 L'ÉTERNELLE · 57 LE TRÔNE CENTRAL · 59 LE BLINDÉ NOIR · 60 LE MUR DU SON · 61 LE DRAGON D'OR · 70 SQUALE (les sept derniers à 1,61 €) | voir à gauche | `cashcar.car.<forme>` (la `shape` de la fiche, stable ; jamais l'index) |
| Caisses « retirées » | index 10, 12, 13, 14 (REQUIN, FORMULE OR, LE MANS 24, EL PATRON) : lignes `retire`, **pas en vente** | — | aucun produit |
| Peintures | celles de `PEINT_CAT` qui ont un prix et ne se gagnent pas par mission (`eur` présent, pas de `mis2`) ; jusqu'à 64 | 1 € commune/rare · 2 € épique · 3 € légendaire | `cashcar.peinture.<id>` (déjà prévu par le code) |
| Pack LA PALETTE | 1 produit (communes + rares) | 0,99 € | `cashcar.palette40` (déjà prévu) |

La liste exacte des produits n'est **pas écrite à la main** : un script (`app-ios/outils/produits-store.js`) la lit dans le code du jeu et produit
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
  `produitDe(id)` : `cashcar.car.<shape>` pour un index, `cashcar.peinture.<id>` pour `peinture:<id>`, `cashcar.palette40` pour `palette`.
- Au démarrage de l'app et à RESTAURER : `possedes()` → pour chaque produit possédé, `shopDonne` / `habDonne` / `palDonne` s'il manque (**idempotent**, sans fête ni écrasement de l'équipement du joueur).
- Prix affiché = prix StoreKit (localisé) quand il est connu ; sinon repli sur `eur` du jeu.
- Bouton **RESTAURER MES ACHATS** (exigé par Apple) sur la page OFFRES et dans RÉGLAGES (les chaînes existent déjà, mortes).
- Messages d'erreur existants (« L'achat est indisponible pour le moment. ») + un message « EN ATTENTE D'ACCORD » pour `attente` (Ask to Buy).

### 4.4 `app-ios/preparer-www.js`
Retirer les coupes qui transforment le vrai argent : conversion `CAR_UNLOCK`, `PEINT_EUR → $`, palette → SECRÈTE, prix du pack, masquage OFFRES / tuile cadeau (`#mShop`, `#bdShop`, `data-m="shop"`).
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
- **Sauvegarde cousin / export** : un objet acheté se rend par restauration ; un code de sauvegarde ne doit **pas** devenir un moyen de gratuit : à vérifier, un `owned` importé depuis le web ne vaut pas achat (voir §9).

## 7. Tests
1. `node app-ios/outils/produits-store.js --verifier` : tous les ids sont uniques, valides, le `.storekit` correspond au jeu.
2. Banc navigateur : `ccAchat` simulé (succès / annulation / attente / indisponible) — le jeu ne donne rien sur refus, donne une fois sur succès (idempotent).
3. **Simulateur iOS** avec `Produits.storekit` branché au schéma (Debug seulement) : un achat par famille (caisse, peinture, palette), annulation, restauration après désinstallation.
4. `sh garde-burnout.sh` OK (boutique 3D intouchable), `assembler.cjs --verifier`, `sw.js` +1 si `code/` change.
5. **TestFlight bac à sable** (par Sacha) : un vrai achat, une restauration, un refus.
Non vérifiable ici : l'encaissement réel et la validation par Apple.

## 8. À faire par Sacha (App Store Connect / compte développeur)
- Contrat « Apps payantes » signé + coordonnées bancaires et fiscales (indispensable pour vendre).
- Créer les produits (le `produits.csv` donne identifiants, noms, prix) et les joindre à la version 1.0 soumise.
- **Prix** : 1,61 €, 4,20 €, 161,00 € et 1 € / 2 € / 3 € ne sont peut-être pas des paliers de prix Apple ; l'App Store Connect le dira. Sinon : palier le plus proche (le jeu affiche de toute façon le prix d'Apple).
- Fiche : « Achats intégrés » = Oui ; réponses de classification d'âge (« caisses » = achat direct d'une voiture connue, jamais de tirage aléatoire : à garder dit tel quel) ; notes du testeur ; confidentialité (aucune donnée collectée par l'app elle-même) ; page `confidentialite` à rejouer si besoin.
- Une capture d'écran de la boutique pour chaque type d'achat (exigée avec les produits).

## 9. Questions ouvertes (à trancher avant le plan)
1. Les peintures **à défi** (`def`) sont-elles aussi vendues en € ou seulement gagnées ? Le code leur met un prix ; la spec suppose « vendues seulement si pas de mission (`mis2`) ». À confirmer par Sacha.
2. Import de sauvegarde : un `owned` venu d'un code de sauvegarde du web doit-il valoir « acheté » ? Proposition : non pour les produits en €, ils se reconstruisent par `possedes()` (sinon le code de sauvegarde contourne le paiement, règle 3.1.1).
3. Le jeu se fige ~mi-nov 2026 : les achats entrent-ils dans le **build 2** (déjà prévu) ? Recommandation : oui, le même build, sinon une nouvelle soumission est nécessaire (les mises à jour en direct ne peuvent pas ajouter une capacité native).

## 10. Hors périmètre
Serveur de reçus, RevenueCat ou autre SDK, abonnements, consommables, packs d'argent du jeu en €, codes promo, pubs.
