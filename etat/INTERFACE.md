# INTERFACE — état au 14/10, 8 h 02 — passe DÉTAIL ET ACCORD (cap de Sacha de 6 h 10 ; direction artistique Q11 en pause)
- `ui-integration` = `1acc1be` = assemblage T2 + écran de fin P1 (lisibilité ≥ 11 px, records seulement s'ils battent un record > 0,
  cartes compactes, plus de défilement en couché) + accueil P1 (4 accès de même forme icône + mot, JOUER en plaque d'or, choix
  FACILE/NORMAL en cartes égales, « TOUCHE POUR JOUER » au chargement). Vus au banc aux 6 formats iPhone. Syntaxe 0, garde OK.
- En vérification (agent vérificateur, après le créneau App Store de 8 h 19) : `ui/carriere-missions` (ciels copiés dans
  `assets/img/carriere/`), `ui/boutique` (un seul écran OFFRES, ◀ cadeau → accueil), `ui/hud` (auto-école), `ui/pages` (textes FR/EN/ZH).
- En vol : garage P2/P3 (`ui/garage`) ; SOCLE d'accord (`ui/socle`, jetons uniques : 3 hauteurs, 1 toucher, 1 courbe, échelle de texte,
  2 voiles) d'après `ui/notes/accord.md` (71 changements listés ; décisions du chef au §5).
- Ensuite : les changements d'accord bloc par bloc (garage, pages, pause-fin, carrière, accueil, hud, transitions), une fois tout intégré.
- Test : http://localhost:8500/index.html (ancienne interface : `?ui=5`). Rien poussé sur `main`.
- 11 h 23 — REPRISE après l'arrêt de 8 h 15 (coupure réseau des 3 agents ; rien perdu : branches commitées et propres). Plafond 3 agents :
  les 3 sont REPRIS là où ils étaient (socle d'accord `ui/socle` ee9684d, garage P2 `ui/garage` 3445010, vérificateur des 4 branches).
- 11 h 50 — SOCLE D'ACCORD FAIT (`ui/socle` ee9684d, 28 changements, vu en 3 formats) mais PAS intégrable seul : sans les passes de zone,
  réglages / boutons du garage / accueil de base tombent sous 11 px. En vol sur la même branche : passes de zone réglages + pause + accueil.
  Le garage (G20-23) suivra la fin de l'agent garage.
- 12 h 05 — T5 FUSIONNÉ : `ui-integration` = `92741da` (assemblage T5, avance rapide). Contrôle : `I18N_ZH` / `LANG==='zh'` / `html.c6.poki` /
  `html.poki` = 0 · syntaxe 0 (14 scripts) · garde OK. Consigne passée aux 3 agents : plus de chinois, plus de POKI, plus de CRYPTOCITY ;
  chaque branche fusionne ui-integration avant verdict (`ui/pages` : les +52 clés ZH sont retirées). `git merge assemblage` avant chaque vague.
- 12 h 15 — `ui/socle` (df70c40) = socle + passes réglages / pause / accueil, T5 fusionné : BON À INTÉGRER pour ces 3 écrans (0 texte < 11 px,
  0 erreur JS, 6 formats FR + 2 EN). Gardé sur sa branche jusqu'à la passe garage G20-23 (sinon le garage tomberait à 10 px).
  3e agent lancé sur la même branche : accord de l'écran de fin + transitions (n° 28, 48, 59, 68, 69, 70) + bas des réglages (P2).
  En vol : garage P2, vérificateur (cm, bq, hud, pages ; les clés chinoises de `ui/pages` sont retirées).
- 12 h 20 — GARAGE P2 INTÉGRÉ : `ui-integration` = `54d1634` (en-tête : comptes de même largeur et œil au bord de la plaque ;
  inventaire d'un joueur neuf compact avec une ligne d'état vide ; « 1 / 49 » et « COMMUNE » sur une plaque d'encre ; onglets qui ne se
  touchent plus ; 0 texte < 11 px aux 6 formats). Syntaxe 0, garde OK. Lancé à la place : accord du garage (G20-24, 39, 49-50, 56, 58, 63, 72)
  sur `ui/garage` + `ui/socle` → c'est par cette branche que le socle entrera. Agents : 3 (vérificateur, fin+transitions, garage accord).
- 12 h 45 — 6 BRANCHES INTÉGRÉES : `ui-integration` = `48315bd` (carrière/missions : mondes pleine largeur avec ciels copiés dans assets ;
  boutique : un seul écran OFFRES, ◀ du cadeau → accueil, « IL TE MANQUE », boutique 3D rangée sous l'accueil ; HUD : la plaque de pouvoir
  ne se pose plus sous la carte de l'auto-école ; textes FR/EN sans chinois ; accueil : RÉGLAGES couché recalé ; pause en système 13 px).
  Syntaxe 0, garde OK, chinois/POKI = 0. Charge du Mac 150 à 12 h 40 (consigne aux agents : pas de navigateur au-dessus de 40).
  En vol (3) : fin+transitions (`ui/socle`), accord garage (`ui/garage` + socle), accord carrière/missions + HUD (`ui/carriere-missions` + socle).
- 13 h 00 — FIN PROPRE, PASSATION AU PC. `ui-integration` = `245ac62` POUSSÉE sur origin (branche, pas main), = socle d'accord + réglages,
  pause, accueil, fin, transitions (ui/socle) + accord garage (ui/garage) + assemblage T6 `242da07`. Syntaxe 0 (14 scripts), garde OK,
  chinois/POKI = 0, fumée `detail/banc/fumee` 8500 couché + debout OK (0 erreur JS).
  Passation : `passation/INTERFACE.md` à la racine de la branche (+ BRIEF-INTERFACE.md, accord.md, 3 planches jpg).
  NON intégré : `ui/carriere-missions` `db27aa9` (accord carrière/missions/HUD, jamais vu au banc) — poussé lui aussi en branche
  `ui/carriere-missions` pour le PC. Plus aucun agent ; la session INTERFACE du Mac s'arrête.
