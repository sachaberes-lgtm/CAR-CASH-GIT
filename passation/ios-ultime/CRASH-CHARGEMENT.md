# CRASH-CHARGEMENT — plantages, gels et chargement de l'app iOS (ios-ultime, 2026-11-12)

Agent CRASH-CHARGEMENT. DIAGNOSTIC SEUL : rien modifié, rien commité, rien installé sur le téléphone (lecture des rapports par `devicectl`).
Légende : **FAIT** = lu dans un rapport / un journal / une ligne de code. **HYPOTHÈSE** = déduction non prouvée.
Numéros de ligne : branche `ios-ultime` (d037802dd).

---------------------------------------------------------------------------------------------------
## 1. LES VRAIS PLANTAGES (rapports du téléphone)

### Comment les lire (pymobiledevice3 échoue : « usbmux has no device » — le 13 Pro n'est vu que par CoreDevice)
```
D=FE6F8B40-DCFF-5E04-B578-871A79EDCF17
xcrun devicectl device info files --device $D --domain-type systemCrashLogs        # liste (210 lignes, ~10 s)
xcrun devicectl device copy from --device $D --domain-type systemCrashLogs --source "Retired/JetsamEvent-2026-11-06-013305.ips" --destination ./x.ips
```
`~/Library/Logs/CrashReporter/MobileDevice/` est VIDE (Xcode n'a rien synchronisé). Copie locale de ce que j'ai tiré : `/tmp/claude-501/crash/` (effaçable).

### FAIT : aucun rapport `.ips` de plantage de l'app (`App`, `com.sachaberes.carcash`) ni de `com.apple.WebKit.WebContent` / `.GPU` dans la liste.
Aucun `App-….ips`, aucun `WebContent-….ips` (type 109 / 309), aucun watchdog 0x8badf00d, aucune exception. Ce que le téléphone contient depuis le 5/11 :

| date | fichier | lien avec l'app | contenu |
|---|---|---|---|
| **06/11 01:33** | `Retired/JetsamEvent-…-013305` | **OUI : le seul vrai kill** | processus **`com.apple.WebKit.GPU` tué, raison `highwater`, 19 648 pages = **307 Mo**, au premier plan** (`frontmost`), coalition 1348 = celle de `App`. Au même instant `com.apple.WebKit.WebContent` de l'app pèse **84 598 pages = 1,32 Go** (`lifetimeMax` identique à peu près), `App` 46 Mo. Le téléphone est plein : TikTok 963 Mo (suspendu), Instagram 448 Mo, `compressorSize` 112 314 pages. |
| 08/11 16:30 | `Retired/JetsamEvent-…-163044` | oui (témoin, pas de kill de l'app) | `App` frontmost 19 Mo ; WebContent **35 822 pages = 587 Mo** (pic 603 Mo) ; **GPU 5 099 pages = 83 Mo** (pic 10 639 = **174 Mo**). Tués : MTLCompilerService (vm-compressor-thrashing), Spotlight. |
| 05/11, 07/11, 09/11 15:07, 09/11 20:48, 11/11 04:04 | `JetsamEvent-…` | non | App absente de la liste des tués ; largest process = Instagram / TikTok / RiderWorlds (autre app de Sacha) / Maps. Le jeu n'y figure pas ou à 37 Mo (11/11). |
| 07/11 → 09/11 (13 fichiers) + 11/11 23:21 | `com.apple.WebKit.WebContent.cpu_resource-…` | oui, mais **ce n'est pas un plantage** | « 90 s de CPU sur 134-179 s (50-67 %), limite 50 %/180 s », `Action taken: none`. Le jeu consomme ; iOS le note, ne fait rien. |
| 08/11 22:47 | `Retired/ResetCounter-…-224709` | indirect | `Boot faults: rst wdog` = **le téléphone entier a redémarré (watchdog matériel)**, 1 min après un `LowBatteryLog` (22:46). HYPOTHÈSE : batterie basse + charge GPU/CPU du banc (nuit du 8/11) → coupure de tension ; pas un bug de l'app. |

### FAIT : la boîte noire (cashcarErr du 12/11 12:28) confirme le même scénario, rarement
- `09/11 21:56 contexte | perdu 1605.8 s … textures 210 géométries 867 programmes 253 · partie n°23` (build 336698a) = **un** `webglcontextlost` réel, au bout de 27 min et 23 parties. Rien d'équivalent sur `bfd4555` (les 2 sessions de 20 min du 12/11 : 0 perte). Les programmes sont passés de 253 à 176-197 entre-temps.
- `09/11 04:42 banc | ⚠ PLANTAGE OU RECHARGEMENT : la session d'avant (run 17, v a40f5bf) s'est arrêtée à « partie 1 · 270 s »` après un gel de 2,2 s à 04:30. **Aucun JetsamEvent ni .ips à cette heure.** HYPOTHÈSE : verrouillage d'écran du banc (« wakeLock refusé : Permission was denied » est écrit au début de chaque run) plus que kill ; non prouvé.
- Aucune ligne `erreur` / `promesse` / `boucle` / `panne` / `son` sur `bfd4555`.

**Verdict** : un seul kill documenté en 7 jours (GPU `highwater` à 307 Mo, 06/11, build plus lourd), la page revient seule (voir §2). Pas de plantage de l'app elle-même. Ce qui reste du « on a eu des crashs » = gels longs (§4), rechargements après perte du contexte (§2), et ce que le téléphone ne rapporte pas (un WebContent tué pour la mémoire ne fait pas toujours de rapport : aucune preuve pour ou contre — voir correctif C2 pour le savoir).

---------------------------------------------------------------------------------------------------
## 2. QUAND LE PROCESSUS WEB MEURT OU QUE LE CONTEXTE WEBGL EST PERDU

### FAIT
- **WebContent tué** : Capacitor 8.5.3 `WebViewDelegationHandler.swift:164-167` : `bridge?.reset(); webView.reload()` (reset = vide les appels en attente et les écouteurs de plugins : `CapacitorBridge.swift:315-318`, **n'enlève pas** nos plugins `GardeNavigation`, `SerpentNatif`, `Achats`). Rien dans `JeuViewController.swift` / `AppDelegate.swift` ne surcharge ça (grep : aucun `webViewWebContentProcessDidTerminate`). Le joueur voit : écran blanc/noir (la vue est noire, `isOpaque=true`, `JeuViewController.swift:41-47`) → `natif.js` §5 rappelle `SerpentNatif.montre` (le serpent natif revient) → **tout le lancement à froid recommence : 13-16 s** (§4) → logo/intro → menu. **La course en cours est perdue** (argent non encore versé) : `enCoursPose` n'est appelée qu'à l'arrière-plan et à la perte du contexte (`init.js:405-408`, `palier-appareil.js:182-183,197`). Le miroir `cashcarSave` (Preferences) et `localStorage` sont intacts (`sauvegarde.js:206-275`, `pagehide` : `sauvegarde.js:345`).
- **Contexte WebGL perdu** (`rendu/palier-appareil.js:182-197`) : `preventDefault` ; sauvegarde (`enCoursPose` + `SAVE.flush`) ; rechargement à la restauration (`ctxRecharge`, :193) ; filet de 5 s si perdu au premier plan et jamais rendu ; filet 1,5 s au retour d'arrière-plan ; compteur `ccCtxPerdu` limité aux pertes rapprochées (< 2 min) ; à la 4e perte rapprochée l'écran « CASH CAR a calé / RELANCER » (`__crash`, `debut-corps.html:74-90`). La partie en cours est posée **avant** la perte. C'est solide et correspond au scénario du 06/11 (GPU tué → contexte perdu).
- Filets JS de démarrage : `window.error` / `unhandledrejection` (`debut-corps.html:238-248`) → écran « a calé » **seulement avant `__gameReady`** (posé à ~1,2 s, `desktop-banc.js:295`) ; après, la boîte noire note et la partie continue. Chien de garde 8 s « jamais démarré » (`debut-corps.html:255-262`) qui s'efface si le jeu démarre finalement. Boucle de jeu qui plante à chaque image → écran RELANCER.
- Sauvegarde corrompue : `sauvegarde.js:209` garde le texte brut dans `cashcarSave_corrompue` au lieu d'écraser. `localStorage` plein : tous les `setItem` sont dans un `try`. Boîte noire plafonnée à 20 000 octets (`debut-corps.html` `MAXO`).

### HYPOTHÈSES (à vérifier sur le téléphone)
- H2a. `webView.reload()` juste après la mort du processus peut ne rien faire si `webView.url == nil` (mort pendant le tout premier chargement) → écran noir définitif. Non observé, mais **aucun filet natif** n'existe (le filet JS ne tourne pas : la page n'existe plus). → C1.
- H2b. Un kill de WebContent n'est pas visible dans la boîte noire (la page meurt, rien n'est écrit, la nouvelle page ne sait pas que l'ancienne a été tuée). On ne peut donc pas dire aujourd'hui combien de fois ça arrive à Sacha. → C2.

### Filet minimal proposé (rechargement propre + sauvegarde intacte)
La sauvegarde est déjà intacte et Capacitor recharge. Il manque (1) un filet natif si le rechargement échoue (C1), (2) un témoin dans la boîte noire (C2), (3) optionnel : poser `enCoursPose()` au `pagehide` (C6).

---------------------------------------------------------------------------------------------------
## 3. LA MÉMOIRE

### FAIT (chiffres)
- Mesures de jetsam (seules mesures de mémoire réelles, `performance.memory` est absent sur iOS : « tas - » dans toutes les lignes `memoire`) :
  - 06/11 01:33 : WebContent **1,32 Go**, GPU tué à **307 Mo** (build d'avant les allègements de la passe 3).
  - 08/11 16:30 : WebContent **0,59 Go** (pic 0,60), GPU **0,08 Go** (pic **0,17 Go**), App 19-25 Mo.
  - 11/11 04:04 : un WebContent à 37 Mo (la page du jeu au menu / endormie).
- Compteurs three.js sur `bfd4555` (lignes `memoire`, fin de chaque partie) : **textures 118-142 plates**, **programmes 176-177 plats** ; **géométries 312 → 1483 en dents de scie** (12/11 01:04 : 1480 ; partie suivante 765 ; puis 816, 1194, 1184, 775, 438 ; 11/11 19:03 : 1483). Ce n'est pas une pente : **c'est le poids de la map tirée**, les géométries retombent à 438-775 à la partie suivante → le `dispose` du changement de map marche. Sur `336698a` (09/11) : textures 210, géométries 867, programmes 253 après 23 parties : pas de montée visible non plus (un seul point).
- Grotte (`maps/grotte-travailleur.js:62-63`) : « le travailleur garde ≈ 11,4 Mo de grille + 1,8 Mo de tampons + ≤ 12 tronçons d'avance » jusqu'à `grotteVide` (`grwFin`). Négligeable devant 600 Mo.
- Au lancement, ce qui pèse : le script (`jeu fichier`, ~4,5-5 Mo de JS parsé), la chauffe de ~176 programmes (Metal), les photos de la boutique (textures de canvas lazy : `photos 0 restantes` au démarrage), les cibles de rendu du bloom.

### Estimation du pic et iPhone 4 Go (HYPOTHÈSE, chiffres Apple non publiés)
- Pic mesuré récent (08/11) : WebContent ≈ 0,6 Go + GPU ≈ 0,17 Go ≈ **0,8 Go pour l'app** ; pic ancien : 1,3 Go + 0,3 Go. Depuis le 8/11 on a ajouté (caisses, musique, intro 1.61, grotte plus riche : 1483 géométries) — **non remesuré** (pas de jetsam depuis le 09/11 ; seul un jetsam d'une autre app ou une pression mémoire en produit).
- Plafonds empiriques connus (non officiels) : un iPhone 4 Go (11, 12, 13, SE 2022) tue une app/WebContent au premier plan vers **1,4-2 Go**, et surtout tue d'abord ce qui est suspendu ; le processus GPU de WebKit a un seuil `highwater` bien plus bas que WebContent (**307 Mo observé sur 6 Go**, plus bas sur 4 Go probablement). **Le maillon faible est le GPU, pas le JS** : 174 Mo de pic contre 307 Mo de kill = marge ×1,75 sur 6 Go, ≈ ×1,2-1,5 sur 4 Go (à prouver).
- Conclusion : WebContent à 0,6 Go tient sur 4 Go (marge ×2-3). Le jeu **peut** tenir sur 4 Go, à condition que les textures/cibles de rendu restent < ~150 Mo et qu'on ne rouvre pas une fuite. Je ne peux pas l'affirmer sans mesurer sur un 4 Go (Léo a un iPhone 15 : 6 Go, aussi) — **il n'y a aucun iPhone 4 Go dans le parc de test**. Le palier moteur réduit déjà DPR (ALLEGE : `rendu/palier-appareil.js:197-199`, DPR plafonné à 1 sur ALLEGE) : c'est le bon levier.
- Où chercher si on veut baisser : (a) tailles des cibles de rendu du bloom et des ombres sur ALLEGE ; (b) textures de canvas de la boutique (photos) libérées au `resetGame` ? (je n'ai pas vérifié chaque `.dispose()`) ; (c) tampons audio décodés (`sfx.js` + `sons-banque.js`, musique par paliers) : taille non mesurée.
- C3 (journal) ajoute la map et le nombre de cibles au `memoire` pour qu'une mesure future soit exploitable.

---------------------------------------------------------------------------------------------------
## 4. LE CHARGEMENT

### FAIT — chronologie du lancement à froid (boîte noire, `bfd4555`, 12/11 11:45-11:46, 13 Pro ; l'autre à 01:23 est identique à 3 s près)
| t depuis `timeOrigin` | événement | qui bloque le fil |
|---|---|---|
| 0,18 s | first-contentful-paint (écran noir + serpent NATIF, dessiné par iOS hors du processus web : fluide quoi qu'il arrive, `JeuViewController.swift` `SerpentVue`) | — |
| 0,2 s | **trou 763 ms** « fil libre » + `texImage2D 23 ms` | lecture/compilation du script `jeu.js` (`origine→DCL 1041 ms`) ; le fil n'est pas occupé par du JS mais par WebKit |
| 0,5 s | renderer créé (29 ms), 1er clear | — |
| 0,9 s | trou 156 ms : `image loop 52 + étape piste 47` | étapes du chargement (30 étapes au total) |
| 1,2 s | `__gameReady` (prêt du chien de garde) | — |
| 1,8 s | **trou 872 ms** : `minuteur chauffe 388 + étape piste 43`, `getProgramInfoLog` (pile : `acquireProgram` three) | liaison d'un programme sans attendre KHR : le fil attend Metal |
| 3,2 s | trou 457 ms : `image loop 321`, `texImage2D 12` | envoi de textures |
| 6,0 s | « coup de l'appui pré-rendu en 481 ms » | précalcul du son/boule d'intro |
| 6 → 10 s | pas de trou > 120 ms ; `attente | attend « chauffe » à 10,2 s` | **pas un blocage** : travail paré en tranches de quelques ms par image, derrière le serpent (la chauffe des 176 programmes, Metal) |
| **13 s** | « mode 1 · prêt en 13 s : lier 332 ms, chauffe 65 ms, photos 0, étapes 30 » | fin du travail ; le film part 400 ms plus tard (`INTRO_DRAIN`) |
| 13,9 s | boule d'intro prête ; image la plus lente du film 972 ms (la toute première) | — |
| 15,3 s | fin du guet : 6 trous > 120 ms, pire 872 ms | — |

- Lancement du 12/11 01:23 : même profil, trou max **1028 ms à 0,2 s**, prêt à **16 s**.
- **Les 13-16 s sont voulus** : `INTRO_APRES = 1` sur téléphone (`intro-161.js:63-66`, décision de Sacha le 8/11 : « rallonge le temps de chargement s'il le faut ») ; `introPrete()` (`intro-161.js:1003-1013`) attend étapes, liaison, chauffe, tôles, départ d'avance, photos. Plafond 30 s. Le joueur voit : noir + serpent natif fluide. Pas de gel perçu pendant ce temps (les trous de 0,5-1 s sont masqués par le serpent natif, d'où le « il charge » sans « il fige »).
- **Ce qui est certain comme cause de temps** : la compilation Metal des programmes à froid (la même note, `piste-prebati.js:369-372`, mesurait 26 s sur l'iPhone 15 de Léo à cache froid). Le cache Metal est gardé d'un lancement à l'autre par iOS (13 s au 2e lancement vs 26 s à froid).

### FAIT — la grotte (4 × `grotte | travailleur | 13137 ms de creusement, attente 13168 ms`)
- Le creusement tourne **dans un Worker** (`maps/grotte-travailleur.js`, TEL_NATIF seulement) : le fil principal ne bloque pas (attente = `yield 'attente'`). 13,1 s de creusement sur le 13 Pro (≈ 6,5-7 s mesurés sur Mac ×4 avec le fil principal).
- Il est lancé **dans le pré-bâti de la map d'en face** : au menu ou 0,8 s après la fin d'une partie (`depart-avance.js:1-25`, budget en tranches). Si le joueur tape REJOUER/JOUER avant la fin, **le voile blanc + serpent noir tient jusqu'à 20 s** (`departAttend`, `vignette-moteur.js:390-396`). Banc du 9/11 (v c82b540 et 8a10c5e) : « REJOUER : course lancée en **15,7 / 15,9 / 15,9 / 16,1 s**, voile levé » (le joueur du banc tapait tout de suite après la mort) — **c'est la vraie attente que verrait un joueur pressé quand la map tirée est la grotte**.
- La durée réelle de `departAttend` n'est **jamais écrite dans la boîte noire** (`DEPART_ATT`, `vignette-moteur.js:388`, n'est lu que par `dbgDepart()`) : on ne sait pas combien de fois ça arrive sur le téléphone de Sacha. → C4.
- « Creuser d'avance » : la map suivante est tirée à la fin de la partie (`SF.prochain` « dès le menu ou l'écran de fin », `depart-avance.js:8-12`). On pourrait la tirer au **début** de la course et lancer le Worker pendant qu'on joue (il est sur un autre cœur ; la course ne dépense que l'envoi/réception des tampons). C'est un changement de gameplay/RNG (le tirage ne change pas d'ordre si on conserve `sfTire(SF.der)` au même rang, mais à valider par Léo/Sacha) : **je ne propose pas de diff** ; à décider.

### FAIT — les gels de 4 à 13 s au garage / à l'accueil
| date | build | durée | contexte (classe du body) |
|---|---|---|---|
| 09/11 18:21 | 39200d8 | **13,6 s** | `inGarage garMenuH titreCiel`, palier 0 |
| 09/11 21:29 | 336698a | 4,3 s | idem, palier 3 |
| 11/11 18:40:23 | bfd4555 | **3,9 s** | idem, palier 0 |
| 11/11 18:40:42 | bfd4555 | **6,7 s** | idem + `titreCiel` |
| autres | | 1,1 à 2,6 s (~20 lignes) | `inGarage garMenuH` |
Tous ont `pal=0 basc=0` (gouverneur de perf au palier 0, jamais basculé) ou les 1-3 s habituelles. `titreCiel` est posé par `chute-libre.js:39` (le piqué du ciel vers l'atelier au retour au menu) et retiré en `:52`. Le banc du 9/11 donnait déjà « retour accueil final · pire **1253 ms / 1743 ms** » juste après la mort.
HYPOTHÈSE (cause probable, non prouvée, aucun profil de pile sur ces lignes) : au retour à l'accueil après une course, `rebuildMenuScene` + `titreCiel` rallument le monde « d'accueil » : des programmes neufs sont liés DANS le dessin du menu (le garde de course `LIERC` de la passe GELS-SHADERS ne couvre que « en course », `vignette-moteur.js` `lierGardee`) et/ou le Worker de grotte rend ses 12 tronçons d'un coup au thread principal. Le rythme (deux gels à 19 s d'écart, le 2e plus long) colle avec « une map neuve entre deux retours ». À confirmer avec C5 (la pile du gel) avant de toucher au code.

### FAIT — les trous du lancement (« serpent »)
12 trous > 120 ms sur 18 s (01:23) et 6 sur 15 s (11:45) : le pire (763-1028 ms à 0,2 s) est la lecture du script ; le 2e (872 ms à 1,8 s) est `getProgramInfoLog` = liaison de programme sans parallélisme. Le serpent natif les masque.
Ce qui peut être différé sans que le joueur le voie : rien de gros — le script 0,8-1 s est incompressible sans changer le format (bytecode cache non gardé : « jeu.js : aucune entrée resource », `natif.js` §8 ne peut pas le mesurer) ; la liaison à 1,8 s peut passer en « douce » (KHR) si le fil la demandait ; mais comme le film n'est de toute façon pas lancé avant 13 s, **gagner 0,5 s sur le 1,8 s ne change rien à ce que voit le joueur** : le vrai levier est le temps total (13-16 s), donc la chauffe Metal elle-même (non réductible : c'est le prix d'un jeu qui n'a aucun gel ensuite).

---------------------------------------------------------------------------------------------------
## 5. LES FILETS (hors ligne, démarrage, mise à jour en direct)

### FAIT
- **Écran de lancement** : `launchAutoHide:false` + `launchShowDuration:30000` (`capacitor.config.json`), caché à `DOMContentLoaded` (+60 ms) **et filet à 30 s** (`natif.js` §5 `setTimeout(cache,30000)`) ; le serpent natif a son filet à **45 s** (`SerpentVue.montre`, `retire`) et `cc:revele` le retire. Si le grand script plante (page blanche), c'est le filet 30 s qui efface le splash, puis `debut-corps.html` pose « a calé » (8 s). OK.
- **Hors ligne / avion** : le jeu ne dépend d'aucun réseau (three.js, police, sons locaux ; `preparer-www.js` refuse toute adresse http). Capgo : `natif.js:178-200` ne démarre qu'après `__gameReady` ; `majVerif` sort si `navigator.onLine===false` ; en « en ligne mais sans route », `CapacitorHttp.get` sans timeout explicite → la promesse reste en attente ou rejette (`.catch(function(e){dit('maj : rien')})`), **sans bloquer le jeu** (asynchrone). `notifyAppReady` part à ~1,2 s → l'`appReadyTimeout` de 60 s ne se déclenche pas. **L'app démarre sans réseau.**
- Mise à jour qui échoue : `ccMajRefus`, mémoire des versions mauvaises (`natif.js:156-176`).
- **Erreurs non rattrapées** : voir §2 (avant `__gameReady` écran RELANCER, après : boîte noire seulement). Lacune : après `__gameReady`, une promesse/erreur qui laisse le jeu **vivant mais inutilisable** (bouton qui ne répond plus) n'a pas de filet ; seul le compteur de gel (image > 1 s) et la boucle qui plante (`__loopErr` + 8 s) existent.
- Sauvegarde : voir §2 (corrompue conservée, `localStorage` plein sous `try`).
- Capgo `_reload` à l'arrière-plan : si une mise à jour est prête, la vue est rechargée pendant que l'app est derrière ; l'instantané `enCours` est posé au `visibilitychange(hidden)` (`init.js:408`), donc avant (HYPOTHÈSE d'ordre non garanti, déjà relevée IOS-06).

---------------------------------------------------------------------------------------------------
## CORRECTIFS PROPOSÉS — classés gain / risque (aucun appliqué)

Tous limités à l'app : natif.js, Swift, ou `code/` gardé par `TEL_NATIF` / `window.Capacitor`. Après un diff dans `code/` : `node code/assembler.cjs`, `cashcar-vNNN` +1 dans `sw.js`, puis `npm run sync`. Les diffs Swift et natif.js demandent un build Xcode (MARKETING_VERSION +1 pour le Swift, règle IOS-19 ; natif.js seul part en mise à jour directe).

### C1 — filet natif si la vue web reste morte (Swift) — gain : écran noir définitif évité ; risque : très faible
`app-ios/ios/App/App/JeuViewController.swift`, dans `capacitorDidLoad()` après `GardeThermique.partage.demarre(bridge?.webView)` :
```diff
         GardeThermique.partage.demarre(bridge?.webView)
+
+        // La vue web morte et jamais relancée (voir GardeVue).
+        GardeVue.partage.demarre(bridge?.webView)
```
Et à la fin du fichier :
```diff
+/// LA VUE WEB MORTE (2026-11-12, ios-ultime : filet natif). Quand iOS tue le processus web (mémoire), Capacitor appelle `webView.reload()` tout de suite
+/// (WebViewDelegationHandler.swift:164) ; si ce rechargement n'aboutit pas (la mort a frappé pendant le premier chargement : `webView.url` est nil, `reload()` ne fait rien),
+/// l'écran reste noir pour toujours : aucun JS n'existe plus pour le dire. Toutes les 5 s, app au premier plan, on pose une question triviale à la page ; deux échecs de suite
+/// (processus mort, ou aucune adresse) = on recharge la page de départ. Une page qui charge, ou qui répond, remet le compteur à zéro. Rien ne sort du téléphone.
+final class GardeVue {
+    static let partage = GardeVue()
+    private weak var vue: WKWebView?
+    private var minuteur: Timer?
+    private var morts = 0
+
+    func demarre(_ vue: WKWebView?) {
+        self.vue = vue
+        guard minuteur == nil else { return }
+        let t = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in self?.sonde() }
+        t.tolerance = 2
+        minuteur = t
+    }
+
+    private func sonde() {
+        guard let v = vue, UIApplication.shared.applicationState == .active, !v.isLoading else { morts = 0; return }
+        v.evaluateJavaScript("1") { [weak self] _, erreur in
+            guard let self = self else { return }
+            let mort = (erreur as NSError?).map { $0.domain == WKError.errorDomain && $0.code == WKError.webContentProcessTerminated.rawValue } ?? false
+            if mort || v.url == nil { self.morts += 1 } else { self.morts = 0 }
+            if self.morts >= 2 {
+                self.morts = 0
+                CAPLog.print("⚡️  [natif] vue web morte depuis 10 s : on recharge la page de départ")
+                if let u = URL(string: "capacitor://localhost/") { v.load(URLRequest(url: u)) }
+            }
+        }
+    }
+}
```
Vérifier au build : `WKError.webContentProcessTerminated` (existe), l'URL de départ `capacitor://localhost/` (celle de `bridge.config.appStartServerURL` ; après une mise à jour Capgo, `setServerBasePath` garde le même schéma). À tester : `kill` du processus WebContent depuis Xcode / Instruments (Debug › Simulate… ou `pymobiledevice3 developer dvt kill <pid>` du `com.apple.WebKit.WebContent` de l'app) : la page doit revenir seule en < 20 s.

