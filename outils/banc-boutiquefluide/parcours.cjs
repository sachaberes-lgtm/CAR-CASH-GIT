// LE BANC DU PARCOURS DE LA BOUTIQUE (2026-11-21, lot « boutiquefluide », Sacha : « refait un truc d'optimisation de la boutique qui galère toujour un peu »).
// UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde), iPhone 13 Pro émulé 844×390 DPR 3, tactile, UA iPhone, ?tel=1&appareil=iPhone14,2.
// Processeur bridé ×4 (CDP) pendant tout le parcours. PLUSIEURS essais dans le MÊME Chrome (la page rechargée entre deux), entrelacés :
//   node outils/banc-boutiquefluide/parcours.cjs --essais avec,sans,sans,avec [--out <dossier>] [--prof <dossier parent>] [--http 9991] [--cdp 9992] [--course 1] [--photo 1]
// Le parcours : menu au repos → BOUTIQUE (#gShopBas) → chaque onglet → défilement de la bande (aller, retour) → trois articles → un ACHAT (pièces, la vitre qui éclate)
// → ÉQUIPER → retour au menu → 2e ouverture → retour. Pour chaque étape : écarts d'images (pire, > 50 ms, > 100 ms), temps de style / mise en page / script
// (Performance.getMetrics), profileur (échantillons 250 µs) : les fonctions de la pire image et de toute l'étape, le temps rangé par cause.
// --course 1 : après le dernier essai, une course (dbgJouer) et une mort (dbgDauphin('boom')). Exceptions et __loopErr relevés à chaque essai.
// Une ligne JSON par essai sur la sortie (et <out>/<n>-<essai>.json). Chrome tué (son groupe), profil effacé, quoi qu'il arrive.
const fs = require('fs'), path = require('path'), os = require('os');
const http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
/* le serveur du banc : comme celui du banc des traînées, mais index.html GRAVÉ comme une version publiée (--grave 1, par défaut) : CC_BUILD et CC_PHOTOS
   ont une valeur, donc les photos sont GARDÉES d'un chargement à l'autre (PHDB, IndexedDB), comme dans l'app du téléphone. --grave 0 : la copie locale (rien gardé). */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
