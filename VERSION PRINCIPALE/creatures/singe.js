/* LE SINGE — sorti d'index.html le 2026-10-15 (Léo : « enlève les dauphins et les singes ; avec les figures ça n'a plus sa place, ça prend trop de place
   dans le jeu ») : ses volumes, ses poses (pendu par la queue, par les mains, à quatre pattes) et son galop ; il demande vitrail.js. Le JEU ne charge PAS ce fichier ; il vit pour la boîte et pour ce qui reviendra par map (les singes du SOLEIL DE JADE,
   les dauphins plus tard). Il a besoin de THREE (vendor/three.min.js). */
/* <<<SINGE>>> LE SINGE PENDU (2026-10-10, Léo choisit « le 2 » : quand on passe SOUS la route, un singe pend à l'envers sous la dalle,
   accroché par la queue, et te regarde passer — il tend la main quand tu passes tout près). Fait en VITRAIL.
   Modelé DEBOUT (la tête en haut, le visage vers +z) puis retourné : dans son repère, la queue s'accroche en (0,0,0) sous la dalle, le corps
   pend vers −y (≈ 2,1 m jusqu'au bout des mains, qui pendent sous la tête). Des volumes simples soudés en douceur (ellipsoïdes, capsules) ;
   la couleur dit qui est le volume le plus proche (fourrure caramel, visage, ventre, mains et pieds pêche, yeux noirs à reflet, sourire).
   Trois OS : la TÊTE (elle suit la cible), le BRAS droit et le BRAS gauche (celui du côté de la caisse se tend vers elle). */
const SG_YA=-.70; // la hauteur (debout) du haut de la crosse de la queue : elle devient le point d'accroche (0,0,0)
const SG_P=[ // [forme, rôle, os, soudure, …] — 'e' ellipsoïde (centre, rayons) · 'c' capsule (a, b, rayon a, rayon b)
  ['e','four',0,0,[0,.36,0],[.25,.34,.21]],          // le torse
  ['e','four',0,.08,[0,.08,-.01],[.22,.17,.19]],     // le bassin
  ['e','four',1,.06,[0,.93,.02],[.27,.25,.25]],      // la tête
  ['e','face',1,.03,[0,.93,.13],[.21,.17,.15]],      // le masque du visage
  ['e','museau',1,.04,[0,.85,.2],[.14,.1,.1]],       // le museau
  ['e','oeil',1,.006,[.088,.965,.245],[.056,.056,.05]],['e','oeil',1,.006,[-.088,.965,.245],[.056,.056,.05]], // de grands yeux
  ['e','oreille',1,.03,[.26,1.03,-.02],[.09,.1,.04]],['e','oreille',1,.03,[-.26,1.03,-.02],[.09,.1,.04]], // (10/10) plus hautes et plus petites : elles se soudaient aux bras
  ['e','four',1,.04,[0,1.17,-.01],[.08,.06,.07]],      // la mèche
  ['c','four',2,.05,[.22,.6,.02],[.56,.84,.08],.075,.065],['c','four',2,.03,[.56,.84,.08],[.5,1.22,.12],.065,.055],['e','main',2,.03,[.5,1.29,.13],[.075,.085,.065]], // (10/10) les bras écartés de la tête
  ['c','four',3,.05,[-.22,.6,.02],[-.56,.84,.08],.075,.065],['c','four',3,.03,[-.56,.84,.08],[-.5,1.22,.12],.065,.055],['e','main',3,.03,[-.5,1.29,.13],[.075,.085,.065]],
  ['c','four',0,.05,[.13,.02,.04],[.3,-.12,.13],.085,.07],['c','four',0,.03,[.3,-.12,.13],[.22,-.3,.18],.07,.06],['e','main',0,.03,[.2,-.36,.2],[.08,.06,.1]],
  ['c','four',0,.05,[-.13,.02,.04],[-.3,-.12,.13],.085,.07],['c','four',0,.03,[-.3,-.12,.13],[-.22,-.3,.18],.07,.06],['e','main',0,.03,[-.2,-.36,.2],[.08,.06,.1]],
  ['c','queue',0,.06,[0,.02,-.16],[0,-.25,-.3],.05,.045],['c','queue',0,.03,[0,-.25,-.3],[0,-.52,-.28],.045,.04],
  ['c','queue',0,.03,[0,-.52,-.28],[0,-.66,-.14],.04,.037],['c','queue',0,.03,[0,-.66,-.14],[0,-.66,.02],.037,.035],['c','queue',0,.03,[0,-.66,.02],[0,-.58,.1],.035,.033]];
