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
const CACHE = 'cashcar-v1055'; /* v1055 (2026-11-01, Sacha : « augmente la taille et la puissance des booster sur la route ») : les plaques turbo grossissent (5,5×9 → 8×13 m, la fenêtre de prise suit) et poussent plus fort (+18 → +26 km/h de vitesse, +5 → +7 par pad du train, boost ×1,5 → ×1,9) — même règle pour les adversaires. */ /* v1054 (2026-11-01, Sacha : « enlève le texte touche une mission pour la suivre, on peut plus suivre de mission ; une mission achevée touchée se supprime automatiquement ») : l'écran MISSIONS n'affiche plus l'aide « touche une mission pour la suivre » et toucher une mission n'en fait plus une SUIVIE (suivre une mission ne sert plus à rien) ; toucher une mission déjà achevée (dans TERMINÉES) l'efface de la liste. */ /* v1053 (2026-11-01, Sacha : « dans le garage, les billets qui s'accumulent, essaye de rendre ça plus joli, mieux disposé ; il y en a qui sont buggés, il y en a qui volent ») : chaque étage d'un tas de billets repose maintenant sur l'étage du dessous (resserré vers le centre) au lieu d'être tiré au hasard indépendamment — plus de liasses flottant sans rien dessous, les tas lisent comme de vraies pyramides. */ /* v1052 (2026-11-01, Sacha : « enlève le texte touche une mission pour la suivre, on peut plus suivre de mission ; une mission achevée touchée se supprime automatiquement ») : l'écran MISSIONS n'affiche plus l'aide « touche une mission pour la suivre » et toucher une mission n'en fait plus une SUIVIE (suivre une mission ne sert plus à rien) ; toucher une mission déjà achevée (dans TERMINÉES) l'efface de la liste. */ /* v1051 (2026-11-01, Sacha : « le bouton nitro est un peu moche avec ce cercle autour, améliore-le et mets-le en mode flottant ») : le galet de verre derrière le bouton boost ne s'affiche plus que pour les icônes SVG (bouteille, chevrons, anneau) — la flamme pixel par défaut (bvF) reste flottante, sans rond ni halo. */ /* v1050 (2026-11-01, Sacha : « reprend la physique de l'eau des montagnes pour la lave, texture moins fluide ; plus de stalactites dans la grotte glacée ») : le lac de lave des Profondeurs reprend la houle de Jade (jMerH, une somme de sinus, 4× plus lente) — sa croûte se soulève et s'affaisse, se fige par plaques nettes (moins fluide, plus visqueuse) au lieu d'un dégradé lisse ; la grotte glacée (météo GLACE) a 80 % de concrétions de plus, plus longues, plus fines et surtout pendues (de vrais glaçons). */ /* v1049 (2026-11-01, Sacha : « redonne envie, peinture par peinture » — LAVE) : la peinture LAVE rougeoie vraiment (émission relevée) au lieu d'une tôle mate — « la coulée ne refroidit jamais » tenait sa promesse. */ /* v1048 (2026-10-31, Sacha : « l'espace est trop bleu, les versions d'hier étaient plus sombres et plus réalistes, en mode Gravity ou Soul » + « final spin : CONTINUER dépasse du bouton, le levier passe devant le final spin, augmente un peu la seconde chance ») LE VIDE DE L'ORBITE (orbVide) redevient presque noir : zénith quasi noir au lieu d'indigo-violet, le voile de la Terre à l'horizon beaucoup plus discret (bleu électrique → lueur grise faible) ; bouton CONTINUER moins espacé (+plus petit sans jeton) ; l'enseigne reste au-dessus du levier ; SECONDE CHANCE GRATUITE ,15 → ,19. */ /* v1046 (2026-11-01, Léo : « retouche le geste et l'effet drift pour bien faire comprendre comment le joystick agit sur la voiture ») : le stick dit DRIFT au sol (mot, ligne du geste, couleur du palier, anneau de charge, onde du turbo), un virage sec ne chasse plus que de ~11°, le drift entre d'un coup de reins et la caméra suit la trajectoire, vibrations graduées ; ?drift=ancien rend l'avant */ /* v1045 (2026-11-01, Léo : « rajoute la royale violet en commune ») : VIOLET ROYAL passe de rare à commune (elle se gagne toujours par ses 50 raisins) */ /* v1044 (2026-11-01, Léo : « oui, partout ») : la flamme remplace tous les éclairs de l'interface (l'éclair d'avant reste en `foudre` pour la FOUDRE DIVINE, ?boost=eclair le rend partout) */ /* v1043 (2026-11-01, Léo : « changer l'icône en haut aussi ») : la flamme pixel devient le bouton boost par défaut (?boost=eclair = l'ancien), et remplace l'éclair de la barre de boost et des gains qui volent */ /* v1041 (2026-11-01, Léo : « crée de nouvelles peintures et règle celles qui existent ») : MOUSSE (épique, mélangée à la couleur de la caisse, touffes en relief), OR MASSIF et MENTHE GLACÉE retirés, CHROME MIROIR épique, unies classiques en communes, huit pâles rares visibles et verrouillées, pâles rangées à la fin ; page peintures-test.html */ /* v1040 (2026-11-01, Léo : « flamme plus stylée qui s'enflamme de plus en plus quand on maintient, même style que l'éclair ») : ?boost=flamme, flamme en pixels qui monte en chaleur */ /* v1037 (2026-11-01, Léo : « change l'éclair par un truc stylé, genre une bouteille nitro, on peut tester plusieurs trucs ») : ?boost=bouteille|chevrons|flamme|anneau, icônes en verre qui lisent la réserve ; l'éclair reste par défaut */ /* v1035 (2026-10-31, Léo : « règle tous les bugs visibles… l'image ne doit plus couper quand je joue sur téléphone ») : tour complet au banc iPhone ×4 (images > 100 ms 148 → 61) — la grotte se prépare dès la map d'avant, le REJOUER finit son départ sous le volet, le ciel des reflets préparé sert même si le soleil a bougé (orbite) et les dunes le font calculer à côté, la réverbe de la musique gardée, la boîte des moteurs calculée au menu, le logo du départ sans mise en page forcée, la ville et les montagnes de jade qui tombent calculées plus vite (mêmes résultats au bit près) */ /* v1034 (2026-10-31, Léo : « plus transparent moderne, refonte léger premium, pareil pour le bouton boost ») : slide et boost en verre léger */ /* v1033 (2026-10-31, Léo : « moins bleu ») : le slide-volant en verre passe du cyan au blanc perlé */ /* v1032 (2026-10-31, Léo : « les récompenses voiture (ROUGE-GORGE) buggées, ça fait une loop du garage à la mission ») : une mission réussie se RÉCUPÈRE au garage et à la boutique (le bouton dit RÉCUPÈRE), et dans MISSIONS la photo de la caisse d'une ligne prête récupère au lieu de renvoyer au garage */ /* v1031 (2026-10-31, Léo : « le slide : un cercle intégré qui laisse comprendre qu'on peut aller en haut, plus luisant et transparent au doigt ») : bille de verre + arc ouvert qui s'allume vers le haut */ /* v1030 (2026-10-31, Léo : « continue » sur le lag mobile) : la grotte d'avance se bâtit en tranches plus fines (creusements et décors avec rendez-vous, même grotte au bit près) ; le solde trouve sa taille de police en 2-3 mesures au lieu de 10 (même taille) */ /* v1029 (2026-10-31, Léo : « le jeu lag encore un peu sur mobile, des cuts audio et visuels ») : les 30 moteurs fabriqués par la chauffe du menu sont GARDÉS (plus de fabrication de 20-75 ms à chaque montée de palier en course) ; les morceaux écrits à la main (AURA · 30, RUBIS, ASPHALTE) prévoient 1 s comme le générateur (plus de notes en retard après un gel) */ /* v1028 (2026-10-31, Léo : « le slide volant déclenché par le doigt même à droite, tant que c'est pas autour du boost ») : le volant prend tout l'écran hors zone NITRO */ /* v1027 (2026-10-31, Sacha : « le bouton JOUER de l'accueil un peu plus vers la gauche, meilleure proportion de diagonale ») l'escalier JOUER passe de +24px à +12px, au même pas que le logo (−12px). */ /* v1026 (2026-10-31, Sacha : « le Phénix doit être légendaire, pas mythique ; les buses SANS AILES doivent ressembler à la vraie voiture de Elon Musk ») PHÉNIX → rareté légendaire ; les buses à air (AILES_POP.air) passent de simples tubes à de vraies tuyères évasées, collier moteur mat à la base, titane brossé. */ /* v1025 (2026-10-30, Léo : « cœurs plus roses, tailles plus aléatoires mais bornées, enlève tous les freezes du menu ciel ») : cœurs rose-fuchsia (chacun sa nuance), 7 à 34 cm ; la gerbe ne sort que des fruits, fleurs et vins déjà envoyés à la carte graphique */
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
