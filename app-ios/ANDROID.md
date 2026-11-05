# CASH CAR — l'app Android (Google Play)

Préparée le 2026-11-05 (branche `android-capacitor`, Sacha : « comment on fait pour mettre le jeu sur le Google Play Store »).

L'app Android est la **même app Capacitor que l'iPhone** : même dossier `app-ios/`, même jeu embarqué (`www/`, fabriqué par
`preparer-www.js` avec toutes les coupes de l'édition App Store), même colle native (`natif/natif.js`), même identifiant
`com.sachaberes.carcash`. Seule la coquille native change : `android/` à côté de `ios/`.

| Quoi | Où |
|---|---|
| Le projet Android Studio | `android/` (ouvrir le DOSSIER `app-ios/android` dans Android Studio) |
| L'activité plein écran + le bouton RETOUR | `android/app/src/main/java/com/sachaberes/carcash/MainActivity.java` |
| La garde des liens (rien ne sort de l'app) | `android/app/src/main/java/com/sachaberes/carcash/GardeNavigation.java` |
| Numéro de version (`versionCode` / `versionName`) et signature | `android/app/build.gradle` |
| Icône adaptative et écran de lancement | `android/app/src/main/res/` (refaits par `npm run icones:android`) |
| Images de la fiche Google Play (icône 512, bannière 1024 × 500) | `fiche/google-play/` (refaites par `node generer-icones.js`) |

## Ce que l'app Android fait de plus que l'iPhone

- **Le bouton RETOUR d'Android** : il passe par la touche Échap du jeu (natif.js, partie 8). Résultat : en course, il **met en
  pause** ; dans un sous-écran (RÉGLAGES, BOUTIQUE…), il **revient** ; une fenêtre ouverte, il la **referme**. Quand il n'y a
  plus rien à refermer (l'accueil), l'app passe en **arrière-plan**, comme toutes les apps Android.
  Vérifié dans le navigateur avec un faux Capacitor Android : accueil → arrière-plan, RÉGLAGES → retour à l'accueil.
  **Pas encore vérifié : la pause en course** (à essayer en premier sur un vrai téléphone).
- **Plein écran** : barres d'état et de navigation cachées (un glissement depuis le bord les montre un instant), l'encoche
  est utilisée, la page lit ses marges (`env(safe-area-inset-*)`).

## 1. Une seule fois : installer les outils (sur le PC Windows)

1. **Android Studio** (gratuit) : https://developer.android.com/studio — il installe aussi Java et le SDK Android.
   Capacitor 8 demande Android Studio 2025.2 ou plus récent.
2. Dans `app-ios/` : `npm install` (si `node_modules/` manque).

## 2. Fabriquer et essayer l'app

```bash
cd app-ios
npm run sync:android     # refait www/ depuis VERSION PRINCIPALE (avec les coupes), puis le copie dans android/
npm run ouvrir:android   # ouvre le projet dans Android Studio
```

Dans Android Studio : brancher un téléphone Android (mode développeur + débogage USB activés) ou créer un émulateur
(Device Manager), puis ▶ Run. Les messages `[natif]` (bouton retour, réseau, erreurs) apparaissent dans **Logcat**.

À vérifier sur un vrai téléphone, dans cet ordre :
1. le jeu démarre, le son marche après le premier toucher ;
2. **RETOUR en course = pause** ; RETOUR dans un menu = revenir ; RETOUR à l'accueil = l'app passe en arrière-plan ;
3. l'encoche / la caméra ne cache rien du HUD (portrait et paysage) ;
4. la fluidité (le téléphone prend le rendu allégé `ALLEGE` tout seul : écran tactile) ;
5. quitter l'app, la rouvrir : la sauvegarde est toujours là.

## 3. La clé de signature (UNE fois, à garder précieusement)

Google Play n'accepte qu'une app signée. Dans Android Studio : **Build › Generate Signed App Bundle or APK › Android App
Bundle › Create new…** Choisir un emplacement HORS du dépôt git (par ex. `Documents/cles/cashcar-upload.jks`), un mot de
passe, l'alias `cashcar`.

⚠ **Perdre ce fichier ou son mot de passe = ne plus pouvoir publier de mise à jour.** En faire une copie (clé USB,
gestionnaire de mots de passe). Il ne va JAMAIS dans git (`.gitignore` refuse déjà `*.jks`).

Pour fabriquer ensuite sans repasser par le menu, créer `app-ios/android/keystore.properties` (ignoré par git) :

```
storeFile=C:/Users/sacha/Documents/cles/cashcar-upload.jks
storePassword=…
keyAlias=cashcar
keyPassword=…
```

puis `npm run aab` → le fichier à envoyer est `android/app/build/outputs/bundle/release/app-release.aab`.

Google Play garde sa propre clé de distribution (« Play App Signing », proposé à la création de l'app : accepter).
La clé ci-dessus n'est que la clé d'ENVOI.

## 4. Le compte Google Play Console

1. https://play.google.com/console — 25 $ une seule fois + vérification d'identité (pièce d'identité, quelques jours).
2. ⚠ **Compte personnel récent** : Google exige un **test fermé avec au moins 12 testeurs, pendant 14 jours d'affilée**,
   avant d'ouvrir la publication. Il faut 12 adresses Gmail de personnes avec un téléphone Android, qui restent inscrites
   les 14 jours. (Un compte « organisation », avec un numéro D-U-N-S, n'a pas cette obligation.)

## 5. La fiche de l'app (Play Console)

Presque tout se reprend de `fiche/FICHE-APP-STORE.md` :

| Champ Play Console | Quoi mettre |
|---|---|
| Nom de l'app | CASH CAR |
| Description courte (80 caractères max) | à tirer du sous-titre App Store |
| Description complète | la description App Store (FR et EN) |
| Icône 512 × 512 | `fiche/google-play/icone-512.png` |
| Image de présentation 1024 × 500 | `fiche/google-play/presentation-1024x500.png` |
| Captures d'écran | au moins 2 (téléphone), prises sur l'émulateur ou le téléphone |
| Catégorie | Jeux › Course |
| Politique de confidentialité | `https://car-cash-git.vercel.app/confidentialite.html` (déjà en ligne) |
| Coordonnées | l'e-mail d'assistance de la fiche App Store |

Les questionnaires :
- **Classification du contenu (IARC)** : mêmes réponses que la classification d'âge Apple (fiche App Store).
- **Sécurité des données** : « aucune donnée collectée ni partagée » (aucune statistique, aucune pub, aucun compte ; les
  mises à jour en direct ne font que LIRE des fichiers publics).
- **Public cible** : 13 ans et plus est le plus simple. Viser les moins de 13 ans fait entrer l'app dans le programme
  « Familles » de Google, plus exigeant.
- **Publicités** : non. **Achats intégrés** : non (l'édition de l'app a déjà coupé tout prix en euros).

Petit détail : la page de confidentialité dit que l'âge conseillé est « celui de la page de l'App Store » ; à élargir en
« sa page sur l'App Store ou Google Play » (fichier `pages-app/confidentialite.html` du jeu web).

## 6. Envoyer

1. **Test fermé** : Play Console › Tester › Test fermé › créer une version › déposer le `.aab` › ajouter la liste des 12
   testeurs › envoyer en examen. Les testeurs reçoivent un lien.
2. Au bout des 14 jours : **demander l'accès à la production** (un court questionnaire sur le test), puis créer une version
   de production avec le même `.aab` (ou un plus récent). L'examen de Google prend en général de quelques heures à quelques jours.

## Mettre à jour l'app ensuite

- **Changement du jeu seulement** : les mises à jour en direct (`publier-maj.js`, voir LISEZ-MOI.md) marchent aussi sur
  Android — le même canal sert les deux apps. Rien à envoyer sur Google Play.
- **Changement de l'app native** (module Capacitor, icône, nom) : `versionCode` +1 (et `versionName` si besoin) dans
  `android/app/build.gradle`, `npm run sync:android`, `npm run aab`, nouvelle version dans la Play Console.
