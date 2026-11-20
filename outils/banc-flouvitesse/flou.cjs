// LE BANC DU FLOU DE VITESSE (2026-11-19, finition, lot « flouvitesse » — Sacha : « Sur les côtés, quand on roule et qu'on va vite, il y a un effet de flou […] il est un peu moche »).
// UN Chrome sans fenêtre et muet, au format de l'iPhone 13 Pro (844×390 couché, DPR 3, tactile émulé, ?tel=1&appareil=iPhone14,2), la boucle menée à la main (dbgStep 33 ms).
//  1. La SÉRIE : l'effet (uSpeed) image par image en croisière, 3 s de nitro, 3 s après — montée, retombée, rien de collé.
//  2. Les PHOTOS : LA MÊME image figée, effet forcé (s = .2 croisière rapide, .42 plaque boost, 1 nitro) — avant (programme sans) / après (avec), image entière + zooms (bord, caisse).
//  3. Le COÛT : dbgGpu (chronomètre de la puce) sur la même image, programme avec / sans, encadré (témoins avant et après), à s = .2 et s = 1.
//   node outils/banc-flouvitesse/flou.cjs --out <dossier> [--carte nuages] [--q "x=y"] [--z ".55,560,.45,0"]
// Prendre le verrou du Mac AVANT (sh ~/cash-car/verrou-banc.sh prendre "<qui>") et le rendre APRÈS. Chrome est tué (groupe) et son profil effacé à la fin.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || 'prises-flou'); fs.mkdirSync(OUT, { recursive: true });
const W = 844, H = 390, CARTE = A.carte || 'nuages', TAG = (A.tag || 'f') + '-' + CARTE;
const P_HTTP = +(A.http || 9781), P_CDP = +(A.cdp || 9782);
const PROF = fs.mkdtempSync(path.join(A.tmp || require('os').tmpdir(), 'banc-flou-'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
/* les trois états, sur la MÊME page : avant (le flou V1 que rendait le jeu depuis le 17/11, sans le cœur des rubans) · v2 (la ligne rendue : flou V2) · apres (V2 + stries) */
const ETATS = { avant: 'dbgFlouStyle({on:0});dbgFlou({v:0});try{dbgRubans({masque:0})}catch(e){}', v2: 'dbgFlou({v:1});dbgFlouStyle({on:0});try{dbgRubans({masque:1})}catch(e){}',
  apres: 'dbgFlou({v:1});dbgFlouStyle({on:1});try{dbgRubans({masque:1})}catch(e){}' };
/* --z2 "a,b,c,d" : un quatrième état (les stries avec d'autres réglages uFz), mesuré et photographié comme les autres ; « apres » repose alors les réglages par défaut */
if (A.z2) { ETATS.apres += `;dbgFlouStyle({z:[${A.z || '.9,640,.5,-.5'}]})`; ETATS.apresB = ETATS.apres + `;dbgFlouStyle({z:[${A.z2}]})`; }
/* --extra "nom=js|nom2=js" : des états de plus (banc de recherche : programme retouché à la main, sur la base « apres ») */
const EXTRA = new Set();
if (A.extra) { const R0 = 'var M9=window.__gpuObj?__gpuObj.acesPass.material:{};if(M9.fragmentShader&&!window.__F9)window.__F9=M9.fragmentShader;if(window.__F9&&M9.fragmentShader!==__F9){M9.fragmentShader=__F9;M9.needsUpdate=true;}';
  const base = ETATS.apres; for (const k of Object.keys(ETATS)) ETATS[k] = R0 + ETATS[k];
  for (const e of A.extra.split('|')) { const k = e.indexOf('='); EXTRA.add(e.slice(0, k)); ETATS[e.slice(0, k)] = R0 + base + ';M9.fragmentShader=M9.fragmentShader' + e.slice(k + 1) + ';M9.needsUpdate=true'; } }
/* --temoin 1 : « v2 » mesuré une seconde fois EN DERNIER dans chaque tour (v2fin) — la place dans le tour pèse-t-elle ? */
if (A.temoin) { ETATS.v2fin = ETATS.v2; EXTRA.add('v2fin'); }
if (/sans=[^&]*flouvitesse/.test(A.q || '')) { for (const k of Object.keys(ETATS)) delete ETATS[k]; ETATS.avant = '1'; }
const SANS = null;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch);
    setTimeout(() => {}, 0); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); });
  const exc = [], R = { carte: CARTE, serie: [], photos: [], gpu: {} };
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && /error|warning/.test(m.params.type)) exc.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 600)); } catch (x) {} });
  const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = { x: clip[0], y: clip[1], width: clip[2], height: clip[3], scale: 1 };
    const r = await c.send('Page.captureScreenshot', o, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&appareil=iPhone14,2&garde=1&intro=ancien&attente=0&prebati=0&carte=${CARTE}&pistegraine=7` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    let ok = false;
    for (let i = 0; i < 200 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    R.depart = await c.ev("JSON.stringify({sty:dbgFlouStyle(),flou:dbgFlou(),rubans:(function(){try{return dbgRubans()}catch(e){return null}})(),gfx:dbgGfxFin()})");
    console.log('départ', R.depart);
    if (A.z) await c.ev(`dbgFlouStyle({z:[${A.z}]});1`);
    await c.ev("window.requestAnimationFrame=function(){return 0;};dbgImmortel&&dbgImmortel(true);dbgAuto(1,0,{nit:0});1");
    await c.ev(MASQUE);
    const pas = async (n, nit) => { await c.ev(`dbgAuto(1,0,{nit:${nit ? 1 : 0}});1`); return pas0(n, nit); };
    const pas0 = async (n, nit) => JSON.parse(await c.ev(`(async function(){var L=[];for(var i=0;i<${n};i++){${nit ? 'try{dbgNitro(9,0)}catch(e){}' : ''}dbgStep(1,33);var st=dbgState();L.push([+dbgFlouStyle().s,st.mode]);await new Promise(function(r){setTimeout(r,30)});}return JSON.stringify(L)})()`, 240000));
    /* 1. LA SÉRIE : 6 s de croisière, 3 s de nitro, 3 s sans */
    R.serie.push(['croisière', await pas(180, false)]);
    R.serie.push(['nitro', await pas(90, true)]);
    R.serie.push(['après', await pas(90, false)]);
    console.log('série', JSON.stringify(R.serie.map(([n, L]) => [n, L.filter((x, i) => i % 10 === 0)])));
    /* 2. LES PHOTOS : la même image, effet forcé */
    const pc = JSON.parse(await c.ev("(function(){var S=dbgScene(),v=S.car.position.clone().project(S.cam);return JSON.stringify([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])})()"));
    const zc = [Math.max(0, Math.min(W - 240, Math.round(pc[0] - 120))), Math.max(0, Math.min(H - 170, Math.round(pc[1] - 60))), 240, 170], zb = [0, 40, 300, 300], zd = [W - 300, 40, 300, 300];
    for (const s of (A.photos === '0' ? [] : [.2, .42, 1])) {
      const rec = { s, caisse: pc };
      for (const et of Object.keys(ETATS).filter(k => !EXTRA.has(k))) {
        rec[et] = await c.ev(`(function(){${ETATS[et]};dbgFlou({s:${s}});dbgLoupe({rendre:1});dbgLoupe({rendre:1});return JSON.stringify([dbgFlouStyle(),dbgFlou()])})()`);
        await dormir(400);
        const b = `${TAG}-s${s}-${et}`;
        await shot(b + '-jeu.png'); await shot(b + '-bord.png', zb); await shot(b + '-droite.png', zd); await shot(b + '-caisse.png', zc);
      }
      R.photos.push(rec); console.log('photos', s, JSON.stringify(rec));
    }
    /* 2b. LES VARIANTES (réglages uFz à chaud), bord gauche au nitro */
    if (ETATS.apres && A.variantes) for (const z of A.variantes.split(';')) {
      await c.ev(`(function(){${ETATS.apres};dbgFlouStyle({z:[${z}]});dbgFlou({s:1});dbgLoupe({rendre:1});dbgLoupe({rendre:1});return 1})()`); await dormir(400);
      const b = `${TAG}-var-${z.replace(/,/g, '_')}`; await shot(b + '-bord.png', zb); await shot(b + '-jeu.png');
    }
    if (A.z) await c.ev(`dbgFlouStyle({z:[${A.z}]});1`);
    await c.ev('dbgGpu({n:1})');
    /* LA PASSE FINALE SEULE (le flou ne vit que là) : 20 rendus de l'ACES par chronomètre, états alternés 8 tours, médianes — moins de bruit que l'image entière */
    for (const s of [.2, 1]) {
      R.gpu['aces' + s] = JSON.parse(await c.ev(`(async function(){var G=window.__gpuObj,rd=G.renderer,gl=rd.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),cp=G.composer,ap=G.acesPass,Z=function(m){return new Promise(function(r){setTimeout(r,m)})};
        var E={${Object.keys(ETATS).map(k => k + ':function(){' + ETATS[k] + '}').join(',')}},T={};for(var k in E)T[k]=[];
        for(var tour=0;tour<+(${A.tours || 12});tour++)for(var k in E){E[k]();dbgFlou({s:${s}});for(var w=0;w<3;w++)ap.render(rd,cp.writeBuffer,cp.readBuffer);gl.finish();
          var q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);for(var j=0;j<+(${A.rep || 20});j++)ap.render(rd,cp.writeBuffer,cp.readBuffer);gl.endQuery(ext.TIME_ELAPSED_EXT);
          for(var t=0;t<300;t++){await Z(5);if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE))break;}
          if(!gl.getParameter(ext.GPU_DISJOINT_EXT))T[k].push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6/+(${A.rep || 20}));gl.deleteQuery(q);}
        var o={};for(var k in T){var L=T[k].sort(function(a,b){return a-b});o[k]={p50:+L[L.length>>1].toFixed(3),min:+L[0].toFixed(3),n:L.length};}if(E.apres)E.apres();return JSON.stringify(o);})()`, 240000));
      console.log('aces seule', s, JSON.stringify(R.gpu['aces' + s]));
    }
    /* LES COMPTES : passes du compositeur (actives), cibles, appels et triangles d'une image entière, par état (même image figée) */
    R.comptes = {};
    for (const et of Object.keys(ETATS).filter(k => !EXTRA.has(k))) { R.comptes[et] = JSON.parse(await c.ev(`(function(){${ETATS[et]};dbgFlou({s:1});var G=window.__gpuObj,rd=G.renderer;dbgLoupe({rendre:1});dbgLoupe({rendre:1});
      return JSON.stringify({passes:G.composer.passes.filter(function(p){return p.enabled}).length,appels:rd.info.render.calls,tri:rd.info.render.triangles,prog:rd.info.programs.length})})()`)); }
    console.log('comptes', JSON.stringify(R.comptes));
    R.exceptions = exc.slice(0, 8);
    fs.writeFileSync(path.join(OUT, TAG + '-chiffres.json'), JSON.stringify(R, null, 1));
    console.log('exceptions', JSON.stringify(exc.slice(0, 5)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
