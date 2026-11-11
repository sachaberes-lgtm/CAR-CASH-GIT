/* Banc Node de la BÛCHE AFFINÉE : avant/après, avec et sans la touche cyber, puis le moteur + les pneus + le nitro SOUS de vraies musiques du jeu, calés comme en jeu
   (moteur = musique − 7 dB, pneus − 13 dB, nitro − 6 dB ; la tonique du halo = celle du morceau). Aucun navigateur.
   node rendu-affine.cjs [dossier]   (défaut : ./ecoute-noel/affine) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = '../../assets/audio/moteur-vivant/';
const { MoteurVivant, clamp } = require(D + 'moteur-vivant.js');
const { NitroBraise, PRESETS } = require(D + 'nitro-braise.js');
const { PneusDoux } = require(D + 'pneus-doux.js');
const { Pilote } = require('./conducteur.js');
const { ecritWav, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel', 'affine')), TMP = path.join(OUT, '.tmp');
const COURSE = path.resolve(__dirname, '../../assets/audio/music/course');
fs.mkdirSync(TMP, { recursive: true });
/* la tonique de chaque morceau (index.js : « ton ») → Hz, octave 3 : tonique, quinte et octave sonnent juste dans TOUS les modes (majeur, mineur, dorien, hirajoshi, hijaz…) */
const HZ = { do: 130.81, 'do#': 138.59, 'ré': 146.83, 'ré#': 155.56, mi: 164.81, fa: 174.61, 'fa#': 185.0, sol: 196.0, 'sol#': 207.65, 'la♭': 207.65, la: 220.0, 'la#': 233.08, si: 246.94 };
const MORCEAUX = [['bleu-1275', 'FEU DE LUXE', 'la majeur', 'la'], ['bleu-8338', 'RUBIS ULTRA', 'sol mineur', 'sol'], ['pal-asphalte', 'ASPHALTE D’ÉMERAUDE', 'mi mineur', 'mi'], ['bleu-6562', 'PLUIE D’ARGENT', 'do♯ mineur', 'do#']];
const NOEL = { dur: 36, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [4, 'thr', .55], [14, 'thr', 1], [18, 'lift'], [21, 'thr', .4], [27, 'lift'], [31, 'idle']] };

function moteur(nom, over, cle) {
  const m = new MoteurVivant(nom, SR, 20261109); Object.assign(m.cfg, over || {}); m.applyCfg(); m.health = 1; m.cleHz = cle || 220; m.cyF = m.cleHz;
  const pil = new Pilote(m, NOEL), N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N); m.rmsAcc = {};
  for (let i0 = 0; i0 < N; i0 += BL) { pil.tick(BL / SR); m.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R, acc: m.rmsAcc };
}
function nitro() {
  const N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), n = new NitroBraise(SR, 4242424, PRESETS.noel);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; n.nit = (t >= 14.2 && t < 19.5) || (t >= 23 && t < 28) ? 1 : 0; n.speed = .6; n.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R };
}
function pneus() {
  const N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), p = new PneusDoux(SR, 9191919);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; p.speed = t < 5 ? 0 : clamp(.25 + .02 * t, 0, .8); p.drift = (t >= 9 && t < 13) ? .55 : (t >= 24 && t < 31) ? 1 : 0; p.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R };
}
function lisWav(f) { const b = fs.readFileSync(f); let o = 12, ch = 2, d = null; while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') ch = b.readUInt16LE(o + 10); if (id === 'data') { d = b.subarray(o + 8, o + 8 + Math.min(sz, b.length - o - 8)); break; } o += 8 + sz + (sz & 1); }
  const n = Math.floor(d.length / 2 / ch), L = new Float32Array(n), R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = d.readInt16LE(i * ch * 2) / 32768; R[i] = d.readInt16LE((i * ch + (ch > 1 ? 1 : 0)) * 2) / 32768; } return { L, R }; }
