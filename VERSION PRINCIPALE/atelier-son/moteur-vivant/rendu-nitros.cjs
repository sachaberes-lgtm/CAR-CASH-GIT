/* Banc Node de la SÉLECTION DE NITROS : rend chaque nitro (PRESETS de nitro-braise.js) seul, puis posé sur le moteur BÛCHE, et mesure.
   node rendu-nitros.cjs [dossier]    (défaut : ./ecoute-noel) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = '../../assets/audio/moteur-vivant/';
const { MoteurVivant, clamp } = require(D + 'moteur-vivant.js');
const { NitroBraise, PRESETS } = require(D + 'nitro-braise.js');
const { Pilote } = require('./conducteur.js');
const { ecritWav, spectro, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel'));
fs.mkdirSync(OUT, { recursive: true });
const NOEL = { dur: 36, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [4, 'thr', .55], [14, 'thr', 1], [18, 'lift'], [21, 'thr', .4], [27, 'lift'], [31, 'idle']] };
const m = new MoteurVivant('buche', SR, 20261109); m.health = 1; const pil = new Pilote(m, NOEL);
const NE = NOEL.dur * SR, EL = new Float32Array(NE), ER = new Float32Array(NE);
for (let i0 = 0; i0 < NE; i0 += BL) { pil.tick(BL / SR); m.process(EL, ER, Math.min(BL, NE - i0), i0); }

function rendNitro(P, sec, nit) {
  const N = sec * SR, L = new Float32Array(N), R = new Float32Array(N), n = new NitroBraise(SR, 4242424, P);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; n.nit = nit(t); n.speed = clamp(.35 + .03 * t, 0, 1); n.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R };
}
const seul = t => (t >= 2 && t < 9) || (t >= 12 && t < 18) ? 1 : 0;       /* 26 s : deux feux, un long (7 s) et un court (6 s) */
const surRoute = t => (t >= 14.2 && t < 19.5) || (t >= 23 && t < 28) ? 1 : 0;   /* 36 s : plein gaz de la BÛCHE, puis une relance en croisière */
function rms(x) { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return Math.sqrt(s / x.length); }
function sortie(nom, L, R, cible) {
  const g = Math.pow(10, (cible - 20 * Math.log10(rms(L))) / 20); let pk = 0;
  for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  if (pk > .95) { const k = .95 / pk; for (let i = 0; i < L.length; i++) { L[i] *= k; R[i] *= k; } }
  const f = path.join(OUT, nom + '.wav'); ecritWav(f, L, R, SR); spectro(path.join(OUT, nom + '.png'), L, SR, { fmax: 4000 });
  cp.execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '192000', f, path.join(OUT, nom + '.m4a')]); fs.unlinkSync(f);
}
function mesure(L, R, a, b) {
  const x = []; for (let i = Math.floor(a * SR); i < Math.floor(b * SR); i++) x.push((L[i] + R[i]) / 2);
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), ps = new Float64Array(Nf / 2); let cnt = 0;
  const w = new Float32Array(Nf); for (let i = 0; i < Nf; i++) w[i] = .5 - .5 * Math.cos(2 * Math.PI * i / Nf);
  for (let o = 0; o + Nf < x.length; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * w[i]; im[i] = 0; } fftRe(re, im); for (let k = 0; k < Nf / 2; k++) ps[k] += re[k] * re[k] + im[k] * im[k]; cnt++; }
  let tot = 0, cen = 0, hi = 0, lo = 0; const df = SR / Nf;
  for (let k = 2; k < Nf / 2; k++) { const f = k * df, e = ps[k] / cnt; tot += e; cen += e * f; if (f > 2000) hi += e; if (f < 120) lo += e; }
  const r = Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length), pk = x.reduce((q, v) => Math.max(q, Math.abs(v)), 0);
  /* la densité des grains : passages au-dessus de 3× l'enveloppe lente, par seconde */
  let ev = 0, env = 0, above = false; for (let i = 0; i < x.length; i++) { const a2 = Math.abs(x[i]); env += (a2 - env) * .0004; if (a2 > 3.2 * env && a2 > 2 * r) { if (!above) ev++; above = true; } else if (a2 < 1.6 * env) above = false; }
  return { centroide: Math.round(cen / tot), aigu2k: +(100 * hi / tot).toFixed(2), grave120: +(100 * lo / tot).toFixed(1), crete: +(20 * Math.log10(pk / r)).toFixed(1), grainsParSeconde: +(ev / (x.length / SR)).toFixed(1) };
}
const res = {};
for (const nom of Object.keys(PRESETS)) {
  const s = rendNitro(PRESETS[nom], 26, seul); res[nom] = mesure(s.L, s.R, 4, 8); sortie('nitro-' + nom, s.L, s.R, -19);
  const n = rendNitro(PRESETS[nom], 36, surRoute), L = new Float32Array(NE), R = new Float32Array(NE);
  for (let i = 0; i < NE; i++) { L[i] = EL[i] + .8 * n.L[i]; R[i] = ER[i] + .8 * n.R[i]; }
  res[nom + '·sur-buche'] = mesure(L, R, 15, 18.5); sortie('nitro-' + nom + '-buche', L, R, -19);
  console.log(nom.padEnd(10), JSON.stringify(res[nom]));
}
fs.writeFileSync(path.join(OUT, 'mesures-nitros.json'), JSON.stringify(res, null, 1));