const SG_C={four:0x7b4a2c,dos:0x5f361f,face:0xf6d3b0,museau:0xf1c29a,ventre:0xefc39a,main:0xe9b48e,oreille:0xe7a58e,oeil:0x120d10,reflet:0xffffff,bouche:0x5a2a22};
const SG_RGB={};for(const k in SG_C){const c=new THREE.Color(SG_C[k]);SG_RGB[k]=[c.r,c.g,c.b];}
const SG_D=new Float32Array(SG_P.length);
function sgPrim(q,X,Y,Z){
  if(q[0]==='e'){const c=q[4],r=q[5],x=(X-c[0])/r[0],y=(Y-c[1])/r[1],z=(Z-c[2])/r[2],k0=Math.sqrt(x*x+y*y+z*z),k1=Math.sqrt(x*x/(r[0]*r[0])+y*y/(r[1]*r[1])+z*z/(r[2]*r[2]));return k0*(k0-1)/(k1||1e-6);}
  const a=q[4],b=q[5],px=X-a[0],py=Y-a[1],pz=Z-a[2],bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],t=Math.max(0,Math.min(1,(px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz)));
  return Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(q[6]+(q[7]-q[6])*t);
}
function sgDebout(x,y,z){ // le champ, debout ; remplit SG_D (la distance à chaque volume) et rend l'union soudée
  let d=1e9;for(let i=0;i<SG_P.length;i++){const q=SG_P[i],di=sgPrim(q,x,y,z);SG_D[i]=di;
    if(i===0)d=di;else{const k=q[3];if(k<=0)d=Math.min(d,di);else{const hh=Math.max(k-Math.abs(d-di),0)/k;d=Math.min(d,di)-hh*hh*k*.25;}}}
  return d;
}
function sgProche(){let b=0;for(let i=1;i<SG_P.length;i++)if(SG_D[i]<SG_D[b])b=i;return b;}
function sgCol(X,Y,Z,o){sgDebout(X,Y,Z);sgColQ(SG_P[sgProche()],X,Y,Z,o);} // la couleur (repère DEBOUT)
function sgColQ(q,X,Y,Z,o){let r=q[1]; // la couleur du volume q au point (X,Y,Z) du singe DEBOUT (aussi pour la pose en course : chaque partie y est ramenée)
    if(r==='oeil'){const c=q[4];r=Math.hypot(X-c[0]-.014*Math.sign(c[0]),Y-c[1]-.02,Z-c[2]-.045)<.024?'reflet':'oeil';} /* le reflet : en haut, vers l'extérieur */
    else if(r==='museau'){if(Z>.24&&Math.abs(X)<.095&&Math.abs(Y-(.815+2.4*X*X))<.018)r='bouche'; // son vrai sourire (pendu par la queue, il se lit comme 🙃)
      else if(Z>.26&&Math.hypot(Math.abs(X)-.035,Y-.885)<.017)r='bouche';}
    else if(r==='oreille'&&Z>-.01&&Math.hypot((Math.abs(X)-.26)/.06,(Y-1.03)/.075)<1)r='oreille';
    else if(r==='oreille')r='four';
    else if(r==='four'&&q[2]===0&&Z>.06&&(X/.19)**2+((Y-.33)/.3)**2<1)r='ventre';
    else if(r==='four'&&Z<-.06)r='dos';
    else if(r==='queue')r=Y<-.6?'dos':'four';
    o[0]=SG_RGB[r][0];o[1]=SG_RGB[r][1];o[2]=SG_RGB[r][2];}
