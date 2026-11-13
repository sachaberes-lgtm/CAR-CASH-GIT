/* LE BANC DES PICS DE JADE (2026-11-13, Sacha : « les pics de Jade ne devraient pas pouvoir tomber sur la route ») — le VRAI jeu en Chrome sans fenêtre (CDP),
   une course sur la Jade par graine (?carte=jade&pistegraine=g), puis dbgJadePics() : les montagnes qui tombent rejouées dans leurs vrais cubes contre le couloir
   de TOUTE la route (surRoute), et l'audit de la vallée immobile (immobiles : dbgJadeAudit).
   node jade-pics.mjs [graines=1-6] [extra=&sans=jadepics]
   ⚠ (13/11) pas encore passé jusqu'au bout : le Mac à une charge de 400, la page n'était pas prête en 4 min — le banc Node jade-pics.cjs a mesuré à sa place.
   À lancer sous le verrou : /Users/sachaberes/cash-car/verrou-banc.sh prendre jade-pics … verrou-banc.sh rendre */
import {spawn} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const [g0,g1]=(arg('graines')||'1-6').split('-').map(Number);const GRAINES=[];for(let g=g0;g<=(g1||g0);g++)GRAINES.push(g);
const EXTRA=arg('extra')||'';
const RACINE=path.resolve(new URL('../..',import.meta.url).pathname),WEB=path.join(RACINE,'VERSION PRINCIPALE');
const PS=9871+Math.floor(Math.random()*40),PC=9921+Math.floor(Math.random()*40);
const srv=spawn('python3',['-m','http.server',String(PS),'--directory',WEB],{detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'cc-jadepics-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=844,390','--disable-background-timer-throttling','--disable-renderer-backgrounding','--use-angle=swiftshader','--enable-unsafe-swiftshader','about:blank'],{detached:true,stdio:'ignore'});
const fin=()=>{try{process.kill(-srv.pid);}catch(e){}try{process.kill(-chrome.pid);}catch(e){}try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}};
process.on('exit',fin);process.on('SIGINT',()=>{fin();process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tabs;for(let i=0;i<90;i++){try{tabs=await (await fetch(`http://127.0.0.1:${PC}/json/list`)).json();if(tabs.length)break;}catch(e){}await sleep(1000);}
const tgt=tabs.find(t=>t.type==='page');const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}};
const cdp=(method,params)=>new Promise((res,rej)=>{const i=++id;const t=setTimeout(()=>rej(new Error('timeout '+method)),600000);pend.set(i,d=>{clearTimeout(t);d.error?rej(new Error(JSON.stringify(d.error))):res(d.result);});ws.send(JSON.stringify({id:i,method,params}));});
const ev=async(expr)=>{const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,400));return r.result.value;};
const tout=[];
try{
  await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`try{localStorage.cashcarSave=JSON.stringify({v:2,tuto:1,permis:1,bienv:1,facile:0,sfx:false,mus:false,vox:false});}catch(e){}`});
  for(const g of GRAINES){
    await cdp('Page.navigate',{url:`http://127.0.0.1:${PS}/index.html?carte=jade&pistegraine=${g}&garde=1&colonne=0${EXTRA}`});await sleep(3000);
    let ok=false;for(let i=0;i<240;i++){if(await ev('!!window.__gameReady&&typeof dbgJouer==="function"&&typeof dbgJadePics==="function"').catch(()=>false)){ok=true;break;}await sleep(1000);}
    if(!ok){console.log('g'+g,'page pas prête');continue;}
    await ev('JSON.stringify(dbgJouer())').catch(e=>console.log('dbgJouer',String(e).slice(0,200)));
    let r=null;for(let i=0;i<300;i++){r=await ev('(function(){try{var o=window.dbgJadePics&&dbgJadePics();return o?JSON.stringify(o):null;}catch(e){return JSON.stringify({erreur:String(e)});}})()').catch(()=>null);if(r)break;await sleep(1000);}
    if(!r){console.log('g'+g,'pas de jade bâtie');continue;}
    const o=JSON.parse(r);o.graine=g;tout.push(o);
    console.log(`g${g} ${o.on?'APRÈS':'AVANT'} montagnes ${o.montagnes} tombent ${o.tombent} refusées ${o.refusees} surRoute ${o.surRoute} (${o.ms} ms, pose ${o.poseMs} ms) immobiles ${JSON.stringify(o.immobiles)} ${o.ex&&o.ex.length?JSON.stringify(o.ex):''}`);
  }
  const s=tout.reduce((a,o)=>a+(o.surRoute||0),0);console.log(`TOTAL surRoute ${s} sur ${tout.length} graines`);
}catch(e){console.log('ERREUR',e.message);}
fin();process.exit(0);
