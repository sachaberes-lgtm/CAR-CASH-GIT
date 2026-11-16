// LE BANC DE L'OMBRE ET DE L'IMAGE RECONSTRUITE (2026-11-15, chantier QUALITÉ PAR APPAREIL, lot ombre-image).
// Repris de outils/banc-qualite/niveaux.cjs : UN Chrome sans fenêtre et MUET, iPhone émulé (844×390 couché / 390×844 debout, DPR 3, tactile, UA iPhone → TEL_NATIF vrai),
// même graine de piste, course lancée, pilote auto + nitro, la boucle menée à la main (dbgStep 33 ms, rAF coupé) : le MÊME nombre de pas donc la MÊME image.
// Pour chaque essai : une ou plusieurs VUES de la MÊME image (une vue = une expression évaluée avant de redessiner, ex. « dbgLoupe({arete:0}) »), chacune photographiée
// en entier (pixels d'écran) ; les recadrages se font ensuite (planche.py). En plus, au choix : le compte de la loupe (dbgLoupe({compte:1})) et les SOURCES de tous les
// programmes de shader compilés (gl.shaderSource relevé dès le chargement) pour comparer deux constructions.
//   node outils/banc-ombre-image/banc.cjs --out <dossier> [--fmt couche|debout] [--carte nuages|jade] [--meteo matin] [--pas 300] [--page index.html] [--jeu <dossier>]
//        --essais "N1:iPhone14,2:fast;N2:iPhone14,2:haute:sans=ombrepcf" [--vues "a=dbgLoupe({arete:0});b=dbgLoupe({arete:1})"] [--compte 1] [--sources 1] [--ordi 1]
//        [--nit 0] (sans nitro : la caisse au sol, l'ombre visible) [--http 9811] [--cdp 9812]
// Un essai = <étiquette>:<appareil>:<fast|haute|neuf>[:<paramètres d'URL en plus, séparés par +>]. --ordi 1 : l'ORDINATEUR (1280×720, DPR 1, ni tactile ni UA iPhone).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const ORDI = A.ordi === '1', FMT = A.fmt || 'couche', [W, H] = ORDI ? [1280, 720] : FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', METEO = A.meteo || '', PAS = +(A.pas || 300), PAGE = A.page || 'index.html';
const P_HTTP = +(A.http || 9811), P_CDP = +(A.cdp || 9812);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ESSAIS = (A.essais || 'N1:iPhone14,2:fast;N2:iPhone14,2:haute').split(';').filter(Boolean)
  .map(s => { const [tag, ap, q, plus] = s.split(':'); return { tag, ap, q: q || 'neuf', plus: (plus || '').split('+').filter(Boolean).join('&') }; });
const VUES = (A.vues || 'v=1').split(';').filter(Boolean).map(s => { const i = s.indexOf('='); return { nom: s.slice(0, i), js: s.slice(i + 1) }; });
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const SONDE = "(function(){try{const P=WebGL2RenderingContext.prototype,o=P.shaderSource;window.__ccSrc=[];P.shaderSource=function(s,t){try{window.__ccSrc.push(t);}catch(e){}return o.call(this,s,t);};}catch(e){}})();";
const RELEVE = `(function(){var o={},S=dbgScene(),r=S.rdr,gl=r.getContext();
  try{o.prf=dbgPrf()}catch(e){o.prf='ERR '+e.message}
  try{o.tel=typeof TEL_NATIF!=='undefined'?TEL_NATIF:'?'}catch(e){o.tel='ERR'}
  try{o.toile=[gl.drawingBufferWidth,gl.drawingBufferHeight];}catch(e){}
  try{o.ombre={type:r.shadowMap.type,taille:S.rdr&&dbgScene().scene?null:null}}catch(e){}
  try{o.loupe=dbgLoupe()}catch(e){o.loupe='ERR '+e.message}
  try{o.effaceTard=window.__ccEffaceTard==null?null:window.__ccEffaceTard}catch(e){}
  try{var p=S.car.position;o.caisse=[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)];}catch(e){}
  try{var v=S.car.position.clone().project(S.cam);o.ecranCaisse=[(v.x*.5+.5)*innerWidth*devicePixelRatio,(-v.y*.5+.5)*innerHeight*devicePixelRatio];}catch(e){}
  try{o.progs=r.info.programs?r.info.programs.length:null}catch(e){}
  return JSON.stringify(o)})()`;
