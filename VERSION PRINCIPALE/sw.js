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
const CACHE = 'cashcar-v1103'; /* v1103 (2026-11-03, passe photos) une photo de caisse ne se prend plus sur un shader en cours de liaison (le CHAT POP-TART de la vitrine sortait sans carrosserie, la 1re photo de la session parfois vide) ; les noms de l'inventaire tiennent dans leur case (plus de MASTODONTE / ENGRENAGE-S coupés) */ /* v1102 (2026-11-02, Léo : « les versions améliorées des musiques dans le jeu ») : la rythmique haut de gamme et les timbres affinés des 19 morceaux de course (assets/audio/music/ameliorees/rythmique.js, ?rythmique=0 = les originales). · v1086 (2026-11-02, Léo : « le demi-tour : rien d'automatique, juste un signalement et un petit effet ; on tourne soi-même pour drifter et revenir sur la route ») : le verglas ne ramène plus le nez tout seul (garde-fou à 14 s). Avant : v1085 (2026-11-02, Léo : « le mauvais sens : la voiture ne tourne plus toute seule, elle garde l'angle d'arrivée, un effet de verglas qui permet de se rattraper en drift, mais qui fait tomber ceux qui arrivent trop brutalement ; stylé, sans trop handicaper ») : LE VERGLAS DU CONTRESENS (demi-tour.js, ?verglas=0 = l'ancien pivot auto) — panneau MAUVAIS SENS plus grand, chevrons du côté où braquer, jauge, bord de l'écran givré, RATTRAPÉ en or. Avant : v1084 (2026-11-02 nuit, Léo : « tu m'as enlevé tout le système que j'avais créé ») : la nappe de la boutique au menu seulement avant la toute première partie ; le lobby du niveau revient pour tous les autres. Avant : v1083 (2026-11-02 nuit, Léo : « frottement bizarre au bord de la route », « un son au 1.61 PRESENTS », « enlève le GAME ») : le frottement du SLIDE fabriqué en direct (plus de boucle MP3 qui saute), scintillement d'or sur PRESENTS, « 1.61 PRESENTS ». Avant : v1082 (2026-11-02, Léo : « la musique de l'intro commence trop tôt et se coupe ; elle ne se lance qu'en fondu quand le menu ciel a chargé ») : plus de départ pendant PRESENTS, une seule musique, au ciel ; un joueur neuf a au ciel la nappe de la boutique (comme la leçon), Pouce bleu après la leçon. Avant : v1081 (2026-11-02, Léo : « les chiffres du globe : un peu plus de matière ») : ombre portée + reflet métallique cuits dans chaque chiffre (aucun coût à l'image). Avant : v1080 (2026-11-02, Léo : « le chargement doré est nul et n'apparaît pas direct : un truc classique au milieu ») : anneau CSS dans le HTML, visible tout de suite, remplace la graine dorée. Avant : v1079 (2026-11-02, Léo : « globe plus complet : un tout petit peu de lueur blanche à l'intérieur, chiffres plus opaques et plus de forme, comme les dorés ») : lueur blanche au cœur, opacité des chiffres .18→.42, contour sombre + haut plus clair. */
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
