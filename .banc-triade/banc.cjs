// Banc de la musique de FRÉNÉSIE (non commité). ⚠ sous le verrou commun :
//   /Users/sachaberes/cash-car/verrou-banc.sh prendre "triade" ; node banc.cjs <dossier VERSION PRINCIPALE> <sortie.json> ; verrou-banc.sh rendre
// Chrome sans fenêtre ET muet (--mute-audio) ; une copie du jeu (liens symboliques + index.html avec window.__ev) ; course en pilote auto ;
// on note le morceau qui joue avant, pendant et après une frénésie forcée (dbgFren), et toutes les requêtes qui touchent dark-triad.
const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const [JEU0,SORTIE,MODE]=process.argv.slice(2),JEU=path.resolve(JEU0);
const ICI=__dirname,COPIE=path.join(ICI,'copie'),PH=8847,PC=9847;
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.rmSync(COPIE,{recursive:true,force:true});fs.mkdirSync(COPIE);
for(const n of fs.readdirSync(JEU))if(n!=='index.html')fs.symlinkSync(path.join(JEU,n),path.join(COPIE,n));
let html=fs.readFileSync(path.join(JEU,'index.html'),'utf8');
const MARQ='window.__gameReady=true; // la boucle part';
if(!html.includes(MARQ))throw new Error('marque __gameReady introuvable');
html=html.replace(MARQ,'window.__ev=function(__c9){return eval(__c9);};'+MARQ);
fs.writeFileSync(path.join(COPIE,'index.html'),html);
const srv=spawn('/Library/Developer/CommandLineTools/usr/bin/python3',['-m','http.server',String(PH),'--bind','127.0.0.1'],{cwd:COPIE,detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(ICI,'profil-'));
const ch=spawn(CHROME,['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=844,390','--autoplay-policy=no-user-gesture-required','about:blank'],{detached:true,stdio:'ignore'});
let fini=false;
const fin=(code)=>{if(fini)return;fini=true;try{process.kill(-srv.pid)}catch(e){}try{process.kill(-ch.pid)}catch(e){}setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true})}catch(e){}process.exit(code||0);},800);};
process.on('SIGTERM',()=>fin(1));process.on('SIGINT',()=>fin(1));
setTimeout(()=>{console.error('banc trop long : arrêt');fin(2);},8*60*1000);
const dort=ms=>new Promise(r=>setTimeout(r,ms));
let ws,id=0;const att=new Map(),ERR=[],RES=[],REQ=new Map();
function cdp(method,params){return new Promise((res,rej)=>{const i=++id;att.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params:params||{}}));setTimeout(()=>{if(att.has(i)){att.delete(i);rej(new Error('délai '+method));}},90000);});}
async function ev(expr){const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)return {err:(r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text};return r.result.value;}
async function clic(x,y){for(const type of ['mousePressed','mouseReleased'])await cdp('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});}
async function attends(expr,s){for(let k=0;k<s*2;k++){if(await ev(expr).catch(()=>false)===true)return true;await dort(500);}return false;}
const SAVE={v:2,sfx:false,mus:true,vox:false,tuto:1,permis:1,facile:0,ex:{runs:5},plq:{m:'fr',x:'CC-161-TR',ok:1}};
const ETAT=`(function(){const el=document.getElementById('musique'),P=window.POUCE_JEU;
  return {fren:(function(){const f=dbgFren();return {lv:f.lv,musique:f.musique};})(),
    FRENM:__ev("({on:FRENM.on,ok:FRENM.ok,sw:FRENM.sw,surm:FRENM.surm,src:FRENM.src})"),
    el:el?{src:el.src.replace(location.origin,''),paused:el.paused,t:+el.currentTime.toFixed(2),rate:el.playbackRate,vol:+el.volume.toFixed(3),loop:el.loop,err:el.error&&el.error.code}:null,
    volCour:__ev("+musicVolCour.toFixed(3)"),volCible:__ev("+musicVolCible.toFixed(3)"),mode:__ev("musicMode"),
    pouce:P?{phase:P.phase,joue:P.joue(),niveau:P.ch?+P.ch.g.gain.value.toFixed(3):null}:null,
    bus:(function(){try{const W=__ev("MUS_WA");return W&&W.bus?{branche:!!W.br,cle:W.bus.cle}:{branche:!!(W&&W.br)};}catch(e){return String(e);}})(),
    gameOver:__ev("gameOver"),piste:__ev("LVL.cur&&LVL.cur.piste"),tuto:__ev("TUTO.on"),regne:__ev("pbjRegne()"),loopErr:window.__loopErr||null};})()`;
(async()=>{
  for(let k=0;k<240&&!ws;k++){await dort(500);try{const L=await (await fetch('http://127.0.0.1:'+PC+'/json/list')).json();const t=L.find(x=>x.type==='page');if(t)ws=new WebSocket(t.webSocketDebuggerUrl);}catch(e){}}
  if(!ws)throw new Error('Chrome ne répond pas');
  await new Promise(r=>ws.onopen=r);
  ws.onmessage=m=>{const d=JSON.parse(m.data);
    if(d.id&&att.has(d.id)){const a=att.get(d.id);att.delete(d.id);a.res(d.result||{});return;}
    if(d.method==='Runtime.exceptionThrown')ERR.push(String((d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description)||d.params.exceptionDetails.text).slice(0,300));
    if(d.method==='Network.requestWillBeSent'&&/dark-triad/.test(d.params.request.url))REQ.set(d.params.requestId,{url:d.params.request.url.replace(/^https?:\/\/[^/]+/,''),methode:d.params.request.method,type:d.params.type});
    if(d.method==='Network.responseReceived'){const r=d.params.response,u=r.url.replace(/^https?:\/\/[^/]+/,'');if(r.status>=400||/dark-triad/.test(u))RES.push({u,st:r.status,type:d.params.type});}
    if(d.method==='Network.loadingFailed'&&REQ.has(d.params.requestId))RES.push({u:REQ.get(d.params.requestId).url,echec:d.params.errorText});};
  await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:false});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'try{if(!sessionStorage.bancTr){sessionStorage.bancTr=1;localStorage.setItem("cashcarSave",'+JSON.stringify(JSON.stringify(SAVE))+');}}catch(e){}'});
  await cdp('Page.navigate',{url:'http://127.0.0.1:'+PH+'/index.html?colonne=0&muet=1'+(MODE==='ecole'?'':'&garde=1')});
  const R={};
  R.charge=await attends("typeof dbgFren==='function'&&!!window.__ev&&!!document.querySelector('[data-m=\"play\"]')",150);
  for(let k=0;k<12;k++){const sp=await ev("(function(){const s=document.getElementById('splash');return !!s&&getComputedStyle(s).display!=='none'&&getComputedStyle(s).visibility!=='hidden'&&s.isConnected})()");if(sp!==true)break;await clic(422,195);await dort(700);}
  await clic(422,60);await dort(3500); /* un toucher (le lecteur se libère), puis la sonde (2,5 s après le chargement) a répondu */
  R.sondeMenu=await ev("__ev('FRENM.ok')");
  await ev("document.querySelector('[data-m=\"play\"]').click();try{dbgAuto(1,0)}catch(e){};1");
  R.course=await attends("document.body.classList.contains('play')",60);
  await ev("try{dbgAuto(1,0)}catch(e){};1");await dort(4000);
  R.avant=await ev(ETAT);
  R.entre=await ev("dbgFren('v',100);dbgFren('entre');dbgFren().lv");
  await dort(700);R.pendant1=await ev(ETAT);
  await dort(2500);R.pendant2=await ev(ETAT);
  R.sort=await ev("dbgFren('pose',0).lv");
  await dort(2000);R.apres=await ev(ETAT);
  R.requetes=[...REQ.values()];R.reponses=RES;R.erreurs=ERR;
  fs.writeFileSync(SORTIE,JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));
  fin(0);
})().catch(e=>{console.error('ÉCHEC',e);fin(1);});
