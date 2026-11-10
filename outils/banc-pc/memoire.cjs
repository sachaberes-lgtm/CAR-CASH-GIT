/* BANC MÉMOIRE AU LONG COURS (2026-11-10, Fable : jury DIR-02 / IOS-12 « la 10e partie ne pèse pas plus que la 2e »)
   node memoire.cjs <url> [--parties=10] [--chaines=10] [--tour=nuages,midi>ville,orage>…] [--paires=nuages,midi:ville,orage;jade,midi:foret,midi]
                          [--zone=7 : secondes roulées par map] [--trace=1 : où naît chaque géométrie / texture / matière encore vivante]
                          [--tas=1 : allocations JS vivantes par fonction, partie 2 contre la dernière] [--son=1] [--tel=1 : ?tel=1, cadre 390×844]
                          [--tracetout=1 : la trace des chaînes porte sur tout ce qui vit, pas seulement sur ce qui est né pendant] [--port=9461] [--tag=nom] [--q=params]
   PHASE 1 : N parties identiques (même tour de maps, franchies par dbgSaut comme le vrai portail), relevé à l'écran de mort.
   PHASE 2 : par paire A:B, UNE partie et N chaînes A-B-A-B, relevé à la fin de chaque chaîne (en A, en course).
   Chaque relevé suit DEUX ramasse-miettes forcés : tas JS, tampons ArrayBuffer, renderer.info.memory (géométries, textures), programmes,
   audio décodé (tous les AudioBuffer vivants de la page, comptés par WeakRef, et le PCM résident de CCSON), nœuds DOM, écouteurs, processus.
   Résultat : %TEMP%\cc-banc-pc\resultats\<tag>.json (CC_BANC_DIR pour choisir) et un tableau à l'écran. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARGS=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const URL0=ARGS[0]||'http://127.0.0.1:8131/index.html';
const TEL=opt.tel==='1',W=+(opt.w||(TEL?390:2560)),H=+(opt.h||(TEL?844:1350)),DSF=opt.dsf||(TEL?'3':'1.5');
const PARTIES=opt.parties==null?10:+opt.parties,CHAINES=opt.chaines==null?10:+opt.chaines,ZONE=+(opt.zone||7),PORT=+(opt.port||9461),TAG=opt.tag||'memoire';
const URLF=URL0+(URL0.indexOf('?')<0?'?':'&')+'intro=ancien&attente=0'+(TEL?'&tel=1':'')+(opt.q?'&'+opt.q:'');
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const HERE=process.env.CC_BANC_DIR||path.join(os.tmpdir(),'cc-banc-pc'),UDD=path.join(HERE,'profil-memoire');
fs.mkdirSync(UDD,{recursive:true});fs.mkdirSync(path.join(HERE,'resultats'),{recursive:true});
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+UDD,'--no-first-run','--no-default-browser-check','--window-size='+W+','+H,'--force-device-scale-factor='+DSF,
    '--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--mute-audio','--hide-scrollbars','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+PORT+'/json/version');return;}catch(e){await dort(200);}}
  throw new Error('Chrome ne répond pas sur '+PORT);}
function tueChrome(){if(!chrome)return;try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
function procs(){
  const ps='Get-CimInstance Win32_Process -Filter "Name=\'chrome.exe\'" | Where-Object { $_.CommandLine -like \'*'+path.basename(UDD)+'*\' } | Select-Object ProcessId,WorkingSetSize,PrivatePageCount,CommandLine | ConvertTo-Json -Compress';
  const r=spawnSync('powershell',['-NoProfile','-Command',ps],{encoding:'utf8',maxBuffer:64<<20});
  let L=[];try{L=JSON.parse(r.stdout||'[]');if(!Array.isArray(L))L=[L];}catch(e){return {};}
  const out={};for(const p of L){const m=/--type=([a-z-]+)/.exec(p.CommandLine||''),t=m?m[1]:'navigateur';out[t]=(out[t]||0)+Math.round(p.PrivatePageCount/1048576);}
  return out;}
class Page{
  constructor(ws){this.ws=ws;this.n=0;this.att={};this.erreurs=[];
    ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'){const p=r.params;if(p.type==='error')this.erreurs.push(p.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ').slice(0,300));}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.erreurs.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n').slice(0,3).join(' | '));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  evF(expr,timeout){return this.ev("(function(){var f=document.getElementById('colonne');var w=f?f.contentWindow:window;return w.eval("+JSON.stringify(expr)+");})()",timeout);}
  async attendF(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.evF('!!('+expr+')'))return true;}catch(e){}await dort(pas||250);}return false;}
}
/* semé dans CHAQUE document avant tout script : la sauvegarde du banc, le compteur des AudioBuffer vivants, et (--trace=1) le traceur des objets three.js */
const SEME=`try{var k='cashcarSave',d={};try{d=JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){}if(!d.v){d={v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3}};}d.sfx=__SON__;d.mus=__SON__;d.vox=__SON__;d.tuto=1;localStorage.setItem(k,JSON.stringify(d));}catch(e){}
try{(function(){var L=[];window.__epoque=0;
  function ou(){try{return String(new Error().stack).split('\\n').slice(3,9).map(function(l){var m=/at (?:(\\S+) )?\\(?.*?([^\\/]+?):(\\d+):\\d+\\)?$/.exec(l.trim());return m?((m[1]||'?')+'@'+m[2].split('?')[0]+':'+m[3]):l.trim().slice(0,40);}).join(' < ');}catch(e){return '?';}}
  function note(b,st){try{if(b&&b.length)L.push({r:new WeakRef(b),o:b.length*b.numberOfChannels*4,e:window.__epoque,st:st||ou()});}catch(e){}return b;}
  var P=(window.BaseAudioContext||window.AudioContext).prototype,d0=P.decodeAudioData,c0=P.createBuffer;
  P.decodeAudioData=function(a,ok,ko){var st=ou();var pr=d0.call(this,a,function(b){note(b,st);if(ok)ok(b);},ko);if(pr&&pr.then)pr.then(function(b){note(b,st);},function(){});return pr;};
  P.createBuffer=function(){return note(c0.apply(this,arguments));};
  window.__audioVivant=function(){var n=0,o=0,vus=new Set(),par={};for(var i=L.length-1;i>=0;i--){var b=L[i].r.deref();if(!b){L.splice(i,1);continue;}if(vus.has(b))continue;vus.add(b);n++;o+=L[i].o;par[L[i].e]=(par[L[i].e]||0)+L[i].o;}
    for(var k in par)par[k]=Math.round(par[k]/104857.6)/10;return {n:n,mo:Math.round(o/104857.6)/10,parEpoque:par,elements:document.querySelectorAll('audio').length};};
  window.__audioOu=function(){var vus=new Set(),G={};for(var i=0;i<L.length;i++){var b=L[i].r.deref();if(!b||vus.has(b))continue;vus.add(b);var q=G[L[i].st]||(G[L[i].st]={n:0,o:0,ep:{}});q.n++;q.o+=L[i].o;q.ep[L[i].e]=Math.round(((q.ep[L[i].e]||0)+L[i].o/1048576)*10)/10;}
    return Object.keys(G).map(function(k){return [Math.round(G[k].o/104857.6)/10,G[k].n,k,G[k].ep];}).sort(function(a,b){return b[0]-a[0];}).slice(0,25);};
})();}catch(e){}
if(__TRACE__)try{(function(){var T=[];Error.stackTraceLimit=14;
  Object.defineProperty(Object.prototype,'uuid',{configurable:true,enumerable:false,get:function(){return undefined;},
    set:function(v){Object.defineProperty(this,'uuid',{value:v,writable:true,enumerable:true,configurable:true});
      var g=this.isBufferGeometry||this.isGeometry?'geo':this.isTexture?'tex':this.isMaterial?'mat':null;if(!g)return;
      var st=String(new Error().stack).split('\\n').slice(2).filter(function(l){return !/three\\.min|vendor\\//.test(l);}).slice(0,5).map(function(l){var m=/at (?:(\\S+) )?\\(?.*?([^\\/]+?):(\\d+):\\d+\\)?$/.exec(l.trim());return m?((m[1]||'?')+'@'+m[2].split('?')[0]+':'+m[3]):l.trim().slice(0,60);}).join(' < ');
      T.push({r:new WeakRef(this),g:g,st:st,e:window.__epoque});}});
  /* vivants = encore en mémoire ; « à la puce » = porte encore l'écouteur dispose que le renderer pose quand il monte l'objet (ce que compte renderer.info.memory) */
  window.__traceVivants=function(e0,e1){var out={},tot={geo:0,tex:0,mat:0},puce={geo:0,tex:0,mat:0},pe={};
    for(var i=T.length-1;i>=0;i--){var o=T[i].r.deref();if(!o){T.splice(i,1);continue;}var ap=!!(o._listeners&&o._listeners.dispose&&o._listeners.dispose.length);tot[T[i].g]++;if(ap){puce[T[i].g]++;if(T[i].g==='geo')pe[T[i].e]=(pe[T[i].e]||0)+1;}
      if(T[i].e<e0||T[i].e>e1)continue;var k=T[i].g+(ap?' PUCE ':' js   ')+T[i].st;var q=out[k]||(out[k]={n:0,ep:{},nom:''});q.n++;q.ep[T[i].e]=(q.ep[T[i].e]||0)+1;if(!q.nom&&o.name)q.nom=o.name;}
    return {tot:tot,puce:puce,geoPuceParEpoque:pe,groupes:Object.keys(out).map(function(k){return [out[k].n,k,out[k].ep,out[k].nom];}).sort(function(a,b){return b[0]-a[0];}).slice(0,60)};};
})();}catch(e){}`;
const MESURE=`(function(){var o={};function t(f){try{return f();}catch(e){return 'ERR '+(e&&e.message);}}
  o.cout=t(function(){var c=dbgCout();return {geo:c.geo,tex:c.tex,progs:c.progs,toile:c.toile};});
  o.scene=t(function(){var n=0,m=0;dbgScene().scene.traverse(function(x){n++;if(x.geometry)m++;});return {objets:n,mailles:m};});
  o.audio=t(function(){return window.__audioVivant?__audioVivant():null;});
  o.sons=t(function(){var e=window.CCSON&&CCSON.etat?CCSON.etat():null;return e?{residents:e.residents,mo:e.mo,evinces:e.evinces}:null;});
  o.canvas=t(function(){var L=[].slice.call(document.querySelectorAll('canvas')),px=0;L.forEach(function(c){px+=c.width*c.height;});return {n:L.length,Mpx:+(px/1e6).toFixed(1)};});
  o.lvl=t(function(){var n=dbgClassique().niveau;return n?n.carte+'-'+n.meteo:null;});
  o.st=t(function(){var s=dbgState();return {started:s.started,gameOver:s.gameOver,level:s.level};});
  return o;})()`;
