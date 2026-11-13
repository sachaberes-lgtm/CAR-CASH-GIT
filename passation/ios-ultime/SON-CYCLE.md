# SON-CYCLE : le son de l'app iOS quand on la quitte et qu'on y revient, et la musique figée absente (12/11/2026)

Diagnostic par lecture du code (worktree `ios-ultime`, jeu `d037802dd`), plus trois preuves exécutées : (1) `node preparer-www.js --essai` (www/ non touché) pour constater que `course/` n'est pas produit ; (2) la même fabrication avec le correctif 1 (dans une copie, dans le dossier de travail de l'agent) : `course/` présent, octets identiques ; (3) un banc simulé (Node, faux `AudioContext`) du correctif 4. **Rien n'a été modifié ni commité dans le dépôt.** Les diffs ci-dessous sont des `diff -u` faits contre les fichiers actuels : `git apply` ou `patch -p1` depuis `app-ios/` (natif, Swift, preparer-www) ou depuis `code/` (mobile-tactile).
Légende : **PROUVÉ** = lu dans le code, ou exécuté ici. **SUPPOSÉ** = comportement d'iOS / de WebKit que je ne peux pas voir sans téléphone.

## 0. Ce qu'il faut retenir

1. **Musique figée absente : cause exacte et prouvée.** `outils/retraits-publies.cjs:16` retire `assets/audio/music/course` (« une idée jamais branchée », écrit le 5/11) ; `preparer-www.js:245` appelle ce retrait. Or `pouce-bleu-jeu.js:82-110` (écrit le 9/11) charge `course/index.js` par une balise `<script>` sur téléphone : 404, `onerror` reçoit un `Event` → exactement `figée absente ([object Event])` de la boîte noire. `app-ios/www/assets/audio/music/` n'a pas de `course/` ; l'essai à blanc non plus.
2. **Le piège de la liste** : `favoris.json` (le tirage, depuis v1390/v1415) ne retient que 4 morceaux + 1 « avant ». Des 10 morceaux figés, **seuls 2 sont au tirage** : ENSEIGNE DE JADE (`bleu-7299`) et AURA · 30 (`pal-aura-30`). NÉNUPHARS VELOURS (`bleu-9551`), LUNE DE JADE (`bleu-6167`, un générateur) et FIRE PRIME · TROMPETTE (`avant:bleu-8154`) n'ont **aucun rendu figé** : ils resteront en synthèse directe sur téléphone même après le correctif 1. Les 8 autres rendus (`bleu-1275` FEU DE LUXE, etc.) ne seraient jamais tirés. Donc l'app joue la musique figée 2 fois sur 5 ; pour les 3 autres, il faut les rendre (`outils/musique/rendre-paliers.mjs --ids bleu-9551,bleu-6167,…`, ~10 min par morceau, Chrome headless ; **le rendu d'un générateur comme `bleu-6167` n'est pas garanti** : l'inventaire du 9/11 ne parle que des pages « tout ») ou accepter le direct pour eux.
3. **Poids du correctif 1 : +5,6 Mo** (bleu-7299 1,9 Mo + pal-aura-30 3,8 Mo ; www/ : 23,2 → 28,8 Mo). Les 10 rendus d'un coup : +25 Mo (à éviter : 8 ne servent à rien).
4. **Cycle de vie : le défaut de fond** : `UIApplicationSceneManifest` est dans `Info.plist:34`, donc UIKit **n'appelle plus** `applicationWillResignActive / DidEnterBackground / WillEnterForeground / DidBecomeActive` de `AppDelegate.swift:52-70` (PROUVÉ que le manifeste existe ; que UIKit n'appelle plus l'AppDelegate est le comportement documenté d'Apple, non vérifié sur l'appareil : ajouter un `CAPLog.print` pour le voir). Conséquences : `relacheSessionAudio` / `reprendSessionAudio` (la session audio à l'arrière-plan et au retour) ne tournent jamais, et **aucun signal « l'app devient inactive » n'atteint la page** (la page attend `ccInactif`, `mobile-tactile.js:559`, que personne n'envoie : grep Swift = rien). Le son n'est donc coupé que par `visibilitychange: hidden`, **sec**, après coup.
5. **Ce que le joueur entend en quittant l'app (SUPPOSÉ pour le timing iOS, PROUVÉ pour le code JS)** : la musique continue pendant le geste d'accueil, puis, à `hidden`, `natif.js:146 → musVide → ctxDort` suspend tous les contextes sans fondu et vide l'`<audio>` ; le jeu refait `AC.suspend()` (`init.js:407`) : coupure sèche, à n'importe quel point de l'onde. Pas de fondu possible car la page est gelée juste après.

## 1. Tableau des cas (a)-(i)

| cas | comportement actuel (code) | ce que le joueur entend / défaut | cause `fichier:ligne` | statut |
|---|---|---|---|---|
| (a) geste d'accueil au menu | Aucun événement avant `hidden`. À `hidden` : `natif.js:146` (capture) `musVide` → `ctxDort` (`natif.js:118-122`) `suspend()` sur tous les contextes, `<audio>` pausé et sa source retirée (`:128-137`) ; puis `init.js:405-407` `AC.suspend()` ; `musique.js:353-355` pause de l'élément ; `natif.js:268` (§9) décharge les autres `<audio>/<video>` du DOM. | Musique qui continue sur l'écran d'accueil puis **coupure sèche** (clic possible). Pas de fondu. Retour : `musRend` remet la source (`:138-145`) et la position après `loadedmetadata`, pendant que `musicJoue` (`musique.js:355`) fait déjà `play()` : risque d'un bout de début de morceau avant le saut (SUPPOSÉ, faible). | pas de fondu ; pas d'événement précoce (Swift n'envoie rien : `SceneDelegate.swift`, `AppDelegate.swift:52-70` morts) | défaut. Correctifs 2 + 4 |
| (b) pleine course | `visibilitychange` hidden : `togglePause` (`init.js:405`, sauf explosion) ; Capacitor `pause` (document) : `iosPose` ouvre le panneau PAUSE (`mobile-tactile.js:559`). Boucles (moteur, vent, nitro…) mises à gain 0 par `setTargetAtTime(…,.012)` (`init.js:365-368`) ; **mais** `natif.js` a déjà suspendu le contexte (capture, avant le jeu) : l'horloge audio est figée, les rampes vers 0 ne s'exécutent qu'au `resume`. | Le jeu se met bien en pause (PROUVÉ). Coupure sèche à la sortie. **Au retour** : le contexte est relancé par `ctxReveil` (`natif.js:123-127`, à `visibilitychange` visible, avant le jeu) alors que la course est en pause ; les boucles figées à leur gain d'avant ressortent le temps de la rampe de 12 ms (~40 ms de « queue de moteur ») avant de tomber à 0 (SUPPOSÉ : dépend de combien de la rampe a eu le temps de jouer avant le gel). Le moteur ne reste pas à ronfler : `togglePause` met tout à 0 et `busPlein`/`acReveil` rendent la sortie au REPRENDRE (`init.js:358, 380`). | `natif.js:118-127` (suspend/resume sans fondu) contre `init.js:365-379` (fondu à `d9=0` quand caché : « ni son ni délai ») | défaut mineur. Correctif 4 |
| (c) sélecteur d'apps entrouvert puis refermé | L'app est « inactive », pas en arrière-plan : ni `visibilitychange` ni `pause` Capacitor (qui n'écoute que `didEnterBackground`/`willEnterForeground`, `CapacitorBridge.swift` `setupCordovaCompatibility`). Rien ne se passe côté page. | La musique continue, **la course continue** sous le pouce qui n'est plus là (`touchcancel` lâche le volant) : la caisse file droit, partie perdue. Pas de défaut de son proprement dit. | pas de `sceneWillResignActive` : `SceneDelegate.swift` | défaut de gameplay (IOS-01 de la passe du 10/11). Correctif 2 |
| (d) verrouiller l'écran | Comme (a)/(b) : `willResignActive` puis `didEnterBackground` en peu de temps. Pas de `UIBackgroundModes` (`Info.plist` : aucun) : l'app est suspendue, aucun son possible derrière. | Coupure sèche. Au déverrouillage : retour comme (g). | idem (a) | défaut. Correctifs 2 + 4 |
| (e) appel / Siri / alarme | Interruption AVAudioSession : WebKit passe le contexte en `interrupted` et pause les `<audio>` (SUPPOSÉ). La page écoute `statechange` (`mobile-tactile.js:549-556`) et ouvre la PAUSE en course (PROUVÉ). La bannière d'appel ne cache pas la page : pas de `visibilitychange`. Fin de l'interruption : rien ne relance côté natif (`GardeHautParleur` observe `interruptionNotification` mais ne fait que `verifie()`, `JeuViewController.swift:108-109`). | Course : pause correcte, REPRENDRE relance (`audioKick`, `acReveil`). Menu : musique/sons **muets jusqu'au premier toucher** si WebKit ne relance pas seul (`audioKick` `mobile-tactile.js:529-533`, `musicDeverrouille` `musique.js:333-347`, `natif.js:89-96`). | pas d'événement « interruption finie » vers la page | défaut mineur (silence au menu). Correctifs 2 + 3 |
| (f) centre de contrôle / notifications tirés | Comme (c). | La course continue ; musique continue. | idem (c) | défaut. Correctif 2 |
| (g) retour après 5 s / 5 min / process web tué | 5 s : `visibilitychange` visible : `natif.js:96` (`reveil` à +120 ms), `ctxReveil`/`musRend`, jeu : `init.js:407` `acReveil` si `SND.sfx` et non pausé, `mobile-tactile.js:546` `panOpen(true)` + `audioKick`. Un `resume()` refusé (« Failed to start the audio device », boîte noire du 28/10) est rattrapé **au toucher suivant seulement** (`graphe-audio.js:257-262`). 5 min : même chemin ; les minuteurs en retard partent d'un coup à la reprise ; sons ponctuels gardés par `sfxOk()` (`voix-moteur.js:258`, état `running` exigé) donc pas de salve de sons en file en course ; au menu, les minuteurs en retard peuvent jouer (SUPPOSÉ, faible). Process tué : `webView.reload()` immédiat (Capacitor), page neuve, contextes neufs, le premier toucher débloque tout (`natif.js:95`) ; l'argent de la course est versé (`enCours`, `sauvegarde.js`). | Au retour sans geste, **le menu peut rester muet jusqu'au premier toucher** (resume refusé : l'app n'est pas encore tout à fait active et personne ne réactive la session audio : `reprendSessionAudio` ne tourne jamais). Process tué : musique repart au 1er toucher ; rien de cassé. Aucune trace de deux musiques superposées dans le code : un seul `<audio>#musique` (source retirée puis rendue une fois), le morceau de course vit dans le contexte suspendu (il reprend où il était, pas du début). | `natif.js:96` (un seul essai à +120 ms) ; `AppDelegate.swift:63-66` mort | défaut. Correctifs 2 + 3 |
| (h) écouteurs Bluetooth qui se déconnectent | `GardeHautParleur` (`JeuViewController.swift:99-135`) renvoie le son vers le haut-parleur du bas si la sortie devient l'écouteur d'appel. Rien d'autre : ni pause de la course ni fondu. | La musique/le jeu **sort d'un coup du haut-parleur du téléphone**, la course continue (SUPPOSÉ : iOS ne coupe pas le WebAudio sur `oldDeviceUnavailable`). | pas d'observateur `oldDeviceUnavailable` | défaut mineur. Correctif 2 |
| (i) Spotify joue déjà au lancement | `AppDelegate.swift:19` pose `.playback + .mixWithOthers` : Spotify continue. Dès que la page joue, WebKit choisit lui-même la catégorie ; sur iOS 17+ le jeu règle `navigator.audioSession.type` : `'playback'` si MUSIQUE allumée, `'ambient'` sinon (`musique.js:309`, appelé par `musicJoue` et à chaque toucher). | MUSIQUE allumée (défaut) : le type `'playback'` **coupe probablement Spotify** (le commentaire de `musique.js:304-308` le dit : « coupe l'appli audio du joueur »), `.mixWithOthers` du Swift étant réécrit par WebKit (SUPPOSÉ). MUSIQUE coupée : Spotify survit, le son du jeu suit l'interrupteur silencieux. À l'arrière-plan, `natif.js:134` pose `'ambient'` mais **personne ne désactive la session avec `notifyOthersOnDeactivation`** (code mort) : Spotify, une fois coupé, ne reprend pas tout seul au départ de l'app (SUPPOSÉ). | `musique.js:309`, `natif.js:134`, `AppDelegate.swift:30-50` jamais appelés | à vérifier au téléphone ; correctif 5 (risqué) |

## 2. Autres défauts iOS rencontrés

- **Interrupteur silencieux** : par conception (`musique.js:300-309`) : musique allumée → `playback` (ignore l'interrupteur), musique coupée → `ambient` (l'obéit). Le Swift `.playback` de `AppDelegate.swift:19` ne vaut que pour iOS 16 et le premier instant. Rien à corriger, à savoir.
- **Premier geste** : `natif.js:95` (`touchend`, `pointerup`, `click`, `keydown` en capture) + un échantillon muet par contexte ; `musicDeverrouille` (`musique.js:333`) joue un WAV de silence. OK. Le déverrouillage ne compte que `touchend` (iOS refuse `touchstart` pour l'audio) : `audioKick` écoute les deux, le second est sans effet utile.
- **Haut-parleur du haut** : couvert par `GardeHautParleur` (`overrideOutputAudioPort(.speaker)` seulement si la sortie courante est `builtInReceiver`) ; observe route, interruption, reset des services médias, `didBecomeActive`, plus un minuteur de 2 s. Correct, à garder. `reprendSessionAudio` (qui ne sert à rien tant qu'il est mort) force `.playback` et écraserait le choix de WebKit : ne pas le brancher tel quel (voir correctif 5).
- **Plafond de voix** (`sfx.js:218-220`) : 16 voix (11 au cran 1 du gouverneur, 8 au cran 2), la plus ancienne est coupée en 5 ms. Sur téléphone en frénésie des sons de pose peuvent être évincés : par conception, pas propre à iOS. Pas de lien avec le cycle de vie.
- **Aucun `onstatechange`/`statechange` côté `natif.js`** : le contexte `interrupted` n'est relancé qu'à un geste ou à `visibilitychange` visible ; pas quand l'interruption se termine sans changement de visibilité (appel/Siri) : voir (e).
- **Les `<audio>` hors DOM** (sons de mort, `new Audio(...)`) ne sont pas vus par `querySelectorAll('audio,video')` (`natif.js:250`, §9) : ils ne sont ni pausés ni déchargés à l'arrière-plan. Courts, sans conséquence.
- **`pagehide`** : `musVide` y est branché (`natif.js:147`) mais pas `pageshow` → `musRend` (seul §9 recharge à `pageshow`). Inoffensif (pas de BFCache dans une WebView applicative), à noter.
- **www/ n'est pas à jour** : `git status` montre une vingtaine de fichiers de `app-ios/www/` modifiés (le dossier est généré) ; régénérer par `npm run sync` avant tout essai sur l'appareil. L'essai à blanc réussit : 222 fichiers, 23,2 Mo.

## 3. Correctifs proposés, du plus sûr au plus risqué

Tous sont limités à l'app : `natif.js` (inerte hors Capacitor), le Swift, `preparer-www.js`, et une ligne de `code/moteur/mobile-tactile.js` qui n'écoute qu'un événement que seul le Swift envoie (le jeu web sur ordinateur ne change pas). Après avoir appliqué le diff de `code/`, assembler le jeu comme d'habitude (`--depuis-morceaux`, cache `sw.js` + 1, `npm run sync`).

### Correctif 1 : la musique figée entre dans l'app (SÛR, essayé, +5,6 Mo)
Ne touche pas `retraits-publies.cjs` (le site garde sa coupe : un téléphone en navigateur reste en direct ; sortir `course` de la coupe mettrait les 25 Mo sur le site et dans l'app). Après l'allègement, remet seulement les rendus du tirage (`favoris.json`), octets intacts (marqueur `iTunSMPB`, jamais réencoder), avec un `index.js` réduit. Essayé : `✓ ESSAI réussi`, `musique de course figée : bleu-7299, pal-aura-30 (5.6 Mo)`, 28,8 Mo, `cmp` identique sur un `.m4a`. `publier-maj.js` passe par `preparer-www.js` : les mises à jour en direct suivront. À vérifier sur téléphone : la boîte noire doit dire `musique | figée pal-aura-30` (et plus `figée absente`) ; le chargeur `fetch` du m4a passe par la rustine statut 0 de `natif.js:53-61` (déjà là).
```diff
--- a/preparer-www.js	2026-11-12 12:43:39
+++ b/preparer-www.js	2026-11-12 12:43:39
@@ -247,6 +247,20 @@
     try{execFileSync(process.execPath,[path.join(OUT,o),WWW],{stdio:['ignore','pipe','pipe']});}catch(e){meurt(o+' a échoué : '+String((e.stderr||e.stdout||e.message)).trim().slice(0,600));}}
   let n=0,o=0;const pese=d=>{for(const x of fs.readdirSync(d)){const p=path.join(d,x),s=fs.statSync(p);if(s.isDirectory())pese(p);else{n++;o+=s.size;}}};pese(WWW);nFic=n;nOct=o;
   console.log('  copie allégée : '+(av/1048576).toFixed(1)+' → '+(o/1048576).toFixed(1)+' Mo');}
+/* (2026-11-12, SON-CYCLE) LA MUSIQUE DE COURSE FIGÉE DANS L'APP. retraits-publies.cjs retire assets/audio/music/course/ (« idée jamais branchée », écrit le 5/11) ; or pouce-bleu-jeu.js
+   (figeOn(), 9/11) charge course/index.js sur téléphone : absent, la boîte noire note « figée absente ([object Event]) : le direct » et le téléphone fait tourner les ~190 oscillateurs
+   (chaleur). Ici, APRÈS l'allègement (le site garde sa coupe), on remet seulement les morceaux du TIRAGE (favoris.json) qui ont un rendu figé, octets intacts (iTunSMPB : jamais réencodés),
+   et un index.js réduit à ces morceaux. Pas de favoris.json lisible = tous les rendus. */
+{const MC=['assets','audio','music','course'],src=path.join(SRC,...MC,'index.js');
+  if(fs.existsSync(src)){let ids=null;
+    try{const f=JSON.parse(fs.readFileSync(path.join(WWW,'assets','audio','music','favoris.json'),'utf8'));if((f.ids||[]).length)ids=new Set(f.ids);}catch(e){}
+    const w={};new Function('window',fs.readFileSync(src,'utf8'))(w);const PC=w.PALIERS_COURSE||{},K={};let oc=0;
+    for(const id of Object.keys(PC)){if(ids&&!ids.has(id))continue;
+      const d=path.join(SRC,...MC,id);if(!fs.existsSync(d))meurt('musique figée : le dossier '+id+' manque dans VERSION PRINCIPALE');
+      fs.cpSync(d,path.join(WWW,...MC,id),{recursive:true});K[id]=PC[id];
+      for(const x of fs.readdirSync(d))oc+=fs.statSync(path.join(d,x)).size;}
+    if(Object.keys(K).length){fs.writeFileSync(path.join(WWW,...MC,'index.js'),'window.PALIERS_COURSE='+JSON.stringify(K)+';\n');
+      console.log('  musique de course figée : '+Object.keys(K).join(', ')+' ('+(oc/1048576).toFixed(1)+' Mo)');}}}
 relit('après l\'allègement');
 /* (2026-11-09, Perf 3 / P4-poids, GO d'OPTI ULTIME) 1. LES RENDUS PÉRIMÉS RETIRÉS : paliers/rendus/nuit-de-velours et neon-noir (4,9 Mo) ne sont plus ceux de la page (110 bpm fa mineur ≠ 92 bpm mi♭, 4 mesures ≠ 8) et ne
    sont pas dans le lot figé du téléphone. Pouce bleu (pouce-bleu-jeu.js) ne range un morceau « paliers » que si PALIERS_RENDUS en a la fiche : sans fiche, il disparaît de la liste (pas de rendu en direct).
```
Les 3 autres morceaux du tirage (NÉNUPHARS VELOURS, LUNE DE JADE, FIRE PRIME · TROMPETTE) : décision de Sacha/Léo ; soit les rendre (`node outils/musique/rendre-paliers.mjs --ids bleu-9551,bleu-6167,bleu-8154` : chaîne lourde, Chrome headless, un morceau ≈ 10 min, machine au calme), soit les sortir du tirage de l'app, soit les laisser en direct (chaleur). Le correctif 1 prend tout seul les nouveaux dossiers dès qu'ils sont dans `course/index.js` et dans `favoris.json`.

### Correctif 2 : Swift, le cycle de vie qui arrive enfin à la page (SÛR, 1 des 3 pièces à tester sur l'appareil)
`SceneDelegate` envoie `ccInactif` (perte du premier plan) et `ccActif` (retour : la session audio est réactivée SANS changer de catégorie, puis la page relance son contexte) ; `GardeHautParleur` envoie `ccActif` à la fin d'une interruption (appel, Siri, alarme) et `ccSortieSon` quand la sortie (Bluetooth, casque) disparaît. Côté page, `ccInactif` fait déjà ouvrir la PAUSE en course (code existant, `mobile-tactile.js:559`, qui attendait ce signal) ; une ligne de plus lui fait écouter `ccSortieSon`. `swiftc -parse` passe sur les deux fichiers (syntaxe seulement ; la compilation Xcode reste à faire, `Capacitor` n'étant pas typable hors projet). Effet de bord voulu : tout ce qui rend l'app inactive (fenêtre de permission, feuille d'achat StoreKit) met aussi la course en pause.
```diff
--- a/SceneDelegate.swift	2026-11-12 12:43:39
+++ b/SceneDelegate.swift	2026-11-12 12:44:40
@@ -1,4 +1,5 @@
 import UIKit
+import AVFoundation
 import Capacitor
 
 class SceneDelegate: UIResponder, UIWindowSceneDelegate {
@@ -14,6 +15,30 @@
         SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
     }
 
+    // (2026-11-12, SON-CYCLE) LE CYCLE DE VIE VIT ICI. Avec un manifeste de scènes (Info.plist), UIKit n'appelle plus applicationWillResignActive / DidEnterBackground /
+    // WillEnterForeground / DidBecomeActive de l'AppDelegate (relacheSessionAudio et reprendSessionAudio n'ont jamais tourné) : seules les méthodes de la scène arrivent.
+    // `ccInactif` : l'app perd le premier plan (geste d'accueil, verrouillage, centre de contrôle ou de notifications, appel, Siri, sélecteur d'apps). La page y ouvre la PAUSE
+    // en course (mobile-tactile.js, iosPose) et fait un fondu du son (natif.js 4 ter). `ccActif` : de retour — la page relance son contexte audio (natif.js, 4 essais).
+    private var etaitDerriere = false
+
+    private func dis(_ nom: String) {
+        guard let vue = (window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView else { return }
+        vue.evaluateJavaScript("window.dispatchEvent(new Event('\(nom)'));", completionHandler: nil)
+    }
+
+    func sceneWillResignActive(_ scene: UIScene) { dis("ccInactif") }
+
+    func sceneDidEnterBackground(_ scene: UIScene) { etaitDerriere = true }
+
+    func sceneDidBecomeActive(_ scene: UIScene) {
+        if etaitDerriere {
+            etaitDerriere = false
+            // la session audio d'abord (sans changer de catégorie : c'est WebKit qui la choisit), puis la page : son resume() ne se fait plus refuser (« Failed to start the audio device »)
+            try? AVAudioSession.sharedInstance().setActive(true)
+        }
+        dis("ccActif")
+    }
+
     func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
         SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
     }
--- a/JeuViewController.swift	2026-11-12 12:43:39
+++ b/JeuViewController.swift	2026-11-12 12:44:40
@@ -18,7 +18,7 @@
         bridge?.registerPluginInstance(Achats())
 
         // Le son sort par les haut-parleurs, jamais par l'écouteur du haut (voir GardeHautParleur).
-        GardeHautParleur.partage.demarre()
+        GardeHautParleur.partage.demarre(bridge?.webView)
 
         // L'état thermique réel du téléphone, dit au jeu (voir GardeThermique).
         GardeThermique.partage.demarre(bridge?.webView)
@@ -99,14 +99,30 @@
 final class GardeHautParleur {
     static let partage = GardeHautParleur()
     private var lance = false
+    private weak var vue: WKWebView?
 
-    func demarre() {
+    // (2026-11-12, SON-CYCLE) dit un événement à la page (window) : `ccActif` à la fin d'un appel / de Siri / d'une alarme (natif.js relance le contexte audio sans attendre un toucher),
+    // `ccSortieSon` quand la sortie (Bluetooth, casque) disparaît (mobile-tactile.js : pause de la course, le son ne repart pas d'un coup dans le haut-parleur du téléphone).
+    private func dit(_ nom: String) {
+        vue?.evaluateJavaScript("window.dispatchEvent(new Event('\(nom)'));", completionHandler: nil)
+    }
+
+    func demarre(_ vue: WKWebView?) {
+        self.vue = vue
         guard !lance else { return }
         lance = true
         let centre = NotificationCenter.default
         let s = AVAudioSession.sharedInstance()
-        centre.addObserver(forName: AVAudioSession.routeChangeNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
-        centre.addObserver(forName: AVAudioSession.interruptionNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
+        centre.addObserver(forName: AVAudioSession.routeChangeNotification, object: s, queue: .main) { [weak self] n in
+            self?.verifie()
+            if let r = n.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
+               AVAudioSession.RouteChangeReason(rawValue: r) == .oldDeviceUnavailable { self?.dit("ccSortieSon") }
+        }
+        centre.addObserver(forName: AVAudioSession.interruptionNotification, object: s, queue: .main) { [weak self] n in
+            self?.verifie()
+            if let r = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
+               AVAudioSession.InterruptionType(rawValue: r) == .ended { self?.dit("ccActif") }
+        }
         centre.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
         centre.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in self?.verifie() }
         verifie()
```
Fichier `code/moteur/mobile-tactile.js` (chemin relatif à `code/`) :
```diff
--- a/mobile-tactile.js	2026-11-12 12:43:39
+++ b/mobile-tactile.js	2026-11-12 12:43:40
@@ -556,7 +556,7 @@
     }catch(e){} }); }catch(e){} }
   addEventListener('touchend',appelGuette,{passive:true}); appelGuette();
   /* (2026-11-10, debug gameplay IOS-01) L'APP iOS : Capacitor envoie `pause` à document quand l'app part en arrière-plan (verrouillage compris) — `visibilitychange` n'arrive pas toujours dans la vue web (gels de 2 à 14 min « page visible » dans la boîte noire du 28/10) : sans lui, la course repartait sans pause au déverrouillage. `ccInactif` : réservé au natif (centre de notifications, appel) — inerte tant que le Swift ne l'envoie pas. */
-  {const iosPose=function(){try{fjoyRaz();}catch(e){} /* (2026-11-10, debug JC-06) le joystick NITRO aussi (doigt, requête, pion allumé) : sur ce chemin ni blur ni visibilitychange n'arrivent, ce qui remettait le joystick à zéro (EE-03 retiré à la fusion) */try{if(started&&!gameOver&&!paused&&mode!=='boom'&&pan&&!pan.classList.contains('open'))panOpen(true);}catch(e){}};document.addEventListener('pause',iosPose);addEventListener('ccInactif',iosPose);}
+  {const iosPose=function(){try{fjoyRaz();}catch(e){} /* (2026-11-10, debug JC-06) le joystick NITRO aussi (doigt, requête, pion allumé) : sur ce chemin ni blur ni visibilitychange n'arrivent, ce qui remettait le joystick à zéro (EE-03 retiré à la fusion) */try{if(started&&!gameOver&&!paused&&mode!=='boom'&&pan&&!pan.classList.contains('open'))panOpen(true);}catch(e){}};document.addEventListener('pause',iosPose);addEventListener('ccInactif',iosPose);addEventListener('ccSortieSon',iosPose); /* (SON-CYCLE) Swift : la sortie son (Bluetooth, casque) vient de disparaître → pause */}
   /* (même passe) l'appli passe derrière en plein appui : le volant est lâché plus haut (stUp), la NITRO et les flèches aussi — comme au
      `blur` (voir curseurs), qu'une WebView n'envoie pas toujours. Sans ça, une touche restée « enfoncée » repartait au REPRENDRE. */
   addEventListener('visibilitychange',function(){ if(!document.hidden)return; try{ for(const k in keys)keys[k]=false;
```

### Correctifs 3 et 4 : `natif.js` (un seul diff, deux étages)
**3 : le retour relance le son sans attendre un toucher (SÛR).** `reveil()` est déjà là ; au lieu d'un essai à +120 ms, quatre essais (0, 250, 800, 2000 ms) à `visibilitychange` visible et à `ccActif`. Un contexte que le jeu a endormi (`__ccVeille`) n'est jamais touché : la logique existante reste. Réponse au refus « Failed to start the audio device ».

**4 : le fondu de sortie (MOYEN : à écouter sur le téléphone).** Chaque contexte du jeu reçoit un gain de sortie entre tout ce qu'il joue et sa destination : `AudioNode.prototype.connect` redirige les branchements vers `destination` (un patch, au branchement ; pas sur le chemin chaud). `ccInactif`, `pause` Capacitor et `hidden` baissent ce gain en 90 ms ; le `suspend()` demandé par le jeu (`init.js:407`) et le `musVide` de natif attendent la fin du fondu (≤ 100 ms, et seulement si la page est encore cachée à ce moment-là : sinon rien ne se suspend à tort au dégel). Le gain remonte à `ccActif`, au `visibilitychange` visible (+150 ms, pour que les boucles du jeu soient à 0 d'abord : plus de queue de moteur) et **au premier toucher** (filet : un fondu qui ne se relèverait pas rendrait l'app muette). Essayé sur un banc simulé (Node, faux `AudioContext`) : branchement redirigé (`MASTER → gain → DEST`), fondu à `ccInactif`, `suspend()` retardé de 100 ms, remontée au toucher. **Non essayé sur WebKit/iOS.** Retour arrière : retirer le bloc « 4 ter » et les deux modifications de `suspend` et de `visibilitychange` (musVide) ; le correctif 3 est indépendant. Ne couvre pas les `<audio>` pausés directement par le jeu (volume en lecture seule sur iOS), seulement ce qui passe par le contexte : sur iOS 17+ avec `MUS_WA` la musique y passe (`musique.js:238` → `MASTER._lim` → destination).
```diff
--- a/natif.js	2026-11-12 12:43:39
+++ b/natif.js	2026-11-12 12:43:40
@@ -77,12 +77,15 @@
      SANS que le jeu l'ait endormi (politique d'autoplay, ou « interrupted » après un appel) est relancé, et reçoit une fois un
      échantillon muet (le vieux déverrouillage d'iOS). Un contexte que le jeu a mis en veille (suspend : son coupé, pause) n'est
      jamais touché : c'est le jeu qui le réveillera. */
-  var AC0=window.AudioContext||window.webkitAudioContext,CTX=[];
+  var AC0=window.AudioContext||window.webkitAudioContext,CTX=[],baisseT=0; // baisseT : l'heure où le fondu de sortie (4 ter) a commencé, 0 = sortie à plein
   if(AC0)try{
     var AC=function(){var c=Reflect.construct(AC0,arguments,new.target||AC);CTX.push(c);return c;};
     AC.prototype=AC0.prototype;Object.setPrototypeOf(AC,AC0);
     var su=AC0.prototype.suspend,re=AC0.prototype.resume;
-    AC0.prototype.suspend=function(){this.__ccVeille=true;return su.apply(this,arguments);};
+    /* (SON-CYCLE) un suspend() demandé pendant le FONDU DE SORTIE (4 ter) attend la fin du fondu (≤ 100 ms) : le jeu endort son contexte sec dès `hidden` (init.js, visibilitychange) */
+    AC0.prototype.suspend=function(){this.__ccVeille=true;var me=this,args=arguments,reste=baisseT?baisseT+100-Date.now():0;
+      if(reste>0&&reste<=100)return new Promise(function(ok){setTimeout(function(){ok(me.__ccVeille&&me.state==='running'?su.apply(me,args):undefined);},reste);});
+      return su.apply(this,arguments);};
     AC0.prototype.resume=function(){this.__ccVeille=false;return re.apply(this,arguments);};
     window.AudioContext=AC;if(window.webkitAudioContext)window.webkitAudioContext=AC;
   }catch(e){dit('déverrouillage audio indisponible',e&&e.message);}
@@ -93,8 +96,34 @@
         s.buffer=b;s.connect(c.destination);s.start(0);c.__ccAmorce=true;}catch(e){}}}
   };
   ['touchend','pointerup','click','keydown'].forEach(function(t){addEventListener(t,reveil,{capture:true,passive:true});});
-  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(reveil,120);});
+  /* (SON-CYCLE) au retour, iOS refuse souvent le resume() tant que l'app n'est pas tout à fait active (« Failed to start the audio device », boîte noire du 28/10) : quatre essais espacés,
+     sans attendre le toucher. `ccActif` vient de Swift (SceneDelegate : sceneDidBecomeActive, fin d'une interruption audio). Un contexte que le jeu a endormi (__ccVeille) n'est jamais touché. */
+  var reessais=function(){[0,250,800,2000].forEach(function(d){setTimeout(function(){if(!document.hidden)reveil();},d);});};
+  document.addEventListener('visibilitychange',function(){if(!document.hidden)reessais();});
+  addEventListener('ccActif',reessais);
 
+  /* ---- 4 ter. LE FONDU DE SORTIE (2026-11-12, SON-CYCLE) ----
+     Quitter l'app coupait le son SEC : au geste d'accueil la musique continuait par-dessus l'écran d'accueil, puis `visibilitychange` (hidden) suspendait tout d'un coup, à n'importe quel point de l'onde
+     (clic, queue de son figée qui ressort au retour). Ici chaque contexte du jeu a un GAIN DE SORTIE posé entre tout ce qu'il joue et sa destination (connect() vers la destination est redirigé : un seul
+     patch, au branchement). Swift envoie `ccInactif` dès que l'app perd le premier plan (geste d'accueil, verrouillage, centre de contrôle, appel, sélecteur d'apps) : fondu de 90 ms ; `pause` (Capacitor,
+     passage en arrière-plan) et `hidden` le font aussi s'il n'a pas eu lieu, et DIFFÈRENT de ≤ 100 ms l'endormissement des contextes (suspend ci-dessus, musVide plus bas). Retour : `ccActif`,
+     `visibilitychange` visible (le jeu remet ses boucles à zéro d'abord : +150 ms) ou le PREMIER TOUCHER — un fondu qui ne se relèverait pas rendrait l'app muette, le toucher est le filet. */
+  var AN=window.AudioNode,cn0=AN&&AN.prototype.connect,DN=window.AudioDestinationNode;
+  var sortieDe=function(c){var g=c.__ccSortie;if(!g&&cn0){try{g=c.createGain();cn0.call(g,c.destination);c.__ccSortie=g;}catch(e){g=null;}}return g;};
+  if(cn0&&DN)try{AN.prototype.connect=function(d){
+    if(d instanceof DN&&d.context&&CTX.indexOf(d.context)>=0){var g=sortieDe(d.context);if(g&&g!==this)arguments[0]=g;}
+    return cn0.apply(this,arguments);};}catch(e){dit('fondu de sortie indisponible',e&&e.message);}
+  var rampe=function(c,v,tau,delai){var g=c.__ccSortie;if(!g||c.state==='closed')return;
+    try{var P=g.gain,t=c.currentTime,t1=t+(delai||0);P.cancelScheduledValues(t);P.setValueAtTime(P.value,t);
+      if(v===0)P.setTargetAtTime(0,t,tau);else{P.setTargetAtTime(1,t1,tau);P.setValueAtTime(1,t1+tau*6);}}catch(e){}};
+  var baisse=function(){if(baisseT)return;baisseT=Date.now()||1;CTX.forEach(function(c){rampe(c,0,.03);});};
+  var releve=function(delai){if(!baisseT)return;baisseT=0;CTX.forEach(function(c){rampe(c,1,.05,delai);});};
+  addEventListener('ccInactif',baisse);
+  addEventListener('ccActif',function(){releve(0);});
+  document.addEventListener('pause',baisse);
+  document.addEventListener('visibilitychange',function(){if(document.hidden)baisse();else releve(.15);},true);
+  ['touchstart','pointerdown'].forEach(function(t){addEventListener(t,function(){releve(0);},{capture:true,passive:true});});
+
   /* ---- 5. L'ÉCRAN DE LANCEMENT ---- (2026-11-05, Opus : jury IOS-20) launchAutoHide:false dans capacitor.config.json : l'écran natif
      ne s'efface plus seul au bout de 4 s (sur un iPhone lent, le grand script n'avait pas fini : un fond violet nu pendant des secondes).
      Le vrai signal, c'est ici : DOMContentLoaded arrive APRÈS l'exécution du grand script de la page. Filet : 30 s quoi qu'il arrive. */
@@ -143,7 +172,11 @@
     el.addEventListener('loadedmetadata',function r(){el.removeEventListener('loadedmetadata',r);try{if(m.t>0&&m.t<(el.duration||1e9))el.currentTime=m.t;}catch(e){}});
     dit('musique : source rendue');
   }catch(e){}};
-  document.addEventListener('visibilitychange',function(){if(document.hidden)musVide();else musRend();},true);
+  /* (SON-CYCLE) à `hidden`, la source de la musique n'est retirée qu'APRÈS le fondu (≤ 100 ms ; tout de suite s'il a déjà eu lieu au `ccInactif`) et seulement si la page est encore cachée */
+  document.addEventListener('visibilitychange',function(){
+    if(document.hidden){var reste=baisseT?baisseT+100-Date.now():100;
+      if(reste>0&&reste<=100)setTimeout(function(){if(document.hidden)musVide();},reste);else musVide();}
+    else musRend();},true);
   addEventListener('pagehide',musVide);
 
   /* ---- 7. LES MISES À JOUR EN DIRECT (2026-10-14, oui de Sacha) ----
```

### Correctif 5 : la session audio à l'arrière-plan, pour libérer Spotify et la vignette (RISQUÉ, non écrit en diff, à ne tenter qu'après les 1-4)
Reprendre les deux méthodes mortes de `AppDelegate.swift:30-50` dans `SceneDelegate` (`sceneDidEnterBackground` → `relacheSessionAudio(4)` ; le `setActive(true)` du correctif 2 existe déjà au retour). **Ne pas** reprendre le `setCategory(.playback, …)` de `reprendSessionAudio` : il écraserait la catégorie que WebKit/le jeu a choisie (`ambient` quand la musique est coupée). Risque : `setActive(false)` échoue tant que WebKit a des entrées/sorties actives (d'où les 4 reprises à 0,6 s) et WebKit peut croire sa session encore active ; à valider avec Spotify en lecture, puis lancer le jeu, le quitter, regarder si Spotify reprend. Avant tout : mesurer (i) et ajouter un `CAPLog.print` dans `applicationDidEnterBackground` pour confirmer qu'il n'est pas appelé.

## 4. Ce que je n'ai pas pu vérifier sans téléphone

1. Que UIKit n'appelle pas les méthodes de l'AppDelegate avec le manifeste de scènes (documenté, probable, non vu).
2. Le délai réel entre `sceneWillResignActive` et `visibilitychange: hidden` au geste d'accueil et au verrouillage (si < 90 ms, le fondu du correctif 4 se fait surtout grâce au report de 100 ms du `suspend`, et dépend de la durée de vie de la page après `hidden`).
3. Combien de temps la page web vit encore après `hidden` avant d'être gelée (les 4 reprises à 0,6 s de `relacheSessionAudio` suggèrent ≥ 2 s).
4. Si WebKit relance seul le contexte `interrupted` à la fin d'un appel/Siri (si oui, `ccActif` est redondant mais inoffensif).
5. Si le centre de contrôle, le sélecteur d'apps et les bannières provoquent `visibilitychange` sur iOS 26 (je suppose que non : seulement scène inactive).
6. La queue de son rejouée au retour (cas b) : audible ou non ; dépend de la durée entre `suspend()` asynchrone et l'exécution des rampes.
7. Spotify (cas i) : si le type `'playback'` le coupe vraiment sous WKWebView et s'il reprend au départ de l'app.
8. Le comportement de `AVAudioSession.setActive(true)` au retour (correctif 2) quand WebKit tient déjà la session : à surveiller dans la console Xcode.
9. Compilation Xcode des deux fichiers Swift (seul `swiftc -parse` a passé).
10. Le rendu figé joué dans l'app : seulement la fabrication a été vérifiée, pas le décodage `decodeAudioData` d'un `.m4a` figé sous `capacitor://` (le chemin `fetch` est celui des autres sons, rustiné par `natif.js:53-61`).

## 5. Prouvé par le code / supposé

- **Prouvé** : cause de la musique figée (chaîne `retraits-publies.cjs:16` → `preparer-www.js:245` → `pouce-bleu-jeu.js:110`, essai à blanc) ; tirage = 2 morceaux sur 5 avec rendu ; poids ; manifeste de scènes présent, aucun Swift n'envoie `ccInactif`/`ccActif` ; pas de `UIBackgroundModes` ; ordre des écouteurs au `hidden` (natif en capture avant le jeu) ; absence de fondu à `hidden` ; `reveil` un seul essai ; `pagehide` sans `pageshow` ; guards `sfxOk`, `acVeut`, `acReveil` ; la page pause bien la course sur `hidden` et `pause` Capacitor, et sur `interrupted`.
- **Supposé** : le moment où iOS déclenche chaque événement ; la queue de son rejouée ; Spotify ; WebKit relançant seul le contexte ; le comportement de la session audio.
