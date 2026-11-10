/* Banc Node du NITRO À MATIÈRE : le moteur (bûche affinée) rendu une fois, sa fréquence d'allumage f0(t) relevée bloc par bloc, puis chaque nitro rendu EN SUIVANT ce f0
   (l'ancien « noël » en bruit, lui, ne suit rien). Mesures objectives (la rigueur demandée : on ne choisit pas à l'oreille seule) :
     harmonicité   part de l'énergie 80-3000 Hz qui tombe à ±2,5 % d'un multiple de f0 (du vent : ~5 % ; un son accroché au moteur : > 40 %)
     platitude     moyenne géométrique / arithmétique du spectre 80-4000 Hz (1 = bruit blanc = « du vent » ; bas = de la matière tonale)
     contours      écart-type / moyenne de l'enveloppe 0,8-4 kHz en fenêtres de 1,5 ms (un souffle lisse = bas ; des coups = haut)
   Sort : des clips m4a dans ecoute-noel/matiere/ (nitro seul, moteur + nitro, sous quatre musiques du jeu) + mesures.json.   node rendu-matiere.cjs [dossier] */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const D = '../../assets/audio/moteur-vivant/';
const { MoteurVivant, clamp, Bq } = require(D + 'moteur-vivant.js');
const { NitroBraise, PRESETS: PB } = require(D + 'nitro-braise.js');
const { NitroMatiere, PRESETS: PM } = require(D + 'nitro-matiere.js');
const { Pilote } = require('./conducteur.js');
const { ecritWav, fftRe } = require('./rendu.cjs');
const SR = 48000, BL = 64, OUT = path.resolve(process.argv[2] || path.join(__dirname, 'ecoute-noel', 'matiere')), TMP = path.join(OUT, '.tmp');
const COURSE = path.resolve(__dirname, '../../assets/audio/music/course');
fs.mkdirSync(TMP, { recursive: true });
const NOEL = { dur: 36, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [4, 'thr', .55], [14, 'thr', 1], [18, 'lift'], [21, 'thr', .4], [27, 'lift'], [31, 'idle']] };
const HZ = { la: 220, sol: 196, mi: 164.81, 'do#': 138.59 };
const MORCEAUX = [['bleu-1275', 'Feu de Luxe', 'la'], ['bleu-8338', 'Rubis Ultra', 'sol'], ['pal-asphalte', 'Asphalte d\'Émeraude', 'mi'], ['bleu-6562', 'Pluie d\'Argent', 'do#']];
const nitOn = t => (t >= 14.2 && t < 19.5) || (t >= 23 && t < 28) ? 1 : 0;

