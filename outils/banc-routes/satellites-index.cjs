/* Banc Node : les satellites et débris de l'orbite, indexés ou non (2026-11-14, la passe d'optimisation).
   Usage : node outils/banc-routes/satellites-index.cjs [racine]
   Rejoue les VRAIES fonctions de code/maps/orbite-1.js (geoStarlink, geoDebris, geoEclat, satIndexe) avec le three du vendor, compte les sommets que le vertex
   shader calcule par objet et par image (× SAT_MAX ordi / téléphone), et vérifie que chaque coin de triangle garde TOUS ses attributs au bit près. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(process.argv[2] || '.');
const ctx = { window: {}, self: {}, console }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R, 'VERSION PRINCIPALE/vendor/three.min.js'), 'utf8'), ctx);
if (!ctx.THREE) ctx.THREE = ctx.window.THREE;
const src = fs.readFileSync(path.join(R, 'code/maps/orbite-1.js'), 'utf8');
const a = src.indexOf('const SAT_P='), b = src.indexOf('const DEB_P='); if (a < 0 || b < 0) throw new Error('builders introuvables');
const m = src.match(/function satIndexe\(g\)\{[\s\S]*?setIndex\(new THREE\.BufferAttribute\(I,1\)\);return gi;\}/); if (!m) throw new Error('satIndexe introuvable');
vm.runInContext(src.slice(a, b) + '\n' + m[0] + '\nthis.__G=[geoStarlink(),geoDebris(),geoEclat()];this.__I=satIndexe;', ctx);
const MAX = { ordi: [340, 56, 340], tel: [230, 36, 220] }, noms = ['starlink', 'debris', 'eclats'];
let tot0 = { ordi: 0, tel: 0 }, tot1 = { ordi: 0, tel: 0 };
ctx.__G.forEach(function (g, k) { const gi = ctx.__I(g), I = gi.index ? gi.index.array : null, n0 = g.attributes.position.count, n1 = gi.attributes.position.count; let diff = 0;
  if (I) for (const nm of Object.keys(g.attributes)) { const A = g.attributes[nm], B = gi.attributes[nm], s = A.itemSize; for (let c = 0; c < n0; c++) for (let q = 0; q < s; q++) if (!Object.is(A.array[c * s + q], B.array[I[c] * s + q])) diff++; }
  for (const t of ['ordi', 'tel']) { tot0[t] += n0 * MAX[t][k]; tot1[t] += n1 * MAX[t][k]; }
  console.log(JSON.stringify({ objet: noms[k], triangles: n0 / 3, sommetsAvant: n0, sommetsApres: n1, indices: I ? I.length : 0, attributs: Object.keys(g.attributes), coinsDifferents: diff })); });
console.log(JSON.stringify({ sommetsParImageToutesInstances: { ordi: [tot0.ordi, tot1.ordi], tel: [tot0.tel, tot1.tel] } }));
