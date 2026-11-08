/* banc temporaire : l'écran titre bouge-t-il après l'intro ? */
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9795), P_CDP = +(A.cdp || 9796);
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3] };
(async () => {
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  try {
    await c.send('Page.enable');
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.cashcarSave=${JSON.stringify(JSON.stringify(SAVE))}}catch(e){}
      window.__fr=[];(function f(n){window.__fr.push(n);if(window.__fr.length>400)window.__fr.shift();requestAnimationFrame(f);})(0);` });
    await c.send('Page.navigate', { url: `http://localhost:${P_HTTP}/index.html?colonne=0&intro=muet&${A.q || ''}` });
    for (let k = 0; k < 40; k++) {
      await dormir(3000);
      try { console.log(k * 3, await c.ev(`JSON.stringify({cou:String(window.__introCouvre),intro:window.__intro,sp:!!document.getElementById("splash"),err:window.__introErr,fr:window.__fr.filter(x=>x>performance.now()-2000).length,hdr:(window.dbgIntro&&window.dbgIntro.etat())?JSON.stringify([window.dbgIntro.etat().lance,window.dbgIntro.etat().fini,window.dbgIntro.etat().casse]):null})`, 4000)); } catch (e) { console.log(k * 3, 'ERR', String(e).slice(0, 80)); }
    }
  } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
})();
