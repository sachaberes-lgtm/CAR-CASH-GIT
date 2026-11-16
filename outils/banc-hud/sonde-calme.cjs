// LA SONDE DU CALME (2026-11-13) : en HUD calme, monte d'un palier (dbgMoteur) et liste tout ce qui se voit encore dans le DOM, photos à +0,3 / 0,9 / 2 s. Harnais repris de calme-rien.cjs.
// les sons seule la musique reste ») — une course en édition téléphone (?tel=1), trois temps : nitro tenu · nitro lâché (le HUD calme tombe à 0,9 s) · nitro repris.
// Il CONTRÔLE, par les crochets du jeu :
//   1. le son : l'entrée des effets du limiteur (MASTER._limIn) est ouverte au nitro, FERMÉE au calme (la musique entre à côté, elle ne passe pas par là), rouverte au nitro ;
//   2. les pièces : au calme RIEN ne se ramasse (l'argent ne bouge pas), AUCUNE pièce ne vole dans la caisse (CVOL.lances) ; au nitro, elles volent ;
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
    const SONDE = `(function(){var W=innerWidth,H=innerHeight,o=[];document.querySelectorAll('body *').forEach(function(e){if(e.id==='splash')return;var r=e.getBoundingClientRect();if(r.width<2||r.height<2||r.right<0||r.bottom<0||r.left>W||r.top>H)return;var a=1,x=e;while(x&&x.nodeType===1){var cs=getComputedStyle(x);if(cs.display==='none'||cs.visibility==='hidden')return;a*=+cs.opacity;x=x.parentElement;}if(a<.05)return;var cs=getComputedStyle(e);var peint=e.tagName==='CANVAS'||e.tagName==='IMG'||e.tagName==='svg'||(cs.backgroundImage!=='none')||(cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&cs.backgroundColor!=='transparent')||[].some.call(e.childNodes,function(n){return n.nodeType===3&&n.textContent.trim()});var pse=['::before','::after'].some(function(p){var s=getComputedStyle(e,p);return s.content&&s.content!=='none'&&s.content!=='normal'&&+s.opacity>0&&s.display!=='none'});if(!peint&&!pse)return;o.push((e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+String(e.className&&e.className.baseVal!=null?e.className.baseVal:e.className).split(' ')[0])+'@'+(e.parentElement&&e.parentElement.id||'')+' a='+a.toFixed(2)+(pse?' ::':''));});return o.join(' | ');})()`;
    await c.ev('dbgAuto(true,0,{nit:1});1'); await dormir(5000);
    await c.ev('dbgAuto(true,0,{nit:0});1'); await dormir(2000);
    console.log('calme :', JSON.stringify(await c.ev('JSON.stringify(dbgHudCalme())')));
    console.log('VISIBLE AVANT :', await c.ev(SONDE)); await photo('sonde-0');
    console.log('dbgMoteur :', await c.ev('dbgMoteur()'));
    for (const t of [300, 900, 2000]) { await dormir(t === 300 ? 300 : t === 900 ? 600 : 1100); console.log('VISIBLE +' + t + ' :', await c.ev(SONDE)); await photo('sonde-' + t); }
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
