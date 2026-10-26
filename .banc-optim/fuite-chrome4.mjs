// LA FUITE D'UNE MAP À L'AUTRE, dans Chrome sans fenêtre (le compte ne dépend pas de l'appareil) — À LANCER SOUS LE VERROU :
//   /Users/sachaberes/cash-car/verrou-banc.sh prendre "optim-mobile" ; node fuite-chrome.mjs [n=10] ; verrou-banc.sh rendre
// Chaque BufferGeometry est inscrite à sa création (pile d'appel), rayée à son dispose() ; après chaque portail (dbgSaut) on range :
// vivantes DANS la scène / ORPHELINES (ni dans la scène, ni rendues), par lieu de création, et les triangles visibles par lieu de création.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const N = +(process.argv[2] || 10);
const ICI = path.dirname(new URL(import.meta.url).pathname);
const VP = process.env.VP || '/Users/sachaberes/cash-car/optim-mobile/VERSION PRINCIPALE';
const PH = 8961, PC = 9361;
const dort = (ms) => new Promise((r) => setTimeout(r, ms));
const t0 = Date.now(); const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(6) + 's', ...a);
async function libre(p) { try { await fetch(`http://127.0.0.1:${p}/`, { signal: AbortSignal.timeout(800) }); return false; } catch { return true; } }
if (!(await libre(PH)) || !(await libre(PC))) { console.error('port pris'); process.exit(2); }
const srv = spawn('/usr/bin/python3', ['-m', 'http.server', String(PH), '--bind', '127.0.0.1'], { cwd: VP, detached: true, stdio: 'ignore' });
const profil = path.join(ICI, 'profil-' + PC); fs.rmSync(profil, { recursive: true, force: true });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PC}`, `--user-data-dir=${profil}`, '--window-size=390,844', '--force-device-scale-factor=2', '--no-first-run', '--no-default-browser-check',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { detached: true, stdio: 'ignore' });
const tue = () => { for (const p of [chrome, srv]) try { process.kill(-p.pid, 'SIGKILL'); } catch {} };
process.on('exit', tue); process.on('SIGINT', () => { tue(); process.exit(1); }); process.on('uncaughtException', (e) => { console.error(e); tue(); process.exit(1); });
setTimeout(() => { console.error('banc trop long : arrêt'); tue(); process.exit(3); }, 9 * 60 * 1000).unref();
let cible = null;
for (let i = 0; i < 120 && !cible; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PC}/json/list`)).json(); cible = l.find((t) => t.type === 'page'); } catch {} if (!cible) await dort(500); }
const ws = new WebSocket(cible.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nid = 0; const att = new Map();
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && att.has(d.id)) { const { r, j } = att.get(d.id); att.delete(d.id); d.error ? j(new Error(JSON.stringify(d.error))) : r(d.result); } });
const cdp = (method, params = {}, ms = 120000) => new Promise((r, j) => { const id = ++nid; att.set(id, { r, j }); ws.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (att.has(id)) { att.delete(id); j(new Error('délai ' + method)); } }, ms); });
const js = async (e, ms) => { const r = await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }, ms); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
await cdp('Page.enable'); await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const SAUV = JSON.parse(JSON.parse(fs.readFileSync(path.join(ICI, 'sauvegarde-app-sacha.json'), 'utf8'))).ls;
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
try{if(!sessionStorage.__fu){sessionStorage.__fu=1;localStorage.setItem('cashcarSave',${JSON.stringify(SAUV)});}}catch(e){}
(function(){var T;function patch(TH){var B=TH.BufferGeometry&&TH.BufferGeometry.prototype;if(!B||B.__fu)return;B.__fu=1;
  var REG=window.__GEO=new Map();var sa=B.setAttribute,di=B.dispose,six=B.setIndex;
  var ou=function(){var s=(new Error()).stack.split('\\n').slice(3).map(function(l){var m=/at (?:new )?([\\w$.<>]+)/.exec(l);return m?m[1]:'?';}).filter(function(n){return !/^(BufferGeometry|Object|Array|Function|three|\\?|e|t|n|r|i|o|a|s)$/.test(n)&&!/^THREE|Geometry$/.test(n);}).slice(0,3).join(' < ');return s||'?';};
  B.setAttribute=function(n,a){if(!this.__fuR){this.__fuR=1;REG.set(this,{ou:ou(),t:performance.now()});}return sa.apply(this,arguments);};
  B.dispose=function(){REG.delete(this);return di.apply(this,arguments);};}
 Object.defineProperty(window,'THREE',{configurable:true,get:function(){return T;},set:function(v){T=v;queueMicrotask(function(){patch(T);});setTimeout(function(){patch(T);},0);}});})();
