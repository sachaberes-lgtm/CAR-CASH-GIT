/* LE SINGE — sorti d'index.html le 2026-10-15 (Léo : « enlève les dauphins et les singes ; avec les figures ça n'a plus sa place, ça prend trop de place
   dans le jeu ») : ses volumes, ses poses du décor (bonjour, mangue, bord) et son galop ; il demande vitrail.js. Le JEU le charge (les singes du SOLEIL DE JADE, `jsgTick`) ainsi que
   le Worker creatures/atelier.js ; la boîte à singe le lit aussi. Il a besoin de THREE (vendor/three.min.js). */
/* <<<SINGE>>> LE SINGE (2026-10-10, Léo choisit « le 2 » : d'abord un singe PENDU par la queue sous la route, puis par les mains — ces deux poses sont
   RETIRÉES le 2026-10-18 ; il reste le modèle debout, ses poses du décor (SG_POSES) et son galop en course). Fait en VITRAIL.
   Modelé DEBOUT (la tête en haut, le visage vers +z) : des volumes simples soudés en douceur (ellipsoïdes, capsules) ; la couleur dit qui
   est le volume le plus proche (fourrure caramel, visage, ventre, mains et pieds pêche, yeux noirs à reflet, sourire). */
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
function sgProche(){let b=0;for(let i=1;i<SG_P.length;i++)if(SG_D[i]<SG_D[b])b=i;return b;}
function sgColQ(q,X,Y,Z,o){let r=q[1]; // la couleur du volume q au point (X,Y,Z) du singe DEBOUT (aussi pour la pose en course : chaque partie y est ramenée)
    if(r==='oeil'){const c=q[4];r=Math.hypot(X-c[0]-.014*Math.sign(c[0]),Y-c[1]-.02,Z-c[2]-.045)<.024?'reflet':'oeil';} /* le reflet : en haut, vers l'extérieur */
    else if(r==='museau'){if(Z>.24&&Math.abs(X)<.095&&Math.abs(Y-(.815+2.4*X*X))<.018)r='bouche'; // son vrai sourire (pendu par la queue, il se lit comme 🙃)
      else if(Z>.26&&Math.hypot(Math.abs(X)-.035,Y-.885)<.017)r='bouche';}
    else if(r==='oreille'&&Z>-.01&&Math.hypot((Math.abs(X)-.26)/.06,(Y-1.03)/.075)<1)r='oreille';
    else if(r==='oreille')r='four';
    else if(r==='four'&&q[2]===0&&Z>.06&&(X/.19)**2+((Y-.33)/.3)**2<1)r='ventre';
    else if(r==='four'&&Z<-.06)r='dos';
    else if(r==='queue')r=Y<-.6?'dos':'four';
    else if(r==='mangue'&&Z-q[4][2]>.025)r='mangueR'; /* (15/10) la joue rouge de la mangue, côté visage */
    o[0]=SG_RGB[r][0];o[1]=SG_RGB[r][1];o[2]=SG_RGB[r][2];}
