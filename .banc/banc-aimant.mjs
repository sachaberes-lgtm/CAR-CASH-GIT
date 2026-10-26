// Banc de « l'aimant » sur la map NUAGES : qu'est-ce qui, en vol, ATTRAPE ou REPOUSSE la caisse près de la route ?
// usage : node banc-aimant.mjs <dossier du jeu (copie de banc)> <graine> <nbPoints> <scenario: A|B|C> [variante js évaluée avant chaque vol]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';

const [DOSSIER, GRAINE = '12345', NB = '12', SCEN = 'A', VARIANTE = '', PARAMS = '', SONDE = ''] = process.argv.slice(2);
const PORT_HTTP = 9881, PORT_CDP = 9882;
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

const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-aimant-chrome-'));
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
  const send = (method, params = {}, ms = 180000) => new Promise((r, j) => { const i = ++id; att.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (att.has(i)) { att.delete(i); j(new Error('délai ' + method)); } }, ms); });
  const ev = async (expr, ms) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, ms); if (r.exceptionDetails) throw new Error('JS: ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
  return { send, ev };
}

// ---- le banc, évalué DANS la fermeture du jeu (window.__ev) ----
const BANC = `
window.__bancAim=function(cfg){
  explode=function(){};                 // le banc ne meurt pas
  const out={ok:false};
  mode='drive';bascOn=false;TBORD.t=0;TBORD.on=false;gameOver=false;
  s=cfg.s0;lat=0;side=1;psi=0;yawR=0;slipB=0;driftYaw=0;vA=cfg.v;vL=0;nitroR=1;
  for(let k=0;k<4;k++)window.dbgStep(1,16);
  psi=0;yawR=0;slipB=0;driftYaw=0;vA=cfg.v;vL=0;
  if(mode!=='drive'){out.err='pas au sol: '+mode;return out;}
  window.__poseJ=[];
  const n0=new THREE.Vector3().copy(Nn[Math.round(s/L*(NP-1))]);
  out.roulisDep=+(Math.acos(Math.max(-1,Math.min(1,n0.y)))*57.3).toFixed(0); /* 0 = la route à l'endroit, 90 = sur la tranche, 180 = à l'envers */
  if(cfg.sc==='C'){ /* sortie par le BORD : la caisse file vers le bord, cap ouvert */
    window.dbgAuto(false,0);lat=ROAD_HALF*.97;psi=.25;steer=0;
    for(let k=0;k<40&&mode==='drive';k++)window.dbgStep(1,16);
    if(mode!=='fall'){out.err='pas sortie: '+mode;return out;}
  }else{
    window.dbgAuto(true,0,{nit:0,vol:false});
    window.dbgDauphin(cfg.imp,cfg.v,0,0);
    if(mode!=='fall'){out.err='pas décollé: '+mode;return out;}
  }
  if(cfg.pilote)window.dbgAuto(true,0,{vol:true,nit:0});else{window.dbgAuto(false,0);steer=0;}
  keys.Space=!!cfg.nitro;
  const fu=new THREE.Vector3(),cu=new THREE.Vector3(),cu0=new THREE.Vector3();
  let n=0,hMin=1e9,prevBump=0,bumps=[],dansFen=0;
  for(let f=0;f<cfg.maxf&&mode==='fall';f++){
    if(cfg.nitro&&f*0.016>=cfg.nitroT)keys.Space=false;
    fu.copy(FLY_U);cu.copy(camera.up);
    window.dbgStep(1,16);n++;
    if(bounceN>prevBump){prevBump=bounceN;bumps.push(+(n*0.016).toFixed(2));}
    if(mode!=='fall')break;
    if(curNear&&Math.abs(curLatOff)<ROAD_HALF){const hh=curHOff;if(hh>-THICK-3&&hh<3)dansFen++;}
  }
  keys.Space=false;
  out.ok=true;out.t=+(n*0.016).toFixed(2);out.bumps=bumps;out.pose=(mode==='drive');
  if(out.pose){
    const j=window.__poseJ[window.__poseJ.length-1]||{};
    out.h=j.h;out.hAvant=j.hAvant;out.vN=j.vN;out.face=j.face;
    const bi=tryLand._bi,nl=new THREE.Vector3().copy(Nn[bi]).multiplyScalar(side);
    out.ecartHaut=+(Math.acos(Math.max(-1,Math.min(1,fu.dot(nl))))*57.3).toFixed(0); /* le haut de la caisse en vol / la route où elle est posée */
    cu0.copy(cu);
    for(let k=0;k<30;k++)window.dbgStep(1,16);
    out.camTourne=+(Math.acos(Math.max(-1,Math.min(1,cu0.dot(camera.up))))*57.3).toFixed(0); /* l'écran qui tourne dans la 1/2 s après la pose */
  }
  out.mode=mode;
  return out;};
window.__bancL=function(){return {L:L,NP:NP,tord:TORD.on,RH:ROAD_HALF};};
'ok'`;

