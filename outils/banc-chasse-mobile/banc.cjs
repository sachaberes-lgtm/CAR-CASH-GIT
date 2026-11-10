/* ===== LE BANC DE LA CHASSE MOBILE (2026-11-10, chasse aux bugs mobile : « portrait ET paysage, tactile ») =====
   Un Chrome sans fenêtre et MUET, émulé en iPhone (agent Safari iOS, tactile 5 doigts, densité 3, encoche par setSafeAreaInsetsOverride),
   qui reste ouvert et se pilote par HTTP (curl) : on enchaîne les scénarios sans relancer Chrome ni perdre les réglages d'émulation.
   node outils/banc-chasse-mobile/banc.cjs [--http 9841] [--cdp 9842] [--ctl 9843] [--w 390] [--h 844] [--jeu "<dossier>"]
   Commandes (GET http://127.0.0.1:<ctl>/…) :
     /ouvre?q=<requête>&neuf=1   charge index.html?<q> (neuf=1 : sauvegarde neuve son coupé, tuto/permis passés)
     /ev   (POST, corps = JS)    évalue dans la page (await permis), rend la valeur JSON
     /tap?x=&y=                  un toucher ; /tient?x=&y=&ms=&x2=&y2= glisser d'un doigt ; /deux?… deux doigts (joystick + nitro)
     /taille?w=&h=               tourne / redimensionne (encoche suivie : haut en portrait, côtés en paysage) + orientationchange
     /cache?ms=                  arrière-plan simulé (visibilitychange hidden, pagehide, blur) puis retour
     /photo?f=<chemin.png>       capture ; /journal relève (et vide) exceptions, console.error/warn, requêtes en échec
     /fin                        ferme tout */
const path = require('path'), fs = require('fs'), http = require('http'), cp = require('child_process'), os = require('os');
const { serveur, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9841), P_CDP = +(A.cdp || 9842), P_CTL = +(A.ctl || 9843);
let W = +(A.w || 390), H = +(A.h || 844);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const ENC = { haut: 47, bas: 34, cote: 47 }; /* iPhone 13 Pro : 47 pt d'encoche, 34 pt de barre d'accueil */
const rel = { exceptions: [], erreurs: [], avert: [], reseau: [] };

