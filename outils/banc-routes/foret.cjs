/* banc des RACCOURCIS de LA FORÊT (2026-11-05, game design de la forêt vaste) : charge le VRAI générateur (code/maps/foret-route.js : genForet + forBank),
   rééchantillonne la route comme le jeu (Catmull-Rom centripète, un point tous les 8 m, les normales du dévers rapportées à l'abscisse), puis passe l'analyse de
   raccourcis.cjs (sortie par le bord, vol balistique, pose sur la dalle la plus proche, règle de passation/RACCOURCIS.md).
   node foret.cjs graine palier [--v] [--vieux]   (--vieux : la pelote d'avant, ?foret=pelote)
   node foret.cjs lot palier n [graine0] [--vieux]   (moyennes sur n graines) */
const fs=require('fs'),vm=require('vm'),path=require('path');
const C=require('./charge.cjs'),R=require('./raccourcis.cjs');
const RACINE=path.resolve(__dirname,'../..');
function monde(vieux){
  const B=C.creer((vieux?'?foret=pelote':'')+(process.argv[2]==='sentiers'?'?foretsentiers=1':''));const ctx=B.ctx;
  for(const d of ['var CAMPM=[]','var MODC_ON=true','var PLEUR={on:true}','function rayonPalier(){return 40+.3*__vw;}'])try{vm.runInContext('typeof '+d.replace(/^(var |function )/,'').split(/[=(]/)[0]+"==='undefined'?0:(()=>{throw 1})()",ctx);vm.runInContext(d,ctx);}catch(e){}
  vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/foret-route.js'),'utf8').split('/* ---------------- L\'ATELIER DES ARBRES')[0],ctx,{filename:'foret-route.js'});
  return B;}
function piste(B,graine,palier){
  const ctx=B.ctx,vw=B.VW[palier|0]||78;ctx.__setPalier(palier|0,vw);
  ctx.LVL.cur={id:'foret',carte:'foret',piste:'foret',sansFin:1};
  vm.runInContext(`longueurCible=function(){const k=Math.min(1,engTier/25),d=45+(20-45)*k;return d*__vw*(1.8+(1-1.8)*k)*.93;};`,ctx);
  ctx.MODMARK.length=0;
  const rnd=ctx.mulberry32(graine),it=ctx.genForet(rnd);let r=it.next();while(!r.done)r=it.next();
  const ctrl=r.value,bank=vm.runInContext('FORET.bankN',ctx),T=ctx.THREE,n=ctrl.length;
  const cv=new T.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,n*16);const Lm=cv.getLength(),N=Math.max(300,Math.round(Lm/8));
  const P=[],Nn=[];for(let d=0;d<=N;d++){const u=d/N;P.push(cv.getPointAt(u));Nn.push(bank?bank[Math.min(n-1,Math.round(u*(n-1)))]:new T.Vector3(0,1,0));}
  return {ctrl:P,N:Nn,vw:vw,L:Lm,pel:vm.runInContext('FORET.pel',ctx),plan:vm.runInContext('FORET.plan',ctx)};}
module.exports={monde,piste};
if(require.main===module){
  const a=process.argv.slice(2).filter(x=>!x.startsWith('--')),vieux=process.argv.includes('--vieux'),B=monde(vieux);
  if(a[0]==='lot'){const pal=+a[1]||0,n=+a[2]||10,g0=+a[3]||1;let S={km:0,rac:0,rob:0,gm:0,cr:0},pire=0;const lignes=[];
    for(let k=0;k<n;k++){const r=piste(B,g0+k*7919,pal),res=R.resume(r,R.analyse(r));S.km+=r.L/1000;S.rac+=res.raccourcis;S.rob+=res.robustes;S.gm+=res.gainMax;S.cr+=r.pel.croise;lignes.push([g0+k*7919,Math.round(r.L),res.raccourcis,res.parKm,res.gainMax,r.pel.croise].join(' '));}
    console.log(vieux?'VIEUX':'VASTE','pal',pal,'n',n,'km moy',(S.km/n).toFixed(1),'raccourcis/forêt',(S.rac/n).toFixed(1),'par km',(S.rac/S.km).toFixed(2),'robustes/forêt',(S.rob/n).toFixed(1),'gainMax moy',Math.round(S.gm/n),'croisements',(S.cr/n).toFixed(1));
    if(process.argv.includes('--v'))console.log(lignes.join('\n'));}
  else{const r=piste(B,+a[0]||1,+a[1]||0),res=R.resume(r,R.analyse(r));
    console.log('forêt',a[0],'pal',a[1],'L',res.L,'raccourcis',res.raccourcis,'par km',res.parKm,'gainMax',res.gainMax,'robustes',res.robustes,'croisements',r.pel.croise,'plan',(r.plan||[]).join(' '));
    if(process.argv.includes('--v'))for(const o of res.seaux)console.log('  s',Math.round(o.s),'tirs',o.n,'vit',[...o.ms].join('/'),'gain',Math.round(o.gain));}}
/* LES SENTIERS DE LUCIOLES au banc : la vraie fonction foretSentiersCalc (code/maps/foret-sentiers.js) sur la route rééchantillonnée (8 m, T et Nn comme le jeu)
   node foret.cjs sentiers palier n [graine0] — le nombre de fils par forêt, leur gain, leur robustesse */
function sentiers(B,graine,palier){
  const ctx=B.ctx,r=piste(B,graine,palier),T3=ctx.THREE,n=r.ctrl.length,pts=r.ctrl,T=[],Nn=r.N;
  for(let i=0;i<n;i++)T.push(new T3.Vector3().subVectors(pts[Math.min(n-1,i+1)],pts[Math.max(0,i-1)]).normalize());
  ctx.__d={pts:pts,T:T,Nn:Nn,NP:n,L:r.L};
  vm.runInContext("pts=__d.pts;T=__d.T;Nn=__d.Nn;NP=__d.NP;L=__d.L;",ctx);
  return {r:r,sent:vm.runInContext("(function(){const it=foretSentiersCalc();let r=it.next();while(!r.done)r=it.next();return FORET.sent;})()",ctx)};}
module.exports.sentiers=sentiers;
if(require.main===module&&process.argv[2]==='sentiers'){
  const a=process.argv.slice(3),pal=+a[0]||0,n=+a[1]||10,g0=+a[2]||1,B=monde(false),ctx=B.ctx;
  vm.runInContext("var pts,T,Nn,NP,L,PARK={on:false},FALL_G=33*1.45,gK=function(){return 1;};",ctx);
  try{vm.runInContext("var __x=1;",ctx);}catch(e){}
  vm.runInContext(fs.readFileSync(path.join(RACINE,'code/maps/foret-sentiers.js'),'utf8'),ctx,{filename:'foret-sentiers.js'});
  let tot=0,zero=0;const L9=[];
  for(let k=0;k<n;k++){const g=g0+k*7919,t0=Date.now(),o=sentiers(B,g,pal);tot+=o.sent.length;if(!o.sent.length)zero++;
    L9.push([g,Math.round(o.r.L),o.sent.length,JSON.stringify(vm.runInContext("FORET.sentDbg",ctx)),o.sent.map(e=>e.s0+'>'+e.sL+' g'+e.gain+' r'+e.rob+' t'+e.t).join(' | '),(Date.now()-t0)+'ms'].join('  '));}
  console.log('SENTIERS pal',pal,'n',n,'fils/forêt',(tot/n).toFixed(1),'forêts sans fil',zero);console.log(L9.join('\n'));}
/* LE RYTHME au banc : virages/km (cap qui tourne ≥ 20° à rayon < 4 × rMin), serrés (rayon < 1,5 × rMin), plus longue droite (cap à ± 5°) en mètres et en secondes à vPalier
   node foret.cjs rythme palier n [graine0] [--vieux] */
function rythme(B,graine,palier){
  const r=piste(B,graine,palier),P=r.ctrl,n=P.length,ds=r.L/(n-1),rMin=40+.3*r.vw,H=[];
  for(let i=0;i<n-1;i++)H.push(Math.atan2(P[i+1].x-P[i].x,P[i+1].z-P[i].z));
  const un=[];for(let i=0;i<H.length;i++){let a=H[i];if(i)while(a-un[i-1]>Math.PI)a-=2*Math.PI;while(i&&a-un[i-1]<-Math.PI)a+=2*Math.PI;un.push(a);}
  let vir=0,ser=0,run=null;const k=3;
  for(let i=k;i<un.length-k;i++){const dh=un[i+k]-un[i-k],R=Math.abs(dh)<1e-4?1e9:(2*k*ds)/Math.abs(dh);
    if(R<4*rMin){if(!run)run={a:un[i-k],rm:R};run.b=un[i+k];run.rm=Math.min(run.rm,R);}
    else if(run){if(Math.abs(run.b-run.a)>=20*Math.PI/180){vir++;if(run.rm<1.5*rMin)ser++;}run=null;}}
  let best=0,j0=0;for(let i=0;i<un.length;i++){while(Math.abs(un[i]-un[j0])>5*Math.PI/180)j0++;best=Math.max(best,(i-j0)*ds);}
  return {L:r.L,vir:vir/(r.L/1000),ser:ser/(r.L/1000),droite:best,droiteS:best/r.vw};}
module.exports.rythme=rythme;
if(require.main===module&&process.argv[2]==='rythme'){
  const a=process.argv.slice(3).filter(x=>!x.startsWith('--')),pal=+a[0]||0,n=+a[1]||8,g0=+a[2]||1,B=monde(process.argv.includes('--vieux'));
  let S={L:0,vir:0,ser:0,d:0,ds:0,dm:0};for(let k=0;k<n;k++){const o=rythme(B,g0+k*7919,pal);S.L+=o.L;S.vir+=o.vir;S.ser+=o.ser;S.d+=o.droite;S.ds+=o.droiteS;S.dm=Math.max(S.dm,o.droiteS);}
  console.log('RYTHME pal',pal,'n',n,'km',(S.L/n/1000).toFixed(1),'virages/km',(S.vir/n).toFixed(2),'serrés/km',(S.ser/n).toFixed(2),'plus longue droite moy',Math.round(S.d/n),'m =',(S.ds/n).toFixed(1),'s à vPalier ; pire',S.dm.toFixed(1),'s');}

/* LES PIÈGES au banc : par forêt, combien de croisements, quelle part de RACCOURCIS (la route d'en dessous est devant) et de PIÈGES (derrière), la route sautée en % de la forêt
   node foret.cjs pieges palier n [graine0] */
if(require.main===module&&process.argv[2]==='pieges'){
  const a=process.argv.slice(3),pal=+a[0]||0,n=+a[1]||8,g0=+a[2]||1,B=monde(false);let S={cx:0,fw:0,bk:0,fwSk:0,max:0,maxFw:0,gros:0};const L9=[];
  for(let k=0;k<n;k++){const r=piste(B,g0+k*7919,pal),cx=r.pel.cxs||[];let fw=0,bk=0,mx=0,mf=0,gros=0;
    for(const c of cx){if(c[1]>0){fw++;mf=Math.max(mf,c[0]/r.L);if(c[0]/r.L>.3)gros++;}else bk++;mx=Math.max(mx,c[0]/r.L);}
    S.cx+=cx.length;S.fw+=fw;S.bk+=bk;S.maxFw+=mf;S.gros+=gros;L9.push([g0+k*7919,Math.round(r.L),cx.length+' croisements',fw+' raccourcis',bk+' pièges','plus gros raccourci '+Math.round(100*mf)+' % de la forêt',gros+' > 30 %'].join('  '));}
  console.log('PIEGES pal',pal,'n',n,'croisements/forêt',(S.cx/n).toFixed(1),'raccourcis',(S.fw/n).toFixed(1),'pièges',(S.bk/n).toFixed(1),'plus gros raccourci moy',Math.round(100*S.maxFw/n)+' %','raccourcis > 30 % de la forêt',(S.gros/n).toFixed(1));console.log(L9.join(String.fromCharCode(10)));}
