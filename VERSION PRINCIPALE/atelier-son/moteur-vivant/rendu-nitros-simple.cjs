/* Les beaux nitros : un clip de 11 s par PRESET (allumage à 1 s, plein feu, extinction à 7,5 s, la queue s'éteint), sans grain. node rendu-nitros-simple.cjs [dossier] */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = '../../assets/audio/moteur-vivant/';
const { NitroBraise, PRESETS } = require(D + 'nitro-braise.js');
const { ecritWav, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel', 'nitros'));
fs.mkdirSync(OUT, { recursive: true });
const res = {};
for (const nom of Object.keys(PRESETS)) {
  const N = 11 * SR, L = new Float32Array(N), R = new Float32Array(N), n = new NitroBraise(SR, 4242424, PRESETS[nom]);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; n.nit = t >= 1 && t < 7.5 ? 1 : 0; n.speed = .6; n.process(L, R, Math.min(BL, N - i0), i0); }
  let s = 0; for (let i = 2 * SR; i < 7 * SR; i++) s += L[i] * L[i]; const rms = Math.sqrt(s / (5 * SR));      /* sonie réglée sur le plein feu */
  const g = Math.pow(10, (-18 - 20 * Math.log10(rms)) / 20); let pk = 0;
  for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  if (pk > .95) { const k = .95 / pk; for (let i = 0; i < N; i++) { L[i] *= k; R[i] *= k; } pk = .95; }
  /* les mesures du plein feu : centre de gravité, part d'aigu, et la CRÊTE-RMS (un son lisse = bas ; des claquements = haut) */
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), ps = new Float64Array(Nf / 2); let cnt = 0;
  for (let o = 2 * SR; o + Nf < 7 * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = L[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im); for (let k = 0; k < Nf / 2; k++) ps[k] += re[k] * re[k] + im[k] * im[k]; cnt++; }
  let tot = 0, cen = 0, hi = 0, lo = 0; for (let k = 2; k < Nf / 2; k++) { const f = k * SR / Nf, e = ps[k] / cnt; tot += e; cen += e * f; if (f > 2000) hi += e; if (f < 120) lo += e; }
  let pk2 = 0, s2 = 0; for (let i = 2 * SR; i < 7 * SR; i++) { pk2 = Math.max(pk2, Math.abs(L[i])); s2 += L[i] * L[i]; }
  res[nom] = { centroide: Math.round(cen / tot), aigu2k: +(100 * hi / tot).toFixed(2), grave120: +(100 * lo / tot).toFixed(1), creteRms: +(20 * Math.log10(pk2 / Math.sqrt(s2 / (5 * SR)))).toFixed(1) };
  const f = path.join(OUT, nom + '.wav'); ecritWav(f, L, R, SR);
  cp.execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '192000', f, path.join(OUT, nom + '.m4a')]); fs.unlinkSync(f);
  console.log(nom.padEnd(9), JSON.stringify(res[nom]));
}
fs.writeFileSync(path.join(OUT, 'mesures.json'), JSON.stringify(res, null, 1));
