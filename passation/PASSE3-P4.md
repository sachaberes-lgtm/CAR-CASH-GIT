# Perf 3 — P4 : le script du jeu en fichier dans l'app (2026-11-07)

**Décision : on GARDE `--jeu-fichier` comme OPTION de build** (gain faible mais réel au relancement, aucun coût). Il n'est pas activé par défaut.

## Ce qui est dans le code (branche `perf3/P4`)
- `app-ios/preparer-www.js --jeu-fichier` : après l'allègement, appelle `outils/publie-script-externe.cjs` (l'outil du site) sur `www/` :
  le `<script>` en ligne devient `<script src="jeu.<sha1 10>.js">`, même ordre de chargement, `__CC_BUILD__` déjà gravé, en-tête de recalage des numéros de ligne.
  Refuse de continuer si le script reste en ligne. `index.html` ~6,1 → ~0,85 Mo, `jeu.*.js` ~5,3 Mo.
- `app-ios/natif/natif.js` §8 : relevé du chargement, écrit dans la boîte noire (`__ccNote('chargement', …)`, lisible par câble `outils/banc-perf/boite-noire.sh`) et, en DEBUG, console `[natif] CHARGEMENT`.

## Construire
```
node app-ios/preparer-www.js --jeu-fichier --maj http://127.0.0.1:1/     # essai/dev ; en production : sans --maj, avec --jeu-fichier
```
Vérifier : un `jeu.*.js` dans `www/` (et `public/` du .app) et la balise `<script src="jeu.…">` dans `index.html`.

