/* LE BANC DE TOUTES LES MAPS (2026-11-05, LE DIRECTEUR DE RYTHME) : le VRAI jeu en Chrome sans fenêtre (CDP), `dbgGenRoute(carte, graine, palier)` pour chaque
   map × palier × graine — la génération seule, sans décor ni mailles — et un fichier JSON par route dans OUT (le dessin à plat, la route roulée, les normales,
   les modules, la fiche de rythme). Ensuite `node fiche.cjs OUT` résume et dessine.
   node toutes.mjs [cartes=nuages,ville,…] [paliers=0,10,20] [graines=1-8] [extra=&sans=…]     (env OUT = le dossier de sortie, PORT facultatif)
   À lancer sous le verrou : /Users/sachaberes/cash-car/verrou-banc.sh prendre routes-gd … verrou-banc.sh rendre */
import {spawn} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const CARTES=(arg('cartes')||'nuages,espace,ville,crypto,jade,foret,canyon,dunes,grotte,banquise').split(',');
const PALIERS=(arg('paliers')||'0,10,20').split(',').map(Number);
const [g0,g1]=(arg('graines')||'1-8').split('-').map(Number);const GRAINES=[];for(let g=g0;g<=(g1||g0);g++)GRAINES.push(g);
const EXTRA=arg('extra')||'';
const OUT=process.env.OUT||path.join(os.tmpdir(),'cc-routes');fs.mkdirSync(OUT,{recursive:true});
const RACINE=path.resolve(new URL('../..',import.meta.url).pathname),WEB=path.join(RACINE,'VERSION PRINCIPALE');
const PS=+(process.env.PORT||0)||9871+Math.floor(Math.random()*40),PC=9921+Math.floor(Math.random()*40);
const srv=spawn('python3',['-m','http.server',String(PS),'--directory',WEB],{detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'cc-routes-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=844,390','--disable-background-timer-throttling','--disable-renderer-backgrounding','about:blank'],{detached:true,stdio:'ignore'});
const fin=()=>{try{process.kill(-srv.pid);}catch(e){}try{process.kill(-chrome.pid);}catch(e){}try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}};
process.on('exit',fin);process.on('SIGINT',()=>{fin();process.exit(1);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tabs;for(let i=0;i<90;i++){try{tabs=await (await fetch(`http://127.0.0.1:${PC}/json/list`)).json();if(tabs.length)break;}catch(e){}await sleep(1000);}
const tgt=tabs.find(t=>t.type==='page');const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}};
const cdp=(method,params)=>new Promise((res,rej)=>{const i=++id;const t=setTimeout(()=>rej(new Error("timeout "+method)),600000);pend.set(i,d=>{clearTimeout(t);d.error?rej(new Error(JSON.stringify(d.error))):res(d.result);});ws.send(JSON.stringify({id:i,method,params}));});
const ev=async(expr)=>{const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,400));return r.result.value;};
try{
  await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`try{if(!sessionStorage.__p){sessionStorage.__p=1;localStorage.cashcarSave=JSON.stringify({v:2,tuto:1,permis:1,bienv:1,facile:0,sfx:false,mus:false,vox:false});}}catch(e){}`});
  await cdp('Page.navigate',{url:`http://127.0.0.1:${PS}/index.html?colonne=0&garde=1${EXTRA}`});
  for(let i=0;i<180;i++){if(await ev('!!window.__gameReady&&typeof dbgGenRoute==="function"').catch(()=>false))break;await sleep(1000);}
  if(!await ev('typeof dbgGenRoute==="function"').catch(()=>false))throw new Error('dbgGenRoute absent (index.html pas assemblé ?)');
  const t0=Date.now();let n=0;
  for(const carte of CARTES)for(const pal of PALIERS)for(const g of GRAINES){
    const r=await ev(`JSON.stringify(dbgGenRoute(${JSON.stringify(carte)},${g},${pal}))`);
    const o=JSON.parse(r);const f=path.join(OUT,`${carte}-p${pal}-g${g}.json`);fs.writeFileSync(f,r);n++;
    if(o.erreur){console.log(carte,'p'+pal,'g'+g,'ERREUR',o.erreur.split('\n')[0].slice(0,200));continue;}
    const F=o.fiche;console.log(`${carte.padEnd(8)} p${String(pal).padEnd(2)} g${String(g).padEnd(3)} L ${String(F.L).padStart(5)} ${String(F.s).padStart(5)}s vir/km ${String(F.virKm).padStart(5)} serré/km ${String(F.serreKm).padStart(5)} infr ${String(F.infr).padStart(3)} droite ${String(F.droiteS).padStart(5)}s(${F.droites5}) ench/km ${String(F.enchKm).padStart(5)} spir ${String(F.spirMax).padStart(3)}°(${F.spirales}) coudes ${String(F.coudes).padStart(2)} crêtes ${String(F.cretes).padStart(2)} pente p95 ${F.penteP95} montée ${F.montee} rMin ${F.rMinRP}rP note ${String(o.note).padStart(6)} ${o.ms}ms${o.rythme?' essais '+o.rythme.n+' '+JSON.stringify(o.rythme.notes):''}`);
  }
  console.log('fini',n,'routes en',((Date.now()-t0)/1000).toFixed(0),'s →',OUT);
}catch(e){console.log('ERREUR',e.message);}
finally{try{ws.close();}catch(e){}fin();}