### C2 — savoir combien de fois la page a été tuée (diagnostic, natif.js) — gain : on cesse de deviner ; risque : très faible
`app-ios/natif/natif.js` : à insérer juste avant `/* ---- 6. LE BANC DU HORS-LIGNE (DEBUG seulement) ---- */` (donc avant le `if(!DEBUG)return;`) :
```diff
+  /* ---- 10. LA PAGE A-T-ELLE ÉTÉ TUÉE ? (2026-11-12, ios-ultime) ----
+     Un processus web tué par iOS ne laisse aucune trace : la page suivante démarre comme si de rien n'était. Ici la page marque « avant-plan » tant qu'elle est visible
+     et « fond » dès qu'elle part (visibilitychange, pause de Capacitor, pagehide). Au chargement suivant, si la marque est restée « avant-plan », la page d'avant est
+     morte sans prévenir : processus web tué (même session : `ccVieS` survit au rechargement du processus web, À VÉRIFIER), app tuée ou plantage (nouvelle session).
+     Écrit dans la boîte noire (genre « contexte », protégé du plafond). Un 2e lancement à froid après un balayage de l'app au premier plan compte aussi (faux positif connu). */
+  (function(){
+    var K='ccVie',lsv=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
+    var av=lsv(K),t0=+lsv(K+'T')||0,mm=null;try{mm=sessionStorage.getItem('ccVieS');}catch(e){}
+    if(av==='avant')document.addEventListener('DOMContentLoaded',function(){try{
+      window.__ccNote('contexte','page d’avant non fermée proprement ('+(mm?'même session : processus web tué':'nouvelle session : app tuée, redémarrée ou plantée')+') · dernier signe de vie il y a '+Math.round((Date.now()-t0)/1000)+' s');}catch(e){}});
+    var pose=function(){lsv(K,document.hidden?'fond':'avant');lsv(K+'T',String(Date.now()));try{sessionStorage.setItem('ccVieS','1');}catch(e){}};
+    pose();
+    document.addEventListener('visibilitychange',pose);
+    document.addEventListener('pause',function(){lsv(K,'fond');});
+    document.addEventListener('resume',pose);
+    addEventListener('pagehide',function(){lsv(K,'fond');});
+    setInterval(function(){if(!document.hidden)lsv(K+'T',String(Date.now()));},15000);
+  })();
```
(Le `K+'T'` est écrit au plus toutes les 15 s : 1 écriture de 13 octets, sans rapport avec les 30 Ko de la boîte noire.) Lecture : `sh outils/banc-perf/lire-banc.sh` (la ligne apparaît à `contexte |`).

