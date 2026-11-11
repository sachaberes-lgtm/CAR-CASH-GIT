// LE BANC DE L'EXPLOSION À L'ENVERS (2026-11-11, Sacha : « retravaille l'animation de résurrection ») — le vrai jeu dans un Chrome sans fenêtre
// (cdp.cjs du banc des traînées, démarrage du banc de course : ?intro=ancien&attente=0, #splash, dbgJouer), puis la résurrection PHOTOGRAPHIÉE.
//   node outils/banc-chance/envers.cjs --out /chemin [--scenario bon|lance] [--http 9891 --cdp 9892] [--pas 80] [--duree 7000] [--prof profil chaud]
//   bon   : un bon de seconde chance (le cœur de la machine) → la caisse explose (dbgChance('mort')), réanimation automatique, rembobinage ROSE
//   lance : pas de mort — dbgResu('lance') rejoue l'animation en pleine course (la couleur de la pub : CYAN)
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9891), P_CDP = +(A.cdp || 9892), PAS = +(A.pas || 80), DUREE = +(A.duree || 7000), SC = A.scenario || 'bon';
const W = +(A.w || 844), H = +(A.h || 390);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, cousin: 0, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; erreurs.push(((d.exception && d.exception.description) || d.text || '').slice(0, 300)); } } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} try { tueChrome(ch); } catch (e) {} srv.close(); };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    console.log('prêt ?', await attend("!!window.__gameReady&&typeof dbgChance==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000));
    await dormir(3000);
    try { await c.ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); } catch (e) {}
    await dormir(800);
    if (SC === 'bon') await c.ev("dbgChance('bon',1);1");
    console.log('dbgJouer :', JSON.stringify(await c.ev('dbgJouer()')).slice(0, 200));
    console.log('en course ?', await attend("dbgChance().mode==='drive'&&!dbgChance().gameOver&&dbgChance().t>0.5", 60000, 400));
    await dormir(2500);
    const etat = () => c.ev(`JSON.stringify((function(){const e=dbgChance(),r=dbgResu(),w=document.getElementById('resuRw');return {mode:e.mode,over:e.gameOver,auto:e.auto,used:e.used,inv:e.inv,
      resu:r.actif?r.t+' s '+r.poses+'/'+r.eclats:'-',car:r.visible,rw:!!(w&&w.classList.contains('on')),slam:(document.getElementById('slam9')||{}).textContent||''};})())`);
    if (SC === 'bon') await c.ev("dbgChance('mort');1"); else await c.ev("dbgResu('lance');1");
    const t0 = Date.now(), journal = []; let n = 0;
    while (Date.now() - t0 < DUREE) {
      const t = Date.now() - t0, sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 72 }, 30000);
      fs.writeFileSync(path.join(OUT, `${SC}-${String(n).padStart(2, '0')}.jpg`), Buffer.from(sh.data, 'base64'));
      const e = JSON.parse(await etat()); e.t = t; e.n = n; journal.push(e); n++; await dormir(PAS);
    }
    fs.writeFileSync(path.join(OUT, `${SC}-journal.json`), JSON.stringify({ erreurs, journal }, null, 1));
    console.log(journal.map(e => `#${String(e.n).padStart(2)} ${String(e.t).padStart(5)}ms mode=${e.mode} over=${e.over} auto=${e.auto} used=${e.used} inv=${e.inv} resu=${e.resu} caisse=${e.car} rw=${e.rw} slam="${e.slam}"`).join('\n'));
    console.log('erreurs de page :', erreurs.length, erreurs.slice(0, 4));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
