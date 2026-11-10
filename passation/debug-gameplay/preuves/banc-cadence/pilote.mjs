/* Pilote CDP : Chrome sans fenêtre, serveur 8842, CDP 9742, horloge virtuelle. Usage : node pilote.mjs <fichier-scenario.js> carte meteo graine hz [extra]
   Écrit le JSON de résultat sur la sortie standard (dernière ligne RES {...}). */
import {spawn} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const [scen,carte,meteo,graine,hzs,extra]=process.argv.slice(2);
const ICI=path.dirname(new URL(import.meta.url).pathname),WEB=path.resolve(ICI,'../../../../VERSION PRINCIPALE');
const PS=8842,PC=9742;
const srv=spawn('python3',['-m','http.server',String(PS),'--directory',WEB],{detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'cc-cad-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=844,390','--disable-background-timer-throttling','--disable-renderer-backgrounding','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','about:blank'],{detached:true,stdio:'ignore'});
const fin=()=>{try{process.kill(-srv.pid);}catch(e){}try{process.kill(-chrome.pid);}catch(e){}try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}};
process.on('exit',fin);process.on('SIGINT',()=>{fin();process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tabs;for(let i=0;i<90;i++){try{tabs=await (await fetch(`http://127.0.0.1:${PC}/json/list`)).json();if(tabs.length)break;}catch(e){}await sleep(1000);}
const tgt=tabs.find(t=>t.type==='page');const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const con=[];
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}else if(d.method==='Runtime.exceptionThrown')con.push('EXC '+JSON.stringify(d.params.exceptionDetails).slice(0,200));};
const cdp=(method,params)=>new Promise((res,rej)=>{const i=++id;const t=setTimeout(()=>rej(new Error("timeout "+method)),1500000);pend.set(i,d=>{clearTimeout(t);d.error?rej(new Error(JSON.stringify(d.error))):res(d.result);});ws.send(JSON.stringify({id:i,method,params}));});
const ev=async(expr)=>{const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,500));return r.result.value;};
try{
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`try{localStorage.cashcarSave=JSON.stringify({v:2,tuto:1,permis:1,bienv:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-RZ',ok:1}});}catch(e){}`});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:fs.readFileSync(path.join(ICI,'horloge.js'),'utf8')});
  await cdp('Page.navigate',{url:`http://127.0.0.1:${PS}/index.html?colonne=0&garde=1&tel=1&fps=0&carte=${carte}&meteo=${meteo||'midi'}&intro=ancien&attente=0${extra||''}`});
  let t00=Date.now();for(let i=0;i<300;i++){if(await ev("typeof window.dbgJouer==='function'").catch(()=>false))break;await sleep(1000);}console.log("chargé en",Math.round((Date.now()-t00)/1000),"s");
  await sleep(1500);
  for(let i=0;i<10;i++){const vis=await ev(`(function(){var s=document.getElementById('splash');if(!s)return false;var c=getComputedStyle(s);return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>.05;})()`).catch(()=>false);if(!vis)break;
    for(const t of ['mousePressed','mouseReleased'])await cdp('Input.dispatchMouseEvent',{type:t,x:422,y:195,button:'left',clickCount:1});await sleep(900);}
  await ev(fs.readFileSync(path.join(ICI,'lib.js'),'utf8'));
  const sc=fs.readFileSync(path.resolve(scen),'utf8');
  const out=[];
  for(const hz of hzs.split(',')){
    const r=await ev(`(async function(){return JSON.stringify(await (${sc})({carte:${JSON.stringify(carte)},graine:${+graine},hz:${+hz}}));})()`);
    const nom=path.basename(scen,'.js')+'_'+carte+'_g'+graine+'_'+hz+(process.env.TAG||'')+'.json';
    fs.writeFileSync(path.join(ICI,'res',nom),JSON.stringify({scen:path.basename(scen),carte,graine:+graine,hz:+hz,extra:extra||'',r:JSON.parse(r)}));
    console.log('RES écrit',nom,r.length,'octets');
  }
  if(con.length)console.log('CONSOLE',con.slice(0,5).join(' | '));
}catch(e){console.log('ERREUR',e.message);}
finally{try{ws.close();}catch(e){}fin();}
