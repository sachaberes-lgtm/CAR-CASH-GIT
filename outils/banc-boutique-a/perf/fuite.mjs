/* ===== LA SONDE DES FUITES DE LA BOUTIQUE (2026-11-14, session boutique iOS — Sacha : « améliore, débogue et optimise au max la boutique sur la version iOS ») =====
   node fuite.mjs <port contrôle du banc.cjs> [tours=4] [portrait|couche]
   Ouvre la boutique comme un joueur, puis fait N tours : chaque rayon (voitures, peintures, ailes, traînées, figures), 3 lancers de la bande dans chacun,
   retour au garage, réouverture. Après chaque tour, ramasse-miettes forcé puis relevé :
   · CDP Memory.getDOMCounters (nœuds, écouteurs JS, documents) et Runtime.getHeapUsage (tas JS) ;
   · three.js : géométries, textures, programmes (dbgCout) ; photos en mémoire (dbgPhotoMem) ;
   · toiles <canvas> créées / vivantes dans le DOM, adresses blob créées / révoquées (compteurs posés par la sonde) ;
   · animations CSS en cours, minuteurs et rAF demandés pendant le tour.
   Un chiffre qui monte à chaque tour = une fuite. Écrit mes_fuite_<format>.json à côté. Le banc (banc.cjs) coupe déjà sfx, mus, vox. */
import fs from 'fs';
const [port, toursS = '4', fmt = 'portrait'] = process.argv.slice(2);
const TOURS = +toursS;
const B = 'http://127.0.0.1:' + port, D = new URL('.', import.meta.url).pathname;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const ev = async (js) => { const r = await fetch(B + '/ev', { method: 'POST', body: js }); const t = await r.text(); try { return JSON.parse(t); } catch (e) { return t; } };
const get = async (p) => (await fetch(B + p)).text();
const tap = (sel, fx, fy) => get('/tap?sel=' + encodeURIComponent(sel) + (fx != null ? '&fx=' + fx + '&fy=' + fy : ''));
let cdp = null, cid = 0; const att = {};
const cdpOuvre = async () => { const L = await (await fetch('http://127.0.0.1:' + (+port - 1) + '/json')).json(); const pg = L.find(x => x.type === 'page'); cdp = new WebSocket(pg.webSocketDebuggerUrl); await new Promise(r => cdp.onopen = r); cdp.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att[m.id]) { att[m.id](m.result || m.error); delete att[m.id]; } }; };
const cs = (method, params) => Promise.race([new Promise(r => { const id = ++cid; att[id] = r; cdp.send(JSON.stringify({ id, method, params: params || {} })); }), dormir(15000).then(() => ({}))]);
/* les compteurs posés dans la page : toiles créées, adresses blob, minuteurs et rAF */
const SONDE = `(function(){if(window.__fu)return 1;const F=window.__fu={toiles:0,blobs:0,revoques:0,raf:0,to:0,iv:0,ivVivants:0};
 const ce=Document.prototype.createElement;Document.prototype.createElement=function(n){if(String(n).toLowerCase()==='canvas')F.toiles++;return ce.apply(this,arguments);};
 if(window.OffscreenCanvas){const O=window.OffscreenCanvas;window.OffscreenCanvas=function(w,h){F.toiles++;return new O(w,h);};window.OffscreenCanvas.prototype=O.prototype;}
 const cu=URL.createObjectURL,ru=URL.revokeObjectURL;URL.createObjectURL=function(){F.blobs++;return cu.apply(URL,arguments);};URL.revokeObjectURL=function(){F.revoques++;return ru.apply(URL,arguments);};
 const r=window.requestAnimationFrame;window.requestAnimationFrame=function(f){F.raf++;return r.call(window,f);};
 const st=window.setTimeout;window.setTimeout=function(){F.to++;return st.apply(window,arguments);};
 const si=window.setInterval,ci=window.clearInterval,IV=new Set();window.setInterval=function(){F.iv++;const id=si.apply(window,arguments);IV.add(id);F.ivVivants=IV.size;return id;};window.clearInterval=function(id){IV.delete(id);F.ivVivants=IV.size;return ci.apply(window,arguments);};
 return 1;})()`;
