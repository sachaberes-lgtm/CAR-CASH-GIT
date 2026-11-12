// LE BANC DU SAUT (2026-11-12, Sacha : « on va dans les réglages et quand on revient la voiture flotte au mauvais endroit pendant un
// instant avant de revenir à sa place ») — accueil → une page (RÉGLAGES, BOUTIQUE) → RETOUR, et à CHAQUE image la place de la caisse à
// l'écran (dbgChute().ecran), le cadrage (menuCadre : nx ny fr fh — la place et la taille), le décentrement de l'atelier (GAR.cdx/cdy) et les classes des écrans. Il sort la
// course de la caisse autour du retour, et des photos (une toutes les ~60 ms) pour voir ce que le joueur voit.
//   node outils/banc-ecrans/saut.cjs --out /chemin [--formats debout,couche,pc720] [--page set|shop] [--q "chute=0"] [--http 9931 --cdp 9932]
//   [--prof /chemin]  profil Chrome PERSISTANT (1er lancement : ~80 s de chauffe, sinon la 3D reste noire)   [--tenue 2500] ms passés dans la page   [--tours 7] allers-retours, la tenue allongée de 170 ms à chaque tour (toutes les phases du cache d'1 s)
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises-saut'));
const PROF = path.resolve(A.prof || path.join(require('os').tmpdir(), 'banc-saut-prof'));
const P_HTTP = +(A.http || 9931), P_CDP = +(A.cdp || 9932);
const FORMATS = { debout: [390, 844], couche: [844, 390], pc720: [1280, 720, 'pc'], pc1080: [1920, 1080, 'pc'] };
const FMTS = (A.formats || 'debout,couche').split(',');
const PAGE = A.page || 'set', TENUE = +(A.tenue || 2500), TOURS = +(A.tours || 7);
const Q = A.q ? '&' + A.q.replace(/^[?&]/, '') : '';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

