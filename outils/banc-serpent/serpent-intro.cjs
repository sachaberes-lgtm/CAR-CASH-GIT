/* serpent-intro.cjs : le déroulé du démarrage, de la page au menu — l'instant « tout prêt » (ligne « chargement » de la boîte noire), le départ du film, le toucher qui le termine, puis la ligne « intro »
   (images du film, pire intervalle, images > 20 ms = K). Sert à comparer l'ancien (?introapres=0 : le film part tout de suite, le chargement se fait sous la boule) et le nouveau (?introapres=1 : tout est prêt AVANT le film).
   usage : node serpent-intro.cjs "<url avec ?tel=1&introapres=N>" <cpu> [secondes max, 90] [dsf, 3]
   (écrit en 2026-11-08, OPTI ULTIME : « l'intro ne commence que quand tout est prêt, et rien ne travaille pendant l'intro ») */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const URL_=process.argv[2],CPU=+process.argv[3]||4,MAX=(+process.argv[4]||90)*1000,DSF=+process.argv[5]||+process.env.DSF||3;
const port=9600+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'si-'));
const chrome=spawn(process.env.CHROME||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'C:/Program Files/Google/Chrome/Application/chrome.exe'),['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,'--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let tabs;for(let i=0;i<200;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});return r.result&&r.result.result&&r.result.result.value;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:DSF,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  /* on vide la boîte noire AVANT de charger : sinon les lignes d'un banc précédent se mêlent (même origine) */
  await send('Page.navigate',{url:URL_.split('?')[0]});await sleep(1500);await ev("try{localStorage.removeItem('cashcarErr')}catch(e){}");
  const t0=Date.now();
  await send('Page.navigate',{url:URL_});
  /* dans la fenêtre qui porte dbgIntro (le jeu est dans un cadre en ?tel=1) */
  const dans=js=>`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgIntro){return (function(w){${js}})(W[i]);}}catch(e){}}return null;})()`;
  const notes=()=>ev(dans("var L=w.dbgErreurs?w.dbgErreurs():[];return JSON.stringify(L.filter(function(e){return e.g==='chargement'||e.g==='intro'}).map(function(e){return e.g+' | '+e.m;}))"));
  const etat=()=>ev(dans("var s=w.dbgIntro.etat();return JSON.stringify({lance:s.lance,fini:s.fini,casse:s.casse,doux:s.doux,t:s.t});"));
  let tPret=0,tLance=0,tClic=0,tFini=0,dernier={};
  while(Date.now()-t0<MAX){
    await sleep(250);
    const n=JSON.parse(await notes()||'[]');
    if(!tPret&&n.some(x=>/^chargement \| .*prêt en/.test(x)))tPret=Date.now()-t0;
    const s=JSON.parse(await etat()||'{}');dernier=s;
    if(s.lance&&!tLance)tLance=Date.now()-t0;
    if(s.lance&&s.t>=5.4&&!tClic){await ev(dans("var e=w.document.getElementById('splash');if(e)e.click();return 1;"));tClic=Date.now()-t0;}
    if(s.fini&&!tFini){tFini=Date.now()-t0;break;}
  }
  await sleep(1500);
  const n=JSON.parse(await notes()||'[]');
  console.log(JSON.stringify({url:URL_,cpu:CPU,pretMs:tPret||null,filmPartiMs:tLance||null,toucherMs:tClic||null,finiMs:tFini||null,dernier:dernier}));
  n.forEach(x=>console.log('  '+x));
  ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
