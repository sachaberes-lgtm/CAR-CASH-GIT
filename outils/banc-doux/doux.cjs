// LE BANC DU GOUVERNEUR DOUX (2026-11-14, chantier QUALITÉ PAR APPAREIL, lot « doux »). UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde),
// iPhone émulé 844×390 DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai, SANS ?tel=1 ; le profil vient de ?appareil=.
//   node outils/banc-doux/doux.cjs --mode table|ql|photo [--essais "N1:iPhone14,2:fast;N2:iPhone14,2:haute"] [--q "sans=gouvdoux"] [--out <dossier>] [--http 9971] [--cdp 9972]
// table : une course au pilote auto ; à chaque état (nominal, fair, serious, serious 150 s, serious + branché, critical) le relevé : DPR de la scène, toile, halo (allumé, étages,
//         résolution), QUAL_LOW, ombre, loupe, cran QL et plancher, cadence visée, palier du gouverneur.
// ql    : serious (+ branché) puis un téléphone LENT simulé (`dbgGouvLent(ms)` : ms de travail × (DPR/plafond)² par image, un coût qui suit les pixels) ; on suit le cran QL, le DPR
//         et les écritures de la toile (chaque groupe = une réallocation) seconde par seconde ; puis la lenteur s'arrête et l'échelle doit remonter.
// photo : serious + branché, la boucle menée à la main (dbgStep 33 ms, rAF coupé, échelle figée) : la MÊME image ; image entière + zoom caisse + zoom traînées.
// Une ligne JSON par essai. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const MODE = A.mode || 'table', [W, H] = [844, 390], P_HTTP = +(A.http || 9971), P_CDP = +(A.cdp || 9972);
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ESSAIS = (A.essais || 'N1:iPhone14,2:fast').split(';').filter(Boolean).map(s => { const [tag, ap, q, plus] = s.split(':'); return { tag, ap, q: q || 'fast', plus: (plus || '').split('+').filter(Boolean).join('&') }; });
const COMPTEUR = "(function(){try{var P=HTMLCanvasElement.prototype,gc=P.getContext;window.__bancToile={ev:[]};P.getContext=function(t){var r=gc.apply(this,arguments);try{if(r&&/webgl/.test(String(t)))this.__bancGl=1;}catch(e){}return r;};"
  + "['width','height'].forEach(function(k){var d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){try{if(this.__bancGl)window.__bancToile.ev.push([Math.round(performance.now()),k,d.get.call(this),+v]);}catch(e){}return d.set.call(this,v);}});});}catch(e){}})();";
