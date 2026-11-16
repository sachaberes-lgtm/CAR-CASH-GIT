/* LE PROFIL DU TIRAGE EN CHROME (2026-11-14, optimisation de la ville) : un onglet, dbgGenRoute(carte, graine, palier) sur des graines, sous le profileur JavaScript
   de Chrome (CDP Profiler) ; temps propre et inclusif par fonction.
   node outils/banc-routes/tirage-chrome-profil.cjs --url=http://127.0.0.1:8323 [--q=&sans=…] [--cartes=ville,crypto] [--paliers=0,10,20] [--graines=1-6] [--cdp=9526] */
const path=require('path'),os=require('os'),fs=require('fs'),cp=require('child_process');
const {tueChrome,CDP,dormir}=require('../banc-trainees/cdp.cjs');
const o={};for(const a of process.argv.slice(2)){const m=/^--([^=]+)=(.*)$/.exec(a);if(m)o[m[1]]=m[2];}
const CARTES=(o.cartes||'ville,crypto').split(','),PAL=(o.paliers||'0,10,20').split(',').map(Number),[g0,g1]=(o.graines||'1-6').split('-').map(Number),PORT=+(o.cdp||9526);
(async()=>{const prof=fs.mkdtempSync(path.join(os.tmpdir(),'pv-tprof-'));
  const ch=cp.spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+prof,'--no-first-run','--mute-audio','--use-angle=d3d11','--ignore-gpu-blocklist','--window-size=1000,700','about:blank'],{stdio:'ignore',detached:true});
  let t=null;for(let i=0;i<240&&!t;i++){await dormir(500);try{t=(await (await fetch('http://127.0.0.1:'+PORT+'/json')).json()).find(x=>x.type==='page');}catch(e){}}
  const c=new CDP(t.webSocketDebuggerUrl);await c.ok;
  try{await c.send('Page.enable');await c.send('Runtime.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
    await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
    await c.send('Page.navigate',{url:o.url+'/VERSION%20PRINCIPALE/index.html?colonne=0&intro=ancien&attente=0&prebati=0'+(o.q||'')});
    let ok=false;for(let i=0;i<360&&!ok;i++){await dormir(500);try{ok=await c.ev('!!window.__gameReady&&typeof dbgGenRoute==="function"',120000);}catch(e){}}if(!ok)throw new Error('page pas prête');
    await dormir(3000);await c.ev('dbgGenRoute("ville",99,0).ms',120000);
    await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:200});await c.send('Profiler.start');
    let tot=0,n=0;for(const carte of CARTES)for(const p of PAL)for(let g=g0;g<=g1;g++){tot+=await c.ev('dbgGenRoute('+JSON.stringify(carte)+','+g+','+p+').ms',120000);n++;}
    const P=(await c.send('Profiler.stop',{},120000)).profile;
    const byId={},dt={};for(const nd of P.nodes)byId[nd.id]=nd;for(let i=0;i<P.samples.length;i++)dt[P.samples[i]]=(dt[P.samples[i]]||0)+(P.timeDeltas[i]||0);
    const par={};for(const nd of P.nodes)for(const k of nd.children||[])par[k]=nd.id;
    const self={},inc={};for(const nd of P.nodes){const k=nd.callFrame.functionName+':'+nd.callFrame.lineNumber;self[k]=(self[k]||0)+(dt[nd.id]||0);}
    for(const nd of P.nodes){const tt=dt[nd.id]||0;if(!tt)continue;const vu=new Set();let x=nd.id;while(x!=null){const m=byId[x];const k=m.callFrame.functionName+':'+m.callFrame.lineNumber;if(!vu.has(k)){vu.add(k);inc[k]=(inc[k]||0)+tt;}x=par[x];}}
    console.log('routes',n,'· dbgGenRoute moyenne',(tot/n).toFixed(1),'ms');
    console.log('PROPRE');for(const [k,v] of Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,25))console.log((v/1000).toFixed(0).padStart(7),'ms',k);
    console.log('INCLUSIF');for(const [k,v] of Object.entries(inc).sort((a,b)=>b[1]-a[1]).slice(0,40))console.log((v/1000).toFixed(0).padStart(7),'ms',k);
  }finally{try{c.close();}catch(e){}tueChrome(ch);await dormir(800);try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}}})().catch(e=>{console.error(e);process.exit(1);});
