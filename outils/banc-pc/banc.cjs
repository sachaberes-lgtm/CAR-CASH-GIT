/* BANC PC — mémoire et latence du jeu dans un Chrome headless (vrai GPU), page-cadre de l'ordi.
   node banc.cjs <url> [--q=params] [--w=2560] [--h=1350] [--dsf=1.5] [--duree=40] [--courses=1] [--port=9444] [--profil=chaud|neuf] [--tag=nom]
                      [--cpu=1 : profil CPU du chargement] [--tas=1 : profil d'allocations vivantes] [--gc=1 : ramasse-miettes forcé avant chaque relevé]
   Relève : mémoire des processus Chrome (navigateur, rendu, GPU), tas JS, toile 3D, cibles (bloom, ombre), programmes, textures,
   tâches longues, coût d'image (CPU+GPU) — au menu, puis en course (pilote auto), puis après la mort. JSON dans resultats/<tag>.json */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARGS=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const opt={};for(const a of process.argv.slice(2)){const m=/^([a-z]+)=(.*)$/.exec(a.replace(/^--/,''));if(a.startsWith('--')&&m)opt[m[1]]=m[2];}
const URL0=ARGS[0]||'https://car-cash-git.vercel.app/jouer/';
const W=+(opt.w||2560),H=+(opt.h||1350),DUREE=+(opt.duree||40),COURSES=+(opt.courses||1),PORT=+(opt.port||9444),TAG=opt.tag||'banc';
const URLF=URL0+(URL0.indexOf('?')<0?'?':'&')+'intro=ancien&attente=0'+(opt.q?'&'+opt.q:'');
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const os=require('os'),HERE=process.env.CC_BANC_DIR||path.join(os.tmpdir(),'cc-banc-pc'),UDD=path.join(HERE,'profil-'+(opt.profil==='neuf'?('neuf-'+Date.now()):'chaud'));
fs.mkdirSync(UDD,{recursive:true});fs.mkdirSync(path.join(HERE,'resultats'),{recursive:true});
const http=require('http');
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+UDD,'--no-first-run','--no-default-browser-check','--window-size='+W+','+H,'--force-device-scale-factor='+(opt.dsf||'1.5'),
    '--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--mute-audio','--hide-scrollbars','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+PORT+'/json/version');return;}catch(e){await dort(200);}}
  throw new Error('Chrome ne répond pas sur '+PORT);}
