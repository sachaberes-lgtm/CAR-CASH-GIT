// LE BANC DU VOL (2026-11-14 soir, chantier QUALITÉ PAR APPAREIL — Sacha, build 115 sur son 13 Pro : « en mode AIR TIME les traînées rouges qui partent des feux
// arrière sont mal gérées »). UN Chrome sans fenêtre et muet, iPhone 13 Pro émulé (844×390 couché / 390×844 debout, DPR 3, tactile, UA iPhone → TEL_NATIF ;
// ?appareil=iPhone14,2 → PRF.on, classe 1, N1). La boucle menée à la main (rAF coupé, dbgStep 33 ms, 36 ms entre deux pas). Le pilote auto roule jusqu'à la vitesse
// visée, DÉCOLLE (DBG_AUTO.saut), puis on FILME LE VOL IMAGE PAR IMAGE : une photo + le relevé d'écran des rubans (dbgRubans({releve:1})) + l'assiette (dbgVol())
// à CHAQUE image, du décollage à l'atterrissage (+ quelques images au sol). Une figure (--fig tonneau|salto|…) peut être lancée à la n-ième image de vol (--figA).
//   node outils/banc-qualite-vol/vol.cjs --out <dossier> [--fmt couche|debout] [--carte nuages|jade] [--meteo nuit] [--v 300] [--nit 0|1] [--imp 20]
//        [--fig tonneau | --fig 1,0 (un double-tap NITRO en vol, pouce en x,y : la figure de cette direction)] [--rouge 0 (ne pas attendre des traînées rouges)] [--figA 6] [--max 70] [--q "sans=rubanvol"] [--tag x] [--http 9941] [--cdp 9942] [--sol 1 (une séquence au sol, sans saut)] [--portail 1 (le grand vol : dbgSaut, comme un portail)] [--saut0 n (images filmées sautées au début)] [--abj 3,8 (ces images redessinées sans chaque lot)] [--bv 1 (avec --q perfrec=2 : la boîte de vol relue)] [--cout 12 (le coût CPU du ruban mesuré sur cette image)] [--ab sansvol,sansvolfin,sansvolcaisse,sansmasque,sanslong,avant]
// Prendre le verrou du Mac AVANT (sh ~/cash-car/verrou-banc.sh prendre "vol"), le rendre APRÈS. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', METEO = A.meteo || '', V = +(A.v || 300), NIT = +(A.nit || 0), IMP = +(A.imp || 20), MAXI = +(A.max || 70);
const TAG = (A.tag || 'vol') + '-' + FMT + '-' + CARTE + '-v' + V + (NIT ? 'n' : '') + (A.fig ? '-fig' + A.fig.replace(/[^0-9a-z-]/gi, '') : '') + (A.portail === '1' ? '-portail' : '');
const P_HTTP = +(A.http || 9941), P_CDP = +(A.cdp || 9942);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const AB = { sansvol: { vol: 0 }, sansvolfin: { vol: 1, volFin: 0, volCaisse: 1 }, sansvolcaisse: { vol: 1, volFin: 1, volCaisse: 0 }, sansmasque: { masque: 0 }, sanslong: { long: 0 },
  avant: { net: 0, larg: 0, masque: 0, long: 0, vol: 0 }, remis: { net: 1, larg: 1, masque: 1, long: 1, vol: 1, volFin: 1, volCaisse: 1 } }; /* les variantes d'une même image (--abj) ; « remis » = l'état normal du profil */
