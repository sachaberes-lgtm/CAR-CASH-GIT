// LE BANC DU CŒUR DE LA ROULETTE (2026-11-11, Sacha : « quand tu gagnes un cœur à la roulette tu peux ressusciter direct ») — le vrai jeu
// dans un Chrome sans fenêtre : une partie, un jeton, la mort, la machine s'ouvre, le levier (lot forcé), puis le journal : la caisse repart-elle ?
//   node outils/banc-chance/coeur.cjs --out /chemin [--lot coeur|rien] [--t 30] [--http 9893 --cdp 9894] [--duree 9000] [--prof profil chaud]
//   --ferme 1 : CONTINUER touché dès le gain affiché · --tap 1 : trois taps pendant la course des rouleaux
//   --t : l'âge de la partie à la mort (s) — sous 20 s l'offre de seconde chance n'a pas lieu, au-dessus elle s'affiche d'abord
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9893), P_CDP = +(A.cdp || 9894), DUREE = +(A.duree || 9000), LOT = A.lot || 'coeur', TAGE = +(A.t || 30), FERME = A.ferme === '1', TAP = A.tap === '1';
const W = +(A.w || 844), H = +(A.h || 390);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, cousin: 0, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; erreurs.push(((d.exception && d.exception.description) || d.text || '').slice(0, 300)); } } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} try { tueChrome(ch); } catch (e) {} srv.close(); };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    console.log('prêt ?', await attend("!!window.__gameReady&&typeof dbgChance==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000));
    await dormir(3000);
    try { await c.ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); } catch (e) {}
    await dormir(800);
    await c.ev("dbgChance('bon',0);1");
    console.log('dbgJouer :', JSON.stringify(await c.ev('dbgJouer()')).slice(0, 200));
    console.log('en course ?', await attend("dbgChance().mode==='drive'&&!dbgChance().gameOver&&dbgChance().t>0.5", 60000, 400));
    await dormir(2000);
    await c.ev(`dbgSpin(1,${JSON.stringify(LOT)});dbgChance('t',${TAGE});1`);
    const etat = () => c.ev(`JSON.stringify((function(){const e=dbgChance(),sp=dbgSpin(),d=document.getElementById('mDead'),g=document.querySelector('#spinM .spGain');return {mode:e.mode,over:e.gameOver,auto:e.auto,used:e.used,offre:e.offre,bon:e.bons.chanceG,
      jetons:sp.jetons,bloque:sp.bloque,spin:sp.ouvert,roule:sp.roule,mDead:!!(d&&d.classList.contains('on')),gain:g?g.textContent.slice(0,60):'',slam:(document.getElementById('slam9')||{}).textContent||''};})())`);
    await c.ev("dbgChance('mort');1");
    const t0 = Date.now(), journal = []; let tire = false, n = 0, ferme = false, taps = 0;
    while (Date.now() - t0 < DUREE + 14000) {
      const e = JSON.parse(await etat()); e.t = Date.now() - t0; journal.push(e);
      if (e.offre && !tire) { /* l'offre de seconde chance (partie > 20 s) : on la laisse passer, comme un joueur qui ne regarde pas de pub */ }
      if (!tire && !e.spin && !e.offre && e.mDead && (e.bloque === undefined || /serieW/.test(e.bloque)) && journal.length % 4 === 0) { e.cont = 1; await c.ev("document.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true}));1"); } /* les écrans MISSIONS / SÉRIE du jour : CONTINUER, comme le joueur */
      if (e.spin && !e.roule && !tire && e.jetons > 0) { tire = true; e.tir = 1; await c.ev("dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));1");
        const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }, 30000); fs.writeFileSync(path.join(OUT, `${LOT}-machine.jpg`), Buffer.from(sh.data, 'base64')); }
      if (tire && FERME && !ferme && e.spin && !e.roule && e.jetons === 0 && /CHANCE/.test(e.gain)) { ferme = true; e.ferme = 1; await c.ev("dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));1"); } /* --ferme 1 : le joueur touche CONTINUER dès que le gain s'affiche */
      if (tire && TAP && e.roule && taps < 3) { taps++; e.tap = 1; await c.ev("dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));1"); } /* --tap 1 : trois taps bloquent les rouleaux */
      if (tire && n < 40 && journal.length % 3 === 0) { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }, 30000); fs.writeFileSync(path.join(OUT, `${LOT}-${String(n++).padStart(2, '0')}.jpg`), Buffer.from(sh.data, 'base64')); }
      if (tire && e.mode === 'drive' && !e.over && e.t > 3000 && journal.filter(j => j.mode === 'drive' && !j.over).length > 12) break;
      await dormir(250);
    }
    fs.writeFileSync(path.join(OUT, `${LOT}-journal.json`), JSON.stringify({ erreurs, journal }, null, 1));
    let der = '';
    for (const e of journal) { const l = `mode=${e.mode} over=${e.over} offre=${e.offre} auto=${e.auto} used=${e.used} bon=${e.bon} jet=${e.jetons} bloque=${e.bloque} spin=${e.spin}${e.roule ? '(roule)' : ''} mDead=${e.mDead} gain="${e.gain}" slam="${e.slam}"${e.tir ? ' ← LEVIER' : ''}${e.cont ? ' ← CONTINUER' : ''}${e.ferme ? ' ← FERME LA MACHINE' : ''}${e.tap ? ' ← TAP' : ''}`; if (l !== der) console.log(String(e.t).padStart(6) + 'ms ' + l); der = l; }
    const rep = journal.some((e, i) => i > 0 && journal[i - 1].over && !e.over);
    console.log('REPART ?', rep, '| erreurs de page :', erreurs.length, erreurs.slice(0, 4));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
