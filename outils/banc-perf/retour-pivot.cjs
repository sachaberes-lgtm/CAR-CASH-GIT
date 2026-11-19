// LE BANC DU RETOUR + PIVOT (2026-11-17, lot qualité « retourpivot » — les gels « hors boucle » des builds 117-119 démarrent après un retour d'arrière-plan
// long SUIVI d'un pivot, et durent jusqu'à la fin de la séance : un ÉTAT de la page est fautif). Chrome n'est pas WebKit : on compare l'ÉTAT, pas les ms.
// UN Chrome sans fenêtre et muet, iPhone émulé 390×844 ×3 (UA iPhone → TEL_NATIF, ?appareil=iPhone14,2 → profil), une vraie course au pilote (dbgAuto, rAF réel).
// Avant le chargement, un relevé est posé (__RP) : écouteurs (type, cible, pile ; dédoublonnés comme le DOM), rAF en attente et rappels par image, minuteries,
// intervalles, toiles créées (taille, contexte). Puis N fois : arrière-plan simulé (visibilité cachée + visibilitychange + `pause` de Capacitor + gel du cycle de vie)
// pendant --bg s, retour (visible + `resume`), pivot 2 s après (setDeviceMetricsOverride couché), reprise de la course, relevé ; pivot inverse, relevé. L'arrière-plan = Debugger.pause (le JS s'arrête net).
//   node outils/banc-perf/retour-pivot.cjs --out <dossier> [--n 5] [--bg 90] [--bgn 65] [--q "perfrec=2"] [--gel 150 (un gel provoqué avant chaque relevé)] [--sonde "<expr>"] [--http 9951] [--cdp 9952] [--tag x]
//   Avec --q perfrec=2 : la boîte de vol (courses rangées) et les notes « toile » du mouchard sont relues à la fin (<tag>-vol.json, <tag>-notes.json).
// Prendre le verrou (sh ~/cash-car/verrou-banc.sh prendre "retourpivot") AVANT, le rendre APRÈS. Chrome est fermé à la fin.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises-retourpivot')); fs.mkdirSync(OUT, { recursive: true });
const N = +(A.n || 5), BG = +(A.bg || 90), BGN = +(A.bgn || 65), TAG = A.tag || 'rp';
const P_HTTP = +(A.http || 9951), P_CDP = +(A.cdp || 9952);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* LE RELEVÉ, posé avant toute ligne du jeu */
const RELEVE = `(function(){if(window.__RP)return;
 const R=window.__RP={ec:new Map(),id:0,raf:new Map(),TO:new Map(),IV:new Map(),cv:[],brut:{},ts:-1,par:{},max:{},vis:null};
 const pile=function(){return (new Error().stack||'').split('\\n').slice(2,8).map(function(l){return l.trim().replace(/^at /,'');}).join(' < ');};
 const nomC=function(t){try{if(t===window)return 'window';if(t===document)return 'document';if(window.visualViewport&&t===visualViewport)return 'visualViewport';if(t instanceof Element)return t.tagName.toLowerCase()+(t.id?'#'+t.id:'');return (t&&t.constructor&&t.constructor.name)||'?';}catch(e){return '?';}};
 const capt=function(o){return typeof o==='boolean'?o:!!(o&&o.capture);};
 const K=new WeakMap(),ET=EventTarget.prototype,aE=ET.addEventListener,rE=ET.removeEventListener;
 const ote=function(cib,t,fn,c){const m=K.get(cib);if(!m)return;const s=m.get(t+'|'+c);if(s&&s.has(fn)){R.ec.delete(s.get(fn).id);s.delete(fn);}};
 ET.addEventListener=function(t,fn,o){if(fn){const kb=t+' @'+nomC(this)+' :: '+pile();R.brut[kb]=(R.brut[kb]||0)+1;let m=K.get(this);if(!m){m=new Map();K.set(this,m);}const c=capt(o),k=t+'|'+c;let s=m.get(k);if(!s){s=new Map();m.set(k,s);}
   if(!s.has(fn)){const rec={id:++R.id,t:t,cible:nomC(this),pile:pile(),ref:new WeakRef(this)};s.set(fn,rec);R.ec.set(rec.id,rec);const self=this;
     if(o&&o.once)aE.call(this,t,function(){ote(self,t,fn,c);},{once:true,capture:c});
     if(o&&o.signal)try{o.signal.addEventListener('abort',function(){ote(self,t,fn,c);});}catch(e){}}}
   return aE.call(this,t,fn,o);};
 ET.removeEventListener=function(t,fn,o){ote(this,t,fn,capt(o));return rE.call(this,t,fn,o);};
 const nomF=new WeakMap(),nf=function(fn){let n=nomF.get(fn);if(!n){n=(fn.name||String(fn).slice(0,80).replace(/\\s+/g,' '));nomF.set(fn,n);}return n;};
 const rAF=window.requestAnimationFrame.bind(window),cAF=window.cancelAnimationFrame.bind(window);
 window.requestAnimationFrame=function(fn){let id=0;const n=nf(fn);id=rAF(function(ts){R.raf.delete(id);if(ts!==R.ts){for(const k in R.par){if(!(R.max[k]>=R.par[k]))R.max[k]=R.par[k];}R.par={};R.ts=ts;}R.par[n]=(R.par[n]||0)+1;return fn(ts);});R.raf.set(id,n);return id;};
 window.cancelAnimationFrame=function(id){R.raf.delete(id);return cAF(id);};
 const sT=window.setTimeout.bind(window),cT=window.clearTimeout.bind(window),sI=window.setInterval.bind(window),cI=window.clearInterval.bind(window);
 window.setTimeout=function(fn,d){if(typeof fn!=='function')return sT.apply(window,arguments);const a=Array.prototype.slice.call(arguments,2);let id=0;id=sT(function(){R.TO.delete(id);return fn.apply(window,a);},d);R.TO.set(id,nf(fn));return id;};
 window.clearTimeout=function(id){R.TO.delete(id);return cT(id);};
 window.setInterval=function(fn,d){if(typeof fn!=='function')return sI.apply(window,arguments);const id=sI.apply(window,arguments);R.IV.set(id,{n:nf(fn),d:d,pile:pile()});return id;};
 window.clearInterval=function(id){R.IV.delete(id);return cI(id);};
 const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t){const r=gc.apply(this,arguments);if(r&&!this.__rpCtx){this.__rpCtx=t;R.cv.push({ref:new WeakRef(this),t:t,pile:pile()});}return r;};
 /* l'arrière-plan simulé : document.hidden / visibilityState pilotés par le banc */
 const dh=Object.getOwnPropertyDescriptor(Document.prototype,'hidden'),dv=Object.getOwnPropertyDescriptor(Document.prototype,'visibilityState');
 Object.defineProperty(document,'hidden',{configurable:true,get:function(){return R.vis===null?dh.get.call(document):R.vis==='hidden';}});
 Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return R.vis===null?dv.get.call(document):R.vis;}});
 window.__rpEtat=function(){
   for(const k in R.par){if(!(R.max[k]>=R.par[k]))R.max[k]=R.par[k];}
   const g={},vivants={vivants:0,detaches:0,morts:0};
   R.ec.forEach(function(r){const c=r.ref.deref();let st='vivants';if(!c)st='morts';else if(c instanceof Node&&!c.isConnected)st='detaches';vivants[st]++;
     const k=r.t+' @'+r.cible+' :: '+r.pile;if(!g[k])g[k]={n:0,vivants:0};g[k].n++;if(st==='vivants')g[k].vivants++;});
   const parType={};R.ec.forEach(function(r){parType[r.t]=(parType[r.t]||0)+1;});
   const rafs={};R.raf.forEach(function(n){rafs[n]=(rafs[n]||0)+1;});
   const ivs=[];R.IV.forEach(function(v){ivs.push(v.n.slice(0,60)+' /'+v.d+'ms :: '+v.pile.slice(0,200));});
   const cvs=[];R.cv.forEach(function(c){const e=c.ref.deref();if(!e)return;cvs.push({t:c.t,id:e.id||e.className||'',dom:e.isConnected,w:e.width,h:e.height,cw:e.clientWidth,ch:e.clientHeight,vis:e.isConnected?getComputedStyle(e).display+'/'+getComputedStyle(e).visibility:'-'});});
   let gl=null;try{const r=dbgScene().rdr,x=r.getContext();gl={dbw:x.drawingBufferWidth,dbh:x.drawingBufferHeight,cw:r.domElement.width,ch:r.domElement.height,pr:r.getPixelRatio(),perdu:x.isContextLost()};}catch(e){gl=String(e);}
   const an=[];try{document.getAnimations().forEach(function(a){if(a.playState!=='running')return;const t=a.effect&&a.effect.target;an.push((a.animationName||a.transitionProperty||a.constructor.name)+' @'+(t?(t.id||t.className||t.tagName):'?'));});}catch(e){}
   return {t:Math.round(performance.now()/1000),iw:innerWidth,ih:innerHeight,dpr:devicePixelRatio,ec:R.ec.size,ecEtat:vivants,parType:parType,groupes:g,rafAttente:R.raf.size,rafs:rafs,rafParImageMax:R.max,
     minuteries:R.TO.size,intervalles:R.IV.size,iv:ivs,toiles:cvs,gl:gl,anims:an,corps:document.body.className.slice(0,200),pivot:(function(){try{return dbgPivot();}catch(e){return null;}})(),
     etat:(function(){try{const s=dbgState();return {started:s.started,running:s.running,paused:s.paused,gameOver:s.gameOver};}catch(e){return null;}})(),
     nette:(function(){try{var n=dbgNette();return {cur:n.curDPR,cap:n.cap,cran:n.cran,vhd:n.vhd};}catch(e){return null;}})() /* ⚠ jamais dbgDPR() : il ÉCRIT curDPR (NaN sans argument) et fige l'échelle */,brut:R.brut,mouchard:(function(){try{return dbgMouchard();}catch(e){return null;}})()};};
 window.__rpRaz=function(){R.max={};R.par={};};
})();`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = []; let couches = null;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'LayerTree.layerTreeDidChange' && m.params.layers) couches = m.params.layers; } catch (x) {} });
  const metr = (w, h) => c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 3, mobile: true, screenWidth: w, screenHeight: h,
    screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
  const releves = [];
  const releve = async (nom) => {
    if (A.gel) { await c.ev(`(function(){try{return dbgMouchard('gel',${+A.gel})}catch(e){return 0}})()`); await dormir(1600); }
    await dormir(1500);
    const e = await c.ev('JSON.stringify(__rpEtat())', 30000).then(JSON.parse);
    const vw = e.iw * e.ih * 9; e.couches = couches ? { n: couches.length, grandes: couches.filter(l => l.width * l.height * 9 > vw * .5 && l.drawsContent).map(l => ({ id: l.layerId, w: l.width, h: l.height, nd: l.nodeId || null })) } : null;
    if (e.couches) for (const l of e.couches.grandes) { try { l.pourquoi = (await c.send('LayerTree.compositingReasons', { layerId: l.id })).compositingReasonIds; } catch (x) {} }
    e.nom = nom; releves.push(e);
    console.log(`${nom.padEnd(14)} t${e.t} ${e.iw}x${e.ih} | écouteurs ${e.ec} (vivants ${e.ecEtat.vivants}, détachés ${e.ecEtat.detaches}) | rAF attente ${e.rafAttente} ${JSON.stringify(e.rafs)} | par image ${JSON.stringify(e.rafParImageMax)} | minut ${e.minuteries} interv ${e.intervalles} | gl ${JSON.stringify(e.gl)} | toiles ${e.toiles.length} | anims ${e.anims.length} | couches ${e.couches && e.couches.n} grandes ${e.couches && e.couches.grandes.length} | ${JSON.stringify(e.etat)} | appels addEventListener ${Object.values(e.brut).reduce((a, b) => a + b, 0)} | mouchard écouteurs ${e.mouchard && e.mouchard.ecouteurs}`);
    await c.ev('__rpRaz()');
    fs.writeFileSync(path.join(OUT, TAG + '-releves.json'), JSON.stringify(releves, null, 1));
  };
  const cache = async (s) => {
    await c.ev("window.dispatchEvent(new Event('ccInactif'));__RP.vis='hidden';document.dispatchEvent(new Event('visibilitychange'));document.dispatchEvent(new Event('pause'));window.dispatchEvent(new Event('blur'));1");
    /* l'app suspendue : le JS de la page s'arrête net (Debugger.pause), comme iOS qui suspend le processus web ; minuteries et images reprennent au retour
       (setWebLifecycleState 'frozen' ne convient pas : Chrome sans fenêtre ne rend plus aucune image rAF après le dégel) */
    await dormir(300); await c.send('Debugger.pause');
    await dormir(s * 1000);
    await c.send('Debugger.resume');
    const rafOk = () => c.ev("new Promise(function(r){var t=setTimeout(function(){r(false)},2000);requestAnimationFrame(function(){clearTimeout(t);r(true)})})", 10000);
    let ok = await rafOk(); if (!ok) { await c.send('Page.bringToFront').catch(() => {}); ok = await rafOk(); console.log('rAF après le dégel :', ok ? 'revenu après bringToFront' : 'TOUJOURS ABSENT'); }
    await c.ev("__RP.vis='visible';document.dispatchEvent(new Event('visibilitychange'));document.dispatchEvent(new Event('resume'));window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('pageshow'));window.dispatchEvent(new Event('ccActif'));1");
  };
  /* la reprise COMME LE JOUEUR : REPRENDRE dans la feuille de pause (3-2-1) ; filet dbgLumReprise si la feuille ne répond pas (une reprise par togglePause seul laisse la feuille ouverte : hTp, animation du lingot) */
  const reprend = async () => {
    const vu = await c.ev("(function(){var p=document.getElementById('tPanel');if(!p||!p.classList.contains('open'))return 'fermée';var g=p.querySelector('.tp.go');if(!g)return 'sans bouton';['touchstart','touchend'].forEach(function(t){try{g.dispatchEvent(new TouchEvent(t,{bubbles:true,cancelable:true}));}catch(e){}});try{g.click();}catch(e){}return 'REPRENDRE touché';})()");
    if (vu === 'REPRENDRE touché') await dormir(4200);
    const etat = await c.ev("(function(){var p=document.getElementById('tPanel');var s=dbgState();if(s.paused){try{dbgLumReprise();}catch(e){}return 'filet dbgLumReprise';}return p&&p.classList.contains('open')?'feuille encore ouverte':'ok';})()");
    if (etat !== 'ok') console.log('reprise :', vu, '→', etat);
    await c.ev("(function(){try{dbgImmortel(1);dbgAuto(1,0,{nit:0});}catch(e){}return 1})()"); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('LayerTree.enable'); await c.send('Debugger.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await metr(390, 844);
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.rpOk){localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');sessionStorage.rpOk=1;}}catch(e){}' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: RELEVE });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&appareil=iPhone14,2&carte=nuages&pistegraine=7` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    let pret = false;
    for (let i = 0; i < 500 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2000);
    await releve('menu');
    let ok = false;
    for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
    if (!ok) throw new Error('course pas lancée');
    await reprend(); await dormir(8000);
    await releve('course0');
    if (A.sonde) { for (let i = 0; i < 6; i++) { console.log('sonde', i, await c.ev(A.sonde, 30000).catch(e => 'ERR ' + e.message)); await dormir(1000); } if (A.seule === '1') throw new Error('sonde seule'); }
    for (let k = 1; k <= N; k++) {
      await cache(k === 1 ? BG : BGN);
      await dormir(2000);
      await metr(844, 390); await dormir(1000); await reprend(); await dormir(4000);
      await releve('retour' + k + '+P');
      await metr(390, 844); await dormir(1000); await reprend(); await dormir(4000);
      await releve('retour' + k + '+D');
    }
    if (/perfrec=2/.test(A.q || '')) { /* la boîte de vol et les notes « toile » du mouchard (lot RETOURPIVOT) : relues pour vérifier l'instrumentation */
      await c.ev("(function(){__RP.vis='hidden';document.dispatchEvent(new Event('visibilitychange'));return 1})()"); /* la course en cours se range (bvFinit au passage caché) */
      const bv = await c.ev("JSON.stringify(dbgBoiteVol('tout'))", 30000).then(JSON.parse);
      const notes = await c.ev("JSON.stringify(dbgErreurs().filter(function(l){return l.g==='toile'}))").then(JSON.parse);
      fs.writeFileSync(path.join(OUT, TAG + '-vol.json'), JSON.stringify(bv)); fs.writeFileSync(path.join(OUT, TAG + '-notes.json'), JSON.stringify(notes, null, 1));
      console.log('boîte de vol :', bv.length, 'courses · notes toile :', notes.length); for (const n of notes) console.log('  note', n.n + '×', n.m);
    }
    fs.writeFileSync(path.join(OUT, TAG + '-exceptions.json'), JSON.stringify(exc, null, 1));
    console.log('exceptions', exc.length, exc.slice(0, 3));
  } catch (e) { console.error('ÉCHEC', e.message); process.exitCode = 1; }
  fin(); process.exit(process.exitCode || 0);
})();
