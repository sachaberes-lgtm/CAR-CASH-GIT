/* LE BANC NODE DES PICS DE JADE QUI TOMBENT (2026-11-13, Sacha : « les pics de Jade ne devraient pas pouvoir tomber sur la route ») — sans navigateur.
   La VRAIE route de la descente Alléluia (genJadeA de jade-alleluia.js dans un vm, au palier voulu), échantillonnée comme buildTrack (Catmull-Rom centripète, ~2 m) ;
   les montagnes posées COMME jadeBatit dans leurs grandes lignes (les pics des scènes JADE.pose, les tours et les îles JADE.deco3, les trois rangs au bord, les îles
   du ciel ; la règle d'or `regle` ; gabarits = JADE_TPL / JADE_ILE, cylindres de leur rayon) ; l'effondrement choisi COMME jadeChutePrep (la règle d'avant) ; puis,
   pour chaque montagne qui tombe, son VRAI mouvement (la matrice de jadeChuteTick, pas de 1/20 s jusqu'à sa sortie) contre le COULOIR de TOUTE la route
   (5 places de la largeur + 1 m, 0,3 à 8 m au-dessus de la dalle le long de sa normale roulée). AVANT : la règle seule ; APRÈS : + jadeChuteLibre (lu dans jade-3.js).
   node jade-pics.cjs [paliers=0,10,20] [graines=1-12]      (env DEBOUT=1 : en plus, les montagnes debout dans le couloir — cylindres, donc pessimiste)
   ⚠ les montagnes sont une IMITATION de jadeBatit (pas ses cubes) : le juge des cubes est dbgJadePics() dans le jeu. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RACINE=path.resolve(__dirname,'../..'),lire=f=>fs.readFileSync(path.join(RACINE,f),'utf8');
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const PALIERS=(arg('paliers')||'0,10,20').split(',').map(Number);
const [g0,g1]=(arg('graines')||'1-12').split('-').map(Number);const GRAINES=[];for(let g=g0;g<=(g1||g0);g++)GRAINES.push(g);
const VW={0:78,5:105,10:158,15:236,20:341,25:420};
const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Int16Array,Uint8Array,Int32Array,Map,Set,Object,Array,Number,String,Date,Infinity,JSON,Symbol,isNaN,performance});
ctx.window=ctx;ctx.self=ctx;
vm.runInContext(lire('VERSION PRINCIPALE/vendor/three.min.js'),ctx);
const j1=lire('code/maps/jade-1.js'),tpl=/const JADE_TPL=\[[^;]*\];/.exec(j1)[0];
vm.runInContext(`var ROAD_HALF=28,SPD=.48,engTier=0,__vw=78,MODMARK=[],CAMPM=[],JADE={},DUREE={d0:45,d1:20,t1:25},DUREE_ELAN=[1.8,1],VEQ_K={saut:21},JADE_BANK={on:true,max:16*Math.PI/180,W:150};
${tpl}const JADE_NTPL=JADE_TPL.length;
function vPalier(){return __vw;}function rayonPalier(){return 40+.3*__vw;}
function longueurCible(){const k=Math.min(1,engTier/25),d=45+(20-45)*k;return d*__vw*(1.8+(1-1.8)*k)*1.05;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}`,ctx);
vm.runInContext(lire('code/maps/jade-alleluia.js').replace(/window\.dbg[\s\S]*$/,''),ctx); /* (les crochets du jeu, à la fin, lisent des noms de la page) */
/* la fonction du jeu, telle qu'elle est écrite dans jade-3.js */
const j3=lire('code/maps/jade-3.js'),src=/function jadeChuteLibre\([\s\S]*?\n  return true;\}/.exec(j3);
if(!src){console.log('jadeChuteLibre absente de jade-3.js : seul AVANT sera mesuré');}else vm.runInContext(src[0],ctx);
const T=ctx.THREE,RH=28,TPL=vm.runInContext("JADE_TPL",ctx),ILE=vm.runInContext("JADE_ILE",ctx),ILE0=vm.runInContext("JADE_ILE0",ctx);

