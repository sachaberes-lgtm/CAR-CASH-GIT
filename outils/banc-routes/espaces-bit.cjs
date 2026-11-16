/* LES POINTS ESPACÉS AU BIT PRÈS (2026-11-14) : getSpacedPoints du jeu (le curseur, route-rythme.js) contre celui de three (la recherche dichotomique), sur les
   courbes des VRAIES routes (points de contrôle de genCtrl pour nuages, espace, ville, crypto ; paliers 0/10/20) et sur des courbes au hasard (avec des points
   doublés : segments de longueur nulle), à plusieurs N. Compte les coordonnées différentes (doit être 0) et chronomètre les deux.
   node outils/banc-routes/espaces-bit.cjs [graines=1-6] */
const path = require('path'), B = require('./charge.cjs'), ctx = B.ctx, THREE = ctx.THREE;
const a = process.argv.find(x => x.startsWith('graines=')); const [g0, g1] = (a ? a.slice(8) : '1-6').split('-').map(Number);
const C = THREE.Curve.prototype; if (!C.__espaces) { console.log('le curseur n\'est pas posé (route-rythme.js) : rien à comparer'); process.exit(1); }
const pAt = C.getPointAt; const ori = function (t) { const e = []; for (let n = 0; n <= t; n++) e.push(pAt.call(this, n / t)); return e; };
let nC = 0, nP = 0, diff = 0, tN = 0, tO = 0;
const essai = (ctrl) => { for (const N of [37, 500, 1999, Math.max(50, Math.round(ctrl.length * 9.3))]) {
  const c1 = new THREE.CatmullRomCurve3(ctrl.map(v => new THREE.Vector3(v.x, v.y, v.z)), false, 'centripetal'); c1.arcLengthDivisions = Math.max(200, ctrl.length * 16);
  const c2 = new THREE.CatmullRomCurve3(ctrl.map(v => new THREE.Vector3(v.x, v.y, v.z)), false, 'centripetal'); c2.arcLengthDivisions = c1.arcLengthDivisions;
  c1.getLengths(); c2.getLengths();
  let t0 = performance.now(); const A = c1.getSpacedPoints(N); tN += performance.now() - t0; t0 = performance.now(); const O = ori.call(c2, N); tO += performance.now() - t0;
  nC++; nP += A.length; if (A.length !== O.length) { diff += 1e6; continue; }
  for (let i = 0; i < A.length; i++) { if (A[i].x !== O[i].x) diff++; if (A[i].y !== O[i].y) diff++; if (A[i].z !== O[i].z) diff++; } } };
const CUR = { ville: { id: 'ville', carte: 'ville', sansFin: 1 }, crypto: { id: 'ville', crypto: 1, carte: 'ville', sansFin: 1 } };
for (const c of ['nuages', 'espace', 'ville', 'crypto']) for (const pal of [0, 10, 20]) for (let g = g0; g <= g1; g++) { try { let ctrl;
  if (CUR[c]) { ctx.__setPalier(pal, B.VW[pal]); ctx.LVL.cur = CUR[c]; ctx.MODMARK.length = 0; ctx.FILETMARK.length = 0; ctrl = ctx.genCtrl(ctx.mulberry32(g), new THREE.Vector3(0, 0, 0), 0); } else ctrl = B.piste(c, g, pal).ctrl;
  essai(ctrl); } catch (e) { console.log('erreur', c, pal, g, e.message.slice(0, 80)); } }
const rnd = ctx.mulberry32(77); for (let k = 0; k < 40; k++) { const P = []; let x = 0, z = 0; for (let i = 0; i < 30 + k * 7; i++) { x += (rnd() - .5) * 300; z += 50 + rnd() * 200; P.push({ x, y: rnd() * 40, z }); if (rnd() < .1) P.push({ x, y: P[P.length - 1].y, z }); } essai(P); }
console.log(JSON.stringify({ courbes: nC, points: nP, coordonneesDifferentes: diff, msCurseur: +tN.toFixed(0), msDichotomie: +tO.toFixed(0) }));
