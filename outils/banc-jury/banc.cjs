/* ===== BANC DU JURY (2026-11-05, Fable : « vérification croisée de chaque étape : charger ?garde=1&tel=1 dans un Chrome 390×844, jouer une course, lire la console ») =====
   Client CDP minimal en Node pur (WebSocket intégré de Node ≥ 22), Chrome headless : node outils/banc-jury/banc.cjs <scénario> [url] [options]
   Scénarios : etat (charge, saute l'intro, décrit) · soleil (DIR-01 : temps du sprite 1.61, ancien et nouveau, un et deux onglets) ·
               course (une course au pilote auto jusqu'à la mort, 0 erreur console) · tas (DIR-02 : N courses, performance.memory et renderer.info)
               horloge (GP-02 : ?fps=15, 10 s de frénésie = 10 s) · panne (GP-01 : dbgBoucle('physique') → explosion en 3 images)
   Le serveur du dépôt doit tourner (par défaut http://localhost:8123/VERSION%20PRINCIPALE/index.html). */
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARGS=process.argv.slice(2).filter(function(a){return !a.startsWith('--');});
const scenario=ARGS[0]||'etat';
const URL0=ARGS[1]||'http://localhost:8123/VERSION%20PRINCIPALE/index.html';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||9333);
const U=function(q){return URL0+'?garde=1&tel=1'+(opt.q?'&'+opt.q:'')+(q||'');}; /* --q=intro=ancien&x=y : paramètres d'URL en plus */
const dort=(ms)=>new Promise(r=>setTimeout(r,ms));
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){
  /* --profil=chaud : un profil Chrome qui SURVIT entre deux lancements (cache des programmes GPU, cache HTTP) — le jeu charge en ~3 s au lieu de ~65 s à froid (compilation D3D des 85 programmes) ; sans option : profil neuf = à froid */
  const udd=opt.profil==='chaud'?path.join(os.tmpdir(),'cc-banc-chaud'):fs.mkdtempSync(path.join(os.tmpdir(),'cc-banc-'));if(opt.profil==='chaud')fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=390,844',
    '--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding','--mute-audio','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+PORT+'/json/version');return;}catch(e){await dort(200);}}
  throw new Error('Chrome ne répond pas sur '+PORT);
}
function tueChrome(){if(!chrome)return;try{chrome.kill();}catch(e){}try{require('child_process').spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
async function relance(){tueChrome();await dort(2500);await lanceChrome();} /* un Chrome NEUF (cache de programmes vide) : les comparaisons à froid */
class Page{
  constructor(ws){this.ws=ws;this.n=0;this.att={};this.console=[];this.erreurs=[];this.evts=[];
    ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'){const p=r.params;const t=p.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ');this.console.push({t:p.type,m:t});if(p.type==='error')this.erreurs.push(t);}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;const t=(d.exception&&(d.exception.description||d.exception.value))||d.text;this.erreurs.push('EXCEPTION '+String(t).split('\n')[0]);}
      else if(r.method==='Log.entryAdded'){const e=r.params.entry;if(e.level==='error')this.erreurs.push('LOG '+e.text);}
      else this.evts.push(r);};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||60000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){if(await this.ev('!!('+expr+')'))return true;await dort(pas||250);}return false;}
  async touche(x,y){ /* un vrai toucher (le jeu en ?tel=1 écoute le tactile) */
    await this.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await dort(70);await this.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  async nav(url){await this.call('Page.navigate',{url});}
}
async function ouvrePage(url){
  const t=await putJson('http://127.0.0.1:'+PORT+'/json/new?'+(url||'about:blank'));
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  const p=new Page(ws);p.id=t.id;
  await p.call('Runtime.enable');await p.call('Log.enable');await p.call('Page.enable');
  await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true}); /* le service worker du jeu servait une page périmée au banc : on le contourne (le disque fait foi) */
  await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});
  if(opt.sauve!=='0')await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3}}));}catch(e){}"}); /* une sauvegarde de joueur qui a déjà joué (auto-école faite, plaque choisie) : le JOUER part tout de suite — --sauve=0 : compte neuf */
  return p;}
