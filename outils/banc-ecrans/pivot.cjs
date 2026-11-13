// LE BANC DU PIVOT (2026-11-13, Sacha : « dans l'écran d'accueil, quand on met en mode vertical, horizontal, la voiture apparaît pas au bon
// endroit dans le ciel, là, quand elle tombe ») — accueil debout → couché → debout → couché…, et à CHAQUE image la place de la caisse à
// l'écran (dbgChute().ecran), le cadrage (menuCadre : nx ny fr fh) et la taille de la fenêtre. Pour comparer : la place que prend la caisse
// quand le jeu DÉMARRE directement dans ce format (la référence). Photos à 0,1 / 0,4 / 1 / 3 s après chaque pivot.
//   node outils/banc-ecrans/pivot.cjs --out /chemin [--tel 390x844] [--pivots 4] [--q "…"] [--http 9941 --cdp 9942] [--prof /chemin]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises-pivot'));
const PROF = path.resolve(A.prof || path.join(require('os').tmpdir(), 'banc-pivot-prof'));
const P_HTTP = +(A.http || 9941), P_CDP = +(A.cdp || 9942);
const [TW, TH] = (A.tel || '390x844').split('x').map(Number);
const PIVOTS = +(A.pivots || 4);
/* L'ENCOCHE EN RETARD (--encoche <ms>) : sur l'iPhone, les marges d'encoche (env(safe-area-inset-*)) changent APRÈS le `resize` du pivot. On les imite
   par --ccT/--ccB/--ccL/--ccR (les relais de --sT…) : celles de l'iPhone 17 Pro, posées <ms> après le changement de taille. */
const ENCOCHE = A.encoche != null ? +A.encoche : -1;
const marges = (W, H) => W > H ? { T: 0, B: 21, L: 62, R: 62 } : { T: 62, B: 34, L: 0, R: 0 };
const poseMarges = (c, W, H) => { const m = marges(W, H); return c.ev(`(function(){var s=document.documentElement.style;s.setProperty('--ccT','${m.T}px');s.setProperty('--ccB','${m.B}px');s.setProperty('--ccL','${m.L}px');s.setProperty('--ccR','${m.R}px');return 1;})()`); };
const Q = A.q ? '&' + A.q.replace(/^[?&]/, '') : '';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

const SONDE = `(function(){window.__S=[];function f(t){try{var d=dbgChute();window.__S.push([Math.round(t),innerWidth,innerHeight,d.ecran[0],d.ecran[1],d.cadre[0],d.cadre[1],d.cadre[2],d.cadre[3]]);}catch(e){window.__S.push([Math.round(t),'err',String(e).slice(0,80)]);}
requestAnimationFrame(f);}requestAnimationFrame(f);})();1`;

async function metrique(c, W, H) {
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H,
    screenOrientation: W > H ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
}

async function demarre(c, W, H) {
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await metrique(c, W, H);
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&intro=ancien&attente=0${Q}` });
  let pret = false;
  for (let i = 0; i < 300 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgChute==='function'&&document.getElementById('mHome').classList.contains('on')", 8000); } catch (e) {} }
  if (!pret) throw new Error('le jeu ne démarre pas');
  await dormir(+(A.chauffe || 6000));
  for (let i = 0; i < 20; i++) { if (!(await c.ev("!!document.getElementById('splash')"))) break;
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: W / 2, y: H / 2 }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await dormir(1500); }
  await dormir(3000);
}

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, TW, TH);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300));
  } catch (_) {} });
  const photo = async (n) => { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }, 30000); fs.writeFileSync(path.join(OUT, n + '.jpg'), Buffer.from(sh.data, 'base64')); };
  const lis = async () => JSON.parse(await c.ev('JSON.stringify(window.__S.splice(0))'));
  const fmt = s => s ? `caisse ${s[3]} ${s[4]} | cadre ${s[5]} ${s[6]} ${s[7]} ${s[8]}` : '-';
  try {
    /* la RÉFÉRENCE : démarré couché, puis rechargé debout (même profil) */
    const ref = {};
    for (const [W, H, nom] of [[TH, TW, 'couche'], [TW, TH, 'debout']]) {
      await demarre(c, W, H); if (ENCOCHE >= 0) await poseMarges(c, W, H); await c.ev(SONDE); await dormir(2000);
      const S = await lis(); ref[nom] = S[S.length - 1];
      console.log('référence', nom, W + '×' + H, fmt(ref[nom])); await photo('ref-' + nom);
    }
    /* LES PIVOTS : on part debout (la dernière référence) */
    let W = TW, H = TH, nom = 'debout';
    for (let k = 0; k < PIVOTS; k++) {
      [W, H] = [H, W]; nom = nom === 'debout' ? 'couche' : 'debout';
      await lis(); const t0 = Date.now();
      await metrique(c, W, H);
      if (ENCOCHE >= 0) setTimeout(() => poseMarges(c, W, H).catch(() => {}), ENCOCHE);
      for (const ms of [100, 400, 1000, 3000]) { const d = ms - (Date.now() - t0); if (d > 0) await dormir(d); await photo(`pivot${k + 1}-${nom}-${ms}ms`); }
      const S = await lis(), R = ref[nom], fin = S[S.length - 1];
      const ecart = s => Math.hypot(s[3] - R[3], s[4] - R[4]).toFixed(2);
      const tFin = S.filter(s => s[1] !== 'err');
      const t1 = tFin.length ? tFin[0][0] : 0;
      const marques = []; let der = '';
      for (const s of tFin) { const cle = s.slice(1).join(' '); const e = ecart(s); if (cle !== der) { der = cle; if (marques.length < 14) marques.push(`${s[0] - t1} ms ${s[1]}×${s[2]} écart ${e}`); } }
      let pose = 0; for (const s of tFin) if (+ecart(s) > .05) pose = s[0] - t1;
      console.log(`pivot ${k + 1} → ${nom} ${W}×${H} | fin : ${fmt(fin)} | écart à la référence ${ecart(fin)} | en place (écart ≤ 0,05) après ${pose} ms`);
      console.log('   ', marques.join(' ; '));
    }
    console.log('erreurs', erreurs.length, erreurs.slice(0, 3));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); process.exit(0); }
})().catch(e => { console.error(e); process.exit(1); });
