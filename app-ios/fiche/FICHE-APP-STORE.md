# CASH CAR — la fiche App Store (à recopier dans App Store Connect)

Tout ce qu'App Store Connect demande pour la version 1.0.0, prêt à coller. Les textes ne promettent **que** ce que
l'app iPhone contient vraiment (pas de boutique en argent réel, pas de pubs, pas de compte). Les longueurs sont
vérifiées par `node verifier-fiche.js` (les limites d'Apple : nom 30, sous-titre 30, promo 170, mots-clés 100).

⚠ = une décision qui revient à Sacha. Le reste se colle tel quel.

## 1. L'app (créée une seule fois : Apps › « + » › Nouvelle app)

| Champ | Valeur |
|---|---|
| Plateforme | iOS |
| Nom | `CASH CAR` (aucune app de ce nom trouvée dans la recherche App Store FR et US le 14/10 ; si Apple le refuse : `CASH CAR - Sky Runner`) |
| Langue principale | Français (France) — choisi par défaut le 14/10 ; l'anglais (É.-U.) en localisation, textes ci-dessous |
| Identifiant de lot (Bundle ID) | `com.sachaberes.carcash` |
| SKU (référence interne, jamais affichée) | `cashcar-ios-001` |
| Accès utilisateur | Accès complet |

## 2. Textes — FRANÇAIS

<!-- nom-fr -->
CASH CAR
<!-- /nom-fr -->

<!-- sous-titre-fr -->
Runner arcade 3D dans le ciel
<!-- /sous-titre-fr -->

<!-- promo-fr -->
Une route dans le ciel, une seule vie. Fonce, drifte, lâche la NITRO et amasse une fortune avant la chute. 100 % hors ligne, sans pub.
<!-- /promo-fr -->

<!-- description-fr -->
Une route suspendue dans le ciel. Une seule vie. Jusqu'où iras-tu ?

CASH CAR est un jeu de course arcade en 3D : tu fonces sur une route qui serpente au-dessus des nuages, tu ramasses tout ce qui brille, tu drifts dans les courbes, tu décolles sur les tremplins… et tu évites de tomber. Plus tu vas loin, plus ça va vite, et plus tu deviens riche.

DEUX POUCES, C'EST TOUT
• Le pouce gauche tient le volant, le pouce droit lâche la NITRO.
• Téléphone debout ou couché : le jeu suit.
• Une auto-école t'apprend tout en une minute, sans risque.

LE CIEL CHANGE À CHAQUE PARTIE
• Mer de nuages, ville de nuit, orage, orbite au-dessus de la Terre, pics de jade…
• Chaque départ tire une carte et une météo ; chaque portail t'emmène ailleurs.
• La musique suit le monde que tu traverses.

DU STYLE, PAS SEULEMENT DE LA VITESSE
• Drift, rase-bord, figures en vol : le style remplit ta jauge et multiplie tes gains.
• Enchaîne sans faute et déclenche la FRÉNÉSIE.

UN GARAGE À REMPLIR
• Une cinquantaine de voitures à gagner, de l'épave aux légendes.
• Peintures, ailes et traînées à essayer en 3D sur ta voiture.
• Tout se gagne en jouant, avec l'argent ramassé en course.

MISSIONS ET MONDES
• Des missions à remplir pour débloquer des voitures.
• Des mondes qui s'enchaînent : nuages, forêt, canyon, glacier, volcan, villes…

SANS RIEN AUTOUR
• 100 % hors ligne : joue dans le métro, en avion, partout.
• Aucune publicité. Aucun achat intégré. Aucun compte.
• Aucune donnée collectée : ta sauvegarde reste sur ton iPhone.
<!-- /description-fr -->

<!-- mots-cles-fr -->
course,arcade,voiture,ciel,nitro,drift,runner,nuages,cascade,vitesse,pixel,garage,hors ligne,3d
<!-- /mots-cles-fr -->

<!-- nouveautes-fr -->
Première version de CASH CAR. Bonne route !
<!-- /nouveautes-fr -->

## 3. Textes — ENGLISH (U.S.)

<!-- nom-en -->
CASH CAR
<!-- /nom-en -->

<!-- sous-titre-en -->
3D arcade runner in the sky
<!-- /sous-titre-en -->

<!-- promo-en -->
A road in the sky and a single life. Speed, drift, hit the NITRO and stack up a fortune before you fall. Fully offline, no ads.
<!-- /promo-en -->

<!-- description-en -->
A road hanging in the sky. One life. How far can you go?

CASH CAR is a 3D arcade racing game: you speed along a road that winds above the clouds, grab everything that shines, drift through the bends, take off from the ramps… and try not to fall. The farther you go, the faster it gets, and the richer you become.

TWO THUMBS, THAT'S ALL
• Left thumb steers, right thumb fires the NITRO.
• Portrait or landscape: the game follows.
• A driving school teaches you everything in a minute, with no risk.

THE SKY CHANGES EVERY RUN
• Sea of clouds, city at night, thunderstorm, orbit above the Earth, jade peaks…
• Every start draws a map and a weather; every portal takes you somewhere else.
• The music follows the world you are crossing.

STYLE, NOT JUST SPEED
• Drifts, edge grazes, mid-air tricks: style fills your gauge and multiplies your earnings.
• Chain them without a mistake to trigger the FRENZY.

A GARAGE TO FILL
• Around fifty cars to earn, from the wreck to the legends.
• Paints, wings and trails to try in 3D on your car.
• Everything is earned by playing, with the cash you collect on the road.

MISSIONS AND WORLDS
• Missions to complete to unlock cars.
• Worlds that keep coming: clouds, forest, canyon, glacier, volcano, cities…

NOTHING IN THE WAY
• Fully offline: play on the subway, on a plane, anywhere.
• No ads. No in-app purchases. No account.
• No data collected: your save stays on your iPhone.
<!-- /description-en -->

<!-- mots-cles-en -->
racing,arcade,car,sky,nitro,drift,runner,clouds,stunt,speed,pixel,garage,offline,endless,3d
<!-- /mots-cles-en -->

<!-- nouveautes-en -->
First release of CASH CAR. Enjoy the ride!
<!-- /nouveautes-en -->

## 4. Informations générales

| Champ | Valeur |
|---|---|
| Catégorie principale | Jeux — sous-catégories : **Course**, **Arcade** |
| Catégorie secondaire | (aucune) |
| Prix | Gratuit |
| Disponibilité | tous les pays (choisi par défaut le 14/10 : l'app parle français et anglais) |
| Copyright | `2026 Sacha Beres` (Apple ajoute le © tout seul) |
| URL de l'assistance (obligatoire) | `https://car-cash-git.vercel.app/assistance.html` |
| URL de la politique de confidentialité (obligatoire) | `https://car-cash-git.vercel.app/confidentialite.html` |
| URL marketing | (laisser vide) |
| Version | `1.0.0` — build `1` |
| Appareils | iPhone uniquement, iOS 15 ou plus récent |

## 5. Les questionnaires d'Apple

**Confidentialité de l'app** (App Privacy) : répondre **« Non, nous ne collectons pas de données »**. C'est exact : l'app
n'envoie rien, n'a ni compte, ni pub, ni mesure d'audience. Sa seule connexion (depuis le build 2) : lire les nouvelles versions
du jeu sur la branche publique `app-maj` (raw.githubusercontent.com), sans identifiant — les statistiques du module Capgo sont
COUPÉES (`statsUrl` vide), et preparer-www.js refuse toute autre adresse réseau. La fiche affichera « Aucune donnée collectée ».

**Chiffrement** (Export Compliance) : déjà réglé dans l'app (`ITSAppUsesNonExemptEncryption = NO`) : aucune question à l'envoi.

**Droits sur le contenu** (Content Rights) : ⚠ « L'app contient-elle du contenu tiers ? » — **Oui**, et « j'ai les droits » :
les musiques viennent de Suno (les voix d'ElevenLabs ne sont plus livrées dans l'app depuis le 14/10). Garde la preuve
d'abonnement payant à Suno au moment de la génération (Apple peut la demander). Les sons `kaching`, `compteuse`, `cash` et
`compteur` : ⚠ origine à confirmer par Sacha (voir `passation/APP-STORE.md`).

**Identifiant publicitaire (IDFA)** : Non.

**Classification d'âge** — toutes les réponses sont « Aucun / Non », sauf la première (détail et preuves : `pilotage/notes/regard-apple.md`, § 4) :

| Question | Réponse |
|---|---|
| Violence de dessin animé ou fantastique | **Rare / légère** — les voitures s'écrasent et explosent (en mode SURVIVANT, « le dernier explose ») ; aucun personnage, aucun sang. La note attendue est alors **9+**. ⚠ Répondre « Aucune » donnerait 4+, mais l'audit du 14/10 juge cette réponse discutable : mieux vaut la réponse honnête |
| Violence réaliste, contenu sexuel, nudité, grossièretés, alcool/tabac/drogues, horreur, contenu médical | Aucun |
| Jeux d'argent simulés, concours, paris | Aucun (l'argent du jeu se ramasse en course, il n'y a ni mise ni tirage payant) |
| Navigation web libre, contenu généré par les utilisateurs, messagerie, pubs | Non |
| Achats intégrés | Non |

## 6. Notes pour le testeur d'Apple (App Review Information)

Coordonnées : ⚠ ton prénom, ton nom, ton téléphone, ton e-mail. Connexion requise : **Non** (pas de compte).

<!-- notes-revue -->
CASH CAR is a single-player arcade racing game, fully playable offline. No account, no login, no ads and no in-app purchases in this version. Its only network access is an optional check for new versions of the game content (public files, no personal data or identifier sent).

How to reach the gameplay:
1. Launch the app and tap the CASH CAR logo.
2. On the first launch, a short driving school (tutorial) starts; it can be skipped.
3. From the home screen, tap JOUER / PLAY. Left thumb steers, right thumb fires the NITRO. The game plays in portrait and landscape.

About the "$" shown in the game: it is a fictional in-game currency earned only by playing (collected on the road). It cannot be bought, sold or exchanged for real money. Every car in the garage is unlocked with this in-game currency or by completing missions.

The game language follows the device language (French or English) and can be changed in Settings (the gear icon).
<!-- /notes-revue -->

## 7. Ce qu'il reste à fournir

1. ~~Deux adresses publiques~~ — FAIT le 14/10 (Sacha : « publie ») : https://car-cash-git.vercel.app/confidentialite.html et
   https://car-cash-git.vercel.app/assistance.html (contact `16180contact@gmail.com`). Elles sont servies depuis `pages-app/` sur `main`
   (commit cc61d24) : une retouche ici doit être recopiée là-bas, puis poussée.
2. ~~Captures d'écran~~ — FAITES le 14/10 à 14 h sur le code final (T8 `27b4199`), simulateur iPhone 17 Pro Max, 1320 × 2868,
   en JPEG sans transparence (Apple refuse le canal alpha des PNG du simulateur) : `fiche/captures-t8/jpg/` (hors git).
   Français : 1-accueil-fr, 2-course-orage-fr, 3-vol-nuages-fr, 4-garage-fr, 5-boutique-fr.
   Anglais : 1-accueil-en, 2-course-ville-en, 3-vol-nuages-fr (peu de texte), 4-garage-en, 5-boutique-en.
3. **L'archive** : FAITE le 14/10 à 14 h 11 sur T8 (`build/CASH-CAR.xcarchive`). L'export bloque tant qu'aucun compte Apple n'est
   connecté dans Xcode (« No Accounts ») — Sacha : Xcode › Réglages › Accounts › « + ». Puis `sh archiver.sh --envoyer`.
