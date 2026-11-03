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
const CACHE = 'cashcar-v1095'; /* v1095 (2026-11-03, Sacha : « les photos de la boutique sont buggées, les voitures coupent ») les photos des cartes de la boutique s'affichent ENTIÈRES (plus à 118 % dans une case qui rogne) · v1094 (2026-11-03, Sacha : « AFRIQUE DU SUD dépasse du bouton ») le nom d'une plaque longue passe à la ligne dans sa tuile · v1093 (2026-11-03, Sacha : « recommence, fais un truc parfait […] tu reprends chaque élément ») L'ÉCRAN DE MORT REFAIT : deux familles seulement (ce qu'on LIT = panneaux plats à coins coupés, ce qu'on TOUCHE = touches inclinées), une grille par orientation, trois cartes MOTEUR / AURA / MISSIONS du même gabarit, nouveau graphe (PARTIE / MOY. / RECORD sur une même base, ligne du record), moteur dans sa propre scène (plus jamais sur le graphe). Avant : v1092 (2026-11-03, Léo : « Crypto City, ça s'appelle que Crypto City ») la map s'affiche CRYPTO CITY (plus CRYPTOVILLE), jour et nuit, sans traduction */
   grain bizarre sur les moteurs […] parfois le moteur il passe derrière le graphique […] refais tous les boutons qui soient cohérents entre eux,
   redimensionne-les, remets-les au bon endroit ») GARAGE/RÉGLAGES reprennent `.pbtn` telle quelle (comme HOME, REJOUER, tout le jeu) au lieu de
   leur bulle de verre à part ; le « grain » du moteur/de la créature (bords en escalier d'un modèle bas-poly relu sans anticrénelage) corrigé par
   suréchantillonnage (864 px au lieu de 480, RÉCENT) plutôt que MSAA (WebGLMultisampleRenderTarget testé : la relecture GPU→CPU lisait un tampon
   vide, sans resolve en Three r128 — annulé). + HUD DES FIGURES (v1089 de ce côté-ci, Sacha : « le badge RECORD en jaune pendant le vol, ça sert
   à rien, enlève-le ») plus de badge à côté du × de combo en plein vol ; SAVE.d.figRec reste tenu à jour, lu par la plaque MEILLEUR COMBO.
   Avant : v1089 (2026-11-03, Sacha : « il faut que ce demi-tour donuts donne un gros, une sorte de petit boost de vitesse, mais qui soit assez kiffant et qui fasse des flammes sur la route, les mêmes textures que pour le nitro ») LE RATTRAPAGE DU VERGLAS BOOSTE : au rattrapage réussi comme à l’ancien demi-tour pivoté (?verglas=0), la caisse repart avec un vrai coup de vitesse (jusqu’à 90 % du plafond au lieu de juste garder la glisse) et `nitroAllume` rejoue l’allumage du nitro — le même feu de pixels aux pots, qui traîne au sol derrière elle, la même onde et le même flash d’écran (zéro code de flamme en plus). Avant : v1088 (2026-11-03, Sacha : « le moteur il passe devant le graphique, il est toujours pas assez beau ») ÉCRAN DE
   MORT : la pièce (moteur/créature) n'était dimensionnée que par sa HAUTEUR (largeur libre) — sur un écran de mort étroit elle débordait sur la
   colonne voisine et mangeait le bord de la carte AURA ; `object-fit:contain` (jamais plus large OU plus haut que sa colonne) + colonnes 1fr/1fr
   (avant .8fr/1.2fr, la pièce qu'on vient de débloquer n'a plus à être la plus petite des deux) + halo et ombre renforcés pour qu'elle se détache
   mieux du noir. Avant : v1087 (2026-11-03, chasse aux bugs) DUNES : la pyramide flottait ou s'enfonçait au hasard de la carte — l'ancrage lisait le sol sur un cercle qui sortait de sa base carrée, maintenant sur sa vraie emprise tournée ; + TEMPÊTE DE SABLE branchée au tirage météo (biome et particules déjà bâtis, jamais reliés) ; GARAGE/RÉGLAGES : lueur sur son propre calque (texte redevenu blocky) ; moteur de l'écran de mort : résolution du rendu par palier. Avant : v1086 (2026-11-02, Léo : « le demi-tour : rien d'automatique, juste un signalement et un petit effet ; on tourne soi-même pour drifter et revenir sur la route ») : le verglas ne ramène plus le nez tout seul (garde-fou à 14 s). Avant : v1085 (2026-11-02, Léo : « le mauvais sens : la voiture ne tourne plus toute seule, elle garde l'angle d'arrivée, un effet de verglas qui permet de se rattraper en drift, mais qui fait tomber ceux qui arrivent trop brutalement ; stylé, sans trop handicaper ») : LE VERGLAS DU CONTRESENS (demi-tour.js, ?verglas=0 = l'ancien pivot auto) — panneau MAUVAIS SENS plus grand, chevrons du côté où braquer, jauge, bord de l'écran givré, RATTRAPÉ en or. Avant : v1084 (2026-11-02 nuit, Léo : « tu m'as enlevé tout le système que j'avais créé ») : la nappe de la boutique au menu seulement avant la toute première partie ; le lobby du niveau revient pour tous les autres. Avant : v1083 (2026-11-02 nuit, Léo : « frottement bizarre au bord de la route », « un son au 1.61 PRESENTS », « enlève le GAME ») : le frottement du SLIDE fabriqué en direct (plus de boucle MP3 qui saute), scintillement d'or sur PRESENTS, « 1.61 PRESENTS ». Avant : v1082 (2026-11-02, Léo : « la musique de l'intro commence trop tôt et se coupe ; elle ne se lance qu'en fondu quand le menu ciel a chargé ») : plus de départ pendant PRESENTS, une seule musique, au ciel ; un joueur neuf a au ciel la nappe de la boutique (comme la leçon), Pouce bleu après la leçon. Avant : v1081 (2026-11-02, Léo : « les chiffres du globe : un peu plus de matière ») : ombre portée + reflet métallique cuits dans chaque chiffre (aucun coût à l'image). Avant : v1080 (2026-11-02, Léo : « le chargement doré est nul et n'apparaît pas direct : un truc classique au milieu ») : anneau CSS dans le HTML, visible tout de suite, remplace la graine dorée. Avant : v1079 (2026-11-02, Léo : « globe plus complet : un tout petit peu de lueur blanche à l'intérieur, chiffres plus opaques et plus de forme, comme les dorés ») : lueur blanche au cœur, opacité des chiffres .18→.42, contour sombre + haut plus clair. */
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