function sgOs(X,Y,Z,o){sgDebout(X,Y,Z);const q=SG_P[sgProche()],b=q[2];o[0]=o[1]=o[2]=0; // les os (repère DEBOUT) : 0 la tête · 1 le bras +x · 2 le bras −x
    if(b===1)o[0]=1;else if(b===0&&q[1]==='four'&&Y>.6&&Math.abs(X)<.16)o[0]=Math.max(0,Math.min(1,(Y-.62)/.16));
    else if(b===2)o[1]=Math.max(0,Math.min(1,(Math.hypot(X-.22,Y-.6,Z-.02)-.03)/.13));
    else if(b===3)o[2]=Math.max(0,Math.min(1,(Math.hypot(X+.22,Y-.6,Z-.02)-.03)/.13));}
/* LES DEUX POSES (2026-10-10, Léo : « il peut également se tenir sur les mains ») — le même singe, deux repères d'accroche (0,0,0 sous la dalle) :
   · 'queue' : pendu PAR LA QUEUE, à l'envers (x = −x debout, y = SG_YA − y debout) — la tête en bas, les bras ballants sous la tête ;
   · 'mains' : pendu PAR LES MAINS, à l'endroit (x = x debout, y = y debout − SG_YH) — les mains agrippées à la dalle, la queue pend dessous. */
const SG_YH=1.36; // la hauteur (debout) du haut des mains
function singeForme(mode){const Q=mode!=='mains',ux=x=>Q?-x:x,uy=y=>Q?SG_YA-y:SG_YH+y;
  return {mode:Q?'queue':'mains',min:[-.74,-2.18,-.44],max:[.74,.1,.44],hs:.034,h:.024,
    sdf:(x,y,z)=>sgDebout(ux(x),uy(y),z),s:(x,y,z)=>Math.max(0,Math.min(1,-y/2.05)), // l'onde part de l'accroche et descend
    col:(x,y,z,o)=>sgCol(ux(x),uy(y),z,o),os:(x,y,z,o)=>sgOs(ux(x),uy(y),z,o),
    pt:(X,Y,Z)=>new THREE.Vector3(Q?-X:X,Q?SG_YA-Y:Y-SG_YH,Z),vec:(X,Y,Z)=>new THREE.Vector3(Q?-X:X,Q?-Y:Y,Z).normalize()};}
