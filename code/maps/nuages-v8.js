/* ============================== LES NUAGES v8 — UNE SEULE MATIÈRE (2026-09-30, nuit, session GAMEPLAY) ==============================
   Sacha : « les nuages dans le premier niveau sont toujours aussi moches, il faut que tu reprennes tout à zéro et que tu me fasses une vraie
   génération de nuages adaptée au jeu et à la DA — pousse-toi dans tes limites, prends tout ton temps et surprends-moi ».
   LE DIAGNOSTIC : sept versions (v1-v7) ont retouché les FORMES et les COULEURS d'un même principe — des sphères fusionnées, chacune avec
   sa lumière (Phong). Un nuage restait une GRAPPE : on comptait les boules, chaque soudure faisait une ligne, et la « normale de champ »
   de la v7 n'en corrigeait que l'éclairage, pas la silhouette. Le problème était la technique, pas le réglage.
   LA v8 : un nuage est une SURFACE — l'isosurface d'un CHAMP DE DENSITÉ lisse (bourgeons gaussiens qui se fondent les uns dans les autres,
   base PLATE au niveau de condensation, chou-fleur en bruit de valeur plus fort vers le haut), maillée par SURFACE NETS (un sommet par
   cellule traversée, un quad par arête traversée : pas de table, un maillage étanche et régulier) dans l'OUVRIER. Les normales sont le
   gradient du champ (une seule masse, aucune couture). Le MODELÉ est cuit une fois dans la couleur des sommets : R = occlusion (on sonde
   le champ le long de la normale : un creux est un creux), G = le ciel au-dessus (on sonde vers le haut : les bourgeons du dessus portent
   leur OMBRE sur ceux du dessous), B = la hauteur. Coût en course : les triangles, rien d'autre. */