const R={url:URLF,tag:TAG,releves:[]};
function ligne(r){const c=r.page.cout||{},a=r.page.audio||{},s=r.page.sons||{},sc=r.page.scene||{};
  return r.nom.padEnd(26)+' tas '+String(r.tas).padStart(4)+' Mo · tampons '+String(r.tampons).padStart(4)+' Mo · géo '+String(c.geo).padStart(5)+' · tex '+String(c.tex).padStart(4)+' · progs '+String(c.progs).padStart(3)+
    ' · audio '+String(a.mo).padStart(6)+' Mo ('+a.n+' tampons ; CCSON '+s.mo+' Mo/'+s.residents+') · scène '+sc.objets+' · DOM '+r.noeuds+' écout. '+r.ecouteurs+' · rendu '+r.procs.renderer+' Mo GPU '+r.procs['gpu-process']+' Mo'+(r.page.lvl?' · '+r.page.lvl:'');}
async function releve(p,nom,extra){
  for(let i=0;i<2;i++){try{await p.call('HeapProfiler.collectGarbage');}catch(e){}await dort(400);}
  const m=await p.evF(MESURE);let hu={},dc={};try{hu=await p.call('Runtime.getHeapUsage');}catch(e){}try{dc=await p.call('Memory.getDOMCounters');}catch(e){}
  const r=Object.assign({nom:nom,t:Date.now(),tas:Math.round((hu.usedSize||0)/1048576),tampons:Math.round((hu.backingStorageSize||0)/1048576),noeuds:dc.nodes,ecouteurs:dc.jsEventListeners,documents:dc.documents,procs:procs(),page:m,nErr:p.erreurs.length},extra||{});
  R.releves.push(r);console.log(ligne(r));sauve();return r;}
