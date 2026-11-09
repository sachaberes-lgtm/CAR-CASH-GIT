/* REJOUER (2026-11-09, chasse) : la 2e course ne partait pas après REJOUER sur la plupart des maps (course.cjs). Ce banc isole le geste : départ, mort par dbgDauphin('boom'),
   attente de l'écran de mort, journal des boutons visibles + de ce qui recouvre REJOUER (elementFromPoint), toucher de REJOUER, puis l'état et l'écran toutes les 2 s pendant 30 s.
   node outils/banc-course/rejouer.cjs --prof <profil Chrome chaud COPIÉ> [--http 9971 --cdp 9972] [--map banquise:neige] [--chance 0|1] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9971), P_CDP = +(A.cdp || 9972), W = 390, H = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], chanceG: 3, plq: { ok: 1 } };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, A.prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const ev = async (e, t) => { try { return await c.ev(e, t || 8000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 120); } };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await dormir(pas || 500); } return false; };
  const toucher = async (x, y) => { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const ecrans = "JSON.stringify({ecran:[...document.querySelectorAll('.mscr.on')].map(e=>e.id),st:(function(){const s=dbgState();return [s.started,s.gameOver,s.mode,s.paused].join('/');})(),modales:[...document.querySelectorAll('[class*=modal],[id*=Modal],.mdl,#mPub,#adOv,.fenetre')].filter(e=>{const b=e.getBoundingClientRect();return b.width>5&&b.height>5&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';}).map(e=>e.id||e.className).slice(0,6)})";
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    console.log('prêt ?', await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000));
    await dormir(3000);
    if (A.map) console.log('map', A.map, JSON.stringify(await ev("dbgClassique('" + A.map.split(':')[0] + "','" + (A.map.split(':')[1] || 'matin') + "')")).slice(0, 80));
    await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); await dormir(800);
    await ev('dbgJouer()');
    console.log('partie ?', await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 90000, 500));
    await dormir(8000);
    await ev("dbgDauphin('boom');1");
    for(let i=0;i<40;i++){const t=await ev("JSON.stringify({st:(function(){const s=dbgState();return [s.started,s.gameOver,s.mode].join('/');})(),ecr:[...document.querySelectorAll('.mscr.on')].map(e=>e.id).join(','),chance:(typeof dbgChance==='function')?'fn':'',txt:(document.getElementById('toast')||{textContent:''}).textContent.slice(0,40)})");console.log('t+'+(i*0.3).toFixed(1)+' s',t);await dormir(300);}
    console.log('mort ?', await attend("dbgState().gameOver", 1000, 300));
    await dormir(3500);
    console.log('après la mort :', await ev(ecrans));
    if (A.chance === '0') { /* rien */ }
    const r = await ev("(function(){for(const e of document.querySelectorAll('button,.pbtn,[role=button]')){const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;if(/REJOUER|RETRY|PLAY AGAIN/i.test(e.textContent||''))return {x:b.left+b.width/2,y:b.top+b.height/2,w:b.width,h:b.height,dessus:(function(){const t=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);return t?(t.id||t.className||t.tagName)+' | '+((t.closest('[id]')||{}).id||''):'rien';})(),op:getComputedStyle(e).opacity,pe:getComputedStyle(e).pointerEvents,dis:e.disabled||e.getAttribute('aria-disabled')||''};}return null;})()");
    console.log('REJOUER :', JSON.stringify(r));
    console.log('boutons :', await ev("JSON.stringify([...document.querySelectorAll('button,.pbtn')].filter(e=>{const b=e.getBoundingClientRect();return b.width>1&&b.height>1;}).map(e=>(e.textContent||'').trim().slice(0,20)))"));
    if (r && r.x) { await toucher(r.x, r.y); console.log('touché'); }
    for (let i = 1; i <= 15; i++) { await dormir(2000); console.log('+' + (i * 2) + ' s', await ev(ecrans)); }
    const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(__dirname, 'rejouer-fin.png'), Buffer.from(sh.data, 'base64'));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); }
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
