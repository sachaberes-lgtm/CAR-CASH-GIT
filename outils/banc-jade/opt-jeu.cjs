/* LE BANC DE L'OPTIMISATION iPHONE DES VERBES (2026-11-17) : verbes-jeu.cjs pour le Mac (Chrome sans fenêtre, muet), plus les mesures de l'optimisation.
   node outils/banc-jade/opt-jeu.cjs <racine abs> <port> <cdp> "<q>" <dossier de sortie> [photos=1|0] [page=index.html] [tranches=1]
   q : ex. "pistegraine=3&meteo=nuit&tel=1&appareil=iPhone14,2" (tel=1 : le téléphone ; appareil= : le profil d'un iPhone).
   Relève : exceptions, __jadeErr, la règle d'or, l'audit du couloir, dbgJadeAv (lianes, pierres, allègement), les programmes (au menu, après la pose de la
   vallée, après le tour des scènes ; matières des verbes), les sphères des pierres à chaque arrêt (dbgJadeAvSphere + visibilité), et (tranches=1) la plus
   longue tranche de la génération de la route, processeur ×4 (dbgJadeTranches, d'un trait puis en tranches). À lancer sous ~/cash-car/verrou-banc.sh. */
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const [root,port,cdp,q,out]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]||'',process.argv[6]];
const opt=function(k,d){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):d;};
const ph=opt('photos','1')!=='0',page=opt('page','index.html'),tranches=opt('tranches','0')==='1';
fs.mkdirSync(out,{recursive:true});const tag=(page==='index.html'?'':page.replace(/\W+/g,'_')+'-')+q.replace(/[^a-z0-9=,]+/gi,'_').replace(/=/g,'-').slice(0,90);
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.wasm':'application/wasm','.glb':'model/gltf-binary','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.webp':'image/webp','.ktx2':'image/ktx2'};
const srv=http.createServer(function(rq,rs){const u=decodeURIComponent(rq.url.split('?')[0]);if(u.endsWith('sw.js')){rs.writeHead(404);return rs.end();}const f=path.join(root,u);
  fs.readFile(f,function(e,d){if(e){rs.writeHead(404);return rs.end();}rs.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});rs.end(d);});}).listen(port,'127.0.0.1');
