# Achats intégrés App Store (StoreKit 2) — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Que ACHETER dans la boutique en € de l'app iOS passe par Apple (StoreKit 2), ne donne l'objet qu'après encaissement, et que RESTAURER MES ACHATS rende les achats.

**Architecture :** Un plugin Swift local `Achats` (StoreKit 2, sur l'appareil, sans serveur) ↔ un pont JS inerte hors de l'app, `window.ccAchat` (`app-ios/natif/achats.js`) ↔ la « porte » existante `shopPaye()` du jeu. La liste des produits est calculée UNE fois par le jeu (`produitsStore()`) ; un script la lit au navigateur pour fabriquer `Produits.storekit` (simulateur) et `produits.csv` (App Store Connect).

**Tech Stack :** JS du jeu (pièces de `code/`, `node code/assembler.cjs`), Capacitor 8, Swift / StoreKit 2 (iOS 15+), banc navigateur CDP (`outils/banc-caisses/cdp.mjs`), Node (`vm`, `jsdom` de `~/.hermes/hermes-agent/node_modules`).

**Spec :** `docs/superpowers/specs/2026-11-06-achats-app-store-design.md` (Task 0 la corrige sur deux points vérifiés dans le code).

## Global Constraints

- Tout vit dans `~/cash-car/boutique` (branche `boutique-affichage`, partie d'`origin/main` v1221). Ne jamais éditer `VERSION PRINCIPALE/index.html` à la main : modifier `code/` puis `node code/assembler.cjs`, committer `code/` ET `index.html` ensemble.
- Chaque changement du jeu : `cashcar-vNNN` +1 dans `VERSION PRINCIPALE/sw.js`.
- Un seul code web : `window.ccAchat` absent (navigateur, Vercel, portails) ⇒ comportement actuel inchangé (`shopPaye` rejette `Error('storekit')`).
- Tous les produits sont **non consommables**. Identifiants : `cashcar.car.<forme>` (la `shape` de `CARS`, jamais l'index) et `cashcar.peinture.<id>` ; caractères `[A-Za-z0-9._]` seulement.
- Rien n'est donné sans résultat `ok` d'Apple. `transaction.finish()` après la remise à JS.
- Aucune requête réseau ajoutée par le jeu ni de SDK tiers : `app-ios/preparer-www.js` garde son inventaire « 0 adresse réseau hors latest.json ».
- Noms et commentaires en français ; section ouverte par `/* ===== TITRE (date, qui : « la demande ») ===== */` ; jamais de `//` au milieu d'une ligne de JS du jeu.
- Intouchables : la boutique 3D (`sh garde-burnout.sh` doit dire OK), la charte (`sh garde-charte.sh`), le burn-out du garage.
- Textes : « À toi pour toujours » (achat unique), `INDISPONIBLE`, nouveau `EN ATTENTE D'ACCORD` (FR + EN dans `I18N`).
- Ne rien pousser sur `main`, ne rien envoyer à App Store Connect : pousser = publier, sur le oui de Sacha.

## Review Focus

1. **Achat annulé / en attente (Ask to Buy) / en échec** : rien n'est donné, rien n'est écrit dans `SAVE`, le bouton redevient utilisable.
2. **Restauration répétée** (au démarrage puis RESTAURER, deux fois de suite) : aucun doublon, aucune fête, l'équipement du joueur (peinture portée) ne change pas.
3. **Double touche sur ACHETER** ou achat lancé pendant un autre : un seul passage chez Apple.
4. **Hors ligne au démarrage / plugin absent** : `possedes()` échoue ⇒ le jeu démarre normalement et réessaie au lancement suivant ; pas d'erreur visible.
5. **Objet déjà à toi** (gagné par mission ou défi, ou déjà acheté) : pas de deuxième facturation, ÉQUIPER à la place.

---

### Task 0: Corriger la spec (deux faits vérifiés)

**Files:**
- Modify: `docs/superpowers/specs/2026-11-06-achats-app-store-design.md` (§3, §9)

- [ ] **Step 1: §3 — retirer la ligne « Pack LA PALETTE »** : `PALETTE_PACK` (`code/economie/boutique.js:277`) est un « ancien pack (plus vendu) », et `palDonne` a été retiré (`:647`). Aucun produit `cashcar.palette40`. Peintures : toutes celles dont `COSM.peinture[i].eur` existe, **défi ou non** (`habPaye` n'exige que `d.eur` ; les peintures gagnées par mission perdent leur `eur`, `boutique.js:633-639`).
- [ ] **Step 1b: §4.3 — RESTAURER** : le bouton existe déjà sur la page ACHAT (`code/page/ecrans-menus.html:124`, `data-m="shopRestore"`, aujourd'hui un toast « AUCUN ACHAT À RESTAURER » dans `code/moteur/mobile-tactile.js:896`) ; on le branche, on n'ajoute pas de ligne dans RÉGLAGES.
- [ ] **Step 2: §9 — répondre aux questions 1 et 3** (1 : vendues même avec défi ; 3 : build 2, la capacité native exige un nouveau binaire) ; question 2 (import de sauvegarde) : **acceptée telle quelle en v1.0** — ENTRER UN CODE restaure toujours une sauvegarde dans l'app (`preparer-www.js:152`) ; à rediscuter avec Sacha.
- [ ] **Step 3: Commit** `git add docs/superpowers/specs && git commit -m "Spec achats : palette non vendue, peintures à défi vendues, import accepté"`.

### Task 1: Le catalogue des produits (le jeu)

**Files:**
- Create: `code/economie/achats-store.js` (inscrit dans `code/ORDRE.txt` juste après `economie/boutique.js`)
- Create: `outils/banc-achats/produits.mjs`
- Modify: `code/ORDRE.txt`, `VERSION PRINCIPALE/sw.js`, `VERSION PRINCIPALE/index.html` (assemblé)

**Interfaces:**
- Produces (dans l'IIFE du jeu) :
  - `produitsStore(): Array<{id:string, type:'car'|'peinture', cle:number|string, eur:string}>` — `cle` = l'index de `CARS` pour une caisse, `'peinture:<id>'` pour une peinture ; caisses = `CAR_UNLOCK[i].k==='premium'` et `!carRetiree(i)` ; peintures = `COSM.peinture` avec `eur` (hors `usine`).
  - `produitDe(cle:number|string): string|null` (`null` si pas en vente).
  - `window.dbgProduits(): ReturnType<produitsStore>`.

- [ ] **Step 1: Écrire le banc `outils/banc-achats/produits.mjs`** (même gabarit que `outils/banc-caisses/jeu.mjs` : `lance`, `prepare`, `charge`, `passeSplash`, `c.ev`, `c.fin`; env `PORT`). Assertions, appelées sur `dbgProduits()` : exactement **9** produits `type:'car'` ; les ids des caisses contiennent `cashcar.car.poptart` et `cashcar.car.b_pizza` ; **aucun** id des index retirés 10, 12, 13, 14 ; tous les ids sont uniques et vérifient `/^cashcar\.(car|peinture)\.[A-Za-z0-9_]+$/` ; le nombre de `type:'peinture'` égale `dbgPeintures().filter(p=>p.eur&&p.id!=='usine').length` ; `produitDe` rend `null` pour l'index 10 (via `dbgProduits` couvrant `dbgAchats.produitDe`) ; aucune entrée `palette`. Sortie : `OK produits` ou code de sortie 1.
- [ ] **Step 2: Le lancer, vérifier l'échec** : `cd ~/cash-car/boutique && PORT=8923 node outils/banc-achats/produits.mjs` (serveur `boutique-jeu` actif) — attendu : échec « dbgProduits is not a function ».
- [ ] **Step 3: Écrire `code/economie/achats-store.js`** avec `produitsStore`, `produitDe`, `window.dbgProduits` (+ `window.dbgAchats={produitDe:produitDe}`), puis l'inscrire dans `ORDRE.txt` ; `node code/assembler.cjs` ; `sw.js` +1.
- [ ] **Step 4: Relancer le banc** — attendu : `OK produits`. Lancer aussi `node code/assembler.cjs --verifier` — attendu : vert.
- [ ] **Step 5: Commit** `git add code outils/banc-achats "VERSION PRINCIPALE" && git commit -m "Achats : le catalogue des produits (produitsStore, produitDe)"`.

### Task 2: Le pont `window.ccAchat` (JS de l'app)

**Files:**
- Create: `app-ios/natif/achats.js`
- Create: `app-ios/outils/achats-test.cjs`
- Modify: `app-ios/preparer-www.js` (copier `natif/achats.js` dans `www/` et le charger après `natif.js`, ligne ~86 ; la vérification « la page charge … absent » ligne ~64 doit aussi laisser passer `achats.js` ; l'inventaire final compte un fichier de plus)

**Interfaces:**
- Consumes : plugin natif `Capacitor.Plugins.Achats` (Task 5) : `produits({ids}) → {produits:[{id,prix,devise}]}` · `acheter({id}) → {etat:'ok'|'annule'|'attente'}` · `possedes() → {ids:string[]}` · `restaurer() → {ids:string[]}` · événement `achatRecu` `{id}` (`addListener`).
- Produces : `window.ccAchat = {pret:true, produits(ids):Promise<{[id]:{prix:string,devise:string}}>, payer(id):Promise<'ok'>, possedes():Promise<string[]>, restaurer():Promise<string[]>, onRecu(cb:(id:string)=>void):void}`. `payer` rejette une `Error` dont `.code` ∈ `'annule'|'attente'|'indisponible'|'echec'`. Hors app ou plugin absent : `window.ccAchat` n'est **pas** défini.

- [ ] **Step 1: Écrire `app-ios/outils/achats-test.cjs`** : charge `achats.js` dans `vm` avec un faux `window` ; cas : (a) pas de `Capacitor` ⇒ `ccAchat` indéfini ; (b) `isNativePlatform()` faux ⇒ indéfini ; (c) plugin absent ⇒ indéfini ; (d) plugin simulé `etat:'ok'` ⇒ `payer('x')` résout `'ok'` ; (e) `etat:'annule'` ⇒ rejette `.code==='annule'` ; (f) `etat:'attente'` ⇒ `.code==='attente'` ; (g) le plugin lève ⇒ `.code==='echec'` ; (h) deux `payer` simultanés ⇒ le 2e rejette `.code==='indisponible'` sans second appel au plugin (Review Focus 3) ; (i) `possedes()` ⇒ tableau d'ids ; (j) `achatRecu` simulé ⇒ `onRecu` appelé avec l'id. Sortie : `OK achats` ou exit 1.
- [ ] **Step 2: Lancer** `node app-ios/outils/achats-test.cjs` — attendu : échec (fichier absent).
- [ ] **Step 3: Écrire `app-ios/natif/achats.js`** (IIFE, même garde que `natif.js` : sort si pas natif ; sort si `Capacitor.Plugins.Achats` absent ; verrou « un seul achat à la fois » ; erreurs typées).
- [ ] **Step 4: Brancher `preparer-www.js`** (copie + balise `<script src="achats.js"></script>` juste après celle de `natif.js` + garde « la page charge » + compte de fichiers), puis `node app-ios/preparer-www.js --essai` — attendu : fabrication verte, « 0 adresse réseau hors … ».
- [ ] **Step 5: Relancer le test** — attendu : `OK achats`.
- [ ] **Step 6: Commit** `git add app-ios && git commit -m "App iOS : le pont window.ccAchat (achats.js) et son test"`.

### Task 3: La porte `shopPaye`, le démarrage et RESTAURER (le jeu)

**Files:**
- Modify: `code/economie/achats-store.js` (ajouts), `code/economie/boutique.js:12-17` (`shopPaye`, `shopDonne`), `:642` (`habDonne`), `code/moteur/mobile-tactile.js:896` (RESTAURER), `code/interface/habillages-accueil.js:26`, `code/economie/boutique.js:48-75` (prix de `shopPop`), `I18N` (FR/EN)
- Create: `outils/banc-achats/paye.mjs`

**Interfaces:**
- Consumes : `produitDe`, `produitsStore` (Task 1) ; `window.ccAchat` (Task 2).
- Produces :
  - `shopPaye(cle:number|string): Promise<void>` — **même nom, même rôle** : sans `window.ccAchat` rejette `Error('storekit')` ; sinon `ccAchat.payer(produitDe(cle))`, rejette si `produitDe` est `null`.
  - `shopDonne(i:number, calme?:boolean)` et `habDonne(cat:string, id:string, calme?:boolean)` : `calme` = true ⇒ ni `feteCaisse` ni changement de `SAVE.d.shop.eq`.
  - `achatsRecoit(idProduit:string, calme:boolean): boolean` — pose l'objet s'il manque (idempotent), rend `true` si nouveau.
  - `achatsSync(): Promise<number>` — `ccAchat.possedes()` puis `achatsRecoit(id,true)` ; n'échoue jamais (erreur ⇒ `0`) ; appelé une fois au démarrage du jeu (fin d'init) et par RESTAURER.
  - `prixTxt(cle, eurRepli:string): string` — prix localisé d'Apple si `ccAchat.produits` l'a rendu (mémorisé), sinon `eurTxt(eurRepli)`.
  - `window.dbgAchats` étendu : `{produitDe, paye:shopPaye, sync:achatsSync, recoit:achatsRecoit}`.

- [ ] **Step 1: Écrire `outils/banc-achats/paye.mjs`** : après `charge`, injecter un faux `window.ccAchat` (réglable : prochaine réponse `ok|annule|attente|indisponible`, `possedes` = liste) puis, sur la caisse index 54 (`cashcar.car.e_feline`) et la peinture de la 1re entrée de `dbgProduits()` : (1) `ok` ⇒ `carOwned(54)` vrai, `SAVE.d.owned` contient 54, sauvegarde posée ; (2) `annule` et `attente` ⇒ **rien** donné, `SAVE.d.owned` inchangé, 2e tentative possible (Review Focus 1) ; (3) `achatsSync` avec `possedes=['cashcar.car.e_feline', <id peinture>]` deux fois ⇒ 1er appel rend 2, 2e rend 0, `SAVE.d.shop.eq.peinture` inchangé, `feteCaisse` non appelée (Review Focus 2) ; (4) `possedes` qui rejette ⇒ `achatsSync` rend `0` sans exception (Review Focus 4) ; (5) objet déjà à toi ⇒ `habPaye` rend `false` et `ccAchat.payer` n'est pas appelé (Review Focus 5) ; (6) **sans** `ccAchat` ⇒ `shopPaye(54)` rejette `storekit` (comportement web) ; (7) double `shopPaye` simultané ⇒ un seul appel à `payer` ; (8) le texte du prix de `shopPop` reprend le prix du faux `ccAchat.produits` (`'1,61 €'` → `'1,59 €'` pour le test). Sortie `OK paye` ou exit 1.
- [ ] **Step 2: Lancer le banc** — attendu : échec (`dbgAchats.paye` absent / `shopPaye` rejette toujours).
- [ ] **Step 3: Implémenter** dans `achats-store.js` et `boutique.js` selon les Interfaces ; `shopPaye` devient un appel à la fonction de `achats-store.js` ; `mobile-tactile.js:896` : si `ccAchat` ⇒ `achatsSync()` puis toast coche « N ACHAT(S) RESTAURÉ(S) » ou `AUCUN ACHAT À RESTAURER` ; sinon le toast actuel ; `achatsSync()` lancé en fin d'init ; `ccAchat.onRecu` ⇒ `achatsRecoit(id,false)` (la fête, c'est un achat vivant) ; `ccAchat.produits(tous les ids)` demandé une fois au démarrage pour `prixTxt` ; remplacer `eurTxt(u.eur)` / `eurTxt(d.eur)` des fiches vendables (`shopPop`, `habillages-accueil.js:26`, `boutique-du-jour.js`) par `prixTxt` ; message `attente` : toast « EN ATTENTE D'ACCORD » ; textes FR/EN dans `I18N`.
- [ ] **Step 4: `node code/assembler.cjs` ; `sw.js` +1 ; relancer `paye.mjs` et `produits.mjs`** — attendu : `OK paye`, `OK produits` ; `sh garde-burnout.sh` OK ; `sh garde-charte.sh` OK.
- [ ] **Step 5: Parcours au navigateur** (serveur `boutique-jeu`, `?colonne=0&tel=1&intro=ancien`) avec un faux `ccAchat` collé dans la console : garage → BOUTIQUE → ACHAT → une caisse → ACHETER ⇒ « À TOI » ; page ACHAT → RESTAURER ; console sans erreur ; sans faux `ccAchat`, la page se comporte comme aujourd'hui (INDISPONIBLE).
- [ ] **Step 6: Commit** `git add code outils/banc-achats "VERSION PRINCIPALE" && git commit -m "Achats : shopPaye branché sur ccAchat, restauration, prix d'Apple"`.

### Task 4: Rendre la boutique en € à l'app (retirer les coupes)

**Files:**
- Modify: `app-ios/preparer-www.js` (~l. 100-180 : coupes `CAR_UNLOCK` → $, `PEINT_EUR` → $ et lignes `o.eur=`, prix de pack/palette, CSS « page OFFRES » masquant `#mShop`, `#bdShop`, `data-m="shop"`) ; la liste des « témoins » (~l. 172-176) ; en-tête de commentaire

**Interfaces:**
- Consumes : `ccAchat` (Task 2). Les coupes qui **restent** : ENTRER UN CODE cousin, pubs maison, vieux panneau RÉGLAGES, mode TEST, `un cousin venu d'une sauvegarde ne débloque rien`.

- [ ] **Step 1: Écrire le test dans `app-ios/outils/achats-test.cjs`** (ajout) : fabriquer en essai (`node preparer-www.js --essai --sortie <dossier jetable>`), lire le `index.html` produit et vérifier : il contient `k:'premium'` des caisses (non converties), ne contient plus `(app iOS) le vrai argent passe à l'argent du jeu`, ne contient plus `#mShop` masqué (`display:none` sur `#mShop`/`#bdShop`/`data-m="shop"`), contient toujours la coupe ENTRER UN CODE ; et que `achats.js` est dans le dossier et chargé après `natif.js`.
- [ ] **Step 2: Lancer** — attendu : échec (les coupes sont encore là).
- [ ] **Step 3: Retirer les coupes** listées ci-dessus ; adapter les témoins (ceux qui gardaient `k:'premium'` deviennent « cette cible doit exister, intacte ») ; mettre l'en-tête du fichier à jour.
- [ ] **Step 4: Relancer le test, puis `node app-ios/preparer-www.js --essai`** — attendu : `OK achats`, fabrication verte, 0 adresse réseau hors latest.json.
- [ ] **Step 5: Banc au navigateur sur la sortie de l'essai** (`--sortie`, servie en local, faux `ccAchat`) : accueil → ACHAT (OFFRES) visible avec les 9 caisses en €, boutique du garage → peintures en €, RESTAURER présent ; ENTRER UN CODE toujours absent des réglages cousin.
- [ ] **Step 6: Commit** `git add app-ios && git commit -m "App iOS : la boutique en € revient (coupes en vrai argent retirées)"`.

### Task 5: Le plugin Swift StoreKit 2 et les fichiers de test

**Files:**
- Create: `app-ios/ios/App/App/Achats.swift`
- Create: `app-ios/outils/produits-store.mjs`, `app-ios/ios/App/Produits.storekit` (généré, committé), `app-ios/ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`
- Modify: `app-ios/ios/App/App.xcodeproj/project.pbxproj` (4 entrées : `PBXBuildFile`, `PBXFileReference`, enfant du groupe `App`, phase `Sources`, mêmes motifs que `JeuViewController.swift`, lignes 20/34/72/170), `app-ios/ios/App/App/JeuViewController.swift` (`bridge?.registerPluginInstance(Achats())` à côté de `GardeNavigation()`)
- Modify: `app-ios/LISEZ-MOI.md` (mode d'emploi du test StoreKit)

**Interfaces:**
- Produces (Swift) : `@objc(Achats) class Achats: CAPPlugin, CAPBridgedPlugin`, `jsName = "Achats"`, méthodes `produits`, `acheter`, `possedes`, `restaurer` (contrat de la Task 2) ; émet `notifyListeners("achatRecu", data:["id": String])` pour chaque transaction vérifiée de `Transaction.updates`. Un verrou : un seul `acheter` à la fois (sinon rejette « occupé »).

- [ ] **Step 1: Écrire `app-ios/outils/produits-store.mjs`** : charge le jeu au navigateur (`cdp.mjs`), lit `dbgProduits()` et écrit `Produits.storekit` (JSON StoreKit Configuration : un produit `NonConsumable` par entrée, `displayPrice` = le prix `eur` du jeu avec point décimal, nom FR depuis `CARS[i].name` / `COSM.peinture[j].n`) et `produits.csv` (`id,nom,type,prix_eur`). Option `--verifier` : relit les deux fichiers et échoue si un id du jeu manque ou si un id du fichier n'est plus dans le jeu.
- [ ] **Step 2: Générer** `PORT=8923 node app-ios/outils/produits-store.mjs` puis `--verifier` — attendu : `OK 9 caisses + N peintures`, le `.storekit` est du JSON valide (`node -e "JSON.parse(require('fs').readFileSync('app-ios/ios/App/Produits.storekit'))"`).
- [ ] **Step 3: Écrire `Achats.swift`** : `Product.products(for:)` (prix `displayPrice`, devise `priceFormatStyle.currencyCode`), `product.purchase()` ⇒ `.success(.verified)` → `transaction.finish()` après avoir répondu `etat:"ok"` ; `.success(.unverified)` → rejet ; `.userCancelled` → `etat:"annule"` ; `.pending` → `etat:"attente"` ; `possedes` = `Transaction.currentEntitlements` (vérifiées, non révoquées) ; `restaurer` = `try await AppStore.sync()` puis `possedes` ; écoute de `Transaction.updates` lancée au `load()`. Enregistrer dans `JeuViewController.capacitorDidLoad()` et dans `project.pbxproj`.
- [ ] **Step 4: Scheme partagé** `App.xcscheme` avec, dans `LaunchAction`, `<StoreKitConfigurationFileReference identifier = "../Produits.storekit">` ; **ne pas** ajouter le `.storekit` aux ressources de la cible (il ne doit pas partir dans l'archive). Vérifier : `grep -c Produits.storekit app-ios/ios/App/App.xcodeproj/project.pbxproj` ne doit pas compter de `PBXBuildFile` pour lui.
- [ ] **Step 5: Construire** `cd app-ios && npm run sync && xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build` — attendu : `BUILD SUCCEEDED`. (Si le build échoue sur le schéma partagé, corriger le XML du scheme.)
- [ ] **Step 6: Commit** `git add app-ios && git commit -m "App iOS : plugin Achats (StoreKit 2), Produits.storekit, scheme de test"`.

### Task 6: Vérification de bout en bout, fiche et livraison

**Files:**
- Modify: `passation/APP-STORE.md` (état + décisions), `passation/regard-apple.md` (ligne « Achats intégrés : Aucun » → présents ; classification d'âge ; confidentialité), `app-ios/fiche/` (notes du testeur) si les textes y parlent d'achats
- Create: `passation/ACHATS-APP-STORE.md` (liste pour Sacha : contrat, produits à créer avec `produits.csv`, prix à vérifier, captures, TestFlight)

- [ ] **Step 1: Banc complet** : `node app-ios/outils/achats-test.cjs`, `PORT=8923 node outils/banc-achats/produits.mjs`, `PORT=8923 node outils/banc-achats/paye.mjs`, `node code/assembler.cjs --verifier`, `sh garde-burnout.sh`, `sh garde-charte.sh`, `node app-ios/preparer-www.js --essai` — attendu : tout vert.
- [ ] **Step 2: Test StoreKit au simulateur par Sacha** (Xcode ▶ avec le scheme `App`, iPhone 17 Pro ; seul ▶ applique le `.storekit` — un simple `simctl launch` ne le fait pas) : checklist écrite dans `ACHATS-APP-STORE.md` : acheter une caisse, annuler un achat, acheter une peinture, désinstaller/réinstaller puis RESTAURER, **Transaction Manager** d'Xcode pour simuler Ask to Buy (`attente`) et un remboursement (l'objet reste, v1.0).
- [ ] **Step 3: Mettre à jour les passations** (état, décisions de la Task 0, ce qui reste à Sacha : contrat « Apps payantes », produits App Store Connect, prix, fiche, TestFlight bac à sable). Rien n'est affirmé comme testé sans l'avoir été : l'encaissement réel reste « non vérifié ici ».
- [ ] **Step 4: Intégration avec l'app** : l'app vit sur `ios-capacitor` (+1 commit en avance sur main au 06/11) : `git fetch origin`, fusionner `origin/main` ET `origin/ios-capacitor` dans `boutique-affichage` (jamais de force), refaire `node code/assembler.cjs --verifier`, rejouer le Step 1, `sw.js` = `origin/main` + 1 si main a bougé.
- [ ] **Step 5: Commit** `git add passation docs && git commit -m "Achats App Store : passation, liste pour Sacha"` ; **s'arrêter** : pousser `boutique-affichage` / fusionner dans `main` / `npm run archive --envoyer` = sur le oui de Sacha.
