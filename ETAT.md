# ÉTAT DE L'ASSEMBLAGE (PILOTAGE) — le « code final » de la version App Store

## T0 prêt — 14/10, 2 h 22
- Branche locale `assemblage` = `0c1ecee` : origin/main `1881988` (Léo, 2 h 13) + `classique-biomes` (JOUER = le mode classique au hasard de Sacha)
  + `opti-jade-perf`. Fusion AUTOMATIQUE, 0 conflit ; syntaxe 13 scripts / 0 erreur ; garde du burn-out OK. Test de fumée à 2 h 22 : **OK** — couché + debout (accueil → JOUER → course → mort → REJOUER → mort → accueil) et `?play=jade`, 0 erreur JS.
- À FAIRE PAR CHAQUE SESSION avant sa première vague : `git merge assemblage` dans sa branche `*-integration` (puis syntaxe + garde).
- Servie sur http://localhost:8600/index.html (worktree `pilotage/integ`).
- ⚠ Pour OPTIMISATION : la fusion `opti-jade-perf` × la « passe mobile » de Léo (`9522ba6`, Soleil de jade sans dessins) n'a pas fait de conflit de
  TEXTE, mais les deux touchent le jade : vérifie le SENS (pas de travail fait deux fois, pas de garde annulée) dans ta première vague.

## Prochains trains
T1 3 h 45 · T2 5 h 15 · T3 6 h 45 — dix minutes avant : plus de nouvelle vague, chacun intègre chez soi.

## Audit « regard du testeur d'Apple » — rendu à 2 h 40 (lecture seule, rien de modifié)
- Rapport : `pilotage/notes/regard-apple.md` — en tête : « À TRANCHER PAR SACHA ET LÉO » et « COUPES À AJOUTER DANS L'APP » (C1…C10, pour la session APP STORE,
  à poser dans `app-ios/preparer-www.js`). Chaînes extraites : `pilotage/notes/regard-apple-chaines.txt`.
- Pour APP STORE : `www/index.html` est périmé par rapport à `assemblage` (à régénérer au dernier train) ; les 9 mp3 d'annonceur sont copiés dans l'app sans être joués.
- Pour INTERFACE : le vieux panneau RÉGLAGES (`#setBtn`) ouvre des `prompt()` système (l. 40157-40161) ; le bouton « BIENTOT » du garage (`.gVerrou`).

## T1 — 03 h 40
- SHA final de `assemblage` : `2346157` (départ `7f5c4cd`). Rien de poussé. SHA intermédiaires : main `3df2fb5`, debug `980077b`, sensations `d2c631e`, perf `0465a82`, ui `67d08b8`, gfx `2346157`.
- `origin/main` (ec05bfd, 9 commits de Léo) : fusionnée (0 conflit) — six musiques de lobby, LE DOGE, `sw.js` passe à v359.
- `debug-integration` (2cc42b1) : fusionnée (0 conflit).
- `sensations-integration` (c21ec8e) : fusionnée (0 conflit).
- `perf-integration` (71f39db) : fusionnée (0 conflit).
- `ui-integration` (79e56a8) : fusionnée (1 conflit résolu : écran de fin, enseigne « campagne terminée », l. ~53814 — gardé la ligne de debug `8ca0593` avec `finParis` / PARIS TERMINE, puis la ligne ajoutée par ui, classe `c6Rec` sur `#mDead`).
- `gfx-integration` (5f290c2) : fusionnée (0 conflit).
- Aucune branche reportée.
- Après chaque fusion : syntaxe 0 erreur (13 scripts inline), garde du burn-out OK, 0 marqueur. Fumée sur le port 8600 : `couche,debout` → FUMÉE OK ; `couche ?play=jade` → FUMÉE OK (0 erreur JS). Journaux : `pilotage/logs/T1.log`, `T1-fumee1.log`, `T1-fumee2.log`.
- Noms : `LA NOCTAMBULE` + `LE BLINDÉ NOIR` = 2 ; anciens noms = 0.
- `assets/audio/music/dark-triad.mp3` : toujours ABSENT (non arrivé avec main ; `index.html` le cite encore 1 fois) — la musique de FRÉNÉSIE reste à déposer.
- `sw.js` : aucune des cinq branches n'y touche, `CACHE` reste `cashcar-v359` (celui de main) alors que le contenu d'`assemblage` diffère de main : à incrémenter avant toute mise en ligne.
- CONSIGNE : chaque session fait `git merge assemblage` dans sa branche avant sa prochaine vague.

