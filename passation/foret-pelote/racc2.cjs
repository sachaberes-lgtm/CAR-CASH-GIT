/* BANC RACCOURCIS (14/10, session GAMEPLAY) — mesure une PISTE du mode classique : profil, course, croisements, raccourcis jouables.
   Usage : node C:/Users/sacha/cc-banc/raccourcis.cjs <carte> <graine[,graine…]> [dossier VERSION PRINCIPALE] [--palier N] [--json] [--meteo midi] [--pas 2]
                                                         [--sauve trace.json] [--depuis trace.json]     (--opt=valeur marche aussi)
   LOT (un seul passage dans la file, un seul chargement du jeu pour plusieurs mesures) :
     node raccourcis.cjs --lot foret:1,canyon:1,foret:1:15      → items carte:graine[:palier] (le palier du lot l'emporte sur --palier)
     --palier : le palier MOTEUR auquel la piste est bâtie (0 par défaut) : vPal (vitesse de croisière) et rMin (rayon qu'on tient) en dépendent
     <carte>  : foret canyon volcan banquise (alias glacier) jade nuages ville …  (les cartes de SF_CARTES)
     dossier  : par défaut ./VERSION PRINCIPALE du dossier courant s'il existe, sinon CAR-CASH-GIT/VERSION PRINCIPALE
     --depuis : ne lance PAS Chrome : rejoue l'analyse sur une trace déjà sauvée (--sauve) — pour régler les mesures sans toucher au GPU
   Le jeu est ouvert par `index.html?carte=<carte>&meteo=midi&colonne=0` ; la piste vient du hook `window.dbgTrace({carte,meteo,graine,pas})`
   (lecture seule : il REBÂTIT la piste de la carte avec CETTE graine par newTrack, puis renvoie l'échantillonnage). Tout le reste se calcule ICI.
   File d'attente commune du PC (cc-banc/lib.cjs : 2 créneaux, un Chrome, muet, fermé à la fin ; CC_QUI=<session> pour s'annoncer). Coupure dure : 5 min. */
const fs=require('fs'),path=require('path'),http=require('http');

/* ============================ LES CIBLES — à régler ============================ */
/* op : '>=' | '<=' | '==' — v : la valeur visée. `actif:false` éteint la ligne. Réglées d'après passation/RACCOURCIS.md (GAMEPLAY, 14/10 soir) :
   droite jugée en SECONDES à la vitesse du palier, virages jugés contre rMin = rayonPalier() (infranchissable < rMin ; SERRÉ de rMin à 1,5 × rMin). */
const CIBLES=[
  {k:'penteMoy',   lib:'pente moyenne (descente)',              op:'>=',v:4,   u:'%'},
  {k:'partMontee', lib:'part de la longueur en montée (>+2 %)', op:'<=',v:15,  u:'%'},
  {k:'virKm',      lib:'virages par km',                        op:'>=',v:2.5, u:'/km'},
  {k:'droiteSec',  lib:'plus longue ligne droite (à vPal)',     op:'<=',v:5,   u:'s'},
  {k:'raccKm',     lib:'raccourcis rentables par km',           op:'>=',v:0.6, u:'/km'},
  {k:'croisDang',  lib:'croisements dangereux',                 op:'==',v:0,   u:''},
  {k:'infr',       lib:'virages INFRANCHISSABLES (< rMin)',     op:'==',v:0,   u:''},
  {k:'serresKm',   lib:'virages SERRÉS (rMin à 1,5 × rMin)',    op:'>=',v:0.5, u:'/km'},
  {k:'enchKm',     lib:'enchaînements par km',                  op:'>=',v:1,   u:'/km'},
  {k:'penteMax',   lib:'pente max (lissée 20 m)',               op:'<=',v:30,  u:'%'},
];
/* réglages de la physique et des seuils (relevés dans le jeu — voir passation/RACCOURCIS.md) */
const FACT_VIT=[.75,1,1.25];            /* les vitesses du balayage = vPal (la croisière du palier) × ces facteurs — voir passation/RACCOURCIS.md */
/* vPalier / rayonPalier recalculés ICI quand la trace n'a pas vPal (vieille trace, --depuis) : la même formule que le jeu (lvPiste, vPalier) —
   2,75 × maxKmh de la caisse 0 (190) / 3,6 × engLate(u) × push[u] × SPD (0,48), u = palier + 2 ; rMin = VOL_R0 40 + VOL_RK 0,3 × vPal. */
const PUSH=[1.00,1.06,1.12,1.19,1.26,1.34,1.42,1.50,1.59,1.68,1.78,1.88,1.99,2.10,2.21,2.33,2.45,2.58,2.71,2.85,2.99,3.13,3.28,3.44,3.60,3.76,3.90,4.02,4.12,4.20];
const engLate=u=>1+Math.min(.5,Math.max(0,u-8)*.035);
const vPalDe=t=>{const u=Math.min(PUSH.length-1,(t|0)+2);return 2.75*190/3.6*engLate(u)*PUSH[u]*.48;};
const rMinDe=v=>40+.3*v;
const VPAL_DEFAUT=vPalDe(0);            /* palier 0 ≈ 78 m/s */
const VOLANTS=[-1,-.5,0,.5,1];
const PAS_DECOL=8;                      /* m entre deux points de décollage */
const T_MAX=5.5;                        /* s de vol simulées (la mort du jeu est à 6 s) */
const H_DEPART=.45;                     /* m : le centre de la caisse au-dessus de la dalle au décollage (la lèvre de 45 cm) */
const GAIN_MIN=60, GAIN_RENTABLE=150;   /* le jeu crie RACCOURCI dès 60 m ; « rentable » dès 150 m */
const ANG_PROPRE=55, ANG_RATEE=120;     /* pose propre ≤ 55° · ratée 55-120° · contresens au-delà */

