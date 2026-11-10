/* LE NITRO PHYSIQUE FACE AU MOTEUR CYBER DE LÉO (2026-11-10) : on rend sa mécanique + son cyber (`MoteurBuche`, sans la bûche du jeu qui est faite d'oscillateurs Web Audio) sur une montée de la note
   `hz` (70 → 200 Hz), puis le nitro physique calé sur cette même note, et on mesure ce qui fait mal : brillance (centroïde), part d'aigu 2-6 kHz, acuité de Zwicker, crête, rugosité 15-70 Hz.
   Le nitro est jugé RELATIVEMENT au moteur : jamais plus brillant de plus de ×1,5.   node mesure-cyber.cjs [palier 0-29] */
'use strict';
const path = require('path'); const A = path.resolve(__dirname, '../../assets/audio/');
const { MoteurBuche } = require(A + '/moteur-buche/moteur-buche.js');
const { NitroPhysique, PHYSIQUE_PRESETS } = require(A + '/moteur-vivant/nitro-physique.js');
const { Bq } = require(A + '/moteur-vivant/moteur-vivant.js');
const { fftRe } = require(path.resolve(__dirname, '../moteur-vivant/rendu.cjs'));
const SR = 48000, BL = 128, DUR = 20, LV = +(process.argv[2] || 10);
const hzDe = t => t < 3 ? 62 : t < 12 ? 62 + 120 * (t - 3) / 9 : 182 - 40 * Math.min(1, (t - 12) / 8);
const nitOn = t => t >= 7 && t < 16 ? 1 : 0;
function moteur() {
  const m = new MoteurBuche(SR, 20261109); m.palier(LV, 1); const N = DUR * SR, EL = new Float32Array(N), ER = new Float32Array(N), mL = new Float32Array(BL), mR = new Float32Array(BL), cL = new Float32Array(BL), cR = new Float32Array(BL), hz = new Float32Array(Math.ceil(N / BL));
  for (let i0 = 0, k = 0; i0 < N; i0 += BL, k++) { const t = i0 / SR; m.hz = hzDe(t); m.rpmN = clamp((m.hz - 60) / 140, 0, 1); m.thr = t > 3 ? 1 : 0; m.load = t > 3 ? .85 : 0; m.boost = 0;
    m.process(mL, mR, cL, cR, BL); for (let i = 0; i < BL && i0 + i < N; i++) { EL[i0 + i] = (mL[i] + cL[i]) * 1.0; ER[i0 + i] = (mR[i] + cR[i]) * 1.0; } hz[k] = m.hz; }
  return { L: EL, R: ER, hz };
}
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
function nitro(preset, hz, press, opts) {
  const n = new NitroPhysique(SR, 90909, preset), N = DUR * SR, L = new Float32Array(N), R = new Float32Array(N);
  for (let i0 = 0, k = 0; i0 < N; i0 += BL, k++) { const t = i0 / SR; n.nit = nitOn(t) * press; n.speed = .6; n.f0 = hz[k]; n.load = t > 3 ? .85 : 0; n.thr = t > 3 ? 1 : 0; if (opts && opts.rapport && Math.abs(t - opts.rapport) < BL / SR) n.rapport(); n.process(L, R, BL, i0); }
  return { L, R };
}
const bark = f => 13 * Math.atan(.00076 * f) + 3.5 * Math.atan(Math.pow(f / 7500, 2));
function mes(x, a, b) {
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), df = SR / Nf; let tot = 0, cen = 0, hi = 0, nA = 0, dA = 0;
  for (let o = Math.floor(a * SR); o + Nf < b * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
    for (let k = Math.ceil(100 / df); k < Math.floor(8000 / df); k++) { const f = k * df, e = re[k] * re[k] + im[k] * im[k]; tot += e; cen += e * f; if (f >= 2000 && f <= 6000) hi += e; const z = bark(f), g = z < 15 ? 1 : .066 * Math.exp(.171 * z); nA += Math.pow(e, .23) * g * z; dA += Math.pow(e, .23); } }
  let pk = 0, ss = 0, n = 0; for (let i = Math.floor(a * SR); i < b * SR; i++) { pk = Math.max(pk, Math.abs(x[i])); ss += x[i] * x[i]; n++; }
  const hp = new Bq().set('hp', 1000, .7, 0, SR), lp = new Bq().set('lp', 4000, .7, 0, SR), env = []; let acc = 0, c = 0; const Wb = Math.floor(.002 * SR);
  for (let i = Math.floor(a * SR); i < b * SR; i++) { const y = lp.p(hp.p(x[i])); acc += y * y; if (++c === Wb) { env.push(Math.sqrt(acc / Wb)); acc = 0; c = 0; } }
  const M = env.length, mu = env.reduce((s, v) => s + v, 0) / M; let bat = 0; for (let f = 15; f <= 70; f += 2) { let rr = 0, ii = 0; for (let i = 0; i < M; i++) { const ph = 2 * Math.PI * f * i / 500; rr += (env[i] - mu) * Math.cos(ph); ii += (env[i] - mu) * Math.sin(ph); } bat += (rr * rr + ii * ii) / (M * M); }
  return { cen: Math.round(cen / tot), hi: +(100 * hi / tot).toFixed(1), ac: +(.11 * nA / dA).toFixed(2), crete: +(20 * Math.log10(pk / Math.sqrt(ss / n))).toFixed(1), bat: +(1e3 * Math.sqrt(bat) / mu).toFixed(0), db: +(10 * Math.log10(ss / n + 1e-20)).toFixed(1) };
}
module.exports = { moteur, nitro, mes, SR, DUR };
if (require.main === module) {
  const E = moteur(), ref = mes(E.L, 8, 15);
  console.log('palier', LV + 1, '— fenêtre 8-15 s, nitro plein appui (sauf mention)');
  console.log('                             centroïde  2-6k%  acuité  crête  batt.  niveau dB');
  const ligne = (k, v) => console.log(k.padEnd(34), String(v.cen).padStart(6), String(v.hi).padStart(7), String(v.ac).padStart(7), String(v.crete).padStart(6), String(v.bat).padStart(6), String(v.db).padStart(8));
  ligne('moteur seul', ref);
  for (const [nom, P] of Object.entries(PHYSIQUE_PRESETS)) { const N1 = nitro(P, E.hz, 1); ligne('nitro ' + nom + ' seul', mes(N1.L, 8, 15));
    const mix = new Float32Array(E.L.length); for (let i = 0; i < mix.length; i++) mix[i] = E.L[i] + N1.L[i]; ligne('  moteur + nitro ' + nom, mes(mix, 8, 15)); }
  console.log('— selon l\'appui (nitro forge seul) :'); for (const p of [.25, .5, .75, 1]) ligne('  appui ' + p * 100 + ' %', mes(nitro(PHYSIQUE_PRESETS.forge, E.hz, p).L, 8, 15));
}
