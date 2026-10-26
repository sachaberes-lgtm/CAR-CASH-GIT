// node vues.cjs <site> <portHttp> <portChrome> <carte> [n=3] [meteo=soir] [sortie] — n maps tirées au hasard, en course, mises en pause : une photo figée
// devant chaque pièce (dbgCanyon/dbgDunes('vueA', s, h, cap, pente)) — pour montrer à Sacha ce que chaque map enchaîne (NON COMMITÉ)
const path=require('path'),fs=require('fs'),{serveur,chrome,tue,dort}=require('./cdp.cjs');
const [site,ph,pc,carte]=[process.argv[2]||'apres',+process.argv[3]||8637,+process.argv[4]||9637,process.argv[5]||'canyon'],N=+process.argv[6]||3,MET=process.argv[7]||'soir';
const OUT=process.argv[8]||path.join(__dirname,'vues-'+site);fs.mkdirSync(OUT,{recursive:true});
const PIE=carte==='canyon'?{breche1:'la brèche',fer0:'le fer à cheval (raccourci)',etroit0:'les étroits',arche0:"l'arche",amphi0:"l'amphithéâtre",mine0:'la mine',chameau:'le dos de chameau',bosses:'les bosses',finale0:'la finale'}
  :{erg0:'la crête du Grand Erg',tob0:'le toboggan',racA0:'le raccourci',vag0:'les vagues',vlei0:'la vallée morte',cr2a:'la deuxième crête',obel0:"l'allée des obélisques",vag2:'les deuxièmes vagues',oasis0:"l'oasis"};
(async()=>{
  await serveur(path.join(__dirname,'site-'+site),ph);
  const c=await chrome(pc,{tmp:path.join(__dirname,'tmp'),w:1280,h:720});
  await c.send('Runtime.enable');await c.send('Page.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
  await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{if(!sessionStorage.__cc){sessionStorage.__cc=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-LG',ok:1},ex:{runs:5}});}}catch(e){}"});
  await c.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
  const D=carte==='canyon'?'dbgCanyon':'dbgDunes',liste=[];
  for(let k=0;k<N;k++){
    await c.send('Page.navigate',{url:'http://127.0.0.1:'+ph+'/index.html?colonne=0&simu=1&carte='+carte+'&meteo='+MET});
    let ok=false;for(let i=0;i<900&&!ok;i++){await dort(200);try{ok=await c.ev("typeof dbgState==='function'&&!!document.querySelector('[data-m=\"play\"]')");}catch(e){}}
    await dort(1500);await c.ev("document.querySelector('[data-m=\"play\"]').click()");
    for(let i=0;i<120;i++){await dort(500);if(await c.ev("(function(){var s=dbgState();return s.started&&!s.gameOver})()"))break;}
    await c.ev("dbgAuto(1,0,{vol:true})");
    for(let i=0;i<60;i++){await dort(500);const o=await c.ev(`(function(){const d=${D}();return d.on&&!d.attente;})()`);if(o)break;}
    await dort(2500);
    const info=await c.ev(`(function(){const d=${D}();return {sQ:d.sQ,hz:d.hz,L:d.L};})()`);
    const pieces=Object.keys(PIE).filter(q=>info.sQ&&info.sQ[q]!=null).sort((a,b)=>info.sQ[a]-info.sQ[b]);
    const m={k,axe:info.hz&&info.hz.axe,L:info.L,ordre:pieces.map(q=>PIE[q]),photos:[]};
    for(const q of pieces){const s0=Math.max(0,info.sQ[q]-(q==='erg0'?40:140));
      const url=await c.ev(`(function(){${D}('vueA',${s0},${carte==='canyon'?26:22},0,.10);return dbgScene().rdr.domElement.toDataURL('image/jpeg',.82);})()`);
      const f=path.join(OUT,`${carte}-${k}-${q}.jpg`);fs.writeFileSync(f,Buffer.from(url.split(',')[1],'base64'));m.photos.push([PIE[q],path.basename(f)]);}
    liste.push(m);console.log(JSON.stringify({k,axe:m.axe,L:m.L,ordre:m.ordre.join(' → ')}));
  }
  fs.writeFileSync(path.join(OUT,carte+'.json'),JSON.stringify(liste,null,1));
  tue();process.exit(0);
})().catch(e=>{console.error(e);tue();process.exit(1);});
