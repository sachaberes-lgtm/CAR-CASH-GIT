// LE BANC DU NITRO PHYSIQUE EN JEU (2026-11-10, Claude Fable) — le vrai jeu dans un Chrome sans fenêtre, son MUET pour les oreilles mais vivant (--mute-audio).
//   node outils/banc-son/nitro-physique.cjs [--q "moteur=buche&nitro=physique"] [--http 9861 --cdp 9862]
// Parcours : course (pilote auto) → nitro tenu 2,5 s → lâcher → coup bref → double-tap → saut (vol, pose) → pause → reprise → mort.
// Relève à chaque étape `dbgNPHY()` et `dbgNPHY('vu')` (niveau du nitro, du moteur, du total), et TOUTES les erreurs de la page.
// Vert si : le worklet est chargé, il sonne quand on appuie (et se tait sinon), il se coupe en pause et à la mort, 0 erreur. Sans le drapeau : rien n'est chargé.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), PROF = '/tmp/banc-nitro-physique-profil-' + process.pid;
const P_HTTP = +(A.http || 9861), P_CDP = +(A.cdp || 9862), Q = A.q == null ? 'moteur=buche&nitro=physique' : A.q, AVEC = /nitro=physique/.test(Q);
const SAVE = { v: 2, sfx: true, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
let echecs = 0; const ok = (b, t, d) => { if (!b) echecs++; console.log((b ? '  ✓ ' : '  ✗ ') + t + (d != null ? '   ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, PROF, 844, 390), c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = code => { try { c.close(); } catch (e) {} tueChrome(ch); try { srv.close(); } catch (e) {} try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} process.exit(code); };
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push('exception : ' + JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) { const t = m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300); if (!/favicon|DevTools|preload/.test(t)) erreurs.push(m.params.type + ' : ' + t); } } catch (x) {} });
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0` + (Q ? '&' + Q : '') });
  for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
  await dormir(2500);
  await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
  await dormir(2500); let parti = false;
  for (let i = 0; i < 240 && !parti; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { parti = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
  ok(parti, 'la course part'); if (!parti) { console.log(erreurs.slice(0, 8).join('\n')); fin(1); }
  const etat = () => c.ev("(function(){try{var d=dbgNPHY(),v=dbgNPHY('vu'),s=dbgState();return {d:d,v:v,mode:s.mode,paused:s.paused,over:s.gameOver,ac:(function(){try{return dbgAudio().running}catch(e){return null}})()}}catch(e){return {err:e.message}}})()");
  const touche = (bas) => c.ev(`window.dispatchEvent(new KeyboardEvent('${bas ? 'keydown' : 'keyup'}',{code:'Space',key:' ',bubbles:true}))`);
  const crete = async (ms) => { let mx = -200, mm = -200, mt = -200; for (let t = 0; t < ms; t += 90) { const e = await etat(); if (e.v) { mx = Math.max(mx, e.v.nitro); mm = Math.max(mm, e.v.moteur); mt = Math.max(mt, e.v.total); } await dormir(90); } return { nitro: mx, moteur: mm, total: mt }; };
  await c.ev('dbgAuto(true,0)'); await dormir(5000);
  let e = await etat(); console.log(' en course :', JSON.stringify(e));
  if (!AVEC) { ok(e.d && e.d.on === false && e.d.ok === false, 'sans le drapeau : rien n\'est chargé', e.d); ok(erreurs.length === 0, '0 erreur', erreurs.slice(0, 6)); fin(echecs ? 1 : 0); }
  ok(e.d && e.d.ok, 'le worklet du nitro physique est chargé', e.d);
  ok(/moteur=buche/.test(Q) ? e.d.surMoteurModerne : !e.d.surMoteurModerne, 'il est branché ' + (/moteur=buche/.test(Q) ? 'dans l\'étage de puissance du moteur moderne' : 'sur MASTER (bûche seule)'));
  const repos = await crete(1200); ok(repos.nitro < repos.moteur - 6, 'nitro éteint : la couche reste discrète (détails seuls)', repos);
  await touche(true); await dormir(700); const plein = await crete(1800); e = await etat();
  ok(e.d.appui > .3, 'on appuie : le nitro reçoit l\'appui', e.d);
  ok(plein.nitro > -60 && plein.nitro > repos.nitro + 10, 'on appuie : il sonne', plein);
  console.log('   → nitro ' + plein.nitro + ' dB · moteur ' + plein.moteur + ' dB · total ' + plein.total + ' dB (écart nitro − moteur : ' + (plein.nitro - plein.moteur).toFixed(1) + ' dB)');
  await touche(false); await dormir(150); const lache = await crete(900); await dormir(2600); e = await etat(); const apres = await crete(600);
  ok(e.d.appui === 0, 'on lâche : l\'appui retombe à 0', e.d); ok(lache.nitro > apres.nitro + 6, 'le lâcher a sa scène (purge, postcombustion), puis le silence revient', { lacher: lache.nitro, apres: apres.nitro });
  await touche(true); await dormir(110); await touche(false); const bref = await crete(700); ok(bref.nitro > apres.nitro + 3, 'un coup bref s\'entend', bref); await dormir(1500);
  await touche(true); await dormir(90); await touche(false); await dormir(110); await touche(true); await dormir(90); await touche(false); const dbl = await crete(900);
  console.log(' double-tap :', JSON.stringify(dbl), JSON.stringify(await c.ev('(function(){var s=dbgState();return {mode:s.mode}})()'))); await dormir(4000);
  try { console.log(' saut :', JSON.stringify(await c.ev("typeof dbgSaut==='function'?String(dbgSaut()).slice(0,60):'pas de dbgSaut'"))); } catch (x) {}
  await dormir(600); const vol = await etat(); console.log(' en vol :', JSON.stringify({ mode: vol.mode, d: vol.d, v: vol.v })); await dormir(5000);
  e = await etat(); ok(!e.err && e.d.ok, 'après le vol et la pose, tout tourne encore', { mode: e.mode, vif: e.d.vif });
  /* la pause : nitro tenu, puis pause → coupure nette */
  await touche(true); await dormir(900); await c.ev("window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true}))"); await dormir(900); e = await etat();
  if (!e.paused) { await c.ev("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p',bubbles:true}))"); await dormir(900); e = await etat(); }
  ok(e.paused, 'la pause prend', { paused: e.paused }); ok(e.d.vif === false && e.d.appui === 0, 'en pause : le nitro est coupé net', e.d);
  await touche(false); await c.ev("(function(){var b=document.querySelector('.tp.go[data-a=\"close\"]');if(b){b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));b.click();return 1}return 0})()"); await dormir(5000);
  e = await etat(); ok(!e.paused && e.d.vif, 'REPRENDRE : la couche repart', { paused: e.paused, vif: e.d.vif, mode: e.mode });
  const rep = await crete(800); ok(rep.nitro < plein.nitro - 8, 'à la reprise, pas de nitro fantôme', rep);
  /* la mort : nitro tenu, on quitte la route */
  await touche(true); await c.ev('dbgAuto(false)'); await c.ev("window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowLeft',key:'ArrowLeft',bubbles:true}))");
  let mort = false; for (let i = 0; i < 80 && !mort; i++) { await dormir(500); e = await etat(); mort = !!e.over; }
  await touche(false); await dormir(1200); e = await etat();
  ok(mort, 'la partie se termine', { over: e.over, mode: e.mode }); ok(e.d.vif === false, 'à la mort : coupé', e.d);
  const fini = await crete(600); ok(fini.nitro < -70, 'écran de fin : silence du nitro', fini);
  ok(erreurs.length === 0, '0 erreur dans la page', erreurs.slice(0, 8));
  console.log(echecs ? echecs + ' échec(s)' : 'tout passe'); fin(echecs ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
