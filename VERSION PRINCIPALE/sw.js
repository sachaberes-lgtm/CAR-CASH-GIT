/* CASH CAR — service worker minimal : installable + offline.
   Stratégie : network-first pour la navigation (index toujours frais),
   cache-first pour le statique (moteur 3D, audio, icône). */
/* ⚠ LE NUMÉRO DE CACHE EST UN LEVIER, PAS UNE DÉCORATION.
   `activate` SUPPRIME tout cache dont le nom diffère de `CACHE` : changer ce numéro purge donc
   d'un coup l'ancien index.html et les anciens médias. Il FAUT l'incrémenter à chaque fois qu'un
   ASSET change (morceau, icône…), sinon les navigateurs qui ont déjà visité le jeu continuent de
   servir l'ancienne version — indéfiniment, et sans le moindre message d'erreur.
   L'HISTORIQUE DES NUMÉROS (v2 → v624) est rangé à la fin de JOURNAL.md, section « L'HISTORIQUE DU CACHE (ex-sw.js) » (2026-10-18,
   Sacha : « vider l'historique de sw.js » — 272 Ko de notes que chaque joueur retéléchargeait à chaque version). ICI, UNE SEULE
   LIGNE : à chaque version on REMPLACE la ligne `const CACHE` ci-dessous (numéro +1, une note courte), sans garder l'ancienne en
   commentaire ; le détail d'une version va dans sa section du journal. */
const CACHE = 'cashcar-v1025'; /* v1025 (2026-10-30, Léo : « cœurs plus roses, tailles plus aléatoires mais bornées, enlève tous les freezes du menu ciel ») : cœurs rose-fuchsia (chacun sa nuance), 7 à 34 cm ; la gerbe ne sort que des fruits, fleurs et vins déjà envoyés à la carte graphique */ /* v1024 (2026-10-30, Léo : « ça fait bugger le début ») : le préchauffage de la pluie de richesse attend 5 s, un objet toutes les 8 images, jamais sur une image lente */ /* v1023 (2026-10-30, Léo : « les tricks lagg dans la boutique et le garage ») : les photos et films des cartes ne se prennent plus pendant qu'une figure joue, ils attendent 0,45 s après la pose */ /* v1022 (2026-10-30, Léo : « fluidifie l'éjection du menu ciel, cœurs de tailles variées, enlève la fleur violette, objets plus petits ») : objets éjectés préchauffés sous l'écran titre, lilas retiré, cœurs 10-30 cm, billets/pièces/crâne ~25 % plus petits */ /* v1019 (2026-10-30, Léo : « ça démarre, plus calmement, pas d'un coup ») : le lobby entre en fondu de 3 s, à partir du vrai départ du son ?lobbyfondu=0 */ /* v1016 : index.html recollé depuis les morceaux (le compteur ?camdbg=1 ignore les téléportations de plus de 40 m) */ /* v1015 (2026-10-30, Léo : tester la caméra sur iPhone) : ?camdbg=1 affiche en haut à gauche le pire tour de caméra (°/s), le pire saut de sa place (m/s) et la durée d'image sur les 4 dernières secondes */ /* v1014 (2026-10-30, Léo : « la caméra plus fluide et vivante, qui suit le gameplay ») : LA CAMÉRA VIVANTE — un seul ressort de roulis (11° à 180°), anticipation de la face d'atterrissage dans la dernière seconde de vol, raideur selon le style de jeu, petit rebond selon l'impact, rattrapage doux de la caisse à la pose, plus de demi-tour de 180° en une image ; ?camvie=ancien */ /* v1013 (2026-10-30, Léo : le glacier quitte le JOUER, ?carte=banquise le remet) */ /* v1012 (2026-10-30, Léo : « la musique lobby joue encore deux fois ») : le morceau du lobby ne boucle plus, un AUTRE des trois du ciel enchaîne à sa fin */ /* v1010 (2026-10-29, Léo : « un peu moins rapide le tour de caméra ») : le demi-tour de l'écran à l'atterrissage dessous dure ~1,2 s (ressort 6 → 4) ; + hooks de banc dbgCam / dbgLache */ /* v1009 (2026-10-29, Léo : « l'écran qui tourne quand j'atterris de l'autre côté de la route ») : le tonneau de la caméra a de l'inertie (ressort amorti, démarre doux, se pose sans claquer) ?tonneau=ancien ; la rotation portrait↔paysage glisse aussi ?rotation=ancien */ /* v1007 (2026-10-28, Léo : « les flèches sont mal disposées, haut et bas au milieu » + ingénieur physique de jeu) : flèches en CROIX lues par un pavé à 8 directions (on glisse de ◀ à ▲), rampe analogique du braquage, flèches en or en diagonale */ /* v1003 (2026-10-28, Léo : « le gameplay iPhone est moins smooth, trop dur de maintenir le rond ») : COMMANDES volant / flèches / inclinaison, glissière à repères haut-bas, MODE GAUCHER, viseur d'atterrissage plus beau, vibrations du bump et des poses */ /* v1002 (2026-10-28, Léo : traits de vitesse tous droits) : les anciens traits d'air retirés, seuls les filets convergents restent */
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
  // (2026-10-15 soir, LA RÉGIE ADSENSE) rien qui vienne d'AILLEURS que le site : le script de Google, ses pubs, ses images ne passent JAMAIS
  // par ce cache — cache-first les aurait figés jusqu'au prochain numéro de CACHE (des pubs périmées, un script de régie gelé). Le jeu ne
  // charge rien d'autre hors du site (three.js et la police sont dans vendor/).
  if (new URL(req.url).origin !== self.location.origin) return;
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
      // (2026-10-12, passe qualité) `no-cache` au lieu de `no-store` : toujours un VRAI aller-retour (le serveur revalide, rien de
      // vieux ne passe), mais une page inchangée répond 304 — `no-store` retéléchargeait les 5 Mo (1,8 compressés) à CHAQUE lancement,
      // deux fois sur l'ordi (le cadre puis la colonne). Et on ne range comme copie hors ligne QUE la page du jeu, et seulement en 200 :
      // une 404/500 de Vercel, ou une page d'outil, devenait la copie hors ligne.
      fetch(req, { cache: 'no-cache' })
        .then(r => { const p = new URL(req.url).pathname; if (r && r.ok && /\/(index\.html)?$/.test(p)) { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)).catch(() => {}); } return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Statique (vendor/three.js, mp3, icône…) : cache d'abord, sinon réseau + mise en cache au passage.
  // (2026-10-07, campagne de debug avant publication) on ne range QUE les réponses complètes (200) : un 404 (un fichier pas encore livré)
  // restait en cache jusqu'au prochain numéro de CACHE, et une réponse partielle (206, l'audio servi par morceaux) faisait échouer
  // `put` en promesse non gérée. Hors ligne, sans copie : une vraie erreur réseau plutôt qu'un `undefined`.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && r.status === 200) { try { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); } catch (_) {} }
      return r;
    }).catch(() => hit || Response.error()))
  );
});
