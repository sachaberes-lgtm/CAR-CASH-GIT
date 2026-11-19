// LE BANC DU MENU AU CHAUD (2026-11-18, lot « menuchaud »), dans le VRAI jeu. UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde),
// iPhone 13 Pro émulé 844×390 DPR 3, tactile, UA iPhone → TEL_NATIF vrai ; profil N1 BASSE (?appareil=iPhone14,2, réglage 'fast'), comme Sacha.
//   node outils/banc-menuchaud/menuchaud.cjs --essai avec|sans|pc [--mode tout|explore|photo] [--out <dossier>] [--prof <dossier parent du profil>] [--http 9991] [--cdp 9992]
// tout : à l'accueil, FROID (capteur nominal) puis CHAUD (capteur serious, branché) :
//   · coût par image (dbgCout : puce chronométrée, appels) pendant 8 s touchées (cadence de geste/30) ;
//   · repos : 14 s sans geste, les instants des images RENDUES (renderer.render enveloppé) → intervalles avant / après 10 s ;
//   · reprise : un toucher dans le ciel → délai jusqu'à l'image suivante, intervalles de la seconde qui suit ;
//   · donut : après 12 s de repos, doigt tenu 1,1 s sur la caisse puis glissé 1 s → BURN (dbgBurn) et intervalles pendant le geste.
// photo : rAF coupé, la boucle menée à la main (dbgStep, dt 0) ; froid, froid encore (le bruit), chaud : image entière + caisse.
// pc : l'ordinateur (pas d'émulation téléphone) : l'état du lot doit rester inactif.
// Une ligne JSON. Le profil Chrome est effacé à la fin, Chrome est tué (son groupe seulement), quoi qu'il arrive.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const ESSAI = A.essai || 'avec', MODE = A.mode || 'tout', PC = ESSAI === 'pc', [W, H] = [844, 390], P_HTTP = +(A.http || 9991), P_CDP = +(A.cdp || 9992);
const OUT = path.resolve(A.out || path.join(os.tmpdir(), 'banc-menuchaud'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
/* les images RENDUES : renderer.render enveloppé, une image = les passes à moins de 6 ms l'une de l'autre */
const ENREG = `(function(){var r=dbgScene().rdr;if(r.__mchEnv)return 1;r.__mchEnv=1;var o=r.render;window.__mchFr=[];window.__mchN=0;r.render=function(){window.__mchN++;var n=performance.now(),L=window.__mchFr;if(!L.length||n-L[L.length-1]>6)L.push(n);else L[L.length-1]=n;return o.apply(this,arguments);};return 1})()`;
const st = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return { n: s.length, p10: +s[(s.length * .1) | 0].toFixed(1), p50: +s[s.length >> 1].toFixed(1), p90: +s[Math.min(s.length - 1, (s.length * .9) | 0)].toFixed(1), max: +s[s.length - 1].toFixed(1) }; };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(A.prof || os.tmpdir(), 'banc-mch-prof-'));
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(130); }); process.on('SIGTERM', () => { fin(); process.exit(143); });
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const J = async (x, t) => { const v = await c.ev(x, t); return typeof v === 'string' ? JSON.parse(v) : v; };
  const pret = async () => { for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgMenuChaud==='function'", 8000)) return true; } catch (e) {} } return false; };
  const voile = async () => { await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500); };
  const touche = async (x, y, ms) => { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(ms || 60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const etat = () => J("JSON.stringify({m:dbgMenuChaud(),hc:dbgHC(),cc:window.__ccThermique==null?null:window.__ccThermique})");
  const images = async (ms) => { await c.ev('window.__mchFr.length=0;1'); await dormir(ms); return J('JSON.stringify(window.__mchFr)'); };
  const ecarts = L => { const d = []; for (let i = 1; i < L.length; i++) d.push(L[i] - L[i - 1]); return d; };
  const cout = async (s) => { await c.ev('dbgCout(1);1'); const t0 = Date.now(); while (Date.now() - t0 < s * 1000) { await touche(420, 60); await dormir(1500); }
    const r = await J('JSON.stringify(dbgCout())'); await c.ev('dbgCout(0);1'); return r; };
  const caisseEcran = () => J("JSON.stringify((function(){var S=dbgScene(),p=S.car.position.clone();S.car.parent&&S.car.parent.localToWorld?S.car.getWorldPosition(p):0;var v=p.project(S.cam);return [(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight]})())");
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 120000); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const bouton = async (txt) => { const p = await J(`JSON.stringify((function(){var L=Array.from(document.querySelectorAll('.pbtn,button')).filter(function(e){var b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).visibility!=='hidden'&&(e.textContent||'').toUpperCase().indexOf(${JSON.stringify(txt)})>=0});if(!L.length)return null;var b=L[0].getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})())`); if (p) await touche(p[0], p[1]); return p; };
  const R = { essai: ESSAI, mode: MODE, t0: new Date().toISOString() };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!PC) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    }
    const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: 'fast', qChoisi: 1 };
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7` + (PC ? '' : '&appareil=iPhone14,2') + (ESSAI === 'sans' ? '&sans=menuchaud' : '');
    await c.send('Page.navigate', { url });
    if (!(await pret())) throw new Error('pas prêt');
    await dormir(1500); await voile(); await dormir(3000);
    await c.ev(ENREG);
    R.depart = await etat();
    if (MODE === 'explore') {
      R.points = await J("JSON.stringify([[420,60],[420,200],[200,300],[700,300]].map(function(p){var e=document.elementFromPoint(p[0],p[1]);return [p,e?(e.id||e.tagName)+'.'+String(e.className).slice(0,40):null]}))");
      R.caisse = await caisseEcran();
      R.boutons = await J("JSON.stringify(Array.from(document.querySelectorAll('button,[data-go],.pbtn')).filter(function(e){var b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).visibility!=='hidden'}).slice(0,40).map(function(e){var b=e.getBoundingClientRect();return (e.id||'')+'|'+String(e.className).slice(0,30)+'|'+(e.textContent||'').trim().slice(0,16)+'|'+Math.round(b.left+b.width/2)+','+Math.round(b.top+b.height/2)}))");
      await c.ev('dbgThermique(0);1'); await dormir(500); R.froid = await etat();
      await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await dormir(1000); R.chaud = await etat();
    }
    if (MODE === 'tout' || MODE === 'pc') {
      const phase = async (nom, th) => {
        const P = {};
        await c.ev(`dbgThermique(${th});window.__ccBranche=${th >= 2 ? 2 : 0};1`); await dormir(1500);
        P.voulu = await etat();
        if (ESSAI === 'avec') { await c.ev(`dbgMenuChaud(${th >= 2 ? 1 : 0});dbgMenuChaud(null);1`); } /* le banc pose l'état tout de suite (dans le jeu : sous le volet) puis rend la main au capteur */
        await dormir(1500); await touche(420, 60); await dormir(800);
        P.etat = await etat();
        P.cout = await cout(8);
        /* le repos : 14 s sans geste */
        await touche(420, 60); const fr = await images(14000);
        const tg = await J("JSON.stringify(performance.now())"); /* les instants relatifs au geste : le geste est ~14 s avant la fin */
        const avant = [], apres = [];
        for (let i = 1; i < fr.length; i++) { const age = fr[i] - (tg - 14000); (age < 9500 ? avant : age > 10800 ? apres : []).push(fr[i] - fr[i - 1]); }
        P.repos = { avant10s: st(avant), apres10s: st(apres), imagesParSeconde: { avant: avant.length ? +(1000 / (avant.reduce((a, b) => a + b, 0) / avant.length)).toFixed(1) : 0, apres: apres.length ? +(1000 / (apres.reduce((a, b) => a + b, 0) / apres.length)).toFixed(1) : 0 }, cadence: (await etat()).hc };
        /* la reprise : un toucher dans le ciel */
        await c.ev('window.__mchFr.length=0;window.__mchT=performance.now();1'); await touche(420, 60, 40); await dormir(1200);
        const rp = await J('JSON.stringify({t:window.__mchT,f:window.__mchFr.slice()})');
        const dr = ecarts(rp.f); P.reprise = { premiereImageMs: rp.f.length ? +(rp.f[0] - rp.t).toFixed(1) : null, ecarts300ms: st(rp.f.filter(x => x - rp.t < 300).length > 1 ? ecarts(rp.f.filter(x => x - rp.t < 300)) : []), ecartsApres500ms: st(ecarts(rp.f.filter(x => x - rp.t > 500))) };
        /* le donut, dans l'atelier (le garage), après 12 s de repos */
        P.garage = await bouton('GARAGE'); await dormir(12000); P.avantDonut = (await etat()).hc; P.avantDonutMch = (await etat()).m;
        const ce = await caisseEcran(); P.caisse = ce.map(Math.round);
        await c.ev('window.__mchFr.length=0;window.__mchT=performance.now();1');
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: ce[0], y: ce[1] }] });
        for (let i = 0; i < 11; i++) { await dormir(100); }
        const burnTenu = await J("JSON.stringify((function(){var b=dbgBurn();return b&&typeof b==='object'?{on:b.on,hold:!!b.hold,don:b.don,k:b.k}:b})())").catch(e => String(e));
        for (let i = 1; i <= 20; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: ce[0] + 6 * i, y: ce[1] + 2 * Math.sin(i / 3) * 10 }] }); await dormir(50); }
        const burnGlisse = await J("JSON.stringify((function(){var b=dbgBurn();return b&&typeof b==='object'?{on:b.on,hold:!!b.hold,don:b.don,k:b.k,donM:b.donM,yawV:b.yawV}:b})())").catch(e => String(e));
        const hcPendant = (await etat()).hc;
        await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        const dn = await J('JSON.stringify({t:window.__mchT,f:window.__mchFr.slice()})');
        P.donut = { tenu: burnTenu, glisse: burnGlisse, cadencePendant: hcPendant, ecarts: st(ecarts(dn.f)), images: dn.f.length, dureeMs: dn.f.length ? Math.round(dn.f[dn.f.length - 1] - dn.t) : 0 };
        await dormir(2500); try { await c.ev('dbgBurn(0);1'); } catch (e) {}
        P.accueil = await bouton('ACCUEIL'); await dormir(2500);
        R[nom] = P;
      };
      await phase('froid', 0);
      await phase('chaud', 2);
      R.fin = await etat();
      if (ESSAI === 'avec') { /* LE VOLET : l'état change sans volet → rien ne bouge ; le volet (GARAGE puis retour) le pose */
        const V = {};
        await c.ev('dbgThermique(0);window.__ccBranche=0;1'); await dormir(2500); V.froidSansVolet = (await etat()).m;
        V.garage = await bouton('GARAGE'); await dormir(2500); V.apresVolet1 = (await etat()).m;
        V.boutonsGarage = await J("JSON.stringify(Array.from(document.querySelectorAll('.pbtn,button')).filter(function(e){var b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).visibility!=='hidden'}).slice(0,30).map(function(e){var b=e.getBoundingClientRect();return (e.id||'')+'|'+String(e.className).slice(0,30)+'|'+(e.textContent||'').trim().slice(0,14)+'|'+Math.round(b.left+b.width/2)+','+Math.round(b.top+b.height/2)}))");
        await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await dormir(2500); V.chaudSansVolet = (await etat()).m;
        V.retour = await bouton(A.retour || 'ACCUEIL') || await bouton('MENU') || await bouton('RETOUR'); await dormir(2500); V.apresVolet2 = (await etat()).m;
        R.volet = V;
      }
    }
    if (MODE === 'cout') { /* le coût par image en A/B ALTERNÉ dans la même session (la puce du Mac est partagée : deux sessions ne se comparent pas) */
      await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await dormir(1500); R.blocs = [];
      const N = +(A.blocs || 8);
      for (let i = 0; i < N; i++) { const f = i % 2 ? 0 : 1; await c.ev(`dbgMenuChaud(${f});1`); await dormir(1000);
        const r = await cout(5); R.blocs.push({ chaud: f, gpu: r.gpu, cpu: r.cpu, appels: r.image && r.image.calls, ombre: r.ombre, bloom: r.bloom, toile: r.toile, dpr: r.dpr }); }
      const med = f => { const a = R.blocs.filter(b => b.chaud === f && b.gpu).map(b => b.gpu.p50).sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; };
      const p90 = f => { const a = R.blocs.filter(b => b.chaud === f && b.gpu).map(b => b.gpu.p90).sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; };
      R.resume = { gpuP50: { lot: med(1), avant: med(0) }, gpuP90: { lot: p90(1), avant: p90(0) } };
    }
    if (MODE === 'photo') {
      await c.ev('dbgThermique(2);window.__ccBranche=2;1'); await dormir(1000);
      /* LE TEMPS FIGÉ : rAF coupé, performance.now et Date.now arrêtés ; chaque pas = une image à dt 0, un « geste » (molette) pour que la cadence du menu ne la saute pas */
      await c.ev("window.requestAnimationFrame=function(){return 0;};1"); await dormir(400);
      try { R.fige = await c.ev("(function(){var C=dbgChute();var t=C&&C.t!=null?C.t:5;dbgChute({fige:t,tour:0});return t})()"); } catch (e) { R.fige = String(e); }
      await c.ev("(function(){var T=performance.now(),D=Date.now();performance.now=function(){return T};Date.now=function(){return D};return 1})()");
      const pas = async (n) => { for (let i = 0; i < n; i++) { await c.ev("document.dispatchEvent(new WheelEvent('wheel'));dbgStep(1,0);1"); await dormir(120); } };
      await pas(6);
      const ce = await caisseEcran(), cl = [Math.max(0, Math.round(ce[0] - 130)), Math.max(0, Math.round(ce[1] - 80)), 260, 150];
      R.clip = cl; R.photos = {};
      for (const [tag, f] of [['froid1', 0], ['froid2', 0], ['chaud', 1], ['froid3', 0]]) {
        await c.ev(`dbgMenuChaud(${f});1`); await pas(4);
        R.photos[tag] = await etat(); R.photos[tag].rendus = await c.ev('window.__mchN');
        await shot(`${ESSAI}-${tag}-jeu.png`); await shot(`${ESSAI}-${tag}-caisse.png`, cl);
      }
    }
  } catch (e) { R.erreur = String(e && e.message || e); }
  try { R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)})}catch(e){return String(e)}})()"); } catch (e) {}
  R.exc = exc; R.t1 = new Date().toISOString();
  console.log(JSON.stringify(R));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
