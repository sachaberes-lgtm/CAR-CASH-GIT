// ---------- PIGEONS RAMIERS : rares traversées d'oiseaux — un peu de vie dans le ciel ----------
const PIGEONS=[];let pigeonT=12+Math.random()*14;
const pgBodyM=new THREE.MeshLambertMaterial({color:0x97a2b6});
const pgBreastM=new THREE.MeshLambertMaterial({color:0xc9a9b4});
const pgWingM=new THREE.MeshLambertMaterial({color:0x76839b,side:THREE.DoubleSide});
const pgBarM=new THREE.MeshBasicMaterial({color:0xf4f6fa,side:THREE.DoubleSide});
// (2026-09-26, passe fuites) les géométries des pigeons sont PARTAGÉES : chaque oiseau en créait 10 neuves, jamais libérées
const PG_G={body:new THREE.SphereGeometry(.5,9,7),breast:new THREE.SphereGeometry(.24,8,6),head:new THREE.SphereGeometry(.16,8,6),nk:new THREE.SphereGeometry(.06,6,5),
  tail:new THREE.BoxGeometry(.26,.04,.5),wing:new THREE.PlaneGeometry(1.0,.42),bar:new THREE.PlaneGeometry(.9,.11)};
function mkPigeon(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(PG_G.body,pgBodyM);
  body.scale.set(.52,.46,1.15);g.add(body);
  const breast=new THREE.Mesh(PG_G.breast,pgBreastM); // poitrail rosé
  breast.position.set(0,-.06,.3);g.add(breast);
  const head=new THREE.Mesh(PG_G.head,pgBodyM);
  head.position.set(0,.18,.56);g.add(head);
  for(const sd of [-1,1]){ // tache blanche du cou — la signature du ramier
    const nk=new THREE.Mesh(PG_G.nk,pgBarM);
    nk.position.set(sd*.12,.14,.44);g.add(nk);
  }
  const tail=new THREE.Mesh(PG_G.tail,pgWingM);
  tail.position.set(0,.02,-.66);g.add(tail);
  for(const sd of [-1,1]){ // ailes battantes avec barre alaire blanche
    const wg=new THREE.Group();wg.position.set(sd*.16,.1,.06);
    const wing=new THREE.Mesh(PG_G.wing,pgWingM);
    wing.rotation.x=-Math.PI/2;wing.position.x=sd*.5;wg.add(wing);
    const bar=new THREE.Mesh(PG_G.bar,pgBarM);
    bar.rotation.x=-Math.PI/2;bar.position.set(sd*.5,.01,.02);wg.add(bar);
    g.add(wg);
    if(sd<0)g.userData.wl=wg;else g.userData.wr=wg;
  }
  g.scale.setScalar(1.7);
  return g;
}
function spawnPigeonFlock(){
  const n=2+Math.floor(Math.random()*4);
  const fwd9=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);
  const sd9=Math.random()<.5?-1:1;
  const base=new THREE.Vector3().copy(carGroup.position).addScaledVector(fwd9,150+Math.random()*160);
  base.x+=sd9*(60+Math.random()*90);base.y+=22+Math.random()*46;
  const dir9=new THREE.Vector3(-sd9*(.7+Math.random()*.5),(Math.random()-.35)*.12,(Math.random()-.5)*.7).normalize();
  const sp9=9+Math.random()*5;
  for(let k=0;k<n;k++){
    const p=mkPigeon();
    p.position.copy(base).addScaledVector(dir9,-k*3.4);
    p.position.x+=(Math.random()-.5)*5;p.position.y+=(Math.random()-.5)*3+k*.7;p.position.z+=(Math.random()-.5)*5;
    p.lookAt(new THREE.Vector3().copy(p.position).add(dir9));
    scene.add(p);
    PIGEONS.push({g:p,v:dir9.clone().multiplyScalar(sp9*(.9+Math.random()*.2)),ph:Math.random()*6,ph2:Math.random()*6,life:26});
  }
}
/* (2026-09-30, revue PISTE) PAS DE PIGEON EN ORBITE NI DANS L'ORAGE : une volée de ramiers passait devant la Terre vue du vide (les deux
   niveaux ESPACE) ou en plein déluge sous les éclairs. Là, pas d'apparition — et la volée d'avant le portail s'efface. */
