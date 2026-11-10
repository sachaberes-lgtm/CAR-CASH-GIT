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
const CACHE = 'cashcar-v1416'; /* v1416 (2026-11-10, Sacha : « pas de latence peu importe l'ordi, ça doit s'adapter à chaque ordi ») le RÉGIME DU POSTE : l'ordinateur lent passe seul en ALLÉGÉ / LÉGER / MINIMUM et l'échelle de qualité joue en course ; un PC qui tient 60 i/s ne change pas (code/rendu/soleil-planete.js, code/moteur/poste-juge.js). */ /* v1415 (2026-11-10, Sacha : « cobra ultra on l'enlève ») COBRA ULTRA sort du tirage de la course (favoris.json : 4 musiques + FIRE PRIME · TROMPETTE). v1414 (2026-11-10, Léo : « des traits blancs qui se superposent à la route et ne sont pas censés être là ») les anciens traits d'air posés dans le monde (au sol et en vol) s'effacent : ils se couchaient en travers du bitume ; les filets de l'écran disent la vitesse ; ?traits=0 = avant (code/moteur/boucle-3-physique.js). v1413 (2026-11-10, Sacha : « nitro bien mécanique, flamme, variation selon l'appui ; il faut que plein d'actions soient prises en compte ») LE NITRO PHYSIQUE et les DÉTAILS DE CONDUITE en jeu, derrière `?nitro=physique` (sans le drapeau rien n'est chargé) : coups de flamme cylindre par cylindre calés sur la note du moteur, réservoir qui s'entend, coup bref, double-tap, vol, pose, drift, rapports ; aspiration, chant d'admission, roues libres, clonc de pose, slalom (code/son/nitro-physique.js, assets/audio/moteur-vivant/, banc outils/banc-son/nitro-physique.cjs). v1411 (2026-11-10, Sacha : « il faut qu'on puisse le déplacer un peu plus librement, et une animation d'explosion légère lors du double tap ») la boule de feu NITRO glisse de 58 px vers l'intérieur de l'écran (34 avant, bornée aux bords) et répond au double-tap : gonflement, anneau de feu, couronne d'étincelles (nxfBoum, code/interface/boost-icones.js). v1410 (2026-11-10, Sacha : « retravaille le bouton nitro : plus gros, boule de feu à l'envers, le pouce seulement suggéré, qu'on déplace un peu comme un joystick, la flamme part dans l'autre sens ») la BOULE DE FEU du bouton NITRO : cœur de braises, feu qui coule, queue qui fouette, naissance au départ, éclat à l'allumage ; dessin en tables, calée sur la marge du HUD (code/interface/boost-icones.js, css/ux-nitro-aura.css). v1408 (2026-11-10) portails : la fenêtre des deux sens, 42 cartes postales refaites */ /* (ancienne ligne :) */ /* v1407 (2026-11-10, Sacha : « retravaille la génération des pièces sur toutes les maps : des séries plus courtes et plus variées, un gain équilibré avec la boutique ») les séries de pièces tiennent en 160 m au plus (c'était 330 m, 35 à 46 pièces), la 2 € paie le double de la 1 €. v1406 v1404 (2026-11-10, Sacha : « retravaille l'animation quand on ramasse des pièces, il faut qu'elle aille dans la voiture, surtout avec l'aimant ») la pièce ramassée devient une PIÈCE VOLANTE qui finit sa course DANS la caisse (repère de la caisse, tourbillon sous l'aimant, étincelle à l'arrivée) ; l'argent ne change pas ; ?pvol=0 = avant · v1403 (2026-11-10, Sacha : « les maps grotte ont plein de petits bugs de texture et de génération : des triangles très visibles sur l'eau et la lave, des stalactites en végétation ») la ligne d'eau de la lave et de l'eau se décide au fragment (plus de dents de scie), chaque décor dans sa salle, un ton par facette (plus de carrés sur la roche). v1399 (2026-11-10, debug iOS, Léo : « oui, blinde ») la 3D indisponible au démarrage (juste après un contexte perdu) : 3 rechargements seuls avant l'écran « a calé ». v1396 (2026-11-10, Léo : « néon noir enlève des favoris ») NÉON NOIR sort du tirage de la course (favoris.json : 6 musiques). v1395 (debug iOS) écran de fin : le COMPTE tombe juste (plus de Math.round sur le compteur). v1392 (2026-11-09, Léo : « la maj sur mon tel, plus aucun fichier inutile, la musique est ce qui prend le plus de place ») la copie publiée ET l'app ne portent plus que les fichiers des 7 musiques du tirage (favoris.json) : musique 109 → 8 Mo (outils/publie-audio.cjs, retraits-publies.cjs, vrais-observes.json). v1391 v1390 (2026-11-09, Léo : « push sur le main, seulement mes musiques favorites dans le jeu ») le tirage de la musique de course = favoris.json (les ★ de la page des musiques) + FIRE PRIME · TROMPETTE ; MIRAGE, FIRE PRIME et RUBIS ULTRA retouchés (assets/audio/music/direct/). v1389 (2026-11-09, Sacha : « en vertical sur l'écran d'accueil, JOUER au centre ») en portrait le bouton JOUER n'avance plus de 12 px : pile au milieu comme le logo (code/css/boutons-flottants.css). v1388 (2026-11-09, Sacha : « supprime complètement le slide ») la figure SLIDE du frottement au bord de la route n'existe plus : ni étincelles, ni étiquette, ni aura, ni son ; seul le coup d'épaule des parois reste (code/maps/murs-parois.js). */
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
