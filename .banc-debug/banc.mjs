#!/usr/bin/env node
// LE BANC DES MAPS v2 (session DEBUGGING, 2026-10-22) — le VRAI jeu, Chrome sans fenêtre et MUET, piloté par CDP. SOUS LE VERROU COMMUN :
// un seul gros banc à la fois sur tout le Mac (/Users/sachaberes/cash-car/verrou-banc.sh), < 9 min, Chrome et serveur tués en GROUPE à la sortie.
//
//   node banc.mjs --jeu "<dossier>" --scen scen.json [--out r.json] [--shots <dossier>] [--qui "<nom>"]
// scen.json = [{ "carte":"volcan","meteo":"soir","teinte":null,"secs":25,"vue":"plein|tel|debout","auto":{"lat":0,"gl":false,"vol":false,"saut":0},
//               "chaine":"ville:pluie:vert,espace:midi", "params":"x=1", "eval":"<js>", "sonde":"<js>", "shotsAt":[5,15], "nom":"…" }, …]
// Dans eval/sonde : G = la fenêtre du jeu (G.dbgState(), G.dbgClassique()…).
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import http from 'node:http';

const A = {}; { const v = process.argv.slice(2); for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const n = v[i + 1]; if (n == null || n.startsWith('--')) A[v[i].slice(2)] = '1'; else { A[v[i].slice(2)] = n; i++; } } }
const JEU = path.resolve(A.jeu || '.'), PH = +(A.http || 9461), PC = +(A.cdp || 9761), SHOTS = A.shots || null, QUI = A.qui || 'debug-maps';
const SCEN = JSON.parse(fs.readFileSync(A.scen, 'utf8'));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', VERROU = '/Users/sachaberes/cash-car/verrou-banc.sh';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, ex: { runs: 5 } };
const LIMITE = 9 * 60 * 1000, sleep = ms => new Promise(r => setTimeout(r, ms)); let t0 = Date.now();
const log = (...a) => console.log('[' + ((Date.now() - t0) / 1000).toFixed(0) + 's]', ...a);
function portPris(p) { try { return execSync(`lsof -iTCP:${p} -sTCP:LISTEN -t 2>/dev/null`).toString().trim() !== ''; } catch { return false; } }
for (const p of [PH, PC]) if (portPris(p)) { console.error('PORT PRIS : ' + p); process.exit(3); }

// ---------- le verrou commun ----------
execSync(`${VERROU} prendre "${QUI}"`, { stdio: 'inherit' });
t0 = Date.now(); // (les 9 min se comptent À PARTIR DU VERROU PRIS, pas du lancement : l attente dans la file ne mange plus le temps de jeu)
let chrome = null, srv = null, prof = null, fini = false;
function nettoie() {
  if (fini) return; fini = true;
  try { if (chrome && chrome.pid) process.kill(-chrome.pid, 'SIGKILL'); } catch { }
  try { srv && srv.close(); } catch { } try { prof && fs.rmSync(prof, { recursive: true, force: true }); } catch { }
  try { execSync(`${VERROU} rendre`, { stdio: 'inherit' }); } catch { }
}
process.on('exit', nettoie); for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(s, () => { nettoie(); process.exit(130); });
process.on('uncaughtException', e => { console.error('ERREUR banc', e); nettoie(); process.exit(1); });
setTimeout(() => { console.log('LIMITE de 9 min : banc arrêté'); fin(); }, LIMITE).unref();

