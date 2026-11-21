// LA TRACE D'UNE OUVERTURE DE LA BOUTIQUE (2026-11-21, lot « boutiquefluide ») : qui recalcule le style et la mise en page, combien d'éléments, depuis quelle fonction.
// Même Chrome que parcours.cjs (iPhone 13 Pro émulé, muet, processeur ×4, index gravé : photos gardées). Un essai de chauffe (remplit la base des photos), puis l'essai tracé.
//   node outils/banc-boutiquefluide/trace.cjs --essai avec|sans --out <dossier> [--http 9993] [--cdp 9994]
// Écrit <out>/trace-<essai>.json : pour chaque geste (ouverture, peinture, voiture, fermeture, réouverture), la pire image et, dedans, les UpdateLayoutTree / Layout /
// Paint / tâches longues avec leur durée, leur nombre d'éléments et le haut de la pile JS qui les a forcés.
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), ESSAI = A.essai || 'avec', P_HTTP = +(A.http || 9993), P_CDP = +(A.cdp || 9994), [W, H] = [844, 390];
const OUT = path.resolve(A.out || '.'); fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
function serveur(dir, port) { const s = http.createServer((rq, rs) => { let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(dir, p); if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } if (/index\.html$/.test(f)) b = Buffer.from(b.toString('utf8').replace("const CC_BUILD='__CC_BUILD__';", "const CC_BUILD='banc-bf';").replace("const CC_PHOTOS='__CC_PHOTOS__';", "const CC_PHOTOS='banc-bf';"), 'utf8');
      rs.writeHead(200, { 'Content-Type': /\.html$/.test(f) ? 'text/html; charset=utf-8' : /\.js$/.test(f) ? 'text/javascript' : /\.css$/.test(f) ? 'text/css' : 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s))); }
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(A.prof || os.tmpdir(), 'banc-bf-prof-'));
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, prof, W, H); const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGTERM', () => { fin(); process.exit(143); });
  const ev = [], R = { essai: ESSAI, gestes: {} }; let flux = null;
  c.ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.method === 'Tracing.dataCollected') ev.push(...m.params.value); if (m.method === 'Tracing.tracingComplete') flux && flux(); });
  const clic = sel => c.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return 0;e.click();return 1})()`);
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: 'fast', qChoisi: 1, shopVu: 1 };
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.removeItem("cashcarSave");localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
  const charge = async () => { await c.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&carte=nuages&pistegraine=7&tel=1&appareil=iPhone14,2` + (ESSAI === 'sans' ? '&sans=boutiquefluide' : '') });
    for (let i = 0; i < 600; i++) { await dormir(200); try { if (await c.ev('!!window.__gameReady', 8000)) break; } catch (e) {} }
    await dormir(1200); await c.ev("(function(){var s=document.getElementById('splash');if(s){s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}return 1})()");
    await dormir(3500); try { await c.ev("window.__mGo&&window.__mGo('home');1"); } catch (e) {} await dormir(2000); await c.ev("(function(){var e=document.querySelector('#mHome [data-m=\"garage\"]');if(e)e.click();return 1})()"); await dormir(8000); };
  await charge(); await clic('#gShopBas'); await dormir(8000); for (const k of ['peinture', 'aile', 'figure', 'voiture']) { await clic('#gBqCats [data-c="' + k + '"]'); await dormir(3000); } await clic('#gShopBas'); await dormir(2000); /* la chauffe : la base des photos remplie */
  await charge(); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await dormir(12000); /* le menu au repos (les motifs se préparent) */
  const geste = async (nom, f, ms) => {
    ev.length = 0; await c.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.stack,blink.user_timing', options: 'sampling-frequency=10000' });
    await dormir(300); await f(); await dormir(ms);
    await new Promise(ok => { flux = ok; c.send('Tracing.end'); });
    const main = ev.filter(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e => e.pid + ':' + e.tid);
    const M = ev.filter(e => main.indexOf(e.pid + ':' + e.tid) >= 0 && e.ph === 'X');
    const taches = M.filter(e => e.name === 'RunTask' && e.dur > 40000).sort((a, b) => b.dur - a.dur).slice(0, 3);
    R.gestes[nom] = taches.map(t => { const d = M.filter(e => e.ts >= t.ts && e.ts + (e.dur || 0) <= t.ts + t.dur && /^(UpdateLayoutTree|Layout|Paint|PrePaint|Layerize|ParseHTML|FunctionCall|FireAnimationFrame|TimerFire|EventDispatch|RecalculateStyles|MajorGC|MinorGC|V8.GC_SCAVENGER|HitTest|Commit|UpdateLayer|ScheduleStyleRecalculation)$/.test(e.name) && e.dur > 1500);
      return { ms: Math.round(t.dur / 1000), dedans: d.map(e => { const a = (e.args && (e.args.beginData || e.args.data)) || {}, st = a.stackTrace || (e.args && e.args.data && e.args.data.stackTrace);
        return [e.name, Math.round(e.dur / 1000), a.elementCount != null ? 'él ' + a.elementCount : a.dirtyObjects != null ? 'obj ' + a.dirtyObjects + '/' + a.totalObjects : '', st ? st.slice(0, 3).map(s => s.functionName + ':' + s.lineNumber).join(' < ') : (a.functionName ? a.functionName : '')]; }) }; });
    const S = {}; for (const e of M) if (/^(UpdateLayoutTree|Layout|Paint|PrePaint|Layerize|FunctionCall|FireAnimationFrame|TimerFire|EventDispatch|ParseHTML)$/.test(e.name)) { const k = e.name; S[k] = S[k] || [0, 0, 0]; S[k][0] += e.dur / 1000; S[k][1]++; const a = (e.args && (e.args.beginData || e.args.data)) || {}; if (a.elementCount) S[k][2] += a.elementCount; }
    R.gestes[nom + ':somme'] = Object.fromEntries(Object.entries(S).map(([k, v]) => [k, Math.round(v[0]) + ' ms · ' + v[1] + ' fois' + (v[2] ? ' · ' + v[2] + ' él' : '')]));
    const big = M.filter(e => e.name === 'UpdateLayoutTree' && e.dur > 4000).sort((a, b) => b.dur - a.dur).slice(0, 12).map(e => { const a = (e.args && (e.args.beginData || e.args.data)) || {}, st = a.stackTrace; return [Math.round(e.dur / 1000), a.elementCount, st ? st.slice(0, 3).map(x => x.functionName + ':' + x.lineNumber).join(' < ') : '(image)']; });
    R.gestes[nom + ':styles'] = big;
    console.error(nom, JSON.stringify(R.gestes[nom]).slice(0, 900), JSON.stringify(R.gestes[nom + ':somme'])); };
  R.matieres = await c.ev("JSON.stringify((function(){var S=dbgScene(),n=0,m=0,nc=0,mc=0,vu=new Set(),vc=new Set();S.scene.traverse(function(o){if(!o.material)return;n++;(Array.isArray(o.material)?o.material:[o.material]).forEach(function(x){vu.add(x)});});S.car.traverse(function(o){if(!o.material)return;nc++;(Array.isArray(o.material)?o.material:[o.material]).forEach(function(x){vc.add(x)});});return {objetsScene:n,matieresScene:vu.size,objetsCaisse:nc,matieresCaisse:vc.size,programmes:(S.rdr.info.programs||[]).length}})())");
  console.error('matières', R.matieres);
  await geste('ouverture', () => clic('#gShopBas'), 3000);
  await geste('peinture', () => clic('#gBqCats [data-c="peinture"]'), 2500);
  await geste('voiture', () => clic('#gBqCats [data-c="voiture"]'), 2500);
  const lancer = async (sens) => { const r = await c.ev("JSON.stringify((function(){var e=document.querySelector('#gBqPan .bqRail');var b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]})())").then(JSON.parse);
    const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, L = r[2] * .35 * sens, pt = k => ({ x: cx + L * (1 - 2 * k), y: cy });
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt(0)] }); for (let k = 1; k <= 8; k++) { await dormir(22); await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [pt(k / 8)] }); }
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  await geste('defile', async () => { for (let i = 0; i < 3; i++) { await lancer(1); await dormir(650); } }, 800);
  /* le défilement : le style recalculé image par image (nombre d'éléments), sommé */
  await geste('fermeture', () => clic('#gShopBas'), 2500);
  await geste('reouverture', () => clic('#gShopBas'), 3000);
  fs.writeFileSync(path.join(OUT, 'trace-' + ESSAI + '.json'), JSON.stringify(R, null, 1));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
