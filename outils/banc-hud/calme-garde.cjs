// LE BANC DE LA GARDE DU CALME (2026-11-15, Sacha : « en HUD calme il faut que les fruits ARRÊTENT D'APPARAÎTRE, mais ceux qui sont déjà là, tu les ramasses »).
// Une course en édition téléphone (?tel=1), SANS SON (sfx/mus/vox coupés dans la sauvegarde, Chrome --mute-audio), filmée image par image (dbgStep : la boucle
// du jeu ne tourne plus d'elle-même, chaque image est une photo possible). Le HUD calme, lui, compte en VRAI temps (0,9 s) : on attend entre deux pas.
//   1. nitro tenu : on pose devant la caisse deux pouvoirs (A à 90 m, B à 260 m) et un fruit de nitro est cherché sur la route (s'il y en a un devant) ;
//   2. nitro lâché → calme : A, B et le fruit RESTENT visibles et se ramassent (pris = vrai) ; un pouvoir C posé PENDANT le calme à 120 m ne se voit pas
//      et ne se prend pas ; les fruits de la route qui arrivent de l'horizon restent cachés ;
//   3. nitro repris : D, posé pendant le calme loin devant (≥ moitié du couloir), GRANDIT (cap 0 → 1) ; ce qui est arrivé trop près ne vient plus (cgo).
// Sortie : <out>/hc-<image>.png + verdict. Code 1 si un contrôle échoue.
//   node outils/banc-hud/calme-garde.cjs [--out dossier] [--http 9921 --cdp 9922] [--q sans=calmegarde] [--w 844 --h 390]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9921), P_CDP = +(A.cdp || 9922), W = +(A.w || 390), H = +(A.h || 844), ANCIEN = /calmegarde/.test(A.q || '');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const TAG = ANCIEN ? 'ancien-' : '';

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof ? path.resolve(A.prof) : tmp();
  const pb = [], erreurs = [];
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300)); } catch (x) {} });
  const photo = async nom => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, 'hc-' + TAG + (W > H ? 'couche-' : 'debout-') + nom + '.png'), Buffer.from(sh.data, 'base64')); };
  const verifie = (ok, msg) => { console.log((ok ? '  ✔ ' : '  ✗ ') + msg); if (!ok) pb.push(msg); };
  const pas = (n) => c.ev('dbgStep(' + (n || 1) + ',16);1', 60000);
  /* l'état des objets suivis (window.__hc) : ds = distance devant la caisse, vu = mesh.visible, pris, cok/cgo/cap = la garde */
  const suivi = async () => JSON.parse(await c.ev("JSON.stringify(dbgCalmeSuivi('etat'))"));
  const pose = (k, nom, ds) => c.ev(`dbgCalmeSuivi('pose','${k}','${nom}',${ds})`);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(2500);
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await c.ev('dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) { await photo('echec'); throw new Error('la course ne part pas'); }
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1'); await dormir(4000);
    await pas(1); /* à partir d'ici la boucle ne tourne plus que par dbgStep */

    console.log('1. NITRO TENU — on pose A (90 m) et B (260 m)');
    for (let i = 0; i < 6; i++) { await pas(3); await dormir(200); } /* le nitro est tenu, HUD_CALME.t suit */
    await pose('v', 'A', 90); await pose('n', 'B', 260);
    /* un FRUIT de la route devant, s'il y en a un (face du dessus, entre 40 et 400 m) */
    await c.ev("dbgCalmeSuivi('fruit','F')");
    await pas(1); const e1 = await suivi(); console.log('   ', JSON.stringify(e1));
    verifie(!e1.calme, 'pas de calme au nitro');
    await photo('1-nitro');

    console.log('2. NITRO LÂCHÉ — LE CALME');
    await c.ev('dbgAuto(true,0,{vol:true,nit:0});1');
    let e2 = null;
    for (let i = 0; i < 12; i++) { await dormir(250); await pas(1); e2 = await suivi(); if (e2.calme) break; }
    await pas(1); e2 = await suivi(); console.log('   ', JSON.stringify(e2));
    verifie(e2.calme, 'le HUD calme est tombé');
    const A2 = e2.o.find(o => o.k === 'A'), B2 = e2.o.find(o => o.k === 'B');
    if (!ANCIEN) {
      verifie(A2 && (A2.vu || A2.pris), 'A (déjà là) reste visible au calme (' + JSON.stringify(A2) + ')');
      verifie(B2 && (B2.vu || B2.pris), 'B (déjà là) reste visible au calme (' + JSON.stringify(B2) + ')');
    } else verifie(B2 && !B2.vu, 'ANCIEN : B s\'efface au calme (' + JSON.stringify(B2) + ')');
    await photo('2a-calme-entree');
    await pose('x', 'C', 120); /* posé PENDANT le calme : il ne doit pas apparaître */
    await pose('m', 'D', 1250); /* loin devant : il ne doit apparaître qu'à la sortie */
    let ph = 0, eM = null, vuC = false, prisC = false, vuF = false;
    for (let i = 0; i < 90; i++) {
      await pas(1); if (i % 3 === 0) await dormir(30);
      const e = await suivi(); eM = e; if (!e.calme) { console.log('    (le calme est retombé à l\'image ' + i + ')'); break; }
      const C = e.o.find(o => o.k === 'C'); if (C && C.vu) vuC = true; if (C && C.pris) prisC = true;
      if (i % 10 === 0) { console.log('    image ' + i + ' : ' + e.o.map(o => o.k + ':' + o.ds + (o.pris ? ' PRIS' : o.vu ? ' vu' : ' caché')).join(' · ')); if (ph < 8) { await photo('2b-calme-' + String(i).padStart(2, '0')); ph++; } }
    }
    const fin = k => eM.o.find(o => o.k === k);
    if (!ANCIEN) {
      verifie(fin('A') && fin('A').pris, 'A, déjà là au calme, est RAMASSÉ pendant le calme');
      verifie(fin('B') && fin('B').pris, 'B, déjà là au calme, est RAMASSÉ pendant le calme');
      verifie(!vuC && !prisC, 'C, posé pendant le calme, ne s\'est jamais vu ni pris (' + JSON.stringify(fin('C')) + ')');
      if (fin('F')) verifie(fin('F').pris || fin('F').ds < 0, 'le fruit F de la route est pris ou dépassé (' + JSON.stringify(fin('F')) + ')');
    } else {
      verifie(fin('B') && !fin('B').pris, 'ANCIEN : B n\'est PAS pris au calme');
    }
    verifie(eM.calme, 'toujours calme à la fin du passage');
    console.log('   ', JSON.stringify(eM));

    console.log('3. NITRO REPRIS — LA SORTIE');
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
    let e3 = null; for (let i = 0; i < 40; i++) { await pas(1); e3 = await suivi(); if (!e3.calme) { console.log('    (sortie du calme après ' + (i + 1) + ' image(s) : la nitro repart)'); break; } }
    console.log('   ', JSON.stringify(e3));
    verifie(!e3.calme, 'le calme est fini');
    const D3 = e3.o.find(o => o.k === 'D'), C3 = e3.o.find(o => o.k === 'C');
    if (!ANCIEN) {
      verifie(D3 && (D3.ds > 0) && (D3.cap !== null || !D3.vu), 'D (loin, arrivé pendant le calme) grandit ou attend l\'horizon (' + JSON.stringify(D3) + ')');
      verifie(!C3 || C3.pris || C3.cgo || C3.ds < 0, 'C (arrivé trop près pendant le calme) ne surgit pas (' + JSON.stringify(C3) + ')');
      verifie(e3.g && e3.g.perdus + e3.g.neufs >= 0, 'compteurs de la garde : ' + JSON.stringify(e3.g));
    }
    for (let i = 0; i < 6; i++) { await photo('3-sortie-' + i); const e = await suivi(); const D = e.o.find(o => o.k === 'D'); console.log('    sortie +' + (i * 6) + ' images : D ' + JSON.stringify(D)); await pas(6); }
    const e4 = await suivi(); console.log('   ', JSON.stringify(e4));
    if (!ANCIEN) { const D4 = e4.o.find(o => o.k === 'D'); verifie(D4 && (D4.cap === null || D4.cap === 1) && (D4.vu || D4.pris || D4.ds > 600), 'D a fini de grandir (' + JSON.stringify(D4) + ')'); }
    verifie(erreurs.length === 0, 'aucune exception dans la console (' + erreurs.length + ')');
    for (const e of erreurs.slice(0, 8)) console.log('   ! ' + e);
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); pb.push(String(e).slice(0, 200)); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  console.log(pb.length ? pb.length + ' PROBLÈME(S)' : 'TOUT EST BON'); process.exit(pb.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
