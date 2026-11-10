/* LE BANC DES DÉTAILS DE CONDUITE (2026-11-10, Claude Fable) : chaque geste rendu seul (niveau, crête, durée), 20 s de gestes au hasard (aucun NaN, crête bornée), le coût.
     node banc-details.cjs [--png]   (--png : un spectrogramme de la scène complète dans sortie/details.png) */
'use strict';
const path = require('path'), A = path.resolve(__dirname, '../../assets/audio/');
const { DetailsConduite } = require(A + '/moteur-vivant/details-conduite.js');
const SR = 48000, BL = 128; let echecs = 0;
function rend(dur, f) { const d = new DetailsConduite(SR, 4242), N = Math.round(dur * SR), L = new Float32Array(N), R = new Float32Array(N);
  for (let i0 = 0; i0 + BL <= N; i0 += BL) { d.f0 = 120; d.speed = .6; d.load = .3; d.thr = 1; d.air = 0; d.vir = 0; f(d, i0 / SR); d.process(L, R, BL, i0); } return { L, R, d }; }
function stat(x, a, b) { let pk = 0, ss = 0, n = 0, nan = 0, fin = a; for (let i = Math.floor(a * SR); i < b * SR && i < x.length; i++) { const v = x[i]; if (!isFinite(v)) nan++; const av = Math.abs(v); if (av > pk) pk = av; if (av > 1e-3) fin = i / SR; ss += v * v; n++; }
  return { db: (10 * Math.log10(ss / n + 1e-20)).toFixed(1), pk: (20 * Math.log10(pk + 1e-10)).toFixed(1), nan, dur: (fin - a).toFixed(2) }; }
const G = [
  ['croisière (rien ne doit sonner)', (d, t) => {}, 1, 4],
  ['aspiration (on remet les gaz)', (d, t) => { d.thr = t > 1 && t < 2 ? 0 : 1; }, 2, 3],
  ['coup de gaz court (0,3 s)', (d, t) => { d.thr = t > 1 && t < 1.3 ? 1 : 0; }, 1.3, 2.3],
  ['chant (4 s de pleine charge)', (d, t) => { d.load = t > 1 && t < 5 ? 1 : .3; d.f0 = 80 + 25 * Math.max(0, Math.min(4, t - 1)); }, 3, 5],
  ['tintements (lâcher après effort)', (d, t) => { d.load = t < 4 ? 1 : 0; d.thr = t < 4 ? 1 : 0; }, 4.1, 8],
  ['roues libres + rupteur (vol 1,5 s)', (d, t) => { d.air = t > 1 && t < 2.5 ? 1 : 0; }, 1, 2.5],
  ['clonc de la pose', (d, t) => { d.air = t > 1 && t < 2.5 ? 1 : 0; }, 2.5, 3.2],
  ['slalom (5 inversions)', (d, t) => { d.vir = t > 1 && t < 3 ? Math.sign(Math.sin((t - 1) * Math.PI * 2.5)) : 0; }, 1, 3.3]];
console.log('=== les détails de conduite, geste par geste (note 120 Hz) ===');
for (const [nom, f, a, b] of G) { const o = rend(8, f), s = stat(o.L, a, b), s2 = stat(o.R, a, b); if (s.nan + s2.nan) echecs++;
  console.log(' ' + nom.padEnd(36) + s.db.padStart(7) + ' dB · crête ' + s.pk.padStart(6) + ' dBFS · NaN ' + (s.nan + s2.nan)); }
{ const o = rend(4, () => {}), s = stat(o.L, 1, 4); const ok = +s.pk < -80; if (!ok) echecs++; console.log((ok ? '  ✓ ' : '  ✗ ') + 'en croisière la couche se tait (crête ' + s.pk + ' dBFS)'); }
{ let r = 99; const rnd = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; }; let st = { thr: 1, air: 0, vir: 0, load: .5, f0: 100 };
  const o = rend(20, (d, t) => { if (Math.round(t * SR / BL) % 30 === 0) st = { thr: rnd() < .6 ? 1 : 0, air: rnd() < .25 ? 1 : 0, vir: rnd() * 2 - 1, load: rnd(), f0: rnd() < .05 ? 0 : 30 + 500 * rnd() }; Object.assign(d, st); d.speed = rnd(); });
  const a = stat(o.L, 0, 20), b = stat(o.R, 0, 20), ok = a.nan + b.nan === 0 && Math.max(+a.pk, +b.pk) < -3; if (!ok) echecs++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + 'robustesse : 20 s de gestes au hasard — ' + (a.nan + b.nan) + ' NaN, crête ' + Math.max(+a.pk, +b.pk) + ' dBFS, niveau ' + a.db + ' dB'); }
{ const d = new DetailsConduite(SR, 1), N = 10 * SR, L = new Float32Array(N), R = new Float32Array(N); let t0 = process.hrtime.bigint();
  for (let i0 = 0; i0 < N; i0 += BL) { d.f0 = 120; d.thr = 1; d.load = 1; d.speed = .6; d.air = (i0 / SR) % 3 < 1 ? 1 : 0; d.vir = Math.sin(i0 / SR * 9); d.process(L, R, BL, i0); } const on = Number(process.hrtime.bigint() - t0) / 1e7;
  const d2 = new DetailsConduite(SR, 1); L.fill(0); t0 = process.hrtime.bigint(); for (let i0 = 0; i0 < N; i0 += BL) { d2.f0 = 120; d2.thr = 1; d2.load = .3; d2.speed = .6; d2.process(L, R, BL, i0); } const off = Number(process.hrtime.bigint() - t0) / 1e7;
  const ok = on < 25; if (!ok) echecs++; console.log((ok ? '  ✓ ' : '  ✗ ') + 'coût : ' + on.toFixed(1) + ' ms/s en pleine action · ' + off.toFixed(2) + ' ms/s en croisière'); }
if (process.argv.includes('--png')) { const { spectro } = require('../moteur-vivant/rendu.cjs');
  const o = rend(20, (d, t) => { d.thr = (t > 1 && t < 2) || (t > 9 && t < 9.5) ? 0 : 1; d.load = t > 3 && t < 8 ? 1 : .3; d.f0 = 80 + 6 * t; d.air = t > 11 && t < 13 ? 1 : 0; d.vir = t > 15 && t < 18 ? Math.sign(Math.sin(t * 8)) : 0; });
  require('fs').mkdirSync(path.join(__dirname, 'sortie'), { recursive: true }); spectro(path.join(__dirname, 'sortie/details.png'), o.L, SR, { fmax: 3000 }); console.log(' spectrogramme : sortie/details.png (aspiration 2 s · chant 4-8 s · coup de gaz 9,5 s · vol 11-13 s · slalom 15-18 s)'); }
console.log(echecs ? echecs + ' échec(s)' : 'tout passe'); process.exit(echecs ? 1 : 0);