const PGBAN={c:undefined,v:false}; // mémo par niveau : le test ne se refait qu'au portail
function pigeonsInterdits(){const c=LVL.cur;if(c===PGBAN.c)return PGBAN.v;PGBAN.c=c;
  return PGBAN.v=!!c&&(c.id==='espace'||c.id==='orage'||!!c.orage||/orage|tempete/i.test(String(c.bio&&c.bio[0]||'')));} // (la campagne : le niveau 9 « orage doré », le 15 « orage »)
function updatePigeons(dt,t){
  pigeonT-=dt;
  const ban9=pigeonsInterdits();
  if(pigeonT<=0&&PIGEONS.length===0&&mode!=='boom'&&!(LVL.cur&&(LVL.cur.id==='paris'||LVL.cur.id==='jade'))){if(!ban9)spawnPigeonFlock();pigeonT=24+Math.random()*32;} // RARE, exprès
  for(let i9=PIGEONS.length-1;i9>=0;i9--){
    const b9=PIGEONS[i9];b9.life-=dt;if(ban9)b9.life=0; // (la volée n'a rien à faire là : elle s'en va avec le portail)
    b9.g.position.addScaledVector(b9.v,dt);
    b9.g.position.y+=Math.sin(t*1.2+b9.ph)*.5*dt;
    const amp=.25+.6*Math.max(0,Math.sin(t*.8+b9.ph2)); // battements… puis vol plané
    const w9=Math.sin(t*10+b9.ph)*amp;
    b9.g.userData.wl.rotation.z=w9;
    b9.g.userData.wr.rotation.z=-w9;
    if(b9.life<=0){scene.remove(b9.g);PIGEONS.splice(i9,1);}
  }
}
/* LES PIGEONS DE PARIS (2026-09-28, Léo : « des pigeons ») — des bandes de BISETS posées sur la route, qui picorent… et s'envolent
   en éventail quand la caisse arrive (le seuil s'allonge avec la vitesse : à 600 km/h ils décollent ~110 m avant, sinon on ne
   les verrait jamais partir) ; et des volées qui traversent le ciel. Deux InstancedMesh (le corps fusionné, couleurs par sommet ·
   les ailes) : 2 appels de rendu pour toute la volée, zéro allocation par image. Les ramiers des autres niveaux se taisent à Paris. */
