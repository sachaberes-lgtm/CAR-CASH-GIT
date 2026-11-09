/* TOUT EFFACER, DE BOUT EN BOUT (2026-11-08, session « sortie du jeu », agent C : ECO-10 + ECO-N06) — Chrome headless MUET, le vrai jeu.
   Compte riche (banque 100 000). Ouvre RÉGLAGES, touche TOUT EFFACER, confirme EFFACER, laisse la page se recharger, puis lit ce qui est écrit :
     · cas « normal »  : l'onglet est seul ;
     · cas « passif »  : un autre onglet a pris la main (événement `storage` sur ccOngletActif) : SAVE.flush est une fonction vide dans cette page.
   Attendu : après le rechargement la banque vaut 0 (sauvegarde vierge), jamais les 100 000 d'avant.
   node outils/banc-sauvegarde/efface.cjs [--page index.html] [--http 9961] [--cdp 9962]  → EFFACE OK / EFFACE KO */
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAUVEGARDE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bienv: 1, bank: 100000, aura: 5000, auraMax: 5000, ex: { runs: 40 }, gamme: 3, eco: 3 };
const KO = []; const verifie = (c, m, d) => { console.log((c ? '  ok  ' : '  KO  ') + m + (d !== undefined ? ' — ' + d : '')); if (!c) KO.push(m); };
async function cas(passif, port) {
  const { ch, pg } = await lanceChrome(port, tmp(), 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const url = `http://127.0.0.1:${P_HTTP}/${A.page || 'index.html'}?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0`;
  const attends = async () => { for (let i = 0; i < 120; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&!!document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on')", 8000)) { await dormir(1500); return true; } } catch (e) {} } return false; };
  const tap = async (sel) => { const r = await c.ev(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;try{e.scrollIntoView({block:'center'})}catch(x){}const b=e.getBoundingClientRect();if(b.width<1||b.height<1)return null;return [b.left+b.width*.5,b.top+b.height*.5]})()`);
    if (!r) return false; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true; };
  const nom = passif ? 'onglet PASSIF' : 'onglet seul';
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    const sem = await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAUVEGARDE)) + ')}}catch(e){}' });
    await c.send('Page.navigate', { url });
    if (!(await attends())) throw new Error('le jeu n\'arrive pas à l\'accueil');
    const b0 = JSON.parse(await c.ev("localStorage.getItem('cashcarSave')")).bank;
    verifie(b0 === 100000, nom + ' : départ, banque ' + b0);
    if (passif) { await c.ev("localStorage.setItem('ccOngletActif','un-autre-onglet');window.dispatchEvent(new StorageEvent('storage',{key:'ccOngletActif',newValue:'un-autre-onglet'}));1"); await dormir(500); }
    await c.ev("window.__mGo('set');1"); await dormir(1500);
    const lignes = await c.ev("JSON.stringify([].slice.call(document.querySelectorAll('[data-m]')).map(function(e){return e.getAttribute('data-m')}))");
    /* les lignes des réglages portent data-m (comme .mLigne[data-m="volinv"]) */
    const lignes2 = await c.ev("JSON.stringify([].slice.call(document.querySelectorAll('[data-m]')).map(function(e){return e.getAttribute('data-m')}))");
    await dormir(300);
    if (!(await tap('[data-m="wipe"]'))) throw new Error('TOUT EFFACER introuvable dans les réglages (data-a : ' + lignes2 + ')');
    await dormir(800);
    if (!(await tap('#modale .pb-red,#modale .pbtn.red,#modale [data-v="1"]'))) throw new Error('le bouton EFFACER de la fenêtre est introuvable : ' + (await c.ev("(document.getElementById('modale')||{outerHTML:'(pas de #modale)'}).outerHTML.slice(0,700)")));
    /* le jeu recharge la page : on la laisse revenir (le script de départ ne rejoue pas : sessionStorage.__fx est posé) */
    await dormir(4000); await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: sem.identifier }).catch(() => {});
    if (!(await attends())) throw new Error('après l\'effacement, le jeu n\'est pas revenu à l\'accueil');
    const apres = JSON.parse(await c.ev("localStorage.getItem('cashcarSave')"));
    verifie(apres.bank === 0 && (apres.ex.runs | 0) === 0, nom + ' : après TOUT EFFACER et rechargement, la sauvegarde est vierge', 'banque ' + apres.bank + ', parties ' + (apres.ex && apres.ex.runs));
  } catch (e) { KO.push(nom + ' : ' + String(e).slice(0, 300)); console.log('  KO  ' + KO[KO.length - 1]); }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); await dormir(800); }
}
(async () => {
  for (const p of [P_HTTP, P_CDP, P_CDP + 2]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  await cas(false, P_CDP); await cas(true, P_CDP + 2);
  srv.close();
  console.log(KO.length ? 'EFFACE KO — ' + KO.join(' ; ') : 'EFFACE OK');
  process.exit(KO.length ? 1 : 0);
})();