function nuage8Calc(B, base, top, N, opt) {
  opt = opt || {};
  const K = opt.K || 2.6, T = Math.exp(-K), DET = opt.det == null ? .9 : opt.det, FQ = opt.fq || 1;
  // l'emprise
  let x0 = 1e9, x1 = -1e9, y0 = base - .02, y1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const b of B) { const r = b[3] * 1.25, ry = b[3] * b[4] * 1.25; x0 = Math.min(x0, b[0] - r); x1 = Math.max(x1, b[0] + r); y1 = Math.max(y1, b[1] + ry); z0 = Math.min(z0, b[2] - r); z1 = Math.max(z1, b[2] + r); }
  const ext = Math.max(x1 - x0, y1 - y0, z1 - z0), h = ext / N;
  x0 -= h * 1.5; y0 -= h * 1.5; z0 -= h * 1.5;
  const nx = Math.ceil((x1 - x0) / h) + 2, ny = Math.ceil((y1 - y0) / h) + 2, nz = Math.ceil((z1 - z0) / h) + 2;
  // un bruit de valeur 3D (hachage), pour le chou-fleur
  const hs = function (i, j, k) { let n = (i * 374761393 + j * 668265263 + k * 1274126177) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const vn = function (x, y, z) { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z); let fx = x - i, fy = y - j, fz = z - k; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const a = hs(i, j, k), b = hs(i + 1, j, k), c = hs(i, j + 1, k), d = hs(i + 1, j + 1, k), e = hs(i, j, k + 1), f = hs(i + 1, j, k + 1), g = hs(i, j + 1, k + 1), m = hs(i + 1, j + 1, k + 1);
    const l1 = a + (b - a) * fx, l2 = c + (d - c) * fx, l3 = e + (f - e) * fx, l4 = g + (m - g) * fx, q1 = l1 + (l2 - l1) * fy, q2 = l3 + (l4 - l3) * fy; return q1 + (q2 - q1) * fz; };
  const sd = (opt.seed || 0) * 17.13, VOXF = !!opt.vox, FAR = DET * .5 + .02;
  // le champ : > 0 dedans
  const champ = function (x, y, z, LB) { // LB (cubes) : la liste des lobes qui comptent dans la région interrogée
    let f = 0;
    for (let ii = 0, nb = LB ? LB.length : B.length; ii < nb; ii++) { const i = LB ? LB[ii] : ii, b = B[i], r = b[3], ry = b[3] * b[4], dx = (x - b[0]) / r, dy = (y - b[1]) / ry, dz = (z - b[2]) / r, q = dx * dx + dy * dy + dz * dz; if (q < 9) f += Math.exp(-K * q); }
    let g = Math.log(Math.max(f, 1e-9) / T); // 0 à la surface, en « unités de rayon » (le log rend le champ presque linéaire près de la surface)
    if (VOXF && (g > FAR || g < -FAR)) return g - Math.max(0, (base + .015 - y)) * 40; // (cubes) le bruit ne vaut que ±DET/2 : loin de la surface il ne change aucun signe, on ne le calcule pas
    // le chou-fleur : deux octaves de bosses, plus fortes vers le haut (la base reste lisse)
    const hy = Math.max(0, Math.min(1, (y - base) / Math.max(.1, top - base)));
    g += DET * (0.55 * (vn(x * 4.1 * FQ + sd, y * 4.1 * FQ, z * 4.1 * FQ) - .5) + 0.3 * (vn(x * 9.3 * FQ, y * 9.3 * FQ + sd, z * 9.3 * FQ) - .5) + 0.15 * (vn(x * 19.7 * FQ, y * 19.7 * FQ, z * 19.7 * FQ + sd) - .5)) * (.3 + .7 * hy);
    // la BASE PLATE : le niveau de condensation
    g -= Math.max(0, (base + .015 - y)) * 40;
    return g;
  };
  /* (2026-10-20, Léo : « le niveau nuage a l'air déchiqueté — une refonte, avec toutes les techniques, entre réalisme et cubes pixel de tailles
     variables ») LE CUMULUS EN CUBES DE TAILLES VARIABLES : du MÊME champ lisse (donc les mêmes formes, la même base plate), la surface n'est plus
     maillée en surface nets mais en CUBES posés sur une grille emboîtée (régions de 4 unités : des cubes de 1, 2 ou 4 unités selon un bruit lisse
     par région — petits sur les bourgeons du haut, gros vers le ventre) ; seules les faces tournées vers le dehors sont émises, une par
     « patch » si le voisin change de taille (jamais de trou entre un gros et un petit cube). La LUMIÈRE reste celle du nuage lisse : la normale
     d'un cube = sa face mêlée au gradient du champ (opt.vox.kn), le modelé cuit (creux, ombre des bourgeons du haut, hauteur) est lu en son
     centre, et chaque cube a SA nuance (opt.vox.jit) : c'est elle qui fait lire la mosaïque. Aucun fantôme, aucune poussière : un seul objet opaque. */
  if (opt.vox) {
    const VX = opt.vox, hv = ext / (N * (VX.k || 1.5) * (N > 40 ? (VX.kf || .75) : 1)), RG = hv * 4, kn = VX.kn == null ? .5 : VX.kn, jit = VX.jit == null ? .16 : VX.jit;
    const gx0 = Math.floor(x0 / RG) * RG, gz0 = Math.floor(z0 / RG) * RG, gy0 = base - RG; // la base du nuage sur une frontière de région : le dessous est PLAT
    const NRX = Math.ceil((x1 + hv * 2 - gx0) / RG) + 1, NRZ = Math.ceil((z1 + hv * 2 - gz0) / RG) + 1, NRY = Math.ceil((y1 + hv * 2 - gy0) / RG) + 1;
    const NCX = NRX * 4, NCY = NRY * 4;
    const RL = new Int8Array(NRX * NRY * NRZ), RS = new Int8Array(NRX * NRY * NRZ), memo = new Map();
    const t0v = VX.t0 == null ? .36 : VX.t0, t1v = VX.t1 == null ? .7 : VX.t1, hbv = VX.hb == null ? .35 : VX.hb, hh0 = Math.max(.1, top - base);
    for (let k = 0; k < NRZ; k++) for (let j = 0; j < NRY; j++) for (let i = 0; i < NRX; i++) { // la taille des cubes de chaque région : un bruit LISSE (des plaques), plus petite vers le haut
      const rv = vn(i * .83 + sd + 3.1, j * .83 + 1.7, k * .83 - 2.3) * .65 + hs(i * 7 + 1, j * 13 + 5, k * 11 + 3) * .35, yy = Math.min(1, Math.max(0, (gy0 + (j + .5) * RG - base) / hh0)), t = rv + (.5 - yy) * hbv;
      RL[i + NRX * (j + NRY * k)] = t < t0v ? 0 : t < t1v ? 1 : 2; }
    const RBL = new Array(NRX * NRY * NRZ), bl = function (i, j, k) { const q = i + NRX * (j + NRY * k); let L9 = RBL[q]; if (L9) return L9; // les lobes dont la portée (3 rayons : q < 9) touche cette région
      const ccx = gx0 + (i + .5) * RG, ccy = gy0 + (j + .5) * RG, ccz = gz0 + (k + .5) * RG, rr = RG * .87; L9 = [];
      for (let b9 = 0; b9 < B.length; b9++) { const b = B[b9], R9 = 3 * Math.max(b[3], b[3] * b[4]) + rr; if (Math.abs(ccx - b[0]) < R9 && Math.abs(ccy - b[1]) < R9 && Math.abs(ccz - b[2]) < R9) L9.push(b9); }
      RBL[q] = L9; return L9; };
    const rstate = function (i, j, k) { const q = i + NRX * (j + NRY * k); let s = RS[q]; if (s) return s;
      let mn = 1e9, mx = -1e9; const xa = gx0 + i * RG, ya = gy0 + j * RG, za = gz0 + k * RG;
      const L9 = bl(i, j, k); for (let c = 0; c < 9; c++) { const g = champ(c === 8 ? xa + RG * .5 : xa + (c & 1) * RG, c === 8 ? ya + RG * .5 : ya + ((c >> 1) & 1) * RG, c === 8 ? za + RG * .5 : za + ((c >> 2) & 1) * RG, L9); if (g < mn) mn = g; if (g > mx) mx = g; }
      s = mn > 2.5 ? 2 : mx < -2.5 ? 1 : 3; RS[q] = s; return s; };
    const cellSolid = function (l, ci, cj, ck) { const key = ((ck * NCY + cj) * NCX + ci) * 3 + l, m = memo.get(key); if (m !== undefined) return m;
      const s = hv * (1 << l), sh = 2 - l, v = champ(gx0 + (ci + .5) * s, gy0 + (cj + .5) * s, gz0 + (ck + .5) * s, bl(ci >> sh, cj >> sh, ck >> sh)) > 0; memo.set(key, v); return v; };
    const solidAt = function (x, y, z) { const i = Math.floor((x - gx0) / RG), j = Math.floor((y - gy0) / RG), k = Math.floor((z - gz0) / RG);
      if (i < 0 || j < 0 || k < 0 || i >= NRX || j >= NRY || k >= NRZ) return false;
      const st = rstate(i, j, k); if (st === 1) return false; if (st === 2) return true;
      const l = RL[i + NRX * (j + NRY * k)], s = hv * (1 << l); return cellSolid(l, Math.floor((x - gx0) / s), Math.floor((y - gy0) / s), Math.floor((z - gz0) / s)); };
    const VP = [], VN = [], VC = [], VI = [], DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], QQ = [[-1, -1], [1, -1], [1, 1], [-1, 1]], eps = hv * .25;
    const quad = function (cx, cy, cz, ax, sg, hs9, cu, cw, hu, hw, nn, md) { const u = (ax + 1) % 3, w = (ax + 2) % 3, b0 = VP.length / 3;
      for (const q of QQ) { const P = [cx, cy, cz]; P[ax] += sg * hs9; P[u] += cu + q[0] * hu; P[w] += cw + q[1] * hw; VP.push(P[0], P[1], P[2]); VN.push(nn[0], nn[1], nn[2]); VC.push(md[0], md[1], md[2]); }
      if (sg > 0) VI.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); else VI.push(b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2); };
    const e1 = hv * .6;
    for (let k = 0; k < NRZ; k++) for (let j = 0; j < NRY; j++) for (let i = 0; i < NRX; i++) {
      if (rstate(i, j, k) !== 3) continue;
      const l = RL[i + NRX * (j + NRY * k)], n = 4 >> l, s = hv * (1 << l), m = 1 << l;
      for (let c = 0; c < n; c++) for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
        const ci = i * n + a, cj = j * n + b, ck = k * n + c; if (!cellSolid(l, ci, cj, ck)) continue;
        const cx = gx0 + (ci + .5) * s, cy = gy0 + (cj + .5) * s, cz = gz0 + (ck + .5) * s; let dat = null;
        for (const d of DIRS) { const ax = d[0] ? 0 : d[1] ? 1 : 2, u = (ax + 1) % 3, w = (ax + 2) % 3, sg = d[ax], ex = [];
          let nex = 0; for (let q = 0; q < m; q++) for (let p = 0; p < m; p++) { const P = [cx, cy, cz]; P[ax] += sg * (s * .5 + eps); P[u] += ((p + .5) / m - .5) * s; P[w] += ((q + .5) / m - .5) * s;
            const e = !solidAt(P[0], P[1], P[2]); ex.push(e); if (e) nex++; }
          if (!nex) continue;
          if (!dat) { let gx = champ(cx + e1, cy, cz) - champ(cx - e1, cy, cz), gy = champ(cx, cy + e1, cz) - champ(cx, cy - e1, cz), gz = champ(cx, cy, cz + e1) - champ(cx, cy, cz - e1);
            const gl = Math.hypot(gx, gy, gz) || 1; gx = -gx / gl; gy = -gy / gl; gz = -gz / gl;
            let o9 = 0; for (const s9 of [.04, .09, .17, .3]) { const w9 = champ(cx + gx * s9, cy + gy * s9, cz + gz * s9); if (w9 > -1.4) o9 += (w9 + 1.4) / 1.4 * (s9 === .04 ? .35 : s9 === .09 ? .3 : s9 === .17 ? .22 : .13); }
            let u9 = 0; for (const s9 of [.1, .22, .38, .6]) { const w9 = champ(cx + gx * .03, cy + s9, cz + gz * .03); if (w9 > 0) u9 += Math.min(1, w9) * .5; }
            const hz = hs(ci * 7 + 3, cj * 13 + 5, ck * 11 + 1 + l * 31) - .5;
            dat = { g: [gx, gy, gz], md: [Math.max(0, Math.min(1, (.25 + .75 * Math.max(0, Math.min(1, 1 - o9 * 1.15))) * (1 + hz * jit))), Math.min(1, Math.exp(-u9 * 1.6) * (1 + hz * jit * .5)), Math.max(0, Math.min(1, (cy - base) / hh0))] }; }
          const nn = [d[0] * (1 - kn) + dat.g[0] * kn, d[1] * (1 - kn) + dat.g[1] * kn, d[2] * (1 - kn) + dat.g[2] * kn], nl = Math.hypot(nn[0], nn[1], nn[2]) || 1; nn[0] /= nl; nn[1] /= nl; nn[2] /= nl;
          if (nex === m * m) quad(cx, cy, cz, ax, sg, s * .5, 0, 0, s * .5, s * .5, nn, dat.md);
          else { const hp = s / m * .5; let ii = 0; for (let q = 0; q < m; q++) for (let p = 0; p < m; p++, ii++) if (ex[ii]) quad(cx, cy, cz, ax, sg, s * .5, ((p + .5) / m - .5) * s, ((q + .5) / m - .5) * s, hp, hp, nn, dat.md); } } } }
    const nvv = VP.length / 3;
    return { pos: new Float32Array(VP), nor: new Float32Array(VN), col: new Float32Array(VC), idx: nvv < 65535 ? new Uint16Array(VI) : new Uint32Array(VI), vit: null, fant: null };
  }
  // les coins
  const NX = nx + 1, NY = ny + 1, NZ = nz + 1, V = new Float32Array(NX * NY * NZ);
  for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) V[i + NX * (j + NY * k)] = champ(x0 + i * h, y0 + j * h, z0 + k * h);
  // les sommets (un par cellule traversée : la moyenne des croisements d'arêtes)
  const vid = new Int32Array(nx * ny * nz).fill(-1), P = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const co = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], c8 = new Float32Array(8);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let m = 0; for (let c = 0; c < 8; c++) { const v = V[(i + co[c][0]) + NX * ((j + co[c][1]) + NY * (k + co[c][2]))]; c8[c] = v; if (v > 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const e of E) { const a = c8[e[0]], b = c8[e[1]]; if ((a > 0) === (b > 0)) continue; const t = a / (a - b), A = co[e[0]], Bc = co[e[1]];
      sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; n++; }
    vid[i + nx * (j + ny * k)] = P.length / 3; P.push(x0 + (i + sx / n) * h, y0 + (j + sy / n) * h, z0 + (k + sz / n) * h);
  }
  // les faces : un quad par arête de la grille qui traverse la surface
  const I = [];
  const cell = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) ? -1 : vid[i + nx * (j + ny * k)]; };
  for (let k = 1; k < NZ - 1; k++) for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
    const v0 = V[i + NX * (j + NY * k)], in0 = v0 > 0;
    // arête +x
    if (i < NX - 1) { const v1 = V[(i + 1) + NX * (j + NY * k)]; if (in0 !== (v1 > 0)) { const a = cell(i, j - 1, k - 1), b = cell(i, j, k - 1), c = cell(i, j, k), d = cell(i, j - 1, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) I.push(a, b, c, a, c, d); else I.push(a, c, b, a, d, c); } } }
    if (j < NY - 1) { const v1 = V[i + NX * ((j + 1) + NY * k)]; if (in0 !== (v1 > 0)) { const a = cell(i - 1, j, k - 1), b = cell(i - 1, j, k), c = cell(i, j, k), d = cell(i, j, k - 1); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) I.push(a, b, c, a, c, d); else I.push(a, c, b, a, d, c); } } }
    if (k < NZ - 1) { const v1 = V[i + NX * (j + NY * (k + 1))]; if (in0 !== (v1 > 0)) { const a = cell(i - 1, j - 1, k), b = cell(i, j - 1, k), c = cell(i, j, k), d = cell(i - 1, j, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) I.push(a, b, c, a, c, d); else I.push(a, c, b, a, d, c); } } }
  }
  // normales (gradient du champ), et le modelé cuit : R = occlusion ambiante, G = ciel au-dessus (ombre portée des bourgeons du haut), B = hauteur
  const nv = P.length / 3, pos = new Float32Array(P), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), e2 = h * .5;
  for (let v = 0; v < nv; v++) { const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    let gx = champ(x + e2, y, z) - champ(x - e2, y, z), gy = champ(x, y + e2, z) - champ(x, y - e2, z), gz = champ(x, y, z + e2) - champ(x, y, z - e2);
    const l = Math.hypot(gx, gy, gz) || 1; const nx9 = -gx / l, ny9 = -gy / l, nz9 = -gz / l; nor[v * 3] = nx9; nor[v * 3 + 1] = ny9; nor[v * 3 + 2] = nz9;
    let oc = 0; for (const s of [.04, .09, .17, .3]) { const w = champ(x + nx9 * s, y + ny9 * s, z + nz9 * s); if (w > -1.4) oc += (w + 1.4) / 1.4 * (s === .04 ? .35 : s === .09 ? .3 : s === .17 ? .22 : .13); }
    let up = 0; for (const s of [.1, .22, .38, .6]) { const w = champ(x + nx9 * .03, y + s, z + nz9 * .03); if (w > 0) up += Math.min(1, w) * .5; }
    col[v * 3] = Math.max(0, Math.min(1, 1 - oc * 1.15)); col[v * 3 + 1] = Math.exp(-up * 1.6); col[v * 3 + 2] = Math.max(0, Math.min(1, (y - base) / Math.max(.1, top - base))); }
  const idx = nv < 65535 ? new Uint16Array(I) : new Uint32Array(I);
  /* (2026-10-18, Léo : « les nuages avec la technique des mini-cubes et de la couche transparente lisse — la glisse transparente peut EMBRASSER
     la forme des cubes ») LE NUAGE EN VITRAIL : du MÊME champ, (1) les ÉCAILLES — chaque case de `hc` (ext / opt.vit) dont le centre est dedans et
     qui touche le dehors ; seules ses faces vers le dehors, réduites à 89 % autour du centre (la lumière du cœur passe dans les joints) ; une
     écaille = UNE normale (le gradient du champ en son centre), UN modelé, un hasard ; (2) la PEAU — l'isosurface des cubes ADOUCIS (occupation
     floutée [¼ ½ ¼] puis lue en trilinéaire, seuil opt.iso) : elle suit les marches des cubes en les arrondissant, un peu au-dessus d'eux. */
  let vit = null;
  if (opt.vit) {
    const nc = opt.vit, hc = ext / nc, sc = hc * (opt.ecart || .47), ISO = opt.iso || .36;
    const cnx = Math.ceil(nx * h / hc) + 1, cny = Math.ceil(ny * h / hc) + 1, cnz = Math.ceil(nz * h / hc) + 1, ci = function (i, j, k) { return i + cnx * (j + cny * k); };
    const occ = new Uint8Array(cnx * cny * cnz);
    for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) occ[ci(i, j, k)] = champ(x0 + (i + .5) * hc, y0 + (j + .5) * hc, z0 + (k + .5) * hc) > 0 ? 1 : 0;
    const oc = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= cnx || j >= cny || k >= cnz) ? 0 : occ[ci(i, j, k)]; };
    const modele = function (x, y, z, a, b, c) { // le modelé cuit, comme la surface : R creux, G ciel au-dessus, B hauteur
      let o9 = 0; for (const s of [.04, .09, .17, .3]) { const w = champ(x + a * s, y + b * s, z + c * s); if (w > -1.4) o9 += (w + 1.4) / 1.4 * (s === .04 ? .35 : s === .09 ? .3 : s === .17 ? .22 : .13); }
      let u9 = 0; for (const s of [.1, .22, .38, .6]) { const w = champ(x + a * .03, y + s, z + c * .03); if (w > 0) u9 += Math.min(1, w) * .5; }
      return [Math.max(0, Math.min(1, 1 - o9 * 1.15)), Math.exp(-u9 * 1.6), Math.max(0, Math.min(1, (y - base) / Math.max(.1, top - base)))]; };
    const CP = [], CN = [], CG = [], CC = [], CU = [], CI = [], DIR = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], QD = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) {
      if (!occ[ci(i, j, k)]) continue;
      let ex = 0; for (const d of DIR) if (!oc(i + d[0], j + d[1], k + d[2])) { ex = 1; break; }
      if (!ex) continue;
      const x = x0 + (i + .5) * hc, y = y0 + (j + .5) * hc, z = z0 + (k + .5) * hc, e = hc * .5;
      let gx = champ(x + e, y, z) - champ(x - e, y, z), gy = champ(x, y + e, z) - champ(x, y - e, z), gz = champ(x, y, z + e) - champ(x, y, z - e);
      const l = Math.hypot(gx, gy, gz) || 1; gx = -gx / l; gy = -gy / l; gz = -gz / l;
      const md = modele(x, y, z, gx, gy, gz), hz = hs(i * 7 + 3, j * 13 + 5, k * 11 + 1);
      // (2026-10-18, « pas comme Minecraft, fais le peintre ») LES TOUCHES : opt.jit > 0 → chaque cube décalé, tourné, à sa taille — la grille se casse, des touches de pinceau
      const JT = opt.jit || 0, r1 = hs(i * 3 + 11, j * 5 + 2, k * 7 + 9), r2 = hs(i * 17 + 1, j * 3 + 7, k * 5 + 4), r3 = hs(i + 5, j * 19 + 3, k * 2 + 8), sk9 = sc * (1 - JT * .7 * r1);
      const ox = x + (r2 - .5) * JT * hc, oy = y + (r3 - .5) * JT * hc, oz = z + (r1 - .5) * JT * hc, an = (r2 - .5) * JT * 1.6, bn = (r3 - .5) * JT * 1.6, ca = Math.cos(an), sa = Math.sin(an), cb = Math.cos(bn), sb = Math.sin(bn);
      const rot = function (v) { const x1 = v[0] * ca - v[2] * sa, z1 = v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [x1, y2, z2]; }; // deux petites rotations (lacet, tangage)
      for (const d of DIR) { if (oc(i + d[0], j + d[1], k + d[2])) continue; // (touches) les faces tournées vers l intérieur restent jetées : entre deux touches, on voit le CŒUR (la lumière)
        const ax = d[0] ? 0 : d[1] ? 1 : 2, u = (ax + 1) % 3, w = (ax + 2) % 3, b0 = CP.length / 3, dn = JT ? rot(d) : d;
        for (const q of QD) { const L9 = [0, 0, 0]; L9[ax] = d[ax]; L9[u] = q[0]; L9[w] = q[1]; const P9 = JT ? rot([L9[0] * sk9, L9[1] * sk9, L9[2] * sk9]) : [L9[0] * sc, L9[1] * sc, L9[2] * sc];
          CP.push(ox + P9[0], oy + P9[1], oz + P9[2]); CN.push(dn[0], dn[1], dn[2]); CG.push(gx, gy, gz); CC.push(md[0], md[1], md[2]); CU.push(L9[0], L9[1], L9[2], hz); }
        if (d[ax] > 0) CI.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); else CI.push(b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2); } }
    // la peau : l'occupation floutée [¼ ½ ¼] sur les trois axes, puis lue en trilinéaire
    let ob = new Float32Array(occ.length), t9 = new Float32Array(occ.length); for (let q = 0; q < occ.length; q++) ob[q] = occ[q];
    for (let ax = 0; ax < 3; ax++) { const st = ax === 0 ? 1 : ax === 1 ? cnx : cnx * cny, nn = ax === 0 ? cnx : ax === 1 ? cny : cnz;
      for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) { const q = ci(i, j, k), c9 = ax === 0 ? i : ax === 1 ? j : k;
        t9[q] = ob[q] * .5 + (c9 > 0 ? ob[q - st] : 0) * .25 + (c9 < nn - 1 ? ob[q + st] : 0) * .25; }
      const s9 = ob; ob = t9; t9 = s9; }
    const obv = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= cnx || j >= cny || k >= cnz) ? 0 : ob[ci(i, j, k)]; };
    const otri = function (x, y, z) { const fx = (x - x0) / hc - .5, fy = (y - y0) / hc - .5, fz = (z - z0) / hc - .5, i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz), a = fx - i, b = fy - j, c = fz - k;
      const l1 = obv(i, j, k) + (obv(i + 1, j, k) - obv(i, j, k)) * a, l2 = obv(i, j + 1, k) + (obv(i + 1, j + 1, k) - obv(i, j + 1, k)) * a,
        l3 = obv(i, j, k + 1) + (obv(i + 1, j, k + 1) - obv(i, j, k + 1)) * a, l4 = obv(i, j + 1, k + 1) + (obv(i + 1, j + 1, k + 1) - obv(i, j + 1, k + 1)) * a;
      const q1 = l1 + (l2 - l1) * b, q2 = l3 + (l4 - l3) * b; return q1 + (q2 - q1) * c; };
    const hsk = opt.nsk ? Math.max(hc, ext / opt.nsk) : hc * (opt.peau || .9), sX = Math.ceil(cnx * hc / hsk) + 2, sY = Math.ceil(cny * hc / hsk) + 2, sZ = Math.ceil(cnz * hc / hsk) + 2, s0 = hsk, SX = sX + 1, SY = sY + 1, SZ = sZ + 1; // la peau sur SA grille, à la taille des cubes (la finesse de la surface n'y ajoute rien)
    const V2 = new Float32Array(SX * SY * SZ);
    for (let k = 0; k < SZ; k++) for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) V2[i + SX * (j + SY * k)] = otri(x0 - s0 + i * hsk, y0 - s0 + j * hsk, z0 - s0 + k * hsk) - ISO;
    const vid2 = new Int32Array(sX * sY * sZ).fill(-1), SP = [];
    for (let k = 0; k < sZ; k++) for (let j = 0; j < sY; j++) for (let i = 0; i < sX; i++) {
      let m = 0; for (let c = 0; c < 8; c++) { const v = V2[(i + co[c][0]) + SX * ((j + co[c][1]) + SY * (k + co[c][2]))]; c8[c] = v; if (v > 0) m |= 1 << c; }
      if (m === 0 || m === 255) continue;
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (const e of E) { const a = c8[e[0]], b = c8[e[1]]; if ((a > 0) === (b > 0)) continue; const t = a / (a - b), A = co[e[0]], Bc = co[e[1]];
        sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; n++; }
      vid2[i + sX * (j + sY * k)] = SP.length / 3; SP.push(x0 - s0 + (i + sx / n) * hsk, y0 - s0 + (j + sy / n) * hsk, z0 - s0 + (k + sz / n) * hsk); }
    const SI = [], cel2 = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= sX || j >= sY || k >= sZ) ? -1 : vid2[i + sX * (j + sY * k)]; };
    for (let k = 1; k < SZ - 1; k++) for (let j = 1; j < SY - 1; j++) for (let i = 1; i < SX - 1; i++) {
      const v0 = V2[i + SX * (j + SY * k)], in0 = v0 > 0;
      { const v1 = V2[(i + 1) + SX * (j + SY * k)]; if (in0 !== (v1 > 0)) { const a = cel2(i, j - 1, k - 1), b = cel2(i, j, k - 1), c = cel2(i, j, k), d = cel2(i, j - 1, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) SI.push(a, b, c, a, c, d); else SI.push(a, c, b, a, d, c); } } }
      { const v1 = V2[i + SX * ((j + 1) + SY * k)]; if (in0 !== (v1 > 0)) { const a = cel2(i - 1, j, k - 1), b = cel2(i - 1, j, k), c = cel2(i, j, k), d = cel2(i, j, k - 1); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) SI.push(a, b, c, a, c, d); else SI.push(a, c, b, a, d, c); } } }
      { const v1 = V2[i + SX * (j + SY * (k + 1))]; if (in0 !== (v1 > 0)) { const a = cel2(i - 1, j - 1, k), b = cel2(i, j - 1, k), c = cel2(i, j, k), d = cel2(i - 1, j, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) SI.push(a, b, c, a, c, d); else SI.push(a, c, b, a, d, c); } } } }
    const ns = SP.length / 3, snor = new Float32Array(ns * 3), scol = new Float32Array(ns * 3), e3 = hc * .3;
    for (let v = 0; v < ns; v++) { const x = SP[v * 3], y = SP[v * 3 + 1], z = SP[v * 3 + 2];
      let gx = otri(x + e3, y, z) - otri(x - e3, y, z), gy = otri(x, y + e3, z) - otri(x, y - e3, z), gz = otri(x, y, z + e3) - otri(x, y, z - e3);
      const l = Math.hypot(gx, gy, gz) || 1; gx = -gx / l; gy = -gy / l; gz = -gz / l;
      { const e4 = h * .5; let hx = champ(x + e4, y, z) - champ(x - e4, y, z), hy = champ(x, y + e4, z) - champ(x, y - e4, z), hz9 = champ(x, y, z + e4) - champ(x, y, z - e4); const l4 = Math.hypot(hx, hy, hz9) || 1; const kN = opt.peauN == null ? .65 : opt.peauN; // la peau a la FORME des cubes, mais la LUMIÈRE du nuage lisse (la normale du champ) : sinon chaque marche faisait un liseré blanc, un filet
        gx = gx * (1 - kN) - hx / l4 * kN; gy = gy * (1 - kN) - hy / l4 * kN; gz = gz * (1 - kN) - hz9 / l4 * kN; const l5 = Math.hypot(gx, gy, gz) || 1; gx /= l5; gy /= l5; gz /= l5; }
      snor[v * 3] = gx; snor[v * 3 + 1] = gy; snor[v * 3 + 2] = gz;
      const md = modele(x, y, z, gx, gy, gz); scol[v * 3] = md[0]; scol[v * 3 + 1] = md[1]; scol[v * 3 + 2] = md[2]; }
    const nc4 = CP.length / 3;
    vit = { hc: hc, cpos: new Float32Array(CP), cnor: new Float32Array(CN), cg: new Float32Array(CG), ccol: new Float32Array(CC), ccu: new Float32Array(CU), cidx: nc4 < 65535 ? new Uint16Array(CI) : new Uint32Array(CI),
      spos: new Float32Array(SP), snor: snor, scol: scol, sidx: ns < 65535 ? new Uint16Array(SI) : new Uint32Array(SI) };
  }
  /* (2026-10-18, Léo : « rends les cubes encore plus minuscules et encore plus FANTOMATIQUES pour vraiment construire de nouveaux nuages ; joue sur
     les teintes comme un peintre ») LES CUBES FANTÔMES : autour de chaque sommet de la surface, opt.fant / nv petits cubes posés le long de la
     normale — la plupart DEDANS (le corps qui se construit), quelques-uns dehors (la vapeur qui s'effiloche) —, décalés dans le plan, de tailles
     variables (ext / opt.fsz), chacun son voile (q.y : plus faible dehors), son hasard (q.z, la teinte du peintre) et sa profondeur (q.w). */
  let fant = null;
  if (opt.fant) {
    /* (2026-10-18, Léo : « éparpille mieux les cubes ») LE TIRAGE ÉPARPILLÉ : plus un paquet par sommet de la surface (une grille : des rangées et
       des grappes régulières) — chaque cube tombe au HASARD sur la surface (un triangle tiré selon son aire, un point dedans), avec des GRAPPES et des
       TROUÉES (un bruit de densité : on garde plus de cubes là où il est haut), une VAPEUR qui part plus loin (dehors, de plus en plus rare et
       légère) et des tailles très variées. Tirés dans le désordre : un lot lointain qui n'en dessine qu'une partie garde le même éparpillement. */
    const n4 = opt.fant, sz = ext / (opt.fsz || 110), nt = idx.length / 3, AC = new Float64Array(nt);
    let at = 0; for (let f = 0; f < nt; f++) { const a = idx[f * 3] * 3, b = idx[f * 3 + 1] * 3, c = idx[f * 3 + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      at += .5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx); AC[f] = at; }
    let s9 = ((opt.seed || 1) * 2654435761) | 0; const rnd = function () { s9 = (s9 * 1664525 + 1013904223) | 0; return (s9 >>> 0) / 4294967296; };
    const FP = new Float32Array(n4 * 3), FN = new Float32Array(n4 * 3), FC = new Float32Array(n4 * 3), FQ = new Float32Array(n4 * 4);
    let q = 0, essais = 0;
    while (q < n4 && essais < n4 * 6) { essais++;
      const u = rnd() * at; let lo = 0, hi = nt - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (AC[m] < u) lo = m + 1; else hi = m; } // le triangle, selon son aire
      let b1 = rnd(), b2 = rnd(); if (b1 + b2 > 1) { b1 = 1 - b1; b2 = 1 - b2; } const b0 = 1 - b1 - b2, A = idx[lo * 3] * 3, B = idx[lo * 3 + 1] * 3, C = idx[lo * 3 + 2] * 3;
      const x = pos[A] * b0 + pos[B] * b1 + pos[C] * b2, y = pos[A + 1] * b0 + pos[B + 1] * b1 + pos[C + 1] * b2, z = pos[A + 2] * b0 + pos[B + 2] * b1 + pos[C + 2] * b2;
      let a = nor[A] * b0 + nor[B] * b1 + nor[C] * b2, b = nor[A + 1] * b0 + nor[B + 1] * b1 + nor[C + 1] * b2, c = nor[A + 2] * b0 + nor[B + 2] * b1 + nor[C + 2] * b2; const nl = Math.hypot(a, b, c) || 1; a /= nl; b /= nl; c /= nl;
      const dn = vn(x * 5.3 + 11, y * 5.3, z * 5.3 - 7) * .65 + vn(x * 13.1, y * 13.1 + 3, z * 13.1) * .35; // les grappes et les trouées
      if (rnd() > .55 + .45 * Math.min(1, Math.max(0, (dn - .3) * 2.2))) continue; // des grappes légères : jamais de grande trouée lisse
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd();
      const fd = opt.fdeh || .34, dl = opt.fdeh ? 10 : 6, dep = r1 < 1 - fd ? -Math.pow(r2, 1.3) * 7.5 : Math.pow(r2, 1.7) * dl; // la profondeur (en tailles de cube) : le corps dedans, la VAPEUR dehors (plus loin, plus rare) — (mélange) surtout dehors, plus loin : le nuage qui se défait
      const jx = (rnd() - .5) * sz * 2.2, jy = (rnd() - .5) * sz * 2.2, jz = (rnd() - .5) * sz * 2.2; // un peu de désordre en 3D
      FP[q * 3] = x + a * dep * sz + jx; FP[q * 3 + 1] = y + b * dep * sz + jy; FP[q * 3 + 2] = z + c * dep * sz + jz;
      FN[q * 3] = a; FN[q * 3 + 1] = b; FN[q * 3 + 2] = c;
      FC[q * 3] = col[A] * b0 + col[B] * b1 + col[C] * b2; FC[q * 3 + 1] = col[A + 1] * b0 + col[B + 1] * b1 + col[C + 1] * b2; FC[q * 3 + 2] = col[A + 2] * b0 + col[B + 2] * b1 + col[C + 2] * b2;
      FQ[q * 4] = sz * (.35 + 1.25 * Math.pow(r3, 1.6)) * (dep > 0 ? .8 : 1); FQ[q * 4 + 1] = dep > 0 ? (opt.fdeh ? .22 + .4 * r4 : .07 + .2 * r4) * (1 - dep / (dl + .5)) : .24 + .32 * r4; FQ[q * 4 + 2] = r4; FQ[q * 4 + 3] = dep;
      q++; }
    const fin = function (A9, k) { return A9.subarray(0, q * k); };
    fant = { pos: fin(FP, 3), nor: fin(FN, 3), col: fin(FC, 3), q: fin(FQ, 4), k: sz * 3 }; // k : de combien le CORPS du nuage rentre (les fantômes du dessus se voient)
  }
  return { pos: pos, nor: nor, col: col, idx: idx, vit: vit, fant: fant };
}
/* LE SCULPTEUR DE CUMULUS v8 — les FORMES refaites (les gabarits v4-v7 étaient des piles de bourgeons étroites : au banc, des « fantômes »).
   Un vrai cumulus : une BASE plate (des lobes aplatis posés sur le plancher de condensation, répartis dans une empreinte elliptique), un DÔME
   (des lobes plus hauts vers le centre), selon le genre une TOUR qui rétrécit en montant (congestus), cisaillée par le vent, coiffée d'une
   enclume (champignon), une rangée de tourelles (castellanus), un rouleau bas (stratocumulus), un troupeau (altocumulus), des lambeaux (fractus) ;
   puis le CHOU-FLEUR : chaque lobe du haut porte 2-3 enfants ronds posés sur sa calotte, vers le haut et le dehors, et les enfants du sommet
   leurs petits-enfants. 70 lobes au plus. Fonction pure : la surface (nuage8Calc) les fond ensuite en une seule masse. */
