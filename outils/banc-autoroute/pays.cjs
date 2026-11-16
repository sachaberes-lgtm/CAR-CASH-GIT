/* ===== LE BANC DES AUTOROUTES DU MONDE (2026-11-15) — photographie les maquettes `outils/banc-autoroute/pays/<xx>.js` sur la vraie route =====
   node outils/banc-autoroute/pays.cjs --pays=fr,de,us --carte=nuages:soir --out=<dossier> [--cdp=9600] [--port=8260] [--tel=1] [--s=420]
        [--vues=jeu,haut,loin,avion,vite] [--graine=7] [--garde=1] [--stop=1]
   · `us` (ou un code sans fichier) = l'autoroute vivante d'aujourd'hui, la référence.
   · --garde=1 : la Chrome reste ouverte, la course figée ; l'appel suivant (même --cdp, même carte) repeint et photographie en 2-3 s.
     À la fin d'une séance : `--stop=1 --cdp=<le même>` (tue la Chrome et le serveur de ce banc).
   · Un --cdp et un --port PAR séance en parallèle (le profil Chrome en dépend).
   Sortie : <out>/<carte>-<meteo>[-tel]/<xx>-<vue>.jpg, et sur la sortie standard une ligne JSON par pays (stats du peintre, erreurs de la page).
   Muet : sauvegarde sans son + --mute-audio. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z0-9]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const CDP=+(opt.cdp||9600),PORT=+(opt.port||(CDP-1340)),TEL=opt.tel==='1',GRAINE=opt.graine||'7',PAUSE=+(opt.s||420);
const RACINE=path.resolve(__dirname,'..','..'),PLANS=path.resolve(opt.plans||path.join(__dirname,'pays'));
const CARTE=opt.carte||'nuages:soir',VUES=(opt.vues||'jeu,haut,loin,avion').split(','),PAYS=(opt.pays||'us').split(',').filter(Boolean);
const TAG=CARTE.replace(/:/g,'-')+(TEL?'-tel':''),OUT=path.resolve(opt.out||path.join(__dirname,'sorties'),TAG);
const PIDF=path.join(os.tmpdir(),'cc-banc-pays-'+CDP+'.json');
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const getJson=u=>new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));
const putJson=u=>new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});
const vit=u=>new Promise(ok=>http.get(u,r=>{r.resume();ok(true);}).on('error',()=>ok(false)));
function tue(pid){try{spawnSync('taskkill',['/F','/T','/PID',String(pid)],{stdio:'ignore'});}catch(e){}}
function stop(){try{const j=JSON.parse(fs.readFileSync(PIDF,'utf8'));for(const p of [j.chrome,j.serveur])if(p)tue(p);fs.unlinkSync(PIDF);}catch(e){}}
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.err=[];
  ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
    else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.err.push('EXCEPTION '+String((d.exception&&d.exception.description)||d.text).split('\n')[0].slice(0,300));}
    else if(r.method==='Runtime.consoleAPICalled'&&(r.params.type==='error'||r.params.type==='warning')){const t=r.params.args.map(a=>a.value||a.description||'').join(' ');if(/arp|pays|shader|WebGL|GLSL|program/i.test(t))this.err.push(r.params.type+': '+t.slice(0,600));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(e,t){const r=await this.call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true,timeout:t||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(e,ms,pas){const t0=Date.now();while(Date.now()-t0<ms){try{if(await this.ev('!!('+e+')'))return true;}catch(x){}await dort(pas||250);}return false;}
  async photo(f){const r=await this.call('Page.captureScreenshot',{format:'jpeg',quality:88});fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;}}
const MASQUE=String(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');f.style.setProperty('opacity','0','important');}e=p;}return 1;});
/* les cadres : calculés une fois (la caisse est figée), les mêmes pour tous les pays */
const CADRES=String(function(tel){const R=dbgRoute(),s=R.s||0,at=function(sv){return Math.max(1,Math.min(R.NP-2,Math.round(sv/R.L*(R.NP-1))));};
  const f=function(sv,ar,ht,av,hc,fov,lat){const i=at(sv),p=R.pts[i],t=R.T[i],n=R.Nn[i],b=R.B[i],l=lat||0;
    return {p:[p.x-t.x*ar+n.x*ht+b.x*l,p.y-t.y*ar+n.y*ht+b.y*l,p.z-t.z*ar+n.z*ht+b.z*l],c:[p.x+t.x*av+n.x*hc+b.x*l,p.y+t.y*av+n.y*hc+b.y*l,p.z+t.z*av+n.z*hc+b.z*l],fov:fov};};
  const l=R.lat||0;
  return {s:Math.round(s),lat:l,L:Math.round(R.L),demi:R.demi,
    jeu:f(s,tel?12:9.5,tel?5.2:3.8,tel?22:18,1,tel?74:64,l),vite:f(s,tel?12:9.5,tel?5.2:3.8,tel?22:18,1,tel?74:64,l),
    haut:f(s+10,38,tel?20:13,tel?60:80,0,tel?70:60,0),loin:f(s+60,0,2.4,90,1.2,tel?66:50,-R.demi*.3),avion:f(s+50,6,tel?150:82,6,0,tel?52:56,0)};});
