# CASH CAR — Chaîne de build iOS (Mac uniquement)

Feuille de route parallèle. À exécuter par la session Hermes de l'app
desktop, sur le Mac.

## Pourquoi cette roadmap existe

Le VPS ne peut pas produire de binaire iOS : Apple exige une compilation et
une signature par Xcode, qui ne tourne que sur macOS. C'est la seule partie
du projet qui doit vivre ici.

Objectif : à la fin, un `build.sh` qui prend le dossier du jeu et installe
l'app sur l'iPhone de Sacha. C'est le harnais qui manque à toute la phase 2
— sans lui, personne ne peut valider la migration three.js.

## Règles

1. **Ne jamais écrire dans `~/projets/sandbox/` sur le VPS.** Une autre
   session y travaille. Lecture seule si besoin.
2. Tout le travail se fait dans `~/ios-build/` sur le Mac.
3. Un test se valide par une commande, pas par une impression.
4. Ne jamais inventer un flag. Vérifier par `--help` avant d'utiliser.
5. Après deux échecs sur la même étape : s'arrêter, expliquer, passer à la
   suivante si elle n'en dépend pas.
6. Ne jamais demander à Sacha un mot de passe ou un identifiant Apple.
   Les étapes ⏸ sont pour lui, il les fait lui-même.

---

## Mandat A — Inventaire de la machine ⏸

Avant de télécharger 10 Go, vérifier que c'est possible.

- Version de macOS, modèle de Mac, puce
- Espace disque libre (`df -h`)
- Xcode déjà installé ? (`xcode-select -p`, `xcodebuild -version`)
- Homebrew, Node, npm présents et dans quelles versions
- Un iPhone est-il déjà appairé ? (`xcrun devicectl list devices`)

**S'arrêter et remonter le rapport.** Si moins de 30 Go libres, le dire
clairement : Xcode ne tiendra pas.

## Mandat B — Outils en ligne de commande

- Installer les Xcode Command Line Tools si absents
- Installer via Homebrew : `cocoapods`, `ios-deploy`
- Vérifier que `xcodebuild -version` répond

**Critère** : `xcodebuild -version`, `pod --version` et `ios-deploy
--version` répondent tous les trois.

Si Xcode complet n'est pas installé, l'indiquer à Sacha : il doit le
prendre depuis le Mac App Store lui-même (~10 Go, une heure selon la
connexion). Ne pas tenter de l'installer en ligne de commande.

## Mandat C — Projet Capacitor jetable

Ne pas utiliser le vrai jeu. On valide la chaîne, pas le contenu.

- Créer `~/ios-build/probe/` : une page HTML minimale qui affiche
  « CHAÎNE OK » en gros
- L'envelopper dans un projet Capacitor, ajouter la plateforme iOS
- `npx cap sync ios`

**Critère** : `npx cap doctor` ne signale aucune erreur bloquante, et
`~/ios-build/probe/ios/App/App.xcworkspace` existe.

## Mandat D — Signature ⏸

Pas besoin du compte Apple Developer à 99 $ pour cette étape. Un simple
Apple ID suffit : Xcode crée une « Personal Team » qui permet d'installer
sur ses propres appareils. Limites connues : 3 appareils, et les profils
expirent au bout de 7 jours — il faut réinstaller après. Suffisant pour un
harnais de test.

**Ce que Sacha fait lui-même** (ne pas tenter à sa place) :
- Xcode → Settings → Accounts → ajouter son Apple ID
- Ouvrir `App.xcworkspace` → onglet Signing & Capabilities → Team =
  son nom (Personal Team)
- Brancher l'iPhone en USB, le déverrouiller, accepter « Faire confiance »

Préparer la marche à suivre et la lui donner, puis attendre.

## Mandat E — Premier déploiement réel

- Construire et installer `probe` sur l'iPhone connecté
- Si erreur de signature, remonter le message brut sans tenter de
  contourner la signature

**Critère** : l'app `probe` s'ouvre sur l'iPhone et affiche « CHAÎNE OK ».
C'est le moment où toute la chaîne est prouvée.

## Mandat F — `build.sh`

