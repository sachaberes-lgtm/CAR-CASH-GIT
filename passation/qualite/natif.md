# Lot « NATIF » : la tranche « toucher l'icône → début de la page » (2026-11-15, branche qa/natif)

## Fait
1. **Chrono natif** (`app-ios/ios/App/App/JeuViewController.swift`, `enum ChronoLancement` ; `AppDelegate.swift`, 1 ligne). Cinq instants, en ms d'horloge murale :
   - `proc` : début du PROCESSUS, lu au noyau (`sysctl` KERN_PROC_PID sur notre propre pid, `p_starttime`) ;
   - `lance` : `didFinishLaunching` ;
   - `web` : `webViewConfiguration(for:)` (la vue web va être créée) ; `prete` : `capacitorDidLoad` (elle existe, la page n'a pas commencé) ;
   - `vue` : `viewDidAppear` (le serpent natif est posé).
   - `prechauffe` : 1 si iOS avait créé le processus d'avance (variable `ActivePrewarm`).
2. **Injection** : `window.__ccNatifT={proc,lance,web,prete,vue,prechauffe}` dans le script du début (`poseScriptDebut`). `vue` arrive après (viewDidAppear passe après capacitorDidLoad) : il part par un 2e script de début ET par `evaluateJavaScript`, une seule fois.
3. **Côté jeu** : nouveau morceau `code/moteur/natif-lancement.js` (inscrit dans `code/ORDRE.txt` juste avant `intro-161.js`) → `window.ccNatifLancement()`. Une accroche en fin de ligne dans `introNote` (`code/moteur/intro-161.js`) : `+(window.ccNatifLancement?window.ccNatifLancement():'')`.
   **(corrigé au contrôle : voir « CORRECTIONS DU CONTRÔLE » — le chrono a maintenant SA ligne `natif`, l'accroche est `window.ccNatifNote()` en tête d'`introNote`.)**
   La ligne `natif` de la boîte noire :
   `processus→vue X ms · vue→page Y ms (processus→lancé A, lancé→web B, web→prête C, prête→vue D)`
   - « page » = `performance.timeOrigin`. **vue→page peut être négatif** (la page commence avant que l'écran n'apparaisse).
   - `PRÉCHAUFFÉ : processus→… ne compte pas` si iOS a préchauffé ; `rechargement` si la page a été rechargée (les instants natifs sont ceux du lancement d'origine).
   - `?` = instant manquant.
4. **Interrupteur** : `?sans=natiflancement` = aucune ligne `natif`. Hors de l'app (`__ccNatifT` absent : site, ordinateur, banc, app Release) la fonction rend `''` : aucune ligne `natif`, ligne `chargement` jamais touchée. Lecture seule : aucun comportement du jeu ne change.

## Prouvé (ordinateur)
- Assemblage `--depuis-morceaux` : « index.html et les 332 morceaux sont d'accord ». `garde-demarrage` OK (21 scripts), `garde-allege` OK, `garde-charte` OK, `node --check` du plus gros script (10 732 350 car.) OK. index.html remis (`git checkout`), sw.js pas touché.
- La fonction, dans node avec de faux instants : sans `__ccNatifT` → `''` ; instants complets → `· natif : processus→vue 410 ms · vue→page 180 ms (processus→lancé 90, lancé→web 40, web→prête 130, prête→vue 150)` ; `?sans=natiflancement` → `''` ; cas préchauffé / vue manquante / rechargement : sorties attendues.
- **Le Swift compile** : `xcodebuild -project App.xcodeproj -scheme App -configuration Debug -destination generic/platform=iOS` avec `CODE_SIGNING_ALLOWED=NO`, sortie dans un dossier à part (effacé ensuite), **BUILD SUCCEEDED**, aucun avertissement sur ChronoLancement. Pour compiler dans ce worktree : lien provisoire vers `finition-build/app-ios/node_modules`, `public/` factice, `capacitor.config.json` + `config.xml` copiés de finition-build ; tout retiré après. Pas de `cap sync`, pas de signature, rien installé.

## NON prouvé
- **Rien n'a tourné sur un iPhone ni dans un simulateur.** Aucun chiffre réel. Ne sont donc pas vérifiés : que `sysctl` rend bien l'heure du processus sur l'appareil (sinon `proc`=0 → `?`), que `vue` arrive bien dans la page avant le « prêt » (les deux chemins sont là pour ça), que `ActivePrewarm` est lisible, l'ordre réel web/prête/vue.
- Pas de passage au banc Chrome (verrou non pris) : hors de l'app la ligne est inchangée par construction (fonction vide), montré dans node seulement.
- Le vrai « toucher l'icône » n'est pas mesurable depuis l'app : `proc` est ce qu'il y a de plus près (il manque le temps que met iOS à créer le processus). Pour le toucher lui-même : filmer l'écran, ou Instruments « App Launch ».
- Les horloges : natif = `Date()`, page = `performance.timeOrigin`. Même horloge murale en principe ; WebKit peut arrondir timeOrigin (≈ 1 ms). Un saut d'horloge (NTP) pendant le lancement fausserait une lecture.
- `sysctl` sur son propre pid : pas dans la liste « required reason API » d'Apple à ma connaissance, pas vérifié dans la doc ce jour. `PrivacyInfo.xcprivacy` pas touché. À confirmer avant une soumission App Store, ou borner le chrono à `#if DEBUG`.

## À mesurer sur le 13 Pro
1. Build de mesure (le Swift de cette branche + le jeu de cette branche, **configuration Debug** : c'est celle de compiler.sh), app TUÉE puis touchée à froid, 5 lancements ; lire la ligne `natif` de la boîte noire. Noter processus→vue, vue→page et les 4 morceaux.
2. Pareil après redémarrage du téléphone (1er lancement, le plus froid), et à chaud (app tuée puis relancée tout de suite).
3. Si `PRÉCHAUFFÉ` apparaît : ne lire que lancé→web, web→prête, prête→vue, vue→page.
4. A/B : `?sans=natiflancement` (par `--qs "&sans=natiflancement"` ou `CC_QS`) → la ligne d'avant, pour montrer que le chrono ne coûte rien (origine→prêt de natif.js identique).
5. Mettre bout à bout avec `origine→DCL` / `origine→prêt` (natif.js) et `prêt en N s` : la chaîne entière processus → film.

## Où reporter
- `app-ios/` existe aussi sur **ios-capacitor**, dont les Swift sont très en retard sur cette branche (JeuViewController : ~246 lignes d'écart, pas de `poseScriptDebut`). Le chrono se reporte en reportant les Swift de `qualite-appareil` (resynchronisation habituelle de l'app), pas en picorant ce commit.
- Les builds de mesure partent de `~/cash-car/finition-build` (compiler.sh) : y amener `AppDelegate.swift`, `JeuViewController.swift`, et le jeu (morceau + ORDRE + accroche).
- Lot « lancement2 » : il réécrit la ligne `window.__ccNote('chargement',…)` d'`introNote`. L'accroche n'y est plus : elle est sur la ligne `function introNote(manque){` (2 lignes plus haut), que lancement2 ne touche pas → fusion sans conflit attendue. La ligne `chargement` de cette branche est celle de qualite-appareil, à l'octet.

## CORRECTIONS DU CONTRÔLE (2026-11-15, 2e tour)
1. **Le chrono était coupé (sérieux) → il a sa ligne.** `__ccNote` garde 240 caractères ; en fin de ligne `chargement` le chrono tombait hors du plafond. Maintenant : `window.ccNatifNote()` (natif-lancement.js) écrit `__ccNote('natif', …)`, appelée en tête d'`introNote`. L'accroche de fin de ligne est retirée : la ligne `window.__ccNote('chargement',…)` est redevenue celle de qualite-appareil (8d5ff4168), à l'octet (`git diff` : une seule ligne changée dans intro-161.js, `function introNote(manque){`). Plafond de 240 pas touché.
   - **Preuve (node, à travers la VRAIE `__ccNote` extraite de code/page/debut-corps.html, avec les vraies `introNote` et `introDetail` extraites d'intro-161.js)** :
     - hors de l'app : 1 seule ligne, genre `chargement` ; dans l'app : 1 ligne `natif` + 1 ligne `chargement`, celle-ci identique à celle hors de l'app ;
     - cas courant, 103 caractères : `processus→vue 410 ms · vue→page 180 ms (processus→lancé 90, lancé→web 40, web→prête 130, prête→vue 150)` ;
     - pire cas, 191 caractères, identique avant et après `__ccNote` (processus préchauffé 3 jours avant, page née 3 h après, page n° 12, écarts à 8-9 chiffres) : `processus→vue 259200410 ms · vue→page 10799590 ms (processus→lancé 123456, lancé→web 258977779, web→prête 44444, prête→vue 54731, PRÉCHAUFFÉ : processus→… ne compte pas, rechargement page 12)` ;
     - `?sans=natiflancement` : aucune ligne `natif`.
   - **Le doute du contrôleur sur la ligne `chargement` elle-même : OUI, elle dépasse déjà 240, sans le chrono.** La boîte `ios-ultime-mesures/boite-noire-1115-1600.txt` ne contient AUCUNE ligne `chargement` (genres présents : banc, gel, memoire, son, contexte, radio, mort, energie, pivot) ; les autres boîtes du dossier n'ont que l'ancienne ligne courte (84-121 car., avant `introDetail`). Pas de vraie ligne longue à lire, donc calcul : la vraie `introDetail` avec des valeurs de la taille d'un lancement (lier 1122 ms, 30 étapes, 212 programmes, dense 180 images/420 pas/61 tôles/5234 ms, branché en charge) donne **204 car.** sans étape libérée, **235** avec 3 étapes libérées, **252 avec 3 étapes + « toucher retenu »** (perdu : la fin de « branché en charge »), **322 avec les 9 étapes** (perdu : tout depuis le milieu de « dense » : tôles, ms, éco, thermique, branché). Donc le cas courant est au bord (235), et un lancement qui a retenu 4 étapes ou plus perd l'état du téléphone. **Non modifié ici** (lancement2 réécrit cette ligne) : à lui de la scinder ou de la raccourcir.
2. **Chrono borné au build de mesure : `#if DEBUG`.** `compiler.sh` fabrique le build que Sacha installe en `-configuration Debug` (produit `Debug-iphoneos/App.app`) ; une archive App Store est en Release. Il n'existe pas d'autre drapeau côté Swift : `perfrec` est une query de la page, et `CC_QS` est déjà lui-même sous `#if DEBUG` dans le même fichier. Même borne donc, la seule qui garde le chrono dans le build de mesure sans rien demander à compiler.sh. En Release, `ChronoLancement` n'est plus que trois fonctions vides : pas de `sysctl`, pas de `__ccNatifT` injecté, pas de compteur, pas de 2e script ; côté jeu `ccNatifLancement()` rend `''`. La question « required reason API » ne se pose plus pour l'App Store.
3. **« rechargement » voit aussi une page relancée par le natif.** Nouveau : `CompteChargements` (WKScriptMessageHandlerWithReply, cadre principal seulement) compte les documents DANS LE NATIF ; le script du début le demande (`webkit.messageHandlers.ccChargements.postMessage`) et range la réponse dans `__ccNatifT.charge`. `charge ≥ 2` → `, rechargement page N` (cas GardeVue `v.load`, que la page voit en type `navigate`). Restent : type `reload` → `, rechargement` ; filet des 60 s si le compteur manque. Prouvé dans node : navigate + page 2 + 20 s après l'écran → `rechargement page 2` ; reload ; filet ; compteur absent sur une 1re page → pas de mention.
4. Commentaire Swift : « Cinq instants ».
5. La mention PRÉCHAUFFÉ garde son texte entier (`PRÉCHAUFFÉ : processus→… ne compte pas`) : il tient.

**Le Swift recompile** : une compilation `xcodebuild … -configuration Debug -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO`, dossier de sortie à part : **BUILD SUCCEEDED**, aucune erreur ni avertissement sur JeuViewController/AppDelegate, `CompteChargements` présent dans le binaire. Même montage provisoire qu'au 1er tour, tout retiré, rien installé. La branche Release (`#else`) n'a pas eu de 2e xcodebuild : son extrait a passé `swiftc -typecheck` seul, avec les appels de AppDelegate/JeuViewController.
Gardes : assemblage `--depuis-morceaux` d'accord (332 morceaux), garde-demarrage OK, garde-allege OK, garde-charte OK, `node --check` du plus gros script OK ; index.html et sw.js remis.

**Toujours NON prouvé** : rien n'a tourné sur un iPhone ni un simulateur. En particulier : que la réponse du compteur (`charge`) arrive bien dans la page (elle est asynchrone, quelques ms après le début du document ; la ligne s'écrit des secondes plus tard) et qu'après une relance GardeVue elle vaut bien 2 ; que `vue` arrive ; `sysctl` ; `ActivePrewarm`. Pas de banc Chrome : hors de l'app rien n'est écrit (montré dans node seulement). La fusion avec lancement2 n'a pas été essayée.

## Fichiers
`app-ios/ios/App/App/AppDelegate.swift`, `app-ios/ios/App/App/JeuViewController.swift`, `code/moteur/natif-lancement.js` (nouveau), `code/ORDRE.txt`, `code/moteur/intro-161.js` (1 ligne), `passation/qualite/natif.md`.
