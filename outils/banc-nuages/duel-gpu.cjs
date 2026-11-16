/* LE DUEL GPU DES NUAGES (2026-11-15, optimiseur) : node outils/banc-nuages/duel-gpu.cjs <cdp> <urlA> <urlB> [vues=24] [tours=6] [tel 0|1] — chaque onglet passe au premier plan avant sa mesure.
   ⚠ MESURÉ : l onglet B garde ~7 % d avance (position) : lancer les DEUX ordres (avant/branche puis branche/avant) et comparer les rapports. Les serveurs : serveur-sonde.cjs (8340 branche, 8341 wt-avant). */
/* le duel dans UN SEUL Chrome (même processus graphique) : deux onglets, A et B, mêmes vues mesurées en alternance.
   node duo.cjs <cdp> <urlA> <urlB> [vues=24] [tours=6] [tel 0|1] */
const fs=require('fs'),path=require('path'),os=require('os'),http=require('http'),{spawn}=require('child_process');
const [CDP,UA,UB]=[+process.argv[2],process.argv[3],process.argv[4]],NV=+(process.argv[5]||24),TOURS=+(process.argv[6]||6),TEL=process.argv[7]==='1';
const dort=ms=>new Promise(r=>setTimeout(r,ms));
function getJson(u,m){return new Promise((ok,ko)=>{const r=http.request(u,{method:m||'GET'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
async function onglet(){const t=await getJson('http://127.0.0.1:'+CDP+'/json/new?about:blank','PUT');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  let n=0;const att={};ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&att[r.id]){const a=att[r.id];delete att[r.id];a(r);}};
  const call=(method,params)=>new Promise(ok=>{const id=++n;att[id]=ok;ws.send(JSON.stringify({id,method,params:params||{}}));});
  const ev=async e=>{const r=await call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});return r.result&&r.result.result?r.result.result.value:(r.result&&r.result.exceptionDetails?'EXC '+JSON.stringify(r.result.exceptionDetails).slice(0,300):null);};
  await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});
  if(TEL){await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});}else await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  return {ws,call,ev};}
async function prepare(p,url){await p.call('Page.navigate',{url});const at=async(e,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){try{if(await p.ev('!!('+e+')')===true)return true;}catch(x){}await dort(250);}return false;};
  if(!await at('window.__gameReady',240000))throw new Error('gameReady '+url);
  for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
  await at("document.body.classList.contains('titreCiel')",60000);
  for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
  let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await at('window.dbgState&&dbgState().started&&dbgState().running',45000);}
  return await p.ev(fs.readFileSync(path.join(__dirname,'q-pause.js'),'utf8'));}
const MES=`(function(k,N){const R=dbgRoute(),s=R.L*(.04+.92*k/(N-1)),i=Math.round(s/R.L*(R.NP-1)),p=R.pts[i],t=R.T[i],n=R.Nn[i];try{dbgScene().car.visible=false;}catch(e){}
 const o={p:[p.x-t.x*11+n.x*4.5,p.y-t.y*11+n.y*4.5,p.z-t.z*11+n.z*4.5],c:[p.x+t.x*40+n.x*1.5,p.y+t.y*40+n.y*1.5,p.z+t.z*40+n.z*1.5],fov:62};
 const gl=dbgScene().rdr.getContext(),px=new Uint8Array(4);dbgAudit('vue',o);dbgAudit('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
 const t0=performance.now();for(let f=0;f<6;f++)dbgAudit('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return (performance.now()-t0)/6;})`;
(async()=>{const prof=path.join(os.tmpdir(),'cc-banc-pro-nuages-duo'+(TEL?'-tel':''));fs.mkdirSync(prof,{recursive:true});
  const ch=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+prof,'--no-first-run','--no-default-browser-check','--window-size=1280,800','--mute-audio','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  try{for(let i=0;i<200;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');break;}catch(e){await dort(300);}}
    const pa=await onglet(),pb=await onglet();console.log('A',JSON.stringify(await prepare(pa,UA)));console.log('B',JSON.stringify(await prepare(pb,UB)));
    for(const [nm,p] of [['A',pa],['B',pb]])console.log('etat',nm,await p.ev('JSON.stringify([dbgState().paused,dbgState().gameOver,dbgCoton().nuages])'));const rA=[],rB=[];for(let k=0;k<NV;k++){const a=[],b=[];for(let t=0;t<TOURS;t++){const ord=t%2?[[pb,b],[pa,a]]:[[pa,a],[pb,b]];for(const [p,arr] of ord){await p.call("Page.bringToFront");await dort(150);arr.push(await p.ev(MES+'('+k+','+NV+')'));}}
      a.sort((x,y)=>x-y);b.sort((x,y)=>x-y);rA.push(a[a.length>>1]);rB.push(b[b.length>>1]);}
    const med=v=>{const s=v.slice().sort((x,y)=>x-y);return s[s.length>>1];},sum=v=>v.reduce((x,y)=>x+y,0);let bm=0;for(let k=0;k<NV;k++)if(rB[k]<rA[k])bm++;
    console.log('vues A',rA.map(x=>x.toFixed(1)).join(' '));console.log('vues B',rB.map(x=>x.toFixed(1)).join(' '));
    console.log('BILAN A méd',med(rA).toFixed(2),'somme',sum(rA).toFixed(1),'max',Math.max(...rA).toFixed(2),'| B méd',med(rB).toFixed(2),'somme',sum(rB).toFixed(1),'max',Math.max(...rB).toFixed(2),'| B plus rapide sur',bm,'/',NV);
  }finally{try{require('child_process').spawnSync('taskkill',['/F','/T','/PID',String(ch.pid)],{stdio:'ignore'});}catch(e){}}
  process.exit(0);})();
