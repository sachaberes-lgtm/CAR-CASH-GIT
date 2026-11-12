/* ===== LE BANC DES MAPS (2026-11-07, Sacha : « un sous-agent par map pour déboguer la génération aléatoire et avoir un truc parfait ») =====
   Chrome headless piloté par CDP (Node ≥ 22, WebSocket intégré), repris du banc du jury (outils/banc-jury, branche jury/fable).
   Le serveur du dépôt doit tourner : node outils/banc-maps/serveur.cjs <port>  (voir serveur.cjs).

   node outils/banc-maps/banc.cjs <scénario> --carte=dunes --meteo=soir --graines=1,2,3 [options]
   Scénarios :
     gen    : pour chaque graine, charge la map imposée (?carte=&meteo=&pistegraine=), lance la course (dbgJouer), attend que la piste soit
              bâtie, puis AUDITE (route, décor sur la route, décor flottant, erreurs, temps de construction) et écrit une ligne JSON par graine.
              --roule=N : conduit N secondes au pilote auto (dbgAuto) et relève la mort (abscisse, cause). --photos=1 : une capture toutes
              les ~6 s de conduite dans --out. --audit="expr" : une expression JS évaluée dans la page en plus (son résultat dans `perso`).
     vue    : charge UNE graine, puis photographie la route depuis des abscisses (--s=200,800,1500 ; par défaut 6 points répartis) :
              caméra 18 m au-dessus de la route, 40 m en arrière, regard vers l'avant — ou des vues libres --vues="x,y,z:cx,cy,cz;…".
              --haut=1 : vue de dessus (300 m) à chaque abscisse. Captures dans --out (par défaut outils/banc-maps/sorties/<carte>/).
     etat   : charge, saute l'intro, dit ce qui est prêt (diagnostic du banc lui-même).
   Options communes : --port=8201 (serveur) · --cdp=9401 (port de débogage, UNIQUE par agent) · --profil=<nom> (profil Chrome persistant
     dans %TEMP%/cc-banc-<nom> : le cache des programmes GPU fait passer le chargement de ~65 s à ~3 s ; UNIQUE par agent) ·
     --tel=1 (l'édition téléphone, ALLEGE) · --q=a=b&c=d (paramètres d'URL en plus) · --teinte=violet (la ville) · --v=1 (bavard) ·
     --prebati=1 (le pré-bâti du vrai jeu : la map suivante se bâtit d'avance ; coupé par défaut) ·
     --attente=N (secondes laissées à la construction après le départ, défaut 4) · --sans-son : toujours (sfx, mus, vox coupés dans la sauvegarde).
   Sortie : des lignes « GRAINE n … » puis « BILAN … » ; le JSON complet dans --out/gen-<carte>-<meteo>.json. */
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARGS=process.argv.slice(2).filter(function(a){return !a.startsWith('--');});
const scenario=ARGS[0]||'etat';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
if(opt.auditfile&&!opt.audit)opt.audit=fs.readFileSync(opt.auditfile,'utf8'); /* (2026-11-11) --auditfile=chemin : l'expression d'audit lue dans un fichier (une fonction async de plusieurs lignes) */
const PORT=+(opt.port||8201),CDP=+(opt.cdp||9401);
const URL0=opt.url||('http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html');
const CARTE=opt.carte||'nuages',METEO=opt.meteo||'',TEINTE=opt.teinte||'';
const OUT=opt.out||path.join(__dirname,'sorties',CARTE);fs.mkdirSync(OUT,{recursive:true});
const U=function(graine,q){return URL0+'?intro=ancien&attente=0'+(opt.prebati==='1'?'':'&prebati=0')+'&carte='+CARTE+(METEO?'&meteo='+METEO:'')+(TEINTE?'&teinte='+TEINTE:'')+(graine?'&pistegraine='+graine:'')+(opt.tel==='1'?'&tel=1':'&colonne=0')+(opt.q?'&'+opt.q:'')+(q||'');};
const dort=(ms)=>new Promise(r=>setTimeout(r,ms));
const log=function(){console.log.apply(console,arguments);};
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){
  const udd=opt.profil?path.join(os.tmpdir(),'cc-banc-'+opt.profil):fs.mkdtempSync(path.join(os.tmpdir(),'cc-banc-'));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,800',
    '--mute-audio','--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info',(process.platform==='darwin'?'--use-angle=metal':'--use-angle=d3d11'),'--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}
  throw new Error('Chrome ne répond pas sur '+CDP);
}
function tueChrome(){if(!chrome)return;try{chrome.kill();}catch(e){}try{require('child_process').spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{
  constructor(ws){this.ws=ws;this.n=0;this.att={};this.console=[];this.erreurs=[];
    ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'){const p=r.params;const t=p.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ');this.console.push({t:p.type,m:t.slice(0,300)});if(p.type==='error')this.erreurs.push('CONSOLE '+t.slice(0,300));}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;const t=(d.exception&&(d.exception.description||d.exception.value))||d.text;this.erreurs.push('EXCEPTION '+String(t).split('\n').slice(0,2).join(' | '));}
      else if(r.method==='Log.entryAdded'){const e=r.params.entry;if(e.level==='error'&&!/favicon|ERR_FILE_NOT_FOUND|404|navigator.vibrate/.test(e.text))this.erreurs.push('LOG '+e.text.slice(0,200));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.ev('!!('+expr+')'))return true;}catch(e){}await dort(pas||250);}return false;}
  async nav(url){await this.call('Page.navigate',{url});}
  async photo(fichier){const r=await this.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(fichier,Buffer.from(r.data,'base64'));return fichier;}
}
async function ouvrePage(){
  const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);p.id=t.id;
  await p.call('Runtime.enable');await p.call('Log.enable');await p.call('Page.enable');
  await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
  if(opt.tel==='1'){await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  else await p.call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  /* la sauvegarde du banc : auto-école faite, plaque posée, un peu de banque — et MUETTE (sfx, mus, vox) : règle de Sacha, jamais de son dans un navigateur de test */
  await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"+
    "window.__constr=[];document.addEventListener('cc:construction',function(e){window.__constr.push(Object.assign({t:Math.round(performance.now())},e.detail));});"});
  return p;}
