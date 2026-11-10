/* Banc Node du NITRO À MATIÈRE : le nitro est piloté PAR le moteur BÛCHE (même boucle : `fire` = la fréquence d'allumage du moteur à chaque bloc), rendu seul sur le moteur puis
   sous une vraie musique du jeu, et MESURÉ : part du nitro qui tombe sur les harmoniques du moteur (la superposition), planéité spectrale (bruit = haut, note = bas), centre de gravité.
   node rendu-nitro-matiere.cjs [dossier]   (défaut : ./ecoute-noel/matiere) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = '../../assets/audio/moteur-vivant/';
const { MoteurVivant, clamp } = require(D + 'moteur-vivant.js');
const { NitroBraise, PRESETS } = require(D + 'nitro-braise.js');
const { PneusDoux } = require(D + 'pneus-doux.js');
const { Pilote } = require('./conducteur.js');
const { ecritWav, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel', 'matiere')), TMP = path.join(OUT, '.tmp');
const COURSE = path.resolve(__dirname, '../../assets/audio/music/course');
fs.mkdirSync(TMP, { recursive: true });
const NOEL = { dur: 36, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [4, 'thr', .55], [14, 'thr', 1], [18, 'lift'], [21, 'thr', .4], [27, 'lift'], [31, 'idle']] };
const nitOn = t => (t >= 14.2 && t < 19.5) || (t >= 23 && t < 28);
const VARIANTES = [['vent', 'noel'], ['foyer', 'foyer'], ['forge', 'forge'], ['gouffre', 'gouffre']];   /* « vent » = le nitro du tour précédent, pour comparer */

function conduit(preset) {
  const m = new MoteurVivant('buche', SR, 20261109); m.health = 1; m.cleHz = 220; m.cyF = 220;
  const pil = new Pilote(m, NOEL), N = NOEL.dur * SR, EL = new Float32Array(N), ER = new Float32Array(N), NL = new Float32Array(N), NR = new Float32Array(N), fire = new Float32Array(Math.ceil(N / BL));
  const n = new NitroBraise(SR, 4242424, PRESETS[preset]); const C = m.cfg;
  for (let i0 = 0, k = 0; i0 < N; i0 += BL, k++) {
    const nb = Math.min(BL, N - i0), t = i0 / SR; pil.tick(BL / SR); m.process(EL, ER, nb, i0);
    fire[k] = m.rpmEff * C.pitch / 120 * C.n; n.fire = fire[k]; n.nit = nitOn(t) ? 1 : 0; n.speed = .6; n.process(NL, NR, nb, i0);
  }
  return { EL, ER, NL, NR, fire };
}
function pneus() { const N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), p = new PneusDoux(SR, 9191919);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; p.speed = t < 5 ? 0 : clamp(.25 + .02 * t, 0, .8); p.drift = (t >= 9 && t < 13) ? .55 : (t >= 24 && t < 31) ? 1 : 0; p.process(L, R, Math.min(BL, N - i0), i0); } return { L, R }; }
function lisWav(f) { const b = fs.readFileSync(f); let o = 12, ch = 2, d = null; while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') ch = b.readUInt16LE(o + 10); if (id === 'data') { d = b.subarray(o + 8, o + 8 + Math.min(sz, b.length - o - 8)); break; } o += 8 + sz + (sz & 1); }
  const n = Math.floor(d.length / 2 / ch), L = new Float32Array(n), R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = d.readInt16LE(i * ch * 2) / 32768; R[i] = d.readInt16LE((i * ch + (ch > 1 ? 1 : 0)) * 2) / 32768; } return { L, R }; }
