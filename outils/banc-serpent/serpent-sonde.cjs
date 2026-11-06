/* serpent-sonde.cjs : lit la sonde du jeu (dbgSerpent) après SEC secondes, à froid, CPU ralenti. usage : node serpent-sonde.cjs <url> <cpu> <secondes> [capture.png]
   (dérivé de serpent-verif.cjs) */
/* Vérifie qu'un démarrage à froid n'a aucune erreur de shader ni de console, que la liaison douce a bien fini, et prend une capture.
   usage : node serpent-verif.cjs <url> <cpu> <secondes> [capture.png] */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const URL_=process.argv[2],CPU=+process.argv[3]||4,SEC=+process.argv[4]||25,PNG=process.argv[5];
const port=9600+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'sv-'));
const chrome=spawn(process.env.CHROME||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'C:/Program Files/Google/Chrome/Application/chrome.exe'),['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,...(process.platform==='win32'?['--use-angle=d3d11']:[]),'--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},logs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}
    else if(d.method==='Runtime.consoleAPICalled'&&/error|warning/.test(d.params.type))logs.push(d.params.type+': '+d.params.args.map(a=>String(a.value||a.description||'').slice(0,300)).join(' '));
    else if(d.method==='Runtime.exceptionThrown')logs.push('EXC: '+JSON.stringify(d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description||d.params.exceptionDetails.text).slice(0,300));
    else if(d.method==='Log.entryAdded'&&/error|warning/.test(d.params.entry.level))logs.push('log '+d.params.entry.level+': '+d.params.entry.text.slice(0,200));};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
  await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  await send('Page.navigate',{url:URL_});
  if(process.env.BLOQUE){await sleep(3000);for(let k=0;k<2;k++){await send('Runtime.evaluate',{expression:'(function(){var t=performance.now();while(performance.now()-t<500);})()'});await sleep(1500);}} /* témoin : deux blocages de 500 ms du fil, la sonde doit les voir */
  await sleep(SEC*1000);
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});return r.result&&r.result.result&&r.result.result.value;};
  /* la SONDE du jeu (debut-corps.html) : les trous > 120 ms vus de l'intérieur, avec leur cause ; + la boîte noire (genre « serpent ») */
  const corps=`JSON.stringify({sonde:window.dbgSerpent&&window.dbgSerpent(),boite:(window.dbgErreurs?window.dbgErreurs():[]).filter(function(e){return e.g==='serpent'}).map(function(e){return e.m+(e.o?' ↳ '+e.o:'')}),t:Math.round(performance.now()/100)/10,ready:!!window.__gameReady,serpent:!!document.getElementById('spCharge')})`;
  /* ?tel=1 met le jeu dans l'iframe de la colonne : on cherche la fenêtre qui porte dbgSerpent */
  const expr=`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgSerpent)return W[i].eval(${JSON.stringify(corps)});}catch(e){}}return '{}';})()`;
  const r=JSON.parse(String(await ev(expr)||'{}'));
  console.log('SONDE',JSON.stringify({t:r.t,gameReady:r.ready,serpentEncorLa:r.serpent,trous:(r.sonde||[]).length}));
  (r.sonde||[]).forEach(x=>console.log('  ',(x.t/1000).toFixed(1)+' s','trou',x.d,'ms · JS',x.js,'· GL',x.gl,x.pile?'('+x.pile+')':'','· fil',x.fil));
  (r.boite||[]).filter(l=>/fin du guet/.test(l)).forEach(l=>console.log('  ',l));
  if(PNG){const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(PNG,Buffer.from(s.result.data,'base64'));console.log('capture',PNG);}
  console.log('CONSOLE',logs.length?logs.slice(0,15).join('\n  '):'(aucune erreur ni alerte)');
  ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
