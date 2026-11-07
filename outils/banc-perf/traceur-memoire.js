/* traceur-memoire.js (2026-11-07, Perf 3 — P1) : injecté par `memoire.py --trace` AVANT le jeu (Page.addScriptToEvaluateOnNewDocument). Ne change rien au jeu.
   Il se pose sur THREE à sa première lecture, puis :
     · GÉOMÉTRIES / TEXTURES : three s'abonne à leur événement « dispose » à leur 1er envoi au GPU → addEventListener nous les donne ; ELLES quittent la liste à leur dispose
       (= celles qui restent sont exactement celles que renderer.info.memory compte) ;
     · SCÈNES : tout objet passé à WebGLRenderer.render est noté (la scène du jeu, celle du garage…), pour savoir si un maillage y est encore.
   window.__MEMTR.bilan() → { geoVivantes, geoHorsScene, cpuMo, groupes:[{sig,n,cpuMo,ex}], texVivantes, texHorsScene:[{w,h,n}] } ; .raz() ne sert à rien (pas d'état à remettre). */
(function(){
  var val, inst = false, GEO = new Map(), TEX = new Map(), SCENES = new Set(), NB = {geo: 0, tex: 0};
  function sig(g) {
    var a = g.attributes ? Object.keys(g.attributes).sort().join('+') : '?', n = g.attributes && g.attributes.position ? g.attributes.position.count : 0;
    return a + ' ' + (g.index ? 'i' + g.index.count : 'ni') + ' n' + n;
  }
  function cpu(g) {
    var o = 0, k;
    for (k in g.attributes) { var at = g.attributes[k]; if (at && at.array) o += at.array.byteLength; }
    if (g.index && g.index.array) o += g.index.array.byteLength;
    return o;
  }
  function install(T) {
    var EVT = T.EventDispatcher && T.EventDispatcher.prototype;
    function hook(proto, type, MAP, nom) {
      var orig = proto.addEventListener;
      proto.addEventListener = function (t, fn) {
        if (t === 'dispose' && !MAP.has(this)) { MAP.set(this, performance.now()); NB[nom]++; var me = this, f = fn;
          // quand three se désabonne (dispose), la fiche part
          var o2 = this.removeEventListener; }
        return orig.apply(this, arguments);
      };
      var odis = proto.dispatchEvent;
      proto.dispatchEvent = function (e) { if (e && e.type === 'dispose') MAP.delete(this); return odis.apply(this, arguments); };
    }
    hook(T.BufferGeometry.prototype, 'dispose', GEO, 'geo');
    hook(T.Texture.prototype, 'dispose', TEX, 'tex');
    var O = T.WebGLRenderer; /* r128 : `render` est posée sur l'INSTANCE, pas sur le prototype → on enveloppe le constructeur */
    T.WebGLRenderer = function (a) { var r = new O(a), or = r.render; r.render = function (sc) { if (sc && sc.isScene) SCENES.add(sc); return or.apply(this, arguments); }; return r; };
    T.WebGLRenderer.prototype = O.prototype;
    window.__MEMTR = {
      bilan: function (n) {
        n = n || 14;
        var inG = new Set(), inT = new Set(), nObj = 0, k;
        SCENES.forEach(function (sc) {
          sc.traverse(function (o) {
            nObj++;
            if (o.geometry) inG.add(o.geometry);
            var m = o.material, L = m ? (Array.isArray(m) ? m : [m]) : [];
            L.forEach(function (mm) { for (var p in mm) { var v = mm[p]; if (v && v.isTexture) inT.add(v); } if (mm.uniforms) for (var u in mm.uniforms) { var v2 = mm.uniforms[u] && mm.uniforms[u].value; if (v2 && v2.isTexture) inT.add(v2); } });
          });
          if (sc.background && sc.background.isTexture) inT.add(sc.background);
        });
        var P = {}, vus = new Set();
        SCENES.forEach(function (sc) {
          sc.traverse(function (o) {
            var g = o.geometry; if (!g || vus.has(g)) return; vus.add(g);
            var c = cpu(g); if (!c) return;
            var q = o, nm = o.name || '', up = 0; while (!nm && q.parent && up++ < 4) { q = q.parent; nm = q.name || ''; }
            var mt = o.material && (Array.isArray(o.material) ? o.material[0] : o.material), key = (nm || '(sans nom)') + ' <' + (mt ? mt.type : '?') + (o.isInstancedMesh ? ' I' : '') + (o.isPoints ? ' pts' : '') + '>';
            var e = P[key] || (P[key] = {k: key, n: 0, cpu: 0, tri: 0}); e.n++; e.cpu += c;
          });
        });
        var parNom = Object.keys(P).map(function (k) { return P[k]; }).sort(function (a, b) { return b.cpu - a.cpu; }).slice(0, n)
          .map(function (e) { return {nom: e.k, n: e.n, cpuMo: +(e.cpu / 1048576).toFixed(2)}; });
        var G = {}, tot = 0, hors = 0, cpuHors = 0;
        GEO.forEach(function (t, g) {
          tot++;
          if (inG.has(g)) return;
          hors++; var c = cpu(g); cpuHors += c; var s = sig(g), e = G[s] || (G[s] = {sig: s, n: 0, cpu: 0, ex: g.name || ''}); e.n++; e.cpu += c;
        });
        var gl = Object.keys(G).map(function (s) { return G[s]; }).sort(function (a, b) { return b.cpu - a.cpu || b.n - a.n; }).slice(0, n)
          .map(function (e) { return {sig: e.sig, n: e.n, cpuMo: +(e.cpu / 1048576).toFixed(2), nom: e.ex}; });
        var T2 = {}, th = 0;
        TEX.forEach(function (t, tx) {
          if (inT.has(tx)) return; th++; var im = tx.image, w = im && (im.width || im.videoWidth) || 0, h = im && (im.height || im.videoHeight) || 0, s = w + 'x' + h + (tx.isCanvasTexture ? ' canvas' : '');
          T2[s] = (T2[s] || 0) + 1;
        });
        return {geoVivantes: tot, geoHorsScene: hors, cpuHorsSceneMo: +(cpuHors / 1048576).toFixed(1), objetsScene: nObj, scenes: SCENES.size,
          groupes: gl, cpuSceneParNom: parNom, texVivantes: TEX.size, texHorsScene: th, texHorsGroupes: T2};
      },
      cpuTotal: function () { var o = 0; GEO.forEach(function (t, g) { o += cpu(g); }); return +(o / 1048576).toFixed(1); }
    };
  }
  Object.defineProperty(window, 'THREE', {configurable: true, enumerable: true,
    get: function () { if (!inst && val && val.BufferGeometry && val.WebGLRenderer && val.Texture) { inst = true; try { install(val); } catch (e) { window.__MEMTR_ERR = String(e); } } return val; },
    set: function (v) { val = v; }});
})();
