// LE BANC DE LA GRANDE VITESSE (2026-11-13, ios-aide) — le script de la boucle à basse et à haute vitesse, au profileur JavaScript (Chrome, chemin
// téléphone ?tel=1). Sur le 13 Pro (build 101) : 7,3 ms de script par image sous 400 km/h, 15-17 ms au-dessus. Ce banc dit QUELLES fonctions grossissent.
//   node outils/banc-vitesse/profil.cjs [--s 12] [--paliers 15] [--q "x=1"] [--cpu 1] [--prebati 0] [--nitbas 0]
// Les deux fenêtres partent du DÉBUT de la même piste (dbgPortail), donc sur la même map ; --prebati 0 coupe le pré-bâti (dbgPrebati(0)) pour ne garder
// que la boucle ; la fenêtre basse roule sans nitro (--nitbas 2 pour l'allumer), la haute au palier +N avec nitro.
// Sortie : par fenêtre (basse, haute), images, vitesse moyenne, coût moyen du rappel loop() (ms/image), puis les fonctions dont le temps PROPRE par
// image grossit le plus entre les deux fenêtres. Rapport JSON complet dans outils/banc-vitesse/out/ (ignoré par git).
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9895), P_CDP = +(A.cdp || 9896), SEC = +(A.s || 12), PALIERS = +(A.paliers || 15), CPU = +(A.cpu || 1);
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844, UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* le coût de chaque rappel de loop() et la vitesse, par image (posé avant le jeu) */
const SONDE = `(function(){const raf=window.requestAnimationFrame.bind(window);const L=window.__vit=[];window.__vitOn=false;
  window.requestAnimationFrame=function(cb){return raf(function(t){if(!window.__vitOn||cb.name!=='loop')return cb(t);const a=performance.now();try{return cb(t);}finally{const d=performance.now()-a;let v=0;try{v=window.dbgState().vH*3.6;}catch(e){}L.push([a,d,v]);}});};})();`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const PROF = fs.mkdtempSync(path.join(require('os').tmpdir(), 'banc-vitesse-'));
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = async code => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); await dormir(800); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} process.exit(code); }; /* (le profil Chrome du banc : 50-200 Mo, effacé à la sortie) */
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    if (CPU > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}\n' + SONDE });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0&carte=nuages&meteo=midi&pistegraine=777` + (A.q ? '&' + A.q : '') });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2500);
    for (let i = 0; i < 6; i++) { const la = await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1;})()", 8000).catch(() => 0); if (!la) break; await dormir(3000); }
    const NIT0 = +(A.nitbas || 0), PREB0 = A.prebati === '0';
    await c.ev(`(async()=>{dbgImmortel(true);dbgJouer();await new Promise(r=>setTimeout(r,5000));${PREB0 ? 'dbgPrebati(0);' : ''}dbgAuto(true,0,{vol:true,nit:${NIT0}});await new Promise(r=>setTimeout(r,4000));const P=dbgPortail(0);dbgPortail(P.L-150);dbgAuto(true,0,{vol:true,nit:${NIT0}});await new Promise(r=>setTimeout(r,2500));return 1;})()`, 60000);
    await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 200 });
    const fenetre = async nom => {
      await c.ev('window.__vit.length=0;window.__vitOn=true;0');
      await c.send('Profiler.start'); await dormir(SEC * 1000); const { profile } = await c.send('Profiler.stop', {}, 120000);
      const L = await c.ev('(function(){window.__vitOn=false;return window.__vit.slice();})()', 60000);
      fs.writeFileSync(path.join(OUT, nom + '.cpuprofile'), JSON.stringify(profile));
      return { nom, profile, L, lieu: await c.ev('dbgNiveau().lieu').catch(() => '?') };
    };
    const basse = await fenetre('basse');
    await c.ev(`(async()=>{for(let k=0;k<${PALIERS};k++){dbgMoteur();await new Promise(r=>setTimeout(r,500));}const P=dbgPortail(0);dbgPortail(P.L-150);dbgAuto(true,0,{vol:true,nit:2});await new Promise(r=>setTimeout(r,3500));return 1;})()`, 120000);
    const haute = await fenetre('haute');
    /* le temps PROPRE par fonction (échantillons × intervalle), ramené à l'image */
    const propre = p => { const parId = new Map(); for (const n of p.nodes) parId.set(n.id, n); const t = new Map(), dt = p.timeDeltas || [];
      for (let i = 0; i < p.samples.length; i++) { const n = parId.get(p.samples[i]); if (!n) continue; const f = n.callFrame; const k = (f.functionName || '(anonyme)') + ':' + (f.lineNumber + 1) + (f.url && !/index\.html/.test(f.url) ? ' ' + path.basename(f.url) : '');
        t.set(k, (t.get(k) || 0) + (dt[i + 1] || dt[i] || 0) / 1000); } return t; };
    const R = {};
    for (const F of [basse, haute]) { const n = F.L.length || 1, ms = F.L.reduce((a, b) => a + b[1], 0), v = F.L.reduce((a, b) => a + b[2], 0) / n;
      R[F.nom] = { images: F.L.length, kmh: Math.round(v), loopMs: +(ms / n).toFixed(2), lieu: F.lieu, propre: propre(F.profile) }; }
    const nb = R.basse.images || 1, nh = R.haute.images || 1, cles = new Set([...R.basse.propre.keys(), ...R.haute.propre.keys()]);
    const diff = [...cles].map(k => { const b = (R.basse.propre.get(k) || 0) / nb, h = (R.haute.propre.get(k) || 0) / nh; return [k, +b.toFixed(3), +h.toFixed(3), +(h - b).toFixed(3)]; })
      .filter(x => !/^\((idle|program|garbage collector|root)\)/.test(x[0])).sort((a, b) => b[3] - a[3]);
    for (const k of ['basse', 'haute']) console.log(k, ':', R[k].images, 'images ·', R[k].kmh, 'km/h ·', R[k].loopMs, 'ms de loop() par image ·', R[k].lieu);
    console.log('GC par image : basse', +(((R.basse.propre.get('(garbage collector):0') || 0) / nb).toFixed(3)), 'ms · haute', +(((R.haute.propre.get('(garbage collector):0') || 0) / nh).toFixed(3)), 'ms');
    console.log('ce qui grossit le plus (ms propres par image : basse → haute, écart) :');
    for (const x of diff.slice(0, +(A.top || 30))) console.log('  ', x[0].padEnd(48), x[1], '→', x[2], ' +' + x[3]);
    fs.writeFileSync(path.join(OUT, 'rapport.json'), JSON.stringify({ basse: { images: R.basse.images, kmh: R.basse.kmh, loopMs: R.basse.loopMs, lieu: R.basse.lieu }, haute: { images: R.haute.images, kmh: R.haute.kmh, loopMs: R.haute.loopMs, lieu: R.haute.lieu }, diff }, null, 1));
    await fin(0);
  } catch (e) { console.error('ERREUR', e.message); await fin(1); }
})();
