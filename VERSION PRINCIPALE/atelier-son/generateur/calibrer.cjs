/* CALIBRER LE STUDIO : mesure le niveau (dBFS RMS) de chaque moteur, de chaque nitro, des pneus et des dix musiques de course, pour que les curseurs de la page parlent
   en RAPPORTS DU JEU (moteur −7 dB, nitro −6 dB, pneus −13 dB sous la musique) quel que soit le morceau ou le réglage choisi. Écrit calibration.json à côté de ce fichier.
   node calibrer.cjs    (macOS : décode les m4a avec afconvert) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = path.resolve(__dirname, '../../assets/audio/moteur-vivant/');
const { MoteurVivant, CFG } = require(D + '/moteur-vivant.js');
const { NitroMatiere, PRESETS: PM } = require(D + '/nitro-matiere.js');
const { NitroBraise, PRESETS: PB } = require(D + '/nitro-braise.js');
const { NitroFusee, FLAMMES } = require(D + '/nitro-fusee.js');
const { NitroHybride, HYBRIDE_PRESETS } = require(D + '/nitro-hybride.js');
const { PneusDoux } = require(D + '/pneus-doux.js');
const SR = 48000, BL = 128;
const db = (x, a, b) => { let s = 0; const i0 = Math.floor(a * SR), i1 = Math.min(x.length, Math.floor(b * SR)); for (let i = i0; i < i1; i++) s += x[i] * x[i]; return +(10 * Math.log10(s / (i1 - i0) + 1e-20)).toFixed(1); };
const out = { eng: {}, nit: {}, tyr: 0, mus: {}, f0Essai: 0 };
/* moteurs : au ralenti puis à 55 % du régime, pédale à 45 % (la croisière) — mesuré sur 8-12 s */
for (const nom of ['buche', 'tisane', 'braise', 'chocolat', 'veillee', 'v8', 'flat', 'l6']) {
  const m = new MoteurVivant(nom, SR, 20261109); m.health = 1; m.etat = 'run'; m.rpm = m.rpmEff = m.cfg.idle; const C = m.cfg, N = 14 * SR, L = new Float32Array(N), R = new Float32Array(N);
  for (let i0 = 0; i0 < N; i0 += BL) { const t = i0 / SR; m.rpmCmd = t < 3 ? C.idle : C.idle + (C.redline - C.idle) * .55; m.thr = t < 3 ? 0 : .45; m.load = t < 3 ? 0 : .5; m.process(L, R, BL, i0); }
  out.eng[nom] = db(L, 8, 12);
  if (nom === 'buche') out.f0Essai = Math.round(m.rpmEff * C.pitch / 120 * C.n);
}
/* nitros : plein feu 2-5 s, à la cadence du moteur de croisière */
const f0 = out.f0Essai;
function nit(make) { const n = make(), N = 6 * SR, L = new Float32Array(N), R = new Float32Array(N); for (let i0 = 0; i0 < N; i0 += BL) { n.nit = 1; n.speed = .6; n.f0 = f0; n.fire = f0; n.process(L, R, BL, i0); } return db(L, 3, 5.5); }
for (const k of Object.keys(PM)) out.nit['matiere:' + k] = nit(() => new NitroMatiere(SR, 31337, PM[k]));
for (const k of ['foyer', 'forge', 'gouffre', 'noel']) if (PB[k]) out.nit['braise:' + k] = nit(() => new NitroBraise(SR, 4242424, PB[k]));
for (const k of Object.keys(FLAMMES)) out.nit['fusee:' + k] = nit(() => new NitroFusee(SR, 5151515, FLAMMES[k]));
for (const k of Object.keys(HYBRIDE_PRESETS)) out.nit['hybride:' + k] = nit(() => new NitroHybride(SR, 1, HYBRIDE_PRESETS[k]));
/* pneus : vitesse 0,6, virage 0,8 */
{ const p = new PneusDoux(SR, 9191919), N = 6 * SR, L = new Float32Array(N), R = new Float32Array(N); for (let i0 = 0; i0 < N; i0 += BL) { p.speed = .6; p.drift = .8; p.process(L, R, BL, i0); } out.tyr = db(L, 3, 5.5); }
/* musiques : p8 de chacun des dix morceaux, 4-30 s */
const COURSE = path.resolve(__dirname, '../../assets/audio/music/course'), TMP = path.join(require('os').tmpdir(), 'calib-studio'); fs.mkdirSync(TMP, { recursive: true });
function lisWav(f) { const b = fs.readFileSync(f); let o = 12, ch = 2, d = null; while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') ch = b.readUInt16LE(o + 10); if (id === 'data') { d = b.subarray(o + 8, o + 8 + Math.min(sz, b.length - o - 8)); break; } o += 8 + sz + (sz & 1); }
  const n = Math.floor(d.length / 2 / ch), L = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = d.readInt16LE(i * ch * 2) / 32768; return L; }
for (const id of fs.readdirSync(COURSE).filter(x => fs.existsSync(path.join(COURSE, x, 'p8.m4a')))) {
  const f = path.join(TMP, id + '.wav'); cp.execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', '-c', '2', path.join(COURSE, id, 'p8.m4a'), f]);
  const L = lisWav(f); out.mus[id] = db(L, 4, Math.min(30, L.length / SR - 1)); fs.unlinkSync(f);
}
fs.writeFileSync(path.join(__dirname, 'calibration.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
