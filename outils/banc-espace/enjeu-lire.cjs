/* LECTURE DU BANC « ENJEU » (2026-11-18) : node outils/banc-espace/enjeu-lire.cjs <dossier>/resultat.json
   Par visite de l'espace : le plan, les modules, puis par module : relevés, caisse (hauteur min, écart), caméra (dans/sous la dalle, rotation max et p95, horizon),
   caisse hors champ, dalle absente sous/devant, morts ; les anomalies groupées. Colonnes des relevés : voir CROCHET.pas dans enjeu-course.cjs. */
const R = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));
const C = { t: 0, s: 1, mode: 2, lat: 3, h: 4, b: 5, carUp: 6, camUp: 7, camN: 8, camB: 9, wq: 10, wu: 11, dCam: 12, champ: 13, vo: 14, vu: 15, tb: 16, kmh: 17, go: 18, mod: 19, ray: 20, ny: 21, eng: 22, cause: 23 };
const p = (a, q) => { if (!a.length) return null; const v = a.slice().sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.floor(v.length * q))]; };
console.log('url', R.url); console.log('exc', R.exc.length, R.exc.slice(0, 5)); console.log('con', R.con.length, R.con.slice(0, 8)); console.log('cadence', R.cadence, 'coupe', R.coupe || '', 'délai', R.delai || '');
for (const V of R.visites) {
  if (V.rows === undefined) { console.log('— portail', V.cible, 'pret', V.pret, 'lieu', V.etat && V.etat.lieu); continue; }
  const rows = V.rows; const u = V.route && V.route.u || {};
  console.log(`\n=== ESPACE #${V.n} entrée pret=${V.entree && V.entree.pret} L=${V.route && V.route.L} plan=${JSON.stringify({ ouv: u.ouv, sil: u.sil, rel: u.rel, fin: u.fin, cx: u.cx })} durée ${V.duree}s sorti=${V.sortiParPortail} relevés ${rows.length}`);
  console.log('  modules', (V.route && V.route.mods || []).map(m => m.fig + '@' + m.s0 + '-' + m.s1).join(' '));
  console.log('  pièces', JSON.stringify(V.pieces)); console.log('  voyage err', JSON.stringify(V.voyage && V.voyage.decor && V.voyage.decor.err), 'verif', V.verif && JSON.stringify({ n: V.verif.n, ko: V.verif.ko, err: V.verif.err }));
  if (rows.length) { const k0 = rows[0], k1 = rows[rows.length - 1]; const dt = (k1[0] - k0[0]) / 1000; console.log(`  s ${k0[1]}→${k1[1]} en ${dt.toFixed(0)} s, kmh ${p(rows.map(r => r[C.kmh]), .5)}, eng ${k0[C.eng]}→${k1[C.eng]}, vol ${rows.filter(r => r[C.mode] === 'fall').length} relevés`); }
  const G = {}; for (const r of rows) { const k = r[C.mod] || '(liaison)'; (G[k] = G[k] || []).push(r); }
  for (const k in G) { const g = G[k], dr = g.filter(r => r[C.mode] === 'drive');
    console.log(`  · ${k.padEnd(18)} n=${String(g.length).padStart(4)} s ${g[0][1]}-${g[g.length - 1][1]} | hMin ${Math.min(...dr.map(r => r[C.h]), 99).toFixed(2)} |b|max ${Math.max(...dr.map(r => Math.abs(r[C.b])), 0).toFixed(1)} carUpMin ${Math.min(...dr.map(r => r[C.carUp]), 9)} | camUpN min ${Math.min(...g.map(r => r[C.camUp]))} p05 ${p(g.map(r => r[C.camUp]), .05)} | rot p95 ${p(g.map(r => r[C.wq]), .95)} max ${Math.max(...g.map(r => r[C.wq]))} | haut p95 ${p(g.map(r => r[C.wu]), .95)} | horsChamp ${g.filter(r => !r[C.champ]).length} | camDalle ${g.filter(r => Math.abs(r[C.camB]) < 8 && r[C.camN] < .15 && r[C.camN] > -2).length} camSous ${g.filter(r => Math.abs(r[C.camB]) < 8 && r[C.camN] < -2 && r[C.h] > 0).length} | dCam max ${Math.max(...g.map(r => r[C.dCam]))} | rayons ${[...new Set(g.map(r => r[C.ray]))].join(',')} | ny min ${Math.min(...g.map(r => r[C.ny]))} | vol ${g.filter(r => r[C.mode] === 'fall').length} gravContre ${g.filter(r => r[C.vo] && r[C.vu] < -.2).length}`); }
  const A = {}; for (const a of V.anom) (A[a.k] = A[a.k] || []).push(a.s + (a.mod ? ':' + a.mod : '') + '=' + JSON.stringify(a.v));
  for (const k in A) console.log(`  ANOM ${k} ×${A[k].length} : ${A[k].slice(0, 8).join(' ; ')}`);
  for (const m of V.morts) console.log('  MORT', JSON.stringify(m).slice(0, 400));
  console.log('  photos', V.photos.map(x => x.d).join(' '));
}
