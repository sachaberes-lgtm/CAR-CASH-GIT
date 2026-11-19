/* ville-cyber.cjs (2026-11-18, LA VILLE CYBERPUNK, lot A) : le banc Node des modules route-ville (slalom des tours, piqué, montagnes russes des toits), sur les VRAIS
   générateurs (charge.cjs) et le VRAI plan du décor (vsReserve sur la route finale échantillonnée tous les 3 m, puis vsBatir dans un CITY de banc) :
   · combien de fois chaque module sort, par palier ; les plans bâtis / abandonnés (et la raison), les pièces perdues ;
   · LA RÈGLE : aucun point de route à moins de 14 m du bord de la dalle d'un volume des modules (dans sa hauteur −40 / +60), aucune nappe à moins de 12 m du ruban (3D),
     et l'audit du jeu (dbgVilleAudit) : `dans` (le couloir de conduite) et `frole` (6 m du bord, à hauteur de caisse) sur tous leurs volumes et néons ;
   · les rayons mini en plan (fenêtre de 20 m, en rP et en g à la vitesse réelle) et en VERTICAL (crêtes et creux, en m, en × la croisière et en g), la pente maxi ;
   · le temps de tirage par route (ms) et la tenue de cap (vsTenue : t30, t8).
   node ville-cyber.cjs [racine=<worktree>] [graines=1-60] [paliers=0,10,20] [json=<fichier>]   (SEARCH='?villescene=pique' : une variante) */
const path=require('path'),fs=require('fs'),vm=require('vm');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const RAC=path.resolve(arg('racine',path.join(__dirname,'../..')));
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||''),ctx=B.ctx;
const [g0,g1]=arg('graines','1-60').split('-').map(Number),PAL=arg('paliers','0,10,20').split(',').map(Number),JS=arg('json');
const ROAD_HALF=28,D=57.29578,G9=9.81,CY={slalomtours:'slalom',pique:'piqué',russes:'russes',crete:'(crête des toits)',plongee:'(plongée)'}; /* les deux dernières : des scènes d'avant, pour comparer */
vm.runInContext(`var CITY={};var __vcV=null;
function __vcPlan(ctrl,pas){const P=[{x:ctrl[0].x,y:ctrl[0].y,z:ctrl[0].z}];
  for(let i=1;i<ctrl.length;i++){const a=ctrl[i-1],b=ctrl[i],d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(d/pas));for(let k=1;k<=n;k++)P.push({x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n,z:a.z+(b.z-a.z)*k/n});}
  const HB=60,G=new Map();P.forEach(function(p,i){const k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let l=G.get(k);if(!l)G.set(k,l=[]);l.push(i);});
  const proches=function(x,z,R9,cb){const r=Math.ceil(R9/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const l=G.get((bx+dx)*100003+(bz+dz));if(l)for(const i of l)cb(i);}};
  const AIRZ=[];for(const m9 of FILETMARK)if(m9.air)for(const a9 of m9.air)AIRZ.push(a9);
  const NEON=[];for(let i=0;i<7;i++)NEON.push(new THREE.Color(1,1,1));
  const V={P:P,pts:P,proches:proches,pasP:Math.max(1,Math.round(10/pas)),snap:function(v){const q=typeof VOX_CITY!=="undefined"?VOX_CITY:6.4;return Math.max(1,Math.round(v/q))*q;},AIRZ:AIRZ,
    corps:[],genre:[],tqC:[],neon:[],neonC:[],tqN:[],sp:[],root:{add:function(){}},NEON:NEON,CR:null,dsP:0};
  CITY={};const plans=vsReserve(V);const bil=vsBatir(V);__vcV=V;return {plans:plans,bil:bil};}`,ctx);
