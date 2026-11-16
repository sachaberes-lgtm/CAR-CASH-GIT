/* L'ENDROIT / L'ENVERS DANS LES VIRAGES DE L'ORBITE (2026-11-14, Sacha : « espace a besoin de plus de virages qui exploitent le concept de à l'endroit / à l'envers »).
   Mesure, sur la route finale (après pisteTord), à la VITESSE RÉELLE (croisière × élan) :
     - le virage en plan : °/km, amplitude du cap déroulé ;
     - le roulis de la dalle (angle de N au « haut » du repère de la route) : part du TEMPS à plat (< 20°), penchée (20-60°), couchée (60-90°), à l'envers (> 90°) ;
     - LA MÊME CHOSE PONDÉRÉE PAR LE VIRAGE : part des degrés tournés à plat / penchée / couchée / à l'envers  → « les virages jouent-ils l'envers ? » ;
     - les CHANGEMENTS DE FACE par route (franchissements de 90° de roulis) et combien se font DANS un virage (> 6°/s de cap) ;
     - les S QUI CHANGENT DE FACE : inversions du côté du virage où le roulis change de signe en passant par l'envers (|roulis| > 90° d'un côté ou de l'autre) ;
     - le plus long passage À PLAT (s réelles) et le plus long passage sans franchir 60° ;
     - par module (MODMARK) : °/km, roulis max, part à l'envers.
   node outils/banc-routes/endroit-envers.cjs <racine> [paliers=0,5,10,20] [graines=1-16] [detail=1] [modules=1]      (SEARCH='?espace=v4' pour une variante) */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,5,10,20').split(',').map(Number),G=(arg('graines')||'1-16').split('-').map(Number),detail=arg('detail')==='1',parMod=arg('modules')==='1';
