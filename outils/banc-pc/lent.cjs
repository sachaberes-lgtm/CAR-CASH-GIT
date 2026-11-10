/* BANC DES ORDIS LENTS (2026-11-10, Sacha : « pas de latence peu importe l'ordi, ça doit s'adapter à chaque ordi »)
   Le jeu dans la page-cadre de l'ordi, sur un PC SIMULÉ : processeur ralenti (--cpux=4 : CDP Emulation.setCPUThrottlingRate) et/ou
   SANS carte graphique (--gpu=swiftshader : le rendu logiciel de Chrome, le pire des cas, limité par les pixels).
   Il lance une course au pilote auto et relève, par fenêtre de 5 s : la durée des images d'écran (médiane, p95, part d'images > 25 ms et > 40 ms),
   le cran de l'échelle QL, la résolution, la cadence, la classe du poste (dbgPoste).
     node outils/banc-pc/serveur.cjs "VERSION PRINCIPALE" 8131
     node outils/banc-pc/lent.cjs http://127.0.0.1:8131/index.html --gpu=swiftshader --cpux=1 --duree=60 --tag=sw
   Options : --w=1920 --h=1080 --dsf=1 --port=9451 --q=params --profil=nom (un profil Chrome par nom : deux bancs peuvent tourner ensemble avec deux ports)
             --menu=10 : mesure aussi le menu pendant N s avant la course. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARGS=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const opt={};for(const a of process.argv.slice(2)){const m=/^([a-z0-9]+)=(.*)$/.exec(a.replace(/^--/,''));if(a.startsWith('--')&&m)opt[m[1]]=m[2];}
const URL0=ARGS[0]||'http://127.0.0.1:8131/index.html';
const W=+(opt.w||1920),H=+(opt.h||1080),DUREE=+(opt.duree||60),PORT=+(opt.port||9451),TAG=opt.tag||'lent',GPU=opt.gpu||'d3d11',CPUX=+(opt.cpux||1),MENU=+(opt.menu||0);
const URLF=URL0+(URL0.indexOf('?')<0?'?':'&')+'intro=ancien&attente=0'+(opt.q?'&'+opt.q:'');
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const HERE=process.env.CC_BANC_DIR||path.join(os.tmpdir(),'cc-banc-pc'),UDD=path.join(HERE,'profil-lent-'+(opt.profil||GPU));
fs.mkdirSync(UDD,{recursive:true});fs.mkdirSync(path.join(HERE,'resultats'),{recursive:true});
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){
  const a=['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+UDD,'--no-first-run','--no-default-browser-check','--window-size='+W+','+H,'--force-device-scale-factor='+(opt.dsf||'1'),
    '--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--ignore-gpu-blocklist','--disable-background-timer-throttling','--disable-renderer-backgrounding','--mute-audio','--hide-scrollbars'];
  if(GPU==='swiftshader')a.push('--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader');else a.push('--use-angle='+GPU,'--enable-gpu-rasterization');
  a.push('about:blank');chrome=spawn(CHROME,a,{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+PORT+'/json/version');return;}catch(e){await dort(200);}}
  throw new Error('Chrome ne répond pas sur '+PORT);}
function tueChrome(){if(!chrome)return;try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{
  constructor(ws){this.ws=ws;this.n=0;this.att={};this.erreurs=[];
    ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.erreurs.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n')[0]);}
      else if(r.method==='Runtime.consoleAPICalled'&&r.params.type==='error'){this.erreurs.push(r.params.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ').slice(0,240));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||60000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  evF(expr,timeout){return this.ev("(function(){var f=document.getElementById('colonne');var w=f?f.contentWindow:window;return w.eval("+JSON.stringify(expr)+");})()",timeout);}
  async attendF(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.evF('!!('+expr+')'))return true;}catch(e){}await dort(pas||250);}return false;}
}
const SEME="try{var k='cashcarSave',d={};try{d=JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){}if(!d.v){d={v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3}};}d.sfx=false;d.mus=false;d.vox=false;d.tuto=1;localStorage.setItem(k,JSON.stringify(d));}catch(e){}";
/* dans le jeu : un rAF à part note chaque intervalle d'écran ; `__frLit()` rend la fenêtre et la vide */
/* les images DU JEU (pas celles de l'écran : calé sur 30, le rAF bat toujours à 60) : chaque rendu de la scène est daté (scene.onBeforeRender, chaîné ; deux rendus à moins de 4 ms = la même image) */
const SONDE="(function(){if(window.__fr)return 1;window.__fr=[];var d=0,S=dbgScene().scene,ob=S.onBeforeRender;S.onBeforeRender=function(a,b,c,e){var n=performance.now();if(n-d>4){if(d)window.__fr.push(n-d);d=n;}return ob.call(this,a,b,c,e);};"+
  "window.__frLit=function(){var a=window.__fr.slice().sort(function(x,y){return x-y;});window.__fr.length=0;var n=a.length;if(!n)return null;var s=0,l25=0,l40=0,l100=0;for(var i=0;i<n;i++){s+=a[i];if(a[i]>25)l25++;if(a[i]>40)l40++;if(a[i]>100)l100++;}"+
  "function t(f){try{return f();}catch(e){return null;}}"+
  "return {n:n,ips:Math.round(n*1000/s),p50:+a[n>>1].toFixed(1),p95:+a[Math.min(n-1,(n*.95)|0)].toFixed(1),max:Math.round(a[n-1]),l25:Math.round(l25*100/n),l40:Math.round(l40*100/n),l100:l100,"+
  "nette:t(function(){var x=dbgNette();return {cran:x.cran,dpr:x.curDPR,cap:x.cap,px:x.px};}),cad:t(function(){var c=dbgCadence();return {on:c.on,w:c.w};}),poste:t(function(){return window.dbgPoste?dbgPoste():null;}),"+
  "cout:t(function(){var c=dbgCout();return c&&c.image?{image:c.image,cpu:c.cpu,gpu:c.gpu}:null;}),st:t(function(){var s=dbgState();return {started:s.started,gameOver:s.gameOver};})};};return 1;})()";
