// LE BANC DU MOTEUR VIF (2026-11-16, lot qualite/moteurvif) — le bug relevé sur l'iPhone : « moteurvif | rendu : null is not an object (evaluating 'r.BYTES_PER_ELEMENT') »
// après une mort. Chemin du téléphone (?tel=1, Chrome sans fenêtre, MUET, 390×844 ×2) : menu (chauffe + premières fois des moteurs), puis N courses :
// départ, montée de palier (carte NOUVEAU MOTEUR, dbgMoteur), mort (dbgDauphin('boom')), 4 s d'écran de mort, REJOUER (resetGame). À chaque mort :
// l'état du moteur vif (ko, erreur, images dessinées dans la toile vive) et la MÉMOIRE (attributs des moteurs gardés : copie JS jetée ou non).
// Compteurs déterministes : valables même sur un Mac chargé.
//   node outils/banc-moteurvif/morts.cjs [--morts 10] [--prem 1] [--attente 8] [--casse N] [--q "sans=moteurvif2"] [--ordi 1] [--http 9981 --cdp 9982] [--menu 25]
// Sert VERSION PRINCIPALE du worktree ; un fichier absent (worktree clairsemé, sans assets) est pris dans --repli (par défaut ~/cash-car/qualite/VERSION PRINCIPALE).
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const REPLI = path.resolve(A.repli || path.join(os.homedir(), 'cash-car', 'qualite', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9981), P_CDP = +(A.cdp || 9982), W = +(A.w || 390), H = +(A.h || 844), ORDI = A.ordi === '1';
const MORTS = +(A.morts || 10), MENU_S = +(A.menu || 25);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { chanceG: 0, v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
function serveur(port) {
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f1 = path.join(JEU, p), f2 = path.join(REPLI, p);
    if (!f1.startsWith(JEU) || !f2.startsWith(REPLI)) { rs.writeHead(403); return rs.end(); }
    const sert = (b, f) => { rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); };
    fs.readFile(f1, (e, b) => { if (!e) return sert(b, f1); fs.readFile(f2, (e2, b2) => { if (e2) { rs.writeHead(404); return rs.end(); } sert(b2, f2); }); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}
const ETAT = `(function(){var r={};try{var m=dbgMoteurVif();r.vif={ok:m.ok,ko:m.ko,ctx:m.contexte,images:m.images,err:m.err,chauffe:m.chauffe,progs:m.programmes,filet:m.filet,envois:m.envois,libre:m.libre};r.mem=m.mem;}catch(e){r.vif=String(e);}
  try{var s=dbgState();r.st=[s.started,s.gameOver,s.mode].join('/');}catch(e){}
  return r;})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const PROF = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-moteurvif-'));
  const srv = await serveur(P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [], notes = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console : ' + JSON.stringify(m.params.args.map(a => a.value || a.description)).slice(0, 300)); } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} };
  const ev = async (e, t) => { try { return await c.ev(e, t || 15000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 160); } };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await ev(expr)) === true) return true; await dormir(pas || 500); } return false; };
  const sortie = { q: A.q || '', ordi: ORDI, morts: [] };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!ORDI) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?${ORDI ? 'garde=1&attente=0&chute=0&intro=ancien' : 'colonne=0&tel=1&garde=1&intro=ancien&attente=0&chute=0'}&v=${Date.now()}` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    sortie.pret = await attend("!!window.__gameReady&&typeof dbgState==='function'", 300000, 1000);
    await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()");
    sortie.allege = await ev('ALLEGE'); sortie.tel = await ev('TCTL.on');
    /* le menu : chauffe des moteurs (ENG_PRET), premières fois (premMoteurs, rendu principal), chauffe du second contexte */
    const t0 = Date.now(); while (Date.now() - t0 < MENU_S * 1000) { await dormir(2000); const ch9 = await ev('(function(){var c=dbgChauffe();return c.rendu&&dbgMoteurVif().chauffe<0;})()'); if (ch9 === true) break; }
    if (A.prem === '1') sortie.prem = await ev("JSON.stringify(dbgPremiere('tout'))", 60000); /* --prem 1 : les premières fois des moteurs (premMoteurUn, renderer PRINCIPAL) jouées d'un coup — le Chrome sans fenêtre ne les finit pas seul */
    if (A.attente) { await dormir(+A.attente * 1000); sortie.menuApres = await ev(ETAT); } /* --attente S : la file croisée au menu, S secondes après les premières fois */
    sortie.menu = { s: Math.round((Date.now() - t0) / 1000), chauffe: await ev('JSON.stringify(dbgChauffe())'), etat: await ev(ETAT) };
    for (let k = 0; k < MORTS; k++) {
      const m = { k: k + 1 };
      await ev('dbgJouer()');
      m.course = await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 400);
      try { await ev('dbgImmortel(true)'); } catch (e) {}
      await dormir(1500);
      m.montees = []; for (let j = 0; j < 1 + (k % 3); j++) { m.montees.push(await ev('dbgMoteur()')); await dormir(1600); } /* la carte NOUVEAU MOTEUR : rendue par le renderer PRINCIPAL (engVigRendRT) */
      try { await ev('dbgImmortel(false)'); } catch (e) {}
      await ev("dbgDauphin('boom');1");
      m.mort = await attend('dbgState().gameOver', 20000, 300);
      if (A.casse && k + 1 === +A.casse) { await dormir(1000); m.casse = await ev("JSON.stringify(dbgMoteurVif('casse'))"); } /* --casse N : le dessin vif lève une exception à la N-ième mort (second contexte en panne) */
      await dormir(4500); /* l'écran de mort : le moteur vif dessine (pompe) */
      m.etat = await ev(ETAT);
      sortie.morts.push(m); console.error('mort', k + 1, JSON.stringify(m));
      await ev("(function(){var b=document.getElementById('resetBtn');if(b)b.click();return 1;})()"); await dormir(1500);
      if (!(await attend("(function(){const s=dbgState();return !s.gameOver;})()", 15000, 400))) { await ev('dbgJouer()'); await dormir(1500); }
    }
    sortie.fin = await ev(ETAT);
    sortie.notesMoteurvif = await ev("(function(){try{return JSON.parse(localStorage.getItem('cashcarErr')||'[]').filter(function(x){return /moteurvif|rendu|BYTES/.test((x.g||'')+' '+(x.m||''));}).map(function(x){return x.g+' | '+x.m;}).slice(-10);}catch(e){return String(e);}})()");
  } catch (e) { sortie.echec = String(e && e.message || e); }
  sortie.erreurs = erreurs.slice(0, 20); sortie.nErreurs = erreurs.length;
  console.log(JSON.stringify(sortie, null, 1));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
