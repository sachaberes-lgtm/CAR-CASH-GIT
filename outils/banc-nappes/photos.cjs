/* LES PHOTOS DES NAPPES DANS LE VRAI JEU (2026-11-19, finition des maps : « la lave et l'eau n'ont pas de limite », contrôle adverse : refaire les planches paysage ET portrait)
   UN Chrome sans fenêtre et MUET (--mute-audio, sfx/mus/vox à false), format iPhone (844×390 couché, 390×844 debout, DPR 3, tactile, ?tel=1).
     node outils/banc-nappes/photos.cjs --out <dossier> --avant <VP> --apres <VP> [--pa 8610 --pb 8611 --cdp 9610] <tag>@<port>@<meteo>@<graine>@<palier>@<c|d>[@<q>] …
   Par scénario : la course lancée (dbgJouer, pilote auto), la piste rebâtie au palier (dbgTrace), la grotte prête, puis chaque VUE (VUES plus bas) :
   la caméra est calculée UNE fois (dbgGrotte('lac',{…,dis:1})) dans la première page qui la demande — l'AVANT — et rejouée telle quelle ensuite (cams.json),
   une capture PNG <tag>-<meteo>-g<graine>-p<palier>-<vue>-<c|d>.png et une ligne MESURE (renderer.info d'un rendu de la vue : appels, triangles, programmes, géométries, textures).
   ⚠ Sous le verrou commun seulement (un script shell : verrou-banc.sh prendre, trap qui tue SON Chrome). */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = { out: 'prises', pa: '8610', pb: '8611', cdp: '9610' }, SC = [];
for (let i = 2; i < process.argv.length; i++) { const x = process.argv[i]; if (x.startsWith('--')) A[x.slice(2)] = process.argv[++i]; else SC.push(x); }
const OUT = path.resolve(A.out); fs.mkdirSync(OUT, { recursive: true });
let VUES = (A.vues || 'lave-250,lave0,eau0,eau200').split(',');
const CAMS = path.join(OUT, 'cams.json'); let cams = {}; try { cams = JSON.parse(fs.readFileSync(CAMS, 'utf8')); } catch (e) {}
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MESURE = "(function(){var d=dbgScene(),r=d.rdr||d.renderer,I=r.info,o={};try{I.autoReset=false;I.reset();r.render(d.scene,d.cam||d.camera);o={calls:I.render.calls,tris:I.render.triangles,prog:I.programs?I.programs.length:null,geo:I.memory.geometries,tex:I.memory.textures};}catch(e){o={err:String(e)};}finally{I.autoReset=true;}return JSON.stringify(o);})()";
const CACHE = "(function(){for(const id of ['hud','garage','mobCtl','bNitro','pauseBtn','serieW','mvW']){const e=document.getElementById(id);if(e)e.style.setProperty('display','none','important');}return 1;})()";
const t0 = Date.now();
(async () => {
  for (const p of [+A.pa, +A.pb, +A.cdp]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srvs = [];
  if (A.avant) srvs.push(await serveur(path.resolve(A.avant), +A.pa));
  if (A.apres) srvs.push(await serveur(path.resolve(A.apres), +A.pb));
  const { ch, pg } = await lanceChrome(+A.cdp, A.profil || fs.mkdtempSync(path.join(require('os').tmpdir(), 'nappes-')), 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} for (const s of srvs) try { s.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin); process.on('SIGTERM', () => process.exit(143)); process.on('SIGINT', () => process.exit(130));
  setTimeout(() => { console.log('CHIEN DE GARDE 9 min : arrêt'); process.exit(3); }, 540000).unref();
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') exc.push('CONSOLE: ' + JSON.stringify(m.params.args.map(x => x.value || x.description)).slice(0, 200)); } catch (x) {} });
  const taille = (w, h) => c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 3, mobile: true, screenWidth: w, screenHeight: h });
  const attend = async (expr, ms) => { for (let t = 0; t < ms; t += 500) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(500); } return false; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    for (const sc of SC) {
      if (Date.now() - t0 > 480000) { console.log('8 min : arrêt (le verrou doit être rendu)'); break; }
      const [tag, port, meteo, graine, palier, fmt, q, vs] = sc.split('@'), VUES0 = VUES; if (vs) VUES = vs.split(','); /* 8e champ : les vues de ce scénario */ const DEB = fmt === 'd', nom = `${tag}-${meteo}-g${graine}-p${palier}`;
      try {
        await taille(DEB ? 390 : 844, DEB ? 844 : 390); exc.length = 0;
        await c.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?colonne=0&tel=1&intro=ancien&attente=0&prebati=0&carte=grotte&meteo=${meteo}&pistegraine=${graine}` + (q ? '&' + q : '') });
        await dormir(1500); await attend("!!window.__gameReady&&typeof dbgJouer==='function'", 60000); await dormir(1000);
        await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
        let ok = false; for (let i = 0; i < 60 && !ok; i++) { if (i % 12 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev('(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()'); } catch (e) {} }
        if (!ok) throw new Error('course pas lancée');
        await c.ev('window.dbgAuto&&dbgAuto(1,0,{nit:0});1');
        if (+palier) { await c.ev(`(function(){var r=dbgTrace({graine:${+graine},palier:${+palier}});return 1})()`, 60000); await dormir(2500); }
        if (!await attend('dbgGrotte().pret', 120000)) throw new Error('grotte pas prête');
        await dormir(1500); await c.ev(CACHE);
        await attend('dbgGrotte().lotsRestants===0', 30000); const info = await c.ev('(function(){var g=dbgGrotte(),n=g.n||{};return JSON.stringify({lac:g.lac,eau:g.eau,nappes:g.nappes||null,lots:n.lots,petits:n.petits,tri:n.triangles,restants:g.lotsRestants,file:g.file})})()'); /* les petits tronçons fondus en lots (grtLots) : sinon les appels de dessin dépendent du moment de la capture */
        for (const v of VUES) {
          const m9 = /^(lave|eau)(-?\d+)$/.exec(v), k = `g${graine}p${palier}-${v}`;
          if (v === 'pire') { const L9 = JSON.parse(A.libre || '{}')[`g${graine}p${palier}`]; if (!L9) continue; cams[k] = Object.assign({ fov: 70 }, L9); } /* --libre '{"g452p0":{"p":[…],"c":[…]}}' : la vue du pire triangle du banc Node (grotte-nappes.cjs, champ « vue ») */
          if (!cams[k]) { cams[k] = await c.ev(`(function(){var o=dbgGrotte('lac',{k:'${m9[1]}',d:${+m9[2]},dis:1});return typeof o==='string'?null:o})()`); fs.writeFileSync(CAMS, JSON.stringify(cams)); }
          if (!cams[k]) { console.log('VUE', nom, v, 'pas de lac'); continue; }
          await c.ev(`dbgGrotte('vue',${JSON.stringify(cams[k])})`); await dormir(700); await c.ev(`dbgGrotte('vue',${JSON.stringify(cams[k])})`);
          const r = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, `${nom}-${v}-${fmt}.png`), Buffer.from(r.data, 'base64'));
          console.log('MESURE', nom, v, fmt, await c.ev(MESURE), Math.round((Date.now() - t0) / 1000) + 's');
        }
        VUES = VUES0; console.log('NAPPES', nom, fmt, info, 'exc', JSON.stringify(exc.slice(0, 3)));
      } catch (e) { VUES = VUES0; console.log('ECHEC', nom, String(e).slice(0, 300)); }
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
