// LE BANC DES VIBRATIONS (2026-11-15, chantier QUALITÉ PAR APPAREIL — Sacha : « la voiture a toujours des vibrations/bugs à certains moments sur route et en l'air »).
// UN Chrome sans fenêtre et muet, iPhone 13 Pro émulé. L'HORLOGE EST VIRTUELLE : performance.now() est remplacé, la boucle `loop(t)` est appelée à la main avec
// des dates imposées (comme rAF le ferait) : le dt du jeu est EXACTEMENT celui du motif choisi, la charge du Mac ne compte pas. Math.random est semé (même route à chaque passe).
// À chaque image : la caisse (monde), la caméra, et LA CAISSE DANS LE REPÈRE DE LA CAMÉRA (pixels projetés + lacet/tangage/roulis relatifs). L'analyse : analyse-sol.cjs.
//   node outils/banc-vibration/vib.cjs --out <fichier.json> [--carte nuages] [--motif r60|r30|alt|tel|bascule|pointes] [--n 2400] [--moteur 10] [--nit 0|1|3] [--slalom 0|1]
//        [--graine 7] [--q "sans=camfx"] [--fmt couche|debout] [--rendu 0|1] [--saut 0 (s entre deux sauts du pilote)] [--pouce 1.5 (stick tactile simulé, bruit en px)] [--patch hoquet (essai du correctif du hoquet, dans la page du banc seulement)] [--http 9951] [--cdp 9952]
// Prendre le verrou du Mac AVANT (~/cash-car/verrou-banc.sh prendre "vib-sol"), le rendre APRÈS. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
/* LE SERVEUR À SONDE : le jeu vit dans une fonction fermée (ni `loop`, ni `s`, ni `psi` ne sont lisibles de la console). La page servie reçoit UNE ligne de plus,
   en tête de cette fonction : `window.__vibEval=function(c){return eval(c)}` — une sonde de lecture, qui ne change rien au jeu. Le fichier sur le disque n'est pas touché. */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
