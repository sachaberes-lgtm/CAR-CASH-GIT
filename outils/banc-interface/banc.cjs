// LE BANC DU COÛT DE L'INTERFACE (2026-11-12, interface-opti) — d'après outils/banc-hud/pilote.cjs.
// Lance le vrai jeu dans un Chrome sans fenêtre et MUET (390×844, iPhone), pose la sonde (sonde.js) avant le jeu, et répond :
//   node outils/banc-interface/banc.cjs [--q "sans=x"] [--http 9881 --cdp 9882 --cmd 9883]
//   curl -s --data-binary 'expr' localhost:9883/ev     → évalue du JS
//   curl -s 'localhost:9883/cout?s=4'                   → sonde + travail du fil principal (trace : style, mise en page, peinture, composition) sur s secondes
//   curl -s 'localhost:9883/accueil?q=sans=x'           → recharge jusqu'à l'accueil ;  /course?q=…  → recharge et met en course
//   curl -s 'localhost:9883/shot?nom=/chemin.png'       → photo ;  /fin → ferme tout
const fs = require('fs'), path = require('path'), http = require('http');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const PROF = path.resolve(A.prof || path.join(require('os').tmpdir(), 'banc-interface-profil'));
const P_HTTP = +(A.http || 9881), P_CDP = +(A.cdp || 9882), P_CMD = +(A.cmd || 9883);
const W = 390, H = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const SONDE = fs.readFileSync(path.join(__dirname, 'sonde.js'), 'utf8');

