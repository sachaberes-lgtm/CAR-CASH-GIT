/* Une capture iPhone 6,7"/6,9" (1290×2796) de la boutique par achat intégré : le produit choisi sur le plateau, sa carte et son prix. */
const fs=require('fs'),path=require('path'),os=require('os');
const P=require('../banc-achats/pilote.cjs');const dormir=P.dormir;
const R=path.resolve(__dirname,'..','..'), OUT=process.argv[2]||R+'/app-ios/fiche/captures-achats', SEULS=process.argv[3]?process.argv[3].split(','):null;
const tous=fs.readFileSync(R+'/app-ios/outils/produits.csv','utf8').trim().split(/\r?\n/).slice(1).map(l=>{const c=l.split(',');return {id:c[0],nom:c.slice(1,-2).join(','),type:c[c.length-2],eur:c[c.length-1]};});
const prod=tous.filter(p=>!SEULS||SEULS.includes(p.id));
const prix={};tous.forEach(p=>prix[p.id]=p.eur.replace('.',',')+' €');
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const wwwD=path.join(os.tmpdir(),'capt-achats-www');
  const www=fs.existsSync(path.join(wwwD,'index.html'))&&!process.env.REFAIT?wwwD:P.fabrique(wwwD);
  const J=await P.ouvre({dossier:www}),c=J.c;global.__J=J;
  await c.send('Emulation.setDeviceMetricsOverride',{width:430,height:932,deviceScaleFactor:3,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
  await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await J.vide();
  await J.ev(`localStorage.clear();sessionStorage.clear();localStorage.__appstore=${JSON.stringify(JSON.stringify({tx:[],n:1000,local:true,regle:{feuille:'ok',reseau:true,catalogue:null,prix}}))};return 1;`);
  await J.seme({bank:48250});
  try{await J.lance(120000);}catch(e){console.log('ERREURS',J.erreurs,await J.ev('return JSON.stringify({ready:!!window.__gameReady,dbg:!!window.dbgAchats,sk:!!window.__sk,url:location.href})').catch(x=>x.message));await J.ferme();throw e;}
  await J.ev(`var s=document.documentElement.style;s.setProperty('--ccT','59px');s.setProperty('--ccB','34px');s.setProperty('--ccL','0px');s.setProperty('--ccR','0px');dispatchEvent(new Event('resize'));return 1;`);
  await dormir(1500);
  await J.ev(`__mGo('home');return 1;`); await dormir(2000);
  const attend=async(cond,ms=180000)=>{const t0=Date.now();for(;;){let v=false;try{v=await J.ev('return !!('+cond+');');}catch(e){}if(v)return;if(Date.now()-t0>ms)throw new Error('attente : '+cond);await dormir(500);}};
  for(let i=0;i<5;i++){await J.ev(`var e=document.querySelector('#mHome [data-m="garage"]');if(e)e.click();return 1;`);try{await attend("document.querySelector('#gShopBas')&&document.querySelector('#gShopBas').getBoundingClientRect().width>0",40000);break;}catch(e){}}
  await dormir(4000);
  for(let i=0;i<5;i++){await J.ev(`var e=document.querySelector('#gShopBas');if(e)e.click();return 1;`);try{await attend("document.querySelector('#gBqCats [data-c=\"achat\"]')&&document.querySelector('#gBq.pan')",40000);break;}catch(e){}}
  await dormir(6000);
  const rayon=async(cat)=>{
    for(let i=0;i<6;i++){
      const la=await J.ev(`var b=document.querySelector('#gBqCats [data-c="${cat}"]');if(!b)return false;b.click();return true;`);
      if(la){await dormir(5000);const bon=await J.ev(`return !!document.querySelector('#gBqPan [data-k^="${cat==='achat'?'v:':'peinture:'}"]');`);if(bon)return;}
      if(i===2){await J.ev(`var e=document.querySelector('#gShopBas');if(e)e.click();return 1;`);}
      await dormir(8000);}
    const s=await c.send('Page.captureScreenshot',{format:'png'},180000);fs.writeFileSync(path.join(OUT,'_echec-rayon.png'),Buffer.from(s.data,'base64'));
    throw new Error('rayon '+cat+' introuvable');};
  const glisse=async(dx,y=430)=>{const x0=215-dx/2,n=12;const tp=(x)=>[{x,y,id:1}];
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp(x0)});
    for(let i=1;i<=n;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:tp(x0+dx*i/n)});await dormir(25);}
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  const TOUR=+(process.env.TOUR||0);
  let cat=null; const bilan=[];
  for(const p of prod){
    const vc=p.type==='car'?'achat':'peinture';
    if(vc!==cat){await rayon(vc);cat=vc;}
    let k;
    if(p.type==='car') k=await J.ev(`var L=[...document.querySelectorAll('#gBqPan .bqK[data-k^="v:"]')];var e=L.find(e=>window.dbgAchats.produitDe(+e.dataset.k.slice(2))===${JSON.stringify(p.id)});return e?e.dataset.k:null;`);
    else k='peinture:'+p.id.split('.').pop();
    let pris=false;
    for(let essai=0;essai<4&&!pris;essai++){
      const ok=await J.ev(`var e=document.querySelector('#gBqPan [data-k="${k}"]');if(!e)return false;e.scrollIntoView({inline:'center',block:'nearest'});return true;`);
      if(!ok)break; await dormir(1200);
      await J.ev(`document.querySelector('#gBqPan [data-k="${k}"]').click();return 1;`); await dormir(3200);
      const cible=p.nom.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
      for(let t=0;t<12&&!pris;t++){const nom=await J.ev("return (document.getElementById('gBqNom')||{}).textContent||'';");
        pris=nom.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'').endsWith(cible);if(!pris)await dormir(1500);}
      if(pris)await dormir(p.type==='car'?2500:10000); /* la peinture : les bras du robot finissent de la poser */
    }
    if(!pris){bilan.push(p.id+' : NON SÉLECTIONNÉ '+await J.ev(`var e=document.querySelector('#gBqPan [data-k="${k}"]');var s=document.querySelector('#gBqPan .pN.sel');return (e?e.className+' vis='+e.getBoundingClientRect().width:'absente')+' | sel='+(s?s.dataset.k:'-')+' | nom='+(document.getElementById('gBqNom')||{}).textContent;`));continue;}
    if(process.env.ANGLES){for(const a of process.env.ANGLES.split(',')){await glisse(+a);await dormir(2500);const s2=await c.send('Page.captureScreenshot',{format:'png'},180000);fs.writeFileSync(path.join(OUT,p.id+'_a'+a+'.png'),Buffer.from(s2.data,'base64'));}
    }
    if(TOUR&&!global.__tourne){global.__tourne=1;for(let i=0;i<3;i++){await glisse(TOUR/3);await dormir(1500);}await dormir(2500);} /* une fois : l'angle reste d'un produit à l'autre */
    const etat=await J.ev(`var b=document.getElementById('gBqBtn');return (document.getElementById('gBqNom')||{}).textContent+' | '+(b?b.textContent.trim().replace(/\s+/g,' '):'');`);
    const s=await c.send('Page.captureScreenshot',{format:'png'},180000);
    fs.writeFileSync(path.join(OUT,p.id+'.png'),Buffer.from(s.data,'base64'));
    bilan.push(p.id+' : '+etat);
  }
  console.log(bilan.join('\n')); console.log('erreurs',J.erreurs.slice(0,5));
  await J.ferme();
})().catch(async e=>{console.error(e);try{await global.__J.ferme();}catch(_){}process.exit(1);});
