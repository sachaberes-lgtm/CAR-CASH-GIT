/* mesure-villes.cjs : la route de la ville et de Crypto City — droites, notes, raccourcis, scènes, dévers, et LA RÈGLE DES 10 SECONDES (Sacha, 13/11 :
   « pas de torsade trop serrée et pas plus de 10 secondes dans une même direction ») :
   · sens  : la plus longue suite qui tourne TOUJOURS du même côté (les droites entre deux virages comptent ; un contre-virage de 15° remet à zéro), en secondes ;
   · cap   : le plus long temps passé à moins de ±12° du même cap (une droite, ou une courbe si large qu'on ne la sent pas), en secondes ;
   · rmin  : le plus petit rayon des virages de plus de 200° (une « torsade »), en rayons tenables (rP).
   node mesure-villes.cjs [graines=1-40] [paliers=0,10,20] [carte=ville,crypto] [detail=1]   (SEARCH='?sans=villeame' : la ville d'avant) */
const B=require('./charge.cjs'),ctx=B.ctx,vm=require('vm');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const [g0,g1]=arg('graines','1-40').split('-').map(Number),PAL=arg('paliers','0,10,20').split(',').map(Number),CARTES=arg('carte','ville,crypto').split(',');
const SCENES=['traversee','passerelle','facade','spirale','crete','portes','plongee','noeud','tourgeante','rondpoint','moon','parking'];
function regle10(ctrl,vP,rP,marks){
  const T=ctx.THREE,cv=new T.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,ctrl.length*16);
  const L=cv.getLength(),N=Math.max(50,Math.round(L/5)),P=cv.getSpacedPoints(N),ds=L/N,H=new Float64Array(N+1);
  for(let i=0;i<=N;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(N,i+1)];H[i]=Math.atan2(b.x-a.x,b.z-a.z);}
  for(let i=1;i<=N;i++){let d=H[i]-H[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;H[i]=H[i-1]+d;} /* le cap déroulé */
  /* sens : on suit le cap ; la suite continue tant qu'on ne revient pas de 15° en arrière depuis l'extrême atteint dans le sens de la suite */
  let sens=0,sensAt=0;{let i0=0,ext=H[0],sg=0;
    for(let i=1;i<=N;i++){const d=H[i]-H[i0];
      if(sg===0){if(Math.abs(d)>.26){sg=Math.sign(d);ext=H[i];}continue;}
      if(sg*(H[i]-ext)>0)ext=H[i];
      if(sg*(ext-H[i])>.26){const t=(i-i0)*ds/vP;if(t>sens){sens=t;sensAt=i0*ds;}let j=i;while(j>i0&&sg*(H[j-1]-H[j])>0)j--;i0=j;sg=-sg;ext=H[i];}}
    const t=(N-i0)*ds/vP;if(sg!==0&&t>sens){sens=t;sensAt=i0*ds;}}
  /* cap : à moins de ±12° du même cap */
  let cap=0,capAt=0;{let j=0;for(let i=0;i<=N;i++){if(j<i)j=i;let lo=H[i],hi=H[i];for(let k=i;k<=j;k++){lo=Math.min(lo,H[k]);hi=Math.max(hi,H[k]);}
      while(j<N){const h=H[j+1];if(Math.max(hi,h)-Math.min(lo,h)>.42)break;j++;lo=Math.min(lo,h);hi=Math.max(hi,h);}
      const t=(j-i)*ds/vP;if(t>cap){cap=t;capAt=i*ds;}if(j>=N)break;}}
  /* rmin : la courbure tenue sur les virages de plus de 200° (fenêtre de 20 m) */
  let rmin=1e9;{const W=Math.max(1,Math.round(10/ds));let a0=0,s0=0,sg=0,kmin=1e9;
    for(let i=W;i<=N-W;i++){const k=(H[i+W]-H[i-W])/(2*W*ds),s=Math.abs(k)>1/(4*rP)?Math.sign(k):0;
      if(s!==0&&s===sg){a0+=Math.abs(k)*ds;kmin=Math.min(kmin,1/Math.abs(k));}else{if(sg!==0&&a0>200/57.3)rmin=Math.min(rmin,kmin/rP);sg=s;a0=s?Math.abs(k)*ds:0;kmin=s?1/Math.abs(k):1e9;}}
    if(sg!==0&&a0>200/57.3)rmin=Math.min(rmin,kmin/rP);}
  /* tour : le plus long virage TENU du même côté (un replat de moins d'1 s ne l'interrompt pas ; un contre-virage, si), en secondes */
  let tour=0,tourAt=0;{const W=Math.max(1,Math.round(10/ds)),kT=1/(6*rP);let st=-1,last=-1,sg=0;
    for(let i=W;i<=N-W;i++){const k=(H[i+W]-H[i-W])/(2*W*ds),s=Math.abs(k)>kT?Math.sign(k):0;
      if(s!==0){if(s===sg&&(i-last)*ds/vP<=1){last=i;}else{if(sg!==0&&st>=0){const t=(last-st)*ds/vP;if(t>tour){tour=t;tourAt=st*ds;}}sg=s;st=i;last=i;}}}
    if(sg!==0&&st>=0){const t=(last-st)*ds/vP;if(t>tour){tour=t;tourAt=st*ds;}}}
  const quoi=function(sAt){const lg=cv.getLengths(),nC=ctrl.length-1,dv=lg.length-1;let best=null;for(const m of marks){const f0=m.i0/nC*dv,f1=m.i1/nC*dv,s0=lg[Math.min(dv,Math.floor(f0))],s1=lg[Math.min(dv,Math.ceil(f1))];if(sAt>=s0-200&&sAt<=s1)best=m.fig||'?';}return best||'liaison';};
  return {tour:tour,tourQuoi:quoi(tourAt),sens:sens,sensQuoi:quoi(sensAt),cap:cap,capQuoi:quoi(capAt),rmin:rmin===1e9?null:rmin};
}
for(const c of CARTES)for(const pal of PAL){
  const vw=B.VW[pal]||78,rP=40+.3*vw;ctx.__setPalier(pal,vw);
  const acc={n:0,dF:0,dS:0,droiteMax:0,note:0,vir:0,infr:0,dou:0,sauts:0,scenes:0,scMin:99,dev:0,devMax:0,s:0,sens:0,sensMax:0,cap:0,capMax:0,rmin:1e9,sens10:0,mods:{},pire:{}};
  for(let g=g0;g<=g1;g++){
    ctx.LVL.cur=c==='crypto'?{id:'ville',crypto:1,carte:'ville',sansFin:1,__al:1}:{id:'ville',carte:'ville',sansFin:1,__al:1};ctx.window.dbgEspOff=false;
    ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
    const ctrl=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0),marks=ctx.MODMARK.map(m=>Object.assign({},m));
    const f=ctx.rythmeMesure(ctrl,{vP:vw,rP:rP,marks:ctx.MODMARK}),note=ctx.rythmeNote(f,ctx.rythmeCible(c)),r10=regle10(ctrl,vw,rP,marks);
    acc.n++;acc.dF+=f.droitesFPart;acc.dS+=f.droiteS;acc.droiteMax=Math.max(acc.droiteMax,f.droiteS);acc.note+=note;acc.vir+=f.virFMin;acc.infr+=f.infr;acc.dou+=f.douilles;acc.s+=f.s;
    acc.tour=(acc.tour||0)+r10.tour;if(r10.tour>(acc.tourMax||0))acc.tourMax=r10.tour;if(r10.tour>10){acc.tour10=(acc.tour10||0)+1;acc.pireT=acc.pireT||{};acc.pireT[r10.tourQuoi]=(acc.pireT[r10.tourQuoi]||0)+1;}if(r10.cap>10){acc.cap10=(acc.cap10||0)+1;acc.pireC=acc.pireC||{};acc.pireC[r10.capQuoi]=(acc.pireC[r10.capQuoi]||0)+1;}acc.sens+=r10.sens;if(r10.sens>acc.sensMax)acc.sensMax=r10.sens;if(r10.sens>10){acc.sens10++;acc.pire[r10.sensQuoi]=(acc.pire[r10.sensQuoi]||0)+1;}
    acc.cap+=r10.cap;if(r10.cap>acc.capMax)acc.capMax=r10.cap;if(r10.rmin!=null)acc.rmin=Math.min(acc.rmin,r10.rmin);
    let sc=0;for(const m of ctx.MODMARK){const k=m.fig||'?';acc.mods[k]=(acc.mods[k]||0)+1;if(k==='saut'||k==='grandsaut')acc.sauts++;if(SCENES.indexOf(k)>=0)sc++;}
    acc.scenes+=sc;acc.scMin=Math.min(acc.scMin,sc);
    const dv=vm.runInContext('VILLE_BANK.max',ctx)||0;{let tot=0;for(const m of ctx.FILETMARK)if(m.anc)for(const a of m.anc)if(a.t!=='geante'&&a.t!=='pile'&&a.t!=='portes')tot++;const per=tot?vm.runInContext('vsMalusDecor',ctx)(ctrl)/3:0;acc.decT=(acc.decT||0)+tot;acc.decP=(acc.decP||0)+per;}acc.dev+=dv;acc.devMax=Math.max(acc.devMax,dv);
    if(arg('detail'))console.log('  g'+g,'s',f.s,'tour',r10.tour.toFixed(1),r10.tourQuoi,'sens',r10.sens.toFixed(1),r10.sensQuoi,'cap',r10.cap.toFixed(1),r10.capQuoi,'rmin',r10.rmin&&r10.rmin.toFixed(2),ctx.MODMARK.map(m=>m.fig||'?').join(','));
  }
  const m=k=>(acc[k]/acc.n).toFixed(2);
  console.log(c.padEnd(7),'p'+String(pal).padEnd(3),'s',m('s'),'dF%',m('dF'),'droiteS',m('dS'),'max',acc.droiteMax,'note',m('note'),'vir/min',m('vir'),'douilles',m('dou'),
    'sauts',m('sauts'),'scenes',m('scenes'),'min',acc.scMin,'devers',m('dev'),'max',acc.devMax,'| decor perdus',(acc.decP||0)+'/'+(acc.decT||0),'| tour',m('tour'),'max',(acc.tourMax||0).toFixed(1),'>10s',acc.tour10||0,JSON.stringify(acc.pireT||{}),'cap>10s',acc.cap10||0,JSON.stringify(acc.pireC||{}),'| sens',m('sens'),'max',acc.sensMax.toFixed(1),'>10s',acc.sens10,JSON.stringify(acc.pire),'cap',m('cap'),'max',acc.capMax.toFixed(1),'rmin',acc.rmin===1e9?'-':acc.rmin.toFixed(2));
}