/* le moteur, une fois ; on relève f0 (Hz) à chaque bloc */
function moteur(cle) {
  const m = new MoteurVivant('buche', SR, 20261109); m.applyCfg(); m.health = 1; m.cleHz = cle; m.cyF = cle;
  const pil = new Pilote(m, NOEL), N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), nb = Math.ceil(N / BL), f0 = new Float32Array(nb);
  for (let b = 0, i0 = 0; i0 < N; i0 += BL, b++) { pil.tick(BL / SR); m.process(L, R, Math.min(BL, N - i0), i0); f0[b] = (m.rpmEff || m.rpm) * m.cfg.pitch / 120 * m.cfg.n;   /* la manivelle du moteur avance à rpm × pitch / 120 (cycle de 720°), n coups par cycle */ }
  return { L, R, f0 };
}
function nitroMatiere(preset, f0) {
  const N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), n = new NitroMatiere(SR, 31337, preset);
  for (let b = 0, i0 = 0; i0 < N; i0 += BL, b++) { n.nit = nitOn(i0 / SR); n.speed = .6; n.f0 = f0[b]; n.process(L, R, Math.min(BL, N - i0), i0); }
  return { L, R };
}
function nitroAncien() {
  const N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), n = new NitroBraise(SR, 4242424, PB.noel);
  for (let i0 = 0; i0 < N; i0 += BL) { n.nit = nitOn(i0 / SR); n.speed = .6; n.process(L, R, Math.min(BL, N - i0), i0); }
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
/* ---- les mesures sur le plein feu (15-19 s) ---- */
function mesure(x, f0) {
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf); let eh = 0, et = 0, lg = 0, la = 0, nk = 0, cnt = 0;
  for (let o = Math.floor(15 * SR); o + Nf < 19 * SR; o += Nf / 2) {
    const fz = f0[Math.floor((o + Nf / 2) / BL)];
    for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
    for (let k = 1; k < Nf / 2; k++) {
      const f = k * SR / Nf; if (f < 80 || f > 3000) continue; const e = re[k] * re[k] + im[k] * im[k]; et += e;
      const h = Math.round(f / fz); if (h >= 1 && Math.abs(f - h * fz) <= .025 * h * fz) eh += e;
    }
    for (let k = 1; k < Nf / 2; k++) { const f = k * SR / Nf; if (f < 80 || f > 4000) continue; const e = re[k] * re[k] + im[k] * im[k] + 1e-18; lg += Math.log(e); la += e; nk++; }
    cnt++;
  }
  /* contours : enveloppe 0,8-4 kHz */
  const hp = new Bq().set('hp', 800, .7, 0, SR), lp = new Bq().set('lp', 4000, .7, 0, SR), W = Math.floor(.0015 * SR), env = [];
  let acc = 0, c = 0; for (let i = Math.floor(15 * SR); i < 19 * SR; i++) { const y = lp.p(hp.p(x[i])); acc += y * y; if (++c === W) { env.push(Math.sqrt(acc / W)); acc = 0; c = 0; } }
  const mu = env.reduce((s, v) => s + v, 0) / env.length, sd = Math.sqrt(env.reduce((s, v) => s + (v - mu) * (v - mu), 0) / env.length);
  return { harmonicite: +(100 * eh / et).toFixed(1), platitude: +(Math.exp(lg / nk) / (la / nk)).toFixed(4), contours: +(sd / mu).toFixed(2) };
}
const res = { niveaux: {}, mesures: {} };
const E = moteur(220);
const ANC = nitroAncien();
const VAR = { matiere: nitroMatiere(PM.matiere, E.f0), plus: nitroMatiere(PM.plus, E.f0), chaud: nitroMatiere(PM.chaud, E.f0) };
res.mesures.ancien_noel = mesure(ANC.L, E.f0); for (const k of Object.keys(VAR)) res.mesures[k] = mesure(VAR[k].L, E.f0);
/* le moteur seul, pour référence : sa propre harmonicité (le plafond) */
res.mesures.moteur_seul = mesure(E.L, E.f0);
/* les clips : le nitro SEUL (pour entendre la matière), puis moteur + nitro (rapport du jeu : nitro = moteur − 1 dB sur le plein feu), puis sous musiques (moteur −7, nitro −6 re. musique) */
const lvlE = rmsDb(E.L, 15, 19);
const coupes = { ancien: ANC, ...VAR };
for (const [nom, X] of Object.entries(coupes)) {
  const gN = Math.pow(10, ((lvlE - 1) - rmsDb(X.L, 15, 19)) / 20), N = E.L.length, L = new Float32Array(N), R = new Float32Array(N), Ls = new Float32Array(N), Rs = new Float32Array(N);
  for (let i = 0; i < N; i++) { L[i] = E.L[i] + gN * X.L[i]; R[i] = E.R[i] + gN * X.R[i]; Ls[i] = gN * X.L[i]; Rs[i] = gN * X.R[i]; }
  ecrit('moteur-nitro-' + nom, L, R, -19); ecrit('nitro-seul-' + nom, Ls, Rs, -19);
  res.niveaux['moteur-nitro-' + nom] = { nitroRelMoteurDb: -1, gain: +gN.toFixed(3) };
}
for (const [id, titre, tn] of MORCEAUX) {
  const f = path.join(TMP, id + '.wav'); cp.execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@48000', '-c', '2', path.join(COURSE, id, 'p8.m4a'), f]);
  const M = lisWav(f), N = NOEL.dur * SR, mus = { L: new Float32Array(N), R: new Float32Array(N) };
  for (let i = 0; i < N; i++) { mus.L[i] = M.L[i % M.L.length]; mus.R[i] = M.R[i % M.R.length]; }
  const e = tn === 'la' ? E : moteur(HZ[tn]);
  const dbMus = rmsDb(mus.L, 4, 34), gE = Math.pow(10, ((dbMus - 7) - rmsDb(e.L, 22, 26)) / 20);
  for (const nom of ['ancien', 'matiere']) {
    const X = nom === 'ancien' ? ANC : (tn === 'la' ? VAR.matiere : nitroMatiere(PM.matiere, e.f0));
    const gN = Math.pow(10, ((dbMus - 6) - rmsDb(X.L, 15, 19)) / 20), L = new Float32Array(N), R = new Float32Array(N);
    for (let i = 0; i < N; i++) { L[i] = mus.L[i] + gE * e.L[i] + gN * X.L[i]; R[i] = mus.R[i] + gE * e.R[i] + gN * X.R[i]; }
    ecrit('mix-' + nom + '-' + id, L, R, -16);
  }
  res.niveaux['mix-' + id] = { titre, toniqueHz: HZ[tn] };
  fs.unlinkSync(f);
}
fs.rmSync(TMP, { recursive: true, force: true });
fs.writeFileSync(path.join(OUT, 'mesures.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res.mesures, null, 1));