const SINGE_F=singeForme('queue'),SINGE_FM=singeForme('mains');
const SG_QI=new THREE.Quaternion();
function singeNouveau(cle,mode){ // un singe : son groupe (accroché en 0,0,0), ses réglages, son état — mode 'queue' (défaut) ou 'mains' — ou 'course' (à quatre pattes, les pieds en 0,0,0)
  if(mode==='course'){const F=SINGE_FC,U=vitrailU(F,{uGlowA:{value:new THREE.Color(1,.82,.28)},uGlowB:{value:new THREE.Color(1,.42,.18)}});
    U.uP0.value.copy(F.cou);U.uP1.value.copy(F.epaules);U.uP2.value.copy(F.hanches);
    return {grp:vitrailObjet(F,U,cle||'singe'),U,F,mode:'course',e:{t:0,ph:0,k:Math.random()*6.28,hy:0,hp:0,m4:new THREE.Matrix4(),eu:new THREE.Euler()}};}
  const F=mode==='mains'?SINGE_FM:SINGE_F;
  const U=vitrailU(F,{uGlowA:{value:new THREE.Color(1,.82,.28)},uGlowB:{value:new THREE.Color(1,.42,.18)}}); // le cœur : l'or de la banane → l'ambre
  const ep=[F.pt(.22,.6,.02),F.pt(-.22,.6,.02)],re=[F.vec(.28,.62,.1),F.vec(-.28,.62,.1)]; // les épaules (os 1 et 2) et leurs bras au repos (épaule → main)
  U.uP0.value.copy(F.pt(0,.72,0));U.uP1.value.copy(ep[0]);U.uP2.value.copy(ep[1]);
  const grp=vitrailObjet(F,U,cle||'singe'); // (les deux poses partagent leurs programmes : même shader)
  return {grp,U,F,mode:F.mode,ep,re,cou:U.uP0.value.clone(),e:{t:0,ax:0,vx:0,az:0,vz:0,hy:0,hp:0,r:0,q:new THREE.Quaternion(),m4:new THREE.Matrix4(),eu:new THREE.Euler(),v:new THREE.Vector3()}};
}
function singeTape(S,vx,vz){S.e.vx+=vx;S.e.vz+=vz;} // un coup de vent : la caisse vient de passer sous lui
function singeAnime(S,dt,cible,proche){ // cible : la caisse dans le repère du singe (null = personne) · proche : 0 → 1 quand elle passe tout près
  const e=S.e,U=S.U,Q=S.mode==='queue';e.t+=dt;U.uT.value=e.t;
  // LE BALANCIER : un pendule amorti autour de l'accroche (x : d'avant en arrière, z : de côté) + une respiration
  e.vx+=(-8*e.ax-1.2*e.vx)*dt;e.ax+=e.vx*dt;e.vz+=(-8*e.az-1.2*e.vz)*dt;e.az+=e.vz*dt;
  S.grp.rotation.set(e.ax+.05*Math.sin(e.t*1.25),0,e.az+.035*Math.sin(e.t*.85+1));
  // LA TÊTE suit la cible (pendu par la queue, elle est à l'envers : regarder « vers le sol », c'est regarder vers le haut de son crâne)
  let fy=.35*Math.sin(e.t*.6),fp=.1*Math.sin(e.t*.9);
  if(cible){e.v.copy(cible).sub(S.cou).normalize();fy=Math.max(-1.15,Math.min(1.15,Math.atan2(e.v.x,e.v.z)));fp=Math.max(-.5,Math.min(.75,Math.asin(Math.max(-1,Math.min(1,-e.v.y)))));}
  const a9=Math.min(1,dt*6);e.hy+=(fy-e.hy)*a9;e.hp+=(fp-e.hp)*a9;
  U.uM0.value.setFromMatrix4(e.m4.makeRotationFromEuler(e.eu.set(e.hp,e.hy,0,'YXZ')));
  // LES BRAS : celui du côté de la caisse se tend vers elle (pendu par les mains, il LÂCHE la dalle pour taper) ; l'autre pend (queue) ou tient (mains)
  e.r+=((cible?proche:0)-e.r)*Math.min(1,dt*(Q?5:3.5));
  const lui=cible?(cible.distanceToSquared(S.ep[0])<=cible.distanceToSquared(S.ep[1])?0:1):-1;
  for(let b=0;b<2;b++){const mu=b?U.uM2:U.uM1;
    if(b===lui&&e.r>.01){e.v.copy(cible).sub(S.ep[b]).normalize();e.q.setFromUnitVectors(S.re[b],e.v);
      const w=Math.min(.95,e.r)*(1+.12*Math.sin(e.t*14)*Math.max(0,e.r-.6));e.q.slerp(SG_QI,1-Math.min(1,w));e.m4.makeRotationFromQuaternion(e.q);}
    else if(Q)e.m4.makeRotationFromEuler(e.eu.set(.18*Math.sin(e.t*1.1+b*2),0,(b?-1:1)*(.12+.08*Math.sin(e.t*.8)),'XYZ'));
    else e.m4.identity();
    mu.value.setFromMatrix4(e.m4);}
}
/* LA POSE EN COURSE (2026-10-11, Léo : « les singes apparaissent quand on fait 3 sauts en 5 s : ils sautent avec nous sur la route, courent
   un peu avec nous et repartent ») — le MÊME singe, à QUATRE PATTES (au sol, un singe galope comme ça). Chaque partie du singe debout (corps,
   tête, bras, jambes, queue) est déplacée D'UN BLOC — une pose rigide par partie, p(course) = B + R·(p(debout) − A) — : les volumes, les
   couleurs, le sourire et le reflet des yeux restent ceux du singe debout. Le corps penche de 65° vers l'avant, la tête se relève et
   regarde devant, les bras descendent jusqu'au sol (les pattes avant), les jambes dessous, la queue en crosse vers le ciel.
   Repère : le sol en y = 0, le museau vers +z. Trois OS : 0 la tête (le cou) · 1 les DEUX bras (les épaules) · 2 les DEUX jambes (les
   hanches) — le galop, c'est les bras et les jambes à contretemps. */