const rmsDb = (x, a, b) => { let s = 0; const i0 = Math.floor(a * SR), i1 = Math.min(x.length, Math.floor(b * SR)); for (let i = i0; i < i1; i++) s += x[i] * x[i]; return 10 * Math.log10(s / (i1 - i0) + 1e-20); };
function ecrit(nom, L, R, cible) {
  const g = Math.pow(10, (cible - rmsDb(L, 0, L.length / SR)) / 20); let pk = 0;
  for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
  if (pk > .95) { const k = .95 / pk; for (let i = 0; i < L.length; i++) { L[i] *= k; R[i] *= k; } }
  const f = path.join(OUT, nom + '.wav'); ecritWav(f, L, R, SR); cp.execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '192000', f, path.join(OUT, nom + '.m4a')]); fs.unlinkSync(f);
}
const res = {};
/* 1) avant / après (cle = la, 220 Hz) */
const A = moteur('buche1'), B0 = moteur('buche', { cyber: 0 }, 220), B1 = moteur('buche', {}, 220);
ecrit('buche-avant', A.L.slice(), A.R.slice(), -19); ecrit('buche-sans-cyber', B0.L.slice(), B0.R.slice(), -19); ecrit('buche-cyber', B1.L.slice(), B1.R.slice(), -19);
const eng = rmsDb(B1.L, 22, 26), cy = 10 * Math.log10((B1.acc.cyber || 1e-20) / B1.L.length);
res.niveaux = { moteurCroisiereDb: +eng.toFixed(1), cyberMoyenDb: +cy.toFixed(1), cyberSousMoteurDb: +(cy - 10 * Math.log10(B1.L.reduce((s, v) => s + v * v, 0) / B1.L.length)).toFixed(1) };
/* 2) mixes sous les vraies musiques */
const NI = nitro(), PN = pneus();
for (const [id, titre, ton, tn] of MORCEAUX) {
  const f = path.join(TMP, id + '.wav'); cp.execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', '-c', '2', path.join(COURSE, id, 'p8.m4a'), f]);
  const M = lisWav(f), N = NOEL.dur * SR, mus = { L: new Float32Array(N), R: new Float32Array(N) };
  for (let i = 0; i < N; i++) { mus.L[i] = M.L[i % M.L.length]; mus.R[i] = M.R[i % M.R.length]; }
  const e = moteur('buche', {}, HZ[tn]);
  const dbMus = rmsDb(mus.L, 4, 34), gE = Math.pow(10, ((dbMus - 7) - rmsDb(e.L, 22, 26)) / 20), gN = Math.pow(10, ((dbMus - 6) - rmsDb(NI.L, 15, 19)) / 20), gP = Math.pow(10, ((dbMus - 13) - rmsDb(PN.L, 25, 30)) / 20);
  const L = new Float32Array(N), R = new Float32Array(N);
  for (let i = 0; i < N; i++) { L[i] = mus.L[i] + gE * e.L[i] + gN * NI.L[i] + gP * PN.L[i]; R[i] = mus.R[i] + gE * e.R[i] + gN * NI.R[i] + gP * PN.R[i]; }
  ecrit('mix-' + id, L, R, -16);
  res['mix-' + id] = { titre, ton, toniqueHz: HZ[tn] };
  fs.unlinkSync(f);
}
const Lm = new Float32Array(NOEL.dur * SR), Rm = new Float32Array(NOEL.dur * SR); { const f = path.join(TMP, 'm.wav'); cp.execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', '-c', '2', path.join(COURSE, 'bleu-1275', 'p8.m4a'), f]); const M = lisWav(f); for (let i = 0; i < Lm.length; i++) { Lm[i] = M.L[i % M.L.length]; Rm[i] = M.R[i % M.R.length]; } fs.unlinkSync(f); }
ecrit('musique-seule-bleu-1275', Lm, Rm, -16);
fs.rmSync(TMP, { recursive: true, force: true });
fs.writeFileSync(path.join(OUT, 'mesures.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
