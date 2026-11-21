/* LE BOOST SANS FLOU (2026-11-21) : une course sur l'ordinateur (Chrome headless, sans son), mise en pause, puis LA MÊME IMAGE rendue au boost plein
   avec le flou léger (Vercel) et avec le flou d'avant (uFv de l'app) — deux photos côte à côte. `--app 1` : vérifie que l'app garde le flou d'avant.
   node outils/banc-trainees/flou-boost.cjs [--app 1] [--map nuages] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('./cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9813), P_CDP = +(A.cdp || 9814), W = 1280, H = 720;
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 300)); } } catch (x) {} });
  const attend = async (expr, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(700); } return false; };
  const photo = async (nom) => { const s = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const f = path.join(__dirname, (A.app === '1' ? 'app-' : '') + (A.tel === '1' ? 'tel-' : '') + nom); fs.writeFileSync(f, Buffer.from(s.data, 'base64')); console.log('photo :', f); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (A.tel === '1') { /* le téléphone émulé, comme outils/banc-course/course.cjs */
      await c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenWidth: 844, screenHeight: 390 });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPhone' }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&simu=1&garde=1&intro=ancien&attente=0&chute=0${A.app === '1' ? '&app=1' : ''}${A.tel === '1' ? '&tel=1' : ''}` });
    console.log('prêt ?', await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000));
    await dormir(2500);
    if (A.map) console.log('map :', JSON.stringify(await c.ev("dbgClassique('" + A.map + "','matin')")).slice(0, 120));
    console.log('jouer :', String(await c.ev("typeof dbgJouer==='function'?JSON.stringify(dbgJouer()):'pas de dbgJouer'")));
    console.log('partie ?', await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 90000));
    await c.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0});1"); await dormir(9000);
    console.log('état :', String(await c.ev("JSON.stringify(dbgState())")).slice(0,200)); console.log('réglage :', await c.ev("JSON.stringify(dbgFlou({}))"));
    console.log('pause :', await c.ev("(function(){const s=dbgState();if(!s.paused&&window.__panBascule)window.__panBascule();return JSON.stringify(dbgState()).slice(0,90);})()")); await dormir(1200);
    await c.ev("(function(){const st=document.createElement('style');st.textContent='*{filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transition:none!important;animation:none!important}';document.head.appendChild(st);document.querySelectorAll('body *').forEach(e=>{if(e.tagName!=='CANVAS'&&!e.querySelector('canvas'))e.style.visibility='hidden';else{e.style.background='none';e.style.opacity='1';}});})();1");
    const fv = JSON.stringify(JSON.parse(await c.ev("JSON.stringify(dbgFlou({}))")).fv);
    console.log('net    :', await c.ev("JSON.stringify(dbgFlou({s:0}))")); await dormir(400); await photo('flou-0-net.png');
    console.log('boost  :', await c.ev("JSON.stringify(dbgFlou({s:1}))")); await dormir(400); await photo('flou-1-boost.png');
    console.log('avant  :', await c.ev("JSON.stringify(dbgFlou({s:1,fv:[.26,2.0,.8,.25]}))")); await dormir(400); await photo('flou-2-avant.png');
    await c.ev("dbgFlou({fv:" + fv + "});1");
    console.log('exceptions :', err.length ? err : 'aucune');
  } catch (e) { console.error('ERREUR :', e.message); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
})();