function tueChrome(){if(!chrome)return;try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
/* la mémoire des processus de CE Chrome (par le dossier de profil dans la ligne de commande) */
function procs(){
  const ps='Get-CimInstance Win32_Process -Filter "Name=\'chrome.exe\'" | Where-Object { $_.CommandLine -like \'*'+path.basename(UDD)+'*\' } | Select-Object ProcessId,WorkingSetSize,PrivatePageCount,CommandLine | ConvertTo-Json -Compress';
  const r=spawnSync('powershell',['-NoProfile','-Command',ps],{encoding:'utf8',maxBuffer:64<<20});
  let L=[];try{L=JSON.parse(r.stdout||'[]');if(!Array.isArray(L))L=[L];}catch(e){return {err:String(r.stderr||e)};}
  const out={};let tot=0,totP=0;const pids={};
  for(const p of L){const m=/--type=([a-z-]+)/.exec(p.CommandLine||''),t=m?m[1]:'navigateur';const ws=Math.round(p.WorkingSetSize/1048576),pv=Math.round(p.PrivatePageCount/1048576);
    out[t]=out[t]||{n:0,ws:0,prive:0};out[t].n++;out[t].ws+=ws;out[t].prive+=pv;tot+=ws;totP+=pv;pids[p.ProcessId]=t+(t==='renderer'?'#'+p.ProcessId:'');}
  out.TOTAL={ws:tot,prive:totP};out.pids=pids;return out;}
/* la ventilation memory-infra d'un dump : par processus, les allocateurs de tête (effective_size) */
function ventile(d,pids){const A=d.dumps.allocators||{};const tot={},feuilles=[];
  for(const k in A){const a=A[k].attrs||{},es=a.effective_size||a.size;if(!es)continue;const v=parseInt(es.value,16);if(!(v>0))continue;
    const seg=k.split('/');if(seg.length===1)tot[k]=v; /* la racine porte le total de son arbre */
    feuilles.push([v,k]);}
  feuilles.sort((a,b)=>b[1].split('/').length-a[1].split('/').length); /* on ne garde que des feuilles (pas d'ancêtre d'une autre entrée) */
  const ancetres=new Set();for(const [,k] of feuilles){const s=k.split('/');for(let i=1;i<s.length;i++)ancetres.add(s.slice(0,i).join('/'));}
  const top=feuilles.filter(([,k])=>!ancetres.has(k)).sort((a,b)=>b[0]-a[0]).slice(0,14).map(([v,k])=>[Math.round(v/1048576),k]);
  const racines=Object.entries(tot).sort((a,b)=>b[1]-a[1]).filter(([,v])=>v>2*1048576).map(([k,v])=>k+' '+Math.round(v/1048576)+' Mo');
  return {proc:pids[d.pid]||('pid '+d.pid),racines:racines,feuilles:top};}
class Page{
  constructor(ws){this.ws=ws;this.n=0;this.att={};this.erreurs=[];this.console=[];this.dumps=[];this.traceFini=null;this.reseau={};
    ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Tracing.dataCollected'){this.nEvts=(this.nEvts||0)+r.params.value.length;this.cats=this.cats||{};for(const e of r.params.value){this.cats[e.cat]=(this.cats[e.cat]||0)+1;if(e.ph==='v'){if(e.args&&e.args.dumps)this.dumps.push({id:e.id,pid:e.pid,dumps:e.args.dumps});else if(!this.exV)this.exV=JSON.stringify(e).slice(0,300);}}}
      else if(r.method==='Tracing.tracingComplete'){if(this.traceFini)this.traceFini();}
      else if(r.method==='Network.responseReceived'){const p=r.params,u=p.response.url.split('?')[0].split('/').slice(-2).join('/');this.reseau[p.requestId]={u:u,type:p.type,mime:p.response.mimeType,enc:0,taille:0};}
      else if(r.method==='Network.loadingFinished'){const q=this.reseau[r.params.requestId];if(q)q.enc=r.params.encodedDataLength;}
      else if(r.method==='LayerTree.layerTreeDidChange'){if(r.params.layers)this.couches=r.params.layers;}
      else if(r.method==='Target.attachedToTarget'){const ti=r.params.targetInfo;if(ti&&(ti.type==='worker'||ti.type==='shared_worker')){this.sessions=this.sessions||{};this.sessions[ti.targetId]={sid:r.params.sessionId,url:ti.url};}}
      else if(r.method==='Target.detachedFromTarget'){if(this.sessions)for(const k in this.sessions)if(this.sessions[k].sid===r.params.sessionId)delete this.sessions[k];}
      else if(r.method==='Runtime.consoleAPICalled'){const p=r.params;const t=p.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ');this.console.push(p.type+' '+t.slice(0,300));if(p.type==='error')this.erreurs.push(t.slice(0,300));}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.erreurs.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n')[0]);}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||60000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  /* dans la colonne (l'iframe du jeu), ou la page elle-même si pas de colonne */
  evF(expr,timeout){return this.ev("(function(){var f=document.getElementById('colonne');var w=f?f.contentWindow:window;return w.eval("+JSON.stringify(expr)+");})()",timeout);}
  async attendF(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.evF('!!('+expr+')'))return true;}catch(e){}await dort(pas||250);}return false;}
}
const SEME="try{var k='cashcarSave',d={};try{d=JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){}if(!d.v){d={v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3}};}d.sfx=__SON__;d.mus=false;d.vox=false;d.tuto=1;localStorage.setItem(k,JSON.stringify(d));}catch(e){}"+
  "try{window.__lt=[];new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]);});}).observe({type:'longtask',buffered:true});}catch(e){}";