/* ============================ ARGUMENTS ============================ */
const AVEC_VALEUR=['palier','meteo','pas','sauve','depuis','lot'];
const argv=(()=>{const a=process.argv.slice(2),o=[]; /* `--palier 15` devient `--palier=15` */
  for(let i=0;i<a.length;i++){const m=/^--(\w+)$/.exec(a[i]);if(m&&AVEC_VALEUR.includes(m[1])&&i+1<a.length&&!a[i+1].startsWith('--')){o.push('--'+m[1]+'='+a[i+1]);i++;}else o.push(a[i]);}return o;})();
const JSON_OUT=argv.includes('--json');
const opt=k=>{const a=argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):null;};
const pos=argv.filter(a=>!a.startsWith('--'));
if(JSON_OUT){const e=console.error.bind(console);console.log=(...a)=>e(...a);} /* le JSON seul sur stdout (les messages de la file passent en stderr) */
const log=(...a)=>console.error(...a);
let carte=(pos[0]||'foret').toLowerCase();if(carte==='glacier')carte='banquise';
const METEO=opt('meteo')||'midi', PAS=+opt('pas')||2, SAUVE=opt('sauve'), DEPUIS=opt('depuis'), PALIER=Math.max(0,parseInt(opt('palier')||'0',10)||0);
const ALIAS=c=>{c=String(c).toLowerCase();return c==='glacier'?'banquise':c;};
const ITEMS=opt('lot')?opt('lot').split(',').map(x=>{const q=x.split(':');return {carte:ALIAS(q[0]),graine:parseInt(q[1],10),palier:q[2]!=null?Math.max(0,parseInt(q[2],10)||0):PALIER};})
  :String(pos[1]||'1').split(',').map(x=>({carte:carte,graine:parseInt(x,10),palier:PALIER}));
if(!ITEMS.length||ITEMS.some(it=>!it.carte||!isFinite(it.graine))){console.error('carte ou graine invalide');process.exit(2);}
const DOSSIER=opt('lot')?pos[0]:pos[2]; /* en lot, le seul mot libre est le dossier du jeu */
function racineJeu(){
  if(DOSSIER)return path.resolve(DOSSIER);
  const ici=path.resolve('VERSION PRINCIPALE');
  if(fs.existsSync(path.join(ici,'index.html')))return ici;
  return 'C:/Users/sacha/Documents/GitHub/CAR-CASH-GIT/VERSION PRINCIPALE';
}
const T0=Date.now();

/* ============================ ACQUISITION (Chrome) ============================ */
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.m4a':'audio/mp4','.ogg':'audio/ogg','.wav':'audio/wav',
  '.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.glb':'model/gltf-binary','.webmanifest':'application/manifest+json'};
