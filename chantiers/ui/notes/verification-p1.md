# VÉRIFICATION P1 — les cinq branches (+ ui/pages) vues au banc (2026-10-14, 7 h 06 →)

Charge : 43 à 7 h 06, < 20 de 7 h 07 à 7 h 20 (créneaux tous pris : s0 par d'autres sessions, s1/s2 réservés par PILOTAGE jusqu'à 7 h 28),
puis 80-160 pendant que deux navigateurs tournaient (le mien + SENSATIONS). Les bancs suivants passent par `ui/banc/verif-p1-chaine.sh`
(chaque étape attend une charge 1 min < 40).

Serveurs « avant » temporaires (scratchpad) : 8517 et 8593 = `git show 4007550:index.html` + liens vers les fichiers ; 8592 = carrière
`TEST_CARRIERE=false`. À fermer à la fin.

## 1. ui/pause-fin — écran de fin
- Banc `fin-p1.cjs avant` (A, B × 6 formats) puis `apres` (A, B × 6 ; C × 3 ; U = ?ui=5 × 2). Captures `shots/pause-fin/p1/`.
- DEBOUT (375×667, 390×844, 430×932) : bon. 0 texte < 11 px (avant : 16 textes à 8 px), 0 chevauchement, badges RECORD ! dans le flux,
  12-16 px au-dessus de REJOUER (avant 95-183), vignette moteur dans sa carte, 0 problème de touche, 0 erreur JS.
- COUCHÉ — DÉFAUT TROUVÉ ET CORRIGÉ (commit 3413b0d) : `#mob` (parent) n'a pas de hauteur définie → `height:100%` de `#mDead` ne bornait
  rien, la colonne de gauche s'allongeait (l'argent à 340 px), l'écran DÉFILAIT (569/390, 616/375) et REJOUER + la maison sortaient de
  l'écran. Correctif : `height:100vh;height:100dvh` en couché. Vu après correctif (scénario C, 844×390) : 390/390, deux colonnes, REJOUER
  en bas à droite.
- ?ui=5 : l'ancien écran, intact.
- Non vu : le cas « presque » (moteur presque atteint) n'est dans aucun scénario du banc ; l'écran de PAUSE n'a pas été repassé.
- Reste (règle 3) : la maison carrée à gauche de REJOUER est une icône SEULE de navigation (seuls ⏸ et ◀ y ont droit) — à trancher.
- VERDICT : BON À INTÉGRER (avec 3413b0d). Planche : `shots/pause-fin/p1/pause-fin-avant-apres.png`.

## 2. ui/accueil — accueil, choix FACILE/NORMAL, splash
- Banc `releve3.cjs tout en` (avant 8593 + après 8501), 6 formats, joueur neuf, EN debout + couché. 0 problème de touche, 0 erreur JS.
- Vu : debout (375, 390, 430) composé, 4 cartes mot + sous-ligne, JOUER plaque or pleine, RÉGLAGES écrit ; 667×375 couché : tout tient
  (logo, 4 cartes, JOUER) ; « LA HONTE » / « THE SHAME » tient ; EN : SETTINGS / CAREER / 1 / 3 DONE / OFFERS NEW / PLAY tiennent ;
  choix FACILE (or) / NORMAL (encre) en deux cartes ; splash : TOUCHE POUR JOUER, CAR blanc.
- Petit défaut restant : en couché, RÉGLAGES n'est PAS « en haut à gauche » comme le disent les notes : il se cale au-dessus du bloc de
  droite (844 : aligné au bloc, propre) mais à 667×375 il déborde de 52 px à gauche du bloc (x 215 pour un bloc à 267). La cause n'a pas
  pu être sondée (créneau App Store) : `ui/banc/accueil/sonde-gear.cjs` est prêt (1 ouverture, 2 formats).
- Non vu : `?ui=5` de l'accueil, `?menu=leo`, Poki, le chinois.
- VERDICT : BON À INTÉGRER (le décalage de RÉGLAGES à 667 couché est cosmétique). Planche : `shots/accueil/p1/accueil-avant-apres.png`.

## 3. ui/carriere-missions — carrière
- Photos du ciel copiées dans `assets/img/carriere/` (sh1-5, v1-5, 1,2 Mo), chemin changé dans `carrVueC6` (95c3aea) ; `maps-ciel/` intact.
  NB : `poki-construire.js` (interdit) embarquera ces 10 jpg dans la build Poki (sans carrière) : +1,2 Mo inutiles, à exclure par son propriétaire.
