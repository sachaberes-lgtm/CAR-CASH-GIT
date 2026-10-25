/* ATCHOUM — LE FEU (2026-10-06, Léo : « elle crache du feu et éternue des flammes »). Deux gestes, en course seulement (les réserves
   de particules ne vivent que là) :
   · ELLE CRACHE : toutes les 0,4-1,4 s dès qu'elle roule, une langue de feu courte sort d'un de ses pots au hasard (les deux pots
     latéraux devant les roues arrière, les deux sorties sous le pare-chocs) — en plus du retour de flamme au lâcher et de la nitro ;
   · ELLE ÉTERNUE : toutes les 3-7,5 s, elle prend sa respiration (le nez se lève 0,4 s) puis ATCHOUM — le nez pique, et une gerbe de
     flammes part DROIT DEVANT du museau ; la caisse, plus rapide, la rattrape et la traverse. « ATCHOUM ! » au-dessus d'elle, un souffle.
   Le corps se penche par-dessus la pose de la boucle (elle repose `carBody` à chaque image : rien ne s'accumule). */
const ATCH={on:false,reste:0,t:4,ph:0,k:0,n:0,crache:1,P:new THREE.Vector3(),F:new THREE.Vector3(),R:new THREE.Vector3(),H:new THREE.Vector3(),V:new THREE.Vector3(),Z:new THREE.Vector3(),N:new THREE.Vector3(0,.47,2.2)};
const VIT_EXV=()=>EXV; // la vitesse monde de la caisse (déclarée plus bas)
function atchFeu(course){
  const P=ATCH.P,F=ATCH.F,R=ATCH.R,H=ATCH.H,EXV=course?ATCH.V:ATCH.Z;potMonde(ATCH.N,P);if(course)ATCH.V.copy(VIT_EXV()); // au garage, la caisse est à l'arrêt
  for(let i=0;i<30;i++){const s9=11+Math.random()*13,a=(Math.random()-.5)*5,b=(Math.random()-.25)*3.4;
    spawnP(flames,P.x,P.y,P.z,EXV.x+F.x*s9+R.x*a+H.x*b,EXV.y+F.y*s9+R.y*a+H.y*b,EXV.z+F.z*s9+R.z*a+H.z*b,.22+Math.random()*.25);}
  for(let i=0;i<12;i++){const s9=9+Math.random()*9,a=(Math.random()-.5)*2.4,b=(Math.random()-.3)*1.8;
    spawnP(flameCore,P.x,P.y,P.z,EXV.x+F.x*s9+R.x*a+H.x*b,EXV.y+F.y*s9+R.y*a+H.y*b,EXV.z+F.z*s9+R.z*a+H.z*b,.16+Math.random()*.16);}
  for(let i=0;i<14;i++){const s9=6+Math.random()*10,a=(Math.random()-.5)*6;
    spawnP(embers,P.x,P.y,P.z,EXV.x+F.x*s9+R.x*a+H.x*(2+Math.random()*4),EXV.y+F.y*s9+R.y*a+H.y*(2+Math.random()*4),EXV.z+F.z*s9+R.z*a+H.z*(2+Math.random()*4),.3+Math.random()*.3);}
  if(course){popTexte(TR('ATCHOUM !'),'#ffb030',0);hap&&hap(18);}else ATCH.reste=2.5; // (audit) au garage : ses flammes vivent encore 2,5 s, même si on change de caisse
  if(!(typeof sfx==='function'&&(sfx('caisse.atchoum')||sfx('nitro.sec',{st:5,vol:2}))))noiseBurst(.2,.09,620); // (2026-10-14, session SON) « caisse.atchoum » cuit le 14/10 : la flamme qui TOUSSE de la panne sèche (« a… TCHOUM »). Le repli sur nitro.sec n'est plus qu'un filet
}
function atchTick(dt){
  if(!ATCH.on){if(ATCH.reste>0){ATCH.reste-=dt;if(garageOn&&!running)for(const q of [flames,flameCore,embers])updatePool(q,dt,q===embers?4.5:1);}return;} /* (2026-10-07, audit) on a changé de caisse au garage : ses dernières flammes finissent leur vie au lieu de rester plantées */
  const course=running&&!gameOver&&!paused&&mode!=='boom'&&!garageOn,vitrine=garageOn&&!running; // au garage aussi elle éternue (la vitrine)
  if(!course&&!vitrine){ATCH.ph=0;ATCH.k=0;return;}
  const F=ATCH.F.set(0,0,1).applyQuaternion(carGroup.quaternion);ATCH.R.set(1,0,0).applyQuaternion(carGroup.quaternion);ATCH.H.set(0,1,0).applyQuaternion(carGroup.quaternion);
  if(vitrine)for(const q of [flames,flameCore,embers])updatePool(q,dt,q===embers?4.5:1); // (en course la boucle les fait vivre ; au garage, c'est elle)
  if(course&&(ATCH.crache-=dt)<=0){ATCH.crache=.4+Math.random();                          // ELLE CRACHE
    if(vKmh()>25&&CAR_POTS.length){const P=ATCH.P;potMonde(CAR_POTS[(Math.random()*CAR_POTS.length)|0],P);
      for(let i=0;i<5;i++)spawnP(flames,P.x,P.y,P.z,EXV.x-F.x*(5+Math.random()*7)+(Math.random()-.5)*1.6,EXV.y+Math.random()*1.3,EXV.z-F.z*(5+Math.random()*7)+(Math.random()-.5)*1.6,.08+Math.random()*.09);
      spawnP(flameCore,P.x,P.y,P.z,EXV.x-F.x*8,EXV.y+.4,EXV.z-F.z*8,.07);
      if(Math.random()<.6)spawnP(embers,P.x,P.y,P.z,EXV.x-F.x*4+(Math.random()-.5)*3,EXV.y+1.5+Math.random()*2,EXV.z-F.z*4+(Math.random()-.5)*3,.25);}}
  ATCH.t-=dt;                                                                               // ELLE ÉTERNUE
  if(ATCH.ph===0&&ATCH.t<=.4)ATCH.ph=1;
  const corps=course&&mode==='drive'; // (la boucle repose `carBody` à chaque image en course ; au garage on n'y touche pas)
  if(ATCH.ph===1){ATCH.k=Math.min(1,ATCH.k+dt/.4);if(corps)carBody.rotation.x-=.07*ATCH.k*ATCH.k; // la respiration : le nez se lève
    if(ATCH.t<=0){ATCH.ph=2;ATCH.n=.32;atchFeu(course);}}
  else if(ATCH.ph===2){ATCH.n-=dt;if(corps)carBody.rotation.x+=.1*Math.sin(Math.max(0,ATCH.n/.32)*Math.PI); // ATCHOUM : le nez pique
    if(ATCH.n<=0){ATCH.ph=0;ATCH.k=0;ATCH.t=3+Math.random()*4.5;}}
}
const TR_PJ=new THREE.Vector3(),TR_Q=new THREE.Vector3(),TR_CUT={a:.08,b:.26}; // (2026-09-29) la projection d'un point du ruban, le point où on le COUPE, et la descente à l'écran tolérée (voir « plus de fils de marionnette »)
function trailStep(tr,px,py,pz,cr,cg,cb,k,wMul){
  if(k<.03){tr.m.visible=false;tr.init=false;return;}
  const h=tr.hist;
  if(!tr.init){for(const q of h)q.set(px,py,pz);tr.init=true;} // réveil : pas de trait fantôme depuis l'ancienne position
  const tail=h.pop();tail.set(px,py,pz);h.unshift(tail);       // la tête colle à la tuyère, la queue s'efface
  /* RUBANS v2 (2026-09-26, passe graphique) : la caméra de poursuite est à ~4 m des tuyères, 3,5 m au-dessus — le fondu de 6 à 14 m
     effaçait donc TOUT le ruban vu de derrière (on ne le voyait qu'en vol). Désormais c'est un FIL de lumière : effilé (trait franc à la
     tuyère, fil à la queue), jamais plus épais qu'~1° d'angle à l'écran (`dC*.009` : près de l'objectif il s'amincit au lieu de
     grossir — plus de voile possible), tête qui BLANCHIT, et il s'efface quand on le regarde PILE dans l'axe (sinus de l'angle
     ruban/regard `sA` : vu de bout, un ruban devient une nappe — c'était le « tapis »). Le fondu près de l'objectif se resserre à
     2,4-3,6 m : le fil vit sous la caméra, de la tuyère jusqu'au bas de l'écran (← c'était ça, les « fils » : voir juste dessous). */
  const P=tr.pos,C=tr.col,wm=wMul||1;
  /* PLUS DE « FILS DE MARIONNETTE » (2026-09-29, Sacha : « les trois », après deux critiques : « en nitro et en vol, les deux traînées
     descendent jusqu'au bas de l'écran, la caisse semble pendue à deux fils »). L'historique n'a qu'UN point par image : à pleine
     vitesse ils sont espacés de plusieurs mètres, le 2e ou le 3e est déjà sous (ou derrière) l'objectif, et la couleur s'étirait
     sur tout ce segment — un fondu par sommet n'y peut rien. Le ruban est donc COUPÉ géométriquement : dès qu'un point descend à
     l'écran de plus de TR_CUT.b (0,26 de hauteur normalisée, ~13 % de l'écran) sous sa tuyère, on place un dernier sommet, éteint,
     pile au franchissement, et tout le reste s'y replie. Il s'estompe dès TR_CUT.a ; il file toujours sur les côtés et au loin ;
     sa queue fond plus tôt. (0,32 essayé : encore un trait jusqu'aux deux tiers de l'écran.) */
  TR_PJ.copy(h[0]).project(camera);const yh9=TR_PJ.y;
  let cut9=false,dp9=0;
  for(let i=0;i<TRAIL_N;i++){
    const p=h[i],pn=h[Math.min(i+1,TRAIL_N-1)],pp=h[Math.max(i-1,0)];
    if(cut9){P.copyWithin(i*6,(i-1)*6,i*6);C.fill(0,i*6,i*6+6);continue;} // replié sur le point de coupe, éteint
    rbD.subVectors(pn,pp);rbV.subVectors(p,camera.position);
    rbS.crossVectors(rbD,rbV);
    const l2=rbS.lengthSq(),dC=rbV.length(),lD=rbD.length();
    let sA=0;
    if(l2>1e-9){const l9=Math.sqrt(l2);sA=(lD>1e-5&&dC>1e-5)?l9/(lD*dC):0;rbS.multiplyScalar(1/l9);}else rbS.set(0,0,0);
    const u=1-i/(TRAIL_N-1),w=Math.min((.012+.075*u*u)*wm,dC*.009);
    let f=u*u*k;
    f*=THREE.MathUtils.smoothstep(dC,2.4,3.6)*THREE.MathUtils.smoothstep(sA,.1,.32);
    TR_PJ.copy(p).project(camera);const d9=TR_PJ.z>1?9:yh9-TR_PJ.y; // (2026-09-29) de combien il est descendu à l'écran (derrière l'objectif : « tout en bas »)
    let q9=p;
    if(i>0&&d9>=TR_CUT.b){cut9=true;f=0;q9=TR_Q.lerpVectors(pp,p,THREE.MathUtils.clamp((TR_CUT.b-dp9)/Math.max(1e-4,d9-dp9),0,1));} // LA COUPE, au franchissement
    else f*=(1-THREE.MathUtils.smoothstep(d9,TR_CUT.a,TR_CUT.b))*THREE.MathUtils.smoothstep(u,0,.45); // il s'estompe en descendant, et sa queue fond plus tôt
    dp9=d9;
    const hot=u*u*u*u*.55*f; // le cœur chaud de la tête
    P[i*6]=q9.x+rbS.x*w;P[i*6+1]=q9.y+rbS.y*w;P[i*6+2]=q9.z+rbS.z*w;
    P[i*6+3]=q9.x-rbS.x*w;P[i*6+4]=q9.y-rbS.y*w;P[i*6+5]=q9.z-rbS.z*w;
    C[i*6]=cr*f+hot;C[i*6+1]=cg*f+hot;C[i*6+2]=cb*f+hot;
    C[i*6+3]=C[i*6];C[i*6+4]=C[i*6+1];C[i*6+5]=C[i*6+2];
  }
  tr.m.visible=true;
  tr.m.geometry.attributes.position.needsUpdate=true;
  tr.m.geometry.attributes.color.needsUpdate=true;
}
const SV=new THREE.Vector3(),SD=new THREE.Vector3(),SS=new THREE.Vector3(),SP=new THREE.Vector3(); // (sillage) réutilisés : zéro allocation
function silPousse(tr){for(const a of [tr.X,tr.Y,tr.Z,tr.T,tr.K,tr.CR,tr.CG,tr.CB])a.copyWithin(1,0,SIL.N-1);tr.n=Math.min(SIL.N,tr.n+1);} // un cran : la case 0 se libère pour la tête
function silPose(tr,i,x,y,z,k,r,g,b){tr.X[i]=x;tr.Y[i]=y;tr.Z[i]=z;tr.T[i]=tr.clk;tr.K[i]=k;tr.CR[i]=r;tr.CG[i]=g;tr.CB[i]=b;}
function sillageStep(tr,px,py,pz,cr,cg,cb,k,wm,dt,wu){ // wm : l'élargissement de la TÊTE (nitro, allumage) · wu : la largeur de TOUT le sillage (un pot seul : plus large)
  tr.clk+=dt||0;
  if(!tr.init){tr.n=0;tr.emit=false;tr.init=true;tr.g=0;} // réveil, portail, replacement : on repart de RIEN (pas de trait tendu depuis l'ancienne position)
  const emet=k>=.03;
  if(emet){
    if(tr.n===0){silPose(tr,0,px,py,pz,k,cr,cg,cb);tr.n=1;silPousse(tr);} // la graine : un point fixe, puis la tête
    else if(!tr.emit){ // on RALLUME sous l'ancien sillage qui s'éteignait : il garde l'éclat où il en était, et une COUPURE (deux points éteints) le sépare du neuf
      for(let i=0;i<tr.n;i++)tr.K[i]*=tr.g;tr.K[0]=0;silPousse(tr);silPose(tr,0,px,py,pz,0,cr,cg,cb);silPousse(tr);}
    else{const dx=px-tr.X[1],dy=py-tr.Y[1],dz=pz-tr.Z[1];if(dx*dx+dy*dy+dz*dz>SIL.PAS*SIL.PAS&&tr.clk-tr.T[1]>=SIL.DTM)silPousse(tr);} // la tête se FIXE : un point de plus
    silPose(tr,0,px,py,pz,k,cr,cg,cb);tr.g=1; // la tête colle à la bouche du pot
  }else if(tr.emit)tr.tOff=tr.clk; // on vient de lâcher : le sillage entier s'éteint à partir de maintenant
  tr.emit=emet;
  if(!emet&&tr.n>0){tr.g=Math.max(0,1-(tr.clk-tr.tOff)/SIL.OFF);if(tr.g<=0)tr.n=0;}
  // 50 MÈTRES : on garde le chemin jusqu'au premier point au-delà de LONG (il sert au fondu de la queue), et rien de plus vieux que VMAX
  {let acc=0;const X=tr.X,Y=tr.Y,Z=tr.Z;for(let i=1;i<tr.n;i++){const dx=X[i]-X[i-1],dy=Y[i]-Y[i-1],dz=Z[i]-Z[i-1];acc+=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(acc>tr.lg||tr.clk-tr.T[i]>SIL.VMAX){tr.n=i+1;break;}}tr.long=acc;} // (traînées de lumière) la longueur VIT : courte au roulage, 100 m au nitro
  if(tr.n<2){tr.m.visible=false;if(!emet)tr.n=0;return;}
  // 1) LA COURBE : Catmull-Rom entre les points (jamais à travers une coupure), intensité et couleur interpolées
  const Q=SIL_Q,S=SIL.SUB,n=tr.n,X=tr.X,Y=tr.Y,Z=tr.Z,K=tr.K;let R9=0;
  for(let i=0;i<n-1;i++){
    const a=(i>0&&K[i]!==0)?i-1:i,d=(i+2<n&&K[i+1]!==0)?i+2:i+1,b=i+1;
    for(let q=0;q<S;q++){
      const u=q/S,u2=u*u,u3=u2*u,c0=-.5*u3+u2-.5*u,c1=1.5*u3-2.5*u2+1,c2=-1.5*u3+2*u2+.5*u,c3=.5*u3-.5*u2,o=R9*8;
      Q[o]=c0*X[a]+c1*X[i]+c2*X[b]+c3*X[d];Q[o+1]=c0*Y[a]+c1*Y[i]+c2*Y[b]+c3*Y[d];Q[o+2]=c0*Z[a]+c1*Z[i]+c2*Z[b]+c3*Z[d];
      Q[o+3]=K[i]+(K[b]-K[i])*u;Q[o+4]=tr.CR[i]+(tr.CR[b]-tr.CR[i])*u;Q[o+5]=tr.CG[i]+(tr.CG[b]-tr.CG[i])*u;Q[o+6]=tr.CB[i]+(tr.CB[b]-tr.CB[i])*u;R9++;}
  }
  {const o=R9*8,l=n-1;Q[o]=X[l];Q[o+1]=Y[l];Q[o+2]=Z[l];Q[o+3]=K[l];Q[o+4]=tr.CR[l];Q[o+5]=tr.CG[l];Q[o+6]=tr.CB[l];R9++;}
  // (v5) OÙ FILE LA TÊTE : la direction de ses ~1,8 premiers mètres — la plume du pot s'y couche (plus de flamme droite sur un sillage qui tourne)
  tr.dOk=false;
  if(emet){let ac=0,r2=0;for(let r=1;r<R9;r++){const o=r*8;ac+=Math.hypot(Q[o]-Q[o-8],Q[o+1]-Q[o-7],Q[o+2]-Q[o-6]);r2=r;if(ac>=SIL.tete)break;}
    const dx=Q[r2*8]-Q[0],dy=Q[r2*8+1]-Q[1],dz=Q[r2*8+2]-Q[2],l9=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(l9>.25){tr.dX=dx/l9;tr.dY=dy/l9;tr.dZ=dz/l9;tr.dOk=true;}}
  // (v6) LES BRAISES : le sillage crache des étincelles sur toute sa longueur (plus serrées près de la tuyère), qui s'écartent et montent
  if(emet&&R9>6&&dt>0&&tr.hk>.15){let nb=SIL.braise*dt*60*tr.g*tr.hk; // (2026-10-15) au nitro seulement : un feu arrière ne crache pas de braises
    while(nb>0){if(nb<1&&Math.random()>nb)break;nb--;
      const r=2+Math.floor(Math.pow(Math.random(),1.6)*(R9-3)),o=r*8,a=Math.random()*6.2832,sp=.8+Math.random()*2.2;
      if(nfeuGicle(Q[o]+(Math.random()-.5)*.3,Q[o+1]+(Math.random()-.5)*.3,Q[o+2]+(Math.random()-.5)*.3,Math.cos(a)*sp*.8,Math.abs(Math.sin(a))*sp+1.2,Math.sin(a)*sp*.5,.09+.07*Math.random()))continue; // (2026-10-15) des CUBES du feu de pixels (repli : les braises rondes)
      spawnP(silBraises,Q[o]+(Math.random()-.5)*.3,Q[o+1]+(Math.random()-.5)*.3,Q[o+2]+(Math.random()-.5)*.3,Math.cos(a)*sp,Math.abs(Math.sin(a))*sp+.6,Math.sin(a)*sp*.6,.35+Math.random()*.4);}}
  silRuban(tr,R9,emet,dt,wm,wu);
}
/* (2026-10-16, session TRAÎNÉES — Sacha : « améliore chaque traînée, il faut qu'elle donne toute envie d'acheter ») LE RUBAN À PART :
   la courbe (SIL_Q, R9 rangées x y z k r g b) devient le ruban face caméra. Séparé de sillageStep pour que l'APERÇU du garage dessine la
   VRAIE traînée de lumière (silApercu) — avant, l'atelier montrait une bande plate qui sortait des pots.
   SIL_ENCRE : dans la SALLE BLANCHE de la boutique, une lumière additive ne se voit pas sur le blanc. Le ruban y passe en ENCRE : même
   géométrie, mélange (0, 1 − src) et couleur inversée — le blanc se teinte de la couleur de la traînée, à la même intensité. Le mélange
   n'entre pas dans la clé des programmes de three r128 : zéro recompilation. */
