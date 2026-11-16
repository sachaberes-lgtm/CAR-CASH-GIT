// LA PREUVE AU PIXEL DES PROGRAMMES EN DOUBLE (2026-11-15, lot programmes2) — d'après outils/banc-pcmain/det.cjs et outils/banc-menus/menus.cjs.
// Deux lancements du jeu ne donnent jamais la même image (det.cjs : la caisse s'écarte de quelques cm à 2 m après 120 pas) : on compare donc SUR LA MÊME PAGE, LA MÊME IMAGE FIGÉE.
// Un Chrome sans fenêtre et MUET, iPhone émulé (UA, toucher, hover:none → TEL_NATIF vrai, donc PROG_DOUBLE vrai), ?appareil=iPhone14,2 (13 Pro, classe 1).
// À chaque SCÈNE (menu, garage, boutique, puis une course à plusieurs pas) : rAF coupé, l'horloge figée le temps de chaque dessin, puis
//   A  = composer.render() + readPixels du tampon de l'écran (la sortie de la puce, sans le DOM)      [interrupteur ALLUMÉ : programmes partagés]
//   A2 = le même dessin refait                                                                        [le plancher de bruit de la méthode]
//   self.__ccProgDouble=false, toutes les matières marquées needsUpdate (three refait leur clé : les programmes d'AVANT renaissent), dessins jusqu'à ce que tout soit lié
//   B  = le même dessin                                                                               [interrupteur ÉTEINT : comme ?sans=progdouble]
//   B2 = encore
//   self.__ccProgDouble=true, needsUpdate, liaison
//   C  = le même dessin                                                                               [rallumé]
// et compte les pixels qui diffèrent (A/A2, A/B, B/B2, A/C) et l'écart maximal par canal. Le nombre de programmes vivants est relevé à chaque état.
// ⚠ Les numéros de programme (three trie les objets opaques par numéro de programme) ne sont pas ceux d'un lancement neuf dans l'état B : ils sont DIFFÉRENTS dans A, B et C, ce qui éprouve aussi l'ordre de dessin.
// Usage : node outils/banc-demarrage/progdouble.cjs --out <dossier> [--fmt debout|couche] [--scenes menu,garage,boutique,course] [--carte nuages] [--meteo matin] [--pas 60,150,300]
//                                                   [--q "x=y"] [--photos 1] [--http 9871 --cdp 9872]          Verrou : ~/cash-car/verrou-banc.sh prendre/rendre autour.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises-progdouble')); fs.mkdirSync(OUT, { recursive: true });
const FMT = A.fmt || 'debout', [W, H] = FMT === 'couche' ? [844, 390] : [390, 844];
const SCENES = (A.scenes || 'menu,garage,boutique,course').split(','), CARTE = A.carte || 'nuages', METEO = A.meteo || 'matin';
const PAS = (A.pas || '60,150,300').split(',').map(Number), P_HTTP = +(A.http || 9871), P_CDP = +(A.cdp || 9872), PHOTOS = A.photos !== '0';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* la sonde : le hasard semé, et la liste de TOUTES les matières nées (three r128 : Object.defineProperty(this,"id") dans le constructeur Material) */
const SONDE = `(function(){var a=12345>>>0;Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  var dp=Object.defineProperty,M=window.__PDM=[];Object.defineProperty=function(o,p,d){var r=dp.apply(this,arguments);try{if(p==='id'&&o&&o.isMaterial)M.push(o);}catch(e){}return r;};})();`;
/* la comparaison, dans la page */
const COMPARE = `(async function(nom,photos){
  var S=dbgScene(),rd=S.rdr,gl=rd.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,R={scene:nom,toile:[w,h],prog:self.__ccProgDouble};try{var q=dbgPrf();R.prf={on:q.on,c:q.c,n:q.n,nMax:q.nMax,q:q.q};}catch(e){}
  if(!self.__ccProgDouble){R.erreur='interrupteur éteint au départ';return JSON.stringify(R);}
  var pn=performance.now,dn=Date.now,C=pn.call(performance),D=dn.call(Date); /* (en course la page est chargée avec ?garde=0 : le garde de course étale les naissances de programmes sur plusieurs images, ici on veut l'image complète tout de suite) */
  var img={},url={};
  function rendu(k){performance.now=function(){return C;};Date.now=function(){return D;};
    try{dbgLoupe({rendre:1});rd.setRenderTarget(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);var b=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b);if(k){img[k]=b;if(photos)url[k]=rd.domElement.toDataURL('image/png');}return b;}
    finally{performance.now=pn;Date.now=dn;}}
  async function pose(){var n0=-1,calme=0;for(var i=0;i<200&&calme<4;i++){rendu(null);await new Promise(function(r){setTimeout(r,40);});var n=rd.info.programs.length,att=dbgLier().enCours;if(n===n0&&!att)calme++;else calme=0;n0=n;}
    /* puis jusqu'à ce que l'image ne bouge plus à phase égale (en course quelques pixels convergent encore sur les premiers dessins refaits) : 6 dessins de suite égaux à celui d'il y a deux */
    var H=[],ok=0;for(var j=0;j<120&&ok<6;j++){var b=rendu(null);if(H.length>=2&&ecart(b,H[H.length-2]).pixels===0)ok++;else ok=0;H.push(b);if(H.length>2)H.shift();i++;}
    return i+(ok<6?' (PAS STABLE)':'');}
  function bascule(on){self.__ccProgDouble=on;var M=window.__PDM;for(var i=0;i<M.length;i++)M[i].needsUpdate=true;}
  function ecart(a,b){var n=0,mx=0;for(var i=0;i<a.length;i+=4){var d=Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]),Math.abs(a[i+3]-b[i+3]));if(d){n++;if(d>mx)mx=d;}}return {pixels:n,max:mx};}
  function plein(a){var n=0,s=0;for(var i=0;i<a.length;i+=4){if(a[i]||a[i+1]||a[i+2])n++;s=(s*31+a[i]+a[i+1]*3+a[i+2]*7)>>>0;}return {nonNoirs:n,somme:s};}
  try{
    /* en course le même dessin refait n'est pas identique d'une fois sur l'autre : il ALTERNE entre deux images (période 2), et quelques pixels (≤ 32 vus) bougent encore d'un dessin au suivant
       à phase égale. On prend donc 4 dessins de suite dans chaque état (A, B, C) et on rend, pour chaque couple d'états, LE PLUS PETIT écart entre un dessin de l'un et un dessin de l'autre :
       0 = les deux états ont produit la même image au bit près. « bruit » = le plus grand écart entre deux dessins de même phase DANS l'état A (le plancher de la méthode). */
    function serie(k){for(var i=0;i<4;i++)rendu(k+i);}
    function mini(x,y){var m=null,q='';for(var i=0;i<4;i++)for(var j=0;j<4;j++){var e=ecart(img[x+i],img[y+j]);if(!m||e.pixels<m.pixels){m=e;q=x+i+'/'+y+j;}}m.couple=q;return m;}
    R.poseA=await pose();R.progA=rd.info.programs.length;serie('A');
    bascule(false);R.poseB=await pose();R.progB=rd.info.programs.length;serie('B');
    bascule(true);R.poseC=await pose();R.progC=rd.info.programs.length;serie('C');
    R.image=plein(img.A0);R.alternance=ecart(img.A0,img.A1);var n0=ecart(img.A0,img.A2),n1=ecart(img.A1,img.A3);R.bruit=n0.pixels>=n1.pixels?n0:n1;
    R.A_B=mini('A','B');R.A_C=mini('A','C');R.B_C=mini('B','C');
    R.matieres=window.__PDM.length;if(photos){var q=R.A_B.couple.split('/');R.url={A:url[q[0]],B:url[q[1]]};}
  }catch(e){R.erreur=String(e&&e.stack||e).slice(0,400);}
  finally{self.__ccProgDouble=true;}
  return JSON.stringify(R);})`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [], tous = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400)); } catch (x) {} });
  const compare = async nom => {
    if (PHOTOS) try { const e = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }, 60000); fs.writeFileSync(path.join(OUT, `${FMT}-${nom}-ecran.jpg`), Buffer.from(e.data, 'base64')); } catch (e) {} /* l'écran entier, DOM compris : pour savoir quelle scène c'est */
    const r = JSON.parse(await c.ev(COMPARE + '(' + JSON.stringify(nom) + ',' + (PHOTOS ? 1 : 0) + ')', 300000));
    if (r.url) { for (const k of ['A', 'B']) fs.writeFileSync(path.join(OUT, `${FMT}-${nom}-${k === 'A' ? 'partage' : 'avant'}.png`), Buffer.from(r.url[k].split(',')[1], 'base64')); delete r.url; }
    r.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()");
    tous.push(r); console.log(JSON.stringify(r)); return r; };
  const tap = async (sel, fx, fy) => { const r = await c.ev(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)return null;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy}]})()`);
    if (!r) return false; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true; };
  /* figer : rAF coupé, les rappels demandés entre-temps gardés ; relâcher : ils sont rendus au vrai rAF (dbgStep annule la rAF de loop : il ne relance pas la boucle) */
  const fige = async on => { await c.ev(on ? "if(!window.__raf){window.__raf=window.requestAnimationFrame;window.__rafQ=[];window.requestAnimationFrame=function(f){window.__rafQ.push(f);return 0;};}1" : "if(window.__raf){var r=window.__raf,q=window.__rafQ||[];window.requestAnimationFrame=r;window.__raf=null;window.__rafQ=[];q.forEach(function(f){r.call(window,f);});}1"); if (on) await dormir(300); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + SONDE });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=${CARTE}&meteo=${METEO}&pistegraine=7&appareil=iPhone14,2` + (A.q ? '&' + A.q : '');
    console.log(url);
    await c.send('Page.navigate', { url });
    let pret = false;
    for (let i = 0; i < 400 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    for (let i = 0; i < 120; i++) { await dormir(500); if (await c.ev("(function(){var m=document.getElementById('mHome');return !!(m&&m.classList.contains('on'))})()")) break; }
    await dormir(6000); /* la chauffe du menu finit de lier */
    if (SCENES.includes('menu')) { await fige(1); await compare('menu'); await fige(0); }
    if (SCENES.includes('garage') || SCENES.includes('boutique')) {
      console.log('garage :', await tap('#mHome [data-m="garage"]')); await dormir(8000);
      if (SCENES.includes('garage')) { await fige(1); await compare('garage'); await fige(0); }
      if (SCENES.includes('boutique')) { console.log('boutique :', await tap('#gShopBas', .82, .84)); /* (le bouton est en L : on vise sa barre du bas) */ await dormir(8000); await fige(1); await compare('boutique'); await fige(0); }
    }
    if (SCENES.includes('course')) {
      { await c.send('Page.navigate', { url: 'about:blank' }); await dormir(400); await c.send('Page.navigate', { url: url.replace('garde=1', 'garde=0') });
        pret = false; for (let i = 0; i < 400 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
        await dormir(2000); await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2000); }
      await fige(1); let ok = false;
      for (let i = 0; i < 240 && !ok; i++) { if (i % 16 === 0) { try { await c.ev(`dbgClassique('${CARTE}','${METEO}');dbgJouer()`); } catch (e) {} }
        await c.ev('(async function(){for(var i=0;i<15;i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,30)});}return 1})()', 60000);
        try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
      if (!ok) throw new Error('course pas lancée');
      await c.ev("dbgAuto(1,0,{nit:1});try{dbgPin(true)}catch(e){};1");
      let fait = 0;
      for (const P of PAS) {
        for (let k = fait; k < P; k += 30) await c.ev(`(async function(){try{dbgNitro(9,0)}catch(e){};for(var i=0;i<${Math.min(30, P - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 240000);
        fait = P;
        const r = await compare('course-' + CARTE + '-' + P);
        try { r.niveau = JSON.parse(await c.ev("JSON.stringify({niveau:dbgClassique().niveau,etat:dbgState().gameOver?'fini':'en course',caisse:dbgScene().car.position.toArray().map(Math.round)})")); console.log('   ', JSON.stringify(r.niveau)); } catch (e) {}
      }
    }
  } catch (e) { console.log('ÉCHEC :', String(e && e.message || e).slice(0, 400)); tous.push({ erreur: String(e && e.message || e).slice(0, 400) }); }
  finally { fs.writeFileSync(path.join(OUT, `progdouble-${FMT}-${SCENES.join('+')}-${CARTE}.json`), JSON.stringify({ quand: new Date().toISOString(), fmt: FMT, carte: CARTE, meteo: METEO, exceptions: exc.slice(0, 8), scenes: tous }, null, 1)); console.log('exceptions', exc.length, exc.slice(0, 2)); fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
