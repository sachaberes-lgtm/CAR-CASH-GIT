/* POUCE BLEU EN COURSE — assets/audio/pouce-bleu-jeu.js (2026-10-15, pôle SON ; Léo, choix cochés : « à chaque PLAY, un morceau de Pouce bleu tiré au
   hasard joue toute la course, en suivant le moteur » · « une intro par morceau, qui part de la musique du ciel / garage et entre dans le morceau »).
   · LA LISTE = Pouce bleu tel que Léo l'a rangé dans la bibliothèque (musique-moteur.json : les musiques du générateur qu'il a aimées et pas retirées,
     les morceaux qu'il y a glissés, AURA · 30 PALIERS rangé d'office) — la même règle que bibliotheque.html (dessine / dessineBleus) ; EN_ATTENTE :
     ceux qui n'entreraient pas encore au tirage (vide aujourd'hui).
   · LE TIRAGE : au hasard, sans doublon d'une course à l'autre tant qu'il en reste (localStorage `pbjVus`) ; `?pouce=<n° ou id>` en impose un (banc).
   · TROIS LECTEURS, comme la bibliothèque : le GÉNÉRATEUR (sa version, son n°, ses goûts du moment, sa retouche `direct` de retouches-bleu.js),
     les PALIERS FIGÉS (PalLecteur de musique-paliers.js, chargés à la demande : le palier joué et ses voisins), la PAGE EN DIRECT (AURA · 30, dans
     une iframe cachée, avec le contexte du jeu PRÊTÉ). Le moteur du jeu (1 → 30) les pilote : `moteur(m)`.
   · L'INTRO : au JOUER (le piqué depuis le garage ou le ciel), le morceau démarre au moteur 1 derrière un filtre fermé et monte — il entre sur SON
     tempo pendant que le lobby s'efface (DEPMUS), sur 2 mesures (bornées à 2-4 s) ; à la course, le filtre est ouvert. Plus de coupure brute.
   · LA SORTIE : filtre de l'intro → niveau (le curseur MUSIQUE, le souffle du mouvement, l'annonceur — calculés par musicTick) → le BUS DES BASSES
     (musique-bus.js : le réglage du morceau, le creux de course, le recul sous les signaux) → le limiteur commun du jeu. */