(async () => {
  const srv = await serveur(JEU, P_HTTP);
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'chasse-mobile-'));
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const o = c.ws.onmessage; c.ws.onmessage = e => { o(e); try { const m = JSON.parse(e.data); const p = m.params || {};
    if (m.method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails || {}; rel.exceptions.push(((d.exception && d.exception.description) || d.text || '?').split('\n').slice(0, 3).join(' | ').slice(0, 500) + ' @' + String(d.url || '').split('/').pop().split('?')[0] + ':' + d.lineNumber + ':' + d.columnNumber); }
    else if (m.method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) (p.type === 'error' ? rel.erreurs : rel.avert).push((p.args || []).map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
    else if (m.method === 'Network.loadingFailed' && !/ERR_ABORTED/.test(p.errorText)) rel.reseau.push(p.errorText + ' ' + (rel._u && rel._u[p.requestId] || p.requestId));
    else if (m.method === 'Network.requestWillBeSent') { (rel._u = rel._u || {})[p.requestId] = p.request.url.replace(/^http:\/\/127\.0\.0\.1:\d+\//, ''); }
    else if (m.method === 'Network.responseReceived' && p.response.status >= 400) rel.reseau.push(p.response.status + ' ' + p.response.url.replace(/^http:\/\/127\.0\.0\.1:\d+\//, ''));
  } catch (x) {} };
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true });
  await c.send('Network.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const metrics = async () => {
    const portrait = H > W;
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true,
      screenOrientation: portrait ? { type: 'portraitPrimary', angle: 0 } : { type: 'landscapePrimary', angle: 90 } });
    try { await c.send('Emulation.setSafeAreaInsetsOverride', { insets: portrait ? { top: ENC.haut, bottom: ENC.bas, left: 0, right: 0 } : { top: 0, bottom: 21, left: ENC.cote, right: ENC.cote } }); } catch (e) { rel.avert.push('[banc] pas de setSafeAreaInsetsOverride : ' + e.message.slice(0, 80)); }
  };
  await metrics();
  const ev = (js, ms) => c.ev(js, ms);
  const doigt = (type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: p[2] != null ? p[2] : i, radiusX: 8, radiusY: 8, force: 1 })) });
  const ctl = http.createServer(async (rq, rs) => {
    const u = new URL(rq.url, 'http://x'), q = Object.fromEntries(u.searchParams); let corps = '';
    rq.on('data', d => corps += d); await new Promise(r => rq.on('end', r));
    const fini = (v) => { rs.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); rs.end(JSON.stringify(v === undefined ? null : v, null, 1)); };
    try {
      switch (u.pathname) {
        case '/ouvre': {
          if (q.neuf) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!sessionStorage.__cm){sessionStorage.__cm=1;localStorage.clear();localStorage.cashcarSave=JSON.stringify(${q.save || '{v:2,tuto:1,permis:1,bienv:1,facile:0,sfx:false,mus:false,vox:false}'});}}catch(e){}` });
          await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html${q.q ? '?' + q.q : ''}` });
          const t0 = Date.now(); let pret = false;
          for (let i = 0; i < 240 && !pret; i++) { await dormir(500); pret = await ev('!!window.__gameReady').catch(() => false); }
          return fini({ pret, s: (Date.now() - t0) / 1000 });
        }
        case '/ev': return fini(await ev(`(async()=>{${corps.includes('return') ? corps : 'return (' + corps + ')'}})()`, +(q.ms || 60000)));
        case '/tap': { const x = +q.x, y = +q.y; await doigt('touchStart', [[x, y]]); await dormir(+(q.ms || 70)); await doigt('touchEnd', []); return fini('ok'); }
        case '/tient': { /* un doigt posé en x,y, glissé vers x2,y2 en n pas, tenu ms */
          const x = +q.x, y = +q.y, x2 = q.x2 != null ? +q.x2 : x, y2 = q.y2 != null ? +q.y2 : y, n = +(q.n || 8), ms = +(q.ms || 600);
          await doigt('touchStart', [[x, y]]); for (let i = 1; i <= n; i++) { await dormir(ms / n); await doigt('touchMove', [[x + (x2 - x) * i / n, y + (y2 - y) * i / n]]); }
          if (!q.garde) await doigt('touchEnd', []); return fini('ok'); }
        case '/deux': { /* doigt A tenu (joystick), doigt B tape/tient (nitro) pendant ms */
          const a = [+q.ax, +q.ay, 0], b = [+q.bx, +q.by, 1], ms = +(q.ms || 1500);
          await doigt('touchStart', [a]); await dormir(150); await doigt('touchMove', [[a[0] + (+q.dx || 0), a[1], 0]]);
          await dormir(150); await doigt('touchStart', [[a[0] + (+q.dx || 0), a[1], 0], b]); await dormir(ms);
          await doigt('touchEnd', [[a[0] + (+q.dx || 0), a[1], 0]]); await dormir(150); await doigt('touchEnd', []); return fini('ok'); }
        case '/taille': { W = +q.w; H = +q.h; await metrics(); await ev(`(function(){try{window.dispatchEvent(new Event('orientationchange'));}catch(e){}return 1})()`); return fini({ W, H }); }
        case '/cache': {
          const ms = +(q.ms || 2000);
          await ev(`(function(){window.__visOrig=window.__visOrig||Object.getOwnPropertyDescriptor(Document.prototype,'visibilityState');Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('blur'));window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));return 1})()`);
          if (q.gel) await c.send('Page.setWebLifecycleState', { state: 'frozen' });
          await dormir(ms);
          if (q.gel) await c.send('Page.setWebLifecycleState', { state: 'active' });
          await ev(`(function(){delete document.visibilityState;delete document.hidden;window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));return 1})()`);
          return fini('ok'); }
        case '/photo': { const r = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: +(q.k || 1) / 3 } }); fs.writeFileSync(q.f, Buffer.from(r.data, 'base64')); return fini(q.f); }
        case '/journal': { const v = { exceptions: rel.exceptions.splice(0), erreurs: rel.erreurs.splice(0), avert: [...new Set(rel.avert.splice(0))], reseau: [...new Set(rel.reseau.splice(0))] }; return fini(v); }
        case '/fin': fini('fin'); try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); ctl.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} process.exit(0);
        default: rs.writeHead(404); rs.end('?');
      }
    } catch (e) { fini({ ERREUR: String(e.message || e).slice(0, 800) }); }
  });
  ctl.listen(P_CTL, '127.0.0.1', () => console.log('banc prêt : http://127.0.0.1:' + P_CTL, 'jeu', P_HTTP, 'cdp', P_CDP, `${W}x${H}`));
  process.on('SIGTERM', () => { tueChrome(ch); process.exit(0); });
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
