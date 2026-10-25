# LE FIL — une seule voix pour tout ce que le jeu annonce en course

2026-10-25 · demande de Sacha : « alléger visuellement le jeu, surtout le milieu, pour TikTok : les +1, +2, FLOW 2, BOOST, les éclairs vers la barre de nitro, BUMP, MONSTRE… plusieurs systèmes cohabitent et parasitent l'écran. Un seul système qui donne l'impression d'avoir accompli quelque chose sans prendre l'écran, et qui harmonise +1, flow et figures. »

## Intention
- Le **centre de l'écran** (route + caisse) ne porte plus AUCUN texte ni icône volante pendant la conduite.
- Le joueur sent toujours qu'il accomplit : un seul endroit parle, une seule typographie, une seule logique de niveaux.
- **Affichage seulement** : points d'aura, flow, nitro, argent, haptique, sons : inchangés.
- Réversible : `?fil=0` rend l'ancien affichage (même convention que `?bumpfig=0`).

## Constat (état d'origine, tout vérifié dans le code)
| # | Système | Fichier | Où ça s'écrit |
|---|---|---|---|
| 1 | `popTexte` : texte qui jaillit de la caisse (~30 appels : paliers de FLOW, `NOM +pts` de la chaîne, SLALOM, RACCOURCI, FRÉNÉSIE…) | `gameplay/sensations-flow.js` | suit la caisse (`popSuit`) |
| 2 | HUD des figures `#fh` : nom en grand, pastilles du combo, BUMP / DOUBLE BUMP… | `interface/hud-figures.js`, `css/figures.css` | centre haut (`--fhT`) |
| 3 | Verdict de pose `#verdHud` (MONSTRE, DOUBLE/TRIPLE, MÉTÉORE…) via `trickMsg` → `verdPousse` | `interface/jus-echelle.js`, `gameplay/pose-verdict.js` | couloir `--laneA` |
| 4 | `slam` `#slam9` : grande annonce (BOOST ×n, pouvoirs, paliers du ×) | `gameplay/aura-chaine.js` | couloir `--laneA` |
| 5 | Gains volants `volgLance` : `+N` d'aura et éclairs vers la barre de nitro | `interface/bouton-nitro-gains.js` | traversent l'écran |
| 6 | Billets `$` qui volent de la caisse au compteur (`flyCash`) | `interface/jus-echelle.js` | traversent l'écran |
| 7 | `trickBox` / `chainHud` (PC) | `jus-echelle.js`, `page/ecrans-garage.html` | centre (PC) |

Cohabitation mesurée dans le code : une figure posée déclenche à la fois #1 (nom + points), #2 (nom en grand), #3 (verdict), #5 (+N volant) et #6 (billets).

## Design

### 1. Une seule porte : `fil(nom, pts, niveau, couleur)`
- Nouveau morceau `code/interface/fil.js` (inscrit dans `ORDRE.txt` après `hud-figures.js`).
- `popTexte(txt, col, prio)` devient un alias de `fil` (la priorité 0-3 existante devient le niveau) : les ~30 appelants ne bougent pas.
- `trickMsg`, `verdPousse`, `slam` (hors compte à rebours, mort, seconde chance, carte moteur) et les rappels du HUD des figures appellent `fil` quand `FIL.on`.

### 2. La pastille, ancrée sous le compteur d'aura (haut gauche)
- Un seul élément `#fil`, collé sous `#auraV2` (même colonne que `#flowHud` / `#auraV2` : `--hudH`), police pixel du HUD, contour d'encre comme les autres textes.
- UNE ligne : la dernière remplace la précédente, sauf si la précédente est plus prioritaire et a moins de 650 ms (même règle que `popTexte` aujourd'hui).
- Les gestes enchaînés dans la même seconde **fusionnent** dans la pastille (« TONNEAU + SALTO · ×2,5 ») au lieu de produire un nouveau texte ; les points s'affichent une seule fois, au bout.
- Durée de vie ≈ 0,9 s ; hors écran de course (menu, mort, pause) : cachée.

### 3. Trois niveaux, aucun texte au centre
- **Silencieux** (flux continu : RÉCOLTE, SLALOM, +1/+2 de ramassage, `rob`) : rien d'écrit ; le compteur (aura / argent) pulse, un tic de son existant joue.
- **Normal** (figure plantée, palier de FLOW, BUMP, RACCOURCI, BOOST) : pastille à sa taille, couleur de la rareté de la figure ou du palier de flow (FLOW_COL).
- **Grand** (MONSTRE, MÉTÉORE, DIVIN, AU CHEVEU, record, FRÉNÉSIE) : la pastille grossit ×1,25 un instant, bords de l'écran en flash léger (`flashEcran` existant), confettis réduits. Toujours dans la pastille.

### 4. Ce qui disparaît
- Textes au-dessus de la caisse (#1 : seul `fil` écrit) et ligne du HUD des figures au centre (#2 : le combo se dit dans la pastille).
- Carte de verdict `#verdHud` (#3), annonce `#slam9` pour les gestes et paliers (#4).
- Les `+N` volants et les éclairs vers la barre de nitro (#5) : la barre se remplit en direct avec son éclat sur place (`nbPrend`, conservé), le compteur d'aura pulse.
- Les billets `$` volants (#6) : le compteur d'argent pulse à l'arrivée du gain.
- `trickBox` / `chainHud` sur PC (#7) : redirigés vers la pastille.

### 5. Hors périmètre (gardent leur affichage)
Compte à rebours de reprise, mort / GAME OVER, seconde chance, carte moteur, bannières de défis (`misBan`), bannière de niveau, pastille de pouvoir `#pwrChip`.

## Plan de mise en œuvre (incréments testables)
1. `fil.js` + CSS + `popTexte` redirigé. Mesure : plus de texte au-dessus de la caisse.
2. `trickMsg` / verdict / HUD figures (#2, #3, #7) redirigés vers `fil` ; `slam` pour les gestes.
3. Gains volants (#5) et billets (#6) coupés quand `FIL.on` ; pulsations des compteurs.
4. Réglages fins (durées, fusion, taille) et revue sur capture.
Chaque incrément est livré derrière `FIL.on` (défaut : vrai, `?fil=0` : faux).

## Vérification
- Banc : compter, par seconde de course, les éléments de texte visibles dans la bande centrale (x 20-80 %, y 15-75 %) avant (`?fil=0`) et après ; objectif : 0 après, > 0 avant.
- Capture : un saut avec figure + pose, une série de pièces, un palier de FLOW, un MONSTRE.
- `node code/assembler.cjs --verifier`, compilation des `<script>` d'index.html (`vm.Script`), cache `cashcar-vNNN` +1.

## Contraintes
- Version mobile gelée (25/10) : travail sur la branche `fil-hud`, rien n'est poussé sur `main` avant le signal de Sacha.
- Aucune ligne insérée au milieu de `CARS` / `CAR_UNLOCK` (non concernés).
