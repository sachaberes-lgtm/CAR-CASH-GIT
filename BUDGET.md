# ⚠ 12 h 16 — TROP RAPIDE : 28 % de la fenêtre en 56 min (≈ 29 %/h ; il faut ≤ 18 %/h pour tenir jusqu'à 16 h 20) et l'HEBDOMADAIRE est à 46 %.
#    PLAFONDS RÉDUITS dès ta prochaine vague (7 agents en tout) : INTERFACE 2 · GRAPHISME 2 · DEBUGGING 1 · OPTIMISATION 1 · SON 1 · GAMEPLAY 0
#    (GAMEPLAY : finis l'agent en cours puis pause jusqu'au prochain ordre) · PILOTAGE : l'assembleur des trains seulement.
#    Chefs : UN tour par fin d'agent, rien à la main. Les plafonds de 11 h 20 ci-dessous sont REMPLACÉS par ceux-ci.

# 🔁 11 h 20 — REPRISE (Sacha : « c'est reparti, redémarre tout »). Tout s'était arrêté vers 8 h 15 : la fenêtre de quota 6 h-11 h a été VIDÉE
#    en ~2 h 15 avec 20 agents (≈ 45 % par heure, plus du double du rythme visé). Nouvelle fenêtre : 1 % à 11 h 20, remise à zéro à 16 h 20 ;
#    HEBDOMADAIRE : 39 % (remise à zéro le 17/10 à 13 h) → chaque fenêtre vidée coûte ~12 % de la semaine.
#    PLAFONDS DE CETTE FENÊTRE (12 agents en tout, pour tenir jusqu'à 16 h 20 sans s'arrêter) : INTERFACE 3 · GRAPHISME 3 · DEBUGGING 2 ·
#    OPTIMISATION 1 · SON 1 · GAMEPLAY 1 · PILOTAGE 1 · APP STORE seul. Navigateurs : 3 créneaux (2 images + 1 léger). Contrôle à chaque train.
#    Le cap de 6 h 10 tient toujours : LES DÉTAILS, le jeu le plus propre possible, chaque chose compatible et magnifique avec les autres.

# 🟢 07:54 — CRÉNEAU APP STORE OUVERT jusqu'à 08:19 sur assemblage 4febc49 : navigateurs de banc à ZÉRO pour toutes les autres sessions (créneaux réservés).
#    (s0 et s2 réservés ; s1 encore tenu à 07:54 par un banc perf « node v10.cjs 8400 » — un guetteur le réserve dès qu'il se libère, jusqu'à 08:19.)
# ✅ 7 h 21 — charge revenue à 5 : les 3 créneaux sont rendus (2 images + 1 léger). Rappel : jamais le simulateur EN MÊME TEMPS que les navigateurs.
# ⛔ 7 h 03 — CHARGE DU MAC À 534 (au-delà du niveau qui l'a fait redémarrer à 2 h) : simulateur iOS + 2 navigateurs + 16 sessions.
# PILOTAGE a arrêté le simulateur et RÉSERVÉ 2 des 3 créneaux de navigateur jusqu'à 7 h 30 : UN SEUL navigateur de banc pour toute la machine.
# Jusqu'à 7 h 30 : pas de nouvelle mesure de perf, pas de capture en rafale ; travail de code et tests node d'abord. Train T4 décalé à 7 h 30.
# Le simulateur iOS ne tournera plus EN MÊME TEMPS que les navigateurs : son créneau sera annoncé ici, avec les navigateurs à 0.

# ⚠⚠ 6 h 10 — CAP DE SACHA, il prime sur tout le reste de ce fichier :
# « Ça [les grandes questions], on s'en fout : ce sont les DÉTAILS qui m'intéressent — faire le jeu le PLUS PROPRE POSSIBLE. Les idées
#   principales, on les fera après. Pour l'instant, rends chaque chose COMPATIBLE et MAGNIFIQUE les unes avec les autres. »
# → LA PASSE DÉTAIL ET COHÉRENCE : aucune refonte, aucune nouvelle direction (la direction artistique d'INTERFACE, Q11, est EN PAUSE) ;
#   on PEAUFINE l'existant et on accorde tout ensemble : chaque écran avec les autres (même bouton, même marge, mêmes tailles de texte, même
#   retour au toucher), l'interface avec les décors 3D, les maps entre elles (même qualité de route, de ciel, de lumière), les couleurs de
#   l'interface avec celles des scènes, chaque son avec les autres, ce que Léo ajoute avec le reste.
# → On ne pose plus de grande question à Sacha : tu tranches par l'œil et la mesure, réversible. QUESTIONS.md seulement pour un vrai blocage.
#   (IMAGE NETTE par défaut sur les iPhone récents : OPTIMISATION décide par la mesure ; les noirs bouchés : GRAPHISME décide à l'œil.)

