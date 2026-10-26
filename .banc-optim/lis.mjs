// node lis.mjs res-app/<id>.json [...] : bilan par phase (intervalle d'image, temps JS par image), perfs, événements
import fs from 'node:fs';
for (const f of process.argv.slice(2)) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log('=====', j.id, j.params || '', '· palier', JSON.stringify(j.pal), '· jit', JSON.stringify(j.jit), '· gpu', j.gpu, '· vp', JSON.stringify(j.vp));
  if (j.erreur) console.log('ERREUR', j.erreur);
  (j.ev || []).forEach((e) => console.log('   ', e));
  const par = {};
  (j.t || []).forEach((v, i) => { const p = j.ph[i]; (par[p] = par[p] || { t: [], js: [] }); par[p].t.push(v); par[p].js.push(j.js[i]); });
  const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1) : null; };
  for (const [ph, o] of Object.entries(par)) {
    const tot = o.t.reduce((a, b) => a + b, 0), js = o.js.reduce((a, b) => a + b, 0);
    const nR = o.js.filter((x) => x > 0.8).length; /* images où la boucle du jeu a vraiment tourné (la cadence 30 saute des rAF) */
    const RI = []; let acc = 0; o.t.forEach((v, i) => { acc += v; if (o.js[i] > 0.8) { RI.push(acc); acc = 0; } }); RI.shift();
    const rq = (p) => q(RI, p), reg = RI.length ? Math.round(RI.filter((x) => x > 28 && x < 39).length / RI.length * 100) : 0, lisse = RI.length ? Math.round(RI.filter((x) => x < 20).length / RI.length * 100) : 0;
    console.log(`  [${ph}] rendues ${nR} = ${(nR / tot * 1000).toFixed(1)} i/s · entre deux images calculées : méd ${rq(.5)} p90 ${rq(.9)} p99 ${rq(.99)} · ${lisse} % < 20 ms · ${reg} % entre 28 et 39 ms`);
    console.log(`  [${ph}] ${o.t.length} im / ${(tot / 1000).toFixed(1)} s = ${(o.t.length / tot * 1000).toFixed(1)} i/s · intervalle méd ${q(o.t, .5)} p90 ${q(o.t, .9)} p99 ${q(o.t, .99)} max ${Math.round(Math.max(...o.t))} · >25 ${o.t.filter((x) => x > 25).length} >50 ${o.t.filter((x) => x > 50).length} >100 ${o.t.filter((x) => x > 100).length} · JS/image méd ${q(o.js, .5)} p90 ${q(o.js, .9)} max ${Math.round(Math.max(...o.js))} · JS ${(js / tot * 100).toFixed(0)} % du temps`);
  }
  const pf = (j.perfs || []).filter((p) => p.ph === 'course');
  if (pf.length) console.log('  course : dbgPerf', pf.map((p) => p.p && `${p.p.fps}i/s dpr${p.p.dpr} ${p.p.tier} cad${p.p.cad} q${p.q && p.q.k}`).join(' | '));
  if (j.cout) console.log('  dbgCout', JSON.stringify(j.cout).slice(0, 600));
}
