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
const CACHE = 'cashcar-v1245'; /* v1245 (2026-11-07, Sacha : « paufine la disposition des boutons de chaque écran, en vertical et horizontale ») LE PAUFINAGE DES BOUTONS : inventaire des figures couché qui sortait par le haut, pastilles du sélecteur à 44 px de touche, panneau des missions couché au-dessus de RETOUR/JOUER (paufinage-boutons.css ; banc des écrans sous Windows). v1244 (2026-11-07, Léo : « avancer vers nous, qu'elle reste dans le cube ») boutique : la voiture avance vers la vitre de devant, toujours dans le cube. */ /* v1243 (2026-11-07, Léo : « que la voiture soit sur le quadrillage du bas du cube ») boutique : la voiture est posée sur le sol du cube, roues sur le quadrillage. */ /* v1242 (2026-11-07, Léo : « le coin devant en bas à droite du cube, il faut qu'il passe par-dessus la plaque grise ») boutique : le cube passe par-dessus la plaque (z-index), 2-3 px de chevauchement. */ /* v1241 (2026-11-07, Léo : « la plaque entièrement sous le cube ») boutique : plus aucun chevauchement entre le cube et la plaque du nom. */ /* v1240 (2026-11-07, Léo : « les voitures dépassent toujours le cube ») boutique : la voiture est ancrée par le bas, à 90 %, remontée : elle est franchement dans le verre. */ /* v1239 (2026-11-07, Sacha : « dans le garage remplace les liasses de dollars par des liasses d'euros ») les liasses de l'atelier d'argent prennent la couleur de leur coupure Europa (5 gris · 10 rouge · 20 bleu · 50 orange · 100 vert · 200 jaune · 500 violet). */ /* v1238 (2026-11-07, Léo : « Kelly Cherry ») le nom complet : KELLY CHERRY. */ /* v1237 (2026-11-07, Léo : « la Cerise en voiture payante, 1,61 €, on l'appelle Kelly ») LA CERISE devient KELLY, légendaire en boutique à 1,61 € (index 83 inchangé). */ /* v1236 (2026-11-07, Léo : « le cube passe légèrement au-dessus du nom en gris ») boutique : le cube mord 8 px sur le haut de la plaque, qui reste derrière lui, carrée. */ /* v1235 (2026-11-07, Léo : « le nom doit être en dessous du cube 3D, sans cacher la voiture, pas de bouts arrondis ») boutique : la plaque du nom est SOUS le cube, carrée. */ /* v1234 (2026-11-07, Léo : « les noms dépassent les cubes et les voitures ne sont pas dans le cube ») cache relevé : la fusion de l'iMac (voiture avancée dans le cube) était restée en v1233, les appareils gardaient l'ancien CSS. */ /* v1233 (2026-11-06, Léo : « les noms de la boutique sont très gros et dépassent le cube ») plaque du nom plus basse (34 px) et sans agrandissement. */ /* v1232 (2026-11-06, Sacha : « les pièces plus réalistes, qu'elles brillent moins ») pièces 1 € / 2 € : métaux ternes, grain, patine, rayures, matière mate. */ /* v1231 (2026-11-06, Sacha : titre CASH CAR centré en portrait) ; v1230 (2026-11-06, Sacha : « quand on réussit une mission elle doit avoir une animation cool et se remplacer vite, on peut récupérer toutes les récompenses en spammant ») MISSIONS : la récompense est versée au toucher, la ligne flashe, s'envole et se replie en 0,35 s, le gain monte, une série ×N fait monter la note ; `?recup=ancien` = avant. */ /* v1229 (2026-11-06, Léo : « le soir et la nuit, pas trop satisfait ») dunes : sable du crépuscule en deux températures, sable de lune la nuit, cône de phares réduit, faisceau de route plus chaud ; le jour est inchangé. */ /* v1222 (2026-11-06) pièces de 1 € et 2 € de la route redessinées (pickups-fruits). */ /* v1196 (2026-11-06, Léo : « le jeu est de mauvaise qualité sur iMac Safari ») LES ÉCRANS RETINA : un iMac (densité 2, fenêtre ≤ 2,6 Mpx de points CSS) n'est plus pris pour un 4K à 100 % — budgets normaux (3,2 Mpx en course, 4,2 à la vitrine) et plancher de 1,5 : la 3D passe de ~1,4 à 1,8 pixel par point au menu (simulé, 1440 × 900 × 2) ; la résolution adaptative sait toujours baisser. `?retina=0` = avant. */ /* v1195 (2026-11-06, Léo : « la version satisfaisante de la capture ») les cartes de la boutique redeviennent la vitrine claire de verre sur socle noir (le décor teinté de la rareté, plus de nuit noire sur les voitures et les ailes) ; à l'achat la vitre se brise (DÉBLOQUÉ) ; les ailes sont seules et battent. */
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