# BUDGET — 14/10, 6 h 02 — LA FENÊTRE EST REMISE À ZÉRO : PLAFONDS « APRÈS 6 H » EN VIGUEUR. Sacha (6 h 01) : « c'est reparti, envoie la sauce max ».
# (Consigne de 4 h 55 ci-dessous) (PILOTAGE le réécrit ; relis-le avant chaque vague)

Sacha (4 h 50) : « fais encore plus dans le détail PARTOUT, c'est très loin d'être suffisant, SURTOUT POUR L'INTERFACE ; redonne du travail à tout le
monde, on est très loin d'un niveau professionnel ; fais travailler chaque session dans la recherche de la PERFECTION et de L'INTÉGRATION DES
POUSSÉES DE LÉO, pour que le jeu soit pro. » (Rappels : la cible est l'app iPhone ; « on sort plus tard » ; « optimise bien les tokens ».)

## JAMAIS À L'ARRÊT (Sacha, 5 h 00 : « je ne veux pas qu'ils arrêtent de travailler, jamais ; donne-leur toujours du travail »)
- Un chef ne finit JAMAIS un tour sans un agent en vol : dès qu'un agent rend, tu intègres et tu lances le suivant dans le même tour.
- Ta file : (1) les ordres directs de Sacha, (2) ta section de `pilotage/BACKLOG.md` (PILOTAGE l'alimente en continu : un éclaireur global cherche
  les détails « pro » partout), (3) ton programme ci-dessous, (4) si tout est vide : un agent « œil neuf » sur ta zone, qui en retrouve dix.
- Tenir sans jamais s'arrêter, c'est ne JAMAIS toucher la limite du forfait ni refaire tomber le Mac : les plafonds ci-dessous servent à ça.
- Ton fichier d'état réécrit à chaque fin d'agent : s'il a plus de 45 min, PILOTAGE te relance.

## ⚠ 5 h 08 — CHARGE À 200 PENDANT 5 MIN : 4 navigateurs ouverts pour 2 créneaux
Vu : un script sans créneau (`debug/banc/verif-jeu.cjs`, arrêté par PILOTAGE), un script qui ouvre 2 navigateurs sous UN créneau
(`perf/banc/garde.cjs`), un démon qui garde un navigateur 22 minutes (`daemon.cjs`). RÈGLES :
- UN navigateur = UN créneau, pris par `B.ouvre` du `lib.cjs` de ta session. Plusieurs formats = plusieurs CONTEXTES dans le MÊME navigateur, l'un après l'autre.
- Pas de démon : un créneau se rend en moins de 10 minutes. Un navigateur sans créneau, ou un 2e sous le même créneau, est arrêté par PILOTAGE.
- Le Mac est tombé une fois cette nuit ; s'il retombe, tout le monde s'arrête.

## 5 h 25 — LA FILE DES NAVIGATEURS EST SATURÉE (6 scripts en attente, jusqu'à 17 min) : un 3e créneau pour les bancs LÉGERS
- Banc de LOGIQUE (fumée, vérification de bug, volant, états — on ne juge pas l'image) : ouvre avec `dsf: 1` (4 fois moins de pixels) et lance-le avec
  `CC_SLOTS=3 node …` → il peut prendre le 3e créneau (`s2`). DEBUGGING, GAMEPLAY, les fumées de tout le monde.
- Banc d'IMAGE (captures jugées à l'œil, mesures de perf) : inchangé, 2 créneaux (`s0`, `s1`), jamais `CC_SLOTS`. INTERFACE, GRAPHISME, OPTIMISATION.
- Un créneau se rend en moins de 10 min ; un script par agent ; pas de file de 3 scripts lancés d'avance par la même session.

## Plafonds
Quota : 0 % à 6 h 01 (fenêtre jusqu'à 11 h 00 ; hebdomadaire 27 %). Rythme visé : ~20 % par heure, contrôlé à chaque train.
Avant : 85 % à 5 h 12, remise à zéro à 6 h 00. Sacha (5 h 15) : « il me reste des tokens pour ce soir, tu peux vraiment les pousser au bout ».
→ jusqu'à 6 h on TIENT les plafonds actuels (dépasser 100 % couperait tous les agents en plein travail) ; **À 6 h 00 PILE, chacun passe à sa colonne
« après 6 h » sans attendre de message** : 20 agents en tout. Les navigateurs du JEU restent à **2** (3 = charge 160, le Mac tombe).
Nouveau : les pages STATIQUES (maquettes HTML/CSS, planches d'images — pas le jeu en WebGL) ne prennent pas de créneau : 1 à la fois par session.
| Session | jusqu'à 6 h | après 6 h | Navigateur |
|---|---|---|---|
| INTERFACE (priorité n° 1 avec GRAPHISME) | **3** | **5** | 1 à la fois — PRIORITAIRE sur le sémaphore |
| DEBUGGING | **2** | **3** | UNE fumée par lot intégré, pas plus (les 2 créneaux vont d'abord à INTERFACE et GRAPHISME) |
| OPTIMISATION | **2** | **2** | mesures GROUPÉES en une ouverture par train |
| GRAPHISME (priorité n° 1 avec INTERFACE) | **3** | **5** | 1 à la fois — PRIORITAIRE sur le sémaphore |
| GAMEPLAY | **1** | **1** | par l'agent |
| SON (nouvelle, 5 h 30) | **1** | **2** | aucun navigateur du jeu ; au besoin 1 banc LÉGER par train (`dsf: 1`, `CC_SLOTS=3`) |
| APP STORE | 0 (seul) | 0 (seul) | panneau de l'app ; `xcodebuild` sur créneau annoncé ici |
| PILOTAGE | **1** | **2** | 1 fumée par train |
Règles de chef inchangées : tu DÉLÈGUES (ton fil pèse 300 000 à 700 000 tokens, un agent neuf 10 000), UN tour par fin d'agent, aucun sondage ;
agents en `model:'sonnet'` par défaut, Opus pour écrire un correctif délicat, effort `high` au plus ; un commit par correctif ; état dans `etat/`.

## LA BOUCLE DE PERFECTION (toutes les sessions, en continu)
1. **INTÉGRER LÉO.** Il pousse ~12 commits par heure sur main (boutique, lobby, LE DOGE, vol équilibré…). À chaque train PILOTAGE fusionne main dans
   `assemblage` et liste ses commits dans `ETAT.md`. Toi : `git merge assemblage`, puis RELIS ceux de TA zone — est-ce au niveau ? bug ? coût ?
   cohérent avec le reste ? — et finis le travail PAR-DESSUS (on améliore Léo, on ne l'annule jamais ; burn-out intouchable).
2. **L'ŒIL NEUF.** Un agent critique (sonnet, neuf, sans rien corriger) passe ta zone au crible comme le ferait un pro exigeant d'un jeu du top de
   l'App Store, et rend LES 10 DÉFAUTS LES PLUS VISIBLES, classés, chacun avec sa preuve (capture, mesure, ligne).
3. **CORRIGER** le haut de la liste, un commit par défaut, preuve avant / après.
4. **MONTRER.** Tout choix que Sacha verrait : une planche ou deux lignes dans `QUESTIONS.md` (tu continues sur ton choix par défaut).
5. **RECOMMENCER.** Une zone n'est « finie » que lorsque l'œil neuf ne trouve plus rien au-dessus de « mineur ». Écris le score dans ton état.

## Le programme de chacun
- **INTERFACE** — (a) garage + boutique : les 2-3 pistes en MAQUETTES pour Sacha, puis le code ; (b) CHAQUE écran contre la grille pro : marges et
  grille constantes, 3-4 tailles de texte, cibles tactiles ≥ 44 pt, zones sûres (encoche, îlot, barre), états pressé / désactivé, transitions aux
  durées cohérentes, 3 langues sans débordement, debout ET couché, du petit iPhone au Pro Max, rien qui se chevauche ; (c) le HUD lisible à pleine
  vitesse ; (d) le premier lancement et l'auto-école ; (e) le CSS mort (liste : `pilotage/notes/nettoyage-outils/css-mort.tsv`) et le code des VOIX.
- **GRAPHISME** — ⚠ Sacha, 5 h 05 : « c'est surtout les graphismes et les shaders, c'est très mal géré ; je veux que le jeu soit MAGNIFIQUE ; les
  ambiances et la colorimétrie ne vont pas du tout. » Le périmètre « gratuit seulement » est LEVÉ : shaders, lumières, post-traitement, ambiances
  peuvent être refaits — le surcoût réservé au palier récent (`PAL.n` 2), les vieux iPhone gardent leur coût. D'abord LA CHAÎNE DE COULEUR jugée
  AU CRAN QUE L'IPHONE UTILISE VRAIMENT (pas au cran FULL du Mac). Puis le rendu AU CAS PAR CAS, la ville de jour d'abord, une planche par couple pour Sacha ; les nuages du jade ; les planètes de l'orbite ;
  le vrai trou des pièces ; et l'harmonie de ce que Léo ajoute (LE DOGE, la boutique) avec le reste — matière et lumière, jamais la forme.
- **DEBUGGING** — (a) LA REVUE DES POUSSÉES DE LÉO, commit par commit, à chaque train (régressions, cas limites) ; (b) le HUD absent en téléphone debout
  vu 1 fois sur 4 à la fumée du mode classique : trouver la cause ; (c) chaque transition d'état, le premier lancement, la sauvegarde, puis le reste.
- **OPTIMISATION** — LE GARDIEN DU BUDGET : à chaque train, mesurer `assemblage` (triangles, appels, mémoire, démarrage, par palier) contre le train
  d'avant et nommer qui a fait monter quoi (autres sessions, Léo : LE DOGE, six musiques de lobby) ; puis (a)(b)(c) de ta liste ; le 30 i/s dès que
  le choc balayé de DEBUGGING est au journal.
- **GAMEPLAY** — le joystick qui se détache quand le pouce va trop loin (n° 1) ; relire le « vol équilibré » de Léo (`34646a5`) contre tes réglages du
  volant ; l'idée de jeu pour NUAGES 4 ; puis le ressenti, zone par zone.
- **APP STORE** — l'essai à blanc après chaque train ; les gestes système des bords dans l'app ; les pages (le OUI de Sacha dans ta session).
- **SON** — « la meilleure ambiance sonore du monde, des sons addictifs » : mixage (bus, maître), gains par son et par morceau EN CODE, chaînes
  continues (moteur, vent, nitro), appels `sfx()` manquants ; reprend les lignes « son » de la section PILOTAGE du BACKLOG. Les MORCEAUX sont à Léo
  (il en pousse cette nuit) : pas de réencodage des fichiers de musique ; la banque d'effets ne se recuit qu'en gardant retirés les 5 ids du nettoyage.
- **PILOTAGE** — un train PAR HEURE (T3 lancé à 6 h 05, puis 7 h 00, 8 h 00…) ; APP STORE : créneau `xcodebuild` à la fin de T3 (annoncé dans ETAT.md) ; CRYPTOCITY et l'édition Poki à retirer après 6 h ; le mixage du son.

## Les trains
Dix minutes avant l'heure : ta branche PROPRE (syntaxe + garde, `git status` vide). Personne ne pousse sur main (PILOTAGE, sur ordre de Sacha).
Questions pour Sacha : `pilotage/QUESTIONS.md`. Journal commun : `debug/journal-correctifs.tsv`. Sémaphore des navigateurs : `pilotage/slots` (2).
⚠ Nettoyage fusionné à T2 : 113 commandes `dbg*` sans appelant connu ont été retirées — si un de tes bancs en perd une, dis-le dans ton état.
