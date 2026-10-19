/* LES MONUMENTS — chacun en quelques pièces, à la cote réelle (Arc 49,5 × 44,8 × 22,2 m, voûte 29,2 × 14,6 ; Tour 330 m ; pylônes
   d'Alexandre-III 17 m ; Sacré-Cœur 83 m sur la Butte). Leurs matières s'ILLUMINENT à la nuit (`parisMatNuit` : l'émissive suit l'heure). */
function parisMatNuit(col,emi,kO,kB,kN,opts){ // une matière Lambert dont l'émissive suit l'heure : or · bleue · nuit
  const m=new THREE.MeshLambertMaterial(Object.assign({color:col,emissive:emi},opts||{}));
  PARIS.matsNuit.push({m:m,e:new THREE.Color(emi),k:[kO,kB,kN]});return m;
}
function parisAjoute(o,g){(g||scene).add(o);trackMeshes.push(o);PARIS.meshes.push(o);return o;} // tout ce que Paris pose : jeté avec la piste
function parisMesh(geo,mat,g,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);return parisAjoute(m,g);}
function parisGroupe(x,y,z,yaw){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw||0;scene.add(g);trackMeshes.push(g);PARIS.meshes.push(g);return g;}
function parisArc(p,yaw){ // L'ARC DE TRIOMPHE : deux piles percées de l'arc transversal, la grande voûte, l'entablement, l'attique — et le drapeau
  const g=parisGroupe(p.x,p.y+.16,p.z,yaw),pierre=parisMatNuit(0xd9c7a4,0xffc890,0,.12,.34),ombre=parisMatNuit(0xb9a684,0xffb070,0,.08,.26);PARIS.arcG=g;g.scale.setScalar(1.8); // ×1,8 (≈ 90 m) : l'objectif de course est TRÈS ouvert — à la vraie cote, au bout de l'avenue, l'Arc faisait quelques pixels (mesuré)
  const pile=new THREE.Shape();pile.moveTo(-11.1,0);pile.lineTo(-4.22,0);pile.lineTo(-4.22,14.46);pile.absarc(0,14.46,4.22,Math.PI,0,true);
  pile.lineTo(4.22,0);pile.lineTo(11.1,0);pile.lineTo(11.1,36.6);pile.lineTo(-11.1,36.6);pile.lineTo(-11.1,0);
  const gp=new THREE.ExtrudeGeometry(pile,{depth:15.1,bevelEnabled:false,curveSegments:12});gp.rotateY(Math.PI/2); // la pile : son arc transversal file selon x
  for(const sx of [-1,1]){const m=parisMesh(gp,pierre,g);m.position.x=sx<0?-22.41:7.31;}
  const vo=new THREE.Shape();vo.moveTo(-7.31,21.88);vo.lineTo(-7.31,36.6);vo.lineTo(7.31,36.6);vo.lineTo(7.31,21.88);vo.absarc(0,21.88,7.31,0,Math.PI,false);
  const gv=new THREE.ExtrudeGeometry(vo,{depth:22.2,bevelEnabled:false,curveSegments:16});gv.translate(0,0,-11.1);parisMesh(gv,pierre,g);
  parisMesh(new THREE.BoxGeometry(46.4,2.4,23.8),ombre,g,0,37.8,0);                       // l'entablement
  parisMesh(new THREE.BoxGeometry(44.8,9.5,22.2),pierre,g,0,43.75,0);                     // l'attique
  parisMesh(new THREE.BoxGeometry(45.8,1.1,23.2),ombre,g,0,49,0);                         // la corniche du sommet
  for(const sx of [-1,1])for(const sz of [-1,1])parisMesh(new THREE.BoxGeometry(7.2,11,.9),ombre,g,sx*14.9,6.5,sz*11.5); // les quatre groupes sculptés
  parisMesh(new THREE.BoxGeometry(44.9,1.6,22.3),ombre,g,0,31.4,0);                       // la frise
  // LE DRAPEAU sous la voûte : bleu, blanc, rouge — il ondule (vertex shader, l'heure de Paris)
  const cv=document.createElement('canvas');cv.width=48;cv.height=8;const x=cv.getContext('2d');
  x.fillStyle='#1d3f9e';x.fillRect(0,0,16,8);x.fillStyle='#f4f1ea';x.fillRect(16,0,16,8);x.fillStyle='#d8262f';x.fillRect(32,0,16,8);
  const tx=new THREE.CanvasTexture(cv);tx.magFilter=THREE.NearestFilter;
  const fm=parisDrapeauMat(tx); // (2026-09-30) en fabrique : parisChauffe la compile au menu
  const fl=parisMesh(new THREE.PlaneGeometry(9,17,8,10),fm,g,0,20.2,0);PARIS.drapeau=fl;
  return g;
}
function parisObelisque(p){ // L'OBÉLISQUE de Louxor : granite rose, pyramidion d'or
  const g=parisGroupe(p.x,p.y+.16,p.z,0),gr=new THREE.MeshLambertMaterial({color:0x8c8680});
  parisMesh(new THREE.BoxGeometry(6.2,1.2,6.2),gr,g,0,.6,0);parisMesh(new THREE.BoxGeometry(4.4,3.6,4.4),gr,g,0,3,0);
  const f=new THREE.CylinderGeometry(.95,1.3,22.8,4,1);f.rotateY(Math.PI/4);parisMesh(f,parisMatNuit(0xc9a189,0xffb080,0,.1,.32),g,0,16.2,0);
  const py=new THREE.ConeGeometry(.95,2.2,4);py.rotateY(Math.PI/4);parisMesh(py,parisMatNuit(0xe8b851,0x6a4410,.4,.6,1.2),g,0,28.7,0);
}
function parisFontaine(p){ // une fontaine de la Concorde : la vasque, la colonne, la coupe
  const g=parisGroupe(p.x,p.y+.16,p.z,0),pi=new THREE.MeshLambertMaterial({color:0xb7ad98});
  parisMesh(new THREE.CylinderGeometry(11,11.5,1.1,28),pi,g,0,.55,0);
  parisMesh(new THREE.CircleGeometry(10.5,28).rotateX(-Math.PI/2),parisMatNuit(0x2c4a5c,0x3a5a70,.05,.25,.4),g,0,1.02,0);
  parisMesh(new THREE.CylinderGeometry(1.1,1.7,6,12),pi,g,0,3.6,0);parisMesh(new THREE.CylinderGeometry(4,1.2,.9,18),parisMatNuit(0xc8a050,0x5a3a08,.2,.5,.9),g,0,6.8,0);
}
function parisInvalides(p,yaw){ // LE DÔME DES INVALIDES : le tambour, le dôme d'or, la lanterne, la flèche
  const g=parisGroupe(p.x,p.y,p.z,yaw),pi=parisMatNuit(0xd6c6a2,0xffc890,0,.1,.3),or=parisMatNuit(0xd9a53c,0x6a4410,.35,.6,1.1);
  parisMesh(new THREE.BoxGeometry(64,20,44),pi,g,0,10,0);parisMesh(new THREE.CylinderGeometry(17,17,18,28),pi,g,0,29,0);
  parisMesh(new THREE.BoxGeometry(40,24,9),pi,g,0,12,24);                                 // la façade à colonnes
  const d=new THREE.SphereGeometry(17.3,28,12,0,Math.PI*2,0,Math.PI/2);d.scale(1,1.4,1);parisMesh(d,or,g,0,38,0);
  parisMesh(new THREE.CylinderGeometry(3.2,3.6,8,12),or,g,0,65.5,0);parisMesh(new THREE.ConeGeometry(1.4,12,8),or,g,0,75.5,0);
}
function parisMoulin(p,yaw){ // LE MOULIN-ROUGE : la façade rouge, l'enseigne, le moulin — ses ailes TOURNENT
  const g=parisGroupe(p.x,p.y,p.z,yaw),rg=parisMatNuit(0x9b1b1f,0xff2030,.15,.55,.9),so=parisMatNuit(0x5a0f14,0xff3040,.05,.2,.35);
  parisMesh(new THREE.BoxGeometry(30,12,16),rg,g,0,6,0);
  const cv=document.createElement('canvas');cv.width=512;cv.height=64;const x=cv.getContext('2d');x.fillStyle='#240306';x.fillRect(0,0,512,64);
  x.font='26px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#ff2a2a';x.shadowBlur=14;x.fillStyle='#ffe0e0';x.fillText('MOULIN ROUGE',256,34);
  for(let i=0;i<40;i++){x.fillStyle='#ffd27a';x.beginPath();x.arc(8+i*12.6,6,2.4,0,7);x.arc(8+i*12.6,58,2.4,0,7);x.fill();}
  const tx=new THREE.CanvasTexture(cv),en=parisMatNuit(0xffffff,0x902020,.3,.8,1.2,{map:tx,emissiveMap:tx});
  const en1=parisMesh(new THREE.PlaneGeometry(26,3.2),en,g,0,8.3,-8.05);en1.rotation.y=Math.PI;       // l'enseigne, côté rue (−z)
  parisMesh(new THREE.BoxGeometry(30,1,2.2),so,g,0,4.4,-8.8);                                         // la marquise
  parisMesh(new THREE.CylinderGeometry(4,4.8,9,8),rg,g,6,16.5,0);parisMesh(new THREE.ConeGeometry(5.2,5,8),so,g,6,23.5,0);
  const ailes=parisGroupe(0,0,0,0);g.add(ailes);ailes.position.set(6,17.5,-5.2);
  const bl=new THREE.BoxGeometry(2.4,11.5,.25);bl.translate(0,6.6,0);
  const am=parisMatNuit(0xb81d24,0xff4050,.2,.7,1.3);
  for(let k=0;k<4;k++){const m=parisMesh(bl,am,ailes);m.rotation.z=k*Math.PI/2;}
  parisMesh(new THREE.CylinderGeometry(.6,.6,.8,10).rotateX(Math.PI/2),so,ailes);
  PARIS.ailes=ailes;
}
function parisSacreCoeur(p,yaw){ // LE SACRÉ-CŒUR : la nef, le porche à trois arcs, le tambour, le grand dôme ovoïde, quatre petits dômes, le campanile
  const g=parisGroupe(p.x,p.y,p.z,yaw),bl=parisMatNuit(0xf1ece2,0xfff2dc,0,.14,.42),bl2=parisMatNuit(0xdcd6ca,0xffe8cc,0,.1,.34);
  parisMesh(new THREE.BoxGeometry(120,6,110),bl2,g,0,3,0);                                     // la terrasse
  parisMesh(new THREE.BoxGeometry(62,28,72),bl,g,0,20,5);                                      // la nef
  const po=new THREE.Shape();po.moveTo(-21,0);for(let k=0;k<3;k++){const c=-14+k*14;po.lineTo(c-4.5,0);po.lineTo(c-4.5,9);po.absarc(c,9,4.5,Math.PI,0,true);po.lineTo(c+4.5,0);}
  po.lineTo(21,0);po.lineTo(21,18);po.lineTo(-21,18);po.lineTo(-21,0);
  const gpo=new THREE.ExtrudeGeometry(po,{depth:9,bevelEnabled:false,curveSegments:10});parisMesh(gpo,bl,g,0,6,-40);   // le porche, côté parvis (−z)
  const lathe=(r,h)=>{const P=[];for(let k=0;k<=10;k++){const a=k/10;P.push(new THREE.Vector2(r*Math.sin(Math.PI*.5*(1-a*a))*(1-.12*a),h*a));}return new THREE.LatheGeometry(P,24);};
  parisMesh(new THREE.CylinderGeometry(15.5,15.5,20,28),bl,g,0,44,5);                          // le tambour
  parisMesh(lathe(16.5,30),bl,g,0,54,5);                                                        // le GRAND DÔME, ovoïde
  parisMesh(new THREE.CylinderGeometry(3,3,6,12),bl,g,0,86,5);parisMesh(lathe(3.4,5),bl,g,0,89,5);parisMesh(new THREE.ConeGeometry(.5,4,6),bl,g,0,96,5);
  for(const sx of [-1,1])for(const sz of [-1,1]){parisMesh(new THREE.CylinderGeometry(5.5,5.5,8,16),bl,g,sx*24,38,5+sz*24);parisMesh(lathe(6,9),bl,g,sx*24,42,5+sz*24);}
  parisMesh(new THREE.BoxGeometry(13,48,13),bl,g,0,30,44);parisMesh(lathe(7.5,11),bl,g,0,54,44);                    // le campanile
}
function parisBateau(){ // UN BATEAU-MOUCHE : coque blanche, verrière allumée
  const g=new THREE.Group();scene.add(g);trackMeshes.push(g);PARIS.meshes.push(g);
  parisMesh(new THREE.BoxGeometry(6,1.8,30),new THREE.MeshLambertMaterial({color:0xe8e6e0}),g,0,.3,0);
  parisMesh(new THREE.BoxGeometry(5,2,23),parisMatNuit(0x8aa0b0,0xffd89a,.1,.7,1.1,{transparent:true,opacity:.9}),g,0,2.1,-1);
  parisMesh(new THREE.BoxGeometry(5.4,.2,24),new THREE.MeshLambertMaterial({color:0x2a3440}),g,0,3.15,-1);
  return g;
}
function buildParis(seed){
  for(const m of PARIS.meshes)if(m.isInstancedMesh)m.dispose();
  PARIS.meshes=[];PARIS.scint=null;PARIS.phare=null;PARIS.n=null;PARIS.tourPos=null;PARIS.ailes=null;PARIS.drapeau=null;PARIS.bateaux=[];PARIS.matsNuit=[];
  PARIS.sol=false;PARIS.qBio=-1;PARIS.qAnn=-1;PARIS.grille=null;PARIS.mFlaque=null;PARIS.mHalo=null;PARIS.mLant=null;pgpReset();
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='paris'||!(NP>1)||!PARIS.Q){PARIS.Q=null;PARIS.Z=null;return;}
  PARIS.sol=true;
  const t00=performance.now(),pr=mulberry32((seed^0x9A815C)>>>0),Q=PARIS.Q,SV=Q.seine;
  parisRepere();
  const inst=(geo,mat,n,col)=>{const m=new THREE.InstancedMesh(geo,mat,Math.max(1,n));if(col)m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1,n)*3),3);m.count=0;return m;}; // ⚠ r128 : setColorAt crée l'attribut à la taille de `count` — on le crée AVANT de remettre count à 0
  const fin=m=>{m.frustumCulled=false;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;return parisAjoute(m);};
  const m4=new THREE.Matrix4(),m5=new THREE.Matrix4(),q4=new THREE.Quaternion(),v4=new THREE.Vector3(),s4=new THREE.Vector3(),e4=new THREE.Euler(),UP=new THREE.Vector3(0,1,0),c4=new THREE.Color();
  const X9=new THREE.Vector3(),Z9=new THREE.Vector3();
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
  // la grille de hachage des points de piste (resservira aux collisions en vol)
  const HB=120,grille=new Map(),pasP=Math.max(1,Math.round(8/(L/(NP-1))));
  for(let i=0;i<NP;i+=pasP){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  PARIS.grille=grille;PARIS.HB=HB;
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);
    for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const pisteLoin=(x,z,R)=>{let ok=true;proches(x,z,R,function(i){if(ok){const p=pts[i];if((p.x-x)*(p.x-x)+(p.z-z)*(p.z-z)<R*R)ok=false;}});return ok;};
  const FA=ROAD_HALF+PARIS_SW;
  const uDe=(x,z)=>(x-SV.b.x)*SV.n.x+(z-SV.b.z)*SV.n.z,aDe=(x,z)=>(x-SV.b.x)*SV.r.x+(z-SV.b.z)*SV.r.z; // le fleuve : en travers / le long
  const yawDe=(dx,dz)=>Math.atan2(-dz,dx);  // l'axe x local d'un objet posé le long de (dx,dz)
  // ===== LES MONUMENTS : leurs emprises d'abord (les immeubles s'en écartent) =====
  const MON=[];
  frameAt(Math.min(165,L*.02),F9);const pObel=F9.p.clone().addScaledVector(F9.b,-(ROAD_HALF+62)),pFont=F9.p.clone().addScaledVector(F9.b,ROAD_HALF+52);
  const sInv=Q.invalides.s+170;frameAt(sInv,F9);const pInv=F9.p.clone().addScaledVector(F9.b,-(ROAD_HALF+175)),yInv=yawDe(F9.t.x,F9.t.z);
  const sMR=(Q.clichy0.s+Q.clichy1.s)/2;frameAt(sMR,F9);const pMR=F9.p.clone().addScaledVector(F9.b,-(FA+8.5)),yMR=yawDe(F9.t.x,F9.t.z);
  MON.push({x:pObel.x,z:pObel.z,r:30},{x:pFont.x,z:pFont.z,r:24},{x:Q.arc.p.x,z:Q.arc.p.z,r:118},{x:Q.tour.p.x,z:Q.tour.p.z,r:185},
    {x:Q.sc.p.x,z:Q.sc.p.z,r:165},{x:pInv.x,z:pInv.z,r:62},{x:pMR.x,z:pMR.z,r:17});
  // ===== LES IMMEUBLES =====
  const BAT=[],RECTS=new Map(),RC=60;
  const rect=(x,z,w,d,yaw)=>({x:x,z:z,hw:w/2,hd:d/2,c:Math.cos(yaw),s:Math.sin(yaw),yaw:yaw});
  const sep=(A,C,ax,az)=>{const pa=A.x*ax+A.z*az,pb=C.x*ax+C.z*az,ra=A.hw*Math.abs(A.c*ax-A.s*az)+A.hd*Math.abs(A.s*ax+A.c*az),rb=C.hw*Math.abs(C.c*ax-C.s*az)+C.hd*Math.abs(C.s*ax+C.c*az);return Math.abs(pa-pb)>ra+rb-.6;};
  const chev=(A,C)=>!(sep(A,C,A.c,-A.s)||sep(A,C,A.s,A.c)||sep(A,C,C.c,-C.s)||sep(A,C,C.s,C.c));
  const libre=R=>{let ok=true;const rr=Math.hypot(R.hw,R.hd)+ROAD_HALF+4;
    proches(R.x,R.z,rr,function(i){if(!ok)return;const p=pts[i],dx=p.x-R.x,dz=p.z-R.z,lx=dx*R.c-dz*R.s,lz=dx*R.s+dz*R.c;if(Math.abs(lx)<R.hw+ROAD_HALF+1.5&&Math.abs(lz)<R.hd+ROAD_HALF+1.5)ok=false;});
    if(!ok)return false;
    if(Math.abs(uDe(R.x,R.z))<95+Math.hypot(R.hw,R.hd))return false;                                  // ni dans la Seine
    for(const m of MON)if(Math.hypot(R.x-m.x,R.z-m.z)<m.r+Math.hypot(R.hw,R.hd)*.8)return false;      // ni sur un monument
    const gx=Math.floor(R.x/RC),gz=Math.floor(R.z/RC);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l9=RECTS.get((gx+a)+','+(gz+b));if(l9)for(const o of l9)if(chev(R,o))return false;}
    return true;};
  const pose=R=>{const k=Math.floor(R.x/RC)+','+Math.floor(R.z/RC);let a=RECTS.get(k);if(!a)RECTS.set(k,a=[]);a.push(R);};
  const batit=(R,sty,Hf,yS,front,ox,oz)=>{if(!libre(R))return false;pose(R);BAT.push({R:R,sty:sty,Hf:Hf,yS:yS,t:pr(),h:pr(),front:front,ox:ox,oz:oz});return true;};
  pose(rect(pMR.x,pMR.z,30,16,yMR));                                                                   // le Moulin-Rouge prend sa place dans le rang
  const RUES=[],O=new THREE.Vector3(),Oa=new THREE.Vector3(),O0=new THREE.Vector3();
  for(const sg of [-1,1]){ // LES RANGS le long de la route : la ligne des façades, un immeuble tous les 17-29 m, une rue de traverse tous les 60-170 m
    let sA=0,dAcc=0,wC=0,bloc=40+pr()*80,gap=false;
    frameAt(0,F9);Oa.copy(F9.p).addScaledVector(F9.b,sg*FA);O0.copy(Oa);
    for(let s9=1.5;s9<L-1;s9+=1.5){
      frameAt(s9,F9);O.copy(F9.p).addScaledVector(F9.b,sg*FA);dAcc+=O.distanceTo(Oa);Oa.copy(O);
      if(!wC){const z=parisZone(s9);wC=gap?14+pr()*6:(z&&z.st===1)?8+pr()*6:17+pr()*12;}
      if(dAcc<wC)continue;
      const sM=(sA+s9)/2,z=parisZone(sM),typ=z?(sg<0?z.g:z.d):null;
      frameAt(sM,F9);const ox=F9.b.x*sg,oz=F9.b.z*sg,yS=F9.p.y;
      const dx=O.x-O0.x,dz=O.z-O0.z,w=Math.hypot(dx,dz)||1,yaw=yawDe(dx/w,dz/w),mx=(O.x+O0.x)/2,mz=(O.z+O0.z)/2;
      if(typ==='bati'){
        if(gap)RUES.push({s:sM,sg:sg,w:w,x:mx,z:mz,ox:ox,oz:oz,yaw:yaw,yS:yS});
        else{const sty=z.st,fb=sty===1,dp=fb?11+pr()*6:26+pr()*14,Hf=fb?(pr()<.55?10.5:13.4):22;
          if(batit(rect(mx+ox*dp/2,mz+oz*dp/2,w-.2,dp,yaw),sty,Hf,yS,true,ox,oz)&&pr()<(fb?.5:.8)){ // l'ARRIÈRE : les toits de Paris vus d'en haut
            const dp2=fb?10+pr()*5:24+pr()*14,o2=dp+dp2/2+(fb?1.5:2);batit(rect(mx+ox*o2,mz+oz*o2,w-.2,dp2,yaw),sty,fb?Hf:Hf+(pr()<.3?3.3:0),yS,false,ox,oz);}}
        bloc-=w;if(gap){gap=false;bloc=60+pr()*110;}else if(bloc<=0)gap=true;
      }
      O0.copy(O);sA=s9;dAcc=0;wC=0;
    }
  }
  for(const r of RUES){ // la rue de traverse fermée par une façade (on ne voit jamais le vide au bout)
    const o=90+16;batit(rect(r.x+r.ox*o,r.z+r.oz*o,r.w+22,32,r.yaw),parisZone(r.s).st===1?1:0,parisZone(r.s).st===1?13.4:22,r.yS,true,-r.ox,-r.oz);}
  const aI=0,aA=aDe((Q.alex0.p.x+Q.alex1.p.x)/2,(Q.alex0.p.z+Q.alex1.p.z)/2),PONTS=[aI,aA,(aI+aA)/2,aA+900,-2600]; // les ponts (le long du fleuve)
  for(const sgR of [-1,1]){ // LES QUAIS : les façades qui regardent la Seine, sur les deux rives
    let a=-4600;while(a<4600){const w=17+pr()*12,dp=24+pr()*14,am=a+w/2,u=sgR*(114+dp/2);
      batit(rect(SV.b.x+SV.r.x*am+SV.n.x*u,SV.b.z+SV.r.z*am+SV.n.z*u,w-.2,dp,yawDe(SV.r.x,SV.r.z)),0,22,0,true,SV.n.x*sgR,SV.n.z*sgR);
      a+=w;if(pr()<.12)a+=16;}}
  // les instances des immeubles (façades, mansardes, corniches, balcons filants, cheminées, pots, stores)
  const nMax=IS_MOBILE?1700:2600;if(BAT.length>nMax){const av=BAT.filter(b=>b.front),ar=BAT.filter(b=>!b.front);BAT.length=0;BAT.push(...av,...ar.slice(0,Math.max(0,nMax-av.length)));BAT.length=Math.min(BAT.length,nMax);}
  const n=BAT.length,aS=new Float32Array(n*4),aS2=new Float32Array(n*4);
  const facG=new THREE.BoxGeometry(1,1,1);facG.setAttribute('aSty',new THREE.InstancedBufferAttribute(aS,4));
  const tHG=new THREE.CylinderGeometry(.6,.7071,1,4,1);tHG.rotateY(Math.PI/4);tHG.setAttribute('aSty',new THREE.InstancedBufferAttribute(aS2,4));
  const tFG=new THREE.CylinderGeometry(.2,.7071,1,4,1);tFG.rotateY(Math.PI/4);const aS3=new Float32Array(n*4);tFG.setAttribute('aSty',new THREE.InstancedBufferAttribute(aS3,4));
  const fac=inst(facG,parisFacade(),n),tH=inst(tHG,parisZinc(),n),tF=inst(tFG,parisZinc(),n);
  const pierreM=new THREE.MeshLambertMaterial({color:0xd6cab0}),boxG=new THREE.BoxGeometry(1,1,1);
  const corn=inst(boxG,pierreM,n),dal=inst(boxG,pierreM,n*2),fer=inst(new THREE.BoxGeometry(1,1,1),parisFerMat(),n*2);
  const chem=inst(boxG,new THREE.MeshLambertMaterial({color:0xa98068,emissive:0x1c100a}),n*2),pots=inst(boxG,new THREE.MeshLambertMaterial({color:0xc4683c,emissive:0x2c1006}),n*6);
  const stTx=(function(){const cv=document.createElement('canvas');cv.width=16;cv.height=2;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,16,2);x.fillStyle='#c9c4bc';for(let i=0;i<4;i++)x.fillRect(i*4+2,0,2,2);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;return t;})();
  const stores=inst(boxG,new THREE.MeshLambertMaterial({map:stTx,side:THREE.DoubleSide}),n,true);
  const COUL_ST=[0x8c1414,0x1e4a2e,0x3a1f4f,0x7a5a1e,0x13294d,0x8c1414];
  for(let j=0;j<n;j++){const b=BAT[j],R=b.R,top=b.yS+b.Hf,H=b.Hf+3.5,fb=b.sty===1;
    q4.setFromEuler(e4.set(0,R.yaw,0));
    m4.compose(v4.set(R.x,top-H/2,R.z),q4,s4.set(R.hw*2,H,R.hd*2));fac.setMatrixAt(fac.count++,m4);
    aS.set([b.sty,b.t,b.Hf,b.h],j*4);
    const hr=fb?3.2+b.h*1.8:6.5+b.h*2;const tt=fb?tF:tH;m4.compose(v4.set(R.x,top+hr/2,R.z),q4,s4.set(R.hw*2,hr,R.hd*2));
    (fb?aS3:aS2).set([b.sty,b.t,b.Hf,b.h],tt.count*4);tt.setMatrixAt(tt.count++,m4);
    if(!fb){m4.compose(v4.set(R.x,top-.37,R.z),q4,s4.set(R.hw*2,.75,R.hd*2+.9));corn.setMatrixAt(corn.count++,m4); // la corniche
      if(b.front)for(const dT of [3.85,13.9]){                                                                   // les BALCONS FILANTS du 5e et du 2e
        m4.compose(v4.set(R.x,top-dT-.11,R.z),q4,s4.set(R.hw*2,.22,R.hd*2+1.8));dal.setMatrixAt(dal.count++,m4);
        m4.compose(v4.set(R.x,top-dT+.48,R.z),q4,s4.set(R.hw*2-.3,.95,R.hd*2+1.7));fer.setMatrixAt(fer.count++,m4);}}
    for(let c=0;c<2;c++){if(pr()<.3)continue;const a=(pr()-.5)*R.hw*1.2,bb=(c?1:-1)*R.hd*.36,x9=R.x+a*R.c+bb*R.s,z9=R.z-a*R.s+bb*R.c,ch=fb?2.2:3.4; // les CHEMINÉES
      m4.compose(v4.set(x9,top+hr+ch/2-.6,z9),q4,s4.set(fb?1.4:2.2,ch,fb?.9:1.2));chem.setMatrixAt(chem.count++,m4);
      const k9=fb?2:2+Math.floor(pr()*2);for(let k=0;k<k9;k++){const px=(k-(k9-1)/2)*.62,hp=.55+pr()*.35;
        m4.compose(v4.set(x9+px*R.c,top+hr+ch-.6+hp/2,z9-px*R.s),q4,s4.set(.36,hp,.36));pots.setMatrixAt(pots.count++,m4);}}
    if(b.front&&b.ox!=null&&pr()<(fb?.7:.22)){ // un STORE rayé au-dessus du café
      X9.set(R.c,0,-R.s);Z9.set(-b.ox,0,-b.oz);const fx=R.x-b.ox*R.hd,fz=R.z-b.oz*R.hd;
      m5.makeBasis(X9,UP,Z9);m4.makeRotationX(-.38);m5.multiply(m4);m5.scale(s4.set(R.hw*1.45,.08,1.6));m5.setPosition(fx-b.ox*.72,b.yS+3.05,fz-b.oz*.72);
      stores.setMatrixAt(stores.count,m5);stores.setColorAt(stores.count++,c4.setHex(COUL_ST[(b.t*6)|0]));}
  }
  for(const m of [fac,tH,tF,corn,dal,fer,chem,pots,stores])fin(m);
  // ===== LA RUE : trottoirs et bordures, parapets, passages piétons, rues de traverse, pelouses =====
  {const P=[],N=[],UV=[],I=[];let v=0,acc=0;const pas=3;
   for(const sg of [-1,1]){acc=0;let pv=-1;
    for(let i=0;i<NP;i+=pas){const p=pts[i],b=B[i],nn=Nn[i];if(i>0)acc+=pts[i].distanceTo(pts[Math.max(0,i-pas)]);
      const lo=sg*ROAD_HALF,hi=sg*(FA+.8),y1=.16;
      P.push(p.x+b.x*lo-nn.x*.05,p.y+b.y*lo-nn.y*.05,p.z+b.z*lo-nn.z*.05, p.x+b.x*lo+nn.x*y1,p.y+b.y*lo+nn.y*y1,p.z+b.z*lo+nn.z*y1,
             p.x+b.x*lo+nn.x*y1,p.y+b.y*lo+nn.y*y1,p.z+b.z*lo+nn.z*y1, p.x+b.x*hi+nn.x*y1,p.y+b.y*hi+nn.y*y1,p.z+b.z*hi+nn.z*y1);
      N.push(-b.x*sg,-b.y*sg,-b.z*sg,-b.x*sg,-b.y*sg,-b.z*sg,nn.x,nn.y,nn.z,nn.x,nn.y,nn.z);
      UV.push(0,acc/2.4,.07,acc/2.4,0,acc/2.4,(FA+.8-ROAD_HALF)/2.4,acc/2.4);
      if(pv>=0){const a=pv,c=v;if(sg>0)I.push(a,c,a+1,a+1,c,c+1,a+2,c+2,a+3,a+3,c+2,c+3);else I.push(a,a+1,c,a+1,c+1,c,a+2,a+3,c+2,a+3,c+3,c+2);}
      pv=v;v+=4;}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);
   const tx=parisTex('dalles');const mt=new THREE.MeshLambertMaterial({map:tx,color:0xd8d2c6});const m=new THREE.Mesh(g,mt);m.frustumCulled=false;parisAjoute(m);}
  {const P=[],N=[],I=[];let v=0; // les PARAPETS du quai et des ponts
   for(const sg of [-1,1]){let pv=-1;
    for(let i=0;i<NP;i+=3){const s9=i/(NP-1)*L,ty=parisCote(s9,sg),on=ty==='quai'||ty==='pont';if(!on){pv=-1;continue;}
      const p=pts[i],b=B[i],a=sg*(FA-.1),c=sg*(FA+.5);
      P.push(p.x+b.x*a,p.y+.16,p.z+b.z*a, p.x+b.x*a,p.y+1.05,p.z+b.z*a, p.x+b.x*c,p.y+1.05,p.z+b.z*c, p.x+b.x*c,p.y-7,p.z+b.z*c);
      N.push(-b.x*sg,0,-b.z*sg,-b.x*sg,.3,-b.z*sg,b.x*sg,.3,b.z*sg,b.x*sg,0,b.z*sg);
      if(pv>=0){const q=pv,r=v;for(let k=0;k<3;k++){if(sg>0)I.push(q+k,r+k,q+k+1,q+k+1,r+k,r+k+1);else I.push(q+k,q+k+1,r+k,q+k+1,r+k+1,r+k);}}
      pv=v;v+=4;}}
   if(v){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xc4b89c,side:THREE.DoubleSide}));m.frustumCulled=false;parisAjoute(m);}}
  const plat=new THREE.PlaneGeometry(1,1);plat.rotateX(-Math.PI/2);
  {const zb=inst(plat,new THREE.MeshLambertMaterial({map:parisTex('zebre'),side:THREE.DoubleSide,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),RUES.length+8);
   zb.material.map.repeat.set((2*ROAD_HALF-3)/1,1);
   const ru=inst(plat,new THREE.MeshLambertMaterial({color:0x34333a,side:THREE.DoubleSide}),RUES.length);
   for(const r of RUES){frameAt(r.s,F9);m4.makeBasis(F9.b,UP,F9.t);m4.scale(s4.set(2*ROAD_HALF-3,1,4.6));m4.setPosition(F9.p.x,F9.p.y+.035,F9.p.z);zb.setMatrixAt(zb.count++,m4);
     X9.set(Math.cos(r.yaw),0,-Math.sin(r.yaw));Z9.set(r.ox,0,r.oz);m4.makeBasis(X9,UP,Z9);m4.scale(s4.set(r.w-1,1,92));m4.setPosition(r.x+r.ox*46,r.yS+.03,r.z+r.oz*46);ru.setMatrixAt(ru.count++,m4);}
   fin(zb);fin(ru);}
  {const pe=inst(plat,new THREE.MeshLambertMaterial({color:0x3f5a2c}),900),gv=inst(plat,new THREE.MeshLambertMaterial({color:0xcbbd9c}),600); // PELOUSES des jardins, et le PAVÉ des places
   for(let s9=10;s9<L-10;s9+=24)for(const sg of [-1,1]){const ty=parisCote(s9,sg);if(ty!=='jardin'&&ty!=='place')continue;if(ty==='place'&&s9>L-400)continue;frameAt(s9,F9); // (la montée finale : la Butte nue, le parvis suffit)
     const k=ty==='jardin'?pe:gv,la=ty==='jardin'?30:46;if(k.count>=(k===pe?900:600))continue;
     m4.makeBasis(F9.b,UP,F9.t);m4.scale(s4.set(la*2,1,25));const off=sg*(FA+.6+la);m4.setPosition(F9.p.x+F9.b.x*off,F9.p.y+(ty==='jardin'?.05:.1),F9.p.z+F9.b.z*off);k.setMatrixAt(k.count++,m4);}
   fin(pe);fin(gv);
   const ile=parisMesh(new THREE.CircleGeometry(170-ROAD_HALF-.5,48).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xcbbd9c}),null,Q.arc.p.x,Q.arc.p.y+.14,Q.arc.p.z);ile.frustumCulled=true;}
  // ===== LES ARBRES : le rideau taillé des Champs, les platanes des quais et des boulevards =====
  {const ARB=[];const arbre=(s9,la,ty,k)=>{frameAt(s9,F9);ARB.push([F9.p.x+F9.b.x*la,F9.p.y+.16,F9.p.z+F9.b.z*la,ty,k*(.9+pr()*.2),pr()*6.3]);};
   for(let s9=20;s9<L-20;s9+=9){const z=parisZone(s9);if(!z)continue;const k9=((s9/9)|0);
     for(const sg of [-1,1]){const ty=sg<0?z.g:z.d,R9=s9<Q.etoile0.s?0:1;
       if(ty==='jardin'){arbre(s9,sg*(ROAD_HALF+4.2),R9,1);if(k9%2===0)arbre(s9+4.5,sg*(FA+11),R9,1.15);}
       else if(ty==='bati'&&z.st===2)arbre(s9,sg*(ROAD_HALF+4.2),0,1);
       else if(ty==='bati'&&z.st===0&&s9>Q.etoile1.s&&k9%2===0)arbre(s9,sg*(ROAD_HALF+4.2),1,.95);
       else if(ty==='quai'&&k9%2===0)arbre(s9,sg*(ROAD_HALF+4.2),1,1.05);}}
   for(const sgR of [-1,1])for(let a=-4400;a<4400;a+=15){if(PONTS.some(pa=>Math.abs(a-pa)<45))continue;const u=sgR*87;const x=SV.b.x+SV.r.x*a+SV.n.x*u,z=SV.b.z+SV.r.z*a+SV.n.z*u;
     if(pisteLoin(x,z,70))ARB.push([x,-6,z,1,1.1*(.9+pr()*.2),pr()*6.3]);}                          // les peupliers des bas-ports
   const trG=new THREE.CylinderGeometry(.22,.32,4.6,5);trG.translate(0,2.3,0);
   const jit=(g,a)=>{const p=g.attributes.position,hh=(x,y,z)=>{const s=Math.sin(x*12.99+y*78.23+z*37.72)*43758.55;return s-Math.floor(s)-.5;}; // bougé selon la POSITION : les sommets partagés bougent ensemble (pas de fente)
     for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+hh(Math.round(x*100),Math.round(y*100),Math.round(z*100))*a;p.setXYZ(i,x*k,y*k,z*k);}g.computeVertexNormals();return g;};
   const riG=jit(new THREE.BoxGeometry(6.2,5,5.6,2,2,2),.12);riG.translate(0,6.9,0);
   const boG=jit(new THREE.IcosahedronGeometry(3.3,1),.18);boG.scale(1,.9,1);boG.translate(0,7.4,0);
   const nA=ARB.length,tr=inst(trG,new THREE.MeshLambertMaterial({color:0x4a3b2e}),nA),ri=inst(riG,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),nA,true),bo=inst(boG,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),nA,true);
   for(const a of ARB){q4.setFromEuler(e4.set(0,a[5],0));m4.compose(v4.set(a[0],a[1],a[2]),q4,s4.set(a[4],a[4],a[4]));tr.setMatrixAt(tr.count++,m4);
     const k=a[3]===0?ri:bo;k.setMatrixAt(k.count,m4);k.setColorAt(k.count++,c4.setRGB(.24+pr()*.06,.36+pr()*.08,.16+pr()*.04));}
   fin(tr);fin(ri);fin(bo);}
  // ===== LES CANDÉLABRES : le mât vert sombre, la lanterne qui s'allume avec l'heure, son halo, sa flaque de lumière sur le pavé =====
  {const LA=[],FL=[];const lampe=(x,y,z,tri)=>{LA.push([x,y,z,tri]);};
   for(let s9=13;s9<L-10;s9+=26)for(const sg of [-1,1]){const s2=s9+(sg>0?13:0),ty=parisCote(s2,sg);if(!ty||ty==='pont')continue;frameAt(s2,F9);
     lampe(F9.p.x+F9.b.x*sg*(ROAD_HALF+.8),F9.p.y+.16,F9.p.z+F9.b.z*sg*(ROAD_HALF+.8),0);FL.push([F9.p.x+F9.b.x*sg*(ROAD_HALF-4),F9.p.y+.04,F9.p.z+F9.b.z*sg*(ROAD_HALF-4)]);}
   for(const k of [['iena0','iena1',0],['alex0','alex1',1]])for(let s9=Q[k[0]].s+8;s9<Q[k[1]].s-4;s9+=20)for(const sg of [-1,1]){frameAt(s9,F9);
     lampe(F9.p.x+F9.b.x*sg*(FA+.2),F9.p.y+1.05,F9.p.z+F9.b.z*sg*(FA+.2),k[2]);FL.push([F9.p.x+F9.b.x*sg*(ROAD_HALF-4),F9.p.y+.04,F9.p.z+F9.b.z*sg*(ROAD_HALF-4)]);}
   for(const sgR of [-1,1])for(let a=-4400;a<4400;a+=26){const u=sgR*95.8,x=SV.b.x+SV.r.x*a+SV.n.x*u,z=SV.b.z+SV.r.z*a+SV.n.z*u;if(pisteLoin(x,z,60))lampe(x,.16,z,0);} // les quais d'en face (leurs reflets dans l'eau)
   const nL=LA.length,poG=new THREE.CylinderGeometry(.08,.13,5.4,6);poG.translate(0,2.7,0);
   const lnG=geoFusion([new THREE.CylinderGeometry(.3,.19,.72,6),new THREE.ConeGeometry(.42,.36,6).translate(0,.54,0)]);
   const po=inst(poG,new THREE.MeshLambertMaterial({color:0x1f2a22}),nL),ln=inst(lnG,new THREE.MeshBasicMaterial({color:0xffc98a}),nL*3);PARIS.mLant=ln.material;
   const hp=[];
   for(const l of LA){const tri=l[3]===1,h=tri?6.6:5.4;m4.compose(v4.set(l[0],l[1],l[2]),q4.identity(),s4.set(1,h/5.4,1));po.setMatrixAt(po.count++,m4);
     const pos=tri?[[0,h+.1,0],[.75,h-.5,0],[-.75,h-.5,0]]:[[0,h+.2,0]];
     for(const o of pos){m4.compose(v4.set(l[0]+o[0],l[1]+o[1],l[2]+o[2]),q4.identity(),s4.set(1,1,1));ln.setMatrixAt(ln.count++,m4);hp.push(l[0]+o[0],l[1]+o[1],l[2]+o[2]);}}
   fin(po);fin(ln);
   const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));
   const hm=parisHaloMat();
   const hpts=new THREE.Points(hg,hm);hpts.frustumCulled=false;parisAjoute(hpts);PARIS.mHalo=hm;
   const flm=new THREE.MeshBasicMaterial({map:parisTex('rond'),color:0xffb865,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   const fl=inst(plat,flm,FL.length);for(const f of FL){m4.compose(v4.set(f[0],f[1],f[2]),q4.identity(),s4.set(17,1,17));fl.setMatrixAt(fl.count++,m4);}fin(fl);PARIS.mFlaque=flm;}
  // ===== LE SOL (la ville vue d'en haut, la Butte en relief, le lit de la Seine) =====
  {let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=20){const p=pts[i];x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);}
   x0-=1600;x1+=1600;z0-=1600;z1+=1600;const nx=150,nz=150,P=[],I=[];
   for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz,u=Math.abs(uDe(x,z));P.push(x,u<93.5?-11:parisColline(x,z)-1,z);}
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;I.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
   const m=new THREE.Mesh(g,parisSolMat());m.frustumCulled=false;parisAjoute(m);}
  // ===== LA SEINE : l'eau, les murs des quais, les bas-ports, les ponts, les bateaux-mouches =====
  {const SP=10000,yawR=yawDe(SV.n.x,SV.n.z); // le repère du fleuve : x local = en travers (n), z local = le long (r)
   const bloc=(u,y,wu,h,wa,mat,aC)=>{const m=parisMesh(new THREE.BoxGeometry(wu,h,wa||SP),mat,null,SV.b.x+SV.n.x*u+SV.r.x*(aC||0),y,SV.b.z+SV.n.z*u+SV.r.z*(aC||0));m.rotation.y=yawR;m.frustumCulled=false;return m;};
   const eau=parisMesh(new THREE.PlaneGeometry(162,SP,1,1).rotateX(-Math.PI/2),parisEauMat(SV.b,SV.n,SV.r),null,SV.b.x,-8,SV.b.z);eau.rotation.y=yawR;eau.frustumCulled=false;
   const mur=new THREE.MeshLambertMaterial({color:0xa99c84}),bas=new THREE.MeshLambertMaterial({color:0x8e8576});
   for(const sg of [-1,1]){bloc(sg*92.7,-2.9,.8,6.4,0,mur);bloc(sg*86.4,-6.25,11.8,.5,0,bas);bloc(sg*80.4,-8.1,.8,2.4,0,mur);}
   const arcs=(k,nb,fleche,mat,y0)=>{ // la TÊTE d'un pont : son élévation (arches dans l'eau) extrudée sur sa largeur
     const sh=new THREE.Shape(),hw=122;sh.moveTo(-hw,y0);sh.lineTo(hw,y0);sh.lineTo(hw,-9.5);sh.lineTo(80,-9.5);
     const pile=nb>1?5:0,port=(160-pile*(nb-1))/nb;let x=80;
     for(let q=0;q<nb;q++){const c=x-port/2;sh.lineTo(x,-8.2);const N=10;for(let t=1;t<=N;t++){const a=Math.PI*t/N;sh.lineTo(c+Math.cos(a)*port/2,-8.2+Math.sin(a)*fleche);}sh.lineTo(x-port,-9.5);x-=port;if(q<nb-1){sh.lineTo(x-pile,-9.5);x-=pile;}}
     sh.lineTo(-hw,-9.5);sh.lineTo(-hw,y0);
     const gg=new THREE.ExtrudeGeometry(sh,{depth:k,bevelEnabled:false});gg.translate(0,0,-k/2);return new THREE.Mesh(gg,mat);};
   const pierreP=parisMatNuit(0xcdbf9f,0xffc890,0,.06,.18),acier=parisMatNuit(0x2e3c38,0xffb050,0,.1,.25);
   for(let k=0;k<PONTS.length;k++){const a=PONTS[k],track=k<2,m=arcs(track?2*FA+2:30,k===1?1:k===3?4:5,k===1?4.2:5.2,k===1?acier:pierreP,track?-2.7:.1);
     m.position.set(SV.b.x+SV.r.x*a,0,SV.b.z+SV.r.z*a);m.rotation.y=yawR;parisAjoute(m);
     if(!track){const d=parisMesh(new THREE.BoxGeometry(244,.4,30),new THREE.MeshLambertMaterial({color:0x3a3940}),null,SV.b.x+SV.r.x*a,.1,SV.b.z+SV.r.z*a);d.rotation.y=yawR;}}
   // ALEXANDRE-III : la frise d'or le long du tablier, et les quatre PYLÔNES de 17 m coiffés de leur Renommée d'or
   {const a=aA,orF=parisMatNuit(0xd8a640,0x6a4410,.35,.7,1.2),gra=parisMatNuit(0xb3aa98,0xffc890,0,.1,.3);
    for(const sg of [-1,1]){const f=parisMesh(new THREE.BoxGeometry(244,.7,.4),orF,null,SV.b.x+SV.r.x*(a+sg*(FA+1.1)),-3.1,SV.b.z+SV.r.z*(a+sg*(FA+1.1)));f.rotation.y=yawR;}
    for(const su of [-1,1])for(const sa of [-1,1]){const u=su*112,aa=a+sa*(FA+6),x=SV.b.x+SV.n.x*u+SV.r.x*aa,z=SV.b.z+SV.n.z*u+SV.r.z*aa,g=parisGroupe(x,0,z,yawR);
      parisMesh(new THREE.BoxGeometry(7,3,7),gra,g,0,1.5,0);parisMesh(new THREE.BoxGeometry(4.4,15,4.4),gra,g,0,10.5,0);parisMesh(new THREE.BoxGeometry(5.4,1.2,5.4),gra,g,0,18.6,0);
      const cor=parisMesh(new THREE.SphereGeometry(1.6,10,8),orF,g,0,20.6,0);cor.scale.set(1,1.4,1.9);                                        // le Pégase
      for(const w of [-1,1]){const ai=parisMesh(new THREE.BoxGeometry(.25,3.4,1.6),orF,g,w*1.3,22.4,-.3);ai.rotation.z=w*.55;}             // ses ailes
      parisMesh(new THREE.SphereGeometry(.7,8,6),orF,g,0,23.4,.9);parisMesh(new THREE.BoxGeometry(.5,2.6,.5),orF,g,0,24,.2);}}                // la Renommée
   for(let k=0;k<3;k++){const bt=parisBateau();PARIS.bateaux.push({g:bt,a:-3000+k*2100+pr()*400,u:(k%2?1:-1)*(28+pr()*20),v:(k%2?1:-1)*(6+pr()*3)});}
   PARIS.bateaux.forEach(function(b){b.g.rotation.y=yawDe(SV.n.x,SV.n.z);});}
  // ===== LES MONUMENTS =====
  parisObelisque(pObel);parisFontaine(pFont);
  parisArc(Q.arc.p,Q.champs0.phi);
  {const g=parisTour(Q.tour.p.x,Q.tour.p.y,Q.tour.p.z,330,true);g.rotation.y=Q.tour.phi;PARIS.tourPos=Q.tour.p.clone();}
  parisInvalides(pInv,yInv);parisMoulin(pMR,yMR);parisSacreCoeur(Q.sc.p,Q.sc.phi);
  {const dx=Math.sin(Q.sc.phi),dz=Math.cos(Q.sc.phi);parisMesh(new THREE.CircleGeometry(80,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xb7ad98}),null,Q.sc.p.x-dx*95,parisColline(Q.sc.p.x-dx*95,Q.sc.p.z-dz*95)-.3,Q.sc.p.z-dz*95);} // le parvis, entre le portail et la basilique
  PARIS.n={immeubles:n,rues:RUES.length,ms:Math.round(performance.now()-t00),L:Math.round(L),zones:PARIS.Z.length};
}
function parisPluie(){return PARIS.sol?(PARIS.pluie||0):0;} // la BRUINE de Montmartre (lue par pluieTick et routeTick)
function parisTick(dt){ // l'HEURE avance avec les quartiers ; le décor vit (phare, scintillement, ailes du Moulin, drapeau, bateaux-mouches)
  PARIS.t+=dt;PSU.uTime.value=PARIS.t;
  const Q=PARIS.Q;if(!Q||!PARIS.sol)return;
  const sv=(started&&!gameOver)?s:0,sm=THREE.MathUtils.smoothstep,T=sm(sv,Q.t1a,Q.t1b)+sm(sv,Q.t2a,Q.t2b);
  PSU.uT.value=T;skyU.uParisT.value=T;PARIS.pluie=sm(sv,Q.t2a,Q.t2b)*.32;
  const q=T<.5?0:T<1.5?1:2;if(q!==PARIS.qBio){const d0=PARIS.qBio<0;PARIS.qBio=q;bioGo(['parisOr','parisBleu','parisNuit'][q],d0?.01:7);}
  const an=sv>Q.clichy0.s?3:sv>Q.quai0.s?2:sv>Q.champs0.s?1:0; // les QUARTIERS s'annoncent en entrant
  if(an!==PARIS.qAnn){if(PARIS.qAnn>=0&&an>PARIS.qAnn&&started&&!gameOver){const A=[null,['LES CHAMPS-ELYSEES','HEURE DOREE','#ffd27a','#ff8a3d'],['LA SEINE','HEURE BLEUE','#9fd8ff','#5b7dff'],['MONTMARTRE','LA NUIT','#ffb0d8','#b14bff']][an];
    try{slam(TR(A[0]),TR(A[1]),A[2],A[3],30,1);}catch(e){}}PARIS.qAnn=an;}
  if(Math.abs(T-(PARIS.tE==null?-9:PARIS.tE))>.003){PARIS.tE=T; // les lumières de la ville : elles ne se repeignent que si l'heure bouge
    const k3=a=>T<1?a[0]+(a[1]-a[0])*T:a[1]+(a[2]-a[1])*(T-1);
    if(PARIS.mLant){const k=k3([.4,1.15,1.4]);PARIS.mLant.color.setRGB(k,.79*k,.54*k);}
    if(PARIS.mHalo)PARIS.mHalo.uniforms.uI.value=k3([.1,.75,1]);
    if(PARIS.mFlaque)PARIS.mFlaque.opacity=k3([0,.26,.46]);
    for(const o of PARIS.matsNuit)o.m.emissive.copy(o.e).multiplyScalar(k3(o.k));}
  if(PARIS.scint)PARIS.scint.uniforms.uTime.value=PARIS.t;
  if(PARIS.phare)PARIS.phare.rotation.y=PARIS.t*.32;
  if(PARIS.ailes)PARIS.ailes.rotation.z=-PARIS.t*.9;
  const SV=Q.seine,yb=Math.atan2(-SV.n.z,SV.n.x);
  for(const b of PARIS.bateaux){b.a+=b.v*dt;if(b.a>4500)b.a=-4500;else if(b.a<-4500)b.a=4500;
    b.g.position.set(SV.b.x+SV.r.x*b.a+SV.n.x*b.u,-7.9+Math.sin(PARIS.t*1.3+b.u)*.06,SV.b.z+SV.r.z*b.a+SV.n.z*b.u);b.g.rotation.y=yb+(b.v<0?Math.PI:0);}
}
/* LA FIGURE SLIDE (2026-10-14 soir, Sacha via PILOTAGE : « quand on vient VRAIMENT de frotter contre le bord de la route, ça doit faire
   des ÉTINCELLES et rapporter de l'AURA en fonction de la VITESSE et de la DURÉE »). ⚠ Le jeu n'avait AUCUN contact avec le bord :
   le dépasser fait tomber la caisse. Le frottement, c'est donc le FLANC qui déborde de la route quand les roues tiennent encore
   (|lat| + demi-largeur > ROAD_HALF), plus serré que le RASE-BORD (80 % de la demi-route), plus les vraies façades de Paris (parisMur).
   · Tant qu'on frotte : étincelles OR au point de contact, côté bord, plus denses avec la vitesse ; l'aura MONTE (SLD.base + SLD.v × vitesse
     / vmax, par seconde) dans une petite étiquette « SLIDE +X » en haut (jamais au centre) ; la caisse perd un peu de vitesse (SLD.frein,
     la sanction : il n'y en avait pas au bord).
   · À la fin (SLD.lache s sans contact) : payée dans la CHAÎNE d'aura comme un geste (famille 'slide', brut) si on a frotté au moins
     SLD.tMin s. Explosion, replacement ou partie neuve : perdue (slideRaz).
   · Les COMBOS À TROIS sont des trios de figures d'un même VOL : un geste au sol n'y entre pas.
   · Le son : `sonSlide(etat,k)` ('debut' | 'tick' | 'fin', k = vitesse/vmax), livré par la session SON — muet tant qu'il n'existe pas.
   `?slide=0` l'éteint. Banc : dbgSlide() · dbgSlide('force',kmh) colle la caisse au bord à cette vitesse · dbgSlide('stop'). */
