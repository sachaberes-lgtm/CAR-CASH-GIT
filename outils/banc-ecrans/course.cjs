// LE BANC DE LA COURSE (2026-11-07, Sacha : « retravaille la version mobile et l'ergonomie dans le détail ») — lance une VRAIE course au téléphone
// (tactile émulé), debout et couché, avec ou sans l'auto-école, photographie l'écran et relève les cibles < 44 px et la place de la carte du tuto.
//   node outils/banc-ecrans/course.cjs --out /chemin [--formats debout,couche] [--tuto 0|1] [--etape N] [--http 9771 --cdp 9772]
// Pièges (voir la mémoire « banc jury headless ») : ?intro=ancien&attente=0, toucher #splash, puis dbgJouer().
const fs = require('fs'), path = require('path');
const { serveur, portLibre, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const cp = require('child_process'), os = require('os');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
/* le lancement du banc du jury (branche jury/fable) : vrai GPU, minuteurs non bridés, profil CHAUD qui survit (les programmes GPU en cache : 3 s au lieu de 65 s) */
async function lanceChrome(port, w, h) {
  const udd = path.join(os.tmpdir(), 'cc-banc-chaud-ergo'); fs.mkdirSync(udd, { recursive: true });
  const ch = cp.spawn(CHROME, ['--headless=new', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=' + port, '--user-data-dir=' + udd, '--window-size=' + w + ',' + h, 'about:blank'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 240; i++) { await dormir(500); try { const t = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); const pg = t.find(x => x.type === 'page'); if (pg) return { ch, pg }; } catch (e) {} }
  throw new Error('Chrome ne répond pas');
}
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9771), P_CDP = +(A.cdp || 9772);
const FORMATS = { debout: [390, 844], couche: [844, 390], i7couche: [667, 375], i7debout: [375, 667], maxdebout: [430, 932], maxcouche: [932, 430] };
const FMTS = (A.formats || 'debout,couche').split(',');
const TUTO = A.tuto === '1' ? 1 : 0, ETAPE = A.etape == null ? null : +A.etape;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: TUTO ? 0 : 1, permis: TUTO ? 0 : 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const AUDIT = fs.readFileSync(path.join(__dirname, 'audit.js'), 'utf8');

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), rapport = {};
  for (const fmt of FMTS) {
    const [W, H] = FORMATS[fmt];
    const { ch, pg } = await lanceChrome(P_CDP + FMTS.indexOf(fmt), W, H);
    const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
    const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); };
    try {
      await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
      await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
      for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'", 8000)) break; } catch (e) {} }
      await dormir(2500);
      await c.ev("(function(){var s=document.getElementById('splash');if(s){['pointerdown','touchstart','mousedown','pointerup','click'].forEach(function(t){try{s.dispatchEvent(new Event(t,{bubbles:true}))}catch(e){}})}return 1})()");
      await dormir(1200);
      await c.ev("(function(){var s=document.getElementById('splash');if(s){s.id='';s.remove();}return !!document.getElementById('splash')})()");
      await dormir(2500);
      console.log(fmt, 'jouer:', await c.ev('JSON.stringify(window.dbgJouer&&window.dbgJouer())'));
      for (let i = 0; i < +(A.attend || 90); i++) { await dormir(1000); try { const d = JSON.parse(await c.ev('JSON.stringify(window.dbgState())', 8000)); if (d.started && !d.gameOver) { console.log('en course après', i + 1, 's'); break; } if (i % 30 === 29) { console.log('(départ raté, nouvel essai)'); await c.ev('window.dbgJouer()'); } } catch (e) {} }
      await dormir(2500);
      await c.ev(AUDIT);
      if (ETAPE != null) { await c.ev('window.dbgTuto&&window.dbgTuto(' + ETAPE + ')'); await dormir(2500); }
      for (const t of (A.temps || '1500').split(',')) {
        await dormir(+t);
        const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000);
        const cle = fmt + '-course' + (TUTO ? '-tuto' : '') + (ETAPE != null ? '-e' + ETAPE : '') + '-' + t;
        fs.writeFileSync(path.join(OUT, cle + '.png'), Buffer.from(sh.data, 'base64'));
        console.log('photo', cle);
      }
      const etat = await c.ev("JSON.stringify({tuto:window.dbgTuto&&window.dbgTuto(),carte:(function(){var e=document.getElementById('coach');if(!e)return null;var b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]})(),body:document.body.className.slice(0,200),W:innerWidth,H:innerHeight})");
      const audit = await c.ev('JSON.stringify(ccAudit())');
      rapport[fmt] = { etat: JSON.parse(etat), audit: JSON.parse(audit) };
      console.log(fmt, etat);
    } catch (e) { console.log(fmt, 'ÉCHEC', String(e).slice(0, 300)); rapport[fmt + '-echec'] = String(e).slice(0, 300); } finally { fin(); await dormir(1500); }
  }
  fs.writeFileSync(path.join(OUT, 'rapport-course' + (TUTO ? '-tuto' : '') + '.json'), JSON.stringify(rapport, null, 1));
  srv.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
