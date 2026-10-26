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
await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
const ESSAI = `(function(){const sc=dbgScene(),R=sc.rdr,S=sc.scene,C=sc.cam;const W=R.domElement.width,H=R.domElement.height;
  const prise=function(){R.setRenderTarget(null);R.info.reset();R.info.autoReset=false;R.render(S,C);const t=R.info.render.triangles,a=R.info.render.calls;R.info.autoReset=true;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.drawImage(R.domElement,0,0);return {t:t,a:a,d:x.getImageData(0,0,W,H).data};};
  dbgPiste(null,true,true);const A=prise();const st=dbgPiste();const B=prise();
  let n=0,mx=0,x0=1e9,y0=1e9,x1=-1,y1=-1;for(let i=0;i<A.d.length;i+=4){const d=Math.max(Math.abs(A.d[i]-B.d[i]),Math.abs(A.d[i+1]-B.d[i+1]),Math.abs(A.d[i+2]-B.d[i+2]));if(d>2){n++;const p=i/4,x=p%W,y=(p/W)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}if(d>mx)mx=d;}
  if(n>0){const cv=document.createElement('canvas');cv.width=W;cv.height=H*2;const x=cv.getContext('2d');x.putImageData(new ImageData(new Uint8ClampedArray(A.d),W,H),0,0);x.putImageData(new ImageData(new Uint8ClampedArray(B.d),W,H),0,H);window.__diffImg=cv.toDataURL('image/jpeg',.8);}
  return JSON.stringify({lieu:dbgNiveau().lieu,niv:dbgNiveau().niveau,lod:{tri:A.t,appels:A.a},tout:{tri:B.t,appels:B.a},piste:st,pixDiff:n,pix:W*H,maxDiff:mx,boite:[x0,y0,x1,y1]});})()`;
for (let k = 0; k <= N; k++) {
  await dort(2500);
  const r = JSON.parse(await js(ESSAI));
  log(`#${k} ${r.lieu} niv${r.niv} · avec tranche moyenne ${r.lod.tri} tri / ${r.lod.appels} appels · tout entier ${r.tout.tri} tri / ${r.tout.appels} appels · moyennes ${r.piste.moyennes}/${r.piste.tranches} (pas ${r.piste.pasMoyen}) · pixels différents ${r.pixDiff}/${r.pix} (écart max ${r.maxDiff}) boîte ${r.boite}`);
  if (r.pixDiff > 0) { const u = await js('window.__diffImg'); fs.writeFileSync(path.join(ICI, 'res-app', `diff-${k}-${r.lieu}.jpg`), Buffer.from(u.split(',')[1], 'base64')); }
  if (k < N) await js(`dbgSaut();dbgAuto(1,0,{nit:1});1`);
}
tue(); process.exit(0);