const ELAN=function(p){return 1.8+(1-1.8)*Math.min(1,p/25);};
const D=57.2958;
function mesure(r,p){
  const Q=r.ctrl,N=r.N,n=Q.length,vr=r.vw*ELAN(p);
  /* par segment i-1 → i : longueur, cap en plan, roulis */
  const S=[0],cap=[],roul=[];let capD=0,prev=null;
  for(let i=0;i<n;i++){
    const a=Q[Math.max(0,i-1)],b=Q[Math.min(n-1,i+1)];let tx=b.x-a.x,ty=b.y-a.y,tz=b.z-a.z;const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
    if(i)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
    const h=Math.hypot(tx,tz);let c=prev;if(h>.2){const an=Math.atan2(tx,tz);if(prev==null)capD=an;else{let d=an-(((capD+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI);while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;capD+=d;}c=capD;prev=capD;}
    cap.push(c==null?0:c);
    /* le haut du repère : Y privé de sa part le long de la tangente ; le côté = t × haut */
    let ux=-ty*tx,uy=1-ty*ty,uz=-ty*tz;const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;
    const sx=ty*uz-tz*uy,sy=tz*ux-tx*uz,sz=tx*uy-ty*ux;
    const nn=N?N[i]:{x:0,y:1,z:0};roul.push(Math.atan2(nn.x*sx+nn.y*sy+nn.z*sz,nn.x*ux+nn.y*uy+nn.z*uz)*D);}
  const L=S[n-1],T=L/vr;
  const o={dur:T,km:0,tPlat:0,tPen:0,tCou:0,tEnv:0,dPlat:0,dPen:0,dCou:0,dEnv:0,faces:0,facesVir:0,sFace:0,platMax:0,sous60Max:0,rollMax:0,inter:0,exter:0};
  let tot=0,mn=1e9,mx=-1e9,runPlat=0,run60=0,dernSens=0,dernRoulAuSens=0,vuEnvDepuis=false;
  const W=[]; /* (banc) le taux de virage lissé sur ~1 s */
  for(let i=1;i<n;i++){const ds=S[i]-S[i-1],dt=ds/vr,dc=(cap[i]-cap[i-1])*D,ar=Math.abs((roul[i]+roul[i-1])/2),a=Math.abs(dc);
    tot+=a;mn=Math.min(mn,cap[i]);mx=Math.max(mx,cap[i]);
    if(ar<20){o.tPlat+=dt;o.dPlat+=a;runPlat+=dt;if(runPlat>o.platMax){o.platMax=runPlat;o.platAt=S[i];}}else{runPlat=0;if(ar<60){o.tPen+=dt;o.dPen+=a;}else if(ar<90){o.tCou+=dt;o.dCou+=a;}else{o.tEnv+=dt;o.dEnv+=a;}}
    if(ar<60)run60+=dt;else{o.sous60Max=Math.max(o.sous60Max,run60);run60=0;}
    o.rollMax=Math.max(o.rollMax,ar);
    /* le coucher est-il du côté du cœur du virage ? (cap > 0 = à gauche ; roulis > 0 = N vers le côté t×haut) */
    if(a>.01&&ar>20&&ar<160){if(Math.sign(dc)*Math.sign((roul[i]+roul[i-1])/2)<0)o.inter+=a;else o.exter+=a;}
    const tx=dt>0?a/dt:0;W.push(tx);
    if((Math.abs(roul[i-1])-90)*(Math.abs(roul[i])-90)<0){o.faces++;if(tx>6)o.facesVir++;}
    if(ar>90)vuEnvDepuis=true;
    const sens=a/Math.max(dt,1e-6)>5?Math.sign(dc):0;if(sens&&sens!==dernSens){if(dernSens&&vuEnvDepuis)o.sFace++;dernSens=sens;vuEnvDepuis=false;}}
  /* LES VIRAGES UN PAR UN : une suite de segments qui tournent du même côté (> 4°/s réels), d'au moins 30° ; son roulis le plus fort → à plat / penché / relevé / au plafond ; LES ÉPISODES À L'ENVERS : passages continus à plus de 90° */
  o.vir={plat:0,pen:0,rel:0,pla:0,n:0};o.epi=0;o.env1=-1;{let sg=0,deg=0,rm=0,dansEnv=false;const clos=function(){if(deg>=30){o.vir.n++;if(rm<20)o.vir.plat++;else if(rm<60)o.vir.pen++;else if(rm<90)o.vir.rel++;else o.vir.pla++;}deg=0;rm=0;};
    for(let i=1;i<n;i++){const dt=(S[i]-S[i-1])/vr,dc=(cap[i]-cap[i-1])*D,ar=Math.abs(roul[i]),tx=dt>0?Math.abs(dc)/dt:0,s9=tx>4?Math.sign(dc):0;if(s9!==sg){clos();sg=s9;}if(sg){deg+=Math.abs(dc);rm=Math.max(rm,ar);}
      if(ar>90&&!dansEnv){dansEnv=true;o.epi++;if(o.env1<0)o.env1=S[i]/L;}else if(ar<80)dansEnv=false;}clos();}
  {const ms=(r.marks||[]).filter(function(m){return m.fig;}),sa=o.platAt||0;let ou='liaison';for(const m of ms){if(sa>=S[Math.max(0,m.i0)]-5&&sa<=S[Math.min(n-1,m.i1)]+5)ou=m.fig;}if(ms.length&&sa>S[Math.min(n-1,ms[ms.length-1].i1)]+5)ou='arrivée';if(ms.length&&sa<S[Math.max(0,ms[0].i0)]-5)ou='départ';o.platOu=ou;}
  o.sous60Max=Math.max(o.sous60Max,run60);
  o.km=tot/(L/1000);o.amp=(mx-mn)*D;o.L=L;o.tot=tot;
  /* par module */
  o.mods=(r.marks||[]).filter(function(m){return m.fig;}).map(function(m){const i0=Math.max(1,m.i0),i1=Math.min(n-1,m.i1);let d=0,rm=0,te=0,t=0;for(let i=i0;i<=i1;i++){const dt=(S[i]-S[i-1])/vr;d+=Math.abs(cap[i]-cap[i-1])*D;const ar=Math.abs(roul[i]);rm=Math.max(rm,ar);t+=dt;if(ar>90)te+=dt;}
    return {fig:(m.climax?'*':'')+m.fig,L:S[i1]-S[i0-1],deg:d,rollMax:rm,tEnv:te,t:t};});
  return o;}
const pc=function(x){return (x*100).toFixed(0).padStart(3)+'%';};
const ZM={};
for(const p of PAL){const R=[];
  for(let g=G[0];g<=G[1];g++){let r;try{r=B.piste('espace',g,p);}catch(e){console.log('p'+p,'g'+g,'ERREUR',e.message);continue;}const o=mesure(r,p);o.g=g;R.push(o);
    for(const m of o.mods){const z=ZM[m.fig]||(ZM[m.fig]={n:0,L:0,deg:0,rm:0,te:0,t:0});z.n++;z.L+=m.L;z.deg+=m.deg;z.rm=Math.max(z.rm,m.rollMax);z.te+=m.tEnv;z.t+=m.t;}
    if(detail)console.log('p'+p,'g'+String(g).padStart(2),o.dur.toFixed(0).padStart(3)+'s',(o.L/1000).toFixed(1)+'km','°/km',o.km.toFixed(0).padStart(3),'amp',o.amp.toFixed(0).padStart(3),'| temps plat/pen/cou/env',pc(o.tPlat/o.dur)+pc(o.tPen/o.dur)+pc(o.tCou/o.dur)+pc(o.tEnv/o.dur),'| virage plat/pen/cou/env',pc(o.dPlat/o.tot)+pc(o.dPen/o.tot)+pc(o.dCou/o.tot)+pc(o.dEnv/o.tot),'| faces',o.faces,'dont en virage',o.facesVir,'S-face',o.sFace,'| virages plat/pen/rel/plafond',o.vir.plat+'/'+o.vir.pen+'/'+o.vir.rel+'/'+o.vir.pla,'épisodes envers',o.epi,'1er à',pc(o.env1),'| plat max',o.platMax.toFixed(1)+'s ('+o.platOu+')','<60° max',o.sous60Max.toFixed(1)+'s','|',o.mods.map(function(m){return m.fig;}).join(' '));}
  const moy=function(f){return R.reduce(function(a,x){return a+f(x);},0)/R.length;},mxf=function(f){return Math.max.apply(null,R.map(f));},mnf=function(f){return Math.min.apply(null,R.map(f));};
  console.log('PALIER',p,'('+R.length+' routes, durée moy',moy(function(x){return x.dur;}).toFixed(0)+' s réelles)');
  console.log('  virage : °/km',moy(function(x){return x.km;}).toFixed(0),'(min',mnf(function(x){return x.km;}).toFixed(0)+') · amplitude du cap',moy(function(x){return x.amp;}).toFixed(0)+'°','(min',mnf(function(x){return x.amp;}).toFixed(0)+')');
  console.log('  TEMPS  : à plat <20°',pc(moy(function(x){return x.tPlat/x.dur;})),'· penchée 20-60°',pc(moy(function(x){return x.tPen/x.dur;})),'· couchée 60-90°',pc(moy(function(x){return x.tCou/x.dur;})),'· à l\'envers >90°',pc(moy(function(x){return x.tEnv/x.dur;})));
  console.log('  VIRAGE : à plat <20°',pc(moy(function(x){return x.dPlat/x.tot;})),'· penchée 20-60°',pc(moy(function(x){return x.dPen/x.tot;})),'· couchée 60-90°',pc(moy(function(x){return x.dCou/x.tot;})),'· à l\'envers >90°',pc(moy(function(x){return x.dEnv/x.tot;})),'  (part des degrés tournés)');
  console.log('  changements de face par route : moy',moy(function(x){return x.faces;}).toFixed(1),'(min',mnf(function(x){return x.faces;})+', max',mxf(function(x){return x.faces;})+') · dont dans un virage',moy(function(x){return x.facesVir;}).toFixed(1),'· S qui changent de côté après un passage à l\'envers : moy',moy(function(x){return x.sFace;}).toFixed(1),'(routes à 0 :',R.filter(function(x){return !x.sFace;}).length+')');
  console.log('  VIRAGES (≥ 30°) par route : moy',moy(function(x){return x.vir.n;}).toFixed(1),'· à plat',moy(function(x){return x.vir.plat;}).toFixed(1),'· penchés 20-60°',moy(function(x){return x.vir.pen;}).toFixed(1),'· relevés 60-90°',moy(function(x){return x.vir.rel;}).toFixed(1),'· AU PLAFOND >90°',moy(function(x){return x.vir.pla;}).toFixed(1),'(min',mnf(function(x){return x.vir.pla;})+')');
  console.log('  ÉPISODES A PLUS DE 90° par route : moy',moy(function(x){return x.epi;}).toFixed(2),'(min',mnf(function(x){return x.epi;})+', max',mxf(function(x){return x.epi;})+') · le 1er commence à',pc(moy(function(x){return Math.max(0,x.env1);})),'de la route (au plus tôt',pc(mnf(function(x){return x.env1<0?1:x.env1;}))+')');
  {const c={};for(const x of R)c[x.platOu]=(c[x.platOu]|0)+1;console.log('  où finit le plus long passage à plat :',Object.keys(c).map(function(k){return k+' '+c[k];}).join(' · '),'· routes à plus de 6 s à plat :',R.filter(function(x){return x.platMax>6;}).length+'/'+R.length);}
  console.log('  plus long passage à plat : moy',moy(function(x){return x.platMax;}).toFixed(1)+' s, max',mxf(function(x){return x.platMax;}).toFixed(1),'s · plus long sans dépasser 60° : moy',moy(function(x){return x.sous60Max;}).toFixed(1)+' s, max',mxf(function(x){return x.sous60Max;}).toFixed(1),'s · coucher vers le cœur du virage :',pc(moy(function(x){return x.inter/Math.max(1,x.inter+x.exter);})));}
if(parMod){console.log('PAR MODULE (tous paliers) : n · longueur moy · °/km · roulis max · part du temps à l\'envers');
  for(const k of Object.keys(ZM).sort(function(a,b){return ZM[b].L-ZM[a].L;})){const z=ZM[k];console.log(' ',k.padEnd(16),String(z.n).padStart(3),(z.L/z.n).toFixed(0).padStart(5)+' m',(z.deg/(z.L/1000)).toFixed(0).padStart(4)+' °/km',z.rm.toFixed(0).padStart(4)+'°',pc(z.te/Math.max(1e-6,z.t)));}}