function sauve(){fs.writeFileSync(path.join(HERE,'resultats',TAG+'.json'),JSON.stringify(R,null,1));}
function resumeTas(prof){const self={};const vis=n=>{const cf=n.callFrame,k=(cf.functionName||'(anonyme)')+' '+(cf.url||'').split('/').pop().split('?')[0]+':'+(cf.lineNumber+1);if(n.selfSize)self[k]=(self[k]||0)+n.selfSize;for(const c of n.children||[])vis(c);};vis(prof.head);return self;}
async function trace(p,nom,e0,e1){if(opt.trace!=='1')return;try{const v=await p.evF('__traceVivants('+e0+','+e1+')');R.traces=R.traces||{};R.traces[nom]=v;
    console.log('   TRACE '+nom+' — vivants '+JSON.stringify(v.tot)+' · à la puce '+JSON.stringify(v.puce)+' · GÉOMÉTRIES À LA PUCE PAR ÉPOQUE DE NAISSANCE '+JSON.stringify(v.geoPuceParEpoque)+' · nés aux époques '+e0+'…'+e1+' :');
    try{const a=await p.evF('__audioOu()');R.audioOu=R.audioOu||{};R.audioOu[nom]=a;console.log('   AUDIO VIVANT par origine (Mo, tampons, où, Mo par époque) :');for(const [mo,n,k,ep] of a.slice(0,14))if(mo>=.3)console.log('     '+String(mo).padStart(6)+' Mo '+String(n).padStart(4)+'  '+k.slice(0,150)+'  '+JSON.stringify(ep));}catch(e){}
    for(const [n,k,ep,nm] of v.groupes.slice(0,25))console.log('     '+String(n).padStart(5)+'  '+k+(nm?'  «'+nm+'»':'')+'  '+JSON.stringify(ep));}catch(e){console.log('   trace : '+e.message);}}