const SLD={on:!/[?&]slide=0\b/.test(location.search),base:20,v:120,frein:.12,tMin:.35,lache:.15,kmhMin:40,
  t:0,hors:0,aura:0,cote:1,mur:0,etiq:null,force:0,son:false,k:0};
function slideRaz(){SLD.t=0;SLD.hors=0;SLD.aura=0;SLD.mur=0;if(SLD.son){SLD.son=false;try{sonSlide('fin',0);}catch(e){}}if(SLD.etiq)SLD.etiq.style.opacity='0';}
function slideEtiq(){let e=SLD.etiq;if(!e){e=SLD.etiq=document.createElement('div');e.id='slideHud';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}return e;}
function slideTick(dt){ // boucle de conduite, chaque image, après le RASE-BORD
  if(!SLD.on)return;
  const w=CARS[level].w*.5,va=Math.abs(vA),kmh=va*3.6*SPD;
  if(SLD.force>0){lat=(Math.sign(lat)||1)*(ROAD_HALF-w+.12);vA=Math.sign(vA||1)*SLD.force/(3.6*SPD);graceT=Math.max(graceT,.2);}
  SLD.mur=Math.max(0,SLD.mur-dt);
  const bord=Math.abs(lat)+w>ROAD_HALF-.02&&Math.abs(lat)<ROAD_HALF,contact=!introD&&!PARK.on&&hopY<=.05&&kmh>SLD.kmhMin&&(bord||SLD.mur>0);
  if(contact){
    SLD.hors=0;SLD.t+=dt;SLD.cote=Math.sign(lat)||1;
    const k=SLD.k=Math.max(0,Math.min(1.3,kmh/Math.max(1,vmaxShow())));
    SLD.aura+=(SLD.base+SLD.v*k)*dt;
    if(!SLD.mur)vA*=1-SLD.frein*dt; // la sanction : le flanc frotte (les façades de Paris ont la leur)
    if(Math.random()<dt*(14+46*k)){DRIFT_V.set(SLD.cote*w,.15,(Math.random()-.5)*CARS[level].l*.6);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1+(k>.6?1:0),5+9*k);}
    try{if(!SLD.son){SLD.son=true;sonSlide('debut',k);}else sonSlide('tick',k);}catch(e){}
    if(SLD.t>=SLD.tMin){const e=slideEtiq();e.textContent='SLIDE +'+Math.round(SLD.aura);e.style.opacity='1';}
    return;}
  if(SLD.t<=0)return;
  SLD.hors+=dt;if(SLD.hors<SLD.lache)return;
  const n=Math.round(SLD.aura),ok=SLD.t>=SLD.tMin&&n>0;slideRaz();
  if(ok){try{chaineAura('SLIDE',n,'slide',true,false);}catch(e){}try{sonSlide('paye',n);}catch(e){}hap([8,20,8]);} // (SON) 'paye' : le tchak du paiement ; 'fin' (slideRaz) : la queue du crissement
}
function slideContact(){SLD.mur=.12;} // le crochet des MURS : une paroi qui touche le flanc ce tour-ci (Paris, les couloirs du CANYON…) — à rappeler à chaque image de contact
window.slideContact=slideContact;
window.dbgSlide=function(k,v){if(k==='force')SLD.force=+v||200;if(k==='stop'){SLD.force=0;lat=0;vL=0;}
  return {on:SLD.on,t:+SLD.t.toFixed(2),aura:Math.round(SLD.aura),k:+SLD.k.toFixed(2),force:SLD.force,lat:+lat.toFixed(2),bord:+ROAD_HALF.toFixed(2),kmh:Math.round(Math.abs(vA)*3.6*SPD),mode:mode,vmax:Math.round(vmaxShow()),chaine:Math.round(CHA.pts||0),auraRun:Math.round(auraRun)};};
