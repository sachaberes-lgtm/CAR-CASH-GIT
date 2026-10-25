/* Banc Node du MOTEUR VIVANT : rend des scénarios en WAV (et en spectrogramme PNG pour les yeux), sans navigateur.
   node rendu.cjs <scénario> [moteur] [dossier]   scénarios : vie · sante · limiteur · demarrage · idle */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { MoteurVivant, CFG, describeEtat, clamp } = require('../../assets/audio/moteur-vivant/moteur-vivant.js');
const SR = 48000;

/* ---------- WAV 16 bits stéréo ---------- */
function ecritWav(f, L, R, sr) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(clamp(L[i], -1, 1) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(clamp(R[i], -1, 1) * 32767), 46 + i * 4); }
  fs.writeFileSync(f, b);
}
/* ---------- spectrogramme PNG (niveaux de gris) : pour VOIR le son (pas d'oreille côté Claude) ---------- */
function crc32(buf) { let c, crc = ~0; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 255; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; }
function png(f, w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  fs.writeFileSync(f, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
function fftRe(re, im) { /* FFT radix-2 en place */
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) {
      const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
      re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
function spectro(f, x, sr, opt) {
  opt = opt || {}; const N = 4096, hop = opt.hop || Math.round(sr * .04), fmax = opt.fmax || 4000, bins = Math.round(fmax / (sr / N));
  const cols = Math.floor((x.length - N) / hop), H = Math.min(bins, 360), w = Math.min(cols, 1500);
  const img = Buffer.alloc(w * H * 3), win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = .5 - .5 * Math.cos(2 * Math.PI * i / N);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let c = 0; c < w; c++) {
    const o = Math.floor(c * cols / w) * hop; for (let i = 0; i < N; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; } fftRe(re, im);
    for (let y = 0; y < H; y++) { const k = Math.floor(y * bins / H), db = 10 * Math.log10((re[k] * re[k] + im[k] * im[k]) / N + 1e-12);
      const v = clamp((db + 70) / 70, 0, 1), p = ((H - 1 - y) * w + c) * 3;
      img[p] = Math.round(255 * clamp(v * 2 - .5, 0, 1)); img[p + 1] = Math.round(255 * clamp(v * 1.6 - .6, 0, 1)); img[p + 2] = Math.round(255 * clamp(Math.sin(v * Math.PI) * .8, 0, 1)); }
  }
  png(f, w, H, img);
}

const { Conducteur, Pilote, SCEN } = require('./conducteur.js');

function rend(nom, moteurNom, dossier) {
  const sc = SCEN[nom]; if (!sc) throw new Error('scénario inconnu ' + nom);
  const m = new MoteurVivant(moteurNom || 'v8', SR, 20261022); m.health = 1; const pil = new Pilote(m, sc);
  const N = Math.round(sc.dur * SR), L = new Float32Array(N), R = new Float32Array(N);
  const BL = 64; let pk = 0, nan = 0;
  for (let i0 = 0; i0 < N; i0 += BL) {
    const n = Math.min(BL, N - i0);
    pil.tick(BL / SR);
    if (process.env.MV_LOG && i0 % (SR / 2 | 0) < BL) console.log((i0 / SR).toFixed(1), m.etat, Math.round(m.rpm), 'g' + pil.cond.g, Math.round(pil.cond.v) + 'km/h', 'thr', m.thr.toFixed(2), m.cutOn ? 'CUT' : '');
    m.process(L, R, n, i0);
    for (let j = i0; j < i0 + n; j++) { const a = Math.abs(L[j]); if (a > pk) pk = a; if (a !== a) nan++; }
  }
  const labs = pil.labs;
  /* normalisation : crête à −2 dBFS maximum (le niveau relatif entre scénarios reste identique : un seul gain fixe) */
  const GAIN = .55; for (let i = 0; i < N; i++) { L[i] *= GAIN; R[i] *= GAIN; }
  const rms = Math.sqrt(L.reduce((s, v) => s + v * v, 0) / N);
  fs.mkdirSync(dossier, { recursive: true });
  const base = path.join(dossier, nom + '-' + (moteurNom || 'v8'));
  ecritWav(base + '.wav', L, R, SR);
  spectro(base + '.png', L, SR, { fmax: nom === 'sante' ? 5000 : 4000 });
  console.log(nom, moteurNom || 'v8', 'crête', (20 * Math.log10(pk * GAIN)).toFixed(1), 'dBFS · RMS', (20 * Math.log10(rms)).toFixed(1), 'dBFS · NaN', nan, '·', base);
  if (labs.length) console.log('  repères :', labs.map(l => l[0].toFixed(1) + 's ' + l[1]).join(' | '));
  return { L, R, base };
}
module.exports = { rend, ecritWav, spectro, fftRe, SCEN, SR };
if (require.main === module) rend(process.argv[2] || 'vie', process.argv[3] || 'v8', process.argv[4] || '/tmp/mv');
