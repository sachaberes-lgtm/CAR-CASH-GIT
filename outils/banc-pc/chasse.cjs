/* ===== LA CHASSE AUX MILLISECONDES DE L'ORDI (2026-11-13, Sacha : « lance une grosse session d'optimisation sur la version vercel pc ») =====
   Chaque couple map:météo joué dans la PAGE-CADRE de l'ordi (la colonne du téléphone couché agrandie à la fenêtre — ce que Vercel montre au PC),
   à la taille de l'écran de Sacha (2560×1350 CSS à 150 %), régime du poste au MAXIMUM (?poste=max), graine de piste fixe, pilote auto, bac à sable
   (la caisse se replace au lieu de mourir). Par couple :
     · images DU JEU (scene.onBeforeRender : médiane, p95, p99, max, part > 18 / 25 / 33 ms) sur --duree secondes, après 6 s de chauffe ;
     · dbgCout : temps JS de l'image (début de loop → fin du rendu soumis), appels de dessin et triangles de l'image entière, toile, cran ;
     · profil CPU (--cpu=1, défaut) : les fonctions les plus chères en temps PROPRE, en ms par seconde de jeu, avec le MORCEAU de code/ d'où
       elles viennent (index.html = les morceaux d'ORDRE.txt bout à bout) ; part du ramasse-miettes ;
     · tâches longues (> 50 ms) pendant la mesure ;
     · --figee=1 (défaut) : l'image figée (dbgChrono : rendu complet + lecture d'un pixel) et le prix de chaque poste (sans ombre, bloom, post, ciel,
       nuages, piste, caisse, transparents, décor), témoin encadré avant/après.
   node outils/banc-maps/serveur.cjs 8241 <racine du dépôt>          (dans un terminal à part)
   node outils/banc-pc/chasse.cjs --port=8241 --cartes=nuages:midi,jade:soir --tag=avant [--cdp=9471] [--profil=chasse] [--duree=15]
        [--w=2560 --h=1350 --dsf=1.5] [--q=a=b&c=d] [--cpu=0] [--figee=0] [--racine=<dépôt pour l'ordre des morceaux>]
   Sortie : %TEMP%/cc-banc-pc/chasse/<tag>.json et un résumé à l'écran. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z0-9]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8241),CDP=+(opt.cdp||9471),W=+(opt.w||2560),H=+(opt.h||1350),DSF=opt.dsf||'1.5',DUREE=+(opt.duree||15),TAG=opt.tag||'chasse';
const TOUTES='nuages:midi,nuages:soir,ville:orage,jade:matin,jade:nuit,crypto:midi,espace:matin,grotte:midi,canyon:matin';
const CARTES=(opt.cartes&&opt.cartes!=='toutes'?opt.cartes:TOUTES).split(',');
const RACINE=path.resolve(opt.racine||path.join(__dirname,'..','..'));
const OUT=path.join(process.env.CC_BANC_DIR||path.join(os.tmpdir(),'cc-banc-pc'),'chasse');fs.mkdirSync(OUT,{recursive:true});
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const getJson=u=>new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));
const putJson=u=>new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});
/* les morceaux : ligne d'index.html → morceau de code/ (pour nommer la provenance des fonctions du profil) */
const MORCEAUX=(function(){try{const L=fs.readFileSync(path.join(RACINE,'code','ORDRE.txt'),'utf8').split(/\r?\n/).map(l=>l.replace(/#.*$/,'').trim()).filter(Boolean);
  let n=0;const R=[];for(const m of L){const t=fs.readFileSync(path.join(RACINE,'code',m),'utf8');const k=(t.match(/\n/g)||[]).length;R.push([n,n+k,m]);n+=k;}return R;}catch(e){return [];}})();
function morceau(l){for(const r of MORCEAUX)if(l>=r[0]&&l<=r[1])return r[2]+':'+(l-r[0]+1);return 'index:'+(l+1);}
let chrome=null;
async function lanceChrome(){const udd=path.join(os.tmpdir(),'cc-banc-'+(opt.profil||'chasse'));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size='+W+','+H,'--force-device-scale-factor='+DSF,
    '--mute-audio','--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--hide-scrollbars','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}throw new Error('Chrome ne répond pas sur '+CDP);}
function tueChrome(){if(!chrome)return;try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.err=[];
  ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
    else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.err.push('EXCEPTION '+String((d.exception&&d.exception.description)||d.text).split('\n')[0].slice(0,240));}
    else if(r.method==='Tracing.dataCollected'){(this.trace||(this.trace=[])).push.apply(this.trace,r.params.value);}else if(r.method==='Tracing.tracingComplete'){if(this.finTrace)this.finTrace();}
    else if(r.method==='LayerTree.layerTreeDidChange'){if(r.params.layers){if(this.onCouches)this.onCouches(r.params.layers);if(this.couchesCb){const f=this.couchesCb;this.couchesCb=null;f();}}}
    else if(r.method==='Runtime.consoleAPICalled'&&r.params.type==='error'){this.err.push('console: '+r.params.args.map(a=>a.value||a.description||'').join(' ').slice(0,240));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(e,t){const r=await this.call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true,timeout:t||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  evF(e,t){return this.ev("(function(){var f=document.getElementById('colonne');var w=f?f.contentWindow:window;return w.eval("+JSON.stringify(e)+");})()",t);}
  async attendF(e,ms,pas){const t0=Date.now();while(Date.now()-t0<ms){try{if(await this.evF('!!('+e+')'))return true;}catch(x){}await dort(pas||250);}return false;}}
/* dans le jeu : les images DU JEU (deux rendus à moins de 4 ms = la même image), et les tâches longues */
const SONDE="(function(){if(window.__fr)return 1;window.__fr=[];window.__lt=[];var d=0,S=dbgScene().scene,ob=S.onBeforeRender;S.onBeforeRender=function(a,b,c,e){var n=performance.now();if(n-d>4){if(d)window.__fr.push(n-d);d=n;}return ob.call(this,a,b,c,e);};"+
  "try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__lt.push(Math.round(e.duration));});}).observe({type:'longtask',buffered:false});}catch(e){}return 1;})()";
function stats(a){if(!a||!a.length)return null;const t=a.slice().sort((x,y)=>x-y),n=t.length,s=t.reduce((x,y)=>x+y,0);const q=f=>+t[Math.min(n-1,Math.floor(n*f))].toFixed(1);
  const sup=v=>Math.round(t.filter(x=>x>v).length*1000/n)/10;return {n:n,ips:Math.round(n*1000/s),moy:+(s/n).toFixed(2),p50:q(.5),p95:q(.95),p99:q(.99),max:+t[n-1].toFixed(0),sup18:sup(18),sup25:sup(25),sup33:sup(33)};}
function resumeCpu(prof,dureeS){const byId={};for(const n of prof.nodes)byId[n.id]=n;const dt=prof.timeDeltas||[];const cnt={};
  for(let i=0;i<prof.samples.length;i++){cnt[prof.samples[i]]=(cnt[prof.samples[i]]||0)+(dt[i]||0);}
  const self={};let tot=0,idle=0,gc=0,prog=0;
  for(const id in cnt){const n=byId[id];if(!n)continue;const cf=n.callFrame,u=(cf.url||'').split('/').pop().split('?')[0];const v=cnt[id];tot+=v;
    if(cf.functionName==='(idle)'){idle+=v;continue;}if(cf.functionName==='(garbage collector)'){gc+=v;}if(cf.functionName==='(program)'){prog+=v;}
    const ou=/index\.html/.test(u)?morceau(cf.lineNumber):(u||'?')+':'+(cf.lineNumber+1);const k=(cf.functionName||'(anonyme)')+' '+ou;self[k]=(self[k]||0)+v;}
  const parS=v=>+(v/1000/dureeS).toFixed(2);
  const par={};for(const n of prof.nodes)for(const c of (n.children||[]))par[c]=n.id;
  const nomDe=id=>{const n=byId[id];if(!n)return null;const cf=n.callFrame,u=(cf.url||'').split('/').pop().split('?')[0];if(!cf.functionName||/^\((root|program|idle)\)/.test(cf.functionName))return null;if(/three\.min/.test(u))return 'three:'+cf.functionName;if(!u)return 'natif:'+cf.functionName;return cf.functionName+' '+(/index\.html/.test(u)?morceau(cf.lineNumber):u+':'+(cf.lineNumber+1));};
  const gels=[];{let t=prof.startTime,deb=-1,fin=-1,ids=[];const clot=()=>{if(deb>=0&&fin-deb>40000){const inc={};for(const id of ids){const vu=new Set();let x=id;while(x!=null){const k=nomDe(x);if(k&&!vu.has(k)){vu.add(k);inc[k]=(inc[k]||0)+1;}x=par[x];}}
      gels.push({ms:Math.round((fin-deb)/1000),aS:+((deb-prof.startTime)/1e6).toFixed(2),qui:Object.entries(inc).sort((a,b)=>b[1]-a[1]).slice(0,16).map(([k,v])=>Math.round(v*100/ids.length)+'% '+k)});}deb=-1;ids=[];};
    for(let i=0;i<prof.samples.length;i++){t+=dt[i]||0;const n=byId[prof.samples[i]];const oisif=n&&n.callFrame.functionName==='(idle)';
      if(oisif){if(deb>=0&&t-fin>3000)clot();continue;}if(deb<0){deb=t;}fin=t;ids.push(prof.samples[i]);}clot();}
  const incl={};{const nomJ=id=>{const n=byId[id];if(!n)return null;const cf=n.callFrame,u=(cf.url||'').split('/').pop().split('?')[0];if(!cf.functionName)return null;if(/index\.html/.test(u))return cf.functionName+' '+morceau(cf.lineNumber).replace(/:\d+$/,'');if(/^(EffectComposer|RenderPass|UnrealBloomPass|ShaderPass)\.js$/.test(u))return cf.functionName+' '+u;return null;};
    const memo={};const chaine=id=>{if(memo[id])return memo[id];const vu=new Set();let x=id;while(x!=null){const k=nomJ(x);if(k)vu.add(k);x=par[x];}return memo[id]=[...vu];};
    for(const id in cnt){for(const k of chaine(+id))incl[k]=(incl[k]||0)+cnt[id];}}
  const tot2={};const total=id=>{if(tot2[id]!=null)return tot2[id];const n=byId[id];let v=cnt[id]||0;for(const c of (n&&n.children)||[])v+=total(c);return tot2[id]=v;};
  const cible=opt.enfants||'loop',enf={};for(const n of prof.nodes){if(n.callFrame.functionName!==cible)continue;for(const c of n.children||[]){const m=byId[c];if(!m)continue;const cf=m.callFrame,u=(cf.url||'').split('/').pop().split('?')[0];
    const k=(cf.functionName||'(anonyme)')+' '+(/index\.html/.test(u)?morceau(cf.lineNumber):(u||'natif')+':'+(cf.lineNumber+1));enf[k]=(enf[k]||0)+total(c);}const sv=cnt[n.id]||0;enf['(propre de '+cible+')']=(enf['(propre de '+cible+')']||0)+sv;}
  return {enfants:Object.entries(enf).sort((a,b)=>b[1]-a[1]).slice(0,45).map(([k,v])=>[parS(v),k]),incl:Object.entries(incl).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>[parS(v),k]),gels:gels.sort((a,b)=>b.ms-a.ms).slice(0,6),occupeMsParS:parS(tot-idle),gcMsParS:parS(gc),programMsParS:parS(prog),top:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>[parS(v),k])};}
/* la trace : temps PROPRE par nom d'événement sur le fil principal du jeu (pile : un événement contient ses enfants) */
function resumeTrace(ev,dS){const nom={};for(const e of ev)if(e.ph==='M'&&e.name==='thread_name')nom[e.pid+':'+e.tid]=e.args.name;
  const cnt={};for(const e of ev)if((e.ph==='X'||e.ph==='B')&&nom[e.pid+':'+e.tid]==='CrRendererMain')cnt[e.pid+':'+e.tid]=(cnt[e.pid+':'+e.tid]||0)+1;
  const fil=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];if(!fil)return null;
  const L=ev.filter(e=>e.pid+':'+e.tid===fil&&(e.ph==='X'||e.ph==='B'||e.ph==='E')).sort((a,b)=>a.ts-b.ts||(a.ph==='E'?-1:1));
  const self={},pile=[];const ferme=(f,t)=>{const d=t-f.ts;self[f.name]=(self[f.name]||0)+d-f.enf;if(pile.length)pile[pile.length-1].enf+=d;};
  for(const e of L){while(pile.length&&pile[pile.length-1].fin!=null&&pile[pile.length-1].fin<=e.ts){const f=pile.pop();ferme(f,f.fin);}
    if(e.ph==='E'){for(let i=pile.length-1;i>=0;i--)if(pile[i].fin==null&&pile[i].name===e.name){while(pile.length>i+1){const f=pile.pop();ferme(f,f.fin!=null?f.fin:e.ts);}const f=pile.pop();ferme(f,e.ts);break;}continue;}
    pile.push({name:e.name,ts:e.ts,fin:e.ph==='X'?e.ts+(e.dur||0):null,enf:0});}
  while(pile.length){const f=pile.pop();ferme(f,f.fin!=null?f.fin:f.ts);}
  const tot=Object.values(self).reduce((a,b)=>a+b,0);
  const inv={};let nUlt=0,elts=0;for(const e of ev){if(e.pid+':'+e.tid!==fil)continue;
    if(e.name==='UpdateLayoutTree'&&e.ph==='X'){nUlt++;const d=(e.args&&(e.args.elementCount!=null?e.args:e.args.data||e.args.endData))||{};elts+=(d.elementCount|0);}
    if(/InvalidationTracking/.test(e.name)){const d=(e.args&&e.args.data)||{};const st=(d.stackTrace||[]).filter(f=>f.functionName).slice(0,2).map(f=>f.functionName+(/index\.html/.test(f.url||'')?'@'+morceau(f.lineNumber):'')).join('<');
      const k=e.name.replace('InvalidationTracking','')+' · '+(d.reason||d.changedClass||d.changedAttribute||d.changedPseudo||d.changedId||'')+(d.changedClass?' .'+d.changedClass:'')+(d.changedAttribute?' ['+d.changedAttribute+']':'')+' · '+(d.nodeName||'')+' · '+st;inv[k]=(inv[k]||0)+1;}}
  const force={};for(const e of ev){if(e.pid+':'+e.tid!==fil||e.ph!=='X'||(e.name!=='UpdateLayoutTree'&&e.name!=='Layout'))continue;const bd=(e.args&&(e.args.beginData||e.args.data))||{};const st=bd.stackTrace;if(!st||!st.length)continue;
    const f=st.filter(x=>x.functionName).slice(0,3).map(x=>x.functionName+(/index\.html/.test(x.url||'')?'@'+morceau(x.lineNumber):'')).join(' < ');const k=e.name+' · '+f;const o=force[k]||(force[k]={n:0,us:0});o.n++;o.us+=e.dur||0;}
  const forces=Object.entries(force).sort((x,y)=>y[1].us-x[1].us).slice(0,20).map(([k,o])=>[+(o.us/1000/dS).toFixed(2),+(o.n/dS).toFixed(1),k]);
  return {forces:forces,styleRecalcParS:+(nUlt/dS).toFixed(1),eltsParRecalc:nUlt?Math.round(elts/nUlt):0,invalidations:Object.entries(inv).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>[+(v/dS).toFixed(1),k]),occupeMsParS:+(tot/1000/dS).toFixed(1),top:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,22).map(([k,v])=>[+(v/1000/dS).toFixed(2),k])};}
