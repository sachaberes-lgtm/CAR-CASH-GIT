#!/usr/bin/env node
/* CASH CAR — ROBLOX : LES VIGNETTES DES CAISSES, dessinées d'avance — deux tirages du même négatif.
   · LE GARAGE (9/10, Sacha : « on doit voir chaque voiture ») : le garage photographiait chaque caisse en 3D dans un ViewportFrame —
     mais Roblox compte le budget des maillages : passé une dizaine de photos, il refusait, et les cartes retombaient sur une SILHOUETTE
     de coupé, la même pour toutes. Ici chaque caisse est DESSINÉE une fois pour toutes, hors du jeu, à partir de SES triangles cuits
     (Caisses/Formes/Fxx) : même angle que la photo du garage (trois-quarts avant, nez à gauche, objectif de 24°), mêmes couleurs (la
     `lumiere` de Caisse.luau), même éclairage que le ViewportFrame (ambiance + une lumière). 144 × 80, bord franc — la petite carte
     du garage (106 × 60) n'en demande pas plus. → Caisses/Vignettes/Vxx.
   · LA BOUTIQUE (9/10, Sacha, capture à l'appui : « il faut un aperçu des vraies voitures ») : la carte d'une légendaire fait jusqu'à
     480 unités de large — la vignette du garage y était étirée trois fois, en gros pavés. Les caisses EN VENTE (cond.k = "premium")
     ont donc leur tirage GRAND FORMAT : 576 × 320, 4 × 4 échantillons par pixel, le bord ANTICRÉNELÉ (la couverture devient la
     transparence : la caisse se pose sur la carte sans escalier), et un éclairage de studio — la lampe du ViewportFrame, un contre-jour
     froid, le ciel dans la laque, l'éclat du chrome et du verre, les feux qui brillent d'eux-mêmes. → Caisses/VignettesHD/Hxx_n.
   Rendu logiciel (tampon de profondeur), puis compressé : couleur sur 15 bits + séries. Le jeu la décode dans une EditableImage
   (Caisse.vignetteImage, Caisse.vignetteHD) — une image ne coûte rien au budget des MAILLAGES : toutes les cartes ont leur caisse.
   FORMAT GARAGE (mots de 16 bits) : bit 15 levé = N pixels transparents ; sinon un pixel opaque, 5 bits par couleur (r, g, b).
   FORMAT BOUTIQUE (`f = 2`, mots de 16 bits) :
     0x0000-0x7FFF  un pixel opaque, 5 bits par couleur, en GAMMA 2 (v = 255 × (q/31)² : les noirs du CHEVALIER NOIR gardent leurs
                    facettes — en linéaire, trois nuances sombres tombaient sur la même marche)
     0x8000-0xBFFF  N pixels transparents (N = les 14 bits du bas)
     0xC000-0xDFFF  le pixel précédent, répété N fois de plus (N = les 13 bits du bas : une facette plate, c'est une longue série)
     0xE000-0xE0FF  la TRANSPARENCE du pixel qui suit (8 bits) — le bord anticrénelé
   Une ModuleScript de Roblox ne dépasse pas ~195 000 caractères : le tirage boutique est coupé en morceaux Hxx_1, Hxx_2… (chacun
   rend { w, h, f, n = nombre de morceaux, d = sa part du texte base64 }).
   Sorties : node ROBLOX/outils/cuire-vignettes.js [--garage | --boutique] [--apercus <dossier>]   (à relancer après cuire-caisses.js)
   --apercus : les tirages bruts (.rgba, w × h × 4) pour une planche. */
const fs = require('fs'), path = require('path');
const CAISSES = path.join(__dirname, '..', 'src', 'ReplicatedStorage', 'CashCar', 'Caisses');
const AP = process.argv.includes('--apercus') ? process.argv[process.argv.indexOf('--apercus') + 1] : null;
const SEUL = process.argv.includes('--garage') ? 'garage' : process.argv.includes('--boutique') ? 'boutique' : null;
const MORCEAU = 180000; // caractères base64 par ModuleScript (multiple de 4 : chaque morceau se décode seul)

