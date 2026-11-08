/* LE BANC DU DÉPART (2026-11-08, Sacha : « les animations au lancement ont encore de la latence ») : Chrome headless, téléphone émulé, sans son.
   Charge le jeu à froid, relève l'instant où le film d'intro part et les images LONGUES (> 33 ms) des 4 premières secondes du film.
   node outils/banc-course/depart.cjs [--q "calme=0"] [--http 9795] [--cdp 9796] */
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9795), P_CDP = +(A.cdp || 9796);
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3] };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  try {
    await c.send('Page.enable');
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.cashcarSave=${JSON.stringify(JSON.stringify(SAVE))}}catch(e){}
      window.__fr=[];window.__t0=performance.now();(function f(n){if(window.__pr)window.__fr.push([Math.round(n),Math.round((n-window.__pr)*10)/10]);window.__pr=n;requestAnimationFrame(f);})(0);requestAnimationFrame(function f(n){if(window.__pr)window.__fr.push([Math.round(n),Math.round((n-window.__pr)*10)/10]);window.__pr=n;requestAnimationFrame(f);});` });
    await c.send('Page.navigate', { url: `http://localhost:${P_HTTP}/index.html?colonne=0&intro=muet&${A.q || ''}` });
    let lance = null;
    for (let i = 0; i < 90 && lance === null; i++) {
      await dormir(500);
      try { const r = await c.ev(`(function(){const e=window.dbgIntro&&window.dbgIntro.etat();return e&&e.lance?Math.round(performance.now()-(e.t||0)*1000):null})()`, 4000); if (r !== null && r !== undefined) lance = r; } catch (e) {}
    }
    console.log("diag", await c.ev(`JSON.stringify({intro:window.__intro,dbg:typeof window.dbgIntro,err:window.__introErr,sp:!!document.getElementById("splash"),rs:document.readyState,href:location.href})`, 4000));
    await dormir(4200);
    const cal = await c.ev(`JSON.stringify(window.dbgIntro&&window.dbgIntro.calme?window.dbgIntro.calme():null)`, 4000);
    const fr = JSON.parse(await c.ev(`JSON.stringify(window.__fr||[])`, 8000));
    const apres = fr.filter(x => x[0] >= lance && x[0] < lance + 4000), longues = apres.filter(x => x[1] > 33);
    console.log(JSON.stringify({ q: A.q || '(défaut)', filmPartiA_ms: lance, images4s: apres.length, longues: longues.length, pire_ms: Math.max(0, ...apres.map(x => x[1])), detail: longues.slice(0, 8), calme: cal }));
  } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
})();