// ---------- serveur ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm' };
srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html'; const f = path.join(JEU, path.normalize(u).replace(/^(\.\.[\/\\])+/, ''));
  fs.stat(f, (e, st) => { if (e || !st.isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Length': st.size }); fs.createReadStream(f).pipe(r); }); });
await new Promise(res => srv.listen(PH, '127.0.0.1', res));
prof = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-dm-'));
chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PC, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--no-default-browser-check',
  '--autoplay-policy=no-user-gesture-required', '--window-size=1280,800', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore', detached: true });

async function jget(p) { for (let i = 0; i < 80; i++) { try { return await (await fetch(`http://127.0.0.1:${PC}${p}`)).json(); } catch { await sleep(250); } } throw new Error('Chrome ne répond pas'); }
await jget('/json/version'); const tab = (await jget('/json/list')).find(t => t.type === 'page');
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((a, b) => { ws.onopen = a; ws.onerror = b; });
let mid = 0; const att = new Map(), ecoute = [];
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && att.has(m.id)) { const { a, b } = att.get(m.id); att.delete(m.id); m.error ? b(new Error(JSON.stringify(m.error))) : a(m.result); } else if (m.method) for (const f of ecoute) f(m); };
const cdp = (method, params = {}) => new Promise((a, b) => { const id = ++mid; att.set(id, { a, b }); ws.send(JSON.stringify({ id, method, params })); });
async function ev(expr, to = 30000) {
  const code = `(async()=>{const f=document.querySelector('iframe');const G=(f&&f.contentWindow&&f.contentWindow.dbgState)?f.contentWindow:window;return (${expr});})()`;
  const r = await Promise.race([cdp('Runtime.evaluate', { expression: code, awaitPromise: true, returnByValue: true }), sleep(to).then(() => ({ __to: 1 }))]);
  if (r.__to) return { __erreur: 'timeout' }; if (r.exceptionDetails) return { __erreur: ((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text || '').slice(0, 300) };
  return r.result ? r.result.value : undefined;
}
let ERR = [], WARN = []; const BRUIT = /navigator\.vibrate|dark-triad\.mp3|READ-usage|GPU stall|favicon|adsbygoogle|pagead|net::ERR_|Failed to load resource|flatShading/i;
ecoute.push(m => {
  if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; ERR.push(('EXC ' + ((d.exception || {}).description || d.text || '')).slice(0, 400)); }
  else if (m.method === 'Runtime.consoleAPICalled') { const t = m.params.args.map(a => a.value != null ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 400);
    if ((m.params.type === 'error' || m.params.type === 'assert') && !BRUIT.test(t)) ERR.push('ERR ' + t); else if (m.params.type === 'warning' && !BRUIT.test(t)) WARN.push(t); }
  else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !BRUIT.test(m.params.entry.text + (m.params.entry.url || ''))) ERR.push('LOG ' + m.params.entry.text.slice(0, 300));
});
await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable'); await cdp('Network.enable');
await cdp('Network.setBypassServiceWorker', { bypass: true }); await cdp('Network.setCacheDisabled', { cacheDisabled: true });
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem("cashcarSave",${JSON.stringify(JSON.stringify(SAVE))})}catch(e){}` });
const VUES = { plein: { w: 1280, h: 720, mob: false, q: 'colonne=0' }, tel: { w: 844, h: 390, mob: true, q: 'tel=1&colonne=0' }, debout: { w: 390, h: 844, mob: true, q: 'tel=1&colonne=0' }, cadre: { w: 1280, h: 800, mob: false, q: '' } };
const SONDE = `(function(){const s=G.dbgState(),n=G.dbgClassique().niveau,d=G.dbgDuree?G.dbgDuree():{},rd=G.dbgScene().rdr;
  return {mode:s.mode,s:s.s,L:d.L,lat:s.lat,vA:s.vA,go:s.gameOver,carte:n&&n.carte,meteo:n&&n.meteo,teinte:n&&n.teinte,progs:rd.info.programs.length,geo:rd.info.memory.geometries,tex:rd.info.memory.textures,
   loopErr:G.__loopErr||null,mort:G.document.getElementById('mDead')?G.document.getElementById('mDead').innerText.replace(/\\s+/g,' ').slice(0,140):''`;
const R = { jeu: JEU, scen: [] };
async function photo(nom) { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); try { const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.writeFileSync(path.join(SHOTS, nom + '.jpg'), Buffer.from(r.data, 'base64')); } catch { } }

async function roule(X, etiq) {
  const M = { etiq, ech: [], morts: [], alertes: [] }; const au = Object.assign({ lat: 0 }, X.auto || {});
  await ev(`G.dbgAuto(1,${+au.lat || 0},${JSON.stringify(au)})`); const tA = Date.now(); let bl = 0, ch = 0, prec = null, si = 0;
  const SH = X.shotsAt || [];
  while ((Date.now() - tA) / 1000 < (X.secs || 20)) {
    await sleep(1000); const e = await ev(SONDE + (X.sonde ? `,x:(function(){try{return (${X.sonde})}catch(e){return 'ERR '+e.message}})()` : '') + '};})()');
    const ts = +((Date.now() - tA) / 1000).toFixed(1); if (!e || e.__erreur) { M.alertes.push({ ts, q: 'sonde', d: e && e.__erreur }); continue; }
    e.ts = ts; M.ech.push(e);
    if (e.loopErr) M.alertes.push({ ts, q: 'loopErr', d: e.loopErr });
    if (![e.s, e.lat, e.vA].every(isFinite)) M.alertes.push({ ts, q: 'NaN' });
    if (e.mode === 'drive' && !e.go && Math.abs(e.vA) < 2) { if (++bl === 4) M.alertes.push({ ts, q: 'arretee', d: { s: e.s, carte: e.carte } }); } else bl = 0;
    if (e.mode === 'fall' && !e.go) { if (++ch === 14) M.alertes.push({ ts, q: 'chute-sans-fin', d: { s: e.s, carte: e.carte } }); } else ch = 0;
    if (si < SH.length && ts >= SH[si]) { await photo((X.nom || etiq).replace(/[^\w-]+/g, '_') + '-' + SH[si] + 's'); si++; }
    if (e.go) { M.morts.push({ ts, s: prec && prec.s, L: e.L, carte: e.carte, meteo: e.meteo, mode: prec && prec.mode, lat: prec && prec.lat, texte: e.mort }); break; }
    prec = e;
  }
  const f = M.ech; M.resume = { n: f.length, cartes: [...new Set(f.map(x => x.carte + ':' + x.meteo + (x.teinte ? ':' + x.teinte : '')))], sMax: Math.max(0, ...f.map(x => x.s || 0)), L: (f[f.length - 1] || {}).L, progs: [(f[0] || {}).progs, (f[f.length - 1] || {}).progs], geo: [(f[0] || {}).geo, (f[f.length - 1] || {}).geo], x: (f[f.length - 1] || {}).x };
  return M;
}
async function scenario(X) {
  ERR = []; WARN = []; const V = VUES[X.vue || 'plein'];
  await cdp('Emulation.setDeviceMetricsOverride', { width: V.w, height: V.h, deviceScaleFactor: V.mob ? 2 : 1, mobile: V.mob });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: V.mob, maxTouchPoints: V.mob ? 5 : 1 });
  const q = [V.q, 'simu=1', 'carte=' + X.carte, X.meteo ? 'meteo=' + X.meteo : '', X.teinte ? 'teinte=' + X.teinte : '', X.params || ''].filter(Boolean).join('&');
  const S = { nom: X.nom || (X.carte + ':' + (X.meteo || '')), url: q, maps: [] }; log('▶', S.nom, q);
  await cdp('Page.navigate', { url: `http://127.0.0.1:${PH}/index.html?${q}` });
  let ok = false; for (let i = 0; i < 180; i++) { await sleep(500); if (await ev(`typeof G.dbgState==='function'&&!!G.__gameReady&&!!G.document.querySelector('[data-m="play"]')`, 5000) === true) { ok = true; break; } }
  if (!ok) { S.fatal = 'ne démarre pas'; await photo(S.nom.replace(/\W+/g, '_') + '-fatal'); S.erreurs = ERR.slice(); return S; }
  await sleep(1000); let parti = false;
  if (X.attente) { let n0 = -1, st = 0; const tw = Date.now(); // attendre la fin de la CHAUFFE du menu (programmes stables 4 s, 45 s au plus)
    while (Date.now() - tw < 45000 && st < 4) { await sleep(1000); const n = await ev('G.dbgScene().rdr.info.programs.length', 5000); if (n === n0) st++; else { st = 0; n0 = n; } }
    S.menu = { progs: n0, attente: Math.round((Date.now() - tw) / 1000) }; log('chauffe du menu :', JSON.stringify(S.menu)); }
  for (let k = 0; k < 3 && !parti; k++) { await ev(`(G.document.querySelector('#mHome [data-m="play"]')||G.document.querySelector('[data-m="play"]')).click()`);
    for (let i = 0; i < 50; i++) { await sleep(500); if (await ev(`(function(){const s=G.dbgState();return s.started&&!s.gameOver&&s.running})()`, 5000) === true) { parti = true; break; } } }
  if (!parti) { S.fatal = 'la course ne part pas'; S.erreurs = ERR.slice(); return S; }
  if (X.eval) S.eval = await ev(X.eval, 60000);
  S.maps.push(await roule(X, X.carte + ':' + (X.meteo || '')));
  for (const c of (X.chaine || '').split(',').filter(Boolean)) {
    if ((await ev('G.dbgState().gameOver')) === true) break;
    const [cc, mm, tt] = c.split(':'); await ev(`G.dbgClassique(${JSON.stringify(cc)},${JSON.stringify(mm || null)},${JSON.stringify(tt || null)})`); await ev('G.dbgPortail(320)');
    let pass = false; for (let i = 0; i < 40; i++) { await sleep(500); if ((await ev('(function(){const n=G.dbgClassique().niveau;return n&&n.carte})()')) === cc) { pass = true; break; } if ((await ev('G.dbgState().gameOver')) === true) break; }
    if (!pass) { S.maps.push({ etiq: c, alertes: [{ q: 'portail-pas-passe' }], ech: [], morts: [] }); break; }
    S.maps.push(await roule(X, c));
  }
  if (X.evalFin) S.evalFin = await ev(X.evalFin, 60000);
  S.erreurs = [...new Set(ERR)]; S.avert = [...new Set(WARN)].slice(0, 15); return S;
}
async function fin() {
  if (A.out) fs.writeFileSync(A.out, JSON.stringify(R, null, 1));
  for (const S of R.scen) {
    console.log(`\n=== ${S.nom}${S.fatal ? ' — FATAL : ' + S.fatal : ''}`);
    for (const m of S.maps) console.log(`  ${m.etiq} : ${JSON.stringify(m.resume || {})}${m.morts.length ? ' · MORT ' + JSON.stringify(m.morts[0]) : ''}${m.alertes.length ? ' · ALERTES ' + JSON.stringify(m.alertes) : ''}`);
    if (S.eval !== undefined) console.log('  eval →', JSON.stringify(S.eval).slice(0, 600));
    if (S.evalFin !== undefined) console.log('  evalFin →', JSON.stringify(S.evalFin).slice(0, 600));
    if ((S.erreurs || []).length) console.log('  ERREURS :', S.erreurs.join(' ¶ ').slice(0, 1500));
    if ((S.avert || []).length) console.log('  avert :', S.avert.join(' ¶ ').slice(0, 600));
  }
  try { ws.close(); } catch { } nettoie(); process.exit(0);
}
try { for (const X of SCEN) { if (Date.now() - t0 > LIMITE - 60000) { log('plus le temps'); break; } R.scen.push(await scenario(X)); } } catch (e) { console.log('ERREUR', e.message); }
await fin();
