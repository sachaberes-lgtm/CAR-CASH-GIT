/* Banc mobile CASH CAR (2026-10-22, debug-mobile) — Chrome sans fenêtre en téléphone émulé, piloté par le WebSocket de Node.
   ⚠ À lancer SOUS le verrou : /Users/sachaberes/cash-car/verrou-banc.sh prendre "debug-mobile" ; node …; verrou-banc.sh rendre */
import { spawn, execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, createReadStream, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize } from 'node:path';
import http from 'node:http';

export const RACINE = new URL('../VERSION PRINCIPALE', import.meta.url).pathname;
export const PROFILS = {
  /* nom: [largeur, hauteur, dpr, marges{top,left,bottom,right}, UA] */
  'iphone-debout':  [393, 852, 3, { top: 59, left: 0, bottom: 34, right: 0 }, 'iphone'],
  'iphone-couche':  [852, 393, 3, { top: 0, left: 59, bottom: 21, right: 59 }, 'iphone'],
  'se-debout':      [375, 667, 2, { top: 20, left: 0, bottom: 0, right: 0 }, 'iphone'],
  'se-couche':      [667, 375, 2, { top: 0, left: 0, bottom: 0, right: 0 }, 'iphone'],
  'android-debout': [412, 915, 2.625, { top: 24, left: 0, bottom: 0, right: 0 }, 'android'],
  'android-couche': [915, 412, 2.625, { top: 0, left: 0, bottom: 0, right: 0 }, 'android'],
  'petit-debout':   [360, 640, 2, { top: 24, left: 0, bottom: 0, right: 0 }, 'android'],
  'petit-couche':   [640, 360, 2, { top: 0, left: 0, bottom: 0, right: 0 }, 'android'],
  'ipad-couche':    [1024, 768, 2, { top: 0, left: 0, bottom: 20, right: 0 }, 'ipad'],
};
const UAS = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
};
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.txt': 'text/plain', '.wasm': 'application/wasm' };
export const dort = ms => new Promise(r => setTimeout(r, ms));

export async function serveur(racine = RACINE) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(racine, p));
    if (!f.startsWith(racine) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(f).pipe(res);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  return { srv, port: srv.address().port };
}

function portLibre() {
  for (let k = 0; k < 40; k++) {
    const p = 9610 + Math.floor(Math.random() * 280);
    try { execSync(`lsof -iTCP:${p} -sTCP:LISTEN`, { stdio: 'pipe' }); } catch (e) { return p; } /* lsof sort en erreur quand personne n'écoute */
  }
  throw new Error('pas de port libre');
}

