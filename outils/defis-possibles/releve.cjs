/* LE RELEVÉ DE CE QUI SE GAGNE ENCORE (2026-11-21, lot qa/defispossibles) — Chrome sans fenêtre, MUET (--mute-audio, sfx/mus/vox à false), dans le vrai jeu assemblé.
   Charge VERSION PRINCIPALE/index.html deux fois — en TÉLÉPHONE (?tel=1&appareil=iPhone14,2) et en ORDINATEUR (sans tel) — et écrit le relevé de dbgDefisPossibles()
   (missions/defis-possibles.js) dans <sortie>/releve-tel.json et <sortie>/releve-pc.json. Le jugement est fait par juge.cjs, sans Chrome.
   ⚠ UN Chrome à la fois : lancer sous ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. Le profil Chrome est effacé à la fin.
   node outils/defis-possibles/releve.cjs --sortie <dossier> [--http 9971] [--cdp 9972] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9971), P_CDP = +(A.cdp || 9972), SORTIE = A.sortie || '.';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const MUET = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bienv: 1 };
const J = o => JSON.stringify(o);

async function releve(nom, tel, port) {
  const prof = tmp(); const { ch, pg } = await lanceChrome(port, prof, tel ? 390 : 1280, tel ? 844 : 800);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') err.push(((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text || '').slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (tel) { await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();localStorage.setItem("cashcarSave",' + J(J(MUET)) + ');}}catch(e){}' });
    const q = tel ? 'tel=1&appareil=iPhone14,2&' : '';
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?${q}colonne=0&simu=1&garde=1&intro=ancien&attente=0` });
    let pret = false; for (let i = 0; i < 160 && !pret; i++) { await dormir(500); try { pret = await c.ev('!!window.__gameReady&&typeof window.dbgDefisPossibles==="function"', 8000); } catch (x) {} }
    if (!pret) throw new Error(nom + ' : le jeu ne démarre pas');
    await dormir(1500);
    const r = await c.ev('window.dbgDefisPossibles()', 30000);
    r.exceptions = err.slice();
    fs.mkdirSync(SORTIE, { recursive: true }); fs.writeFileSync(path.join(SORTIE, 'releve-' + nom + '.json'), J(r));
    console.log(nom + ' : ' + r.voitures.length + ' voitures, ' + r.missions.length + ' missions, ' + Object.keys(r.cartes).length + ' cartes, exceptions ' + err.length);
  } finally { try { c.close(); } catch (x) {} tueChrome(ch); await dormir(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (x) {} }
}
(async () => {
  for (const p of [P_HTTP, P_CDP, P_CDP + 1]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  try { await releve('tel', true, P_CDP); await releve('pc', false, P_CDP + 1); } catch (e) { console.error(String(e)); process.exitCode = 1; }
  srv.close();
})();
