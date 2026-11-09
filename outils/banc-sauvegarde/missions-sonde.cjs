/* LA SONDE DES MISSIONS (2026-11-08, session « sortie du jeu », agent C) — Chrome headless MUET, le vrai jeu.
   Charge le jeu avec une sauvegarde NEUVE (ou celle de --save), puis lit dbgMissions() / dbgMissionsLots() et dit :
     · quelles missions sont déjà « réussies » sans avoir joué (= une récompense offerte d'office) ;
     · quelles missions ont un seuil <= 0 ou invalide ;
     · pour chaque lot « toutes » (voitures, peintures, ailes, traînées, figures, tout) : combien d'objets y entrent ET lesquels ne peuvent
       pas s'obtenir (en € sur le site, pack du chat…) = une mission « toutes » IMPOSSIBLE ;
     · la même chose sur la sauvegarde d'un joueur qui possède tout ce qui s'achète à l'argent du jeu.
   node outils/banc-sauvegarde/missions-sonde.cjs [--save neuve|riche] [--http 9941] [--cdp 9942]  → code 1 si une anomalie */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9941), P_CDP = +(A.cdp || 9942);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAUVEGARDE = A.save === 'riche' ? { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bienv: 1, bank: 1e9, aura: 5000, auraMax: 5000, ex: { runs: 40 }, gamme: 3, eco: 3 } : null;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, tmp(), 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const KO = [];
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    if (SAUVEGARDE) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAUVEGARDE)) + ')}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    for (let i = 0; i < 120; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgMissions==='function'&&document.getElementById('mHome').classList.contains('on')", 8000)) break; } catch (e) {} }
    await dormir(2000);
    if (!(await c.ev("typeof dbgMissions==='function'", 8000))) throw new Error('jeu pas prêt : ' + await c.ev("JSON.stringify({ready:!!window.__gameReady,home:!!document.getElementById('mHome')&&document.getElementById('mHome').className,dbg:typeof window.dbgState})", 8000));
    const M = JSON.parse(await c.ev('JSON.stringify(dbgMissions())', 20000));
    const L = JSON.parse(await c.ev('JSON.stringify(dbgMissionsLots())', 20000));
    console.log('missions : ' + M.length + ' ; réussies au départ : ' + M.filter(m => m.reussie).length + ' ; au garage : ' + M.filter(m => m.auGarage).length);
    for (const m of M) {
      if (m.reussie && !SAUVEGARDE) { KO.push('réussie d\'office sur un compte NEUF : ' + m.id + ' (' + m.valeur + ' / ' + m.seuil + ')'); }
      if (!(typeof m.seuil === 'number') || !(m.seuil > 0)) KO.push('seuil invalide : ' + m.id + ' = ' + m.seuil);
      if (typeof m.valeur === 'string') KO.push('valeur illisible : ' + m.id + ' = ' + m.valeur);
    }
    for (const k of Object.keys(L)) {
      const o = L[k]; console.log('lot ' + k.padEnd(9) + ' : possédés ' + o.possedes + ' · lot « toutes » ' + o.toutes + ' (déjà à toi ' + o.dansToutes + ') · hors argent du jeu : ' + o.pasAArgentDuJeu.length + (o.pasAArgentDuJeu.length ? ' → ' + o.pasAArgentDuJeu.join(', ').slice(0, 300) : ''));
      if (!(o.toutes > 0)) KO.push('le lot ' + k + ' est VIDE (seuil « tot » = 0 : la mission « toutes » serait réussie d\'office)');
    }
    /* un lot « toutes » ne doit contenir que des objets OBTENABLES : pas de mission « toutes » impossible. L'obtenable = argent du jeu OU défi OU mission ;
       ce qui reste dans `pasAArgentDuJeu` est signalé pour que l'humain juge (une caisse de mission ou une peinture de défi y figure légitimement). */
    const tout = await c.ev('JSON.stringify(dbgMissions().filter(function(m){return m.seuil>=0&&/all$|tot|^toutall$/.test(m.id)||m.id==="carall"||m.id==="rares"||m.id==="meteo"||m.id==="maps"||m.id==="maps2"||m.id==="palier10";}).map(function(m){return {id:m.id,v:m.valeur,s:m.seuil,ok:m.reussie}}))', 20000);
    console.log('missions « toutes » : ' + tout);
  } catch (e) { KO.push('échec de la sonde : ' + String(e).slice(0, 1500)); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  for (const k of KO) console.log('  KO  ' + k);
  console.log(KO.length ? 'SONDE KO' : 'SONDE OK');
  process.exit(KO.length ? 1 : 0);
})();
