/* LE BANC DU JEU VIVANT (2026-11-17, lot portv, 2e tour — contrôle adverse : la route de la grotte bâtie en course différait ; mort, pause, QUITTER pendant l'étalement).
   node outils/banc-portv/vivant.cjs --out <x.json> [--q "sans=portv"] [--bride 4] [--page index.html] [--suite jade,grotte,ville,nuages,espace,canyon,jade,grotte,ville,jade,grotte]
   Sous ~/cash-car/verrou-banc.sh. Chrome sans fenêtre, muet, téléphone émulé (tel=1, iPhone14,2), `routeverif=1` : à CHAQUE route bâtie en course (d'avance ou au passage), le jeu bâtit
   la même d'un trait aux mêmes entrées (graine, palier, mémoire des grottes) et compare (dbgRouteVerif). Une course (nuages, immortelle), processeur ×bride.
   1) LES ROUTES : un portail par map de la suite (la map d'en face imposée, pré-bâti fini, passage roulé sur ~250 m) ; mémoire GPU (renderer.info) après chaque portail.
   2) LES CAS TORDUS, chacun pendant l'étalement (déclenché dans la page dès que dbgPortvEtale().enCours > 0) : pause 1,5 s ; arrière-plan 1,2 s ; mort (explosion) puis
      réanimation ; grotte NON bâtie d'avance (pré-bâti coupé) ; deux portails rapprochés ; portail pris à grande vitesse en roulant (moteur monté) ; QUITTER sous le voile puis
      nouvelle course ; QUITTER en plein pré-bâti puis nouvelle course.
   Lecture : node outils/banc-portv/vivant-lire.cjs <x.json> [<y.json>] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RACINE = path.resolve(__dirname, '..', '..'), PAGE = A.page || 'index.html', OUT = path.resolve(A.out || 'vivant.json'), Q = A.q || '', BRIDE = +(A.bride || 4);
const SUITE = (A.suite || 'jade,grotte,ville,nuages,espace,canyon,jade,grotte,ville,jade,grotte').split(',');
const SAUTE = new Set((A.saute || '').split(',').filter(Boolean));
const R = { q: Q, bride: BRIDE, routes: [], fuite: [], cas: [], exc: [], con: [], debut: new Date().toISOString() };
const ecrit = () => fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
const CAS = 'JSON.stringify(dbgPortvCas())';
(async () => {
  let P_HTTP = +(A.http || 9631), P_CDP = P_HTTP + 1; while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveur(path.join(RACINE, 'VERSION PRINCIPALE'), P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = (code) => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} ecrit(); process.exit(code || 0); };
  setTimeout(() => { R.delai = 1; console.log('délai'); fin(2); }, (+A.max || 40) * 60 * 1000);
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; R.exc.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) R.con.push(m.params.type + ' ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  await c.send('Runtime.enable'); await c.send('Page.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}" +
    "window.__ev=[];document.addEventListener('cc:portail',function(){window.__ev.push(['portail',Math.round(performance.now())]);});" });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/${PAGE}?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&carte=nuages&pistegraine=7&routeverif=1${Q ? '&' + Q : ''}` });
  const ev = (x, ms) => c.ev(x, ms || 180000);
  for (let i = 0; i < 200; i++) { await dormir(1500); try { if (await ev('!!window.__gameReady')) break; } catch (e) {} }
  await dormir(3000); await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()");
  for (let i = 0; i < 60; i++) { if (await ev('!!(window.dbgJouer&&window.dbgClassique&&window.dbgPortvCas)')) break; await dormir(500); }
  await dormir(4000);
  const cas = () => ev(CAS).then(JSON.parse);
  const depart = async () => { await ev("try{dbgClassique('nuages');}catch(e){}dbgJouer();1");
    for (let i = 0; i < 80; i++) { await dormir(500); if (await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)')) break; }
    await ev('dbgImmortel(true);1'); await dormir(1500); };
  await depart();
  if (BRIDE > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: BRIDE });
  /* le piège : posé dans la page avant le passage, il agit dès que l'étalement est en cours (ou, sans lot, ~40 tâches après le portail) */
  const arme = (piege) => ev(`window.__ev2=[];document.addEventListener('cc:portail',function f(){document.removeEventListener('cc:portail',f);
      const P=${JSON.stringify(piege || '')};if(!P)return;let n=0;const t=function(){n++;const e=dbgPortvEtale();
        if(e.enCours>0||n>40){const C=dbgPortvCas();window.__ev2.push(['piege',P,e.enCours,n,Math.round(performance.now()),C.mode,C.s]);
          try{if(P==='quitte'){dbgPortvCas('pause');window.__ev2.push(['quitte',dbgQuitte(),JSON.stringify(dbgPortvCas())]);}
          else if(P==='pause'){dbgPortvCas('pause');window.__ev2.push(['pause',JSON.stringify(dbgPortvCas())]);setTimeout(function(){window.__ev2.push(['pendant',JSON.stringify(dbgPortvCas())]);dbgPortvCas('pause');window.__ev2.push(['reprise',Math.round(performance.now())]);},1500);}
          else if(P==='cache'){Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));setTimeout(function(){window.__ev2.push(['pendant',JSON.stringify(dbgPortvCas())]);delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));window.__ev2.push(['visible',Math.round(performance.now())]);},1200);}
          else if(P==='mort'){window.__ev2.push(['mort',JSON.stringify(dbgChance('mort')),JSON.stringify(dbgPortvCas())]);}
          }catch(e){window.__ev2.push(['err',String(e)]);}return;}setTimeout(t,0);};setTimeout(t,0);});1`);
  const attendPret = async (cible, max) => { for (let i = 0; i < (max || 1200); i++) { await dormir(250);
      const e = await ev('(function(){const p=dbgPrebati();return {e:p.etat,c:String(p.carte||"")};})()'); if (e.e === 'pret' && e.c.indexOf(cible) === 0) return true; } return false; };
  const attendPortail = async (max) => { for (let i = 0; i < (max || 600); i++) { await dormir(200); const p = await ev("(window.__ev.find(function(x){return x[0]==='portail';})||[0])[1]||0"); if (p) return p; } return 0; };
  const attendFin = async () => { for (let i = 0; i < 300; i++) { const k = await cas(); if (!k.ph && !k.att) return k; await dormir(200); } return await cas(); };
  const portail = async (cible, o) => { o = o || {};
    const lieu0 = (await cas()).lieu;
    await ev(`window.__ev.length=0;try{dbgClassique('${cible}');}catch(e){}1`); await arme(o.piege);
    const info = { cible, piege: o.piege || '', de: lieu0, rv0: (await ev('dbgRouteVerif().n')) };
    if (o.avant) await o.avant(info);
    if (!o.sansAttente) { await ev('dbgPortail(1400);1'); info.pret = await attendPret(cible); }
    if (o.vite) { const k = await cas(); info.kmhApproche = k.kmh; const v = Math.max(60, +(await ev('dbgPrebati().v')) || 60); info.vApproche = v; await ev(`dbgPortail(${Math.round(Math.max(300, v * 5))});1`); }
    else await ev(`dbgPortail(${o.d || 250});1`);
    info.tp = await attendPortail();
    info.kmhPassage = (await cas()).kmh;
    await dormir(o.piege ? 4500 : 2500);
    info.ev2 = await ev('JSON.stringify(window.__ev2||[])').then(JSON.parse);
    info.etat = await attendFin(); info.etatT = Math.round(Date.now() / 1000);
    info.etale = await ev('JSON.stringify(dbgPortvEtale())').then(JSON.parse);
    info.rv = await ev(`JSON.stringify(dbgRouteVerif().l.slice(-(dbgRouteVerif().n-${info.rv0})))`).then(JSON.parse).catch(() => null);
    console.log(JSON.stringify({ cible, piege: info.piege, pret: info.pret, tp: !!info.tp, lieu: info.etat.lieu, mode: info.etat.mode, go: info.etat.gameOver, rv: (info.rv || []).map(x => x.k + ':' + x.carte + ':' + (x.egal ? 'EGAL' : 'DIFF')) }));
    return info;
  };
  R.fuite.push(Object.assign({ quand: 'depart' }, await cas()));
  /* 1) LES ROUTES */
  for (const cible of SUITE) { const P = await portail(cible); R.routes.push(P); R.fuite.push(Object.assign({ quand: 'apres ' + cible }, P.etat)); ecrit(); }
  await dormir(3000); R.fuite.push(Object.assign({ quand: 'fin des routes' }, await cas())); ecrit();
  R.verif = await ev('JSON.stringify(dbgRouteVerif())').then(JSON.parse).catch(() => null); ecrit();
  /* 2) LES CAS */
  const fais = async (nom, f) => { if (SAUTE.has(nom)) return; try { const P = await f(); P.nom = nom; R.cas.push(P); } catch (e) { R.cas.push({ nom, err: String(e && e.stack || e).slice(0, 400) }); } ecrit(); };
  await fais('pause', () => portail('grotte', { piege: 'pause' }));
  await fais('cache', () => portail('jade', { piege: 'cache' }));
  await fais('mort', async () => { const P = await portail('ville', { piege: 'mort' });
    for (let i = 0; i < 40; i++) { const k = await cas(); if (k.gameOver) break; await dormir(250); }
    P.apresMort = await cas(); P.reanime = await ev('JSON.stringify(dbgChance("joue"))').catch(e => String(e)); await dormir(3000); P.apresReanime = await cas(); await dormir(2000); P.roule = await cas();
    await ev('dbgImmortel(true);1'); if (P.roule.gameOver || !P.roule.started) await depart(); return P; });
  await fais('sansprebati', () => portail('grotte', { avant: async (I) => { I.coupe = await ev('JSON.stringify(dbgPortvCas("sansprebati"))'); }, sansAttente: true, d: 300 }).then(async P => { await ev('dbgPortvCas("prebati");1'); return P; }));
  await fais('rapproches', async () => { const P = await portail('nuages'); await ev("try{dbgClassique('jade');}catch(e){}window.__ev.length=0;dbgPortail(150);1");
    P.tp2 = await attendPortail(); await dormir(4000); P.second = await attendFin();
    P.rv2 = await ev('JSON.stringify(dbgRouteVerif().l.slice(-2))').then(JSON.parse); return P; });
  await fais('vite', async () => { const n0 = (await cas()).kmh; let m = ''; for (let i = 0; i < 18; i++) m = await ev('dbgMoteur()'); await dormir(4000);
    const P = await portail('grotte', { vite: true }); P.moteur = m; P.kmh0 = n0; return P; });
  await fais('quitte', async () => { const P = await portail('jade', { piege: 'quitte' }); await dormir(2000); P.apresQuitte = await cas();
    await depart(); await dormir(3000); P.nouvelle = await cas(); const Q2 = await portail('grotte'); P.portailApres = { rv: Q2.rv, etat: Q2.etat }; return P; });
  await fais('quittePrebati', async () => { const P = { cible: 'grotte' }; await ev("try{dbgClassique('grotte');}catch(e){}dbgPortail(1400);1");
    for (let i = 0; i < 100; i++) { await dormir(150); const e = await ev('dbgPrebati().etat'); if (e === 'en cours') break; }
    P.avant = await cas(); P.quitte = await ev('dbgQuitte()'); await dormir(3000); P.apresQuitte = await cas();
    await depart(); await dormir(3000); P.nouvelle = await cas(); const Q2 = await portail('jade'); P.portailApres = { rv: Q2.rv, etat: Q2.etat }; return P; });
  R.fuite.push(Object.assign({ quand: 'fin' }, await cas()));
  R.verif = await ev('JSON.stringify(dbgRouteVerif())').then(JSON.parse);
  R.erreurs = await ev('JSON.stringify(window.dbgErreurs?dbgErreurs():null)').catch(() => null);
  R.fin = new Date().toISOString(); ecrit(); console.log('fin'); fin(0);
})().catch(e => { console.error(e); R.err = String(e && e.stack || e); ecrit(); process.exit(3); });
