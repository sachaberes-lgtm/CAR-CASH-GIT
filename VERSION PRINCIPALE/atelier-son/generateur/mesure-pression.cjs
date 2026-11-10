/* LE NITRO SELON L'APPUI (2026-11-09 ; Sacha : « variation en fonction de à quel point on appuie ») : le même nitro joué à 25, 50, 75 et 100 % d'appui, mesuré par la brillance, la part d'aigu
   (2-6 kHz), la crête, et le niveau RELATIF au plein appui. Un bon nitro à appui variable change de CARACTÈRE (pas seulement de volume) : plus on appuie, plus il est brillant et plein. */
'use strict';
const path = require('path'); const D = path.resolve(__dirname, '../../assets/audio/moteur-vivant/');
const { NitroHybride, HYBRIDE_PRESETS } = require(D + '/nitro-hybride.js'); const { NitroMatiere, PRESETS: PM } = require(D + '/nitro-matiere.js'); const { fftRe } = require(path.resolve(__dirname, '../moteur-vivant/rendu.cjs'));
const SR = 48000, BL = 128, F0 = 181;
function rend(make, pr) { const n = make(), N = 5 * SR, L = new Float32Array(N), R = new Float32Array(N); for (let i0 = 0; i0 < N; i0 += BL) { n.nit = pr; n.speed = .6; n.f0 = F0; n.fire = F0; n.process(L, R, BL, i0); } return L; }
function mes(x) { const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), df = SR / Nf; let tot = 0, cen = 0, hi = 0; for (let o = 2 * SR; o + Nf < 5 * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
  for (let k = Math.ceil(100 / df); k < Math.floor(8000 / df); k++) { const f = k * df, e = re[k] * re[k] + im[k] * im[k]; tot += e; cen += e * f; if (f >= 2000 && f <= 6000) hi += e; } }
  let s = 0, pk = 0; for (let i = 2 * SR; i < 5 * SR; i++) { s += x[i] * x[i]; pk = Math.max(pk, Math.abs(x[i])); } return { cen: Math.round(cen / tot), hi: +(100 * hi / tot).toFixed(1), db: 10 * Math.log10(s / (3 * SR)), crete: +(20 * Math.log10(pk / Math.sqrt(s / (3 * SR)))).toFixed(1) }; }
const cas = { 'hybride bruleur': () => new NitroHybride(SR, 1, HYBRIDE_PRESETS.bruleur), 'hybride flambee': () => new NitroHybride(SR, 1, HYBRIDE_PRESETS.flambee), 'hybride dragon': () => new NitroHybride(SR, 1, HYBRIDE_PRESETS.dragon), 'matiere seule': () => new NitroMatiere(SR, 1, PM.matiere) };
console.log('appui          25 %              50 %              75 %             100 %   (brillance Hz / aigu % / niveau dB rel. plein)');
for (const [k, mk] of Object.entries(cas)) { const r = [.25, .5, .75, 1].map(p => mes(rend(mk, p))), ref = r[3].db; console.log(k.padEnd(16), r.map(v => `${v.cen}/${v.hi}/${(v.db - ref).toFixed(0)}`.padEnd(17)).join(' ')); }
