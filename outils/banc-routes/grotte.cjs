/* banc Node de la route des PROFONDEURS (grotte) — 2026-11-05, LA ROUTE À RYTHME : le VRAI genGrotte + pisteTordPropre dans un vm (charge.cjs), puis les mesures de passation/RACCOURCIS.md
   (virages/km ≥ 2,5 · enchaînements/km ≥ 1 · droite ≤ 5 s · raccourcis/km ≥ 0,6) et les croisements/contacts.
   node grotte.cjs palier graines(ex 1-12)      palier 0 = 78 m/s, 10 = 158, 20 = 341
   env : NOFLOW=1 (la route d'hier) · LISTE='["gLacets"]' (n'essayer qu'un module) · G1=fichier (une copie d'essai de grottes-1.js) */
const fs = require('fs'), vm = require('vm'), path = require('path');
const RACINE = path.resolve(__dirname, '../..');
const B = require('./charge.cjs');
const R = require('./raccourcis.cjs');
const ctx = B.ctx;
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');
// le strict nécessaire de plus pour grottes-1.js
vm.runInContext(`
var THICK=2.6, TEL_NATIF=false, ALLEGE=false, started=true;
function longueurCible(){return 0;}
`, ctx);
ctx.__FL = process.env.FL ? JSON.parse(process.env.FL) : {};
let SRC = process.env.G1 ? fs.readFileSync(process.env.G1, 'utf8') : lire('code/maps/grottes-1.js');
if (process.env.NOFLOW) SRC = SRC.replace('on:!/[?&]sans=([^&]*,)?flow(,|&|$)/.test(location.search)', 'on:false');
if (process.env.LISTE) SRC = SRC.replace(/liste:\[[^\]]*\]/, 'liste:' + process.env.LISTE);
try { vm.runInContext(SRC, ctx, { filename: 'grottes-1.js' }); }
catch (e) { console.log('CHARGEMENT grottes-1.js :', e.message.slice(0, 300)); process.exit(1); }

