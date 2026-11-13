# PLAN ULTIME — app iOS CASH CAR
*Écrit le 12/11/2026 pour UNE session Fable en effort moyen, sans sous-agent. Rien de ce plan n'est appliqué.*

## En dix lignes
1. But : zéro bug, zéro écran mort, la course la plus fluide possible sur tous les iPhone (iOS 16.4+), app sortable.
2. Ce qui change par rapport au plan d'avant : on ne corrige plus « au fil de l'eau ». Cinq vagues, chacune fermée par une preuve sur le téléphone.
3. Vague 0 : compiler et relire ce qui est déjà écrit (natif, polices) — jamais compilé, jamais écouté.
4. Vague 1 : les correctifs sûrs (écrans, polices, son à la sortie, musique pré-rendue).
5. Vague 2 : le vol. Elle est PILOTÉE PAR LA MESURE : les parties de Sacha (boîte de vol) disent quoi alléger, on n'allège rien à l'aveugle.
6. Vague 3 : tous les iPhone (modèle exact → qualité par défaut, écrans extrêmes, mémoire).
7. Vague 4 : chargement, mémoire, séance longue.
8. Vague 5 : sortie (édition App Store propre, check-list, build final).
9. Budget : ~10 % du forfait hebdomadaire. Vagues 0, 1, 2 et le cœur de la 3 sont indispensables ; le reste peut attendre le 14/11 midi.
10. Rien sur `main`, aucun envoi à Apple, sans le oui écrit de Sacha.

## 1. Où on en est
| Quoi | Où | État |
|---|---|---|
| Branche d'intégration | `ios-ultime-vol`, worktree `~/cash-car/ios-ultime-tel` (084e886c7) | main v1492 + coupes de l'app + passe debug gameplay reportée + boîte de vol + correctifs natifs + polices. Poussée. |
| Branche `ios-ultime` (`~/cash-car/ios-ultime`) | d037802d | en retard : à avancer sur `ios-ultime-vol` en vague 0 |
| Correctifs natifs (7 commits fdaef4570 → ee50351b2) | dans `ios-ultime-vol` | écrits, `swiftc -parse` seulement : **jamais compilés, jamais écoutés** |
| Polices (CC Symboles + 4 correctifs) | dans `ios-ultime-vol` | écrites, gardes vertes : **jamais vues dans WebKit ni sur téléphone** |
| Build 50 « boîte de vol » | sur le 13 Pro de Sacha | jeu complet 4d6b930 + enregistreur `?perfrec=2`. SANS les correctifs natifs ni les polices. Sacha joue. |
| Rapports | `passation/ios-ultime/` : CRASH-CHARGEMENT, POLICES, SON-CYCLE, ECRANS-SIMULATEUR | l'agent des bancs a été arrêté avant son rapport : restes dans `~/cash-car/ios-ultime-mesures/bancs/` (singe.cjs, out/) |
| Mesures, builds | `~/cash-car/ios-ultime-mesures/` (hors git) | builds/build50-vol.app, dd-tel (derivedData iPhone), dd-sim (simulateur) |

## 2. Règles de la session
- **Fable seul, effort moyen, aucun sous-agent.** Lire par extraits (`grep -n … | cut -c1-300`), jamais un gros fichier entier ; une seule vérification par changement.
- **Mobile seulement** : garde `TEL_NATIF` / `window.Capacitor` / `ALLEGE`, ou `natif.js`, Swift, `preparer-www.js`. L'ordinateur ne change pas.
- **DA intouchée, gameplay figé** (bugs seulement). Chaque allègement d'image a un interrupteur d'adresse.
- **Le Mac** : UNE seule chose lourde à la fois (xcodebuild OU simulateur OU un Chrome de banc), `uptime` avant, tout fermer après. Pas de `find /`.
- **Le dépôt** : après une modif de `code/` → `node code/assembler.cjs --depuis-morceaux`, puis les 4 gardes (`node outils/garde-demarrage.cjs`, `sh garde-charte.sh`, `sh garde-allege.sh`, `sh garde-burnout.sh`). `sw.js` : une ligne `const CACHE`, +1 par intégration. Commit et push après chaque lot.
- **Le téléphone** : ne jamais installer pendant que Sacha joue (ça tue sa partie). Lire avant d'installer (`sh outils/banc-perf/lire-vol.sh`).

## 3. Définition de fini (des seuils, pas des intentions)
Mesuré sur le 13 Pro, état thermique nominal ou fair, par la boîte de vol, sur ≥ 20 min de course dont ≥ 5 min de vol :
| Mesure | Seuil |
|---|---|
| Images en retard (> 21 ms) en **vol ≥ 600 km/h** | ≤ 5 %, et pas plus de 1,5 × la valeur au sol |
| Images > 51 ms en vol | ≤ 0,3 % |
| Temps calé sur 30 en vol (thermique nominal) | 0 % ; aucune bascule 30↔60 pendant un vol |
| Images longues (liste L) | ≤ 5 pour 1000 s de vol |
| Gel > 1 s en course ou au menu (boîte noire) | 0 |
| Écran mort / page tuée sur une séance de 30 min | 0 (ligne « page d'avant non fermée » absente) |
| REJOUER → course | ≤ 6 s (grotte comprise) |
| Son : quitter / revenir (menu, course, appel, centre de contrôle) | fondu, pause, retour du son sans toucher — écouté par Sacha |
| Polices | aucun émoji couleur ni symbole système à l'écran ; planche validée par Sacha |
| Écrans | 6 gabarits sans débordement (voir § 6) |
| App Store | check-list § vague 5 entièrement cochée |

## 4. Les vagues

### Vague 0 — Remettre d'aplomb ce qui est écrit (≈ 45 min, indispensable)
| Lot | Quoi | Acceptation |
|---|---|---|
| 0.1 | **Relire les 7 commits natifs** (`git show`), en cherchant : la pause ouverte à tort quand l'app devient inactive pour une feuille d'achat StoreKit, Face ID ou une alerte système ; `GardeVue` qui rechargerait une page saine pendant le chargement de 13-16 s ; double reprise du son ; accès à la vue web depuis `SceneDelegate`. | liste des corrections, appliquées |
| 0.2 | **Le drapeau de l'enregistreur ne s'efface jamais** : `ccPerfRecOn='2'` reste dans le téléphone après le build de mesure (le localStorage survit aux mises à jour). `natif.js` doit l'effacer quand l'app n'est pas construite avec `perfrec`, comme il le fait pour `ccBancAuto` (ligne 26). | un build sans `--qs` éteint la boîte de vol |
| 0.3 | **Compiler** `ios-ultime-vol` pour le simulateur (iPhone 17 Pro), lancer 60 s, lire la console (`[natif]`, erreurs). Corriger ce qui ne compile pas. | BUILD SUCCEEDED, zéro erreur JS |
| 0.4 | **Planche polices dans WebKit** (une capture avant/après au simulateur : accueil, garage, boutique, écran de fin). Vérifier qu'aucun symbole réellement affiché n'est devenu invisible (la police vide des plages entières : U+2300-23FF, 2600-27BF, 2B00-2BFF, 1F000-1FAFF). | planche envoyée à Sacha |
| 0.5 | Avancer `ios-ultime` sur `ios-ultime-vol`, cache v1494. | poussé |

### Vague 1 — Correctifs sûrs (≈ 1 h, indispensable)
| Lot | Constats | Fichiers |
|---|---|---|
| 1.1 Écrans | S-01 titre « AUTO-ÉCOLE INTERROMPUE » coupé (`mobile-tactile.js:748`) ; S-02 tutoriel qui demande un glissé en mode FLÈCHES ; S-03 capot coupé sur la fiche ACHAT ; S-04 fragment rose en mode « œil » du garage | `code/moteur/mobile-tactile.js`, `code/interface/auto-ecole.js`, CSS de la fiche et du garage |
| 1.2 Bancs | Relancer UNE fois `~/cash-car/ios-ultime-mesures/bancs/singe.cjs` (portrait FR) et `outils/banc-hud/chevauche.cjs` ; corriger seulement ce qui est reproduit deux fois | selon résultat |
| 1.3 Musique | 3 des 5 morceaux du tirage n'ont pas de rendu figé (NÉNUPHARS VELOURS `bleu-9551`, LUNE DE JADE `bleu-6167`, FIRE PRIME `bleu-8154`) : synthèse en direct = chaleur. Selon la réponse de Sacha (Q1) : les rendre (`outils/musique/rendre-paliers.mjs`, ~10 min chacun, Mac au calme) ou les sortir du tirage de l'app | `preparer-www.js` ou assets |
| 1.4 Build 51 | Jeu complet + boîte de vol + tout ce qui précède, installé quand Sacha a fini ses parties sur le 50. **Sacha écoute** : quitter/revenir au menu et en course, verrouillage, centre de contrôle, appel, Bluetooth ; interrupteur `ccFondu0` si le fondu gêne | ses retours, lignes `musique | figée …` dans la boîte noire |

### Vague 2 — Le vol à grande vitesse (≈ 2 h, indispensable, pilotée par la mesure)
**Étape A — lire les parties de Sacha** : `sh outils/banc-perf/lire-vol.sh`. Le tableau répond à cinq questions ; chaque réponse désigne son levier.
| Question (tableau) | Si oui | Levier |
|---|---|---|
| Q-A Le vol est-il calé sur 30 plus que le sol ? (« calé30 » vol vs sol, thermique 0-1) | la cadence réactive bascule en plein vol | **Aucune bascule de cadence ni de résolution pendant un vol** : décision prise au sol (`cadence.js`, `gouverneur-paliers.js`, `qlPose`) ; alléger le rendu en vol AVANT de caler |
| Q-B Le travail du jeu (« travail », part > 12 ms) est-il plus haut en vol ? | c'est du JS | Suspects lus dans le code : (1) `airPieDraw` écrit la variable CSS `--a` sur `#airHud` et l'anneau du pouce à CHAQUE image de vol → passer en `transform`, écrire au 1/30 ; (2) le bloc PG-02 de `boucle-3-physique.js` reteste les heurts du décor plusieurs fois par image sous 60 i/s ; (3) le pré-bâti de la piste, qui grandit avec la vitesse (`piste-prebati.js`) ; (4) le radar d'atterrissage. Mesurer chacun avec un interrupteur, garder ceux qui gagnent |
| Q-C Images lentes avec un travail bas ? | c'est la puce | Lire les leviers par course (dpr1, halo0, stries0, ombre512, ciel3 contre base, lignes « vol ≥ 600 km/h ») : celui qui gagne devient le **régime de vol** — posé au décollage, rendu à l'atterrissage, avec 0,5 s d'hystérésis, sans réallouer les cibles en vol (préparer les deux tailles) |
| Q-D Les images longues tombent-elles sur « reconstruction » ou « portail » (drapeaux 2, 4) ? | c'est le bâti de la piste | étaler davantage (`PREBF`), jamais d'un bloc en vol |
| Q-E Beaucoup de secondes en thermique 2-3 ? | la chaleur domine | vague 1.3 (musique figée) d'abord, puis menu au repos |

**Étape B — un banc de vol reproductible** : ajouter au banc automatique (`code/moteur/banc-iphone.js`) un scénario `vol` : `dbgAuto(true,0,{vol:true,nit:2,saut:6})`, moteur monté au palier 16, 4 min. Il sert de juge A/B (les parties de Sacha servent de vérité).
**Étape C — A/B sur le téléphone** : un build par levier retenu (`--qs`), sentinelle thermique avant chaque série (§ 5), trois passes. On garde un levier s'il fait baisser les images en retard en vol d'au moins un quart sans que Sacha voie l'image changer.
**Étape D** : build avec les leviers gardés → Sacha rejoue 20 min → les seuils du § 3.
*Si les données de Sacha manquent quand la vague commence : commencer par l'étape B (banc), ne rien alléger avant.*

### Vague 3 — Tous les iPhone (≈ 1 h 30 ; lots 3.1-3.2 indispensables)
| Lot | Quoi |
|---|---|
| 3.1 Le modèle avant le jeu | `window.__ccAppareil` arrive aujourd'hui APRÈS le chargement : trop tard pour `PAL` (calculé au début du script). L'injecter par un `WKUserScript` au début du document (surcharger la configuration de la vue web dans `JeuViewController.swift` ; vérifier la méthode dans `node_modules/@capacitor/ios`). Essai web : `?appareil=iPhone14,2`. |
| 3.2 La table | Dans `code/rendu/palier-appareil.js`, source « modèle », prioritaire sur la taille d'écran (qui confond un SE 3 et un iPhone 8) : iPhone10,x (8, X · A11) → palier 0 ; iPhone11,x et 12,x (XR, XS, 11, SE 2 · A12-A13) → palier 1 ; iPhone13,x et 14,x (12, 13, SE 3, 14 · A14-A15) → palier 2 **classe a** = les réglages d'aujourd'hui ; iPhone15,x et 16,x (14 Pro, 15, 15 Pro · A16-A17) → **classe b** : départ au palier de remontée −1 (résolution pleine) ; iPhone17,x et au-delà, identifiant inconnu plus récent → **classe c** : palier −2 (halo plein, ombre 1024). Si la fluidité manque 5 s, retour au palier 0 (règle existante de `gouverneur-paliers.js`). Une ligne `appareil` dans la boîte noire. |
| 3.3 Écrans | Simulateur : iPhone 17e, 17 Pro Max, Air — accueil, garage, boutique, réglages, course, mort, portrait et paysage. Le 375×667 (SE) et le zoom d'affichage (320 de large) : WebKit de Playwright, pas le simulateur. Corriger les débordements. |
| 3.4 Mémoire des 3-4 Go | Le seul arrêt forcé vu : processus graphique tué à 307 Mo. Budgets par classe (textures du ciel 1024, ombre 512 sur paliers 0-1) : **hypothèse**, à poser derrière `PAL.B` et à vérifier avec `?palier=0` et `?palier=1` au banc ; sans vieil iPhone, c'est le mieux qu'on puisse faire — le dire à Sacha. |

### Vague 4 — Chargement, mémoire, séance longue (≈ 1 h 30 ; peut attendre le 14/11 sauf 4.1)
| Lot | Quoi |
|---|---|
| 4.1 Séance longue | Banc automatique `p7` (13 min) puis 30 min sur le build final : 0 gel > 1 s, 0 page tuée, mémoire plate (lignes `memoire`). |
| 4.2 Gel à l'arrivée au menu (4-7 s) | Cause non prouvée. Enrichir la ligne `gel` (dernière étape nommée de la boucle, programmes liés depuis 2 s), lire après une séance de Sacha, puis corriger (lier d'avance ou étaler). |
| 4.3 Grotte | 13 s de creusement : la creuser pendant la course d'avant ou au menu. Change le moment du tirage de la map suivante : question Q2. |
| 4.4 Perte de contexte WebGL | Vérifier par lecture que `webglcontextrestored` remet vraiment le jeu ; sinon, rechargement propre de la page (sauvegarde intacte). |

