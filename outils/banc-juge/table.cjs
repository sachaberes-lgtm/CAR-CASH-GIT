// LA TABLE DES PROFILS AU BANC (2026-11-15, chantier QUALITÉ PAR APPAREIL, lot profils2 : « la table des profils recalée sur la mesure »).
// UN Chrome sans fenêtre et MUET ; pour chaque essai : l'écran du modèle (points CSS couchés, DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai ; JAMAIS ?tel=1),
// la page neuve (localStorage vidé, sauvegarde muette avec le réglage), le jeu prêt, puis dbgPrf() : classe, famille, niveau, budget, DPR, pixels de scène, toile, cadence.
//   node outils/banc-juge/table.cjs [--course 6 (secondes de course avant la lecture ; 0 = au menu)] [--jeu "VERSION PRINCIPALE"] [--essais "iPhone14,2:fast;iPhone14,3:haute:926x428"] [--pc 1] [--q "x=1"] [--http 9821] [--cdp 9822]
// Un essai = <appareil|->:<fast|haute|neuf>[:<L>x<H>][:<paramètres d'URL en plus, séparés par +>]. Sans taille : la taille du modèle (table ECRANS), sinon 844×390.
// --pc 1 : sans aucune émulation (l'ordinateur). Sortie : une ligne JSON par essai.
// Avant de lancer : au plus 3 Chrome de banc sur le Mac (on attend) ; le Chrome est fermé à la fin.
const path = require('path'), cp = require('child_process');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const PC = A.pc === '1', COURSE = +(A.course || 6), P_HTTP = +(A.http || 9821), P_CDP = +(A.cdp || 9822);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
/* les écrans (points CSS, couchés) des modèles du banc */
const ECRANS = { 'iPhone13,1': [780, 360], 'iPhone13,2': [844, 390], 'iPhone13,4': [926, 428], 'iPhone14,2': [844, 390], 'iPhone14,3': [926, 428], 'iPhone14,4': [812, 375], 'iPhone14,5': [844, 390],
  'iPhone14,6': [667, 375], 'iPhone14,7': [844, 390], 'iPhone15,4': [852, 393], 'iPhone15,5': [932, 430], 'iPhone16,1': [852, 393], 'iPhone17,1': [874, 402], 'iPhone17,2': [956, 440], 'iPhone17,3': [852, 393],
  'iPhone17,5': [844, 390], 'iPhone18,1': [874, 402], 'iPhone12,1': [896, 414] };
const ESSAIS = (A.essais || 'iPhone14,2:fast').split(';').filter(Boolean).map(s => { const p = s.split(':'); let wh = null, plus = '';
  for (const x of p.slice(2)) { if (/^\d+x\d+$/.test(x)) wh = x.split('x').map(Number); else plus = x.split('+').filter(Boolean).join('&'); }
  return { ap: p[0], q: p[1] || 'neuf', wh: wh || ECRANS[p[0]] || [844, 390], plus }; });
function chromes() { try { return cp.execSync("pgrep -fl 'remote-debugging-port' || true").toString().split('\n').filter(l => /MacOS\/Google Chrome --/.test(l)).length; } catch (e) { return 0; } }
const LIT = "(function(){var o={};try{var p=dbgPrf();o.p={on:p.on,classe:p.classe,classeModele:p.classeModele,famille:p.famille,q:p.reglage,n:p.niveau,nMax:p.niveauMax,pc:p.imagePC,fps:p.fps,dpr:p.plafond,budget:p.budgetPx,scenePx:p.scenePx,soixante:p.soixante,src:p.src,"
  + "toile:p.toile,ombre:p.ombre&&{taille:p.ombre.taille,filtre:p.ombre.filtre},halo:p.halo&&{res:p.halo.res,etages:p.halo.etages},ql:p.ql,sobres:p.sobres}}catch(e){o.p='err '+e.message}"
  + "try{var r=dbgScene().rdr;o.toile=[r.domElement.width,r.domElement.height]}catch(e){}try{o.cad={vise:dbgGouv().vise}}catch(e){}"
  + "try{var s=dbgState();o.enCourse=!!(s.started&&s.running&&!s.gameOver)}catch(e){}return JSON.stringify(o)})()";
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  for (let i = 0; chromes() >= 3; i++) { if (i % 12 === 0) console.error('banc : ' + chromes() + ' Chrome de banc sur le Mac, on attend…'); await dormir(5000); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    let id = null;
    for (const E of ESSAIS) {
      exc = [];
      const [W, H] = E.wh;
      if (!PC) {
        await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
        await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
        await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
        await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
      }
      const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
      if (E.q !== 'neuf') { SAVE.q = E.q; SAVE.qChoisi = 1; }
      const tok = E.ap + '-' + Date.now();
      if (id) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: id });
      id = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(sessionStorage.__banc!=="' + tok + '"){sessionStorage.clear();sessionStorage.__banc="' + tok + '";localStorage.clear();}localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' })).identifier;
      await c.send('Page.navigate', { url: 'about:blank' }); await dormir(300);
      const qs = (E.ap && E.ap !== '-' ? '&appareil=' + E.ap : '') + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7${qs}` });
      let pret = false; for (let i = 0; i < 240 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgPrf==='function'", 8000); } catch (e) {} }
      await dormir(1500);
      if (COURSE > 0) { /* une course (pilote auto) : la toile de COURSE (au menu, la vitrine a la sienne) */
        await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()").catch(() => {});
        await dormir(1000); let ok = false;
        for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
        if (ok) { try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } await dormir(COURSE * 1000);
      }
      const out = { essai: E.ap + ':' + E.q + (E.plus ? ':' + E.plus : ''), ecran: W + 'x' + H, pret };
      try { Object.assign(out, JSON.parse(await c.ev(LIT))); } catch (e) { out.err = String(e.message).slice(0, 200); }
      out.exc = exc;
      console.log(JSON.stringify(out));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
