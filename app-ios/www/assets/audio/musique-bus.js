


























(function (W) {
  'use strict';
  var PRESETS = {

    'musique-glisse': { sub: -7, bas: -2 },

    'paliers/rendus/ciel-30/': { sub: -3.5 }, 'boucles/pluie-neon--': { sub: -2, bas: -2 }, 'boucles/niv-altitude--': { sub: -2, bas: -2 }, 'boucles/neon-drive-2--': { sub: -1.5, bas: -2 },
    'boucles/vapeur-nuages': { bas: -2 }, 'boucles/vapeur-orage': { bas: -2 }, 'boucles/vapeur-ciel': { bas: -2 }, 'boucles/niv-altitude.m4a': { sub: -2.5, bas: -2 },
    'boucles/niv-neon-noir.m4a': { sub: -1 }, 'boucles/niv-metro': { bas: -2 }, 'boucles/niv-satellite': { sub: -5, bas: -2 }, 'boucles/niv-monstre': { bas: -2 },
    'boucles/neon-drive.m4a': { sub: -3, bas: -2 }, 'boucles/pluie-neon.m4a': { sub: -2, bas: -2 }, 'dark-triad': { bas: -2 }, 'boucles/caisse-enregistreuse': { sub: -1.5, bas: -2 },
    'boucles/garage-lofi': { sub: -3.5, bas: -2 }, 'boucles/hypervitesse': { bas: -1 }, 'french-touch': { bas: -2 },



    'jeu:bleu-1540': { bas: -2, kick: 12 }, 'jeu:bleu-9664': { bas: -2, kick: 12 }, 'jeu:bleu-3392': { bas: -2 }, 'jeu:bleu-8154': { bas: -2 }, 'jeu:bleu-8042': { bas: -2, kick: 12 },
    'jeu:bleu-5095': { bas: -2 }, 'jeu:bleu-6167': { bas: -1, kick: 12 }, 'jeu:bleu-2221': { bas: -.5, kick: 12 }, 'jeu:pal-neon-noir': { sub: -5, bas: -2 }, 'jeu:pal-aura-30': { bas: -2 },
    'jeu:bleu-6562': { kick: 12 }, 'jeu:bleu-4830': { kick: 12 }, 'jeu:bleu-1275': { kick: 12 }, 'jeu:bleu-6104': { kick: 12 }, 'jeu:pal-asphalte': { kick: 12 }
  };
  var KICK_OFF = /[?&]kick=0\b/.test(String((W.location && W.location.search) || ''));
  var MB = { PRESETS: PRESETS, FORCE: 1, CREUX: -2 };

  MB.presetDe = function (u) {
    var s = String(u || ''); for (var k in PRESETS) if (s.indexOf(k) >= 0) return { cle: k, sub: PRESETS[k].sub || 0, bas: PRESETS[k].bas || 0, kick: KICK_OFF ? 0 : PRESETS[k].kick || 0 };
    return { cle: '', sub: 0, bas: 0, kick: 0 };
  };
  function bq(ac, t, f, q, g) { var b = ac.createBiquadFilter(); b.type = t; b.frequency.value = f; if (q != null) b.Q.value = q; if (g != null) b.gain.value = g; return b; }
  function vers(p, v, t, tau) { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (e) { try { p.value = v; } catch (e2) {} } }
















  var DOMPTE = { fc: 130, demi: .0213, seuil: -24, ratio: 20, attaque: .001, relache: .08, avance: .006, crete: 3, prof: 9, basse: 4, prise: 15, tauR: .8, pas: .05, nB: 24 };
  function dompteur(ac) {
    var D = DOMPTE, sr = ac.sampleRate, M = Math.round(D.demi * sr), P = Math.floor(D.avance * sr), e = ac.createGain(), sm = ac.createGain();




    var ir = ac.createBuffer(1, 2 * M + 1, sr), h = ir.getChannelData(0), wc = 2 * D.fc / sr, sh = 0, n, k;
    for (n = -M; n <= M; n++) { k = (n === 0 ? wc : Math.sin(Math.PI * wc * n) / (Math.PI * n)) * (.42 + .5 * Math.cos(Math.PI * n / M) + .08 * Math.cos(2 * Math.PI * n / M)); h[n + M] = k; sh += k; }
    for (n = 0; n < h.length; n++) h[n] /= sh;
    var lp = ac.createConvolver(); lp.normalize = false; lp.buffer = ir;
    var d1 = ac.createDelay(.2), d2 = ac.createDelay(.05), inv = ac.createGain(), pre = ac.createGain(), dc = ac.createDynamicsCompressor(), post = ac.createGain();
    d1.delayTime.value = (M + P) / sr; d2.delayTime.value = P / sr; inv.gain.value = -1;
    dc.threshold.value = D.seuil; dc.knee.value = 0; dc.ratio.value = D.ratio; dc.attack.value = D.attaque; dc.release.value = D.relache;
    var mk = Math.pow(10, .6 * D.seuil * (1 - 1 / D.ratio) / 20);
    e.connect(d1); d1.connect(sm); e.connect(lp); lp.connect(d2); d2.connect(inv); inv.connect(sm); lp.connect(pre); pre.connect(dc); dc.connect(post); post.connect(sm);
    var r1 = bq(ac, 'highpass', 200, -5.33), r2 = bq(ac, 'highpass', 200, 2.32), r3 = bq(ac, 'lowpass', 8000, -3.01), aR = ac.createAnalyser(), aL = ac.createAnalyser();
    aR.fftSize = 2048; aL.fftSize = 512; e.connect(r1); r1.connect(r2); r2.connect(r3); r3.connect(aR); lp.connect(aL);
    var X = { e: e, s: sm, dc: dc, t: -1, r: null, ring: [], a: -40, teff: null, buf: new Float32Array(2048), bufL: new Float32Array(512) };





    var S = { t0: 0, v0: .01, t1: 0, v1: .01 };
    function val(t) { return t >= S.t1 ? S.v1 : t <= S.t0 ? S.v0 : S.v0 * Math.pow(S.v1 / S.v0, (t - S.t0) / (S.t1 - S.t0)); }
    function rampe(p, v0, v1, t0, t1) { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t0); else p.cancelScheduledValues(t0); p.setValueAtTime(v0, t0); p.exponentialRampToValueAtTime(v1, t1); }
    function gains(a, T) { X.a = a; var p1 = Math.pow(10, a / 20), k = Math.ceil((ac.currentTime + .02) * sr), n = Math.max(1, Math.round(T * sr)), t0 = (k + .25) / sr, t1 = (k + n + .25) / sr, v0 = val(t0);
      S = { t0: t0, v0: v0, t1: t1, v1: p1 }; rampe(pre.gain, v0, p1, t0, t1); rampe(post.gain, mk / v0, mk / p1, (k + P + .25) / sr, (k + n + P + .25) / sr); }
    pre.gain.value = .01; post.gain.value = 100 * mk; X.gains = gains;
    function pw(an, b) { an.getFloatTimeDomainData(b); var q = 0; for (var i = 0; i < b.length; i++) q += b[i] * b[i]; return q / b.length; }
    X.tick = function (plafond, g, niv) {
      var t = ac.currentTime; if (X.t >= 0 && t - X.t < D.pas) return; var dt = X.t < 0 ? D.pas : Math.min(.25, t - X.t); X.t = t;


      var nv = niv > 1e-4 ? niv : 1, ln = 20 * Math.log10(nv), pr = pw(aR, X.buf) / (nv * nv), pl = pw(aL, X.bufL) / (nv * nv);
      if (!(niv > 1e-4) && niv != null) return;
      if (pr < 1e-10 && pl < 1e-10) return;
      if (pr > 1e-10) X.r = X.r == null ? pr : X.r + (pr - X.r) * (1 - Math.exp(-dt / D.tauR));
      X.ring.push(10 * Math.log10(pl + 1e-20)); if (X.ring.length > D.nB) X.ring.shift();
      if (X.r == null) return;
      if (g && !g.kick && g.basse) { X.teff = null; if (X.a > -40) gains(-40, .15); return; }
      var tri = X.ring.slice().sort(function (a, b) { return a - b; }), med = tri[Math.floor(tri.length / 2)], haut = tri[tri.length - 1];
      var plaf = 10 * Math.log10(X.r) + plafond, trop = Math.max(0, haut - plaf);


      var teff = Math.max(plaf + D.crete * Math.max(0, 1 - trop / D.prof), g && !g.basse ? -200 : med + D.crete + D.basse, haut + D.crete - D.prise * D.ratio / (D.ratio - 1));
      teff += ln; X.teff = teff; gains(Math.max(-40, Math.min(40, D.seuil - teff)), .1);
    };
    return X;
  }

  MB.cree = function (ac) {
    var e = ac.createGain(), hp = bq(ac, 'highpass', 22, .7), sub = bq(ac, 'lowshelf', 65, null, 0), bas = bq(ac, 'peaking', 110, .9, 0), cr = bq(ac, 'peaking', 280, 1, 0), rc = ac.createGain(), s = ac.createGain();
    var m1 = bq(ac, 'peaking', 850, .9, 0), m2 = bq(ac, 'peaking', 1800, .9, 0);
    e.connect(hp); hp.connect(sub); sub.connect(bas); bas.connect(cr); cr.connect(m1); m1.connect(m2); m2.connect(rc); rc.connect(s);
    var B = { entree: e, sortie: s, cle: '', estBrut: false, enCourse: false, p: { cle: '', sub: 0, bas: 0, kick: 0 } }, K = null, kD = null, kM = null;
    function pose(tau) { var t = ac.currentTime, f = B.estBrut ? 0 : MB.FORCE; vers(sub.gain, B.p.sub * f, t, tau); vers(bas.gain, B.p.bas * f, t, tau);
      if (K) { var on = !!B.p.kick && f > 0; vers(kD.gain, on ? 0 : 1, t, tau); vers(kM.gain, on ? 1 : 0, t, tau); } }
    B.piste = function (u) { B.p = MB.presetDe(u); B.cle = B.p.cle;
      if (B.p.kick && !K) { K = dompteur(ac); kD = ac.createGain(); kM = ac.createGain(); var on = !B.estBrut && MB.FORCE > 0; kD.gain.value = on ? 0 : 1; kM.gain.value = on ? 1 : 0;
        bas.disconnect(cr); bas.connect(kD); kD.connect(cr); bas.connect(K.e); K.s.connect(kM); kM.connect(cr); }
      pose(.05); return B.p; };
    B.tick = function (g, niv) { B.g = g || null; if (K && B.p.kick && !B.estBrut && MB.FORCE > 0) K.tick(B.p.kick + 12 * (1 - MB.FORCE), g, niv); };
    B.brut = function (b) { B.estBrut = !!b; pose(.08); };
    B.force = function (f) { MB.FORCE = Math.max(0, Math.min(1.5, +f || 0)); pose(.08); };
    B.course = function (on) { on = !!on; if (on === B.enCourse) return; B.enCourse = on; vers(cr.gain, on ? MB.CREUX : 0, ac.currentTime, .1); };
 
    B.moteur = function (p, prof) { var t = ac.currentTime, d = (prof == null ? 3.5 : prof) * Math.max(0, Math.min(1, p || 0)); vers(m1.gain, -d, t, .25); vers(m2.gain, -d * .7, t, .25); };
    B.recul = function (db, d) { B.nRecul = (B.nRecul || 0) + 1; var t = ac.currentTime; vers(rc.gain, Math.pow(10, (db || -3) / 20), t, .01); try { rc.gain.setTargetAtTime(1, t + (d || .4), .13); } catch (x) {} };
    B._k = function () { return K; };
    B.etat = function () { return { cle: B.cle, brut: B.estBrut, force: MB.FORCE, sub: +sub.gain.value.toFixed(2), bas: +bas.gain.value.toFixed(2), kick: K ? { plafond: B.p.kick, actif: kM.gain.value > .5, joue: B.g, seuil: K.teff == null ? null : +K.teff.toFixed(1), pris: +K.dc.reduction.toFixed(1), avant: +K.a.toFixed(1) } : null, course: B.enCourse, creux: +cr.gain.value.toFixed(2), recul: +rc.gain.value.toFixed(2), nRecul: B.nRecul || 0 }; };
    return B;
  };
  MB.DOMPTE = DOMPTE; W.MUSBUS = MB;
})(window);
