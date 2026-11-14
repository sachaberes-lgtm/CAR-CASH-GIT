// LE BANC DE L'INTÉGRATION (2026-11-14, chantier QUALITÉ PAR APPAREIL, lot « integ »). UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde).
// Téléphone émulé SANS ?tel=1 et SANS ?rubans=1 : 844×390 DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai, le VRAI profil par ?appareil=iPhoneN,x.
//   node outils/banc-integ/integ.cjs --mode demarrage|jeu|chaud|pc [--essais "iPhone14,2:neuf;iPhone17,1:haute"] [--jeu <dossier>] [--duree 20] [--http 9871] [--cdp 9872] [--q "x=1"]
// Un essai = <appareil|->:<neuf|fast|haute|net|net0|vieuxnet>[:<paramètres d'URL en plus, séparés par +>]
//   neuf = sauvegarde sans q ; fast/haute = choisis (qChoisi 1) ; net = l'ancienne MOYENNE choisie (qChoisi 1) ; net0 = 'net' jamais choisi ; vieuxnet = 'net' sans le champ qChoisi.
// demarrage : la page chargée jusqu'au menu (+ 4 s après le voile) ; le COMPTEUR des écritures width/height de la toile WebGL (chaque groupe = une (ré)allocation), le réglage.
// jeu : RÉGLAGES (vrais taps : la position déjà prise, la marge du choix, l'autre moitié), une course de --duree s au pilote auto, la PAUSE (vrai tap sur l'autre moitié, à chaud),
//       le piège du gouverneur simulé par imgRegle (chaud → bascule → froid) ; le profil relu (toile, ombre, halo) à chaque pas ; erreurs.
// chaud : le VRAI gouverneur (dbgThermique 2 → bascule en pause → dbgThermique 0, ~130 s d'attente) : le plafond rendu doit être celui du réglage COURANT.
// pc : SANS émulation (ordinateur), sauvegarde --essais "-:neuf;-:haute" : les lectures à comparer champ par champ entre deux jeux (--jeu).
// Une ligne JSON par essai. Chrome est fermé à la fin, quoi qu'il arrive.
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const MODE = A.mode || 'jeu', PC = MODE === 'pc', DUREE = +(A.duree || 20), [W, H] = PC ? [1280, 800] : [844, 390];
const P_HTTP = +(A.http || 9871), P_CDP = +(A.cdp || 9872);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ESSAIS = (A.essais || 'iPhone14,2:neuf').split(';').filter(Boolean).map(s => { const [ap, q, plus] = s.split(':'); return { ap, q: q || 'neuf', plus: (plus || '').split('+').filter(Boolean).join('&') }; });
/* le compteur de la toile : posé AVANT le jeu ; une écriture width/height sur une toile WebGL = three qui (ré)alloue (setSize / setPixelRatio) */
const COMPTEUR = "(function(){try{var P=HTMLCanvasElement.prototype,gc=P.getContext;window.__bancToile={ev:[]};P.getContext=function(t){var r=gc.apply(this,arguments);try{if(r&&/webgl/.test(String(t)))this.__bancGl=1;}catch(e){}return r;};"
  + "['width','height'].forEach(function(k){var d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){try{if(this.__bancGl)window.__bancToile.ev.push([Math.round(performance.now()),k,d.get.call(this),+v]);}catch(e){}return d.set.call(this,v);}});});"
  + "['click','touchend'].forEach(function(t){document.addEventListener(t,function(e){try{var x=e.target;window.__bancCible=(x&&x.tagName?x.tagName.toLowerCase():'?')+(x&&x.className&&typeof x.className==='string'?'.'+x.className.split(' ').join('.'):'')+(x&&x.getAttribute&&x.getAttribute('data-q')?'[data-q='+x.getAttribute('data-q')+']':'');}catch(_){}} ,true);});}catch(e){}})();";
const LIT = "(function(){var o={};try{var p=dbgPrf();o.prf={on:p.on,classe:p.classe,reglage:p.reglage,niveau:p.niveau,niveauMax:p.niveauMax,pc:p.imagePC,fps:p.fps,plafond:p.plafond,toile:p.toile,ombre:p.ombre,halo:p.halo,ql:p.ql,gouv:p.gouverneur,mobP0:p.mobP0,sobres:p.sobres,imgTel:p.imgTel}}catch(e){o.prf='err '+e.message}"
  + "try{var n=dbgNette();o.save={q:n.q,choisi:n.choisi,cap:n.cap}}catch(e){}try{var r=JSON.parse(localStorage.cashcarSave);o.ecrit={q:r.q,qChoisi:r.qChoisi}}catch(e){}"
  + "try{o.regle=imgRegle()}catch(e){}try{var g=dbgGouvPaliers();o.gouv={palier:g.palier,dprCap:g.dprCap,cran:g.cran}}catch(e){}"
  + "try{var R=dbgRubans();o.rubans={p:R.p,net:R.net,larg:R.larg,masque:R.masque,long:R.long}}catch(e){o.rubans='absent'}try{var L=dbgLoupe();o.loupe={ok:L.ok,k:L.k,kq:L.kq,horsDpr:L.horsDpr,dprOn:L.dprOn}}catch(e){}"
  + "try{o.dbgProfil=/profOuvre/.test(String(window.dbgProfil))?'plaque':typeof window.dbgProfil}catch(e){}"
  + "try{var mv=document.getElementById('mvQ');o.mvQ=mv?{txt:mv.textContent,cls:mv.className}:null;}catch(e){}"
  + "try{o.journalProfil=(dbgErreurs()||[]).filter(function(e){return e.g==='profil'}).map(function(e){return String(e.k).slice(0,140)})}catch(e){}return JSON.stringify(o)})()";