async function fermePage(p){try{p.ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+CDP+'/json/close/'+p.id);}catch(e){}}
async function charge(p,url){const t0=Date.now();if(opt.v)log('→',url);await p.nav(url);const ok=await p.attend('window.__gameReady',180000,200);if(!ok)throw new Error('__gameReady jamais levé ('+url+')');return Date.now()-t0;}
async function sauteIntro(p){for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
  await p.attend('!window.__introCouvre',60000,200);await dort(800);}
async function lanceCourse(p){ /* le JOUER du banc : dbgJouer() (le bouton par toucher ne marche pas en headless) */
  /* le ciel du titre n'arrive qu'après la liaison des programmes (en headless UN programme ne se lie jamais : 20 s de garde, voir dbgLier) : on l'attend, sinon classiqueJouer tire la map sans piquer */
  const ciel=await p.attend("document.body.classList.contains('titreCiel')",60000,250);if(!ciel)log('  (le ciel du titre ne vient pas : JOUER en aveugle)');
  for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
  let j=null,st=false;for(let k=0;k<3&&!st;k++){j=await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000,250);}
  return {lance:st,jouer:j};}
/* ---- L'AUDIT dans la page : la route, le décor contre la route, le décor flottant, les erreurs ---- */
const AUDIT=String(function(){
  const R=window.dbgRoute(),S=window.dbgScene().scene,THREE9=window.THREE;const pts=R.pts,NP=R.NP,L=R.L,demi=R.demi;
  const out={niveau:R.niveau&&{id:R.niveau.id,carte:R.niveau.carte,meteo:R.niveau.meteo,teinte:R.niveau.teinte,piste:R.niveau.piste,nm:R.niveau.nm},L:Math.round(L),NP:NP,demi:demi,tord:R.tord,route:{},obstacles:[],flottants:[],erreurs:[],constr:window.__constr||[]};
  /* la route : points invalides, pas, pentes, plancher, croisements */
  {let nan=0,pasMax=0,pasMin=1e9,yMin=1e9,yMax=-1e9,penteMax=0,crois=0;const ds=L/Math.max(1,NP-1);
   for(let i=0;i<NP;i++){const p=pts[i];if(!isFinite(p.x)||!isFinite(p.y)||!isFinite(p.z)){nan++;continue;}if(p.y<yMin)yMin=p.y;if(p.y>yMax)yMax=p.y;
     if(i){const q=pts[i-1],d=p.distanceTo(q);if(d>pasMax)pasMax=d;if(d<pasMin)pasMin=d;const pe=Math.abs(p.y-q.y)/Math.max(.01,d);if(pe>penteMax)penteMax=pe;}}
   /* croisements : deux points éloignés de plus de 120 m d'abscisse et à moins de 2 demi-largeurs l'un de l'autre (vrilles et ponts inclus : à interpréter) */
   const cell={},K=Math.max(30,demi*2);const kc=(p)=>Math.floor(p.x/K)+':'+Math.floor(p.z/K);
   for(let i=0;i<NP;i+=2){const k=kc(pts[i]);(cell[k]||(cell[k]=[])).push(i);}
   const ex=[];for(let i=0;i<NP;i+=2){const p=pts[i];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=cell[(Math.floor(p.x/K)+a)+':'+(Math.floor(p.z/K)+b)];if(!c)continue;for(const j of c){if(Math.abs(i-j)*ds<120||j<=i)continue;const q=pts[j];const dh=Math.hypot(p.x-q.x,p.z-q.z);if(dh<demi*2&&Math.abs(p.y-q.y)<8){crois++;if(ex.length<6)ex.push({s1:Math.round(i*ds),s2:Math.round(j*ds),dh:+dh.toFixed(1),dy:+(p.y-q.y).toFixed(1)});}}}}
   out.route={nan:nan,pasMin:+pasMin.toFixed(2),pasMax:+pasMax.toFixed(2),yMin:Math.round(yMin),yMax:Math.round(yMax),penteMax:+penteMax.toFixed(2),croisements:crois,exCrois:ex,trous:R.trou?Array.from(R.trou).reduce((a,b)=>a+b,0):0};}
  /* le décor contre la route : chaque maillage (instances comprises) dont la boîte englobante coupe le couloir de conduite (demi-largeur + 1 m, de 0,3 à 7 m au-dessus de la route) */
  {const route=new Set(R.trackMeshes||[]);try{const c9=window.dbgScene().car;if(c9)route.add(c9);}catch(e){}const grille={},K=40;const kc=(x,z)=>Math.floor(x/K)+':'+Math.floor(z/K);
   for(let i=0;i<NP;i++){const p=pts[i];if(!isFinite(p.x))continue;const k=kc(p.x,p.z);(grille[k]||(grille[k]=[])).push(i);}
   const ds=L/Math.max(1,NP-1),bx=new THREE9.Box3(),M=new THREE9.Matrix4(),tmp=new THREE9.Box3();
   const teste=function(b,nom,ii){ /* b : boîte monde */ if(!isFinite(b.min.x)||!isFinite(b.max.x))return;const sz=b.max.x-b.min.x+b.max.z-b.min.z;if(sz>4000)return; /* les immensités (ciel, sol, nappe) ne sont pas des obstacles */
     if(Math.max(b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z)<.6)return; /* les miettes (particules, points) */
     let hit=null;const x0=Math.floor(b.min.x/K)-1,x1=Math.floor(b.max.x/K)+1,z0=Math.floor(b.min.z/K)-1,z1=Math.floor(b.max.z/K)+1;if((x1-x0)*(z1-z0)>400)return;
     for(let gx=x0;gx<=x1&&!hit;gx++)for(let gz=z0;gz<=z1&&!hit;gz++){const c=grille[gx+':'+gz];if(!c)continue;for(const i of c){const p=pts[i];if(R.trou&&R.trou[i])continue;
       if(p.x<b.min.x-demi-1||p.x>b.max.x+demi+1||p.z<b.min.z-demi-1||p.z>b.max.z+demi+1)continue;if(b.max.y<p.y+.3||b.min.y>p.y+7)continue;
       /* affiné : la boîte est-elle vraiment dans la bande de la route ? (distance latérale au point le plus proche, sans le long de la tangente) */
       const T9=R.T[i],B9=R.B[i],cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,hx=(b.max.x-b.min.x)/2,hz=(b.max.z-b.min.z)/2,dx=cx-p.x,dz=cz-p.z;const lat=Math.abs(dx*B9.x+dz*B9.z)-(Math.abs(hx*B9.x)+Math.abs(hz*B9.z));
       if(lat<demi){hit={s:Math.round(i*ds),lat:+Math.max(0,lat).toFixed(1),hb:+(b.min.y-p.y).toFixed(1),ht:+(b.max.y-p.y).toFixed(1)};break;}}}
     if(hit&&hit.s<40)return; /* le sas du départ : la caisse, ses traînées, ses flammes (pas des enfants de carGroup) */
     if(hit)out.obstacles.push(Object.assign({nom:nom,i:ii,taille:[Math.round(b.max.x-b.min.x),Math.round(b.max.y-b.min.y),Math.round(b.max.z-b.min.z)]},hit));};
   S.updateMatrixWorld(true);
   S.traverse(function(m){if(!m.isMesh||!m.geometry||!m.visible||route.has(m))return;let a=m;while(a){if(route.has(a))return;a=a.parent;}
     if(!m.geometry.attributes||!m.geometry.attributes.position)return;try{if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();}catch(e){return;}const gb=m.geometry.boundingBox;if(!gb||!isFinite(gb.min.x))return;const nom=(m.name||'')+'/'+(m.parent&&m.parent.name||'')+'/'+(m.material&&m.material.type||'');{let fa=m;while(fa){if(fa.userData&&fa.userData.fruit)return;fa=fa.parent;}}if(/pi[èe]ces|€|¥|₿|fruit|aura/i.test(nom))return; /* ce qu'on ramasse est SUR la route, c'est voulu (les fruits se reconnaissent à userData.fruit, pas au nom) */
     if(m.isInstancedMesh){if(m.count>6000)return;for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.premultiply(m.matrixWorld);bx.copy(gb).applyMatrix4(M);teste(bx,nom,i);}}
     else{bx.copy(gb).applyMatrix4(m.matrixWorld);teste(bx,nom,-1);}});
   out.obstacles.sort((a,b)=>a.s-b.s);out.nObstacles=out.obstacles.length;out.obstacles=out.obstacles.slice(0,80);}
  /* les erreurs : les pannes de construction notées par buildTrack, la boîte noire, la console */
  for(const k of ['__jadeErr','__foretErr','__cyErr','__dnErr','__grotteErr','__banqErr','__orbErr'])if(window[k])out.erreurs.push(k+' : '+(window[k]&&window[k].message||window[k]));
  try{out.boiteNoire=(window.dbgErreurs?dbgErreurs():[]).slice(-10);}catch(e){}
  try{out.audit=window.dbgAudit&&typeof window.dbgAudit==='function'?null:null;}catch(e){}
  try{if(window.dbgNiveau)out.dbgNiveau=dbgNiveau();}catch(e){}
  return out;});
