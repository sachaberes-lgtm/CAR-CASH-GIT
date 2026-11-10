/* LE BANC DU NITRO PHYSIQUE (2026-11-10, Claude Fable) — ce que verifier.cjs ne mesure pas :
     node banc.cjs [preset] [--v1 chemin/vers/une-autre-version.js] [--f0 150] [--P '{"jetG":2}' : essayer des réglages]
   · l'ACCROCHAGE STRICT : part de l'énergie 80 Hz-3 kHz à ± 1 % (6 Hz au moins) d'un multiple de la note (le critère du vérificateur tolère ± 3 %, donc tout le spectre au-dessus du 17e rang)
   · la PULSATION : la bande 400 Hz-3 kHz bat-elle à la cadence du moteur ? (un vent ne bat pas : ~0 ; des coups de flamme : fort). C'est la mesure de « ce n'est pas du vent ».
   · le niveau de chaque COUCHE, la crête selon l'appui, le coût CPU allumé / endormi
   · les GESTES : coup bref, appui tenu, lâcher, double-tap, pose, bosse, raté — niveau, crête, durée de la traîne, aucun NaN. */
'use strict';
const path = require('path'), A = path.resolve(__dirname, '../../assets/audio/');
const { Bq } = require(A + '/moteur-vivant/moteur-vivant.js');
const { fftRe } = require('../moteur-vivant/rendu.cjs');
const ARG = process.argv.slice(2), iv = ARG.indexOf('--v1');
const API = require(iv >= 0 ? path.resolve(ARG[iv + 1]) : A + '/moteur-vivant/nitro-physique.js');
const PN = (ARG[0] && ARG[0][0] !== '-') ? ARG[0] : 'forge', P = Object.assign({}, API.PHYSIQUE_PRESETS[PN], ARG.indexOf('--P') >= 0 ? JSON.parse(ARG[ARG.indexOf('--P') + 1]) : {}), SR = 48000, BL = 128;
const F0 = ARG.indexOf('--f0') >= 0 ? +ARG[ARG.indexOf('--f0') + 1] : 150;
const db = v => (10 * Math.log10(v + 1e-20)).toFixed(1);
function rend(dur, f, opt) { const n = new API.NitroPhysique(SR, (opt && opt.seed) || 90909, P), N = Math.round(dur * SR), L = new Float32Array(N), R = new Float32Array(N); if (opt && opt.acc) n.rmsAcc = {};
  for (let i0 = 0; i0 + BL <= N; i0 += BL) { n.speed = .6; n.load = .85; n.thr = 1; n.f0 = F0; f(n, i0 / SR, BL / SR); n.process(L, R, BL, i0); } return { L, R, n }; }
function strict(x, f0, a, b) { const Nf = 16384, re = new Float64Array(Nf), im = new Float64Array(Nf), df = SR / Nf; let eh = 0, et = 0;
  for (let o = Math.floor(a * SR); o + Nf < b * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
    for (let k = Math.ceil(80 / df); k < Math.floor(3000 / df); k++) { const f = k * df, e = re[k] * re[k] + im[k] * im[k]; et += e; const h = Math.round(f / f0); if (h >= 1 && Math.abs(f - h * f0) <= Math.max(6, .01 * h * f0)) eh += e; } }
  return 100 * eh / et; }
function pulsation(x, f0, a, b) { const hp = new Bq().set('hp', 400, .7, 0, SR), lp = new Bq().set('lp', 3000, .7, 0, SR), el = new Bq().set('lp', Math.min(4 * f0, 1200), .7, 0, SR); let rr = 0, ii = 0, mu = 0, n = 0;
  for (let i = Math.floor(a * SR); i < b * SR; i++) { const e = el.p(Math.abs(lp.p(hp.p(x[i])))), ph = 2 * Math.PI * f0 * i / SR; rr += e * Math.cos(ph); ii += e * Math.sin(ph); mu += e; n++; }
  return 2 * Math.sqrt(rr * rr + ii * ii) / (mu + 1e-20); }
function stat(x, a, b) { let pk = 0, ss = 0, n = 0, nan = 0; for (let i = Math.floor(a * SR); i < b * SR && i < x.length; i++) { const v = x[i]; if (!isFinite(v)) nan++; pk = Math.max(pk, Math.abs(v)); ss += v * v; n++; } return { db: db(ss / n), pk: (20 * Math.log10(pk + 1e-10)).toFixed(1), crete: (20 * Math.log10(pk / Math.sqrt(ss / n) + 1e-10)).toFixed(1), nan }; }
function centro(x, a, b) { const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), df = SR / Nf; let t = 0, c = 0, hi = 0; for (let o = Math.floor(a * SR); o + Nf < b * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
  for (let k = Math.ceil(100 / df); k < Math.floor(8000 / df); k++) { const f = k * df, e = re[k] * re[k] + im[k] * im[k]; t += e; c += e * f; if (f >= 2000 && f <= 6000) hi += e; } } return Math.round(c / t) + ' Hz, ' + (100 * hi / t).toFixed(2) + ' % aigu'; }
