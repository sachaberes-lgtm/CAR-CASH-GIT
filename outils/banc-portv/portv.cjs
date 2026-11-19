/* LE BANC DU PORTAIL ÉTALÉ (2026-11-17, lot portv — vol du 13 Pro build 120 : le rappel du portail jusqu'à 1 463 ms d'un bloc).
   node outils/banc-portv/portv.cjs --out <sortie.json> [--q "sans=portv"] [--suite jade,grotte,ville,nuages] [--tours 3] [--bride 10] [--graine 7]
        [--page index.html] [--prof 1] [--photos <dossier>] [--http 9461] [--cdp 9462]
   Chrome sans fenêtre, muet, téléphone émulé (tel=1, profil iPhone14,2), boîte de vol allumée (perfrec=2). Une course (nuages au départ, immortelle),
   le processeur bridé ×bride dès le départ ; pour chaque portail de la suite (répétée `tours` fois) : la map d'en face imposée (dbgClassique), la caisse
   posée à ~1 400 m du portail (la map d'en face se bâtit d'avance en roulant), puis à ~6 s du portail quand le pré-bâti est prêt ; on roule jusqu'au passage.
   Relève, par portail : chaque image d'écran (rAF) de 2,5 s avant le voile à 6 s après (pire image, images > 50 ms), la plus longue tranche de pré-bâti d'une
   image pendant l'approche (dbgPortv().trMx), le détail de la construction (dbgPortv().l), les tâches longues, les exceptions ; --prof : un profil
   (.cpuprofile) par portail ; --photos : une photo à l'arrivée, la course figée (dbgPause) à s = 300 m de la piste neuve.
   À lancer sous ~/cash-car/verrou-banc.sh. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RACINE = path.resolve(__dirname, '..', '..'), PAGE = A.page || 'index.html', OUT = path.resolve(A.out || 'portv.json');
const SUITE = (A.suite || 'jade,grotte,ville,nuages').split(','), TOURS = +(A.tours || 3), BRIDE = +(A.bride || 10), GRAINE = A.graine || '7';
const PROF = A.prof === '1', PHOTOS = A.photos ? path.resolve(A.photos) : null;
if (PHOTOS) fs.mkdirSync(PHOTOS, { recursive: true });
let P_HTTP = +(A.http || 9461), P_CDP = +(A.cdp || 9462);
const R = { q: A.q || '', bride: BRIDE, suite: SUITE, tours: TOURS, page: PAGE, portails: [], exc: [], con: [], debut: new Date().toISOString() };
const EMPREINTE = 'JSON.stringify(dbgPortvScene())';
const ecrit = () => fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
(async () => {
  while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveur(path.join(RACINE, 'VERSION PRINCIPALE'), P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = (code) => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} process.exit(code || 0); };
  setTimeout(() => { R.delai = 1; ecrit(); console.log('délai dépassé'); fin(2); }, (+A.max || 55) * 60 * 1000);
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; R.exc.push(((d.exception && d.exception.description) || d.text || '').slice(0, 600)); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') R.con.push(m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  await c.send('Runtime.enable'); await c.send('Page.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}" +
    "window.__lt=[];try{new PerformanceObserver(function(l){for(const e of l.getEntries())window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]);}).observe({type:'longtask',buffered:true});}catch(e){}" +
    "window.__fr=[];window.__ev=[];(function(){let p=0;const f=function(t){if(p&&window.__frOn)window.__fr.push([Math.round(t),Math.round((t-p)*10)/10]);p=t;requestAnimationFrame(f);};requestAnimationFrame(f);})();" +
    "document.addEventListener('cc:portail',function(){window.__ev.push([Math.round(performance.now()),'portail']);});" +
    "document.addEventListener('cc:construction',function(e){window.__ev.push([Math.round(performance.now()),'c:'+e.detail.etape,e.detail.ms]);});" });
  const url = `http://127.0.0.1:${P_HTTP}/${PAGE}?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&perfrec=2&carte=nuages&pistegraine=${GRAINE}${A.q ? '&' + A.q : ''}`;
  await c.send('Page.navigate', { url });
  const ev = (x, ms) => c.ev(x, ms || 120000);
  for (let i = 0; i < 200; i++) { await dormir(1500); try { if (await ev('!!window.__gameReady')) break; } catch (e) {} }
  await dormir(4000); await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()");
  for (let i = 0; i < 60; i++) { if (await ev('!!(window.dbgJouer&&window.dbgClassique)')) break; await dormir(500); }
  await dormir(6000);
  await ev("try{dbgClassique('nuages');}catch(e){}dbgJouer();1");
  for (let i = 0; i < 80; i++) { await dormir(500); if (await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)')) break; }
  await ev('dbgImmortel(true)');
  await c.send('Emulation.setCPUThrottlingRate', { rate: BRIDE });
  await dormir(3000);
  const etat = '(function(){try{const p=dbgPrebati(),d=dbgState();return {t:Math.round(performance.now()),st:d.started,go:d.gameOver,pi:(dbgNiveau()||{}).lieu,e:p.etat,c:p.carte,v:p.v,reste:p.reste};}catch(e){return {err:e.message};}})()';
  let carte0 = await ev('(dbgNiveau()||{}).lieu');
  for (let tour = 0; tour < TOURS; tour++) for (const cible of SUITE) {
    const P = { tour, de: carte0, vers: cible, sauts: [] };
    await ev(`dbgPortv(1);window.__ev.length=0;window.__fr.length=0;window.__lt.length=0;window.__frOn=true;try{dbgClassique('${cible}');}catch(e){}1`);
    if (PROF) { await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 500 }); await c.send('Profiler.start'); }
    P.t0 = await ev('Math.round(performance.now())');
    P.marque = await ev('(function __marque(){const t=performance.now();while(performance.now()-t<4);return t;})()'); /* le repère du profil : 4 ms dans __marque, à P.marque (performance.now) */
    await ev('dbgPortail(1400);1'); P.sauts.push(await ev('Math.round(performance.now())'));
    let entre = false, tp = null;
    for (let i = 0; i < 2400 && !entre; i++) {
      await dormir(250); const e = await ev(etat);
      if (e && e.pi && e.pi !== carte0 && e.pi !== undefined) { const p = await ev("(window.__ev.find(function(x){return x[1]==='portail';})||[0])[0]"); if (p) { tp = p; entre = true; break; } }
      if (e && e.e === 'pret' && e.reste > 9) { await ev('dbgPortail(Math.max(300,' + Math.round((e.v || 60) * 6) + '));1'); P.sauts.push(await ev('Math.round(performance.now())')); }
      if (e && e.e === '' && e.reste < 3 && i > 40) { /* rien de bâti (map non pré-bâtie) : on laisse rouler */ }
    }
    P.entre = entre; P.tp = tp;
    await dormir(6500);
    if (PROF) { const pr = await c.send('Profiler.stop', {}, 120000); const f = OUT.replace(/\.json$/, '') + `-${tour}-${cible}.cpuprofile`; fs.writeFileSync(f, JSON.stringify(pr.profile)); P.profil = f; }
    const D = await ev('JSON.stringify({fr:window.__fr,ev:window.__ev,lt:window.__lt,pv:dbgPortv(),pb:dbgPrebati(),niv:dbgNiveau()})'); const d = JSON.parse(D);
    await ev('window.__frOn=false;1');
    P.ev = d.ev; P.pv = d.pv; P.pb = { palier: d.pb.palier, palierCourse: d.pb.palierCourse, graine: d.pb.graine, pasLongs: d.pb.pasLongs, tenus: d.pb.tenusSousVoile, msVoile: d.pb.msSousVoile, cpuMaps: d.pb.cpuMaps, der: d.pb.der }; P.lieu = d.niv && d.niv.lieu;
    if (tp) {
      const w0 = tp - 2500, w1 = tp + 6000, F = d.fr.filter(x => x[0] >= w0 && x[0] <= w1 && !P.sauts.some(s => x[0] > s && x[0] < s + 400));
      const fc = d.ev.find(x => x[1] === 'c:chauffe'); P.tChauffe = fc ? fc[0] - tp : null; const ff = d.ev.find(x => x[1] === 'c:fin'); P.tFin = ff ? ff[0] - tp : null;
      P.images = F.length; P.pire = F.reduce((m, x) => Math.max(m, x[1]), 0); P.sup50 = F.filter(x => x[1] > 50).length; P.sup100 = F.filter(x => x[1] > 100).length;
      const av = d.fr.filter(x => x[0] >= tp - 9000 && x[0] < tp - 2500).map(x => x[1]).sort((a, b) => a - b); P.medAvant = av.length ? av[av.length >> 1] : null;
      P.longues = F.filter(x => x[1] > 50).map(x => [x[0] - tp, x[1]]);
      P.lt = d.lt.filter(x => x[0] >= w0 && x[0] <= w1).map(x => [x[0] - tp, x[1]]);
    }
    P.trMx = d.pv.trMx; P.trL = d.pv.trL;
    if (entre) { /* L'ARRIVÉE : l'empreinte de la scène (chaque objet : sa géométrie au mot près, son index, ses instances, sa matière, sa matrice s'il est figé) et, --photos, une photo cadrée (dbgView) à s = 200 m */
      await c.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      try { P.scene = await ev(EMPREINTE, 120000); } catch (e) { P.scene = { err: e.message.slice(0, 200) }; }
      if (PHOTOS) {
        try { await ev('(function(){const e=dbgPortailEtat();dbgPortail(e.L-200);dbgStep(1);dbgView(0.5,16,5);return 1;})()'); await dormir(400);
          P.photo = path.join(PHOTOS, `${tour}-${cible}.png`); const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(P.photo, Buffer.from(sh.data, 'base64')); } catch (e) { P.photo = 'raté ' + e.message.slice(0, 200); }
        await ev('dbgLumReprise();1').catch(() => {});
      }
      await c.send('Emulation.setCPUThrottlingRate', { rate: BRIDE });
    }
    R.portails.push(P); ecrit();
    console.log(`${tour} ${carte0}→${cible} entré:${entre} pire ${P.pire} ms, >50:${P.sup50}, >100:${P.sup100}, méd. avant ${P.medAvant}, tranche pré-bâti max ${P.trMx} ms, construction ${JSON.stringify((d.pv.l[d.pv.l.length - 1] || {}).actif)} ms`);
    carte0 = P.lieu || cible;
  }
  R.erreurs = await ev('JSON.stringify(window.dbgErreurs?dbgErreurs():null)').catch(() => null);
  R.fin = new Date().toISOString(); ecrit(); console.log('écrit', OUT); fin(0);
})().catch(e => { console.error(e); R.err = String(e && e.stack || e); ecrit(); process.exit(3); });
