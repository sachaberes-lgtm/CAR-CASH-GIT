/* ===== LE BANC DU MINI CASH (hors ligne, Node) — on MESURE ce qu'on ne peut pas écouter (2026-11-05, session SON) =====
   Joue la même conduite que la page (ralenti · pleins gaz · lâcher · nitro avec ses pétarades · atterrissage · rupteur) à travers EXACTEMENT le code du
   processeur audio (moteur vivant + nitro vivant + couches + filtre doux), et dit où va l'énergie :
     bandes   l'énergie par bande, en dB par rapport au total (le ronron vit sous 600 Hz ; au-dessus de 1,5 kHz, ça pique)
     crête    la pire fenêtre de 5 ms au-dessus de la moyenne (les claquements : > 12 dB = un coup de fusil, < 8 dB = un feu qui craque)
     pic      l'échantillon le plus fort
   Usage :  node banc.cjs [graines…]          (sans graine : 12 moteurs)
            node banc.cjs --brut [graines…]  (sans filtre doux, pour comparer)
            node banc.cjs --wav 42           (écrit mini-42.wav à côté, pour écouter un moteur précis) */
'use strict';
const path = require('path'), fs = require('fs');
const MV = require('../../assets/audio/moteur-vivant/moteur-vivant.js');
const NV = require('../../assets/audio/moteur-vivant/nitro-vivant.js');
const DX = require('./doux.js');
const G = require('./generateur.js');
const sr = 48000, N = 128;

function bandes() {
  const mk = (t, f) => new MV.Bq().set(t, f, .7, 0, sr);
  return [['<150', [mk('lp', 150)]], ['150-600', [mk('hp', 150), mk('lp', 600)]], ['600-1.5k', [mk('hp', 600), mk('lp', 1500)]], ['1.5-4k', [mk('hp', 1500), mk('lp', 4000)]], ['>4k', [mk('hp', 4000)]]]
    .map(([n, f]) => ({ n, f, s: 0 }));
}

/* la conduite : [t0, t1, fonction(t) → {thr, rpmN, nit, ev}] */
function joue(m, opt) {
  const e = new MV.MoteurVivant(m.fiche, sr, 20261105); e.etat = 'run'; e.rpm = e.cfg.idle; e.rpmEff = e.rpm; e.health = m.sante == null ? 1 : m.sante;
  if (m.couches) Object.assign(e.G, m.couches);
  const n = new NV.NitroVivant(sr, 7654321, m.nitro || {});
  const dx = new DX.Doux(sr); dx.regle(opt.douceur);
  const C = e.cfg, bd = bandes(), dur = 13;
  const L = new Float32Array(N), R = new Float32Array(N), L2 = new Float32Array(N), R2 = new Float32Array(N);
  const wav = opt.wav ? new Float32Array(dur * sr * 2) : null;
  let tot = 0, cnt = 0, pk = 0, w = 0, wn = 0, wMax = 0, popT = 0, rnd = 12345;
  const hasard = () => { rnd ^= rnd << 13; rnd >>>= 0; rnd ^= rnd >>> 17; rnd ^= rnd << 5; rnd >>>= 0; return rnd / 4294967296; };
  for (let i = 0; i < dur * sr; i += N) {
    const t = i / sr; let thr = 0, rpm = C.idle, nit = 0;
    if (t < 1) { } else if (t < 4) { thr = 1; rpm = C.idle + (C.limit * .95 - C.idle) * (t - 1) / 3; }
    else if (t < 5.5) { rpm = C.limit * .8 - (t - 4) * 1500; }
    else if (t < 8) { thr = 1; rpm = C.limit * .7 + (t - 5.5) * 500; nit = t > 6 ? 1 : 0; }
    else if (t < 10) { rpm = Math.max(C.idle, 4000 - (t - 8) * 1200); }
    else if (t < 11.5) { thr = 1; rpm = C.limit; }
    else { rpm = C.idle * 1.4; }
    e.thr = thr; e.load = thr; e.rpmCmd = Math.min(rpm, C.limit);
    if (t >= 9 && t < 9 + N / sr) { e.coup(opt.coup); e.pop(opt.popAtt, 0); }
    if (nit && t >= popT) { popT = t + opt.popGap[0] + hasard() * opt.popGap[1]; e.pop(opt.popA[0] + hasard() * opt.popA[1], 0); }
    e.process(L, R, N, 0); n.nit = nit; n.speed = .8; n.process(L2, R2, N, 0);
    for (let k = 0; k < N; k++) { L[k] = L[k] + L2[k] * .8; R[k] = R[k] + R2[k] * .8; }
    if (opt.douceur > .001) dx.process(L, R, N);
    for (let k = 0; k < N; k++) {
      const v = L[k]; tot += v * v; cnt++; pk = Math.max(pk, Math.abs(v)); w += v * v; wn++;
      if (wn === 240) { wMax = Math.max(wMax, w / wn); w = 0; wn = 0; }
      for (const b of bd) { let x = v; for (const f of b.f) x = f.p(x); b.s += x * x; }
      if (wav) { wav[(i + k) * 2] = L[k]; wav[(i + k) * 2 + 1] = R[k]; }
    }
  }
  const rms = Math.sqrt(tot / cnt), db = (x) => 10 * Math.log10(x);
  return { rms, crete: 20 * Math.log10(Math.sqrt(wMax) / rms), pic: pk, bandes: bd.map((b) => [b.n, db(b.s / tot)]), wav };
}

function ecritWav(nom, d) {
  const b = Buffer.alloc(44 + d.length * 2), pk = d.reduce((a, v) => Math.max(a, Math.abs(v)), 0) || 1, g = .7 / pk;
  b.write('RIFF', 0); b.writeUInt32LE(36 + d.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(d.length * 2, 40);
  for (let i = 0; i < d.length; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(d[i] * g * 32767))), 44 + i * 2);
  fs.writeFileSync(nom, b);
}

/* les réglages de la PAGE (mini-cash.js) : on les garde ici en miroir — si on les change là-bas, on les change ici */
const PAGE = { douceur: .75, coup: .45, popAtt: .4, popGap: [.28, .5], popA: [.2, .3] };
const BRUT_ANCIEN = { douceur: 0, coup: .9, popAtt: .6, popGap: [.05, .22], popA: [.35, .75] };

if (require.main === module) {
  const a = process.argv.slice(2), brut = a.includes('--brut'), wavI = a.indexOf('--wav');
  const graines = a.filter((x) => /^\d+$/.test(x)).map(Number);
  const liste = graines.length ? graines : [1, 2, 3, 5, 7, 8, 13, 16, 42, 99, 314, 2026];
  const opt = brut ? BRUT_ANCIEN : PAGE;
  const f = (r) => 'rms ' + r.rms.toFixed(3) + ' · crête ' + r.crete.toFixed(1) + ' dB · pic ' + r.pic.toFixed(2) + ' · ' + r.bandes.map(([n, v]) => n + ' ' + v.toFixed(1)).join('  ');
  for (const g of liste) {
    const m = G.genere(g), r = joue(m, Object.assign({ wav: wavI >= 0 }, opt));
    console.log(m.nom.padEnd(34), f(r));
    if (r.wav) { const nom = path.join(__dirname, 'mini-' + g + '.wav'); ecritWav(nom, r.wav); console.log('  → ' + nom); }
  }
}
module.exports = { joue, PAGE, BRUT_ANCIEN };
