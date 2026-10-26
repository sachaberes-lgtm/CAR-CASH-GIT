// Banc du vol sur la map NUAGES : mêmes décollages, le haut du vol qui SUIT la dalle (avant) contre le haut FIGÉ au décollage (après).
// usage : node banc-vol.mjs <dossier du jeu (copie de banc)> <graine> <nbPoints> <nitro:0|1>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';

const [DOSSIER, GRAINE = '12345', NB = '24', NITRO = '0', IMP = '60', VIT = '60', PILOTE = '0', NITRO_T = '99', MAXF = '260'] = process.argv.slice(2);
const PORT_HTTP = 9871, PORT_CDP = 9872;
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

const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-vol-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${prof}`, '--mute-audio', '--no-first-run',
  '--autoplay-policy=no-user-gesture-required', '--window-size=844,390', 'about:blank'], { stdio: 'ignore', detached: true });
function fin(code) { try { process.kill(-chrome.pid); } catch {} try { srv.close(); } catch {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(code); }
process.on('SIGINT', () => fin(130)); process.on('uncaughtException', e => { console.error(e); fin(1); });
const dodo = ms => new Promise(r => setTimeout(r, ms));

async function cdp() {
  let tabs;
  for (let i = 0; i < 120; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT_CDP}/json`)).json(); if (tabs.find(t => t.type === 'page')) break; } catch {} await dodo(500); }
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const att = new Map();
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && att.has(d.id)) { const { r, j } = att.get(d.id); att.delete(d.id); d.error ? j(new Error(JSON.stringify(d.error))) : r(d.result); } };
  const send = (method, params = {}, ms = 120000) => new Promise((r, j) => { const i = ++id; att.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (att.has(i)) { att.delete(i); j(new Error('délai ' + method)); } }, ms); });
  const ev = async (expr, ms) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, ms); if (r.exceptionDetails) throw new Error('JS: ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
  return { send, ev };
}

// ---- le banc, évalué DANS la fermeture du jeu (window.__ev) ----
const BANC = `
window.__bancVol=function(cfg){
  VOLR_FIGE=!cfg.suit;
  explode=function(){};                 // le banc ne meurt pas
  const out={ok:false,ech:[]};
  // remettre la caisse sur la route, à s0, cap 0, à l'endroit
  mode='drive';bascOn=false;TBORD.t=0;TBORD.on=false;gameOver=false;
  s=cfg.s0;lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=cfg.v;vL=0;nitroR=1;
  for(let k=0;k<4;k++)window.dbgStep(1,16);
  psi=0;yawR=0;slipB=0;driftYaw=0;vA=cfg.v;vL=0;
  if(mode!=='drive'){out.err='pas au sol: '+mode;return out;}
  window.dbgAuto(true,0,{nit:0,vol:false});
  window.dbgDauphin(cfg.imp,cfg.v,0,0);
  if(cfg.pilote)window.dbgAuto(true,0,{vol:true,nit:0});else window.dbgAuto(false,0);keys.Space=!!cfg.nitro;if(!cfg.pilote)steer=0;   // en l'air : les mains libres (nitro tenue ou non)
  if(mode!=='fall'){out.err='pas décollé: '+mode;keys.Space=false;return out;}
  const p0=fallPos.clone(),v0=fallVel.clone(),u0=VOLR.on?VOLR.u.clone():new THREE.Vector3(0,1,0);
  out.vol=VOLR.on;
  // plan du vol : (v0, u0). La normale du plan = le côté. Une parabole pure reste dans ce plan.
  const plan=new THREE.Vector3().crossVectors(v0,u0).normalize();
  let gMax=0,latMax=0,n=0,posePos=null,hMax=0;
  const A=VOLR.on?VOLR.u:null;
  for(let f=0;f<cfg.maxf&&mode==='fall';f++){
    if(cfg.nitro&&f*0.016>=cfg.nitroT)keys.Space=false;
    window.dbgStep(1,16);n++;
    if(mode!=='fall')break;
    const u=VOLR.on?VOLR.u:u0;
    const g=Math.acos(Math.max(-1,Math.min(1,u.dot(u0))))*57.2958;if(g>gMax)gMax=g;
    const d=fallPos.clone().sub(p0);const la=Math.abs(d.dot(plan));if(la>latMax)latMax=la;
    const hh=d.dot(u0);if(hh>hMax)hMax=hh;
    if(f%6===0)out.ech.push([+(n*0.016).toFixed(2),+g.toFixed(1),+d.dot(plan).toFixed(1)]);
  }
  keys.Space=false;
  out.ok=true;out.frames=n;out.t=+(n*0.016).toFixed(2);out.gMax=+gMax.toFixed(1);out.latMax=+latMax.toFixed(1);out.hMax=+hMax.toFixed(1);
  out.pose=(mode==='drive');out.mode=mode;
  const d=fallPos.clone().sub(p0);out.finLat=+d.dot(plan).toFixed(1);out.dist=+d.length().toFixed(1);
  const dr=window.dbgState();out.hOff=dr.hOff;out.latOff=dr.latOff;
  if(mode==='drive'){const nl=Nn[tryLand._bi].clone().multiplyScalar(side);out.angPose=+(Math.acos(Math.max(-1,Math.min(1,(VOLR.on?VOLR.u:u0).dot(nl))))*57.2958).toFixed(1);}
  return out;};
window.__bancL=function(){return {L:L,NP:NP,tord:TORD.on,volr:VOLR_ON};};
'ok'`;