/* la sonde : une ligne par image */
const SONDE = `(function(){window.__S=[];window.__M=[];var G=null;try{G=dbgGarObj()}catch(e){}
function f(t){try{var d=dbgChute(),h=document.getElementById('mHome'),p=document.querySelector('.mscr.on'),b=document.body.classList;
window.__S.push([Math.round(t),d.ecran[0],d.ecran[1],d.cadre[0],d.cadre[1],G?+(+G.cdx||0).toFixed(1):0,G?+(+G.cdy||0).toFixed(1):0,(p?p.id:'-')+(h&&h.classList.contains('sort')?'+sort':''),(d.on?'C':'')+(b.contains('garMenuH')?'G':'')+(b.contains('titreCiel')?'T':''),(function(){var e=h&&h.querySelector('.mTitle');return e?getComputedStyle(e).translate:'-'})(),d.cadre[2],d.cadre[3]]);}catch(e){window.__S.push([Math.round(t),'err',String(e).slice(0,80)]);}
requestAnimationFrame(f);}requestAnimationFrame(f);})();1`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  for (const fmt of FMTS) {
    const [W, H, TYPE] = FORMATS[fmt], PC = TYPE === 'pc';
    for (let i = 0; i < 30 && !portLibre(P_CDP); i++) await dormir(1000);
    const { ch, pg } = await lanceChrome(P_CDP, PROF + '-' + fmt, W, H);
    const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
    const erreurs = [], images = []; let filme = false;
    c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
      if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300));
      if (m.method === 'Page.screencastFrame') { c.send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {}); if (filme) images.push([Date.now(), m.params.data]); }
    } catch (_) {} });
    const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch);
      if (process.platform === 'win32') try { require('child_process').execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'chrome.exe\'\\" | Where-Object { $_.CommandLine -match \'remote-debugging-port=' + P_CDP + ' \' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"', { stdio: 'ignore' }); } catch (e) {} };
    try {
      await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
      await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (PC) await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
      else {
        await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
        await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
        await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
        await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
      }
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0${PC ? '' : '&tel=1'}&intro=ancien&attente=0${Q}` });
      let pret = false;
      for (let i = 0; i < 300 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgChute==='function'&&document.getElementById('mHome').classList.contains('on')", 8000); } catch (e) {} }
      if (!pret) throw new Error('le jeu ne démarre pas');
      await dormir(+(A.chauffe || 6000));
      /* l'écran de démarrage (intro=ancien) attend un toucher : on le touche jusqu'à ce qu'il parte */
      for (let i = 0; i < 20; i++) { if (!(await c.ev("!!document.getElementById('splash')"))) break;
        if (PC) { await c.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: W / 2, y: H / 2, button: 'left', clickCount: 1 }); await dormir(60); await c.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: W / 2, y: H / 2, button: 'left', clickCount: 1 }); }
        else { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: W / 2, y: H / 2 }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
        await dormir(1500); }
      await dormir(3000);
      const tap = async (sel) => { const r = await c.ev(`(function(){for(const e of document.querySelectorAll(${JSON.stringify(sel)})){const b=e.getBoundingClientRect();if(b.width<2||b.height<2)continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none')continue;window.__M.push([Math.round(performance.now()),${JSON.stringify(sel)}]);return [b.left+b.width/2,b.top+b.height/2]}return null})()`);
        if (!r) { console.log('  introuvable :', sel); return false; }
        if (PC) { await c.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r[0], y: r[1] }); await c.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r[0], y: r[1], button: 'left', clickCount: 1 }); await dormir(60);
          await c.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r[0], y: r[1], button: 'left', clickCount: 1 }); return true; }
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
        await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true; };
      await c.ev(SONDE);
      await dormir(1500);
      const photo = async (n) => { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }, 30000); fs.writeFileSync(path.join(OUT, fmt + '-' + n + '.jpg'), Buffer.from(sh.data, 'base64')); };
      await photo('0-accueil');
      /* LES TOURS : le cadrage se remesure une fois par seconde — selon l'instant du RETOUR dans cette seconde, la mesure tombe ou non
         pendant l'entrée de l'accueil. On refait donc l'aller-retour en décalant la tenue de 170 ms à chaque tour : toutes les phases. */
      let pire = 0;
      for (let tour = 0; tour < TOURS; tour++) {
        const n0 = +(await c.ev('window.__M.length'));
        await tap('#mHome [data-m="' + PAGE + '"]');
        await dormir(TENUE + tour * 170);
        if (!tour) await photo('1-page');
        if (!tour) { await c.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 }); filme = true; }
        const tRet = Date.now();
        await tap(PAGE === 'set' ? '#mSet [data-m="back"]' : PAGE === 'shop' ? '#mShop [data-m="back"]' : '#mModes [data-m="back"]');
        await dormir(3000);
        if (!tour) { filme = false; await c.send('Page.stopScreencast'); await photo('9-retour');
          let k = 0; for (const [t, d] of images) { const dt = t - tRet; if (dt > 1400) break; fs.writeFileSync(path.join(OUT, fmt + '-film-' + String(k++).padStart(2, '0') + '-' + String(dt).padStart(4, '0') + 'ms.jpg'), Buffer.from(d, 'base64')); } }
        const S = JSON.parse(await c.ev('JSON.stringify(window.__S)')), M = JSON.parse(await c.ev('JSON.stringify(window.__M)'));
        if (!tour) fs.writeFileSync(path.join(OUT, fmt + '-sonde.json'), JSON.stringify({ M, S }));
        /* le résumé : le cadrage de repos (juste avant d'entrer dans la page), puis chaque changement de cadrage jusqu'à 2,5 s après le RETOUR */
        const tA = M[n0] ? M[n0][0] : 0, tR = M[n0 + 1] ? M[n0 + 1][0] : 0;
        const av = S.filter(s => s[0] < tA && s[1] !== 'err').pop() || [], cle = s => s[3] + ' ' + s[4] + ' ' + s[10] + ' ' + s[11];
        let der = cle(av), ecart = 0; const suite = [];
        for (const s of S) { if (s[0] < tA || s[0] > tR + 2500 || s[1] === 'err') continue;
          ecart = Math.max(ecart, Math.hypot(s[3] - av[3], s[4] - av[4]), Math.abs(s[10] - av[10]), Math.abs(s[11] - av[11])); if (cle(s) !== der) { der = cle(s); suite.push((s[0] - tR) + ' ms → ' + der + ' (caisse ' + s[1] + ' ' + s[2] + ', titre ' + s[9] + ')'); } }
        pire = Math.max(pire, ecart);
        console.log(fmt, 'tour', tour, '| cadrage de repos', cle(av), '| écart max du cadrage', ecart.toFixed(2), suite.length ? '| ' + suite.join(' ; ') : '| ne bouge pas');
      }
      console.log(fmt, pire > .005 ? 'SAUT : le cadrage bouge de ' + pire.toFixed(2) + ' au retour' : 'OK : le cadrage ne bouge pas, sur ' + TOURS + ' tours', '| erreurs', erreurs.length);
      if (erreurs.length) console.log('  erreurs :', erreurs.slice(0, 5));
    } catch (e) { console.log(fmt, 'ÉCHEC :', String(e).slice(0, 300)); } finally { fin(); }
  }
  srv.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
