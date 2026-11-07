/* Mesure : quels appels WebGL synchrones (getProgramParameter, getUniformLocation, useProgram…) durent > 20 ms au démarrage, et d'où (pile JS).
   usage : node serpent-gl.cjs <url> <cpu> <secondes> */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const URL_=process.argv[2],CPU=+process.argv[3]||4,SEC=+process.argv[4]||14;
const port=9500+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'sgl-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,'--use-angle=d3d11','--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable');await send('Runtime.enable');
  await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:fs.readFileSync(path.join(__dirname,'serpent-gl-inject.js'),'utf8')});
  await send('Page.navigate',{url:URL_});
  await sleep(SEC*1000);
  const rr=await send('Runtime.evaluate',{expression:'JSON.stringify(window.__gl)',returnByValue:true});const r=rr.result&&rr.result.result&&rr.result.result.value;if(!r){console.log(JSON.stringify(rr).slice(0,500));process.exit(1);}
  const G=JSON.parse(r);console.log('appels',JSON.stringify(G.n));
  console.log('evts',JSON.stringify(G.ev));G.s.forEach(x=>console.log(x[0],'ms +',x[1],x[2],x[3],'\n    ',x[4]));
  ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
