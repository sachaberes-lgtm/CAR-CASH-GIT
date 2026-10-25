// PHOTOS DES TRAÎNÉES, DANS LE VRAI JEU, sans fenêtre et sans son (2026-10-20, session « Traînées pixel »).
//   node outils/banc-trainees/photos.cjs --ids sakura,billets,foudre --out /chemin/sortie [--n 3] [--gap 450] [--attente 3.5] [--dsf 2] [--url "?lisse"]
// Pour chaque traînée : le jeu est chargé (colonne=0, simu=1, sauvegarde muette), JOUER est touché, le pilote automatique roule la nitro tenue,
// --cond "<expr>" : ne prend l'image que quand l'expression est vraie (ex. "dbgTrx().cubes[1]>0" = un éclair est affiché) · --mode inv|bq|course
// --vue "az,d,h" : photo de côté en pause (dbgView) quand la condition est vraie, N fois · `dbgTrx(id)` force la traînée, puis N images de la toile WebGL sont prises (le rendu lui-même est détourné : pas de toile noire).
// ⚠ Ne JAMAIS éditer index.html pendant un passage (la mise à jour toute seule recharge la page). Ports par défaut 9731 / 9732.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, CDP, dormir, tmp } = require('./cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const IDS = (A.ids || 'sakura').split(',');
const N = +(A.n || 3), GAP = +(A.gap || 450), ATT = +(A.attente || 3.5), DSF = +(A.dsf || 2), W = +(A.w || 844), H = +(A.h || 390);
const MODE = A.mode || 'course'; // course · inv (la vitrine de l'inventaire) · bq (la boutique, salle blanche)
const P_HTTP = +(A.http || 9731), P_CDP = +(A.cdp || 9732), EXTRA = A.url || '';

const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, facile: 0, ex: { runs: 5 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const CAP = `window.__cond=null;window.__cap=function(n,gap){return new Promise(function(res){var R=dbgScene().rdr,o=R.render.bind(R),out=[],last=0;
  R.render=function(a,b){o(a,b);try{if(R.getRenderTarget()===null){var t=performance.now();if(t-last>=gap&&(!window.__cond||window.__cond())){last=t;out.push(R.domElement.toDataURL('image/jpeg',.92));
  if(out.length>=n){R.render=o;res(out);}}}}catch(e){R.render=o;res(out);}};});};true`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); srv.close(); process.kill(-ch.pid); } catch (e) {} };
  process.on('exit', fin);
  try {
    await c.send('Page.enable'); await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: false });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&simu=1${EXTRA ? '&' + EXTRA.replace(/^[?&]/, '') : ''}` });
    for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')", 8000)) break; } catch (e) {} }
    await dormir(1500);
    const err0 = await c.ev('JSON.stringify([window.__loopErr&&String(window.__loopErr),window.__banqErr&&String(window.__banqErr)])').catch(() => null);
    if (MODE === 'course') {
      await c.ev("document.querySelector('[data-m=\"play\"]').click()");
      for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev('(function(){var s=dbgState();return s.started&&!s.gameOver})()', 8000)) break; } catch (e) {} }
      await c.ev('dbgAuto(1,0,{nit:1})');
    } else if (MODE === 'inv') { // garage → INVENTAIRE → onglet TRAÎNÉES : l'aperçu en vraie lumière
      await c.ev('document.querySelector(\'[data-m="garage"]\').click();1'); await dormir(3000);
      await c.ev("document.getElementById('gvCof').click();1"); await dormir(2500);
      await c.ev('document.querySelector(\'.gTab[data-tab="trainee"]\').click();1'); await dormir(1500);
    } else if (MODE === 'bq') { // garage → BOUTIQUE (la salle blanche) → rayon TRAÎNÉES
      await c.ev('document.querySelector(\'[data-m="garage"]\').click();1'); await dormir(3000);
      await c.ev("document.getElementById('gShopBas').click();1"); await dormir(4500);
    }
    await c.ev(CAP);
    for (const id of IDS) {
      if (MODE === 'course') await c.ev(`dbgTrx(${JSON.stringify(id)})`); else console.log('hab', await c.ev(`JSON.stringify(dbgHab('trainee',${JSON.stringify(id)}))`).catch(e => String(e)));
      await dormir(ATT * 1000);
      const info = await c.ev('JSON.stringify([dbgTrx(),dbgState().started,dbgState().gameOver])').catch(e => String(e));
      if (A.cond) await c.ev(`window.__cond=function(){return ${A.cond}}`);
      let imgs;
      if (A.vue) { // --vue "az,d,h" : photo de COTÉ (dbgView, en pause) prise quand la condition est vraie, puis la course repart
        imgs = [];
        for (let k = 0; k < N; k++) {
          imgs.push(await c.ev(`new Promise(function(ok){var t0=performance.now();(function att(){if(!window.__cond||window.__cond()||performance.now()-t0>8000){var p=__cap(1,0);dbgView(${A.vue});p.then(function(a){ok(a[0])});}else setTimeout(att,16);})();})`, 60000));
          await c.ev("dbgAilesVue('reprend')"); await dormir(GAP);
        }
      } else imgs = await c.ev(`__cap(${N},${GAP})`, 90000);
      imgs.forEach((d, i) => fs.writeFileSync(path.join(OUT, `${id}-${i}.jpg`), Buffer.from(d.split(',')[1], 'base64')));
      console.log(id, imgs.length, 'images', info);
      const mort = await c.ev('dbgState().gameOver').catch(() => false);
      if (mort) { console.log('la partie est finie, arrêt'); break; }
    }
    console.log('erreurs au chargement :', err0, '· après :', await c.ev('JSON.stringify([window.__loopErr&&String(window.__loopErr),window.__banqErr&&String(window.__banqErr)])').catch(() => '?'));
  } finally { fin(); }
})().catch(e => { console.error(e); process.exit(1); });
