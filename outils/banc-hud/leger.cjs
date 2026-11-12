// LE BANC DU HUD LÉGER (2026-11-12, Sacha : « refonte du HUD… teste bien tout pour qu'il n'y ait pas de superposition ») — photographie le HUD de
// course en édition téléphone à chaque moment (départ, course, HUD chargé : flow + cinq pouvoirs + vol, frénésie), relève la boîte de TOUT ce qui
// se voit, et CONTRÔLE :
//   1. les chevauchements : deux blocs du HUD dont les boîtes se coupent de plus de 2 px (les couches plein écran sont ignorées) ;
//   2. ce qui ne doit PLUS se voir (compteur d'aura, vitesse, ×flow, étiquettes du bas) ;
//   3. le HUD contemplatif (--calme 1) : nitro tenu → tout se voit ; lâché depuis 1,6 s → il ne reste que le bouton pause.
// Sortie : <out>/<format>-<moment>.png, <out>/leger-<format>.json, et un verdict en clair. Code de sortie 1 si un contrôle échoue.
//   node outils/banc-hud/leger.cjs --out /chemin --prof /chemin/profil --formats debout [--http 9771 --cdp 9772] [--calme 1] [--q "x=1"] [--jeu …]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const PROF = A.prof ? path.resolve(A.prof) : tmp();
const P_HTTP = +(A.http || 9771), P_CDP = +(A.cdp || 9772), CALME = A.calme === '1';
const FORMATS = { debout: [390, 844], couche: [844, 390], i7couche: [667, 375], i7debout: [375, 667], maxdebout: [430, 932], maxcouche: [932, 430] };
const FMTS = (A.formats || 'debout,couche').split(',');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

/* LA SONDE (dans la page) : tout élément qui PEINT quelque chose (texte, fond, bordure, image, toile) et qui se voit vraiment — opacité multipliée
   le long des ancêtres, visibility, display, boîte dans l'écran. Chaque élément est rattaché à son BLOC : le plus proche ancêtre de la liste BLOCS,
   sinon son ancêtre à id le plus haut sous <body>/#hud. La boîte d'un bloc = l'union de ce qui s'y voit (pas sa boîte CSS : une boîte vide ne gêne personne). */
const SONDE = `(function(){
  var BLOCS=['tGear','nitroWrap','flowHud','cashHud','airHud','pwrChip','campChip','triade','frenChrono','frenTraits','frenTitre','auraV2','avGain','nxVit','speedo','fil','m2Ligne','m2Focus','fhLeg','fh','tFig','figGl','tNitro','tSteer','misBan','coach','lvlBan','msg','verdHud','popTxt','engBig','slam9','ajVols','money','carInfo','auraHud','cpInfo','minimap','record','facVies','survHud','lastAlert','toast'];
  var W=innerWidth,H=innerHeight,B={};
  function alpha(c){if(!c||c==='transparent')return 0;var s=/\\/\\s*([\\d.]+)(%?)\\s*\\)/.exec(c);if(s)return parseFloat(s[1])/(s[2]?100:1); /* « color(srgb r v b / a) », « rgb(r v b / a) » */
    var m=/rgba\\(([^)]+)\\)/.exec(c);if(m){var p=m[1].split(',');return p.length>3?parseFloat(p[3]):1;}return 1;}
  function peint(e,cs){
    if(e.tagName==='CANVAS'||e.tagName==='IMG'||e.tagName==='svg'||e.tagName==='path')return true;
    for(var n=e.firstChild;n;n=n.nextSibling)if(n.nodeType===3&&n.nodeValue.trim()&&alpha(cs.webkitTextFillColor||cs.color)+((cs.backgroundClip||'').indexOf('text')>=0?1:0)>0.05)return true;
    if(cs.backgroundImage&&cs.backgroundImage!=='none'&&(cs.backgroundClip||'').indexOf('text')<0)return true;
    if(alpha(cs.backgroundColor)>0.05)return true;
    if(cs.boxShadow&&cs.boxShadow!=='none')return true;
    if(parseFloat(cs.borderTopWidth)>0&&alpha(cs.borderTopColor)>0.05)return true;
    return false;}
  function bloc(e){for(var p=e;p&&p!==document.body;p=p.parentElement)if(p.id&&BLOCS.indexOf(p.id)>=0)return p.id;
    var d=null;for(var p=e;p&&p!==document.body;p=p.parentElement)if(p.id&&p.id!=='hud')d=p.id;return d||'?';}
  function va(e,op){
    var cs=getComputedStyle(e);if(cs.display==='none')return;
    var o=op*parseFloat(cs.opacity);if(o<0.04)return;
    var nit=e.id==='tNitro'; /* la flamme NITRO : sa toile déborde exprès de la boîte du bouton (la queue, le glissé) — on compte la BOÎTE du bouton, pas la toile */
    if(e.tagName==='CANVAS'&&e.closest('#tNitro'))return;
    if(cs.visibility!=='hidden'&&(nit||peint(e,cs))){var r=e.getBoundingClientRect();
      if(r.width>=2&&r.height>=2&&r.right>0&&r.bottom>0&&r.left<W&&r.top<H){var k=bloc(e),b=B[k]||(B[k]={l:1e9,t:1e9,r:-1e9,b:-1e9,op:0,n:0});
        b.l=Math.min(b.l,r.left);b.t=Math.min(b.t,r.top);b.r=Math.max(b.r,r.right);b.b=Math.max(b.b,r.bottom);b.op=Math.max(b.op,o);b.n++;}}
    for(var c=e.firstElementChild;c;c=c.nextElementSibling)va(c,o);}
  for(var c=document.body.firstElementChild;c;c=c.nextElementSibling)va(c,1);
  for(var k in B){var b=B[k];b.l=Math.round(b.l);b.t=Math.round(b.t);b.r=Math.round(b.r);b.b=Math.round(b.b);b.w=b.r-b.l;b.h=b.b-b.t;b.op=+b.op.toFixed(2);}
  return JSON.stringify({vp:[W,H],body:document.body.className,html:document.documentElement.className,B:B});})()`;

