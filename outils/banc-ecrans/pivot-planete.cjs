// LE BANC DU PIVOT DE LA PLANÈTE (2026-11-17, qualité · lot pivotplanete — Sacha : « l'animation de la planète bug toujours quand on passe du mode
// horizontal au mode vertical : il y a un temps où la planète est à moitié coupée »).
// Le film d'intro (la boule de « 1.61 », toile #fxCv) sur le chemin du téléphone (Chrome sans fenêtre, MUET, 390×844 ×2, toucher, hover:none → TEL_NATIF),
// et des pivots debout ↔ couché par CDP (Emulation.setDeviceMetricsOverride). Comme WKWebView, les événements de taille arrivent EN RETARD :
// `resize` (fenêtre) et les rappels de ResizeObserver sont retenus --retard ms (100 par défaut) ; innerWidth/innerHeight, eux, changent tout de suite.
// À CHAQUE IMAGE (rAF puis tâche suivante : ce que l'image a montré), la toile est relue en petit (¼) et la boîte des pixels lumineux de la boule est
// rapportée à la fenêtre : « coupée » = la boîte touche un bord de la fenêtre (à 2 px près), ou la toile a encore sa taille d'avant le pivot.
// Le film Page.startScreencast NE MONTRE PAS la coupure (Chrome n'envoie l'image qu'une fois recomposée) : la preuve, ce sont les relevés par image (<pivot>.json). Et un film image par image (Page.startScreencast) 1,5 s après chaque pivot, dans --out.
// Pivots : dans le noir d'ouverture (0,4 s), pendant que la boule s'écrit (3 s), boule prête (×4), juste après le toucher (l'explosion), puis au menu (photos).
//   node outils/banc-ecrans/pivot-planete.cjs --out /chemin [--q "sans=pivotplanete"] [--retard 100] [--cpu 4] [--http 9951 --cdp 9952]
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(os.tmpdir(), 'banc-pivot-planete'));
const PROF = path.join(os.tmpdir(), 'banc-pivot-planete-prof');
const P_HTTP = +(A.http || 9951), P_CDP = +(A.cdp || 9952), RETARD = +(A.retard != null ? A.retard : 100), CPU = +(A.cpu || 1);
const TW = 390, TH = 844;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const RETIENT = `(function(D){if(!D)return;
  window.addEventListener('resize',function(e){if(e.__pp)return;e.stopImmediatePropagation();setTimeout(function(){var n=new Event('resize');n.__pp=1;window.dispatchEvent(n);},D);},true);
  var RO=window.ResizeObserver;if(RO){var R2=function(cb){return new RO(function(en,o){setTimeout(function(){cb(en,o);},D);});};R2.prototype=RO.prototype;window.ResizeObserver=R2;}
})(${RETARD});`;
const SONDE = `(function(){var P=window.__PP={on:false,l:[]};var raf=requestAnimationFrame.bind(window),tc=null,tx=null;
  function mes(){var cv=document.getElementById('fxCv');if(!cv||!cv.width||!cv.isConnected)return null;var r=cv.getBoundingClientRect();if(r.width<2||r.height<2)return null;
    var w=Math.max(1,Math.round(r.width/4)),h=Math.max(1,Math.round(r.height/4));if(!tc){tc=document.createElement('canvas');tx=tc.getContext('2d',{willReadFrequently:true});}
    tc.width=w;tc.height=h;tx.clearRect(0,0,w,h);tx.drawImage(cv,0,0,w,h);var d=tx.getImageData(0,0,w,h).data,x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,n=0,kx=r.width/w,ky=r.height/h;
    for(var j=0;j<h;j++)for(var i=0;i<w;i++){var o=4*(j*w+i);if(d[o+3]<128)continue;var L=.3*d[o]+.59*d[o+1]+.11*d[o+2];if(L<${+(A.seuil || 110)})continue;
      var X=r.left+(i+.5)*kx,Y=r.top+(j+.5)*ky;if(X<0||Y<0||X>innerWidth||Y>innerHeight)continue;n++;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;}
    return n<6?[0]:[n,Math.round(x0),Math.round(y0),Math.round(x1),Math.round(y1),Math.round(r.width),Math.round(r.height)];}
  function f(){raf(f);if(!P.on)return;setTimeout(function(){var I=window.__ccIntroAuto,ok=0;try{ok=I&&I.pret()?1:0;}catch(e){}P.l.push([Math.round(performance.now()),innerWidth,innerHeight,ok,mes()]);},0);}
  raf(f);})();`;

