// LE BANC DES VIBRATIONS — angle LE TEMPS et LA CAMÉRA (2026-11-15, Sacha : « la voiture a toujours des vibrations à certains moments, sur route et en l'air »).
// Un Chrome sans fenêtre et muet, iPhone 13 Pro émulé (?appareil=iPhone14,2). L'HORLOGE EST VIRTUELLE : performance.now() est remplacé par une horloge que le banc
// avance lui-même (dt imposé au centième de milliseconde, rien ne dépend de la charge du Mac), rAF est coupé, le rendu est remplacé par rien (on mesure des POSITIONS).
// À chaque image : carGroup et carBody (monde), la caméra, et la caisse DANS LE REPÈRE DE LA CAMÉRA (position écran en px CSS, cap/tangage/roulis relatifs, distance).
// Des « passes » se suivent dans la même course, chacune avec sa suite de dt :
//   r33 (33,00 régulier : le dbgStep(1,33) des autres bancs) · r32 ·
//   r60 (16,67 régulier) · r30 (33,33 régulier) · alt (16,67 / 33,33 alternés) · tel (tirage sur l'histogramme du vrai 13 Pro, vol-1115-1546 : 82 % 28-34,5 ms,
//   14 % 35-46, 2 % 22-26, 1 % 51-100) · bascule (2 s à 60, 2 s à 30) · pointe (33,33 + une image de 80 ms toutes les 40) · r42 (41,67 régulier) · r50 (50 régulier)
//   node outils/banc-vibration/cadence.cjs --out <dossier> [--carte nuages] [--fmt couche|debout] [--passes r30,tel,r60,alt,bascule,pointe] [--n 600] [--tours 2]
//        [--moteur 8] [--nit 0|1|2|3] [--saut 0 (secondes de route entre deux sauts, 0 = jamais)] [--imp 30] [--zig 1 (le pilote change de ligne toutes les 1,5 s)]
//        [--q "sans=dyn"] [--patch fichier.cjs (correctif D'ESSAI appliqué à la copie servie, jamais au dépôt)] [--tag x] [--graine 7] [--http 9951] [--cdp 9952]
// Prendre le verrou du Mac AVANT (~/cash-car/verrou-banc.sh prendre "vib-cadence"), le rendre APRÈS. Analyse : node outils/banc-vibration/analyse.cjs <fichier.json>
const fs = require('fs'), path = require('path'), http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'couche', [W, H] = FMT === 'debout' ? [390, 844] : [844, 390];
const CARTE = A.carte || 'nuages', N = +(A.n || 600), TOURS = +(A.tours || 2), MOTEUR = A.moteur == null ? -1 : +A.moteur, NIT = +(A.nit || 0), SAUT = +(A.saut || 0), IMP = +(A.imp || 30), ZIG = A.zig === '1';
const PASSES = (A.passes || 'r30,tel,r60,alt').split(','), GRAINE = +(A.graine || 7);
const TAG = (A.tag || 'cad') + '-' + FMT + '-' + CARTE + (MOTEUR >= 0 ? '-m' + MOTEUR : '') + (NIT ? '-n' + NIT : '') + (SAUT ? '-saut' + SAUT : '') + (ZIG ? '-zig' : '');
const P_HTTP = +(A.http || 9951), P_CDP = +(A.cdp || 9952);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };

