/* LE PRÉ-BÂTI DE JADE AU PROCESSEUR BRIDÉ (2026-11-17, lot JADEPREBATI — Sacha : « quelques freezes sur la map jade »).
   node outils/banc-jade/prebati-bride.cjs <racine abs> <port> <cdp> <sortie.json> [q=…] [bride=10] [avant=1] [graine=7]
   Chrome sans fenêtre, muet, téléphone émulé (tel=1, profil iPhone14,2), boîte de vol allumée (perfrec=2 : P, G, Q).
   1) COURSE 1 (nuages) : le moteur monté de `avant`×8 paliers (dbgMoteur), 12 s de route, puis l'explosion — la vitesse du pré-bâti (PREB.v) reste celle d'une fin rapide.
   2) COURSE 2 (nuages, la suivante imposée : jade) : processeur bridé ×`bride` dès le départ. Relevé toutes les 250 ms : dbgPrebati (état, carte, vitesse, cpu).
      Le portail est approché (dbgPortail) pour que la jade se bâtisse d'avance en roulant, puis franchi ; 8 s de jade, puis l'explosion.
   Relève : les tâches longues (PerformanceObserver 'longtask') par phase, les pas du pré-bâti de plus de 20 ms (PREB.pas), la boîte de vol de la course 2
   (P : pré-bâti par image et pire tranche ; Q : les rappels > 8 ms, dont le portail), les exceptions. À lancer sous ~/cash-car/verrou-banc.sh. */
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const [root,port,cdp,out]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]];
const opt=function(k,d){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):d;};
const prof=opt('prof','0')==='1',profdep=opt('profdep','0')==='1',q=opt('q',''),bride=+opt('bride','10'),avant=+opt('avant','1'),graine=opt('graine','7');
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.wasm':'application/wasm','.glb':'model/gltf-binary','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.webp':'image/webp','.ktx2':'image/ktx2'};
const srv=http.createServer(function(rq,rs){const u=decodeURIComponent(rq.url.split('?')[0]);if(u.endsWith('sw.js')){rs.writeHead(404);return rs.end();}const f=path.join(root,u);
  fs.readFile(f,function(e,d){if(e){rs.writeHead(404);return rs.end();}rs.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});rs.end(d);});}).listen(port,'127.0.0.1');
