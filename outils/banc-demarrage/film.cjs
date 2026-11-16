// LE BANC DU FILM (2026-11-15, qualité · lot lancement2) — d'après lancement.cjs.
// Un lancement du vrai jeu sur le chemin du téléphone (Chrome sans fenêtre, MUET, 390×844 ×2, ?tel=1&introapres=1), et la mesure de ce que voit le joueur :
//   · serpent : l'instant où le film part (1re image de la boule) ;
//   · boule prête : l'instant où le toucher est accepté ; menu : l'instant de `cc:revele` (le banc touche dès que la boule est prête) ;
//   · les images du film (tous les intervalles entre deux images, de `lance` à `cc:revele`) : distribution, > 20 ms, > 34 ms, pire ; à part : le NOIR D'OUVERTURE
//     (les 0,8 premières secondes : l'écran est noir, seul le serpent se voit), la BOULE (jusqu'au toucher), l'EXPLOSION (du toucher au menu) ;
//   · les tâches longues pendant le film ; les lignes de la boîte noire (chargement, intro, attente, panne).
// Usage : node outils/banc-demarrage/film.cjs [--q "sans=filmcharge"] [--cpu 4] [--http 9931 --cdp 9932] [--tot 1] [--jouer 1] [--menu 6]
//   --tot 1   : un toucher 1 s après le départ du film (bien avant « prête ») : il ne doit RIEN ouvrir.
//   --jouer 1 : JOUER dès que le menu paraît (dbgJouer) : combien de temps jusqu'à la course, et le départ attendu (dbgDepart).
//   --profil <fichier> : (2026-11-16) profil JavaScript du toucher jusqu'au menu + 1 s (Profiler), écrit dans <fichier> (.cpuprofile)
//   (au toucher, `etatAuToucher` : où en est la chauffe du menu — lune, moteur vif, moteurs, gabarits)
//   --profilboule <fichier> : (2026-11-16, 3e passe) profil JavaScript du chargement (dès la 1re lecture de la page) jusqu'à la boule prête (avant le toucher) : les pas longs du chargement pendant la boule
//   --bloque <motif> : (2026-11-16, 3e passe) les fetch() dont l'adresse contient <motif> restent EN SUSPENS (jamais servis) ; les balises <script> passent.
//                      Ex. --bloque sons-banque-2 avec ?banquetard=1 et une banque scindée : la lecture de la banque 2 qui traîne (l'échéance de sfx.js doit retomber sur la balise).
//   --fond <s> : (2026-11-16) ARRIÈRE-PLAN pendant le film, <s> secondes après son départ : la page passe derrière
//                3 s (un autre onglet passe devant), puis revient. Le film doit reprendre et finir au menu.
// Sortie : un JSON sur la sortie standard.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9931), P_CDP = +(A.cdp || 9932);
const PROF = path.join(os.tmpdir(), 'banc-demarrage-profil');
const ORDI = !!A.ordi; /* --ordi 1 : l'ORDINATEUR (1280×800, souris, aucun paramètre de téléphone) : le lot ne doit pas s'y allumer */
const W = ORDI ? 1280 : 390, H = ORDI ? 800 : 844, CPU = +(A.cpu || 1), MENU_S = +(A.menu || 6);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const SONDE = `(function(){
  var B=window.__BD={notes:[],lt:[],im:[],rev:0,lance:0,pret:0,img:0};var now=function(){return performance.now();};
  try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){B.lt.push([Math.round(e.startTime),Math.round(e.duration)]);});}).observe({entryTypes:['longtask']});}catch(e){}
  var raf=window.requestAnimationFrame.bind(window),p=0;(function c(t){B.img++;
    var I=window.__ccIntroAuto;if(I){try{if(!B.lance&&I.lance())B.lance=t;if(!B.pret&&I.pret())B.pret=t;}catch(e){}}
    if(B.lance&&!B.rev&&p)B.im.push([Math.round(t),Math.round((t-p)*10)/10]);p=t;raf(c);})();
  document.addEventListener('cc:revele',function(){if(!B.rev)B.rev=Math.round(now());});
  var f=null;Object.defineProperty(window,'__ccNote',{configurable:true,get:function(){return f;},set:function(v){f=function(g,m,x){try{B.notes.push([Math.round(now()),g,String(m).slice(0,900)]);}catch(e){}return v.apply(this,arguments);};}});
})();`;

