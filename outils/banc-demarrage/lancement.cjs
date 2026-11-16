// LE BANC DU LANCEMENT (2026-11-13, demarrage-vite) — d'après outils/banc-interface/banc.cjs.
// Un lancement du vrai jeu, dans un Chrome sans fenêtre et MUET (390×844 ×2, iPhone, ?tel=1&introapres=1 = le chemin du téléphone :
// tout le travail avant le film, puis le film, puis le menu). Relève, depuis la 1re ligne de la page :
//   · les notes de la boîte noire (chargement, attente, serpent, intro) avec leur instant ;
//   · les tâches longues (PerformanceObserver longtask) et les trous entre images (rAF > 50 ms), rangés par phase :
//     AVANT « prêt » (sous le serpent), FILM (de « prêt » à l'ouverture du menu), MENU (les 10 s qui suivent) ;
//   · les étapes du chargement (dbgChargement), la liaison (dbgLier), la chauffe (dbgChauffe), la file des photos.
// Usage : node outils/banc-demarrage/lancement.cjs [--q "sans=x"] [--froid 1] [--cpu 4] [--http 9921 --cdp 9922] [--photo /chemin.png] [--menu 10]
//   --froid 1 : profil Chrome neuf (aucun programme en cache) ; sinon le profil du banc est réutilisé (cache chaud).
//   --cpu 4   : processeur ralenti ×4 (≈ un iPhone chaud) pendant tout le lancement.
// Sortie : un JSON sur la sortie standard.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9921), P_CDP = +(A.cdp || 9922);
const PROF = A.froid ? fs.mkdtempSync(path.join(os.tmpdir(), 'banc-demarrage-froid-')) : path.join(os.tmpdir(), 'banc-demarrage-profil');
const W = 390, H = 844, CPU = +(A.cpu || 1), MENU_S = +(A.menu || 10);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
/* la sonde du lancement : posée AVANT la 1re ligne du jeu */
const SONDE = `(function(){
  var B=window.__BD={notes:[],lt:[],trous:[],rev:0,img:0};var now=function(){return performance.now();};
  try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){B.lt.push([Math.round(e.startTime),Math.round(e.duration)]);});}).observe({entryTypes:['longtask']});}catch(e){}
  var raf=window.requestAnimationFrame.bind(window),p=0;(function c(t){B.img++;if(p&&t-p>50)B.trous.push([Math.round(p),Math.round(t-p)]);p=t;raf(c);})();
  document.addEventListener('cc:revele',function(){if(!B.rev)B.rev=Math.round(now());});
  var f=null;Object.defineProperty(window,'__ccNote',{configurable:true,get:function(){return f;},set:function(v){f=function(g,m,x){try{B.notes.push([Math.round(now()),g,String(m).slice(0,400)]);}catch(e){}return v.apply(this,arguments);};}});
})();`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  let sortie = {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}\n' + SONDE });
    if (CPU > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?tel=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    let rev = 0; const T0 = Date.now(), ETATS = [];
    /* chaque seconde : où en est le chargement (ce que la boule attend) ; le film fini, le logo attend un toucher : on touche */
    const ETAT = `(function(){try{var c=dbgChargement(),l=dbgLier(),h=dbgChauffe(),p=dbgPrebati();return Math.round(performance.now()/100)/10+' s · étapes '+(c.fini?'ok':c.reste.length)+' · lier '+l.demarrage+'/'+l.enCours+' · atelier '+(h.atelier?1:0)+' divers '+h.divers+' moteurs '+h.moteurs+'/'+h.sur+' rendu '+(h.rendu?1:0)+' tôles '+h.apres+' · préb '+(p.etat||'-')+' '+p.ms+' ms'+(p.dep?' dep':'')+' · photos '+dbgPhotoFile().file+(window.__introPause?' · PAUSE':'');}catch(e){return 'x '+e.message;}})()`;
    for (let i = 0; i < 400; i++) { await dormir(1000);
      try { rev = await c.ev('(window.__BD&&__BD.rev)|0', 8000); if (rev) break; ETATS.push(await c.ev(ETAT, 8000));
        if (await c.ev("!!(window.__BD&&__BD.notes.some(function(n){return /prêt en/.test(n[2]);}))&&!!window.__ccIntroAuto&&__ccIntroAuto.lance()&&performance.now()-__BD.notes.filter(function(n){return /prêt en/.test(n[2]);})[0][0]>9000", 8000))
          await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      } catch (e) {} if (Date.now() - T0 > 170000) break; }
    await dormir(MENU_S * 1000);
    const B = await c.ev(`(function(){var B=__BD,pret=0,n=B.notes;for(var i=0;i<n.length;i++)if(n[i][1]==='chargement'&&/prêt en/.test(n[i][2])){pret=n[i][0];break;}
      var rev=B.rev||1e9,ph=function(t){return t<pret?'avant':t<rev?'film':'menu';},L={avant:[],film:[],menu:[]},TR={avant:[],film:[],menu:[]};
      B.lt.forEach(function(x){if(pret)L[ph(x[0])].push(x);});B.trous.forEach(function(x){if(pret)TR[ph(x[0])].push(x);});
      var som=function(a){var s=0;a.forEach(function(x){s+=x[1];});return s;};
      var r={pret:pret,menu:B.rev,images:B.img,
        longues:{avant:{n:L.avant.length,ms:som(L.avant),pire:Math.max.apply(0,[0].concat(L.avant.map(function(x){return x[1];})))},film:{n:L.film.length,ms:som(L.film),liste:L.film},menu:{n:L.menu.length,ms:som(L.menu),liste:L.menu}},
        trous:{avant:{n:TR.avant.length,pire:Math.max.apply(0,[0].concat(TR.avant.map(function(x){return x[1];})))},film:{n:TR.film.length,liste:TR.film},menu:{n:TR.menu.length,liste:TR.menu}},
        notes:n.filter(function(x){return /chargement|attente|intro|serpent|panne|erreur/.test(x[1]);}).map(function(x){return (x[0]/1000).toFixed(1)+' '+x[1]+' | '+x[2];})};
      try{r.chargement=dbgChargement().ms;}catch(e){}try{r.dense=dbgDense();}catch(e){}try{var p9=dbgPrebati();r.preb={carte:p9.carte,ms:p9.ms,cpu:p9.cpu,images:p9.images,pasLongs:p9.pasLongs,prisAuDepart:p9.prisAuDepart};}catch(e){}try{r.lier=dbgLier();delete r.lier.attendus;}catch(e){}try{r.chauffe=dbgChauffe();}catch(e){}try{r.photos=dbgPhotoFile();}catch(e){}
      try{r.cartes=[].slice.call(document.querySelectorAll('img')).filter(function(i){return /^blob:|^data:/.test(i.src)&&i.getBoundingClientRect().width>0;}).length;}catch(e){}
      return r;})()`, 30000);
    sortie = B; sortie.etats = ETATS;
    /* --suite 1 : après le menu, ouvrir le GARAGE (la bande et ses photos), puis une COURSE (dbgJouer) */
    if (A.suite) { const S = {};
      await c.ev("(function(){var b=document.querySelector('#mDuo .mvGar')||document.querySelector('[data-m=garage]');if(b)b.click();return !!b;})()");
      await dormir(7000);
      S.garage = await c.ev("(function(){var st=document.getElementById('gStrip');if(!st)return 'pas de bande';var T=[].slice.call(st.querySelectorAll('.gT')),vu=function(e){var r=e.getBoundingClientRect();return r.width>0&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;};var V=T.filter(vu);return {cartes:T.length,enVue:V.length,photosEnVue:V.filter(function(e){return !!e.querySelector('img');}).length,photosHorsVue:T.filter(function(e){return !vu(e)&&!!e.querySelector('img');}).length,file:dbgPhotoFile().file,garageOn:!!document.querySelector('#garage')};})()");
      if (A.photo) { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(A.photo.replace(/\.png$/, '-garage.png'), Buffer.from(sh.data, 'base64')); }
      /* l'INVENTAIRE : la bande en grand — ses photos arrivent-elles, en vue, une à une ? (relevé toutes les secondes) */
      await c.ev("(function(){var L=[].slice.call(document.querySelectorAll('#garage button,#garage [role=button]')).filter(function(e){return /INVENTAIRE/.test(e.textContent)&&e.getBoundingClientRect().width>0;});if(L[0])L[0].click();return L.length;})()");
      await dormir(1500); await c.ev("(function(){var b=[].slice.call(document.querySelectorAll('[data-tab=voiture],[data-cat=voiture]')).filter(function(e){return e.getBoundingClientRect().width>0;})[0];if(b)b.click();return !!b;})()");
      const lt9 = await c.ev('__BD.lt.length'); S.inventaire = [];
      for (let i = 0; i < 8; i++) { await dormir(1000); S.inventaire.push(await c.ev("(function(){var T=[].slice.call(document.querySelectorAll('#gStrip .gT')),vu=function(e){var r=e.getBoundingClientRect();return r.width>0&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;};var V=T.filter(vu);return V.filter(function(e){return !!e.querySelector('img');}).length+'/'+V.length+' en vue';})()")); }
      S.longuesInventaire = await c.ev('__BD.lt.slice(' + lt9 + ')');
      if (A.photo) { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(A.photo.replace(/\.png$/, '-inventaire.png'), Buffer.from(sh.data, 'base64')); }
      const lt0 = await c.ev('__BD.lt.length');
      for (let i = 0; i < 60; i++) { if (i % 10 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(1000); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { S.course = 'en course après ' + (i + 1) + ' s'; break; } } catch (e) {} }
      await dormir(5000);
      S.courseEtat = await c.ev("(function(){var s=dbgState();return {started:s.started,running:s.running,gameOver:s.gameOver,kmh:Math.round(s.speedKmh||s.kmh||0)};})()").catch(e => String(e));
      S.longuesCourse = await c.ev('__BD.lt.slice(' + lt0 + ')');
      S.pannes = await c.ev("(function(){try{return JSON.parse(localStorage.getItem('cashcarErr')||'[]').filter(function(x){return /panne|erreur|promesse|boucle/.test(x.g);}).map(function(x){return x.g+' '+x.m;}).slice(-8);}catch(e){return String(e);}})()");
      sortie.suite = S; }
    if (A.photo) { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(A.photo, Buffer.from(sh.data, 'base64')); }
  } catch (e) { sortie.echec = String(e && e.message || e); }
  sortie.erreurs = erreurs; sortie.cpu = CPU; sortie.froid = !!A.froid; sortie.q = A.q || '';
  console.log(JSON.stringify(sortie, null, 1));
  c.close(); tueChrome(ch); srv.close();
  if (A.froid) try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
