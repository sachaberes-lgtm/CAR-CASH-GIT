/* Filme le serpent de chargement (screencast CDP) et compte : images vides, trous, images distinctes par seconde.
   usage : node serpent-film.cjs <url> <cpu> <secondes> [dpr] */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),zlib=require('zlib');
const URL_=process.argv[2],CPU=+process.argv[3]||4,SEC=+process.argv[4]||14,DPR=+process.argv[5]||3;
const port=9500+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'film-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,'--use-angle=d3d11','--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function png(buf){ /* décodeur PNG minimal : 8 bits, RGB ou RGBA, non entrelacé */
  let p=8,W=0,H=0,ct=0;const idat=[];
  while(p<buf.length){const len=buf.readUInt32BE(p),ty=buf.toString('ascii',p+4,p+8);
    if(ty==='IHDR'){W=buf.readUInt32BE(p+8);H=buf.readUInt32BE(p+12);ct=buf[p+17];}
    else if(ty==='IDAT')idat.push(buf.slice(p+8,p+8+len));p+=12+len;}
  const bpp=ct===6?4:ct===2?3:ct===0?1:4,raw=zlib.inflateSync(Buffer.concat(idat)),stride=W*bpp,out=Buffer.alloc(H*stride);
  for(let y=0;y<H;y++){const f=raw[y*(stride+1)];for(let x=0;x<stride;x++){
    const a=x>=bpp?out[y*stride+x-bpp]:0,b=y?out[(y-1)*stride+x]:0,c=(x>=bpp&&y)?out[(y-1)*stride+x-bpp]:0;let v=raw[y*(stride+1)+1+x];
    if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;else if(f===4){const pp=a+b-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);}
    out[y*stride+x]=v&255;}}
  return{W,H,bpp,px:out};}
(async()=>{
  let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},frames=[];
  const MET={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method)MET[d.method]=(MET[d.method]||0)+1;if(d.error)console.log('CDP err',JSON.stringify(d.error));if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}
    else if(d.method==='Page.screencastFrame'){frames.push({ts:d.params.metadata.timestamp,data:d.params.data,wall:Date.now()});send('Page.screencastFrameAck',{sessionId:d.params.sessionId});}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable');await send('Network.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:DPR,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  await send('Page.startScreencast',{format:'png',maxWidth:390,maxHeight:844,everyNthFrame:1});
  const t0=Date.now();await send('Page.navigate',{url:URL_});
  const BL=[];if(process.env.BLOQUE){await sleep(2000);for(let k=0;k<3;k++){const a=Date.now()-t0;await send('Runtime.evaluate',{expression:'(function(){var t=performance.now();while(performance.now()-t<800);})()'});BL.push([a,Date.now()-t0]);await sleep(900);}console.log('BLOCAGES',JSON.stringify(BL));}
  await sleep(SEC*1000);
  await send('Page.stopScreencast');
  /* analyse : la zone du serpent (104 px au centre, à 46 % de la hauteur) */
  const X0=143,X1=247,Y0=336,Y1=440;let first=-1,rows=[];
  for(const f of frames){const im=png(Buffer.from(f.data,'base64'));let lit=0,h=0;
    for(let y=Y0;y<Y1&&y<im.H;y+=1)for(let x=X0;x<X1&&x<im.W;x+=1){const o=(y*im.W+x)*im.bpp;const v=im.px[o]+im.px[o+1]+im.px[o+2];if(v>60)lit++;h=(h*31+im.px[o]+im.px[o+1]*3+im.px[o+2]*7+x*y)|0;}
    const tt=f.wall-t0;if(first<0&&lit>20)first=tt;rows.push({t:tt,lit,h});}
  const vis=rows.filter(r=>first>=0&&r.t>=first&&r.t<first+7000);
  const vides=vis.filter(r=>r.lit<=20).length,gaps=[];
  for(let i=1;i<vis.length;i++){const g=vis[i].t-vis[i-1].t;if(g>120)gaps.push([vis[i-1].t,g]);}
  const dist=new Set(vis.map(r=>r.h)).size;
  console.log('VIDES',JSON.stringify(vis.filter(r=>r.lit<=20).map(r=>[r.t,r.lit])),'LIT',JSON.stringify(vis.slice(0,60).map(r=>r.lit)));console.log(JSON.stringify({cpu:CPU,dpr:DPR,images:rows.length,premiereLueur:first,fenetre7s:vis.length,imagesVides:vides,trous120ms:gaps.length,pireTrou:gaps.reduce((a,g)=>Math.max(a,g[1]),0),trous:gaps.slice(0,8),distinctes:dist,parSeconde:+(dist/7).toFixed(1)}));
  ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
