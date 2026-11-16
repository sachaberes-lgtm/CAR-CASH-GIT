/* ===== LE FILM DU POUF, IMAGE PAR IMAGE (2026-11-14) — pour régler et montrer les volutes sans dépendre de la cadence des photos =====
   Le serveur-sonde doit tourner. Le jeu est mis en pause sur la route des nuages, une bouffée est tirée à la caisse, puis son ÂGE est posé à la main
   (POUF_GPU.fx.uO[s].w) et l'image rendue pour chaque âge demandé : la gerbe vit dans le repère de la caisse, la pause ne change donc rien à sa forme.
   node outils/banc-nuages/film.cjs [--port=8340] [--cdp=9542] [--graine=1] [--meteo=midi] [--tel=1] [--s=700] [--ages=0.03,0.08,0.16,0.3,0.5,0.75,1.1] [--part=1] [--vol=1 (en vol : l'anneau entier)]
        [--q=sans=nudechire] [--out=dossier] [--nom=film]
   Sortie : <out>/<nom>-<âge>.jpg (le cadre resserré sur la caisse) et une ligne par image. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8340),CDP=+(opt.cdp||9542),METEO=opt.meteo||'midi',TEL=opt.tel==='1',G=+(opt.graine||1),S0=+(opt.s||700),NOM=opt.nom||'film';
const AGES=(opt.ages||'0.03,0.08,0.16,0.3,0.5,0.75,1.1').split(',').map(Number);
const OUT=path.resolve(opt.out||path.join(__dirname,'sorties'));fs.mkdirSync(OUT,{recursive:true});
const URL0='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&carte=nuages&meteo='+METEO+'&pistegraine='+G+(TEL?'&tel=1':'&colonne=0')+(opt.q?'&'+opt.q:'');
const dort=(ms)=>new Promise(r=>setTimeout(r,ms));
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
function tue(){if(chrome){try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}}
(async function(){
  const udd=path.join(os.tmpdir(),'cc-banc-pro-nuages-film'+(TEL?'-tel':''));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,800','--mute-audio','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');break;}catch(e){if(i>150)throw new Error('Chrome ne répond pas');await dort(200);}}
  const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank'),ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  let n=0;const att={};ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&att[r.id]){const a=att[r.id];delete att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}};
  const call=(m,p)=>new Promise((ok,ko)=>{const id=++n;att[id]={ok,ko};ws.send(JSON.stringify({id,method:m,params:p||{}}));});
  const ev=async(x)=>{const r=await call('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true,timeout:120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;};
  const attend=async(x,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){try{if(await ev('!!('+x+')'))return true;}catch(e){}await dort(250);}return false;};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});
  if(TEL){await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  else await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  await call('Page.navigate',{url:URL0});if(!await attend('window.__gameReady',180000))throw new Error('__gameReady jamais levé');
  for(let i=0;i<60&&await ev('!!window.__introCouvre');i++){await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
  await attend('!window.__introCouvre',60000);await dort(800);await attend("document.body.classList.contains('titreCiel')",60000);
  for(let i=0;i<8&&await ev("!!document.getElementById('splash')");i++){await ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
  let st=false;for(let k=0;k<3&&!st;k++){await ev('dbgJouer()');st=await attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
  if(!st)throw new Error('course pas lancée');
  await ev('dbgAuto(1,0,{nit:0})');if(!await attend('window.__NU&&__NU.POUF_GPU.fx',30000))throw new Error('pas de sonde ou pas de pouf aérien');
  await ev("(function(){try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
  if(!await attend('dbgRoute().s>'+S0+'||dbgState().gameOver',90000))throw new Error('abscisse '+S0+' jamais atteinte');
  if(opt.vol==='1'){await ev('dbgSaut&&0');} /* (le vol : à instrumenter — l'arc se force plus bas) */
  await ev('dbgNuVue(null)'); /* la pause, la vue de course telle quelle */
  await dort(300);
  if(opt.trame==='1'){ /* la même image, la trame en Bayer (0) puis en bruit à gradient entrelacé (1) : pour juger le bord des nuages qui fondent près de l'objectif */
    for(const v of [0,1]){await ev("(function(){__NU.N8_U.uIgn.value="+v+";dbgNuVit(null,{rendre:1});})()");await dort(150);const r=await call('Page.captureScreenshot',{format:'png'}),f=path.join(OUT,NOM+'-trame-'+(v?'ign':'bayer')+'.png');fs.writeFileSync(f,Buffer.from(r.data,'base64'));console.log(' ',f);}
    try{ws.close();}catch(e){}return;}
  const sl=await ev("(function(){const P=__NU.POUF_GPU,fx=P.fx;fx.fini();dbgPoufGpu("+(opt.k||1)+");let s=0;for(let q=1;q<fx.uO.length;q++)if(fx.uO[q].w<fx.uO[s].w)s=q;fx.uO[s].y="+(+(opt.part||1))+";"+(opt.vol==='1'?"fx.mat.uniforms.uP.value[s].y=0;":"")+"return {s:s,vol:!!P.vol,v:Math.round(__NU.NCB.cv.length()*3.6)};})()");
  console.log('bouffée',JSON.stringify(sl));
  const clip=TEL?{x:0,y:200,width:390,height:560,scale:1}:{x:240,y:150,width:800,height:600,scale:1};
  for(const a of AGES){await ev("(function(){const fx=__NU.POUF_GPU.fx;fx.uO["+sl.s+"].w="+a+";fx.mesh.visible=true;dbgNuVit(null,{rendre:1});})()");await dort(120);
    const r=await call('Page.captureScreenshot',{format:'jpeg',quality:88,clip:clip}),f=path.join(OUT,NOM+'-'+a.toFixed(2)+'.jpg');fs.writeFileSync(f,Buffer.from(r.data,'base64'));console.log(' ',f);}
  try{ws.close();}catch(e){}
})().then(tue,function(e){console.error(e);tue();process.exit(1);});
