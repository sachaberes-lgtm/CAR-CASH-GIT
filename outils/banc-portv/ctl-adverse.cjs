/* (2026-11-17, lot portv, 2e tour) LE BANC DU CONTRÔLE ADVERSE, gardé tel qu'il a été écrit (copié du bloc-notes de la session de contrôle).
   ⚠ Il ne tourne pas tel quel : il lit des noms internes du jeu (prebPart, PREB, GRT_VUS, renderer, togglePause, mode…) qui vivent dans la grande fonction
   (voir CLAUDE.md : « rien n'est global ») et ne sont pas visibles depuis la page, et il chemine vers l'ancien worktree. Sa version qui tourne, par les crochets dbg*
   (dbgRouteVerif avec ?routeverif=1, dbgPortvCas, dbgPortvEtale) et avec les cas en plus : outils/banc-portv/vivant.cjs. */
/* contrôle adverse portv : route bâtie en course = route d'un trait ; fuites ; cas tordus. node ctl.cjs <out.json> [q] [bride] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('/Users/sachaberes/cash-car/qualite-portv/outils/banc-trainees/cdp.cjs');
const OUT = process.argv[2], Q = process.argv[3] || '', BRIDE = +(process.argv[4] || 1);
const R = { q: Q, bride: BRIDE, routes: [], fuite: [], cas: [], exc: [], con: [] };
const ecrit = () => fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
const INJ = `
window.__rt=[];window.__bus=[];
(function(){const h0=0x811c9dc5;
 window.__fnv=function(h,a){const u=new Uint32Array(a.buffer,a.byteOffset,a.byteLength>>2);for(let i=0;i<u.length;i++)h=Math.imul(h^u[i],16777619);return h>>>0;};
 window.__hW=function(W){const f=new Float64Array(3);let h=__fnv(h0,Float64Array.of(W.L,W.NP));for(const A of [W.pts,W.T,W.Nn,W.B])for(const v of A){f[0]=v.x;f[1]=v.y;f[2]=v.z;h=__fnv(h,f);}
   const mk=JSON.stringify((W.tab.MODMARK||[]).map(function(m){return [m.i0,m.i1,m.fig||null];}));for(let i=0;i<mk.length;i++)h=Math.imul(h^mk.charCodeAt(i),16777619)>>>0;return h.toString(36);};
 window.__hV=function(){const f=new Float64Array(3);let h=__fnv(h0,Float64Array.of(L,NP));for(const A of [pts,T,Nn,B])for(const v of A){f[0]=v.x;f[1]=v.y;f[2]=v.z;h=__fnv(h,f);}
   const mk=JSON.stringify((MODMARK||[]).map(function(m){return [m.i0,m.i1,m.fig||null];}));for(let i=0;i<mk.length;i++)h=Math.imul(h^mk.charCodeAt(i),16777619)>>>0;return h.toString(36);};
})();`;
const POSE = `(function(){if(window.__pose)return 'deja';window.__pose=1;const o=prebPart;
 window.prebPart=function(c){const vus=(typeof GRT_VUS!=='undefined')?GRT_VUS.map(function(a){return a.slice();}):null;const r=o.apply(this,arguments);
  try{if(PREB.W&&!PREB.dep){const W2=pisteTravail(c),g=pisteRoute(PREB.sd,W2);let fini=false;const l0=JF.lim;
    while(!fini)prebAvec(W2,function(){JF.lim=Infinity;try{do{fini=g.next().done;}while(!fini);}finally{JF.lim=l0;}});
    for(const m of W2.tab.trackMeshes||[])if(m.geometry)m.geometry.dispose();
    if(vus){GRT_VUS.length=0;for(const a of vus)GRT_VUS.push(a.slice());}
    window.__rt.push({t:Math.round(performance.now()),carte:c.t.carte,meteo:c.t.meteo,sd:PREB.sd,eng:W2.eng,dunTrait:__hW(W2),W:PREB.W});}}catch(e){window.__rt.push({err:String(e.stack||e).slice(0,300)});}
  return r;};return 'ok';})()`;
(async () => {
  let P_HTTP = 9611 + Math.floor(Math.random() * 50), P_CDP = P_HTTP + 1; while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP)) P_CDP += 2;
  const srv = await serveur('/Users/sachaberes/cash-car/qualite-portv/VERSION PRINCIPALE', P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = (code) => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} ecrit(); process.exit(code || 0); };
  setTimeout(() => { R.delai = 1; console.log('délai'); fin(2); }, 40 * 60 * 1000);
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; R.exc.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) R.con.push(m.params.type + ' ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  await c.send('Runtime.enable'); await c.send('Page.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}" + INJ });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&carte=nuages&pistegraine=7${Q ? '&' + Q : ''}` });
  const ev = (x, ms) => c.ev(x, ms || 180000);
  for (let i = 0; i < 200; i++) { await dormir(1500); try { if (await ev('!!window.__gameReady')) break; } catch (e) {} }
  await dormir(3000); await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()");
  for (let i = 0; i < 60; i++) { if (await ev('!!(window.dbgJouer&&window.dbgClassique)')) break; await dormir(500); }
  await dormir(4000);
  console.log('pose', await ev(POSE));
  const depart = async () => { await ev("try{dbgClassique('nuages');}catch(e){}dbgJouer();1");
    for (let i = 0; i < 80; i++) { await dormir(500); if (await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)')) break; }
    await ev('dbgImmortel(true);1'); };
  await depart();
  if (BRIDE > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: BRIDE });
  const mem = () => ev('JSON.stringify({g:renderer.info.memory.geometries,t:renderer.info.memory.textures,p:(renderer.info.programs||[]).length,lieu:(dbgNiveau()||{}).lieu,lib:(typeof PVE!=="undefined")?PVE.lib.length:null,ap:(typeof PVE!=="undefined")?PVE.apres.length:null})').then(JSON.parse);
  /* un portail : cible imposée, pré-bâti fini, passage ; piege = action pendant l'étalement */
  const portail = async (cible, piege) => {
    await ev(`window.__ev2=[];document.addEventListener('cc:portail',function f(){document.removeEventListener('cc:portail',f);window.__ev2.push(['portail',Math.round(performance.now())]);
      const P=${JSON.stringify(piege || '')};if(!P)return;let n=0;const t=function(){n++;const ph=(typeof PVE!=='undefined')?PVE.ph:0;
        if((ph>0&&ph<3)||n>40){window.__ev2.push(['piege',P,ph,n,Math.round(performance.now())]);
          try{if(P==='quitte'){togglePause();window.__ev2.push(['quitte',dbgQuitte()]);}
          else if(P==='pause'){togglePause();setTimeout(function(){togglePause();window.__ev2.push(['reprise',Math.round(performance.now())]);},1500);}
          else if(P==='cache'){Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));setTimeout(function(){Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));window.__ev2.push(['visible',Math.round(performance.now())]);},1200);}
          else if(P==='proche'){window.__ev2.push(['proche-pose']);}
          }catch(e){window.__ev2.push(['err',String(e)]);}return;}setTimeout(t,4);};setTimeout(t,0);});try{dbgClassique('${cible}');}catch(e){}1`);
    const r0 = await ev('__rt.length');
    await ev('dbgPortail(1400);1');
    let ok = false;
    for (let i = 0; i < 1200; i++) { await dormir(250); const e = await ev('(function(){const p=dbgPrebati();return {e:p.etat,c:p.carte,r:p.reste};})()');
      if (e.e === 'pret' && e.c === cible) { ok = true; break; } }
    const lieu0 = await ev('(dbgNiveau()||{}).lieu');
    const info = { cible, piege, pret: ok };
    if (ok) { info.rt = await ev(`(function(){const x=__rt[__rt.length-1];if(!x||__rt.length<=${r0})return null;return {carte:x.carte,meteo:x.meteo,sd:x.sd,eng:x.eng,dunTrait:x.dunTrait,enCourse:__hW(x.W),egales:x.dunTrait===__hW(x.W),err:x.err};})()`); }
    await ev('dbgPortail(250);1');
    for (let i = 0; i < 400; i++) { await dormir(200); const p = await ev("(window.__ev2.find(function(x){return x[0]==='portail';})||[0])[1]||0"); if (p) { info.tp = p; break; } }
    await dormir(piege ? 4500 : 2500);
    info.ev2 = await ev('JSON.stringify(window.__ev2)').then(JSON.parse);
    info.etat = await ev('(function(){const d=dbgState();return {st:d.started,go:d.gameOver,run:d.running,mode:typeof mode!=="undefined"?mode:null,paused:typeof paused!=="undefined"?paused:null,lieu:(dbgNiveau()||{}).lieu,att:PORTV.att,voile:(document.getElementById("portVoile")||{}).className||null,pve:(typeof PVE!=="undefined")?PVE.ph:null,s:Math.round(s),L:Math.round(L)};})()');
    if (info.etat.st && !info.etat.go && info.etat.lieu !== lieu0) info.routeInstallee = await ev('__hV()');
    info.etale = await ev('JSON.stringify(typeof dbgPortvEtale==="function"?dbgPortvEtale():null)').then(JSON.parse);
    info.pv = await ev('JSON.stringify(typeof dbgPortv==="function"?(function(){const d=dbgPortv();return {trMx:d.trMx,der:d.l[d.l.length-1]};})():null)').then(JSON.parse);
    info.mem = await mem();
    console.log(JSON.stringify({ cible, piege, pret: ok, rt: info.rt, inst: info.routeInstallee, etat: info.etat }));
    return info;
  };
  R.fuite.push(Object.assign({ avant: 1 }, await mem()));
  /* 1) routes bâties EN COURSE (tranches + jeu vivant entre deux) contre d'un trait, et la mémoire GPU portail après portail */
  for (const cible of ['grotte', 'jade', 'ville', 'nuages', 'grotte', 'jade', 'ville']) { const P = await portail(cible); R.routes.push(P); R.fuite.push(Object.assign({ apres: cible }, P.mem)); ecrit(); }
  await dormir(3000); R.fuite.push(Object.assign({ fin: 1 }, await mem()));
  /* 2) cas tordus pendant l'étalement */
  for (const [cible, piege] of [['grotte', 'pause'], ['jade', 'cache'], ['ville', 'quitte']]) {
    const P = await portail(cible, piege); R.cas.push(P); ecrit();
    if (piege === 'quitte') { await dormir(3000); P.apresQuitte = await ev('(function(){const d=dbgState();return {st:d.started,go:d.gameOver,mode:mode,pve:PVE.ph,att:PORTV.att};})()');
      await depart(); await dormir(4000); P.nouvelle = await ev('(function(){const d=dbgState();return {st:d.started,go:d.gameOver,run:d.running,mode:mode,pve:PVE.ph,lieu:(dbgNiveau()||{}).lieu,s:Math.round(s),L:Math.round(L)};})()'); ecrit(); }
  }
  /* 3) deux portails rapprochés : le 2e pris tout de suite après l'ouverture du voile */
  { const P = await portail('grotte'); await ev('dbgPortail(120);1'); await dormir(5000);
    P.second = await ev('(function(){const d=dbgState();return {st:d.started,go:d.gameOver,mode:mode,pve:PVE.ph,lieu:(dbgNiveau()||{}).lieu,lib:PVE.lib.length,ap:PVE.apres.length,att:PORTV.att};})()'); R.cas.push(Object.assign({ rapproches: 1 }, P)); }
  R.erreurs = await ev('JSON.stringify(window.dbgErreurs?dbgErreurs():null)').catch(() => null);
  ecrit(); console.log('fin'); fin(0);
})().catch(e => { console.error(e); R.err = String(e && e.stack || e); ecrit(); process.exit(3); });