const TOUCHE = "(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:195,clientY:420}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:195,clientY:420}));s.click();}catch(e){}return Math.round(performance.now());})()";

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 400)); } catch (x) {} });
  let sortie = {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!ORDI) {
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}\n' + SONDE });
    if (CPU > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    if (A.bloque) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: '(function(){var f=window.fetch,B=window.__BLOQ=[];window.fetch=function(u){var s=String(u&&u.url||u);if(s.indexOf(' + JSON.stringify(A.bloque) + ')>=0){B.push(s.replace(/^.*\\//,""));return new Promise(function(){});}return f.apply(this,arguments);};})();' }); /* la lecture reste en suspens, jamais servie */
    const url = `http://127.0.0.1:${P_HTTP}/index.html?${ORDI ? 'garde=1' : 'tel=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1'}&v=${Date.now()}` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    const T0 = Date.now(); let rev = 0, tot = null, touche = 0, profB = 0, jouer = null, fond = null, etatAuToucher = null;
    for (let i = 0; i < 1700; i++) { await dormir(100);
      let e; try { e = await c.ev('(function(){var B=window.__BD;if(!B)return null;return [B.lance|0,B.pret|0,B.rev|0,Math.round(performance.now())];})()', 8000); } catch (x) { continue; }
      if (!e) continue;
      if (A.fond && e[0] && !fond && e[3] - e[0] > +A.fond * 1000) { fond = { a: e[3] - e[0], pretAlors: !!e[1] };
        /* un AUTRE onglet passe devant 3 s (le nôtre devient caché : plus d'images ni de son, comme l'app derrière), puis le nôtre revient */
        try { const v = await (await fetch(`http://127.0.0.1:${P_CDP}/json/version`)).json(); const b = new CDP(v.webSocketDebuggerUrl); await b.ok;
          const nt = await b.send('Target.createTarget', { url: 'about:blank' }); await dormir(400);
          fond.pendant = await c.ev('(function(){var B=window.__BD;return {vis:document.visibilityState,img:B.img};})()');
          await dormir(2600); fond.fin = await c.ev('(function(){var B=window.__BD;return {vis:document.visibilityState,img:B.img};})()');
          await b.send('Target.activateTarget', { targetId: pg.id }); await b.send('Target.closeTarget', { targetId: nt.targetId }); b.close(); } catch (x) { fond.err = String(x.message).slice(0, 160); }
        await dormir(300); fond.revenu = await c.ev('document.visibilityState');
        fond.apres = await c.ev('(function(){try{var f=dbgIntro.film();return {t:dbgIntro.etat().t,reste:f.reste,tranches:f.tranches,pret:f.pret};}catch(e){return String(e);}})()'); continue; }
      if (A.tot && e[0] && !tot && e[3] - e[0] > 1000) { tot = { a: await c.ev(TOUCHE), pretAlors: !!e[1] }; }
      if (A.profilboule && !profB) { profB = 1; await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 100 }); await c.send('Profiler.start'); }
      if (e[1] && !touche && profB === 1) { profB = 2; try { const pr = await c.send('Profiler.stop'); fs.writeFileSync(A.profilboule, JSON.stringify(pr.profile)); } catch (x) { console.error('profil boule', x.message); } }
      if (e[1] && !touche) { if (A.profil) { await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 200 }); await c.send('Profiler.start'); } touche = await c.ev(TOUCHE);
        try { etatAuToucher = await c.ev('(function(){var r={};try{var l=dbgLune();r.lune={peinte:l.peinte,pinceau:l.pinceau,pire:l.pireEtapeMs};}catch(e){r.lune=String(e);}try{var m=dbgMoteurVif();r.vif={chauffe:m.chauffe,progs:m.programmes};}catch(e){r.vif=String(e);}try{var c=dbgChauffe();r.chauffe={moteurs:c.moteurs,sur:c.sur,lier:c.lier,programmes:c.programmes};}catch(e){}try{r.gab=dbgGabarits();}catch(e){}return r;})()'); } catch (x) {} }
      if (e[2]) { rev = e[2]; break; }
      if (Date.now() - T0 > 170000) break; }
    if (tot) { tot.menuAvantPret = false; }
    if (A.profil && touche) { await dormir(1000); try { const pr = await c.send('Profiler.stop'); fs.writeFileSync(A.profil, JSON.stringify(pr.profile)); } catch (x) { console.error('profil', x.message); } }
    if (A.jouer && rev) { const j0 = Date.now(); jouer = {};
      try { jouer.reponse = String(await c.ev('(function(){try{var r=dbgJouer();return r===undefined?"ok":JSON.stringify(r);}catch(e){return "x "+e.message;}})()')); } catch (e) { jouer.reponse = String(e); }
      for (let i = 0; i < 400; i++) { await dormir(100); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { jouer.enCourseMs = Date.now() - j0; break; } } catch (e) {}
        if (i % 50 === 49) { try { await c.ev('dbgJouer()'); } catch (e) {} } }
      await dormir(3000);
      try { jouer.depart = await c.ev('dbgDepart()'); } catch (e) {}
      try { jouer.preb = await c.ev('(function(){var p=dbgPrebati();return {etat:p.etat,pris:p.pris,depPris:p.depPris,prisAuDepart:p.prisAuDepart,der:p.der,annules:p.annules};})()'); } catch (e) {}
      try { jouer.etat = await c.ev("(function(){var s=dbgState();return {started:s.started,running:s.running,gameOver:s.gameOver};})()"); } catch (e) {}
    } else await dormir(MENU_S * 1000);
    const B = await c.ev(`(function(){var B=__BD,n=B.notes,rev=B.rev||1e9,tap=${touche | 0}||rev;
      var dist=function(L){var r={n:L.length,sup20:0,sup34:0,sup50:0,sup100:0,pire:0,p50:0,p95:0,p99:0,liste34:[]};if(!L.length)return r;
        var S=L.map(function(x){return x[1];}).sort(function(a,b){return a-b;});r.p50=S[Math.floor(S.length*.5)];r.p95=S[Math.floor(S.length*.95)];r.p99=S[Math.floor(S.length*.99)];r.pire=S[S.length-1];
        L.forEach(function(x){if(x[1]>20)r.sup20++;if(x[1]>34){r.sup34++;if(r.liste34.length<40)r.liste34.push(((x[0]-B.lance)/1000).toFixed(2)+'s '+Math.round(x[1]));}if(x[1]>50)r.sup50++;if(x[1]>100)r.sup100++;});return r;};
      var F=B.im.filter(function(x){return x[0]<rev;}),F2=F.slice(2); /* (les 2 premières images du film : le départ lui-même, compté à part) */
      var r={serpent:Math.round(B.lance),boulePrete:Math.round(B.pret),touche:${touche | 0},menu:B.rev,
        film:{depart:F.slice(0,2).map(function(x){return x[1];}),tout:dist(F2),noir:dist(F2.filter(function(x){return x[0]-x[1]-B.lance<800;})),boule:dist(F2.filter(function(x){return x[0]<=tap&&x[0]-x[1]-B.lance>=800;})),explosion:dist(F2.filter(function(x){return x[0]>tap;}))},
        longuesFilm:B.lt.filter(function(x){return x[0]>=B.lance&&x[0]<rev;}),longuesMenu:B.lt.filter(function(x){return x[0]>=rev;}),
        notes:n.filter(function(x){return /chargement|attente|intro|serpent|panne|erreur|son/.test(x[1]);}).map(function(x){return (x[0]/1000).toFixed(1)+' '+x[1]+' | '+x[2];})};
      try{r.dense=dbgDense();}catch(e){}try{var p9=dbgPrebati();r.preb={etat:p9.etat,carte:p9.carte,ms:p9.ms,cpu:p9.cpu,images:p9.images,pasLongs:p9.pasLongs,dep:p9.dep};}catch(e){}
      try{r.chauffe=dbgChauffe();}catch(e){}try{r.filmCharge=dbgIntro.film?dbgIntro.film():null;}catch(e){}try{r.mode={dense:dbgDense().ok,ua:navigator.userAgent.slice(0,40)};}catch(e){}
      try{var e9=CCSON.etat();r.son={total:e9.total,decodes:e9.decodes,tardifs:e9.tardifs,perdus:e9.perdus,banqueTard:e9.banqueTard,banqueFilm:e9.banqueFilm,balise2:document.querySelectorAll('script[src*="sons-banque-2"]').length,fetchBloques:window.__BLOQ||null};}catch(e){}
      try{r.pannes=JSON.parse(localStorage.getItem('cashcarErr')||'[]').filter(function(x){return /panne|erreur|promesse|boucle/.test(x.g);}).map(function(x){return x.g+' '+x.m;}).slice(-8);}catch(e){}
      return r;})()`, 30000);
    sortie = B; if (tot) { tot.menuAvantPret = !!(B.menu && B.boulePrete && B.menu < B.boulePrete); tot.ok = !tot.pretAlors && B.boulePrete > tot.a && B.menu > B.boulePrete; sortie.toucherTot = tot; }
    sortie.etatAuToucher = etatAuToucher;
    if (jouer) sortie.jouer = jouer; if (fond) sortie.fond = fond;
  } catch (e) { sortie.echec = String(e && e.message || e); }
  sortie.erreurs = erreurs; sortie.cpu = CPU; sortie.q = A.q || '';
  console.log(JSON.stringify(sortie, null, 1));
  c.close(); tueChrome(ch); srv.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