const RELEVE = `(function(){const F=window.__fu,c=dbgCout(),p=dbgPhotoMem();let anim=0,inf=0;for(const a of document.getAnimations()){if(a.playState!=='running')continue;anim++;const t=a.effect&&a.effect.getTiming&&a.effect.getTiming();if(t&&t.iterations===Infinity)inf++;}
 return {geo:c.geo,tex:c.tex,progs:c.progs,photos:p.photos,photosMo:p.mo,photosCache:p.cache,toilesCreees:F.toiles,toilesDOM:document.getElementsByTagName('canvas').length,imgDOM:document.getElementsByTagName('img').length,
  blobs:F.blobs,revoques:F.revoques,raf:F.raf,minuteurs:F.to,intervalles:F.iv,intervallesVivants:F.ivVivants,anim:anim,animInfinies:inf,cartes:document.querySelectorAll('#gBqPan .bqK,#gBqPan .bcK,#gBqPan .pN').length};})()`;
const out = { tours: [] }; const note = (k, v) => { console.log('== ' + k + ' ' + JSON.stringify(v)); };
const lancers = async (n) => { const r = await ev("(function(){var e=document.querySelector('#gBqPan .bqRail');if(!e)return null;var b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()"); if (!r) return;
  const debout = r[2] > r[3];
  for (let i = 0; i < n; i++) { const s = i % 2 ? -1 : 1; /* aller, retour, aller : la bande ne bute pas au bout */
    if (debout) await get(`/drag?x1=${Math.round(r[0] + r[2] * (s > 0 ? .85 : .15))}&y1=${Math.round(r[1] + r[3] / 2)}&x2=${Math.round(r[0] + r[2] * (s > 0 ? .15 : .85))}&y2=${Math.round(r[1] + r[3] / 2)}&ms=260`);
    else await get(`/drag?x1=${Math.round(r[0] + r[2] / 2)}&y1=${Math.round(r[1] + r[3] * (s > 0 ? .85 : .15))}&x2=${Math.round(r[0] + r[2] / 2)}&y2=${Math.round(r[1] + r[3] * (s > 0 ? .15 : .85))}&ms=260`);
    await dormir(1100); } };
const releve = async (k) => { await cs('HeapProfiler.collectGarbage'); await dormir(400); await cs('HeapProfiler.collectGarbage');
  const dc = await cs('Memory.getDOMCounters'); const hu = await cs('Runtime.getHeapUsage'); const r = await ev(RELEVE);
  const o = Object.assign({ k, noeuds: dc.nodes, ecouteurs: dc.jsEventListeners, documents: dc.documents, tasMo: +((hu.usedSize || 0) / 1048576).toFixed(1) }, r); out.tours.push(o); note(k, o); return o; };
(async () => {
  const F = fmt === 'portrait' ? [390, 844] : [844, 390];
  await get('/size?w=' + F[0] + '&h=' + F[1] + '&mob=1'); await get('/load'); await dormir(3000); await cdpOuvre(); await cs('HeapProfiler.enable');
  await ev(SONDE); await ev('dbgCout(true)');
  await ev("__mGo('home')"); await dormir(1500);
  await tap('#mHome [data-m="garage"]'); await dormir(9000);
  await releve('garage');
  for (let t = 1; t <= TOURS; t++) {
    await get('/tap?sel=%23gShopBas&fx=.82&fy=.84'); await dormir(6000);
    for (const c of ['voiture', 'peinture', 'aile', 'trainee', 'figure', 'voiture']) { await tap('#gBqCats [data-c="' + c + '"]'); await dormir(3000); await lancers(3); }
    await releve('boutique ' + t);
    await get('/tap?sel=%23gShopBas&fx=.5&fy=.5'); await dormir(6000); /* RETOUR (le même bouton en boutique) */
    await releve('garage ' + t);
  }
  out.err = JSON.parse(await get('/err')); note('err', out.err);
  fs.writeFileSync(D + 'mes_fuite_' + fmt + '.json', JSON.stringify(out, null, 1));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