const LIT = `(function(){var o={};try{var r=dbgScene().rdr,gl=r.getContext();o.toile=[gl.drawingBufferWidth,gl.drawingBufferHeight];var g=imgRegle();o.dpr=g.dpr;o.cap=g.cap;o.halo=g.halo;o.mips=g.mips;o.ombre=g.ombre;o.ciel=g.ciel;o.stries=g.stries;o.ql=g.ql;o.bloom=g.halo>0;}catch(e){o.err=String(e.message)}
  try{o.tier=dbgPerf().tier;o.qualLow=o.tier==='LOW'}catch(e){}
  try{var L=dbgLoupe();o.loupe=L.on;o.loupeChaud=L.chaud;o.scene=L.scene}catch(e){}
  try{var G=dbgGouvPaliers();o.palier=G.palier;o.qlMin=G.qlMin;o.doux=G.doux;o.long=G.long;o.branche=G.branche;o.ventK=G.ventK;o.emiK=G.emiK}catch(e){}
  try{var d=dbgGouv();o.thermo=d.thermo}catch(e){}
  try{var c=dbgCadence();o.cale=c.on;o.gel=c.gel;o.cad=!c.on?60:(o.thermo>=3?20:30)}catch(e){}
  try{var p=dbgPrf();o.n=p.niveau;o.q=p.reglage}catch(e){}
  try{var n=dbgNette();o.kNet=n.kNet;o.kBas=n.kBas}catch(e){}
  try{var s=dbgState();o.course=!!(s.started&&s.running&&!s.gameOver)}catch(e){}
  return JSON.stringify(o)})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  const lit = async () => JSON.parse(await c.ev(LIT));
  const pret = async () => { for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) return true; } catch (e) {} } return false; };
  const voile = async () => { await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500); };
  const enCourse = () => c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()");
  const relance = async () => { try { if (await c.ev('dbgState().gameOver')) { try { await c.ev('dbgJouer()'); } catch (e) {} await dormir(3000); try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} return 1; } } catch (e) {} return 0; };
  const lance = async () => { let ok = false; for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await enCourse(); } catch (e) {} } if (ok) { try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } return ok; };
  const attend = async s => { const t0 = Date.now(); let m = 0; while (Date.now() - t0 < s * 1000) { await dormir(1000); m += await relance(); } return m; };
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 120000); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
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
      const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: E.q, qChoisi: 1 };
      if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' })).identifier;
      await c.send('Page.navigate', { url: 'about:blank' }); await dormir(400);
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7&appareil=${E.ap}` + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      const R = { essai: E, mode: MODE, q: A.q || '' };
      if (!(await pret())) { R.erreur = 'pas prêt'; R.exc = exc; console.log(JSON.stringify(R)); continue; }
      await dormir(1500); await voile();
      R.course = await lance();
      if (!R.course) { R.erreur = 'course pas lancée'; R.exc = exc; console.log(JSON.stringify(R)); continue; }
      if (MODE === 'table') {
        R.etats = {};
        await attend(6); R.etats.nominal = await lit();
        await c.ev('dbgThermique(1)'); await attend(3); R.etats.fair = await lit();
        await c.ev('dbgThermique(2)'); await attend(3); R.etats.serious = await lit();
        await c.ev('dbgGouvLong(150)'); await attend(3); R.etats.serious150 = await lit();
        await c.ev('dbgGouvLong(0);window.__ccBranche=2;1'); await attend(3); R.etats.branche = await lit();
        await c.ev('dbgThermique(3)'); await attend(3); R.etats.critical = await lit();
      } else if (MODE === 'ql') {
        /* serious + branché (le cas de Sacha), la mesure seule doit décider ; puis le téléphone lent ; puis la lenteur s'arrête */
        await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await attend(4);
        const L = +(A.lent || 40), T1 = +(A.t1 || 60), T2 = +(A.t2 || 120);
        R.depart = await lit();
        await c.ev('window.__bancToile.ev.length=0;1');
        const suivi = []; const pas = async (s, tag) => { const t0 = Date.now(); while (Date.now() - t0 < s * 1000) { await dormir(1000); await relance();
          const o = JSON.parse(await c.ev("(function(){var g=imgRegle(),n=dbgNette(),L=dbgLoupe(),c=dbgCadence();return JSON.stringify({ql:g.ql,dpr:g.dpr,halo:g.halo,loupe:L.on,gel:c.gel,ef:n.kNet,toile:(window.__bancToile||{ev:[]}).ev.length})})()"));
          o.t = Math.round((Date.now() - t0) / 1000); o.ph = tag; suivi.push(o); } };
        await c.ev(`dbgGouvLent(${L});1`); await pas(T1, 'lent');
        R.lent = await lit();
        await c.ev('dbgGouvLent(0);1'); await pas(T2, 'frais');
        R.frais = await lit();
        /* le résumé : chaque changement de cran, et les groupes d'écritures de la toile (réallocations) */
        const ch = []; for (let i = 0; i < suivi.length; i++) { const a = suivi[i - 1], b = suivi[i]; if (!a || a.ql !== b.ql || a.dpr !== b.dpr || a.loupe !== b.loupe) ch.push(b); }
        R.changements = ch;
        R.toile = JSON.parse(await c.ev("JSON.stringify((function(){var g=[],ev=(window.__bancToile||{ev:[]}).ev;for(var i=0;i<ev.length;i++){var e=ev[i],d=g[g.length-1];if(!d||e[0]-d.t>8)g.push(d={t:e[0],w:null,h:null,n:0,change:false});d.n++;d[e[1]==='width'?'w':'h']=e[3];if(e[2]!==e[3])d.change=true;}return g})())"));
      } else if (MODE === 'photo') {
        await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await attend(4);
        R.avant = await lit();
        await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1});try{dbgPin(true)}catch(e){};1");
        await dormir(300);
        const N = +(A.pas || 300);
        for (let k = 0; k < N; k += 30) await c.ev(`(async function(){try{dbgNitro(9,0)}catch(e){};for(var i=0;i<${Math.min(30, N - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000);
        await c.ev('dbgLoupe({rendre:1});1'); await dormir(400); await c.ev('dbgLoupe({rendre:1});1'); await dormir(300);
        R.releve = await lit();
        R.caisse = JSON.parse(await c.ev("(function(){var S=dbgScene(),p=S.car.position,v=p.clone().project(S.cam);return JSON.stringify({pos:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)],ecran:[(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight]})})()"));
        const pc = R.caisse.ecran, b = E.tag;
        await shot(`${b}-jeu.png`);
        const zx = Math.max(0, Math.min(W - 240, Math.round(pc[0] - 120))), zy = Math.max(0, Math.min(H - 170, Math.round(pc[1] - 105)));
        const tx = Math.max(0, Math.min(W - 380, Math.round(pc[0] - 190))), ty = Math.max(0, Math.min(H - 190, Math.round(pc[1] - 23)));
        await shot(`${b}-caisse.png`, [zx, zy, 240, 170]); await shot(`${b}-trainees.png`, [tx, ty, 380, 190]);
      }
      try { R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)})}catch(e){return String(e)}})()"); } catch (e) {}
      R.exc = exc; R.cons = cons;
      console.log(JSON.stringify(R));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
