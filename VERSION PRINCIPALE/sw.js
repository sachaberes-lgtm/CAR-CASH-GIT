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
const CACHE = 'cashcar-v1342'; /* v1342 (2026-11-08, Sacha : « les animations au lancement ont encore de la latence ») L'INTRO ATTEND UNE PAGE CALME (load, chauffe du son et de la boule, 40 images sans accroc, plafond 14 s) ; `?calme=0` = avant. */ /* v1341 (2026-11-08, débogage) LA GÉNÉRATION REMARCHE : HCAP déclaré (« HCAP is not defined » cassait nuages, espace, ville, Crypto City, vitrée : JOUER ne lançait plus de course) */ /* v1338 (2026-11-08, Sacha : « on dirait pas qu elles sont dans la boîte ») boutique : les arêtes de devant repassent par-dessus la caisse, vitre de devant plus présente (vitrine ver 12) */ /* v1337 (2026-11-08, Sacha : « les voitures sortent de la boîte ») boutique : la caisse garde de l air dans son verre, photos de vitrine ver 11 */ /* v1336 (2026-11-08, Sacha : « il y a des billets flottants dans le garage ») les 3 piles de l'établi (disparu) sont retirées de l'argent de l'atelier. */ /* v1335 (2026-11-08, Sacha : « la barre de la chaîne est 4 fois trop longue ») elle fait la largeur du score.  v1332 (2026-11-08, Sacha : « il y a la musique alors que je suis mort ») L'ÉCRAN DE MORT EST MUET : plus de lobby 1,4 s après la mort, la musique revient avec REJOUER, CONTINUER, MAISON, GARAGE ; ?mortmusique=1 = avant */ /* v1330 (2026-11-08, Sacha : « améliore comment les voitures sont présentées et éclairées dans la boutique, les arêtes des boîtes passent par-dessus les voitures ») vitrine ver 10 : spot et contre-jour de rareté, faisceau, sol lustré, arêtes de la boîte derrière la caisse */ /* v1328  v1328 (2026-11-08, Sacha : « enlève tout ce que Léo a push sur l'argent, retour aux euros classiques ») RETOUR ARRIÈRE : la monnaie en métal (argent-metaux, v1254→v1322) est retirée, l'€ pixel d'avant revient partout ; le logo du garage, les ailes et les missions FOCUS de Léo restent */
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
