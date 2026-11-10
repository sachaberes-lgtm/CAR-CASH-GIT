/* Banc Node de la CHALEUR DE NOËL : rend les 5 moteurs (+ le V8 d'origine pour comparer), le nitro braise (+ l'ancien nitro), les pneus doux et un MÉLANGE,
   en WAV 16 bits, puis mesure ce qu'une oreille entendrait (centre de gravité, part d'aigu, régularité). Aucun navigateur.
   node rendu-noel.cjs [dossier]    (défaut : ./ecoute-noel) */
'use strict';
const fs = require('fs'), path = require('path');
const D = '../../assets/audio/moteur-vivant/';
const { MoteurVivant, CFG, clamp } = require(D + 'moteur-vivant.js');
const { NitroVivant } = require(D + 'nitro-vivant.js');
const { NitroBraise } = require(D + 'nitro-braise.js');
const { PneusDoux } = require(D + 'pneus-doux.js');
const { Pilote } = require('./conducteur.js');
const { ecritWav, spectro, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel'));
fs.mkdirSync(OUT, { recursive: true });

/* la conduite de l'écoute : ralenti, départ en douceur, accélération franche, lâcher (pops), croisière, lâcher, ralenti — 36 s */
const NOEL = { dur: 36, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [4, 'thr', .55], [14, 'thr', 1], [18, 'lift'], [21, 'thr', .4], [27, 'lift'], [31, 'idle']] };

function moteur(nom) {
  const m = new MoteurVivant(nom, SR, 20261109); m.health = 1; const pil = new Pilote(m, NOEL);
  const N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), vit = new Float32Array(Math.ceil(N / BL));
  for (let i0 = 0, k = 0; i0 < N; i0 += BL, k++) { const n = Math.min(BL, N - i0); pil.tick(BL / SR); vit[k] = pil.cond.v; m.process(L, R, n, i0); }
  return { L, R, vit };
}
function nitro(Cls, nom) {
  const N = 26 * SR, L = new Float32Array(N), R = new Float32Array(N), n = new Cls(SR, 4242424);
  const nit = t => (t >= 2 && t < 9) || (t >= 12 && t < 18) ? 1 : 0;
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; n.nit = nit(t); n.speed = clamp(.35 + .04 * t, 0, 1); n.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R };
}
function pneus() {
  const N = 26 * SR, L = new Float32Array(N), R = new Float32Array(N), p = new PneusDoux(SR, 9191919);
  const dr = t => t >= 3 && t < 8 ? .6 : t >= 10 && t < 16 ? 1 : t >= 18 && t < 21 ? .4 : 0;
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; p.speed = clamp(.3 + .03 * t, 0, 1); p.drift = dr(t); p.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R };
}
/* ---- mesures : ce que l'oreille perçoit de la CHALEUR, en chiffres ---- */
function mesure(L, R, a, b) {
  const x = []; for (let i = Math.floor(a * SR); i < Math.floor(b * SR); i++) x.push((L[i] + R[i]) / 2);
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf); let ps = new Float64Array(Nf / 2), cnt = 0;
  const w = new Float32Array(Nf); for (let i = 0; i < Nf; i++) w[i] = .5 - .5 * Math.cos(TAU * i / Nf);
  for (let o = 0; o + Nf < x.length; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * w[i]; im[i] = 0; } fftRe(re, im); for (let k = 0; k < Nf / 2; k++) ps[k] += re[k] * re[k] + im[k] * im[k]; cnt++; }
  let tot = 0, cen = 0, hi = 0, hi2 = 0; const df = SR / Nf;
  for (let k = 2; k < Nf / 2; k++) { const f = k * df, e = ps[k] / cnt; tot += e; cen += e * f; if (f > 2000) hi += e; if (f > 4000) hi2 += e; }
  const rms = Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length), pk = x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  /* la RÉPÉTITION : l'enveloppe (RMS par 20 ms) auto-corrélée sur 0,25-3 s ; plus c'est haut, plus l'oreille reconnaît un motif qui revient */
  const E = [], H = Math.round(.02 * SR); for (let i = 0; i + H < x.length; i += H) { let s = 0; for (let j = 0; j < H; j++) s += x[i + j] * x[i + j]; E.push(Math.sqrt(s / H)); }
  const mu = E.reduce((s, v) => s + v, 0) / E.length, Z = E.map(v => v - mu), v0 = Z.reduce((s, v) => s + v * v, 0); let rep = 0;
  for (let lag = 13; lag <= 150; lag++) { let s = 0; for (let i = 0; i + lag < Z.length; i++) s += Z[i] * Z[i + lag]; rep = Math.max(rep, s / v0); }
  return { centroide: Math.round(cen / tot), aigu2k: +(100 * hi / tot).toFixed(2), aigu4k: +(100 * hi2 / tot).toFixed(3), rmsDb: +(20 * Math.log10(rms)).toFixed(1), crete: +(20 * Math.log10(pk / rms)).toFixed(1), repetition: +rep.toFixed(2) };
}
const TAU = Math.PI * 2;
function sortie(nom, L, R, cible) {
  const N = L.length; let s = 0; for (let i = 0; i < N; i++) s += L[i] * L[i]; const rms = Math.sqrt(s / N);
  const g = Math.pow(10, (cible - 20 * Math.log10(rms)) / 20);                 /* même sonie pour tous : on compare des timbres, pas des volumes */
  let pk = 0; for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  if (pk > .95) { const k = .95 / pk; for (let i = 0; i < N; i++) { L[i] *= k; R[i] *= k; } }
  ecritWav(path.join(OUT, nom + '.wav'), L, R, SR); spectro(path.join(OUT, nom + '.png'), L, SR, { fmax: 4000 });
}
const res = {};
const liste = [['v8', 'REFERENCE v8 (le moteur vivant d\'origine)'], ['buche', 0], ['tisane', 0], ['braise', 0], ['chocolat', 0], ['veillee', 0]];
let melange = null;
for (const [nom] of liste) {
  const r = moteur(nom); res['moteur-' + nom] = mesure(r.L, r.R, 22, 26);                  /* mesuré en croisière (22-26 s) */
  res['moteur-' + nom + '·ralenti'] = mesure(r.L, r.R, 1, 4);
  if (nom === 'braise') melange = r;
  sortie('moteur-' + nom, r.L, r.R, -19);
}
const nOld = nitro(NitroVivant); res['nitro-ancien'] = mesure(nOld.L, nOld.R, 4, 8); sortie('nitro-ancien', nOld.L, nOld.R, -19);
const nBr = nitro(NitroBraise); res['nitro-braise'] = mesure(nBr.L, nBr.R, 4, 8); const nBr0 = { L: Float32Array.from(nBr.L), R: Float32Array.from(nBr.R) }; sortie('nitro-braise', nBr.L, nBr.R, -19);
const pn = pneus(); res['pneus-doux'] = mesure(pn.L, pn.R, 10, 15); const pn0 = { L: Float32Array.from(pn.L), R: Float32Array.from(pn.R) }; sortie('pneus-doux', pn.L, pn.R, -22);

