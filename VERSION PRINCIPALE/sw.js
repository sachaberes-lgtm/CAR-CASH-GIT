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
const CACHE = 'cashcar-v1157'; /* v1156 (2026-11-05, Sacha : « l'animation du début a des latences sur Vercel, rends les titres de début plus rapides ») L'INTRO PART SANS ATTENDRE load : DOM prêt + sa police seule (avant : toutes les images, polices et boucles du jeu, 2-3 s de noir de plus), sonde toutes les 60 ms, premier essai à 40 ms (avant 500), 120 ms d'attente audio (avant 300) ; `?depart=lent` = l'ancien départ. */ /* v1155 (2026-11-06, Sacha : « refonte de l'écran mission, l'espace est qu'à moitié occupé » puis « A plein cadre ») L'ÉCRAN MISSIONS PLEIN CADRE : le panneau va du titre à la barre du bas, les cartes se partagent la hauteur (texte 12 px, récompense 16 px, jauge 10 px, plafond 170 px) ; couché, les cartes en 2 × 2 sur toute la largeur, le palier suivant et les réussies en pied, RETOUR | JOUER sur toute la largeur (la 4e ligne ne passe plus sous la barre) ; le portail reste à la mort (retiré de l'onglet le 05/11). Maquettes : maquettes/missions/. */ /* v1154 (2026-11-05 soir, Sacha : « une session de finition de l'interface : chaque bouton, chaque son, chaque animation, chaque espacement ») FINITION DE L'INTERFACE : les trois icônes du haut du garage à 8 px d'écart régulier ; la carte RANG (surnom d'aura) retirée du profil (15 cartes, 5 rangées pleines) ; les noms des figures équipées sur deux lignes couché (« SALTO A… » ×2) ; l'enfoncement des tuiles à `translate` se joue ; « réduire les animations » coupe aussi l'écran de mort, la boutique et le garage, rideau en fondu ; sons de bouton dans la 1re moitié de la banque (plus muets au 1er lancement, à la prochaine publication) ; un seul son sur ×2 refusé. Audit : passation/FINITION.md. */ /* v1153 (2026-11-06, Sacha : « vérifie qu'il est bien intégré, centré et optimisé ») CHARGEMENT : l'Ouroboros se CENTRE comme la boule de l'intro en paysage (50 % de la hauteur au lieu de 46 % : il était 14 px trop haut sur un téléphone couché, mesuré 0 px d'écart maintenant à 375×812, 740×360 et 700×560) ; cadre rogné de 64 à 52 px (−34 % de pixels, bande de 4 992 px de large à 3 pixels d'écran au lieu de 18 432, sous la limite de 16 384 des textures GPU, couche de 18 Mo au lieu de 27) ; étincelles ramenées dans le cadre ; PNG recompressé (9,0 Ko, CSS 12,6 Ko). */ /* v1152 (2026-11-05, Sacha : « pas assez de virages, pas assez de trucs fun, rajoute des modules ») LES PROFONDEURS : la route à rythme (virages larges, un module propre à chaque salle : boyau rapide, lacets, corniche, géants, plongeon), la lave ne noie plus la route. `?sans=flow` = la route d'hier. */
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