## Lire la ligne « chargement »
`jeu fichier|en ligne · origine→DCL X ms · origine→prêt Y ms · DCL→prêt Z ms [· jeu.js transfert …]`
- origine = `performance.timeOrigin` ; DCL = `DOMContentLoaded` (après l'exécution du grand script) ; prêt = `window.__gameReady`.
- Le mode « fichier » se lit sur la balise `<script src="jeu.…">` : le schéma `capacitor://` ne remonte pas toujours le script dans `performance.getEntriesByType('resource')` (leçon du build 14 : étiquetée « en ligne » à tort, corrigé en `6f73d535`).

## Mesure sur le 13 Pro, base saine `serpent-fluide` 8e8c415a, 3 lancements à froid chacun
Brut : `~/cash-car/perf3/batterie/2026-11-07-iphone13pro-build17-brut.txt`

| Lancement | 15 en ligne (témoin) trou initial | 17 fichier : origine→DCL | origine→prêt | trou initial | pire trou |
|---|---|---|---|---|---|
| 1 | 447 ms | 935 ms | 801 ms | 688 ms | 842 ms |
| 2 | 695 ms | 660 ms | 651 ms | 607 ms | 777 ms |
| 3 | 749 ms | 694 ms | 594 ms | 547 ms | 1094 ms |

Serpent 15 : pire trou 924 / 695 / 754 ms, 4 / 1 / 4 trous. Serpent 17 : 4 / 4 / 3 trous, guet 3,1 / 2,8 / 2,4 s.
(Le build 15 n'a pas de ligne `chargement` : la sonde n'y était pas.)

## Lecture
- Le cache de bytecode du script externe fait gagner ~250 ms sur le DCL du 2e lancement (935 → 660/694 ms) ; c'est tout : le serpent est dans le bruit.
- Les trous restants ne sont pas l'analyse du script mais le premier dessin (loop + piste 500-1100 ms dont 120-145 ms de JS) et l'« étape rendu » (330-360 ms + image boucle = 780-840 ms).
- Le build 14 (base `perf3-main` avec régression, trous de 2-9 s) n'est pas jugeable : origine→prêt 529 / 3638 / 3636 ms.
- Simulateur : non mesuré (Mac saturé, charge 130-260, `simctl launch` bloqué).
- Le critère « ≥ 20 % sur origine→prêt au 2e lancement » n'a pas pu être tranché proprement (pas de ligne `chargement` côté témoin) ; la décision de garder en option est celle d'OPTI ULTIME.

## Vignette « En lecture » à l'accueil (2026-11-08, commit eea585c4)
**Cause :** la musique joue par un `<audio>` (`#musique`, code/son/musique.js) ; tant qu'il a une source et que la session audio est active, iOS garde l'app comme lecteur média (vignette sur l'accueil / verrouillé / centre de contrôle). Le jeu mettait déjà l'`<audio>` en pause à `visibilitychange` hidden, mais ni la source ni la session audio n'étaient relâchées. Le jeu n'appelle aucun `mediaSession.setActionHandler`.

**Ce qui est fait (app seulement, rien dans `code/`) :**
- `natif.js` §9 : à `visibilitychange` hidden / `pagehide` / `freeze` : pause, `removeAttribute('src')` + `load()` de chaque `<audio>/<video>` qui a une source, `mediaSession.metadata=null`, `playbackState='none'`, handlers retirés. Au retour : source et position remises AVANT l'écouteur du jeu (natif.js est chargé en premier), qui relance alors sa musique comme avant (`musicJoue` ne refait pas la source ; la logique de reprise du jeu est intacte). Banc : `window.__ccVignette.decharge()/recharge()`.
- `AppDelegate.swift` : à `applicationDidEnterBackground`, `setActive(false, .notifyOthersOnDeactivation)` (4 essais espacés de 0,6 s : la vue web peut encore tenir la session au premier) ; à `applicationWillEnterForeground`, catégorie `.playback` + `.mixWithOthers` et `setActive(true)`.

**⚠ Écart avec la demande :** la catégorie reste `.playback` (avec `.mixWithOthers`), PAS `.ambient`. `.ambient` annulerait SON-04 (5/11, `AppDelegate`) : sur iOS 16 la page n'a pas `navigator.audioSession` et le bouton Silencieux couperait tout le jeu. `.mixWithOthers` suffit à ne pas prendre la place de « lecteur » et laisse la musique d'un autre lecteur (Spotify…) continuer pendant le jeu — changement de comportement à valider par Sacha. Si on veut vraiment `.ambient` : une ligne dans `AppDelegate`, au prix du retour de SON-04.

**Limites :** WebKit peut re-poser sa propre catégorie quand l'`<audio>` joue (iOS 17+, `audioSession.type='playback'` posé par `musicSession()`), donc les options Swift ne sont pas garanties ; ce qui supprime la vignette de façon sûre est la source vidée + la session désactivée en arrière-plan. Pas de preuve sur téléphone (demandé : simulateur seulement).

**Preuve au simulateur : NON OBTENUE.** Le build simulateur (iPhone 17 Pro, `xcodebuild` après `preparer-www.js` + `cap sync`) a réussi — `** BUILD SUCCEEDED **`, donc le Swift et `natif.js` compilent/passent `node --check` — mais le Mac était saturé (charge 200 à 680) : `simctl launch` n'a pas répondu en plus de 5 min. À refaire quand la charge sera < 15 : installer le .app, lancer une partie avec musique, bouton HOME, ouvrir le centre de contrôle (aucune vignette « En lecture »), revenir (la musique reprend) ; en Debug, `xcrun simctl spawn <udid> log stream --predicate 'eventMessage CONTAINS "natif"'` doit montrer `vignette lecture : 1 média(s) déchargé(s)` puis `rechargé(s)`. Le simulateur n'affiche pas toujours la vignette « En lecture » du téléphone : la preuve sûre est le 13 Pro.
⚠ Pour compiler cet arbre sur simulateur il faut retirer temporairement `prefersHomeIndicatorAutoHidden` de `JeuViewController.swift` (erreur « overriding non-open property », déjà présente avant ce commit, contournée par les builds de banc) — non commité.

## Natif perf (2026-11-08) — compositeur et batterie, code seul (le téléphone dira)
Compilé : `xcodebuild -sdk iphonesimulator` → BUILD SUCCEEDED (charge 6, aucun autre xcodebuild). Rien mesuré.

| # | Point | État avant | Changement | Pourquoi |
|---|---|---|---|---|
| 1 | Vue web opaque | Capacitor (`WebViewDelegationHandler`) met `isOpaque=false` au 1er chargement puis remet l'état d'avant (true par défaut) ; `backgroundColor` noir déjà posé par `capacitor.config.json` (webView + scrollView) | `JeuViewController.capacitorDidLoad` : `isOpaque=true`, `backgroundColor`/`underPageBackgroundColor`/`view.backgroundColor` noirs, et ré-affirmé 6 s après (journal si elle était redevenue transparente) | une vue transparente = un mélange plein écran par image au compositeur ; ici elle ne montre jamais que le jeu |
| 2 | Défilement | déjà : `isScrollEnabled=false`, `bounces=false`, `contentInsetAdjustmentBehavior=.never`, pincement coupé | + `scrollView.backgroundColor` noir, indicateurs de défilement cachés | rien à dessiner qui ne sert pas ; le reste était déjà posé (Capacitor + contrôleur) |
| 3 | Fréquence 120 Hz | `Info.plist` SANS `CADisableMinimumFrameDurationOnPhone` | rien (ne PAS l'ajouter) | sans cette clé un iPhone ProMotion plafonne les animations Core Animation / display links de l'app à 60 Hz ; le rAF de WKWebView reste donc à 60 max. Ne jamais poser la clé à true |
| 4 | WKWebViewConfiguration | Capacitor (`CAPBridgeViewController` l.122-125) pose déjà `allowsInlineMediaPlayback=true`, `suppressesIncrementalRendering=false`, `mediaTypesRequiringUserActionForPlayback=[]` | rien | déjà conforme ; `ignoresViewportScaleLimits` reste à false (défaut), zoom coupé de toute façon |
| 5 | Capacitor splash / barre | `launchAutoHide:false`, fondu de sortie 250 ms une seule fois (appelé par natif.js à DOMContentLoaded), `StatusBar.overlaysWebView:true`, barre cachée | rien | aucune animation en boucle |
| 6 | Info.plist | `UIRequiresFullScreen=true`, `UIStatusBarHidden=true`, `UIViewControllerBasedStatusBarAppearance=true`, orientations : portrait + 2 paysages | rien | l'orientation n'est PAS verrouillée : c'est un choix de jeu (le jeu tourne en paysage) ; la verrouiller n'est pas une décision d'optimisation. `UIRequiresFullScreen` déjà là |
| 7 | Minuteries / plugins en continu | plugins : Haptics, Preferences, SplashScreen, StatusBar, CapacitorUpdater (pas de Network ni de Keyboard) ; `autoUpdate:false` ; natif.js : un `setInterval` de 500 ms jusqu'à `__gameReady` (≤ 2 min) puis rien, le pouls et la rAF de comptage seulement en DEBUG ; MAIS `GardeHautParleur` : un `Timer` de 2 s à vie | `Timer.tolerance = 1 s` | iOS regroupe ce réveil avec d'autres (la lecture de la route audio est gratuite, c'est le réveil qui coûte) |

Non touché : le garde `GardeHautParleur` lui-même (il protège un vrai bug du 5/11, son dans l'écouteur).
