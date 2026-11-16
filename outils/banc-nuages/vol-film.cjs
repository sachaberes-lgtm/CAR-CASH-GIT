/* ===== LE FILM DE LA TRAVERSÉE, À L'HORLOGE DU JEU (2026-11-15, le vérificateur : « la traversée en vol jamais photographiée », « des pans au cœur des nappes ») =====
   Le serveur-sonde doit tourner (node outils/banc-nuages/serveur-sonde.cjs <port> [racine]).
   L'horloge de la page est REMPLACÉE (performance.now = une horloge à nous) et la boucle n'avance que par dbgStep : une image de jeu = 16,7 ms, quelle que soit
   la lenteur des photos. Tout ce qui se mesure en temps (voile, volutes, brume, souffle) est donc vu comme un joueur à 60 i/s le verrait.
   node outils/banc-nuages/vol-film.cjs --mode=vol|nappe|mouton [--graine=1] [--meteo=midi] [--tel=1] [--port=8340] [--cdp=9543] [--q=sans=nudedans] [--tous=3 (une photo toutes les N images)]
        [--rang=0 (le N-ième nuage candidat)] [--diag=1 (au cœur : les couches retirées une à une, une photo chacune)] [--out=dossier] [--nom=film]
   vol    : un nuage du ciel À HAUTEUR DE VOL (20-80 m au-dessus de la dalle, à moins de 45 m de l'axe) ; la caisse est lâchée 150 m avant (dbgLache) sur un arc qui passe par son cœur.
   nappe  : la première nappe (r > 75) au ras de la route ; le pilote la vise, on filme de 120 m avant à 60 m après.
   mouton : pareil pour le premier mouton (r ≤ 75).
   Sortie : <out>/<nom>-NNN-sS-hH-cC-dD.jpg (s = abscisse, h = hauteur au-dessus de la dalle, c = cloudInS, d = uDed) et <out>/<nom>.json. */
