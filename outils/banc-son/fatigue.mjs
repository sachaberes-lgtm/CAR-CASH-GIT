// LA FATIGUE d'un .wav du banc du mixage : ce qui rend un son continu pénible, chiffré.
//   · la MODULATION d'amplitude : profondeur (%) et cadence (Hz) du battement dominant entre 4 et 80 Hz (un volume qui bat fort à 8-30 Hz = le marteau-piqueur, la perceuse) ;
//   · les RAIES : les 6 partiels les plus forts et de combien ils dépassent le fond (dB) — une note pure tenue fatigue plus qu'un grain ;
//   · l'ACUITÉ : la part d'énergie au-dessus de 1 kHz et de 2,5 kHz ; · le FACTEUR DE CRÊTE.
//   node outils/banc-son/fatigue.mjs fichier.wav [debut_s] [fin_s]
import fs from 'node:fs';
const [f, d0 = 0, d1 = 1e9] = process.argv.slice(2), b = fs.readFileSync(f), sr = b.readUInt32LE(24), n0 = (b.length - 44) / 2;
const a = Math.round(d0 * sr), z = Math.min(n0, Math.round(d1 * sr)), x = new Float64Array(z - a); for (let i = a; i < z; i++) x[i - a] = b.readInt16LE(44 + i * 2) / 32767;
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bb = n >> 1; for (; j & bb; bb >>= 1) j ^= bb; j ^= bb; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const xr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, xi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k + len / 2] = re[i + k] - xr; im[i + k + len / 2] = im[i + k] - xi; re[i + k] += xr; im[i + k] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
// l'enveloppe : |x| lissé (passe-bas ~120 Hz), sous-échantillonnée à 480 Hz
const D = Math.round(sr / 480), env = []; { let e = 0; const k = 1 - Math.exp(-2 * Math.PI * 120 / sr); for (let i = 0; i < x.length; i++) { e += k * (Math.abs(x[i]) - e); if (i % D === 0) env.push(e); } }
const N = 2048, P = new Float64Array(N / 2); let nb = 0, moy = 0; for (const v of env) moy += v; moy /= env.length || 1;
for (let o = 0; o + N <= env.length; o += N / 2) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = (env[o + i] - moy) * (.5 - .5 * Math.cos(2 * Math.PI * i / N)); fft(re, im); for (let i = 0; i < N / 2; i++) P[i] += re[i] * re[i] + im[i] * im[i]; nb++; }
let best = 0, bf = 0, tot = 0; for (let i = 1; i < N / 2; i++) { const fq = i * 480 / N; if (fq < 4 || fq > 80) continue; const p = P[i] / (nb || 1); tot += p; if (p > best) { best = p; bf = fq; } }
const prof = 2 * Math.sqrt(best) / (N / 2) / (moy || 1) * 2, profTot = Math.sqrt(2 * tot) / (N / 2) / (moy || 1) * 2;
// le spectre
const M = 16384, S = new Float64Array(M / 2); let ns = 0; for (let o = 0; o + M <= x.length; o += M / 2) { const re = new Float64Array(M), im = new Float64Array(M); for (let i = 0; i < M; i++) re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / M)); fft(re, im); for (let i = 0; i < M / 2; i++) S[i] += re[i] * re[i] + im[i] * im[i]; ns++; }
let e = 0, e1 = 0, e2 = 0; for (let i = 1; i < M / 2; i++) { const fq = i * sr / M; e += S[i]; if (fq > 1000) e1 += S[i]; if (fq > 2500) e2 += S[i]; }
const pics = []; for (let i = 3; i < M / 2 - 3; i++) { if (S[i] > S[i - 1] && S[i] >= S[i + 1]) { let fond = 0, c = 0; for (let j = -40; j <= 40; j++) { if (Math.abs(j) < 4 || i + j < 1 || i + j >= M / 2) continue; fond += S[i + j]; c++; } pics.push({ f: Math.round(i * sr / M), db: 10 * Math.log10(S[i] / (fond / c + 1e-30)), p: S[i] }); } }
pics.sort((u, v) => v.p - u.p); let q = 0, cr = 0; for (const v of x) { q += v * v; if (Math.abs(v) > cr) cr = Math.abs(v); }
console.log(`${f.split('/').slice(-1)[0]} : battement dominant ${bf.toFixed(1)} Hz, profondeur ${(100 * prof).toFixed(0)} % (4-80 Hz en tout : ${(100 * profTot).toFixed(0)} %) · au-dessus de 1 kHz ${(100 * e1 / e).toFixed(1)} %, de 2,5 kHz ${(100 * e2 / e).toFixed(2)} % · crête/RMS ${(20 * Math.log10(cr / Math.sqrt(q / x.length))).toFixed(1)} dB\n   raies : ${pics.slice(0, 6).map(p => p.f + ' Hz +' + p.db.toFixed(0) + ' dB').join(' · ')}`);
