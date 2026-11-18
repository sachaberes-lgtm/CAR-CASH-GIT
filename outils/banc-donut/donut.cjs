// LE BANC DU DONUT (2026-11-18, Sacha : « On peut plus faire des donuts dans le garage en maintenant la voiture appuyée, c'est pas normal. »)
// Le vrai jeu, édition téléphone (?tel=1, 390×844 ×2, toucher émulé, UA iPhone), dans UN Chrome sans fenêtre et MUET (--mute-audio).
// Sauvegarde : son, musique et voix COUPÉS (sfx/mus/vox false) — le contexte audio reste suspendu, aucun son ne sort.
// Pour chaque variante (une page index-<x>.html + paramètres), pour chaque caisse et chaque doigt (toucher puis souris) :
//   le garage s'ouvre → le doigt se pose au centre de la caisse → il TIENT 1,6 s (le burn-out doit partir : BURN.on)
//   → il tourne autour de la caisse 3 s (le DONUT : BURN.n tours, BURN.don, BURN.yawV) → il se lève.
//   node outils/banc-donut/donut.cjs --jeu <dossier des index-*.html> --var 'a42e9ec50,a42e9ec50|plus=moteurson,4324e2b91' [--caisses 0,1,2] [--http 9971 --cdp 9972]
// ⚠ Prendre le verrou commun avant (~/cash-car/verrou-banc.sh prendre auteur-donut), le rendre après.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const REPLI = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9971), P_CDP = +(A.cdp || 9972), W = 390, H = 844;
const VARS = (A.var || 'index').split(',');
const CAISSES = (A.caisses || '0,1,2').split(',').map(Number);
const DOIGTS = (A.doigts || 'toucher,souris').split(',');
const VERROU = A.verrou || 'auteur-donut';
const SON = A.son === '1'; /* --son 1 : SND.sfx allumé en mémoire (Chrome reste muet) */
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { chanceG: 0, v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], equipped: 0, ex: { runs: 12, floor: +(A.floor || 0) }, ast: 31, /* --floor n : les caisses 0…n acquises (l'étage) */ plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
function serveur(port) {
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f1 = path.join(JEU, p), f2 = path.join(REPLI, p);
    if (!f1.startsWith(JEU) || !f2.startsWith(REPLI)) { rs.writeHead(403); return rs.end(); }
    const sert = (b, f) => { rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); };
    fs.readFile(f1, (e, b) => { if (!e) { if (/index-[^/]*\.html$/.test(p)) { const t = b.toString('utf8'), k = t.lastIndexOf('window.__gameReady=true;'); /* la porte du banc : __ev lit et écrit la fermeture du jeu */
        if (k > 0) b = Buffer.from(t.slice(0, k) + 'window.__ev=function(__c9){return eval(__c9);};' + t.slice(k)); } return sert(b, f1); } fs.readFile(f2, (e2, b2) => { if (e2) { rs.writeHead(404); return rs.end(); } sert(b2, f2); }); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}
const rafraichitVerrou = () => { try { const q = fs.readFileSync('/private/tmp/cashcar-banc.lock/qui', 'utf8').trim().split(' '); if (q.slice(2).join(' ') === VERROU) fs.writeFileSync('/private/tmp/cashcar-banc.lock/qui', q[0] + ' ' + Math.floor(Date.now() / 1000) + ' ' + VERROU + '\n'); } catch (e) {} };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const PROF = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-donut-'));
  const srv = await serveur(P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) erreurs.push(m.params.type + ' : ' + JSON.stringify(m.params.args.map(a => a.value || a.description)).slice(0, 400)); } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} };
  process.on('SIGTERM', () => { fin(); process.exit(3); }); process.on('SIGINT', () => { fin(); process.exit(3); });
  const ev = async (e, t) => { try { return await c.ev(e, t || 30000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 200); } };
  const attend = async (expr, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await ev(expr)) === true) return true; await dormir(400); } return false; };
  const burn = "(function(){var b=dbgBurn();var x=null;try{x=window.__ev?__ev('[sfxOk(),!!BURN.hold,garageRender._bw|0,burnTick._w|0,burnTick._k|0,BURN.son]'):null}catch(e){x=String(e)}return {x:x,on:b.on,k:b.k,t:b.t,tours:b.tours,donut:b.donut,donM:b.donM,w:b.w,cap:b.cap,doigt:b.doigt,son:b.son,fumee:b.fumee}})()";
  /* le doigt : toucher (Input.dispatchTouchEvent → pointerType 'touch') ou souris (dispatchMouseEvent → 'mouse') */
  const doigt = async (genre, type, x, y) => {
    if (genre === 'toucher') return c.send('Input.dispatchTouchEvent', { type: { bas: 'touchStart', bouge: 'touchMove', haut: 'touchEnd' }[type], touchPoints: type === 'haut' ? [] : [{ x, y, id: 1 }] });
    return c.send('Input.dispatchMouseEvent', { type: { bas: 'mousePressed', bouge: 'mouseMoved', haut: 'mouseReleased' }[type], x, y, button: 'left', buttons: type === 'haut' ? 0 : 1, clickCount: 1 });
  };
  const sortie = {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("donutPose")){sessionStorage.setItem("donutPose","1");localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');}localStorage.removeItem("cashcarErr");}catch(e){}' });
    for (const V of VARS) {
      const [nom, q] = V.split('|'); const o = sortie[V] = { essais: [] }; erreurs = []; const t00 = Date.now();
      await ev('try{sessionStorage.removeItem("donutPose")}catch(e){};1');
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index-${nom}.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&chute=0&v=${Date.now()}${q ? '&' + q : ''}` });
      o.pret = await attend("!!window.__gameReady&&typeof dbgState==='function'", 300000);
      o.sauve = await ev('(function(){try{var s=JSON.parse(localStorage.cashcarSave);return [s.sfx,s.mus,s.vox]}catch(e){return String(e)}})()');
      await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()");
      await dormir(5000);
      o.moteurSon = await ev('window.__ev?__ev("typeof MOTEUR_SON===\'undefined\'?\'absent\':MOTEUR_SON"):null');
      if (SON) { /* LE SON ALLUMÉ comme sur le téléphone de Sacha — Chrome est lancé --mute-audio : rien ne sort. La sauvegarde reste sfx/mus/vox false ; seul l'état en mémoire change. */
        o.son = await ev('__ev("SND.sfx=true;try{sndRefresh()}catch(e){};try{AC&&AC.resume()}catch(e){};1")'); await dormir(1500);
        o.sfxOk = await ev('__ev("sfxOk()")'); o.ac = await ev('__ev("AC&&AC.state")'); console.error(V, 'son', o.sfxOk, o.ac); }
      o.tel = await ev('__ev("[TEL_NATIF,ALLEGE,typeof RETAILLE1===\'undefined\'?null:RETAILLE1]")');
      if (A.hab) { o.hab = await ev('(function(){var r=[];' + A.hab.split('+').map(h => { const [c9, i9] = h.split(':'); return 'r.push(dbgHab(' + JSON.stringify(c9) + ',' + JSON.stringify(i9) + '));'; }).join('') + 'return JSON.stringify(r)})()'); console.error(V, 'hab', o.hab, 'tel', o.tel); }
      for (const ci of CAISSES) {
        rafraichitVerrou();
        /* la caisse ci, posée sur le plateau par la porte du banc (garageI) : dbgEquipe ne change pas la caisse montrée au garage */
        if (ci === CAISSES[0]) { await ev("(function(){var b=document.getElementById('garageBtn');if(b)b.click();return 1})()"); await dormir(1500); }
        const ouvert = await attend("__ev('garAtelierLibre()')", 15000);
        await ev("__ev('if(garageI!==" + ci + ")garageShow(" + ci + ");1')");
        await dormir(2500);
        for (const g of DOIGTS) {
          const p = await ev("JSON.stringify(dbgBurn('permis'))").then(s => { try { return JSON.parse(s); } catch (e) { return s; } });
          const E = { caisse: ci, doigt: g, ouvert, permis: p && p.permis, garageI: p && p.caisse };
          if (!p || !p.rect) { E.echec = 'pas de caisse à l’écran'; o.essais.push(E); console.error(V, JSON.stringify(E)); continue; }
          const cx = (p.rect.x0 + p.rect.x1) / 2, cy = (p.rect.y0 + p.rect.y1) / 2; E.centre = [Math.round(cx), Math.round(cy)];
          await doigt(g, 'bas', cx, cy); await dormir(400); E.a400 = await ev(burn);
          await dormir(1200); E.tenu = await ev(burn);
          const R = Math.max(50, Math.min(120, (p.rect.x1 - p.rect.x0) * .6)), N = 60, t0 = Date.now();
          for (let i = 1; i <= N; i++) { const a = i / N * 2 * Math.PI * 1.5; await doigt(g, 'bouge', cx + R * Math.sin(a), cy - R * (1 - Math.cos(a)) * .6); await dormir(45); }
          E.tourneMs = Date.now() - t0; E.tourne = await ev(burn);
          await dormir(600); E.apres = await ev(burn);
          await doigt(g, 'haut', cx, cy); await dormir(1800); E.leve = await ev(burn);
          E.ok = !!(E.tenu && E.tenu.on && E.tourne && E.tourne.on && (E.tourne.tours > 0 || Math.abs(E.tourne.cap) > 1));
          o.essais.push(E); console.error(V, JSON.stringify(E).slice(0, 900));
          await ev('dbgBurn(0);1'); await dormir(1200);
        }
        /* on reste au garage : la caisse suivante est posée par garageShow */
      }
      o.erreurs = erreurs.slice(0, 20); o.nErreurs = erreurs.length; o.s = Math.round((Date.now() - t00) / 1000);
      o.resume = o.essais.map(e => e.caisse + '/' + e.doigt + ':' + (e.ok ? 'DONUT' : 'NON') + (e.tenu ? ' on=' + e.tenu.on : '') + (e.tourne ? ' tours=' + e.tourne.tours + ' cap=' + e.tourne.cap : '')).join(' · ');
      console.error('== ' + V + ' : ' + o.resume);
    }
  } catch (e) { sortie.echec = String(e && e.stack || e); }
  console.log(JSON.stringify(sortie, null, 1));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