async function audite(p){const r=await p.ev('('+AUDIT+')()',180000);
  if(opt.audit){try{r.perso=await p.ev(opt.audit,+opt.auditms||120000); /* (2026-11-12) --auditms : les sauts de l'orbite jouent longtemps */}catch(e){r.perso='erreur : '+e.message;}}
  try{if(CARTE==='banquise'||CARTE==='dunes')r.dbgAudit=await p.ev("dbgAudit('"+(CARTE==='banquise'?'glacier':'dunes')+"')",120000);}catch(e){r.dbgAudit='erreur : '+e.message;}
  return r;}
function resume(r,g){const o=r.route||{};return 'GRAINE '+g+' · '+(r.niveau?(r.niveau.carte+'/'+r.niveau.meteo+(r.niveau.teinte?'/'+r.niveau.teinte:'')):'?')+' · L '+r.L+' m · NP '+r.NP+' · pas '+o.pasMin+'-'+o.pasMax+' · y '+o.yMin+'..'+o.yMax+' · pente max '+o.penteMax+' · croisements '+o.croisements+' · trous '+o.trous+' · obstacles sur la route '+r.nObstacles+' · erreurs '+(r.erreurs||[]).length+' · constr '+JSON.stringify((r.constr||[]).filter(c=>c.etape==='fin').map(c=>c.ms));}
async function conduit(p,secondes,g){ /* le pilote auto, nitro coupée ; relève la mort et des captures */
  await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");const t0=Date.now();let der=0,n=0;const captures=[];
  while(Date.now()-t0<secondes*1000){const s=await p.ev('(function(){const s=dbgState();const R=dbgRoute();return {go:s.gameOver,mode:s.mode,s:Math.round(R.s||0)};})()');
    if(s.go){const cause=await p.ev("(function(){try{return dbgRoute().cause;}catch(e){return '?';}})()");return {mort:true,s:s.s,cause:cause,dur:+((Date.now()-t0)/1000).toFixed(1),captures:captures};}
    if(opt.photos==='1'&&Date.now()-der>6000){der=Date.now();const f=path.join(OUT,'course-'+CARTE+'-'+(METEO||'x')+'-g'+g+'-'+(n++)+'.png');await p.photo(f);captures.push(f);}
    await dort(500);}
  const fin=await p.ev('(function(){const s=dbgState(),R=dbgRoute();return {s:Math.round(R.s||0),mode:s.mode};})()');return {mort:false,s:fin.s,dur:secondes,captures:captures};}
