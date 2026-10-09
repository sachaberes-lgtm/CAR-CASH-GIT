#!/usr/bin/env node
/* CASH CAR — ROBLOX : LES VIGNETTES DU GARAGE, dessinées d'avance (9/10, Sacha : « on doit voir chaque voiture »).
   Le garage photographiait chaque caisse en 3D dans un ViewportFrame — mais Roblox compte le budget des maillages : passé une
   dizaine de photos, il refusait, et les cartes retombaient sur une SILHOUETTE de coupé, la même pour toutes. Ici chaque caisse est
   DESSINÉE une fois pour toutes, hors du jeu, à partir de SES triangles cuits (Caisses/Formes/Fxx) : même angle que la photo du garage
   (trois-quarts avant, nez à gauche, objectif de 24°), mêmes couleurs (la `lumiere` de Caisse.luau), même éclairage que le
   ViewportFrame (ambiance + une lumière). Rendu logiciel (tampon de profondeur, 3 × 3 échantillons par pixel), puis compressé :
   couleur sur 15 bits + séries de pixels transparents. Le jeu la décode dans une EditableImage (Caisse.vignetteImage) — une image ne
   coûte presque rien au budget des maillages : toutes les cartes ont leur vraie caisse, tout de suite.
   Sorties : src/ReplicatedStorage/CashCar/Caisses/Vignettes/Vxx.luau ; aperçus bruts (pour une planche) si `--apercus <dossier>`.
   node ROBLOX/outils/cuire-vignettes.js        (à relancer après outils/cuire-caisses.js) */
const fs = require('fs'), path = require('path');
const CAISSES = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Caisses');
const SORTIE = path.join(CAISSES, 'Vignettes');
const W = 144, H = 80, SS = 3; // (la carte du garage fait 106 × 60 ; 144 × 80 reste net sur un écran deux fois plus dense)
const AP = process.argv.includes('--apercus') ? process.argv[process.argv.indexOf('--apercus') + 1] : null;

// ── le catalogue : les roues de chaque caisse (et les retirées, qu'on ne dessine pas) ──
const CAT = fs.readFileSync(path.join(CAISSES, 'Catalogue.luau'), 'utf8');
const fiches = {};
for (const m of CAT.matchAll(/^\t\[(\d+)\] = \{([\s\S]*?)(?=^\t\[\d+\] = |^\})/gm)) {
  const i = +m[1], corps = m[2];
  const roues = [];
  const r = corps.match(/roues = \{ (.*?) \}(?:, neon|, ailes)/);
  if (r) for (const q of r[1].matchAll(/\{ ([-\d.]+), ([-\d.]+), ([-\d.]+), (true|false), ([-\d.]+) \}/g)) roues.push([+q[1], +q[2], +q[3], q[4] === 'true']);
  fiches[i] = { roues, retire: /retire = true/.test(corps.split('\n')[0]) };
}

// ── la LUMIÈRE du jeu (Caisse.luau, `lumiere`) : les teintes sombres relevées ×1,7 au plus, la saturation poussée ──
function hsv(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d > 0) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; if (h < 0) h += 1; }
  return [h, mx === 0 ? 0 : d / mx, mx];
}
function rgb(h, s, v) {
  const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][((i % 6) + 6) % 6];
}
function lumiere(r, g, b) {
  const mx = Math.max(r, g, b, 0.001), f = Math.min(1.7, Math.max(1, 0.92 / mx));
  const [h, s, v] = hsv(Math.min(1, r * f), Math.min(1, g * f), Math.min(1, b * f));
  return rgb(h, 1 - Math.pow(1 - s, 1.6), v);
}

