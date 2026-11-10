/* LA VÉRIFICATION DU NITRO PHYSIQUE EN UNE COMMANDE (2026-11-10, pour Claude Fable) — dix secondes, aucun navigateur :
     node verifier.cjs            les critères d'acceptation (✓ / ✗), la comparaison à reference.json, le coût CPU
     node verifier.cjs --png      + les spectrogrammes dans sortie/ (à REGARDER : les harmoniques du moteur et le nitro posé dessus)
     node verifier.cjs --tous     + Brasier et Doux
     node verifier.cjs --reference   écrit reference.json (à faire seulement quand Sacha a validé un nouvel état)
   Le nitro est jugé CONTRE LE MOTEUR CYBER DE LÉO (sa mécanique + son cyber, `MoteurBuche`, sans la bûche du jeu qui est faite d'oscillateurs Web Audio) sur trois paliers
   (2 = V8 « le palier que Léo aime », 11 = V8 atmo, 21 = plasma/réacteur). Les critères viennent de ce que Sacha a dit : « ça ne doit pas faire mal aux oreilles »,
   « très mécanique », « flamme physique », « des variations malignes » (voir passation/NITRO-POUR-FABLE.md §2). Code de sortie 1 si un critère tombe. */
'use strict';
const fs = require('fs'), path = require('path');
const A = path.resolve(__dirname, '../../assets/audio/');
const { moteur, nitro, mes, SR } = require('../generateur/mesure-cyber.cjs');
const { NitroPhysique, PHYSIQUE_PRESETS } = require(A + '/moteur-vivant/nitro-physique.js');
const { fftRe, spectro } = require('../moteur-vivant/rendu.cjs');
const ARG = process.argv.slice(2), TOUS = ARG.includes('--tous'), PNG = ARG.includes('--png'), REF = ARG.includes('--reference');
const REFF = path.join(__dirname, 'reference.json'), OUT = path.join(__dirname, 'sortie');
const PRESETS = TOUS ? Object.keys(PHYSIQUE_PRESETS) : ['forge'], PALIERS = [1, 10, 20];
let echecs = 0; const ok = (b, t, d) => { if (!b) echecs++; console.log((b ? '  ✓ ' : '  ✗ ') + t + (d ? '   ' + d : '')); };
const res = {};
/* l'accrochage : part de l'énergie 80 Hz-3 kHz à ±3 % d'un multiple de la note du moteur (la mesure du studio) */
function accroche(x, hz, a, b) { const Nf = 8192, re = new Float64Array(Nf), im = new Float64Array(Nf), df = SR / Nf; let eh = 0, et = 0;
  for (let o = Math.floor(a * SR); o + Nf < b * SR; o += Nf / 2) { const fz = hz[Math.floor((o + Nf / 2) / 128)]; for (let i = 0; i < Nf; i++) { re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / Nf)); im[i] = 0; } fftRe(re, im);
    for (let k = Math.ceil(80 / df); k < Math.floor(3000 / df); k++) { const f = k * df, e = re[k] * re[k] + im[k] * im[k]; et += e; const h = Math.round(f / fz); if (h >= 1 && Math.abs(f - h * fz) <= .03 * h * fz) eh += e; } }
  return 100 * eh / et; }