const SC={
  async depart(){ /* diagnostic du banc : que fait le JOUER, seconde par seconde ? */
    const p=await ouvrePage();const pret=await charge(p,U(+(opt.graines||'1')));await sauteIntro(p);log('prêt',pret,'ms');
    for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
    log('jouer :',JSON.stringify(await p.ev('dbgJouer()')));
    for(let i=0;i<(+opt.n||25);i++){await dort(1000);log('+'+(i+1)+' s',JSON.stringify(await p.ev("(function(){const s=dbgState();let l=null,d=null,h=null;try{l=dbgLier();}catch(e){}try{d=dbgDepart();}catch(e){}try{h=dbgHorloge().images;}catch(e){}return {started:s.started,running:s.running,mode:s.mode,body:document.body.className.slice(0,80),lier:l&&{enCours:l.enCours,dem:l.demarrage},depart:d,images:h,splash:!!document.getElementById('splash')};})()")));}
    log('console :',JSON.stringify(p.console.slice(-10)));log('erreurs :',p.erreurs.slice(0,5));await fermePage(p);},
  async etat(){const p=await ouvrePage();const pret=await charge(p,U(0));await sauteIntro(p);log(JSON.stringify({pret:pret,url:U(0),ready:await p.ev('!!window.__gameReady'),route:await p.ev('typeof dbgRoute'),erreurs:p.erreurs.slice(0,5)}));await fermePage(p);},
  async gen(){
    const graines=(opt.graines||'1,2,3').split(',').map(Number).filter(Boolean);const R=[];
    for(const g of graines){const p=await ouvrePage();let r={graine:g};
      try{const pret=await charge(p,U(g));await sauteIntro(p);const lc=await lanceCourse(p);r.pret=pret;r.lance=lc.lance;
        if(!lc.lance){r.erreur='course PAS lancée · '+JSON.stringify(lc.jouer);log('GRAINE '+g+' · '+r.erreur,p.erreurs.slice(0,3));}
        else{await dort((+opt.attente||4)*1000);Object.assign(r,await audite(p));r.erreurs=(r.erreurs||[]).concat(p.erreurs.slice(0,10));log(resume(r,g));
          if(r.nObstacles)log('   obstacles :',JSON.stringify(r.obstacles.slice(0,12)));
          if(r.erreurs.length)log('   erreurs :',JSON.stringify(r.erreurs.slice(0,6)));
          if(opt.roule){r.course=await conduit(p,+opt.roule,g);log('   course :',JSON.stringify(r.course));}}}
      catch(e){r.erreur=String(e&&e.message||e);log('GRAINE '+g+' · ERREUR DU BANC :',r.erreur,p.erreurs.slice(0,3));}
      r.console=p.console.filter(c=>c.t==='warning'||c.t==='error').slice(0,20);R.push(r);await fermePage(p);}
    const f=path.join(OUT,'gen-'+CARTE+'-'+(METEO||'x')+(opt.tel==='1'?'-tel':'')+'.json');fs.writeFileSync(f,JSON.stringify(R,null,1));
    const ok=R.filter(r=>!r.erreur&&r.route&&!r.route.nan&&!(r.erreurs||[]).length);
    log('BILAN · '+CARTE+'/'+(METEO||'tirée')+(opt.tel==='1'?' (téléphone)':' (ordi)')+' · '+ok.length+'/'+R.length+' graines sans erreur · obstacles : '+R.map(r=>r.nObstacles==null?'?':r.nObstacles).join(',')+' · croisements : '+R.map(r=>r.route?r.route.croisements:'?').join(',')+(opt.roule?' · morts : '+R.map(r=>r.course?(r.course.mort?r.course.cause+'@'+r.course.s:'vivant@'+r.course.s):'?').join(', '):'')+' → '+f);},
  async vue(){
    const g=+(opt.graines||'1').split(',')[0]||1;const p=await ouvrePage();await charge(p,U(g));await sauteIntro(p);const lc=await lanceCourse(p);if(!lc.lance)throw new Error('course pas lancée '+JSON.stringify(lc.jouer));
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})"); /* le pilote auto tient la caisse en vie pendant l'attente (la nuit en ville, elle mourait avant la 1re capture) */
    await dort((+opt.attente||4)*1000);const L=await p.ev('dbgRoute().L');
    const vues=[];
    if(opt.vues){for(const v of opt.vues.split(';')){const [a,b]=v.split(':');vues.push({p:a.split(',').map(Number),c:b.split(',').map(Number),nom:'libre'+vues.length});}}
    else{const S=opt.s?opt.s.split(',').map(Number):[0.04,0.2,0.4,0.6,0.8,0.95].map(f=>Math.round(f*L));
      for(const s of S){const o=await p.ev("(function(s){const R=dbgRoute();const i=Math.max(1,Math.min(R.NP-2,Math.round(s/R.L*(R.NP-1))));const p=R.pts[i],t=R.T[i],n=R.Nn[i];return {p:[p.x-t.x*40+n.x*18,p.y-t.y*40+n.y*18,p.z-t.z*40+n.z*18],c:[p.x+t.x*60,p.y+t.y*60,p.z+t.z*60],haut:[p.x,p.y+300,p.z+.01],bas:[p.x,p.y,p.z]};})("+s+")");
        vues.push({p:o.p,c:o.c,nom:'s'+s});if(opt.haut==='1')vues.push({p:o.haut,c:o.bas,nom:'s'+s+'-dessus',fov:70});}}
    if(opt.hud!=='1')await p.ev("(function(){for(const id of ['hud','garage','mobCtl','bNitro']){const e=document.getElementById(id);if(e)e.style.display='none';}})()"); /* les captures nues : sans le HUD ni les boutons */
    await p.ev("(function(){try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()"); /* (2026-11-08) la série de connexion couvrait les photos d'un profil persistant */
    const faits=[];for(const v of vues){await p.ev("dbgAudit('vue',{p:"+JSON.stringify(v.p)+",c:"+JSON.stringify(v.c)+",fov:"+(v.fov||60)+"})");await dort(400);
      const f=path.join(OUT,'vue-'+CARTE+'-'+(METEO||'x')+'-g'+g+'-'+v.nom+'.png');await p.photo(f);faits.push(f);log('capture :',f);}
    log('VUES · '+faits.length+' captures · erreurs '+p.erreurs.length,p.erreurs.slice(0,4));await fermePage(p);},
  /* ===== LES SCÉNARIOS DES GROTTES (2026-11-10) — la lave, l'eau et les salles en photo, et le coût GPU d'une vue =====
     grottesalles : --specs="lave:80:30:12;stal:80:30:12" (salle:distance:recul:hauteur[:fov], dbgGrotte('salle')) — une capture par vue, --suf=-apres pour un A/B
     grottevues   : --vuesfile=vues.json, [{nom, expr}] : expr rend {p,c,fov,up} (dbgGrotte('vue')) ; {nom,log:1,expr} : seulement écrire le résultat
     grotteperf   : --vuesfile=vues.json : le coût (ms, GPU, readPixels) de chaque vue, médiane de 5 × 30 images — lancer sur deux ports (deux arbres) en alternance : la machine bruite de ±10 % */
  async grotteperf(){
    const g=+(opt.graines||'1').split(',')[0]||1;
    const p=await ouvrePage();await charge(p,U(g));await sauteIntro(p);const lc=await lanceCourse(p);
    if(!lc.lance)throw new Error('course pas lancée '+JSON.stringify(lc.jouer));
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");await dort((+opt.attente||4)*1000);
    await p.attend("dbgGrotte().pret",120000,500);
    await p.ev("(function(){for(const id of ['hud','garage','mobCtl','bNitro','pauseBtn']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
    const fs2=require('fs');const defs=JSON.parse(fs2.readFileSync(opt.vuesfile,'utf8'));const res={};
    for(const v of defs){const o=await p.ev(v.expr,60000);
      const ms=await p.ev("(function(o){let best=null,gl=null;for(const c of document.querySelectorAll('canvas')){let x=null;try{x=c.getContext('webgl2');}catch(e){}if(x&&(!best||c.width*c.height>best.width*best.height)){best=c;gl=x;}}dbgGrotte('vue',o);gl.finish();const px=new Uint8Array(4);const r=[];for(let k=0;k<5;k++){const t0=performance.now();for(let i=0;i<30;i++){dbgGrotte('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}r.push((performance.now()-t0)/30);}r.sort(function(a,b){return a-b;});return {med:+r[2].toFixed(2),min:+r[0].toFixed(2),w:best.width,h:best.height};})("+JSON.stringify(o)+")",120000);
      res[v.nom]=ms;log('  ',v.nom,JSON.stringify(ms));}
    const inf=await p.ev("(function(){try{const r=dbgScene().renderer.info;return {calls:r.render.calls,tri:r.render.triangles,geo:r.memory.geometries};}catch(e){return String(e);}})()");log('  info',JSON.stringify(inf));
    await fermePage(p);},
  async grottevues(){
    const g=+(opt.graines||'1').split(',')[0]||1;
    const p=await ouvrePage();await charge(p,U(g));await sauteIntro(p);const lc=await lanceCourse(p);
    if(!lc.lance)throw new Error('course pas lancée '+JSON.stringify(lc.jouer));
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");await dort((+opt.attente||4)*1000);
    await p.attend("dbgGrotte().pret",120000,500);
    await p.ev("(function(){for(const id of ['hud','garage','mobCtl','bNitro','pauseBtn']){const e=document.getElementById(id);if(e)e.style.display='none';}try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
    const fs2=require('fs');const defs=JSON.parse(fs2.readFileSync(opt.vuesfile,'utf8'));
    for(const v of defs){
      const o=await p.ev(v.expr,60000);
      if(v.log){log('  ',v.nom,JSON.stringify(o));continue;}
      await p.ev("dbgGrotte('"+(o.lac?'lac':'vue')+"',"+JSON.stringify(o)+")");await dort(900); /* (2026-11-11) {lac:1,k:'lave'|'eau',h,a,d} : la vue au ras d'un lac */
      const f=path.join(OUT,'v-'+(METEO||'x')+'-g'+g+'-'+v.nom+(opt.suf||'')+'.png');await p.photo(f);log('capture :',f);}
    log('erreurs',p.erreurs.length,p.erreurs.slice(0,5));await fermePage(p);},
  /* ===== LES VUES DE JADE (2026-11-11, Sacha : « bug de texture récurrent dans la map jade sur l'arche ») =====
     jadevues : --vuesfile=vues.json, [{nom, expr}] : expr pose elle-même la vue (dbgJadeVue('porte',d,h) ou dbgJadeVue({p,c,fov})) ; {nom,log:1,expr} : seulement écrire le résultat */
  async jadevues(){
    const g=+(opt.graines||'1').split(',')[0]||1;
    const p=await ouvrePage();await charge(p,U(g));await sauteIntro(p);const lc=await lanceCourse(p);
    if(!lc.lance)throw new Error('course pas lancée '+JSON.stringify(lc.jouer));
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");await dort((+opt.attente||12)*1000);
    await p.ev("(function(){for(const id of ['hud','garage','mobCtl','bNitro','pauseBtn']){const e=document.getElementById(id);if(e)e.style.display='none';}try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
    const defs=JSON.parse(fs.readFileSync(opt.vuesfile,'utf8'));
    for(const v of defs){
      const o=await p.ev(v.expr,60000);log('  ',v.nom,JSON.stringify(o));if(v.log)continue;
      await dort(+(v.dort||1500));if(v.apres)log('   apres',JSON.stringify(await p.ev(v.apres,60000)));
      const f=path.join(OUT,'jv-g'+g+'-'+v.nom+(opt.suf||'')+'.png');await p.photo(f);log('capture :',f);}
    log('erreurs',p.erreurs.length,p.erreurs.slice(0,5));await fermePage(p);},
  async grottesalles(){
    const g=+(opt.graines||'1').split(',')[0]||1;
    const p=await ouvrePage();await charge(p,U(g));await sauteIntro(p);const lc=await lanceCourse(p);
    if(!lc.lance)throw new Error('course pas lancée '+JSON.stringify(lc.jouer));
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");
    await dort((+opt.attente||4)*1000);
    const ok=await p.attend("dbgGrotte().pret",120000,500);log('grotte prête :',ok);
    log('INFO',JSON.stringify(await p.ev("(function(){const o=dbgGrotte();return {met:o.met,L:o.L,salles:o.salles,n:o.n,lac:o.lac,eau:o.eau,tm:o.tm};})()")));
    await p.ev("(function(){for(const id of ['hud','garage','mobCtl','bNitro']){const e=document.getElementById(id);if(e)e.style.display='none';}try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
    const specs=(opt.specs||'lave:60:22:9').split(';');
    for(const sp of specs){const [k,d,r,h,fov]=sp.split(':');
      const o="{k:'"+k+"',d:"+(+d||60)+",r:"+(+r||22)+",h:"+(+h||9)+",fov:"+(+fov||75)+",slab:1}";
      const rep=await p.ev("dbgGrotte('salle',"+o+")");await dort(700);
      const f=path.join(OUT,'grt-'+(METEO||'x')+'-g'+g+'-'+k+'-'+d+'-'+r+'-'+h+(opt.suf||'')+'.png');await p.photo(f);log('capture :',f,rep);}
    log('erreurs',p.erreurs.length,p.erreurs.slice(0,5));await fermePage(p);},
};
(async function(){if(!SC[scenario]){log('scénarios : '+Object.keys(SC).join(', '));process.exitCode=2;return;}await lanceChrome();try{await SC[scenario]();}catch(e){console.error('BANC :',e&&e.stack||e);process.exitCode=1;}finally{tueChrome();}})();
