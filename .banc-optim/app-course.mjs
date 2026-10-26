// Une partie dans l'APP sur le vrai iPhone (pont CDP) : menu, JOUER, course pilotée nitro, chaque image relevée,
// profil JS (ScriptProfiler WebKit → Profiler CDP) sur une fenêtre de la course.
// node cdp.mjs app-course.mjs <tag> [secondes de course] [profil=1]
import fs from 'node:fs';
const dort = (ms) => new Promise((r) => setTimeout(r, ms));

export function bilan(fr, log) {
  const par = {};
  fr.t.forEach((v, i) => { (par[fr.ph[i]] = par[fr.ph[i]] || []).push(v); });
  const out = {};
  for (const [ph, a] of Object.entries(par)) {
    const s = [...a].sort((x, y) => x - y), q = (p) => +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1);
    const tot = a.reduce((x, y) => x + y, 0);
    out[ph] = { n: a.length, s: +(tot / 1000).toFixed(1), ips: +(a.length / tot * 1000).toFixed(1), med: q(.5), p90: q(.9), p99: q(.99), max: Math.round(s[s.length - 1]), g25: a.filter((x) => x > 25).length, g50: a.filter((x) => x > 50).length, g100: a.filter((x) => x > 100).length };
    log(`[${ph}] ${out[ph].n} images en ${out[ph].s} s = ${out[ph].ips} i/s · méd ${out[ph].med} · p90 ${out[ph].p90} · p99 ${out[ph].p99} · max ${out[ph].max} · >25ms ${out[ph].g25} · >50 ${out[ph].g50} · >100 ${out[ph].g100}`);
  }
  return out;
}

export const ENREG = `(function(){if(window.__fr&&window.__fr.vit)return 1;const R=(window.__fr={t:[],ph:[],phase:'menu',vit:1});let d=performance.now();
  (function f(n){R.t.push(n-d);R.ph.push(R.phase);d=n;requestAnimationFrame(f);})(performance.now());return 1;})()`;

export default async function (c, [tag = 'app-base', duree = '45', profil = '1']) {
  const T = [];
  const log = (...a) => { const l = new Date().toISOString().slice(11, 19) + ' ' + a.join(' '); console.log(l); T.push(l); };
  const sortie = `res-${tag}`; fs.mkdirSync(sortie, { recursive: true });
  const etat = () => c.js(`JSON.stringify({s:window.dbgState?(({started,gameOver,mode,paused})=>({started,gameOver,mode,paused}))(dbgState()):null,p:window.dbgPerf?dbgPerf():null,play:document.body.classList.contains('play')})`).then(JSON.parse);
  log('départ', JSON.stringify(await etat()));
  await c.js(`window.__fr=null;` + ENREG);
  await c.js(`window.__fr.phase='menu';1`);
  await dort(10000);
  // JOUER
  await c.js(`window.__fr.phase='depart';(function(){const b=[...document.querySelectorAll('[data-m="play"]')].find(e=>e.getClientRects().length);if(b)b.click();if(window.dbgAuto)dbgAuto(1,0,{nit:1});return !!b;})()`);
  for (let i = 0; i < 60; i++) { if (await c.js(`document.body.classList.contains('play')`)) break; await dort(250); }
  await c.js(`window.__fr.phase='course';if(window.dbgAuto)dbgAuto(1,0,{nit:1});1`);
  log('course', JSON.stringify(await etat()));
  const fin = Date.now() + (+duree) * 1000;
  let prof = null, k = 0;
  while (Date.now() < fin) {
    if (profil === '1' && k === 3 && !prof) { await c.cmd('Profiler.enable').catch((e) => log('Profiler.enable', e.message)); await c.cmd('Profiler.start').then(() => { prof = 'en cours'; log('profil démarré'); }).catch((e) => log('Profiler.start', e.message)); }
    if (prof === 'en cours' && k === 8) { const r = await c.cmd('Profiler.stop', {}, 180000).catch((e) => { log('Profiler.stop', e.message); return null; }); if (r) { fs.writeFileSync(`${sortie}/profil.cpuprofile`, JSON.stringify(r.profile)); prof = 'fini'; log('profil écrit', r.profile.nodes.length, 'nœuds'); } }
    await dort(2000); k++;
    const e = await etat(); log('perf', JSON.stringify(e));
    if (e.s && e.s.gameOver) { log('mort'); await c.js(`window.__fr.phase='mort';1`); await dort(4000); break; }
  }
  if (prof === 'en cours') { const r = await c.cmd('Profiler.stop', {}, 180000).catch(() => null); if (r) fs.writeFileSync(`${sortie}/profil.cpuprofile`, JSON.stringify(r.profile)); }
  await c.js(`if(window.dbgAuto)dbgAuto(0);1`);
  const fr = JSON.parse(await c.js(`JSON.stringify({t:window.__fr.t,ph:window.__fr.ph})`));
  fs.writeFileSync(`${sortie}/images.json`, JSON.stringify(fr));
  const b = bilan(fr, log);
  fs.writeFileSync(`${sortie}/bilan.json`, JSON.stringify(b, null, 1));
  fs.writeFileSync(`${sortie}/journal.txt`, T.join('\n') + '\n');
}
