// node trace.mjs <port> <expr> <ms> : compte les évènements de la timeline (Paint, Layout, UpdateLayoutTree, CompositeLayers...) pendant ms
const [port, geste, ms='6000'] = process.argv.slice(2);
const B='http://127.0.0.1:'+port;
const L=await (await fetch('http://127.0.0.1:'+(+port-1)+'/json')).json();const pg=L.find(x=>x.type==='page');
const ws=new WebSocket(pg.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const att={};const ev=[];let fini=null;
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Tracing.dataCollected')ev.push(...m.params.value);if(m.method==='Tracing.tracingComplete')fini&&fini();if(m.id&&att[m.id]){att[m.id](m.result||m.error);delete att[m.id];}};
const cs=(method,params)=>new Promise(r=>{const i=++id;att[i]=r;ws.send(JSON.stringify({id:i,method,params:params||{}}));});
await cs('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline',transferMode:'ReportEvents'});
await fetch(B+'/ev',{method:'POST',body:geste});
await new Promise(r=>setTimeout(r,+ms));
const p=new Promise(r=>fini=r);await cs('Tracing.end');await p;
const c={},d={};let paintPx=0;
for(const e of ev){if(e.ph!=='X'&&e.ph!=='B'&&e.ph!=='I')continue;c[e.name]=(c[e.name]||0)+1;if(e.dur)d[e.name]=(d[e.name]||0)+e.dur;
 if(e.name==='Paint'&&e.args&&e.args.data&&e.args.data.clip){const q=e.args.data.clip;const xs=[q[0],q[2],q[4],q[6]],ys=[q[1],q[3],q[5],q[7]];paintPx+=(Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys));}}
const pn={};for(const e of ev){if(e.name==='Paint'&&e.args&&e.args.data){const k=(e.args.data.nodeName||'?')+' L'+e.args.data.layerId;pn[k]=(pn[k]||0)+1;}}console.log(JSON.stringify(Object.entries(pn).sort((a,b)=>b[1]-a[1]).slice(0,12)));
const frames=c['BeginFrame']||c['DrawFrame']||1;
const K=['BeginFrame','DrawFrame','FireAnimationFrame','Paint','PaintImage','RasterTask','UpdateLayoutTree','Layout','PrePaint','Layerize','UpdateLayer','CompositeLayers','ScrollLayer','Decode Image','ImageDecodeTask','FunctionCall','EventDispatch','TimerFire','ParseHTML','Animation'];
const o={};for(const k of K)if(c[k])o[k]=c[k]+(d[k]?' ('+Math.round(d[k]/1000)+'ms)':'');o.paintPx_k=Math.round(paintPx/1000);console.log(JSON.stringify(o));process.exit(0);
