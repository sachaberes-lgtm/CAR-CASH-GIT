/* (2026-11-05, Sacha : « on enlève le taureau ») LE TAUREAU N'EST PLUS : sa matière d'or, sa forme, sa collision et ses crochets de banc sont retirés. */
function cryptoMats(){ // les petites matières, une fois
  const M=CRYPTO.mat;if(M.ballon)return M;
  M.ballon=new THREE.MeshPhongMaterial({color:0xf3f5f9,specular:0xffffff,shininess:60,emissive:0x1a1a20});
  M.or=new THREE.MeshPhongMaterial({color:0xffc63a,specular:0xfff3c0,shininess:100,emissive:0x4a3000});
  M.diam=new THREE.MeshPhongMaterial({color:0x8fefff,specular:0xffffff,shininess:140,emissive:0x1c4a7a,flatShading:true});
  M.fusee=new THREE.MeshPhongMaterial({color:0xf6f6f8,specular:0xffffff,shininess:70,emissive:0x141418});
  M.fuseeR=new THREE.MeshPhongMaterial({color:0xff3a3a,specular:0xffd0d0,shininess:60,emissive:0x300404});
  M.flamme=new THREE.SpriteMaterial({map:lampTex,color:new THREE.Color(3,1.5,.5),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const k in M)if(M[k]&&M[k].isMaterial)M[k].dispose=function(){};
  return M;
}
/* ---- LES GÉOMÉTRIES PARTAGÉES (une fois) ---- */
const CRYPTO_G={};
function cryptoGeos(){
  if(CRYPTO_G.cube)return CRYPTO_G;
  CRYPTO_G.cube=new THREE.BoxGeometry(1,1,1);
  {const g=plaGeoPiece(40,.16);g.rotateX(Math.PI/2);CRYPTO_G.piece=g;} // la pièce ₿ géante : celle de la pluie, plus ronde, DEBOUT (ses faces regardent ±z ; elle tourne sur la verticale)
  {const g=new THREE.OctahedronGeometry(1,0);g.scale(1,1.45,1);CRYPTO_G.diam=g;}
  {const g=new THREE.SphereGeometry(1,24,14);g.scale(16,16,60);CRYPTO_G.ballon=g;}
  CRYPTO_G.plan=new THREE.PlaneGeometry(1,1);
  {const g=new THREE.CylinderGeometry(1,1,1,12);CRYPTO_G.cyl=g;const c=new THREE.ConeGeometry(1,1,12);CRYPTO_G.cone=c;}
  for(const k in CRYPTO_G)CRYPTO_G[k].dispose=function(){};
  return CRYPTO_G;
}
// LE BANDEAU DU COURS (dirigeables) : une bande LED qui défile — la police du jeu, les ▲ dessinés
function cryptoTickerTex(){
  if(CRYPTO.mat.tick)return CRYPTO.mat.tick;
  const W=2048,H=96,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#020604';x.fillRect(0,0,W,H);x.fillStyle='rgba(61,255,154,.08)';for(let i=0;i<W;i+=4)x.fillRect(i,0,1,H);
  const L9=[['BTC','$1 000 000','+420 %'],['ETH','$69 000','+69 %'],['CASH','$161 000','+161 %'],['DOGE','$4,20','+1 000 %'],['SOL','$9 000','+88 %'],['MOON','',''],['HODL','','']];
  x.textBaseline='middle';x.font='34px "Press Start 2P",monospace';let px=20;
  for(const l of L9){x.fillStyle='#ffd75e';x.fillText(l[0],px,H/2);px+=x.measureText(l[0]).width+22;
    if(l[1]){x.fillStyle='#ffffff';x.fillText(l[1],px,H/2);px+=x.measureText(l[1]).width+22;}
    if(l[2]){x.fillStyle='#3dff9a';x.beginPath();x.moveTo(px,H/2+14);x.lineTo(px+16,H/2-16);x.lineTo(px+32,H/2+14);x.fill();px+=44;x.fillText(l[2],px,H/2);px+=x.measureText(l[2]).width;}
    px+=70;if(px>W-200)break;}
  const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.NearestFilter;t.anisotropy=4;
  texLibere(t); // (2026-10-14, passe perf mobile) 2048 × 96 : 0,8 Mo (le défilement = `offset`, la toile n'est jamais repeinte)
  CRYPTO.mat.tick=t;CRYPTO.mat.ecran=new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(1.5,1.5,1.5)});CRYPTO.mat.ecran.dispose=function(){};return t;
}
/* LES CONSTRUCTIONS DU NIVEAU — après les tours (buildVoxCity) : tout dans le groupe de la ville (il part avec la piste) */
function cryptoBatit(root){
  const S=CRYPTO.sites;if(!S)return;CRYPTO.root=root;const M=cryptoMats(),G=cryptoGeos(),M4=CRYPTO.m4,c=CRYPTO.c;cryptoInit();
  if(S.pieces.length){const im=new THREE.InstancedMesh(G.piece,cryptoMatPiece(),S.pieces.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;root.add(im);CRYPTO.pieces=im;CRYPTO.jeter.push(im);
    for(const p of S.pieces)CRYPTO.pInfo.push(p);}
  if(S.diam.length){const im=new THREE.InstancedMesh(G.diam,M.diam,S.diam.length);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;root.add(im);CRYPTO.diam=im;CRYPTO.jeter.push(im);
    for(const d of S.diam)CRYPTO.dInfo.push(d);}
  if(S.dirig.length){cryptoTickerTex();
    for(const d of S.dirig){const g=new THREE.Group();g.position.set(d.x,d.y,d.z);g.rotation.y=d.cap;
      g.add(new THREE.Mesh(G.ballon,M.ballon));
      for(const a of [0,1,2,3]){const f=new THREE.Mesh(G.cube,M.or);const s9=a<2?(a?1:-1):0,u9=a>=2?(a===2?1:-1):0;f.position.set(s9*12,u9*12,-52);f.scale.set(s9?16:1.6,u9?16:1.6,18);g.add(f);} // les ailerons d'or
      const go=new THREE.Mesh(G.cube,M.or);go.position.set(0,-17,6);go.scale.set(8,5,22);g.add(go); // la nacelle
      for(const s of [-1,1]){const e=new THREE.Mesh(G.plan,CRYPTO.mat.ecran);e.position.set(s*16.4,1,2);e.rotation.y=s*Math.PI/2;e.scale.set(56,9,1);g.add(e);} // les écrans du cours
      root.add(g);CRYPTO.dirig.push({g:g,y:d.y,ph:d.ph});}}
  CRYPTO.ath.t=22;CRYPTO.fusT=3;CRYPTO.feuT=2;
  crhBatit(); /* (2026-10-21) l'horizon du bull run et les projecteurs de la nuit : voir cryptocity-embellie */
}
function cryptoMatPiece(){
  if(CRYPTO.mat.piece)return CRYPTO.mat.piece;
  const m=new THREE.MeshPhongMaterial({map:plaTexPieces(),color:0xffffff,specular:0xffe7a8,shininess:90,emissive:0x2c1a04});
  m.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv.y=vUv.y*.5+.5;\n#endif');}; // la moitié ₿ de l'atlas des pièces
  m.customProgramCacheKey=function(){return 'pieceGeante1';};m.dispose=function(){};
  CRYPTO.mat.piece=m;return m;
}
/* ---- LES OBJETS DU CIEL (une fois pour toute la session : la lune ₿, trois fusées, les feux d'artifice) ---- */
function cryptoInit(){
  if(CRYPTO.lune)return;const M=cryptoMats(),G=cryptoGeos();
  // LA LUNE ₿ : la face de la pièce, qui tourne lentement, posée à l'endroit de la lune du dôme
  {const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d'),src=plaTexPieces().image;
    const g=x.createRadialGradient(256,256,150,256,256,256);g.addColorStop(0,'rgba(255,214,120,.55)');g.addColorStop(.62,'rgba(255,190,90,.18)');g.addColorStop(1,'rgba(255,180,80,0)');
    x.fillStyle=g;x.fillRect(0,0,512,512);x.save();x.beginPath();x.arc(256,256,158,0,6.283);x.clip();x.drawImage(src,8,2,240,240,98,98,316,316);x.restore();
    const t=texLibere(new THREE.CanvasTexture(cv));t.anisotropy=4; // (2026-10-14, passe perf mobile) 512² : 1 Mo
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false,color:new THREE.Color(1.25,1.18,1.05)}));
    s.renderOrder=24;s.frustumCulled=false;s.visible=false;scene.add(s);CRYPTO.lune=s;}
  // LES FUSÉES « TO THE MOON » : le corps blanc, la coiffe et les ailerons rouges, la flamme, et un sillage de fumée (ruban de 56 points)
  for(let k=0;k<3;k++){const g=new THREE.Group();
    const b=new THREE.Mesh(G.cyl,M.fusee);b.scale.set(2.2,17,2.2);g.add(b);
    const n=new THREE.Mesh(G.cone,M.fuseeR);n.scale.set(2.2,7,2.2);n.position.y=12;g.add(n);
    for(let a=0;a<3;a++){const f=new THREE.Mesh(G.cube,M.fuseeR);const r=a/3*6.283;f.position.set(Math.cos(r)*2.6,-7,Math.sin(r)*2.6);f.rotation.y=-r;f.scale.set(3.4,6,.5);g.add(f);}
    const fl=new THREE.Sprite(M.flamme);fl.position.y=-12;fl.scale.set(9,16,1);g.add(fl);
    g.scale.setScalar(1.5);g.visible=false;scene.add(g);
    const NT=56,pos=new Float32Array(NT*2*3),al=new Float32Array(NT*2),sd9=new Float32Array(NT*2),idx=[];for(let i=0;i<NT*2;i++)sd9[i]=i%2;for(let i=0;i<NT-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));tg.setAttribute('aA',new THREE.BufferAttribute(al,1).setUsage(THREE.DynamicDrawUsage));tg.setAttribute('aS',new THREE.BufferAttribute(sd9,1));tg.setIndex(idx);
    const tm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,vertexShader:'attribute float aA,aS;varying float vA;varying float vS;void main(){vA=aA;vS=aS;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying float vA;varying float vS;void main(){float e=1.-pow(abs(vS*2.-1.),2.);gl_FragColor=vec4(vec3(1.,.98,.95),vA*e*.62);}'});
    const tr=new THREE.Mesh(tg,tm);tr.frustumCulled=false;tr.visible=false;tr.renderOrder=8;scene.add(tr);
    CRYPTO.fus.push({g:g,fl:fl,tr:tr,pos:pos,al:al,NT:NT,hist:[],on:false,t:0,p:new THREE.Vector3(),v:new THREE.Vector3(),dT:0});}
  // LES FEUX D'ARTIFICE : dix gerbes de 120 étoiles, calculées par la puce (l'origine et l'heure de chaque gerbe en uniforms)
  {const K=10,NP9=120,n=K*NP9,aB=new Float32Array(n),aD=new Float32Array(n*3),aR=new Float32Array(n),po=new Float32Array(n*3);
    for(let i=0;i<n;i++){aB[i]=Math.floor(i/NP9);let x,y,z,l;do{x=Math.random()*2-1;y=Math.random()*2-1;z=Math.random()*2-1;l=x*x+y*y+z*z;}while(l>1||l<.05);l=Math.sqrt(l);
      const r=.82+Math.random()*.18;aD[i*3]=x/l*r;aD[i*3+1]=y/l*r;aD[i*3+2]=z/l*r;aR[i]=Math.random();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(po,3));g.setAttribute('aB',new THREE.BufferAttribute(aB,1));g.setAttribute('aD',new THREE.BufferAttribute(aD,3));g.setAttribute('aR',new THREE.BufferAttribute(aR,1));
    const uO=[],uC=[];for(let k=0;k<K;k++){uO.push(new THREE.Vector4(0,0,0,-99));uC.push(new THREE.Vector3(1,1,1));}
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
      uniforms:{uO:{value:uO},uC:{value:uC},uT:{value:0},uPx:{value:600}},
      vertexShader:'uniform vec4 uO['+K+'];uniform vec3 uC['+K+'];uniform float uT,uPx;attribute float aB,aR;attribute vec3 aD;varying vec3 vC;varying float vA;'+
        'void main(){int b=int(aB+.5);vec4 o=uO[b];float t=uT-o.w;if(t<0.||t>2.8){gl_Position=vec4(0.,0.,2.,1.);gl_PointSize=0.;vA=0.;return;}'+
        'float v=(150.+120.*aR)*(1.-exp(-t*2.6))/2.6;vec3 p=o.xyz+aD*v+vec3(0.,-4.2*t*t,0.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;'+
        'float k=1.-t/2.8;vA=k*k*(.6+.4*sin(uT*31.+aR*40.))*smoothstep(0.,.08,t);vC=mix(uC[b],vec3(1.,.95,.8),step(.86,aR))*3.2;gl_PointSize=max(1.5,(7.+6.*aR)*k*uPx/max(1.,-mv.z));}',
      fragmentShader:'varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=dot(d,d);if(r>.25)discard;gl_FragColor=vec4(vC*vA*(1.-r*3.2),1.);}'});
    const p=new THREE.Points(g,m);p.frustumCulled=false;p.visible=false;p.renderOrder=9;p.userData.K=K;p.userData.k=0;scene.add(p);CRYPTO.feux=p;}
}
function cryptoFeu(x,y,z){const F=CRYPTO.feux;if(!F)return;const U=F.material.uniforms,k=F.userData.k=(F.userData.k+1)%F.userData.K;
  U.uO.value[k].set(x,y,z,U.uT.value);const C=[[.2,1,.5],[1,.8,.25],[1,.95,.85],[1,.55,.12],[.45,1,.85]][(Math.random()*5)|0];U.uC.value[k].set(C[0],C[1],C[2]);
  F.visible=true;}
