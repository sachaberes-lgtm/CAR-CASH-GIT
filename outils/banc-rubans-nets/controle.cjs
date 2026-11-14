// LE CONTRÔLE DES RUBANS NETS (2026-11-14) : trois chargements du vrai jeu, un Chrome sans fenêtre et muet —
//   1. ORDINATEUR (aucune émulation), MÊME avec ?rubans=1 : le profil doit être éteint, rien de posé (texture, mélange, programme, loupe) ;
//   2. TÉLÉPHONE ÉMULÉ SANS MODÈLE (TEL_NATIF vrai, classe 0 : Safari) : idem — hors profil rien ne change ;
//   3. TÉLÉPHONE PROFILÉ PAR LE VRAI PRF (?appareil=iPhone14,2, sans ?rubans=1) : tout est posé ; LA LOUPE SUIT LA RÉSOLUTION — scène à DPR 2,9 (dbgDPR) → la loupe se retire, revenue à 1,25 → elle revient ;
//   4. le même avec ?sans=loupedpr : à DPR 2,9 la loupe reste (celle d'avant).
//   (2026-11-14, intégration : le banc passe du forçage ?tel=1&rubans=1 au vrai profil)
//   node outils/banc-rubans-nets/controle.cjs   (prendre le verrou du Mac avant, le rendre après)
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = 9875, P_CDP = 9876;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 } };
const ETAT = "JSON.stringify({rubans:dbgRubans(),loupe:dbgLoupe(),prog:(function(){try{var f=dbgScene().rdr.info.programs.map(function(p){return p.name}).join(',');return f.length}catch(e){return 0}})(),"
  + "rubanMat:(function(){try{var n=0,t=[];dbgScene().scene.traverse(function(o){if(o.isMesh&&o.renderOrder===2&&o.material&&o.material.map&&o.material.map.image&&o.material.vertexColors&&o.frustumCulled===false){n++;t.push([o.material.map.image.width,o.material.blending,o.material.opacity].join('/'));}});return {n:n,t:t.slice(0,4)};}catch(e){return String(e)}})()})";
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = []; c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const course = async () => {
      for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
      await dormir(1500);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      let ok = false; for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
      await c.ev("window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1});1");
      await c.ev("(async function(){for(var i=0;i<60;i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()", 120000);
      return ok; };
    const base = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&meteo=midi&pistegraine=7`;
    /* 1. l'ordinateur */
    await c.send('Page.navigate', { url: base + '&rubans=1' }); console.log('ORDINATEUR (?rubans=1) course', await course()); console.log(await c.ev(ETAT));
    /* 2. et 3. le téléphone émulé */
    await c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 3, mobile: true, screenWidth: 844, screenHeight: 390 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.navigate', { url: base }); console.log('TÉLÉPHONE SANS MODÈLE (classe 0) course', await course()); console.log(await c.ev(ETAT));
    await c.send('Page.navigate', { url: base + '&appareil=iPhone14,2' }); console.log('TÉLÉPHONE PROFILÉ (iPhone14,2) course', await course()); console.log(await c.ev(ETAT));
    const l = "JSON.stringify((function(){var l=dbgLoupe();return {on:l.on,kq:l.kq,horsDpr:l.horsDpr,toile:l.toile,scene:l.scene,bascules:l.bascules}})())";
    const pas = n => c.ev(`(async function(){for(var i=0;i<${n};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 60000);
    for (const d of [1.25, 2.0, 2.5, 2.9, 3, 1.25]) { await c.ev(`dbgDPR(${d});1`); await pas(4); console.log('DPR', d, await c.ev(l)); }
    await c.send('Page.navigate', { url: base + '&appareil=iPhone14,2&sans=loupedpr' }); console.log('PROFILÉ ?sans=loupedpr course', await course());
    for (const d of [2.9, 1.25]) { await c.ev(`dbgDPR(${d});1`); await pas(4); console.log('sans=loupedpr DPR', d, await c.ev(l)); }
    console.log('exceptions', JSON.stringify(exc.slice(0, 6)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