(async () => {
  for (const p of [P_HTTP, P_CDP, P_CMD]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = []; let trace = null;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Tracing.dataCollected' && trace) trace.ev.push(...m.params.value);
    if (m.method === 'Tracing.tracingComplete' && trace) trace.fin(); } catch (x) {} });
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Performance.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}\n' + SONDE });

  async function accueil(q) {
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0` + (q ? '&' + q : '') });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2500);
    for (let i = 0; i < 6; i++) { /* le titre ne prend le toucher qu'une fois l'intro posée : on retouche tant qu'il est là */
      const la = await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      if (!la) break; await dormir(3000); }
    await dormir(2000); return 'accueil';
  }
  async function course(q) {
    await accueil(q);
    for (let i = 0; i < 240; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) return 'en course'; } catch (e) {} }
    return 'ÉCHEC';
  }
  async function cout(s) {
    const m0 = await c.send('Performance.getMetrics');
    trace = { ev: [] }; const fini = new Promise(r => trace.fin = r);
    await c.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
    await c.ev('__S.reset()');
    await dormir(s * 1000);
    const etat = await c.ev('__S.etat()');
    await c.send('Tracing.end'); await fini;
    const m1 = await c.send('Performance.getMetrics');
    const M = (m, k) => (m.metrics.find(x => x.name === k) || {}).value || 0;
    const met = {}; for (const k of ['RecalcStyleCount', 'LayoutCount', 'RecalcStyleDuration', 'LayoutDuration', 'ScriptDuration', 'TaskDuration']) { const d = M(m1, k) - M(m0, k); met[k] = /Duration/.test(k) ? +(d * 1000 / s).toFixed(1) + ' ms/s' : +(d / s).toFixed(1) + ' /s'; }
    /* le fil principal du moteur de rendu : celui qui porte les événements « Paint » */
    const ev = trace.ev; trace = null;
    const fil = {}; for (const e of ev) if (e.name === 'Paint' || e.name === 'UpdateLayoutTree') fil[e.pid + ':' + e.tid] = (fil[e.pid + ':' + e.tid] || 0) + 1;
    const principal = Object.entries(fil).sort((a, b) => b[1] - a[1])[0]; const [pid, tid] = principal ? principal[0].split(':').map(Number) : [0, 0];
    const noms = ['UpdateLayoutTree', 'Layout', 'Paint', 'PrePaint', 'Layerize', 'UpdateLayer', 'CompositeLayers', 'Commit', 'RasterTask', 'ParseHTML', 'FunctionCall', 'FireAnimationFrame', 'TimerFire', 'HitTest'];
    const t = {}; for (const e of ev) { if (!noms.includes(e.name)) continue; if (e.name !== 'RasterTask' && (e.pid !== pid || e.tid !== tid)) continue; const k = e.name; t[k] = t[k] || { n: 0, ms: 0 }; t[k].n++; if (e.dur) t[k].ms += e.dur / 1000; }
    const trace2 = {}; for (const k in t) trace2[k] = (t[k].n / s).toFixed(1) + '/s ' + (t[k].ms / s).toFixed(1) + 'ms/s';
    return { metriques: met, trace: trace2, sonde: etat };
  }
  /* LES SÉLECTEURS (statistiques de Chrome, catégorie blink.debug) : le temps passé par sélecteur pendant les recalculs de style, sur s secondes */
  async function selecteurs(s) {
    trace = { ev: [] }; const fini = new Promise(r => trace.fin = r);
    await c.send('Tracing.start', { categories: 'disabled-by-default-blink.debug,devtools.timeline', transferMode: 'ReportEvents' });
    await dormir(s * 1000); await c.send('Tracing.end'); await fini;
    const ev = trace.ev; trace = null; const T = {}; let tot = 0, nUpd = 0;
    for (const e of ev) { const st = e.args && (e.args.selector_stats || (e.args.data && e.args.data.selector_stats)); if (e.name === 'UpdateLayoutTree') nUpd++;
      if (!st || !st.selector_timings) continue;
      for (const x of st.selector_timings) { const k = x.selector; T[k] = T[k] || { us: 0, essais: 0, ok: 0 }; T[k].us += x['elapsed (us)'] || x.elapsed || 0; T[k].essais += x.match_attempts || 0; T[k].ok += x.match_count || 0; tot += x['elapsed (us)'] || x.elapsed || 0; } }
    const top = Object.entries(T).sort((a, b) => b[1].us - a[1].us).slice(0, 40).map(([k, v]) => (v.us / 1000 / s).toFixed(2) + ' ms/s  essais ' + Math.round(v.essais / s) + '/s  ok ' + Math.round(v.ok / s) + '/s  ' + k.slice(0, 220));
    return { total_ms_s: +(tot / 1000 / s).toFixed(1), recalculs: nUpd, n: Object.keys(T).length, top };
  }
  const lu = rq => new Promise(r => { let b = ''; rq.on('data', d => b += d); rq.on('end', () => r(b)); });
  const cmd = http.createServer(async (rq, rs) => {
    const u = new URL(rq.url, 'http://x'); let out = '';
    try {
      if (u.pathname === '/ev') out = JSON.stringify(await c.ev(await lu(rq), 60000));
      else if (u.pathname === '/cout') out = JSON.stringify(await cout(+(u.searchParams.get('s') || 4)), null, 1);
      else if (u.pathname === '/selecteurs') out = JSON.stringify(await selecteurs(+(u.searchParams.get('s') || 3)), null, 1);
      else if (u.pathname === '/accueil') out = await accueil(u.searchParams.get('q') || '');
      else if (u.pathname === '/course') out = await course(u.searchParams.get('q') || '');
      else if (u.pathname === '/shot') { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(u.searchParams.get('nom'), Buffer.from(sh.data, 'base64')); out = 'ok'; }
      else if (u.pathname === '/touch') { const ty = u.searchParams.get('type'), x = +u.searchParams.get('x'), y = +u.searchParams.get('y'), id = +(u.searchParams.get('id') || 1);
        await c.send('Input.dispatchTouchEvent', { type: { start: 'touchStart', move: 'touchMove', end: 'touchEnd' }[ty], touchPoints: ty === 'end' ? [] : [{ x, y, id }] }); out = 'ok'; }
      else if (u.pathname === '/erreurs') out = JSON.stringify(erreurs);
      else if (u.pathname === '/fin') { out = 'fin'; rs.end(out); c.close(); tueChrome(ch); srv.close(); cmd.close(); process.exit(0); }
    } catch (e) { out = 'ERREUR ' + e.message; }
    rs.end(out);
  });
  cmd.listen(P_CMD, '127.0.0.1');
  console.log('banc prêt sur', P_CMD);
})().catch(e => { console.error(e); process.exit(1); });