function ligne(nom,f){if(!f)return nom+' : rien';const n=f.nette||{},p=f.poste;
  return nom.padEnd(16)+String(f.ips).padStart(3)+' i/s · médiane '+String(f.p50).padStart(5)+' · p95 '+String(f.p95).padStart(5)+' · max '+String(f.max).padStart(4)+' ms · >25 ms '+String(f.l25).padStart(3)+' % · >40 ms '+String(f.l40).padStart(3)+' % · cran '+n.cran+' · dpr '+n.dpr+'/'+n.cap+' ('+(n.px/1e6).toFixed(2)+' Mpx)'+(f.cad&&f.cad.on?' · CALÉ 30':'')+(f.cad?' · travail '+f.cad.w+' ms':'')+(p?' · régime '+p.r+' juge '+JSON.stringify(p.juge):'');}
function resumeCpu(prof){const self={},byId={};for(const n of prof.nodes)byId[n.id]=n;const dt=prof.timeDeltas||[];const cnt={};
  for(let i=0;i<prof.samples.length;i++){cnt[prof.samples[i]]=(cnt[prof.samples[i]]||0)+(dt[i]||0);}
  for(const id in cnt){const n=byId[id];if(!n)continue;const cf=n.callFrame,u=(cf.url||'').split('/').pop().split('?')[0];const k=(cf.functionName||'(anonyme)')+' '+u+':'+(cf.lineNumber+1);self[k]=(self[k]||0)+cnt[id];}
  const tot=Object.values(self).reduce((a,b)=>a+b,0);
  return {totalMs:Math.round(tot/1000),top:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,45).map(([k,v])=>[Math.round(v/1000),k])};}
