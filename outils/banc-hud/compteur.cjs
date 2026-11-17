// LE BANC DU COMPTEUR D'ARGENT (2026-11-17, qualité · compteur — Sacha : « Le compteur d'argent est buggé, il est devenu tout petit. »)
// Une course (édition téléphone, marges d'iPhone 13 Pro), puis, pour chaque variante d'URL : la taille de police de l'argent pour 999 … 9 999 999 €,
// debout et couché, posée « à froid » (dbgCash) ET arrivée par un GAIN (dbgSolde({course}) : le total défile et FRAPPE pendant qu'il change de longueur),
// le pivot couché → debout en pleine course, le pivot en PAUSE, et une photo à 9 999 999 € dans chaque sens.
//   node outils/banc-hud/compteur.cjs --out /chemin [--variantes "sans=cashfit2,,cashplace=a,cashplace=b,cashplace=c"] [--http 9761 --cdp 9762]
// Sous verrou : ~/cash-car/verrou-banc.sh prendre compteur … rendre.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises-compteur'));
const P_HTTP = +(A.http || 9761), P_CDP = +(A.cdp || 9762);
const VARS = (A.variantes != null ? A.variantes : 'sans=cashfit2,').split(',');
const MONTANTS = [999, 9999, 99999, 999999, 9999999];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* marges du 13 Pro : debout 47 en haut / 34 en bas ; couché 47 à gauche et à droite, 21 en bas */
const MARGES = `window.__marges=function(){var d=innerHeight>innerWidth,s=document.documentElement.style;s.setProperty('--ccT',(d?47:0)+'px');s.setProperty('--ccB',(d?34:21)+'px');s.setProperty('--ccL',(d?0:47)+'px');s.setProperty('--ccR',(d?0:47)+'px')};document.addEventListener('DOMContentLoaded',function(){window.__marges()});addEventListener('resize',function(){window.__marges()});`;
const LIT = `(function(){var s=document.querySelector('#cashHud .chV span'),i=document.querySelector('#cashHud .chV i'),v=document.querySelector('#cashHud .chV'),nb=document.getElementById('nitroBar'),av=document.getElementById('avVal'),g=document.getElementById('tGear');
  function R(e){if(!e)return null;var r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}
  return {t:s&&s.textContent,fs:s&&parseFloat(getComputedStyle(s).fontSize),fi:i&&parseFloat(getComputedStyle(i).fontSize),chV:R(v),chVoff:v?[v.offsetLeft+v.offsetParent.offsetLeft,v.offsetWidth]:null,nitro:R(nb),aura:R(av),pause:R(g),vp:[innerWidth,innerHeight],ax:window.dbgCompteur?dbgCompteur():null}})()`;