try {
  const c = await cdp();
  const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, ex: { runs: 5 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
  await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Page.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: false });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem("cashcarSave",${JSON.stringify(JSON.stringify(SAVE))})}catch(e){}` });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_HTTP}/index.html?colonne=0&simu=1&carte=nuages&meteo=midi&pistegraine=${GRAINE}` });
  for (let i = 0; i < 240; i++) { await dodo(500); try { if (await c.ev(`typeof dbgState==='function'&&typeof __ev==='function'&&!!document.querySelector('[data-m="play"]')`)) break; } catch {} }
  await dodo(1500);
  await c.ev(`document.querySelector('[data-m="play"]').click()`);
  for (let i = 0; i < 240; i++) { await dodo(500); try { if (await c.ev(`(function(){var s=dbgState();return s.started&&!s.gameOver})()`)) break; } catch {} }
  console.log('course lancée', await c.ev(`JSON.stringify(dbgState()).slice(0,200)`));
  console.log(await c.ev(`__ev(${JSON.stringify(BANC)})`));
  await c.ev(`dbgAuto(true,0)`);
  await dodo(1500);
  const info = await c.ev(`JSON.stringify(__ev("__bancL()"))`);
  console.log('piste', info);
  const L = JSON.parse(info).L;
  const nb = +NB;
  const res = [];
  for (let k = 0; k < nb; k++) {
    const s0 = Math.round(300 + (L - 700) * (k + 0.5) / nb);
    const ligne = { s0 };
    for (const suit of [true, false]) {
      const cfg = { s0, v: +VIT, imp: +IMP, nitro: NITRO === '1', suit, pilote: PILOTE === '1', nitroT: +NITRO_T, maxf: +MAXF };
      let r;
      try { r = JSON.parse(await c.ev(`JSON.stringify(__ev("__bancVol(${JSON.stringify(cfg).replace(/"/g, '\\"')})"))`, 120000)); }
      catch (e) { r = { err: String(e.message).slice(0, 200) }; }
      ligne[suit ? 'avant' : 'apres'] = r;
    }
    res.push(ligne);
    const a = ligne.avant, b = ligne.apres;
    const fmt = r => r.err ? 'ERR ' + r.err : `t=${r.t}s pose=${r.pose ? 'oui' : 'non'} u-tourne=${r.gMax}° lateral=${r.latMax}m fin=${r.finLat}m angle-pose=${r.angPose ?? '-'}°`;
    console.log(`s=${s0}\n   avant (suit la dalle): ${fmt(a)}\n   après (figé)         : ${fmt(b)}`);
  }
  fs.writeFileSync(path.join(path.dirname(DOSSIER), `res-${GRAINE}-n${NITRO}-i${IMP}-p${PILOTE}-t${NITRO_T}.json`), JSON.stringify(res));
  const err = await c.ev(`JSON.stringify({loopErr:window.__loopErr||null,banqErr:window.__banqErr||null})`);
  console.log('erreurs jeu', err);
  const moy = (xs) => xs.length ? +(xs.reduce((p, q) => p + q, 0) / xs.length).toFixed(2) : null;
  const med = (xs) => { xs = xs.slice().sort((p, q) => p - q); return xs.length ? xs[Math.floor(xs.length / 2)] : null; };
  for (const cle of ['avant', 'apres']) {
    const ok = res.map(l => l[cle]).filter(r => r && r.ok);
    const ap = ok.filter(r => r.angPose != null).map(r => r.angPose);
    console.log(cle, 'angle haut-du-vol / route à la pose: méd', med(ap), 'max', ap.length ? Math.max(...ap) : null);
    console.log(cle, `n=${ok.length}`, 'posés', ok.filter(r => r.pose).length, '· u tourne méd', med(ok.map(r => r.gMax)), 'max', Math.max(...ok.map(r => r.gMax)),
      '· écart latéral méd', med(ok.map(r => r.latMax)), 'max', Math.max(...ok.map(r => r.latMax)), '· durée méd', med(ok.map(r => r.t)));
  }
  fin(0);
} catch (e) { console.error('ÉCHEC', e); fin(1); }
