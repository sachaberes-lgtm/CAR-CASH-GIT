/* ===== LA SONDE DU LOT BOUTIQUE (2026-11-14, chantier qualité par appareil : « mesure la fluidité de la boutique avant/après ») =====
   node qa-boutique.mjs <port contrôle du banc.cjs> <étiquette> [portrait|couche]
   Ouvre la boutique comme un joueur (accueil → garage → BOUTIQUE), puis mesure :
   · ouverture : ms entre le toucher de BOUTIQUE et la bande posée (cartes en vue) ;
   · par rayon : animations en cours, infinies, hors de la bande (document.getAnimations) ;
   · défilement : 4 lancers de la bande (VOITURES) puis du rayon PEINTURES — images par seconde (rAF), pire écart entre deux images,
     écarts > 50 ms, recalculs de style et mises en page (CDP Performance.getMetrics).
   Écrit mes_qa_<étiquette>_<format>.json à côté. Le banc (banc.cjs) coupe déjà sfx, mus, vox dans la sauvegarde. */
import fs from 'fs';
const [port, tag = 'x', fmt = 'portrait'] = process.argv.slice(2);
const B = 'http://127.0.0.1:' + port, D = new URL('.', import.meta.url).pathname;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const ev = async (js) => { const r = await fetch(B + '/ev', { method: 'POST', body: js }); const t = await r.text(); try { return JSON.parse(t); } catch (e) { return t; } };
const get = async (p) => (await fetch(B + p)).text();
const tap = (sel, fx, fy) => get('/tap?sel=' + encodeURIComponent(sel) + (fx != null ? '&fx=' + fx + '&fy=' + fy : ''));
let cdp = null, cid = 0; const att = {};
const cdpOuvre = async () => { const L = await (await fetch('http://127.0.0.1:' + (+port - 1) + '/json')).json(); const pg = L.find(x => x.type === 'page'); cdp = new WebSocket(pg.webSocketDebuggerUrl); await new Promise(r => cdp.onopen = r); cdp.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att[m.id]) { att[m.id](m.result); delete att[m.id]; } }; };
const cs = (method, params) => Promise.race([new Promise(r => { const id = ++cid; att[id] = r; cdp.send(JSON.stringify({ id, method, params: params || {} })); }), dormir(8000).then(() => ({ metrics: [] }))]);
const met = async () => { const r = await cs('Performance.getMetrics'); const o = {}; for (const m of (r.metrics || [])) o[m.name] = m.value; return o; };
const out = {}; const note = (k, v) => { out[k] = v; console.log('== ' + k + ' ' + JSON.stringify(v)); };
/* l'horloge des images : chaque rAF note son écart avec la précédente */
const HORLOGE = `(function(){if(window.__qaH)return 1;const H=window.__qaH={on:false,g:[],t:0};(function f(t){if(H.on){if(H.t)H.g.push(t-H.t);H.t=t;}requestAnimationFrame(f);})(0);
 window.__qaHraz=function(){H.g=[];H.t=0;H.on=true;return 1;};
 window.__qaHlit=function(){H.on=false;const g=H.g.slice().sort((a,b)=>a-b),s=g.reduce((a,b)=>a+b,0);return {images:g.length,ips:+(g.length/(s/1000||1)).toFixed(1),p50:+(g[Math.floor(g.length*.5)]||0).toFixed(1),p95:+(g[Math.floor(g.length*.95)]||0).toFixed(1),pire:+(g[g.length-1]||0).toFixed(1),sup50:g.filter(x=>x>50).length};};return 1;})()`;
