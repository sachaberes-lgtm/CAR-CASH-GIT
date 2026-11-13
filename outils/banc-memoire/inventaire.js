/* L'INVENTAIRE DE LA MÉMOIRE (2026-11-13, ios-aide) — posé AVANT le jeu (addInitScript du banc WebKit, ou collé en tête de page).
   Il note, sans rien garder en vie (WeakRef), tout ce que la page crée de gros côté JavaScript :
   · les BufferGeometry (piège sur window.THREE puis sur THREE.BufferGeometry : setAttribute / setIndex les inscrit) ;
   · les toiles 2D (getContext('2d')) ; les tampons audio (decodeAudioData, createBuffer) ; les ImageBitmap.
   window.__memInv() rend l'inventaire : octets des tableaux JS des géométries vivantes (tampons uniques), dans la scène ou non,
   par nom de matière / d'objet ; toiles ; audio. Ce que la page tient vraiment se lit au processus (footprint), pas ici. */
(function () {
  'use strict';
  const R = window.__memReg = { geos: new Set(), toiles: new Set(), audio: new Set(), bitmaps: new Set(), nGeo: 0 };
  const WR = typeof WeakRef === 'function' ? (o => new WeakRef(o)) : (o => ({ deref: () => o }));
  function pile() { /* (window.__memPile, banc) qui a créé l'objet : les 2 premières fonctions du JEU sur la pile (un fichier servi, pas three) */
    const L = String(new Error().stack || '').split('\n'), out = [];
    for (const l of L) { if (!/https?:/.test(l) || /three\.min\.js/.test(l)) continue;
      const m = /^([^@]*)@https?:\/\/[^\/]+\/([^:?]*)[^:]*:(\d+):\d+$/.exec(l.trim());
      out.push(m ? (m[1] || 'anon') + (m[2] === 'index.html' ? '' : '/' + m[2]) + ':' + m[3] : l.trim().slice(0, 50)); if (out.length >= 3) break; }
    return out.join(' < ') || '?'; }
  function inscrit(set, o) { if (!o || o.__memR) return; try { Object.defineProperty(o, '__memR', { value: WR(o), enumerable: false }); if (window.__memPile) Object.defineProperty(o, '__memP', { value: pile(), enumerable: false }); } catch (e) { return; } set.add(o.__memR); }
  function patchBG(BG) {
    if (!BG || BG.__memPatch) return; BG.__memPatch = true;
    const sa = BG.prototype.setAttribute, si = BG.prototype.setIndex;
    BG.prototype.setAttribute = function (n, a) { inscrit(R.geos, this); R.nGeo++; return sa.call(this, n, a); };
    BG.prototype.setIndex = function (i) { inscrit(R.geos, this); return si.call(this, i); };
  }
  let T0;
  try {
    Object.defineProperty(window, 'THREE', { configurable: true, enumerable: true, get() { return T0; }, set(v) {
      T0 = v; if (!v) return;
      if (v.BufferGeometry) { patchBG(v.BufferGeometry); return; }
      let bg; Object.defineProperty(v, 'BufferGeometry', { configurable: true, enumerable: true, get() { return bg; }, set(x) { bg = x; patchBG(x); } });
    } });
  } catch (e) { R.err = 'THREE : ' + e.message; }
  try {
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, o) { const c = gc.call(this, t, o); if (c && (t === '2d' || t === 'bitmaprenderer')) inscrit(R.toiles, this); return c; };
  } catch (e) {}
  try {
    const AC = window.AudioContext || window.webkitAudioContext, B = AC && Object.getPrototypeOf(AC.prototype);
    const P = B && B.decodeAudioData ? B : AC && AC.prototype;
    if (P) {
      const dad = P.decodeAudioData, cb = P.createBuffer;
      P.decodeAudioData = function (buf, ok, ko) {
        const ok2 = ok && function (b) { inscrit(R.audio, b); return ok.apply(this, arguments); };
        const p = dad.call(this, buf, ok2, ko); if (p && p.then) return p.then(b => { inscrit(R.audio, b); return b; }); return p;
      };
      P.createBuffer = function () { const b = cb.apply(this, arguments); inscrit(R.audio, b); return b; };
    }
  } catch (e) {}
  try { const cib = window.createImageBitmap; if (cib) window.createImageBitmap = function () { return cib.apply(this, arguments).then(b => { inscrit(R.bitmaps, b); return b; }); }; } catch (e) {}

  function octetsAttr(a, vus) {
    if (!a) return 0; const arr = a.isInterleavedBufferAttribute ? a.data && a.data.array : a.array; if (!arr || !arr.buffer) return 0;
    if (vus.has(arr.buffer)) return 0; vus.add(arr.buffer); return arr.buffer.byteLength;
  }
  function octetsGeo(g, vus) {
    let n = 0; const A = g.attributes || {}; for (const k in A) n += octetsAttr(A[k], vus);
    const M = g.morphAttributes || {}; for (const k in M) for (const a of M[k] || []) n += octetsAttr(a, vus);
    n += octetsAttr(g.index, vus); return n;
  }
  window.__memInv = function (o) {
    o = o || {}; const vus = new Set(), dansScene = new Set(), nomDe = new Map();
    let sc = null; try { sc = window.dbgScene && window.dbgScene().scene; } catch (e) {}
    if (sc) sc.traverse(function (x) { if (x.geometry) { dansScene.add(x.geometry); if (!nomDe.has(x.geometry)) nomDe.set(x.geometry, x.name || (x.material && x.material.name) || x.type); } });
    const out = { geo: { vivantes: 0, oct: 0, scene: { n: 0, oct: 0 }, horsScene: { n: 0, oct: 0 }, jamaisDessinees: 0, sansTableau: 0 }, top: [] };
    const parNom = new Map(), vusS = new Set();
    for (const r of Array.from(R.geos)) {
      const g = r.deref(); if (!g) { R.geos.delete(r); continue; }
      out.geo.vivantes++;
      const b = octetsGeo(g, vus); out.geo.oct += b;
      const ds = dansScene.has(g); const z = ds ? out.geo.scene : out.geo.horsScene; z.n++; z.oct += b;
      if (!b) out.geo.sansTableau++;
      const nm = (ds ? 'S ' : '· ') + (g.__memP ? g.__memP + ' ' : '') + (nomDe.get(g) || g.name || g.type || '?'); const e = parNom.get(nm) || { n: 0, oct: 0 }; e.n++; e.oct += b; parNom.set(nm, e);
    }
    out.top = Array.from(parNom.entries()).sort((a, b) => b[1].oct - a[1].oct).slice(0, o.top || 25).map(e => [e[0], e[1].n, +(e[1].oct / 1048576).toFixed(1)]);
    let tO = 0, tN = 0; const tG = [];
    for (const r of Array.from(R.toiles)) { const c = r.deref(); if (!c) { R.toiles.delete(r); continue; } tN++; const b = c.width * c.height * 4; tO += b; if (b > 1048576) tG.push([c.id || c.className || 'toile', c.width + 'x' + c.height, c.isConnected ? 'DOM' : 'hors DOM', c.__memP || '']); }
    let aO = 0, aN = 0, aS = 0, aSt = 0; const aP = new Map();
    for (const r of Array.from(R.audio)) { const b = r.deref(); if (!b) { R.audio.delete(r); continue; } aN++; const o9 = b.length * b.numberOfChannels * 4; aO += o9; aS += b.duration; if (b.numberOfChannels > 1) aSt += o9;
      const k = (b.__memP || '?') + ' ' + b.sampleRate + 'Hz ' + b.numberOfChannels + 'c'; const e = aP.get(k) || [0, 0]; e[0]++; e[1] += o9; aP.set(k, e); }
    let bO = 0, bN = 0;
    for (const r of Array.from(R.bitmaps)) { const b = r.deref(); if (!b) { R.bitmaps.delete(r); continue; } if (!b.width) continue; bN++; bO += b.width * b.height * 4; }
    const Mo = x => +(x / 1048576).toFixed(1);
    out.geo.oct = Mo(out.geo.oct); out.geo.scene.oct = Mo(out.geo.scene.oct); out.geo.horsScene.oct = Mo(out.geo.horsScene.oct); out.geo.creees = R.nGeo;
    out.toiles = { n: tN, Mo: Mo(tO), grandes: tG.slice(0, 12) };
    out.audio = { n: aN, Mo: Mo(aO), secondes: Math.round(aS), stereoMo: Mo(aSt), par: Array.from(aP.entries()).sort((a, b) => b[1][1] - a[1][1]).slice(0, 8).map(e => [e[0], e[1][0], Mo(e[1][1])]) };
    out.bitmaps = { n: bN, Mo: Mo(bO) };
    try { const i = window.dbgScene().rdr.info; out.rendu = { geos: i.memory.geometries, textures: i.memory.textures, programmes: i.programs ? i.programs.length : null }; } catch (e) {}
    try { out.photos = window.dbgPhotoMem && window.dbgPhotoMem(); } catch (e) {}
    try { const s = window.dbgState && window.dbgState(); out.etat = s && { started: s.started, gameOver: s.gameOver, mode: s.mode, s: Math.round(s.s || 0) }; } catch (e) {}
    try { const n = window.dbgNiveau && window.dbgNiveau(); out.carte = n && (n.carte || n.piste || n.nom || JSON.stringify(n).slice(0, 80)); } catch (e) {}
    return out;
  };
})();
