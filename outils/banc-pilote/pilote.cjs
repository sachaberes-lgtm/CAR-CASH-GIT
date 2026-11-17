// LE BANC DU PILOTE DE QUALITÉ (2026-11-17, lot « pilote », copié de outils/banc-doux/doux.cjs). UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde),
// iPhone émulé 844×390 DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai, SANS ?tel=1 ; le profil vient de ?appareil=. Les conditions du téléphone sont posées à la main
// (window.__ccThermique / __ccBranche / __ccEco / __ccBatterie avant le chargement, puis dbgPiloteSim / dbgThermique) : des compteurs déterministes, aucune mesure de temps.
//   node outils/banc-pilote/pilote.cjs --mode etat|depart|scenario|refroidit|rouge [--essais "tag:iPhone14,2:q:plus:cond;…"] [--q "sans=pilote"] [--jeu <dossier>] [--s 60]
//   cond = t1+B1+E1+bat50 (thermique, branché, économie, batterie) ; q = fast|haute|auto (auto : jamais choisi)
// etat      : une course, le relevé complet (dbgGouvPaliers, dbgNette, imgRegle, dbgPrf, cadence) à nominal, fair, serious, branché, critical — pour comparer ?sans=pilote à la branche d'avant (--jeu).
// depart    : le niveau et le cran posés au chargement (menu) puis au départ de la course, selon les conditions.
// scenario  : branché + économie, thermique 0 → 1 → 2 → 3 (une course de --s secondes par état, un portail au milieu, une mort à la fin) : crans, moments, toiles refaites, cadence.
// refroidit : critical puis serious, fair, nominal (une course par état) : le cran doit remonter.
// rouge     : des images ratées simulées (dbgPiloteSim rates) puis une marge (vrai bas) : crans [C] en course, dette au portail et à la mort, bleu.
// Une ligne JSON par essai. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const MODE = A.mode || 'depart', [W, H] = [844, 390], P_HTTP = +(A.http || 9981), P_CDP = +(A.cdp || 9982), SEC = +(A.s || 60);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ESSAIS = (A.essais || 'froid:iPhone14,2:auto::t0+B0+E0+bat80').split(';').filter(Boolean).map(s => { const [tag, ap, q, plus, cond] = s.split(':'); return { tag, ap, q: q || 'auto', plus: (plus || '').split('+').filter(Boolean).join('&'), cond: cond || '' }; });
const COMPTEUR = "(function(){try{var P=HTMLCanvasElement.prototype,gc=P.getContext;window.__bancToile={ev:[]};P.getContext=function(t){var r=gc.apply(this,arguments);try{if(r&&/webgl/.test(String(t)))this.__bancGl=1;}catch(e){}return r;};"
  + "['width','height'].forEach(function(k){var d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){try{if(this.__bancGl&&d.get.call(this)!==+v)window.__bancToile.ev.push([Math.round(performance.now()),k,d.get.call(this),+v,(function(){try{var s=dbgState();return !s.started?'menu':s.gameOver?'mort':'course'}catch(e){return '?'}})()]);}catch(e){}return d.set.call(this,v);}});});}catch(e){}})();";
const ETAT = `(function(){var o={};try{o.gouv=dbgGouvPaliers();delete o.gouv.lourd;}catch(e){o.gouvErr=String(e.message)}try{o.nette=dbgNette();}catch(e){}try{o.img=imgRegle();}catch(e){}
  try{var p=dbgPrf();o.prf={niveau:p.niveau,reglage:p.reglage,fps:p.fps,plafond:p.plafond,toile:p.toile,ombre:p.ombre,halo:p.halo,ql:p.ql}}catch(e){}try{var c=dbgCadence();o.cad={on:c.on,gel:c.gel}}catch(e){}
  try{o.cadPer=dbgPilote?dbgPilote().cadPer:null}catch(e){}return JSON.stringify(o)})()`;
