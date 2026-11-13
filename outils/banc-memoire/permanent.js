/* LE TRAVAIL PERMANENT (2026-11-13, ios-aide, pour la chaleur) — posé AVANT le jeu (memoire.cjs --perm 1).
   Compte et chronomètre ce qui tourne sans arrêt : rappels requestAnimationFrame (par fonction), setTimeout / setInterval (par fonction : nombre, ms),
   écouteurs d'événements fréquents ; window.__permRaz() remet à zéro, window.__permLit() rend le bilan par seconde depuis la remise à zéro,
   avec les animations CSS en cours (infinies, leur élément et sa surface) et l'état des contextes Web Audio (nœuds créés par type). */
(function () {
  'use strict';
  const P = window.__perm = { t0: performance.now(), raf: new Map(), to: new Map(), iv: new Map(), ev: new Map(), ac: [], nodes: new Map() };
  const nom = f => { const n = (f && f.name) || ''; if (n) return n; const s = String(f).slice(0, 70).replace(/\s+/g, ' '); return s; };
  const compte = (M, k, d) => { const e = M.get(k) || [0, 0]; e[0]++; e[1] += d; M.set(k, e); };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) { const k = nom(cb); return raf(function (t) { const a = performance.now(); try { return cb(t); } finally { compte(P.raf, k, performance.now() - a); } }); };
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  window.setTimeout = function (cb, ms, ...r) { if (typeof cb !== 'function') return st(cb, ms, ...r); const k = nom(cb) + ' @' + (ms | 0); return st(function () { const a = performance.now(); try { return cb.apply(this, arguments); } finally { compte(P.to, k, performance.now() - a); } }, ms, ...r); };
  window.setInterval = function (cb, ms, ...r) { if (typeof cb !== 'function') return si(cb, ms, ...r); const k = nom(cb) + ' @' + (ms | 0); return si(function () { const a = performance.now(); try { return cb.apply(this, arguments); } finally { compte(P.iv, k, performance.now() - a); } }, ms, ...r); };
  const ael = EventTarget.prototype.addEventListener;
  const FREQ = /^(scroll|resize|pointermove|touchmove|mousemove|timeupdate|message|visibilitychange|deviceorientation|devicemotion)$/;
  EventTarget.prototype.addEventListener = function (type, fn, o) {
    if (!FREQ.test(type) || typeof fn !== 'function') return ael.call(this, type, fn, o);
    const k = type + ' ' + nom(fn), w = function () { const a = performance.now(); try { return fn.apply(this, arguments); } finally { compte(P.ev, k, performance.now() - a); } };
    fn.__permW = w; return ael.call(this, type, w, o);
  };
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      const B = Object.getPrototypeOf(AC.prototype);
      for (const m of Object.getOwnPropertyNames(B).concat(Object.getOwnPropertyNames(AC.prototype))) {
        if (!/^create/.test(m)) continue; const P0 = AC.prototype[m] ? AC.prototype : B; const f = P0[m]; if (typeof f !== 'function') continue;
        P0[m] = function () { compte(P.nodes, m, 0); return f.apply(this, arguments); };
      }
      window.AudioContext = new Proxy(AC, { construct(T, a) { const c = new T(...a); P.ac.push(c); return c; } });
    }
  } catch (e) {}
  window.__permRaz = function () { P.t0 = performance.now(); for (const M of [P.raf, P.to, P.iv, P.ev]) M.clear(); return 'ok'; };
  window.__permLit = function () {
    const s = (performance.now() - P.t0) / 1000, L = M => Array.from(M.entries()).map(e => [e[0], +(e[1][0] / s).toFixed(1), +(e[1][1] / s).toFixed(2)]).sort((a, b) => b[2] - a[2] || b[1] - a[1]).slice(0, 25);
    let anims = [];
    try {
      anims = document.getAnimations().filter(a => a.playState === 'running').map(a => {
        const el = a.effect && a.effect.target, r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null, t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
        const vis = el ? getComputedStyle(el) : null;
        return { nom: a.animationName || a.transitionProperty || a.constructor.name, el: el ? (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')) : '?', infini: t.iterations === Infinity, surface: r ? Math.round(r.width * r.height) : 0, visible: !!(vis && vis.visibility !== 'hidden' && vis.display !== 'none' && +vis.opacity > 0 && r && r.width > 0) };
      });
    } catch (e) {}
    return { secondes: +s.toFixed(1), raf: L(P.raf), timeout: L(P.to), interval: L(P.iv), evenements: L(P.ev),
      animations: anims, audio: P.ac.map(c => ({ etat: c.state, sr: c.sampleRate, t: +c.currentTime.toFixed(1) })), noeudsCrees: Array.from(P.nodes.entries()).map(e => [e[0], e[1][0]]) };
  };
})();
