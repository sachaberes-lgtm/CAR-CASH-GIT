/* LE BORD LIBRE (2026-11-14) : les deux bords de la dalle sont-ils dans le creux de leur échantillon, là où la route est à L'ASSIETTE LIBRE (GROTTE.libres) ?
     node outils/banc-routes/grotte-bord.cjs palier graines(1-12) [suite=1] [detail=1]
   Le VRAI genGrotte + pisteTordPropre + grtEchantillons dans un vm Node — déterministe, sans navigateur. Pour chaque échantillon libre (R.W9 > 0, hors tube), les deux bords (± ROAD_HALF le long de la binormale),
   à trois hauteurs le long de la normale de la dalle (−7 m : sous la dalle, 0, +7 m), lus dans le creux de CET échantillon seul (axe CAX…, centre OFX…, demi-largeur RH, voûte UP, fond DN) :
   r̂ = √((dh/RH)² + (dA/H)²) ; r̂ ≥ 1 : le point est dans la roche de son propre creux (l'union avec les voisins peut le sauver : c'est une borne prudente), `air` = (1 − r̂) × la distance au centre, en mètres.
   Sortie par graine : le nombre d'échantillons libres, ceux dont un bord est dans la roche (r̂ ≥ 1), ceux à moins de 8 m, l'air le plus petit et où. env : G1=copie d'essai · SANS=bordlibre,… */