// ── une forme cuite → ses triangles (positions en mètres, repère Roblox ; couleurs 0-1) ──
function lire(b64v, b64t, sx, dx, dy, dz, out) {
  const v = Buffer.from(b64v, 'base64'), t = Buffer.from(b64t, 'base64');
  const nv = v.length / 10, P = new Float32Array(nv * 3), C = new Float32Array(nv * 3);
  for (let k = 0; k < nv; k++) {
    P[k * 3] = v.readInt16LE(k * 10) / 2000 * sx + dx; P[k * 3 + 1] = v.readInt16LE(k * 10 + 2) / 2000 + dy; P[k * 3 + 2] = v.readInt16LE(k * 10 + 4) / 2000 + dz;
    const c = lumiere(v[k * 10 + 6] / 255, v[k * 10 + 7] / 255, v[k * 10 + 8] / 255);
    C[k * 3] = c[0]; C[k * 3 + 1] = c[1]; C[k * 3 + 2] = c[2];
  }
  for (let k = 0; k < t.length / 2; k += 3) {
    const a = t.readUInt16LE(k * 2), b = t.readUInt16LE(k * 2 + 2), c = t.readUInt16LE(k * 2 + 4);
    out.push([[P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]],
      [(C[a * 3] + C[b * 3] + C[c * 3]) / 3, (C[a * 3 + 1] + C[b * 3 + 1] + C[c * 3 + 1]) / 3, (C[a * 3 + 2] + C[b * 3 + 2] + C[c * 3 + 2]) / 3]]);
  }
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const croix = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

function dessiner(i) {
  const src = fs.readFileSync(path.join(CAISSES, 'Formes', 'F' + String(i).padStart(2, '0') + '.luau'), 'utf8');
  const [partCorps, partRoue] = src.split(/\n\troue = \{/);
  const tris = [];
  for (const g of partCorps.matchAll(/(\w+) = \{ v = "([^"]*)", t = "([^"]*)" \}/g)) lire(g[2], g[3], 1, 0, 0, 0, tris);
  for (const ro of fiches[i].roues)
    for (const g of (partRoue || '').matchAll(/(\w+) = \{ v = "([^"]*)", t = "([^"]*)" \}/g)) lire(g[2], g[3], ro[3] ? -1 : 1, ro[0], ro[1], ro[2], tris);
  if (!tris.length) return null;
  // la boîte de la caisse (comme le MeshPart fusionné du jeu)
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const t of tris) for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) { mn[j] = Math.min(mn[j], t[k][j]); mx[j] = Math.max(mx[j], t[k][j]); }
  const centre = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2], taille = sub(mx, mn);
  // L'OBJECTIF DE LA PHOTO DU GARAGE (Garage.luau, `photographier`) : trois-quarts avant, nez à gauche, 24°
  const az = 0.82, el = 0.27;
  const dir = [-Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
  const projete = taille[2] * Math.sin(az) + taille[0] * Math.cos(az);
  const dist = projete / 0.86 / (2 * Math.tan(12 * Math.PI / 180) * (W / H)) + taille[2] * 0.18;
  const vise = [centre[0], centre[1] - taille[1] * 0.2, centre[2]];
  const oeil = [vise[0] + dir[0] * dist, vise[1] + dir[1] * dist, vise[2] + dir[2] * dist];
  const avant = unit(sub(vise, oeil)), droite = unit(croix(avant, [0, 1, 0])), haut = croix(droite, avant);
  const lum = unit([-dir[0] * 0.5 + 0.5, -dir[1] * 0.5 - 1, -dir[2] * 0.5 + 0.2]); // LightDirection du ViewportFrame
  const AMB = [150 / 255, 150 / 255, 178 / 255], LC = [255 / 255, 244 / 255, 230 / 255];
  const WW = W * SS, HH = H * SS, foc = (HH / 2) / Math.tan(12 * Math.PI / 180);
  const z = new Float32Array(WW * HH).fill(Infinity), col = new Float32Array(WW * HH * 3);
  const proj = p => { const d = sub(p, oeil), zz = dot(d, avant); return [WW / 2 + dot(d, droite) / zz * foc, HH / 2 - dot(d, haut) / zz * foc, zz]; };
  for (const t of tris) {
    let n = unit(croix(sub(t[1], t[0]), sub(t[2], t[0])));
    if (dot(n, sub(oeil, t[0])) < 0) n = [-n[0], -n[1], -n[2]]; // (vue des deux côtés : la face tournée vers l'objectif)
    const dif = Math.max(0, -dot(n, lum));
    const c = [0, 1, 2].map(j => Math.min(1, t[3][j] * (AMB[j] * 0.72 + LC[j] * dif * 0.62)));
    const a = proj(t[0]), b = proj(t[1]), e = proj(t[2]);
    if (a[2] <= 0.05 || b[2] <= 0.05 || e[2] <= 0.05) continue;
    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], e[0]))), x1 = Math.min(WW - 1, Math.ceil(Math.max(a[0], b[0], e[0])));
    const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], e[1]))), y1 = Math.min(HH - 1, Math.ceil(Math.max(a[1], b[1], e[1])));
    const ar = (b[0] - a[0]) * (e[1] - a[1]) - (b[1] - a[1]) * (e[0] - a[0]);
    if (Math.abs(ar) < 1e-9) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((b[0] - px) * (e[1] - py) - (b[1] - py) * (e[0] - px)) / ar;
      const w1 = ((e[0] - px) * (a[1] - py) - (e[1] - py) * (a[0] - px)) / ar;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
      const zz = 1 / (w0 / a[2] + w1 / b[2] + w2 / e[2]);
      const k = y * WW + x;
      if (zz < z[k]) { z[k] = zz; col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2]; }
    }
  }
  // 3 × 3 échantillons → un pixel : la couleur moyenne des échantillons couverts ; le bord est franc (à moitié couvert = plein)
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let n = 0, r = 0, g = 0, bl = 0;
    for (let j = 0; j < SS; j++) for (let i2 = 0; i2 < SS; i2++) {
      const k = (y * SS + j) * WW + x * SS + i2;
      if (z[k] < Infinity) { n++; r += col[k * 3]; g += col[k * 3 + 1]; bl += col[k * 3 + 2]; }
    }
    const o = (y * W + x) * 4;
    if (n * 2 >= SS * SS) { rgba[o] = Math.round(r / n * 255); rgba[o + 1] = Math.round(g / n * 255); rgba[o + 2] = Math.round(bl / n * 255); rgba[o + 3] = 255; }
  }
  return rgba;
}

