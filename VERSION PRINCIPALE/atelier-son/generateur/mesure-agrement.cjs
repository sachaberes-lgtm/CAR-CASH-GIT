/* L'AGRÉMENT, MESURÉ (2026-11-09 ; Sacha : « le nitro, c'est pas agréable ») : on ne peut pas écouter, on mesure donc ce qui rend un son désagréable à côté d'un moteur :
     centroïde   le centre de gravité du spectre 100 Hz-8 kHz (Hz) — un nitro plus « haut » que le moteur le rend tranchant
     aigu        part de l'énergie entre 2 et 6 kHz (%) : la zone du sifflement, de la râpe qui pique
     acuité      l'acuité de Zwicker (approximée : énergie pondérée par g(z), la bande critique qui monte vite après 15 Bark) — la brillance PERÇUE
     crête       crête / RMS (dB) sur fenêtres de 20 ms : les claquements, la dureté des attaques
     battement   énergie de l'enveloppe 1-4 kHz entre 15 et 70 Hz, la zone de la RUGOSITÉ (Fastl) : ce qui « gratte »
   Le principe de choix : le nitro ne doit être ni plus aigu ni plus rugueux que le moteur qu'il accompagne.   node mesure-agrement.cjs */
'use strict';
const path = require('path');
const D = path.resolve(__dirname, '../../assets/audio/moteur-vivant/');
const { MoteurVivant, Bq } = require(D + '/moteur-vivant.js');
const { NitroMatiere, PRESETS: PM } = require(D + '/nitro-matiere.js');
const { NitroBraise, PRESETS: PB } = require(D + '/nitro-braise.js');
const { NitroFusee, FLAMMES } = require(D + '/nitro-fusee.js');
const { Pilote } = require(path.resolve(__dirname, '../moteur-vivant/conducteur.js'));
const { fftRe } = require(path.resolve(__dirname, '../moteur-vivant/rendu.cjs'));
const SR = 48000, BL = 128, NOEL = { dur: 24, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [3, 'thr', .55], [9, 'thr', 1], [18, 'lift']] };
function conduit() {
  const m = new MoteurVivant('buche', SR, 20261109); m.health = 1; m.cleHz = 220; m.cyF = 220; const pil = new Pilote(m, NOEL), N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N), f0 = new Float32Array(Math.ceil(N / BL));
  for (let i0 = 0, k = 0; i0 < N; i0 += BL, k++) { pil.tick(BL / SR); m.process(L, R, Math.min(BL, N - i0), i0); f0[k] = m.rpmEff * m.cfg.pitch / 120 * m.cfg.n; }
  return { L, f0 };
}
function nitro(make, f0) { const n = make(), N = NOEL.dur * SR, L = new Float32Array(N), R = new Float32Array(N); for (let i0 = 0, k = 0; i0 < N; i0 += BL, k++) { n.nit = i0 / SR >= 10 && i0 / SR < 17 ? 1 : 0; n.speed = .6; n.f0 = f0[k]; n.fire = f0[k]; n.process(L, R, Math.min(BL, N - i0), i0); } return L; }
const bark = f => 13 * Math.atan(.00076 * f) + 3.5 * Math.atan(Math.pow(f / 7500, 2));
function mesure(x, a, b) {
  const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), df = SR / Nf; let tot = 0, cen = 0, hi = 0, nA = 0, dA = 0, cnt = 0;
  for (let o = Math.floor(a * SR); o + Nf < b * SR; o += Nf / 2) { for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
    for (let k = Math.ceil(100 / df); k < Math.floor(8000 / df); k++) { const f = k * df, e = re[k] * re[k] + im[k] * im[k]; tot += e; cen += e * f; if (f >= 2000 && f <= 6000) hi += e; const z = bark(f), g = z < 15 ? 1 : .066 * Math.exp(.171 * z); nA += Math.pow(e, .23) * g * z; dA += Math.pow(e, .23); } cnt++; }
  const W = Math.floor(.020 * SR); let pk = 0, ss = 0, n = 0; for (let i = Math.floor(a * SR); i < b * SR; i++) { pk = Math.max(pk, Math.abs(x[i])); ss += x[i] * x[i]; n++; }
  const hp = new Bq().set('hp', 1000, .7, 0, SR), lp = new Bq().set('lp', 4000, .7, 0, SR), env = []; let acc = 0, c = 0, Wb = Math.floor(.002 * SR);
  for (let i = Math.floor(a * SR); i < b * SR; i++) { const y = lp.p(hp.p(x[i])); acc += y * y; if (++c === Wb) { env.push(Math.sqrt(acc / Wb)); acc = 0; c = 0; } }
  const E = 1 / .002, M = env.length, mu = env.reduce((s, v) => s + v, 0) / M; let bat = 0, tt = 0;
  for (let f = 15; f <= 70; f += 2) { let rr = 0, ii = 0; for (let i = 0; i < M; i++) { const ph = 2 * Math.PI * f * i / E; rr += (env[i] - mu) * Math.cos(ph); ii += (env[i] - mu) * Math.sin(ph); } bat += (rr * rr + ii * ii) / (M * M); }
  return { centroide: Math.round(cen / tot), aigu: +(100 * hi / tot).toFixed(1), acuite: +(.11 * nA / dA).toFixed(2), crete: +(20 * Math.log10(pk / Math.sqrt(ss / n))).toFixed(1), battement: +(1e3 * Math.sqrt(bat) / mu).toFixed(1) };
}
const noms = process.argv.slice(2), E = conduit(), res = { moteur: mesure(E.L, 11, 16) };
const make = { matiere: () => new NitroMatiere(SR, 31337, PM.matiere), plus: () => new NitroMatiere(SR, 31337, PM.plus), chaud: () => new NitroMatiere(SR, 31337, PM.chaud), enfer: () => new NitroMatiere(SR, 31337, PM.enfer),
  foyer: () => new NitroBraise(SR, 4242424, PB.foyer), forge: () => new NitroBraise(SR, 4242424, PB.forge), gouffre: () => new NitroBraise(SR, 4242424, PB.gouffre), flamme_hier: () => new NitroBraise(SR, 4242424, PB.noel) };
for (const k of Object.keys(FLAMMES)) make['flamme_' + k] = () => new NitroFusee(SR, 5151515, FLAMMES[k]);
for (const k of Object.keys(PM)) if (!make[k]) make[k] = () => new NitroMatiere(SR, 31337, PM[k]);
for (const k of Object.keys(make)) if (!noms.length || noms.includes(k)) { const x = nitro(make[k], E.f0); res[k] = mesure(x, 11, 16); }
console.log('                centroide  aigu2-6k  acuité  crête  battement(15-70Hz)');
for (const [k, v] of Object.entries(res)) console.log(k.padEnd(14), String(v.centroide).padStart(7), String(v.aigu).padStart(9), String(v.acuite).padStart(8), String(v.crete).padStart(7), String(v.battement).padStart(9));
