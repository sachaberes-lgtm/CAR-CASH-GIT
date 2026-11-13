// LE BANC « FEUX AU GARAGE ET EN BOUTIQUE » (2026-11-13, finition iPhone) : UN Chrome sans fenêtre et muet, iPhone 13 Pro (844×390 ou 390×844, ?tel=1),
// qui ouvre le garage sur chaque caisse demandée, la tourne pour montrer la poupe, puis ouvre la boutique. Vérifie aussi que les deux écrans s'ouvrent sans erreur.
//   node outils/banc-finition/feux-garage.cjs --out <dossier> --tag apres [--fmt couche|debout] [--caisses 0,3,12] [--q "sans=feuxfin"] [--angles "3.14,2.4"] [--dist 4.2] [--bq 1] [--bqcat trainee] [--js "expr"]
// Par caisse : <tag>-garage-<i>-<k>.png (l'écran) ; --bq 1 : <tag>-boutique.png. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390], TAG = A.tag || 'essai';
const CAISSES = (A.caisses || '0').split(',').map(Number), ANG = (A.angles || '3.14').split(',').map(Number), DIST = +(A.dist || 4.2);
const P_HTTP = +(A.http || 9851), P_CDP = +(A.cdp || 9852);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: CAISSES.concat([0]), ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} });
  const shot = async nom => { const r = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const tap = async (sel, fx, fy) => { const r = await c.ev(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();if(b.width<1)return null;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy}]})()`);
    if (!r) return 'introuvable : ' + sel;
    for (let k = 0; k < 3; k++) { try { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }, 60000); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, 60000); return 'ok'; } catch (e) { await dormir(2000); } } /* Mac saturé : le geste peut dépasser le délai */
    return 'geste perdu'; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) break; } catch (e) {} }
    await dormir(2500);
    console.log('equipe', await c.ev(`dbgEquipe(${CAISSES[0]})`)); await dormir(600);
    await c.ev("window.__mGo&&window.__mGo('home');1"); await dormir(400);
    console.log('garage', await tap('#mHome [data-m="garage"]')); await dormir(4500);
    for (const i of CAISSES) {
      if (i !== CAISSES[0]) { console.log('caisse', i, JSON.stringify(await c.ev(`(function(){try{return dbgGarObj?String(dbgEquipe(${i})):''}catch(e){return String(e)}})()`))); await dormir(1800); }
      if (A.js) console.log('js', JSON.stringify(await c.ev(A.js)));
      for (let k = 0; k < ANG.length; k++) { await c.ev(`dbgGarage(${ANG[k]},0.2,${DIST},0);1`); await dormir(1300); await shot(`${TAG}-garage-${i}-${k}.png`); }
      console.log('feux', i, JSON.stringify(await c.ev("(function(){try{return [typeof dbgFeuxFin==='function'?dbgFeuxFin():null,dbgFeuxLed().stats]}catch(e){return String(e)}})()")));
    }
    if (A.bq === '1') { await c.ev("dbgGarage('libre');1"); console.log('boutique', await tap('#gShopBas', .82, .84)); await dormir(6000); await shot(`${TAG}-boutique.png`);
      if (A.bqcat) { console.log('rayon', await tap('#gBqCats [data-c="' + A.bqcat + '"]')); await dormir(3500); await shot(`${TAG}-boutique-${A.bqcat}.png`); }
      console.log('etat', await c.ev("JSON.stringify({garage:document.getElementById('garage').className.slice(0,80),body:document.body.className.slice(0,80)})")); }
    console.log('pannes', JSON.stringify(await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()")), 'exceptions', JSON.stringify(exc.slice(0, 5)), 'console', JSON.stringify(cons.slice(0, 6)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
