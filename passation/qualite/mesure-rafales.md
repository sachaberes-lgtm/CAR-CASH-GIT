# LOT « MESURE-RAFALES » (2026-11-17) — branche qa/mesure-rafales

Le lot 0 de l'analyse du vol 1448 (build 120). En économie d'énergie + téléphone tiède ou chaud (pire branché), des rafales de 3 à 34 s.
Une image sur 3-4 pèse ~115 ms. Ses tranches ont des montants FIXES : b1 15 ms, b4 47-52, rendu 20-22.
Trois mécanismes restent possibles : (a) attente de la puce, (b) travail périodique à nous, (c) ramasse-miettes.
Ce lot ne corrige rien. Il MESURE, pour trancher au prochain vol.

Tout n'agit que dans un build de mesure (`?perfrec=2`, le mouchard allumé). Ailleurs : rien n'est enveloppé, chaque marque est un `if(MG.on)` faux.
`?sans=rafales` coupe tout le lot (le mouchard d'avant reste).

## Ce qui est ajouté

### 1. Les sentinelles de l'image (`code/moteur/mouchard-gels.js`)
- Même travail fixe que la sentinelle d'avant (`mgSenBrut`).
- **Début de loop** : EN COURSE seulement (jamais au menu, en pause, à la mort : `MG.lc0` y vaut 0), et quand l'image sera sans doute calculée :
  passé 80 % de l'intervalle habituel entre deux images calculées (`MGR.dwM`, moyenne fuyante des intervalles < 60 ms). À 120 Hz calé à 30, les images sautées de 8, 17, 25 ms
  n'en lancent pas. Avant l'horloge de loop : hors des tranches, retirée du hors-boucle.
- **Après le rendu** : si l'image a déjà pris ≥ 45 ms, EN COURSE seulement (`mgEnCourse()`, 3e tour : au menu elle partait aussi). Retirée de la tranche « après », de la durée de loop, ET du travail compté depuis `QLR.t0`
  (cadFin / CAD.w, qlSonde, bvImage, pré-bâti, pilote) : `QLR.t0` (et `BANC_T0`) sont avancés de sa durée.
- **Fin** : celle d'avant (loop > 60 ms ou gel).
- `?sans=sendebut` coupe les deux nouvelles. Coût : une sentinelle par image calculée (≈ 0,2 ms à froid, ≈ 1,2 ms bridé). Sa moyenne par seconde est en M[23].

### 2. Les sous-tranches
- `mgSt('nom')` ferme la sous-tranche ouverte et ouvre la suivante. Une borne de tranche (`mgTs`) la ferme aussi.
- Marques dans b1 (entrée, échelle QL, qlSondeDebut, lvlStep, routeTick, ailvTick, blingTick, bioStep, nuFondTick, cityTick, portesTick, son du vide, sim),
  b4 (pièces, pluie d'argent, pigeons, nuages, lumières, nfxTick, plumes, nfeuPas, sillages, arc-en-ciel, trxStep, wow),
  b6 (filés, HUD, nx3Tick, ajTick, vitrine, ciel, planète, ombre, caisse, jus, musicTick, villeApres, jade, grotte, banquise, crypto, canyon, lumTick, boutique),
  rendu (« rendu composer » ou « rendu direct ») et après (copies, matSursisTick, engVigRender, prebTick, bvImage, HUD, cadFin, qlSonde).
- Chronos à part, IMBRIQUÉS : chaque passe du compositeur (`passe 0 scène`, `passe 1 bloom`, `passe 2 ACES (+ loupe)`), `dont loupe (quad)`, `dont nxfDessine (flamme + putImageData)`.
  Ils sont DANS « rendu composer » ou « nx3Tick » : ne pas les additionner.
- Gardées par image (Float64Array de 96 cases, aucune allocation ; ≈ 63 noms + 3-5 passes au 17/11). ÉCRITES seulement pour une loop > 60 ms.
  Un nom au-delà de 96 est PERDU : compté (`c.LHNp`, les 24 premiers dans `c.LHNpN`), signalé par analyse-vol.py.

### 3. Les appels qui attendent la puce
Enveloppés sur les prototypes (WebGL 1, WebGL 2, Canvas 2D). Trois familles :
- **0 WebGL synchrones** : get* (sauf getContextAttributes), checkFramebufferStatus, readPixels, clientWaitSync, finish.
- **1 Canvas 2D** : getImageData, putImageData, measureText, drawImage (une toile WebGL dessinée dans un 2D est relue).
- **2 envois WebGL** : draw*, tex*Image*, buffer*Data, generateMipmap, clear, blit/invalidateFramebuffer, compileShader, linkProgram, flush.
  Sur iOS, une file pleine vers le processus de la puce bloque N'IMPORTE QUEL appel, pas seulement les synchrones. `?sans=glenvois` les laisse nus.
- ⚠ L'horloge de la vue web d'iOS est au ms. Un appel seul vaut 0 ou 1 ms. Les SOMMES de nombreux appels sont justes en moyenne.

### 4. Le natif (`app-ios/ios/App/App/JeuViewController.swift`, classe `SondeNatif` ; `app-ios/natif/natif.js`)
- Posé toujours, inerte. natif.js lui dit « go » seulement si l'app a `perfrec=2` (`sans=sondenatif` : rien).
- Chaque seconde, sur le fil principal de l'APP (pas celui de la page) : pression mémoire (DispatchSource), sentinelle Swift (même travail, chrono à la µs),
  retard du battement d'une seconde (minuterie DispatchSource, marge 1 ms).
- Dit à la page : `window.__ccSw=[pression, µs, retard ms ×10]`, `window.__ccSwN`.

### 5. `?sans=pouls` (vérifié)
Le pouls (MessageChannel, ~5 ms) n'est posé que sans `sans=pouls`. Avec : `MG.pc` reste nul, aucun battement, G[37] = -1. Voir PROUVÉ.

## Le format (boîte de vol, `code/moteur/enregistreur-perf.js`)
- **M : 27 colonnes** (`c.Mw` = 27 ; les anciens vols : 8, 12 ou 17).
  [17] ms ×10 WebGL synchrones de la seconde, [18] nombre · [19] ms ×10 Canvas 2D, [20] nombre · [21] ms ×10 envois WebGL, [22] nombre ·
  [23] sentinelle de début, moyenne de la seconde (ms ×100, -1) · [24] pression mémoire (0 · 1 · 2, -1 inconnue) · [25] sentinelle Swift (µs, -1 pas fraîche) ·
  [26] retard du battement natif (ms ×10, -1).
- **G : 51 colonnes.** Tout porte sur l'IMAGE D'AVANT (celle de G[3] et G[10-17], la lourde) :
  [40] sentinelle début, [41] après rendu, [42] fin (ms ×100, -1 non mesurée) · [43] ms ×10 WebGL synchrones, [44] nombre · [45] ms ×10 Canvas 2D, [46] nombre ·
  [47] ms ×10 envois WebGL, [48] nombre · [49] sa ligne dans c.LH (-1 : loop ≤ 60 ms) · [50] ms ×10 d'appels à la puce HORS boucle depuis l'image calculée d'avant (le trou du gel, `R.hors` ; les appels des loops SAUTÉES y vont aussi).
- **Plafonds** (15 min de course chaude, vol 1448 : ≈ 1,2 loop lourde/s et ≈ 1,3 gel/s) : **G 1200 lignes** (`c.Gp` = gels perdus au-delà),
  **M 1000 s** (`c.Mp` = secondes perdues), **LH 1500 lignes** (`c.LHp` = loops lourdes perdues, `c.LHt` = l'instant de la première, s ×10).
  Pire cas d'une course de 15 min : ≈ 250 Ko de LH (le contrôle estime plutôt 400-600 Ko, non mesuré) + 250 Ko de G + 80 Ko de M dans la boîte (localStorage ≈ 5 Mo ; la boîte retire les plus vieilles courses si besoin).
- **c.LH** (« lignes lourdes » ; s'appelait c.H avant le 3e tour — renommé : le PILOTE de qualité, qa/pilote, écrit `c.H = Array.from(PILO.h)`, son histogramme) :
  une ligne par loop > 60 ms (1500 au plus ; plein → analyse-vol.py se REPLIE sur G après `c.LHt`, et le dit) :
  [t s ×10, loop ms ×10, calculée 1 / sautée 0, sentinelle début / après rendu / fin (×100), sentinelle prise dans la loop (ms ×10, déjà retirée),
  WebGL sync ms ×10 + nombre, Canvas 2D ms ×10 + nombre, envois ms ×10 + nombre, 8 tranches (ms ×10), n, puis n paires (indice dans c.LHN, ms ×10) ≥ 0,3 ms].
- **c.LHN** : noms des sous-tranches. **c.SR** : leur somme (ms ×10) sur les images légères (loop < 25 ms), **c.SRn** : combien.
- **c.SY** : sur les MÊMES images légères, [ms ×10 synchrones, nombre, ms ×10 Canvas 2D, nombre, ms ×10 envois, nombre, somme des loops ms ×10] :
  la référence de l'ATTENTE PUCE (analyse-vol.py l'imprime sous chaque rafale, avec le rapport rafale / référence).
- **c.Y** : par appel (« gl getParameter », « 2d putImageData », « envoi drawElements »…) : [nombre, ms ×10, pire ×10] sur la course.

## analyse-vol.py : deux blocs de plus (l'ancien format reste lisible)
- **« LES RAFALES »** : une seconde est en rafale si elle porte ≥ 2 loops ≥ 80 ms « fil entier » (≥ 4 tranches à ×3 de leur référence). Deux secondes à ≤ 2 s = la même rafale.
  Source c.LH (ou c.H des vols du lot d'avant le 3e tour, si c'est une liste de LIGNES ; un c.H d'entiers = le pilote, ignoré) ; sinon G (ancien format, marqué). Par rafale : tranches moyennes ; puis (nouveau format) ATTENTE PUCE en % de la loop, les trois familles,
  SENTINELLES début / après rendu / fin (× la base de la course), SOUS-TRANCHES dominantes contre leur référence, et par seconde dans / hors rafale :
  sentinelle de début, Swift, retard natif, ms/s par famille, pression mémoire. Puis les 8 appels les plus coûteux de la course (c.Y).
- **« FILS ENTIERS × ÉCONOMIE × THERMIQUE × BRANCHÉ »** : chaque seconde (M[11]) avec ses gels « fil entier » de G (même classement que « LES GELS : QUI »),
  fils par minute, part des secondes en rafale. Marche sur tous les vols à mouchard (M ≥ 12 colonnes). « branché ? » = état inconnu ou batterie pleine (M[11] code 9).

## PROTOCOLE DE LECTURE (quel chiffre désigne quel mécanisme)
Lire une rafale du bloc « LES RAFALES ». Les seuils sont des repères, pas des lois.

| ce qu'on lit | mécanisme |
|---|---|
| **ATTENTE PUCE** de la loop lourde **nettement au-dessus de sa référence** (images légères, ligne « référence » sous la rafale, et ms/s hors rafale), surtout « envois » ou « synchrones » | **(a) la file vers la puce est pleine.** C'est à nous : on envoie trop (lot 4 : moins d'envois, loupe au chaud). |
| La sous-tranche lourde est un appel à la puce (passe du compositeur, `dont loupe`, `dont nxfDessine`, `qlSonde`) et M[17-22] monte en rafale | (a), et on sait OÙ. |
| ATTENTE PUCE faible, sentinelles **début ≈ après rendu ≈ fin ≈ ×4-5 la base**, toutes les sous-tranches ×N | **le processeur de la page est bridé** (état du téléphone). Notre levier : moins de travail (gouverneur de lenteur, lot 1). |
| … et la **sentinelle Swift** (M[25]) monte aussi dans la rafale, ou le **retard du battement** (M[26]) grandit | **tout le téléphone ralentit**, pas seulement la page. |
| Sentinelle Swift et retard stables pendant que la page ralentit | le bridage vise le processus de la page (WebKit), pas l'app. |
| Sentinelles PROCHES de la base (×1-1,5), attente puce faible, mais UNE ou DEUX sous-tranches à montant fixe énorme contre leur référence (c.SR) | **(b) un travail à nous** : la sous-tranche le nomme. |
| Sentinelles proches de la base, aucune sous-tranche anormale, mais les tranches gonflent PAR MORCEAUX, au hasard d'une image à l'autre | **(c) ramasse-miettes** (ou tâche du moteur web). À confirmer par 30 s de chronologie Safari Web Inspector (passages du GC). |
| Pression mémoire (M[24]) à 1 ou 2 pendant la rafale | la mémoire du téléphone entre en jeu (compression, purge) : à croiser avec (c). |
| Sentinelle de début HAUTE mais celle d'après le rendu basse (ou l'inverse) | le ralentissement change DANS l'image : lire quelle partie l'encadre. |

Rappels :
- ⚠ « ATTENTE PUCE » n'est PAS que de l'attente : elle compte aussi le simple ENCODAGE des appels (processeur) et drawImage (copie 2D). Une part de 70 % ne dit
  rien seule : la lire CONTRE la même part sur les images légères (c.SY) et contre les ms/s hors rafale. Un processeur bridé ×4 gonfle aussi l'encodage ×4 :
  si la part reste ≈ la référence pendant que les sentinelles montent, c'est le bridage, pas la file.
- Lire les MOYENNES des sentinelles (horloge au ms). Une mesure seule ne dit rien.
- Les chronos imbriqués (passes, `dont …`) sont DANS leur sous-tranche : ne pas les additionner.
- Le build de mesure ajoute lui-même du travail : une sentinelle par image (M[23] en donne la valeur), le pouls (~30 réveils/s quand l'image tarde).
  Mesurer une fois avec `?sans=pouls` et `?sans=sendebut` pour voir s'ils changent la case.
- En plus, pendant la séance : batterie.py (watts, température) et le syslog (CLTM). La chronologie Safari reste la mesure décisive pour (c).

## Bancs
- `node outils/banc-perf/rafales-vm.cjs code/moteur/mouchard-gels.js` : le morceau seul dans une machine virtuelle Node (prototypes WebGL / 2D factices).
  Dit, pour chaque adresse, si le mouchard et le lot s'allument, si les prototypes restent ceux d'origine, et ce que comptent les compteurs.
- `python3 outils/banc-perf/rafales.py` (Chrome, sous `~/cash-car/verrou-banc.sh`) : A sans perfrec (compteurs à zéro, prototypes natifs), B coût avec / sans `sans=rafales`,
  J le jeu entier (menu, départ, course, 12 images lourdes provoquées `dbgMouchard('lourd',90,12)`, processeur bridé, une RAFALE « fil entier » provoquée
  `dbgMouchard('fil',ms,n,3)` + bridage, fausse sonde native, portail, pause, reprise, MORT — la course se ferme d'elle-même et se relit SANS cacher l'onglet —,
  retour au menu par la maison, 2e course) : pannes de chaque étape, sentinelles au menu / en pause, boîte de vol passée à analyse-vol.py.
  `BASE=<index de origin/qualite-appareil>` ajoute N : base puis tête SANS drapeau (prototypes natifs dès la page prête, après 10 s de course, rAF/s).
- `dbgMouchard('fil',ms,n,e)` (banc) : les n prochaines loops pleines, une sur e, prennent +ms à CHAQUE borne b2…rendu (sous-tranche « banc · fil entier exprès »).
  `dbgMouchard('fil',1,0)` l'arrête.
  `SEUL=pouls` : l'interrupteur du pouls dans Chrome. Sorties : `outils/banc-perf/mesures/rafales*.json`, `rafales-analyse.txt`.
- `dbgMouchard('rafales')` : l'état du lot dans la page (sous-tranches, appels par nom, passes, dernière sonde native).

## PROUVÉ
- **Éteint sans perfrec** (rafales-vm.cjs, adresse vide et `?perfrec=0`) : MG.on faux, MGR.on faux, sentinelle de début éteinte, pouls non posé ;
  les 3 prototypes testés (getError, drawElements, putImageData) sont les ORIGINAUX ; après un `mgSt`, un getError, un drawElements, un putImageData :
  0 sous-tranche nommée, 0 appel compté ; les 10 colonnes de M valent -1.
- **Allumé** (`?perfrec=2`) : prototypes enveloppés, 1 sous-tranche, 3 appels comptés, M[17-22] = [0,1,0,1,0,1].
- **Interrupteurs** : `sans=rafales` → mouchard allumé, lot éteint, prototypes d'origine, 0 compté. `sans=glenvois` → drawElements reste d'origine (2 appels comptés au lieu de 3).
  **`sans=pouls`** → `MG.pc` nul (pouls non posé), le reste du lot allumé ; sans lui, le pouls est posé.
- **Gros script** : assemblage `--depuis-morceaux` ✔, `node --check` ✔, garde-demarrage OK, garde-allege ✔, garde-charte OK.
- **Natif** : `xcodebuild -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO` → BUILD SUCCEEDED (rien installé ;
  node_modules et public prêtés par le worktree finition-build le temps du build, puis retirés).
- **L'ancien format se relit** : analyse-vol.py sur vol-1117-1448, vol-1116-2058, vol-1114-2253 → code 0. Sur 1448 (G seulement) : 20 rafales trouvées
  (13:39 : 12 rafales, la plus longue 61-81 s, 78 loops lourdes, médiane 115 ms ; tranches b1 15 · b4 50 · rendu 21 — les montants fixes du juge).
  Croisement du seul vol 1448 : économie + serious + branché = 61,6 fils/min (262 s, 30 % en rafale) ; économie + fair + branché 10,8 ; économie + fair débranché 1,9 ;
  sans économie, serious débranché 1,8 ; économie + nominal 0,3.
- **Le nouveau format se lit** : un vol 1448 converti au format du lot (M à 27 colonnes, G à 51, c.H, HN, SR, Y aux valeurs inventées — 2e tour) → code 0, chaque ligne du bloc
  (ATTENTE PUCE, SENTINELLES ×base, SOUS-TRANCHES contre réf, PAR SECONDE dans/hors, appels de la course) sort avec les bons nombres.

## NON PROUVÉ
- (1er tour) le banc Chrome n'avait pas tourné : fait au 2e tour par le contrôle, puis au 3e tour (voir « 3e TOUR »).
- Rien n'a tourné sur le 13 Pro. Les sous-tranches, les familles d'appels et la sonde native n'ont vu que Chrome (et une fausse sonde native posée par le banc).
- La sentinelle Swift : compilée (Debug, simulateur), jamais exécutée. En Release le compilateur peut la vectoriser : sa base absolue sera à lire dans le premier vol (seul le RAPPORT compte).
- Le coût réel sur l'A15 : une sentinelle par image (0,2 à 1,2 ms) et ~150-300 appels WebGL enveloppés par image. Sur le banc il est sous le bruit ; à vérifier au premier vol (M[23], travail moyen).
- L'attente sur la file de la puce peut aussi tomber DANS une sous-tranche JS sans appel enveloppé (une allocation de texture paresseuse, un `uniform*` non enveloppé) : elle se verrait alors comme une sous-tranche lourde sans attente puce.

## 3e TOUR (18/11) — après le contrôle adverse du 2e tour
### Fait
- **c.H → c.LH** (et c.Hp/Ht/HN/HNp/HNpN → c.LHp/LHt/LHN/LHNp/LHNpN) : le pilote de qualité (qa/pilote) écrit `c.H = Array.from(PILO.h)` (son histogramme).
  analyse-vol.py lit c.LH ; à défaut un c.H fait de LIGNES (vols du lot d'avant) ; un c.H d'entiers (le pilote) est ignoré.
- **Fusions** : dans boucle-1.js la marque `mgSt('b1 entrée…')` est sur SA ligne, en tête de loop() (elle compte donc aussi le requestAnimationFrame) ;
  dans bvFinit la ligne `c.dur=…` est rendue intacte, `mgRFinit(c)` est sur une ligne à lui. `git merge-tree` : 0 conflit avec origin/qa/portv et origin/qa/pilote.
- **Sentinelle d'après le rendu** : seulement en course (`mgEnCourse()`).
- **⚠ TROUVÉ AU BANC : le guet du démarrage défaisait nos enveloppes.** page/debut-corps.html (« serpent ») enveloppe ~45 appels WebGL dès le chargement
  et, à sa fin, REMET les originaux qu'il avait gardés — par-dessus les nôtres. Au 1er passage du banc : plus AUCUN envoi compté à partir de la seconde 23
  (drawElements, bufferSubData, clear, getError, getParameter…). Sur le téléphone, le guet finit au menu : le lot n'aurait rien compté de ces appels en course.
  Correctif : nos enveloppes sont marquées (`__mg`) ; une fois par seconde (mgRSec) on regarde getError et on REPOSE si besoin, sans doubler (c.YR = combien de fois).
  rafales-vm.cjs le vérifie (originaux remis → reposés à la seconde suivante, 3 appels comptés, pas 6).
- **Page J refaite** : la course 1 n'est plus relue en cachant l'onglet (le jeu restait en pause). Vraie mort par `dbgBoom()` (dbgDeathNow ne fait que lire le son :
  au 2e passage la caisse ne mourait pas), la course se ferme d'elle-même (gameOver), retour à l'accueil par la maison, 2e course.
  Une rafale « fil entier » est provoquée : `dbgMouchard('fil',14,400,3)` + processeur bridé ×6 pendant 9 s.

### Prouvé (banc Chrome, iPhone 13 Pro émulé, muet, sous le verrou ; 3e passage, `outils/banc-perf/mesures/rafales*.json`)
- **A sans perfrec** : prototypes natifs après 12 s de course, `__MG` absent, compteurs à 0, 0 panne.
- **B coût** (846 images, 30 i/s) : travail moyen 3,17 ms sans le lot (`sans=rafales`), 3,14 ms avec (sous le bruit ; au 1er passage 3,55 → 4,09).
  Sentinelle de début 0,36 ms/image, 184 appels enveloppés/image, 0,26 ms dedans.
- **J** : 0 exception, 0 panne, loopErr nul à chaque étape. Sentinelles de début : 0 au menu, 0 en pause, 0 au menu après la mort ; d'après le rendu : 0 au menu.
  Mort réelle (gameOver, mode boom), course 1 fermée (1 course dans la boîte, onglet jamais caché), accueil affiché, 2e course réelle (360 loops, 360 sentinelles).
  Vol : M 27 colonnes (63 s), G 51 colonnes (64), LH 65 lignes (12 « lourd exprès », 50 « fil entier exprès »), 64 noms, 0 perdu, 5 passes nommées,
  fausse sonde native lue en M[24-26] = [0,25,3], c.YR = 1 (le guet a fini en course : reposé), 0 seconde sans envoi compté.
- **analyse-vol.py sur ce vol** (code 0) : le bloc RAFALES sort « RAFALE 28-37 s, 50 loops lourdes, médiane 91 ms » (fenêtre provoquée : 27-36 s) ;
  sentinelles ×6,4 / ×6,4 / ×5,8 la base, attente puce 1 % (référence 5 %), sous-tranche « banc · fil entier exprès » 74,8 ms en tête. Lecture du protocole :
  bridage + un travail à nous nommé — c'est bien ce qu'on a provoqué.
- **Base / tête SANS drapeau** (origin/qualite-appareil contre cette branche) : à la page prête, getError / drawElements / getParameter NE sont PAS natifs
  DANS LES DEUX (c'est le guet du démarrage, pas le lot : ça répond au point 8 du contrôle) ; après 10 s de course tout est natif dans les deux ; 30 i/s, 0 panne.

### Laissé (mineurs du contrôle)
- 4 : QLR.t0 avancé de la sentinelle d'après rendu décale un peu l'horodatage E.t : build de mesure seulement.
- 5 : taille réelle de LH non mesurée (estimation corrigée ci-dessus).
- 6 : plafond G 1200 juste pour 15 min chaudes : ⚠ G PLEIN s'imprime ; à relever au premier vol long.
- 7 : retour d'arrière-plan court compté en retard natif (Swift) : rare, pas de téléphone ici.
- Non prouvé : rien sur le 13 Pro ; les horodatages (cadence) base / tête n'ont pas été rejoués image par image.