const PREP=`(function(){try{localStorage.cashcarSave=JSON.stringify({v:2,tuto:1,permis:1,sfx:false,vox:false,mus:false,vol:0});localStorage.ccLang='fr';}catch(_){}
  try{Object.defineProperty(document,'hidden',{get:function(){return false;}});Object.defineProperty(document,'visibilityState',{get:function(){return 'visible';}});}catch(_){}
  try{HTMLMediaElement.prototype.play=function(){try{this.muted=true;this.volume=0;}catch(_){}return Promise.resolve();};}catch(_){}
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC){AC.prototype.resume=function(){return Promise.resolve();};}}catch(_){}})();`;
async function acquiert(){
  const RACINE=racineJeu();
  if(!fs.existsSync(path.join(RACINE,'index.html'))){console.error('pas d\'index.html dans '+RACINE);process.exit(2);}
  const serveur=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const p=path.join(RACINE,u);
    if(!p.startsWith(RACINE)){r.writeHead(403);return r.end();}
    fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':TYPES[path.extname(p).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});r.end(b);});});
  await new Promise(ok=>serveur.listen(0,'127.0.0.1',ok));const PORT=serveur.address().port;
  if(!process.env.CC_QUI)process.env.CC_QUI='raccourcis';
  const B=require('C:/Users/sacha/cc-banc/lib.cjs');
  const P=require('C:/Users/sacha/Desktop/projet-161/node_modules/puppeteer-core');
  const tFile=Date.now();await B._verrou.prend();
  log('[raccourcis] créneau pris après '+Math.round((Date.now()-tFile)/1000)+' s — '+RACINE);
  const plafond=Math.min(9,3+ITEMS.length)*60e3; /* 5 min pour une mesure, plus pour un lot (le chargement du jeu compte, GPU partagé) */
  const coupe=setTimeout(()=>{console.error('RACCOURCIS KO : plus de '+Math.round(plafond/60e3)+' min, interrompu');try{B._verrou.rend();}catch(_){}process.exit(1);},plafond);
  let browser=null;const traces=[];
  try{
    browser=await P.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:240000,
      args:['--mute-audio','--autoplay-policy=user-gesture-required','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
    const ctx=await browser.createBrowserContext(),page=await ctx.newPage();
    try{await page.setBypassServiceWorker(true);}catch(_){} /* le service worker rechargeait la page après le 1er chargement */
    await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
    await page.evaluateOnNewDocument(PREP);
    const errs=[];page.on('pageerror',e=>errs.push(String(e&&e.message||e).slice(0,200)));
    const url='http://127.0.0.1:'+PORT+'/index.html?carte='+encodeURIComponent(ITEMS[0].carte)+'&meteo='+encodeURIComponent(METEO)+'&colonne=0';
    page.goto(url,{waitUntil:'load',timeout:180000}).catch(()=>{});
    const t1=Date.now();
    await page.waitForFunction(()=>typeof window.dbgTrace==='function'&&typeof window.dbgState==='function'&&!!window.__gameReady,{timeout:170000,polling:300});
    await new Promise(r=>setTimeout(r,2500)); /* le temps que l'amorçage du menu finisse (la 1re piste du menu est bâtie avant le hook) */
    log('[raccourcis] jeu prêt en '+Math.round((Date.now()-t1)/1000)+' s');
    for(const it of ITEMS){
      const t2=Date.now();let tr;
      try{tr=await page.evaluate((c,m,g,pas,pal)=>window.dbgTrace({carte:c,meteo:m,graine:g,pas:pas,palier:pal}),it.carte,METEO,it.graine,PAS,it.palier);}
      catch(e){log('[raccourcis] '+it.carte+':'+it.graine+' ÉCHEC : '+String(e&&e.message||e).slice(0,200));continue;}
      if(tr.carte!==it.carte)log('[raccourcis] ⚠ '+it.carte+' demandée, '+tr.carte+' bâtie (carte inconnue de SF_CARTES ?)');
      tr.msBati=Date.now()-t2;tr.erreursPage=errs.slice(0,5);traces.push(tr);
      log('[raccourcis] '+it.carte+' graine '+it.graine+' : piste bâtie en '+tr.msBati+' ms (L='+tr.L+' m, carte '+tr.carte+', palier '+tr.eng+', vPal '+tr.vPal+' m/s, rMin '+tr.rMin+' m, graineOk '+tr.graineOk+')');
    }
  }finally{try{if(browser)await browser.close();}catch(_){}B._verrou.rend();clearTimeout(coupe);serveur.close();}
  return traces;
}

/* ============================ UTILITAIRES ============================ */
const fr=(x,d)=>{if(x==null||!isFinite(x))return '—';return (+x).toFixed(d==null?1:d).replace('.',',');};
const deg=r=>r*180/Math.PI;

/* ============================ 1. PROFIL & 2. COURSE ============================ */
function profilEtCourse(tr){
  const n=tr.trou.length,ds=tr.pas,L=tr.L,P=tr.p,T=tr.t,vPal=tr.vPal,rMin=tr.rMin; /* posés par mesure() */
  const y=i=>P[3*i+1];
  /* --- profil --- */
  const w200=Math.max(1,Math.round(200/ds));let sd=0,sa=0;
  for(let i=0;i<w200;i++){sd+=y(i);sa+=y(n-1-i);}
  const yDep=sd/w200,yArr=sa/w200,deniv=yDep-yArr;
  const hw=Math.max(1,Math.round(10/ds)); /* demi-fenêtre : 20 m en tout */
  const pre=new Float64Array(n+1);for(let i=0;i<n;i++)pre[i+1]=pre[i]+y(i);
  const ys=new Float64Array(n);for(let i=0;i<n;i++){const a=Math.max(0,i-hw),b=Math.min(n-1,i+hw);ys[i]=(pre[b+1]-pre[a])/(b-a+1);}
  let desc=0,mont=0;for(let i=1;i<n;i++){const d=ys[i]-ys[i-1];if(d<0)desc-=d;else mont+=d;}
  const pente=new Float64Array(n).fill(NaN);let nv=0,nUp=0,pMaxD=0,pMaxM=0,minY=1e18;
  for(let i=hw;i<n-hw;i++){const p=(y(i+hw)-y(i-hw))/(2*hw*ds);pente[i]=p;nv++;if(p>.02)nUp++;if(-p>pMaxD)pMaxD=-p;if(p>pMaxM)pMaxM=p;}
  for(let i=0;i<n;i++)if(y(i)<minY)minY=y(i);
  const profil={L:L,yDepart:yDep,yArrivee:yArr,denivele:deniv,penteMoy:deniv/L*100,descenteCumulee:desc,monteeCumulee:mont,partMontee:nv?nUp/nv*100:0,
    penteMaxDescente:pMaxD*100,penteMaxMontee:pMaxM*100,penteMax:Math.max(pMaxD,pMaxM)*100,minY:tr.minY,minYEchantillons:minY};
  /* --- course --- */
  const th=new Float64Array(n).fill(NaN),okTh=new Uint8Array(n);let prev=NaN;
  for(let i=0;i<n;i++){const tx=T[3*i],tz=T[3*i+2];if(Math.hypot(tx,tz)<.3)continue; /* tangente presque verticale : le cap n'existe pas */
    let a=Math.atan2(tx,tz);if(!isNaN(prev))a+=2*Math.PI*Math.round((prev-a)/(2*Math.PI));th[i]=a;okTh[i]=1;prev=a;}
  const cu=new Int32Array(n+1);for(let i=0;i<n;i++)cu[i+1]=cu[i]+okTh[i];
  const kap=new Float64Array(n).fill(NaN);
  for(let i=hw;i<n-hw;i++)if(cu[i+hw+1]-cu[i-hw]===2*hw+1)kap[i]=(th[i+hw]-th[i-hw])/(2*hw*ds);
  /* virages : tronçons continus |κ| > 1/(4 × rMin) (252 m au palier 0 : le seuil SUIT le palier, les virages élargis par la règle comptent encore), même signe,
     qui tournent ≥ 20° ; les tronçons de même sens à moins de 15 m sont soudés */
  const KV=1/(4*rMin),segs=[];
  for(let i=0;i<n;){
    if(isNaN(kap[i])||Math.abs(kap[i])<=KV){i++;continue;}
    const sg=Math.sign(kap[i]);let j=i,som=0,km=0;
    while(j<n&&!isNaN(kap[j])&&Math.abs(kap[j])>KV&&Math.sign(kap[j])===sg){som+=kap[j]*ds;km=Math.max(km,Math.abs(kap[j]));j++;}
    segs.push({a:i,b:j-1,sg:sg,tour:Math.abs(som),km:km});i=j;}
  const soude=[];for(const s of segs){const l=soude[soude.length-1];
    if(l&&l.sg===s.sg&&(s.a-l.b-1)*ds<=15){l.b=s.b;l.tour+=s.tour;l.km=Math.max(l.km,s.km);}else soude.push(Object.assign({},s));}
  const vir=soude.filter(s=>s.tour>=20*Math.PI/180).map(s=>({s0:s.a*ds,s1:s.b*ds,angle:deg(s.tour),rayonMin:1/s.km,sens:s.sg>0?'+':'-'}));
  const infr=vir.filter(v=>v.rayonMin<rMin),serres=vir.filter(v=>v.rayonMin>=rMin&&v.rayonMin<1.5*rMin); /* infranchissable < rMin <= SERRÉ < 1,5 × rMin <= au pouce */
  const plusSerre=vir.length?vir.reduce((a,b)=>b.rayonMin<a.rayonMin?b:a):null;
  let ench=0;for(let k=0;k+1<vir.length;k++)if(vir[k+1].s0-vir[k].s1<150)ench++;
  let cap=0;for(let i=1;i<n;i++)if(okTh[i]&&okTh[i-1])cap+=Math.abs(th[i]-th[i-1]);
  /* plus longue droite : tronçon continu |κ| < 1/700 */
  let best=0,bestA=0,run=0;
  for(let i=0;i<n;i++){if(!isNaN(kap[i])&&Math.abs(kap[i])<1/700){run++;if(run>best){best=run;bestA=i-run+1;}}else run=0;}
  const droite=best*ds,km=L/1000;
  const course={virages:vir.length,viragesKm:vir.length/km,vPal:vPal,rMin:rMin,infranchissables:infr.length,infranchissablesKm:infr.length/km,serres:serres.length,serresKm:serres.length/km,
    sousUnVirgule5:infr.length+serres.length,enchainements:ench,enchainementsKm:ench/km,
    degresCapKm:deg(cap)/km,droiteMax:droite,droiteDe:bestA*ds,droiteSec:droite/vPal,
    rayonMinGlobal:plusSerre?plusSerre.rayonMin:null,rayonMinEn:plusSerre?plusSerre.s0:null,liste:vir};
  return {profil,course};
}

/* ============================ 3. CROISEMENTS ============================ */
function croisements(tr){
  const n=tr.trou.length,ds=tr.pas,half=tr.half,thick=tr.thick,P=tr.p,T=tr.t,km=tr.L/1000;
  const D=2*half,D2=D*D,sMin=Math.ceil(150/ds);
  let minx=1e18,minz=1e18;for(let i=0;i<n;i++){if(P[3*i]<minx)minx=P[3*i];if(P[3*i+2]<minz)minz=P[3*i+2];}
  const cell=new Map(),key=(cx,cz)=>cx*100003+cz;
  for(let i=0;i<n;i++){if(tr.trou[i])continue;const cx=Math.floor((P[3*i]-minx)/D),cz=Math.floor((P[3*i+2]-minz)/D),k=key(cx,cz);let a=cell.get(k);if(!a){a=[];cell.set(k,a);}a.push(i);}
  const pairs=[];
  for(let i=0;i<n;i++){if(tr.trou[i])continue;const cx=Math.floor((P[3*i]-minx)/D),cz=Math.floor((P[3*i+2]-minz)/D);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=cell.get(key(cx+dx,cz+dz));if(!a)continue;
      for(const j of a){if(j-i<sMin)continue;const ex=P[3*i]-P[3*j],ez=P[3*i+2]-P[3*j+2],d2=ex*ex+ez*ez;if(d2<D2)pairs.push([i,j,Math.sqrt(d2)]);}}}
  /* regroupement : composantes connexes dans le plan (i, j), tolérance de 3 échantillons */
  const idx=new Map();pairs.forEach((p,k)=>idx.set(p[0]*(n+7)+p[1],k));
  const vu=new Uint8Array(pairs.length),R=3,clusters=[];
  for(let k0=0;k0<pairs.length;k0++){if(vu[k0])continue;const pile=[k0],membres=[];vu[k0]=1;
    while(pile.length){const k=pile.pop();membres.push(k);const [i,j]=pairs[k];
      for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){const q=idx.get((i+a)*(n+7)+(j+b));if(q!==undefined&&!vu[q]){vu[q]=1;pile.push(q);}}}
    clusters.push(membres);}
  const liste=[];
  for(const mem of clusters){
    let rep=mem[0];for(const k of mem)if(pairs[k][2]<pairs[rep][2])rep=k;
    const [ri,rj,rd]=pairs[rep];
    const hdMax=Math.max(rd,half);let dyMin=1e18;
    for(const k of mem){const [i,j,hd]=pairs[k];if(hd<=hdMax){const dy=Math.abs(P[3*i+1]-P[3*j+1]);if(dy<dyMin)dyMin=dy;}}
    const dy=P[3*ri+1]-P[3*rj+1];
    let ang=0;{const a1=Math.atan2(T[3*ri],T[3*ri+2]),a2=Math.atan2(T[3*rj],T[3*rj+2]);ang=Math.abs(deg(a1-a2))%360;if(ang>180)ang=360-ang;}
    liste.push({sI:ri*ds,sJ:rj*ds,dy:dy,dyMin:dyMin,ecartPlan:rd,angle:ang,dangereux:dyMin<thick+4});}
  liste.sort((a,b)=>a.sI-b.sI);
  return {nb:liste.length,parKm:liste.length/km,dangereux:liste.filter(c=>c.dangereux).length,liste:liste,seuilDanger:thick+4};
}

