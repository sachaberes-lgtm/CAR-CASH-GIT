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

## 8. Peut attendre (remise à zéro du forfait, ou mise à jour en direct)
Vague 4 sauf la séance longue ; retours haptiques et finitions « Arcade » (réglages, manette) ; tailles de texte fractionnaires (P-05) ; rendu figé de tous les morceaux ; audit complet de la sauvegarde et du tactile (non faits : l'audit à 16 axes a été arrêté avant de rendre).

## 9. Ce que ce plan ne couvre pas
L'audit large (16 axes) et le rapport des bancs n'ont pas abouti : les enchaînements d'états, la sauvegarde, le tactile et la conformité App Store ne reposent que sur les rapports d'avant (`passation/debug-gameplay/`, `passation/APP-STORE.md`). Les causes du vol sont des **suspects lus dans le code**, pas des faits : c'est la boîte de vol qui tranche.
