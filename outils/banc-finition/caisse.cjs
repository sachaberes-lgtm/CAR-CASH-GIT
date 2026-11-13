// LE BANC « LA CAISSE NETTE » (2026-11-13, finition iPhone, Sacha : « la voiture EN JEU pourrait être plus belle et plus NETTE »).
// Même socle que gfx.cjs (UN Chrome sans fenêtre et muet, iPhone 13 Pro émulé, boucle menée à la main à 33 ms). Sur la MÊME image de la course, il photographie
// la caisse recadrée (pixels d'écran, ×3) dans chaque variante demandée :
//   node outils/banc-finition/caisse.cjs --out <dossier> --tag t [--fmt couche|debout] [--carte nuages|jade] [--meteo nuit] [--caisse 0,4,9] [--pas 240]
//        [--var "avant:dbgLoupe({on:0});;loupe:dbgLoupe({on:1});;verite:dbgLoupe({on:0});dbgDPR(3)"] [--chaud 2] [--q "sans=x"] [--js "expr"] [--plein 1] [--vues 1]
// --var : nom:expression, séparés par « ;; » ; après chaque expression l'image est redessinée sans avancer (dbgLoupe({rendre:1})). --plein 1 : l'image entière aussi.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', METEO = A.meteo || '', TAG = A.tag || 'essai', CHAUD = +(A.chaud || 0), PAS = +(A.pas || 240), DSF = +(A.dsf || 3);
const CAISSES = (A.caisse || '0').split(',').map(Number);
const VAR = (A.var || 'avant:dbgLoupe({on:0});;loupe:dbgLoupe({on:1})').split(';;').map(s => { const i = s.indexOf(':'); return [s.slice(0, i), s.slice(i + 1)]; });
const P_HTTP = +(A.http || 9861), P_CDP = +(A.cdp || 9862);
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
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} });
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 120000); const f = path.join(OUT, nom); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); return f; };
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
    for (let i = 0; i < 500; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    let ok = false;
    for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:" + (A.nitro === '0' ? 0 : 1) + "});1");
    await dormir(300);
    await c.ev(MASQUE);
    if (!CHAUD) await c.ev('dbgQual(1);1');
    if (A.js) console.log('js', JSON.stringify(await c.ev(A.js)));
    const pas = async n => { for (let k = 0; k < n; k += 30) await c.ev(`(async function(){try{${A.nitro === '0' ? '' : 'dbgNitro(9,0)'}}catch(e){};for(var i=0;i<${Math.min(30, n - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000); };
    await pas(PAS);
    if (CHAUD) { console.log('chaud', JSON.stringify(await c.ev(`(function(){dbgThermique(${CHAUD});try{window.__ccBranche=${CHAUD >= 4 ? 2 : 0};}catch(e){}return 1})()`))); await dormir(1300); await pas(45); await dormir(1300); await pas(45); }
    for (const ci of CAISSES) {
      if (ci !== CAISSES[0] || ci !== 0) { await c.ev(`dbgLoupe({caisse:${ci}});1`); await pas(20); }
      const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
      const zw = +(A.zw || 230), zh = +(A.zh || 170), zx = Math.max(0, Math.min(W - zw, Math.round(pc[0] - zw / 2))), zy = Math.max(0, Math.min(H - zh, Math.round(pc[1] - zh * .62)));
      for (const [nom, expr] of VAR) {
        const r = await c.ev(`(function(){try{${expr};}catch(e){return 'ERR '+e.message}dbgLoupe({rendre:1});var q=dbgQual(),L=dbgLoupe();var gl=dbgScene().rdr.getContext();return JSON.stringify({dpr:q.dpr,cran:q.k,loupe:L.on,toile:gl.drawingBufferWidth+'x'+gl.drawingBufferHeight,scene:L.scene,disque:L.disque,pxDisque:L.pxDisque,caisse:${ci}})})()`, 120000);
        await dormir(300); await c.ev('dbgLoupe({rendre:1});1'); await dormir(350); /* deux rendus : sur un Mac saturé, la photo prenait parfois l'image d'avant */
        const n = `${TAG}-${FMT}-${CARTE}${METEO ? '-' + METEO : ''}-c${ci}${CHAUD ? '-chaud' + CHAUD : ''}-${nom}`;
        await shot(n + '.png', [zx, zy, zw, zh]); if (A.plein === '1') await shot(n + '-plein.png');
        console.log(n, r);
      }
      await c.ev('dbgLoupe({on:null});try{dbgQual(1)}catch(e){};1');
    }
    if (A.trans === '1') { /* LES BASCULES : chaud → la toile reprend la taille de la scène ; pivot du téléphone loupe posée ; retour au frais */
      const et = async nom => { await pas(4); await dormir(400); const r = await c.ev("(function(){var L=dbgLoupe(),gl=dbgScene().rdr.getContext(),cv=dbgScene().rdr.domElement;return JSON.stringify({on:L.on,chaud:L.chaud,vraie:gl.drawingBufferWidth+'x'+gl.drawingBufferHeight,vue:cv.width+'x'+cv.height,css:cv.style.width+' '+cv.style.height,bascules:L.bascules,dpr:dbgQual().dpr,th:dbgGouv().thermo})})()"); console.log('trans', nom, r); await shot(`${TAG}-${FMT}-trans-${nom}.png`); };
      await c.ev('dbgLoupe({on:null});1'); await et('froid');
      await c.ev('dbgThermique(2);1'); await dormir(1300); await et('chaud2');
      await c.ev('dbgThermique(0);1'); await dormir(1300); await et('refroidi');
      await c.ev('dbgLoupe({on:1});1'); await et('force');
      await c.send('Emulation.setDeviceMetricsOverride', { width: H, height: W, deviceScaleFactor: DSF, mobile: true, screenWidth: H, screenHeight: W }); await dormir(1500); await et('pivot');
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: true, screenWidth: W, screenHeight: H }); await dormir(1500); await et('retour');
      await c.ev('dbgLoupe({on:null});1');
    }
    if (A.mesure === '1') console.log('mesure', await c.ev("(function(){var o=[];for(var v=0;v<2;v++){dbgLoupe({on:v});var I=dbgScene().rdr.info;I.autoReset=false;I.reset();dbgLoupe({rendre:1});o.push({loupe:v,appels:I.render.calls,tri:I.render.triangles});I.autoReset=true;}dbgLoupe({on:null});return JSON.stringify(o)})()", 120000));
    console.log('pannes', JSON.stringify(await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()")), 'exceptions', JSON.stringify(exc.slice(0, 5)), 'console', JSON.stringify(cons.slice(0, 8)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
