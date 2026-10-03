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
const CACHE = 'cashcar-v83'; // v82 (2026-10-03) : main de Sacha (le dragon de NITROOO) + musique de Léo (CIEL moderne, phrase du boost qui lit chaque morceau)
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
