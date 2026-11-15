/* (2026-11-15, qualité · menus froids, CORRECTIONS du contrôle) LA PREUVE DES 5 DÉFAUTS — node outils/banc-menus/menus.cjs --scenario outils/banc-menus/s-menusfroids2.cjs
     --out <dossier> --formats debout,couche --http 9891 --cdp 9892 --q "appareil=iPhone14,2"
   1. hors veille l'observateur est débranché (0 rappel) ; 2. une course de 30 s : 0 rappel, 0 clé, 0 lecture du style ; 3. la veille TIENT sur PROFIL et PLAQUE ;
   4. réveil sur un attribut / une classe de <html> et sur un pivot, aucune entrée gelée invisible ; 5. #overlay : l'alpha du fond est lu, photos RÉGLAGES depuis la
   pause et sous-états de la boutique de la coque (défilée, fenêtre d'achat). */
const fs = require('fs'), zlib = require('zlib');
function png(buf) { let p = 8, W = 0, H = 0, ct = 0; const idat = [];
  while (p < buf.length) { const len = buf.readUInt32BE(p), ty = buf.toString('ascii', p + 4, p + 8); if (ty === 'IHDR') { W = buf.readUInt32BE(p + 8); H = buf.readUInt32BE(p + 12); ct = buf[p + 17]; } else if (ty === 'IDAT') idat.push(buf.slice(p + 8, p + 8 + len)); p += 12 + len; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 1, raw = zlib.inflateSync(Buffer.concat(idat)), st = W * bpp, out = Buffer.alloc(H * st);
  for (let y = 0; y < H; y++) { const f = raw[y * (st + 1)]; for (let x = 0; x < st; x++) { const a = x >= bpp ? out[y * st + x - bpp] : 0, b = y ? out[(y - 1) * st + x] : 0, c = (x >= bpp && y) ? out[(y - 1) * st + x - bpp] : 0; let v = raw[y * (st + 1) + 1 + x];
    if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); } out[y * st + x] = v & 255; } }
  return { W, H, bpp, px: out }; }
function ecart(f1, f2, X) { const a = png(fs.readFileSync(f1)), b = png(fs.readFileSync(f2)); let n = 0, mx = 0; /* X : un rectangle exclu (px de la photo), la carte animée de la fenêtre d'achat */
  for (let i = 0; i < a.W * a.H; i++) { if (X) { const x = i % a.W, y = (i / a.W) | 0; if (x >= X[0] && x < X[2] && y >= X[1] && y < X[3]) continue; } let d = 0; for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(a.px[i * a.bpp + k] - b.px[i * b.bpp + k])); if (d > 2) n++; if (d > mx) mx = d; } return { pixels: n, max: mx }; }