const rmsDb = (x, a, b) => { let s = 0; const i0 = Math.floor(a * SR), i1 = Math.min(x.length, Math.floor(b * SR)); for (let i = i0; i < i1; i++) s += x[i] * x[i]; return 10 * Math.log10(s / (i1 - i0) + 1e-20); };
function ecrit(nom, L, R, cible) {
  const g = Math.pow(10, (cible - rmsDb(L, 0, L.length / SR)) / 20); let pk = 0;
  for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  if (pk > .95) { const k = .95 / pk; for (let i = 0; i < L.length; i++) { L[i] *= k; R[i] *= k; } }
  const f = path.join(OUT, nom + '.wav'); ecritWav(f, L, R, SR); cp.execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '192000', f, path.join(OUT, nom + '.m4a')]); fs.unlinkSync(f);
}
/* LES MESURES : sur le nitro SEUL, plein feu (15-19 s), image par image */
function mesures(NL, fire) {
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), w = new Float32Array(Nf); for (let i = 0; i < Nf; i++) w[i] = .5 - .5 * Math.cos(2 * Math.PI * i / Nf);
  const df = SR / Nf; let eH = 0, eT = 0, cov = 0, nb = 0, flat = 0, nf = 0, cen = 0, cenW = 0;
  for (let o = Math.floor(15 * SR); o + Nf < 19 * SR; o += Nf / 2) {
    for (let i = 0; i < Nf; i++) { re[i] = NL[o + i] * w[i]; im[i] = 0; } fftRe(re, im);
    const fz = fire[Math.floor((o + Nf / 2) / BL)], mark = new Uint8Array(Nf / 2); for (let k = 1; k <= 24; k++) { const f = k * fz; if (f > 2000) break; for (let b = Math.floor(f * .975 / df); b <= Math.ceil(f * 1.025 / df); b++) mark[b] = 1; }
    let lg = 0, ar = 0, cnt = 0;
    for (let b = Math.ceil(80 / df); b < Math.floor(2000 / df); b++) { const e = re[b] * re[b] + im[b] * im[b] + 1e-18; eT += e; if (mark[b]) { eH += e; cov++; } nb++; lg += Math.log(e); ar += e; cnt++; cen += e * b * df; cenW += e; }
    flat += Math.exp(lg / cnt) / (ar / cnt); nf++;
  }
  return { surLesHarmoniquesDuMoteur: +(100 * eH / eT).toFixed(1), attenduPourDuBruit: +(100 * cov / nb).toFixed(1), planeite: +(flat / nf).toFixed(3), centroide: Math.round(cen / cenW) };
}
const res = {}, PN = pneus();
const f1 = path.join(TMP, 'm.wav'); cp.execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', '-c', '2', path.join(COURSE, 'bleu-1275', 'p8.m4a'), f1]);
const M0 = lisWav(f1), N = NOEL.dur * SR, MUS = { L: new Float32Array(N), R: new Float32Array(N) }; for (let i = 0; i < N; i++) { MUS.L[i] = M0.L[i % M0.L.length]; MUS.R[i] = M0.R[i % M0.R.length]; } fs.unlinkSync(f1);
const dbMus = rmsDb(MUS.L, 4, 34);
for (const [nom, preset] of VARIANTES) {
  const c = conduit(preset); res[nom] = mesures(c.NL, c.fire);
  /* niveaux du jeu : moteur = musique − 7 dB (croisière), nitro = musique − 6 dB (plein feu), pneus = musique − 13 dB (virage) */
  const gE = Math.pow(10, ((dbMus - 7) - rmsDb(c.EL, 22, 26)) / 20), gN = Math.pow(10, ((dbMus - 6) - rmsDb(c.NL, 15, 19)) / 20), gP = Math.pow(10, ((dbMus - 13) - rmsDb(PN.L, 25, 30)) / 20);
  const L = new Float32Array(N), R = new Float32Array(N), L2 = new Float32Array(N), R2 = new Float32Array(N);
  for (let i = 0; i < N; i++) { const el = gE * c.EL[i] + gN * c.NL[i], er = gE * c.ER[i] + gN * c.NR[i]; L[i] = el; R[i] = er; L2[i] = MUS.L[i] + el + gP * PN.L[i]; R2[i] = MUS.R[i] + er + gP * PN.R[i]; }
  ecrit('mn-' + nom, L, R, -19); ecrit('mn-' + nom + '-musique', L2, R2, -16);
  console.log(nom.padEnd(8), JSON.stringify(res[nom]));
}
fs.rmSync(TMP, { recursive: true, force: true }); fs.writeFileSync(path.join(OUT, 'mesures.json'), JSON.stringify(res, null, 1));
