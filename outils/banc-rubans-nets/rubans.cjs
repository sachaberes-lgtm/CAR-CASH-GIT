// LE BANC DES RUBANS NETS (2026-11-14, chantier QUALITÉ PAR APPAREIL, lot 3 — Sacha : « les traînées de lumière sont mal foutues, elles sont assez floues »).
// UN Chrome sans fenêtre et muet, au format de l'iPhone 13 Pro (844×390 couché / 390×844 debout, DPR 3, tactile émulé), la boucle menée à la main (dbgStep 33 ms),
// ?rubans=1 (le profil forcé : PRF n'est pas encore là). À 150, 450 et 900 km/h (ou le plus vite atteint) : LA MÊME IMAGE redessinée (dbgRubans({refait}) + dbgLoupe({rendre}))
// étape par étape — avant · A (profil) · A+B (plancher) · A+B+C (masque du flou) · A+B+C+D (loupe longue) · zones de la loupe (voir) — en image entière et en zoom
// sur la caisse et ses rubans (pixels d'écran). Écrit aussi les chiffres (dbgRubans, dbgLoupe, sonde de l'alpha) dans <out>/<tag>-chiffres.json.
//   node outils/banc-rubans-nets/rubans.cjs --out <dossier> [--fmt couche|debout] [--carte nuages|jade] [--meteo midi|nuit] [--q "x=y"] [--caisse 9] [--max 900]
// Prendre le verrou du Mac AVANT (sh ~/cash-car/verrou-banc.sh prendre "<qui>") et le rendre APRÈS. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', METEO = A.meteo || '', TAG = (A.tag || 'r') + '-' + FMT + '-' + CARTE, VMAX = +(A.max || 900);
const P_HTTP = +(A.http || 9871), P_CDP = +(A.cdp || 9872);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const ETAPES = [ // nom, réglage posé avant de redessiner
  ['0avant', { net: 0, larg: 0, masque: 0, long: 0 }],
  ['1A', { net: 1, larg: 0, masque: 0, long: 0 }],
  ['2AB', { net: 1, larg: 1, masque: 0, long: 0 }],
  ['3ABC', { net: 1, larg: 1, masque: 1, long: 0 }],
  ['4ABCD', { net: 1, larg: 1, masque: 1, long: 1 }]];

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [], cons = [], chiffres = { fmt: FMT, carte: CARTE, meteo: METEO, prises: [] };
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} });
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&prebati=0&rubans=1&carte=${CARTE}${METEO ? '&meteo=' + METEO : ''}&pistegraine=7` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    let ok = false;
    for (let i = 0; i < 200 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    chiffres.depart = await c.ev("JSON.stringify({rubans:dbgRubans(),loupe:dbgLoupe(),natif:(function(){try{return {tel:matchMedia('(hover:none)').matches,dpr:devicePixelRatio}}catch(e){return null}})()})");
    console.log('départ', chiffres.depart);
    await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:0});dbgRubans({net:0,larg:0,masque:0,long:0,garde:1,compteur:1});1");
    if (A.caisse) console.log('caisse', await c.ev(`JSON.stringify(dbgLoupe({caisse:${+A.caisse}}))`));
    await dormir(300);
    await c.ev(MASQUE);
    const pas = async (n, nit) => { await c.ev(`(async function(){${nit ? 'try{dbgNitro(9,0)}catch(e){}' : ''};for(var i=0;i<${n};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 180000); };
    const kmh = async () => +(await c.ev('dbgRubans().kmh'));
    const prise = async (v) => {
      const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
      const zw = FMT === 'debout' ? 200 : 240, zh = FMT === 'debout' ? 260 : 170, zx = Math.max(0, Math.min(W - zw, Math.round(pc[0] - zw / 2))), zy = Math.max(0, Math.min(H - zh, Math.round(pc[1] - zh * .3)));
      const b = `${TAG}-v${v}`, rec = { v, kmhReel: await kmh(), zoom: [zx, zy, zw, zh], etapes: {} };
      for (const [nom, r] of ETAPES) {
        await c.ev(`dbgRubans(${JSON.stringify(Object.assign({ refait: 1 }, r))});dbgLoupe({rendre:1});1`);
        await shot(`${b}-${nom}-jeu.png`); await shot(`${b}-${nom}-zoom.png`, [zx, zy, zw, zh]);
        rec.etapes[nom] = JSON.parse(await c.ev("JSON.stringify({r:dbgRubans().stats,l:(function(){var l=dbgLoupe();return {on:l.on,k:l.k,kq:l.kq,horsDpr:l.horsDpr,pxDisque:l.pxDisque,segRubans:l.segRubans,pxRubans:l.pxRubans,toile:l.toile,scene:l.scene}})()})"));
      }
      await c.ev("dbgLoupe({voir:1});dbgLoupe({rendre:1});1"); await shot(`${b}-5zones-jeu.png`); await c.ev("dbgLoupe({voir:0});1");
      rec.sonde = await c.ev('JSON.stringify(dbgRubans({sonde:1}))');
      rec.sondeSans = await c.ev('JSON.stringify(dbgRubans({sonde:2}))');
      await c.ev('dbgRubans({net:0,larg:0,masque:0,long:0,refait:1});1');
      chiffres.prises.push(rec); console.log('prise', v, JSON.stringify(rec).slice(0, 600));
    };
    /* 150 km/h : sans nitro, dès le départ */
    let k = 0, n = 0; while ((k = await kmh()) < 140 && n < 300) { await pas(3, false); n += 3; }
    await prise(150);
    await c.ev("dbgAuto(1,0,{nit:1});1");
    for (const v of [450, VMAX]) { n = 0; let best = 0; while ((k = await kmh()) < v && n < 900) { await pas(6, true); n += 6; if (k > best) best = k; if (n % 120 === 0) console.log('…', k, 'km/h'); }
      if (k < v * .9) console.log('vitesse visée', v, 'non atteinte : ', k); await prise(v); }
    chiffres.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()");
    chiffres.exceptions = exc.slice(0, 8); chiffres.console = cons.slice(0, 8);
    fs.writeFileSync(path.join(OUT, TAG + '-chiffres.json'), JSON.stringify(chiffres, null, 1));
    console.log('pannes', JSON.stringify(chiffres.pannes), 'exceptions', JSON.stringify(exc.slice(0, 5)), 'console', JSON.stringify(cons.slice(0, 6)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
