// Vérification du VRAI jeu (index.html non modifié, depuis le worktree) : menu → JOUER → course → un vol à la nitro, couché / debout / cadre de l'ordi.
// usage : node verif-jeu.mjs <dossier VERSION PRINCIPALE> [sans=volfige]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';

const [DOSSIER, EXTRA = ''] = process.argv.slice(2);
const PORT_HTTP = 9873, PORT_CDP = 9874;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webmanifest': 'application/json', '.glb': 'model/gltf-binary' };
function libre(port) { try { return execSync(`lsof -iTCP:${port} -sTCP:LISTEN -n -P || true`).toString().trim() === ''; } catch { return true; } }
if (!libre(PORT_HTTP) || !libre(PORT_CDP)) { console.error('ports pris'); process.exit(2); }
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DOSSIER, p);
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-length': st.size, 'cache-control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
}).listen(PORT_HTTP, '127.0.0.1');
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'verif-jeu-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${prof}`, '--mute-audio', '--no-first-run', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore', detached: true });
function fin(code) { try { process.kill(-chrome.pid); } catch {} try { srv.close(); } catch {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(code); }
process.on('SIGINT', () => fin(130)); process.on('uncaughtException', e => { console.error(e); fin(1); });
const dodo = ms => new Promise(r => setTimeout(r, ms));
async function cdp() {
  let tabs;
  for (let i = 0; i < 120; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT_CDP}/json`)).json(); if (tabs.find(t => t.type === 'page')) break; } catch {} await dodo(500); }
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const att = new Map(); const erreurs = [];
  ws.onmessage = m => { const d = JSON.parse(m.data);
    if (d.id && att.has(d.id)) { const { r, j } = att.get(d.id); att.delete(d.id); d.error ? j(new Error(JSON.stringify(d.error))) : r(d.result); }
    else if (d.method === 'Runtime.exceptionThrown') erreurs.push('exception: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 300));
    else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') erreurs.push('console.error: ' + d.params.args.map(a => a.value || a.description).join(' ').slice(0, 300)); };
  const send = (method, params = {}, ms = 120000) => new Promise((r, j) => { const i = ++id; att.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (att.has(i)) { att.delete(i); j(new Error('délai ' + method)); } }, ms); });
  const ev = async (expr, ms) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, ms); if (r.exceptionDetails) throw new Error('JS: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; };
  return { send, ev, erreurs };
}
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, ex: { runs: 5 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const dispos = [
  { nom: 'couché 844×390', w: 844, h: 390, q: 'colonne=0&', cadre: false },
  { nom: 'debout 390×844', w: 390, h: 844, q: 'colonne=0&', cadre: false },
  { nom: "cadre de l'ordi 1280×800", w: 1280, h: 800, q: '', cadre: true },
];
try {
  const c = await cdp();
  await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Log.enable');
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem("cashcarSave",${JSON.stringify(JSON.stringify(SAVE))})}catch(e){}` });
  let tout = true;
  for (const d of dispos) {
    c.erreurs.length = 0;
    await c.send('Emulation.setDeviceMetricsOverride', { width: d.w, height: d.h, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_HTTP}/index.html?${d.q}simu=1&carte=nuages&meteo=midi&pistegraine=12345${EXTRA ? '&' + EXTRA : ''}` });
    // le jeu vit dans le document de la page, ou dans l'iframe #colonne (cadre de l'ordi)
    const W = d.cadre ? `document.getElementById('colonne').contentWindow` : 'window';
    const E = expr => c.ev(`(function(){var w=${W};return w.eval(${JSON.stringify(expr)});})()`);
    let pret = false;
    for (let i = 0; i < 240 && !pret; i++) { await dodo(500); try { pret = await E(`typeof dbgState==='function'&&!!document.querySelector('[data-m="play"]')`); } catch {} }
    if (!pret) { console.log(d.nom, 'ÉCHEC : le jeu ne démarre pas', c.erreurs.slice(0, 3)); tout = false; continue; }
    await dodo(1500);
    await E(`document.querySelector('[data-m="play"]').click()`);
    let lance = false;
    for (let i = 0; i < 240 && !lance; i++) { await dodo(500); try { lance = await E(`(function(){var s=dbgState();return s.started&&!s.gameOver})()`); } catch {} }
    if (!lance) { console.log(d.nom, 'ÉCHEC : la course ne part pas', c.erreurs.slice(0, 3)); tout = false; continue; }
    await E(`dbgAuto(true,0)`);
    await dodo(6000); // quelques secondes de route
    const sol = await E(`JSON.stringify({mode:dbgState().mode,s:dbgState().s,vH:dbgState().vH})`);
    // un vol à la nitro : décollage, nitro tenue 1,5 s, on relâche
    await E(`dbgAuto(false,0)`);
    const dec = await E(`JSON.stringify(dbgDauphin(60,60,0,0).mode)`);
    await E(`window.__kd=function(dn){var e=new KeyboardEvent(dn?'keydown':'keyup',{code:'Space',key:' ',bubbles:true});window.dispatchEvent(e);document.dispatchEvent(e);}; __kd(true)`);
    const hauts = [];
    for (let k = 0; k < 6; k++) { await dodo(450); try { hauts.push(await E(`JSON.stringify(dbgVolRoute())`)); } catch { hauts.push('?'); } if (k === 2) await E(`__kd(false)`); }
    await E(`__kd(false)`);
    await dodo(2500);
    const apres = await E(`JSON.stringify({mode:dbgState().mode,gameOver:dbgState().gameOver,loopErr:window.__loopErr||null,banqErr:window.__banqErr||null,figeActif:dbgVolFige()})`);
    const us = hauts.map(h => { try { return JSON.parse(h).u.join(','); } catch { return '?'; } });
    const constants = new Set(us.filter(u => u !== '?')).size;
    console.log(`\n== ${d.nom} ${EXTRA}\n sol: ${sol}\n décollage: mode=${dec}\n haut du vol (6 relevés pendant le vol): ${constants === 1 ? 'IDENTIQUE à chaque relevé' : constants + ' valeurs différentes'}  ${us.slice(0, 3).join(' | ')}\n après: ${apres}\n erreurs console/JS: ${c.erreurs.length ? JSON.stringify(c.erreurs.slice(0, 5)) : 'aucune'}`);
    if (c.erreurs.length) tout = false;
    const a = JSON.parse(apres); if (a.loopErr || a.banqErr) tout = false;
  }
  console.log(tout ? '\nTOUT OK' : '\nPROBLÈMES (voir plus haut)');
  fin(tout ? 0 : 1);
} catch (e) { console.error('ÉCHEC', e); fin(1); }
