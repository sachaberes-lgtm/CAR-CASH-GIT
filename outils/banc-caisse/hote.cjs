// LE BANC DE LA CAISSE (2026-11-15, chantier qualité par appareil, lot caisse) — l'HÔTE : sert VERSION PRINCIPALE et lance UN Chrome sans fenêtre et
// MUET (iPhone 13 Pro émulé, ?appareil=iPhone14,2, tactile, DPR 3), puis reste en vie et garde SA session CDP (l'émulation de l'écran ne survit pas
// toujours aux sessions des autres clients : ev.cjs passe donc par l'hôte, POST /__cmd sur le port HTTP).
//   node outils/banc-caisse/hote.cjs [--http 9831] [--cdp 9832] [--fmt couche|debout]
// ⚠ un seul hôte à la fois sur ces ports ; le fermer : pkill -f "remote-debugging-port=9832" puis tuer le node.
const fs = require('fs'), path = require('path'), http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9831), P_CDP = +(A.cdp || 9832), FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/json', '.webp': 'image/webp', '.wasm': 'application/wasm' };
let c = null, scriptId = null;
const emule = async (w, h) => {
  await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 3, mobile: true, screenWidth: w, screenHeight: h });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] }); };
let VW = W, VH = H;
async function cmd(q) {
  if (q.op === 'nav') {
    if (scriptId) { try { await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptId }); } catch (e) {} }
    if (q.fmt) { [VW, VH] = q.fmt === 'debout' ? [390, 844] : [844, 390]; }
    if (q.pc) { /* L'ORDINATEUR : ni écran de téléphone, ni tactile, ni iPhone — pour vérifier qu'il ne change pas */
      await c.send('Emulation.clearDeviceMetricsOverride'); await c.send('Emulation.setTouchEmulationEnabled', { enabled: false });
      await c.send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', platform: 'MacIntel' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'hover' }, { name: 'pointer', value: 'fine' }] });
      await c.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false, screenWidth: 1920, screenHeight: 1080 });
    } else await emule(VW, VH);
    const graine = q.graine ? 'try{(function(){var a=' + (q.graine | 0) + ';Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};})()}catch(e){}' : ''; /* le HASARD semé : deux chargements, la même partie */
    scriptId = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: graine + 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(q.save)) + ')}catch(e){}' })).identifier;
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/` + q.url }); return 'nav ok';
  }
  if (q.op === 'shot') { const o = { format: 'png', clip: q.clip ? { x: q.clip[0], y: q.clip[1], width: q.clip[2], height: q.clip[3], scale: 1 } : { x: 0, y: 0, width: VW, height: VH, scale: 1 } };
    const r = await c.send('Page.captureScreenshot', o, 120000); fs.writeFileSync(q.file, Buffer.from(r.data, 'base64')); return 'photo ' + q.file; }
  const r = await c.send('Runtime.evaluate', { expression: q.expr, awaitPromise: true, returnByValue: true }, 300000);
  if (r.exceptionDetails) return 'ERREUR ' + JSON.stringify(r.exceptionDetails).slice(0, 800);
  const v = r.result.value; return typeof v === 'string' ? v : JSON.stringify(v);
}
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = http.createServer((rq, rs) => {
    if (rq.method === 'POST' && rq.url === '/__cmd') { let b = ''; rq.on('data', d => b += d); rq.on('end', async () => {
      try { const out = await cmd(JSON.parse(b)); rs.writeHead(200); rs.end(out); } catch (e) { rs.writeHead(500); rs.end('ÉCHEC ' + String(e).slice(0, 400)); } }); return; }
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(JEU, p); if (!f.startsWith(JEU)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
  });
  await new Promise(ok => srv.listen(P_HTTP, '127.0.0.1', ok));
  const { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.ws.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); process.exit(0); };
  process.on('SIGTERM', fin); process.on('SIGINT', fin);
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await emule(W, H);
  fs.writeFileSync(path.join(__dirname, '.hote.json'), JSON.stringify({ http: P_HTTP, cdp: P_CDP }));
  console.log('hôte prêt', P_HTTP, P_CDP, W + 'x' + H);
})().catch(e => { console.error(e); process.exit(1); });