let SIL_ENCRE=false,SIL_STY=null; // SIL_STY : le TEMPÉRAMENT d'un ruban de la boutique (`sil` sur sa fiche) — c : le cœur ×, h : le halo ×, f : le refroidissement (0 = garde sa couleur jusqu'au bout), p : les pouls ×
function silEncre(m,on){const M=m.material;if(!!M._encre===on)return;M._encre=on;
  if(on){M.blending=THREE.CustomBlending;M.blendEquation=THREE.AddEquation;M.blendSrc=THREE.ZeroFactor;M.blendDst=THREE.OneMinusSrcColorFactor;}
  else M.blending=THREE.AdditiveBlending;}
function silRuban(tr,R9,emet,dt,wm,wu){
  const Q=SIL_Q;silEncre(tr.m,SIL_ENCRE);
  const dk=(TRJ.on&&!SIL_ENCRE&&running&&!garageOn)?(1-LUM.nuit)*TRJ.k:0,CI=tr.coli; // (2026-10-18) LE VOILE DE JOUR (voir TRJ) : nul la nuit, au garage et en salle blanche
  // 2) LE RUBAN : face caméra, halo + cœur ; en vol, coupé à l'écran quand il PEND sous sa tuyère
  const P=tr.pos,C=tr.col,cam=camera.position,SM=THREE.MathUtils.smoothstep,wv=wm||1,wa=wu||1,LG=Math.max(4,tr.lg),QU=SIL.QUEUE*LG/SIL.LONG;
  TR_PJ.set(Q[0],Q[1],Q[2]).project(camera);const yh=TR_PJ.y,xh=TR_PJ.x,asp=camera.aspect||.5;
  /* CE QUI PEND EST COUPÉ, CE QUI S'ÉCARTE VIT : la « descente » d'un point, c'est sa chute à l'écran sous la tuyère MOINS son écart sur
     le côté (`kx`). Au sol (`cutB` 9 : jamais) le sillage file jusqu'au bas de l'écran ; en vol (`cutV`) il ne pend qu'un tiers d'écran,
     le cœur s'éteignant avant le halo (`cutK`). Le seuil glisse d'un régime à l'autre en ~0,4 s. */
  const cut=(tr.cut+=((mode==='fall'?SIL.cutV:SIL.cutB)-tr.cut)*Math.min(1,(dt||0)*2.5)),cutA=cut*SIL.cutA,cutK=cut*SIL.cutK;
  let arc=0,dp=0,Rf=R9,depP=1e9;camera.getWorldDirection(SIL_CD);const CD=SIL_CD;
  for(let r=0;r<R9;r++){
    const o=r*8,ra=Math.max(0,r-1)*8,rb=Math.min(R9-1,r+1)*8;let x=Q[o],y=Q[o+1],z=Q[o+2];
    if(r>0){const ex=x-Q[o-8],ey=y-Q[o-7],ez=z-Q[o-6];arc+=Math.sqrt(ex*ex+ey*ey+ez*ez);}
    SD.set(Q[rb]-Q[ra],Q[rb+1]-Q[ra+1],Q[rb+2]-Q[ra+2]);SV.set(x-cam.x,y-cam.y,z-cam.z);SS.crossVectors(SD,SV);
    const l2=SS.lengthSq(),dC=SV.length(),lD=SD.length();let sA=0;
    if(l2>1e-12){const l9=Math.sqrt(l2);sA=(lD>1e-6&&dC>1e-6)?l9/(lD*dC):0;SS.multiplyScalar(1/l9);
      if(r>0&&SS.x*SP.x+SS.y*SP.y+SS.z*SP.z<0)SS.negate();SP.copy(SS);}else SS.set(0,0,0); /* (2026-10-18) le côté GARDE son sens d'une rangée à l'autre : là où le ruban passe dans l'axe du regard (vol, vrilles, sous l'objectif), le côté s'inversait et la bande se pinçait en nœud papillon */
    const al=Math.min(1,arc/LG);
    let f=Q[o+3]*tr.g*(1-.22*al)*SM(arc,0,.35)*(mode==='fall'?SM(sA,SIL.axeV*.25,SIL.axeV):SM(sA,.05,.22))*(1-SM(arc,LG-QU,LG)); // (v6) en vol, vu dans l'axe il RESTE (la caméra suit le vol) // RÉGULIER sur 40 m, la queue s'éteint sur les 10 derniers ; la tête naît sous la plume ; vu PILE dans l'axe, il s'efface (le « tapis »)
    let fin=r>0&&arc>=LG;
    /* (v6) DERRIÈRE L'OBJECTIF : le ruban va jusqu'au plan de la caméra (il y fond, `dC`) au lieu de s'arrêter en plein écran — avant, un
       point passé derrière valait « 9 » et la coupe s'interpolait entre ce 9 factice et le point d'avant : la bande finissait au MILIEU
       de l'image (MESURÉ en vol, où la caméra suit le sillage). On coupe au vrai plan (profondeur `pres`), interpolé dans l'espace. */
    const dep=(x-cam.x)*CD.x+(y-cam.y)*CD.y+(z-cam.z)*CD.z;
    if(!fin&&r>0&&dep<SIL.pres){fin=true;const t9=THREE.MathUtils.clamp((depP-SIL.pres)/Math.max(1e-4,depP-dep),0,1);x=Q[o-8]+(x-Q[o-8])*t9;y=Q[o-7]+(y-Q[o-7])*t9;z=Q[o-6]+(z-Q[o-6])*t9;}
    depP=dep;
    TR_PJ.set(x,y,z).project(camera);const d=dep<SIL.pres?dp:(yh-TR_PJ.y)-SIL.kx*Math.abs(TR_PJ.x-xh)*asp; // de combien il PEND à l'écran sous sa tuyère
    if(!fin&&r>0&&d>=cut){fin=true;const t9=THREE.MathUtils.clamp((cut-dp)/Math.max(1e-4,d-dp),0,1);x=Q[o-8]+(x-Q[o-8])*t9;y=Q[o-7]+(y-Q[o-7])*t9;z=Q[o-6]+(z-Q[o-6])*t9;} // LA COUPE, au franchissement
    if(fin)f=0;
    const fK=1-SM(d,cutA*.5,cutK);if(!fin)f*=1-SM(d,cutA,cut);
    dp=d;
    const fC=f*fK*SM(dC,1.4,2.7),fG=f*SM(dC,1.9,3.8), /* (2026-10-16, TRAÎNÉES) le fondu près de l'objectif RESSERRÉ (cœur 2,4-4,2 → 1,4-2,7 m, halo 3-6,5 → 1,9-3,8 m) : la poursuite est à 2,5-4,5 m des feux, donc TOUT ce qu'on voyait de la traînée en course était dans le fondu — deux fils pâles. Les plafonds de largeur (capC/capG) gardent l'écran sans voile. */wk=1+(wv-1)*Math.exp(-arc*.3); // l'élargissement de l'allumage ne gonfle que la TÊTE ; près de l'objectif tout s'efface (jamais de voile)
    const wc=Math.min(SIL.wC*wa*(1+.25*al)*wk,dC*SIL.capC*wa),wg=Math.min((SIL.wG+SIL.wGa*al)*wa*wk,dC*SIL.capG*wa); // le cœur garde sa largeur, le halo s'élargit au loin (v5 : plafonds près de l'objectif réglables)
    const pu=1+SIL.pouls*(SIL_STY&&SIL_STY.p?SIL_STY.p:1)*tr.hk*Math.pow(Math.max(0,Math.sin(arc*.5-tr.clk*SIL.poulsV)),4); // (v6) les POULS : des perles d'énergie filent de la tuyère vers la queue
    const hot=SIL.chaud*(.12+.88*tr.hk)*fC*Math.exp(-arc*.4)*pu; // (traînées de lumière) un feu arrière ne blanchit presque pas ; le nitro, si // la tête BLANCHIT
    /* LE FEU REFROIDIT : blanc à la tuyère, la couleur franche sur le corps, puis elle tire vers le ROUGE-MAGENTA vers le bout */
    /* (2026-10-15) …comme les CUBES du feu de pixels : la teinte GARDE sa famille et s'assombrit en se serrant un peu sur sa couleur dominante —
       l'orange tombe à la braise (pas au rouge : « trop rouge par rapport à la barre », Sacha), le bleu de réserve au bleu nuit, le rouge des feux
       au rouge sang. Plus de virage magenta. */
    const c0=Q[o+4],c1=Q[o+5],c2=Q[o+6],m9=Math.max(c0,c1,c2,1e-4),fr=(SIL_STY&&SIL_STY.f!=null?SIL_STY.f:SIL.froid)*SM(al,.08,.85),
      qr=c0+(c0*.5*Math.pow(c0/m9,.4)-c0)*fr,qg=c1+(c1*.5*Math.pow(c1/m9,.4)-c1)*fr,qb=c2+(c2*.5*Math.pow(c2/m9,.4)-c2)*fr;
    const hk=SIL.halo*(SIL_STY?SIL_STY.h:1)*(1+(pu-1)*.4),ck=SIL.coeur*(SIL_STY?SIL_STY.c:1)*pu,v=r*12;let gr=qr*fG*hk,gg=qg*fG*hk,gb=qb*fG*hk,kr=qr*fC*ck+hot,kg=qg*fC*ck+hot,kb=qb*fC*ck+hot;
    if(SIL_ENCRE){const mq=Math.max(qr,qg,qb,1e-4),hr=1-qr/mq,hg=1-qg/mq,hb=1-qb/mq,sg=Math.min(1,fG*hk*1.15),sc=Math.min(1,fC*ck*1.1); // l'ENCRE : la teinte pure, posée à l'intensité de la lumière (le cœur « blanc » se lit en couleur dense)
      gr=hr*sg;gg=hg*sg;gb=hb*sg;kr=Math.min(1,(hr+.18)*sc);kg=Math.min(1,(hg+.18)*sc);kb=Math.min(1,(hb+.18)*sc);}
    P[v]=x+SS.x*wg;P[v+1]=y+SS.y*wg;P[v+2]=z+SS.z*wg;P[v+3]=x-SS.x*wg;P[v+4]=y-SS.y*wg;P[v+5]=z-SS.z*wg;
    P[v+6]=x+SS.x*wc;P[v+7]=y+SS.y*wc;P[v+8]=z+SS.z*wc;P[v+9]=x-SS.x*wc;P[v+10]=y-SS.y*wc;P[v+11]=z-SS.z*wc;
    C[v]=C[v+3]=gr;C[v+1]=C[v+4]=gg;C[v+2]=C[v+5]=gb;C[v+6]=C[v+9]=kr;C[v+7]=C[v+10]=kg;C[v+8]=C[v+11]=kb;
    if(dk>0){const mq=Math.max(qr,qg,qb,1e-4),s9=Math.min(TRJ.max,fG*hk*dk*(.3+.7*tr.hk)); // le voile sous le HALO — surtout au nitro : le simple trait des feux arrière reste discret de jour : le fond perd ce qui n'est pas la couleur de la traînée (le cœur n'en a pas : il brille par-dessus)
      CI[v]=CI[v+3]=(1-qr/mq)*s9;CI[v+1]=CI[v+4]=(1-qg/mq)*s9;CI[v+2]=CI[v+5]=(1-qb/mq)*s9;CI[v+6]=CI[v+7]=CI[v+8]=CI[v+9]=CI[v+10]=CI[v+11]=0;}
    if(fin){Rf=r+1;break;}
  }
  tr.m.geometry.setDrawRange(0,Math.max(0,Rf-1)*12);tr.m.visible=Rf>1;
  {const a9=tr.m.geometry.attributes,c9=Math.max(1,Rf)*12;a9.position.updateRange.offset=0;a9.position.updateRange.count=c9;a9.color.updateRange.offset=0;a9.color.updateRange.count=c9; // (revue GAMEPLAY) on n'envoie que les rangées dessinées — sans updateRange, three renvoyait les 2 × 19 Ko du tampon à chaque image, par pot
   a9.position.needsUpdate=true;a9.color.needsUpdate=true;}
  tr.mi.visible=dk>0&&Rf>1;if(tr.mi.visible){const gi=tr.mi.geometry,ci=gi.attributes.color;gi.setDrawRange(0,Math.max(0,Rf-1)*12);ci.updateRange.offset=0;ci.updateRange.count=Math.max(1,Rf)*12;ci.needsUpdate=true;}
}
/* <<<VOITURES>>> ---------------------------------------------------------------------------
   LA CARROSSERIE — tout ce qui fabrique une caisse, des matériaux jusqu'aux flaques au sol.
   Ces balises servent à `voitures.html` (L'ÉTAL DES VOITURES), qui LIT ce fichier au chargement
   et exécute le bloc tel quel : la planche contact et les silhouettes montrent donc les VRAIES
   caisses du jeu, pas une copie qui aurait dérivé à la première retouche.
   ⚠ Le bloc ne doit dépendre QUE de : THREE · envTex · CARS · carGroup. Tout le reste (RIM_U,
   rimify, wheels, les textures de halo, la plume de réacteur, JETS/CARPOOL) est déclaré DEDANS.
   Ajouter ici une référence à un global du jeu (scene, level, SND…) casserait l'étal en silence.
   -------------------------------------------------------------------------------------------- */
