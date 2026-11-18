# Lot TRANSITIONS (18/11, nuit) — branche `qa/transitions`, partie d'`origin/qualite-appareil` (a42e9ec50)

Sacha : « Des fois, les animations de transition, elles pourraient être plus fluides. Par exemple, quand on relance une partie, il y a une jolie animation,
mais elle pourrait être moins buggée. »
La « jolie animation » de la relance = **le balayage pixel doré** du volet (`ecranWipe`, `code/economie/aura-banque-contrats.js`) : une mosaïque qui couvre
l'écran en 150 ms, la partie neuve se bâtit dessous (`rejoueAttend` puis `resetGame`), puis la mosaïque se retire en 280 ms. Le dessin n'a pas changé.

**Interrupteur : `?sans=transitions`** rend l'avant (tout le neuf est derrière `TRANS_ON`). `dbgTransitions()` : le dernier lever (attente, sortie, seuil,
images du retrait, pire intervalle du retrait).

## 1. La cause (lue dans le code, chiffrée au banc sans navigateur)

Le balayage est une toile 2D dessinée au rAF, SUR LE FIL PRINCIPAL, et MINUTÉE À L'HORLOGE (`t = (now − t0) / 280`).
- Le volet se levait **2 images après `fn`** (rAF, rAF), quel que soit l'état de la scène neuve.
- Or les premières images après `resetGame` (REJOUER) ou `openGarage` (JOUER depuis l'accueil) sont les plus lourdes de la transition : la chauffe de
  la scène neuve (`CHAUFFE_R`), les géométries et textures qui montent à la puce. Le lot TRANSITIONS-UI (13/11) les a mesurées au départ de course :
  **167 · 117 · 67 ms au processeur ×4** (passation/TRANSITIONS-UI.md).
- Ces images tombaient PENDANT le retrait. Le balayage étant minuté à l'horloge, une image de 167 ms le faisait avancer de 60 % d'un coup :
  la mosaïque **saute** (une diagonale entière disparaît d'une image à l'autre), puis la fin se joue en 2-3 images. C'est l'accroc.
- Rien n'attendait non plus la fin du balayage pour vider la classe du volet (460 ms fixes) : sans conséquence avant (le balayage finit à 336 ms à l'horloge),
  mais à corriger dès qu'il a sa propre horloge.

Le lot TRANSITIONS-UI avait déjà corrigé la même chose pour le voile chaud du LÂCHER (`departVoileLeve`, `?sans=departvoile`), pas pour le volet
(« REJOUER, retour accueil : non mesuré cette fois »).

## 2. Ce qui est fait (un seul morceau : `code/economie/aura-banque-contrats.js`)

1. **Le lever attend une image régulière** (`ecranWipe`, branche `TRANS_ON`) : au plus tôt à la 2e image après `fn` (comme avant), et seulement quand
   deux intervalles d'affilée sont sous le SEUIL ; au plus 450 ms après `fn` ; filet 700 ms (onglet caché). Le 1er intervalle part de la fin de `fn`.
2. **Le seuil suit le téléphone** : 40 ms, ou 1,3 × la médiane des intervalles notés pendant que le volet COUVRAIT (le même écran, juste avant `fn`).
   Un téléphone régulier à 20 i/s (50 ms) a un seuil de 65 ms : rien n'y change, il n'attend pas 450 ms pour rien.
3. **Le retrait a sa propre horloge** (`wipePxDraw`, phase `out`) : chaque image avance le balayage de son intervalle, plafonné au seuil (50 ms au moins).
   Une image longue le RETARDE au lieu de le faire sauter. À cadence régulière : au bit près la même progression.
4. **La classe du volet attend la fin du balayage** pour se vider (re-test toutes les 60 ms, 1,5 s au plus).
5. **Pas de clignotement du serpent** : le voile blanc du serpent (`voileSerpent`, prévu 350 ms après `fn` si sa promesse traîne) était annulé au lever ;
   comme le lever peut maintenant attendre après la fin du travail, son minuteur est annulé dès que le travail finit (sinon il aurait paru une image puis disparu).
- La phase qui COUVRE reste minutée à l'horloge : elle doit être pleine quand `fn` part (160 ms) — et elle l'est, le rAF passe avant le dessin de l'image.
- Rien d'autre ne change : ni la durée (150 / 280 ms à cadence régulière), ni les couleurs, ni la mosaïque, ni le son, ni `apres`, ni `cc:revele`.
- Les deux volets concernés : REJOUER (écran de fin → course), JOUER depuis l'accueil (volet → atelier → lâcher), MENU / GARAGE / BOUTIQUE / MISSIONS
  depuis l'écran de fin ou le garage (tous passent par `ecranWipe`).

## 3. Preuve sans navigateur — `node outils/banc-transitions/balayage.cjs`

