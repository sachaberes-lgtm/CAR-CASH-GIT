/* ville-cyber-page.cjs (2026-11-18, LA VILLE CYBERPUNK, lot A) : le banc CHROME des modules route-ville, dans le vrai jeu (Chrome du Mac sans fenêtre, MUET :
   --mute-audio et sfx/mus/vox coupés dans la sauvegarde). Un jeu = module:graine:LARGExHAUT ; pour chacun : la course (?villescene=<module>&pistegraine=<graine>&tel=1),
   le pilote auto (dbgAuto, nitro coupée) du départ jusqu'après le module, et :
   · dbgVilleAudit() (dans / frole / flotte) ; les erreurs de la console et les exceptions ;
   · le MODE de la caisse à chaque relevé DANS le module (un 'fall' = un décollage subi) et la mort (abscisse, cause) ;
   · les COMPTES d'une vraie image (renderBufferDirect enveloppé le temps d'une image : appels, triangles × instances) tous les ~1 s, en moyenne sur la course et dans le
     module ; renderer.info.memory (géométries, textures) et le nombre de programmes ;
   · 3 photos dans le module (PNG → JPEG par sips, 1100 px au plus).
   À lancer SOUS LE VERROU (~/cash-car/verrou-banc.sh prendre …) ; le serveur : node outils/banc-maps/serveur.cjs <port> <racine>.
   node ville-cyber-page.cjs --port=8371 --cdp=9571 --jeux=pique:3:844x390,russes:11:390x844 --out=<dossier> [--q=a=b] [--photos=0] [--profil=<nom>] [--ph=.02,.5 : les fractions du module où photographier] [--fin=<m>] */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8371),CDP=+(opt.cdp||9571),OUT=opt.out||'.';fs.mkdirSync(OUT,{recursive:true});
const dort=ms=>new Promise(r=>setTimeout(r,ms)),log=function(){console.log.apply(console,arguments);};
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){const udd=path.join(os.tmpdir(),'cc-banc-'+(opt.profil||'ville-cyber-a'));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,900','--mute-audio',
    '--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore',detached:true});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}throw new Error('Chrome ne répond pas');}
function tueChrome(){if(!chrome)return;try{process.kill(-chrome.pid,'SIGKILL');}catch(e){}try{chrome.kill('SIGKILL');}catch(e){}chrome=null;} /* le GROUPE de processus de MON Chrome */
process.on('exit',tueChrome);process.on('SIGINT',function(){tueChrome();process.exit(1);});process.on('SIGTERM',function(){tueChrome();process.exit(1);});
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.erreurs=[];
    ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'&&r.params.type==='error'){this.erreurs.push('CONSOLE '+r.params.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ').slice(0,240));}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.erreurs.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n').slice(0,2).join(' | '));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(e,t){const r=await this.call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true,timeout:t||60000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(e,ms,pas){const t0=Date.now();while(Date.now()-t0<ms){try{if(await this.ev('!!('+e+')'))return true;}catch(x){}await dort(pas||250);}return false;}}
async function ouvre(W,H){const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank'),ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);p.id=t.id;await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  await p.call('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:2,mobile:true,screenOrientation:W>H?{type:'landscapePrimary',angle:90}:{type:'portraitPrimary',angle:0}});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});return p;}
async function ferme(p){try{p.ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+p.id);}catch(e){}}
async function lance(p){
  for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
  await p.attend('!window.__introCouvre',60000);await dort(600);await p.attend("document.body.classList.contains('titreCiel')",45000);
  for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
  let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}return st;}
const COMPTE="window.__vcCompte=function(){const R=dbgScene().rdr,o=R.renderBufferDirect;let c=0,t=0,on=true;R.renderBufferDirect=function(cam,sc,geo,mat,obj,grp){if(on){let n=geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0);if(geo.drawRange&&geo.drawRange.count!==Infinity)n=Math.min(n,geo.drawRange.count);if(grp)n=Math.min(n,grp.count);const k=obj.isInstancedMesh?obj.count:(geo.isInstancedBufferGeometry?(geo.instanceCount===Infinity?1:geo.instanceCount):1);c++;t+=(obj.isPoints?n:obj.isLine||obj.isLineSegments?n/2:n/3)*k;}return o.apply(this,arguments);};"+
  "return new Promise(function(ok){requestAnimationFrame(function(){requestAnimationFrame(function(){on=false;R.renderBufferDirect=o;ok({c:c,t:Math.round(t),geo:R.info.memory.geometries,tex:R.info.memory.textures,prog:(R.info.programs||[]).length});});});});};true";
