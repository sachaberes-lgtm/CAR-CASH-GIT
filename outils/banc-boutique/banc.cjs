// Banc interactif de la boutique : sert le jeu, garde un Chrome headless ouvert, et se pilote par HTTP (curl).
//   node banc.cjs <dossier VERSION PRINCIPALE> <port http> <port cdp> <port controle> [largeur hauteur]
//   POST /ev        corps = expression JS  -> valeur JSON
//   GET  /shot?f=c:/x.png[&clip=x,y,w,h]   -> photo
//   GET  /tap?sel=css&fx=.5&fy=.5          -> toucher
//   GET  /load      recharge la page (sauvegarde muette)
//   GET  /err       erreurs JS vues
const http = require('http'), fs = require('fs'), path = require('path');
const BT = require('path').join(__dirname, '..', 'banc-trainees', 'cdp.cjs');
const { serveur, lanceChrome, tueChrome, CDP, dormir, tmp } = require(BT);
const [JEU0, PH, PC, PK, WW, HH] = process.argv.slice(2);
const JEU = path.resolve(JEU0), W = +(WW || 390), H = +(HH || 844);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = process.env.SAVE ? JSON.parse(process.env.SAVE) : { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 4850000, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3, 7, 12], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const Q = process.env.Q || '';
(async () => {
  const srv = await serveur(JEU, +PH);
  const { ch, pg } = await lanceChrome(+PC, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 400)); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (_) {} });
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("bancSem")){localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');sessionStorage.setItem("bancSem","1")}else{var d=JSON.parse(localStorage.getItem("cashcarSave")||"{}");d.sfx=false;d.mus=false;d.vox=false;localStorage.setItem("cashcarSave",JSON.stringify(d))}}catch(e){}' });
  const URL = `http://127.0.0.1:${PH}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0${Q}`;
  const charge = async () => { await c.send('Page.navigate', { url: URL });
    for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) break; } catch (e) {} } };
  await charge();
  const tap = async (sel, fx, fy) => { const r = await c.ev(`(function(){const s=${JSON.stringify(sel)}.split(',');for(const q of s){const e=document.querySelector(q);if(!e)continue;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy},q]}return null})()`);
    if (!r) return 'introuvable : ' + sel;
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r; };
  http.createServer(async (rq, rs) => {
    const u = new globalThis.URL(rq.url, 'http://x'); let corps = '';
    rq.on('data', d => corps += d); await new Promise(r => rq.on('end', r));
    const fin = (v) => { rs.writeHead(200, { 'Content-Type': 'application/json' }); rs.end(JSON.stringify(v)); };
    try {
      if (u.pathname === '/ev') return fin(await c.ev(corps, 90000));
      if (u.pathname === '/shot') { const p = { format: 'png' }; if (u.searchParams.get('clip')) { const [x, y, w, h] = u.searchParams.get('clip').split(',').map(Number); p.clip = { x, y, width: w, height: h, scale: 1 }; }
        const sh = await c.send('Page.captureScreenshot', p, 30000); fs.writeFileSync(u.searchParams.get('f'), Buffer.from(sh.data, 'base64')); return fin('ok'); }
      if (u.pathname === '/tap') return fin(await tap(u.searchParams.get('sel'), u.searchParams.get('fx') == null ? null : +u.searchParams.get('fx'), u.searchParams.get('fy') == null ? null : +u.searchParams.get('fy')));
      if (u.pathname === '/tapxy') { const x = +u.searchParams.get('x'), y = +u.searchParams.get('y');
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return fin('ok'); }
      if (u.pathname === '/load') { erreurs.length = 0; await charge(); return fin('ok'); }
      if (u.pathname === '/err') return fin(erreurs);
      if (u.pathname === '/quit') { fin('bye'); tueChrome(ch); setTimeout(() => process.exit(0), 100); return; }
      fin('?');
    } catch (e) { rs.writeHead(500); rs.end(String(e)); }
  }).listen(+PK, '127.0.0.1', () => console.log('banc prêt', PK));
})().catch(e => { console.error(e); process.exit(1); });
