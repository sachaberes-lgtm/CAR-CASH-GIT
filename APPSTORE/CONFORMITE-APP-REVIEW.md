# CASH CAR — Audit de conformité App Review (14/10/2026)

Périmètre : `VERSION PRINCIPALE/index.html` (55 775 lignes, 5,9 Mo), `pages-app/`, `vercel-build.sh`, `support-email/`, `assets/`, `vendor/`.
Les références `index.html:N` sont des numéros de ligne du fichier. Le dossier `ios/` (projet Capacitor, `PrivacyInfo.xcprivacy`, `Info.plist`) N'EST PAS dans ce dépôt (il vit sur la branche `ios-capacitor` / `app-ios/`, d'après `vercel-build.sh:43`) : ce qui touche au natif est marqué « à vérifier dans Xcode ».

Légende : OK / RISQUE / BLOQUANT.

---

## 1. Achats (guideline 3.1)

| # | Point | Statut | Preuve | Correctif |
|---|---|---|---|---|
| 1.1 | `shopPaye(i)` est un STUB qui rejette toujours : `return Promise.reject(new Error('storekit'))`. Aucun StoreKit/plugin branché. Cliquer ACHETER affiche « BIENTÔT DISPONIBLE » et « Les achats ouvriront à la sortie sur l'App Store ». | BLOQUANT | `index.html:31808`, `31830-31838`, `9183` | Soit brancher StoreKit 2 (plugin Capacitor ou Swift natif) et ne résoudre la promesse qu'après `Transaction.finish`, soit **retirer toute la vitrine payante** (OFFRES, `bqPayantes`, bandeau, palette) du build 1.0. Un bouton d'achat « bientôt » = rejet 2.1 (contenu provisoire) + 3.1.1. |
| 1.2 | `TEST_CAISSES=true` : TOUTES les caisses s'équipent, y compris les premium payantes (`carUnlocked` = `TEST_CAISSES\|\|carUnlockedVrai`). Le commentaire dit « à remettre à false pour la version publique ». C'est un contournement complet de l'achat intégré. | BLOQUANT | `index.html:30234`, `30235` ; idem `TEST_CARRIERE=true` `22024` | Passer `TEST_CAISSES=false` (et `TEST_CARRIERE=false`) dans le build soumis ; ajouter un garde de build qui échoue si `true` (comme `garde-charte.sh`). |
| 1.3 | Restauration des achats : le bouton existe (`RESTAURER MES ACHATS`) mais son action est un toast fixe « AUCUN ACHAT À RESTAURER ». Apple l'exige dès qu'il y a des non-consommables (3.1.1). | BLOQUANT (dès que 1.1 est branché) | `index.html:9190`, `55437` | Appeler `AppStore.sync()` / `Transaction.currentEntitlements`, puis `shopDonne(i)` / `palDonne()` pour chaque droit trouvé. Garder le bouton visible dans OFFRES **et** RÉGLAGES. |
| 1.4 | Un seul identifiant produit existe dans le code : `cashcar.palette40` (0,99 €). Les caisses premium n'ont AUCUN `productId` : `shopPaye(i)` reçoit un index de caisse. | BLOQUANT (même chantier que 1.1) | `index.html:31965`, `30065-30118` | Table `productId` par caisse premium (`cashcar.car.<shape>`), créée dans App Store Connect comme « Non-consommable ». |
| 1.5 | Prix codés en dur en chaîne (« 4,20 € », « 1,61 € », « 161,00 € », « 9,99 € »…) et convertis par `eurTxt`. 4,20 / 1,61 / 161,00 ne sont PAS des paliers de prix Apple. Le prix affiché doit être celui renvoyé par StoreKit (devise locale). | RISQUE | `index.html:30065`, `30076`, `30111-30118`, `46935` | Lire `Product.displayPrice` ; choisir des paliers valides (0,99 / 1,99 / 2,99 / 4,99 / 9,99 …) ; ne jamais afficher une chaîne en dur. |
| 1.6 | Faux « -50 % » : la carte « à la une » barre `9,99 €` et affiche `-50%` à côté du vrai prix. Le prix de référence n'a jamais été pratiqué (les prix ont changé le 06/10). | RISQUE | `index.html` `shopPop` (`spRemise`, `<s>`…`9,99 €`), vers `31860-31880` | Supprimer le prix barré et le badge, ou ne l'afficher que si le prix de référence a réellement été en vigueur. |
| 1.7 | Loot boxes / coffres aléatoires payants : AUCUNE. Le « coffre » est l'icône de l'INVENTAIRE (`pxi-coffre`), pas un tirage. La BOUTIQUE DU JOUR tire sa vitrine d'une graine = jour UTC, avec de l'argent du jeu uniquement, objets montrés avant achat. Les caisses en € sont des achats directs, pas aléatoires. Donc aucune probabilité à afficher. | OK | `index.html:8965`, `46512-46520`, `46569` | Rien. Ne jamais mettre un tirage aléatoire derrière de l'argent réel sans afficher les probabilités (3.1.1). |
| 1.8 | Monnaies : l'argent du jeu ne s'achète PAS en euros (le seul achat € = caisses premium + pack palette). SECONDE CHANCE à la mort = argent du jeu, « jamais d'euros, jamais de pub ». Pas d'achats « cadeau »/« ×2 » en euros (grep : « cadeau » = icône OFFRES ; « tirelire » = bonus en jeu). | OK | `index.html:42429-42433`, `9150` | Rien. |
| 1.9 | Code « cousin » (ENTRER UN CODE dans les réglages) : débloque tout sauf les caisses en euros, code secret en dur. Pas de contournement d'IAP (déjà exclu en code), mais fonctionnalité non documentée = 2.3.1 « hidden features ». | RISQUE | `index.html:30217-30226`, `30241`, `9233` | Mentionner le champ code dans les Notes de review, OU retirer `cousin`/`cousin161` du build App Store. |
| 1.10 | Contenu payant livré sans réseau (hors ligne) : OK, tout est local. Prévoir la persistance des droits : `SAVE.d.owned` n'est pas liée au compte Apple ; si l'appli est réinstallée la restauration (1.3) est la seule voie. | RISQUE | `index.html:31809-31813` | Rejouer les entitlements StoreKit à chaque lancement (cohérence `owned`). |