module.exports = async function (b) {
  const { ev, tap, shot, dormir, log, c, W, H } = b;
  const V = async () => JSON.parse(await ev("JSON.stringify((function(){const v=dbgVeille();delete v.elements;return v})())"));
  const K = async () => JSON.parse(await ev("JSON.stringify(dbgCouverte())"));
  const gelInvisible = "(function(){let n=0,p=0,l=[];for(const a of document.getAnimations()){if(a.animationName===undefined)continue;if(a.playState==='paused'){p++;const e=a.effect&&a.effect.target;if(e&&e.nodeType===1&&+getComputedStyle(e).opacity<.05){n++;l.push(e.id||String(e.className).slice(0,30));}}}return JSON.stringify({pausees:p,invisiblesGelees:n,l:l.slice(0,6),ccVeilleP:document.querySelectorAll('.ccVeilleP').length})})()";
  const photos = async (nom, excl) => {
    const X = excl ? JSON.parse(await ev(`(function(){const e=document.querySelector(${JSON.stringify(excl)});if(!e)return 'null';const r=e.getBoundingClientRect();return JSON.stringify([r.left*2-4,r.top*2-4,r.right*2+4,r.bottom*2+4].map(Math.round))})()`)) : null;
    await ev("(function(){const s=document.createElement('style');s.id='bancGel';s.textContent='*,*::before,*::after{animation-play-state:paused!important;caret-color:transparent!important}';document.head.appendChild(s);return 1})()");
    await dormir(400); const f1 = await shot(nom + '-vis'); await dormir(300); const f0 = await shot(nom + '-vis2');
    await ev("(function(){document.querySelectorAll('canvas').forEach(function(k){const r=k.getBoundingClientRect();if(r.width*r.height<innerWidth*innerHeight*.9)return;k.dataset.bancVis=k.style.visibility;k.style.visibility='hidden';});return 1})()");
    await dormir(400); const f2 = await shot(nom + '-cache');
    await ev("(function(){document.querySelectorAll('canvas').forEach(function(k){if(k.dataset.bancVis!==undefined){k.style.visibility=k.dataset.bancVis;delete k.dataset.bancVis;}});const s=document.getElementById('bancGel');if(s)s.remove();return 1})()");
    log('PHOTO', nom, 'vis/cache', JSON.stringify(ecart(f1, f2)), 'bruit vis/vis2', JSON.stringify(ecart(f1, f0)), X ? 'hors de ' + excl + ' ' + JSON.stringify(X) + ' : vis/cache ' + JSON.stringify(ecart(f1, f2, X)) + ' vis/vis2 ' + JSON.stringify(ecart(f1, f0, X)) : '');
  };
  const cad = async (ms) => { const a = await ev('dbgCouverte().rendu.frame'); await dormir(ms); const z = await ev('dbgCouverte().rendu.frame'); return +((z - a) * 1000 / ms).toFixed(1); };

  /* 1. AU MENU, HORS VEILLE : l'observateur ne reçoit rien, même quand le HUD ou le menu écrivent des styles */
  await ev("window.__mGo('home');1"); await dormir(1500);
  let k0 = await K();
  await ev("(function(){const e=document.querySelector('#mHome')||document.body;let i=0;const t=setInterval(function(){e.style.setProperty('--banc',String(i));document.body.classList.toggle('bancX');if(++i>=40){clearInterval(t);document.body.classList.remove('bancX');}},50);return 1})()");
  await dormir(2600); let k1 = await K();
  log('1 HORS VEILLE (40 écritures de style et de classe)', 'veille', k1.compteurs.branche, 'rappels observateur', k1.compteurs.mut - k0.compteurs.mut);

  /* 5a. l'alpha du fond : un ::before translucide n'est plus « couvrant » */
  await ev("window.__mGo('set');1"); await dormir(1600);
  log('5a RÉGLAGES', 'lu', (await K()).lu);
  await ev("(function(){const s=document.createElement('style');s.id='bancFond';s.textContent='body.touch #overlay::before{background:rgba(7,5,15,.9)!important}';document.head.appendChild(s);return 1})()");
  log('5a RÉGLAGES fond rgba .9', 'lu', JSON.stringify((await K()).lu), '(attendu vide)');
  await ev("(function(){document.getElementById('bancFond').remove();return 1})()");
  log('5a RÉGLAGES fond rendu', 'lu', (await K()).lu);

  /* 5b. la boutique de la coque : en haut, défilée, fenêtre d'achat */
  await ev("window.__mGo('shop');1"); await dormir(2000);
  log('5b BOUTIQUE haut', JSON.stringify(await K()), 'images/s', await cad(2000)); await photos('shop-haut');
  await ev("(function(){overlay.scrollTop=1e5;return overlay.scrollTop})()"); await dormir(800);
  log('5b BOUTIQUE défilée', JSON.stringify((await K()).couvert), 'images/s', await cad(2000)); await photos('shop-bas');
  await ev("(function(){overlay.scrollTop=0;return 1})()"); await dormir(500);
  log('5b tap caisse', await tap('#shGrille [data-car],#shUne[data-car]')); await dormir(1600);
  log('5b BOUTIQUE fenêtre d\'achat', await ev("JSON.stringify({pop:!!(document.getElementById('shPop')&&document.getElementById('shPop').classList.contains('on'))})"), JSON.stringify((await K()).couvert), 'images/s', await cad(2000));
  await photos('shop-achat', '#shPop .spCarte');
  log('5b ferme', await tap('#shPop [data-sp="non"]')); await dormir(1200);
  await ev("window.__mGo('home');1"); await dormir(2500);

  /* 3. LA VEILLE TIENT SUR PROFIL ET PLAQUE (aucun aller-retour) */
  log('tap garage', await tap('#mHome [data-m="garage"]')); await dormir(4000);
  log('tap profil', await tap('#gProf')); await dormir(1500);
  log('3 PROFIL', JSON.stringify((await K()).qui)); await dormir(21000);
  let v = await V(); log('3 PROFIL à 22,5 s', 'on', v.on, 'gelés', v.geles, 'entrées', v.entrees, 'pourquoi', v.pourquoi);
  await dormir(8000); v = await V(); log('3 PROFIL à 30,5 s', 'on', v.on, 'gelés', v.geles, 'entrées', v.entrees, 'pourquoi', v.pourquoi, JSON.stringify(v.animations));
  log('tap plaque', await tap('#prof .pfChg')); await dormir(1500);
  log('3 PLAQUE', JSON.stringify((await K()).qui), 'veille', (await V()).on, await ev("(function(){const p=document.getElementById('plq');return JSON.stringify({plq:p?p.className:null,PLQ:typeof dbgPlq==='function'?1:0})})()")); await dormir(21000);
  v = await V(); log('3 PLAQUE à 22,5 s', 'on', v.on, 'gelés', v.geles, 'entrées', v.entrees, 'pourquoi', v.pourquoi);
  await dormir(8000); v = await V(); log('3 PLAQUE à 30,5 s', 'on', v.on, 'gelés', v.geles, 'entrées', v.entrees, 'pourquoi', v.pourquoi, JSON.stringify(v.animations), 'éléments', await ev("JSON.stringify(dbgVeille().elements)"));
  /* 4a. pendant la vraie veille : un attribut de <html> (comme data-palier du gouverneur) réveille */
  k0 = await K();
  await ev("(function(){document.documentElement.setAttribute('data-banc','1');return 1})()"); await dormir(100);
  v = await V(); log('4a data-* sur <html> pendant la veille', 'on', v.on, 'pourquoi', v.pourquoi, 'gel', await ev(gelInvisible));
  await ev("(function(){document.documentElement.removeAttribute('data-banc');return 1})()");
  log('tap plaque retour', await tap('#plq .plRet')); await dormir(1200);
  log('tap profil retour', await tap('#prof .pfRet')); await dormir(1500);
  /* 4b. classe de <html>, pivot réel : veilles forcées (dbgVeille('entre')), le réveil se lit avant toute image */
  const force = async (nom, act) => { const r = await ev("(function(){dbgVeille('entre');const n=document.querySelectorAll('.ccVeilleP').length;" + act + ";return n})()"); await dormir(60);
    v = await V(); log('4b', nom, 'gelés avant', r, 'on', v.on, 'pourquoi', v.pourquoi, 'gel', await ev(gelInvisible)); };
  await force('classe sur <html>', "document.documentElement.classList.toggle('bancH')");
  await ev("document.documentElement.classList.remove('bancH');1");
  await force('resize (évènement)', "window.dispatchEvent(new Event('resize'))");
  await force('orientationchange', "window.dispatchEvent(new Event('orientationchange'))");
  await ev("dbgVeille('entre');1");
  await c.send('Emulation.setDeviceMetricsOverride', { width: H, height: W, deviceScaleFactor: 2, mobile: true, screenWidth: H, screenHeight: W }); await dormir(400);
  v = await V(); log('4b PIVOT réel', 'on', v.on, 'pourquoi', v.pourquoi, 'gel', await ev(gelInvisible));
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H }); await dormir(1500);
  log('4b retour', 'gel', await ev(gelInvisible));

  /* 2. UNE COURSE DE 30 S : compteurs */
  await ev("window.__mGo('home');1"); await dormir(2000);
  log('jouer', JSON.stringify(await ev("(function(){try{dbgImmortel(true)}catch(e){}return JSON.stringify(dbgJouer())})()")));
  for (let i = 0; i < 40; i++) { await dormir(500); if (await ev("(function(){const s=dbgState();return s.started&&!s.gameOver&&!s.paused&&!dbgHC().garageOn})()")) break; }
  await dormir(1500);
  k0 = await K(); const e0 = await ev("JSON.stringify(dbgState())");
  for (let i = 0; i < 30; i++) { /* 30 s de course, un doigt de temps en temps (les écouteurs de la veille ne font rien) */
    if (i % 3 === 0) { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(W * .3), y: Math.round(H * .8) }] }); await dormir(120); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await dormir(880); }
    else await dormir(1000); }
  k1 = await K(); const e1 = JSON.parse(await ev("JSON.stringify(dbgState())"));
  log('2 COURSE 30 s', 'en course', e1.started && !e1.gameOver && !e1.paused, 'images', k1.rendu.frame - k0.rendu.frame,
    'rappels observateur', k1.compteurs.mut - k0.compteurs.mut, 'clés construites', k1.compteurs.cle - k0.compteurs.cle,
    'lectures du style', k1.compteurs.lit - k0.compteurs.lit - 1, '(le −1 : la lecture lu de dbgCouverte elle-même)', 'veille', k1.compteurs.branche);

  /* 5c. RÉGLAGES DEPUIS LA PAUSE */
  await ev("window.__panBascule();1"); await dormir(1500);
  log('pause', JSON.stringify(await ev("dbgState().paused")), 'tap tous', await tap('#tPanel .tp[data-a="tous"]')); await dormir(1800);
  log('5c RÉGLAGES de la pause', await ev("JSON.stringify({setPause:!!window.__setPause,ecran:overlay.getAttribute('data-ecran')})"), JSON.stringify(await K()), 'images/s', await cad(2000));
  await photos('pause-reglages');
  log('erreurs', await ev("JSON.stringify((window.dbgErreurs&&dbgErreurs())||null).slice(0,600)"));
};
