// LA PLANCHE AVANT | APRÈS (2026-10-17, session ELDORADO) — chaque vue recadrée sur la caisse, l'avant à gauche, l'après à droite.
//   node outils/banc-caisses/planche.mjs <dossier avant> <dossier après> <sortie.png> [titre]
//   env VUES : JSON [[fichier, libellé, x, y, w, h], …] (le rectangle à garder, en pixels de l'image source) — défaut : les prises de
//   jeu.mjs (1688 × 780) et les zooms ×2 du studio (zoom.sh).
import fs from 'node:fs';
import path from 'node:path';
import { lance, sleep } from './cdp.mjs';
const [, , av, ap, sortie, titre = 'AVANT | APRÈS'] = process.argv;
const VUES = JSON.parse(process.env.VUES || JSON.stringify([
  ['accueil.png', "L'accueil (vue de dessus)", 0, 20, 860, 700],
  ['garage-avant.png', 'Garage, de face', 250, 380, 700, 330],
  ['garage-arriere.png', 'Garage, de dos', 240, 400, 700, 300],
  ['garage-profil.png', 'Garage, de profil', 200, 380, 640, 300],
  ['course-poursuite.png', 'En course (la caméra de poursuite)', 470, 300, 760, 480],
  ['boutique.png', 'Boutique', 300, 280, 480, 360],
  ['z0.png', 'Studio, de face (zoom ×2)', 0, 0, 760, 500],
  ['z1.png', 'Studio, de dos (zoom ×2)', 0, 0, 760, 500],
  ['z4.png', 'Studio, trois-quarts (zoom ×2)', 0, 0, 760, 500]]));
const LARG = 640, A = path.resolve(av), B = path.resolve(ap);
const cel = (dos, v) => {
  const [f, , x, y, w, h] = v, k = LARG / w, p = path.join(dos, f);
  if (!fs.existsSync(p)) return `<div class="c" style="width:${LARG}px;height:${Math.round(h * k)}px"><i>absente</i></div>`;
  return `<div class="c" style="width:${LARG}px;height:${Math.round(h * k)}px"><img src="file://${encodeURI(p)}?${fs.statSync(p).mtimeMs}" style="transform:translate(${-x * k}px,${-y * k}px) scale(${k});"></div>`;
};
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#16131f;color:#f3eefc;font:15px/1.3 -apple-system,Helvetica,sans-serif;padding:18px;width:${LARG * 2 + 60}px}
h1{font-size:22px;margin:0 0 10px;letter-spacing:.06em} .r{display:flex;gap:14px;margin:4px 0 16px} .c{position:relative;overflow:hidden;border-radius:6px;background:#000}
.c img{position:absolute;left:0;top:0;transform-origin:0 0} h2{font-size:14px;margin:8px 0 2px;color:#c9b8ff;font-weight:600}
.e{display:flex;gap:14px} .e b{width:${LARG}px;font-size:13px;color:#ff8fc8;letter-spacing:.2em}
</style><h1>${titre}</h1><div class="e"><b>AVANT</b><b>APRÈS</b></div>
${VUES.map(v => `<h2>${v[1]}</h2><div class="r">${cel(A, v)}${cel(B, v)}</div>`).join('')}`;
const fh = path.resolve(sortie.replace(/\.png$/, '') + '.html');
fs.writeFileSync(fh, html);
const c = await lance({ port: 9480, w: LARG * 2 + 60, h: 900, dpr: 1 });
try {
  await c.send('Page.navigate', { url: 'file://' + encodeURI(fh) });
  await sleep(2500);
  const H = await c.ev('document.documentElement.scrollHeight');
  await c.send('Emulation.setDeviceMetricsOverride', { width: LARG * 2 + 60, height: H, deviceScaleFactor: 1, mobile: false });
  await sleep(800);
  await c.photo(sortie);
  console.log('planche', sortie, 'hauteur', H);
} finally { await c.fin(); }
