/* ===== L'ORBITE DES VOYAGES : LE DÉCOR (2026-11-16) — voir orbite-voyages.js (la logique, chargée aussi par le banc Node des routes) ===== */
/* ===== LE DÉCOR DES GÉANTS, AJUSTÉ À LA ROUTE BÂTIE (geantsPose, avant les autres géants : la lune glacée et le gaz sont réservés d'abord) ===== */
const VOY_D={jante:null,roc:null,neb:null,zonesSaut:[],zonesPente:[],ms:0,err:null,info:[],vues:[]};
const VOY_F=[0,1,2,3].map(function(){return {p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};});
function voyMaille(){return {P:[],N:[],C:[],K:[],a:new THREE.Vector3(),b:new THREE.Vector3(),n:new THREE.Vector3()};}
function voyTri(M,a,b,c,col,k){M.a.subVectors(b,a);M.b.subVectors(c,a);M.n.crossVectors(M.a,M.b);const l=M.n.length()||1;M.n.multiplyScalar(1/l);
  for(const v of [a,b,c]){M.P.push(v.x,v.y,v.z);M.N.push(M.n.x,M.n.y,M.n.z);M.C.push(col[0],col[1],col[2]);M.K.push(k[0],k[1],k[2]);}}
function voyQuad(M,a,b,c,d,col,k){voyTri(M,a,b,c,col,k);voyTri(M,a,c,d,col,k);}
function voyGeo(M){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(M.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(M.N,3));
  g.setAttribute('aCol',new THREE.Float32BufferAttribute(M.C,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(M.K,3));g.computeBoundingSphere();return g;}
const VOY_MESH=[0,1].map(function(i){ /* [0] la jante de la roue · [1] la roche et le tunnel de l'astéroïde — la matière de l'épave (le même programme : rien à compiler) */
  const g=new THREE.BufferGeometry();for(const k of ['position','normal','aCol','aK'])g.setAttribute(k,new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));
  const m=new THREE.Mesh(g,GT_EPAVE.material);m.visible=false;m.name=i?'orbite voyage : astéroïde percé':'orbite voyage : roue';scene.add(m);return m;});
function voyDecorVide(){VOY_D.jante=null;VOY_D.roc=null;VOY_D.neb=null;VOY_D.zonesSaut=[];VOY_D.zonesPente=[];VOY_D.info=[];VOY_D.vues=[];for(const m of VOY_MESH)m.visible=false;}
function voyPoseGeo(i,M){const m=VOY_MESH[i],old=m.geometry;m.geometry=voyGeo(M);if(old)old.dispose();}
const VOY_TON=[[.46,.42,.39],[.58,.34,.22],[.66,.60,.50]]; /* la roche : Terre, Mars, Saturne (MESURÉ en photo : plus clair, elle tournait au crème lisse) */
const voyBruit=function(x,y,z){return Math.sin(x*.021+Math.sin(z*.013)*2)*Math.sin(y*.017-x*.009)*.5+Math.sin(z*.031+y*.007)*.3+Math.sin(x*.057-z*.041)*.2;}; /* -1..1 : les taches de la roche */
function voyDecorPose(r){
  voyDecorVide();if(!ORB_VOY||!MODS||!MODS.length)return;const t0=performance.now();
  try{
    for(const m of MODS){
      if(m.fig==='bosses'||m.fig==='pique'||m.fig==='marches')VOY_D.zonesPente.push([m.s0+60,m.s1]); /* leurs crêtes : pas de saut (voir voySautRefuse) */
      if(!m.nu||!m.nu.length||m.nu[0].t!=='voy')continue;const k=m.nu[0].k,sa=m.nu[0].s,sm=m.nu[1].s,sb=m.nu[2].s;
      if(k==='roue'){voyRoue(sa,sm,sb,r);VOY_D.zonesSaut.push([sa-150,sb+60]);}
      else if(k==='lune')voyLune(sa,sm,sb,r);
      else if(k==='asteroide'){voyAsteroide(sa,sm,sb,r);VOY_D.zonesSaut.push([sa-200,sb+150]);}
      else if(k==='nebuleuse')voyNebuleuse(sa,sm,sb,r);}
  }catch(e){VOY_D.err=String(e&&e.stack||e).slice(0,400);console.warn('Voyages',e);}
  VOY_D.ms=Math.round(performance.now()-t0);}