const ANIMS = `(function(){const W=innerWidth,H=innerHeight;const R={courent:0,infinies:0,horsVue:0,parNom:{}};for(const a of document.getAnimations()){if(a.playState!=='running')continue;R.courent++;const tm=a.effect&&a.effect.getTiming&&a.effect.getTiming();const inf=tm&&tm.iterations===Infinity;if(inf)R.infinies++;const t=a.effect&&a.effect.target;let hors=false;if(t&&t.getBoundingClientRect){let el=t;const b=el.getBoundingClientRect();const rl=document.querySelector('#gBqPan .bqRail');const rb=rl?rl.getBoundingClientRect():{left:0,right:W,top:0,bottom:H};hors=b.width<1||b.right<Math.max(0,rb.left)||b.left>Math.min(W,rb.right)||b.bottom<Math.max(0,rb.top)||b.top>Math.min(H,rb.bottom);}if(hors&&inf)R.horsVue++;const k=(a.animationName||'?')+(hors?' HORS':'');R.parNom[k]=(R.parNom[k]||0)+1;}return R;})()`;
const fenetre = async (k, geste) => { await ev('__qaHraz()'); const m0 = await met(); await geste(); const m1 = await met(); const o = await ev('__qaHlit()');
  for (const n of ['LayoutCount', 'RecalcStyleCount']) o[n] = (m1[n] || 0) - (m0[n] || 0);
  for (const n of ['LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration']) o[n + 'ms'] = Math.round(((m1[n] || 0) - (m0[n] || 0)) * 1000);
  note(k, o); };
const lancers = async (n) => { const r = await ev("(function(){var b=document.querySelector('#gBqPan .bqRail').getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()");
  for (let i = 0; i < n; i++) { await get(`/drag?x1=${Math.round(r[0] + r[2] * .85)}&y1=${Math.round(r[1] + r[3] / 2)}&x2=${Math.round(r[0] + r[2] * .15)}&y2=${Math.round(r[1] + r[3] / 2)}&ms=260`); await dormir(900); } };
(async () => {
  const F = fmt === 'portrait' ? [390, 844] : [844, 390];
  await get('/size?w=' + F[0] + '&h=' + F[1] + '&mob=1'); await get('/load'); await dormir(3000); await cdpOuvre(); await cs('Performance.enable');
  await ev(HORLOGE);
  await ev("__mGo('home')"); await dormir(1500);
  await tap('#mHome [data-m="garage"]'); await dormir(9000);
  /* l'ouverture : du toucher à la bande posée (au moins 3 cartes en vue avec leur image) */
  await ev("window.__qaT0=performance.now();1");
  await get('/tap?sel=%23gShopBas&fx=.82&fy=.84');
  let ouv = -1; for (let i = 0; i < 200; i++) { const v = await ev("(function(){var r=document.querySelector('#gBqPan .bqRail');if(!r)return -1;var rb=r.getBoundingClientRect(),n=0;r.querySelectorAll('.bqK').forEach(function(e){var b=e.getBoundingClientRect();if(b.width>0&&b.left<rb.right&&b.right>rb.left&&getComputedStyle(e).opacity>.95)n++;});return n>=3?performance.now()-window.__qaT0:-1})()"); if (v > 0) { ouv = Math.round(v); break; } await dormir(50); }
  note('ouverture_ms', ouv);
  await dormir(6000);
  note('anims_voiture', await ev(ANIMS));
  await fenetre('repos_voiture', async () => { await dormir(5000); });
  await fenetre('defile_voiture', async () => { await lancers(4); await dormir(800); });
  for (const c of ['peinture', 'aile', 'trainee', 'figure']) { await tap('#gBqCats [data-c="' + c + '"]'); await dormir(3500); note('anims_' + c, await ev(ANIMS));
    if (c === 'peinture') { await fenetre('repos_peinture', async () => { await dormir(5000); }); await fenetre('defile_peinture', async () => { await lancers(4); await dormir(800); }); note('anims_peinture_apres', await ev(ANIMS)); } }
  await tap('#gBqCats [data-c="voiture"]'); await dormir(2500);
  note('err', JSON.parse(await get('/err')));
  fs.writeFileSync(D + 'mes_qa_' + tag + '_' + fmt + '.json', JSON.stringify(out, null, 1));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
