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
const CACHE = 'cashcar-v700'; // v700 (2026-10-19, Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») : LE CANYON ET LES DUNES AU HASARD — l'axe, les coudes, les pièces et leur ordre, le caractère des liaisons tirés ; les Mitaines s'écartent de la route (?sans=canyonhasard / ?sans=duneshasard = avant)
// const CACHE = 'cashcar-v698'; // v698 (2026-10-19, Léo : « oui, mets le bras argent de la boutique dans le jeu ») : boutique › FIGURES, les deux bras posent la voiture, un bras robot argent fait la figure ; gestes plus fluides
// const CACHE = 'cashcar-v697'; // v697 (2026-10-19, Léo : « oui, mets le bras robot dans le jeu ») : LE BRAS DES FIGURES — inventaire › FIGURES, un bras robot fait la figure sans traverser la caisse
// const CACHE = 'cashcar-v696'; // v696 (2026-10-19, Léo) : LA VITESSE DE DÉPART — six crans au garage, l'étal du moteur soulevé, l'affiche des records à droite (voir le journal)
// const CACHE = 'cashcar-v695'; // v695 (2026-10-19, Léo : « oui, mets le HOT ROD v3.1 dans le jeu ») : LE HOT ROD refait sur sa photo du coupé 32 rouge — structure en poly (chaque pièce posée), V8 Hemi en mini-cubes, écope en chrome bombé à la gueule ouverte, cabine de coupé 32 ronde
// const CACHE = 'cashcar-v694'; // v694 (2026-10-19, Sacha au quiz : « ×2 sur le gain », « pub maison de 5 s », « vraies pubs seulement ») : LE ×2 DU GAIN contre une pub à l'écran de fin, la prise AdMob de l'app posée éteinte, L'ÉTERNELLE compte les vraies pubs
// const CACHE = 'cashcar-v691'; // v691 (2026-10-19, Sacha : « rends les 10 missions cachées avec une récompense en argent à la place de la caisse absente ») : les dix missions dont la récompense manquait au garage reviennent, payées en argent (5 000 → 500 000 $)
// const CACHE = 'cashcar-v690'; // v690 (2026-10-19, Sacha : « le tunel d'arriver pour la map canyon est moche ») : LE TUNNEL DE GRÈS (?sans=tunnelcanyon = avant)
// const CACHE = 'cashcar-v688'; // v688 (2026-10-19, Sacha : « dans le bouton mission il y a un truc streak 3 days gift ready, enlève ça » · « il y a des missions en vert avec marqué coming to the garage soon — ça aussi enlève ») : le cadeau et sa ligne en tête de MISSIONS éteints (?cadeau=1) ; une mission dont la récompense n'est pas au garage ne se montre plus (?sans=missionsvides)
// const CACHE = 'cashcar-v687'; // v687 (2026-10-19, Sacha : « la police que tu as faite pour les figures légendaires est un peu illisible ») : les figures LÉGENDAIRES s'écrivent en minuscules gothiques à capitale initiale — « Salto Cosmique », « Rodeo » (fhTitre)
// const CACHE = 'cashcar-v686'; // v686 (2026-10-19, Sacha : « la map grotte doit etre plus longue et la grotte beaucoup plus vaste ») : LA GROTTE VASTE — LES PROFONDEURS 1,7 × plus longues, des salles ~2,5 × plus grandes, la brume et l'air des salles à l'échelle, les cartes postales du portail retirées (voir le journal)
// const CACHE = 'cashcar-v685'; // v685 (2026-10-19, Sacha : « je meurs sans raison sur la route de glace dans la map montagne ») : au GLACIER les pics de la piste et les tremplins étaient invisibles (une déclaration avalée par un commentaire) — redessinés ; le volant en l'air ne fait plus flotter la caisse ; 500 m libres après chaque tremplin (voir le journal)
// const CACHE = 'cashcar-v684'; // v684 (2026-10-19, Sacha : « je veux qu'on décolle sur les vagues des dunes même sans nitro, de crête en crête ») : LES DUNES D'OR — la crête de chaque vague est une LÈVRE qui lance la caisse sur la face d'avalanche (voir le journal)
// const CACHE = 'cashcar-v683'; // v683 (2026-10-19, Léo : « oui, la FÉLINE peut partir sur le main » ; « applique la correction des jantes à toutes les voitures ») : LA FÉLINE au bas de caisse de la Type E (arches serrées, lames chromées, poupe, jantes) ; les jantes de L'AIGLE DE FEU, du MASTODONTE et du HOT ROD
// const CACHE = 'cashcar-v682'; // v682 (2026-10-19, Léo : « mets tout ce qui est à valider dans le jeu, et applique la correction des jantes à toutes les voitures ») : L'AFFINEMENT COMPLET — la fente C partout, les formes, les coins en style poly sur ~45 caisses, LA FÉLINE aux ailes séparées, et les VRAIES JANTES pour toutes (ROUES_VRAIES ; ?roues=ancien)
// const CACHE = 'cashcar-v681'; // v681 (2026-10-19, correctif) : le glacier retrouve ses tremplins, ses pics et sa météo — `let BK_BEC_TEX` n'est plus avalée par un « // »
// const CACHE = 'cashcar-v680'; // v680 (2026-10-19, Léo : « oui ») : LE CAÏD en HUMMER EV SUV ; l'affinement, lot 1 de RONDES (LA PUCE ronde, LA FÉLINE : phares et roues à rayons, LA QUEUE DE CANARD sans lames) et de JAPONAISES (LA LAME, LA FIDÈLE, LA BÊTE, LA CERISE : plus de damier, rétros retaillés)
// const CACHE = 'cashcar-v679'; // v679 (2026-10-19, l'affinement) : les BUGS des voitures (l'éventail de LA GRANDE ANGLAISE, la tache de POSTER 84, la barre de LA DOLORÈS, le damier de L'AIGLE DE FEU, l'écope rose du CHARGEUR) + LA FENTE C (Léo) sur les japonaises : les joints de tôle sans trait noir
// const CACHE = 'cashcar-v678'; // v678 (2026-10-19, session PERF, le pré-bâti de Léo) : LE DÉPART D'AVANCE — la 1re piste de la partie se bâtit au menu et à l'écran de fin, le JOUER et le REJOUER la prennent (image identique ; ?prebati=0 = avant)
// const CACHE = 'cashcar-v677'; // v677 (2026-10-19, Sacha : « vue plus haute qui plonge ») : LA CAMÉRA DU GLACIER, plus haute (le dosage « 1 » choisi sur planche)
// const CACHE = 'cashcar-v675'; // v675 (2026-10-19, Sacha : « enlève le truc qui dit : cloud car catch je sais pas quoi dans la map nuage, j'en veux pas ») : la chasse de la CAISSE-NUAGE (« ACCROCHE SON SILLAGE ») ne surgit plus dans la mer de nuages — éteinte par défaut, ?evt=1 la rallume (voir le journal)
// const CACHE = 'cashcar-v673'; // v673 (2026-10-19, Sacha : « pour la boutique des tricks fais des mini animations au ralenti pour voir la figure plutôt que les images stop motion ») : chaque carte FIGURES joue un petit FILM au ralenti de la figure (la caisse équipée, 32 images, son ombre) au lieu de la photo-séquence figée
// const CACHE = 'cashcar-v670'; // v670 (2026-10-18 soir, Sacha : « the grid doit être epic » · « divine ligthing doit etre legendaire ») : la traînée LA GRILLE passe ÉPIQUE, à 200 000 $ (le prix dans sa famille) ; FOUDRE DIVINE passe LÉGENDAIRE
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