function cryptoFeuDevant(){ // une gerbe au-dessus de la ville, DEVANT la caméra (300-800 m), dans le ciel
  const v=CRYPTO.v1;camera.getWorldDirection(v);v.y=Math.max(.05,v.y*.4+.12);v.normalize();const d=300+Math.random()*500,s=CRYPTO.v2.set(-v.z,0,v.x).normalize().multiplyScalar((Math.random()-.5)*d*.9);
  cryptoFeu(camera.position.x+v.x*d+s.x,camera.position.y+v.y*d+60+Math.random()*160,camera.position.z+v.z*d+s.z);}
function cryptoFusee(){ // une fusée part d'un toit DEVANT la caméra (300-1 400 m) et file vers la lune ₿
  const f=CRYPTO.fus.find(function(q){return !q.on;}),T9=CRYPTO.toits;if(!f||T9.length<3)return;
  const v=CRYPTO.v1;camera.getWorldDirection(v);v.y=0;v.normalize();
  for(let e=0;e<24;e++){const i=((Math.random()*T9.length/3)|0)*3,dx=T9[i]-camera.position.x,dz=T9[i+2]-camera.position.z,d=Math.hypot(dx,dz);
    if(d<300||d>1400||(dx*v.x+dz*v.z)/d<.45)continue;
    f.on=true;f.t=0;f.p.set(T9[i],T9[i+1]+12,T9[i+2]);f.v.set(0,14,0);f.hist.length=0;f.dT=0;f.g.visible=true;f.tr.visible=true;f.g.position.copy(f.p);
    for(let j=0;j<f.NT*2;j++)f.al[j]=0;f.tr.geometry.attributes.aA.needsUpdate=true;return;}}
