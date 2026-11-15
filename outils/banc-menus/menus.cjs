// LE BANC DES MENUS (2026-11-14, qualité · menus) — UN Chrome sans fenêtre et muet, l'iPhone émulé (tactile, UA iPhone, hover:none), le vrai jeu ;
// joue un SCÉNARIO (un module qui exporte async function(b)) sur une ou deux pages (avant / après) et photographie. Aucune dépendance (cdp.cjs des traînées).
//   node outils/banc-menus/menus.cjs --scenario s.cjs --out /chemin [--formats debout,couche,i7debout,i7couche] [--pages index-avant.html,index.html]
//        [--save riche|neuf] [--lang en] [--q "a=1&b=2"] [--http 9761 --cdp 9762]
// Le scénario reçoit b = { c, ev, tap, shot(nom), dormir, fmt, W, H, page, out, log } ; ev(expr) évalue dans la page.
// ⚠ JAMAIS de son : la sauvegarde posée avant le chargement coupe sfx, mus, vox. Verrou : sh ~/cash-car/verrou-banc.sh prendre "<lot>" avant, rendre après.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9761), P_CDP = +(A.cdp || 9762);
const FORMATS = { debout: [390, 844], couche: [844, 390], i7debout: [375, 667], i7couche: [667, 375], x812: [812, 375], z568: [568, 320], z693: [693, 320], s320: [320, 568], m932: [932, 430] };
const FMTS = (A.formats || 'debout,couche').split(',');
const PAGES = (A.pages || 'index.html').split(',');
const Q = A.q ? '&' + A.q.replace(/^[?&]/, '') : '';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = A.save === 'neuf' ? { v: 2, sfx: false, mus: false, vox: false } : { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, cousin: A.save === 'riche' ? 1 : 0, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const SCEN = require(path.resolve(A.scenario));

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof + 'menus', 844, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); } catch (_) {} });
  let code = 0;
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');' + (A.lang ? 'localStorage.setItem("ccLang",' + JSON.stringify(A.lang) + ');' : 'localStorage.removeItem("ccLang");') + '}catch(e){}' });
    for (const fmt of FMTS) {
      const [W, H] = FORMATS[fmt];
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      for (const page of PAGES) {
        const t0 = Date.now();
        await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/${page}?colonne=0&tel=1&simu=1&garde=1${Q}` });
        let pret = false;
        for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) { pret = true; break; } } catch (e) {} }
        console.log(fmt, page, pret ? 'prêt' : 'PAS PRÊT', Math.round((Date.now() - t0) / 1000) + ' s');
        await dormir(2000);
        const ev = (x, ms) => c.ev(x, ms);
        const tap = async (sel, fx, fy) => { const r = await c.ev(`(function(){const s=${JSON.stringify(sel)}.split(',');for(const q of s){const e=document.querySelector(q);if(!e)continue;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy},q]}return null})()`);
          if (!r) return 'introuvable : ' + sel;
          await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
          await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
        const pre = page.replace(/\.html$/, '').replace(/^index-?/, '') || 'apres';
        const shot = async (nom, clip) => { const o = { format: 'png' }; if (clip) o.clip = Object.assign({ scale: 1 }, clip);
          const sh = await c.send('Page.captureScreenshot', o, 30000); const f = path.join(OUT, `${fmt}-${pre}-${nom}.png`); fs.writeFileSync(f, Buffer.from(sh.data, 'base64')); return f; };
        const n0 = erreurs.length;
        try { await SCEN({ c, ev, tap, shot, dormir, fmt, W, H, page, pre, out: OUT, log: (...a) => console.log(fmt, pre, ...a) }); }
        catch (e) { console.log(fmt, pre, 'ÉCHEC du scénario :', String(e).slice(0, 400)); code = 1; }
        if (erreurs.length > n0) console.log(fmt, pre, 'erreurs de la page :', JSON.stringify(erreurs.slice(n0)).slice(0, 1200));
      }
    }
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); code = 1; }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  process.exit(code);
})().catch(e => { console.error(e); process.exit(1); });
