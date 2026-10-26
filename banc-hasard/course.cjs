// node course.cjs <site> <portHttp> <portChrome> <carte> [n=3] [meteo] — n traversées au pilote automatique (dbgAuto, sans nitro, il pilote aussi en vol)
// de la 1re map du JOUER imposée : morts (cause, abscisse, pièce), temps jusqu'au portail, erreurs JS (NON COMMITÉ)
const path=require('path'),fs=require('fs'),{serveur,chrome,tue,dort}=require('./cdp.cjs');
const [site,ph,pc,carte]=[process.argv[2]||'apres',+process.argv[3]||8637,+process.argv[4]||9637,process.argv[5]||'canyon'],N=+process.argv[6]||3,MET=process.argv[7]||'',GR=(process.argv[8]||'').split(',').filter(Boolean);
(async()=>{
  await serveur(path.join(__dirname,'site-'+site),ph);
  const c=await chrome(pc,{tmp:path.join(__dirname,'tmp'),w:844,h:390});
  const errs=[];c.ecoute.push(m=>{if(m.method==='Runtime.exceptionThrown')errs.push('EXC '+(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text).slice(0,300));
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push('error '+m.params.args.map(a=>a.value!=null?String(a.value):a.description||'').join(' ').slice(0,300));});
  await c.send('Runtime.enable');await c.send('Page.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
  await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{if(!sessionStorage.__cc){sessionStorage.__cc=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-LG',ok:1}});}}catch(e){}"});
  await c.send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:false});
  const clic=async(x,y)=>{for(const t of ['mousePressed','mouseReleased'])await c.send('Input.dispatchMouseEvent',{type:t,x,y,button:'left',clickCount:1});};
  const bilan=[];
  for(let k=0;k<N;k++){
    await c.send('Page.navigate',{url:'http://127.0.0.1:'+ph+'/index.html?colonne=0'+(GR[k]?'&pistegraine='+GR[k]:'')});
    let ok=false;for(let i=0;i<900&&!ok;i++){await dort(200);try{ok=await c.ev('!!window.__gameReady&&typeof window.dbgAuto==="function"&&!!window.__ev');}catch(e){}}
    if(!ok)throw new Error('le jeu ne démarre pas');
    for(let i=0;i<60;i++){const v=await c.ev("(function(){const e=document.getElementById('splash');if(!e)return 0;const s=getComputedStyle(e);return (s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)?0:1;})()");if(!v)break;await clic(422,195);await dort(700);}
    await dort(1500);
    await c.ev(`__ev("(function(){const o=explode;explode=function(c){(window.__morts=window.__morts||[]).push({c:c,s:Math.round(s),L:Math.round(L),carte:LVL.cur&&LVL.cur.carte,mode:mode,z:runStats.zones|0});return o.apply(this,arguments);};})()")`);
    await c.ev(`dbgClassique('${carte}',${MET?"'"+MET+"'":'null'})`);
    // JOUER : le plus petit élément visible dont le texte commence par JOUER (ou .mPlay)
    let fait=false;for(let i=0;i<20&&!fait;i++){const r=await c.ev(`(function(){let b=null,ba=1e12;for(const e of document.querySelectorAll('.mPlay,button,div,a,span')){const t=(e.textContent||'').trim();if(!/^JOUER/.test(t)&&!e.classList.contains('mPlay'))continue;const r=e.getBoundingClientRect();if(r.width<20||r.height<10)continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none')continue;const a=r.width*r.height;if(a<ba){ba=a;b=r;}}return b?[b.left+b.width/2,b.top+b.height/2]:null;})()`);
      if(r){await clic(r[0],r[1]);}
      for(let j=0;j<15;j++){await dort(200);if(await c.ev("document.body.classList.contains('play')||(window.dbgState&&dbgState().started)")){fait=true;break;}}}
    if(!fait){bilan.push({k,err:'pas de départ'});continue;}
    await c.ev("dbgAuto(1,0,{vol:true})");
    const t0=Date.now();let fin=null,z0=null,info=null,tz0=0;const ech=[];
    while(Date.now()-t0<240000){await dort(400);
      const st=await c.ev("(function(){const d=dbgState();return {s:d.s,v:d.vH,mode:d.mode,go:d.gameOver,started:d.started,z:__ev('runStats.zones|0'),carte:__ev('LVL.cur&&LVL.cur.carte'),L:__ev('Math.round(L)'),t:__ev('EVT.tRun'),morts:window.__morts||[]};})()");
      if(z0!=null&&st.z===z0)ech.push([Math.round(st.s),Math.round(st.v),+st.t.toFixed(1),st.mode]);
      if(z0==null&&st.carte===carte)tz0=st.t;
      if(z0==null&&st.carte===carte){z0=st.z;const D=carte==='canyon'?'dbgCanyon':'dbgDunes';info=await c.ev(`(function(){const d=${D}();return {hz:d.hz,L:d.L,sQ:d.sQ,ms:d.ms,meteo:__ev('LVL.cur.meteo')};})()`);}
      if(st.go||st.morts.length){fin={mort:st.morts[0]||{c:'?',s:st.s},t:(Date.now()-t0)/1000,derniers:ech.slice(-8)};break;}
      if(z0!=null&&st.z>z0){const tj=ech.length?ech[ech.length-1][2]-tz0:0;fin={passe:true,t:(Date.now()-t0)/1000,tJeu:+tj.toFixed(1),vMoy:Math.round((info&&info.L||0)/Math.max(1,tj)),carteSuivante:st.carte};break;}
      if(!st.started&&Date.now()-t0>20000){fin={err:'course arrêtée',st};break;}}
    if(!fin)fin={err:'délai',t:240};
    let piece=null;if(fin.mort&&info&&info.sQ){let best=null;for(const [q,v] of Object.entries(info.sQ))if(v<=fin.mort.s&&(!best||v>best[1]))best=[q,v];piece=best;}
    const lent=info&&info.sQ?(()=>{const P=Object.entries(info.sQ).sort((a,b)=>a[1]-b[1]);const par={};for(const e of ech){if(e[3]!=='drive')continue;let q='depart';for(const [k2,v] of P)if(v<=e[0])q=k2;(par[q]=par[q]||[]).push(e[1]);}return Object.fromEntries(Object.entries(par).map(([k2,v])=>[k2,Math.round(v.reduce((a,b)=>a+b,0)/v.length)]));})():null;
    const b={k,graine:GR[k]||null,lent,carte,meteo:info&&info.meteo,L:info&&info.L,axe:info&&info.hz&&info.hz.axe,pieces:info&&info.hz&&info.hz.p.map(q=>q[0]).join(' '),fin,piece,erreurs:errs.splice(0)};
    bilan.push(b);console.log(JSON.stringify(b));
  }
  fs.writeFileSync(path.join(__dirname,'course-'+site+'-'+carte+'.json'),JSON.stringify(bilan,null,1));
  tue();process.exit(0);
})().catch(e=>{console.error(e);tue();process.exit(1);});
