/* BANC DU YOYO DE RÉSOLUTION (2026-11-11, Sacha : « mon Mac a eu 15 Go de RAM utilisés par Vercel, ça a crashé »)
   La mémoire des processus Chrome pendant que l'échelle de qualité change de résolution en rafale (dbgQual alterné) : une réallocation qui fuit se voit en 60 s.
     node outils/banc-pc/yoyo.cjs http://127.0.0.1:8131/index.html [--dsf=2] [--w=1920] [--h=1080] [--duree=60] [--pas=700] [--q=params] [--yoyo=0 : témoin sans rafale] */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARGS=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const opt={};for(const a of process.argv.slice(2)){const m=/^([a-z0-9]+)=(.*)$/.exec(a.replace(/^--/,''));if(a.startsWith('--')&&m)opt[m[1]]=m[2];}
const URL0=ARGS[0]||'http://127.0.0.1:8131/index.html',W=+(opt.w||1920),H=+(opt.h||1080),DUREE=+(opt.duree||60),PORT=+(opt.port||9481),PAS=+(opt.pas||700);
const URLF=URL0+(URL0.indexOf('?')<0?'?':'&')+'intro=ancien&attente=0'+(opt.q?'&'+opt.q:'');
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const UDD=path.join(process.env.CC_BANC_DIR||path.join(os.tmpdir(),'cc-banc-pc'),'profil-yoyo');fs.mkdirSync(UDD,{recursive:true});
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
function tue(){if(!chrome)return;try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
function procs(){
  const ps='Get-CimInstance Win32_Process -Filter "Name=\'chrome.exe\'" | Where-Object { $_.CommandLine -like \'*profil-yoyo*\' } | Select-Object WorkingSetSize,PrivatePageCount,CommandLine | ConvertTo-Json -Compress';
  const r=spawnSync('powershell',['-NoProfile','-Command',ps],{encoding:'utf8',maxBuffer:64<<20});let L=[];try{L=JSON.parse(r.stdout||'[]');if(!Array.isArray(L))L=[L];}catch(e){return null;}
  const o={rendu:0,gpu:0,total:0,prive:0};for(const p of L){const m=/--type=([a-z-]+)/.exec(p.CommandLine||''),t=m?m[1]:'nav',ws=Math.round(p.WorkingSetSize/1048576);o.total+=ws;o.prive+=Math.round(p.PrivatePageCount/1048576);if(t==='renderer')o.rendu+=ws;if(t==='gpu-process')o.gpu+=ws;}
  return o;}
(async function(){
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+UDD,'--no-first-run','--no-default-browser-check','--window-size='+W+','+H,'--force-device-scale-factor='+(opt.dsf||'1'),
    '--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding','--mute-audio','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+PORT+'/json/version');break;}catch(e){await dort(200);}}
  const t=await putJson('http://127.0.0.1:'+PORT+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  let n=0;const att={},err=[];ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&att[r.id]){const a=att[r.id];delete att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}else if(r.method==='Runtime.exceptionThrown'){err.push(String((r.params.exceptionDetails.exception&&r.params.exceptionDetails.exception.description)||r.params.exceptionDetails.text).split('\n')[0]);}};
  const call=(m,p)=>new Promise((ok,ko)=>{const id=++n;att[id]={ok,ko};ws.send(JSON.stringify({id,method:m,params:p||{}}));});
  const ev=async e=>{const r=await call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;};
  const evF=e=>ev("(function(){var f=document.getElementById('colonne');var w=f?f.contentWindow:window;return w.eval("+JSON.stringify(e)+");})()");
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{var k='cashcarSave',d={};try{d=JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){}if(!d.v){d={v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3}};}d.sfx=false;d.mus=false;d.vox=false;d.tuto=1;localStorage.setItem(k,JSON.stringify(d));}catch(e){}"});
  await call('Page.navigate',{url:URLF});await dort(500);
  for(let i=0;i<600;i++){try{if(await evF("!!(window.__gameReady&&typeof window.dbgScene==='function'&&location.href.indexOf('about:')!==0)"))break;}catch(e){}await dort(300);}
  await dort(3000);
  await evF("(function(){try{var sp=document.getElementById('splash');if(sp){sp.click();setTimeout(function(){try{sp.remove();}catch(e){}},900);}}catch(e){}})()");await dort(1200);
  await evF("(function(){try{var b=document.querySelector('#mHome [data-m=play]');if(b)b.click();}catch(e){}})()");await dort(2500);
  await evF("(function(){try{return window.dbgJouer?JSON.stringify(dbgJouer()):'';}catch(e){return '';}})()");
  for(let i=0;i<300;i++){try{if(await evF('dbgState().started&&!dbgState().gameOver'))break;}catch(e){}await dort(300);}
  await evF('try{dbgAuto(true,0)}catch(e){}');await dort(4000);
  const info=await evF("(function(){var x=dbgNette();return JSON.stringify({dpr:x.dpr,cap:x.cap,px:x.px,kBas:x.kBas,poste:window.dbgPoste?dbgPoste().nom:null});})()");
  console.log('départ : '+info+' · '+JSON.stringify(procs()));
  if(opt.yoyo!=='0')await evF("(function(){var b=dbgNette().kBas,i=0;window.__yo=setInterval(function(){try{dbgQual((i++&1)?0:b);}catch(e){}},"+PAS+");window.__yoN=function(){return i;};})()");
  for(let s=10;s<=DUREE;s+=10){await dort(10000);let st={};try{st=await evF("(function(){var m=performance.memory,x=dbgNette(),r=dbgScene().rdr.info.memory;return {tas:Math.round(m.usedJSHeapSize/1048576),dpr:x.curDPR,tex:r.textures,geo:r.geometries,n:window.__yoN?__yoN():0,mort:dbgState().gameOver};})()");}catch(e){st={err:e.message.slice(0,80)};}
    console.log(String(s).padStart(4)+' s : '+JSON.stringify(procs())+' · '+JSON.stringify(st));
    if(st.mort){await evF("(function(){try{var b=document.querySelector('#mDead.on [data-m=\"replay\"]')||document.querySelector('[data-m=\"replay\"]');if(b)b.click();}catch(e){}})()");await dort(3000);}
    try{await evF('try{dbgAuto(true,0)}catch(e){}');}catch(e){}}
  if(err.length)console.log('erreurs : '+[...new Set(err)].slice(0,4).join(' | '));
  tue();
})().catch(e=>{console.error('ÉCHEC',e);tue();process.exit(1);});