// ---- RIM GOLDEN HOUR : liseré doré sur les arêtes exposées au soleil (fresnel masqué côté lumière).
// Uniforms PARTAGÉS entre toutes les caisses — une seule source de vérité, teinte pilotée par l'état dans loop().
const RIM_U={uRimC:{value:new THREE.Color(0xffd9a0)},uRimStr:{value:.40},uRimPow:{value:3.0},uSunV:{value:new THREE.Vector3()}};
/* LES FEUX ÉCLAIRENT LA CAISSE (2026-10-17, « les lumières de la caisse v2 » — Sacha : « comment la lumière des feux arrière se reflète dans le pare-brise
   arrière ») : les deux feux arrière (repère VUE : uFvA/uFvB = position + rayon², uFvC = rouge × intensité, posés par lumVue) allument la tôle qui les
   entoure — le pare-chocs, la malle, la jupe — en diffus vrai (cosinus, inverse du carré), et le VERRE (la lunette arrière, juste au-dessus) en prend le
   REFLET : un voile rouge qui monte du bas de la vitre, plus fort en rasant (Fresnel) — la lunette, sombre et lisse, renvoie la lueur des feux. `uFvK` =
   la part de ce reflet par matière (verre 1, chrome .6, laque .2, mat .05). Une branche UNIFORME (feux éteints de jour : rien n'est calculé), quelques
   opérations par pixel de caisse, zéro lumière three de plus. Hors course (garage, boutique, étal), uFvC vaut 0. */