const h8 = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  const shot = async nom => { const r = await c.send('Page.captureScreenshot', { format: 'png' }, 120000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const tous = [];
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (ORDI) await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    else {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    }
    let idScript = null;
    for (const E of ESSAIS) {
      exc = []; cons = [];
      const rec = { essai: E, fmt: ORDI ? 'ordi' : FMT, carte: CARTE, meteo: METEO, page: PAGE, vues: {} };
      try {
        const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
        if (E.q !== 'neuf') { SAVE.q = E.q; SAVE.qChoisi = 1; }
        if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
        idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + (A.sources === '1' ? SONDE : '') })).identifier;
        await c.send('Page.navigate', { url: 'about:blank' }); await dormir(400);
        const url = `http://127.0.0.1:${P_HTTP}/${PAGE}?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=${CARTE}${METEO ? '&meteo=' + METEO : ''}&pistegraine=7${E.ap && E.ap !== '-' ? '&appareil=' + E.ap : ''}` + (E.plus ? '&' + E.plus : '');
        rec.url = url;
        await c.send('Page.navigate', { url });
        let pret = false;
        for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
        if (!pret) throw new Error('pas prêt');
        await dormir(2000);
        await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
        await dormir(2000);
        let ok = false;
        for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
        if (!ok) throw new Error('course pas lancée');
        await c.ev(`window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:${A.nit === '0' ? 0 : 1}});try{dbgPin(true)}catch(e){};1`);
        await dormir(300); await c.ev(MASQUE);
        for (let k = 0; k < PAS; k += 30) await c.ev(`(async function(){${A.nit === '0' ? '' : 'try{dbgNitro(9,0)}catch(e){};'}for(var i=0;i<${Math.min(30, PAS - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000);
        rec.releve = JSON.parse(await c.ev(RELEVE));
        for (const V of VUES) {
          const R = {};
          try { R.js = await c.ev('(function(){var r=(' + V.js + ');try{return JSON.stringify(r)}catch(e){return String(r)}})()'); } catch (e) { R.js = 'ERR ' + e.message; }
          await c.ev('dbgLoupe({rendre:1});1'); await dormir(300); await c.ev('dbgLoupe({rendre:1});1'); await dormir(300);
          if (A.compte === '1') { try { R.compte = await c.ev('JSON.stringify(dbgLoupe({compte:1}))'); } catch (e) { R.compte = 'ERR ' + e.message; } await c.ev('dbgLoupe({rendre:1});1'); await dormir(300); }
          const nom = `${E.tag}-${V.nom}.png`; await shot(nom); R.photo = nom;
          rec.vues[V.nom] = R;
        }
        if (A.sources === '1') {
          const S = await c.ev('JSON.stringify(window.__ccSrc||[])', 120000), L = JSON.parse(S);
          const uniq = {}; for (const s of L) uniq[h8(s)] = s;
          fs.writeFileSync(path.join(OUT, `${E.tag}-sources.json`), JSON.stringify(uniq));
          rec.sources = { n: L.length, uniques: Object.keys(uniq).length };
          try { rec.loupeFs = await c.ev('(function(){try{return dbgLoupe().fsLong}catch(e){return null}})()'); } catch (e) {}
        }
        rec.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()");
      } catch (e) { rec.erreur = String(e.message || e).slice(0, 400); }
      rec.exc = exc.slice(0, 6); rec.cons = cons.slice(0, 8);
      tous.push(rec); fs.writeFileSync(path.join(OUT, `banc-${ORDI ? 'ordi' : FMT}-${CARTE}${METEO ? '-' + METEO : ''}.json`), JSON.stringify(tous, null, 1));
      console.log(E.tag, rec.erreur ? 'ERREUR ' + rec.erreur : 'ok', JSON.stringify(rec.releve ? { prf: rec.releve.prf && rec.releve.prf.n, caisse: rec.releve.caisse, loupe: rec.releve.loupe && { on: rec.releve.loupe.on, ar: rec.releve.loupe.ar, te: rec.releve.loupe.te, cible: rec.releve.loupe.cible, rb: rec.releve.loupe.rb } } : null),
        'sources', JSON.stringify(rec.sources || null), 'exc', exc.length, JSON.stringify(exc.slice(0, 2)), 'cons', JSON.stringify(cons.slice(0, 3)));
      for (const k in rec.vues) if (rec.vues[k].compte) console.log('   ', k, rec.vues[k].compte);
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
