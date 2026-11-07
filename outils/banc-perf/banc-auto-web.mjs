// (2026-11-07, passe 3, P7) ESSAI WEB DU BANC iPHONE AUTOMATIQUE : le même scénario (banc-iphone.js) dans Chrome sans fenêtre, en iPhone émulé (?tel=1), pour vérifier qu'il va au bout sans erreur
// AVANT de demander un build. ⚠ prendre le verrou : sh ~/cash-car/verrou-banc.sh prendre "banc" … rendre. Sortie 0 = « banc: fini » et 0 erreur de page.
//   node outils/banc-perf/banc-auto-web.mjs [--partie 40] [--max 900] [--port 9851] [--jeu 9852] [--palier 2]
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const a = process.argv.slice(2); const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const PARTIE = +opt('partie', 40), MAX = +opt('max', 900), PORT = +opt('port', 9851), JEU = +opt('jeu', 9852), PALIER = opt('palier', '2');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ICI = path.dirname(fileURLToPath(import.meta.url)); const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = spawn('python3', ['-m', 'http.server', String(JEU), '--bind', '127.0.0.1'], { cwd: path.resolve(ICI, '../../VERSION PRINCIPALE'), stdio: 'ignore', detached: true });
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-bancauto-'));
const chrome = spawn(CHROME, ['--headless=new', '--mute-audio', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
const tue = () => { try { process.kill(-srv.pid, 'SIGKILL'); } catch (e) {} try { chrome.kill('SIGKILL'); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', tue); process.on('SIGINT', () => { tue(); process.exit(1); });
let tabs; for (let i = 0; i < 80; i++) { try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (tabs.find(t => t.type === 'page')) break; } catch (e) {} await sleep(250); }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const att = new Map(), erreurs = [];
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('ERR ' + m.params.args.map(x => x.value ?? x.description ?? '').join(' ').slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.args[0]?.value === '[banc]') console.log(m.params.args.map(x => x.value ?? '').join(' ').slice(0, 260)); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; att.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result?.result?.value; };
let code = 1;
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setBypassServiceWorker', { bypass: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const save = JSON.stringify({ v: 2, sfx: true, mus: true, vox: true, tuto: 1, permis: 1, facile: 0, bienv: 1, ex: { runs: 5 }, plq: { m: 'fr', x: 'BANC', ok: 1 } });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!localStorage.ccBancWeb){localStorage.ccBancWeb=1;localStorage.cashcarSave=${JSON.stringify(save)};}}catch(e){}` });
  for (let i = 0; i < 120; i++) { try { if ((await fetch('http://127.0.0.1:' + JEU + '/index.html', { method: 'HEAD' })).ok) break; } catch (e) {} await sleep(500); } /* le serveur peut tarder sur un Mac chargé */
  await send('Page.navigate', { url: `http://127.0.0.1:${JEU}/index.html?banc=auto&bancT=${PARTIE}&tel=1&garde=1&palier=${PALIER}` });
  const t0 = Date.now(); let der = '';
  while ((Date.now() - t0) / 1000 < MAX) { await sleep(5000);
    const e = await ev('JSON.stringify(window.__ccBanc?window.__ccBanc.etat():null)').catch(() => 'ERR');
    if (e !== der) { console.log('état', e); der = e; }
    if (/"fini":true/.test(e)) { code = 0; break; } }
  const L = await ev('JSON.stringify((window.__ccBanc?window.__ccBanc.lignes():[]).map(function(x){return x.m;}))').catch(() => '[]');
  console.log('--- lignes du journal ---'); for (const m of JSON.parse(L)) console.log(m.slice(0, 300));
  if (code) console.log('✘ pas fini en ' + MAX + ' s');
} catch (e) { console.log('✘', e.message); }
const util = erreurs.filter(x => !/favicon|net::ERR|Failed to load resource/.test(x));
if (util.length) { console.log('✘ erreurs de page :\n  ' + util.slice(0, 15).join('\n  ')); code = 1; }
console.log(code ? 'BANC AUTO WEB : ROUGE' : 'BANC AUTO WEB : VERT'); process.exit(code);
