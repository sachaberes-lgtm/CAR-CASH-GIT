/* SONDE DU SON (2026-11-05, DEBUG-TOTAL : « que le son ne fasse plus jamais de surprise ») — injectée AVANT le jeu par fumee-son.mjs
   (Page.addScriptToEvaluateOnNewDocument). Elle n'invente rien : elle enveloppe les API audio du navigateur et COMPTE.
   window.__SONBANC.etat() rend : les AudioContext créés (temps réel / hors ligne), les sources en cours (AudioBufferSourceNode,
   OscillatorNode… démarrées et pas finies), les longues boucles (musique probable) avec leur fichier d'origine, les <audio> qui jouent,
   le nombre de liaisons connect() vivantes, les promesses rejetées et les sons de la banque joués (CCSON.play). */
(function(){
  'use strict';
  if (window.__SONBANC) return;
  var S = window.__SONBANC = { ctx: [], hors: 0, crees: {}, sources: new Set(), medias: new Set(), liens: new Map(), rejets: [], plays: {}, nPlays: 0, urlDe: new WeakMap() };
  var AC0 = window.AudioContext || window.webkitAudioContext;
  if (AC0) {
    var W = function (o) { var c = o === undefined ? new AC0() : new AC0(o); S.ctx.push({ c: c, t: Math.round(performance.now()), pile: (new Error().stack || '').split('\n').slice(2, 4).join(' | ').replace(/\s+/g, ' ').slice(0, 240) }); return c; };
    W.prototype = AC0.prototype;
    try { Object.defineProperty(W, 'name', { value: 'AudioContext' }); } catch (e) {}
    window.AudioContext = W; if (window.webkitAudioContext) window.webkitAudioContext = W;
  }
  if (window.OfflineAudioContext) { var O0 = window.OfflineAudioContext; var WO = function (a, b, c) { S.hors++; return arguments.length === 1 ? new O0(a) : new O0(a, b, c); }; WO.prototype = O0.prototype; window.OfflineAudioContext = WO; }
  /* chaque create*() compté par type */
  var B = window.BaseAudioContext ? BaseAudioContext.prototype : (AC0 && AC0.prototype);
  if (B) Object.getOwnPropertyNames(B).forEach(function (k) {
    if (!/^create/.test(k)) return; var d = Object.getOwnPropertyDescriptor(B, k); if (!d || typeof d.value !== 'function') return;
    var f = d.value; B[k] = function () { if (!(window.OfflineAudioContext && this instanceof OfflineAudioContext)) S.crees[k] = (S.crees[k] || 0) + 1; return f.apply(this, arguments); };
  });
  /* le fichier d'origine d'un AudioBuffer : fetch → arrayBuffer → decodeAudioData */
  var f0 = window.fetch;
  if (f0) window.fetch = function (u) { var url = typeof u === 'string' ? u : (u && u.url) || ''; return f0.apply(this, arguments).then(function (r) { if (/\.(m4a|mp3|ogg|wav|aac|opus)(\?|$)/i.test(url)) { var ab = r.arrayBuffer.bind(r); r.arrayBuffer = function () { return ab().then(function (b) { S.urlDe.set(b, url.split('/').slice(-2).join('/')); return b; }); }; } return r; }); };
  var x0 = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; return x0.apply(this, arguments); };
  var xr = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response');
  if (xr && xr.get) Object.defineProperty(XMLHttpRequest.prototype, 'response', { get: function () { var v = xr.get.call(this); try { if (v instanceof ArrayBuffer && this.__u) S.urlDe.set(v, String(this.__u).split('/').slice(-2).join('/')); } catch (e) {} return v; }, configurable: true });
  if (B && B.decodeAudioData) { var dec = B.decodeAudioData; B.decodeAudioData = function (ab, ok, ko) {
    var url = S.urlDe.get(ab) || '?';
    var p = dec.call(this, ab, ok && function (buf) { try { S.urlDe.set(buf, url); } catch (e) {} ok(buf); }, ko);
    if (p && p.then) p.then(function (buf) { try { S.urlDe.set(buf, url); } catch (e) {} }, function (e) { S.rejets.push('decode ' + url + ' : ' + (e && e.message)); });
    return p; }; }
  /* les sources : démarrées → en cours jusqu'à 'ended' ou stop() */
  if (window.AudioScheduledSourceNode) { var P = AudioScheduledSourceNode.prototype, st = P.start, sp = P.stop;
    P.start = function () { var n = this; if (!(window.OfflineAudioContext && n.context instanceof OfflineAudioContext)) { S.sources.add(n); n.addEventListener('ended', function () { S.sources.delete(n); }); } return st.apply(this, arguments); };
    P.stop = function (t) { var n = this; var r = sp.apply(this, arguments); var c = n.context; if (!t || !c || t <= c.currentTime + .05) S.sources.delete(n); return r; }; }
  /* les liaisons vivantes (connect / disconnect) */
  /* (références FAIBLES : un nœud fini que plus rien ne tient doit pouvoir partir, sinon la sonde fabriquerait elle-même la fuite qu'elle cherche) */
  var cn = AudioNode.prototype.connect, dc = AudioNode.prototype.disconnect, WR = window.WeakRef, nbL = new WeakMap();
  AudioNode.prototype.connect = function (d) { if (!(window.OfflineAudioContext && this.context instanceof OfflineAudioContext)) { var s = nbL.get(this); if (!s) { s = new Set(); nbL.set(this, s); S.liens.set(WR ? new WR(this) : { deref: (n => () => n)(this) }, (this.constructor.name.replace('Node','') + ' ← ' + (new Error().stack || '').split('\n').slice(2, 5).map(function (l) { return l.replace(/^\s*at\s*/, '').replace(/\(?https?:\/\/[^/]+\//, '').replace(/\?[^:)]*/, '').replace(/\)$/, ''); }).join(' < ')).slice(0, 220)); } s.add(d); } return cn.apply(this, arguments); };
  AudioNode.prototype.disconnect = function (d) { var s = nbL.get(this); if (s) { if (d === undefined || typeof d === 'number') s.clear(); else s.delete(d); } return dc.apply(this, arguments); };
  /* les <audio> : play() les inscrit, l'état se lit au moment du relevé */
  var mp = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { S.medias.add(this); var p = mp.apply(this, arguments); var el = this; if (p && p.catch) p.catch(function (e) { S.rejets.push('play ' + ((el.currentSrc || el.src || '').split('/').pop()) + ' : ' + (e && e.name)); }); return p; };
  window.addEventListener('unhandledrejection', function (e) { var r = e.reason; S.rejets.push('promesse : ' + (r && (r.stack || r.message) || String(r)).slice(0, 200)); });
  /* les sons de la banque : CCSON.play enveloppé dès qu'il existe */
  var tEnv = setInterval(function () { var C = window.CCSON; if (!C || !C.play || C.play.__banc) return; var p = C.play; C.play = function (id) { S.nPlays++; S.plays[id] = (S.plays[id] || 0) + 1; return p.apply(this, arguments); }; C.play.__banc = 1; clearInterval(tEnv); }, 50);

  S.etat = function () {
    var rt = S.ctx.map(function (x) { return { etat: x.c.state, t: x.t, rate: x.c.sampleRate, pile: x.pile }; });
    var src = [], boucles = [];
    S.sources.forEach(function (n) {
      var b = n.buffer, url = b ? (S.urlDe.get(b) || '?') : null, dur = b ? b.duration : 0;
      var o = { type: n.constructor.name, url: url, dur: +dur.toFixed(1), boucle: !!n.loop, rate: n.playbackRate ? +n.playbackRate.value.toFixed(3) : null, ctx: S.ctx.findIndex(function (x) { return x.c === n.context; }) };
      src.push(o); if (b && (dur > 15 || (n.loop && dur > 6))) boucles.push(o);
    });
    var med = [];
    S.medias.forEach(function (e) { if (!e.paused && !e.ended) med.push({ src: (e.currentSrc || e.src || '').split('/').slice(-2).join('/'), vol: +e.volume.toFixed(2), muet: e.muted, t: +e.currentTime.toFixed(1), boucle: e.loop }); });
    var nl = 0, nn = 0, parPile = {}; S.liens.forEach(function (v, w) { var n = w.deref(); if (!n) { S.liens.delete(w); return; } var s = nbL.get(n); if (s && s.size) { nl += s.size; nn++; parPile[v] = (parPile[v] || 0) + 1; } });
    var typ = {}; src.forEach(function (o) { typ[o.type] = (typ[o.type] || 0) + 1; });
    return { contextes: rt, horsLigne: S.hors, sources: src.length, typesSources: typ, boucles: boucles, medias: med, liens: nl, noeudsLies: nn, parPile: parPile, crees: S.crees, rejets: S.rejets.slice(), nPlays: S.nPlays, plays: S.plays };
  };
})();
