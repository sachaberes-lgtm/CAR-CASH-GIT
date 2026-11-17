// LE BANC DU MOTEUR QUI SE TAIT (2026-11-17, lot qualite/sansmoteur — Sacha : « on peut enlever le son du moteur on l'entend presque pas le son du nitro est amplement suffisant »).
// Le vrai jeu, édition téléphone (?tel=1, 390×844 ×2, toucher émulé), dans UN Chrome sans fenêtre et MUET, sauvegarde SON/MUSIQUE/VOIX COUPÉS (le contexte audio reste suspendu :
// aucun son ne peut sortir). Le graphe audio se mesure par COMPTEURS posés avant le chargement (prototypes de WebAudio) et par la couverture précise de V8 (appels par fonction).
// Parcours de chaque variante : menu → garage + burn-out → départ → course (pilote auto, nitro) → 2 changements de moteur → ⏸ et reprise → arrière-plan et retour →
// réanimation (bon de seconde chance) → mort → retour au menu par le garage.
// Variantes : base (index-base.html = HEAD avant le lot), plus (?plus=moteurson), defaut, drapeaux (?moteurvivant=1&moteur=buche&nitro=physique, sans le son du moteur).
//   node outils/banc-sansmoteur/parcours.cjs [--var base,plus,defaut,drapeaux] [--http 9961 --cdp 9962] [--images 300]
// ⚠ Prendre le verrou commun avant (~/cash-car/verrou-banc.sh prendre sansmoteur), le rendre après.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const REPLI = path.resolve(A.repli || path.join(os.homedir(), 'cash-car', 'qualite', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962), W = 390, H = 844, IMG = +(A.images || 300);
const VARS = (A.var || 'base,plus,defaut,drapeaux').split(',');
const DEF = { base: ['index-base.html', ''], plus: ['index.html', 'plus=moteurson'], defaut: ['index.html', ''], drapeaux: ['index.html', 'moteurvivant=1&moteur=buche&nitro=physique'] };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { chanceG: 0, v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
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
/* LES COMPTEURS, posés avant tout script de la page */
const SONDE = `(function(){if(window.__ccA)return;var C=window.__ccA={cree:{},connect:0,disconnect:0,start:0,stop:0,boucles:0,addModule:[],bufN:0,bufEch:0,decode:0,ctx:0,initMs:null,init:null};
var BA=window.BaseAudioContext||window.AudioContext,P=BA.prototype;
Object.getOwnPropertyNames(P).forEach(function(k){if(!/^create/.test(k))return;var d=Object.getOwnPropertyDescriptor(P,k);if(!d||typeof d.value!=='function')return;var o=d.value;
  P[k]=function(){C.cree[k]=(C.cree[k]||0)+1;if(k==='createBuffer'){C.bufN++;C.bufEch+=(arguments[0]|0)*(arguments[1]|0);}return o.apply(this,arguments);};});
var dA=P.decodeAudioData;P.decodeAudioData=function(){C.decode++;return dA.apply(this,arguments);};
var N=AudioNode.prototype,oc=N.connect,od=N.disconnect;N.connect=function(){C.connect++;return oc.apply(this,arguments);};N.disconnect=function(){C.disconnect++;return od.apply(this,arguments);};
var S=AudioScheduledSourceNode.prototype,os=S.start,ost=S.stop;
S.start=function(){C.start++;if(!this.__st){this.__st=1;C.boucles++;}return os.apply(this,arguments);};
S.stop=function(){C.stop++;if(this.__st===1){this.__st=2;C.boucles--;}return ost.apply(this,arguments);};
if(window.AudioWorklet){var am=AudioWorklet.prototype.addModule;AudioWorklet.prototype.addModule=function(u){C.addModule.push(String(u).split('/').slice(-2).join('/'));return am.apply(this,arguments);};}
var A0=window.AudioContext;if(A0){var A1=function(o){C.ctx++;var t0=performance.now(),a=new A0(o);
  Promise.resolve().then(function(){C.initMs=+(performance.now()-t0).toFixed(1);var n=0;for(var k in C.cree)n+=C.cree[k];C.init={noeuds:n,cree:JSON.parse(JSON.stringify(C.cree)),connect:C.connect,boucles:C.boucles,bufN:C.bufN,bufEch:C.bufEch};});return a;};
  A1.prototype=A0.prototype;window.AudioContext=A1;try{window.webkitAudioContext=A1;}catch(e){}}
/* les longues tâches (> 50 ms) : le gel du changement de moteur */
C.swap=[];var sT=window.setTimeout;window.setTimeout=function(f){if(typeof f==='function'&&/engSwapArme|engSwapSnd/.test(String(f))){var g=f;arguments[0]=function(){var t0=performance.now();try{return g.apply(this,arguments);}finally{C.swap.push(+(performance.now()-t0).toFixed(1));}};}return sT.apply(window,arguments);};
C.longues=[];try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){C.longues.push([Math.round(e.startTime),Math.round(e.duration)]);});}).observe({entryTypes:['longtask']});}catch(e){}})();`;
const FNS = ['engSndParams', 'engApplique', 'engLoadStep', 'engSouffle', 'engGenou', 'regMoteur', 'regApres', 'engSetTier', 'engWave9', 'engCurve', 'crackle', 'stt', 'MV.drive', 'MB.drive', 'MB.avant', 'MB.apres', 'regPas', 'regEquilibre', 'gomPas', 'rugPas', 'subBoom', 'noiseBurst'];
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const PROF = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-sansmoteur-'));
  const srv = await serveur(P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let erreurs = [], reseau = new Map();
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console : ' + JSON.stringify(m.params.args.map(a => a.value || a.description)).slice(0, 300));
    if (m.method === 'Network.requestWillBeSent') reseau.set(m.params.requestId, { u: m.params.request.url.replace(/^https?:\/\/[^/]+\//, '').split('?')[0], o: 0 });
    if (m.method === 'Network.loadingFinished' && reseau.has(m.params.requestId)) reseau.get(m.params.requestId).o = m.params.encodedDataLength; } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} };
  const ev = async (e, t) => { try { return await c.ev(e, t || 30000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 200); } };
  let pasErr = null; const pas = async n => { for (let k = 0; k < n; k += 30) { const r = await ev('dbgStep(' + Math.min(30, n - k) + ',16);1', 120000); if (r !== 1 && !pasErr) { pasErr = String(r).slice(0, 300); console.error('dbgStep :', pasErr); } } };
  const attend = async (expr, ms, step) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await ev(expr)) === true) return true; if (step) await pas(step); else await dormir(400); } return false; };
  const compte = () => ev('JSON.stringify(window.__ccA)').then(s => { try { return JSON.parse(s); } catch (e) { return s; } });
  const touche = async (sel) => { const r = await ev(`(function(){var e=document.getElementById('${sel}');if(!e)return null;var b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2,b.width]})()`);
    if (!Array.isArray(r) || !r[2]) return false; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1], id: 1 }] }); await dormir(70);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true; };
  const etat = "(function(){var s=dbgState();return {st:s.started,run:s.running,go:s.gameOver,pa:s.paused,mode:s.mode,garage:typeof garageOn!=='undefined'?garageOn:null}})()";
  const couverture = async () => { const r = await c.send('Profiler.takePreciseCoverage'); const o = {};
    for (const sc of r.result) for (const f of sc.functions) if (FNS.includes(f.functionName)) o[f.functionName] = (o[f.functionName] || 0) + (f.ranges[0] ? f.ranges[0].count : 0);
    return o; };
  const sortie = {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Profiler.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}' + SONDE });
    for (const V of VARS) {
      const [page, q] = DEF[V]; erreurs = []; reseau = new Map(); const o = sortie[V] = { etapes: {} };
      const t00 = Date.now(); const note = (k, x) => { o.etapes[k] = x; console.error(V, k, typeof x === 'string' ? x : JSON.stringify(x).slice(0, 400)); };
      try { await c.send('Profiler.startPreciseCoverage', { callCount: true, detailed: false }); } catch (e) {}
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/${page}?colonne=0&tel=1&garde=1&intro=ancien&attente=0&chute=0&v=${Date.now()}${q ? '&' + q : ''}` });
      o.pret = await attend("!!window.__gameReady&&typeof dbgState==='function'", 300000);
      await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()");
      await dormir(6000);
      o.contexte = await ev('typeof AC!=="undefined"&&AC?AC.state:null');
      note('menu', { etat: await ev(etat), compte: await compte() });
      /* le garage et l'essai d'une voiture : le burn-out */
      await ev("(function(){var b=document.getElementById('garageBtn');if(b)b.click();return 1})()"); await dormir(3000);
      note('garage', { etat: await ev(etat), burn: await ev("JSON.stringify(dbgBurn(2))") });
      await dormir(3500); note('burnout', { burn: await ev("(function(){var b=dbgBurn();return {on:b.on,rpm:b.rpm,k:b.k,feu:b.feu,fumee:b.fumee}})()") });
      await ev('dbgBurn(0);1'); await dormir(1500);
      /* le départ */
      let enCourse = false;
      for (let essai = 0; essai < 3 && !enCourse; essai++) { await ev('dbgJouer()'); enCourse = await attend("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver&&s.mode==='drive')})()", 25000); }
      note('depart', { enCourse, etat: await ev(etat) });
      await ev('dbgImmortel(true);dbgAuto(true,0,{vol:true,nit:1});1'); await pas(120);
      await couverture(); const fr0 = await ev('dbgJsImage().fr'); const tC0 = Date.now(); await pas(IMG); const nImg = (await ev('dbgJsImage().fr')) - fr0; const cov = await couverture();
      const fr = {}; for (const k in cov) fr[k] = +(cov[k] / Math.max(1, nImg)).toFixed(2);
      note('course', { images: nImg, pasErr, ms: Date.now() - tC0, appelsParImage: fr, etat: await ev(etat), compte: await compte(), audio: await ev("JSON.stringify(dbgAudio&&dbgAudio())").then(s => { try { const a = JSON.parse(s); return { eng: a.eng, gear: a.gear, rpm: a.rpm, palier: a.palier }; } catch (e) { return s; } }),
        regie: await ev("(function(){var r=dbgRegie();return {ok:r.ok,attention:r.attention,dosage:r.dosage,gains:r.gains}})()"), vu: await ev("(function(){try{return Object.keys(dbgVu()).join(',')}catch(e){return String(e)}})()") });
      /* deux changements de moteur (la carte, son moteur.palier) */
      const tL0 = await ev('performance.now()'); const m1 = await ev('dbgMoteur()'); await pas(90); const m2 = await ev('dbgMoteur()'); await pas(150);
      const lg = await ev('JSON.stringify(window.__ccA.longues.filter(function(x){return x[0]>=' + tL0 + '}))').then(s => { try { return JSON.parse(s); } catch (e) { return s; } });
      note('moteurs', { m1, m2, swapMs: await ev('JSON.stringify(window.__ccA.swap)'), longues: lg, pireMs: Array.isArray(lg) && lg.length ? Math.max(...lg.map(x => x[1])) : 0, audio: await ev("(function(){var a=dbgAudio();return {palier:a.palier,gear:a.gear,rpm:a.rpm}})()"), etat: await ev(etat) });
      /* ⏸ puis reprise */
      const tp = await touche('tGear'); await pas(2); const ep = await ev(etat);
      await ev("(function(){var p=document.getElementById('tPanel');if(p)p.classList.remove('open','sortant');try{dbgLumReprise();}catch(e){}return 1})()"); await pas(40);
      note('pause', { touche: tp, pendant: ep, apres: await ev(etat) });
      /* arrière-plan, retour */
      await ev("Object.defineProperty(document,'hidden',{configurable:true,get:function(){return true}});Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return 'hidden'}});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));document.dispatchEvent(new Event('pause'));1");
      await dormir(1500);
      await ev("Object.defineProperty(document,'hidden',{configurable:true,get:function(){return false}});Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return 'visible'}});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));document.dispatchEvent(new Event('resume'));1");
      await dormir(500); const eb = await ev(etat);
      await ev("(function(){var p=document.getElementById('tPanel');if(p)p.classList.remove('open','sortant');try{dbgLumReprise();}catch(e){}return 1})()"); await pas(60);
      note('arrierePlan', { auRetour: eb, apres: await ev(etat) });
      /* la réanimation (un bon de seconde chance), puis la vraie mort */
      await ev("dbgImmortel(false);dbgChance('bon',1);dbgChance('mort');1"); await pas(240);
      note('reanimation', { etat: await ev(etat), chance: await ev("(function(){var c=dbgChance();return {used:c.used,bons:c.bons}})()") });
      await ev("dbgDauphin('boom');1"); const mort = await attend('dbgState().gameOver', 20000, 20);
      await dormir(3000); note('mort', { gameOver: mort, etat: await ev(etat) });
      await ev("(function(){var b=document.getElementById('bdGar2');if(b)b.click();return 1})()"); await dormir(4000);
      note('menuRetour', { etat: await ev(etat), compte: await compte() });
      o.reseauMoteur = [...reseau.values()].filter(r => /moteur|worklet|buche|cyber|vivant/i.test(r.u));
      o.reseauAudio = { n: [...reseau.values()].filter(r => /audio|sons-banque|sfx/i.test(r.u)).length, octets: [...reseau.values()].filter(r => /audio|sons-banque|sfx/i.test(r.u)).reduce((a, r) => a + r.o, 0) };
      o.erreurs = erreurs.slice(0, 30); o.nErreurs = erreurs.length; o.s = Math.round((Date.now() - t00) / 1000);
      try { await c.send('Profiler.stopPreciseCoverage'); } catch (e) {}
      try { const q9 = fs.readFileSync('/private/tmp/cashcar-banc.lock/qui', 'utf8').trim().split(' '); if (q9[2] === 'sansmoteur') fs.writeFileSync('/private/tmp/cashcar-banc.lock/qui', q9[0] + ' ' + Math.floor(Date.now() / 1000) + ' sansmoteur\n'); } catch (e) {} /* le verrou reste frais */
    }
  } catch (e) { sortie.echec = String(e && e.stack || e); }
  console.log(JSON.stringify(sortie, null, 1));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
