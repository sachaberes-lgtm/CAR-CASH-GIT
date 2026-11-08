/* LE BANC DE COURSE (2026-11-07, chasse aux bugs) : une course complète en Chrome headless (téléphone émulé, sans son) — départ par dbgJouer(), pause et   reprise (le saut d'images de la pause, dbgMortImg), mort par dbgDauphin('boom'), CONTINUER, écrans de récompense, REJOUER, 2e course, mort — et toutes les   exceptions / console.error de la page. Chrome froid : 60-90 s avant le jeu ; --prof <dossier> réutilise un profil chaud (2-3 s).     node outils/banc-course/course.cjs [--http 9793 --cdp 9794] [--prof <dossier de profil Chrome>] [--jeu <dossier VERSION PRINCIPALE>] [--map jade:matin]   Le jeu est chargé avec ?intro=ancien&attente=0 : en headless un programme GPU ne se lie jamais, sans ces drapeaux le départ attend pour toujours. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9793), P_CDP = +(A.cdp || 9794), W = 390, H = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], chanceG: 3, plq: { ok: 1 } };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = [], con = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); }
    if (m.method === 'Log.entryAdded') { const t = String(m.params.entry.text || ''); if (!/^(Autofocus|\[Deprecation|\[Violation)/.test(t)) con.push('log(' + m.params.entry.level + '): ' + t.slice(0, 200)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) con.push(m.params.type + ': ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const etat = async () => { try { return await c.ev('JSON.stringify(dbgState())'); } catch (e) { return 'dbgState ? ' + e.message.slice(0, 80); } };
  const tap = async (sel) => { const r = await c.ev(`(function(){const s=${JSON.stringify(sel)}.split(',');for(const q of s){for(const e of document.querySelectorAll(q)){const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;return [b.left+b.width/2,b.top+b.height/2,q];}}return null;})()`);
    if (!r) return 'introuvable : ' + sel;
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
  const tapTexte = async (re) => { const r = await c.ev(`(function(){const R=new RegExp(${JSON.stringify(re)},'i');for(const e of document.querySelectorAll('button,.pbtn,[role=button]')){const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;if(R.test(e.textContent||''))return [b.left+b.width/2,b.top+b.height/2,(e.textContent||'').trim().slice(0,30)];}return null;})()`);
    if (!r) return 'introuvable : ' + re;
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  const log = (k) => console.log('[' + Math.round(process.uptime()) + 's] ' + k + '  err=' + err.length + ' con=' + con.length);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Log.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: "(function(){var seen={},n=0;window.__glErr=[];['WebGL2RenderingContext','WebGLRenderingContext'].forEach(function(C){var P=window[C]&&window[C].prototype;if(!P)return;\n['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced','bufferSubData','bufferData','texImage2D','texSubImage2D'].forEach(function(f){var o=P[f];if(!o)return;P[f]=function(){var r=o.apply(this,arguments);var e=this.getError();if(e&&n<40){var st=(new Error()).stack.split('\\n').slice(2,6).join(' | ');var k=f+e+st;if(!seen[k]){seen[k]=1;n++;window.__glErr.push(f+' err='+e+' '+st.slice(0,600));}}return r;};});});})();" });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000); log('prêt ? ' + pret);
    if (!pret) { try { console.log('état de la page :', await c.ev("JSON.stringify({ready:document.readyState,gameReady:!!window.__gameReady,dbgState:typeof dbgState,splash:!!document.getElementById('splash'),intro:!!window.__introCouvre,mHome:(document.getElementById('mHome')||{}).className,body:document.body.className.slice(0,100),images:window.__imagesJeu|0})")); } catch (e) { console.log('page ?', e.message.slice(0, 200)); }
      const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(__dirname, 'course-pasprete.png'), Buffer.from(sh.data, 'base64')); }
    await dormir(3000);
    for (let course = 1; course <= 2; course++) {
      if (course === 1) { if (A.map) { try { console.log('map forcée :', A.map, JSON.stringify(await c.ev("dbgClassique('" + A.map.split(':')[0] + "','" + (A.map.split(':')[1] || 'matin') + "')")).slice(0, 160)); } catch (e) { console.log('dbgClassique ?', e.message.slice(0, 160)); } } try{await c.ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()");}catch(e){}await dormir(800);console.log('dbgJouer :', JSON.stringify(await c.ev('dbgJouer()')).slice(0, 200)); }
      else { console.log('REJOUER :', await tapTexte('REJOUER|RETRY|PLAY AGAIN')); }
      log('course ' + course + ' partie ? ' + await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 500));
      console.log('état :', (await etat()).slice(0, course === 1 ? 900 : 200));
      await dormir(12000);
      /* nitro tenue 3 s (le pouce) puis lâchée */
      try { await c.ev("(function(){const e=document.getElementById('tNitro');if(!e)return 'pas de tNitro';const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];})()").then(async r => { if (Array.isArray(r)) { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(3000); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } else console.log('nitro :', r); }); } catch (e) { console.log('nitro ? ' + e.message.slice(0, 80)); }
      await dormir(4000);
      console.log('état avant pause :', (await etat()).slice(0, 160)); try { console.log('gouttes de Jade (EAUP) :', await c.ev("(function(){try{return JSON.stringify({im:!!EAUP.im,teinte:EAUP.im?EAUP.im.instanceColor.array.length:null,count:EAUP.im?EAUP.im.count:null});}catch(e){return 'EAUP ? '+e.message;}})()")); } catch (e) {}
      await c.ev('window.__panBascule();1'); await dormir(3500);
      console.log('pause :', (await etat()).slice(0, 90), ' saut d\'images :', JSON.stringify(await c.ev('JSON.stringify(dbgMortImg())')));
      await c.ev('window.__panBascule();1'); await dormir(3000);
      console.log('reprise :', (await etat()).slice(0, 90), ' saut :', JSON.stringify(await c.ev('JSON.stringify(dbgMortImg())')));
      await c.ev("dbgDauphin('boom');1"); log('boom');
      log('mort ? ' + await attend("(function(){const s=dbgState();return s.gameOver;})()", 15000, 300));
      await dormir(2500);
      console.log('écran :', await c.ev("JSON.stringify({ecran:[...document.querySelectorAll('.mscr.on')].map(e=>e.id),dead:document.getElementById('mDead')&&document.getElementById('mDead').classList.contains('on'),boutons:[...document.querySelectorAll('button,.pbtn')].filter(e=>{const b=e.getBoundingClientRect();return b.width>1&&b.height>1;}).map(e=>(e.textContent||'').trim().slice(0,22)).slice(0,14)})"));
      /* la seconde chance (CONTINUER) à la 1re mort, puis les écrans de récompense */
      if (course === 1) { console.log('CONTINUER :', await tapTexte('^\\s*CONTINUER|^\\s*CONTINUE')); await dormir(4000); console.log('après CONTINUER :', (await etat()).slice(0, 200), ' saut :', JSON.stringify(await c.ev('JSON.stringify(dbgMortImg())')));
        const s = JSON.parse(await etat()); if (s.started && !s.gameOver) { await dormir(8000); await c.ev("dbgDauphin('boom');1"); log('boom 2 (après la seconde chance)'); log('mort ? ' + await attend("(function(){const s=dbgState();return s.gameOver;})()", 15000, 300)); await dormir(2500); } }
      for (const sel of ['#mvW .mvBt', '#serieW .swBt']) { const r = await tap(sel); console.log(sel, '→', r); await dormir(1800); }
      console.log('écran de fin :', await c.ev("JSON.stringify({ecran:[...document.querySelectorAll('.mscr.on')].map(e=>e.id),boutons:[...document.querySelectorAll('button,.pbtn')].filter(e=>{const b=e.getBoundingClientRect();return b.width>1&&b.height>1;}).map(e=>(e.textContent||'').trim().slice(0,22)).slice(0,14)})"));
      await dormir(1500);
    }
    const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(__dirname, 'course-fin.png'), Buffer.from(sh.data, 'base64'));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); }
  try{console.log('GLERR', await c.ev('JSON.stringify(window.__glErr)'));}catch(e){}
  console.log('\n=== EXCEPTIONS (' + err.length + ') ==='); for (const x of [...new Set(err)]) console.log(' - ' + x.replace(/\n/g, ' ⏎ ').slice(0, 300));
  console.log('=== CONSOLE error/warn (' + con.length + ') ==='); for (const x of [...new Set(con)].slice(0, 40)) console.log(' - ' + x.slice(0, 220));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