async function jeu(mod,g,W,H){const q='?intro=ancien&attente=0&prebati=0&carte=ville&meteo=soir&pistegraine='+g+'&tel=1'+(mod&&mod!=='aucun'?'&villescene='+mod:'')+(opt.q?'&'+opt.q:'');
  const url='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html'+q,p=await ouvre(W,H),r={mod:mod,g:g,ecran:W+'x'+H,url:q};const t0=Date.now();
  try{await p.call('Page.navigate',{url:url});if(!await p.attend('window.__gameReady',180000,300))throw new Error('__gameReady jamais levé');r.pret=Date.now()-t0;
    if(!await lance(p))throw new Error('course pas lancée');await p.ev("dbgAuto(1,0,{nit:0})");await p.ev(COMPTE);await dort(2500);
    const M=await p.ev('dbgMods()');r.mods=M.map(m=>m.fig);const m=M.find(x=>x.fig===mod)||null;r.module=m?{s0:m.s0,s1:m.s1}:null;
    const A=await p.ev('(function(){const a=dbgVilleAudit()||{};return {dans:a.dans,frole:a.frole,flotte:a.flotte,exDans:a.exDans,exFrole:a.exFrole,exFlotte:a.exFlotte,volumes:a.volumes,neons:a.neons};})()',120000);r.audit=A;
    const vC=+(opt.vc||78) /* la croisière de conception au palier 0 (le banc part au palier 0) : MODS.s1 = la fin du module + 1 s de croisière */,fin=opt.fin?+opt.fin:(m?m.s1+150:2500),ph=m?(opt.ph?opt.ph.split(',').map(Number):[.15,.45,.75]).map(f=>m.s0+(m.s1-vC-m.s0)*f):[],modes={},Ct=[],Cm=[];let der=0,k=0;r.photos=[];
    while(Date.now()-t0<170000){const s=await p.ev('(function(){const s=dbgState(),R=dbgRoute();return {go:s.gameOver,mode:s.mode,s:Math.round(R.s||0),cause:R.cause||null};})()');
      if(s.go){r.mort={s:s.s,cause:s.cause};break;}const dans=m&&s.s>=m.s0&&s.s<=m.s1-vC;if(dans)modes[s.mode]=(modes[s.mode]||0)+1;if(s.mode!=='drive'){r.vols=r.vols||[];if(r.vols.length<60)r.vols.push(s.s);}
      if(Date.now()-der>900){der=Date.now();const c=await p.ev('__vcCompte()');Ct.push(c);if(dans)Cm.push(c);}
      if(opt.photos!=='0'&&k<ph.length&&s.s>=ph[k]){const f=path.join(OUT,mod+'-g'+g+'-'+W+'x'+H+'-'+(k+1)+'-s'+s.s);const im=await p.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f+'.png',Buffer.from(im.data,'base64'));
        spawnSync('sips',['-s','format','jpeg','-s','formatOptions','62','-Z','1100',f+'.png','--out',f+'.jpg'],{stdio:'ignore'});try{fs.unlinkSync(f+'.png');}catch(e){}r.photos.push(path.basename(f)+'.jpg');k++;}
      if(s.s>fin)break;await dort(250);}
    const moy=function(L){if(!L.length)return null;const o={n:L.length};for(const key of ['c','t','geo','tex','prog'])o[key]=Math.round(L.reduce((a,b)=>a+b[key],0)/L.length);o.cMax=Math.max.apply(null,L.map(x=>x.c));o.tMax=Math.max.apply(null,L.map(x=>x.t));return o;};
    r.modes=modes;r.comptes={course:moy(Ct),module:moy(Cm)};r.sFin=(await p.ev('Math.round(dbgRoute().s||0)'));}
  catch(e){r.erreurBanc=String(e.message||e);}
  r.erreurs=p.erreurs.filter(e=>!/vibrate|favicon|WebGL|GPU stall|GL_/.test(e)).slice(0,10);await ferme(p);return r;}
(async function(){const R=[];try{await lanceChrome();
  for(const j of (opt.jeux||'').split(',').filter(Boolean)){const [mod,g,wh]=j.split(':'),[W,H]=(wh||'844x390').split('x').map(Number);const r=await jeu(mod,+g,W,H);R.push(r);
    log(JSON.stringify({mod:r.mod,g:r.g,ecran:r.ecran,module:r.module,mods:r.mods,audit:r.audit&&{dans:r.audit.dans,frole:r.audit.frole,flotte:r.audit.flotte,exFlotte:r.audit.exFlotte,exFrole:r.audit.exFrole},modes:r.modes,mort:r.mort||null,sFin:r.sFin,comptes:r.comptes,erreurs:r.erreurs,erreurBanc:r.erreurBanc||null,vols:r.vols||null,photos:r.photos}));}}
  catch(e){log('ERREUR DU BANC',e.message);}finally{fs.writeFileSync(path.join(OUT,'page-'+(opt.nom||'banc')+'.json'),JSON.stringify(R,null,1));tueChrome();}})();