const udd=path.join(require('os').tmpdir(),'banc-jadeopt-'+port);
const ch=spawn(process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--remote-debugging-port='+cdp,'--user-data-dir='+udd,'--no-first-run','--window-size=1280,800','--enable-unsafe-swiftshader','about:blank'],{detached:true,stdio:'ignore'});
const fin=function(code){try{process.kill(-ch.pid,'SIGKILL');}catch(e){}try{fs.rmSync(udd,{recursive:true,force:true});}catch(e){}srv.close();process.exit(code||0);};
process.on('SIGINT',function(){fin(1);});
const dodo=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
const R={q:q,page:page,exc:[],con:[]};
(async function(){let l=null;for(let i=0;i<120&&!l;i++){await dodo(500);try{l=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();if(!l.find(function(x){return x.type==='page';}))l=null;}catch(e){}}
  const pg=l.find(function(x){return x.type==='page';}),ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const P={};
  const call=function(m,p){return new Promise(function(r){const i=++id;P[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});};
  ws.onmessage=function(e){const m=JSON.parse(e.data);if(m.id&&P[m.id]){P[m.id](m.result);delete P[m.id];return;}
    if(m.method==='Runtime.exceptionThrown'){const d=m.params.exceptionDetails;R.exc.push(((d.exception||{}).description||d.text||'').slice(0,600));}
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')R.con.push(m.params.args.map(function(a){return a.value||a.description;}).join(' ').slice(0,300));};
  await new Promise(function(r){ws.onopen=r;});await call('Runtime.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
  if(/tel=1/.test(q)){await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});}
  await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
  await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/VERSION%20PRINCIPALE/'+page+'?intro=ancien&attente=0&prebati=0&chute=0&carte=jade&jade=avatar'+(/tel=1/.test(q)?'':'&colonne=0')+'&'+q});
  const ev=async function(x,aw){const r=await call('Runtime.evaluate',{expression:x,awaitPromise:!!aw,returnByValue:true,timeout:300000});return r&&r.result?r.result.value:null;};
  const progs=async function(){return await ev('(function(){try{const p=dbgJadeProgs();const o={};for(const x of p.liste)if(x.nom==="liane"||x.nom==="eau")o[x.nom]=x.programmes;return {liens:p.liens,manquants:p.manquants,etapes:p.etapes,verbes:o};}catch(e){return "erreur "+e.message;}})()');};
  for(let i=0;i<120;i++){await dodo(1500);if(await ev('!!window.__gameReady'))break;}
  await dodo(4000);await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}})()");
  for(let i=0;i<60;i++){if(await ev('!!(window.dbgJouer&&window.dbgClassique)'))break;await dodo(500);}
  await dodo(6000);R.progMenu=await progs();
  R.prf=await ev('(function(){try{const p=dbgPrf();return {on:p.on,classe:p.classe,niveau:p.niveau,niveauMax:p.niveauMax,allege:p.allege};}catch(e){return null;}})()');
  const m9=(/[?&]meteo=(\w+)/.exec(q)||[])[1];
  for(let k=0;k<3;k++){await ev("try{dbgClassique('jade',"+(m9?"'"+m9+"'":'null')+");}catch(e){}dbgJouer()");try{await ev('dbgImmortel(true)');}catch(e){}let ok=false;for(let i=0;i<80&&!ok;i++){await dodo(500);ok=await ev('!!(window.dbgState&&dbgState().started&&dbgState().running&&LVL.cur&&LVL.cur.piste==="jade")');}if(ok)break;}
  for(let i=0;i<160;i++){if(await ev('(function(){try{return dbgJade().montagnes>0&&!!dbgJadeAv().n;}catch(e){return false;}})()'))break;await dodo(750);}
  await dodo(3000);R.progPose=await progs();
  R.av=await ev('JSON.stringify(dbgJadeAv())');try{R.av=JSON.parse(R.av);}catch(e){}
  R.regle=await ev('JSON.stringify(dbgJadeRegle())');try{R.regle=JSON.parse(R.regle);}catch(e){}
  R.audit=await ev('(function(){try{const a=dbgJadeAudit();return JSON.stringify(a&&{couloir:a.couloir,frole:a.frole,panneaux:a.panneaux,flottants:a.flottants,cascades:a.cascades,temoin:a.temoin});}catch(e){return "erreur "+e.message;}})()');try{R.audit=JSON.parse(R.audit);}catch(e){}
  R.jade=await ev('(function(){try{const j=dbgJade();return JSON.stringify({triangles:j.triangles,appels:j.appels,montagnes:j.montagnes,cascades:j.cascades,err:j.err});}catch(e){return "erreur "+e.message;}})()');try{R.jade=JSON.parse(R.jade);}catch(e){}
  /* les verbes à l'écran : triangles des lianes, de l'eau, des pierres ; pierres : la sphère de la famille contient-elle chaque pierre, et une pierre dans le champ a-t-elle sa famille dans le champ ? */
  const verbes='(function(){try{const a=window.dbgJadeAvVerbes?dbgJadeAvVerbes():null;if(!a)return null;return Object.assign({},a,{sphere:a.sphere});}catch(e){return "erreur "+e.message;}})()';
  R.verbes0=await ev(verbes);R.arrets=[];
  R.photos=[];
  if(R.av&&R.av.s)for(const sc of R.av.s){const [nom,s0,s1]=sc;if(s1<=s0)continue;
    for(const u of [.15,.55]){const s=Math.round(s0+(s1-s0)*u);await ev('dbgImmortel(true);dbgJadeAller('+s+')');await dodo(2500);
      for(const v of ['route','large']){await ev(v==='route'?'dbgJadeVue(null,0,16)':'dbgJadeAvVue('+s+',-130,60,100)');await dodo(1200);
        const a=await ev(verbes);R.arrets.push({nom:nom,s:s,vue:v,v:a&&a.sphere?{marge:a.sphere.margeMin,hors:a.sphere.hors,visibles:a.visibles,fam:a.familleDansChamp,fautes:a.fautes}:(a&&{visibles:a.visibles,fam:a.familleDansChamp,fautes:a.fautes})});
        if(ph){const im=await call('Page.captureScreenshot',{format:'png'});const f=path.join(out,tag+'-'+nom+'-'+s+'-'+v+'.png');fs.writeFileSync(f,Buffer.from(im.data,'base64'));R.photos.push(path.basename(f));}}}
    await ev('if(paused)togglePause()');}
  /* une course libre de 20 s (la caisse immortelle) : les programmes nés en roulant */
  await ev('if(typeof paused!=="undefined"&&paused)togglePause()');await dodo(20000);R.progTour=await progs();
  R.jadeErr=await ev('window.__jadeErr?String(window.__jadeErr.stack||window.__jadeErr).slice(0,600):null');
  R.tick=await ev('(function(){try{const a=dbgJadeAvSphere();return a&&{maj:a.maj,sautees:a.sautees};}catch(e){return null;}})()');
  if(tranches){await call('Emulation.setCPUThrottlingRate',{rate:4});R.tranches=[];
    for(const p of [0,10,20])for(const g of [3,5,7]){const a=await ev('typeof dbgJadeTranches!=="function"?JSON.stringify((function(){const t=performance.now();const r=dbgGenRoute("jade",'+g+','+p+');return {tranches:1,max:+(performance.now()-t).toFixed(1),genMs:r&&r.ms};})()):JSON.stringify(dbgJadeTranches('+g+','+p+',true))'),b=await ev('typeof dbgJadeTranches!=="function"?null:JSON.stringify(dbgJadeTranches('+(g+100)+','+p+',false))');
      R.tranches.push({p:p,g:g,trait:a&&JSON.parse(a),tranches:b&&JSON.parse(b)});}
    await call('Emulation.setCPUThrottlingRate',{rate:1});}
  R.exc2=R.exc.length;
  fs.writeFileSync(path.join(out,tag+'.json'),JSON.stringify(R,null,1));
  const fautes=R.arrets.reduce(function(a,x){return a+((x.v&&x.v.fautes)|0);},0),hors=R.arrets.reduce(function(a,x){return a+((x.v&&x.v.hors)|0);},0),marge=Math.min.apply(null,R.arrets.map(function(x){return x.v&&x.v.marge!=null?x.v.marge:1e9;}));
  console.log(JSON.stringify({q:q,page:page,exc:R.exc.slice(0,3),con:R.con.slice(0,3),jadeErr:R.jadeErr,prf:R.prf,n:R.av&&R.av.n,regle:R.regle,audit:R.audit,jade:R.jade,verbes:R.verbes0,progMenu:R.progMenu,progPose:R.progPose,progTour:R.progTour,
    pierres:{arrets:R.arrets.length,fautes:fautes,horsSphere:hors,margeMin:marge},tick:R.tick,tranches:R.tranches,photos:R.photos.length}));
  fin(0);})().catch(function(e){console.log('ERR',e.message);fin(1);});
setTimeout(function(){console.log('ERR délai');fin(1);},14*60*1000);