const FEU_U={uFvA:{value:new THREE.Vector4(0,0,0,1)},uFvB:{value:new THREE.Vector4(0,0,0,1)},uFvC:{value:new THREE.Color(0,0,0)}};
const FEU_GLSL='uniform vec4 uFvA,uFvB;uniform vec3 uFvC;uniform float uFvK;\n'+
  'vec3 fvFeu(vec4 a,vec3 P,vec3 N,vec3 V,vec3 al){vec3 L=a.xyz-P;float d2=dot(L,L);'+
  'return (max(dot(N,L),0.)*inversesqrt(d2)*al*exp(-d2*1.6)+uFvK*(.3+.7*pow(1.-abs(dot(N,V)),2.))*exp(-d2*.9))/(d2+a.w);}\n'; // exp(-d²·1,6) : la lueur reste AUTOUR du feu (à 1/d² seul, toute la poupe virait au rouge uni) ; le reflet du verre porte un peu plus haut
const FEU_APPEL='if(uFvC.r+uFvC.g+uFvC.b>0.){vec3 P9=-vViewPosition,N9=normalize(normal),V9=normalize(vViewPosition);gl_FragColor.rgb+=uFvC*(fvFeu(uFvA,P9,N9,V9,diffuseColor.rgb)+fvFeu(uFvB,P9,N9,V9,diffuseColor.rgb));}\n';
/* ---- LE VERNIS (2026-09-26) — la laque garde sa COULEUR, le ciel se pose PAR-DESSUS selon l'angle -------------------------
   ⚠ POURQUOI. En `MixOperation`, three MÉLANGE peinture et reflet dans une proportion FIXE (`reflectivity`) : à .45 (le plafond
   de la passe de finition), une caisse jaune vue de face était à 45 % le ciel violet — une peinture délavée sous TOUS les angles,
   et des vitres couleur de ciel qu'on lisait comme de la tôle claire. Une vraie laque est un VERNIS : de face on voit la couleur
   (quelques % de reflet), en RASANT le vernis devient miroir (Fresnel). Les flancs vus de la poursuite, le toit, les vitres
   couchées attrapent le ciel ; ce qu'on regarde en face reste franc et saturé.
   `uVern` = (part du reflet DE FACE, part EN RASANT — en multiples de `reflectivity` —, dureté de la courbe, teinte MÉTAL 0-1 :
   le chrome et l'or teintent leur reflet de leur propre couleur, une laque non). (1,1,1,0) = l'ancien mélange au bit près :
   l'épave (« ne rien changer ») et les fruits le gardent. Zéro programme de plus : tout vit dans un uniform, le code est le même
   pour toutes les matières (three r128 réutilise le programme d'une matière à l'autre — un `if` par matière y casserait tout). */
