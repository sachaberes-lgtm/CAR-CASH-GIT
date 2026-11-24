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
  /* LE CROCHET DES CAPTURES (dans cette copie temporaire SEULEMENT : le jeu ne change pas) : le jeu de l'app est enfermé dans une fonction, on n'y
     voit ni la vitrine (GBQ) ni le geste (BQG). __capt.pose(a) fait ce que fait le doigt (bqPoseTient : le plateau s'arrête) et met la caisse à
     l'angle a ; __capt.etat() dit le geste en cours et la place de la caméra, pour capturer quand tout est immobile. */
  {const f=path.join(www,'index.html');let h=fs.readFileSync(f,'utf8');
   if(!h.includes('window.__capt=')){const a='\nconst BQG={a:null,t:0,n:0};';if(h.split(a).length!==2)throw new Error('crochet : « const BQG » introuvable');
     h=h.replace(a,a+"window.__capt={pose:function(y){bqPoseTient();GBQ.lan=null;GBQ.yawV=0;GBQ.yaw=0;GBQ.pit=GBQ.pitV=GBQ.rol=GBQ.rolV=0;garageAng=y;},"
       +"etat:function(){return JSON.stringify({ang:+garageAng.toFixed(3),yaw:+GBQ.yaw.toFixed(3),pose:GBQ.pose,geste:BQG.a,cam:[camera.position.x,camera.position.y,camera.position.z].map(function(v){return +v.toFixed(3);})});}};");
     fs.writeFileSync(f,h);}}
  const J=await P.ouvre({dossier:www}),c=J.c;global.__J=J;
  await c.send('Emulation.setDeviceMetricsOverride',{width:430,height:932,deviceScaleFactor:3,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
  await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await J.vide();
  await J.ev(`localStorage.clear();sessionStorage.clear();localStorage.__appstore=${JSON.stringify(JSON.stringify({tx:[],n:1000,local:true,regle:{feuille:'ok',reseau:true,catalogue:null,prix}}))};return 1;`);
  /* (24/11, Sacha : « les couleurs, mets-les sur LÉONIE, pas sur LA HONTE ») la caisse portée = celle qui essaie les peintures : LÉONIE, achetée et
     équipée. Son index est lu dans CARS (les lignes retirées gardent leur place) ; VOITURE=<NOM> pour une autre. Vérifié après le lancement. */
  const VNOM=process.env.VOITURE||'LÉONIE';
  const VOIT=fs.readFileSync(R+'/code/voitures/cars.js','utf8').split('\n').filter(l=>/^\s*\{(retire:\d,\s*)?name:'/.test(l)).findIndex(l=>l.includes("name:'"+VNOM+"'"));
  if(VOIT<0)throw new Error('voiture introuvable dans CARS : '+VNOM);
  await J.seme({bank:48250,gamme:3,owned:[VOIT],equipped:VOIT,bestCar:VOIT});
  try{await J.lance(120000);}catch(e){console.log('ERREURS',J.erreurs,await J.ev('return JSON.stringify({ready:!!window.__gameReady,dbg:!!window.dbgAchats,sk:!!window.__sk,url:location.href})').catch(x=>x.message));await J.ferme();throw e;}
  await J.ev(`var s=document.documentElement.style;s.setProperty('--ccT','59px');s.setProperty('--ccB','34px');s.setProperty('--ccL','0px');s.setProperty('--ccR','0px');dispatchEvent(new Event('resize'));return 1;`);
  await dormir(1500);
  {const v=await J.ev(`var s={};try{s=JSON.parse(localStorage.cashcarSave||'{}');}catch(e){}return JSON.stringify({eq:s.equipped,own:s.owned,bank:s.bank,BQG:typeof BQG,BRB:typeof BRB,dbgA:typeof window.dbgAchats});`);console.log('graine / globales :',v);
   if(JSON.parse(v).eq!==VOIT)throw new Error('la caisse portée n\'est pas '+VNOM+' : '+v);}
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
  /* L'ANGLE : chaque produit est vu sous le même angle (ANGLE, en radians, angle du plateau) ; on attend la fin du geste puis une caméra immobile */
  const ANGLE=+(process.env.ANGLE||2.4);
  const pose=async(a=ANGLE)=>{await J.ev('__capt.pose('+a+');return 1;');let av='',stable=0;const t0=Date.now();
    while(Date.now()-t0<30000){await dormir(400);const e=JSON.parse(await J.ev('return __capt.etat();'));const k=JSON.stringify(e.cam)+e.ang;
      if(!e.geste&&e.pose&&k===av){if(++stable>=3)break;}else stable=0;av=k;}
    await dormir(700);};
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
      if(pris&&process.env.RAFALE){for(let r=0;r<+process.env.RAFALE;r++){const s3=await c.send('Page.captureScreenshot',{format:'jpeg',quality:40},180000);fs.writeFileSync(path.join(OUT,p.id+'_r'+String(r).padStart(2,'0')+'.jpg'),Buffer.from(s3.data,'base64'));await dormir(1000);}}
      if(pris){await dormir(600);await pose();}
    }
    if(!pris){bilan.push(p.id+' : NON SÉLECTIONNÉ '+await J.ev(`var e=document.querySelector('#gBqPan [data-k="${k}"]');var s=document.querySelector('#gBqPan .pN.sel');return (e?e.className+' vis='+e.getBoundingClientRect().width:'absente')+' | sel='+(s?s.dataset.k:'-')+' | nom='+(document.getElementById('gBqNom')||{}).textContent;`));continue;}
    if(process.env.ANGLES){for(const a of process.env.ANGLES.split(',')){await pose(+a);const s2=await c.send('Page.captureScreenshot',{format:'png'},180000);fs.writeFileSync(path.join(OUT,p.id+'_a'+a+'.png'),Buffer.from(s2.data,'base64'));}
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
