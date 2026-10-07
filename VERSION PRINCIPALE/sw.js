/* CASH CAR — service worker minimal : installable + offline.
   Stratégie : network-first pour la navigation (index toujours frais),
   cache-first pour le statique (moteur 3D, audio, icône). */
/* ⚠ LE NUMÉRO DE CACHE EST UN LEVIER, PAS UNE DÉCORATION.
   `activate` SUPPRIME tout cache dont le nom diffère de `CACHE` : changer ce numéro purge donc
   d'un coup l'ancien index.html et les anciens médias. Il FAUT l'incrémenter à chaque fois qu'un
   ASSET change (morceau, icône…), sinon les navigateurs qui ont déjà visité le jeu continuent de
   servir l'ancienne version — indéfiniment, et sans le moindre message d'erreur.
   v2 (2026-08-11) : passage de « Chrome Ledger » à « 霓虹钞车 » pour le niveau 1.
   v3 (2026-08-11) : ajout des 4 sons de mort (assets/audio/death/).
   v4 (2026-08-15) : nouveau mix du niveau 1 (霓虹钞车-3, 3 min 02).
   v5 (2026-08-18) : 10 samples d'evenement (assets/audio/fx/) — WOW + les 9 sons d'argent.
   v6 (2026-08-18) : les 5 samples PARLES retires du pool d'argent (ils cassaient les oreilles).
   v7 (2026-08-18) : NIVEAU 2 — « Cash Car Vitesse ».
   v8 (2026-08-18) : refonte du menu (selection de niveau) + le logo qu'on casse.
   v9 (2026-08-18) : audit — decollage qui traversait la dalle, farm d'aura.
   v10 (2026-08-18) : le symbole phi a cote du 1.61.
   v11 (2026-08-18) : menu premium — lever de soleil, casse radiale, symboles typographiques.
   v12 (2026-09-05) : radio (fin des niveaux), dynamique de camera, garage (swipe/tap/zoom), intro,
   menu — plus un `no-store` explicite sur le fetch de navigation (voir plus bas).
   v13 (2026-09-23) : la VILLE VOXEL sous les nuages, et un 3e morceau dans la radio.
   v14 (2026-09-23) : radio reduite a UN seul morceau (reglage temporaire, demande du user).
   v15 (2026-09-24) : FUSION Sacha × Léo (branche fusion-2026-09) — vendor/ + police locale, vrai
        mix NÉON CASH CAR v3 (l'ancien fichier de ce nom contenait Chrome Ledger), sons fx/.
   v16 (2026-09-24) : icônes pixel (assets/icons/), charte pixel unifiée, niveaux Nuages → Ville → Orbite.
   v19 (2026-09-24) : fusion du push de Léo (v17/v18 chez lui) — musique par monde (noite-de-velocidade,
        nocturnal-groove), moteur, voitures low-poly ; charte v2 et passe UX côté Sacha. */