## PUBLIÉ — 4 h 00 : le MODE CLASSIQUE AU HASARD est sur `main` (`4e1f584`, sw v361)
Ordre de Sacha (« fais passer le push de classique-biomes en priorité »). JOUER tire une map et une météo ; `?play=jade` = le Soleil de jade.
`assemblage` le contenait déjà : rien à faire pour les sessions. Poussée faite par PILOTAGE (règle `git push` ajoutée par Sacha, sans force).

## T2 PRÊT — 5 h 35 (annoncé par PILOTAGE ; le rapport détaillé de l'assembleur s'ajoutera dessous)
- `assemblage` = `4007550` : origin/main (une douzaine de commits de Léo : vol équilibré, lobby, LE DOGE v2, boutique, menu ciel) + debug + sensations + perf
  + ui + gfx + le NETTOYAGE (code mort, formes des caisses retirées, 113 `dbg*`, 14 + 5 fichiers audio, 3 caisses cachées). Conflits résolus : écran
  de fin (ui × debug), bloc WOW de Léo gardé, `dbgSens`/`dbgTouch` gardés, `voxDemi` restaurée (perf × nettoyage). Syntaxe 0 erreur, garde OK.
- Fumées : couché OK, `?play=jade` OK. DEBOUT : « aucun élément du HUD visible en course » 3 fois sur 4 avec le robot de fumée (gestes gauche /
  droite / nitro pendant 8 s) — MAIS une capture manuelle debout montre le HUD présent à 2 s et à 8 s (vitesse, nitro, aura, argent, commandes),
  0 erreur JS (`pilotage/notes/hud/`). Cause non établie (transition de portail du mode classique ? geste du robot ?) → DEBUGGING, priorité.
- **CHAQUE SESSION : `git merge assemblage` dans sa branche avant sa prochaine vague.** Prochain train : T3 à 6 h 15 (après la remise à zéro du quota).

## T2 — 05:34
SHA final `assemblage` : **4007550** (départ AVANT = 2346157). Rien de poussé.
- `origin/main` (293ea4f) : fusionnée (3 conflits : i18n — TONNEAU de Léo + PARIS TERMINE de debug combinés ; vol — `sensEau` (sensations) placé après `veqTonneauPose` (Léo) ; `bindHold` up — garde multi-doigts (debug) + `veqDoigt` (Léo)).
- `debug-integration` : fusionnée (0 conflit). · `sensations-integration` : fusionnée (0). · `perf-integration` : fusionnée (0). · `ui-integration` : fusionnée (0). · `gfx-integration` : fusionnée (0).
- `detail/nettoyage` : fusionnée (2 conflits : bloc LA TRAÎNÉE WOW + `dbgWow` de Léo gardés, `dbgArc` retiré comme voulu ; `dbgSens`/`dbgTouch` retouchés par sensations/debug gardés).
  - CASSE SILENCIEUSE réparée (5be20bc) : le nettoyage (lot G2) retirait `voxDemi` et `VIT`, que `jadeMonuLoin` de perf (c2b5dfe, Porte du ciel de loin) utilise → ReferenceError au Soleil de jade. `voxDemi` restaurée, `&&!VIT` retiré. **detail + perf** : à relire.
