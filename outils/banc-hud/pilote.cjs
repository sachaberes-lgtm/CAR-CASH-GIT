// LE PILOTE (2026-11-10) : lance le vrai jeu dans un Chrome sans fenêtre, le met EN COURSE, puis reste ouvert et répond à de petites commandes HTTP
// (le démarrage à froid dure ~1 min : on ne le paie qu'une fois).
//   node outils/banc-hud/pilote.cjs [--fmt debout|couche] [--q "x=1"] [--prof /chemin] [--http 9771 --cdp 9772 --cmd 9773]
//   curl -s --data-binary 'dbgState().started' localhost:9773/ev        → évalue du JS dans la page
//   curl -s 'localhost:9773/shot?nom=/chemin/a.png[&clip=x,y,w,h]'       → photo (png)
//   curl -s 'localhost:9773/touch?type=start|move|end&x=300&y=700&id=1'   → un doigt (Input.dispatchTouchEvent)
//   curl -s localhost:9773/reload                                          → recharge et remet en course
//   curl -s localhost:9773/fin                                             → ferme tout
const fs = require('fs'), path = require('path'), http = require('http');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const PROF = path.resolve(A.prof || '/tmp/pilote-nitro-profil');
const P_HTTP = +(A.http || 9771), P_CDP = +(A.cdp || 9772), P_CMD = +(A.cmd || 9773);
const FORMATS = { debout: [390, 844], couche: [844, 390] }; const [W, H] = FORMATS[A.fmt || 'debout'];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

(async () => {
  for (const p of [P_HTTP, P_CDP, P_CMD]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });

  async function lance() {
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2500);
    for (let i = 0; i < 240; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } /* JOUER est refusé tant que la chute d'accueil dure : on le rappelle toutes les 8 s */ await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) return true; } catch (e) {} }
    return false;
  }
  const lu = rq => new Promise(r => { let b = ''; rq.on('data', d => b += d); rq.on('end', () => r(b)); });
  const cmd = http.createServer(async (rq, rs) => {
    const u = new URL(rq.url, 'http://x'); let out = '';
    try {
      if (u.pathname === '/ev') out = JSON.stringify(await c.ev(await lu(rq), 60000));
      else if (u.pathname === '/shot') { const o = { format: 'png' }; const cl = u.searchParams.get('clip');
        if (cl) { const [x, y, w, h] = cl.split(',').map(Number); o.clip = { x, y, width: w, height: h, scale: +(u.searchParams.get('scale') || 1) }; }
        const sh = await c.send('Page.captureScreenshot', o, 30000); fs.writeFileSync(u.searchParams.get('nom'), Buffer.from(sh.data, 'base64')); out = 'ok'; }
      else if (u.pathname === '/touch') { const t = u.searchParams.get('type'), x = +u.searchParams.get('x'), y = +u.searchParams.get('y'), id = +(u.searchParams.get('id') || 1);
        await c.send('Input.dispatchTouchEvent', { type: { start: 'touchStart', move: 'touchMove', end: 'touchEnd' }[t], touchPoints: t === 'end' ? [] : [{ x, y, id }] }); out = 'ok'; }
      else if (u.pathname === '/reload') out = (await lance()) ? 'en course' : 'ÉCHEC';
      else if (u.pathname === '/metrics') { const w = +u.searchParams.get('w'), h = +u.searchParams.get('h'); await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h }); out = 'ok'; }
      else if (u.pathname === '/erreurs') out = JSON.stringify(erreurs);
      else if (u.pathname === '/fin') { out = 'fin'; rs.end(out); c.close(); tueChrome(ch); srv.close(); cmd.close(); process.exit(0); }
    } catch (e) { out = 'ERREUR ' + e.message; }
    rs.end(out);
  });
  cmd.listen(P_CMD, '127.0.0.1');
  console.log('commandes sur', P_CMD, '— démarrage de la course…');
  console.log((await lance()) ? 'EN COURSE' : 'la course ne part pas');
})().catch(e => { console.error(e); process.exit(1); });
