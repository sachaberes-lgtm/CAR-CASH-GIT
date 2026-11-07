// LE BANC DES TRAÎNÉES — client CDP minimal (Node ≥ 22, aucune dépendance) : sert VERSION PRINCIPALE, lance Chrome sans fenêtre et muet,
// pilote le vrai jeu. Utilisé par photos.cjs. ⚠ Ports : vérifier qu'ils sont libres (les bancs des autres sessions se marchent dessus).
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };

function serveur(dir, port) {
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(dir, p);
    if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); }
      rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}

function portLibre(port) { /* (2026-11-07) Windows : netstat ; ailleurs lsof */
  try { if (process.platform === 'win32') return !cp.execSync('netstat -an -p TCP').toString().split(/\r?\n/).some(l => /LISTENING/.test(l) && new RegExp(':' + port + '\\s').test(l));
    return cp.execSync(`lsof -iTCP:${port} -sTCP:LISTEN -P -n || true`).toString().trim() === ''; } catch (e) { return true; }
}

const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'); /* (2026-11-07) Windows aussi */
async function lanceChrome(port, prof, w, h) {
  const ch = cp.spawn(CHROME, ['--headless=new', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : []), '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--no-first-run',
    '--remote-debugging-port=' + port, '--user-data-dir=' + prof, `--window-size=${w},${h}`, 'about:blank'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 240; i++) {
    await new Promise(r => setTimeout(r, 500));
    try { const t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const pg = t.find(x => x.type === 'page'); if (pg) return { ch, pg }; } catch (e) {}
  }
  throw new Error('Chrome ne répond pas');
}

class CDP {
  constructor(url) { this.id = 0; this.cb = new Map(); this.ws = new WebSocket(url);
    this.ok = new Promise((r, j) => { this.ws.onopen = r; this.ws.onerror = j; });
    this.ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && this.cb.has(m.id)) { const c = this.cb.get(m.id); this.cb.delete(m.id); m.error ? c[1](new Error(JSON.stringify(m.error))) : c[0](m.result); } }; }
  send(method, params, ms = 60000) { return new Promise((r, j) => { const id = ++this.id; this.cb.set(id, [r, j]);
    this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    setTimeout(() => { if (this.cb.has(id)) { this.cb.delete(id); j(new Error('délai : ' + method)); } }, ms); }); }
  async ev(expr, ms) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, ms);
    if (r.exceptionDetails) throw new Error('page : ' + JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; }
  close() { try { this.ws.close(); } catch (e) {} }
}

/* tuer Chrome et ses fils : kill du groupe (Mac/Linux), taskkill /T (Windows) */
function tueChrome(ch) { try { if (process.platform === 'win32') cp.execSync('taskkill /pid ' + ch.pid + ' /T /F', { stdio: 'ignore' }); else process.kill(-ch.pid); } catch (e) { try { ch.kill(); } catch (_) {} } }
module.exports = { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir: ms => new Promise(r => setTimeout(r, ms)), tmp: () => fs.mkdtempSync(path.join(os.tmpdir(), 'banc-trainees-')) };