/* le serveur : VERSION PRINCIPALE telle quelle, ou index.html passé par un correctif d'essai (--patch : un module qui exporte (html) => html) */
function serveur(dir, port, patch) {
  let idx = null;
  if (patch) { const f = require(path.resolve(patch)); const src = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'); idx = f(src); if (idx === src) throw new Error('le correctif d\'essai n\'a rien changé'); }
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(dir, p); if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    if (idx && p === '/index.html') { rs.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' }); return rs.end(idx); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}

/* les suites de dt (ms) : tirage à graine fixe, la même suite à chaque lancement */
function alea(g) { let a = g >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function suite(nom, n, g) {
  const r = alea(1000 + g), o = [];
  for (let i = 0; i < n; i++) {
    if (nom === 'r60') o.push(1000 / 60); else if (nom === 'r30') o.push(1000 / 30); else if (nom === 'r42') o.push(1000 / 24); else if (nom === 'r33') o.push(33); else if (nom === 'r32') o.push(32); else if (nom === 'r50') o.push(50);
    else if (nom === 'alt') o.push(i % 2 ? 1000 / 30 : 1000 / 60);
    else if (nom === 'bascule') o.push(((i / 90) | 0) % 2 ? 1000 / 30 : 1000 / 60);
    else if (nom === 'pointe') o.push(i % 40 === 39 ? 80 : 1000 / 30);
    else if (nom === 'tel') { const u = r(); o.push(u < .82 ? 28 + 6.5 * (.5 + (r() + r() + r() - 1.5) / 3 * 1.2) + 2.2 : u < .96 ? 35 + 11 * r() : u < .98 ? 22 + 4 * r() : 51 + 49 * r() * r()); }
    else if (nom === 'tel8') { const u = r(); o.push(u < .82 ? 100 / 3 : u < .96 ? 125 / 3 : u < .98 ? 25 : 200 / 3); } /* le même tirage, calé sur la grille de 8,33 ms d'un écran 120 Hz */
    else throw new Error('passe inconnue : ' + nom);
  }
  return o.map(x => +x.toFixed(3));
}

/* dans la page : l'horloge virtuelle, le pas, la sonde */
const INSTALLE = `(function(){
  if(window.__vib)return 1;
  var V=window.__vib={t:performance.now(),rows:[],nApp:0,tz:0};
  performance.now=function(){V.nApp++;return V.t+=1e-4;}; /* l'horloge n'avance que du pas imposé (+0,1 µs par lecture : aucune boucle « tant que le temps… » ne tourne à vide) */
  window.requestAnimationFrame=function(){return 0;};
  var S=dbgScene(),carGroup=S.car,camera=S.cam;
  try{S.rdr.render=function(){};}catch(e){} /* rien n'est dessiné (le composeur de bloom appelle le même render) */
  var a=new THREE.Vector3(),q=new THREE.Quaternion(),qc=new THREE.Quaternion(),e=new THREE.Euler(),mi=new THREE.Matrix4();
  function corps(){var m=null,n=-1;for(var i=0;i<carGroup.children.length;i++){var c=carGroup.children[i],k=0;c.traverse(function(){k++;});if(k>n){n=k;m=c;}}return m||carGroup;} /* la carrosserie = l'enfant le plus fourni de carGroup */
  function ecr(o,x,y,z){a.set(x,y,z);o.localToWorld(a);a.project(camera);return [+(((a.x*.5+.5)*innerWidth)).toFixed(3),+(((-a.y*.5+.5)*innerHeight)).toFixed(3)];}
  function rel(o){o.getWorldQuaternion(q);qc.copy(camera.quaternion).invert();q.premultiply(qc);e.setFromQuaternion(q,'YXZ');return [+(e.y*57.29578).toFixed(4),+(e.x*57.29578).toFixed(4),+(e.z*57.29578).toFixed(4)];}
  V.sonde=function(dt,passe){
    var B=corps(),E=dbgState();
    carGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    mi.copy(camera.matrixWorldInverse);a.set(0,.6,0);carGroup.localToWorld(a);a.applyMatrix4(mi);
    var cx=+a.x.toFixed(4),cy=+a.y.toFixed(4),cz=+a.z.toFixed(4),kmh=0;try{kmh=dbgRubans().kmh|0;}catch(x){}
    var p=carGroup.position,cp=camera.position;
    V.rows.push({p:passe,dt:dt,m:E.mode==='drive'?0:E.mode==='fall'?1:2,s:E.s,lat:E.lat,k:kmh,st:E.steer,
      c:ecr(carGroup,0,.6,0),n:ecr(carGroup,0,.6,2),h:ecr(carGroup,0,1.6,0),b:ecr(B,0,.6,0),
      r:rel(carGroup),rb:rel(B),cam:[cx,cy,cz],fov:+camera.fov.toFixed(3),
      w:[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)],cw:[+cp.x.toFixed(3),+cp.y.toFixed(3),+cp.z.toFixed(3)],
      by:+B.position.y.toFixed(4),ech:+B.scale.y.toFixed(5),t:ecr(B,0,1.2,0),rl:E.roulisDeg,dy:E.glisseDeg,hop:E.hopY,ft:E.fallT,eng:E.engTier});
  };
  V.pas=function(dts,passe,opt){opt=opt||{};
    for(var i=0;i<dts.length;i++){V.t+=dts[i];
      if(opt.zig){var k=Math.floor(V.tz/1.5)%4;if(k!==V.zk){V.zk=k;dbgAuto(1,0,{latK:[.55,-.55,.2,-.6][k],nit:opt.nit|0,vol:1});}}
      V.tz+=dts[i]/1000;
      dbgStep(1,dts[i]);
      if(passe)V.sonde(dts[i],passe);}
    return V.rows.length;};
  return 2;})()`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP, A.patch), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true, screenWidth: W, screenHeight: H }); /* DPR 1 : rien n'est dessiné, on ne lit que des positions en px CSS */
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){};(function(){var a=' + (12345 + GRAINE) + ';Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&appareil=iPhone14,2&carte=${CARTE}&pistegraine=${GRAINE}` + (A.q ? '&' + A.q : '');
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
    console.log('installe', await c.ev(INSTALLE));
    await c.ev(`dbgCadence(60);dbgAuto(1,0,{nit:${NIT},vol:1,saut:${SAUT},imp:${IMP}});try{dbgImmortel(true)}catch(e){};try{dbgPin(true)}catch(e){};1`); /* dbgCadence(60) : aucune image sautée par le jeu, c'est le banc qui impose les dt (30 i/s = des pas de 33 ms) */
    const etat = async () => JSON.parse(await c.ev("JSON.stringify((function(){var E=dbgState(),k=0;try{k=dbgRubans().kmh|0}catch(e){};return {m:E.mode,s:Math.round(E.s),k:k,go:E.gameOver,pa:E.paused,run:E.running,eng:E.engTier,cad:dbgPerf().cad,noShake:window.dbgNoShake}})())"));
    /* la mise en vitesse : 14 s de course à 30 i/s, sans relevé */
    for (let k = 0; k < 6; k++) await c.ev(`__vib.pas(${JSON.stringify(suite('r30', 70, 0))},null,{zig:${ZIG},nit:${NIT}})`, 240000);
    for (let k = 0; MOTEUR >= 0 && k < 30; k++) { const e = await etat(); if (e.eng >= MOTEUR || e.go) break; await c.ev('dbgMoteur();1'); await c.ev(`__vib.pas(${JSON.stringify(suite('r30', 45, 0))},null,{zig:${ZIG},nit:${NIT}})`, 240000); } /* monter le moteur palier par palier (la vraie scène), 1,5 s entre deux */
    console.log('départ', JSON.stringify(await etat()));
    const journal = [];
    for (let t = 0; t < TOURS; t++) for (const nom of PASSES) {
      const dts = suite(nom, N, t * 17 + PASSES.indexOf(nom));
      await c.ev(`__vib.pas(${JSON.stringify(suite('r30', 30, 0))},null,{zig:${ZIG},nit:${NIT}})`, 240000); /* une seconde de raccord, sans relevé */
      for (let i = 0; i < dts.length; i += 150) await c.ev(`__vib.pas(${JSON.stringify(dts.slice(i, i + 150))},${JSON.stringify(nom + '#' + t)},{zig:${ZIG},nit:${NIT}})`, 240000);
      const e = await etat(); journal.push({ passe: nom + '#' + t, fin: e }); console.log(nom + '#' + t, JSON.stringify(e));
      if (e.go || !e.run) { console.log('course finie, arrêt'); t = TOURS; break; }
    }
    const rows = JSON.parse(await c.ev('JSON.stringify(__vib.rows)', 120000));
    const pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()");
    const f = path.join(OUT, TAG + '.json');
    fs.writeFileSync(f, JSON.stringify({ tag: TAG, fmt: FMT, W, H, carte: CARTE, moteur: MOTEUR, nit: NIT, saut: SAUT, zig: ZIG, q: A.q || '', patch: A.patch || '', journal, pannes, exceptions: exc.slice(0, 8), rows }));
    console.log("fichier", f, rows.length, "images ; exceptions", JSON.stringify(exc.slice(0, 3)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
