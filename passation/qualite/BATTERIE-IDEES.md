# BATTERIE — faire consommer le moins possible à CASH CAR sur iPhone (17/11, recherche Fable)

Mission de recherche. Aucun code du jeu touché, rien de commité, rien mesuré sur le téléphone cette nuit.
Ce rapport part de trois autres et ne les répète pas :
- `passation/qualite/CHALEUR-IDEES.md` (la course : appels, triangles, couches du HUD, rythme à 30 Hz) ;
- `passation/qualite/batterie-lancement/` (15/11 : `carte-batterie-jeu.md`, `carte-batterie-menus.md`, `PLAN.md`) ;
- `passation/qualite/menusfroids.md` (scène couverte à 2 i/s, veille des boucles CSS : codé, jamais mesuré sur iPhone).

Niveaux de preuve : **[PROUVÉ]** source ou mesure · **[PROBABLE]** déduit · **[À TESTER]** idée sans chiffre.
Repère : sur le 13 Pro (11,97 Wh), **1 % de batterie par heure ≈ 120 mW**.

## 0. En bref

1. **L'écran pèse autant que le jeu.** Une ligne du wattmètre donne la pause à ≈ 4 W quand la course est à ≈ 6 W. Le rendu n'est donc qu'un tiers de la dépense. Le reste, c'est l'écran et le socle du téléphone.
2. **Sur un écran OLED, la dépense suit la lumière émise.** J'ai mesuré la lumière de nos écrans sur les captures : la BOUTIQUE (fond blanc) émet 5 fois plus que le garage et 30 fois plus que les RÉGLAGES. C'est l'écran le plus cher du jeu, sans une seule image 3D lourde.
3. **Hors course, on dessine encore sans arrêt.** Écran de mort (12 % du temps de jeu), accueil, garage : 30 puis 15 i/s, jamais zéro, à une densité 2,56 fois celle de la course.
4. **Notre mesure est trop grossière.** iOS ne donne plus la batterie que par pas de 5 %. L'outil qu'il faut existe depuis iOS 26 : le Power Profiler, sans câble.
5. Arrière-plan et écran verrouillé : rien ne tourne. C'est déjà bon.

## 1. Le bilan : où part l'énergie

### 1.1 Ce qui est mesuré (téléphone de Sacha, débranché)

