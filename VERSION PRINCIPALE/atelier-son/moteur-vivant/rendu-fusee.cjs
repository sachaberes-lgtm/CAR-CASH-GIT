/* Banc Node des NITROS « flammes sous pression » : 6 propositions, nitro SEUL (10 s : allumage à 1 s, plein feu, extinction à 6,5 s), WAV→AAC + mesures.
   node rendu-fusee.cjs [dossier]   (défaut : ./ecoute-noel/fusee) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = '../../assets/audio/moteur-vivant/';
const { NitroFusee, FUSEE_PRESETS, FLAMMES } = require(D + 'nitro-fusee.js');
const { NitroBraise, PRESETS: PB } = require(D + 'nitro-braise.js');
const JEU = process.argv[3] || 'fusee';   /* 'fusee' (4e tour) ou 'flammes' (5e tour : flamme et air) */
const { clamp } = require(D + 'moteur-vivant.js');
const { ecritWav, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel', JEU));
fs.mkdirSync(OUT, { recursive: true });
const res = {};
function pic(x, t0) { const Nf = 16384, re = new Float64Array(Nf), im = new Float64Array(Nf), o = Math.floor(t0 * SR); for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
  let bm = 0, e = 0; const df = SR / Nf; for (let b = Math.ceil(50 / df); b < Math.floor(1500 / df); b++) { const v = re[b] * re[b] + im[b] * im[b]; if (v > e) { e = v; bm = b; } } return Math.round(bm * df); }
const TOUS = JEU === 'flammes' ? Object.assign({ vent: null }, FLAMMES) : FUSEE_PRESETS;   /* « vent » : le nitro du 2e tour (bruit filtré), la référence de ce qu'on NE veut PAS */
for (const nom of Object.keys(TOUS)) {
  const N = 10 * SR, L = new Float32Array(N), R = new Float32Array(N), n = nom === 'vent' ? new NitroBraise(SR, 4242424, PB.noel) : new NitroFusee(SR, 5151515, TOUS[nom]);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; n.nit = t >= 1 && t < 6.5 ? 1 : 0; n.speed = clamp(.4 + .1 * t, 0, .9); n.process(L, R, Math.min(BL, N - i0), i0); }
  let s = 0; for (let i = 2 * SR; i < 5.5 * SR; i++) s += L[i] * L[i]; const rms = Math.sqrt(s / (3.5 * SR)), g = Math.pow(10, (-18 - 20 * Math.log10(rms)) / 20); let pk = 0;
  for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); } if (pk > .95) { const k = .95 / pk; for (let i = 0; i < N; i++) { L[i] *= k; R[i] *= k; } }
  /* mesures sur le plein feu (2,2-5,8 s) */
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), w = new Float32Array(Nf); for (let i = 0; i < Nf; i++) w[i] = .5 - .5 * Math.cos(2 * Math.PI * i / Nf);
  let tot = 0, cen = 0, hi = 0, fl = 0, nf = 0; const df = SR / Nf;
  for (let o = Math.floor(2.2 * SR); o + Nf < 5.8 * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = L[o + i] * w[i]; im[i] = 0; } fftRe(re, im); let lg = 0, ar = 0, c = 0;
    for (let b = Math.ceil(100 / df); b < Math.floor(8000 / df); b++) { const e = re[b] * re[b] + im[b] * im[b] + 1e-18; tot += e; cen += e * b * df; if (b * df > 2000) hi += e; if (b * df < 2000) { lg += Math.log(e); ar += e; c++; } } fl += Math.exp(lg / c) / (ar / c); nf++; }
  const H = Math.round(.01 * SR), E = []; for (let i = Math.floor(2.2 * SR); i + H < 5.8 * SR; i += H) { let q = 0; for (let j = 0; j < H; j++) q += L[i + j] * L[i + j]; E.push(Math.sqrt(q / H)); }
  const mu = E.reduce((a, b) => a + b, 0) / E.length, cv = Math.sqrt(E.reduce((a, b) => a + (b - mu) * (b - mu), 0) / E.length) / mu;
  const H2 = Math.round(.1 * SR), E2 = []; for (let i = Math.floor(2.2 * SR); i + H2 < 5.8 * SR; i += H2) { let q = 0; for (let j = 0; j < H2; j++) q += L[i + j] * L[i + j]; E2.push(Math.sqrt(q / H2)); }
  const mu2 = E2.reduce((a, b) => a + b, 0) / E2.length, cv2 = Math.sqrt(E2.reduce((a, b) => a + (b - mu2) * (b - mu2), 0) / E2.length) / mu2;
  let pk2 = 0, s2 = 0; for (let i = Math.floor(2.2 * SR); i < 5.8 * SR; i++) { pk2 = Math.max(pk2, Math.abs(L[i])); s2 += L[i] * L[i]; }
  res[nom] = { centroide: Math.round(cen / tot), aigu2k: +(100 * hi / tot).toFixed(2), planeite: +(fl / nf).toFixed(3), irregularite: +cv.toFixed(2), bouffees: +cv2.toFixed(2), crete: +(20 * Math.log10(pk2 / Math.sqrt(s2 / (3.6 * SR)))).toFixed(1), noteA2s: pic(L, 2.0), noteA5s: pic(L, 5.2) };
  const f = path.join(OUT, nom + '.wav'); ecritWav(f, L, R, SR); cp.execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '192000', f, path.join(OUT, nom + '.m4a')]); fs.unlinkSync(f);
  console.log(nom.padEnd(10), JSON.stringify(res[nom]));
}
fs.writeFileSync(path.join(OUT, 'mesures.json'), JSON.stringify(res, null, 1));
