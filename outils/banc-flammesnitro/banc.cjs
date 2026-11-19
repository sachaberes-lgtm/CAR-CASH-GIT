// LE BANC DES FLAMMES DU NITRO EN FIGURE (2026-11-19, Sacha : « retravaille le rendu des flammes du nitro, notamment quand on fait des figures dans
// les airs, ça rend bizarre »). UN Chrome sans fenêtre et muet, iPhone 13 Pro émulé (844×390 couché, tactile, UA iPhone, ?tel=1&appareil=iPhone14,2).
// Une COPIE servie du jeu (chaque entrée de VERSION PRINCIPALE en lien, index.html + `window.__ev` avant `window.__gameReady=true;`) pour lire la closure.
// Pour chaque caisse et chaque scène (sol, droit, vrille, tonneau, salto) : la page est rechargée, la caisse équipée (dbgEquipe), la course lancée,
// le pilote roule nitro tenue, décolle, lance la figure à la 4e image de vol, et on FILME image par image (dbgStep 33 ms, rAF coupé).
// En prime, la MESURE : appels de dessin par image (rdr.render enveloppé) et temps JS des pas (nfeuPas, plumes) sur les images de vol.
//   node outils/banc-flammesnitro/banc.cjs --out <dossier> [--cars 4,2,1,16] [--scen sol,droit,vrille,tonneau,salto] [--q "sans=flammesnitro"] [--tag avant]
//        [--graine 7 (Math.random tiré d'une graine : deux passes jouent la MÊME course, pour comparer les coûts)] [--pasImg 2 (une photo toutes les n images)] [--max 60] [--http 9961] [--cdp 9962] [--jeu <VERSION PRINCIPALE>]
// Prendre le verrou du Mac AVANT (sh ~/cash-car/verrou-banc.sh prendre "flammes"), le rendre APRÈS. Chrome tué (groupe) et son profil effacé, quoi qu'il arrive.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(os.tmpdir(), 'banc-flammes')); fs.mkdirSync(OUT, { recursive: true });
const CARS = (A.cars || '4,2,1,16').split(',').map(Number), SCEN = (A.scen || 'sol,droit,vrille,tonneau,salto').split(',');
const TAG = A.tag || 'x', PAS_IMG = +(A.pasImg || 2), MAXI = +(A.max || 60), W = 844, H = 390;
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const FIGS = { vrille: 'toupie', tonneau: 'tonneau', salto: 'salto' }; /* ajusté par la liste dbgFigure() au premier chargement */
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";

/* la copie servie : liens + index.html avec __ev */
const COPIE = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-flammes-copie-'));
for (const f of fs.readdirSync(JEU)) if (f !== 'index.html') fs.symlinkSync(path.join(JEU, f), path.join(COPIE, f));
{ const t = fs.readFileSync(path.join(JEU, 'index.html'), 'utf8'), k = '\nwindow.__gameReady=true; // la boucle part';
  if (t.indexOf(k) < 0) throw new Error('point d\'injection introuvable');
  fs.writeFileSync(path.join(COPIE, 'index.html'), t.replace(k, '\nwindow.__ev=function(__c9){return eval(__c9);};' + k)); }
/* LE COÛT A/B DANS LA MÊME IMAGE (--micro 1) : en plein vol, 5 images après la figure, l'état du feu est gardé ; nfeuPas est rejoué 200 fois depuis cet état,
   le feu en figure éteint puis allumé (dbgFlamme('figure',0|1)), cinq fois chacun — même page, même état, même nombre de cubes */
