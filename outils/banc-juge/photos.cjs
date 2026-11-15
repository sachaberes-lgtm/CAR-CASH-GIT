// LES PHOTOS DES PROFILS (2026-11-15, lot profils2) : une COPIE de outils/banc-qualite/niveaux.cjs (lot 5, dont la description suit) avec deux options de plus :
//   --ecran 926x428 (la taille de l'écran émulé, points CSS couchés : un Pro Max, un 15, un 16 Pro) ; --mi "dbgThermique(2)" (évalué dès la course lancée, puis --miAttente s secondes de boucle réelle
//   avant de figer : un état thermique posé, le gouverneur applique son palier). Et AVANT de lancer : au plus 3 Chrome de banc sur le Mac (on attend).
// LE BANC DES NIVEAUX (2026-11-14, chantier QUALITÉ PAR APPAREIL, lot 5 : les planches photo par niveau).
// UN Chrome sans fenêtre et muet, iPhone émulé (844×390 couché / 390×844 debout, DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai, SANS ?tel=1 : le profil
// PRF se calcule tout seul depuis ?appareil=). Pour chaque essai (appareil, réglage, interrupteurs) : page neuve, sauvegarde muette, même graine de piste, course lancée,
// pilote auto + nitro, la boucle menée à la main (dbgStep 33 ms, rAF coupé) : le MÊME nombre de pas donc la MÊME image de course ; la caisse est relevée (position, km/h)
// pour le prouver. Puis : image entière, zoom sur la caisse, zoom sur les traînées (pixels d'écran, ×3), et le relevé chiffré (dbgPrf, toile réelle, ombre, halo,
// renderer.info : appels, triangles, programmes ; une seconde image plus tard pour voir si l'ombre ou la toile bougent).
//   node outils/banc-qualite/niveaux.cjs --out <dossier> [--fmt couche|debout] [--carte nuages|jade] [--meteo nuit] [--pas 300] [--max 600]
//        [--essais "N1:iPhone14,2:fast;N2:iPhone14,2:haute;N3:iPhone15,4:haute;N4:iPhone18,1:haute;T:iPhone14,2:neuf:sans=profil"] [--http 9881] [--cdp 9882]
// Un essai = <étiquette>:<appareil>:<fast|haute|net|neuf>[:<paramètres d'URL en plus, séparés par +>]. Prendre le verrou du Mac AVANT, le rendre APRÈS.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = A.ecran ? A.ecran.split('x').map(Number) : FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', METEO = A.meteo || '', PAS = +(A.pas || 420), VMAX = +(A.max || 600);
const P_HTTP = +(A.http || 9881), P_CDP = +(A.cdp || 9882);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ESSAIS = (A.essais || 'N1:iPhone14,2:fast;N2:iPhone14,2:haute;N3:iPhone15,4:haute;N4:iPhone18,1:haute;T:iPhone14,2:neuf:sans=profil').split(';').filter(Boolean)
  .map(s => { const [tag, ap, q, plus] = s.split(':'); return { tag, ap, q: q || 'neuf', plus: (plus || '').split('+').filter(Boolean).join('&') }; });
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const RELEVE = `(function(){var o={},S=dbgScene(),r=S.rdr,gl=r.getContext();
  try{o.prf=dbgPrf()}catch(e){o.prf='ERR '+e.message}
  try{o.toile=[gl.drawingBufferWidth,gl.drawingBufferHeight];o.css=[innerWidth,innerHeight];o.dprEcran=devicePixelRatio;o.native=(function(){try{return {hover:matchMedia('(hover:none)').matches,tel:typeof TEL_NATIF!=='undefined'?TEL_NATIF:'?'}}catch(e){return 'ERR'}})()}catch(e){}
  try{o.qual=dbgQual()}catch(e){o.qual='ERR '+e.message}
  try{var I=r.info;I.autoReset=false;I.reset();dbgLoupe({rendre:1});o.calls=I.render.calls;o.tri=I.render.triangles;o.progs=I.programs?I.programs.length:null;o.geom=I.memory.geometries;o.tex=I.memory.textures;I.autoReset=true}catch(e){o.info='ERR '+e.message}
  try{o.loupe=(function(l){return {on:l.on,k:l.k,kq:l.kq,horsDpr:l.horsDpr,pxDisque:l.pxDisque,segRubans:l.segRubans,pxRubans:l.pxRubans,scene:l.scene,toile:l.toile}})(dbgLoupe())}catch(e){}
  try{o.rubans=(function(r){return {net:r.net,larg:r.larg,masque:r.masque,long:r.long,on:r.on}})(dbgRubans())}catch(e){}
  try{var st=dbgState();o.etat={vH:st.vH,s:st.s,lat:st.lat,mode:st.mode,engTier:st.engTier}}catch(e){}
  try{var p=S.car.position;o.caisse=[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)];o.kmh=(function(){try{return Math.round(speedKmh)}catch(e){return null}})()}catch(e){}
  try{o.perf=dbgPerf()}catch(e){}
  return JSON.stringify(o)})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const chromes = () => { try { return cp.execSync("pgrep -fl 'remote-debugging-port' || true").toString().split('\n').filter(l => /MacOS\/Google Chrome --/.test(l)).length; } catch (e) { return 0; } };
  while (chromes() >= 3) await dormir(5000);
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error')) cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 120000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const tous = [];
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    let idScript = null;
    for (const E of ESSAIS) {
      exc = []; cons = [];
      const rec = { essai: E, fmt: FMT, carte: CARTE, meteo: METEO };
      try {
        const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
        if (E.q !== 'neuf') { SAVE.q = E.q; SAVE.qChoisi = E.q === 'net' ? 0 : 1; }
        if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
        idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' })).identifier;
        await c.send('Page.navigate', { url: 'about:blank' }); await dormir(400);
        const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=${CARTE}${METEO ? '&meteo=' + METEO : ''}&pistegraine=7&appareil=${E.ap}` + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
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
        if (A.mi) { try { rec.mi = await c.ev(A.mi); } catch (e) { rec.mi = 'err ' + e.message; } await dormir((+(A.miAttente || 8)) * 1000); }
        rec.depart = JSON.parse(await c.ev(RELEVE));
        /* la boucle à la main ; l'échelle de qualité figée à ce qu'elle a choisi (le Mac sans GPU ne doit pas la faire descendre) */
        await c.ev("window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:1});try{dbgPin(true)}catch(e){};1");
        await dormir(300); await c.ev(MASQUE);
        const pas = async n => { for (let k = 0; k < n; k += 30) await c.ev(`(async function(){try{dbgNitro(9,0)}catch(e){};for(var i=0;i<${Math.min(30, n - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000); };
        await pas(PAS);
        rec.pasTotal = PAS; /* nombre de pas FIXE : la même image de course pour tous les niveaux (pas de seuil de vitesse) */
        const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
        rec.ecranCaisse = pc;
        /* deux rendus (sur un Mac saturé la photo prenait parfois l'image d'avant), puis le relevé, puis la photo */
        await c.ev('dbgLoupe({rendre:1});1'); await dormir(400);
        rec.releve = JSON.parse(await c.ev(RELEVE)); await dormir(400); await c.ev('dbgLoupe({rendre:1});1'); await dormir(400);
        const zw = FMT === 'debout' ? 200 : 240, zh = FMT === 'debout' ? 260 : 170;
        const zx = Math.max(0, Math.min(W - zw, Math.round(pc[0] - zw / 2))), zy = Math.max(0, Math.min(H - zh, Math.round(pc[1] - zh * .62)));
        /* les traînées : derrière la caisse (sous elle à l'écran), plus larges */
        const tw = FMT === 'debout' ? 300 : 380, th = FMT === 'debout' ? 300 : 190;
        const tx = Math.max(0, Math.min(W - tw, Math.round(pc[0] - tw / 2))), ty = Math.max(0, Math.min(H - th, Math.round(pc[1] - th * .12)));
        rec.zoomCaisse = [zx, zy, zw, zh]; rec.zoomTrainees = [tx, ty, tw, th];
        const b = `${E.tag}-${FMT}-${CARTE}`;
        await shot(`${b}-jeu.png`); await shot(`${b}-caisse.png`, [zx, zy, zw, zh]); await shot(`${b}-trainees.png`, [tx, ty, tw, th]);
        /* une autre prise de la MÊME image, plus tard : l'ombre ou la toile ne doivent pas avoir sauté */
        await dormir(1500); await c.ev('dbgLoupe({rendre:1});1'); await dormir(300);
        rec.releve2 = JSON.parse(await c.ev(RELEVE));
        /* (après toutes les photos) la vitesse : la boucle n'écrit le compteur qu'hors tactile ; on lève le drapeau mis en cache et on avance d'un pas */
        if (A.vitesse === '1') rec.vitesse = await c.ev("(function(){try{loop._nu=false;dbgStep(1,33);return loop._spK}catch(e){return 'ERR '+e.message}})()");
        rec.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()");
      } catch (e) { rec.erreur = String(e.message || e).slice(0, 400); }
      rec.exc = exc.slice(0, 6); rec.cons = cons.slice(0, 6);
      tous.push(rec); fs.writeFileSync(path.join(OUT, `niveaux-${FMT}-${CARTE}-chiffres.json`), JSON.stringify(tous, null, 1));
      console.log(E.tag, rec.erreur ? 'ERREUR ' + rec.erreur : 'ok', JSON.stringify(rec.releve ? { toile: rec.releve.toile, calls: rec.releve.calls, tri: rec.releve.tri, progs: rec.releve.progs, kmh: rec.releve.kmh, caisse: rec.releve.caisse } : null), 'exc', exc.length, 'cons', JSON.stringify(cons.slice(0, 3)));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
