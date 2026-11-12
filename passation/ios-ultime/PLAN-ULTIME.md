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

## 8. Peut attendre (remise à zéro du forfait, ou mise à jour en direct)
Vague 4 sauf la séance longue ; retours haptiques et finitions « Arcade » (réglages, manette) ; tailles de texte fractionnaires (P-05) ; rendu figé de tous les morceaux ; audit complet de la sauvegarde et du tactile (non faits : l'audit à 16 axes a été arrêté avant de rendre).

## 9. Ce que ce plan ne couvre pas
L'audit large (16 axes) et le rapport des bancs n'ont pas abouti : les enchaînements d'états, la sauvegarde, le tactile et la conformité App Store ne reposent que sur les rapports d'avant (`passation/debug-gameplay/`, `passation/APP-STORE.md`). Les causes du vol sont des **suspects lus dans le code**, pas des faits : c'est la boîte de vol qui tranche.
