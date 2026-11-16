// LE BANC DU JS PAR IMAGE (2026-11-16, lot jsimage) — le socle commun : serveur (avec repli pour les assets d'un autre dossier), Chrome muet
// déguisé en iPhone 13 Pro, sauvegarde muette, départ d'une course. Repris de outils/banc-pcmain/det.cjs et outils/banc-trainees/cdp.cjs.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.webmanifest': 'application/json' };
/* dirs : le jeu d'abord, puis les dossiers de repli (un chantier « léger » sans assets/ les prend dans un autre worktree) */
function serveur(dirs, port) {
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const essai = k => { if (k >= dirs.length) { rs.writeHead(404); return rs.end(); }
      const f = path.join(dirs[k], p); if (!f.startsWith(dirs[k])) { rs.writeHead(403); return rs.end(); }
      fs.readFile(f, (e, b) => { if (e) return essai(k + 1);
        rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); };
    essai(0);
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: 'fast', qChoisi: 1 };
const GRAINE = g => ';(function(){var a=' + (+g) + '>>>0;Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};})();';
async function ouvre(o) {
  const W = o.w || 390, H = o.h || 844;
  for (const p of [o.http, o.cdp]) if (!portLibre(p)) throw new Error('port occupé : ' + p);
  const srv = await serveur(o.dirs, o.http);
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-jsimage-'));
  const { ch, pg } = await lanceChrome(o.cdp, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') c.exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  c.fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + (o.graine ? GRAINE(o.graine) : '') + (o.avant || '') });
  await c.send('Page.navigate', { url: 'about:blank' }); await dormir(300);
  const url = `http://127.0.0.1:${o.http}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&tel=1&appareil=iPhone14,2&carte=${o.carte || 'nuages'}${o.meteo ? '&meteo=' + o.meteo : ''}&pistegraine=7${o.qs ? '&' + o.qs : ''}`;
  await c.send('Page.navigate', { url });
  let pret = false;
  for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
  if (!pret) throw new Error('pas prêt');
  await dormir(1500);
  await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
  await dormir(1500);
  const carteJs = "dbgClassique('" + (o.carte || 'nuages') + "'," + (o.meteo ? "'" + o.meteo + "'" : 'null') + ');';
  if (o.fige) await c.ev('window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};1');
  let ok = false;
  for (let i = 0; i < 240 && !ok; i++) {
    if (i % 16 === 0) { try { await c.ev(carteJs + 'dbgJouer()'); } catch (e) {} }
    if (o.fige) await c.ev('(async function(){for(var i=0;i<15;i++){dbgStep(1,1000/30);await new Promise(function(r){setTimeout(r,30)});}return 1})()', 60000);
    else await dormir(500);
    try { ok = await c.ev('(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()'); } catch (e) {}
  }
  if (!ok) throw new Error('course pas lancée');
  return { c, url };
}
module.exports = { ouvre, dormir, serveur };