` });
await cdp('Page.navigate', { url: `http://127.0.0.1:${PH}/?muet=1&garde=1&colonne=0&carte=nuages&meteo=midi&palier=2` });
for (let i = 0; i < 240; i++) { try { if (await js('!!window.__gameReady&&!!window.dbgState', 5000)) break; } catch {} await dort(500); }
log('prêt', await js('JSON.stringify({geo:window.__GEO?window.__GEO.size:"pas de registre",pal:dbgPalier().src})'));
for (let i = 0; i < 25; i++) { const sp = await js(`(function(){var s=document.getElementById('splash');if(!s)return false;['pointerdown','pointerup','click'].forEach(function(t){s.dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:195,clientY:422}));});return true;})()`); if (!sp) break; await dort(800); }
await dort(8000);
await js(`(function(){var b=[...document.querySelectorAll('[data-m="play"]')].find(function(e){return e.getClientRects().length});if(b)b.click();dbgAuto(1,0,{nit:1});return !!b;})()`);
for (let i = 0; i < 60; i++) { if (await js(`document.body.classList.contains('play')`)) break; await dort(250); }
await js('dbgAuto(1,0,{nit:1});1');
const BILAN = `(function(){var sc=dbgScene(),dans=new Set();sc.scene.traverse(function(o){if(o.geometry)dans.add(o.geometry);});var orph={},no=0;window.__GEO.forEach(function(r,g){if(!dans.has(g)){no++;orph[r.ou]=(orph[r.ou]||0)+1;}});
  var ri=sc.rdr.info;return JSON.stringify({lieu:dbgNiveau().lieu,gpuGeo:ri.memory.geometries,gpuTex:ri.memory.textures,registre:window.__GEO.size,dansScene:dans.size,orphelines:no,orph:orph});})()`;
const L = [];
for (let k = 0; k <= N; k++) {
  await dort(4000);
  const b = JSON.parse(await js(BILAN)); L.push(b);
  log(`#${k} partie ${k + 1} · ${b.lieu} · gpuGeo ${b.gpuGeo} gpuTex ${b.gpuTex} · registre ${b.registre} · dans la scène ${b.dansScene} · ORPHELINES ${b.orphelines}`);
  if (k === N) break;
  await js(`dbgAuto(0);dbgBord({lat:400,vL:80});1`);
  for (let i = 0; i < 60; i++) { await dort(500); if (await js('dbgState().gameOver')) break; }
  await dort(3000);
  await js(`dbgEco('rejouer');1`);
  for (let i = 0; i < 60; i++) { await dort(250); const e = await js('JSON.stringify(dbgState())').then(JSON.parse); if (e.started && !e.gameOver) break; }
  await js('dbgAuto(1,0,{nit:1});1');
}
const a = L[1] || L[0], z = L[L.length - 1];
console.log('-- ORPHELINES qui grandissent de la partie 2 à la dernière, par lieu de création :');
const ks = new Set([...Object.keys(a.orph), ...Object.keys(z.orph)]);
[...ks].map((k) => [k, (z.orph[k] || 0) - (a.orph[k] || 0), z.orph[k] || 0]).filter((x) => x[1] > 0).sort((x, y) => y[1] - x[1]).slice(0, 25).forEach(([k, d, n]) => console.log(String(d).padStart(5), '(', n, ')', k));
tue(); process.exit(0);
