/* ===== LA SONDE DES GELS (2026-11-10, Sacha : « un joueur neuf, cache de shaders vide, ne subit aucun gel de plus de 120 ms en course ») =====
   Injectée par pilote.cjs (--sonde) AVANT le jeu. Elle ne change rien au jeu : elle chronomètre.
   · les trous entre deux images (rAF) de plus de 120 ms, avec l'état du jeu (en course ou non, carte, s) ;
   · les appels WebGL qui font ATTENDRE le fil (liaison d'un programme lue en synchrone) : durée, pile d'appel ;
   · le nombre de programmes liés, et à quel moment (en course / hors course).
   ?sanskhr=1 : KHR_parallel_shader_compile est cachée au jeu (Safari d'avant 2024, vieux WebView).
   Lecture : window.__sondeGels() (JSON). */
(function () {
  if (window.__sondeGels) return;
  try { Error.stackTraceLimit = 60; } catch (e) {}
  var SANS_KHR = /[?&]sanskhr=1\b/.test(location.search);
  var S = { t0: performance.now(), trous: [], attentes: [], liens: 0, premiers: 0, liensCourse: 0, liensT: [], compiles: 0, sansKhr: SANS_KHR, contextes: 0, glErr: [] };
  function etat() { try { var d = window.dbgState && window.dbgState(); if (!d) return null; return { c: !!(d.started && !d.gameOver), s: Math.round(d.s), lv: d.level, pause: !!d.paused }; } catch (e) { return null; } }
  function carte() { try { var n = window.dbgNiveau && window.dbgNiveau(); return n ? n.lieu + ':' + n.ciel : ''; } catch (e) { return ''; } }
  /* les trous d'images */
  /* le JS de chaque image : toutes les fonctions données à requestAnimationFrame sont chronométrées (jsImg = ce que l'image précédente a coûté en JS) */
  var jsImg = 0, jsPrec = 0, nvx = 0, nvxPrec = 0, liensImg = 0, liensPrec = 0, raf0 = window.requestAnimationFrame;
  window.requestAnimationFrame = function (f) { return raf0.call(window, function (t) { var a = performance.now(); try { return f(t); } finally { jsImg += performance.now() - a; } }); };
  var tp = 0;
  function img(t) {
    jsPrec = jsImg; jsImg = 0; nvxPrec = nvx; nvx = 0; liensPrec = liensImg; liensImg = 0;
    if (tp && !document.hidden) { var dt = t - tp; if (dt > 120) { var e = etat(); S.trous.push({ t: Math.round(t - S.t0), ms: Math.round(dt), js: Math.round(jsPrec), nvx: nvxPrec, liens: liensPrec, course: e ? e.c : null, s: e ? e.s : null, lv: e ? e.lv : null, pause: e ? e.pause : null, carte: e && e.c ? carte() : '' }); } }
    tp = t; raf0.call(window, img);
  }
  raf0.call(window, img);
  /* les appels qui attendent la puce */
  function pile() { try { return String(new Error().stack).split('\n').slice(3, 22).map(function (l) { var m = /at (?:new )?([^\s(]+)?.*?:(\d+):\d+\)?$/.exec(l.trim()); return m ? (m[1] || '?') + ':' + m[2] : l.trim().slice(0, 40); }).join(' < '); } catch (e) { return ''; } }
  function enveloppe(P) {
    if (!P || P.__sondeGels) return; P.__sondeGels = true;
    ['getProgramParameter', 'getProgramInfoLog', 'getShaderParameter', 'getShaderInfoLog', 'getUniformLocation', 'getActiveUniform', 'getActiveAttrib', 'getAttribLocation', 'useProgram', 'drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'readPixels', 'finish', 'getError', 'clientWaitSync', 'getBufferSubData', 'texImage2D', 'texSubImage2D', 'checkFramebufferStatus'].forEach(function (n) {
      var f = P[n]; if (typeof f !== 'function') return;
      P[n] = function () {
        var a = performance.now(), r = f.apply(this, arguments), d = performance.now() - a;
        if (d > 8) { var e = etat(); S.attentes.push({ t: Math.round(a - S.t0), ms: Math.round(d), f: n, course: e ? e.c : null, pile: pile() }); }
        return r;
      };
    });
    var vus = new WeakSet(), up = P.useProgram; P.useProgram = function (p) { if (p && !vus.has(p)) { vus.add(p); nvx++; S.premiers++; } return up.apply(this, arguments); }; /* 1er emploi d'un programme : c'est là que la puce finit de le traduire */
    var lp = P.linkProgram; P.linkProgram = function () { var e = etat(); S.liens++; liensImg++; if (e && e.c) { S.liensCourse++; } S.liensT.push(Math.round(performance.now() - S.t0) * (e && e.c ? 1 : -1)); return lp.apply(this, arguments); };
    var cs = P.compileShader; P.compileShader = function () { S.compiles++; return cs.apply(this, arguments); };
    if (SANS_KHR) { var ge = P.getExtension; P.getExtension = function (n) { if (n === 'KHR_parallel_shader_compile') return null; return ge.apply(this, arguments); };
      var gs = P.getSupportedExtensions; P.getSupportedExtensions = function () { var L = gs.apply(this, arguments); return L ? L.filter(function (x) { return x !== 'KHR_parallel_shader_compile'; }) : L; }; }
  }
  try { enveloppe(WebGL2RenderingContext.prototype); } catch (e) {}
  try { enveloppe(WebGLRenderingContext.prototype); } catch (e) {}
  /* les tâches longues du fil HORS des images (minuteries, messages des Workers) : un trou sans JS d'image ni tâche longue vient d'ailleurs (la puce, la machine) */
  S.longues = [];
  try { new PerformanceObserver(function (L) { L.getEntries().forEach(function (x) { S.longues.push([Math.round(x.startTime - S.t0 + performance.timeOrigin * 0), Math.round(x.duration)]); }); }).observe({ entryTypes: ['longtask'] }); } catch (e) {}
  /* les minuteries longues (setTimeout) : qui a pris la main hors des images */
  S.minuteries = [];
  var st0 = window.setTimeout; window.setTimeout = function (f, d) { if (typeof f !== 'function') return st0.apply(window, arguments); var a = [].slice.call(arguments, 2); return st0.call(window, function () { var t = performance.now(); try { return f.apply(this, a); } finally { var ms = performance.now() - t; if (ms > 40) { var e = etat(); S.minuteries.push(Math.round(t - S.t0) + ' ' + Math.round(ms) + 'ms ' + (e && e.c ? 'COURSE ' : 'hors ') + (f.name || '') + ' ' + String(f).split(String.fromCharCode(10)).join(' ').slice(0, 110)); } } }, d); };
  var gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k) { var c = gc.apply(this, arguments); if (c && /webgl/.test(String(k))) { S.contextes++; if (!S.gl || (c.canvas && c.canvas.width > 8)) S.gl = c; } return c; };
  window.__sondeGels = function (court) {
    var e = etat(), enC = S.trous.filter(function (x) { return x.course && !x.pause; });
    enC.forEach(function (x) { var a = x.t - x.ms - 20, b = x.t + 20, s = 0; S.longues.forEach(function (l) { if (l[0] + l[1] > a && l[0] < b) s += l[1]; }); x.tache = s; });
    var o = { duree: Math.round((performance.now() - S.t0) / 1000), sansKhr: S.sansKhr, etat: e, carte: carte(), contextesWebGL: S.contextes, programmes: S.liens, liesEnCourse: S.liensCourse, shaders: S.compiles,
      trousEnCourse: enC, pireEnCourse: enC.reduce(function (m, x) { return Math.max(m, x.ms); }, 0), trousHorsCourse: S.trous.filter(function (x) { return !x.course; }).length,
      attentesEnCourse: S.attentes.filter(function (x) { return x.course; }), attentesHorsCourse: S.attentes.filter(function (x) { return !x.course; }).length, minuteries: S.minuteries.filter(function (x) { return /COURSE/.test(x); }) };
    if (court) { o.attentesEnCourse = o.attentesEnCourse.map(function (x) { return x.t + ' ' + x.ms + 'ms ' + x.f + ' ← ' + x.pile.split(' < ').filter(function (q, i, L) { return !/:6$|:37$/.test(q) || (i + 1 < L.length && !/:6$|:37$/.test(L[i + 1])); }).slice(0, 9).join('<'); }); o.trousEnCourse = enC.map(function (x) { return x.t + ' ' + x.ms + 'ms js=' + x.js + ' tache=' + x.tache + ' nvx=' + x.nvx + ' liens=' + x.liens + ' s=' + x.s + ' ' + x.carte; }); }
    return JSON.stringify(o);
  };
  /* l'erreur WebGL du contexte du jeu : le drapeau de getError() reste levé tant qu'il n'est pas lu — UNE lecture en fin d'essai dit si une erreur est née pendant tout l'essai, sans rien ralentir */
  window.__sondeGlErreur = function (provoque) { var g = S.gl; if (!g) return 'pas de contexte'; if (provoque) g.bindTexture(0x1234, null); var e = g.getError(); return e === 0 ? 'NO_ERROR' : '0x' + e.toString(16); };
  if (/[?&]sanspbo=1/.test(location.search)) { try { WebGL2RenderingContext.prototype.fenceSync = function () { throw new Error('sanspbo'); }; } catch (e) {} } /* ?sanspbo=1 : la relecture par tampon (engLit) est refusée → le jeu prend son repli sans PBO */
  window.__sondeGelsBrut = S;
})();
