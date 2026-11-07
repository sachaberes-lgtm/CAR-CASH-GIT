/* Profil JS du démarrage : qui appelle les appels WebGL synchrones (getProgramParameter…) ?  usage : node serpent-prof.cjs <url> <cpu> <secondes> */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const URL_=process.argv[2],CPU=+process.argv[3]||4,SEC=+process.argv[4]||10;
const port=9600+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'prof-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,'--use-angle=d3d11','--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  await send('Profiler.enable');await send('Profiler.setSamplingInterval',{interval:500});await send('Profiler.start');
  await send('Page.navigate',{url:URL_});await sleep(SEC*1000);
  const P=(await send('Profiler.stop')).result.profile;
  const N={};P.nodes.forEach(n=>N[n.id]=n);const par={};P.nodes.forEach(n=>(n.children||[]).forEach(c=>par[c]=n.id));
  const web=/^(getProgramParameter|getProgramInfoLog|getUniformLocation|getActiveUniform|getActiveAttrib|linkProgram|compileShader|getShaderParameter|getShaderInfoLog|getAttribLocation|readPixels|getError|finish|texImage2D|texSubImage2D|compressedTexImage2D)$/;
  const agg={},tot={};let T=0;
  for(let i=0;i<P.samples.length;i++){const dt=(P.timeDeltas[i]||0)/1000;T+=dt;const n=N[P.samples[i]];const fn=n.callFrame.functionName;
    if(!web.test(fn))continue;tot[fn]=(tot[fn]||0)+dt;
    const chain=[];let c=par[n.id];let k=0;while(c&&k<14){const f=N[c].callFrame;if(f.functionName&&/index\.html|jeu\.|\.js/.test(f.url)&&!/three/.test(f.url)){chain.push(f.functionName+':'+f.lineNumber);}c=par[c];k++;}
    const key=fn+' <- '+chain.slice(0,4).join(' < ');agg[key]=(agg[key]||0)+dt;}
  {const FN=process.env.QUI||'setSize',A={};for(let i=0;i<P.samples.length;i++){const dt=(P.timeDeltas[i]||0)/1000;const n=N[P.samples[i]];if(n.callFrame.functionName!==FN)continue;
    const ch=[];let c=n.id,k=0;while(c&&k<30){const f=N[c].callFrame;if(f.functionName&&!/^((program)|(root))/.test(f.functionName))ch.push(f.functionName+':'+f.lineNumber);c=par[c];k++;}const key=ch.slice(0,7).join(' < ');A[key]=(A[key]||0)+dt;}
    console.log('QUI APPELLE '+FN+' (QUI=nom pour changer)',JSON.stringify(Object.entries(A).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>[k,Math.round(v)])));}
  {const self={};let tt=0;for(let i=0;i<P.samples.length;i++){const dt=(P.timeDeltas[i]||0)/1000;tt+=dt;const n=N[P.samples[i]],f=n.callFrame;const k=(f.functionName||"(anonyme)")+" "+String(f.url).split("/").pop()+":"+f.lineNumber;self[k]=(self[k]||0)+dt;}
console.log("TOP SELF",JSON.stringify(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,22).map(([k,v])=>[k,Math.round(v)])));}console.log('TOTAL profil ms',Math.round(T));console.log('PAR APPEL WEBGL (ms)',JSON.stringify(Object.entries(tot).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,Math.round(v)])));
  Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v])=>console.log(Math.round(v)+' ms',k));
  ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
