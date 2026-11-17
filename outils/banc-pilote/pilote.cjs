// LE BANC DU PILOTE DE QUALITÉ (2026-11-17, lot « pilote », copié de outils/banc-doux/doux.cjs). UN Chrome sans fenêtre et muet (sfx/mus/vox coupés dans la sauvegarde),
// iPhone émulé 844×390 DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai, SANS ?tel=1 ; le profil vient de ?appareil=. Les conditions du téléphone sont posées à la main
// (window.__ccThermique / __ccBranche / __ccEco / __ccBatterie avant le chargement, puis dbgPiloteSim / dbgThermique) : des compteurs déterministes, aucune mesure de temps.
//   node outils/banc-pilote/pilote.cjs --mode etat|depart|scenario|refroidit|rouge|cad|memoire|portail|gels|urgence|chance|hyst|leve [--essais "tag:iPhone14,2:q:plus:cond;…"] [--q "sans=pilote"] [--jeu <dossier>] [--s 60]
//   cond = t1+B1+E1+bat50 (thermique, branché, économie, batterie) ; q = fast|haute|auto (auto : jamais choisi)
// etat      : une course, le relevé complet (dbgGouvPaliers, dbgNette, imgRegle, dbgPrf, cadence) à nominal, fair, serious, branché, critical — pour comparer ?sans=pilote à la branche d'avant (--jeu).
// depart    : le niveau et le cran posés au chargement (menu) puis au départ de la course, selon les conditions.
// scenario  : branché + économie, thermique 0 → 1 → 2 → 3 (une course de --s secondes par état, un portail au milieu, une mort à la fin) : crans, moments, toiles refaites, cadence.
// refroidit : critical puis serious, fair, nominal (une course par état) : le cran doit remonter.
// portail   : un VRAI portail (dbgPortail + pilote auto) : un seul paiement par passage · gels : gels hors boucle (K tient) puis vraie charge (K descend)
// urgence   : ROUGE tenu / critical en course : la résolution payée une fois en course · chance : la seconde chance ne change rien, la mort définitive paie · hyst : fair↔serious
// rouge     : des images ratées simulées (dbgPiloteSim rates) puis une marge (vrai bas) : crans [C] en course, dette au portail et à la mort, bleu.
// (3e tour, 17/11)
// borne     : S3, les leviers posés au départ (3 s de course) dans les 16 conditions B×E×T (bat 80) ; --part 0..3 (4 conditions par passage) ; à lancer avec et sans --q sans=pilote,
//             puis node outils/banc-pilote/borne-table.cjs <pilote.jsonl> <base.jsonl> (le tableau, levier par levier)
// cycle     : S1, 8 lancements (stockage gardé) (@modèle, condition de --essais) ; --n2 rate (N2 simulé ROUGE) | orange (3,3 % de ratés) | tient (N2 en marge) : un seul essai N2 / N2 gardé
// remonte   : (4e tour) courses courtes (--s 20) sans rechargement, K2 posé : la marge BLEU se cumule, K revient à 0
// critgel   : (4e tour) critical, 0 raté, 3 gels/s, vrai 8 ms, --s s : nUrg 0, aucune toile refaite en course
// gelchaud  : S2, gels simulés (dbgPiloteSim gels) : ni BLEU ni remontée ; gels soutenus à serious = ORANGE (dette)
// spin      : M4, un jeton de machine à sous : la mort ne paie pas tant que la machine peut venir ; sans jeton, la mort paie après 1,5 s
// compteurs : M5, à lancer avec --q sans=pilote (ou --pc 1 : sans émulation du téléphone) : aucun compteur du pilote ne bouge
// Une ligne JSON par essai. Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const MODE = A.mode || 'depart', [W, H] = [844, 390], P_HTTP = +(A.http || 9981), P_CDP = +(A.cdp || 9982), SEC = +(A.s || 60);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const BORNE16 = (function () { const r = []; for (const B of [0, 1]) for (const E of [0, 1]) for (let t = 0; t <= 3; t++) r.push(`B${B}E${E}T${t}:iPhone14,2:auto::t${t}+B${B}+E${E}+bat80`); return r; })();
const PART = A.part != null ? BORNE16.slice(+A.part * 4, +A.part * 4 + 4) : BORNE16;
const ESSAIS = (A.essais || (MODE === 'borne' ? PART.join(';') : MODE === 'cycle' ? 'cycle:@iPhone14,2:auto::t0+B1+E0+bat80' : 'froid:iPhone14,2:auto::t0+B0+E0+bat80')).split(';').filter(Boolean).map(s => { const [tag, ap, q, plus, cond] = s.split(':'); return { tag, ap, q: q || 'auto', plus: (plus || '').split('+').filter(Boolean).join('&'), cond: cond || '' }; });
const COMPTEUR = "(function(){try{var P=HTMLCanvasElement.prototype,gc=P.getContext;window.__bancToile={ev:[]};P.getContext=function(t){var r=gc.apply(this,arguments);try{if(r&&/webgl/.test(String(t)))this.__bancGl=1;}catch(e){}return r;};"
  + "['width','height'].forEach(function(k){var d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){try{if(this.__bancGl&&d.get.call(this)!==+v)window.__bancToile.ev.push([Math.round(performance.now()),k,d.get.call(this),+v,(function(){try{if(window.dbgPiloteOu)return dbgPiloteOu();var s=dbgState();return !s.started?'menu':s.gameOver?'mort':'course'}catch(e){return '?'}})(),this.id||this.className||'?']);}catch(e){}return d.set.call(this,v);}});});}catch(e){}})();";
