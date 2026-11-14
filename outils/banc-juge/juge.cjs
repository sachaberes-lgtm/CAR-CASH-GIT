// LE BANC DE LA CADENCE ET DU JUGE DU PROFIL (2026-11-14, chantier QUALITÉ PAR APPAREIL, lot 4). UN Chrome sans fenêtre et muet, téléphone émulé
// (844×390 DPR 3, tactile, hover:none, UA iPhone → TEL_NATIF vrai ; JAMAIS ?tel=1), une MÊME mémoire (localStorage) d'un pas à l'autre.
//   node outils/banc-juge/juge.cjs --pas "<pas>;<pas>;…" [--jeu "VERSION PRINCIPALE"] [--http 9871] [--cdp 9872] [--q "x=1"]
// Pas :
//   neuf                         efface localStorage (puis la sauvegarde muette est reposée à chaque chargement)
//   charge:<appareil>:<q>[:a=1+b=2]  charge le jeu (q = fast|haute|neuf), attend qu'il soit prêt
//   course:<s>                   lance une course (pilote auto), la joue s secondes (relance si mort), puis la finit (dbgJuge('fin')) et lit le juge
//   thermo:<n0,n1,…>:<s>         en course : pose chaque état thermique (dbgThermique), attend s secondes, lit gouverneur / image / cadence
//   crash                        en course depuis 3 s : tue la page (Page.crash, sans pagehide), rouvre un onglet neuf
//   ctx                          perd le contexte 3D (WEBGL_lose_context)
//   quitte:<ev>[:crash|reprise]  (2026-11-14, lot juge) en course depuis 4 s : envoie <ev> (ccInactif | ccSortieSon | pause = Capacitor | pagehide | pausejeu = le bouton pause),
//                                lit le témoin ; puis « crash » tue la page (l'appel entrant / l'app fermée) ou « reprise » rend la main (ccActif) et reprend la course
//   ctxcourse:<s>[:retour]       lance une course, perd le contexte 3D au bout de s secondes (« retour » : juste après un ccActif), attend le rechargement du jeu, lit
//   lance:<s>                    lance une course et la laisse tourner (s secondes d'attente)
//   fige                         copie de cashcarProfil (pour un témoin) ; cmp : la compare à l'actuelle
//   vieillir:<jours>             recule la fin du mur, la date du compteur de courses lentes (lT) et celle de cashcarProfil de n jours
//   lit                          lit dbgJuge, dbgPrf (ou les crochets du jeu d'avant), cashcarProfil, les lignes « profil » de la boîte noire
//   ev:<expression>              évalue une expression (résultat dans la sortie)
// Une ligne JSON par pas.
const path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const [W, H] = [844, 390], P_HTTP = +(A.http || 9871), P_CDP = +(A.cdp || 9872);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const PAS = (A.pas || 'lit').split(';').filter(Boolean);
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const LIT = "(function(){var o={};try{o.juge=window.dbgJuge?dbgJuge():null}catch(e){o.juge='err '+e.message}try{var p=window.dbgPrf?dbgPrf():null;o.profil=p&&{classe:p.classe,modele:p.classeModele,plaf:p.plafNiveau,essai:p.essai,src:p.src,q:p.reglage,n:p.niveau,nMax:p.niveauMax,fps:p.fps,dpr:p.plafond,toile:p.toile}}catch(e){o.profil='err '+e.message}"
  + "try{o.memoire=JSON.parse(localStorage.getItem('cashcarProfil')||'null')}catch(e){}try{o.journal=dbgErreurs().filter(function(e){return e.g==='profil'}).map(function(e){return e.m})}catch(e){}return JSON.stringify(o)})()";
