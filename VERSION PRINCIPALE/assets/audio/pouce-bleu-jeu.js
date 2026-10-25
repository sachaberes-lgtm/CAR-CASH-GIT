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
  const importeAvance = u => MODS[u] || (MODS[u] = (async () => { try {
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
      const b = URL.createObjectURL(new Blob([s2.split('import.meta.url').join(JSON.stringify(u))], { type: 'text/javascript' }));
      try { const m = await import(b); PB.avance = AVANCE; return m; } finally { URL.revokeObjectURL(b); }
    } catch (e) { delete MODS[u]; PB.avance = .35; return importe(u); } })());   // (un espace de noms de module n'accepte aucune propriété : l'avance réelle est notée sur PB)
  const PB = { avance: null, liste: null, E: null, J: null, ch: null, ac: null, phase: 'repos', err: null, tIntro: 0, n: 0, dernier: null };

  PB.charge = async function () {   // la liste de Pouce bleu (une fois)
    if (PB.liste) return PB.liste;
    const P = await (await fetch('musique-moteur.json', { cache: 'no-cache' })).json();
    let R = null; try { R = await importe(url(D + 'direct/retouches-bleu.js')); } catch (e) {}
    if (!W.PALIERS_RENDUS) try { await script(D + 'paliers/rendus/index.js'); } catch (e) {}
    const suppr = new Set(P.suppr || []), place = P.place || {}, noms = P.noms || {}, RN = (R && R.RENOMS) || {}, V2 = (R && R.V2) || [], L = [], vu = new Set();
    (P.gen || []).forEach(e => { const id = 'bleu-' + e.n, k = e.n + '|' + e.titre; if (!(e.avis > 0) || suppr.has(id) || EN_ATTENTE[id] || vu.has(k)) return; vu.add(k);
      L.push({ id, type: 'genv', titre: noms[id] || RN[id] || e.titre, n: e.n, W: e.g || null, v: versionDe(e), da: e.da || 'cashcar', style: String(e.style || ''),
        ret: V2.find(d => d.base === e.n && d.direct) || null }); });
    const RF = W.PALIERS_RENDUS || {};
    Object.keys(place).forEach(id => { if (place[id] !== 'bleu' || suppr.has(id) || !/^pal-/.test(id) || EN_ATTENTE[id]) return; const f = RF[id.slice(4)];
      if (f && f.fichiers && f.fichiers.length) L.push({ id, type: 'paliers', titre: noms[id] || f.titre, fiche: f }); });
    DEFAUT.forEach(id => { if (suppr.has(id) || (place[id] && place[id] !== 'bleu') || EN_ATTENTE[id]) return;
      if (HTML[id]) L.push({ id, type: 'html', titre: noms[id] || HTML[id][0], f: D + HTML[id][1] }); });
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
  async function joueurGen(ac, dest, E) {
    const f = E.v === 'actuelle' ? 'direct/musique-trente.js' : 'direct/musique-trente-' + E.v + '.js';
    const dep = E.ret && +E.ret.depart || 0, depG = k => Math.pow(10, dep * (1 - Math.min(1, Math.max(0, (k - 1) / 17))) / 20), gc = dep ? ac.createGain() : null;   // (16/10) le départ compensé (retouches-bleu.js, `depart`)
    if (gc) { gc.gain.value = depG(1); gc.connect(dest); }
    const mod = await importeAvance(url(D + f)), inst = mod.createTrenteMusic({ audioContext: ac, destination: gc || dest, renouvelle: 0, da: E.da });
    const O = {}; if (/^hyb:/.test(E.style)) O.style = E.style;   // (la couleur de l'avis : sans elle, une musique v6 en devenait une autre)
    if (E.ret) { O.retouche = E.ret.retouche; O.voix = E.ret.voix; O.acc = E.ret.acc; }
    const m0 = typeof W.pbjTier === 'function' ? W.pbjTier(1) : 1;   // (2026-10-24) le morceau part au moteur REMAPPÉ du moteur 1 du jeu (pbjTier, musique.js) : plein dès l'intro, pas un palier presque muet
    inst.setTier(m0, 30); inst.start(E.n, E.W || undefined, O); let cur = m0;
    const on = k => { const b = inst._bus && inst._bus[k]; return !!b && b.gain.value > .01; };   // (20/10) ce qui joue : le dompteur de grosse caisse du bus ne touche jamais la basse seule
    return { regle(m) { if (m !== cur) { cur = m; inst.setTier(m, 30); if (gc) gc.gain.setTargetAtTime(depG(m), ac.currentTime, .3); } }, stop() { try { inst.stop(); } catch (e) {} if (gc) setTimeout(() => { try { gc.disconnect(); } catch (e) {} }, 1500); }, bpm: () => inst.bpm || 120, inst,
      groupe() { try { return { kick: on('kick'), basse: on('basse') || on('basse2') || on('sub') }; } catch (e) { return null; } } };
  }
  async function joueurPaliers(ac, dest, E) {
    if (!W.PalLecteur) await script('musique-paliers.js');
    const F = E.fiche, n = F.fichiers.length, L = W.PalLecteur(ac, dest), enCours = {}, deb = W.palDecoupe(n, F.moteurs); L.nb = F.mesures || 8;
    const lit = f => fetch(f).then(r => { if (!r.ok) throw new Error(f); return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a));
    const charge = i => { if (i < 0 || i >= n || L.buf[i] || enCours[i]) return; enCours[i] = lit(F.fichiers[i]).then(b => { L.buf[i] = b; L.gain[i] = 1; }, () => {}).then(() => { delete enCours[i]; }); };
    const garde = p => { for (let i = 0; i < n; i++) if (L.buf[i] && (i < p - 1 || i > p + 2) && i !== L.palier() && i !== L.vers()) L.buf[i] = undefined; for (let i = p - 1; i <= p + 2; i++) charge(i); };
    L.buf[0] = await lit(F.fichiers[0]); L.gain[0] = 1; L.demarre(0); garde(0);
    return { regle(m) { const p = W.palPalierDe(deb, m - 1); L.promeut(); garde(p); if (L.vers() !== p) L.vise(p); }, stop() { try { L.stop(.3); } catch (e) {} }, bpm: () => F.bpm || 120 };
  }
  async function joueurHtml(ac, dest, E) {
    const fr = document.createElement('iframe'); fr.src = E.f; fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:0;bottom:0;width:8px;height:8px;opacity:0;pointer-events:none;border:0;z-index:-1'; document.body.appendChild(fr);
    try { await new Promise((ok, ko) => { fr.onload = ok; fr.onerror = ko; });
    const prete = new Proxy(ac, { get(t, k) { if (k === 'destination') return dest; if (k === 'close' || k === 'suspend') return () => Promise.resolve();
      const v = Reflect.get(t, k, t); return typeof v === 'function' ? v.bind(t) : v; } });
    fr.contentWindow.AudioContext = fr.contentWindow.webkitAudioContext = function () { return prete; };
    const d = fr.contentDocument, bt = d.getElementById('play'), jg = d.getElementById('speed'); if (!bt || !jg) throw new Error('page sans #play / #speed');
    jg.step = 'any'; const vit = x => { jg.value = (x * 100).toFixed(1); jg.dispatchEvent(new fr.contentWindow.Event('input')); };
    vit(typeof W.pbjTier === 'function' ? (W.pbjTier(1) - 1) / 29 : 0); bt.click();
    const bpm = (fr.contentWindow.MORCEAU && fr.contentWindow.MORCEAU.bpm) || 120;
    return { regle(m) { vit((m - 1) / 29); }, stop() { try { if (/stop/i.test(bt.textContent)) bt.click(); } catch (e) {} fr.remove(); }, bpm: () => bpm };
    } catch (e) { fr.remove(); throw e; }   // (la page n'est pas venue : l'iframe ne reste pas)
  }

  // ---------------------------------------------------------------- la chaîne : filtre de l'intro → niveau → bus des basses → la sortie du jeu
  function chaine(ac, sortie) {
    const f = ac.createBiquadFilter(), g = ac.createGain(), e = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = .6; g.gain.value = 0; e.gain.value = .937;
    f.connect(g); let d = g, bus = null;
    if (W.MUSBUS) { bus = W.MUSBUS.cree(ac); g.connect(bus.entree); d = bus.sortie; }
    d.connect(e); e.connect(sortie);
    return { f, g, e, bus, entree: f };
  }
  const t9 = (p, v, t, tau) => { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (x) {} };

  /* LE DÉPART (le JOUER) : le morceau tiré démarre au moteur 1, derrière le filtre fermé ; l'intro l'ouvre sur 2 mesures de SON tempo (2-4 s) */
  PB.depart = async function (ac, sortie, opt) {
    opt = opt || {}; PB.fin(false);
    const jeton = ++PB.n; PB.phase = 'charge'; PB.err = null; PB.ac = ac; let ch = null;
    try {
      await PB.charge(); if (jeton !== PB.n) return null;
      const E = (opt.meme && PB.dernier) || PB.tire(); if (!E) { PB.phase = 'vide'; return null; } PB.dernier = E;   // (la seconde chance : le MÊME morceau repart)
      ch = chaine(ac, sortie); if (ch.bus) { ch.bus.brut(!!opt.brut); ch.bus.piste('jeu:' + E.id); ch.bus.course(true); }
      const J = await (E.type === 'genv' ? joueurGen : E.type === 'paliers' ? joueurPaliers : joueurHtml)(ac, ch.entree, E);
      if (jeton !== PB.n) { J.stop(); try { ch.e.disconnect(); } catch (e) {} return null; }
      PB.E = E; PB.J = J; PB.ch = ch; PB.phase = 'intro';
      const mes = 240 / (J.bpm() || 120), T = Math.max(2, Math.min(4, 2 * mes)), t = ac.currentTime; PB.tIntro = t + T;
      ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(320, t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + T);
      if (opt.vite) PB.course();
      return E;
    } catch (e) { PB.err = String(e && e.message || e); if (jeton === PB.n) PB.phase = 'erreur'; if (ch) try { ch.e.disconnect(); } catch (x) {} return null; }   // (le jeu rend alors la course à la radio)
  };
  /* LA COURSE : l'intro finit (au plus vite si elle n'a pas fini), le morceau joue au moteur 1 et suit le moteur */
  PB.course = function () {
    const ch = PB.ch, ac = PB.ac; if (!ch || !ac) return;
    const t = ac.currentTime; if (PB.tIntro > t + .5) { ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(Math.max(320, ch.f.frequency.value), t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + .5); PB.tIntro = t + .5; }
    PB.phase = 'course';
  };
  PB.moteur = function (m) { if (PB.J) try { PB.J.regle(Math.max(1, Math.min(30, m | 0))); } catch (e) {} };
  PB.niveau = function (v) { if (PB.ch && PB.ac) { const g = PB.ch.g.gain; if (Math.abs((g._v9 == null ? -1 : g._v9) - v) > .003) { g._v9 = v; t9(g, Math.max(0, v), PB.ac.currentTime, .08); }
    if (PB.ch.bus && PB.ch.bus.tick) PB.ch.bus.tick(PB.J && PB.J.groupe ? PB.J.groupe() : null, Math.max(0, v)); } };   // (20/10) le dompteur de grosse caisse du bus (musique-bus.js) écoute à chaque image, avec le niveau
  PB.recul = function () { if (PB.ch && PB.ch.bus) PB.ch.bus.recul(-3, .4); };
  PB.joue = () => !!PB.J && (PB.phase === 'intro' || PB.phase === 'course');
  /* LA FIN : un fondu (la mort : plus court), puis tout s'éteint */
  PB.fin = function (vite) {
    PB.n++; const J = PB.J, ch = PB.ch, ac = PB.ac; PB.J = null; PB.ch = null; PB.E = null; PB.phase = 'repos';
    if (!J && !ch) return;
    const d = vite ? .35 : .9;
    try { if (ch && ac) t9(ch.g.gain, 0, ac.currentTime, d / 4); } catch (e) {}
    setTimeout(() => { try { if (J) J.stop(); } catch (e) {} setTimeout(() => { try { if (ch) ch.e.disconnect(); } catch (e) {} }, 600); }, d * 1000);
  };
  PB.etat = () => ({ phase: PB.phase, avance: PB.avance, montee: PB.montee || null, titre: PB.E && PB.E.titre, id: PB.E && PB.E.id, type: PB.E && PB.E.type, liste: PB.liste ? PB.liste.length : null, err: PB.err,
    filtre: PB.ch ? Math.round(PB.ch.f.frequency.value) : null, niveau: PB.ch ? +PB.ch.g.gain.value.toFixed(3) : null, bus: PB.ch && PB.ch.bus ? PB.ch.bus.etat() : null,
    moteur: PB.J && PB.J.inst ? PB.J.inst.tier : null });
  W.POUCE_JEU = PB;
})(window);
