/* LE BANC DE L'ACCUEIL EN CIEL SEUL (2026-11-13, accueil-ciel — Sacha : « pourquoi la voiture est au-dessus d'une map ? … un faux ciel, sans avoir à générer toute une map »).
   Un Chrome sans fenêtre et MUET (iPhone 390×844 ×2, ?tel=1), l'accueil (le menu dans le ciel : PAS de ?chute=0, qui le remplace par l'atelier).
   · l'accueil AU REPOS pendant --repos s (20) : appels de dessin et triangles d'une image (dbgAppels), moyenne de renderer.info par image,
     temps de script par image (Performance.getMetrics : ScriptDuration / images), images par seconde ; photo portrait et paysage.
   · --depart 1 : JOUER → piqué → course 20 s → pause/reprise → mort → retour à l'accueil ; dbgErreurs filtré.
   node outils/banc-accueil-ciel/accueil.cjs [--q "sans=accueilciel"] [--nom avant] [--repos 20] [--depart 1] [--http 9981 --cdp 9982] */
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9981), P_CDP = +(A.cdp || 9982);
const W = 390, H = 844, REPOS = +(A.repos || 20), NOM = A.nom || 'essai';
const SORTIE = path.resolve(A.sortie || path.join(__dirname, '..', '..', 'passation', 'accueil-ciel'));
const PROF = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-accueil-ciel-'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const ERR = "(function(){try{var e=dbgErreurs();var L=(e&&e.liste)||e||[];if(!Array.isArray(L))L=[JSON.stringify(e)];return L.map(function(x){return typeof x==='string'?x:JSON.stringify(x);}).filter(function(x){return /panne|erreur|exception|boucle|promesse/i.test(x);}).slice(-12);}catch(x){return ['dbgErreurs: '+x.message];}})()";
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(SORTIE, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const ev = async (e, t) => { try { return await c.ev(e, t || 15000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 160); } };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await ev(expr)) === true) return true; await dormir(pas || 500); } return false; };
  const photo = async (f) => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(SORTIE, f), Buffer.from(sh.data, 'base64')); };
  const ecran = async (w, h) => { await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h, screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } }); };
  const R = { nom: NOM, q: A.q || '' };
  const mesure = async (cle) => {
    await ev("(function(){var I=renderer.info;window.__AC={n:0,ap:0,tri:0};if(!window.__ACr){window.__ACr=1;var r0=renderer.render;}return 1;})()");
    /* moyenne de renderer.info : relue à chaque image (autoReset : les compteurs de la DERNIÈRE passe du compositeur ; on lit plutôt dbgAppels une fois) */
    const m0 = await c.send('Performance.getMetrics'); const i0 = await ev('(window.__BDimg|0)'); const t0 = Date.now();
    await dormir(REPOS * 1000);
    const m1 = await c.send('Performance.getMetrics'); const i1 = await ev('(window.__BDimg|0)'); const dt = (Date.now() - t0) / 1000;
    const g = (m, k) => (m.metrics.find(x => x.name === k) || {}).value || 0;
    const img = i1 - i0;
    const o = { images: img, ips: +(img / dt).toFixed(1), scriptMsParImage: +((g(m1, 'ScriptDuration') - g(m0, 'ScriptDuration')) * 1000 / Math.max(1, img)).toFixed(2),
      tachesMsParImage: +((g(m1, 'TaskDuration') - g(m0, 'TaskDuration')) * 1000 / Math.max(1, img)).toFixed(2) };
    o.appels = await ev('(function(){var a=(window.dbgAccueilCiel&&dbgAccueilCiel().actif)?dbgAccueilCiel("appels"):dbgAppels(60);return {appels:a.appels,triangles:a.triangles,liste:a.liste.slice(0,60)};})()', 30000);
    if (A.brut) o.brut = await ev('dbgAppelsBrut().map(function(r){return [r.tri,r.m,r.ch.slice(0,90),r.T?"T":"",r.fc?"":"nc"].join(" | ");})', 30000);
    if (A.inventaire) o.inventaire = await ev('dbgAccueilCiel("inventaire")', 30000);
    o.cull = await ev('dbgMenuCull()'); o.hc = await ev('(function(){var h=dbgHC();return {per:h.per,on:h.on,mc:h.mc};})()');
    o.etat = await ev("(function(){try{return dbgAccueilCiel();}catch(e){return 'pas de crochet';}})()");
    R[cle] = o; console.log(cle, JSON.stringify({ ips: o.ips, script: o.scriptMsParImage, taches: o.tachesMsParImage, appels: o.appels && o.appels.appels, tri: o.appels && o.appels.triangles, etat: o.etat }));
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Performance.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await ecran(W, H);
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}\n(function(){var raf=window.requestAnimationFrame.bind(window),p=0;window.__BDimg=0;window.__BDtrous=[];(function c(t){window.__BDimg++;if(p&&t-p>50)window.__BDtrous.push([Math.round(p),Math.round(t-p)]);p=t;raf(c);})();})();' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    console.log('prêt ?', await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000));
    await ev("(function(){const s=document.getElementById('splash');if(s){s.click();}return 1;})()");
    console.log('ciel ?', await attend('dbgChute().titreCiel>0', 60000, 1000));
    /* le menu s'installe, le départ d'avance se bâtit : on attend qu'il ait fini (sinon ses tranches pèsent sur la mesure) */
    console.log('départ d\'avance prêt ?', await attend("dbgPrebati().etat==='pret'", 120000, 1000), JSON.stringify(await ev('(function(){var p=dbgPrebati();return {carte:p.carte,ms:p.ms,cpu:p.cpu};})()')));
    await dormir(3000);
    /* A/B DANS LA MÊME SESSION : 0 = comme avant (?sans=accueilciel), 1 = le ciel seul. D'abord l'image FIGÉE (même plan, mêmes cumulus) :
       appels, triangles, photo ; puis le temps de script, vue libre, en alternance (la machine est partagée : l'alternance lisse la charge). */
    const AB = async (cle) => { const o = R[cle] = { fige: {}, temps: { 0: [], 1: [] } };
      await ev('dbgChute({fige:7.5});1'); await dormir(1500);
      for (const v of [0, 1]) { await ev('dbgAccueilCiel(' + v + ');1'); await dormir(1500);
        o.fige[v] = await ev('(function(){var a=' + (v ? 'dbgAccueilCiel("appels")' : 'dbgAppels(60)') + ';return {appels:a.appels,triangles:a.triangles,liste:a.liste.slice(0,30),mc:dbgMenuCull().mc,etat:dbgAccueilCiel()};})()', 30000);
        await photo(NOM + '-' + cle + '-' + (v ? 'ciel' : 'avant') + '.png'); }
      /* LE TOUR COMPLET : la vue tourne autour de la caisse (un tour en 75 s) — la route n'est dans le champ qu'une partie du tour : 12 angles, figés */
      o.tour = { 0: [], 1: [] };
      for (let k = 0; k < 12; k++) { await ev('dbgChute({orb:' + (k * Math.PI / 6).toFixed(3) + ',tour:0});1'); await dormir(700);
        for (const v of [0, 1]) { await ev('dbgAccueilCiel(' + v + ');1'); await dormir(250);
          o.tour[v].push(await ev('(function(){var a=' + (v ? 'dbgAccueilCiel("appels")' : 'dbgAppels(1)') + ';return [a.appels,parseInt(a.triangles)];})()', 30000)); } }
      { let kM = 0, dM = -1; for (let k = 0; k < 12; k++) { const d = o.tour[0][k][1] - o.tour[1][k][1]; if (d > dM) { dM = d; kM = k; } } o.angleRoute = kM;
        await ev('dbgChute({orb:' + (kM * Math.PI / 6).toFixed(3) + ',tour:0});1'); await dormir(700);
        for (const v of [0, 1]) { await ev('dbgAccueilCiel(' + v + ');1'); await dormir(800); await photo(NOM + '-' + cle + '-route-' + (v ? 'ciel' : 'avant') + '.png'); } }
      await ev('dbgChute({tour:75,fige:null});1');
      for (let k = 0; k < +(A.tours || 3); k++) for (const v of [0, 1]) { await ev('dbgAccueilCiel(' + v + ');1'); await dormir(1500);
        const m0 = await c.send('Performance.getMetrics'), i0 = await ev('(window.__BDimg|0)'), t0 = Date.now(); await dormir(REPOS * 1000 / 2);
        const m1 = await c.send('Performance.getMetrics'), i1 = await ev('(window.__BDimg|0)'), dt = (Date.now() - t0) / 1000;
        const g = (m, k2) => (m.metrics.find(x => x.name === k2) || {}).value || 0, img = Math.max(1, i1 - i0);
        o.temps[v].push({ ips: +(img / dt).toFixed(1), script: +((g(m1, 'ScriptDuration') - g(m0, 'ScriptDuration')) * 1000 / img).toFixed(2), taches: +((g(m1, 'TaskDuration') - g(m0, 'TaskDuration')) * 1000 / img).toFixed(2) }); }
      const moy = (L, k2) => +(L.reduce((a, x) => a + x[k2], 0) / L.length).toFixed(2), med = (L, k2) => { const q = L.map(x => x[k2]).sort((a, b) => a - b); return q[q.length >> 1]; };
      const tm = (L, j) => +(L.reduce((x, y) => x + y[j], 0) / L.length).toFixed(1), tx = (L, j) => Math.max(...L.map(y => y[j]));
      o.resume = {}; for (const v of [0, 1]) o.resume[v ? 'ciel' : 'avant'] = { tourAppelsMoy: tm(o.tour[v], 0), tourAppelsMax: tx(o.tour[v], 0), tourTrisMoyK: tm(o.tour[v], 1), tourTrisMaxK: tx(o.tour[v], 1), appels: o.fige[v].appels, triangles: o.fige[v].triangles, menuCull: o.fige[v].mc, eteints: o.fige[v].etat.eteints, scriptMed: med(o.temps[v], 'script'), scriptMoy: moy(o.temps[v], 'script'), tachesMed: med(o.temps[v], 'taches'), ips: moy(o.temps[v], 'ips') };
      await ev('dbgAccueilCiel(1);1');
      console.log(cle, JSON.stringify(o.resume)); };
    console.log('charge', require('os').loadavg().map(x => x.toFixed(0)).join(' '));
    await AB('portrait');
    await ecran(H, W); await dormir(4000);
    await AB('paysage');
    await ecran(W, H); await dormir(2000);
    console.log('charge', require('os').loadavg().map(x => x.toFixed(0)).join(' '));
    R.chargement = await ev('(function(){try{return dbgChargement().ms;}catch(e){return null;}})()');
    if (A.bati) { R.bati = []; for (let k = 0; k < 3; k++) { R.bati.push(await ev('dbgAccueilCiel("bati")', 60000)); await dormir(3000); } console.log('piste du menu bâtie d\'un trait (ms)', R.bati.join(' '), '· au chargement', JSON.stringify(R.chargement)); await attend("dbgPrebati().etat==='pret'", 60000, 1000); await dormir(2000); }
    R.erreursAccueil = await ev(ERR);
    if (A.depart) { const D = R.depart = {};
      const tJ = await ev('performance.now()'); D.jouer = await ev('JSON.stringify(dbgJouer())');
      /* le piqué filmé : 6 photos pendant la chute (la map doit réapparaître sans saut) */
      for (let k = 0; k < 6; k++) { await dormir(280); await photo(NOM + '-pique-' + k + '.png'); }
      D.course = await attend("(function(){const s=dbgState();if(s.started&&!s.gameOver){dbgAuto(true,0,{vol:true});return true;}return false;})()", 90000, 200); /* le pilote du banc : sinon la caisse sort de la route en 5 s */
      D.trousDepart = await ev('__BDtrous.filter(function(x){return x[0]>' + tJ + ';}).slice(0,20)'); D.lier = await ev('(function(){try{var l=dbgLier();delete l.attendus;return l;}catch(e){return null;}})()');
      await dormir(20000); await photo(NOM + '-course.png');
      D.etatCourse = await ev('JSON.stringify(dbgState())');
      const echap = "(function(){dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));return dbgState().paused;})()";
      D.pause = await ev(echap); await dormir(2500); D.reprise = await ev(echap); await dormir(1500); D.repriseEtat = await ev('dbgState().paused'); await dormir(2000);
      await ev("dbgDauphin('boom');1");
      D.mort = await attend('dbgState().gameOver', 20000, 300); await dormir(4000);
      /* le bouton ACCUEIL de l'écran de mort (data-m=menu) */
      D.retour = await ev("(function(){const e=document.querySelector('#mDead [data-m=menu]');if(!e)return 'pas de bouton';e.click();return 'bouton';})()");
      D.accueil = await attend("document.getElementById('mHome').classList.contains('on')&&dbgChute().titreCiel>0", 30000, 500);
      await dormir(4000); await photo(NOM + '-retour.png');
      D.etatRetour = await ev("(function(){try{return dbgAccueilCiel();}catch(e){return 'pas de crochet';}})()");
      D.erreurs = await ev(ERR);
      console.log('départ', JSON.stringify(D)); }
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); R.echec = String(e).slice(0, 300); }
  fs.writeFileSync(path.join(SORTIE, NOM + '.json'), JSON.stringify(R, null, 1));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