const GOUV = "(function(){var o={};try{var g=dbgGouvPaliers();o.palier=g.palier;o.niveau=g.niveau;o.voulu=g.voulu;o.qlMin=g.qlMin;o.cran=g.cran;o.dprCap=g.dprCap;o.img=g.img}catch(e){o.err=e.message}"
  + "try{var c=dbgCadence();o.cad={on:c.on,per:c.per,gel:c.gel,auto:c.auto}}catch(e){}try{var d=dbgGouv();o.chaud=d.actif;o.vise=d.vise;o.thermo=d.thermo}catch(e){}"
  + "try{var r=dbgScene().rdr;o.toile=[r.domElement.width,r.domElement.height];o.ombre=r.shadowMap.enabled}catch(e){}try{var j=dbgJuge();o.pq=j.cadence.pq;o.eco=j.cadence.eco}catch(e){}return JSON.stringify(o)})()";
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  let c = null, exc = [], cons = [];
  const fin = () => { try { c && c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const branche = async (wsUrl) => {
    c = new CDP(wsUrl); await c.ok;
    c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400));
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{var s=JSON.parse(localStorage.getItem("cashcarSave")||"null")||' + JSON.stringify(SAVE) + ';s.sfx=false;s.mus=false;s.vox=false;if(window.__ccQ){s.q=window.__ccQ;s.qChoisi=1;}localStorage.setItem("cashcarSave",JSON.stringify(s))}catch(e){}' });
  };
  await branche(pg.webSocketDebuggerUrl);
  let dernUrl = null, fige = null;
  const enCourse = async () => { try { return await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) { return false; } };
  const lance = async () => {
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(1000);
    let ok = false;
    for (let i = 0; i < 120 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); ok = await enCourse(); }
    if (ok) { try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} }
    return ok;
  };
  const joue = async (s) => { const t0 = Date.now(); let morts = 0;
    while (Date.now() - t0 < s * 1000) { await dormir(2000); try { if (await c.ev('dbgState().gameOver')) { morts++; await c.ev('dbgJouer()'); await dormir(3000); try { await c.ev('dbgAuto(1,0,{nit:1});1'); } catch (e) {} } } catch (e) {} }
    return morts; };
  try {
    for (const P of PAS) {
      exc = []; cons = [];
      const [k, ...r] = P.split(':'); const out = { pas: P };
      if (k === 'neuf') {
        await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/sw.js` }); await dormir(800);
        await c.ev('try{localStorage.clear();sessionStorage.clear()}catch(e){};1'); await dormir(1200); await c.ev('try{localStorage.clear();sessionStorage.clear()}catch(e){};1'); /* deux fois : la page quittée écrit encore à son pagehide */
      } else if (k === 'charge') {
        const [ap, q, plus] = r; const qs = (ap && ap !== '-' ? '&appareil=' + ap : '') + (plus ? '&' + plus.split('+').join('&') : '') + (A.q ? '&' + A.q : '');
        if (q && q !== 'neuf') { await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/sw.js` }); await dormir(1200); } /* (2026-11-14, lot juge) la page quittée réécrit la sauvegarde à son pagehide : le réglage se pose APRÈS l'avoir quittée */
        if (q && q !== 'neuf') await c.ev(`(function(){try{var s=JSON.parse(localStorage.getItem("cashcarSave")||"null")||${JSON.stringify(SAVE)};s.q=${JSON.stringify(q)};s.qChoisi=1;localStorage.setItem("cashcarSave",JSON.stringify(s))}catch(e){}return 1})()`).catch(() => {});
        dernUrl = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0&prebati=0&carte=nuages&pistegraine=7${qs}`;
        await c.send('Page.navigate', { url: dernUrl });
        let pret = false; for (let i = 0; i < 300 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
        out.pret = pret; await dormir(1500);
        try { out.q = await c.ev("dbgPrf().reglage+' N'+dbgPrf().niveau+' '+dbgPrf().fps+' i/s'"); } catch (e) {}
      } else if (k === 'course') {
        out.lance = await lance(); out.morts = await joue(+r[0] || 30);
        try { await c.ev("dbgJuge('fin')"); } catch (e) { try { await c.ev('dbgAuto(0);1'); } catch (x) {} }
        await dormir(2500); out.lu = JSON.parse(await c.ev(LIT));
      } else if (k === 'thermo') {
        out.lance = await lance(); await dormir(4000); out.etats = [];
        out.depart = JSON.parse(await c.ev(GOUV));
        for (const n of (r[0] || '0,1,2,3').split(',')) { await c.ev(`dbgThermique(${+n})`); await dormir((+r[1] || 3) * 1000); const g = JSON.parse(await c.ev(GOUV)); g.etat = +n; out.etats.push(g);
          try { if (await c.ev('dbgState().gameOver')) { await c.ev('dbgJouer()'); await dormir(3000); } } catch (e) {} }
        try { await c.ev("dbgJuge&&dbgJuge('fin')"); } catch (e) {}
      } else if (k === 'crash') {
        out.lance = await lance(); await dormir(3000); out.avant = JSON.parse(await c.ev(LIT));
        try { await c.send('Page.crash', {}, 3000); } catch (e) { out.crashErr = String(e.message).slice(0, 80); }
        await dormir(1500); try { c.close(); } catch (e) {}
        const t = await (await fetch(`http://127.0.0.1:${P_CDP}/json/new?about:blank`, { method: 'PUT' })).json();
        await branche(t.webSocketDebuggerUrl); out.rouvert = true;
      } else if (k === 'quitte') {
        const TEM = "(function(){var j=dbgJuge();return JSON.stringify({temoin:j.temoin,inactif:j.inactif,paused:dbgState().paused,memoire:j.memoire,dec:j.decisions.slice(-2)})})()";
        out.lance = await lance(); await dormir(4000); out.avant = JSON.parse(await c.ev(TEM));
        const ev = r[0] || 'ccInactif';
        out.envoi = await c.ev(ev === 'pause' ? "document.dispatchEvent(new Event('pause'));'pause'" : ev === 'pausejeu' ? "window.__panBascule();'pausejeu'" : `window.dispatchEvent(new Event(${JSON.stringify(ev)}));${JSON.stringify(ev)}`);
        await dormir(2500); out.apres = JSON.parse(await c.ev(TEM));
        if (r[1] === 'crash') {
          try { await c.send('Page.crash', {}, 3000); } catch (e) { out.crashErr = String(e.message).slice(0, 80); }
          await dormir(1500); try { c.close(); } catch (e) {}
          const t = await (await fetch(`http://127.0.0.1:${P_CDP}/json/new?about:blank`, { method: 'PUT' })).json();
          await branche(t.webSocketDebuggerUrl); out.rouvert = true;
        } else if (r[1] === 'reprise') {
          await c.ev("window.dispatchEvent(new Event('ccActif'));1"); await dormir(2500); out.actifEnPause = JSON.parse(await c.ev(TEM));
          await c.ev("window.__panBascule();1"); await dormir(6000); out.repris = JSON.parse(await c.ev(TEM));
          try { await c.ev("dbgJuge('fin')"); } catch (e) {} await dormir(2000); out.fin = JSON.parse(await c.ev(TEM));
        }
      } else if (k === 'ctxcourse') {
        out.lance = await lance(); await dormir((+r[0] || 6) * 1000);
        out.r = await c.ev("(function(){try{" + (r[1] === 'retour' ? "window.dispatchEvent(new Event('ccActif'));" : "") + "var g=dbgScene().rdr.getContext();g.getExtension('WEBGL_lose_context').loseContext();return dbgJuge().decisions.slice(-1)[0]}catch(e){return 'err '+e.message}})()");
        await dormir(7000); let pret = false; for (let i = 0; i < 300 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000); } catch (e) {} }
        out.recharge = pret; await dormir(1500); out.lu = JSON.parse(await c.ev(LIT)); try { out.ctxSeance = await c.ev('dbgJuge().ctxSeance'); } catch (e) {}
      } else if (k === 'lance') {
        out.lance = await lance(); await dormir((+r[0] || 3) * 1000);
      } else if (k === 'fige') {
        fige = await c.ev("localStorage.getItem('cashcarProfil')"); out.r = fige;
      } else if (k === 'cmp') {
        const now = await c.ev("localStorage.getItem('cashcarProfil')"); out.pareil = now === fige; out.r = now;
      } else if (k === 'ctx') {
        out.r = await c.ev("(function(){try{var g=dbgScene().rdr.getContext();g.getExtension('WEBGL_lose_context').loseContext();return 'perdu'}catch(e){return 'err '+e.message}})()");
        await dormir(1500); out.lu = JSON.parse(await c.ev(LIT));
      } else if (k === 'vieillir') {
        const j = +r[0] || 1;
        out.r = await c.ev(`(function(){var a=JSON.parse(localStorage.getItem('cashcarProfil')||'null');if(!a)return null;var d=${j}*864e5;if(a.mur)a.mur.fin-=d;if(a.lT)a.lT-=d;a.t-=d;localStorage.setItem('cashcarProfil',JSON.stringify(a));return a})()`);
      } else if (k === 'lit') {
        out.lu = JSON.parse(await c.ev(LIT));
      } else if (k === 'ev') {
        try { out.r = await c.ev(r.join(':'), 60000); } catch (e) { out.r = 'err ' + e.message; }
      }
      try { out.pannes = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son','profil','fluide','memoire','energie'].indexOf(e.g)<0}).map(function(e){return e.g+' '+e.k})}catch(e){return String(e)}})()"); } catch (e) {}
      out.exc = exc; out.cons = cons;
      console.log(JSON.stringify(out));
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
