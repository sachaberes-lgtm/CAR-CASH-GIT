// node fumee.cjs <site> <portHttp> <portChrome> [carte] — la fumée d'avant push : couché (844×390), debout (390×844), le cadre de l'ordi (1280×800) :
// menu → JOUER (la map imposée si donnée) → 12 s de course au pilote, sans erreur JS (NON COMMITÉ)
const path=require('path'),{serveur,chrome,tue,dort}=require('./cdp.cjs');
const [site,ph,pc,carte]=[process.argv[2]||'apres',+process.argv[3]||8637,+process.argv[4]||9637,process.argv[5]||''];
const CAS=[['couché',844,390,'?colonne=0'],['debout',390,844,'?colonne=0'],['cadre',1280,800,'']];
(async()=>{
  await serveur(path.join(__dirname,'site-'+site),ph);
  const c=await chrome(pc,{tmp:path.join(__dirname,'tmp'),w:1280,h:800});
  const errs=[];c.ecoute.push(m=>{if(m.method==='Runtime.exceptionThrown')errs.push('EXC '+(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text).slice(0,300));
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push('error '+m.params.args.map(a=>a.value!=null?String(a.value):a.description||'').join(' ').slice(0,300));});
  await c.send('Runtime.enable');await c.send('Page.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
  await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{if(!sessionStorage.__cc){sessionStorage.__cc=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-LG',ok:1},ex:{runs:5}});}}catch(e){}"});
  const clic=async(x,y)=>{for(const t of ['mousePressed','mouseReleased'])await c.send('Input.dispatchMouseEvent',{type:t,x,y,button:'left',clickCount:1});};
  for(const [nom,w,h,q] of CAS){errs.length=0;
    await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
    await c.send('Page.navigate',{url:'http://127.0.0.1:'+ph+'/index.html'+q});
    const W="(document.querySelector('iframe')&&document.querySelector('iframe').contentWindow&&document.querySelector('iframe').contentWindow.dbgState?document.querySelector('iframe').contentWindow:window)";
    let ok=false;for(let i=0;i<900&&!ok;i++){await dort(200);try{ok=await c.ev(`!!${W}.dbgState&&!!${W}.dbgAuto`);}catch(e){}}
    if(!ok){console.log(nom,'LE JEU NE DÉMARRE PAS',errs);continue;}
    // le splash (centre de l'écran) puis JOUER (le plus petit élément visible « JOUER… », dans l'iframe s'il y en a une)
    for(let i=0;i<40;i++){const v=await c.ev(`(function(){const w=${W},d=w.document,e=d.getElementById('splash');if(!e)return null;const s=w.getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return null;const f=document.querySelector('iframe');const r=f?f.getBoundingClientRect():{left:0,top:0,width:innerWidth};const k=f?r.width/w.innerWidth:1;return [r.left+w.innerWidth/2*k,r.top+w.innerHeight/2*k];})()`);if(!v)break;await clic(v[0],v[1]);await dort(700);}
    await dort(1500);if(carte)await c.ev(`${W}.dbgClassique('${carte}')`);
    let parti=false;for(let i=0;i<20&&!parti;i++){const r=await c.ev(`(function(){const w=${W},d=w.document;let b=null,ba=1e12;for(const e of d.querySelectorAll('.mPlay,button,div,a,span')){const t=(e.textContent||'').trim();if(!/^JOUER/.test(t)&&!e.classList.contains('mPlay'))continue;const r=e.getBoundingClientRect();if(r.width<20||r.height<10)continue;const s=w.getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none')continue;const a=r.width*r.height;if(a<ba){ba=a;b=r;}}if(!b)return null;const f=document.querySelector('iframe');const R=f&&w!==window?f.getBoundingClientRect():{left:0,top:0,width:w.innerWidth};const k=f&&w!==window?R.width/w.innerWidth:1;return [R.left+(b.left+b.width/2)*k,R.top+(b.top+b.height/2)*k];})()`);
      if(r)await clic(r[0],r[1]);for(let j=0;j<15;j++){await dort(200);if(await c.ev(`${W}.document.body.classList.contains('play')||${W}.dbgState().started`)){parti=true;break;}}}
    if(!parti){console.log(nom,'PAS DE DÉPART',errs.slice(0,3));continue;}
    await c.ev(`${W}.dbgAuto(1,0,{vol:true})`);await dort(12000);
    const st=await c.ev(`(function(){const d=${W}.dbgState(),k=${W}.dbgClassique();return {s:Math.round(d.s),mode:d.mode,go:d.gameOver,carte:k.niveau&&k.niveau.carte,loop:${W}.__loopErr?String(${W}.__loopErr).slice(0,200):null};})()`);
    console.log(nom,JSON.stringify(st),errs.length?'ERREURS '+JSON.stringify(errs.slice(0,4)):'0 erreur JS');}
  tue();process.exit(0);
})().catch(e=>{console.error(e);tue();process.exit(1);});
