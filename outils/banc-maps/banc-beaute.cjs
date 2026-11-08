/* banc beauté : une Chrome, chaque map en téléphone (ALLEGE) et/ou ordi ; photos sans flou + chiffres de rendu
   node zzbanc.cjs <sortie> <modes: tel,pc> <cartes: nuages:soir,jade:soir,...> [q=params] */
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),http=require('http'),os=require('os');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',CDP=9473,PORT=8241;
const OUT=process.argv[2],MODES=(process.argv[3]||'tel,pc').split(','),CARTES=(process.argv[4]||'nuages:soir').split(','),Q=process.argv[5]||'';
fs.mkdirSync(OUT,{recursive:true});
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const getJson=u=>new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));
const putJson=u=>new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.err=[];
  ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
    else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.err.push(String((d.exception&&d.exception.description)||d.text).split('\n')[0]);}
    else if(r.method==='Runtime.consoleAPICalled'&&r.params.type==='error'){this.err.push('console: '+r.params.args.map(a=>a.value||a.description||'').join(' ').slice(0,200));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(e){const r=await this.call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true,timeout:120000});if(r.exceptionDetails)throw new Error((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text);return r.result.value;}
  async attend(e,ms){const t0=Date.now();while(Date.now()-t0<ms){try{if(await this.ev('!!('+e+')'))return true;}catch(x){}await dort(250);}return false;}
  async photo(f){const r=await this.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));}}
(async function(){
  const udd=path.join(os.tmpdir(),'cc-banc-zz');fs.mkdirSync(udd,{recursive:true});
  const ch=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--window-size=1280,800','--mute-audio','--use-angle=metal','--ignore-gpu-blocklist',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');break;}catch(e){await dort(200);}}
  const bilan=[];
  try{for(const mode of MODES)for(const cm of CARTES){const [c,m]=cm.split(':');const tag=c+(m?'-'+m:'')+'-'+mode;const t0=Date.now();
    const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((o,k)=>{ws.onopen=o;ws.onerror=k;});
    const p=new Page(ws);await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
    if(mode==='tel'){await p.call('Emulation.setDeviceMetricsOverride',{width:393,height:852,deviceScaleFactor:3,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
    else await p.call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
    await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.clear();localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false,q:'net',qChoisi:1}));}catch(e){}"});
    const url='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&carte='+c+(m?'&meteo='+m:'')+(mode==='tel'?'&tel=1':'&colonne=0')+(Q?'&'+Q:'');
    let r={tag};
    try{await p.call('Page.navigate',{url});if(!await p.attend('window.__gameReady',180000))throw new Error('pas prêt');
      for(let i=0;i<40&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(400);}
      await p.attend("document.body.classList.contains('titreCiel')",40000);
      for(let i=0;i<6&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(500);}
      let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('dbgState().started&&dbgState().running',40000);}
      if(!st)throw new Error('course pas lancée');
      await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");await dort(7000);
      r.qual=await p.ev("(function(){try{const q=dbgQual();return {k:q.k,dpr:q.dpr,pl:q.plancher};}catch(e){return String(e);}})()");
      r.pal=await p.ev("(function(){try{const q=dbgPalier();return q.n+' '+q.src;}catch(e){return String(e);}})()");
      r.dessin=await p.ev("(function(){try{const s=dbgScene&&dbgScene();return null;}catch(e){return null;}})()");
      const L=await p.ev('dbgRoute().L'),s0=await p.ev('Math.round(dbgRoute().s||0)');
      await p.ev("(function(){try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW','hud','mobCtl','bNitro']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
      const S=[s0+60,s0+400];r.photos=[];
      for(const s of S){const o=await p.ev("(function(s){const R=dbgRoute();const i=Math.max(1,Math.min(R.NP-2,Math.round(s/R.L*(R.NP-1))));const p=R.pts[i],t=R.T[i],n=R.Nn[i];return {p:[p.x-t.x*40+n.x*14,p.y-t.y*40+n.y*14,p.z-t.z*40+n.z*14],c:[p.x+t.x*80,p.y+t.y*80,p.z+t.z*80]};})("+s+")");
        await p.ev("dbgAudit('vue',{p:"+JSON.stringify(o.p)+",c:"+JSON.stringify(o.c)+",fov:62})");await dort(500);await p.ev("dbgAudit('vue',{p:"+JSON.stringify(o.p)+",c:"+JSON.stringify(o.c)+",fov:62})");
        const f=path.join(OUT,tag+'-s'+s+'.png');await p.photo(f);r.photos.push(f);}
      r.rendu=await p.ev("(function(){try{const a=dbgAppels(0);return {appels:a.appels||a.tot,tri:a.triangles||a.tri};}catch(e){return String(e);}})()");
    }catch(e){r.erreur=String(e.message||e);}
    r.err=p.err.slice(0,8);r.s=Math.round((Date.now()-t0)/1000);bilan.push(r);console.log(JSON.stringify(r));
    try{ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+t.id);}catch(e){}}}
  finally{fs.writeFileSync(path.join(OUT,'bilan.json'),JSON.stringify(bilan,null,1));ch.kill('SIGKILL');console.log('FIN');}
})();
