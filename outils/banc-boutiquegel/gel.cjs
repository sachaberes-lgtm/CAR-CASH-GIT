// LE BANC DU GEL DE LA BOUTIQUE (2026-11-19, lot « boutiquegel »), dans le VRAI jeu. UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde),
// iPhone 13 Pro émulé 844×390 DPR 3, tactile, UA iPhone, ?tel=1&appareil=iPhone14,2. Processeur bridé ×4 (CDP) pendant les mesures. Profil Chrome NEUF à chaque passe.
//   node outils/banc-boutiquegel/gel.cjs --essai avec|sans --lieu accueil|garage [--prof <dossier parent>] [--http 9981] [--cdp 9982] [--repos 1]
// accueil : depuis l'accueil, BOUTIQUE (l'écran des caisses, #mShop) ; garage : l'atelier ouvert, BOUTIQUE du bas (#gShopBas, la boutique 3D).
// Mesures : le démarrage (navigation → __gameReady), le menu au repos (6 s sans geste, bridé : écarts d'images et temps occupé du fil),
// puis la PREMIÈRE ouverture : écarts d'images pendant 4 s, longues tâches, profileur (échantillons 250 µs) → les fonctions qui remplissent la pire image.
// Une ligne JSON sur la sortie. Chrome tué (son groupe), profil effacé, quoi qu'il arrive.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const ESSAI = A.essai || 'avec', LIEU = A.lieu || 'garage', [W, H] = [844, 390], P_HTTP = +(A.http || 9981), P_CDP = +(A.cdp || 9982), PUCE = +(A.puce || 4);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ETAT = "JSON.stringify({shop:!!document.querySelector('#mShop.on'),gar:(document.getElementById('garage')||{}).className,bq:(function(){try{var b=dbgBqIndus();return {veut:b.veut,on:b.on}}catch(e){return String(e)}})()})";
const SONDE = `(function(){if(window.__bg)return 1;const O=window.__bg={t0:0,img:[],lt:[],der:0};(function f(t){if(O.t0){if(O.der)O.img.push([+(O.der-O.t0).toFixed(0),+(t-O.der).toFixed(1)]);O.der=t;}requestAnimationFrame(f);})(0);
 try{new PerformanceObserver(function(l){for(const e of l.getEntries())if(O.t0)O.lt.push([Math.round(e.startTime-O.t0),Math.round(e.duration)]);}).observe({entryTypes:['longtask']});}catch(e){}return 1;})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(A.prof || os.tmpdir(), 'banc-bg-prof-'));
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(130); }); process.on('SIGTERM', () => { fin(); process.exit(143); });
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const J = async (x, t) => { const v = await c.ev(x, t); return typeof v === 'string' ? JSON.parse(v) : v; };
  const touche = async (x, y, ms) => { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(ms || 60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const centre = sel => J(`JSON.stringify((function(){var L=Array.from(document.querySelectorAll(${JSON.stringify(sel)})).filter(function(e){var b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).visibility!=='hidden'});if(!L.length)return null;var b=L[0].getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})())`);
  const R = { essai: ESSAI, lieu: LIEU, puce: PUCE, t0: new Date().toISOString() };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: 'fast', qChoisi: 1, shopVu: 1 };
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&carte=nuages&pistegraine=7&tel=1&appareil=iPhone14,2` + (ESSAI === 'sans' ? '&sans=boutiquegel' : '') + (A.plus ? '&' + A.plus : '');
    /* le démarrage, bridé lui aussi : navigation → __gameReady */
    await c.send('Emulation.setCPUThrottlingRate', { rate: PUCE });
    const tN = Date.now(); await c.send('Page.navigate', { url });
    let pret = false; for (let i = 0; i < 600; i++) { await dormir(200); try { if (await c.ev('!!window.__gameReady', 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    R.demarrageMs = Date.now() - tN;
    await c.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await dormir(1500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(4000);
    try { await c.ev("window.__mGo&&window.__mGo('home');1"); } catch (e) {}
    await dormir(2500);
    await c.ev(SONDE);
    await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 250 });
    const decale = (profile) => { /* l'instant (ms depuis le début du profil) de la marque posée à t0 */
      const nodes = new Map(); for (const n of profile.nodes) nodes.set(n.id, n);
      let t = profile.startTime; for (let i = 0; i < profile.samples.length; i++) { t += profile.timeDeltas[i] || 0; if (nodes.get(profile.samples[i]).callFrame.functionName === '__marqueBanc') return (t - profile.startTime) / 1000; } return 0; };
    const taches = (profile, noms) => { /* les tranches (relatives à t0) où la pile contient un des noms : [début, durée, nom] */
      const nodes = new Map(); for (const n of profile.nodes) nodes.set(n.id, n);
      const par = new Map(); for (const n of profile.nodes) for (const x of (n.children || [])) par.set(x, n.id);
      const off = decale(profile); let t = profile.startTime; const L = []; let cur = null;
      profile.samples.forEach((s, i) => { const d = profile.timeDeltas[i] || 0; t += d; const ms = (t - profile.startTime) / 1000 - off; let x = s, nom = null;
        while (x != null) { const f = nodes.get(x).callFrame.functionName; if (noms.indexOf(f) >= 0) nom = f; x = par.get(x); }
        if (nom) { if (cur && ms - cur[3] < 3) { cur[3] = ms; if (cur[2].indexOf(nom) < 0) cur[2] += '+' + nom; } else { cur = [ms, 0, nom, ms]; L.push(cur); } } });
      return L.map(c => [Math.round(c[0]), Math.round(c[3] - c[0]), c[2]]); };
    const agrege = (profile, de, a) => { /* temps occupé (hors idle/program/gc) entre de et a ms après le départ du profil ; cumul par fonction */
      const nodes = new Map(); for (const n of profile.nodes) nodes.set(n.id, n);
      const par = new Map(); for (const n of profile.nodes) for (const x of (n.children || [])) par.set(x, n.id);
      let t = profile.startTime; let occ = 0; const tot = new Map(), self = new Map();
      profile.samples.forEach((s, i) => { const d = profile.timeDeltas[i] || 0; t += d; const ms = (t - profile.startTime) / 1000; if (ms < de || ms > a) return;
        const n = nodes.get(s), f = n.callFrame.functionName; if (f === '(idle)') return; occ += d;
        const k0 = (f || '(anon)') + ':' + n.callFrame.lineNumber; self.set(k0, (self.get(k0) || 0) + d);
        const vus = new Set(); let x = s; while (x != null) { const nn = nodes.get(x), k = (nn.callFrame.functionName || '(anon)') + ':' + nn.callFrame.lineNumber; if (!vus.has(k)) { vus.add(k); tot.set(k, (tot.get(k) || 0) + d); } x = par.get(x); } });
      const top = (m, n) => [...m.entries()].sort((p, q) => q[1] - p[1]).slice(0, n).map(([k, v]) => Math.round(v / 1000) + ' ' + k);
      return { occupeMs: Math.round(occ / 1000), cumul: top(tot, 40), propre: top(self, 20) };
    };
    /* LE MENU AU REPOS : 6 s sans geste, bridé */
    if (LIEU === 'garage') {
      const g = await centre('#mHome [data-m="garage"]'); R.porteGarage = g; if (g) await touche(g[0], g[1]); else await c.ev("document.querySelector('#mHome [data-m=\"garage\"]').click();1");
      await dormir(9000);
    }
    if (A.attente) await dormir(+A.attente); /* le menu laissé au repos avant tout (la préparation des programmes du studio) */
    R.preRepos = await J("JSON.stringify(window.dbgPhotoPre?dbgPhotoPre():null)");
    await c.send('Emulation.setCPUThrottlingRate', { rate: PUCE }); await dormir(1000);
    if (A.repos !== '0') {
      await c.send('Profiler.start');
      await c.ev('window.__bg.img.length=0;window.__bg.lt.length=0;window.__bg.der=0;window.__bg.t0=performance.now();(function __marqueBanc(){var a=performance.now();while(performance.now()-a<3);})();1');
      await dormir(6000);
      const { profile } = await c.send('Profiler.stop');
      const o = await J('JSON.stringify(window.__bg)');
      const g = o.img.map(x => x[1]).sort((p, q) => p - q);
      const a = agrege(profile, 0, 1e9);
      R.repos = { images: g.length, p50: g[g.length >> 1], pire: g[g.length - 1], longues: o.lt.length, longuesMs: o.lt.reduce((s, x) => s + x[1], 0), occupeMs: a.occupeMs, cumul: a.cumul.slice(0, 12) };
    }
    /* LA PREMIÈRE OUVERTURE */
    const sel = LIEU === 'garage' ? '#gShopBas' : '#mHome [data-m="shop"]';
    R.avant = await J(ETAT); R.preAvant = await J("JSON.stringify(window.dbgPhotoPre?dbgPhotoPre():null)");
    const p = await centre(sel); R.porte = p && p.map(Math.round);
    await c.send('Profiler.start');
    await c.ev('window.__bg.img.length=0;window.__bg.lt.length=0;window.__bg.der=0;window.__bg.t0=performance.now();(function __marqueBanc(){var a=performance.now();while(performance.now()-a<3);})();1');
    if (LIEU === 'garage') await c.ev("document.getElementById('gShopBas').click();1"); /* le geste du banc de l'iPhone (clic) : le toucher émulé tombait à côté de la porte repliée */
    else if (p) await touche(p[0], p[1], 50); else throw new Error('porte introuvable : ' + sel);
    await dormir(+(A.ms || 4000));
    const { profile } = await c.send('Profiler.stop');
    await c.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const o = await J('JSON.stringify(window.__bg)');
    const tri = o.img.slice().sort((x, y) => y[1] - x[1]);
    R.ouverture = { images: o.img.length, pire: tri[0], pires: tri.slice(0, 6), plus50: o.img.filter(x => x[1] > 50).length, plus100: o.img.filter(x => x[1] > 100).length, longues: o.lt };
    R.ouverte = await J(ETAT);
    if (tri[0]) { const d = tri[0][0], f = d + tri[0][1]; const o9 = decale(profile); const a = agrege(profile, d - 5 + o9, f + 5 + o9); R.pireImage = { de: d, a: f, occupeMs: a.occupeMs, cumul: a.cumul, propre: a.propre }; }
    const tout = agrege(profile, 0, 1e9); R.fenetre = { occupeMs: tout.occupeMs, cumul: tout.cumul.slice(0, 30) };
    R.taches = taches(profile, ['vitrinePhoto', 'carPhoto', 'shopPhotoTour', 'photoTour', 'photoRafale', 'buildCar', 'garBqBatit', 'garBqUI', 'shopRender', 'garBqPanneau', 'bqPhotos', 'vitrineVide', 'compile', 'figFilm', 'aileFile']).filter(x => x[1] >= 8);
    /* L'IMAGE : la file des photos vidée (10 s au plus), l'empreinte de chaque photo posée (pixels décodés, FNV-1a) et une capture de l'écran */
    for (let k = 0; k < 20; k++) { const q = await J("JSON.stringify((function(){try{return (window.dbgShopChaine?dbgShopChaine().file.length:0)+dbgPhotoFile().file}catch(e){return 0}})())"); if (!q) break; await dormir(500); }
    await dormir(1500);
    R.pre = await J("JSON.stringify(window.dbgPhotoPre?dbgPhotoPre():null)");
    R.chaine = await J("JSON.stringify(window.dbgShopChaine?dbgShopChaine():null)");
    R.empreintes = await c.ev(`(async function(){const L=Array.from(document.querySelectorAll(${JSON.stringify(LIEU === 'garage' ? '#gBqPan img' : '#mShop .shBx img')})).filter(function(i){return i.src&&!i.classList.contains('vtV')});const R={};
      for(const im of L){try{await im.decode();}catch(e){}if(!im.naturalWidth)continue;const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');x.drawImage(im,0,0);
        const d=x.getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i+=1){h^=d[i];h=Math.imul(h,16777619);}
        const k=(im.closest('[data-car]')||im.closest('[data-k]')||im.parentElement);const nom=(k&&(k.getAttribute('data-car')||k.getAttribute('data-k')))||'?';const pw=60,ph=Math.round(60*cv.height/cv.width),pc=document.createElement('canvas');pc.width=pw;pc.height=ph;const px=pc.getContext('2d');px.drawImage(cv,0,0,pw,ph);const pd=px.getImageData(0,0,pw,ph).data,v=[];for(let i=0;i<pd.length;i++)if(i%4!==3)v.push(pd[i]);R[nom+'#'+(im.className||'')]={h:(h>>>0).toString(36),t:cv.width+'x'+cv.height,v:v.join(',')};}
      return JSON.stringify(R);})()`, 60000);
    try { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); if (A.out) { fs.mkdirSync(A.out, { recursive: true }); fs.writeFileSync(path.join(A.out, ESSAI + '-' + LIEU + '-' + Date.now() + '.png'), Buffer.from(sh.data, 'base64')); } } catch (e) {}
    R.carMenu = await J("JSON.stringify((function(){try{var S=dbgScene();return {lvl:S.car.userData.lvl,vis:S.car.visible,enfants:S.car.children.length,par:!!S.car.parent}}catch(e){return String(e)}})())");
  } catch (e) { R.erreur = String(e && e.message || e); }
  try { R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie','chargement'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)})}catch(e){return String(e)}})()"); } catch (e) {}
  R.exc = exc; R.t1 = new Date().toISOString();
  console.log(JSON.stringify(R));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