async function metrique(c, W, H) {
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H,
    screenOrientation: W > H ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
}
/* une image est-elle « coupée » ? */
function juge(s) {
  const [, W, H, pret, m] = s; if (!m || m[0] === 0) return { vide: 1 };
  const [n, x0, y0, x1, y1] = m, bord = x0 <= 2 || y0 <= 2 || x1 >= W - 2 || y1 >= H - 2;
  const land = W > H * 1.15, R = Math.min(W * .24, H * (land ? .27 : .19)), ex = W / 2, ey = H * (land ? .5 : .46);
  const ec = Math.hypot((x0 + x1) / 2 - ex, (y0 + y1) / 2 - ey) / R;
  const vieille = m[5] !== W || m[6] !== H; /* la toile a encore la taille d'avant le pivot */
  return { bord, ec, vieille, coupe: bord || vieille }; /* (l'écart au centre n'est qu'indicatif : le mot « TOUCHE » sous la boule et la lumière en haut à gauche le décalent d'≈ 0,5 R au repos) ; à l'explosion, les éclats touchent les bords par nature */
}

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, TW, TH);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = []; let film = null, nf = 0;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Page.screencastFrame') { c.send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
      if (film) fs.writeFileSync(path.join(OUT, `${film}-${String(nf++).padStart(3, '0')}.jpg`), Buffer.from(m.params.data, 'base64')); }
  } catch (_) {} });
  const bilan = [];
  let W = TW, H = TH;
  const pivote = async (nom) => {
    [W, H] = [H, W]; const sens = W > H ? 'couche' : 'debout';
    await c.ev('(window.__PP.l=[],window.__PP.on=true,1)'); film = `${nom}-${sens}`; nf = 0;
    const t0 = await c.ev('performance.now()');
    await metrique(c, W, H); await dormir(1500);
    film = null;
    const L = await c.ev('(function(){var l=window.__PP.l;window.__PP.on=false;window.__PP.l=[];return l;})()');
    const apres = L.filter(s => s[0] >= t0), j = apres.map(s => [s, juge(s)]);
    const coupees = j.filter(x => x[1].coupe), pleines = j.filter(x => !x[1].vide);
    const r = { pivot: nom, vers: sens + ' ' + W + '×' + H, images: apres.length, avecBoule: pleines.length, coupees: coupees.length,
      premiere: coupees.length ? coupees[0][0][0] - Math.round(t0) : null, derniere: coupees.length ? coupees[coupees.length - 1][0][0] - Math.round(t0) : null,
      pireEcart: pleines.length ? +Math.max(...pleines.map(x => x[1].ec)).toFixed(2) : null,
      exemple: coupees.length ? coupees[0][0].slice(1) : null };
    bilan.push(r); console.log(JSON.stringify(r)); fs.writeFileSync(path.join(OUT, `${nom}-${sens}.json`), JSON.stringify(j.map(x => [x[0][0] - Math.round(t0)].concat(x[0].slice(1), [x[1]]))));
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await metrique(c, TW, TH);
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}\n' + RETIENT + '\n' + SONDE });
    if (CPU > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await c.send('Page.startScreencast', { format: 'jpeg', quality: 55, everyNthFrame: 1 });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1&v=${Date.now()}` + (A.q ? '&' + A.q.replace(/^[?&]/, '') : '');
    await c.send('Page.navigate', { url });
    const etat = () => c.ev('(function(){var I=window.__ccIntroAuto;if(!I)return [0,0,0];return [I.lance()?1:0,I.pret()?1:0,I.fini()?1:0];})()', 8000).catch(() => [0, 0, 0]);
    let e = [0, 0, 0];
    for (let i = 0; i < 900 && !e[0]; i++) { await dormir(50); e = await etat(); }
    if (!e[0]) throw new Error('le film ne part pas');
    await dormir(400); await pivote('noir');             /* le noir d'ouverture */
    await dormir(1100); await pivote('ecrit');            /* la boule s'écrit (≈ 3 s) */
    for (let i = 0; i < 400 && !e[1]; i++) { await dormir(100); e = await etat(); }
    await dormir(800);
    for (let k = 1; k <= 4; k++) { await pivote('prete' + k); await dormir(500); }
    await c.ev('(function(){try{window.__ccIntroAuto.tapBoule();}catch(e){}return 1;})()');
    await dormir(120); await pivote('explosion');
    for (let i = 0; i < 200; i++) { await dormir(100); e = await etat(); if (e[2]) break; }
    await dormir(2500); await pivote('menu1'); await dormir(1500); await pivote('menu2');
    console.log(JSON.stringify({ retard: RETARD, q: A.q || '', total: bilan.reduce((s, r) => s + r.coupees, 0), images: bilan.reduce((s, r) => s + r.images, 0), erreurs: erreurs.length, err: erreurs.slice(0, 2) }));
  } catch (x) { console.log('ÉCHEC :', String(x).slice(0, 300), erreurs.slice(0, 2)); }
  finally { try { c.close(); } catch (_) {} tueChrome(ch); srv.close(); process.exit(0); }
})().catch(e => { console.error(e); process.exit(1); });
