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
const CACHE = 'cashcar-v1147'; /* v1147 (2026-11-05 soir, Sacha : « c'est nul, j'ai fini en 10 secondes, vraiment on doit se perdre ») FORÊT : on se PERD — la route monte aussi (33 % des pièces, une pelote sur trois), donc la route d'en dessous est parfois DERRIÈRE (un piège : ~50 % des croisements, avant 15 %) ; un raccourci ne saute plus que ~23 % de la forêt (avant 40-80 %) ; 4-5 croisements par forêt (spirales et cols de cygne deux fois plus fréquents) ; durée ×1,35 → ×1,7 ; les sentiers de lucioles sont coupés (`?foretsentiers=1`). */ /* v1146 (2026-11-05, jury final, Opus) L'APP SANS PUB (seconde chance GRATUITE, pas de ×2 sous Capacitor), ACHAT en € masqué partout (`?achat=ancien`), la sauvegarde revient sur le web (`?demo=1` = compte neuf), LE DOGE → LE SHIBA, 3 s de rails au départ (`?rails=0`), la plaque après la 1re course, « TOUCHE » sous la boule, mission des météos corrigée (EN ORBITE), ×2 sans la prime de série, ailes ≤ 5 M, km100k = 10 000, verrou entre onglets, page-cadre de l'ordi inerte, sonde sans attente et halo à 4 étages sur téléphone ; app : iOS 16.4, son en silencieux, www/ allégé (47 Mo). Rapport : passation/RAPPORT-JURY-OPUS.md. */ /* v1145 (2026-11-05, Sacha : « dans l'écran de mort enlève le petit carré doré qui monte l'argent ») ÉCRAN DE MORT : les petits carrés dorés qui venaient se fondre dans le montant pendant le compte (m6Pieces) sont retirés ; l'éclat de pixels de l'arrivée reste. */ /* v1144 (2026-11-05, Sacha : « enlève les petits ×2 +3 à côté de la voiture » + « le texte au-dessus du moteur quand on monte de palier ») HUD ÉPURÉ : le « +N » flottant à côté de la caisse et le « ×N » de la frénésie ne s'écrivent plus ; la carte (et le badge) de montée de palier n'ont plus de texte, le moteur 3D seul. */ /* v1143 (2026-11-05, jury final, Sonnet) TEST_CAISSES=false, clés I18N manquantes, SEE ALL ITEMS/NEW/PRESENTS traduits, profil (barre collée, libellés), ICEBERG/DOGE ×10, POSTER légendaire, sacs du final spin ×10, resetGame complet, 4 mp3 et 13 fonctions mortes retirés. */ /* v1142 (2026-11-05, Sacha : « les nuages lisses ou pixelisés… règle ça » + « qu'on ne se rende plus compte quand ils sont à l'envers : la map doit être sans dessus dessous ») LES NUAGES SANS DESSUS DESSOUS : sur la map NUAGES (et l'orage) les gabarits sont symétriques haut/bas (plus de base plate, cubes petits aux deux bouts) et leur lumière ne distingue plus haut et bas ; `?sym=0` = avant. */ /* v1141 (2026-11-05, Sacha : « prends le meilleur écran de mission que t'avais fait, mets-le quand on meurt, la 1re fois et chaque jour la 1re fois, enlève-le de la mission ») L'ÉCRAN DES MISSIONS À LA MORT : le portail (mcVedette) s'ouvre à la 1re partie comptée du jour, juste avant l'écran de série (#mvW, aujourdhui.js) ; l'onglet MISSIONS n'a plus de vedette, toutes les missions repassent en liste (m2Vue.listeTab, ecran-revelation.js). */ /* v1140 (2026-11-05 soir, Sacha : « affine maintenant ») FORÊT, SENTIERS DE LUCIOLES vérifiés en jeu : pose sur la route d'arrivée à 2 m près, 8 fruits sur 8 pris en vol ; la pose se fait à moins de 14 m de l'axe (un tronc au bord de la route d'arrivée avait tué un saut), la fenêtre de départ va jusqu'à 2,6 km et la portée de détection suit la vitesse du palier. */ /* v1139 (2026-11-05, Léo : « un rendu plus mature : le menu ciel, la route, la salle du garage ; le code cousin pour tout essayer ») LE MENU CIEL moins éblouissant (reflets ×.7, exposition du menu ×.9 : `?menuhdr=1` `?menuexpo=1` = avant) ; LA PEINTURE : un dégradé par modèle (bas de caisse plus profond, ELDORADO renforcée ; `FIN_PATINE`) ; LA ROUTE sans joints de dalle, un mélange lisse + grain (`?joints=1` = avant) ; LA SALLE du garage : sol adouci et détaillé (huile, fissures, chevrons, pochoirs, clins d'œil ; `?salle=ancien` = avant) ; « cousin tout » ouvre aussi les caisses et peintures en €. */ /* v1138 (2026-11-05 soir, Sacha : « un peu trop vaste et boring la version que je viens de tester, adapte la taille des virages et des tout-droits au palier : plus il est haut, plus ça doit être large » · « mets-toi en game designer senior, il faut que ce soit une map fun ») FORÊT : l'échelle suit le palier (×1,15 au palier 0 → ×2,4 dès le palier ~27 ; la durée ×1 → ×1,5 ; les tout-droits des pièces à moitié au palier 0 : 6,3 km au lieu de 10,5, droites de 3-6 s) ; LES SENTIERS DE LUCIOLES : les meilleurs raccourcis portent un fil de fruits en l'air qui plonge jusqu'à la route d'en dessous, un fruit-pouvoir à la pose, un couloir sans arbres (`?sans=foretsentiers`). */ /* v1135 (2026-11-05, Sacha : « refais correctement le système de peinture ») LE NUANCIER v3 : 64 peintures en quatre raretés (17 · 26 · 15 · 6) — COMMUNES unies (1 €), RARES dégradés (1 €), ÉPIQUES motifs et livrées stickers (2 €), LÉGENDAIRES animées sur la carte graphique (3 €) : GALAXIE (on voit à travers), NÉON TOKYO, SAKURA.EXE, MAGMA, ABYSSES, RGB ; « ou gagne-la » : 36 peintures ont aussi un défi (sa jauge sur la carte), les autres s'achètent ; la boutique les range par rareté. */ /* v1134 (2026-11-05, Sacha : « des modules dans les canyons, presque incliné à 90 degrés, le long des falaises, comme si on roulait sur les murs — par moment, pas tout le temps ») LE CANYON SUR LES MURS : dans ~4 canyons sur 10, la pièce mur (un grand virage dont la dalle se couche à 86°, falaise à l'extérieur) ; le relief épouse la dalle (plan de roche à 2,5 m du dessous) ; la pente du canyon pousse toujours (TORD.pente), le vol et le bord ne suivent la dalle que couchée (murRoule) ; ?sans=canyonmurs = avant, dbgCanyonMurs() = le banc. */ /* v1133 (2026-11-05, Sacha : « beaucoup trop de gris et de noirs dans les peintures » — « les cacher ») LES SECRÈTES SE CACHENT : les 18 peintures secrètes pas encore gagnées (toutes la même pastille ardoise « ? ? ? ») ne figurent plus dans la boutique, la bande du garage ni le défilement ; elles apparaissent quand on les gagne. */ /* v1131 (2026-11-05, Sacha : « Pics de jade : de longues torsades douces, la route s'incline dans les virages comme sur un anneau de NASCAR » + « l'assiette, tu la supprimes du code jeu » : l'astuce) JADE : le dévers — la dalle se couche vers l'intérieur des virages (16° au plus, courbure moyennée sur ±150 m en deux passes), à plat au départ, sous la Porte et le Pont du ciel et à l'arrivée ; `?sans=jadebank` = la route plate d'avant. L'ASTUCE « en l'air : pouce en HAUT = monte… » (bit 2 de SAVE.d.ast, resté réservé) est supprimée, avec ses deux traductions. */ /* v1130 (2026-11-05, Léo : « la voiture de la honte est magnifique dans le garage, que les autres le soient autant ») LA MARBRURE DE TÔLE : la laque de toutes les caisses (sauf LA HONTE) n'a plus le même ton partout — marbrure propre, douce (±4,5 %), posée une fois à la construction (finMarbre, finition.js) ; `?marbre=0` = avant. */ /* v1129 (2026-11-05, Sacha : « petite révision de l'HUD ») le RECORD (barre jaune) et le nom du palier de flow (FLOW 1, FLOW 2) disparaissent ; la pastille du FIL (Big Air, miraculé, backflip…) passe en bas au centre, sous la voiture, en petit. */
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
