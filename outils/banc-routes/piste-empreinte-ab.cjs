/* L'EMPREINTE DE LA PISTE BÂTIE, A/B (2026-11-14, la courbe vite touche la construction de TOUTES les maps) : deux onglets d'un Chrome muet (deux
   variantes d'URL, ou deux arbres), dbgTrace({carte, graine}) rebâtit la piste comme un changement de map, puis une empreinte FNV-1a des octets
   Float64 de pts, T, Nn, B (dbgRoute : les vecteurs du jeu, sans arrondi) et de L. Rend les empreintes par carte et graine et dit si elles sont égales.
   node outils/banc-routes/piste-empreinte-ab.cjs --a=http://127.0.0.1:8323 --qa=&sans=courbevite --b=http://127.0.0.1:8323 [--cartes=nuages,espace,ville,crypto,vitree,canyon,grotte,jade,dunes,banquise] [--graines=1-3] [--cdp=9526] [--verif=1 : dbgCourbeVite() après chaque piste (la courbe vite contre three, au bit près)] [--gen=1 : la génération seule, dbgGenRoute(carte, graine, 0) : empreinte de ctrl0 / ctrl] */
const path=require('path'),os=require('os'),fs=require('fs'),cp=require('child_process');
const {tueChrome,CDP,dormir}=require('../banc-trainees/cdp.cjs');
const o={};for(const a of process.argv.slice(2)){const m=/^--([^=]+)=(.*)$/.exec(a);if(m)o[m[1]]=m[2];}
const CARTES=(o.cartes||'nuages,espace,ville,crypto,vitree,canyon,grotte,jade,dunes,banquise').split(','),[g0,g1]=(o.graines||'1-3').split('-').map(Number),PORT=+(o.cdp||9526);
const U=(b,q)=>b+'/VERSION%20PRINCIPALE/index.html?colonne=0&intro=ancien&attente=0&prebati=0'+(q||'');
const EXPR=(c,g)=>o.verif?`(function(){dbgTrace({carte:${JSON.stringify(c)},graine:${g}});const v=dbgCourbeVite();return {h:v?('écarts '+v.ecarts+'/'+v.comparaisons+' '+v.ex.join(' ; ')):'?',NP:v&&v.points};})()`:o.gen?`(function(){const r=dbgGenRoute(${JSON.stringify(c)},${g},0);let h=2166136261>>>0;const f=new Float64Array(1),u=new Uint8Array(f.buffer);const m=function(x){f[0]=x;for(let i=0;i<8;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}};
  for(const p of r.ctrl0)for(const x of p)m(x);const h0=h.toString(16);for(const p of r.ctrl)for(const x of (Array.isArray(p)?p:[p.x,p.y,p.z]))m(x);const h1=h.toString(16);if(r.N)for(const p of r.N)for(const x of (Array.isArray(p)?p:[p.x,p.y,p.z]))m(x);return {h:h0+'/'+h1+'/'+h.toString(16),NP:r.ctrl.length,L:r.fiche&&r.fiche.L,carte:r.carte};})()`:`(function(){const r=dbgTrace({carte:${JSON.stringify(c)},graine:${g}});const R=dbgRoute();let h=2166136261>>>0;const f=new Float64Array(1),u=new Uint8Array(f.buffer);
  const m=function(x){f[0]=x;for(let i=0;i<8;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}};m(R.L);const hs=[];for(const A of [R.pts,R.T,R.Nn||R.N,R.B]){if(A)for(const v of A){m(v.x);m(v.y);m(v.z);}hs.push(h.toString(16));}
  return {h:hs.join('/'),NP:R.NP,L:+R.L.toFixed(2),carte:r.carte,graineOk:r.graineOk};})()`;
(async()=>{const prof=fs.mkdtempSync(path.join(os.tmpdir(),'pv-pempr-'));
  const ch=cp.spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+prof,'--no-first-run','--mute-audio','--use-angle=d3d11','--ignore-gpu-blocklist',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--window-size=1000,700','about:blank'],{stdio:'ignore',detached:true});
  for(let i=0;i<240;i++){await dormir(500);try{await (await fetch('http://127.0.0.1:'+PORT+'/json/version')).json();break;}catch(e){}}
  const pages=[];let egal=0,diff=0;try{
  for(const [base,q] of [[o.a,o.qa],[o.b,o.qb]]){const t=await (await fetch('http://127.0.0.1:'+PORT+'/json/new?about:blank',{method:'PUT'})).json();const c=new CDP(t.webSocketDebuggerUrl);await c.ok;
    await c.send('Page.enable');await c.send('Runtime.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
    await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
    await c.send('Page.navigate',{url:U(base,q)});pages.push(c);}
  for(const c of pages){let ok=false;for(let i=0;i<360&&!ok;i++){await dormir(500);try{await c.send('Page.bringToFront');ok=await c.ev('!!window.__gameReady&&typeof dbgTrace==="function"',120000);}catch(e){}}if(!ok)throw new Error('page pas prête');}
  await dormir(3000);console.log('A',U(o.a,o.qa),'\nB',U(o.b,o.qb));
  for(const c of CARTES)for(let g=g0;g<=g1;g++){const r=[];for(const p of pages){await p.send('Page.bringToFront');try{r.push(await p.ev(EXPR(c,g),180000));}catch(e){r.push({h:'erreur '+String(e.message).slice(0,80)});}}
    const ok=r[0].h===r[1].h;if(ok)egal++;else diff++;console.log(c.padEnd(9),'g'+g,ok?'=':'≠',r[0].h,r[1].h,'NP',r[0].NP,'L',r[0].L,'carte',r[0].carte,r[0].graineOk===false?'(graine pas prise)':'');}
  console.log('BILAN',egal,'égales ·',diff,'différentes');
  }finally{for(const c of pages)try{c.close();}catch(e){}tueChrome(ch);await dormir(800);try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}}})().catch(e=>{console.error(e);process.exit(1);});
