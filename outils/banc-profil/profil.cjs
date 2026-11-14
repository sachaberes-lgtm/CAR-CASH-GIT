// LE BANC DU PROFIL (2026-11-14, chantier QUALITÉ PAR APPAREIL, lot 1). UN Chrome sans fenêtre et muet ; pour chaque essai : la page chargée
// (téléphone émulé : 844×390 DPR 3, tactile, hover:none → TEL_NATIF vrai ; ou --pc : sans émulation), le profil lu (dbgProfil), une course
// de --duree s (rAF réel), puis le profil relu, les erreurs (exceptions, console.error, pannes de la boîte noire).
//   node outils/banc-profil/profil.cjs [--jeu "VERSION PRINCIPALE"] [--duree 20] [--mi "expression évaluée à mi-course"] [--essais "iPhone14,2:fast;iPhone17,1:haute"] [--pc 1] [--q "x=1"] [--http 9861] [--cdp 9862]
// Un essai = <appareil>:<fast|haute|net|neuf>[:<paramètres d'URL en plus, séparés par +>]. Sortie : une ligne JSON par essai.
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const PC = A.pc === '1', DUREE = +(A.duree || 20), [W, H] = [844, 390];
const P_HTTP = +(A.http || 9861), P_CDP = +(A.cdp || 9862);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ESSAIS = (A.essais || 'iPhone14,2:fast').split(';').filter(Boolean).map(s => { const [ap, q, plus] = s.split(':'); return { ap, q: q || 'neuf', plus: (plus || '').split('+').filter(Boolean).join('&') }; });
const LIT = "(function(){var o={};try{o.profil=window.dbgPrf?dbgPrf():null}catch(e){o.profil='err '+e.message}try{o.nette=dbgNette()}catch(e){o.nette='err '+e.message}try{o.img=dbgImg()}catch(e){}"
  + "try{o.qual=dbgQual()}catch(e){}try{o.vhd=dbgVHD()}catch(e){}try{o.regle=imgRegle()}catch(e){}try{var r=dbgScene().rdr;o.toile=[r.domElement.width,r.domElement.height];o.filtre=r.shadowMap.type}catch(e){}return JSON.stringify(o)})()";
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!PC) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    }
    let idScript = null;
    for (const E of ESSAIS) {
      exc = []; cons = [];
      const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
      if (E.q !== 'neuf') { SAVE.q = E.q; SAVE.qChoisi = E.q === 'net' ? 0 : 1; }
      if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' })).identifier;
      const ap = E.ap && E.ap !== '-' ? '&appareil=' + E.ap : '';
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7${ap}` + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      let pret = false;
      for (let i = 0; i < 300 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
      if (!pret) { console.log(JSON.stringify({ essai: E, erreur: 'pas prêt', exc, cons })); continue; }
      await dormir(1500);
      const avant = JSON.parse(await c.ev(LIT));
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(1500);
      let ok = false;
      for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
      if (ok) { try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} }
      const t0 = Date.now(); let morts = 0;
      let mi = null, miFait = !A.mi;
      while (Date.now() - t0 < DUREE * 1000) { if (!miFait && Date.now() - t0 > DUREE * 500) { miFait = true; try { mi = await c.ev(A.mi, 60000); } catch (e) { mi = 'err ' + e.message; } } await dormir(2000); try { const go = await c.ev('dbgState().gameOver'); if (go) { morts++; try { await c.ev('dbgJouer()'); } catch (e) {} } } catch (e) {} }
      const apres = JSON.parse(await c.ev(LIT));
      let pannes = null; try { pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()"); } catch (e) {}
      let journal = null; try { journal = await c.ev("(function(){try{return (window.__ccJournal||[]).filter(function(e){return e&&(e.g==='profil'||e[0]==='profil')}).slice(-4)}catch(e){return null}})()"); } catch (e) {}
      console.log(JSON.stringify({ essai: E, course: ok, morts, avant, apres, mi, pannes, exc, cons }));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
