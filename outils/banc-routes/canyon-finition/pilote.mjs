/* LE PILOTE DE LA FINITION DU CANYON (2026-11-18, finition des maps : « le plus jolies possible tout en restant aussi optimisées ») : copie du pilote du canyon final
   (outils/banc-routes/canyon-final/pilote.mjs) qui NE PREND PAS le verrou lui-même : c'est banc.sh (à côté) qui le prend au nom « finition-canyon » et le rend.
   WEB=<dossier servi> (défaut : VERSION PRINCIPALE de ce dépôt ; la référence « avant » se sert de son propre dossier), PS / PC = ports HTTP et CDP (8640 / 9640).
   node outils/banc-routes/canyon-finition/pilote.mjs <scenario.mjs> [cle=valeur …]
   Le scénario exporte `default async function(api, args)` ; api :
     charger({graine, meteo, tel=1, q='', taille:[l,h,dpr], attente=4, chemin})  → recharge la page et lance une course sur le canyon (pistegraine) ; chemin = sous-dossier servi (WEB = le parent de deux jeux : avant | après)
     ev(expr, delaiMs)   → évalue dans la page (promesses attendues, valeur rendue par copie)
     photo(fichier)      → capture PNG de l'écran
     taille(l, h, dpr)   → format de l'écran (390×844 portrait, 844×390 paysage)
     dort(ms), log(...)
   Le jeu n'est pas modifié : tout passe par les crochets dbg*. Jamais de son (sfx, mus, vox coupés dans la sauvegarde, Chrome muet). */
import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const RACINE=path.resolve(new URL('../../..',import.meta.url).pathname),WEB=process.env.WEB||path.join(RACINE,'VERSION PRINCIPALE');
const QUI='finition-canyon',LOCK='/private/tmp/cashcar-banc.lock/qui';
const args={};for(const a of process.argv.slice(3)){const i=a.indexOf('=');if(i>0)args[a.slice(0,i)]=a.slice(i+1);else args[a]='1';}
const scen=(await import(path.resolve(process.argv[2]))).default;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* le verrou est tenu par banc.sh : on refuse de lancer Chrome sans lui, et on rafraîchit son heure (sinon il est repris au bout de 15 min) */
{let q='';try{q=fs.readFileSync(LOCK,'utf8');}catch(e){}if(q.indexOf(QUI)<0){console.log('verrou pas tenu par '+QUI+' : rien de lancé');process.exit(2);}}
const garde=setInterval(()=>{try{const q=fs.readFileSync(LOCK,'utf8');if(q.indexOf(QUI)>=0)fs.writeFileSync(LOCK,q.split(' ')[0]+' '+Math.floor(Date.now()/1000)+' '+QUI+'\n');}catch(e){}},120000);
const PS=+(process.env.PS||8640),PC=+(process.env.PC||9640);
const srv=spawn('python3',['-m','http.server',String(PS),'--directory',WEB],{detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'cc-finition-canyon-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=844,390','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{detached:true,stdio:'ignore'});
let fini=false;
const fin=()=>{if(fini)return;fini=true;clearInterval(garde);try{process.kill(-srv.pid);}catch(e){}try{process.kill(-chrome.pid);}catch(e){}try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}
  };
process.on('exit',fin);process.on('SIGINT',()=>{fin();process.exit(1);});process.on('SIGTERM',()=>{fin();process.exit(1);});
let tabs;for(let i=0;i<90;i++){try{tabs=await (await fetch(`http://127.0.0.1:${PC}/json/list`)).json();if(tabs.length)break;}catch(e){}await sleep(1000);}
const tgt=tabs.find(t=>t.type==='page');const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map(),erreurs=[];
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}
  else if(d.method==='Runtime.exceptionThrown'){const e=d.params.exceptionDetails;erreurs.push((e.exception&&e.exception.description||e.text||'').split('\n')[0].slice(0,300));}};
const cdp=(method,params,delai)=>new Promise((res,rej)=>{const i=++id;const t=setTimeout(()=>{pend.delete(i);rej(new Error('timeout '+method));},delai||600000);pend.set(i,d=>{clearTimeout(t);d.error?rej(new Error(JSON.stringify(d.error))):res(d.result);});ws.send(JSON.stringify({id:i,method,params}));});
const ev=async(expr,delai)=>{const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true},delai);if(r.exceptionDetails)throw new Error((r.exceptionDetails.exception&&r.exceptionDetails.exception.description||JSON.stringify(r.exceptionDetails)).slice(0,600));return r.result.value;};
const attend=async(expr,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await ev(expr).catch(()=>false))return true;await sleep(250);}return false;};
const taille=async(l,h,dpr)=>cdp('Emulation.setDeviceMetricsOverride',{width:l,height:h,deviceScaleFactor:dpr||2,mobile:true});
const photo=async f=>{fs.mkdirSync(path.dirname(f),{recursive:true});const r=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;};
const api={ev,photo,taille,dort:sleep,attend,cdp,erreurs,log:(...a)=>console.log(...a),racine:RACINE,
  async charger(o){o=o||{};const T=o.taille||[844,390,2];await taille(T[0],T[1],T[2]);erreurs.length=0;
    const url=`http://127.0.0.1:${PS}/${o.chemin?o.chemin+'/':''}index.html?intro=ancien&attente=0&carte=canyon&meteo=${o.meteo||'matin'}&pistegraine=${o.graine||1}${o.tel===0?'&colonne=0&poste=max':'&tel=1'}${o.q?'&'+o.q:''}`;
    await cdp('Page.navigate',{url:'about:blank'});await cdp('Page.navigate',{url});
    if(!await attend('window.__gameReady',180000))throw new Error('__gameReady jamais levé');
    for(let i=0;i<60&&await ev('!!window.__introCouvre');i++){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await sleep(400);}
    await attend("document.body.classList.contains('titreCiel')",60000);
    for(let i=0;i<8&&await ev("!!document.getElementById('splash')");i++){await ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await sleep(500);}
    let st=false;for(let k=0;k<3&&!st;k++){await ev('dbgJouer()');st=await attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
    if(!st)throw new Error('course pas lancée');
    await ev('window.dbgAuto&&dbgAuto(1,0,{nit:0})');await sleep((o.attente==null?4:o.attente)*1000);
    await attend("(function(){try{const d=dbgCanyon();return d.on&&!d.attente;}catch(e){return false;}})()",60000);
    return url;}};
try{
  await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');await cdp('Network.setBypassServiceWorker',{bypass:true});
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.clear();localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,bienv:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  await scen(api,args);
}catch(e){console.log('ÉCHEC',String(e&&e.stack||e));process.exitCode=1;}
finally{try{ws.close();}catch(e){}fin();}
process.exit(process.exitCode||0);