const MICRO = `__ev(${JSON.stringify(`(function(){const N=NFEU,sP=N.P.slice(),sQ=N.Q.slice(),sn=N.n,sv=N.vf||0,sT=N.T,sacc=N.acc.slice(),sk=N.k,v0=N.v.clone();
  const re=function(){N.P.set(sP);N.Q.set(sQ);N.n=sn;N.vf=sv;N.T=sT;N.acc.set(sacc);N.k=sk;N.pOk=true;N.pp.copy(carGroup.position).addScaledVector(v0,-1/30);};
  const R={neuf:[],avant:[],cubes:sn,mode:mode,vit:+v0.length().toFixed(1)};
  for(let r=0;r<10;r++){const on=r%2===1;dbgFlamme('figure',on?1:0);if(!on)N.vf=0;let t=0;for(let i=0;i<200;i++){re();if(!on)N.vf=0;const t0=performance.now();nfeuPas(1/30,true,false,false,250,null,false);t+=performance.now()-t0;}R[on?'neuf':'avant'].push(+(t/200*1000).toFixed(1));}
  re();dbgFlamme('figure',1);R.unite='microsecondes par appel';return JSON.stringify(R);})()`)})`;
/* la mesure, posée dans la closure : appels de dessin et temps JS des pas du feu */
const SONDE = `__ev(${JSON.stringify(`(function(){if(window.__sonde)return 1;const S=window.__sonde={calls:0,tris:0,img:0,nf:0,nfn:0,pas:0,pasn:0};
  const r=renderer,o=r.render.bind(r);r.render=function(a,b){o(a,b);S.calls+=r.info.render.calls;S.tris+=r.info.render.triangles;};
  const f0=nfeuPas;nfeuPas=function(){const t=performance.now();try{return f0.apply(null,arguments);}finally{S.nf+=performance.now()-t;S.nfn++;}};
  return 1;})()`)})`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-flammes-prof-'));
  const srv = await serveur(COPIE, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false;
  const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch);
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} try { fs.rmSync(COPIE, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); }); process.on('SIGTERM', () => { fin(); process.exit(1); });
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const shot = async (nom) => { const r = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 72 }, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const rapport = { tag: TAG, q: A.q || '', scenes: [] };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: false });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: (A.graine ? '(function(){var a=' + (+A.graine) + '>>>0;Math.random=function(){a=a+0x6D2B79F5>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};})();' : '') + 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    for (const car of CARS) for (const sc of SCEN) {
      const t0 = Date.now(), R = { car, sc, images: [] };
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&tel=1&appareil=iPhone14,2&carte=nuages&meteo=midi&pistegraine=7` + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      let pret = false;
      for (let i = 0; i < 400 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'&&typeof __ev==='function'", 8000); } catch (e) {} }
      if (!pret) throw new Error('pas prêt');
      await dormir(1500);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(1500);
      R.nom = await c.ev(`String(dbgEquipe(${car}))`);
      if (!rapport.figs) { rapport.figs = await c.ev('JSON.stringify(dbgFigure())'); console.log('figures', rapport.figs); }
      let ok = false;
      for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
      if (!ok) throw new Error('course pas lancée');
      await c.ev(SONDE);
      await c.ev(`window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1,vol:1});try{dbgPin(true)}catch(e){};1`);
      await dormir(300); await c.ev(MASQUE);
      const pas = async (n) => c.ev(`(async function(){try{dbgNitro(9,0)}catch(e){};for(var i=0;i<${n};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,20)});}return 1})()`, 240000);
      const etat = async () => JSON.parse(await c.ev(`JSON.stringify((function(){var v=dbgVol(),S=window.__sonde;var o={mode:v.mode,tg:v.tangage,rl:v.roulis,lc:v.lacet,kmh:Math.round(dbgRubans().kmh),nit:dbgNitro().on,nfeu:__ev('NFEU.n')};return o})())`));
      let n = 0, k = 0;
      if (sc === 'course') { /* UNE COURSE COMPLÈTE : nitro tenue, un saut toutes les 4 s de route, une figure tirée au hasard dans chaque vol, jusqu'à la fin ou 2 700 images (90 s de jeu) */
        await c.ev(`dbgAuto(1,0,{nit:1,vol:1,saut:4,imp:34});1`);
        const L = JSON.parse(rapport.figs || '[]'); let vols = 0, figs = 0, m0 = 'drive', fin9 = '';
        for (let j = 0; j < 2700; j += 15) {
          await pas(15); const e = await etat();
          if (e.mode === 'fall' && m0 !== 'fall') { vols++; const f = L[(Math.random() * L.length) | 0]; if (f && String(await c.ev(`String(dbgFigure(${JSON.stringify(f)}))`)).indexOf('ok') === 0) figs++; }
          m0 = e.mode; const st = JSON.parse(await c.ev("JSON.stringify((function(){var s=dbgState();return {go:!!s.gameOver,run:!!s.running}})())"));
          if (st.go) { fin9 = 'fin de course à l\'image ' + j; break; }
        }
        R.course = { vols, figs, fin: fin9 || '2700 images' };
        R.erreurs = await c.ev("(function(){try{return JSON.stringify([window.__loopErr||null,window.__banqErr||null,(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(x){return String(x)}})()])}catch(e){return String(e)}})()");
        console.log(car, R.nom, 'COURSE', JSON.stringify(R.course), R.erreurs, 'exceptions', exc.length);
        rapport.scenes.push(R); continue;
      }
      while ((k = (await etat()).kmh) < 260 && n < 900) { await pas(6); n += 6; }
      await pas(20);
      R.kmh0 = k;
      if (sc !== 'sol') {
        await c.ev(`dbgAuto(1,0,{nit:1,vol:1,saut:.05,imp:${+(A.imp||44)}});1`);
        let m = 'drive'; n = 0; while (m !== 'fall' && n < 240) { await pas(1); n++; m = (await etat()).mode; }
        await c.ev(`dbgAuto(1,0,{nit:1,vol:1});1`);
        R.decolle = m === 'fall';
      }
      let fa = 0, sol = 0, mes = null;
      for (let j = 0; j < MAXI; j++) {
        const e = await etat(); e.j = j;
        if (j === 2) await c.ev('(function(){var S=window.__sonde;S.calls=0;S.tris=0;S.nf=0;S.nfn=0;S.t=performance.now();S.k=0;return 1})()');
        if (j % PAS_IMG === 0) { const nom = `${TAG}-c${car}-${sc}-${String(j).padStart(3, '0')}.jpg`; await shot(nom); e.img = nom; }
        R.images.push(e);
        if (e.mode === 'fall') { fa++; if (FIGS[sc] && fa === +(A.figA||3)) R.fig = await c.ev(`String(dbgFigure(${JSON.stringify(FIGS[sc])}))`);
          if (A.micro === '1' && fa === +(A.figA||3) + 5) { R.micro = JSON.parse(await c.ev(MICRO)); console.log('micro', sc, JSON.stringify(R.micro)); } }
        else if (sc !== 'sol' && fa > 0) { sol++; if (sol > 5) break; }
        if (e.mode === 'boom' || e.mode === 'dead') break;
        const tp = Date.now(); await pas(1);
        if (j >= 2) { mes = mes || { pas: 0, n: 0 }; }
      }
      R.mesure = JSON.parse(await c.ev(`JSON.stringify((function(){var S=window.__sonde;return {calls:S.calls,tris:S.tris,nfMs:+S.nf.toFixed(2),nfn:S.nfn}})())`));
      R.nImg = R.images.length; R.mesure.callsParImg = +(R.mesure.calls / Math.max(1, R.mesure.nfn)).toFixed(1); R.mesure.nfMsParImg = +(R.mesure.nfMs / Math.max(1, R.mesure.nfn)).toFixed(3);
      R.erreurs = await c.ev("(function(){try{return JSON.stringify([window.__loopErr||null,window.__banqErr||null])}catch(e){return String(e)}})()");
      R.s = Math.round((Date.now() - t0) / 1000);
      console.log(car, R.nom, sc, 'décolle', R.decolle, 'fig', R.fig, 'img', R.nImg, 'modes', R.images.map(x => x.mode[0]).join(''), JSON.stringify(R.mesure), R.erreurs, R.s + ' s');
      rapport.scenes.push(R);
      fs.writeFileSync(path.join(OUT, TAG + '-rapport.json'), JSON.stringify(rapport, null, 1));
    }
    rapport.exceptions = exc.slice(0, 10);
    fs.writeFileSync(path.join(OUT, TAG + '-rapport.json'), JSON.stringify(rapport, null, 1));
    console.log('exceptions', JSON.stringify(exc.slice(0, 4)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
