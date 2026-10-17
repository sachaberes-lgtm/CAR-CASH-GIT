// LE BANC DES CAISSES (2026-10-17, session ELDORADO) — petit pilote CDP : le Chrome du Mac sans fenêtre et MUET, piloté par le
// WebSocket de Node (aucune dépendance, ni Puppeteer ni playwright). Servir d'abord le jeu sur un port à soi :
//   cd "VERSION PRINCIPALE" && python3 -m http.server 9377 --bind 127.0.0.1
// puis studio.mjs (le gabarit au studio), jeu.mjs (la caisse dans le vrai jeu), planche.mjs (AVANT | APRÈS), verif.mjs (SANS TOUT CASSER).
// La méthode : « L'ELDORADO v3 » dans VERSION PRINCIPALE/JOURNAL.md. Un banc à la fois, court : la machine est aussi celle de Sacha.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function lance({ port = 9477, w = 844, h = 390, dpr = 2 } = {}) {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-eldo-'));
  const ch = spawn(CHROME, ['--headless=new', '--mute-audio', '--disable-audio-output', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check',
    '--window-size=' + w + ',' + h, 'about:blank'], { stdio: 'ignore' });
  let tabs;
  for (let i = 0; i < 60; i++) {
    try { tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json(); if (tabs.find(t => t.type === 'page')) break; } catch (e) {}
    await sleep(250);
  }
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const att = new Map(); const ecoute = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } else if (m.method) for (const f of ecoute) f(m); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; att.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass: true });
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
  const erreurs = [];
  ecoute.push(m => {
    if (m.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('ERR ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
  });
  const ev = async (expr, await_ = true) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: await_, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
    return r.result?.result?.value;
  };
  const photo = async (fichier, clip) => {
    const r = await send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip: Object.assign({ scale: 1 }, clip) } : {}));
    fs.writeFileSync(fichier, Buffer.from(r.result.data, 'base64'));
  };
  const clic = async (x, y) => { // la souris passe d'abord AU-DESSUS (un bouton du cadre de l'ordi ne prenait pas un appui sans survol)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(60);
    for (const type of ['mousePressed', 'mouseReleased']) { await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 }); await sleep(40); }
  };
  const fin = async () => { try { ws.close(); } catch (e) {} ch.kill('SIGKILL'); await sleep(300); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  return { send, ev, photo, clic, fin, erreurs, ecoute };
}

// Une sauvegarde muette, auto-école passée, posée AVANT le chargement (une seule fois par onglet).
export async function prepare(c, save) {
  const s = JSON.stringify(Object.assign({ v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, bienv: 1, ex: { runs: 5 } }, save || {}));
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    `try{if(!sessionStorage.ccBanc){sessionStorage.ccBanc=1;localStorage.cashcarSave=${JSON.stringify(s)};}}catch(e){}` });
}

export async function charge(c, url, { attente = 40000 } = {}) {
  await c.send('Page.navigate', { url });
  const t0 = Date.now();
  while (Date.now() - t0 < attente) {
    await sleep(500);
    try { if (await c.ev('!!window.__gameReady')) return Date.now() - t0; } catch (e) {}
  }
  throw new Error('__gameReady jamais venu');
}

// Toucher le splash jusqu'à ce qu'il parte (jamais remove()).
export async function passeSplash(c, w = 844, h = 390) {
  for (let i = 0; i < 30; i++) {
    const la = await c.ev(`(()=>{const s=document.getElementById('splash');if(!s)return 0;const cs=getComputedStyle(s);return (cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05)?1:0;})()`);
    if (!la) return true;
    await c.clic(w / 2, h / 2); await sleep(400);
  }
  return false;
}
