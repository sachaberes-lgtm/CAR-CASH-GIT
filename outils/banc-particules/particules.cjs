// LE BANC DES PARTICULES (2026-11-15, lot « LE RENDU NET » — Sacha : « on garde QUE les particules de quand tu ramasses des pièces »).
// UN Chrome sans fenêtre et muet, iPhone 13 Pro émulé (844×390 couché ou 390×844 debout, DPR 3, tactile, UA iPhone, ?tel=1). Deux courses de N pas de 33 ms
// (60 s de jeu par défaut), boucle menée à la main (rAF coupé, dbgStep) : la première avec le rendu net (défaut), la seconde avec ?plus=particules (l'avant).
// Le pilote auto tient la nitro, louvoie (glisse, rase-bord) et décolle toutes les 2 s ; en vol une figure est lancée. On relève dbgParticules() (naissances par
// réserve, réserves allumées = appels de dessin, effets coupés) et on photographie les mêmes moments : nitro au sol, louvoiement, vol, figure, pose.
//   node outils/banc-particules/particules.cjs --out <dossier> [--fmt couche|debout] [--pas 1800] [--carte nuages] [--http 9911] [--cdp 9912] [--modes net,avant]
// Prendre le verrou du Mac AVANT (~/cash-car/verrou-banc.sh prendre "particules"), le rendre APRÈS. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const PAS = +(A.pas || 1800), CARTE = A.carte || 'nuages', MODES = (A.modes || 'net,avant').split(',');
const P_HTTP = +(A.http || 9911), P_CDP = +(A.cdp || 9912);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const ETAT = "JSON.stringify((function(){var s=dbgState(),p=dbgParticules();var e={};try{e=dbgEco()}catch(x){}return {mode:s.mode,go:s.gameOver,kmh:Math.round(+(dbgRubans().kmh)||0),glisse:s.glisse,allumees:p.allumees,quelles:p.quelles,argent:e.money}})())";

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const shot = async (nom) => { const r = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const rapport = { fmt: FMT, pas: PAS, carte: CARTE, modes: {} };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    for (const MODE of MODES) {
      exc.length = 0;
      const url = `http://127.0.0.1:${P_HTTP}/index.html?tel=1&colonne=0&garde=1&intro=ancien&attente=0&prebati=0&appareil=iPhone14,2&carte=${CARTE}&pistegraine=7` + (MODE === 'avant' ? '&plus=particules' : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      let pret = false;
      for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'&&typeof dbgParticules==='function'", 8000); } catch (e) {} }
      if (!pret) throw new Error('pas prêt (' + MODE + ')');
      await dormir(2000);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(2000);
      let ok = false;
      for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
      if (!ok) throw new Error('course pas lancée (' + MODE + ')');
      await c.ev(`window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1,vol:1,saut:2,imp:20});try{dbgPin(true)}catch(e){};dbgParticules(1);1`);
      await dormir(300); await c.ev(MASQUE);
      const pas = async (n) => c.ev(`(async function(){for(var i=0;i<${n};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,30)});}return 1})()`, 240000);
      const R = { url, images: [], allumeesMoy: 0, echantillons: 0, vols: 0, poses: 0, figures: 0, morts: 0 };
      const pris = {}; const prends = async (cat, j, e, max) => { pris[cat] = (pris[cat] || 0) + 1; if (pris[cat] > (max || 2)) return; const nom = `${MODE}-${FMT}-${cat}${pris[cat]}.png`; await shot(nom); R.images.push(Object.assign({ cat, j, png: nom }, e)); };
      let avant = 'drive', fa = 0, louv = 0;
      for (let j = 0; j < PAS; j++) {
        if (j % 90 === 0) { louv = (louv + 1) % 4; await c.ev(`dbgAuto(1,0,{nit:1,vol:1,saut:2,imp:20,latK:${[0, .8, 0, -.8][louv]}});1`); } /* LE LOUVOIEMENT : la caisse change de file, glisse, rase le bord */
        await pas(1);
        const e = JSON.parse(await c.ev(ETAT));
        R.allumeesMoy += e.allumees; R.echantillons++;
        if (e.go || e.mode === 'boom') { R.morts++; console.log(MODE, 'mort à', j); break; }
        if (e.mode === 'fall') { fa++; if (avant !== 'fall') R.vols++; if (fa === 4) await prends('vol', j, e); if (fa === 3) { try { const f = await c.ev("JSON.stringify(dbgFigure('tonneau'))"); R.figures++; } catch (x) {} } if (fa === 14) await prends('figure', j, e); }
        else { if (avant === 'fall') { R.poses++; await prends('pose', j, e); } fa = 0; }
        if (e.mode === 'drive' && j > 60 && j % 300 === 120) await prends('nitro', j, e, 3);
        if (e.mode === 'drive' && j % 90 === 40 && louv % 2 === 1) await prends('louvoie', j, e, 2);
        avant = e.mode;
        if (j % 300 === 0) console.log(MODE, j, e.mode, e.kmh, 'km/h · allumées', e.allumees, e.quelles.join(','));
      }
      R.allumeesMoy = +(R.allumeesMoy / Math.max(1, R.echantillons)).toFixed(2);
      R.particules = JSON.parse(await c.ev('JSON.stringify(dbgParticules())'));
      R.argent = JSON.parse(await c.ev("JSON.stringify((function(){try{var e=dbgEco();return {money:e.money,tricks:e.tricks}}catch(x){return null}})())"));
      R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()");
      R.exceptions = exc.slice(0, 8);
      rapport.modes[MODE] = R;
      console.log(MODE, 'FIN', JSON.stringify({ allumeesMoy: R.allumeesMoy, vols: R.vols, poses: R.poses, morts: R.morts, argent: R.argent, particules: R.particules, pannes: R.pannes, exc: R.exceptions.length }));
    }
    fs.writeFileSync(path.join(OUT, `rapport-${FMT}.json`), JSON.stringify(rapport, null, 1));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