function spline(C){ /* la route du JEU : la Catmull-Rom centripète des points de contrôle (pisteRoute), échantillonnée tous les ~2 m ; cap H (déroulé) et assiette A */
  const T=ctx.THREE,cv=new T.CatmullRomCurve3(C,false,'centripetal');cv.arcLengthDivisions=Math.max(200,C.length*16);const L=cv.getLength(),N=Math.max(50,Math.round(L/2)),Q=cv.getSpacedPoints(N),ds=L/N;
  const H=new Float64Array(N+1),A=new Float64Array(N+1);for(let i=0;i<=N;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(N,i+1)],dh=Math.hypot(b.x-a.x,b.z-a.z);H[i]=Math.atan2(b.x-a.x,b.z-a.z);A[i]=Math.atan2(b.y-a.y,dh);
    if(i){let d=H[i]-H[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;H[i]=H[i-1]+d;}}
  const sc=[0];for(let i=1;i<C.length;i++)sc.push(sc[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].y-C[i-1].y,C[i].z-C[i-1].z));return {H:H,A:A,ds:ds,N:N,k:N/sc[sc.length-1],sc:sc};}
function mesureModule(S,i0,i1){ /* sur [i0, i1] : le rayon mini en plan tenu sur 20 m et sur 80 m (comme ville-torsades), le rayon vertical mini des crêtes et des creux (sur 24 m), la pente maxi */
  const a=Math.max(0,Math.floor(S.sc[i0]*S.k)),b=Math.min(S.N,Math.ceil(S.sc[i1]*S.k)),R=function(W){let m=1e9;for(let i=Math.max(W,a);i<=Math.min(S.N-W,b);i++){const k=Math.abs(S.H[i+W]-S.H[i-W])/(2*W*S.ds);if(k>1e-9&&1/k<m)m=1/k;}return m;};
  const W=Math.max(1,Math.round(12/S.ds));let cv=1e9,cc=1e9,pm=0,fv=0;for(let i=Math.max(W,a);i<=Math.min(S.N-W,b);i++){const d=(S.A[i+W]-S.A[i-W])/(2*W*S.ds*Math.cos(S.A[i])),r=1/Math.max(1e-9,Math.abs(d));if(d<0){if(r<cv){cv=r;fv=(i-a)/Math.max(1,b-a);}}else if(r<cc)cc=r;pm=Math.max(pm,Math.abs(S.A[i])*D);}
  return {r20:R(Math.max(1,Math.round(10/S.ds))),r80:R(Math.max(1,Math.round(40/S.ds))),cv:cv,cc:cc,pente:pm,fv:fv};} /* fv : où tombe la crête la plus serrée (0 : l'entrée du module, 1 : sa sortie) */