/* ============================ 4. RACCOURCIS (balistique) ============================ */
function prepareSim(tr){
  const n=tr.trou.length,ds=tr.pas,P=Float64Array.from(tr.p),T=Float64Array.from(tr.t),N=Float64Array.from(tr.n),B=Float64Array.from(tr.b);
  const U=new Float64Array(3*n),F=new Float64Array(3*n),land=new Uint8Array(n),solide=new Uint8Array(n);
  for(let i=0;i<n;i++){const o=3*i,sg=N[o+1]>0?1:-1;
    U[o]=sg*N[o];U[o+1]=sg*N[o+1];U[o+2]=sg*N[o+2]; /* la normale de la face tournée vers le HAUT */
    const dec=sg>0?0:tr.thick; /* dalle à l'endroit : la face roulable est le dessus (P) ; à l'envers : le dessous, thick plus bas le long de N */
    F[o]=P[o]-dec*N[o];F[o+1]=P[o+1]-dec*N[o+1];F[o+2]=P[o+2]-dec*N[o+2];
    solide[i]=tr.trou[i]?0:1;land[i]=(solide[i]&&Math.abs(N[o+1])>.3)?1:0;}
  const C=40;let minx=1e18,minz=1e18,maxx=-1e18,maxz=-1e18;
  for(let i=0;i<n;i++)if(solide[i]){const x=P[3*i],z=P[3*i+2];if(x<minx)minx=x;if(x>maxx)maxx=x;if(z<minz)minz=z;if(z>maxz)maxz=z;}
  const gx=Math.floor((maxx-minx)/C)+3,gz=Math.floor((maxz-minz)/C)+3,cnt=new Int32Array(gx*gz+1);
  const cel=i=>(Math.floor((P[3*i]-minx)/C)+1)+gx*(Math.floor((P[3*i+2]-minz)/C)+1);
  for(let i=0;i<n;i++)if(solide[i])cnt[cel(i)+1]++;
  for(let c=0;c<gx*gz;c++)cnt[c+1]+=cnt[c];
  const liste=new Int32Array(cnt[gx*gz]),rem=cnt.slice(0,gx*gz);
  for(let i=0;i<n;i++)if(solide[i])liste[rem[cel(i)]++]=i;
  return {n,ds,P,T,N,B,U,F,land,C,minx,minz,gx,gz,deb:cnt,liste,half:tr.half,thick:tr.thick,g:tr.g,spd:tr.spd,minY:tr.minY};
}
/* UNE trajectoire. Écrit son issue dans R : type 0 mort · 1 pose · 2 tranche (BUMP) · 3 temps écoulé. */
function trajectoire(S,i,sigma,V,u,dt,R){
  const {P,T,N,B,U,F,land,C,minx,minz,gx,gz,deb,liste,ds,half,thick,g,spd,minY}=S;
  const o=3*i;
  let qx=P[o]+sigma*half*B[o]+H_DEPART*N[o],qy=P[o+1]+sigma*half*B[o+1]+H_DEPART*N[o+1],qz=P[o+2]+sigma*half*B[o+2]+H_DEPART*N[o+2];
  R.sx=qx;R.sy=qy;R.sz=qz;
  let vx=V*T[o],vy=V*T[o+1],vz=V*T[o+2];
  const TL=.75*ds,R2=(half+9)*(half+9),hl=half-1,hb=half+2,nmax=Math.round(T_MAX/dt),yMort=minY-120;
  for(let k=1;k<=nmax;k++){
    /* le volant : le cap tourne autour de la verticale (ω = u·(1,15 + min(0,6 ; 0,004·|v_jeu|))), puis la gravité monde */
    const w=u*(1.15+Math.min(.6,.004*Math.sqrt(vx*vx+vy*vy+vz*vz)/spd))*dt;
    if(w){const c=Math.cos(w),s=Math.sin(w),nx=vx*c-vz*s;vz=vx*s+vz*c;vx=nx;}
    vy-=g*dt;
    const px=qx,py=qy,pz=qz;qx+=vx*dt;qy+=vy*dt;qz+=vz*dt;
    if(qy<yMort){R.type=0;R.t=k*dt;return;}
    const cx=Math.floor((qx-minx)/C)+1,cz=Math.floor((qz-minz)/C)+1;
    let aMin=2,jMin=-1,tauMin=0,tranche=false;
    for(let dz=-1;dz<=1;dz++){const zz=cz+dz;if(zz<0||zz>=gz)continue;
      for(let dx=-1;dx<=1;dx++){const xx=cx+dx;if(xx<0||xx>=gx)continue;const c=xx+gx*zz;
        for(let m=deb[c],mf=deb[c+1];m<mf;m++){
          const j=liste[m],oj=3*j,ex=qx-P[oj],ez=qz-P[oj+2];
          if(ex*ex+ez*ez>R2)continue;
          if(land[j]){ /* le plan de la face qui regarde le ciel : franchi de haut en bas pendant ce pas ? */
            const h1=(qx-F[oj])*U[oj]+(qy-F[oj+1])*U[oj+1]+(qz-F[oj+2])*U[oj+2];
            if(h1<=0){const h0=(px-F[oj])*U[oj]+(py-F[oj+1])*U[oj+1]+(pz-F[oj+2])*U[oj+2];
              if(h0>0){const a=h0/(h0-h1);
                if(a<aMin){const fx=px+(qx-px)*a-P[oj],fy=py+(qy-py)*a-P[oj+1],fz=pz+(qz-pz)*a-P[oj+2];
                  const tau=fx*T[oj]+fy*T[oj+1]+fz*T[oj+2];
                  if(tau<=TL&&tau>=-TL){const l=fx*B[oj]+fy*B[oj+1]+fz*B[oj+2];
                    if(l<hl&&l>-hl){aMin=a;jMin=j;tauMin=tau;}}}}}}
          /* la tranche (et le corps de la dalle) : |lat| < half+2 et hauteur entre −épaisseur et 0 — un heurt, pas une pose */
          if(!tranche){const ey=qy-P[oj+1],tau1=ex*T[oj]+ey*T[oj+1]+ez*T[oj+2];
            if(tau1<=TL&&tau1>=-TL){const hN=ex*N[oj]+ey*N[oj+1]+ez*N[oj+2];
              if(hN<=0&&hN>=-thick){const l1=ex*B[oj]+ey*B[oj+1]+ez*B[oj+2];if(l1<hb&&l1>-hb)tranche=true;}}}
        }}}
    if(jMin>=0){R.type=1;R.t=(k-1+aMin)*dt;R.j=jMin;R.sL=jMin*ds+tauMin;
      R.qx=px+(qx-px)*aMin;R.qy=py+(qy-py)*aMin;R.qz=pz+(qz-pz)*aMin;R.vx=vx;R.vy=vy;R.vz=vz;return;}
    if(tranche){R.type=2;R.t=k*dt;return;}
  }
  R.type=3;R.t=nmax*dt;
}
function raccourcis(tr){
  const S=prepareSim(tr),n=S.n,ds=S.ds,half=S.half,km=tr.L/1000,vPal=tr.vPal,VITESSES=FACT_VIT.map(f=>Math.round(vPal*f*10)/10);
  const dt=tr.L>14000?1/30:1/60,pasI=Math.max(1,Math.round(PAS_DECOL/ds)),R={};
  const stat={trajectoires:0,pose:0,poseSurSaRoute:0,poseAvant:0,tranche:0,mort:0,temps:0,decollages:0,dt:dt};
  const cands=[],pieges=[];
  for(let i=0;i<n;i+=pasI){
    if(!S.land[i]||S.N[3*i+1]<=.3)continue; /* on décolle du dessus d'une dalle qui existe, pas d'une paroi ni du vide */
    stat.decollages++;const sI=i*ds;
    for(const sigma of [1,-1])for(const V of VITESSES)for(const u of VOLANTS){
      stat.trajectoires++;trajectoire(S,i,sigma,V,u,dt,R);
      if(R.type===0){stat.mort++;continue;}if(R.type===2){stat.tranche++;continue;}if(R.type===3){stat.temps++;continue;}
      stat.pose++;
      if(R.sL<=sI+100){stat.poseSurSaRoute++;
        if(R.sL<sI-300){const oj=3*R.j,tx=S.T[oj],tz=S.T[oj+2];const ang=deg(Math.acos(Math.max(-1,Math.min(1,(R.vx*tx+R.vz*tz)/(Math.hypot(R.vx,R.vz)*Math.hypot(tx,tz)||1)))));
          if(ang<=ANG_PROPRE)pieges.push({sI:sI,sP:R.sL,perte:sI-R.sL,chute:R.sy-R.qy,ang:ang});}
        continue;} /* retour sur sa propre route : pas un raccourci (en ARRIÈRE de plus de 300 m, pose propre : un PIÈGE) */
      const dir=Math.hypot(R.qx-R.sx,R.qy-R.sy,R.qz-R.sz),gain=(R.sL-sI)-dir;
      if(gain<GAIN_MIN){stat.poseAvant++;continue;}
      /* angle de pose : la vitesse horizontale contre la tangente de la route d'arrivée (à défaut, projetée dans le plan de la dalle) */
      const oj=3*R.j;let tx=S.T[oj],tz=S.T[oj+2],vx=R.vx,vz=R.vz,ang;
      if(Math.hypot(tx,tz)>=.3)ang=Math.acos(Math.max(-1,Math.min(1,(vx*tx+vz*tz)/(Math.hypot(vx,vz)*Math.hypot(tx,tz)||1))));
      else{const vn=R.vx*S.U[oj]+R.vy*S.U[oj+1]+R.vz*S.U[oj+2],ax=R.vx-vn*S.U[oj],ay=R.vy-vn*S.U[oj+1],az=R.vz-vn*S.U[oj+2];
        ang=Math.acos(Math.max(-1,Math.min(1,(ax*S.T[oj]+ay*S.T[oj+1]+az*S.T[oj+2])/(Math.hypot(ax,ay,az)||1))));}
      cands.push({sI:sI,i:i,sigma:sigma,V:V,u:u,sP:R.sL,gain:gain,ang:deg(ang),t:R.t,chute:R.sy-R.qy,dist:dir,
        propre:deg(ang)<=ANG_PROPRE,rentable:gain>=GAIN_RENTABLE&&deg(ang)<=ANG_PROPRE});
    }
  }
  /* regroupement : les rentables d'abord (par gain), puis le reste ; un candidat absorbe tout ce qui est à moins de 100 m en décollage ET en pose */
  const ordre=cands.slice().sort((a,b)=>(b.rentable-a.rentable)||(b.gain-a.gain)),pris=new Uint8Array(ordre.length),groupes=[];
  for(let k=0;k<ordre.length;k++){if(pris[k])continue;const c=ordre[k],mem=[c];pris[k]=1;
    for(let q=k+1;q<ordre.length;q++)if(!pris[q]&&Math.abs(ordre[q].sI-c.sI)<100&&Math.abs(ordre[q].sP-c.sP)<100){pris[q]=1;mem.push(ordre[q]);}
    const bons=mem.filter(m=>m.propre&&m.gain>=GAIN_MIN),pool=bons.length?bons:mem;
    const meilleur=mem.reduce((a,b)=>(b.rentable!==a.rentable?b.rentable:b.gain>a.gain)?b:a,mem[0]);
    const vit=[...new Set(pool.map(m=>m.V))].sort((a,b)=>a-b),vol=[...new Set(pool.filter(m=>m.V===meilleur.V).map(m=>m.u))].sort((a,b)=>a-b);
    groupes.push({sDecol:[Math.min(...mem.map(m=>m.sI)),Math.max(...mem.map(m=>m.sI))],sPose:meilleur.sP,sPosePlage:[Math.min(...mem.map(m=>m.sP)),Math.max(...mem.map(m=>m.sP))],
      chute:meilleur.chute,gainMax:Math.max(...mem.map(m=>m.gain)),gainMeilleur:meilleur.gain,tVol:meilleur.t,vitesses:vit,volants:vol,angle:meilleur.ang,
      cote:meilleur.sigma>0?'+B':'-B',cotes:[...new Set(mem.map(m=>m.sigma>0?'+B':'-B'))],rentable:mem.some(m=>m.rentable),membres:mem.length});}
  groupes.sort((a,b)=>b.gainMax-a.gainMax);
  const pg=[];for(const c of pieges.sort((a,b)=>b.perte-a.perte)){if(pg.some(g=>Math.abs(g.sI-c.sI)<100&&Math.abs(g.sP-c.sP)<150))continue;pg.push(c);}
  const rent=groupes.filter(g=>g.rentable);
  return {pieges:pg.length,piegesKm:pg.length/km,piegesTop:pg.slice(0,8).map(g=>[Math.round(g.sI),Math.round(g.sP),Math.round(g.chute)]),vitesses:VITESSES,stat,nb:groupes.length,rentables:rent.length,rentablesKm:rent.length/km,gros:rent.filter(g=>g.gainMax>=400).length,meilleurGain:groupes.length?groupes[0].gainMax:0,
    top:groupes.slice(0,10),tous:groupes};
}