const SG_PART=[0,0,1,1,1,1,1,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,6,6]; // la partie de chaque volume de SG_P : corps · tête · bras +x · bras −x · jambe +x · jambe −x · queue
const SGK=(function(){
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),q=new THREE.Quaternion(),rx=a=>new THREE.Matrix4().makeRotationX(a*Math.PI/180);
  const vise=(de,vers)=>new THREE.Matrix4().makeRotationFromQuaternion(q.setFromUnitVectors(de.clone().normalize(),vers.clone().normalize()));
  const tor={A:V(0,.08,0),B:V(0,.08,0),R:rx(65)},K=[tor];
  const parTorse=p=>p.clone().sub(tor.A).applyMatrix4(tor.R).add(tor.B); // un point du corps debout → sa place dans le corps penché
  K.push({A:V(0,.72,0),B:parTorse(V(0,.72,0)).add(V(0,.03,.03)),R:rx(8)}); // la tête, sur le cou : elle regarde devant (8° vers le bas)
  for(const s of [1,-1]){const A=V(.22*s,.6,.02);K.push({A,B:parTorse(A),R:vise(V(.28*s,.69,.11),V(.06*s,-.97,.2))});} // les bras → les pattes avant : vers le sol, un peu devant
  for(const s of [1,-1]){const A=V(.13*s,.02,.04);K.push({A,B:parTorse(A),R:vise(V(.07*s,-.38,.16),V(.08*s,-.97,-.12))});} // les jambes → les pattes arrière
  {const A=V(0,.02,-.16);K.push({A,B:parTorse(A),R:rx(108)});} // la queue : en crosse, derrière, vers le ciel
  const ou=(k,x,y,z)=>V(x,y,z).sub(K[k].A).applyMatrix4(K[k].R).add(K[k].B);
  const sol=Math.min(ou(2,.5,1.29,.13).y-.085,ou(4,.2,-.36,.2).y-.06); // le plus bas des mains et des pieds → y = 0
  for(const k of K){k.B.y-=sol;k.e=new THREE.Matrix3().setFromMatrix4(k.R).transpose().elements;}
  return {K,ou};
})();
const SG_PK=new Float32Array(21); // le point courant ramené dans le repère DEBOUT de chacune des sept parties
function sgCourse(x,y,z){ // le champ du singe EN COURSE ; remplit SG_D et SG_PK
  const K=SGK.K;for(let k=0;k<7;k++){const c=K[k],e=c.e,dx=x-c.B.x,dy=y-c.B.y,dz=z-c.B.z;
    SG_PK[k*3]=c.A.x+e[0]*dx+e[3]*dy+e[6]*dz;SG_PK[k*3+1]=c.A.y+e[1]*dx+e[4]*dy+e[7]*dz;SG_PK[k*3+2]=c.A.z+e[2]*dx+e[5]*dy+e[8]*dz;}
  let d=1e9;for(let i=0;i<SG_P.length;i++){const q=SG_P[i],k=SG_PART[i]*3,di=sgPrim(q,SG_PK[k],SG_PK[k+1],SG_PK[k+2]);SG_D[i]=di;
    if(i===0)d=di;else{const w=q[3];if(w<=0)d=Math.min(d,di);else{const hh=Math.max(w-Math.abs(d-di),0)/w;d=Math.min(d,di)-hh*hh*w*.25;}}}
  return d;
}
function sgColCourse(x,y,z,o){sgCourse(x,y,z);const i=sgProche(),k=SG_PART[i]*3;sgColQ(SG_P[i],SG_PK[k],SG_PK[k+1],SG_PK[k+2],o);}
function sgOsCourse(x,y,z,o){sgCourse(x,y,z);const i=sgProche(),p=SG_PART[i],k=p*3,X=SG_PK[k],Y=SG_PK[k+1],Z=SG_PK[k+2];o[0]=o[1]=o[2]=0;
  if(p===1)o[0]=1;else if(p===0&&Y>.6&&Math.abs(X)<.16)o[0]=Math.max(0,Math.min(1,(Y-.62)/.16));
  else if(p===2||p===3)o[1]=Math.max(0,Math.min(1,(Math.hypot(Math.abs(X)-.22,Y-.6,Z-.02)-.03)/.13));
  else if(p===4||p===5)o[2]=Math.max(0,Math.min(1,(Math.hypot(Math.abs(X)-.13,Y-.02,Z-.04)-.05)/.15));}
