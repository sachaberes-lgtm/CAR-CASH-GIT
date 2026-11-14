/* ===== LE BANC DES NUAGES : pops, poufs, traversées (2026-11-14, Sacha : « nuage a besoin de debugging sur les nuages et d'une meilleure animation quand on leur passe à travers ») =====
   Chrome HEADLESS piloté par CDP, toujours muet. Le serveur-sonde doit tourner :  node outils/banc-nuages/serveur-sonde.cjs 8340 [racine]
   node outils/banc-nuages/traverse.cjs --graines=1,2 --meteo=midi [--tel=1] [--dur=70] [--port=8340] [--cdp=9540] [--profil=pro-nuages] [--out=dossier] [--q=a=b&c=d]
        [--vise=1 (défaut : le pilote vise chaque mouton / nappe)] [--rafale=1 (défaut : photos en rafale autour de chaque nuage traversé)] [--nit=0|1] [--pops=3 (photos avant/après des N pires pops)]
   Par graine : l'audit statique (__NUaudit), la course au pilote auto avec la sonde image par image (__NUS), des relevés d'appels de dessin (dbgAppels) toutes les 4 s,
   l'image figée chronométrée à la fin (dbgTemps), les photos. Sortie : une ligne de bilan par graine + <out>/traverse-<meteo>[-tel]-g<graine>.json. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8340),CDP=+(opt.cdp||9540),METEO=opt.meteo||'midi',TEL=opt.tel==='1',DUR=+(opt.dur||70),CARTE=opt.carte||'nuages';
const OUT=path.resolve(opt.out||path.join(__dirname,'sorties'));fs.mkdirSync(OUT,{recursive:true});
const URL0='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html';
const U=function(g){return URL0+'?intro=ancien&attente=0&prebati=0&carte='+CARTE+'&meteo='+METEO+'&pistegraine='+g+(TEL?'&tel=1':'&colonne=0')+(opt.q?'&'+opt.q:'');};
const dort=(ms)=>new Promise(r=>setTimeout(r,ms)),log=function(){console.log.apply(console,arguments);};
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){const udd=path.join(os.tmpdir(),'cc-banc-'+(opt.profil||'pro-nuages')+(TEL?'-tel':''));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,800','--mute-audio','--autoplay-policy=no-user-gesture-required',
    '--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}throw new Error('Chrome ne répond pas sur '+CDP);}
function tueChrome(){if(!chrome)return;try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.erreurs=[];
    ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'&&r.params.type==='error'){this.erreurs.push('CONSOLE '+r.params.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ').slice(0,300));}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.erreurs.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n').slice(0,2).join(' | '));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.ev('!!('+expr+')'))return true;}catch(e){}await dort(pas||250);}return false;}
  async photo(f){const r=await this.call('Page.captureScreenshot',{format:'jpeg',quality:82});fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;}}
async function ouvrePage(){const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);p.id=t.id;await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  if(TEL){await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  else await p.call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  return p;}
async function fermePage(p){try{p.ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+p.id);}catch(e){}}
async function demarre(p,g){await p.call('Page.navigate',{url:U(g)});if(!await p.attend('window.__gameReady',180000,200))throw new Error('__gameReady jamais levé');
  for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
  await p.attend('!window.__introCouvre',60000,200);await dort(800);
  await p.attend("document.body.classList.contains('titreCiel')",60000,250);
  for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
  let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000,250);}
  if(!st)throw new Error('course pas lancée');}
const SONDE=fs.readFileSync(path.join(__dirname,'sonde-page.js'),'utf8');
async function graine(g){const p=await ouvrePage(),R={graine:g,meteo:METEO,tel:TEL},pre='t-'+METEO+(TEL?'-tel':'')+'-g'+g+'-';
  try{await demarre(p,g);await p.ev("dbgAuto(1,0,{nit:"+(opt.nit==='1'?1:0)+"})");
    if(!await p.attend('window.__NU&&window.__NU.COTON.n>0',30000,200))throw new Error('la sonde (__NU) ne vient pas : le serveur est-il serveur-sonde.cjs ?');
    await p.ev("(function(){try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
    log('  sonde :',await p.ev(SONDE));
    R.audit=await p.ev('__NUaudit()',120000);
    /* les nuages à traverser (au ras de la route, marge < 0) : le pilote les vise */
    R.cibles=await p.ev("(function(){const R=dbgRoute(),C=__NU.COTON,ST=__NU.COTON_ST,A=__NUaudit().ras.filter(function(x){return x.marge<0;}),ds=R.L/(R.NP-1);return A.map(function(a){const o=a.j*ST,i=Math.max(0,Math.min(R.NP-1,Math.round(a.s/ds))),p=R.pts[i],B=R.B[i];return {j:a.j,s:a.s,r:a.r,g:a.g,lat:+((C.I[o]-p.x)*B.x+(C.I[o+1]-p.y)*0+(C.I[o+2]-p.z)*B.z).toFixed(1)};});})()");
    log('  cibles :',JSON.stringify(R.cibles));
    const t0=Date.now();let ci=0,der=0,nPh=0;R.appels=[];R.photos=[];let visee=null;
    while(Date.now()-t0<DUR*1000){const e=await p.ev("(function(){const s=dbgState(),R=dbgRoute();return {go:s.gameOver,mode:s.mode,s:Math.round(R.s||0),L:R.L,lat:+R.lat.toFixed(1),carte:R.niveau&&R.niveau.carte||R.niveau&&R.niveau.id};})()");
      if(e.go){R.mort={s:e.s,cause:await p.ev("dbgRoute().cause")};break;}if(e.s>e.L-120)break;
      while(ci<R.cibles.length&&e.s>R.cibles[ci].s+60)ci++;const c=R.cibles[ci];
      if(c&&opt.vise!=='0'&&visee!==c.j&&e.s>c.s-400){visee=c.j;await p.ev("dbgAuto(1,"+Math.max(-12,Math.min(12,c.lat))+",{nit:"+(opt.nit==='1'?1:0)+"})");}
      if(c&&opt.rafale!=='0'&&e.s>c.s-c.r*2.2-110&&e.s<c.s+c.r*1.6+70){const f=path.join(OUT,pre+'raf-j'+c.j+'-'+String(nPh++).padStart(3,'0')+'-s'+e.s+'.jpg');await p.photo(f);R.photos.push(f);continue;}
      if(Date.now()-der>4000){der=Date.now();try{const a=await p.ev("(function(){const a=dbgAppels(80),o={appels:a.appels,tri:a.triangles,coton:0,cotonTri:0};for(const l of a.liste){if(/nuage|coton|vitrail|fant/i.test(l[2])){o.coton+=l[0];o.cotonTri+=parseInt(l[1]);}}o.top=a.liste.slice(0,6);return o;})()");a.s=e.s;R.appels.push(a);}catch(x){}
        const f=path.join(OUT,pre+'course-'+String(nPh++).padStart(3,'0')+'-s'+e.s+'.jpg');await p.photo(f);R.photos.push(f);}
      await dort(40);}
    R.sonde=await p.ev('__NUSfin()');
    R.fige=await p.ev("(function(){if(!dbgState().paused&&!dbgState().gameOver){try{dbgAudit('vue',{p:dbgScene().cam.position.toArray(),c:(function(){const c=dbgScene().cam,v=new THREE.Vector3();c.getWorldDirection(v);return [c.position.x+v.x*100,c.position.y+v.y*100,c.position.z+v.z*100];})(),fov:dbgScene().cam.fov});}catch(e){}}const r=[];for(let k=0;k<5;k++)r.push(dbgTemps(40));r.sort(function(a,b){return a-b;});const a=dbgAppels(80);return {ms:r[2],min:r[0],appels:a.appels,tri:a.triangles,coton:__NU.COTON.tri,top:a.liste.slice(0,10)};})()",120000);
    /* les pires pops en photo : la caméra remise où elle était (jeu en pause), le nuage visé au centre puis la vue d'origine */
    const NP=+(opt.pops==null?3:opt.pops),faits={};let k=0;
    R.preuves=[];
    for(const q of R.sonde.pops){if(k>=NP)break;if(faits[q.j])continue;faits[q.j]=1;
      const v=await p.ev("__NUpopVue("+q.j+","+JSON.stringify(q.cam)+","+q.fov+")");if(!v)continue;
      /* A : la vue telle que le jeu la rend (le nuage est refusé par le tri de champ) · B : LA MÊME vue, le tri de champ neutralisé (la hauteur I[o+7] de chaque nuage, qui ne sert qu'au tri, gonflée ×6 le temps de la photo) : ce qui apparaît en B manquait à l'écran */
      await p.ev("dbgAudit('vue',{p:"+JSON.stringify(q.cam)+",c:"+JSON.stringify(v.A.c)+",fov:"+q.fov+"})");await dort(700);
      {const f=path.join(OUT,pre+'pop'+k+'-j'+q.j+'-A-jeu.jpg');await p.photo(f);R.photos.push(f);v.A.dessine=await p.ev("__NUdessine("+q.j+")");v.A.nDessines=await p.ev("(function(){let n=0;for(let j=0;j<__NU.COTON.n;j++)if(__NUdessine(j))n++;return n;})()");}
      await p.ev("(function(){const C=__NU.COTON,ST=__NU.COTON_ST;window.__NUh=[];for(let j=0;j<C.n;j++){window.__NUh.push(C.I[j*ST+7]);C.I[j*ST+7]*=6;}})()");await dort(700);
      {const f=path.join(OUT,pre+'pop'+k+'-j'+q.j+'-B-sans-tri.jpg');await p.photo(f);R.photos.push(f);v.B.dessine=await p.ev("__NUdessine("+q.j+")");v.B.nDessines=await p.ev("(function(){let n=0;for(let j=0;j<__NU.COTON.n;j++)if(__NUdessine(j))n++;return n;})()");}
      await p.ev("(function(){const C=__NU.COTON,ST=__NU.COTON_ST;for(let j=0;j<C.n;j++)C.I[j*ST+7]=window.__NUh[j];})()");
      R.preuves.push(v);log('  preuve pop :',JSON.stringify({j:v.j,r:v.r,Rtri:v.Rtri,d:v.d,lobes:v.A.lobes,px:v.A.px,Adessine:v.A.dessine,Bdessine:v.B.dessine}));k++;}
    R.erreurs=p.erreurs.slice(0,12);}
  catch(e){R.erreur=String(e&&e.message||e);R.erreurs=p.erreurs.slice(0,8);}
  await fermePage(p);
  fs.writeFileSync(path.join(OUT,'traverse-'+METEO+(TEL?'-tel':'')+'-g'+g+'.json'),JSON.stringify(R,null,1));
  if(R.erreur)log('GRAINE '+g+' · ERREUR DU BANC : '+R.erreur);
  else{const S=R.sonde,A=R.audit;log('GRAINE '+g+' · '+METEO+(TEL?' tel':' ordi')+' · nuages '+A.n+'/'+A.cap+' · tri de champ : rayon vrai/rayon du tri médian '+A.ratioMed+' max '+A.ratioMax+' ('+A.ratioSup12+' nuages > 1,2) · au ras de la route '+A.ras.length+' (traversés '+R.cibles.length+')'+
    ' · POPS '+S.nPop+' ('+S.popsParMin+'/min) · finesse près '+S.lodPres+' ('+S.lodParMin+'/min) · poufs '+S.poufs.length+' · entrées '+S.entrees.length+' sans pouf '+S.sansPouf.length+' doubles '+S.doubles.length+' · tirs GPU '+S.tirs.length+
    ' · dedans '+S.sDedans+' s (sans voile '+S.sDedansSansVoile+') · caméra dedans '+S.sCamDedans+' s (sans voile '+S.sCamDedansSansVoile+') · image '+S.dtMed+' ms p95 '+S.dtP95+' · figée '+R.fige.ms+' ms '+R.fige.appels+' appels '+R.fige.tri+' · erreurs '+JSON.stringify(S.err)+' '+(R.erreurs||[]).length+(R.mort?' · MORT '+JSON.stringify(R.mort):''));}
  return R;}
(async function(){await lanceChrome();try{for(const g of (opt.graines||'1').split(',').map(Number).filter(Boolean))await graine(g);}finally{tueChrome();}})().catch(function(e){console.error(e);tueChrome();process.exit(1);});
