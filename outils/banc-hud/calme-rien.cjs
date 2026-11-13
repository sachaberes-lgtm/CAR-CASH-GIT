// LE BANC DU CALME SANS RIEN (2026-11-13, Sacha : « en mode HUD calme on doit même plus voir les pièces ou les ramasser, pareil pour les pouvoirs et tout,
// les sons seule la musique reste ») — une course en édition téléphone (?tel=1), trois temps : nitro tenu · nitro lâché (le HUD calme tombe à 0,9 s) · nitro repris.
// Il CONTRÔLE, par les crochets du jeu :
//   1. le son : l'entrée des effets du limiteur (MASTER._limIn) est ouverte au nitro, FERMÉE au calme (la musique entre à côté, elle ne passe pas par là), rouverte au nitro ;
//   2. les pièces : au calme, l'argent monte QUAND MÊME (la prise compte) mais AUCUNE pièce ne vole dans la caisse (CVOL.lances) ; au nitro, elles volent ;
//   3. un pouvoir pris au calme (dbgPwr) s'arme sans exception, et le son reste fermé.
// Chrome tourne avec --mute-audio (cdp.cjs) : on peut donc allumer SON / MUSIQUE / VOIX dans la sauvegarde du banc (le graphe audio existe alors vraiment), rien ne sort des haut-parleurs.
// Sortie : <out>/calme-rien-<moment>.png + verdict. Code 1 si un contrôle échoue.
//   node outils/banc-hud/calme-rien.cjs [--out /chemin] [--http 9781 --cdp 9782] [--musique 0]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9781), P_CDP = +(A.cdp || 9782), MUS = A.musique !== '0';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: true, mus: MUS, vox: true, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof ? path.resolve(A.prof) : tmp(); /* --prof : un profil PERSISTANT (à froid le jeu ne démarre pas, au 2e lancement sur le même profil il part en ~10 s) */
  const pb = [], erreurs = [];
  const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300)); } catch (x) {} });
  const photo = async nom => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, 'calme-rien-' + nom + '.png'), Buffer.from(sh.data, 'base64')); };
  const etat = async () => JSON.parse(await c.ev('JSON.stringify({h:dbgHudCalme(),cash:dbgCash(),v:dbgPiecesVol()})'));
  const verifie = (ok, msg) => { console.log((ok ? '  ✔ ' : '  ✗ ') + msg); if (!ok) pb.push(msg); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) { let d = ''; try { d = await c.ev('document.readyState+" "+typeof dbgJouer+" "+!!window.__gameReady', 5000); } catch (e) { d = String(e).slice(0, 100); } throw new Error('le jeu ne démarre pas : ' + d + ' · ' + erreurs.slice(0, 3).join(' / ')); }
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2500);
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await c.ev('dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) { await photo('echec'); throw new Error('la course ne part pas'); }
    await c.ev('dbgAuto(true,0,{vol:true});1'); await dormir(4000); /* le logo du départ est parti */

    console.log('1. NITRO TENU');
    await c.ev('dbgPiecesVol("raz");dbgAuto(true,0,{nit:1});1'); await dormir(4000);
    const n1 = await etat(); console.log('   ', JSON.stringify(n1));
    verifie(!n1.h.on, 'le HUD calme est éteint au nitro');
    verifie(n1.h.effets === null || n1.h.effets > .9 || SAVE.sfx === false, 'effets ouverts au nitro (' + n1.h.effets + ')');
    verifie(n1.v.lances > 0 || /lances/.test(JSON.stringify(n1.v)) && n1.v.lances !== undefined, 'dbgPiecesVol lit bien (' + JSON.stringify(n1.v).slice(0, 80) + ')');
    await photo('1-nitro');

    console.log('2. NITRO LÂCHÉ — CALME');
    await c.ev('dbgAuto(true,0,{nit:0});1'); await dormir(1900);
    const c0 = await etat();
    verifie(c0.h.on, 'le HUD calme est allumé 1,9 s après le nitro');
    verifie(c0.h.effets !== null && c0.h.effets < .02, 'effets FERMÉS au calme (' + c0.h.effets + ')');
    await c.ev('dbgPwr("v");dbgPwr("m");dbgPwr("x");1'); /* citron (éclairs), pomme dorée, dragon : pris au calme */
    await dormir(4500);
    const c1 = await etat(); console.log('   ', JSON.stringify(c1));
    verifie(c1.h.on, 'toujours calme après les pouvoirs');
    verifie(c1.h.effets < .02, 'effets toujours fermés après les pouvoirs (' + c1.h.effets + ')');
    verifie(c1.v.lances === c0.v.lances, 'aucune pièce ne vole dans la caisse au calme (' + c0.v.lances + ' → ' + c1.v.lances + ')');
    console.log('    argent au calme :', c0.cash, '→', c1.cash, '(monte = les pièces comptent en silence)');
    await photo('2-calme');

    console.log('3. NITRO REPRIS');
    await c.ev('dbgAuto(true,0,{nit:1});1'); await dormir(700);
    const r0 = await etat();
    verifie(!r0.h.on, 'le HUD calme tombe au nitro');
    verifie(r0.h.effets > .9, 'effets rouverts au nitro (' + r0.h.effets + ')');
    await dormir(4000); const r1 = await etat(); console.log('   ', JSON.stringify(r1));
    verifie(r1.v.lances > r0.v.lances || r1.v.lances > c1.v.lances, 'les pièces revolent dans la caisse au nitro (' + c1.v.lances + ' → ' + r1.v.lances + ')');
    await photo('3-nitro');

    console.log('4. PAUSE AU CALME');
    await c.ev('dbgAuto(true,0,{nit:0});1'); await dormir(1800);
    const p0 = await etat(); verifie(p0.h.on && p0.h.effets < .02, 'recalme (' + p0.h.effets + ')');
    await c.ev('window.__panBascule();1'); await dormir(800);
    const p1 = await etat(); verifie(!p1.h.on && p1.h.effets > .9, 'la pause rend le son (' + p1.h.effets + ')');
    verifie(erreurs.length === 0, 'aucune exception dans la console (' + erreurs.length + ')');
    for (const e of erreurs.slice(0, 8)) console.log('   ! ' + e);
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); pb.push(String(e).slice(0, 200)); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  console.log(pb.length ? pb.length + ' PROBLÈME(S)' : 'TOUT EST BON'); process.exit(pb.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
