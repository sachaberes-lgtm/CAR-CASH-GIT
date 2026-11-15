# LOT 2 — LES RÉGLAGES HAUTE / BASSE (14/11, chantier QUALITÉ PAR APPAREIL)

Branche `qa/reglages` (partie de `qualite-appareil`), worktree `~/cash-car/qualite-reglages`. Rien dans `code/maps/*`, ni `VERSION PRINCIPALE/index.html`, ni `sw.js` (l'intégrateur réassemble par `node code/assembler.cjs --depuis-morceaux`).

## Ce qui est fait

Sur TÉLÉPHONE (`TEL_NATIF`), IMAGE n'a plus que deux positions : **BASSE** (`'fast'`, EN : LOW) et **HAUTE** (`'haute'`, EN : HIGH).

- **Le drapeau** `Q2_ON` = `TEL_NATIF && PRF.on` (le profil d'appareil ; l'interrupteur `?sans=reglage2` a été RETIRÉ le 15/11, voir plus bas) — `code/sauvegarde.js:12` (déclaré avant `SAVE`, visible de tout le grand script).
- **Le défaut de l'appareil** `qDefautTel()` — `code/sauvegarde.js:13-15` : `PRF.on` → classe `PRF.c` ≥ 3 : `'haute'`, sinon `'fast'` ; sans profil (lot 1 absent, ou `PRF.on` faux) → l'ancienne règle ramenée à deux valeurs : `PAL.b('qNetDefaut')` (palier 2 = 1) → `'haute'`, paliers 0-1 → `'fast'`. Lecture de `PRF` sous `try` (zone morte impossible à faire planter).
- **Sauvegarde neuve** — `code/sauvegarde.js:21` : `q = Q2_ON ? qDefautTel() : (l'ancienne règle)`.
- **Désinfection / migration** (`san`, passe à chaque chargement, aux codes importés et au miroir natif) — `code/sauvegarde.js:81` : sur téléphone, `'net'` (choisi ou non, `qChoisi` absent compris) → `qChoisi=0` → défaut de l'appareil. `'fast'`/`'haute'` choisis restent ; non choisis → défaut.
- **Le choix à deux positions** — `code/moteur/mobile-tactile.js:333-346` :
  - `qRegle(q)` (:337) : écrit `SAVE.d.q`, `qChoisi=1`, `flush` ; rien d'autre si la valeur ne change pas ; sinon `prfRegle(q)` si `PRF` existe et `PRF.on` (et `prfRegle` est une fonction), sinon l'ancien `applyQ(q==='fast')`. À chaud.
  - `qVers(el)` (:340) : ordinateur / téléphone hors profil → `qSuivant` (le cycle à trois, mot pour mot) ; téléphone → la moitié touchée (`[data-q]`), ailleurs sur la ligne → l'autre position.
  - `qChoixHtml(dm)` (:344) : `BASSE | HAUTE` (du moins au plus), `role=radio`/`aria-checked` ; dans l'écran RÉGLAGES chaque moitié porte `data-m="q"` (mHit rend l'élément `[data-m]` le plus proche : sans lui mTap ne sait pas quelle moitié a été touchée).
  - `qAideTxt()` (:346) : la ligne d'explication.
  - Pause : rendu `:362` (+ classe `q2` sur `.tpPanel`), clic `:412`. Écran RÉGLAGES : rendu `:902` (mFill), clic `:983`.
  - Démarrage `:11` : si `PRF.on` et `PRF.q !== SAVE.d.q` (le profil a lu la sauvegarde BRUTE avant la désinfection), `prfRegle(SAVE.d.q)`.
