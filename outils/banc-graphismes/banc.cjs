/* ===== LE BANC DES GRAPHISMES (2026-11-12, Sacha : « améliorer les graphismes au global pour la version Vercel sans que ça coûte en performance ») =====
   Une Chrome headless (vrai GPU, muette), chaque couple map:météo sur UNE GRAINE FIXE, régime du poste forcé au MAXIMUM (`?poste=max`) et cran de
   qualité figé (dbgQual(0)) : la même image d'une passe à l'autre, pour comparer AVANT / APRÈS à l'œil ET au chronomètre.
   Par couple :
     · photos (HUD et DOM masqués) : `jeu` (la vue du joueur, en course, vers s = --pause), `caisse` (la caisse de trois quarts, en pause),
       `decorA` / `decorB` (caméra libre posée sur la route à deux abscisses FIXES : le même cadre au pixel près d'une passe à l'autre) ;
     · mesures : appels de dessin et triangles d'une image (dbgAppels), géométries / textures / programmes (renderer.info), tas JS,
       images de la course (moyenne, médiane, 99e centile, à 60 Hz) et surtout LE COÛT DE L'IMAGE FIGÉE : la vue decorA re-rendue N fois,
       chaque rendu suivi d'une lecture d'un pixel (la carte graphique doit avoir fini) → médiane en ms. C'est la mesure sensible :
       elle ne dépend ni de la route ni du pilote, et elle voit un shader plus cher que la synchro verticale cacherait.
   node outils/banc-maps/serveur.cjs 8231            (dans un terminal à part : sert le dépôt)
   node outils/banc-graphismes/banc.cjs --out=<dossier> --cartes=nuages:matin,jade:soir [--graine=7] [--tel=1] [--q=a=b&c=d] [--pause=320]
        [--port=8231] [--cdp=9431] [--profil=graph] [--n=120] [--sansmesure=1] [--bilan=nom] [--jsfile=essai.js]
   Sortie : <out>/<carte>-<meteo>[-tel]-{jeu,caisse,decorA,decorB}.png et <out>/bilan[-tel].json (une entrée par couple). */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8231),CDP=+(opt.cdp||9431),TEL=opt.tel==='1',GRAINE=opt.graine||'7',PAUSE=+(opt.pause||320),N=+(opt.n||120);
