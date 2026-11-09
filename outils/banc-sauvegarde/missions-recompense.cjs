/* UNE MISSION SE VALIDE UNE FOIS, SA RÉCOMPENSE SE VERSE UNE FOIS (2026-11-08, session « sortie du jeu », agent C) — Chrome headless MUET, le vrai jeu.
   Compte riche. Pour une mission en ARGENT (tr5), une mission qui donne une CAISSE (pu100) et une peinture :
     1. la réussir deux fois de suite (dbgMissions('gagne')) : `ok` ne la compte qu'une fois ;
     2. la RÉCUPÉRER 5 fois à la suite (le geste du joueur qui martèle : m2Prend) : la banque ne monte qu'une fois, la caisse n'entre qu'une fois dans `owned` ;
     3. RECHARGER la page : toujours réussie, toujours prise, une 6e récupération ne donne rien, la banque n'a pas bougé ;
     4. RECHARGER encore : idem (la sauvegarde réécrite par le jeu garde l'état).
   node outils/banc-sauvegarde/missions-recompense.cjs [--http 9951] [--cdp 9952]  → MISSIONS OK / MISSIONS KO */
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9951), P_CDP = +(A.cdp || 9952);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAUVEGARDE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bienv: 1, bank: 100000, aura: 5000, auraMax: 5000, ex: { runs: 40 }, gamme: 3, eco: 3 };
const KO = []; const verifie = (c, m, d) => { console.log((c ? '  ok  ' : '  KO  ') + m + (d !== undefined ? ' — ' + d : '')); if (!c) KO.push(m); };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, tmp(), 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0`;
  const attends = async () => { for (let i = 0; i < 120; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgMissions==='function'&&!!document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on')", 8000)) { await dormir(1500); return true; } } catch (e) {} } return false; };
  /* l'état lu dans la SAUVEGARDE ÉCRITE (ce que verrait un rechargement) et dans le jeu vivant */
  const etat = async () => JSON.parse(await c.ev(`(function(){var d=JSON.parse(localStorage.getItem('cashcarSave'));var M=dbgMissions();var f=function(id){var m=M.find(function(x){return x.id===id});return m?{reussie:m.reussie,prise:m.prise}:null};
    return JSON.stringify({bank:d.bank,owned:d.owned,own:d.shop.own,ok:d.m2.ok,pr:d.m2.pr,nv:d.m2.nv,tr5:f('tr5'),pu100:f('pu100')});})()`, 20000));
  const compte = (L, id) => L.filter(x => x === id).length;
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    const sem = await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAUVEGARDE)) + ')}}catch(e){}' });
    await c.send('Page.navigate', { url });
    if (!(await attends())) throw new Error('le jeu n\'arrive pas à l\'accueil');
    const av = await etat();
    verifie(!av.tr5.reussie && !av.pu100.reussie, 'départ : ni tr5 ni pu100 réussies', JSON.stringify([av.tr5, av.pu100]));
    /* 1. réussir deux fois, vite */
    await c.ev("dbgMissions('gagne','tr5');dbgMissions('gagne','tr5');dbgMissions('gagne','pu100');dbgMissions('gagne','pu100');1");
    let e1 = await etat();
    verifie(compte(e1.ok, 'tr5') === 1 && compte(e1.ok, 'pu100') === 1, '1. réussie deux fois de suite : une seule fois dans `ok`', JSON.stringify(e1.ok.filter(x => x === 'tr5' || x === 'pu100')));
    /* 2. récupérer 5 fois à la suite */
    const r = JSON.parse(await c.ev("JSON.stringify([1,2,3,4,5].map(function(){return [dbgMissions('prend','tr5'),dbgMissions('prend','pu100')]}))", 20000));
    const e2 = await etat();
    verifie(e2.bank - av.bank === 3000, '2. tr5 (3 000) récupérée 5 fois : la banque monte d\'une fois', 'banque ' + av.bank + ' → ' + e2.bank);
    verifie(compte(e2.pr, 'tr5') === 1 && compte(e2.pr, 'pu100') === 1, '2. `pr` (récompense prise) : une seule entrée chacune');
    verifie(compte(e2.owned, e2.owned.find(i => !av.owned.includes(i))) === 1 && e2.owned.length - av.owned.length === 1, '2. pu100 : la caisse entre UNE fois dans `owned`', JSON.stringify(e2.owned.filter(i => !av.owned.includes(i))));
    verifie(r.slice(1).every(x => typeof x[0] === 'string' && typeof x[1] === 'string'), '2. les prises 2 à 5 ne rendent rien (« rien à prendre »)', JSON.stringify(r[1]));
    /* 3. et 4. recharger deux fois */
    await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: sem.identifier });
    for (const n of [3, 4]) {
      await c.send('Page.navigate', { url });
      if (!(await attends())) throw new Error('rechargement ' + n + ' : le jeu n\'arrive pas à l\'accueil');
      const e = await etat();
      verifie(e.tr5.reussie && e.tr5.prise && e.pu100.reussie && e.pu100.prise, n + '. après rechargement : toujours réussies ET prises', JSON.stringify([e.tr5, e.pu100]));
      const apres = JSON.parse(await c.ev("JSON.stringify([dbgMissions('prend','tr5'),dbgMissions('prend','pu100')])", 20000));
      const e3 = await etat();
      verifie(typeof apres[0] === 'string' && typeof apres[1] === 'string' && e3.bank === e2.bank && e3.owned.length === e2.owned.length, n + '. une récupération de plus ne donne rien (banque ' + e3.bank + ', caisses ' + e3.owned.length + ')');
      verifie(compte(e3.ok, 'tr5') === 1 && compte(e3.pr, 'tr5') === 1 && !e3.nv.includes('tr5'), n + '. `ok` / `pr` sans doublon, `nv` (à voir) vidée');
    }
  } catch (e) { KO.push('échec du banc : ' + String(e).slice(0, 300)); console.log('  KO  ' + KO[KO.length - 1]); }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  console.log(KO.length ? 'MISSIONS KO — ' + KO.join(' ; ') : 'MISSIONS OK');
  process.exit(KO.length ? 1 : 0);
})();