const PIL = `(function(){try{var p=dbgPilote();return JSON.stringify({on:p.on,K:p.K,vise:p.vise,niveau:p.niveau,plafond:p.plafond,auto:p.auto,src:p.src,cle:p.cle,table:p.table,zone:p.zone,per:p.per,tic:p.tic,cadPer:p.cadPer,retailles:p.retailles,dettes:p.dettes,img:p.img,qlMin:p.qlMin,poly:p.poly,histo:p.histo,chg:p.changements,mur:p.mur})}catch(e){return JSON.stringify({err:String(e.message)})}})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  const ev = async (x, t) => { try { return await c.ev(x, t); } catch (e) { return null; } };
  const pil = async () => { const s = await ev(PIL); try { return JSON.parse(s); } catch (e) { return { err: String(s) }; } };
  const pret = async () => { for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) return true; } catch (e) {} } return false; };
  const voile = async () => { await ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500); };
  const enCourse = async () => !!(await ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"));
  const lance = async () => { let ok = false; for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) await ev('dbgJouer()'); await dormir(500); ok = await enCourse(); } if (ok) await ev('dbgAuto(1,0,{nit:1});1'); return ok; };
  const mort = async () => { await ev("dbgJuge('fin')"); await dormir(2500); };
  /* une course tenue s secondes : relancée si elle meurt (le pilote auto peut tomber) ; un portail au milieu si demandé ; relevé toutes les 5 s */
  const tient = async (s, tag, portail, suivi) => { const t0 = Date.now(); let p = false, morts = 0;
    while (Date.now() - t0 < s * 1000) { await dormir(1000);
      if (!(await enCourse())) { if (await ev('dbgState().gameOver')) { morts++; await ev('dbgJouer()'); await dormir(3000); await ev('dbgAuto(1,0,{nit:1});1'); } }
      const e = Math.round((Date.now() - t0) / 1000);
      if (portail && !p && e >= s / 2) { p = true; const r = await ev("JSON.stringify(dbgSaut())"); suivi.push({ ph: tag, t: e, portail: r ? String(r).slice(0, 60) : null }); }
      if (e % 5 === 0) { const o = await pil(); suivi.push({ ph: tag, t: e, K: o.K, vise: o.vise, n: o.niveau, zone: o.zone, dpr: o.img && o.img.dpr, cadPer: o.cadPer }); } }
    return morts; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: COMPTEUR });
    let idScript = null;
    for (const E of ESSAIS) {
      exc = []; cons = [];
      const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
      if (E.q !== 'auto') { SAVE.q = E.q; SAVE.qChoisi = 1; }
      const C = {}; for (const x of E.cond.split('+').filter(Boolean)) { const m = /^([a-zA-Z]+)(-?\d+)$/.exec(x); if (m) C[m[1]] = +m[2]; }
      let pose = 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}';
      if (C.t != null) pose += `window.__ccThermique=${C.t};`; if (C.B != null) pose += `window.__ccBranche=${C.B ? 2 : 1};`; if (C.E != null) pose += `window.__ccEco=${C.E};`; if (C.bat != null) pose += `window.__ccBatterie=${C.bat};`;
      if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: pose })).identifier;
      await c.send('Page.navigate', { url: 'about:blank' }); await dormir(400);
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7&appareil=${E.ap}` + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      const R = { essai: E, mode: MODE, q: A.q || '', jeu: A.jeu ? path.basename(JEU) : 'branche' };
      if (!(await pret())) { R.erreur = 'pas prêt'; R.exc = exc; console.log(JSON.stringify(R)); continue; }
      await dormir(1500); await voile();
      if (MODE === 'depart') { await dormir(2500); R.menu = await pil(); R.menuEtat = JSON.parse(await ev(ETAT)); }
      R.course = await lance();
      if (!R.course) { R.erreur = 'course pas lancée'; R.exc = exc; console.log(JSON.stringify(R)); continue; }
      const suivi = [];
      if (MODE === 'etat') {
        R.etats = {}; const lit = async () => JSON.parse(await ev(ETAT));
        await tient(6, 'n', false, suivi); R.etats.nominal = await lit();
        await ev('dbgThermique(1)'); await tient(3, 'f', false, suivi); R.etats.fair = await lit();
        await ev('dbgThermique(2)'); await tient(3, 's', false, suivi); R.etats.serious = await lit();
        await ev('window.__ccBranche=2;1'); await tient(3, 'b', false, suivi); R.etats.branche = await lit();
        await ev('dbgThermique(3)'); await tient(3, 'c', false, suivi); R.etats.critical = await lit();
      } else if (MODE === 'depart') {
        await dormir(4000); R.depart = await pil(); R.departEtat = JSON.parse(await ev(ETAT));
        await tient(SEC, 'course', false, suivi); R.fin = await pil();
      } else if (MODE === 'scenario' || MODE === 'refroidit') {
        const T = MODE === 'scenario' ? [0, 1, 2, 3] : [3, 2, 1, 0]; R.phases = [];
        await ev('window.__bancToile.ev.length=0;1');
        for (let i = 0; i < T.length; i++) { const t = T[i];
          await ev(`dbgPiloteSim({t:${t}});1`); const a = await pil();
          const m = await tient(SEC, 't' + t, true, suivi); const b = await pil();
          R.phases.push({ t, entree: { K: a.K, vise: a.vise, n: a.niveau }, avantMort: { K: b.K, vise: b.vise, n: b.niveau, zone: b.zone, cadPer: b.cadPer, dpr: b.img && b.img.dpr }, mortsAuto: m });
          await mort(); const d = await pil(); R.phases[i].apresMort = { K: d.K, vise: d.vise, n: d.niveau, dpr: d.img && d.img.dpr };
          await lance(); await dormir(2000); const e = await pil(); R.phases[i].depart = { K: e.K, vise: e.vise, n: e.niveau, dpr: e.img && e.img.dpr }; }
        R.fin = await pil();
        R.toile = JSON.parse(await ev("JSON.stringify((window.__bancToile||{ev:[]}).ev)"));
      } else if (MODE === 'rouge') {
        await ev('window.__bancToile.ev.length=0;1');
        await tient(8, 'calme', false, suivi);
        await ev('dbgPiloteSim({rates:.15});1'); await tient(30, 'rouge', false, suivi); R.rouge = await pil();
        await ev('dbgSaut();1'); await dormir(2500); R.apresPortail = await pil();
        await tient(15, 'rouge2', false, suivi);
        await mort(); R.apresMort = await pil(); await ev('dbgPiloteSim({rates:0,vrai:8});1'); await lance(); await dormir(2000); R.depart2 = await pil();
        await tient(SEC + 10, 'bleu', false, suivi); R.bleu = await pil();
        await mort(); R.apresMort2 = await pil();
        R.toile = JSON.parse(await ev("JSON.stringify((window.__bancToile||{ev:[]}).ev)"));
      }
      R.suivi = suivi;
      try { R.journal = JSON.parse(await ev("JSON.stringify(dbgErreurs().filter(function(e){return e.g==='pilote'}).map(function(e){return e.m+(e.n>1?' ×'+e.n:'')}))")); } catch (e) {}
      try { R.pannes = JSON.parse(await ev("JSON.stringify(dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie','pilote','radio'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)}))")); } catch (e) {}
      R.exc = exc; R.cons = cons;
      console.log(JSON.stringify(R));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