---

## 2. Données et confidentialité (guideline 5.1)

### 2.1 Ce que le jeu envoie / stocke (audit grep)

- Réseau sortant : AUCUN domaine tiers. `fetch()` : 7 occurrences, toutes vers des fichiers du jeu (sonde HEAD de musique `36196`, décodage audio `37267`, `version.json` `55654` — ce dernier désactivé sous Capacitor `55635`). Aucun `XMLHttpRequest`, `sendBeacon`, `WebSocket`.
- Aucun analytics / SDK pub : 0 occurrence de `gtag`, `firebase`, `analytics`. Les 92 occurrences de « poki » sont des classes CSS `html.poki` et des commentaires ; `PORTAIL_SDK`/Poki/Crazy ne chargent AUCUN script (`<script src>` = `vendor/*.js` + `figures.js` uniquement, `index.html:9305-9312`).
- Aucun CDN : three.js, post-processing, shaders et police Press Start 2P (`assets/fonts`, OFL.txt présent) sont locaux.
- Stockage : `localStorage` clé `cashcarSave` (+ miroir Capacitor Preferences = NSUserDefaults) : réglages, progression, meilleur score, classement local, caisses possédées. Rien n'en sort (`index.html:38307`, `38477-38505`).
- Aucun accès caméra / micro / localisation (`getUserMedia`, `geolocation` : 0). Presse-papier uniquement sur geste (export du code de sauvegarde, `42915`, `55469`).