function cumulus8(genre, rng) {
  const B = [], base = -.35, U = function (a, b) { return a + (b - a) * rng(); }, MAXB = 70;
  const add = function (x, y, z, r, fy) { if (B.length < MAXB) B.push([x, y, z, r, fy || 1]); return B.length - 1; };
  let d = .7, H = .55, n0 = 9, rb = .3, tour = 0, enclume = 0, cis = 0, kidsK = 1;
  if (genre === 'humilis') { d = U(.55, .8); H = U(.28, .42); n0 = 11; rb = U(.22, .3); kidsK = .8; }
  else if (genre === 'mediocris') { d = U(.6, .8); H = U(.5, .7); n0 = 10; rb = U(.27, .34); }
  else if (genre === 'congestus') { d = U(.65, .85); H = U(.55, .75); n0 = 9; rb = U(.3, .36); tour = U(.9, 1.5); }
  else if (genre === 'castellanus') { d = U(.5, .7); H = U(.3, .4); n0 = 10; rb = U(.24, .3); tour = -1; }
  else if (genre === 'cisaille') { d = U(.6, .8); H = U(.5, .65); n0 = 9; rb = U(.28, .34); tour = U(.8, 1.2); cis = U(.18, .3) * (rng() < .5 ? -1 : 1); }
  else if (genre === 'champignon') { d = U(.7, .9); H = U(.5, .6); n0 = 8; rb = U(.3, .36); tour = U(1, 1.4); enclume = 1; }
  else if (genre === 'cumulonimbus') { d = U(.75, .9); H = U(.6, .75); n0 = 10; rb = U(.32, .38); tour = U(2, 2.6); enclume = 2; kidsK = .6; } // le géant d'orage : une tour massive, son ENCLUME large et plate
  else if (genre === 'stratocumulus') { d = U(.3, .45); H = U(.2, .3); n0 = 14; rb = U(.18, .24); kidsK = .7; }
  else if (genre === 'altocumulus') { // un TROUPEAU de petits cumulus détachés
    const np = 4 + Math.floor(rng() * 4);
    for (let p = 0; p < np; p++) { const cx = U(-.85, .85), cz = U(-.5, .5), s = U(.12, .22);
      for (let q = 0; q < 4; q++) add(cx + U(-1, 1) * s, base + s * U(.5, 1.1), cz + U(-1, 1) * s * .6, s * U(.7, 1.1), q < 2 ? .6 : 1); }
    enfants(B.length, .8); return fin();
  }
  else if (genre === 'fractus') { // des lambeaux : quelques lobes aplatis, sans base franche
    const np = 3 + Math.floor(rng() * 3);
    for (let p = 0; p < np; p++) { const cx = U(-.8, .8), cy = base + U(.05, .35), cz = U(-.3, .3);
      for (let q = 0; q < 3; q++) add(cx + U(-.2, .2), cy + U(-.05, .08), cz + U(-.12, .12), U(.1, .2), U(.45, .7)); }
    return fin();
  }
  // LA BASE : des lobes aplatis posés sur le plancher de condensation, répartis dans l'empreinte (une ellipse 1 × d), pas trop serrés
  const P = [];
  for (let t = 0; t < 400 && P.length < n0; t++) { const x = U(-1, 1), z = U(-d, d); if (x * x + (z / d) * (z / d) > 1) continue;
    let ok = true; for (const q of P) if (Math.hypot(q[0] - x, (q[1] - z) * 1.2) < rb * .95) { ok = false; break; } if (ok) P.push([x, z]); }
  for (const q of P) { const rho = Math.sqrt(q[0] * q[0] + (q[1] / d) * (q[1] / d)), hd = H * Math.pow(Math.max(0, 1 - rho * rho), .7);
    const r = rb * U(.8, 1.15) * (1 + .35 * (1 - rho));
    add(q[0], base + Math.max(r * .5, hd + base * 0 - r * .45), q[1], r, 1); }
  // LE DÔME : une couronne de lobes plus hauts vers le centre
  const nd = Math.max(2, Math.round(n0 * .45));
  for (let i = 0; i < nd; i++) { const a = rng() * 6.283, rr = Math.sqrt(rng()) * .55, x = Math.cos(a) * rr, z = Math.sin(a) * rr * d;
    const r = rb * U(1.0, 1.35), hd = H * Math.pow(Math.max(0, 1 - rr * rr), .7); add(x, base + hd + r * .1, z, r, 1); }
  // LA TOUR (congestus, cisaillé, champignon) : des lobes empilés qui rétrécissent, le chou-fleur sur les épaules
  if (tour > 0) { let x = U(-.15, .15), z = U(-.1, .1) * d, y = base + H * .7, r = rb * 1.6; const top = base + H + tour;
    while (y < top && B.length < MAXB - 22) { add(x, y, z, r, 1); add(x + r * U(.55, .8), y - r * .2, z + U(-.3, .3) * r, r * U(.7, .85), 1); add(x - r * U(.55, .8), y - r * .15, z + U(-.3, .3) * r, r * U(.68, .82), 1);
      add(x + U(-.3, .3) * r, y - r * .2, z + r * U(.45, .65) * (rng() < .5 ? -1 : 1), r * U(.65, .8), 1);
      y += r * U(.55, .7); r *= U(.88, .96); x += cis + U(-.05, .05); }
    if (enclume === 1) { const yc = y - r * .35; add(x, yc + r * .15, z, r * 1.1, .6); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + U(-.2, .2), rr = U(.45, .9); add(x + Math.cos(a) * rr, yc + U(-.06, .06), z + Math.sin(a) * rr * .85, U(.28, .38), U(.5, .62)); } }
    if (enclume === 2) { const yc = y - r * .1, dw = U(1.3, 1.8); add(x, yc, z, r * 1.3, .45); // l'ENCLUME : une large table de ouate, étirée sous le vent
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + U(-.15, .15), rr = U(.35, 1) * dw, sx = Math.cos(a) > 0 ? 1.25 : .75; add(x + Math.cos(a) * rr * sx, yc + U(-.04, .05) - rr * .04, z + Math.sin(a) * rr * .7, U(.3, .42), U(.38, .5)); } }
  }
  if (tour < 0) { // castellanus : une rangée de TOURELLES sur la base plate
    const nt = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < nt; i++) { const x = -.7 + 1.4 * (i + .5) / nt + U(-.08, .08); let y = base + H, r = rb * U(.8, 1); const h = U(.35, .7);
      while (y < base + H + h) { add(x, y, U(-.1, .1), r, 1); y += r * .8; r *= .82; } }
  }
  enfants(B.length, kidsK * (ARC_ON ? KIDS_ARC : 1)); // (2026-10-20, Léo : « trop de nuages, vomitif » ; modèles 3D libres CC0 de Quaternius : UNE masse calme, base plate, un dôme, peu de lobes) moins de chou-fleur
  return fin();
  // LE CHOU-FLEUR : chaque lobe du haut porte des enfants ronds (×.38-.55), eux-mêmes des petits-enfants — posés sur sa calotte, vers le haut et le dehors
  function enfants(n, k) {
    let top = base; for (const b of B) top = Math.max(top, b[1] + b[3] * b[4]);
    const Hs = Math.max(.1, top - base), L0 = B.slice(0, n);
    const pose = function (b, nk, f0, f1) { const out = [];
      for (let c = 0; c < nk; c++) { const ox = b[0], oz = b[2], ol = Math.hypot(ox, oz) || 1;
        let dx = U(-1, 1) + ox / ol * .7, dy = U(.5, 1.4), dz = U(-1, 1) + oz / ol * .5; const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
        const rc = b[3] * U(f0, f1), i = add(b[0] + dx * b[3] * .78, b[1] + dy * b[3] * .78 * b[4], b[2] + dz * b[3] * .78, rc, 1); if (i >= 0) out.push(B[i]); }
      return out; };
    for (const b of L0) { if (b[4] < .9 || b[1] + b[3] < base + Hs * .3) continue;
      const nk = Math.round((b[3] > .25 ? 3 : 2) * k * U(.7, 1.3)), ks = pose(b, nk, .38, .55);
      for (const c of ks) if (c[1] > base + Hs * .55 && c[3] > .08 && rng() < .7) pose(c, 1 + (rng() < .5 ? 1 : 0), .4, .55); }
  }
  function fin() { let top = base; for (const b of B) top = Math.max(top, b[1] + b[3] * b[4]); return { B: B, base: base, top: top }; }
}
function cotonBuf(r){const g=new THREE.BufferGeometry(); // les tableaux d'un calcul → une géométrie
  g.setAttribute('position',new THREE.BufferAttribute(r.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(r.nor,3));g.setAttribute('color',new THREE.BufferAttribute(r.col,3));
  g.setIndex(new THREE.BufferAttribute(r.idx,1));g.computeBoundingSphere();for(const k in g.attributes)nuLibre(g.attributes[k]);nuLibre(g.index);return g;} // (2026-10-18) la copie JavaScript jetée une fois au GPU (voir nuLibre)
function cotonGeo(S,sph){ // les bourgeons fusionnés, en unités du nuage : modelé cuit (ventre lavande → sommet blanc, creux), faces enfouies jetées — TOUT DE SUITE
  const A=sph.attributes;return cotonBuf(cotonCalc(S.B,S.base,S.top,A.position.array,A.normal.array,sph.index.array,COTON.CH));}
/* L'OUVRIER DES NUAGES (2026-09-30, revue GAMEPLAY, mesuré : cotonInit gelait le fil principal 2,1 à 2,9 s au lancement — 96 formes d'un bloc,
   la plus fine en pèse la moitié — et chaque portail 0,2 s, les coussins et les tours refaisant chacun sa forme). Le calcul d'une forme
   (cotonCalc, pur) part dans un Web Worker bâti depuis sa propre source (un seul code, pas de copie) ; en attendant, une ÉBAUCHE légère
   tient la place. Si le navigateur refuse l'ouvrier (page locale stricte), la file repart sur le fil principal PAR TRANCHES (~8 ms). */
const COTON_OUV={w:null,ko:false,id:0,att:new Map(),file:[],t:0};
function cotonOuvrier(){
  if(COTON_OUV.w||COTON_OUV.ko)return COTON_OUV.w;
  try{const src='const cotonCalc='+cotonCalc.toString()+';const nuage8Calc='+nuage8Calc.toString()+';self.onmessage=function(e){const q=e.data,r=q.n8?nuage8Calc(q.B,q.base,q.top,q.n8,q.o8):cotonCalc(q.B,q.base,q.top,q.sp,q.sn,q.si,q.CH);self.postMessage({id:q.id,r:r},[r.pos.buffer,r.nor.buffer,r.col.buffer,r.idx.buffer]);};';
    const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    w.onmessage=function(e){const a=COTON_OUV.att.get(e.data.id);if(!a)return;COTON_OUV.att.delete(e.data.id);a.cb(e.data.r);};
    w.onerror=function(ev){try{ev.preventDefault();}catch(e9){}cotonOuvrierKo();};COTON_OUV.w=w;
  }catch(e){COTON_OUV.ko=true;}
  return COTON_OUV.w;}
function cotonOuvrierKo(){COTON_OUV.ko=true;if(COTON_OUV.w){try{COTON_OUV.w.terminate();}catch(e){}COTON_OUV.w=null;} // refusé : sa file repart sur le fil principal
  for(const a of COTON_OUV.att.values())cotonTranche(a.job,a.cb);COTON_OUV.att.clear();}
function cotonTranche(job,cb){COTON_OUV.file.push({job:job,cb:cb});if(!COTON_OUV.t)COTON_OUV.t=setTimeout(cotonTrancheSuite,0);}
function cotonTrancheSuite(){COTON_OUV.t=0;const t0=performance.now();
  while(COTON_OUV.file.length&&performance.now()-t0<8){const a=COTON_OUV.file.shift(),q=a.job;a.cb(q.n8?nuage8Calc(q.B,q.base,q.top,q.n8,q.o8):cotonCalc(q.B,q.base,q.top,q.sp,q.sn,q.si,q.CH));}
  if(COTON_OUV.file.length)COTON_OUV.t=setTimeout(cotonTrancheSuite,16);}
function cotonCalcAsync(S,sph,cb){ // cb(le calcul), PLUS TARD : dans l'ouvrier si possible, sinon par tranches
  const A=sph.attributes,job={B:S.B,base:S.base,top:S.top,sp:A.position.array,sn:A.normal.array,si:sph.index.array,CH:COTON.CH},w=cotonOuvrier();
  if(w){const id=++COTON_OUV.id;COTON_OUV.att.set(id,{job:job,cb:cb});try{w.postMessage({id:id,B:job.B,base:job.base,top:job.top,sp:job.sp,sn:job.sn,si:job.si,CH:job.CH});}catch(e){COTON_OUV.att.delete(id);cotonTranche(job,cb);}}
  else cotonTranche(job,cb);}
function nuage8Async(S,N,cb,vit){ // (v8) une finesse de la NOUVELLE surface : dans l'ouvrier si possible, sinon par tranches — vit : la taille des écailles du VITRAIL (nombre de cubes sur la plus grande dimension), 0 = sans
  const job={n8:N,o8:Object.assign({seed:S.seed||0},N8_OPT,NUVIT.vox?{vox:NUVIT.vox,det:NUVIT.vox.det==null?N8_OPT.det:NUVIT.vox.det}:vit?(NUVIT.fant?{fant:NUVIT.fant,fsz:NUVIT.fsz,fdeh:NUVIT.fdeh}:Object.assign({vit:vit,iso:NUVIT.iso,nsk:NUVIT.nsk,ecart:NUVIT.ecart,jit:NUVIT.jit||0},NUVIT.mix?{fant:NUVIT.mix,fsz:NUVIT.fsz,fdeh:NUVIT.fdeh}:{})):{}),B:S.B,base:S.base,top:S.top},w=cotonOuvrier();
  if(w){const id=++COTON_OUV.id;COTON_OUV.att.set(id,{job:job,cb:cb});try{w.postMessage({id:id,n8:N,o8:job.o8,B:job.B,base:job.base,top:job.top});}catch(e){COTON_OUV.att.delete(id);cotonTranche(job,cb);}}
  else cotonTranche(job,cb);}
function cotonFinesse(k,f,g){ // une finesse est arrivée : elle remplace l'ébauche dans SON lot et dans les lots plus fins encore en attente
  COTON.pret[k*4+f]=1;const tri=g.index.count/3;
  for(let f2=f;f2<4;f2++){const j=k*4+f2;if(f2>f&&COTON.pret[j])break;const im=COTON.im[j];im.geometry=g;im.userData.tri=tri;}
  let n=0;for(let i=0;i<COTON.pret.length;i++)n+=COTON.pret[i];if(n===COTON.pret.length&&!COTON.msPret)COTON.msPret=performance.now()-COTON.t0;}
/* LA MATIÈRE v8 — la lumière d'un peintre (Ghibli, Zelda : Tears of the Kingdom) : une frontière d'ombre DOUCE mais franche (wrap puis rampe),
   le côté soleil crème, le côté ombre pris par le CIEL (bleu, lavande sous le ventre), l'ombre PORTÉE des bourgeons du haut (G cuit),
   les creux (R cuit), la base plus sourde, et à contre-jour la LISIÈRE qui s'embrase (diffusion avant). Les couleurs sont celles de
   l'ambiance (le soleil, l'hémisphère : bioApply) — aucune couleur écrite ici. Les bords s'allègent (la vapeur). Instanciée (COTON). */
/* (2026-10-14, passe graphismes, coton-blanc) LA MATIÈRE DES NUAGES v2 — Sacha : « des cumulus blancs et vaporeux, pas beige sable / lavande,
   pas du plastique ». Trois choses :
   (1) la teinte PAR NUAGE (cotonPose) devient un blanc NEUTRE à ±3 % de luminance — c'était elle qui mêlait sable et lavande dans la même
       image (±20 % de rouge contre ±22 % de bleu, vue à 30 % par le shader) ; tous paliers, gratuit (même nombre de tirages `cr`) ;
   (2) au palier 2 SEULEMENT (`N8_VAP`) : une toile de bruit 256² (`n8Vap`, fabriquée UNE fois, 128 Ko) lue UNE fois par pixel de nuage
       (bruit 3D de valeur en une lecture : deux tranches côte à côte dans la toile) — les bords s'effilochent sur 3-8 % du rayon, le cœur
       prend un grain de vapeur ; éteint au loin (une cellule sous ~3 px : pas de scintillement) ; paliers 0-1 = le programme d'aujourd'hui ;
   (3) la lisière d'OR seulement à contre-jour (de face, l'allègement du bord reste blanc neutre). Réglage à chaud : `dbgCotonV2({…})`. */
const N8_VAP=PAL.n===2;
function n8Vap(){ const N=256,A=new Uint8Array(N*N),D=new Uint8Array(N*N*2),rg=mulberry32(0x7A9E5C01);
  for(let i=0;i<N*N;i++)A[i]=(rg()*256)|0;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;D[i*2]=A[i];D[i*2+1]=A[((y+17)&255)*N+((x+37)&255)];} // L = la tranche z, A = la tranche z+1 (décalée de 37,17)
  const t=new THREE.DataTexture(D,N,N,THREE.LuminanceAlphaFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}
const N8_U={uFondu:{value:1},uTps:{value:0},uSunW:{value:SUN_DIR},uNearF:GFX_U.uNearF,uAlb:{value:CLOUD_MAT.color},uSunC:{value:null},uSky:{value:null},uGnd:{value:null},uK:{value:new THREE.Vector4(1,1,1,1)},uR:{value:new THREE.Vector4(-.25,.5,.64,1)}}; // uR : la frontière d'ombre (début, fin en N·L), la clarté du côté ombre, (libre)
if(N8_VAP){N8_U.uVap={value:null};N8_U.uVapK={value:new THREE.Vector4(1,1,1,1)};} // (coton-blanc) la toile de vapeur et ses doses : x érosion du bord, y grain du cœur, z or du contre-jour, w tout (palier 2)
N8_U.uLav={value:new THREE.Vector3(.72,.78,.97)}; // (2026-10-14, passe graphismes · nuages-jour) la teinte de l'ombre des cumulus (était la constante vec3(.72,.78,.97) du GLSL, un bleu-lavande franc) : un uniforme, posé par ambiance (champ `nuLav`), même valeur par défaut
/* LES NUAGES SANS COUTURES BLEUES (2026-10-15 soir, Sacha : « les nuages sont encore buggés ») — VU au banc (mer de nuages, rafales de photos) : des
   LISERÉS BLEUS et des trous dans la ouate là où deux cumulus se chevauchent. La cause : le bord d'un nuage est à demi transparent (la silhouette
   qui s'allège, le fondu près de l'objectif, le fondu d'une zone neuve) mais il ÉCRIT sa profondeur ; les nuages sont rangés en ~100 lots
   (gabarit × finesse) triés du plus loin au plus près DANS chaque lot, mais pas d'un lot à l'autre — un nuage proche dessiné avant un nuage
   lointain d'un autre lot le masquait, et le ciel passait par son bord. Depuis la map SANS HAUT NI BAS (des nuages tout autour, très près de la
   route qui se tord), on ne voyait plus que ça. Le bord devient une TRAME ordonnée (Bayer 4 × 4) : chaque fragment est opaque ou jeté — l'ordre
   de dessin ne compte plus. Les nuages en instances seulement (le nuage du titre garde son fondu). `?nuages=fondus` = avant. */
const N8_TRAME=!/[?&]nuages=fondus\b/.test(location.search);
function nuage8Mat(){ if(COTON.mat8)return COTON.mat8;
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k in N8_U)U[k]=N8_U[k];
  U.uSunC.value=sun.color;U.uSky.value=hemi.color;U.uGnd.value=hemi.groundColor;
  if(N8_VAP)U.uVap.value=n8Vap(); // (coton-blanc) fabriquée une fois, à la 1re matière (au menu : nuageChauffe → cotonInit)
  const m=new THREE.ShaderMaterial({uniforms:U,vertexColors:true,fog:true,transparent:true,depthWrite:true,
    vertexShader:['#include <common>','#include <fog_pars_vertex>','varying vec3 vN,vW,vA,vT;varying float vNvF;uniform float uTps;',...(N8_VAP?['varying vec3 vP;varying float vQ;']:[]),
      'void main(){vec3 tr=position;vec3 nn=normal;vT=vec3(1.);',
      '  float ph=0.;vNvF=0.;',
      '#ifdef USE_INSTANCING',
      '  ph=dot(instanceMatrix[3].xyz,vec3(.013,.007,.011));vNvF=instanceMatrix[0][3];',
      '#endif',
      ...(N8_VAP?['  vP=position*13.+vec3(fract(ph*.71),fract(ph*.53),fract(ph*.37))*256.;']:[]), /* (coton-blanc) la vapeur ACCROCHÉE au nuage (avant le bouillonnement) : une cellule = 7,7 % du rayon ; chaque nuage son décalage */
      /* LA OUATE QUI BOUILLONNE (v8) : chaque lobe gonfle et se retire très lentement (deux ondes lentes le long de la normale, 1,5 % du nuage),
         déphasées par nuage — le ciel vit sans qu'aucun nuage ne bouge de place. Un calcul par sommet, zéro par pixel. */
      '  tr+=nn*(sin(uTps*.33+ph+dot(position,vec3(3.1,4.7,2.3)))*.011+sin(uTps*.19-ph+dot(position,vec3(-5.3,2.9,3.7)))*.007)*step(-.33,position.y);',
      '#ifdef USE_INSTANCING',
      '  vec3 c0=instanceMatrix[0].xyz,c1=instanceMatrix[1].xyz,c2=instanceMatrix[2].xyz;',
      '  nn=mat3(instanceMatrix)*(nn/vec3(dot(c0,c0),dot(c1,c1),dot(c2,c2)));',   // la normale suit l étirement de l instance (inverse transposée)
      '  tr=(instanceMatrix*vec4(tr,1.)).xyz;',
      '#endif',
      '#ifdef USE_INSTANCING_COLOR',
      '  vT=instanceColor;',
      '#endif',
      '  vA=color;vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);',
      '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;',
      ...(N8_VAP?['  float sc9=length(modelMatrix[0].xyz);','#ifdef USE_INSTANCING','  sc9*=length(c0);','#endif','  vQ=sc9*.077/max(length(cameraPosition-wp.xyz),1.);']:[]), /* (coton-blanc) la taille d une cellule de vapeur à l écran (rad) : sous ~3 px elle s éteint */
      '#include <fog_vertex>',
      '}'].join('\n'),
    fragmentShader:['#include <common>','#include <fog_pars_fragment>','uniform vec3 uSunW,uAlb,uSunC,uSky,uGnd;uniform vec2 uNearF;uniform vec4 uK,uR;uniform float uFondu;varying vec3 vN,vW,vA,vT;varying float vNvF;',...(N8_VAP?['uniform sampler2D uVap;uniform vec4 uVapK;varying vec3 vP;varying float vQ;','float n8vap(vec3 x){vec3 p=floor(x),f=fract(x);f=f*f*(3.-2.*f);vec2 uv=mod(p.xy+vec2(37.,17.)*p.z,256.)+f.xy;vec2 rg=texture2D(uVap,(uv+.5)/256.).ra;return mix(rg.x,rg.y,f.z);}']:[]),
      'void main(){vec3 N=normalize(vN),N0=N,V=normalize(cameraPosition-vW);',
      /* LE RELIEF DE PRÈS (SON et DEBUGGING, mesuré : en vol, un grand nuage tout proche était un MUR lisse « en plastique ») : sous ~300 m, la
         normale ondule (deux champs de sinus déformés, en espace monde, des bosses de ~50 m) — le mur redevient de la ouate bosselée. Au loin, rien. */
      '  float dd=length(cameraPosition-vW),kd=smoothstep(320.,70.,dd);',
      '  if(kd>.01){vec3 q=vW*.045;vec3 w=sin(q.zxy*1.3+sin(q.yzx*2.1));vec3 g=cos(q*2.7+w*1.6)+.5*cos(q.yzx*6.1+w.zxy*2.);N=normalize(N+(g-N*dot(g,N))*.32*kd);}',
      '  float ao=vA.r,tv=vA.g,hh=vA.b,nl=dot(N,uSunW),sh=smoothstep(-.1,.5,uSunW.y);',
      '  float lit=smoothstep(uR.x,uR.y,nl);',                                                    /* la frontière d ombre : douce mais FRANCHE (le trait d un peintre) */
      '  lit*=mix(1.,tv,.6*sh)*mix(.32,1.,ao);',                                                  /* l ombre portée des lobes du haut, les creux du chou-fleur */
      /* (2026-10-01, Sacha : « les nuages, j'aime pas l'effet Van Gogh, remets un effet normal ») la touche sur la ouate — la lumière posée en
         aplats de peintre aux bords brisés, le contour sombre — est RETIRÉE : les nuages gardent leur modelé doux. */
      '  vec3 alb=uAlb*mix(vec3(1.),vT,.3)*uK.x;',                                                /* la teinte propre du nuage, en sourdine (à plein, les « chauds » sortaient ORANGE) */
      '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
      '  vec3 ciel=mix(vec3(.72,.78,.97)*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',   /* (SON, mesuré) l ombre tirait au BRUN (le sol de l hémisphère) : un bleu-LAVANDE franc sous le ventre et sur les flancs */                   /* le côté ombre pris par le CIEL : bleu-lavande (et le rebond de la mer sous le ventre) */
      '  vec3 Fd=normalize(vec3(-uSunW.x,.55,-uSunW.z));float fl=.72+.38*max(dot(N,Fd),0.)+.12*max(-N.y,0.);',     /* le côté OMBRE a son modelé : le ciel à l opposé du soleil l éclaire, la mer de nuages renvoie par en dessous */
      '  vec3 ombre=ciel*uR.z*fl*mix(.55,1.,ao)*mix(.84,1.,hh);',
      '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',                                        /* la CHALEUR du soleil : nulle au matin et à midi, l or n arrive qu en fin d après-midi */
      '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',   /* (SON, mesuré) au matin les nuages sortaient BEIGE-SABLE : un blanc franc côté soleil */
      '  vec3 col=alb*mix(ombre,soleil,lit);',
      '  float fr=1.-max(dot(N,V),0.),bk=pow(max(dot(-V,uSunW),0.),3.);',
      ...(N8_VAP?['  float nz=n8vap(vP),kq=smoothstep(.0045,.013,vQ)*uVapK.w,e9=smoothstep(.62,.95,fr)*kq;']:[]), /* (coton-blanc) UNE lecture : nz la vapeur, e9 la frange (3-8 % du rayon au bord de la silhouette) */
      N8_VAP?'  col+=soleil*mix(vec3(1.),vec3(1.,.9,.7),uVapK.z*smoothstep(.3,.8,dot(uSunC,vec3(.3,.59,.11))))*(pow(fr,3.)*1.5*bk+bk*.07*(1.-ao*.5))*uK.z;':'  col+=soleil*(pow(fr,3.)*1.5*bk+bk*.07*(1.-ao*.5))*uK.z;',   /* (SON, mesuré) la lueur de contre-jour ne teinte plus TOUTE la face en sable : le liseré, et un voile léger */                                  /* à contre-jour : la LISIÈRE d argent, et la vapeur éclairée par derrière */
      N8_VAP?'  col+=alb*vec3(dot(soleil,vec3(.3,.59,.11)))*pow(fr,2.)*.16*(1.-bk)*(.4+.6*lit);':'  col+=alb*soleil*pow(fr,2.)*.16*(1.-bk)*(.4+.6*lit);',                                     /* de face, le bord qui tourne s ALLÈGE (la vapeur mince diffuse la lumière) */
      '  float a=(1.-pow(fr,6.)*.45*uK.w)*uFondu;',
      ...(N8_VAP?['  col*=mix(1.,.955+.09*nz,kq*uVapK.y*(1.-e9));','  a*=mix(1.,smoothstep(e9*.9-.15,e9*.9+.15,nz),e9*uVapK.x);']:[]), /* (coton-blanc) le grain du cœur (±4,5 %), puis le bord qui s effiloche : plus on va vers la silhouette, plus la vapeur doit être dense pour rester */
      '#ifdef NUAGE8_INST',
      '  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));',
      ...(N8_TRAME?['  {vec2 q9=floor(gl_FragCoord.xy),h9=floor(q9*.5);float b9=fract(h9.x*.5+h9.y*h9.y*.75)*.25+fract(q9.x*.5+q9.y*q9.y*.75);if(a<=b9+.03125||(vNvF<0.?-vNvF<=b9+.03125:vNvF>b9+.03125))discard;a=1.;}']:['  a*=vNvF<0.?-vNvF:1.-vNvF;']), /* (2026-10-15 soir) LE BORD EN TRAME : opaque ou rien (voir N8_TRAME) */ /* (2026-10-18, LE FONDU) la v8 (part ≥ 0) cède ces points-là ; le corps rentré d'un fantôme (part < 0) les prend */
      '#endif',
      ...(N8_VAP?['  if(e9>.01&&a<.02)discard;']:[]), /* (coton-blanc) un bord effiloché n écrit pas sa profondeur : le lobe de derrière le remplit */
      '  gl_FragColor=vec4(col,a);',
      '#include <fog_fragment>',
      '}'].join('\n')});
  {m.fragmentShader=m.fragmentShader.replace('uniform vec3 uSunW,','uniform vec3 uLav,uSunW,').replace('vec3(.72,.78,.97)','uLav');m.uniforms.uLav=N8_U.uLav;} // (2026-10-14, passe graphismes · nuages-jour) même coût (un uniforme au lieu d'une constante), source différente = programme à part
  m.defines={NUAGE8_INST:''};m.customProgramCacheKey=function(){return N8_VAP?'nuage8inst2':'nuage8inst';}; /* (coton-blanc) la solo garde 'nuage8solo' : le titre (CHUTE.nuM) en partage le programme — sa source change déjà la clé de three */
  return (COTON.mat8=m);}
function nuage8Solo(){ if(COTON.mat8s)return COTON.mat8s; // (v8) la même matière pour un maillage seul (bancs de route, coussins de vol, tours) — chauffée au menu (nuageChauffe)
  const m=nuage8Mat().clone();m.uniforms=nuage8Mat().uniforms;m.defines={};m.customProgramCacheKey=function(){return 'nuage8solo';};return (COTON.mat8s=m);}