- `origin/main` RATTRAPAGE (af71119, 4 commits arrivés pendant le train : figures.js, ENTRER UN CODE, DOGE) : fusionnée (4 conflits : réglages — seule la ligne ENTRER UN CODE de Léo ajoutée sous le bloc c6 de ui (pas de 2e EFFACER ni 2e `mvVer`) → **ui** : habiller `.mCode` en charte 6 ; i18n — figures de Léo + PARIS TERMINE ; tangage — `SCOUP.p` (sensations) + `veqConduite(d9)` (Léo) additionnés ; vol — `veqFigurePose` (Léo) + `sensEau`).
- Aucune branche reportée. Contrôle des noms retirés encore appelés (fonctions/const de tête) : 0 après réparation.
- Après chaque fusion : syntaxe 0 erreur (13 puis 14 scripts inline), garde du burn-out OK, 0 marqueur.
- Fumées (port 8600) : à 5be20bc `couche,debout` KO « [debout] aucun élément du HUD visible en course », rejeu `debout` KO idem ; `couche ?play=jade` OK. Sur l'arbre FINAL 4007550 : `couche,debout` **FUMÉE OK**, `couche ?play=jade` **FUMÉE OK** (0 erreur JS). Le défaut HUD debout reste intermittent.
- Cache : `cashcar-v374` (main = v373), commit séparé « sw v374 : assemblage T2 ».
- Fichiers restaurés : AUCUN. Les 20 fichiers supprimés par le nettoyage (9 voix d'annonceur, eww.m4a, fx/wow.mp3, nocturnal-groove, lobby-ascenseur, vapeur-salon, ville-n6…n10, atelier-nuages.js) : seuls les 12 premiers sont encore CITÉS, tous derrière `SANS_VOIX` (vrai sauf `?voix=1`, repli silencieux prévu) ou en commentaire (nocturnal-groove) ; mêmes citations dans `detail/nettoyage` qu'après fusion, Léo n'a rien rebranché. Pour les rendre à `?voix=1` : `git checkout 2346157 -- <chemin>`.
- Noms : LA NOCTAMBULE + LE BLINDÉ NOIR = 2 · `dark-triad.mp3` toujours ABSENT · `classiqueJouer` = 5 · `window.dbgState` = 4.
- Poids d'index.html : 5477736 octets (≈ 5,48 Mo ; 5 651 540 au départ).

### LES POUSSÉES DE LÉO depuis T1
- [voitures] af71119 LE DOGE, le visage en 3D réparti sur la caisse (Léo : « les yeux agrandis sur la vitre, un peu Cars
- [menu] 2b59379 Réglages : ENTRER UN CODE tout en bas — le code cousin débloque caisses, habillages, figures et ca
- [voitures] 1cab5e2 LE DOGE : la tête 3D au pare-brise (Léo : « non, ne perds pas la 3D ») — la tête sculptée revi
- [conduite] 37529a2 Les figures s'accumulent : 12 tricks (figures.js) au double-tap nitro, au hasard parmi les siens et en
- [voitures] 293ea4f LE DOGE façon Cars (Léo : « la tête au niveau de la vitre, bien intégrée, comme Cars ») : plus 
- [voitures] ab749bf LE DOGE en muscle car (Léo : « nickel la tête, travaille le modèle de voiture — une doge dodge �
- [boutique] ecea378 Boutique : le bruit louche — l'atelier (néon qui grésille, porte en feu) ne sonne plus dans la sal
- [son] 4e64b94 Menu ciel : la musique très légère, comme entendue en tombant — elle plonge sous les rafales du v
- [son] f31c15f Menu : au ciel la musique joue derrière une chute libre plus douce ; la boutique a son propre son amb
- [voitures] 3a47943 LE DOGE v2 (Léo : « nul » — pas une vraie voiture, pas assez Doge, trop cubique · « les textes 
- [autre] 25b96b4 sw v363 : le lobby au garage, la chute libre douce au ciel (Léo)
- [son] a43d0f2 Lobby : la musique ne part qu'au garage (léger filtre de l'atelier cuit dans les fichiers) ; au menu 
- [conduite] 34646a5 Vol équilibré : la caisse quitte la route (le braquage tenu ne continue plus le virage), plus de vri
- [menu] 25c2ff7 Accueil : les coups sur la caisse — moins d'objets, l'effort (la rafale) fait le gros lot, plus d'im

CONSIGNE : chaque session : `git merge assemblage` avant sa prochaine vague.

### T2 — CORRECTIF DE PILOTAGE (5 h 50) : le SHA final de T2 est `4007550` (pas 5be20bc) — l'assembleur a rattrapé 4 poussées de Léo arrivées
pendant le train (figures.js, ENTRER UN CODE, LE DOGE). Fumées sur l'arbre FINAL : couché + debout OK, `?play=jade` OK, 0 erreur JS ; cache v374.
À relire par les sessions nommées :
- OPTIMISATION : le nettoyage retirait `voxDemi` et `VIT`, que ton `jadeMonuLoin` (c2b5dfe) utilise → `voxDemi` remise, `&&!VIT` enlevé (5be20bc) : vérifie.
- INTERFACE : Léo a ajouté une ligne « ENTRER UN CODE » (`.mCode`) sous les réglages charte 6 : à habiller.
- GAMEPLAY : `sensEau` placé après la pose de figure de Léo ; `SCOUP.p` s'additionne à `veqConduite` : à vérifier.
- APP STORE : ⚠ « ENTRER UN CODE » (Léo, cette nuit) — si un code DÉBLOQUE du contenu ou de l'argent, c'est un motif de rejet (règle 3.1.1 : pas de
  déblocage par code hors achat intégré). Vérifie ce qu'il fait et, au besoin, coupe-le dans l'app ; question à poser à Sacha dans QUESTIONS.md.

## T3 — 6 h 10
- **SHA final : `0a329be`** (branche locale `assemblage`, rien poussé) · AVANT = `4007550`.
- origin/main (5 poussées de Léo) : 1 conflit — `sw.js` (numéro de cache, pris origin/main puis relevé à la fin) → `5d5768a`.
- debug-integration · perf-integration · ui-integration : aucun commit nouveau depuis T2, passées.
- sensations-integration (eau du jade, figures libres au double-tap) : 1 conflit — table I18N des figures (TONNEAU, PAR-DESSUS…) : ligne anglaise
  gardée, ligne `I18N_ZH` de sensations RETIRÉE (Sacha : « enlève le chinois ») → `3db6f1a`.
- gfx-integration (courbe de ton v2 derrière COURBE_V2, POST_PIVOT, halo, 8 réglages de biomes au hasard) : 0 conflit → `29aaf34`.
- son-integration (échelles de récompense, pièces sans plafond, sons de mort au même niveau, mixage iPhone, SON_DUCK) : 0 conflit → `7bf3d13`.
- detail/sans-chinois (retrait + nettoyage) : 1 conflit — même ligne I18N des figures : version sans chinois + ligne TONNEAU de sensations → `a4c3ea8`.
- Reportées : AUCUNE. Casses réparées : AUCUNE (pas de ReferenceError à la fumée).
- Syntaxe 0 erreur (14 scripts) · garde du burn-out OK · 0 marqueur — après chaque fusion.
- Fumées (robot corrigé, 3e créneau) sur `a4c3ea8` : couché + debout OK, `?play=jade` OK, 0 erreur JS.
- Contrôles : `I18N_ZH|LANG==='zh'` = 0 (67 avant) · LA NOCTAMBULE + LE BLINDÉ NOIR = 2 · `window.dbgState` = 4.
- Cache : `cashcar-v378` (origin/main v377 + 1), commit séparé `0a329be`.
- Poids d'index.html : 5 478 139 octets (≈ 5,48 Mo ; 5 477 736 à T2 — le chinois retiré compense les ajouts).

### LES POUSSÉES DE LÉO depuis T2
- [voitures] 65e43bc LE DOGE, la bouche qui s'ouvre progressivement (Léo : « pas découpé brutalement de manière perman
- [voitures] 8f0540d LE DOGE, la gueule depuis le trait (Léo : « sa bouche c'est le trait noir, ça doit s'ouvrir depuis 
- [app store] cc61d24 Pages App Store : politique de confidentialité et assistance de l'app iPhone, en ligne à /confidenti
- [voitures] b97913a LE DOGE ouvre la gueule (Léo : « quand il roule ou au burn-out, qu'il ouvre la bouche, des dents, la
- [voitures] 5fc0ba5 LE DOGE = la grosse tête de shiba sur roues (Léo : « terrifiant » · « la grosse tête de shiba m

CONSIGNE : chaque session : `git merge assemblage` avant sa prochaine vague.
(SENSATIONS / LANGUE : la table des figures n'a plus de ligne chinoise — ne la remettez pas.)

APP STORE : créneau xcodebuild OUVERT jusqu'à 7 h 00

## T4 — 7 h 55
- **SHA final : `4febc49`** (branche locale `assemblage`, rien poussé) · AVANT = `0a329be` (T3).
- origin/main : AUCUNE poussée depuis T3 (tête `65e43bc`), passée.
- debug-integration (saut NITRO remis à zéro à REJOUER/RECOMMENCER) : 0 conflit → `904b55e`.
- sensations-integration : 1re tentative sur `730a409` = conflit (mots CAMPAGNE avec chinois + commandes dbg* déjà retirées) → abort ;
  la session venait de fusionner T3 (`2369629`, 7 h 28) → refusionnée 0 conflit (SAUTE-MOUTON nuages 4, auto-école TOURNE, défis) → `6e98a6d`.
- perf-integration (NETTE par palier, qChoisi, qlBornes/qlDepart) : 0 conflit → `5410960`. · ui-integration : 0 nouveau, passée.
- gfx-integration (bords de route sans néon, mer de nuit, façades de jour, NEONVILLE ambre) : 1 conflit — hooks de banc : `dbgFacades` gardé,
  `dbgCourant` non remis (retiré par le nettoyage lot D) → `3719382`.
- son-integration (gestes, transitions jade, niveaux, MUS_WA iPhone, vol) : 0 conflit → `765ce34`.
- detail/retrait-poki-crypto (base T2) : 7 conflits → `8b3d461` — accent de route (BORDS_V2 de gfx, sans branche crypto : or = jade seul) ·
  NEON des enseignes (NEONVILLE_V5 de gfx, sans branche CR) · I18N réglages (POUCE HAUT/REVOIR gardé, POKI + chinois retirés) · BIOMES
  (espaceSoir de gfx gardé, bullrun retiré) · RECOMMENCER (sans pkPasse + uiClic 'tous' de son) · mTap (sons de son + REJOUER sans pkPasse,
  JOUER→CRYPTOCITY retiré) · KIT POKI côté jeu retiré.
- RÉINTRODUCTIONS retirées (notées) : son a ajouté `window.CC_PUB||window.CC_MUET` dans 2 lignes MUS_WA (retiré) et `musWaTient()` dans
  pkMuet/pkSilence/g9 du KIT POKI (chemins POKI seuls, retirés avec le kit) ; gfx : commentaire « or à CRYPTOCITY » (bords-route) retiré.
  Aucun code de Léo ne touchait un bloc retiré.
- Reportées : AUCUNE. Casses réparées : AUCUNE (pas de ReferenceError à la fumée).
- Syntaxe 0 erreur (14 scripts) · garde du burn-out OK · 0 marqueur — après chaque fusion.
- Fumées sur `8b3d461` : couché + debout OK, `?play=jade` OK, 0 erreur JS.
- Contrôles : `POKI\b|CRYPTO_JEU|I18N_ZH` = 1 (77 avant) — reste un commentaire « (POKI, 2026-10-05… voix) » au-dessus d'ANN_LIB, laissé par
  detail lui-même · cryptoJouer/NIV_CRYPTO/bullrun/CC_PUB/SAVE.portail = 0 · I18N_ZH = 0 · LA NOCTAMBULE ×4 + LE BLINDÉ NOIR ×3 présents
  · `CRYPTOCITY` reste seulement sur le billet ₿ de la pluie de richesse (plaBilletBtc, gardé par detail).
- Cache : `cashcar-v378` (origin/main v377 + 1), commit séparé `4febc49`.
- Poids d'index.html : 5 437 884 octets (≈ 5,44 Mo ; 5 478 139 à T3 → −40 Ko : −96 Ko de retrait, +56 Ko des branches).

### LES POUSSÉES DE LÉO depuis T3
- AUCUNE (origin/main toujours à `65e43bc`, LE DOGE).

CONSIGNE : chaque session : `git merge assemblage` avant sa prochaine vague.
(Plus de POKI ni de CRYPTOCITY : ne remettez ni `window.CC_PUB`/`CC_MUET`, ni `pk*`, ni branche `LVL.cur.crypto`. SON : MUS_WA lit seulement paused/hidden.)

APP STORE : créneau OUVERT 7 h 54 → 8 h 19 sur `4febc49` — s0 et s2 réservés (sleep 1500) ; s1 tenu par un banc perf (`node v10.cjs 8400`)
au-delà des 10 min d'attente : un guetteur le réserve dès qu'il se libère, jusqu'à 8 h 19. Ligne en tête de BUDGET.md.

## T5 — 11 h 38
- **SHA final : `92741da`** (branche locale `assemblage`, rien poussé) · AVANT = `4febc49` (T4).
- origin/main : AUCUNE poussée depuis T3 (tête `65e43bc`), passée. · sensations-integration : 0 nouveau (`2369629`), passée.
- debug-integration (+6 : RECOMMENCER par le volet, ⏸ au 2e doigt, verrous du double-tap OFFRES/TOUS LES REGLAGES, eauPTick jade) : 2 conflits → `1220adc`
  — RECOMMENCER (volet de debug, `f9()` direct : `pkPasse(f9)` + commentaire (POKI) RETIRÉS ; uiClic `'tous'→'nav'` de son gardé) ·
  setPauseOuvre (sans `uiClic('nav')` comme le veut son + `uiGarde()` de debug).
- perf-integration (qNetDefaut NETTE sur iPhone récents, cadence30 rouverte, chauffe DOGE/dragon, porte du ciel en tranches) : 0 conflit → `a513cfd`.
- ui-integration (+8 : accueil en 4 cartes + JOUER plaque d'or, splash « TOUCHE POUR JOUER », FACILE/NORMAL en cartes, fin de partie v2) :
  2 conflits → `9f79326` — CSS accueil acc2 (côté ui) · I18N TOUS LES REGLAGES + cartes (côté ui sans `Object.assign(I18N_ZH,…)`).
  CASSE ÉVITÉE : `I18N_ZH` n'existe plus → ReferenceError au chargement si gardé.
- RÉINTRODUCTIONS retirées (notées) : debug `pkPasse(f9)` ; ui `I18N_ZH` ×2, bloc CSS « L'ÉDITION POKI » (`html.c6.poki` ×7 ; la règle `.mBadge`
  générale gardée), accC6 `T(f,e,z)` + `LANG==='zh'` + 8 mots chinois (commit séparé `57bee80`).
- gfx-integration (+4 : flou de vitesse FLOU_V2, cumulus coton-blanc, Pics de Jade de nuit) : 1 conflit → `6c62862` — hooks de banc près de dbgNet :
  `dbgFlou`/`FLOU_ON` + `dbgCotonV2` (neufs) gardés ; `dbgN8Regen`/`dbgN8` + `cotonChouFleur` (déjà retirés côté assemblage, sans appel) non remis.
- son-integration (+16 : la pluie s'entend, moteur sans moustique, éclaboussures du jade, glisse, rase-bord iPhone, aura.perdue) : 0 conflit → `738a91a`.
- Reportées : AUCUNE. Casses réparées : AUCUNE à la fumée (la seule casse possible, I18N_ZH, coupée à la résolution).
- Syntaxe 0 erreur (14 scripts) · garde du burn-out OK · 0 marqueur — après chaque fusion. Fumées sur `92741da` : couché + debout OK, `?play=jade` OK, 0 erreur JS.
- Contrôles : `POKI\b|CRYPTO_JEU|I18N_ZH` = 1 (le commentaire « (POKI, 2026-10-05… voix) » au-dessus d'ANN_LIB, comme à T4) · cryptoJouer/NIV_CRYPTO/CC_PUB/
  SAVE.portail = 0 · `LANG==='zh'` = 0 · LA NOCTAMBULE ×4 + LE BLINDÉ NOIR ×3 présents · `CRYPTOCITY` ×1 (billet ₿, gardé). Les sélecteurs
  `:not(.poki)` de l'accueil c6 (déjà là à T4) restent : inertes, la classe n'est plus jamais posée.
- Cache : `cashcar-v379` (max(origin/main v377, assemblage v378) + 1), commit séparé `92741da`.
- Poids d'index.html : 5 478 670 octets (≈ 5,48 Mo ; 5 437 884 à T4 → +41 Ko : ui +20, son +11, gfx +10, debug +4, perf +4).

### LES POUSSÉES DE LÉO depuis T4
- AUCUNE (origin/main toujours à `65e43bc`, LE DOGE) — burn-out, boutique 3D, voitures, musique : rien de neuf.

CONSIGNE : chaque session : `git merge assemblage` avant sa prochaine vague.
(UI : plus de `I18N_ZH` ni de 3e argument chinois, plus de `html.c6.poki`. DEBUG : plus de `pkPasse`. Pas de créneau App Store à ce train.)

## T6 — 12 h 20
- **SHA final : `242da07`** (branche locale `assemblage`, rien poussé) · AVANT = `92741da` (T5).
- origin/main : AUCUNE poussée (tête `65e43bc`, LE DOGE), passée · perf-integration (`bb215bf`) : 0 nouveau, passée · son-integration (`92741da`) : 0 nouveau, passée.
- Fusionnées, 0 conflit chacune : debug-integration (+7 : sauvegarde — banque protégée d'un NaN, localStorage plein, purge ; cycle de vie pendant l'explosion ; QUITTER sans dépause ; nitro qui ne passe plus d'une partie à l'autre, plus de PSSHT sur la caisse qui explose) → `5518882` ·
  sensations-integration (+14 : accord des vibrations, « une seule voix par événement » — limiteur par classes, décollage/pose/figures/porte/bump ; bouchon sur la suspension à flot) → `ab4250d` ·
  ui-integration (+6 : garage charte 6, plaque de fiche, onglets, inventaire serré) → `47bcdc0` · gfx-integration (+3 : vignette de vitesse plafonnée, béton du soir du jade, ?sans=oeil) → `712b684`.
- Reportées : AUCUNE. Conflits : AUCUN. RÉINTRODUCTIONS retirées : AUCUNE (diffs de chaque fusion contrôlés : pkPasse / POKI / I18N_ZH / LANG==='zh' / CRYPTOCITY / pk( = 0 ajout). Casses réparées : AUCUNE.
- Syntaxe 0 erreur (14 scripts) · garde du burn-out OK · 0 marqueur — après chaque fusion. Fumées sur `242da07` (serveur 8600) : couché + debout OK, `?play=jade` OK, 0 erreur JS.
- Contrôles : `POKI\b|CRYPTO_JEU|I18N_ZH` = 1 (le commentaire « (POKI…voix) » d'ANN_LIB) · cryptoJouer/NIV_CRYPTO/CC_PUB/SAVE.portail = 0 · `LANG==='zh'` = 0 · `html.c6.poki` = 0 · LA NOCTAMBULE ×4, LE BLINDÉ NOIR ×3 présents · CRYPTOCITY ×1 (billet ₿).
- Cache : `cashcar-v380` (max(origin/main v377, assemblage v379) + 1), commit séparé `242da07`.
- Poids d'index.html : 5 497 125 octets (≈ 5,50 Mo ; 5 478 670 à T5 → +18 Ko).

### LES POUSSÉES DE LÉO depuis T5
- AUCUNE (origin/main toujours à `65e43bc`).

CONSIGNE : chaque session : `git merge assemblage` avant sa prochaine vague.

## T7 — 13 h 26
- **SHA final : `676a3ad`** (branche `assemblage`, poussée) · AVANT = `242da07` (T6).
- Fusionnées : origin/main (+2, Léo : habillages POP, équilibrage, textes FR/EN ; guide CLAUDE.md + JOURNAL.md) → `d8af462` · debug-integration (+6) → `103e2eb` · sensations-integration (+6) → `53b6196` · perf-integration (+1 : image nette par défaut sur iPhone récent, 30 i/s, programmes du jade compilés au menu ; ajoute passation/OPTIMISATION.md + banc-perf) → `6d88beb` · **origin/ui-integration (+63, INTERFACE, autre machine ; passation/ gardé tel quel)** → `76043aa` · gfx-integration (+20) → `1c40806` · son-integration (+1) → `9f6cb8e`.
- Conflits : SEULE origin/main (index.html ×12, sw.js, poki-construire.js supprimé chez nous / modifié chez main), résolue selon la revue DEBUGGING (`debug/trouvailles/revue-main-pop.json`) : côté assemblage pour cryptoPubAtlas (CRYPTOCITY), HORS DE L'EAU de jadeEauVol, I18N_ZH, ligne DAUPHIN, bloc SANS FAUTE / MISSIONS, `if(POKI)` de l'I18N et de COSM, boucle campagne `[k,v,z]`, ligne du lingot ; côté main pour les blocs ajoutés TRX et AILES_POP ; portailPasse : les DEUX lignes (sensHap + zb ×120) ; les deux lignes `Object.assign(I18N,…)` de main gardées (habillages EN) ; quelques textes EN de Léo repris dans nos lignes (« FINISH THE 3 CHALLENGES FIRST », « VIEW », « YOU WERE SUPPOSED TO FOLLOW HER », « 999.9 fine, and pure arrogance »). Les autres fusions : 0 conflit. Reportées : AUCUNE.
- Réintroductions retirées : CRYPTOCITY (cryptoPubAtlas, 361 l), I18N_ZH / chinois, POKI (I18N, COSM, `pk`), dbgFilet & co (déjà retirés chez nous), poki-construire.js. Les diffs des 6 autres fusions : 0 ajout de pkPasse / POKI / I18N_ZH / zh / CRYPTOCITY / pk(. Casses réparées : aucune. À noter : les « traductions ZH » de Léo sont perdues (le chinois est retiré) ; TRX_FORCE, trxApercu, AILES_POP, pubLangue définis.
- Syntaxe 0 erreur (14 scripts) · garde du burn-out OK · 0 marqueur — après chaque fusion. Fumées (serveur 8600) : couche + debout OK après origin/main, puis sur `676a3ad` couche + debout OK, `?play=jade` OK, 0 erreur JS.
- Contrôles : `POKI\b|CRYPTO_JEU|I18N_ZH` = 1 (commentaire d'ANN_LIB) · cryptoJouer/NIV_CRYPTO/CC_PUB/SAVE.portail = 0 · `LANG==='zh'` = 0 · html.c6.poki = 0 · CRYPTOCITY ×1 (billet ₿) · LA NOCTAMBULE ×4.
- Cache : `cashcar-v381` (max(origin/main v378, assemblage v380) + 1), commit séparé `676a3ad`.
- Poids d'index.html : 5 656 255 octets (≈ 5,66 Mo ; 5 497 125 à T6 → +159 Ko : habillages POP + charte 6).
- Non traité (revue DEBUGGING) : carnets POP 10-12 (joueur au carnet 9-11 garde des coches d'autres défis), coût mobile TRX/ailes (aucun cran PAL), #auraSub / span .aura sans auraSansNom.

### LES POUSSÉES DE LÉO depuis T6
- 2 commits sur origin/main (tête `3ca83ec`) : `2289498` HABILLAGES POP (10 traînées au moteur TRX, 10 ailes AILES_POP, 10 peintures), ÉQUILIBRAGE argent/aura (1re caisse 10 k, 4 rangs d'aura, portail ×5), TEXTES FR/EN ; `3ca83ec` CLAUDE.md = guide court, journal passé dans JOURNAL.md.

### Synchro (sync.sh)
```
poussée : assemblage (676a3ad)
poussée : debug-integration (759fc5b)
poussée : perf-integration (e809d5b)
poussée : gfx-integration (1ce9473)
poussée : sensations-integration (a3524e7)
poussée : son-integration (dd997e9)
poussée : ui-integration (245ac62)
poussée : ios-capacitor (16a6ac5)
pilotage-notes poussées : b2d4106
origin/ui-integration (autre machine) : 245ac62 — 14/10 12:58 Passation de la session INTERFACE pour la reprise sur le PC
```

CONSIGNE : chaque session : `git merge assemblage` (ou `origin/assemblage` sur l'autre machine) avant sa prochaine vague.

## T8 (dernier train sur le Mac) — 13 h 31
- **SHA final : `27b4199`** (branche `assemblage`, poussée) · AVANT = `676a3ad` (T7).
- Fusionnées (toutes 0 conflit) : debug-integration (+1 : passation DEBUGGING + preuves node) → `09079a7` · sensations-integration (+1 : passation GAMEPLAY) → `43ad859` · gfx-integration (+6 : nuages de jour matin/midi/soir + passation GRAPHISME) → `0d41050` · son-integration (+1 : passation SON) → `197840c`.
- Sans commit nouveau (passées) : origin/main (tête `3ca83ec`), perf-integration, ui-integration.
- Reportées : aucune. Réintroductions POKI / I18N_ZH / CRYPTOCITY / pk( : 0 (diff index.html = +8 lignes, nuages gfx).
- Syntaxe 0 erreur (14 scripts) · garde du burn-out OK · 0 marqueur — après chaque fusion. Fumées (serveur 8600) : couche + debout OK, `?play=jade` OK, 0 erreur JS.
- Cache : `cashcar-v382` (max(origin/main v378, assemblage v381) + 1), commit séparé `27b4199`.
- Têtes sur GitHub : assemblage 27b4199 · debug-integration b496001 · gfx-integration 5e15978 · sensations-integration a3524e7 · son-integration dd997e9 · perf-integration e809d5b · ui-integration 245ac62 · ios-capacitor 16a6ac5 · pilotage-notes c6218b2 (avant relance finale de sync.sh).
- **La suite se fait sur le PC : voir pilotage-notes:PASSATION-PILOTAGE.md.**