(async function(){
  const R={url:URLF,w:W,h:H,gpu:GPU,cpux:CPUX,tag:TAG,fen:[]};
  await lanceChrome();
  const t=await putJson('http://127.0.0.1:'+PORT+'/json/new?about:blank');
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:SEME+(opt.oubli==='1'?"try{if(!sessionStorage.ccOubli){sessionStorage.ccOubli=1;localStorage.removeItem('cashcarPoste');}}catch(e){}":'')}); /* --oubli=1 : ce que le jeu a appris sur ce poste est effacé au 1er chargement (classement de 1re visite) */
  if(CPUX>1)await p.call('Emulation.setCPUThrottlingRate',{rate:CPUX}); /* AVANT le chargement : le classement du poste (banc du processeur) voit le processeur lent */
  const t0=Date.now();await p.call('Page.navigate',{url:URLF});
  await dort(400);const ok=await p.attendF("window.__gameReady&&typeof window.dbgScene==='function'&&typeof window.dbgPalier==='function'&&location.href.indexOf('about:')!==0",300000,300); /* dans le JEU (evF vise la colonne) : prêt ET crochets posés */R.pret_ms=Date.now()-t0;
  console.log('['+TAG+'] gpu='+GPU+' cpu÷'+CPUX+' '+W+'×'+H+' · prêt en '+R.pret_ms+' ms ('+(ok?'ok':'JAMAIS PRÊT')+')');
  if(p.erreurs.length)console.log('   erreurs au chargement : '+[...new Set(p.erreurs)].slice(0,5).join(' | '));
  if(!ok){console.log('erreurs : '+p.erreurs.slice(-5).join(' | '));tueChrome();process.exit(2);}
  R.palier=await p.evF("(function(){try{var q=dbgPalier();return q.nom+' ('+q.src+') '+q.puce;}catch(e){return '?';}})()");console.log('   '+R.palier);try{R.poste=await p.evF('window.dbgPoste?dbgPoste():null');if(R.poste)console.log('   POSTE : '+JSON.stringify(R.poste));}catch(e){}
  await dort(3000);await p.evF(SONDE);
  if(MENU>0){await p.evF('__frLit()');for(let s=5;s<=MENU;s+=5){await dort(5000);const f=await p.evF('__frLit()');R.fen.push({nom:'menu '+s,f:f});console.log(ligne('menu '+s+' s',f));}}
  await p.evF("(function(){try{var sp=document.getElementById('splash');if(sp){sp.click();setTimeout(function(){try{sp.remove();}catch(e){}},900);}}catch(e){}})()");await dort(1200);
  await p.evF("(function(){try{var b=document.querySelector('#mHome [data-m=play]');if(b)b.click();}catch(e){}})()");await dort(2500);
  const dj=await p.evF("(function(){try{return window.dbgJouer?JSON.stringify(dbgJouer()):'';}catch(e){return 'erreur '+e.message;}})()");
  if(!dj)await p.evF("(function(){try{var b=document.getElementById('gPlayMain');if(b)b.click();}catch(e){}})()");
  const dep=await p.attendF('dbgState().started&&!dbgState().gameOver',90000,300);
  if(!dep){console.log('course jamais partie · '+String(dj).slice(0,200)+' · erreurs : '+p.erreurs.slice(-5).join(' | '));tueChrome();process.exit(3);}
  await p.evF('try{dbgAuto(true,0)}catch(e){}');await p.evF('try{dbgCout(1)}catch(e){}');await p.evF('__frLit()');
  if(opt.cpuprof==='1'){await dort(8000);await p.call('Profiler.enable');await p.call('Profiler.setSamplingInterval',{interval:500});await p.call('Profiler.start');await dort(12000);const pr=await p.call('Profiler.stop');const c9=resumeCpu(pr.profile);
    console.log('PROFIL CPU de la course ('+c9.totalMs+' ms sur 12 s) :');for(const [ms,k] of c9.top)console.log('   '+String(ms).padStart(6)+' ms  '+k);await p.evF('__frLit()');}
  for(let s=5;s<=DUREE;s+=5){await dort(5000);let f=null;try{f=await p.evF('__frLit()',20000);}catch(e){console.log('   (lecture ratée : '+e.message.slice(0,80)+')');continue;}
    R.fen.push({nom:'course '+s,f:f});console.log(ligne('course '+s+' s',f));
    if(opt.cout==='1'&&s===15){try{console.log('   COÛT : '+JSON.stringify(await p.evF('dbgCout()')));}catch(e){}}
    if(f&&f.st&&f.st.gameOver){console.log('   (morte : relance)');await p.evF("(function(){try{var b=document.querySelector('#mDead.on [data-m=\"replay\"]')||document.querySelector('[data-m=\"replay\"]');if(b)b.click();}catch(e){}})()");await dort(3000);await p.evF('try{dbgAuto(true,0)}catch(e){}');await p.evF('__frLit()');}
    else try{await p.evF('try{dbgAuto(true,0)}catch(e){}');}catch(e){}}
  /* le bilan : la 2e moitié de la course (le régime une fois adapté) */
  const C=R.fen.filter(x=>/^course/.test(x.nom)&&x.f),M=C.slice(C.length>>1);
  if(M.length){const moy=k=>Math.round(M.reduce((s,x)=>s+x.f[k],0)/M.length*10)/10;R.bilan={ips:moy('ips'),p50:moy('p50'),p95:moy('p95'),l25:moy('l25'),l40:moy('l40')};
    console.log('BILAN ['+TAG+'] 2e moitié : '+R.bilan.ips+' i/s · médiane '+R.bilan.p50+' ms · p95 '+R.bilan.p95+' ms · images > 25 ms '+R.bilan.l25+' % · > 40 ms '+R.bilan.l40+' %');}
  try{const pf=await p.evF('window.dbgPoste?dbgPoste():null');if(pf){R.posteFin=pf;console.log('   POSTE à la fin : juge '+JSON.stringify(pf.juge)+' · appris '+JSON.stringify(pf.appris));}}catch(e){}
  if(p.erreurs.length)console.log('erreurs : '+[...new Set(p.erreurs)].slice(0,6).join(' | '));R.erreurs=[...new Set(p.erreurs)];
  fs.writeFileSync(path.join(HERE,'resultats',TAG+'.json'),JSON.stringify(R,null,1));
  try{await Promise.race([p.call('Browser.close'),dort(4000)]);await dort(1500);}catch(e){} /* fermeture PROPRE : tué net, Chrome perd les dernières écritures de localStorage (le régime appris) */
  tueChrome();
})().catch(e=>{console.error('ÉCHEC',e);tueChrome();process.exit(1);});