function serveur(dir, port) { const s = http.createServer((rq, rs) => { let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(dir, p);
    if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); }
      if (p === '/index.html') { let h = b.toString('utf8'); const k = h.indexOf('if(window.CC_COLONNE)return;'); if (k < 0) { rs.writeHead(500); return rs.end('sonde : ancre introuvable'); }
        b = Buffer.from(h.slice(0, k) + 'window.__vibEval=function(c){return eval(c);};' + h.slice(k), 'utf8'); }
      rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s))); }
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises', 'vib.json')); fs.mkdirSync(path.dirname(OUT), { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', MOTIF = A.motif || 'tel', N = +(A.n || 2400), MOTEUR = +(A.moteur || 10), NIT = +(A.nit || 0), GRAINE = +(A.graine || 7);
const P_HTTP = +(A.http || 9951), P_CDP = +(A.cdp || 9952);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* le hasard semé (mulberry32) : posé avant tout script de la page */
const SEME = `(function(){var a=${GRAINE}>>>0||1;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
/* les motifs de dt (ms) : le téléphone réel (boîte de vol du 15/11) tourne calé à 30 i/s, ~15 % d'images à 50 ms, ~2-7 % au-delà */
function motif(nom, n) { let a = GRAINE * 7919 + 13; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const E = 1000 / 60, o = [];
  for (let i = 0; i < n; i++) {
    if (nom === 'r60') o.push(E); else if (nom === 'r30') o.push(2 * E); else if (nom === 'r20') o.push(3 * E);
    else if (nom === 'alt') o.push(i % 2 ? 2 * E : E);
    else if (nom === 'webkit') o.push(i % 3 === 2 ? 34 : 33); /* l'horloge de WebKit arrondie à la milliseconde */
    else if (nom === 'r33') o.push(33);
    else if (nom === 'alt3050') o.push(i % 2 ? 3 * E : 2 * E);
    else if (nom === 'bascule') o.push(((i / 150) | 0) % 2 ? 2 * E : E);
    else if (nom === 'pointes') o.push(i % 90 === 45 ? 6 * E : i % 90 === 20 ? 4 * E : 2 * E);
    else { const r = rnd(); o.push(r < .80 ? 2 * E : r < .95 ? 3 * E : r < .985 ? 4 * E : r < .995 ? 6 * E : 9 * E); } /* tel */
  } return o; }
const PAGE = `(function(){
  var V=window.__vib={R:[],vt:performance.now(),err:[]};performance.now=function(){return V.vt;};
  var v=new THREE.Vector3(),q=new THREE.Quaternion(),qc=new THREE.Quaternion(),e=new THREE.Euler(),m=new THREE.Matrix4(),pv=new THREE.Vector3(),sc=new THREE.Vector3(),FA={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
  var pr=function(x){x.applyMatrix4(m).applyMatrix4(camera.projectionMatrix);return [(x.x*.5+.5)*innerWidth,(-x.y*.5+.5)*innerHeight];};
  var g=function(f){try{return f();}catch(x){return 0;}};
  /* LE POUCE (--pouce n) : au sol, le volant n'est plus celui du pilote de mesure mais un STICK TACTILE simulé : la même consigne, arrondie au pixel de la course (46 px)
     et bruitée de ±n px (le capteur grésille) — ce que la caisse reçoit d'une vraie main */
  V.pouce=0;V.lisse=0;V.a=12345;V.rnd=function(){V.a|=0;V.a=V.a+0x6D2B79F5|0;var t=Math.imul(V.a^V.a>>>15,1|V.a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  V.avant=function(){if(!(V.pouce>0)&&!V.lisse)return;
    if(mode!=='drive'){DBG_AUTO.on=true;TCTL.act=false;return;}
    var mA=vitMult(),tg=THREE.MathUtils.clamp((routeLacet+(THREE.MathUtils.clamp((DBG_AUTO.lat-lat)/(Math.max(6,Math.abs(vA)*SPD*mA)*.9),-.4,.4)-psi)*3)/(lacetMax(vA)*mA),-1,1);
    if(V.lisse){ /* LE VOLANT LISSE (+l) : l'anticipation du virage ne vient plus de routeLacet (mesuré par image, il porte le dt de l'image d'avant) mais de la GÉOMÉTRIE : l'angle entre les tangentes à s−3 et s+3 m */
      frameAt(Math.max(0,s-3),FA);v.copy(FA.t);frameAt(Math.min(L-1,s+3),FA);pv.crossVectors(v,FA.t);var w=Math.atan2(pv.dot(FA.n)*(side<0?-1:1),v.dot(FA.t))/6*Math.abs(vA)*SPD*mA;
      tg=THREE.MathUtils.clamp((w+(THREE.MathUtils.clamp((DBG_AUTO.lat-lat)/(Math.max(6,Math.abs(vA)*SPD*mA)*.9),-.4,.4)-psi)*1.2)/(lacetMax(vA)*mA),-1,1);
      DBG_AUTO.on=false;TCTL.act=true;TCTL.doigt=true;TCTL.pad=false;TCTL.st=tg;return;}
    var px=Math.round(tg*46+(V.rnd()*2-1)*V.pouce);DBG_AUTO.on=false;TCTL.act=true;TCTL.doigt=true;TCTL.pad=false;TCTL.st=THREE.MathUtils.clamp(px/46,-1,1);};
  V.pas=function(ms){
    try{V.avant();}catch(x){V.err.push('pouce '+x);}
    V.vt+=ms;var fr0=loop._fr|0;try{loop(V.vt);}catch(x){V.err.push(String(x));}cancelAnimationFrame(loop._raf);
    carGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);m.copy(camera.matrixWorld).invert();
    v.setFromMatrixPosition(carGroup.matrixWorld);var a=pr(v);
    v.set(0,1,0).applyMatrix4(carBody.matrixWorld);var b=pr(v);
    v.set(0,.5,2).applyMatrix4(carBody.matrixWorld);var c=pr(v);
    var d=[0,0];try{frameAt(Math.min(L-1,s+18),FA);v.copy(FA.p);d=pr(v);}catch(x){}
    carBody.matrixWorld.decompose(pv,q,sc);camera.matrixWorld.decompose(pv,qc,sc);q.premultiply(qc.invert());e.setFromQuaternion(q,'YXZ');
    v.setFromMatrixPosition(carGroup.matrixWorld).applyMatrix4(m);
    V.R.push([ms,(loop._fr|0)-fr0,mode==='drive'?0:mode==='fall'?1:2,s,lat,psi,vA,steer,hopY,a[0],a[1],b[0],b[1],c[0],c[1],e.y*57.2958,e.x*57.2958,e.z*57.2958,v.x,v.y,v.z,camera.fov,
      carGroup.position.x,carGroup.position.y,carGroup.position.z,camera.position.x,camera.position.y,camera.position.z,carRoll9,susY,pitch9,g(function(){return driftYaw}),slipB,yawR,g(function(){return shake}),nitroOn?1:0,
      g(function(){return routeLacet}),L,g(function(){return runStats.zones|0}),d[0],d[1],g(function(){return CAD.on?1:0}),side,g(function(){return camLean}),g(function(){return CAM_ROUTE.phi}),g(function(){return FR.lift}),
      qc.x,qc.y,qc.z,qc.w,g(function(){return levreY}),g(function(){return SCOUP.p}),g(function(){return loop._viseR}),g(function(){return fovPunch}),g(function(){return NFX.ign}),carBody.scale.y,g(function(){return CGOR.gy}),g(function(){return CGOR.n}),g(function(){return TCTL.act?1:0})]);
  };
  V.serie=function(a){for(var i=0;i<a.length;i++){if(mode==='drive'&&s>L-320)return -1;V.pas(a[i]);}return V.R.length;}; /* on s'arrête avant le portail : son passage attend des minuteries réelles */
  return 1;})()`;
const COLS = ['ms', 'calc', 'mode', 's', 'lat', 'psi', 'vA', 'steer', 'hopY', 'ax', 'ay', 'bx', 'by', 'cx', 'cy', 'lacet', 'tangage', 'roulis', 'vx', 'vy', 'vz', 'fov',
  'px', 'py', 'pz', 'cpx', 'cpy', 'cpz', 'carRoll', 'susY', 'pitch', 'driftYaw', 'slipB', 'yawR', 'shake', 'nitro', 'routeLacet', 'L', 'zone', 'rx', 'ry', 'cad', 'side', 'camLean', 'camPhi', 'frLift',
  'qx', 'qy', 'qz', 'qw', 'levreY', 'scoup', 'viseR', 'fovPunch', 'nfxIgn', 'scaleY', 'cgorGy', 'cgorN', 'tctl'];

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [];
  const g = (code, ms) => c.ev('__vibEval(' + JSON.stringify(code) + ')', ms); /* évalué DANS la fonction du jeu */
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: +(A.dpr || 1), mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: SEME + 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=${A.prebati || 0}&appareil=iPhone14,2&carte=${CARTE}&pistegraine=${GRAINE}` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    let pret = false;
    for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    await dormir(1500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(1500);
    let ok = false;
    for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    /* la boucle à la main, l'horloge virtuelle, le rendu coupé (les matrices de la caméra sont posées par loop, pas par le dessin) */
    await g(`window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:${NIT},vol:1${A.saut ? ',saut:' + (+A.saut) + ',imp:' + (+(A.imp || 14)) : ''}});try{dbgImmortel(true)}catch(e){};1`);
    if (A.rendu !== '1') await g("(function(){try{renderer.render=function(){};}catch(e){}try{if(typeof composer!=='undefined'&&composer)composer.render=function(){};}catch(e){}return 1})()");
    await g(PAGE);
    if (A.patch === 'hoquet') console.log('patch hoquet :', await g(`(function(){var a="const d=Math.min(dt,1/30);CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;",b="const d=Math.min(dt,1/30),n9=Math.max(1,Math.ceil(d/.009)),h9=d/n9;for(let i9=0;i9<n9;i9++){CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*h9;CGOR.gy+=CGOR.gv*h9;}",s=cgorTick.toString();if(s.indexOf(a)<0)return 'ligne introuvable';eval('cgorTick='+s.replace(a,b));return 'posé (sous-pas de 9 ms au plus)';})()`)); /* ESSAI DE CORRECTIF, dans la page du banc seulement : le même ressort, en sous-pas */
    if (MOTIF !== 'cad') await g("try{CAD.ok=0;CAD.on=false;HC.on=false;}catch(e){};1"); /* aucune image d'écran sautée par le jeu : le motif EST la suite des images calculées */
    let mot = 0; for (let i = 0; i < MOTEUR; i++) { try { mot = await g('dbgMoteur()'); } catch (e) { mot = String(e).slice(0, 80); } await g('__vib.serie([33.33,33.33,33.33,33.33])'); }
    await g(`__vib.serie(${JSON.stringify(new Array(120).fill(33.33))});__vib.R.length=0;1`, 240000); /* 4 s d'élan, hors relevé */
    console.log('moteur', mot, '| état', JSON.stringify(await g("JSON.stringify({m:mode,s:Math.round(s),kmh:Math.round(Math.abs(vA)*3.6*SPD),L:Math.round(L),NP:NP,pas:+(L/(NP-1)).toFixed(3),demi:ROAD_HALF,lieu:LVL.cur&&LVL.cur.id,cad:CAD.on,por:POR,over:gameOver,paused:paused})")));
    if (A.pouce) await g(`__vib.pouce=${+A.pouce};1`);
    /* LE PROGRAMME (--prog "tel:1500,r30:900,tel+p1.5:900") : plusieurs motifs à la suite dans la même course ; +pN = le pouce simulé (bruit N px) ; +s = slalom ; +l = volant lisse (anticipation par la géométrie) ; sans --prog : --motif × --n */
    const PROG = (A.prog || (MOTIF + (A.pouce ? '+p' + A.pouce : '') + (A.slalom === '1' ? '+s' : '') + ':' + N)).split(',').map(x => { const [m, n] = x.split(':'), o = m.split('+'); return { nom: m, motif: o[0], n: +n, pouce: +((o.find(y => /^p[\d.]+$/.test(y)) || 'p0').slice(1)), slalom: o.includes('s'), lisse: o.includes('l') }; });
    const T0 = Date.now(), segs = []; let fait = 0;
    for (const P of PROG) { const D = motif(P.motif, P.n); segs.push({ nom: P.nom, i0: fait, n: P.n });
      await g(`__vib.pouce=${P.pouce};__vib.lisse=${P.lisse ? 1 : 0};if(!${P.pouce}&&!${P.lisse ? 1 : 0}){DBG_AUTO.on=true;TCTL.act=false;}DBG_AUTO.lat=0;1`);
      for (let i = 0; i < P.n; i += 200) {
        if (P.slalom) await g(`DBG_AUTO.lat=${(((i / 200) | 0) % 2 ? -1 : 1) * .45}*ROAD_HALF;1`);
        if (await g(`__vib.serie(${JSON.stringify(D.slice(i, i + 200))})`, 600000) < 0) break;
        if (i % 800 === 0) console.log('…', P.nom, i, JSON.stringify(await g("JSON.stringify({m:mode,s:Math.round(s),kmh:Math.round(Math.abs(vA)*3.6*SPD),z:runStats.zones|0,lieu:LVL.cur&&LVL.cur.id,over:gameOver})")), ((Date.now() - T0) / 1000).toFixed(0) + ' s');
      } const f9 = await g('__vib.R.length'); segs[segs.length - 1].n = f9 - fait; fait = f9; }
    const R = await c.ev('JSON.stringify(__vib.R)', 240000), err = await c.ev('JSON.stringify(__vib.err.slice(0,8))');
    const meta = JSON.parse(await g("JSON.stringify({pas:L/(NP-1),demi:ROAD_HALF,lieu:LVL.cur&&LVL.cur.id,por:POR,W:innerWidth,H:innerHeight,v:(typeof CC_VER==='string'?CC_VER:'?')})"));
    fs.writeFileSync(OUT, JSON.stringify({ segs, motif: PROG.map(p => p.nom).join(','), carte: CARTE, moteur: MOTEUR, nit: NIT, graine: GRAINE, q: A.q || '', fmt: FMT, meta, cols: COLS, err: JSON.parse(err), exc: exc.slice(0, 8), R: JSON.parse(R) }));
    console.log('écrit', OUT, JSON.parse(R).length, 'images | erreurs', err, exc.length);
  } catch (e) { console.error('ÉCHEC', e.message, exc.slice(0, 3)); process.exitCode = 1; }
  finally { fin(); }
  setTimeout(() => process.exit(), 300);
})();