function resumeAlloc(hp,dS){const out={};let tot=0;const va=(n,pile)=>{const cf=n.callFrame,u=(cf.url||'').split('/').pop().split('?')[0];
  const k=(cf.functionName||'(anonyme)')+' '+(/index\.html/.test(u)?morceau(cf.lineNumber):(u||'natif')+':'+(cf.lineNumber+1));
  if(n.selfSize){tot+=n.selfSize;const j=pile.length?pile[pile.length-1]:'';const kk=/three\.min|^\(|natif/.test(k)&&j?k+'  ← '+j:k;out[kk]=(out[kk]||0)+n.selfSize;}
  const p2=/index\.html/.test(u)?pile.concat([k]):pile;for(const ch of n.children||[])va(ch,p2);};va(hp.head,[]);
  return {moParS:+(tot/1048576/dS).toFixed(2),top:Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([k,v])=>[+(v/1048576/dS).toFixed(3),k])};}
const POSTES=['ombre','bloom','post','ciel','nuages','piste','caisse','transparents','decor'];
async function couple(cm){const [c,m]=cm.split(':');const r={carte:cm};const t0=Date.now();
  const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((o,k)=>{ws.onopen=o;ws.onerror=k;});
  const p=new Page(ws);await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  /* la sauvegarde du banc : auto-école faite, plaque posée — et MUETTE (sfx, mus, vox) */
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{if(!sessionStorage.ccChasse){sessionStorage.ccChasse=1;localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}}catch(e){}"});
  const url='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien'+(opt.attente==='1'?'':'&attente=0')+'&carte='+c+(m?'&meteo='+m:'')+'&pistegraine=7&poste=max'+(opt.q?'&'+opt.q:'');
  try{await p.call('Page.navigate',{url});
    if(!await p.attendF("window.__gameReady&&typeof window.dbgScene==='function'",240000,300))throw new Error('pas prêt');
    for(let i=0;i<60&&await p.evF('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(400);}
    await p.attendF("document.body.classList.contains('titreCiel')",60000);
    for(let i=0;i<8&&await p.evF("!!document.getElementById('splash')");i++){await p.evF("(function(){var e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(500);}
    let st=false;for(let k=0;k<3&&!st;k++){await p.evF('dbgJouer()');st=await p.attendF('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
    if(!st)throw new Error('course pas lancée');
    await p.evF("try{dbgSable(true);}catch(e){}");await p.evF("try{dbgAuto(true,0);}catch(e){}");await p.evF(SONDE);await p.evF('try{dbgCout(1)}catch(e){}');
    if(opt.cssjeu)await p.evF('(function(){var st=document.createElement("style");st.textContent='+JSON.stringify(opt.cssjeu)+';document.head.appendChild(st);return 1;})()');
    if(opt.jsjeu)r.jsjeu=await p.evF(fs.readFileSync(opt.jsjeu,'utf8'));
    await dort(6000);await p.evF('window.__fr.length=0;window.__lt.length=0;dbgCout(1);');
    const avecCpu=opt.cpu!=='0';
    if(avecCpu){await p.call('Profiler.enable');await p.call('Profiler.setSamplingInterval',{interval:250});await p.call('Profiler.start');}
    if(opt.alloc==='1'){await p.call('HeapProfiler.enable');await p.call('HeapProfiler.startSampling',{samplingInterval:16384,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});}
    const tm=Date.now();await dort(DUREE*1000);
    if(opt.alloc==='1'){const hp=(await p.call('HeapProfiler.stopSampling')).profile;r.alloc=resumeAlloc(hp,DUREE);await p.call('HeapProfiler.disable');}
    let prof=null;if(avecCpu){prof=(await p.call('Profiler.stop')).profile;await p.call('Profiler.disable');}
    const dS=(Date.now()-tm)/1000;
    if(opt.jsfin)try{r.jsfin=await p.evF(fs.readFileSync(opt.jsfin,'utf8'));}catch(e){r.jsfin='erreur '+e.message;}
    r.images=stats(await p.evF('window.__fr.slice()'));r.longues=await p.evF('window.__lt.slice(0,30)');
    r.cout=await p.evF("(function(){try{var c=dbgCout();return {js:c.cpu,gpu:c.gpu,image:c.image,toile:c.toile,dpr:c.dpr,passes:c.passes,bloom:c.bloom,ombre:c.ombre,ql:c.ql,geo:c.geo,tex:c.tex,progs:c.progs,chrono:c.chrono};}catch(e){return String(e);}})()");
    r.lieu=await p.evF("(function(){try{var s=dbgState();return {lieu:(typeof dbgLvl==='function'?null:null),mode:s.mode,kmh:Math.round(s.kmh||0)};}catch(e){return null;}})()");
    try{r.tasMo=await p.evF('Math.round(performance.memory.usedJSHeapSize/1048576)');}catch(e){}
    if(prof)r.cpu=resumeCpu(prof,dS);
    if(opt.couches==='1'){try{let der=null;const vu=new Promise(o=>{p.couchesCb=o;});p.onCouches=ls=>{der=ls;};await p.call('LayerTree.enable');await Promise.race([vu,dort(3000)]);await dort(800);
      const L=(der||[]).filter(l=>l.drawsContent!==false);const raisons={};let surf=0;
      for(const l of L.slice(0,400)){surf+=(l.width||0)*(l.height||0);let rs=[];try{const q=await p.call('LayerTree.compositingReasons',{layerId:l.layerId});rs=q.compositingReasonIds||q.compositingReasons||[];}catch(e){}
        const k=rs.slice().sort().join('+')||'(aucune)';const o=raisons[k]||(raisons[k]={n:0,px:0});o.n++;o.px+=(l.width||0)*(l.height||0);}
      const gros=[];for(const l of L.slice().sort((x,y)=>(y.width*y.height)-(x.width*x.height)).slice(0,+(opt.ncouches||22))){let nom='?';try{if(l.backendNodeId){const dn=await p.call('DOM.describeNode',{backendNodeId:l.backendNodeId});const n=dn.node;const at={};for(let i=0;i<(n.attributes||[]).length;i+=2)at[n.attributes[i]]=n.attributes[i+1];nom=(n.localName||n.nodeName)+(at.id?'#'+at.id:'')+(at.class?'.'+at.class.trim().split(/\s+/).slice(0,3).join('.'):'')+(n.pseudoType?'::'+n.pseudoType:'');}}catch(e){nom='(pas de nœud)';}
        let rs=[];try{const q=await p.call('LayerTree.compositingReasons',{layerId:l.layerId});rs=q.compositingReasonIds||q.compositingReasons||[];}catch(e){}gros.push([+((l.width*l.height)/1e6).toFixed(2),l.width+'×'+l.height,(l.invisible?'INVISIBLE ':'')+nom,rs.join('+')]);}
      r.couches={gros:gros,n:(der||[]).length,dessinent:L.length,mpx:+(surf/1e6).toFixed(2),raisons:Object.entries(raisons).sort((x,y)=>y[1].n-x[1].n).slice(0,20).map(([k,o])=>[o.n,+(o.px/1e6).toFixed(2),k])};await p.call('LayerTree.disable');}catch(e){r.couches='erreur '+e.message;}}
    if(opt.trace!=='0'){await dort(Math.min(4000,DUREE*500));p.trace=[];await p.call('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking,disabled-by-default-devtools.timeline.stack,v8.execute,gpu,cc',transferMode:'ReportEvents'});await dort(1000*(+(opt.tracedur||4)));
      const fin=new Promise(o=>{p.finTrace=o;});await p.call('Tracing.end');await Promise.race([fin,dort(20000)]);r.trace=resumeTrace(p.trace,+(opt.tracedur||4));p.trace=null;}
    if(opt.figee!=='0'){const F={};const ch=k=>p.evF('JSON.stringify(dbgChrono(40'+(k?",'"+k+"'":'')+'))').then(JSON.parse);
      await p.evF("try{dbgFlou({s:0});}catch(e){}");await dort(300);
      const t1=await ch();F.temoin=t1.ms;F.toile=t1.toile;
      for(const k of POSTES){const a=await ch(),x=await ch(k),b=await ch();F[k]=x.erreur?x.erreur:+(x.ms-(a.ms+b.ms)/2).toFixed(2);}
      F.temoinFin=(await ch()).ms;r.figee=F;}
  }catch(e){r.erreur=String(e.message||e);}
  r.err=[...new Set(p.err)].slice(0,6);r.dur=Math.round((Date.now()-t0)/1000);
  try{ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+t.id);}catch(e){}return r;}
function affiche(r){const i=r.images||{},c=r.cout||{},js=c.js||{},F=r.figee;
  console.log('\n=== '+r.carte+(r.erreur?'  ERREUR '+r.erreur:''));
  if(i.n)console.log('  images : '+i.ips+' i/s · moy '+i.moy+' · méd '+i.p50+' · p95 '+i.p95+' · p99 '+i.p99+' · max '+i.max+' ms · >18 '+i.sup18+' % · >25 '+i.sup25+' % · >33 '+i.sup33+' %');
  if(c.image)console.log('  JS image : méd '+js.p50+' · p90 '+js.p90+' · max '+js.max+' ms · '+c.image.calls+' appels · '+Math.round(c.image.tris/1000)+' k tri · toile '+(c.toile||[]).join('×')+' dpr '+c.dpr+' · ombre '+c.ombre+' · bloom '+JSON.stringify(c.bloom)+' · ql '+c.ql+' · géo '+c.geo+' tex '+c.tex+' progs '+c.progs+(c.gpu?' · GPU méd '+c.gpu.p50:'')+' · tas '+r.tasMo+' Mo');
  if(r.longues&&r.longues.length)console.log('  tâches longues : '+r.longues.join(', '));
  if(F)console.log('  image figée : '+F.temoin+' ms (fin '+F.temoinFin+') · '+POSTES.map(k=>k+' '+F[k]).join(' · '));
  if(r.trace){console.log('  TRACE fil principal '+r.trace.occupeMsParS+' ms/s :');for(const [v,k] of r.trace.top.slice(0,16))console.log('     '+String(v).padStart(7)+'  '+k);}
  if(r.couches){if(typeof r.couches==='string')console.log('  COUCHES : '+r.couches);else{console.log('  COUCHES : '+r.couches.n+' ('+r.couches.dessinent+' qui dessinent, '+r.couches.mpx+' Mpx) :');for(const [n,px,k] of r.couches.raisons)console.log('     '+String(n).padStart(5)+'  '+String(px).padStart(6)+' Mpx  '+k);if(r.couches.gros){console.log('  LES PLUS GRANDES :');for(const [m,t,nm,rs] of r.couches.gros)console.log('     '+String(m).padStart(6)+' Mpx  '+t.padEnd(11)+' '+nm+'  ['+rs+']');}}}
  if(r.trace&&r.trace.forces&&r.trace.forces.length){console.log('  FORCÉS (ms/s · par s · qui) :');for(const [v,n,k] of r.trace.forces.slice(0,+(opt.nforce||12)))console.log('     '+String(v).padStart(7)+' '+String(n).padStart(6)+'  '+k);}
  if(r.trace&&r.trace.invalidations){console.log('  STYLES : '+r.trace.styleRecalcParS+' recalculs/s · '+r.trace.eltsParRecalc+' éléments/recalcul · invalidations par s :');for(const [v,k] of r.trace.invalidations.slice(0,+(opt.inv||14)))console.log('     '+String(v).padStart(7)+'  '+k);}
  if(r.cpu&&r.cpu.gels&&r.cpu.gels.length){console.log('  GELS (profil) :');for(const g of r.cpu.gels.slice(0,+(opt.gels||4)))console.log('     '+g.ms+' ms à '+g.aS+' s : '+g.qui.slice(0,+(opt.qui||8)).join(' | '));}
  if(r.alloc){console.log('  ALLOCATIONS '+r.alloc.moParS+' Mo/s :');for(const [v,k] of r.alloc.top.slice(0,+(opt.nalloc||20)))console.log('     '+String(v).padStart(7)+'  '+k);}
  if(r.cpu&&r.cpu.enfants&&+(opt.nenf||0)>0){console.log('  ENFANTS de '+(opt.enfants||'loop')+' (ms/s) :');for(const [v,k] of r.cpu.enfants.slice(0,+opt.nenf))console.log('     '+String(v).padStart(7)+'  '+k);}
  if(r.cpu&&r.cpu.incl){console.log('  INCLUSIF (ms/s) :');for(const [v,k] of r.cpu.incl.slice(0,+(opt.incl||24)))console.log('     '+String(v).padStart(7)+'  '+k);}
  if(r.cpu){console.log('  CPU occupé '+r.cpu.occupeMsParS+' ms/s · GC '+r.cpu.gcMsParS+' · (program) '+r.cpu.programMsParS);for(const [v,k] of r.cpu.top.slice(0,+(opt.top||22)))console.log('     '+String(v).padStart(7)+'  '+k);}
  if(r.jsjeu!==undefined)console.log('  jsjeu : '+JSON.stringify(r.jsjeu).slice(0,1500));if(r.jsfin!==undefined)console.log('  jsfin : '+JSON.stringify(r.jsfin).slice(0,4000));
  if(r.err&&r.err.length)console.log('  erreurs : '+r.err.join(' | '));}
(async function(){const bilan={tag:TAG,date:new Date().toISOString(),w:W,h:H,dsf:DSF,cartes:[]};await lanceChrome();
  try{for(const cm of CARTES){const r=await couple(cm);bilan.cartes.push(r);affiche(r);fs.writeFileSync(path.join(OUT,TAG+'.json'),JSON.stringify(bilan,null,1));}}
  finally{try{const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(o=>{ws.onopen=o;});ws.send(JSON.stringify({id:1,method:'Browser.close'}));await dort(1500);}catch(e){}
    tueChrome();console.log('\nFIN → '+path.join(OUT,TAG+'.json'));}
})().catch(e=>{console.error(e);tueChrome();process.exit(1);});
