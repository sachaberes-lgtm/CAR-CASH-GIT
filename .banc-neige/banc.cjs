// Banc du glacier (non commité) : Chrome sans fenêtre gardé ouvert, piloté par CDP ; un petit serveur local (PCMD) reçoit des expressions.
//   POST /ev   corps = expression JS (évaluée dans la page, awaitPromise) → JSON
//   POST /photo?f=nom   corps = expression qui RENVOIE une data: URL jpeg → écrit photos/nom.jpg
//   GET  /charge?q=...  recharge la page avec ces paramètres     GET /fin  arrête tout
const {spawn}=require('child_process'),http=require('http'),fs=require('fs'),path=require('path');
const ICI=__dirname,COPIE=path.join(ICI,'copie'),PH=8821,PC=9921,PCMD=9822;
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.mkdirSync(path.join(ICI,'photos'),{recursive:true});
const srv=spawn('/Library/Developer/CommandLineTools/usr/bin/python3',['-m','http.server',String(PH),'--bind','127.0.0.1'],{cwd:COPIE,detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync('/private/tmp/banc-neige-');
const ch=spawn(CHROME,['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=1280,720','--autoplay-policy=no-user-gesture-required','about:blank'],{detached:true,stdio:'ignore'});
const fin=()=>{try{process.kill(-srv.pid)}catch(e){}try{process.kill(-ch.pid)}catch(e){}try{fs.rmSync(prof,{recursive:true,force:true})}catch(e){}process.exit(0);};
process.on('SIGTERM',fin);process.on('SIGINT',fin);
const dormir=ms=>new Promise(r=>setTimeout(r,ms));
let ws,id=0;const att=new Map();
function send(method,params){return new Promise((res,rej)=>{const i=++id;att.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params:params||{}}));setTimeout(()=>{if(att.has(i)){att.delete(i);rej(new Error('délai '+method));}},120000);});}
async function ev(expr){const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)return {err:(r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text};return r.result.value;}
const ERR=[];const SAVE={v:2,sfx:false,mus:false,vox:false,tuto:1,permis:1,facile:0,ex:{runs:5},plq:{m:'fr',x:'CC-161-GL',ok:1}};
async function charge(q){
  await send('Page.navigate',{url:'http://127.0.0.1:'+PH+'/index.html?'+q});
  for(let k=0;k<240;k++){await dormir(500);const ok=await ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')&&!!window.__ev").catch(()=>false);if(ok===true)break;}
  await dormir(1500);return 'chargé';}
(async()=>{
  for(let k=0;k<240;k++){await dormir(500);try{const L=await (await fetch('http://127.0.0.1:'+PC+'/json/list')).json();const t=L.find(x=>x.type==='page');if(t){ws=new WebSocket(t.webSocketDebuggerUrl);break;}}catch(e){}}
  await new Promise(r=>ws.onopen=r);
  ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')ERR.push(String(d.params.exceptionDetails&&((d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description)||d.params.exceptionDetails.text)).slice(0,300));if(d.method==='Network.responseReceived'&&d.params.response.status>=400)ERR.push('http '+d.params.response.status+' '+d.params.response.url);if(d.method==='Log.entryAdded'&&!/vibrate/.test(d.params.entry.text)&&d.params.entry.level==='error')ERR.push('log: '+String(d.params.entry.text).slice(0,300));if(d.id&&att.has(d.id)){const a=att.get(d.id);att.delete(d.id);d.error?a.rej(new Error(JSON.stringify(d.error))):a.res(d.result);}};
  await send('Runtime.enable');await send('Log.enable');
  await send('Page.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'try{localStorage.setItem("cashcarSave",'+JSON.stringify(JSON.stringify(SAVE))+')}catch(e){}'});
  http.createServer(async(req,res)=>{let b='';req.on('data',c=>b+=c);req.on('end',async()=>{try{const u=new URL(req.url,'http://x');let out;
    if(u.pathname==='/ev')out=await ev(b);
    else if(u.pathname==='/erreurs'){out=ERR.splice(0);}
    else if(u.pathname==='/charge')out=await charge(u.searchParams.get('q')||'');
    else if(u.pathname==='/photo'){const d=await ev(b);if(typeof d!=='string'||!d.startsWith('data:'))out={pasImage:d};else{const f=path.join(ICI,'photos',(u.searchParams.get('f')||'p')+'.jpg');fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));out=f;}}
    else if(u.pathname==='/cdp'){const o=JSON.parse(b);out=await send(o.method,o.params||{});}
    else if(u.pathname==='/fin'){res.end('fin');fin();return;}
    res.end(JSON.stringify(out));}catch(e){res.end(JSON.stringify({err:String(e)}));}});}).listen(PCMD,'127.0.0.1');
  console.log('prêt');
})().catch(e=>{console.error(e);fin();});