### C3 — rendre une mesure mémoire exploitable (journal) — gain : on saura quelle map pèse 1483 géométries ; risque : nul
`code/rendu/palier-appareil.js:179-180`, `ccMemLigne` : ajouter la map et les cibles :
```diff
-  r=(Math.round(performance.now()/100)/10)+' s · '+(document.body&&document.body.className||'').slice(0,60)+' · tas '+(pm&&pm.usedJSHeapSize?Math.round(pm.usedJSHeapSize/1048576)+' Mo':'-')+' · textures '+m.textures+' géométries '+m.geometries+' programmes '+(pr?pr.length:'-')+' · partie n°'+k;}catch(err){r='? '+(err&&err.message);}return r;}
+  r=(Math.round(performance.now()/100)/10)+' s · '+(document.body&&document.body.className||'').slice(0,60)+' · tas '+(pm&&pm.usedJSHeapSize?Math.round(pm.usedJSHeapSize/1048576)+' Mo':'-')+' · textures '+m.textures+' géométries '+m.geometries+' programmes '+(pr?pr.length:'-')+' · partie n°'+k+(window.Capacitor?' · map '+(function(){try{return BIO.name;}catch(e){return '?';}})()+' · DPR '+(typeof curDPR==='number'?Math.round(curDPR*100)/100:'?'):'');}catch(err){r='? '+(err&&err.message);}return r;}
```
(`BIO` et `curDPR` sont lus à l'appel, hors zone morte ; protégés par le `try` extérieur.) Garde `window.Capacitor` : le web ordinateur ne change pas.

### C4 — écrire l'attente de départ dans la boîte noire — gain : mesure le « chargement REJOUER » réel ; risque : nul
`code/interface/vignette-moteur.js:395`, dans `departAttend`, au moment où l'attente se termine :
```diff
-  if(chaud&&pb||now-G.att0>20000){if(G.attend){DEPART_ATT.n++;DEPART_ATT.ms=Math.round(now-G.att0);DEPART_ATT.sortie=chaud&&pb?'prêt':'20 s';G.attend=false;}return false;}
+  if(chaud&&pb||now-G.att0>20000){if(G.attend){DEPART_ATT.n++;DEPART_ATT.ms=Math.round(now-G.att0);DEPART_ATT.sortie=chaud&&pb?'prêt':'20 s';G.attend=false;
+    if(TEL_NATIF&&DEPART_ATT.ms>1500)try{window.__ccNote('attente','départ attendu '+DEPART_ATT.ms+' ms ('+DEPART_ATT.sortie+') · map '+((typeof SF!=='undefined'&&SF.tirage&&SF.tirage[0]&&SF.tirage[0].carte)||'?'));}catch(e){}} /* (2026-11-12, ios-ultime) la boîte noire dit combien de temps le voile a tenu */
+    return false;}
```
(Structure inchangée : le `}` après le `catch(e){}` ferme le `if(G.attend){`, puis `return false;}` comme avant. Genre `attente` : plafond 8 lignes, déjà prévu dans `CAPS`.)

### C5 — la pile du gel de 4-7 s à l'accueil — gain : transforme l'hypothèse §4 en fait ; risque : faible
`code/page/debut-corps.html` boucle `rf` (« gel ») : joindre à la ligne `gel` le dernier appel WebGL lent déjà connu de la sonde « serpent » (`dbgSerpent()` renvoie `RES.slice()`), qui n'écoute que 15-60 s au lancement : **étendre la sonde au premier retour à l'accueil** (`__ccGuetFin` reste appelable) coûte une relance de `RES`. Plus simple et déjà permis : lancer UN lancement de test sur le 13 Pro avec Web Inspector (Safari › Développement) pendant « course → mort → accueil » avec le profil Timelines, ou `?sonde=…`. Je n'écris pas de diff : la bonne donnée est la pile `getProgramInfoLog` vs `texImage2D` vs `grwMailleDe`, et une session sur appareil la donne en une fois.

### C6 — poser la partie au `pagehide` (optionnel) — gain : faible ; risque : faible
`code/sauvegarde.js:345` (IOS-06 du 10/11 non appliqué dans cette branche) :
```diff
-addEventListener('pagehide',function(){try{if(SAVE.d){SAVE.d.vu=Date.now();SAVE.flush();}}catch(e){}});
+addEventListener('pagehide',function(){try{if(SAVE.d){SAVE.d.vu=Date.now();try{if(window.Capacitor)enCoursPose();}catch(e2){}SAVE.flush();}}catch(e){}});
```
`enCoursPose` est une déclaration hissée de `gameplay/seconde-chance.js:555`, dans la même fonction englobante : visible. Gain réel faible : `visibilitychange(hidden)` la pose déjà (`init.js:408`) ; ne sert que si WebKit ne délivre que `pagehide` avant le `_reload` de Capgo.

### Non proposé (à décider par Sacha / Léo)
- Tirer la map suivante au début de la course et creuser la grotte pendant le jeu (§4) — change l'ordre des tirages.
- Abaisser le travail de GPU sur ALLEGE pour garder > ×2 de marge sous le `highwater` d'un 4 Go (§3) — à mesurer d'abord sur un iPhone 4 Go (aucun dans le parc).
- Écran « a calé » après `__gameReady` pour un jeu vivant mais gelé (pas de signal fiable).

### Mon ordre d'application
1. **C1 + C2** (un build Xcode, un jour Mac) : seules vraies lacunes (filet natif + preuve de kill). Risque très faible.
2. **C3 + C4** (diagnostic en `code/`, un assemblage) : sans eux, les 3 inconnues (mémoire par map, attente REJOUER, gel d'accueil) restent des hypothèses.
3. C5 sur appareil ; C6 si le jour Mac passe de toute façon.

## Fichiers lus / outils
`app-ios/ios/App/App/{JeuViewController,AppDelegate,SceneDelegate}.swift`, `app-ios/natif/natif.js`, `app-ios/capacitor.config.json`, `app-ios/node_modules/@capacitor/ios/…/{WebViewDelegationHandler,CapacitorBridge,CAPBridgeViewController}.swift`, `code/{page/debut-corps.html,sauvegarde.js,rendu/palier-appareil.js,moteur/{init,intro-161,depart-avance}.js,interface/{vignette-moteur,chute-libre}.js,maps/grotte-travailleur.js,gameplay/seconde-chance.js}`, `passation/debug-gameplay/cycle-ios.md`, `passation/GELS-SHADERS.md`, `~/cash-car/ios-ultime-mesures/boite-noire-1112-1228.txt`, rapports du téléphone (devicectl). Non faits : `lire-banc.sh` (la boîte noire du midi suffisait), journal d'une session en cours, mesure mémoire en direct.
