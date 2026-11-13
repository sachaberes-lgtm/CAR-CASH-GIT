/* ===== LE BANC DES GÉANTS DE L'ORBITE (2026-11-13 nuit) — des photos EN ROULANT de chaque géant (la caméra du jeu, la caisse au pilote auto) =====
   Le serveur du dépôt doit tourner : node outils/banc-maps/serveur.cjs <port> <racine>.
   node outils/banc-maps/geants.cjs --cas=matin:lune,midi:comete,soir:anneaux [--tel=1] [--graine=3] [--orb=fronde] --port=8297 --cdp=9497 --profil=geants [--out=dossier]
   Pour chaque cas (la météo : matin = la Terre, midi = Mars, soir = Saturne ; le genre forcé par ?geant=) : charge l'orbite, attend la chauffe du menu (les programmes des géants
   compilés AVANT le départ : dbgGeants('chauffe')), lance la course, pose la caisse 500 m avant le PREMIER géant de ce genre (dbgBord), la laisse rouler (dbgAuto, sans nitro) et
   photographie l'approche, l'entrée, le cœur et la sortie du virage. Chaque photo est mesurée (luminance moyenne, part de pixels noirs : « NOIRE » si l'image est presque noire).
   Relève : les erreurs (console, exceptions, __geantsErr, __orbErr), les programmes compilés pendant la course, la mort (cause, abscisse). Sortie : une ligne par cas, le JSON dans --out. */
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http'),zlib=require('zlib');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8297),CDP=+(opt.cdp||9497),TEL=opt.tel==='1',ORBM=opt.orb||'fronde',GRAINE=+(opt.graine||3);
const OUT=opt.out||path.join(__dirname,'sorties','geants');fs.mkdirSync(OUT,{recursive:true});
const CAS=(opt.cas||'matin:lune').split(',').map(function(c){const q=c.split(':');return {meteo:q[0],k:q[1],graine:+(q[2]||GRAINE)};});
const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
function getJson(u){return new Promise(function(ok,ko){http.get(u,function(r){let b='';r.on('data',function(d){b+=d;});r.on('end',function(){try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko);});}
function putJson(u){return new Promise(function(ok,ko){const r=http.request(u,{method:'PUT'},function(r){let b='';r.on('data',function(d){b+=d;});r.on('end',function(){try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
/* ---- un lecteur PNG minimal (8 bits, RGB/RGBA, non entrelacé : les captures de Chrome) — pour mesurer le noir ---- */
function lumPng(f){const b=fs.readFileSync(f);let o=8,w=0,h=0,ct=0;const idat=[];
  while(o<b.length){const l=b.readUInt32BE(o),t=b.toString('ascii',o+4,o+8),d=b.slice(o+8,o+8+l);if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];}else if(t==='IDAT')idat.push(d);else if(t==='IEND')break;o+=12+l;}
  const bpp=ct===6?4:3,raw=zlib.inflateSync(Buffer.concat(idat)),st=w*bpp,px=Buffer.alloc(w*h*bpp);
  for(let y=0;y<h;y++){const ft=raw[y*(st+1)],src=y*(st+1)+1,dst=y*st;
    for(let x=0;x<st;x++){const a=x>=bpp?px[dst+x-bpp]:0,up=y?px[dst-st+x]:0,c=(x>=bpp&&y)?px[dst-st+x-bpp]:0,v=raw[src+x];let r=v;
      if(ft===1)r=v+a;else if(ft===2)r=v+up;else if(ft===3)r=v+((a+up)>>1);else if(ft===4){const p=a+up-c,pa=Math.abs(p-a),pb=Math.abs(p-up),pc=Math.abs(p-c);r=v+(pa<=pb&&pa<=pc?a:pb<=pc?up:c);}px[dst+x]=r&255;}}
  let s=0,noirs=0,n=0;for(let i=0;i<w*h;i+=3){const L=.2126*px[i*bpp]+.7152*px[i*bpp+1]+.0722*px[i*bpp+2];s+=L;if(L<10)noirs++;n++;}
  const moy=s/n,pn=noirs/n;return {moy:+moy.toFixed(1),noirs:+(100*pn).toFixed(1),noire:moy<14||pn>.85};}
let chrome=null;
async function lanceChrome(){const udd=path.join(os.tmpdir(),'cc-banc-'+(opt.profil||'geants'));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,800','--mute-audio',
    '--autoplay-policy=no-user-gesture-required','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}throw new Error('Chrome ne répond pas');}
function tueChrome(){if(!chrome)return;try{require('child_process').spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.erreurs=[];
    ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'){const p=r.params;if(p.type==='error'||p.type==='warning'){const t=p.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ');if(p.type==='error'||/G[ée]ants/.test(t))this.erreurs.push(p.type.toUpperCase()+' '+t.slice(0,300));}}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.erreurs.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n').slice(0,3).join(' | '));}
      else if(r.method==='Log.entryAdded'){const e=r.params.entry;if(e.level==='error'&&!/favicon|ERR_FILE_NOT_FOUND|404|vibrate/.test(e.text))this.erreurs.push('LOG '+e.text.slice(0,200));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(x,to){const r=await this.call('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true,timeout:to||60000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(x,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.ev('!!('+x+')'))return true;}catch(e){}await dort(pas||250);}return false;}
  async photo(f){const r=await this.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;}}
async function ouvrePage(){const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);p.id=t.id;await p.call('Runtime.enable');await p.call('Log.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  if(TEL){await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  else await p.call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  /* MUET (règle de Sacha : jamais de son dans un navigateur de test) */
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  return p;}
async function fermePage(p){try{p.ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+p.id);}catch(e){}}
async function unCas(c){
  const p=await ouvrePage(),o={cas:c.meteo+':'+c.k,tel:TEL,graine:c.graine,photos:[]};
  const url='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&carte=espace&meteo='+c.meteo+'&pistegraine='+c.graine+'&geant='+c.k+'&orb='+ORBM+(TEL?'&tel=1':'&colonne=0')+(opt.q?'&'+opt.q:'');
  try{await p.call('Page.navigate',{url:url});if(!await p.attend('window.__gameReady',180000,200))throw new Error('__gameReady jamais levé');
    for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
    await p.attend("document.body.classList.contains('titreCiel')",60000,250);
    /* LA CHAUFFE DU MENU : les programmes des géants doivent exister AVANT le départ */
    await p.attend("(function(){const o=dbgGeants('chauffe');for(const k in o)if(!o[k])return false;return true;})()",45000,500);
    o.chauffe=await p.ev("dbgGeants('chauffe')");{let pr=-1;for(let i=0;i<15;i++){const n=await p.ev('dbgScene().rdr.info.programs.length');if(n===pr)break;pr=n;await dort(4000);}} /* la chauffe générale du menu : le compte ne bouge plus pendant 4 s */o.progMenu=await p.ev('dbgScene().rdr.info.programs.length');
    for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
    let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000,250);}
    if(!st)throw new Error('la course ne part pas');
    await p.ev('window.dbgAuto&&dbgAuto(1,0,{nit:0})');
    if(!await p.attend("dbgGeants().liste.length>0",30000,300))throw new Error('aucun géant posé : '+JSON.stringify(await p.ev('dbgGeants()')));
    const G=await p.ev('dbgGeants()');o.geants=G.liste.map(function(g){return g.k+'@'+g.s+'(R'+g.R+'/Rc'+g.Rc+'/r'+g.rad+')';});o.ms=G.ms;o.err=G.err;o.planete=await p.ev("(function(){try{return dbgSaturne().peint;}catch(e){return null;}})()");
    let g=null;if(c.k==='rentree'){const L9=await p.ev('dbgRoute().L');g={k:'rentree',sa:L9-1250,sb:L9-200,s:L9-700,L:L9};} /* LA RENTRÉE : les derniers 1,7 km (la lueur, la planète grossie) */
    else g=G.liste.find(function(x){return x.k===c.k;});if(!g)throw new Error('pas de '+c.k+' sur cette route : '+o.geants.join(' '));
    o.g=g;o.epave=G.epave;o.nappe=G.nappe;
    /* LES PROGRAMMES DES GÉANTS : liés ? le journal du compilateur (la liaison en douce du jeu ne lit pas les erreurs : un shader cassé n'est jamais dessiné, sans un mot) */
    o.progs=await p.ev("(function(){const R=dbgScene().rdr,gl=R.getContext(),o={};dbgScene().scene.traverse(function(m){if(!/^orbite g/.test(m.name||'')&&m.name!=='orbite roches')return;const P=R.properties.get(m.material).currentProgram;"+
      "if(!P||!P.program){o[m.name]='pas de programme';return;}const ok=gl.getProgramParameter(P.program,gl.LINK_STATUS);o[m.name]=ok?'lié':('ÉCHEC '+(gl.getProgramInfoLog(P.program)||'')+' | VS '+(gl.getShaderInfoLog(P.vertexShader)||'')+' | FS '+(gl.getShaderInfoLog(P.fragmentShader)||'')).slice(0,400);});return o;})()");if(c.k==='epave')o.heurt=await p.ev("dbgGeants('heurt')");
    const ar=g.sb-g.sa,cib=c.k==='rentree'?[['loin',g.L-1500],['rentree-1',g.L-1000],['rentree-2',g.L-560],['rentree-3',g.L-230]]:[['approche',g.sa-260],['entree',g.sa+.22*ar],['coeur',g.s],['sortie',g.sb-.18*ar]];
    if(c.k==='anneaux'&&G.nappe)cib.splice(3,0,['percee',G.nappe.sx-25],['dessous',G.nappe.sx+90]);
    if(c.k==='comete')cib.splice(2,0,['queue',g.s-.03*ar]);
    o.progDepart=await p.ev('dbgScene().rdr.info.programs.length');
    for(let essai=0;essai<2;essai++){await p.ev('(function(){if(dbgState().mode!=="drive")return;dbgBord({s:'+Math.round(g.sa-520)+',lat:0,psi:0});})()');await dort(400);
      const s0=await p.ev('Math.round(dbgRoute().s)');if(Math.abs(s0-(g.sa-520))<200)break;await dort(1500);}
    let j=0;const t0=Date.now();
    while(j<cib.length&&Date.now()-t0<45000){const e=await p.ev('(function(){const r=dbgRoute(),q=dbgState();return {s:r.s,go:q.gameOver,mode:q.mode,v:dbgGeants().voile,k:dbgGeants().planeteK,re:dbgGeants().rentree};})()');
      if(e.go){o.mort={s:Math.round(e.s),cause:await p.ev("(function(){try{return dbgRoute().cause;}catch(x){return '?';}})()")};break;}
      if(e.s>=cib[j][1]){const f=path.join(OUT,(TEL?'tel':'pc')+'-'+c.meteo+'-'+c.k+'-'+j+'-'+cib[j][0]+'.png');await p.photo(f);const m=lumPng(f);o.photos.push({n:cib[j][0],s:Math.round(e.s),f:path.basename(f),lum:m.moy,noirs:m.noirs,noire:m.noire,voile:e.v,planeteK:e.k,rentree:e.re,mode:e.mode});j++;continue;}
      await dort(60);}
    o.progFin=await p.ev('dbgScene().rdr.info.programs.length');o.progNeufs=await p.ev('(function(){const P=dbgScene().rdr.info.programs,o=[];for(let i='+o.progMenu+';i<P.length;i++){const k=String(P[i].cacheKey||"");o.push((/erfA|uBd|aCol,aK|uTeinte|vec2 vU;|uD1,uD2/.test(k)?"GÉANTS ":"")+(P[i].name||"?")+" "+k.length);}return o;})()'); /* les programmes nés après le menu (GÉANTS : un des miens) */
    if(opt.vue==='1'){const i9=G.liste.indexOf(g)>=0?G.liste.indexOf(g):G.liste.findIndex(function(x){return x.k===c.k;});await p.ev("dbgGeants('vue',"+i9+")");await dort(300); /* --vue=1 : une image de loin (la course en pause), pour comprendre — pas une photo en roulant */
      const f=path.join(OUT,(TEL?'tel':'pc')+'-'+c.meteo+'-'+c.k+'-vue.png');await p.photo(f);o.vue=path.basename(f);
      if(opt.diag){o.diag=await p.ev(opt.diag);await dort(300);await p.photo(path.join(OUT,(TEL?'tel':'pc')+'-'+c.meteo+'-'+c.k+'-diag.png'));}} /* --diag="expr" : une expression évaluée après la vue de loin, puis une 2e image */o.voileFin=await p.ev('dbgGeants().visibles');
  }catch(e){o.panne=String(e.message||e).slice(0,500);}
  o.erreurs=p.erreurs.slice(0,12);try{o.orbErr=await p.ev("window.__orbErr?String(window.__orbErr):null");o.geantsErr=await p.ev("window.__geantsErr?String(window.__geantsErr):null");}catch(e){}
  await fermePage(p);return o;}
(async function(){await lanceChrome();const R=[];
  try{for(const c of CAS){const o=await unCas(c);R.push(o);
    const ph=o.photos.map(function(q){return q.n+'@'+q.s+' L'+q.lum+(q.noire?' NOIRE':'')+(q.voile>.01?' v'+q.voile:'')+(q.rentree>.01?' r'+q.rentree+' k'+q.planeteK:'');}).join(' · ');
    console.log((TEL?'TEL ':'PC  ')+o.cas+' · '+(o.panne?'PANNE '+o.panne:'')+(o.mort?' MORT '+JSON.stringify(o.mort):'')+' · géants '+(o.geants||[]).join(' ')+' · '+ph+' · prog menu/départ/fin '+o.progMenu+'/'+o.progDepart+'/'+o.progFin+(o.progNeufs&&o.progNeufs.length?' '+JSON.stringify(o.progNeufs):'')+
      ' · chauffe '+(o.chauffe?Object.values(o.chauffe).every(Boolean):'?')+(o.progs?' · programmes '+(Object.values(o.progs).every(function(x){return x==='lié';})?'tous liés':JSON.stringify(o.progs)):'')+' · erreurs '+o.erreurs.length+(o.erreurs.length?' : '+o.erreurs.slice(0,3).join(' || '):'')+(o.geantsErr?' · __geantsErr '+o.geantsErr:'')+(o.orbErr?' · __orbErr '+o.orbErr:''));}}
  finally{tueChrome();fs.writeFileSync(path.join(OUT,'geants-'+(TEL?'tel':'pc')+'.json'),JSON.stringify(R,null,1));}})().catch(function(e){console.error(e);tueChrome();process.exit(1);});
