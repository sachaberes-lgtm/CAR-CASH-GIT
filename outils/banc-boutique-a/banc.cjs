// Banc de la boutique version A : UN Chrome headless, piloté par HTTP, qui change de format à la volée.
//   node bancA.cjs <dossier VERSION PRINCIPALE> <port http> <port cdp> <port contrôle>
//   POST /ev                      corps = expression JS -> valeur JSON
//   GET  /shot?f=c:/x.png         photo PNG ; &jpg=85 = JPEG
//   GET  /tap?sel=css&fx=.5&fy=.5 toucher
//   GET  /tapxy?x=&y=             toucher à un point
//   GET  /drag?x1=&y1=&x2=&y2=&ms=300   glisser tactile
//   GET  /key?code=ArrowRight     touche du clavier
//   GET  /size?w=&h=&mob=1        change le format (tactile iPhone si mob=1, sinon souris d'ordinateur)
//   GET  /load                    recharge la page
//   GET  /err                     erreurs JS vues ; /errz les vide
const http = require('http'), fs = require('fs'), path = require('path');
const BT = path.join(__dirname, '..', 'banc-trainees', 'cdp.cjs');
const { serveur, lanceChrome, tueChrome, CDP, dormir, tmp } = require(BT);
const [JEU0, PH, PC, PK] = process.argv.slice(2);
const JEU = path.resolve(JEU0);
let W = 393, H = 852;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SON = process.env.SON === '1'; /* SON=1 : les bruitages sont ALLUMÉS dans la page (Chrome est lancé avec --mute-audio : rien ne sort), pour compter ce que chaque geste joue */
const SAVE = { v: 2, sfx: SON, mus: false, vox: false, tuto: 1, permis: 1, bank: +(process.env.BANK||4850000), aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3, 7, 12], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const Q = process.env.Q || '';
(async () => {
  await serveur(JEU, +PH);
  const { ch, pg } = await lanceChrome(+PC, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 400)); if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) erreurs.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (_) {} });
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  const format = async (w, h, mob) => { W = w; H = h;
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: !!mob, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: !!mob, maxTouchPoints: mob ? 5 : 0 });
    if (mob) { await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' }); await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] }); } };
  await format(W, H, 1);
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("bancSem")){localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');sessionStorage.setItem("bancSem","1")}else{var d=JSON.parse(localStorage.getItem("cashcarSave")||"{}");d.sfx='+SON+';d.mus=false;d.vox=false;localStorage.setItem("cashcarSave",JSON.stringify(d))}}catch(e){}' });
  const URL = `http://127.0.0.1:${PH}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0${Q}`;
  const charge = async () => { await c.send('Page.navigate', { url: URL });
    for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) break; } catch (e) {} } };
  await charge();
  const touche = async (x, y) => { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async (sel, fx, fy) => { const r = await c.ev(`(function(){const s=${JSON.stringify(sel)}.split(',');for(const q of s){const e=document.querySelector(q);if(!e)continue;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy},q]}return null})()`);
    if (!r) return 'introuvable : ' + sel; await touche(r[0], r[1]); return r; };
  http.createServer(async (rq, rs) => {
    const u = new globalThis.URL(rq.url, 'http://x'); let corps = ''; const g = k => u.searchParams.get(k);
    rq.on('data', d => corps += d); await new Promise(r => rq.on('end', r));
    const fin = (v) => { rs.writeHead(200, { 'Content-Type': 'application/json' }); rs.end(JSON.stringify(v)); };
    try {
      if (u.pathname === '/ev') return fin(await c.ev(corps, 90000));
      if (u.pathname === '/shot') { const p = g('jpg') ? { format: 'jpeg', quality: +g('jpg') } : { format: 'png' };
        const sh = await c.send('Page.captureScreenshot', p, 30000); fs.writeFileSync(g('f'), Buffer.from(sh.data, 'base64')); return fin('ok'); }
      if (u.pathname === '/tap') return fin(await tap(g('sel'), g('fx') == null ? null : +g('fx'), g('fy') == null ? null : +g('fy')));
      if (u.pathname === '/tapxy') { await touche(+g('x'), +g('y')); return fin('ok'); }
      if (u.pathname === '/drag') { const x1 = +g('x1'), y1 = +g('y1'), x2 = +g('x2'), y2 = +g('y2'), ms = +(g('ms') || 300), N = 12;
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] });
        for (let i = 1; i <= N; i++) { await dormir(ms / N); await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / N, y: y1 + (y2 - y1) * i / N }] }); }
        await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return fin('ok'); }
      if (u.pathname === '/key') { const code = g('code'), key = g('key') || code;
        await c.send('Input.dispatchKeyEvent', { type: 'keyDown', code, key, windowsVirtualKeyCode: code === 'ArrowLeft' ? 37 : code === 'ArrowRight' ? 39 : code === 'Escape' ? 27 : code === 'Enter' ? 13 : 0 });
        await c.send('Input.dispatchKeyEvent', { type: 'keyUp', code, key }); return fin('ok'); }
      if (u.pathname === '/size') { await format(+g('w'), +g('h'), g('mob') !== '0'); return fin([W, H]); }
      if (u.pathname === '/cpu') { await c.send('Emulation.setCPUThrottlingRate', { rate: +(g('x') || 1) }); return fin(+(g('x') || 1)); }
      if (u.pathname === '/load') { erreurs.length = 0; await charge(); return fin('ok'); }
      if (u.pathname === '/err') return fin(erreurs);
      if (u.pathname === '/errz') { erreurs.length = 0; return fin('ok'); }
      if (u.pathname === '/quit') { fin('bye'); tueChrome(ch); setTimeout(() => process.exit(0), 100); return; }
      fin('?');
    } catch (e) { rs.writeHead(500); rs.end(String(e)); }
  }).listen(+PK, '127.0.0.1', () => console.log('banc prêt', PK));
})().catch(e => { console.error(e); process.exit(1); });
