/* sauts.cjs — rejoue DANS LE JEU les sauts du banc raccourcis, avec ou sans les arbres (troncs, cimes, sous-bois).
   node sauts.cjs <dossier VERSION PRINCIPALE> [meteo] [graines a,b] — une passe muette au banc commun (sim-page.js à côté). */
const fs=require('fs'),path=require('path'),http=require('http');
const RACINE=path.resolve(process.argv[2]),METEO=process.argv[3]||'midi',GRAINES=(process.argv[4]||'').split(',').filter(Boolean).map(Number);
const SIM=fs.readFileSync(path.join(__dirname,'sim-page.js'),'utf8');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.m4a':'audio/mp4','.woff2':'font/woff2','.glb':'model/gltf-binary','.webmanifest':'application/manifest+json'};
const PREP=`(function(){try{localStorage.cashcarSave=JSON.stringify({v:2,tuto:1,permis:1,sfx:false,vox:false,mus:false,vol:0});localStorage.ccLang='fr';}catch(_){}
  try{Object.defineProperty(document,'hidden',{get:function(){return false;}});Object.defineProperty(document,'visibilityState',{get:function(){return 'visible';}});}catch(_){}
  try{HTMLMediaElement.prototype.play=function(){try{this.muted=true;this.volume=0;}catch(_){}return Promise.resolve();};}catch(_){}
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC){AC.prototype.resume=function(){return Promise.resolve();};}}catch(_){}})();`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const p=path.join(RACINE,u);
    if(!p.startsWith(RACINE)){r.writeHead(403);return r.end();}
    fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':TYPES[path.extname(p).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});r.end(b);});});
  await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));const PORT=srv.address().port;
  process.env.CC_QUI=process.env.CC_QUI||'FORET-PERDUE';
  const B=require('C:/Users/sacha/cc-banc/lib.cjs'),P=require('C:/Users/sacha/Desktop/projet-161/node_modules/puppeteer-core');
  await B._verrou.prend();console.log('créneau pris');
  const coupe=setTimeout(()=>{console.error('KO 8 min');try{B._verrou.rend();}catch(_){}process.exit(1);},8*60e3);
  let br=null;
  try{
    br=await P.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:300000,
      args:['--mute-audio','--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
    const ctx=await br.createBrowserContext(),page=await ctx.newPage();try{await page.setBypassServiceWorker(true);}catch(_){}
    await page.setViewport({width:200,height:430,deviceScaleFactor:1,isMobile:true,hasTouch:true});
    await page.evaluateOnNewDocument(PREP);
    const errs=[];page.on('pageerror',e=>errs.push(String(e&&e.message||e).slice(0,300)));
    page.goto(`http://127.0.0.1:${PORT}/index.html?carte=foret&meteo=${METEO}&colonne=0`,{waitUntil:'load',timeout:180000}).catch(()=>{});
    await page.waitForFunction(()=>!!window.__gameReady,{timeout:300000,polling:500});await sleep(2500);
    const tap=async sel=>{const h=await page.$(sel);if(!h)return false;const b=await h.boundingBox();if(!b)return false;await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);return true;};
    for(let k=0;k<3;k++){if(await page.evaluate(()=>{const s=document.getElementById('splash');return !!(s&&s.isConnected&&getComputedStyle(s).display!=='none');}))await tap('#splash');await sleep(3000);}
    let ok=false;for(let k=0;k<5&&!ok;k++){await tap('.mPlay');await sleep(5000);ok=await page.evaluate(()=>{const s=window.dbgState&&window.dbgState();return !!(s&&s.started&&!s.gameOver);});}
    if(!ok)throw new Error('partie non lancée');
    const essai=async(lib)=>{
      await page.evaluate(()=>window.dbgForet('vue',{p:[0,5000,0],c:[0,0,0]})); // (en pause)
      const r=await page.evaluate((SIM)=>{
        const FACT_VIT=[1],VOLANTS=[-1,-.5,0,.5,1],PAS_DECOL=12,T_MAX=5.5,H_DEPART=.45,GAIN_MIN=60,GAIN_RENTABLE=150,ANG_PROPRE=55,deg=r=>r*180/Math.PI,HP=[0,0,0];let HEURT=false;
        const tr=window.dbgTrace({pas:2});
        const f=new Function('tr','HEURT','HP','FACT_VIT','VOLANTS','PAS_DECOL','T_MAX','H_DEPART','GAIN_MIN','GAIN_RENTABLE','ANG_PROPRE','deg',SIM+'\nreturn raccourcis(tr);');
        const t0=performance.now(),sans=f(tr,false,HP,FACT_VIT,VOLANTS,PAS_DECOL,T_MAX,H_DEPART,GAIN_MIN,GAIN_RENTABLE,ANG_PROPRE,deg),t1=performance.now();
        const avec=f(tr,true,HP,FACT_VIT,VOLANTS,PAS_DECOL,T_MAX,H_DEPART,GAIN_MIN,GAIN_RENTABLE,ANG_PROPRE,deg),t2=performance.now();
        const st=window.dbgForet();
        return {L:Math.round(tr.L),pel:st.pel,geants:st.geants,ms:st.ms,msSol:st.msSol,tri:st.tri,
          sans:{racc:sans.rentables,km:+sans.rentablesKm.toFixed(2),pieges:sans.pieges,poses:sans.stat.pose,traj:sans.stat.trajectoires},
          avec:{racc:avec.rentables,km:+avec.rentablesKm.toFixed(2),pieges:avec.pieges,poses:avec.stat.pose,arbre:avec.stat.arbre||0,traj:avec.stat.trajectoires},
          top:avec.top.slice(0,5).map(g=>[Math.round(g.sDecol[0]),Math.round(g.sPose),Math.round(g.gainMax),Math.round(g.chute)]),msSim:[Math.round(t1-t0),Math.round(t2-t1)]};},SIM);
      console.log(lib,JSON.stringify(r));};
    await essai('partie');
    for(const g of GRAINES){await page.evaluate((g)=>window.dbgTrace({carte:'foret',meteo:null,graine:g,pas:20}),g);await sleep(500);await essai('graine '+g);}
    console.log('erreurs',JSON.stringify(errs.slice(0,8)),'loopErr',await page.evaluate(()=>String(window.__loopErr||'')));
  }finally{try{if(br)await br.close();}catch(_){}B._verrou.rend();clearTimeout(coupe);srv.close();}
})().catch(e=>{console.error('ERREUR',e.message);process.exit(1);});
