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
const CACHE = 'cashcar-v1474'; /* v1474 (2026-11-11 nuit, LA DESCENTE DES VILLES ET DE LA GROTTE — Sacha : « ça ne descend pas assez, il manque 50 % du gameplay : s'envoler pour prendre des raccourcis ») : la ville et Crypto City descendent de 12-13 % (9 % et 8 % avant) et gagnent deux modules à raccourci, LE SAUT et LE GRAND SAUT (un virage serré qu'on ne prend pas : la route d'en bas est dans l'axe, les tours rabattues sous le vol — prouvé en jeu, ~1 km gagné) ; la grotte descend de 7,6 % (4,4 % avant) */ /* v1473 (2026-11-11 soir, Sacha : « ça ne descend pas assez — le but du jeu est aussi de s'envoler pour prendre des raccourcis, comme dans la route arc-en-ciel de Mario ») LA DESCENTE : les nuages et l'orbite plongent de nouveau (10-20 %), un temps fort sur deux est un module à raccourci (le filet, le puits, le looping) ; `?descente=0` = à plat · v1470 (2026-11-11, Sacha : « supprime du jeu la musique dark triad ») morceau dark-triad.m4a retiré, plus de radio surmultipliée en frénésie · v1469 v1469 (2026-11-11, Sacha : « dark triad doit être plus dure à obtenir ») cellules du flow .19 · .135 · .11 → .15 · .105 · .085, croisière exigée .925 → .95 · v1468 v1468 (2026-11-11, Sacha : « améliore le son global du jeu […] sound designer professionnel », « le moteur, c'est comme une perceuse ») LA RÉGIE (code/son/regie.js) : le moteur ne bat plus (le velours) et recule quand rien ne se passe, il encaisse les chocs et repart ; le drift a sa scène (la quinte grave sous la gomme qui chante, le moteur qui s'envole) ; le roulement dit le sol ; le nitro se dose à la durée d'appui, avec sa traîne ; le moteur se règle seul sous la musique ; les files de pièces s'adoucissent — `?regie=0`, `?densite=0` = avant ; passation/SON-REGIE.md */
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
  // (2026-11-07, finition) une requête PARTIELLE (en-tête Range : l'<audio> de la musique sous Safari) va au réseau : `caches.match` lui aurait
  // répondu le fichier ENTIER en 200, que WebKit refuse parfois pour un média (musique muette hors ligne ou au second lancement en PWA).
  if (req.headers.has('range')) return;

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
