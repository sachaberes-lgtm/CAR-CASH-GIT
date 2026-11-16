// LE BANC « VOITURE ET TRAÎNÉES SUR TÉLÉPHONE » (2026-11-13, finition iPhone, Sacha : « les traînées et la voiture, ça doit être PARFAIT »).
// UN Chrome sans fenêtre et muet, au format de l'iPhone 13 Pro (844×390 couché, 390×844 debout, DPR 3, tactile émulé, ?tel=1&garde=1),
// la boucle menée À LA MAIN (rAF neutralisé, dbgStep à 33 ms : la cadence du téléphone, des images figées — le Mac saturé ne compte pas).
//   node outils/banc-finition/gfx.cjs --out <dossier> --tag avant [--fmt couche|debout] [--carte nuages|jade] [--meteo midi] [--q "sans=x"]
//        [--trx aucune,grille,hyper] [--chaud 0|2|3|4] [--pas 150] [--vues 1] [--js "expr"] [--mesure 1] [--sonde "expr"]
// Par traînée : <tag>-<fmt>-<carte>-<trx>[-chaudN]-jeu.png (l'image entière) et -zoom.png (la caisse et sa traînée, recadrées, ×3 au pixel près).
// --vues 1 : en plus, la caisse de trois quarts arrière et de profil (dbgView, en pause). --mesure 1 : coût CPU de la boucle (ms par pas, médiane) et appels de dessin.
// Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', METEO = A.meteo || '', TAG = A.tag || 'essai', CHAUD = +(A.chaud || 0), PAS = +(A.pas || 150), DSF = +(A.dsf || 3);
const TRX = (A.trx || 'aucune').split(',');
const P_HTTP = +(A.http || 9851), P_CDP = +(A.cdp || 9852);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} });
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 60000); const f = path.join(OUT, nom); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); return f; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&prebati=0&carte=${CARTE}${METEO ? '&meteo=' + METEO : ''}&pistegraine=7` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    let ok = false;
    for (let i = 0; i < 200 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    /* la boucle à la main : plus de rAF, des pas de 33 ms (30 i/s, la cadence du téléphone) */
    await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1});1");
    await dormir(300);
    if (A.js) console.log('js', JSON.stringify(await c.ev(A.js)));
    await c.ev(MASQUE);
    /* ⚠ la boucle SAUTE une image appelée moins de 33 ms (horloge réelle) après la précédente (la cadence calée du téléphone, cadSaute) : un pas toutes les 36 ms, dans la page */
    const pas = async n => { for (let k = 0; k < n; k += 30) await c.ev(`(async function(){try{dbgNitro(9,0)}catch(e){};for(var i=0;i<${Math.min(30, n - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 180000); };
    await pas(PAS);
    if (CHAUD) { console.log('chaud', JSON.stringify(await c.ev(`(function(){dbgThermique(${CHAUD});try{window.__ccBranche=${CHAUD >= 4 ? 2 : 0};}catch(e){}return 1})()`))); await dormir(1300); await pas(45); await dormir(1300); await pas(45); }
    const base = `${TAG}-${FMT}-${CARTE}`, zc = FMT === 'debout' ? [45, 400, 300, 300] : [272, 110, 300, 230];
    for (const id of TRX) {
      if (id !== 'aucune') { await c.ev(`dbgTrx(${JSON.stringify(id)})`); await pas(75); } else await pas(15);
      const et = await c.ev("(function(){var s=dbgState(),q=dbgQual(),g=dbgGouv();return JSON.stringify({go:s.gameOver,mode:s.mode,vH:s.vH,cran:q.k,dpr:q.dpr,bloom:q.bloom,ombre:q.ombre,pal:g.gpu&&g.gpu.palier,trx:dbgTrx(),toile:dbgScene().rdr.domElement.width+'x'+dbgScene().rdr.domElement.height})})()");
      const n = `${base}-${id}${CHAUD ? '-chaud' + CHAUD : ''}`;
      /* le recadrage SUIT la caisse (sa position projetée à l'écran), un peu décalé vers le bas : la poupe et le départ des traînées */
      const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
      const zw = 300, zh = FMT === 'debout' ? 300 : 230, zx = Math.max(0, Math.min(W - zw, Math.round(pc[0] - zw / 2))), zy = Math.max(0, Math.min(H - zh, Math.round(pc[1] - zh * .42)));
      await shot(n + '-jeu.png'); await shot(n + '-zoom.png', [zx, zy, zw, zh]);
      console.log(n, et);
      if (A.sonde && id !== 'aucune') console.log('sonde', JSON.stringify(await c.ev(A.sonde, 120000)));
      if (JSON.parse(et).go) { console.log('partie finie'); break; }
    }
    if (A.ab === '1') { /* LA MÊME IMAGE avec et sans « la caisse nette au nitro » : photo, bascule du programme, un pas, photo */
      const z = async nom => { const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
        const zw = 220, zh = 170; await shot(nom, [Math.max(0, Math.min(W - zw, Math.round(pc[0] - zw / 2))), Math.max(0, Math.min(H - zh, Math.round(pc[1] - zh * .5))), zw, zh]); };
      console.log('ab', JSON.stringify(await c.ev('dbgGfxFin()')));
      await z(`${TAG}-${FMT}-${CARTE}-net1.png`); await c.ev('dbgGfxFin(0);1'); await dormir(60); await pas(1); await dormir(400); await pas(1); await z(`${TAG}-${FMT}-${CARTE}-net0.png`); await c.ev('dbgGfxFin(1);1'); await dormir(60); await pas(2);
    }
    if (A.mesure === '1') {
      const m = await c.ev("(async function(){var t=[];for(var i=0;i<90;i++){var a=performance.now();dbgStep(1,33);t.push(performance.now()-a);await new Promise(function(r){setTimeout(r,36)});}t.sort(function(x,y){return x-y});var ap=null;try{var q=dbgAppels(0);ap={appels:q.appels,tri:q.triangles};}catch(e){ap=String(e)}return JSON.stringify({med:+t[45].toFixed(2),p10:+t[9].toFixed(2),p90:+t[81].toFixed(2),ap:ap,trx:dbgTrx()})})()", 180000);
      console.log('mesure', m);
    }
    if (A.vues === '1') {
      const ang = await c.ev("(function(){var g=dbgScene().car;return g.rotation.y})()");
      const V = [['arr34', ang + Math.PI + .6, 5.2, 1.7], ['profil', ang + Math.PI / 2, 5.4, 1.1], ['av34', ang - .7, 5.4, 1.5]];
      for (const v of V) { await c.ev(`dbgView(${v[1]},${v[2]},${v[3]});try{dbgFlou({s:0})}catch(e){};dbgView(${v[1]},${v[2]},${v[3]});1`); await dormir(200); await shot(`${base}${CHAUD ? '-chaud' + CHAUD : ''}-vue-${v[0]}.png`); }
    }
    /* dbgErreurs = l'historique de la boîte noire : sur un Mac saturé il est plein de « gel » / « serpent » (images en retard) et de « son » (muet) — on ne garde que le reste (les « panne » surtout) */
    console.log('pannes', JSON.stringify(await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()")), 'exceptions', JSON.stringify(exc.slice(0, 5)), 'console', JSON.stringify(cons.slice(0, 6)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
