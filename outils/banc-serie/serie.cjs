/* LE BANC DE LA SÉRIE DE CONNEXION (2026-11-14, Sacha : la semaine v3) : Chrome headless au format iPhone (390 × 844, et couché 844 × 390 avec --format couche),
   chaque jour 1 → 7 VERSÉ pour de vrai (dbgSerie('verse',k)) sur une sauvegarde neuve, ce qui a été donné relevé (banque, jetons, traînées, peintures, garage)
   et une photo de l'écran de série une fois l'animation finie.   node outils/banc-serie/serie.cjs [--format tel|couche] [--out <dossier>] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), FMT = A.format || 'tel';
const W = FMT === 'tel' ? 390 : 844, H = FMT === 'tel' ? 844 : 390;
const OUT = path.resolve(A.out || path.join(__dirname, 'out')); fs.mkdirSync(OUT, { recursive: true });
let P_HTTP = 9891, P_CDP = 9892;
(async () => {
  while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); } } catch (x) {} });
  const fin = (k) => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); process.exit(k); };
  const attend = async (expr, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(700); } return false; };
  const photo = async (nom) => { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }, 30000); fs.writeFileSync(path.join(OUT, nom + '.jpg'), Buffer.from(sh.data, 'base64')); };
  const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&intro=ancien&attente=0` });
  if (!await attend("!!window.__gameReady&&typeof dbgSerie==='function'", 300000)) { console.log('PAS PRÊT'); await photo('pas-pret'); fin(1); }
  await dormir(1500); let ko = 0;
  for (let k = 1; k <= 7; k++) {
    const r = await c.ev("dbgSerie('verse'," + k + ")"), o = r.lot, d = r.verse; await dormir(k === 7 ? 7500 : 4500);
    const txt = await c.ev("(function(){const el=document.getElementById('serieW');return {on:el.classList.contains('on'),cl:el.className,gain:(el.querySelector('.swGain b')||{}).textContent,bons:(el.querySelector('.swBons')||{}).textContent,pied:(el.querySelector('.swPied')||{}).textContent,nom:(el.querySelector('.swNom')||{}).textContent,deb:(function(){const b=el.querySelector('.swBloc');if(!b)return 0;const r=b.getBoundingClientRect();return Math.round(Math.max(0,r.right-innerWidth,-r.left,r.bottom-innerHeight,-r.top));})(),trop:[].slice.call(el.querySelectorAll('.swJ>b,.swPl span')).filter(x=>x.scrollWidth>x.parentNode.clientWidth+1).map(x=>x.textContent)};})()");
    await photo(FMT + '-jour' + k);
    const attendu = [{ jetons: 1 }, { banque: 20000 }, { banque: 50000, jetons: 1 }, { jetons: 3 }, { trainees: 1 }, { banque: 100000, peintures: 1 }, { voitures: 1 }][k - 1];
    const ok = Object.keys(d).every(x => (d[x] | 0) === (attendu[x] | 0)); if (!ok) ko++;
    console.log((ok ? 'OK ' : 'KO ') + 'jour ' + k + ' versé ' + JSON.stringify(d) + ' · lot ' + JSON.stringify(o) + '\n    écran ' + JSON.stringify(txt));
    await c.ev("(function(){const el=document.getElementById('serieW');el.click();el.click();return 1;})()"); await dormir(700);
  }
  console.log(err.length ? 'ERREURS :\n' + err.join('\n') : 'aucune erreur JS'); fin(ko || err.length ? 1 : 0);
})().catch(e => { console.log('PLANTE', e); process.exit(2); });