const ENV_VERNIS=THREE.ShaderChunk.envmap_fragment.replace(
  'outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );',
  'float vnF=pow(1.-saturate(dot(normal,normalize(vViewPosition))),uVern.z);\n'+
  '\t\toutgoingLight=mix(outgoingLight,envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w),saturate(specularStrength*reflectivity*mix(uVern.x,uVern.y,vnF)));');
if(ENV_VERNIS===THREE.ShaderChunk.envmap_fragment)console.warn('CASH CAR : vernis non greffé (chunk envmap inattendu) — reflets à l\'ancienne');
/* LE LISERÉ CÔTÉ SOURCE (2026-09-26, vague 2 — la bible : « toute caisse a un liseré du côté de la source »). Le liseré d'origine
   (Fresnel ^uRimPow, gardé sur le flanc qui fait face au soleil) disparaissait dans le cas qui compte le plus : le CONTRE-JOUR — soleil
   bas devant, caméra de poursuite derrière (golden, couchant). La caisse n'y était plus qu'une masse sombre découpée sur un ciel en feu.
   Le 2e terme ajoute ce que fait un vrai contre-jour : les ARÊTES de la silhouette (Fresnel ^5 — un trait, pas un halo) s'allument du
   côté du soleil À L'ÉCRAN, d'autant plus que le soleil est face à la caméra (`-uSunV.z`). Mêmes uniformes (couleur et force pilotées
   ailleurs, par état et par niveau), quelques opérations par pixel de caisse, zéro programme de plus. Partagé par rimify et lpMat. */