/* LE MÉLANGE : BRAISE en moteur, le nitro de 14 à 22 s, les pneus en virage de 24 à 32 s — niveaux relatifs « comme en jeu » (moteur 1, nitro .8, pneus .55) */
{
  const N = melange.L.length, L = new Float32Array(N), R = new Float32Array(N), gm = 1, gn = .8, gp = .55;
  for (let i = 0; i < N; i++) {
    const t = i / SR, tn = t - 14, tp = t - 22;
    L[i] = melange.L[i] * gm; R[i] = melange.R[i] * gm;
    if (tn >= 0 && tn < 12) { const j = Math.floor((tn + 1) * SR); L[i] += nBr0.L[j] * gn; R[i] += nBr0.R[j] * gn; }   /* le nitro rendu à 1 s..13 s (son plein) */
    if (tp >= 0 && tp < 10) { const j = Math.floor((tp + 9) * SR); L[i] += pn0.L[j] * gp; R[i] += pn0.R[j] * gp; }        /* les pneus rendus à 9 s..19 s (le virage fort) */
  }
  res['melange'] = mesure(L, R, 16, 20); sortie('melange-en-jeu', L, R, -19);
}
fs.writeFileSync(path.join(OUT, 'mesures.json'), JSON.stringify(res, null, 1));
console.log('fichier'.padEnd(26), 'centroïde', 'aigu>2k%', 'aigu>4k%', 'RMS dB', 'crête-RMS', 'répétition');
for (const k in res) { const r = res[k]; console.log(k.padEnd(26), String(r.centroide).padStart(9), String(r.aigu2k).padStart(8), String(r.aigu4k).padStart(8), String(r.rmsDb).padStart(7), String(r.crete).padStart(9), String(r.repetition).padStart(10)); }