/* les couches plein écran (voiles, toiles du jeu, zone du volant) et le décor ne sont pas des blocs du HUD */
const FOND = /^(tSteer|touchCtl|c|cv|gl|jeu|scene|slCv|juiceCv|cloudFx|vig|beatFx|scan|speedFx|feverGlow|flash|flowGlow|pwrFx|launchGlow|mepTemoin|bordsFx|telCadre|\?)$/;
const INTERDITS = ['auraV2', 'airHud', 'nxVit', 'speedo', 'm2Ligne', 'm2Focus', 'fil', 'fh', 'auraHud', 'money', 'carInfo', 'cpInfo'];
function pleinEcran(b, vp) { return b.w >= vp[0] * .9 && b.h >= vp[1] * .6; }
function controle(s, nom) {
  const pb = [], K = Object.keys(s.B).filter(k => !FOND.test(k) && !pleinEcran(s.B[k], s.vp));
  for (const k of K) if (INTERDITS.indexOf(k) >= 0) pb.push(nom + ' : ' + k + ' se voit encore ' + JSON.stringify(s.B[k]));
  for (const k of K) { const b = s.B[k]; if (b.l < 0 || b.t < 0 || b.r > s.vp[0] || b.b > s.vp[1]) pb.push(nom + ' : ' + k + ' sort de l\'écran ' + JSON.stringify(b)); }
  for (let i = 0; i < K.length; i++) for (let j = i + 1; j < K.length; j++) {
    const a = s.B[K[i]], b = s.B[K[j]], w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (w > 2 && h > 2) pb.push(nom + ' : ' + K[i] + ' × ' + K[j] + ' se chevauchent de ' + w + ' × ' + h + ' px');
  }
  return { blocs: K, pb };
}

