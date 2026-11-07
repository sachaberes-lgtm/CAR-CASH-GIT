# CASH CAR — AUDIT DU JURY FINAL avant l'App Store (2026-11-05)

Jury : Fable 5.1, à la demande de Sacha (« un audit ultra complet… comme un superviseur final, avant de le lancer sur l'Apple Store »).
Méthode : huit audits en parallèle (économie/sauvegarde/missions/voitures · son · interface · rendu/maps/perf · gameplay · app iOS/App Store · hygiène du code · passage en direct dans un vrai Chrome émulant iPhone debout/couché/SE et ordi, 187 captures, 7 courses, FR et EN). Rien n'a été modifié dans le dépôt. Les huit rapports détaillés (avec extraits de code et captures) sont dans
`C:\Users\sacha\AppData\Local\Temp\claude\C--Users-sacha-OneDrive-Desktop-CAR-CASH\0352711a-c0da-44aa-affa-77fca4bc7bc7\scratchpad\` (`audit-economie.md`, `audit-son.md`, `audit-interface.md`, `audit-rendu.md`, `audit-gameplay.md`, `audit-ios.md`, `audit-hygiene.md`, `audit-direct.md`, captures dans `shots\`). Ce dossier en est la synthèse et le plan d'action.

État du dépôt au moment de l'audit : `main` b4f1af63, sw `cashcar-v1132` non commité, une AUTRE session Claude est en plein chantier Arrakis (dunes-1 à 4, biomes, embellie, ruines modifiés ; dunes-dieux/gizeh supprimés). À garder en tête pour les zones de fichiers (§6).

---

## 1. VERDICT DU JURY

**Le jeu est au-dessus de la moyenne des jeux web empaquetés** : 0 erreur JS sur tous les écrans et toutes les courses, 0 fichier manquant, 0 erreur de syntaxe dans 251 morceaux, interface finie en debout ET en couché, deux langues, 50 caisses actives, 91 fiches cohérentes avec leurs conditions, service worker propre, garde-allège respectée, pas de fuite détectée par partie dans la scène three.js.

**Mais en l'état, l'app ne peut pas être envoyée à Apple**, pour cinq raisons indépendantes, chacune suffisante :

| # | Raison | Preuve | Qui corrige |
|---|---|---|---|
| B1 | **La chaîne de livraison de l'app est cassée depuis le 3/11** : `npm run sync`, `archiver.sh` et `publier-maj.js` s'arrêtent sur une coupe de `preparer-www.js` (« LE CHARGEUR » attendu 13 fois, trouvé 14). Le `www/` embarqué date du 27/10 (204 commits de retard) et la branche `app-maj` publie déjà une version que l'app ne peut pas fabriquer. | ECO-01, IOS-01, IOS-02 | Sonnet (jour 0) |
| B2 | **Trois motifs de refus Apple visibles à l'écran** : la page de confidentialité dit « aucune requête réseau » (faux depuis Capgo) ; l'écran de mort dit « CONTINUER ▶ PUB » / « AD » sur une promo-maison alors que la fiche déclare « aucune publicité » ; le Final Spin est une machine à sous non déclarée (Simulated Gambling, 12+). | IOS-03, IOS-04, IOS-13, DIR-29 | Opus + décisions Sacha D1–D3 |
| B3 | **Le testeur Apple peut ne jamais voir la caisse** : gel de 20 à 65 s au démarrage sur 8 chargements sur 15 (profil : 25 s dans le `draw()` du sprite « 1.61 » de `rendu/soleil-planete.js`, lecture synchrone du canvas sous contention GPU) ; les dunes Arrakis se construisent sur le fil principal quand la partie n'a pas démarré (5 à 9 s estimés sur iPhone) ; 420 Mo de tas JS après 3 courses (+50 à 70 Mo par partie jamais rendus), ce qui finit en « contexte 3D perdu » sur un iPhone à 4 Go. | DIR-01, RND-01, DIR-02 | Fable |
| B4 | **Le jeu web vend des caisses « premium » avec un bouton ACHETER qui refuse toujours** (`shopPaye` renvoie 'storekit'), et `TEST_CAISSES=true` est sur le web (toutes les caisses offertes). | INT-01, ECO-02, HYG-01 | Opus (ACHAT) + Sonnet (TEST_CAISSES) |
| B5 | **Propriété intellectuelle** : CHAT POP-TART (Kellogg + Nyan Cat), DOGE, et une dizaine de caisses « inspirées » (ROSSO 40, batmobile, PIZZA EXPRESS…), avec les commentaires « Ferrari / Batman / Nyan » lisibles dans le `www/` livré. Sacha a déjà dit « on prend le risque » pour POP-TART ; le jury recommande au minimum de renommer et de purger les commentaires du livrable. | IOS-05, IOS-18, IOS-11 | Sacha D4 + Opus |

Derrière ces cinq bloquants, **une trentaine de majeurs** (la frénésie qui peut devenir muette sur iPhone, la boucle qui avale ses exceptions et fige la caisse sans mort, le ralenti qui dilate les chronos sous 20 fps, la sauvegarde importable sans contrôle, l'app qui bannit une mise à jour pour toujours si on la tue pendant le chargement, le CSS qui exige iOS 16.4 alors que la cible dit 15.0, 83 Mo d'audio embarqués dont 55 jamais joués) et **environ 180 mineurs et finitions** (clés I18N manquantes, pastille « NEW » en anglais, chevauchements sous RETOUR, 1 355 `!important`, 30 variantes `?x=ancien`, 27 crochets de test livrés, 18 sondages permanents, 92 % de `try/catch` muets).

**Le plan tient en une semaine** si trois agents travaillent en parallèle sur des zones disjointes (§6), si Sacha tranche les neuf décisions du §4 dès le jour 0, et si la fusion se fait dans l'ordre Sonnet → Opus → Fable avec un passage sur Mac en fin de semaine.

---

## 2. CHIFFRES CLÉS

| Mesure | Valeur | Source |
|---|---|---|
| Taille de `index.html` / nombre de morceaux | 9,86 Mo / 251 | ORDRE.txt |
| Téléchargé avant le premier écran | 22,5 Mo (dont `sons-banque.js` 7,3 Mo, même son coupé) | DIR-06 |
| Temps prêt, machine calme (Chrome, Ryzen + RX 6600) | 2,2 à 3,1 s, une tâche longue de 1,7 à 2,5 s | DIR |
| Gel intermittent au démarrage | 20 à 65 s, 8 chargements sur 15 | DIR-01 |
| Tas JS accueil → après 3 courses | 228 → 420 Mo | DIR-02 |
| Résolution 3D sur iPhone (`DPR_CAP=1` sous ALLEGE) | 390×844 pour 1170×2532 (1 pixel sur 9) | DIR-03 |
| Audio embarqué dans l'app / jamais joué | 83 Mo / ~55 Mo | SON-01 |
| PCM décodé au chargement | ~45 Mo (+30 à 40 en course) | SON-02 |
| `try/catch` / muets | 1 690 / 92 % | HYG |
| `!important` dans le CSS | 1 355 | INT-27 |
| `color-mix()` sans repli (iOS ≥ 16.2) / `:has()` (≥ 15.4) | 166 / 47, cible déclarée 15.0 | IOS-10, HYG-02 |
| Variantes `?x=ancien` / crochets `dbg` livrés / `setInterval` jamais arrêtés | 30 / 27 / 18 | HYG-09, 11, 08 |
| Caisses (actives / retirées) | 50 / 41 (CARS = CAR_UNLOCK = 91 ✔) | ECO |
| Erreurs JS / 404 en navigation complète FR + EN | 0 / 0 | DIR |

---

## 3. LES BLOQUANTS, dans l'ordre où ils se corrigent

Niveau requis : **F** = profond (moteur, architecture, plusieurs fichiers, besoin de Fable) · **O** = borné (un fichier ou une fonction, Opus) · **S** = mécanique (texte, CSS, une ligne, Sonnet) · **SACHA** = décision humaine.

| ID | Quoi | Où | Correction | Niveau |
|---|---|---|---|---|
| ECO-01 / IOS-01 | `preparer-www.js:108` : `toutes('LE CHARGEUR',…,13)` trouve 14 depuis le commentaire ajouté le 3/11 dans `garage-menu-inventaire.js:195` → sync/archiver/publier-maj échouent | `app-ios/preparer-www.js` | Compter 14, ou mieux : coupe tolérante (`>=13`) + le script `--essai` lancé par `vercel-build.sh` pour qu'une coupe cassée bloque la publication web avant l'app | S |
| IOS-02 | `www/` au jeu 30c137fd (27/10) ; `app-maj` publie 817f34a7 (3/11) | `app-ios/www`, branche `app-maj` | Une fois ECO-01 corrigé : `npm run sync`, commit, et repartir d'un `publier-maj` propre | O |
| ECO-02 / HYG-01 | `const TEST_CAISSES=true;` sur le web (toutes caisses offertes) | `code/economie/aura-banque-contrats.js:93` | `false` + une ligne dans `garde-demarrage.cjs` qui refuse `TEST_CAISSES=true` | S |
| ECO-03 | `san()` ne recopie pas `m2.mq` → les missions effacées reviennent | `code/sauvegarde.js:173-185` | `o9.mq=L9(s9.mq,200);` | S |
| IOS-03 | `pages-app/confidentialite.html` : « aucune requête réseau » (faux : Capgo, raw.githubusercontent.com) | `pages-app/` | Recopier la version vraie de `app-ios/fiche/` ; **push main = OUI écrit de Sacha** | S + SACHA |
| IOS-04 / DIR-29 | « CONTINUER ▶ PUB », écran « AD », pub-maison de 3 s, dans une app déclarée sans pub | `code/gameplay/seconde-chance.js:11-12,40-51`, `code/css/mort-flottante.css:118-138` | Dans l'app (`TEL_NATIF`) : `sans:true`, libellé « PROMO » ou suppression du ×2 ; décision D1 | O + SACHA |
| IOS-13 | Final Spin = machine à sous | `code/economie/final-spin*.js` | Déclarer « Simulated Gambling » (12+) ou le couper dans l'app ; décision D2 | SACHA |
| IOS-05 / IOS-18 | POP-TART (Kellogg + Nyan Cat), DOGE, CABOSSÉE, BAROUDEUR, ATCHOUM ; ROSSO 40, ELDORADO, SPECTRE, batmobile, PIZZA EXPRESS | `code/voitures/cars.js`, dessins, commentaires | Décision D4 : renommer (le nom + la desc + I18N, jamais l'index), purger les commentaires de marques du livrable | SACHA + O |
| INT-01 | Écran ACHAT et rayon `achat` montrent des caisses en € avec ACHETER, mais `shopPaye` refuse toujours ('storekit') | `garage-menu-inventaire.js:47` (tuile), `BQ_CATS` (rayon), `#mShop` | Masquer ACHAT/rayon/tuile tant que StoreKit n'existe pas (web ET app) ; ou brancher StoreKit (hors semaine) ; décision D3 | O |
| RND-01 | Dunes Arrakis (`DN_VASTE=2`) construites sur le fil principal quand `!started` | `code/maps/dunes-1.js:479-480` | Toujours via le worker ; `dunes` dans `PREB_CPU_DEF` ; **coordonner avec la session Arrakis en cours** | F |
| DIR-01 | Gel de 20 à 65 s au démarrage (25 s dans `draw()` du soleil 1.61) | `code/rendu/soleil-planete.js:7-45` | Pré-rendre les deux sprites en PNG dans `assets/`, ou dessiner après le 1er rAF du menu ; mesurer sur iPhone (`?perf=1`) | O (Fable l'absorbe, même fichier que l'ALLEGE) |
| DIR-02 | +50 à 70 Mo de tas par partie, jamais rendus | maps, traînées, particules, audio décodé | `renderer.info.memory` + instantanés de tas entre deux courses ; `dispose()` manquants ; audio décodé à la demande (SON-02) | F |
| IOS-06 | `notifyAppReady` à la fin du script de 9,6 Mo ; app tuée pendant → version bannie à vie dans `ccMajRefus` | `app-ios/natif/natif.js` | notify à `DOMContentLoaded`, bannir après 2 échecs, timeout 120 s | F |
| IOS-08 | `core.autocrlf=true` sur PC → hachages différents PC/Mac → mises à jour Capgo incohérentes | `.gitattributes` | `* text=auto eol=lf` + renormalisation, ou construire uniquement sur Mac | F |
| IOS-10 / HYG-02 | Cible iOS 15.0 mais 166 `color-mix` (16.2), 47 `:has` (15.4), `@container` | `app-ios/ios/App/App.xcodeproj`, `capacitor.config` | Cible 16.4 (seule correction honnête en une semaine) | O |

---

## 4. DÉCISIONS DE SACHA (à trancher le jour 0, elles débloquent les agents)

| # | Question | Recommandation du jury | Débloque |
|---|---|---|---|
| D1 | Le ×2 et la seconde chance « payés » par une pub-maison : **couper dans l'app** (`sans:true`, pas de ×2), ou garder en les appelant « PROMO » ? | Couper dans l'app : zéro mot « PUB/AD », zéro risque 3.1.1 / 5.1.1. Le web garde le ×2. | Opus |
| D2 | Final Spin : **déclarer Simulated Gambling (classe 12+)** ou le couper dans l'app ? | Déclarer 12+ (la cible est déjà ados) et garder le spin, sans monnaie réelle. | Sacha (App Store Connect) |
| D3 | ACHAT / caisses en € : **masquer partout** cette semaine (StoreKit = version 1.1) ? | Masquer. Un ACHETER qui refuse est pire qu'un rayon absent. | Opus |
| D4 | Noms à risque IP : **renommer** POP-TART → ?, DOGE → ?, ROSSO 40, batmobile, PIZZA EXPRESS… (nom + desc + I18N, l'index ne bouge pas) ? Sacha a dit « on prend le risque » pour POP-TART le 13/10 ; le jury maintient sa réserve, mais c'est son choix. | Renommer au moins DOGE (marque déposée + crypto) et purger tous les commentaires « Ferrari/Batman/Nyan » du livrable ; POP-TART = choix de Sacha. | Opus + Sonnet |
| D5 | `DPR_CAP=1` sous ALLEGE (3D à 1 pixel sur 9 sur iPhone) : **plafond 1,5 sur A15+ / RAM ≥ 4 Go**, et 2 au menu/garage où rien ne bouge ? C'est la règle « téléphone = optimisée » du 25/10 qui est en jeu. | 1,5 en course sur A15+ avec l'adaptatif existant, 2 dans les menus. Un testeur Apple sur 15 Pro voit le flou à la première seconde. | Opus |
| D6 | Le web sans sauvegarde (`SAVE.neuf` partout sauf `?garde=1`) : voulu pour la démo, ou à remettre ? | Remettre la sauvegarde sur le web (Vercel) : un joueur qui perd ses caisses au rechargement ne revient pas. | Opus |
| D7 | Départ sans entrée = mort en 6 s (DIR-09) : rails 3 s au départ ? | Oui, grâce de 3 s en ligne droite. | Opus |
| D8 | Garage : rideau de flammes à l'arrivée (DIR-28) → porte fermée, flammes seulement au JOUER ? Et la plaque dès le premier lancement (DIR-46) → après la 1re course ? | Les deux : c'est l'onboarding d'un testeur Apple. Choix artistique Sacha/Léo. | Opus |
| D9 | `passation/APP-STORE.md:47-48` : SIREN, téléphone, e-mail dans un dépôt public ; le `www/` contient des commentaires lisibles. Dépôt privé, ou purge ? | Purger les coordonnées du dépôt (`git filter-repo` n'est pas nécessaire si le dépôt devient privé). | Sacha |

Rappels non négociables (APP-STORE.md) : **jamais de push sur `main` sans OUI écrit de Sacha, jamais d'envoi à Apple sans OUI, jamais de saisie de mot de passe par un agent.** Chaque agent travaille sur sa branche, Sacha fusionne.

---

## 5. LA LISTE COMPLÈTE, par zone

Format : `ID · gravité · niveau · où → correction`. Les détails (lignes exactes, extraits, captures) sont dans les rapports du scratchpad.

### 5.1 Économie, sauvegarde, missions, voitures (rapport `audit-economie.md`)

- ECO-01 · BLOQUANT · S · `app-ios/preparer-www.js:108` → voir §3.
- ECO-02 · MAJEUR · S · `aura-banque-contrats.js:93` TEST_CAISSES=true → false + garde.
- ECO-03 · MAJEUR · S · `sauvegarde.js:173-185` → `o9.mq=L9(s9.mq,200);`.
- ECO-04 · MAJEUR · F · `SAVE.import` accepte n'importe quel JSON (banque 1e30, étage ouvre les premium) → signer le code d'export (HMAC léger côté client, ou au minimum bornes : banque ≤ 1e9, étage ≤ max, caisses possédées ⊂ caisses non-€).
- ECO-05 · MAJEUR · O · missions `carall/colall/toutall` comptent les caisses en € (impossibles) → exclure `k:'premium'`.
- ECO-06 · MAJEUR · O · mission `km100k` = 250 h de jeu → 10 000 km, ou la retirer (`{retire:1}`).
- ECO-07 · MAJEUR · S · ICEBERG 32 M / DOGE 40 M (×100 au lieu de ×10) → 3,2 M / 4 M.
- ECO-08 · MAJEUR · O · ×2 et seconde chance doublent aussi la prime de série (`RUNX.verse`) → doubler le gain brut seulement.
- ECO-09 · MINEUR · S · `passation/ECONOMIE.md` périmé depuis le ×10 ; trou de progression 80 k → 500 k → réécrire la table des prix et combler (une caisse à 200 k).
- ECO-10 · MAJEUR · F · effacement de la sauvegarde pendant la lecture du miroir natif → le miroir réécrit l'ancienne ; `Preferences.remove` dans `natif.js` + jeton d'effacement.
- ECO-11 / 12 · MINEUR · S · POSTER (index 84) sans `rar` ; règle « LOUP légendaire » morte → compléter / retirer.
- ECO-14 · MINEUR · S · palier 10 affiche 0/9999 → masquer le dernier palier.
- ECO-15 / 16 · MINEUR · S · `equippedCar()` et l'étage comptent les caisses en € → filtrer.
- ECO-17 · MAJEUR · S · `preparer-www` ne lance pas `publie-allege.cjs` → les crochets `dbg` restent dans l'app.
- ECO-18 · DÉCISION · D6 (web sans sauvegarde).
- ECO-19 · MINEUR · S · textes de missions trop longs pour une ligne (liste dans le rapport) → raccourcir.
- ECO-20 · FINITION · S · tableau `pubs` mort → supprimer.
- ECO-22 · MINEUR · S · COMÈTE : témoin `bientot` jamais levé → lever ou retirer.
- ECO-23 · MINEUR · O · ailes à 50 M inatteignables → 5 M.
- ECO-24 · MINEUR · S · `maps` / `maps2` dupliqués dans la sauvegarde → une seule clé, migration dans `san()`.
- ECO-28 à 32 · FINITION · S · en-têtes de section manquants, shapes orphelines, commentaires de prix faux, sacs du final spin pas ×10, code mort « cadeau ».
- DIR-08 · MAJEUR · O (à confirmer) · mission « toutes les météos » validée après 4 parties et +180 000 $ pendant la navigation des menus → journaliser `SAVE.d.bank` et le compteur de météos de `missions/moteur.js` ; le pilote `dbgAuto` explique les secrètes, pas la météo ni les 180 k.

### 5.2 Son (rapport `audit-son.md`)

- SON-01 · MAJEUR · O · 83 Mo d'audio embarqués dans l'app, ~55 Mo jamais joués → `preparer-www` réutilise `publie-audio.cjs` (la liste des fichiers réellement référencés existe).
- SON-02 · MAJEUR · F · ~45 Mo de PCM décodés au chargement → décoder à la demande (menu / course / voix), libérer entre deux courses (lié à DIR-02).
- SON-03 · MAJEUR · F · frénésie via `<audio>` peut devenir muette sur iPhone, `FRENM.sw` reste vrai → Pouce bleu niveau 0 ; → `AudioBufferSourceNode` en boucle, et `FRENM.sw` recalé sur l'état réel du nœud.
- SON-04 · MAJEUR · O · iOS 15-16 sans `navigator.audioSession` → interrupteur silencieux coupe tout ; → cible 17 (D : non, 16.4 suffit) ou `AVAudioSession.playback` côté natif (10 lignes Swift dans `AppDelegate`).
- SON-05 · MINEUR · S · `musRetour` remet la musique toutes les 24 h contre le réglage du joueur (`sauvegarde.js:298-310`) → respecter `mus:false` explicite.
- SON-06 · MAJEUR · F · le lobby fait tourner le moteur complet + convolveurs au menu sans garde ALLEGE → bypass des convolveurs au menu sous ALLEGE.
- SON-07 · MAJEUR · S · `scinde-banque.cjs` absent de `preparer-www` (40 s de démarrage) → l'ajouter.
- SON-08 · MAJEUR · F · 2 à 5 s de silence après la mort → enchaîner un pad de transition.
- SON-09 · MINEUR · S · `FX_ARGENT` : 4 mp3 de soundboard jamais joués (droits) → supprimer.
- SON-10 · MINEUR · S · `VOL.mus` par défaut écrasé → ordre d'initialisation.
- SON-11 · MINEUR · S · WAV de déblocage 8 kHz candidat `FormatError` → ré-encoder en m4a.
- SON-12 / 13 · MINEUR · O · coutures de boucles audibles → points de boucle sur passage à zéro.
- SON-14 · MINEUR · S · `playbackRate < 0.5` → borner.
- SON-15 · MINEUR · O · 3 `AudioContext` au démarrage → un seul.
- SON-16 · MINEUR · S · `touchstart` → `acReveil` manquant sur un écran.
- SON-17 · MINEUR · O · `MUS_WA` banni définitivement après un échec → réessayer à la prochaine session.
- SON-18 · MINEUR · S · son de mort par `HTMLAudio` → banque.
- SON-19 · MINEUR · S · `rendus/index.js` référence des fichiers absents.
- SON-20 · MINEUR · S · 15 Mo de musique inutilisée en ligne → retirer de `assets/`.
- SON-21 · MINEUR · S · reprise après arrière-plan.
- SON-22 · MINEUR · F · lookahead du limiteur.
- SON-23 · MINEUR · O · 0,9 Mo de JSON avant la première note → différer.
- SON-24 / 25 · MINEUR · S · session playback / leçon muette.
- SON-26 · MINEUR · O · double déverrouillage dans `natif.js`.
- SON-27 · MINEUR · S · orphelins `moteur-vivant`.
- SON-30 · MINEUR · O · `sonTonSuit`.
- SON-31 · MINEUR · F · plancher +24 dB.
- SON-32 · MINEUR · S · SW : 206 ne se met pas en cache.
- SON-33 à 40 · FINITION · S · `minecraft.m4a` à renommer, ~250 lignes de v3/v4 mortes, tables LOBBY à la main.

### 5.3 Interface (rapport `audit-interface.md` + `audit-direct.md`)

- INT-01 · BLOQUANT · O → §3 (ACHAT).
- INT-02 · MAJEUR · O · `#overlay role="button"` cache tout le menu à VoiceOver (`ecrans-menus.html:26`) → retirer le rôle, `aria-hidden` seulement sur le voile.
- INT-03 · MINEUR · S · porte MISSIONS 30 px (`garage-hub-bas.css:78`) → 44.
- INT-04 / DIR-25 · MINEUR · S · « SEE ALL ITEMS », « NEW », « 1.61 PRESENTS » en anglais dans l'interface FR (`garage-lacher.js:225`, `boutique-du-jour.js:87`, `mobile-tactile.js:771`, intro) → `TR()`.
- INT-05 · MAJEUR · O · toucher une mission réussie l'efface sans confirmation ; une en cours joue le son de refus (`ecran-revelation.js:128-130`).
- INT-06 · MAJEUR · O · l'intro BOULE n'écrit jamais « TOUCHE » (`intro-161.js:853`) ; DIR-45 : le toucher sur la boule n'a lancé le film qu'une fois sur quatre au doigt émulé (`bGlisse`) → seuil de glissement plus large, « TOUCHE » affiché après 2 s.
- INT-07 · MINEUR · S · toucher la ligne VERSION ouvre la boîte noire (`debut-corps.html:111`) → 5 touchers.
- INT-08 · MAJEUR · O · `#modale` sous le clavier (pas de `visualViewport`) → écouter `visualViewport.resize`.
- INT-09 / 10 / 11 / DIR-05 / DIR-24 · MINEUR · S · clés I18N manquantes : CAPTEUR REFUSÉ, RACCOURCI, CHAMPION !, DERNIER !, EXPLOSION DANS, COUPERET DANS, ACCROCHE !, ELLE T'A SEMÉ, LA CAISSE-NUAGE, DONUT, BOOST, sous-titres des cartes fruits, PREMIER MATIN, THE DARK TRIAD, RARES (boutique EN), EARLY DEAD → CHAIN LOST ; 13 `aria-label` → compléter `traductions.js`.
- DIR-04 · MAJEUR · O · « INVENTAIRE » reste en français au retour du garage depuis la mort (EN) → passer par `TR()` dans le remplissage de `#gvCof`.
- INT-12 / 13 · MINEUR · S · glyphes hors police pixel (›, ★), `font-weight:900` → glyphes du jeu de `pxi`.
- INT-14 · MINEUR · S · `spCharge` décalé en couché.
- INT-15 · MINEUR · S · `m2Clic` sans `uiGarde` → double tap.
- INT-16 · MAJEUR · O · l'inventaire se ferme par X et pas par RETOUR → unifier.
- INT-17 / 18 · MINEUR · S · écran MODES mort, DOM de dev livré (#stall, #settings…) → supprimer.
- INT-19 / DIR-42 · MINEUR · S · contraste `--tx3`, polices 4-6 px, pouvoir en cours gris sur fond clair → 7 px minimum, fond plein.
- INT-20 · MAJEUR · O · ACHAT / BOUTIQUE : deux mots pour deux choses proches → ACHAT disparaît (D3).
- INT-21 · MAJEUR · O · clés I18N redéfinies dans 40 fichiers (614 `Object.assign`) → détecter les doublons contradictoires (script), garder la dernière, documenter.
- INT-22 / 23 / 24 · MINEUR · S · ternaires codés en dur, `$` après le nombre, « +$500 » auto-école.
- INT-25 · MINEUR · S · ligne IMAGE de la pause en couché.
- INT-26 · MAJEUR · O · trois définitions de « couché » → une seule fonction.
- INT-27 / 28 / 29 · MAJEUR · O · 1 355 `!important`, 460 sélecteurs sur des drapeaux jamais posés (`:not(.c6)`, `.poki`…), `:has()` dans `boutons-flottants` → nettoyage par `@layer` sur les fichiers CSS NON touchés par Sonnet.
- INT-30 · MINEUR · S · `text-overflow: clip`.
- INT-32 / 33 · MINEUR · S · anciennes cartes de mort encore rendues, logique SUIVIES morte.
- INT-34 / 35 / DIR-47 · MAJEUR · O · accents absents (police pixel, `PIX_ACC`), 4 polices pixel de trop → une fonte avec accents ou sprites É/È/À.
- INT-36 · MINEUR · S · `prompt()` natif → modale du jeu.
- INT-37 · MINEUR · S · halo nitro clignote.
- INT-38 · MAJEUR · O · repli de refus d'`incl`.
- INT-40 · MAJEUR · O · réglages POUCE HAUT / VOL INVERSÉ en double.
- INT-41 / 43 / 45 · MINEUR · S · `mCashL`, table des `z-index`, `?lecon=non` écrit la sauvegarde.
- INT-46 à 52 · FINITION · S.
- DIR-13 à 23, 35, 37 à 41, 44, 48 · MINEUR/FINITION · S · chevauchements sous RETOUR (réglages, achat, musique en couché), onglets 34 px, « TEMPS EN COUR… », JOUER qui déborde en couché, « 1 099 » coupé en deux, orphelin « ICI », ailes sans photo, 6 cases « ? ? ? » peintures, compteur « $ 0 » nu, hauteurs de boutons disparates, triple RECORD → liste exacte avec captures dans `audit-direct.md`.
- DIR-26 / 36 · MINEUR · O · pastille « 19 » sans explication sur GARAGE ; `#gCard` « 1 / 51 » qui ne réagit pas → pictogramme ; toucher = boutique sur la caisse.
- DIR-28 / 46 · MINEUR · O · D8 (flammes, plaque au 1er lancement).
- DIR-30 · MINEUR · O · deux onglets écrivent `cashcarSave` sans verrou → jeton `sessionStorage` + `storage`.
- DIR-33 / 34 · MINEUR · S · « TEMPS DE JEU » tourne dans les menus ; « VERSION LOCALE ⚠ » visible, « VERSION LOCAL » en EN.
- DIR-43 · FINITION · O · `?colonne=0` sur ordi garde les tailles téléphone.

### 5.4 Rendu, maps, performance (rapport `audit-rendu.md` + direct)

- RND-01 · BLOQUANT · F → §3 (Arrakis fil principal).
- RND-02 · MAJEUR · F · 6 maps non préconstruites (nuages, orage, crypto, vitrée, orbite, ville) → 0,5 à 1 s de gel au portail (DIR-32 : 100-400 ms ×3-5 par course mesurés, 1,3 s une fois) → les inscrire dans le prebuild.
- RND-03 · MAJEUR · S · `memToiles=[1,1,0]` par PAL et non ALLEGE (52 Mo de toiles sur iPhone 12-15) → condition ALLEGE.
- RND-04 / DIR-06 · MAJEUR · F · premier lancement à froid 3-11 s (banque 7,3 Mo base64 `defer`, index 4,5 Mo gzip) → banque en binaire (ArrayBuffer) par paquets à la demande ; `figures.js` et le post-traitement différés.
- RND-05 · MAJEUR · O · `qlSonde` : `readPixels` synchrone sur iPhone → asynchrone ou désactivé sous ALLEGE.
- RND-06 · MAJEUR · O · post-traitement complet au palier 2 téléphone (`postBloomMips`, FXAA) → `PAL.b()`.
- RND-07 · MAJEUR · O · la route = premier coût (`PISTE_MOY`, plafond 9 000 pts pour 10,6 km de dunes) → LOD de route par distance.
- RND-08 · MAJEUR · F · prebuild grotte/jade 16 ms par image → Worker.
- RND-09 · MAJEUR · O · budget triangles du sable non mesuré après Arrakis → `dbgAudit` sur dunes.
- RND-10 · MINEUR · S · cartes postales `dunes-*.webp` périmées → régénérer.
- RND-11 · MAJEUR · O · map sans sable si le worker est en retard → attendre ou repli.
- RND-12 · MAJEUR · O · Jade gardée en mémoire 30-60 Mo → libérer après deux maps.
- RND-13 · MINEUR · S · double `dnGeos2` (`dunes-2.js` / `dunes-embellie.js`) ; dunes-dieux/gizeh **déjà supprimés par la session Arrakis** → vérifier le double après fusion.
- RND-14 à 18, 20, 23, 24, 26 à 29, 32, 33, 35, 36, 38, 40 à 42 · MINEUR · S · `near .1→.3`, resize barre Safari, `renderer.compile` scène entière, boucle pickups, remplissage aurores, hystérésis LOD, `dbgAudit` en garde, `fwidth` WebGL1, coût vitrine menu, `PISTE_MOY/MOB` sur `TEL_NATIF` au lieu d'ALLEGE, bench CPU, repli blob worker muet, antialias, `shadow.needsUpdate`, placement scènes Arrakis, brouillard `PHARE_FX`, décision `DPR_CAP` (D5), 4 scripts bloquants → `defer`, deux caches dans `sw.js`.
- RND-17 / 19 / 21 / 22 / 37 · MAJEUR · F/O · 5 000 enfants de scène, uber-shader bitume à branches, ombres ±34 m, popping LOD jade, ombre de contact en vol.
- DIR-01 · MAJEUR · O/F → §3 (gel soleil 1.61).
- DIR-02 · MAJEUR · F → §3 (fuite de tas).
- DIR-03 · MAJEUR · O · D5.
- DIR-07 · MAJEUR · O · la page-cadre (ordi, `/jouer/`) exécute `index.html` deux fois (38,6 Mo, deux tâches longues) → `return` avant les scripts du corps quand on est le cadre, ou page-cadre séparée de 5 Ko.
- DIR-10 · MINEUR · F · 1re course à 55,7 fps p95 33 ms puis 59 → préchauffer au garage (`dbgProgsListe`).
- DIR-31 · MINEUR · S · 23 avertissements `MeshLambertMaterial: 'flatShading'` → retirer la propriété.

### 5.5 Gameplay (rapport `audit-gameplay.md`)

- GP-01 · MAJEUR · F · la boucle avale ses exceptions (`boucle-6-hud.js:125`) : exception déterministe = caisse figée sans mort → compteur d'erreurs consécutives, 3 de suite = explosion + `endGame` + `__ccNote`.
- GP-02 · MAJEUR · F · `dt` plafonné à .05 : sous 20 fps, ralenti qui dilate jauges et chronos → sous-pas ou `rawMs` pour les jauges/chronos.
- GP-03 · MAJEUR · O · figures de route remboursent la nitro sans condition (`figures-route.js:59-67`) → seulement si `P.payees.length>0`.
- GP-04 · MAJEUR · O · `safeS` périmé sur route TORD/orbite → `safeS` temporel, reprise à `s_mort−40`.
- GP-05 · MAJEUR · O · filet NaN ne couvre pas `fallPos/fallVel`.
- GP-06 / 07 / 10 / 29 · MINEUR · S · `resetGame` ne remet pas shake, fovPunch, `CAMV.zoom`, squashT, susY/susV, SCOUP, `VEQ.sp`, rollV, fruitRaf, FX2, PCV.
- GP-08 · MINEUR · S · ROULE OU CRÈVE invisible sur téléphone.
- GP-09 · MINEUR · S · portail pendant la pose (`newTrack0` hopY/POSE_F).
- GP-11 · MINEUR · S · clignotement du bouclier invisible en pause.
- GP-12 / 25 · MINEUR · S · `prebTick` dans `CAD.w`, `FPS.a` au `visibilitychange`.
- GP-13 · MINEUR · S · respawn gratuit par R sur ordi → retirer hors `?dev`.
- GP-14 · MINEUR · S · lissages dépendants du dt → `lisse60`.
- GP-15 / 16 / 18 / 19 / 20 / 22 / 24 / 27 / 28 / 31 / 32 / 36 · MINEUR · S · `vitMult` mort, `EVT_ON`, `s` négatif, `murCote` sous bouclier, `touchcancel` du pad, AIR MAX, départ d'avance vs seconde chance, `DN.gx`, double pénalité `chanceRepart`, boom en arrière-plan, deux comptes 3-2-1, `nitroBlue`.
- GP-17 / 21 / 30 / 35 · MAJEUR · O · escalier de tranche, `stAdopte` paume, viseur 14 pas, vrille en lacet libre.
- GP-38 · MINEUR · F · assertion `prebEchange`.
- GP-40 · MINEUR · S · `loopWarn` → `__ccNote`.
- DIR-09 · MAJEUR · O · mort en 6 s sans entrée → D7.

### 5.6 App iOS et App Store (rapport `audit-ios.md`)

- IOS-01 à 06, 08, 10, 13 → §3.
- IOS-07 · MAJEUR · O · `creatures/atelier.js` (Worker) non copié : `GARDE` sans `creatures` → les singes de Jade échouent dans l'app.
- IOS-09 · MAJEUR · F · mises à jour non signées (2FA GitHub, protection de branche `app-maj`, `publicKey` Capgo).
- IOS-11 · MAJEUR · O · `www/` 100 Mo avec audio mort et commentaires → `preparer-www` réutilise les retraits de `vercel-build.sh` (`publie-audio`, `publie-allege`, `scinde-banque`).
- IOS-12 · MAJEUR · F · mémoire jamais mesurée sur iPhone ≤ 4 Go → le jour Mac : Instruments ou `performance.memory` via `?perf=1`.
- IOS-14 · MINEUR · O · hook pre-push absent sur PC → `git config core.hooksPath` ou copie.
- IOS-15 · MINEUR · S · `.gitignore` += `.claude/`, `.playwright-mcp/`.
- IOS-16 · MAJEUR · F · storyboard + `SceneDelegate` créent tous deux `JeuViewController` → un seul.
- IOS-17 · SACHA · D9.
- IOS-19 / 20 / 21 · MAJEUR · O · `natifMin`, `launchAutoHide`, indicateur d'accueil.
- IOS-22 / 23 · MINEUR · S · chaînes App Store/StoreKit mortes.
- IOS-24 / 25 · FINITION · fiche et captures (le jour Mac).
- IOS-26 · MAJEUR · O · règle CITE.
- IOS-27 · MINEUR · S · en-têtes Vercel.
- IOS-28 · MAJEUR · F · mise à jour Capgo appliquée en pleine course → appliquer au prochain retour au menu.
- IOS-32 · MAJEUR · O · `preparer-www --essai` dans `vercel-build.sh`.
- IOS-33 à 45 · FINITION · doc des branches, `PRODUCT_NAME`, couleur `LaunchScreen`, contrôles `archiver`, README/LICENSE, `minecraft.m4a`.

### 5.7 Hygiène du code (rapport `audit-hygiene.md`)

- HYG-03 · MAJEUR · F · 92 % des 1 690 `try/catch` muets ; les 20 dangereux (flush et load de `sauvegarde.js:228/198`, `chaineEncaisse` `seconde-chance.js:475`, `boutique.js:36/15/503/464`, `achat-carte-moteur.js:181`, `depart-avance.js:465`, `musique.js:214/329/541/45`…) → `garde(zone,fn)` qui journalise dans `__ccNote`, visible dans la boîte noire.
- HYG-05 · MAJEUR · F · = GP-01.
- HYG-06 · F · monolithe → modules APRÈS la sortie, pas cette semaine.
- HYG-07 · MAJEUR · O · = INT-27.
- HYG-08 · MINEUR · S · 18 `setInterval` jamais arrêtés (~12 sondages permanents 140-250 ms) → `clearInterval` ou événements.
- HYG-09 · MINEUR · S · 30 variantes `?x=ancien` → supprimer le code mort des variantes NON mentionnées dans CLAUDE.md (garder `?intro=ancien`, `?marbre=0`).
- HYG-10 · MINEUR · O · paramètres d'avantage actifs sur le web (`?pub=0`, `?chance=0`, `?spin=0`, `?cadeau=1`, `?carte=`, `?niveau=`, `?lecon=non`, `?eco=ancien`, `?simu=1`, `?garde=1`) → un seul drapeau `DEV` (hôte local ou `?dev=MOT`) qui les conditionne tous.
- HYG-11 · MINEUR · S · 27 crochets `dbg` survivent à la publication → `publie-allege` les retire (vérifier la liste), et `preparer-www` le lance (ECO-17).
- HYG-12 · MINEUR · S · ~80 Ko de fonctions/fichiers morts (liste dans le rapport).
- HYG-13 · MAJEUR · O · 600 Ko de littéraux de géométrie → JSON chargé à la demande (après la sortie si le temps manque).
- HYG-14 · MINEUR · S · duplication caid/simpson/combi.
- HYG-15 · MAJEUR · O · échec silencieux du `flush` → un mot à l'écran (« sauvegarde impossible »).
- HYG-17 / 18 · MINEUR · S · `new Function`, origine des `message`.
- HYG-19 · MINEUR · S · chaînes TDZ sous try.
- HYG-20 · MAJEUR · O · `uiTimer`.
- HYG-21 · MINEUR · S · 348 `//` après du code (convention) → `/* */`.
- HYG-22 · MAJEUR · O · API `window.CASHCAR`.
- HYG-23 · MINEUR · S · clés `localStorage` annexes non mises en miroir natif.
- HYG-24 à 40 · FINITION · S.

---

## 6. ORGANISATION DE LA SEMAINE : trois agents, trois branches, zones disjointes

### 6.1 Règles communes (reprises dans chaque prompt)

1. **Une branche par agent**, créée depuis `origin/main` à jour : `jury/sonnet`, `jury/opus`, `jury/fable`. Chaque agent travaille dans **son propre worktree** (`git worktree add ../CASH-CAR-jury-xxx jury/xxx`) : le dossier principal est occupé par la session Arrakis.
2. **Jamais de push sur `main`**. L'agent pousse sa branche, écrit son RAPPORT, et c'est Sacha qui fusionne, dans l'ordre **Sonnet → Opus → Fable**.
3. **`sw.js` : ne pas y toucher.** Le numéro `cashcar-vNNN` est monté une seule fois par Sacha à chaque fusion (sinon trois conflits garantis). Si le hook pre-push le réclame, le monter dans le dernier commit de la branche seulement.
4. **Après toute modification dans `code/` : `node code/assembler.cjs`**, puis `node code/assembler.cjs --verifier`, et committer `code/` ET `VERSION PRINCIPALE/index.html` ensemble. **On n'édite jamais `index.html` à la main.**
5. **Hors de sa zone de fichiers, on ne touche pas** : on note le besoin dans le RAPPORT (« il faudrait aussi… dans tel fichier ») et on continue. Exception : `code/interface/traductions.js` est à Sonnet seul ; les autres y ajoutent leurs clés via un `Object.assign(I18N,{…})` dans LEUR fichier (c'est la convention du projet).
6. Conventions CLAUDE.md : noms et commentaires en français ; une section s'ouvre par `/* ===== TITRE (2026-11-0X, Fable/Opus/Sonnet : « la demande ») ===== */` ; jamais de `//` au milieu d'une ligne ; un morceau est une tranche brute d'`index.html`, pas de nouvel en-tête ; jamais insérer ou retirer une ligne au milieu de `CARS` / `CAR_UNLOCK` (la sauvegarde pointe par index) ; tout retrait d'image/qualité se garde sur `ALLEGE`, `TEL_NATIF` ou `PAL.b()`, **jamais sur `IS_MOBILE`** (`garde-allege.sh` refuse sinon).
7. **Vérification avant de dire « fait »** : `node code/assembler.cjs --verifier` passe, `bash garde-allege.sh` passe, `node outils/garde-demarrage.cjs` passe, le jeu se charge sans erreur console en local (`npx serve "VERSION PRINCIPALE"` ou le serveur du banc, puis `?garde=1&tel=1` dans un Chrome 390×844), une course complète se joue, et pour l'app : `node app-ios/preparer-www.js --essai` passe.
8. **Rapport final** : `passation/RAPPORT-JURY-<agent>.md` : par ID, FAIT / PAS FAIT (pourquoi) / À VÉRIFIER SUR IPHONE, avec les fichiers touchés, et la liste des « hors zone » laissés aux autres.
9. **Sous-agents** : autorisés pour lire, chercher, vérifier et pour les tâches mécaniques indépendantes (un fichier chacun, jamais deux sous-agents sur le même fichier). Le modèle de l'agent principal garde la conception et l'intégration.
10. Ne rien envoyer à Apple, ne jamais saisir de mot de passe, ne pas lancer `archiver.sh` ni `publier-maj.js` (Mac + Sacha).

### 6.2 Zones de fichiers

| Agent | Zone exclusive | Fichiers partagés (ordre de fusion règle les conflits) |
|---|---|---|
| **Sonnet** | `code/interface/traductions.js` ; tout `code/css/` SAUF `mort-flottante.css` ; `pages-app/` ; `passation/ECONOMIE.md` ; `app-ios/fiche/` ; `.gitignore` ; `code/voitures/cars.js` et `deblocage.js` (champs `rar`, prix, desc seulement, jamais l'index) ; `code/economie/aura-banque-contrats.js` (TEST_CAISSES) ; `outils/garde-demarrage.cjs` ; `VERSION PRINCIPALE/assets/audio/` (suppressions SON-09/20, renommage `minecraft.m4a`) ; `code/son/rendus/index.js` | `code/sauvegarde.js` (ligne `o9.mq` uniquement, jour 0) ; `code/missions/table.js` (textes ECO-19 seulement) |
| **Opus** | `app-ios/preparer-www.js`, `app-ios/natif/natif.js` (sauf IOS-06/28 à Fable), `app-ios/ios/` (cible 16.4, AudioSession, IOS-19/20/21) ; `vercel-build.sh` (ajout `--essai`) ; `code/gameplay/seconde-chance.js`, `code/css/mort-flottante.css` ; `code/interface/` SAUF `traductions.js` et `intro-161.js` ; `code/economie/` SAUF `aura-banque-contrats.js` ; `code/missions/moteur.js`, `ecran-revelation.js` ; `code/gameplay/figures-route.js`, respawn (GP-04/05), départ (DIR-09) ; `code/rendu/qualite*.js`, `palier-appareil.js`, `rendu/post*.js` (RND-05/06, D5 DPR) ; `code/maps/biomes.js` (RND-12 Jade) ; `code/moteur/intro-161.js` (INT-06, DIR-45) | `code/page/debut-corps.html` (DIR-07 cadre) ; `code/moteur/mobile-tactile.js` (INT-04 ligne 771 seulement, Sonnet la lui laisse) |
| **Fable** | `code/moteur/boucle-*.js`, `cadence*.js` ; `code/rendu/soleil-planete.js` ; `code/maps/dunes-*.js` (**après accord de la session Arrakis**), `prebuild*`/`preb*` ; `code/son/` (moteur audio : banque, décodage, frénésie, lobby, limiteur) ; `code/sauvegarde.js` (ECO-04, ECO-10, SON-05, HYG-15) ; `app-ios/natif/natif.js` lignes `notifyAppReady`/`ccMajRefus`/application de la mise à jour (IOS-06, IOS-28, IOS-09) ; `.gitattributes` ; `code/moteur/garde.js` (nouveau : `garde(zone,fn)` + `__ccNote`) ; `VERSION PRINCIPALE/sons-banque.js`, `scinde-banque.cjs`, `sw.js` (RND-42, et le numéro final) | `app-ios/natif/natif.js` (avec Opus : zones de lignes distinctes, Fable fusionne en dernier) |

Fichiers que **personne** ne touche cette semaine : `code/maps/dunes-arrakis.js`, `dunes-1..4.js`, `dunes-embellie.js`, `dunes-ruines.js`, `biomes.js` tant que la session Arrakis n'a pas committé et dit « fini » (Fable attend ce feu vert pour RND-01).

### 6.3 Le calendrier (J0 = jour des décisions, J6 = Mac)

| Jour | Sacha | Sonnet | Opus | Fable |
|---|---|---|---|---|
| **J0** | Tranche D1–D9 ; dit à la session Arrakis de committer ; crée les 3 worktrees | Jour 0 sur `main` directement (3 lignes : ECO-01, ECO-02, ECO-03) → Sacha pousse ; puis branche | Lit, branche, commence par les coupes App Store (IOS-04, INT-01/D3) | Lit, branche, instrumente (tas, `renderer.info`, chrono `draw()`), reproduit DIR-01/02 |
| **J1** | Vérifie que `npm run sync` passe (ECO-01) | I18N, textes, CSS des chevauchements | IOS-10 16.4, SON-04 natif, IOS-07, IOS-11 + IOS-32, ECO-05/06/08, D5/D6/D7 | DIR-01 (sprites PNG), GP-01 watchdog, GP-02 dt |
| **J2** | — | Code mort (HYG-09/11/12, INT-17/18, SON-09/20/33-40), `setInterval` | INT-02/05/08/16/26/40, DIR-04/26/36, DIR-08 enquête, HYG-10 drapeau DEV | DIR-02 fuite (dispose + SON-02 décodage à la demande), SON-03 frénésie |
| **J3** | **Fusion Sonnet** (sw +1), vérifie en local | Rapport ; puis relecture des deux autres branches (sous-agent Explore) | RND-05/06/12, DIR-07, INT-27 `@layer` sur ses fichiers | RND-01 Arrakis worker + RND-02 prebuild 6 maps, SON-06/08 |
| **J4** | **Fusion Opus** (sw +1), `npm run sync`, `--essai` | — | Rapport | IOS-06/08/09/28, ECO-04/10, HYG-03 `garde()` sur les 20 catch dangereux |
| **J5** | **Fusion Fable** (sw +1), test complet web `?tel=1`, publie Vercel (OUI) | — | — | Rapport ; mesure finale (chargement, tas, fps) avant/après |
| **J6 (Mac)** | `npm run sync`, Xcode, iPhone réel : chargement à froid ×5, 5 courses d'affilée (tas), frénésie, interrupteur silencieux, mise à jour Capgo tuée en cours ; captures ; fiche ; `archiver.sh` ; soumission (OUI) | — | — | Disponible pour les retours iPhone |

Si un jour glisse, on sacrifie dans cet ordre : INT-27 `@layer` → HYG-13 → RND-17/19/21 → SON-12/13 → DIR-43/44. **On ne sacrifie jamais** B1 à B5, DIR-01, DIR-02, IOS-06, SON-03, GP-01.

---

## 7. LES TROIS PROMPTS

Chaque prompt est autonome : le copier tel quel dans une conversation neuve, dans le dépôt `CAR CASH`. Les trois disent à l'agent de créer sa branche et son worktree.

### 7.1 PROMPT FABLE 5 (profond : moteur, mémoire, audio, livraison)

```
Tu es Fable 5.1, architecte final de CASH CAR, un runner arcade 3D three.js pour téléphone (dossier `VERSION PRINCIPALE/`, app iOS Capacitor dans `app-ios/`). Nous sommes dans la dernière semaine avant la soumission à l'App Store. Un jury vient d'auditer tout le jeu : son dossier est `passation/AUDIT-FINAL-2026-11-05.md` (lis-le en entier d'abord, puis `CLAUDE.md`, puis `passation/APP-STORE.md`). Les rapports détaillés avec extraits de code sont dans le scratchpad indiqué en tête du dossier ; si ce dossier n'existe plus, le dossier §5 suffit.

TA MISSION : les points de niveau F, ceux que seul un modèle profond peut résoudre sans casser le moteur. Dans cet ordre de priorité (on s'arrête proprement là où la semaine s'arrête, chaque étape committée et vérifiée séparément) :

1. DIR-01 — Gel de 20 à 65 s au démarrage. Le profil montre 25 s de temps propre dans `draw()` de `code/rendu/soleil-planete.js` (l.7-45) : `strokeText` 84 px Press Start 2P épaisseur 30, `destination-out`, puis `drawImage` + envoi en texture = lecture synchrone d'un canvas 2D accéléré pendant que le GPU compile des shaders. Reproduis-le (deux onglets du jeu suffisent, ou une charge GPU parallèle), mesure avec `performance.now()`, puis supprime la cause : sprites « 1.61 » pré-rendus en PNG dans `assets/` (générés par un petit script Node + canvas, ou capturés une fois), chargés comme textures, ou dessin différé après le premier `requestAnimationFrame` du menu et hors de toute tâche longue. Garde un `?soleil=ancien` une semaine.
2. GP-01 + HYG-05 — La boucle `loop()` (6 tranches `code/moteur/boucle-*.js`) avale ses exceptions dans un seul try (`boucle-6-hud.js:125`) : une exception déterministe = caisse figée, pas de mort, pas de trace. Mets un try par tranche, un compteur d'erreurs consécutives ; 3 de suite dans la même tranche = explosion + `endGame` propre + note dans `__ccNote` (la boîte noire du jeu). `loopWarn` (GP-40) y passe aussi.
3. GP-02 — `dt` plafonné à .05 : sous 20 fps le jeu passe au ralenti et dilate jauges, chronos, nitro, frénésie. Sépare le temps physique (sous-pas de 1/60 bornés à 4) du temps des jauges/chronos (`rawMs`). Vérifie avec `?fps=15` (ajoute le crochet s'il n'existe pas) que 10 s de frénésie durent 10 s.
4. DIR-02 + SON-02 — +50 à 70 Mo de tas JS par partie (228 → 420 Mo en 3 courses), jamais rendus : sur un iPhone à 4 Go c'est le « contexte 3D perdu » de la 4e partie. Instrumente (`renderer.info.memory`, `performance.memory`, instantané de tas entre deux courses via `dbgTas()`), trouve les responsables (maps reconstruites sans `dispose()`, traînées, particules, et les ~45 Mo de PCM audio décodés au chargement + 30-40 en course), corrige : `dispose()` systématique au `resetGame`, audio décodé à la demande par paquets (menu / course / voix) et libéré entre deux courses. Objectif mesurable : tas stable à ±15 Mo sur 5 courses.
5. SON-03 — La frénésie passe par un `<audio>` qui peut devenir muet sur iPhone sans que `FRENM.sw` ne redescende (Pouce bleu niveau 0 ensuite). Passe-la en `AudioBufferSourceNode` bouclé sur le graphe existant, et recale `FRENM.sw` sur l'état réel du nœud.
6. RND-01 + RND-02 — Dunes Arrakis (`DN_VASTE=2`, `code/maps/dunes-1.js:479-480`) construites sur le fil principal quand `!started` : 5 à 9 s estimés sur iPhone. ATTENTION : une autre session travaille sur `dunes-*.js` ; n'y touche qu'après que Sacha t'a dit que cette session a committé. Mets la construction toujours dans le worker, `dunes` dans `PREB_CPU_DEF`, et inscris au prebuild les 6 maps qui n'y sont pas (nuages, orage, crypto, vitrée, orbite, ville) pour supprimer les gels de 100-400 ms aux portails. RND-08 (grotte/jade 16 ms par image) va dans le même Worker si le temps le permet.
7. IOS-06 + IOS-28 + IOS-08 — Dans `app-ios/natif/natif.js` : `notifyAppReady` est appelé à la fin du script de 9,6 Mo ; une app tuée pendant le chargement bannit la version à vie dans `ccMajRefus`. Appelle-le à `DOMContentLoaded`, ne bannis qu'après 2 échecs, timeout 120 s. Une mise à jour ne s'applique jamais en pleine course (au prochain retour au menu). Ajoute `.gitattributes` (`* text=auto eol=lf`, binaires en `-text`) et renormalise : `core.autocrlf=true` sur le PC donne des hachages différents PC/Mac pour les mises à jour Capgo. Documente dans `app-ios/LISEZ-MOI.md`. IOS-09 (signature des mises à jour : `publicKey` Capgo + protection de la branche `app-maj`) : écris la procédure, Sacha l'applique.
8. ECO-04 + ECO-10 + SON-05 + HYG-15 dans `code/sauvegarde.js` : `SAVE.import` accepte n'importe quel JSON → signe le code d'export (HMAC court côté client) et borne tout à l'import (banque, étage, caisses possédées jamais en €) ; l'effacement pendant la lecture du miroir natif se fait écraser → jeton d'effacement + `Preferences.remove` ; `musRetour` ne remet plus la musique toutes les 24 h contre un `mus:false` explicite ; un `flush` qui échoue affiche un mot à l'écran.
9. HYG-03 — Crée `code/moteur/garde.js` : `garde(zone, fn)` qui exécute, attrape, journalise dans `__ccNote` (zone, message, compteur) et ne relance pas la même erreur plus d'une fois par minute. Remplace les 20 catch dangereux listés dans le rapport hygiène (flush/load de `sauvegarde.js`, `chaineEncaisse`, boutique, carte moteur, départ d'avance, musique). Pas les 1 670 autres.
10. Si tu as encore du temps : SON-06 (lobby : convolveurs contournés au menu sous ALLEGE), SON-08 (silence de 2 à 5 s après la mort), DIR-10 (préchauffe de la première course), RND-19/21 (uber-shader, ombres), SON-22/31, RND-42 (deux caches dans sw.js).

RÈGLES DU DÉPÔT (non négociables) :
- Crée ta branche `jury/fable` depuis `origin/main` à jour, dans ton propre worktree (`git worktree add ../CASH-CAR-jury-fable jury/fable`) : le dossier principal est occupé par une autre session.
- Le jeu est fabriqué depuis `code/` (251 morceaux, carte dans `code/ORDRE.txt`) : on n'édite JAMAIS `VERSION PRINCIPALE/index.html`. Après toute modif : `node code/assembler.cjs`, puis `node code/assembler.cjs --verifier`, et on committe `code/` ET `index.html` ensemble. Un morceau est une tranche brute (une fonction peut commencer dans le précédent) : aucun en-tête. Tout le JS est une seule IIFE : rien n'est global, les noms se voient d'un morceau à l'autre.
- Français partout (noms, commentaires). Une section s'ouvre par `/* ===== TITRE (2026-11-0X, Fable : « la demande ») ===== */`. Jamais de `//` au milieu d'une ligne.
- « DEUX VERSIONS, UN CODE » : tout ce qui retire de l'image ou de la qualité se garde sur `ALLEGE` (vrai téléphone ou `?tel=1`), `TEL_NATIF` ou `PAL.b(...)`, JAMAIS sur `IS_MOBILE`. `bash garde-allege.sh` refuse sinon.
- Ne touche PAS à `sw.js` sauf dans ton dernier commit si le hook pre-push l'exige (+1 sur `cashcar-vNNN`). Sacha monte le numéro à la fusion.
- Ta zone : `code/moteur/boucle-*.js`, `cadence*`, `code/rendu/soleil-planete.js`, `code/maps/dunes-*.js` (après feu vert) et le prebuild, `code/son/` (moteur audio), `code/sauvegarde.js`, `app-ios/natif/natif.js` (lignes notify/ban/mise à jour seulement : Opus touche le reste du fichier, tu fusionnes en dernier), `.gitattributes`, `code/moteur/garde.js` (nouveau), `VERSION PRINCIPALE/sons-banque.js`, `scinde-banque.cjs`. Hors zone : tu notes dans ton rapport, tu ne touches pas. Pour une traduction, `Object.assign(I18N,{…})` dans ton fichier.
- Jamais de push sur `main`, jamais d'envoi à Apple, jamais de mot de passe, pas d'`archiver.sh` ni de `publier-maj.js`.
- Crochets de test : `window.dbgXxx` ; variantes : `?x=`. Chaque correction garde l'ancien chemin une semaine derrière un `?x=ancien` quand c'est un comportement visible.

INTENSITÉ : tu conçois et intègres toi-même. Délègue à des sous-agents Sonnet (lecture seule ou un fichier chacun) : la cartographie des `dispose()` manquants, la liste des `new AudioBuffer`/`decodeAudioData`, la vérification croisée de chaque étape (charger `?garde=1&tel=1` dans un Chrome 390×844, jouer une course, lire la console), et la mesure avant/après. Jamais deux sous-agents sur le même fichier. Avant chaque étape, écris en trois lignes ce que tu vas faire et comment tu le mesureras ; après, les chiffres.

VÉRIFICATION avant de dire « fait » : `--verifier` passe, `garde-allege.sh` passe, `node outils/garde-demarrage.cjs` passe, 0 erreur console sur accueil → garage → course → mort → garage, mesure avant/après pour DIR-01, DIR-02, GP-02. Rapport final dans `passation/RAPPORT-JURY-FABLE.md` : par ID, FAIT / PAS FAIT (pourquoi) / À VÉRIFIER SUR IPHONE (ce que Sacha doit regarder le jour Mac, en une ligne chacun), fichiers touchés, points hors zone laissés aux autres. Pousse `jury/fable` et arrête-toi : Sacha fusionne.
```

### 7.2 PROMPT OPUS 5 (borné : conformité App Store, ALLEGE, économie, états d'interface)

```
Tu es Opus 5, chef de projet technique de CASH CAR, un runner arcade 3D three.js pour téléphone (dossier `VERSION PRINCIPALE/`, app iOS Capacitor dans `app-ios/`), dans la dernière semaine avant la soumission à l'App Store. Un jury a audité tout le jeu : lis `passation/AUDIT-FINAL-2026-11-05.md` en entier, puis `CLAUDE.md`, `passation/APP-STORE.md` et `app-ios/LISEZ-MOI.md`. Sacha a tranché les décisions D1 à D9 du §4 : il te les donne dans son premier message (si une manque, applique la recommandation du jury et note-le).

TA MISSION : les points de niveau O, bornés à un fichier ou une fonction, mais qui demandent du jugement. Dans cet ordre :

A. CONFORMITÉ APP STORE (jour 1, c'est ce qui fait refuser l'app)
1. IOS-04 + DIR-29 — Dans l'app (`TEL_NATIF`), plus aucun mot « PUB », « AD », « CONTINUER ▶ PUB » : `code/gameplay/seconde-chance.js` (l.11-12, 40-51) et `code/css/mort-flottante.css` (l.118-138). Selon D1 : `sans:true` et pas de ×2 dans l'app, ou « PROMO ». Le web garde son comportement.
2. INT-01 + INT-20 + ECO-15/16 — Selon D3 : masquer l'écran ACHAT (`#mShop`), la tuile ACHAT (`garage-menu-inventaire.js:47`), le rayon `achat` de `BQ_CATS`, la pastille « NEW » dessus, et faire que `equippedCar()` / l'étage / les missions `carall/colall/toutall` (ECO-05) ignorent les caisses `k:'premium'`. `shopPaye` reste, inerte.
3. IOS-10 — Cible de déploiement iOS 16.4 (`app-ios/ios/App/App.xcodeproj`, `capacitor.config.*`, `Podfile` si présent) : le CSS emploie 166 `color-mix()` et 47 `:has()`. Documente dans `LISEZ-MOI.md`.
4. SON-04 — iOS 15-16 sans `navigator.audioSession` : l'interrupteur silencieux coupe tout. Ajoute `AVAudioSession.sharedInstance().setCategory(.playback)` dans `AppDelegate.swift` (`application(_:didFinishLaunchingWithOptions:)`), et garde `navigator.audioSession.type='playback'` côté JS quand il existe.
5. IOS-07 + IOS-11 + IOS-32 + ECO-17 + SON-01 + SON-07 — `app-ios/preparer-www.js` : copier `creatures/atelier.js` (le Worker des singes de Jade, `GARDE` sans `creatures`), réutiliser les retraits de `vercel-build.sh` (`publie-audio.cjs` pour ne garder que l'audio référencé : 83 Mo → ~28, `publie-allege.cjs` pour les crochets `dbg`, `scinde-banque.cjs` pour le démarrage), purger les commentaires de marques (Ferrari, Batman, Nyan, Kellogg) du livrable, et ajouter `node app-ios/preparer-www.js --essai` à `vercel-build.sh` pour qu'une coupe cassée bloque la publication web avant de casser l'app. Vérifie que `--essai` passe sur `main` du jour.
6. D4 — Renommages IP décidés par Sacha : dans `code/voitures/cars.js` on change `name`, `desc` et les clés I18N du fichier de dessin, JAMAIS l'index ni l'ordre. Vérifie que le nom n'est pas aussi une clé de sauvegarde ou de mission (`grep` sur l'ancien nom dans `code/`).
7. IOS-19/20/21/26 — `natifMin`, `launchAutoHide`, indicateur d'accueil, règle CITE, dans `app-ios/` (hors des lignes notify/ban/mise à jour de `natif.js`, qui sont à Fable).

B. LA RÈGLE « TÉLÉPHONE = OPTIMISÉE » MENÉE AU BOUT (jour 2)
8. D5 / DIR-03 — `DPR_CAP` dans `code/rendu/` (qualité/paliers) : 1,5 en course sur A15+ ou RAM ≥ 4 Go avec l'adaptatif existant, 2 dans les menus/garage/boutique où rien ne bouge, 1 sous charge. Sur `ALLEGE`/`PAL.b()`, jamais sur `IS_MOBILE`.
9. RND-05 (`qlSonde` `readPixels` synchrone → asynchrone ou coupé sous ALLEGE), RND-06 (post-traitement `postBloomMips`/FXAA par `PAL.b()`), RND-12 (Jade libérée après deux maps, `code/maps/biomes.js` SEULEMENT après que Sacha a dit que la session Arrakis a committé), RND-07/09/11 si le temps le permet.
10. DIR-07 — Sur ordi, la page-cadre `/jouer/` charge et exécute `index.html` deux fois (38,6 Mo) : dans `code/page/debut-corps.html`, quand on est le cadre, `return` avant les scripts du corps (ou page-cadre séparée de 5 Ko).

C. ÉCONOMIE ET MISSIONS (jour 2)
11. ECO-06 (mission `km100k` = 250 h → 10 000 km ou `{retire:1}`), ECO-08 (×2 et seconde chance ne doublent plus `RUNX.verse`), ECO-23 (ailes 50 M → 5 M), DIR-08 (enquête : mission « toutes les météos » validée après 4 parties et +180 000 $ pendant la navigation des menus ; journalise `SAVE.d.bank` à chaque écriture et le compteur de météos de `code/missions/moteur.js` ; corrige si c'est un bug, note si c'est le pilote `dbgAuto`), D6 (sauvegarde sur le web : retirer la condition `SAVE.neuf` sauf `?demo=1`), HYG-10 (un seul drapeau `DEV` = hôte local ou `?dev=` qui conditionne `?pub=0 ?chance=0 ?spin=0 ?cadeau=1 ?carte= ?niveau= ?lecon=non ?eco=ancien ?simu=1 ?garde=1`).

D. ÉTATS D'INTERFACE (jour 3)
12. INT-02 (`#overlay role="button"` cache le menu à VoiceOver, `ecrans-menus.html:26`), INT-05 (mission réussie effacée sans confirmation, en cours joue le refus, `ecran-revelation.js:128-130`), INT-06 + DIR-45 (`intro-161.js:853` : « TOUCHE » jamais affiché ; le toucher sur la boule ne lance le film qu'une fois sur quatre : seuil `bGlisse` plus large, « TOUCHE » après 2 s), INT-08 (`#modale` sous le clavier → `visualViewport`), INT-16 (inventaire fermé par X et pas RETOUR), INT-26 (trois définitions de « couché » → une), INT-40 (POUCE HAUT / VOL INVERSÉ en double), DIR-04 (« INVENTAIRE » reste en français au retour du garage depuis la mort : `#gvCof` doit passer par `TR()`), DIR-26 (pastille « 19 » sans sens sur GARAGE), DIR-36 (`#gCard` « 1 / 51 » qui ne réagit pas : toucher = boutique sur la caisse), DIR-09 + D7 (3 s de rails au départ), DIR-28 + DIR-46 selon D8, DIR-30 (verrou entre deux onglets : jeton `sessionStorage` + événement `storage`, page passive en lecture seule), GP-03 (`figures-route.js:59-67` : remboursement de nitro seulement si `P.payees.length>0`), GP-04/05 (respawn `safeS` temporel, filet NaN sur `fallPos/fallVel`), GP-17/21/30/35 si le temps le permet.
13. INT-27 — `@layer` et retrait des `!important` UNIQUEMENT dans les fichiers CSS que tu touches déjà (`mort-flottante.css`) ; le reste du CSS est à Sonnet. C'est la première chose à sacrifier si le temps manque.

RÈGLES DU DÉPÔT (non négociables) :
- Branche `jury/opus` depuis `origin/main` à jour, dans ton propre worktree (`git worktree add ../CASH-CAR-jury-opus jury/opus`) : le dossier principal est occupé par une autre session.
- Le jeu est fabriqué depuis `code/` (251 morceaux, carte dans `code/ORDRE.txt`) : on n'édite JAMAIS `VERSION PRINCIPALE/index.html`. Après toute modif : `node code/assembler.cjs`, puis `--verifier`, et on committe `code/` ET `index.html` ensemble. Un morceau est une tranche brute : aucun en-tête. Tout le JS est une seule IIFE.
- Français partout. Section : `/* ===== TITRE (2026-11-0X, Opus : « la demande ») ===== */`. Jamais de `//` au milieu d'une ligne.
- Jamais insérer ni retirer une ligne au milieu de `CARS` / `CAR_UNLOCK` : la sauvegarde pointe par index. Retirer = `{retire:1,name:'…'}`.
- « DEUX VERSIONS, UN CODE » : tout retrait d'image/qualité sur `ALLEGE`, `TEL_NATIF` ou `PAL.b()`, JAMAIS `IS_MOBILE` (vrai aussi sur l'ordi en cadre téléphone). `bash garde-allege.sh` refuse sinon. `app-ios/www/` est GÉNÉRÉ (`npm run sync`), jamais édité à la main.
- Ne touche PAS à `sw.js` sauf dans ton dernier commit si le hook l'exige. Sacha monte le numéro à la fusion.
- Ta zone : `app-ios/preparer-www.js`, `app-ios/ios/`, `app-ios/natif/natif.js` SAUF les lignes notify/ban/mise à jour (Fable), `vercel-build.sh`, `code/gameplay/seconde-chance.js`, `code/css/mort-flottante.css`, `code/interface/` SAUF `traductions.js` (Sonnet) et `intro-161.js` est à toi, `code/economie/` SAUF `aura-banque-contrats.js`, `code/missions/moteur.js` et `ecran-revelation.js`, `code/gameplay/figures-route.js` et le respawn, `code/rendu/qualite*`, `palier-appareil.js`, `post*`, `code/maps/biomes.js` (après feu vert Arrakis), `code/page/debut-corps.html`, `code/voitures/cars.js` pour les renommages D4 seulement (Sonnet y touche `rar`/prix : préviens dans ton rapport des lignes modifiées). Hors zone : note dans le rapport, ne touche pas. Traductions : `Object.assign(I18N,{…})` dans ton fichier.
- Jamais de push sur `main`, jamais d'envoi à Apple, jamais de mot de passe, pas d'`archiver.sh` ni de `publier-maj.js` (Mac + Sacha).
- Crochets de test `window.dbgXxx`, variantes `?x=`. Un comportement visible changé garde l'ancien derrière `?x=ancien` une semaine.

INTENSITÉ : tu décides et tu intègres. Sous-agents Sonnet pour : lire une zone et te rapporter (Explore), appliquer une modification mécanique dans UN fichier (jamais deux sous-agents sur le même), et vérifier chaque bloc A/B/C/D dans un Chrome 390×844 (`?garde=1&tel=1`, accueil → garage → boutique → course → mort → garage, 0 erreur console, en FR puis EN). Pour l'app, `node app-ios/preparer-www.js --essai` après chaque modification de ce script. Pour Xcode/Swift tu n'as pas de Mac : écris le code, explique dans le rapport ce que Sacha compile et teste le jour Mac.

VÉRIFICATION avant de dire « fait » : `--verifier`, `garde-allege.sh`, `garde-demarrage.cjs`, `preparer-www --essai` passent ; 0 erreur console ; les mots « PUB » et « AD » n'apparaissent plus dans le `www/` généré (`grep`). Rapport final `passation/RAPPORT-JURY-OPUS.md` : par ID, FAIT / PAS FAIT (pourquoi) / À VÉRIFIER SUR IPHONE, fichiers touchés, lignes de `cars.js` et `natif.js` modifiées (pour les fusions), points hors zone laissés aux autres. Pousse `jury/opus` et arrête-toi : Sacha fusionne après Sonnet.
```

### 7.3 PROMPT SONNET (mécanique : jour 0, textes, CSS, nettoyage)

```
Tu es Sonnet, finisseur de CASH CAR, un runner arcade 3D three.js pour téléphone (dossier `VERSION PRINCIPALE/`, app iOS Capacitor dans `app-ios/`), dans la dernière semaine avant la soumission à l'App Store. Un jury a audité tout le jeu : lis `passation/AUDIT-FINAL-2026-11-05.md` (§1, §3, §5, §6), puis `CLAUDE.md`. Tu fais les corrections mécaniques, nombreuses et sûres : une ligne, un texte, une règle CSS, un fichier mort. Tu ne redessines rien et tu ne changes aucun comportement de jeu.

JOUR 0 — trois lignes, directement sur `main` (Sacha pousse lui-même, tu ne pousses pas `main`) :
1. ECO-01 — `app-ios/preparer-www.js:108` : `toutes('LE CHARGEUR', …, 13)` trouve 14 occurrences depuis un commentaire ajouté le 3/11 dans `code/interface/garage-menu-inventaire.js:195`. Corrige le compte (ou rends la coupe tolérante : `>= 13`, en gardant un message clair). Vérifie : `node app-ios/preparer-www.js --essai` passe.
2. ECO-02 — `code/economie/aura-banque-contrats.js:93` : `const TEST_CAISSES=true;` → `false`. Ajoute dans `outils/garde-demarrage.cjs` un contrôle qui refuse `TEST_CAISSES=true` dans `index.html`.
3. ECO-03 — `code/sauvegarde.js:173-185` : `san()` ne recopie pas `m2.mq` (les missions effacées reviennent) → ajoute `o9.mq=L9(s9.mq,200);` à côté des autres champs de `m2`.
Puis `node code/assembler.cjs`, `--verifier`, commit `code/` + `index.html` + `preparer-www.js` + `garde-demarrage.cjs` (message : « Jour 0 du jury : chaîne de livraison, TEST_CAISSES, missions effacées »). Dis à Sacha que c'est prêt à pousser. Ensuite seulement, crée ta branche.

ENSUITE, sur ta branche `jury/sonnet`, dans ton worktree (`git worktree add ../CASH-CAR-jury-sonnet jury/sonnet`), dans cet ordre :

A. TEXTES ET TRADUCTIONS (ta zone exclusive : `code/interface/traductions.js`)
4. Clés I18N manquantes (INT-09/10/11, DIR-05, DIR-24, DIR-25, INT-04) : CAPTEUR REFUSÉ, RACCOURCI, CHAMPION !, DERNIER !, EXPLOSION DANS, COUPERET DANS, ACCROCHE !, ELLE T'A SEMÉ, LA CAISSE-NUAGE, DONUT, BOOST, les sous-titres des cartes fruits, PREMIER MATIN, THE DARK TRIAD, RARES (boutique EN montre « RARES »), « EARLY DEAD » → « CHAIN LOST », les 13 `aria-label` sans traduction ; et en sens inverse « SEE ALL ITEMS » (`garage-lacher.js:225`), « NEW » (`boutique-du-jour.js:87`), « 1.61 PRESENTS » (intro) doivent passer par `TR()` et avoir une version française (TOUT VOIR, NOUVEAU, PRÉSENTE). La ligne `mobile-tactile.js:771` est la seule que tu touches dans ce fichier. Méthode : un petit script Node dans le scratchpad qui liste tous les `TR('…')` du code sans clé dans `I18N` et toutes les chaînes en majuscules dans le HTML sans `TR` ; corrige, relance, zéro reste.
5. INT-22/23/24, DIR-21/33/34, ECO-19 : ternaires FR/EN codés en dur → `TR()` ; « 500$ » → « $500 » (ou le format du reste) ; « +$500 » auto-école ; « TEMPS EN COURSE » → « EN COURSE » sous 400 px ; « TEMPS DE JEU » qui tourne dans les menus → « TEMPS DANS L'APP » (ou compter la course) ; « VERSION LOCALE ⚠ » seulement hors Vercel/app, « LOCAL BUILD » en EN ; textes de missions trop longs raccourcis (liste dans `audit-economie.md`, fichier `code/missions/table.js`, textes seulement).

B. CSS : chevauchements et cibles tactiles (ta zone : tout `code/css/` sauf `mort-flottante.css`)
6. Chaque point a sa capture dans le scratchpad `shots\` : INT-03 (porte MISSIONS 30 px → 44, `garage-hub-bas.css:78`), DIR-14 (onglets inventaire 34 px → 44 en couché), DIR-15/16/17 (la liste des réglages, le curseur MUSIQUE en couché et la 2e rangée de l'achat passent sous RETOUR → marge basse = hauteur du bouton + 16 px, et un fondu au-dessus de RETOUR), DIR-18 (compteur « $ 228 888 » sous l'œil sur SE → `font-size` fluide sous 400 px), DIR-20 (barre RETOUR/PLAQUE du profil collante sur SE), DIR-22 (JOUER déborde de 4 px en couché, `.mPlay`), DIR-23 (« 1 099 » coupé en deux par l'espace fine → `letter-spacing` négatif sur le séparateur ou pas d'espace sous 1 000 000), DIR-13 (orphelin « ICI », sous-titre EN sous les pastilles → marge haute +10 px), DIR-35 (triple RECORD → un badge), DIR-38/39 (compteur « $ 0 » nu, dernière rangée de la boutique coupée sans fondu), DIR-42 + INT-19 (pouvoir en cours gris sur fond clair → fond plein ; polices 4-6 px → 7 px ; contraste `--tx3`), DIR-48 (hauteurs de boutons d'une même rangée alignées), INT-12/13 (glyphes ›, ★ → `pxi`, `font-weight:900` retiré), INT-14, INT-25, INT-30 (`text-overflow: clip` → `ellipsis`), INT-41, INT-43 (table des `z-index` en tête du fichier principal), DIR-44 (pause sur ordi : panneau centré et titre). Pas de `!important` nouveau ; si tu en retires au passage dans une règle que tu touches, tant mieux, mais tu ne refais pas le CSS (INT-27 est pour plus tard).

C. TABLES ET PETITES VALEURS (ta zone : `cars.js`/`deblocage.js` pour `rar`, prix, desc SEULEMENT)
7. ECO-07 (ICEBERG 32 M → 3,2 M, DOGE 40 M → 4 M), ECO-11 (POSTER index 84 sans `rar`), ECO-12 (règle LOUP morte), ECO-14 (palier 10 = 0/9999 → masquer), ECO-22 (COMÈTE témoin `bientot`), ECO-24 (`maps`/`maps2` dupliqués dans la sauvegarde → une clé, migration dans `san()` : cette ligne-là dans `sauvegarde.js` est la seule après le jour 0 ; préviens Fable dans ton rapport), ECO-28/30/31 (en-têtes de section, commentaires de prix faux, sacs du final spin ×10), RND-03 (`memToiles=[1,1,0]` conditionné par `ALLEGE` et non `PAL`), RND-28 (`PISTE_MOY/MOB` sur `ALLEGE` et non `TEL_NATIF`), GP-06/07/10/29 (`resetGame` remet shake, fovPunch, `CAMV.zoom`, squashT, susY/susV, SCOUP, `VEQ.sp`, rollV, fruitRaf, FX2, PCV : uniquement des remises à zéro, dans la fonction `resetGame` seulement), GP-13 (respawn par R sur ordi seulement sous `?dev`), GP-40 (`loopWarn` → `__ccNote`), DIR-31 (retirer `flatShading` des `MeshLambertMaterial`, 23 avertissements).
8. `passation/ECONOMIE.md` réécrit avec les vrais prix après le ×10 (ECO-09), table lisible : nom, prix, condition, rareté.

D. NETTOYAGE (sûr, vérifié par `--verifier` et une course)
9. HYG-09 — Les 30 variantes `?x=ancien` : supprime le code mort de celles qui ne sont PAS citées dans `CLAUDE.md` (garde `?intro=ancien`, `?marbre=0`, et celles ajoutées depuis moins de 15 jours : `git log -S`). HYG-12 (~80 Ko de fonctions/fichiers morts listés dans `audit-hygiene.md`), INT-17 (écran MODES), INT-18 (DOM de dev : `#stall`, `#settings`…), INT-32/33 (anciennes cartes de mort, logique SUIVIES), ECO-20 (`pubs`), ECO-32 (code « cadeau »), SON-27, SON-33 à 40 (`minecraft.m4a` renommé partout, ~250 lignes v3/v4 mortes dans `code/son/`, en coordination : tu retires du code MORT seulement, Fable réécrit le vivant), HYG-14 (duplication caid/simpson/combi si c'est un copier-coller identique), HYG-21 (348 `//` après du code → `/* */`, par script, en vérifiant qu'aucun n'est dans une chaîne ou une URL).
10. HYG-08 — 18 `setInterval` jamais arrêtés : `clearInterval` quand l'écran se ferme, ou un seul tic partagé ; pas d'événement nouveau.
11. SON-09 (4 mp3 `FX_ARGENT` jamais joués → supprimer fichiers + références), SON-20 (15 Mo de musique inutilisée dans `assets/` : `publie-audio.cjs` sait ce qui est référencé ; supprime le reste), SON-11 (WAV 8 kHz → m4a), SON-19 (`code/son/rendus/index.js` : fichiers absents), SON-10/14/16/18/21/24/25/32 (une ligne chacun, détails dans `audit-son.md`), SON-05 est à Fable.
12. HYG-11 + ECO-17 — Vérifie que la liste des 27 crochets `dbg` de `publie-allege.cjs` est complète (compare avec `grep -o "window\.dbg[A-Za-z]*" index.html | sort -u`) ; complète-la. C'est Opus qui branche `publie-allege` dans `preparer-www`.
13. IOS-15 (`.gitignore` += `.claude/`, `.playwright-mcp/`), IOS-22/23 (chaînes App Store/StoreKit mortes), IOS-27 (en-têtes Vercel), IOS-03 (`pages-app/confidentialite.html` : recopie le texte vrai de `app-ios/fiche/`, qui mentionne les mises à jour depuis GitHub ; tu le committes sur ta branche, Sacha décide du push), IOS-33 à 45 (doc), HYG-24 à 40, INT-46 à 52, ECO-29, RND-10 (régénérer les cartes postales `dunes-*.webp` avec le banc existant si la session Arrakis a fini, sinon noter).

RÈGLES DU DÉPÔT (non négociables) :
- Le jeu est fabriqué depuis `code/` (251 morceaux, carte dans `code/ORDRE.txt`) : on n'édite JAMAIS `VERSION PRINCIPALE/index.html`. Après toute modif : `node code/assembler.cjs`, puis `node code/assembler.cjs --verifier`, et on committe `code/` ET `index.html` ensemble. Un morceau est une tranche brute (pas forcément du JS complet) : aucun en-tête. Tout le JS est une seule IIFE : rien n'est global.
- Français partout. Section : `/* ===== TITRE (2026-11-0X, Sonnet : « la demande ») ===== */`. Jamais de `//` au milieu d'une ligne.
- Jamais insérer ni retirer une ligne au milieu de `CARS` / `CAR_UNLOCK` : la sauvegarde pointe par index.
- « DEUX VERSIONS, UN CODE » : tout retrait d'image/qualité sur `ALLEGE`, `TEL_NATIF` ou `PAL.b()`, JAMAIS `IS_MOBILE`. `bash garde-allege.sh` refuse sinon. `app-ios/www/` est généré, jamais édité.
- Ne touche PAS à `sw.js` (Sacha monte le numéro à la fusion ; si le hook pre-push l'exige, +1 dans ton dernier commit seulement).
- Ta zone : `code/interface/traductions.js`, tout `code/css/` sauf `mort-flottante.css`, `pages-app/`, `passation/ECONOMIE.md`, `app-ios/fiche/`, `.gitignore`, `cars.js`/`deblocage.js` (champs `rar`/prix/desc), `aura-banque-contrats.js`, `outils/garde-demarrage.cjs`, `assets/audio/` (suppressions), `code/son/rendus/index.js`, le code MORT que tu supprimes, les lignes exactes citées ci-dessus. Tout le reste est à Opus ou Fable : si tu vois quelque chose, tu le notes dans ton rapport, tu ne touches pas. Pas de traduction ailleurs que dans `traductions.js` (les autres agents ajoutent les leurs dans leurs fichiers ; si tu trouves un doublon contradictoire, note-le, c'est INT-21 pour Opus).
- Jamais de push sur `main` (le jour 0 : tu committes, Sacha pousse), jamais d'envoi à Apple, jamais de mot de passe, pas d'`archiver.sh` ni `publier-maj.js`.

INTENSITÉ : tu travailles seul, par petits commits (un par lettre A/B/C/D au moins, idéalement un par groupe de points), chacun avec `--verifier` vert. Sous-agents seulement pour lister (Explore) : la liste des `TR()` sans clé, celle des `dbg`, celle des `//`. Tu ne délègues jamais une modification. Quand un point te paraît demander un choix de conception ou toucher un comportement de jeu, tu ne le fais pas : tu l'écris dans ton rapport avec le fichier et la ligne.

VÉRIFICATION avant de dire « fait » : `--verifier`, `bash garde-allege.sh`, `node outils/garde-demarrage.cjs`, `node app-ios/preparer-www.js --essai` passent ; servir `VERSION PRINCIPALE` en local (`npx serve` ou `python -m http.server`), charger `?garde=1&tel=1` dans un Chrome 390×844 puis 844×390 et 375×667, parcourir accueil → réglages → garage → inventaire → boutique (6 rayons) → missions → profil → course → mort → garage, en FR puis en EN : 0 erreur console, aucun texte anglais en FR ni français en EN, aucun bouton sous RETOUR (ton script `audit.js` du banc ou une capture par écran). Rapport final `passation/RAPPORT-JURY-SONNET.md` : par ID, FAIT / PAS FAIT (pourquoi), fichiers touchés, lignes de `sauvegarde.js` et `cars.js` modifiées (pour les fusions), points hors zone laissés aux autres. Pousse `jury/sonnet` et arrête-toi : Sacha fusionne en premier.
```

---

## 8. CHECKLIST DE SOUMISSION (après les fusions)

### Sur le PC (J5)
1. `main` = Sonnet + Opus + Fable fusionnés, `sw.js` monté une fois par fusion, `node code/assembler.cjs --verifier` vert.
2. `bash garde-allege.sh`, `node outils/garde-demarrage.cjs`, `node app-ios/preparer-www.js --essai` : verts.
3. `grep -c "TEST_CAISSES=true" "VERSION PRINCIPALE/index.html"` = 0 ; `grep -ciE "ferrari|batman|nyan|kellogg" app-ios/www/index.html` = 0 ; aucun « PUB » / « AD » dans `app-ios/www/` ; `grep -o "window\.dbg[A-Za-z]*" app-ios/www/index.html` vide.
4. Jeu web `?tel=1` dans un Chrome 390×844 : chargement ×5 sans gel > 5 s, 5 courses d'affilée, `performance.memory` stable, frénésie audible, FR et EN complets.
5. `pages-app/confidentialite.html` vrai (mises à jour GitHub, pas de compte, pas de pub, sauvegarde locale) — **push main avec OUI de Sacha**.
6. `npm run sync` dans `app-ios/`, commit du `www/`.
7. `.gitattributes` en place, `git ls-files --eol | grep crlf` vide pour `app-ios/www/`.
8. Dépôt rendu privé ou coordonnées purgées (D9).

### Sur le Mac (J6)
9. `git pull`, `npm run sync`, `npx cap sync ios`, ouvrir Xcode, cible 16.4, équipe M532TDYCH2, `PRODUCT_NAME` CASH CAR.
10. iPhone réel (idéalement un à 4 Go ET un Pro récent) : lancement à froid ×5 (chrono), tuer l'app pendant le chargement puis relancer (la mise à jour ne doit pas être bannie), 5 courses d'affilée (Xcode Memory < 1 Go, pas de contexte perdu), frénésie puis retour en arrière-plan puis reprise, interrupteur silencieux (le son continue), rotation debout/couché en course, VoiceOver sur l'accueil (le menu est lisible), mise à jour Capgo : publier une version mineure sur `app-maj`, vérifier qu'elle s'applique au retour au menu et jamais en course.
11. Captures (6,7" et 6,1", debout et couché, sans texte anglais en FR), fiche App Store relue (D2 : classification Simulated Gambling si le spin reste), URL de confidentialité = la page vraie, contact 16180contact@gmail.com.
12. `archiver.sh` → App Store Connect → **envoi à Apple seulement avec le OUI écrit de Sacha**.
13. Après la soumission : étiqueter `v1.0-appstore` sur `main`, noter dans `passation/APP-STORE.md` la version du `www/` embarquée (hash) et la version Capgo publiée.

---

## 9. CE QUE LE JURY N'A PAS PU VÉRIFIER

- Rien sur un iPhone réel : les temps et la mémoire sont ceux d'un PC (compter ×3 à ×5 pour le CPU, et un budget mémoire 4 à 8 fois plus serré). Les cinq tests du point 10 sont le vrai verdict.
- Le gel DIR-01 a été mesuré avec un autre banc tournant sur la même machine ; la cause (lecture synchrone du canvas sous contention GPU) reste plausible sur iPhone au moment de la compilation des shaders, et la correction est de toute façon bon marché.
- L'achat réel (StoreKit) et une vraie régie publicitaire n'existent pas : le jury recommande de ne livrer ni l'un ni l'autre dans la 1.0.
- DIR-08 (+180 000 $ dans les menus) peut être un artefact du pilote automatique : à confirmer avant de corriger.
- La session Arrakis en cours modifie `dunes-*.js` et `biomes.js` : les constats RND-01/09/13 sont à relire après son commit.