Statut : **OK** (rien n'est collecté).

### 2.2 Politique de confidentialité

| Point | Statut | Preuve | Correctif |
|---|---|---|---|
| Page présente (FR/EN), déployée à la racine du site Vercel : `/confidentialite.html` | OK | `pages-app/confidentialite.html`, `vercel-build.sh:42-44` | Renseigner l'URL exacte dans App Store Connect. |
| Le texte affirme « aucune requête réseau, entièrement hors ligne » : exact aujourd'hui, FAUX dès que StoreKit est branché (Apple traite les paiements) et si une édition web `/jouer` charge `version.json`. | RISQUE | `pages-app/confidentialite.html` §« En résumé » | Ajouter : « Les achats intégrés sont traités par Apple ; nous ne recevons aucune donnée de paiement. » |
| Lien vers la politique DANS l'appli : AUCUN (grep `confidentialit`/`privacy` = 0 dans `index.html`). La 5.1.1(i) exige le lien dans App Store Connect ET « accessible dans l'app ». | RISQUE | grep `index.html` | Ajouter une ligne « CONFIDENTIALITÉ » dans RÉGLAGES qui ouvre la page (in-app browser ou `Browser.open`). |
| Contact : `16180contact@gmail.com` (adresse personnelle gmail) | RISQUE (mineur) | `pages-app/confidentialite.html`, `assistance.html` | Acceptable ; préférable `support@<domaine>` (pipeline Worker déjà préparé, `support-email/README.md`, domaine non acheté). |

### 2.3 Étiquette de confidentialité (App Privacy) proposée case par case

Réponse globale : **« Data Not Collected »** (aucune donnée collectée, aucun suivi).

| Catégorie Apple | Collectée ? |
|---|---|
| Contact info (nom, e-mail, tél.) | Non |
| Santé et forme | Non |
| Finance (infos de paiement) | Non (les paiements sont gérés par Apple, pas par l'appli) |
| Localisation | Non |
| Contacts | Non |
| Contenu utilisateur | Non |
| Historique de navigation / recherche | Non |
| Identifiants (User ID, Device ID) | Non |
| Achats (historique d'achat) | Non (Apple ne demande pas de déclarer les achats StoreKit seuls ; ne pas les envoyer à un serveur) |
| Données d'utilisation / diagnostics | Non |
| Autres données | Non |
| Suivi (tracking) | Non |

### 2.4 ATT / IDFA

- ATT : **non nécessaire**. Aucun SDK pub, aucun suivi inter-apps. Ne PAS ajouter `NSUserTrackingUsageDescription`, ne pas appeler `ATTrackingManager`. Statut : OK.
- IDFA : n'est pas lu. Répondre « Non » à la question « Does this app use the Advertising Identifier ? » à l'upload.

### 2.5 PrivacyInfo.xcprivacy (APIs « required reason »)

Statut : **RISQUE — non vérifiable ici** (aucun `.xcprivacy` dans ce dépôt ; recherche dans tout le dépôt = seulement une mention dans `JOURNAL.md`).

À déclarer dans le manifeste de l'APP :
- `NSPrivacyTracking` = false ; `NSPrivacyTrackingDomains` = [] ; `NSPrivacyCollectedDataTypes` = [].
- `NSPrivacyAccessedAPICategoryUserDefaults` raison **CA92.1** (Capacitor Preferences = NSUserDefaults, `index.html:38479`).
- Catégories probables via le noyau Capacitor / WKWebView : `FileTimestamp` (C617.1 ou 0A2A.1), `SystemBootTime` (35F9.1), `DiskSpace` (E174.1 ou 85F4.1) — vérifier avec Xcode > Product > Archive > « Generate Privacy Report » ; Capacitor 6+ et les plugins Preferences/Haptics livrent normalement leurs propres manifestes. Rejet automatique ITMS-91053 si une API est utilisée sans raison déclarée.

---

## 3. Classement d'âge (questionnaire Apple 2025 : 4+ / 9+ / 13+ / 16+ / 18+)

Réponses proposées, d'après le contenu réel :

| Question | Réponse | Raison / preuve |
|---|---|---|
| Violence de dessin animé ou fantastique | Occasionnelle / légère | La caisse explose à la mort (sons `explosion`, `gong`) ; aucun personnage, aucun sang, aucun humain touché. |
| Violence réaliste | Aucune | |
| Violence/sang graphique | Aucune | |
| Contenu sexuel / nudité | Aucun | |
| Grossièretés / humour cru | Aucun | Ton « arrogant, second degré » mais sans insulte (revérifier les `*_LINES`). |
| Horreur / thèmes effrayants | Aucun | |
| Alcool, tabac, drogues | Aucun | |
| Médical / traitements | Aucun | |
| Jeux d'argent simulés | **Aucun** | Pas de machine à sous, roue, cartes, mise. Le mot « cash » et le décor « CASINO / TOUT OU RIEN » (panneau de ville, `index.html:15854`) sont décoratifs, sans mécanique de pari. |
| Concours / compétitions avec prix | Aucun | |
| Loot boxes / objets aléatoires payants | **Non** | voir 1.7 |
| Accès web non restreint | Non | |
| Contenu généré par les utilisateurs | Non | Le nom de saisie du classement est local. |
| Messagerie / chat | Non | |
| Contrôle parental / vérification d'âge | Non | |

**Tranche attendue : 9+** (violence de dessin animé occasionnelle) ; **4+** possible si l'on coche « Aucune » pour la violence (explosions de véhicule sans personnage). Ne PAS choisir la catégorie « Kids » : achats intégrés + liens = contraintes lourdes (1.3).
Statut : OK, avec une vigilance : le nom « CASH CAR » + argent virtuel peut déclencher une question réviseur « jeu d'argent simulé ? » → réponse prête : aucune mise ni gain d'argent réel (5.3 non applicable).

---

## 4. Liens externes, support, conditions

| Point | Statut | Preuve | Correctif |
|---|---|---|---|
| Liens sortants dans le jeu : AUCUN (`href=` ne contient que icône/manifest/apple-touch-icon ; `window.open` = 0 ; `mailto:` = 0). | OK | `index.html:9,16,17` | Rien. |
| URL de support : `/assistance.html` (page FR/EN existante, e-mail gmail). | OK | `pages-app/assistance.html`, `vercel-build.sh:44` | Entrer l'URL de production dans App Store Connect > « Support URL ». |
| URL de confidentialité obligatoire : `/confidentialite.html` | OK | idem | idem. |
| Conditions d'utilisation (EULA) : aucune page ; l'EULA standard d'Apple s'applique par défaut. | OK | — | Rien à faire sauf EULA personnalisée voulue. |
| Pipeline support e-mail → Telegram : non en service (domaine non acheté). | RISQUE (mineur) | `support-email/README.md` | Tant que le domaine n'est pas pris, garder `16180contact@gmail.com` et vérifier la boîte avant la soumission. |

---

## 5. Contenus de marques et propriété intellectuelle (guideline 5.2)

Recherche exhaustive des mots-clés dans le fichier : `Tesla`, `Cybertruck`, `Hummer`, `Jeep`, `Lambo` (hors `Lamborghini` en commentaire) = 0 occurrence. Il reste :

### 5.1 Noms de caisses et contenu visible par le joueur

| Caisse | Évoque | Risque | Preuve | Renommage proposé |
|---|---|---|---|---|
| **CHAT POP-TART** (shape `poptart`, + traînée arc-en-ciel « NYAN ») | Nyan Cat (Chris Torres, marque et droits actifs) + Pop-Tarts (Kellogg's). C'est l'OFFRE À LA UNE payante à 4,20 €. | **BLOQUANT** | `index.html:19243`, `30065`, `19717` ; 68 occurrences « Nyan », 32 « Pop-Tart » | « CHAT TOASTÉ » / « MINOU CUBE » ; supprimer les mentions Nyan/Pop-Tart du code visible, redessiner le corps (tartine + chat) et l'arc-en-ciel pixel (motif à changer). Ne PAS vendre cette caisse en € tant que ce n'est pas fait. |
| **LE DOGE** (shape `doge`, phrases « Wow… Beaucoup roues ») | Mème Doge/Kabosu (image photographique d'origine, marque Dogecoin) | RISQUE | `index.html:19417-19421`, `19900` | « LE SHIBA » → « LE TOUTOU » ; garder voxel, retirer « wow / much » et la police Comic Sans-like si présente. |
| **ELDORADO** | Cadillac Eldorado Biarritz 1959 : nom de modèle déposé (GM) | RISQUE | `index.html:24279` (commentaire) | « EL DORADO » en deux mots sans silhouette de Cadillac, ou « LA DORÉE ». |
| **LE QUATTRO** | « quattro » = marque Audi | RISQUE | shape `b_quattro` | « LE QUATRE ROUES » / « LA 4X4 ». |
| **LA DAYTONA** | Ferrari 365 GTB/4 « Daytona » (aussi Dodge) | RISQUE | shape `b_daytona`, `19328` | « LA PISTE » / « LE SPEEDWAY ». |
| **LA STRATOS** | Lancia Stratos | RISQUE | `19332` | « LA STRATE » / « LA FUSÉE ». |
| **LE CHARGEUR / CHARGEUR 69 / LE DÉFIEUR** | Dodge Charger (+ « General Lee »/« Challenger ») | RISQUE | shapes `a_chargeur`, `a_chargeur69`, `a_defieur` | « LA MUSCLE » / « LE FOUDRE 69 » / « LE REBELLE ». |
| **LA ZED** | Nissan Z (« 240Z ») | RISQUE (faible) | shape `e_zed` | « LA ZIGZAG ». |
| **ROSSO 40** | Ferrari F40 (« Rosso » + 40) | RISQUE | `24406` (commentaire) | « ROUGE 40 » → « LE ROUGE ». |
| **POSTER 84** | Lamborghini Countach (silhouette en coin) | RISQUE (faible) | `24455` | Nom neutre déjà ; adoucir la silhouette (portes ciseaux, prise d'air NACA). |
| **LE CAÏD** | Mercedes G63 (cube 3 t) | RISQUE (faible) | `24342` | Nom neutre déjà ; supprimer le commentaire « G63 » (pas visible). |
| **SA MAJESTÉ** | Rolls-Royce Phantom (« emblème chromé », calandre) | RISQUE | `24404` | Retirer l'« emblème chromé » de la calandre. |
| **LE TRIDENT** | Maserati (trident) | RISQUE | shape `c_trident` | « LE FOURCHE » / « LA TRIDENTE ». |
| **LA BAVAROISE**, **LA PAGODE**, **LA DEUCHE**, **LE COMBI**, **LA BULLE**, **LA VETTE**, **LE TOUT-TERRAIN SOVIÉTIQUE** (Lada Niva `c_niva`) | Surnoms de BMW / Mercedes SL / Citroën 2CV / VW Combi / VW Coccinelle / Corvette / Lada | RISQUE (faible, surnoms populaires) | shapes `b_bavaroise`, `d_pagode`, `a_deuche`, `combi`, `bulle`, `d_vette`, `c_niva` | Garder ; ne PAS reproduire logos/calandres. `LA DEUCHE` est déjà `retire:1`. |
| **LA NOCTAMBULE** (ex-Chauve-souris, shape `d_batmobile`) | Batmobile (DC) — nom déjà changé le 14/10, mais le NOM DE SHAPE reste `d_batmobile` | RISQUE (faible, interne) | `index.html:30106`, `19334` | Renommer le shape `d_noctambule` ; vérifier que la silhouette (ailerons, bulle) n'est pas un décalque. |
| **LE BLINDÉ NOIR** (ex-Chevalier noir) | Batman (shape `d_chevalier`) | RISQUE (faible) | `30116` | OK après changement de nom ; shape `d_blinde`. |
| **LA PIZZA EXPRESS** | Livraison de pizza générique | OK | | — |
| **LA FÉLINE** | Jaguar (type E) | RISQUE (faible) | shape `e_feline` | RAS tant qu'aucun félin chromé n'orne le capot. |

Texte visible qui cite une vraie marque : « on vient de doubler une Ferrari » (description de `LE BREAK`/« Sept places », `index.html:19277`, traduction `19777`) → remplacer par « une supercar ».

Références culturelles dans les COMMENTAIRES uniquement (GTA, Vice City, Zelda TOTK, Geometry Dash, Minecraft, Fortnite, Roblox, Spotify) : non visibles du joueur, donc pas de risque 5.2. Mais le mot « VICE CITY NUIT » ne doit pas apparaître dans la fiche App Store.

### 5.2 Sons et musiques tiers

| Point | Statut | Preuve | Correctif |
|---|---|---|---|
| Sons de mort : `minecraft.m4a`, `explosion.m4a`, `eww.m4a`, `gong.m4a`. Le code dit « placeholders de synthèse, les originaux sous licence restent à fournir » : la provenance finale n'est pas tranchée ; le fichier `minecraft.m4a` porte le nom d'une marque ; `eww` est une voix TTS (licence du moteur TTS à vérifier). | RISQUE | `index.html:38127-38136`, `assets/audio/death/` | Renommer `minecraft.m4a` → `boum-pixel.m4a` ; garder uniquement les sons dont la licence est connue ; justificatif TTS ou supprimer `eww`. |
| Musiques : `lobby/chris-*.m4a`, `ville/ville-n*.m4a`, `ciel/ciel-*.m4a`, `lvl1-neon-cash-car-v3.mp3`, `lvl2-cash-car-vitesse.mp3`, `noite-de-velocidade.mp3`, `swag-cash-car-2.m4a`, `addictive-loop.m4a`, `glassy-plucks-boucle.m4a`. Aucun fichier de licence ni de crédit dans le dépôt. | RISQUE | `assets/audio/music/*` | Constituer `assets/audio/LICENCES.md` : auteur, outil/source, licence, preuve (facture/ToS). Si généré par IA, vérifier les conditions commerciales de l'outil. |
| Effets argent : `cash.mp3`, `kaching.mp3`, `compteur.mp3`, `compteuse.mp3` — origine non documentée. | RISQUE | `assets/audio/fx/` | Idem : prouver la licence ou régénérer. |
| Police Press Start 2P (OFL) : `OFL.txt` présent | OK | `assets/fonts/OFL.txt` | Garder le fichier dans l'archive. |
| three.js r128 (MIT) : en-tête de licence présent dans `vendor/three.min.js` | OK | `vendor/three.min.js:1-5` | Ajouter une section « Crédits » dans RÉGLAGES si possible. |

---

## 6. Autres guidelines

| # | Point | Statut | Preuve | Correctif |
|---|---|---|---|---|
| 6.1 | **2.1 Complétude / crash** : la boucle principale avale les exceptions (`try/catch` dans `loop`) — un état cassé ne plante pas mais peut geler le gameplay sans message. Fichier unique de 5,9 Mo (chargement WKWebView lent sur vieux iPhone). | RISQUE | `index.html` (`window.__loopErr`), taille 5 937 554 octets | Mesurer le démarrage à froid sur iPhone 12 ; `dbgPerf()` ; prévoir un écran d'erreur si WebGL2 indisponible. |
| 6.2 | **2.1 Contenu provisoire** : « BIENTÔT » sur les caisses `{k:'bientot'}` (REQUIN, COMÈTE) et sur les achats ; dossiers `dbg*` exposés (160 `window.dbg*`). | RISQUE | `index.html:30066-30067`, `31836`, 160 hooks `window.dbg` | Masquer les caisses « bientôt » ; garder les hooks derrière `DEV` éteint (charte : « rien de développement à l'écran »). |
| 6.3 | **4.2 Fonctionnalité minimale / jeu web emballé** : c'est un jeu 3D à part entière, hors ligne, avec haptique native (Taptic Engine), Preferences natif, sauvegarde persistante, musique, boutique — pas un simple site. Risque 4.2 : faible. | OK | `index.html:38477`, `38663` | Mentionner dans les notes de review : « jeu 3D natif WebGL2 intégré via Capacitor, entièrement hors ligne ». |
| 6.4 | **2.5** : pas d'API privée ; plugins officiels Capacitor uniquement ; pas de téléchargement de code exécutable (le seul `fetch` est local, `version.json` désactivé sous Capacitor `55635`). Service worker ignoré sous Capacitor (`55624`). | OK | `index.html:55621-55635` | — |
| 6.5 | Permissions : aucune demande système (pas de caméra/micro/loc/notifications). Vibrations via Haptics (pas de permission). Audio : lecture seule. Wake Lock/plein écran : sans permission. Aucune clé `NS*UsageDescription` nécessaire. | OK | grep `getUserMedia`/`geolocation` = 0 | Ne pas ajouter de description d'usage inutile (rejet 5.1.1). |
| 6.6 | Hors ligne : 100 % local (assets embarqués dans le bundle Capacitor). | OK | `sw.js`, `assets/` | — |
| 6.7 | Langue : FR + EN (`LANG`, `TR`, `I18N`) ; la langue suit celle du téléphone (passe de lancement). | OK | `index.html:19563`, `19710` | Vérifier que la fiche App Store est aussi FR + EN. |
| 6.8 | Accessibilité : `REDUCED_MOTION` + `data-reduced-motion` respectés ; cibles 44 px et safe-areas (charte) ; pas de VoiceOver pour la scène 3D ; `aria-label` partiel sur les plaques `.pbtn`. | RISQUE (mineur) | `index.html:31830` (spDuree), `5753` | Étendre `role="button"` + `aria-label` à tous les `.pbtn` ; documenter « jeu d'arcade réflexe, non compatible VoiceOver » dans la fiche d'accessibilité. |
| 6.9 | `prompt()` utilisé pour l'export/import du code de sauvegarde (repli presse-papier). Sous WKWebView/Capacitor, `prompt()` fonctionne (délégué natif) mais est interrompu en plein jeu. | RISQUE (mineur) | `index.html:42917`, `42920` | Utiliser la fenêtre du jeu (déjà remplacée ailleurs, `9374`). |
| 6.10 | Manifest : `orientation:"any"` alors que la coque est portrait. Sans effet sous Capacitor (`Info.plist` décide). | OK | `manifest.webmanifest` | Fixer `UISupportedInterfaceOrientations` dans Xcode. |

---

## Tableau récapitulatif — BLOQUANTS D'ABORD

| Rang | Statut | Point | Où | Action |
|---|---|---|---|---|
| 1 | BLOQUANT | `TEST_CAISSES=true` : toutes les caisses premium équipables sans payer | `index.html:30234` | Mettre à `false` + garde de build. |
| 2 | BLOQUANT | `shopPaye` = stub, achats « BIENTÔT DISPONIBLE » | `index.html:31808` | Brancher StoreKit 2 ou retirer la vitrine payante. |
| 3 | BLOQUANT | Restauration des achats = toast factice | `index.html:55437` | `AppStore.sync` + entitlements. |
| 4 | BLOQUANT | Aucun `productId` par caisse, un seul id (`cashcar.palette40`) | `index.html:31965` | Créer les produits dans App Store Connect. |
| 5 | BLOQUANT | CHAT POP-TART = Nyan Cat + Pop-Tart, vendu à la une 4,20 € | `index.html:19243`, `30065` | Renommer + redessiner avant la vente. |
| 6 | RISQUE | Prix non conformes aux paliers Apple, chaînes en dur | `index.html:30065-30118` | Lire `displayPrice`, paliers valides. |
| 7 | RISQUE | Faux « -50 % » (prix barré 9,99 €) | `shopPop` | Supprimer. |
| 8 | RISQUE | Pas de lien confidentialité dans l'appli | `index.html` (grep 0) | Ligne RÉGLAGES. |
| 9 | RISQUE | `PrivacyInfo.xcprivacy` non vérifié (UserDefaults CA92.1…) | dossier `ios/` absent | Générer le rapport Xcode. |
| 10 | RISQUE | Licences musique / sons non documentées ; `minecraft.m4a`, TTS | `assets/audio/` | `LICENCES.md`, renommage. |
| 11 | RISQUE | Noms de modèles réels : ELDORADO, QUATTRO, DAYTONA, STRATOS, CHARGEUR(69), ZED, ROSSO 40, TRIDENT ; « Ferrari » dans une description | voir §5.1 | Renommer (propositions ci-dessus). |
| 12 | RISQUE | LE DOGE (mème) | `index.html:19417` | Rebaptiser, retirer phrases du mème. |
| 13 | RISQUE | Code « cousin » caché dans les réglages | `index.html:30217` | Documenter ou retirer. |
| 14 | RISQUE | Caisses « BIENTÔT » / hooks `dbg*` / `prompt()` / accessibilité | §6 | Nettoyer. |
| 15 | OK | Aucune donnée collectée, aucun réseau tiers, aucun ATT | §2 | Étiquette « Data Not Collected ». |
| 16 | OK | Classement d'âge 9+ (ou 4+), aucun jeu d'argent simulé, aucune loot box | §3 | — |
| 17 | OK | Support + confidentialité hébergés (Vercel), langues FR/EN, hors ligne | §4, §6 | — |