// ── compresser : un mot de 16 bits par pixel peint (5 bits par couleur), un mot (bit 15 levé) par série de pixels transparents ──
function compresser(rgba) {
  const mots = [];
  let vide = 0;
  const vider = () => { while (vide > 0) { const n = Math.min(vide, 32767); mots.push(0x8000 | n); vide -= n; } };
  for (let k = 0; k < W * H; k++) {
    if (rgba[k * 4 + 3] === 0) { vide++; continue; }
    vider();
    mots.push(((rgba[k * 4] >> 3) << 10) | ((rgba[k * 4 + 1] >> 3) << 5) | (rgba[k * 4 + 2] >> 3));
  }
  vider();
  const b = Buffer.alloc(mots.length * 2);
  mots.forEach((m, k) => b.writeUInt16LE(m, k * 2));
  return b.toString('base64');
}

fs.mkdirSync(SORTIE, { recursive: true });
for (const f of fs.readdirSync(SORTIE)) fs.unlinkSync(path.join(SORTIE, f));
if (AP) fs.mkdirSync(AP, { recursive: true });
let n = 0, total = 0;
for (const i of Object.keys(fiches).map(Number).sort((a, b) => a - b)) {
  if (fiches[i].retire) continue;
  const rgba = dessiner(i);
  if (!rgba) { console.log('  (caisse ' + i + ' : aucune forme)'); continue; }
  const d = compresser(rgba);
  const nom = 'V' + String(i).padStart(2, '0');
  fs.writeFileSync(path.join(SORTIE, nom + '.luau'), '-- CASH CAR — la vignette du garage de la caisse ' + i + ' — DESSINÉE par outils/cuire-vignettes.js, ne pas éditer.\n' +
    'return { w = ' + W + ', h = ' + H + ', d = "' + d + '" }\n');
  if (AP) fs.writeFileSync(path.join(AP, nom + '.rgba'), rgba);
  n++; total += d.length;
}
console.log(n + ' vignettes dessinées (' + W + ' × ' + H + '), ' + (total / 1024).toFixed(0) + ' Ko en tout');