/* ============================ 5. VERDICT ============================ */
function verdict(r){
  const val={penteMoy:r.profil.penteMoy,partMontee:r.profil.partMontee,virKm:r.course.viragesKm,droiteSec:r.course.droiteSec,raccKm:r.raccourcis.rentablesKm,
    croisDang:r.croisements.dangereux,infr:r.course.infranchissables,serresKm:r.course.serresKm,enchKm:r.course.enchainementsKm,penteMax:r.profil.penteMax};
  return CIBLES.filter(c=>c.actif!==false).map(c=>{const v=val[c.k];
    const ok=c.op==='>='?v>=c.v:c.op==='<='?v<=c.v:Math.abs(v-c.v)<1e-9;
    return {k:c.k,lib:c.lib,op:c.op,cible:c.v,u:c.u,valeur:v,ok:ok};});
}

/* ============================ SORTIE TEXTE ============================ */
function texte(r){
  const o=[],p=r.profil,c=r.course,x=r.croisements,s=r.raccourcis;
  o.push('=== BANC RACCOURCIS — '+r.meta.carte+' ('+r.meta.meteo+'), graine '+r.meta.graine+(r.meta.graineOk===false?'  ⚠ GRAINE NON PRISE':'')+' ===');
  o.push('Piste : L '+fr(p.L,0)+' m · échantillons '+r.meta.pas+' m · demi-largeur '+r.meta.half+' m · épaisseur '+r.meta.thick+' m · g '+fr(r.meta.g,2)+' m/s² · minY '+fr(p.minY,0)+' m · échelle de piste '+fr(r.meta.lv,2)+' · bâtie en '+r.meta.msBati+' ms');
  o.push('');o.push('1. PROFIL');
  o.push('   altitude départ (200 premiers m) '+fr(p.yDepart,0)+' m · arrivée (200 derniers) '+fr(p.yArrivee,0)+' m · DÉNIVELÉ '+fr(p.denivele,0)+' m → pente moyenne '+fr(p.penteMoy)+' %');
  o.push('   descente cumulée '+fr(p.descenteCumulee,0)+' m · montée cumulée '+fr(p.monteeCumulee,0)+' m · part de la longueur en MONTÉE (>+2 %) '+fr(p.partMontee)+' %');
  o.push('   pente max lissée 20 m : descente '+fr(p.penteMaxDescente)+' % · montée '+fr(p.penteMaxMontee)+' %');
  o.push('');o.push('2. COURSE');
  o.push('   virages '+c.virages+' ('+fr(c.viragesKm,2)+'/km) · enchaînements (<150 m) '+c.enchainements+' ('+fr(c.enchainementsKm,2)+'/km) · cap tourné '+fr(c.degresCapKm,0)+' °/km');
  o.push('   plus longue ligne droite : '+fr(c.droiteMax,0)+' m (à partir de s='+fr(c.droiteDe,0)+' m) = '+fr(c.droiteSec)+' s à vPal ('+fr(c.vPal,0)+' m/s) · '+fr(c.droiteMax/70)+' s à 70 · '+fr(c.droiteMax/100)+' s à 100 · '+fr(c.droiteMax/140)+' s à 140 m/s');
  o.push('   VIRAGES / PALIER '+r.meta.eng+' : vPal '+fr(c.vPal,0)+' m/s ('+fr(c.vPal*3.6,0)+' km/h) · rMin = rayonPalier = '+fr(c.rMin,0)+' m (1,5 × = '+fr(1.5*c.rMin,0)+' m)');
  o.push('     rayon d\'axe le plus serré : '+fr(c.rayonMinGlobal,0)+' m'+(c.rayonMinEn!=null?' (en s='+fr(c.rayonMinEn,0)+' m)':'')+' · INFRANCHISSABLES (< rMin) : '+c.infranchissables+' ('+fr(c.infranchissablesKm,2)+'/km) · SERRÉS (rMin à 1,5 × rMin) : '+c.serres+' ('+fr(c.serresKm,2)+'/km) · sous 1,5 × rMin en tout : '+c.sousUnVirgule5);
  const pires=c.liste.filter(v=>v.rayonMin<1.5*c.rMin).sort((a,b)=>a.rayonMin-b.rayonMin).slice(0,6);
  for(const v of pires)o.push('       · s='+fr(v.s0,0).padStart(6)+'–'+fr(v.s1,0).padStart(6)+'  cap '+fr(v.angle,0)+'°  rayon '+fr(v.rayonMin,0)+' m  '+(v.rayonMin<c.rMin?'✗ INFRANCHISSABLE':'serré'));
  o.push('');o.push('3. CROISEMENTS (axes à moins de '+fr(2*r.meta.half,0)+' m en plan, ≥ 150 m de route entre les deux)');
  o.push('   '+x.nb+' croisements ('+fr(x.parKm,2)+'/km) dont '+x.dangereux+' DANGEREUX (|dy| < '+fr(x.seuilDanger)+' m)');
  for(const q of x.liste.slice(0,14))o.push('   · s='+fr(q.sI,0).padStart(6)+' → s='+fr(q.sJ,0).padStart(6)+'  dy '+(q.dy>=0?'+':'')+fr(q.dy)+' m (min '+fr(q.dyMin)+')  angle '+fr(q.angle,0)+'°'+(q.dangereux?'   ✗ DANGEREUX':''));
  if(x.liste.length>14)o.push('   · … '+(x.liste.length-14)+' de plus');
  o.push('');o.push('4. RACCOURCIS JOUABLES  (vitesses '+s.vitesses.map(v=>fr(v,0)).join('/')+' m/s = vPal × '+FACT_VIT.map(v=>fr(v,2)).join('/')+' · volant '+VOLANTS.map(v=>fr(v,1)).join(' ')+' · décollage tous les '+PAS_DECOL+' m, deux côtés · dt 1/'+Math.round(1/s.stat.dt)+')');
  o.push('   '+s.stat.trajectoires+' trajectoires depuis '+s.stat.decollages+' points : '+s.stat.pose+' poses ('+s.stat.poseSurSaRoute+' sur sa propre route, '+s.stat.poseAvant+' de gain <'+GAIN_MIN+' m), '+s.stat.tranche+' heurts de tranche, '+s.stat.mort+' morts (plancher), '+s.stat.temps+' temps écoulé');
  o.push('   raccourcis distincts (gain ≥ '+GAIN_MIN+' m) : '+s.nb+' · RENTABLES (gain ≥ '+GAIN_RENTABLE+' m et pose ≤ '+ANG_PROPRE+'°) : '+s.rentables+' ('+fr(s.rentablesKm,2)+'/km) dont '+s.gros+' GROS (≥ 400 m) · meilleur gain '+fr(s.meilleurGain,0)+' m');
  if(s.top.length){o.push('   les '+s.top.length+' meilleurs par gain :');
    o.push('     #  décollage s (plage)   pose s    chute  gain  vol    vitesses (m/s)   volant       angle   côté   rentable');
    s.top.forEach((g,k)=>o.push('    '+String(k+1).padStart(2)+'  '+(fr(g.sDecol[0],0)+'–'+fr(g.sDecol[1],0)).padEnd(19)+' '+fr(g.sPose,0).padStart(7)+'  '+fr(g.chute,0).padStart(5)+' m '+fr(g.gainMax,0).padStart(5)+' '+(fr(g.tVol)+' s').padStart(6)+'  '+g.vitesses.map(v=>fr(v,0)).join(',').padEnd(15)+'  '+g.volants.map(v=>fr(v,1)).join(' ').padEnd(12)+' '+(fr(g.angle,0)+'°').padStart(5)+'   '+g.cote.padEnd(4)+'   '+(g.rentable?'✓':'—')));}
  o.push('   PIÈGES (pose propre sur la route d avant, ≥ 300 m en arrière) : '+s.pieges+' ('+fr(s.piegesKm,2)+'/km) · '+JSON.stringify(s.piegesTop));
  o.push('');o.push('5. VERDICT');
  for(const v of r.verdict)o.push('   '+(v.ok?'✓':'✗')+' '+v.lib.padEnd(40)+' '+fr(v.valeur,2).padStart(8)+' '+v.u.padEnd(3)+'  (cible '+v.op+' '+v.cible+')');
  o.push('');o.push('Temps : acquisition '+fr(r.temps.acquisitionMs/1000)+' s · analyse '+fr(r.temps.analyseMs/1000)+' s (dont raccourcis '+fr(r.temps.raccMs/1000)+' s)');
  return o.join('\n');
}

