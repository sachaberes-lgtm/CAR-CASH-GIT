// CONTRÔLE « tuto-code » (2026-11-22) : les minuteurs de la leçon après PAUSE / RECOMMENCER / QUITTER, le vol laissé seul après DÉCOLLE,
// le permis par-dessus l'écran de fin, le mode gaucher + FIGURES › GLISSER. Ne modifie rien ; son coupé.
//   node outils/banc-tuto/controle-code.cjs --sc A|B [--out dossier] [--http 9951 --cdp 9952]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9951), P_CDP = +(A.cdp || 9952), W = +(A.w || 390), H = +(A.h || 844), SC = A.sc || 'A';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { sfx: false, mus: false, vox: false };
if (SC === 'B') { SAVE.gaucher = 1; SAVE.figG = 'glisse'; }
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const erreurs = [];
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
  } catch (x) {} });
  const photo = async nom => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const f = path.join(OUT, 'ctl-' + SC + '-' + nom + '.png'); fs.writeFileSync(f, Buffer.from(sh.data, 'base64')); console.log('    photo ' + f); };
  const etat = async () => JSON.parse(await c.ev("(function(){var d=dbgTuto(),s=dbgState(),e=document.getElementById('ecole');return JSON.stringify({on:d.on,i:d.i,tuto:d.tuto,permis:d.permis,ph:d.ph,mode:s.mode,st:s.started,go:s.gameOver,pa:s.paused,ecole:e?getComputedStyle(e).display+'/'+getComputedStyle(e).visibility:'absent',dph:e?e.dataset.ph:'',permisEl:!!document.getElementById('ecPermis'),wipe:(document.getElementById('wipe')||{}).className||'',mod:(document.getElementById('modale')||{}).className||'',body:document.body.className.split(/\\s+/).filter(function(x){return /^(coOn|coNitro|dead|hTp|setPause|gaucher|figGlisse)$/.test(x)}).join(',')})})()"));
  const KEYS = { ArrowLeft: 37, ArrowRight: 39, ' ': 32, Escape: 27 };
  const touche = async (k, bas) => { const code = k === ' ' ? 'Space' : k; await c.send('Input.dispatchKeyEvent', { type: bas ? 'keyDown' : 'keyUp', key: k, code, windowsVirtualKeyCode: KEYS[k], nativeVirtualKeyCode: KEYS[k] }); };
  const tiens = async (k, ms) => { await touche(k, true); await dormir(ms); await touche(k, false); };
  const attends = async (f, ms, pas = 100) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const e = await etat(); if (f(e)) return e; await dormir(pas); } return null; };
  const suis = async (nom, ms, pas = 250) => { const t0 = Date.now(); let der = ''; while (Date.now() - t0 < ms) { const e = await etat(); const s = JSON.stringify(e); if (s !== der) { console.log('    [' + nom + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s] ' + s); der = s; } await dormir(pas); } };
  const clic = async (sel, txt) => c.ev("(function(){var l=[].slice.call(document.querySelectorAll(" + JSON.stringify(sel) + "));var t=" + JSON.stringify(txt || '') + ";var b=l.filter(function(x){return (!t||x.textContent.indexOf(t)>=0)&&x.getBoundingClientRect().width>0})[0];if(!b)return 'absent('+l.length+')';b.click();return 'ok '+b.textContent.trim().slice(0,30)})()");
  const tourne = async () => { await attends(e => e.i === 0 && e.ph === 'geste', 15000); await dormir(300); await tiens('ArrowLeft', 450); await dormir(150); await touche('ArrowRight', true); const e = await attends(e => e.ph === 'bravo' || e.i > 0, 3000, 30); await touche('ArrowRight', false); return e; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.bancTuto){sessionStorage.bancTuto=1;localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.ccLang="fr";}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&intro=ancien&attente=0` });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas');
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(3000);
    const jouer = async () => { for (let essai = 0; essai < 3; essai++) { try { await c.ev('dbgJouer()'); } catch (e) {} for (let i = 0; i < 60; i++) { await dormir(500); try { const e = await etat(); if (e.st && !e.go && e.on) return true; } catch (e) {} } } return false; };
    if (!await jouer()) throw new Error('la leçon ne part pas');
    console.log('leçon partie · body ' + (await etat()).body);
    if (SC === 'A1') {
      /* PAUSE pendant le BRAVO, RECOMMENCER, puis le volant répond-il ? */
      let e = await tourne(); console.log('  TOURNE : ' + JSON.stringify(e));
      await touche('Escape', true); await touche('Escape', false); await dormir(3000);
      console.log('  3 s de pause : ' + JSON.stringify(await etat()));
      console.log('  clic RECOMMENCER : ' + await clic('[data-a="reset"]')); await dormir(1400);
      console.log('  confirme : ' + await clic('#modale button,#modale .pbtn,#modale [role=button]', 'RECOMMENCER'));
      await attends(e => e.i === 0 && e.ph === 'geste', 15000); await dormir(300);
      const st = async n => console.log('    ' + n + ' ' + await c.ev("(function(){var s=dbgState();return JSON.stringify({psi:s.psi,yawR:s.yawR,mode:s.mode,pa:s.paused,act:document.activeElement&&(document.activeElement.id||document.activeElement.tagName),cls:document.getElementById('ecole').className})})()"));
      await suis('après RECOMMENCER', 1, 1); await st('avant'); await touche('ArrowLeft', true); await dormir(500); await st('← tenu 0,5 s'); await touche('ArrowLeft', false); await dormir(200);
      await touche('ArrowRight', true); await dormir(600); await st('→ tenu 0,6 s'); await touche('ArrowRight', false);
      await suis('après les deux flèches', 3000, 150);
    } else if (SC === 'A2') {
      let e = await tourne(); console.log('  TOURNE : ' + JSON.stringify(e));
      await attends(e => e.i === 1 && e.ph === 'geste', 8000); await touche(' ', true); await attends(e => e.i > 1, 4000, 40); await touche(' ', false);
      await attends(e => e.i === 2 && e.ph === 'geste', 8000); await dormir(200);
      await touche('ArrowLeft', true); e = await attends(e => e.i > 2, 9000, 30); await touche('ArrowLeft', false);
      console.log('  DÉCOLLE validé : ' + JSON.stringify(e) + ' — plus aucune touche');
      await suis('vol laissé seul', 22000, 100);
    } else if (SC === 'A3') {
      await attends(e => e.ph === 'titre', 12000); await dormir(300);
      await touche('Escape', true); await touche('Escape', false); await dormir(900);
      console.log('  pause (titre) : ' + JSON.stringify(await etat()));
      console.log('  clic QUITTER : ' + await clic('[data-a="quit"]')); await dormir(1400);
      console.log('  confirme : ' + await clic('#modale button,#modale .pbtn,#modale [role=button]', 'QUITTER'));
      await suis('après QUITTER', 5000, 200);
      console.log('  animations restantes : ' + await c.ev("document.getAnimations().filter(function(a){var t=a.effect&&a.effect.target;return t&&t.closest&&t.closest('#ecole,#ecPermis');}).length"));
      console.log('  clic REJOUER : ' + await clic('[data-m="replay"]')); await suis('après REJOUER', 16000, 250);
      await attends(e => e.ph === 'titre' || e.ph === 'geste', 12000);
      await c.ev("dbgTuto('permis');1"); await dormir(1500);
      console.log('  permis : ' + JSON.stringify(await etat()));
      console.log('  dbgQuitte : ' + await c.ev('dbgQuitte()')); await dormir(1300);
      const pe = await c.ev("(function(){var p=document.getElementById('ecPermis');if(!p)return 'absent';var s=getComputedStyle(p),b=p.querySelector('.epBloc').getBoundingClientRect();return JSON.stringify({display:s.display,vis:s.visibility,z:s.zIndex,bloc:[Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)],dead:document.body.classList.contains('dead')})})()");
      console.log("  permis sur l'écran de fin : " + pe + ' · ' + JSON.stringify(await etat()));
      await photo('permis-sur-fin');
    } else {
      /* B · MODE GAUCHER + FIGURES › GLISSER : où va le pouce ? */
      await attends(e => e.ph === 'geste' || e.ph === 'titre', 12000);
      const mesure = async nom => { let minX = 1e9, maxX = -1e9, n = 0, nit = ''; for (let k = 0; k < 40; k++) { const r = JSON.parse(await c.ev("(function(){var e=document.getElementById('ecole');if(!e)return '{}';var m=e.querySelector('.e3Main>.e3Mvt:last-child .e3Doigt .e3Sv'),n=document.getElementById('tNitro'),j=e.querySelector('.e3Jauge'),x=e.querySelector('.e3X2'),g=e.querySelector('.e3Gl');function R(q){if(!q)return null;var r=q.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]}return JSON.stringify({m:R(m),n:R(n),j:R(j),x:R(x),g:R(g),cls:e.className,dg:e.dataset.g,op:m?getComputedStyle(m.closest('.e3Mvt')).opacity:''})})()")); if (r.m) { minX = Math.min(minX, r.m[0]); maxX = Math.max(maxX, r.m[2]); n++; nit = JSON.stringify(r); } await dormir(60); }
        console.log('  ' + nom + ' : pouce x de ' + minX + ' à ' + maxX + ' (écran 0–' + W + ') · dernier ' + nit); };
      await c.ev('dbgTuto(1);1'); await attends(e => e.ph === 'geste', 6000); await dormir(600); await mesure('NITRO gaucher'); await photo('gaucher-nitro');
      await c.ev('dbgTuto(5);1'); await attends(e => e.ph === 'geste', 6000); await dormir(300); await mesure('FIGURE glisser gaucher');
      for (const t of [0, 350, 350, 350]) { await dormir(t); } await photo('gaucher-glisser-1'); await dormir(700); await photo('gaucher-glisser-2'); await dormir(500); await photo('gaucher-glisser-3');
    }
    console.log(erreurs.length ? 'exceptions : ' + erreurs.join(' / ') : '0 exception');
  } catch (x) { console.error('ÉCHEC : ' + x.message); console.error(erreurs.slice(0, 5).join('\n')); process.exitCode = 1; try { await photo('echec'); } catch (e) {} }
  finally { c.close(); tueChrome(ch); srv.close(); }
})();