/* Ouvre un téléphone émulé, charge la page, retourne le pilote. opts: {profil, params:'?x=1', save:{…}, insets:true, swift:false} */
export async function ouvrir(opts) {
  const [W, H, dpr, ins, ua] = PROFILS[opts.profil];
  const { srv, port: pHttp } = await serveur(opts.racine || RACINE);
  const PORT = portLibre();
  const dir = mkdtempSync(join(tmpdir(), 'ccmob-'));
  const flags = ['--headless=new', '--mute-audio', '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${PORT}`, `--user-data-dir=${dir}`, '--no-first-run', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];
  if (opts.swift) flags.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  flags.push('about:blank');
  const ch = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', flags, { stdio: 'ignore', detached: true });
  const B = { W, H, errs: [], logs: [], reqs: [], profil: opts.profil, t0: Date.now() };
  let ws, id = 0; const att = new Map();
  B.dit = (...a) => console.log(`[${Math.round((Date.now() - B.t0) / 1000)} s]`, ...a);
  B.fermer = async () => { try { ws && ws.close(); } catch (e) {} try { process.kill(-ch.pid, 'SIGKILL'); } catch (e) { try { ch.kill('SIGKILL'); } catch (e2) {} } try { srv.close(); } catch (e) {} };
  const sortie = () => { try { process.kill(-ch.pid, 'SIGKILL'); } catch (e) {} };
  process.on('exit', sortie); process.on('SIGINT', () => { sortie(); process.exit(1); }); process.on('SIGTERM', () => { sortie(); process.exit(1); });
  try {
    let cible; for (let k = 0; k < 240 && !cible; k++) { await dort(500);
      try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); cible = l.find(t => t.type === 'page'); } catch (e) {} }
    if (!cible) throw new Error('Chrome ne répond pas');
    ws = new WebSocket(cible.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    ws.onmessage = m => { const d = JSON.parse(m.data);
      if (d.id && att.has(d.id)) { att.get(d.id)(d.error ? { __err: d.error.message } : (d.result || {})); att.delete(d.id); }
      if (d.method === 'Runtime.exceptionThrown') B.errs.push('EXC ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 300));
      if (d.method === 'Runtime.consoleAPICalled') { const t = d.params.type, s = d.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300);
        if (t === 'error') B.errs.push('ERR ' + s); else if (t === 'warning') B.logs.push('WARN ' + s); }
      if (d.method === 'Network.responseReceived' && d.params.response.status >= 400) B.reqs.push(d.params.response.status + ' ' + d.params.response.url.replace(/^https?:\/\/127\.0\.0\.1:\d+/, ''));
      if (d.method === 'Network.loadingFailed' && !d.params.canceled) B.reqs.push('FAIL ' + (d.params.errorText || '') + ' ' + d.params.requestId);
      if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') B.errs.push('LOG ' + (d.params.entry.text || '').slice(0, 200) + ' ' + (d.params.entry.url || '').replace(/^https?:\/\/127\.0\.0\.1:\d+/, ''));
    };
    B.cdp = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise(res => att.set(i, res)); };
    B.ev = async (expr, ms = 60000) => { const r = await Promise.race([B.cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }), dort(ms).then(() => ({ __timeout: 1 }))]);
      if (r.__timeout) throw new Error('ev timeout: ' + expr.slice(0, 80)); if (r.exceptionDetails) return { __exc: (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 200) }; return r.result && r.result.value; };
    await B.cdp('Page.enable'); await B.cdp('Runtime.enable'); await B.cdp('Network.enable'); await B.cdp('Log.enable'); await B.cdp('Network.setBypassServiceWorker', { bypass: true });
    await B.cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: dpr, mobile: true, screenWidth: W, screenHeight: H });
    await B.cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await B.cdp('Emulation.setUserAgentOverride', { userAgent: UAS[ua], platform: ua === 'android' ? 'Linux armv81' : 'iPhone' });
    if (opts.insets !== false) { const r = await B.cdp('Emulation.setSafeAreaInsetsOverride', { insets: ins }); if (r.__err) B.dit('marges de sécurité non émulées :', r.__err); else B.insets = ins; }
    const save = Object.assign({ tuto: 1, permis: 1, facile: 0, sfx: false, mus: false, vox: false, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } }, opts.save || {});
    await B.cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!sessionStorage.__p){sessionStorage.__p=1;localStorage.cashcarSave=JSON.stringify(${JSON.stringify(save)});}}catch(e){}` });
    B.url = `http://127.0.0.1:${pHttp}/index.html${opts.params || ''}`;
    await B.cdp('Page.navigate', { url: B.url });
    B.tape = async (x, y, ms = 60) => { await B.cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dort(ms); await B.cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    B.glisse = async (x0, y0, x1, y1, ms = 300, pas = 10) => { await B.cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
      for (let k = 1; k <= pas; k++) { await dort(ms / pas); await B.cdp('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * k / pas, y: y0 + (y1 - y0) * k / pas }] }); }
      await B.cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    B.centre = sel => B.ev(`(function(){const e=[...document.querySelectorAll(${JSON.stringify(sel)})].find(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(x).visibility!=='hidden'&&getComputedStyle(x).display!=='none'});if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,(e.textContent||'').trim().slice(0,24)]})()`);
    B.touche = async sel => { const c = await B.centre(sel); if (!c) return null; await B.tape(c[0], c[1]); return c[2] || true; };
    B.attends = async (expr, s, pas = 400) => { for (let k = 0; k < s * 1000 / pas; k++) { if (await B.ev(expr)) return true; await dort(pas); } return false; };
    B.photo = async (nom) => { const s = await B.cdp('Page.captureScreenshot', { format: 'png' }); const f = join(new URL('./photos', import.meta.url).pathname, `${opts.profil}-${nom}.png`); writeFileSync(f, Buffer.from(s.data, 'base64')); return f; };
    return B;
  } catch (e) { await B.fermer(); throw e; }
}

export async function passerSplash(B, max = 30) {
  const ok = await B.attends('!!window.__gameReady', 240, 500); B.dit('jeu prêt :', ok);
  for (let k = 0; k < max; k++) {
    const s = await B.ev(`(function(){const e=document.getElementById('splash');if(!e)return false;const c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>0})()`);
    if (!s) break; await B.tape(B.W / 2, B.H / 2); await dort(1200); }
  return ok;
}
