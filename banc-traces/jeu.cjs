// BANC EN JEU (pas commité) : node jeu.cjs <dossier servi> <tâche> [args…]
//   construit <carte> [n=10] [palier=0]     → n constructions dbgTrace({carte,graine,palier}), la règle d'or, les temps, les erreurs JS
//   course <carte> <météo> [graine]          → JOUER, pilote dbgAuto jusqu'au 1er portail (ou la mort, ou 150 s), erreurs JS, durée
//   vue <carte> <météo> <sortie.jpg> [graine] → une vue du ciel de la piste entière (photo)
// Son coupé (--mute-audio + sauvegarde muette), auto-école passée, service worker contourné. Ports à soi, vérifiés libres ; tout est tué à la fin.
const http=require('http'),fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os'),net=require('net');
const [,,DIR,TACHE,...ARGS]=process.argv;
const PH=+(process.env.PH||9611),PC=+(process.env.PC||9612),CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.wasm':'application/wasm','.webmanifest':'application/manifest+json','.glb':'model/gltf-binary','.bin':'application/octet-stream'};
const libre=p=>new Promise(r=>{const s=net.createServer().once('error',()=>r(false)).once('listening',()=>s.close(()=>r(true))).listen(p,'127.0.0.1');});
const dodo=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
  if(!(await libre(PH))||!(await libre(PC)))throw new Error('port pris : '+PH+'/'+PC+' (un autre banc ?)');
  const racine=path.resolve(DIR);
  const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(racine,u);
    if(!f.startsWith(racine)){r.writeHead(403);return r.end();}fs.stat(f,(e,st)=>{if(e||!st.isFile()){r.writeHead(404);return r.end();}
      r.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(f).pipe(r);});}).listen(PH,'127.0.0.1');
  const prof=fs.mkdtempSync(path.join(os.tmpdir(),'banc-hasard-'));
  const ch=cp.spawn(CHROME,['--headless=new','--remote-debugging-port='+PC,'--user-data-dir='+prof,'--mute-audio','--no-first-run','--autoplay-policy=no-user-gesture-required','--window-size=1280,720','about:blank'],{stdio:'ignore',detached:true});
  const fin=()=>{try{process.kill(-ch.pid);}catch(e){}try{srv.close();}catch(e){}try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}};
  process.on('exit',fin);process.on('SIGINT',()=>{fin();process.exit(1);});
  try{
    let tabs=null;for(let i=0;i<120&&!tabs;i++){await dodo(500);try{tabs=await (await fetch('http://127.0.0.1:'+PC+'/json/list')).json();}catch(e){}}
    if(!tabs)throw new Error('Chrome ne répond pas');
    const tab=tabs.find(t=>t.type==='page');const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
    let id=0;const att=new Map(),erreurs=[];
    ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&att.has(d.id)){att.get(d.id)(d);att.delete(d.id);return;}
      if(d.method==='Runtime.exceptionThrown'){const x=d.params.exceptionDetails;erreurs.push('EXC '+(x.exception&&x.exception.description||x.text).split('\n').slice(0,3).join(' | '));}
      if(d.method==='Runtime.consoleAPICalled'&&(d.params.type==='error'||d.params.type==='warning')){const t=d.params.args.map(a=>a.value!=null?String(a.value):(a.description||'')).join(' ');erreurs.push(d.params.type.toUpperCase()+' '+t.slice(0,300));}
      if(d.method==='Log.entryAdded'&&d.params.entry.level==='error'){erreurs.push('LOG '+(d.params.entry.text||'').slice(0,200)+' '+(d.params.entry.url||''));}};
    const send=(method,params)=>new Promise(r=>{const i=++id;att.set(i,r);ws.send(JSON.stringify({id:i,method,params:params||{}}));});
    const ev=async(x,t)=>{const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true,timeout:t||60000});if(r.result&&r.result.exceptionDetails)return {__err:r.result.exceptionDetails.exception&&r.result.exceptionDetails.exception.description};return r.result&&r.result.result?r.result.result.value:undefined;};
    await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');await send('Network.setBypassServiceWorker',{bypass:true});await send('Network.setCacheDisabled',{cacheDisabled:true});
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
    const SAVE={v:2,sfx:false,mus:false,vox:false,tuto:1,permis:1,facile:0,ex:{runs:5},plq:{m:'fr',x:'CC-161-LG',ok:1}};
    await send('Page.addScriptToEvaluateOnNewDocument',{source:'try{if(!sessionStorage.getItem("bancSave")){localStorage.setItem("cashcarSave",'+JSON.stringify(JSON.stringify(SAVE))+');sessionStorage.setItem("bancSave","1");}}catch(e){}'});
    const charge=async(q)=>{await send('Page.navigate',{url:'http://127.0.0.1:'+PH+'/index.html?colonne=0&simu=1'+(q||'')});
      for(let i=0;i<240;i++){await dodo(500);if(await ev("typeof dbgState==='function'&&!!window.__gameReady&&!!document.querySelector('[data-m=\"play\"]')"))break;}await dodo(1500);};
    const sortie={tache:TACHE,args:ARGS};
    if(TACHE==='construit'){const carte=ARGS[0],n=+(ARGS[1]||10),pal=+(ARGS[2]||0);await charge('');const res=[];
      for(let g=1;g<=n;g++){const gr=1000+g*7919;erreurs.length=0;const t0=Date.now();
        const r=await ev("(function(){var t=performance.now();var o=dbgTrace({carte:'"+carte+"',graine:"+gr+",palier:"+pal+"});return {ms:Math.round(performance.now()-t),L:Math.round(o&&o.L||0),niv:dbgClassique().niveau}})()",120000);
        // le décor finit en tranches pendant les images : on attend qu'il soit prêt
        let pr=null;for(let i=0;i<240;i++){await dodo(250);pr=await ev(carte==='volcan'?"(function(){var v=dbgVolcan();return {pret:v.pret,ms:v.ms,msTot:v.msTot,msFile:v.msFile,n:v.n,conflits:v.conflits,hasard:v.hasard,L:v.L}})()":"(function(){var v=dbgGrotte();return {pret:v.pret,ms:v.ms,msCreuse:v.msCreuse,msFile:v.msFile,tm:v.tm,n:v.n,hasard:v.hasard,salles:v.salles,spi:v.spi,lac:v.lac,eau:v.eau}})()");if(pr&&pr.pret)break;}
        const test=await ev(carte==='volcan'?"dbgVolcan('test')":"dbgGrotte('test')",120000);
        const le=await ev("window.__loopErr?String(window.__loopErr):null");
        res.push({graine:gr,trace:r,decor:pr,test:test,loopErr:le,erreurs:erreurs.slice(),s:Math.round((Date.now()-t0)/100)/10});
        console.log(JSON.stringify(res[res.length-1]).slice(0,900));}
      sortie.res=res;}
    else if(TACHE==='course'){const carte=ARGS[0],met=ARGS[1],gr=ARGS[2];await charge('&carte='+carte+'&meteo='+met+(gr?'&pistegraine='+gr:''));erreurs.length=0;
      await ev("document.querySelector('[data-m=\"play\"]').click()");
      let ok=false;for(let i=0;i<400;i++){await dodo(100);const st=await ev("(function(){var s=dbgState();return document.body.classList.contains('play')||(s.started&&!s.gameOver)})()");if(st){await ev("dbgAuto(1,0,{})");ok=true;break;}}
      const t0=Date.now(),L0=await ev("dbgDuree().L"),z0=await ev("dbgDuree().zone"),niv0=await ev("JSON.stringify(dbgClassique().niveau)"),info0=await ev(carte==='volcan'?"JSON.stringify(dbgVolcan().hasard)":"JSON.stringify(dbgGrotte().hasard)");
      let fin='temps',last=null;for(let i=0;i<1500;i++){await dodo(100);last=await ev("(function(){var s=dbgState(),d=dbgDuree();return {go:s.gameOver,mode:s.mode,s:Math.round(s.s),zone:d.zone,L:d.L,vH:s.vH,pal:d.palier}})()");if(process.env.SUIVI&&i%10===0)console.log('t',Math.round((Date.now()-t0)/100)/10,JSON.stringify(last));
        if(!last||last.__err)continue;if(last.go){fin='mort';break;}if(last.zone!==z0){fin='portail';break;}if((Date.now()-t0)>150000)break;}
      const sec=Math.round((Date.now()-t0)/100)/10,cause=await ev("(document.querySelector('#mDead')&&document.querySelector('#mDead').innerText||'').slice(0,160)"),le=await ev("window.__loopErr?String(window.__loopErr):null");
      sortie.res={depart:ok,fin,sec,L0,vMoy:Math.round(L0/sec),dernier:last,niveau:niv0,hasard:info0,cause:fin==='mort'?cause:null,loopErr:le,erreurs:erreurs.slice()};console.log(JSON.stringify(sortie.res));}
    else if(TACHE==='vue'){const carte=ARGS[0],met=ARGS[1],pref=ARGS[2],gr=ARGS[3];await charge('&carte='+carte+'&meteo='+met+(gr?'&pistegraine='+gr:''));
      await ev("document.querySelector('[data-m=\"play\"]').click()");for(let i=0;i<400;i++){await dodo(100);if(await ev("document.body.classList.contains('play')"))break;}
      await ev("dbgAuto(1,0,{})");await dodo(+(process.env.T9||9000));
      const CACHE="(function(){var g=null;document.querySelectorAll('body>canvas').forEach(function(x){if(!g||x.width*x.height>g.width*g.height)g=x;});g.id=g.id||'ccGL';var s=document.getElementById('cc-nu');if(!s){s=document.createElement('style');s.id='cc-nu';document.body.appendChild(s);}s.textContent='body>*:not(#'+g.id+'){opacity:0!important;transition:none!important}';})()";
      const prise=async(nom)=>{await ev(CACHE);await dodo(400);const r=await send('Page.captureScreenshot',{format:'jpeg',quality:84});fs.writeFileSync(pref+'-'+nom+'.jpg',Buffer.from(r.result.data,'base64'));};
      await prise('course');const info=await ev(carte==='volcan'?"JSON.stringify(dbgVolcan().hasard)":"JSON.stringify(dbgGrotte().hasard)");
      const V=carte==='volcan'?[['volcan',"dbgVolcan('volcan',{d:320,h:170,fov:62})"]]:[['puits',"dbgGrotte('puits')"],['lave',"dbgGrotte('salle',{k:'lave'})"],['luxe',"dbgGrotte('salle',{k:'luxe'})"]];
      const r9={};for(const [nom,x] of V){r9[nom]=await ev(x);await dodo(900);await prise(nom);}
      sortie.res={info,vues:r9,erreurs:erreurs.filter(e=>!/dark-triad/.test(e))};console.log(JSON.stringify(sortie.res).slice(0,600));}
    else if(TACHE==='mise'){const mode=ARGS[0],carte=ARGS[1],met=ARGS[2],out=ARGS[3];
      const dim=mode==='debout'?[390,844]:mode==='couche'?[844,390]:[1280,800];await send('Emulation.setDeviceMetricsOverride',{width:dim[0],height:dim[1],deviceScaleFactor:1,mobile:false});
      await send('Page.navigate',{url:'http://127.0.0.1:'+PH+'/index.html'+(mode==='cadre'?'?simu=1':'?colonne=0&simu=1')});
      const W=mode==='cadre'?"(document.querySelector('iframe')&&document.querySelector('iframe').contentWindow)":"window";
      for(let i=0;i<240;i++){await dodo(500);if(await ev("(function(){var w="+W+";return !!(w&&typeof w.dbgState==='function'&&w.__gameReady&&w.document.querySelector('[data-m=\"play\"]'))})()"))break;}await dodo(1500);
      erreurs.length=0;await ev("(function(){var w="+W+";w.dbgClassique('"+carte+"','"+met+"');w.document.querySelector('[data-m=\"play\"]').click();})()");
      let ok=false;for(let i=0;i<300;i++){await dodo(100);if(await ev("(function(){var w="+W+";return w.document.body.classList.contains('play')})()")){await ev(W+".dbgAuto(1,0,{})");ok=true;break;}}
      await dodo(10000);const st=await ev("(function(){var w="+W+";var s=w.dbgState();return {started:s.started,go:s.gameOver,mode:s.mode,s:Math.round(s.s),niv:w.dbgClassique().niveau.carte,loop:w.__loopErr?String(w.__loopErr):null}})()");
      const r=await send('Page.captureScreenshot',{format:'jpeg',quality:70});fs.writeFileSync(out,Buffer.from(r.result.data,'base64'));
      sortie.res={mode,carte,depart:ok,etat:st,erreurs:erreurs.filter(e=>!/dark-triad|navigator.vibrate/.test(e))};console.log(JSON.stringify(sortie.res).slice(0,500));}
    else if(TACHE==='page'){await send('Emulation.setDeviceMetricsOverride',{width:1240,height:900,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:'+PH+'/'+ARGS[0]});await dodo(3000);
      for(const [k,y] of [[0,0],[1,1500],[2,3600],[3,6200]]){await ev('window.scrollTo(0,'+y+')');await dodo(500);const r=await send('Page.captureScreenshot',{format:'jpeg',quality:60});fs.writeFileSync(ARGS[1]+'-'+k+'.jpg',Buffer.from(r.result.data,'base64'));}
      sortie.res={h:await ev('document.body.scrollHeight'),imgs:await ev("[...document.images].filter(i=>!i.complete||!i.naturalWidth).length")};console.log(JSON.stringify(sortie.res));}
    fs.writeFileSync(path.join(__dirname,'sortie-'+TACHE+'-'+(ARGS[0]||'')+'.json'),JSON.stringify(sortie,null,1));
  }finally{fin();}
}
main().then(()=>process.exit(0),e=>{console.error('ÉCHEC',e&&e.stack||e);process.exit(1);});
