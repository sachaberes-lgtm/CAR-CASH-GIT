// Lecteur / écrivain PNG minimal (Node, aucune dépendance) : RGBA 8 bits, assez pour les captures de Chrome. (2026-11-18, lot « hudmort »)
const zlib = require('zlib'), fs = require('fs');
function lit(buf) {
  if (typeof buf === 'string') buf = fs.readFileSync(buf);
  let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < buf.length) { const n = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8) throw new Error('PNG 8 bits seulement'); }
    else if (t === 'IDAT') idat.push(d); else if (t === 'IEND') break; p += 12 + n; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : ct === 4 ? 2 : 0; if (!bpp) throw new Error('type PNG ' + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat)), st = w * bpp, out = Buffer.alloc(w * h * 4), cur = Buffer.alloc(st), prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) { const f = raw[y * (st + 1)], s = raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1));
    for (let i = 0; i < st; i++) { const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = s[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255; }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4, i = x * bpp;
      if (bpp >= 3) { out[o] = cur[i]; out[o + 1] = cur[i + 1]; out[o + 2] = cur[i + 2]; out[o + 3] = bpp === 4 ? cur[i + 3] : 255; }
      else { out[o] = out[o + 1] = out[o + 2] = cur[i]; out[o + 3] = bpp === 2 ? cur[i + 1] : 255; } }
    cur.copy(prev); }
  return { w, h, d: out };
}
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function bloc(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function ecrit(f, img) { const { w, h, d } = img, raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; d.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  fs.writeFileSync(f, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloc('IHDR', ih), bloc('IDAT', zlib.deflateSync(raw, { level: 6 })), bloc('IEND', Buffer.alloc(0))])); }
/* un morceau (x, y, w, h), agrandi k fois au plus proche voisin */
function coupe(img, x, y, w, h, k = 1) { const o = Buffer.alloc(w * k * h * k * 4);
  for (let j = 0; j < h * k; j++) for (let i = 0; i < w * k; i++) { const sx = Math.min(img.w - 1, Math.max(0, x + ((i / k) | 0))), sy = Math.min(img.h - 1, Math.max(0, y + ((j / k) | 0)));
    img.d.copy(o, (j * w * k + i) * 4, (sy * img.w + sx) * 4, (sy * img.w + sx) * 4 + 4); }
  return { w: w * k, h: h * k, d: o }; }
/* une image réduite k fois (moyenne) */
function reduit(img, k) { const W = (img.w / k) | 0, H = (img.h / k) | 0, o = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let c = 0; c < 4; c++) { let s = 0; for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) s += img.d[((y * k + j) * img.w + x * k + i) * 4 + c]; o[(y * W + x) * 4 + c] = s / (k * k); }
  return { w: W, h: H, d: o }; }
/* planche : images de même taille en grille */
function planche(imgs, cols, gap = 4) { const w = imgs[0].w, h = imgs[0].h, rows = Math.ceil(imgs.length / cols), W = cols * w + (cols + 1) * gap, H = rows * h + (rows + 1) * gap, o = Buffer.alloc(W * H * 4, 60);
  for (let i = 3; i < o.length; i += 4) o[i] = 255;
  imgs.forEach((im, n) => { const ox = gap + (n % cols) * (w + gap), oy = gap + ((n / cols) | 0) * (h + gap); for (let y = 0; y < h; y++) im.d.copy(o, ((oy + y) * W + ox) * 4, y * w * 4, (y + 1) * w * 4); });
  return { w: W, h: H, d: o }; }
module.exports = { lit, ecrit, coupe, reduit, planche };
