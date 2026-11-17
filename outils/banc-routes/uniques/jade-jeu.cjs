/* ===== LES ROUTES UNIQUES — JADE DANS LE JEU (2026-11-17, vérification du nouveau tirage aux formats iPhone) =====
   Un seul Chrome sans fenêtre, MUET (--mute-audio + sfx/mus/vox coupés dans cashcarSave), téléphone émulé (tel=1, appareil=iPhone14,2), portrait 390×844
   (paysage 844×390 avec `pay=1` dans le cas). Service worker contourné, cache coupé, sw.js en 404. Un crochet de banc est glissé DANS la fonction du jeu
   (avant window.dbgJadeVue) : la caméra dans la roche (jadeHeurtPt), renderer.info.
   Pour chaque cas (une query, ex. "pistegraine=101" ou "pistegraine=7&jsceneu=porte,arche&jouv=bosse&jrelief=vagues&max=90") :
     1. Jade en 1re map, au pilote (dbgAuto, MORTEL, sans saut volontaire : seuls les sauts que la route impose) ; photos à 2, 5, 9 s du départ ;
        chaque image : appels, triangles, écart ; toutes les 100 ms : s, mode, caméra dans la roche ; une mort → relevée, reprise 80 m plus loin.
     2. Après la course : la règle d'or, l'audit du couloir, les îles des scènes (posées/refusées), la route qui se recoupe, la fiche du tirage (JADE.u, JADE.a3),
        les programmes liés pendant la course, la mémoire du renderer ; photo de chaque petit module (`photos=petits`).
   node outils/banc-routes/uniques/jade-jeu.cjs <racine abs> <port> <cdp> <dossier de sortie> <cas…>   — SOUS ~/cash-car/verrou-banc.sh (le script garde le verrou frais).
   Sortie : <dossier>/<cas>.json et les photos <graine>-<ouverture>-<1er module>-<t>.png. */
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const [root,port,cdp,out,...CAS]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5],...process.argv.slice(6)];
fs.mkdirSync(out,{recursive:true});
const NOM=process.env.VERROU_NOM||'routes-uniques-jade',QUI='/private/tmp/cashcar-banc.lock/qui';
/* le verrou est jugé abandonné après 15 min : on le garde frais tant qu'il est à nous */
const frais=setInterval(function(){try{const t=fs.readFileSync(QUI,'utf8');if(t.indexOf(NOM)>=0){const a=t.trim().split(' ');fs.writeFileSync(QUI,a[0]+' '+Math.floor(Date.now()/1000)+' '+NOM+'\n');}}catch(e){}},60000);
const CROCHET=`window.__bancU={roc:function(){return JADE.col&&JADE.root?(jadeHeurtPt(camera.position)?1:0):-1;},cam:function(){return camera.position.toArray().map(function(x){return Math.round(x);});},
  info:function(){const r=renderer.info;return {geo:r.memory.geometries,tex:r.memory.textures,prog:r.programs?r.programs.length:-1};},rdr:function(){return renderer;},
  etat:function(){return {piste:LVL.cur&&LVL.cur.piste,id:LVL.cur&&LVL.cur.id,root:!!JADE.root,NP:NP};},fiche:function(){return {u:JADE.u,a3:JADE.a3};},reprend:function(){JADE.photo=false;if(paused)togglePause();},pause:function(){if(started&&!gameOver&&!paused)togglePause();},
  couloir:function(){if(!JADE.root||!JADE.col)return null;const ds=L/(NP-1),C=JADE.col,V=new THREE.Vector3(),demi=ROAD_HALF,hits=[],fro=[];let nH=0,nF=0; /* le couloir de dbgJadeAudit (sans les panneaux ni le témoin, trop lents sur la machine chargée) */
    const cube=function(p){const a=C.g.get(Math.floor(p.x/C.CG)*100003+Math.floor(p.z/C.CG));
      if(a)for(let j=0;j<a.length;j++){const q=C.P[a[j]];if(p.y<q[3]-1||p.y>q[4]+1)continue;const dx=p.x-q[0],dz=p.z-q[1];if(dx*dx+dz*dz>(q[2]+1)*(q[2]+1))continue;if(jadePilierDans(q,p.x,p.y,p.z))return jadeRocher(q[5])?'rocher':'montagne';}
      if(JADE.porte&&jadeDansGrille(JADE.porte,p))return 'porte';if(JADE.pont&&jadeDansGrille(JADE.pont,p))return 'pont';return null;};
    const st=Math.max(1,Math.round(2/ds));for(let i=Math.round(40/ds);i<NP;i+=st){
      for(const f of [-1,-.5,0,.5,1])for(const h of [.3,1.5,3,5,7]){V.copy(pts[i]).addScaledVector(B[i],f*(demi+1)).addScaledVector(Nn[i],h);const k=cube(V);if(k){nH++;if(hits.length<12)hits.push([Math.round(i*ds),f,h,k]);}}
      for(const f of [-1,1])for(const e of [1,2,3])for(const h of [.3,1.5,3,5]){V.copy(pts[i]).addScaledVector(B[i],f*(demi+1+e)).addScaledVector(Nn[i],h);const k=cube(V);if(k){nF++;if(fro.length<12)fro.push([Math.round(i*ds),f*(demi+1+e),h,k]);break;}}}
    let eMin=1e9;for(let i=0;i<NP;i+=2)eMin=Math.min(eMin,pts[i].y-JADE.eauY);
    return {couloir:{heurts:nH,ex:hits},frole:{n:nF,ex:fro},eau:{eauY:Math.round(JADE.eauY),eauMin:Math.round(eMin)},n:JADE.n&&{montagnes:JADE.n.montagnes,arbres:JADE.n.arbres,cascades:JADE.n.cascades,ms:JADE.n.ms}};},
  deco:function(){return {deco3:JADE.deco3?JADE.deco3.length:-1,deco3av:JADE.deco3?JADE.deco3.filter(function(o){return o.av;}).length:-1,pics:JADE.deco3?JADE.deco3.filter(function(o){return o.t==='pic';}).length:-1,ko:JADE.deco3?JADE.deco3.filter(function(o){return o.ko;}).length:-1};}};
`;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.wasm':'application/wasm','.glb':'model/gltf-binary','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.webp':'image/webp','.ktx2':'image/ktx2'};
const srv=http.createServer(function(rq,rs){const u=decodeURIComponent(rq.url.split('?')[0]);if(u.endsWith('sw.js')){rs.writeHead(404);return rs.end();}const f=path.join(root,u);
  fs.readFile(f,function(e,d){if(e){rs.writeHead(404);return rs.end();}
    if(/VERSION PRINCIPALE[\\/]index[.]html$/.test(f)){let t=d.toString('utf8');const i=t.indexOf('window.dbgJadeVue=function');if(i<0)console.log('CROCHET : ancre introuvable');else t=t.slice(0,i)+CROCHET+t.slice(i);d=Buffer.from(t,'utf8');}
    rs.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});rs.end(d);});}).listen(port,'127.0.0.1');
