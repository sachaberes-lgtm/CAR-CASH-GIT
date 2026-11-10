# Joystick NITRO et figure au hasard — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le bouton NITRO devient un joystick qui lance, au seuil et avec une vibration, la figure équipée de la direction poussée ; le double-tap lance une figure au hasard adaptée au braquage, à la rotation et au temps de vol.

**Architecture:** On réutilise la plomberie du mode GLISSER (`GLI`, `gliDn/gliMv/gliUp`, requête lue par la boucle) en la rendant permanente, déclenchée au seuil, et branchée sur les emplacements équipés (`figSlots`) au lieu de figures fixes. Un nouveau morceau `gameplay/figures-joystick.js` porte le tirage adapté (`figTireAdapte`), l'état `FJOY` et le visuel du pion ; `veqFigure` l'appelle au double-tap. Le réglage 2 TAPS / GLISSER disparaît.

**Tech Stack:** JS d'une seule fermeture (voir CLAUDE.md), three.js, CSS en morceaux, assembleur `node code/assembler.cjs`, banc Chrome headless via `outils/banc-trainees/cdp.cjs`.

**Spec:** `docs/superpowers/specs/2026-11-10-joystick-nitro-figures-design.md`

## Global Constraints

- Worktree `C:\Users\sacha\OneDrive\Desktop\CASH-CAR-joystick-figures`, branche `joystick-nitro-figures-2026-11-10`, base `origin/main`. On n'édite jamais `VERSION PRINCIPALE/index.html` à la main : `node code/assembler.cjs` après chaque modif de `code/`, puis commit de `code/` ET `index.html` ensemble.
- Chaque commit qui change le jeu : `cashcar-vNNN` +1 dans `VERSION PRINCIPALE/sw.js` (le hook pre-push l'exige).
- Noms et commentaires en français ; une section s'ouvre par `/* ===== TITRE (2026-11-10, Sacha : « la demande ») ===== */` ; jamais de `//` au milieu d'une ligne.
- Visuel allégé sur `ALLEGE` ou `TEL_NATIF`, jamais sur `IS_MOBILE`. Réduction des animations : `REDUCED_MOTION`.
- Navigateur de test muet : couper `sfx`, `mus`, `vox` dans `localStorage.cashcarSave` avant tout clic.
- Piège Edit/CRLF : après un Edit, `git diff --numstat` ; si tout le fichier change, corriger (voir mémoire `edit-crlf-piege`).
- Valeurs de la spec : seuil `GLI.seuil` ≈ 38 px (à régler au banc), zone morte 12 px, réarmement à 40 % du seuil, `IMPU.max` = 4 empilements, `DTAP.garde` = 250 ms, repères ▲ ▼ ◄ ►.
- Ne jamais pousser : la livraison est décidée par Sacha.

## Review Focus

1. Un joystick poussé puis relâché vite, suivi d'un tap : pas de double-tap fantôme ni de redressement (`VEQ.dDn`, `FX2.redP`) qui annule la figure. Tests en Task 3.
2. Poussée à l'image du décollage (`figLance` renvoie `{attente:true}`) : comptée comme lancée, jamais deux fois, jamais un refus. Task 3.
3. Joueur qui ne possède que le TAIL WHIP, ou aucune figure avant/arrière : le tirage ne plante pas, retombe sur ce qui existe, sinon refus propre. Task 2.
4. Pause, mort, seconde chance, perte de focus, changement de mode au milieu d'une poussée : aucune requête périmée ne part à la reprise. Task 4.
5. Noms anglais longs et mode gaucher (`GAU`) : repères lisibles, jamais hors écran. Task 5.

---

### Task 1: Le banc du joystick (échoue d'abord)

**Files:**
- Create: `outils/banc-figures/joystick.cjs`

**Interfaces:**
- Consumes: `outils/banc-trainees/cdp.cjs` (`serveur`, `portLibre`, `lanceChrome`, `tueChrome`, `CDP`, `dormir`, `tmp`) ; modèle de démarrage : `outils/banc-course/course.cjs` (UA iPhone, sauvegarde semée, `?colonne=0&tel=1&intro=ancien&attente=0&chute=0&carte=nuages&garde=1`, `dbgJouer()`, `dbgAuto(true,0,{saut:3,imp:22})`).
- Produces: `node outils/banc-figures/joystick.cjs --sc <nom|tous> [--http 9801 --cdp 9802]` ; helpers internes `pousse(dx,dy,ms)` (touchStart sur le centre de `#tNitro`, touchMove par pas de 6 px, touchEnd), `volant(x,y)` (second doigt sur `#tSteer`), `enVol()` (attend `dbgState`/`dbgVol().mode==='fall'`). Scénarios : `directions`, `vide`, `seuil`, `tirage`, `multitouch`, `reprise`, `ecole`. Sortie : une ligne `OK|KO scénario : détail` par scénario, code de sortie ≠ 0 au premier KO, et toute exception de page fait KO.

- [ ] **Step 1: Écrire le banc**

Squelette de `course.cjs` (ports, Chrome 844×390 tactile, sauvegarde semée avec `figs` = quatre figures dont une par direction, `figEq3` = `['saltoa','saltov','tonneau']` à vérifier avec `Object.keys(FIG.par)`). Chaque scénario lit les compteurs de `window.dbgJoy()` (Task 2/3) et `dbgFig().lancees`. Assertions écrites dès maintenant :
  - `directions` : en vol, pousse haut → `dbgFig().slots[0]` lancé (compteur `lancees` +1, `der` = id de l'emplacement 0) ; bas → emplacement 1 ; gauche → emplacement 2 avec `sens` du côté gauche ; droite → côté droit.
  - `vide` : `figEq3=['','','tonneau']`, pousse haut → `lancees` inchangé, `dbgJoy().refus` +1.
  - `seuil` : pousse de 20 px (sous le seuil) → rien ; pousse de 60 px → une seule figure et `dbgJoy().vib` = 1 ; revient à 5 px puis repousse → une 2e (empilement si même figure).
  - `tirage` : voir Task 2.
- [ ] **Step 2: Lancer**
Run: `node outils/banc-figures/joystick.cjs --sc directions`
Expected: KO (« dbgJoy is not a function » ou aucune figure lancée) — preuve que le banc voit l'ancien comportement.
- [ ] **Step 3: Commit**
```bash
git add outils/banc-figures/joystick.cjs && git commit -m "Banc du joystick NITRO : scénarios (échouent avant l'implémentation)"
```

### Task 2: Le tirage au hasard adapté

**Files:**
- Create: `code/gameplay/figures-joystick.js` (inscrit dans `code/ORDRE.txt` juste après `interface/hud-figures.js`, avec une ligne de description)
- Modify: `code/gameplay/vol-equilibre.js` (`veqFigure`, ligne ~243-246)
- Modify: `code/gameplay/figures-physique.js` (`figRefus` : compteur `FX2.refus`)
- Test: scénario `tirage` du banc

**Interfaces:**
- Consumes: `veqFigsAMoi()`, `figSlots()`, `figPeut(id)`, `figDirSlot()` (lit `TCTL.st/sv` ou le clavier), `FDIR.x`, `FIG.dirs`, `FIG.oriente`, `FIG.tire(ids,derniere)`, `figDose`, `figDMin(f,douce)`, `figBudget()`, `FX2.corps.figs`, `figLance(s,o)`.
- Produces:
  - `const FJOY={on:!/[?&]figjoy=0\b/.test(location.search),der:null,n:0,refus:0,vib:0,...}` (état partagé avec Task 3/4/5).
  - `function figTireAdapte(o:{dispo?:number,x?:number,y?:number}) -> {f:Figure,dx:number,sens?:number}|null` : candidats = `veqFigsAMoi()` ; (1) garde celles dont la durée tient dans le vol : `figDose(f,bud) >= figDMin(f,o.dispo!=null)` avec `bud = o.dispo ?? figBudget()` ; (2) si le pouce gauche (x,y, par défaut `figDirSlot` / `FDIR.x`) est sorti de la zone neutre (|x|≥.3 ou |y|≥.3), ne garde que celles dont `figPeut(id)` contient l'emplacement visé et renvoie `dx=FDIR.x` pour le côté ; sinon, si une figure tourne déjà (`FX2.corps.figs` non payée avec `mv`), renvoie son sens dans `sens` ; (3) oriente les figures à deux sens (`FIG.oriente(f,'avant'|'arriere')`) selon la rotation x en cours `FX2.corps.w[0]`, au hasard si |w[0]|<.3 (signe à vérifier au banc avec `dbgFig().w`) ; (4) `FIG.tire(ids,FJOY.der)` évite la répétition et mémorise `FJOY.der`. Liste vide → `null`.
  - `window.dbgTirage(n,o) -> {tires:{id:count},refus:number}` : n tirages à sec (sans lancer).

- [ ] **Step 1: Test** — scénario `tirage` : sauvegarde `figs` = 5 figures variées ; 200 appels `dbgTirage(200,{dispo:d})` pour d ∈ {.5,.8,1.2,2} : zéro `null` quand une figure tient, aucune figure plus longue que le vol ; avec `{x:1,y:0}` seules des figures de côté ; avec `{y:1}` seules des figures avant ; jamais la même figure deux fois de suite quand ≥2 candidates. Puis intégré : dix vols (`dbgAuto` avec `saut`), double-tap réel (deux `touchStart/touchEnd` brefs à 150 ms sur `#tNitro`) → `dbgFig().lancees` augmente à chaque vol et `FX2.refus` reste 0.
- [ ] **Step 2: Lancer** : `node outils/banc-figures/joystick.cjs --sc tirage` → KO (fonction absente).
- [ ] **Step 3: Implémenter** `figTireAdapte` et `dbgTirage` dans `figures-joystick.js` ; dans `veqFigure`, remplacer la branche `FDIR.on` du double-tap et du saut nitro par : si `FJOY.on`, `const t=figTireAdapte({dispo:dispo}); return !!(t&&figLance(-1,{f:t.f,sens:t.sens,dx:t.dx,double:true,empile:true,dispo:dispo,muet:dispo!=null}))` (refus propre via `figRefus(-1)` si `null` en vol) ; sinon garder la ligne actuelle (`?figjoy=0`). Ajouter `FX2.refus=(FX2.refus|0)+1` dans `figRefus`.
- [ ] **Step 4: Assembler et relancer** : `node code/assembler.cjs && node outils/banc-figures/joystick.cjs --sc tirage` → OK. Plus `node outils/banc-course/non-declares.cjs` (aucun identifiant non déclaré, aucun doublon).
- [ ] **Step 5: Commit** (`sw.js` +1) : « Double-tap : figure au hasard adaptée au braquage, à la rotation et au temps de vol ».

### Task 3: Le joystick NITRO, au seuil et avec vibration

**Files:**
- Modify: `code/moteur/mobile-tactile.js` (lignes ~30, 54-87 : `bindHold` up, `nitroDown`, `gliDn/gliMv/gliUp/gliLibre` et leurs écouteurs)
- Modify: `code/gameplay/figures-physique.js` (`figGJoue`, `figGOpts`, `figGlisseOn` supprimé ou figé)
- Modify: `code/gameplay/figures-joystick.js` (`figJoyOpts`, `dbgJoy`)
- Test: scénarios `directions`, `vide`, `seuil`

**Interfaces:**
- Consumes: `figLance`, `figSlots`, `FIG_DIR`, `frLance`, `gsolLance` (le sol ne change pas), `hap`, `figRefus`.
- Produces:
  - `function figJoyOpts(d:'l'|'r'|'u'|'d') -> {s:number,o:object}` : `u`→emplacement 0, `d`→1, `l`/`r`→2 ; `o={double:true,empile:true,strict:true,dx:(d==='l'?1:d==='r'?-1:0)}` (le braquage « > 0 = gauche » du jeu).
  - `GLI.req` lancé **dès que** la distance du pouce à son point d'appui atteint `GLI.seuil` (coup sec supprimé : un seul déclenchement), `FJOY.arme=false` ; réarmé quand la distance repasse sous `GLI.seuil*.4`. À chaque lancement : `hap([10,22])`, `FJOY.vib++`, `VEQ.dDn=0` et `FX2.redP=0` (annule le double-tap en attente et le redressement).
  - `window.dbgJoy() -> {on,arme,dir,n,refus,vib,der}`.
  - En l'air, `figGJoue(d)` appelle `figLance(s,o)` de `figJoyOpts(d)` ; au sol il garde `gsolLance(d)` / `frLance` d'aujourd'hui.

- [ ] **Step 1: Test** : scénarios `directions`, `vide`, `seuil` de la Task 1, plus : pousse + relâche en < 300 ms puis tap à 200 ms → aucun deuxième lancement ni redressement (`FX2.redresse` inchangé) ; poussée à l'image du décollage (`dbgAuto` saut + `pousse` immédiat) → `lancees` +1 exactement.
- [ ] **Step 2: Lancer** → KO.
- [ ] **Step 3: Implémenter.** `bindHold` et `nitroDown` appellent `veqDoigt` sans condition (le double-tap reste). `gliMv` : calcule la distance et la direction (`figGDir`), tire au seuil, réarme comme ci-dessus. `gliLibre` retourne toujours `false` (plus de glissé n'importe où) et ses écouteurs `document` sont retirés. `figGlisseOn()` n'existe plus : retirer ses appels (`mobile-tactile.js`, `hud-figures.js` `fhArme`, `auto-ecole.js`, `figGClasse`) ; `?figjoy=0` coupe `gliMv` (aucun lancement) pour comparer.
- [ ] **Step 4: Assembler, banc** `--sc directions`, `--sc vide`, `--sc seuil` → OK ; `non-declares.cjs` propre.
- [ ] **Step 5: Commit** (`sw.js` +1) : « NITRO devient un joystick : la figure de la direction part au seuil, avec une vibration ».

### Task 4: Remises à zéro et multitouch

**Files:**
- Modify: `code/gameplay/seconde-chance.js` (lignes ~388 et ~421 : ajouter `fjoyRaz()`)
- Modify: `code/gameplay/figures-joystick.js` (`fjoyRaz`, écouteurs `blur`, `visibilitychange`)
- Modify: `code/moteur/boucle-1.js` (ligne ~188 : la requête périmée se jette déjà par `DTAP.garde` ; y ajouter la coupure si `mode` change)
- Test: scénarios `multitouch`, `reprise`

**Interfaces:**
- Produces: `function fjoyRaz()` : `GLI.id=null; GLI.req=null; FJOY.arme=true; FJOY.dir=null;` et cache le pion (Task 5).

- [ ] **Step 1: Test** : `multitouch` — un doigt sur le volant (`volant(1,0)`) et un sur NITRO (`pousse(0,-60)`) : la figure part, `steer` reste braqué, relâcher NITRO ne coupe pas le volant ; `reprise` — pousse, puis `dbgPause`/pause réelle, reprise : `lancees` inchangé ; pousse puis mort (`dbgMort`/crash) puis nouvelle partie : aucune figure fantôme ; changement de mode sol → vol pendant la poussée : au plus une figure, pas d'exception.
- [ ] **Step 2: Lancer** → KO.
- [ ] **Step 3: Implémenter** `fjoyRaz` et ses appels ; identifiants de doigts : `GLI.id` n'est écrasé que si `null`.
- [ ] **Step 4: Assembler, banc** `--sc multitouch`, `--sc reprise` → OK.
- [ ] **Step 5: Commit** (`sw.js` +1) : « Joystick NITRO : remises à zéro (pause, mort, seconde chance, focus) et deux doigts ».

### Task 5: Le design du pouce

**Files:**
- Create: `code/css/joystick-nitro.css` (`<style id="joystickNitro">`, inscrit dans `ORDRE.txt` après `css/paufinage-boutons.css`)
- Modify: `code/gameplay/figures-joystick.js` (`figJoyVoit`, `figJoyLeg`)
- Modify: `code/interface/hud-figures.js` (`figGVoit` et `#figGl` retirés, `fhLegMaj` gardé pour le clavier)
- Modify: `code/css/ecole.css` (règle `body.figGlisse #fhLeg` remplacée par `body.touch #fhLeg{display:none}`)
- Test: scénario `visuel` du banc (photos) + mesures

**Interfaces:**
- Consumes: `figSlots`, `figCourt(f)`, `figRarH(f)`, `FH_COUL`, `getBoundingClientRect()` de `#tNitro`, `ALLEGE`, `REDUCED_MOTION`, `GAU`, `LANG`.
- Produces: `#tJoy` créé en JS (comme `#figGl` l'était) : un socle rond centré sur `#tNitro`, un pion qui suit le pouce (retenu à 56 px du centre), quatre repères ▲ ▼ ◄ ► avec `figCourt(f)` dans la couleur de rareté, emplacement vide grisé ; `function figJoyVoit(d,dx,dy)` allume la direction visée et « claque » (classe `.claque`, 160 ms) au seuil ; `function figJoyLeg()` recalcule les noms quand `figSlots().join(',')+LANG` change ; au sol, les repères donnent `figGNom(d)` (WHEELIE, TAIL WHIP, salto). Sous `ALLEGE` ou `REDUCED_MOTION` : pas de `filter` ni de secousse, seulement un changement de couleur.

- [ ] **Step 1: Test** : le banc prend des photos 844×390 et 390×844 (voir `outils/banc-hud/photos.cjs`) du pion au repos, à mi-course, au seuil, en français et en anglais, mode droitier et gaucher (`GAU`) ; mesure par `getBoundingClientRect` qu'aucun repère ne sort de l'écran (marge 8 px) ni ne recouvre le disque NITRO.
- [ ] **Step 2: Implémenter** CSS (variables en `:root`, charte du jeu) et JS ; brancher `figJoyVoit` dans `gliDn/gliMv/gliUp/gliCoupe` à la place de `figGVoit`.
- [ ] **Step 3: Assembler, banc** `--sc visuel`, regarder les photos ; relancer `--sc seuil` pour vérifier que le visuel ne change pas le déclenchement.
- [ ] **Step 4: Commit** (`sw.js` +1) : « Le pouce : socle, pion et repères des figures autour de NITRO ».

### Task 6: Réglage retiré, auto-école, traductions

**Files:**
- Modify: `code/page/ecrans-menus.html:158` (ligne `data-m="figg"` supprimée)
- Modify: `code/moteur/mobile-tactile.js:844` et `:921` (`mvFigG`, `figGBascule`)
- Modify: `code/gameplay/figures-physique.js` (`figGBascule`, `figGClasse`, commentaire d'en-tête)
- Modify: `code/interface/auto-ecole.js:26` et `:215` (consigne et main : « Tape 2 fois vite sur NITRO ou pousse NITRO »)
- Modify: `code/interface/traductions.js` (nouvelles chaînes FR/EN ; retirer celles de GLISSER)
- Test: scénario `ecole`

- [ ] **Step 1: Test** : `ecole` — partie neuve avec `tuto:0`, l'étape FIGURE se valide par `pousse` au seuil, puis (nouvelle partie) par double-tap ; réglages : aucune ligne FIGURES ; `SAVE.d.figG` présent dans une vieille sauvegarde ne change rien.
- [ ] **Step 2: Lancer** → KO.
- [ ] **Step 3: Implémenter** les suppressions et la consigne ; les deux gestes incrémentent `TUTO.sauts` (déjà fait par `veqDouble` ; ajouter dans `figGJoue` côté joystick).
- [ ] **Step 4: Assembler et relancer** `--sc ecole`, puis `tous`.
- [ ] **Step 5: Commit** (`sw.js` +1) : « Réglage 2 TAPS / GLISSER retiré ; auto-école : joystick ou double-tap ».

### Task 7: Vérification de bout en bout

**Files:** aucun nouveau.

- [ ] **Step 1:** `node outils/banc-figures/joystick.cjs --sc tous` → tout OK ; `node outils/banc-course/course.cjs` (course complète, 0 exception) ; `node code/assembler.cjs --verifier` ; `bash garde-allege.sh` ; `bash garde-charte.sh` ; `node outils/banc-course/non-declares.cjs`.
- [ ] **Step 2:** photos finales du pion (FR/EN, droitier/gaucher, debout/couché) jointes au rapport ; noter les valeurs réglées (seuil, rayon du pion).
- [ ] **Step 3:** Sacha décide du merge et du push ; vérification de publication ensuite (`/jouer/sw.js` donne la nouvelle version).