const VW = B.VW;
function piste(graine, palier) {
  palier = palier | 0; const vw = VW[palier] || 78;
  ctx.__setPalier(palier, vw);
  vm.runInContext(`LVL.cur={id:'grotte',piste:'grotte',carte:'grotte'};`, ctx);
  ctx.MODMARK.length = 0; ctx.FILETMARK.length = 0;
  const rnd = ctx.mulberry32(graine);
  const gen = ctx.genGrotte(rnd); let st = gen.next(); while (!st.done) st = gen.next();
  const ctrl = st.value;
  let out = { ctrl, ctrl0: ctrl.slice(), N: null, vw, marks: ctx.MODMARK.map(m => Object.assign({}, m)), geants: vm.runInContext('GROTTE.geants', ctx), salles: vm.runInContext('GROTTE.salles', ctx), sTot: vm.runInContext('GROTTE.sTot', ctx), conflits: vm.runInContext('GROTTE.conflits', ctx) };
  try {
    const opts = vm.runInContext('grtTordOpts()', ctx);
    const h = ctx.pisteTordPropre(ctrl, graine, opts);
    out.ctrl = h.ctrl; out.N = h.N; out.info = vm.runInContext('TORD.info', ctx);
  } catch (e) { out.tordErr = e.message; }
  return out;
}
/* les mesures : cap en plan le long de la route, virages (≥20° de cap sur un rayon < 4 rMin), enchaînements, droites */
function mesures(r) {
  const Q = r.ctrl, n = Q.length, vw = r.vw, rMin = 40 + .3 * vw;
  const S = [0], psi = [0];
  for (let i = 1; i < n; i++) {
    const dx = Q[i].x - Q[i - 1].x, dz = Q[i].z - Q[i - 1].z;
    S.push(S[i - 1] + Math.hypot(dx, Q[i].y - Q[i - 1].y, dz));
    let a = Math.atan2(dx, dz); if (i > 1) { let d = a - psi[i - 1]; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; a = psi[i - 1] + d; } psi.push(a);
  }
  psi[0] = psi[1];
  const L = S[n - 1];
  // lissage du cap sur ±~40 m puis taux de virage (rad/m)
  const k = []; const W = 40;
  for (let i = 0; i < n; i++) { let a = i, b = i; while (a > 0 && S[i] - S[a] < W) a--; while (b < n - 1 && S[b] - S[i] < W) b++; k.push(b > a ? (psi[b] - psi[a]) / (S[b] - S[a]) : 0); }
  // virages = suites de signe constant avec rayon < 4 rMin (|k| > 1/(4 rMin)), cap cumulé ≥ 20°
  const seuil = 1 / (4 * rMin), vir = []; let i = 0;
  while (i < n) {
    if (Math.abs(k[i]) > seuil) { let j = i, sg = Math.sign(k[i]); while (j < n && Math.abs(k[j]) > seuil && Math.sign(k[j]) === sg) j++;
      const cap = Math.abs(psi[Math.min(j, n - 1)] - psi[i]) * 57.2958; if (cap >= 20) vir.push({ s0: S[i], s1: S[Math.min(j, n - 1)], cap, rayon: (S[Math.min(j, n - 1)] - S[i]) / Math.max(1e-6, Math.abs(psi[Math.min(j, n - 1)] - psi[i])), sg }); i = j; } else i++; }
  // enchaînements : deux virages à moins de 150 m l'un de l'autre
  let chaine = 0; for (let q = 1; q < vir.length; q++) if (vir[q].s0 - vir[q - 1].s1 < 150) chaine++;
  // droites : intervalles sans virage (|k| < 1/2500)
  const droite = []; { let s0 = null; for (let q = 0; q < n; q++) { const ok = Math.abs(k[q]) < 1 / 2500; if (ok && s0 == null) s0 = S[q]; if ((!ok || q === n - 1) && s0 != null) { droite.push(S[q] - s0); s0 = null; } } }
  const dMax = droite.reduce((m, x) => Math.max(m, x), 0), partDroite = droite.reduce((a, x) => a + (x > 150 ? x : 0), 0) / L;
  // pente moyenne
  const pente = (Q[0].y - Q[n - 1].y) / L;
  return { L, kmV: vir.length / (L / 1000), chaineKm: chaine / (L / 1000), dMaxS: dMax / vw, partDroite, pente, nVir: vir.length, rayonMed: vir.length ? vir.map(v => v.rayon).sort((a, b) => a - b)[vir.length >> 1] : 0 };
}
module.exports = { piste, mesures, ctx, analyse: R.analyse, resume: R.resume };
if (require.main === module) {
  const [pal, gr] = process.argv.slice(2); const [g0, g1] = (gr || '1-8').split('-').map(Number);
  const tot = { L: [], kmV: [], chaineKm: [], dMaxS: [], partDroite: [], rac: [], pente: [], gea: [], conf: [] };
  for (let sd = g0; sd <= g1; sd++) {
    const r = piste(sd, pal); if (r.tordErr) console.log('tord', r.tordErr);
    const m = mesures({ ctrl: r.ctrl0, vw: r.vw }); const rr = r.N ? { ctrl: r.ctrl, N: r.N, vw: r.vw } : { ctrl: r.ctrl, vw: r.vw };
    let rac = { parKm: NaN, gainMax: 0 }; try { const a = R.analyse(rr); rac = R.resume(rr, a); } catch (e) { rac.err = e.message; }
    console.log('graine', sd, 'L', Math.round(m.L), 'virages', m.nVir, '(' + m.kmV.toFixed(2) + '/km, rayon médian ' + Math.round(m.rayonMed) + ')', 'chaînes/km', m.chaineKm.toFixed(2), 'plus longue droite', m.dMaxS.toFixed(1) + ' s', 'part droite', (m.partDroite * 100).toFixed(0) + '%', 'raccourcis/km', rac.parKm, 'gainMax', rac.gainMax, 'robustes', rac.robustes, 'conflits', r.conflits, 'contacts', r.info&&r.info.contacts, 'mods', r.marks.length+'('+r.marks.filter(m=>m.fig==='corniche').length+'c,'+r.marks.filter(m=>m.tunnel).length+'b)', 'géants', (r.geants || []).length, 'pente', (m.pente * 100).toFixed(1) + '%');
    tot.L.push(m.L); tot.kmV.push(m.kmV); tot.chaineKm.push(m.chaineKm); tot.dMaxS.push(m.dMaxS); tot.partDroite.push(m.partDroite); tot.rac.push(rac.parKm); tot.pente.push(m.pente); tot.conf.push(r.conflits);
  }
  const mean = a => { a = a.filter(x => isFinite(x)); return a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : '-'; };
  console.log('MOYENNES  L', mean(tot.L), 'virages/km', mean(tot.kmV), 'chaînes/km', mean(tot.chaineKm), 'droite max (s)', mean(tot.dMaxS), 'part droite', mean(tot.partDroite), 'raccourcis/km', mean(tot.rac), 'conflits', mean(tot.conf));
  console.log('CIBLES (RACCOURCIS.md) : virages/km ≥ 2,5 · chaînes/km ≥ 1 · droite ≤ 5 s · raccourcis/km ≥ 0,6');
}
