/* banc dans le VRAI jeu : Chrome sans fenêtre piloté en CDP (Node 26, WebSocket natif). À lancer SOUS le verrou :
   /Users/sachaberes/cash-car/verrou-banc.sh prendre routes-fun ; node jeu.mjs carte meteo secondes [palier] ; verrou-banc.sh rendre
   Écrit des captures dans le dossier donné par l'env OUT. */
import {spawn} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const [carte,meteo,secs,palier]=process.argv.slice(2);const OUT=process.env.OUT||os.tmpdir();
const RACINE=path.resolve(new URL('../..',import.meta.url).pathname),WEB=path.join(RACINE,'VERSION PRINCIPALE');
const PS=9871+Math.floor(Math.random()*40),PC=9921+Math.floor(Math.random()*40);
const srv=spawn('python3',['-m','http.server',String(PS),'--directory',WEB],{detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'cc-bench-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--autoplay-policy=no-user-gesture-required','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=844,390','--disable-background-timer-throttling','--disable-renderer-backgrounding','about:blank'],{detached:true,stdio:'ignore'});
const fin=()=>{try{process.kill(-srv.pid);}catch(e){}try{process.kill(-chrome.pid);}catch(e){}};
process.on('exit',fin);process.on('SIGINT',()=>{fin();process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tabs;for(let i=0;i<90;i++){try{tabs=await (await fetch(`http://127.0.0.1:${PC}/json/list`)).json();if(tabs.length)break;}catch(e){}await sleep(1000);}
const tgt=tabs.find(t=>t.type==='page');const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}};
const cdp=(method,params)=>new Promise((res,rej)=>{const i=++id;const t=setTimeout(()=>rej(new Error("timeout "+method)),900000);pend.set(i,d=>{clearTimeout(t);d.error?rej(new Error(JSON.stringify(d.error))):res(d.result);});ws.send(JSON.stringify({id:i,method,params}));});
const ev=async(expr)=>{const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,300));return r.result.value;};
const shot=async(nom)=>{const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:70});fs.writeFileSync(path.join(OUT,nom+'.jpg'),Buffer.from(r.data,'base64'));};
try{
  await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:+(process.env.VW||844),height:+(process.env.VH||390),deviceScaleFactor:1,mobile:process.env.PC!=='1'});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`try{if(!sessionStorage.__p){sessionStorage.__p=1;localStorage.cashcarSave=JSON.stringify({v:2,tuto:1,permis:1,bienv:1,facile:0,sfx:true,mus:false,vox:false,plq:{m:'fr',x:'CC-161-RZ',ok:1}});}}catch(e){}`});
  if(process.env.SEED)await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`(function(){var a=${+process.env.SEED}>>>0;Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};})();`}); /* (2026-10-29) SEED=n : Math.random fixe, donc la même piste d'un essai à l'autre (comparer deux caméras) */
  await cdp('Page.navigate',{url:`http://127.0.0.1:${PS}/index.html?colonne=0&garde=1&carte=${carte}&meteo=${meteo||'midi'}${process.env.EXTRA||''}`});
  for(let i=0;i<120;i++){if(await ev('!!window.__gameReady').catch(()=>false))break;await sleep(1000);}
  console.log('prêt',await ev('localStorage.cashcarSave&&localStorage.cashcarSave.slice(0,160)'),await ev('JSON.stringify(Object.keys(localStorage))'));
  for(let i=0;i<12;i++){const vis=await ev(`(function(){var s=document.getElementById('splash');if(!s)return false;var c=getComputedStyle(s);return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>.05;})()`).catch(()=>false);if(!vis)break;
    for(const t of ['mousePressed','mouseReleased'])await cdp('Input.dispatchMouseEvent',{type:t,x:Math.round((+process.env.VW||844)/2),y:Math.round((+process.env.VH||390)/2),button:'left',clickCount:1});await sleep(900);}
  await sleep(1500);
  console.log('tuto avant',await ev('JSON.stringify(dbgTuto())'));
  if(false)await ev(`typeof dbgPalier==='function'?dbgPalier(${+palier}):'pas de dbgPalier'`).catch(()=>{});
  const H={ev,shot,sleep,cdp,OUT,jouer:async()=>{await ev(`(document.querySelector('[data-m="play"]')||[...document.querySelectorAll('*')].find(e=>/^JOUER/.test(e.textContent||'')&&e.children.length===0)).click();'ok'`);}};
  const mod=await import(path.resolve(process.env.SCRIPT));await mod.default(H,process.argv.slice(2));
}catch(e){console.log('ERREUR',e.message);}
finally{try{ws.close();}catch(e){}fin();}
