// Une partie sur le vrai iPhone : chargement, menu, course pilotée (nitro), relevé de chaque image.
// node wd.mjs course.mjs <base url sans /> [params] [tag] [secondes de course]
import fs from 'node:fs';
const dort = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function (w, [base = 'https://car-cash-git.vercel.app/jouer', params = '', tag = 'base', duree = '40']) {
  const T = [];
  const log = (...a) => { const l = new Date().toISOString().slice(11, 19) + ' ' + a.join(' '); console.log(l); T.push(l); };
  const sortie = `res-${tag}`; fs.mkdirSync(sortie, { recursive: true });
  // 1 · la sauvegarde d'un joueur qui a fini l'auto-école (même origine)
  await w.va(base + '/manifest.webmanifest');
  await w.js(() => { localStorage.setItem('cashcarSave', JSON.stringify({ tuto: 1, permis: 1, facile: 0, sfx: true, mus: true, vox: false, plq: { m: 'fr', x: 'CC-161-OP', ok: 1 } })); localStorage.removeItem('cashcarPalier'); return 1; });
  // 2 · le jeu
  const t0 = Date.now();
  await w.va(base + '/?garde=1' + (params ? '&' + params : ''));
  log('page chargée (load) en', Date.now() - t0, 'ms');
  // l'enregistreur d'images (rAF) : intervalles bruts, phase notée
  await w.js(() => {
    const R = (window.__fr = { t: [], ph: [], phase: 'menu', t0: performance.now() });
    let d = performance.now();
    (function f(n) { R.t.push(n - d); R.ph.push(R.phase); d = n; requestAnimationFrame(f); })(performance.now());
    const nav = performance.getEntriesByType('navigation')[0];
    return 1;
  });
  const nav = await w.js(() => { const n = performance.getEntriesByType('navigation')[0]; return n ? { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), taille: n.transferSize, dec: n.decodedBodySize } : null; });
  log('navigation', JSON.stringify(nav));
  // 3 · prêt + splash
  for (let i = 0; i < 120; i++) { if (await w.js(() => !!window.__gameReady)) break; await dort(500); }
  log('__gameReady à', Date.now() - t0, 'ms', JSON.stringify(await w.js(() => (window.dbgPalier ? (({ n, nom, src, banc }) => ({ n, nom, src, banc }))(dbgPalier()) : null))));
  const vp = await w.js(() => [innerWidth, innerHeight, devicePixelRatio]);
  log('viewport', vp.join(' x '));
  for (let i = 0; i < 20; i++) {
    const sp = await w.js(() => { const s = document.getElementById('splash'); return s ? getComputedStyle(s).display !== 'none' && getComputedStyle(s).visibility !== 'hidden' && +getComputedStyle(s).opacity > 0.05 : false; });
    if (!sp) break;
    await w.touche(vp[0] / 2, vp[1] / 2); await dort(1200);
  }
  log('splash parti à', Date.now() - t0, 'ms');
  await w.photo(`${sortie}/1-menu.png`);
  // 4 · le menu, 15 s
  await dort(15000);
  const pb = await w.js(() => (window.dbgPrebati ? dbgPrebati() : null)).catch(() => null);
  log('prébâti', JSON.stringify(pb).slice(0, 300));
  // 5 · JOUER
  const r = await w.js(() => { const b = [...document.querySelectorAll('[data-m="play"]')].find((e) => e.offsetParent || e.getClientRects().length); if (!b) return null; const q = b.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  log('JOUER en', JSON.stringify(r));
  await w.js(() => { window.__fr.phase = 'depart'; window.__fr.tJ = performance.now(); return 1; });
  if (r) await w.touche(r[0], r[1]);
  await w.js(() => { if (window.dbgAuto) dbgAuto(1, 0, { nit: 1 }); return 1; });
  for (let i = 0; i < 40; i++) { if (await w.js(() => document.body.classList.contains('play'))) break; await dort(250); }
  await w.js(() => { window.__fr.phase = 'course'; if (window.dbgAuto) dbgAuto(1, 0, { nit: 1 }); return 1; });
  log('course partie', JSON.stringify(await w.js(() => window.dbgState && (({ started, mode, gameOver }) => ({ started, mode, gameOver }))(dbgState()))));
  const perfs = [];
  const fin = Date.now() + (+duree) * 1000;
  let k = 0;
  while (Date.now() < fin) {
    await dort(2000);
    const p = await w.js(() => ({ p: window.dbgPerf ? dbgPerf() : null, s: window.dbgState ? (({ started, gameOver, mode }) => ({ started, gameOver, mode }))(dbgState()) : null, carte: window.LVL_CARTE || (document.documentElement.dataset.carte) || null }));
    perfs.push(p); log('perf', JSON.stringify(p));
    if (++k === 5) await w.photo(`${sortie}/2-course.png`);
    if (p.s && p.s.gameOver) { log('mort, on relance'); await w.js(() => { window.__fr.phase = 'mort'; return 1; }); break; }
  }
  // 6 · le relevé
  const fr = await w.js(() => ({ t: window.__fr.t, ph: window.__fr.ph }));
  fs.writeFileSync(`${sortie}/images.json`, JSON.stringify(fr));
  const par = {};
  fr.t.forEach((v, i) => { (par[fr.ph[i]] = par[fr.ph[i]] || []).push(v); });
  for (const [ph, a] of Object.entries(par)) {
    const s = [...a].sort((x, y) => x - y), q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(1);
    const tot = a.reduce((x, y) => x + y, 0);
    log(`[${ph}] ${a.length} images en ${(tot / 1000).toFixed(1)} s = ${(a.length / tot * 1000).toFixed(1)} i/s · méd ${q(.5)} · p90 ${q(.9)} · p99 ${q(.99)} · max ${s[s.length - 1].toFixed(0)} · >25ms ${a.filter((x) => x > 25).length} · >50 ${a.filter((x) => x > 50).length} · >100 ${a.filter((x) => x > 100).length}`);
  }
  fs.writeFileSync(`${sortie}/journal.txt`, T.join('\n') + '\n');
}