### Vague 5 — Sortie (≈ 1 h ; après le oui de Sacha sur le build de la vague 2)
1. Édition App Store : `npm run sync` sans `COMPLET`, sans `--qs` ; vérifier que la boîte de vol, le banc et les crochets `dbg` sont inertes ou retirés.
2. Refusion de `origin/main` (elle bouge encore), 4 gardes, fumée son (`outils/banc-son/fumee-son.mjs`), routes (`outils/banc-routes/toutes.mjs`).
3. Check-list de `passation/APP-STORE.md` : version et numéro de build, `Info.plist`, manifeste de confidentialité, achats (38 produits, RESTAURER, mode avion), captures 6,9" et 6,3", fiche.
4. Archive locale (`sh app-ios/archiver.sh`), rien d'envoyé. `ios-capacitor` et `main` : seulement sur le oui de Sacha.

## 5. Mesurer sur le téléphone (toujours pareil)
1. App tuée depuis 3 min, téléphone déverrouillé, écran allumé. Budget thermique ≥ 380 au journal système (`pymobiledevice3 syslog live … | grep 'thermal budget'`), sinon attendre.
2. Lancer, jouer ou laisser le banc, puis `lire-vol.sh` (boîte de vol) et `lire-banc.sh` (boîte noire).
3. Comparer seulement des séries faites à état thermique égal (le tableau sépare les états 0-3). Trois passes = une mesure.
4. Une mesure sur le Mac ne vaut que pour compter (appels, erreurs), jamais pour la fluidité.

## 6. Appareils
| Gabarit | Comment | Ce qu'on y vérifie |
|---|---|---|
| iPhone 13 Pro (vrai) | câble | fluidité, chaleur, son, crashs : la seule vérité |
| iPhone 15 de Léo (vrai, parfois) | build de mesure | classe b de la vague 3 |
| 17e, 17 Pro, 17 Pro Max, Air | simulateur, un à la fois | mise en page, zones sûres, polices |
| 375×667 (SE), 320 de large (zoom) | WebKit de Playwright | débordements |
| iPhone 8 / X / 11 / 12 | personne ne les a | `?palier=0`, `?palier=1`, `?appareil=` au banc : logique seulement, pas la fluidité |

## 7. Questions pour Sacha (fermées)
- **Q1** Musique de course : rendre les 3 morceaux manquants (≈ +10 Mo, 30 min de machine) ou les retirer du tirage de l'app ?
- **Q2** Grotte : peut-on tirer la map suivante au début de la course pour la creuser d'avance (plus d'attente au REJOUER, l'ordre des tirages ne change pas pour le joueur) ?
- **Q3** Symboles : les émojis couleur deviennent des pictos pixel d'une seule couleur (coupe, cadenas, éclair, clé…) — oui après la planche ?
- **Q4** Les 63 correctifs de la passe debug gameplay sont dans la branche de l'app, pas sur le site : on les garde pour l'app seulement, ou aussi sur `main` ?
- **Q5** Classes b et c (iPhone 15 et plus récents en image pleine d'office) : oui sans pouvoir les mesurer tous, ou classe a pour tout le monde à la sortie ?

## 7 bis. Réponses de Sacha (12/11, 13 h 40)
- **Q1 non** : on ne rend pas les 3 morceaux manquants (lot 1.3 réduit aux 2 rendus déjà remis dans l'app ; à lui reposer : les retirer du tirage de l'app, ou les laisser en direct ?).
- **Q2 oui** : la grotte se creuse d'avance (lot 4.3 confirmé).
- **Q3 oui** : pictos pixel d'une seule couleur.
- **Q4** : les correctifs de la passe debug gameplay restent dans l'app seulement.
- **Q5** : « la meilleure fluidité possible sur chaque appareil ; une fois la fluidité acquise sur l'appareil on monte les graphismes, toujours priorité à la fluidité ». Donc PAS d'image pleine d'office : tout appareil récent part aux réglages sûrs (classe a) et la REMONTÉE automatique (`MOB_R`, aujourd'hui éteinte) l'élève palier par palier quand il tient 60 i/s ; elle retombe au premier signe de lenteur. Le lot 3.2 devient : table des modèles + remontée allumée et mémorisée par appareil.
- Budget donné : 14 % de l'hebdomadaire ; « calcule bien ton coût ».

## Vague 0 — FAITE (12/11, 13 h 50)
Relecture des 7 commits natifs : rien de bloquant à la lecture. Compilation simulateur : BUILD SUCCEEDED. Lancement 60 s : aucune erreur JS, écran-titre en police pixel. `natif.js` efface `ccPerfRecOn` hors build de mesure. Symboles : tous ceux du jeu sont dessinés ; 14 émojis décoratifs disparaissent (🪂 🛝 🐷 🪦 🧃 🍇 🍉 🛡 🐬 🤯 🛸 🤑 🍈 💰) ; ₿ ∅ ↳ restent en police système (3 occurrences). NON FAIT : captures garage / boutique / écran de fin, écoute du son sur téléphone (build 51, vague 1.4).

## Vague 1 — EN COURS (12/11, après-midi)
- **S-01 corrigé et vu** (volet 402×874) : « AUTO-ECOLE INTERROMPUE » passe sur deux lignes, 18→384 px sur 402 (classe `m6Long`, titres > 16 signes).
- **S-02 corrigé, non vu à l'écran** : en COMMANDES = FLÈCHES la consigne dit « Appuie sur la flèche gauche, puis la droite », sans main qui glisse. L'étape se valide déjà au braquage (`steer`), flèches comprises.
- **S-03 NON reproduit** : la ronde (3 angles) et la photo d'attente de LA FÉLINE et de L'ÉTERNELLE tiennent dans la feuille à 402 de large. La capture du simulateur a été prise Mac saturé. Rien changé ; à revoir sur le build 51.
- **S-04 = pas un défaut d'interface** : la forme rose est LA SERVANTE (desserte à cinq tiroirs du décor 3D, `garage-salle.js:410`), coupée par le bord de l'écran ; le bouton BOUTIQUE la couvre d'habitude. Décor de Sacha/Léo : pas touché.
- **1.3** : les 2 rendus existants sont déjà remis dans l'app (`preparer-www.js:252`). Reste la question à Sacha : les 3 morceaux sans rendu, les sortir du tirage de l'app ou les laisser en direct ?
- Cache v1495.
- **1.2 bancs** : singe (portrait FR, 10 min) = 158 appuis, 7 écrans, 0 exception, 0 erreur ; seul relevé, `#gName` plus large de 2 px (déjà vu au passage d'avant, invisible). `chevauche.cjs` (13 Pro, FR, 40 états) : fond du joystick qui dépasse de 12 px à gauche (voulu), deux recouvrements de ~180 px² vus une seule fois (`#auraV2`/`#cashHud` à l'entrée en vol, `#m2Ligne`/`#touchCtl` au pire cas). Rien de reproduit deux fois : rien corrigé.
- **1.4 build 51 COMPILÉ, PAS INSTALLÉ** : `~/cash-car/ios-ultime-mesures/builds/build51.app` (jeu complet 91e50c4f4 + boîte de vol + natif + polices + S-01/S-02). À installer quand Sacha dit qu'il a fini sur le 50 : `sh outils/banc-perf/lire-vol.sh` D'ABORD, puis `xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 <build51.app>`.

