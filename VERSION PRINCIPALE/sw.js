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
const CACHE = 'cashcar-v667'; // v667 (2026-10-18 soir, Sacha : « enlève la trainé minth » · « supprime block rain » · « la trainé rainbow doit etre incluse avec le pack nian cat ») : MENTHE et PLUIE DE BLOCS retirées, remboursées (HAB_RETIRES) ; l'ARC-EN-CIEL vient avec le pack du chat
// const CACHE = 'cashcar-v664'; // v664 (2026-10-19, Léo : « chaque figure qui fait un saut en l'air laisse l'opportunité de décoller avec le joystick qui oriente le nez vers le haut ») : LE DÉCOLLAGE AU MANCHE — pendant le bond d'une figure sur la route, le pouce poussé « nez en haut » fait décoller la caisse, qui monte comme un avion
// const CACHE = 'cashcar-v662'; // v662 (2026-10-18, Léo : « optimisation des performances ») : plus aucun shader compilé en pleine course au CANYON ni à la map qui suit le GLACIER (PISTE_GARDE, chauffe du canyon) — image identique
// const CACHE = 'cashcar-v661'; // v661 (2026-10-18 soir, Sacha : « la vette ne doit pas faire de lumière dans le shop et doit ouvrir ses phare que quand tu boost ») : LA VETTE lève ses escamotables à la nitro seulement ; fermés, ni halo, ni nappe, ni lumière sur la route (CAR_PHK)
// const CACHE = 'cashcar-v658'; // v658 (2026-10-18 soir, Sacha : « améliore toutes les traînées en cherchant globalement à les améliorer ») : de JOUR un voile d'encre sous la lumière des traînées (filés, code, éclairs, rubans lisibles sur le ciel et la neige), le feu arrière prend la couleur de sa traînée au nitro, la couleur ne vire plus au mélange avec le rouge des feux (MENTHE ne devient plus jaune)
// const CACHE = 'cashcar-v657'; // v657 (2026-10-18 soir, Sacha : « lance une grosse session de debuging ») : la machine à sous rafraîchit le COMPTE de l'écran de fin, le solde tronqué partout, le reflet de la légendaire, la plaque et le clavier iOS, pas de combo de bump pendant l'auto-école
// const CACHE = 'cashcar-v655'; // v655 (2026-10-18 soir, Sacha : « tout les item exotique doivent etre passer en rare ») : plus aucun objet EXOTIQUE — ailes, traînées, peintures, caisses à défi et figures passent RARES ; la famille EXOTIQUES quitte la barre du garage · « enlève la groupe B » / « la gold bar » : LA GROUPE B et LE LINGOT sont RETIRÉS (voir le journal)
// const CACHE = 'cashcar-v654'; // v654 (2026-10-18, Léo : « enlève la Classe G ») : la place 88 reste réservée mais libre ; rien ne change à l'écran
// const CACHE = 'cashcar-v653'; // v653 (2026-10-18) : deux places RÉSERVÉES et cachées dans la gamme — 87 la Pikes Peak (JAPONAISES), 88 la Classe G (BOÎTES) ; rien ne change à l'écran
// const CACHE = 'cashcar-v652'; // v652 (2026-10-18, Léo) : LA FIDÈLE (la Corolla berline 2019, plus fidèle, le coin avant « identique ») entre dans le jeu, COMMUNE ; LA POUPÉE retirée à nouveau (« on l'enlève »)
// const CACHE = 'cashcar-v651'; // v651 (2026-10-18, Léo) : LA ZED passe ÉPIQUE, LA QUEUE DE CANARD à 550 000 $ (chaque prix dans sa famille)
// const CACHE = 'cashcar-v650'; // v650 (2026-10-18, Léo : « mets avec les communes le scarabée et le camper, organise bien la rareté ») : la BOUTIQUE range les voitures PAR RARETÉ, un intertitre par famille (les caisses des missions dans la leur, les secrètes à la fin)
// const CACHE = 'cashcar-v649'; // v649 (2026-10-18 soir, Sacha : « enfait enlève paris du mode classique ») : PARIS ressort du tirage du mode classique (et de la chauffe au menu) ; les missions « chaque map » ne comptent que les maps tirées.
// const CACHE = 'cashcar-v648'; // v648 (2026-10-18, Léo : « mets-la en Epic ») : LA QUEUE DE CANARD passe ÉPIQUE (sa refonte au plan suit)
// const CACHE = 'cashcar-v647'; // v647 (2026-10-18, Léo : « enlève la daytona du main ») : LA DAYTONA RETIRÉE du jeu (retire:1, remboursée à qui l'avait achetée)
// const CACHE = 'cashcar-v646'; // v646 (2026-10-18 soir, Sacha : « la disposition des boutons sur cet écran est catastrophique : boutique doit être plus gros et le trophée doit être en haut à droite ») : LE GARAGE — le trophée en haut à droite, en miroir du compte ; la BOUTIQUE deux fois plus large en haut de la grappe (maquette 1 LARGE, choisie sur trois). Voir <style id="garShop">.
// const CACHE = 'cashcar-v644'; // v644 (2026-10-18, Léo) : LA DURÉE DES MAPS — au JOUER une map se compte en secondes, 45 s au départ, 20 s à fond (?duree=ancien = avant)
// const CACHE = 'cashcar-v643'; // v643 (2026-10-18, Sacha) : au boost, les bords de la route clignotent avec le JEU DE LUMIÈRE de la traînée — les nuances de son feu, dans les mêmes parts (voir le journal)
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