/* la non-répétition : l'enveloppe à 20 ms d'un nitro tenu à note fixe, corrélée avec elle-même une seconde plus tard (périodique = proche de 1, « malin » = bas) */
function corr(preset) { const n = new NitroPhysique(SR, 90909, preset), N = 8 * SR, L = new Float32Array(N), R = new Float32Array(N);
  for (let i0 = 0; i0 < N; i0 += 128) { n.nit = 1; n.speed = .6; n.f0 = 150; n.load = .85; n.thr = 1; n.process(L, R, 128, i0); }
  const W = Math.floor(.02 * SR), env = []; for (let i = 3 * SR; i + W < N; i += W) { let s = 0; for (let k = 0; k < W; k++) s += L[i + k] * L[i + k]; env.push(Math.sqrt(s / W)); }
  const P = 50, c = []; for (let o = 0; o + 2 * P <= env.length; o += P) { const a = env.slice(o, o + P), b = env.slice(o + P, o + 2 * P), ma = a.reduce((s, v) => s + v, 0) / P, mb = b.reduce((s, v) => s + v, 0) / P;
    let nu = 0, da = 0, db = 0; for (let k = 0; k < P; k++) { nu += (a[k] - ma) * (b[k] - mb); da += (a[k] - ma) ** 2; db += (b[k] - mb) ** 2; } c.push(nu / Math.sqrt(da * db + 1e-20)); }
  return c.reduce((s, v) => s + v, 0) / c.length; }
