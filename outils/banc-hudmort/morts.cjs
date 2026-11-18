// LE BANC DES MORTS DU HUD (2026-11-18, lot qualité « hudmort », Sacha : « quand on meurt, il y a des petits pixels comme si c'était souligné,
// mais à moitié »). Le vrai jeu dans Chrome sans fenêtre et MUET, à la géométrie du 13 Pro (844×390 points, deviceScaleFactor 3, ?tel=1),
// plusieurs morts (chute, choc, nitro, figure, seconde chance) ; après chaque mort, TOUTES les images du compositeur (Page.startScreencast,
// PNG à la taille de l'écran) pendant --duree ms. --toile 0 cache les <canvas> : on ne voit que le HUD (trait facile à trouver).
//   node outils/banc-hudmort/morts.cjs --out dossier [--w 844 --h 390 --dsf 3] [--q "sans=hudmort"] [--morts vide,choc,nitro,figure,chance]
//        [--toile 0] [--duree 3200] [--jeu "VERSION PRINCIPALE"] [--http 9971 --cdp 9972] [--prof dossier]
// Puis : node outils/banc-hudmort/traits.cjs dossier (cherche les traits fins, fait les planches).
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(os.tmpdir(), 'banc-hudmort'));
const P_HTTP = +(A.http || 9971), P_CDP = +(A.cdp || 9972), DUREE = +(A.duree || 3200);
const W = +(A.w || 844), H = +(A.h || 390), DSF = +(A.dsf || 3), TOILE = A.toile !== '0';
/* le PLAN : des groupes « Ot:morts » — O = P (couché, W×H) ou D (debout, H×W), t = 1 (toile visible) ou 0 (HUD seul) */
const PLAN = (A.plan || (A.morts ? 'P' + (TOILE ? 1 : 0) + ':' + A.morts : 'P1:vide,choc,nitro,figure;P0:vide,nitro,figure,chance;D1:vide,nitro;D0:vide,nitro,figure')).split(';')
  .flatMap(g => { const [k, l] = g.split(':'); return l.split(',').map(m => ({ o: k[0], toile: k[1] !== '0', m })); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, cousin: 0, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const CACHE_TOILE = `(function(){var s=document.createElement('style');s.id='bancSansToile';s.textContent='canvas{visibility:hidden!important}';document.documentElement.appendChild(s);})();`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof ? path.resolve(A.prof) : fs.mkdtempSync(path.join(os.tmpdir(), 'banc-hudmort-'));
  const erreurs = [], R = { q: A.q || '', w: W, h: H, dsf: DSF, toile: TOILE, morts: [] };
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  fs.writeFileSync(path.join(OUT, 'chrome.pid'), String(ch.pid));
  setTimeout(() => { console.error('passe trop longue (11 min) : arrêt'); try { fs.writeFileSync(path.join(OUT, 'morts.json'), JSON.stringify(R, null, 1)); } catch (e) {} tueChrome(ch); process.exit(3); }, 660000).unref();
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let film = null;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
    if (m.method === 'Page.screencastFrame') { c.send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
      if (film) film.push({ t: m.params.metadata.timestamp, d: m.params.data }); } } catch (x) {} });
  const etat = () => c.ev('JSON.stringify(dbgChance())').then(JSON.parse);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: true, screenWidth: W, screenHeight: H,
      screenOrientation: W > H ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + (TOILE ? '' : 'addEventListener("DOMContentLoaded",function(){' + CACHE_TOILE + '});') });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&chute=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(2000);
    let oCur = 'P', tCur = TOILE;
    for (let n = 0; n < PLAN.length; n++) {
      const M = PLAN[n].m, r = { n, mort: M, o: PLAN[n].o, toile: PLAN[n].toile };
      if (PLAN[n].o !== oCur) { oCur = PLAN[n].o; const w = oCur === 'P' ? W : H, h = oCur === 'P' ? H : W;
        await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: DSF, mobile: true, screenWidth: w, screenHeight: h,
          screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
        try { await c.ev("dispatchEvent(new Event('orientationchange'));dispatchEvent(new Event('resize'));1"); } catch (e) {} await dormir(2500); }
      if (PLAN[n].toile !== tCur) { tCur = PLAN[n].toile; await c.ev(tCur ? "(function(){var s=document.getElementById('bancSansToile');s&&s.remove();return 1})()" : CACHE_TOILE + '1'); }
      r.vue = await c.ev('[innerWidth,innerHeight,devicePixelRatio]');
      try { await c.ev("dbgChance('bon'," + (M === 'chance' ? 1 : 0) + ");1"); } catch (e) {}
      let enCourse = false;
      for (let essai = 0; essai < 3 && !enCourse; essai++) {
        try { await c.ev('dbgImmortel(false);dbgJouer();1'); } catch (e) {}
        for (let i = 0; i < 40; i++) { await dormir(500); try { const s = await etat(); if (!s.gameOver && s.mode === 'drive') { enCourse = true; break; } } catch (e) {} }
      }
      if (!enCourse) { r.echec = 'la course ne part pas'; R.morts.push(r); console.log(JSON.stringify(r)); continue; }
      await c.ev('dbgImmortel(true);dbgAuto(true,0,{vol:true,nit:' + (M === 'nitro' ? 1 : 0) + (M === 'figure' ? ',saut:1' : '') + '});1');
      await dormir(5000);
      if (M === 'nitro') { try { await c.ev("dbgPwr('n');dbgHud&&dbgHud('flow',60);1"); } catch (e) {} await dormir(1500); }
      if (M === 'figure') { let vol = false; for (let i = 0; i < 40 && !vol; i++) { await dormir(250); try { vol = (await etat()).mode === 'fall'; } catch (e) {} }
        r.vol = vol; try { r.fig = await c.ev("(function(){var l=dbgFigure();return dbgFigure(Array.isArray(l)?l[0]:'');})()"); } catch (e) { r.fig = 'erreur'; } await dormir(350); }
      await c.ev('dbgImmortel(false);1');
      r.avant = await etat();
      film = [];
      /* --rafale 1 : des captures à la VRAIE résolution (Page.captureScreenshot, deviceScaleFactor compris) au lieu du film du compositeur,
         que Chrome sans fenêtre rend à la taille CSS (844×390) : moins d'images, mais chaque pixel de l'écran du téléphone */
      const RAF = A.rafale === '1';
      if (!RAF) await c.send('Page.startScreencast', { format: 'png', maxWidth: Math.max(W, H) * DSF, maxHeight: Math.max(W, H) * DSF, everyNthFrame: 1 });
      await dormir(150);
      const t0 = Date.now();
      if (M === 'choc') { r.coup = await c.ev("(function(){try{return String(dbgImpact());}catch(e){return 'erreur '+e.message;}})()");
        if (!/ok|choc|impact|paroi/i.test(r.coup || '')) { await dormir(300); const s = await etat(); if (s.mode !== 'boom' && !s.gameOver) r.coup2 = await c.ev("dbgExplo('tour');1"); } }
      else await c.ev("dbgChance('mort');1");
      if (RAF) { while (Date.now() - t0 < DUREE) { const s = await c.send('Page.captureScreenshot', { format: 'png', fromSurface: true }); film.push({ t: (Date.now() - t0) / 1000, d: s.data }); } }
      else { await dormir(DUREE); await c.send('Page.stopScreencast'); }
      const F = film; film = null; r.apres = await etat(); r.ms = Date.now() - t0;
      if (A.fin) { /* l'écran de mort posé : une capture pleine résolution, et les boîtes des bougies de l'AURA */
        await dormir(Math.max(0, +A.fin - (Date.now() - t0)));
        const s = await c.send('Page.captureScreenshot', { format: 'png', fromSurface: true }); r.fin = s.data;
        r.bougies = await c.ev(`JSON.stringify([].map.call(document.querySelectorAll('#mDead .m6Col'),function(c){var b=c.querySelector('.m6Barre'),v=c.querySelector('.m6Val'),rb=b.getBoundingClientRect(),rv=v.getBoundingClientRect(),cs=getComputedStyle(b);
          return {cls:c.className,h:c.style.getPropertyValue('--h'),val:v.textContent,barre:cs.display==='none'?null:[+rb.left.toFixed(1),+rb.top.toFixed(1),+rb.width.toFixed(1),+rb.height.toFixed(1)],chiffre:[+rv.left.toFixed(1),+rv.top.toFixed(1),+rv.bottom.toFixed(1)]};}).concat([{ligne:!!document.querySelector('#mDead .m6Ligne'),hudMort:document.documentElement.classList.contains('hudMort')}]))`).then(JSON.parse);
      }
      const dos = path.join(OUT, String(n).padStart(2, '0') + '-' + PLAN[n].o + (PLAN[n].toile ? 1 : 0) + '-' + M); fs.mkdirSync(dos, { recursive: true });
      F.forEach((f, i) => fs.writeFileSync(path.join(dos, String(i).padStart(3, '0') + '.png'), Buffer.from(f.d, 'base64')));
      r.images = F.length; r.t = F.map(f => +((f.t - (F[0] ? F[0].t : 0)) * 1000).toFixed(0));
      if (r.fin) { fs.writeFileSync(path.join(dos, 'fin.png'), Buffer.from(r.fin, 'base64')); delete r.fin; console.log('bougies', JSON.stringify(r.bougies)); }
      r.dom = await c.ev("JSON.stringify({body:document.body.className,dead:!!document.querySelector('#mDead.on'),m5:!!document.querySelector('#mDead.m5')})").then(JSON.parse);
      fs.writeFileSync(path.join(dos, 'etat.json'), JSON.stringify(r, null, 1));
      console.log(M, 'images', F.length, 'en', r.ms, 'ms ·', JSON.stringify({ coup: r.coup, fig: r.fig, avant: r.avant.mode, apres: r.apres.mode, go: r.apres.gameOver, dom: r.dom }));
      R.morts.push(r);
      await dormir(800);
    }
  } catch (e) { console.error('ÉCHEC : ' + e.message); R.echec = e.message; }
  finally {
    R.erreurs = erreurs; fs.writeFileSync(path.join(OUT, 'morts.json'), JSON.stringify(R, null, 1));
    if (erreurs.length) console.log('erreurs de la page : ' + erreurs.slice(0, 5).join(' / '));
    c.close(); tueChrome(ch); srv.close();
    if (!A.prof) try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
  }
  process.exit(R.echec ? 1 : 0);
})();
