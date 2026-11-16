/* LE BANC DES VERBES DANS LE VRAI JEU (2026-11-16) : Chrome headless muet, Jade avec `?jade=avatar`, la vallée bâtie ; lit dbgJadeAv, dbgJadeA, l'audit du couloir
   et la règle d'or, puis photographie chaque scène (vue derrière la caisse, haut) — rien n'est écrit dans le dépôt hors du dossier de sortie.
   node outils/banc-jade/verbes-jeu.cjs <racine abs> <port> <cdp> "<q>" <dossier de sortie> [photos=1]
   q : ex. "pistegraine=3&meteo=midi&jscene=gouffre" ; ajouter tel=1 pour le téléphone (ALLEGE). Sorties : <dossier>/<étiquette>.json et .png */
const http=require('http'),fs=require('fs'),path=require('path'),{spawn,execSync}=require('child_process');
const [root,port,cdp,q,out,ph]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]||'',process.argv[6],process.argv[7]!=='photos=0'];
fs.mkdirSync(out,{recursive:true});const tag=q.replace(/[^a-z0-9=,]+/gi,'_').replace(/=/g,'-').slice(0,90);
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.wasm':'application/wasm','.glb':'model/gltf-binary','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.webp':'image/webp','.ktx2':'image/ktx2'};
const srv=http.createServer(function(rq,rs){const u=decodeURIComponent(rq.url.split('?')[0]);if(u.endsWith('sw.js')){rs.writeHead(404);return rs.end();}const f=path.join(root,u);
  fs.readFile(f,function(e,d){if(e){rs.writeHead(404);return rs.end();}rs.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});rs.end(d);});}).listen(port,'127.0.0.1');
const udd=path.join(require('os').tmpdir(),'banc-verbes-'+port);
const ch=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--mute-audio','--remote-debugging-port='+cdp,'--user-data-dir='+udd,'--no-first-run','--window-size=1280,800','--use-angle=d3d11','--enable-unsafe-swiftshader','about:blank']);
const fin=function(code){try{execSync('taskkill /F /T /PID '+ch.pid,{stdio:'ignore'});}catch(e){}srv.close();process.exit(code||0);};
const dodo=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
const R={q:q,exc:[],con:[]};
(async function(){let l=null;for(let i=0;i<360&&!l;i++){await dodo(500);try{l=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();if(!l.find(function(x){return x.type==='page';}))l=null;}catch(e){}}
  const pg=l.find(function(x){return x.type==='page';}),ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const P={};
  const call=function(m,p){return new Promise(function(r){const i=++id;P[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});};
  ws.onmessage=function(e){const m=JSON.parse(e.data);if(m.id&&P[m.id]){P[m.id](m.result);delete P[m.id];return;}
    if(m.method==='Runtime.exceptionThrown'){const d=m.params.exceptionDetails;R.exc.push(((d.exception||{}).description||d.text||'').slice(0,600));}
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')R.con.push(m.params.args.map(function(a){return a.value||a.description;}).join(' ').slice(0,300));};
  await new Promise(function(r){ws.onopen=r;});await call('Runtime.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
  if(/tel=1/.test(q)){await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&chute=0&carte=jade&jade=avatar'+(/tel=1/.test(q)?'':'&colonne=0')+'&'+q});
  const ev=async function(x,aw){const r=await call('Runtime.evaluate',{expression:x,awaitPromise:!!aw,returnByValue:true,timeout:300000});return r&&r.result?r.result.value:null;};
  for(let i=0;i<120;i++){await dodo(1500);if(await ev('!!window.__gameReady'))break;}
  await dodo(4000);await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}})()");
  for(let i=0;i<60;i++){if(await ev('!!(window.dbgJouer&&window.dbgClassique)'))break;await dodo(500);}
  const m9=(/[?&]meteo=(\w+)/.exec(q)||[])[1];
  for(let k=0;k<3;k++){await ev("try{dbgClassique('jade',"+(m9?"'"+m9+"'":'null')+");}catch(e){}dbgJouer()");try{await ev('dbgImmortel(true)');}catch(e){}let ok=false;for(let i=0;i<80&&!ok;i++){await dodo(500);ok=await ev('!!(window.dbgState&&dbgState().started&&dbgState().running&&LVL.cur&&LVL.cur.piste==="jade")');}if(ok)break;}
  /* la vallée posée : JADE.root et les familles (jadeBatit est un générateur : jusqu'à 2 min sur une machine chargée) */
  for(let i=0;i<160;i++){if(await ev('!!(typeof JADE!=="undefined"&&JADE.root&&JADE.col&&JADE.av!==undefined)'))break;await dodo(750);}
  await dodo(3000);
  R.av=await ev('JSON.stringify(dbgJadeAv())');try{R.av=JSON.parse(R.av);}catch(e){}
  R.a3=await ev('JSON.stringify(dbgJadeA())');try{R.a3=JSON.parse(R.a3);}catch(e){}
  R.regle=await ev('JSON.stringify(dbgJadeRegle())');try{R.regle=JSON.parse(R.regle);}catch(e){}
  R.audit=await ev('(function(){try{const a=dbgJadeAudit();return JSON.stringify(a&&{couloir:a.couloir,frole:a.frole,panneaux:a.panneaux,flottants:a.flottants,cascades:a.cascades,temoin:a.temoin});}catch(e){return "erreur "+e.message;}})()');try{R.audit=JSON.parse(R.audit);}catch(e){}
  R.jade=await ev('(function(){try{const j=dbgJade();return JSON.stringify({triangles:j.triangles,appels:j.appels,montagnes:j.montagnes,cascades:j.cascades,err:j.err});}catch(e){return "erreur "+e.message;}})()');try{R.jade=JSON.parse(R.jade);}catch(e){}
  R.jadeErr=await ev('window.__jadeErr?String(window.__jadeErr.stack||window.__jadeErr).slice(0,600):null');
  R.photos=[];
  if(ph&&R.av&&R.av.s)for(const sc of R.av.s){const [nom,s0,s1]=sc;if(s1<=s0)continue;
    for(const u of [.15,.55]){const s=Math.round(s0+(s1-s0)*u);await ev('dbgImmortel(true);dbgJadeAller('+s+')');await dodo(2500);
      for(const v of ['route','large']){await ev(v==='route'?'dbgJadeVue(null,0,16)':'dbgJadeAvVue('+s+',-130,60,100)');await dodo(1200);
      const im=await call('Page.captureScreenshot',{format:'png'});const f=path.join(out,tag+'-'+nom+'-'+s+'-'+v+'.png');fs.writeFileSync(f,Buffer.from(im.data,'base64'));R.photos.push(path.basename(f));}}
    await ev('if(paused)togglePause()');}
  R.exc2=R.exc.length;
  fs.writeFileSync(path.join(out,tag+'.json'),JSON.stringify(R,null,1));
  console.log(JSON.stringify({q:q,exc:R.exc.slice(0,3),con:R.con.slice(0,3),jadeErr:R.jadeErr,scenes:R.av&&R.av.s,n:R.av&&R.av.n,refus:R.av&&R.av.refus,poses:R.av&&R.av.poses&&R.av.poses.filter(function(p){return !p.ok;}).length+'/'+(R.av.poses||[]).length+' refusées',regle:R.regle,audit:R.audit,jade:R.jade,photos:R.photos.length}));
  fin(0);})().catch(function(e){console.log('ERR',e.message);fin(1);});
setTimeout(function(){console.log('ERR délai');fin(1);},15*60*1000);
