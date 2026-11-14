/* LE TIRAGE A/B (2026-11-14, passe d'optimisation de l'orbite) : genCtrl + pisteTord d'une route d'orbite, DEUX worktrees chargés dans le MÊME processus et
   ALTERNÉS route par route (même charge de la machine pour les deux), chronométrés en temps PROCESSEUR (process.cpuUsage : moins sensible aux autres
   agents que l'horloge murale) et à l'horloge. node outils/banc-routes/tirage-ab.cjs <racineA> <racineB> [paliers=0,10,20] [graines=1-12] [tours=2] */
const path = require('path');
const arg = k => { const a = process.argv.find(x => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : null; };
const RA = path.resolve(process.argv[2]), RB = path.resolve(process.argv[3]);
const A = require(path.join(RA, 'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH || ''), B = require(path.join(RB, 'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH || '');
const PAL = (arg('paliers') || '0,10,20').split(',').map(Number), G = (arg('graines') || '1-12').split('-').map(Number), TOURS = +(arg('tours') || 2);
for (const X of [A, B]) { X.piste('espace', 99, 0); X.piste('espace', 98, 0); }
const un = (X, g, p) => { const c0 = process.cpuUsage(), t0 = performance.now(); X.piste('espace', g, p); const c = process.cpuUsage(c0); return [(c.user + c.system) / 1000, performance.now() - t0]; };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
for (const p of PAL) { const ca = [], cb = [], ma = [], mb = [];
  for (let t = 0; t < TOURS; t++) for (let g = G[0]; g <= G[1]; g++) { const o = (g + t) % 2; const r1 = un(o ? B : A, g, p), r2 = un(o ? A : B, g, p); const ra = o ? r2 : r1, rb = o ? r1 : r2; ca.push(ra[0]); ma.push(ra[1]); cb.push(rb[0]); mb.push(rb[1]); }
  console.log('palier', p, '· A', path.basename(RA), 'cpu méd', med(ca).toFixed(0), 'ms (mur', med(ma).toFixed(0) + ')', '· B', path.basename(RB), 'cpu méd', med(cb).toFixed(0), 'ms (mur', med(mb).toFixed(0) + ')', '· B/A', (med(cb) / med(ca)).toFixed(2)); }
