/* la route passe-t-elle SOUS le niveau du lac de lave / d'eau dans la portée du lac ? (grtLacs la noierait) — 2026-11-05 : avec des virages sur la paroi la route plonge de centaines de mètres
   node grotte-lacs.cjs palier graines(ex 1-30)      env : SEUIL=2 (m au-dessus du lac) · NOFLOW=1 */
const B = require('./grotte.cjs'); const vm = require('vm'); const ctx = B.ctx;
vm.runInContext('var pts=[],T=[],Nn=[],NP=0,L=0;', ctx);
function echant(r) {
  const THREE = ctx.THREE, ctrl = r.ctrl, N = r.N || ctrl.map(() => new THREE.Vector3(0, 1, 0));
  const cv = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); cv.arcLengthDivisions = Math.max(200, ctrl.length * 16);
  const Lc = cv.getLength(), np = Math.ceil(Lc / 3) + 1, P = cv.getSpacedPoints(np - 1);
  ctx.pts = P; ctx.NP = np; ctx.L = Lc; ctx.T = P.map((p, i) => new THREE.Vector3().subVectors(P[Math.min(np - 1, i + 1)], P[Math.max(0, i - 1)]).normalize());
  ctx.Nn = P.map((p, i) => N[Math.round(i / (np - 1) * (N.length - 1))]);
  return ctx.grtEchantillons();
}
const SEUIL = +(process.env.SEUIL || 2); const [pal, gr] = process.argv.slice(2); const [g0, g1] = (gr || '1-20').split('-').map(Number);
let bad = 0, tot = 0; const lignes = [];
for (let sd = g0; sd <= g1; sd++) {
  const r = B.piste(sd, pal); tot++;
  let R; try { R = echant(r); } catch (e) { console.log('graine', sd, 'ERR', e.message.slice(0, 200)); continue; }
  const lac = vm.runInContext('GROTTE.lac', ctx), eau = vm.runInContext('GROTTE.eau', ctx); let noy = 0, first = null;
  for (let q = R.i0; q < R.n - 20; q++) { for (const [nm, L9] of [['lave', lac], ['eau', eau]]) { if (!L9) continue; if (R.S[q] >= L9.s0 && R.S[q] <= L9.s1 && R.Y[q] < L9.y + SEUIL) { noy++; if (!first) first = { nm, S: Math.round(R.S[q]), y: Math.round(R.Y[q]), lac: Math.round(L9.y), s0: Math.round(L9.s0), s1: Math.round(L9.s1), sal: R.SAL[q] }; } } }
  if (noy) { bad++; lignes.push('graine ' + sd + ' noyé ' + noy + ' ' + JSON.stringify(first) + ' ordre ' + (r.salles || []).map(x => x.k).join('>')); }
}
console.log('palier', pal, 'graines', tot, 'routes noyées', bad); lignes.slice(0, 8).forEach(l => console.log(l));
