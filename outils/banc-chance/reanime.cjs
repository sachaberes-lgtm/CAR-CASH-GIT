// LE BANC DE LA RÉANIMATION AUTOMATIQUE (2026-11-06, Sacha : « deuxième chance doit réanimer automatiquement ») — lance le vrai jeu dans un Chrome
// sans fenêtre (cdp.cjs du banc des traînées), pose un bon de seconde chance, tue la caisse et PHOTOGRAPHIE la suite image par image.
//   node outils/banc-chance/reanime.cjs --out /chemin [--scenario auto|boost|sans] [--http 9751 --cdp 9752] [--pas 200] [--duree 6500]
//   auto  : un bon (chanceG=1) → la caisse explose, l'écran de mort ne s'ouvre pas, la caisse REVIENT (photos + journal des états)
//   sans  : aucun bon → l'écran de mort s'ouvre comme avant (contrôle)
//   boost : un départ boosté (spinBoost=1) → les cinq pouvoirs sont posés au départ (journal des minuteurs)
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9751), P_CDP = +(A.cdp || 9752), PAS = +(A.pas || 200), DUREE = +(A.duree || 6500), SC = A.scenario || 'auto';
const W = +(A.w || 844), H = +(A.h || 390);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, cousin: 0, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof + 'rea', W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); } catch (x) {} });
  const fin = () => { try { c.close(); process.kill(-ch.pid); } catch (e) {} srv.close(); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1` });
    for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgChance==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) break; } catch (e) {} }
    await dormir(2500);
    const tap = async sel => { const r = await c.ev(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];})()`);
      if (!r) return false; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
      await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true; };
    if (SC === 'auto') await c.ev("dbgChance('bon',1);1"); else if (SC === 'boost') await c.ev("dbgChance('boost',1);1"); else await c.ev("dbgChance('bon',0);1");
    console.log('JOUER touché :', await tap('#mHome [data-m="play"]'));
    for (let i = 0; i < 80; i++) { await dormir(250); if (await c.ev("dbgChance().mode==='drive'&&!dbgChance().gameOver&&(dbgChance().t>0.5)", 5000)) break; }
    await dormir(1500);
    const journal = [];
    const photo = async (n) => { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }, 30000); fs.writeFileSync(path.join(OUT, `${SC}-${String(n).padStart(2, '0')}.jpg`), Buffer.from(sh.data, 'base64')); };
    const etat = () => c.ev(`JSON.stringify((function(){const e=dbgChance(),r=dbgResu();return {mode:e.mode,gameOver:e.gameOver,auto:e.auto,used:e.used,inv:e.inv,bons:e.bons,resu:{actif:r.actif,poses:r.poses,eclats:r.eclats,carVisible:r.visible},
      mort:!!document.querySelector('#mDead.on'),overlay:document.getElementById('overlay')?document.getElementById('overlay').style.display:'?',wipe:(document.getElementById('wipe')||{}).className||'',slam:(document.getElementById('slam9')||{}).textContent||''};})())`);
    if (SC === 'boost') {
      /* le départ boosté se pose au DÉPART de la partie (déjà lancée plus haut) : on lit simplement les minuteurs */
    } else {
      await c.ev("dbgChance('choc');1");
    }
    const t0 = Date.now(); let n = 0;
    while (Date.now() - t0 < DUREE) {
      const t = Date.now() - t0; await photo(n);
      const e = JSON.parse(await etat()); e.t = t; e.n = n; journal.push(e);
      if (SC === 'boost') { e.pwr = JSON.parse(await c.ev("JSON.stringify(dbgPwr().pwr)")); }
      n++; await dormir(PAS);
    }
    fs.writeFileSync(path.join(OUT, `${SC}-journal.json`), JSON.stringify({ erreurs, journal }, null, 1));
    console.log(journal.map(e => `${String(e.t).padStart(5)}ms mode=${e.mode} over=${e.gameOver} auto=${e.auto} used=${e.used} mort=${e.mort} ov=${e.overlay} resu=${e.resu.actif ? e.resu.poses + '/' + e.resu.eclats : '-'} wipe=${e.wipe || '-'} slam="${e.slam}"`).join('\n'));
    if (SC === 'boost') console.log(journal.map(e => e.t + 'ms pouvoirs ' + JSON.stringify(e.pwr)).join('\n'));
    console.log('erreurs de page :', erreurs.length, erreurs.slice(0, 3));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
