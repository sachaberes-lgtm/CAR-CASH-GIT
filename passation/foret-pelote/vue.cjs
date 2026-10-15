/* vue.cjs — photos de la forêt-pelote : node vue.cjs <dossier VERSION PRINCIPALE> <sortie> [meteo] [graine]
   Une seule passe, muette, au banc commun (cc-banc/lib.cjs). */
const fs=require('fs'),path=require('path'),http=require('http');
const RACINE=path.resolve(process.argv[2]),OUT=process.argv[3],METEO=process.argv[4]||'midi',GRAINE=process.argv[5]!=null?+process.argv[5]:null;
fs.mkdirSync(OUT,{recursive:true});
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
    br=await P.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:240000,
      args:['--mute-audio','--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
    const ctx=await br.createBrowserContext(),page=await ctx.newPage();try{await page.setBypassServiceWorker(true);}catch(_){}
    await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
    await page.evaluateOnNewDocument(PREP);
    const errs=[];page.on('pageerror',e=>errs.push(String(e&&e.message||e).slice(0,300)));
    page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push('console '+m.type()+': '+m.text().slice(0,200));});
    page.goto(`http://127.0.0.1:${PORT}/index.html?carte=foret&meteo=${METEO}&colonne=0`,{waitUntil:'load',timeout:180000}).catch(()=>{});
    await page.waitForFunction(()=>!!window.__gameReady,{timeout:300000,polling:500});await sleep(2500);
    if(GRAINE!=null){const r=await page.evaluate((g)=>{const t=window.dbgTrace({carte:'foret',meteo:null,graine:g,pas:20});return {L:t.L,ok:t.graineOk};},GRAINE);console.log('graine',GRAINE,JSON.stringify(r));}
    const tap=async sel=>{const h=await page.$(sel);if(!h)return false;const b=await h.boundingBox();if(!b)return false;await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);return true;};
    for(let k=0;k<3;k++){if(await page.evaluate(()=>{const s=document.getElementById('splash');return !!(s&&s.isConnected&&getComputedStyle(s).display!=='none');}))await tap('#splash');await sleep(3000);}
    let ok=false;for(let k=0;k<5&&!ok;k++){await tap('.mPlay');await sleep(5000);ok=await page.evaluate(()=>{const s=window.dbgState&&window.dbgState();return !!(s&&s.started&&!s.gameOver);});}
    if(!ok){await page.screenshot({path:path.join(OUT,'KO.jpg'),type:'jpeg'});throw new Error('partie non lancée');}
    await sleep(6000);
    await page.screenshot({path:path.join(OUT,METEO+'-0-course.jpg'),type:'jpeg',quality:80});
    const ST=await page.evaluate(()=>window.dbgForet());
    const FL=await page.evaluate(()=>window.dbgForet('flanc'));
    if(!FL)throw new Error('pas de forêt bâtie');
    console.log('FORET',JSON.stringify({ms:ST.ms,msSol:ST.msSol,n:ST.n,tri:ST.tri,geants:ST.geants,col:ST.col,pel:ST.pel,noeuds:ST.noeuds,marge:FL.marge,L:FL.L}));
    console.log('familles',JSON.stringify(ST.parFam));
    fs.writeFileSync(path.join(OUT,'flanc.json'),JSON.stringify(FL));
    const N9=FL.pts.length,Pt=FL.pts;
    // un croisement : deux points à < 40 m en plan, ≥ 300 m de route entre eux, ≥ 30 m d'écart vertical
    let cr=null;for(let i=0;i<N9&&!cr;i++)for(let j=i+15;j<N9;j++){const a=Pt[i],b=Pt[j];if(Math.hypot(a[0]-b[0],a[2]-b[2])<40&&Math.abs(a[1]-b[1])>30){cr=a[1]<b[1]?[i,j]:[j,i];break;}}
    const vues=[];
    {const no=ST.noeuds[0]||[Pt[0][0],Pt[0][2]];let ym=0;for(const q of Pt)ym+=q[1];ym/=N9;
     vues.push(['1-noeud-ciel',[no[0]-520,ym+380,no[1]-520],[no[0],ym-60,no[1]]]);
     const nf=ST.noeuds[ST.noeuds.length-1]||no;vues.push(['6-loin',[no[0]-1500,ym+700,no[1]-1500],[(no[0]+nf[0])/2,ym-100,(no[1]+nf[1])/2]]);}
    if(cr){const lo=Pt[cr[0]],hi=Pt[cr[1]],k=Math.max(0,cr[0]-6),q=Pt[k];
      vues.push(['2-croisement-dessous',[q[0],q[1]+9,q[2]],[hi[0],hi[1]-5,hi[2]]]);
      const k2=Math.max(0,cr[1]-3),q2=Pt[k2];vues.push(['3-croisement-dessus',[q2[0],q2[1]+10,q2[2]],[lo[0],lo[1],lo[2]]]);}
    for(const [nom,u] of [['4-route',.3],['5-route',.62]]){const i=Math.round(u*(N9-1)),q=Pt[i],tx=q[3],tz=q[4],hl=Math.hypot(tx,tz)||1,j=Math.min(N9-1,i+7);
      vues.push([nom,[q[0]-tx/hl*40,q[1]+10,q[2]-tz/hl*40],[Pt[j][0],Pt[j][1]+4,Pt[j][2]]]);}
    for(const [nom,P9,C9] of vues){for(let r=0;r<3;r++){await page.evaluate((P,C)=>window.dbgForet('vue',{p:P,c:C,fov:64}),P9,C9);await sleep(700);}
      await page.screenshot({path:path.join(OUT,METEO+'-'+nom+'.jpg'),type:'jpeg',quality:80});}
    console.log('erreurs',JSON.stringify(errs.slice(0,8)),'loopErr',await page.evaluate(()=>String(window.__loopErr||'')),'foretErr',await page.evaluate(()=>String(window.__foretErr||'')));
  }finally{try{if(br)await br.close();}catch(_){}B._verrou.rend();clearTimeout(coupe);srv.close();}
})().catch(e=>{console.error('ERREUR',e.message);process.exit(1);});