//  v20 (2026-09-25) : boutique, défis, auto-école, charte v3, lecteur de musique unique, ville en 1er niveau, caisses premium.
//  v21 (2026-09-27) : portrait ET paysage (manifest en orientation any).
//  v29 (2026-09-29) : le RIDEAU DE FLAMMES du garage (et sa voix, garage.feu — sons-banque.js?v=7), JOUER / MENU / BOUTIQUE / RÉGLAGES à
//       l'atelier, NOCTURNAL GROOVE à l'accueil et SWAG CASH CAR à L'ORAGE (Léo).
//  v28 (2026-09-29) : la musique de Léo — SWAG CASH CAR à l'accueil, ADDICTIVE LOOP dans la radio. v26/v27 SAUTÉS : la branche de Léo
//       (version-leolei-2026) est déjà montée à v27 ; un navigateur qui a ouvert les deux sur la même origine (localhost) purge ainsi l'ancien cache.
//  v25 (2026-09-29) : banque de sons — frenesie.cash (le ×3 qui s'entend) et nitrooo.palier (NITROOO) — sons-banque.js?v=6.
//  v24 (2026-09-29) : banque de sons allégée (faux stéréo en mono, queues mortes) — sons-banque.js?v=5.
//  v23 (2026-09-29) : optimisation du son (portes du graphe audio, k-rate, salle au repos) — sfx.js?v=4.
//  v22 (2026-09-28) : la CONSOLE DE SON (sfx.js + sons-banque.js) et les silences morts retirés des morceaux (le trou de 1 s à chaque boucle de NOCTURNAL GROOVE en VILLE).
//  v30 (2026-09-30) : les fruits font SPLOTCH (4 prises par fruit) — sons-banque.js?v=8.
//  v42 (2026-09-30) : LA FRONDE (sortie de virage) et le TRAIN DE BOOSTS — son fronde, sons-banque.js?v=10.
//  v45 (2026-09-30) : le SON du niveau 1 — nuages.ambiance (l'air d'altitude) et chute.vent (la chute libre du menu) — sons-banque.js?v=11 ; puis le NIVEAU 1 v2 (image).
//  v51 (2026-10-01) : LA MISE À JOUR TOUTE SEULE — version.json n'est jamais mis en cache (le jeu le lit pour se recharger s'il est en retard). v49 chez moi, v50 chez Sacha entre-temps.
//  v54 (2026-10-02) : L'ORIGAMI, la 69e caisse (le pick-up d'inox).
//  v55 (2026-10-02) : six communes retirées de la gamme.
//  v83 (2026-10-03) : main de Sacha (le dragon de NITROOO) + musique de Léo (CIEL moderne, phrase du boost qui lit chaque morceau)
const CACHE = 'cashcar-v144'; // v144 (2026-10-07, Léo) : l'arc-en-ciel du chat pop-tart en CUBES DE FEU (la matière des flammes de la porte), boost et burn-out arc-en-ciel · v143 = main v142 (le garage de Sacha : mise en place, vue de Léo, donut) + la branche de Léo — v141 (2026-10-06, Léo) : ATCHOUM, le stock-car cabossé qui crache du feu et éternue des flammes · v140 (2026-10-06, Léo) : main fusionné (ciel de l'écran titre v4 puis v6, garage-hub) · le chat pop-tart v13 — la caisse posée sur ses roues, les passages de roue, les pattes accrochées aux roues qui tournent avec elles · v139 (2026-10-06, Léo) : le chat pop-tart v12 — la pop-tart de l'image en pixels sur le pavillon, le trait noir autour de la caisse, une seule laque · v138 (2026-10-06, Léo) : le chat pop-tart v11 — tout le bas en biscuit laqué métallisé, glaçage cerné de biscuit, vitres bleu nuit, tête plus petite grise cernée de noir · v137 (2026-10-06, Léo) : main v134 (la mise en page de la photo, branche de test) fusionné · le chat pop-tart v10 — poly à facettes franches, pavillon flottant, détails · v136 (2026-10-06, Léo) : le chat pop-tart v9 — carrosserie lissée (loft, lumière cuite), vermicelles en bâtonnets · v135 (2026-10-06, Léo) : le chat pop-tart v8 — arrondi comme une voiture moderne · v134 (2026-10-06, Léo) : le chat pop-tart v7 — tête moins épaisse, poupe de GR Yaris (hayon, aileron, hanches, échappements) · v133 (2026-10-06, Léo) : le chat pop-tart v6 — tout en biscuit, glaçage bombé sur le pavillon, dentelure de fourchette · v132 (2026-10-06, Léo) : le chat pop-tart v5 — vraie silhouette de coupé (grille de 5 cm), pavillon glacé · v131 (2026-10-06, Léo) : le chat pop-tart v4 — lisse et futuriste, collé à la tête, bandeau de vitres et de feux · v130 (2026-10-06, Léo) : le chat pop-tart v3 — la pop-tart sur la tranche, en mini Cooper (flancs roses, bande de biscuit) · v129 (2026-10-06, Léo) : le chat pop-tart v2 — caisson carré, feux, aileron, pattes selon l'accélération, pixels multicolores au lieu de l'arc-en-ciel · v128 (2026-10-06, Léo ; v127 = la caméra du garage sur la branche claude/funny-shannon) : le CHAT POP-TART en voxels (la Nyan Cat de l'image), son arc-en-ciel en escalier · v126 (2026-10-06, Léo) : couché, le point de vue d'avant (un peu plus éloigné) · v125 (2026-10-06, Léo) : le bouton rouge minimaliste, hors du plateau, à 5 m du centre — il ne rentre plus · v124 (2026-10-06, Léo) : le petit éclair qui grésille sur la map branchée · v123 (2026-10-06, Léo) : le rectangle sombre du haut corrigé (voile du bas remonté par la console couchée), HOME · ⚙ plus petits et translucides, le socle vert des missions retiré, le bouton rouge sur son pied à sa place · v122 (2026-10-05, Léo) : HOME · ⚙ en haut à gauche, les jauges en haut à droite · v121 (2026-10-05, Léo) : la map branchée sous JOUER, MISSIONS en barre fine au-dessus, JOUER petit, SHOP à côté de la map · v120 = la v116 de la branche de Léo passée au-dessus de main (v117-v119 de main : intro sans musique, heures de l'accueil de Sacha) · v116 (2026-10-05, Léo) : JOUER plus petit et MISSIONS rebranché dessous, SHOP à sa gauche, UNE vignette de niveau plus brillante (touchée : les niveaux accomplis), HOME et ⚙ côte à côte, jauges brillantes · v115 (2026-10-05, Léo) : le bouton rouge et ses outils, la bande des niveaux, HOME sous ⚙, SHOP en grand, l'horizon de l'accueil couché · v113 de main (2026-10-05, Sacha) : LES HEURES DU TITRE, six ambiances de l'accueil · v114 (2026-10-05, Léo) : le doigt sur la caisse tient le plateau, le dérapage, COFFRE large, MISSIONS branché, les vignettes des niveaux · v113 (2026-10-05, Léo) : le retour à la porte, le BURN-OUT (doigt tenu sur la caisse), le COFFRE à côté de JOUER · v112 (2026-10-05, Léo : « arrête de faire tourner automatiquement le garage, un peu plus proche, moins basculer ») · v111 (2026-10-05, Léo) : caméra juste milieu, atelier aéré + rendu, session de debug (intro, lobby recousu, portail en deux temps) · v110 (2026-10-05, Léo : « effet flottant à revoir, un peu brut ») : le tour en ressort amorti, visée rigide · v109 (2026-10-05, Léo : « plus doux l'effet tourner, ça tourne trop la tête ») · v108 (2026-10-05, Léo : « MISSIONS et le level sous JOUER, branché ; le doigt fait le tour du garage, sinon centré sur l'entrée, sans la porte ») · v107 (2026-10-04, Léo : « réorganise les boutons et la place occupée sur l'écran ») : la vitrine en deux barres · main v106–v107 (2026-10-05, Léo) : VILLE 1 à 5 en NÉON, le lead CS-80 remis devant · main v105 (2026-10-05, Léo) : SKY HIGH niveau 5, le lead éclairé, harmonie ?v=13 · v106 (2026-10-04, Léo : « un peu plus haut, incliné vers la voiture, un peu à gauche ; jauge money, jauge aura ») : le plan et les jauges de la vitrine · main v104 (2026-10-05, Léo) : NÉON, la musique du niveau 1 de la carrière VILLE, harmonie ?v=12 · v105 (2026-10-04, Léo : « un beau point de vue, des boutons minimalistes, un inventaire au doigt tenu ») : LA VITRINE v2 + L'INVENTAIRE · v104 (2026-10-04, Léo : « ne mets pas direct le shop dans le garage ») : LA VITRINE · v86 (2026-10-04, Léo) : la musique de course part PENDANT le boost (plus de son de transition), banque ?v=13 ; la mélodie de la phrase du nitro s'éteint de nouveau · v85 (2026-10-04, Léo : « harmonise le début de partie et le début de la musique ») : LE DÉPART EN MUSIQUE, banque de sons ?v=12 · v84 (2026-10-03, soir, Léo : « le jeu coupe bizarrement la musique ») : plus de rechargement à chaque push (le numéro de version = l'empreinte du jeu)
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // version.json (LA MISE À JOUR TOUTE SEULE, 2026-10-01) : le commit publié, lu par le jeu pour savoir s'il est en retard —
  // JAMAIS servi ni rangé par le cache (cache-first le figerait, et chaque lecture ?t=… ajouterait une entrée).
  if (/\/version\.json$/.test(new URL(req.url).pathname)) return;

  // Navigation (chargement de la page) : réseau d'abord → toujours la dernière version,
  // repli sur le cache si hors-ligne.
  // ⚠ `{cache:'no-store'}` EXPLICITE (2026-09-05) : sans lui, ce `fetch()` reste soumis au cache
  // HTTP ORDINAIRE du navigateur (disque/mémoire) — un simple rechargement (pas un hard-refresh)
  // pouvait donc être satisfait SANS AUCUN aller-retour réseau, malgré le commentaire « toujours la
  // dernière version » : le SW appelait bien fetch(), mais fetch() lui-même retombait sur du vieux.
  // Symptôme rapporté : des changements pourtant en ligne (index.html neuf sur le serveur) restaient
  // invisibles en jeu. `no-store` force un VRAI aller-retour, à chaque navigation, sans exception.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Statique (vendor/three.js, mp3, icône…) : cache d'abord, sinon réseau + mise en cache au passage.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      try { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } catch (_) {}
      return r;
    }).catch(() => hit))
  );
});
