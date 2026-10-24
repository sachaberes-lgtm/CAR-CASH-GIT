/* LE MIXEUR du MOTEUR VIVANT : superpose un scénario moteur à une VRAIE musique de course (un palier rendu du jeu) et rend le même passage en deux versions —
     BRUT   : moteur et musique simplement additionnés (ce que fait un jeu sans mixage) ;
     RÉGLÉ  : le mixage que je propose — coupe-bas du moteur, creux dynamique de la musique là où parle le moteur, recul de la musique sous les pops.
   Il imprime aussi les chiffres (bandes d'octave, masquage) qui justifient les réglages.
   node melange.cjs <scénario> <moteur> <musique.wav> <dossier> [dB moteur] */
'use strict';
const fs = require('fs'), path = require('path');
const { MoteurVivant, CFG, clamp } = require('../../assets/audio/moteur-vivant/moteur-vivant.js');
const { Pilote, SCEN } = require('./conducteur.js');
const { ecritWav, fftRe } = require('./rendu.cjs');
const SR = 48000;

function lisWav(f) { const b = fs.readFileSync(f); let o = 12; while (b.toString('ascii', o, o + 4) !== 'data') o += 8 + b.readUInt32LE(o + 4); const ch = b.readUInt16LE(22), n = b.readUInt32LE(o + 4) / 2 / ch; const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = b.readInt16LE(o + 8 + i * 2 * ch) / 32768; return x; }
/* biquad (mêmes formules que le moteur) */
function Bq() { this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0; this.z1 = 0; this.z2 = 0; }
Bq.prototype.peak = function (f, q, g) { const A = Math.pow(10, g / 40), w = 2 * Math.PI * f / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q); const a0 = 1 + al / A; this.b0 = (1 + al * A) / a0; this.b1 = -2 * c / a0; this.b2 = (1 - al * A) / a0; this.a1 = -2 * c / a0; this.a2 = (1 - al / A) / a0; return this; };
Bq.prototype.hp = function (f, q) { const w = 2 * Math.PI * f / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; this.b0 = (1 + c) / 2 / a0; this.b1 = -(1 + c) / a0; this.b2 = this.b0; this.a1 = -2 * c / a0; this.a2 = (1 - al) / a0; return this; };
Bq.prototype.p = function (x) { const y = this.b0 * x + this.z1; this.z1 = this.b1 * x - this.a1 * y + this.z2; this.z2 = this.b2 * x - this.a2 * y; return y; };

const EDGES = [40, 80, 160, 315, 630, 1250, 2500, 5000, 10000];
/* énergie par bande d'octave sur [a,b) (moyenne de FFT 8192, fenêtre de Hann), en dB */
function bandesSeg(x, a, b) { const N = 8192, acc = new Float64Array(N / 2); let c = 0; for (let o = a; o + N <= b; o += N / 2) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / N)); fftRe(re, im); for (let k = 0; k < N / 2; k++) acc[k] += (re[k] * re[k] + im[k] * im[k]) / N / N; c++; }
  const df = SR / N, out = []; for (let q = 0; q < EDGES.length - 1; q++) { let s = 0; for (let k = Math.round(EDGES[q] / df); k < Math.round(EDGES[q + 1] / df); k++) s += acc[k]; out.push(10 * Math.log10(s / Math.max(1, c) + 1e-14)); } return out; }
function rendMoteur(nom, moteur, dur) {
  const sc = SCEN[nom], m = new MoteurVivant(moteur, SR, 20261022); m.health = 1; const pil = new Pilote(m, sc);
  const N = Math.round((dur || sc.dur) * SR), L = new Float32Array(N), R = new Float32Array(N);
  for (let i0 = 0; i0 < N; i0 += 64) { pil.tick(64 / SR); m.process(L, R, Math.min(64, N - i0), i0); }
  return { L, R };
}
function rmsDb(x, a, b) { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return 10 * Math.log10(s / (b - a) + 1e-12); }
/* sonie pondérée « K » simplifiée (coupe-bas 60 Hz + étagère +4 dB à 1,5 kHz) : suffisante pour COMPARER deux sons */
function kw(x) { const h = new Bq().hp(60, .7), y = new Float32Array(x.length); const sh = new Bq(); { const A = Math.pow(10, 4 / 40), w = 2 * Math.PI * 1500 / SR, c = Math.cos(w), al = Math.sin(w) / (2 * .7); const be = 2 * Math.sqrt(A) * al; const a0 = (A + 1) - (A - 1) * c + be; sh.b0 = A * ((A + 1) + (A - 1) * c + be) / a0; sh.b1 = -2 * A * ((A - 1) + (A + 1) * c) / a0; sh.b2 = A * ((A + 1) + (A - 1) * c - be) / a0; sh.a1 = 2 * ((A - 1) - (A + 1) * c) / a0; sh.a2 = ((A + 1) - (A - 1) * c - be) / a0; } for (let i = 0; i < x.length; i++) y[i] = sh.p(h.p(x[i])); return y; }