function serveur(dir, port, grave) { const s = http.createServer((rq, rs) => { let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(dir, p);
    if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); }
      if (grave && /index\.html$/.test(f)) b = Buffer.from(b.toString('utf8').replace("const CC_BUILD='__CC_BUILD__';", "const CC_BUILD='banc-bf';").replace("const CC_PHOTOS='__CC_PHOTOS__';", "const CC_PHOTOS='banc-bf';"), 'utf8');
      rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s))); }
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const ESSAIS = (A.essais || 'avec').split(','), [W, H] = [844, 390], P_HTTP = +(A.http || 9991), P_CDP = +(A.cdp || 9992), PUCE = +(A.puce || 4);
const OUT = A.out ? path.resolve(A.out) : null; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SONDE = `(function(){if(window.__bf)return 1;const O=window.__bf={t0:0,img:[],der:0};(function f(t){if(O.t0){if(O.der)O.img.push([+(O.der-O.t0).toFixed(0),+(t-O.der).toFixed(1)]);O.der=t;}requestAnimationFrame(f);})(0);return 1;})()`;
const GL = /^(compileShader|linkProgram|getProgramParameter|getShaderParameter|getProgramInfoLog|getShaderInfoLog|texImage2D|texSubImage2D|texStorage2D|generateMipmap|bufferData|bufferSubData|drawElements|drawArrays|drawElementsInstanced|drawArraysInstanced|readPixels|getUniformLocation|getAttribLocation|getActiveUniform|getActiveAttrib|uniform[1-4a-zA-Z]*|useProgram|bindTexture|bindBuffer|bindFramebuffer|clear|getError|getExtension|createTexture|blitFramebuffer|renderbufferStorageMultisample|framebufferTexture2D|checkFramebufferStatus|getContext|transferToImageBitmap|toDataURL|toBlob|drawImage|getImageData|putImageData|convertToBlob)$/;
const MISE = /^(getBoundingClientRect|getComputedStyle|offsetWidth|offsetHeight|offsetLeft|offsetTop|clientWidth|clientHeight|scrollWidth|scrollHeight|scrollLeft|scrollTop|getClientRects|scrollIntoView|focus|elementFromPoint|innerText)$/;
const DOM = /^(set innerHTML|innerHTML|insertAdjacentHTML|appendChild|insertBefore|removeChild|replaceChildren|cloneNode|createElement|setAttribute|querySelectorAll|querySelector|closest|setProperty|add|remove|toggle|set textContent|textContent|set className|animate)$/;
/* les fonctions du jeu suivies (temps inclusif) */
const SUIVIES = ['buildCar', 'carPhoto', 'vitrinePhoto', 'vitrinePose', 'vitRend', 'photoTour', 'photoRafale', 'shopPhotoTour', 'bqPhotos', 'garBqPanneau', 'garBqUI', 'garBqBatit', 'bqEssaie', 'bqAction', 'garageShow', 'bcMaj', 'bcRail', 'bqVoitRail', 'bqPeintRail', 'bqHabRail', 'bqFigRail', 'bqTraineeRail', 'bqCarteHtml', 'aileFile', 'figFilm', 'bqNomsAjuste', 'bqaTeinte', 'bqaFocus', 'bqaFocusTick', 'bqaVerrou', 'bqAimant', 'shopShow', 'gShopJour', 'vitreBrise', 'garBqLumiere', 'garBqIndus', 'gModeVa', 'garMode', 'render', 'loop', 'compile', 'getProgramInfoLog', 'texImage2D', 'garAplomb', 'photoPrechauffe', 'bqPhotosBande'];
function arbre(profile) { const nodes = new Map(); for (const n of profile.nodes) nodes.set(n.id, n); const par = new Map(); for (const n of profile.nodes) for (const x of (n.children || [])) par.set(x, n.id); return { nodes, par }; }
function decale(profile, T) { let t = profile.startTime; for (let i = 0; i < profile.samples.length; i++) { t += profile.timeDeltas[i] || 0; if (T.nodes.get(profile.samples[i]).callFrame.functionName === '__marqueBanc') return (t - profile.startTime) / 1000; } return 0; }
function agrege(profile, T, de, a) { /* entre de et a ms après le début du profil : temps occupé, cumul (inclusif), propre, causes */
  let t = profile.startTime, occ = 0; const tot = new Map(), self = new Map(), cause = {}, suiv = {};
  profile.samples.forEach((s, i) => { const d = profile.timeDeltas[i] || 0; t += d; const ms = (t - profile.startTime) / 1000; if (ms < de || ms > a) return;
    const n = T.nodes.get(s), f = n.callFrame.functionName; if (f === '(idle)') return; occ += d;
    const k0 = (f || '(anon)') + ':' + n.callFrame.lineNumber; self.set(k0, (self.get(k0) || 0) + d);
    let c = f === '(program)' ? 'rendu hors JS (style, mise en page, peinture, composition)' : f === '(garbage collector)' ? 'ramasse-miettes' : GL.test(f) ? 'WebGL / canvas (appel bloquant)' : MISE.test(f) ? 'mise en page forcée (lecture)' : DOM.test(f) ? 'DOM (écriture, requêtes)' : 'JS du jeu';
    cause[c] = (cause[c] || 0) + d;
    const vus = new Set(), vf = new Set(); let x = s; while (x != null) { const nn = T.nodes.get(x), fn = nn.callFrame.functionName, k = (fn || '(anon)') + ':' + nn.callFrame.lineNumber; if (!vus.has(k)) { vus.add(k); tot.set(k, (tot.get(k) || 0) + d); } if (SUIVIES.indexOf(fn) >= 0 && !vf.has(fn)) { vf.add(fn); suiv[fn] = (suiv[fn] || 0) + d; } x = T.par.get(x); } });
  const top = (m, n) => [...m.entries()].sort((p, q) => q[1] - p[1]).slice(0, n).map(([k, v]) => Math.round(v / 1000) + ' ' + k);
  const ms = o => Object.fromEntries(Object.entries(o).sort((p, q) => q[1] - p[1]).map(([k, v]) => [k, Math.round(v / 1000)]));
  return { occupeMs: Math.round(occ / 1000), causes: ms(cause), suivies: ms(suiv), cumul: top(tot, 30), propre: top(self, 15) };
}
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(A.prof || os.tmpdir(), 'banc-bf-prof-'));
  const srv = await serveur(JEU, P_HTTP, A.grave !== '0'), { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(130); }); process.on('SIGTERM', () => { fin(); process.exit(143); });
  let exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400)); } catch (x) {} });
  const J = async (x, t) => { const v = await c.ev(x, t); return typeof v === 'string' ? JSON.parse(v) : v; };
  const met = async () => { const r = await c.send('Performance.getMetrics'); const o = {}; for (const m of r.metrics) o[m.name] = m.value; return o; };
  const clic = sel => c.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return 0;e.click();return 1})()`);
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Performance.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
  const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 }, q: 'fast', qChoisi: 1, shopVu: 1 };
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.removeItem("cashcarSave");sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
  await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 250 });
  /* UNE ÉTAPE : la sonde remise à zéro, le profileur, le geste, l'attente, puis tout ce qu'on a vu */
  const etape = async (R, nom, geste, ms) => {
    await c.send('Profiler.start'); const m0 = await met();
    await c.ev('window.__bf.img.length=0;window.__bf.der=0;window.__bf.t0=performance.now();(function __marqueBanc(){var a=performance.now();while(performance.now()-a<3);})();1');
    let g = null; try { g = await geste(); } catch (e) { g = 'geste en erreur : ' + e.message; }
    await dormir(ms);
    const { profile } = await c.send('Profiler.stop'); const m1 = await met();
    const o = await J('JSON.stringify(window.__bf)'); await c.ev('window.__bf.t0=0;1');
    const tri = o.img.slice().sort((x, y) => y[1] - x[1]), T = arbre(profile), off = decale(profile, T);
    const E = { geste: g, images: o.img.length, pire: tri[0] ? tri[0][1] : 0, pires: tri.slice(0, 5), plus50: o.img.filter(x => x[1] > 50).length, plus100: o.img.filter(x => x[1] > 100).length,
      perduMs: Math.round(o.img.reduce((s, x) => s + Math.max(0, x[1] - 16.7), 0)),
      perdu50: Math.round(o.img.reduce((s, x) => s + Math.max(0, x[1] - 50), 0)), medianeMs: (o.img.map(x => x[1]).sort((p, q) => p - q)[o.img.length >> 1] || 0), /* perdu50 : ce qui dépasse 50 ms (ne dépend pas de la cadence 30 / 60 du menu) */
      styleMs: Math.round(((m1.RecalcStyleDuration || 0) - (m0.RecalcStyleDuration || 0)) * 1000), miseMs: Math.round(((m1.LayoutDuration || 0) - (m0.LayoutDuration || 0)) * 1000),
      scriptMs: Math.round(((m1.ScriptDuration || 0) - (m0.ScriptDuration || 0)) * 1000), tacheMs: Math.round(((m1.TaskDuration || 0) - (m0.TaskDuration || 0)) * 1000),
      mises: (m1.LayoutCount || 0) - (m0.LayoutCount || 0), styles: (m1.RecalcStyleCount || 0) - (m0.RecalcStyleCount || 0) };
    const tout = agrege(profile, T, off, 1e9); E.occupeMs = tout.occupeMs; E.causes = tout.causes; E.suivies = tout.suivies; E.cumul = tout.cumul.slice(0, 20); E.propre = tout.propre;
    if (tri[0]) { const d = tri[0][0], f = d + tri[0][1]; const a = agrege(profile, T, d - 3 + off, f + 3 + off); E.pireImage = { de: d, a: f, occupeMs: a.occupeMs, causes: a.causes, suivies: a.suivies, cumul: a.cumul.slice(0, 22), propre: a.propre.slice(0, 10) }; }
    R.etapes[nom] = E; if (OUT && A.profils === '1') fs.writeFileSync(path.join(OUT, R.n + '-' + R.essai + '-' + nom + '.cpuprofile'), JSON.stringify(Object.assign(profile, { __marque: off, __pire: tri[0] || null })));
    console.error('  ' + nom.padEnd(16) + ' pire ' + String(E.pire).padStart(6) + ' ms · >50 ' + E.plus50 + ' · >100 ' + E.plus100 + ' · perdu ' + E.perduMs + ' · ' + JSON.stringify(E.pireImage ? E.pireImage.suivies : {}).slice(0, 200));
  };
  const etat = () => J(`JSON.stringify((function(){var b=document.getElementById('gBqBtn'),g=document.getElementById('garage');var e9=b&&b._k?String(b._k).split('|')[0]:null;return {mode:g&&g.className.indexOf('modeShop')>=0,btn:b?b.textContent.trim().slice(0,40):null,etat:e9,cat:(window.SHOP||{}).tab,err:window.__loopErr||null}})())`);
  /* la bande : un lancer (toucher, glisser, lâcher) dans le sens de sa longueur */
  const lancer = async (sens) => { const r = await J("JSON.stringify((function(){var e=document.querySelector('#gBqPan .bqRail');if(!e)return null;var b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height,e.scrollWidth-e.clientWidth,e.scrollHeight-e.clientHeight]})())");
    if (!r) return 'bande introuvable'; const vert = r[5] > r[4], cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, L = (vert ? r[3] : r[2]) * .35 * sens;
    const pt = k => vert ? { x: cx, y: cy + L * (1 - 2 * k) } : { x: cx + L * (1 - 2 * k), y: cy };
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt(0)] });
    for (let k = 1; k <= 8; k++) { await dormir(22); await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [pt(k / 8)] }); }
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return vert ? 'vertical' : 'horizontal'; };
  const defile = async () => { let s = ''; for (let i = 0; i < 4; i++) { s = await lancer(1); await dormir(650); } for (let i = 0; i < 4; i++) { await lancer(-1); await dormir(650); } return s; };
  const carte = (j) => c.ev(`(function(){var L=Array.from(document.querySelectorAll('#gBqPan .bqRail .bqK'));var e=L[${j}];if(!e)return 'aucune carte '+${j}+'/'+L.length;e.click();return e.getAttribute('data-k')})()`);
  let n = 0;
  for (const ESSAI of ESSAIS) {
    n++; exc = []; const R = { n, essai: ESSAI, puce: PUCE, t0: new Date().toISOString(), etapes: {} };
    console.error('== essai ' + n + ' ' + ESSAI + ' ' + new Date().toTimeString().slice(0, 8));
    try {
      await c.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&carte=nuages&pistegraine=7&tel=1&appareil=iPhone14,2` + (ESSAI === 'sans' ? '&sans=boutiquefluide' : '') + (A.plus ? '&' + A.plus : '');
      if (A.froid === '1') await c.send('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:' + P_HTTP, storageTypes: 'indexeddb' }); /* --froid 1 : les photos gardées effacées (le 1er lancement après une mise à jour) */
      const tN = Date.now(); await c.send('Page.navigate', { url });
      let pret = false; for (let i = 0; i < 600; i++) { await dormir(200); try { if (await c.ev('!!window.__gameReady', 8000)) { pret = true; break; } } catch (e) {} }
      if (!pret) throw new Error('pas prêt'); R.demarrageMs = Date.now() - tN;
      await dormir(1200);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(3500); try { await c.ev("window.__mGo&&window.__mGo('home');1"); } catch (e) {} await dormir(2000);
      await c.ev("(function(){var e=document.querySelector('#mHome [data-m=\"garage\"]');if(e)e.click();return 1})()"); await dormir(8000);
      await c.ev(SONDE);
      await c.send('Emulation.setCPUThrottlingRate', { rate: PUCE }); await dormir(1500);
      R.motAvantRepos = await J("JSON.stringify(window.dbgMotPre?dbgMotPre():null)");
      await etape(R, 'repos', async () => 'menu au repos', 3000);
      R.motAvantOuverture = await J("JSON.stringify(window.dbgMotPre?dbgMotPre():null)");
      await etape(R, 'ouverture', async () => { await clic('#gShopBas'); return 'BOUTIQUE'; }, 5000);
      R.ouverte = await etat();
      R.motAvantPeinture = null;
      for (const k of ['achat', 'peinture', 'aile', 'trainee', 'figure', 'voiture']) { if (k === 'peinture') R.motAvantPeinture = await J("JSON.stringify(window.dbgMotPre?dbgMotPre():null)"); await etape(R, 'onglet-' + k, async () => (await clic('#gBqCats [data-c="' + k + '"]')) ? k : 'absent', 3500); }
      await etape(R, 'defile-voiture', defile, 1200);
      await clic('#gBqCats [data-c="peinture"]'); await dormir(2500);
      await etape(R, 'defile-peinture', defile, 1200);
      await clic('#gBqCats [data-c="voiture"]'); await dormir(2500);
      for (const j of [1, 2, 3]) await etape(R, 'article-' + j, () => carte(j), 2500);
      /* l'achat : la première caisse qui se paie en pièces */
      let ach = null; R.boutons = []; for (let j = 0; j < 40 && !ach; j++) { const k = await carte(j); if (!k || String(k).indexOf('aucune') === 0) break; await dormir(900); const s = await etat(); R.boutons.push(k + ' ' + s.btn + ' ' + s.etat); if (s.etat === 'achat' && /^\D*€ [\d\s]+$/.test(s.btn || '')) ach = { j, k, btn: s.btn }; }
      R.achatChoisi = ach; await dormir(1500);
      if (ach) { await etape(R, 'achat', async () => { await clic('#gBqBtn'); return ach.k; }, 5500); R.apresAchat = await etat();
        await etape(R, 'equipe', async () => { await clic('#gBqBtn'); return 'ÉQUIPER'; }, 3500); R.apresEquipe = await etat(); }
      if (A.memo === '1') { /* LES POTS GARDÉS : une caisse bâtie (rayons tirés) puis revue (pot gardé) doit être la même, au sommet près */
        await carte(5); await dormir(2500); const e1 = await J('JSON.stringify(dbgCaisseEmpreinte())'), m1 = await J('JSON.stringify(window.dbgEchMemo?dbgEchMemo():null)');
        await carte(6); await dormir(2500); await carte(5); await dormir(2500); const e2 = await J('JSON.stringify(dbgCaisseEmpreinte())'), m2 = await J('JSON.stringify(window.dbgEchMemo?dbgEchMemo():null)');
        R.memoEgal = { premiere: e1, revue: e2, egal: JSON.stringify(e1) === JSON.stringify(e2), memoAvant: m1, memoApres: m2 }; }
      await etape(R, 'fermeture', async () => { await clic('#gShopBas'); return 'retour'; }, 3500); R.fermee = await etat();
      await etape(R, 'reouverture', async () => { await clic('#gShopBas'); return 'BOUTIQUE'; }, 4000);
      await clic('#gShopBas'); await dormir(2500);
      await c.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      if (A.photo) { /* l'écran de la boutique, toujours le même (rayon voitures, 1re carte), pour la planche avant/après */
        await clic('#gShopBas'); await dormir(3000); await clic('#gBqCats [data-c="voiture"]'); await dormir(1500); await carte(0); await dormir(4000);
        try { await c.ev('window.dbgFigGel&&dbgFigGel(0);1'); } catch (e) {}
        const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(OUT, n + '-' + ESSAI + '-boutique.png'), Buffer.from(sh.data, 'base64'));
        for (const k of ['peinture', 'aile', 'figure']) { await clic('#gBqCats [data-c="' + k + '"]'); await dormir(3500); const s2 = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(OUT, n + '-' + ESSAI + '-' + k + '.png'), Buffer.from(s2.data, 'base64')); }
        await clic('#gBqCats [data-c="voiture"]'); await dormir(1000); await clic('#gShopBas'); await dormir(2000); }
      if (A.course && n === ESSAIS.length) { /* une course, une mort */
        await c.ev("try{__mGo('home')}catch(e){};1"); await dormir(1500);
        R.jouer = String(await c.ev('JSON.stringify(dbgJouer())')).slice(0, 200);
        let ok = false; for (let i = 0; i < 120 && !ok; i++) { await dormir(500); ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&!s.gameOver)})()"); }
        R.course = ok; await dormir(8000); try { await c.ev("dbgDauphin('boom');1"); } catch (e) { R.boom = e.message; }
        let m = false; for (let i = 0; i < 40 && !m; i++) { await dormir(400); m = await c.ev("dbgState().gameOver"); } R.mort = m; await dormir(3000); }
      R.loopErr = await c.ev('window.__loopErr||null');
      try { R.motPre = await J("JSON.stringify(window.dbgMotPre?dbgMotPre():null)"); R.echMemo = await J("JSON.stringify(window.dbgEchMemo?dbgEchMemo():null)"); if (A.egal === '1' && n === 1) R.motEgal = await c.ev('window.dbgMotEgal?dbgMotEgal():null', 60000); } catch (e) { R.sondes = e.message; }
    } catch (e) { R.erreur = String(e && e.message || e); }
    try { await c.send('Emulation.setCPUThrottlingRate', { rate: 1 }); } catch (e) {}
    try { R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie','chargement'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)})}catch(e){return String(e)}})()"); } catch (e) {}
    R.exc = exc.slice(); R.t1 = new Date().toISOString();
    const s = JSON.stringify(R); console.log(s); if (OUT) fs.writeFileSync(path.join(OUT, n + '-' + ESSAI + '.json'), s);
  }
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
