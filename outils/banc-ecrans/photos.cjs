// LE BANC DES ÉCRANS (2026-11-04, Sacha : « chaque écran, chaque interface doit être parfaite ») — photographie CHAQUE écran du jeu
// en édition téléphone (tactile émulé), debout et couché, et relève les défauts mesurables (cibles < 44 px, chevauchements, textes coupés,
// touches hors écran, polices hors Press Start, corps employés) avec outils/banc-ecrans/audit.js. Aucune dépendance (cdp.cjs du banc des traînées).
//   node outils/banc-ecrans/photos.cjs --out /chemin [--formats debout,couche,i7couche] [--ecrans accueil,reglages,...] [--http 9741 --cdp 9742]
//   [--save riche|neuf]  (riche : tout débloqué, argent ; neuf : premier lancement)
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9741), P_CDP = +(A.cdp || 9742);
const FORMATS = { debout: [390, 844], couche: [844, 390], i7couche: [667, 375], i7debout: [375, 667], maxdebout: [430, 932], maxcouche: [932, 430] };
const FMTS = (A.formats || 'debout,couche').split(',');
const ECRANS = A.ecrans ? A.ecrans.split(',') : null;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = A.save === 'neuf' ? null : { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, cousin: A.save === 'riche' ? 1 : 0, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const AUDIT = fs.readFileSync(path.join(__dirname, 'audit.js'), 'utf8');

/* chaque écran : comment y aller depuis l'écran précédent (la liste s'enchaîne), et combien attendre avant la photo */
const ETAPES = [
  { n: 'accueil', js: "window.__mGo('home')", att: 1800 },
  { n: 'reglages', js: "window.__mGo('set')", att: 1500 },
  { n: 'achat', js: "window.__mGo('shop')", att: 1800 },
  { n: 'garage', tap: '#mHome [data-m="garage"]', js: "window.__mGo('home')", att: 3500 },
  { n: 'inventaire', tap: '#gvCof', att: 2500 },
  { n: 'inventaire-voitures', tap: '.gTab[data-tab="voiture"]', att: 1500 },
  { n: 'inventaire-peinture', tap: '.gTab[data-tab="peinture"]', att: 1500 },
  { n: 'garage-retour', tap: '#gvCof', att: 1500, sans: 1 },
  { n: 'boutique', tap: '#gShopBas', fx: .82, fy: .84, att: 4500 },
  { n: 'boutique-ailes', tap: '#gBqCats [data-c="aile"]', att: 1500 },
  { n: 'boutique-retour', tap: '#gShopBas', fx: .82, fy: .84, att: 2500, sans: 1 },
  { n: 'missions', tap: '#gvMis', att: 2500 },
  { n: 'missions-retour', tap: '#gMis .gmHome', att: 1500, sans: 1 },
  { n: 'profil', tap: '#gProf', att: 1500 },
  { n: 'plaque', tap: '#prof .pfChg', att: 1500 },
  { n: 'plaque-retour', tap: '#plq .plRet', att: 800, sans: 1 },
  { n: 'profil-retour', tap: '#prof .pfRet', att: 1200, sans: 1 },
  { n: 'course', tap: '#gJouer', js2: 'window.dbgJouer&&dbgJouer()', att: 16000 }, /* (2026-11-07) le toucher ne part pas en headless : dbgJouer() après lui */
  { n: 'pause', js: 'window.__panBascule()', att: 1500 },
  { n: 'pause-reglages', tap: '#tPanel [data-a="tous"]', att: 1500 },
  { n: 'pause-reglages-retour', tap: '#mSet .c6Ret,#mSet .mBack', att: 1200, sans: 1 },
  { n: 'pause-reprise', js: 'window.__panBascule()', att: 1200, sans: 1 },
  { n: 'mort', js: "dbgDauphin('boom')", att: 7000 },
  { n: 'mort-recompense', tap: '#mvW .mvBt', att: 1800 }, /* (2026-11-07) la mort ouvre d'abord la prochaine récompense, puis la série de connexion : on les passe pour photographier l'écran de mort lui-même */
  { n: 'mort-serie', tap: '#serieW .swBt', att: 2600 },
  { n: 'mort-garage', tap: '#mDead [data-m="garage"]', att: 3500 },
];

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const rapport = {};
  for (const fmt of FMTS) {
    const [W, H] = FORMATS[fmt];
    const { ch, pg } = await lanceChrome(P_CDP, prof + fmt, W, H);
    const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
    const erreurs = [];
    c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (_) {} });
    const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); };
    try {
      await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
      await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
      if (SAVE) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1` });
      for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) break; } catch (e) {} }
      await dormir(2500);
      await c.ev(AUDIT);
      const tap = async (sel, fx, fy) => { const r = await c.ev(`(function(){const s=${JSON.stringify(sel)}.split(',');for(const q of s){const e=document.querySelector(q);if(!e)continue;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy},q]}return null})()`);
        if (!r) return 'introuvable : ' + sel;
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
        await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
      for (const et of ETAPES) {
        const voulu = ECRANS ? ECRANS.includes(et.n) : !et.sans; /* --ecrans : chaque étape est JOUÉE (la suivante en dépend), seules celles demandées sont photographiées */
        const cle = fmt + '-' + et.n; let ok = '';
        try {
          await c.ev('window.__gaps=[];(function(){var l=performance.now(),t0=l;function f(t){var d=t-l;if(d>50)window.__gaps.push(Math.round(d));l=t;if(t-t0<' + (et.att + 400) + ')requestAnimationFrame(f);}requestAnimationFrame(f);})();1');
          if (et.js) { try { await c.ev(et.js + ';1'); } catch (e) { ok += ' js:' + e.message.slice(0, 80); } await dormir(300); }
          if (et.tap) ok += ' tap:' + await tap(et.tap, et.fx, et.fy);
          if (et.js2) { await dormir(400); try { ok += ' js2:' + JSON.stringify(await c.ev(et.js2)).slice(0, 160); } catch (e) { ok += ' js2:' + e.message.slice(0, 80); } }
          await dormir(et.att);
          if (!voulu) continue;
          const n0 = erreurs.length;
          const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000);
          fs.writeFileSync(path.join(OUT, cle + '.png'), Buffer.from(sh.data, 'base64'));
          const audit = await c.ev('JSON.stringify(ccAudit())');
          const etat = await c.ev("JSON.stringify({body:document.body.className.slice(0,120),garage:document.getElementById('garage').className.slice(0,120),ecran:[...document.querySelectorAll('.mscr.on')].map(e=>e.id).join(' '),mort:document.getElementById('mDead').classList.contains('on')?['mObj','mChance','mChanceNon','mDouble','mDuo','mFin','mHero','mCashL'].map(function(k){var e=document.getElementById(k)||document.querySelector('#mDead .'+k);if(!e)return k+':absent';var b=e.getBoundingClientRect(),c=getComputedStyle(e);return k+':'+c.display+'/'+c.opacity.slice(0,4)+'/'+(e.hidden?'hidden':'')+'/'+Math.round(b.left)+','+Math.round(b.top)+','+Math.round(b.width)+'x'+Math.round(b.height)}):null})");
          const gaps = await c.ev('JSON.stringify(window.__gaps||[])');
          rapport[cle] = { ok, gaps: JSON.parse(gaps), audit: JSON.parse(audit), etat: JSON.parse(etat), erreurs: erreurs.slice(n0) };
          console.log(cle, ok, 'erreurs:', erreurs.length - n0, 'gels(ms):', gaps);
        } catch (e) { rapport[cle] = { erreur: String(e).slice(0, 300) }; console.log(cle, 'ÉCHEC', String(e).slice(0, 200)); }
      }
      rapport[fmt + '-erreurs'] = erreurs;
    } catch (e) { console.log(fmt, 'ÉCHEC du format :', String(e).slice(0, 200)); rapport[fmt + '-echec'] = String(e).slice(0, 300); } finally { fin(); }
  }
  fs.writeFileSync(path.join(OUT, 'rapport.json'), JSON.stringify(rapport, null, 1));
  srv.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
