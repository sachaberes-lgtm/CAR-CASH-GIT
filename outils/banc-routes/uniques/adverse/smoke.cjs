const L=require('./lib.cjs');
for(const carte of ['jade','espace'])for(const ref of ['','88a648892']){const M=L.moteur(carte,'',ref);const G=L.graines(3,7);
 for(const p of [0,27]){for(const g of G){const r=M.route(g,p);const s=L.securite(r,L.vElan(p),L.rayonPalier(p));console.log(carte,ref||'wt',p,g,Math.round(r.ms)+'ms','N',!!r.N,r.ctrl.length,'rep',r.reprises,r.suite.join('>'),JSON.stringify(s));}}}