function boxD(x0,x1,z0,z1,p){return Math.hypot(Math.max(x0-p.x,0,p.x-x1),Math.max(z0-p.z,0,p.z-z1));}
const T={},out=[],tps={};
for(const pal of PAL){const vw=B.VW[pal],rP=40+.3*vw,EL=1.8-.8*Math.min(1,Math.max(0,pal/25)),vR=vw*EL,vD=vw; /* vD : la croisière de conception (genCtrl1 : 70 + (LV−1)·100 = vw) */
  const t=T[pal]={routes:0,mods:{},routesAvec:{0:0,1:0,2:0,3:0},plans:{},perdus:{},raisons:{},viol:0,dans:0,frole:0,nappe12:0,rPlan:{},rV:{},pente:{},rac:0,t30:0,t8:0,ms:[],msD:[],totMods:0,ex:[],exA:[]};
  for(let g=g0;g<=g1;g++){vm.runInContext('VILLE_BANK.graine='+g+';VILLE_ENTREE=null;',ctx);const t0=performance.now(),r=B.piste('ville',g,pal),ms=performance.now()-t0;t.ms.push(ms);t.routes++;
    const C=r.ctrl,M=r.marks;let n9=0,SP=null;for(const m of M){if(m.rac||m.spi)t.rac++;t.totMods++;const f=CY[m.fig];if(!f)continue;if(f.charAt(0)!=='(')n9++;t.mods[f]=(t.mods[f]||0)+1;
      const i0=Math.max(0,m.i0),i1=Math.min(C.length-1,m.i1),pr=mesureModule(SP||(SP=spline(C)),i0,i1),rp=pr.r20;
      const k=t.rPlan[f]=t.rPlan[f]||{min:1e9,m80:1e9};if(rp<k.min){k.min=rp;k.g=g;}if(pr.r80<k.m80)k.m80=pr.r80;
      const kv=t.rV[f]=t.rV[f]||{cv:1e9,cc:1e9};if(pr.cv<kv.cv){kv.cv=pr.cv;kv.fv=pr.fv;kv.gv=g;}if(pr.cc<kv.cc)kv.cc=pr.cc;
      const kp=t.pente[f]=t.pente[f]||{max:0};if(pr.pente>kp.max)kp.max=pr.pente;}
    t.routesAvec[Math.min(3,n9)]++;
    ctx.__c9=C;const te=vm.runInContext('vsTenue(__c9)',ctx);t.t30=Math.max(t.t30,te.t30);t.t8=Math.max(t.t8,te.t8);
    const tD=performance.now(),res=ctx.__vcPlan(C,3),V=ctx.__vcV,P=V.P;t.msD.push(performance.now()-tD); /* msD : le plan et les volumes du décor des scènes (vsReserve + vsBatir), ms */
    for(const p of res.plans){const ty=p.t;const q=t.plans[ty]=t.plans[ty]||{ok:0,non:0,raisons:{}};if(p.ok)q.ok++;else{q.non++;q.raisons[p.raison||'?']=(q.raisons[p.raison||'?']||0)+1;}
      if(p.vcRaisons){for(const k9 in p.vcRaisons){t.raisons[ty+':'+k9]=(t.raisons[ty+':'+k9]||0)+p.vcRaisons[k9];}t.perdus[ty]=(t.perdus[ty]||0)+(p.vcPerdus|0);
        const pq=t.perdus[ty+'#pieces']=(t.perdus[ty+'#pieces']||0)+(p.vcP?p.vcP.length:0)+(p.vcN?p.vcN.length:0);}
      if(!p.ok||!p.vcVol)continue;
      /* LA RÈGLE et L'AUDIT, sur les volumes et les néons du module */
      const Cc=V.corps,Ne=V.neon;
      for(let j=p.vcVol[0];j<p.vcVol[1];j++){const o=j*6,x0=Cc[o]-Cc[o+3]/2,x1=Cc[o]+Cc[o+3]/2,y0=Cc[o+1]-Cc[o+4]/2,y1=Cc[o+1]+Cc[o+4]/2,z0=Cc[o+2]-Cc[o+5]/2,z1=Cc[o+2]+Cc[o+5]/2;let vi=false,da=false,fr=false;
        for(const q of P){const d=boxD(x0,x1,z0,z1,q);if(d<ROAD_HALF+14-.01&&q.y>=y0-40&&q.y<=y1+60&&V.genre[j]===0)vi=true;if(d<ROAD_HALF+1&&y1>q.y+.3&&y0<q.y+7)da=true;else if(d<ROAD_HALF+6&&y1>q.y-1&&y0<q.y+12)fr=true;}
        if(vi){t.viol++;if(t.ex.length<8)t.ex.push({g:g,ty:ty,vol:j,x:Math.round(Cc[o]),z:Math.round(Cc[o+2])});}if(da){t.dans++;if(t.exA.length<10)t.exA.push({g:g,ty:ty,v:j,dans:1});}else if(fr){t.frole++;if(t.exA.length<10)t.exA.push({g:g,ty:ty,v:j});}}
      for(let j=p.vcNeon[0];j<p.vcNeon[1];j++){const o=j*6,x0=Ne[o]-Ne[o+3]/2,x1=Ne[o]+Ne[o+3]/2,y0=Ne[o+1]-Ne[o+4]/2,y1=Ne[o+1]+Ne[o+4]/2,z0=Ne[o+2]-Ne[o+5]/2,z1=Ne[o+2]+Ne[o+5]/2;let da=false,fr=false;
        for(const q of P){const d=boxD(x0,x1,z0,z1,q);if(d<ROAD_HALF+1&&y1>q.y+.3&&y0<q.y+7)da=true;else if(d<ROAD_HALF+6&&y1>q.y-1&&y0<q.y+12)fr=true;}if(da){t.dans++;if(t.exA.length<10)t.exA.push({g:g,ty:ty,n:j,c:V.neonC[j],dans:1,y:+(y0).toFixed(0)});}else if(fr){t.frole++;if(t.exA.length<10)t.exA.push({g:g,ty:ty,n:j,c:V.neonC[j],y:+(y0).toFixed(0)});}
        if(ty==='cpique'){ctx.__B9=[x0,x1,y0,y1,z0,z1];if(vm.runInContext('vcEcart(__vcV,__B9)',ctx)<12-.01)t.nappe12++;}}}
    out.push({pal:pal,g:g,mods:M.map(m=>m.nom||m.fig),ms:+ms.toFixed(1)});}
  const ROUTE_ROND=v=>v>1e8?'—':v;
  console.log(`\n== palier ${pal} (vw ${vw} m/s, vitesse réelle ${Math.round(vR)} m/s, rP ${rP.toFixed(0)} m) — ${t.routes} routes, ${(t.totMods/t.routes).toFixed(2)} modules/route, raccourcis ${(t.rac/t.routes).toFixed(2)}/route`);
  console.log('  sorties :',JSON.stringify(t.mods),'· routes avec 0/1/2/3+ modules cyber :',JSON.stringify(t.routesAvec));
  for(const ty of Object.keys(t.plans).sort()){const q=t.plans[ty];console.log('  plan',ty.padEnd(10),'bâtis',q.ok,'abandonnés',q.non,Object.keys(q.raisons).length?JSON.stringify(q.raisons):'',t.perdus[ty]!=null?'· pièces posées '+t.perdus[ty+'#pieces']+', perdues '+t.perdus[ty]:'');}
  console.log('  pièces perdues (raisons) :',JSON.stringify(t.raisons));
  console.log('  RÈGLE (route à < 14 m du bord d\'un volume) :',t.viol,'· audit dans',t.dans,'frole',t.frole,'· nappes à < 12 m du ruban :',t.nappe12,t.ex.length?JSON.stringify(t.ex):'',t.exA.length?'· audit : '+JSON.stringify(t.exA):'');
  for(const f of Object.keys(t.rPlan)){const k=t.rPlan[f],kv=t.rV[f];console.log('  ',f.padEnd(7),'rayon plan mini (20 m)',Math.round(k.min),'m =',(k.min/rP).toFixed(2),'rP =',(vR*vR/k.min/G9).toFixed(1),'g',`(graine ${k.g})`,'· sur 80 m',(k.m80/rP).toFixed(2),'rP',
    '· vertical : crête',ROUTE_ROND(Math.round(kv.cv)),'m =',(kv.cv/vD).toFixed(2),'× vD =',(vR*vR/kv.cv/G9).toFixed(1),'g',kv.fv!=null?'(à '+Math.round(kv.fv*100)+' % du module, graine '+kv.gv+')':'','· creux',ROUTE_ROND(Math.round(kv.cc)),'m =',(kv.cc/vD).toFixed(2),'× vD · pente maxi',t.pente[f].max.toFixed(1)+'°');}
  const ms=t.ms.slice().sort((a,b)=>a-b);tps[pal]={med:ms[ms.length>>1],max:ms[ms.length-1],moy:ms.reduce((a,b)=>a+b,0)/ms.length};
  {const d=t.msD.slice().sort((a,b)=>a-b);console.log('  décor des scènes (vsReserve + vsBatir, ms) : médiane',d[d.length>>1].toFixed(1),'max',d[d.length-1].toFixed(1));}
  console.log('  tirage par route (ms) : médiane',tps[pal].med.toFixed(0),'moyenne',tps[pal].moy.toFixed(0),'max',tps[pal].max.toFixed(0),'· tenue de cap pire t30',t.t30.toFixed(2),'s t8',t.t8.toFixed(2),'s');}
if(JS)fs.writeFileSync(JS,JSON.stringify({T:T,routes:out,tps:tps},null,1));