const MOMENTS = CALME ? [
  { n: 'calme-0-nitro', js: 'dbgAuto(true,0,{nit:1});dbgPwr("n");dbgPwr("a");dbgHud("flow",60)', att: 1500, tout: 1 },
  { n: 'calme-1-lache-0s5', js: 'dbgAuto(true,0,{nit:0})', att: 500, tout: 1 },
  { n: 'calme-2-lache-1s6', att: 1100, vide: 1 },
  { n: 'calme-3-lache-4s', att: 2400, vide: 1 },
  { n: 'calme-4-nitro-revient', js: 'dbgAuto(true,0,{nit:1})', att: 500, tout: 1 },
  { n: 'calme-5-pause', js: 'dbgAuto(true,0,{nit:0});setTimeout(function(){window.__panBascule()},1500)', att: 3000 },
] : [
  { n: 'depart', att: 1200 },
  { n: 'course', att: 5000 },
  { n: 'pouvoirs-2', js: "dbgPwr('n');dbgPwr('a');dbgHud('flow',60);dbgHud('chaine',3);dbgLeFil('TONNEAU +45',1)", att: 1200 },
  { n: 'pouvoirs-5', js: "dbgPwr('v');dbgPwr('m');dbgPwr('x');dbgHud('chaine',3);dbgHud('flow',20);dbgLeFil('SALTO AVANT +120',2);try{dbgMissions('gagne',dbgMissions()[0].id)}catch(e){}", att: 1400 },
  { n: 'pouvoirs-5-fin', att: 3200 },
  /* les NOMS DES FIGURES (le fil) : un nom, puis trois dans la même seconde (chacun à la couleur de sa rareté), puis un nom très long */
  /* un TRÈS GROS total d'argent (soldeFit doit le faire rétrécir, jamais mordre la barre de nitro) puis un petit */
  { n: 'argent-gros', js: "dbgCash(12345678)", att: 900, voit: ['cashHud'] },
  { n: 'argent-petit', js: "dbgCash(25)", att: 600, voit: ['cashHud'] },
  { n: 'nom-un', js: "dbgLeFil('TONNEAU',1,'commun')", att: 450 },
  { n: 'noms-trois', js: "dbgLeFil('TOUPIE 720',1,'rare');dbgLeFil('SALTO AVANT',1,'epique');dbgLeFil('QUADRUPLE TONNEAU',1,'legendaire')", att: 450 },
  { n: 'noms-longs', att: 450, js: "dbgLeFil('HELICO 1440',1,'exotique');dbgLeFil('DOUBLE SALTO ARRIERE',1,'legendaire');dbgLeFil('QUADRUPLE TONNEAU',1,'commun');dbgLeFil('TOUPIE 720',1,'rare')" },
  /* (2026-11-13, Sacha : « enlève le texte des figures en bas, remets les figures à côté du nitro ») en vol : le rappel des gestes (#fhLeg) se voit à côté de NITRO, sans rien toucher */
  { n: 'figures-vol', js: "document.body.classList.add('figVol');document.getElementById('fhLeg').innerHTML=['SALTO AVANT','SALTO ARRIERE','TONNEAU'].map(function(n,i){return '<div class=\\\"fhL\\\" data-s=\\\"'+i+'\\\"><b data-rp=\\\"rare\\\">'+n+'</b></div>'}).join('')", att: 600, voit: ['fhLeg'] },
  { n: 'frenesie', js: "dbgFren('v',100);dbgFren('entre')", att: 2500 },
  { n: 'pause', js: 'window.__panBascule()', att: 1200, sansControle: 1 },
];