function singeCourseForme(){ // la forme EN COURSE : sa boîte = chaque volume ramené dans la pose, plus sa marge
  const K=SGK.K,mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(let i=0;i<SG_P.length;i++){const q=SG_P[i],k=SG_PART[i],r=q[0]==='e'?Math.max(q[5][0],q[5][1],q[5][2]):Math.max(q[6],q[7]);
    for(const c of q[0]==='e'?[q[4]]:[q[4],q[5]]){const v=SGK.ou(k,c[0],c[1],c[2]);for(let a=0;a<3;a++){mn[a]=Math.min(mn[a],v.getComponent(a)-r-.08);mx[a]=Math.max(mx[a],v.getComponent(a)+r+.08);}}}
  const z0=mn[2],z1=mx[2];
  return {mode:'course',min:mn,max:mx,hs:.034,h:.036,sdf:sgCourse,col:sgColCourse,os:sgOsCourse,
    s:(x,y,z)=>Math.max(0,Math.min(1,(z1-z)/(z1-z0))), // l'onde court du museau à la queue
    cou:K[1].B.clone(),epaules:new THREE.Vector3(0,K[2].B.y,K[2].B.z),hanches:new THREE.Vector3(0,K[4].B.y,K[4].B.z),
    centre:new THREE.Vector3(0,(mn[1]+mx[1])*.5,(z0+z1)*.5)};
}
const SINGE_FC=singeCourseForme();
function singeCourt(S,dt,air,vh,cible){ // LE GALOP · air : 0 au sol → 1 en plein saut · vh : sa vitesse verticale (m/s) · cible : la caisse dans son repère (ou null)
  const e=S.e,U=S.U,F=S.F;e.t+=dt;U.uT.value=e.t;e.ph+=dt*Math.PI*2*(2.9+.2*Math.sin(e.t*.37+e.k));
  const g=1-air,sn=Math.sin(e.ph);
  // les bras et les jambes à contretemps ; en l'air, les bras tendus devant, les jambes tendues derrière (un saut de singe)
  U.uM1.value.setFromMatrix4(e.m4.makeRotationX(g*.62*sn-air*1.25));
  U.uM2.value.setFromMatrix4(e.m4.makeRotationX(g*.55*Math.sin(e.ph+Math.PI*.85)+air*.95));
  // le corps : il rebondit et tangue au galop ; en l'air il suit sa trajectoire (le nez monte en montant, plonge en descendant)
  const tg=g*.13*Math.sin(e.ph+.6)+air*Math.max(-.45,Math.min(.45,-vh*.035)),c=F.centre,ct=Math.cos(tg),st=Math.sin(tg);
  S.grp.rotation.set(tg,0,0);S.grp.position.set(0,c.y-(c.y*ct-c.z*st)+g*.2*Math.max(0,sn),c.z-(c.y*st+c.z*ct)); // il tangue autour de son milieu
  // la tête garde l'horizon (elle rattrape le tangage) et, de temps en temps, jette un œil à la caisse par-dessus l'épaule
  let fy=.18*Math.sin(e.t*.9+e.k),fp=-tg*.8-.05;
  if(cible){const lk=Math.pow(Math.max(0,Math.sin(e.t*1.1+e.k*2)),6);fy+=(Math.max(-1.1,Math.min(1.1,Math.atan2(cible.x-F.cou.x,cible.z-F.cou.z)))-fy)*lk;}
  const a9=Math.min(1,dt*7);e.hy+=(fy-e.hy)*a9;e.hp+=(fp-e.hp)*a9;
  U.uM0.value.setFromMatrix4(e.m4.makeRotationFromEuler(e.eu.set(e.hp,e.hy,0,'YXZ')));
}
/* <<<FIN SINGE>>> */
