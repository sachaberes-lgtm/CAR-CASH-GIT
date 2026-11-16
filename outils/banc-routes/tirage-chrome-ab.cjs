/* LE TIRAGE A/B EN CHROME (2026-11-14, optimisation de la ville) : deux onglets d'UN Chrome muet (deux arbres servis par banc-maps/serveur.cjs), le temps de
   dbgGenRoute(carte, graine, palier).ms (la génération seule, comme pisteRoute) ALTERNÉ onglet par onglet, graine par graine, sur plusieurs tours : la machine
   partagée bruite pareil les deux côtés. Médianes et moyennes par carte et palier.
   node outils/banc-routes/tirage-chrome-ab.cjs --a=http://127.0.0.1:8324 --b=http://127.0.0.1:8323 [--qa=&sans=…] [--qb=…] [--cartes=ville,crypto] [--paliers=0,10,20] [--graines=1-12] [--tours=3] [--cdp=9526] [--trace=1 : la piste ET son décor rebâtis (dbgTrace, comme un changement de map) au lieu de la génération seule] */
const path=require('path'),os=require('os'),fs=require('fs');
const {tueChrome,CDP,dormir}=require('../banc-trainees/cdp.cjs'),cp=require('child_process');
const lanceChrome=async function(port,prof){ /* les drapeaux du banc des maps : pas d'étranglement des onglets en arrière-plan (deux onglets tournent) */
  const ch=cp.spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+prof,'--no-first-run','--mute-audio','--use-angle=d3d11','--ignore-gpu-blocklist',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--window-size=1000,700','about:blank'],{stdio:'ignore',detached:true});
  for(let i=0;i<240;i++){await dormir(500);try{await (await fetch('http://127.0.0.1:'+port+'/json/version')).json();return {ch};}catch(e){}}throw new Error('Chrome ne répond pas');};
const o={};for(const a of process.argv.slice(2)){const m=/^--([^=]+)=(.*)$/.exec(a);if(m)o[m[1]]=m[2];}
const CARTES=(o.cartes||'ville,crypto').split(','),PAL=(o.paliers||'0,10,20').split(',').map(Number),[g0,g1]=(o.graines||'1-12').split('-').map(Number),TOURS=+(o.tours||3);
const U=(b,q)=>b+'/VERSION%20PRINCIPALE/index.html?colonne=0&intro=ancien&attente=0&prebati=0'+(q||'');
(async()=>{const prof=fs.mkdtempSync(path.join(os.tmpdir(),'pv-tirage-'));const {ch,pg}=await lanceChrome(+(o.cdp||9526),prof,1000,700);
  const pages=[];try{
  for(const [base,q] of [[o.a,o.qa],[o.b,o.qb]]){const t=await (await fetch('http://127.0.0.1:'+(o.cdp||9526)+'/json/new?about:blank',{method:'PUT'})).json();const c=new CDP(t.webSocketDebuggerUrl);await c.ok;
    await c.send('Page.enable');await c.send('Runtime.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
    await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
    await c.send('Page.navigate',{url:U(base,q)});pages.push(c);}
  for(const c of pages){let ok=false;for(let i=0;i<360&&!ok;i++){await dormir(500);try{await c.send('Page.bringToFront');ok=await c.ev('!!window.__gameReady&&typeof dbgGenRoute==="function"',120000);}catch(e){}}if(!ok)throw new Error('page pas prête');}
  await dormir(3000);
  const T={};
  for(let r=0;r<TOURS;r++)for(const carte of CARTES)for(const p of PAL)for(let g=g0;g<=g1;g++){const ord=(g+r)%2?[0,1]:[1,0];
    for(const k of ord){await pages[k].send('Page.bringToFront');const ms=await pages[k].ev(o.trace?'(function(){const t0=performance.now();dbgTrace({carte:'+JSON.stringify(carte)+',graine:'+g+',palier:'+p+'});return performance.now()-t0;})()':'dbgGenRoute('+JSON.stringify(carte)+','+g+','+p+').ms',180000);const key=carte+' p'+p;(T[key]||(T[key]=[[],[]]))[k].push(ms);}}
  const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1];},moy=a=>a.reduce((x,y)=>x+y,0)/a.length;
  console.log('A',U(o.a,o.qa),'\nB',U(o.b,o.qb),'\ngraines',g0+'-'+g1,'×',TOURS,'tours (alternés)');let sa=0,sb=0;
  for(const k in T){const [a,b]=T[k];sa+=moy(a);sb+=moy(b);console.log(k.padEnd(10),'médiane A',med(a).toFixed(1),'B',med(b).toFixed(1),'ms · moyenne A',moy(a).toFixed(1),'B',moy(b).toFixed(1),'ms (B/A',(moy(b)/moy(a)).toFixed(2)+')');}
  console.log('TOUT : moyenne A',(sa/Object.keys(T).length).toFixed(1),'B',(sb/Object.keys(T).length).toFixed(1),'ms');
  }finally{for(const c of pages)try{c.close();}catch(e){}tueChrome(ch);await dormir(800);try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}}})().catch(e=>{console.error(e);process.exit(1);});