(function (W) {
  'use strict';
  const D = 'assets/audio/music/';
  const PERSO = { 'bleu-1540': { tout: D + 'direct/cavale-ultra-course.html' }, 'bleu-8338': { tout: D + 'direct/rubis-ultra.html' }, 'bleu-4830': { tout: D + 'direct/flamme-de-tonnerre.html' }, 'bleu-9664': { tout: D + 'direct/mirage.html' }, 'pal-asphalte': { tout: D + 'direct/asphalte-emeraude.html', ancien: D + 'direct/asphalte-emeraude-avant.html' }, 'pal-nuit-de-velours': { tout: D + 'direct/nuit-de-velours.html' }, 'bleu-6104': { tout: D + 'direct/tonnerre-deluxe.html' }, 'pal-neon-noir': { tout: D + 'direct/neon-noir.html' }, 'bleu-8154': { tout: D + 'direct/fire-prime.html' }, 'bleu-7299': { tout: D + 'direct/enseigne-de-jade.html' }, 'bleu-9551': { tout: D + 'direct/nenuphars-velours.html' }, 'bleu-6562': { tout: D + 'direct/pluie-d-argent.html' }, 'bleu-2221': { tout: D + 'direct/cobra-ultra.html' }, 'bleu-3379': { tout: D + 'direct/sauver-maman.html' }, 'pal-rubis-neon': { tout: D + 'direct/rubis-de-neon.html', ancien: D + 'direct/rubis-de-neon-avant.html' }, 'pal-aura-30': { tout: D + 'direct/aura-30.html', ancien: D + 'direct/aura-30-avant.html' }, 'bleu-1275': { tout: D + 'direct/feu-de-luxe.html' } };   // les morceaux refaits (voir PB.charge)
  const EN_ATTENTE = {};   // (15/10 soir) MIRAGE ULTRA n'y est plus : Léo l'a laissé à la corbeille (sa retouche d'entrée jetée) — le tirage suit Pouce bleu, rien de plus
  const HTML = { 'pal-aura-30': ['AURA · 30 PALIERS', 'direct/aura-30.html'], 'pal-rubis-neon': ['RUBIS DE NÉON', 'direct/rubis-de-neon.html'], 'pal-asphalte': ['ASPHALTE D’ÉMERAUDE', 'direct/asphalte-emeraude.html'] };   // (16/10) les morceaux écrits à la main, en page
  const DEFAUT = Object.keys(HTML);   // rangés d'office dans Pouce bleu par la bibliothèque (sec 'bleu')
  const GEN_VERSIONS = [['2026-10-14T00:16:50', 'v3-1'], ['2026-10-14T01:01:05', 'v3-3'], ['2026-10-14T01:46:19', 'v3-4'], ['2026-10-14T03:05:00', 'v3-7']];   // = bibliotheque.html
  const versionDe = e => { if (e.v) return e.v; const t = String(e.date || ''); for (const [l, v] of GEN_VERSIONS) if (t < l) return v; return 'v3-9'; };
  const url = f => new URL(f, location.href).href;
  const script = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  /* (15/10 soir ; Léo : « Sacha entendait mais n'entend plus la musique ») LE SERVEUR DE JOUER.bat (`python -m http.server` sous Windows) sert les
     .js en text/plain quand le registre le dit : import() les refuse (« Failed to fetch dynamically imported module ») et la course restait MUETTE.
     Repli : le texte du module, relu et lancé depuis un Blob (les modules du générateur n'importent rien eux-mêmes ; import.meta.url y redevient
     leur vraie adresse). Banc : un serveur
     qui répond text/plain → le morceau du générateur part. */
  const importe = async u => { try { return await import(u); } catch (e) {
    const r = await fetch(u); if (!r.ok) throw e;
    const b = URL.createObjectURL(new Blob([(await r.text()).split('import.meta.url').join(JSON.stringify(u))], { type: 'text/javascript' }));   // (son adresse reste la vraie : ses sons « vrais/ » à côté)
    try { return await import(b); } finally { URL.revokeObjectURL(b); } } };
  /* (15/10 soir ; Léo : « parfois ça bug un tout petit peu — il faut que le jeu soit complètement solide sur la musique ») L'HORLOGE DU GÉNÉRATEUR
     PRÉVOIT 1 s EN COURSE. Le générateur pose ses notes 0,35 s à l'avance, réveillé toutes les 50 ms par un minuteur de la page : quand la page gèle
     plus longtemps, il SAUTE les temps manqués (un trou dans le groove). Mesuré en course : 546 ms au portail (Chrome, processeur bridé ×4 ≈ un
     iPhone), jusqu'à 390 ms dans WebKit sur le Mac (départ, portails). Le jeu le charge donc avec 1 s d'avance : le même texte, cette seule
     constante changée (la bibliothèque garde le sien). Un changement de moteur s'entend au plus ~0,65 s plus tard (il tombe déjà sur la mesure
     suivante). Le texte introuvable ou l'import refusé → le module d'origine (rien ne casse). `?avance=.35` = l'horloge d'avant (A/B) ; dbgPouce().avance. */
  const AVANCE = +((/[?&]avance=([\d.]+)/.exec(location.search) || [])[1]) || 1, AV_TXT = 'while (nextTime < now + .35)', MODS = {};
  const MONTEE_ANCIEN = /[?&]montee=ancien\b/.test(location.search);   // (2026-10-20 soir) voir LA MONTÉE « GRANDE » plus bas
  const importeAvance = u => { const K = u + '#' + (W.RYTHMIQUE ? W.RYTHMIQUE.cle() : 'o'); return MODS[K] || (MODS[K] = (async () => { try {
      const r = await fetch(u); if (!r.ok) throw new Error(u);
      const s = await r.text(); if (s.indexOf(AV_TXT) < 0) throw new Error('horloge introuvable');
      /* (2026-10-20 soir, Léo : « quand je booste, ça apparaît, ça évolue, puis ça devient une sorte de TROMPETTE horrible qui fait bugger la musique :
         elle s'arrête, puis reprend une ou deux secondes après, et dès que je rappuie sur le boost ça recommence ») LA MONTÉE « GRANDE » DU GÉNÉRATEUR
         EN COURSE. Le jeu ne lui passe que le MOTEUR (setTier) ; un boost tenu fait monter le moteur de plusieurs paliers d'un coup, et chaque
         grand élément qui entre (grosse caisse, mélodie…) appelle une MONTÉE d'une mesure : un RISER (une fois sur deux « en ton » : trois scies
         110 → 440 Hz dans un passe-bas résonant 500 → 6 000 Hz, Q 3, jusqu'à 0,6 de gain — la sirène-trompette qui « apparaît, évolue »), des
         roulements, et une fois sur trois le TROU (la musique coupée à 8 % juste avant l'arrivée), puis la cymbale et l'impact : la musique
         « bugge » et repart. Sacha, qui lâche le boost plus tôt et tire d'autres morceaux, n'y tombait pas. EN COURSE SEULEMENT (la bibliothèque
         charge le générateur elle-même, intact) : le riser est toujours le SOUFFLE (la cymbale à l'envers, jamais la sirène en ton), la montée
         grande ne fait plus de trou, et le trou ne sort plus du tirage des petites transitions. Les versions figées ne sont pas réécrites sur
         le disque : c'est le même texte, retouché au chargement, comme l'horloge (un texte absent d'une version = rien à faire).
         `?montee=ancien` = la montée d'avant (A/B) ; dbgPouce().montee. */
      let s2 = s.split(AV_TXT).join('while (nextTime < now + ' + AVANCE + ')');
      if (!MONTEE_ANCIEN) { s2 = s2.split("riser: tpw(['souffle', 'ton'], W.riser)").join("riser: 'souffle'")
        .split("rp(['montee', 'trou', 'filtre']").join("rp(['montee', 'filtre']")
        .split("const W9 = Object.assign({}, M.C.trans), a = id =>").join("const W9 = Object.assign({}, M.C.trans, { trou: 0 }), a = id =>");
        /* (2026-10-21, Léo : « les builds filtre et dub, ça a l'air convaincant — tente ») LES DEUX AUTRES MONTÉES QUI ÉTOUFFENT. 'filtre' ferme le passe-bas
           à 420 Hz pendant UNE MESURE ENTIÈRE (~2 s), coupe les éléments, puis tout se rouvre sur le 1er temps ; 'dub' (le drop de la wob/du growl) garde
           le TROU à 8 % et balaie un filtre de 400 à 14 000 Hz. Au boost, plusieurs paliers s'enchaînent : la musique s'étouffe, « s'arrête », reprend
           1-2 s après. En course ces deux-là deviennent la montée simple (souffle, roulement, 4 pas de coupe, impact à l'arrivée). */
        s2 = s2.split("bt = M.build;").join("bt = (M.build === 'filtre' || M.build === 'dub') ? 'montee' : M.build;")
          .split("M.build = 'dub'; (M.journal").join("M.build = 'montee'; (M.journal")
          .split("else if (grand) { M.build = rp(['montee', 'filtre']").join("else if (grand) { M.build = 'montee'; void rp(['montee', 'filtre']");
        PB.montee = 'douce'; }
      else PB.montee = 'ancienne';
      /* (2026-10-31, Léo : « l'image ne doit plus couper quand je joue sur téléphone ») LA SALLE (la réverbe) CALCULÉE UNE FOIS PAR SESSION. Chaque morceau
         recalculait au JOUER sa réponse de salle, échantillon par échantillon (2,6 s × 2 voies, deux exponentielles par échantillon) : MESURÉ au banc
         iPhone ×4, 141 ms d'un bloc dans l'image du piqué, à CHAQUE course. Elle ne dépend que de ses réglages (un bruit) : gardée par réglages, elle
         resservira telle quelle aux courses suivantes. Le texte est le même partout (`function ir(`) ; absent = rien à faire. */
      s2 = s2.split('function ir(').join("function ir(...A9) { const K9 = JSON.stringify(A9) + '@' + ctx.sampleRate + '@' + " + JSON.stringify(u) + ", C9 = (globalThis.__ccIR || (globalThis.__ccIR = {})); return C9[K9] || (C9[K9] = irCalc(...A9)); }\n  function irCalc(");
      if (W.RYTHMIQUE) s2 = W.RYTHMIQUE.patch(s2);   /* (2026-11-02, Léo : « les versions améliorées dans le jeu ») rythmique haut de gamme + timbres affinés, retouchés au chargement (music/ameliorees/rythmique.js) ; ?rythmique=0 = les originales */
      const b = URL.createObjectURL(new Blob([s2.split('import.meta.url').join(JSON.stringify(u))], { type: 'text/javascript' }));
      try { const m = await import(b); PB.avance = AVANCE; return m; } finally { URL.revokeObjectURL(b); }
    } catch (e) { delete MODS[K]; PB.avance = .35; return importe(u); } })()); };   // (un espace de noms de module n'accepte aucune propriété : l'avance réelle est notée sur PB)
  /* (2026-11-09, OPTI ULTIME : « musique de course pré-rendue sur téléphone ») LA MUSIQUE FIGÉE. Sur le TÉLÉPHONE (`__ccAllege` : vrai téléphone ou `?tel=1`, posé par le jeu), les 10 morceaux choisis ne jouent plus
     par leurs pages en direct (~190 oscillateurs vivants au palier 16, chaleur du processeur audio) mais par 10 PALIERS rendus une fois pour toutes (assets/audio/music/course/<id>/p1…p10.m4a +
     index.js, outils/musique/rendre-paliers.mjs) que le lecteur à paliers de la bibliothèque enchaîne sur la mesure. L'ordinateur garde le direct (le MAXIMUM) ; `?musique=live` = le direct
     partout (A/B), `?musique=fige` = le figé même sur l'ordinateur (banc). Un fichier absent ou indécodable → la page en direct du même morceau (repli noté dans la boîte noire). */
  const figeOn = () => (!!W.__ccAllege && !/[?&]musique=live\b/.test(location.search)) || /[?&]musique=fige\b/.test(location.search);   /* (lu au CHARGEMENT de la liste, pas à celui du fichier : le jeu pose __ccAllege plus tard) */
  const note = (m) => { try { if (W.__ccNote) W.__ccNote('musique', m); } catch (e) {} };
  const PB = { avance: null, liste: null, E: null, J: null, ch: null, ac: null, phase: 'repos', err: null, tIntro: 0, n: 0, dernier: null };

  PB.charge = async function () {   // la liste de Pouce bleu (une fois)
    if (PB.liste) return PB.liste;
    const P = await (await fetch('musique-moteur.json', { cache: 'no-cache' })).json();
    let R = null; try { R = await importe(url(D + 'direct/retouches-bleu.js')); } catch (e) {}
    if (!W.PALIERS_RENDUS) try { await script(D + 'paliers/rendus/index.js'); } catch (e) {}
    if (!W.RYTHMIQUE) try { await script(D + 'ameliorees/rythmique.js'); } catch (e) {}   /* (2026-11-02) les versions améliorées ; absent = les originales */
    const suppr = new Set(P.suppr || []), place = P.place || {}, noms = P.noms || {}, RN = (R && R.RENOMS) || {}, V2 = (R && R.V2) || [], L = [], vu = new Set();
    (P.gen || []).forEach(e => { const id = 'bleu-' + e.n, k = e.n + '|' + e.titre; if (!(e.avis > 0) || suppr.has(id) || EN_ATTENTE[id] || vu.has(k)) return; vu.add(k);
      L.push({ id, type: 'genv', titre: noms[id] || RN[id] || e.titre, n: e.n, W: e.g || null, v: versionDe(e), da: e.da || 'cashcar', style: String(e.style || ''), lead: e.lead || '', keys: e.keys || '',
        ret: V2.find(d => d.base === e.n && d.direct) || null }); });
    const RF = W.PALIERS_RENDUS || {};
    Object.keys(place).forEach(id => { if (place[id] !== 'bleu' || suppr.has(id) || !/^pal-/.test(id) || EN_ATTENTE[id]) return; const f = RF[id.slice(4)];
      if (f && f.fichiers && f.fichiers.length) L.push({ id, type: 'paliers', titre: noms[id] || f.titre, fiche: f }); });
    DEFAUT.forEach(id => { if (suppr.has(id) || (place[id] && place[id] !== 'bleu') || EN_ATTENTE[id]) return;
      if (HTML[id]) L.push({ id, type: 'html', titre: noms[id] || HTML[id][0], f: D + HTML[id][1] }); });
    /* (2026-11-02, Léo : « refonte de la musique de course de CAVALE ULTRA… », « refonte totale de RUBIS ULTRA ») LES MORCEAUX REFAITS, directement sur le morceau (pas de second morceau) :
       `course` = une page écrite à la main joue la COURSE, le lobby reste celui du générateur ; `tout` = la page remplace le morceau (lobby ET course). `avant` = la version d'avant (la salle d'écoute la propose en petit). */
    const AV = (R && R.AVANT) || {};
    L.forEach((E, i) => { const X = PERSO[E.id], A = AV[E.id];
      if (A && E.type === 'genv') E.avant = Object.assign({}, E, { ret: A, avant: null });
      if (X && X.tout) { L[i] = { id: E.id, type: 'html', titre: E.titre, f: X.tout, avant: E.avant || Object.assign({}, E, X.ancien ? { f: X.ancien } : {}, { avant: null }) }; }
      else if (X && X.course) { E.course = X.course; if (!E.avant) E.avant = Object.assign({}, E, { course: null, avant: null }); } });
    if (figeOn()) {
      if (!W.PALIERS_COURSE) try { await script(D + 'course/index.js'); } catch (e) { note('figée absente (' + (e && e.message || e) + ') : le direct'); }
      const PC = W.PALIERS_COURSE || {};
      L.forEach((E, i) => { const f = PC[E.id]; if (!f || !f.fichiers || !f.fichiers.length || E.type !== 'html') return;   /* seuls les morceaux EN DIRECT (pages) sont remplacés : l'entrée d'origine reste en `live`, le repli */
        L[i] = { id: E.id, type: 'paliers', figee: true, titre: E.titre, fiche: f, live: E, avant: E.avant }; });
    }
    /* (2026-11-09, branche musique-favoris ; Léo : « crée une nouvelle branche de musique avec toutes les musiques favorites sélectionnées, et ramène les sons à trompette ») LA LISTE DE CETTE BRANCHE.
       · PB.toutes = tout ce que le jeu sait jouer (l'ancienne liste complète) ; PB.autres = ce qui n'est PAS au tirage : les morceaux du générateur retirés ou sans pouce bleu (dont ceux à TROMPETTE : MIRAGE DE VITESSE, CAISSE ULTRA…) et
         la version d'AVANT de chaque refonte (« · AVANT » : le MIRAGE D'ARGENT du générateur, à trompette sourde, le FEU PRIME du générateur, l'AVERSE DE CHROME au piano d'avant, l'ancien CAVALE ULTRA…).
       · LE TIRAGE (PB.liste) = assets/audio/music/favoris.json : `ids` (les favoris ★ de Léo) + `extras` (des versions d'avant, ids « avant:… », ramenées au tirage). Fichier absent ou vide, ou `?musiques=toutes` : l'ancienne liste complète. */
    const dans = new Set(L.map(x => x.id)), vu2 = new Set(), autres = [];
    (P.gen || []).forEach(e => { const id = 'bleu-' + e.n, k = e.n + '|' + e.titre; if (dans.has(id) || vu2.has(k)) return; vu2.add(k);
      autres.push({ id, type: 'genv', titre: noms[id] || RN[id] || e.titre, n: e.n, W: e.g || null, v: versionDe(e), da: e.da || 'cashcar', style: String(e.style || ''), lead: e.lead || '', keys: e.keys || '', ret: null, autre: true, avis: e.avis, retire: suppr.has(id) }); });
    L.forEach(E => { if (E.avant) autres.push(Object.assign({}, E.avant, { id: 'avant:' + E.id, base: E.id, titre: E.titre + ' · AVANT', avant: null, course: E.avant.course || null, autre: true })); });
    PB.toutes = L; PB.autres = autres;
    let fav = null; if (!/[?&]musiques=toutes\b/.test(location.search)) { try { const r = await fetch(D + 'favoris.json', { cache: 'no-cache' }); if (r.ok) fav = await r.json(); } catch (e) {} }
    PB.favoris = fav;
    if (fav && (fav.ids || []).length) { const ids = new Set(fav.ids), ex = new Set(fav.extras || []), nm = fav.noms || {}; const F = L.filter(x => ids.has(x.id)).concat(autres.filter(x => ex.has(x.id)));
      F.forEach(x => { if (nm[x.id]) x.titre = nm[x.id]; });
      if (F.length) return PB.liste = F; }
    return PB.liste = L;
  };
  PB.tire = function () {   // au hasard, sans doublon d'une course à l'autre
    const L = PB.liste || []; if (!L.length) return null;
    const m = /[?&]pouce=([^&#]+)/.exec(location.search); if (m) { const v = decodeURIComponent(m[1]); const E = L.find(x => x.id === v || String(x.n) === v); if (E) return E; }
    let vus = []; try { vus = JSON.parse(localStorage.getItem('pbjVus') || '[]'); } catch (e) {}
    let reste = L.filter(x => vus.indexOf(x.id) < 0); if (!reste.length) { vus = []; reste = L.slice(); }
    const E = reste[Math.floor(Math.random() * reste.length)]; vus.push(E.id); try { localStorage.setItem('pbjVus', JSON.stringify(vus)); } catch (e) {} return E;
  };

  // ---------------------------------------------------------------- les trois lecteurs (chacun : { regle(m 1..30), stop(), bpm() })
  async function joueurGen(ac, dest, E, t0) {
    const f = E.v === 'actuelle' ? 'direct/musique-trente.js' : 'direct/musique-trente-' + E.v + '.js';
    const dep = E.ret && +E.ret.depart || 0, depG = k => Math.pow(10, dep * (1 - Math.min(1, Math.max(0, (k - 1) / 17))) / 20), gc = dep ? ac.createGain() : null;   // (16/10) le départ compensé (retouches-bleu.js, `depart`)
    if (gc) { gc.gain.value = depG(1); gc.connect(dest); }
    const mod = await importeAvance(url(D + f)), inst = mod.createTrenteMusic({ audioContext: ac, destination: gc || dest, renouvelle: 0, da: E.da });
    const O = {}; if (/^hyb:/.test(E.style)) O.style = E.style;   // (la couleur de l'avis : sans elle, une musique v6 en devenait une autre)
    if (E.ret) { O.retouche = E.ret.retouche; O.voix = E.ret.voix; O.acc = E.ret.acc; }
    const m0 = t0 || (typeof W.pbjTier === 'function' ? W.pbjTier(1, E.id) : 1);   // (2026-10-24) le morceau part au moteur REMAPPÉ du moteur 1 du jeu (pbjTier, musique.js) : plein dès l'intro, pas un palier presque muet
    inst.setTier(m0, 30); inst.start(E.n, E.W || undefined, O); let cur = m0;
    const on = k => { const b = inst._bus && inst._bus[k]; return !!b && b.gain.value > .01; };   // (20/10) ce qui joue : le dompteur de grosse caisse du bus ne touche jamais la basse seule
    return { regle(m) { if (m !== cur) { cur = m; inst.setTier(m, 30); if (gc) gc.gain.setTargetAtTime(depG(m), ac.currentTime, .3); } }, stop() { try { inst.stop(); } catch (e) {} if (gc) setTimeout(() => { try { gc.disconnect(); } catch (e) {} }, 1500); }, bpm: () => inst.bpm || 120, inst,
      groupe() { try { return { kick: on('kick'), basse: on('basse') || on('basse2') || on('sub') }; } catch (e) { return null; } } };
  }
  async function joueurPaliers(ac, dest, E, t0) {
    if (!W.PalLecteur) await script('musique-paliers.js');
    const F = E.fiche, n = F.fichiers.length, L = W.PalLecteur(ac, dest), enCours = {}, deb = W.palDecoupe(n, F.moteurs), FIG = !!E.figee; L.nb = F.mesures || 8;
    const lit = f => fetch(f).then(r => { if (!r.ok) throw new Error(f); return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a));
    /* LA MUSIQUE FIGÉE : le fichier décodé doit avoir EXACTEMENT la longueur de la boucle (`N`, marqueur iTunSMPB) — sinon la boucle dérive d'une mesure à l'autre : trop long (≥ N) → on coupe, trop court → refusé (repli) */
    const juste = b => { if (!FIG || !F.N || b.length === F.N) return b; if (b.length < F.N) throw new Error('boucle trop courte ' + b.length + '/' + F.N);
      const c = ac.createBuffer(b.numberOfChannels, F.N, b.sampleRate); for (let k = 0; k < b.numberOfChannels; k++) c.getChannelData(k).set(b.getChannelData(k).subarray(0, F.N)); return c; };
    const gainDe = i => (FIG && F.gains && F.gains[i] != null) ? F.gains[i] : 1;
    const charge = i => { if (i < 0 || i >= n || L.buf[i] || enCours[i]) return; enCours[i] = lit(F.fichiers[i]).then(b => { L.buf[i] = juste(b); L.gain[i] = gainDe(i); }, e => { if (FIG) note('figée ' + E.id + ' p' + (i + 1) + ' : ' + (e && e.message || e)); }).then(() => { delete enCours[i]; }); };
    /* la garde mémoire : le palier joué et ses voisins ; en FIGÉ (téléphone) une fenêtre plus étroite (p−1 … p+1, soit 3 boucles décodées ≈ 15 Mo ; l'AURA, boucle de 31 s : p … p+1) */
    const lo = FIG ? (F.boucleS > 20 ? 0 : 1) : 1, hi = FIG ? 1 : 2;
    const garde = p => { for (let i = 0; i < n; i++) if (L.buf[i] && (i < p - lo || i > p + hi) && i !== L.palier() && i !== L.vers()) L.buf[i] = undefined; for (let i = p - lo; i <= p + hi; i++) charge(i); };
    L.buf[0] = juste(await lit(F.fichiers[0])); L.gain[0] = gainDe(0);
    if (FIG && F.intro && F.introMesures > 0) { try { L.intro = await lit(F.intro); L.nbIntro = F.introMesures; L.introGain = gainDe(0); } catch (e) { note('figée ' + E.id + ' intro : ' + (e && e.message || e)); } }
    L.demarre(0); garde(0);
    const SUR = (!FIG && W.RYTHMIQUE && W.RYTHMIQUE.on) ? W.RYTHMIQUE.surcouche(ac, dest, L, E.id) : null;   /* (2026-11-02) la rythmique améliorée, calée sur la boucle du morceau figé (le figé l'a déjà dans ses fichiers) */
    return { regle(m) { const p = W.palPalierDe(deb, m - 1); L.promeut(); garde(p); if (L.vers() !== p) L.vise(p); if (SUR) SUR.regle(m); }, stop() { try { L.stop(.3); } catch (e) {} if (SUR) SUR.stop(); }, bpm: () => F.bpm || 120, figee: FIG };
  }
  /* la musique figée avec son repli : n'importe quelle panne (fiche, fichier, décodage) → la page en direct du même morceau, comme avant */
  async function joueurFige(ac, dest, E, t0) {
    try { const J = await joueurPaliers(ac, dest, E, t0); note('figée ' + E.id); return J; }
    catch (e) { note('live (repli : ' + (e && e.message || e) + ') ' + E.id); if (!E.live) throw e; return joueurHtml(ac, dest, E.live, t0); }
  }
  const joueurDe = E => E.type === 'genv' ? joueurGen : E.type === 'paliers' ? (E.figee ? joueurFige : joueurPaliers) : joueurHtml;
  async function joueurHtml(ac, dest, E, t0, differe) {
    const fr = document.createElement('iframe'); fr.src = (W.RYTHMIQUE && W.RYTHMIQUE.on) ? await W.RYTHMIQUE.urlPage(E.f) : E.f;   /* (2026-11-02) la page retouchée (rythmique + timbres) */ fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:0;bottom:0;width:8px;height:8px;opacity:0;pointer-events:none;border:0;z-index:-1'; document.body.appendChild(fr);
    try { await new Promise((ok, ko) => { fr.onload = ok; fr.onerror = ko; });
    /* (2026-10-31, Léo : « des cuts audio très embêtants sur mobile ») LES PAGES ÉCRITES À LA MAIN PRÉVOIENT 1 s, COMME LE GÉNÉRATEUR. Leur horloge
       (`while (tNext < ctx.currentTime + 0.4)`, toutes les 60 ms) ne posait la mesure suivante que 0,4 s avant qu'elle sonne : un gel de la page plus
       long (une montée de palier, un portail, sur iPhone) et la mesure partait EN RETARD, notes tassées ou perdues — le trou dans la musique. Leur
       texte dit qu'elles ne lisent l'heure du son QUE là (« ni ctx.currentTime » dans le morceau) : le contexte prêté leur donne donc une heure en avance
       de AVANCE − 0,4 s, et tout le morceau se pose d'autant plus tôt (il démarre 0,6 s plus tard, derrière le filtre de l'intro). `?avance=.35` = avant. */
    const AV_H = Math.max(0, AVANCE - .4);
    const prete = new Proxy(ac, { get(t, k) { if (k === 'destination') return dest; if (k === 'close' || k === 'suspend') return () => Promise.resolve(); if (k === 'currentTime') return t.currentTime + AV_H;
      const v = Reflect.get(t, k, t); return typeof v === 'function' ? v.bind(t) : v; } });
    fr.contentWindow.AudioContext = fr.contentWindow.webkitAudioContext = function () { return prete; };
    const d = fr.contentDocument, bt = d.getElementById('play'), jg = d.getElementById('speed'); if (!bt || !jg) throw new Error('page sans #play / #speed');
    jg.step = 'any'; const vit = x => { jg.value = (x * 100).toFixed(1); jg.dispatchEvent(new fr.contentWindow.Event('input')); };
    const depart = () => { vit(t0 ? (t0 - 1) / 29 : typeof W.pbjTier === 'function' ? (W.pbjTier(1, E.id) - 1) / 29 : 0); bt.click(); };
    if (!differe) depart();   /* (2026-11-02) `differe` : la page est chargée mais muette, elle part au lance() (la course d'un morceau refait, préparée pendant le lobby) */
    const bpm = (fr.contentWindow.MORCEAU && fr.contentWindow.MORCEAU.bpm) || 120;
    return { lance: depart, regle(m) { vit((m - 1) / 29); }, stop() { try { if (/stop/i.test(bt.textContent)) bt.click(); } catch (e) {} fr.remove(); }, bpm: () => bpm };
    } catch (e) { fr.remove(); throw e; }   // (la page n'est pas venue : l'iframe ne reste pas)
  }

  // ---------------------------------------------------------------- la chaîne : filtre de l'intro → niveau → bus des basses → la sortie du jeu
  /* (2026-11-02, Léo : « le son du menu ciel ne doit être rien d'autre qu'un truc fabriqué avec les musiques faites pour le jeu, transformé en un truc d'ambiance qui se transforme en la musique du jeu dès qu'on appuie sur JOUER ») LE LOBBY LIÉ :
     la musique du niveau est tirée AU MENU (PB.lobby), pas au JOUER : elle joue déjà, au moteur de départ, derrière un filtre fermé (~1 100 Hz) et dans une grande salle (réverbération 2,6 s) : c'est la version « ambiance » du morceau. Au JOUER (PB.depart),
     le MÊME morceau, déjà en route, se transforme (PB.transforme) : le filtre s'ouvre sur 1,8 s, la salle s'efface, le niveau monte : le petit changement qui récompense d'avoir lancé la partie. Aucune coupure : rien ne redémarre. Après la mort, le menu en tire un autre. */
  function irAmbiance(ac) {   // une salle sombre : du bruit qui s'éteint en s'étouffant (le même principe que celle de l'intro), calculée une fois par contexte
    if (ac._irAmb) return ac._irAmb; const n = Math.floor(ac.sampleRate * 3.4), b = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let y = 0; for (let i = 0; i < n; i++) { const k = i / n; y += (.9 - .8 * Math.pow(k, .35)) * ((Math.random() * 2 - 1) - y); d[i] = y * Math.pow(1 - k, 2.4) * (k < .004 ? k / .004 : 1); } }
    return ac._irAmb = b;
  }
  function chaine(ac, sortie, ambiance) {
    const f = ac.createBiquadFilter(), g = ac.createGain(), e = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = .6; g.gain.value = 0; e.gain.value = .937;
    let hp = null, nt = null;   // (2/11 soir) le lobby a un PASSE-HAUT (il laisse les graves au vent du ciel) ; la course n'en a pas : sa chaîne est inchangée
    if (ambiance) { hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 10; hp.Q.value = .7; nt = ac.createBiquadFilter(); nt.type = 'peaking'; nt.frequency.value = 900; nt.Q.value = 1; nt.gain.value = -4; f.connect(hp); hp.connect(nt); nt.connect(g); } else f.connect(g);   // nt : une encoche de −4 dB à 900 Hz, la bande de souffle du vent du ciel (voir chute-libre.js) : le vent garde sa place dans les médiums
    let d = g, bus = null, conv = null, wet = null;
    if (ambiance) { conv = ac.createConvolver(); conv.buffer = irAmbiance(ac); wet = ac.createGain(); wet.gain.value = 0; (hp || f).connect(conv); conv.connect(wet); wet.connect(g); wet.gain.setTargetAtTime(ambiance, ac.currentTime, 1.2); }
    if (W.MUSBUS) { bus = W.MUSBUS.cree(ac); g.connect(bus.entree); d = bus.sortie; }
    d.connect(e); e.connect(sortie);
    return { f, g, e, bus, entree: f, conv, wet, hp, nt };
  }
  const t9 = (p, v, t, tau) => { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (x) {} };

  /* LE DÉPART (le JOUER) : le morceau tiré démarre au moteur 1, derrière le filtre fermé ; l'intro l'ouvre sur 2 mesures de SON tempo (2-4 s) */
  PB.depart = async function (ac, sortie, opt) {
    opt = opt || {};
    if (PB.phase === 'lobby' && PB.J && PB.E && !opt.meme) return PB.transforme(opt);   // le morceau du menu joue déjà : on ne redémarre rien, il se transforme
    PB.fin(false);
    const jeton = ++PB.n; PB.phase = 'charge'; PB.err = null; PB.ac = ac; let ch = null;
    try {
      await PB.charge(); if (jeton !== PB.n) return null;
      const E = (opt.meme && (PB.enCourse || PB.dernier)) || PB.tire(); if (!E) { PB.phase = 'vide'; return null; } PB.dernier = E;   // (la seconde chance : le MÊME morceau repart) — (2026-11-05, DEBUG-TOTAL, prouvé au banc --chance) PB.enCourse et non PB.dernier : le lobby de l'écran de mort (1,4 s après la mort) tire déjà le morceau SUIVANT et écrase PB.dernier ; CONTINUER relançait ce morceau-là au lieu de celui de la course
      ch = chaine(ac, sortie); if (ch.bus) { ch.bus.brut(!!opt.brut); ch.bus.piste('jeu:' + E.id); ch.bus.course(true); }
      const Ej = E.course ? Object.assign({}, E, { type: 'html', f: E.course }) : E;   /* (2026-11-02) un morceau refait : la page de course */
      const J = await joueurDe(Ej)(ac, ch.entree, Ej);
      if (jeton !== PB.n) { J.stop(); try { ch.e.disconnect(); } catch (e) {} return null; }
      PB.E = E; PB.J = J; PB.ch = ch; PB.phase = 'intro';
      const mes = 240 / (J.bpm() || 120), T = (opt.doux && opt.doux[E.id]) ? 6 : Math.max(2, Math.min(4, 2 * mes)), t = ac.currentTime; PB.tIntro = t + T;   // (2/11) un départ ADOUCI pour les morceaux déjà chargés au premier élément : le filtre s'ouvre en 6 s
      ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(320, t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + T);
      if (opt.vite) PB.course();
      return E;
    } catch (e) { PB.err = String(e && e.message || e); if (jeton === PB.n) PB.phase = 'erreur'; if (ch) try { ch.e.disconnect(); } catch (x) {} return null; }   // (le jeu rend alors la course à la radio)
  };
  /* LE LOBBY : le morceau de la prochaine course, tiré maintenant, en ambiance. `opt.fixes` : seulement les morceaux à paliers figés (des fichiers : ils tiennent un gel de la page) ; un autre est gardé en attente (`PB.attente`) et part au prochain appel. */
  PB.lobby = async function (ac, sortie, opt) {
    opt = opt || {};
    if (PB.phase === 'lobby' && PB.J) return PB.E;
    if (PB.phase === 'charge' || PB.phase === 'intro' || PB.phase === 'course') return PB.E || null;   // une course (ou un autre départ) a la main : on n'y touche pas
    const jeton = ++PB.n; PB.phase = 'charge'; PB.err = null; PB.ac = ac; let ch = null;
    try {
      await PB.charge(); if (jeton !== PB.n) return null;
      const E = PB.attente || PB.tire(); PB.attente = null; if (!E) { PB.phase = 'vide'; return null; }
      if (opt.fixes && E.type !== 'paliers') { PB.attente = E; PB.phase = 'repos'; return null; }
      PB.dernier = E;
      ch = chaine(ac, sortie, .5); ch.f.frequency.setValueAtTime(2400, ac.currentTime); ch.f.Q.value = .7; if (ch.hp) ch.hp.frequency.setValueAtTime(220, ac.currentTime);   // (2/11 soir, Léo : « mieux mixer la musique dans le ciel : on n'entend pas assez la musique, mais il faut qu'on entende le ciel, que les deux ne se brouillent pas ») MESURÉ au jeu : le filtre à 620 Hz et la salle à .8 enfermaient la musique entre 300 et 1 500 Hz, EXACTEMENT là où le vent a ses médiums ; elle joue maintenant de 220 Hz (les graves restent au vent) à 2 400 Hz (la présence, où le vent n'a presque rien : −18 dB), avec moitié moins de salle   // l'ambiance (2/11 : plus loin qu'au premier essai, 1 100 Hz / salle .5) : le filtre bien fermé, la grande salle, et un souffle lent dans le filtre
      try { const l = ac.createOscillator(), lg = ac.createGain(); l.type = 'sine'; l.frequency.value = .07; lg.gain.value = 400; l.connect(lg); lg.connect(ch.f.frequency); l.start(); ch.lfo = { o: l, g: lg }; } catch (e) {}
      if (ch.bus) { ch.bus.brut(!!opt.brut); ch.bus.piste('lobby:' + E.id); ch.bus.course(false); }
      const tl = (opt.tiers && opt.tiers[E.id]) || opt.tier || 0;   // le palier du lobby : celui du morceau (table du jeu), sinon le palier commun
      /* (2026-11-02, Léo : « attention que les musiques ne soient pas buggées en mode ça commence direct avec plein d'instruments ») LE LOBBY ENTRE DOUCEMENT : il démarre au palier 1 (un morceau du générateur démarré DIRECTEMENT au palier 3 joue déjà tout : −13 dB, tous les instruments),
         avec un fondu d'entrée de 4 s (PB.niveau), puis le palier monte d'un cran toutes les 2,5 s jusqu'au palier du lobby de ce morceau (`tl`) : la musique se construit, elle ne tombe pas toute faite. */
      const J = await joueurDe(E)(ac, ch.entree, E, 1);
      if (jeton !== PB.n) { J.stop(); try { ch.e.disconnect(); } catch (e) {} return null; }
      PB.E = E; PB.J = J; PB.ch = ch; PB.phase = 'lobby'; PB.tier0 = tl; PB.tLobby = ac.currentTime; PB.doux = !!(opt.doux && opt.doux[E.id]);
      for (let m = 2; m <= tl; m++) setTimeout(() => { if (PB.phase === 'lobby' && PB.J === J) { try { J.regle(m); } catch (e) {} } }, 1500 + 2500 * (m - 1));
      if (E.course) { const pre = { v: null, p: null }; PB.pre = pre;   /* la course refaite se prépare pendant le lobby : chargée, muette, elle part au JOUER */
        pre.p = (async () => { const ch2 = chaine(ac, sortie); const J2 = await joueurHtml(ac, ch2.entree, Object.assign({}, E, { type: 'html', f: E.course }), 0, true); return { ch: ch2, J: J2 }; })();
        pre.p.then(v => { pre.v = v; if (PB.pre !== pre) { try { v.J.stop(); v.ch.e.disconnect(); } catch (e) {} } }, () => { if (PB.pre === pre) PB.pre = null; }); }
      return E;
    } catch (e) { PB.err = String(e && e.message || e); if (jeton === PB.n) PB.phase = 'erreur'; if (ch) try { ch.e.disconnect(); } catch (x) {} return null; }
  };
    const boumDe = (ch, ac, t, opt) => {
    if (opt.boum > 0) { try {   // le coup du JOUER : un grave qui tombe, un souffle filtré qui s'ouvre ; il suit le curseur EFFETS (opt.boum)
      const k = opt.boum, o = ac.createOscillator(), og = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(34, t + .55);
      og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(.34 * k, t + .012); og.gain.exponentialRampToValueAtTime(.0002, t + .75); o.connect(og); og.connect(ch.e); o.start(t); o.stop(t + .8);
      const nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = nb; nf.type = 'bandpass'; nf.Q.value = .9;
      nf.frequency.setValueAtTime(500, t); nf.frequency.exponentialRampToValueAtTime(9000, t + .5); ng.gain.setValueAtTime(.0001, t); ng.gain.exponentialRampToValueAtTime(.14 * k, t + .04); ng.gain.exponentialRampToValueAtTime(.0002, t + .6);
      ns.connect(nf); nf.connect(ng); ng.connect(ch.e); ns.start(t); ns.stop(t + .7);
    } catch (e) {} }
  };
  /* LA BASCULE (2026-11-02) : le JOUER d'un morceau dont la course est refaite. La page de course, préparée pendant le lobby, part : son filtre claque ouvert, le coup du JOUER ; le lobby s'éteint en un souffle. */
  PB.bascule = function (opt) {
    opt = opt || {}; const pre = PB.pre, N = pre.v, ac = PB.ac, E = PB.E, vieux = { J: PB.J, ch: PB.ch }; PB.pre = null;
    const t = ac.currentTime, T = PB.doux ? 3.2 : .5, ch = N.ch;
    try { ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(320, t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + T); } catch (e) {}
    boumDe(ch, ac, t, opt);
    if (ch.bus) { try { ch.bus.brut(!!opt.brut); ch.bus.piste('jeu:' + E.id); ch.bus.course(true); } catch (e) {} }
    const vc = vieux.ch; if (vc) { if (vc.lfo) { try { vc.lfo.o.stop(); } catch (e) {} vc.lfo = null; } try { t9(vc.g.gain, 0, t, .08); } catch (e) {}
      setTimeout(() => { try { vieux.J.stop(); } catch (e) {} setTimeout(() => { try { vc.e.disconnect(); } catch (e) {} }, 600); }, 700); }
    try { N.J.lance(); } catch (e) {}
    PB.J = N.J; PB.ch = ch; PB.tier0 = 0; PB.tIntro = t + T; PB.phase = 'course'; PB.enCourse = E;
    return E;
  };
  /* LE JOUER, VU DU MENU : le morceau déjà en route se transforme. Le filtre s'ouvre sur 1,8 s, la salle s'efface, le niveau (musicTick) monte ; le morceau est alors « en course ». */
  PB.transforme = function (opt) {
    opt = opt || {};
    if (PB.E && PB.E.course && PB.pre && PB.pre.v && PB.phase === 'lobby') return PB.bascule(opt);   /* (2026-11-02) un morceau refait : le lobby s'éteint, la course refaite part */ const ch = PB.ch, ac = PB.ac, E = PB.E; if (!ch || !ac || !E) return null;
    const t = ac.currentTime, T = PB.doux ? 3.2 : .5;   // (2/11) départ adouci : 3,2 s   // (2/11, Léo : « quand on appuie, boum, ça démarre comme la musique ») : le filtre claque ouvert en 0,5 s, la salle se coupe en un souffle, et un vrai coup l'accompagne
    try { ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(Math.max(300, ch.f.frequency.value), t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + T); } catch (e) {}
    if (ch.hp) t9(ch.hp.frequency, 10, t, .25);
    if (ch.nt) t9(ch.nt.gain, 0, t, .25);   // le passe-haut s'ouvre avec le filtre : les graves reviennent, « ça démarre comme la musique »
    if (ch.lfo) { try { ch.lfo.g.gain.setTargetAtTime(0, t, .1); ch.lfo.o.stop(t + 1); } catch (e) {} ch.lfo = null; }
    if (ch.wet) { t9(ch.wet.gain, 0, t, .12); setTimeout(() => { try { ch.conv.disconnect(); ch.wet.disconnect(); } catch (e) {} }, 3500); }
    boumDe(ch, ac, t, opt);
    if (ch.bus) { try { ch.bus.brut(!!opt.brut); ch.bus.piste('jeu:' + E.id); ch.bus.course(true); } catch (e) {} }
    try { PB.J.regle(typeof W.pbjTier === 'function' ? W.pbjTier(1, E.id) : 6); } catch (e) {}   // le palier du lobby monte au palier de départ de la course, au même instant que le filtre et le coup : « boum, ça démarre comme la musique »
    PB.tier0 = 0; PB.tIntro = t + T; PB.phase = 'course'; PB.enCourse = E;
    return E;
  };
  /* LA COURSE : l'intro finit (au plus vite si elle n'a pas fini), le morceau joue au moteur 1 et suit le moteur */
  PB.course = function () {
    const ch = PB.ch, ac = PB.ac; if (!ch || !ac) return;
    const t = ac.currentTime; if (PB.tIntro > t + .5) { ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(Math.max(320, ch.f.frequency.value), t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + .5); PB.tIntro = t + .5; }
    PB.phase = 'course'; PB.enCourse = PB.E;   /* le morceau de CETTE course : la seconde chance le reprend (PB.depart, opt.meme) */
  };
  PB.moteur = function (m) { if (PB.J) try { PB.J.regle(Math.max(1, Math.min(30, m | 0))); } catch (e) {} };
  PB.niveau = function (v) { if (PB.ch && PB.ac) { if (PB.phase === 'lobby' && PB.tLobby != null) { const k = Math.min(1, Math.max(0, (PB.ac.currentTime - PB.tLobby) / 4)); v *= k * k * (3 - 2 * k); }   // le fondu d'entrée du lobby (4 s)
    const g = PB.ch.g.gain; if (Math.abs((g._v9 == null ? -1 : g._v9) - v) > .003) { g._v9 = v; t9(g, Math.max(0, v), PB.ac.currentTime, .08); }
    if (PB.ch.bus && PB.ch.bus.tick) PB.ch.bus.tick(PB.J && PB.J.groupe ? PB.J.groupe() : null, Math.max(0, v)); } };   // (20/10) le dompteur de grosse caisse du bus (musique-bus.js) écoute à chaque image, avec le niveau
  PB.recul = function () { if (PB.ch && PB.ch.bus) PB.ch.bus.recul(-3, .4); };
  PB.joue = () => !!PB.J && (PB.phase === 'intro' || PB.phase === 'course');
  /* LA FIN : un fondu (la mort : plus court), puis tout s'éteint */
  PB.fin = function (vite) {
    const pre = PB.pre; PB.pre = null; if (pre) pre.p.then(v => { try { v.J.stop(); v.ch.e.disconnect(); } catch (e) {} }, () => {});
    PB.n++; const J = PB.J, ch = PB.ch, ac = PB.ac; PB.J = null; PB.ch = null; PB.E = null; PB.phase = 'repos';
    if (!J && !ch) return;
    const d = vite ? .35 : .9;
    if (ch && ch.lfo) { try { ch.lfo.o.stop(); } catch (e) {} ch.lfo = null; }   // le souffle lent du lobby s'éteint avec lui
    try { if (ch && ac) t9(ch.g.gain, 0, ac.currentTime, d / 4); } catch (e) {}
    setTimeout(() => { try { if (J) J.stop(); } catch (e) {} setTimeout(() => { try { if (ch) ch.e.disconnect(); } catch (e) {} }, 600); }, d * 1000);
  };
  PB.etat = () => ({ phase: PB.phase, avance: PB.avance, montee: PB.montee || null, titre: PB.E && PB.E.titre, id: PB.E && PB.E.id, type: PB.E && PB.E.type, figee: !!(PB.E && PB.E.figee && PB.J && PB.J.figee), liste: PB.liste ? PB.liste.length : null, err: PB.err,
    filtre: PB.ch ? Math.round(PB.ch.f.frequency.value) : null, niveau: PB.ch ? +PB.ch.g.gain.value.toFixed(3) : null, bus: PB.ch && PB.ch.bus ? PB.ch.bus.etat() : null,
    moteur: PB.J && PB.J.inst ? PB.J.inst.tier : null });
  W.POUCE_JEU = PB;
})(window);