async function ouvre(){
  if(!await vit('http://127.0.0.1:'+PORT+'/code/ORDRE.txt')){const sv=spawn(process.execPath,[path.join(RACINE,'outils','banc-maps','serveur.cjs'),String(PORT),RACINE],{detached:true,stdio:'ignore',windowsHide:true});sv.unref();
    let j={};try{j=JSON.parse(fs.readFileSync(PIDF,'utf8'));}catch(e){}j.serveur=sv.pid;fs.writeFileSync(PIDF,JSON.stringify(j));
    for(let i=0;i<50&&!await vit('http://127.0.0.1:'+PORT+'/code/ORDRE.txt');i++)await dort(200);}
  let vivant=false;try{await getJson('http://127.0.0.1:'+CDP+'/json/version');vivant=true;}catch(e){}
  if(!vivant){const udd=path.join(os.tmpdir(),'cc-banc-pays-'+CDP);fs.mkdirSync(udd,{recursive:true});
    const ch=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,720','--mute-audio',
      '--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{detached:true,stdio:'ignore',windowsHide:true});ch.unref();
    let j={};try{j=JSON.parse(fs.readFileSync(PIDF,'utf8'));}catch(e){}j.chrome=ch.pid;fs.writeFileSync(PIDF,JSON.stringify(j));
    for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');break;}catch(e){await dort(200);}}}
  const tabs=await getJson('http://127.0.0.1:'+CDP+'/json');let t=tabs.find(x=>x.type==='page'&&/index\.html/.test(x.url));const neuf=!t;
  if(!t)t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((o,k)=>{ws.onopen=o;ws.onerror=k;});
  const p=new Page(ws);await p.call('Runtime.enable');
  let pret=false;if(!neuf){try{pret=await p.ev('window.__paysPret==='+JSON.stringify(TAG+'|'+PAUSE+'|'+GRAINE));}catch(e){}}
  if(!pret){await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
    if(TEL){await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
    else await p.call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
    await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.clear();localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
    const cm=CARTE.split(':');
    const url='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&carte='+cm[0]+(cm[1]?'&meteo='+cm[1]:'')+(cm[2]?'&teinte='+cm[2]:'')+'&pistegraine='+GRAINE+(TEL?'&tel=1':'&colonne=0&poste=max')+(opt.q?'&'+opt.q:'');
    await p.call('Page.navigate',{url});if(!await p.attend('window.__gameReady',180000))throw new Error('jeu pas prêt');
    for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(400);}
    await p.attend("document.body.classList.contains('titreCiel')",60000);
    for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(500);}
    let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
    if(!st)throw new Error('course pas lancée');
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");if(!TEL)await p.ev("(function(){try{dbgQual(0);}catch(e){}})()");
    await p.ev('('+MASQUE+')()');
    const tc=Date.now();let et=null;while(Date.now()-tc<40000){et=await p.ev('(function(){const s=dbgState(),R=dbgRoute();return {go:s.gameOver,s:Math.round(R.s||0)};})()');if(et.go||et.s>=PAUSE)break;await dort(50);}
    if(et.go)throw new Error('la caisse est morte à s='+et.s);
    await p.ev("dbgDA({fige:1})");await p.ev("(function(){try{dbgFlou({s:0});}catch(e){}})()");
    await p.ev('window.__paysCadres=('+CADRES+')('+(TEL?1:0)+');window.__paysPret='+JSON.stringify(TAG+'|'+PAUSE+'|'+GRAINE));}
  return p;}
(async function(){
  if(opt.stop==='1'){stop();console.log('arrêté');return;}
  fs.mkdirSync(OUT,{recursive:true});const p=await ouvre();
  const C=await p.ev('window.__paysCadres');
  for(const code of PAYS){const r={pays:code,carte:TAG,s:C.s};p.err.length=0;
    try{const f=path.join(PLANS,code+'.js');
      if(fs.existsSync(f)){await p.ev(fs.readFileSync(f,'utf8')+'\n;1');r.etat=await p.ev('dbgPays('+JSON.stringify(code)+')');}
      else r.etat=await p.ev('dbgPays('+JSON.stringify(code)+')'); /* pas de fichier : le plan du JEU s'il existe, sinon l'américaine (us) */
      for(const v of VUES){if(!C[v])continue;await p.ev("dbgPays('file',"+(v==='vite'?1.3:0)+")");const o=JSON.stringify(C[v]);
        await p.ev("dbgAudit('vue',"+o+")");await dort(260);await p.ev("dbgAudit('vue',"+o+")");await dort(160);
        await p.photo(path.join(OUT,code+'-'+v+'.jpg'));}
      r.photos=VUES.map(v=>path.join(OUT,code+'-'+v+'.jpg'));
    }catch(e){r.erreur=String(e.message||e).slice(0,900);}
    if(p.err.length)r.page=p.err.slice(0,5);console.log(JSON.stringify(r));}
  try{p.ws.close();}catch(e){}
  if(opt.garde!=='1')stop();
})().catch(e=>{console.error('ÉCHEC',e&&e.message||e);if(opt.garde!=='1')stop();process.exit(1);});