Une fois la chaîne prouvée, l'automatiser.

- `build.sh <chemin-du-projet-web>` : synchronise les fichiers web dans le
  projet Capacitor, lance `cap sync`, compile, installe sur l'appareil
  connecté
- Affiche une erreur claire si aucun appareil n'est branché
- Code de sortie non nul en cas d'échec

**Critère** : `./build.sh ~/ios-build/probe/www` réinstalle l'app sans
aucune intervention manuelle.

## Mandat G — Récupérer le jeu

- Copier depuis le VPS la version courante de `~/projets/sandbox/` vers
  `~/ios-build/cashcar/` (lecture seule côté VPS, `scp` ou `rsync`)
- Lancer `build.sh` dessus
- Remonter ce qui casse : erreurs console, assets manquants, safe areas,
  orientation

**Critère** : le jeu s'ouvre sur l'iPhone. Peu importe qu'il soit
imparfait — l'objectif est d'avoir la boucle
« modification → build → test sur appareil » qui tourne.

---

## Après

Avec `build.sh` en place, la migration three.js devient validable, et la
phase 2 peut démarrer. Tant qu'il n'existe pas, elle reste bloquée.

Le compte Apple Developer à 99 $/an ne devient nécessaire que pour
TestFlight et la soumission — pas avant.

---

## État d'avancement (session 2026-08-26)

- **Mandat A** ✅ — inventaire fait. Blocage : Xcode complet ABSENT + disque
  à ~19 Go libres (sous les 30 Go). Nettoyage caches récupéré +6 Go.
- **Découverte** : Capacitor 8 utilise **Swift Package Manager**, pas
  CocoaPods. → `cocoapods` (Mandat B) inutile ; `npx cap add ios` génère
  `App.xcodeproj` + `CapApp-SPM` (pas de `.xcworkspace`). Le critère du
  Mandat C se lit donc « `App.xcodeproj` existe + `cap doctor` OK ».
- **Mandat C** ✅ (scaffold) — `~/ios-build/probe/` créé, `cap doctor`
  répond « iOS looking great! », aucune erreur bloquante.
- **Reste bloqué sur Xcode (action humaine irréductible)** : installation
  depuis le Mac App Store (~30 Go, Apple ID) → puis Mandats B (reste
  `ios-deploy`/signature), D (Personal Team), E (déploiement), F (build.sh),
  G (récupérer le jeu).
- **Règles 9 & 10** : `~/bin/status.sh` en place (rapporte Mac + VPS, disque,
  gateway, erreurs ; seuil disque 30 Go encodé).

---

## Mise à jour (session 2026-08-27)

- **Xcode 26.6 installé**, licence acceptée, `xcode-select` OK, SDK iphoneos26.5
  présent, runtime simulateur iOS 26.5 téléchargé (via `xcodebuild -downloadPlatform iOS`).
- **Mandat B** ✅ — `ios-deploy 1.12.2` installé (npm). `cocoapods` non requis
  (SPM). Critère ajusté : `xcodebuild`, `ios-deploy`, `devicectl` OK.
- **Mandat C** ✅ — `probe` généré, `cap doctor` OK, **build device réussi**
  (`BUILD SUCCEEDED`, `App.app`, bundle `com.cashcar.probe`).
- **Mandat F** ✅ (écrit) — `~/ios-build/build.sh` : détecte l'appareil, `cap sync`,
  `xcodebuild -allowProvisioningUpdates`, `devicectl device install app`. Testé
  jusqu'au point « aucun appareil » (sortie 3) ; install à valider sur appareil.
- **Mandat G** (préparé) — sandbox copié en lecture seule vers `~/ios-build/cashcar/`
  (hors `.git`/`node_modules`), `npm install` + `cap sync` + **build device réussi**
  (bundle `com.cashcar.game`). Warning relevé : *« All interface orientations must
  be supported… »* (orientation à corriger).
- **Reste (humain irréductible)** : Mandat D — ajouter l'Apple ID (Personal Team),
  connecter + faire confiance à l'iPhone ; puis Mandat E (déploiement) via `build.sh`.