module.exports = { SONDE, controle, FORMATS, UA, SAVE }; /* (vie.cjs réutilise la sonde et le contrôle) */
if (require.main === module) (async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  let echecs = 0;
  for (const fmt of FMTS) {
    const [W, H] = FORMATS[fmt], rapport = {};
    const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
    const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
    const erreurs = [];
    c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) erreurs.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (_) {} });
    const photo = async (nom) => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, fmt + '-' + nom + '.png'), Buffer.from(sh.data, 'base64')); };
    try {
      await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
      await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (CALME ? '' : '&sans=hudcalme') + (A.q ? '&' + A.q : '') });
      let pret = false;
      for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
      if (!pret) throw new Error('le jeu ne démarre pas');
      await dormir(2500);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(2500);
      /* JOUER : redemandé jusqu'à trois fois (à froid, ou machine chargée, le premier appel tombe avant que l'accueil soit prêt et la course ne part pas) */
      let enCourse = false;
      for (let essai = 0; essai < 3 && !enCourse; essai++) {
        let j = ''; try { j = JSON.stringify(await c.ev('dbgJouer()')).slice(0, 160); } catch (e) { j = 'erreur ' + e.message.slice(0, 120); }
        for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
        if (!enCourse) { let d = ''; try { d = await c.ev("(function(){var s=dbgState();return JSON.stringify({started:s.started,running:s.running,mode:s.mode,body:document.body.className.slice(0,90),splash:!!document.getElementById('splash')})})()"); } catch (e) {} console.log(fmt, 'JOUER', essai + 1, ':', j, d); }
      }
      if (!enCourse) { await photo('echec'); throw new Error('la course ne part pas'); }
      try { await c.ev('dbgAuto(true,0,{vol:true});1'); } catch (e) {} /* le pilote tient la route et le vol : la caisse ne meurt pas au milieu des photos */
      if (CALME) await dormir(4000); /* le logo du départ est parti */
      for (const m of MOMENTS) {
        let ok = '';
        if (m.js) { try { await c.ev(m.js + ';1'); } catch (e) { ok += ' js:' + e.message.slice(0, 160); } }
        await dormir(m.att);
        let s = null; try { s = JSON.parse(await c.ev(SONDE)); } catch (e) { ok += ' sonde:' + e.message.slice(0, 120); }
        await photo(m.n); /* la sonde AVANT la photo : une capture prend jusqu'à 0,6 s sur une machine chargée, et le HUD calme tombe à 0,9 s */
        const r = { ok, sonde: s, pb: [] };
        if (s && !m.sansControle) {
          const k = controle(s, fmt + '-' + m.n); r.blocs = k.blocs; r.pb = k.pb;
          /* un chevauchement ne compte que s'il DURE : la colonne se range dix fois par seconde, un bloc qui change de taille peut mordre le suivant le temps d'un passage */
          if (r.pb.length) { await dormir(350); let s2 = null; try { s2 = JSON.parse(await c.ev(SONDE)); } catch (e) {}
            if (s2) { const cle = p => p.replace(/ (se chevauchent|se voit|sort) .*$/, ''), dure = controle(s2, fmt + '-' + m.n).pb.map(cle);
              r.passagers = r.pb.filter(p => dure.indexOf(cle(p)) < 0); r.pb = r.pb.filter(p => dure.indexOf(cle(p)) >= 0); for (const p of r.passagers) console.log('   ~ (passager, parti en 0,35 s) ' + p); } }
          if (m.vide) { const reste = k.blocs.filter(b => ['tGear', 'cashHud', 'engVig', 'engPop', 'msg', 'trickBox', 'popTxt', 'fil'].indexOf(b) < 0) /* (2026-11-12, Sacha) l'argent, le moteur et ses paliers, les petits textes restent pendant le calme */; if (reste.length) r.pb.push(fmt + '-' + m.n + ' : HUD calme, il reste ' + reste.map(b => b + ' (opacité ' + s.B[b].op + ')').join(', ')); if (k.blocs.indexOf('tGear') < 0) r.pb.push(fmt + '-' + m.n + ' : le bouton pause a disparu'); }
          if (m.voit) for (const b of m.voit) if (k.blocs.indexOf(b) < 0 && !(b === 'fil' && /ebOn/.test(s.body))) r.pb.push(fmt + '-' + m.n + ' : ' + b + ' devrait se voir (corps : ' + s.body.slice(0, 110) + ')');
          if (m.tout) for (const b of ['tGear', 'nitroWrap', 'flowHud', 'cashHud', 'tNitro']) if (k.blocs.indexOf(b) < 0) r.pb.push(fmt + '-' + m.n + ' : ' + b + ' devrait se voir');
        }
        rapport[m.n] = r; echecs += r.pb.length;
        console.log(fmt + '-' + m.n, (ok || 'ok'), '· blocs :', (r.blocs || []).map(b => b + '[' + s.B[b].l + ',' + s.B[b].t + ' ' + s.B[b].w + '×' + s.B[b].h + ']').join(' '));
        for (const p of r.pb) console.log('   ✗ ' + p);
      }
      rapport.erreurs = erreurs; if (erreurs.length) { console.log(fmt, 'console :', erreurs.length); for (const e of erreurs.slice(0, 12)) console.log('   ! ' + e); }
    } catch (e) { console.log(fmt, 'ÉCHEC :', String(e).slice(0, 300)); rapport.echec = String(e).slice(0, 300); echecs++; } finally { try { c.close(); } catch (e) {} tueChrome(ch); }
    fs.writeFileSync(path.join(OUT, 'leger-' + fmt + (CALME ? '-calme' : '') + '.json'), JSON.stringify(rapport, null, 1));
  }
  srv.close(); console.log(echecs ? echecs + ' PROBLÈME(S)' : 'TOUT EST BON'); process.exit(echecs ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