// ── le catalogue : les roues de chaque caisse, les retirées (qu'on ne dessine pas), celles qu'on VEND (la boutique) ──
const CAT = fs.readFileSync(path.join(CAISSES, 'Catalogue.luau'), 'utf8');
const fiches = {};
for (const m of CAT.matchAll(/^\t\[(\d+)\] = \{([\s\S]*?)(?=^\t\[\d+\] = |^\})/gm)) {
  const i = +m[1], corps = m[2];
  const roues = [];
  const r = corps.match(/roues = \{ (.*?) \}(?:, neon|, ailes)/);
  if (r) for (const q of r[1].matchAll(/\{ ([-\d.]+), ([-\d.]+), ([-\d.]+), (true|false), ([-\d.]+) \}/g)) roues.push([+q[1], +q[2], +q[3], q[4] === 'true']);
  const tete = corps.split('\n')[0];
  fiches[i] = { roues, retire: /retire = true/.test(tete), vendue: /cond = \{ k = "premium"/.test(tete) };
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

// ── une forme cuite → ses triangles (positions en mètres, repère Roblox ; couleurs 0-1 ; la MATIÈRE : p laque, c chrome, o or,
// s satiné, m mat, g verre, l feux) ──
function lire(b64v, b64t, sx, dx, dy, dz, mat, out) {
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
      [(C[a * 3] + C[b * 3] + C[c * 3]) / 3, (C[a * 3 + 1] + C[b * 3 + 1] + C[c * 3 + 1]) / 3, (C[a * 3 + 2] + C[b * 3 + 2] + C[c * 3 + 2]) / 3], mat]);
  }
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const croix = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const melange = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ── LE STUDIO DE LA BOUTIQUE : comment chaque matière renvoie la lumière (ks = l'éclat, n = sa finesse, ciel = le ciel qu'elle reflète,
// rim = le liseré du contre-jour). Les feux (l) brillent d'eux-mêmes : aucune ombre ne les éteint.
const STUDIO = {
  p: { ks: 0.42, n: 46, ciel: 0.16, rim: 0.30 }, // LAQUE : un éclat net, le ciel lavande dans les flancs
  c: { ks: 0.85, n: 22, ciel: 0.55, rim: 0.35 }, // CHROME : presque un miroir
  o: { ks: 0.70, n: 28, ciel: 0.30, rim: 0.30 }, // OR
  g: { ks: 0.65, n: 70, ciel: 0.38, rim: 0.20 }, // VERRE : sombre, mais qui renvoie le ciel
  s: { ks: 0.10, n: 12, ciel: 0.04, rim: 0.18 }, // satiné, cuir, toile
  m: { ks: 0.05, n: 8, ciel: 0.02, rim: 0.12 },  // mat : pneus, grilles
};
const CIEL_HAUT = [0.80, 0.78, 1.0], CIEL_BAS = [0.30, 0.20, 0.42]; // le ciel de la vitrine : lavande en haut, prune au ras du sol
const CONTRE = [0.55, 0.75, 1.0]; // le contre-jour froid (le néon cyan de la charte)

function dessiner(i, W, H, SS, hd) {
  const src = fs.readFileSync(path.join(CAISSES, 'Formes', 'F' + String(i).padStart(2, '0') + '.luau'), 'utf8');
  const [partCorps, partRoue] = src.split(/\n\troue = \{/);
  const tris = [];
  for (const g of partCorps.matchAll(/(\w+) = \{ v = "([^"]*)", t = "([^"]*)" \}/g)) lire(g[2], g[3], 1, 0, 0, 0, g[1], tris);
  for (const ro of fiches[i].roues)
    for (const g of (partRoue || '').matchAll(/(\w+) = \{ v = "([^"]*)", t = "([^"]*)" \}/g)) lire(g[2], g[3], ro[3] ? -1 : 1, ro[0], ro[1], ro[2], g[1], tris);
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
  const contre = unit([dir[0] * 0.6 - 0.6, -0.35, dir[2] * 0.6 + 0.4]); // (le contre-jour vient de derrière la caisse, côté droit)
  const WW = W * SS, HH = H * SS, foc = (HH / 2) / Math.tan(12 * Math.PI / 180);
  const z = new Float32Array(WW * HH).fill(Infinity), col = new Float32Array(WW * HH * 3);
  const proj = p => { const d = sub(p, oeil), zz = dot(d, avant); return [WW / 2 + dot(d, droite) / zz * foc, HH / 2 - dot(d, haut) / zz * foc, zz]; };
  for (const t of tris) {
    let n = unit(croix(sub(t[1], t[0]), sub(t[2], t[0])));
    if (dot(n, sub(oeil, t[0])) < 0) n = [-n[0], -n[1], -n[2]]; // (vue des deux côtés : la face tournée vers l'objectif)
    const dif = Math.max(0, -dot(n, lum));
    let c;
    if (!hd) {
      c = [0, 1, 2].map(j => Math.min(1, t[3][j] * (AMB[j] * 0.72 + LC[j] * dif * 0.62)));
    } else if (t[4] === 'l') {
      c = [0, 1, 2].map(j => Math.min(1, t[3][j] * 1.08 + 0.04)); // les FEUX : leur couleur, pleine, d'eux-mêmes
    } else {
      // le studio : la lampe du ViewportFrame (plus franche), le ciel qui éclaire par le haut, le contre-jour froid, puis l'éclat et
      // le reflet du ciel selon la matière
      const S = STUDIO[t[4]] || STUDIO.s;
      const g0 = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3];
      const vue = unit(sub(oeil, g0));
      const ciel = 0.5 + 0.5 * n[1];
      const dos = Math.max(0, -dot(n, contre));
      const mi = unit([vue[0] - lum[0], vue[1] - lum[1], vue[2] - lum[2]]);
      const spec = S.ks * Math.pow(Math.max(0, dot(n, mi)), S.n);
      const nv = Math.max(0, dot(n, vue));
      const fres = Math.pow(1 - nv, 3);
      const refl = [2 * nv * n[0] - vue[0], 2 * nv * n[1] - vue[1], 2 * nv * n[2] - vue[2]]; // (le rayon réfléchi : quel morceau de ciel)
      const cielR = melange(CIEL_BAS, CIEL_HAUT, Math.max(0, Math.min(1, 0.5 + 0.5 * refl[1])));
      c = [0, 1, 2].map(j => {
        const base = t[3][j] * (AMB[j] * (0.50 + 0.22 * ciel) + LC[j] * dif * 0.74 + CONTRE[j] * dos * 0.20);
        return Math.min(1, base + cielR[j] * (S.ciel * (0.35 + 0.65 * fres)) + CONTRE[j] * S.rim * fres * dos + LC[j] * spec);
      });
    }
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
  // SS × SS échantillons → un pixel : la couleur moyenne des échantillons couverts. Le garage : bord franc (à moitié couvert = plein) ;
  // la boutique : la couverture DEVIENT la transparence (le bord anticrénelé)
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let n = 0, r = 0, g = 0, bl = 0;
    for (let j = 0; j < SS; j++) for (let i2 = 0; i2 < SS; i2++) {
      const k = (y * SS + j) * WW + x * SS + i2;
      if (z[k] < Infinity) { n++; r += col[k * 3]; g += col[k * 3 + 1]; bl += col[k * 3 + 2]; }
    }
    const o = (y * W + x) * 4;
    if (hd ? n > 0 : n * 2 >= SS * SS) {
      rgba[o] = Math.round(r / n * 255); rgba[o + 1] = Math.round(g / n * 255); rgba[o + 2] = Math.round(bl / n * 255);
      rgba[o + 3] = hd ? Math.round(n / (SS * SS) * 255) : 255;
    }
  }
  return rgba;
}

// ── compresser (garage) : un mot de 16 bits par pixel peint (5 bits par couleur), un mot (bit 15 levé) par série de transparents ──
function compresser(rgba, W, H) {
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

// ── compresser (boutique, f = 2) : voir le FORMAT BOUTIQUE en tête. Rend aussi le tirage tel que le jeu le DÉCODERA (pour la planche) ──
const q5 = v => Math.round(31 * Math.sqrt(v / 255)), d5 = q => Math.round(255 * (q / 31) * (q / 31));
function compresserHD(rgba, W, H) {
  const mots = [], vu = Buffer.alloc(W * H * 4);
  let vide = 0, prec = -1, rep = 0;
  const vider = () => { while (vide > 0) { const n = Math.min(vide, 0x3fff); mots.push(0x8000 | n); vide -= n; } };
  const repeter = () => { while (rep > 0) { const n = Math.min(rep, 0x1fff); mots.push(0xc000 | n); rep -= n; } };
  for (let k = 0; k < W * H; k++) {
    const a = rgba[k * 4 + 3];
    if (a === 0) { repeter(); vide++; prec = -1; continue; }
    vider();
    const r5 = q5(rgba[k * 4]), g5 = q5(rgba[k * 4 + 1]), b5 = q5(rgba[k * 4 + 2]);
    const cle = (a << 15) | (r5 << 10) | (g5 << 5) | b5;
    vu[k * 4] = d5(r5); vu[k * 4 + 1] = d5(g5); vu[k * 4 + 2] = d5(b5); vu[k * 4 + 3] = a;
    if (cle === prec) { rep++; continue; }
    repeter();
    if (a < 255) mots.push(0xe000 | a);
    mots.push((r5 << 10) | (g5 << 5) | b5);
    prec = cle;
  }
  repeter(); vider();
  const b = Buffer.alloc(mots.length * 2);
  mots.forEach((m, k) => b.writeUInt16LE(m, k * 2));
  return [b.toString('base64'), vu];
}

const deux = i => String(i).padStart(2, '0');
function vider(dossier) {
  fs.mkdirSync(dossier, { recursive: true });
  for (const f of fs.readdirSync(dossier)) fs.unlinkSync(path.join(dossier, f));
}
if (AP) fs.mkdirSync(AP, { recursive: true });
const ordre = Object.keys(fiches).map(Number).sort((a, b) => a - b);

// ── 1. LE GARAGE ──
if (SEUL !== 'boutique') {
  const W = 144, H = 80, SS = 3; // (la carte du garage fait 106 × 60 ; 144 × 80 reste net sur un écran deux fois plus dense)
  const SORTIE = path.join(CAISSES, 'Vignettes');
  vider(SORTIE);
  let n = 0, total = 0;
  for (const i of ordre) {
    if (fiches[i].retire) continue;
    const rgba = dessiner(i, W, H, SS, false);
    if (!rgba) { console.log('  (caisse ' + i + ' : aucune forme)'); continue; }
    const d = compresser(rgba, W, H);
    const nom = 'V' + deux(i);
    fs.writeFileSync(path.join(SORTIE, nom + '.luau'), '-- CASH CAR — la vignette du garage de la caisse ' + i + ' — DESSINÉE par outils/cuire-vignettes.js, ne pas éditer.\n' +
      'return { w = ' + W + ', h = ' + H + ', d = "' + d + '" }\n');
    if (AP) fs.writeFileSync(path.join(AP, nom + '.rgba'), rgba);
    n++; total += d.length;
  }
  console.log(n + ' vignettes du garage dessinées (' + W + ' × ' + H + '), ' + (total / 1024).toFixed(0) + ' Ko en tout');
}

// ── 2. LA BOUTIQUE : les caisses EN VENTE, en grand ──
if (SEUL !== 'garage') {
  // (la carte « à la une » fait 480 × 267 unités, la racine de l'interface grossit ×1,45 sur un écran 1080p : ~700 px ; 576 × 320 s'y
  // lisse sans flou, pèse 720 Ko de mémoire décodée et ~35 Ko de texte par caisse — le double coûterait 4 fois plus pour un gain invisible)
  const W = 576, H = 320, SS = 4;
  const SORTIE = path.join(CAISSES, 'VignettesHD');
  vider(SORTIE);
  let n = 0, total = 0, fichiers = 0;
  for (const i of ordre) {
    if (fiches[i].retire || !fiches[i].vendue) continue;
    const rgba = dessiner(i, W, H, SS, true);
    if (!rgba) { console.log('  (caisse ' + i + ' : aucune forme)'); continue; }
    const [d, vu] = compresserHD(rgba, W, H);
    const parts = [];
    for (let o = 0; o < d.length; o += MORCEAU) parts.push(d.slice(o, o + MORCEAU));
    parts.forEach((p, k) => {
      fs.writeFileSync(path.join(SORTIE, 'H' + deux(i) + '_' + (k + 1) + '.luau'), '-- CASH CAR — la vignette de BOUTIQUE de la caisse ' + i + ' (morceau ' + (k + 1) + '/' + parts.length +
        ') — DESSINÉE par outils/cuire-vignettes.js, ne pas éditer.\nreturn { w = ' + W + ', h = ' + H + ', f = 2, n = ' + parts.length + ', d = "' + p + '" }\n');
      fichiers++;
    });
    if (AP) fs.writeFileSync(path.join(AP, 'H' + deux(i) + '.rgba'), vu);
    n++; total += d.length;
    console.log('  caisse ' + i + ' : ' + (d.length / 1024).toFixed(0) + ' Ko en ' + parts.length + ' morceau(x)');
  }
  console.log(n + ' vignettes de boutique dessinées (' + W + ' × ' + H + ', ' + SS + ' × ' + SS + ' échantillons), ' + (total / 1024).toFixed(0) + ' Ko en ' + fichiers + ' fichiers');
}
