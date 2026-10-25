/* LE MOTEUR VIVANT TEL QUE LE JEU LE PILOTE (2026-10-22) : rejoue la boîte virtuelle de boucle-5-sons.js (engRpm en dents de scie par rapport, gaz coupés 0,12 s au passage)
   et les MÊMES conversions que MV.drive (code/son/moteur-vivant.js) → un WAV de ce que le joueur entendrait avec ?moteurvivant=1, sans ouvrir le jeu.
   node sim-jeu.cjs <palier 0..18> <dossier> */
'use strict';
const { MoteurVivant, CFG } = require('../../assets/audio/moteur-vivant/moteur-vivant.js');
const { ecritWav } = require('./rendu.cjs');
const SR = 48000, lv = +(process.argv[2] || 0), dos = process.argv[3] || '/tmp/mv';
const nomDe = l => (l === 5 || l === 6 || l === 8 || l === 17) ? 'l6' : l >= 12 ? 'flat' : 'v8';
const GR = [4, 4, 5, 5, 5, 5, 5, 6, 6, 5, 6, 6, 7, 7, 7, 8, 8, 7, 6][lv];     /* rapports de ENG_SND[lv].gr */
const C = { v8: { idle: 760, redline: 6500 }, flat: { idle: 900, redline: 8800 }, l6: { idle: 740, redline: 7000 } }[nomDe(lv)];
const m = new MoteurVivant(nomDe(lv), SR, 20261022); m.etat = 'run'; m.rpm = C.idle; m.rpmEff = C.idle;
const sante = [.40, .55, .68, .78][lv] || 1; m.health = sante;
const dur = 46, N = dur * SR, L = new Float32Array(N), R = new Float32Array(N);
let engRpm = 0, engGear = 1, engShiftT = 0, thrS = 0, spd = 0, sN = 0;
const dt = 64 / SR;
for (let i0 = 0; i0 < N; i0 += 64) {
  const t = i0 / SR;
  /* le scénario de conduite : on accélère à fond, lâcher à 20 s (drift), reprise à 24 s, lâcher à 36 s, reprise à 39 s */
  const up = !((t > 20 && t < 24) || (t > 36 && t < 39)) && t > 2;
  const thr = up ? 1 : 0;
  sN = Math.max(0, Math.min(1.06, sN + (up ? .028 : -.05) * dt));
  const gn = GR, lo = Math.pow((engGear - 1) / gn, 1.3), hi = Math.pow(engGear / gn, 1.3) * 1.05, pos = Math.min(1.05, Math.max(0, (sN - lo) / Math.max(.01, hi - lo)));
  if (pos > .99 && engGear < gn && up && engShiftT <= 0) { engGear++; engShiftT = .12; }
  else if (engGear > 1 && sN < lo * .95) engGear--;
  let tgt = Math.pow(Math.min(1, pos), .9); if (sN * 100 < 8) tgt = thr * .72; if (engShiftT > 0) { engShiftT -= dt; tgt *= .66; }
  engRpm += (tgt - engRpm) * Math.min(1, dt * (tgt > engRpm ? 8 : 5.5));
  /* === les conversions de MV.drive === */
  const thrIn = engShiftT > 0 ? 0 : thr; thrS = thrIn > thrS ? Math.min(thrIn, thrS + dt * 14) : thrIn;
  const charge = thr ? Math.max(0, Math.min(1, .26 + 2.6 * Math.max(0, (tgt - engRpm) * 3))) : 0; /* charge9 : monte avec l'accélération réelle */
  m.rpmCmd = C.idle + Math.min(1.02, engRpm) * (C.redline - C.idle); m.thr = thrS; m.load = thrS > .05 ? Math.min(1, Math.max(charge, .45)) : 0;
  m.process(L, R, Math.min(64, N - i0), i0);
}
const G = .55; for (let i = 0; i < N; i++) { L[i] *= G; R[i] *= G; }
require('fs').mkdirSync(dos, { recursive: true });
ecritWav(`${dos}/simjeu-palier${lv}-${nomDe(lv)}.wav`, L, R, SR);
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]));
console.log('palier', lv, nomDe(lv), 'santé', sante, 'crête', (20 * Math.log10(pk)).toFixed(1), 'dBFS');