const SAUF = "(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()";

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const rapport = {};
  const { ch, pg } = await lanceChrome(P_CDP, tmp(), 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); } catch (_) {} });
  const taille = async (w, h) => { await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h,
    screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
    try { await c.ev("window.__marges&&window.__marges();dispatchEvent(new Event('orientationchange'));1"); } catch (e) {} };
  const photo = async (nom, w, h) => { const sh = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } }, 40000); fs.writeFileSync(path.join(OUT, nom + '.png'), Buffer.from(sh.data, 'base64')); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + MARGES });
    for (const q of VARS) {
      const nomV = q || 'nouveau', R = rapport[nomV] = { debout: {}, couche: {} };
      await taille(390, 844);
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&app=1&garde=1&intro=ancien&attente=0&sans=hudcalme` + (q ? '&' + q : '') });
      let pret = false;
      for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
      if (!pret) { R.echec = 'le jeu ne démarre pas'; console.log(nomV, R.echec); continue; }
      await dormir(1500);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(1500);
      try { await c.ev('dbgJouer();1'); } catch (e) {}
      let enC = false; for (let i = 0; i < 90; i++) { await dormir(500); try { if (await c.ev(SAUF)) { enC = true; break; } } catch (e) {} }
      if (!enC) { R.echec = 'la course ne part pas'; await photo(nomV + '-echec', 390, 844); console.log(nomV, R.echec); continue; }
      await c.ev('dbgImmortel(1);1'); await dormir(2600); /* l'entrée en scène du HUD (1,2 s + 0,5 s) est passée */
      for (const [sens, w, h] of [['debout', 390, 844], ['couche', 844, 390]]) {
        await taille(w, h); await dormir(900);
        for (const v of MONTANTS) {
          /* DÉTERMINISTE : posé puis lu dans la MÊME évaluation (la course gagne de l'argent entre deux appels). dbgCash(1) d'abord : soldeFit ne remesure que si la longueur change */
          const froid = await c.ev(`(function(){dbgCash(1);dbgCash(${v});return ${LIT}})()`);
          await dormir(400);
          const gain = await c.ev(`(function(){dbgCash(1);dbgCash(${v},true);return ${LIT}})()`); /* le même chiffre posé PENDANT la frappe (scale 1,07) */
          await dormir(400);
          R[sens][v] = { froid: froid.fs, gain: gain.fs, euro: froid.fi, froidL: froid, gainL: gain };
          console.log(nomV, sens, String(v).padStart(8), 'froid', froid.fs, 'frappe', gain.fs, '€', froid.fi, 'chV', JSON.stringify(froid.chV), 'repos', JSON.stringify(froid.chVoff), 'nitro', JSON.stringify(froid.nitro), 'x0', froid.ax && froid.ax.x0, 'xmin', froid.ax && froid.ax.xmin);
        }
        await c.ev('dbgCash(9999999);1'); await dormir(600);
        await photo(nomV + '-' + sens + '-9999999', w, h);
        R[sens].photo = await c.ev(LIT);
      }
      /* PIVOT en pleine course à 55 555 € (debout ≈ 11 px, couché 16) : couché → debout, une lecture toutes les 100 ms pendant 1,5 s */
      const suite = async (n) => { const o = []; for (let i = 0; i < n; i++) { o.push(await c.ev(`(function(){var l=${LIT};return l.fs+'/'+(l.ax&&l.ax.x0)})()`)); await dormir(100); } return o; };
      await taille(844, 390); await dormir(1200); await c.ev('(function(){dbgCash(1);dbgCash(55555);return 1})()'); await dormir(300);
      await taille(390, 844); R.pivot = await suite(15);
      /* RETOUR D'ARRIÈRE-PLAN + PIVOT : couché, l'onglet se cache (visibilitychange : la partie se met en pause), il revient COUCHÉ (vue de la mauvaise taille), puis debout ; reprise */
      await taille(844, 390); await dormir(1200); await c.ev('(function(){dbgCash(1);dbgCash(55555);return 1})()'); await dormir(300);
      const vis = (h) => `(function(){Object.defineProperty(document,'hidden',{get:function(){return ${h}},configurable:true});Object.defineProperty(document,'visibilityState',{get:function(){return '${h ? 'hidden' : 'visible'}'},configurable:true});document.dispatchEvent(new Event('visibilitychange'));return 1})()`;
      await c.ev(vis(true)); await dormir(1500); await c.ev(vis(false)); await dormir(150);
      await taille(390, 844); await dormir(800);
      R.retourPause = await c.ev(LIT);
      R.retourEtat = await c.ev("(function(){var s=dbgState();return JSON.stringify({running:s.running,paused:s.paused,body:document.body.className.slice(0,120)})})()");
      try { await c.ev('window.__panBascule&&window.__panBascule();1'); } catch (e) {}
      R.retour = await suite(15);
      console.log(nomV, 'pivot', R.pivot.join(' '), '| retour', R.retourEtat, 'en pause', R.retourPause.fs, 'reprise', R.retour.join(' '));
      R.erreurs = erreurs.splice(0);
    }
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); rapport.echec = String(e).slice(0, 300); }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); }
  fs.writeFileSync(path.join(OUT, 'compteur.json'), JSON.stringify(rapport, null, 1));
  srv.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