const RIM_GLSL=cj=>'vec3 nR9=normalize(normal);float nv9=1.-saturate(dot(nR9,normalize(vViewPosition)));\n'+ // `cj` : le poids du contre-jour (les fruits de lpMat n'en veulent pas)
  'float rimF=pow(nv9,uRimPow)*smoothstep(-.25,.55,dot(nR9,uSunV));\n'+
  'rimF+='+cj+'*pow(nv9,5.)*1.6*smoothstep(.1,.8,-uSunV.z)*smoothstep(-.2,.6,dot(nR9.xy,uSunV.xy));\n';
/* LA CAISSE NE CALCULE PLUS LES LAMPES ÉTEINTES (2026-09-27, passe perf iPhone, tour 2). En course, le programme de la tôle compte DIX
   lumières ponctuelles (lampe de carrosserie, reflets nitro/traînée, flash de pose, gyrophares, nitro du bot, lampes de l'étal…) et r128
   les évalue TOUTES, dans chaque pixel de la caisse — atténuation, puissance, Blinn-Phong — même éteintes : presque toujours neuf sur dix.
   MESURÉ (caisse seule, image figée, GPU 1170×2532) : 0,95 → 0,64 ms. Chaque lampe est désormais sautée quand sa couleur vaut zéro (un test
   UNIFORME : toute la caisse prend la même branche) ou quand elle n'atteint pas ce pixel (portée) ; le phare hors de son cône et les
   directionnelles dos à la face aussi. Exact : l'apport sauté valait 0. Dépend de THREE seul (le bloc VOITURES est relu par l'étal). */