const udd=path.join(require('os').tmpdir(),'banc-jadeprebati-'+port);
const ch=spawn(process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--remote-debugging-port='+cdp,'--user-data-dir='+udd,'--no-first-run','--window-size=844,390','--enable-unsafe-swiftshader','about:blank'],{detached:true,stdio:'ignore'});
const fin=function(code){try{process.kill(-ch.pid,'SIGKILL');}catch(e){}try{fs.rmSync(udd,{recursive:true,force:true});}catch(e){}srv.close();process.exit(code||0);};
process.on('SIGINT',function(){fin(1);});setTimeout(function(){console.log('délai dépassé');R.delai=1;try{fs.writeFileSync(out,JSON.stringify(R,null,1));}catch(e){}fin(2);},13*60*1000);
const dodo=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
const R={q:q,bride:bride,exc:[],con:[],suivi:[],phases:{}};
(async function(){let l=null;for(let i=0;i<120&&!l;i++){await dodo(500);try{l=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();if(!l.find(function(x){return x.type==='page';}))l=null;}catch(e){}}
  const pg=l.find(function(x){return x.type==='page';}),ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const P={};
  const call=function(m,p){return new Promise(function(r){const i=++id;P[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});};
  ws.onmessage=function(e){const m=JSON.parse(e.data);if(m.id&&P[m.id]){P[m.id](m.result);delete P[m.id];return;}
    if(m.method==='Runtime.exceptionThrown'){const d=m.params.exceptionDetails;R.exc.push(((d.exception||{}).description||d.text||'').slice(0,600));}
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')R.con.push(m.params.args.map(function(a){return a.value||a.description;}).join(' ').slice(0,300));};
  await new Promise(function(r){ws.onopen=r;});await call('Runtime.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
  await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});
  await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"+
    "window.__lt=[];try{new PerformanceObserver(function(l){for(const e of l.getEntries())window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]);}).observe({type:'longtask',buffered:true});}catch(e){}"});
  await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/VERSION%20PRINCIPALE/index.html?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&perfrec=2&carte=nuages&pistegraine='+graine+(q?'&'+q:'')});
  const ev=async function(x,aw){const r=await call('Runtime.evaluate',{expression:x,awaitPromise:!!aw,returnByValue:true,timeout:300000});return r&&r.result?r.result.value:null;};
  const etat='(function(){try{const p=dbgPrebati(),d=dbgState();return {t:Math.round(performance.now()),st:d.started,go:d.gameOver,mode:d.mode,pi:(dbgNiveau()||{}).lieu,e:p.etat,c:p.carte,v:p.v,reste:p.reste,cpu:p.cpu,img:p.images,tenus:p.tenusSousVoile,msVoile:p.msSousVoile,der:p.der,pas:p.pasLongs.length};}catch(e){return "erreur "+e.message;}})()';
  for(let i=0;i<120;i++){await dodo(1500);if(await ev('!!window.__gameReady'))break;}
  await dodo(4000);await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}})()");
  for(let i=0;i<60;i++){if(await ev('!!(window.dbgJouer&&window.dbgClassique)'))break;await dodo(500);}
  await dodo(8000);
  /* COURSE 1 */
  const part=async function(){for(let k=0;k<3;k++){await ev("try{dbgClassique('nuages');}catch(e){}dbgJouer()");try{await ev('dbgImmortel(true)');}catch(e){}let ok=false;for(let i=0;i<80&&!ok;i++){await dodo(500);ok=await ev('!!(window.dbgState&&dbgState().started&&dbgState().running&&!dbgState().gameOver)');}if(ok)return true;}return false;};
  R.c1=await part();R.phases.c1=await ev('Math.round(performance.now())');
  for(let k=0;k<avant*8;k++){await ev('try{dbgMoteur()}catch(e){}');await dodo(150);}
  for(let i=0;i<48;i++){await dodo(250);R.suivi.push(Object.assign({ph:'c1'},await ev(etat)));}
  R.vFin1=(R.suivi[R.suivi.length-1]||{}).v;R.prelie1=await ev('JSON.stringify(window.dbgPrelie?dbgPrelie():null)');
  await ev('dbgImmortel(false);dbgBoom()');for(let i=0;i<40;i++){await dodo(250);const e=await ev(etat);R.suivi.push(Object.assign({ph:'mort'},e));if(e&&e.go)break;}
  await dodo(5000);R.vMenu=await ev('dbgPrebati().v');
  /* COURSE 2 : bridée dès le départ */
  await call('Emulation.setCPUThrottlingRate',{rate:bride});R.phases.bride=await ev('Math.round(performance.now())');
  if(profdep){await call('Profiler.enable');await call('Profiler.setSamplingInterval',{interval:500});await call('Profiler.start');}
  R.c2=await part();R.phases.c2=await ev('Math.round(performance.now())');
  await ev("try{dbgClassique('jade');}catch(e){}");
  for(let i=0;i<48;i++){await dodo(250);R.suivi.push(Object.assign({ph:'c2-depart'},await ev(etat)));}
  if(profdep){const pr=await call('Profiler.stop');fs.writeFileSync(out.replace(/\.json$/,'')+'-dep.cpuprofile',JSON.stringify(pr.profile));}
  R.prelie=await ev('JSON.stringify(window.dbgPrelie?dbgPrelie():null)');
  /* le portail approché : la jade se bâtit d'avance en roulant (20 s de route avant le portail) */
  if(prof){await call('Profiler.enable');await call('Profiler.setSamplingInterval',{interval:500});await call('Profiler.start');R.phases.prof0=await ev('Math.round(performance.now())');}
  R.portail=await ev('JSON.stringify(dbgPortail(1400))');
  let entre=false;for(let i=0;i<600&&!entre;i++){await dodo(250);const e=await ev(etat);R.suivi.push(Object.assign({ph:'c2-approche'},e));if(e&&e.pi==='jade')entre=true;if(e&&e.e==='pret'&&i%8===0&&e.reste>12)await ev('dbgPortail(Math.max(300,'+Math.round((e.v||60)*3)+'))');}
  R.phases.jade=await ev('Math.round(performance.now())');R.entre=entre;
  await dodo(1500);R.empreinte=await ev('JSON.stringify(window.dbgJadeEmpreinte?dbgJadeEmpreinte():null)');
  for(let i=0;i<40;i++){await dodo(250);R.suivi.push(Object.assign({ph:'c2-jade'},await ev(etat)));}
  if(prof){const pr=await call('Profiler.stop');fs.writeFileSync(out.replace(/\.json$/,'')+'.cpuprofile',JSON.stringify(pr.profile));R.phases.prof1=await ev('Math.round(performance.now())');}
  R.phases.finJade=await ev('Math.round(performance.now())');
  R.prebati=await ev('JSON.stringify(dbgPrebati())');try{R.prebati=JSON.parse(R.prebati);}catch(e){}
  R.jtr=await ev('JSON.stringify(window.__jpbTr||null)');try{R.jtr=JSON.parse(R.jtr);}catch(e){}
  await ev('dbgImmortel(false);dbgBoom()');await dodo(6000);
  R.lt=await ev('window.__lt');
  R.bv=await ev('JSON.stringify((function(){const a=dbgBoiteVol("tout");const c=a[a.length-1];return c?{d:c.d,dur:c.dur,cartes:c.cartes,S:c.S,P:c.P,L:c.L,Q:c.Q,G:c.G,GN:c.GN}:null;})())');try{R.bv=JSON.parse(R.bv);}catch(e){}
  R.erreurs=await ev('JSON.stringify(window.dbgErreurs?dbgErreurs():null)');
  fs.writeFileSync(out,JSON.stringify(R,null,1));
  console.log('écrit',out);fin(0);
})().catch(function(e){console.error(e);R.err=String(e&&e.stack||e);try{fs.writeFileSync(out,JSON.stringify(R,null,1));}catch(x){}fin(3);});