const udd=path.join(require('os').tmpdir(),'banc-uniques-jade-'+port);
const ch=spawn(process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--mute-audio','--autoplay-policy=user-gesture-required','--remote-debugging-port='+cdp,'--user-data-dir='+udd,'--no-first-run','--window-size=844,844','--enable-unsafe-swiftshader','about:blank'],{detached:true,stdio:'ignore'});
const fin=function(code){clearInterval(frais);try{process.kill(-ch.pid,'SIGKILL');}catch(e){}try{fs.rmSync(udd,{recursive:true,force:true});}catch(e){}srv.close();process.exit(code||0);};
process.on('SIGINT',function(){fin(1);});
const dodo=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
(async function(){let l=null;for(let i=0;i<240&&!l;i++){await dodo(500);try{l=await (await fetch('http://127.0.0.1:'+cdp+'/json')).json();if(!l.find(function(x){return x.type==='page';}))l=null;}catch(e){}}
  const pg=l.find(function(x){return x.type==='page';}),ws=new WebSocket(pg.webSocketDebuggerUrl);let id=0;const P={};let R=null;
  const call=function(m,p){return new Promise(function(r){const i=++id;P[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});};
  ws.onmessage=function(e){const m=JSON.parse(e.data);if(m.id&&P[m.id]){P[m.id](m.result);delete P[m.id];return;}if(!R)return;
    if(m.method==='Runtime.exceptionThrown'){const d=m.params.exceptionDetails;R.exc.push(((d.exception||{}).description||d.text||'').slice(0,600));}
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')R.con.push(m.params.args.map(function(a){return a.value||a.description;}).join(' ').slice(0,300));};
  await new Promise(function(r){ws.onopen=r;});await call('Runtime.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
  await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));localStorage.removeItem('cashcarRU');}catch(e){}"});
  const ev=async function(x,aw){const r=await call('Runtime.evaluate',{expression:x,awaitPromise:!!aw,returnByValue:true,timeout:600000});return r&&r.result?r.result.value:null;};
  const photo=async function(nom){const im=await call('Page.captureScreenshot',{format:'png'});if(im&&im.data){fs.writeFileSync(path.join(out,nom+'.png'),Buffer.from(im.data,'base64'));return nom+'.png';}return null;};
  for(const cas of CAS){
    const opt=function(k,d){const m=new RegExp('(?:^|&)'+k+'=([^&]*)').exec(cas);return m?m[1]:d;};
    const ESP=opt('carte','jade')==='espace',CARTE=ESP?'espace':'jade',pay=opt('pay','0')==='1',MAX=+opt('max','420'),ph=opt('photos','depart'),q=cas.replace(/(^|&)(pay|max|photos|carte)=[^&]*/g,'').replace(/^&/,'');
    R={cas:cas,format:pay?'844x390':'390x844',exc:[],con:[],photos:[],morts:[],t0:Date.now()};
    console.log('— cas',cas);
    await call('Emulation.setDeviceMetricsOverride',{width:pay?844:390,height:pay?390:844,deviceScaleFactor:2,mobile:true});await call('Emulation.setTouchEmulationEnabled',{enabled:true});
    await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/VERSION%20PRINCIPALE/index.html?intro=ancien&attente=0&prebati=0&chute=0&carte='+CARTE+'&tel=1&appareil=iPhone14,2&'+q});
    await dodo(3000);
    for(let i=0;i<200;i++){if(await ev('!!window.__gameReady'))break;await dodo(1500);}
    await dodo(3000);await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}})()");
    for(let i=0;i<80;i++){if(await ev('!!(window.dbgJouer&&window.dbgClassique&&window.__bancU)'))break;await dodo(500);}
    R.son=await ev("(function(){try{const s=JSON.parse(localStorage.getItem('cashcarSave'));return [s.sfx,s.mus,s.vox];}catch(e){return 'err';}})()");
    R.progMenu=await ev('__bancU.info()');
    const m9=(/(?:^|&)meteo=(\w+)/.exec(q)||[])[1];
    let ok=false;for(let k=0;k<3&&!ok;k++){await ev("try{dbgClassique('"+CARTE+"',"+(m9?"'"+m9+"'":'null')+");}catch(e){}dbgJouer()");
      for(let i=0;i<120&&!ok;i++){await dodo(250);ok=await ev('!!(window.dbgState&&dbgState().started&&dbgState().running&&'+(ESP?'__bancU.etat().id==="espace"':'__bancU.etat().piste==="jade"&&__bancU.etat().root')+'&&__bancU.etat().NP>1)');}}
    if(!ok){R.echec='départ dans Jade non obtenu';fs.writeFileSync(path.join(out,cas.replace(/[^a-z0-9=,]+/gi,'_')+'.json'),JSON.stringify(R,null,1));continue;}
    /* la vallée, relue tout de suite, le jeu en pause (à la fin de la course la vallée est rangée) */
    await ev('__bancU.pause()');
    if(ESP){R.orb=JSON.parse(await ev('(function(){try{return JSON.stringify({u:dbgOrbU(),voy:dbgVoyage(),mods:dbgMods()});}catch(e){return JSON.stringify("erreur "+e.message);}})()')||'null');
      R.endroit=await ev('(function(){const r=dbgRoute(),n=r.NP,ds=r.L/(n-1),f=function(a,b){let m=9;for(let i=Math.max(0,Math.round(a/ds));i<=Math.min(n-1,Math.round(b/ds));i++)m=Math.min(m,r.Nn[i].y);return +m.toFixed(2);};return {depart:f(0,300),arrivee:f(r.L-200,r.L),L:Math.round(r.L)};})()');}
    else{
        R.regle=JSON.parse(await ev('JSON.stringify(dbgJadeRegle())')||'null');
    R.audit=await ev('__bancU.couloir()');
    R.av=JSON.parse(await ev('(function(){try{const a=dbgJadeAv();return JSON.stringify({s:a.s,itin:a.itin,poses:(a.poses||[]).map(function(o){return [o.t||o.k,o.ok?1:0,o.raison||o.pourquoi||null,o.dy,o.s];}),refus:a.refus});}catch(e){return JSON.stringify("erreur "+e.message);}})()')||'null');
    R.deco=await ev('__bancU.deco()');
    R.jade=JSON.parse(await ev('(function(){try{const j=dbgJade();return JSON.stringify({triangles:j.triangles,appels:j.appels,montagnes:j.montagnes,ms:j.ms,err:j.err});}catch(e){return JSON.stringify("erreur "+e.message);}})()')||'null');
    R.jadeErr=await ev('window.__jadeErr?String(window.__jadeErr.stack||window.__jadeErr).slice(0,600):null');
    }
    /* la route qui se recoupe : deux points à plus de 150 m d'écart le long de la route, à moins d'une largeur de route en plan et à moins de 14 m en hauteur */
    R.recoupe=await ev(`(function(){const r=dbgRoute(),p=r.pts,n=r.NP,ds=r.L/(n-1),st=Math.max(1,Math.round(4/ds)),gap=Math.round(150/ds),G=new Map(),K=60,o=[];let pire=1e9;
      for(let i=0;i<n;i+=st){const k=Math.floor(p[i].x/K)*100003+Math.floor(p[i].z/K);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
      for(let i=0;i<n;i+=st){const bx=Math.floor(p[i].x/K),bz=Math.floor(p[i].z/K);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=G.get((bx+a)*100003+bz+b);if(!c)continue;
        for(const j of c){if(j<=i+gap)continue;const dh=Math.hypot(p[i].x-p[j].x,p[i].z-p[j].z),dy=Math.abs(p[i].y-p[j].y);if(dh<2*r.demi+4&&dy<pire)pire=dy;if(dh<2*r.demi+4&&dy<14&&o.length<8)o.push([Math.round(i*ds),Math.round(j*ds),Math.round(dh),Math.round(dy)]);}}}
      return {n:o.length,ex:o,dyMin:pire<1e9?Math.round(pire):null};})()`);
    /* les petits modules : où ils tombent, leurs heurts (règle d'or, couloir), une photo de chacun */
    const gg=(/pistegraine=(\d+)/.exec(q)||[])[1]||'x';
    const PETITS=['porte','arche','gorge','passerelles','bosse','toboggan','epingle','ile','remontee'];
    const AUD=R;R.petits=[];if(R.av&&R.av.s)for(const sc of R.av.s){if(PETITS.indexOf(sc[0])<0)continue;const [nom,s0,s1]=sc;
      const h=(R.regle&&R.regle.ex||[]).filter(function(x){return x[0]>=s0-10&&x[0]<=s1+10;}).length+(R.audit&&R.audit.couloir?R.audit.couloir.ex.filter(function(x){return x[0]>=s0-10&&x[0]<=s1+10;}).length:0);
      const e={nom:nom,s0:s0,s1:s1,heurts:h};
      if(ph==='petits'||ph==='tout'){const s=Math.round(s0+(s1-s0)*.35);await ev('dbgImmortel(true);dbgJadeAller('+Math.max(0,s-40)+')');await dodo(1800);await ev('dbgJadeVue(null,0,16)');await dodo(900);e.photo=await photo('module-'+nom+'-g'+gg+'-s'+s);
        await ev('dbgJadeAvVue('+s+',-150,70,90)');await dodo(900);e.photoLarge=await photo('module-'+nom+'-g'+gg+'-s'+s+'-large');}
      R.petits.push(e);}
    if(ph==='petits'||ph==='tout'){await ev('dbgImmortel(false);dbgJadeAller(0)');await dodo(300);}
    await ev('__bancU.reprend()');
    await ev('dbgAuto(1,0,{nit:0,vol:true,saut:0,latK:0})');
    R.progDepart=await ev('__bancU.info()');
    /* l'échantillonneur : chaque image (appels, triangles, écart), toutes les 100 ms (s, mode, caméra dans la roche) */
    await ev(`(function(){const R9=__bancU.rdr(),W=window.__echU={C:[],Tr:[],F:[],S:[],on:true,t0:performance.now()};R9.info.autoReset=false;R9.info.reset();let tp=performance.now(),tS=0;
      const pas=function(t){if(!W.on){R9.info.autoReset=true;return;}W.C.push(R9.info.render.calls);W.Tr.push(R9.info.render.triangles);W.F.push(t-tp);tp=t;R9.info.reset();
        if(t-tS>=100){tS=t;try{const r=dbgRoute(),st=dbgState();W.S.push([Math.round(t-W.t0),Math.round(r.s),r.mode,__bancU.roc(),st.gameOver?1:0,+r.lat.toFixed(1)]);}catch(e){}}
        requestAnimationFrame(pas);};requestAnimationFrame(pas);})()`);
    const tDep=Date.now();const NOMS=await ev('JSON.stringify(__bancU.fiche())');let fiche={};try{const f9=JSON.parse(NOMS);fiche={u:f9.u,sc:f9.a3&&f9.a3.scenes};}catch(e){}
    const g=(/pistegraine=(\d+)/.exec(q)||[])[1]||'x',ouv=ESP?(R.orb&&R.orb.u&&R.orb.u.der?R.orb.u.der.ouv:'ancien'):fiche.u?fiche.u.ouv:'ancien',m1=ESP?(R.orb&&R.orb.mods&&R.orb.mods[0]?R.orb.mods[0].fig:'?'):fiche.sc&&fiche.sc[0]||'?';
    const base=(ESP?'esp-':'')+(pay?'pay-':'')+'g'+g+'-'+ouv+'-'+m1+(opt('jsceneu')?'-force':'');
    for(const ts of [2,5,9]){while(Date.now()-tDep<ts*1000)await dodo(50);if(ph!=='0')R.photos.push(await photo(base+'-'+ts+'s'));}
    /* la course entière */
    const Lr=await ev('Math.round(dbgRoute().L)');R.L=Lr;let sMax=0;
    while(Date.now()-tDep<MAX*1000){await dodo(500);const st=await ev('(function(){const r=dbgRoute(),d=dbgState();return {s:r.s,mode:r.mode,go:d.gameOver,cause:r.cause,lat:r.lat,piste:__bancU.etat().piste,id:__bancU.etat().id};})()');if(!st)continue;
      if(st.s>sMax)sMax=st.s;
      if(st.go){R.morts.push({s:Math.round(st.s),cause:st.cause,mode:st.mode,lat:+(+st.lat).toFixed(1)});if(R.morts.length>20)break;const rep=Math.round(st.s)+80;if(rep>Lr-60)break;
        await ev('dbgAuto(0)');let v=false;for(let k=0;k<3&&!v;k++){await ev("try{dbgClassique('"+CARTE+"',"+(m9?"'"+m9+"'":'null')+");}catch(e){}dbgJouer()");for(let i=0;i<80&&!v;i++){await dodo(250);v=await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver&&'+(ESP?'__bancU.etat().id==="espace"':'__bancU.etat().piste==="jade"')+')');}}
        if(!v){R.echecReprise=1;break;}R.Lreprise=await ev('Math.round(dbgRoute().L)');await ev('dbgJadeAller('+rep+');dbgAuto(1,0,{nit:0,vol:true,saut:0,latK:0})');continue;}
      if(st.s>Lr-60||(ESP?st.id!=='espace':st.piste!=='jade'))break;}
    R.couvert=Math.round(sMax);R.duree=Math.round((Date.now()-tDep)/1000);
    const E=await ev('(function(){const W=window.__echU;W.on=false;return JSON.stringify({C:W.C,Tr:W.Tr,F:W.F,S:W.S});})()');let e9={};try{e9=JSON.parse(E);}catch(x){}
    const st9=function(a){const v=(a||[]).slice(10).sort(function(x,y){return x-y;}),n=v.length||1;return {n:v.length,moy:+(v.reduce(function(x,y){return x+y;},0)/n).toFixed(1),p50:v[Math.floor(n*.5)]||0,p95:v[Math.floor(n*.95)]||0,max:v[v.length-1]||0};};
    R.appels=st9(e9.C);R.triangles=st9(e9.Tr);R.ecarts=st9(e9.F);R.ips=+(1000/Math.max(1,R.ecarts.moy)).toFixed(1);
    const S=e9.S||[];R.camRoc=S.filter(function(x){return x[3]===1;}).map(function(x){return [x[0],x[1],x[2]];}).slice(0,20);R.nCamRoc=S.filter(function(x){return x[3]===1;}).length;R.nEchant=S.length;
    R.decolle=S.filter(function(x){return x[0]<6000&&x[2]==='fall';}).slice(0,5);R.vols=(function(){let n=0,pr=null;for(const x of S){if(x[2]==='fall'&&pr!=='fall')n++;pr=x[2];}return n;})();
    R.progFin=await ev('__bancU.info()');
    /* la vallée, relue (après la course : la caisse est à l'arrêt) */
    await ev('dbgAuto(0)');
    R.fiche=JSON.parse(await ev('JSON.stringify(__bancU.fiche())')||'{}');
    for(const e of R.petits)e.morts=R.morts.filter(function(m){return m.s>=e.s0-30&&m.s<=e.s1+30;}).length;
    R.temps=Math.round((Date.now()-R.t0)/1000);
    fs.writeFileSync(path.join(out,base+'.json'),JSON.stringify(R,null,1));
    console.log(JSON.stringify({cas:cas,orb:ESP&&R.orb&&R.orb.u&&R.orb.u.der?{ouv:R.orb.u.der.ouv,fin:R.orb.u.der.fin,rel:R.orb.u.der.rel,sil:R.orb.u.der.sil,cx:R.orb.u.der.cx,mods:(R.orb.mods||[]).map(function(m){return m.fig+'@'+m.s0;})}:undefined,endroit:R.endroit,u:R.fiche.u&&[R.fiche.u.ouv,R.fiche.u.cap,R.fiche.u.relief],sc:R.fiche.a3&&R.fiche.a3.scenes,exc:R.exc.length,jadeErr:!!R.jadeErr,regle:R.regle&&R.regle.heurts,couloir:R.audit&&R.audit.couloir&&R.audit.couloir.heurts,
      morts:R.morts.map(function(m){return [m.s,m.cause,m.mode];}),couvert:R.couvert+'/'+R.L,camRoc:R.nCamRoc+'/'+R.nEchant,decolle:R.decolle.length,recoupe:R.recoupe&&R.recoupe.n,appels:R.appels.moy+'/'+R.appels.p95,tri:R.triangles.moy+'/'+R.triangles.p95,ips:R.ips,
      prog:[R.progDepart&&R.progDepart.prog,R.progFin&&R.progFin.prog],geo:R.progFin&&R.progFin.geo,tex:R.progFin&&R.progFin.tex,deco:R.deco,petits:R.petits.map(function(x){return x.nom+':'+x.heurts+'/'+x.morts;})}));
  }
  fin(0);})().catch(function(e){console.log('ERR',e&&e.stack||e);fin(1);});
