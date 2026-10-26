// SANS TOUT CASSER (non commité) : couché 844×390, debout 390×844, cadre de l'ordi 1280×800 — démarrage, JOUER, course, frénésie, 0 erreur.
// ⚠ sous le verrou : verrou-banc.sh prendre "triade-fumee" ; node fumee.cjs <VERSION PRINCIPALE> <sortie.json> ; verrou-banc.sh rendre
const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const [JEU0,SORTIE]=process.argv.slice(2),JEU=path.resolve(JEU0);
const ICI=__dirname,PH=8848,PC=9848,COPIE=path.join(ICI,'copie-fumee');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.rmSync(COPIE,{recursive:true,force:true});fs.mkdirSync(COPIE);
for(const n of fs.readdirSync(JEU))fs.symlinkSync(path.join(JEU,n),path.join(COPIE,n)); /* le VRAI index.html, sans crochet */
const srv=spawn('/Library/Developer/CommandLineTools/usr/bin/python3',['-m','http.server',String(PH),'--bind','127.0.0.1'],{cwd:COPIE,detached:true,stdio:'ignore'});
const prof=fs.mkdtempSync(path.join(ICI,'profil-'));
const ch=spawn(CHROME,['--headless=new','--mute-audio','--no-first-run','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--window-size=1280,800','--autoplay-policy=no-user-gesture-required','about:blank'],{detached:true,stdio:'ignore'});
let fini=false;
const fin=(code)=>{if(fini)return;fini=true;try{process.kill(-srv.pid)}catch(e){}try{process.kill(-ch.pid)}catch(e){}setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true})}catch(e){}process.exit(code||0);},800);};
process.on('SIGTERM',()=>fin(1));process.on('SIGINT',()=>fin(1));
setTimeout(()=>{console.error('banc trop long : arrêt');fin(2);},9*60*1000);
const dort=ms=>new Promise(r=>setTimeout(r,ms));
let ws,id=0;const att=new Map();let ERR=[],R404=[];
function cdp(method,params){return new Promise((res,rej)=>{const i=++id;att.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params:params||{}}));setTimeout(()=>{if(att.has(i)){att.delete(i);rej(new Error('délai '+method));}},90000);});}
async function ev(expr){const r=await cdp('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)return {err:(r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text};return r.result.value;}
async function clic(x,y){for(const type of ['mousePressed','mouseReleased'])await cdp('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});}
async function attends(expr,s){for(let k=0;k<s*2;k++){if(await ev(expr).catch(()=>false)===true)return true;await dort(500);}return false;}
const SAVE={v:2,sfx:false,mus:true,vox:false,tuto:1,permis:1,facile:0,ex:{runs:5},plq:{m:'fr',x:'CC-161-TR',ok:1}};
const DISPOS=[{nom:'couché',w:844,h:390,q:'?colonne=0&garde=1',cadre:false},{nom:'debout',w:390,h:844,q:'?colonne=0&garde=1',cadre:false},{nom:'cadre',w:1280,h:800,q:'?garde=1',cadre:true}];
(async()=>{
  for(let k=0;k<240&&!ws;k++){await dort(500);try{const L=await (await fetch('http://127.0.0.1:'+PC+'/json/list')).json();const t=L.find(x=>x.type==='page');if(t)ws=new WebSocket(t.webSocketDebuggerUrl);}catch(e){}}
  if(!ws)throw new Error('Chrome ne répond pas');
  await new Promise(r=>ws.onopen=r);
  ws.onmessage=m=>{const d=JSON.parse(m.data);
    if(d.id&&att.has(d.id)){const a=att.get(d.id);att.delete(d.id);a.res(d.result||{});return;}
    if(d.method==='Runtime.exceptionThrown')ERR.push(String((d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description)||d.params.exceptionDetails.text).slice(0,300));
    if(d.method==='Network.responseReceived'&&d.params.response.status>=400)R404.push(d.params.response.status+' '+d.params.response.url.replace(/^https?:\/\/[^/]+/,''));};
  await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');
  await cdp('Network.setBypassServiceWorker',{bypass:true});await cdp('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'try{if(window===top&&!sessionStorage.bancTr){sessionStorage.bancTr=1;localStorage.setItem("cashcarSave",'+JSON.stringify(JSON.stringify(SAVE))+');}}catch(e){}'});
  const OUT=[];
  for(const D of DISPOS){
    ERR=[];R404=[];
    await cdp('Emulation.setDeviceMetricsOverride',{width:D.w,height:D.h,deviceScaleFactor:1,mobile:false});
    await cdp('Page.navigate',{url:'http://127.0.0.1:'+PH+'/index.html'+D.q});
    const W=D.cadre?"document.getElementById('colonne').contentWindow":"window";
    const r={nom:D.nom};
    r.charge=await attends("(function(){try{const w="+W+";return typeof w.dbgFren==='function'&&!!w.document.querySelector('[data-m=\"play\"]')}catch(e){return false}})()",150);
    let cx=D.w/2,cy=D.h/2;
    if(D.cadre){const b=await ev("(function(){const r=document.getElementById('colonne').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()");if(Array.isArray(b)){cx=b[0];cy=b[1];}}
    for(let k=0;k<12;k++){const sp=await ev("(function(){const w="+W+",s=w.document.getElementById('splash');return !!s&&s.isConnected&&w.getComputedStyle(s).display!=='none'&&w.getComputedStyle(s).visibility!=='hidden'})()");if(sp!==true)break;await clic(cx,cy);await dort(700);}
    await dort(2500);
    await ev("(function(){const w="+W+";w.document.querySelector('[data-m=\"play\"]').click();try{w.dbgAuto(1,0)}catch(e){};return 1})()");
    r.course=await attends("(function(){try{return "+W+".document.body.classList.contains('play')}catch(e){return false}})()",60);
    await ev("(function(){try{"+W+".dbgAuto(1,0)}catch(e){};return 1})()");await dort(4000);
    r.fren=await ev("(function(){const w="+W+";w.dbgFren('v',100);w.dbgFren('entre');return 1})()");
    await dort(1500);
    r.etat=await ev("(function(){const w="+W+",el=w.document.getElementById('musique'),f=w.dbgFren();return {lv:f.lv,musique:f.musique,el:el?el.src.replace(w.location.origin,'')+(el.paused?' (pause)':' (joue)'):null,pouce:w.POUCE_JEU&&w.POUCE_JEU.ch?+w.POUCE_JEU.ch.g.gain.value.toFixed(3):null,gameOver:!!w.dbgState&&w.dbgState().gameOver,loopErr:w.__loopErr||null,banqErr:w.__banqErr||null}})()");
    await ev("(function(){"+W+".dbgFren('pose',0);return 1})()");await dort(1200);
    r.apres=await ev("(function(){const w="+W+",f=w.dbgFren();return {lv:f.lv,musique:f.musique,pouce:w.POUCE_JEU&&w.POUCE_JEU.ch?+w.POUCE_JEU.ch.g.gain.value.toFixed(3):null,loopErr:w.__loopErr||null}})()");
    r.erreurs=ERR.slice();r.http4xx=R404.slice();
    OUT.push(r);console.log(JSON.stringify(r));
  }
  fs.writeFileSync(SORTIE,JSON.stringify(OUT,null,1));
  fin(0);
})().catch(e=>{console.error('ÉCHEC',e);fin(1);});
