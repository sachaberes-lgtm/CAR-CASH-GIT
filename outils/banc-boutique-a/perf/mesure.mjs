// node mesure.mjs <port> <etiquette> [portrait|couche]
import fs from 'fs';
const [port, tag = 'x', fmt = 'portrait'] = process.argv.slice(2);
const B = 'http://127.0.0.1:' + port, D = new URL('.', import.meta.url).pathname;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const ev = async (js) => { const r = await fetch(B + '/ev', { method: 'POST', body: js }); const t = await r.text(); try { return JSON.parse(t); } catch (e) { return t; } };
const get = async (p) => (await fetch(B + p)).text();
const tap = (sel, fx, fy) => get('/tap?sel=' + encodeURIComponent(sel) + (fx != null ? '&fx=' + fx + '&fy=' + fy : ''));
let cdp=null,cid=0;const att={};
const cdpOuvre=async()=>{const L=await (await fetch('http://127.0.0.1:'+(+port-1)+'/json')).json();const pg=L.find(x=>x.type==='page');cdp=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>cdp.onopen=r);cdp.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&att[m.id]){att[m.id](m.result);delete att[m.id];}};};
const cs=(method,params)=>new Promise(r=>{const id=++cid;att[id]=r;cdp.send(JSON.stringify({id,method,params:params||{}}));});
const met=async()=>{const r=await cs('Performance.getMetrics');const o={};for(const m of r.metrics)o[m.name]=m.value;return o;};
const SONDE = fs.readFileSync(D + 'sonde.js', 'utf8');
const out = {}; const note = (k, v) => { out[k] = v; console.log('== ' + k + ' ' + JSON.stringify(v)); };
const fenetre = async (k, ms, geste) => { await ev('__Sraz()'); const m0=await met(); if (geste) await geste(); else await dormir(ms); const m1=await met(); const o=await ev('__Slit()');
 for(const n of ['LayoutCount','RecalcStyleCount']){o[n]=m1[n]-m0[n];o[n+'/image']=+((m1[n]-m0[n])/Math.max(1,o.raf)).toFixed(2);}
 for(const n of ['LayoutDuration','RecalcStyleDuration','ScriptDuration','TaskDuration']){o[n+'ms']=Math.round((m1[n]-m0[n])*1000);}
 note(k, o); };
const shot = async (n) => get('/shot?f=' + encodeURIComponent(D + 'shots/' + tag + '_' + fmt + '_' + n + '.png'));
fs.mkdirSync(D + 'shots', { recursive: true });
(async () => {
  const F = fmt === 'portrait' ? [390, 844] : [844, 390];
  await get('/size?w=' + F[0] + '&h=' + F[1] + '&mob=1'); await get('/load'); await dormir(3000); await cdpOuvre(); await cs('Performance.enable');
  console.log(await ev(SONDE));
  await fenetre('accueil', 6000);
  // ouvrir la boutique comme le parcours
  await ev("__mGo('home')"); await dormir(1500);
  await fenetre('versGarage', 0, async () => { await tap('#mHome [data-m="garage"]'); await dormir(12000); });
  await fenetre('ouverture', 0, async () => { await get('/tap?sel=%23gShopBas&fx=.82&fy=.84'); await dormir(12000); });
  await shot('repos');
  note('etat', await ev('__Setat()'));
  await fenetre('repos', 10000);
  await fenetre('reposLong', 0, async () => { await dormir(6000); });
  // changer de rayon
  for (const c of ['peinture', 'aile', 'trainee', 'figure', 'voiture']) {
    await fenetre('rayon_' + c, 0, async () => { await tap('#gBqCats [data-c="' + c + '"]'); await dormir(4000); });
    if (c === 'peinture') { note('etat_peinture', await ev('__Setat()')); await shot('peinture'); }
  }
  // défilement de la bande
  const r = await ev("(function(){var b=document.querySelector('#gBqPan .bqRail').getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()");
  await fenetre('defile', 0, async () => { for (let i = 0; i < 4; i++) { await get(`/drag?x1=${Math.round(r[0] + r[2] * .8)}&y1=${Math.round(r[1] + r[3] / 2)}&x2=${Math.round(r[0] + r[2] * .2)}&y2=${Math.round(r[1] + r[3] / 2)}&ms=400`); await dormir(700); } await dormir(1500); });
  // rotation au doigt
  await fenetre('rotation', 0, async () => { for (let i = 0; i < 3; i++) { await get(`/drag?x1=${Math.round(F[0] * .3)}&y1=${Math.round(F[1] * .3)}&x2=${Math.round(F[0] * .7)}&y2=${Math.round(F[1] * .32)}&ms=500`); await dormir(800); } });
  // essai de peinture : toucher 3 cartes
  await tap('#gBqCats [data-c="peinture"]'); await dormir(3000);
  await fenetre('essaiPeinture', 0, async () => { for (const n of [1, 2, 3]) { await ev("(function(){var L=document.querySelectorAll('#gBqPan .bqRail .bqK,#gBqPan .bqRail .pN,#gBqPan .bqRail .pC');var e=L[" + n + "];if(e){e.scrollIntoView({inline:'center',block:'nearest'});}return L.length})()"); await dormir(300); await get('/tap?sel=' + encodeURIComponent("#gBqPan .bqRail .bqK:nth-of-type(" + (n + 1) + ")")); await dormir(1500); } });
  await tap('#gBqCats [data-c="voiture"]'); await dormir(3000);
  await shot('voiture');
  note('etat_fin', await ev('__Setat()'));
  fs.writeFileSync(D + 'mes_' + tag + '_' + fmt + '.json', JSON.stringify(out, null, 1));
})();