async function fermePage(p){try{p.ws.close();}catch(e){}try{await getJson('http://127.0.0.1:'+PORT+'/json/close/'+p.id);}catch(e){}}
/* ---- les étapes communes ---- */
async function charge(p,url){const t0=Date.now();if(opt.v)console.log('→',url);await p.nav(url);const ok=await p.attend('window.__gameReady',120000,200);const pret=Date.now()-t0;if(!ok)throw new Error('__gameReady jamais posé');return pret;}
async function sauteIntro(p){ /* le film part tout seul ; un toucher pendant le film le saute ; on attend la fin du voile */
  for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(1500);} /* une touche du clavier : lance le film, puis le passe (kd dans intro-161) */
  await p.attend('!window.__introCouvre',60000,200);await dort(800);}
async function etat(p){return p.ev("({intro:!!window.__introCouvre,body:document.body.className.slice(0,120),boutons:[...document.querySelectorAll('button,[role=button],.mPlay,#mPlay')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(b).visibility!=='hidden';}).slice(0,25).map(b=>(b.id||b.className||b.tagName).toString().slice(0,30)+' « '+b.textContent.trim().slice(0,24)+' »'),st:window.dbgState?dbgState():null})");}
async function lanceCourse(p){ /* depuis le ciel/garage : JOUER */
  for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){const sp=await p.ev("(function(){const e=document.getElementById('splash'),r=e.getBoundingClientRect();try{e.click();}catch(x){}return {x:r.left+r.width/2,y:r.top+r.height/2};})()");await p.touche(sp.x,sp.y);await dort(1200);} /* l'écran titre d'avant (?intro=ancien) : start() refuse tant que #splash existe */
  if(opt.bouton!=='1'){let st=false,j=null;for(let k=0;k<3&&!st;k++){j=await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000,250);if(!st)console.log('  (départ raté, essai '+(k+1)+' : '+JSON.stringify(j)+')');}return 'dbgJouer '+(j&&typeof j.appel==='string'?j.appel.slice(0,16):'')+(j&&j.goApres?' (lâcher)':'')+(j&&j.chuteGoApres?' (piqué)':'')+' → '+(st?'course lancée':'PAS lancée');} /* --bouton=1 : par le vrai bouton JOUER (touchers) */
  {const sp=await p.ev("(function(){const e=document.getElementById('splash');if(!e)return null;const r=e.getBoundingClientRect();return r.width>0?{x:r.left+r.width/2,y:r.top+r.height/2}:null;})()");if(sp){await p.touche(sp.x,sp.y);await dort(1500);}} /* l'ancien écran titre (?intro=ancien) attend un toucher */
  const rc=await p.ev("(function(){const b=document.getElementById('mPlay')||document.querySelector('.mPlay')||[...document.querySelectorAll('button')].find(b=>/JOUER|PLAY/.test(b.textContent));if(!b)return null;const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,n:b.id||b.className};})()");
  if(!rc)return 'pas de bouton JOUER';let ok='';
  for(let i=0;i<4;i++){ /* l'écran titre (titreCiel : « la chute ») prend d'abord un toucher n'importe où, puis JOUER */
    if(await p.ev("document.body.classList.contains('titreCiel')")){await p.touche(195,400);ok+='titre→';await dort(3500);}
    const sous=await p.ev("(function(){const e=document.elementFromPoint("+rc.x+","+rc.y+");return e?(e.id||e.className||e.tagName)+'':'?';})()");
    await p.touche(rc.x,rc.y);ok+='touché '+rc.n+' sous '+sous+' ; ';
    if(await p.attend('window.dbgState&&dbgState().started',6000,200))break;
    if(i>=1){await p.ev("(function(){const b=document.querySelector('.mPlay');['pointerdown','pointerup','click'].forEach(function(t){b.dispatchEvent(new (t==='click'?MouseEvent:PointerEvent)(t,{bubbles:true,cancelable:true,clientX:"+rc.x+",clientY:"+rc.y+",pointerType:'touch',isPrimary:true}));});})()");ok+='click DOM ; ';if(await p.attend('window.dbgState&&dbgState().started',6000,200))break;}}
  const st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',30000,200);return ok+' → '+(st?'course lancée':'PAS lancée');}
async function joueJusquALaMort(p,maxS){await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:1})");const t0=Date.now();
  while(Date.now()-t0<(maxS||120)*1000){const s=await p.ev('dbgState()');if(s.gameOver)return {mort:true,s:Math.round(s.s),dur:Math.round((Date.now()-t0)/100)/10};await dort(500);}
  return {mort:false,dur:maxS};}
