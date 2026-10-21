// Banc « SANS TOUT CASSER » + écran de fin : node banc-fin.mjs <url> <largeur> <hauteur> <photo.png> [fin]
// Démarre le jeu (tactile), vérifie qu'il n'y a pas d'erreur et qu'une course part ; avec « fin » : ⏸ → QUITTER → confirmer, puis mesure
// l'écran de fin (défilement, ⌂ · REJOUER dans la colonne) normal, puis avec le contenu de la capture de Sacha (RECORD ×3, 2 missions, ×2).
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [URL0, Wa, Ha, OUT, MODE] = process.argv.slice(2);
const W = +Wa, H = +Ha, PORT = 9463;
const dir = mkdtempSync(join(tmpdir(), 'ccfin-'));
const ch = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--mute-audio',
  '--autoplay-policy=no-user-gesture-required', `--remote-debugging-port=${PORT}`, `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
const dort = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), dit = (...a) => console.log(`[${Math.round((Date.now() - t0) / 1000)} s]`, ...a);
let ws, id = 0; const att = new Map(), errs = [];
function cdp(method, params = {}) { const i = ++id; ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise(res => att.set(i, res)); }
async function ev(expr) { const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result && r.result.value; }
async function tape(x, y) { await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await dort(60); await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
const centre = sel => ev(`(function(){const e=[...document.querySelectorAll(${JSON.stringify(sel)})].find(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(x).visibility!=='hidden'});if(!e)return null;const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,(e.textContent||'').trim().slice(0,24)]})()`);
async function attends(expr, s, pas = 500) { for (let k = 0; k < s * 1000 / pas; k++) { if (await ev(expr)) return true; await dort(pas); } return false; }
const MESURE = `(function(){const d=document,r=e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.right),Math.round(b.bottom)]};
  const dd=d.getElementById('mDead');dd.style.paddingBottom='9px';void dd.offsetHeight;dd.style.paddingBottom='';void dd.offsetHeight;
  const o=d.getElementById('overlay'),f=dd.querySelector('.mFin'),st=d.getElementById('mStatsBox'),db=d.getElementById('mDouble');
  const s0=st.querySelector('.mStat');
  return {defile:o.scrollHeight-o.clientHeight,colonne:r(st),fin:r(f),finPos:getComputedStyle(f).position,maison:r(dd.querySelector('.mMenu')),
    moteur:r(d.querySelector('#mHero .hMot')),x2:db&&getComputedStyle(db).display!=='none'?r(db):'cachée',chiffresRognes:s0?s0.scrollHeight-s0.clientHeight:0}})()`;
const CHARGE = `(function(){const d=document;d.querySelectorAll('#mHero .hCard').forEach(c=>{if(!c.querySelector('em')){const e=d.createElement('em');e.textContent='RECORD !';c.appendChild(e);}});
  const em=d.querySelector('#mDead .mCashL em.mCashRec');if(em)em.style.display='';d.getElementById('mCash').textContent='$ 5,8 k';
  const o=d.getElementById('mObj');o.innerHTML=o.querySelector('.obHd').outerHTML+'<div class="obM ok"><i class="pxi pxi-coche"></i><span>FAIS 2 FIGURES DANS UN SAUT</span><em>+$ 1 k</em></div><div class="obM ok"><i class="pxi pxi-coche"></i><span>ATTEINS 20 000 D AURA EN UNE PARTIE</span><em>+$ 30 k</em></div><div class="obFt"><span>A RECUPERER</span><span>VOIR</span></div>';
  const s=d.createElement('style');s.textContent='html #mDead #mDouble[hidden]{display:flex!important;animation:none!important}';d.head.appendChild(s);
  const b=d.querySelector('#mDouble .dbS');if(b)b.textContent='+$ 5,8 k';return true})()`;
try {
  let cible; for (let k = 0; k < 120 && !cible; k++) { await dort(500);
    try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); cible = l.find(t => t.type === 'page'); } catch (e) {} }
  if (!cible) throw new Error('Chrome ne répond pas');
  ws = new WebSocket(cible.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  ws.onmessage = m => { const d = JSON.parse(m.data);
    if (d.id && att.has(d.id)) { att.get(d.id)(d.result || {}); att.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errs.push('EXC ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 220));
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push('ERR ' + d.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 220)); };
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Network.setBypassServiceWorker', { bypass: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `if(!sessionStorage.__p){sessionStorage.__p=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-LG',ok:1}});}` });
  await cdp('Page.navigate', { url: URL0 });
  dit('prêt :', await attends('!!window.__gameReady', 400), '·', await ev('innerWidth+"×"+innerHeight+" cadre="+!!document.querySelector("iframe#colonne")'));
  for (let k = 0; k < 30; k++) { const s = await ev(`(function(){const e=document.getElementById('splash');if(!e)return false;const c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>0})()`);
    if (!s) break; await tape(W / 2, H / 2); await dort(1500); }
  dit('accueil passé');
  let parti = false;
  for (let k = 0; k < 400 && !parti; k++) {
    const m = await centre('#modale.on .modB .pbtn');
    if (m) { await tape(m[0], m[1]); dit('fenêtre :', m[2]); await dort(1500); }
    else { const b = await centre('#mHome.on .mPlay, #gJouer'); if (b && !(await ev(`document.body.classList.contains('play')`))) { await tape(b[0], b[1]); dit('JOUER touché'); await dort(3000); } }
    parti = await ev(`document.body.classList.contains('play')`); if (!parti) await dort(1000); }
  dit('course partie :', parti);
  if (MODE === 'fin' && parti) {
    await attends(`typeof dbgState==='function'&&dbgState().started`, 300);
    await dort(4000);
    let fin = false;
    for (let k = 0; k < 60 && !fin; k++) {
      fin = await ev(`!!document.querySelector('#mDead.on')`); if (fin) break;
      const q = await centre('#modale.on .modB .pb-red');
      if (q) { await tape(q[0], q[1]); dit('QUITTER confirmé'); await dort(4000); continue; }
      const p = await centre('#tPanel.open [data-a="quit"]');
      if (p) { await tape(p[0], p[1]); dit('QUITTER touché'); await dort(2500); continue; }
      const g = await centre('#tGear'); if (g) { await tape(g[0], g[1]); dit('⏸ touché'); await dort(2500); } else await dort(1500); }
    dit('écran de fin :', fin);
    if (fin) { await dort(5000);
      dit('NORMAL', JSON.stringify(await ev(MESURE)));
      await ev(CHARGE); await dort(1500);
      dit('CHARGÉ', JSON.stringify(await ev(MESURE)));
      const tch = await ev(`(function(){const d=document,h=s=>{const e=d.querySelector(s);if(!e)return s+':absent';const b=e.getBoundingClientRect(),t=d.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return s+'→'+(t&&t.closest(s)?'ok':'AUTRE '+(t&&t.className))};return [h('#mDouble'),h('#mDead .mMenu'),h('#mDead [data-m=replay]')].join(' · ')})()`);
      dit('touchers', tch); } }
  if (OUT) { const s = await cdp('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT, Buffer.from(s.data, 'base64')); }
  dit('erreurs :', errs.length ? '\n  ' + errs.join('\n  ') : 'aucune');
} catch (e) { dit('banc :', e.message); } finally { try { ws && ws.close(); } catch (e) {} ch.kill('SIGKILL'); }
