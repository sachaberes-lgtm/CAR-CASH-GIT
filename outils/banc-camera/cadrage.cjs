/* LE BANC DU CADRAGE (2026-11-08, Sacha : « la caméra est trop proche de la voiture en portrait et trop loin en paysage ») : Chrome headless muet,
   téléphone émulé. Lance une course, attend la conduite, relève `dbgCamTaille()` (part de l'écran que prend la caisse) une dizaine de fois.
   node outils/banc-camera/cadrage.cjs --w 390 --h 844 [--q "sans=proche"] [--car 0] [--http 9811] [--cdp 9812]
   ⚠ Mac chargé = images longues : la caméra se « reprend » (CAM_REPRISE) mais le cadrage établi, lui, reste juste. Prendre le verrou verrou-banc.sh avant. */
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const W = +(A.w || 390), H = +(A.h || 844), JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9811), P_CDP = +(A.cdp || 9812);
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3] };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  try {
    await c.send('Page.enable');
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.cashcarSave=${JSON.stringify(JSON.stringify(SAVE))}}catch(e){}` });
    await c.send('Page.navigate', { url: `http://localhost:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0${A.q ? '&' + A.q : ''}` });
    for (let i = 0; i < 240; i++) { await dormir(500); try { if (await c.ev("typeof window.dbgJouer === 'function'", 4000)) break; /* ⚠ pas __gameReady : la page le pose tôt (cadre colonne) */ } catch (e) {} }
    /* ⚠ des délais RÉELS (chauffe des tôles, mondes d'avance : 15 s) bornent le départ : on alterne quelques images à la main et une pause. Le rendu logiciel est lent et le temps du jeu avec : on le fait avancer À LA MAIN (dbgStep, dt fixe) ; dbgCamReprise énorme = une image longue ne remet pas la caméra à zéro */
    await c.ev('window.dbgCamReprise=1e9;1', 4000);
    await dormir(3000); console.error('  dbgJouer :', await c.ev('JSON.stringify(window.dbgJouer())', 8000));
    const lis = async () => JSON.parse(await c.ev('JSON.stringify(window.dbgCamTaille())', 20000));
    let ok = false, o = null;
    for (let i = 0; i < 400 && !ok; i++) { try { await c.ev('window.dbgStep(8,50);1', 120000); await dormir(300); o = await lis(); if (i % 20 === 0) console.error('  …', i * 8, 'images', JSON.stringify(o)); if (o.started && o.mode === 'drive' && o.d < 9) ok = true; } catch (e) { console.error('  err', e.message); } }
    if (!ok) { console.log(JSON.stringify({ vue: W + 'x' + H, echec: 'la course ne part pas', der: o })); return; }
    await c.ev('window.dbgStep(150,16);1', 300000);
    const S = [];
    for (let i = 0; i < 8; i++) { await c.ev('window.dbgStep(15,16);1', 120000); S.push(await lis()); }
    const g = k => +med(S.map(x => x[k])).toFixed(3);
    console.log(JSON.stringify({ vue: W + 'x' + H, q: A.q || '(défaut)', n: S.length, POR: g('POR'), fov: g('fov'), asp: g('asp'), d: g('d'), taille: g('taille'), centreY: +med(S.map(x => x.centre[1])).toFixed(2) }));
  } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
})();