const ETAT = `(function(){var o={};try{o.gouv=dbgGouvPaliers();delete o.gouv.lourd;}catch(e){o.gouvErr=String(e.message)}try{o.nette=dbgNette();}catch(e){}try{o.img=imgRegle();}catch(e){}
  try{var p=dbgPrf();o.prf={niveau:p.niveau,reglage:p.reglage,fps:p.fps,plafond:p.plafond,toile:p.toile,ombre:p.ombre,halo:p.halo,ql:p.ql}}catch(e){}try{var c=dbgCadence();o.cad={on:c.on,gel:c.gel}}catch(e){}
  try{o.cadPer=dbgPilote?dbgPilote().cadPer:null}catch(e){}return JSON.stringify(o)})()`;
const LEV = `(function(){try{var i=imgRegle(),g=dbgGouvPaliers(),p=dbgPilote(),f=dbgPrf();return JSON.stringify({n:f.niveau,dpr:i.dpr,cap:i.cap,halo:i.halo,mips:i.mips,ombre:i.ombre,ciel:i.ciel,stries:i.stries,ql:i.ql,qlMin:g.qlMin,ventK:g.ventK,emiK:g.emiK,palier:g.palier,cadPer:p.cadPer,pil:p.on,K:p.K,vise:p.vise,borne:p.borne,src:p.src,cle:p.cle})}catch(e){return JSON.stringify({err:String(e.message)})}})()`;
const PIL = `(function(){try{var p=dbgPilote();return JSON.stringify({on:p.on,K:p.K,vise:p.vise,niveau:p.niveau,plafond:p.plafond,capN:p.capN,gels:p.gels,urgence:p.urgence,portails:p.portails,departs:p.departs,cand:p.cand,mort:p.mort,mortP:p.mortP,auto:p.auto,src:p.src,cle:p.cle,table:p.table,zone:p.zone,per:p.per,tic:p.tic,cadPer:p.cadPer,retailles:p.retailles,dettes:p.dettes,img:p.img,qlMin:p.qlMin,poly:p.poly,histo:p.histo,chg:p.changements,mur:p.mur,geleux:p.geleux,glS:p.glS,constructions:p.constructions,nBorne:p.nBorne,jeton:p.jeton,src2:p.src,nEchec:p.nEchec})}catch(e){return JSON.stringify({err:String(e.message)})}})()`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  let exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  const ev = async (x, t) => { try { return await c.ev(x, t); } catch (e) { return null; } };
  const pil = async () => { const s = await ev(PIL); try { return JSON.parse(s); } catch (e) { return { err: String(s) }; } };
  const pret = async () => { for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) return true; } catch (e) {} } return false; };
  const voile = async () => { await ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500); };
  const enCourse = async () => !!(await ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"));
  const lance = async () => { let ok = false; for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) await ev('dbgJouer()'); await dormir(500); ok = await enCourse(); } if (ok) await ev('dbgAuto(1,0,{nit:1});1'); return ok; };
  const mort = async () => { if (MODE !== 'spin') await ev('dbgSpin(0);1'); /* (M4) un jeton de la série retiendrait la mort jusqu'à la machine à sous : hors du mode spin, aucun jeton */ await ev("dbgJuge('fin')"); await dormir(2500); for (let i = 0; i < 20; i++) { if (await ev('!dbgPilote().on||dbgPilote().mortP')) break; await dormir(500); } }; /* (corrections) la mort paie quand l'offre de seconde chance est close */
  /* une course tenue s secondes : relancée si elle meurt (le pilote auto peut tomber) ; un portail au milieu si demandé ; relevé toutes les 5 s */
  const tient = async (s, tag, portail, suivi) => { const t0 = Date.now(); let p = false, morts = 0;
    while (Date.now() - t0 < s * 1000) { await dormir(1000);
      if (!(await enCourse())) { if (await ev('dbgState().gameOver')) { morts++; await ev('dbgJouer()'); await dormir(3000); await ev('dbgAuto(1,0,{nit:1});1'); } }
      const e = Math.round((Date.now() - t0) / 1000);
      if (portail && !p && e >= s / 2) { p = true; const r = await ev("JSON.stringify(dbgSaut())"); suivi.push({ ph: tag, t: e, portail: r ? String(r).slice(0, 60) : null }); }
      if (e % 5 === 0) { const o = await pil(); suivi.push({ ph: tag, t: e, K: o.K, vise: o.vise, n: o.niveau, zone: o.zone, dpr: o.img && o.img.dpr, cadPer: o.cadPer }); } }
    return morts; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (A.pc !== '1') { /* --pc 1 : l'ordinateur (aucune émulation du téléphone) */
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: COMPTEUR });
    let idScript = null;
    for (const E of ESSAIS) {
      exc = []; cons = [];
      const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
      if (E.q !== 'auto') { SAVE.q = E.q; SAVE.qChoisi = 1; }
      const C = {}; for (const x of E.cond.split('+').filter(Boolean)) { const m = /^([a-zA-Z]+)(-?\d+)$/.exec(x); if (m) C[m[1]] = +m[2]; }
      const nat = E.ap.startsWith('@'), ap = E.ap.replace(/^@/, ''); /* @iPhone14,2 : le modèle posé comme le ferait l'app (window.__ccAppareil), sans ?appareil= (la mémoire du pilote ne s'écrit pas sous ?appareil=) */
      let pose = 'try{if(window.name!=="banc-garde"){localStorage.clear();sessionStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}}catch(e){}window.name="";';
      if (nat) pose += `window.__ccAppareil=${JSON.stringify(ap)};`;
      if (C.t != null) pose += `window.__ccThermique=${C.t};`; if (C.B != null) pose += `window.__ccBranche=${C.B ? 2 : 1};`; if (C.E != null) pose += `window.__ccEco=${C.E};`; if (C.bat != null) pose += `window.__ccBatterie=${C.bat};`;
      if (idScript) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: idScript });
      idScript = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: pose })).identifier;
      await c.send('Page.navigate', { url: 'about:blank' }); await dormir(400);
      const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7${nat || A.pc === '1' ? '' : '&appareil=' + ap}` + (E.plus ? '&' + E.plus : '') + (A.q ? '&' + A.q : '');
      await c.send('Page.navigate', { url });
      const R = { essai: E, mode: MODE, q: A.q || '', jeu: A.jeu ? path.basename(JEU) : 'branche' };
      if (!(await pret())) { R.erreur = 'pas prêt'; R.exc = exc; console.log(JSON.stringify(R)); continue; }
      await dormir(1500); await voile();
      if (MODE === 'depart') { await dormir(2500); R.menu = await pil(); R.menuEtat = JSON.parse(await ev(ETAT)); }
      R.course = await lance();
      if (!R.course) { R.erreur = 'course pas lancée'; R.exc = exc; console.log(JSON.stringify(R)); continue; }
      const suivi = [];
      if (MODE === 'etat') {
        R.etats = {}; const lit = async () => JSON.parse(await ev(ETAT));
        await tient(6, 'n', false, suivi); R.etats.nominal = await lit();
        await ev('dbgThermique(1)'); await tient(3, 'f', false, suivi); R.etats.fair = await lit();
        await ev('dbgThermique(2)'); await tient(3, 's', false, suivi); R.etats.serious = await lit();
        await ev('window.__ccBranche=2;1'); await tient(3, 'b', false, suivi); R.etats.branche = await lit();
        await ev('dbgThermique(3)'); await tient(3, 'c', false, suivi); R.etats.critical = await lit();
      } else if (MODE === 'depart') {
        await dormir(4000); R.depart = await pil(); R.departEtat = JSON.parse(await ev(ETAT));
        await tient(SEC, 'course', false, suivi); R.fin = await pil();
      } else if (MODE === 'scenario' || MODE === 'refroidit') {
        const T = MODE === 'scenario' ? [0, 1, 2, 3] : [3, 2, 1, 0]; R.phases = [];
        await ev('window.__bancToile.ev.length=0;1');
        for (let i = 0; i < T.length; i++) { const t = T[i];
          await ev(`dbgPiloteSim({t:${t}});1`); const a = await pil();
          const m = await tient(SEC, 't' + t, true, suivi); const b = await pil();
          R.phases.push({ t, entree: { K: a.K, vise: a.vise, n: a.niveau }, avantMort: { K: b.K, vise: b.vise, n: b.niveau, zone: b.zone, cadPer: b.cadPer, dpr: b.img && b.img.dpr }, mortsAuto: m });
          await mort(); const d = await pil(); R.phases[i].apresMort = { K: d.K, vise: d.vise, n: d.niveau, dpr: d.img && d.img.dpr };
          await lance(); await dormir(2000); const e = await pil(); R.phases[i].depart = { K: e.K, vise: e.vise, n: e.niveau, dpr: e.img && e.img.dpr }; }
        R.fin = await pil();
        R.toile = JSON.parse(await ev("JSON.stringify((window.__bancToile||{ev:[]}).ev)"));
      } else if (MODE === 'cad') {
        /* la cadence à critical : rAF à 60 (eM 16,7) → 50 ms, 3 tics ; rAF à 30 (eM 33) → 33 ms, régulier ; et l'écart des images calculées mesuré au banc (rAF de Chrome à 60) */
        const mes = async () => JSON.parse(await ev("new Promise(function(r){var a=[],t0=0,n=0;function f(t){if(t0)a.push(t-t0);t0=t;if(++n<90)requestAnimationFrame(f);else{var c=dbgCadence();r(JSON.stringify({cadPer:dbgPilote().cadPer,on:c.on}))}}requestAnimationFrame(f)})", 20000));
        R.cad = {};
        await ev('dbgPiloteSim({t:3,E:0,eM:16.7});1'); await tient(4, 'c60', false, suivi); R.cad.rAF60 = await mes();
        await ev('dbgPiloteSim({eM:33.3});1'); await tient(3, 'c30', false, suivi); R.cad.rAF30 = await mes();
        await ev('dbgPiloteSim({eM:null,E:1});1'); await tient(3, 'ceco', false, suivi); R.cad.eco = await mes();
        await ev('dbgPiloteSim({t:2,E:0});1'); await tient(3, 's', false, suivi); R.cad.serious = await mes();
      } else if (MODE === 'memoire') {
        /* trois courses dans la condition de Sacha (serious, branché, économie) avec des images ratées : la mort écrit la mémoire ; rechargement (stockage gardé) ; la 4e part de la mémoire ; une course à 15 % de batterie n'écrit rien */
        R.courses = [];
        const recharge = async () => { await ev('window.name="banc-garde";1'); await c.send('Page.reload', {}); await dormir(1000); if (!(await pret())) return false; await dormir(1500); await voile(); return lance(); };
        for (let i = 0; i < 4; i++) {
          if (i) { if (!(await recharge())) { R.erreur = 'rechargement ' + i; break; } }
          await dormir(2500); const d = await pil();
          if (i < 3) { await ev('dbgPiloteSim({t:2,B:1,E:1,bat:60,rates:.12});1'); await tient(SEC, 'c' + i, false, suivi); await ev('dbgPiloteSim({rates:0});1'); }
          const f = await pil(); await mort(); await dormir(1500);
          R.courses.push({ i, depart: { K: d.K, src: d.src, cle: d.cle }, fin: { K: f.K, vise: f.vise }, memoire: JSON.parse(await ev("localStorage.getItem('cashcarPilote')")) });
        }
        await ev('dbgPiloteSim({t:2,B:1,E:1,bat:15,rates:.3});1'); await lance(); await tient(SEC, 'bat15', false, suivi); await mort(); await dormir(1500);
        R.bat15 = JSON.parse(await ev("localStorage.getItem('cashcarPilote')"));
      } else if (MODE === 'portail') {
        /* (corrections, DOUBLE PORTAIL) un VRAI portail : dbgPortail(d) pose la caisse d m avant l'ovule, le pilote auto le franchit (portailPasse puis newTrack) ; K4 posé, visé K2 : un seul cran de mieux par passage */
        R.passages = [];
        await tient(6, 'calme', false, suivi);
        for (let i = 0; i < 2; i++) {
          if (!(await enCourse())) await lance();
          if (i === 0) { await ev('dbgPiloteSim({K:4,Kv:2});1'); await dormir(1500); }
          const a = JSON.parse(await ev("JSON.stringify(dbgPilote())")); const z0 = await ev('dbgState().zone');
          const r = await ev("JSON.stringify(dbgPortail(" + (A.d || 150) + "))");
          let b = null; for (let j = 0; j < 60; j++) { await dormir(500); const p = JSON.parse(await ev("JSON.stringify(dbgPilote().portails)")); if (p && p.payes > a.portails.payes) { await dormir(2500); b = JSON.parse(await ev("JSON.stringify(dbgPilote())")); break; } if (!(await enCourse())) break; }
          R.passages.push({ i, pose: r, avant: { K: a.K, vise: a.vise, portails: a.portails }, apres: b ? { K: b.K, vise: b.vise, portails: b.portails, constructions: b.constructions } : 'pas de passage', zone: [z0, await ev('dbgState().zone')] });
          await dormir(3000);
        }
        /* (M1) dbgSaut : une piste refaite sans portail = un moment ; resetGame (mort puis nouvelle course) : sa piste ne paie rien */
        { const a = JSON.parse(await ev("JSON.stringify(dbgPilote().portails)")); await ev('dbgSaut();1'); await dormir(3000); R.saut = { avant: a, apres: JSON.parse(await ev("JSON.stringify(dbgPilote().portails)")) }; }
        { await mort(); const a = JSON.parse(await ev("JSON.stringify(dbgPilote().portails)")); await lance(); await dormir(3000); R.reset = { avant: a, apres: JSON.parse(await ev("JSON.stringify(dbgPilote().portails)")) }; }
      } else if (MODE === 'gels') {
        /* (corrections, GELS ≠ CHARGE) 1) des gels HORS BOUCLE : un setInterval qui tient le fil 120 ms toutes les 350 ms (le rAF n'est pas livré, la boucle reste légère) → K ne bouge pas ;
           2) une VRAIE charge : renderer.render tient le fil 60 ms une fois par image → K descend. A-B : &sans=pilgels (tout tic raté = charge, comme avant) */
        await tient(10, 'calme', false, suivi); R.calme = await pil();
        await ev("window.__bancGel=setInterval(function(){var t=performance.now();while(performance.now()-t<" + (A.gel || 120) + ");}," + (A.tous || 350) + ");1");
        await tient(+(A.sg || 30), 'gels', false, suivi); R.gels = JSON.parse(await ev("JSON.stringify(dbgPilote())"));
        await ev('clearInterval(window.__bancGel);1'); await tient(5, 'repos', false, suivi);
        await ev("(function(){var r=dbgScene().rdr,o=r.render;window.__bancRo=o;r.render=function(){if(window.__bancF!==window.__imagesJeu){window.__bancF=window.__imagesJeu;var t=performance.now();while(performance.now()-t<" + (A.ch || 60) + ");}return o.apply(this,arguments);};return 1})()");
        await tient(+(A.sc || 30), 'charge', false, suivi); R.charge = JSON.parse(await ev("JSON.stringify(dbgPilote())"));
        await ev("(function(){dbgScene().rdr.render=window.__bancRo;return 1})()");
        for (const k of ['calme', 'gels', 'charge']) { const o = R[k]; R[k] = { K: o.K, vise: o.vise, zone: o.zone, gels: o.gels, trous: o.trous, wDer: o.wDer, rates10: o.rates10, vrai: o.vrai, per: o.per, tic: o.tic }; }
      } else if (MODE === 'remonte') {
        /* (4e tour, 2) un N1/N2 qui tient remonte vers K0 avec des courses COURTES (--s, < 30 s) : la marge BLEU se cumule d'une course à l'autre dans la séance (aucun rechargement) ; K2 posé à la 1re */
        R.courses = [];
        for (let i = 0; i < +(A.n || 8); i++) {
          if (i) { if (!(await lance())) { R.erreur = 'relance ' + i; break; } }
          await dormir(1500); const d = await pil();
          await ev('dbgPiloteSim({vrai:8,rates:0,gels:0' + (i === 0 ? ',K:2,Kv:2' : '') + '});1');
          await tient(SEC, 'c' + i, false, suivi); const f = JSON.parse(await ev("JSON.stringify(dbgPilote())")); await mort(); await dormir(1000); const g = await pil();
          R.courses.push({ i, depart: 'N' + d.niveau + ' K' + d.K, src: d.src, fin: 'N' + f.niveau + ' K' + f.K + ' visé ' + f.vise + ' ' + f.zone + ' bleu ' + f.bleu, apresMort: 'N' + g.niveau + ' K' + g.K });
        }
        R.departs = R.courses.map(x => x.depart).join(',');
      } else if (MODE === 'critgel') {
        /* (4e tour, 1) critical, AUCUN raté, 3 gels / s, vrai 8 ms, --s s : l'urgence ne s'arme pas, aucune toile refaite en course (les gels restent une dette payée au moment invisible) */
        await tient(6, 'calme', false, suivi); await ev('window.__bancToile.ev.length=0;1');
        await ev('dbgPiloteSim({t:3,rates:0,gels:3,vrai:8});1'); await tient(SEC, 'critgel', false, suivi);
        const p = JSON.parse(await ev("JSON.stringify(dbgPilote())"));
        R.fin = { K: p.K, vise: p.vise, niveau: p.niveau, zone: p.zone, geleux: p.geleux, glS: p.glS, urgence: p.urgence, nUrg: p.nUrg, retailles: p.retailles, dpr: p.img && p.img.dpr };
        R.toile = JSON.parse(await ev("JSON.stringify((window.__bancToile||{ev:[]}).ev)"));
        R.toileEnCourse = R.toile.filter(e => e[4] === 'course' || e[4] === 'depart' || e[4] === 'urgence').length;
      } else if (MODE === 'urgence') {
        /* (corrections, URGENCE) 1) ROUGE simulé tenu : K0→6 par crans [C], puis 8 s de ROUGE → la résolution se paie EN COURSE une fois ; 2) critical en course (essai à part : --crit 1) */
        await ev('window.__bancToile.ev.length=0;1');
        await tient(6, 'calme', false, suivi);
        if (A.crit === '1') { await ev('dbgPiloteSim({t:3,rates:0,gels:0,vrai:8});1'); await tient(SEC, 'critical', false, suivi); R.sansRates = JSON.parse(await ev("JSON.stringify((function(p){return {K:p.K,vise:p.vise,zone:p.zone,nUrg:p.nUrg,urgence:p.urgence}})(dbgPilote()))"));
          await ev('dbgPiloteSim({rates:.04});1'); await tient(25, 'critical-orange', false, suivi); }
        else { await ev('dbgPiloteSim({rates:.15});1'); await tient(SEC, 'rouge', false, suivi); }
        R.fin = JSON.parse(await ev("JSON.stringify(dbgPilote())")); R.fin = { K: R.fin.K, vise: R.fin.vise, niveau: R.fin.niveau, capN: R.fin.capN, urgence: R.fin.urgence, nUrg: R.fin.nUrg, retailles: R.fin.retailles, dpr: R.fin.img && R.fin.img.dpr };
        R.toile = JSON.parse(await ev("JSON.stringify((window.__bancToile||{ev:[]}).ev)"));
      } else if (MODE === 'chance') {
        /* (corrections, SECONDE CHANCE) une dette posée (visé K+3), un bon de réanimation : la mort ne change ni niveau ni cran, la reprise remet PILO.mort à faux ; la mort suivante (définitive) paie et apprend */
        await tient(6, 'calme', false, suivi);
        await ev("dbgChance('t',40);dbgChance('$',2000);dbgChance('bon',1);dbgPiloteSim({K:2,Kv:9});1"); await dormir(1500);
        R.avant = await pil();
        await ev("dbgChance('mort')"); const mo = []; let rep = false;
        for (let j = 0; j < 40; j++) { await dormir(500); const o = JSON.parse(await ev("JSON.stringify({p:dbgPilote(),c:dbgChance()})")); mo.push({ t: j / 2, K: o.p.K, n: o.p.niveau, mort: o.p.mort, mortP: o.p.mortP, go: o.c.gameOver, auto: o.c.auto }); if (j > 4 && !o.c.gameOver) { rep = true; break; } }
        R.pendantMort = mo; R.repris = rep; await dormir(2000); R.apresReprise = await pil();
        await dormir(3000); await ev("dbgChance('mort')"); await dormir(4000); if (!(await ev('dbgState().gameOver'))) await ev("dbgJuge('fin')"); for (let j = 0; j < 30; j++) { await dormir(500); if (await ev('dbgPilote().mortP')) break; }
        await dormir(1000); R.mortDefinitive = JSON.parse(await ev("JSON.stringify(dbgPilote())")); R.mortDefinitive = { journalMort: R.mortDefinitive.journal.filter(x => /mort|mémoire/.test(x)), K: R.mortDefinitive.K, niveau: R.mortDefinitive.niveau, mort: R.mortDefinitive.mort, mortP: R.mortDefinitive.mortP, chance: await ev("JSON.stringify(dbgChance())") };
      } else if (MODE === 'hyst') {
        /* (corrections, ANTI-POMPAGE) serious puis fair↔serious toutes les 20 s : le visé ne remonte pas ; fair tenu 65 s : il remonte */
        await ev('dbgPiloteSim({t:2});1'); await tient(10, 's', false, suivi); R.serious = await pil();
        for (let i = 0; i < 4; i++) { await ev(`dbgPiloteSim({t:${i % 2 ? 2 : 1}});1`); await tient(20, 'osc' + i, false, suivi); }
        R.oscille = await pil();
        await ev('dbgPiloteSim({t:1});1'); await tient(70, 'fair', false, suivi); R.fair = await pil();
      } else if (MODE === 'leve') {
        /* (corrections, TABLE DE DÉPART) la montée vers N2 ne vient que de la mémoire : 2 courses de suite à N1 K0 sans ORANGE ni ROUGE (≥ 30 s) dans la condition → la 3e part N2 K3. Essai en @modèle (mémoire écrite). */
        R.courses = [];
        const recharge = async () => { await ev('window.name="banc-garde";1'); await c.send('Page.reload', {}); await dormir(1000); if (!(await pret())) return false; await dormir(1500); await voile(); return lance(); };
        for (let i = 0; i < 3; i++) {
          if (i) { if (!(await recharge())) { R.erreur = 'rechargement ' + i; break; } }
          await dormir(2500); const d = await pil();
          if (i < 2) { await ev('dbgPiloteSim({vrai:8});1'); await tient(SEC, 'c' + i, false, suivi); }
          const f = await pil(); await mort(); await dormir(1500);
          R.courses.push({ i, depart: { N: d.niveau, K: d.K, capN: d.capN, src: d.src }, fin: { K: f.K, vise: f.vise, zone: f.zone }, memoire: JSON.parse(await ev("localStorage.getItem('cashcarPilote')")) });
        }
      } else if (MODE === 'borne') {
        /* (S3) les leviers 3 s après le départ (avant que l'échelle de la base ne mesure quoi que ce soit) */
        await dormir(3000); R.lev = JSON.parse(await ev(LEV));
      } else if (MODE === 'cycle') {
        /* (S1) 8 lancements dans la même condition (stockage gardé). Course N1 : marge simulée (vrai 8 ms, 0 raté, 0 gel). Course N2 : --n2 rate → ROUGE simulé (15 % de ratés) ; tient → marge. */
        R.courses = []; R.n2 = A.n2 || 'rate';
        const recharge = async () => { await ev('window.name="banc-garde";1'); await c.send('Page.reload', {}); await dormir(1000); if (!(await pret())) return false; await dormir(1500); await voile(); return lance(); };
        for (let i = 0; i < +(A.n || 8); i++) {
          if (i) { if (!(await recharge())) { R.erreur = 'rechargement ' + i; break; } }
          await dormir(2500); const d = await pil(); const n2 = d.niveau >= 2;
          await ev(n2 && R.n2 === 'rate' ? 'dbgPiloteSim({rates:.15,gels:0});1' : n2 && R.n2 === 'orange' ? 'dbgPiloteSim({rates:.033,gels:0,vrai:8});1' : 'dbgPiloteSim({vrai:8,rates:0,gels:0});1');
          await tient(SEC, 'c' + i, false, suivi); const f = await pil(); await mort(); await dormir(1500);
          const m = JSON.parse(await ev("localStorage.getItem('cashcarPilote')")); const e = m && m.K ? m.K[Object.keys(m.K)[0]] : null;
          R.courses.push({ i, depart: 'N' + d.niveau + ' K' + d.K, src: d.src, fin: 'N' + f.niveau + ' K' + f.K + ' ' + f.zone + (f.urgence ? ' urg' : ''), mem: e ? { k: e.k, n: e.n, k2: e.k2, n2: e.n2, murJ: e.mur2 ? +((e.mur2 - Date.now()) / 864e5).toFixed(1) : 0 } : null, echec: await ev('dbgPilote().nEchec') });
        }
        R.departs = R.courses.map(x => x.depart.split(' ')[0]).join(',');
      } else if (MODE === 'gelchaud') {
        /* (S2) 1) nominal, marge (vrai 8, 0 raté) MAIS 3 gels / s : ni BLEU ; K4 posé, visé K2 : une piste refaite (dbgSaut) ne remonte rien ; 2) serious + gels soutenus : ORANGE (dette) ; 3) plus de gels : la fenêtre se vide */
        await tient(6, 'calme', false, suivi);
        await ev('dbgPiloteSim({vrai:8,rates:0,gels:3,K:4,Kv:2});1'); await tient(15, 'gels', false, suivi); R.gels = await pil();
        await ev('dbgSaut();1'); await dormir(3000); R.apresSaut = await pil();
        await ev('dbgPiloteSim({t:2});1'); await tient(25, 'chaud', false, suivi); R.chaud = await pil();
        await ev('dbgPiloteSim({gels:0});1'); await tient(15, 'sans', false, suivi); R.sansGels = await pil();
        for (const k of ['gels', 'apresSaut', 'chaud', 'sansGels']) { const o = R[k]; R[k] = { K: o.K, vise: o.vise, zone: o.zone, geleux: o.geleux, glS: o.glS }; }
      } else if (MODE === 'spin') {
        /* (M4) 1) un jeton de machine à sous, une dette (K2, visé K9) : la mort ne paie pas tant que la machine peut venir, ni pendant qu'elle est ouverte ; 2) sans jeton : la mort paie après 1,5 s */
        const suit = async (n) => { const a = []; for (let j = 0; j < n; j++) { await dormir(500); const o = JSON.parse(await ev("JSON.stringify({p:dbgPilote(),s:dbgSpin(),go:dbgState().gameOver})")); a.push([j / 2, o.p.K, o.p.mortP ? 'payé' : '-', o.s.ouvert ? 'machine' : '', o.s.jetons].join(' ')); } return a; };
        await tient(6, 'calme', false, suivi);
        await ev("dbgSpin(1);dbgPiloteSim({K:2,Kv:9});1"); await dormir(1500); await ev("dbgChance('mort')"); R.avecJeton = await suit(20);
        await ev('dbgJouer()'); await dormir(3000); if (!(await enCourse())) await lance(); await ev('dbgAuto(1,0,{nit:1});1'); await dormir(4000);
        await ev("dbgSpin(0);dbgPiloteSim({K:2,Kv:9});1"); await dormir(1500); await ev("dbgChance('mort')"); R.sansJeton = await suit(10);
      } else if (MODE === 'compteurs') {
        /* (M5) sous ?sans=pilote ou sur ordinateur : une course, une piste refaite, une mort : tous les compteurs du pilote restent à zéro */
        await tient(15, 'course', false, suivi); await ev('dbgSaut();1'); await dormir(3000); await mort();
        const p = JSON.parse(await ev("JSON.stringify(dbgPilote())"));
        R.compteurs = { on: p.on, K: p.K, retailles: p.retailles, halo: p.halo, ombresNeuves: p.ombresNeuves, gels: p.gels, trous: p.trous, wDer: p.wDer, constructions: p.constructions, portails: p.portails, departs: p.departs, changements: p.changements, histo: p.histo.reduce((a, b) => a + b, 0), journal: p.journal.length, nBorne: p.nBorne, nUrg: p.nUrg };
      } else if (MODE === 'rouge') {
        await ev('window.__bancToile.ev.length=0;1');
        await tient(8, 'calme', false, suivi);
        await ev('dbgPiloteSim({rates:.15});1'); await tient(30, 'rouge', false, suivi); R.rouge = await pil();
        await ev('dbgSaut();1'); await dormir(2500); R.apresPortail = await pil();
        await tient(15, 'rouge2', false, suivi);
        await mort(); R.apresMort = await pil(); await ev('dbgPiloteSim({rates:0,vrai:8});1'); await lance(); await dormir(2000); R.depart2 = await pil();
        await tient(SEC + 10, 'bleu', false, suivi); R.bleu = await pil();
        await mort(); R.apresMort2 = await pil();
        R.toile = JSON.parse(await ev("JSON.stringify((window.__bancToile||{ev:[]}).ev)"));
      }
      R.suivi = suivi;
      try { R.toiles = JSON.parse(await ev("JSON.stringify([].slice.call(document.querySelectorAll('canvas')).map(function(c){var r=null;try{r=dbgScene().rdr.domElement===c}catch(e){}return [c.id,String(c.className),c.width,c.height,!!c.__bancGl,r,c.parentNode&&c.parentNode.id]}))")); } catch (e) {}
      try { R.journal = JSON.parse(await ev("JSON.stringify(dbgErreurs().filter(function(e){return e.g==='pilote'}).map(function(e){return e.m+(e.n>1?' ×'+e.n:'')}))")); } catch (e) {}
      try { R.pannes = JSON.parse(await ev("JSON.stringify(dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','energie','pilote','radio'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,120)}))")); } catch (e) {}
      R.exc = exc; R.cons = cons;
      console.log(JSON.stringify(R));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