Le VRAI code (balayage + `ecranWipe`, lus dans le morceau) sur une fausse page (toile qui compte ses cases, rAF et minuteurs simulés).
Colonnes : levé (ms après `fn`) · images du retrait · images > 50 ms pendant le retrait · **plus grand saut d'une image à la suivante (% de l'écran découvert d'un coup)** · retrait fini (ms après `fn`).

| scénario (intervalles après `fn`) | avant | après |
|---|---|---|
| 60 i/s régulières | 24 · 27 · 0 · **17 %** · 491 | 24 · 27 · 0 · **17 %** · 491 (identique) |
| 20 i/s régulières (téléphone critique) | 90 · 9 · 0 · 42 % · 590 | identique |
| **relance ×4 : 167 · 117 · 67 ms** | 160 · 17 · 2 · **44 %** · 625 | 391 · 27 · **0** · **17 %** · 859 |
| 33 · 167 · 117 · 67 ms | 40 · 9 · 3 · **81 %** · 508 | 40 · 20 · 3 · **17 %** · 692 |
| une image de 300 ms à la 3e | 24 · 10 · 1 · **100 %** · 491 | 24 · 21 · 1 · **17 %** · 675 |
| deux images de 120 ms | 24 · 15 · 2 · 78 % · 499 | 24 · 18 · 2 · 17 % · 549 |
| lourd sans fin (80 ms pendant 1 s) | 87 · 5 · 5 · 71 % · 567 | 487 · 11 · 7 · 42 % · 1 131 |

Lecture : le balayage ne saute plus (17 % = le pas normal d'une image à 60 i/s). Il est un peu plus long quand des images lourdes tombent dedans
(il les traverse au lieu de les sauter). Le pire cas (« lourd sans fin ») : le lever tient 450 ms puis le balayage avance de 50 ms par image de 80 ms.

## 4. Le temps entre l'appui et la course

- La course PART au même instant qu'avant : `resetGame` (gameOver faux, la physique tourne) n'a pas bougé ; le lever n'attend qu'APRÈS.
- Ce qui change : le volet se lève plus tard quand les premières images de la scène neuve sont lourdes (relance ×4 : +231 ms au banc sans navigateur),
  c'est-à-dire qu'on ne VOIT plus ces images figées sous la mosaïque. La 1re image FLUIDE de la course arrive au même instant (la scène met le même
  temps à chauffer). À cadence régulière (ordinateur, téléphone frais) : 0 ms de plus.
- Sous le volet, la physique avance pendant ces images lourdes comme avant pendant le balayage (dt plafonné à 50 ms par image : 150 ms de jeu au plus).

## 5. Le banc Chrome — `outils/banc-transitions/`

- `transitions.py` : Chrome sans fenêtre, iPhone 13 Pro en paysage (844×390 ×3, tactile), `?tel=1&palier=2`, muet (`--mute-audio`, sfx/mus/vox faux),
  processeur ×4 après la chauffe du menu. Par tour : JOUER, PAUSE (ouvre/ferme), PORTAIL (`dbgPortail`), MORT, REJOUER, MENU. Pour chaque transition :
  pire image, images > 50 / > 100 ms, images et pire intervalle de la phase qui couvre et de celle qui se retire, appui → volet levé, appui → course,
  LoAF (scripts > 8 ms). `--film d` : la suite d'images de JOUER et REJOUER (Page.startScreencast) ; `--profil` : profil de la relance.
- `passe.sh <étiquette> [tours]` : une passe A/B sous le verrou commun (`?sans=transitions` puis défaut, chacun son Chrome, 340 s chacun).
- `sous-verrou.sh` : une commande sous le verrou, ne rend que SON verrou.
- `balayage.cjs` : le banc sans navigateur ci-dessus (sortie 1 si l'après saute plus que l'avant).

## 6. Mesures Chrome

(voir la section « MESURES CHROME » plus bas si elle existe : le verrou commun était tenu par 15 à 20 chantiers cette nuit.)

## 7. Non prouvé / à voir sur le téléphone
- Sur le 13 Pro : `dbgTransitions()` après un REJOUER (attente, sortie `régulier` / `450 ms`, `outPire`). Si la sortie est souvent `450 ms`,
  c'est la scène neuve elle-même qu'il faut chauffer en tranches sous le volet (comme le lot portv au portail : chauffeRendu par morceaux).
- WebKit : la toile 2D se dessine sur le fil principal comme dans Chrome ; aucune hypothèse sur le compositeur n'est faite.
- Les autres transitions de l'inventaire (pause, mort, portail) : voir les mesures Chrome ; le lot TRANSITIONS-UI a traité la cadence des menus,
  les photos de caisses et le voile du lâcher ; le lot portv le passage du portail.