function cryptoFuseeTick(f,dt){
  f.t+=dt;const k=Math.min(1,f.t/5),dir=CRYPTO.v2.set(0,1,0).lerp(MOON_DIR,k*.85).normalize();
  f.v.addScaledVector(dir,(16+f.t*7)*dt);f.p.addScaledVector(f.v,dt);f.g.position.copy(f.p);
  CRYPTO.q.setFromUnitVectors(CRYPTO.ax,CRYPTO.v3.copy(f.v).normalize());f.g.quaternion.copy(CRYPTO.q);
  f.fl.scale.set(9+Math.random()*2,15+Math.random()*7,1);
  f.dT-=dt;if(f.dT<=0){f.dT=.11;f.hist.unshift(f.p.x,f.p.y,f.p.z,f.t);if(f.hist.length>f.NT*4)f.hist.length=f.NT*4;}
  const H=f.hist,n=H.length/4,cam=camera.position,P=f.pos,A=f.al,vw=CRYPTO.v3,sd=CRYPTO.s;
  for(let i=0;i<f.NT;i++){const j=Math.min(n-1,i);if(n<2){A[i*2]=A[i*2+1]=0;continue;}
    const a=j*4,b=Math.min(n-1,j+1)*4,age=f.t-H[a+3],w=3+age*5.5;
    sd.set(H[a]-H[b],H[a+1]-H[b+1],H[a+2]-H[b+2]);vw.set(H[a]-cam.x,H[a+1]-cam.y,H[a+2]-cam.z);sd.cross(vw).normalize().multiplyScalar(w);
    P[i*6]=H[a]+sd.x;P[i*6+1]=H[a+1]+sd.y;P[i*6+2]=H[a+2]+sd.z;P[i*6+3]=H[a]-sd.x;P[i*6+4]=H[a+1]-sd.y;P[i*6+5]=H[a+2]-sd.z;
    const al=i<n-1?Math.max(0,1-age/6.5)*Math.min(1,i/2)*(f.t>12?Math.max(0,1-(f.t-12)/2):1):0;A[i*2]=A[i*2+1]=al;}
  f.tr.geometry.attributes.position.needsUpdate=true;f.tr.geometry.attributes.aA.needsUpdate=true;
  if(f.t>14.5){f.on=false;f.g.visible=false;f.tr.visible=false;}
}
function cryptoAth(){ // LE NOUVEL ATH : le cours grimpe, la pluie redouble, le ciel tire ses feux
  const A=CRYPTO.ath;A.n++;A.prix=Math.round(A.prix*(1.18+Math.random()*.22)/100)*100;
  const pr=A.prix>=1e6?(A.prix/1e6).toFixed(A.prix>=1e7?1:2).replace('.',',')+' M':Math.round(A.prix/1000)+' K';
  try{slam(TR('NOUVEL ATH !'),'BTC $ '+pr,'#3dff9a','#ffd75e',30,1,true);}catch(e){}
  plaSurge(6);for(let i=0;i<5;i++)setTimeout(cryptoFeuDevant,i*260);
  try{if(SONV2)sfx('argent.palier');}catch(e){}
}
function cryptoTick(dt,sim){
  const on=cryptoOn()&&!!CRYPTO.root;
  if(!on){crhTick(0,false);if(CRYPTO.lune&&(CRYPTO.lune.visible||CRYPTO.feux.visible)){CRYPTO.lune.visible=false;CRYPTO.feux.visible=false; /* (2026-10-18, DEBUGGING : les gerbes du NOUVEL ATH partent en setTimeout jusqu'à 1 s après lui — un ATH juste avant le portail rallumait les FEUX dans la map suivante, où la lune est déjà cachée : ils restaient dans la scène toute la map, un appel de dessin de 1 200 points. Mesuré : ATH à 60 m du portail → feux visibles sur toute la MER DE NUAGES suivante) */for(const f of CRYPTO.fus){f.on=false;f.g.visible=f.tr.visible=false;}}return;}
  const d=sim?dt:0,cam=camera.position;CRYPTO.uT.value+=d;const t=CRYPTO.uT.value;CRYPTO.uSun.value.copy(SUN_DIR);CRYPTO.uNuit.value=LVL.nuit||0;
  // la lune ₿
  {const L9=CRYPTO.lune;L9.visible=true;L9.position.copy(cam).addScaledVector(MOON_DIR,5200);L9.scale.setScalar(5200*.16);L9.material.rotation=Math.sin(t*.25)*.12;}
  // les pièces géantes : elles tournent, elles flottent ; la traverser en vol = JACKPOT
  if(CRYPTO.pieces){const im=CRYPTO.pieces,M4=CRYPTO.m4,q=CRYPTO.q,s=CRYPTO.s,pp=CRYPTO.v1,cp=carGroup.position;
    for(let k=0;k<CRYPTO.pInfo.length;k++){const p=CRYPTO.pInfo[k];p.a+=p.w*d;q.setFromAxisAngle(CRYPTO.ax,p.a);pp.set(p.x,p.y+Math.sin(t*.7+p.ph)*4,p.z);s.setScalar(p.r);M4.compose(pp,q,s);im.setMatrixAt(k,M4);
      if(p.cd>0)p.cd-=d;else if(sim&&mode==='fall'&&cp.distanceToSquared(pp)<p.r*p.r*.8){p.cd=8;cryptoJackpot(pp);}}
    im.instanceMatrix.needsUpdate=true;}
  if(CRYPTO.diam){const im=CRYPTO.diam,M4=CRYPTO.m4,q=CRYPTO.q,s=CRYPTO.s,pp=CRYPTO.v1;
    for(let k=0;k<CRYPTO.dInfo.length;k++){const p=CRYPTO.dInfo[k];p.a+=p.w*d;q.setFromAxisAngle(CRYPTO.ax,p.a);pp.set(p.x,p.y+Math.sin(t*.9+p.ph)*3,p.z);s.setScalar(p.r);M4.compose(pp,q,s);im.setMatrixAt(k,M4);}
    im.instanceMatrix.needsUpdate=true;}
  for(const b of CRYPTO.dirig){b.g.position.y=b.y+Math.sin(t*.4+b.ph)*3;b.g.rotation.z=Math.sin(t*.3+b.ph)*.03;}
  if(CRYPTO.mat.tick)CRYPTO.mat.tick.offset.x=(t*.045)%1;
  crhTick(t,true);
  // fusées, feux, ATH
  for(const f of CRYPTO.fus)if(f.on&&d>0)cryptoFuseeTick(f,d);
  if(CRYPTO.feux){const U=CRYPTO.feux.material.uniforms;U.uT.value+=d;U.uPx.value=(renderer.domElement.height||600)*.5*camera.projectionMatrix.elements[5];}
  if(sim&&started&&!gameOver){
    const DZ9=CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz:null; // (2026-10-20, LE DÉCOR AU HASARD) la cadence des fusées et des feux tirée
    CRYPTO.fusT-=d*(DZ9?DZ9.fus:1);if(CRYPTO.fusT<=0){CRYPTO.fusT=5+Math.random()*5;cryptoFusee();}
    CRYPTO.feuT-=d*(DZ9?DZ9.feu:1);if(CRYPTO.feuT<=0){CRYPTO.feuT=1.6+Math.random()*2.6;cryptoFeuDevant();}
    CRYPTO.ath.t-=d;if(CRYPTO.ath.t<=0&&mode!=='boom'){CRYPTO.ath.t=32+Math.random()*14;cryptoAth();}}
}
function cryptoJackpot(p){ // traverser une pièce ₿ géante en vol
  try{chaineAura('JACKPOT',160);}catch(e){}
  try{popTexte(TR('JACKPOT !'),'#ffd75e',2);}catch(e){}
  plaSurge(3.5);try{cryptoFeu(p.x,p.y+20,p.z);}catch(e){}
  try{if(SONV2)sfx('argent.palier');}catch(e){}
}
function cryptoChauffe(){ // au menu (chauffeDivers) : chaque matière de CRYPTOCITY compilée et dessinée une fois hors écran — 0 programme en course
  const G=cryptoGeos(),M=cryptoMats();cryptoInit();plaInit();
  const L9=[],add=function(o){o.position.copy(camera.position);camera.getWorldDirection(CRYPTO.v1);o.position.addScaledVector(CRYPTO.v1,30);scene.add(o);L9.push(o);};
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatTours(),1);im.setMatrixAt(0,CRYPTO.m4.identity());im.setColorAt(0,CRYPTO.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(G.cube,cryptoMatToursLoin(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.plan,cryptoMatPub(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.piece,cryptoMatPiece(),1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  {const im=new THREE.InstancedMesh(G.diam,M.diam,1);im.setMatrixAt(0,CRYPTO.m4.identity());add(im);}
  for(const k of ['ballon','or','fusee','fuseeR'])add(new THREE.Mesh(G.cube,M[k]));
  cryptoTickerTex();add(new THREE.Mesh(G.plan,CRYPTO.mat.ecran));crhChauffe(add);
  for(const o of [CRYPTO.lune,CRYPTO.feux,PLA.mB,PLA.mP])if(o){o.visible=true;L9.push(o);}
  for(const f of CRYPTO.fus){f.g.visible=f.tr.visible=true;L9.push(f.g,f.tr);}
  try{chauffeRendu(L9);}catch(e){}
  for(const o of L9){if(o===CRYPTO.lune||o===CRYPTO.feux||o===PLA.mB||o===PLA.mP||CRYPTO.fus.some(function(f){return f.g===o||f.tr===o;}))o.visible=false;else scene.remove(o);}
}
window.dbgCrypto=function(k,v){ // console : l'état de CRYPTOCITY · ('ath') un ATH tout de suite · ('feu') une gerbe · ('fusee') une fusée · ('pluie',s) une averse
  if(k==='ath'){cryptoAth();return CRYPTO.ath;}if(k==='feu'){cryptoFeuDevant();return 'gerbe';}if(k==='fusee'){cryptoFusee();return CRYPTO.fus.map(function(f){return f.on;});}
  if(k==='pluie'){plaSurge(v||6);return PLA.dens;}
  if(k==='sansPluie'){PLA.off=!PLA.off;return PLA.off;}
  if(k==='photo'){if(started&&!gameOver&&!paused)togglePause();if(acesPass)acesPass.uniforms.uSpeed.value=0;camera.position.fromArray(v.p);camera.lookAt(v.c[0],v.c[1],v.c[2]);if(v.fov){camera.fov=v.fov;camera.updateProjectionMatrix();}camera.updateMatrixWorld(); // (banc) MODE PHOTO libre : la caméra en p, qui regarde c
    try{plaTick(0,false);cryptoTick(0,false);}catch(e){}if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'photo';}
  if(k==='cam'){const d=camera.getWorldDirection(new THREE.Vector3());return {p:camera.position.toArray().map(Math.round),d:d.toArray().map(function(x){return +x.toFixed(3);}),car:carGroup.position.toArray().map(Math.round)};}
  if(k==='masque'){const T9={pla:[PLA.mB,PLA.mP],lune:[CRYPTO.lune],feux:[CRYPTO.feux],pieces:[CRYPTO.pieces],diam:[CRYPTO.diam],ville:[CITY.root]};
    for(const o of (T9[v]||[]))if(o)o.visible=!o.visible;if(v==='fam')for(const F of CITY.fam||[]){F.im.visible=!F.im.visible;F.imL.visible=!F.imL.visible;}
    if(POST_ON&&composer)composer.render();return v;}
  if(k==='progs')return renderer.info.programs.filter(function(p){return p.diagnostics&&!p.diagnostics.runnable;}).map(function(p){return [p.cacheKey.slice(0,60),JSON.stringify(p.diagnostics).slice(0,400)];});
  if(k==='pla')return {mB:!!PLA.mB,vis:PLA.mB&&PLA.mB.visible,dens:PLA.dens,u:PLA.u&&{d:PLA.u.uDens9.value,t:PLA.u.uT9.value,c:PLA.u.uC9.value.toArray().map(Math.round)},prog:renderer.info.programs.filter(function(p){return /plaBillet1|plaPiece1/.test(p.cacheKey||'');}).map(function(p){return [p.cacheKey.slice(0,40),p.diagnostics?JSON.stringify(p.diagnostics).slice(0,600):'ok'];}),
    pix:PLA.texB?Array.from(PLA.texB.image.getContext('2d').getImageData(256,128,1,1).data):null,pixP:PLA.texP?Array.from(PLA.texP.image.getContext('2d').getImageData(128,122,1,1).data):null,inst:PLA.mB.geometry.instanceCount,max:PLA.mB.geometry._maxInstanceCount};
  if(k==='sites'){const S=CRYPTO.sites;return S?{pieces:S.pieces.map(function(p){return [Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.r)];}),dirig:S.dirig.map(function(d){return [Math.round(d.x),Math.round(d.y),Math.round(d.z)];})}:null;}
  const S=CRYPTO.sites;return {on:cryptoOn(),ville:!!CITY.root,deco:CITY.dz&&CITY.dz.genre==='crypto'?CITY.deco:null,pieces:CRYPTO.pInfo.length,diamants:CRYPTO.dInfo.length,
    dirigeables:CRYPTO.dirig.length,toits:CRYPTO.toits.length/3,reserve:CRYPTO.res.length/3,fusees:CRYPTO.fus.filter(function(f){return f.on;}).length,
    ath:{dans:+CRYPTO.ath.t.toFixed(1),n:CRYPTO.ath.n,prix:CRYPTO.ath.prix},pluie:{dens:+PLA.dens.toFixed(2),surge:+PLA.surge.toFixed(1),n:PLA.N,np:PLA.NP},ville9:CITY.n};};