Sources : lignes `energie` des boîtes noires du 13 au 15/11, et le champ `bat` des 10 fichiers `vol-111x`, recalculé (temps entre deux pas de 5 %, même séance, débranché ; le premier pas d'une séance est jeté).

| Situation | Temps pour 5 % | Watts (nominal) | % par heure | Preuve |
|---|---|---|---|---|
| Course, builds du 13/11 matin | 253-260 s | 8,3-8,5 | ≈ 70 | 3 relevés |
| Course + mort + pause (mélange normal), 13-15/11 | 324-433 s | 5,0-6,6 | 42-55 | 12 relevés |
| Course en mode économie, 15/11 | 366 s | 5,9 | 49 | 1 ligne |
| Surtout de la pause (404 s de pause, 80 s de course) | 484 s | 4,5 | 37 | 1 ligne (13/11 15:03) |
| Un pic isolé en mode économie (14/11 21:18) | 253 s | 8,5 | 71 | 1 relevé |

Lecture :
- **Une heure de jeu = 45 à 55 % de batterie affichée.** [PROUVÉ, à ±15 %]
- **La pause seule ≈ 4 W** (4,5 W mesurés, moins 80 s de course à 6 W). [PROBABLE : une seule ligne, à refaire.] Si c'est vrai, le rendu de la course ne pèse que ≈ 2 W sur 6.
- Le mode économie ne baisse pas la dépense en course (5,9 W contre 5,5-6,5). [PROBABLE, peu de relevés]
- Répartition du temps d'une séance (lignes `energie`) : course ≈ 75 %, écran de mort ≈ 12 %, pause ≈ 9 %, garage ≈ 4 %.

Trois réserves :
- Les watts sont un **majorant**. La batterie a 1 314 cycles : sa vraie capacité est plus basse que 11,97 Wh. Les pourcentages par heure, eux, sont ce que Sacha voit.
- **Pas de 5 %.** [PROUVÉ] Depuis iOS 17, `UIDevice.batteryLevel` est arrondi à 0,05, exprès (réponse d'Apple : https://developer.apple.com/forums/thread/732903). Le commentaire du wattmètre (« pas de 1 % ») est faux.
- La **luminosité de l'écran n'est notée nulle part**. Deux relevés à luminosités différentes ne se comparent pas.

### 1.2 Par état du jeu

| État | Ce qui tourne (lu dans le code) | Dépense | Preuve |
|---|---|---|---|
| Course | boucle à 30 i/s, DPR 1,25, son en direct (moteur, effets), HUD en DOM, écran tenu allumé | 5-6,5 W | mesuré |
| Écran de mort | 3,5 s à pleine cadence, puis la règle des menus : 30 i/s, 15 après 60 s (`cadence.js`, `hcSaute`) | inconnue | jamais isolée |
| Pause | scène à 10 i/s, puis 2 i/s après 2 s ; contexte audio endormi ; verrou d'écran rendu | ≈ 4 W | 1 ligne |
| Accueil, garage | 3D à 30 i/s, 15 après 60 s, 60 sous le doigt ; **DPR 2** ; boucles CSS gelées après 20 s | inconnue | aucune ligne `energie` de menu |
| Boutique | pareil + **fond blanc** (voir 1.4) | inconnue, la plus haute des menus [PROBABLE] | — |
| Réglages, modes, profil | scène couverte à 2 i/s (menus froids) ; écran sombre | la plus basse [PROBABLE] | — |
| Arrière-plan | rien : pas de `UIBackgroundModes`, WebKit suspend le processus web, contexte audio suspendu, `<audio>` en pause | ≈ 0 | [PROUVÉ] code + WebKit (https://bugs.webkit.org/show_bug.cgi?id=237878) |
| Écran verrouillé | comme l'arrière-plan | ≈ 0 | idem |

### 1.3 Par poste (estimé, sauf mention)

| Poste | Part en course | Remarque |
|---|---|---|
| Écran | **gros** : sans doute 1 à 3 W selon la luminosité et la map | [À TESTER] le plancher se mesure avec la page noire `chaleur=vide` |
| Puce graphique + processeur (rendu, JS, composition du HUD) | ≈ 2 W | [PROBABLE] course − pause |
| Socle du téléphone (radio, système) | ≈ 1 W | [PROBABLE] |
| Son | petit, non chiffré | fil audio temps réel, 48 kHz, latence « interactive » (`graphe-audio.js:306`) |
| Réseau | ≈ 0 | [PROUVÉ] une vérification de mise à jour au lancement, aucune scrutation (`natif.js:269-316`) |
| Vibrations | ≈ 0 | [PROBABLE] des tics brefs |
| Capteurs | 0 | pas de GPS ; l'inclinaison seulement si le joueur la choisit |

### 1.4 La lumière de nos écrans (mesurée cette nuit)

Méthode : captures du téléphone (`ios-ultime-mesures/captures/`, 12/11) et photos de banc (14-15/11). Moyenne de la lumière **linéaire** (0 = noir, 1 = blanc plein). C'est ce que l'OLED paie.

| Écran | Lumière moyenne | Par rapport aux réglages |
|---|---|---|
| Lancement, film 1.61 | 0,003 | ÷ 6 |
| RÉGLAGES, MISSIONS, PROFIL | 0,02 - 0,09 | × 1 à 4 |
| Achat (cartes dorées sur fond sombre) | 0,06 - 0,08 | × 4 |
| Garage | 0,13 | × 7 |
| Pause | 0,09 - 0,13 | × 5 à 7 |
| Course, Jade de nuit | 0,04 - 0,07 | × 3 |
| Course, nuages / route rouge | 0,12 - 0,24 | × 6 à 12 |
| Course, désert de jour | 0,40 - 0,45 | × 20 |
| **Accueil (ciel bleu)** | **0,41 - 0,43** | × 20 |
| **BOUTIQUE (fond blanc)** | **0,66 - 0,75** | **× 35** |

Lecture : la boutique et l'accueil sont nos deux écrans les plus lumineux. Ce sont aussi ceux où le joueur ne fait rien. Les watts correspondants : section 2.C-sources.

## 2. Les pistes, classées

### A. Invisible, gros

**A1. Rendu à la demande sur l'écran de mort**
- Quoi : 3,5 s après la mort, ne plus dessiner la 3D tant que rien ne change. Aujourd'hui : 30 i/s, puis 15.
- Pourquoi c'est gros : 12 % du temps de jeu, à chaque partie. Et le téléphone refroidit avant la course suivante.
- Gain : [PROBABLE] presque tout le rendu de cet écran, soit jusqu'à ≈ 1-2 W pendant 12 % du temps : 2 à 4 % d'autonomie en plus.
- Se voit ? Non si la scène derrière est figée. **À vérifier d'abord** : la caméra ou les débris bougent-ils encore après 3,5 s ? Si oui, c'est un choix (section C).
- Où : `code/moteur/cadence.js`, `hcSaute` (cas `froid===2`), même mécanisme que la pause froide (`HC.per=500`). Interrupteur `?sans=mortfroide`.
- Mesure : Power Profiler (section 4), 3 min sur l'écran de mort, avec et sans.

**A2. L'accueil et le garage : dessiner seulement ce qui bouge**
- Quoi : la vitrine redessine toute la scène à DPR 2 (2,56 fois les pixels de la course, `nettete-qualite.js:237`). Si seuls les nuages et la caisse bougent, le reste peut être gardé.
- Deux voies sans perte : (a) rendre le décor fixe une fois dans une cible, et ne redessiner que la caisse par-dessus ; (b) après 20 s sans geste (le moment où les boucles CSS sont déjà gelées), passer à 2 i/s comme sous un écran couvert.
- Gain : [À TESTER] dépend de ce que coûte la vitrine. Aucune ligne `energie` de menu n'existe.
- Se voit ? (a) non. (b) oui après 20 s : les nuages ralentissent. Sacha s'est déjà plaint des nuages à 15 i/s : (b) est donc un choix.
- Déjà dit : `carte-batterie-menus.md` P4 (veille profonde), écartée parce qu'en mode économie l'écran se verrouille à 30 s. Reste vrai. Hors mode économie, ça compte.
- Mesure : Power Profiler, 5 min d'accueil sans toucher, verrouillage sur « jamais ».

**A3. Couper les animations de l'interface à 60 Hz pendant la course à 30**
- Quoi : la toile sort 30 images par seconde. Une seule animation CSS en boucle dans le HUD oblige le système à recomposer l'écran 60 fois (hors mode économie). L'écran ProMotion ne peut alors pas descendre à 30 Hz.
- Preuve partielle : [PROUVÉ] en mode économie WebKit bride aussi les animations CSS à 30 (https://bugs.webkit.org/show_bug.cgi?id=169138). Hors mode économie, elles restent à 60. Apple : « éviter plusieurs cadences à l'écran » (guide énergie, « Avoid Extraneous Graphics and Animations »).
- Gain : [À TESTER]. C'est la suite de CHALEUR A4 (les couches du HUD) vue côté batterie.
- Comment : en course, aucune boucle CSS infinie vivante ; ce qui doit bouger est mis à jour par `loop()`, donc à 30.
- Se voit ? Non.
- Mesure : Power Profiler, colonne « affichage » et cadence de l'écran, en course, hors mode économie.

**A4. Mesurer avec le bon outil (ce n'est pas une économie, mais sans lui rien ne se prouve)**
- Voir la section 4. Le pas de 5 % ne voit pas un gain de moins de 15 %.

### B. Invisible, petit (gratuit ou presque)

**B1. Le contexte audio endormi quand le jeu se tait**
- Quoi : hors course, quand aucun son ne joue depuis quelques secondes, `suspend()` ; réveil au premier toucher. Déjà fait en pause et quand tout est coupé.
- Pourquoi : un contexte « running » garde un fil temps réel éveillé, même en silence. [PROBABLE : aucune source ne dit ce que WebKit fait d'un contexte muet ; cherché, pas trouvé.]
- Risque : le premier clic d'interface en retard ; la session audio rejouée (l'autre musique de Sacha). La musique des menus passe-t-elle par ce contexte ? Si oui, piste sans objet au menu.
- Gain : [À TESTER] 10-50 mW au mieux.
- Où : `code/son/console-son.js:125` (`acDortApres`), `natif.js` (veilleur : il sait déjà ne pas réveiller un contexte endormi par le jeu).

**B2. Les réveils en pause et au menu**
- Quoi : en pause, le but est le repos complet. Restent : le `requestAnimationFrame` de la boucle (30-60 par seconde, pour sauter), le guet des gels (`debut-corps.html:128`), le veilleur audio de 700 ms (`natif.js:180`), 4 minuteries natives (1 s, 2 s, 5 s, 5 s : `JeuViewController.swift:296, 494, 503, 574`), l'écriture de 15 s (`natif.js:398`).
- Pourquoi : [PROUVÉ] Apple : chaque réveil a un coût fixe, et « 1 % de processeur = +10 % sur la dépense au repos » (https://developer.apple.com/library/archive/documentation/Performance/Conceptual/EnergyGuide-iOS/FundamentalConcepts.html).
- Comment : en pause depuis 2 s, remplacer la boucle par une minuterie de 500 ms (la scène est déjà à 2 i/s). Côté natif : l'état thermique, la batterie et le mode économie ont déjà leurs notifications, les sondages de 5 s font doublon. Tolérance de 10 % sur les minuteries (`Timer.tolerance`), demandée par Apple.
- Gain : [PROBABLE] petit (dizaines de mW), seulement en pause et au menu.
- Déjà dit : CHALEUR B2, `carte-batterie-jeu.md` n° 5.

**B3. Le moteur Taptic gardé chaud**
- Quoi : `HaptiqueNatif` appelle `prepare()` après chaque impact, et la bande de la boutique le rappelle toutes les 0,9 s pendant un glissé (`haptique.md`). Le moteur reste sous tension.
- Gain : [À TESTER] minuscule. À regarder seulement si le Power Profiler montre quelque chose dans la boutique.

**B4. Le build de mesure ment un peu**
- Le build Debug ajoute un `requestAnimationFrame` permanent et un `elementFromPoint` toutes les 4 s (`natif.js:424-428`, « POULS »), plus les journaux de Capacitor. Une mesure de batterie doit se faire sur un build Release, ou avec le pouls coupé.

**B5. Le lancement**
- Déjà traité : `batterie-lancement/carte-lancement.md` et `PLAN.md` (script en fichier, programmes en double). Vu côté batterie : un lancement à froid = ≈ 26 s de compilation à plein régime. [PROBABLE] quelques dixièmes de pour-cent par lancement.
- Idée en plus : éviter les relancements. Quand iOS tue le processus web en arrière-plan (mémoire), le retour coûte un lancement entier. `natif.js:375` décharge déjà des choses en arrière-plan ; [À TESTER] mesurer combien de retours finissent en rechargement (le compteur `CompteChargements` du lot natif le dit).

### C. Touche l'expérience : des choix pour Sacha

**C1. La boutique sur fond sombre**
- Quoi : la boutique est le seul grand écran blanc du jeu (lumière 0,70). Tout le reste de l'interface est sombre (0,02-0,13).
- Gain : [PROBABLE] le plus gros de ce rapport par seconde passée : ≈ 1 W à mi-lumière, ≈ 2 W écran à fond (calcul en 2.C-sources).
- Variantes : (a) boutique sombre pour tous ; (b) sombre seulement en mode économie ; (c) garder le blanc, baisser à un gris perle (lumière 0,35 : moitié moins).
- C'est de la direction artistique : à lui de trancher, sur maquette.

**C2. L'accueil de nuit**
- Le ciel bleu clair de l'accueil : lumière 0,42. Une variante crépuscule ou nuit (0,05-0,10) divise la part de l'écran par 3 à 5 (≈ 0,5 à 1,2 W de moins).
- Variante douce : accueil de nuit seulement en mode économie, ou le soir.

**C3. Le voile de la pause et de l'écran de mort**
- Assombrir la scène figée derrière la feuille (voile noir à 60-70 %). Courant dans les jeux, lisible, et la pause est à ≈ 4 W.
- Gain : [À TESTER] proportionnel à la lumière retirée (pause : 0,09-0,13 aujourd'hui, donc gain modeste ; écran de mort de jour : plus net).

**C4. Les maps sombres quand la batterie est basse**
- Jade de nuit émet 6 à 10 fois moins que le désert de jour. C'est CHALEUR A5 (le directeur de maps) et C4 (exposition) : la même manette sert la batterie.

**C5. La vitrine à DPR 1,5 en mode économie**
- Déjà proposé : `carte-batterie-menus.md` P5, `PLAN.md` lot 4. −44 % de pixels dans tous les menus. Attend son oui.

**C6. Un « mode économie du jeu » qui suit celui d'iOS**
- Apple le demande : en mode économie, une app « réduit les animations, baisse la cadence » (https://developer.apple.com/library/archive/documentation/Performance/Conceptual/EnergyGuide-iOS/LowPowerMode.html). Aujourd'hui `__ccEco` est lu mais n'allège rien.
- Ce serait le paquet C1b + C2 + C3 + C5, posé au changement d'écran, jamais en course.

### 2.C-sources. Ce que disent les sources sur l'OLED

- [PROUVÉ] DisplayMate, iPhone 13 Pro Max (6,7 pouces), luminosité manuelle au maximum (≈ 850 nits) : **3,75 W en blanc plein, 1,80 W à 50 % de lumière moyenne**. La dépense suit donc la lumière moyenne, plus une petite part fixe. https://www.displaymate.com/iPhone_13Pro_ShootOut_1M.htm
- [ESTIMÉ, à l'échelle de la surface] 13 Pro (6,1 pouces, ×0,83) au maximum : **écran ≈ 0,12 W + 3,2 W × lumière moyenne**.

| Écran | Lumière | Écran seul, luminosité au maximum | À mi-lumière (÷ 2) |
|---|---|---|---|
| Boutique blanche | 0,70 | ≈ 2,4 W | ≈ 1,2 W |
| Accueil | 0,42 | ≈ 1,5 W | ≈ 0,75 W |
| Course, désert de jour | 0,43 | ≈ 1,5 W | ≈ 0,75 W |
| Course, nuages | 0,18 | ≈ 0,7 W | ≈ 0,35 W |
| Garage, pause | 0,12 | ≈ 0,5 W | ≈ 0,25 W |
| Course, Jade de nuit | 0,05 | ≈ 0,3 W | ≈ 0,15 W |
| Réglages | 0,03 | ≈ 0,2 W | ≈ 0,1 W |

- Donc : **boutique blanche → boutique sombre (0,08) ≈ 2 W de moins au maximum, ≈ 1 W à mi-lumière** : 8 à 17 % de batterie par heure passée dans la boutique. Accueil de jour → de nuit : ≈ 0,5 à 1,2 W.
- [PROUVÉ, étude Purdue 2021, téléphones Android OLED] passer du clair au sombre économise 3 à 9 % de tout le téléphone à 30-50 % de luminosité, 39 à 47 % à 100 %. https://www.purdue.edu/newsroom/releases/2021/Q3/dark-mode-may-not-save-your-phones-battery-life-as-much-as-you-think,-but-there-are-a-few-silver-linings.html
- **Le gain dépend donc de la luminosité de Sacha.** Gros s'il joue écran à fond, modeste à mi-curseur. La mesure 1 et 2 du protocole tranche.
- Apple conseille la même chose : baisser la lumière moyenne des pixels quand la part « écran » est haute (doc du Power Profiler).
- [NON CONFIRMÉ] « le bleu coûte plus cher que le rouge » : aucune source ouverte ne le chiffre. Le modèle de Purdue dit seulement que la dépense dépend de la couleur.
- Le curseur de luminosité d'iOS n'est pas linéaire en nits : pas de table trouvée.
- Jeux 3D sur 13 Pro Max, mesures publiques : 4,4 à 5,2 W (Genshin Impact, Golden Reviewer). Nos 5-6,5 W nominaux, sur une batterie usée, sont dans le même ordre.

## 3. Fausses bonnes idées

- **Le 120 Hz à couper.** Rien à faire : [PROUVÉ] une WKWebView est plafonnée à 60 sur iPhone, même avec la clé `CADisableMinimumFrameDurationOnPhone` (https://bugs.webkit.org/show_bug.cgi?id=294338), et la clé est absente d'`Info.plist`. `preferredFrameRateRange` ne commande pas une WKWebView (CHALEUR, section 3).
- **Les vibrations.** [PROBABLE] ≈ 10 mJ par tic (moteur linéaire générique, note TI SLOA194) : 1 000 tics ≈ 0,02 % de la batterie. Aucune mesure du Taptic Engine trouvée.
- **Baisser la fréquence audio à 24 kHz.** Le matériel sort en 48 : WebKit rééchantillonne, donc du calcul en plus, et un son moins fin. Aucun gain trouvé dans une source.
- **Rendre la session audio au système en pause.** Elle est déjà rendue en arrière-plan. En pause, la rendre puis la reprendre a déjà cassé le retour du son (« Failed to start the audio device ») et coupé la musique de Sacha.
- **Baisser la luminosité de l'écran depuis l'app.** `UIScreen.brightness` est public et iOS rend la valeur du joueur à la sortie de l'app (Apple QA1751), mais c'est le réglage du joueur. Déjà écarté dans les cartes du 15/11. Le voile sombre (C3) fait le même travail sans y toucher.
- **Du noir pur partout.** Le gain suit la lumière retirée, pas le « noir vrai ». Nos menus sombres sont déjà à 2-9 % de lumière : il n'y reste presque rien à prendre. Le gain est dans les deux écrans clairs.
- **Menus sous 15 i/s en continu.** Sacha a vu les nuages saccader. À garder pour l'inactivité longue seulement.
- **Juger un petit gain au wattmètre du jeu.** Pas de 5 % : il faut 15 % de batterie par bras pour voir un écart de 15 %.
- **Mesurer branché.** Le Power Profiler rend zéro en charge, et la charge chauffe.
- **Compter sur le mode économie pour consommer moins.** En course : 5,9 W contre 5,5-6,5. Il bride le processeur (−58 % sur un cœur, https://www.notebookcheck.net/Even-in-low-power-mode-the-iPhone-13-Pro-A15-Bionic-chip-still-embarrasses-the-competition.568879.0.html) : l'image met plus longtemps, la dépense reste.
- **Le réseau.** Une requête au lancement. Rien à gagner.

## 4. Le protocole : chiffrer la consommation actuelle

### L'outil : Power Profiler (iOS 26) [PROUVÉ, doc Apple]
https://developer.apple.com/documentation/xcode/measuring-your-app-s-power-use-with-power-profiler
- Sur le téléphone, sans câble : Réglages › Développeur › Performance Trace. Jusqu'à 10 h d'enregistrement. On partage la trace vers Instruments sur le Mac.
- Il donne : la puissance du téléphone en % de batterie par heure, et la part de l'app en processeur, puce graphique, **écran**, réseau ; l'état thermique ; la luminosité.
- Il rend zéro en charge : toujours débranché.
- [NON VÉRIFIÉ] qu'Instruments s'ouvre sur ce Mac chargé, et que le menu existe sur le téléphone de Sacha (mode développeur activé).
- L'ancien « Energy Log » n'existe plus (retiré avec Xcode 13 / iOS 15).

### Les règles, pour que deux mesures se comparent
1. Débranché depuis 10 min. Batterie entre 80 % et 30 % (hors de cette zone la jauge n'est pas droite, surtout à 1 314 cycles).
2. Luminosité **fixe et notée** : luminosité automatique coupée, curseur à 50 %. Une seconde série au maximum si Sacha joue ainsi.
3. Mode économie : noté. Une série avec, une sans.
4. Verrouillage automatique sur « jamais » pour les états immobiles.
5. Build Release, ou pouls de débogage coupé (B4).
6. Téléphone parti froid (état nominal), posé sur une table, hors soleil.

### Les sept mesures (5 min chacune au Power Profiler ; ou 15 % de batterie chacune au wattmètre du jeu)
| # | État | Sert à |
|---|---|---|
| 1 | Page noire (`chaleur=vide`) | le plancher : téléphone + écran noir |
| 2 | Page blanche (à ajouter : `chaleur=blanc`) | le plafond de l'écran à cette luminosité. 2 − 1 = le prix de la lumière |
| 3 | Accueil, sans toucher | menu au repos |
| 4 | Boutique, sans toucher | l'écran blanc (C1) |
| 5 | Pause | vérifier les ≈ 4 W |
| 6 | Écran de mort | A1 |
| 7 | Course, map forcée, 5 min | la référence |

Avec 1 et 2, chaque écran se range entre les deux d'après sa lumière (table 1.4). On sait alors, pour chaque état, ce qui part dans l'écran et ce qui part dans le calcul. C'est ce partage qui dit si C1-C3 valent mieux que A1-A3.

### Sans outil (Sacha seul, en jouant)
- Réglages › Batterie : la part de CASH CAR et le temps d'écran sur 24 h.
- Lignes `energie` de la boîte noire : valables pour des écarts de plus de 15 %, avec la luminosité notée à la main.
- À ajouter au wattmètre : la luminosité (`UIScreen.main.brightness`, lecture seule) dans chaque ligne `energie` et dans le champ `bat`.

### Plus tard, avec de vrais joueurs
- MetricKit (`MXMetricPayload`, un rapport par jour) : temps processeur, temps puce graphique, **lumière moyenne des pixels** (`displayMetrics`), temps au premier plan. https://developer.apple.com/documentation/metrickit/mxmetricpayload
- Xcode › Organizer › Battery Usage : % de batterie par 24 h, par version et par poste. Il faut des joueurs App Store ou TestFlight. https://developer.apple.com/documentation/xcode/analyzing-your-app-s-battery-use

## 5. Ce que je n'ai PAS pu vérifier

- Rien n'a été mesuré sur le téléphone cette nuit.
- Le partage écran / calcul : il repose sur une seule ligne de pause du 13/11, sans luminosité notée.
- Ce que coûte l'accueil, le garage, la boutique, l'écran de mort : aucune mesure n'existe.
- Si la scène de l'écran de mort bouge encore après 3,5 s (décide si A1 est invisible).
- Si un contexte audio muet mais « running » garde le matériel éveillé dans WebKit iOS : aucune source.
- Si l'écran ProMotion descend vraiment à 30 Hz quand rien ne compose à 60 (A3).
- Le coût de composition d'une toile WebGL qui n'est pas redessinée : aucune source.
- Les captures de la table 1.4 datent du 12 au 15/11 : un écran a pu changer depuis.
- Que le Power Profiler marche sur ce téléphone et ce Mac.

## Sources

- Apple, Energy Efficiency Guide for iOS Apps : concepts (coûts fixes, table du processeur), minuteries, mode économie, graphismes, arrière-plan : https://developer.apple.com/library/archive/documentation/Performance/Conceptual/EnergyGuide-iOS/
- Apple, mode économie d'énergie (verrouillage 30 s, luminosité réduite, 5G limitée) : https://support.apple.com/en-us/101604
- Apple, Power Profiler : https://developer.apple.com/documentation/xcode/measuring-your-app-s-power-use-with-power-profiler
- Apple, batterie par pas de 5 % depuis iOS 17 : https://developer.apple.com/forums/thread/732903
- WebKit : animations CSS à 30 en mode économie (bug 169138), rAF à 30 (215745, 168837), processus web suspendu en arrière-plan (forum Apple 64150, bug 237878), minuteries alignées à 1 s page cachée (98474).
- DisplayMate, iPhone 13 Pro Max (watts de l'écran) : https://www.displaymate.com/iPhone_13Pro_ShootOut_1M.htm
- Purdue 2021 (Dash et Hu), mode sombre : lien en 2.C-sources. Lu par le communiqué, pas par l'article.
- Apple QA1751 (luminosité) : https://developer.apple.com/library/archive/qa/qa1751/_index.html
- Unity, rendu à la demande dans les menus (« économies importantes », sans chiffre) : https://unity.com/blog/technology/how-on-demand-rendering-can-improve-mobile-performance
- Données : `~/cash-car/ios-ultime-mesures/vol/vol-111*.json` (champ `bat`), `boite-noire-1113*.txt` et `-1115-1600.txt` (lignes `energie`), `captures/`, `passation/qualite/photos/`.
