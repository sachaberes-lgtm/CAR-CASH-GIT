// LES TRAITS FINS (2026-11-18, lot « hudmort ») — lit les images d'une passe de morts.cjs et cherche les TRAITS HORIZONTAUX fins :
// 1 à 6 px d'écran d'épaisseur, au moins --min px de long, plus clairs (ou plus sombres) que le dessus ET le dessous, qui eux se ressemblent.
// Les traits sont regroupés par place (même ligne ±3 px, x qui se chevauchent) sur toutes les images d'une mort : un trait qui ne vit
// que quelques images est suspect. Écrit traits.json et, pour les --n premiers groupes, une vignette zoomée ×4 de la 1re image où il est.
//   node outils/banc-hudmort/traits.cjs dossier-de-passe [--min 24] [--n 40] [--zone x0,y0,x1,y1] [--pas 1]
const fs = require('fs'), path = require('path');
const { lit, ecrit, coupe } = require('./png.cjs');
const A = {}; const DOS = path.resolve(process.argv[2]); for (let i = 3; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const MIN = +(A.min || 24), N = +(A.n || 40), D = +(A.d || 32), PAS = +(A.pas || 1);
const ZONE = A.zone ? A.zone.split(',').map(Number) : null;

function traits(img) {
  const { w, h, d } = img, Y = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) Y[i] = .299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2];
  const S = [];
  for (let t = 1; t <= 6; t++) for (let y = 3; y + t + 2 < h; y++) {
    let x0 = -1, sg0 = 0;
    const fin = (x1) => { if (x0 >= 0 && x1 - x0 >= MIN) S.push({ y, t, x0, x1, sg: sg0 }); x0 = -1; };
    for (let x = 0; x < w; x++) {
      let m = 0; for (let k = 0; k < t; k++) m += Y[(y + k) * w + x]; m /= t;
      const a = Y[(y - 2) * w + x], b = Y[(y + t + 1) * w + x];
      let sg = 0; if (Math.abs(a - b) < D * .8) { if (m - a > D && m - b > D) sg = 1; else if (a - m > D && b - m > D) sg = -1; }
      if (sg && (x0 < 0 || sg === sg0)) { if (x0 < 0) { x0 = x; sg0 = sg; } } else { fin(x); if (sg) { x0 = x; sg0 = sg; } }
    }
    fin(w);
  }
  /* un même trait sort pour plusieurs épaisseurs : garder la plus fine par place */
  S.sort((p, q) => p.t - q.t);
  const G = [];
  for (const s of S) if (!G.some(g => Math.abs(g.y - s.y) <= 2 && g.x0 < s.x1 && s.x0 < g.x1)) G.push(s);
  return ZONE ? G.filter(s => s.x1 > ZONE[0] && s.x0 < ZONE[2] && s.y > ZONE[1] && s.y < ZONE[3]) : G;
}

const R = {};
for (const sous of fs.readdirSync(DOS).filter(f => /^\d\d-/.test(f)).sort()) {
  const dd = path.join(DOS, sous), imgs = fs.readdirSync(dd).filter(f => /^\d{3}\.png$/.test(f)).sort();
  const grp = [];
  for (let i = 0; i < imgs.length; i += PAS) {
    let img; try { img = lit(path.join(dd, imgs[i])); } catch (e) { continue; }
    for (const s of traits(img)) {
      let g = grp.find(g => Math.abs(g.y - s.y) <= 3 && g.x0 < s.x1 && s.x0 < g.x1);
      if (!g) { g = { y: s.y, x0: s.x0, x1: s.x1, t: s.t, sg: s.sg, im: [], prem: imgs[i] }; grp.push(g); }
      g.im.push(i); g.x0 = Math.min(g.x0, s.x0); g.x1 = Math.max(g.x1, s.x1);
    }
  }
  const nb = Math.ceil(imgs.length / PAS);
  grp.forEach(g => { g.n = g.im.length; g.part = +(g.n / nb).toFixed(2); g.im = g.im.length > 12 ? [g.im[0], '…', g.im[g.im.length - 1]] : g.im; });
  grp.sort((p, q) => p.n - q.n || (q.x1 - q.x0) - (p.x1 - p.x0));
  R[sous] = { images: imgs.length, groupes: grp.length, fugaces: grp.filter(g => g.part < .5) };
  const vd = path.join(dd, 'traits'); fs.mkdirSync(vd, { recursive: true });
  grp.filter(g => g.part < .5).slice(0, N).forEach((g, k) => {
    const img = lit(path.join(dd, g.prem)), cx = Math.max(0, Math.min(img.w - 160, ((g.x0 + g.x1) >> 1) - 80)), cy = Math.max(0, Math.min(img.h - 60, g.y - 30));
    ecrit(path.join(vd, `${String(k).padStart(2, '0')}-y${g.y}-x${g.x0}-${g.prem}`), coupe(img, cx, cy, 160, 60, 4));
  });
  console.log(sous, 'images', imgs.length, 'groupes', grp.length, 'fugaces', R[sous].fugaces.length);
}
fs.writeFileSync(path.join(DOS, 'traits.json'), JSON.stringify(R, null, 1));
