# CAR CASH — l'app iOS (Capacitor 8)

L'app iOS **emballe le jeu web de `VERSION PRINCIPALE/`** dans une vraie app iPhone (Capacitor = une coquille native
qui affiche le jeu dans une vue web, sans navigateur autour). Le jeu n'est **pas recopié à la main** : `www/` est
**fabriqué** à partir de `VERSION PRINCIPALE/` par `preparer-www.js`.

| Quoi | Où |
|---|---|
| Identifiant de l'app | `com.sachaberes.carcash` · nom sous l'icône : **CAR CASH** · version **1.0.0 (1)** |
| Le jeu embarqué (généré, ne pas éditer) | `www/` |
| La colle native (chargée en premier, inerte hors de l'app) | `natif/natif.js` |
| Le projet Xcode | `ios/App/App.xcodeproj` (Swift Package Manager, pas de CocoaPods) |
| Le contrôleur plein écran + la garde des liens | `ios/App/App/JeuViewController.swift` |
| Le manifeste de confidentialité exigé par Apple | `ios/App/App/PrivacyInfo.xcprivacy` |
| Les images sources de l'icône et de l'écran de lancement | `ressources/` (→ `assets/` → `Assets.xcassets`) |

## Mettre à jour l'app après un changement du jeu

```bash
cd app-ios
npm install          # la première fois seulement (node_modules n'est pas dans git)
npm run sync         # refait www/ depuis VERSION PRINCIPALE, puis npx cap sync ios
npm run ouvrir       # ouvre le projet dans Xcode
```

`preparer-www.js` **refuse** de continuer s'il reste une adresse réseau (http/https) dans ce qu'on embarque : l'app est
100 % hors ligne. Il grave aussi la version du jeu (le commit) : RÉGLAGES affiche « VERSION xxxxxxx ».

## Ce qui est réglé pour l'iPhone

- **Hors ligne** : Three.js r128 (`vendor/three.min.js`, identique octet pour octet à la version officielle), la police
  Press Start 2P (`assets/fonts/`) et tous les sons sont dans l'app. Aucun service worker dans l'app.
- **Plein écran** : barre d'état cachée (Info.plist `UIStatusBarHidden` + plugins StatusBar et SystemBars), indicateur
  d'accueil qui s'efface, gestes des bords différés (les pouces jouent près des bords), ni défilement, ni rebond, ni zoom.
- **Portrait et paysage** (iPhone uniquement, `TARGETED_DEVICE_FAMILY = 1`). L'encoche et l'îlot dynamique sont respectés
  par la page elle-même (`env(safe-area-inset-*)`, `viewport-fit=cover`, `contentInset: never`).
- **Aucun lien ne sort de l'app** : garde JS (`natif.js`) + garde native (`GardeNavigation` dans `JeuViewController.swift`).
- **Son** : débloqué au premier toucher et relancé après un appel ou Siri, sans jamais rallumer un son que le jeu a coupé.
- **Sauvegarde** : le jeu recopie `cashcarSave` dans Preferences (UserDefaults iOS) à chaque écriture ; si iOS efface le
  stockage web, il la relit au lancement et recharge la page (code « P0-03 » de `VERSION PRINCIPALE/index.html`).
  Vérifié au simulateur : stockage web effacé → sauvegarde retrouvée.
- **Chiffrement** : `ITSAppUsesNonExemptEncryption = NO` (pas de question export à chaque envoi).

## Icône et écran de lancement

```bash
npm run icones       # ressources/icon.svg → assets/icon-only.png (1024, sans transparence) → @capacitor/assets
```

⚠ `VERSION PRINCIPALE/icon.svg` est l'émoji 💰 d'Apple (image protégée : refus App Store). L'icône de l'app est le
mot-symbole pixel CASH CAR (`ressources/icon.svg`, `ressources/icone-1024.png`).

## Tester sans Xcode ouvert (simulateur)

En version Debug, `natif.js` écrit dans la console de Xcode : `[natif] BILAN RÉSEAU` (doit dire « 0 adresse hors de
l'app »), `[natif] POULS` (images/s, état du son, état du jeu) et toute erreur JS. La version App Store (Release)
n'écrit rien.