const epoque=(p,n)=>p.evF('window.__epoque='+n+';try{parent.__epoque='+n+';}catch(e){}');
async function depart(p,carte){
  if(carte)await p.evF('try{dbgClassique('+carte.split(',').map(x=>JSON.stringify(x)).join(',')+');}catch(e){}');
  let st=await p.evF('dbgState()');
  if(!(st.started&&!st.gameOver)){
    await p.evF("(function(){try{var sp=document.getElementById('splash');if(sp){sp.click();setTimeout(function(){try{sp.remove();}catch(e){}},900);}}catch(e){}})()");await dort(1200);
    await p.evF("(function(){try{var b=document.querySelector('#mHome [data-m=play]');if(b)b.click();}catch(e){}})()");await dort(2500);
    await p.evF("(function(){try{return JSON.stringify(dbgJouer());}catch(e){return 'erreur '+e.message;}})()");}
  const ok=await p.attendF('dbgState().started&&!dbgState().gameOver',60000,250);if(ok){await dort(1500);await p.evF('try{dbgAuto(true,0)}catch(e){}');}return ok;}
async function saut(p,carte){ /* comme le vrai portail (newTrack), vers la map imposée ; rend faux si la partie est finie */
  const st=await p.evF('dbgState()');if(!st.started||st.gameOver)return false;
  await p.evF('try{dbgClassique('+carte.split(',').map(x=>JSON.stringify(x)).join(',')+');}catch(e){}');
  const r=await p.evF("(function(){try{var x=dbgSaut();return typeof x==='string'?x:'ok';}catch(e){return 'erreur '+e.message;}})()",180000);
  if(r!=='ok')console.log('   saut vers '+carte+' : '+r);await p.evF('try{dbgAuto(true,0)}catch(e){}');return r==='ok';}