function course(graine,palier){
  vm.runInContext(`engTier=${palier|0};__vw=${VW[palier]||78};MODMARK.length=0;CAMPM.length=0;JADE={};`,ctx);
  const ctrl=ctx.genJadeA(ctx.mulberry32(graine),graine),J=ctx.JADE,Nc=J.bankN;
  const cv=new T.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,ctrl.length*16);const L=cv.getLength(),NP=Math.round(L/2)+1;
  const P=[],U=[],Nn=[],Bn=[];for(let i=0;i<NP;i++){const u=cv.getUtoTmapping(i/(NP-1));P.push(cv.getPoint(u));}
  /* les normales : celles des points de contrôle (bankN), à l'indice le plus proche du paramètre */
  for(let i=0;i<NP;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(NP-1,i+1)],t=b.clone().sub(a).normalize(),k=Math.min(ctrl.length-1,Math.round(cv.getUtoTmapping(i/(NP-1))*(ctrl.length-1)));
    const n=(Nc&&Nc[k]?Nc[k].clone():new T.Vector3(0,1,0));n.addScaledVector(t,-n.dot(t)).normalize();Nn.push(n);Bn.push(new T.Vector3().crossVectors(t,n).normalize());}
  /* la grille de la route (comme jadeBatit : cases de 120 m, un point tous les ~10 m) */
  const HB=120,G=new Map();for(let i=0;i<NP;i+=5){const k=Math.floor(P[i].x/HB)*100003+Math.floor(P[i].z/HB);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=G.get((bx+dx)*100003+(bz+dz));if(a)for(const j of a)cb(j);}};
  let yMin=1e9;for(const p of P)if(p.y<yMin)yMin=p.y;const mer=yMin-520+90;
  const tplH=r=>{let bi=0,bd=1e9;for(let k=0;k<TPL.length;k++){const d=Math.abs(TPL[k][0]-r);if(d<bd){bd=d;bi=k;}}return TPL[bi];};
  const rnd=ctx.mulberry32((graine*7919)^0x51DE);const PIL=[];
  const regle=(cx,cz,rm,yt,Hs)=>{let lo=1e9,hi=-1e9;const clr=rm+RH+18;proches(cx,cz,clr,i=>{const p=P[i];if(Math.hypot(p.x-cx,p.z-cz)>clr)return;lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);});
    if(hi>-1e9&&yt>lo-45&&yt-Hs<hi+70){const tU=lo-45,tA=hi+70+Hs,okU=tU-Hs>=mer,okA=tA<hi+760;if(okU&&(!okA||yt-tU<=tA-yt))return tU;if(okA)return tA;return null;}return yt;};
  const tente=(cx,cz,r,yt)=>{const t=tplH(r),rm=t[0],Hs=t[1];if(yt-Hs<mer)yt=mer+Hs;yt=regle(cx,cz,rm,yt,Hs);if(yt==null)return;PIL.push([cx,cz,rm,yt-Hs,yt]);};
  /* les pics des scènes (JADE.pose, `un`) */
  for(const o of (J.pose||[])){const t=tplH(o.r),rm=t[0],Hs=t[1],dC=(o.ix||o.iz)?RH+o.gap+rm:0,cx=o.x+o.ix*dC,cz=o.z+o.iz*dC;
    let yt=o.dessus?o.y+o.clear+Hs:Math.min(o.y+o.h,o.y+Hs-60);if(yt-Hs<mer)yt=mer+Hs;
    let ok=true;const clr=rm+RH+o.gap-3;proches(cx,cz,clr,i=>{const p=P[i];if(p.y>yt-Hs-15&&p.y<yt+15&&Math.hypot(p.x-cx,p.z-cz)<clr)ok=false;});if(ok){const q=[cx,cz,rm,yt-Hs,yt];if(o.inv)q.inv=1;PIL.push(q);}}
  /* les tours et les îles des scènes (JADE.deco3) */
  for(const o of (J.deco3||[])){if(o.ko)continue;if(o.t==='tour'){const rm=Math.min(o.r,56),t=tplH(rm);PIL.push([o.x,o.z,t[0],o.top-t[1],o.top]);}
    else{const k=ctx.jadeIleDe(o.r,o.massif)-ILE0,I=ILE[Math.max(0,k)];PIL.push([o.x,o.z,I[0],o.y-I[1]/2,o.y+I[1]/2]);}}
  /* les trois rangs au bord (RANGS) et les îles du ciel */
  const RANGS=[[RH+38,90,.27,10,30,-150,260,2],[170,200,.38,12,40,-200,330,3],[380,420,.46,16,56,-260,380,4]];
  for(let i=60;i<NP;i+=23){const a=P[Math.max(0,i-1)],b=P[Math.min(NP-1,i+1)],tx=b.x-a.x,tz=b.z-a.z,hl=Math.hypot(tx,tz);if(hl<.5)continue;const px=-tz/hl,pz=tx/hl;
    for(const sg of [-1,1])for(const R9 of RANGS){if(rnd()>R9[2])continue;const r=R9[3]+rnd()*(R9[4]-R9[3]),lat=R9[0]+r+rnd()*R9[1],al=(rnd()-.5)*40;
      tente(P[i].x+px*sg*lat+tx/hl*al,P[i].z+pz*sg*lat+tz/hl*al,r,P[i].y+R9[5]+(R9[6]-R9[5])*Math.pow(rnd(),.8));}}
  for(let sI=300+rnd()*300;sI<L-700;sI+=380+rnd()*300){const i=Math.round(sI/2),a=P[Math.max(0,i-1)],b=P[Math.min(NP-1,i+1)],tx=b.x-a.x,tz=b.z-a.z,hl=Math.hypot(tx,tz);if(hl<.5)continue;
    const r=10+rnd()*24,Hs=tplH(r)[1],lat=(rnd()-.5)*2*(RH+10);tente(P[i].x-tz/hl*lat,P[i].z+tx/hl*lat,r,P[i].y+50+Hs+rnd()*70);}
  /* L'EFFONDREMENT, comme jadeChutePrep (la règle d'avant), puis le filtre d'après */
  const RT=[];for(let i=0;i<NP;i+=2)RT.push(P[i].x,P[i].y,P[i].z);const RTf=Float64Array.from(RT);
  const av=[],ap=[];let msF=0;
  for(const q of PIL){if(q.inv)continue;let bi=-1,bd=1e18;for(let i=0;i<NP;i+=3){const d=(P[i].x-q[0])**2+(P[i].z-q[1])**2;if(d<bd){bd=d;bi=i;}}
    const dH=Math.sqrt(bd),u=bi/(NP-1);if(dH-q[2]>900||u<.18)continue;if(dH-q[2]<RH+30&&q[3]>P[bi].y-12)continue;
    if(rnd()>.06+.84*Math.pow(T.MathUtils.smoothstep(u,.25,.93),1.3))continue;
    const dx=(q[0]-P[bi].x)/(dH||1),dz=(q[1]-P[bi].z)/(dH||1),c={q,dx,dz,ax:new T.Vector3(dz,0,-dx),g:8+rnd()*7,w:.12+rnd()*.25};av.push(c);
    if(src){const t0=performance.now(),ok=ctx.jadeChuteLibre(q,dx,dz,c.g,c.w,RTf);msF+=performance.now()-t0;if(ok)ap.push(c);}}
  /* LE JUGE : le vrai mouvement contre le couloir de toute la route */
  const M4=new T.Matrix4(),Mi=new T.Matrix4(),Rr=new T.Matrix4(),Ta=new T.Matrix4(),V=new T.Vector3(),Cn=new T.Vector3();
  const tombe=c=>{const q=c.q,rm=q[2],H=q[4]-q[3],rs=Math.hypot(rm,H/2)+RH+10,hr=rm+H+.3*(H+420)+rs,I=[];
    for(let i=0;i<NP;i+=2){const p=P[i];if(Math.abs(p.x-q[0])<hr&&Math.abs(p.z-q[1])<hr&&p.y<q[4]+rs&&p.y>q[3]-H-420-rs)I.push(i);}if(!I.length)return null;
    for(let t=0;t<40;t+=.05){const tf=Math.max(0,t-.9),dy=.5*c.g*tf*tf,th=Math.min(1.25,.5*c.w*tf*tf),jx=t<.9?Math.sin(t*57)*.35*(t/.9):0,dr=.6*c.g*tf*tf*.25;if(dy>(q[4]-(q[3]-300))+60)break;
      M4.makeTranslation(q[0]+jx+c.dx*dr,q[3]-dy,q[1]+c.dz*dr);Rr.makeRotationAxis(c.ax,th);M4.multiply(Rr);Ta.makeTranslation(-q[0],-q[3],-q[1]);M4.multiply(Ta);Mi.copy(M4).invert();
      Cn.set(q[0],(q[3]+q[4])/2,q[1]).applyMatrix4(M4);
      for(const i of I){if(P[i].distanceToSquared(Cn)>rs*rs)continue;
        for(const f of [-1,-.5,0,.5,1])for(const h of [.3,2,4,8]){V.copy(P[i]).addScaledVector(Bn[i],f*(RH+1)).addScaledVector(Nn[i],h).applyMatrix4(Mi);
          if(V.y>=q[3]&&V.y<=q[4]&&Math.hypot(V.x-q[0],V.z-q[1])<=rm)return {s:i*2,t:+t.toFixed(1),dy:Math.round(dy)};}}}
    return null;};
  const nAv=av.filter(c=>tombe(c)).length,nAp=src?ap.filter(c=>tombe(c)).length:null;
  /* (indicatif) LES MONTAGNES DEBOUT : le cylindre du gabarit (rayon maximal : les vraies sont plus fines en bas) contre le même couloir, au repos */
  let deb=0;if(process.env.DEBOUT)for(const q of PIL){const rm=q[2];for(let i=0;i<NP;i+=2){const p=P[i];if(Math.hypot(p.x-q[0],p.z-q[1])>rm+RH+10||p.y<q[3]-10||p.y>q[4]+10)continue;let h=false;
    for(const f of [-1,0,1])for(const hh of [.3,4,8]){V.copy(p).addScaledVector(Bn[i],f*(RH+1)).addScaledVector(Nn[i],hh);if(V.y>=q[3]&&V.y<=q[4]&&Math.hypot(V.x-q[0],V.z-q[1])<=rm)h=true;}if(h){deb++;break;}}}
  return {debout:deb,L:Math.round(L),montagnes:PIL.length,tombentAv:av.length,surRouteAv:nAv,tombentAp:src?ap.length:null,surRouteAp:nAp,msFiltre:+msF.toFixed(1),scenes:(J.a3&&J.a3.scenes||[]).join(',')};}