const PGP=(function(){
  const N=IS_MOBILE?40:64;
  const fus=function(parts){const P=[],Nm=[],C=[],c9=new THREE.Color(),m9=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler();
    for(const q of parts){const g=q[0].clone();m9.compose(new THREE.Vector3(q[2][0],q[2][1],q[2][2]),q9.setFromEuler(e9.set(q[4]||0,0,0)),new THREE.Vector3(q[1][0],q[1][1],q[1][2]));
      g.applyMatrix4(m9);const h=g.index?g.toNonIndexed():g;P.push(...h.attributes.position.array);Nm.push(...h.attributes.normal.array);c9.setHex(q[3]);
      for(let i=0;i<h.attributes.position.count;i++)C.push(c9.r,c9.g,c9.b);if(h!==g)h.dispose();g.dispose();}
    const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));
    o.setAttribute('color',new THREE.Float32BufferAttribute(C,3));return o;};
  const bx=new THREE.BoxGeometry(1,1,1),pl=new THREE.PlaneGeometry(1,1),H=-Math.PI/2;
  const corps=fus([[PG_G.body,[.52,.46,1.15],[0,0,0],0x8d97a9],[PG_G.breast,[1,1,1],[0,-.06,.3],0x9a86a8],   // le gris-bleu du biset, le poitrail violine
    [PG_G.breast,[.82,.82,.8],[0,.09,.44],0x5d9c89],[PG_G.head,[1,1,1],[0,.2,.58],0x7c879a],                     // le cou VERT irisé
    [bx,[.05,.05,.15],[0,.17,.77],0x2b2a2e],[PG_G.nk,[.6,.6,.6],[.1,.25,.66],0xe8742a],[PG_G.nk,[.6,.6,.6],[-.1,.25,.66],0xe8742a], // le bec, l'œil orange
    [PG_G.tail,[1,1,1],[0,.02,-.66],0x4a5367],[bx,[.05,.2,.05],[.09,-.3,.06],0xd25e68],[bx,[.05,.2,.05],[-.09,-.3,.06],0xd25e68]]); // la queue, les pattes roses
  const aile=fus([[pl,[1,.42,1],[.5,0,0],0x7f8a9e,H],[pl,[.9,.07,1],[.5,.004,-.03],0x2c3140,H],[pl,[.9,.07,1],[.5,.004,.09],0x2c3140,H],[pl,[.3,.42,1],[.86,.006,0],0x3d4456,H]]); // 2 barres noires, la rémige
  const imB=new THREE.InstancedMesh(corps,new THREE.MeshLambertMaterial({vertexColors:true}),N);
  const imW=new THREE.InstancedMesh(aile,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),N*2);
  const Z=new THREE.Matrix4().makeScale(0,0,0);
  for(let i=0;i<N;i++){imB.setMatrixAt(i,Z);imW.setMatrixAt(i*2,Z);imW.setMatrixAt(i*2+1,Z);}
  for(const m of [imB,imW]){m.frustumCulled=false;m.visible=false;scene.add(m);}
  return {N,imB,imW,Z,st:new Int8Array(N),p:new Float32Array(N*3),v:new Float32Array(N*3),u:new Float32Array(N*3),f:new Float32Array(N*3),
    ph:new Float32Array(N),age:new Float32Array(N),sc:new Float32Array(N),next:240,ciel:6,cp:new THREE.Vector3(),vc:0,cpOk:false,frT:0,n:0,
    F:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
    mB:new THREE.Matrix4(),mO:new THREE.Matrix4(),mW:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YZX'),
    vx:new THREE.Vector3(),vy:new THREE.Vector3(),vz:new THREE.Vector3(),o:new THREE.Vector3(),k:new THREE.Vector3(),one:new THREE.Vector3(1,1,1)};
})();
function pgLibre(){for(let i=0;i<PGP.N;i++)if(!PGP.st[i])return i;return -1;}
function pgPose(i,st,x,y,z,ux,uy,uz,fx,fy,fz,sc){const P=PGP,j=i*3;P.st[i]=st;P.p[j]=x;P.p[j+1]=y;P.p[j+2]=z;P.u[j]=ux;P.u[j+1]=uy;P.u[j+2]=uz;
  P.f[j]=fx;P.f[j+1]=fy;P.f[j+2]=fz;P.v[j]=P.v[j+1]=P.v[j+2]=0;P.ph[i]=Math.random()*6.3;P.age[i]=0;P.sc[i]=sc;P.n++;}
function pgpReset(){const P=PGP;P.st.fill(0);P.n=0;P.next=240;P.ciel=4+Math.random()*4;P.cpOk=false;
  for(let i=0;i<P.N;i++){P.imB.setMatrixAt(i,P.Z);P.imW.setMatrixAt(i*2,P.Z);P.imW.setMatrixAt(i*2+1,P.Z);}
  P.imB.instanceMatrix.needsUpdate=P.imW.instanceMatrix.needsUpdate=true;P.imB.visible=P.imW.visible=false;}