/* ============================ PRINCIPAL ============================ */
function mesure(tr,tAcq){
  const t0=Date.now();
  if(!(tr.vPal>0)){tr.vPal=vPalDe(opt('palier')!=null?PALIER:(tr.eng|0));tr.vPalCalcule=true;if(opt('palier')!=null)tr.eng=PALIER;} /* trace sans vPal : calculé d'après --palier (sinon le palier de la trace) */
  if(!(tr.rMin>0))tr.rMin=rMinDe(tr.vPal);
  const pc=profilEtCourse(tr),cr=croisements(tr),t1=Date.now(),rc=raccourcis(tr),t2=Date.now();
  const r={meta:{carte:tr.carte,meteo:tr.meteo,piste:tr.piste,graine:tr.graine,graineOk:tr.graineOk,vPal:tr.vPal,rMin:tr.rMin,half:tr.half,thick:tr.thick,g:tr.g,spd:tr.spd,pas:tr.pas,lv:tr.lv,eng:tr.eng,msBati:tr.msBati,NP:tr.NP},
    profil:pc.profil,course:pc.course,croisements:cr,raccourcis:rc};
  r.verdict=verdict(r);r.temps={acquisitionMs:tAcq,analyseMs:t2-t0,raccMs:t2-t1,totalMs:tAcq+(t2-t0)};
  return r;
}
(async()=>{
  let traces,tAcq=0;
  if(DEPUIS){traces=JSON.parse(fs.readFileSync(DEPUIS,'utf8'));if(!Array.isArray(traces))traces=[traces];}
  else{const ta=Date.now();traces=await acquiert();tAcq=Date.now()-ta;if(SAUVE)fs.writeFileSync(SAUVE,JSON.stringify(traces));}
  const res=traces.map(tr=>mesure(tr,tAcq/traces.length));
  const total=Date.now()-T0;
  if(JSON_OUT){process.stdout.write(JSON.stringify(res.length===1?Object.assign(res[0],{tempsTotalMs:total}):{mesures:res,tempsTotalMs:total},(k,v)=>(k==='tous'?undefined:v))+'\n',()=>process.exit(0));return;}
  for(const r of res)console.log(texte(r)+'\n');console.log('Temps total : '+fr(total/1000)+' s');
  process.stdout.write('',()=>process.exit(0));
})().catch(e=>{console.error('RACCOURCIS KO :',e&&e.stack||e);try{require('C:/Users/sacha/cc-banc/lib.cjs')._verrou.rend();}catch(_){}process.exit(2);});
