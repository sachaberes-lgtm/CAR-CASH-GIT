/* sonde : sert un worktree, ouvre la page en headless (CDP), imprime erreurs et console pendant N s, puis s'arrête */
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const [root,port,cdp,q,secs]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]||'',+(process.argv[6]||60)];
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.wasm':'application/wasm','.glb':'model/gltf-binary','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.webp':'image/webp','.ktx2':'image/ktx2'};
const srv=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);if(u.endsWith('sw.js')){rs.writeHead(404);return rs.end();}const f=path.join(root,u);fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);return rs.end();}rs.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});rs.end(d);});}).listen(port,'127.0.0.1');
const udd=path.join(__dirname,'prof-'+port);
const ch=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--mute-audio','--remote-debugging-port='+cdp,'--user-data-dir='+udd,'--no-first-run','--window-size=1280,800','--use-angle=d3d11','--enable-unsafe-swiftshader','about:blank']);
const fin=()=>{try{ch.kill();}catch(e){}srv.close();process.exit(0);};
(async()=>{await new Promise(r=>setTimeout(r,2500));
  const l=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();const pg=l.find(x=>x.type==='page');const ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const P={};
  const call=(m,p)=>new Promise(r=>{const i=++id;P[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&P[m.id]){P[m.id](m.result);delete P[m.id];return;}
    if(m.method==='Runtime.exceptionThrown')console.log('EXC',(m.params.exceptionDetails.exception||{}).description||m.params.exceptionDetails.text);
    if(m.method==='Runtime.consoleAPICalled'&&(m.params.type==='error'||m.params.type==='warning'))console.log('CON',m.params.type,m.params.args.map(a=>a.value||a.description).join(' ').slice(0,300));};
  await new Promise(r=>ws.onopen=r);await call('Runtime.enable');if(/tel=1/.test(q)){await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});}await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&carte=jade'+(/tel=1/.test(q)?'':'&colonne=0')+'&'+q});
  const t0=Date.now();while(Date.now()-t0<secs*1000){await new Promise(r=>setTimeout(r,3000));const r=await call('Runtime.evaluate',{expression:'JSON.stringify({ready:!!window.__gameReady,t:performance.now()|0})',returnByValue:true});console.log('…',r&&r.result&&r.result.value);if(r&&r.result&&String(r.result.value).includes('"ready":true'))break;}
  const ev=async(x,aw)=>{const r=await call('Runtime.evaluate',{expression:x,awaitPromise:!!aw,returnByValue:true,timeout:300000});return r&&r.result?r.result.value:JSON.stringify(r);};
  await new Promise(r=>setTimeout(r,8000));await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}})()");
  for(let k=0;k<3;k++){await ev('dbgJouer()');let ok=false;for(let i=0;i<60&&!ok;i++){await new Promise(r=>setTimeout(r,500));ok=await ev('!!(window.dbgState&&dbgState().started&&dbgState().running)');}if(ok)break;}
  await new Promise(r=>setTimeout(r,5000));if(process.argv[7])console.log('AUDIT',await ev(fs.readFileSync(process.argv[7],'utf8'),true));
  if(process.argv[8])for(const s of [600,2800]){await ev('dbgJadeAller('+s+')');await new Promise(r=>setTimeout(r,3000));await ev('dbgJadeVue()');await new Promise(r=>setTimeout(r,1500));const im=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(process.argv[8]+'-s'+s+'.png',Buffer.from(im.data,'base64'));}
  fin();})().catch(e=>{console.log('ERR',e.message);fin();});