/* le cercle par trois points : centre, rayon, normale de son plan */
function voyCercle(A,B,Cp){const a=new THREE.Vector3().subVectors(A,B),b=new THREE.Vector3().subVectors(Cp,B),axb=new THREE.Vector3().crossVectors(a,b),l2=axb.lengthSq();if(l2<1e-6)return null;
  const u=b.clone().multiplyScalar(a.lengthSq()).addScaledVector(a,-b.lengthSq()),C=new THREE.Vector3().crossVectors(u,axb).multiplyScalar(1/(2*l2)).add(B);return {C:C,R:C.distanceTo(B),ax:axb.normalize()};}
/* LA ROUE : la jante est un CHENAL le long de la route (le sol sous la dalle, deux lèvres, la coque), puis le reste de la roue suit le cercle de la route jusqu'à la brèche du haut ;
   le moyeu au centre, trois rayons (hors de l'arc de la route), deux moignons ; les morceaux qui passeraient à moins de ~70 m d'une autre portion de route ne sont pas posés */
function voyRoue(sa,sm,sb,r){
  const F=VOY_F[0],tel=GT_TEL,W2=78,H=30,E=22,OFF=THICK_ROUTE+1.2,st=tel?10:6,M=voyMaille();
  const blanc=[.74,.75,.74],gris=[.42,.43,.45],sol=[.30,.32,.36],orange=[1,.55,.15],fen=[1,.86,.55],neon=[.5,.9,1],kD=[1,0,.25],kI=[.85,0,.15],kL=[0,1,0];
  frameAt(sa,F);const A=F.p.clone();frameAt(sm,F);const B=F.p.clone(),nB=F.n.clone();frameAt(sb,F);const Cc=F.p.clone();const cer=voyCercle(A,B,Cc);
  const coupe=function(p,n,b,col,i){const pt=function(x,h){return p.clone().addScaledVector(b,x).addScaledVector(n,h);};
    return {fl:pt(-W2,-OFF),fr:pt(W2,-OFF),ll:pt(-W2,H),lr:pt(W2,H),hl:pt(-W2,-OFF-E),hr:pt(W2,-OFF-E),p:p,n:n,b:b,pt:pt,i:i};};
  const tranche=function(c0,c1,j){ /* entre deux coupes : le sol, les lèvres, la coque, les flancs, la bande orange, les hublots, les feux */
    voyQuad(M,c0.fl,c0.fr,c1.fr,c1.fl,sol,kI);voyQuad(M,c0.hl,c1.hl,c1.hr,c0.hr,j%3?blanc:gris,kD);
    voyQuad(M,c0.fl,c1.fl,c1.ll,c0.ll,blanc,kD);voyQuad(M,c0.fr,c0.lr,c1.lr,c1.fr,blanc,kD);
    voyQuad(M,c0.fl,c0.hl,c1.hl,c1.fl,gris,kD);voyQuad(M,c0.fr,c1.fr,c1.hr,c0.hr,gris,kD);
    for(const sg of [-1,1]){voyQuad(M,c0.pt(sg*(W2-14),-OFF+.4),c0.pt(sg*(W2-6),-OFF+.4),c1.pt(sg*(W2-6),-OFF+.4),c1.pt(sg*(W2-14),-OFF+.4),orange,kI);
      if(j%2===0){const a1=c0.pt(sg*(W2-.6),12),a2=c0.pt(sg*(W2-.6),20),b1=c1.pt(sg*(W2-.6),12),b2=c1.pt(sg*(W2-.6),20);voyQuad(M,a1,a2,a2.clone().lerp(b2,.6),a1.clone().lerp(b1,.6),fen,kL);} /* les hublots des lèvres */
      if(j%3===0){const a1=c0.pt(sg*(W2-24),-OFF+.5),a2=c0.pt(sg*(W2-20),-OFF+.5),b1=c1.pt(sg*(W2-24),-OFF+.5),b2=c1.pt(sg*(W2-20),-OFF+.5);voyQuad(M,a1,a2,a2.clone().lerp(b2,.5),a1.clone().lerp(b1,.5),neon,kL);}}}; /* les feux du sol */
  /* 1) le chenal le long de la route */
  let prev=null,j=0;for(let s9=sa-30;s9<=sb+30;s9+=st){frameAt(s9,F);const c=coupe(F.p.clone(),F.n.clone(),F.b.clone());if(prev)tranche(prev,c,j++);prev=c;}
  /* 2) le reste de la roue, sur le cercle de la route (si la dalle regarde bien vers son centre) */
  let ferme=0,moyeu=null;
  if(cer&&cer.R>150&&cer.R<1400&&nB.dot(new THREE.Vector3().subVectors(cer.C,B).normalize())>.45){
    const C=cer.C,ax=cer.ax,e1=new THREE.Vector3().subVectors(A,C).normalize(),e2=new THREE.Vector3().crossVectors(ax,e1);
    let tb=Math.atan2(new THREE.Vector3().subVectors(Cc,C).dot(e2),new THREE.Vector3().subVectors(Cc,C).dot(e1));if(tb<0){e2.negate();tb=-tb;}
    const R=cer.R,dth=st/R,gap=Math.max(.16,90/R),ok=function(P){return gtDistRoute(P,sa-120,sb+120)>ROAD_HALF+70;};prev=null;
    for(let th=tb+gap;th<=2*Math.PI-gap;th+=dth){const rd=e1.clone().multiplyScalar(Math.cos(th)).addScaledVector(e2,Math.sin(th)),P=C.clone().addScaledVector(rd,R),n=rd.clone().negate();
      if(!ok(P)||!ok(P.clone().addScaledVector(ax,W2))||!ok(P.clone().addScaledVector(ax,-W2))){prev=null;continue;}
      const c=coupe(P,n,ax.clone());if(prev){tranche(prev,c,j++);ferme++;}prev=c;}
    /* le moyeu, ses rayons hors de l'arc de la route, deux moignons dedans */
    const cyl=function(P0,dir,rr,len,nk,col){const u=dir.clone().normalize(),v1=new THREE.Vector3().crossVectors(u,Math.abs(u.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize(),v2=new THREE.Vector3().crossVectors(u,v1);
      const pt=function(a,z){return P0.clone().addScaledVector(u,z).addScaledVector(v1,Math.cos(a)*rr).addScaledVector(v2,Math.sin(a)*rr);};
      for(let q=0;q<nk;q++){const a0=q/nk*2*Math.PI,a1=(q+1)/nk*2*Math.PI;voyQuad(M,pt(a0,0),pt(a1,0),pt(a1,len),pt(a0,len),q%5===0?orange:col,kD);}};
    if(gtDistRoute(C,sa-60,sb+60)>ROAD_HALF+140){moyeu=C;cyl(C.clone().addScaledVector(ax,-85),ax,70,170,tel?14:22,blanc);cyl(C.clone().addScaledVector(ax,-14),ax,96,28,tel?14:22,gris);cyl(C.clone().addScaledVector(ax,85),ax,5,260,6,gris);
      for(const f of [.25,.5,.75]){const th=tb+gap+(2*Math.PI-2*gap-tb)*f,rd=e1.clone().multiplyScalar(Math.cos(th)).addScaledVector(e2,Math.sin(th)),P=C.clone().addScaledVector(rd,96);if(ok(C.clone().addScaledVector(rd,R*.6)))cyl(P,rd,11,R-OFF-96-E,6,gris);}
      for(const f of [.3,.7]){const th=tb*f,rd=e1.clone().multiplyScalar(Math.cos(th)).addScaledVector(e2,Math.sin(th));cyl(C.clone().addScaledVector(rd,96),rd,10,(R-96)*(.3+.2*r()),6,gris);}}
  }
  voyPoseGeo(0,M);VOY_D.jante={sa:sa,sb:sb,ferme:ferme,moyeu:!!moyeu,R:cer?Math.round(cer.R):0,tri:M.P.length/9};VOY_D.info.push('roue');
  if(cer){const Q9=cer.C.clone().addScaledVector(cer.ax,cer.R*1.5).addScaledVector(new THREE.Vector3().subVectors(cer.C,B).normalize(),cer.R*1.3);VOY_D.vues.push(['roue',Q9,cer.C.clone()]);}
}
/* LA PETITE LUNE : son centre, là où les normales de la dalle se croisent (sous les roues) ; son rayon, au ras de la dalle (12 m) et loin des autres portions de route */
function voyLune(sa,sm,sb,r){
  const F=VOY_F[0],m=GT_LUNES[0];if(m.userData.on)return;const S9=[];for(let s9=sa;s9<=sb;s9+=20){frameAt(s9,F);S9.push([F.p.clone(),F.n.clone()]);}if(S9.length<4)return;
  let best=null;for(let Rm=140;Rm<=720;Rm+=20){const C=new THREE.Vector3();for(const q of S9)C.add(q[0].clone().addScaledVector(q[1],-(Rm+12)));C.multiplyScalar(1/S9.length);
    let e=0;for(const q of S9)e+=Math.abs(q[0].distanceTo(C)-(Rm+12));e/=S9.length;if(!best||e<best.e)best={C:C,Rm:Rm,e:e};}
  const C=best.C;let R=1e9;for(const q of S9)R=Math.min(R,q[0].distanceTo(C)-14-THICK_ROUTE);R=Math.min(R,gtDistRoute(C,sa-150,sb+150)-ROAD_HALF-45,900);
  if(!(R>=110))return;
  m.position.copy(C);m.scale.setScalar(R);m.quaternion.setFromEuler(GT_E.set(r()*6.28,r()*6.28,r()*6.28));
  const u=m.material.uniforms,typ=GEANTS.typ|0;u.uGr.value=r()*50;u.uR.value=R;u.uRel.value=.05;u.uTeinte.value.setRGB(typ===1?1:1,typ===1?.66:typ===2?.95:1,typ===1?.48:typ===2?.84:1);
  m.userData.on=true;GEANTS.lunes.push({C:C,R:R});GEANTS.col=true;VOY_D.info.push('lune R'+Math.round(R)+' écart '+Math.round(best.e));
  {frameAt(sm,F);const dm=F.p.clone().sub(C).normalize(),q9=new THREE.Vector3().crossVectors(dm,F.t).normalize();VOY_D.vues.push(['lune',C.clone().addScaledVector(dm,R*2.2).addScaledVector(q9,R*1.6),C.clone()]);}
}
/* L'ASTÉROÏDE PERCÉ : le tunnel suit la route (un tube de 46 m de rayon, 20 m au-dessus de la dalle, des anneaux de lampes, des cristaux) ; la roche, centrée sur le tunnel, est
   percée là où il passe — sa taille bornée par les autres portions de route */
function voyAsteroide(sa,sm,sb,r){
  const F=VOY_F[0],tel=GT_TEL,M=voyMaille(),Rt9=46,Hc=20,ns=tel?12:18,st=tel?12:8,ton=VOY_TON[Math.max(0,Math.min(2,GEANTS.typ|0))];
  const roc=[ton[0]*.62,ton[1]*.62,ton[2]*.62],roc2=[ton[0]*.48,ton[1]*.48,ton[2]*.5],fen=[1,.82,.5],cri=[[.5,.95,1],[1,.45,.85],[.6,1,.55]],kI=[.5,0,.12],kL=[0,1,0];
  const CT=[];let prev=null,lastL=-1e9;
  for(let s9=sa-40;s9<=sb+40;s9+=st){frameAt(s9,F);const c=F.p.clone().addScaledVector(F.n,Hc);CT.push(c);const ring=[];
    for(let q=0;q<ns;q++){const a=q/ns*2*Math.PI;ring.push(c.clone().addScaledVector(F.b,Math.cos(a)*Rt9).addScaledVector(F.n,Math.sin(a)*Rt9));}
    if(prev){for(let q=0;q<ns;q++){const q2=(q+1)%ns,P9=ring[q],k9=.78+.22*voyBruit(P9.x,P9.y,P9.z)+(r()-.5)*.08;voyQuad(M,prev[q],prev[q2],ring[q2],ring[q],[roc[0]*k9,roc[1]*k9,roc[2]*k9],kI);} /* la paroi : des tons de roche irréguliers (un damier en photo) */
      if(s9-lastL>70){lastL=s9;for(let q=0;q<ns;q++){if(q>=Math.round(ns*.7)&&q<=Math.round(ns*.8))continue;const q2=(q+1)%ns;voyQuad(M,prev[q].clone().lerp(ring[q],.35),prev[q2].clone().lerp(ring[q2],.35),prev[q2].clone().lerp(ring[q2],.6),prev[q].clone().lerp(ring[q],.6),fen,kL);}}
      if(r()<.45){const q=(r()*ns)|0;if(q<Math.round(ns*.65)||q>Math.round(ns*.85)){const A9=prev[q].clone().lerp(ring[q],.5),inw=c.clone().sub(A9).normalize(),h=6+r()*10;voyTri(M,A9.clone().addScaledVector(F.t,-3),A9.clone().addScaledVector(F.t,3),A9.clone().addScaledVector(inw,h),cri[(r()*3)|0],kL);}}}
    prev=ring;}
  frameAt(sm,F);const C=F.p.clone().addScaledVector(F.n,Hc);let Ra=.5*CT[0].distanceTo(CT[CT.length-1])-30;Ra=Math.min(Ra,gtDistRoute(C,sa-260,sb+260)-ROAD_HALF-40);
  if(Ra>=110){
    const geo=new THREE.IcosahedronGeometry(1,tel?9:14),pa=geo.attributes.position,d=new THREE.Vector3(),B=[];for(let q=0;q<22;q++){const z=r()*2-1,a=r()*6.283,w=Math.sqrt(1-z*z);B.push([new THREE.Vector3(Math.cos(a)*w,z,Math.sin(a)*w),(r()-.45)*(q<8?.42:.18),q<8?.15+r()*.3:.02+r()*.06]);} /* de grandes bosses, puis des petites (le relief d'un astéroïde, pas une boule) */
    const rel=function(v){let f=1;for(const b of B)f+=b[1]*Math.exp(-(1-v.dot(b[0]))/b[2]*2);return f;};
    for(let q=0;q<pa.count;q++){d.fromBufferAttribute(pa,q).normalize();const f=rel(d)*Ra;pa.setXYZ(q,C.x+d.x*f,C.y+d.y*f,C.z+d.z*f);}
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c9=new THREE.Vector3(),g9=new THREE.Vector3(),R2=(Rt9+22)*(Rt9+22);
    for(let q=0;q<pa.count;q+=3){a.fromBufferAttribute(pa,q);b.fromBufferAttribute(pa,q+1);c9.fromBufferAttribute(pa,q+2);g9.copy(a).add(b).add(c9).multiplyScalar(1/3);
      let trou=false;for(const t of CT)if(t.distanceToSquared(g9)<R2){trou=true;break;}if(trou)continue;
      const dn=g9.clone().sub(C).normalize(),creux=Math.max(0,1-rel(dn)),k=(.74+.24*voyBruit(g9.x,g9.y,g9.z)-creux*1.4)*(1+(r()-.5)*.12);voyTri(M,a,b,c9,[ton[0]*k,ton[1]*k,ton[2]*k],[1,0,.12]);} /* les creux plus sombres, les taches */
    geo.dispose();}
  voyPoseGeo(1,M);VOY_D.roc={sa:sa,sb:sb,Ra:Math.round(Ra),tri:M.P.length/9};VOY_D.info.push('astéroïde Ra'+Math.round(Ra));
  {frameAt(sm,F);const Ra9=Math.max(150,Ra);VOY_D.vues.push(['asteroide',C.clone().addScaledVector(F.b,Ra9*2.6).addScaledVector(F.n,Ra9*.9).addScaledVector(F.t,Ra9*.8),C.clone()]);}
}
/* LA NÉBULEUSE : une boule de gaz (le gaz de la comète : sa 3e coque, celle de la poussière de Mars) centrée sur le demi-tonneau ; dedans, l'image prend sa couleur (le voile) */
const VOY_NEB=[[1,.42,.86],[1,.5,.42],[1,.62,.82]];
function voyNebuleuse(sa,sm,sb,r){
  const F=VOY_F[0];if(GT_VOLS[2].userData.on)return;frameAt(sa,F);const A=F.p.clone();frameAt(sb,F);const B=F.p.clone();frameAt(sm,F);const C=F.p.clone().addScaledVector(F.n,30);
  const sg=Math.max(240,Math.min(520,.36*A.distanceTo(B))),col=VOY_NEB[Math.max(0,Math.min(2,GEANTS.typ|0))];
  gtVol(2,C,F.t,[-3*sg,3*sg,3*sg,3*sg],[1,0,1,0],[sg,.72,2.1*sg,.24],[0,0,0],col);VOY_D.neb={C:C,sg:sg,col:col};VOY_D.info.push('nébuleuse σ'+Math.round(sg));
  VOY_D.vues.push(['nebuleuse',C.clone().addScaledVector(F.b,sg*3.2).addScaledVector(F.n,sg*.8).addScaledVector(F.t,-sg*1.2),C.clone()]);
}
/* CHAQUE IMAGE (geantsTick) : la visibilité ; le voile dans la nébuleuse (rend [r, g, b] à ajouter) */
function voyTick(on){
  VOY_MESH[0].visible=on&&!!VOY_D.jante;VOY_MESH[1].visible=on&&!!VOY_D.roc;
  const N9=VOY_D.neb;if(!on||!N9)return null;const d2=camera.position.distanceToSquared(N9.C),k=Math.exp(-d2/(N9.sg*N9.sg))*.16;return [k*N9.col[0],k*N9.col[1],k*N9.col[2]];}
/* LE SAUT REFUSÉ (vol-equilibre.js, comme espSautRefuse) : dans la jante et le tunnel ; et dans les bosses, le piqué et les marches dès que la route plonge plus fort devant
   (12° de plus dans les ~2,7 s qui viennent) : un saut lancé d'une crête survolerait la descente jusqu'à la jauge vide — dans un creux, devant une remontée, il reste permis */
function voySautRefuse(){
  if(!ORB_VOY||typeof s!=='number'||!NP||!(L>0))return false;
  for(const z of VOY_D.zonesSaut)if(s>z[0]&&s<z[1])return true;
  for(const z of VOY_D.zonesPente)if(s>z[0]-200&&s<z[1]){const dS=L/(NP-1),i=Math.max(0,Math.min(NP-1,Math.round(s/dS))),n=Math.round(380/dS),p0=Math.asin(Math.max(-1,Math.min(1,T[i].y*driveDir)));
    let mn=p0;for(let j=i;j<=Math.min(NP-1,i+n);j++){const pj=Math.asin(Math.max(-1,Math.min(1,T[j].y*driveDir)));if(pj<mn)mn=pj;}if(mn<p0-.21)return true;}
  return false;}
window.dbgVoyage=function(){ /* (banc) le voyage de la route en cours : sa clé, sa silhouette, ses modules, son décor */
  return {on:ORB_VOY,vo:ORB_PIOCHE.vo,der:ORB_PIOCHE.voyDer||null,voy:VOY?{cle:VOY.cle,cxG:VOY.cxG,fortG:VOY.fortG,fortFait:VOY.fortFait}:null,
    mods:(typeof MODS!=='undefined'&&MODS||[]).map(function(m){return (m.fig||'?')+':'+Math.round(m.s0+60)+'-'+Math.round(m.s1);}),
    decor:{jante:VOY_D.jante,roc:VOY_D.roc,neb:VOY_D.neb?{sg:Math.round(VOY_D.neb.sg)}:null,info:VOY_D.info,zonesSaut:VOY_D.zonesSaut.map(function(z){return z.map(Math.round);}),zonesPente:VOY_D.zonesPente.length,ms:VOY_D.ms,err:VOY_D.err},
    visibles:VOY_MESH.map(function(m){return m.visible;}),vues:VOY_D.vues.map(function(v){return v[0]+' '+v[1].toArray().map(Math.round).join(',')+':'+v[2].toArray().map(Math.round).join(',');})};};