async function meurs(p){const st=await p.evF('dbgState()');if(!st.gameOver){await p.evF('try{dbgDeathNow();}catch(e){}');await p.attendF('dbgState().gameOver',25000,250);}await dort(4500);}
async function rejoue(p){await p.evF("(function(){try{var b=document.querySelector('#mDead.on [data-m=\"replay\"]')||document.querySelector('[data-m=\"replay\"]');if(b)b.click();}catch(e){}})()");await dort(3500);}
(async function(){
  await lanceChrome();
  const t=await putJson('http://127.0.0.1:'+PORT+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:SEME.replace(/__SON__/g,opt.son==='0'?'false':'true').replace('__TRACE__',opt.trace==='1'?'true':'false')});
  if(opt.tas==='1'){await p.call('HeapProfiler.enable');await p.call('HeapProfiler.startSampling',{samplingInterval:16384});}
  const t0=Date.now();await p.call('Page.navigate',{url:URLF});
  const ok=await p.attendF("document.getElementById('colonne')?document.getElementById('colonne').contentWindow.__gameReady:window.__gameReady",240000,200);
  console.log('prêt en '+(Date.now()-t0)+' ms ('+(ok?'ok':'JAMAIS PRÊT')+') · '+URLF);if(!ok){tueChrome();process.exit(2);}
  await dort(6000);
  const cartes=await p.evF('dbgClassique().cartes');R.cartes=cartes;
  const TOUR=(opt.tour?opt.tour.split('>'):cartes.map(c=>{const k=c.split(' : ')[0],m=c.split(' : ')[1].split(', ');return k+','+(m.indexOf('midi')>=0?'midi':m[0]);}));
  R.tour=TOUR;console.log('tour des parties : '+TOUR.join(' > '));
  await releve(p,'menu');
  /* ---- PHASE 1 : N parties identiques ---- */
  let tasAv=null;
  for(let c=1;c<=PARTIES;c++){await epoque(p,c);
    if(!await depart(p,TOUR[0])){console.log('partie '+c+' : jamais partie');await releve(p,'partie '+c+' PAS PARTIE');break;}
    await dort(ZONE*1000);let faits=1;
    for(let z=1;z<TOUR.length;z++){if(!await saut(p,TOUR[z]))break;faits++;await dort(ZONE*1000);}
    await meurs(p);const r=await releve(p,'partie '+c+' (mort, '+faits+' maps)',{phase:1,i:c,maps:faits});
    if(opt.tas==='1'&&(c===2||c===PARTIES)){try{const pr=await p.call('HeapProfiler.getSamplingProfile');const s=resumeTas(pr.profile);
        if(c===2)tasAv=s;else if(tasAv){const d=Object.keys(s).map(k=>[Math.round(((s[k]||0)-(tasAv[k]||0))/1024),k]).sort((a,b)=>b[0]-a[0]);R.tasDiff=d.slice(0,40);
          console.log('   ALLOCATIONS JS VIVANTES, partie '+c+' moins partie 2 (Ko, par fonction) :');for(const [ko,k] of d.slice(0,25))if(ko>=64)console.log('     '+String(ko).padStart(7)+' Ko  '+k);}}catch(e){console.log('   tas : '+e.message);}}
    if(c===2||c===PARTIES)await trace(p,'après la partie '+c+' : nés pendant les parties 2…'+c,2,c);
    await rejoue(p);}
  /* ---- PHASE 2 : N chaînes A-B-A-B par paire ---- */
  const PAIRES=CHAINES>0?(opt.paires||'nuages,midi:ville,orage').split(';'):[];let ep=100;
  for(const pa of PAIRES){const [A,B]=pa.split(':');console.log('— chaînes '+A+' / '+B+' —');
    await meurs(p).catch(()=>{});await rejoue(p);
    if(!await depart(p,A)){console.log('chaînes : jamais parti');break;}await dort(ZONE*1000);const e0=ep;
    if((await p.evF("(function(){var n=dbgClassique().niveau;return n?n.carte+','+n.meteo:'';})()"))!==A){await saut(p,A);await dort(ZONE*1000);} /* le REJOUER avait déjà tiré sa map : on rejoint A par un portail */
    await releve(p,'chaîne 0 '+A.split(',')[0],{phase:2,paire:pa,i:0});
    for(let c=1;c<=CHAINES;c++){ep++;await epoque(p,ep);let vivant=true;
      for(const X of [B,A,B,A]){if(!await saut(p,X)){vivant=false;break;}await dort(ZONE*1000);}
      if(!vivant){console.log('   (mort en cours de chaîne '+c+' : on repart sur '+A+')');await meurs(p);await rejoue(p);if(!await depart(p,A))break;await dort(ZONE*1000);}
      await releve(p,'chaîne '+c+(vivant?'':' (reparti)'),{phase:2,paire:pa,i:c,vivant:vivant});
      if(c===2||c===CHAINES)await trace(p,pa+' après la chaîne '+c+(opt.tracetout==='1'?' : TOUT ce qui vit':' : nés pendant les chaînes 2…'+c),opt.tracetout==='1'?0:e0+2,ep);}}
  /* ---- le bilan ---- */
  const bil=(L,nom)=>{if(L.length<3)return;const a=L.find(r=>r.i===2)||L[1],b=L[L.length-1],d=(f)=>f(b)-f(a);
    console.log('BILAN '+nom+' — de '+a.nom+' à '+b.nom+' : tas '+(d(r=>r.tas)>=0?'+':'')+d(r=>r.tas)+' Mo · tampons '+(d(r=>r.tampons)>=0?'+':'')+d(r=>r.tampons)+' Mo · géométries '+(d(r=>r.page.cout.geo)>=0?'+':'')+d(r=>r.page.cout.geo)+
      ' · textures '+(d(r=>r.page.cout.tex)>=0?'+':'')+d(r=>r.page.cout.tex)+' · programmes '+(d(r=>r.page.cout.progs)>=0?'+':'')+d(r=>r.page.cout.progs)+' · audio '+(d(r=>r.page.audio.mo)>=0?'+':'')+d(r=>r.page.audio.mo).toFixed(1)+' Mo · DOM '+(d(r=>r.noeuds)>=0?'+':'')+d(r=>r.noeuds)+' · écouteurs '+(d(r=>r.ecouteurs)>=0?'+':'')+d(r=>r.ecouteurs)+' · rendu '+(d(r=>r.procs.renderer)>=0?'+':'')+d(r=>r.procs.renderer)+' Mo');};
  bil(R.releves.filter(r=>r.phase===1),'PARTIES');for(const pa of PAIRES)bil(R.releves.filter(r=>r.phase===2&&r.paire===pa),'CHAÎNES '+pa);
  R.erreurs=p.erreurs.slice(-30);if(p.erreurs.length)console.log('erreurs ('+p.erreurs.length+') : '+[...new Set(p.erreurs)].slice(0,8).join(' || '));
  sauve();console.log('→ '+path.join(HERE,'resultats',TAG+'.json'));tueChrome();
})().catch(e=>{console.error('ÉCHEC',e);try{sauve();}catch(_){}tueChrome();process.exit(1);});
