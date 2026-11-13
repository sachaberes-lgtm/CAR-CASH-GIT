// LE BANC DE LA MÉMOIRE (2026-11-13, ios-aide) — l'empreinte réelle de la page dans WebKit (le moteur de l'iPhone, sans fenêtre, muet) et ce qui la remplit.
// Sert le jeu de CE dossier (VERSION PRINCIPALE), pose inventaire.js avant le jeu, et répond :
//   node outils/banc-memoire/memoire.cjs [--http 9891] [--cmd 9894] [--q "x=1"]
//   curl -s localhost:9894/accueil?q=…          → (re)charge jusqu'à l'accueil
//   curl -s localhost:9894/mem                   → empreinte des processus WebKit (footprint : phys_footprint) + __memInv()
//   curl -s --data-binary 'expr' localhost:9894/ev → évalue du JS dans la page
//   curl -s localhost:9894/fin                   → ferme tout
// L'empreinte se lit sur le processus WebContent (celui que iOS tue) ; le processus GPU (WebGL) est à part.
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const { serveur } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { webkit } = require(A.pw || path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core'));
const EXE = A.exe || path.join(os.homedir(), 'Library/Caches/ms-playwright/webkit-2388/pw_run.sh');
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9891), P_CMD = +(A.cmd || 9894);
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const INV = fs.readFileSync(path.join(__dirname, 'inventaire.js'), 'utf8'), PERM = fs.readFileSync(path.join(__dirname, 'permanent.js'), 'utf8'); /* --perm 1 : le travail permanent (permanent.js) */
/* (--images 1) les images longues (> 50 ms entre deux rappels d'image) et les constructions de piste (cc:construction), datées : window.__img.l, window.__ccc */
const IMG = "\n;window.__img={l:[],t:0};(function f(t){var I=window.__img;if(I.t&&t-I.t>50)I.l.push([Math.round(t),Math.round(t-I.t)]);I.t=t;if(I.l.length>3000)I.l.shift();requestAnimationFrame(f);})(0);" +
  "document.addEventListener('cc:construction',function(e){(window.__ccc=window.__ccc||[]).push([Math.round(performance.now()),e.detail.etape,e.detail.ms]);});\n";
const dormir = ms => new Promise(r => setTimeout(r, ms));

function descendants(pid) { /* les processus nés de ce banc (WebKit et ses fils) */
  const L = cp.execSync('ps -axo pid=,ppid=,comm=').toString().trim().split('\n').map(l => { const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(l); return m && { pid: +m[1], ppid: +m[2], comm: m[3] }; }).filter(Boolean);
  const out = [], file = [pid]; while (file.length) { const p = file.shift(); for (const x of L) if (x.ppid === p) { out.push(x); file.push(x.pid); } } return out;
}
function empreinte(pid) { /* phys_footprint (ce que jetsam compte sur iOS) et son pic, + les grandes catégories */
  try { const t = cp.execSync('footprint ' + pid + ' 2>/dev/null', { timeout: 20000 }).toString();
    const cat = {}; for (const l of t.split('\n')) { const c = /^\s*([\d.]+)\s*(KB|MB|GB|B)\s+[\d.]+\s*(?:KB|MB|GB|B)\s+[\d.]+\s*(?:KB|MB|GB|B)\s+\d+\s+(JS VM Gigacage|WebKit malloc|JS JIT generated code|CG raster data|untagged \(VM_ALLOCATE\)(?: \(graphics\))?|IOSurface|IOAccelerator.*)$/.exec(l);
      if (c) cat[c[3]] = +(parseFloat(c[1]) * ({ GB: 1024, MB: 1, KB: 1 / 1024, B: 1 / 1048576 })[c[2]]).toFixed(0); }
    const m = /Footprint:\s*([\d.]+)\s*(KB|MB|GB)/i.exec(t) || /phys_footprint:\s*([\d.]+)\s*(KB|MB|GB)/i.exec(t), k = /peak[^:]*:\s*([\d.]+)\s*(KB|MB|GB)/i.exec(t);
    const mo = (v, u) => +(parseFloat(v) * (u.toUpperCase() === 'GB' ? 1024 : u.toUpperCase() === 'KB' ? 1 / 1024 : 1)).toFixed(1);
    return { Mo: m ? mo(m[1], m[2]) : null, pic: k ? mo(k[1], k[2]) : null, cat: cat, brut: m ? null : t.slice(0, 400) };
  } catch (e) { return { err: String(e.message).slice(0, 200) }; }
}
/* Les services XPC de WebKit naissent de launchd (ppid 1) : on les reconnaît à leur chemin (le WebKit de Playwright) et on ne garde que ceux
   apparus après le lancement de CE banc (AVANT = ceux qui tournaient déjà, d'une autre session). */