/* ---- les scénarios ---- */
const SC={
  async sauvegarde(){ /* ECO-04 : code scellé et borné · SON-05 : musique remise une fois · HYG-15 : un flush qui échoue se dit */
    const p=await ouvrePage();await charge(p,U());await sauteIntro(p);
    const r=await p.ev("dbgSauvegardeBanc()");console.log(JSON.stringify(r,null,1));
    console.log('boîte noire :',JSON.stringify((await p.ev('dbgErreurs()')).filter(function(e){return e.g==='sauvegarde';}).map(function(e){return e.m;})));
    console.log('erreurs console :',p.erreurs.slice(0,5));await fermePage(p);},
  async verif(){const p=await ouvrePage();await charge(p,U('&horloge=ancien'));
    console.log(await p.ev("(function(){let txt='';for(const sc of document.scripts){const i=sc.textContent.indexOf('const HOR_ANCIEN=');if(i>=0)txt=sc.textContent.slice(i,i+70);}return {ancien:dbgHorloge().ancien,search:location.search,test:/[?&]horloge=ancien/.test(location.search),txt:txt,sw:!!(navigator.serviceWorker&&navigator.serviceWorker.controller),ver:typeof CC_VER!=='undefined'?CC_VER:'?'};})()"));
    await fermePage(p);},
  async depart(){ /* diagnostic : la séquence du départ image par image */
    const p=await ouvrePage();await charge(p,U());await sauteIntro(p);console.log('jouer :',JSON.stringify(await p.ev('dbgJouer()')));
    for(let i=0;i<14;i++){await dort(i<6?500:2000);console.log(JSON.stringify(await p.ev('dbgDepartEtat()')));}
    console.log('console :',JSON.stringify(p.console.filter(function(c){return c.t!=='warning'||!/flatShading/.test(c.m);}).slice(-8)));console.log('erreurs :',p.erreurs.slice(0,5));await fermePage(p);},
  async jouer(){ /* diagnostic : que se passe-t-il après le toucher sur JOUER ? */
    const p=await ouvrePage();await charge(p,U());await sauteIntro(p);
    console.log('avant :',await p.ev("(function(){const b=document.querySelector('.mPlay'),r=b&&b.getBoundingClientRect();const el=r?document.elementFromPoint(r.left+r.width/2,r.top+r.height/2):null;return {rect:r?[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]:null,sous:el?(el.id||el.className||el.tagName)+'':null,body:document.body.className,garageOn:typeof garageOn!=='undefined'?garageOn:'?'};})()"));
    console.log('dbgJouer :',JSON.stringify(await p.ev('dbgJouer()')));
    for(let i=0;i<6;i++){await dort(1000);console.log('+'+(i+1)+' s :',JSON.stringify(await p.ev("(function(){const s=dbgState();let c=null;try{c=window.dbgChute?dbgChute():null;}catch(e){c=String(e);}return {started:s.started,body:document.body.className.slice(0,90),chute:c,horloge:dbgHorloge().images};})()")).slice(0,700));}
    console.log('console :',JSON.stringify(p.console.slice(-12)));console.log('mPlay :',await p.ev("(function(){const b=document.querySelector('.mPlay');const c=getComputedStyle(b);return {pe:c.pointerEvents,disp:c.display,op:c.opacity,dansMob:!!b.closest('#mob'),parents:(function(){let o=[],e=b;while(e&&o.length<6){o.push(e.id||e.className);e=e.parentElement;}return o;})(),home:getComputedStyle(document.getElementById('mHome')).display};})()"));await fermePage(p);},
  async raf(){ /* le rAF tourne-t-il ? à quelle cadence ? la boucle calcule-t-elle des images ? */
    const p=await ouvrePage();const pret=await charge(p,U());
    console.log('prêt',pret,'ms ·',await p.ev("(async function(){let n=0;const t0=performance.now();await new Promise(function(ok){function f(){n++;if(performance.now()-t0<1000)requestAnimationFrame(f);else ok();}requestAnimationFrame(f);setTimeout(ok,2500);});return {rafParSec:n,visibilite:document.visibilityState,hasFocus:document.hasFocus(),cadence:window.dbgCadence?dbgCadence():null,images:window.dbgHorloge?dbgHorloge().images:null,lier:window.dbgLier?dbgLier().demarrage:null,intro:!!window.__introCouvre};})()"));
    await dort(3000);console.log('3 s plus tard :',await p.ev("({images:dbgHorloge().images,lier:dbgLier().demarrage,enCours:dbgLier().enCours})"));await fermePage(p);},
  async gpu(){ /* quel GPU voit Chrome headless ? et où passent les secondes du chargement ? */
    const p=await ouvrePage();await p.nav('about:blank');await dort(300);
    console.log('WebGL :',await p.ev("(function(){const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');if(!g)return 'aucun';const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER);})()"));
    const t0=Date.now();await p.nav(U());const marques=[];let der='';
    for(let i=0;i<600;i++){const m=await p.ev("(function(){const n=performance.getEntriesByType('navigation')[0]||{};return {rs:document.readyState,dom:Math.round(n.domContentLoadedEventEnd||0),load:Math.round(n.loadEventEnd||0),pret:!!window.__gameReady,intro:!!window.__introCouvre,lier:(typeof window.dbgLier==='function')?dbgLier():null,now:Math.round(performance.now())};})()").catch(function(){return null;});
      if(!m)continue;const k=m.rs+'/'+m.pret+'/'+m.intro;if(k!==der){der=k;marques.push(Object.assign({t:Date.now()-t0},m));console.log(JSON.stringify(marques[marques.length-1]));}
      if(m.pret&&!m.intro)break;await dort(250);}
    for(let i=0;i<12;i++){await dort(2000);const l=await p.ev("(function(){const l=dbgLier();return {enCours:l.enCours,lances:l.lances,lies:l.lies,rates:l.rates,demarrage:l.demarrage,images:window.dbgHorloge?dbgHorloge().images:null};})()").catch(function(e){return String(e);});console.log('lier +'+(i*2+2)+' s :',JSON.stringify(l));}
    await fermePage(p);},
  async etat(){const p=await ouvrePage();const pret=await charge(p,U());await sauteIntro(p);const e=await etat(p);console.log(JSON.stringify({pret,e,erreurs:p.erreurs},null,1));await fermePage(p);},
  async soleil(){ /* DIR-01 : un onglet puis deux onglets, ancien et nouveau */
    for(const v of (opt.ordre||'ancien,png,ancien,png').split(',')){const q=v==='ancien'?'&soleil=ancien':'';await relance();
      const p=await ouvrePage();const pret=await charge(p,U()+q);const s=await p.ev('dbgSoleil161()');
      const p2=await ouvrePage();const pret2=await charge(p2,U()+q+'&deux=1');const s2=await p2.ev('dbgSoleil161()');
      console.log(v,'· 1er onglet : prêt en',pret,'ms',JSON.stringify(s),'· 2e onglet (le 1er tourne) : prêt en',pret2,'ms',JSON.stringify(s2));
      await fermePage(p2);await fermePage(p);}},
  async course(){const p=await ouvrePage();const pret=await charge(p,U());await sauteIntro(p);console.log('prêt',pret,'ms ·',await lanceCourse(p));
    const r=await joueJusquALaMort(p,+opt.max||90);console.log('course :',JSON.stringify(r),'· horloge',JSON.stringify(await p.ev('dbgHorloge()')),'· boucle',JSON.stringify(await p.ev('dbgBoucle()')));
    console.log('erreurs console :',p.erreurs.length,p.erreurs.slice(0,10));console.log('boîte noire :',JSON.stringify(await p.ev('dbgErreurs()')));await fermePage(p);},
  async panne(){const p=await ouvrePage();await charge(p,U());await sauteIntro(p);console.log(await lanceCourse(p));await p.ev("dbgAuto(1,0,{nit:0})");await dort(4000);
    const av=await p.ev('dbgState()');await p.ev("dbgBoucle('"+(opt.tranche||'physique')+"')");await dort(1500);const ap=await p.ev('dbgState()');
    console.log('avant :',{mode:av.mode,gameOver:av.gameOver},'· 1,5 s après dbgBoucle :',{mode:ap.mode,gameOver:ap.gameOver},'· boucle',JSON.stringify(await p.ev('dbgBoucle()')));
    console.log('boîte noire :',JSON.stringify((await p.ev('dbgErreurs()')).filter(e=>e.g==='boucle')));console.log('erreurs console :',p.erreurs.slice(0,6));await fermePage(p);},
  async horloge(){ /* GP-02 : la pente des minuteurs (nitro infinie 9 s, RUNX.t) contre l'horloge murale, à 60 i/s et à 15 i/s, avec et sans la correction (?horloge=ancien) ; 1,00 = le chrono suit le temps vrai */
    for(const c of [{fps:60},{fps:15},{fps:15,ancien:1}]){await relance();const p=await ouvrePage();await charge(p,U((c.fps<60?'&fps='+c.fps:'')+(c.ancien?'&horloge=ancien':'')));await sauteIntro(p);const lc=await lanceCourse(p);await p.ev("dbgAuto(1,0,{nit:0})");await dort(2500);
      const r=await p.ev("(async function(){dbgPwr('n');const E=[];const t0=performance.now();for(let i=0;i<160;i++){await new Promise(r=>setTimeout(r,50));const m=dbgMinuteurs();E.push([(performance.now()-t0)/1000,m.nitro,m.runxT]);if(m.nitro<=0&&i>10)break;}const a=E[2],z=E[E.length-2];return {n:E.length,nitroPente:+((a[1]-z[1])/(z[0]-a[0])).toFixed(3),runxPente:+((z[2]-a[2])/(z[0]-a[0])).toFixed(3),nitro0:E[0][1],dureeNitro:+z[0].toFixed(2),horloge:dbgHorloge(),mort:dbgState().gameOver,search:location.search};})()");
      console.log(JSON.stringify(c),lc.slice(-14),'→ pente nitro',r.nitroPente,'· pente RUNX.t',r.runxPente,'· nitro de',r.nitro0,'à 0 en',r.dureeNitro,'s · rawMs',r.horloge.rawMs,'dt',r.horloge.dt,'dtH',r.horloge.dtH,'ancien',r.horloge.ancien,'search',r.search,r.mort?'(mort)':'');await fermePage(p);}},
  async frenesie(){ /* SON-03 : la frénésie en WebAudio — le nœud joue, FRENM.sw dit vrai ; elle tombe, le nœud s'étrangle, sw redescend */
    const p=await ouvrePage();await charge(p,U(opt.ancien?'&frenesie=ancien':''));await sauteIntro(p);console.log(await lanceCourse(p));await p.ev("dbgAuto(1,0,{nit:0})");await dort(2500);
    console.log('avant :',JSON.stringify(await p.ev('dbgFrenWa()')));
    await p.ev("dbgFren('v',100);dbgFren('entre')");
    for(let i=0;i<8;i++){await dort(700);console.log('+'+((i+1)*.7).toFixed(1)+' s :',JSON.stringify(await p.ev("Object.assign(dbgFrenWa(),{lv:dbgFren('journal')?undefined:undefined,mort:dbgState().gameOver})")));}
    await p.ev("dbgFren('v',0)");
    for(let i=0;i<4;i++){await dort(600);console.log('perdue +'+((i+1)*.6).toFixed(1)+' s :',JSON.stringify(await p.ev('dbgFrenWa()')));}
    console.log('boîte noire :',JSON.stringify((await p.ev('dbgErreurs()')).filter(function(e){return /fr[ée]n/.test(e.m);})),'· erreurs console :',p.erreurs.slice(0,5));await fermePage(p);},
  async tas(){ /* DIR-02 : N courses d'affilée (REJOUER), le tas JS et les compteurs du moteur relevés à chaque mort et à chaque départ */
    const p=await ouvrePage();await charge(p,U());await sauteIntro(p);const N=+opt.n||3;
    const lit=async function(nom){for(let i=0;i<3;i++){await p.ev("window.gc&&gc()");await dort(300);}const m=await p.ev("dbgTas()");console.log(nom.padEnd(12),JSON.stringify(m));return m;};
    await lit('accueil');console.log(await lanceCourse(p));await dort(1500);const t0=await lit('course 1');
    for(let i=1;i<=N;i++){await p.ev("dbgAuto(1,0,{nit:1})");const r=await joueJusquALaMort(p,+opt.max||45);if(!r.mort){await p.ev("dbgBoom&&dbgBoom()");await p.attend('dbgState().gameOver',15000,250);}await dort(3000);
      await lit('mort '+i);
      if(i<N){await p.ev("(function(){const b=document.querySelector('#mDead [data-m=replay]');if(b)b.click();return !!b;})()");const ok=await p.attend('window.dbgState&&dbgState().started&&dbgState().running&&!dbgState().gameOver',40000,250);if(!ok){console.log('REJOUER : pas reparti');break;}await dort(1500);await lit('course '+(i+1));}}
    console.log('erreurs console :',p.erreurs.length,p.erreurs.slice(0,6));await fermePage(p);}

};
(async function(){await lanceChrome();try{await SC[scenario]();}catch(e){console.error('BANC :',e&&e.stack||e);process.exitCode=1;}finally{tueChrome();}})();