async function ouvrePage(){
  const t=await putJson('http://127.0.0.1:'+PORT+'/json/new?about:blank');
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);p.id=t.id;
  await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');
  if(opt.sw!=='1')await p.call('Network.setBypassServiceWorker',{bypass:true});
  if(opt.bloque){await p.call('Network.setBlockedURLs',{urls:opt.bloque.split(',').map(s=>'*'+s+'*')});console.log('bloqué : '+opt.bloque);}
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:SEME.replace('__SON__',opt.son==='1'?'true':'false')}); /* --son=1 : les effets restent allumés (Chrome est muet : --mute-audio) pour compter les sons joués */
  if(opt.couches==='1'){await p.call('DOM.enable');await p.call('LayerTree.enable');}
  if(opt.workers==='1'){try{await p.call('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:false,flatten:true});}catch(e){console.log('setAutoAttach : '+e.message);}}
  return p;}
const MESURE=`(function(){var o={};function t(f){try{return f();}catch(e){return 'ERR '+(e&&e.message);}}
  o.heap=t(function(){var m=performance.memory;return {used:Math.round(m.usedJSHeapSize/1048576),total:Math.round(m.totalJSHeapSize/1048576)};});
  o.cout=t(function(){return dbgCout();});o.nette=t(function(){var n=dbgNette();return {dpr:n.dpr,cap:n.cap,curDPR:n.curDPR,cran:n.cran,px:n.px,vhd:n.vhd,q:n.q};});
  o.vhd=t(function(){return dbgVhdEcran();});o.perf=t(function(){var p=dbgPerf();return {ms:p.ms,fps:p.fps,spikes:p.spikes,dpr:p.dpr};});
  o.toiles=t(function(){return dbgToiles();});o.photos=t(function(){var p=dbgPhotoMem();return {photos:p.photos,mo:p.mo,cache:p.cache};});
  o.canvas=t(function(){var L=[].slice.call(document.querySelectorAll('canvas')),px=0,n=0;L.forEach(function(c){if(c.width&&c.height){px+=c.width*c.height;n++;}});var ims=[].slice.call(document.images).length;return {n:L.length,vivants:n,Mpx:+(px/1e6).toFixed(2),images:ims,dom:document.getElementsByTagName('*').length};});
  o.lt=t(function(){var L=window.__lt||[];var s=0,mx=0;L.forEach(function(e){s+=e[1];if(e[1]>mx)mx=e[1];});return {n:L.length,totalMs:s,maxMs:mx,gros:L.filter(function(e){return e[1]>=500;}).slice(0,12)};});
  o.state=t(function(){var s=dbgState();return {started:s.started,running:s.running,gameOver:s.gameOver,mode:s.mode};});
  o.lvl=t(function(){return (window.dbgLvl&&dbgLvl().id)||null;});o.palier=t(function(){var p=dbgPalier();return p.nom+' ('+p.src+') '+p.puce;});
  o.progs=t(function(){return dbgProgs().length;});
  o.sons=t(function(){return window.CCSON&&CCSON.etat?CCSON.etat():null;});
  return o;})()`;
const ETAT="({intro:!!window.__introCouvre,body:document.body.className.slice(0,160),html:document.documentElement.className.slice(0,120),splash:!!document.getElementById('splash'),boutons:[].slice.call(document.querySelectorAll('button,[role=button],.mPlay,#mPlay,[data-m]')).filter(function(b){var r=b.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(b).visibility!=='hidden';}).slice(0,25).map(function(b){return (b.id||b.className||b.tagName).toString().slice(0,30)+' « '+b.textContent.trim().slice(0,24)+' »';}),st:dbgState(),lier:window.dbgLier?dbgLier():null,erreurs:(window.dbgErreurs?dbgErreurs():null)})";
function fmtMo(x){return x==null?'?':x+' Mo';}
async function releve(p,nom,R){
  if(opt.gc==='1'){try{await p.call('HeapProfiler.collectGarbage');await dort(500);}catch(e){}}
  const m=await p.evF(MESURE);const pr=procs();let hu=null,dc=null;try{hu=await p.call('Runtime.getHeapUsage');}catch(e){}try{dc=await p.call('Memory.getDOMCounters');}catch(e){}
  const r={t:new Date().toISOString(),nom:nom,procs:pr,page:m,heapUsage:hu,dom:dc,erreurs:p.erreurs.slice()};R.releves.push(r);
  const c=m.cout||{};
  if(m.sons&&typeof m.sons==='object')console.log('   SONS : '+JSON.stringify(m.sons));
  if(hu)console.log('   V8 : tas '+Math.round(hu.usedSize/1048576)+'/'+Math.round(hu.totalSize/1048576)+' Mo · tampons (ArrayBuffer) '+Math.round((hu.backingStorageSize||0)/1048576)+' Mo · embedder '+Math.round((hu.embedderHeapUsedSize||0)/1048576)+' Mo'+(dc?' · DOM nœuds '+dc.nodes+' documents '+dc.documents+' écouteurs '+dc.jsEventListeners:''));
  console.log('— '+nom+' — RAM : total '+fmtMo(pr.TOTAL&&pr.TOTAL.ws)+' (rendu '+fmtMo(pr.renderer&&pr.renderer.ws)+', GPU '+fmtMo(pr['gpu-process']&&pr['gpu-process'].ws)+', navigateur '+fmtMo(pr.navigateur&&pr.navigateur.ws)+') · tas JS '+(m.heap&&m.heap.used)+'/'+(m.heap&&m.heap.total)+' Mo');
  if(c.toile)console.log('   toile '+(c.toile&&c.toile.join('×'))+' ('+(c.px&&(c.px/1e6).toFixed(2))+' Mpx, dpr '+c.dpr+', cran '+c.ql+', vhd '+c.vhd+') · bloom '+JSON.stringify(c.bloom)+' · ombre '+c.ombre+' · progs '+c.progs+' · tex '+c.tex+' · geo '+c.geo+' · passes '+c.passes);
  if(c.image)console.log('   image : '+JSON.stringify(c.image)+' · cpu '+JSON.stringify(c.cpu)+' · gpu '+JSON.stringify(c.gpu)+' · perf '+JSON.stringify(m.perf));
  console.log('   canvas '+JSON.stringify(m.canvas)+' · toiles '+JSON.stringify(m.toiles)+' · photos '+JSON.stringify(m.photos)+' · tâches longues '+JSON.stringify(m.lt)+' · '+m.palier+' · lvl '+m.lvl+' · '+JSON.stringify(m.state));
  if(p.erreurs.length)console.log('   erreurs : '+p.erreurs.slice(-3).join(' | '));
  if(opt.infra==='1'){try{const d=await p.call('Tracing.requestMemoryDump',{levelOfDetail:'detailed',deterministic:false});r.dumpGuid=d.dumpGuid;R.guids=R.guids||{};R.guids[d.dumpGuid]=nom;if(!d.success)console.log('   memory-infra : dump refusé');}catch(e){console.log('   memory-infra : '+e.message);}}
  if(opt.workers==='1'){try{const T=(await p.call('Target.getTargets')).targetInfos.filter(t=>t.type==='worker'||t.type==='shared_worker');const W=[];
      for(const t of T){try{let sid=p.sessions&&p.sessions[t.targetId]&&p.sessions[t.targetId].sid;let detache=false;if(!sid){const s=await p.call('Target.attachToTarget',{targetId:t.targetId,flatten:true});sid=s.sessionId;detache=true;}
          const q=(m,pr)=>Promise.race([new Promise((ok,ko)=>{const id=++p.n;p.att[id]={ok,ko};p.ws.send(JSON.stringify({id,method:m,params:pr||{},sessionId:sid}));}),dort(4000).then(()=>{throw new Error('délai '+m);})]);
          await q('Runtime.enable');const hu=await q('Runtime.getHeapUsage');
          let qui='?';try{const e=await q('Runtime.evaluate',{expression:"Object.keys(self).filter(function(k){return typeof self[k]==='function'&&!/^(on|webkit|set|clear|fetch|post|close|import|queue|report|request|cancel|create|structured|atob|btoa|dispatch|add|remove)/.test(k);}).slice(0,6).join(',')",returnByValue:true});qui=e.result.value;}catch(e){}
          W.push({url:t.url.slice(0,60),qui:qui,tasMo:Math.round(hu.usedSize/1048576),totalMo:Math.round(hu.totalSize/1048576),tamponsMo:Math.round((hu.backingStorageSize||0)/1048576)});
          if(detache)try{await p.call('Target.detachFromTarget',{sessionId:sid});}catch(e){}}catch(e){W.push({url:t.url.slice(0,60),err:e.message.slice(0,80)});}}
      r.workers=W;console.log('   WORKERS ('+W.length+') : '+W.map(w=>w.err?('ERREUR '+w.err+' '+w.url):((w.qui||w.url)+' tas '+w.tasMo+'/'+w.totalMo+' Mo + tampons '+w.tamponsMo+' Mo')).join(' | '));}catch(e){console.log('   workers : '+e.message);}}
  if(opt.couches==='1'){try{try{await p.call('LayerTree.disable');}catch(e){}await p.call('LayerTree.enable');await dort(1200);const L=(p.couches||[]).filter(l=>l.drawsContent).map(l=>({id:l.layerId,w:Math.round(l.width),h:Math.round(l.height),px:Math.round(l.width*l.height/1e4)/100,n:l.backendNodeId,pc:l.paintCount})).sort((a,b)=>b.px-a.px);
      const tot=L.reduce((s,l)=>s+l.px,0);const top=L.slice(0,10);
      for(const l of top){try{const cr=await p.call('LayerTree.compositingReasons',{layerId:l.id});l.pourquoi=(cr.compositingReasonIds||cr.compositingReasons||[]).join(',');}catch(e){}
        if(!l.n)continue;try{const d=await p.call('DOM.describeNode',{backendNodeId:l.n});const nd=d.node;const at=nd.attributes||[];let id='',cl='';for(let i=0;i<at.length;i+=2){if(at[i]==='id')id=at[i+1];if(at[i]==='class')cl=at[i+1];}l.el=nd.nodeName.toLowerCase()+(id?'#'+id:'')+(cl?'.'+cl.split(' ').slice(0,3).join('.'):'');}catch(e){l.el='?';}}
      r.couches={n:L.length,totalMpx:+tot.toFixed(1),top:top};console.log('   COUCHES composées qui dessinent : '+L.length+', '+tot.toFixed(1)+' Mpx (CSS) · '+top.map(l=>l.px+' Mpx '+(l.el||'')+(l.pc?' ×'+l.pc:'')+(l.pourquoi?' ['+l.pourquoi+']':'')).join(' | '));}catch(e){console.log('   couches : '+e.message);}}
  if(opt.capture==='1'&&/course 1 à 10 s|menu/.test(nom)){try{const cl=opt.clip?opt.clip.split(',').map(Number):[880,420,800,450];
      const sh=await p.call('Page.captureScreenshot',{format:'png',clip:{x:cl[0],y:cl[1],width:cl[2],height:cl[3],scale:+(opt.dsf||1.5)},captureBeyondViewport:false});
      const f=path.join(HERE,'resultats',TAG+'-'+(/menu/.test(nom)?'menu':'course')+'.png');fs.writeFileSync(f,Buffer.from(sh.data,'base64'));console.log('   capture : '+f);}catch(e){console.log('   capture : '+e.message);}}
  if(opt.geo==='1'){try{const g=await p.evF(GEO);r.geo=g;console.log('   GÉOMÉTRIES (copies JS dans la scène) : '+g.totalMo+' Mo, '+g.n+' géométries · textures (images) '+g.texMo+' Mo, '+g.nTex);for(const [mo,k] of g.top)if(mo>=1)console.log('        '+String(mo).padStart(6)+' Mo  '+k);}catch(e){console.log('   géométries : '+e.message);}}
  return r;}
const GEO=`(function(){var S=dbgScene().scene,M={},tot=0,n=0,seen={},tex={},texMo=0,nTex=0;
  function nom(o){var p=o,parts=[],d=0;while(p&&d<5){if(p.name)parts.push(p.name);p=p.parent;d++;}return parts.length?parts.join('<'):'(sans nom)';}
  S.traverse(function(o){var g=o.geometry;if(g&&!seen[g.uuid]){seen[g.uuid]=1;var b=0,att=[];for(var k in g.attributes){var a=g.attributes[k];if(a&&a.array){b+=a.array.byteLength;att.push(k+(a.isInstancedBufferAttribute?'*':'')+':'+a.count);}}if(g.index&&g.index.array){b+=g.index.array.byteLength;att.push('index:'+g.index.count);}
      var mt=o.material?(Array.isArray(o.material)?o.material[0]:o.material):null;
      var key=nom(o).slice(0,40)+' ['+o.type+(o.isInstancedMesh?' ×'+o.count:'')+' '+(g.name||g.type)+' '+(mt?mt.type:'')+(mt&&mt.name?' '+mt.name:'')+'] '+att.slice(0,4).join(' ');M[key]=(M[key]||0)+b;tot+=b;n++;}
    var mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];mats.forEach(function(m){for(var k in m){var t=m[k];if(t&&t.isTexture&&t.image&&!tex[t.uuid]){tex[t.uuid]=1;var im=t.image,w=im.width||im.videoWidth||0,h=im.height||im.videoHeight||0;texMo+=w*h*4;nTex++;}}
      if(m.uniforms)for(var u in m.uniforms){var t=m.uniforms[u]&&m.uniforms[u].value;if(t&&t.isTexture&&t.image&&!tex[t.uuid]){tex[t.uuid]=1;var w=t.image.width||0,h=t.image.height||0;texMo+=w*h*4;nTex++;}}});});
  var L=Object.entries(M).sort(function(a,b){return b[1]-a[1];}).slice(0,22).map(function(e){return [Math.round(e[1]/104857.6)/10,e[0]];});
  return {totalMo:Math.round(tot/1048576),n:n,top:L,texMo:Math.round(texMo/1048576),nTex:nTex};})()`;
function reseauBilan(p){const L=Object.values(p.reseau);const par={};let tot=0;for(const q of L){const t=(q.mime||q.type||'?').split(';')[0];par[t]=(par[t]||0)+q.enc;tot+=q.enc;}
  const gros=L.slice().sort((a,b)=>b.enc-a.enc).slice(0,14).map(q=>Math.round(q.enc/1024)+' Ko '+q.u);
  return {totalMo:+(tot/1048576).toFixed(1),n:L.length,par:Object.entries(par).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+(v/1048576).toFixed(1)+' Mo'),gros:gros};}
/* profil CPU : le temps propre par fonction (nom, fichier:ligne), les 30 premières */
function resumeCpu(prof){const self={},byId={};for(const n of prof.nodes)byId[n.id]=n;const dt=prof.timeDeltas||[];const cnt={};
  for(let i=0;i<prof.samples.length;i++){cnt[prof.samples[i]]=(cnt[prof.samples[i]]||0)+(dt[i]||0);}
  for(const id in cnt){const n=byId[id];if(!n)continue;const cf=n.callFrame,u=(cf.url||'').split('/').pop();const k=(cf.functionName||'(anonyme)')+' '+u+':'+(cf.lineNumber+1);self[k]=(self[k]||0)+cnt[id];}
  const tot=Object.values(self).reduce((a,b)=>a+b,0);
  return {totalMs:Math.round(tot/1000),top:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([k,v])=>[Math.round(v/1000),k])};}