try {
  const c = await cdp();
  const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, ex: { runs: 5 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
  await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Page.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: false });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem("cashcarSave",${JSON.stringify(JSON.stringify(SAVE))})}catch(e){}` });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_HTTP}/index.html?colonne=0&simu=1&carte=nuages&meteo=midi&pistegraine=${GRAINE}${PARAMS ? '&' + PARAMS : ''}` });
  for (let i = 0; i < 240; i++) { await dodo(500); try { if (await c.ev(`typeof dbgState==='function'&&typeof __ev==='function'&&!!document.querySelector('[data-m="play"]')`)) break; } catch {} }
  await dodo(1500);
  await c.ev(`document.querySelector('[data-m="play"]').click()`);
  for (let i = 0; i < 240; i++) { await dodo(500); try { if (await c.ev(`(function(){var s=dbgState();return s.started&&!s.gameOver})()`)) break; } catch {} }
  console.log(await c.ev(`__ev(${JSON.stringify(BANC)})`));
  if (VARIANTE) console.log('variante', await c.ev(`String(__ev(${JSON.stringify(VARIANTE)}))`));
  await c.ev(`dbgAuto(true,0)`);
  await dodo(1500);
  const info = JSON.parse(await c.ev(`JSON.stringify(__ev("__bancL()"))`));
  console.log('piste', JSON.stringify(info));
  if (SONDE) { console.log(await c.ev(`JSON.stringify(__ev(${JSON.stringify(fs.readFileSync(SONDE,'utf8'))}))`, 600000)); fin(0); }
  const L = info.L, nb = +NB, res = [];
  const SC = { A: { imp: 21, v: 60, nitro: true, nitroT: 2.5, pilote: true }, B: { imp: 21, v: 60, nitro: true, nitroT: 2.5, pilote: false },
    C: { v: 60, nitro: false, pilote: true }, D: { imp: 21, v: 60, nitro: false, pilote: true }, E: { imp: 35, v: 80, nitro: true, nitroT: 4, pilote: true } }[SCEN];
  for (let k = 0; k < nb; k++) {
    const s0 = Math.round(300 + (L - 900) * (k + 0.5) / nb);
    const cfg = Object.assign({ s0, sc: SCEN, maxf: 330 }, SC);
    let r;
    try { r = JSON.parse(await c.ev(`JSON.stringify(__ev("__bancAim(${JSON.stringify(cfg).replace(/"/g, '\\"')})"))`, 180000)); }
    catch (e) { r = { err: String(e.message).slice(0, 200) }; }
    r.s0 = s0; res.push(r);
    console.log(r.err ? `s=${s0} ERR ${r.err}` : `s=${s0} route ${r.roulisDep}° · vol ${r.t}s · ${r.pose ? `POSÉ face ${r.face} à h=${r.h} m (image d'avant ${r.hAvant}) vN=${r.vN} · haut caisse/route ${r.ecartHaut}° · écran tourne ${r.camTourne}°` : 'pas posé (' + r.mode + ')'}${r.bumps.length ? ' · BUMP à ' + r.bumps.join(',') + ' s' : ''}`);
  }
  fs.writeFileSync(path.join(path.dirname(DOSSIER), `aim-${SCEN}-${GRAINE}${VARIANTE ? '-var' : ''}${PARAMS ? '-' + PARAMS.replace(/[^a-z0-9]/gi, '') : ''}.json`), JSON.stringify(res));
  const err = await c.ev(`JSON.stringify({loopErr:window.__loopErr||null,banqErr:window.__banqErr||null})`);
  console.log('erreurs jeu', err);
  const ok = res.filter(r => r.ok), po = ok.filter(r => r.pose);
  const med = (xs) => { xs = xs.slice().sort((p, q) => p - q); return xs.length ? xs[Math.floor(xs.length / 2)] : null; };
  console.log(`RÉSUMÉ ${SCEN} graine ${GRAINE} : ${ok.length} vols, ${po.length} posés · pris de loin (h>1,5 m) ${po.filter(r => r.h > 1.5).length} · sans approcher (vN>-1) ${po.filter(r => r.vN > -1).length} · haut caisse/route >30° ${po.filter(r => r.ecartHaut > 30).length} (méd ${med(po.map(r => r.ecartHaut))}°) · écran tourne >30° ${po.filter(r => r.camTourne > 30).length} (méd ${med(po.map(r => r.camTourne))}°) · vols avec BUMP ${ok.filter(r => r.bumps.length).length}`);
  fin(0);
} catch (e) { console.error('ÉCHEC', e); fin(1); }
