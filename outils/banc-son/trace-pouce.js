/* TRACE DU LECTEUR (banc du son) : chaque appel depart / lobby / fin / course / transforme de POUCE_JEU, avec l'état et la pile — window.__pbTrace */
(function () {
  var P = window.POUCE_JEU; window.__pbTrace = [];
  ['depart', 'lobby', 'fin', 'course', 'transforme'].forEach(function (k) {
    var f = P[k]; if (!f || f.__t) return;
    P[k] = function () {
      var o = arguments[k === 'depart' || k === 'lobby' ? 2 : 0], g = null; try { g = dbgState().gameOver; } catch (e) {}
      window.__pbTrace.push({ t: Math.round(performance.now()), k: k, o: o && typeof o === 'object' ? JSON.stringify({ meme: o.meme, vite: o.vite }) : o, phase: P.phase, titre: P.E && P.E.titre, dernier: P.dernier && P.dernier.titre, go: g,
        pile: (new Error().stack || '').split('\n').slice(2, 6).map(function (l) { return l.trim().replace(/^at /, '').replace(/\(?https?:[^ )]*\//, '').replace(/\?[^:]*/, '').slice(0, 70); }).join(' < ') });
      return f.apply(this, arguments);
    }; P[k].__t = 1;
  });
})();
