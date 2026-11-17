// L'OBSERVATEUR DU VOILE ET LA RETAILLE DU PIVOT (2026-11-17, lot qualité « hudobs »). Des COMPTEURS seulement, aucun chrono (Mac chargé).
// A) En course réelle (le jeu tourne, ?tel=1, Chrome muet), trois états de 6 s : course nitro, annonces répétées, HUD calme. Par seconde :
//    rappels de l'observateur, éléments relus (getComputedStyle), recalculs de style FORCÉS par le JS du voile (trace Chrome : événements
//    UpdateLayoutTree portant une pile, dont une fonction hcc*/hco*), voiles posés/levés. Et l'invariant « voilé ⇒ opacité 0 » relu À CHAQUE IMAGE
//    juste avant la peinture (rappel d'un ResizeObserver : il passe après tous les rAF et leurs microtâches) : toute violation est comptée.
// B) Pivots en course (debout → couché → debout), resize retenu --retard ms comme WKWebView, orientationchange envoyé : combien de VRAIES
//    réallocations (renderer.setSize / setPixelRatio, composer.setSize) et d'images rejouées par pivot (crochet dbgRetaille(1)).
//   node outils/banc-hud/hudobs.cjs [--q "sans=hudobs,retaille1"] [--retard 100] [--out dossier] [--http 9961 --cdp 9962] [--prof dossier]
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(os.tmpdir(), 'banc-hudobs'));
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962), RETARD = +(A.retard != null ? A.retard : 100), DUREE = +(A.duree || 6000);
const W = 390, H = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const RETIENT = `(function(D){if(!D)return;
  window.addEventListener('resize',function(e){if(e.__pp)return;e.stopImmediatePropagation();setTimeout(function(){var n=new Event('resize');n.__pp=1;window.dispatchEvent(n);},D);},true);})(${RETARD});`;
