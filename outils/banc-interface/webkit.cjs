// LE BANC WEBKIT (2026-11-12, interface-opti) — le moteur de l'iPhone sur le Mac (WebKit de Playwright, sans fenêtre et muet) : lance le jeu servi
// par banc.cjs (port 9881), et répond à /ev (JS) et /libre?ms= (le TEMPS LIBRE du fil principal : tours d'une boucle de messages en ms — ce que le style,
// la mise en page et la peinture de WebKit laissent). A/B dans la même page : comparer deux réglages l'un après l'autre, machine calme.
//   node outils/banc-interface/webkit.cjs [--pw /chemin/playwright-core] [--exe /chemin/pw_run.sh] [--cmd 9884] [--q "x=1"]
const http = require('http'), path = require('path'), os = require('os');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { webkit } = require(A.pw || path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core'));
const EXE = A.exe || path.join(os.homedir(), 'Library/Caches/ms-playwright/webkit-2388/pw_run.sh');
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
(async () => {
  const b = await webkit.launch({ executablePath: EXE, headless: true });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', serviceWorkers: 'block' });
  await ctx.addInitScript('try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}');
  const pg = await ctx.newPage(); const err = []; pg.on('pageerror', e => err.push(String(e).slice(0, 200)));
  async function accueil(q) {
    await pg.goto('http://127.0.0.1:' + (A.http || 9881) + '/index.html?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0' + (q ? '&' + q : ''));
    for (let i = 0; i < 300; i++) { await pg.waitForTimeout(500); if (await pg.evaluate("!!window.__gameReady&&typeof dbgJouer==='function'").catch(() => false)) break; }
    await pg.waitForTimeout(2500);
    for (let i = 0; i < 6; i++) { /* le titre ne prend le toucher qu'une fois l'intro posée : on retouche tant qu'il est là */
      const la = await pg.evaluate("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      if (!la) break; await pg.waitForTimeout(3000); }
    await pg.waitForTimeout(2000); return 'accueil';
  }
  const LIBRE = `(ms)=>new Promise(r=>{const ch=new MessageChannel();let n=0,f=0;const t0=performance.now();(function raf(){f++;if(performance.now()-t0<ms)requestAnimationFrame(raf)})();
    ch.port1.onmessage=()=>{n++;if(performance.now()-t0<ms)ch.port2.postMessage(0);else r({tours:n,images:f,ms:Math.round(performance.now()-t0)})};ch.port2.postMessage(0);})`;
  const lu = rq => new Promise(r => { let s = ''; rq.on('data', d => s += d); rq.on('end', () => r(s)); });
  http.createServer(async (rq, rs) => { const u = new URL(rq.url, 'http://x'); let out = '';
    try {
      if (u.pathname === '/ev') out = JSON.stringify(await pg.evaluate(await lu(rq)));
      else if (u.pathname === '/libre') out = JSON.stringify(await pg.evaluate(LIBRE + '(' + (+(u.searchParams.get('ms') || 2000)) + ')'));
      else if (u.pathname === '/accueil') out = await accueil(u.searchParams.get('q') || A.q || '');
      else if (u.pathname === '/shot') { await pg.screenshot({ path: u.searchParams.get('nom') }); out = 'ok'; }
      else if (u.pathname === '/erreurs') out = JSON.stringify(err);
      else if (u.pathname === '/fin') { rs.end('fin'); await b.close(); process.exit(0); }
    } catch (e) { out = 'ERREUR ' + e.message; }
    rs.end(out); }).listen(+(A.cmd || 9884), '127.0.0.1');
  console.log('webkit prêt sur', A.cmd || 9884);
})().catch(e => { console.error(e); process.exit(1); });