- **HTML** — `code/page/ecrans-menus.html:156` `#mvQAide` (sous la ligne IMAGE de #mSet) ; `:244` `#tpQAide`, posé EN DERNIER dans `.tpPanel` (les règles `:nth-child(even)` / `(-n+2)` des cases de la pause, ux8.css:123-124, ne bougent pas). Les deux ont `hidden` : seul `Q2_ON` les ouvre.
- **Textes** — `code/interface/passe-textes.js:10-13` : `'Le plus beau que ton téléphone sait afficher (quelques accrocs possibles)'` → `'The best your phone can show (a few hiccups possible)'` ; `'La fluidité d'abord'` → `'Smoothness first'`. BASSE/LOW = la clé `RAPIDE` existante ; HIGH reste posé par le bloc mobile (`mobile-tactile.js:330`) — le déplacer dans passe-textes aurait changé l'ordinateur anglais (HAUTE → HIGH).
- **CSS** — nouveau morceau `code/css/reglage-image.css` (inscrit dans `ORDRE.txt` après `boutique-a-iphone.css`) : `b.choix2` = la glissière creuse de l'interrupteur (`--k0`, `--kl`, `skewX(var(--sk))`), le patin levé (dégradé de `b.bascule.ko::before`) sous la position prise, le mot pris en cyan comme les autres valeurs ; Press Start, 8 px. Ligne d'explication 8 px, `--tx3`, alignée sur le libellé. Pause : COUCHÉE seulement (debout, IMAGE vit dans TOUS LES RÉGLAGES depuis le 23/10 : je n'ai pas changé ça) ; l'explication court sous les quatre cases, toute la largeur (`.tpPanel.q2` : 3e rangée `auto`). Toutes les règles d'affichage de `.qAide` portent `:not([hidden])`.

## Interrupteur
`?sans=reglage2` : **RETIRÉ (15/11, relecture n3 / n6 / n12, lot petits).** Il ne pouvait pas rendre « les trois choix d'avant » sur un téléphone profilé : `PRF.q = prfQ(SAVE.d.q)` range `'net'` au défaut de la classe (le profil n'a que deux niveaux d'image, BASSE et HAUTE), donc NETTE aurait affiché trois crans sans donner trois images (état mixte). Le VRAI témoin d'avant est `?sans=profil` (`PRF.on` faux : `Q2_ON` faux, trois crans, défaut et migration d'avant, ancienne image). Sans interrupteur, `Q2_ON === PRF.on` sur téléphone (PRF n'existe que sur `TEL_NATIF`, et `prfHors` tourne avant `sauvegarde.js`), donc `qSuivant`, `qLbl`, `prfQ` et l'écran disent la même chose. Un seul mot reste ailleurs : `integ.md` (lignes 12 et 93) cite encore l'ancien interrupteur, rapport d'intégration non retouché.

## VÉRIFIÉ (banc `outils/banc-reglages/reglages.cjs`, Chrome sans fenêtre, muet, iPhone 13 Pro émulé DPR 3, tactile + métriques mobiles + hover:none ; `dbgImg().telNatif === true` relu à chaque étape ; `?appareil=iPhone14,2` palier 2, `?appareil=iPhone12,8` palier 1 ; SANS le lot 1 : `PRF` n'existe pas, c'est donc le repli qui est vérifié)
- Syntaxe : script principal extrait d'index.html réassemblé, `node --check` OK ; `garde-charte.sh` et `garde-allege.sh` OK ; assembleur « 328 morceaux d'accord ».
- Photos 390×844 et 844×390, FR et EN, RÉGLAGES (avant/après bascule) et pause couchée (avant/après) : aucun débordement mesuré (`scrollWidth`/bord d'écran) sur le choix ni sur la ligne. Pause couchée : le bas des boutons reste à ~357 px sur 390.
- Taps : tap sur la ligne → l'autre position ; tap sur HAUTE → HAUTE ; sur BASSE → BASSE ; tap sur la position déjà prise → rien ne change. À chaud : `dbgNette().cap` passe 1 ⇄ 1,25 sans rechargement.
- Migration (palier 2, sans profil) : `'net'`+`qChoisi:1` → `'haute'`, 0 ; `'net'` sans `qChoisi` → `'haute'`, 0 ; `'net'`+0 → `'haute'`, 0 ; `'haute'`+1 → reste ; `'haute'`+0 → défaut `'haute'` ; `'fast'` sans `qChoisi` → défaut `'haute'` ; `'fast'`+1 → reste. Palier 1 : `'net'`+1 → `'fast'`, 0 ; `'haute'`+0 → `'fast'`. La sauvegarde écrite est déjà migrée au chargement ; le rechargement garde le choix (HAUTE et BASSE).
- ORDINATEUR (1280×800, souris, `tel:false`) : `'net'`+1 gardé, la pause du bureau montre MOYENNE puis HAUTE au clic (cycle à trois), `#tpQAide` reste caché, aucune exception.

## PAS vérifié
- Avec le lot 1 : `prfRegle`, le défaut par classe (`PRF.c` 1-2 → BASSE, 3-4 → HAUTE), la resynchronisation du démarrage (`mobile-tactile.js:11`). Codé contre l'API figée, gardé par `typeof`.
- Ordinateur en `?tel=1` : le banc n'a pas pu le lancer (`dbgJouer`/`dbgNette` absents de la page, MÊME sur l'index d'avant mes changements — défaut du banc, pas du jeu). Par lecture : `Q2_ON` ne dépend que de `TEL_NATIF`, `?tel=1` ne le touche pas.
- iPhone SE / 13 mini couchés (375 px de haut, `max-height:380px`) : non photographiés.
- Le son du tap (rôle `onglet`, inchangé) : jamais joué au banc (muet).

## À juger sur le vrai iPhone 13 Pro
- Le choix se lit-il d'un coup d'œil (patin + cyan) en plein jour ? la ligne en 8 px minuscules Press Start est-elle lisible ?
- La pause couchée un peu plus haute (≈ +17 px, le bas des boutons passe de ~340 à ~357 px sur 390) : ne touche-t-elle pas l'encoche / le bas ?
- Le tap sur une moitié (cible ~60 × 24 px en pause) : assez grande au pouce ?

## Questions ouvertes / pour l'orchestrateur
1. **Conflit de règles à trancher** : « tout appareil hors profil ne change pas d'un pixel » contre « sur TEL_NATIF, deux choix, repli sans PRF ». J'ai suivi la consigne du lot : un iPhone `TEL_NATIF` SANS profil (Safari, ou tant que le lot 1 n'est pas là) a aussi les deux choix, et au palier 2 son défaut passe de NETTE à **HAUTE** — l'ancienne HAUTE (`qHaute()` : cran 0 figé, pas d'échelle QL auto, `nettete-qualite.js:105,132,140`), donc plus lourde que l'ancienne NETTE tant que le lot 1 ne redéfinit pas HAUTE. Si l'on veut zéro changement hors profil : mettre `Q2_ON = TEL_NATIF && PRF.on` (une ligne, `sauvegarde.js:12`) une fois le lot 1 fusionné.
2. **Nom de crochet** : `window.dbgProfil` EXISTE DÉJÀ (les statistiques du PROFIL du joueur : temps dans l'app, parties…). Le plan l'attribue au profil d'appareil : le lot 1 doit choisir un autre nom (p. ex. `dbgPrf`), sinon il écrase le crochet existant.

## Ce que le lot 1 doit aligner (la règle du défaut écrite ailleurs, hors de mes fichiers)
- `code/rendu/palier-appareil.js:266-267` (`TOILE1_Q`, lecture d'avance avant le 1er `setSize`) : refait l'ANCIENNE règle (`net` reconnu, défaut `'net'` au palier 2). Sur téléphone il faut : `'net'` → `qChoisi=0` → défaut de l'appareil ; défaut = classe ≥ 3 → `'haute'`, sinon `'fast'` (ou repli `qNetDefaut` → `'haute'`). Sinon : à-coup de réallocation au démarrage à CHAQUE lancement pour une sauvegarde non choisie en classe 1-2 (TOILE1 croit NETTE, SAVE dit BASSE → `applyQ` réalloue).
- `code/rendu/soleil-planete.js:476` (POSTE, ordinateur) : lit `q==='haute'&&qChoisi!==0` brut — inchangé pour l'ordinateur, rien à faire tant que `Q2_ON` ne touche pas l'ordinateur ; à garder en tête si `PRF.q` est lu au même endroit.
- `code/rendu/nettete-qualite.js:93` `qNetDefaut`, `:97` `qlNet` (accepte encore `'net'`), `:105` `qHaute`, `:133-134` `qSuivant`/`qLbl` : inchangés (l'ordinateur s'en sert) ; `PRF.q` lu brut doit suivre la même désinfection (sinon la resynchro de `mobile-tactile.js:11` s'en charge).
- `code/moteur/gouverneur-paliers.js:53-54` (lot 4) : ne testent que `q==='fast'`.

## Le banc
`node outils/banc-reglages/reglages.cjs --out <dossier> --tag t --fmt debout|couche --lang fr|en --save '{"q":"net","qChoisi":1}' --q "appareil=iPhone14,2" [--ecrans 1] [--seg 1] [--pause 1] [--recharge 1] [--pc 1] [--jeu <dossier du jeu>]`
Une ligne JSON par étape (sauvegarde en mémoire et écrite, réglage affiché, débordements), photos `<tag>-<fmt>-<lang>-<étape>.png`. Ports 9861/9862. Prendre le verrou (`~/cash-car/verrou-banc.sh`) avant ; en zsh, `${=var}` pour passer plusieurs options par une variable.