/* l'invariant, juste avant chaque peinture */
const GARDE = `(function(){if(window.__inv)return 1;var I=window.__inv={images:0,viol:0,quoi:{},voiles:0};var d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0';document.body.appendChild(d);var k=0;
  new ResizeObserver(function(){I.images++;var l=document.querySelectorAll('.hcVeil');I.voiles+=l.length;for(var i=0;i<l.length;i++){if(+getComputedStyle(l[i]).opacity!==0){I.viol++;I.quoi[l[i].id||l[i].className]=(I.quoi[l[i].id||l[i].className]|0)+1;}}}).observe(d);
  (function f(){k^=1;d.style.width=(1+k)+'px';requestAnimationFrame(f);})();return 1;})()`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof ? path.resolve(A.prof) : fs.mkdtempSync(path.join(os.tmpdir(), 'banc-hudobs-'));
  const erreurs = [], R = { q: A.q || '', retard: RETARD, etats: {}, pivots: [] };
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let trace = null, finTrace = null;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
    if (m.method === 'Tracing.dataCollected' && trace) trace.push(...m.params.value);
    if (m.method === 'Tracing.tracingComplete' && finTrace) { const f = finTrace; finTrace = null; f(); } } catch (x) {} });
  const taille = async (w, h) => { await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h,
    screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
    try { await c.ev("dispatchEvent(new Event('orientationchange'));1"); } catch (e) {} };
  const obs = () => c.ev('JSON.stringify(dbgHudObs())').then(JSON.parse);
  const inv = () => c.ev('JSON.stringify(window.__inv)').then(JSON.parse);

  /* un état : compteurs avant/après + trace des recalculs forcés */
  async function etat(nom, pendant) {
    trace = [];
    await c.send('Tracing.start', { traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline.stack', 'v8.execute'] }, transferMode: 'ReportEvents' });
    const o0 = await obs(), i0 = await inv(), t0 = Date.now();
    if (pendant) await pendant(); else await dormir(DUREE);
    const o1 = await obs(), i1 = await inv(), s = (Date.now() - t0) / 1000;
    const p = new Promise(r => { finTrace = r; }); await c.send('Tracing.end'); await Promise.race([p, dormir(20000)]);
    let forces = 0, forcesVoile = 0, forcesObs = 0, recalc = 0; const parQui = {};
    for (const ev of trace) { if (ev.name !== 'UpdateLayoutTree' || ev.ph === 'E') continue; recalc++;
      const st = ev.args && (ev.args.beginData && ev.args.beginData.stackTrace || ev.args.data && ev.args.data.stackTrace);
      if (!st || !st.length) continue; forces++;
      const f = st.find(x => /^(hcc|hco)/.test(x.functionName || '')); const qui = st[0].functionName || '(anonyme)';
      parQui[qui] = (parQui[qui] | 0) + 1; if (f) forcesVoile++; if (st.some(x => /^(hccObs|hcoObs)$/.test(x.functionName || ''))) forcesObs++; }
    const d = k => +((o1[k] - o0[k]) / s).toFixed(1);
    const r = { s: +s.toFixed(1), rappelsParS: +(((o1.rappels - o0.rappels) + (o1.rappelsAvant - o0.rappelsAvant)) / s).toFixed(1), lecturesParS: d('lectures'),
      recalculsForcesVoileParS: +(forcesVoile / s).toFixed(1), recalculsForcesDansObservateur: forcesObs, recalculsForcesTousParS: +(forces / s).toFixed(1), recalculsParS: +(recalc / s).toFixed(1),
      leves: o1.leves - o0.leves, ignores: o1.ignores - o0.ignores, passes: o1.passes - o0.passes, sautes: o1.sautes - o0.sautes,
      images: i1.images - i0.images, voilesMoyens: +((i1.voiles - i0.voiles) / Math.max(1, i1.images - i0.images)).toFixed(1), violations: i1.viol - i0.viol,
      forcesPar: Object.entries(parQui).sort((a, b) => b[1] - a[1]).slice(0, 6) };
    try { const h = JSON.parse(await c.ev('JSON.stringify((dbgHudObs(2)||{}).hist||null)')); if (h) { r.mutations = Object.entries(h).sort((a, b) => b[1] - a[1]).slice(0, 8); await c.ev('dbgHudObs(1);1'); } } catch (e) {}
    R.etats[nom] = r; console.log(nom, JSON.stringify(r));
  }

  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + RETIENT });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&chute=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(2500);
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await c.ev('dbgImmortel(true);dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) throw new Error('la course ne part pas');
    await c.ev(GARDE); await c.ev('dbgHudObs(1);1');
    R.lot = await c.ev("JSON.stringify({hudCouches:document.documentElement.classList.contains('hudCouches'),obs:dbgHudObs(),ret:dbgRetaille()})");
    console.log('COURSE · ' + (A.q || '(défaut)') + ' · ' + R.lot);
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1'); await dormir(4000);
    await etat('1-course-nitro');
    await etat('2-annonces', async () => { for (let i = 0; i < DUREE / 1500; i++) { await c.ev("dbgHud('slam','BOOST');1"); await dormir(1500); } });
    await c.ev('dbgAuto(true,0,{vol:true,nit:0});1'); await dormir(2500);
    await etat('3-calme');
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1'); await dormir(2000);
    await etat('4-reprise-nitro', async () => { await dormir(DUREE); });
    /* B) les pivots, en course */
    await c.ev('dbgRetaille(1);1');
    for (const [w, h] of [[844, 390], [390, 844], [844, 390], [390, 844]]) {
      await c.ev('dbgRetaille(2);1');
      await taille(w, h); await dormir(1600);
      const r = JSON.parse(await c.ev('JSON.stringify(dbgRetaille())'));
      const v = JSON.parse(await c.ev('JSON.stringify({vue:[innerWidth,innerHeight],cv:[document.querySelector("canvas").width,document.querySelector("canvas").height]})'));
      R.pivots.push({ vers: w + '×' + h, ...r, ...v }); console.log('pivot → ' + w + '×' + h, JSON.stringify(r), JSON.stringify(v));
    }
    R.invariantFinal = await inv();
    console.log('invariant (toute la course) : ' + JSON.stringify(R.invariantFinal));
  } catch (e) { console.error('ÉCHEC : ' + e.message); R.echec = e.message; }
  finally {
    R.erreurs = erreurs;
    fs.writeFileSync(path.join(OUT, `hudobs-${(A.q || 'defaut').replace(/[^a-z0-9]+/gi, '_')}-r${RETARD}.json`), JSON.stringify(R, null, 1));
    if (erreurs.length) console.log('erreurs de la page : ' + erreurs.slice(0, 5).join(' / '));
    c.close(); tueChrome(ch); srv.close();
    if (!A.prof) try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
  }
  process.exit(R.echec ? 1 : 0);
})();