const {spawn,spawnSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8340),CDP=+(opt.cdp||9543),METEO=opt.meteo||'midi',TEL=opt.tel==='1',G=+(opt.graine||1),MODE=opt.mode||'vol',TOUS=+(opt.tous||3),RANG=+(opt.rang||0);
const NOM=opt.nom||(MODE+'-'+METEO+(TEL?'-tel':'')+'-g'+G);
const OUT=path.resolve(opt.out||path.join(__dirname,'sorties'));fs.mkdirSync(OUT,{recursive:true});
const URL0='http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&carte=nuages&meteo='+METEO+'&pistegraine='+G+(TEL?'&tel=1':'&colonne=0')+(opt.q?'&'+opt.q:'');
const dort=(ms)=>new Promise(r=>setTimeout(r,ms));
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
function tue(){if(chrome){try{spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}}
/* le côté page : l'horloge, le pas, l'état, le choix du nuage */
const PAGE=`(function(){
  const NU=window.__NU,C=NU.COTON,ST=NU.COTON_ST;
  const VF=window.__VF={on:0,T:0,
    horloge:function(){if(VF.on)return;const P=performance;VF.T=P.now();P.now=function(){return VF.T;};window.requestAnimationFrame=function(){return 0;};VF.on=1;dbgStep(1,16.667);},
    pas:function(n){for(let i=0;i<n;i++){VF.T+=16.667;dbgStep(1,16.667);}return VF.etat();},
    etat:function(){const R=dbgRoute(),st=NU.st(),cam=dbgCam(),ds=R.L/(R.NP-1),c=cam.c;const pl=VF.i==null;let i=pl?0:VF.i,bd=1e18,bi=i;for(let q=pl?0:Math.max(0,i-300);q<(pl?R.NP:Math.min(R.NP,i+300));q++){const p=R.pts[q],dx=p.x-c[0],dy=p.y-c[1],dz=p.z-c[2],d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;bi=q;}}i=VF.i=bi;const p=R.pts[i],n=R.Nn[i];
      const h=(c[0]-p.x)*n.x+(c[1]-p.y)*n.y+(c[2]-p.z)*n.z;
      return {s:Math.round(i*ds),mode:st.mode,h:+h.toFixed(1),cin:+st.cloudInS.toFixed(2),ded:NU.N8_U.uDed?+NU.N8_U.uDed.value.toFixed(2):0,pres:NU.NUA_POUF.pres||0,pS:NU.NUA_POUF.presS!=null?+NU.NUA_POUF.presS.toFixed(2):null,nf:NU.GFX_U.uNearF.value.toArray().map(function(x){return +x.toFixed(1);}),go:dbgState().gameOver,poufs:NU.NUA_POUF.n,vd:(function(){const a=document.getElementById('cloudDed'),b=document.getElementById('cloudFx'),h=document.getElementById('hud');return [a?a.style.opacity+'/'+getComputedStyle(a).display:'-',b?b.style.opacity+'/'+getComputedStyle(b).display+'/'+getComputedStyle(b).visibility+'/'+Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height)+'/z'+getComputedStyle(b).zIndex:'-',h?getComputedStyle(h).display+'/'+getComputedStyle(h).visibility+'/'+getComputedStyle(h).opacity+'/z'+getComputedStyle(h).zIndex+'/'+getComputedStyle(h).position:'-',document.elementsFromPoint(innerWidth/2,innerHeight*.3).slice(0,5).map(function(e){return e.tagName+'#'+e.id+'.'+String(e.className).slice(0,20)+'/z'+getComputedStyle(e).zIndex;}).join(',')].join(' ');})()};},
    /* les nuages à hauteur de vol : le centre de la masse (comme le tri de champ), projeté sur la route */
    cielVol:function(s0){const R=dbgRoute(),ds=R.L/(R.NP-1),out=[];
      for(let j=0;j<C.n;j++){const o=j*ST,I=C.I,r=I[o+3],S=C.S[I[o+5]|0];if(!S||r<35||r>150)continue;const sy=I[o+9]||1,yc=I[o+1]+S.base*r*sy+I[o+7]*.5;
        let b=1e18,bi=-1;for(let i=0;i<R.NP;i+=3){const p=R.pts[i],dx=p.x-I[o],dz=p.z-I[o+2],d=dx*dx+dz*dz;if(d<b){b=d;bi=i;}}
        const p=R.pts[bi],B=R.B[bi],N=R.Nn[bi],lat=(I[o]-p.x)*B.x+(yc-p.y)*B.y+(I[o+2]-p.z)*B.z,hh=(I[o]-p.x)*N.x+(yc-p.y)*N.y+(I[o+2]-p.z)*N.z,s=bi*ds;
        if(Math.abs(lat)<45&&hh>18&&hh<80&&s>s0+500&&s<R.L-600&&Math.abs(N.y)>.8)out.push({j:j,s:Math.round(s),lat:+lat.toFixed(1),h:+hh.toFixed(1),r:Math.round(r),sy:+sy.toFixed(2)});}
      out.sort(function(a,b){return a.s-b.s;});return out;},
    /* les couches, une à une (au cœur d'un nuage) : ce qui fait les pans */
    couches:function(){const sc=dbgScene().scene,L=[];sc.children.forEach(function(o){L.push(o);});return L.map(function(o,k){return k+':'+(o.name||o.type)+(o.visible?'':'(caché)');});}
  };
  return 'ok';})()`;
(async function(){
  const udd=path.join(os.tmpdir(),'cc-banc-pro-nuages-volfilm-'+CDP+(TEL?'-tel':''));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,800','--mute-audio','--autoplay-policy=no-user-gesture-required','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');break;}catch(e){if(i>150)throw new Error('Chrome ne répond pas');await dort(200);}}
  const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank'),ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,ko)=>{ws.onopen=ok;ws.onerror=ko;});
  let n=0;const att={},erreurs=[];ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&att[r.id]){const a=att[r.id];delete att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
    else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;erreurs.push(String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n')[0]);}};
  const call=(m,p)=>new Promise((ok,ko)=>{const id=++n;att[id]={ok,ko};ws.send(JSON.stringify({id,method:m,params:p||{}}));});
  const ev=async(x)=>{const r=await call('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true,timeout:120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;};
  const attend=async(x,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){try{if(await ev('!!('+x+')'))return true;}catch(e){}await dort(250);}return false;};
  const photo=async(f)=>{const r=await call('Page.captureScreenshot',{format:'jpeg',quality:84});fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});
  if(TEL){await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  else await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  await call('Page.navigate',{url:URL0});if(!await attend('window.__gameReady',180000))throw new Error('__gameReady jamais levé');
  for(let i=0;i<60&&await ev('!!window.__introCouvre');i++){await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(500);}
  await attend('!window.__introCouvre',60000);await dort(800);await attend("document.body.classList.contains('titreCiel')",60000);
  for(let i=0;i<8&&await ev("!!document.getElementById('splash')");i++){await ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(600);}
  let st=false;for(let k=0;k<3&&!st;k++){await ev('dbgJouer()');st=await attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
  if(!st)throw new Error('course pas lancée');
  await ev('dbgAuto(1,0,{nit:0})');if(!await attend('window.__NU&&__NU.COTON.n>0',30000))throw new Error('pas de sonde (__NU)');
  await ev(fs.readFileSync(path.join(__dirname,'sonde-page.js'),'utf8'));await ev(PAGE);
  await ev("(function(){try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW']){const e=document.getElementById(id);if(e)e.style.display='none';}})()");
  const J={mode:MODE,graine:G,meteo:METEO,tel:TEL,q:opt.q||'',images:[]};let cible,fin;
  if(MODE==='vol'){
    await attend('dbgRoute().s>250',60000);const L=await ev('__VF.cielVol(dbgRoute().s)');J.candidats=L.slice(0,8);cible=L[RANG];if(!cible)throw new Error('aucun nuage à hauteur de vol : '+JSON.stringify(L));
    console.log('nuage visé',JSON.stringify(cible));
    await attend('dbgRoute().s>'+(cible.s-520)+'||dbgState().gameOver',120000);
    await ev('dbgAuto(0)');await ev('__VF.horloge()');
    /* l'arc : lâchée à 150 m avant le cœur, 75 m/s ; g ≈ 23 m/s² (mesuré, le vol) ; on arrive au cœur 2 s plus tard, 2 m sous son centre */
    const D0=150,vT=75,tt=D0/vT,g=+(opt.g||23),h0=cible.h+(opt.dh!=null?+opt.dh:10),vN=(cible.h-2-h0+.5*g*tt*tt)/tt;
    const ds=await ev('(function(){return '+cible.s+'-'+D0+'-dbgRoute().s;})()');
    J.lache=await ev('dbgLache({ds:'+ds+',lat:'+cible.lat+',h:'+h0+',vT:'+vT+',vN:'+vN.toFixed(2)+'})');J.lache.vN=+vN.toFixed(2);await ev('__VF.i=null');console.log('lâchée',JSON.stringify(J.lache),'ds',ds.toFixed(0));
    fin=cible.s+cible.r*1.2+60;}
  else{
    await attend('dbgRoute().s>250',60000);const A=await ev('__NUaudit().ras.filter(function(x){return x.marge<0;})');const L=A.filter(function(a){return MODE==='nappe'?a.r>75:a.r<=75;}).filter(function(a){return a.s>600;});
    J.candidats=L.slice(0,8);cible=L[RANG];if(!cible)throw new Error('aucun '+MODE+' : '+JSON.stringify(A));
    const lat=await ev("(function(){const R=dbgRoute(),o="+cible.j+"*__NU.COTON_ST,I=__NU.COTON.I,ds=R.L/(R.NP-1),i=Math.round("+cible.s+"/ds),p=R.pts[i],B=R.B[i];return +((I[o]-p.x)*B.x+(I[o+2]-p.z)*B.z).toFixed(1);})()");
    cible.lat=lat;console.log(MODE+' visé',JSON.stringify(cible));
    await attend('dbgRoute().s>'+(cible.s-700)+'||dbgState().gameOver',150000);await ev('dbgAuto(1,'+Math.max(-12,Math.min(12,lat))+',{nit:0})');
    await attend('dbgRoute().s>'+(cible.s-cible.r-160)+'||dbgState().gameOver',60000);await ev('__VF.horloge()');
    fin=cible.s+cible.r+70;}
  J.cible=cible;let k=0,diagFait=false,dedMax=0;const EXP=opt.exp?eval(fs.readFileSync(opt.exp,'utf8')):null,EXPS=(opt.exps||'').split(',').filter(Boolean).map(Number);
  for(let f=0;f<900;f++){const e=await ev("__VF.pas("+TOUS+")");(J.tous||(J.tous=[])).push([e.s,e.h,e.mode,e.cin,e.ded]);if(e.go){J.mort=e;break;}
    if(MODE!=='vol'||e.s>cible.s-170){const nm=NOM+'-'+String(k++).padStart(3,'0')+'-s'+e.s+'-h'+Math.round(e.h)+'-c'+e.cin.toFixed(2)+'-d'+e.ded.toFixed(2)+'.jpg';await photo(path.join(OUT,nm));e.f=nm;J.images.push(e);}
    if(e.ded>dedMax)dedMax=e.ded;
    if(opt.diag==='1'&&!diagFait&&(opt.diags?e.s>=+opt.diags:e.cin>=+(opt.diagc||.4))){diagFait=true;
      /* les maillages visibles groupés (nom | matière), chaque groupe retiré à son tour, la même image (rien n'avance) : ce qui fait les pans */
      J.groupes=await ev(`(function(){const G={};window.__VFg=G;dbgScene().scene.traverseVisible(function(o){if(!o.isMesh&&!o.isPoints&&!o.isLine)return;const m=Array.isArray(o.material)?o.material[0]:o.material;
        if(!m)return;const k=m.uuid;const g=G[k]||(G[k]={m:m,n:0,nom:(o.name||o.type)+'|'+(m.name||m.type)+(m.side===2?'/2':m.side===1?'/1':'')});g.n++;});return Object.keys(G).map(function(k){return k+' '+G[k].nom+' ×'+G[k].n;});})()`);
      J.diag=[];const K=await ev('Object.keys(__VFg)');
      for(let q=-1;q<K.length;q++){await ev('(function(){const g=__VFg['+JSON.stringify(K[q]||'')+'];if(g)g.m.visible=false;dbgNuVit(null,{rendre:1});})()');
        const nm=NOM+'-diag-'+String(q+1).padStart(2,'0')+'-'+(q<0?'tout':String(q)).replace(/[^a-zA-Z0-9]+/g,'_').slice(0,40)+'.jpg';await photo(path.join(OUT,nm));J.diag.push(nm);
        await ev('(function(){const g=__VFg['+JSON.stringify(K[q]||'')+'];if(g)g.m.visible=true;})()');}
      console.log('groupes',JSON.stringify(J.groupes));}
    /* --exp=fichier.js (un tableau [{nom, avant, apres}] de bouts de JS) --exps=s1,s2 : à chaque abscisse, chaque variante rendue sur LA MÊME image (rien n'avance) */
    if(EXP&&EXPS.length&&e.s>=EXPS[0]){const sx=EXPS.shift();for(const v of EXP){await ev(v.avant||'0');await ev('dbgNuVit(null,{rendre:1})');await dort(400);await ev('dbgNuVit(null,{rendre:1})');await dort(200);await ev('dbgNuVit(null,{rendre:1})');await photo(path.join(OUT,NOM+'-exp-s'+sx+'-'+v.nom+'.jpg'));await ev(v.apres||'0');}await ev('dbgNuVit(null,{rendre:1})');}
    if(e.s>fin)break;}
  J.dedMax=dedMax;J.erreurs=erreurs.slice(0,10);fs.writeFileSync(path.join(OUT,NOM+'.json'),JSON.stringify(J,null,1));
  console.log("trace",JSON.stringify((J.tous||[]).slice(0,60)));console.log("images",J.images.length,'dedMax',dedMax,'mort',JSON.stringify(J.mort||null),'erreurs',erreurs.length);
  for(const e of J.images)console.log(' ',e.s,'h',e.h,e.mode,'cin',e.cin,'ded',e.ded,'pres',e.pres,'nf',e.nf.join('/'),e.vd);
  try{ws.close();}catch(e){}
})().then(tue,function(e){console.error(e);tue();process.exit(1);});