const TOUTES='nuages:matin,nuages:midi,nuages:soir,nuages:nuit,nuages:pluie,nuages:orage,ville:orage:violet,ville:orage:vert,ville:orage:jaune,jade:matin,jade:midi,jade:soir,jade:nuit,jade:pluie,jade:orage,crypto:matin,crypto:midi,crypto:soir,espace:matin,grotte:matin,grotte:midi,grotte:soir,grotte:nuit,grotte:glace,canyon:matin,canyon:soir,canyon:nuit';
const CARTES=(opt.cartes&&opt.cartes!=='toutes'?opt.cartes:TOUTES).split(',');
const OUT=path.resolve(opt.out||path.join(__dirname,'sorties'));fs.mkdirSync(OUT,{recursive:true});
const dort=ms=>new Promise(r=>setTimeout(r,ms));const log=function(){console.log.apply(console,arguments);};
const getJson=u=>new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));
const putJson=u=>new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});
let chrome=null;
async function lanceChrome(){const udd=path.join(os.tmpdir(),'cc-banc-'+(opt.profil||'graph'));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1600,900','--mute-audio',
    '--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}throw new Error('Chrome ne répond pas sur '+CDP);}
function tueChrome(){if(!chrome)return;try{chrome.kill();}catch(e){}try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.err=[];
  ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
    else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.err.push('EXCEPTION '+String((d.exception&&d.exception.description)||d.text).split('\n')[0].slice(0,240));}
    else if(r.method==='Runtime.consoleAPICalled'&&r.params.type==='error'){this.err.push('console: '+r.params.args.map(a=>a.value||a.description||'').join(' ').slice(0,240));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(e,t){const r=await this.call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true,timeout:t||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(e,ms,pas){const t0=Date.now();while(Date.now()-t0<ms){try{if(await this.ev('!!('+e+')'))return true;}catch(x){}await dort(pas||250);}return false;}
  async photo(f){const r=await this.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;}}
/* --- dans la page --- */
const MASQUE=String(function(){ /* tout le DOM sauf la toile 3D : on remonte de la toile au body et on cache les frères */
  const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');f.style.setProperty('opacity','0','important');}e=p;}return 1;});
const SONDE=String(function(){ /* les images DU JEU : chaque rendu de la scène est daté (deux rendus à moins de 4 ms = la même image) */
  if(window.__fr)return 1;window.__fr=[];let d=0;const S=dbgScene().scene,ob=S.onBeforeRender;S.onBeforeRender=function(a,b,c,e){const n=performance.now();if(n-d>4){if(d)window.__fr.push(n-d);d=n;}return ob.call(this,a,b,c,e);};return 1;});
const CADRES=String(function(sA,sB){const R=dbgRoute();const f=function(s,ar,ht,av){const i=Math.max(1,Math.min(R.NP-2,Math.round(s/R.L*(R.NP-1))));const p=R.pts[i],t=R.T[i],n=R.Nn[i];
    return {p:[p.x-t.x*ar+n.x*ht,p.y-t.y*ar+n.y*ht,p.z-t.z*ar+n.z*ht],c:[p.x+t.x*av,p.y+t.y*av+n.y*2,p.z+t.z*av],fov:62};};
  const i=Math.max(1,Math.min(R.NP-2,Math.round((R.s||0)/R.L*(R.NP-1)))),t=R.T[i],b=R.B[i];
  return {A:f(sA,40,14,80),B:f(sB,26,6,90),L:Math.round(R.L),s:Math.round(R.s||0),ang:Math.atan2(t.x*.8+b.x*.62,t.z*.8+b.z*.62)};});
const FIGEE=String(function(o,N){const R=dbgScene().rdr,gl=R.getContext(),px=new Uint8Array(4),t=[];
  for(let i=0;i<12;i++){dbgAudit('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}
  for(let i=0;i<N;i++){const t0=performance.now();dbgAudit('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);t.push(performance.now()-t0);}
  t.sort(function(a,b){return a-b;});const m=t.reduce(function(a,b){return a+b;},0)/N;return {med:+t[N>>1].toFixed(2),moy:+m.toFixed(2),p10:+t[Math.floor(N*.1)].toFixed(2),p90:+t[Math.floor(N*.9)].toFixed(2)};});
const RELEVE=String(function(){const R=dbgScene().rdr,o={};try{const a=dbgAppels(0);o.appels=a.appels;o.tri=a.triangles;}catch(e){o.appels=String(e);}
  try{o.geo=R.info.memory.geometries;o.tex=R.info.memory.textures;o.prog=R.info.programs?R.info.programs.length:null;}catch(e){}
  try{o.tasMo=Math.round(performance.memory.usedJSHeapSize/1048576);}catch(e){}
  try{const q=dbgQual();o.cran=q.k;o.dpr=q.dpr;o.px=q.px;o.ombre=q.ombre;o.bloom=q.bloom;}catch(e){}
  try{const p=dbgPoste();o.poste=p&&(p.regime!=null?p.regime:p.r!=null?p.r:JSON.stringify(p).slice(0,80));}catch(e){}
  try{const c=R.domElement;o.toile=c.width+'x'+c.height;}catch(e){}return o;});
function stats(a){if(!a||!a.length)return null;const t=a.slice().sort((x,y)=>x-y),n=t.length;return {n:n,moy:+(t.reduce((x,y)=>x+y,0)/n).toFixed(2),med:+t[n>>1].toFixed(2),p99:+t[Math.min(n-1,Math.floor(n*.99))].toFixed(2),max:+t[n-1].toFixed(1)};}
async function couple(cm){const [c,m,teinte]=cm.split(':');const tag=c+(m?'-'+m:'')+(teinte?'-'+teinte:'')+(TEL?'-tel':'');const t0=Date.now();const r={tag:tag};
  const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((o,k)=>{ws.onopen=o;ws.onerror=k;});
  const p=new Page(ws);await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  if(TEL){await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  else await p.call('Emulation.setDeviceMetricsOverride',{width:1600,height:900,deviceScaleFactor:1,mobile:false});
  /* la sauvegarde du banc : auto-école faite, plaque posée — et MUETTE (sfx, mus, vox) : jamais de son dans un navigateur de test */
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.clear();localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  const url='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&carte='+c+(m?'&meteo='+m:'')+(teinte?'&teinte='+teinte:'')+'&pistegraine='+GRAINE+(TEL?'&tel=1':'&colonne=0&poste=max')+(opt.q?'&'+opt.q:'');
  try{await p.call('Page.navigate',{url});if(!await p.attend('window.__gameReady',180000))throw new Error('pas prêt');
    for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(400);}
    await p.attend("document.body.classList.contains('titreCiel')",60000);
    for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(500);}
    let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
    if(!st)throw new Error('course pas lancée');
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");if(!TEL)await p.ev("(function(){try{dbgQual(0);}catch(e){}})()");
    await p.ev('('+MASQUE+')()');await p.ev('('+SONDE+')()');
    if(opt.jsfile)r.js=await p.ev(fs.readFileSync(opt.jsfile,'utf8')); /* --jsfile=chemin : une expression évaluée au départ de la course (un réglage à chaud par les crochets dbg*) */
    /* la course : jusqu'à l'abscisse de la pause (ou la mort, ou 30 s) */
    const tc=Date.now();let etat=null;while(Date.now()-tc<30000){etat=await p.ev('(function(){const s=dbgState(),R=dbgRoute();return {go:s.gameOver,s:Math.round(R.s||0)};})()');if(etat.go||etat.s>=PAUSE)break;await dort(60);}
    r.s=etat.s;r.mort=!!etat.go;
    r.jeu=path.basename(await p.photo(path.join(OUT,tag+'-jeu.png')));
    r.images=stats(await p.ev('window.__fr.slice(30)'));
    const C=await p.ev('('+CADRES+')('+(PAUSE+60)+','+(PAUSE+480)+')');r.L=C.L;
    await p.ev('dbgView('+C.ang+',6.4,1.9)');await p.ev("(function(){try{dbgFlou({s:0});}catch(e){}})()"); /* en pause la boucle rend encore, avec le flou de vitesse resté de la course : on le coupe (dbgFlou) pour des photos nettes */await dort(350);await p.ev('dbgView('+C.ang+',6.4,1.9)');await dort(250);r.caisse=path.basename(await p.photo(path.join(OUT,tag+'-caisse.png')));
    for(const k of ['A','B']){const o=JSON.stringify(C[k]);await p.ev("dbgAudit('vue',"+o+")");await dort(450);await p.ev("dbgAudit('vue',"+o+")");await dort(250);r['decor'+k]=path.basename(await p.photo(path.join(OUT,tag+'-decor'+k+'.png')));}
    if(opt.sansmesure!=='1'){r.figee=await p.ev('('+FIGEE+')('+JSON.stringify(C.A)+','+N+')',180000);r.figee2=await p.ev('('+FIGEE+')('+JSON.stringify(C.A)+','+N+')',180000);}
    await p.ev("dbgAudit('vue',"+JSON.stringify(C.A)+")");r.releve=await p.ev('('+RELEVE+')()');
  }catch(e){r.erreur=String(e.message||e);}
  r.err=p.err.slice(0,6);r.dur=Math.round((Date.now()-t0)/1000);log(JSON.stringify(r));
  try{ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+t.id);}catch(e){}return r;}
(async function(){const bilan=[];await lanceChrome();
  try{for(const cm of CARTES){bilan.push(await couple(cm));fs.writeFileSync(path.join(OUT,(opt.bilan||'bilan')+(TEL?'-tel':'')+'.json'),JSON.stringify(bilan,null,1));}}
  finally{tueChrome();log('FIN');}
})().catch(e=>{console.error(e);tueChrome();process.exit(1);});