function pgBande(sB){ // une BANDE posée sur la face où roule la caisse : 4-9 bisets autour d'un point, chacun son cap
  const P=PGP,F9=P.F;frameAt(sB,F9);const sg=side<0?-1:1;F9.n.multiplyScalar(sg);F9.b.multiplyScalar(sg);
  const n=4+Math.floor(Math.random()*6),lc=(Math.random()*2-1)*ROAD_HALF*.55,sc=1.25;
  for(let k=0;k<n;k++){const i=pgLibre();if(i<0)return;
    const ds=(Math.random()-.5)*10,la=lc+(Math.random()-.5)*8,a=Math.random()*6.283,ca=Math.cos(a),sa=Math.sin(a),h=(sg<0?THICK:0)+.36*sc;
    pgPose(i,1,F9.p.x+F9.t.x*ds+F9.b.x*la+F9.n.x*h,F9.p.y+F9.t.y*ds+F9.b.y*la+F9.n.y*h,F9.p.z+F9.t.z*ds+F9.b.z*la+F9.n.z*h,
      F9.n.x,F9.n.y,F9.n.z,F9.t.x*ca+F9.b.x*sa,F9.t.y*ca+F9.b.y*sa,F9.t.z*ca+F9.b.z*sa,sc);}
}
function pgCiel(){ // une VOLÉE qui traverse devant la caisse
  const P=PGP,c=carGroup.position,fw=P.k.set(0,0,1).applyQuaternion(carGroup.quaternion);fw.y=0;if(fw.lengthSq()<1e-4)fw.set(0,0,1);fw.normalize();
  const sd=Math.random()<.5?-1:1,rx=-fw.z*sd,rz=fw.x*sd,d=150+Math.random()*170,o=50+Math.random()*80,hy=16+Math.random()*40;
  const dx=-rx*(.8+Math.random()*.4)+fw.x*(Math.random()-.5)*.8,dz=-rz*(.8+Math.random()*.4)+fw.z*(Math.random()-.5)*.8,dl=Math.hypot(dx,dz)||1,sp=11+Math.random()*5;
  const n=5+Math.floor(Math.random()*6);
  for(let k=0;k<n;k++){const i=pgLibre();if(i<0)return;const j=i*3,bk=k*2.6;
    pgPose(i,3,c.x+fw.x*d+rx*o-dx/dl*bk+(Math.random()-.5)*6,c.y+hy+(Math.random()-.5)*4+k*.5,c.z+fw.z*d+rz*o-dz/dl*bk+(Math.random()-.5)*6,0,1,0,dx/dl,0,dz/dl,1.6);
    P.v[j]=dx/dl*sp;P.v[j+1]=(Math.random()-.4)*1.2;P.v[j+2]=dz/dl*sp;}
}
function pgFrrr(k){ // l'ENVOL : 6-8 claquements d'ailes en rafale (bruit filtré), dosé par la proximité
  if(!sfxOk()||k<.05)return;
  try{const t0=AC.currentTime,src=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();
    src.buffer=noiseBuf(.7);bp.type='bandpass';bp.frequency.value=1250+Math.random()*500;bp.Q.value=.8;g.gain.setValueAtTime(.0001,t0);
    const n=6+Math.floor(Math.random()*3);
    for(let i=0;i<n;i++){const ti=t0+i*.064+Math.random()*.01;g.gain.setValueAtTime(.0001,ti);g.gain.linearRampToValueAtTime(.08*k*(1-i/n*.6),ti+.008);g.gain.exponentialRampToValueAtTime(.0001,ti+.05);}
    src.connect(bp);bp.connect(g);g.connect(MASTER);src.start(t0);src.stop(t0+.7);}catch(e){}
}
function pgpTick(dt,t){
  const P=PGP,paris=!!(LVL.cur&&LVL.cur.id==='paris')&&!PARK.on; // (le NIVEAU, pas le fondu : LVL.paris traîne 4 s dans le niveau suivant)
  if(!paris&&!P.n){if(P.imB.visible)P.imB.visible=P.imW.visible=false;return;}
  const c=carGroup.position;
  if(P.cpOk&&dt>1e-4){const v9=P.cp.distanceTo(c)/dt;if(v9<420)P.vc+=(v9-P.vc)*Math.min(1,dt*6);}P.cp.copy(c);P.cpOk=true;
  if(paris&&started&&!gameOver&&mode!=='boom'){
    if(P.next<s)P.next=s+260;
    if(s+280>P.next&&P.next<L-60){pgBande(P.next);P.next+=380+Math.random()*520;}
    P.ciel-=dt;if(P.ciel<=0){pgCiel();P.ciel=7+Math.random()*7;}}
  const trig=35+P.vc*.55,tr2=trig*trig;let frr=0;
  const X=P.vx,Y=P.vy,Zv=P.vz;
  for(let i=0;i<P.N;i++){const st=P.st[i];if(!st)continue;const j=i*3;P.age[i]+=dt;
    let px=P.p[j],py=P.p[j+1],pz=P.p[j+2];const ex=px-c.x,ey=py-c.y,ez=pz-c.z,d2=ex*ex+ey*ey+ez*ez;
    if(d2>650*650&&P.age[i]>1||st===2&&P.age[i]>7||st===3&&P.age[i]>28){P.st[i]=0;P.n--;P.imB.setMatrixAt(i,P.Z);P.imW.setMatrixAt(i*2,P.Z);P.imW.setMatrixAt(i*2+1,P.Z);continue;}
    let pk=0,w=0,fold=0;
    if(st===1){ // AU SOL : ils picorent… jusqu'à ce que la caisse arrive
      pk=Math.pow(Math.max(0,Math.sin(t*5.2+P.ph[i]*3)),6)*.55;fold=1.4;
      if(d2<tr2&&mode!=='boom'){P.st[i]=2;P.age[i]=0;const ux=P.u[j],uy=P.u[j+1],uz=P.u[j+2],du=ex*ux+ey*uy+ez*uz;
        let ax=ex-ux*du,ay=ey-uy*du,az=ez-uz*du;const al=Math.hypot(ax,ay,az)||1;ax/=al;ay/=al;az/=al;
        const up=7+Math.random()*6,aw=5+Math.random()*7,fr=(Math.random()-.3)*7;
        P.v[j]=ux*up+ax*aw+P.f[j]*fr;P.v[j+1]=uy*up+ay*aw+P.f[j+1]*fr;P.v[j+2]=uz*up+az*aw+P.f[j+2]*fr;
        frr=Math.max(frr,1-Math.sqrt(d2)/(trig+40));}}
    else{ // EN L'AIR
      if(st===2){const lift=10*Math.exp(-P.age[i]*.8);P.v[j]+=P.u[j]*lift*dt;P.v[j+1]+=(P.u[j+1]*lift+2.5)*dt;P.v[j+2]+=P.u[j+2]*lift*dt;w=Math.sin(t*27+P.ph[i])*1.05;}
      else{P.v[j+1]+=Math.sin(t*1.2+P.ph[i])*.5*dt;const amp=.25+.6*Math.max(0,Math.sin(t*.8+P.ph[i]*2));w=Math.sin(t*10+P.ph[i])*amp;}
      px+=P.v[j]*dt;py+=P.v[j+1]*dt;pz+=P.v[j+2]*dt;P.p[j]=px;P.p[j+1]=py;P.p[j+2]=pz;
      const vl=Math.hypot(P.v[j],P.v[j+1],P.v[j+2]);if(vl>.5){P.f[j]=P.v[j]/vl;P.f[j+1]=P.v[j+1]/vl;P.f[j+2]=P.v[j+2]/vl;}}
    // le repère de l'oiseau : cap f, haut u (orthogonalisé), le picorage bascule le nez
    Zv.set(P.f[j],P.f[j+1],P.f[j+2]);Y.set(P.u[j],P.u[j+1],P.u[j+2]);if(st===3)Y.set(0,1,0);
    Y.addScaledVector(Zv,-Y.dot(Zv));if(Y.lengthSq()<1e-6)Y.set(0,1,0).addScaledVector(Zv,-Zv.y);Y.normalize();
    if(pk){const cp=Math.cos(pk),sp=Math.sin(pk);P.o.copy(Zv).multiplyScalar(cp).addScaledVector(Y,-sp);Y.multiplyScalar(cp).addScaledVector(Zv,sp);Zv.copy(P.o);}
    X.crossVectors(Y,Zv).normalize();
    const sc=P.sc[i];P.mB.makeBasis(X,Y,Zv);P.mB.scale(P.k.set(sc,sc,sc));P.mB.setPosition(px,py,pz);P.imB.setMatrixAt(i,P.mB);
    for(let sd=-1;sd<=1;sd+=2){P.e.set(0,fold*sd,w*sd,'YZX');P.q.setFromEuler(P.e);
      P.mO.compose(P.o.set(sd*.16,.1,.06),P.q,P.k.set(sd*(fold?.72:1),1,fold?.72:1));P.mW.multiplyMatrices(P.mB,P.mO);P.imW.setMatrixAt(i*2+(sd>0?1:0),P.mW);}
  }
  if(frr>0&&t-P.frT>.35){P.frT=t;pgFrrr(frr);}
  P.imB.instanceMatrix.needsUpdate=P.imW.instanceMatrix.needsUpdate=true;P.imB.visible=P.imW.visible=P.n>0;
}
