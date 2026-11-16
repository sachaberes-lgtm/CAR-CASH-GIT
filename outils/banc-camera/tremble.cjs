/* LE BANC DU TREMBLEMENT (2026-11-16, Sacha : « la voiture tremble beaucoup quand on roule, règle ça pour de bon ») : Chrome headless muet.
   Lance une course, laisse le pilote auto conduire, puis avance le jeu À LA MAIN (dbgStep) avec un rythme d'images choisi et relève dbgTremble()
   après chaque image. Pour chaque série : `hf` = la part haute fréquence (écart de chaque image à la moyenne de ses deux voisines, en RMS) —
   c'est le tremblement ; `amp` = l'écart-type (l'ondulation lente, le virage). Unités : NDC (×1000 = millièmes de demi-écran) et degrés.
   node outils/banc-camera/tremble.cjs [--w 390 --h 844] [--q "tel=1"] [--map nuages:matin] [--nit 0|1] [--n 240] [--rythme 60|30|alt|jit] [--prof dossier]
   Rythmes : 60 = 16,7 ms, 30 = 33,3 ms, alt = 16,7/33,3 en alternance (un téléphone qui rate une image sur deux), jit = 16,7 ± 5 ms (des horodatages qui tremblent). */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const W = +(A.w || 390), H = +(A.h || 844), JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9841), P_CDP = +(A.cdp || 9842);
const N = +(A.n || 240), RY = (A.rythme || '60,alt,jit,30').split(','), NIT = +(A.nit || 0), ROULE = +(A.roule || 10);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], plq: { ok: 1 } };
const CLES = ['cx', 'cy', 'lac', 'tan', 'rou', 'wx', 'wy', 'fov', 'steer', 'roll', 'pitch', 'scoup', 'sus', 'drift', 'lean', 'phi'];
function analyse(S) {
  const o = {};
  for (const k of CLES) {
    const x = S.map(e => e[k]); let hf = 0, n = 0, m = 0;
    for (let i = 1; i < x.length - 1; i++) { const d = x[i] - (x[i - 1] + x[i + 1]) / 2; hf += d * d; n++; }
    for (const v of x) m += v; m /= x.length; let sd = 0; for (const v of x) sd += (v - m) * (v - m);
    const mul = /^(cx|cy|wx|wy)$/.test(k) ? 1000 : 1;
    o[k] = { hf: +(Math.sqrt(hf / Math.max(1, n)) * mul).toFixed(3), amp: +(Math.sqrt(sd / x.length) * mul).toFixed(2) };
  }
  return o;
}
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    const tel = /tel=1/.test(A.q || 'tel=1');
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: tel ? 2 : 1, mobile: tel, screenWidth: W, screenHeight: H });
    if (tel) { await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&simu=1&${A.q == null ? 'tel=1' : A.q}` });
    const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&typeof dbgTremble==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000);
    console.error('prêt :', pret); if (!pret) throw new Error('le jeu ne charge pas');
    await dormir(2500);
    if (A.map) console.error('map :', JSON.stringify(await c.ev("dbgClassique('" + A.map.split(':')[0] + "','" + (A.map.split(':')[1] || 'matin') + "')")).slice(0, 120));
    await c.ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()").catch(() => {});
    await dormir(800); console.error('dbgJouer :', JSON.stringify(await c.ev('JSON.stringify(window.dbgJouer())', 8000)).slice(0, 160));
    const part = await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 90000, 500);
    console.error('course partie :', part); if (!part) throw new Error('la course ne part pas');
    await c.ev(`${A.doigt && A.fixe == null ? "dbgTremble({doigt:" + A.doigt + "});" : ""}${A.tier ? "dbgTremble({tier:" + A.tier + "});" : ""}window.dbgAuto(1,0,{nit:${NIT}});window.dbgCadence&&dbgCadence(60);1`);
    await dormir(ROULE * 1000); /* la caisse prend sa vitesse en temps réel */
    const res = {};
    for (const ry of RY) {
      if (A.fixe != null) await c.ev("dbgTremble({doigt:" + (A.doigt || 1e-6) + ",fixe:" + A.fixe + "});1");
      const S = await c.ev(`(function(){const R=${JSON.stringify(ry)},out=[];for(let k=0;k<${N};k++){
        const ms=R==='30'?33.33:R==='alt'?(k&1?33.33:16.67):R==='jit'?16.67+(Math.random()*2-1)*5:16.67;
        window.dbgStep(1,ms);const e=window.dbgTremble();e.ms=ms;out.push(e);}return out;})()`, 600000);
      if (A.fixe != null) await c.ev("dbgTremble({doigt:0});1");
      const i0 = S.findIndex(e => e.mode === 'drive'), i1 = S.findIndex((e, i) => i > i0 && e.mode !== 'drive'), D = i0 < 0 ? [] : S.slice(i0, i1 < 0 ? S.length : i1), err = S.find(e => e.err);
      if (err) console.error('dbgTremble :', err.err);
      res[ry] = { n: D.length, kmh: D.length ? D[D.length >> 1].kmh : 0, nitro: D.filter(e => e.nitro).length, a: analyse(D) };
      if (A.dump) fs.writeFileSync(A.dump.replace('.json', '-' + ry + '.json'), JSON.stringify(D));
      console.error('rythme', ry, 'fait :', D.length, 'images au sol');
      await dormir(A.fixe != null ? 5000 : 1500);
    }
    console.log(JSON.stringify({ vue: W + 'x' + H, q: A.q == null ? 'tel=1' : A.q, map: A.map || '(défaut)', nit: NIT, res }, null, 1));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
})();
