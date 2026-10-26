// Petit pilote CDP (Chrome du Mac sans fenêtre, muet) — NON COMMITÉ. Voir la mémoire « banc-cdp-sans-puppeteer ».
const cp=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const procs=[];
function tue(){for(const p of procs){try{process.kill(-p.pid,'SIGKILL');}catch(e){}try{p.kill('SIGKILL');}catch(e){}}procs.length=0;}
process.on('exit',tue);for(const s of ['SIGINT','SIGTERM'])process.on(s,()=>{tue();process.exit(1);});
process.on('uncaughtException',e=>{console.error(e);tue();process.exit(1);});
const dort=ms=>new Promise(r=>setTimeout(r,ms));
function libre(port){try{const o=cp.execSync('lsof -iTCP:'+port+' -sTCP:LISTEN -t',{stdio:['ignore','pipe','ignore']}).toString().trim();return !o;}catch(e){return true;}}
async function attendLibre(port){for(let i=0;i<60&&!libre(port);i++)await dort(500);if(!libre(port))throw new Error('port '+port+' pris');}
async function serveur(dir,port){await attendLibre(port);
  const p=cp.spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:dir,detached:true,stdio:'ignore'});procs.push(p);
  for(let i=0;i<100;i++){await dort(200);if(!libre(port))return p;}throw new Error('serveur muet');}
async function chrome(port,o){o=o||{};await attendLibre(port);
  const ud=fs.mkdtempSync(path.join(o.tmp||os.tmpdir(),'cc-chrome-'));
  const args=['--headless=new','--mute-audio','--autoplay-policy=no-user-gesture-required','--remote-debugging-port='+port,'--user-data-dir='+ud,
    '--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',
    '--window-size='+(o.w||844)+','+(o.h||390)].concat(o.args||[]).concat(['about:blank']);
  const p=cp.spawn(CHROME,args,{detached:true,stdio:'ignore'});procs.push(p);
  let cible=null;for(let i=0;i<600&&!cible;i++){await dort(200);try{const l=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();cible=l.find(t=>t.type==='page');}catch(e){}}
  if(!cible)throw new Error('chrome muet');
  const ws=new WebSocket(cible.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  let id=0;const att=new Map(),ecoute=[];
  ws.onmessage=ev=>{const m=JSON.parse(ev.data);if(m.id&&att.has(m.id)){const a=att.get(m.id);att.delete(m.id);m.error?a.j(new Error(JSON.stringify(m.error))):a.r(m.result);}else for(const f of ecoute)f(m);};
  const send=(method,params)=>new Promise((r,j)=>{const i=++id;att.set(i,{r,j});ws.send(JSON.stringify({id:i,method,params:params||{}}));});
  const ev=async(expr,aw)=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:!!aw,timeout:600000});
    if(r.exceptionDetails)throw new Error('JS : '+(r.exceptionDetails.exception&&r.exceptionDetails.exception.description||r.exceptionDetails.text));return r.result.value;};
  return {send,ev,ecoute,ws,proc:p};}
module.exports={serveur,chrome,tue,dort,libre};
