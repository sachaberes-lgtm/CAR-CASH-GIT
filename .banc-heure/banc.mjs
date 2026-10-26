import {spawn} from 'node:child_process';import fs from 'node:fs';
const PORT=9187,URL0=process.argv[2]||'http://localhost:3001/',OUT=process.argv[3],HEURES=(process.argv[4]||'aube,matin,midi,aprem,golden,soir,nuit').split(',');
const dir=fs.mkdtempSync('/private/tmp/claude-501/bancheure-');
const ch=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--autoplay-policy=no-user-gesture-required','--remote-debugging-port='+PORT,'--user-data-dir='+dir,'--window-size=1280,800','--no-first-run','about:blank'],{detached:true,stdio:'ignore'});
const fin=()=>{try{process.kill(-ch.pid)}catch(e){}};process.on('exit',fin);
const dort=ms=>new Promise(r=>setTimeout(r,ms));
let t=null;for(let i=0;i<40&&!t;i++){await dort(500);try{const l=await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();t=l.find(x=>x.type==='page');}catch(e){}}
const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const att=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&att.has(d.id)){att.get(d.id)(d);att.delete(d.id)}};
const cdp=(method,params={})=>new Promise(r=>{const i=++id;att.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async x=>{const r=await cdp('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true});return r.result&&r.result.result?r.result.result.value:r};
try{
await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Network.setCacheDisabled',{cacheDisabled:true});
await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`try{if(!sessionStorage.bh){sessionStorage.bh=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false});}}catch(e){}`});
await cdp('Page.navigate',{url:URL0});
for(let i=0;i<60;i++){await dort(1000);if(await ev('!!window.__gameReady'))break;}
console.log('prêt',await ev('!!window.__gameReady'));
// le jeu vit dans un iframe en bureau
const FR='(document.querySelector("iframe")&&document.querySelector("iframe").contentWindow)||window';
for(let i=0;i<12;i++){const vis=await ev(`(function(){const w=${FR};const s=w.document.getElementById('splash');return !!s&&getComputedStyle(s).display!=='none'&&getComputedStyle(s).visibility!=='hidden'&&getComputedStyle(s).opacity!=='0'})()`);if(!vis)break;
 await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:640,y:400,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:640,y:400,button:'left',clickCount:1});await dort(1200);}
await dort(3000);
for(let k=0;k<2;k++){await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:385,y:535,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:385,y:535,button:'left',clickCount:1});await dort(2500);}
await dort(3000);
console.log('dbg',await ev(`typeof (${FR}).dbgHeure+' '+typeof (${FR}).dbgSoleil`));
for(const h of HEURES){
  await ev(`(${FR}).dbgHeure('${h}')`);await dort(3500);
  const info=await ev(`JSON.stringify((${FR}).dbgHeure())`);
  const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:80});
  fs.writeFileSync(`${OUT}/${h}.jpg`,Buffer.from(r.result.data,'base64'));console.log(h,info);
}
console.log('horloge',await ev(`JSON.stringify((${FR}).dbgSoleil())`));
}catch(e){console.log('ERR',e)}finally{fin();process.exit(0)}
