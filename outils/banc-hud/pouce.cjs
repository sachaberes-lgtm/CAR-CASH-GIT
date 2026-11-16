// LA PLANCHE DU POUCE (2026-11-12, Sacha : « retravaille le bouton nitro et son animation, il faut que ça ressemble plus à un pouce ») — lance une course en édition téléphone,
// force un à un les états du bouton NITRO (dbgNitro3 : appui, vent du glissé, double-tap, palettes) et recopie sa toile, agrandie ×6 sans lissage, sur UNE planche :
//   <out>/pouce-planche.png (les états côte à côte, sur fond clair et sur fond sombre) + <out>/pouce-jeu.png (le bouton dans le jeu) + le coût du dessin (dbgNitro3().ms).
//   node outils/banc-hud/pouce.cjs --out /chemin --prof /chemin/profil [--http 9781 --cdp 9782] [--jeu …]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), OUT = path.resolve(A.out || path.join(__dirname, 'prises')), PROF = A.prof ? path.resolve(A.prof) : tmp();
const P_HTTP = +(A.http || 9781), P_CDP = +(A.cdp || 9782), W = 390, H = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* [nom, ce qu'on force] — tout est remis à zéro avant chaque état */
const ETATS = [
  ['repos', ''], ['appui a demi', "dbgNitro3('p',.5)"], ['appui', "dbgNitro3('p',1)"], ['glisse a gauche', "dbgNitro3('p',1);dbgNitro3('v',[1,0])"], ['glisse a droite', "dbgNitro3('p',1);dbgNitro3('v',[-1,0])"],
  ['glisse en haut', "dbgNitro3('p',1);dbgNitro3('v',[0,1])"], ['double-tap', "dbgNitro3('b',.8)"], ['chaud', "dbgNitro3('pal','f3')"], ['bleu', "dbgNitro3('pal','bleu')"], ['violet', "dbgNitro3('pal','vio')"], ['a sec', "dbgNitro3('pal','sec')"],
];
const PLANCHE = `(async function(){var E=${JSON.stringify(ETATS)},cv=document.querySelector('#tNitro canvas'),S=5,C=6,w=cv.width,h=cv.height,n=E.length,L=Math.ceil(n/C),pl=document.createElement('canvas');
  pl.width=C*(w*S+8)+8;pl.height=L*(h*S+30)+8;var c=pl.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#7fb4e0';c.fillRect(0,0,pl.width,h*S+34);c.fillStyle='#1a1230';c.fillRect(0,h*S+34,pl.width,pl.height);
  c.font='bold 18px monospace';var Z=function(){dbgNitro3('p',0);dbgNitro3('v',null);dbgNitro3('b',-1);dbgNitro3('pal',null);};
  for(var i=0;i<n;i++){Z();try{(0,eval)(E[i][1]);}catch(e){}await new Promise(function(r){setTimeout(r,450)});
    var k=(i/C)|0,x=8+(i%C)*(w*S+8),y=4+k*(h*S+30);c.drawImage(cv,x,y,w*S,h*S);c.fillStyle=k?'#fff':'#102';c.fillText(E[i][0],x+4,y+h*S+20);}
  Z();dbgNitro3('p',null);return pl.toDataURL('image/png');})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, PROF, W, H), c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = []; let code = 0;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); } catch (_) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&sans=hudcalme` + (A.q ? '&' + A.q : '') });
    let pret = false; for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas');
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2500);
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) { try { await c.ev('dbgJouer();1'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} } }
    if (!enCourse) throw new Error('la course ne part pas');
    try { await c.ev('dbgAuto(true,0,{vol:true});1'); } catch (e) {}
    await dormir(3000);
    const url = await c.ev(PLANCHE, 60000);
    fs.writeFileSync(path.join(OUT, 'pouce-planche.png'), Buffer.from(String(url).split(',')[1], 'base64'));
    const r = JSON.parse(await c.ev("(function(){var b=document.getElementById('tNitro').getBoundingClientRect();return JSON.stringify([b.left,b.top,b.width,b.height])})()"));
    const sh = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: Math.max(0, r[0] - 70), y: Math.max(0, r[1] - 50), width: Math.min(W, r[2] + 90), height: Math.min(H, r[3] + 70), scale: 2 } }, 30000);
    fs.writeFileSync(path.join(OUT, 'pouce-jeu.png'), Buffer.from(sh.data, 'base64'));
    console.log('coût :', await c.ev('JSON.stringify(dbgNitro3())').then(s => String(s).slice(0, 260)));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); code = 1; } finally { try { c.close(); } catch (e) {} tueChrome(ch); }
  if (erreurs.length) { console.log('erreurs :', erreurs.length); for (const e of erreurs.slice(0, 8)) console.log('  ! ' + e); code = 1; }
  srv.close(); process.exit(code);
})().catch(e => { console.error(e); process.exit(1); });
