// LE BANC DE LA VOITURE D'ABORD (2026-11-18, lot « voituredabord »), dans le VRAI jeu. UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde),
// iPhone 13 Pro émulé 844×390 DPR 3, tactile, UA iPhone → TEL_NATIF vrai ; profil N1 BASSE (?appareil=iPhone14,2, réglage 'fast'), comme Sacha cette nuit.
//   node outils/banc-voituredabord/vda.cjs --essai avec|sans [--mode ql|photo|tout] [--effondre <s> : pose QL.effondre à la seconde s du téléphone lent]
// crans : téléphone lent + effondrement posés, l'échelle menée cran par cran (dbgQual 0..kMax, 2,5 s chacun) dans la boucle vivante : DPR, toile, loupe, décor, écritures de la toile. [--out <dossier>] [--lent 45] [--t1 60] [--http 9981] [--cdp 9982]
// ql    : serious + branché (dbgThermique(2), __ccBranche=2), puis un téléphone LENT simulé (dbgGouvLent : un coût qui suit les pixels) → l'échelle descend et s'effondre ;
//         seconde par seconde : cran QL, DPR, cran du décor, loupe posée, largeur de la toile, écritures de la toile (chaque groupe = une réallocation).
// effet : (2nd tour) la boucle menée à la main, crans 5..kMax effondrement posé : appels de dessin et bascules de cible WebGL 2 sur 48 images par cran (l'EFFET, pas la variable) ; --photos 1 = une photo par cran.
// photo : la boucle menée à la main (rAF coupé, dbgStep 33 ms, échelle figée par dbgQual) ; aux crans 0, 5 et effondré (kMax + QL.effondre) : image entière + caisse.
// Une ligne JSON. Le profil Chrome (--user-data-dir) est effacé à la fin, Chrome est tué (son groupe seulement), quoi qu'il arrive.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const ESSAI = A.essai || 'avec', MODE = A.mode || 'tout', [W, H] = [844, 390], P_HTTP = +(A.http || 9981), P_CDP = +(A.cdp || 9982);
const OUT = path.resolve(A.out || path.join(os.tmpdir(), 'banc-vda'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const COMPTEUR = "(function(){try{var P=HTMLCanvasElement.prototype,gc=P.getContext;window.__bancToile={ev:[]};P.getContext=function(t){var r=gc.apply(this,arguments);try{if(r&&/webgl/.test(String(t)))this.__bancGl=1;}catch(e){}return r;};"
  + "['width','height'].forEach(function(k){var d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){try{if(this.__bancGl)window.__bancToile.ev.push([Math.round(performance.now()),k,d.get.call(this),+v]);}catch(e){}return d.set.call(this,v);}});});}catch(e){}})();";
/* (2nd tour) LE COMPTEUR D'APPELS : chaque drawArrays/drawElements (et instanciés) de WebGL 2, et chaque bascule de cible (bindFramebuffer) — l'EFFET des crans, pas leur variable */
const APPELS = "(function(){try{var P=WebGL2RenderingContext.prototype,A=window.__bancAppels={d:0,f:0};['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'].forEach(function(n){var o=P[n];P[n]=function(){A.d++;return o.apply(this,arguments);};});"
  + "var b=P.bindFramebuffer;P.bindFramebuffer=function(){A.f++;return b.apply(this,arguments);};}catch(e){}})();";
const LIT = `(function(){var o={};try{var g=imgRegle();o.ql=g.ql;o.dpr=g.dpr;o.cap=g.cap;o.halo=g.halo;o.mips=g.mips;o.ombre=g.ombre;o.ciel=g.ciel}catch(e){o.err=String(e)}
  try{var v=dbgVoitureDabord();o.vda=v.d;o.tient=v.tient;o.ef=v.effondre;o.vciel=v.ciel;o.vmips=v.mips;o.haloOn=v.halo;o.loupe=v.loupe?v.loupe.on:null;o.loupeChaud=v.loupe?v.loupe.chaud:null;o.bw=v.loupe?v.loupe.bw:null}catch(e){o.errv=String(e)}
  try{var r=dbgScene().rdr,gl=r.getContext();o.tampon=[gl.drawingBufferWidth,gl.drawingBufferHeight]}catch(e){}
  try{var G=dbgGouvPaliers();o.palier=G.palier;o.qlMin=G.qlMin;o.doux=G.doux}catch(e){}
  try{var n=dbgNette();o.kNet=n.kNet;o.kBas=n.kBas;o.niv=dbgPrf().niveau}catch(e){}
  try{o.toile=(window.__bancToile||{ev:[]}).ev.length}catch(e){}
  try{var B=dbgBarriere();o.vrai=Math.round(B.vrai*10)/10;o.chrono=B.chrono}catch(e){}
  return JSON.stringify(o)})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-vda-prof-'));
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(130); }); process.on('SIGTERM', () => { fin(); process.exit(143); });
  let exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const lit = async () => JSON.parse(await c.ev(LIT));
  const pret = async () => { for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) return true; } catch (e) {} } return false; };
  const voile = async () => { await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500); };
  const enCourse = () => c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()");
  const relance = async () => { try { if (await c.ev('dbgState().gameOver')) { try { await c.ev('dbgJouer()'); } catch (e) {} await dormir(3000); try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} return 1; } } catch (e) {} return 0; };
  const lance = async () => { let ok = false; for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await enCourse(); } catch (e) {} } if (ok) { try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } return ok; };
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 120000); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const R = { essai: ESSAI, mode: MODE, t0: new Date().toISOString() };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: COMPTEUR });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: APPELS });
    const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: 'fast', qChoisi: 1 };
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7&appareil=iPhone14,2` + (ESSAI === 'sans' ? '&sans=voituredabord' : '');
    await c.send('Page.navigate', { url });
    if (!(await pret())) throw new Error('pas prêt');
    await dormir(1500); await voile();
    if (!(await lance())) throw new Error('course pas lancée');
    await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await dormir(4000); await relance();
    R.depart = await lit();
    if (MODE === 'ql' || MODE === 'tout') {
      const L = +(A.lent || 45), T1 = +(A.t1 || 60);
      await c.ev('window.__bancToile.ev.length=0;1');
      const suivi = [];
      await c.ev(`dbgGouvLent(${L});1`);
      const t0 = Date.now(); while (Date.now() - t0 < T1 * 1000) { await dormir(1000); const m = await relance(); const tt = Math.round((Date.now() - t0) / 1000); if (A.effondre && tt >= +A.effondre && !R.effondrePose) { await c.ev('dbgVoitureDabord({effondre:1});1'); R.effondrePose = tt; } const o = await lit(); o.t = Math.round((Date.now() - t0) / 1000); if (m) o.relance = 1; suivi.push(o); }
      await c.ev('dbgGouvLent(0);1');
      R.lent = suivi[suivi.length - 1];
      const ch2 = []; for (let i = 0; i < suivi.length; i++) { const a = suivi[i - 1], b = suivi[i]; if (!a || a.ql !== b.ql || a.dpr !== b.dpr || a.loupe !== b.loupe || a.vda !== b.vda || a.ef !== b.ef || a.haloOn !== b.haloOn) ch2.push(b); }
      R.changements = ch2;
      R.toile = JSON.parse(await c.ev("JSON.stringify((function(){var g=[],ev=(window.__bancToile||{ev:[]}).ev;for(var i=0;i<ev.length;i++){var e=ev[i],d=g[g.length-1];if(!d||e[0]-d.t>8)g.push(d={t:e[0],w:null,h:null,n:0,change:false});d.n++;d[e[1]==='width'?'w':'h']=e[3];if(e[2]!==e[3])d.change=true;}return g})())"));
      R.reallocations = R.toile.filter(g => g.change).length;
      R.maxQl = Math.max(...suivi.map(o => o.ql)); R.minDpr = Math.min(...suivi.map(o => o.dpr)); R.loupeRetireeSecondes = suivi.filter(o => o.loupe === false).length; R.secondes = suivi.length;
    }
    if (MODE === 'crans') { /* l'échelle menée cran par cran dans la boucle VIVANTE (dbgQual), téléphone lent et effondrement posés : ce que chaque cran retire, les réallocations */
      await c.ev(`dbgGouvLent(${+(A.lent || 45)});dbgVoitureDabord({effondre:1});1`); await dormir(2000);
      await c.ev('window.__bancToile.ev.length=0;1'); const kMax = (await lit()).kBas + 1; R.crans = [];
      for (let k = 0; k <= kMax; k++) { const n0 = await c.ev('window.__bancToile.ev.length'); await c.ev(`dbgQual(${k});dbgVoitureDabord({effondre:${k > 5 ? 1 : 0}});1`); await dormir(2500); await relance();
        const o = await lit(); o.k = k; o.ecrituresToile = (await c.ev('window.__bancToile.ev.length')) - n0; R.crans.push(o); }
      await c.ev('dbgGouvLent(0);1');
      R.toile = JSON.parse(await c.ev("JSON.stringify((function(){var g=[],ev=(window.__bancToile||{ev:[]}).ev;for(var i=0;i<ev.length;i++){var e=ev[i],d=g[g.length-1];if(!d||e[0]-d.t>8)g.push(d={t:e[0],w:null,h:null,n:0,change:false});d.n++;d[e[1]==='width'?'w':'h']=e[3];if(e[2]!==e[3])d.change=true;}return g})())"));
      R.reallocations = R.toile.filter(g => g.change).length;
    }
    if (MODE === 'effet') { /* (2nd tour) la boucle menée à la main (rAF coupé, dbgStep 33 ms) ; à chaque cran 5..kMax (effondrement posé, comme à chaud) : appels de dessin et bascules de cible
         sur 48 images, cran par cran, après 8 images de pose ; et une photo de l'image entière (même instant de piste : 1 ms par image pendant la mesure) */
      await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:0});try{dbgPin(true)}catch(e){};1");
      await dormir(300);
      for (let k = 0; k < 90; k += 30) await c.ev(`(async function(){for(var i=0;i<30;i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000);
      const kMax = (await lit()).kBas + 1; R.effet = [];
      for (let k = 5; k <= kMax; k++) {
        await c.ev(`dbgVoitureDabord({effondre:1});dbgQual(${k});dbgVoitureDabord({effondre:1});1`);
        await c.ev(`(async function(){for(var i=0;i<8;i++){dbgStep(1,1);await new Promise(function(r){setTimeout(r,30)});}return 1})()`, 60000);
        const n = JSON.parse(await c.ev(`(async function(){var A=window.__bancAppels,d0=A.d,f0=A.f;for(var i=0;i<48;i++){dbgStep(1,1);await new Promise(function(r){setTimeout(r,30)});}return JSON.stringify({appels:A.d-d0,cibles:A.f-f0})})()`, 120000));
        const o = await lit(); o.k = k; o.appels48 = n.appels; o.cibles48 = n.cibles; R.effet.push(o);
        if (A.photos) await shot(`${ESSAI}-effet-cran${k}.png`);
      }
    }
    if (MODE === 'photo' || MODE === 'tout') {
      await c.ev('dbgVoitureDabord({effondre:0});dbgQual(0);1'); await dormir(21000); /* la mémoire de chaleur de la loupe (20 s) se vide */
      await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1});try{dbgPin(true)}catch(e){};1");
      await dormir(300);
      for (let k = 0; k < 150; k += 30) await c.ev(`(async function(){for(var i=0;i<30;i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000);
      const kMax = (await lit()).kBas + 1; R.photos = {};
      for (const [tag, k, ef] of [['cran0', 0, 0], ['cran5', 5, 0], ['effondre', kMax, 1]]) {
        await c.ev(`dbgVoitureDabord({effondre:${ef}});dbgQual(${k});dbgVoitureDabord({effondre:${ef}});1`);
        await c.ev(`(async function(){for(var i=0;i<4;i++){dbgStep(1,1);await new Promise(function(r){setTimeout(r,40)});}return 1})()`, 60000); /* 4 images d'1 ms : la piste ne bouge presque pas, l'échelle se pose */
        await c.ev('dbgLoupe({rendre:1});1'); await dormir(400); await c.ev('dbgLoupe({rendre:1});1'); await dormir(300);
        const rel = await lit();
        const cs = JSON.parse(await c.ev("(function(){var S=dbgScene(),p=S.car.position,v=p.clone().project(S.cam);return JSON.stringify({ecran:[(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight]})})()"));
        const pc = cs.ecran, zx = Math.max(0, Math.min(W - 120, Math.round(pc[0] - 60))), zy = Math.max(0, Math.min(H - 80, Math.round(pc[1] - 50)));
        await shot(`${ESSAI}-${tag}-jeu.png`); await shot(`${ESSAI}-${tag}-caisse.png`, [zx, zy, 120, 80]);
        R.photos[tag] = { k, rel, clip: [zx, zy] };
      }
    }
  } catch (e) { R.erreur = String(e && e.message || e); }
  try { R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)})}catch(e){return String(e)}})()"); } catch (e) {}
  R.exc = exc; R.t1 = new Date().toISOString();
  console.log(JSON.stringify(R));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