- Calculé, non vu : à 375×667 debout, 4 × 100 + 3 × 12 = 436 px pour ~427 de place → rangées des mondes à minmax(92px) (ff89b85).
- PAS VU au banc : le créneau « App Store » (07:54-08:19, navigateurs à zéro pour les autres sessions) a coupé le passage. Seules
  les captures de l'agent (6 h 17-7 h 03, AVANT ses retouches) existent : la 4e carte passait sous JOUER, « PREMIERE/S LUEURS » cassé
  en 667×375 — les retouches qui les corrigent n'ont jamais été vues. État verrouillé (copie 8592), anglais, `?ui=5` : non vus.
- VERDICT : PAS ENCORE (rien de la version actuelle vu à l'écran). Banc prêt : `verif-p1-chaine.sh cm`.
  Planche (1re passe seulement) : `shots/carriere-missions/p1/carriere-missions-avant-apres.png`.

## 4. ui/boutique
- Tranché et codé (2b8bb3e) : `bqVaOffres(deAcc)` retient « venu du cadeau » (`GBQ.deAcc`, posé APRÈS gModeVa, remis à 0 par tout
  changement de mode dans `gModeVa`) ; ◀ (`#gBqRet`) : venu du cadeau → `garMode('menu')` = l'accueil d'un coup ; sinon `gModeVa('shop')`
  = le garage comme avant. Corrigé au passage : le 2e cadeau ne faisait rien quand GMODE.m était resté « shop » sous l'accueil
  (condition `|| gEl.classList.contains('menu')`). Aucun chemin de paiement touché.
- Banc complété (`banc/boutique/p1.cjs` : ◀ depuis le garage → reste au garage ; HOME ; 2e cadeau ; ◀ → accueil).
- PAS VU au banc (même coupure). VERDICT : PAS ENCORE.

## 5. ui/hud — auto-école
- Correctif (cd7eea2) : debout, `html.c6 body.touch.coOn:not(#ccH) #pwrChip{top:hudH + 184px}` (la place ordinaire, ~28 px sous la carte
  de 76 px) au lieu de +290 (calculé pour l'ancienne carte de 172 px). Couché inchangé (+124, déjà sous la carte). Calculé : avec le
  zoom .8 du HUD, +184 → écran y ≈ marge + 166, carte jusqu'à marge + 138 (+155 si la phrase passe sur 2 lignes).
- Banc complété (`banc/hud/ecole.cjs` : `dbgPwr('n')` pendant la carte, mesure du trou).
- PAS VU au banc depuis le dernier réglage couché (jauge-filet, état raté). Captures de la 1re passe : la jauge-filet y est tronquée.
- VERDICT : PAS ENCORE. Planche (1re passe) : `shots/hud/p1/hud-avant-apres.png`.

## 6. ui/pages — passe des textes
- Lu, pas vu (même coupure). Banc écrit : `banc/pages/textes-p1.cjs <port> <tag> <formats> [lang]` (accueil, réglages haut/bas, garage,
  carrière, pause, fin ; relève tout libellé ACCUEIL/MONTER/PLONGER/PERDU/VERSION… COUPÉ / DÉBORDE / HORS ÉCRAN).
- Conflits avec ui/pause-fin : AUCUN conflit de lignes (hunks à plus de 4 lignes d'écart). Conflits de SENS : (1) la ligne POUCE HAUT de
  la pause, calibrée par pause-fin « pour PLONGE sur 246 px » à 667×375 (valeur en pixel 8 px, min 56) : PLONGER = +8 px, calcul ≈ 198 px,
  devrait tenir — à voir ; (2) pause-fin garde des sélecteurs à 8 px dans la pause couchée étroite (`b.valeur{font-size:8px}`) : contraire
  à la règle 1 (aucun texte < 11 px), antérieur aux règles de 6 h ; (3) PERDU remplace GAME OVER via TR → le titre de l'écran de fin de
  pause-fin l'affichera (plus court, sans risque).
- VERDICT : PAS ENCORE.

## Outils laissés
- `ui/banc/verif-p1-chaine.sh <fin|acc|cm|bq|hud|pages …>` : les bancs à la suite, chacun derrière une porte « charge < 40 ».
- `ui/banc/outils/planche.swift sortie.png hauteur img légende …` : planche SANS navigateur (AppKit), ~25 s.
- Serveurs « avant » (8517, 8593, 8592) FERMÉS ; pour relancer : copie de `git show 4007550:…` + liens (voir le haut de ce fichier).

# REPRISE (8 h 00, après l'intégration de fin + accueil dans ui-integration 1acc1be)
- `ui-integration` fusionnée dans carriere-missions, boutique, hud (sans conflit) et pages (1 conflit : le bloc I18N juste après
  « TOUS LES REGLAGES » — gardé les deux : le bloc des textes de pages + la ligne de traductions de l'accueil ; la ligne TOUS LES REGLAGES
  en un seul exemplaire). Syntaxe 0, garde OK sur les quatre.
- ui/pause-fin `000b292` (à fusionner) : la PAUSE passe ses libellés en police système 13 px (légendes du résumé, lignes de réglage,
  valeurs, bascules élargies à 72 px, RECOMMENCER / QUITTER) ; le pixel reste au titre, aux chiffres et à REPRENDRE. Calcul de la ligne
  POUCE HAUT à 667×375 : ~16 + 8 + 84 + 8 + 76 + 16 ≈ 208 px pour 246 (tient même avec PLONGER de ui/pages).
- Serveurs « avant » relancés : 8517 (4007550) et 8592 (carrière verrouillée, refaite depuis la branche fusionnée).
- Chaîne relancée derrière deux portes (créneau App Store fini + charge < 40) : sonde RÉGLAGES, pause, cm, bq, hud, pages.

# REPRISE 2 (11 h 22 → 12 h 35) — bancs passés, T5 fusionné (chinois et Poki retirés)
- `ui-integration` 92741da fusionnée dans carrière, boutique, hud, pages, accueil, pause-fin. Conflits : pages (bloc I18N, TR, presqueTxt,
  garde de mise à jour) et carrière (mots d'état de carrVueC6) → résolus SANS chinois. `grep -c "I18N_ZH|LANG==='zh'|html.c6.poki|html.poki"` = 0 partout.
  Boutique : deux `!POKI` restaient (POKI n'est plus défini → ReferenceError au cadeau) → retirés (d8e079a).
- ACCUEIL 39913d8 (à fusionner) : RÉGLAGES couché en `grid-column:2/-1` — la sonde a montré que #mHome couché est un panneau de 460 px dont
  la 1re colonne vaut 0 px. Revu : aligné sur le bloc des cartes à 667×375 et 844×390.
- PAUSE-FIN 000b292 (à fusionner) : pause en police système 13 px. Revu 4 formats : plus de pixel < 16 px, rien ne déborde, 0 erreur.
- CARRIÈRE : 6 formats + verrouillé + anglais + avant vus. Corrigé 4b841ea : à 667×375, « SKY HIGH » coupé (→ 2 lignes) et « MONTMARTRE »
  coupé (→ noms de niveau en 12 px, marges de 6 px) ; revu, 0 texte coupé. Debout : 4 mondes tiennent au-dessus de JOUER à 375×667.
  Reste : PARIS (10 niveaux) défile sous JOUER (attendu) ; une fois sur 6, à 844×390, l'ouverture est tombée directement dans les niveaux de
  PARIS (tap qui traverse ? non reproduit).
- BOUTIQUE : 6 formats. Défauts trouvés et corrigés : ◀ du cadeau laissait la boutique 3D sous l'accueil (494e256 puis df634b6 : rangement
  immédiat sous le voile, recette GAR.go) et l'offre essayée restait sur le plateau (8a3f908 : TA caisse remise). Revu : accueil propre.
  ◀ depuis le garage → garage replié (bon). Restent : la colonne « CETTE SEMAINE » commence dans la marge de l'encoche en couché (x 36 pour
  un ◀ à 64) ; une vignette de la colonne vide (CHROME MIROIR) ; la 1re rangée d'OFFRES coupée en haut en debout (« LIMITEE ») ; zone 3D de Léo.
- HUD : carte coach vue aux 3 formats + états raté / long / bravo / VRAIMENT ?, jauge-filet en couché (bonne). Défaut trouvé : la plaque de
  pouvoir se posait SOUS la carte (debout et couché) car `hudColonne` (JS) écrit le `top` en ligne !important — mes règles CSS étaient sans
  effet. Corrigé 5606b95 (la colonne démarre sous #coach quand body.coOn ; règles CSS retirées). Revu : 8 px sous la carte, debout et couché.
- PAGES : réglages (FR, EN), pause, fin vus en 667×375 et 375×667 (+ couché/debout 390). MONTER tient (pastille 76 px), PERDU sur l'écran
  de fin, SAVE DATA / VERSION LOCAL tiennent. HOME → ACCUEIL : aucun libellé visible dans le garage charte 6 (les touches maison y sont des ◀).
  Restent (antérieurs à pages, zone réglages) : tout l'écran RÉGLAGES est en pixel 8-10 px (« VERSION LOCALE » 8 px, valeurs 8 px en couché
  étroit) — contraire à la règle 1 ; même traitement que la pause (000b292) à faire.
- Serveurs « avant » 8517 / 8592 fermés.
