// LE BANC DES VIBRATIONS EN VOL (2026-11-15, Sacha : « la voiture a toujours des vibrations à certains moments sur route et en l'air »).
// UN Chrome sans fenêtre et muet, iPhone 13 Pro émulé. La boucle est menée à la main : rAF coupé, HORLOGE VIRTUELLE (performance.now remplacé :
// aucune milliseconde réelle n'entre dans la mesure), dbgStep(1,ms) à dt IMPOSÉ. À chaque image on relève la caisse (carGroup et la carrosserie),
// la caméra, et LA CAISSE DANS LE REPÈRE DE LA CAMÉRA (pixels projetés, rotation relative), plus l'état du vol (dbgVol).
//   node outils/banc-vibration/vol.cjs --out <dossier> [--carte nuages] [--fmt couche|debout] [--dt r60|r30|alt|tel|bascule] [--n 900] [--v 250]
//        [--nit 0|1|2] [--saut 0.4] [--imp 20] [--lat 0] [--fig 0|N (un double-tap toutes les N images de vol)] [--q "x=1"] [--graine 7] [--tag x]
// Verrou du Mac AVANT (~/cash-car/verrou-banc.sh prendre "vib-vol"), le rendre APRÈS. L'analyse : node outils/banc-vibration/analyse.cjs <fichier.json>
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', V = +(A.v || 250), NIT = +(A.nit || 0), IMP = +(A.imp || 20), N = +(A.n || 900), SAUT = +(A.saut || .4), LAT = +(A.lat || 0), FIG = +(A.fig || 0);
const DT = A.dt || 'r60', GR = A.graine || '7';
const TAG = (A.tag || 'vib') + '-' + FMT + '-' + CARTE + '-' + DT + '-v' + V + (NIT ? 'n' + NIT : '') + (FIG ? '-fig' + FIG : '') + (LAT ? '-lat' + LAT : '');
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

