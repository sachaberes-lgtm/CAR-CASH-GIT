// LE BANC DU HUD (2026-11-07, Sacha : « revois le HUD parfaitement, tout doit être bien proportionné et placé ») — photographie le HUD DE
// COURSE en édition téléphone, debout et couché, à plusieurs moments (départ, course, HUD chargé : chaîne + pouvoirs + flow, HUD discret,
// record, pause) et relève la BOÎTE de chaque bloc du HUD (rects.json) pour mesurer marges, alignements et chevauchements.
// Aucune dépendance (cdp.cjs du banc des traînées). Profil Chrome persistant (--prof) : la compilation GPU à froid prend ~60 s, 3 s à chaud.
//   node outils/banc-hud/photos.cjs --out /chemin [--formats debout,couche] [--prof /chemin/profil] [--http 9751 --cdp 9752] [--q "x=1"]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const PROF = A.prof ? path.resolve(A.prof) : tmp();
const P_HTTP = +(A.http || 9751), P_CDP = +(A.cdp || 9752);
const FORMATS = { debout: [390, 844], couche: [844, 390], i7couche: [667, 375], i7debout: [375, 667], maxdebout: [430, 932], maxcouche: [932, 430] };
const FMTS = (A.formats || 'debout,couche').split(',');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const IDS = ['tGear', 'nitroWrap', 'nitroBar', 'pwrChip', 'flowHud', 'auraV2', 'avCh', 'avRec', 'cashHud', 'triade', 'airHud', 'campChip', 'tNitro', 'tSteer', 'tStick', 'misBan', 'coach', 'lvlBan', 'msg', 'verdHud', 'popTxt', 'engBig'];
const RECTS = `(function(){var o={vp:[innerWidth,innerHeight],body:document.body.className};${JSON.stringify(IDS)}.forEach(function(id){var e=document.getElementById(id);if(!e)return;var c=getComputedStyle(e),b=e.getBoundingClientRect();
  if(c.display==='none'||c.visibility==='hidden'||b.width<1||b.height<1)return;o[id]={l:Math.round(b.left),t:Math.round(b.top),r:Math.round(b.right),b:Math.round(b.bottom),w:Math.round(b.width),h:Math.round(b.height),op:+c.opacity,fs:c.fontSize,z:c.zIndex,zoom:c.zoom}});
  var ps=document.querySelectorAll('#pwrChip .pw');o.pw=[].map.call(ps,function(e){var b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)]});return JSON.stringify(o)})()`;

/* chaque moment : ce qu'on déclenche, combien attendre avant la photo */
const MOMENTS = [
  { n: 'depart', att: 1200 },
  { n: 'course', att: 5000 },
  { n: 'charge', js: "dbgHud('chaine',3);dbgPwr('n');dbgPwr('a');dbgHud('flow',60);dbgHud('record',500)", att: 1200 },
  { n: 'charge-2', att: 2200 },
  { n: 'discret', att: 3200 },
  { n: 'frenesie', js: "dbgFren('v',100);dbgFren('entre')", att: 2500 },
  { n: 'pause', js: 'window.__panBascule()', att: 1200 },
  { n: 'reprise', js: 'window.__panBascule()', att: 800, sans: 1 },
];

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const rapport = {};
  for (const fmt of FMTS) {
    const [W, H] = FORMATS[fmt];
    const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
    const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
    const erreurs = [];
    c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (_) {} });
    const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); };
    const photo = async (nom) => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, fmt + '-' + nom + '.png'), Buffer.from(sh.data, 'base64')); };
    try {
      await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
      await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
      let pret = false;
      for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
      if (!pret) throw new Error('le jeu ne démarre pas');
      await dormir(2500);
      /* le splash : toucher (sinon start() refuse tant que #splash existe) */
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 'pas de splash';try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 'splash touché'})()");
      await dormir(2500);
      let j = ''; try { j = JSON.stringify(await c.ev('dbgJouer()')).slice(0, 200); } catch (e) { j = 'erreur ' + e.message; }
      let enCourse = false;
      for (let i = 0; i < 90; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {}
        if (i % 10 === 9) { try { console.log(fmt, 'attente', i, await c.ev("(function(){var s=dbgState(),l=dbgLier(),d=dbgDepart();return JSON.stringify({started:s.started,running:s.running,mode:s.mode,lier:l.enCours,dem:l.demarrage,depart:d,body:document.body.className.slice(0,80),garage:document.getElementById('garage').className.slice(0,60)})})()")); } catch (e) { console.log('diag', e.message.slice(0, 100)); } } }
      rapport[fmt + '-jouer'] = { j, enCourse };
      console.log(fmt, 'jouer :', j, 'en course :', enCourse);
      if (!enCourse) { await photo('echec'); throw new Error('la course ne part pas'); }
      for (const m of MOMENTS) {
        let ok = '';
        if (m.js) { try { await c.ev(m.js + ';1'); } catch (e) { ok += ' js:' + e.message.slice(0, 120); } }
        await dormir(m.att);
        if (m.sans) continue;
        await photo(m.n);
        let rects = null; try { rects = JSON.parse(await c.ev(RECTS)); } catch (e) { ok += ' rects:' + e.message.slice(0, 80); }
        rapport[fmt + '-' + m.n] = { ok, rects };
        console.log(fmt + '-' + m.n, ok || 'ok', 'erreurs:', erreurs.length);
      }
      rapport[fmt + '-erreurs'] = erreurs;
    } catch (e) { console.log(fmt, 'ÉCHEC :', String(e).slice(0, 300)); rapport[fmt + '-echec'] = String(e).slice(0, 300); } finally { fin(); }
  }
  fs.writeFileSync(path.join(OUT, 'rects-' + FMTS.join('-') + '.json'), JSON.stringify(rapport, null, 1));
  srv.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