function melange(scn, moteur, musF, dossier, dbMot) {
  const E = rendMoteur(scn, moteur), N = E.L.length;
  const mus0 = lisWav(musF), mus = new Float32Array(N); for (let i = 0; i < N; i++) mus[i] = mus0[i % mus0.length];
  /* niveaux : la musique à −14 dBFS RMS (ce que fait le bus du jeu), le moteur placé par rapport à elle */
  const rm = rmsDb(mus, 0, N); const gM = Math.pow(10, (-16 - rm) / 20);
  const kE = kw(E.L), kM = kw(mus.map(v => v * gM));
  /* le moteur est calé sur la sonie de la MUSIQUE : sa médiane en marche (fenêtres de 1 s, hors silences) = musique − 7 dB */
  const w = SR, ve = []; for (let a = 0; a + w <= N; a += w) { const d = rmsDb(kE, a, a + w); if (d > -55) ve.push(d); } ve.sort((a, b) => a - b); const med = ve[ve.length >> 1];
  const vm = []; for (let a = 0; a + w <= N; a += w) vm.push(rmsDb(kM, a, a + w)); vm.sort((a, b) => a - b); const medM = vm[vm.length >> 1];
  /* calage : sur le 3e QUARTILE du moteur (quand on roule), pas sur la médiane (les ralentis la tireraient) : moteur(roulant) = musique − 7 dB */
  const q75 = ve[Math.floor(ve.length * .75)];
  const gE = Math.pow(10, (medM - 7 - q75 + (dbMot || 0)) / 20);
  console.log(`musique K ${medM.toFixed(1)} dB · moteur K médian ${med.toFixed(1)} / roulant ${q75.toFixed(1)} dB → gain moteur ${(20 * Math.log10(gE)).toFixed(1)} dB (cible : moteur roulant = musique − 7)`);
  const A = { L: new Float32Array(N), R: new Float32Array(N) }, B = { L: new Float32Array(N), R: new Float32Array(N) };
  /* BRUT */
  for (let i = 0; i < N; i++) { const m = mus[i] * gM; A.L[i] = m + E.L[i] * gE; A.R[i] = m + E.R[i] * gE; }
  /* RÉGLÉ : coupe-bas du moteur à 55 Hz, creux dynamique (2 cloches à 850 et 1 800 Hz — là où mesure le moteur couvre la musique — suivies par la présence du moteur, lissage 250 ms), recul de la musique de −2 dB à l'attaque d'un pop */
  const hpl = new Bq().hp(55, .7), hpr = new Bq().hp(55, .7), c1 = new Bq(), c2 = new Bq();
  let pres = 0, env = 0, rec = 0; const aP = Math.exp(-1 / (SR * .25)), aE = Math.exp(-1 / (SR * .02));
  const DEP = 3.5; let k1 = -1;
  for (let i = 0; i < N; i++) {
    const el = hpl.p(E.L[i]) * gE, er = hpr.p(E.R[i]) * gE;
    env = Math.max(Math.abs(el), env * aE); pres = pres * aP + Math.min(1, env / .12) * (1 - aP);
    if ((i & 63) === 0) { c1.peak(850, .9, -DEP * pres); c2.peak(1800, .9, -DEP * .7 * pres); }
    const m = c2.p(c1.p(mus[i] * gM));
    B.L[i] = m + el; B.R[i] = m + er;
  }
  /* limiteur doux final (−1 dBFS) */
  for (const X of [A, B]) { let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(X.L[i]), Math.abs(X.R[i])); const g = pk > .89 ? .89 / pk : 1; for (let i = 0; i < N; i++) { X.L[i] *= g; X.R[i] *= g; } console.log('crête', (20 * Math.log10(pk * g)).toFixed(1), 'dBFS (gain de sécurité', (20 * Math.log10(g)).toFixed(1), 'dB)'); }
  /* LE MASQUAGE : sur les fenêtres où le moteur est fort, l'écart moteur − musique par bande. > −3 dB = le moteur couvre la musique (zone rouge) ; < −14 = le moteur n'existe plus. */
  const loud = []; for (let a = 0; a + 2 * SR <= N; a += SR) if (rmsDb(kE, a, a + SR) >= q75 - 1.5) loud.push(a);
  const acc = { eng: new Array(8).fill(0), mA: new Array(8).fill(0), mB: new Array(8).fill(0), eB: new Array(8).fill(0) };
    let rows = [];
  for (const a of loud.slice(0, 40)) { const be = bandesSeg(E.L.map(v => v * gE), a, a + 2 * SR), bm = bandesSeg(mus.map(v => v * gM), a, a + 2 * SR); rows.push(be.map((v, i) => v - bm[i])); }
  if (rows.length) { const avg = rows[0].map((_, i) => rows.reduce((s, r) => s + r[i], 0) / rows.length); console.log('écart moteur − musique par bande (BRUT, fenêtres où le moteur roule) :'); console.log('  ' + EDGES.slice(0, -1).map(v => String(v).padStart(6)).join('') + ' Hz'); console.log('  ' + avg.map(v => v.toFixed(1).padStart(6)).join('') + ' dB   (> −3 : le moteur couvre la musique)'); }
  fs.mkdirSync(dossier, { recursive: true });
  const base = path.join(dossier, `melange-${scn}-${moteur}-${path.basename(musF, '.wav')}`);
  ecritWav(base + '-BRUT.wav', A.L, A.R, SR); ecritWav(base + '-REGLE.wav', B.L, B.R, SR);
  console.log(base + '-{BRUT,REGLE}.wav');
  return { A, B, E, mus: mus.map(v => v * gM), gE };
}
module.exports = { melange, rendMoteur, lisWav, rmsDb, kw };
if (require.main === module) { const [, , scn, mot, mus, dos, db] = process.argv; melange(scn || 'vie', mot || 'v8', mus, dos || '/tmp/mv', db ? +db : 0); }
