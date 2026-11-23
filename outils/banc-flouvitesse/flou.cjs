// LE BANC DE LA RÉPARATION DU FLOU DE VITESSE (2026-11-20, lot « flouvitesse » 2e manche — Sacha : « Si c'est un bug, corrige-le » ; « pas de chantier en plus »).
// UN Chrome sans fenêtre et muet, au format de l'iPhone 13 Pro (844×390 couché, DPR 3, tactile émulé, ?tel=1&appareil=iPhone14,2), la boucle menée à la main (dbgStep 33 ms).
//  0. (--ancien <dossier>) le programme de la passe finale AVANT le 17/11 (jeu de 3df790c92^) : son texte, comparé à celui du lot.
//  1. AVANT = ?sans=flouvitesse (le bug) : son programme, et une course (croisière + nitro) sans exception.
//  2. LOT : une course (6 s croisière, 3 s nitro tenu) : exceptions, erreurs WebGL, programmes liés ; puis, image figée au nitro, PHOTOS avant/après
//     (le programme d'avant posé sur la même image, le cœur des rubans coupé comme dans l'avant) ; puis le COÛT de la passe finale seule, A/B entrelacé (avant · lot · lot sans le cœur des rubans, pour savoir d'où vient l'écart).
//   node outils/banc-flouvitesse/flou.cjs --out <dossier> [--carte crypto] [--ancien <dossier du jeu d'avant le 17/11>] [--tours 24]
// Prendre le verrou du Mac AVANT (sh ~/cash-car/verrou-banc.sh prendre "<qui>") et le rendre APRÈS. Chrome est tué (groupe) et son profil effacé à la fin.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || 'prises-flou'); fs.mkdirSync(OUT, { recursive: true });
const W = 844, H = 390, CARTE = A.carte || 'nuages', TAG = CARTE, TOURS = +(A.tours || 24), REP = +(A.rep || 20);
const P_HTTP = +(A.http || 9781), P_CDP = +(A.cdp || 9782), P_OLD = P_HTTP + 10;
const PROF = fs.mkdtempSync(path.join(A.tmp || require('os').tmpdir(), 'banc-flou-'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
/* le programme de la passe finale, les programmes liés, les erreurs WebGL */
const FS = "(function(){dbgGpu&&!window.__gpuObj&&dbgGpu({n:1});return window.__gpuObj.acesPass.material.fragmentShader})()";
const SANTE = "(function(){var rd=window.__gpuObj.renderer,gl=rd.getContext(),e=[],x;while((x=gl.getError())&&e.length<9)e.push(x);var P=rd.info.programs||[],nl=0;for(var p of P)if(!gl.getProgramParameter(p.program,gl.LINK_STATUS))nl++;return JSON.stringify({glErr:e,programmes:P.length,nonLies:nl})})()";

(async () => {
  for (const p of [P_HTTP, P_CDP, P_OLD]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), srvO = A.ancien ? await serveur(path.resolve(A.ancien), P_OLD) : null, { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} try { srvO && srvO.close(); } catch (e) {} tueChrome(ch);
    try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); });
  let exc = []; const R = { carte: CARTE };
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && /error|warning/.test(m.params.type)) exc.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 600)); } catch (x) {} });
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const charge = async (port, q) => {
    const url = `http://127.0.0.1:${port}/index.html?colonne=0&tel=1&appareil=iPhone14,2&garde=1&intro=ancien&attente=0&prebati=0&carte=${CARTE}&pistegraine=7` + (q ? '&' + q : '');
    exc = []; await c.send('Page.navigate', { url });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    let ok = false;
    for (let i = 0; i < 200 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée : ' + url);
  };
  /* une course menée à la main : n images de croisière, puis m de nitro tenu ; la vitesse de l'effet relevée */
  const course = async (n, m) => {
    await c.ev("window.requestAnimationFrame=function(){return 0;};dbgImmortel&&dbgImmortel(true);dbgAuto(1,0,{nit:0});1");
    const pas = async (k, nit) => { await c.ev(`dbgAuto(1,0,{nit:${nit ? 1 : 0}});1`);
      return JSON.parse(await c.ev(`(async function(){var L=[];for(var i=0;i<${k};i++){${nit ? 'try{dbgNitro(9,0)}catch(e){}' : ''}dbgStep(1,33);L.push(+window.__gpuObj.acesPass.uniforms.uSpeed.value.toFixed(3));await new Promise(function(r){setTimeout(r,30)});}return JSON.stringify(L)})()`, 300000)); };
    const a = await pas(n, false), b = await pas(m, true); return { croisiere: a.filter((x, i) => i % 15 === 0), nitro: b.filter((x, i) => i % 15 === 0) };
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    /* 0. le programme d'avant le 17/11 */
    if (srvO) { await charge(P_OLD, ''); R.fsAncien = await c.ev(FS); R.excAncien = exc.slice(0, 5); console.log('ancien : programme lu,', R.fsAncien.length, 'car.'); }
    /* 1. AVANT (le bug) */
    await charge(P_HTTP, 'sans=flouvitesse'); R.fsAvant = await c.ev(FS);
    R.courseAvant = await course(120, 90); R.santeAvant = JSON.parse(await c.ev(SANTE)); R.excAvant = exc.slice(0, 5);
    console.log('avant', JSON.stringify(R.santeAvant), 'exc', R.excAvant.length);
    /* 2. LOT */
    await charge(P_HTTP, ''); R.fsLot = await c.ev(FS);
    R.depart = await c.ev("JSON.stringify({flou:dbgFlou(),rubans:(function(){try{return dbgRubans()}catch(e){return null}})()})");
    R.courseLot = await course(180, 90); R.santeLot = JSON.parse(await c.ev(SANTE)); R.excLot = exc.slice(0, 5);
    console.log('lot', JSON.stringify(R.santeLot), 'exc', R.excLot.length, JSON.stringify(R.courseLot));
    /* PHOTOS : image figée au nitro tenu (uSpeed réel), puis la croisière rapide forcée (s = .2) ; avant = le programme du bug posé sur la même image, cœur des rubans coupé */
    await c.ev(MASQUE);
    await c.ev(`window.__FA=${JSON.stringify(R.fsAvant)};window.__FL=${JSON.stringify(R.fsLot)};window.__pose=function(k){var M=window.__gpuObj.acesPass.material,f=k?__FL:__FA;if(M.fragmentShader!==f){M.fragmentShader=f;M.needsUpdate=true;}try{dbgRubans({masque:k===1?1:0})}catch(e){}};1`); /* 0 avant · 1 lot · 2 lot sans le cœur des rubans (uRn2 = 0 : sa lecture sautée) */
    R.sNitro = await c.ev('+window.__gpuObj.acesPass.uniforms.uSpeed.value.toFixed(3)');
    const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
    const zc = [Math.max(0, Math.min(W - 240, Math.round(pc[0] - 120))), Math.max(0, Math.min(H - 170, Math.round(pc[1] - 60))), 240, 170], zb = [0, 40, 300, 300];
    for (const [nom, s] of [['nitro', R.sNitro], ['croisiere', .2]]) for (const k of [0, 1]) {
      await c.ev(`(function(){__pose(${k});dbgFlou({s:${s}});dbgLoupe({rendre:1});dbgLoupe({rendre:1});return 1})()`); await dormir(400);
      const b = `${TAG}-${nom}-${k ? 'apres' : 'avant'}`; await shot(b + '-jeu.png'); await shot(b + '-bord.png', zb); await shot(b + '-caisse.png', zc);
    }
    R.santePhotos = JSON.parse(await c.ev(SANTE));
    /* COÛT : la passe finale seule, REP rendus par chronomètre, avant/lot alternés (l'ordre change à chaque tour) TOURS tours, médianes */
    R.gpu = {};
    for (const s of [.2, R.sNitro]) {
      R.gpu['s' + s] = JSON.parse(await c.ev(`(async function(){var G=window.__gpuObj,rd=G.renderer,gl=rd.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),cp=G.composer,ap=G.acesPass,Z=function(m){return new Promise(function(r){setTimeout(r,m)})};
        var T={avant:[],lot:[],lotSansCoeur:[]},D=[],D2=[],K={avant:0,lot:1,lotSansCoeur:2};
        for(var tour=0;tour<${TOURS};tour++){var ord=tour%2?['lot','lotSansCoeur','avant']:['avant','lotSansCoeur','lot'],u={};for(var k of ord){__pose(K[k]);dbgFlou({s:${s}});for(var w=0;w<3;w++)ap.render(rd,cp.writeBuffer,cp.readBuffer);gl.finish();
          var q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);for(var j=0;j<${REP};j++)ap.render(rd,cp.writeBuffer,cp.readBuffer);gl.endQuery(ext.TIME_ELAPSED_EXT);
          for(var t=0;t<300;t++){await Z(5);if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE))break;}
          if(!gl.getParameter(ext.GPU_DISJOINT_EXT)){u[k]=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6/${REP};T[k].push(u[k]);}gl.deleteQuery(q);}
          if(u.avant!=null&&u.lot!=null)D.push(u.lot-u.avant);if(u.avant!=null&&u.lotSansCoeur!=null)D2.push(u.lotSansCoeur-u.avant);}
        var md=function(L){L=L.slice().sort(function(a,b){return a-b});return +L[L.length>>1].toFixed(3)};var o={avant:md(T.avant),lot:md(T.lot),lotSansCoeur:md(T.lotSansCoeur),ecartMedian:md(D),ecartSansCoeur:md(D2),nTours:D.length,
          lotMoinsCher:D.filter(function(x){return x<0}).length};__pose(1);return JSON.stringify(o);})()`, 600000));
      console.log('passe finale, s =', s, JSON.stringify(R.gpu['s' + s]));
    }
    R.santeFin = JSON.parse(await c.ev(SANTE)); R.excFin = exc.slice(0, 8);
    fs.writeFileSync(path.join(OUT, TAG + '-programmes.json'), JSON.stringify({ ancien: R.fsAncien || null, avant: R.fsAvant, lot: R.fsLot }));
    delete R.fsAncien; delete R.fsAvant; delete R.fsLot;
    fs.writeFileSync(path.join(OUT, TAG + '-chiffres.json'), JSON.stringify(R, null, 1));
    console.log('fin', JSON.stringify(R.santeFin), 'exceptions', JSON.stringify(R.excFin.slice(0, 5)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
