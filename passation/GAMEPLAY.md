# PASSATION — session GAMEPLAY (passe SENSATIONS), Mac → PC de Sacha · 14/10/2026, 13 h 30

Branche : **`sensations-integration`** (sur `origin`). Elle contient `assemblage` T6 (`242da07`) + tout le travail de la passe.
Fichier du jeu : `VERSION PRINCIPALE/index.html` (un seul fichier, ~55 000 lignes ; ne jamais l'afficher en entier : grep par nom, lecture par tranches).
Protocole du PC : `PROTOCOLE-PC.md` sur `origin/pilotage-notes` (fetch, merge `origin/assemblage`, push de TA branche, état dans `passation/ETAT-GAMEPLAY.md`).

## Les ordres de Sacha qui ont fait cette passe
1. Joystick mobile un peu plus sensible. Puis, dans l'app : « quand mon pouce se déplace trop, il se détache ».
2. Petits détails de ressenti (conduite, vol, chocs, collisions, explosion, eau), « jouissif sur mobile », sans changer radicalement le gameplay.
3. L'eau : « plonger et surfer de manière cool » au lieu de ralentir.
4. Les FIGURES : qu'elles rapportent du NITRO, physique lourde façon Asphalt 8/9, combinables en l'air (180° sur un axe puis 180° sur un autre),
   « irréprochable, jouissif, explosif » en martelant le double-tap ; « inspire-toi des figures et de leur interface dans le shop, mais refonte totale de la physique ».
5. NUAGES 4 (Q8) : « trouvez un autre niveau cool » (les cônes ont été retirés).
6. Le PARFAIT au contact des roues : « oui ». La mise en ligne : « attends le train » (on ne pousse jamais `main`).
7. L'argent du début : le premier achat doit tomber en **« 4 parties »**.

## FAIT (intégré dans `sensations-integration`, VERIF OK, garde du burn-out OK, fumée OK couché + debout + `?play=jade`, 0 erreur JS)
Tout est sous le drapeau global `SENS` : **`?sens=0` rend le jeu d'avant la passe**.
- **Volant tactile** : braquage plein à 46 px (au lieu de 54), assiette haute 38 px, lissage du pouce τ 30 ms (drift inchangé). Pouce orphelin réparé
  (suivi par identifiant) + **relais du pouce** (`stHerite`) : un contact né < 450 ms, à < 90 px du pouce, reprend le volant. `dbgTouch()` montre relais et coupes.
- **7 zones de ressenti** : chocs au sol (pad, dos d'âne, retombée, plot, flaque), pose et envol, glisse, nitro, ramassage, passages, carrosserie, explosion.
  Outils communs : `sensCoup` (coups dans la carrosserie), `sensHap` (vibration à limiteur), `sensSecoue` (secousse plafonnée), `dbgSens()`.
- **Eau qui se joue** (`EAU.fun`, `?eau=ancien`) : surf (« SURF ! » après 0,8 s), plongée au pouce bas, ressortie en dauphin (« HORS DE L EAU ×n »). `dbgEau()`.
- **Figures libres au double-tap en vol** (`FLK`, `figLibreTap/Tick/Demi/Pose`, `?fig=script` = les figures scriptées de Léo) : neutre = tonneau,
  gauche/droite = toupie, haut/bas = salto, diagonale = les deux ; chaque demi-tour donne du nitro (plafond 60 %/vol) ; tours nommés et combos à la pose
  (TIRE-BOUCHON, RODEO, VRILLE PENCHEE, SALTO COSMIQUE) ; bonus si la figure est possédée au shop. `dbgFigL()`.
- **NUAGES 4 « MATIN FRAIS » = SAUTE LES MOUTONS** : moutons de ouate couchés sur la route, saut nitro offert à leur pied, BERGER D'OR à 9/9.
  Laine plus claire + tête noire (lisibles à 50 m, troupeau à 130 m) ; BEEE seulement au contact au sol. Ouvrir : console `dbgCampagne(4,0)` ; `dbgMoutons()`.
  Aussi : défis comptés dès le départ (20 s sans bannière), leçon TOURNE de l'auto-école plus douce (`TUTO_DOUX`).
- **Passe d'ACCORD** avec le « vol équilibré » de Léo (relu : compatible) — une seule voix par événement : le nez ne plonge qu'une fois (Léo), la
  vibration ET le PARFAIT (flash, zoom, couronne) tombent au contact des roues, saut nitro = un seul motif (celui de Léo), porte = un coup net,
  dos d'âne = deux tics, bump = une gerbe au flanc, eau posée sur la suspension de Léo (`VEQ.ext`), appui NITRO sans doublon ; hors app, un tic ne coupe
  plus un coup lourd. **Grammaire des vibrations** (commentaire au-dessus de `sensHap`) : tic léger ≤ 12 ms · coup net 14-24 · coup lourd ≥ 45 · motif double.

## EN COURS / NON INTÉGRÉ
- **L'argent du début** (BACKLOG P2) : étudié, RIEN codé (voir « ÉCO » en bas). Aucune autre branche ne porte de travail non intégré.

## LA SUITE, par priorité
1. **L'argent du début** : faire trancher Sacha (question ci-dessous, rubrique ÉCO), puis coder — sans toucher aux PRIX de la boutique de Léo,
   réversible `?eco=ancien`, qui s'éteint seul.
2. **À trancher par Sacha** (relevé en image, rien changé) :
   - le zoom du PARFAIT, maintenant au contact, s'ajoute à la plongée de caméra de Léo : en portrait, une caisse en crabe sort par le bord
     (`passation/gameplay-parfait-debout.jpg`) — garder ou doser en portrait ?
   - passer à côté / entre deux moutons ne compte rien : faut-il un retour ?
   - après une pose qui glisse, la caméra (de Léo) laisse la caisse à moitié hors cadre ;
   - textes qui se recouvrent ~1 s par course (carte MOTEUR × compteur DAUPHIN, `#ajVols`, « +20 » 3D) → pour la session INTERFACE.
3. Non vu en image : le BERGER D'OR (le robot plafonne à 7/9), le passage eau → route, les figures libres au vrai téléphone (le double-tap
   n'est pas fiable au banc). `hitT` (gel d'image) n'a plus d'effet depuis le 26/09 (la boucle le vide) : ce n'est pas de la passe, à signaler.
4. Ensuite : le ressenti zone par zone, au vrai téléphone, avec Sacha.

## RÈGLES
- **Intouchables (Léo)** : le burn-out du garage (`sh garde-burnout.sh` doit dire OK), la boutique 3D, les voitures, les morceaux de musique.
  On AMÉLIORE le travail de Léo, on ne l'annule jamais.
- Gameplay verrouillé sauf demande explicite de Sacha ; physique de conduite, vitesses, économie : pas sans son ordre. Tout ce qu'on ajoute a son drapeau de retour.
- Plus jamais : chinois (`I18N_ZH`, `LANG==='zh'`), édition POKI (`POKI`, `pk(`, `html.poki`, `html.c6.poki`), CRYPTOCITY.
- **Jamais `main`** (pousser sur main = publier sur Vercel, c'est Sacha qui décide) ; jamais `--force`. Seul dépôt : CAR-CASH-GIT.
- Piège connu : un nouveau nom global peut être MASQUÉ par un `const` local du même nom (le bloc tactile a `const SENS=[…]`, d'où `SENSG`) → le jeu
  ne démarre plus, et la syntaxe passe quand même. Avant un nom global : `grep -nE "\b(const|let|var) NOM\b"` sur tout le fichier, et un test de démarrage tôt.

## TESTER SANS LES BANCS DU MAC
```
cd "VERSION PRINCIPALE" && python3 -m http.server 8000 --bind 127.0.0.1
```
- `http://127.0.0.1:8000/index.html` (couché) · `index.html?colonne=portrait` (debout) · `?play=jade` (Soleil de jade).
- Comparer : `?sens=0` (sans la passe) · `?eau=ancien` · `?fig=script` (figures de Léo) · `?vol=ancien` (vol d'avant Léo) · `?volant=NN` (largeur du volant en px).
- Console : `dbgSens()`, `dbgTouch()`, `dbgEau()`, `dbgFigL()`, `dbgMoutons()`, `dbgCampagne(4,0)` (NUAGES 4).
- Syntaxe : chaque `<script>` d'index.html doit passer `node --check` ; `sh garde-burnout.sh` → OK ;
  `grep -c "I18N_ZH\|LANG==='zh'\|html\.c6\.poki\|html\.poki" "VERSION PRINCIPALE/index.html"` → 0.

## ÉCO — état à l'arrêt
Notes complètes : `passation/gameplay-notes-eco.md` (et `gameplay-notes-accord.md`, `gameplay-notes-oeil.md` pour les deux passes précédentes).
- **Le BACKLOG se trompait de prix** : l'objet le moins cher n'est PAS NOIR MAT ($ 9 k) mais la traînée MENTHE et la figure SHIMMY à **$ 2 000**
  (puis MENTHE GLACÉE 2 500, HÉLICES 3 000, BLEU MINUIT 5 000 ; aucune voiture sous 24 k). La boutique s'ouvre sur l'onglet VOITURES, d'où l'erreur.
  Le « ~1 500 parties » venait d'un robot sans pilote (5-35 $ par course).
- L'argent vient surtout des pièces ramassées ; primes uniques : permis +500, contrat 1 +500, contrat 2 +900 ; la banque reçoit `money − START_CASH` (`commitExploits`).
- Mesuré (départ 500 $) : un joueur qui tient 45-90 s passe 2 000 $ vers la **2e-3e partie** (au sol nitro tenue : 1 632 · 2 662 · 4 264 ;
  sauts + nitro avec morts à 10 s : 974 · 978 · 1 013 · 2 441). Un multiplicateur avancerait l'achat AVANT la 3e partie : pas codé.
- **QUESTION POUR SACHA** : « le premier achat » visé, c'est l'objet à $ 2 000 (alors aucun multiplicateur : au plus un plancher pour les joueurs
  faibles — prime au temps tenu, ≤ 5 parties, aucun achat, < 2 000 $ en banque) ou NOIR MAT 9 k / l'ELDORADO 24 k (alors ×3 à ×8 sur 4 parties, à recalculer) ?
- Le vrai manque est la VISIBILITÉ : l'écran de fin ne montre aucun objet à portée (l'« objectif » ne vise que les voitures). Proposition : une ligne
  sobre sous « COMPTE : … » (« TRAÎNÉE MENTHE · $ 2 000 — IL TE MANQUE $ 450 ») et/ou ouvrir la boutique sur l'onglet de l'objet qu'on peut s'offrir.
- Pas fait : la courbe des parties 1-6 d'un joueur moyen (le pilote du banc bloque au premier portail vers 50 s, montants sous-estimés au-delà).