function webkitProcs() { return cp.execSync('ps -axo pid=,comm=').toString().trim().split('\n').map(l => { const m = /^\s*(\d+)\s+(.*)$/.exec(l); return m && { pid: +m[1], comm: m[2] }; })
  .filter(x => x && /ms-playwright\/webkit-\d+\/com\.apple\.WebKit\.(WebContent|GPU)/.test(x.comm)); }
let AVANT = new Set();
function empreintes() {
  const D = webkitProcs().filter(x => !AVANT.has(x.pid));
  return D.map(x => Object.assign({ pid: x.pid, nom: /WebContent/.test(x.comm) ? 'WebContent' : 'GPU' }, empreinte(x.pid)));
}

(async () => {
  const srv = await serveur(JEU, P_HTTP);
  AVANT = new Set(webkitProcs().map(x => x.pid));
  const b = await webkit.launch({ executablePath: EXE, headless: true });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', serviceWorkers: 'block' });
  await ctx.addInitScript('try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}\n' + (A.pile ? 'window.__memPile=1;\n' : '') + INV + (A.images ? IMG : '') + (A.perm ? '\n' + PERM : ''));
  const pg = await ctx.newPage(); const err = []; pg.on('pageerror', e => err.push(String(e).slice(0, 200)));
  async function accueil(q) {
    await pg.goto('http://127.0.0.1:' + P_HTTP + '/index.html?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0' + (q ? '&' + q : ''));
    for (let i = 0; i < 300; i++) { await dormir(500); if (await pg.evaluate("!!window.__gameReady&&typeof dbgJouer==='function'").catch(() => false)) break; }
    await dormir(2500);
    for (let i = 0; i < 6; i++) {
      const la = await pg.evaluate("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1;})()").catch(() => 0);
      if (!la) break; await dormir(3000);
    }
    await dormir(2000); return 'accueil';
  }
  const lu = rq => new Promise(r => { let s = ''; rq.on('data', d => s += d); rq.on('end', () => r(s)); });
  http.createServer(async (rq, rs) => { const u = new URL(rq.url, 'http://x'); let out = '';
    try {
      if (u.pathname === '/ev') out = JSON.stringify(await pg.evaluate(await lu(rq)));
      else if (u.pathname === '/mem') { if (u.searchParams.get('gc')) { /* (Mac) l'alerte mémoire de WebKit : ramasse-miettes complet + caches vidés, comme iOS près de sa limite */
          cp.execSync('notifyutil -p org.WebKit.lowMemory'); await dormir(6000); }
        const inv = await pg.evaluate('window.__memInv&&window.__memInv(' + (u.searchParams.get('o') || '') + ')').catch(e => ({ err: e.message })); out = JSON.stringify({ proc: empreintes(), inv }); }
      else if (u.pathname === '/accueil') out = await accueil(u.searchParams.get('q') || A.q || '');
      else if (u.pathname === '/shot') { await pg.screenshot({ path: u.searchParams.get('nom') }); out = 'ok'; }
      else if (u.pathname === '/erreurs') out = JSON.stringify(err);
      else if (u.pathname === '/fin') { rs.end('fin'); await b.close(); srv.close(); process.exit(0); }
    } catch (e) { out = 'ERREUR ' + e.message; }
    rs.end(out); }).listen(P_CMD, '127.0.0.1');
  console.log('banc mémoire prêt : jeu', P_HTTP, '· commandes', P_CMD);
})().catch(e => { console.error(e); process.exit(1); });