/* la suite des dt (ms), déterministe */
function suite(nom, n) {
  const o = []; let g = 12345; const rnd = () => (g = (g * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < n; i++) {
    if (nom === 'r60') o.push(1000 / 60); else if (nom === 'r30') o.push(1000 / 30);
    else if (nom === 'alt') o.push(i % 2 ? 1000 / 30 : 1000 / 60);
    else if (nom === 'tel') { const r = rnd(); o.push(r < .04 ? 100 : r < .10 ? 66.7 : r < .22 ? 50 : r < .30 ? 22 : 1000 / 30); } /* le 13 Pro à 30 i/s : des images de 22 à 33 ms, des pointes de 50-100 ms */
    else if (nom === 'bascule') o.push(Math.floor(i / 90) % 2 ? 1000 / 30 : 1000 / 60);
    else o.push(+nom || 16.667);
  }
  return o;
}
/* dans la page : l'horloge virtuelle et le relevé d'une image */
const PAGE = `(function(){
  var vrai=performance.now.bind(performance),virt=vrai();performance.now=function(){return virt;};
  window.requestAnimationFrame=function(){return 0;};
  var S=dbgScene(),car=S.car,cam=S.cam,body=car.getObjectByName('carrosserie')||car,V=THREE.Vector3,Q=THREE.Quaternion;
  var p=new V(),q=new Q(),pb=new V(),qb=new Q(),sc=new V(),pc=new V(),qc=new Q(),qi=new Q(),v=new V();
  function f(x,n){return +x.toFixed(n==null?4:n);}
  window.__vibPas=function(ms,fig,brut){
    virt+=ms;var fr0=S.rdr.info.render.frame;dbgStep(1,ms);
    car.updateMatrixWorld(true);cam.updateMatrixWorld(true);
    car.matrixWorld.decompose(p,q,sc);body.matrixWorld.decompose(pb,qb,sc);cam.matrixWorld.decompose(pc,qc,sc);
    qi.copy(qc).invert();
    var qr=qi.clone().multiply(qb);                       /* la carrosserie dans le repère de la caméra */
    var pe=pb.clone().project(cam),pv=pb.clone().applyMatrix4(cam.matrixWorldInverse);
    /* un point 2 m devant le nez et un 1 m au-dessus du toit : la caisse à l'écran, en pixels */
    var nez=v.set(0,0,2).applyQuaternion(qb).add(pb).clone().project(cam),toit=v.set(0,1,0).applyQuaternion(qb).add(pb).clone().project(cam);
    var st=dbgState(),vo=dbgVol(),w=innerWidth,h=innerHeight;
    if(fig&&st.mode==='fall'){try{dbgVol('double')}catch(e){}}
    return [f(ms,2),st.mode==='fall'?1:st.mode==='drive'?0:2,S.rdr.info.render.frame-fr0,
      f(p.x,3),f(p.y,3),f(p.z,3), f(q.x,5),f(q.y,5),f(q.z,5),f(q.w,5),
      f(pc.x,3),f(pc.y,3),f(pc.z,3), f(qc.x,5),f(qc.y,5),f(qc.z,5),f(qc.w,5), f(cam.fov,2),
      f(qr.x,5),f(qr.y,5),f(qr.z,5),f(qr.w,5),
      f((pe.x*.5+.5)*w,2),f((-pe.y*.5+.5)*h,2), f(pv.x,3),f(pv.y,3),f(pv.z,3),
      f((nez.x*.5+.5)*w,2),f((-nez.y*.5+.5)*h,2),f((toit.x*.5+.5)*w,2),f((-toit.y*.5+.5)*h,2),
      f(qb.x,5),f(qb.y,5),f(qb.z,5),f(qb.w,5),
      vo.tangage,vo.roulis,vo.lacet,vo.pose,vo.radar[0],vo.radar[1],vo.radar[2],vo.radar[3],vo.eta,vo.fallT,vo.vy,vo.haut[0],vo.haut[1],vo.haut[2],vo.u,
      st.vH,st.roulisDeg,st.glisseDeg,(function(){try{return Math.round(dbgEco().s)}catch(e){return -1}})()];
  };
  window.__vibLot=function(L,figN,menu){var o=[],nv=0;for(var i=0;i<L.length;i++){var r;try{var m=dbgState().mode;if(m==='fall')nv++;else nv=0;r=window.__vibPas(L[i],figN>0&&nv>0&&nv%figN===0);}catch(e){r=['ERR',String(e)];}o.push(r);
    var s=dbgState();if(!menu&&(s.gameOver||!s.running)){o.push(['FIN',s.mode]);break;}}return JSON.stringify(o);};
  return 1;})()`;
const COLS = ['ms', 'vol', 'rendu', 'px', 'py', 'pz', 'qx', 'qy', 'qz', 'qw', 'cx', 'cy', 'cz', 'cqx', 'cqy', 'cqz', 'cqw', 'fov', 'rx', 'ry', 'rz', 'rw', 'ex', 'ey', 'vx', 'vy_', 'vz',
  'nx', 'ny', 'tx', 'ty', 'bx', 'by', 'bz', 'bw', 'tang', 'roul', 'lac', 'pose', 'si', 'sh', 'sl', 'sd', 'eta', 'fallT', 'vy', 'ux', 'uy', 'uz', 'u', 'vH', 'rolD', 'gliD', 's'];

setTimeout(() => { console.error('ÉCHEC garde : trop long'); process.exit(3); }, +(A.garde || 420) * 1000).unref(); /* le banc ne tient jamais le verrou plus de 7 min */
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&appareil=iPhone14,2&carte=${CARTE}&pistegraine=${GR}` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    let pret = false;
    for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    if (A.chute === '1') { /* LA CHUTE LIBRE DE L'ACCUEIL puis LE PIQUÉ DE JOUER : la caisse dans le vent, avant la course (--chute 1 ; JOUER part au tiers du relevé) */
      await c.ev(PAGE); const meta = { tag: TAG + '-chute', carte: CARTE, fmt: FMT, dt: DT, cols: COLS, noShake: await c.ev('!!window.dbgNoShake') };
      for (const dtN of DT.split(',')) { const L = suite(dtN, N), rec = [];
        for (let i = 0; i < L.length; i += 60) { if (A.jouer !== '0' && i === Math.floor(N / 3 / 60) * 60 && dtN === DT.split(',').pop()) { try { await c.ev('dbgJouer();1'); } catch (e) {} }
          rec.push(...JSON.parse(await c.ev(`__vibLot(${JSON.stringify(L.slice(i, i + 60))},0,1)`, 240000))); }
        const m = Object.assign({}, meta, { dt: dtN, tag: meta.tag + '-' + dtN }), f = path.join(OUT, m.tag + '.json'); fs.writeFileSync(f, JSON.stringify({ meta: m, rec })); console.log('écrit', f, rec.length, 'images', exc[0] || ''); }
      return; }
    let ok = false;
    for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    await c.ev(PAGE);
    await c.ev(`dbgCadence(60);dbgAuto(1,${LAT},{nit:${NIT === 1 ? 1 : 0},vol:1});try{dbgPin(true)}catch(e){};try{dbgVol('tout')}catch(e){};1`);
    const meta = { tag: TAG, carte: CARTE, fmt: FMT, dt: DT, v: V, nit: NIT, saut: SAUT, imp: IMP, lat: LAT, fig: FIG, q: A.q || '', cols: COLS,
      noShake: await c.ev('!!window.dbgNoShake'), cad: await c.ev('JSON.stringify(dbgCadence())').catch(() => null) };
    /* l'élan, à 33 ms (non relevé) */
    let k = 0, n = 0;
    while (n < 2500) { const r = JSON.parse(await c.ev(`__vibLot(${JSON.stringify(Array(30).fill(33.33))},0)`, 240000)); n += 30; const d = r[r.length - 1]; if (d[0] === 'FIN') throw new Error('mort pendant l\'élan'); k = d[COLS.indexOf('vH')] * 3.6 * .48; if (k >= V) break; }
    console.log('élan', Math.round(k), 'km/h après', n, 'pas');
    await c.ev(`dbgAuto(1,${LAT},{nit:${NIT},vol:1,saut:${SAUT},imp:${IMP}});1`);
    /* plusieurs suites de dt d'affilée dans la même course (--dt r60,r30,alt,tel) : un fichier par suite */
    for (const dtN of DT.split(',')) {
      const L = suite(dtN, N), rec = []; let mort = false;
      for (let i = 0; i < L.length; i += 60) { const r = JSON.parse(await c.ev(`__vibLot(${JSON.stringify(L.slice(i, i + 60))},${FIG})`, 240000)); rec.push(...r); if (r.length && r[r.length - 1][0] === 'FIN') { console.log('FIN', r[r.length - 1]); mort = true; break; } }
      const m = Object.assign({}, meta, { dt: dtN, tag: TAG.replace('-' + DT + '-', '-' + dtN + '-'), exceptions: exc.slice(0, 5) });
      const f = path.join(OUT, m.tag + '.json'); fs.writeFileSync(f, JSON.stringify({ meta: m, rec }));
      const vol = rec.filter(r => r[1] === 1).length; console.log('écrit', f, rec.length, 'images dont', vol, 'en vol', exc.length ? 'EXCEPTIONS ' + exc[0] : '');
      if (mort) break;
    }
  } catch (e) { console.error('ÉCHEC', e.message, exc[0] || ''); process.exitCode = 1; } finally { fin(); }
})();