const ETAT = "JSON.stringify((function(){var v=dbgVol(),S=dbgScene(),p=S.car.position.clone().project(S.cam);return {mode:v.mode,kmh:dbgRubans().kmh,tg:v.tangage,rl:v.roulis,lc:v.lacet,carRoll:v.carRoll,vy:v.vy,fallT:v.fallT,haut:v.hautCaisse,"
  + "ecran:[+((p.x*.5+.5)*innerWidth).toFixed(1),+((-p.y*.5+.5)*innerHeight).toFixed(1)],rub:dbgRubans({releve:1})}})())";

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [], cons = [], film = { tag: TAG, fmt: FMT, carte: CARTE, v: V, nit: NIT, fig: A.fig || null, images: [] };
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} });
  const shot = async (nom) => { const r = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&appareil=iPhone14,2&carte=${CARTE}${METEO ? '&meteo=' + METEO : ''}&pistegraine=7` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    let pret = false;
    for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    let ok = false;
    for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    film.depart = await c.ev("JSON.stringify({rubans:dbgRubans(),prf:(function(){try{return dbgPrf()}catch(e){return String(e)}})()})");
    console.log('départ', film.depart.slice(0, 400));
    await c.ev(`window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:${NIT},vol:1});try{dbgPin(true)}catch(e){};dbgRubans({compteur:1,garde:1});try{dbgVol('tout')}catch(e){};1`);
    await dormir(300); await c.ev(MASQUE);
    const pas = async (n) => { await c.ev(`(async function(){${NIT ? 'try{dbgNitro(9,0)}catch(e){}' : ''};for(var i=0;i<${n};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000); };
    const kmh = async () => +(await c.ev('dbgRubans().kmh'));
    let k = 0, n = 0;
    while ((k = await kmh()) < V && n < 1500) { await pas(6); n += 6; if (n % 120 === 0) console.log('…', k, 'km/h'); }
    console.log('vitesse', k, 'après', n, 'pas');
    if (A.rouge !== '0') { /* des traînées ROUGES (les feux, pas l'or d'un pad turbo ni le nitro) au décollage : on roule tant que la tête n'est pas rouge */
      let r = 0; for (; r < 400; r += 3) { const cl = JSON.parse(await c.ev("JSON.stringify((dbgRubans({releve:1})[0]||{}).coul||null)")); if (cl && cl[0] > .05 && cl[1] / cl[0] < .25) break; await pas(3); }
      console.log('rouge après', r, 'pas'); }
    if (A.portail === '1') { console.log('portail', JSON.stringify(await c.ev('JSON.stringify(dbgSaut())')).slice(0, 200)); await pas(1); }
    else if (A.sol !== '1') {
      await c.ev(`dbgAuto(1,0,{nit:${NIT},vol:1,saut:.05,imp:${IMP}});1`);
      let m = 'drive'; n = 0; while (m !== 'fall' && n < 200) { await pas(1); n++; m = await c.ev('dbgVol().mode'); }
      await c.ev(`dbgAuto(1,0,{nit:${NIT},vol:1});1`); /* plus de nouveau saut */
      console.log('décollage après', n, 'pas, mode', m);
    }
    /* LE FILM : une image par pas, jusqu'à l'atterrissage + 6 images au sol (ou MAXI) */
    let sol = 0, fa = 0;
    for (let j = 0; j < MAXI; j++) {
      const e = JSON.parse(await c.ev(ETAT)); e.j = j;
      if (j >= +(A.saut0 || 0)) { const nom = `${TAG}-${String(j).padStart(3, '0')}.png`; await shot(nom); e.png = nom; } film.images.push(e);
      const r0 = e.rub[0] || {}, r1 = e.rub[1] || {};
      console.log(j, e.mode, e.kmh, 'tg', e.tg, 'rl', e.rl, 'cr', e.carRoll, '| R0 ecart', r0.ecart, 'ang', r0.angleMax, 'vr', r0.vrilles, 'w', r0.wMin, r0.wMax, 'saut', r0.sautLarg, 'n', r0.n, '| R1 ecart', r1.ecart, 'ang', r1.angleMax, 'vr', r1.vrilles);
      if (A.abj && A.abj.split(',').map(Number).includes(j)) { /* LA MÊME IMAGE, redessinée sans chaque lot (A net, C masque, D loupe longue) : d'où vient un défaut ? */
        for (const [nm, r] of (A.ab ? A.ab.split(',') : ['sansvol', 'sansmasque', 'sanslong', 'avant']).map(n => [n, AB[n]]).concat([['remis', AB.remis]])) {
          await c.ev(`dbgRubans(${JSON.stringify(Object.assign({ refait: 1 }, r))});dbgLoupe({rendre:1});1`); await shot(`${TAG}-${String(j).padStart(3, '0')}-${nm}.png`); } }
      if (A.cout && +A.cout === j) { /* LE COÛT CPU du ruban sur cette image : 300 redessins (dt 0) de tous les rubans, vol posé puis coupé, alternés 3 fois (Mac émulé : un ordre de grandeur) */
        film.cout = JSON.parse(await c.ev("(function(){var R={on:[],off:[]};for(var k=0;k<6;k++){var on=k%2===0;dbgRubans({vol:on?1:0,volFin:1,volCaisse:1});var t=performance.now();for(var i=0;i<300;i++)dbgRubans({refait:1});R[on?'on':'off'].push((performance.now()-t)/300);}dbgRubans({vol:1,refait:1});return JSON.stringify({msParImageVol:R.on.map(function(x){return +x.toFixed(4)}),msParImageSansVol:R.off.map(function(x){return +x.toFixed(4)}),volSt:dbgRubans().volSt})})()"));
        console.log('coût', JSON.stringify(film.cout)); }
      if (e.mode === 'fall') { fa++; if (A.fig && fa === +(A.figA || 6)) console.log('figure', await c.ev(/,/.test(A.fig) ? `JSON.stringify(dbgSautFig(${A.fig}))` : `JSON.stringify(dbgFigure(${JSON.stringify(A.fig)}))`)); }
      else if (A.sol !== '1' && fa > 0) { sol++; if (sol > 6) break; }
      if (e.mode === 'boom' || e.mode === 'dead') break;
      await pas(1);
    }
    if (A.bv === '1') { /* LA BOÎTE DE VOL (?perfrec=2 dans --q) : le profil d'image de la course, un changement de réglage en course (HAUTE), puis la course refermée (pagehide) et relue */
      await pas(30); console.log('réglage', JSON.stringify(await c.ev("JSON.stringify((function(){var p=dbgPrf('haute');return {q:p.reglage,n:p.niveau}})())")));
      await pas(60); await c.ev("dispatchEvent(new Event('pagehide'));1");
      film.bv = JSON.parse(await c.ev("(function(){var n=+localStorage.getItem('ccBVn');var c=JSON.parse(localStorage.getItem('ccBV'+(n-1))||'null');return JSON.stringify(c?{n:n,prf:c.prf,prfN:c.prfN,prfD:c.prfD,prfC:c.prfC,secondes:c.S.length/8,dur:c.dur}:null)})()"));
      console.log('boîte de vol', JSON.stringify(film.bv)); }
    film.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()");
    film.exceptions = exc.slice(0, 8); film.console = cons.slice(0, 8);
    fs.writeFileSync(path.join(OUT, TAG + '-film.json'), JSON.stringify(film));
    console.log('pannes', JSON.stringify(film.pannes), 'exceptions', JSON.stringify(exc.slice(0, 4)), 'console', JSON.stringify(cons.slice(0, 4)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
