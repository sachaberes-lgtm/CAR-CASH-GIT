// LE BANC DU FILM DANS UN WORKER (2026-11-15, qualité · lot SONDEOC) — d'après lancement.cjs.
// Le vrai jeu dans un Chrome sans fenêtre et MUET (390×844 ×2, iPhone, ?tel=1&introapres=1&plus=filmworker&sondeoc=1).
//   --mode photos (défaut) : attend que le Worker tienne le film, bloque le fil principal 3 × 800 ms (les images du Worker continuent-elles ?),
//                            puis compare, à des instants figés, la photo du Worker et celle du fil principal (pixel à pixel), puis provoque une panne (le repli).
//   --mode menu            : attend la boule prête, appuie, attend le menu : la ligne « intro | filmworker », puis la sonde du coin (?sondeoc=1) et ses lignes « sondeoc ».
// Usage : node outils/banc-demarrage/filmworker.cjs [--mode photos|menu] [--cpu 4] [--q "x=1"] [--dossier /chemin] [--http 9931 --cdp 9932]
// ⚠ UN seul Chrome de banc sur la machine : ~/cash-car/verrou-banc.sh prendre "<qui>" avant, rendre après.
const fs = require('fs'), path = require('path'), os = require('os'), zlib = require('zlib');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9931), P_CDP = +(A.cdp || 9932), MODE = A.mode || 'photos', CPU = +(A.cpu || 1);
const PROF = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-filmworker-'));
const DOSSIER = A.dossier || fs.mkdtempSync(path.join(os.tmpdir(), 'banc-filmworker-photos-'));
const W = 390, H = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
function png(buf) { /* un décodeur PNG minimal (8 bits, RVB ou RVBA, non entrelacé) → { w, h, c, px } */
  let p = 8, w = 0, h = 0, ct = 0; const D = [];
  while (p < buf.length) { const n = buf.readUInt32BE(p), t = buf.toString('latin1', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + n); p += 12 + n;
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } else if (t === 'IDAT') D.push(d); else if (t === 'IEND') break; }
  const c = ct === 6 ? 4 : 3, r = zlib.inflateSync(Buffer.concat(D)), L = w * c, px = Buffer.alloc(h * L);
  for (let y = 0; y < h; y++) { const f = r[y * (L + 1)], o = y * (L + 1) + 1, q = y * L;
    for (let x = 0; x < L; x++) { const a = x >= c ? px[q + x - c] : 0, b = y ? px[q - L + x] : 0, cc = x >= c && y ? px[q - L + x - c] : 0; let v = r[o + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pa = Math.abs(b - cc), pb = Math.abs(a - cc), pc = Math.abs(a + b - 2 * cc); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : cc; }
      px[q + x] = v & 255; } }
  return { w, h, c, px };
}
function compare(a, b) { const A1 = png(a), B1 = png(b); if (A1.w !== B1.w || A1.h !== B1.h || A1.c !== B1.c) return { tailles: [A1.w, A1.h, B1.w, B1.h] };
  let dif = 0, mx = 0, clair = 0; for (let i = 0; i < A1.px.length; i += A1.c) { let d = 0, s = 0; for (let k = 0; k < 3; k++) { d = Math.max(d, Math.abs(A1.px[i + k] - B1.px[i + k])); s += A1.px[i + k]; } if (d) dif++; if (d > mx) mx = d; if (s > 24) clair++; }
  return { pixels: A1.w * A1.h, differents: dif, ecartMax: mx, pixelsNonNoirs: clair }; }

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [], S = { mode: MODE, cpu: CPU, dossier: DOSSIER };
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const photo = async nom => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const b = Buffer.from(sh.data, 'base64'); fs.writeFileSync(path.join(DOSSIER, nom + '.png'), b); return b; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}' });
    if (CPU > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1&plus=filmworker&sondeoc=1` + (A.q ? '&' + A.q : '') });
    /* 1. le Worker prend-il le film ? */
    let et = null; const T0 = Date.now();
    for (;;) { await dormir(500); try { et = await c.ev('window.dbgFilmW?Object.assign(dbgFilmW.etat(),{t:Math.round(performance.now()),lance:!!(window.__ccIntroAuto&&__ccIntroAuto.lance())}):null', 8000); } catch (e) {}
      if (et && (et.tient || et.etat === 'repli')) break; if (Date.now() - T0 > 150000) break; }
    S.prise = et;
    if (!et || !et.tient) throw new Error('le Worker ne tient pas le film : ' + JSON.stringify(et));
    if (MODE === 'photos') {
      /* 2. le fil principal bloqué 3 × 800 ms : les images du Worker pendant ce temps */
      await dormir(1500);
      const b0 = await c.ev('dbgFilmW.bilan()');
      const bl = await c.ev(`(async function(){const d=ms=>new Promise(r=>setTimeout(r,ms)),L=[];for(let i=0;i<3;i++){const a=performance.now();while(performance.now()-a<800){}L.push(Math.round(performance.now()-a));await d(700);}return L;})()`, 30000);
      const b1 = await c.ev('dbgFilmW.bilan()');
      S.blocage = { bloques: bl, avant: b0 && { n: b0.n, des: b0.des, mx: Math.round(b0.mx), k: b0.k }, apres: b1 && { n: b1.n, des: b1.des, mx: Math.round(b1.mx), k: b1.k, l: b1.l, rdMx: +b1.rdMx.toFixed(1), raf: b1.raf, pas: b1.pas }, etat: await c.ev('dbgFilmW.etat().etat'), filmPrincipal: await c.ev('JSON.stringify(dbgIntro.etat())') };
      /* 3. les photos : le même instant figé, Worker puis fil principal */
      S.photos = [];
      for (const q of [[1.5, null, null], [2.6, null, null], [4, null, null], [6, 3, null], [3.3, 1, 3], [4.6, 1, 3], [6.2, 1, 3]]) {
        const nom = 't' + String(q[0]).replace('.', '_') + (q[1] !== null ? '-pret' + q[1] : '') + (q[2] !== null ? '-appui' + q[2] : '');
        await c.ev(`dbgIntro.boule({pret:${q[1]},tap:${q[2]}})`);
        const ok = await c.ev(`dbgFilmW.fige(${q[0]})`, 10000); await dormir(400);
        const tient = await c.ev('dbgFilmW.etat().tient'); const a = await photo(nom + '-worker');
        await c.ev(`dbgFilmW.cache(true);dbgIntro.voir(${q[0]});1`); await dormir(300);
        const b = await photo(nom + '-principal'); await c.ev('dbgFilmW.cache(false);1');
        S.photos.push(Object.assign({ instant: nom, fige: ok, tient }, compare(a, b)));
      }
      /* 4. la panne provoquée : le repli */
      await c.ev('dbgIntro.boule({pret:null,tap:null})'); await c.ev('dbgFilmW.fige(4)', 10000); await c.ev('dbgFilmW.panne();1'); await dormir(600);
      S.repli = await c.ev('dbgFilmW.etat()'); await c.ev('dbgIntro.voir(4);1'); await dormir(300);
      const r = await photo('repli'); S.repli.photo = compare(r, fs.readFileSync(path.join(DOSSIER, 't4-principal.png')));
      S.repli.toileRetiree = await c.ev('!document.getElementById("fxCvW")');
    } else {
      /* 2. la boule prête, l'appui, le menu */
      for (let i = 0; i < 120; i++) { await dormir(500); if (await c.ev('!!(window.__ccIntroAuto&&__ccIntroAuto.pret())')) break; }
      await dormir(2500); S.avantAppui = await c.ev('dbgFilmW.bilan()'); await photo('boule-prete');
      await c.ev('__ccIntroAuto.tapBoule();1'); await dormir(1500); await photo('presents');
      for (let i = 0; i < 80; i++) { await dormir(500); if (await c.ev('!document.getElementById("splash")&&!!window.dbgSondeOC')) break; }
      S.apresMenu = await c.ev('dbgFilmW.etat()');
      for (let i = 0; i < 60; i++) { await dormir(1000); const e9 = await c.ev('dbgSondeOC().etat', 20000).catch(() => '?'); if (/fini|échec|pas de/.test(e9)) break; if (i === 8) await photo('sonde-coin'); }
      S.sonde = await c.ev('dbgSondeOC()'); await photo('sonde-fin');
    }
    S.notes = await c.ev('dbgErreurs().filter(function(x){return /filmworker|sondeoc|intro|erreur|promesse|panne|boucle/.test(x.g);}).map(function(x){return x.g+" | "+x.m;})');
    S.introErr = await c.ev('window.__introErr||""');
  } catch (e) { S.echec = String(e && e.message || e); }
  S.exceptions = erreurs;
  console.log(JSON.stringify(S, null, 1));
  c.close(); tueChrome(ch); srv.close(); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})();