/* profil d'allocations vivantes : la taille retenue par fonction d'allocation (feuille), les 30 premières */
function resumeTas(prof){const self={};const vis=(n)=>{const cf=n.callFrame,k=(cf.functionName||'(anonyme)')+' '+(cf.url||'').split('/').pop()+':'+(cf.lineNumber+1);
    if(n.selfSize)self[k]=(self[k]||0)+n.selfSize;for(const c of n.children||[])vis(c);};vis(prof.head);
  const tot=Object.values(self).reduce((a,b)=>a+b,0);
  return {totalMo:+(tot/1048576).toFixed(1),top:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([k,v])=>[+(v/1048576).toFixed(1),k])};}
(async function(){
  const R={url:URLF,w:W,h:H,tag:TAG,releves:[]};
  await lanceChrome();const p=await ouvrePage();
  if(opt.cpu==='1'){await p.call('Profiler.enable');await p.call('Profiler.setSamplingInterval',{interval:1000});await p.call('Profiler.start');}
  if(opt.tas==='1'){await p.call('HeapProfiler.enable');await p.call('HeapProfiler.startSampling',{samplingInterval:32768});}
  if(opt.infra==='1'){await p.call('Tracing.start',{transferMode:'ReportEvents',traceConfig:{recordMode:'recordUntilFull',includedCategories:['disabled-by-default-memory-infra'],excludedCategories:['*'],memoryDumpConfig:{triggers:[{mode:'detailed',periodic_interval_ms:600000}]}}});}
  const t0=Date.now();await p.call('Page.navigate',{url:URLF});
  const ok=await p.attendF("document.getElementById('colonne')?document.getElementById('colonne').contentWindow.__gameReady:window.__gameReady",180000,200);R.pret_ms=Date.now()-t0;
  console.log('prêt en '+R.pret_ms+' ms ('+(ok?'ok':'JAMAIS PRÊT')+') · '+URLF);
  if(!ok){await releve(p,'jamais prêt',R);tueChrome();fs.writeFileSync(path.join(HERE,'resultats',TAG+'.json'),JSON.stringify(R,null,1));return;}
  await dort(4000);
  if(opt.csstop){await p.ev("(function(){var s=document.createElement('style');s.textContent="+JSON.stringify(opt.csstop)+";document.head.appendChild(s);return 1;})()");console.log('css page-cadre : '+opt.csstop);}
  if(opt.cssjeu){await p.evF("(function(){var s=document.createElement('style');s.textContent="+JSON.stringify(opt.cssjeu)+";document.head.appendChild(s);return 1;})()");console.log('css jeu : '+opt.cssjeu);}
  if(opt.csstop||opt.cssjeu)await dort(2500);
  if(opt.cpu==='1'){const pr=await p.call('Profiler.stop');fs.writeFileSync(path.join(HERE,'resultats',TAG+'.cpuprofile'),JSON.stringify(pr.profile));R.cpu=resumeCpu(pr.profile);
    console.log('PROFIL CPU du chargement ('+R.cpu.totalMs+' ms échantillonnés) :');for(const [ms,k] of R.cpu.top)console.log('   '+String(ms).padStart(6)+' ms  '+k);}
  await p.evF('try{dbgCout(1)}catch(e){}');await dort(3000);
  await releve(p,'menu (vitrine)',R);
  for(let c=0;c<COURSES;c++){
    if(opt.cpu==='2'){await p.call('Profiler.enable');await p.call('Profiler.setSamplingInterval',{interval:1000});await p.call('Profiler.start');}
    await p.evF("(function(){try{var sp=document.getElementById('splash');if(sp){sp.click();setTimeout(function(){try{sp.remove();}catch(e){}},900);}}catch(e){}})()");await dort(1200);
    await p.evF("(function(){try{var b=document.querySelector('#mHome [data-m=play]');if(b)b.click();}catch(e){}})()");await dort(2500);
    if(opt.cpu==='2'){const pr=await p.call('Profiler.stop');const c9=resumeCpu(pr.profile);R.cpuGarage=c9;console.log('PROFIL CPU accueil → garage ('+c9.totalMs+' ms) :');for(const [ms,k] of c9.top.slice(0,16))console.log('   '+String(ms).padStart(6)+' ms  '+k);
      await p.call('Profiler.start');}
    const dj=await p.evF("(function(){try{return window.dbgJouer?JSON.stringify(dbgJouer()):'';}catch(e){return 'erreur '+e.message;}})()");if(dj)console.log('   dbgJouer : '+String(dj).slice(0,200));
    if(!dj)await p.evF("(function(){try{var b=document.getElementById('gPlayMain');if(b)b.click();}catch(e){}})()");
    let dep=await p.attendF('dbgState().started&&!dbgState().gameOver',opt.debug?8000:40000,250);
    if(!dep&&opt.debug){const et=await p.evF(ETAT);console.log('ÉTAT après les clics : '+JSON.stringify(et));
      /* 2e essai : Entrée, puis le JOUER de la boutique / du garage s'ils existent */
      await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(1500);
      await p.evF("(function(){var L=['#gPlayMain','.gJouer','[data-m=play]','#mPlay','#jouerGarage'];for(var i=0;i<L.length;i++){var b=document.querySelector(L[i]);if(b)try{b.click();}catch(e){}}})()");
      dep=await p.attendF('dbgState().started&&!dbgState().gameOver',30000,250);if(!dep)console.log('ÉTAT après le 2e essai : '+JSON.stringify(await p.evF(ETAT)));}
    if(opt.cpu==='2'){await dort(3000);const pr=await p.call('Profiler.stop');const c9=resumeCpu(pr.profile);R.cpuDepart=c9;console.log('PROFIL CPU garage → course ('+c9.totalMs+' ms) :');for(const [ms,k] of c9.top.slice(0,16))console.log('   '+String(ms).padStart(6)+' ms  '+k);}
    if(!dep){console.log('course '+(c+1)+' : jamais partie');await releve(p,'course jamais partie',R);break;}
    await p.evF('try{dbgAuto(true,0)}catch(e){}');await p.evF('try{dbgCout(1)}catch(e){}');
    const tc=Date.now();let mort=false;
    for(let s=10;s<=DUREE;s+=10){await dort(10000);const st=await p.evF('dbgState()');if(st.gameOver){mort=true;await releve(p,'course '+(c+1)+' morte à '+Math.round((Date.now()-tc)/1000)+' s',R);break;}
      try{await p.evF('try{dbgAuto(true,0)}catch(e){}');}catch(e){}
      await releve(p,'course '+(c+1)+' à '+s+' s',R);}
    if(!mort){await p.evF("try{dbgDeathNow();}catch(e){}");await p.attendF('dbgState().gameOver',20000,250);await dort(4000);await releve(p,'course '+(c+1)+' : écran de mort',R);}
    if(c<COURSES-1){await p.evF("(function(){try{var b=document.querySelector('#mDead.on [data-m=\"replay\"]')||document.querySelector('[data-m=\"replay\"]');if(b)b.click();}catch(e){}})()");await dort(3000);}
  }
  if(opt.tas==='1'){try{await p.call('HeapProfiler.collectGarbage');await dort(800);const pr=await p.call('HeapProfiler.stopSampling');fs.writeFileSync(path.join(HERE,'resultats',TAG+'.heapprofile'),JSON.stringify(pr.profile));R.tas=resumeTas(pr.profile);
    console.log('ALLOCATIONS VIVANTES à la fin ('+R.tas.totalMo+' Mo échantillonnés, après ramasse-miettes) :');for(const [mo,k] of R.tas.top)console.log('   '+String(mo).padStart(7)+' Mo  '+k);
    await releve(p,'fin, après ramasse-miettes',R);}catch(e){console.log('tas : '+e.message);}}
  R.reseau=reseauBilan(p);console.log('RÉSEAU : '+R.reseau.n+' réponses, '+R.reseau.totalMo+' Mo transférés · '+R.reseau.par.slice(0,8).join(' · '));for(const g of R.reseau.gros)console.log('   '+g);
  if(opt.infra==='1'){try{const fin=new Promise(ok=>{p.traceFini=ok;});await p.call('Tracing.end');await Promise.race([fin,dort(60000)]);
    console.log('trace : '+(p.nEvts||0)+' événements, '+p.dumps.length+' dumps mémoire, guids '+JSON.stringify(R.guids||{})+' · catégories '+JSON.stringify(Object.entries(p.cats||{}).sort((a,b)=>b[1]-a[1]).slice(0,6))+(p.exV?' · ex. v : '+p.exV:''));
    const pids=(procs().pids)||{};R.infra=[];const parNom={};
    console.log('   ids des dumps : '+JSON.stringify([...new Set(p.dumps.map(d=>String(d.id)))].slice(0,12)));
    for(const d of p.dumps){const nom=(R.guids||{})[d.id]||(R.guids||{})[String(d.id).toLowerCase()]||('dump '+d.id);const v=ventile(d,pids);(parNom[nom]=parNom[nom]||[]).push(v);R.infra.push({nom:nom,pid:d.pid,v:v});}
    for(const nom in parNom){console.log('MEMORY-INFRA — '+nom);for(const v of parNom[nom]){if(!/renderer|gpu/.test(v.proc))continue;console.log('   ['+v.proc+'] '+v.racines.join(' · '));for(const [mo,k] of v.feuilles)if(mo>=3)console.log('        '+String(mo).padStart(5)+' Mo  '+k);}}
    }catch(e){console.log('memory-infra : '+e.message);}}
  R.console=p.console.slice(-40);
  fs.writeFileSync(path.join(HERE,'resultats',TAG+'.json'),JSON.stringify(R,null,1));
  console.log('→ '+path.join(HERE,'resultats',TAG+'.json'));
  tueChrome();
})().catch(e=>{console.error('ÉCHEC',e);tueChrome();process.exit(1);});
