












(function (W) {
  'use strict';
  const D = 'assets/audio/music/';
  const PERSO = { 'bleu-1540': { tout: D + 'direct/cavale-ultra-course.html' }, 'bleu-8338': { tout: D + 'direct/rubis-ultra.html' }, 'bleu-4830': { tout: D + 'direct/flamme-de-tonnerre.html' }, 'bleu-9664': { tout: D + 'direct/mirage.html' }, 'pal-asphalte': { tout: D + 'direct/asphalte-emeraude.html', ancien: D + 'direct/asphalte-emeraude-avant.html' }, 'pal-nuit-de-velours': { tout: D + 'direct/nuit-de-velours.html' }, 'bleu-6104': { tout: D + 'direct/tonnerre-deluxe.html' }, 'pal-neon-noir': { tout: D + 'direct/neon-noir.html' }, 'bleu-8154': { tout: D + 'direct/fire-prime.html' }, 'bleu-7299': { tout: D + 'direct/enseigne-de-jade.html' }, 'bleu-9551': { tout: D + 'direct/nenuphars-velours.html' }, 'bleu-6562': { tout: D + 'direct/pluie-d-argent.html' }, 'bleu-2221': { tout: D + 'direct/cobra-ultra.html' }, 'bleu-3379': { tout: D + 'direct/sauver-maman.html' }, 'pal-rubis-neon': { tout: D + 'direct/rubis-de-neon.html', ancien: D + 'direct/rubis-de-neon-avant.html' }, 'pal-aura-30': { tout: D + 'direct/aura-30.html', ancien: D + 'direct/aura-30-avant.html' }, 'bleu-1275': { tout: D + 'direct/feu-de-luxe.html' } };
  const EN_ATTENTE = {};
  const HTML = { 'pal-aura-30': ['AURA · 30 PALIERS', 'direct/aura-30.html'], 'pal-rubis-neon': ['RUBIS DE NÉON', 'direct/rubis-de-neon.html'], 'pal-asphalte': ['ASPHALTE D’ÉMERAUDE', 'direct/asphalte-emeraude.html'] };
  const DEFAUT = Object.keys(HTML);
  const GEN_VERSIONS = [['2026-10-14T00:16:50', 'v3-1'], ['2026-10-14T01:01:05', 'v3-3'], ['2026-10-14T01:46:19', 'v3-4'], ['2026-10-14T03:05:00', 'v3-7']];
  const versionDe = e => { if (e.v) return e.v; const t = String(e.date || ''); for (const [l, v] of GEN_VERSIONS) if (t < l) return v; return 'v3-9'; };
  const url = f => new URL(f, location.href).href;
  const script = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });





  const importe = async u => { try { return await import(u); } catch (e) {
    const r = await fetch(u); if (!r.ok) throw e;
    const b = URL.createObjectURL(new Blob([(await r.text()).split('import.meta.url').join(JSON.stringify(u))], { type: 'text/javascript' }));
    try { return await import(b); } finally { URL.revokeObjectURL(b); } } };






  const AVANCE = +((/[?&]avance=([\d.]+)/.exec(location.search) || [])[1]) || 1, AV_TXT = 'while (nextTime < now + .35)', MODS = {};
  const MONTEE_ANCIEN = /[?&]montee=ancien\b/.test(location.search);
  const importeAvance = u => { const K = u + '#' + (W.RYTHMIQUE ? W.RYTHMIQUE.cle() : 'o'); return MODS[K] || (MODS[K] = (async () => { try {
      const r = await fetch(u); if (!r.ok) throw new Error(u);
      const s = await r.text(); if (s.indexOf(AV_TXT) < 0) throw new Error('horloge introuvable');











      let s2 = s.split(AV_TXT).join('while (nextTime < now + ' + AVANCE + ')');
      if (!MONTEE_ANCIEN) { s2 = s2.split("riser: tpw(['souffle', 'ton'], W.riser)").join("riser: 'souffle'")
        .split("rp(['montee', 'trou', 'filtre']").join("rp(['montee', 'filtre']")
        .split("const W9 = Object.assign({}, M.C.trans), a = id =>").join("const W9 = Object.assign({}, M.C.trans, { trou: 0 }), a = id =>");




        s2 = s2.split("bt = M.build;").join("bt = (M.build === 'filtre' || M.build === 'dub') ? 'montee' : M.build;")
          .split("M.build = 'dub'; (M.journal").join("M.build = 'montee'; (M.journal")
          .split("else if (grand) { M.build = rp(['montee', 'filtre']").join("else if (grand) { M.build = 'montee'; void rp(['montee', 'filtre']");
        PB.montee = 'douce'; }
      else PB.montee = 'ancienne';




      s2 = s2.split('function ir(').join("function ir(...A9) { const K9 = JSON.stringify(A9) + '@' + ctx.sampleRate + '@' + " + JSON.stringify(u) + ", C9 = (globalThis.__ccIR || (globalThis.__ccIR = {})); return C9[K9] || (C9[K9] = irCalc(...A9)); }\n  function irCalc(");
      if (W.RYTHMIQUE) s2 = W.RYTHMIQUE.patch(s2); 
      const b = URL.createObjectURL(new Blob([s2.split('import.meta.url').join(JSON.stringify(u))], { type: 'text/javascript' }));
      try { const m = await import(b); PB.avance = AVANCE; return m; } finally { URL.revokeObjectURL(b); }
    } catch (e) { delete MODS[K]; PB.avance = .35; return importe(u); } })()); };




  const figeOn = () => (!!W.__ccAllege && !/[?&]musique=live\b/.test(location.search)) || /[?&]musique=fige\b/.test(location.search); 
  const note = (m) => { try { if (W.__ccNote) W.__ccNote('musique', m); } catch (e) {} };
  const PB = { avance: null, liste: null, E: null, J: null, ch: null, ac: null, phase: 'repos', err: null, tIntro: 0, n: 0, dernier: null };

  PB.charge = async function () {
    if (PB.liste) return PB.liste;
    const P = await (await fetch('musique-moteur.json', { cache: 'no-cache' })).json();
    let R = null; try { R = await importe(url(D + 'direct/retouches-bleu.js')); } catch (e) {}
    if (!W.PALIERS_RENDUS) try { await script(D + 'paliers/rendus/index.js'); } catch (e) {}
    if (!W.RYTHMIQUE) try { await script(D + 'ameliorees/rythmique.js'); } catch (e) {} 
    const suppr = new Set(P.suppr || []), place = P.place || {}, noms = P.noms || {}, RN = (R && R.RENOMS) || {}, V2 = (R && R.V2) || [], L = [], vu = new Set();
    (P.gen || []).forEach(e => { const id = 'bleu-' + e.n, k = e.n + '|' + e.titre; if (!(e.avis > 0) || suppr.has(id) || EN_ATTENTE[id] || vu.has(k)) return; vu.add(k);
      L.push({ id, type: 'genv', titre: noms[id] || RN[id] || e.titre, n: e.n, W: e.g || null, v: versionDe(e), da: e.da || 'cashcar', style: String(e.style || ''), lead: e.lead || '', keys: e.keys || '',
        ret: V2.find(d => d.base === e.n && d.direct) || null }); });
    const RF = W.PALIERS_RENDUS || {};
    Object.keys(place).forEach(id => { if (place[id] !== 'bleu' || suppr.has(id) || !/^pal-/.test(id) || EN_ATTENTE[id]) return; const f = RF[id.slice(4)];
      if (f && f.fichiers && f.fichiers.length) L.push({ id, type: 'paliers', titre: noms[id] || f.titre, fiche: f }); });
    DEFAUT.forEach(id => { if (suppr.has(id) || (place[id] && place[id] !== 'bleu') || EN_ATTENTE[id]) return;
      if (HTML[id]) L.push({ id, type: 'html', titre: noms[id] || HTML[id][0], f: D + HTML[id][1] }); });


    const AV = (R && R.AVANT) || {};
    L.forEach((E, i) => { const X = PERSO[E.id], A = AV[E.id];
      if (A && E.type === 'genv') E.avant = Object.assign({}, E, { ret: A, avant: null });
      if (X && X.tout) { L[i] = { id: E.id, type: 'html', titre: E.titre, f: X.tout, avant: E.avant || Object.assign({}, E, X.ancien ? { f: X.ancien } : {}, { avant: null }) }; }
      else if (X && X.course) { E.course = X.course; if (!E.avant) E.avant = Object.assign({}, E, { course: null, avant: null }); } });
    if (figeOn()) {
      if (!W.PALIERS_COURSE) try { await script(D + 'course/index.js'); } catch (e) { note('figée absente (' + (e && e.message || e) + ') : le direct'); }
      const PC = W.PALIERS_COURSE || {};
      L.forEach((E, i) => { const f = PC[E.id]; if (!f || !f.fichiers || !f.fichiers.length || E.type !== 'html') return; 
        L[i] = { id: E.id, type: 'paliers', figee: true, titre: E.titre, fiche: f, live: E, avant: E.avant }; });
    }




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
  PB.tire = function () {
    const L = PB.liste || []; if (!L.length) return null;
    const m = /[?&]pouce=([^&#]+)/.exec(location.search); if (m) { const v = decodeURIComponent(m[1]); const E = L.find(x => x.id === v || String(x.n) === v); if (E) return E; }
    let vus = []; try { vus = JSON.parse(localStorage.getItem('pbjVus') || '[]'); } catch (e) {}
    let reste = L.filter(x => vus.indexOf(x.id) < 0); if (!reste.length) { vus = []; reste = L.slice(); }
    const E = reste[Math.floor(Math.random() * reste.length)]; vus.push(E.id); try { localStorage.setItem('pbjVus', JSON.stringify(vus)); } catch (e) {} return E;
  };


  async function joueurGen(ac, dest, E, t0) {
    const f = E.v === 'actuelle' ? 'direct/musique-trente.js' : 'direct/musique-trente-' + E.v + '.js';
    const dep = E.ret && +E.ret.depart || 0, depG = k => Math.pow(10, dep * (1 - Math.min(1, Math.max(0, (k - 1) / 17))) / 20), gc = dep ? ac.createGain() : null;
    if (gc) { gc.gain.value = depG(1); gc.connect(dest); }
    const mod = await importeAvance(url(D + f)), inst = mod.createTrenteMusic({ audioContext: ac, destination: gc || dest, renouvelle: 0, da: E.da });
    const O = {}; if (/^hyb:/.test(E.style)) O.style = E.style;
    if (E.ret) { O.retouche = E.ret.retouche; O.voix = E.ret.voix; O.acc = E.ret.acc; }
    const m0 = t0 || (typeof W.pbjTier === 'function' ? W.pbjTier(1, E.id) : 1);
    inst.setTier(m0, 30); inst.start(E.n, E.W || undefined, O); let cur = m0;
    const on = k => { const b = inst._bus && inst._bus[k]; return !!b && b.gain.value > .01; };
    return { regle(m) { if (m !== cur) { cur = m; inst.setTier(m, 30); if (gc) gc.gain.setTargetAtTime(depG(m), ac.currentTime, .3); } }, stop() { try { inst.stop(); } catch (e) {} if (gc) setTimeout(() => { try { gc.disconnect(); } catch (e) {} }, 1500); }, bpm: () => inst.bpm || 120, inst,
      groupe() { try { return { kick: on('kick'), basse: on('basse') || on('basse2') || on('sub') }; } catch (e) { return null; } } };
  }
  async function joueurPaliers(ac, dest, E, t0) {
    if (!W.PalLecteur) await script('musique-paliers.js');
    const F = E.fiche, n = F.fichiers.length, L = W.PalLecteur(ac, dest), enCours = {}, deb = W.palDecoupe(n, F.moteurs), FIG = !!E.figee; L.nb = F.mesures || 8;
    const lit = f => fetch(f).then(r => { if (!r.ok) throw new Error(f); return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a));
 
    const juste = b => { if (!FIG || !F.N || b.length === F.N) return b; if (b.length < F.N) throw new Error('boucle trop courte ' + b.length + '/' + F.N);
      const c = ac.createBuffer(b.numberOfChannels, F.N, b.sampleRate); for (let k = 0; k < b.numberOfChannels; k++) c.getChannelData(k).set(b.getChannelData(k).subarray(0, F.N)); return c; };
    const gainDe = i => (FIG && F.gains && F.gains[i] != null) ? F.gains[i] : 1;
    const charge = i => { if (i < 0 || i >= n || L.buf[i] || enCours[i]) return; enCours[i] = lit(F.fichiers[i]).then(b => { L.buf[i] = juste(b); L.gain[i] = gainDe(i); }, e => { if (FIG) note('figée ' + E.id + ' p' + (i + 1) + ' : ' + (e && e.message || e)); }).then(() => { delete enCours[i]; }); };
 
    const lo = FIG ? (F.boucleS > 20 ? 0 : 1) : 1, hi = FIG ? 1 : 2;
    const garde = p => { for (let i = 0; i < n; i++) if (L.buf[i] && (i < p - lo || i > p + hi) && i !== L.palier() && i !== L.vers()) L.buf[i] = undefined; for (let i = p - lo; i <= p + hi; i++) charge(i); };
    L.buf[0] = juste(await lit(F.fichiers[0])); L.gain[0] = gainDe(0);
    if (FIG && F.intro && F.introMesures > 0) { try { L.intro = await lit(F.intro); L.nbIntro = F.introMesures; L.introGain = gainDe(0); } catch (e) { note('figée ' + E.id + ' intro : ' + (e && e.message || e)); } }
    L.demarre(0); garde(0);
    const SUR = (!FIG && W.RYTHMIQUE && W.RYTHMIQUE.on) ? W.RYTHMIQUE.surcouche(ac, dest, L, E.id) : null; 
    return { regle(m) { const p = W.palPalierDe(deb, m - 1); L.promeut(); garde(p); if (L.vers() !== p) L.vise(p); if (SUR) SUR.regle(m); }, stop() { try { L.stop(.3); } catch (e) {} if (SUR) SUR.stop(); }, bpm: () => F.bpm || 120, figee: FIG };
  }
 
  async function joueurFige(ac, dest, E, t0) {
    try { const J = await joueurPaliers(ac, dest, E, t0); note('figée ' + E.id); return J; }
    catch (e) { note('live (repli : ' + (e && e.message || e) + ') ' + E.id); if (!E.live) throw e; return joueurHtml(ac, dest, E.live, t0); }
  }
  const joueurDe = E => E.type === 'genv' ? joueurGen : E.type === 'paliers' ? (E.figee ? joueurFige : joueurPaliers) : joueurHtml;
  async function joueurHtml(ac, dest, E, t0, differe) {
    const fr = document.createElement('iframe'); fr.src = (W.RYTHMIQUE && W.RYTHMIQUE.on) ? await W.RYTHMIQUE.urlPage(E.f) : E.f;  fr.tabIndex = -1; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:0;bottom:0;width:8px;height:8px;opacity:0;pointer-events:none;border:0;z-index:-1'; document.body.appendChild(fr);
    try { await new Promise((ok, ko) => { fr.onload = ok; fr.onerror = ko; });





    const AV_H = Math.max(0, AVANCE - .4);
    const prete = new Proxy(ac, { get(t, k) { if (k === 'destination') return dest; if (k === 'close' || k === 'suspend') return () => Promise.resolve(); if (k === 'currentTime') return t.currentTime + AV_H;
      const v = Reflect.get(t, k, t); return typeof v === 'function' ? v.bind(t) : v; } });
    fr.contentWindow.AudioContext = fr.contentWindow.webkitAudioContext = function () { return prete; };
    const d = fr.contentDocument, bt = d.getElementById('play'), jg = d.getElementById('speed'); if (!bt || !jg) throw new Error('page sans #play / #speed');
    jg.step = 'any'; const vit = x => { jg.value = (x * 100).toFixed(1); jg.dispatchEvent(new fr.contentWindow.Event('input')); };
    const depart = () => { vit(t0 ? (t0 - 1) / 29 : typeof W.pbjTier === 'function' ? (W.pbjTier(1, E.id) - 1) / 29 : 0); bt.click(); };
    if (!differe) depart(); 
    const bpm = (fr.contentWindow.MORCEAU && fr.contentWindow.MORCEAU.bpm) || 120;
    return { lance: depart, regle(m) { vit((m - 1) / 29); }, stop() { try { if (/stop/i.test(bt.textContent)) bt.click(); } catch (e) {} fr.remove(); }, bpm: () => bpm };
    } catch (e) { fr.remove(); throw e; }
  }





  function irAmbiance(ac) {
    if (ac._irAmb) return ac._irAmb; const n = Math.floor(ac.sampleRate * 3.4), b = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let y = 0; for (let i = 0; i < n; i++) { const k = i / n; y += (.9 - .8 * Math.pow(k, .35)) * ((Math.random() * 2 - 1) - y); d[i] = y * Math.pow(1 - k, 2.4) * (k < .004 ? k / .004 : 1); } }
    return ac._irAmb = b;
  }
  function chaine(ac, sortie, ambiance) {
    const f = ac.createBiquadFilter(), g = ac.createGain(), e = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = .6; g.gain.value = 0; e.gain.value = .937;
    let hp = null, nt = null;
    if (ambiance) { hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 10; hp.Q.value = .7; nt = ac.createBiquadFilter(); nt.type = 'peaking'; nt.frequency.value = 900; nt.Q.value = 1; nt.gain.value = -4; f.connect(hp); hp.connect(nt); nt.connect(g); } else f.connect(g);
    let d = g, bus = null, conv = null, wet = null;
    if (ambiance) { conv = ac.createConvolver(); conv.buffer = irAmbiance(ac); wet = ac.createGain(); wet.gain.value = 0; (hp || f).connect(conv); conv.connect(wet); wet.connect(g); wet.gain.setTargetAtTime(ambiance, ac.currentTime, 1.2); }
    if (W.MUSBUS) { bus = W.MUSBUS.cree(ac); g.connect(bus.entree); d = bus.sortie; }
    d.connect(e); e.connect(sortie);
    return { f, g, e, bus, entree: f, conv, wet, hp, nt };
  }
  const t9 = (p, v, t, tau) => { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (x) {} };

 
  PB.depart = async function (ac, sortie, opt) {
    opt = opt || {};
    if (PB.phase === 'lobby' && PB.J && PB.E && !opt.meme) return PB.transforme(opt);
    PB.fin(false);
    const jeton = ++PB.n; PB.phase = 'charge'; PB.err = null; PB.ac = ac; let ch = null;
    try {
      await PB.charge(); if (jeton !== PB.n) return null;
      const E = (opt.meme && (PB.enCourse || PB.dernier)) || PB.tire(); if (!E) { PB.phase = 'vide'; return null; } PB.dernier = E;
      ch = chaine(ac, sortie); if (ch.bus) { ch.bus.brut(!!opt.brut); ch.bus.piste('jeu:' + E.id); ch.bus.course(true); }
      const Ej = E.course ? Object.assign({}, E, { type: 'html', f: E.course }) : E; 
      const J = await joueurDe(Ej)(ac, ch.entree, Ej);
      if (jeton !== PB.n) { J.stop(); try { ch.e.disconnect(); } catch (e) {} return null; }
      PB.E = E; PB.J = J; PB.ch = ch; PB.phase = 'intro';
      const mes = 240 / (J.bpm() || 120), T = (opt.doux && opt.doux[E.id]) ? 6 : Math.max(2, Math.min(4, 2 * mes)), t = ac.currentTime; PB.tIntro = t + T;
      ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(320, t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + T);
      if (opt.vite) PB.course();
      return E;
    } catch (e) { PB.err = String(e && e.message || e); if (jeton === PB.n) PB.phase = 'erreur'; if (ch) try { ch.e.disconnect(); } catch (x) {} return null; }
  };
 
  PB.lobby = async function (ac, sortie, opt) {
    opt = opt || {};
    if (PB.phase === 'lobby' && PB.J) return PB.E;
    if (PB.phase === 'charge' || PB.phase === 'intro' || PB.phase === 'course') return PB.E || null;
    const jeton = ++PB.n; PB.phase = 'charge'; PB.err = null; PB.ac = ac; let ch = null;
    try {
      await PB.charge(); if (jeton !== PB.n) return null;
      const E = PB.attente || PB.tire(); PB.attente = null; if (!E) { PB.phase = 'vide'; return null; }
      if (opt.fixes && E.type !== 'paliers') { PB.attente = E; PB.phase = 'repos'; return null; }
      PB.dernier = E;
      ch = chaine(ac, sortie, .5); ch.f.frequency.setValueAtTime(2400, ac.currentTime); ch.f.Q.value = .7; if (ch.hp) ch.hp.frequency.setValueAtTime(220, ac.currentTime);
      try { const l = ac.createOscillator(), lg = ac.createGain(); l.type = 'sine'; l.frequency.value = .07; lg.gain.value = 400; l.connect(lg); lg.connect(ch.f.frequency); l.start(); ch.lfo = { o: l, g: lg }; } catch (e) {}
      if (ch.bus) { ch.bus.brut(!!opt.brut); ch.bus.piste('lobby:' + E.id); ch.bus.course(false); }
      const tl = (opt.tiers && opt.tiers[E.id]) || opt.tier || 0;


      const J = await joueurDe(E)(ac, ch.entree, E, 1);
      if (jeton !== PB.n) { J.stop(); try { ch.e.disconnect(); } catch (e) {} return null; }
      PB.E = E; PB.J = J; PB.ch = ch; PB.phase = 'lobby'; PB.tier0 = tl; PB.tLobby = ac.currentTime; PB.doux = !!(opt.doux && opt.doux[E.id]);
      for (let m = 2; m <= tl; m++) setTimeout(() => { if (PB.phase === 'lobby' && PB.J === J) { try { J.regle(m); } catch (e) {} } }, 1500 + 2500 * (m - 1));
      if (E.course) { const pre = { v: null, p: null }; PB.pre = pre; 
        pre.p = (async () => { const ch2 = chaine(ac, sortie); const J2 = await joueurHtml(ac, ch2.entree, Object.assign({}, E, { type: 'html', f: E.course }), 0, true); return { ch: ch2, J: J2 }; })();
        pre.p.then(v => { pre.v = v; if (PB.pre !== pre) { try { v.J.stop(); v.ch.e.disconnect(); } catch (e) {} } }, () => { if (PB.pre === pre) PB.pre = null; }); }
      return E;
    } catch (e) { PB.err = String(e && e.message || e); if (jeton === PB.n) PB.phase = 'erreur'; if (ch) try { ch.e.disconnect(); } catch (x) {} return null; }
  };
    const boumDe = (ch, ac, t, opt) => {
    if (opt.boum > 0) { try {
      const k = opt.boum, o = ac.createOscillator(), og = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(34, t + .55);
      og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(.34 * k, t + .012); og.gain.exponentialRampToValueAtTime(.0002, t + .75); o.connect(og); og.connect(ch.e); o.start(t); o.stop(t + .8);
      const nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = nb; nf.type = 'bandpass'; nf.Q.value = .9;
      nf.frequency.setValueAtTime(500, t); nf.frequency.exponentialRampToValueAtTime(9000, t + .5); ng.gain.setValueAtTime(.0001, t); ng.gain.exponentialRampToValueAtTime(.14 * k, t + .04); ng.gain.exponentialRampToValueAtTime(.0002, t + .6);
      ns.connect(nf); nf.connect(ng); ng.connect(ch.e); ns.start(t); ns.stop(t + .7);
    } catch (e) {} }
  };
 
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
 
  PB.transforme = function (opt) {
    opt = opt || {};
    if (PB.E && PB.E.course && PB.pre && PB.pre.v && PB.phase === 'lobby') return PB.bascule(opt);  const ch = PB.ch, ac = PB.ac, E = PB.E; if (!ch || !ac || !E) return null;
    const t = ac.currentTime, T = PB.doux ? 3.2 : .5;
    try { ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(Math.max(300, ch.f.frequency.value), t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + T); } catch (e) {}
    if (ch.hp) t9(ch.hp.frequency, 10, t, .25);
    if (ch.nt) t9(ch.nt.gain, 0, t, .25);
    if (ch.lfo) { try { ch.lfo.g.gain.setTargetAtTime(0, t, .1); ch.lfo.o.stop(t + 1); } catch (e) {} ch.lfo = null; }
    if (ch.wet) { t9(ch.wet.gain, 0, t, .12); setTimeout(() => { try { ch.conv.disconnect(); ch.wet.disconnect(); } catch (e) {} }, 3500); }
    boumDe(ch, ac, t, opt);
    if (ch.bus) { try { ch.bus.brut(!!opt.brut); ch.bus.piste('jeu:' + E.id); ch.bus.course(true); } catch (e) {} }
    try { PB.J.regle(typeof W.pbjTier === 'function' ? W.pbjTier(1, E.id) : 6); } catch (e) {}
    PB.tier0 = 0; PB.tIntro = t + T; PB.phase = 'course'; PB.enCourse = E;
    return E;
  };
 
  PB.course = function () {
    const ch = PB.ch, ac = PB.ac; if (!ch || !ac) return;
    const t = ac.currentTime; if (PB.tIntro > t + .5) { ch.f.frequency.cancelScheduledValues(t); ch.f.frequency.setValueAtTime(Math.max(320, ch.f.frequency.value), t); ch.f.frequency.exponentialRampToValueAtTime(18000, t + .5); PB.tIntro = t + .5; }
    PB.phase = 'course'; PB.enCourse = PB.E; 
  };
  PB.moteur = function (m) { if (PB.J) try { PB.J.regle(Math.max(1, Math.min(30, m | 0))); } catch (e) {} };
  PB.niveau = function (v) { if (PB.ch && PB.ac) { if (PB.phase === 'lobby' && PB.tLobby != null) { const k = Math.min(1, Math.max(0, (PB.ac.currentTime - PB.tLobby) / 4)); v *= k * k * (3 - 2 * k); }
    const g = PB.ch.g.gain; if (Math.abs((g._v9 == null ? -1 : g._v9) - v) > .003) { g._v9 = v; t9(g, Math.max(0, v), PB.ac.currentTime, .08); }
    if (PB.ch.bus && PB.ch.bus.tick) PB.ch.bus.tick(PB.J && PB.J.groupe ? PB.J.groupe() : null, Math.max(0, v)); } };
  PB.recul = function () { if (PB.ch && PB.ch.bus) PB.ch.bus.recul(-3, .4); };
  PB.joue = () => !!PB.J && (PB.phase === 'intro' || PB.phase === 'course');
 
  PB.fin = function (vite) {
    const pre = PB.pre; PB.pre = null; if (pre) pre.p.then(v => { try { v.J.stop(); v.ch.e.disconnect(); } catch (e) {} }, () => {});
    PB.n++; const J = PB.J, ch = PB.ch, ac = PB.ac; PB.J = null; PB.ch = null; PB.E = null; PB.phase = 'repos';
    if (!J && !ch) return;
    const d = vite ? .35 : .9;
    if (ch && ch.lfo) { try { ch.lfo.o.stop(); } catch (e) {} ch.lfo = null; }
    try { if (ch && ac) t9(ch.g.gain, 0, ac.currentTime, d / 4); } catch (e) {}
    setTimeout(() => { try { if (J) J.stop(); } catch (e) {} setTimeout(() => { try { if (ch) ch.e.disconnect(); } catch (e) {} }, 600); }, d * 1000);
  };
  PB.etat = () => ({ phase: PB.phase, avance: PB.avance, montee: PB.montee || null, titre: PB.E && PB.E.titre, id: PB.E && PB.E.id, type: PB.E && PB.E.type, figee: !!(PB.E && PB.E.figee && PB.J && PB.J.figee), liste: PB.liste ? PB.liste.length : null, err: PB.err,
    filtre: PB.ch ? Math.round(PB.ch.f.frequency.value) : null, niveau: PB.ch ? +PB.ch.g.gain.value.toFixed(3) : null, bus: PB.ch && PB.ch.bus ? PB.ch.bus.etat() : null,
    moteur: PB.J && PB.J.inst ? PB.J.inst.tier : null });
  W.POUCE_JEU = PB;
})(window);
