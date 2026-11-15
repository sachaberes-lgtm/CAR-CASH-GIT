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
   La ligne `chargement` finit par :
   `· natif : processus→vue X ms · vue→page Y ms (processus→lancé A, lancé→web B, web→prête C, prête→vue D)`
   - « page » = `performance.timeOrigin`. **vue→page peut être négatif** (la page commence avant que l'écran n'apparaisse).
   - `PRÉCHAUFFÉ : processus→… ne compte pas` si iOS a préchauffé ; `rechargement` si la page a été rechargée (les instants natifs sont ceux du lancement d'origine).
   - `?` = instant manquant.
4. **Interrupteur** : `?sans=natiflancement` = ligne d'avant. Hors de l'app (`__ccNatifT` absent : site, ordinateur, banc) la fonction rend `''` : ligne d'avant à l'octet. Lecture seule : aucun comportement du jeu ne change.

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
1. Build de mesure (le Swift de cette branche + le jeu de cette branche), app TUÉE puis touchée à froid, 5 lancements ; lire la ligne `chargement` de la boîte noire. Noter processus→vue, vue→page et les 4 morceaux.
2. Pareil après redémarrage du téléphone (1er lancement, le plus froid), et à chaud (app tuée puis relancée tout de suite).
3. Si `PRÉCHAUFFÉ` apparaît : ne lire que lancé→web, web→prête, prête→vue, vue→page.
4. A/B : `?sans=natiflancement` (par `--qs "&sans=natiflancement"` ou `CC_QS`) → la ligne d'avant, pour montrer que le chrono ne coûte rien (origine→prêt de natif.js identique).
5. Mettre bout à bout avec `origine→DCL` / `origine→prêt` (natif.js) et `prêt en N s` : la chaîne entière processus → film.

## Où reporter
- `app-ios/` existe aussi sur **ios-capacitor**, dont les Swift sont très en retard sur cette branche (JeuViewController : ~246 lignes d'écart, pas de `poseScriptDebut`). Le chrono se reporte en reportant les Swift de `qualite-appareil` (resynchronisation habituelle de l'app), pas en picorant ce commit.
- Les builds de mesure partent de `~/cash-car/finition-build` (compiler.sh) : y amener `AppDelegate.swift`, `JeuViewController.swift`, et le jeu (morceau + ORDRE + accroche).
- Lot « lancement2 » : il réécrit `introNote` ; garder l'accroche `+(window.ccNatifLancement?window.ccNatifLancement():'')` en fin de ligne.

## Fichiers
`app-ios/ios/App/App/AppDelegate.swift`, `app-ios/ios/App/App/JeuViewController.swift`, `code/moteur/natif-lancement.js` (nouveau), `code/ORDRE.txt`, `code/moteur/intro-161.js` (1 ligne), `passation/qualite/natif.md`.
