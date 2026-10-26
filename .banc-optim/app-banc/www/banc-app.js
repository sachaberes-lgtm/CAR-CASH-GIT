/* BANC AUTONOME DE L'APP « CC BANC » (copie de banc, jamais livrée) — chargé juste après natif.js, AVANT le jeu.
   Au lancement : demande au Mac (serveur.mjs) le prochain scénario ; s'il est nouveau, le range, remet la sauvegarde de départ et recharge
   avec ses paramètres d'adresse ; sinon joue le scénario rangé (intro, menu, JOUER, course pilotée), relève chaque image et le temps JS de
   chaque image, puis renvoie le bilan au Mac et enchaîne. Sans réponse du Mac : rien (l'app reste un jeu normal). */
(function () {
  'use strict';
  var MAC = 'http://' + (window.__BANC_IP || '172.20.10.3') + ':8931/';
  var IPS = [window.__BANC_IP || '172.20.10.3']; for (var i9 = 2; i9 <= 14; i9++) if (IPS.indexOf('172.20.10.' + i9) < 0) IPS.push('172.20.10.' + i9);
  var SAUV = window.__BANC_SAUV || null;
  var P = window.Capacitor && Capacitor.Plugins;
  var H = P && P.CapacitorHttp;
  if (!H) return;
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; };
  var plan = null; try { plan = JSON.parse(ls('ccBancPlan') || 'null'); } catch (e) {}
  if (!ls('ccPerfRecOn')) ls('ccPerfRecOn', '1'); /* l'enregistreur de parties de PERF-PC (v876), toujours allumé dans la copie de banc */
  var rech = false;
  /* la page qui s'en va ne doit pas réécrire la sauvegarde de départ (écouteurs posés AVANT ceux du jeu) */
  ['pagehide', 'beforeunload', 'unload', 'visibilitychange', 'freeze'].forEach(function (t) {
    var f = function (e) { if (rech) e.stopImmediatePropagation(); };
    window.addEventListener(t, f, true); document.addEventListener(t, f, true);
  });
  var recharge = function (pl) {
    rech = true; ls('ccBancPlan', JSON.stringify(pl));
    if (SAUV && pl.sauv !== false) ls('cashcarSave', SAUV); else if (pl.sauv === false) ls('cashcarSave', null);
    ls('cashcarPalier', null);
    setTimeout(function () { location.replace('/' + (pl.params ? '?' + pl.params : '')); }, 30);
  };
  var cherche = function () { return Promise.all(IPS.map(function (ip) { return H.get({ url: 'http://' + ip + ':8931/ping', connectTimeout: 1500, readTimeout: 1500 }).then(function (r) { return r.status === 200 ? ip : null; }).catch(function () { return null; }); }))
    .then(function (L) { var ip = L.filter(Boolean)[0]; if (ip) MAC = 'http://' + ip + ':8931/'; return !!ip; }); };
  var envoie = function (chemin, data) { var f = function () { return H.post({ url: MAC + chemin, headers: { 'Content-Type': 'application/json' }, data: data, connectTimeout: 3000 }); };
    return f().catch(function () { return cherche().then(function (ok) { return ok ? f() : null; }); }).catch(function () {}); };
  var demande = function () {
    return cherche().then(function () { return H.get({ url: MAC + 'scenario?t=' + Date.now(), headers: { 'Cache-Control': 'no-cache' } }); }).then(function (r) {
      var s = typeof r.data === 'string' ? JSON.parse(r.data || 'null') : r.data; return s && s.id ? s : null;
    }).catch(function () { return null; });
  };
  /* 1 · le plan en cours s'applique tout de suite (l'adresse est lue par le jeu au démarrage) */
  var aJouer = plan && plan.etat === 'pret';
  if (aJouer) { plan.etat = 'en cours'; ls('ccBancPlan', JSON.stringify(plan)); }
  /* 2 · l'enregistreur : intervalle de chaque image + temps JS des rappels rAF de chaque image */
  var R = window.__banc = { t: [], js: [], ph: [], phase: 'charge', ev: [], perfs: [], t0: performance.now() };
  var raf0 = window.requestAnimationFrame.bind(window), jsI = 0, dern = 0;
  window.requestAnimationFrame = function (cb) {
    return raf0(function (ts) { var a = performance.now(); try { cb(ts); } finally { jsI += performance.now() - a; } });
  };
  (function f(n) { if (dern) { R.t.push(+(n - dern).toFixed(2)); R.js.push(+jsI.toFixed(2)); R.ph.push(R.phase); } jsI = 0; dern = n; raf0(f); })(performance.now());
  var ev = function (m) { R.ev.push(Math.round(performance.now()) + ' ' + m); };
  /* la sonde du JIT : le petit banc de PAL (≈7 ms sur A15 avec le compilateur rapide ; bien plus sans) */
  var sonde = function () { try { var N = 4096, a = new Float32Array(N), b = new Float32Array(N), m = 1e9;
    for (var r = 0; r < 4; r++) { var t0 = performance.now(), s = 0, h = 7;
      for (var k = 0; k < 120; k++) for (var i = 0; i < N; i++) { h = (Math.imul(h, 1103515245) + 12345) | 0; a[i] = (h >>> 8) * 5.96e-8; b[i] = a[i] * a[(i + 17) & 4095] + b[(i + 4095) & 4095] * .5; s += b[i]; }
      var d = performance.now() - t0; if (s === s && d < m) m = d; } return +m.toFixed(2); } catch (e) { return null; } };
  R.jit0 = sonde();
  window.addEventListener('error', function (e) { ev('ERREUR ' + (e.message || '') + ' ' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  envoie('vie', { plan: plan && plan.id, etat: plan && plan.etat, jit: R.jit0 });
  if (!aJouer) {
    /* pas de plan prêt : on demande au Mac ; un nouveau scénario → recharger avec lui */
    var go = function () { demande().then(function (s) { if (s && (!plan || plan.id !== s.id)) { s.etat = 'pret'; recharge(s); } }); };
    /* le DÉMARRAGE de cette page (souvent un lancement à froid de l'app) est relevé avant de demander le scénario */
    var tb = performance.now();
    (function att() { if (window.__gameReady || performance.now() - tb > 120000) {
      var nv = performance.getEntriesByType('navigation')[0] || {};
      envoie('vie', { demarrage: { pret: Math.round(performance.now()), dcl: Math.round(nv.domContentLoadedEventEnd || 0), charge: Math.round(nv.loadEventEnd || 0), jit: R.jit0, froid: !plan } });
      go(); } else setTimeout(att, 100); })();
    return;
  }
  ev('plan ' + plan.id + ' ' + (plan.params || ''));
  var dort = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var attend = function (f, ms) { var t = performance.now(); return new Promise(function (ok) { (function b() { var v = false; try { v = f(); } catch (e) {} if (v || performance.now() - t > ms) ok(v); else setTimeout(b, 150); })(); }); };
  var perf = function () { try { var s = window.dbgState && dbgState(); R.perfs.push({ t: Math.round(performance.now()), ph: R.phase, p: window.dbgPerf && dbgPerf(), q: window.dbgQual && (function (q) { return { k: q.k, dpr: q.dpr, bloom: q.bloom, ombre: q.ombre, allege: q.allege }; })(dbgQual()), go: s && s.gameOver, m: s && s.mode }); } catch (e) { ev('perf ' + e.message); } };
  (async function () {
    try {
      R.phase = 'charge';
      var pret = await attend(function () { return window.__gameReady; }, 120000);
      ev('gameReady ' + !!pret);
      R.pal = window.dbgPalier && (function (p) { return { n: p.n, src: p.src }; })(dbgPalier());
      R.phase = 'intro';
      for (var i = 0; i < 25 && document.getElementById('splash'); i++) { try { document.getElementById('splash').click(); } catch (e) {} await dort(800); }
      ev('intro passée ' + !document.getElementById('splash'));
      R.phase = 'menu';
      var iv = setInterval(perf, 2000);
      if (plan.bancInt) { try { localStorage.removeItem('ccBancDernier'); } catch (e) {} R.phase = 'bancInt';
        await attend(function () { try { var b = JSON.parse(localStorage.getItem('ccBancDernier') || 'null'); return b && b.fin; } catch (e) { return false; } }, (plan.menu || 300) * 1000); }
      else await dort((plan.menu || 12) * 1000);
      if (plan.course !== 0) {
        R.phase = 'depart';
        var b = [].slice.call(document.querySelectorAll('[data-m="play"]')).filter(function (e) { return e.getClientRects().length; })[0];
        ev('JOUER ' + !!b); if (b) b.click();
        if (window.dbgAuto) dbgAuto(1, 0, { nit: plan.nit == null ? 1 : plan.nit });
        await attend(function () { return document.body.classList.contains('play'); }, 30000);
        if (window.dbgAuto) dbgAuto(1, 0, { nit: plan.nit == null ? 1 : plan.nit });
        R.phase = 'course'; ev('course');
        if (plan.qual != null && window.dbgQual) { dbgQual(plan.qual); ev('qual figée ' + plan.qual); }
        if (plan.dpr != null && window.dbgDPR) { dbgDPR(plan.dpr); ev('dpr figée ' + plan.dpr); }
        if (plan.css) { var st9 = document.createElement('style'); st9.id = 'bancCss'; st9.textContent = plan.css; document.head.appendChild(st9); ev('css posée'); }
        if (plan.eval) { try { ev('eval → ' + JSON.stringify((0, eval)(plan.eval)).slice(0, 200)); } catch (e) { ev('eval ERREUR ' + e.message); } }
        var fin = performance.now() + (plan.course || 45) * 1000, coutPris = false;
        while (performance.now() < fin) {
          await dort(500);
          var st = window.dbgState && dbgState();
          if (!coutPris && performance.now() > fin - (plan.course || 45) * 500 && window.dbgCout) { coutPris = true; try { dbgCout(1); await dort(3000); R.cout = dbgCout(); dbgCout(0); } catch (e) { ev('cout ' + e.message); } }
          if (!R.anims && performance.now() > fin - (plan.course || 45) * 400) { try { R.anims = document.getAnimations().map(function (a) { var e = a.effect && a.effect.target, p = a.effect && a.effect.pseudoElement; return (a.animationName || a.transitionProperty || a.constructor.name) + ' @ ' + (e ? (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '')) : '?') + (p || '') + ' · ' + a.playState; }); } catch (e) { R.anims = ['ERREUR ' + e.message]; } }
          if (plan.portail && !R.portail && performance.now() > fin - (plan.course || 45) * 1000 + plan.portail.apres * 1000 && st && !st.gameOver) { try { R.portail = window.dbgPortail(plan.portail.d || 3000); ev('portail posé ' + JSON.stringify(R.portail)); R.phase = 'portail'; R.niv0 = window.dbgNiveau && JSON.stringify(dbgNiveau()).slice(0, 120); } catch (e) { ev('portail ' + e.message); } }
          if (plan.etapes) { var tc9 = (performance.now() - (fin - (plan.course || 45) * 1000)) / 1000;
            for (var ie = 0; ie < plan.etapes.length; ie++) { var E9 = plan.etapes[ie]; if (!E9.fait && tc9 >= E9.t) { E9.fait = 1; if (E9.phase) R.phase = E9.phase;
              if (E9.eval) { try { var rv = (0, eval)(E9.eval); ev('étape ' + (E9.phase || '') + ' → ' + JSON.stringify(rv).slice(0, 160)); envoie('vie', { etape: E9.phase, t: Math.round(tc9), r: String(rv).slice(0, 80) }); } catch (e) { ev('étape ' + (E9.phase || '') + ' ERREUR ' + e.message); envoie('vie', { etape: E9.phase, erreur: e.message }); } } } } }
          if (plan.fuite && st && !st.gameOver && performance.now() - (R.fT || 0) > plan.fuite.toutes * 1000) {
            R.fT = performance.now(); R.fk = (R.fk || 0) + 1;
            try { var co = dbgCout(); dbgCout(1); var sc = dbgScene(), ob = 0, me = 0, vis = 0, geoU = new Set(); sc.scene.traverse(function (o) { ob++; if (o.isMesh || o.isPoints || o.isLine) { me++; if (o.visible) vis++; if (o.geometry) geoU.add(o.geometry.uuid); } });
              var n9 = R.t.length, t9 = R.t.slice(Math.max(0, n9 - 120)), j9 = R.js.slice(Math.max(0, n9 - 120)), s9 = t9.slice().sort(function (a, b) { return a - b; });
              var m9 = { k: R.fk, t: Math.round(performance.now()), lieu: window.dbgNiveau ? dbgNiveau().lieu : null, niv: window.dbgNiveau ? dbgNiveau().niveau : null, geo: co.geo, tex: co.tex, progs: co.progs, calls: co.image && co.image.calls, tris: co.image && co.image.tris, objets: ob, maillages: me, visibles: vis, geoScene: geoU.size,
                med: s9.length ? +s9[s9.length >> 1].toFixed(1) : null, p90: s9.length ? +s9[Math.floor(s9.length * .9)].toFixed(1) : null, js: j9.length ? +(j9.reduce(function (a, b) { return a + b; }, 0) / j9.length).toFixed(1) : null, dpr: co.dpr, ql: co.ql, tas: (performance.memory && performance.memory.usedJSHeapSize) || null };
              (R.fuites = R.fuites || []).push(m9); envoie('vie', { fuite: m9 });
              if (R.fk <= plan.fuite.n) { dbgSaut(); dbgAuto(1, 0, { nit: plan.nit == null ? 1 : plan.nit }); }
            } catch (e) { ev('fuite ' + e.message); }
          }
          if (st && st.gameOver && plan.rejoue) { ev('mort → rejouer'); R.morts = (R.morts || 0) + 1; var ph9 = R.phase; R.phase = 'mort'; await dort(2500); try { dbgEco('rejouer'); } catch (e) { ev('rejouer ' + e.message); } await attend(function () { var s9 = dbgState(); return s9.started && !s9.gameOver; }, 15000); if (window.dbgAuto) dbgAuto(1, 0, { nit: plan.nit == null ? 1 : plan.nit }); R.phase = ph9; continue; }
          if (st && st.gameOver) { ev('mort'); R.phase = 'mort'; await dort(5000); break; }
        }
        if (window.dbgAuto) dbgAuto(0);
      }
      clearInterval(iv); perf();
      R.phase = 'fin';
      try { R.audio = window.dbgAudio && (function (a) { return { ac: a.ac || a.etat || null }; })(dbgAudio()); } catch (e) {}
      try { R.acoups = window.dbgPerf ? null : null; } catch (e) {}
      ev('fin');
      plan.etat = 'fait'; ls('ccBancPlan', JSON.stringify(plan));
      R.jit1 = sonde();
      await envoie('resultat', { id: plan.id, tag: plan.tag, params: plan.params, pal: R.pal, ev: R.ev, perfs: R.perfs, cout: R.cout, bancInt: (function(){try{return localStorage.getItem('ccBancDernier');}catch(e){return null;}})(), fuites: R.fuites, anims: R.anims, morts: R.morts, niv0: R.niv0, niv1: (function(){try{return window.dbgNiveau&&JSON.stringify(dbgNiveau()).slice(0,120);}catch(e){return null;}})(), audio: R.audio, t: R.t, js: R.js, ph: R.ph, ua: navigator.userAgent, jit: [R.jit0, R.jit1], gpu: (function(){try{var g=document.createElement('canvas').getContext('webgl');var x=g.getExtension('WEBGL_debug_renderer_info');return x?g.getParameter(x.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER);}catch(e){return null;}})(), vp: [innerWidth, innerHeight, devicePixelRatio] });
      /* le suivant */
      var s = await demande();
      if (s && s.id !== plan.id) { s.etat = 'pret'; recharge(s); }
    } catch (e) { ev('ERREUR banc ' + e.message); envoie('resultat', { id: plan.id, tag: plan.tag, erreur: String(e && e.stack || e), ev: R.ev }); }
  })();
})();
