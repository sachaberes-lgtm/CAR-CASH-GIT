/* LE BANC DE L'ÉDIT DE LA TRIADE (2026-11-13) : une course en Chrome headless SANS SON (--mute-audio : tout le pipeline audio tourne, rien ne sort),
   la frénésie déclenchée par dbgFren('entre'), puis on lit `dbgTriade()` chaque seconde : la bande tourne-t-elle (ct), à quelle vitesse,
   combien d'impacts (1 à l'entrée, 1 à la mesure 9, 1 au retour de la boucle), le niveau de la couche. 70 s = 2 tours et demi.
   node outils/banc-son/triade.cjs [--duree 70] [--q "triade=0"] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9795), P_CDP = +(A.cdp || 9796), W = 390, H = 844, DUREE = +(A.duree || 70);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: true, mus: true, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); } } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0${A.q ? '&' + A.q : ''}` });
    const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000);
    console.log('prêt ?', pret); await dormir(3000);
    await c.ev("(function(){const s=document.getElementById('splash');if(s)s.click();return 1})()").catch(() => {});
    console.log('dbgJouer :', JSON.stringify(await c.ev('JSON.stringify(dbgJouer())')).slice(0, 200));
    console.log('partie ?', await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 500));
    await c.ev('dbgAuto(true,0,{imp:0});1').catch(() => {}); // la caisse roule seule : elle ne meurt pas pendant la mesure
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 420 }] }); await dormir(80); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); // un geste : libère l'<audio> unique
    await dormir(6000); // la sonde du fichier (2,5 s) a répondu
    console.log('musique avant :', await c.ev("JSON.stringify(dbgTriade().fren)").catch(e => String(e).slice(0, 80)));
    console.log('entrée :', await c.ev("JSON.stringify(dbgFren('entre'))").then(s => String(s).slice(0, 160)));
    const t0 = Date.now(); let derniers = '', niv = 0;
    while ((Date.now() - t0) / 1000 < DUREE) {
      await c.ev("dbgFren('nourrit',10);1").catch(() => {}); // la jauge se nourrit : la frénésie tient
      const r = await c.ev("JSON.stringify(dbgTriade())").catch(e => 'ERR ' + String(e).slice(0, 80));
      const cle = String(r).replace(/"prochainDrop":[-0-9.]+,?/, ''); if (cle !== derniers || Math.round((Date.now() - t0) / 1000) % 5 === 0) console.log(((Date.now() - t0) / 1000).toFixed(0).padStart(3) + ' s  ' + r); derniers = cle;
      await dormir(500);
      if (!niv && (Date.now() - t0) > 6000) { niv = 1; console.log('niveaux :', JSON.stringify(await c.ev("dbgTriade('niveaux')", 20000).catch(e => String(e).slice(0, 100)))); }
    }
    console.log('fin de frénésie :', await c.ev("dbgFren('v',0);JSON.stringify(dbgTriade())"));
    await dormir(3000);
    console.log('après :', await c.ev("JSON.stringify(Object.assign(dbgTriade(),{musique:dbgFren('idle',0).musique}))"));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); }
  console.log('\n=== EXCEPTIONS (' + err.length + ') ==='); for (const x of [...new Set(err)]) console.log(' - ' + x.replace(/\n/g, ' ⏎ ').slice(0, 300));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