## Vague 2 — EN COURS (12/11, 14 h 45) : ce que disent les mesures
Parties de Sacha : 8 courses, 18 min (5 sur le build 50, 3 sur le 51). Fichiers : `~/cash-car/ios-ultime-mesures/vol/vol-1112-*.json`, boîte noire `boite-noire-1112-1430.txt`.
- **Sol 26 i/s, vol 17-19 i/s, figure 14 i/s** sur le build 50 ; travail JS identique partout (6-7 ms). Calé sur 30 à 95 %.
- **Le cran de qualité ne change RIEN** : sol 26,1 i/s aux crans QL 5, 8 et 10 ; vol 18,3-19,1. Donc ce ne sont pas les pixels (Q-C du plan : non).
- **Compté sur le Mac** (`dbgCout`, 390×844, `?tel=1`) : en vol ≥ 600 km/h 94 appels / 246 k triangles, au sol 98-107 appels / 300 k. La scène 3D n'est PAS plus lourde en vol.
- **Le build 51 vole mieux que le 50** : 23,7 i/s contre 17-19 (60 s de vol seulement, téléphone plus chaud). Le 51 ajoute les polices (CC Symboles, `font-synthesis`) et le natif. À confirmer.
- **Ce qui s'ajoute en vol côté interface** (relevé `document.getAnimations()` sol contre vol) : transition `width` de `.ahF` (chrono de vol, `--a` écrit à chaque image), animations `hmPie`, `nitroPlein`, `nbRaye`, `nbBout`, `hfVit`, `pwrPuls`, et une quinzaine de textes à `filter` réécrits.
- **Suspects restants, non prouvés** : (1) le coût caché du HUD dans WebKit (style, mise en page, peinture : hors du « travail » mesuré) ; (2) un écran bridé à 30 Hz (mode économie d'énergie d'iOS) qui ferait tomber toute la règle de qualité au cran 10 pour rien ; (3) la puce occupée par autre chose que les pixels.
- **Build 52 de mesure COMPILÉ, PAS INSTALLÉ** (`builds/build52.app`, jeu 24c1f39e4, cache v1497) : la boîte de vol y note par seconde les images d'écran reçues, le plus petit intervalle et le vrai coût d'une image (barrière de la puce), et tire deux leviers d'interface : `fx0` (ni filtre, ni animation, ni transition CSS en course) et `air0` (chrono de vol caché). `analyse-vol.py` a le tableau « L'ÉCRAN ET LA PUCE ». Pendant une course `fx0`, les ombres portées du HUD disparaissent : c'est voulu.
- Lecture attendue : écran ≈ 30/s → téléphone bridé (demander à Sacha le mode économie d'énergie) ; écran 60/s et `fx0` qui remonte le vol → alléger le HUD de vol (transform au lieu de width, text-shadow au lieu de filter) ; vrai coût > 25 ms en vol → chercher côté puce.
- Piège du banc : dans le volet à taille d'ordinateur le jeu tourne dans un cadre et les crochets `dbg*` n'existent pas sur la page : toujours `resize 390×844` avant.

## Vague 2 — la cause du vol lent (12/11, 15 h 10, build 52, 2 courses, 170 s de vol, tout en thermique 2)
| | Images d'écran reçues | Images calculées | Plus petit intervalle (médian) | Vrai coût d'une image (puce) |
|---|---|---|---|---|
| Sol | ~32 /s | 28,8 /s | 27 ms | 16 ms |
| Vol, levier air0 | 34 /s | 22,3 /s | 22 ms | 17 ms |
| Vol, levier fx0 | 30 /s | 29,1 /s | 27 ms | 15 ms |
- **L'écran n'envoie que ~32 images par seconde** (téléphone chaud ; mode économie d'énergie à demander à Sacha). Le jeu, calé sur 30 avec la tolérance d'un écran 60 Hz, SAUTAIT toute image arrivée moins de 25 ms après la précédente : en vol les intervalles tombent à 22-24 ms, d'où 22 i/s.
- **Correctif (cadence.js, `CAD_E30`, `?cad_e30=0`)** : médiane des images d'écran ≥ 24 ms → tolérance d'une demi-période de 30, plus rien ne se saute. Dans le build 53 (`builds/build53.app`, jeu 190663340, cache v1499), COMPILÉ, PAS INSTALLÉ.
- **fx0 tient 29 i/s en vol** (55 s, une course) : sans filtres ni animations CSS les images d'écran arrivent régulièrement. À confirmer ; si oui, alléger le HUD de vol (lesquels : à chercher). **air0 n'aide pas** : le chrono de vol seul n'est pas en cause.
- **La puce met 15-17 ms par image au cran QL 10**, au sol comme en vol : ce n'est pas elle qui fait la différence sol/vol.
- **Reste à comprendre** : la règle de qualité descend au cran 10 et cale sur 30 parce qu'elle lit des images de 33 ms alors que c'est l'écran qui est à 30 (`loop._r30` ne le voit pas). Sans mesure téléphone froid avec les nouveaux compteurs, on ne sait pas si l'écran est à 30 aussi en thermique 0-1 (les builds 50-51 ne comptaient pas les images d'écran).

## Vague 2 — CORRECTION du bilan de 15 h 10 (12/11, 15 h 50)
- **Le tableau de 15 h 10 se trompait sur les images d'écran en vol** : la première seconde de chaque course comptait aussi celles du menu. Recompté (plafond à 70 par seconde), build 52 : sol 29,9 reçues / 28,7 calculées ; **vol 24,6 reçues / 23,5 calculées** ; vol en base 21,8 / 20,9 ; vol `air0` 23,8 / 22,3 ; **vol `fx0` 29,6 / 29,1**.
- Donc en vol c'est l'ÉCRAN lui-même qui livre moins d'images (le fil principal de WebKit est occupé), et le saut d'images de la cadence n'en coûtait qu'une par seconde. **Le correctif `CAD_E30` reste juste mais mineur. La vraie cause mesurée du vol lent = le CSS du HUD** (filtres, animations, transitions) : sans lui le vol tient 29 i/s.
- Sacha confirme : **iPhone en mode économie d'énergie**, et « ça doit marcher même en économie d'énergie ».
- Build 53 (17 s de vol seulement) : 28,9 i/s en vol — trop court pour conclure.
- **Build 54 COMPILÉ, PAS INSTALLÉ** (`builds/build54.app`, jeu f8a845b7f, cache v1501) : (1) l'app dit au jeu qu'elle est en économie d'énergie (`window.__ccEco`, `GardeThermique`, `NSProcessInfoPowerStateDidChange`) ; (2) `CAD.eco` = économie d'énergie ET écran à ~30 : une image de 33 ms est lue comme à l'heure (`ms9`), être calé ne fige plus l'échelle de qualité sauf téléphone chaud, la qualité remonte si 3 images sur 4 sont à l'heure ; `?eco=1` au banc ; (3) leviers `anim0` (ni animation ni transition) et `filtre0` (aucun filtre) pour savoir lequel coûte. **Rien de (2) n'a pu être vérifié sur le Mac** (le volet caché est trop lent au départ d'une course : le jeu s'y cale tout seul) : seule la boîte de vol du téléphone dira si le cran QL remonte.
- Piège d'analyse : toujours plafonner `R[0]` (images d'écran) par seconde, la première seconde d'une course est gonflée.
- Suite : lire `anim0` / `filtre0`, puis alléger le HUD de vol pour de bon (sans changer son dessin : `transform` au lieu de `width`, ombres de texte au lieu de `filter`, animations en pause hors écran).

## Vague 2 — build 54 lu, HUD sobre (12/11, 16 h 20)
Build 54, 3 courses (toutes tirées « base », 303 s de vol, `eco` = 1 confirmé par l'app) :
| État | Sol | Vol | Cran QL | Calé |
|---|---|---|---|---|
| thermique 1 (42 s sol, 27 s vol) | 28,5 i/s | **28,6 i/s** | 3 à 5 | 2 à 22 % |
| thermique 2 (170 s sol, 276 s vol) | 27,6 i/s | **22,5 i/s** | 10 | 100 % |
- **L'économie d'énergie est réglée tant que le téléphone n'est pas chaud** : la qualité reste au cran 3 (elle tombait à 10), le jeu ne se cale plus, et le vol tient 28,6 i/s. Peu de secondes : à confirmer.
- **Téléphone chaud (thermique 2) : le vol retombe à 22,5 i/s**, même au cran 10. L'iPhone est branché au Mac (il charge, donc il chauffe) : c'est le régime dominant des parties de Sacha.
- **LE HUD SOBRE** (`css/hud-da.css`, `cadFin`, `?sans=hudsobre`) : sur un vrai téléphone CHAUD, en course seulement, `body.hudSobre` coupe filtres, animations et transitions — ce que le levier `fx0` a mesuré à 29 i/s en vol contre 21-23. Vérifié au volet : posé à `dbgThermique(2)` en course, retiré au refroidissement et en quittant. **Pas vu à l'écran** (une capture met le jeu en pause) : à juger par Sacha sur le téléphone. Dans un build de mesure, une course à levier garde son levier ; la course note `hs:1`.
- Build 55 = ce correctif (cache v1502). `anim0` / `filtre0` n'ont encore aucune course : quand ils en auront, rendre au HUD ce qui est innocent.

## Bug de musique (12/11, 16 h 45, Sacha : « la musique est au moins palier 15 alors que je suis palier 4 »)
Morceau en cause d'après la boîte noire : `figée pal-aura-30`. `joueurPaliers.regle(m)` (`assets/audio/pouce-bleu-jeu.js`) reçoit le palier DU MORCEAU (`pbjTier`, départ 6 pour AURA et ASPHALTE) et le relisait comme un moteur du jeu (3 moteurs par fichier) : le départ comptait deux fois. Simulé : AURA moteurs 1-10 → avant 9 12 12 12 12 14 14 14 17 17, après 6 6 9 9 9 9 12 12 12 12 (voulu 6 7 8 8 9 10 11 12 13 13) ; les morceaux qui partent du palier 1 ne changent pas (1 moteur sur 30). Corrigé : en figé, le fichier dont le palier rendu (`F.paliers`) est le plus proche. `?v=16`, cache v1503, dans le build 55 recompilé (jeu 9cb49ed7a). **Vérifié par simulation, pas écouté.** Ce fichier sert aussi au site sur téléphone : le correctif vaut pour `main`.

## Figures lentes + bandes de bord (12/11, 17 h 15) — build 56
- **Figures** (Sacha : « le système de figure est très lent aussi »). Boîte de vol, toutes parties : figure en base 15,9 i/s (59 s, travail JS 11,2 ms) ; `filtre0` 28,0 (10 s) ; `fx0` 28,7 (6 s) ; `anim0` 24,7 (6 s). Les FILTRES CSS sont le premier suspect. Lus dans le CSS : contours de texte en chaînes de 4 à 6 `drop-shadow` sur des compteurs réécrits à chaque image (`#cashHud .chV span`, `#avVal`, `#avX`, `--contourH` sur `#slam9 b`, `#verdHud b`, `#popTxt`, `#lvlNum i`), lueur `drop-shadow` sur `#fh .fhNom .fhD`.
- **LE CYCLE** (`BV.CYC`, `c.V`) : dans le build de mesure, les réglages tournent toutes les 6 s dans la même course : base · filtre0 · anim0 · texte0 (compteurs sans contour) · fig0 (HUD des figures et grands textes sans filtre, ombre ni animation) · fx0. `analyse-vol.py` a le tableau « LE CYCLE ». Le HUD sobre ne s'applique pas pendant un cycle. Une ou deux courses avec figures suffisent.
- **Bandes de bord de route** (Sacha : « rendent mal à une certaine distance ») : c'était l'absence de `main`. **`origin/main` v1498 fusionné dans `ios-ultime`** (8772cc558, cache v1505) : traits épaissis au loin (`uRas9`, `?sans=traits`), joystick, grotte. Seul conflit : `sw.js`. Les mesures à partir du build 56 ne se comparent plus au pixel près aux builds 50-55.
- Build 56 = cycle + fusion + musique + HUD sobre + économie d'énergie.

## Décisions de Sacha et correctifs du 12/11, 18 h — build 57, et `main` v1499
- **Écriture allégée en permanence** (« à part pour l'écriture TRIPLE MONSTER je préfère l'écriture allégée, garde celle-là tout le temps ») : `html.ecrLeger` (vrai téléphone), aucun filtre CSS dans `#hud`, `#pwrChip`, `#touchCtl`, sauf `#frenTitre`. `?sans=ecrleger`.
- **HUD contemplatif** (« quand le joueur relâche le nitro pendant 0,9 seconde on peut faire disparaître tout le HUD sauf le bouton pause — pour un côté contemplatif ») : `body.hudCalme`, `hudCalmeTick` (cadence.js, appelé dans loop). `#hud`, `#touchCtl`, `#pwrChip`, `#ajVols` en opacité 0 (toujours touchables : vérifié, un appui sur NITRO invisible relance le nitro et le HUD) ; `#tSet` (pause) intact. Pas pendant l'auto-école ; le HUD revient si le chrono de vol passe à l'urgence (choix de Fable, à confirmer). `?sans=hudcalme`.
- **Bords lumineux à éclairage constant** (« rendent mal à cause de la feature où ils doivent bouger comme le nitro : qu'ils gardent le même éclairage en permanence ») : sur téléphone (`ALLEGE`), `bmapBoost` ne pose plus le jeu de lumière du boost (`code/maps/ville-nuit.js`). L'ordinateur garde le scintillement de Léo. `?bordsboost=1`.
- **Bug « CHAÎNE PERDUE » en pleine partie** : causé par les builds 55-56. Retirer une classe qui posait `animation:none` (HUD sobre à chaque pause/refroidissement, cycle de mesure toutes les 6 s) RELANCE l'animation de tout élément resté `.on` : `#slam9` rejouait sa dernière annonce, celle de la mort d'avant. Corrigé : HUD sobre éteint (`?hudsobre=1` au banc), boîte de vol sans levier d'interface (`TIR:['base']`). **Leçon : ne jamais poser/retirer `animation:none` en cours de jeu.**
- **Poussé sur `main`** (575a76a92, cache v1499, copie `~/cash-car/pub-main-hud`, branche `pub-hud-calme`) : écriture allégée, HUD contemplatif, bords fixes, correctif de musique figée. PAS sur main : économie d'énergie (`CAD.eco`), `CAD_E30`, boîte de vol, natif, correctifs debug-gameplay.
- Build 57 (jeu ee5268bdd, cache v1507) = tout cela + économie d'énergie + main v1498.
- Reste à savoir : avec les filtres retirés en permanence, le vol téléphone chaud tient-il 29 i/s sans couper les animations ? La boîte de vol du build 57 le dira (toutes les courses sont « base »).

## Build 57 lu (12/11, 18 h 30) — écriture allégée, 2 courses, téléphone en thermique 3 (critique), économie d'énergie coupée
| Phase | Secondes | Images calculées | Travail JS | Coût puce | Cran QL |
|---|---|---|---|---|---|
| Sol | 77 | 28,9 /s | 10,6 ms | 23 ms | 10 |
| Vol | 28 | 27,6 /s | 11,0 ms | 22 ms | 10 |
| Figure | 10 | 25,7 /s | 9,6 ms | 21 ms | 10 |
- **Même téléphone au pire état de chaleur, le vol tient 27,6 i/s et la figure 25,7** (avant : 17-22 en vol, 15,9 en figure, à chaleur moindre). L'écriture allégée fait le travail sans toucher aux animations. Peu de secondes : à confirmer.
- **Le téléphone est monté en thermique 3** (71 min de jeu cumulées, branché donc en charge). À ce niveau le processeur et la puce sont bridés par iOS (travail JS 10-11 ms au lieu de 6, puce 22 ms au cran 10). Le prochain gisement est la CHALEUR, plus le HUD.
- Sacha (18 h 25) : la barre de flow (`#flowHud`, `#flowGlow`, enfants directs de `<body>`, comme `#fil` et `#campChip`) échappe au HUD contemplatif — **il reprend ce sujet dans une autre session ; ne pas y toucher ici.** Cette session = optimisation seulement.
- À faire : une mesure téléphone FROID et débranché (rebrancher pour lire), avec et sans économie d'énergie ; puis chercher ce qui chauffe (durée de jeu avant thermique 2, coût puce au cran 0 contre cran 10).

## Vague 3.1-3.2 (12/11, 19 h) — le modèle de l'iPhone choisit la qualité — build 58
- Relecture du build 57 (5 courses, 85 s de vol) : toutes en thermique 3, téléphone branché ; vol 28,3 i/s, sol 29,4, figure 24,9. Journal système au même moment : budget thermique 250, état 2. Pas de mesure à froid : Sacha a rejoué tout de suite.
- **3.1 fait** : `JeuViewController.webViewConfiguration(for:)` pose un `WKUserScript` au début du document : `window.__ccAppareil` et `window.__ccEco` existent avant la première ligne du jeu. `swiftc -parse` propre, compilé dans le build 58, **pas vérifié sur le téléphone** (lire `app` et `pal` dans la boîte de vol, ou `dbgPalier().src`).
- **3.2 fait pour la table** (`code/rendu/palier-appareil.js`, source « modèle », avant la taille d'écran) : iPhone≤10,x → ANCIEN ; 11,x et 12,x → MOYEN ; ≥ 13,x → RÉCENT (réglages d'aujourd'hui). `?appareil=iPhone12,8` au banc. Vérifié au volet : iPhone10,4 → 0, iPhone12,8 → 1, iPhone17,1 → 2, sans modèle → inchangé (banc).
- **3.2 NON fait : la remontée automatique (`MOB_R`) reste éteinte.** Elle a été coupée le 07/11 pour 15 gels > 1 s en course (les bascules réallouent les cibles) ; la rallumer sans pouvoir la mesurer sur un téléphone froid serait un pari. À faire quand une série à froid sera possible : préparer les deux tailles de cibles, puis `?mob_raise=1` en A/B.
- Cache v1508.

## Build 58 lu + L'AUTRE MUSIQUE (12/11, 19 h 40) — build 59
- **Build 58, 1 course, téléphone FROID (thermique 0), économie d'énergie ON** : sol 28,7 i/s, vol 29,8, figure 29,2, crans QL 0-1 (pleine qualité). `app` = iPhone14,2, `pal` = 2. C'est la première mesure à froid : en économie d'énergie le jeu tient le plafond de 30 partout, sans baisser l'image. (54 s : à confirmer.)
- **L'AUTRE MUSIQUE** (Sacha : « la musique ne doit pas se lancer quand on lance le jeu avec de la musique : c'est le son du jeu qui se coupe, même l'intro »).
  - Natif (`GardeThermique.autreSon`, `AVAudioSession.isOtherAudioPlaying`) : lu au lancement (posé au début du document : `window.__ccAutreSon`) et à chaque retour dans l'app (`willEnterForeground`) ; quand il est vrai, relu toutes les 5 s pour annoncer la fin (`cc:autreson`). Jamais relu pendant que le jeu joue (le son de la page sort du processus WebKit : iOS pourrait le compter comme « un autre »).
  - Jeu : `sauvegarde.js` démarre avec `SND.sfx` et `SND.music` à faux si `__ccAutreSon` = 1 ; `autreSon(v)` (`son/curseurs.js`) coupe ou rend SON et MUSIQUE pour la session, sauvegarde intacte. `?sans=autreson`, `dbgAutreSon(0|1)`.
  - Choix de Fable à confirmer : TOUT le son du jeu est coupé (bruitages compris), pas seulement la musique ; il revient seul dans les 5 s qui suivent l'arrêt de l'autre musique.
  - Vérifié au volet : `dbgAutreSon(1)` coupe, l'événement rend, la sauvegarde ne bouge pas. **Le natif n'est pas vérifié** (compile ; à essayer avec Spotify ou Apple Music lancé avant le jeu).
- Cache v1509.

## Retours de Sacha sur le build 59 + PÉRENNITÉ (12/11, 20 h 30) — build 60
- **« J'ai mis pause et le son s'est coupé sans relancer »** : pas de trace dans la boîte noire. Première suspecte, ma détection de l'autre musique au RETOUR dans l'app (`willEnterForeground`) : au retour, iOS peut compter le son de la page (processus WebKit) comme « un autre », et le jeu restait muet. **Retirée** : l'autre musique ne se lit plus qu'au lancement. Une ligne `son | autre musique …` est écrite à chaque bascule. **Non reproduit : si le son se recoupe après une pause sur le build 60, la cause est ailleurs** (reprise du contexte audio après le compte 3-2-1, hors geste) — demander à Sacha les gestes exacts.
- **« Je suis mort en traversant la route dans la map grotte glace »** (`grt-glace-luxe`, partie n°4 du build 59, 410 s) : la cause n'est écrite nulle part. `node outils/banc-routes/grotte.cjs 0 1-12` : 0 conflit, 0 contact sur 12 graines — la route générée est saine. **La boîte noire note désormais chaque mort sur téléphone** (`mort | cause · map · s · décalage · vol · km/h · mode · y`, `code/gameplay/mort.js`) : relire après la prochaine.
- **PÉRENNITÉ — le vrai risque est la MÉMOIRE.** Boîte noire du jour : la page a été tuée DEUX fois dans la même session (« processus web tué », 17:21 juste après une fin de course, 18:51 au lancement). Rapport système `com.apple.WebKit.WebContent.cpu_resource-2026-11-12-153551.ips` (copié dans `~/cash-car/ios-ultime-mesures/cpu-1112-1535.ips`) : **empreinte du processus de la page 1 247 → 1 329 Mo (+82 Mo en 165 s)**, 55 % de processeur. Aucun `JetsamEvent` du jour dans les rapports, donc la mort par mémoire n'est pas prouvée, mais 1,3 Go est la zone où iOS tue. Le tas JavaScript seul, mesuré sur le Mac (Chrome, `performance.memory`), ne fait que 170 à 216 Mo : le gros est AILLEURS (tampons audio décodés, tableaux des géométries, images et toiles 2D, code compilé) — **non mesuré**.
- À faire pour la vague 4 (mémoire) : (1) un build SANS `COMPLET=1` pour savoir ce que pèse l'édition App Store ; (2) inventaire des tampons audio décodés (banque de sons, 3 boucles de musique figée) et des toiles 2D gardées ; (3) libérer les tableaux des géométries après envoi à la puce quand ils ne servent plus ; (4) suivre l'empreinte par les rapports `cpu_resource`/`JetsamEvent` après chaque séance de Sacha.
- Cache v1510.

## Compteur d'argent : chiffre transparent à mi-saut (12/11, 21 h) — build 61, `main` v1504
Sacha : « il y a souvent un bug sur le compteur de cash où un chiffre reste transparent entre deux positions ». Effet de bord de l'écriture allégée : la frappe du total (`hfCashA/B`, `hud-fini.css`) anime un saut de 3 px ET un filtre en 3 crans, relancée à chaque pièce ; `filter:none!important` interdisait le filtre mais son animation tournait toujours, et WebKit laissait parfois un chiffre du texte en dégradé (`background-clip:text`) non repeint. Correctif (`css/hud-da.css`, script `~/cash-car/ios-ultime-mesures/outils/pose-cash-leger.py`) : sous `html.ecrLeger`, frappe `ecLCashA/B` en position seule + `will-change:transform` sur `.chV`. Vérifié au volet que la règle s'applique (animation `ecLCashA`, filtre `none`) ; **le défaut lui-même est propre à WebKit : non reproduit, à confirmer par Sacha.** Une quarantaine d'autres animations du jeu animent aussi un filtre : si un autre texte du HUD montre le même défaut, lui donner la même jumelle sans filtre.
Poussé sur `main` (4f68e1101, cache v1504 ; `main` avait avancé à v1503 par d'autres sessions) et sur `ios-ultime` (cache v1511). Build 60 installé à la demande de Sacha (46 courses sauvegardées).

## Gels du Pic de Jade, lag de la grotte, boîte de vol pleine (12/11, 22 h) — build 62
- **Morts enregistrées (build 60)** : `pic · map jade · 1236 km/h · fall` ; `roche · map grotte · s 1011 · décalage 29 m · vol 1,1 s · 815 km/h · fall · y -23` — la mort « en traversant la route » de la grotte ressemble à une sortie de 29 m en vol contre la roche, pas à un trou dans la dalle (une seule mort relevée : à confirmer).
- **« Beaucoup de freeze dans la map Pic de Jade »** : boîte de vol, build 60, téléphone en thermique 3 : 69 secondes sur 115 avec une image ≥ 120 ms, pire 849 ms, travail JS 20-30 ms par image. **Profilé** (profileur JS de Chrome, `~/cash-car/ios-ultime-mesures/outils/serveur-profil.py` + config `cashcar-ios-ultime-profil`, `new Profiler(…)` dans la page) : pendant la course dans le jade, `prebTick → prebJob → prebDecorG → buildGrotteG → grtLacs` = **19,8 % de tout le temps du fil principal** — c'est la GROTTE SUIVANTE que le pré-bâti construit, et ses lacs parcouraient tous les blocs d'un trait. **Corrigé** : `grtLacsG`, générateur avec rendez-vous `JF.lim` tous les 8 blocs (`grottes-1.js`, `grottes-2.js`). Vérifié : la grotte se bâtit (lacs 122 ms, 21 piliers, 579 lumières cuites), `grotte.cjs` 0 conflit. **L'après n'a pas pu être profilé** (les deux passages suivants n'ont pas tiré de grotte après le jade).
- **« Beaucoup de lag dans la map grotte »** : pas de donnée téléphone (voir boîte pleine). Profil Mac d'une course en grotte : fil principal occupé 24 % (10 % dans les nuages), presque tout dans le rendu three.js (`render` 15,5 %, `setup` 11,7 %, parcours de la scène) : 1 065 tronçons et 4 328 décors à parcourir à chaque image pour 95 appels de dessin. Aucun bloc long (13 ms au pire). Sur un téléphone bridé par la chaleur, c'est ce parcours qui pèse. **Non corrigé** : piste = sortir de la scène les tronçons hors de portée (ils sont déjà rangés par abscisse) au lieu de les laisser au tri de three.js. Boîte noire : le travailleur a mis 21,9 s à creuser une grotte (11,5 s d'habitude) pendant que le téléphone était chaud.
- **La boîte de vol était PLEINE** : 0 course écrite sur le build 61 ; 48 courses remplissaient le stockage (≈ 5 Mo, partagé avec la sauvegarde du joueur) et le repli effaçait des clés inexistantes. Corrigé : 16 courses gardées, purge au lancement, et quand l'écriture échoue les plus vieilles partent une à une (simulé). Les 48 courses sont sur le Mac (`vol/vol-1112-*.json`).
- Cache v1513.

## Le lag de la grotte : pas de correctif, et pourquoi (12/11, 23 h)
- **Sur les parties enregistrées, la grotte n'est pas plus lente que les autres maps** (courses d'une seule map, builds 52+) : grotte téléphone froid 29,2 i/s (1,9 % de secondes avec une image ≥ 120 ms), chaud 30,7 i/s (5,4 %) ; canyon 29,6 / 28,5 ; espace 29,3 / 29,9 ; ville 27,7 / 28,2 ; nuages chaud 21,9 i/s et 31,7 % de gels (une course en thermique 3). Le lag que Sacha a senti sur le build 61 n'a pas de course à lui dans la boîte de vol.
- Profil Mac d'une course en grotte : fil principal occupé 24 % (10 % dans les nuages), dont 9,7 % dans UNE fonction de three.js, la vérification des attributs avant chaque dessin (`WebGLBindingStates.setup` → `needsUpdate`, `three.min.js` ligne 6 colonne 243895). Cause non établie : les formes de la grotte n'ont que 3 attributs (`position`, `aF`, `aL`), donc ce coût vient du NOMBRE de dessins, que je n'ai pas réussi à compter (le compteur du jeu, 95 à 121 appels, ne voit que la dernière passe ; mes crochets sur `drawElements` n'ont rien compté). Aucun bloc long (13 ms au pire).
- Les tronçons hors du brouillard sont DÉJÀ cachés à chaque image (`grotteTick`, « LES TRONÇONS : cachés au-delà du brouillard ») : la piste « sortir de la scène ce qui est loin » était déjà faite.
- **Décision : pas de changement dans la grotte sans une course en grotte mesurée sur le build 62.** Les gels viennent d'abord de la chaleur (thermique 2-3 presque en permanence, téléphone en charge) et du pré-bâti de la map suivante (corrigé pour les lacs). Suite utile : passer le pré-bâti de CHAQUE map au profileur (plus long bloc occupé pendant `prebJob`), comme pour `grtLacs`.

## Nouvelles maps de main v1510 testées : nuages, ville, canyon (12/11, minuit) — build 63
`origin/main` 1f3a5df72 (v1510 : salto, nitro bleu, Crypto City mouillée, nuages et ville repris, routes, HUD contemplatif repris par une autre session) FUSIONNÉ dans `ios-ultime` (2a6e85281, cache v1514). Conflits : `hud-da.css` (bloc HUD sobre retiré), `grottes-1.js` (commentaire), `boucle-3-physique.js` (ligne `vg9` de main + `VIS_R2` de l'app), `boucle-6-hud.js` (appel de la boîte de vol gardé), `sw.js`. Aucun bloc en double après fusion ; 4 gardes vertes ; course lancée sans erreur.
| Map | Routes (`toutes.mjs`, 3 paliers × 4 graines) | Profil 40 s (Mac, `?tel=1`) | Erreurs |
|---|---|---|---|
| Nuages | 12 routes, 0 infraction | fil occupé 15,4 %, 1 bloc ≥ 25 ms (50 ms, `lierCourseRendu`), portail vers le canyon passé | 0 |
| Ville | 12 routes, 0 infraction | occupé 20,2 %, 5 blocs ≥ 25 ms (pire 73 ms), portail vers l'espace passé | 0 |
| Canyon | 12 routes, 0 infraction | occupé 18,4 %, aucun bloc ≥ 25 ms (pire 14 ms) | 0 |
- **Le correctif des lacs est confirmé** : pendant la ville, le pré-bâti a construit une grotte (`buildGrotteG` 5,5 %, `grtLacsG` 4,7 % du temps, étalés) sans bloc long — le pire bloc du passage n'est plus les lacs.
- Blocs de la ville à connaître : 73 ms `japDecoupe` (`voitures/japonaises-2.js` : la construction d'un modèle de voiture, une fois), 49 ms `chauffeRendu`, 37 ms `strip` (pré-bâti), 29 ms `villeRose`/`contiMap`. Sur un téléphone chaud, ×4 à ×6. Non traités.
- Ce banc ne juge ni l'image ni la fluidité sur téléphone : il compte les erreurs et les blocs du fil principal. Build 63 (`builds/build63.app`) compilé, PAS installé.
- Outil : le profil se lance dans la page par `__prof(sec)` (collé à chaque chargement, voir cette session) et se relit dans `window.__res` (un appel de plus de 45 s est coupé par le volet).
- Shaders (« améliore les shaders sans affecter la fluidité ») : état des lieux seulement. La passe finale a déjà FXAA, tramage, coude des hautes lumières, netteté, halo fusionné, flou par mips. Rien changé sans une cible précise de Sacha.

## Passe autonome du 13/11 (Sacha : « attaque-toi à tout, bosse un peu tout seul ») — build 64
- `origin/main` d6ba264b0 (route sans écailles au loin remise) fusionné : `ios-ultime` 8844a2cbe, puis cache v1516.
- **Gel à l'arrivée au menu** (boîte noire, toutes versions : 1,5 à 13,6 s, classes `inGarage garMenuH titreCiel` ; 6,5 s sur le build 62, avec deux décrochages du son) : **la cause n'est toujours pas connue.** Le lancement ne se profile pas sur le Mac (volet masqué : ni l'intro ni le banc automatique ne démarrent). Fait : dans un build de mesure (`ccPerfRecOn` = 2), la sonde de lancement (« serpent », `code/page/debut-corps.html`, `GUET_MENU`) reste ouverte jusqu'à 25 s après le premier menu (150 s au plus, 34 lignes) : chaque trou > 120 ms y est attribué (rappel JS long, appel WebGL bloquant et sa pile, fil bloqué ou libre). Vérifié au volet : la sonde note jusqu'au menu, se ferme, la course démarre, aucune erreur. **À lire après le prochain lancement de Sacha : lignes `serpent` de `lire-banc.sh`.**
- Blocs de la ville : `japDecoupe` (73 ms) n'est pas la file des photos (elle ne tourne qu'au garage) ; origine non cherchée, une fois par course.
- Pas d'autre changement de jeu dans cette passe : ni la mémoire (1,3 Go) ni la chaleur ne se traitent sans mesure téléphone.

## PANNE DE RENDU au départ — `main` est cassé aussi (13/11) — build 65
- Sacha (build 64) : « quand j'ai appuyé sur JOUER la voiture a commencé à tomber puis l'écran s'est figé ». Boîte noire : `panne | rendu · undefined is not an object (evaluating 'a.needsUpdate')`, puis `mort | vide · map orage` 15 s plus tard (la partie continuait sans image).
- **Cause** : `code/maps/ville-nuit.js:181` donne au matériau des bords `sh.uniforms.uAA9=TRAIT_U.uAA`, mais `TRAIT_U.uAA` n'existe plus dans `code/rendu/bitume-beton.js` : la fusion 63a3370f de `main` (« Crypto City mouillée ») a repris une ANCIENNE copie du fichier et perdu les « bandes sans escalier » (5863a4758, branche `bandes-aa`). Le commit d6ba264b0 a remis la route sans écailles, pas `uAA`. Trouvé en instrumentant `WebGLUniforms.upload` dans three.js (annulé ensuite).
- **`origin/main` a la même panne** (vérifié : `uAA` absent de `bitume-beton.js`, présent dans `ville-nuit.js`, encore à 2d245d301 / v1512). Correctif prêt, NON poussé : `~/cash-car/pub-main-hud`, branche `pub-hud-calme`, 3f462573a (cache v1513).
- **Corrigé sur `ios-ultime`** (4678c675e, cache v1517) : `git show 5863a4758 -- code/rendu/bitume-beton.js | git apply --3way` (propre, `ROUTE_MIP` gardé). Vérifié au volet : ville et orage avec la chute de départ, aucune panne, `dbgTraits()` = [1,1].
- « Sans vibration » (branche `sans-vibration`, 870fab1ba, qui ne touchait que `index.html`) reporté dans `code/moteur/boucle-3-physique.js` (`spdSh=0`).
- **Pièges de banc découverts** : (1) le service worker du jeu met `vendor/` en cache sur les ports locaux : pour tester un fichier modifié, `serviceWorker.getRegistrations()` → `unregister()`, `caches.delete`, et le serveur `cashcar-ios-ultime-profil` (no-store) ; (2) `dbgErreurs()` rend l'HISTORIQUE (localStorage) : regarder `t` et `n`, pas seulement la présence ; (3) mes tests des maps d'hier filtraient `erreur|exception` et pas `panne` : **toujours inclure `panne`**.
- La sonde du menu (build 64) a bien tenu : « fin du guet à 47,4 s », 10 trous au lancement, le pire 604 ms — et AUCUN gel long à l'arrivée au menu sur ce lancement (pas de ligne `gel`). À relire sur d'autres lancements.

## Jade sans mer fusionné (13/11) — build 66
`origin/main` 3f462573a (v1513 : Jade sans mer + le correctif `uAA` poussé par cette session) fusionné dans `ios-ultime` (930760aa4, cache v1518) ; seul conflit `sw.js`. `uAA`, `grtLacsG`, `hudCalmeTick` présents une fois ; 4 gardes vertes. Testé au volet, service worker vidé, historique des pannes nettoyé avant : Pic de Jade midi et nuit, course lancée, **0 panne, 0 erreur** (`panne|erreur|exception|boucle|promesse`). Les morts relevées (`air · map jade · décalage ±28 m · vol 6 s`) sont celles du banc : la caisse roule sans pilote les 16 premières secondes et sort par le bord ; sans mer, elle meurt de 6 s en l'air au lieu de tomber à l'eau. Build 65 installé (panne `uAA` corrigée), `main` = 3f462573a.

## Rotation sans écran noir + son perdu au retour (13/11) — build 67
Sacha (build 66) : « quand on passe de verticale à horizontale ça doit être plus fluide, pas d'écran noir » · « quand on quitte l'appli et qu'on revient il n'y a plus de son ».
- **Rotation.** Boîte noire du build 66 : `serpent | 17.1 s : trou 1517 ms · JS minuteur remesure 459` au moment du pivot (pendant l'intro), toile recréée en 1266×585. Dans le jeu : la retaille (`palier-appareil.js`, écouteur `resize` regroupé) EFFACE la toile, noire jusqu'à l'image suivante (≥ 66 ms au menu au repos) ; puis `reflow` (+280 ms, `mobile-tactile.js`) appelait `applyDPR`, dont le `setPixelRatio` retaillait une seconde fois à la même taille. **Corrigé (vrai téléphone, `ROT_DOUX`, `?sans=rotation`)** : `retailleImage()` (`init.js`) rejoue une image complète dans la tâche de la retaille ; `applyDPR` ne touche au ratio que s'il change. Jamais appelé depuis `applyDPR` lui-même (la règle de qualité l'appelle depuis la boucle). Vérifié au volet : pivot au menu et en course dans les deux sens, toile à la bonne taille, partie qui continue, 0 panne. **Le noir lui-même n'est pas visible au banc : à juger sur le téléphone.** Reste hors de portée du jeu : l'animation de rotation d'iOS et le trou de 1,5 s de l'intro (`remesure`), non traité.
- **Son perdu au retour.** Pas de trace dans la boîte noire (les messages `dit(…)` de natif.js ne vont qu'à la console). Lu : `AppDelegate.relacheSessionAudio` ne tourne jamais (manifeste de scènes) ; `SceneDelegate` ne fait que `setActive(true)` au retour ; le retour du son dépend d'une chaîne `ccActif` → `releve` / `visibilitychange` → `acReveil` (refusé si en pause) / premier toucher. **Cause non établie.** Fait : LE VEILLEUR DU SON (`natif.js` § 4 quater + `__ccSonVeut` / `__ccSonReveil` dans `graphe-audio.js`) : toutes les 1,5 s, page visible depuis 2 s, il relève un fondu resté baissé, remet un gain de sortie < 0,9, relance un contexte `interrupted`/suspendu sans raison, réveille le contexte du jeu quand le jeu veut du son — et écrit ce qu'il a trouvé (`son | veilleur : …`, 6 lignes par session). Non testable hors téléphone : **lire ces lignes après le prochain aller-retour de Sacha** ; si le son manque encore sans ligne « veilleur », la panne est côté session audio native (WebKit croit jouer).
- Cache v1519.

## 8. Peut attendre (remise à zéro du forfait, ou mise à jour en direct)
Vague 4 sauf la séance longue ; retours haptiques et finitions « Arcade » (réglages, manette) ; tailles de texte fractionnaires (P-05) ; rendu figé de tous les morceaux ; audit complet de la sauvegarde et du tactile (non faits : l'audit à 16 axes a été arrêté avant de rendre).

## 9. Ce que ce plan ne couvre pas
L'audit large (16 axes) et le rapport des bancs n'ont pas abouti : les enchaînements d'états, la sauvegarde, le tactile et la conformité App Store ne reposent que sur les rapports d'avant (`passation/debug-gameplay/`, `passation/APP-STORE.md`). Les causes du vol sont des **suspects lus dans le code**, pas des faits : c'est la boîte de vol qui tranche.

## 12/11 soir — suite du plan après le build 67 (rotation + son validés par Sacha : « parfait »)

- **Édition App Store vérifiée** : `node preparer-www.js` sans COMPLET ni --qs → 247 fichiers, 28,9 Mo, outils de mesure inertes.
  `natif.js` purge maintenant aussi les vols `ccBV*` / `ccBVn` hors build de mesure (un testeur passé d'un build de mesure à l'édition boutique ne garde rien).
- **Petits écrans** (volet intégré, 320×568 et 375×667, `?tel=1`) : accueil, réglages, missions, offres, garage, inventaire, course, écran de mort — aucun débordement, aucun texte coupé. Rien à corriger.
- **Perte de contexte WebGL (4.4)** : relue, déjà complète (`palier-appareil.js` 190-201 : sauvegarde + pose de la partie, rechargement au contexte rendu, filet à 5 s si jamais rendu, compteur de pertes rapprochées → écran « a calé » à la 4e au lieu d'une boucle). Rien à changer.
- **Boîte noire du build 67** (lancement de 21 h 20) :
  - arrivée au menu : trous de 140 à 360 ms seulement (29 trous > 120 ms en 54 s, hors rotation) — pas de gel long cette fois ; le gel de 6,5 s du 19 h 44 suivait un redémarrage après page tuée (garage).
  - les deux trous de 1,3-1,4 s viennent du téléphone TOURNÉ PENDANT L'INTRO : `remesure` → `prepare()` de `intro-161.js` refait tout le film (logo, fracture) d'un bloc, 400-500 ms de JS. Cas rare, intro = terrain créatif : NON touché, à trancher avec Sacha (figer l'orientation pendant l'intro serait le plus simple).
  - mémoire : textures 113 → 134 en trois parties, géométries 545 → 1102 dans la grotte puis 636 : pas de fuite visible ; aucune page tuée depuis le build 66.
- Reste : 3.3 autres iPhone (simulateur), mémoire WebContent 1,3 Go, remontée `MOB_R`, vague 5 (archive ; rien chez Apple sans le oui de Sacha).
- **Fusion de main v1516** (orbite refaite, boutique, mer de Jade retirée) dans ios-ultime → cache v1520 ; conflit `orbite-2.js` résolu (main : `nuagesTerre()` ; ios-ultime : `ROCHE_COL.v++` et `ORB.durs`). 4 gardes OK, fumée au banc en orbite : 25 s de course, aucune panne.
- **Son, build 67, partie du canyon (21 h 25-21 h 27)** — Sacha : « gros bug de son ». La boîte dit deux choses : (1) 21 h 26 min 18 : deux décrochages audio de 442 et 482 ms en pleine course (gouverneur monté au cran 2), sans trou d'image au même moment ; (2) 21 h 28 : le veilleur a trouvé le fondu de sortie resté BAISSÉ au retour dans l'app (`ccActif` jamais reçu) et l'a relevé — c'est donc bien la cause du « plus de son au retour ». Veilleur resserré : passe toutes les 0,7 s, attend 0,9 s (au lieu de 1,5 / 2 s). Cause des décrochages : inconnue (à creuser selon ce que Sacha a entendu).
- **« Son haché en course » (Sacha, build 67, canyon)** — le vol 63 l'explique : téléphone à l'état thermique 2 TOUTE la session (branché, en charge), image déjà au cran QL 10 (plancher), vrai coût d'une image 26-33 ms, 12-20 i/s (moyenne 18,7 ; pires images 150-530 ms). Le processeur est bridé par la chaleur, le fil audio (tampon de 128 échantillons imposé par WebKit dès qu'il y a du WebAudio — `latencyHint` n'y change rien) saute. Le son haché est la conséquence de la chaleur, pas un bug du son.
  Fait (v1521) : sur l'app, état thermique 2 → charge du son au cran 1 d'office (salle/convolution débranchée, 11 voix), état 3 → cran 2 (8 voix) ; rendu au refroidissement ; `?sonchaud=0`. Non mesuré sur le téléphone.
  Le vrai chantier reste LA CHALEUR (courses 56-63 : 19 à 30 i/s selon les minutes, au plancher de qualité) : coût processeur par image à faire baisser quand `thermo>=2`.
- **Fusion de main v1518 (HUD léger, pouce NITRO, boutique)** → ios-ultime v1522 ; conflit `passe-textes.js` (colonne du HUD) : gardés les trois traits + `HUDCOL.pw` d'ios-ultime ET le `--plMax` du HUD léger.
- **Compteur de l'écran de mort « bloqué entre le 8 et le 9 »** (Sacha, 12/11) : le compteur à rouleaux (`m6Pose`) finissait sa course en mode « roule » sur un gain à virgule (128,7 → le rouleau des unités arrêté à 70 % entre deux chiffres). La dernière pose ne roule plus et tronque comme `fmtSolde` (v1523, aussi pour le ×2). Banc : rouleaux à 0 en fin de compte. À publier sur main sur le oui de Sacha.
- **« Lags au moteur 16, plus de son au moteur 18 » (Sacha, build 69, vol 67)** — une partie de 14 min (858 s), téléphone branché, « serious » dès le lancement : 30 i/s tenues 11 min (travail 4 ms/image, même à 1 000 km/h), puis iOS passe « critical » vers 670 s et bride la puce ×10 (travail 35-55 ms/image, 3-15 i/s) jusqu'à la mort ; le fil du son est étouffé (aucune ligne du veilleur : contexte « running », gain à 1 — c'est le rendu audio qui n'a plus de processeur ; le gouverneur ignore les retards > 3 s). Le moteur 16 n'est que la minute où ça arrive.
  Fait (v1524, `?mob_long=0`) : avec le capteur, 150 s de course cumulées en serious → palier 3 « sérieux qui dure » (plafond 1,1, ciel 1/8 : l'ancien critical) ; critical = palier 4, plafond 0,85. Banc : `dbgThermique(3)` → palier 4, plafond 0,85, sans erreur. NON mesuré sur le téléphone : on ne sait pas si cela suffit à éviter le critical.
  À faire : une partie longue téléphone DÉBRANCHÉ (la charge par le câble chauffe) pour séparer les deux causes ; si le critical arrive encore, il faudra baisser la cadence (24/20 i/s) en serious prolongé.
- **Anti-chaleur, 1er lot (Sacha : « trouve des moyens de ne pas faire monter cette chaleur », v1525)** — lecture des 40 derniers vols : le téléphone (branché toute la journée) est déjà fair/serious/critical 30 s après le lancement dans presque toutes les sessions ; les deux seules parties parties de « nominal » : à 60 i/s nominal tient 26 s et fair 35 s (serious à 61 s, vol 64) ; à 30 i/s (économie d'énergie, 17 h 51) nominal tient 97 s de course et fair 160 s.
  1. `MOB_FAIR30` (gouverneur-thermique.js, `?mob_fair30=0`) : avec le capteur, la course se cale sur 30 dès l'état FAIR (au lieu de serious). Un téléphone qui reste nominal garde 60.
  2. `HC_FROID` (cadence.js, `?sans=calmefroid`) : la PAUSE dessinait la scène immobile à 60 i/s plein rendu, l'écran de MORT aussi. Pause = 10 i/s ; écran de mort, 3,5 s après la mort = cadence des menus (30, 15 au repos, 60 sous le doigt). Banc (appels de dessin comptés) : pause 10 i/s, mort 17 i/s, reprise 29 i/s, aucune erreur.
  Non mesuré sur le téléphone. Pistes suivantes si le critical arrive encore débranché : cadence 24/20 en serious prolongé ; coût GPU par image (vrai coût 13-20 ms à 30 i/s) ; rAF reçus à 75-120 /s (ProMotion) alors qu'on en calcule 30.
- **Fusions de main du 12/11 au soir** : v1522 (canyon refondu, plus aucun tremblement, lunette arrière) puis v1524 (HUD calme : argent, moteur et textes d'effets gardés ; grands modules des nuages) → ios-ultime v1527. Sacha : il ne reste que le Pic de Jade à arriver, « sinon on a la version finale ».
- **Canyon refondu, mesuré au banc (`?tel=1`, palier 2, midi)** : en course 90-141 appels, 252-385 k triangles (dont 96 k de bitume, commun à toutes les maps ; le décor du canyon ≈ 10 k), calcul léger (79 % de temps libre sur 20 s, aucun trou > 60 ms), aucune panne, aucune mort au pilote. Construction : échantillons 94-167 ms (par tranches, d'avance), monde au travailleur, POSE 31-102 ms d'un bloc AU PASSAGE du portail.
  Fait (v1528, `?sans=cyetale`) : `cyMonuments` (canyon-mine.js) pose tout de suite le couloir, le tunnel et l'arche, puis les peupliers, les cheminées, la Route 66 et les éboulis un par image (en course allégée seulement ; hors course d'un bloc comme avant). Banc `dbgCyMonuments()` : bloc immédiat 9 ms, mêmes appels/triangles 0,4 s plus tard, aucune erreur. Non mesuré sur le téléphone ; l'entrée réelle par le portail n'a pas pu être rejouée au banc (`?carte=` ne vaut que pour la 1re map).
- **« Beaucoup de freeze dans la map canyon » (Sacha, build 72, vol 73)** — le téléphone est « critical » dès le lancement (22 h 30, juste après l'installation, branché). Mais à état égal : Jade (vol 72) tient ~30 i/s avec 4 ms de travail par image, le canyon une minute plus tard 9-19 i/s avec 17-40 ms. Et les trois effondrements du soir (vols 63, 67, 73) finissent tous dans le canyon. Le canyon est donc LA map chère à chaud : son relief (`CY_FS`, plein écran, plusieurs lectures de bruit par pixel) sur une puce bridée ; le temps « de travail » gonfle parce que les appels WebGL attendent la puce.
  Fait (v1529) : `cyFS(d)` fabrique le programme par niveau de détail ; `cyDetPose()` à l'entrée du canyon (cyMondePose) prend le niveau 0 si iOS dit serious/critical (note `canyon | détail de la roche au niveau 0` dans la boîte), sinon celui du palier. `?cydet=0|1|2`, `?sans=cychaud`, banc `dbgCyDet(d)`. Banc Mac (toile 312×675, AVANT que la machine sature) : coût GPU médian 4,08 → 3,13 ms, p90 12,6 → 9,0 du niveau 1 au niveau 0 ; changement en course sans erreur. Les mesures suivantes (grille, Jade) sont FAUSSES : charge du Mac à 27.
  Pas fait : la grille du relief (cyGrille, bâtie une fois) et la résolution propre au canyon ; à tenter si le niveau 0 ne suffit pas (lire les i/s du canyon dans le prochain vol).

## 12/11 23 h — LA GRANDE VITESSE (Sacha : « gros problème lors d'un changement de map au palier 17, il faut vraiment bosser sur la grande vitesse »)
Vol 75 (build 73, 22 h 48, 428 s, moteur 18, maps jade → orage → ville → espace → grotte → jade → ville → nuages → grotte — AUCUN canyon ; téléphone « critical » du début à la fin, QL 10, DPR 0,85) :
- 0-180 s (≤ 800 km/h) : 30 i/s, travail ~4 ms par image.
- à partir de ~210 s, dès que la vitesse dépasse ~700 km/h : 13-20 i/s, travail 20-40 ms par image ; au-delà de 1 800 km/h : 7-13 i/s, travail 30-50 ms. Moyenne par 30 s : 30·30·30·30·29·29·26·20·17·19·22·13 i/s pour 730·640·660·710·790·820·740·1000·1610·1820·1500·2700 km/h. Le coût du CALCUL par image suit la vitesse (sur une puce bridée) : c'est la génération/pose par mètre parcouru, pas la chaleur seule.
- 22 h 56 min 06, à l'entrée de la GROTTE au moteur 18-19 : **gel de 11,2 s** (boîte noire `gel | 11.2 s | … play figVol`), puis 12 s à 12 i/s (vol 76) et la mort. Le soir même : `grotte | travailleur | 21770 ms de creusement, attente 21821 ms` (build 72) et 6346 ms (build 69). À grande vitesse le portail arrive avant que la grotte soit creusée : la course ATTEND le travailleur.
Le canyon reste cher à chaud (vols 63, 67, 73), mais la grande vitesse dégrade toutes les maps. Chantier confié à une session à part (branche `grande-vitesse`, `~/cash-car/grande-vitesse`).

## 12/11 23 h 25 — build 74 relu (7 parties, 26 min, téléphone « critical » du début à la fin)
- **Canyon à chaud : réglé.** `canyon | détail de la roche au niveau 0` s'est enclenché (23 h 00). Passages dans le canyon : vol 77 ~30 i/s, vol 82 29-31 i/s (travail 7-11 ms), vol 83 (départ dans le canyon) 32 i/s (travail 10-11 ms) — contre 9-19 i/s et 17-40 ms au build 72 dans le même état thermique. On garde le niveau 0 en serious/critical.
- Toutes maps confondues, à l'état critical : 20 à 34 i/s (le plus souvent 25-31), travail 7-24 ms, vrai coût 13-37 ms. Vol 83 : moteur 25, jusqu'à 3 250 km/h, 20-29 i/s.
- **Grotte : l'attente du travailleur revient 6 fois** (`8408 ms de creusement, attente 20619 ms`) — confié à la session `grande-vitesse`.
- Mémoire : textures 133-139, géométries 483-1138 selon la map, programmes 183-184 sur 7 parties : stable, aucune page tuée.
- Le téléphone reste « critical » pendant toute la soirée (branché, joué en continu) : la mesure à froid et débranché manque toujours.
- Sessions ouvertes par Sacha (« ouvre-en autant que tu veux ») : `interface-opti` et `grande-vitesse` (Opus, un navigateur de banc chacune). Plafond du Mac : 3 navigateurs de banc — donc pas d'autre session à banc ; en plus : `app-store-pret` (Sonnet, lecture seule).

## 13/11 0 h 30 — les branches des sessions fusionnées (ios-ultime v1535, build 75)
Sur le « go » de Sacha : main v1528 (Jade : la chute et l'envers, nuit et pluie ; orbite d'avant par défaut ; HUD : noms des figures, argent à gauche du ⏸, anneau d'atterrissage — conflit `passe-textes.js` : pris `cashXmin()` de main), puis `debug-ultime` (un bug : l'autre musique, v1531 ; rapport `passation/DEBUG-ULTIME.md`), `grande-vitesse` (portail franchi en vol sans gel, pré-bâti de la grotte allégé, voile du serpent pendant une attente ; `passation/GRANDE-VITESSE.md`), `interface-opti` (HUD endormi, reflets sur leur couche, trame de MISSIONS ; `passation/INTERFACE-OPTI.md`).
Vérifié : 4 gardes, 240 routes (`toutes.mjs`), fumée au banc (Jade de nuit au moteur 12-14, portail vers la ville, pause/reprise, mort, compteur — aucune erreur). Rien de cela n'est mesuré sur le téléphone. Reste dit par les sessions : la grotte au moteur 17-20 n'est toujours pas prête à temps sur un iPhone chaud (l'attente se fait maintenant sous le voile au lieu d'un gel) ; le son réel (veilleur, autre musique, allègement à chaud) ne se vérifie qu'à l'oreille.

## 13/11 1 h 30 — build 75 relu, sessions du 13/11
- Sacha : « c'est mieux, j'ai commencé à lag qu'au palier 21 ». Boîte : `portail | attente 1354 ms sous le voile | vol · grotte-midi` (plus de gel), mais `grotte | travailleur | 20851 ms de creusement` ×7 ; deux décrochages audio de ~500 ms à chaque arrivée au menu (la session part au cran 2).
- **« Le jeu coupe ma musique au lieu de couper son son »** : l'autre musique n'était lue qu'au LANCEMENT. Joueur sorti, musique lancée, retour : la page relance son son (session WebKit « playback », non mélangeable) et coupe la musique. Fait (v1536, natif) : `SceneDelegate.sceneDidBecomeActive`, après ≥ 3 s d'arrière-plan, lit `isOtherAudioPlaying` ET `secondaryAudioShouldBeSilencedHint` ; les deux vrais → `cc:autreson` 1 AVANT `ccActif` (jeu muet), sans `setActive`. Chaque lecture est notée (`son | retour dans l'app après N s : autre musique x · indice y`). `natif.js` : ni le veilleur ni `reveil` ne relancent un contexte quand `__ccAutreSon===1`. ⚠ le 12/11 (build 59) une relecture au retour avait laissé le jeu muet à tort (« iOS compte le son de la page comme un autre ») : d'où les deux indices exigés, les 3 s, et la note — à relire au prochain vol. Non vérifié sur le téléphone.
- Sessions Opus lancées sur demande (« lance des sessions sur tout ce qui est améliorable ») : `transitions-ui`, `son-solide` (son de mort, décrochages du démarrage), `grotte-vite` (creusement). En file, faute de navigateur de banc libre (3 au plus) : coût graphique de base par image, démarrage/arrivée au menu, mémoire.
- **Build 76 : « non, ça a coupé ma musique au 1 » (musique d'abord, puis le jeu).** La boîte du lancement de 1 h 27 n'a ni note « autre musique au lancement » ni note « retour dans l'app » ; un contexte tourne (`états closed,running`) et le veilleur a relevé un fondu resté baissé à 1 h 28 min 42 : l'app a perdu le premier plan sans passer en arrière-plan (centre de contrôle ?). On ne sait pas ce qu'iOS a répondu au lancement : rien n'était noté. Fait (v1537, build 77) :
  1. `AppDelegate.didFinishLaunching` lit `isOtherAudioPlaying` OU `secondaryAudioShouldBeSilencedHint` avant tout réglage de session → `GardeThermique.autreSon` ; la lecture est notée 3 s après (`son | lancement : autre musique x · indice y`).
  2. `natif.js` `autreParInterruption()` : un contexte audio « interrupted » alors que la page est visible = une autre app a pris le son → `cc:autreson` 1, `__ccAutreSonJS=1`, plus aucun réveil (le veilleur et `reveil` relançaient le contexte interrompu, donc reprenaient le son au joueur). `GardeThermique.envoie()` lit `__ccAutreSonJS` et guette la fin de l'autre musique.
  3. `SceneDelegate` note aussi les retours SANS arrière-plan (`redevenu actif sans arrière-plan : autre musique x · indice y`), sans agir.
  Non vérifié sur le téléphone. Si le lancement à froid coupe encore la musique alors que la note dit `autre musique 0 · indice 0`, iOS ne voit pas la musique à ce moment-là et il faudra une autre voie (session WebKit en « ambient » tant qu'on ne sait pas).
- **Build 77 relu (« ça marche pas »)** : `son | lancement : pas de lecture native` → le script du début de document n'est JAMAIS arrivé à la page : Capacitor remplace le contrôleur de contenu juste après `webViewConfiguration(for:)` (CAPBridgeViewController.prepareWebView, ligne 298). Donc `__ccAutreSon` au lancement n'a jamais valu 1 (l'autre musique au lancement n'a jamais marché), et `__ccAppareil` / `__ccEco` n'arrivaient qu'après le chargement (vague 3.1 sans effet jusqu'ici). Le retour d'arrière-plan, lui, marche (`retour dans l'app après 3 s : autre musique 1 · indice 1 → jeu muet`, puis `autre musique arrêtée : le son du jeu revient`).
  Fait (v1538, build 78) : `poseScriptDebut()` dans `capacitorDidLoad` (sur le vrai contrôleur, avant le chargement) ; `guetteAutreSon()` chaque seconde (fin de l'autre musique → son du jeu ; `__ccAutreSonJS` 1 / −1) ; `musBascule` : MUSIQUE rallumée à la main pendant l'autre musique lève la règle et reprend le son (demande de Sacha : réglages éteints tant que sa musique joue, les rallumer coupe celle du téléphone). Non vérifié sur le téléphone. ⚠ `__ccAppareil` arrive maintenant AVANT le jeu : le palier par modèle (palier-appareil.js) s'applique pour la première fois — 13 Pro = palier 2, inchangé pour Sacha ; à surveiller sur d'autres iPhone.

## 13/11 2 h 15 — 2e lot de sessions fusionné (ios-ultime v1539, build 79)
- Fusionné : main v1535 (grottes sans lacets ni épingles, figures : lancement à 35 % de nitro, boutique, pouce NITRO, HUD calme qui efface tout avec les pièces, enregistreur de jeu `?jeurec=1`), `transitions-ui` (fenêtre de transition à 60 i/s, photos après l'entrée, voile du départ tenu jusqu'à une course fluide ; `passation/TRANSITIONS-UI.md`), `son-solide` (la voix de l'écran de mort sur l'horloge audio, la sortie à l'arrêt n'est plus comptée comme un décrochage ; `passation/SON-SOLIDE.md`).
- Vérifié : 4 gardes, 240 routes, fumée au banc (grotte, pause/reprise, mort, compteur, retour menu, réglages, garage — aucune erreur). Rien n'est mesuré ni écouté sur le téléphone.
- Consigne de Sacha (13/11) : « dès que des sessions sont finies tu en lances d'autres, il faut que ça tourne toute la soirée ». En cours : `grotte-vite`, `gpu-base`, `demarrage-vite`. File : mémoire (WebContent 1,3 Go), grande vitesse 2e passe (coût par mètre aux paliers 21+), passe de débogage sur les lots du 13/11, autres iPhone (simulateur). ⚠ Les sessions finies gardent leur serveur de prévisualisation ouvert (plafond : 5 par dossier) : leur dire de le fermer.
- **Build 78 relu (l'autre musique)** : la boîte confirme les trois chemins — `contexte interrompu, page visible : une autre app a pris le son → jeu muet`, `redevenu actif sans arrière-plan : autre musique 1 · indice 1`, `musique du jeu rallumée à la main pendant une autre musique : le jeu reprend le son`. Retours de Sacha : (1) le SON (effets) doit pouvoir s'allumer EN MÊME TEMPS que la musique du téléphone (Deezer) ; (2) rallumer MUSIQUE a bien coupé Deezer mais la musique du jeu n'est pas partie.
  Fait (v1540, build 80) : `autreSonEffets()` — SON rallumé pendant l'autre musique → `__ccAutreSon=2` (natif.js : le contexte peut tourner, session « ambient » tant que MUSIQUE est éteinte) ; `musRelance()` redemandée à 0,7 / 2 / 4 s après la reprise à la main tant que rien ne joue (la 1re lecture est refusée : la session vient d'être interrompue). Non vérifié sur le téléphone ; iOS 16 (pas de `navigator.audioSession`) : le mélange dépend alors de la catégorie posée par l'AppDelegate (playback + mixWithOthers).
- **Build 79 : « beaucoup de freeze »** (une seule partie de 85 s, téléphone critical) : lancement `prêt en 23.6 s … étapes 43` (13,4 s / 34 avant), `52 trous > 120 ms` en 70 s (pire 1 239 ms) ; course espace → jade pluie : 16,8 i/s, travail 26 ms au moteur 3. Trop court pour dire si c'est une régression du lot (main v1535 + transitions + son) ou la chaleur (toute la nuit en serious/critical) ; transmis à la session `demarrage-vite`. À comparer au prochain vol du build 80, téléphone refroidi.
- Sacha (13/11) : « ferme tes sessions au fur et à mesure » → les sessions finies et fusionnées sont archivées (interface-opti, grande-vitesse, app-store-pret, debug-ultime, transitions-ui, son-solide). L'archivage nettoie leur worktree ; leurs branches restent sur origin.

## 13/11 2 h 45 — RÉGRESSION du lot 79 (main v1535 + transitions-ui + son-solide) et build 81 de repli
- Sacha, builds 79 puis 80 : « beaucoup de freeze dès le lancement sur l'écran d'accueil, mon téléphone n'est pas particulièrement chaud ». Boîte du build 80 (1 h 56) : gels de 6,3 · 9,6 · 2,3 · 3,1 · 4,2 s à l'accueil (`inGarage garMenuH`, `pal=0 basc=0` : téléphone froid), `fin du guet à 71.5 s : 70 trous > 120 ms, le pire 9607 ms`, `#renderer … à 4.1 s` (0,4 s avant), des images du menu de 590-750 ms (`JS image loop 650`), `minuteur nuagesTerre() 294 ms`, `programmes 236` (182 avant). Build 79 : `prêt en 23.6 s, étapes 43` (13,4 s / 34 avant). Les builds 75 à 78 n'ont pas ces gels.
- Cause NON trouvée : le Mac est saturé par trois sessions (toutes.mjs : 88 s au lieu de 14 ; plafond de 5 serveurs de prévisualisation atteint par d'autres conversations), aucune mesure possible. Suspects : ce que le lot ajoute (transitions-ui : `transUI`/`transCad`/`transBloque`, `departVoileLeve` ; main : grottes sans lacets, boutique, pouce NITRO, enregistreur de jeu ; son-solide) — ou le fait que, depuis le build 78, `__ccAppareil`/`__ccEco`/`__ccAutreSon` arrivent AU DÉBUT du document (le palier par modèle et l'état « froid » s'appliquent pour la première fois : téléphone froid = pleine image, 60 i/s). Transmis à la session `demarrage-vite`.
- **Build 81 = hors branche** : le jeu du commit c7ab25096 (build 78) + `autreSonEffets`/`musRelance` (build 80) + `MOB_FROID30`, cache v1541, compilé depuis un worktree temporaire puis `VERSION PRINCIPALE` restaurée. La branche ios-ultime (v1542) garde le lot et sa régression tant que le coupable n'est pas trouvé : NE PAS installer un build de la branche avant.
- **Chaleur au maximum** (Sacha : « essaye de réduire la chaleur au max pour l'instant ») : `MOB_FROID30` (gouverneur-thermique.js, `?mob_froid30=0`) — avec le capteur, la course est calée sur 30 i/s à tout état thermique, dès la 1re seconde.

## 13/11 3 h 30 — la « régression du lot 79 » : pas dans le code, le téléphone était en CRITIQUE (session de reprise)
- **Les vols le disent** (colonne `th`, secondes par état 0 nominal · 1 fair · 2 serious · 3 critical) : build 78 (c7ab250, 01 h 43) `[0,0,76,256,0]` = 256 s en critique à la fin ; build 79 (9ae0b9d, 01 h 53) `[0,0,0,85,0]` = 100 % critique ; build 80 : `téléphone chaud : charge du son au cran 2` à 02 h 03 = critique. La dernière partie du 78 tournait déjà à `DPR 0.85` (le plancher critique de `MOB_LONG`), et les 79 puis 80 ont été installés juste derrière. `pal=0 basc=0` ne veut PAS dire « froid » : c'est l'état de départ du gouverneur des paliers à chaque lancement.
- **Le rapport ×10** colle au bridage critique d'iOS : `#renderer` 0,4 → 4,1 s, une image du menu ~65 → 650 ms, `prêt` 13,4 → 23,6 s. `programmes 236` = la map nuagesSoir (le compte dépend de la map : 182-200 ailleurs), pas le lot.
- **Le lot ne coûte pas plus cher à l'accueil**, mesuré par compteurs (sonde `chrono/sonde-accueil.mjs` et `sonde-webkit.mjs` du scratchpad : rappels d'image et minuteurs chronométrés, programmes liés, textures), build 78 contre ios-ultime, 50 s d'accueil, vraie intro du téléphone (`TEL_NATIF 1 · ALLEGE 1`) : Chrome sans son 182/182 programmes, tâches longues 7,0 s / 4,1 s ; Chrome avec son 3,2 s / 3,0 s ; **WebKit** (le moteur du téléphone) rappels > 50 ms 4,0 s / 1,9 s — la branche fait même MOINS. Génération des routes des nuages (24 routes, 3 paliers) : 27 / 23 ms de médiane : les virages de main ne coûtent rien.
- Natif identique entre c7ab250 et 0aaf978 (seul `natif.js` change d'une ligne). Une seule différence du son reste propre au téléphone : `son-solide` ne fait plus partir le gouverneur du son au cran 2 sur un faux décrochage au lancement (8 voix, salle débranchée) — sur le fil audio, pas sur le fil principal.
- **Contre-essai** : build 82 = la branche (c53bd65, MOB_FROID30) en build de mesure, à lancer sur le téléphone FROID (débranché, 15-20 min au repos), puis `lire-banc.sh` : lignes `gel` / `serpent | fin du guet` / `th` du vol. Si l'accueil est propre → la branche est réhabilitée et le build 81 de repli n'a plus de raison d'être.
