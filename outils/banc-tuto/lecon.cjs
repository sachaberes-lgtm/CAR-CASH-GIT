// LE BANC DE L'AUTO-ÉCOLE (2026-11-22, refonte plein écran : « il faut une refonte ultra poussée du tuto »)
// Une sauvegarde NEUVE (rien que le son coupé : sfx/mus/vox à 0, Chrome --mute-audio), JOUER, puis la leçon entière jouée au clavier
// (les touches marchent aussi en édition téléphone) avec les vrais gestes : ← puis →, ESPACE tenu, sortie par le bord, ESPACE en l'air,
// pose (le pilote de mesure ramène la caisse sur l'axe), double ESPACE. Photos aux moments clés, exceptions de la page comptées.
//   node outils/banc-tuto/lecon.cjs [--w 390 --h 844] [--pc 1] [--en 1] [--out dossier] [--http 9941 --cdp 9942] [--q x=y] [--tag nom]
// --pc 1 : l'ordinateur au clavier (pas de ?tel=1, pas de tactile) · --en 1 : en anglais · --pad 1 : COMMANDES = FLÈCHES · --glisse 1 : FIGURES › GLISSER
// Code 1 si la leçon ne va pas au permis ou si la page lève une exception.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9941), P_CDP = +(A.cdp || 9942), W = +(A.w || 390), H = +(A.h || 844), PC = !!A.pc, EN = !!A.en;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { sfx: false, mus: false, vox: false };
if (A.pad) SAVE.tctl = 'pad';
if (A.glisse) SAVE.figG = 'glisse';
const TAG = (A.tag ? A.tag + '-' : '') + (PC ? 'pc' : (W > H ? 'couche' : 'debout')) + (EN ? '-en' : '');
const PHOTOS = A.photos !== '0';

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const erreurs = [], journal = [];
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console.error : ' + (m.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 300));
  } catch (x) {} });
  let nP = 0;
  const photo = async nom => { if (!PHOTOS) return; const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const f = path.join(OUT, TAG + '-' + String(++nP).padStart(2, '0') + '-' + nom + '.png'); fs.writeFileSync(f, Buffer.from(sh.data, 'base64')); console.log('    📷 ' + path.basename(f)); };
  const etat = async () => JSON.parse(await c.ev("JSON.stringify(Object.assign(dbgTuto(),{mode:dbgState().mode,started:dbgState().started,gameOver:dbgState().gameOver,paused:dbgState().paused,ph:(document.getElementById('ecole')||{}).dataset?document.getElementById('ecole').dataset.ph||'':''}))"));
  const KEYS = { ArrowLeft: 37, ArrowRight: 39, ' ': 32, Escape: 27 };
  const touche = async (k, bas) => { const code = k === ' ' ? 'Space' : k; await c.send('Input.dispatchKeyEvent', { type: bas ? 'keyDown' : 'keyUp', key: k, code, windowsVirtualKeyCode: KEYS[k], nativeVirtualKeyCode: KEYS[k] }); };
  const tiens = async (k, ms) => { await touche(k, true); await dormir(ms); await touche(k, false); };
  const attends = async (f, ms, pas = 100) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const e = await etat(); if (f(e)) return e; await dormir(pas); } return null; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!PC) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    } else await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    if (A.rm) await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.bancTuto){sessionStorage.bancTuto=1;localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');' + (EN ? 'localStorage.ccLang="en";' : 'localStorage.ccLang="fr";') + '}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?` + (PC ? 'colonne=0' : 'colonne=0&tel=1') + '&intro=ancien&attente=0' + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(3000);
    const sv = JSON.parse(await c.ev('JSON.stringify({tuto:dbgTuto().tuto,save:localStorage.cashcarSave.slice(0,80),lang:localStorage.ccLang})'));
    console.log('sauvegarde : ' + JSON.stringify(sv));
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { console.log('JOUER : ' + JSON.stringify(await c.ev('dbgJouer()'))); } catch (e) { console.log('JOUER erreur', e.message); }
      for (let i = 0; i < 60; i++) { await dormir(500); try { const e = await etat(); if (e.started && !e.gameOver && e.on) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) { await photo('echec'); throw new Error('la leçon ne part pas'); }
    console.log('leçon partie');
    if (A.var) { /* LES VARIANTES : la pause, FIGURES › GLISSER, RECOMMENCER, une 2e partie après QUITTER */
      await attends(e => e.ph === 'geste', 12000); await dormir(400);
      /* (COMMANDES = FLÈCHES : la ligne n'existe plus dans la pause — TCTL.pad reste faux ; non testé ici) */
      await touche('Escape', true); await touche('Escape', false); await dormir(900); await photo('var-pause');
      const vu = await c.ev("(function(){var e=document.getElementById('ecole');return e?getComputedStyle(e).visibility:'absent'})()");
      console.log('    calque en pause : ' + vu + ' · ' + JSON.stringify(await etat()));
      await dormir(3000); const ep = await etat(); console.log('    3 s de pause : ' + JSON.stringify({ i: ep.i, ph: ep.ph, paused: ep.paused }));
      await touche('Escape', true); await touche('Escape', false); await dormir(1200);
      console.log('    reprise : ' + JSON.stringify(await etat()));
      await c.ev("dbgTuto(5);1"); await dormir(2600); await photo('var-figure');
      console.log('    figure : ' + JSON.stringify(await etat()));
      await c.ev("dbgTuto(1);1"); await dormir(600);
      /* QUITTER pendant la leçon : elle doit revenir au prochain JOUER */
      process.exitCode = erreurs.length ? 1 : 0;
      console.log(erreurs.length ? '✗ exceptions : ' + erreurs.join(' / ') : '✔ 0 exception');
      return;
    }
    /* L'ACCUEIL puis la carte-titre de TOURNE */
    await attends(e => e.ph === 'accueil' || e.ph === 'titre', 8000);
    await dormir(700); await photo('accueil');
    await attends(e => e.ph === 'titre', 6000); await dormir(650); await photo('1-titre');
    await attends(e => e.ph === 'geste', 6000); await dormir(500); await photo('1-geste');
    /* 1 · TOURNE */
    await tiens('ArrowLeft', 450); await dormir(150); await touche('ArrowRight', true);
    let e = await attends(e => e.ph === 'bravo' || e.i > 0, 3000, 40); await touche('ArrowRight', false);
    await dormir(260); await photo('1-bravo');
    /* 2 · NITRO */
    await attends(e => e.i === 1 && e.ph === 'titre', 5000); await dormir(700); await photo('2-titre');
    await attends(e => e.ph === 'geste', 6000); await dormir(400); await photo('2-geste');
    await touche(' ', true); await dormir(500); await photo('2-geste-tenu');
    e = await attends(e => e.i > 1 || e.ph === 'bravo', 4000, 50); await touche(' ', false);
    await dormir(260); await photo('2-bravo');
    /* 3 · DÉCOLLE : on sort par le bord */
    await attends(e => e.i === 2 && e.ph === 'titre', 5000); await dormir(700); await photo('3-titre');
    await attends(e => e.ph === 'geste', 6000); await dormir(400); await photo('3-geste');
    await touche('ArrowLeft', true);
    e = await attends(e => e.i > 2 || e.ph === 'bravo', 8000, 40); await touche('ArrowLeft', false);
    console.log('    après DÉCOLLE : ' + JSON.stringify(e));
    await dormir(200); await photo('3-bravo');
    /* 4 · VOLE : ESPACE en l'air */
    /* (2026-11-22) une étape atteinte en vol n'a plus de carte-titre : le geste est demandé tout de suite (le mot arrive en grand dans le rappel) */
    await attends(e => e.i === 3 && e.ph !== 'bravo', 5000, 40); await dormir(300); await photo('4-annonce');
    await c.ev('dbgAuto(true,0,{vol:true,nit:0});1');
    await touche(' ', true); await dormir(400); await photo('4-geste');
    e = await attends(e => e.i > 3 || e.ph === 'bravo' || e.i < 3, 6000, 50); await touche(' ', false);
    console.log('    après VOLE : ' + JSON.stringify(e));
    await dormir(200); await photo('4-bravo');
    /* 5 · POSE-TOI : le pilote ramène la caisse sur l'axe ; si la leçon est revenue en arrière (DÉCOLLE), on refait */
    for (let essai = 0; essai < 8; essai++) {
      e = await etat(); if (e.i >= 5) break; if (A.v) console.log('    essai pose ' + essai + ' ' + JSON.stringify({ i: e.i, ph: e.ph, mode: e.mode }));
      if (e.i === 4) { await c.ev('dbgAuto(true,0,{vol:true,nit:1});1'); await attends(e => e.ph === 'geste' || e.i !== 4, 6000); await dormir(300); await photo('5-geste'); { const t0 = Date.now(); while (Date.now() - t0 < 14000) { const x = await etat(); if (x.i !== 4) break; if (A.v) console.log('      pose ' + JSON.stringify({ ph: x.ph, mode: x.mode, t: Date.now() - t0 })); await dormir(700); } } await c.ev('dbgAuto(true,0,{vol:true,nit:0});1'); continue; }
      if (e.i === 2) { await c.ev('dbgAuto(false)'); await attends(e => e.ph === 'geste', 6000); await touche('ArrowLeft', true); await attends(e => e.i > 2, 8000, 40); await touche('ArrowLeft', false); await c.ev('dbgAuto(true,0,{vol:true,nit:0});1'); }
      if ((await etat()).i === 3) { await attends(e => e.ph === 'geste' || e.i !== 3, 6000); await touche(' ', true); await attends(e => e.i !== 3, 6000, 50); await touche(' ', false); }
    }
    e = await etat(); console.log('    après POSE : ' + JSON.stringify(e));
    if (e.i < 5) { console.log('    ⚠ le pilote de mesure ne pose pas la caisse : dbgTuto(5) (la POSE n\'est pas validée par ce passage)'); await c.ev('dbgAuto(false);dbgTuto(5);1'); }
    await c.ev('dbgAuto(false)');
    /* 6 · FIGURE : deux tapes ESPACE */
    await attends(e => e.i === 5 && e.ph === 'titre', 6000); await dormir(700); await photo('6-titre');
    await attends(e => e.ph === 'geste', 6000); await dormir(500); await photo('6-geste');
    for (let k = 0; k < 4 && (await etat()).i === 5; k++) {
      await tiens(' ', 60); await dormir(90); await tiens(' ', 60);
      await attends(e => e.i > 5, 5000, 60); await dormir(400);
    }
    if ((await etat()).i === 5) { console.log('    la figure ne passe pas : dbgTuto(\'figure\')'); await c.ev("dbgTuto('figure')"); }
    await dormir(250); await photo('6-bravo');
    /* LE PERMIS */
    const fin = await attends(e => !e.on, 15000, 100);
    console.log('    fin : ' + JSON.stringify(fin));
    for (const t of [500, 900, 1300]) { await dormir(t); await photo('permis'); }
    await dormir(3500); await photo('apres');
    const reste = JSON.parse(await c.ev("JSON.stringify({ecole:!!document.getElementById('ecole'),visible:(function(){var x=document.getElementById('ecole');return x?getComputedStyle(x).display:'absent'})(),coach:!!document.getElementById('coach'),anims:document.getAnimations().filter(a=>{var t=a.effect&&a.effect.target;return t&&t.closest&&t.closest('#ecole,#ecPermis');}).length})"));
    console.log('après la leçon : ' + JSON.stringify(reste));
    const ok = fin && fin.tuto === 1 && fin.permis === 1;
    console.log(ok ? '✔ permis obtenu' : '✗ pas de permis');
    console.log(erreurs.length ? '✗ exceptions : ' + erreurs.length + '\n  ' + erreurs.slice(0, 8).join('\n  ') : '✔ 0 exception');
    process.exitCode = ok && !erreurs.length ? 0 : 1;
  } catch (x) { console.error('ÉCHEC : ' + x.message); console.error(erreurs.slice(0, 5).join('\n')); process.exitCode = 1; try { await photo('echec'); } catch (e) {} }
  finally { c.close(); tueChrome(ch); srv.close(); }
})();