const vm = require('vm');
if (process.env.SANS) { const C = require('./charge.cjs'); try { vm.runInContext('location.search=' + JSON.stringify('?sans=' + process.env.SANS), C.ctx); } catch (e) { console.log('SANS ignoré :', e.message); } }
const G = require('./grotte.cjs'), ctx = G.ctx, THREE = ctx.THREE;
vm.runInContext('var pts=[],T=[],Nn=[],NP=0,L=0;', ctx);
const [pal, gr] = process.argv.slice(2), suite = process.argv.includes('suite=1'), detail = process.argv.includes('detail=1');
const [g0, g1] = (gr || '1-12').split('-').map(Number);
{ const p9 = +(pal || 0), k9 = Math.min(1, p9 / 25), vw9 = require('./charge.cjs').VW[p9] || 78; ctx.__LC = (45 - 25 * k9) * vw9 * (1.8 - .8 * k9) * .85; vm.runInContext('longueurCible=function(){return __LC;}', ctx); }
function echant(r) {
  const ctrl = r.ctrl, N = r.N || ctrl.map(() => new THREE.Vector3(0, 1, 0));
  const cv = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); cv.arcLengthDivisions = Math.max(200, ctrl.length * 16);
  const Lc = cv.getLength(), np = Math.ceil(Lc / 3) + 1, P = cv.getSpacedPoints(np - 1);
  ctx.pts = P; ctx.NP = np; ctx.L = Lc; ctx.T = P.map((p, i) => new THREE.Vector3().subVectors(P[Math.min(np - 1, i + 1)], P[Math.max(0, i - 1)]).normalize());
  ctx.Nn = P.map((p, i) => N[Math.round(i / (np - 1) * (N.length - 1))]);
  return ctx.grtEchantillons();
}
const VOIS = +(process.env.VOIS || 10);
const RH0 = vm.runInContext('ROAD_HALF', ctx); let TR = 0, TP = 0, TL = 0, PIRE = 1e9;
for (let g = g0; g <= (g1 || g0); g++) {
  if (!suite) try { vm.runInContext('GRT_VUS.length=0', ctx); } catch (e) {}
  let r, R; try { r = G.piste(g, pal || 0); if (r.tordErr) throw new Error(r.tordErr); R = echant(r); } catch (e) { console.log('graine', g, 'ERREUR', e.message.slice(0, 200)); continue; }
  let gS = 0, gN = 0, gM = 0, gL = 0, nL = 0, nR = 0, nP = 0, pire = 1e9, ou = '', runs = [], cur = null; const W = R.W9;
  for (let q = R.i0; q < R.n - 20; q++) { if (!W || W[q] <= 0 || R.TUF[q] > .05) continue; nL++;
    let mn = 1e9, quoi = '';
    if (W[q] >= .99) { /* l'écart réel entre la dalle et la paroi qui la porte (GRT_LIB.g = 26 m quand rien ne gêne) */ const va = -(R.NNX[q] * R.CAX[q] + R.NNY[q] * R.CAY[q] + R.NNZ[q] * R.CAZ[q]), vh = Math.sqrt(Math.max(0, 1 - va * va)), H = Math.max(20, va > 0 ? R.UP[q] : R.DN[q]), ge = 1 / Math.hypot(vh / R.RH[q], va / H) - Math.hypot(R.OFX[q], R.OFY[q], R.OFZ[q]); gS += ge; gN++; gM = Math.max(gM, ge); if (ge > 30) gL++; }
    for (const e of [-1, 1]) for (const h of [-7, 0, 7]) { let best = -1e9, bq = ''; /* l'union : le creux de l'échantillon et de ses voisins (± VOIS échantillons) */
      const X = R.X[q] + e * RH0 * R.BX[q] + h * R.NNX[q], Y = R.Y[q] + e * RH0 * R.BY[q] + h * R.NNY[q], Z = R.Z[q] + e * RH0 * R.BZ[q] + h * R.NNZ[q];
      for (let p = Math.max(R.i0, q - VOIS); p <= Math.min(R.n - 21, q + VOIS); p++) { const ax = R.CAX[p], ay = R.CAY[p], az = R.CAZ[p], rh = R.RH[p], dx = X - R.X[p] - R.OFX[p], dy = Y - R.Y[p] - R.OFY[p], dz = Z - R.Z[p] - R.OFZ[p];
        const dA = dx * ax + dy * ay + dz * az, d2 = dx * dx + dy * dy + dz * dz, dh = Math.sqrt(Math.max(0, d2 - dA * dA)), H = dA > 0 ? R.UP[p] : R.DN[p], rr = Math.hypot(dh / rh, dA / H), air = (1 - rr) * Math.sqrt(d2) / Math.max(rr, .05);
        if (air > best) { best = air; if (p === q) bq = 'bord ' + e + ' h ' + h + ' dA ' + dA.toFixed(0) + ' dh ' + dh.toFixed(0) + ' rh ' + rh.toFixed(0) + ' H ' + H.toFixed(0) + ' w ' + W[q].toFixed(2) + ' ny ' + R.NNY[q].toFixed(2); } }
      if (best < mn) { mn = best; quoi = bq || ('bord ' + e + ' h ' + h + ' ny ' + R.NNY[q].toFixed(2) + ' w ' + W[q].toFixed(2)); } }
    if (mn < 0) { nR++; if (!cur || R.S[q] - cur[1] > 30) { cur = [R.S[q], R.S[q], mn]; runs.push(cur); } cur[1] = R.S[q]; cur[2] = Math.min(cur[2], mn); } if (mn < 8) nP++;
    if (mn < pire) { pire = mn; ou = 's ' + Math.round(R.S[q]) + ' ' + quoi; } }
  TR += nR; TP += nP; TL += nL; PIRE = Math.min(PIRE, pire);
  console.log('graine', g, '| libres', nL, '| bord dans la roche', nR, '| à moins de 8 m', nP, '| écart à la paroi : moyen', (gS / Math.max(1, gN)).toFixed(0), 'max', gM.toFixed(0), 'm, > 30 m :', gL, '/', gN, '| air le plus petit', pire > 1e8 ? '-' : pire.toFixed(1) + ' m', ou);
  if (process.env.SONDE) { const [sa, sb] = process.env.SONDE.split('-').map(Number); for (let q = R.i0; q < R.n - 20; q++) if (R.S[q] >= sa && R.S[q] <= sb) console.log('   s', Math.round(R.S[q]), 'ny', R.NNY[q].toFixed(2), 'w', (W ? W[q] : 0).toFixed(2), 'tuf', R.TUF[q].toFixed(2), 'rh', R.RH[q].toFixed(0), 'up', R.UP[q].toFixed(0), 'dn', R.DN[q].toFixed(0), 'of', Math.hypot(R.OFX[q], R.OFY[q], R.OFZ[q]).toFixed(0), 'axe y', R.CAY[q].toFixed(2), 'lat', R.LAT[q].toFixed(0)); }
  if (detail && runs.length) console.log('    ', runs.map(u => Math.round(u[0]) + '-' + Math.round(u[1]) + ' (' + u[2].toFixed(0) + ' m)').join('  '), '|', r.marks.filter(m => m.nom && !m.exigu).map(m => m.nom).join(' '));
}
console.log('TOTAL palier', pal || 0, '| échantillons libres', TL, '| bord dans la roche', TR, '| à moins de 8 m', TP, '| air le plus petit', PIRE > 1e8 ? '-' : PIRE.toFixed(1) + ' m');
