/* Mesure : pendant que le serpent (#spCharge) est visible, à quels instants le compositeur présente-t-il une image ?
   usage : node serpent-trace.cjs <url> <cpu> <secondes> */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const URL_=process.argv[2],CPU=+process.argv[3]||4,SEC=+process.argv[4]||14;
const port=9400+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'ser-'));
const chrome=spawn(process.env.CHROME||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'C:/Program Files/Google/Chrome/Application/chrome.exe'),['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,...(process.platform==='win32'?['--use-angle=d3d11']:[]),'--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},ev=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}else if(d.method)ev.push(d);};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`(function(){var T0=performance.now();var Z=window.top;try{Z.__ser=Z.__ser||{v:[],lt:[]};}catch(e){return;}
    try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){Z.__ser.lt.push([Math.round(performance.timeOrigin+e.startTime),Math.round(e.duration)]);});}).observe({type:'longtask',buffered:true});}catch(e){}
    var chk=function(){var el=document.getElementById('spCharge');var f=document.getElementById('splash');if(el)Z.__ser.v.push([Math.round(performance.timeOrigin+performance.now()),1,+getComputedStyle(el).opacity]);setTimeout(chk,50);};chk();})();`});
  if(process.env.CSS){await send('Page.addScriptToEvaluateOnNewDocument',{source:"document.addEventListener('DOMContentLoaded',function(){},0);(function(){var st=document.createElement('style');st.textContent="+JSON.stringify(process.env.CSS)+";(document.head||document.documentElement).appendChild(st);})();"});} /* CSS=... : A/B, une règle ajoutée dès le départ */
  await send('Tracing.start',{traceConfig:{includedCategories:['viz','benchmark','cc','gpu','devtools.timeline','v8'],recordMode:'recordAsMuchAsPossible'},transferMode:'ReturnAsStream'});
  const t0=Date.now();globalThis.T0=t0;await send('Page.navigate',{url:URL_});
  await sleep(SEC*1000);
  const ser=(await send('Runtime.evaluate',{expression:'JSON.stringify(window.__ser)',returnByValue:true})).result.result.value;
  const done=new Promise(r=>{const iv=setInterval(()=>{const e=ev.find(x=>x.method==='Tracing.tracingComplete');if(e){clearInterval(iv);r(e);}},100);});
  await send('Tracing.end');const comp=await done;
  let txt='';const h=comp.params.stream;for(;;){const r=(await send('IO.read',{handle:h})).result;txt+=r.data;if(r.eof)break;}
  let tr;try{tr=JSON.parse(txt);}catch(e){const k=txt.lastIndexOf("},{");tr=JSON.parse(txt.slice(0,k+1)+"]}");console.log("trace tronquée");}const evs=tr.traceEvents||tr;
  const nav=evs.find(e=>e.name==='navigationStart'&&e.args&&e.args.data&&e.args.data.documentLoaderURL&&e.args.data.documentLoaderURL.indexOf('jouer')>=0)||evs.find(e=>e.name==='navigationStart');
  const ts0=nav?nav.ts:evs.reduce((a,e)=>e.ts&&e.ts<a?e.ts:a,Infinity);
  const draws=evs.filter(e=>e.name==='Display::DrawAndSwap'||e.name==='Surface::SubmitCompositorFrame'&&false).map(e=>Math.round((e.ts-ts0)/1000)).sort((a,b)=>a-b);
  const S=JSON.parse(ser);S.v.forEach(x=>x[0]-=T0);S.lt.forEach(x=>x[0]-=T0);const vis=S.v.filter(x=>x[1]===1);const first=vis.length?vis[0][0]:null,last=vis.length?vis[vis.length-1][0]:null;
  const gaps=[];for(let i=1;i<draws.length;i++){const g=draws[i]-draws[i-1];if(g>60)gaps.push([draws[i-1],g]);}
  const inWin=gaps.filter(g=>first!==null&&g[0]>=first-200&&g[0]<=(last||1e9));
  console.log('DBG',S.v.length,JSON.stringify(S.v.slice(0,3)),JSON.stringify(S.v.slice(-2)),draws.slice(0,5).join(','),draws.slice(-3).join(','));const fade=vis.find(x=>x[2]<.99);console.log(JSON.stringify({cpu:CPU,serpentVisible:[first,last],opaciteBaisseDes:fade?fade[0]:null,nDraw:draws.length,drawFirst:draws[0],gapsSerpent:inWin.slice(0,25),maxGap:gaps.reduce((a,g)=>Math.max(a,g[1]),0),longtasks:S.lt.filter(l=>first!==null&&l[0]<(last||1e9)).slice(0,25),sumLt:S.lt.filter(l=>first!==null&&l[0]<(last||1e9)).reduce((a,l)=>a+l[1],0)}));
  {const W=evs.filter(e=>e.ph==='X'&&e.dur&&(e.ts-ts0)/1000>300&&(e.ts-ts0)/1000<16000&&/ParseHTML|EvaluateScript|v8.compile|UpdateLayoutTree|^Layout$|Paint|FunctionCall|RunTask|CompileScript|v8.run|ParseAuthorStyleSheet|CommitLoad/.test(e.name));const agg={};W.forEach(e=>{const a=agg[e.name]=agg[e.name]||{n:0,tot:0,max:0};a.n++;a.tot+=e.dur/1000;a.max=Math.max(a.max,e.dur/1000);});console.log("AGG",JSON.stringify(Object.entries(agg).map(([k,v])=>[k,v.n,Math.round(v.tot),Math.round(v.max)])));console.log("BIG",JSON.stringify(W.filter(e=>e.dur>150000&&e.name!=='RunTask').sort((a,b)=>b.dur-a.dur).slice(0,14).map(e=>[e.name,Math.round((e.ts-ts0)/1000),Math.round(e.dur/1000),String((e.args&&e.args.data&&(e.args.data.url||e.args.data.functionName||e.args.data.fileName))||"").slice(-60)])));}{const tn={};evs.filter(e=>e.ph==="M"&&e.name==="thread_name").forEach(e=>tn[e.pid+":"+e.tid]=e.args.name);const big=gaps.filter(g=>g[0]>=(first||0)-200&&g[0]<(last||first||0)&&g[1]>100).slice(0,12);
for(const g of big){const a=g[0],b=g[0]+g[1];const ov=evs.filter(e=>e.ph==="X"&&e.dur>8000&&((e.ts-ts0)/1000<b)&&((e.ts-ts0+e.dur)/1000>a));
{const gp=ov.filter(e=>tn[e.pid+":"+e.tid]==="CrGpuMain"&&!/RunTask|ExecuteDeferred|^CommandBuffer|PutChanged|OnAsyncFlush|^GpuChannel/.test(e.name)).sort((x,y)=>y.dur-x.dur).slice(0,6).map(e=>[e.name,Math.round(e.dur/1000),Math.round((e.ts-ts0)/1000)]);console.log("  GPU(détail)",JSON.stringify(gp));}console.log("TROU",a,g[1],"ms :",JSON.stringify(ov.sort((x,y)=>y.dur-x.dur).slice(0,9).map(e=>[e.name,tn[e.pid+":"+e.tid]||e.tid,Math.round(e.dur/1000),Math.round((e.ts-ts0)/1000)])));}}
if(process.env.FENETRE){const [a,b]=process.env.FENETRE.split(',').map(Number);const tn2={};evs.filter(e=>e.ph==="M"&&e.name==="thread_name").forEach(e=>tn2[e.pid+":"+e.tid]=e.args.name);
  const L=evs.filter(e=>e.ph==="X"&&e.dur>12000&&(e.ts-ts0)/1000<b&&(e.ts-ts0+e.dur)/1000>a&&!/^(RunTask|Scheduler::RunTask|ThreadControllerImpl|ThreadPool|TimerFire|v8.|FunctionCall|ExecuteDeferred|GpuChannel|CommandBuffer|ImplementationBase)/.test(e.name)).sort((x,y)=>y.dur-x.dur).slice(0,25);
  L.forEach(e=>console.log("  FEN",tn2[e.pid+":"+e.tid]||e.tid,e.name,Math.round(e.dur/1000),"@",Math.round((e.ts-ts0)/1000),JSON.stringify(e.args||{}).slice(0,260)));}
ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
