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
const CACHE = 'cashcar-v1378'; /* v1378 (2026-11-09, session de debugging) le gouverneur thermique de l'iPhone rebranché tel que la passe Perf 3 l'a conçu (30 calé dès le départ, paliers de coût GPU par la dose, régime chaud à dose >= 100) : la fusion cf4041ef avait gardé la copie la plus ANCIENNE des deux fichiers · v1377 (2026-11-09, Sacha : « quand on clique sur REGLAGES ou OFFRES puis qu'on revient, la voiture apparait un instant au centre de la scene avant de revenir ») LE CADRAGE DE L'ACCUEIL TENU : la page ouverte cache #mHome, ses boites mesuraient 0 et menuCadre (ciel du titre) comme garLibre (atelier-menu) retombaient sur un cadrage au centre de l'ecran, que la caisse rejoignait derriere la page puis quittait au retour, page encore a moitie visible ; on garde le dernier cadrage mesure tant que REGLAGES, ACHAT ou MODES est ouvert. · v1377 (2026-11-09, session de debugging) l'argent du HUD en anglais (les milliers n'étaient plus des centimes), la ligne VERSION sans « ⚠ » des sondes, le slide et la figure de route payés au portail, un seul jeu de matières pour la forêt, la salle du coup de l'appui de l'intro, le toucher retenu qui réveille le son · v1376 (2026-11-09, Sacha : « les flèches sont mal gérées ») LE GESTE DE CÔTÉ : une vraie paire ◄ ► (pictogramme gd) à la place des deux demi-disques du dessin fleches, dans le dock, le rappel du vol, la boutique. */ /* v1375 (2026-11-09, Sacha : « retravaille la terre dans le niveau espace, là c'est juste une boule bleue ») LA TERRE DE L'ORBITE REPEINTE : vrais continents (côtes déchiquetées, plateau continental turquoise), biomes, chaînes de montagnes enneigées, calottes polaires ; toile 1024×512 (512×256 sur téléphone), teinte du globe 0x8a98b0 (l'ancienne 0x55708c grisait les terres). */
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
