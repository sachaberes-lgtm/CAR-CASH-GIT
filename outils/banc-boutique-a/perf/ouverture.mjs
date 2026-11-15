/* ===== L'OUVERTURE DE LA BOUTIQUE AU MICROSCOPE (2026-11-14, session boutique iOS) =====
   Sur le 13 Pro (boîte noire du banc automatique, 09/11) : « boutique ouverte 2,5 s · pire 303 ms » — une image gelée ~1,6 s après le toucher.
   node ouverture.mjs <port contrôle du banc.cjs> [puce=4] [portrait|couche] [ms=5000]
   Puce ralentie (CDP setCPUThrottlingRate, ×4 ≈ le fil principal d'un iPhone), garage ouvert, puis BOUTIQUE touchée ; pendant ms :
   · chaque image (rAF) : écart, et les longues tâches (PerformanceObserver longtask) avec leur instant ;
   · le profileur (échantillons 250 µs) : les fonctions qui coûtent, en propre et en cumulé, DANS les images de plus de 50 ms seulement ;
   · les photos prises (dbgPhoto) et la file (dbgPhotoFile).
   Rien n'est écrit dans le dépôt : tout sort sur la console. */
const [port, puceS = '4', fmt = 'portrait', msS = '5000'] = process.argv.slice(2);
const B = 'http://127.0.0.1:' + port;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const ev = async (js) => { const r = await fetch(B + '/ev', { method: 'POST', body: js }); const t = await r.text(); try { return JSON.parse(t); } catch (e) { return t; } };
const get = async (p) => (await fetch(B + p)).text();
const tap = (sel, fx, fy) => get('/tap?sel=' + encodeURIComponent(sel) + (fx != null ? '&fx=' + fx + '&fy=' + fy : ''));
let cdp = null, cid = 0; const att = {};
const cdpOuvre = async () => { const L = await (await fetch('http://127.0.0.1:' + (+port - 1) + '/json')).json(); const pg = L.find(x => x.type === 'page'); cdp = new WebSocket(pg.webSocketDebuggerUrl); await new Promise(r => cdp.onopen = r); cdp.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att[m.id]) { att[m.id](m.result || m.error); delete att[m.id]; } }; };
const cs = (method, params) => Promise.race([new Promise(r => { const id = ++cid; att[id] = r; cdp.send(JSON.stringify({ id, method, params: params || {} })); }), dormir(30000).then(() => ({}))]);
const SONDE = `(function(){const O=window.__ouv={t0:0,img:[],lt:[]};let der=0;(function f(t){if(O.t0){if(der)O.img.push([+(der-O.t0).toFixed(0),+(t-der).toFixed(1)]);der=t;}requestAnimationFrame(f);})(0);
 try{new PerformanceObserver(function(l){for(const e of l.getEntries())if(O.t0)O.lt.push([Math.round(e.startTime-O.t0),Math.round(e.duration)]);}).observe({entryTypes:['longtask']});}catch(e){}
 return 1;})()`;
(async () => {
  const F = fmt === 'portrait' ? [390, 844] : [844, 390];
  await get('/size?w=' + F[0] + '&h=' + F[1] + '&mob=1'); await get('/load'); await dormir(3000); await cdpOuvre();
  await ev("__mGo('home')"); await dormir(1500);
  await tap('#mHome [data-m="garage"]'); await dormir(9000);
  await ev(SONDE);
  await get('/cpu?x=' + puceS); await dormir(1500);
  await cs('Profiler.enable'); await cs('Profiler.setSamplingInterval', { interval: 250 }); await cs('Profiler.start');
  const tPerf = await ev("(function(){window.__ouv.t0=performance.now();return window.__ouv.t0})()");
  await get('/tap?sel=%23gShopBas&fx=.82&fy=.84');
  await dormir(+msS);
  const { profile } = await cs('Profiler.stop');
  await get('/cpu?x=1');
  const O = await ev("JSON.stringify(window.__ouv)"); const o = JSON.parse(O);
  const lentes = o.img.filter(x => x[1] > 50);
  console.log('images : ' + o.img.length + ' · > 50 ms : ' + lentes.length + ' · pire ' + Math.max(0, ...o.img.map(x => x[1])) + ' ms');
  console.log('images lentes [début ms après le toucher, durée ms] : ' + JSON.stringify(lentes));
  console.log('longues tâches [début, durée] : ' + JSON.stringify(o.lt));
  /* profil : échantillons rangés par instant (profile.startTime en µs, temps du moniteur ; on recale sur la 1re image lente via les longues tâches si besoin) */
  const nodes = new Map(); for (const n of profile.nodes) nodes.set(n.id, n);
  const parent = new Map(); for (const n of profile.nodes) for (const c of (n.children || [])) parent.set(c, n.id);
  let t = profile.startTime; const ech = []; profile.samples.forEach((s, i) => { t += profile.timeDeltas[i] || 0; ech.push([t, s, profile.timeDeltas[i] || 0]); });
  /* les échantillons sont en µs du moniteur : on prend t=0 au 1er échantillon ≈ le toucher (le profileur démarre juste avant) */
  const t0p = profile.startTime;
  const dansLente = (tus) => { const ms = (tus - t0p) / 1000; return lentes.some(x => ms >= x[0] - 20 && ms <= x[0] + x[1] + 20); };
  const self = new Map(), tot = new Map();
  for (const [tu, s, d] of ech) { if (!dansLente(tu)) continue; const n = nodes.get(s); const k = (n.callFrame.functionName || '(anon)') + ' :' + n.callFrame.lineNumber;
    self.set(k, (self.get(k) || 0) + d); const vus = new Set(); let c = s; while (c != null) { const nn = nodes.get(c); const kk = (nn.callFrame.functionName || '(anon)') + ' :' + nn.callFrame.lineNumber; if (!vus.has(kk)) { vus.add(kk); tot.set(kk, (tot.get(kk) || 0) + d); } c = parent.get(c); } }
  const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => '  ' + Math.round(v / 1000) + ' ms ' + k).join('\n');
  console.log('--- dans les images lentes (recalage approché, ± 20 ms), en propre\n' + top(self, 22)); console.log('--- dans les images lentes, en cumulé\n' + top(tot, 45));
  /* toute la fenêtre, en cumulé (sans recalage) */
  const tot2 = new Map(); for (const [, s, d] of ech) { const vus = new Set(); let c = s; while (c != null) { const nn = nodes.get(c); const kk = (nn.callFrame.functionName || '(anon)') + ' :' + nn.callFrame.lineNumber; if (!vus.has(kk)) { vus.add(kk); tot2.set(kk, (tot2.get(kk) || 0) + d); } c = parent.get(c); } }
  console.log('--- toute la fenêtre, en cumulé\n' + top(tot2, 40));
  console.log('photo : ' + JSON.stringify(await ev('dbgPhoto()')) + ' · file : ' + JSON.stringify(await ev('dbgPhotoFile()')));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