/* quand la traîne s'éteint-elle ? (dernier instant au-dessus de −60 dB) */
function fin(x, t0) { let d = t0; const W = 480; for (let i = Math.floor(t0 * SR); i + W < x.length; i += W) { let s = 0; for (let k = 0; k < W; k++) s += x[i + k] * x[i + k]; if (s / W > 1e-6) d = (i + W) / SR; } return (d - t0).toFixed(2); }
console.log('=== banc du nitro « ' + PN + ' »' + (iv >= 0 ? ' (autre version)' : '') + ' — note fixe ' + F0 + ' Hz ===');
const COURT = ARG.includes('--court');   /* --court : le plein appui seul (pour balayer un réglage) */
for (const p of COURT ? [1] : [.25, .5, .75, 1]) { const o = rend(8, n => { n.nit = p; }), s = stat(o.L, 3, 8);
  console.log(' appui ' + String(p * 100).padStart(3) + ' % : ' + s.db + ' dB, crête ' + s.crete + ' dB · accrochage strict ' + strict(o.L, F0, 3, 8).toFixed(0) + ' % · pulsation ' + pulsation(o.L, F0, 3, 8).toFixed(2) + ' · ' + centro(o.L, 3, 8)); }
{ const o = rend(8, n => { n.nit = 1; }, { acc: 1 }), Ac = o.n.rmsAcc, N = 8 * SR; console.log(' couches (plein appui, dB RMS) : ' + Object.keys(Ac).map(k => k + ' ' + db(Ac[k] / N)).join(' · ')); }
if (COURT) process.exit(0);
if (API.NitroPhysique.prototype.double) {
  console.log('--- gestes (niveau, crête absolue, durée de la traîne après le geste) ---');
  const G = [
    ['coup bref 0,12 s', (n, t) => { n.nit = t >= 1 && t < 1.12 ? 1 : 0; }, 1.12],
    ['appui 0,6 s', (n, t) => { n.nit = t >= 1 && t < 1.6 ? 1 : 0; }, 1.6],
    ['appui 3 s puis lâcher', (n, t) => { n.nit = t >= 1 && t < 4 ? 1 : 0; }, 4],
    ['double-tap (éteint)', (n, t, dt) => { n.nit = 0; if (Math.abs(t - 1) < dt / 2) n.double(1); }, 1],
    ['double-tap (allumé)', (n, t, dt) => { n.nit = t >= .5 ? 1 : 0; if (Math.abs(t - 2) < dt / 2) n.double(1); }, 2],
    ['pose (allumé)', (n, t, dt) => { n.nit = t >= .5 ? 1 : 0; n.air = t < 2 ? 1 : 0; if (Math.abs(t - 2) < dt / 2) n.pose(.8); }, 2],
    ['pose (éteint, tuyau chaud)', (n, t, dt) => { n.nit = t >= .5 && t < 2.5 ? 1 : 0; if (Math.abs(t - 3.6) < dt / 2) n.pose(.8); }, 3.6],
    ['bosses + ratés', (n, t, dt) => { n.nit = t >= .5 ? 1 : 0; if (t > 2 && Math.round(t / dt) % 80 === 0) n.bosse(.8); if (t > 2 && Math.round(t / dt) % 130 === 0) n.rate(); }, 2],
    ['virages + glisse + bleu', (n, t) => { n.nit = t >= .5 ? 1 : 0; n.vir = Math.sin(t * 9); n.gl = t > 2 ? 1 : 0; n.bleu = t > 3 ? 1 : 0; }, 2]];
  for (const [nom, f, t0] of G) { const o = rend(8, f), a = stat(o.L, t0 - .05, Math.min(8, t0 + 1.5)), b = stat(o.R, 0, 8), al = stat(o.L, 0, 8);
    console.log(' ' + nom.padEnd(28) + ' ' + a.db + ' dB sur 1,5 s · crête ' + Math.max(+al.pk, +b.pk).toFixed(1) + ' dBFS · traîne ' + fin(o.L, t0) + ' s · NaN ' + (al.nan + b.nan)); }
}
{ const n = new API.NitroPhysique(SR, 7, P), N = 10 * SR, L = new Float32Array(N), R = new Float32Array(N); let t0 = process.hrtime.bigint();
  for (let i0 = 0; i0 < N; i0 += BL) { n.nit = 1; n.speed = .6; n.f0 = 150; n.load = .8; n.thr = 1; n.process(L, R, BL, i0); } const on = Number(process.hrtime.bigint() - t0) / 1e7;
  n.nit = 0; for (let i0 = 0; i0 < 4 * SR; i0 += BL) n.process(L, R, BL, i0); t0 = process.hrtime.bigint();
  for (let i0 = 0; i0 < N; i0 += BL) n.process(L, R, BL, i0); const off = Number(process.hrtime.bigint() - t0) / 1e7;
  console.log(' coût : ' + on.toFixed(1) + ' ms/s allumé · ' + off.toFixed(2) + ' ms/s éteint'); }