function parisMur(dt,cause){ // LES FAÇADES SONT DES MURS : un CHOC par contact (vitesse perdue selon l'angle), puis on FROTTE (étincelles) — de face à pleine vitesse, on s'encastre
  const out=Math.sign(lat)||1,lim=ROAD_HALF-1.15;lat=out*lim;
  const into=vL*driveDir*out;if(into<=0)return;
  SLD.mur=.12; // (SLIDE) la façade frotte : la figure le sait
  const va=Math.abs(vA),a=Math.asin(Math.min(1,into/Math.max(1,va))),kmh=va*3.6*SPD,now=performance.now();
  if(a>.52&&kmh>200){impMur(out);explode(cause||'facade');return;} // (2026-10-15) L'IMPACT : la paroi est le bord de la route
  try{impMini(out,a,kmh,into);}catch(e){} // (2026-10-15 soir) L'IMPACT EN MINIATURE : le coup d'épaule, au premier contact (voir IMPM)
  /* (2026-10-17, session « Physique et gameplay fluides ») LE COUP D'ÉPAULE SANS TÉLÉPORTE : la paroi renvoyait le nez (−30 % du cap) et
     prenait jusqu'à 30 % de la vitesse en UNE image — 22° de cap d'un coup sur un choc à 17°, partout où la route a des murs (couloirs du
     canyon, bourrelets du glacier). Même renvoi, même perte : le cap y va en ~50 ms (PARIS.psiR/psiK, appliqué par la conduite juste
     après le lacet), la vitesse en ~0,2 s (vFrein). Un renvoi en cours n'est pas recalculé par les images de contact qui suivent. */
  if(!(PARIS.psiK>0)){PARIS.psiR=-psi*.3;PARIS.psiK=1;}yawR=0;slipB=0;vL=0;
  const choc=now-(PARIS.chocT||0)>220;if(choc)PARIS.chocT=now;       // (mesuré : perdre à CHAQUE image faisait tomber de 151 à 20 km/h en 3 s)
  if(choc)vFrein(1-Math.min(.3,.03+a*.9));else vA*=1-.3*(dt||.016);
  if(now-PARIS.murT>90){PARIS.murT=now;try{DRIFT_V.set(out*CARS[level].w*.5,.25,.2);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1,6);noiseBurst(.1,.1+a*.3,2600);}catch(e){}
    shake=Math.max(shake,.12+a);hap(8);}
  if(now-PARIS.murAnn>2500&&a>.12){PARIS.murAnn=now;try{popTexte(TR('FROTTE !'),'#ffb36b',0);}catch(e){}}
}
function parisHeurt(p){ // EN VOL : dans une façade ? dans la Seine ? dans le sol ? — la rue la plus proche, sa zone, la hauteur
  const Q=PARIS.Q,G=PARIS.grille;if(!Q||!G)return '';
  const SV=Q.seine,u=Math.abs((p.x-SV.b.x)*SV.n.x+(p.z-SV.b.z)*SV.n.z);
  if(u<80&&p.y<-6.6)return 'seine';
  if(Math.hypot(p.x-Q.arc.p.x,p.z-Q.arc.p.z)<42&&p.y<Q.arc.p.y+90)return 'facade';
  if(Math.hypot(p.x-Q.sc.p.x,p.z-Q.sc.p.z)<62&&p.y<Q.sc.p.y+92)return 'facade';
  const HB=PARIS.HB,bx=Math.floor(p.x/HB),bz=Math.floor(p.z/HB);let bi=-1,bd=1e18;
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=G.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++){const q=pts[a[j]],d=(q.x-p.x)*(q.x-p.x)+(q.z-p.z)*(q.z-p.z);if(d<bd){bd=d;bi=a[j];}}}
  if(bi<0)return p.y<parisColline(p.x,p.z)+26&&u>93?'facade':'';                        // loin de toute rue : les toits de Paris
  const q=pts[bi],b=B[bi],la=(p.x-q.x)*b.x+(p.z-q.z)*b.z,h=p.y-q.y,al=Math.abs(la);
  if(al<ROAD_HALF+.4)return h<-3?'sol':'';                                                // au-dessus de la chaussée : tryLand décide
  const ty=parisCote(bi/(NP-1)*L,la<0?-1:1);
  if(ty==='bati'&&al>ROAD_HALF+PARIS_SW-.4&&h<25)return 'facade';
  if((ty==='quai'||ty==='pont')&&al>ROAD_HALF+PARIS_SW+.6)return '';                    // au-dessus de l'eau : la Seine décidera
  if(h<-.6&&u>93)return 'sol';
  return '';
}