function singeNouveau(cle,mode){ // un singe : son groupe, ses réglages, son état — une pose de SG_POSES (bonjour · mangue · bord) ou 'course' (à quatre pattes, les pieds en 0,0,0)
  if(SG_POSES[mode]){const F=singePoseForme(mode),U=vitrailU(F,{uGlowA:{value:new THREE.Color(1,.82,.28)},uGlowB:{value:new THREE.Color(1,.42,.18)}});
    U.uP0.value.copy(F.piv[0]);U.uP1.value.copy(F.piv[1]);U.uP2.value.copy(F.piv[2]);
    return {grp:vitrailObjet(F,U,cle||'singe'),U,F,mode,e:{t:0,ph:0,k:Math.random()*6.28,hy:0,hp:0,m4:new THREE.Matrix4(),eu:new THREE.Euler()}};}
  if(mode==='course'){const F=SINGE_FC,U=vitrailU(F,{uGlowA:{value:new THREE.Color(1,.82,.28)},uGlowB:{value:new THREE.Color(1,.42,.18)}});
    U.uP0.value.copy(F.cou);U.uP1.value.copy(F.epaules);U.uP2.value.copy(F.hanches);
    return {grp:vitrailObjet(F,U,cle||'singe'),U,F,mode:'course',e:{t:0,ph:0,k:Math.random()*6.28,hy:0,hp:0,m4:new THREE.Matrix4(),eu:new THREE.Euler()}};}
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
/* LES POSES ARTICULÉES (2026-10-15, Léo : « on va les replacer par map : les singes apparaîtront quelques fois sur les montagnes où on peut
   les voir dire bonjour ; sur la route, en train de courir ou de manger une mangue ; ou penchés sur le bord de la route »). Le singe debout est
   découpé en ONZE pièces rigides — corps, tête, bras (haut / avant-bras + main), jambes (cuisse / tibia + pied), queue — et une POSE ne dit
   que : le tangage du corps, la tête, la DIRECTION de chaque segment (épaule → coude → main, hanche → genou → pied), la queue. Chaque pièce est
   le volume debout déplacé d'un bloc : couleurs, visage, sourire intacts. Trois OS par pose (la recette vitrail en a trois) : chaque pose dit
   quelles pièces suivent quel os, et autour de quel pivot. Repère : le sol en y = 0 (`appui` : les pièces qui touchent le sol), le museau en +z. */
const SG_ART=[0,0,1,1,1,1,1,1,1,1, 2,3,3, 4,5,5, 6,7,7, 8,9,9, 10,10,10,10,10]; // la pièce de chaque volume de SG_P
const SG_SEG={ // les segments du singe DEBOUT : épaule → coude → centre de la main ; hanche → genou → centre du pied
  bD:[[.22,.6,.02],[.56,.84,.08],[.5,1.29,.13]],bG:[[-.22,.6,.02],[-.56,.84,.08],[-.5,1.29,.13]],
  jD:[[.13,.02,.04],[.3,-.12,.13],[.2,-.36,.2]],jG:[[-.13,.02,.04],[-.3,-.12,.13],[-.2,-.36,.2]]};
const SG_MANGUE=[['e','mangue',3,.015,[.48,1.42,.17],[.12,.095,.1]],['e','feuille',3,.01,[.5,1.53,.17],[.06,.022,.035]]]; // dans la main droite (pièce 3)
{const C2={mangue:0xffa526,mangueR:0xf0502a,feuille:0x4fae3e};for(const k in C2){const c=new THREE.Color(C2[k]);SG_RGB[k]=[c.r,c.g,c.b];}}
const SG_POSES={ // les poses du décor (directions dans le repère de la pose : x à droite du singe, y en haut, z devant lui)
  bonjour:{corps:.04,bD:[[1,.3,.18],[.06,1,.16]],bG:[[.25,-1,.08],[.05,-1,.3]],jD:[[.32,-.95,.1],[.04,-1,.12]],jG:[[-.32,-.95,.1],[-.04,-1,.12]],
    queue:[2,0],appui:[7,9],os:[[1],[3],[10]],piv:['cou','coudeD','queue']},
  mangue:{corps:-.05,tete:[.2,0,0],bD:[[.4,-.2,.9],[-.8,.45,-.36]],bG:[[-.4,-.2,.9],[.8,.45,-.36]],jD:[[.35,0,.95],[.08,-.75,.6]],jG:[[-.35,0,.95],[-.08,-.75,.6]],
    queue:[1.45,.5],mangue:true,appui:[0,7,9],os:[[1],[3,5],[10]],piv:['cou','coudes','queue']},
  bord:{corps:.32,tete:[-.15,0,0],bD:[[.75,.5,.42],[.1,1,.18]],bG:[[-.45,-.82,.3],[-.08,-1,.12]],jD:[[.12,-.1,1],[0,-1,.15]],jG:[[-.12,-.1,1],[0,-1,.15]],
    queue:[.55,0],appui:[0],os:[[1],[3],[7,9]],piv:['cou','coudeD','genoux']}};
function singePoseForme(nom){ // la forme d'une pose de SG_POSES (bâtie une fois par pose, à la demande)
  const P=SG_POSES[nom];if(P.F)return P.F;
  const V=a=>new THREE.Vector3(a[0],a[1],a[2]),qq=new THREE.Quaternion(),
    rot=(x,y,z,o)=>new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x,y,z,o||'YXZ')),
    vise=(de,vers)=>new THREE.Matrix4().makeRotationFromQuaternion(qq.setFromUnitVectors(de.clone().normalize(),vers.clone().normalize()));
  const K=new Array(11),pv=V([0,.08,0]),Rt=rot(P.corps||0,0,0),parT=p=>p.clone().sub(pv).applyMatrix4(Rt).add(pv);
  K[0]={A:pv.clone(),B:pv.clone(),R:Rt};
  {const A=V([0,.72,0]),h=P.tete||[0,0,0];K[1]={A,B:parT(A),R:Rt.clone().multiply(rot(h[0],h[1],h[2]))};}
  const J={};
  const membre=(seg,d,k,n)=>{const S0=V(seg[0]),S1=V(seg[1]),S2=V(seg[2]),B0=parT(S0),d1=V(d[0]).normalize(),d2=V(d[1]).normalize();
    K[k]={A:S0,B:B0,R:vise(S1.clone().sub(S0),d1)};const B1=B0.clone().addScaledVector(d1,S1.distanceTo(S0));
    K[k+1]={A:S1,B:B1,R:vise(S2.clone().sub(S1),d2)};J[n+'0']=B0;J[n+'1']=B1;};
  membre(SG_SEG.bD,P.bD,2,'bD');membre(SG_SEG.bG,P.bG,4,'bG');membre(SG_SEG.jD,P.jD,6,'jD');membre(SG_SEG.jG,P.jG,8,'jG');
  {const A=V([0,.02,-.16]),q=P.queue||[0,0];K[10]={A,B:parT(A),R:Rt.clone().multiply(rot(q[0],q[1],0,'XYZ'))};}
  const PR=P.mangue?SG_P.concat(SG_MANGUE):SG_P,PT=P.mangue?SG_ART.concat([3,3]):SG_ART;
  const ou=(k,c)=>V(c).sub(K[k].A).applyMatrix4(K[k].R).add(K[k].B),rayon=q=>q[0]==='e'?Math.max(q[5][0],q[5][1],q[5][2]):Math.max(q[6],q[7]);
  let sol=1e9;for(let i=0;i<PR.length;i++){const q=PR[i],k=PT[i];if(P.appui&&P.appui.indexOf(k)<0)continue;
    for(const c of q[0]==='e'?[q[4]]:[q[4],q[5]])sol=Math.min(sol,ou(k,c).y-rayon(q));}
  for(const k of K){k.B.y-=sol;k.e=new THREE.Matrix3().setFromMatrix4(k.R).transpose().elements;}for(const n in J)J[n].y-=sol;
  const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(let i=0;i<PR.length;i++){const q=PR[i],r=rayon(q);for(const c of q[0]==='e'?[q[4]]:[q[4],q[5]]){const v=ou(PT[i],c);
    for(let a=0;a<3;a++){mn[a]=Math.min(mn[a],v.getComponent(a)-r-.08);mx[a]=Math.max(mx[a],v.getComponent(a)+r+.08);}}}
  const D=new Float32Array(PR.length),PK=new Float32Array(33);
  const champ=(x,y,z)=>{for(let k=0;k<11;k++){const c=K[k],e=c.e,dx=x-c.B.x,dy=y-c.B.y,dz=z-c.B.z;
      PK[k*3]=c.A.x+e[0]*dx+e[3]*dy+e[6]*dz;PK[k*3+1]=c.A.y+e[1]*dx+e[4]*dy+e[7]*dz;PK[k*3+2]=c.A.z+e[2]*dx+e[5]*dy+e[8]*dz;}
    let d=1e9;for(let i=0;i<PR.length;i++){const q=PR[i],k=PT[i]*3,di=sgPrim(q,PK[k],PK[k+1],PK[k+2]);D[i]=di;
      if(i===0)d=di;else{const w=q[3];if(w<=0)d=Math.min(d,di);else{const hh=Math.max(w-Math.abs(d-di),0)/w;d=Math.min(d,di)-hh*hh*w*.25;}}}
    return d;};
  const proche=()=>{let b=0;for(let i=1;i<PR.length;i++)if(D[i]<D[b])b=i;return b;};
  const piv={cou:K[1].B.clone(),queue:K[10].B.clone(),coudeD:J.bD1,coudeG:J.bG1,coudes:J.bD1.clone().add(J.bG1).multiplyScalar(.5),
    genoux:J.jD1.clone().add(J.jG1).multiplyScalar(.5),hanches:J.jD0.clone().add(J.jG0).multiplyScalar(.5),epaules:J.bD0.clone().add(J.bG0).multiplyScalar(.5)};
  const y0=mn[1],y1=mx[1];
  P.F={mode:nom,min:mn,max:mx,hs:.036,h:.042,sdf:champ,
    col:(x,y,z,o)=>{champ(x,y,z);const i=proche(),k=PT[i]*3;sgColQ(PR[i],PK[k],PK[k+1],PK[k+2],o);},
    os:(x,y,z,o)=>{champ(x,y,z);const k=PT[proche()];o[0]=o[1]=o[2]=0;for(let b=0;b<3;b++)if(P.os[b].indexOf(k)>=0)o[b]=1;},
    s:(x,y,z)=>Math.max(0,Math.min(1,(y1-y)/(y1-y0))),cou:piv.cou,piv:P.piv.map(n=>piv[n]),J:piv,
    centre:new THREE.Vector3(0,(mn[1]+mx[1])*.5,(mn[2]+mx[2])*.5)};
  return P.F;
}
function singeAnimePose(S,dt,cible){ // les poses du décor : la tête suit la cible (la caisse, dans son repère), et chacune son geste
  const e=S.e,U=S.U,F=S.F;e.t+=dt;U.uT.value=e.t;const t=e.t+e.k;
  let fy=.25*Math.sin(t*.7),fp=.08*Math.sin(t*1.1);
  if(cible){const dx=cible.x-F.cou.x,dy=cible.y-F.cou.y,dz=cible.z-F.cou.z;fy=Math.max(-1.25,Math.min(1.25,Math.atan2(dx,dz)));fp=Math.max(-.6,Math.min(.5,-Math.atan2(dy,Math.hypot(dx,dz))));}
  if(S.mode==='mangue'){const m9=Math.pow(Math.max(0,Math.sin(t*2.1)),2);fp=fp*.4+.25*m9+.04*Math.sin(t*15)*m9;} // il CROQUE : la tête descend vers la mangue
  const a9=Math.min(1,dt*6);e.hy+=(fy-e.hy)*a9;e.hp+=(fp-e.hp)*a9;
  U.uM0.value.setFromMatrix4(e.m4.makeRotationFromEuler(e.eu.set(e.hp,e.hy,0,'YXZ')));
  if(S.mode==='bonjour'||S.mode==='bord'){const w=(S.mode==='bonjour'?.6:.45)*Math.sin(t*(S.mode==='bonjour'?7.5:5.5));U.uM1.value.setFromMatrix4(e.m4.makeRotationZ(w));} // COUCOU : l'avant-bras balaie de côté
  else if(S.mode==='mangue'){const m9=Math.pow(Math.max(0,Math.sin(t*2.1)),2);U.uM1.value.setFromMatrix4(e.m4.makeRotationX(-.35+.5*m9));} // la mangue monte à la bouche, et redescend
  if(S.mode==='bord')U.uM2.value.setFromMatrix4(e.m4.makeRotationX(.4*Math.sin(t*2.6))); // les jambes BALANCENT dans le vide
  else U.uM2.value.setFromMatrix4(e.m4.makeRotationY(.35*Math.sin(t*1.3))); // la queue
  S.grp.position.y=S.mode==='bonjour'?.03*Math.abs(Math.sin(t*3.75)):0;
}
/* <<<FIN SINGE>>> */