for (const pn of PRESETS) {
  const P = PHYSIQUE_PRESETS[pn]; console.log('\n=== nitro « ' + pn + ' » ==='); res[pn] = {};
  for (const lv of PALIERS) {
    const E = moteur(lv), ref = mes(E.L, 8, 15), N1 = nitro(P, E.hz, 1), n1 = mes(N1.L, 8, 15), mix = new Float32Array(E.L.length); for (let i = 0; i < mix.length; i++) mix[i] = E.L[i] + N1.L[i]; const mm = mes(mix, 8, 15);
    const lock = accroche(N1.L, E.hz, 8, 15); res[pn]['palier' + (lv + 1)] = { moteur: ref, nitro: n1, mix: mm, accrochage: +lock.toFixed(1) };
    console.log(' palier ' + (lv + 1) + ' : moteur ' + ref.cen + ' Hz, ' + ref.hi + ' % aigu · nitro ' + n1.cen + ' Hz, ' + n1.hi + ' % aigu, accroche ' + lock.toFixed(0) + ' %');
    ok(n1.cen <= 1.5 * ref.cen, 'brillance : le nitro n\'est pas plus brillant que le moteur de plus de ×1,5', (n1.cen / ref.cen).toFixed(2) + ' ×');
    ok(n1.hi <= 1.0, 'aigu : au plus 1 % de l\'énergie entre 2 et 6 kHz', n1.hi + ' %');
    ok(n1.ac <= ref.ac + .2, 'acuité (Zwicker) : au plus celle du moteur + 0,2', n1.ac + ' contre ' + ref.ac);
    ok(lock >= 70, 'accrochage : au moins 70 % de l\'énergie sur les harmoniques du moteur', lock.toFixed(0) + ' %');
    ok(mm.cen <= 1.5 * ref.cen && mm.hi <= 1.5 * Math.max(ref.hi, .5), 'le mélange moteur + nitro reste aussi doux que le moteur', mm.cen + ' Hz, ' + mm.hi + ' %');
  }
  const E = moteur(10), c25 = mes(nitro(P, E.hz, .25).L, 8, 15), c100 = mes(nitro(P, E.hz, 1).L, 8, 15), c50 = mes(nitro(P, E.hz, .5).L, 8, 15);
  console.log(' selon l\'appui (palier 11) : crête 25 % → 100 % : ' + c25.crete + ' → ' + c100.crete + ' dB ; niveau ' + c25.db + ' → ' + c100.db + ' dB');
  ok(c25.crete - c100.crete >= 4, 'variation : à appui léger des événements discrets (crête), à plein appui un rugissement continu', (c25.crete - c100.crete).toFixed(1) + ' dB d\'écart');
  ok(c100.db - c25.db >= 8 && c100.db - c25.db <= 16, 'dynamique : 8 à 16 dB entre appui léger et plein', (c100.db - c25.db).toFixed(1) + ' dB');
  ok(c25.db < c50.db && c50.db < c100.db, 'le niveau monte strictement avec l\'appui', c25.db + ' < ' + c50.db + ' < ' + c100.db);
  const cr = corr(P); ok(cr < .5, 'variations malignes : l\'enveloppe ne se répète pas d\'une seconde à l\'autre', 'corrélation ' + cr.toFixed(2));
  /* la sécurité : des sauts de note, d'appui, de rapport — jamais de NaN, jamais de crête folle */
  { const n = new NitroPhysique(SR, 7, P), L = new Float32Array(128), R = new Float32Array(128); let bad = 0, pk = 0, r = 12345; const rnd = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
    for (let b = 0; b < 4000; b++) { if (b % 40 === 0) { n.f0 = rnd() < .1 ? 0 : 20 + 580 * rnd(); n.nit = rnd() < .3 ? 0 : rnd(); n.load = rnd(); n.thr = rnd() < .5 ? 1 : 0; if (rnd() < .2) n.rapport(); } n.process(L, R, 128, 0); for (let i = 0; i < 128; i++) { if (!isFinite(L[i]) || !isFinite(R[i])) bad++; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); } }
    ok(bad === 0 && pk <= 1.05, 'robustesse : 10 s de sauts de note, d\'appui et de rapport sans NaN ni crête > 1', bad + ' NaN, crête ' + pk.toFixed(2)); }
  { const n = new NitroPhysique(SR, 7, P), N = 10 * SR, L = new Float32Array(N), R = new Float32Array(N), t0 = process.hrtime.bigint();
    for (let i0 = 0; i0 < N; i0 += 128) { n.nit = 1; n.speed = .6; n.f0 = 150; n.load = .8; n.thr = 1; n.process(L, R, 128, i0); } const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 10;
    res[pn].cpuMsParSeconde = +ms.toFixed(1); ok(ms <= 120, 'coût (plafond de non-régression) : au plus 120 ms de calcul par seconde d\'audio', ms.toFixed(1) + ' ms/s' + (ms > 60 ? '   → OBJECTIF 60 ms/s : le téléphone est ~3-5 fois plus lent que ce Mac' : '   (objectif 60 atteint)')); }
}
/* la comparaison à la référence validée */
if (fs.existsSync(REFF) && !REF) { const R0 = JSON.parse(fs.readFileSync(REFF, 'utf8')); console.log('\n=== écart avec reference.json (le dernier état validé par Sacha) ===');
  for (const pn of PRESETS) { const a = res[pn] && res[pn].palier11, b = R0[pn] && R0[pn].palier11; if (!a || !b) continue;
    console.log(' ' + pn + ' palier 11 : centroïde ' + a.nitro.cen + ' (réf ' + b.nitro.cen + '), aigu ' + a.nitro.hi + ' (réf ' + b.nitro.hi + '), accroche ' + a.accrochage + ' (réf ' + b.accrochage + '), niveau ' + a.nitro.db + ' (réf ' + b.nitro.db + ')'); } }
if (REF) { fs.writeFileSync(REFF, JSON.stringify(res, null, 1)); console.log('\nreference.json écrit'); }
if (PNG) { fs.mkdirSync(OUT, { recursive: true }); for (const pn of PRESETS) { const E = moteur(10), N1 = nitro(PHYSIQUE_PRESETS[pn], E.hz, 1), mix = new Float32Array(E.L.length); for (let i = 0; i < mix.length; i++) mix[i] = E.L[i] + N1.L[i];
  spectro(path.join(OUT, 'moteur-seul.png'), E.L, SR, { fmax: 2500 }); spectro(path.join(OUT, 'nitro-' + pn + '-seul.png'), N1.L, SR, { fmax: 2500 }); spectro(path.join(OUT, 'mix-' + pn + '.png'), mix, SR, { fmax: 2500 }); }
  console.log('\nspectrogrammes dans ' + OUT + ' : moteur-seul.png, nitro-<preset>-seul.png, mix-<preset>.png (0 à 2,5 kHz, 20 s ; le nitro joue de 7 à 16 s)'); }
console.log('\n' + (echecs ? echecs + ' critère(s) en échec' : 'tous les critères passent'));
process.exit(echecs ? 1 : 0);
