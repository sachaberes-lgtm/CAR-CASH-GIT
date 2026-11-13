// LE COÛT D'UN PRÉ-BÂTI (2026-11-13, ios-aide) — variante de route.cjs : la map d'en face bâtie D'AVANCE en tranches (comme en course, à grande vitesse),
// sous le profileur ; le temps sous prebTravaille, fonction par fonction.   node outils/banc-vitesse/prebati.cjs [--n 3] [--carte grotte] [--paliers 15]
// (en-tête de route.cjs :) — à grande vitesse le pré-bâti doit finir une map en ~13 s : son coût TOTAL se paie à chaque image.
// Ce banc bâtit N fois la route d'une map d'un trait (dbgSaut, ?pistegraine fixe) sous le profileur JavaScript de Chrome (chemin ?tel=1) et décompose
// le temps passé SOUS pisteRoute (et sous newTrack) fonction par fonction.
//   node outils/banc-vitesse/route.cjs [--n 6] [--carte nuages] [--q "x=1"] [--cpu 1]
// Sortie : ms par route (inclusif pisteRoute, newTrack) et les fonctions au temps propre le plus lourd sous pisteRoute ; empreinte des tableaux de la route
// (window.__routeEmpreinte) pour vérifier qu'un correctif rend la même route au bit près.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9895), P_CDP = +(A.cdp || 9896), N = +(A.n || 3), CARTE = A.carte || 'grotte', CPU = +(A.cpu || 1);
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844, UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* l'empreinte de la route installée : les tableaux de toutes les géométries de trackMeshes (FNV sur les octets), à lire juste après newTrack */
const EMPREINTE = `window.__routeEmpreinte=function(){const G=window.__gpuObj||(window.dbgGpu&&(window.dbgGpu({n:0}),window.__gpuObj));const T=G&&G.trackMeshes;if(!T)return null;let h=2166136261>>>0,n=0,o=0;
  const f=function(a){if(!a||!a.buffer)return;const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(let i=0;i<u.length;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}o+=u.length;};
  for(const m of T){const g=m&&m.geometry;if(!g)continue;n++;for(const k of Object.keys(g.attributes).sort())f(g.attributes[k].array);if(g.index)f(g.index.array);}
  return {maillages:n,octets:o,h:h.toString(16)};};`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const PROF = fs.mkdtempSync(path.join(require('os').tmpdir(), 'banc-route-'));
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
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}\n' + EMPREINTE });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0&carte=${CARTE}&meteo=midi&pistegraine=777` + (A.q ? '&' + A.q : '') });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2500);
    for (let i = 0; i < 6; i++) { const la = await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1;})()", 8000).catch(() => 0); if (!la) break; await dormir(3000); }
    const PAL9 = +(A.paliers || 15);
    await c.ev(`(async()=>{dbgImmortel(true);dbgJouer();await new Promise(r=>setTimeout(r,5000));for(let k=0;k<${PAL9};k++){dbgMoteur();await new Promise(r=>setTimeout(r,300));}dbgAuto(true,0,{vol:true,nit:2});await new Promise(r=>setTimeout(r,3000));return 1;})()`, 90000);
    /* N passages : à chaque map, la suivante est imposée (dbgClassique) et se bâtit d'avance en tranches ; on attend le portail. Une 1re à blanc (le code chauffe). */
    const passe = `(async()=>{const l0=dbgNiveau().lieu;dbgClassique('${CARTE}');dbgAuto(true,0,{vol:true,nit:2});for(let i=0;i<70;i++){await new Promise(r=>setTimeout(r,500));if(dbgNiveau().lieu!==l0)break;}
      const p=dbgPrebati();dbgClassique('nuages');for(let i=0;i<70;i++){await new Promise(r=>setTimeout(r,500));if(dbgNiveau().lieu!=='${CARTE}')break;}return {ms:p.cpuMaps['${CARTE}']|0,e:null,lieu:l0+'>${CARTE}',fin:p.finisAuPassage};})()`;
    await c.ev(passe, 120000);
    await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 100 }); await c.send('Profiler.start');
    const R = []; for (let k = 0; k < N; k++) R.push(await c.ev(passe, 120000));
    const { profile: p } = await c.send('Profiler.stop', {}, 120000);
    fs.writeFileSync(path.join(OUT, 'prebati-' + CARTE + '.cpuprofile'), JSON.stringify(p));
    /* temps propre de chaque nœud, puis inclusif des sous-arbres pisteRoute / newTrack */
    const par = new Map(); for (const n of p.nodes) par.set(n.id, n); const self = new Map(), dt = p.timeDeltas || [];
    for (let i = 0; i < p.samples.length; i++) { const id = p.samples[i]; self.set(id, (self.get(id) || 0) + (dt[i + 1] || dt[i] || 0) / 1000); }
    const nom = n => (n.callFrame.functionName || '(anonyme)') + ':' + (n.callFrame.lineNumber + 1) + (n.callFrame.url && !/index\.html/.test(n.callFrame.url) ? ' ' + path.basename(n.callFrame.url) : '');
    const sousArbre = (racine, f) => { const pile = [racine]; while (pile.length) { const n = pile.pop(); f(n); for (const k of n.children || []) pile.push(par.get(k)); } };
    const inclusif = re => { let t = 0; const vus = new Set(), parFn = new Map(); for (const n of p.nodes) if (re.test(n.callFrame.functionName)) { sousArbre(n, m => { if (vus.has(m.id)) return; vus.add(m.id); const s = self.get(m.id) || 0; t += s; parFn.set(nom(m), (parFn.get(nom(m)) || 0) + s); }); } return { t, parFn }; };
    const pr = inclusif(/^prebTravaille$/), nt = inclusif(/^newTrack$/);
    console.log(CARTE + ' : ' + N + ' pré-bâtis · sous prebTravaille ' + (pr.t / N).toFixed(1) + ' ms/map (Chrome) · newTrack au passage ' + (nt.t / N).toFixed(1) + ' ms');
    console.log('cpu du jeu (PREB_CPU, ms) :', R.map(r => r.ms).join(' '), '· finis au passage :', R.map(r => r.fin).join(' '));
    console.log('sous prebTravaille, temps propre par map (ms) :');
    for (const [k, v] of [...pr.parFn.entries()].sort((a, b) => b[1] - a[1]).slice(0, +(A.top || 22))) console.log('   ', k.padEnd(50), (v / N).toFixed(2));
    console.log('au passage (newTrack, ms/map) :');
    const hors = new Map(); for (const [k, v] of nt.parFn) { const q = v - (pr.parFn.get(k) || 0); if (q > 0) hors.set(k, q); }
    for (const [k, v] of [...hors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log('   ', k.padEnd(50), (v / N).toFixed(2));
    await fin(0);
  } catch (e) { console.error('ERREUR', e.message); await fin(1); }
})();