let tot={av:0,ap:0,n:0,tAv:0,tAp:0};
for(const pal of PALIERS)for(const g of GRAINES){let r;try{r=course(g,pal);}catch(e){console.log(`p${pal} g${g} ERREUR`,String(e.stack||e).split('\n').slice(0,3).join(' | '));continue;}
  tot.n++;tot.av+=r.surRouteAv;tot.ap+=r.surRouteAp||0;tot.tAv+=r.tombentAv;tot.tAp+=r.tombentAp||0;
  console.log(`p${String(pal).padEnd(2)} g${String(g).padEnd(3)} L ${String(r.L).padStart(5)} montagnes ${String(r.montagnes).padStart(4)} · AVANT tombent ${String(r.tombentAv).padStart(3)} dont sur la route ${String(r.surRouteAv).padStart(3)} · APRÈS tombent ${String(r.tombentAp).padStart(3)} dont sur la route ${r.surRouteAp} (filtre ${r.msFiltre} ms)${process.env.DEBOUT?' · debout dans le couloir (cylindres) '+r.debout:''} · ${r.scenes}`);}
console.log(`TOTAL ${tot.n} routes : AVANT ${tot.av} montagnes tombent sur la route (sur ${tot.tAv} qui tombent) · APRÈS ${tot.ap} (sur ${tot.tAp} qui tombent)`);
