/* LE TABLEAU DU COÛT (2026-11-14) : lit les sorties de cout-page.js rangées par lot (<dossier>/<qui>-<météo>-tel<0|1>/gen-espace-<météo>.json) et écrit
   une ligne par passage : scène bâtie (objets, triangles, sommets), géométries/textures/programmes, course (appels et triangles par image : moyenne / p95,
   ms par image moyenne / p95, images > 50 et > 100 ms), et la map d'après (géométries, textures) — node cout-tableau.cjs <dossier> [groupes=1] */
const fs = require('fs'), path = require('path');
const D = process.argv[2], GR = process.argv.includes('groupes=1');
const L = fs.readdirSync(D).filter(n => fs.statSync(path.join(D, n)).isDirectory()).sort((a, b) => { const A = a.split('-'), B = b.split('-'); return (A[2] + A[1] + A[0]).localeCompare(B[2] + B[1] + B[0]); });
const f = x => x == null ? '—' : typeof x === 'number' ? (Math.abs(x) >= 1e4 ? Math.round(x / 1000) + 'k' : String(x)) : String(x);
console.log('passage | scène obj · tri · sommets | géo · tex · prog · tas | course appels moy/p95 · tri moy/p95 · ms moy/p95 · >50 · >100 · fin | après : carte géo · tex');
for (const n of L) {
  const dir = path.join(D, n), js = fs.readdirSync(dir).find(x => /^gen-.*\.json$/.test(x)); if (!js) { console.log(n, '(pas de sortie)'); continue; }
  let j = JSON.parse(fs.readFileSync(path.join(dir, js), 'utf8')); const r = Array.isArray(j) ? j[0] : (j.res ? j.res[0] : j);
  let p = r && r.perso; if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { console.log(n, p.slice(0, 200)); continue; } }
  if (!p || !p.scene) { console.log(n, 'sans mesure', JSON.stringify(r).slice(0, 200)); continue; }
  const s = p.scene, i = p.info, c = p.course, a = p.apres || {};
  console.log([n, [s.obj, f(s.tri), f(s.som)].join(' · '), [i.geo, i.tex, i.prog, i.tasMo].join(' · '),
    [c.appels.moy + '/' + c.appels.p95, f(c.tri.moy) + '/' + f(c.tri.p95), c.ms.moy + '/' + c.ms.p95, c.plus50, c.plus100, c.fin + ' ' + c.sMax + '/' + c.L].join(' · '),
    [a.carte, a.geo, a.tex].join(' · '), (p.erreurs || []).filter(e => !/^fluide/.test(e.g || e.k || '')).length + ' err'].join(' | '));
  if (GR) for (const g of s.groupes.slice(0, 14)) console.log('      ', g[0].padEnd(28), g[1], f(g[2]), f(g[3]));
}
