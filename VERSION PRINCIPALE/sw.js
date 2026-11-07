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
const CACHE = 'cashcar-v1276'; /* v1274 (2026-11-07, Léo : « laisse le socle noir de Sacha, je ne vois plus les vitres ») boutique : la vitrine des voitures reprend le socle NOIR VERNI de Sacha (avec le quadrillage, le verre et le fond de studio de Léo), et la vitre reste sur les caisses à toi ; le bloc de route : vitrine=route. */ /* v1273 (2026-11-07, Sacha : « lance une vraie chasse aux bugs ultra complète […] un soin particulier au son ») LA CHASSE : JOUER pendant la chauffe ne fige plus l'atelier (garage-rendu.js) ; ANNULER et SÉRIE en anglais ; la mission des couleurs n'est plus offerte sur le web ; les peintures gagnées restent dans MISSIONS au rechargement ; MAUVAIS SENS s'efface après QUITTER ; le pré-bâti retrouve sa chance à chaque partie ; le rayon de la boutique suit la vedette ; la 3D de l'ordi suit le zoom du cadre ; ROSSO 40 sans faux prix ; et LE SON : sons de course chauffés avant le départ (sfx.js v11), Pouce bleu muet en pause, RECOMMENCER tire un morceau neuf, air de la boutique rebranché, rouleaux du spin, boule de l'intro avec délai de secours, graphe endormi quand tout est coupé, bips du 3-2-1 sans paquet. */ /* v1272 (2026-11-07, Sacha : « remets l'ancien caractère €, annule le push de Léo ») la monnaie du sketch de Léo (v1254, v1256, v1269) est retirée : le € d'avant revient partout. */ /* v1271 (2026-11-07, Sacha : « organise-toi pour tout pousser avec soin ») LE RATTRAPAGE DE L'ARBRE PARTAGÉ : Final Spin réparé en mobile (final-spin.css), boutique — un système par rayon (peinture, ailes, traînées, figures : boutique-*.js/css), missions — l'écran de mission seulement pour une caisse, pièces ramassées 9 dB plus bas, ligne POUCE HAUT retirée dans le cadre téléphone de l'ordi. v1270 (2026-11-07, Léo : « la plaque noire, c'est un bloc de route du jeu » puis « oui, sur le main ») boutique : la vitrine des voitures a pour socle un BLOC DE LA ROUTE DU JEU (béton brut, flancs, lignes, liseré de rareté), photographié en 3D avec la caisse, sous le verre teinté de la rareté et son fond de studio ; vitrine=0 = le cube d'avant. */ /* v1269 (2026-11-07, Léo : « plus 3D jeu vidéo, là on dirait un euro ») le symbole de la monnaie prend un corps extrudé vers le bas-droite, séparé de sa face par un filet. */ /* v1267 (2026-11-07, Léo : « missions un peu plus petites, flottantes, un toucher les avance, un second les choisit ») LE VISEUR : profondeur des cartes. */ /* v1266 (2026-11-07, Sacha : « dans le garage il y a des tas de billets qui flottent ») les deux piles de billets posées sur des fûts disparus de l'atelier sont retirées (argent-atelier.js).  v1265 (2026-11-07, Léo : « un push a annulé le travail de la voiture dans le cube, il y a une plaque noire ») boutique : la vitrine miniature (socle noir verni) est éteinte par défaut, retour aux cubes de verre à sol quadrillé ; la vitrine s'allume avec vitrine=1. */ /* v1264 (2026-11-05, Sacha : « enlève la pluie dans le biome canyon des géants » · « l'orage aussi ») LE CANYON SANS PLUIE : les météos PLUIE et ORAGE du canyon sortent du tirage (p:0, niveaux.js) : il reste le matin, le soir et la nuit ; `?carte=canyon&meteo=pluie` (ou `orage`) les joue encore ; la mission « toutes ses météos » ne compte plus les météos hors du tirage (defis-moteur.js). */ /* v1262 (2026-11-07, Sacha : « lance une vraie chasse aux bugs ultra complète […] un soin particulier au son ») LA CHASSE : JOUER pendant la chauffe ne fige plus l'atelier (garage-rendu.js) ; ANNULER et SÉRIE en anglais ; la mission des couleurs n'est plus offerte sur le web ; les peintures gagnées restent dans MISSIONS au rechargement ; MAUVAIS SENS s'efface après QUITTER ; le pré-bâti retrouve sa chance à chaque partie ; le rayon de la boutique suit la vedette ; la 3D de l'ordi suit le zoom du cadre ; ROSSO 40 sans faux prix ; et LE SON : sons de course chauffés avant le départ (sfx.js v11), Pouce bleu muet en pause, RECOMMENCER tire un morceau neuf, air de la boutique rebranché, rouleaux du spin, boule de l'intro avec délai de secours, graphe endormi quand tout est coupé, bips du 3-2-1 sans paquet. */ /* v1261 (2026-11-07, Léo : « je veux que ça remplace le système de missions tout listé direct ») LES MISSIONS NOUVELLE FORME : 3 missions tirées au hasard autour de la caisse (LE VISEUR), cadeaux garantis, reprise de la progression ; ?pass=0 pour l'ancien. */ /* v1260 (2026-11-07, Sacha : « horrible, retourne en arrière ») menu ciel : retour aux tuiles GARAGE / ACHAT / REGLAGES d'avant (verre anthracite) ; les tuiles en bonbon clair de v1256 sont retirées. */
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