const LFB_CAISSE=(function(){
  const L0=THREE.ShaderChunk.lights_fragment_begin,
        po=/(pointLight = pointLights\[ i \];)(\s*getPointDirectLightIrradiance\( pointLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/,
        sp=/(getSpotDirectLightIrradiance\( spotLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/,
        di=/(getDirectionalDirectLightIrradiance\( directionalLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/;
  if(!po.test(L0)||!sp.test(L0)||!di.test(L0)){console.warn('CASH CAR : lumières de la caisse non greffées (chunk inattendu)');return L0;}
  return L0.replace(po,'$1\n\t\tif ( any( notEqual( pointLight.color, vec3( 0.0 ) ) ) ) {$2\n\t\tif ( directLight.visible ) {$3\n\t\t}\n\t\t}')
    .replace(sp,'$1\n\t\tif ( directLight.visible && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}')
    .replace(di,'$1\n\t\tif ( dot( geometry.normal, directLight.direction ) > 0.0 && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}');})();
/* ⚠ Greffé SEULEMENT là où la matière avait déjà son programme à elle (rimify, lpMat). Les Phong « nues » de la caisse (sombre, rouille,
   matières des gabarits) partagent le programme Phong générique de la scène : leur donner le leur ajoutait 1 à 7 programmes à relier AU
   DÉPART de la course (mesuré — le nombre de lumières ponctuelles change entre le garage et la course, tout se relie à ce moment-là). */
// `v` : le vernis (voir ENV_VERNIS) · `rimK` : part du liseré doré (0 = aucun — le verre et le chrome n'en veulent pas)
function rimify(m,v,rimK,fvK){ // fvK : la part du REFLET DES FEUX (voir FEU_U) — la tôle .2, le verre 1
  const uV={value:new THREE.Vector4().fromArray(v||[1,1,1,0])},uK={value:rimK==null?1:rimK},uF={value:fvK==null?.2:fvK};
  m.userData.uVr=uV;m.userData.rimK=uK.value; // (2026-10-20) LA FINITION STUDIO (finition.js) règle ce vernis au garage : rimify ne sert qu'aux caisses (LA HONTE, REQUIN, ACIDE, la tôle des gabarits hors kit)
  m.onBeforeCompile=function(sh){
    sh.uniforms.uStuHdr=FSTU.uHdr; // (2026-10-20) les reflets qui éclatent au garage, comme la tôle du kit (voir finition.js) — 0 en course : rien ne change
    sh.uniforms.uRimC=RIM_U.uRimC;sh.uniforms.uRimStr=RIM_U.uRimStr;sh.uniforms.uRimPow=RIM_U.uRimPow;sh.uniforms.uSunV=RIM_U.uSunV;
    sh.uniforms.uVern=uV;sh.uniforms.uRimK=uK;sh.uniforms.uFvA=FEU_U.uFvA;sh.uniforms.uFvB=FEU_U.uFvB;sh.uniforms.uFvC=FEU_U.uFvC;sh.uniforms.uFvK=uF;
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\nuniform vec3 uRimC;uniform vec3 uSunV;uniform float uRimStr;uniform float uRimPow;uniform vec4 uVern;uniform float uRimK;\n'+FEU_GLSL+FSTU_HDR)
      .replace('#include <envmap_fragment>',ENV_VERNIS.replace('envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w)','fstuHdr(envColor.xyz)*mix(vec3(1.),diffuseColor.rgb,uVern.w)')).replace('#include <lights_fragment_begin>',LFB_CAISSE) // (tour 2) les lampes éteintes sautent (voir LFB_CAISSE)
      .replace('#include <dithering_fragment>',RIM_GLSL('1.')+ // seulement le flanc au soleil : un liseré, pas un halo cartoon (+ le contre-jour : voir RIM_GLSL)
        'gl_FragColor.rgb+=uRimC*rimF*uRimStr*uRimK;\n'+FEU_APPEL+'#include <dithering_fragment>'); // (2026-10-17) + la lueur des feux arrière (voir FEU_U)
  };
}
const wheels=[];
/* (2026-09-25, user : « la voiture doit vraiment pencher sur le côté lors des virages ») LA CARROSSERIE : tout ce qui n'est ni roue ni
   flaque au sol vit dans `carBody`, qui ROULE autour de l'axe des roues (buildCar l'y range). Les roues restent au sol, la caisse
   s'écrase dans le virage. Avant, le roulis faisait pencher tout le groupe, roues comprises, de 7° au plus. */
const carBody=new THREE.Group();carBody.name='carrosserie';
// halo doux pour phares/feux (défini AVANT buildCar)
// ⚠ était en 32×32 avec une chute LINÉAIRE : de près, un phare n'était qu'une bouillie pixelisée et
// fade. En 128 px avec un CŒUR BLANC net qui s'éteint vite, l'ampoule a enfin un point chaud —
// c'est ce contraste (foyer dur / halo doux) qui fait lire une source de lumière plutôt qu'une tache.
const lampTex=(function(){
  const s=128,cv=document.createElement('canvas');cv.width=cv.height=s;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(.14,'rgba(255,255,255,1)');    // le FOYER : franc, saturé
  g.addColorStop(.26,'rgba(255,255,255,.72)');
  g.addColorStop(.48,'rgba(255,255,255,.30)');  // la chute rapide = le contraste
  g.addColorStop(.74,'rgba(255,255,255,.08)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,s,s);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t;
})();
/* LES FEUX QUI VIVENT (2026-09-26) — les halos des phares et des feux partagent UNE matière par famille (au lieu d'une par
   sprite, jamais libérée) : la boucle (`carVit`) les fait répondre à l'ANGLE — un phare n'éblouit que celui qui le regarde en
   face, vu de profil il n'est plus qu'un point — et au FREIN : pouce tiré vers le bas (drift) ou ↓, les feux s'embrasent.
   `userData.k` = la taille d'origine du sprite, que la boucle module sans jamais la perdre. */
const HALO={hM:new THREE.SpriteMaterial({map:lampTex,color:0xffe2a8,transparent:true,opacity:.95,depthWrite:false}),
            tM:new THREE.SpriteMaterial({map:lampTex,color:0xff2818,transparent:true,opacity:.85,depthWrite:false}),h:[],t:[]};
/* LES PHARES ESCAMOTABLES ALLUMÉS SEULEMENT LEVÉS (2026-10-18, LA VETTE) : `CAR_PHK` = combien les phares de la caisse sont levés, de 0 (rangés)
   à 1 ; null = une caisse aux phares fixes (toutes les autres). La caisse qui a des escamotables le pose chaque image (son `BLING.anim`) ; il
   multiplie le halo des phares, leur nappe au sol (carVit) et leur lumière sur la route (lumTick). buildCar le remet à null. */
var CAR_PHK=null;
/* L'ACTION SPÉCIALE DE LA CAISSE (2026-10-20, Léo : « la Cerise, quand elle fait le clin d'œil, c'est une action spéciale ; ce genre d'action
   sera attribué à quelques voitures, et ça s'activera en cliquant sur la voiture — toutes les caisses, quand tu tapes, ça fait taper ; la
   Cerise, en plus, ses deux phares se lèvent et se baissent ») : `CAR_ACTION` = la fonction que le gabarit de la caisse équipée a posée
   (null = une caisse sans action : le tap ne fait que taper). `caisseAction()` la joue — appelée par le TAP du garage (garageImpact) et
   par le COUP du menu ciel (chuteTape), APRÈS l'effet commun à toutes. buildCar la remet à null. Console : dbgAction(). */
var CAR_ACTION=null;
function caisseAction(){if(typeof CAR_ACTION!=='function')return false;try{return CAR_ACTION()!==false;}catch(e){console.warn('caisseAction',e);return false;}}
window.dbgAction=function(){return caisseAction();};
/* LE FLOU DE JANTE (2026-09-26) — au-delà de ~20 km/h, cinq rayons tournent plus vite que l'image : l'œil voit la roue
   BÉGAYER, repartir en arrière (effet stroboscopique). Un disque peint par-dessus la jante — ce qu'une photo voit d'une roue
   lancée : moyeu clair, voile gris des rayons moyennés, lèvre brillante, stries concentriques — monte en opacité avec la
   vitesse. Symétrique de révolution : il ne tourne pas, les QUATRE vivent dans UN seul maillage (un appel de dessin, éteint
   à l'arrêt). Motif DÉTERMINISTE (pas de Math.random : les photos avant/après restent comparables). */
const flouRoueTex=(function(){
  const s=128,h=s/2,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d');
  const g=c.createRadialGradient(h,h,0,h,h,h);
  g.addColorStop(0,'rgba(240,242,246,1)');g.addColorStop(.2,'rgba(205,210,218,.95)');          // le moyeu
  g.addColorStop(.28,'rgba(92,96,104,.88)');g.addColorStop(.62,'rgba(128,132,140,.84)');        // le voile des rayons (clair + fond sombre, moyennés)
  g.addColorStop(.8,'rgba(96,100,108,.9)');g.addColorStop(.87,'rgba(250,251,253,1)');           // la lèvre qui accroche la lumière
  g.addColorStop(.95,'rgba(170,175,184,.9)');g.addColorStop(1,'rgba(60,62,70,0)');
  c.fillStyle=g;c.beginPath();c.arc(h,h,h,0,7);c.fill();
  c.globalCompositeOperation='source-atop';                                                     // le FILÉ : stries concentriques
  for(let i=0;i<14;i++){const r=h*(.3+.5*i/13)+Math.sin(i*7.3)*1.5;
    c.strokeStyle=(i&1)?'rgba(255,255,255,.14)':'rgba(0,0,0,.16)';c.lineWidth=1+(i%3)*.5;c.beginPath();c.arc(h,h,r,0,7);c.stroke();}
  return new THREE.CanvasTexture(cv);
})();
const ROUES={v:0,flou:null}; // `v` : vitesse du sol sous les pneus (m/s, posée par la boucle) · `flou` : le maillage des 4 disques de la caisse
// FLAQUE AU SOL : dégradé radial à EXTINCTION FRANCHE, éteint bien avant le bord du canvas —
// avec lampTex (chute molle) les nappes additives saturaient en PAVÉ de couleur visible.
const poolTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(64,64,2,64,64,56);
  g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.35,'rgba(255,255,255,.38)');
  g.addColorStop(.7,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(64,64,56,0,7);c.fill();
  return new THREE.CanvasTexture(cv);
})();
// FAISCEAUX DE PHARES : DEUX cônes peints qui partent du pare-chocs (haut du canvas) et
// s'évasent en fondant vers l'avant — posés à plat sur la route, ILS SONT la lumière des phares.
// Blanc neutre : la teinte vient du matériau (chaud joueur / blanc-bleu police).
const beamTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=256;
  const c=cv.getContext('2d');
  try{c.filter='blur(7px)';}catch(e){}
  for(const sd of [-1,1]){
    const x0=128+sd*30;
    const g=c.createLinearGradient(0,8,0,236);
    g.addColorStop(0,'rgba(255,248,238,.95)');g.addColorStop(.38,'rgba(255,244,228,.42)');
    g.addColorStop(.8,'rgba(255,240,220,.07)');g.addColorStop(1,'rgba(255,240,220,0)');
    c.fillStyle=g;
    c.beginPath();c.moveTo(x0-12,10);c.lineTo(x0+12,10);c.lineTo(x0+sd*14+46*sd+14,238);c.lineTo(x0+sd*14-46*sd-14,238);c.closePath();c.fill();
  }
  flou2dRepli(c,256,256,7); /* (24/10) Safari n'a pas `ctx.filter` : le même flou, après coup (voir LE FLOU DES TOILES SANS ctx.filter, rendu/soleil-planete.js) */
  return new THREE.CanvasTexture(cv);
})();
// ---- PLUME DE RÉACTEUR (façon fusée) : cône incandescent à la tuyère — dégradé + ANNEAUX DE CHOC bakés.
// Blanc pur dans la texture, la teinte vient du matériau (orange nitro / bleu réserve). Partagé par toutes les caisses.
/* (2026-09-26, passe graphique) PLUME v2 — deux textures au lieu d'une :
   · l'ENVELOPPE (jetTex) : chute exponentielle de la tuyère vers la pointe + LANGUES DE FLAMME (bandes le long du cône, qui s'élargissent
     vers la pointe) — la boucle fait TOURNER le cône sur son axe, les langues ondulent ; plus de cornet orange uniforme ;
   · le CŒUR (jetCoreTex) : blanc brûlant, court, rythmé de DIAMANTS DE CHOC nets (les disques de Mach des réacteurs) séparés par des
     creux sombres — en additif double face, chaque anneau se lit comme une barre lumineuse en travers du jet.
   Toujours du blanc : la teinte vient des matériaux (orange nitro / bleu réserve / signature). Cuites une fois, partagées.
   ⚠ (2026-09-28) la plume est désormais CALCULÉE (voir « LA FLAMME VIVANTE » plus bas), pour la caisse comme pour la meute : les deux
   textures cuites (`jetTex`, `jetCoreTex`) ont disparu — ce paragraphe ne reste que pour l'histoire. */
const jetGeo=(function(){ // (2026-09-28) un PROFIL de flamme tourné (étroit à la tuyère, ventre, pointe effilée) au lieu d'un cône : un cône se lit comme une pointe de crayon
  const P=[[.5,0],[.8,.07],[.98,.2],[1,.32],[.86,.5],[.62,.68],[.36,.84],[.13,.95],[0,1]].map(function(q){return new THREE.Vector2(q[0],q[1]);});
  const g=new THREE.LatheGeometry(P,12);
  g.rotateX(-Math.PI/2); // base à la tuyère (z 0), pointe vers l'ARRIÈRE (-Z caisse) — uv.y : 0 à la tuyère, 1 à la pointe
  return g;
})();
/* LA FLAMME VIVANTE (2026-09-28, Sacha : « les animations du nitro pourraient faire beaucoup plus FLAMME, façon Asphalt 9 ») — MESURÉ
   en capture avant : vue de la poursuite, la plume était deux BOUDINS orange lisses (une texture fixe qui tournait sur un cône : aucune
   langue ne naissait ni ne mourait). Désormais la flamme est CALCULÉE à chaque image : un bruit qui COULE de la tuyère vers la pointe
   ronge la matière (les langues se détachent et s'éteignent en route), une racine BLEUE de brûleur à gaz sous le cœur blanc — la
   signature des flammes de nitro —, un corps à la couleur de la poussée qui rougit vers la pointe, et un bord qui s'efface avec
   l'angle (plus de cornet à arête dure). UN seul programme pour l'enveloppe et le cœur (mêmes sources, uniforms à part), sans
   brouillard ni lumières : il est compilé au chargement avec le reste (`renderer.compile` parcourt aussi le caché) et ne dépend
   d'aucun nombre de lumières. `color` reste une vraie THREE.Color (la boucle, l'arc-en-ciel et dbgNitro la lisent/écrivent). */
const JET_VS='uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;'
  +'p.x+=sin(uT*23.+uv.y*9.)*.2*w;p.y+=cos(uT*19.+uv.y*7.)*.2*w;'                // la pointe LÈCHE l'air : elle erre, la racine reste dans le pot
  +'vec4 mv=modelViewMatrix*vec4(p,1.);vE=abs(dot(normalize(normalMatrix*normal),normalize(-mv.xyz)));vZ=-mv.z;gl_Position=projectionMatrix*mv;}';
const JET_FS='uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec3 uPres;'
  +'varying vec2 vUv;varying float vE;varying float vZ;'
  +'float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'
  +'float nn(vec2 p,float P){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);'           // bruit de valeur PÉRIODIQUE autour du cône (pas de couture)
  +'return mix(mix(hh(vec2(mod(i.x,P),i.y)),hh(vec2(mod(i.x+1.,P),i.y)),f.x),mix(hh(vec2(mod(i.x,P),i.y+1.)),hh(vec2(mod(i.x+1.,P),i.y+1.)),f.x),f.y);}'
  +'void main(){float v=vUv.y,a=vUv.x;'
  +'float n=nn(vec2(a*6.,v*3.2*uLong-uT*11.),6.)*.62+nn(vec2(a*12.,v*7.*uLong-uT*17.+3.1),12.)*.38;' // le bruit COULE vers la pointe
  +'float d=smoothstep(0.,.42,(1.-v)*1.3-n*(.18+.9*v)*uRonge);'                   // les langues : la pointe est rongée, la racine tient
  +'d*=smoothstep(0.,.05,v);'                                                     // la flamme naît DANS la bouche du pot
  +'vec3 c=mix(uRac,uHot,smoothstep(.05,.26,v));'                                 // racine bleue → cœur blanc
  +'c=mix(c,uCol,smoothstep(.12,.5,v));'                                          // → la couleur de la poussée
  +'c=mix(c,uCol*vec3(.95,.42,.3),smoothstep(.55,1.,v));'                         // → qui rougit vers la pointe
  +'c+=uHot*.35*smoothstep(.55,.95,n)*(1.-v);'                                    // les crêtes du bruit s'embrasent
  +'gl_FragColor=vec4(c,d*smoothstep(.02,.5,vE)*uA*mix(1.,smoothstep(uPres.x,uPres.y,vZ),uPres.z));}'; // uPres : près de l'objectif la flamme s'efface (x → y m de profondeur, part z) — 0 pour les pots, la comète de NITROOO s'en sert debout
function jetMat(col,hot,rac,a,ronge,lng){
  const u={uCol:{value:new THREE.Color(col)},uHot:{value:new THREE.Color(hot)},uRac:{value:new THREE.Color(rac)},uT:JET_T,uA:{value:a},uRonge:{value:ronge},uLong:{value:lng},uPres:{value:new THREE.Vector3(0,1,0)}};
  const m=new THREE.ShaderMaterial({uniforms:u,vertexShader:JET_VS,fragmentShader:JET_FS,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  m.color=u.uCol.value;return m;}
const JET_T={value:0}; // l'horloge des flammes (partagée par l'enveloppe et le cœur), avancée par la boucle
const jetShellM=jetMat(0xff8c30,0xfff4dc,0x6f8cff,.95,1,1);
const jetCoreM=jetMat(0xffe6b0,0xffffff,0xa9c0ff,1,.7,1.35);
const jetGlowM=new THREE.SpriteMaterial({map:lampTex,color:0xff9040,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const JETS={shells:[],cores:[],glows:[],k:0}; // rempli par buildCar, animé chaque frame
const JET_DIR=[0,1,2,3].map(function(){return new THREE.Vector3(0,0,-1);}),JET_NZ=new THREE.Vector3(0,0,-1),JET_Z=new THREE.Vector3(0,0,1),JET_V=new THREE.Vector3(),JET_QI=new THREE.Quaternion(),JET_QS=new THREE.Quaternion(); // (sillage v5) l'axe de chaque plume, dans le repère caisse
