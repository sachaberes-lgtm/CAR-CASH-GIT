// SONDE : charge le jeu (muet) et évalue les expressions données (une par argument) ; imprime les résultats. Usage : node sonde.cjs "expr1" "expr2"…
const fs = require('fs'); const { serveur, portLibre, lanceChrome, CDP, dormir, tmp } = require('./cdp.cjs'); const path = require('path');
const JEU = path.resolve(__dirname, '..', '..', 'VERSION PRINCIPALE'), PH = 9741, PC = 9742;
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, ex: { runs: 5 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
(async () => {
  for (const p of [PH, PC]) if (!portLibre(p)) { console.error('port occupé', p); process.exit(2); }
  const srv = await serveur(JEU, PH), { ch, pg } = await lanceChrome(PC, tmp(), 844, 390); const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); srv.close(); process.kill(-ch.pid); } catch (e) {} }; process.on('exit', fin);
  try {
    await c.send('Page.enable'); await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${PH}/index.html?colonne=0&simu=1${process.env.XU ? '&' + process.env.XU : ''}` });
    for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')", 8000)) break; } catch (e) {} }
    await dormir(1500);
    for (const e of process.argv.slice(2)) { if (/^\d+$/.test(e)) { await dormir(+e); continue; } if (e.startsWith('shot:')) { const r = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 88 }); fs.writeFileSync(e.slice(5), Buffer.from(r.data, 'base64')); console.log('photo', e.slice(5)); continue; } try { console.log('>', e.slice(0, 80), '\n ', JSON.stringify(await c.ev(e, 60000))); } catch (x) { console.log('>', e.slice(0, 80), '\n  ERREUR', String(x).slice(0, 300)); } }
  } finally { fin(); }
})();