/* les lectures de l'ordinateur à comparer entre deux jeux (sans les champs du profil, absents de l'ancien jeu) */
const LIT_PC = "(function(){var o={};try{o.nette=dbgNette()}catch(e){}try{o.img=dbgImg()}catch(e){}try{o.qual=dbgQual()}catch(e){}try{var v=dbgVHD();delete v.journal;delete v.vrai;delete v.bride;o.vhd=v}catch(e){}try{o.regle=imgRegle()}catch(e){}"
  + "try{var r=dbgScene().rdr;o.toile=[r.domElement.width,r.domElement.height,+r.getPixelRatio().toFixed(3)];o.filtre=r.shadowMap.type}catch(e){}try{var L=dbgLoupe();o.loupe={ok:L.ok,k:L.k,horsDpr:L.horsDpr}}catch(e){}"
  + "try{o.dbgProfil=/profOuvre/.test(String(window.dbgProfil))?'plaque':typeof window.dbgProfil}catch(e){}try{var mv=document.getElementById('mvQ');o.mvQ=mv?mv.textContent:null}catch(e){}"
  + "try{o.journalProfil=(dbgErreurs()||[]).filter(function(e){return e.g==='profil'}).length}catch(e){}return JSON.stringify(o)})()";
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  const lit = async () => JSON.parse(await c.ev(LIT));
  /* un VRAI tap (geste tactile de Chrome : touchstart/touchend puis click) au centre d'un élément visible, ou dans sa MARGE (un point où l'élément lui-même est touché, pas un enfant) */
  const tap = async (sel, ou) => {
    const pt = await c.ev(`(function(){var l=document.querySelectorAll(${JSON.stringify(sel)}),e=null;for(var i=0;i<l.length;i++){var b=l[i].getBoundingClientRect();if(b.width>0&&b.height>0&&getComputedStyle(l[i]).visibility!=='hidden'){e=l[i];break;}}if(!e)return null;
      var b=e.getBoundingClientRect(),y=b.top+b.height/2;if(${JSON.stringify(ou || 'centre')}==='centre')return {x:b.left+b.width/2,y:y};
      for(var x=b.left+b.width*.25;x<b.right-b.width*.25;x+=.5){if(document.elementFromPoint(x,y)===e)return {x:x,y:y};}return null})()`);
    if (!pt) return null;
    await c.ev('window.__bancCible=null;1');
    await c.send('Input.synthesizeTapGesture', { x: pt.x, y: pt.y, duration: 60, tapCount: 1, gestureSourceType: 'touch' });
    await dormir(700);
    return { x: +pt.x.toFixed(1), y: +pt.y.toFixed(1), cible: await c.ev('window.__bancCible') };
  };
  const pret = async () => { for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) return true; } catch (e) {} } return false; };
  const voile = async () => { await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500);
    await c.ev("(function(){var p=document.getElementById('prof');if(!p||getComputedStyle(p).display==='none'||!p.getBoundingClientRect().height)return 0;var l=p.querySelectorAll('.pbtn,[role=button]');for(var i=0;i<l.length;i++)if(/RETOUR|BACK/.test(l[i].textContent)){l[i].click();return 1;}return 0})()"); await dormir(800); };
  const enCourse = () => c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()");
  const lance = async () => { let ok = false; for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await enCourse(); } catch (e) {} } if (ok) { try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } return ok; };
  const roule = async s => { const t0 = Date.now(); let morts = 0; while (Date.now() - t0 < s * 1000) { await dormir(2000); try { if (await c.ev('dbgState().gameOver')) { morts++; try { await c.ev('dbgJouer()'); } catch (e) {} await dormir(3000); try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } } catch (e) {} } return morts; };
  const pause = async () => { const t = await tap('#tGear'); await dormir(900); return t; };
  const reprend = async () => { const t = await tap('#tPanel .tp[data-a="close"]'); await dormir(900); return t; };
  const autre = q => q === 'haute' ? 'fast' : 'haute';
  const toile = () => c.ev("JSON.stringify((function(){var g=[],ev=(window.__bancToile||{ev:[]}).ev;for(var i=0;i<ev.length;i++){var e=ev[i],d=g[g.length-1];if(!d||e[0]-d.t>8)g.push(d={t:e[0],w:null,h:null,n:0,change:false});d.n++;d[e[1]==='width'?'w':'h']=e[3];if(e[2]!==e[3])d.change=true;}return g})())");
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!PC) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    } else await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: COMPTEUR });
    let idScript = null;
    for (const E of ESSAIS) {
      exc = []; cons = [];
      const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
      if (E.q === 'fast' || E.q === 'haute' || E.q === 'net') { SAVE.q = E.q; SAVE.qChoisi = 1; } else if (E.q === 'net0') { SAVE.q = 'net'; SAVE.qChoisi = 0; } else if (E.q === 'vieuxnet') SAVE.q = 'net';
      if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' })).identifier;
      const ap = E.ap && E.ap !== '-' ? '&appareil=' + E.ap : '';
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7${ap}` + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      if (!(await pret())) { console.log(JSON.stringify({ essai: E, erreur: 'pas prêt', exc, cons })); continue; }
      await dormir(1500);
      const R = { essai: E, mode: MODE };
      if (PC) { R.charge = JSON.parse(await c.ev(LIT_PC)); await voile(); R.course = await lance(); await roule(DUREE); R.apres = JSON.parse(await c.ev(LIT_PC)); R.exc = exc; R.cons = cons; console.log(JSON.stringify(R)); continue; }
      R.charge = await lit();
      await voile(); await dormir(4000);
      R.toile = JSON.parse(await toile());
      R.menu = await lit();
      if (MODE === 'demarrage') { R.exc = exc; R.cons = cons; console.log(JSON.stringify(R)); continue; }
      const q0 = R.menu.save && R.menu.save.q;
      if (MODE === 'jeu') {
        /* RÉGLAGES : la position déjà prise (rien, pas même qChoisi), la marge du choix (rien), l'autre moitié (à chaud), retour */
        R.reglages = {};
        R.reglages.ouvre = await tap('[data-m="set"]'); await dormir(1200);
        R.reglages.affiche = (await lit()).mvQ;
        R.reglages.memeTap = await tap('#mvQ [data-q="' + q0 + '"]'); R.reglages.meme = (await lit()).save;
        R.reglages.margeTap = await tap('#mvQ', 'marge'); R.reglages.marge = (await lit()).save;
        R.reglages.autreTap = await tap('#mvQ [data-q="' + autre(q0) + '"]'); await dormir(1200); R.reglages.autre = await lit();
        R.reglages.retourTap = await tap('#mvQ [data-q="' + q0 + '"]'); await dormir(1200); R.reglages.retour = await lit();
        await tap('#mSet [data-m="back"]'); await dormir(1200);
      }
      R.course = await lance();
      R.morts = await roule(MODE === 'jeu' ? DUREE / 2 : 4);
      if (MODE === 'jeu') {
        /* PAUSE : vrai tap sur l'autre moitié, à chaud ; reprise ; la course continue */
        R.pause = {};
        R.pause.ouvre = await pause();
        R.pause.avant = await lit();
        R.pause.tap = await tap('#tPanel .tp.ligne[data-a="q"] [data-q="' + autre(q0) + '"]'); await dormir(1200);
        R.pause.apres = await lit();
        R.pause.reprend = await reprend();
        R.morts += await roule(DUREE / 2);
        R.pause.course = await lit();
        /* LE PIÈGE imgRegle('reset') simulé : chaud (plafond 1, halo coupé, ombre 512) → bascule en pause → froid : le plafond rendu doit être celui du réglage COURANT */
        R.piege = {};
        R.piege.chaud = await c.ev("JSON.stringify(imgRegle({dpr:1,halo:'off',ombre:512}))");
        await pause(); R.piege.tap = await tap('#tPanel .tp.ligne[data-a="q"] [data-q="' + q0 + '"]'); await dormir(800); R.piege.pendant = await lit(); await reprend();
        await c.ev("imgRegle('reset');1"); await dormir(1500);
        R.piege.froid = await lit();
      } else if (MODE === 'chaud') {
        R.chaud = {};
        R.chaud.thermo = await c.ev('dbgThermique(2)'); await dormir(4000); R.chaud.chaud = await lit();
        await pause(); R.chaud.tap = await tap('#tPanel .tp.ligne[data-a="q"] [data-q="' + autre(q0) + '"]'); await dormir(800); R.chaud.pendant = await lit(); await reprend();
        await c.ev('dbgThermique(0)');
        const t0 = Date.now(); let pal = 2; while (Date.now() - t0 < 150000 && pal > 0) { await dormir(5000); try { pal = await c.ev('dbgGouvPaliers().palier'); } catch (e) {} if (await c.ev('dbgState().gameOver')) { try { await c.ev('dbgJouer()'); } catch (e) {} await dormir(3000); try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } }
        await dormir(2000); R.chaud.froid = await lit(); R.chaud.attente = Math.round((Date.now() - t0) / 1000);
      }
      try { R.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()"); } catch (e) {}
      R.exc = exc; R.cons = cons;
      console.log(JSON.stringify(R));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
